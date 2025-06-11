/**
 * Foreshadowing Management System Types
 * 
 * 伏線管理システムの型定義
 * Version 2.0要件: 伏線検出・配置・解決・品質管理の型定義
 */

import type { SystemId } from '@/types/common';

// ============================================================================
// システム設定・設定
// ============================================================================

export interface ForeshadowingManagerConfig {
  enableForeshadowingDetection: boolean;
  enableAutomaticPlacement: boolean;
  enableResolutionTracking: boolean;
  enableQualityMonitoring: boolean;
  enableLearning: boolean;
  defaultComplexityLevel: ForeshadowingComplexity;
  subtletyThreshold: number;
  resolutionTimeout: number;
  qualityThreshold: number;
  realTimeAnalysis: boolean;
  cacheResults: boolean;
  batchProcessing: boolean;
  parallelAnalysis: boolean;
}

export interface ForeshadowingDetectionConfig {
  detectionDepth: DetectionDepth;
  includeImplicitElements: boolean;
  detectSymbolicContent: boolean;
  analyzeThematicElements: boolean;
  trackCharacterHints: boolean;
  identifyRecurringMotifs: boolean;
  sensitivityLevel: SensitivityLevel;
  confidenceThreshold: number;
}

export interface ForeshadowingPlacementConfig {
  placementStrategy: PlacementStrategy;
  densityControl: DensityControl;
  subtletyPreference: SubtletyPreference;
  integrationApproach: IntegrationApproach;
  timingOptimization: boolean;
  conflictAvoidance: boolean;
  narrativeFlow: boolean;
  readerEngagement: boolean;
}

export interface ForeshadowingResolutionConfig {
  trackingMode: TrackingMode;
  resolutionStrategy: ResolutionStrategy;
  satisfactionCriteria: SatisfactionCriteria;
  payoffOptimization: boolean;
  consistencyValidation: boolean;
  timeoutHandling: boolean;
  qualityAssurance: boolean;
  readerFeedback: boolean;
}

export interface ForeshadowingQualityConfig {
  qualityStandards: QualityStandards;
  evaluationCriteria: EvaluationCriteria;
  balanceRequirements: BalanceRequirements;
  integrationRequirements: IntegrationRequirements;
  effectivenessMetrics: EffectivenessMetrics;
  benchmarkComparison: boolean;
  continuousMonitoring: boolean;
  automaticOptimization: boolean;
}

// ============================================================================
// 伏線基本型
// ============================================================================

export interface ForeshadowingElement {
  id: string;
  type: ForeshadowingType;
  content: string;
  location: ElementLocation;
  targetResolution: ResolutionTarget;
  plantingChapter: number;
  resolutionChapter?: number;
  subtletyLevel: number;
  importance: ImportanceLevel;
  confidence: number;
  state: ElementState;
  relationships: ElementRelationship[];
  metadata: ForeshadowingMetadata;
  timestamp: Date;
}

export interface ForeshadowingContext {
  narrative: NarrativeContext;
  genre: GenreContext;
  audience: AudienceContext;
  style: StyleContext;
  constraints: ContextConstraints;
  objectives: ForeshadowingObjectives;
}

export interface ForeshadowingAnalysis {
  detectedElements: ForeshadowingElement[];
  structuralAnalysis: StructuralAnalysis;
  densityAnalysis: DensityAnalysis;
  subtletyAnalysis: SubtletyAnalysisResult;
  consistencyAnalysis: ConsistencyAnalysis;
  effectivenessAnalysis: EffectivenessAnalysis;
  qualityAssessment: QualityAssessment;
  recommendations: AnalysisRecommendation[];
  confidence: number;
  timestamp: Date;
}

export interface ForeshadowingStrategy {
  strategyId: string;
  objectiveType: ObjectiveType;
  approach: StrategyApproach;
  placementPlan: PlacementPlan;
  resolutionPlan: ResolutionPlan;
  timeline: StrategyTimeline;
  qualityTargets: QualityTargets;
  constraints: StrategyConstraints;
  metrics: StrategyMetrics;
  adaptability: StrategyAdaptability;
}

