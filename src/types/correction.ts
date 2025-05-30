import { Foreshadowing } from './memory'; // ←これだけ！

/**
 * 自動修正システムに関連する型定義
 */

import { Chapter } from './chapters';

/**
 * 不整合の深刻度
 */
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * 修正タイプ
 */
export type CorrectionType = 'REPLACE' | 'INSERT' | 'DELETE';

/**
 * 不整合問題
 * テキスト内で検出された一貫性、論理性、表現などの問題を表す
 */
export interface InconsistencyIssue {
  /** 不整合の種類 */
  type: string;
  
  /** 不整合の説明 */
  description: string;
  
  /** 不整合の位置 (テキスト内のインデックス) */
  position?: number;
  
  /** 不整合部分のテキスト */
  target?: string;
  
  /** 修正の提案 */
  suggestion?: string;
  
  /** 深刻度 */
  severity: SeverityLevel;
  
  /** 関連するキャラクターID (キャラクター問題の場合) */
  characterId?: string;
  
  /** 関連するキャラクター名 (キャラクター問題の場合) */
  characterName?: string;
  
  /** 関連するイベントID (プロット問題の場合) */
  event?: string;
}

/**
 * 置換修正
 * テキストの一部を別のテキストに置き換える修正
 */
export interface ReplaceCorrection {
  type: 'REPLACE';
  target: string;
  replacement: string;
  description: string;
  severity: SeverityLevel;
}

/**
 * 挿入修正
 * 指定位置に新しいテキストを挿入する修正
 */
export interface InsertCorrection {
  type: 'INSERT';
  position: number;
  text: string;
  description: string;
  severity: SeverityLevel;
}

/**
 * 削除修正
 * 指定範囲のテキストを削除する修正
 */
export interface DeleteCorrection {
  type: 'DELETE';
  start: number;
  end: number;
  description: string;
  severity: SeverityLevel;
}

/**
 * 修正
 * テキストに対する修正操作
 */
export type Correction = ReplaceCorrection | InsertCorrection | DeleteCorrection;

/**
 * 修正結果
 * 不整合検出と修正適用の結果
 */
export interface CorrectionResult {
  /** 元のチャプター */
  originalChapter: Chapter;
  
  /** 修正後のチャプター */
  correctedChapter: Chapter;
  
  /** 検出された不整合 */
  issues: InconsistencyIssue[];
  
  /** 適用された修正 */
  appliedCorrections: Correction[];
  
  /** 却下された修正 */
  rejectedCorrections: Correction[];
}

/**
 * 修正履歴エントリ
 */
export interface CorrectionHistoryEntry {
  /** タイムスタンプ */
  timestamp: Date;
  
  /** 修正リスト */
  corrections: {
    type: string;
    description: string;
  }[];
}

/**
 * キャラクターインスタンス
 * チャプター内のキャラクター出現に関する情報
 */
export interface CharacterInstance {
  /** キャラクターID */
  characterId: string;
  
  /** キャラクター名 */
  characterName: string;
  
  /** 出現位置 */
  position: number;
  
  /** 周辺テキスト */
  context: string;
  
  /** 性格描写 */
  personality: Record<string, any>;
  
  /** 行動描写 */
  behavior: any[];
  
  /** セリフ内容 */
  dialogue: string[];
  
  /** 能力描写 */
  abilities: string[];
}

/**
 * プロットイベント
 * ストーリー内の重要なイベント
 */
export interface PlotEvent {
  /** イベントID */
  id: string;
  
  /** イベントの説明 */
  description: string;
  
  /** イベントの位置 */
  position: number;
  
  /** イベントのテキスト */
  text: string;
  
  /** 関わるキャラクター */
  involvedCharacters: string[];
  
  /** イベントタイプ */
  type: string;
  
  /** イベントサブタイプ */
  subType?: string;
  
  /** 強度 (0-1) */
  intensity?: number;
  
  /** 結果 */
  outcome?: 'SUCCESS' | 'FAILURE' | 'NEUTRAL';
  
  /** 関連キャラクター */
  relatedCharacters?: string[];
  
  /** スキル領域 */
  skillArea?: string;
}

// 伏線解決提案
export interface ResolutionSuggestion {
    foreshadowing: Foreshadowing;
    chapterContent: string;
    reason: string;
    confidence: number;  // 0.0-1.0
  }
  
  // 伏線インスタンス（検出時の情報を含む）
  export interface ForeshadowingInstance {
    id: string;
    characterId?: string;
    description: string;
    context: string;
    position: number;
    confidence: number;
  }