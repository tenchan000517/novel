/**
 * Version 2.0 - プロンプト生成型定義
 * 
 * プロンプト生成に関する型定義
 */

import { GenerationContext } from '../context/types';

// ============================================================================
// プロンプト生成設定
// ============================================================================

export interface PromptOptions {
  targetAIModel: AIModelType;
  maxTokens: number;
  optimizationLevel: PromptOptimizationLevel;
  includeContext: ContextInclusionLevel;
  formatStyle: PromptFormatStyle;
  language: PromptLanguage;
  qualityStandards: QualityStandard[];
}

export enum AIModelType {
  GEMINI_15_PRO = 'gemini-1.5-pro',
  GEMINI_15_FLASH = 'gemini-1.5-flash',
  GPT_4O = 'gpt-4o',
  GPT_4O_MINI = 'gpt-4o-mini',
  CLAUDE_35_SONNET = 'claude-3.5-sonnet',
  LOCAL_MODEL = 'local'
}

export enum PromptOptimizationLevel {
  NONE = 'none',
  BASIC = 'basic',
  ADVANCED = 'advanced',
  MAXIMUM = 'maximum'
}

export enum ContextInclusionLevel {
  MINIMAL = 'minimal',
  ESSENTIAL = 'essential',
  COMPREHENSIVE = 'comprehensive',
  COMPLETE = 'complete'
}

export enum PromptFormatStyle {
  STRUCTURED = 'structured',
  NARRATIVE = 'narrative',
  INSTRUCTIONAL = 'instructional',
  CONVERSATIONAL = 'conversational'
}

export enum PromptLanguage {
  JAPANESE = 'ja',
  ENGLISH = 'en',
  BILINGUAL = 'bilingual'
}

export enum QualityStandard {
  PROFESSIONAL = 'professional',
  CREATIVE = 'creative',
  EDUCATIONAL = 'educational',
  CONSISTENT = 'consistent',
  ENGAGING = 'engaging'
}

// ============================================================================
// 生成されたプロンプト
// ============================================================================

export interface GeneratedPrompt {
  // コア部分
  systemInstructions: SystemInstructions;
  characterContext: CharacterContext;
  plotDirectives: PlotDirectives;
  learningElements: LearningElements;
  worldContext: WorldContext;
  themeRequirements: ThemeRequirements;
  
  // 生成パラメータ
  generationParameters: GenerationParameters;
  qualityConstraints: QualityConstraints;
  outputFormat: OutputFormat;
  
  // メタデータ
  promptMetadata: PromptMetadata;
  estimatedTokenCount: number;
  expectedOutputLength: number;
}

export interface SystemInstructions {
  role: string;
  expertise: string[];
  responsibilities: string[];
  constraints: string[];
  outputRequirements: string[];
}

export interface CharacterContext {
  activeCharacters: CharacterPromptData[];
  characterDynamics: string[];
  psychologicalInsights: string[];
  growthOpportunities: string[];
  relationshipGuidance: string[];
}

export interface PlotDirectives {
  chapterObjectives: string[];
  tensionRequirements: TensionRequirement;
  pacingGuidelines: PacingGuideline;
  structuralElements: StructuralElement[];
  transitionRequirements: string[];
}

export interface LearningElements {
  activeFrameworks: LearningFrameworkPrompt[];
  pedagogicalApproach: string[];
  integrationGuidelines: string[];
  assessmentCriteria: string[];
  teachingMoments: TeachingMomentPrompt[];
}

export interface WorldContext {
  settingDescription: string;
  atmosphericElements: string[];
  physicalConstraints: string[];
  culturalContext: string[];
  immersionRequirements: string[];
}

export interface ThemeRequirements {
  centralThemes: ThemePromptData[];
  symbolicElements: string[];
  metaphorGuidelines: string[];
  emotionalTone: string[];
  messageIntegration: string[];
}

export interface GenerationParameters {
  chapterNumber: number;
  targetWordCount: number;
  readingLevel: string;
  narrativePerspective: string;
  timeframe: string;
  priority: string;
}

export interface QualityConstraints {
  minimumQualityScore: number;
  consistencyRequirements: string[];
  styleRequirements: string[];
  contentStandards: string[];
  professionalStandards: string[];
}

