/**
 * Version 2.0 - チャプター生成型定義
 * 
 * チャプター生成に関する型定義
 */

import { GenerationContext } from '../context/types';
import { GeneratedPrompt } from '../prompt/types';

// ============================================================================
// チャプター生成設定
// ============================================================================

export interface ChapterGenerationOptions {
  chapterNumber: number;
  targetLength: number;
  qualityLevel: QualityLevel;
  enhancementLevel: EnhancementLevel;
  validationStrict: boolean;
  autoRetry: boolean;
  maxRetries: number;
  timeoutMinutes: number;
}

export enum QualityLevel {
  DRAFT = 'draft',
  STANDARD = 'standard',
  PROFESSIONAL = 'professional',
  PREMIUM = 'premium'
}

export enum EnhancementLevel {
  NONE = 'none',
  BASIC = 'basic',
  ADVANCED = 'advanced',
  COMPREHENSIVE = 'comprehensive'
}

// ============================================================================
// 生成されたチャプター
// ============================================================================

export interface GeneratedChapter {
  // 基本情報
  chapterNumber: number;
  title: string;
  content: ChapterContent;
  
  // 構造情報
  structure: ChapterStructure;
  
  // 品質情報
  quality: ChapterQuality;
  
  // メタデータ
  metadata: ChapterMetadata;
  
  // 生成情報
  generation: GenerationInfo;
}

export interface ChapterContent {
  rawText: string;
  formattedText: string;
  sections: ChapterSection[];
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
}

export interface ChapterSection {
  id: string;
  type: SectionType;
  title?: string;
  content: string;
  startPosition: number;
  endPosition: number;
  importance: number;
}

export enum SectionType {
  INTRODUCTION = 'introduction',
  DIALOGUE = 'dialogue',
  DESCRIPTION = 'description',
  ACTION = 'action',
  REFLECTION = 'reflection',
  TRANSITION = 'transition',
  CONCLUSION = 'conclusion'
}

export interface ChapterStructure {
  narrative: NarrativeStructure;
  learning: LearningStructure;
  character: CharacterStructure;
  emotional: EmotionalStructure;
}

export interface NarrativeStructure {
  beginning: StructureElement;
  development: StructureElement[];
  climax: StructureElement;
  resolution: StructureElement;
  progression: number;
}

export interface LearningStructure {
  frameworks: LearningFrameworkElement[];
  teachingMoments: TeachingMomentElement[];
  assessmentPoints: AssessmentPointElement[];
  integration: IntegrationElement[];
}

export interface CharacterStructure {
  mainCharacters: CharacterElement[];
  relationships: RelationshipElement[];
  development: DevelopmentElement[];
  interactions: InteractionElement[];
}

export interface EmotionalStructure {
  arc: EmotionalArc;
  peaks: EmotionalPeak[];
  transitions: EmotionalTransition[];
  resonance: EmotionalResonance;
}

// ============================================================================
// 構造要素
// ============================================================================

export interface StructureElement {
  type: string;
  content: string;
  position: number;
  length: number;
  importance: number;
  purpose: string;
}

export interface LearningFrameworkElement {
  framework: string;
  concept: string;
  integration: string;
  effectiveness: number;
  position: number;
}

export interface TeachingMomentElement {
  concept: string;
  method: string;
  context: string;
  clarity: number;
  naturalness: number;
}

export interface AssessmentPointElement {
  knowledge: string;
  understanding: string;
  application: string;
  effectiveness: number;
}

export interface IntegrationElement {
  learningAspect: string;
  narrativeAspect: string;
  integration: string;
  seamlessness: number;
}

export interface CharacterElement {
  characterId: string;
  name: string;
  role: string;
  presence: number;
  development: number;
  consistency: number;
}

export interface RelationshipElement {
  characters: string[];
  relationshipType: string;
  dynamics: string;
  development: number;
  authenticity: number;
}

export interface DevelopmentElement {
  characterId: string;
  aspect: string;
  change: string;
  credibility: number;
  significance: number;
}

export interface InteractionElement {
  participants: string[];
  type: string;
  purpose: string;
  effectiveness: number;
  naturalness: number;
}

export interface EmotionalArc {
  startingEmotion: string;
  journey: EmotionalJourneyPoint[];
  endingEmotion: string;
  overallDirection: string;
  intensity: number;
}

export interface EmotionalJourneyPoint {
  position: number;
  emotion: string;
  intensity: number;
  trigger: string;
  significance: number;
}

