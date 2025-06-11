/**
 * ML Training System Types
 * 
 * ML学習データ収集システムの型定義
 * Version 2.0要件: 学習データ収集・処理・品質管理・モデル訓練支援の型定義
 */

import type { SystemId } from '@/types/common';

// ============================================================================
// システム設定・設定
// ============================================================================

export interface MLTrainingManagerConfig {
  enableDataCollection: boolean;
  enableDataProcessing: boolean;
  enableQualityManagement: boolean;
  enableModelTraining: boolean;
  enablePipelineExecution: boolean;
  defaultQualityThreshold: number;
  maxDatasetSize: number;
  dataRetentionDays: number;
  enableAutomaticCleaning: boolean;
  enableBiasDetection: boolean;
  enableSyntheticDataGeneration: boolean;
  realTimeProcessing: boolean;
  parallelProcessing: boolean;
  enableGPUAcceleration: boolean;
  maxConcurrentJobs: number;
}

export interface DataCollectionConfig {
  enableTextCollection: boolean;
  enableCharacterCollection: boolean;
  enablePlotCollection: boolean;
  enableMetadataCollection: boolean;
  collectionStrategy: CollectionStrategy;
  samplingRate: number;
  qualityFilter: boolean;
  duplicateDetection: boolean;
  anonymization: boolean;
  compressionEnabled: boolean;
}

export interface DataProcessingConfig {
  enablePreprocessing: boolean;
  enableAugmentation: boolean;
  enableFeatureExtraction: boolean;
  enableNormalization: boolean;
  processingPipeline: ProcessingPipeline[];
  batchSize: number;
  maxMemoryUsage: number;
  timeoutMs: number;
  enableCaching: boolean;
  cacheSize: number;
}

export interface QualityManagementConfig {
  enableQualityAssessment: boolean;
  enableBiasDetection: boolean;
  enableDataValidation: boolean;
  enablePrivacyChecks: boolean;
  qualityThresholds: QualityThresholds;
  biasToleranceLevels: BiasToleranceLevels;
  validationRules: ValidationRule[];
  privacyStandards: PrivacyStandard[];
}

export interface ModelTrainingConfig {
  enableDistributedTraining: boolean;
  enableHyperparameterOptimization: boolean;
  enableEarlyStoppingl: boolean;
  enableModelCheckpointing: boolean;
  defaultFramework: MLFramework;
  resourceAllocation: ResourceAllocation;
  evaluationStrategy: EvaluationStrategy;
  optimizationAlgorithm: OptimizationAlgorithm;
}

// ============================================================================
// データセット基本型
// ============================================================================

export interface TrainingDataset {
  datasetId: string;
  name: string;
  description: string;
  type: DataType;
  version: string;
  size: DatasetSize;
  source: DataSource;
  samples: DataSample[];
  labels: DataLabel[];
  features: FeatureDefinition[];
  metadata: DatasetMetadata;
  quality: DataQuality;
  schema: DatasetSchema;
  lineage: DataLineage;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
}

