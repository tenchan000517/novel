/**
 * Version 2.0 - Context Generation Types
 * 
 * コンテキスト生成の基本データ型・構造定義
 * ベストプラクティス: データ型のみ、インターフェースは interfaces.ts
 */

import { OperationResult } from '@/types/common';

// ============================================================================
// 基本列挙型
// ============================================================================

export enum SystemType {
  MEMORY = 'memory',
  CHARACTER = 'character', 
  PLOT = 'plot',
  LEARNING = 'learning',
  WORLD = 'world',
  THEME = 'theme',
  ANALYSIS = 'analysis',
  QUALITY = 'quality',
  FORESHADOWING = 'foreshadowing',
  EXPRESSION = 'expression'
}

export enum ContextPriority {
  ESSENTIAL = 'essential',
  STANDARD = 'standard', 
  COMPREHENSIVE = 'comprehensive',
  EXPERIMENTAL = 'experimental'
}

export enum OptimizationLevel {
  NONE = 'none',
  BASIC = 'basic',
  ADVANCED = 'advanced',
  MAXIMUM = 'maximum'
}

// ============================================================================
// システムデータ型
// ============================================================================

export interface SystemData {
  systemType: SystemType;
  relevanceScore?: number;
  lastUpdated: string;
  data: any;
  metadata: {
    source: string;
    version: string;
    timestamp: string;
    dataSize: number;
  };
  quality: {
    score: number;
    validation: string;
    completeness: number;
    accuracy: number;
  };
}

export interface SystemDataCollection {
  systems: SystemType[];
  data: Map<SystemType, SystemData>;
  metadata: {
    collectionTimestamp: Date;
    totalSystems: number;
    performance: {
      totalTime: number;
      systemTimes?: Map<SystemType, number>; // オプショナルに変更
      memoryUsage: number;
      errorCount: number;
    };
  };
  mergeMetadata?: {
    mergeStrategy: string;
    conflictResolution: string;
    mergeTimestamp: Date;
    sourceSystemCount: number;
    conflictsResolved: number;
    dataIntegrity: any;
    metrics: any;
  };
}

export interface SystemDataWithPriority extends SystemData {
  priority: number;
  priorityFactors: {
    relevance: number;
    recency: number;
    importance: number;
    context: number;
  };
  reliability?: number; // 追加
}

// ============================================================================
// バリデーション・フィルタリング型
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
  details: any;
  issues: string[];
  recommendations: string[];
}

export interface FilteredData {
  systemType: SystemType;
  items: SystemData[];
  averageRelevance: number;
  totalItems: number;
  filteredItems: number;
  totalCount: number;
  timestamp: string;
  criteria: RelevanceCriteria;
  essential: SystemData[];
  important: SystemData[];
  supplementary: SystemData[];
  excluded: SystemData[];
  filteringMetrics: {
    totalItems: number;
    essentialCount: number;
    importantCount: number;
    supplementaryCount: number;
    excludedCount: number;
    averageRelevance: number;
  };
  filterCriteria?: any;
  metadata?: {
    filteredAt: Date;
    filteringMethod: string;
    retentionRate: number;
  };
}

export interface RelevanceCriteria {
  chapterNumber: number;
  contextPriority?: ContextPriority;
  minimumRelevanceScore: number;
  minRelevanceScore?: number;
  maxRelevance?: number;
  minRelevance?: number;
  maxItems?: number;
  prioritySystems?: SystemType[];
  focusElements?: string[];
  requiredSystems: SystemType[];
  excludedDataTypes: string[];
  includeMetadata?: boolean;
}

// ============================================================================
// 生成コンテキスト型
// ============================================================================

export interface GenerationContext {
  chapterNumber: number;
  systemData: SystemDataCollection;
  contextHierarchy: ContextHierarchy;
  metadata: ContextMetadata;
  statistics: ContextStatistics;
  focusCharacters?: string[];
}

export interface ContextHierarchy {
  essential: EssentialContext;
  important: ImportantContext;
  supplementary: SupplementaryContext;
  background: BackgroundContext;
}

export interface EssentialContext {
  memory: any;
  character: any;
  plot: any;
}

export interface ImportantContext {
  learning: any;
  world: any;
}

export interface SupplementaryContext {
  themes: any;
  additional: any;
}

export interface BackgroundContext {
  historical: any;
  environmental: any;
  cultural: any;
}

// ============================================================================
// メタデータ・統計型
// ============================================================================

export interface ContextMetadata {
  generationId?: string;
  generationTimestamp?: string;
  processingDuration?: number;
  sourceOptions?: any;
  optimizationApplied?: boolean;
  version?: string;
  timestamp?: Date;
  contextPriority?: ContextPriority;
  optimizationLevel?: OptimizationLevel;
  dataSourceVersions?: DataSourceVersion[];
  optimizationsApplied?: OptimizationApplied[];
  qualityChecks?: QualityCheck[];
  relevanceDistribution?: RelevanceDistribution;
  totalDataSize?: number;
  compressionRatio?: number;
  generationTime?: number;
  cacheHitRate?: number;
  qualityMetrics?: {
    completeness: number;
    relevance: number;
    freshness: number;
    consistency: number;
  };
}