export interface ForeshadowingPlacement {
  placementId: string;
  targetLocation: PlacementLocation;
  elementType: ForeshadowingType;
  content: PlacementContent;
  integrationMethod: IntegrationMethod;
  subtletyLevel: number;
  timing: PlacementTiming;
  dependencies: PlacementDependency[];
  validation: PlacementValidation;
}

export interface ForeshadowingResolution {
  resolutionId: string;
  targetElements: string[];
  resolutionType: ResolutionType;
  resolutionContent: ResolutionContent;
  payoffMoments: PayoffMoment[];
  satisfactionLevel: number;
  consistency: ConsistencyLevel;
  completeness: CompletenessLevel;
  impact: ResolutionImpact;
  validation: ResolutionValidation;
}

export interface ForeshadowingValidation {
  isValid: boolean;
  validationScore: number;
  consistencyCheck: ConsistencyCheck;
  integrationCheck: IntegrationCheck;
  qualityCheck: QualityCheck;
  issues: ValidationIssue[];
  warnings: ValidationWarning[];
  recommendations: ValidationRecommendation[];
  validatedAt: Date;
}

export interface ForeshadowingOptimization {
  originalContent: string;
  optimizedContent: string;
  optimizationType: OptimizationType;
  optimizationMetrics: OptimizationMetrics;
  improvements: OptimizationImprovement[];
  tradeoffs: OptimizationTradeoff[];
  qualityGains: QualityGain[];
  performanceImpact: PerformanceImpact;
}

// ============================================================================
// 伏線分類・特徴型
// ============================================================================

export interface ElementLocation {
  chapterNumber: number;
  sceneNumber?: number;
  paragraphNumber?: number;
  characterContext?: string;
  narrativeContext: string;
  relativePosition: number;
}

export interface ResolutionTarget {
  targetChapter: number;
  targetScene?: string;
  resolutionType: ResolutionType;
  payoffLevel: PayoffLevel;
  satisfactionGoal: number;
  dependentElements: string[];
}

export interface ElementRelationship {
  relatedElementId: string;
  relationshipType: RelationshipType;
  strength: number;
  dependency: DependencyType;
  timing: RelationshipTiming;
}

export interface ForeshadowingMetadata {
  author: string;
  version: string;
  tags: string[];
  categories: string[];
  complexity: ForeshadowingComplexity;
  style: ForeshadowingStyle;
  genre: string;
  audience: string;
}

// ============================================================================
// 分析結果型
// ============================================================================

export interface StructuralAnalysis {
  overallStructure: StructureAssessment;
  layering: LayeringAnalysis;
  distribution: DistributionAnalysis;
  timing: TimingAnalysis;
  dependencies: DependencyAnalysis;
  coherence: CoherenceAnalysis;
}

export interface DensityAnalysis {
  overallDensity: number;
  densityByChapter: Map<number, number>;
  densityByType: Map<ForeshadowingType, number>;
  optimalDensity: number;
  densityIssues: DensityIssue[];
  recommendations: DensityRecommendation[];
}

export interface SubtletyAnalysisResult {
  overallSubtlety: number;
  subtletyByElement: Map<string, number>;
  subtletyBalance: SubtletyBalance;
  subtletyIssues: SubtletyIssue[];
  optimalSubtlety: number;
  adjustmentNeeds: SubtletyAdjustment[];
}

export interface ConsistencyAnalysis {
  overallConsistency: number;
  elementConsistency: Map<string, number>;
  narrativeConsistency: number;
  characterConsistency: number;
  thematicConsistency: number;
  inconsistencies: InconsistencyIssue[];
}

export interface EffectivenessAnalysis {
  overallEffectiveness: number;
  effectivenessByType: Map<ForeshadowingType, number>;
  readerEngagement: EngagementMetrics;
  satisfactionPrediction: SatisfactionPrediction;
  improvementAreas: EffectivenessImprovement[];
}

export interface QualityAssessment {
  overallQuality: number;
  qualityDimensions: QualityDimension[];
  strengthAreas: QualityStrength[];
  weaknessAreas: QualityWeakness[];
  benchmarkComparison: BenchmarkComparison;
  qualityTrends: QualityTrendAnalysis[];
}

// ============================================================================
// メトリクス・統計型
// ============================================================================

