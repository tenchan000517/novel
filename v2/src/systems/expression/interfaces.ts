/**
 * Expression Management System Interfaces
 * 
 * 表現管理システムのインターフェース定義
 * Version 2.0要件: 文体最適化・表現多様化・感情表現強化
 */

import type { OperationResult, SystemId } from '@/types/common';
import type { 
  ExpressionContext as ExpressionContextType
} from './types';

// Import enums as values for runtime use
import {
  SceneType,
  StyleCategory,
  ExpressionType,
  VarietyLevel,
  CreativityLevel,
  ImpactLevel,
  EmotionType,
  EmotionalIntensity,
  MoodType,
  AudienceType,
  NarrativeDistance,
  PacingType
} from './types';

// ============================================================================
// コアインターフェース
// ============================================================================

export interface IExpressionManager {
  readonly systemId: SystemId;
  
  // 文体最適化
  optimizeStyle(content: string, context: StyleContext): Promise<OperationResult<StyleOptimization>>;
  generateStyleSuggestions(context: StyleContext): Promise<OperationResult<StyleSuggestion[]>>;
  validateStyleConsistency(content: string, targetStyle: StyleProfile): Promise<OperationResult<StyleConsistencyResult>>;
  
  // 表現多様化
  diversifyExpressions(content: string, options: DiversificationOptions): Promise<OperationResult<ExpressionVariants>>;
  detectRepetitivePatterns(content: string): Promise<OperationResult<RepetitionAnalysis>>;
  generateAlternativeExpressions(phrase: string, context: ExpressionContextType): Promise<OperationResult<AlternativeExpression[]>>;
  
  // 感情表現強化
  enhanceEmotionalExpression(content: string, emotionalContext: EmotionalContext): Promise<OperationResult<EmotionalEnhancement>>;
  analyzePsychologicalDepth(content: string): Promise<OperationResult<PsychologicalAnalysis>>;
  generateEmotionalSuggestions(context: EmotionalContext): Promise<OperationResult<EmotionalSuggestion[]>>;
  
  // チャプター関連
  getChapterExpressions(chapterNumber: number): Promise<OperationResult<ChapterExpressionData>>;
  generateExpressionGuidance(chapterNumber: number, context: ExpressionGenerationContext): Promise<OperationResult<ExpressionGuidance>>;
  
  // 品質管理
  evaluateExpressionQuality(content: string): Promise<OperationResult<ExpressionQualityMetrics>>;
  getExpressionConflicts(): Promise<OperationResult<ExpressionConflict[]>>;
  
  // システム統合
  integrateWithCharacters(characterIds: string[]): Promise<OperationResult<CharacterExpressionIntegration>>;
  integrateWithThemes(themeIds: string[]): Promise<OperationResult<ThemeExpressionIntegration>>;
  
  // 統計・分析
  getExpressionStatistics(): Promise<OperationResult<ExpressionStatistics>>;
  getExpressionHealth(): Promise<OperationResult<ExpressionHealthStatus>>;
}

// ============================================================================
// 文体最適化
// ============================================================================

export interface StyleContext {
  scene: SceneType;
  mood: MoodType;
  characterPerspective?: string;
  targetAudience: AudienceType;
  genreConventions: GenreConvention[];
  narrativeDistance: NarrativeDistance;
  timeOfDay?: TimeOfDay;
  pacing: PacingType;
}

export interface StyleOptimization {
  originalContent: string;
  optimizedContent: string;
  changes: StyleChange[];
  improvementScore: number;
  styleMetrics: StyleMetrics;
  recommendations: StyleRecommendation[];
}

export interface StyleSuggestion {
  category: StyleCategory;
  suggestion: string;
  rationale: string;
  impact: ImpactLevel;
  examples: StyleExample[];
  applicabilityScore: number;
}

export interface StyleProfile {
  name: string;
  characteristics: StyleCharacteristic[];
  vocabulary: VocabularyProfile;
  sentenceStructure: SentenceStructureProfile;
  rhythmPattern: RhythmPattern;
  tonalQualities: TonalQuality[];
}

