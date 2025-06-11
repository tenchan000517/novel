/**
 * Foreshadowing Management System - Public Interface
 * 
 * 伏線管理システムの公開インターフェース
 * Version 2.0要件: 伏線検出・配置・解決・品質管理
 */

// コアマネージャー（値として）
export { ForeshadowingManager } from './core/foreshadowing-manager';

// インターフェース（型のみ）
export type {
  IForeshadowingManager,
  IForeshadowingDetector,
  IForeshadowingPlacer,
  IForeshadowingResolver,
  IForeshadowingQualityController,
  IForeshadowingLearningEngine,
  PlantedElement,
  EffectivenessAssessment,
  NarrativeStructure,
  ResolutionTracking,
  UnresolvedElement,
  ForeshadowingTimeline,
  TimelineManagement,
  QualityMonitoring,
  ForeshadowingRecommendation,
  StrategyUpdate
} from './interfaces';

// 型定義（インターフェースと型エイリアスのみ - 列挙型は除外）
export type {
  ForeshadowingElement,
  ForeshadowingContext,
  ForeshadowingAnalysis,
  ForeshadowingStrategy,
  ForeshadowingPlacement,
  ForeshadowingResolution,
  ForeshadowingValidation,
  ForeshadowingOptimization,
  ElementLocation,
  ResolutionTarget,
  ElementRelationship,
  ForeshadowingMetadata,
  StructuralAnalysis,
  DensityAnalysis,
  SubtletyAnalysisResult,
  ConsistencyAnalysis,
  EffectivenessAnalysis,
  QualityAssessment,
  ForeshadowingMetrics,
  ForeshadowingStatistics,
  ForeshadowingReport,
  ForeshadowingBenchmark,
  ForeshadowingTrend,
  NarrativeContext,
  GenreContext,
  AudienceContext,
  StyleContext,
  ContextConstraints,
  ForeshadowingObjectives,
  TimePeriod
} from './types';

// 設定型定義とファクトリー関数で使用する型（まとめてインポート）
import type {
  ForeshadowingManagerConfig,
  ForeshadowingDetectionConfig,
  ForeshadowingPlacementConfig,
  ForeshadowingResolutionConfig,
  ForeshadowingQualityConfig,
  ForeshadowingElement,
  ForeshadowingContext,
  ElementLocation,
  ResolutionTarget,
  ForeshadowingMetadata,
  NarrativeContext,
  GenreContext,
  AudienceContext,
  StyleContext,
  ContextConstraints,
  ForeshadowingObjectives
} from './types';

// コアマネージャークラス（値として - ファクトリー関数でのインスタンス作成用）
// 型注釈は TypeScript が自動推論するため、値としてのみインポート
import { ForeshadowingManager } from './core/foreshadowing-manager';

// 列挙型（値として使用）
import {
  ForeshadowingType,
  ForeshadowingComplexity,
  ForeshadowingStyle,
  DetectionDepth,
  SensitivityLevel,
  PlacementStrategy,
  DensityControl,
  SubtletyPreference,
  IntegrationApproach,
  TrackingMode,
  ResolutionStrategy,
  ResolutionType,
  ResolutionState,
  ElementState,
  ImportanceLevel,
  PayoffLevel,
  RelationshipType,
  DependencyType,
  OptimizationType,
  TrendType,
  TrendDirection,
  TrendStrength
} from './types';

// 設定型定義を再エクスポート
export type {
  ForeshadowingManagerConfig,
  ForeshadowingDetectionConfig,
  ForeshadowingPlacementConfig,
  ForeshadowingResolutionConfig,
  ForeshadowingQualityConfig
};

// 列挙型を再エクスポート（値として）
export {
  ForeshadowingType,
  ForeshadowingComplexity,
  ForeshadowingStyle,
  DetectionDepth,
  SensitivityLevel,
  PlacementStrategy,
  DensityControl,
  SubtletyPreference,
  IntegrationApproach,
  TrackingMode,
  ResolutionStrategy,
  ResolutionType,
  ResolutionState,
  ElementState,
  ImportanceLevel,
  PayoffLevel,
  RelationshipType,
  DependencyType,
  OptimizationType,
  TrendType,
  TrendDirection,
  TrendStrength
};

