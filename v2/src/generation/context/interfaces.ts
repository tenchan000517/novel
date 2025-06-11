/**
 * Version 2.0 - コンテキスト生成インターフェース
 * 
 * コンテキスト生成に関するインターフェース定義
 */

import { OperationResult } from '@/types/common';
import type {
  ContextOptions,
  GenerationContext,
  SystemData,
  SystemType,
  OptimizedContext,
  ValidationResult,
  FilteredData,
  RelevanceCriteria,
  CoordinatedQueries,
  DataQuery,
  PriorityScore,
  ConsistencyResult,
  ContextStatistics,
  SystemDataCollection,
  PerformanceMetrics
} from './types';

// ============================================================================
// コア機能インターフェース
// ============================================================================

export interface IContextGenerator {
  generateContext(chapterNumber: number, options: ContextOptions): Promise<OperationResult<GenerationContext>>;
  collectSystemData(systems: SystemType[]): Promise<OperationResult<SystemData[]>>;
  optimizeDataLoad(context: GenerationContext): Promise<OperationResult<OptimizedContext>>;
  validateContext(context: GenerationContext): Promise<OperationResult<ValidationResult>>;
  getContextStatistics(): Promise<OperationResult<ContextStatistics>>;
  refreshSystemData(systemType: SystemType): Promise<OperationResult<SystemData>>;
}

export interface IDataCoordinator {
  coordinateSystemQueries(systems: SystemType[]): Promise<OperationResult<CoordinatedQueries>>;
  executeCoordinatedQueries(queries: CoordinatedQueries): Promise<OperationResult<SystemData[]>>;
  validateDataConsistency(data: SystemData[]): Promise<OperationResult<ConsistencyResult>>;
  optimizeQueryExecution(queries: DataQuery[]): Promise<OperationResult<DataQuery[]>>;
  handleQueryFailures(failures: QueryFailure[]): Promise<OperationResult<RecoveryResult>>;
}

export interface IOptimizationEngine {
  optimizeDataDistribution(context: GenerationContext): Promise<OperationResult<OptimizedContext>>;
  calculateDataPriority(data: SystemData[]): Promise<OperationResult<PriorityScore[]>>;
  compressContextData(context: GenerationContext): Promise<OperationResult<GenerationContext>>;
  balancePerformanceQuality(context: GenerationContext): Promise<OperationResult<OptimizedContext>>;
  analyzeOptimizationOpportunities(context: GenerationContext): Promise<OperationResult<OptimizationOpportunity[]>>;
}

export interface IValidationController {
  validateContext(context: GenerationContext): Promise<OperationResult<ValidationResult>>;
  validateDataIntegrity(data: SystemData[]): Promise<OperationResult<IntegrityResult>>;
  checkSystemCompatibility(systems: SystemType[]): Promise<OperationResult<CompatibilityResult>>;
  enforceQualityStandards(context: GenerationContext): Promise<OperationResult<QualityEnforcementResult>>;
  generateValidationReport(context: GenerationContext): Promise<OperationResult<ValidationReport>>;
}

// ============================================================================
// データ収集インターフェース
// ============================================================================

export interface IDataCollector {
  collect(chapterNumber: number, options: CollectionOptions): Promise<OperationResult<SystemData>>;
  validateData(data: SystemData): Promise<OperationResult<ValidationResult>>;
  calculateRelevance(data: SystemData, criteria: RelevanceCriteria): Promise<OperationResult<number>>;
  optimizeDataSize(data: SystemData): Promise<OperationResult<SystemData>>;
  getCollectionMetrics(): Promise<OperationResult<CollectionMetrics>>;
}

export interface IMemoryCollector extends IDataCollector {
  collectShortTermMemory(chapterNumber: number): Promise<OperationResult<ShortTermMemoryData>>;
  collectMidTermMemory(chapterNumber: number): Promise<OperationResult<MidTermMemoryData>>;
  collectLongTermMemory(chapterNumber: number): Promise<OperationResult<LongTermMemoryData>>;
  prioritizeMemoryData(data: MemoryData[]): Promise<OperationResult<MemoryData[]>>;
}

export interface ICharacterCollector extends IDataCollector {
  collectActiveCharacters(chapterNumber: number): Promise<OperationResult<CharacterData[]>>;
  collectCharacterRelationships(characters: string[]): Promise<OperationResult<RelationshipData[]>>;
  collectCharacterGrowth(characters: string[]): Promise<OperationResult<GrowthData[]>>;
  collectMBTIProfiles(characters: string[]): Promise<OperationResult<MBTIData[]>>;
}