export interface StyleConsistencyResult {
  overallConsistency: number;
  deviations: StyleDeviation[];
  strengthAreas: string[];
  improvementAreas: string[];
  suggestions: ConsistencyImprovement[];
}

// ============================================================================
// 表現多様化
// ============================================================================

export interface DiversificationOptions {
  targetVariety: VarietyLevel;
  preserveStyle: boolean;
  avoidPatterns: string[];
  focusAreas: DiversificationArea[];
  creativityLevel: CreativityLevel;
}

export interface ExpressionVariants {
  originalPhrase: string;
  variants: ExpressionVariant[];
  diversityScore: number;
  styleAlignment: number;
  recommendedVariant: ExpressionVariant;
}

export interface RepetitionAnalysis {
  detectedPatterns: RepetitivePattern[];
  severityScore: number;
  affectedAreas: string[];
  suggestions: DiversificationSuggestion[];
  priorityFixes: PriorityFix[];
}

export interface AlternativeExpression {
  original: string;
  alternative: string;
  expressionType: ExpressionType;
  suitabilityScore: number;
  styleMaintenance: number;
  creativeEnhancement: number;
}

// ============================================================================
// 表現コンテキスト（新規追加）
// ============================================================================

export interface ExpressionContext {
  sceneType?: SceneType;
  emotionalTone?: MoodType;
  characterVoice?: string;
  targetStyle?: string;
  preserveFormality?: boolean;
  enhanceCreativity?: boolean;
  contextualHints?: string[];
}

// ============================================================================
// 感情表現強化
// ============================================================================

export interface EmotionalContext {
  primaryEmotion: EmotionType;
  secondaryEmotions: EmotionType[];
  intensity: EmotionalIntensity;
  characterState: CharacterEmotionalState;
  sceneEmotionalArc: EmotionalArc;
  readerTargetEmotion: EmotionType;
}

export interface EmotionalEnhancement {
  originalContent: string;
  enhancedContent: string;
  emotionalImprovements: EmotionalImprovement[];
  depthScore: number;
  authenticity: number;
  readerEngagement: number;
}

export interface PsychologicalAnalysis {
  depthLevel: PsychologicalDepth;
  characterInsight: CharacterInsight[];
  emotionalComplexity: EmotionalComplexity;
  psychologicalAccuracy: number;
  believability: number;
  improvementOpportunities: PsychologicalImprovement[];
}

export interface EmotionalSuggestion {
  type: EmotionalSuggestionType;
  content: string;
  rationale: string;
  emotionalImpact: EmotionalImpact;
  implementationGuidance: string;
  suitabilityScore: number;
}

// ============================================================================
// チャプター統合
// ============================================================================

export interface ChapterExpressionData {
  chapterNumber: number;
  dominantStyle: StyleProfile;
  expressionPatterns: ExpressionPattern[];
  emotionalProgression: EmotionalProgression;
  varietyMetrics: VarietyMetrics;
  qualityIndicators: QualityIndicator[];
}

export interface ExpressionGuidance {
  styleGuidelines: StyleGuideline[];
  expressionSuggestions: ExpressionSuggestion[];
  emotionalDirection: EmotionalDirection;
  diversityTargets: DiversityTarget[];
  qualityGoals: QualityGoal[];
  avoidancePatterns: AvoidancePattern[];
}

export interface ExpressionGenerationContext {
  chapterNumber: number;
  sceneContext: SceneContext;
  characterContext: CharacterContext;
  thematicContext: ThematicContext;
  previousExpressions: PreviousExpression[];
  targetObjectives: ExpressionObjective[];
}

// ============================================================================
// 品質・分析
// ============================================================================

export interface ExpressionQualityMetrics {
  overallQuality: number;
  styleConsistency: number;
  expressionVariety: number;
  emotionalDepth: number;
  readabilityScore: number;
  engagement: number;
  authenticity: number;
  creativeness: number;
}

