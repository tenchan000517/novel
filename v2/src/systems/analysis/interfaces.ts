/**
 * Analysis System Interfaces
 * 
 * 分析システムのインターフェース定義
 * Version 2.0要件: 品質リアルタイム分析・改善提案・読者体験予測
 */

import type { OperationResult, SystemId } from '@/types/common';

// ============================================================================
// コアインターフェース
// ============================================================================

export interface IAnalysisEngine {
  readonly systemId: SystemId;
  
  // 品質分析
  analyzeQuality(content: string, context: AnalysisContext): Promise<OperationResult<QualityAnalysis>>;
  assessReadability(content: string): Promise<OperationResult<ReadabilityAssessment>>;
  evaluateEngagement(content: string, targetAudience: AudienceProfile): Promise<OperationResult<EngagementEvaluation>>;
  
  // 読者体験分析
  simulateReaderExperience(content: string, readerProfile: ReaderProfile): Promise<OperationResult<ReaderExperienceSimulation>>;
  trackEmotionalJourney(content: string): Promise<OperationResult<EmotionalJourneyMap>>;
  predictSatisfaction(content: string, expectations: ReaderExpectations): Promise<OperationResult<SatisfactionPrediction>>;
  
  // 物語分析
  analyzeNarrativeStructure(content: string): Promise<OperationResult<NarrativeStructureAnalysis>>;
  evaluatePacing(content: string): Promise<OperationResult<PacingEvaluation>>;
  analyzeTensionCurve(content: string): Promise<OperationResult<TensionCurveAnalysis>>;
  
  // 改善提案
  generateImprovements(analysis: QualityAnalysis): Promise<OperationResult<ImprovementSuggestions>>;
  identifyWeaknesses(content: string): Promise<OperationResult<WeaknessIdentification>>;
  suggestEnhancements(content: string, goals: QualityGoals): Promise<OperationResult<EnhancementSuggestions>>;
  
  // 統合分析
  performComprehensiveAnalysis(content: string): Promise<OperationResult<ComprehensiveAnalysis>>;
  compareWithBenchmark(analysis: QualityAnalysis, benchmark: QualityBenchmark): Promise<OperationResult<BenchmarkComparison>>;
  
  // 統計・報告
  getAnalysisStatistics(): Promise<OperationResult<AnalysisStatistics>>;
  generateAnalysisReport(analyses: QualityAnalysis[]): Promise<OperationResult<AnalysisReport>>;
}

// ============================================================================
// 品質分析
// ============================================================================

export interface AnalysisContext {
  chapterNumber: number;
  genre: GenreType;
  targetAudience: AudienceProfile;
  previousAnalyses?: QualityAnalysis[];
  qualityGoals: QualityGoals;
  analysisDepth: AnalysisDepth;
}

export interface QualityAnalysis {
  overallScore: number;
  dimensions: QualityDimension[];
  strengths: StrengthPoint[];
  weaknesses: WeaknessPoint[];
  trends: QualityTrend[];
  recommendations: QualityRecommendation[];
  timestamp: string;
}

export interface ReadabilityAssessment {
  readabilityScore: number;
  complexityLevel: ComplexityLevel;
  sentenceAnalysis: SentenceMetrics;
  vocabularyAnalysis: VocabularyMetrics;
  structureAnalysis: StructureMetrics;
  recommendations: ReadabilityRecommendation[];
}

export interface EngagementEvaluation {
  engagementScore: number;
  attentionCurve: AttentionPoint[];
  interestPeaks: InterestPeak[];
  emotionalHooks: EmotionalHook[];
  pageturnerQuotient: number;
  dropoffRisks: DropoffRisk[];
}

// ============================================================================
// 読者体験分析
// ============================================================================

export interface ReaderProfile {
  demographicData: DemographicData;
  readingPreferences: ReadingPreferences;
  experienceLevel: ExperienceLevel;
  emotionalTriggers: EmotionalTrigger[];
  expectations: ExpectationSet;
}

export interface ReaderExperienceSimulation {
  experienceTimeline: ExperiencePoint[];
  emotionalJourney: EmotionalState[];
  comprehensionLevel: ComprehensionCurve;
  immersionDepth: ImmersionMetrics;
  satisfactionPrediction: number;
  memorablePoints: MemorablePoint[];
}

export interface EmotionalJourneyMap {
  emotionalStates: EmotionalCheckpoint[];
  peakMoments: EmotionalPeak[];
  valleys: EmotionalValley[];
  transitions: EmotionalTransition[];
  overallArc: EmotionalArc;
  catharticMoments: CatharticMoment[];
}

export interface SatisfactionPrediction {
  predictedScore: number;
  confidenceLevel: number;
  satisfactionFactors: SatisfactionFactor[];
  riskFactors: DissatisfactionRisk[];
  improvementPotential: ImprovementPotential[];
}

// ============================================================================
// 物語分析
// ============================================================================

export interface NarrativeStructureAnalysis {
  structureType: NarrativeStructureType;
  actBreakdown: ActAnalysis[];
  plotPoints: PlotPoint[];
  narrativeBalance: NarrativeBalance;
  coherenceScore: number;
  flowAnalysis: FlowMetrics;
}

export interface PacingEvaluation {
  overallPacing: PacingScore;
  pacingCurve: PacingPoint[];
  rhythmAnalysis: RhythmMetrics;
  tempoVariations: TempoVariation[];
  monotonyRisks: MonotonyRisk[];
  recommendations: PacingRecommendation[];
}

export interface TensionCurveAnalysis {
  tensionProfile: TensionPoint[];
  climaxIdentification: ClimaxPoint[];
  tensionBuildup: BuildupAnalysis;
  releasePoints: ReleasePoint[];
  sustainabilityScore: number;
  effectivenessRating: number;
}

