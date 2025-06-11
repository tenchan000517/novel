/**
 * Expression Management System Types
 * 
 * 表現管理システムの型定義
 * Version 2.0要件: 文体最適化・表現多様化・感情表現強化の型定義
 */

import type { SystemId } from '@/types/common';

// ============================================================================
// システム設定・設定
// ============================================================================

export interface ExpressionManagerConfig {
  styleOptimizationEnabled: boolean;
  diversificationEnabled: boolean;
  emotionalEnhancementEnabled: boolean;
  qualityThreshold: number;
  varietyTargetScore: number;
  creativityLevel: CreativityLevel;
  processingMode: ProcessingMode;
  cacheOptimizations: boolean;
  realTimeAnalysis: boolean;
  integrationDepth: IntegrationDepth;
}

export interface StyleAnalysisConfig {
  analyzeVocabulary: boolean;
  analyzeSentenceStructure: boolean;
  analyzeRhythm: boolean;
  analyzeImagery: boolean;
  analyzeTone: boolean;
  strictConsistency: boolean;
  creativityBalance: number;
  adaptationLevel: AdaptationLevel;
}

export interface DiversificationConfig {
  maxVariationAttempts: number;
  repetitionThreshold: number;
  varietyTargetScore: number;
  preserveStyleIntegrity: boolean;
  allowCreativeDeviations: boolean;
  patternDetectionSensitivity: number;
  alternativeGenerationMode: AlternativeGenerationMode;
}

export interface EmotionalAnalysisConfig {
  depthAnalysisEnabled: boolean;
  psychologicalAccuracyLevel: PsychologicalAccuracyLevel;
  emotionalRangeExpansion: boolean;
  authenticityCriteria: AuthenticityCriteria;
  readerImpactOptimization: boolean;
  characterIntegrationLevel: number;
}

// ============================================================================
// 文体分析・最適化詳細型
// ============================================================================

export interface StyleAnalysisResult {
  analysisId: string;
  timestamp: string;
  overallScore: number;
  componentScores: StyleComponentScore[];
  recommendations: StyleRecommendation[];
  detectedPatterns: StylePattern[];
  improvementOpportunities: ImprovementOpportunity[];
}

export interface StyleComponentScore {
  component: StyleComponent;
  score: number;
  analysis: ComponentAnalysis;
  suggestions: ComponentSuggestion[];
  examples: ComponentExample[];
}

export interface StylePattern {
  patternType: StylePatternType;
  frequency: number;
  strength: number;
  examples: PatternExample[];
  impact: StyleImpact;
  modificationSuggestions: PatternModification[];
}

export interface VocabularyAnalysis {
  complexity: VocabularyComplexity;
  diversity: VocabularyDiversity;
  appropriateness: ContextualAppropriateness;
  characterAlignment: CharacterVocabularyAlignment;
  recommendations: VocabularyRecommendation[];
}

export interface SentenceStructureAnalysis {
  averageLength: number;
  complexityDistribution: ComplexityDistribution;
  rhythmPattern: RhythmAnalysis;
  varietyScore: StructuralVariety;
  readabilityMetrics: ReadabilityMetrics;
}

// ============================================================================
// 表現多様化詳細型
// ============================================================================

export interface VarietyAnalysisResult {
  overallVariety: number;
  patternAnalysis: PatternAnalysisResult;
  repetitionReport: RepetitionReport;
  diversityOpportunities: DiversityOpportunity[];
  generatedAlternatives: GeneratedAlternative[];
}

export interface PatternAnalysisResult {
  detectedPatterns: DetectedPattern[];
  patternSeverity: PatternSeverity;
  impactAssessment: PatternImpactAssessment;
  resolutionStrategies: ResolutionStrategy[];
}

export interface RepetitionReport {
  wordLevelRepetition: WordRepetition[];
  phraseLevelRepetition: PhraseRepetition[];
  structuralRepetition: StructuralRepetition[];
  semanticRepetition: SemanticRepetition[];
  overallRepetitiveness: number;
}

