/**
 * ML Training System - Entry Point
 * 
 * ML学習データ収集システムのメインエントリーポイント
 * Version 2.0要件: 学習データ収集・処理・品質管理・モデル訓練支援
 */

// ============================================================================
// システム情報
// ============================================================================

export const ML_TRAINING_SYSTEM_INFO = {
  name: 'ML Training System',
  version: '2.0.0',
  description: 'ML学習データ収集・処理・品質管理・モデル訓練支援を提供するML学習システム',
  features: [
    '包括的データ収集（Comprehensive Data Collection）',
    'インテリジェント前処理（Intelligent Preprocessing）',
    'データ品質管理（Data Quality Management）',
    'バイアス検出・軽減（Bias Detection & Mitigation）',
    'モデル訓練オーケストレーション（Model Training Orchestration）',
    'ハイパーパラメータ最適化（Hyperparameter Optimization）',
    'パイプライン管理（Pipeline Management）',
    'リアルタイム監視（Real-time Monitoring）',
    'パフォーマンス分析（Performance Analysis）',
    '品質保証（Quality Assurance）',
    'データ系譜追跡（Data Lineage Tracking）',
    'プライバシー保護（Privacy Protection）',
    '統計・報告（Statistics & Reporting）',
    '分散処理対応（Distributed Processing）',
    'GPU加速サポート（GPU Acceleration）'
  ],
  capabilities: [
    'エンタープライズ級データ管理',
    'マルチモーダルデータ対応',
    'インテリジェント品質評価',
    'リアルタイムバイアス検出',
    '自動データ拡張',
    'スケーラブル処理アーキテクチャ',
    'MLOps統合サポート',
    'モデル評価・ベンチマーク',
    'データプライバシー準拠',
    'クラウドネイティブ対応'
  ],
  dependencies: [
    'core/infrastructure/logger',
    'types/common'
  ]
} as const;

// ============================================================================
// メインクラスのエクスポート
// ============================================================================

export { MLTrainingManager } from './core/ml-training-manager';

// ============================================================================
// インターフェースのエクスポート
// ============================================================================

export type {
  // メインインターフェース
  IMLTrainingManager,
  IMLDataCollector,
  IMLDataProcessor,
  IMLQualityManager,
  IMLTrainingOrchestrator,

  // データ収集関連
  NovelGenerationParameters,
  NovelDataset,
  CharacterData,
  CharacterDataset,
  PlotData,
  PlotDataset,

  // データ処理関連
  ProcessedDataset,
  DataValidation,
  BiasAnalysis,

  // 訓練関連
  TrainingJobConfig,
  TrainingProgress,

  // 型エイリアス（interfaces.tsから）
  CleanedDataset,
  AugmentationStrategy,
  AugmentedDataset,
  DataGapAnalysis,
  QualityReport,
  HyperparameterConfig,
  OptimizationResult,
  PipelineExecution,
  PipelineHealth,
  PipelineOptimization,
  PerformanceTrend,
  UsagePatternAnalysis
} from './interfaces';

// ============================================================================
// 型定義のエクスポート
// ============================================================================

export type {
  // システム設定
  MLTrainingManagerConfig,
  DataCollectionConfig,
  DataProcessingConfig,
  QualityManagementConfig,
  ModelTrainingConfig,

  // 基本データ型
  TrainingDataset,
  DataCollectionTask,
  ModelTrainingJob,
  TrainingPipeline,
  DataQuality,
  TrainingMetrics,
  TrainingStatistics,
  TrainingReport,

  // データサンプル・特徴
  DataSample,
  DataLabel,
  FeatureDefinition,
  DatasetMetadata,
  DatasetSchema,
  DataLineage,

  // 品質・評価
  QualityDimension,
  QualityIssue,
  QualityRecommendation,

  // 処理・パイプライン
  PipelineStage,
  TrainingConfiguration,
  HyperparameterSet,

  // 注釈・評価
  Annotation,

  // 支援型
  DatasetSize,
  CollectionTarget,
  CollectionParameters,
  TaskProgress,
  ResourceRequirements,
  SampleMetadata,
  FeatureMap,
  SampleQuality
} from './types';

// types.tsのModelEvaluationを明示的にリネーム
export type { ModelEvaluation as ModelEvaluationData } from './types';

// ============================================================================
// 列挙型のエクスポート
// ============================================================================

export {
  // 基本列挙型
  DataType,
  CollectionStrategy,
  TrainingStage,
  QualityLevel,
  CollectionType,
  TaskStatus,
  JobStatus,
  PipelineStatus,

  // ML関連
  MLFramework,
  ModelType,
  FeatureType,

  // 品質関連
  QualityDimensionType,
  QualityIssueType,
  QualityIssueSeverity,

  // パイプライン関連
  StageType,
  OptimizerType,
  LossFunction,

  // プライバシー関連
  PrivacyLevel,
  SensitivityLevel
} from './types';

