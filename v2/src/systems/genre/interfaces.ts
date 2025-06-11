/**
 * Genre Management System Interfaces
 * 
 * ジャンル管理システムのインターフェース定義
 * Version 2.0要件: ジャンル分析・適応・品質管理
 */

import type { OperationResult, SystemId } from '@/types/common';
import type {
  GenreManagerConfig,
  GenreProfile,
  GenreAnalysis,
  GenreAdaptation,
  GenreValidation,
  GenreOptimization,
  GenreContext,
  GenreMetrics,
  GenreClassification,
  GenreStatistics,
  GenreReport,
  GenreType,
  GenreComplexity,
  GenreStyle,
  GenreConvention,
  GenreTrend,
  GenreBenchmark
} from './types';

// ============================================================================
// メインジャンルマネージャーインターフェース
// ============================================================================

export interface IGenreManager {
  readonly systemId: SystemId;

  // ジャンル分析
  analyzeGenre(content: string, context: GenreContext): Promise<OperationResult<GenreAnalysis>>;
  classifyGenre(content: string): Promise<OperationResult<GenreClassification>>;
  detectGenreElements(content: string): Promise<OperationResult<GenreElement[]>>;
  assessGenreCompliance(content: string, targetGenre: GenreType): Promise<OperationResult<GenreCompliance>>;

  // ジャンル適応
  adaptToGenre(content: string, targetGenre: GenreType): Promise<OperationResult<GenreAdaptation>>;
  optimizeGenreAlignment(content: string, genre: GenreProfile): Promise<OperationResult<GenreOptimization>>;
  enhanceGenreCharacteristics(content: string, genre: GenreType): Promise<OperationResult<string>>;
  validateGenreConsistency(content: string, expectedGenre: GenreType): Promise<OperationResult<GenreValidation>>;

  // ジャンルプロファイル管理
  createGenreProfile(genreType: GenreType, context: GenreContext): Promise<OperationResult<GenreProfile>>;
  getGenreProfile(genreType: GenreType): Promise<OperationResult<GenreProfile>>;
  updateGenreProfile(genreType: GenreType, updates: Partial<GenreProfile>): Promise<OperationResult<GenreProfile>>;
  customizeGenreProfile(genreType: GenreType, customizations: GenreCustomization): Promise<OperationResult<GenreProfile>>;

  // ジャンル品質管理
  evaluateGenreQuality(content: string, genre: GenreType): Promise<OperationResult<GenreMetrics>>;
  benchmarkGenrePerformance(content: string, genre: GenreType): Promise<OperationResult<GenreBenchmark>>;
  generateGenreRecommendations(analysis: GenreAnalysis): Promise<OperationResult<GenreRecommendation[]>>;
  monitorGenreTrends(): Promise<OperationResult<GenreTrend[]>>;

  // 統計・報告
  getGenreStatistics(): Promise<OperationResult<GenreStatistics>>;
  generateGenreReport(period: TimePeriod): Promise<OperationResult<GenreReport>>;
  trackGenreEvolution(genreType: GenreType): Promise<OperationResult<GenreEvolution>>;

  // システム管理
  healthCheck(): Promise<{ healthy: boolean; issues: string[] }>;
}

// ============================================================================
// ジャンル分析インターフェース
// ============================================================================

export interface IGenreAnalyzer {
  // 基本分析
  analyzeGenreCharacteristics(content: string): Promise<OperationResult<GenreCharacteristics>>;
  identifyGenreMarkers(content: string): Promise<OperationResult<GenreMarker[]>>;
  assessGenreStrength(content: string, genreType: GenreType): Promise<OperationResult<GenreStrength>>;

  // 高度分析
  analyzeGenreHybridization(content: string): Promise<OperationResult<GenreHybrid>>;
  detectGenreInnovation(content: string): Promise<OperationResult<GenreInnovation>>;
  evaluateGenreAuthenticity(content: string, genreType: GenreType): Promise<OperationResult<GenreAuthenticity>>;

  // 比較分析
  compareGenreVariants(content: string, variants: GenreType[]): Promise<OperationResult<GenreComparison>>;
  analyzeGenreEvolution(historicalData: GenreHistoricalData): Promise<OperationResult<GenreEvolutionAnalysis>>;
  benchmarkAgainstGenreStandards(content: string, genre: GenreType): Promise<OperationResult<GenreStandardsComparison>>;
}

// ============================================================================
// ジャンル適応インターフェース
// ============================================================================