export interface EmotionalPeak {
  position: number;
  emotion: string;
  intensity: number;
  type: 'positive' | 'negative' | 'neutral';
  impact: number;
}

export interface EmotionalTransition {
  fromEmotion: string;
  toEmotion: string;
  mechanism: string;
  smoothness: number;
  believability: number;
}

export interface EmotionalResonance {
  readerConnection: number;
  empathy: number;
  identification: number;
  memorability: number;
}

// ============================================================================
// 品質評価
// ============================================================================

export interface ChapterQuality {
  overall: number;
  dimensions: QualityDimension[];
  strengths: QualityStrength[];
  weaknesses: QualityWeakness[];
  recommendations: ChapterQualityRecommendation[];
}

export interface QualityDimension {
  name: string;
  score: number;
  weight: number;
  details: QualityDetail[];
  benchmark: number;
}

export interface QualityDetail {
  aspect: string;
  score: number;
  explanation: string;
  evidence: string[];
}

export interface QualityStrength {
  area: string;
  description: string;
  impact: number;
  examples: string[];
}

export interface QualityWeakness {
  area: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestions: string[];
}

export interface ChapterQualityRecommendation {
  category: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
  expectedImprovement: number;
  effort: number;
}

// ============================================================================
// メタデータ
// ============================================================================

export interface ChapterMetadata {
  // 基本情報
  id: string;
  version: string;
  created: string;
  lastModified: string;
  
  // 分類情報
  genre: string[];
  themes: string[];
  keywords: string[];
  readingLevel: string;
  
  // 関連情報
  characters: string[];
  locations: string[];
  frameworks: string[];
  concepts: string[];
  
  // 品質情報
  qualityScore: number;
  readabilityScore: number;
  engagementScore: number;
  learningValue: number;
  
  // 技術情報
  generationModel: string;
  processingTime: number;
  tokenUsage: number;
  retryCount: number;
}

// ============================================================================
// 生成情報
// ============================================================================

export interface GenerationInfo {
  prompt: GeneratedPrompt;
  context: GenerationContext;
  aiResponse: AIGenerationResponse;
  processing: ProcessingInfo;
  validation: ValidationInfo;
  enhancement: EnhancementInfo;
}

export interface AIGenerationResponse {
  model: string;
  responseId: string;
  content: string;
  usage: TokenUsage;
  quality: ResponseQuality;
  metadata: ResponseMetadata;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
}

export interface ResponseQuality {
  relevance: number;
  coherence: number;
  fluency: number;
  creativity: number;
  accuracy: number;
  completeness: number;
}

export interface ResponseMetadata {
  finishReason: string;
  processingTime: number;
  modelVersion: string;
  temperature: number;
  topP: number;
}

export interface ProcessingInfo {
  stages: ProcessingStage[];
  totalTime: number;
  errors: ProcessingError[];
  warnings: ProcessingWarning[];
}

export interface ProcessingStage {
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  success: boolean;
  details: string;
}

export interface ProcessingError {
  stage: string;
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution: string;
}

export interface ProcessingWarning {
  stage: string;
  message: string;
  impact: string;
  suggestion: string;
}

export interface ValidationInfo {
  checks: ValidationCheck[];
  overallResult: ChapterValidationResult;
  qualityGate: QualityGateResult;
  compliance: ComplianceResult;
}

export interface ValidationCheck {
  name: string;
  category: string;
  result: 'pass' | 'warning' | 'fail';
  score: number;
  details: string;
  evidence: string[];
}

export interface ChapterValidationResult {
  isValid: boolean;
  score: number;
  passedChecks: number;
  totalChecks: number;
  criticalIssues: number;
}

export interface QualityGateResult {
  passed: boolean;
  score: number;
  threshold: number;
  gateChecks: GateCheck[];
}

export interface GateCheck {
  name: string;
  required: boolean;
  passed: boolean;
  score: number;
  weight: number;
}

export interface ComplianceResult {
  standards: StandardCompliance[];
  overallCompliance: number;
  violations: ComplianceViolation[];
}

export interface StandardCompliance {
  standard: string;
  compliant: boolean;
  score: number;
  requirements: RequirementCheck[];
}

export interface RequirementCheck {
  requirement: string;
  met: boolean;
  score: number;
  evidence: string;
}

export interface ComplianceViolation {
  standard: string;
  violation: string;
  severity: string;
  impact: string;
  remediation: string;
}