export interface IPlotCollector extends IDataCollector {
  collectCurrentPlotPhase(chapterNumber: number): Promise<OperationResult<PlotPhaseData>>;
  collectUpcomingEvents(chapterNumber: number): Promise<OperationResult<PlotEventData[]>>;
  collectTensionCurve(chapterNumber: number): Promise<OperationResult<TensionData>>;
  collectPlotMilestones(chapterNumber: number): Promise<OperationResult<MilestoneData[]>>;
}

export interface ILearningCollector extends IDataCollector {
  collectActiveJourneys(chapterNumber: number): Promise<OperationResult<LearningJourneyData[]>>;
  collectFrameworkStates(journeys: string[]): Promise<OperationResult<FrameworkStateData[]>>;
  collectLearningProgress(journeys: string[]): Promise<OperationResult<ProgressData[]>>;
  collectTeachingMoments(chapterNumber: number): Promise<OperationResult<TeachingMomentData[]>>;
}

export interface IWorldCollector extends IDataCollector {
  collectWorldSettings(chapterNumber: number): Promise<OperationResult<WorldSettingsData>>;
  collectLocationContext(chapterNumber: number): Promise<OperationResult<LocationData>>;
  collectCulturalElements(chapterNumber: number): Promise<OperationResult<CulturalData[]>>;
  collectPhysicalConstraints(chapterNumber: number): Promise<OperationResult<PhysicalConstraintData[]>>;
}

export interface IThemeCollector extends IDataCollector {
  collectActiveThemes(chapterNumber: number): Promise<OperationResult<ThemeData[]>>;
  collectSymbolicElements(chapterNumber: number): Promise<OperationResult<SymbolicElementData[]>>;
  collectMetaphorNetwork(chapterNumber: number): Promise<OperationResult<MetaphorNetworkData>>;
  collectThematicProgression(chapterNumber: number): Promise<OperationResult<ThematicProgressionData>>;
}

export interface IAnalysisCollector extends IDataCollector {
  collectQualityMetrics(chapterNumber: number): Promise<OperationResult<QualityMetricsData>>;
  collectReadabilityScores(chapterNumber: number): Promise<OperationResult<ReadabilityData[]>>;
  collectEngagementMetrics(chapterNumber: number): Promise<OperationResult<EngagementData>>;
  collectImprovementSuggestions(chapterNumber: number): Promise<OperationResult<ImprovementSuggestionData[]>>;
}

// ============================================================================
// データ統合インターフェース
// ============================================================================

export interface IDataMerger {
  mergeSystemData(data: SystemData[]): Promise<OperationResult<SystemDataCollection>>;
  resolveDataConflicts(conflicts: DataConflict[]): Promise<OperationResult<ConflictResolution[]>>;
  validateMergedData(mergedData: SystemDataCollection): Promise<OperationResult<ValidationResult>>;
  optimizeMergedData(mergedData: SystemDataCollection): Promise<OperationResult<SystemDataCollection>>;
}

export interface IPriorityCalculator {
  calculateSystemPriority(systemType: SystemType, context: ContextOptions): Promise<OperationResult<number>>;
  calculateDataPriority(data: SystemData, criteria: RelevanceCriteria): Promise<OperationResult<PriorityScore>>;
  rankSystemData(data: SystemData[]): Promise<OperationResult<SystemData[]>>;
  adjustPriorityForContext(priorities: PriorityScore[], context: GenerationContext): Promise<OperationResult<PriorityScore[]>>;
}

export interface IRelevanceFilter {
  filterByRelevance(data: SystemData[], criteria: RelevanceCriteria): Promise<OperationResult<FilteredData>>;
  calculateRelevanceScore(data: SystemData, criteria: RelevanceCriteria): Promise<OperationResult<number>>;
  optimizeFilterCriteria(criteria: RelevanceCriteria, performance: PerformanceMetrics): Promise<OperationResult<RelevanceCriteria>>;
  validateFilteredData(filteredData: FilteredData): Promise<OperationResult<ValidationResult>>;
}

export interface ILoadBalancer {
  balanceSystemLoad(queries: DataQuery[]): Promise<OperationResult<DataQuery[]>>;
  optimizeQueryDistribution(queries: DataQuery[]): Promise<OperationResult<QueryDistribution>>;
  monitorSystemPerformance(): Promise<OperationResult<SystemPerformanceData>>;
  adjustLoadBasedOnPerformance(performance: SystemPerformanceData): Promise<OperationResult<LoadAdjustment>>;
}

// ============================================================================
// ヘルパー型定義
// ============================================================================

export interface CollectionOptions {
  priority: number;
  timeout: number;
  cacheEnabled: boolean;
  validationLevel: string;
  optimizationLevel: string;
}

