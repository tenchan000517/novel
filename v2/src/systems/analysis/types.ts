/**
 * Analysis System Types
 * 
 * 分析システムの型定義
 * Version 2.0要件: 品質リアルタイム分析・改善提案・読者体験予測の型定義
 */

import type { SystemId } from '@/types/common';

// ============================================================================
// システム設定・設定
// ============================================================================

export interface AnalysisEngineConfig {
  enableQualityAnalysis: boolean;
  enableReaderExperienceSimulation: boolean;
  enableNarrativeStructureAnalysis: boolean;
  enablePacingAnalysis: boolean;
  enableTensionAnalysis: boolean;
  enableImprovementSuggestions: boolean;
  defaultAnalysisDepth: AnalysisDepth;
  qualityThreshold: number;
  engagementThreshold: number;
  realTimeAnalysis: boolean;
  cacheAnalysisResults: boolean;
  batchProcessing: boolean;
  parallelAnalysis: boolean;
}

export interface QualityAnalysisConfig {
  strictMode: boolean;
  professionalStandards: boolean;
  genreSpecificCriteria: boolean;
  audienceAdaptation: boolean;
  customWeights: QualityWeightConfig;
  benchmarkComparison: boolean;
  trendAnalysis: boolean;
  predictiveAnalysis: boolean;
}

export interface ReaderExperienceConfig {
  simulationAccuracy: SimulationAccuracy;
  emotionalDepthLevel: EmotionalDepthLevel;
  personalityModeling: boolean;
  demographicFactoring: boolean;
  experiencePersonalization: boolean;
  realTimeTracking: boolean;
  longitudinalStudy: boolean;
  satisfactionPrediction: boolean;
}

export interface NarrativeAnalysisConfig {
  structureDetection: boolean;
  pacingEvaluation: boolean;
  tensionTracking: boolean;
  flowOptimization: boolean;
  genreConventions: boolean;
  creativityAssessment: boolean;
  benchmarkComparison: boolean;
  improvementSuggestions: boolean;
}

export interface ImprovementEngineConfig {
  suggestionDetail: SuggestionDetailLevel;
  prioritization: PrioritizationStrategy;
  implementationGuides: boolean;
  impactProjection: boolean;
  customizationLevel: CustomizationLevel;
  learningFromHistory: boolean;
  adaptiveRecommendations: boolean;
  contextAwareness: boolean;
}

// ============================================================================
// 品質分析詳細型
// ============================================================================

export interface QualityMetrics {
  clarity: ClarityMetrics;
  coherence: CoherenceMetrics;
  creativity: CreativityMetrics;
  depth: DepthMetrics;
  authenticity: AuthenticityMetrics;
  impact: ImpactMetrics;
  readability: any; // TODO: ReadabilityMetrics interface
  engagement: any; // TODO: EngagementMetrics interface
}

export interface ClarityMetrics {
  overallClarity: number;
  sentenceClarity: number;
  conceptClarity: number;
  intentionClarity: number;
  ambiguityScore: number;
  clarificationNeeds: ClarificationNeed[];
}

export interface CoherenceMetrics {
  logicalFlow: number;
  causalConsistency: number;
  temporalConsistency: number;
  thematicConsistency: number;
  characterConsistency: number;
  inconsistencies: Inconsistency[];
}

export interface CreativityMetrics {
  originalityScore: number;
  innovationLevel: number;
  uniqueElements: UniqueElement[];
  clicheDetection: ClicheDetection[];
  creativePotential: CreativePotential;
  surpriseFactor: number;
}

export interface DepthMetrics {
  emotionalDepth: number;
  intellectualDepth: number;
  psychologicalDepth: number;
  philosophicalDepth: number;
  layeredMeaning: LayeredMeaning[];
  complexityBalance: ComplexityBalance;
}

export interface AuthenticityMetrics {
  characterAuthenticity: number;
  emotionalAuthenticity: number;
  situationalAuthenticity: number;
  dialogueAuthenticity: number;
  authenticityIssues: AuthenticityIssue[];
  believabilityScore: number;
}

export interface ImpactMetrics {
  emotionalImpact: number;
  intellectualImpact: number;
  memorabilityScore: number;
  shareabilityScore: number;
  transformativeCapacity: number;
  lastingEffect: number;
}