export interface AlternativeGenerationResult {
  originalExpression: string;
  generatedAlternatives: ExpressionAlternative[];
  selectionCriteria: SelectionCriteria;
  recommendedChoice: RecommendedChoice;
  rationale: AlternativeRationale;
}

// ============================================================================
// 感情表現詳細型
// ============================================================================

export interface EmotionalAnalysisResult {
  emotionalDepth: EmotionalDepthMetrics;
  emotionalRange: EmotionalRangeMetrics;
  authenticity: AuthenticityMetrics;
  psychologicalAccuracy: PsychologicalAccuracyMetrics;
  readerImpact: ReaderImpactMetrics;
  enhancementSuggestions: EmotionalEnhancementSuggestion[];
}

export interface EmotionalDepthMetrics {
  surfaceLevel: number;
  underlyingLevel: number;
  complexityLevel: number;
  nuanceLevel: number;
  layeringEffectiveness: number;
}

export interface PsychologicalProfileAnalysis {
  characterConsistency: CharacterConsistencyMetrics;
  emotionalRealism: EmotionalRealismMetrics;
  behavioralAlignment: BehavioralAlignmentMetrics;
  psychologicalComplexity: PsychologicalComplexityMetrics;
  growthIndicators: GrowthIndicatorMetrics;
}

export interface EmotionalEnhancementStrategy {
  strategyType: EnhancementStrategyType;
  targetEmotion: TargetEmotion;
  implementationApproach: ImplementationApproach;
  expectedImpact: ExpectedImpact;
  risks: EnhancementRisk[];
  alternatives: StrategyAlternative[];
}

// ============================================================================
// 品質・メトリクス管理
// ============================================================================

export interface ExpressionQualityAssessment {
  overallQuality: QualityScore;
  dimensionalScores: QualityDimensionScore[];
  qualityTrends: QualityTrend[];
  comparativeBenchmarks: ComparativeBenchmark[];
  improvementPlan: QualityImprovementPlan;
}

export interface QualityDimensionScore {
  dimension: QualityDimension;
  score: number;
  subMetrics: QualitySubMetric[];
  benchmarkComparison: BenchmarkComparison;
  targetScore: number;
}

export interface PerformanceMetrics {
  processingSpeed: ProcessingSpeedMetrics;
  accuracyMetrics: AccuracyMetrics;
  resourceUtilization: ResourceUtilizationMetrics;
  userSatisfaction: UserSatisfactionMetrics;
  systemReliability: SystemReliabilityMetrics;
}

export interface UsageAnalytics {
  featureUsage: FeatureUsageStats;
  userBehavior: UserBehaviorAnalytics;
  successPatterns: SuccessPatternAnalytics;
  errorPatterns: ErrorPatternAnalytics;
  optimizationOpportunities: OptimizationOpportunityAnalytics;
}

// ============================================================================
// システム統合・連携
// ============================================================================

export interface SystemIntegrationMetrics {
  characterSystemIntegration: CharacterIntegrationMetrics;
  themeSystemIntegration: ThemeIntegrationMetrics;
  plotSystemIntegration: PlotIntegrationMetrics;
  memorySystemIntegration: MemoryIntegrationMetrics;
  crossSystemSynergy: CrossSystemSynergyMetrics;
}

export interface CharacterIntegrationMetrics {
  personalityAlignment: PersonalityAlignmentScore;
  emotionalConsistency: EmotionalConsistencyScore;
  speechPatternAlignment: SpeechPatternAlignmentScore;
  growthReflection: GrowthReflectionScore;
  relationshipDynamics: RelationshipDynamicsScore;
}

export interface ThemeIntegrationMetrics {
  thematicSupport: ThematicSupportScore;
  symbolismIntegration: SymbolismIntegrationScore;
  moodAlignment: MoodAlignmentScore;
  messageClarification: MessageClarificationScore;
  emotionalResonance: EmotionalResonanceScore;
}

// ============================================================================
// エラー・例外処理
// ============================================================================

export interface ExpressionError {
  errorId: string;
  errorType: ExpressionErrorType;
  severity: ErrorSeverity;
  description: string;
  context: ErrorContext;
  recoveryOptions: RecoveryOption[];
  timestamp: string;
}

