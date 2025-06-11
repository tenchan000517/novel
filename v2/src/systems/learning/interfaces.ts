/**
 * 学習旅程システムのインターフェース定義
 * アドラー心理学、ドラッカー経営学、ソクラテス対話法の統合学習システム
 */

import type { OperationResult } from '@/types/common';

// ============================================================================
// 学習フレームワーク基底インターフェース
// ============================================================================

export interface ILearningFramework {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  processContent(content: string, context: LearningContext): Promise<OperationResult<ProcessedContent>>;
  generateInsights(analysis: ContentAnalysis): Promise<OperationResult<LearningInsight[]>>;
  createExercises(content: string): Promise<OperationResult<LearningExercise[]>>;
}

// ============================================================================
// 学習旅程管理インターフェース
// ============================================================================

export interface ILearningJourneyManager {
  // 学習旅程の作成と管理
  createJourney(definition: JourneyDefinition): Promise<OperationResult<LearningJourney>>;
  getJourney(journeyId: string): Promise<OperationResult<LearningJourney>>;
  updateJourneyProgress(journeyId: string, progress: ProgressUpdate): Promise<OperationResult<void>>;
  
  // コンテンツ処理
  processLearningContent(content: string, framework: FrameworkType): Promise<OperationResult<ProcessedContent>>;
  generateLearningInsights(contentId: string): Promise<OperationResult<LearningInsight[]>>;
  
  // 個人化と適応
  personalizeJourney(journeyId: string, learnerProfile: LearnerProfile): Promise<OperationResult<PersonalizedJourney>>;
  adaptToLearningStyle(journeyId: string, style: LearningStyle): Promise<OperationResult<void>>;
  
  // 評価と分析
  assessLearningOutcome(journeyId: string): Promise<OperationResult<LearningAssessment>>;
  generateLearningReport(learnerIds: string[]): Promise<OperationResult<LearningReport>>;
}

// ============================================================================
// 専門フレームワーク インターフェース
// ============================================================================

export interface IAdlerPsychologyFramework extends ILearningFramework {
  analyzeIndividualPsychology(content: string): Promise<OperationResult<IndividualPsychologyAnalysis>>;
  generateEncouragementStrategies(learnerProfile: LearnerProfile): Promise<OperationResult<EncouragementStrategy[]>>;
  createSocialInterestExercises(community: LearningCommunity): Promise<OperationResult<SocialExercise[]>>;
}

export interface IDruckerManagementFramework extends ILearningFramework {
  analyzeManagementPrinciples(content: string): Promise<OperationResult<ManagementAnalysis>>;
  generatePracticalApplications(theory: string): Promise<OperationResult<PracticalApplication[]>>;
  createEffectivenessExercises(role: string): Promise<OperationResult<EffectivenessExercise[]>>;
}

export interface ISocraticDialogueFramework extends ILearningFramework {
  generateSocraticQuestions(content: string): Promise<OperationResult<SocraticQuestion[]>>;
  facilitateDialogue(participants: DialogueParticipant[]): Promise<OperationResult<DialogueSession>>;
  analyzeCriticalThinking(responses: DialogueResponse[]): Promise<OperationResult<ThinkingAnalysis>>;
}

// ============================================================================
// 学習データ構造
// ============================================================================

// Removed duplicate JourneyProgress interface - using the one below at lines 268-275