export interface EnhancementInfo {
  enhancements: EnhancementApplication[];
  totalImprovements: number;
  qualityIncrease: number;
  processingTime: number;
}

export interface EnhancementApplication {
  type: string;
  description: string;
  area: string;
  improvement: number;
  confidence: number;
}

// ============================================================================
// 生成結果・更新
// ============================================================================

export interface GenerationResult {
  success: boolean;
  chapter?: GeneratedChapter;
  error?: GenerationError;
  retryInfo?: RetryInfo;
}

export interface GenerationError {
  code: string;
  message: string;
  stage: string;
  details: string;
  recoverable: boolean;
  suggestions: string[];
}

export interface RetryInfo {
  attempt: number;
  maxAttempts: number;
  reason: string;
  modifications: string[];
}

export interface ProcessedChapter {
  original: GeneratedChapter;
  enhanced: GeneratedChapter;
  processing: ProcessingInfo;
  improvements: ChapterImprovement[];
}

export interface ChapterImprovement {
  type: string;
  area: string;
  description: string;
  beforeScore: number;
  afterScore: number;
  confidence: number;
}

export interface UpdateResult {
  success: boolean;
  updatedSystems: SystemUpdateResult[];
  errors: UpdateError[];
  warnings: UpdateWarning[];
}

export interface SystemUpdateResult {
  systemType: string;
  updated: boolean;
  changes: SystemChange[];
  duration: number;
}

export interface SystemChange {
  component: string;
  changeType: string;
  description: string;
  impact: number;
}

export interface UpdateError {
  system: string;
  component: string;
  error: string;
  critical: boolean;
  resolution: string;
}

export interface UpdateWarning {
  system: string;
  component: string;
  warning: string;
  impact: string;
  recommendation: string;
}

// ============================================================================
// 品質レポート
// ============================================================================

export interface QualityReport {
  summary: QualitySummary;
  detailed: DetailedQualityAnalysis;
  recommendations: ChapterQualityRecommendation[];
  benchmarks: QualityBenchmark[];
}

export interface QualitySummary {
  overallScore: number;
  grade: QualityGrade;
  strengths: string[];
  weaknesses: string[];
  keyMetrics: QualityMetric[];
}

export enum QualityGrade {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  ACCEPTABLE = 'acceptable',
  NEEDS_IMPROVEMENT = 'needs_improvement',
  POOR = 'poor'
}

export interface QualityMetric {
  name: string;
  value: number;
  unit: string;
  benchmark: number;
  status: 'above' | 'meeting' | 'below';
}

export interface DetailedQualityAnalysis {
  narrative: NarrativeQuality;
  technical: TechnicalQuality;
  learning: LearningQuality;
  engagement: EngagementQuality;
}

export interface NarrativeQuality {
  structure: number;
  flow: number;
  pacing: number;
  characterization: number;
  dialogue: number;
  description: number;
}

export interface TechnicalQuality {
  grammar: number;
  style: number;
  vocabulary: number;
  readability: number;
  consistency: number;
  formatting: number;
}

export interface LearningQuality {
  integration: number;
  clarity: number;
  applicability: number;
  engagement: number;
  effectiveness: number;
  naturalness: number;
}

export interface EngagementQuality {
  emotional: number;
  intellectual: number;
  curiosity: number;
  immersion: number;
  memorability: number;
  satisfaction: number;
}

export interface QualityBenchmark {
  category: string;
  metric: string;
  targetValue: number;
  currentValue: number;
  industry: number;
  excellence: number;
}

// ============================================================================
// 生成メトリクス
// ============================================================================

export interface GenerationMetrics {
  performance: ChapterPerformanceMetrics;
  quality: QualityMetrics;
  efficiency: EfficiencyMetrics;
  success: SuccessMetrics;
}

export interface ChapterPerformanceMetrics {
  totalTime: number;
  contextTime: number;
  promptTime: number;
  generationTime: number;
  validationTime: number;
  enhancementTime: number;
}

export interface QualityMetrics {
  averageScore: number;
  consistencyScore: number;
  improvementRate: number;
  benchmarkComparison: number;
}

export interface EfficiencyMetrics {
  tokensPerWord: number;
  timePerWord: number;
  retryRate: number;
  enhancementEffectiveness: number;
}

export interface SuccessMetrics {
  completionRate: number;
  qualityGatePass: number;
  firstAttemptSuccess: number;
  enhancementSuccess: number;
}