export interface ErrorContext {
  operationType: string;
  inputData: any;
  systemState: ExpressionSystemState;
  environmentInfo: EnvironmentInfo;
  userContext: UserContext;
}

export interface ExpressionSystemState {
  activeProcesses: ActiveProcess[];
  resourceUsage: ResourceUsage;
  configurationState: ConfigurationState;
  integrationStatus: IntegrationStatus;
  lastOperationResults: LastOperationResult[];
}

// ============================================================================
// レポート・分析
// ============================================================================

export interface ExpressionReport {
  reportId: string;
  reportType: ExpressionReportType;
  generatedAt: string;
  timeRange: ReportTimeRange;
  summary: ExpressionReportSummary;
  detailedAnalysis: DetailedAnalysis;
  recommendations: ReportRecommendation[];
  actionItems: ActionItem[];
}

export interface ExpressionReportSummary {
  totalExpressions: number;
  qualityScore: number;
  varietyScore: number;
  emotionalDepthScore: number;
  improvementAreas: string[];
  strengths: string[];
  trendsObserved: string[];
}

export interface DetailedAnalysis {
  styleAnalysis: StyleAnalysisReport;
  varietyAnalysis: VarietyAnalysisReport;
  emotionalAnalysis: EmotionalAnalysisReport;
  qualityAnalysis: QualityAnalysisReport;
  integrationAnalysis: IntegrationAnalysisReport;
}

// ============================================================================
// 列挙型
// ============================================================================

export enum CreativityLevel {
  CONSERVATIVE = 'conservative',
  BALANCED = 'balanced',
  CREATIVE = 'creative',
  EXPERIMENTAL = 'experimental'
}

export enum ProcessingMode {
  REAL_TIME = 'real_time',
  BATCH = 'batch',
  HYBRID = 'hybrid',
  ON_DEMAND = 'on_demand'
}

export enum IntegrationDepth {
  SURFACE = 'surface',
  MODERATE = 'moderate',
  DEEP = 'deep',
  COMPREHENSIVE = 'comprehensive'
}

export enum AdaptationLevel {
  MINIMAL = 'minimal',
  STANDARD = 'standard',
  ADAPTIVE = 'adaptive',
  INTELLIGENT = 'intelligent'
}

export enum AlternativeGenerationMode {
  RULE_BASED = 'rule_based',
  PATTERN_BASED = 'pattern_based',
  AI_ASSISTED = 'ai_assisted',
  HYBRID = 'hybrid'
}

export enum PsychologicalAccuracyLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum StyleComponent {
  VOCABULARY = 'vocabulary',
  SYNTAX = 'syntax',
  RHYTHM = 'rhythm',
  IMAGERY = 'imagery',
  TONE = 'tone',
  VOICE = 'voice'
}

export enum StylePatternType {
  REPETITIVE = 'repetitive',
  FORMULAIC = 'formulaic',
  INCONSISTENT = 'inconsistent',
  MONOTONOUS = 'monotonous',
  DISTINCTIVE = 'distinctive'
}

export enum QualityDimension {
  CLARITY = 'clarity',
  ENGAGEMENT = 'engagement',
  AUTHENTICITY = 'authenticity',
  CREATIVITY = 'creativity',
  CONSISTENCY = 'consistency',
  IMPACT = 'impact'
}