// ============================================================================
// 読者体験分析詳細型
// ============================================================================

export interface ReaderExperienceMetrics {
  immersionLevel: ImmersionLevel;
  emotionalEngagement: EmotionalEngagement;
  cognitiveLoad: CognitiveLoad;
  attentionSpan: AttentionSpan;
  comprehensionRate: ComprehensionRate;
  satisfactionLevel: SatisfactionLevel;
}

export interface ImmersionLevel {
  overallImmersion: number;
  visualImmersion: number;
  emotionalImmersion: number;
  intellectualImmersion: number;
  immersionBreaks: ImmersionBreak[];
  immersionBuilders: ImmersionBuilder[];
}

export interface EmotionalEngagement {
  engagementStrength: number;
  emotionalRange: number;
  empathyLevel: number;
  catharsisPoints: CatharsisPoint[];
  emotionalResonance: EmotionalResonance[];
  disconnectionRisks: DisconnectionRisk[];
}

export interface CognitiveLoad {
  processingDemand: number;
  complexityBurden: number;
  informationDensity: number;
  cognitiveStrain: CognitiveStrain[];
  optimizationOpportunities: OptimizationOpportunity[];
}

export interface AttentionSpan {
  sustainedAttention: number;
  peakAttentionPoints: AttentionPeak[];
  attentionDrops: AttentionDrop[];
  recoveryPoints: RecoveryPoint[];
  attentionMaintenance: AttentionMaintenance;
}

export interface SatisfactionLevel {
  overallSatisfaction: number;
  expectationFulfillment: number;
  surpriseDelight: number;
  emotionalPayoff: number;
  intellectualReward: number;
  rereadValue: number;
}

// ============================================================================
// 物語構造分析詳細型
// ============================================================================

export interface StructuralMetrics {
  plotStructure: PlotStructureMetrics;
  characterArcs: CharacterArcMetrics;
  thematicDevelopment: ThematicDevelopmentMetrics;
  pacing: PacingMetrics;
  tension: TensionMetrics;
  resolution: ResolutionMetrics;
}

export interface PlotStructureMetrics {
  structureType: StructureType;
  completeness: number;
  balance: number;
  progression: number;
  plotHoles: PlotHole[];
  strengthAreas: StructuralStrength[];
}

export interface CharacterArcMetrics {
  developmentDepth: number;
  arcCompleteness: number;
  motivationClarity: number;
  growthAuthenticity: number;
  relationshipDynamics: RelationshipDynamics;
  characterConsistency: number;
}

export interface ThematicDevelopmentMetrics {
  themeClarity: number;
  themeIntegration: number;
  themeEvolution: number;
  messageCohesion: number;
  subtlety: number;
  universalRelevance: number;
}

export interface PacingMetrics {
  overallPacing: number;
  rhythmVariation: number;
  momentumMaintenance: number;
  tensionBuilding: number;
  releaseEffectiveness: number;
  pacingOptimality: PacingOptimality;
}

export interface TensionMetrics {
  tensionLevel: number;
  tensionVariation: number;
  buildupEffectiveness: number;
  releaseImpact: number;
  sustainabilityScore: number;
  climaxImpact: number;
}

// ============================================================================
// 改善提案詳細型
// ============================================================================

export interface ImprovementAnalysis {
  weaknessIdentification: WeaknessAnalysis;
  strengthAmplification: StrengthAmplification;
  optimizationTargets: OptimizationTarget[];
  implementationStrategy: ImplementationStrategy;
  expectedResults: ExpectedResult[];
  riskAssessment: RiskAssessment;
}

export interface WeaknessAnalysis {
  structuralWeaknesses: StructuralWeakness[];
  contentWeaknesses: ContentWeakness[];
  styleWeaknesses: StyleWeakness[];
  technicalWeaknesses: TechnicalWeakness[];
  systemicIssues: SystemicIssue[];
}

export interface StrengthAmplification {
  identifiedStrengths: IdentifiedStrength[];
  amplificationStrategies: AmplificationStrategy[];
  leverageOpportunities: LeverageOpportunity[];
  uniqueSellingPoints: UniqueSellingPoint[];
}

