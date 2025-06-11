/**
 * Genre Management System - Public Interface
 * 
 * ジャンル管理システムの公開インターフェース
 * Version 2.0要件: ジャンル分析・適応・品質管理
 */

// GenreManagerクラスを直接インポート
import { GenreManager } from './core/genre-manager';

// インターフェース
export type {
  IGenreManager,
  IGenreAnalyzer,
  IGenreAdapter,
  IGenreQualityController,
  IGenreLearningEngine,
  GenreElement,
  GenreCompliance,
  GenreCustomization,
  GenreRecommendation,
  TimePeriod,
  GenreEvolution,
  GenreMarker,
  GenreStrength,
  GenreHybrid,
  GenreInnovation,
  GenreAuthenticity
} from './interfaces';

// 型定義
export type {
  GenreManagerConfig,
  GenreAnalysisConfig,
  GenreAdaptationConfig,
  GenreQualityConfig,
  GenreProfile,
  GenreContext,
  GenreAnalysis,
  GenreClassification,
  GenreAdaptation,
  GenreValidation,
  GenreOptimization,
  GenreCharacteristics,
  GenreConvention,
  AudienceExpectation,
  GenreStandards,
  GenreClassificationResult,
  HybridAnalysis,
  GenreStrengthAnalysis,
  MarketViabilityAnalysis,
  GenreQualityAnalysis,
  GenreMetrics,
  GenreStatistics,
  GenreReport,
  GenreBenchmark,
  GenreTrend,
  AnalysisDepth,
  AdaptationMode,
  InnovationLevel,
  ConventionImportance,
  ConventionFlexibility,
  ExpectationType,
  ExpectationPriority,
  TrendType,
  TrendDirection,
  TrendStrength,
  TargetAudience,
  CulturalContext,
  MarketPosition,
  PublishingContext,
  CompetitiveContext,
  GenreType,
  GenreComplexity
} from './types';

// 値として使用するenumは通常のimportを使用
import {
  GenreType,
  GenreComplexity,
  AnalysisDepth,
  AdaptationMode,
  InnovationLevel
} from './types';

// コアマネージャーをエクスポート
export { GenreManager };

// デフォルトコンフィグ
export const DEFAULT_GENRE_CONFIG: Partial<import('./types').GenreManagerConfig> = {
  enableGenreAnalysis: true,
  enableGenreAdaptation: true,
  enableQualityMonitoring: true,
  enableTrendTracking: true,
  enableLearning: true,
  defaultGenreComplexity: GenreComplexity.MODERATE,
  qualityThreshold: 0.8,
  adaptationThreshold: 0.75,
  realTimeAnalysis: false,
  cacheResults: true,
  batchProcessing: false,
  parallelAnalysis: true
};

export const DEFAULT_ANALYSIS_CONFIG: Partial<import('./types').GenreAnalysisConfig> = {
  analysisDepth: AnalysisDepth.STANDARD,
  includeSubgenres: true,
  detectHybrids: true,
  culturalAdaptation: true,
  historicalContext: true,
  marketAnalysis: true,
  audienceAnalysis: true,
  competitorAnalysis: false
};

export const DEFAULT_ADAPTATION_CONFIG: Partial<import('./types').GenreAdaptationConfig> = {
  adaptationMode: AdaptationMode.MODERATE,
  preserveOriginalStyle: true,
  maintainCharacterIntegrity: true,
  respectCulturalSensitivity: true,
  allowGenreBlending: true,
  innovationLevel: InnovationLevel.MODERATE,
  qualityAssurance: true,
  reversibility: true
};

export const DEFAULT_QUALITY_CONFIG: Partial<import('./types').GenreQualityConfig> = {
  strictStandards: true,
  genreSpecificCriteria: true,
  audienceExpectations: true,
  marketStandards: true,
  culturalAuthenticity: true,
  historicalAccuracy: true,
  benchmarkComparison: true,
  continuousMonitoring: false
};