export interface CollectionMetrics {
  collectionTime: number;
  dataSize: number;
  cacheHitRate: number;
  errorCount: number;
  qualityScore: number;
}

export interface QueryFailure {
  queryId: string;
  systemType: SystemType;
  error: Error;
  retryCount: number;
  timestamp: string;
}

export interface RecoveryResult {
  recoveredQueries: DataQuery[];
  failedQueries: DataQuery[];
  recoveryStrategy: string;
  success: boolean;
}

export interface OptimizationOpportunity {
  area: string;
  currentPerformance: number;
  potentialImprovement: number;
  estimatedEffort: number;
  recommendation: string;
}

export interface IntegrityResult {
  isIntegral: boolean;
  score: number;
  issues: IntegrityIssue[];
  recommendations: IntegrityRecommendation[];
}

export interface IntegrityIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedData: string[];
}

export interface IntegrityRecommendation {
  issue: string;
  action: string;
  priority: number;
  estimatedImpact: number;
}

export interface CompatibilityResult {
  compatible: boolean;
  score: number;
  incompatibilities: Incompatibility[];
  resolutions: CompatibilityResolution[];
}

export interface Incompatibility {
  systems: SystemType[];
  type: string;
  severity: string;
  description: string;
}

export interface CompatibilityResolution {
  incompatibility: string;
  resolution: string;
  confidence: number;
  effort: number;
}

export interface QualityEnforcementResult {
  enforced: boolean;
  score: number;
  adjustments: QualityAdjustment[];
  warnings: QualityWarning[];
}

export interface QualityAdjustment {
  area: string;
  adjustment: string;
  impact: number;
  justification: string;
}

export interface QualityWarning {
  area: string;
  warning: string;
  severity: string;
  recommendation: string;
}

export interface ValidationReport {
  summary: ValidationSummary;
  detailedResults: ValidationResult[];
  recommendations: ValidationRecommendation[];
  metrics: ValidationMetrics;
}

export interface ValidationSummary {
  overallScore: number;
  passedChecks: number;
  totalChecks: number;
  warningCount: number;
  errorCount: number;
}

export interface ValidationRecommendation {
  category: string;
  recommendation: string;
  priority: number;
  expectedImprovement: number;
}

export interface ValidationMetrics {
  validationTime: number;
  checksPerformed: number;
  averageCheckTime: number;
  cacheHitRate: number;
}

// データ型（各システムから詳細実装時に適切に型定義）
export interface ShortTermMemoryData { [key: string]: any; }
export interface MidTermMemoryData { [key: string]: any; }
export interface LongTermMemoryData { [key: string]: any; }
export interface MemoryData { [key: string]: any; }
export interface CharacterData { [key: string]: any; }
export interface RelationshipData { [key: string]: any; }
export interface GrowthData { [key: string]: any; }
export interface MBTIData { [key: string]: any; }
export interface PlotPhaseData { [key: string]: any; }
export interface PlotEventData { [key: string]: any; }
export interface TensionData { [key: string]: any; }
export interface MilestoneData { [key: string]: any; }
export interface LearningJourneyData { [key: string]: any; }
export interface FrameworkStateData { [key: string]: any; }
export interface ProgressData { [key: string]: any; }
export interface TeachingMomentData { [key: string]: any; }
export interface WorldSettingsData { [key: string]: any; }
export interface LocationData { [key: string]: any; }
export interface CulturalData { [key: string]: any; }
export interface PhysicalConstraintData { [key: string]: any; }
export interface ThemeData { [key: string]: any; }
export interface SymbolicElementData { [key: string]: any; }
export interface MetaphorNetworkData { [key: string]: any; }
export interface ThematicProgressionData { [key: string]: any; }
export interface QualityMetricsData { [key: string]: any; }
export interface ReadabilityData { [key: string]: any; }
export interface EngagementData { [key: string]: any; }
export interface ImprovementSuggestionData { [key: string]: any; }

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

export interface QueryDistribution {
  systemLoads: SystemLoad[];
  distributionStrategy: string;
  expectedPerformance: number;
  balanceScore: number;
}

export interface SystemLoad {
  systemType: SystemType;
  currentLoad: number;
  capacity: number;
  utilization: number;
  queueSize: number;
}

export interface SystemPerformanceData {
  systemLoads: SystemLoad[];
  averageResponseTime: number;
  throughput: number;
  errorRate: number;
  timestamp: string;
}

export interface LoadAdjustment {
  adjustmentType: string;
  targetSystems: SystemType[];
  adjustment: number;
  expectedImprovement: number;
  reason: string;
}

// ============================================================================
// 不足していた型定義を追加
// ============================================================================

export interface JourneyProgress {
  completed: number;
  total: number;
  percentage: number;
}