export interface ForeshadowingMetrics {
  detectionMetrics: DetectionMetrics;
  placementMetrics: PlacementMetrics;
  resolutionMetrics: ResolutionMetrics;
  qualityMetrics: QualityMetrics;
  performanceMetrics: PerformanceMetrics;
  engagementMetrics: EngagementMetrics;
}

export interface ForeshadowingStatistics {
  totalElements: number;
  elementsByType: Map<ForeshadowingType, number>;
  resolutionStatistics: ResolutionStatistics;
  qualityDistribution: QualityDistribution;
  effectivenessStatistics: EffectivenessStatistics;
  systemPerformance: SystemPerformanceStatistics;
}

export interface ForeshadowingReport {
  reportId: string;
  generatedAt: Date;
  reportPeriod: ReportPeriod;
  executiveSummary: ExecutiveSummary;
  detectionResults: DetectionResults;
  placementAnalysis: PlacementAnalysis;
  resolutionTracking: ResolutionTracking;
  qualityAssessment: QualityAssessmentReport;
  recommendations: ReportRecommendation[];
  actionItems: ActionItem[];
}

export interface ForeshadowingBenchmark {
  benchmarkId: string;
  referenceWorks: ReferenceWork[];
  qualityStandards: BenchmarkQualityStandards;
  performanceMetrics: BenchmarkPerformanceMetrics;
  comparisonResults: ComparisonResult[];
  relativePerformance: RelativePerformance;
}

export interface ForeshadowingTrend {
  trendId: string;
  trendType: TrendType;
  direction: TrendDirection;
  strength: TrendStrength;
  timeframe: TrendTimeframe;
  influencingFactors: TrendInfluencingFactor[];
  predictions: TrendPrediction[];
  confidence: number;
}

// ============================================================================
// 列挙型
// ============================================================================

export enum ForeshadowingType {
  // 基本タイプ
  PLOT_FORESHADOWING = 'plot_foreshadowing',
  CHARACTER_FORESHADOWING = 'character_foreshadowing',
  THEMATIC_FORESHADOWING = 'thematic_foreshadowing',
  SYMBOLIC_FORESHADOWING = 'symbolic_foreshadowing',
  
  // 手法タイプ
  DIRECT_STATEMENT = 'direct_statement',
  INDIRECT_HINT = 'indirect_hint',
  SYMBOLIC_REFERENCE = 'symbolic_reference',
  DIALOGUE_HINT = 'dialogue_hint',
  DESCRIPTION_CLUE = 'description_clue',
  ACTION_FORESHADOWING = 'action_foreshadowing',
  
  // 複合タイプ
  LAYERED_FORESHADOWING = 'layered_foreshadowing',
  RECURSIVE_FORESHADOWING = 'recursive_foreshadowing',
  MISDIRECTION = 'misdirection',
  RED_HERRING = 'red_herring',
  
  // その他
  ENVIRONMENTAL = 'environmental',
  CONTEXTUAL = 'contextual',
  CUSTOM = 'custom'
}

export enum ForeshadowingComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  HIGHLY_COMPLEX = 'highly_complex',
  MASTERFUL = 'masterful'
}

export enum ForeshadowingStyle {
  SUBTLE = 'subtle',
  MODERATE = 'moderate',
  OBVIOUS = 'obvious',
  DRAMATIC = 'dramatic',
  LITERARY = 'literary',
  COMMERCIAL = 'commercial'
}

export enum DetectionDepth {
  SURFACE = 'surface',
  STANDARD = 'standard',
  DEEP = 'deep',
  COMPREHENSIVE = 'comprehensive',
  EXPERT = 'expert'
}

export enum SensitivityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  MAXIMUM = 'maximum'
}

export enum PlacementStrategy {
  ORGANIC = 'organic',
  STRATEGIC = 'strategic',
  SYSTEMATIC = 'systematic',
  LAYERED = 'layered',
  ADAPTIVE = 'adaptive'
}

export enum DensityControl {
  MINIMAL = 'minimal',
  SPARSE = 'sparse',
  MODERATE = 'moderate',
  DENSE = 'dense',
  MAXIMUM = 'maximum'
}

