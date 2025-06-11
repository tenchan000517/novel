/**
 * Expression Management System - Public Interface
 * 
 * 表現管理システムの公開インターフェース
 * Version 2.0要件: 文体最適化・表現多様化・感情表現強化
 */

// コアマネージャー
export { ExpressionManager } from './core/expression-manager';

// インターフェース
export type {
  IExpressionManager,
  StyleContext,
  StyleOptimization,
  StyleSuggestion,
  StyleProfile,
  StyleConsistencyResult,
  DiversificationOptions,
  ExpressionVariants,
  RepetitionAnalysis,
  AlternativeExpression,
  EmotionalContext,
  EmotionalEnhancement,
  PsychologicalAnalysis,
  EmotionalSuggestion,
  ChapterExpressionData,
  ExpressionGuidance,
  ExpressionGenerationContext,
  ExpressionQualityMetrics,
  ExpressionConflict,
  CharacterExpressionIntegration,
  ThemeExpressionIntegration,
  ExpressionStatistics,
  ExpressionHealthStatus,
  TimeOfDay,
  GenreConvention,
  StyleChange,
  StyleMetrics,
  StyleRecommendation,
  StyleExample,
  StyleCharacteristic,
  VocabularyProfile,
  SentenceStructureProfile,
  RhythmPattern,
  TonalQuality,
  StyleDeviation,
  ConsistencyImprovement,
  DiversificationArea,
  ExpressionVariant,
  RepetitivePattern,
  DiversificationSuggestion,
  PriorityFix,
  CharacterEmotionalState,
  EmotionalArc,
  EmotionalImprovement,
  PsychologicalDepth,
  CharacterInsight,
  EmotionalComplexity,
  PsychologicalImprovement,
  EmotionalSuggestionType,
  EmotionalImpact,
  ExpressionPattern,
  EmotionalProgression,
  VarietyMetrics,
  QualityIndicator,
  StyleGuideline,
  ExpressionSuggestion,
  EmotionalDirection,
  DiversityTarget,
  QualityGoal,
  AvoidancePattern,
  SceneContext,
  CharacterContext,
  ThematicContext,
  PreviousExpression,
  ExpressionObjective,
  ConflictResolution,
  StyleDistribution,
  VarietyStatistics,
  EmotionalCoverage,
  QualityTrend,
  UsagePattern,
  ExpressionIssue,
  ExpressionStrength,
  HealthRecommendation,
  CharacterExpressionProfile,
  StyleAlignment,
  EmotionalConsistency,
  PersonalizedSuggestion,
  ThemeExpressionSupport,
  StyleSynergy,
  EmotionalResonance,
  ThemeEnhancementOpportunity
} from './interfaces';

// 実行時に使用されるenumは通常のimportでエクスポート
export {
  SceneType,
  StyleCategory,
  VarietyLevel,
  CreativityLevel,
  ExpressionType,
  EmotionType,
  EmotionalIntensity,
  MoodType,
  AudienceType,
  NarrativeDistance,
  PacingType,
  ImpactLevel
} from './types';

export {
  ExpressionConflictType,
  ConflictSeverity
} from './interfaces';

// 型定義
export type {
  ExpressionManagerConfig,
  StyleAnalysisConfig,
  DiversificationConfig,
  EmotionalAnalysisConfig,
  StyleAnalysisResult,
  StyleComponentScore,
  StylePattern,
  VocabularyAnalysis,
  SentenceStructureAnalysis,
  VarietyAnalysisResult,
  PatternAnalysisResult,
  RepetitionReport,
  AlternativeGenerationResult,
  EmotionalAnalysisResult,
  EmotionalDepthMetrics,
  PsychologicalProfileAnalysis,
  EmotionalEnhancementStrategy,
  ExpressionQualityAssessment,
  QualityDimensionScore,
  PerformanceMetrics,
  UsageAnalytics,
  SystemIntegrationMetrics,
  CharacterIntegrationMetrics,
  ThemeIntegrationMetrics,
  ExpressionError,
  ErrorContext,
  ExpressionSystemState,
  ExpressionReport,
  ExpressionReportSummary,
  DetailedAnalysis
} from './types';

