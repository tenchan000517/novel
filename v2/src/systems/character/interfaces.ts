/**
 * キャラクター管理システムのインターフェース定義
 * MBTI統合、心理分析、成長管理、関係性管理を含む包括的なキャラクター管理
 */

import type { OperationResult } from '@/types/common';

// ============================================================================
// MBTI関連インターフェース
// ============================================================================

export type MBTIType = 
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export interface MBTIProfile {
  type: MBTIType;
  confidence: number;
  dimensions: {
    extraversion: number; // E/I
    sensing: number;      // S/N
    thinking: number;     // T/F
    judging: number;      // J/P
  };
  learningPattern: LearningPattern;
  behaviorPattern: BehaviorPattern;
  growthTendencies: GrowthTendency[];
}

export interface LearningPattern {
  preferredStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  processingSpeed: 'fast' | 'moderate' | 'slow' | 'variable';
  failureHandling: 'resilient' | 'sensitive' | 'analytical' | 'adaptive';
  motivationFactors: string[];
  stressResponses: string[];
}

export interface BehaviorPattern {
  decisionMaking: 'logical' | 'emotional' | 'balanced' | 'contextual';
  communicationStyle: 'direct' | 'indirect' | 'expressive' | 'reserved';
  conflictResolution: 'confrontational' | 'avoidant' | 'collaborative' | 'competitive';
  leadershipStyle?: 'authoritative' | 'democratic' | 'supportive' | 'delegative';
}

// ============================================================================
// キャラクター基本インターフェース
// ============================================================================

export type CharacterType = 'main' | 'supporting' | 'antagonist' | 'mentor' | 'background';

export interface Character {
  id: string;
  name: string;
  type: CharacterType;
  personalityTraits: PersonalityTraits;
  mbtiProfile: MBTIProfile;
  currentState: CharacterState;
  parameters: CharacterParameters;
  skills: CharacterSkills;
  relationships: Map<string, Relationship>;
  growthPlan: GrowthPlan;
  psychologyProfile: PsychologyProfile;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  intelligence: number;
  emotionalStability: number;
  creativity: number;
  leadership: number;
  empathy: number;
}

export interface CharacterState {
  currentMood: string;
  emotionalState: EmotionalState;
  location: string;
  activeGoals: string[];
  recentActions: string[];
  learningProgress: Map<string, number>;
  activeSkills: string[];
  stressLevel: number;
  motivationLevel: number;
  lastUpdated: Date;
}

export interface EmotionalState {
  primary: string;
  secondary?: string;
  intensity: number;
  stability: number;
  triggers: string[];
  duration: number;
}

// ============================================================================
// 成長管理インターフェース
// ============================================================================

export interface GrowthPlan {
  characterId: string;
  currentPhase: GrowthPhase;
  milestones: Milestone[];
  completedMilestones: string[];
  nextMilestone?: Milestone;
  estimatedCompletion: Date;
  progressPercentage: number;
  growthAreas: GrowthArea[];
}