export enum ExpressionErrorType {
  STYLE_ANALYSIS_ERROR = 'style_analysis_error',
  DIVERSIFICATION_ERROR = 'diversification_error',
  EMOTIONAL_ANALYSIS_ERROR = 'emotional_analysis_error',
  INTEGRATION_ERROR = 'integration_error',
  QUALITY_ASSESSMENT_ERROR = 'quality_assessment_error'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ExpressionReportType {
  STYLE_REPORT = 'style_report',
  VARIETY_REPORT = 'variety_report',
  EMOTIONAL_REPORT = 'emotional_report',
  QUALITY_REPORT = 'quality_report',
  COMPREHENSIVE_REPORT = 'comprehensive_report'
}

export enum EnhancementStrategyType {
  VOCABULARY_ENHANCEMENT = 'vocabulary_enhancement',
  STRUCTURAL_ENHANCEMENT = 'structural_enhancement',
  EMOTIONAL_DEEPENING = 'emotional_deepening',
  RHYTHM_OPTIMIZATION = 'rhythm_optimization',
  IMAGERY_ENHANCEMENT = 'imagery_enhancement'
}

// ============================================================================
// 型エイリアス（詳細実装用）
// ============================================================================

export type AuthenticityCriteria = any;
export type ComponentAnalysis = any;
export type ComponentSuggestion = any;
export type ComponentExample = any;
export type PatternExample = any;
export type StyleImpact = any;
export type PatternModification = any;
export type VocabularyComplexity = any;
export type VocabularyDiversity = any;
export type ContextualAppropriateness = any;
export type CharacterVocabularyAlignment = any;
export type VocabularyRecommendation = any;
export type ComplexityDistribution = any;
export type RhythmAnalysis = any;
export type StructuralVariety = any;
export type ReadabilityMetrics = any;
export type DetectedPattern = any;
export type PatternSeverity = any;
export type PatternImpactAssessment = any;
export type ResolutionStrategy = any;
export type WordRepetition = any;
export type PhraseRepetition = any;
export type StructuralRepetition = any;
export type SemanticRepetition = any;
export type ExpressionAlternative = any;
export type SelectionCriteria = any;
export type RecommendedChoice = any;
export type AlternativeRationale = any;
export type EmotionalRangeMetrics = any;
export type AuthenticityMetrics = any;
export type PsychologicalAccuracyMetrics = any;
export type ReaderImpactMetrics = any;
export type EmotionalEnhancementSuggestion = any;
export type CharacterConsistencyMetrics = any;
export type EmotionalRealismMetrics = any;
export type BehavioralAlignmentMetrics = any;
export type PsychologicalComplexityMetrics = any;
export type GrowthIndicatorMetrics = any;
export type TargetEmotion = any;
export type ImplementationApproach = any;
export type ExpectedImpact = any;
export type EnhancementRisk = any;
export type StrategyAlternative = any;
export type QualityScore = any;
export type QualitySubMetric = any;
export type BenchmarkComparison = any;
export type QualityImprovementPlan = any;
export type ComparativeBenchmark = any;
export type ProcessingSpeedMetrics = any;
export type AccuracyMetrics = any;
export type ResourceUtilizationMetrics = any;
export type UserSatisfactionMetrics = any;
export type SystemReliabilityMetrics = any;
export type FeatureUsageStats = any;
export type UserBehaviorAnalytics = any;
export type SuccessPatternAnalytics = any;
export type ErrorPatternAnalytics = any;
export type OptimizationOpportunityAnalytics = any;
export type PersonalityAlignmentScore = any;
export type EmotionalConsistencyScore = any;
export type SpeechPatternAlignmentScore = any;
export type GrowthReflectionScore = any;
export type RelationshipDynamicsScore = any;
export type ThematicSupportScore = any;
export type SymbolismIntegrationScore = any;
export type MoodAlignmentScore = any;
export type MessageClarificationScore = any;
export type EmotionalResonanceScore = any;
export type ActiveProcess = any;
export type ResourceUsage = any;
export type ConfigurationState = any;
export type IntegrationStatus = any;
export type LastOperationResult = any;
export type RecoveryOption = any;
export type EnvironmentInfo = any;
export type UserContext = any;
export type ReportTimeRange = any;
export type ReportRecommendation = any;
export type ActionItem = any;
export type StyleAnalysisReport = any;
export type VarietyAnalysisReport = any;
export type EmotionalAnalysisReport = any;
export type QualityAnalysisReport = any;
export type IntegrationAnalysisReport = any;
export type DiversityOpportunity = any;
export type GeneratedAlternative = any;
export type ImprovementOpportunity = any;
export type StyleRecommendation = any;
export type QualityTrend = any;
export type CrossSystemSynergyMetrics = any;
export type PlotIntegrationMetrics = any;
export type MemoryIntegrationMetrics = any;

// ============================================================================
// Expression Systemで使用される追加の型定義
// ============================================================================

export enum SceneType {
  ACTION = 'action',
  DIALOGUE = 'dialogue',
  DESCRIPTION = 'description',
  INTERNAL_MONOLOGUE = 'internal_monologue',
  REFLECTION = 'reflection',
  TRANSITION = 'transition',
  CLIMAX = 'climax',
  RESOLUTION = 'resolution'
}

export enum VarietyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  MAXIMUM = 'maximum'
}

