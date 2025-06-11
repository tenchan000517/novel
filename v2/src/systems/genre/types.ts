/**
 * Genre Management System Types
 * 
 * ジャンル管理システムの型定義
 * Version 2.0要件: ジャンル分析・適応・品質管理の型定義
 */

import type { SystemId } from '@/types/common';

// ============================================================================
// システム設定・設定
// ============================================================================

export interface GenreManagerConfig {
  enableGenreAnalysis: boolean;
  enableGenreAdaptation: boolean;
  enableQualityMonitoring: boolean;
  enableTrendTracking: boolean;
  enableLearning: boolean;
  defaultGenreComplexity: GenreComplexity;
  qualityThreshold: number;
  adaptationThreshold: number;
  realTimeAnalysis: boolean;
  cacheResults: boolean;
  batchProcessing: boolean;
  parallelAnalysis: boolean;
}

export interface GenreAnalysisConfig {
  analysisDepth: AnalysisDepth;
  includeSubgenres: boolean;
  detectHybrids: boolean;
  culturalAdaptation: boolean;
  historicalContext: boolean;
  marketAnalysis: boolean;
  audienceAnalysis: boolean;
  competitorAnalysis: boolean;
}

export interface GenreAdaptationConfig {
  adaptationMode: AdaptationMode;
  preserveOriginalStyle: boolean;
  maintainCharacterIntegrity: boolean;
  respectCulturalSensitivity: boolean;
  allowGenreBlending: boolean;
  innovationLevel: InnovationLevel;
  qualityAssurance: boolean;
  reversibility: boolean;
}

export interface GenreQualityConfig {
  strictStandards: boolean;
  genreSpecificCriteria: boolean;
  audienceExpectations: boolean;
  marketStandards: boolean;
  culturalAuthenticity: boolean;
  historicalAccuracy: boolean;
  benchmarkComparison: boolean;
  continuousMonitoring: boolean;
}

// ============================================================================
// ジャンル基本型
// ============================================================================

export interface GenreProfile {
  id: string;
  genreType: GenreType;
  name: string;
  description: string;
  characteristics: GenreCharacteristics;
  conventions: GenreConvention[];
  expectations: AudienceExpectation[];
  standards: GenreStandards;
  metrics: GenreProfileMetrics;
  metadata: GenreMetadata;
  lastUpdated: Date;
}

export interface GenreContext {
  targetAudience: TargetAudience;
  culturalContext: CulturalContext;
  historicalPeriod?: HistoricalPeriod;
  marketPosition: MarketPosition;
  publishingContext: PublishingContext;
  competitiveContext: CompetitiveContext;
  qualityRequirements: QualityRequirement[];
}

export interface GenreAnalysis {
  primaryGenre: GenreClassificationResult;
  secondaryGenres: GenreClassificationResult[];
  hybridCharacteristics: HybridAnalysis;
  genreStrength: GenreStrengthAnalysis;
  complianceScore: number;
  innovationLevel: number;
  marketViability: MarketViabilityAnalysis;
  qualityAssessment: GenreQualityAnalysis;
  recommendations: GenreRecommendation[];
  confidence: number;
  timestamp: Date;
}

export interface GenreClassification {
  primaryGenre: GenreType;
  confidence: number;
  alternativeGenres: AlternativeGenreCandidate[];
  classificationReasons: ClassificationReason[];
  subgenreDetails: SubgenreClassification[];
  hybridIndicators: HybridIndicator[];
  uncertaintyFactors: UncertaintyFactor[];
}

export interface GenreAdaptation {
  originalGenre: GenreType;
  targetGenre: GenreType;
  adaptationStrategy: AdaptationStrategy;
  adaptedContent: string;
  adaptationQuality: AdaptationQualityMetrics;
  preservedElements: PreservedElement[];
  modifiedElements: ModifiedElement[];
  addedElements: AddedElement[];
  removedElements: RemovedElement[];
  adaptationReport: AdaptationReport;
}

export interface GenreValidation {
  isValid: boolean;
  validationScore: number;
  genreCompliance: ComplianceAnalysis;
  qualityMetrics: ValidationQualityMetrics;
  standardsCompliance: StandardsComplianceReport;
  issues: ValidationIssue[];
  warnings: ValidationWarning[];
  recommendations: ValidationRecommendation[];
  validatedAt: Date;
}

export interface GenreOptimization {
  originalContent: string;
  optimizedContent: string;
  optimizationStrategy: OptimizationStrategy;
  optimizationMetrics: OptimizationMetrics;
  performanceGains: PerformanceGain[];
  qualityImprovements: QualityImprovement[];
  tradeoffs: OptimizationTradeoff[];
  optimizationReport: OptimizationReport;
}