export interface DataCollectionTask {
  taskId: string;
  name: string;
  description: string;
  type: CollectionType;
  strategy: CollectionStrategy;
  target: CollectionTarget;
  parameters: CollectionParameters;
  schedule: CollectionSchedule;
  filters: DataFilter[];
  transformations: DataTransformation[];
  outputFormat: OutputFormat;
  qualityRequirements: QualityRequirements;
  status: TaskStatus;
  progress: TaskProgress;
  createdBy: string;
  createdAt: Date;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ModelTrainingJob {
  jobId: string;
  name: string;
  description: string;
  modelType: ModelType;
  framework: MLFramework;
  dataset: TrainingDataset;
  configuration: TrainingConfiguration;
  hyperparameters: HyperparameterSet;
  resources: ResourceRequirements;
  status: JobStatus;
  progress: TrainingProgress;
  metrics: TrainingMetrics;
  logs: TrainingLog[];
  artifacts: TrainingArtifact[];
  checkpoints: ModelCheckpoint[];
  evaluation: ModelEvaluation;
  createdBy: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number;
}

export interface TrainingPipeline {
  pipelineId: string;
  name: string;
  description: string;
  version: string;
  stages: PipelineStage[];
  dependencies: PipelineDependency[];
  configuration: PipelineConfiguration;
  triggers: PipelineTrigger[];
  schedule: PipelineSchedule;
  notifications: NotificationConfig[];
  monitoring: MonitoringConfig;
  status: PipelineStatus;
  execution: PipelineExecution;
  metadata: PipelineMetadata;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastExecuted?: Date;
}

export interface DataQuality {
  score: number;
  dimensions: QualityDimension[];
  issues: QualityIssue[];
  recommendations: QualityRecommendation[];
  completeness: CompletenessMetrics;
  accuracy: AccuracyMetrics;
  consistency: ConsistencyMetrics;
  validity: ValidityMetrics;
  uniqueness: UniquenessMetrics;
  timeliness: TimelinessMetrics;
  assessedAt: Date;
  assessmentDuration: number;
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

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  validationLoss: number;
  validationAccuracy: number;
  learningRate: number;
  gradientNorm: number;
  trainingTime: number;
  memoryUsage: number;
  gpuUtilization?: number;
  customMetrics: Map<string, number>;
  timestamp: Date;
}

export interface ModelEvaluation {
  evaluationId: string;
  jobId: string;
  modelVersion: string;
  testDataset: string;
  metrics: EvaluationMetrics;
  benchmarkResults: BenchmarkResult[];
  confusionMatrix?: number[][];
  performanceAnalysis: PerformanceAnalysis;
  recommendations: EvaluationRecommendation[];
  evaluatedAt: Date;
  evaluationDuration: number;
}

export interface Annotation {
  annotationId: string;
  type: AnnotationType;
  value: any;
  confidence: number;
  annotator: string;
  validatedBy?: string;
  metadata: AnnotationMetadata;
  createdAt: Date;
  updatedAt?: Date;
}

export interface TrainingStatistics {
  totalDatasets: number;
  datasetsByType: Map<DataType, number>;
  totalTrainingJobs: number;
  jobsByStatus: Map<JobStatus, number>;
  totalPipelines: number;
  pipelinesByStatus: Map<PipelineStatus, number>;
  qualityStatistics: QualityStatistics;
  performanceStatistics: PerformanceStatistics;
  resourceUsageStatistics: ResourceUsageStatistics;
  systemHealth: SystemHealthStatistics;
}

export interface TrainingReport {
  reportId: string;
  generatedAt: Date;
  reportPeriod: ReportPeriod;
  executiveSummary: ExecutiveSummary;
  dataCollectionSummary: DataCollectionSummary;
  trainingJobsSummary: TrainingJobsSummary;
  qualityAssessment: QualityAssessmentSummary;
  performanceAnalysis: PerformanceAnalysisSummary;
  recommendations: ReportRecommendation[];
  actionItems: ActionItem[];
  trends: TrainingTrend[];
}

// ============================================================================
// データ分類・特徴型
// ============================================================================

export interface DataSample {
  sampleId: string;
  data: any;
  label?: DataLabel;
  features: FeatureMap;
  metadata: SampleMetadata;
  quality: SampleQuality;
  annotations: Annotation[];
  transformations: AppliedTransformation[];
  createdAt: Date;
}

export interface DataLabel {
  labelId: string;
  value: any;
  confidence: number;
  source: LabelSource;
  annotator?: string;
  validatedBy?: string;
  createdAt: Date;
  validatedAt?: Date;
}

export interface FeatureDefinition {
  featureId: string;
  name: string;
  description: string;
  type: FeatureType;
  dataType: DataValueType;
  encoding: FeatureEncoding;
  normalization: NormalizationMethod;
  importance: number;
  statistics: FeatureStatistics;
  constraints: FeatureConstraint[];
  transformations: FeatureTransformation[];
}

export interface DatasetMetadata {
  domain: string;
  language: string;
  genre?: string;
  tags: string[];
  license: string;
  citation?: string;
  contributors: string[];
  fundingSource?: string;
  ethicsApproval?: string;
  privacyLevel: PrivacyLevel;
  sensitivityLevel: SensitivityLevel;
}

export interface DatasetSchema {
  schemaId: string;
  version: string;
  fields: SchemaField[];
  relationships: SchemaRelationship[];
  constraints: SchemaConstraint[];
  indexes: SchemaIndex[];
  validation: SchemaValidation;
}

export interface DataLineage {
  lineageId: string;
  sources: DataSource[];
  transformations: LineageTransformation[];
  derivations: DataDerivation[];
  dependencies: LineageDependency[];
  quality: LineageQuality;
  auditTrail: AuditEvent[];
}

// ============================================================================
// 品質・評価型
// ============================================================================

export interface QualityDimension {
  dimension: QualityDimensionType;
  score: number;
  weight: number;
  measurements: QualityMeasurement[];
  issues: QualityIssue[];
  trends: QualityTrend[];
}

export interface QualityIssue {
  issueId: string;
  type: QualityIssueType;
  severity: QualityIssueSeverity;
  description: string;
  affectedSamples: string[];
  impact: QualityImpact;
  resolution: QualityResolution;
  detectedAt: Date;
  resolvedAt?: Date;
}

export interface QualityRecommendation {
  recommendationId: string;
  type: QualityRecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  implementation: ImplementationGuide;
  expectedImpact: ExpectedImpact;
  effort: EffortEstimate;
  dependencies: string[];
}

// ============================================================================
// 処理・パイプライン型
// ============================================================================

export interface PipelineStage {
  stageId: string;
  name: string;
  description: string;
  type: StageType;
  configuration: StageConfiguration;
  inputs: StageInput[];
  outputs: StageOutput[];
  dependencies: string[];
  resources: StageResources;
  timeout: number;
  retryPolicy: RetryPolicy;
  monitoring: StageMonitoring;
}

export interface TrainingConfiguration {
  epochs: number;
  batchSize: number;
  learningRate: number;
  optimizer: OptimizerType;
  lossFunction: LossFunction;
  metrics: EvaluationMetric[];
  callbacks: CallbackConfig[];
  regularization: RegularizationConfig;
  augmentation: AugmentationConfig;
  validation: ValidationConfig;
}

export interface HyperparameterSet {
  parameters: Map<string, HyperparameterValue>;
  searchSpace: Map<string, ParameterRange>;
  constraints: ParameterConstraint[];
  optimization: OptimizationConfig;
}

// ============================================================================
// 列挙型
// ============================================================================

export enum DataType {
  // 基本データタイプ
  TEXT = 'text',
  NOVEL = 'novel',
  CHARACTER = 'character',
  PLOT = 'plot',
  DIALOGUE = 'dialogue',
  DESCRIPTION = 'description',
  
