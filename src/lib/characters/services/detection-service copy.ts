/**
 * @fileoverview キャラクター検出サービス
 * @description
 * コンテンツ内のキャラクター検出と抽出を担当するサービス。
 * 文脈を考慮した検出アルゴリズムにより、キャラクターの登場を高精度で検出します。
 */
import { IDetectionService } from '../core/interfaces';
import { Character } from '../core/types';
import { DETECTION_PATTERNS } from '../core/constants';
import { ICharacterRepository } from '../core/interfaces';
import { characterRepository } from '../repositories/character-repository';
import { logger } from '@/lib/utils/logger';
import { NotFoundError } from '../core/errors';
import { eventBus } from '../events/character-event-bus';
import { EVENT_TYPES } from '../core/constants';

export class DetectionService implements IDetectionService {
  private repository: ICharacterRepository;
  
  /**
   * コンストラクタ
   * @param repository キャラクターリポジトリ
   */
  constructor(repository: ICharacterRepository = characterRepository) {
    this.repository = repository;
    logger.info('DetectionService: 初期化完了');
  }

  /**
   * コンテンツ内のキャラクター検出
   * 文脈を考慮した高度なアルゴリズムでキャラクターの登場を検出します
   * 
   * @param content 検索対象のコンテンツ
   * @returns 検出されたキャラクターの配列
   */
  async detectCharactersInContent(content: string): Promise<Character[]> {
    try {
      logger.debug('コンテンツからキャラクターを検出します');
      
      const detectedCharacters: Character[] = [];
      const detectedIds = new Set<string>();

      // 文脈追跡用の変数
      let lastMentionedCharacter: Character | null = null;
      let paragraphs = content.split('\n\n');

      // 全キャラクターをロード
      const allCharacters = await this.repository.getAllCharacters();
      
      // 各段落ごとの処理
      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        const detectedInParagraph = new Set<string>();

        // 1. 直接名前での検出
        for (const character of allCharacters) {
          // メイン名の検索
          if (character.name.length >= 2 && paragraph.includes(character.name)) {
            if (this.verifyCharacterNameContext(character.name, paragraph)) {
              detectedInParagraph.add(character.id);
              if (!detectedIds.has(character.id)) {
                detectedCharacters.push(character);
                detectedIds.add(character.id);
              }
              lastMentionedCharacter = character; // 最後に言及されたキャラクターを更新
            }
          }

          // ショートネームの検索
          if (character.shortNames && character.shortNames.length > 0) {
            for (const shortName of character.shortNames) {
              if (shortName.length >= 2 && paragraph.includes(shortName)) {
                if (this.verifyCharacterNameContext(shortName, paragraph)) {
                  detectedInParagraph.add(character.id);
                  if (!detectedIds.has(character.id)) {
                    detectedCharacters.push(character);
                    detectedIds.add(character.id);
                  }
                  lastMentionedCharacter = character;
                  break;
                }
              }
            }
          }

          // 2. 敬称・役職付きの検出
          if (character.nicknames) {
            // キャラクター固有の呼称辞書がある場合
            for (const [speakerKey, nicknames] of Object.entries(character.nicknames)) {
              for (const nickname of nicknames) {
                if (nickname.length >= 2 && paragraph.includes(nickname)) {
                  if (this.verifyCharacterNameContext(nickname, paragraph)) {
                    detectedInParagraph.add(character.id);
                    if (!detectedIds.has(character.id)) {
                      detectedCharacters.push(character);
                      detectedIds.add(character.id);
                    }
                    lastMentionedCharacter = character;
                    break;
                  }
                }
              }
            }
          }

          // 役職名での検出（「先生」など）
          if (character.role) {
            const titlePatterns = [
              '先生', '教授', '博士', '師匠', '社長', '部長', '課長',
              '隊長', '艦長', '船長', '店長', '主任', '議長', '会長'
            ];

            for (const title of titlePatterns) {
              // 役職と一致し、かつその役職が単体で言及されている場合
              if (character.role.includes(title) &&
                  (new RegExp(`${title}[はがもをにと]`, 'g')).test(paragraph)) {
                // 同じ段落で他のキャラクターが既に検出されていない場合に限定
                if (detectedInParagraph.size === 0 || detectedInParagraph.has(character.id)) {
                  if (!detectedIds.has(character.id)) {
                    detectedCharacters.push(character);
                    detectedIds.add(character.id);
                  }
                  lastMentionedCharacter = character;
                }
              }
            }
          }
        }

        // 3. 代名詞の検出と解決
        if (this.detectPronouns(paragraph) && lastMentionedCharacter) {
          if (!detectedInParagraph.has(lastMentionedCharacter.id) && 
              !detectedIds.has(lastMentionedCharacter.id)) {
            detectedCharacters.push(lastMentionedCharacter);
            detectedIds.add(lastMentionedCharacter.id);
          }
        }
      }

      // イベント発行: キャラクター検出
      if (detectedCharacters.length > 0) {
        eventBus.publish(EVENT_TYPES.CHARACTER_ANALYZED, {
          timestamp: new Date(),
          detectedCharacters: detectedCharacters.map(c => ({ id: c.id, name: c.name })),
          contentSummary: content.length > 100 ? content.substring(0, 100) + '...' : content
        });
      }

      logger.info(`${detectedCharacters.length}人のキャラクターを検出しました`);
      return detectedCharacters;
    } catch (error) {
      logger.error('コンテンツからのキャラクター検出に失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * キャラクターの台詞抽出
   * コンテンツからキャラクターの発言を抽出します
   * 
   * @param character キャラクター
   * @param content 抽出対象のコンテンツ
   * @returns 抽出された台詞の配列
   */
  async extractCharacterDialog(character: Character, content: string): Promise<string[]> {
    try {
      logger.debug(`キャラクター「${character.name}」の台詞を抽出します`);
      
      const dialogs: string[] = [];
      
      // 1. 「キャラクター名: 台詞」パターンの検出
      const nameColonPattern = new RegExp(`${character.name}[：:]([^"」「]+)`, 'g');
      const nameColonMatches = Array.from(content.matchAll(nameColonPattern));
      
      for (const match of nameColonMatches) {
        if (match[1] && match[1].trim()) {
          dialogs.push(match[1].trim());
        }
      }
      
      // 2. 「キャラクター名は「台詞」と言った」パターンの検出
      const saidPattern = new RegExp(
        `${character.name}[はがも][、　 ]*[「"](.*?)[」"](?:と|を)(?:言|話|述)`,
        'g'
      );
      const saidMatches = Array.from(content.matchAll(saidPattern));
      
      for (const match of saidMatches) {
        if (match[1] && match[1].trim()) {
          dialogs.push(match[1].trim());
        }
      }
      
      // 3. ショートネームでの検出
      if (character.shortNames) {
        for (const shortName of character.shortNames) {
          // ショートネームでのパターン検出
          const shortNamePattern = new RegExp(
            `${shortName}[はがも][、　 ]*[「"](.*?)[」"](?:と|を)(?:言|話|述)`,
            'g'
          );
          const shortMatches = Array.from(content.matchAll(shortNamePattern));
          
          for (const match of shortMatches) {
            if (match[1] && match[1].trim()) {
              dialogs.push(match[1].trim());
            }
          }
        }
      }
      
      // 4. 呼称・敬称での検出
      if (character.nicknames) {
        for (const [_, nicknames] of Object.entries(character.nicknames)) {
          for (const nickname of nicknames) {
            // 呼称でのパターン検出
            const nicknamePattern = new RegExp(
              `${nickname}[はがも][、　 ]*[「"](.*?)[」"](?:と|を)(?:言|話|述)`,
              'g'
            );
            const nickMatches = Array.from(content.matchAll(nicknamePattern));
            
            for (const match of nickMatches) {
              if (match[1] && match[1].trim()) {
                dialogs.push(match[1].trim());
              }
            }
          }
        }
      }
      
      // 重複除去して返却
      return [...new Set(dialogs)];
    } catch (error) {
      logger.error(`キャラクター「${character.name}」の台詞抽出に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * キャラクターへの言及検出
   * コンテンツからキャラクターへの言及を検出します
   * 
   * @param character キャラクター
   * @param content 検出対象のコンテンツ
   * @returns 言及テキストの配列
   */
  async detectCharacterMentions(character: Character, content: string): Promise<string[]> {
    try {
      logger.debug(`キャラクター「${character.name}」への言及を検出します`);
      
      const mentions: string[] = [];
      const paragraphs = content.split('\n\n');
      
      // 各段落をチェック
      for (const paragraph of paragraphs) {
        // 1. 名前による言及チェック
        if (this.verifyCharacterMention(character.name, paragraph)) {
          mentions.push(paragraph);
          continue;
        }
        
        // 2. ショートネームによる言及チェック
        if (character.shortNames) {
          let found = false;
          for (const shortName of character.shortNames) {
            if (this.verifyCharacterMention(shortName, paragraph)) {
              mentions.push(paragraph);
              found = true;
              break;
            }
          }
          if (found) continue;
        }
        
        // 3. 呼称・敬称による言及チェック
        if (character.nicknames) {
          let found = false;
          for (const [_, nicknames] of Object.entries(character.nicknames)) {
            for (const nickname of nicknames) {
              if (this.verifyCharacterMention(nickname, paragraph)) {
                mentions.push(paragraph);
                found = true;
                break;
              }
            }
            if (found) break;
          }
        }
      }
      
      return mentions;
    } catch (error) {
      logger.error(`キャラクター「${character.name}」への言及検出に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * キャラクター登場確認
   * キャラクターがコンテンツに登場しているかどうかを確認します
   * 
   * @param characterId キャラクターID
   * @param content 確認対象のコンテンツ
   * @returns 登場しているかどうか
   */
  async verifyCharacterAppearance(characterId: string, content: string): Promise<boolean> {
    try {
      const character = await this.repository.getCharacterById(characterId);
      if (!character) {
        throw new NotFoundError('Character', characterId);
      }
      
      // 各検出方法を試行
      const detectedCharacters = await this.detectCharactersInContent(content);
      return detectedCharacters.some(c => c.id === characterId);
    } catch (error) {
      logger.error(`キャラクター「${characterId}」の登場確認に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * コンテンツ内のインタラクション検出
   * キャラクター間のインタラクションを検出します
   * 
   * @param content 検出対象のコンテンツ
   * @returns 検出されたインタラクション情報
   */
  async detectInteractions(content: string): Promise<any[]> {
    try {
      logger.debug('コンテンツからキャラクター間のインタラクションを検出します');
      
      const interactions: any[] = [];
      const detectedCharacters = await this.detectCharactersInContent(content);
      
      if (detectedCharacters.length < 2) {
        logger.debug('インタラクション検出: 検出されたキャラクターが2人未満です');
        return [];
      }
      
      const paragraphs = content.split('\n\n');
      
      // 各段落をチェック
      for (const paragraph of paragraphs) {
        // インタラクションのある段落を特定
        const interactionCharacters: Character[] = [];
        
        for (const character of detectedCharacters) {
          const namePresent = 
            paragraph.includes(character.name) || 
            (character.shortNames && character.shortNames.some(name => paragraph.includes(name)));
          
          if (namePresent) {
            interactionCharacters.push(character);
          }
        }
        
        // 2人以上のキャラクターが言及されている場合
        if (interactionCharacters.length >= 2) {
          // 会話パターンを検出
          const dialogPattern = DETECTION_PATTERNS.DIALOG_GENERAL;
          const dialogMatches = Array.from(paragraph.matchAll(dialogPattern));
          
          if (dialogMatches.length > 0) {
            // 会話インタラクション
            interactions.push({
              type: 'CONVERSATION',
              characters: interactionCharacters.map(c => ({ id: c.id, name: c.name })),
              content: paragraph,
              hasDialog: true
            });
          } else {
            // 行動インタラクション
            const actionPattern = DETECTION_PATTERNS.ACTION;
            const actionMatches = Array.from(paragraph.matchAll(actionPattern));
            
            if (actionMatches.length > 0) {
              interactions.push({
                type: 'ACTION',
                characters: interactionCharacters.map(c => ({ id: c.id, name: c.name })),
                content: paragraph,
                actions: actionMatches.map(match => match[0])
              });
            } else {
              // 一般的なインタラクション
              interactions.push({
                type: 'GENERAL',
                characters: interactionCharacters.map(c => ({ id: c.id, name: c.name })),
                content: paragraph
              });
            }
          }
        }
      }
      
      logger.info(`${interactions.length}件のインタラクションを検出しました`);
      return interactions;
    } catch (error) {
      logger.error('インタラクション検出に失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * キャラクター登場の文脈確認
   * 名前が単なる一致ではなく、キャラクターとして扱われているか確認します
   * 
   * @private
   * @param name キャラクター名
   * @param content コンテンツ
   * @returns 確認結果
   */
  private verifyCharacterNameContext(name: string, content: string): boolean {
    // 単なる部分一致ではなく、キャラクターとして扱われているか確認
    const characterPatterns = [
      new RegExp(`${name}[はがもをにとへのよりから]`), // より多くの助詞に対応
      new RegExp(`「${name}」`),                     // 発言者として
      new RegExp(`「${name}([さんくんちゃんたん様殿先生]|先輩|教授|博士)」`), // 敬称付き発言
      new RegExp(`${name}([さんくんちゃんたん様殿])`),  // 敬称付き
      new RegExp(`${name}(先生|先輩|教授|博士)`),      // 役職付き
      new RegExp(`${name}という`),                   // 説明文脈
      new RegExp(`${name}([はがもをにとへ]).*[。、」]`), // 文中での言及
      new RegExp(`[、。」].*${name}`),               // 句読点後のキャラクター名
    ];
  
    return characterPatterns.some(pattern => pattern.test(content));
  }

  /**
   * キャラクターへの言及確認
   * 名前が文章中で言及されているか確認します
   * 
   * @private
   * @param name キャラクター名
   * @param content コンテンツ
   * @returns 確認結果
   */
  private verifyCharacterMention(name: string, content: string): boolean {
    // 言及パターンをチェック
    const mentionPatterns = [
      new RegExp(`${name}[はがのともへに]`),    // 主要な助詞での言及
      new RegExp(`${name}について`),           // 「について」での言及
      new RegExp(`${name}のこと`),             // 「のこと」での言及
      new RegExp(`${name}という`),             // 「という」での言及
      new RegExp(`${name}と[いわ]う`),         // 「と言う」での言及
      new RegExp(`${name}(さん|君|ちゃん|たん|様|殿)`), // 敬称付きでの言及
    ];

    return mentionPatterns.some(pattern => pattern.test(content));
  }

  /**
   * 代名詞の検出
   * 段落内に代名詞が含まれているかを検出します
   * 
   * @private
   * @param paragraph 段落テキスト
   * @returns 代名詞が含まれているかどうか
   */
  private detectPronouns(paragraph: string): boolean {
    const pronounPatterns = [
      /彼[はがもをにと]/g,
      /彼女[はがもをにと]/g,
      /あの人[はがもをにと]/g,
      /あの方[はがもをにと]/g,
      /あいつ[はがもをにと]/g,
      /この人[はがもをにと]/g
    ];
    
    return pronounPatterns.some(pattern => pattern.test(paragraph));
  }
}

// シングルトンインスタンスをエクスポート
export const detectionService = new DetectionService();