// ============================================================================
// ジャンル分類・特徴型
// ============================================================================

export interface GenreCharacteristics {
  narrativeStructure: NarrativeStructureCharacteristics;
  thematicElements: ThematicCharacteristics;
  styleElements: StyleCharacteristics;
  characterTypes: CharacterTypeCharacteristics;
  settingElements: SettingCharacteristics;
  plotElements: PlotCharacteristics;
  toneAndMood: ToneAndMoodCharacteristics;
  languageFeatures: LanguageCharacteristics;
}

export interface GenreConvention {
  id: string;
  name: string;
  description: string;
  importance: ConventionImportance;
  flexibility: ConventionFlexibility;
  examples: ConventionExample[];
  variations: ConventionVariation[];
  evolution: ConventionEvolution;
  enforcement: ConventionEnforcement;
}

export interface AudienceExpectation {
  expectationType: ExpectationType;
  description: string;
  priority: ExpectationPriority;
  satisfaction: ExpectationSatisfaction;
  measurementCriteria: MeasurementCriterion[];
  culturalVariations: CulturalVariation[];
  demographicFactors: DemographicFactor[];
}

export interface GenreStandards {
  qualityStandards: QualityStandard[];
  contentStandards: ContentStandard[];
  structuralStandards: StructuralStandard[];
  styleStandards: StyleStandard[];
  ethicalStandards: EthicalStandard[];
  marketStandards: MarketStandard[];
  technicalStandards: TechnicalStandard[];
}

// ============================================================================
// ジャンル分析結果型
// ============================================================================

export interface GenreClassificationResult {
  genreType: GenreType;
  confidence: number;
  evidence: ClassificationEvidence[];
  characteristics: IdentifiedCharacteristic[];
  score: number;
  reasoning: ClassificationReasoning;
}

export interface HybridAnalysis {
  isHybrid: boolean;
  hybridLevel: number;
  primaryGenre: GenreType;
  secondaryGenres: SecondaryGenreInfo[];
  blendingQuality: BlendingQuality;
  hybridCharacteristics: HybridCharacteristic[];
  marketViability: HybridMarketViability;
}

export interface GenreStrengthAnalysis {
  overallStrength: number;
  strengthByCategory: CategoryStrength[];
  strongElements: StrongElement[];
  weakElements: WeakElement[];
  improvementOpportunities: ImprovementOpportunity[];
  competitivePosition: CompetitivePosition;
}

export interface MarketViabilityAnalysis {
  viabilityScore: number;
  marketDemand: MarketDemand;
  competition: CompetitionAnalysis;
  uniqueness: UniquenessAnalysis;
  commercialPotential: CommercialPotential;
  riskFactors: RiskFactor[];
  marketRecommendations: MarketRecommendation[];
}

export interface GenreQualityAnalysis {
  overallQuality: number;
  qualityDimensions: QualityDimension[];
  strengthAreas: QualityStrengthArea[];
  improvementAreas: QualityImprovementArea[];
  benchmarkComparison: QualityBenchmarkComparison;
  qualityTrends: QualityTrend[];
}

// ============================================================================
// メトリクス・統計型
// ============================================================================

export interface GenreMetrics {
  analysisMetrics: AnalysisMetrics;
  adaptationMetrics: AdaptationMetrics;
  qualityMetrics: QualityMetrics;
  performanceMetrics: PerformanceMetrics;
  usageMetrics: UsageMetrics;
  trendMetrics: TrendMetrics;
}

export interface GenreStatistics {
  totalAnalyses: number;
  genreDistribution: GenreDistribution;
  adaptationSuccess: AdaptationSuccessStats;
  qualityTrends: QualityTrendStats;
  popularityTrends: PopularityTrendStats;
  innovationMetrics: InnovationMetrics;
  systemPerformance: SystemPerformanceStats;
}

export interface GenreReport {
  reportId: string;
  generatedAt: Date;
  reportPeriod: ReportPeriod;
  executiveSummary: ExecutiveSummary;
  genreAnalysisResults: GenreAnalysisResults;
  trendAnalysis: TrendAnalysis;
  qualityAssessment: QualityAssessmentReport;
  recommendations: ReportRecommendation[];
  actionItems: ActionItem[];
}

export interface GenreBenchmark {
  benchmarkId: string;
  genreType: GenreType;
  referenceWorks: ReferenceWork[];
  qualityStandards: BenchmarkQualityStandards;
  performanceMetrics: BenchmarkPerformanceMetrics;
  comparisonResults: ComparisonResult[];
  relativePerfomance: RelativePerformance;
}