export interface IGenreAdapter {
  // 基本適応
  adaptContent(content: string, targetGenre: GenreType): Promise<OperationResult<AdaptedContent>>;
  adjustGenreElements(content: string, adjustments: GenreAdjustment[]): Promise<OperationResult<string>>;
  enhanceGenreCompliance(content: string, genre: GenreProfile): Promise<OperationResult<string>>;

  // 高度適応
  performGenreTransformation(content: string, transformation: GenreTransformation): Promise<OperationResult<string>>;
  blendGenres(content: string, genreBlend: GenreBlend): Promise<OperationResult<string>>;
  innovateGenreExpression(content: string, innovation: GenreInnovationGoals): Promise<OperationResult<string>>;

  // 適応制御
  calibrateAdaptation(content: string, calibration: AdaptationCalibration): Promise<OperationResult<AdaptationResult>>;
  validateAdaptationQuality(original: string, adapted: string): Promise<OperationResult<AdaptationValidation>>;
  revertAdaptation(content: string, revertTo: GenreState): Promise<OperationResult<string>>;
}

// ============================================================================
// ジャンル品質管理インターフェース
// ============================================================================

export interface IGenreQualityController {
  // 品質評価
  evaluateGenreQuality(content: string, genre: GenreType): Promise<OperationResult<GenreQualityAssessment>>;
  assessGenreConsistency(content: string, genre: GenreType): Promise<OperationResult<GenreConsistencyReport>>;
  validateGenreStandards(content: string, standards: GenreStandards): Promise<OperationResult<StandardsValidation>>;

  // 品質改善
  identifyQualityIssues(content: string, genre: GenreType): Promise<OperationResult<GenreQualityIssue[]>>;
  generateImprovementPlan(issues: GenreQualityIssue[]): Promise<OperationResult<GenreImprovementPlan>>;
  implementQualityEnhancements(content: string, plan: GenreImprovementPlan): Promise<OperationResult<string>>;

  // 品質監視
  monitorGenreQuality(content: string, genre: GenreType): Promise<OperationResult<GenreQualityMonitoring>>;
  alertOnQualityDeviations(deviations: GenreQualityDeviation[]): Promise<OperationResult<QualityAlert[]>>;
  trackQualityTrends(genre: GenreType, timeframe: TimeFrame): Promise<OperationResult<QualityTrend[]>>;
}

// ============================================================================
// ジャンル学習インターフェース
// ============================================================================

export interface IGenreLearningEngine {
  // パターン学習
  learnGenrePatterns(examples: GenreExample[]): Promise<OperationResult<GenrePattern[]>>;
  updateGenreKnowledge(feedback: GenreFeedback[]): Promise<OperationResult<KnowledgeUpdate>>;
  adaptToGenreTrends(trends: GenreTrend[]): Promise<OperationResult<TrendAdaptation>>;

  // 予測機能
  predictGenreSuccess(content: string, genre: GenreType): Promise<OperationResult<GenreSuccessPrediction>>;
  forecastGenreTrends(currentData: GenreMarketData): Promise<OperationResult<GenreForecast>>;
  recommendGenreStrategy(context: GenreContext): Promise<OperationResult<GenreStrategy>>;

  // 学習評価
  evaluateLearningProgress(): Promise<OperationResult<LearningProgress>>;
  assessGenreUnderstanding(genre: GenreType): Promise<OperationResult<GenreUnderstanding>>;
  validateLearningOutcomes(outcomes: LearningOutcome[]): Promise<OperationResult<OutcomeValidation>>;
}

// ============================================================================
// 支援型定義
// ============================================================================

export interface GenreElement {
  id: string;
  type: GenreElementType;
  name: string;
  description: string;
  importance: number;
  prevalence: number;
  examples: string[];
  variations: GenreElementVariation[];
}

export interface GenreCompliance {
  overallScore: number;
  complianceAspects: ComplianceAspect[];
  violations: GenreViolation[];
  recommendations: ComplianceRecommendation[];
  improvementAreas: ImprovementArea[];
}

export interface GenreCustomization {
  targetAudience: AudienceProfile;
  culturalAdaptations: CulturalAdaptation[];
  stylePreferences: StylePreference[];
  contentModifications: ContentModification[];
  qualityRequirements: QualityRequirement[];
}

export interface GenreRecommendation {
  id: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  description: string;
  rationale: string;
  implementation: ImplementationGuide;
  expectedImpact: ExpectedImpact;
  effort: EffortEstimate;
}