export interface OutputFormat {
  structure: string;
  formatting: string[];
  sectionRequirements: string[];
  metadataRequirements: string[];
  deliveryFormat: string;
}

export interface PromptMetadata {
  generationTimestamp: string;
  generationDuration: number;
  sourceContext: string;
  optimizationsApplied: PromptOptimization[];
  qualityChecks: PromptQualityCheck[];
  tokenUsageEstimate: TokenUsageEstimate;
}

// ============================================================================
// プロンプト構成要素
// ============================================================================

export interface CharacterPromptData {
  name: string;
  role: string;
  currentState: string;
  objectives: string[];
  personalityHighlights: string[];
  mbtiInsights: string[];
  growthDirection: string;
}

export interface TensionRequirement {
  targetLevel: number;
  buildupStrategy: string;
  peakMoments: string[];
  resolutionGuidance: string;
}

export interface PacingGuideline {
  overallTempo: string;
  accelerationPoints: string[];
  reflectiveMoments: string[];
  transitionPacing: string;
}

export interface StructuralElement {
  type: string;
  position: string;
  content: string;
  importance: string;
}

export interface LearningFrameworkPrompt {
  frameworkName: string;
  currentStage: string;
  integrationApproach: string;
  keyInsights: string[];
  applicationGuidance: string[];
}

export interface TeachingMomentPrompt {
  concept: string;
  deliveryMethod: string;
  contextualPlacement: string;
  expectedOutcome: string;
}

export interface ThemePromptData {
  themeName: string;
  currentDevelopment: string;
  integrationMethod: string;
  symbolicRepresentation: string[];
  emotionalResonance: string;
}

// ============================================================================
// プロンプト最適化
// ============================================================================

export interface PromptOptimization {
  type: string;
  description: string;
  tokensReduced: number;
  qualityImpact: number;
  effectiveness: number;
}

export interface PromptQualityCheck {
  checkType: string;
  result: 'passed' | 'warning' | 'failed';
  score: number;
  details: string;
  recommendations: string[];
}

export interface TokenUsageEstimate {
  systemTokens: number;
  contextTokens: number;
  instructionTokens: number;
  totalTokens: number;
  efficiency: number;
}

// ============================================================================
// プロンプトテンプレート
// ============================================================================

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: PromptCategory;
  structure: TemplateStructure;
  placeholders: TemplatePlaceholder[];
  requiredContext: string[];
  optionalContext: string[];
  defaultValues: Record<string, any>;
}

export enum PromptCategory {
  CHAPTER_GENERATION = 'chapter_generation',
  CHARACTER_DEVELOPMENT = 'character_development',
  PLOT_ADVANCEMENT = 'plot_advancement',
  LEARNING_INTEGRATION = 'learning_integration',
  QUALITY_ENHANCEMENT = 'quality_enhancement'
}

export interface TemplateStructure {
  sections: TemplateSection[];
  ordering: string[];
  dependencies: TemplateDependency[];
  variations: TemplateVariation[];
}

export interface TemplateSection {
  id: string;
  name: string;
  content: string;
  required: boolean;
  priority: number;
  conditions: string[];
}

export interface TemplatePlaceholder {
  key: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: any;
  validation?: string;
}

export interface TemplateDependency {
  section: string;
  dependsOn: string[];
  condition: string;
}

export interface TemplateVariation {
  name: string;
  conditions: string[];
  modifications: TemplateModification[];
}

export interface TemplateModification {
  target: string;
  action: 'replace' | 'append' | 'prepend' | 'remove';
  content: string;
}

// ============================================================================
// プロンプト構築
// ============================================================================

export interface PromptStructure {
  header: PromptHeader;
  context: PromptContextSection;
  instructions: PromptInstructionSection;
  constraints: PromptConstraintSection;
  examples: PromptExampleSection;
  footer: PromptFooter;
}

export interface PromptHeader {
  role: string;
  task: string;
  expertise: string[];
  importance: string;
}

export interface PromptContextSection {
  chapterInfo: string;
  characterInfo: string;
  plotInfo: string;
  learningInfo: string;
  worldInfo: string;
  themeInfo: string;
}

export interface PromptInstructionSection {
  primaryTask: string;
  stepByStepGuidance: string[];
  qualityRequirements: string[];
  outputSpecifications: string[];
}