export interface GenreTrend {
  trendId: string;
  genreType: GenreType;
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

export enum GenreType {
  // 主要ジャンル
  CONTEMPORARY_FICTION = 'contemporary_fiction',
  LITERARY_FICTION = 'literary_fiction',
  HISTORICAL_FICTION = 'historical_fiction',
  SCIENCE_FICTION = 'science_fiction',
  FANTASY = 'fantasy',
  MYSTERY = 'mystery',
  THRILLER = 'thriller',
  ROMANCE = 'romance',
  HORROR = 'horror',
  YOUNG_ADULT = 'young_adult',
  
  // サブジャンル
  URBAN_FANTASY = 'urban_fantasy',
  SPACE_OPERA = 'space_opera',
  CYBERPUNK = 'cyberpunk',
  STEAMPUNK = 'steampunk',
  DYSTOPIAN = 'dystopian',
  COZY_MYSTERY = 'cozy_mystery',
  POLICE_PROCEDURAL = 'police_procedural',
  PARANORMAL_ROMANCE = 'paranormal_romance',
  GOTHIC_HORROR = 'gothic_horror',
  PSYCHOLOGICAL_THRILLER = 'psychological_thriller',
  
  // 複合ジャンル
  SCI_FI_FANTASY = 'sci_fi_fantasy',
  ROMANTIC_SUSPENSE = 'romantic_suspense',
  HISTORICAL_MYSTERY = 'historical_mystery',
  LITERARY_THRILLER = 'literary_thriller',
  
  // その他
  EXPERIMENTAL = 'experimental',
  CROSS_GENRE = 'cross_genre',
  CUSTOM = 'custom'
}

export enum GenreComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  HIGHLY_COMPLEX = 'highly_complex'
}

export enum GenreStyle {
  TRADITIONAL = 'traditional',
  CONTEMPORARY = 'contemporary',
  EXPERIMENTAL = 'experimental',
  INNOVATIVE = 'innovative',
  HYBRID = 'hybrid'
}

export enum AnalysisDepth {
  SURFACE = 'surface',
  STANDARD = 'standard',
  DEEP = 'deep',
  COMPREHENSIVE = 'comprehensive'
}

export enum AdaptationMode {
  CONSERVATIVE = 'conservative',
  MODERATE = 'moderate',
  AGGRESSIVE = 'aggressive',
  EXPERIMENTAL = 'experimental'
}

export enum InnovationLevel {
  NONE = 'none',
  MINIMAL = 'minimal',
  MODERATE = 'moderate',
  HIGH = 'high',
  REVOLUTIONARY = 'revolutionary'
}

export enum ConventionImportance {
  CRITICAL = 'critical',
  HIGH = 'high',
  MODERATE = 'moderate',
  LOW = 'low',
  OPTIONAL = 'optional'
}

export enum ConventionFlexibility {
  RIGID = 'rigid',
  MODERATE = 'moderate',
  FLEXIBLE = 'flexible',
  HIGHLY_FLEXIBLE = 'highly_flexible'
}

export enum ExpectationType {
  STRUCTURAL = 'structural',
  THEMATIC = 'thematic',
  STYLISTIC = 'stylistic',
  CHARACTER = 'character',
  PLOT = 'plot',
  SETTING = 'setting',
  TONE = 'tone',
  QUALITY = 'quality'
}

export enum ExpectationPriority {
  ESSENTIAL = 'essential',
  HIGH = 'high',
  MODERATE = 'moderate',
  LOW = 'low',
  NICE_TO_HAVE = 'nice_to_have'
}

export enum TrendType {
  POPULARITY = 'popularity',
  INNOVATION = 'innovation',
  QUALITY = 'quality',
  MARKET = 'market',
  CULTURAL = 'cultural',
  TECHNOLOGICAL = 'technological'
}