  // 構造化データタイプ
  FEATURE_VECTOR = 'feature_vector',
  EMBEDDING = 'embedding',
  ANNOTATION = 'annotation',
  METADATA = 'metadata',
  
  // 複合データタイプ
  MULTIMODAL = 'multimodal',
  SEQUENTIAL = 'sequential',
  HIERARCHICAL = 'hierarchical',
  GRAPH = 'graph',
  
  // その他
  SYNTHETIC = 'synthetic',
  AUGMENTED = 'augmented',
  CUSTOM = 'custom'
}

export enum CollectionStrategy {
  BATCH = 'batch',
  STREAMING = 'streaming',
  INCREMENTAL = 'incremental',
  SELECTIVE = 'selective',
  RANDOM_SAMPLING = 'random_sampling',
  STRATIFIED_SAMPLING = 'stratified_sampling',
  ACTIVE_LEARNING = 'active_learning',
  FEDERATED = 'federated'
}

export enum TrainingStage {
  INITIALIZING = 'initializing',
  DATA_LOADING = 'data_loading',
  PREPROCESSING = 'preprocessing',
  TRAINING = 'training',
  VALIDATION = 'validation',
  EVALUATION = 'evaluation',
  CHECKPOINTING = 'checkpointing',
  OPTIMIZATION = 'optimization',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum QualityLevel {
  POOR = 'poor',
  FAIR = 'fair',
  GOOD = 'good',
  EXCELLENT = 'excellent',
  OUTSTANDING = 'outstanding'
}

export enum CollectionType {
  NOVEL_GENERATION = 'novel_generation',
  CHARACTER_ANALYSIS = 'character_analysis',
  PLOT_ANALYSIS = 'plot_analysis',
  STYLE_ANALYSIS = 'style_analysis',
  QUALITY_EVALUATION = 'quality_evaluation',
  USER_FEEDBACK = 'user_feedback',
  PERFORMANCE_METRICS = 'performance_metrics',
  METADATA_EXTRACTION = 'metadata_extraction'
}

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  SCHEDULED = 'scheduled'
}

export enum JobStatus {
  QUEUED = 'queued',
  STARTING = 'starting',
  RUNNING = 'running',
  PAUSED = 'paused',
  RESUMING = 'resuming',
  STOPPING = 'stopping',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout'
}

export enum PipelineStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  MAINTENANCE = 'maintenance'
}

