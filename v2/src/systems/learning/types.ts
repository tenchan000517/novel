/**
 * 学習旅程システムの型定義
 * アドラー心理学、ドラッカー経営学、ソクラテス対話法に特化した詳細型定義
 */

// ============================================================================
// 学習分析結果
// ============================================================================

export interface LearningAnalysisResult {
  contentId: string;
  analysisType: AnalysisType;
  framework: string;
  insights: AnalysisInsight[];
  recommendations: AnalysisRecommendation[];
  confidence: number;
  timestamp: Date;
  metadata: AnalysisMetadata;
}

export interface AnalysisInsight {
  id: string;
  type: 'conceptual' | 'procedural' | 'metacognitive' | 'emotional';
  content: string;
  relevance: number;
  application: string[];
  evidence: Evidence[];
}

export interface AnalysisRecommendation {
  id: string;
  recommendation: string;
  rationale: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementation: string[];
  expectedOutcome: string;
}

export interface AnalysisMetadata {
  processingTime: number;
  dataQuality: number;
  algorithmVersion: string;
  reviewRequired: boolean;
}

// ============================================================================
// アドラー心理学固有の型
// ============================================================================

export interface AdlerianAnalysis {
  individualGoal: IndividualGoal;
  socialInterest: SocialInterestAssessment;
  lifestyle: LifestyleAssessment;
  encouragementOpportunities: EncouragementOpportunity[];
  inferiorityCompensation: CompensationPattern[];
  creativePower: CreativePowerAssessment;
  confidenceScore?: number;
}

export interface IndividualGoal {
  primaryGoal: string;
  secondaryGoals: string[];
  goalClarity: number;
  achievabilityAssessment: number;
  motivationAlignment: number;
  obstacleAnalysis: Obstacle[];
}

export interface SocialInterestAssessment {
  currentLevel: number;
  manifestations: SocialManifestation[];
  developmentOpportunities: SocialOpportunity[];
  communityEngagement: CommunityEngagement;
  cooperationPatterns: CooperationPattern[];
}

export interface LifestyleAssessment {
  dominantPattern: LifestylePattern;
  adaptiveAspects: string[];
  maladaptiveAspects: string[];
  changeReadiness: number;
  interventionRecommendations: LifestyleIntervention[];
}

export interface EncouragementOpportunity {
  situation: string;
  encouragementType: 'recognition' | 'empowerment' | 'belonging' | 'contribution';
  specificActions: string[];
  expectedImpact: number;
  timeframe: string;
}

export interface CompensationPattern {
  perceivedInferiority: string;
  compensationBehavior: string;
  adaptiveness: 'positive' | 'negative' | 'neutral';
  redirectionStrategy: string;
}

export interface CreativePowerAssessment {
  currentExpression: string[];
  untappedPotential: string[];
  barriers: string[];
  enhancementStrategies: string[];
}

// ============================================================================
// ドラッカー経営学固有の型
// ============================================================================

export interface DruckerianAnalysis {
  effectivenessAssessment: EffectivenessAssessment;
  managementPrinciples: ManagementPrincipleApplication[];
  innovationPotential: InnovationPotentialAssessment;
  leadershipDevelopment: LeadershipDevelopmentPlan;
  decisionMakingAnalysis: DecisionMakingAnalysis;
  productivityInsights: ProductivityInsightAnalysis;
}

export interface EffectivenessAssessment {
  currentEffectiveness: number;
  keyStrengths: string[];
  improvementAreas: string[];
  timeManagement: TimeManagementAssessment;
  prioritizationSkills: PrioritizationAssessment;
  resultOrientation: ResultOrientationAssessment;
}

export interface ManagementPrincipleApplication {
  principle: string;
  currentApplication: number;
  improvementOpportunities: string[];
  practicalExercises: string[];
  measurableOutcomes: string[];
}

export interface InnovationPotentialAssessment {
  systematicInnovation: number;
  opportunityRecognition: number;
  resourceAllocation: number;
  riskManagement: number;
  implementationCapability: number;
  innovationAreas: InnovationArea[];
}

export interface LeadershipDevelopmentPlan {
  currentLevel: LeadershipLevel;
  developmentGoals: LeadershipGoal[];
  competencyGaps: CompetencyGap[];
  developmentActivities: DevelopmentActivity[];
  mentorshipRecommendations: MentorshipRecommendation[];
}

export interface DecisionMakingAnalysis {
  decisionQuality: number;
  informationGathering: number;
  alternativeGeneration: number;
  riskAssessment: number;
  implementation: number;
  learningFromOutcomes: number;
  improvementStrategies: DecisionStrategy[];
}

// ============================================================================
// ソクラテス対話法固有の型
// ============================================================================

export interface SocraticAnalysis {
  questioningSkills: QuestioningSkillsAssessment;
  criticalThinking: CriticalThinkingAssessment;
  dialogueFacilitation: DialogueFacilitationAssessment;
  intellectualHumility: IntellectualHumilityAssessment;
  reasoningPatterns: ReasoningPatternAnalysis;
  knowledgeExamination: KnowledgeExaminationResults;
}