export interface ContextStatistics {
  totalDataSize: number;
  systemCoverage: {
    memory: number;
    character: number;
    plot: number;
    learning: number;
    world: number;
    theme: number;
  };
  qualityMetrics: {
    relevance: number;
    completeness: number;
    consistency: number;
    freshness: number;
    accuracy: number;
    coherence: number;
  };
  performance: PerformanceMetrics;
}

// ============================================================================
// パフォーマンス・品質型
// ============================================================================

export interface PerformanceMetrics {
  processingTime?: number;
  generationTime?: number;
  memoryUsage: number;
  cacheHitRate: number;
  errorRate?: number;
  throughput?: number;
  systemLatencies?: Map<SystemType, number>;
  optimizationEfficiency?: number;
}

export interface DataSourceVersion {
  systemType: SystemType;
  version: string;
  lastModified: string;
  dataIntegrity: number;
}

export interface OptimizationApplied {
  type: string;
  level: OptimizationLevel;
  effect: string;
  performance: number;
}

export interface QualityCheck {
  checkType: string;
  result: 'passed' | 'warning' | 'failed';
  details: string;
  impact: number;
}

export interface RelevanceDistribution {
  essential: number;
  important: number;
  supplementary: number;
  background: number;
}

// ============================================================================
// 優先度・スコア型
// ============================================================================

export interface PriorityScore {
  systemType: SystemType;
  score: number;
  relevanceScore?: number;
  importanceScore?: number;
  urgencyScore?: number;
  overallPriority?: number;
  confidence?: number;
  factors: {
    relevance: number;
    recency: number;
    importance: number;
    context: number;
  };
  timestamp?: string;
  lastCalculated?: Date;
  context?: any;
}

// ============================================================================
// データ統合・マージ型
// ============================================================================

export interface DataConflict {
  id: string;
  field: string;
  values: any[];
  conflictType: string;
  affectedSystems: SystemType[];
  description: string;
  severity: string;
  resolution: string;
}

export interface ConflictResolution {
  conflictId: string;
  field: string;
  resolvedValue: any;
  strategy: string;
  confidence: number;
  reasoning: string;
  appliedAt?: string;
}

// ============================================================================
// 整合性・一貫性型
// ============================================================================

export interface ConsistencyResult {
  success: boolean;
  data: {
    overallConsistency: number;
    systemConsistencies: Array<{
      systemType: SystemType;
      consistency: number;
    }>;
    inconsistencies: any[];
    recommendations: any[];
  };
  error?: any;
}

// ============================================================================
// 最適化型
// ============================================================================

export interface OptimizedContext extends GenerationContext {
  originalContext?: GenerationContext;
  optimizedData?: GenerationContext;
  optimizations?: OptimizationApplied[];
  compressionRatio?: number;
  performanceGain?: number;
  optimizationMetrics?: {
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
    qualityRetention: number;
  };
  optimizationLog?: Array<{
    step: string;
    technique: string;
    impact: {
      sizeReduction: number;
      qualityImpact: number;
    };
    duration: number;
  }>;
}

// ============================================================================
// オプション・設定型
// ============================================================================

export interface ContextOptions {
  chapterNumber?: number;
  targetLength?: number;
  priority: ContextPriority;
  includeSystemTypes: SystemType[];
  maxDataSize?: number;
  optimizationLevel?: OptimizationLevel;
  focusElements?: string[];
}

export interface CollectionOptions {
  priority: number;
  timeout: number;
  cacheEnabled: boolean;
  validationLevel: string;
  optimizationLevel: string;
}

// ============================================================================
// クエリ・実行型
// ============================================================================

export interface DataQuery {
  id: string;
  systemType: SystemType;
  chapterNumber: number;
  parameters: any;
  priority: number;
  timeout: number;
}

export interface CoordinatedQueries {
  queries: DataQuery[];
  dependencies: QueryDependency[];
  executionPlan: ExecutionPlan;
  estimatedTime: number;
}

export interface QueryDependency {
  sourceQuery: string;
  targetQuery: string;
  dependencyType: string;
}

export interface ExecutionPlan {
  phases: ExecutionPhase[];
  parallelismLevel: number;
  estimatedDuration: number;
}

export interface ExecutionPhase {
  phaseId: string;
  queries: string[];
  canExecuteInParallel: boolean;
  estimatedTime: number;
}

// ============================================================================
// メトリクス・統計型
// ============================================================================

export interface CollectionMetrics {
  collectionTime: number;
  dataSize: number;
  cacheHitRate: number;
  errorCount: number;
  qualityScore: number;
}

// ============================================================================
// システム別データ型（詳細実装時に拡張）
// ============================================================================

export interface MemoryData { [key: string]: any; }
export interface CharacterData { [key: string]: any; }
export interface PlotData { [key: string]: any; }
export interface LearningData { [key: string]: any; }
export interface WorldData { [key: string]: any; }
export interface ThemeData { [key: string]: any; }
export interface AnalysisData { [key: string]: any; }

// ============================================================================
// 型ユニオン（利便性のため）
// ============================================================================

export type ContextElement = EssentialContext | ImportantContext | SupplementaryContext | BackgroundContext;
export type SystemDataTypes = MemoryData | CharacterData | PlotData | LearningData | WorldData | ThemeData | AnalysisData;
export type ContextDataTypes = GenerationContext | OptimizedContext | FilteredData;
export type ValidationTypes = ValidationResult | ConsistencyResult;