export enum MLFramework {
  TENSORFLOW = 'tensorflow',
  PYTORCH = 'pytorch',
  KERAS = 'keras',
  SCIKIT_LEARN = 'scikit_learn',
  HUGGINGFACE = 'huggingface',
  SPACY = 'spacy',
  TRANSFORMERS = 'transformers',
  CUSTOM = 'custom'
}

export enum ModelType {
  LANGUAGE_MODEL = 'language_model',
  CLASSIFICATION = 'classification',
  REGRESSION = 'regression',
  CLUSTERING = 'clustering',
  GENERATION = 'generation',
  EMBEDDING = 'embedding',
  SEQUENCE_TO_SEQUENCE = 'sequence_to_sequence',
  TRANSFORMER = 'transformer',
  NEURAL_NETWORK = 'neural_network',
  ENSEMBLE = 'ensemble'
}

export enum FeatureType {
  NUMERICAL = 'numerical',
  CATEGORICAL = 'categorical',
  TEXT = 'text',
  EMBEDDING = 'embedding',
  BOOLEAN = 'boolean',
  ORDINAL = 'ordinal',
  TEMPORAL = 'temporal',
  SPATIAL = 'spatial',
  GRAPH = 'graph',
  CUSTOM = 'custom'
}

export enum QualityDimensionType {
  COMPLETENESS = 'completeness',
  ACCURACY = 'accuracy',
  CONSISTENCY = 'consistency',
  VALIDITY = 'validity',
  UNIQUENESS = 'uniqueness',
  TIMELINESS = 'timeliness',
  RELEVANCE = 'relevance',
  COVERAGE = 'coverage',
  BALANCE = 'balance',
  REPRESENTATIVENESS = 'representativeness'
}

export enum QualityIssueType {
  MISSING_VALUES = 'missing_values',
  DUPLICATE_RECORDS = 'duplicate_records',
  OUTLIERS = 'outliers',
  INCONSISTENT_FORMAT = 'inconsistent_format',
  INVALID_VALUES = 'invalid_values',
  BIAS = 'bias',
  INSUFFICIENT_COVERAGE = 'insufficient_coverage',
  POOR_ANNOTATION = 'poor_annotation',
  LOW_RELEVANCE = 'low_relevance',
  PRIVACY_VIOLATION = 'privacy_violation'
}

export enum QualityIssueSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum StageType {
  DATA_INGESTION = 'data_ingestion',
  DATA_PREPROCESSING = 'data_preprocessing',
  FEATURE_EXTRACTION = 'feature_extraction',
  DATA_VALIDATION = 'data_validation',
  MODEL_TRAINING = 'model_training',
  MODEL_EVALUATION = 'model_evaluation',
  MODEL_DEPLOYMENT = 'model_deployment',
  MONITORING = 'monitoring',
  CUSTOM = 'custom'
}

export enum OptimizerType {
  SGD = 'sgd',
  ADAM = 'adam',
  ADAMW = 'adamw',
  RMSPROP = 'rmsprop',
  ADAGRAD = 'adagrad',
  MOMENTUM = 'momentum',
  CUSTOM = 'custom'
}

export enum LossFunction {
  CROSS_ENTROPY = 'cross_entropy',
  MEAN_SQUARED_ERROR = 'mean_squared_error',
  MEAN_ABSOLUTE_ERROR = 'mean_absolute_error',
  HUBER_LOSS = 'huber_loss',
  FOCAL_LOSS = 'focal_loss',
  CONTRASTIVE_LOSS = 'contrastive_loss',
  CUSTOM = 'custom'
}

export enum PrivacyLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  HIGHLY_SENSITIVE = 'highly_sensitive'
}

export enum SensitivityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

// ============================================================================
// 支援型定義（詳細実装用）
// ============================================================================