export interface GrowthPhase {
  id: string;
  name: string;
  description: string;
  objectives: string[];
  requiredSkills: string[];
  estimatedDuration: number;
  successCriteria: string[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  type: 'skill' | 'personality' | 'relationship' | 'story' | 'learning';
  requirements: string[];
  rewards: string[];
  deadline?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface GrowthArea {
  category: string;
  currentLevel: number;
  targetLevel: number;
  progressRate: number;
  barriers: string[];
  strategies: string[];
}

export interface GrowthTendency {
  area: string;
  pattern: 'linear' | 'exponential' | 'plateau' | 'cyclical';
  speed: 'fast' | 'moderate' | 'slow';
  triggers: string[];
  inhibitors: string[];
}

// ============================================================================
// 関係性管理インターフェース
// ============================================================================

export type RelationshipType = 
  | 'friendship' | 'romantic' | 'family' | 'mentor-student' 
  | 'rivalry' | 'professional' | 'antagonistic' | 'neutral';

export interface Relationship {
  id: string;
  sourceCharacterId: string;
  targetCharacterId: string;
  type: RelationshipType;
  strength: number;
  trust: number;
  compatibility: number;
  conflictLevel: number;
  history: RelationshipEvent[];
  currentStatus: string;
  evolutionTrend: 'improving' | 'deteriorating' | 'stable' | 'volatile';
  lastInteraction: Date;
}

export interface RelationshipEvent {
  id: string;
  type: 'interaction' | 'conflict' | 'bonding' | 'separation' | 'achievement';
  description: string;
  impact: number;
  timestamp: Date;
  context: string;
  outcome: string;
}

// ============================================================================
// 心理分析インターフェース
// ============================================================================

export interface PsychologyProfile {
  characterId: string;
  personalityAssessment: PersonalityAssessment;
  behaviorPatterns: BehaviorAnalysis;
  emotionalProfile: EmotionalProfile;
  stressResponses: StressResponse[];
  motivationFactors: MotivationFactor[];
  cognitiveStyle: CognitiveStyle;
  socialBehavior: SocialBehavior;
  lastAnalysis: Date;
}

export interface PersonalityAssessment {
  mbtiAnalysis: MBTIAnalysis;
  bigFiveScores: PersonalityTraits;
  characterStrengths: string[];
  characterWeaknesses: string[];
  behaviorPredictions: BehaviorPrediction[];
  consistency: number;
}

export interface MBTIAnalysis {
  determinedType: MBTIType;
  confidence: number;
  alternativeTypes: MBTIType[];
  dimensionScores: {
    EI: number;
    SN: number;
    TF: number;
    JP: number;
  };
  typicalBehaviors: string[];
  stressIndicators: string[];
}

export interface BehaviorPrediction {
  situation: string;
  predictedResponse: string;
  confidence: number;
  alternativeResponses: string[];
  influencingFactors: string[];
}

// ============================================================================
// パラメータ・スキル管理インターフェース
// ============================================================================

export interface CharacterParameters {
  physical: PhysicalParameters;
  mental: MentalParameters;
  social: SocialParameters;
  special: SpecialParameters;
}

export interface PhysicalParameters {
  strength: number;
  agility: number;
  endurance: number;
  health: number;
  appearance: number;
}

export interface MentalParameters {
  intelligence: number;
  wisdom: number;
  creativity: number;
  memory: number;
  focus: number;
}

export interface SocialParameters {
  charisma: number;
  empathy: number;
  leadership: number;
  communication: number;
  influence: number;
}

export interface SpecialParameters {
  [key: string]: number;
}

export interface CharacterSkills {
  learned: Map<string, SkillLevel>;
  innate: Map<string, SkillLevel>;
  developing: Map<string, SkillProgress>;
  mastered: string[];
}

export interface SkillLevel {
  name: string;
  level: number;
  experience: number;
  maxLevel: number;
  category: string;
  prerequisites: string[];
}

export interface SkillProgress {
  name: string;
  currentLevel: number;
  targetLevel: number;
  progressPercentage: number;
  practiceTime: number;
  lastPractice: Date;
  difficulty: number;
}

// ============================================================================
// サービスインターフェース
// ============================================================================

export interface ICharacterManager {
  // キャラクター基本操作
  createCharacter(definition: CharacterDefinition): Promise<OperationResult<Character>>;
  getCharacter(characterId: string): Promise<OperationResult<Character>>;
  updateCharacter(characterId: string, updates: CharacterUpdate): Promise<OperationResult<Character>>;
  deleteCharacter(characterId: string): Promise<OperationResult<void>>;
  getAllCharacters(): Promise<OperationResult<Character[]>>;
  getCharactersByType(type: CharacterType): Promise<OperationResult<Character[]>>;
  searchCharacters(criteria: SearchCriteria): Promise<OperationResult<Character[]>>;
  
  // 詳細分析
  analyzeCharacterPsychology(characterId: string): Promise<OperationResult<PsychologyProfile>>;
  getCharacterRelationships(characterId: string): Promise<OperationResult<Relationship[]>>;
  trackCharacterGrowth(characterId: string): Promise<OperationResult<GrowthPlan>>;
  
  // 統計・レポート
  getCharacterStatistics(): Promise<OperationResult<CharacterStatistics>>;
  generateCharacterReport(characterId: string): Promise<OperationResult<CharacterReport>>;
}

export interface IMBTIAnalyzer {
  analyzeMBTI(personality: PersonalityTraits): Promise<OperationResult<MBTIAnalysis>>;
  getLearningPattern(mbtiType: MBTIType): Promise<OperationResult<LearningPattern>>;
  getBehaviorPattern(mbtiType: MBTIType): Promise<OperationResult<BehaviorPattern>>;
  getGrowthTendencies(mbtiType: MBTIType): Promise<OperationResult<GrowthTendency[]>>;
  predictBehavior(mbtiType: MBTIType, situation: string): Promise<OperationResult<BehaviorPrediction>>;
  getStatisticalData(mbtiType: MBTIType): Promise<OperationResult<MBTIStatistics>>;
}

export interface IPsychologyAnalyzer {
  analyzePersonality(character: Character): Promise<OperationResult<PersonalityAssessment>>;
  predictBehavior(character: Character, situation: string): Promise<OperationResult<BehaviorPrediction>>;
  analyzeEmotionalState(character: Character): Promise<OperationResult<EmotionalProfile>>;
  trackEmotionalEvolution(characterId: string): Promise<OperationResult<EmotionalEvolution>>;
}

export interface IGrowthManager {
  createGrowthPlan(character: Character): Promise<OperationResult<GrowthPlan>>;
  updateGrowthProgress(characterId: string, progress: GrowthProgress): Promise<OperationResult<void>>;
  getGrowthMilestones(characterId: string): Promise<OperationResult<Milestone[]>>;
  predictNextGrowthPhase(character: Character): Promise<OperationResult<GrowthPhase>>;
  analyzeGrowthRate(characterId: string): Promise<OperationResult<GrowthAnalysis>>;
}

export interface IRelationshipManager {
  createRelationship(sourceId: string, targetId: string, type: RelationshipType): Promise<OperationResult<Relationship>>;
  updateRelationship(relationshipId: string, updates: RelationshipUpdate): Promise<OperationResult<Relationship>>;
  getRelationships(characterId: string): Promise<OperationResult<Relationship[]>>;
  analyzeRelationshipDynamics(relationships: Relationship[]): Promise<OperationResult<RelationshipDynamics>>;
  predictRelationshipEvolution(relationshipId: string): Promise<OperationResult<RelationshipPrediction>>;
}

// ============================================================================
// ユーティリティ型
// ============================================================================

export interface CharacterDefinition {
  name: string;
  type: CharacterType;
  personalityTraits: PersonalityTraits;
  initialParameters?: Partial<CharacterParameters>;
  initialSkills?: string[];
  backstory?: string;
  goals?: string[];
}

export interface CharacterUpdate {
  personalityTraits?: Partial<PersonalityTraits>;
  currentState?: Partial<CharacterState>;
  parameters?: Partial<CharacterParameters>;
  skills?: Partial<CharacterSkills>;
}

export interface SearchCriteria {
  name?: string;
  type?: CharacterType;
  mbtiType?: MBTIType;
  minParameters?: Partial<CharacterParameters>;
  hasSkills?: string[];
  relationshipsWith?: string[];
}

export interface CharacterStatistics {
  totalCharacters: number;
  charactersByType: Map<CharacterType, number>;
  mbtiDistribution: Map<MBTIType, number>;
  averageGrowthRate: number;
  relationshipCount: number;
  skillDistribution: Map<string, number>;
}

export interface CharacterReport {
  character: Character;
  psychologyAnalysis: PsychologyProfile;
  growthAnalysis: GrowthPlan;
  relationshipSummary: RelationshipSummary;
  recommendations: string[];
  generatedAt: Date;
}

// 追加の型定義（使用される箇所で必要）
export interface MBTIStatistics {
  sampleSize: number;
  commonTraits: string[];
  learningPreferences: LearningPattern;
  compatibleTypes: MBTIType[];
  conflictTypes: MBTIType[];
}

export interface EmotionalProfile {
  dominantEmotions: string[];
  emotionalRange: number;
  stability: number;
  triggers: string[];
  copingMechanisms: string[];
}

export interface EmotionalEvolution {
  characterId: string;
  timeline: Array<{
    timestamp: Date;
    emotionalState: EmotionalState;
    triggers: string[];
    context: string;
  }>;
  trends: string[];
  patterns: string[];
}

export interface StressResponse {
  trigger: string;
  response: string;
  severity: number;
  copingStrategies: string[];
}

export interface MotivationFactor {
  factor: string;
  strength: number;
  category: 'intrinsic' | 'extrinsic' | 'social' | 'achievement';
}

export interface CognitiveStyle {
  processingSpeed: number;
  attentionSpan: number;
  memoryType: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  learningPreference: string[];
}

export interface SocialBehavior {
  groupDynamics: string;
  communicationStyle: string;
  conflictStyle: string;
  leadershipStyle?: string;
}

export interface BehaviorAnalysis {
  patterns: string[];
  consistency: number;
  predictability: number;
  adaptability: number;
}

export interface GrowthProgress {
  milestoneId: string;
  progressPercentage: number;
  skillGains: Map<string, number>;
  parameterChanges: Partial<CharacterParameters>;
  breakthroughs: string[];
}

export interface GrowthAnalysis {
  characterId: string;
  growthRate: number;
  strongAreas: string[];
  weakAreas: string[];
  recommendations: string[];
  predictedPath: GrowthPhase[];
}

export interface RelationshipUpdate {
  strength?: number;
  trust?: number;
  conflictLevel?: number;
  status?: string;
  events?: RelationshipEvent[];
}

export interface RelationshipDynamics {
  networkDensity: number;
  centralCharacters: string[];
  conflictPoints: string[];
  allianceGroups: string[][];
  influenceMap: Map<string, number>;
}

export interface RelationshipPrediction {
  relationshipId: string;
  predictedEvolution: 'strengthening' | 'weakening' | 'stable' | 'volatile';
  confidence: number;
  influencingFactors: string[];
  timeframe: number;
}

export interface RelationshipSummary {
  totalRelationships: number;
  strongRelationships: number;
  conflictRelationships: number;
  networkPosition: string;
  influenceScore: number;
}