// デフォルトコンフィグ（型安全な設定）
export const DEFAULT_FORESHADOWING_CONFIG: Partial<ForeshadowingManagerConfig> = {
  enableForeshadowingDetection: true,
  enableAutomaticPlacement: true,
  enableResolutionTracking: true,
  enableQualityMonitoring: true,
  enableLearning: true,
  defaultComplexityLevel: ForeshadowingComplexity.MODERATE,
  subtletyThreshold: 0.7,
  resolutionTimeout: 10,
  qualityThreshold: 0.8,
  realTimeAnalysis: false,
  cacheResults: true,
  batchProcessing: false,
  parallelAnalysis: true
};

export const DEFAULT_DETECTION_CONFIG: Partial<ForeshadowingDetectionConfig> = {
  detectionDepth: DetectionDepth.STANDARD,
  includeImplicitElements: true,
  detectSymbolicContent: true,
  analyzeThematicElements: true,
  trackCharacterHints: true,
  identifyRecurringMotifs: true,
  sensitivityLevel: SensitivityLevel.MEDIUM,
  confidenceThreshold: 0.7
};

export const DEFAULT_PLACEMENT_CONFIG: Partial<ForeshadowingPlacementConfig> = {
  placementStrategy: PlacementStrategy.ORGANIC,
  densityControl: DensityControl.MODERATE,
  subtletyPreference: SubtletyPreference.BALANCED,
  integrationApproach: IntegrationApproach.NATURAL,
  timingOptimization: true,
  conflictAvoidance: true,
  narrativeFlow: true,
  readerEngagement: true
};

export const DEFAULT_RESOLUTION_CONFIG: Partial<ForeshadowingResolutionConfig> = {
  trackingMode: TrackingMode.ACTIVE,
  resolutionStrategy: ResolutionStrategy.GRADUAL,
  satisfactionCriteria: {} as any,
  payoffOptimization: true,
  consistencyValidation: true,
  timeoutHandling: true,
  qualityAssurance: true,
  readerFeedback: true
};

export const DEFAULT_QUALITY_CONFIG: Partial<ForeshadowingQualityConfig> = {
  qualityStandards: {} as any,
  evaluationCriteria: {} as any,
  balanceRequirements: {} as any,
  integrationRequirements: {} as any,
  effectivenessMetrics: {} as any,
  benchmarkComparison: true,
  continuousMonitoring: false,
  automaticOptimization: false
};

// ファクトリー関数（型安全）
export function createForeshadowingManager(
  config?: Partial<ForeshadowingManagerConfig>,
  detectionConfig?: Partial<ForeshadowingDetectionConfig>,
  placementConfig?: Partial<ForeshadowingPlacementConfig>,
  resolutionConfig?: Partial<ForeshadowingResolutionConfig>,
  qualityConfig?: Partial<ForeshadowingQualityConfig>
): ForeshadowingManager {
  return new ForeshadowingManager(
    { ...DEFAULT_FORESHADOWING_CONFIG, ...config },
    { ...DEFAULT_DETECTION_CONFIG, ...detectionConfig },
    { ...DEFAULT_PLACEMENT_CONFIG, ...placementConfig },
    { ...DEFAULT_RESOLUTION_CONFIG, ...resolutionConfig },
    { ...DEFAULT_QUALITY_CONFIG, ...qualityConfig }
  );
}

// ユーティリティ関数

/**
 * 伏線コンテキストを作成
 */
export function createForeshadowingContext(
  narrative: NarrativeContext,
  genre: GenreContext,
  audience: AudienceContext,
  options?: Partial<ForeshadowingContext>
): ForeshadowingContext {
  return {
    narrative,
    genre,
    audience,
    style: {} as StyleContext,
    constraints: {} as ContextConstraints,
    objectives: {} as ForeshadowingObjectives,
    ...options
  };
}

/**
 * 伏線要素を作成
 */
export function createForeshadowingElement(
  type: ForeshadowingType,
  content: string,
  location: ElementLocation,
  options?: Partial<ForeshadowingElement>
): ForeshadowingElement {
  return {
    id: `element-${type}-${Date.now()}`,
    type,
    content,
    location,
    targetResolution: {} as ResolutionTarget,
    plantingChapter: 1,
    subtletyLevel: 0.7,
    importance: ImportanceLevel.MODERATE,
    confidence: 0.8,
    state: ElementState.PLANTED,
    relationships: [],
    metadata: {} as ForeshadowingMetadata,
    timestamp: new Date(),
    ...options
  };
}

/**
 * 配置戦略を作成
 */
