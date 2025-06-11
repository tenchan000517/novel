/**
 * ML Training System Interfaces
 * 
 * ML学習データ収集システムのインターフェース定義
 * Version 2.0要件: 学習データ収集・処理・品質管理・モデル訓練支援
 */

import type { OperationResult, SystemId } from '@/types/common';
import type {
  MLTrainingManagerConfig,
  TrainingDataset,
  DataCollectionTask,
  ModelTrainingJob,
  TrainingPipeline,
  DataQuality,
  TrainingMetrics,
  TrainingStatistics,
  TrainingReport,
  DataType,
  CollectionStrategy,
  TrainingStage,
  QualityLevel,
  TimePeriod
} from './types';

// ============================================================================
// メインML学習マネージャーインターフェース
// ============================================================================

export interface IMLTrainingManager {
  readonly systemId: SystemId;

  // データ収集
  collectTrainingData(task: DataCollectionTask): Promise<OperationResult<TrainingDataset>>;
  collectNovelGenerationData(parameters: NovelGenerationParameters): Promise<OperationResult<NovelDataset>>;
  collectCharacterAnalysisData(characters: CharacterData[]): Promise<OperationResult<CharacterDataset>>;
  collectPlotAnalysisData(plots: PlotData[]): Promise<OperationResult<PlotDataset>>;

  // データ処理・前処理
  preprocessTrainingData(dataset: TrainingDataset): Promise<OperationResult<ProcessedDataset>>;
  cleanTrainingData(dataset: TrainingDataset): Promise<OperationResult<CleanedDataset>>;
  validateTrainingData(dataset: TrainingDataset): Promise<OperationResult<DataValidation>>;
  augmentTrainingData(dataset: TrainingDataset, strategy: AugmentationStrategy): Promise<OperationResult<AugmentedDataset>>;

  // データセット管理
  createDataset(name: string, type: DataType, data: any[]): Promise<OperationResult<TrainingDataset>>;
  getDataset(datasetId: string): Promise<OperationResult<TrainingDataset>>;
  updateDataset(datasetId: string, updates: Partial<TrainingDataset>): Promise<OperationResult<TrainingDataset>>;
  deleteDataset(datasetId: string): Promise<OperationResult<void>>;

  // データ品質管理
  assessDataQuality(dataset: TrainingDataset): Promise<OperationResult<DataQuality>>;
  detectDataBias(dataset: TrainingDataset): Promise<OperationResult<BiasAnalysis>>;
  identifyDataGaps(dataset: TrainingDataset): Promise<OperationResult<DataGapAnalysis>>;
  generateQualityReport(dataset: TrainingDataset): Promise<OperationResult<QualityReport>>;

  // モデル訓練支援
  createTrainingJob(config: TrainingJobConfig): Promise<OperationResult<ModelTrainingJob>>;
  monitorTrainingProgress(jobId: string): Promise<OperationResult<TrainingProgress>>;
  evaluateModelPerformance(jobId: string, testData: TrainingDataset): Promise<OperationResult<ModelEvaluation>>;
  optimizeHyperparameters(config: HyperparameterConfig): Promise<OperationResult<OptimizationResult>>;

  // パイプライン管理
  createTrainingPipeline(pipeline: TrainingPipeline): Promise<OperationResult<TrainingPipeline>>;
  executeTrainingPipeline(pipelineId: string): Promise<OperationResult<PipelineExecution>>;
  monitorPipelineHealth(pipelineId: string): Promise<OperationResult<PipelineHealth>>;
  optimizePipelinePerformance(pipelineId: string): Promise<OperationResult<PipelineOptimization>>;

  // 統計・報告
  getTrainingStatistics(): Promise<OperationResult<TrainingStatistics>>;
  generateTrainingReport(period: TimePeriod): Promise<OperationResult<TrainingReport>>;
  trackModelPerformanceTrends(): Promise<OperationResult<PerformanceTrend[]>>;
  analyzeDataUsagePatterns(): Promise<OperationResult<UsagePatternAnalysis>>;

