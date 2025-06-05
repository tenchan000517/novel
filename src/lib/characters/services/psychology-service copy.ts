/**
 * @fileoverview キャラクター心理サービス
 * @description
 * キャラクターの心理分析を担当するサービス。
 * キャラクターの心理状態や他キャラクターとの心理的関係性を分析します。
 */
import { IPsychologyService } from '../core/interfaces';
import { Character, CharacterPsychology, RelationshipAttitude } from '../core/types';
import { ICharacterRepository } from '../core/interfaces';
import { characterRepository } from '../repositories/character-repository';
import { logger } from '@/lib/utils/logger';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { eventBus } from '../events/character-event-bus';
import { EVENT_TYPES } from '../core/constants';

export class PsychologyService implements IPsychologyService {
  private repository: ICharacterRepository;
  private geminiClient: GeminiClient;
  private psychologyCache: Map<string, {
    psychology: CharacterPsychology;
    timestamp: number;
    chapter: number;
  }> = new Map();
  private readonly CACHE_TTL = 3600000; // 1時間キャッシュ有効
  
  /**
   * コンストラクタ
   * @param repository キャラクターリポジトリ
   * @param geminiClient Gemini APIクライアント
   */
  constructor(
    repository: ICharacterRepository = characterRepository,
    geminiClient: GeminiClient = new GeminiClient()
  ) {
    this.repository = repository;
    this.geminiClient = geminiClient;
    logger.info('PsychologyService: 初期化完了');
  }