export function createPlacementStrategy(
  approach: PlacementStrategy,
  options?: {
    densityTarget?: number;
    subtletyLevel?: number;
    integrationMode?: string;
    timingPreference?: string;
    [key: string]: any;
  }
): {
  approach: PlacementStrategy;
  densityTarget: number;
  subtletyLevel: number;
  integrationMode: string;
  timingPreference: string;
  [key: string]: any;
} {
  return {
    approach,
    densityTarget: 0.5,
    subtletyLevel: 0.7,
    integrationMode: 'natural',
    timingPreference: 'optimal',
    ...options
  };
}

/**
 * 解決計画を作成
 */
export function createResolutionPlan(
  elements: string[],
  strategy: ResolutionStrategy,
  options?: {
    timeline?: any;
    payoffLevel?: PayoffLevel;
    satisfactionGoal?: number;
    [key: string]: any;
  }
): {
  targetElements: string[];
  strategy: ResolutionStrategy;
  timeline: any;
  payoffLevel: PayoffLevel;
  satisfactionGoal: number;
  [key: string]: any;
} {
  return {
    targetElements: elements,
    strategy,
    timeline: {},
    payoffLevel: PayoffLevel.HIGH,
    satisfactionGoal: 0.9,
    ...options
  };
}

// 定数とヘルパー
export const FORESHADOWING_EVENTS = {
  ELEMENT_DETECTED: 'element_detected',
  ELEMENT_PLACED: 'element_placed',
  ELEMENT_RESOLVED: 'element_resolved',
  STRATEGY_GENERATED: 'strategy_generated',
  QUALITY_ASSESSED: 'quality_assessed',
  TIMELINE_UPDATED: 'timeline_updated',
  RECOMMENDATIONS_GENERATED: 'recommendations_generated',
  TRENDS_TRACKED: 'trends_tracked',
  BENCHMARK_COMPLETED: 'benchmark_completed',
  REPORT_GENERATED: 'report_generated'
} as const;

export const SUBTLETY_THRESHOLDS = {
  VERY_SUBTLE: 0.9,
  SUBTLE: 0.7,
  BALANCED: 0.5,
  NOTICEABLE: 0.3,
  OBVIOUS: 0.1
} as const;

export const QUALITY_THRESHOLDS = {
  MINIMUM: 0.6,
  ACCEPTABLE: 0.7,
  GOOD: 0.8,
  EXCELLENT: 0.9,
  MASTERFUL: 0.95
} as const;

export const DENSITY_LEVELS = {
  MINIMAL: 0.2,
  SPARSE: 0.4,
  MODERATE: 0.6,
  DENSE: 0.8,
  MAXIMUM: 1.0
} as const;

export const RESOLUTION_TIMEOUTS = {
  SHORT: 3,
  MEDIUM: 7,
  LONG: 15,
  EXTENDED: 30
} as const;

export const CONFIDENCE_THRESHOLDS = {
  LOW: 0.5,
  MODERATE: 0.7,
  HIGH: 0.85,
  VERY_HIGH: 0.95
} as const;

// システム情報
export const FORESHADOWING_SYSTEM_INFO = {
  name: 'Foreshadowing Management System',
  version: '2.0.0',
  description: '伏線検出・配置・解決・品質管理を提供する伏線管理システム',
  features: [
    '伏線自動検出（Foreshadowing Detection）',
    '構造分析（Structure Analysis）',
    '密度分析（Density Analysis）',
    '微妙さ分析（Subtlety Analysis）',
    '戦略生成（Strategy Generation）',
    '自動配置（Automatic Placement）',
    '解決追跡（Resolution Tracking）',
    '一貫性検証（Consistency Validation）',
    'タイムライン管理（Timeline Management）',
    '品質監視（Quality Monitoring）',
    'ベンチマーク比較（Benchmark Comparison）',
    'トレンド追跡（Trend Tracking）',
    '推奨事項生成（Recommendations Generation）',
    '統計・報告（Statistics & Reporting）',
    '学習機能（Learning Engine）'
  ],
  capabilities: [
    'プロフェッショナル品質の伏線管理',
    'インテリジェント検出システム',
    '戦略的配置最適化',
    'リアルタイム品質監視',
    '解決タイミング最適化',
    'ジャンル適応機能',
    'オーディエンス配慮',
    '微妙さレベル制御',
    '効果性評価',
    'パフォーマンス追跡'
  ],
  dependencies: [
    'core/infrastructure/logger',
    'types/common'
  ]
} as const;