export enum TrendDirection {
  RISING = 'rising',
  FALLING = 'falling',
  STABLE = 'stable',
  CYCLICAL = 'cyclical',
  EMERGING = 'emerging',
  DECLINING = 'declining'
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

export interface TargetAudience {
  primaryDemographic: Demographics;
  secondaryDemographics: Demographics[];
  psychographics: Psychographics;
  readingPreferences: ReadingPreferences;
  genreExpectations: GenreExpectations;
}

export interface CulturalContext {
  region: string;
  language: string;
  culturalValues: CulturalValue[];
  socialNorms: SocialNorm[];
  historicalInfluences: HistoricalInfluence[];
  contemporaryFactors: ContemporaryFactor[];
}

export interface MarketPosition {
  targetMarket: MarketSegment;
  competitivePosition: string;
  pricingStrategy: string;
  distributionChannels: string[];
  marketingApproach: string;
}

export interface PublishingContext {
  publishingFormat: PublishingFormat;
  publicationTimeline: PublicationTimeline;
  targetLength: TargetLength;
  seriesContext: SeriesContext;
  publishingConstraints: PublishingConstraint[];
}

export interface CompetitiveContext {
  directCompetitors: Competitor[];
  indirectCompetitors: Competitor[];
  marketTrends: MarketTrend[];
  competitiveAdvantages: CompetitiveAdvantage[];
  marketGaps: MarketGap[];
}

// 型エイリアス（詳細実装用）
export type HistoricalPeriod = any;
export type QualityRequirement = any;
export type AlternativeGenreCandidate = any;
export type ClassificationReason = any;
export type SubgenreClassification = any;
export type HybridIndicator = any;
export type UncertaintyFactor = any;
export type AdaptationStrategy = any;
export type AdaptationQualityMetrics = any;
export type PreservedElement = any;
export type ModifiedElement = any;
export type AddedElement = any;
export type RemovedElement = any;
export type AdaptationReport = any;
export type ComplianceAnalysis = any;
export type ValidationQualityMetrics = any;
export type StandardsComplianceReport = any;
export type ValidationIssue = any;
export type ValidationWarning = any;
export type ValidationRecommendation = any;
export type OptimizationStrategy = any;
export type OptimizationMetrics = any;
export type PerformanceGain = any;
export type QualityImprovement = any;
export type OptimizationTradeoff = any;
export type OptimizationReport = any;
export type NarrativeStructureCharacteristics = any;
export type ThematicCharacteristics = any;
export type StyleCharacteristics = any;
export type CharacterTypeCharacteristics = any;
export type SettingCharacteristics = any;
export type PlotCharacteristics = any;
export type ToneAndMoodCharacteristics = any;
export type LanguageCharacteristics = any;
export type ConventionExample = any;
export type ConventionVariation = any;
export type ConventionEvolution = any;
export type ConventionEnforcement = any;
export type ExpectationSatisfaction = any;
export type MeasurementCriterion = any;
export type CulturalVariation = any;
export type DemographicFactor = any;
export type QualityStandard = any;
export type ContentStandard = any;
export type StructuralStandard = any;
export type StyleStandard = any;
export type EthicalStandard = any;
export type MarketStandard = any;
export type TechnicalStandard = any;
export type ClassificationEvidence = any;
export type IdentifiedCharacteristic = any;
export type ClassificationReasoning = any;
export type SecondaryGenreInfo = any;
export type BlendingQuality = any;
export type HybridCharacteristic = any;
export type HybridMarketViability = any;
export type CategoryStrength = any;
export type StrongElement = any;
export type WeakElement = any;
export type ImprovementOpportunity = any;
export type CompetitivePosition = any;
export type MarketDemand = any;
export type CompetitionAnalysis = any;
export type UniquenessAnalysis = any;
export type CommercialPotential = any;
export type RiskFactor = any;
export type MarketRecommendation = any;
export type QualityDimension = any;
export type QualityStrengthArea = any;
export type QualityImprovementArea = any;
export type QualityBenchmarkComparison = any;
export type QualityTrend = any;
export type AnalysisMetrics = any;
export type AdaptationMetrics = any;
export type QualityMetrics = any;
export type PerformanceMetrics = any;
export type UsageMetrics = any;
export type TrendMetrics = any;
export type GenreDistribution = any;
export type AdaptationSuccessStats = any;
export type QualityTrendStats = any;
export type PopularityTrendStats = any;
export type InnovationMetrics = any;
export type SystemPerformanceStats = any;
export type ReportPeriod = any;
export type ExecutiveSummary = any;
export type GenreAnalysisResults = any;
export type TrendAnalysis = any;
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
export type Demographics = any;
export type Psychographics = any;
export type ReadingPreferences = any;
export type GenreExpectations = any;
export type CulturalValue = any;
export type SocialNorm = any;
export type HistoricalInfluence = any;
export type ContemporaryFactor = any;
export type MarketSegment = any;
export type PublishingFormat = any;
export type PublicationTimeline = any;
export type TargetLength = any;
export type SeriesContext = any;
export type PublishingConstraint = any;
export type Competitor = any;
export type MarketTrend = any;
export type CompetitiveAdvantage = any;
export type MarketGap = any;
export type GenreProfileMetrics = any;
export type GenreMetadata = any;
export type GenreRecommendation = any;