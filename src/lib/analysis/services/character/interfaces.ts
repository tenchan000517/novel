// src\lib\analysis\services\character\interfaces.ts
/**
 * @fileoverview キャラクター分析サービスのインターフェース定義
 * @description
 * キャラクターの行動、心理、関係性の分析機能を提供するサービスのインターフェース。
 * 外部コンポーネントからキャラクター分析機能を利用するための標準的なAPIを定義します。
 */
import { Character, CharacterPsychology, ValidationResult, RelationshipResponse, RelationshipAnalysis } from '@/lib/characters/core/types';
import { CharacterAppearance } from '@/types/generation';
import { Chapter } from '@/types/chapters';

/**
 * キャラクター分析サービスインターフェース
 * キャラクターの様々な側面の分析機能を提供します
 */
export interface ICharacterAnalysisService {
  /**
   * キャラクターの総合分析
   * キャラクターの現在の状態、変化、関係性を分析します
   * 
   * @param {string} characterId キャラクターID
   * @returns {Promise<any>} 分析結果
   */
  analyzeCharacter(characterId: string): Promise<any>;

  /**
   * キャラクターの心理分析
   * 
   * @param {string} characterId キャラクターID
   * @param {number} chapterNumber 章番号
   * @returns {Promise<CharacterPsychology | null>} 心理分析結果
   */
  getCharacterPsychology(characterId: string, chapterNumber: number): Promise<CharacterPsychology | null>;

  /**
   * 複数キャラクターの心理分析
   * 
   * @param {string[]} characterIds キャラクターID配列
   * @param {number} chapterNumber 章番号
   * @returns {Promise<{[id: string]: CharacterPsychology}>} キャラクターごとの心理分析結果
   */
  getMultipleCharacterPsychology(
    characterIds: string[], 
    chapterNumber: number
  ): Promise<{[id: string]: CharacterPsychology}>;

  /**
   * キャラクターの関係性取得
   * 
   * @param {string} characterId キャラクターID
   * @returns {Promise<RelationshipResponse>} 関係性データ
   */
  getCharacterRelationships(characterId: string): Promise<RelationshipResponse>;

  /**
   * 関係性分析の取得
   * 
   * @returns {Promise<RelationshipAnalysis>} 関係性分析結果
   */
  getRelationshipAnalysis(): Promise<RelationshipAnalysis>;

  /**
   * コンテンツからキャラクターを検出
   * 
   * @param {string} content 検出対象のコンテンツ
   * @returns {Promise<Character[]>} 検出されたキャラクター
   */
  detectCharactersInContent(content: string): Promise<Character[]>;

  /**
   * キャラクターの行動予測
   * 
   * @param {string} characterId キャラクターID
   * @param {string} situation 状況
   * @param {string[]} options 選択肢
   * @returns {Promise<any>} 予測結果
   */
  predictCharacterAction(
    characterId: string, 
    situation: string, 
    options: string[]
  ): Promise<any>;

  /**
   * キャラクター設定の検証
   * 
   * @param {string} characterId キャラクターID
   * @returns {Promise<ValidationResult>} 検証結果
   */
  validateCharacter(characterId: string): Promise<ValidationResult>;

  /**
   * キャラクターの章内の台詞抽出
   * 
   * @param {string} characterId キャラクターID
   * @param {string} content 章の内容
   * @returns {Promise<string[]>} 抽出された台詞
   */
  extractCharacterDialogs(characterId: string, content: string): Promise<string[]>;

  /**
   * キャラクターの章内の言及検出
   * 
   * @param {string} characterId キャラクターID
   * @param {string} content 章の内容
   * @returns {Promise<string[]>} 検出された言及テキスト
   */
  detectCharacterMentions(characterId: string, content: string): Promise<string[]>;

  /**
   * 章からキャラクターの登場と重要度を分析
   * 
   * @param {Chapter} chapter 分析対象の章
   * @returns {Promise<CharacterAppearance[]>} 分析結果
   */
  analyzeCharacterAppearancesInChapter(chapter: Chapter): Promise<CharacterAppearance[]>;
}

// サービス実装のインポート用にデフォルトエクスポート
export { characterAnalysisService } from '@/lib/analysis/services/character/character-analysis-service';