  // システム管理
  healthCheck(): Promise<{ healthy: boolean; issues: string[] }>;
}

// ============================================================================
// データ収集インターフェース
// ============================================================================

export interface IMLDataCollector {
  // 基本データ収集
  collectNovelText(sources: TextSource[]): Promise<OperationResult<TextDataCollection>>;
  collectCharacterProfiles(characters: any[]): Promise<OperationResult<CharacterDataCollection>>;
  collectPlotStructures(plots: any[]): Promise<OperationResult<PlotDataCollection>>;
  collectStyleSamples(styles: StyleSample[]): Promise<OperationResult<StyleDataCollection>>;

  // 構造化データ収集
  extractNovelFeatures(content: string): Promise<OperationResult<NovelFeatures>>;
  extractCharacterRelationships(characters: any[]): Promise<OperationResult<RelationshipGraph>>;
  extractPlotProgression(plot: any): Promise<OperationResult<PlotProgression>>;
  extractThematicElements(content: string): Promise<OperationResult<ThematicData>>;

  // メタデータ収集
  collectGenerationMetadata(session: GenerationSession): Promise<OperationResult<GenerationMetadata>>;
  collectUserFeedback(feedback: UserFeedback[]): Promise<OperationResult<FeedbackData>>;
  collectQualityMetrics(evaluations: QualityEvaluation[]): Promise<OperationResult<QualityMetricsData>>;
  collectPerformanceData(metrics: PerformanceMetrics[]): Promise<OperationResult<PerformanceData>>;
}

// ============================================================================
// データ処理インターフェース
// ============================================================================

export interface IMLDataProcessor {
  // データ変換
  transformTextData(data: TextData[]): Promise<OperationResult<TransformedTextData[]>>;
  normalizeFeatureVectors(vectors: FeatureVector[]): Promise<OperationResult<NormalizedVectors>>;
  encodeCategorialData(data: CategoricalData[]): Promise<OperationResult<EncodedData>>;
  tokenizeTextContent(content: string[]): Promise<OperationResult<TokenizedContent>>;

  // データ拡張
  augmentTextData(data: TextData[], strategy: TextAugmentationStrategy): Promise<OperationResult<AugmentedTextData>>;
  generateSyntheticSamples(dataset: TrainingDataset, count: number): Promise<OperationResult<SyntheticData>>;
  balanceDatasetClasses(dataset: TrainingDataset): Promise<OperationResult<BalancedDataset>>;
  crossValidateSplit(dataset: TrainingDataset, folds: number): Promise<OperationResult<CrossValidationSplit>>;

  // 特徴量工学
  extractTextFeatures(content: string[]): Promise<OperationResult<TextFeatures>>;
  selectOptimalFeatures(features: FeatureMatrix): Promise<OperationResult<SelectedFeatures>>;
  reduceDimensionality(data: HighDimensionalData): Promise<OperationResult<ReducedDimensionalData>>;
  createFeaturePipeline(config: FeaturePipelineConfig): Promise<OperationResult<FeaturePipeline>>;
}

// ============================================================================
// 品質管理インターフェース
// ============================================================================

export interface IMLQualityManager {
  // データ品質評価
  evaluateDataCompleteness(dataset: TrainingDataset): Promise<OperationResult<CompletenessAssessment>>;
  evaluateDataAccuracy(dataset: TrainingDataset): Promise<OperationResult<AccuracyAssessment>>;
  evaluateDataConsistency(dataset: TrainingDataset): Promise<OperationResult<ConsistencyAssessment>>;
  evaluateDataRelevance(dataset: TrainingDataset): Promise<OperationResult<RelevanceAssessment>>;

  // バイアス検出・修正
  detectSamplingBias(dataset: TrainingDataset): Promise<OperationResult<SamplingBiasAnalysis>>;
  detectSelectionBias(dataset: TrainingDataset): Promise<OperationResult<SelectionBiasAnalysis>>;
  detectConfirmationBias(dataset: TrainingDataset): Promise<OperationResult<ConfirmationBiasAnalysis>>;
  mitigateBias(dataset: TrainingDataset, biasType: BiasType): Promise<OperationResult<BiasmitigatedDataset>>;