export interface DatasetSize {
  samples: number;
  features: number;
  sizeInBytes: number;
  memoryRequirement: number;
}

export interface CollectionTarget {
  scope: string;
  filters: TargetFilter[];
  constraints: TargetConstraint[];
  sampling: SamplingConfig;
}

export interface CollectionParameters {
  [key: string]: any;
}

export interface TaskProgress {
  percentage: number;
  current: number;
  total: number;
  stage: string;
  estimatedTimeRemaining: number;
}

export interface ResourceRequirements {
  cpu: number;
  memory: number;
  gpu?: number;
  storage: number;
  network?: number;
}

export interface SampleMetadata {
  source: string;
  timestamp: Date;
  version: string;
  tags: string[];
  annotations: MetadataAnnotation[];
}

export interface FeatureMap {
  [featureId: string]: any;
}

export interface SampleQuality {
  score: number;
  issues: string[];
  validated: boolean;
}

// 型エイリアス（詳細実装用）
export type TimePeriod = any;
export type ProcessingPipeline = any;
export type QualityThresholds = any;
export type BiasToleranceLevels = any;
export type ValidationRule = any;
export type PrivacyStandard = any;
export type ResourceAllocation = any;
export type EvaluationStrategy = any;
export type OptimizationAlgorithm = any;
export type DataSource = any;
export type OutputFormat = any;
export type QualityRequirements = any;
export type CollectionSchedule = any;
export type DataFilter = any;
export type DataTransformation = any;
export type PipelineDependency = any;
export type PipelineConfiguration = any;
export type PipelineTrigger = any;
export type PipelineSchedule = any;
export type NotificationConfig = any;
export type MonitoringConfig = any;
export type PipelineExecution = any;
export type PipelineMetadata = any;
export type CompletenessMetrics = any;
export type AccuracyMetrics = any;
export type ConsistencyMetrics = any;
export type ValidityMetrics = any;
export type UniquenessMetrics = any;
export type TimelinessMetrics = any;
export type QualityStatistics = any;
export type PerformanceStatistics = any;
export type ResourceUsageStatistics = any;
export type SystemHealthStatistics = any;
export type ReportPeriod = any;
export type ExecutiveSummary = any;
export type DataCollectionSummary = any;
export type TrainingJobsSummary = any;
export type QualityAssessmentSummary = any;
export type PerformanceAnalysisSummary = any;
export type ReportRecommendation = any;
export type ActionItem = any;
export type TrainingTrend = any;
export type LabelSource = any;
export type FeatureEncoding = any;
export type NormalizationMethod = any;
export type FeatureStatistics = any;
export type FeatureConstraint = any;
export type FeatureTransformation = any;
export type SchemaField = any;
export type SchemaRelationship = any;
export type SchemaConstraint = any;
export type SchemaIndex = any;
export type SchemaValidation = any;
export type LineageTransformation = any;
export type DataDerivation = any;
export type LineageDependency = any;
export type LineageQuality = any;
export type AuditEvent = any;
export type QualityMeasurement = any;
export type QualityTrend = any;
export type QualityImpact = any;
export type QualityResolution = any;
export type QualityRecommendationType = string;
export type RecommendationPriority = string;
export type ImplementationGuide = any;
export type ExpectedImpact = any;
export type EffortEstimate = any;
export type StageConfiguration = any;
export type StageInput = any;
export type StageOutput = any;
export type StageResources = any;
export type RetryPolicy = any;
export type StageMonitoring = any;
export type CallbackConfig = any;
export type RegularizationConfig = any;
export type AugmentationConfig = any;
export type ValidationConfig = any;
export type HyperparameterValue = any;
export type ParameterRange = any;
export type ParameterConstraint = any;
export type OptimizationConfig = any;
export type TargetFilter = any;
export type TargetConstraint = any;
export type SamplingConfig = any;
export type MetadataAnnotation = any;
export type DataValueType = string;
export type EvaluationMetric = string;
export type TrainingLog = any;
export type TrainingArtifact = any;
export type ModelCheckpoint = any;
export type AppliedTransformation = any;
export type EvaluationMetrics = any;
export type BenchmarkResult = any;
export type PerformanceAnalysis = any;
export type EvaluationRecommendation = any;
export type AnnotationType = string;
export type AnnotationMetadata = any;