export interface TimePeriod {
  start: Date;
  end: Date;
  granularity: TimeGranularity;
}

export interface GenreEvolution {
  genreType: GenreType;
  evolutionHistory: EvolutionPoint[];
  currentState: GenreState;
  predictedFuture: FuturePrediction[];
  influencingFactors: InfluenceFactor[];
}

export interface GenreCharacteristics {
  primaryTraits: GenreTrait[];
  secondaryTraits: GenreTrait[];
  narrativeStructure: NarrativeStructureProfile;
  thematicElements: ThematicProfile;
  styleElements: StyleProfile;
  audienceExpectations: AudienceExpectationProfile;
}

export interface GenreMarker {
  id: string;
  type: MarkerType;
  confidence: number;
  location: ContentLocation;
  evidence: Evidence[];
  significance: number;
}

export interface GenreStrength {
  overallStrength: number;
  strengthByAspect: Map<GenreAspect, number>;
  strongPoints: StrengthPoint[];
  weakPoints: WeakPoint[];
  improvementPotential: number;
}

export interface GenreHybrid {
  primaryGenre: GenreType;
  secondaryGenres: GenreType[];
  hybridizationLevel: number;
  blendingQuality: number;
  hybridCharacteristics: HybridCharacteristic[];
  marketViability: number;
}

export interface GenreInnovation {
  innovationType: InnovationType;
  innovationLevel: number;
  novelElements: NovelElement[];
  traditionBreaks: TraditionBreak[];
  marketPotential: MarketPotential;
  riskAssessment: RiskAssessment;
}

export interface GenreAuthenticity {
  authenticityScore: number;
  authenticElements: AuthenticElement[];
  inauthentic_elements: InauthenticElement[];
  culturalAccuracy: CulturalAccuracy;
  historicalAccuracy: HistoricalAccuracy;
}

// 型エイリアス（詳細実装用）
export type GenreElementType = string;
export type GenreElementVariation = any;
export type ComplianceAspect = any;
export type GenreViolation = any;
export type ComplianceRecommendation = any;
export type ImprovementArea = any;
export type AudienceProfile = any;
export type CulturalAdaptation = any;
export type StylePreference = any;
export type ContentModification = any;
export type QualityRequirement = any;
export type RecommendationType = string;
export type RecommendationPriority = string;
export type ImplementationGuide = any;
export type ExpectedImpact = any;
export type EffortEstimate = any;
export type TimeGranularity = string;
export type EvolutionPoint = any;
export type GenreState = any;
export type FuturePrediction = any;
export type InfluenceFactor = any;
export type GenreTrait = any;
export type NarrativeStructureProfile = any;
export type ThematicProfile = any;
export type StyleProfile = any;
export type AudienceExpectationProfile = any;
export type MarkerType = string;
export type ContentLocation = any;
export type Evidence = any;
export type GenreAspect = string;
export type StrengthPoint = any;
export type WeakPoint = any;
export type HybridCharacteristic = any;
export type InnovationType = string;
export type NovelElement = any;
export type TraditionBreak = any;
export type MarketPotential = any;
export type RiskAssessment = any;
export type AuthenticElement = any;
export type InauthenticElement = any;
export type CulturalAccuracy = any;
export type HistoricalAccuracy = any;
export type AdaptedContent = any;
export type GenreAdjustment = any;
export type GenreTransformation = any;
export type GenreBlend = any;
export type GenreInnovationGoals = any;
export type AdaptationCalibration = any;
export type AdaptationResult = any;
export type AdaptationValidation = any;
export type GenreComparison = any;
export type GenreHistoricalData = any;
export type GenreEvolutionAnalysis = any;
export type GenreStandardsComparison = any;
export type GenreQualityAssessment = any;
export type GenreConsistencyReport = any;
export type GenreStandards = any;
export type StandardsValidation = any;
export type GenreQualityIssue = any;
export type GenreImprovementPlan = any;
export type GenreQualityMonitoring = any;
export type GenreQualityDeviation = any;
export type QualityAlert = any;
export type QualityTrend = any;
export type TimeFrame = any;
export type GenreExample = any;
export type GenrePattern = any;
export type GenreFeedback = any;
export type KnowledgeUpdate = any;
export type TrendAdaptation = any;
export type GenreSuccessPrediction = any;
export type GenreMarketData = any;
export type GenreForecast = any;
export type GenreStrategy = any;
export type LearningProgress = any;
export type GenreUnderstanding = any;
export type LearningOutcome = any;
export type OutcomeValidation = any;