// 伏線タイプ定数（型安全な配列）
export const BASIC_TYPES: readonly ForeshadowingType[] = [
  ForeshadowingType.PLOT_FORESHADOWING,
  ForeshadowingType.CHARACTER_FORESHADOWING,
  ForeshadowingType.THEMATIC_FORESHADOWING,
  ForeshadowingType.SYMBOLIC_FORESHADOWING
] as const;

export const TECHNIQUE_TYPES: readonly ForeshadowingType[] = [
  ForeshadowingType.DIRECT_STATEMENT,
  ForeshadowingType.INDIRECT_HINT,
  ForeshadowingType.SYMBOLIC_REFERENCE,
  ForeshadowingType.DIALOGUE_HINT,
  ForeshadowingType.DESCRIPTION_CLUE,
  ForeshadowingType.ACTION_FORESHADOWING
] as const;

export const ADVANCED_TYPES: readonly ForeshadowingType[] = [
  ForeshadowingType.LAYERED_FORESHADOWING,
  ForeshadowingType.RECURSIVE_FORESHADOWING,
  ForeshadowingType.MISDIRECTION,
  ForeshadowingType.RED_HERRING
] as const;

// ヘルパー関数（型安全）
export function getForeshadowingCategory(type: ForeshadowingType): 'Basic' | 'Technique' | 'Advanced' | 'Other' {
  if (BASIC_TYPES.includes(type)) return 'Basic';
  if (TECHNIQUE_TYPES.includes(type)) return 'Technique';
  if (ADVANCED_TYPES.includes(type)) return 'Advanced';
  return 'Other';
}

export function calculateComplexityLevel(characteristics: {
  layers?: number;
  symbols?: number;
  connections?: number;
  [key: string]: any;
}): ForeshadowingComplexity {
  // 実装スタブ - 基本的な複雑度計算
  const totalComplexity = (characteristics.layers || 0) + 
                         (characteristics.symbols || 0) + 
                         (characteristics.connections || 0);
  
  if (totalComplexity > 10) return ForeshadowingComplexity.MASTERFUL;
  if (totalComplexity > 7) return ForeshadowingComplexity.HIGHLY_COMPLEX;
  if (totalComplexity > 4) return ForeshadowingComplexity.COMPLEX;
  if (totalComplexity > 2) return ForeshadowingComplexity.MODERATE;
  return ForeshadowingComplexity.SIMPLE;
}

export function determineSubtletyLevel(score: number): 'Very Subtle' | 'Subtle' | 'Balanced' | 'Noticeable' | 'Obvious' {
  if (score >= SUBTLETY_THRESHOLDS.VERY_SUBTLE) return 'Very Subtle';
  if (score >= SUBTLETY_THRESHOLDS.SUBTLE) return 'Subtle';
  if (score >= SUBTLETY_THRESHOLDS.BALANCED) return 'Balanced';
  if (score >= SUBTLETY_THRESHOLDS.NOTICEABLE) return 'Noticeable';
  return 'Obvious';
}

export function assessQualityLevel(score: number): 'Masterful' | 'Excellent' | 'Good' | 'Acceptable' | 'Needs Improvement' {
  if (score >= QUALITY_THRESHOLDS.MASTERFUL) return 'Masterful';
  if (score >= QUALITY_THRESHOLDS.EXCELLENT) return 'Excellent';
  if (score >= QUALITY_THRESHOLDS.GOOD) return 'Good';
  if (score >= QUALITY_THRESHOLDS.ACCEPTABLE) return 'Acceptable';
  return 'Needs Improvement';
}

export function getDensityDescription(level: number): 'Maximum Density' | 'Dense' | 'Moderate' | 'Sparse' | 'Minimal' {
  if (level >= DENSITY_LEVELS.MAXIMUM) return 'Maximum Density';
  if (level >= DENSITY_LEVELS.DENSE) return 'Dense';
  if (level >= DENSITY_LEVELS.MODERATE) return 'Moderate';
  if (level >= DENSITY_LEVELS.SPARSE) return 'Sparse';
  return 'Minimal';
}

export function getConfidenceDescription(score: number): 'Very High' | 'High' | 'Moderate' | 'Low' {
  if (score >= CONFIDENCE_THRESHOLDS.VERY_HIGH) return 'Very High';
  if (score >= CONFIDENCE_THRESHOLDS.HIGH) return 'High';
  if (score >= CONFIDENCE_THRESHOLDS.MODERATE) return 'Moderate';
  return 'Low';
}