export interface ReasoningPatternAnalysis {
  patterns: ReasoningPattern[];
  dominantPattern: string;
  consistency: number;
  adaptability: number;
  logicalStructure: number;
  evidenceUsage: number;
}

export interface KnowledgeExaminationResults {
  knowledgeDepth: number;
  knowledgeAccuracy: number;
  knowledgeGaps: KnowledgeGap[];
  misconceptions: Misconception[];
  learningReadiness: number;
  recommendations: KnowledgeRecommendation[];
}

export interface ReasoningPattern {
  pattern: string;
  frequency: number;
  effectiveness: number;
  context: string;
}

export interface KnowledgeGap {
  area: string;
  severity: number;
  priority: number;
  fillStrategy: string;
}

export interface Misconception {
  concept: string;
  misconception: string;
  correctionApproach: string;
  difficulty: number;
}

export interface KnowledgeRecommendation {
  recommendation: string;
  rationale: string;
  priority: number;
  implementation: string[];
}

export interface QuestioningSkillsAssessment {
  questionTypes: QuestionTypeUsage[];
  questionDepth: number;
  questionClarity: number;
  followUpSkills: number;
  responseAdaptation: number;
  improvementAreas: QuestioningImprovement[];
}

export interface CriticalThinkingAssessment {
  analyticalSkills: number;
  evaluationSkills: number;
  inferenceSkills: number;
  interpretationSkills: number;
  explanationSkills: number;
  selfRegulation: number;
  thinkingBiases: ThinkingBias[];
}

export interface DialogueFacilitationAssessment {
  participantEngagement: number;
  conversationFlow: number;
  conflictResolution: number;
  insightGeneration: number;
  learningClimate: number;
  facilitationTechniques: FacilitationTechnique[];
}

export interface IntellectualHumilityAssessment {
  knowledgeLimitsAwareness: number;
  openToCorrection: number;
  respectForEvidence: number;
  perspectiveTaking: number;
  intellectualCourage: number;
  developmentAreas: HumilityDevelopmentArea[];
}

// ============================================================================
// 学習進捗と測定
// ============================================================================

export interface LearningProgressMetrics {
  contentMastery: ContentMasteryMetrics;
  skillDevelopment: SkillDevelopmentMetrics;
  behaviorChange: BehaviorChangeMetrics;
  engagement: EngagementAnalytics;
  retention: RetentionMetrics;
  application: ApplicationMetrics;
}

export interface ContentMasteryMetrics {
  conceptualUnderstanding: number;
  proceduralKnowledge: number;
  factualKnowledge: number;
  metacognitiveAwareness: number;
  knowledgeTransfer: number;
  assessmentResults: AssessmentResult[];
}

export interface SkillDevelopmentMetrics {
  technicalSkills: SkillMetric[];
  softSkills: SkillMetric[];
  frameworkSpecificSkills: FrameworkSkillMetric[];
  improvementRate: number;
  skillGaps: SkillGap[];
  masteryPrediction: MasteryPrediction[];
}

export interface BehaviorChangeMetrics {
  targetBehaviors: BehaviorMetric[];
  changeIndicators: ChangeIndicator[];
  sustainabilityFactors: SustainabilityFactor[];
  environmentalInfluences: EnvironmentalInfluence[];
  changeReadiness: number;
}

export interface EngagementAnalytics {
  activeParticipation: number;
  contentInteraction: number;
  exerciseCompletion: number;
  reflectionQuality: number;
  collaborationLevel: number;
  persistenceIndicators: PersistenceIndicator[];
}

// ============================================================================
// 個人化とアダプテーション
// ============================================================================

export interface PersonalizationProfile {
  learnerCharacteristics: LearnerCharacteristics;
  adaptationHistory: AdaptationRecord[];
  preferencePattern: PreferencePattern;
  performanceProfile: PerformanceProfile;
  motivationalProfile: MotivationalProfile;
  contextualFactors: ContextualFactor[];
}

export interface LearnerCharacteristics {
  cognitiveStyle: CognitiveStyle;
  learningPreferences: LearningPreference[];
  personalityTraits: PersonalityTrait[];
  priorExperience: ExperienceRecord[];
  currentCapabilities: CapabilityAssessment[];
}

export interface AdaptationRecord {
  adaptationType: AdaptationType;
  trigger: AdaptationTrigger;
  implementation: AdaptationImplementation;
  outcome: AdaptationOutcome;
  timestamp: Date;
  effectiveness: number;
}

export interface PreferencePattern {
  contentTypePreferences: ContentTypePreference[];
  exerciseTypePreferences: ExerciseTypePreference[];
  feedbackPreferences: FeedbackPreference[];
  pacingPreferences: PacingPreference;
  socialLearningPreferences: SocialLearningPreference;
}

// ============================================================================
// システム統合型
// ============================================================================

export interface IntegratedLearningExperience {
  frameworks: FrameworkIntegration[];
  synergies: FrameworkSynergy[];
  conflicts: FrameworkConflict[];
  balanceStrategy: BalanceStrategy;
  coherenceMetrics: CoherenceMetrics;
  adaptiveBlending: AdaptiveBlending;
}