export enum SubtletyPreference {
  VERY_SUBTLE = 'very_subtle',
  SUBTLE = 'subtle',
  BALANCED = 'balanced',
  NOTICEABLE = 'noticeable',
  OBVIOUS = 'obvious'
}

export enum IntegrationApproach {
  SEAMLESS = 'seamless',
  NATURAL = 'natural',
  DELIBERATE = 'deliberate',
  ARTISTIC = 'artistic',
  FUNCTIONAL = 'functional'
}

export enum TrackingMode {
  PASSIVE = 'passive',
  ACTIVE = 'active',
  PROACTIVE = 'proactive',
  PREDICTIVE = 'predictive'
}

export enum ResolutionStrategy {
  IMMEDIATE = 'immediate',
  GRADUAL = 'gradual',
  CLIMACTIC = 'climactic',
  DISTRIBUTED = 'distributed',
  LAYERED = 'layered'
}

export enum ResolutionType {
  DIRECT_RESOLUTION = 'direct_resolution',
  INDIRECT_RESOLUTION = 'indirect_resolution',
  PARTIAL_RESOLUTION = 'partial_resolution',
  COMPLETE_RESOLUTION = 'complete_resolution',
  TWIST_RESOLUTION = 'twist_resolution',
  SUBVERTED_RESOLUTION = 'subverted_resolution'
}

export enum ResolutionState {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PARTIALLY_RESOLVED = 'partially_resolved',
  FULLY_RESOLVED = 'fully_resolved',
  OVERDUE = 'overdue',
  ABANDONED = 'abandoned',
  SUBVERTED = 'subverted'
}

export enum ElementState {
  PLANTED = 'planted',
  DEVELOPING = 'developing',
  MATURING = 'maturing',
  READY_FOR_RESOLUTION = 'ready_for_resolution',
  RESOLVED = 'resolved',
  ABANDONED = 'abandoned'
}

export enum ImportanceLevel {
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  CRITICAL = 'critical',
  CENTRAL = 'central'
}

export enum PayoffLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  MAXIMUM = 'maximum',
  CLIMACTIC = 'climactic'
}

export enum RelationshipType {
  SUPPORTS = 'supports',
  CONTRADICTS = 'contradicts',
  ENHANCES = 'enhances',
  DEPENDS_ON = 'depends_on',
  PARALLELS = 'parallels',
  SUBVERTS = 'subverts'
}

export enum DependencyType {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  CONDITIONAL = 'conditional',
  OPTIONAL = 'optional',
  MUTUAL = 'mutual'
}

export enum OptimizationType {
  DENSITY_OPTIMIZATION = 'density_optimization',
  SUBTLETY_OPTIMIZATION = 'subtlety_optimization',
  TIMING_OPTIMIZATION = 'timing_optimization',
  INTEGRATION_OPTIMIZATION = 'integration_optimization',
  QUALITY_OPTIMIZATION = 'quality_optimization'
}

export enum TrendType {
  USAGE = 'usage',
  EFFECTIVENESS = 'effectiveness',
  QUALITY = 'quality',
  INNOVATION = 'innovation',
  AUDIENCE_PREFERENCE = 'audience_preference'
}

export enum TrendDirection {
  RISING = 'rising',
  FALLING = 'falling',
  STABLE = 'stable',
  CYCLICAL = 'cyclical',
  EMERGING = 'emerging'
}

export enum TrendStrength {
  WEAK = 'weak',
  MODERATE = 'moderate',
  STRONG = 'strong',
  VERY_STRONG = 'very_strong'
}

// ============================================================================
// 支援型定義（詳細実装用）
// ============================================================================

export interface NarrativeContext {
  genre: string;
  style: string;
  targetAudience: string;
  narrativeStructure: string;
  pacing: string;
  tone: string;
}

export interface GenreContext {
  primaryGenre: string;
  subGenres: string[];
  conventions: GenreConvention[];
  expectations: GenreExpectation[];
  flexibility: number;
}

export interface AudienceContext {
  targetDemographic: string;
  experienceLevel: string;
  preferences: AudiencePreference[];
  expectations: AudienceExpectation[];
  tolerance: ToleranceLevel;
}