// enumも型定義からエクスポート
export {
  CreativityLevel as TypesCreativityLevel,
  ProcessingMode,
  IntegrationDepth,
  AdaptationLevel,
  AlternativeGenerationMode,
  PsychologicalAccuracyLevel,
  StyleComponent,
  StylePatternType,
  QualityDimension,
  ExpressionErrorType,
  ErrorSeverity,
  ExpressionReportType,
  EnhancementStrategyType
} from './types';

// 便利な型エイリアス
export type ExpressionManagerInstance = import('./core/expression-manager').ExpressionManager;

// デフォルトコンフィグ
export const DEFAULT_EXPRESSION_CONFIG: Partial<import('./types').ExpressionManagerConfig> = {
  styleOptimizationEnabled: true,
  diversificationEnabled: true,
  emotionalEnhancementEnabled: true,
  qualityThreshold: 0.8,
  varietyTargetScore: 0.7,
  creativityLevel: 'balanced' as any,
  processingMode: 'hybrid' as any,
  cacheOptimizations: true,
  realTimeAnalysis: false,
  integrationDepth: 'moderate' as any
};

export const DEFAULT_STYLE_ANALYSIS_CONFIG: Partial<import('./types').StyleAnalysisConfig> = {
  analyzeVocabulary: true,
  analyzeSentenceStructure: true,
  analyzeRhythm: true,
  analyzeImagery: true,
  analyzeTone: true,
  strictConsistency: false,
  creativityBalance: 0.7,
  adaptationLevel: 'standard' as any
};

export const DEFAULT_DIVERSIFICATION_CONFIG: Partial<import('./types').DiversificationConfig> = {
  maxVariationAttempts: 5,
  repetitionThreshold: 0.3,
  varietyTargetScore: 0.7,
  preserveStyleIntegrity: true,
  allowCreativeDeviations: true,
  patternDetectionSensitivity: 0.8,
  alternativeGenerationMode: 'hybrid' as any
};

export const DEFAULT_EMOTIONAL_ANALYSIS_CONFIG: Partial<import('./types').EmotionalAnalysisConfig> = {
  depthAnalysisEnabled: true,
  psychologicalAccuracyLevel: 'intermediate' as any,
  emotionalRangeExpansion: true,
  authenticityCriteria: {},
  readerImpactOptimization: true,
  characterIntegrationLevel: 0.8
};

// ファクトリー関数
export function createExpressionManager(
  config?: Partial<import('./types').ExpressionManagerConfig>,
  styleConfig?: Partial<import('./types').StyleAnalysisConfig>,
  diversificationConfig?: Partial<import('./types').DiversificationConfig>,
  emotionalConfig?: Partial<import('./types').EmotionalAnalysisConfig>
): import('./core/expression-manager').ExpressionManager {
  const { ExpressionManager } = require('./core/expression-manager');
  return new ExpressionManager(
    { ...DEFAULT_EXPRESSION_CONFIG, ...config },
    { ...DEFAULT_STYLE_ANALYSIS_CONFIG, ...styleConfig },
    { ...DEFAULT_DIVERSIFICATION_CONFIG, ...diversificationConfig },
    { ...DEFAULT_EMOTIONAL_ANALYSIS_CONFIG, ...emotionalConfig }
  );
}

// ユーティリティ関数

/**
 * 標準的な文体コンテキストを作成
 */
export function createStyleContext(
  scene: any,
  mood: any,
  options?: any
): any {
  return {
    scene,
    mood,
    targetAudience: 'general',
    genreConventions: [],
    narrativeDistance: 'close',
    pacing: 'moderate',
    ...options
  };
}

/**
 * 感情的コンテキストを作成
 */
export function createEmotionalContext(
  primaryEmotion: any,
  intensity: any,
  options?: any
): any {
  return {
    primaryEmotion,
    secondaryEmotions: [],
    intensity,
    characterState: {},
    sceneEmotionalArc: {},
    readerTargetEmotion: primaryEmotion,
    ...options
  };
}

/**
 * 表現多様化オプションを作成
 */