export interface EmotionalContext {
  primaryEmotion: string;
  intensity: number;
  complexity: number;
  characterState: string;
  situationalFactors: string[];
  targetResponse: string;
}

export interface ExpressionGenerationContext {
  sceneType: SceneType;
  emotionalContext: EmotionalContext;
  characterId: string;
  themeAlignment: string[];
  varietyLevel: VarietyLevel;
  constraints: string[];
  preferences: ExpressionPreferences;
}

export interface ExpressionPreferences {
  creativityLevel: CreativityLevel;
  formalityLevel: number;
  complexityPreference: number;
  stylePreferences: string[];
  avoidancePatterns: string[];
}

export interface ExpressionContext {
  sceneType: SceneType;
  characterId: string;
  emotionalState: string;
  previousExpressions: string[];
  targetAudience: string;
  constraints: string[];
}

export enum StyleCategory {
  VOCABULARY = 'vocabulary',
  SENTENCE_STRUCTURE = 'sentence_structure',
  SYNTAX = 'syntax',
  RHYTHM = 'rhythm',
  IMAGERY = 'imagery',
  TONE = 'tone',
  VOICE = 'voice'
}

export enum ImpactLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ExpressionType {
  DESCRIPTIVE = 'descriptive',
  NARRATIVE = 'narrative',
  DIALOGUE = 'dialogue',
  EMOTIONAL = 'emotional',
  ACTION = 'action',
  REFLECTIVE = 'reflective',
  INTERNAL = 'internal',
  ATMOSPHERIC = 'atmospheric'
}

export enum PacingType {
  SLOW = 'slow',
  MODERATE = 'moderate',
  FAST = 'fast',
  VARIABLE = 'variable'
}

export interface StyleContext {
  sceneType: SceneType;
  emotionalTone: string;
  pacingType: PacingType;
  narrativeDistance: NarrativeDistance;
  audienceType: AudienceType;
  formalityLevel: number;
  complexityLevel: number;
  stylePreferences: string[];
}

export enum AudienceType {
  YOUNG_ADULT = 'young_adult',
  ADULT = 'adult',
  GENERAL = 'general',
  LITERARY = 'literary',
  COMMERCIAL = 'commercial'
}

export enum MoodType {
  LIGHT = 'light',
  SERIOUS = 'serious',
  DARK = 'dark',
  HUMOROUS = 'humorous',
  MYSTERIOUS = 'mysterious',
  ROMANTIC = 'romantic',
  SUSPENSEFUL = 'suspenseful',
  TENSE = 'tense',
  CALM = 'calm',
  MELANCHOLIC = 'melancholic',
  ENERGETIC = 'energetic',
  CONTEMPLATIVE = 'contemplative'
}

export enum NarrativeDistance {
  INTIMATE = 'intimate',
  CLOSE = 'close',
  MODERATE = 'moderate',
  DISTANT = 'distant',
  OMNISCIENT = 'omniscient'
}

export enum EmotionType {
  JOY = 'joy',
  SADNESS = 'sadness',
  ANGER = 'anger',
  FEAR = 'fear',
  SURPRISE = 'surprise',
  DISGUST = 'disgust',
  ANTICIPATION = 'anticipation',
  TRUST = 'trust'
}

export enum EmotionalIntensity {
  MINIMAL = 'minimal',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  EXTREME = 'extreme'
}

export interface DiversificationOptions {
  maxAttempts: number;
  varietyThreshold: number;
  preserveStyle: boolean;
  allowCreativeDeviations: boolean;
  patternSensitivity: number;
  generationMode: AlternativeGenerationMode;
}