// ファクトリー関数
export function createGenreManager(
  config?: Partial<import('./types').GenreManagerConfig>,
  analysisConfig?: Partial<import('./types').GenreAnalysisConfig>,
  adaptationConfig?: Partial<import('./types').GenreAdaptationConfig>,
  qualityConfig?: Partial<import('./types').GenreQualityConfig>
): GenreManager {
  return new GenreManager(
    { ...DEFAULT_GENRE_CONFIG, ...config },
    { ...DEFAULT_ANALYSIS_CONFIG, ...analysisConfig },
    { ...DEFAULT_ADAPTATION_CONFIG, ...adaptationConfig },
    { ...DEFAULT_QUALITY_CONFIG, ...qualityConfig }
  );
}

// ユーティリティ関数

/**
 * ジャンルコンテキストを作成
 */
export function createGenreContext(
  targetAudience: any,
  culturalContext: any,
  marketPosition: any,
  options?: Partial<import('./types').GenreContext>
): import('./types').GenreContext {
  return {
    targetAudience,
    culturalContext,
    marketPosition,
    publishingContext: {} as any,
    competitiveContext: {} as any,
    qualityRequirements: [],
    ...options
  };
}

/**
 * ジャンルプロファイルを作成
 */
export function createGenreProfile(
  genreType: import('./types').GenreType,
  name: string,
  description: string,
  options?: Partial<import('./types').GenreProfile>
): import('./types').GenreProfile {
  return {
    id: `profile-${genreType}-${Date.now()}`,
    genreType,
    name,
    description,
    characteristics: {} as any,
    conventions: [],
    expectations: [],
    standards: {} as any,
    metrics: {} as any,
    metadata: {} as any,
    lastUpdated: new Date(),
    ...options
  };
}

/**
 * ターゲットオーディエンスを作成
 */
export function createTargetAudience(
  primaryDemographic: any,
  readingPreferences: any,
  options?: Partial<import('./types').TargetAudience>
): import('./types').TargetAudience {
  return {
    primaryDemographic,
    secondaryDemographics: [],
    psychographics: {} as any,
    readingPreferences,
    genreExpectations: {} as any,
    ...options
  };
}

// 定数とヘルパー
export const GENRE_EVENTS = {
  GENRE_ANALYZED: 'genre_analyzed' as const,
  GENRE_CLASSIFIED: 'genre_classified' as const,
  GENRE_ADAPTED: 'genre_adapted' as const,
  GENRE_OPTIMIZED: 'genre_optimized' as const,
  GENRE_VALIDATED: 'genre_validated' as const,
  QUALITY_EVALUATED: 'quality_evaluated' as const,
  BENCHMARK_COMPARED: 'benchmark_compared' as const,
  TRENDS_MONITORED: 'trends_monitored' as const,
  PROFILE_CREATED: 'profile_created' as const,
  PROFILE_UPDATED: 'profile_updated' as const,
  RECOMMENDATIONS_GENERATED: 'recommendations_generated' as const,
  REPORT_GENERATED: 'report_generated' as const
};

export const GENRE_QUALITY_THRESHOLDS = {
  MINIMUM: 0.6,
  ACCEPTABLE: 0.7,
  GOOD: 0.8,
  EXCELLENT: 0.9,
  PROFESSIONAL: 0.95
} as const;

export const ADAPTATION_THRESHOLDS = {
  CONSERVATIVE: 0.9,
  MODERATE: 0.75,
  AGGRESSIVE: 0.6,
  EXPERIMENTAL: 0.4
} as const;

export const INNOVATION_LEVELS = {
  NONE: 0.0,
  MINIMAL: 0.2,
  MODERATE: 0.5,
  HIGH: 0.8,
  REVOLUTIONARY: 1.0
} as const;

export const CONFIDENCE_THRESHOLDS = {
  LOW: 0.6,
  MODERATE: 0.75,
  HIGH: 0.85,
  VERY_HIGH: 0.95
} as const;