export interface OptimizationTarget {
  targetArea: OptimizationArea;
  currentState: CurrentState;
  desiredState: DesiredState;
  optimizationPath: OptimizationPath;
  effort: OptimizationEffort;
  impact: OptimizationImpact;
}

export interface ImplementationStrategy {
  phaseApproach: ImplementationPhase[];
  resourceRequirements: ResourceRequirement[];
  timeEstimation: TimeEstimation;
  riskMitigation: RiskMitigation[];
  successMetrics: SuccessMetric[];
}

// ============================================================================
// 報告・統計詳細型
// ============================================================================

export interface AnalysisReportData {
  reportMetadata: ReportMetadata;
  executiveInsights: ExecutiveInsights;
  detailedAnalysis: DetailedAnalysisData;
  comparativeAnalysis: ComparativeAnalysis;
  trendsAndPatterns: TrendsAndPatterns;
  actionableRecommendations: ActionableRecommendations;
}

export interface ReportMetadata {
  reportId: string;
  generationTimestamp: string;
  analysisScope: AnalysisScope;
  dataQuality: DataQuality;
  confidenceLevel: number;
  limitations: ReportLimitation[];
}

export interface ExecutiveInsights {
  keySummary: KeySummary;
  majorFindings: MajorFinding[];
  criticalIssues: CriticalIssue[];
  quickWins: QuickWin[];
  strategicRecommendations: StrategicRecommendation[];
}

export interface DetailedAnalysisData {
  qualityBreakdown: QualityBreakdown;
  readerExperienceProfile: ReaderExperienceProfile;
  narrativeAssessment: NarrativeAssessment;
  technicalAnalysis: TechnicalAnalysis;
  competitivePosition: CompetitivePosition;
}

export interface ComparativeAnalysis {
  benchmarkComparison: BenchmarkComparison;
  historicalTrends: HistoricalTrend[];
  peerAnalysis: PeerAnalysis;
  industryStandards: IndustryStandard[];
  improvementTrajectory: ImprovementTrajectory;
}

export interface TrendsAndPatterns {
  qualityTrends: QualityTrend[];
  readerPreferenceTrends: ReaderPreferenceTrend[];
  emergingPatterns: EmergingPattern[];
  seasonalVariations: SeasonalVariation[];
  predictiveInsights: PredictiveInsight[];
}

// ============================================================================
// パフォーマンス・監視
// ============================================================================

export interface AnalysisPerformanceMetrics {
  processingSpeed: ProcessingSpeedMetrics;
  accuracyMetrics: AccuracyMetrics;
  resourceUtilization: ResourceUtilization;
  scalabilityMetrics: ScalabilityMetrics;
  reliabilityMetrics: ReliabilityMetrics;
}

export interface ProcessingSpeedMetrics {
  averageAnalysisTime: number;
  quickAnalysisTime: number;
  deepAnalysisTime: number;
  comprehensiveAnalysisTime: number;
  batchProcessingSpeed: number;
  realTimePerformance: number;
}

export interface AccuracyMetrics {
  predictionAccuracy: number;
  classificationAccuracy: number;
  detectionPrecision: number;
  detectionRecall: number;
  confidenceCalibration: number;
  validationResults: ValidationResult[];
}

export interface SystemIntegrationMetrics {
  characterSystemIntegration: CharacterSystemIntegration;
  expressionSystemIntegration: ExpressionSystemIntegration;
  plotSystemIntegration: PlotSystemIntegration;
  memorySystemIntegration: MemorySystemIntegration;
  crossSystemSynergy: CrossSystemSynergy;
}

// ============================================================================
// 列挙型
// ============================================================================

export enum AnalysisDepth {
  QUICK = 'quick',
  STANDARD = 'standard',
  DEEP = 'deep',
  COMPREHENSIVE = 'comprehensive'
}

export enum SimulationAccuracy {
  BASIC = 'basic',
  STANDARD = 'standard',
  HIGH = 'high',
  RESEARCH_GRADE = 'research_grade'
}

export enum EmotionalDepthLevel {
  SURFACE = 'surface',
  MODERATE = 'moderate',
  DEEP = 'deep',
  PROFOUND = 'profound'
}