export interface PromptConstraintSection {
  lengthConstraints: string[];
  styleConstraints: string[];
  contentConstraints: string[];
  technicalConstraints: string[];
}

export interface PromptExampleSection {
  goodExamples: string[];
  badExamples: string[];
  explanations: string[];
}

export interface PromptFooter {
  finalInstructions: string[];
  qualityReminders: string[];
  outputFormat: string;
}

// ============================================================================
// 適応・最適化
// ============================================================================

export interface AIModelAdaptation {
  modelType: AIModelType;
  adaptations: ModelAdaptation[];
  tokenOptimization: TokenOptimization;
  styleAdjustment: StyleAdjustment;
}

export interface ModelAdaptation {
  area: string;
  originalApproach: string;
  adaptedApproach: string;
  reasoning: string;
}

export interface TokenOptimization {
  originalTokens: number;
  optimizedTokens: number;
  reductionMethods: string[];
  qualityMaintained: number;
}

export interface StyleAdjustment {
  originalStyle: string;
  adjustedStyle: string;
  adjustmentReasons: string[];
  expectedImprovement: number;
}

export interface LengthOptimization {
  targetLength: number;
  currentLength: number;
  optimizationStrategy: string;
  priorityAreas: string[];
  compressionMethods: CompressionMethod[];
}

export interface CompressionMethod {
  method: string;
  applicableAreas: string[];
  compressionRatio: number;
  qualityImpact: number;
}

export interface ComplexityAdjustment {
  originalComplexity: number;
  targetComplexity: number;
  adjustmentMethods: string[];
  cognitiveLoadImpact: number;
}

export interface EffectivenessEnhancement {
  currentEffectiveness: number;
  targetEffectiveness: number;
  enhancementMethods: string[];
  expectedOutcome: string[];
}

// ============================================================================
// 品質評価
// ============================================================================

export interface QualityScore {
  overall: number;
  components: QualityComponent[];
  strengths: string[];
  weaknesses: string[];
  recommendations: QualityRecommendation[];
}

export interface QualityComponent {
  name: string;
  score: number;
  weight: number;
  details: string;
  criteria: string[];
}

export interface QualityRecommendation {
  area: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  expectedImprovement: number;
  implementationEffort: number;
}

// ============================================================================
// プロンプトバリエーション
// ============================================================================

export interface PromptVariation {
  id: string;
  basePrompt: string;
  variationType: VariationType;
  modifications: VariationModification[];
  expectedDifference: string;
  useCase: string;
}

export enum VariationType {
  STYLE_VARIATION = 'style_variation',
  TONE_VARIATION = 'tone_variation',
  COMPLEXITY_VARIATION = 'complexity_variation',
  FOCUS_VARIATION = 'focus_variation',
  LENGTH_VARIATION = 'length_variation'
}

export interface VariationModification {
  section: string;
  modificationType: 'replacement' | 'addition' | 'emphasis' | 'removal';
  content: string;
  reasoning: string;
}

// ============================================================================
// エラー・検証
// ============================================================================

export interface PromptValidationResult {
  isValid: boolean;
  errors: PromptError[];
  warnings: PromptWarning[];
  suggestions: PromptSuggestion[];
  score: number;
}

export interface PromptError {
  code: string;
  message: string;
  severity: 'critical' | 'major' | 'minor';
  location: string;
  resolution: string;
}

export interface PromptWarning {
  code: string;
  message: string;
  impact: string;
  suggestion: string;
}

export interface PromptSuggestion {
  area: string;
  suggestion: string;
  expectedBenefit: string;
  implementationDifficulty: 'easy' | 'medium' | 'hard';
}

// ============================================================================
// 使用量・メトリクス
// ============================================================================

export interface PromptMetrics {
  generationTime: number;
  tokenEfficiency: number;
  qualityScore: number;
  optimizationSuccess: number;
  cacheHitRate: number;
  adaptationTime: number;
}

export interface PromptUsageStatistics {
  totalPromptsGenerated: number;
  averageTokenCount: number;
  averageQualityScore: number;
  topOptimizations: string[];
  commonIssues: string[];
  performanceTrends: PerformanceTrend[];
}

export interface PerformanceTrend {
  metric: string;
  timeframe: string;
  values: number[];
  trend: 'improving' | 'stable' | 'declining';
  analysis: string;
}