  /**
   * キャラクター心理分析
   * キャラクターの心理状態を分析します
   * 
   * @param character キャラクター
   * @param recentEvents 最近のイベント配列
   * @returns キャラクター心理情報
   */
  async analyzeCharacterPsychology(character: Character, recentEvents: any[]): Promise<CharacterPsychology> {
    try {
      logger.info(`キャラクター「${character.name}」の心理分析を開始します`, {
        characterId: character.id,
        eventsCount: recentEvents.length
      });
      
      // キャッシュチェック
      const cachedEntry = this.psychologyCache.get(character.id);
      if (cachedEntry && Date.now() - cachedEntry.timestamp < this.CACHE_TTL) {
        logger.debug(`キャラクター「${character.name}」の心理分析: キャッシュを使用します`);
        return cachedEntry.psychology;
      }
      
      // 既存の心理状態を取得（増分更新のため）
      const existingPsychology = character.psychology;
      
      // 分析用のプロンプト構築
      const prompt = this.buildPsychologyAnalysisPrompt(character, recentEvents, existingPsychology);
      
      // APIスロットラーを使用して制御されたリクエストを実行
      const response = await apiThrottler.throttledRequest(() => 
        this.geminiClient.generateText(prompt, {
          temperature: 0.2, // 一貫性重視の低温設定
          targetLength: 800,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );
      
      // レスポンスのパース
      const psychology = this.parsePsychologyResponse(response, existingPsychology);
      
      // キャッシュに追加
      this.psychologyCache.set(character.id, {
        psychology: psychology,
        timestamp: Date.now(),
        chapter: character.state.lastAppearance || 0
      });
      
      // イベント発行: 心理分析完了
      eventBus.publish(EVENT_TYPES.CHARACTER_ANALYZED, {
        timestamp: new Date(),
        characterId: character.id,
        characterName: character.name,
        analysisType: 'psychology'
      });
      
      logger.info(`キャラクター「${character.name}」の心理分析が完了しました`);
      return psychology;
    } catch (error) {
      logger.error(`キャラクター「${character.name}」の心理分析に失敗しました`, {
        characterId: character.id,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // エラー時はデフォルト値または既存の値を返す
      return this.createDefaultPsychology(character, character.psychology);
    }
  }

  /**
   * 関係性心理分析
   * キャラクター間の心理的態度を分析します
   * 
   * @param characters キャラクター配列
   * @returns キャラクター間の心理的態度マップ
   */
  async analyzeRelationshipPsychology(characters: Character[]): Promise<Map<string, Map<string, RelationshipAttitude>>> {
    if (characters.length <= 1) {
      return new Map();
    }
    
    try {
      const relationshipMatrix = new Map<string, Map<string, RelationshipAttitude>>();
      logger.info(`${characters.length}人のキャラクター間の関係性分析を開始します`);
      
      // キャラクターペアごとに逐次処理（APIスロットリング適用）
      for (let i = 0; i < characters.length; i++) {
        const char1 = characters[i];
        const relationshipsForChar = new Map<string, RelationshipAttitude>();
        
        for (let j = 0; j < characters.length; j++) {
          if (i === j) continue;  // 自分自身との関係はスキップ
          
          const char2 = characters[j];
          logger.debug(`関係性分析: ${char1.name} -> ${char2.name}`);
          
          // 既存の関係性情報を取得
          const existingRelationship = char1.relationships?.find(r => r.targetId === char2.id);
          
          // プロンプト構築
          const prompt = this.buildRelationshipAnalysisPrompt(char1, char2, existingRelationship);
          
          try {
            // APIスロットラーを使用して制御されたリクエスト実行
            const response = await apiThrottler.throttledRequest(() => 
              this.geminiClient.generateText(prompt, {
                temperature: 0.3,
                targetLength: 300,
                purpose: 'analysis',
                responseFormat: 'json'
              })
            );
            
            // レスポンスのパース
            const attitude = this.parseRelationshipResponse(response);
            relationshipsForChar.set(char2.id, attitude);
            
            logger.debug(`関係性分析完了: ${char1.name} -> ${char2.name}`, {
              attitude: attitude.attitude,
              intensity: attitude.intensity
            });
          } catch (pairError) {
            logger.warn(`関係性分析中にエラー発生: ${char1.name} -> ${char2.name}`, {
              error: pairError instanceof Error ? pairError.message : String(pairError)
            });
            // エラー時はデフォルト関係を設定
            relationshipsForChar.set(char2.id, {
              attitude: '中立',
              intensity: 0.5,
              isDynamic: false,
              recentChange: ''
            });
          }
          
          // API制限を考慮した短い待機
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        relationshipMatrix.set(char1.id, relationshipsForChar);
      }
      
      // イベント発行: 関係性分析完了
      eventBus.publish(EVENT_TYPES.RELATIONSHIP_ANALYZED, {
        timestamp: new Date(),
        characterCount: characters.length,
        characterIds: characters.map(c => c.id)
      });
      
      logger.info(`${characters.length}人のキャラクター間の関係性分析が完了しました`);
      return relationshipMatrix;
    } catch (error) {
      logger.error('関係性心理分析に失敗しました', {
        error: error instanceof Error ? error.message : String(error),
        charactersCount: characters.length
      });
      return new Map();
    }
  }

  /**
   * 行動予測
   * キャラクターの行動を予測します
   * 
   * @param character キャラクター
   * @param psychology 心理情報
   * @param situations 状況配列
   * @returns 予測される行動情報
   */
  async predictBehaviors(character: Character, psychology: CharacterPsychology, situations: string[]): Promise<any> {
    try {
      logger.info(`キャラクター「${character.name}」の行動予測を開始します`);
      
      // 欲求と恐れに基づいて各状況での行動を予測
      const predictions: {[situation: string]: string} = {};
      
      // 各状況を処理
      for (const situation of situations) {
        // 状況におけるドミナントな感情を推定
        const isFearfulSituation = psychology.currentFears.some(fear => 
          situation.toLowerCase().includes(fear.toLowerCase())
        );
        
        const isDesirableSituation = psychology.currentDesires.some(desire => 
          situation.toLowerCase().includes(desire.toLowerCase())
        );
        
        if (isFearfulSituation) {
          // 恐れに関連する状況
          const highEnergy = this.hasHighEnergyEmotion(psychology.emotionalState);
          
          if (highEnergy) {
            predictions[situation] = character.type === 'MAIN' ? 
              '直面して克服しようとする' : '状況から距離を置こうとする';
          } else {
            predictions[situation] = '問題から回避したり、引きこもったりする';
          }
        } else if (isDesirableSituation) {
          // 欲求に関連する状況
          predictions[situation] = '機会を活用し、積極的に行動する';
        } else {
          // 中立的な状況
          if (this.isPositiveEmotionDominant(psychology.emotionalState)) {
            predictions[situation] = '協力的に対応し、前向きな解決策を模索する';
          } else {
            predictions[situation] = '慎重に状況を観察し、リスクを最小化しようとする';
          }
        }
      }
      
      logger.info(`キャラクター「${character.name}」の行動予測が完了しました`);
      return predictions;
    } catch (error) {
      logger.error(`キャラクター「${character.name}」の行動予測に失敗しました`, {
        characterId: character.id,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // エラー時は空のオブジェクトを返す
      return {};
    }
  }

  /**
   * 感情変化のシミュレーション
   * イベントによるキャラクターの感情変化をシミュレーションします
   * 
   * @param characterId キャラクターID
   * @param event イベント情報
   * @returns 感情変化予測
   */
  async simulateEmotionalResponse(characterId: string, event: any): Promise<any> {
    try {
      // キャラクターを取得
      const character = await this.repository.getCharacterById(characterId);
      if (!character) {
        throw new Error(`Character ${characterId} not found`);
      }

      // イベントに関連するキーワードを抽出
      const keywords = this.extractKeywords(event.description || '');
      
      // 性格特性との関連をチェック
      const traits = character.personality?.traits || [];
      const traitFactors = this.getTraitEmotionalFactors(traits);
      
      // 恐れや欲求との関連をチェック
      const fearFactors = this.getFearDesireFactors(
        character.psychology?.currentFears || [],
        character.psychology?.currentDesires || [],
        keywords
      );
      
      // 基本感情変化を計算
      const emotionalResponses: {[emotion: string]: number} = {};
      
      // 標準的な感情セット
      const baseEmotions = ['喜び', '悲しみ', '怒り', '恐れ', '驚き', '信頼', '嫌悪', '期待'];
      
      // 各感情のベース値を設定
      for (const emotion of baseEmotions) {
        emotionalResponses[emotion] = 0.1; // 低いベースライン
      }
      
      // キーワードに基づく感情強度調整
      this.adjustEmotionsBasedOnKeywords(emotionalResponses, keywords);
      
      // 性格特性による補正
      this.adjustEmotionsBasedOnTraits(emotionalResponses, traitFactors);
      
      // 恐れ・欲求による補正
      this.adjustEmotionsBasedOnFearDesire(emotionalResponses, fearFactors);
      
      // 最も強い感情を特定
      let dominantEmotion = '';
      let highestValue = 0;
      
      for (const [emotion, value] of Object.entries(emotionalResponses)) {
        if (value > highestValue) {
          highestValue = value;
          dominantEmotion = emotion;
        }
      }
      
      // 結果のまとめ
      const result = {
        characterId,
        eventDescription: event.description || '',
        dominantEmotion,
        emotionalResponses,
        explanation: this.generateEmotionalExplanation(dominantEmotion, traits, event.description)
      };
      
      logger.info(`キャラクター「${character?.name}」の感情応答シミュレーションが完了しました`);
      return result;
    } catch (error) {
      logger.error(`感情応答シミュレーションに失敗しました: キャラクターID ${characterId}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return {
        characterId,
        eventDescription: event.description || '',
        dominantEmotion: '中立',
        emotionalResponses: { '中立': 0.5 },
        explanation: 'シミュレーションに失敗しました'
      };
    }
  }

  /**
   * 心理分析プロンプトの構築
   * @private
   */
  private buildPsychologyAnalysisPrompt(
    character: Character, 
    recentEvents: any[], 
    existingPsychology?: CharacterPsychology
  ): string {
    let personalityTraits = character.personality?.traits?.join(', ') || '';
    let backstory = character.backstory?.summary || '';
    
    // 最近のイベントのフォーマット
    let recentEventsText = recentEvents.map(evt => 
      `・チャプター${evt.chapter || '?'}: ${evt.event || evt.description || '出来事'}`
    ).join('\n');
    
    if (!recentEventsText) {
      recentEventsText = '特筆すべき最近のイベントはありません。';
    }
    
    // 既存の心理情報があれば含める
    let existingPsychologyText = '';
    if (existingPsychology) {
      existingPsychologyText = `
現在の欲求: ${existingPsychology.currentDesires.join(', ')}
現在の恐れ: ${existingPsychology.currentFears.join(', ')}
内的葛藤: ${existingPsychology.internalConflicts.join(', ')}`;
    }
    
    return `
# キャラクター心理分析

以下の情報から、キャラクター「${character.name}」の心理状態を分析してください。

## キャラクター基本情報
名前: ${character.name}
タイプ: ${character.type}
説明: ${character.description}
性格特性: ${personalityTraits}
背景: ${backstory}

## 最近のイベント
${recentEventsText}

## 既存の心理情報（更新前）
${existingPsychologyText}

## 分析指示
上記の情報を基に、次の要素を特定してください:
1. 現在の欲求（3-5項目）: キャラクターが現在何を望んでいるか
2. 現在の恐れ（2-4項目）: キャラクターが現在何を恐れているか
3. 内的葛藤（1-3項目）: キャラクターが抱える内面的矛盾や葛藤
4. 感情状態: 現在の主要な感情とその強度（0-1のスケール）

## 出力形式
JSON形式でのみ出力してください:
{
  "currentDesires": ["欲求1", "欲求2", ...],
  "currentFears": ["恐れ1", "恐れ2", ...],
  "internalConflicts": ["葛藤1", "葛藤2", ...],
  "emotionalState": {
    "感情名1": 強度値,
    "感情名2": 強度値,
    ...
  }
}
`;
  }
  
  /**
   * 関係性分析プロンプトの構築
   * @private
   */
  private buildRelationshipAnalysisPrompt(
    character1: Character, 
    character2: Character, 
    existingRelationship?: any
  ): string {
    const relationshipType = existingRelationship?.type || '不明';
    const relationshipStrength = existingRelationship?.strength || 0.5;
    const relationshipDescription = existingRelationship?.description || '';
    
    return `
# キャラクター関係性分析

以下の2人のキャラクターの関係性を分析してください。

## キャラクター1
名前: ${character1.name}
タイプ: ${character1.type}
説明: ${character1.description}

## キャラクター2
名前: ${character2.name}
タイプ: ${character2.type}
説明: ${character2.description}

## 既存の関係性
関係タイプ: ${relationshipType}
関係の強さ: ${relationshipStrength}
説明: ${relationshipDescription}

## 分析指示
${character1.name}から見た${character2.name}への感情的態度を分析してください。

## 出力形式
JSON形式でのみ出力してください:
{
  "attitude": "感情的態度（信頼、疑念、愛情、嫉妬など）",
  "intensity": 0.X, // 強度（0-1の範囲）
  "isDynamic": true/false, // 変化しつつあるか
  "recentChange": "最近の変化の説明（変化している場合）"
}
`;
  }

  /**
   * 心理分析レスポンスのパース
   * @private
   */
  private parsePsychologyResponse(response: string, existingPsychology?: CharacterPsychology): CharacterPsychology {
    try {
      // JSONブロックの抽出
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Response does not contain valid JSON');
      }
      
      const jsonData = JSON.parse(jsonMatch[0]);
      
      // 必須フィールドの確認と補完
      return {
        currentDesires: jsonData.currentDesires || existingPsychology?.currentDesires || ['生存', '安全'],
        currentFears: jsonData.currentFears || existingPsychology?.currentFears || ['失敗', '孤独'],
        internalConflicts: jsonData.internalConflicts || existingPsychology?.internalConflicts || [],
        emotionalState: jsonData.emotionalState || existingPsychology?.emotionalState || { '平静': 0.5 },
        relationshipAttitudes: existingPsychology?.relationshipAttitudes || {}
      };
    } catch (error) {
      logger.error('Psychology response parsing failed', {
        error: error instanceof Error ? error.message : String(error),
        response: response.substring(0, 200) + '...' // ログ用に短縮
      });
      
      // パース失敗時は既存の心理情報またはデフォルト値を返す
      return existingPsychology || {
        currentDesires: ['生存', '安全'],
        currentFears: ['失敗', '孤独'],
        internalConflicts: [],
        emotionalState: { '平静': 0.5 },
        relationshipAttitudes: {}
      };
    }
  }
  
  /**
   * 関係性分析レスポンスのパース
   * @private
   */
  private parseRelationshipResponse(response: string): RelationshipAttitude {
    try {
      // JSONブロックの抽出
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Response does not contain valid JSON');
      }
      
      const jsonData = JSON.parse(jsonMatch[0]);
      
      // 必須フィールドの確認と補完
      return {
        attitude: jsonData.attitude || '中立',
        intensity: typeof jsonData.intensity === 'number' ? 
          Math.max(0, Math.min(1, jsonData.intensity)) : 0.5,
        isDynamic: !!jsonData.isDynamic,
        recentChange: jsonData.recentChange || ''
      };
    } catch (error) {
      logger.error('Relationship response parsing failed', {
        error: error instanceof Error ? error.message : String(error),
        response: response.substring(0, 200) + '...'
      });
      
      // パース失敗時はデフォルト値を返す
      return {
        attitude: '中立',
        intensity: 0.5,
        isDynamic: false,
        recentChange: ''
      };
    }
  }
  
  /**
   * デフォルトの心理情報を作成する
   * @private
   */
  private createDefaultPsychology(character: Character, existingPsychology?: CharacterPsychology): CharacterPsychology {
    // 既存の心理情報があればそれを返す
    if (existingPsychology) {
      return existingPsychology;
    }
    
    // キャラクタータイプに応じたデフォルト値
    const defaultDesires = character.type === 'MAIN' ? 
      ['使命の遂行', '承認', '成長'] : 
      ['生存', '安全', '所属'];
    
    const defaultFears = character.type === 'MAIN' ?
      ['失敗', '喪失', '裏切り'] :
      ['危険', '孤立'];
    
    return {
      currentDesires: defaultDesires,
      currentFears: defaultFears,
      internalConflicts: [],
      emotionalState: { '平静': 0.5 },
      relationshipAttitudes: {}
    };
  }

  /**
   * 高エネルギーの感情を持っているか判定
   * @private
   */
  private hasHighEnergyEmotion(emotionalState: {[key: string]: number}): boolean {
    const highEnergyEmotions = ['怒り', '興奮', '熱意', '恐怖', '驚き'];
    
    for (const emotion of highEnergyEmotions) {
      if (emotionalState[emotion] && emotionalState[emotion] > 0.6) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * ポジティブな感情が支配的か判定
   * @private
   */
  private isPositiveEmotionDominant(emotionalState: {[key: string]: number}): boolean {
    const positiveEmotions = ['喜び', '満足', '期待', '安心', '興味'];
    const negativeEmotions = ['悲しみ', '怒り', '恐怖', '不安', '嫌悪'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    for (const [emotion, intensity] of Object.entries(emotionalState)) {
      if (positiveEmotions.includes(emotion)) {
        positiveScore += intensity;
      } else if (negativeEmotions.includes(emotion)) {
        negativeScore += intensity;
      }
    }
    
    return positiveScore > negativeScore;
  }

  /**
   * テキストからキーワードを抽出
   * @private
   */
  private extractKeywords(text: string): string[] {
    // 簡易的なキーワード抽出ロジック
    const words = text.split(/\s+|、|。/);
    const filteredWords = words.filter(word => word.length >= 2);
    return filteredWords;
  }

  /**
   * 性格特性から感情要因を取得
   * @private
   */
  private getTraitEmotionalFactors(traits: string[]): {[key: string]: number} {
    const factors: {[key: string]: number} = {};
    
    // 性格特性と感情の関連付け
    const traitEmotionMap: {[key: string]: {[emotion: string]: number}} = {
      '明るい': { '喜び': 0.3, '悲しみ': -0.2 },
      '陽気': { '喜び': 0.3, '期待': 0.2 },
      '内向的': { '喜び': -0.1, '不安': 0.2 },
      '臆病': { '恐れ': 0.3, '不安': 0.2 },
      '大胆': { '恐れ': -0.2, '期待': 0.2 },
      '怒りっぽい': { '怒り': 0.3 },
      '穏やか': { '怒り': -0.2, '平静': 0.3 },
      '心配性': { '不安': 0.3 },
      '楽観的': { '期待': 0.3, '不安': -0.2 },
      '悲観的': { '悲しみ': 0.2, '期待': -0.2 },
      '好奇心旺盛': { '興味': 0.3, '驚き': 0.2 },
      '疑い深い': { '信頼': -0.2, '恐れ': 0.1 },
      '信頼しやすい': { '信頼': 0.3 },
      '情熱的': { '喜び': 0.2, '怒り': 0.2 },
      '冷淡': { '喜び': -0.1, '共感': -0.2 }
    };
    
    // 各特性に対応する感情要因を追加
    for (const trait of traits) {
      const matchedTrait = Object.keys(traitEmotionMap).find(
        key => trait.includes(key)
      );
      
      if (matchedTrait) {
        const emotionFactors = traitEmotionMap[matchedTrait];
        for (const [emotion, factor] of Object.entries(emotionFactors)) {
          factors[emotion] = (factors[emotion] || 0) + factor;
        }
      }
    }
    
    return factors;
  }

  /**
   * 恐れと欲求から感情要因を取得
   * @private
   */
  private getFearDesireFactors(
    fears: string[],
    desires: string[],
    keywords: string[]
  ): {[key: string]: number} {
    const factors: {[key: string]: number} = {};
    
    // キーワードが恐れに関連しているか確認
    for (const fear of fears) {
      for (const keyword of keywords) {
        if (fear.includes(keyword) || keyword.includes(fear)) {
          factors['恐れ'] = (factors['恐れ'] || 0) + 0.3;
          factors['不安'] = (factors['不安'] || 0) + 0.2;
          break;
        }
      }
    }
    
    // キーワードが欲求に関連しているか確認
    for (const desire of desires) {
      for (const keyword of keywords) {
        if (desire.includes(keyword) || keyword.includes(desire)) {
          factors['喜び'] = (factors['喜び'] || 0) + 0.2;
          factors['期待'] = (factors['期待'] || 0) + 0.3;
          break;
        }
      }
    }
    
    return factors;
  }

  /**
   * キーワードに基づいて感情を調整
   * @private
   */
  private adjustEmotionsBasedOnKeywords(
    emotions: {[emotion: string]: number},
    keywords: string[]
  ): void {
    // 感情関連キーワード
    const emotionKeywords: {[key: string]: string[]} = {
      '喜び': ['幸せ', '嬉しい', '楽しい', '喜ぶ', '祝う'],
      '悲しみ': ['悲しい', '辛い', '泣く', '喪失', '失う'],
      '怒り': ['怒る', '激怒', '憤る', '不満', '怒り'],
      '恐れ': ['恐怖', '怖い', '恐れる', '不安', '危険'],
      '驚き': ['驚く', '衝撃', '意外', '予想外', '驚愕'],
      '信頼': ['信頼', '頼る', '信じる', '安心', '依存'],
      '嫌悪': ['嫌い', '嫌悪', '不快', '吐き気', '忌避'],
      '期待': ['期待', '楽しみ', '希望', '望む', '待つ']
    };
    
    // キーワードマッチングによる感情強度調整
    for (const [emotion, keywords_list] of Object.entries(emotionKeywords)) {
      for (const keyword of keywords) {
        if (keywords_list.some(k => keyword.includes(k) || k.includes(keyword))) {
          emotions[emotion] = (emotions[emotion] || 0) + 0.2;
        }
      }
    }
  }

  /**
   * 性格特性に基づいて感情を調整
   * @private
   */
  private adjustEmotionsBasedOnTraits(
    emotions: {[emotion: string]: number},
    factors: {[key: string]: number}
  ): void {
    for (const [emotion, factor] of Object.entries(factors)) {
      emotions[emotion] = (emotions[emotion] || 0) + factor;
    }
  }

  /**
   * 恐れと欲求に基づいて感情を調整
   * @private
   */
  private adjustEmotionsBasedOnFearDesire(
    emotions: {[emotion: string]: number},
    factors: {[key: string]: number}
  ): void {
    for (const [emotion, factor] of Object.entries(factors)) {
      emotions[emotion] = (emotions[emotion] || 0) + factor;
    }
  }

  /**
   * 感情説明を生成
   * @private
   */
  private generateEmotionalExplanation(
    dominantEmotion: string,
    traits: string[],
    eventDescription: string
  ): string {
    // 簡易的な説明生成
    if (dominantEmotion === '喜び') {
      return `性格特性「${traits.join('、')}」を持つキャラクターは、「${eventDescription}」という状況から喜びを感じています。`;
    } else if (dominantEmotion === '悲しみ') {
      return `性格特性「${traits.join('、')}」を持つキャラクターは、「${eventDescription}」という状況から悲しみを感じています。`;
    } else if (dominantEmotion === '怒り') {
      return `性格特性「${traits.join('、')}」を持つキャラクターは、「${eventDescription}」という状況から怒りを感じています。`;
    } else if (dominantEmotion === '恐れ') {
      return `性格特性「${traits.join('、')}」を持つキャラクターは、「${eventDescription}」という状況から恐れを感じています。`;
    } else {
      return `性格特性「${traits.join('、')}」を持つキャラクターは、「${eventDescription}」という状況から${dominantEmotion}を感じています。`;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const psychologyService = new PsychologyService();