  // 品質保証
  implementQualityGates(dataset: TrainingDataset): Promise<OperationResult<QualityGateResult>>;
  enforceDataStandards(dataset: TrainingDataset): Promise<OperationResult<StandardsCompliance>>;
  validateAnnotationQuality(annotations: Annotation[]): Promise<OperationResult<AnnotationQuality>>;
  ensureDataPrivacy(dataset: TrainingDataset): Promise<OperationResult<PrivacyCompliance>>;
}

// ============================================================================
// モデル訓練支援インターフェース
// ============================================================================

export interface IMLTrainingOrchestrator {
  // 訓練ジョブ管理
  scheduleTrainingJob(config: TrainingJobConfig): Promise<OperationResult<ScheduledJob>>;
  executeTrainingJob(jobId: string): Promise<OperationResult<JobExecution>>;
  pauseTrainingJob(jobId: string): Promise<OperationResult<JobPause>>;
  resumeTrainingJob(jobId: string): Promise<OperationResult<JobResume>>;
  cancelTrainingJob(jobId: string): Promise<OperationResult<JobCancellation>>;

  // ハイパーパラメータ最適化
  optimizeLearningRate(config: LearningRateConfig): Promise<OperationResult<OptimalLearningRate>>;
  optimizeBatchSize(config: BatchSizeConfig): Promise<OperationResult<OptimalBatchSize>>;
  optimizeArchitecture(config: ArchitectureConfig): Promise<OperationResult<OptimalArchitecture>>;
  performGridSearch(searchSpace: SearchSpace): Promise<OperationResult<GridSearchResult>>;

  // モデル評価
  evaluateModelAccuracy(model: TrainedModel, testData: TrainingDataset): Promise<OperationResult<AccuracyMetrics>>;
  evaluateModelGeneralization(model: TrainedModel, validationData: TrainingDataset): Promise<OperationResult<GeneralizationMetrics>>;
  benchmarkModelPerformance(model: TrainedModel, benchmarks: Benchmark[]): Promise<OperationResult<BenchmarkResults>>;
  compareModelVariants(models: TrainedModel[]): Promise<OperationResult<ModelComparison>>;
}

// ============================================================================
// 支援型定義
// ============================================================================

export interface NovelGenerationParameters {
  genre: string;
  style: string;
  length: number;
  themes: string[];
  characters: number;
  complexity: string;
}

export interface NovelDataset {
  novels: NovelData[];
  metadata: NovelDatasetMetadata;
  statistics: NovelDatasetStatistics;
}

export interface CharacterData {
  characterId: string;
  profile: any;
  relationships: any[];
  development: any;
}

export interface CharacterDataset {
  characters: CharacterData[];
  relationships: RelationshipData[];
  archetypes: ArchetypeData[];
  metadata: CharacterDatasetMetadata;
}

export interface PlotData {
  plotId: string;
  structure: any;
  elements: any[];
  progression: any;
}

export interface PlotDataset {
  plots: PlotData[];
  structures: PlotStructure[];
  patterns: PlotPattern[];
  metadata: PlotDatasetMetadata;
}

export interface ProcessedDataset {
  originalDataset: TrainingDataset;
  processedData: any[];
  transformations: Transformation[];
  metadata: ProcessingMetadata;
}

export interface DataValidation {
  isValid: boolean;
  validationResults: ValidationResult[];
  errors: ValidationError[];
  warnings: ValidationWarning[];
  recommendations: ValidationRecommendation[];
  validatedAt: Date;
}

export interface BiasAnalysis {
  biasTypes: BiasType[];
  severityScores: Map<BiasType, number>;
  affectedFeatures: string[];
  mitigationStrategies: BiasmitigationStrategy[];
  confidence: number;
}

