// src\lib\analysis\enhancement\tension\interfaces.ts
/**
 * @fileoverview テンション最適化サービスのインターフェース定義
 * @description
 * 物語のテンションとペーシングの最適化に関連するインターフェースを定義します。
 */

/**
 * テンション推奨を表す型
 */
export interface TensionRecommendation {
  /** 推奨テンション値 (0-1) */
  recommendedTension: number;
  /** 推奨理由 */
  reason: string;
  /** 方向性 */
  direction: "increase" | "decrease" | "maintain" | "establish";
}

/**
 * ペーシング推奨を表す型
 */
export interface PacingRecommendation {
  /** 推奨ペーシング値 (0-1) */
  recommendedPacing: number;
  /** 説明 */
  description: string;
}

/**
 * テンション・ペーシング推奨を表す型
 */
export interface TensionPacingRecommendation {
  /** テンション推奨 */
  tension: TensionRecommendation;
  /** ペーシング推奨 */
  pacing: PacingRecommendation;
}

/**
 * ストーリーイベント型
 */
export interface StoryEvent {
  /** イベントタイプ */
  type: string;
  /** 重要度 (0-1) */
  significance: number;
  /** 追加情報 */
  details?: any;
}

/**
 * テンションカーブポイントを表す型
 */
export interface TensionCurvePoint {
  /** 章番号 */
  chapterNumber: number;
  /** テンション値 (0-1) */
  tension: number;
  /** 説明 */
  description?: string;
}

/**
 * 物語アーク情報を表す型
 */
export interface NarrativeArcInfo {
  /** 現在のアーク番号 */
  currentArcNumber: number;
  /** アークの開始章 */
  arcStartChapter: number;
  /** アークの終了章（予測） */
  arcEndChapter: number;
  /** アーク内での位置 (0-1) */
  positionInArc: number;
  /** アークのテーマ */
  arcTheme?: string;
}

/**
 * テンション最適化サービスのインターフェース
 */
export interface ITensionOptimizationService {
  /**
   * サービスの初期化
   */
  initialize(): Promise<void>;
  
  /**
   * テンション・ペーシング推奨を取得
   * @param chapterNumber 章番号
   * @param genre ジャンル（オプショナル）
   * @param options 追加オプション（オプショナル）
   */
  getTensionPacingRecommendation(
    chapterNumber: number,
    genre?: string,
    options?: any
  ): Promise<TensionPacingRecommendation>;
  
  /**
   * テンション最適化提案を生成
   * @param chapterNumber 章番号
   * @param currentTension 現在のテンション値
   */
  generateTensionOptimizationSuggestions(
    chapterNumber: number,
    currentTension: number
  ): Promise<string[]>;
  
  /**
   * テンション曲線を生成
   * @param totalChapters 総章数
   * @param genre ジャンル（オプショナル）
   */
  generateTensionCurve(
    totalChapters: number,
    genre?: string
  ): Promise<TensionCurvePoint[]>;
  
  /**
   * クライマックス配置の推奨を取得
   * @param totalChapters 総章数
   * @param genre ジャンル（オプショナル）
   */
  recommendClimax(
    totalChapters: number,
    genre?: string
  ): Promise<{
    climaxChapter: number;
    secondaryClimaxChapters: number[];
    reason: string;
  }>;
}