// システム情報
export const GENRE_SYSTEM_INFO = {
  name: 'Genre Management System',
  version: '2.0.0',
  description: 'ジャンル分析・適応・品質管理を提供するジャンル管理システム',
  features: [
    'ジャンル自動分析（Genre Analysis）',
    'ジャンル分類（Genre Classification）',
    'ジャンル要素検出（Genre Element Detection）',
    'ジャンル適応（Genre Adaptation）',
    'ジャンル最適化（Genre Optimization）',
    'ジャンル品質評価（Genre Quality Assessment）',
    'ジャンル一貫性検証（Genre Consistency Validation）',
    'マーケットバイアビリティ分析（Market Viability Analysis）',
    'ジャンルトレンド監視（Genre Trend Monitoring）',
    'ベンチマーク比較（Benchmark Comparison）',
    'プロファイル管理（Profile Management）',
    '推奨事項生成（Recommendations Generation）',
    '統計・報告（Statistics & Reporting）',
    'ハイブリッドジャンル検出（Hybrid Genre Detection）',
    'イノベーション評価（Innovation Assessment）'
  ],
  capabilities: [
    'プロフェッショナル品質のジャンル分析',
    '多次元ジャンル分類システム',
    'インテリジェントジャンル適応',
    'リアルタイム品質監視',
    'マーケット動向分析',
    'カルチャー適応機能',
    '歴史的コンテキスト分析',
    'オーディエンス期待値管理',
    'ベンチマーク準拠評価',
    'トレンド予測機能'
  ],
  dependencies: [
    'core/infrastructure/logger',
    'types/common'
  ]
} as const;

// ジャンルタイプ定数
export const MAJOR_GENRES = [
  GenreType.CONTEMPORARY_FICTION,
  GenreType.LITERARY_FICTION,
  GenreType.HISTORICAL_FICTION,
  GenreType.SCIENCE_FICTION,
  GenreType.FANTASY,
  GenreType.MYSTERY,
  GenreType.THRILLER,
  GenreType.ROMANCE,
  GenreType.HORROR,
  GenreType.YOUNG_ADULT
];

export const SUBGENRES = [
  GenreType.URBAN_FANTASY,
  GenreType.SPACE_OPERA,
  GenreType.CYBERPUNK,
  GenreType.STEAMPUNK,
  GenreType.DYSTOPIAN,
  GenreType.COZY_MYSTERY,
  GenreType.POLICE_PROCEDURAL,
  GenreType.PARANORMAL_ROMANCE,
  GenreType.GOTHIC_HORROR,
  GenreType.PSYCHOLOGICAL_THRILLER
];

export const HYBRID_GENRES = [
  GenreType.SCI_FI_FANTASY,
  GenreType.ROMANTIC_SUSPENSE,
  GenreType.HISTORICAL_MYSTERY,
  GenreType.LITERARY_THRILLER
];

// ヘルパー関数
export function getGenreCategory(genreType: import('./types').GenreType): string {
  if (MAJOR_GENRES.includes(genreType)) return 'Major';
  if (SUBGENRES.includes(genreType)) return 'Subgenre';
  if (HYBRID_GENRES.includes(genreType)) return 'Hybrid';
  return 'Other';
}

export function calculateGenreComplexity(characteristics: any): import('./types').GenreComplexity {
  // 実装スタブ - 基本的な複雑度計算
  return GenreComplexity.MODERATE;
}

export function determineGenreConfidence(score: number): string {
  if (score >= CONFIDENCE_THRESHOLDS.VERY_HIGH) return 'Very High';
  if (score >= CONFIDENCE_THRESHOLDS.HIGH) return 'High';
  if (score >= CONFIDENCE_THRESHOLDS.MODERATE) return 'Moderate';
  return 'Low';
}

export function assessGenreQualityLevel(score: number): string {
  if (score >= GENRE_QUALITY_THRESHOLDS.PROFESSIONAL) return 'Professional';
  if (score >= GENRE_QUALITY_THRESHOLDS.EXCELLENT) return 'Excellent';
  if (score >= GENRE_QUALITY_THRESHOLDS.GOOD) return 'Good';
  if (score >= GENRE_QUALITY_THRESHOLDS.ACCEPTABLE) return 'Acceptable';
  return 'Needs Improvement';
}

export function getInnovationDescription(level: number): string {
  if (level >= INNOVATION_LEVELS.REVOLUTIONARY) return 'Revolutionary';
  if (level >= INNOVATION_LEVELS.HIGH) return 'High Innovation';
  if (level >= INNOVATION_LEVELS.MODERATE) return 'Moderate Innovation';
  if (level >= INNOVATION_LEVELS.MINIMAL) return 'Minimal Innovation';
  return 'Traditional';
}