// ============================================================================
// 改善提案
// ============================================================================

export interface ImprovementSuggestions {
  prioritizedImprovements: PrioritizedImprovement[];
  quickFixes: QuickFix[];
  structuralChanges: StructuralChange[];
  styleEnhancements: StyleEnhancement[];
  implementationGuide: ImplementationGuide;
  expectedImpact: ImpactProjection;
}

export interface WeaknessIdentification {
  criticalWeaknesses: CriticalWeakness[];
  minorIssues: MinorIssue[];
  potentialProblems: PotentialProblem[];
  systemicPatterns: SystemicPattern[];
  rootCauses: RootCause[];
}

export interface EnhancementSuggestions {
  contentEnhancements: ContentEnhancement[];
  structuralOptimizations: StructuralOptimization[];
  emotionalAmplifications: EmotionalAmplification[];
  stylishticImprovements: StylisticImprovement[];
  expectedOutcomes: ExpectedOutcome[];
}

// ============================================================================
// 統合分析
// ============================================================================

export interface ComprehensiveAnalysis {
  summary: AnalysisSummary;
  qualityAnalysis: QualityAnalysis;
  readerExperience: ReaderExperienceSimulation;
  narrativeStructure: NarrativeStructureAnalysis;
  improvementPlan: ImprovementPlan;
  benchmarkComparison: BenchmarkResult;
  confidenceMetrics: ConfidenceMetrics;
}

export interface AnalysisStatistics {
  totalAnalyses: number;
  averageQualityScore: number;
  qualityTrends: QualityTrendData[];
  commonIssues: CommonIssueStatistics[];
  improvementSuccessRate: number;
  systemPerformance: PerformanceMetrics;
}

export interface AnalysisReport {
  reportId: string;
  generatedAt: string;
  period: ReportPeriod;
  executiveSummary: ExecutiveSummary;
  detailedFindings: DetailedFindings;
  recommendations: StrategicRecommendations;
  visualizations: DataVisualization[];
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

export enum ComplexityLevel {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  VERY_COMPLEX = 'very_complex'
}

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum NarrativeStructureType {
  THREE_ACT = 'three_act',
  FIVE_ACT = 'five_act',
  HEROS_JOURNEY = 'heros_journey',
  KISHOTENKETSU = 'kishotenketsu',
  NONLINEAR = 'nonlinear',
  EPISODIC = 'episodic'
}

export enum ImprovementPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  OPTIONAL = 'optional'
}

export enum AnalysisType {
  QUALITY = 'quality',
  READABILITY = 'readability',
  ENGAGEMENT = 'engagement',
  STRUCTURE = 'structure',
  PACING = 'pacing',
  EMOTIONAL = 'emotional',
  COMPREHENSIVE = 'comprehensive'
}

export enum QualityDimensionType {
  CLARITY = 'clarity',
  COHERENCE = 'coherence',
  CREATIVITY = 'creativity',
  DEPTH = 'depth',
  AUTHENTICITY = 'authenticity',
  IMPACT = 'impact'
}

// ============================================================================
// 型エイリアス（詳細実装用）
// ============================================================================

export type GenreType = any;
export type AudienceProfile = any;
export type QualityGoals = any;
export type QualityDimension = any;
export type StrengthPoint = any;
export type WeaknessPoint = any;
export type QualityTrend = any;
export type QualityRecommendation = any;
export type SentenceMetrics = any;
export type VocabularyMetrics = any;
export type StructureMetrics = any;
export type ReadabilityRecommendation = any;
export type AttentionPoint = any;
export type InterestPeak = any;
export type EmotionalHook = any;
export type DropoffRisk = any;
export type DemographicData = any;
export type ReadingPreferences = any;
export type EmotionalTrigger = any;
export type ExpectationSet = any;
export type ReaderExpectations = any;
export type ExperiencePoint = any;
export type EmotionalState = any;
export type ComprehensionCurve = any;
export type ImmersionMetrics = any;
export type MemorablePoint = any;
export type EmotionalCheckpoint = any;
export type EmotionalPeak = any;
export type EmotionalValley = any;
export type EmotionalTransition = any;
export type EmotionalArc = any;
export type CatharticMoment = any;
export type SatisfactionFactor = any;
export type DissatisfactionRisk = any;
export type ImprovementPotential = any;
export type ActAnalysis = any;
export type PlotPoint = any;
export type NarrativeBalance = any;
export type FlowMetrics = any;
export type PacingScore = any;
export type PacingPoint = any;
export type RhythmMetrics = any;
export type TempoVariation = any;
export type MonotonyRisk = any;
export type PacingRecommendation = any;
export type TensionPoint = any;
export type ClimaxPoint = any;
export type BuildupAnalysis = any;
export type ReleasePoint = any;
export type PrioritizedImprovement = any;
export type QuickFix = any;
export type StructuralChange = any;
export type StyleEnhancement = any;
export type ImplementationGuide = any;
export type ImpactProjection = any;
export type CriticalWeakness = any;
export type MinorIssue = any;
export type PotentialProblem = any;
export type SystemicPattern = any;
export type RootCause = any;
export type ContentEnhancement = any;
export type StructuralOptimization = any;
export type EmotionalAmplification = any;
export type StylisticImprovement = any;
export type ExpectedOutcome = any;
export type AnalysisSummary = any;
export type ImprovementPlan = any;
export type BenchmarkResult = any;
export type ConfidenceMetrics = any;
export type QualityBenchmark = any;
export type BenchmarkComparison = any;
export type QualityTrendData = any;
export type CommonIssueStatistics = any;
export type PerformanceMetrics = any;
export type ReportPeriod = any;
export type ExecutiveSummary = any;
export type DetailedFindings = any;
export type StrategicRecommendations = any;
export type DataVisualization = any;