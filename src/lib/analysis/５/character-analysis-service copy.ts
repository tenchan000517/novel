/**
 * @fileoverview キャラクター分析サービス
 * @description
 * キャラクターの行動、心理、関係性の分析を一元的に提供するサービス。
 * 既存のキャラクターサービスとの統合を図りながら、分析機能を提供します。
 */
import { logger } from '@/lib/utils/logger';
import { characterManager } from '@/lib/characters/manager';
import { Character, CharacterPsychology } from '@/lib/characters/core/types';
import { ValidationResult } from '@/lib/characters/core/types';
import { RelationshipResponse, RelationshipAnalysis } from '@/lib/characters/core/types';
import { CharacterAppearance } from '@/types/generation';
import { Chapter } from '@/types/chapters';
import { detectionService } from '@/lib/characters/services/detection-service';

/**
 * @class CharacterAnalysisService
 * @description キャラクターの分析を担当するサービスクラス
 * 
 * @role
 * - キャラクターの行動パターン分析
 * - キャラクターの心理状態分析
 * - キャラクター間の関係性分析
 * - キャラクターの変化検出
 */
export class CharacterAnalysisService {
  /**
   * コンストラクタ
   */
  constructor() {
    logger.info('CharacterAnalysisService initialized');
  }

  /**
   * キャラクターの総合分析
   * キャラクターの現在の状態、変化、関係性を分析します
   * 
   * @param {string} characterId キャラクターID
   * @returns {Promise<any>} 分析結果
   */
  async analyzeCharacter(characterId: string): Promise<any> {
    try {
      // characterManagerの分析機能を利用
      return await characterManager.analyzeCharacter(characterId);
    } catch (error) {
      logger.error(`Character analysis failed for character ${characterId}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * キャラクターの心理分析
   * 
   * @param {string} characterId キャラクターID
   * @param {number} chapterNumber 章番号
   * @returns {Promise<CharacterPsychology | null>} 心理分析結果
   */
  async getCharacterPsychology(characterId: string, chapterNumber: number): Promise<CharacterPsychology | null> {
    try {
      return await characterManager.getCharacterPsychology(characterId, chapterNumber);
    } catch (error) {
      logger.error(`Character psychology analysis failed for character ${characterId}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * 複数キャラクターの心理分析
   * 
   * @param {string[]} characterIds キャラクターID配列
   * @param {number} chapterNumber 章番号
   * @returns {Promise<{[id: string]: CharacterPsychology}>} キャラクターごとの心理分析結果
   */
  async getMultipleCharacterPsychology(
    characterIds: string[], 
    chapterNumber: number
  ): Promise<{[id: string]: CharacterPsychology}> {
    try {
      const result: { [id: string]: CharacterPsychology } = {};
      
      // 各キャラクターの心理分析を順次取得
      for (const id of characterIds) {
        try {
          const psychology = await characterManager.getCharacterPsychology(id, chapterNumber);
          if (psychology) {
            result[id] = psychology;
          }
        } catch (err) {
          logger.warn(`Failed to get psychology for character ${id}`, {
            error: err instanceof Error ? err.message : String(err)
          });
        }
      }
      
      return result;
    } catch (error) {
      logger.error(`Multiple character psychology analysis failed`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return {};
    }
  }

  /**
   * キャラクターの関係性取得
   * 
   * @param {string} characterId キャラクターID
   * @returns {Promise<RelationshipResponse>} 関係性データ
   */
  async getCharacterRelationships(characterId: string): Promise<RelationshipResponse> {
    try {
      return await characterManager.getCharacterRelationships(characterId);
    } catch (error) {
      logger.error(`Failed to get character relationships for ${characterId}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return { relationships: [] };
    }
  }

  /**
   * 関係性分析の取得
   * 
   * @returns {Promise<RelationshipAnalysis>} 関係性分析結果
   */
  async getRelationshipAnalysis(): Promise<RelationshipAnalysis> {
    try {
      return await characterManager.getRelationshipAnalysis();
    } catch (error) {
      logger.error(`Failed to get relationship analysis`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * コンテンツからキャラクターを検出
   * 
   * @param {string} content 検出対象のコンテンツ
   * @returns {Promise<Character[]>} 検出されたキャラクター
   */
  async detectCharactersInContent(content: string): Promise<Character[]> {
    try {
      return await characterManager.detectCharactersInContent(content);
    } catch (error) {
      logger.error(`Failed to detect characters in content`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * キャラクターの行動予測
   * 
   * @param {string} characterId キャラクターID
   * @param {string} situation 状況
   * @param {string[]} options 選択肢
   * @returns {Promise<any>} 予測結果
   */
  async predictCharacterAction(
    characterId: string, 
    situation: string, 
    options: string[]
  ): Promise<any> {
    try {
      return await characterManager.predictCharacterAction(characterId, situation, options);
    } catch (error) {
      logger.error(`Failed to predict character action for ${characterId}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * キャラクター設定の検証
   * 
   * @param {string} characterId キャラクターID
   * @returns {Promise<ValidationResult>} 検証結果
   */
  async validateCharacter(characterId: string): Promise<ValidationResult> {
    try {
      return await characterManager.validateCharacter(characterId);
    } catch (error) {
      logger.error(`Failed to validate character ${characterId}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * キャラクターの章内の台詞抽出
   * 
   * @param {string} characterId キャラクターID
   * @param {string} content 章の内容
   * @returns {Promise<string[]>} 抽出された台詞
   */
  async extractCharacterDialogs(characterId: string, content: string): Promise<string[]> {
    try {
      // キャラクターを取得
      const character = await characterManager.getCharacter(characterId);
      if (!character) {
        return [];
      }
      
      // detectionServiceから台詞抽出機能を呼び出す
      return await detectionService.extractCharacterDialog(character, content);
    } catch (error) {
      logger.error(`Failed to extract dialogs for character ${characterId}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * キャラクターの章内の言及検出
   * 
   * @param {string} characterId キャラクターID
   * @param {string} content 章の内容
   * @returns {Promise<string[]>} 検出された言及テキスト
   */
  async detectCharacterMentions(characterId: string, content: string): Promise<string[]> {
    try {
      // キャラクターを取得
      const character = await characterManager.getCharacter(characterId);
      if (!character) {
        return [];
      }
      
      // detectionServiceから言及検出機能を呼び出す
      return await detectionService.detectCharacterMentions(character, content);
    } catch (error) {
      logger.error(`Failed to detect mentions for character ${characterId}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * 章からキャラクターの登場と重要度を分析
   * 
   * @param {Chapter} chapter 分析対象の章
   * @returns {Promise<CharacterAppearance[]>} 分析結果
   */
  async analyzeCharacterAppearancesInChapter(chapter: Chapter): Promise<CharacterAppearance[]> {
    try {
      // まずコンテンツからキャラクターを検出
      const characters = await this.detectCharactersInContent(chapter.content);
      
      // 検出結果を基に登場情報を構築
      const appearances: CharacterAppearance[] = [];
      
      for (const character of characters) {
        // キャラクターの台詞を抽出
        const dialogs = await this.extractCharacterDialogs(character.id, chapter.content);
        
        // キャラクターへの言及を検出
        const mentions = await this.detectCharacterMentions(character.id, chapter.content);
        
        // 登場重要度を計算（基本的な算出ロジック）
        const significance = this.calculateCharacterSignificance(
          dialogs.length, 
          mentions.length, 
          character.type
        );
        
        appearances.push({
          characterId: character.id,
          characterName: character.name,
          scenes: [], // シーン情報は別途必要に応じて計算
          dialogueCount: dialogs.length,
          significance,
          actions: [], // アクション抽出はより複雑な分析が必要
          emotions: []  // 感情抽出もより複雑な分析が必要
        });
      }
      
      // 重要度順にソート
      return appearances.sort((a, b) => b.significance - a.significance);
    } catch (error) {
      logger.error(`Failed to analyze character appearances in chapter ${chapter.chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * キャラクターの登場重要度を計算
   * @private
   * @param {number} dialogCount 対話数
   * @param {number} mentionCount 言及数
   * @param {string} characterType キャラクタータイプ
   * @returns {number} 重要度（0-1）
   */
  private calculateCharacterSignificance(
    dialogCount: number, 
    mentionCount: number, 
    characterType: string
  ): number {
    // タイプごとのベースの重要度
    let baseSignificance = 0.3;
    if (characterType === 'MAIN') {
      baseSignificance = 0.7;
    } else if (characterType === 'SUB') {
      baseSignificance = 0.5;
    }
    
    // 対話と言及に基づく追加スコア（最大0.3）
    const activityScore = Math.min(0.3, (dialogCount * 0.02 + mentionCount * 0.01));
    
    // 最終的な重要度を計算（0-1に制限）
    return Math.min(1, Math.max(0, baseSignificance + activityScore));
  }
}

// シングルトンインスタンスをエクスポート
export const characterAnalysisService = new CharacterAnalysisService();