export interface ExpressionConflict {
  id: string;
  conflictType: ExpressionConflictType;
  description: string;
  severity: ConflictSeverity;
  affectedContent: string[];
  suggestedResolution: ConflictResolution[];
  priority: number;
}

export interface ExpressionStatistics {
  totalExpressions: number;
  styleDistribution: StyleDistribution;
  varietyMetrics: VarietyStatistics;
  emotionalCoverage: EmotionalCoverage;
  qualityTrends: QualityTrend[];
  usagePatterns: UsagePattern[];
  lastUpdated: string;
}

export interface ExpressionHealthStatus {
  overallHealth: number;
  styleHealth: number;
  varietyHealth: number;
  emotionalHealth: number;
  issues: ExpressionIssue[];
  strengths: ExpressionStrength[];
  recommendations: HealthRecommendation[];
}

// ============================================================================
// システム統合
// ============================================================================

export interface CharacterExpressionIntegration {
  characterId: string;
  expressionProfile: CharacterExpressionProfile;
  styleAlignment: StyleAlignment;
  emotionalConsistency: EmotionalConsistency;
  personalizedSuggestions: PersonalizedSuggestion[];
}

export interface ThemeExpressionIntegration {
  themeId: string;
  expressionSupport: ThemeExpressionSupport;
  styleSynergy: StyleSynergy;
  emotionalResonance: EmotionalResonance;
  enhancementOpportunities: ThemeEnhancementOpportunity[];
}

// ============================================================================
// Additional enums specific to interfaces (not in types.ts)
// ============================================================================

export enum ExpressionConflictType {
  STYLE_INCONSISTENCY = 'style_inconsistency',
  REPETITIVE_PATTERN = 'repetitive_pattern',
  EMOTIONAL_MISMATCH = 'emotional_mismatch',
  QUALITY_DEGRADATION = 'quality_degradation'
}

export enum ConflictSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  CRITICAL = 'critical'
}

// ============================================================================
// 型エイリアス（詳細実装用）
// ============================================================================

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type GenreConvention = any;
export type StyleChange = any;
export type StyleMetrics = any;
export type StyleRecommendation = any;
export type StyleExample = any;
export type StyleCharacteristic = any;
export type VocabularyProfile = any;
export type SentenceStructureProfile = any;
export type RhythmPattern = any;
export type TonalQuality = any;
export type StyleDeviation = any;
export type ConsistencyImprovement = any;
export type DiversificationArea = any;
export type ExpressionVariant = any;
export type RepetitivePattern = any;
export type DiversificationSuggestion = any;
export type PriorityFix = any;
export type CharacterEmotionalState = any;
export type EmotionalArc = any;
export type EmotionalImprovement = any;
export type PsychologicalDepth = any;
export type CharacterInsight = any;
export type EmotionalComplexity = any;
export type PsychologicalImprovement = any;
export type EmotionalSuggestionType = any;
export type EmotionalImpact = any;
export type ExpressionPattern = any;
export type EmotionalProgression = any;
export type VarietyMetrics = any;
export type QualityIndicator = any;
export type StyleGuideline = any;
export type ExpressionSuggestion = any;
export type EmotionalDirection = any;
export type DiversityTarget = any;
export type QualityGoal = any;
export type AvoidancePattern = any;
export type SceneContext = any;
export type CharacterContext = any;
export type ThematicContext = any;
export type PreviousExpression = any;
export type ExpressionObjective = any;
export type ConflictResolution = any;
export type StyleDistribution = any;
export type VarietyStatistics = any;
export type EmotionalCoverage = any;
export type QualityTrend = any;
export type UsagePattern = any;
export type ExpressionIssue = any;
export type ExpressionStrength = any;
export type HealthRecommendation = any;
export type CharacterExpressionProfile = any;
export type StyleAlignment = any;
export type EmotionalConsistency = any;
export type PersonalizedSuggestion = any;
export type ThemeExpressionSupport = any;
export type StyleSynergy = any;
export type EmotionalResonance = any;
export type ThemeEnhancementOpportunity = any;