// ============================================================================
// ファクトリー関数とヘルパー
// ============================================================================

import { MLTrainingManager } from './core/ml-training-manager';
import { MLTrainingManagerConfig, DataType, CollectionStrategy, MLFramework, QualityLevel } from './types';

/**
 * デフォルト設定でML Training Managerを作成
 */
export function createMLTrainingManager(
  config?: Partial<MLTrainingManagerConfig>
): MLTrainingManager {
  return new MLTrainingManager(config);
}

/**
 * 小説生成用に最適化されたML Training Managerを作成
 */
export function createNovelGenerationTrainingManager(
  customConfig?: Partial<MLTrainingManagerConfig>
): MLTrainingManager {
  const defaultConfig: Partial<MLTrainingManagerConfig> = {
    enableDataCollection: true,
    enableDataProcessing: true,
    enableQualityManagement: true,
    enableModelTraining: true,
    enablePipelineExecution: true,
    defaultQualityThreshold: 0.85,
    maxDatasetSize: 500000,
    dataRetentionDays: 180,
    enableAutomaticCleaning: true,
    enableBiasDetection: true,
    enableSyntheticDataGeneration: true,
    realTimeProcessing: false,
    parallelProcessing: true,
    enableGPUAcceleration: true,
    maxConcurrentJobs: 3
  };

  const collectionConfig = {
    enableTextCollection: true,
    enableCharacterCollection: true,
    enablePlotCollection: true,
    enableMetadataCollection: true,
    collectionStrategy: CollectionStrategy.BATCH,
    samplingRate: 1.0,
    qualityFilter: true,
    duplicateDetection: true,
    anonymization: false,
    compressionEnabled: true
  };

  const processingConfig = {
    enablePreprocessing: true,
    enableAugmentation: true,
    enableFeatureExtraction: true,
    enableNormalization: true,
    batchSize: 512,
    maxMemoryUsage: 16384,
    timeoutMs: 600000,
    enableCaching: true,
    cacheSize: 2000
  };

  const qualityConfig = {
    enableQualityAssessment: true,
    enableBiasDetection: true,
    enableDataValidation: true,
    enablePrivacyChecks: false
  };

  const trainingConfig = {
    enableDistributedTraining: false,
    enableHyperparameterOptimization: true,
    enableEarlyStoppingl: true,
    enableModelCheckpointing: true,
    defaultFramework: MLFramework.PYTORCH
  };

  const finalConfig = { ...defaultConfig, ...customConfig };

  return new MLTrainingManager(
    finalConfig,
    collectionConfig,
    processingConfig,
    qualityConfig,
    trainingConfig
  );
}

/**
 * 軽量版ML Training Manager（開発・テスト用）
 */
export function createLightweightTrainingManager(): MLTrainingManager {
  const lightConfig: Partial<MLTrainingManagerConfig> = {
    enableDataCollection: true,
    enableDataProcessing: false,
    enableQualityManagement: false,
    enableModelTraining: false,
    enablePipelineExecution: false,
    defaultQualityThreshold: 0.7,
    maxDatasetSize: 10000,
    dataRetentionDays: 30,
    enableAutomaticCleaning: false,
    enableBiasDetection: false,
    enableSyntheticDataGeneration: false,
    realTimeProcessing: false,
    parallelProcessing: false,
    enableGPUAcceleration: false,
    maxConcurrentJobs: 1
  };

  return new MLTrainingManager(lightConfig);
}

// ============================================================================
// 設定テンプレート
// ============================================================================

/**
 * 開発環境用設定テンプレート
 */
export const DevelopmentConfig: Partial<MLTrainingManagerConfig> = {
  enableDataCollection: true,
  enableDataProcessing: true,
  enableQualityManagement: true,
  enableModelTraining: false,
  enablePipelineExecution: false,
  defaultQualityThreshold: 0.7,
  maxDatasetSize: 50000,
  dataRetentionDays: 30,
  enableAutomaticCleaning: true,
  enableBiasDetection: false,
  enableSyntheticDataGeneration: false,
  realTimeProcessing: false,
  parallelProcessing: true,
  enableGPUAcceleration: false,
  maxConcurrentJobs: 2
};

/**
 * プロダクション環境用設定テンプレート
 */
export const ProductionConfig: Partial<MLTrainingManagerConfig> = {
  enableDataCollection: true,
  enableDataProcessing: true,
  enableQualityManagement: true,
  enableModelTraining: true,
  enablePipelineExecution: true,
  defaultQualityThreshold: 0.9,
  maxDatasetSize: 2000000,
  dataRetentionDays: 365,
  enableAutomaticCleaning: true,
  enableBiasDetection: true,
  enableSyntheticDataGeneration: true,
  realTimeProcessing: true,
  parallelProcessing: true,
  enableGPUAcceleration: true,
  maxConcurrentJobs: 10
};