export interface FrameworkIntegration {
  primaryFramework: string;
  secondaryFrameworks: string[];
  integrationApproach: IntegrationApproach;
  weight: number;
  conditions: IntegrationCondition[];
}

export interface FrameworkSynergy {
  frameworks: string[];
  synergyType: SynergyType;
  benefit: string;
  amplificationFactor: number;
  prerequisites: string[];
}

export interface FrameworkConflict {
  frameworks: string[];
  conflictType: ConflictType;
  resolutionStrategy: ConflictResolutionStrategy;
  priority: ConflictPriority;
}

// ============================================================================
// 詳細補助型定義
// ============================================================================

export type AnalysisType = 'content' | 'behavior' | 'performance' | 'engagement' | 'outcome';
export type AdaptationType = 'content' | 'sequence' | 'difficulty' | 'style' | 'pace' | 'support';
export type SynergyType = 'complementary' | 'reinforcing' | 'transformative' | 'emergent';
export type ConflictType = 'philosophical' | 'methodological' | 'practical' | 'temporal';
export type ConflictPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Evidence {
  type: string;
  content: string;
  reliability: number;
  timestamp: Date;
}

export interface Obstacle {
  obstacle: string;
  severity: number;
  overcomingStrategy: string;
}

export interface SocialManifestation {
  behavior: string;
  frequency: number;
  context: string;
}

export interface SocialOpportunity {
  opportunity: string;
  potential: number;
  requirements: string[];
}

export interface CommunityEngagement {
  level: number;
  activities: string[];
  impact: number;
}

export interface CooperationPattern {
  pattern: string;
  effectiveness: number;
  context: string;
}

export interface LifestylePattern {
  pattern: string;
  strength: number;
  adaptiveness: number;
}

export interface LifestyleIntervention {
  intervention: string;
  approach: string;
  expectedOutcome: string;
}

// 他の詳細型は実装時に段階的に追加
export interface TimeManagementAssessment { assessment: string; score: number; }
export interface PrioritizationAssessment { assessment: string; score: number; }
export interface ResultOrientationAssessment { assessment: string; score: number; }
export interface InnovationArea { area: string; potential: number; }
export interface LeadershipLevel { level: string; competencies: string[]; }
export interface LeadershipGoal { goal: string; timeline: string; }
export interface CompetencyGap { competency: string; gap: number; }
export interface DevelopmentActivity { activity: string; duration: number; }
export interface MentorshipRecommendation { recommendation: string; mentor: string; }
export interface DecisionStrategy { strategy: string; applicability: string; }
export interface QuestionTypeUsage { type: string; frequency: number; }
export interface QuestioningImprovement { area: string; strategy: string; }
export interface ThinkingBias { bias: string; frequency: number; }
export interface FacilitationTechnique { technique: string; effectiveness: number; }
export interface HumilityDevelopmentArea { area: string; approach: string; }
export interface AssessmentResult { assessment: string; score: number; }
export interface SkillMetric { skill: string; level: number; }
export interface FrameworkSkillMetric { framework: string; skills: SkillMetric[]; }
export interface SkillGap { skill: string; gap: number; }
export interface MasteryPrediction { skill: string; timeToMastery: number; }
export interface BehaviorMetric { behavior: string; current: number; target: number; }
export interface ChangeIndicator { indicator: string; strength: number; }
export interface SustainabilityFactor { factor: string; impact: number; }
export interface EnvironmentalInfluence { influence: string; effect: number; }
export interface PersistenceIndicator { indicator: string; value: number; }
export interface CognitiveStyle { style: string; strength: number; }
export interface LearningPreference { preference: string; strength: number; }
export interface PersonalityTrait { trait: string; value: number; }
export interface ExperienceRecord { experience: string; relevance: number; }
export interface CapabilityAssessment { capability: string; level: number; }
export interface AdaptationTrigger { trigger: string; threshold: number; }
export interface AdaptationImplementation { implementation: string; parameters: Map<string, any>; }
export interface AdaptationOutcome { outcome: string; effectiveness: number; }
export interface ContentTypePreference { type: string; preference: number; }
export interface ExerciseTypePreference { type: string; preference: number; }
export interface FeedbackPreference { type: string; preference: number; }
export interface PacingPreference { preference: string; value: number; }
export interface SocialLearningPreference { preference: string; level: number; }
export interface IntegrationApproach { approach: string; methodology: string; }
export interface IntegrationCondition { condition: string; required: boolean; }
export interface BalanceStrategy { strategy: string; weights: Map<string, number>; }
export interface CoherenceMetrics { metric: string; value: number; }
export interface AdaptiveBlending { rule: string; parameters: Map<string, any>; }
export interface ConflictResolutionStrategy { strategy: string; steps: string[]; }
export interface PerformanceProfile { metric: string; trend: number; }
export interface MotivationalProfile { factor: string; strength: number; }
export interface ContextualFactor { factor: string; impact: number; }
export interface RetentionMetrics { metric: string; value: number; }
export interface ApplicationMetrics { metric: string; value: number; }
export interface ProductivityInsightAnalysis { insight: string; impact: number; }