export interface LearningJourney {
  id: string;
  title: string;
  description: string;
  learnerProfile: LearnerProfile;
  frameworks: FrameworkConfiguration[];
  stages: LearningStage[];
  currentStage: string;
  progress: JourneyProgress;
  personalizations: PersonalizationRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LearnerProfile {
  id: string;
  learningStyle: LearningStyle;
  cognitivePreferences: CognitivePreferences;
  motivationFactors: MotivationFactor[];
  priorKnowledge: KnowledgeArea[];
  goals: LearningGoal[];
  constraints: LearningConstraint[];
}

export interface CognitivePreferences {
  preference: string;
  strength: number;
  adaptability: number;
  consistency: number;
}

export interface LearningStyle {
  primary: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  secondary?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  processingSpeed: 'fast' | 'moderate' | 'slow' | 'variable';
  attentionSpan: 'short' | 'medium' | 'long' | 'adaptive';
  socialPreference: 'individual' | 'small_group' | 'large_group' | 'mixed';
  feedbackPreference: 'immediate' | 'delayed' | 'periodic' | 'as_needed';
}

export interface LearningStage {
  id: string;
  name: string;
  description: string;
  objectives: LearningObjective[];
  content: LearningContent[];
  exercises: LearningExercise[];
  assessments: Assessment[];
  prerequisites: string[];
  estimatedDuration: number;
  completionCriteria: CompletionCriteria;
}

export interface LearningContent {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  framework: FrameworkType;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: number;
  materials: ContentMaterial[];
  processedInsights: ProcessedContent;
}

export interface ProcessedContent {
  originalContent: string;
  frameworkAnalysis: Map<FrameworkType, FrameworkAnalysis>;
  learningInsights: LearningInsight[];
  recommendedExercises: LearningExercise[];
  keyTakeaways: string[];
  connectionPoints: ContentConnection[];
  difficulty: number;
  engagement: number;
}

// ============================================================================
// フレームワーク固有の型
// ============================================================================

export interface IndividualPsychologyAnalysis {
  lifeStyleAnalysis: LifeStylePattern;
  goalOrientation: GoalOrientationAnalysis;
  socialInterestLevel: number;
  copingMechanisms: CopingMechanism[];
  growthPotential: GrowthPotential;
  encouragementNeeds: EncouragementNeed[];
}

export interface ManagementAnalysis {
  effectivenessPrinciples: EffectivenessPrinciple[];
  decisionMakingPatterns: DecisionPattern[];
  leadershipOpportunities: LeadershipOpportunity[];
  productivityInsights: ProductivityInsight[];
  innovationPotential: InnovationAssessment;
}

export interface SocraticQuestion {
  id: string;
  question: string;
  type: 'clarification' | 'assumption' | 'evidence' | 'perspective' | 'implication' | 'meta';
  depth: number;
  followUpQuestions: string[];
  expectedThinkingProcess: string[];
}

export interface DialogueSession {
  id: string;
  participants: DialogueParticipant[];
  topic: string;
  questions: SocraticQuestion[];
  responses: DialogueResponse[];
  insights: DialogueInsight[];
  thinkingProgression: ThinkingProgression;
  outcomes: DialogueOutcome[];
}

// ============================================================================
// 学習評価と分析
// ============================================================================

export interface LearningAssessment {
  journeyId: string;
  learnerId: string;
  overallProgress: number;
  stageCompletion: Map<string, number>;
  skillDevelopment: SkillProgress[];
  knowledgeAcquisition: KnowledgeProgress[];
  behaviorChange: BehaviorChangeIndicator[];
  engagement: EngagementMetrics;
  effectiveness: EffectivenessMetrics;
  recommendations: LearningRecommendation[];
}

export interface LearningInsight {
  id: string;
  content: string;
  framework: FrameworkType;
  type: 'concept' | 'principle' | 'application' | 'connection' | 'reflection';
  relevance: number;
  difficulty: number;
  prerequisites: string[];
  applications: PracticalApplication[];
}

export interface LearningExercise {
  id: string;
  title: string;
  description: string;
  type: ExerciseType;
  framework: FrameworkType;
  objectives: string[];
  instructions: string[];
  materials: ExerciseMaterial[];
  timeEstimate: number;
  difficulty: number;
  reflection: ReflectionPrompt[];
}

// ============================================================================
// 補助的な型定義
// ============================================================================

export type FrameworkType = 'adler_psychology' | 'drucker_management' | 'socratic_dialogue' | 'integrated';
export type ContentType = 'text' | 'video' | 'audio' | 'interactive' | 'simulation' | 'case_study';
export type ExerciseType = 'reflection' | 'analysis' | 'application' | 'discussion' | 'simulation' | 'project';

export interface LearningContext {
  learnerId: string;
  sessionId: string;
  stage: string;
  priorLearning: string[];
  currentGoals: string[];
  timeConstraints: TimeConstraint;
  environment: LearningEnvironment;
}

export interface ContentAnalysis {
  content: string;
  structure: ContentStructure;
  complexity: ComplexityAnalysis;
  themes: ThemeAnalysis[];
  learningObjectives: string[];
}

export interface FrameworkConfiguration {
  framework: FrameworkType;
  weight: number;
  customSettings: Map<string, any>;
  enabled: boolean;
}

export interface JourneyProgress {
  overallCompletion: number;
  stageProgress: Map<string, number>;
  timeSpent: number;
  milestonesAchieved: string[];
  currentFocus: string[];
  nextRecommendations: string[];
}

export interface PersonalizedJourney {
  originalJourney: LearningJourney;
  adaptations: JourneyAdaptation[];
  customContent: CustomContent[];
  personalizedExercises: LearningExercise[];
  adaptiveAssessments: AdaptiveAssessment[];
}

export interface LearningReport {
  reportId: string;
  timeRange: DateRange;
  participants: LearnerSummary[];
  aggregateMetrics: AggregateMetrics;
  trends: LearningTrend[];
  insights: SystemInsight[];
  recommendations: SystemRecommendation[];
  generatedAt: Date;
}

// ============================================================================
// 複雑な補助型
// ============================================================================

export interface LearnerSummary {
  learnerId: string;
  name: string;
  journeysCompleted: number;
  totalLearningTime: number;
  skillsAcquired: string[];
  performanceMetrics: PerformanceMetric[];
}

export interface SkillProgress {
  skillId: string;
  skillName: string;
  initialLevel: number;
  currentLevel: number;
  targetLevel: number;
  progressRate: number;
  lastUpdated: Date;
}

export interface BehaviorChangeIndicator {
  behavior: string;
  baseline: number;
  current: number;
  target: number;
  evidence: Evidence[];
  confidence: number;
}

export interface PracticalApplication {
  id: string;
  title: string;
  description: string;
  context: string;
  steps: string[];
  expectedOutcome: string;
  successMetrics: string[];
}

export interface Evidence {
  type: 'observation' | 'self_report' | 'assessment' | 'peer_feedback';
  description: string;
  timestamp: Date;
  reliability: number;
}

// ============================================================================
// 簡略化された補助型（詳細実装時に拡張）
// ============================================================================

export interface JourneyDefinition {
  title: string;
  description: string;
  targetAudience: string;
  learningObjectives: string[];
  duration: number;
  frameworks: FrameworkType[];
}

export interface ProgressUpdate {
  stageId: string;
  completionPercentage: number;
  timeSpent: number;
  achievements: string[];
  feedback: string;
}

export interface EncouragementStrategy {
  strategy: string;
  applicableScenarios: string[];
  implementation: string[];
  expectedOutcome: string;
}

export interface LearningObjective {
  id: string;
  description: string;
  measurable: boolean;
  assessmentCriteria: string[];
}

export interface MotivationFactor {
  factor: string;
  strength: number;
  category: 'intrinsic' | 'extrinsic';
}

export interface DialogueParticipant {
  id: string;
  role: 'facilitator' | 'learner' | 'expert' | 'peer';
  background: string;
}

export interface DialogueResponse {
  participantId: string;
  response: string;
  timestamp: Date;
  confidence: number;
}

// 他の型は実装時に詳細化
export interface LearningGoal { goal: string; priority: number; }
export interface LearningConstraint { constraint: string; impact: number; }
export interface KnowledgeArea { area: string; level: number; }
export interface CompletionCriteria { criteria: string; required: boolean; }
export interface ContentMaterial { material: string; type: string; }
export interface ContentConnection { target: string; strength: number; }
export interface FrameworkAnalysis { analysis: string; confidence: number; }
export interface LifeStylePattern { pattern: string; strength: number; }
export interface GoalOrientationAnalysis { orientation: string; clarity: number; }
export interface CopingMechanism { mechanism: string; effectiveness: number; }
export interface GrowthPotential { area: string; potential: number; }
export interface EncouragementNeed { need: string; urgency: number; }
export interface EffectivenessPrinciple { principle: string; applicability: number; }
export interface DecisionPattern { pattern: string; frequency: number; }
export interface LeadershipOpportunity { opportunity: string; readiness: number; }
export interface ProductivityInsight { insight: string; impact: number; }
export interface InnovationAssessment { area: string; potential: number; }
export interface DialogueInsight { insight: string; depth: number; }
export interface ThinkingProgression { stage: string; indicators: string[]; }
export interface DialogueOutcome { outcome: string; achievement: number; }
export interface KnowledgeProgress { knowledge: string; progress: number; }
export interface EngagementMetrics { metric: string; value: number; }
export interface EffectivenessMetrics { metric: string; value: number; }
export interface LearningRecommendation { recommendation: string; priority: number; }
export interface ReflectionPrompt { prompt: string; depth: number; }
export interface PersonalizationRecord { adaptation: string; applied: Date; }
export interface TimeConstraint { constraint: string; value: number; }
export interface LearningEnvironment { environment: string; suitability: number; }
export interface ContentStructure { structure: string; complexity: number; }
export interface ComplexityAnalysis { complexity: string; score: number; }
export interface ThemeAnalysis { theme: string; prominence: number; }
export interface JourneyAdaptation { adaptation: string; reason: string; }
export interface CustomContent { content: string; personalization: string; }
export interface AdaptiveAssessment { assessment: string; adaptations: string[]; }
export interface DateRange { start: Date; end: Date; }
export interface AggregateMetrics { metric: string; value: number; }
export interface LearningTrend { trend: string; direction: string; }
export interface SystemInsight { insight: string; confidence: number; }
export interface SystemRecommendation { recommendation: string; priority: number; }
export interface PerformanceMetric { metric: string; value: number; }
export interface ExerciseMaterial { material: string; type: string; }
export interface Assessment { assessment: string; weight: number; }
export interface SocialExercise { exercise: string; participants: number; }
export interface EffectivenessExercise { exercise: string; focus: string; }
export interface ThinkingAnalysis { analysis: string; depth: number; }
export interface LearningCommunity { members: string[]; focus: string; }