/**
 * 研究環境用設定テンプレート
 */
export const ResearchConfig: Partial<MLTrainingManagerConfig> = {
  enableDataCollection: true,
  enableDataProcessing: true,
  enableQualityManagement: true,
  enableModelTraining: true,
  enablePipelineExecution: true,
  defaultQualityThreshold: 0.85,
  maxDatasetSize: 1000000,
  dataRetentionDays: 730,
  enableAutomaticCleaning: false,
  enableBiasDetection: true,
  enableSyntheticDataGeneration: true,
  realTimeProcessing: false,
  parallelProcessing: true,
  enableGPUAcceleration: true,
  maxConcurrentJobs: 5
};

// ============================================================================
// ユーティリティ関数
// ============================================================================

import type { TrainingDataset } from './types';
import type { NovelGenerationParameters } from './interfaces';

/**
 * データセット作成のヘルパー関数
 */
export async function createNovelDataset(
  manager: MLTrainingManager,
  name: string,
  novelTexts: string[]
): Promise<TrainingDataset | null> {
  try {
    const result = await manager.createDataset(name, DataType.NOVEL, novelTexts);
    return result.success ? (result.data || null) : null;
  } catch (error) {
    console.error('Failed to create novel dataset:', error);
    return null;
  }
}

/**
 * 小説生成パラメータのバリデーション
 */
export function validateNovelGenerationParameters(
  params: NovelGenerationParameters
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!params.genre || params.genre.trim().length === 0) {
    errors.push('Genre is required');
  }

  if (!params.style || params.style.trim().length === 0) {
    errors.push('Style is required');
  }

  if (params.length <= 0) {
    errors.push('Length must be positive');
  }

  if (!params.themes || params.themes.length === 0) {
    errors.push('At least one theme is required');
  }

  if (params.characters < 0) {
    errors.push('Characters count cannot be negative');
  }

  if (!params.complexity || params.complexity.trim().length === 0) {
    errors.push('Complexity is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 品質レベルを数値スコアに変換
 */
export function qualityLevelToScore(level: QualityLevel): number {
  switch (level) {
    case QualityLevel.POOR: return 0.2;
    case QualityLevel.FAIR: return 0.4;
    case QualityLevel.GOOD: return 0.6;
    case QualityLevel.EXCELLENT: return 0.8;
    case QualityLevel.OUTSTANDING: return 1.0;
    default: return 0.0;
  }
}

/**
 * 数値スコアを品質レベルに変換
 */
export function scoreToQualityLevel(score: number): QualityLevel {
  if (score >= 0.9) return QualityLevel.OUTSTANDING;
  if (score >= 0.7) return QualityLevel.EXCELLENT;
  if (score >= 0.5) return QualityLevel.GOOD;
  if (score >= 0.3) return QualityLevel.FAIR;
  return QualityLevel.POOR;
}

/**
 * システムヘルスチェックのヘルパー
 */
export async function performSystemHealthCheck(
  manager: MLTrainingManager
): Promise<{
  healthy: boolean;
  issues: string[];
  timestamp: string;
  systemId: string;
}> {
  const healthResult = await manager.healthCheck();
  
  return {
    ...healthResult,
    timestamp: new Date().toISOString(),
    systemId: manager.systemId
  };
}

// ============================================================================
// 定数
// ============================================================================

/**
 * システムのデフォルト値
 */
export const ML_TRAINING_DEFAULTS = {
  QUALITY_THRESHOLD: 0.8,
  MAX_DATASET_SIZE: 1000000,
  DATA_RETENTION_DAYS: 365,
  MAX_CONCURRENT_JOBS: 5,
  BATCH_SIZE: 1000,
  TIMEOUT_MS: 300000,
  CACHE_SIZE: 1000
} as const;

/**
 * サポートされるデータ形式
 */
export const SUPPORTED_DATA_FORMATS = [
  'text/plain',
  'application/json',
  'text/csv',
  'application/xml'
] as const;

/**
 * サポートされるMLフレームワーク
 */
export const SUPPORTED_ML_FRAMEWORKS = [
  MLFramework.TENSORFLOW,
  MLFramework.PYTORCH,
  MLFramework.KERAS,
  MLFramework.SCIKIT_LEARN,
  MLFramework.HUGGINGFACE,
  MLFramework.TRANSFORMERS
] as const;

// ============================================================================
// バージョン情報
// ============================================================================

export const VERSION = '2.0.0';
export const BUILD_DATE = new Date().toISOString();

// ============================================================================
// デフォルトエクスポート
// ============================================================================

export default {
  MLTrainingManager,
  createMLTrainingManager,
  createNovelGenerationTrainingManager,
  createLightweightTrainingManager,
  DevelopmentConfig,
  ProductionConfig,
  ResearchConfig,
  VERSION
};