export interface TrainingJobConfig {
  datasetId: string;
  modelType: ModelType;
  hyperparameters: HyperparameterSet;
  evaluationMetrics: EvaluationMetric[];
  resourceRequirements: ResourceRequirements;
}

export interface TrainingProgress {
  jobId: string;
  stage: TrainingStage;
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  metrics: TrainingMetrics;
  estimatedTimeRemaining: number;
}

// 型エイリアス（詳細実装用）
export type CleanedDataset = any;
export type AugmentationStrategy = any;
export type AugmentedDataset = any;
export type DataGapAnalysis = any;
export type QualityReport = any;
export type ModelEvaluation = any;
export type HyperparameterConfig = any;
export type OptimizationResult = any;
export type PipelineExecution = any;
export type PipelineHealth = any;
export type PipelineOptimization = any;
export type PerformanceTrend = any;
export type UsagePatternAnalysis = any;
export type TextSource = any;
export type TextDataCollection = any;
export type CharacterDataCollection = any;
export type PlotDataCollection = any;
export type StyleSample = any;
export type StyleDataCollection = any;
export type NovelFeatures = any;
export type RelationshipGraph = any;
export type PlotProgression = any;
export type ThematicData = any;
export type GenerationSession = any;
export type GenerationMetadata = any;
export type UserFeedback = any;
export type FeedbackData = any;
export type QualityEvaluation = any;
export type QualityMetricsData = any;
export type PerformanceMetrics = any;
export type PerformanceData = any;
export type TextData = any;
export type TransformedTextData = any;
export type FeatureVector = any;
export type NormalizedVectors = any;
export type CategoricalData = any;
export type EncodedData = any;
export type TokenizedContent = any;
export type TextAugmentationStrategy = any;
export type AugmentedTextData = any;
export type SyntheticData = any;
export type BalancedDataset = any;
export type CrossValidationSplit = any;
export type TextFeatures = any;
export type FeatureMatrix = any;
export type SelectedFeatures = any;
export type HighDimensionalData = any;
export type ReducedDimensionalData = any;
export type FeaturePipelineConfig = any;
export type FeaturePipeline = any;
export type CompletenessAssessment = any;
export type AccuracyAssessment = any;
export type ConsistencyAssessment = any;
export type RelevanceAssessment = any;
export type SamplingBiasAnalysis = any;
export type SelectionBiasAnalysis = any;
export type ConfirmationBiasAnalysis = any;
export type BiasType = string;
export type BiasmitigatedDataset = any;
export type QualityGateResult = any;
export type StandardsCompliance = any;
export type Annotation = any;
export type AnnotationQuality = any;
export type PrivacyCompliance = any;
export type ScheduledJob = any;
export type JobExecution = any;
export type JobPause = any;
export type JobResume = any;
export type JobCancellation = any;
export type LearningRateConfig = any;
export type OptimalLearningRate = any;
export type BatchSizeConfig = any;
export type OptimalBatchSize = any;
export type ArchitectureConfig = any;
export type OptimalArchitecture = any;
export type SearchSpace = any;
export type GridSearchResult = any;
export type TrainedModel = any;
export type AccuracyMetrics = any;
export type GeneralizationMetrics = any;
export type Benchmark = any;
export type BenchmarkResults = any;
export type ModelComparison = any;
export type NovelData = any;
export type NovelDatasetMetadata = any;
export type NovelDatasetStatistics = any;
export type RelationshipData = any;
export type ArchetypeData = any;
export type CharacterDatasetMetadata = any;
export type PlotStructure = any;
export type PlotPattern = any;
export type PlotDatasetMetadata = any;
export type Transformation = any;
export type ProcessingMetadata = any;
export type ValidationResult = any;
export type ValidationError = any;
export type ValidationWarning = any;
export type ValidationRecommendation = any;
export type BiasmitigationStrategy = any;
export type ModelType = string;
export type HyperparameterSet = any;
export type EvaluationMetric = any;
export type ResourceRequirements = any;