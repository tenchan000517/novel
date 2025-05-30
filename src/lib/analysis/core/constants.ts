/**
 * @fileoverview 定数定義
 * @description
 * アプリケーション全体で使用される主要な定数を定義します。
 */

/**
 * デフォルトのキャッシュTTL（1時間）
 */
export const DEFAULT_CACHE_TTL = 3600000;

/**
 * デフォルトのキャッシュサイズ上限
 */
export const DEFAULT_CACHE_MAX_SIZE = 100;

/**
 * 分析のデフォルト設定
 */
export const ANALYSIS_DEFAULT_OPTIONS = {
  characterDetection: {
    minSignificance: 0.3,
    maxCharacters: 10
  },
  styleAnalysis: {
    minSampleSize: 500
  },
  themeAnalysis: {
    minStrength: 0.4
  }
};

/**
 * バリデーションの閾値
 */
export const VALIDATION_THRESHOLDS = {
  subjectDiversity: 0.7,
  styleContinuity: 0.6,
  characterConsistency: 0.8
};