export interface StyleContext {
  writingStyle: string;
  narrativevoice: string;
  complexity: string;
  literaryDevice: string[];
  artisticGoals: string[];
}

export interface ContextConstraints {
  lengthConstraints: LengthConstraint[];
  structuralConstraints: StructuralConstraint[];
  contentConstraints: ContentConstraint[];
  qualityConstraints: QualityConstraint[];
  timeConstraints: TimeConstraint[];
}

export interface ForeshadowingObjectives {
  primaryObjectives: string[];
  secondaryObjectives: string[];
  qualityGoals: QualityGoal[];
  engagementGoals: EngagementGoal[];
  satisfactionTargets: SatisfactionTarget[];
}

// 型エイリアス（詳細実装用）
export type RelationshipTiming = any;
export type StructureAssessment = any;
export type LayeringAnalysis = any;
export type DistributionAnalysis = any;
export type TimingAnalysis = any;
export type DependencyAnalysis = any;
export type CoherenceAnalysis = any;
export type DensityIssue = any;
export type DensityRecommendation = any;
export type SubtletyBalance = any;
export type SubtletyIssue = any;
export type SubtletyAdjustment = any;
export type InconsistencyIssue = any;
export type SatisfactionPrediction = any;
export type EffectivenessImprovement = any;
export type QualityDimension = any;
export type QualityStrength = any;
export type QualityWeakness = any;
export type BenchmarkComparison = any;
export type QualityTrendAnalysis = any;
export type DetectionMetrics = any;
export type PlacementMetrics = any;
export type ResolutionMetrics = any;
export type QualityMetrics = any;
export type PerformanceMetrics = any;
export type EngagementMetrics = any;
export type ResolutionStatistics = any;
export type QualityDistribution = any;
export type EffectivenessStatistics = any;
export type SystemPerformanceStatistics = any;
export type ReportPeriod = any;
export type ExecutiveSummary = any;
export type DetectionResults = any;
export type PlacementAnalysis = any;
export type ResolutionTracking = any;
export type QualityAssessmentReport = any;
export type ReportRecommendation = any;
export type ActionItem = any;
export type ReferenceWork = any;
export type BenchmarkQualityStandards = any;
export type BenchmarkPerformanceMetrics = any;
export type ComparisonResult = any;
export type RelativePerformance = any;
export type TrendTimeframe = any;
export type TrendInfluencingFactor = any;
export type TrendPrediction = any;
export type QualityStandards = any;
export type EvaluationCriteria = any;
export type BalanceRequirements = any;
export type IntegrationRequirements = any;
export type EffectivenessMetrics = any;
export type SatisfactionCriteria = any;
export type GenreConvention = any;
export type GenreExpectation = any;
export type AudiencePreference = any;
export type AudienceExpectation = any;
export type ToleranceLevel = any;
export type LengthConstraint = any;
export type StructuralConstraint = any;
export type ContentConstraint = any;
export type QualityConstraint = any;
export type TimeConstraint = any;
export type QualityGoal = any;
export type EngagementGoal = any;
export type SatisfactionTarget = any;
export type ObjectiveType = any;
export type StrategyApproach = any;
export type PlacementPlan = any;
export type ResolutionPlan = any;
export type StrategyTimeline = any;
export type QualityTargets = any;
export type StrategyConstraints = any;
export type StrategyMetrics = any;
export type StrategyAdaptability = any;
export type PlacementLocation = any;
export type PlacementContent = any;
export type IntegrationMethod = any;
export type PlacementTiming = any;
export type PlacementDependency = any;
export type PlacementValidation = any;
export type ResolutionContent = any;
export type PayoffMoment = any;
export type ConsistencyLevel = any;
export type CompletenessLevel = any;
export type ResolutionImpact = any;
export type ResolutionValidation = any;
export type ConsistencyCheck = any;
export type IntegrationCheck = any;
export type QualityCheck = any;
export type ValidationIssue = any;
export type ValidationWarning = any;
export type ValidationRecommendation = any;
export type OptimizationMetrics = any;
export type OptimizationImprovement = any;
export type OptimizationTradeoff = any;
export type QualityGain = any;
export type PerformanceImpact = any;
export type AnalysisRecommendation = any;
export type TimePeriod = any;