export enum SuggestionDetailLevel {
  OVERVIEW = 'overview',
  DETAILED = 'detailed',
  COMPREHENSIVE = 'comprehensive',
  IMPLEMENTATION_READY = 'implementation_ready'
}

export enum PrioritizationStrategy {
  IMPACT_FIRST = 'impact_first',
  EFFORT_OPTIMIZED = 'effort_optimized',
  BALANCED = 'balanced',
  CUSTOM = 'custom'
}

export enum CustomizationLevel {
  MINIMAL = 'minimal',
  MODERATE = 'moderate',
  HIGH = 'high',
  MAXIMUM = 'maximum'
}

export enum OptimizationArea {
  CONTENT_QUALITY = 'content_quality',
  READER_EXPERIENCE = 'reader_experience',
  NARRATIVE_STRUCTURE = 'narrative_structure',
  STYLE_ENHANCEMENT = 'style_enhancement',
  ENGAGEMENT_OPTIMIZATION = 'engagement_optimization'
}

export enum AnalysisScope {
  CHAPTER = 'chapter',
  SECTION = 'section',
  FULL_WORK = 'full_work',
  COMPARATIVE = 'comparative',
  LONGITUDINAL = 'longitudinal'
}

export enum ReportFormat {
  EXECUTIVE = 'executive',
  DETAILED = 'detailed',
  TECHNICAL = 'technical',
  COMPARATIVE = 'comparative',
  TRENDS = 'trends'
}

// ============================================================================
// 型エイリアス（詳細実装用）
// ============================================================================

export type QualityWeightConfig = any;
export type ClarificationNeed = any;
export type Inconsistency = any;
export type UniqueElement = any;
export type ClicheDetection = any;
export type CreativePotential = any;
export type LayeredMeaning = any;
export type ComplexityBalance = any;
export type AuthenticityIssue = any;
export type ImmersionBreak = any;
export type ImmersionBuilder = any;
export type CatharsisPoint = any;
export type EmotionalResonance = any;
export type DisconnectionRisk = any;
export type CognitiveStrain = any;
export type OptimizationOpportunity = any;
export type AttentionPeak = any;
export type AttentionDrop = any;
export type RecoveryPoint = any;
export type AttentionMaintenance = any;
export type ComprehensionRate = any;
export type StructureType = any;
export type PlotHole = any;
export type StructuralStrength = any;
export type RelationshipDynamics = any;
export type PacingOptimality = any;
export type ResolutionMetrics = any;
export type StructuralWeakness = any;
export type ContentWeakness = any;
export type StyleWeakness = any;
export type TechnicalWeakness = any;
export type SystemicIssue = any;
export type IdentifiedStrength = any;
export type AmplificationStrategy = any;
export type LeverageOpportunity = any;
export type UniqueSellingPoint = any;
export type CurrentState = any;
export type DesiredState = any;
export type OptimizationPath = any;
export type OptimizationEffort = any;
export type OptimizationImpact = any;
export type ImplementationPhase = any;
export type ResourceRequirement = any;
export type TimeEstimation = any;
export type RiskMitigation = any;
export type SuccessMetric = any;
export type DataQuality = any;
export type ReportLimitation = any;
export type KeySummary = any;
export type MajorFinding = any;
export type CriticalIssue = any;
export type QuickWin = any;
export type StrategicRecommendation = any;
export type QualityBreakdown = any;
export type ReaderExperienceProfile = any;
export type NarrativeAssessment = any;
export type TechnicalAnalysis = any;
export type CompetitivePosition = any;
export type BenchmarkComparison = any;
export type HistoricalTrend = any;
export type PeerAnalysis = any;
export type IndustryStandard = any;
export type ImprovementTrajectory = any;
export type QualityTrend = any;
export type ReaderPreferenceTrend = any;
export type EmergingPattern = any;
export type SeasonalVariation = any;
export type PredictiveInsight = any;
export type ResourceUtilization = any;
export type ScalabilityMetrics = any;
export type ReliabilityMetrics = any;
export type ValidationResult = any;
export type CharacterSystemIntegration = any;
export type ExpressionSystemIntegration = any;
export type PlotSystemIntegration = any;
export type MemorySystemIntegration = any;
export type CrossSystemSynergy = any;
export type ActionableRecommendations = any;
export type RiskAssessment = any;
export type ExpectedResult = any;