export function createDiversificationOptions(
  targetVariety: any,
  options?: any
): any {
  return {
    targetVariety,
    preserveStyle: true,
    avoidPatterns: [],
    focusAreas: [],
    creativityLevel: 'standard',
    ...options
  };
}

/**
 * 表現生成コンテキストを作成
 */
export function createExpressionGenerationContext(
  chapterNumber: number,
  options?: any
): any {
  return {
    chapterNumber,
    sceneContext: {},
    characterContext: {},
    thematicContext: {},
    previousExpressions: [],
    targetObjectives: [],
    ...options
  };
}

// 定数とヘルパー
export const EXPRESSION_EVENTS = {
  STYLE_OPTIMIZED: 'style_optimized' as const,
  EXPRESSIONS_DIVERSIFIED: 'expressions_diversified' as const,
  EMOTIONAL_ENHANCED: 'emotional_enhanced' as const,
  QUALITY_EVALUATED: 'quality_evaluated' as const,
  PATTERN_DETECTED: 'pattern_detected' as const,
  CONFLICT_RESOLVED: 'conflict_resolved' as const,
  GUIDANCE_GENERATED: 'guidance_generated' as const
};

export const QUALITY_THRESHOLDS = {
  MINIMUM: 0.6,
  GOOD: 0.75,
  EXCELLENT: 0.9,
  PROFESSIONAL: 0.95
} as const;

export const VARIETY_THRESHOLDS = {
  LOW: 0.4,
  MODERATE: 0.6,
  HIGH: 0.8,
  MAXIMUM: 0.95
} as const;

export const EMOTIONAL_DEPTH_LEVELS = {
  SURFACE: 0.3,
  MODERATE: 0.6,
  DEEP: 0.8,
  PROFOUND: 0.95
} as const;

// システム情報
export const EXPRESSION_SYSTEM_INFO = {
  name: 'Expression Management System',
  version: '2.0.0',
  description: '文体最適化・表現多様化・感情表現強化を提供する表現管理システム',
  features: [
    '文体最適化（Style Optimization）',
    '表現多様化（Expression Diversification）',
    '感情表現強化（Emotional Enhancement）',
    '心理描写分析（Psychological Analysis）',
    '品質評価・管理',
    'チャプター統合',
    'システム間統合',
    'リアルタイム分析'
  ],
  capabilities: [
    'ジャンル・シーン別文体調整',
    'ワンパターン回避の表現提案',
    '心理的深度の評価・強化',
    'キャラクター固有表現の管理',
    'テーマとの表現的連携',
    '読者エンゲージメント予測',
    '文体一貫性の保証',
    '創造性と品質のバランス調整'
  ],
  dependencies: [
    'core/infrastructure/logger',
    'types/common'
  ]
} as const;

// 表現パターン定数
export const EXPRESSION_PATTERNS = {
  REPETITIVE_WORDS: 'repetitive_words' as const,
  REPETITIVE_PHRASES: 'repetitive_phrases' as const,
  MONOTONOUS_STRUCTURE: 'monotonous_structure' as const,
  FORMULAIC_DESCRIPTIONS: 'formulaic_descriptions' as const,
  INCONSISTENT_TONE: 'inconsistent_tone' as const
};

export const ENHANCEMENT_STRATEGIES = {
  VOCABULARY_ENRICHMENT: 'vocabulary_enrichment' as const,
  STRUCTURAL_VARIATION: 'structural_variation' as const,
  EMOTIONAL_DEEPENING: 'emotional_deepening' as const,
  RHYTHM_OPTIMIZATION: 'rhythm_optimization' as const,
  IMAGERY_ENHANCEMENT: 'imagery_enhancement' as const,
  AUTHENTICITY_IMPROVEMENT: 'authenticity_improvement' as const
};

export const STYLE_DIMENSIONS = {
  FORMALITY: 'formality' as const,
  COMPLEXITY: 'complexity' as const,
  EMOTIONALITY: 'emotionality' as const,
  DESCRIPTIVENESS: 'descriptiveness' as const,
  PACE: 'pace' as const,
  PERSPECTIVE: 'perspective' as const
};