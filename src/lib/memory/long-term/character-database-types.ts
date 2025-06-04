import { Character, CharacterType, CharacterState } from '@/types/characters';

// ============================================================================
// 型定義：キャラクターマスターデータベース（修正版）
// ============================================================================

/**
 * キャラクターマスターレコード（2箇所統合済み）
 */
export interface CharacterMasterRecord {
  // 基本情報（統合済み）
  id: string;
  name: string;
  type: CharacterType;
  description: string;
  
  // 統合メタデータ
  masterVersion: string;
  consolidatedFrom: ConsolidationSource[];
  lastConsolidated: string;
  conflictResolutions: CharacterConflictResolution[];
  
  // 拡張情報
  personality: CharacterPersonality;
  backstory: CharacterBackstory;
  relationships: CharacterRelationship[];
  state: ExtendedCharacterState;
  
  // 履歴情報
  developmentHistory: CharacterDevelopmentRecord[];
  appearanceHistory: CharacterAppearanceRecord[];
  changeHistory: CharacterChangeRecord[];
  
  // 統計情報
  statistics: CharacterStatistics;
  
  // フォーマット済みデータ
  formattedData: FormattedCharacterData;
  
  // メタデータ
  metadata: CharacterMetadata;
}

/**
 * 拡張キャラクター状態（修正版）
 * NOTE: CharacterState の skills と型競合を解決するため、
 * 基底型のプロパティを適切にオーバーライド
 */
export interface ExtendedCharacterState extends Omit<CharacterState, 'skills'> {
  // CharacterState から継承したが型を変更するプロパティ
  skills: SkillRecord[]; // string[] から SkillRecord[] に変更
  
  // 詳細状態
  detailedEmotionalState: DetailedEmotionalState;
  physicalCondition: PhysicalCondition;
  mentalCondition: MentalCondition;
  socialStatus: SocialStatus;
  
  // 能力・知識
  abilities: AbilityRecord[];
  knowledge: KnowledgeRecord[];
  
  // 所有・リソース
  possessions: PossessionRecord[];
  resources: ResourceRecord[];
  obligations: ObligationRecord[];
  
  // 目標・動機
  currentGoals: GoalRecord[];
  motivations: MotivationRecord[];
  conflicts: ConflictRecord[];
}

/**
 * 統合ソース情報
 */
export interface ConsolidationSource {
  source: 'CharacterManager' | 'WorldKnowledge' | 'StorageFiles' | 'Manual';
  sourceId: string;
  lastUpdated: string;
  priority: number;
  reliability: number;
}

/**
 * キャラクター競合解決記録
 */
export interface CharacterConflictResolution {
  conflictType: 'description' | 'type' | 'personality' | 'backstory' | 'state';
  sourceA: string;
  sourceB: string;
  conflictData: any;
  resolution: any;
  resolutionMethod: 'auto' | 'priority' | 'merge' | 'manual';
  resolvedAt: string;
  resolvedBy: string;
}

/**
 * 詳細キャラクター性格
 */
export interface CharacterPersonality {
  traits: string[];
  coreValues: string[];
  motivations: string[];
  fears: string[];
  habits: string[];
  speechPatterns: string[];
  emotionalRange: EmotionalRange;
  socialBehavior: SocialBehavior;
}

/**
 * 感情範囲
 */
export interface EmotionalRange {
  dominant: string;
  secondary: string[];
  triggers: Record<string, string[]>;
  expressions: Record<string, string[]>;
}

/**
 * 社会的行動
 */
export interface SocialBehavior {
  leadership: number; // 0-10
  cooperation: number; // 0-10
  empathy: number; // 0-10
  assertiveness: number; // 0-10
  socialEnergy: number; // 0-10
}

/**
 * キャラクター背景
 */
export interface CharacterBackstory {
  summary: string;
  keyEvents: BackstoryEvent[];
  significantRelationships: SignificantRelationship[];
  formativeExperiences: FormativeExperience[];
  secrets: string[];
  regrets: string[];
  achievements: string[];
}

/**
 * 背景イベント
 */
export interface BackstoryEvent {
  eventId: string;
  title: string;
  description: string;
  ageAtEvent?: number;
  impact: number; // 0-10
  eventType: 'trauma' | 'achievement' | 'relationship' | 'loss' | 'discovery' | 'other';
  relatedCharacters: string[];
}

/**
 * 重要な関係
 */
export interface SignificantRelationship {
  relationshipId: string;
  targetCharacterId: string;
  targetCharacterName: string;
  relationshipType: string;
  description: string;
  intensity: number; // 0-10
  duration: string;
  status: 'active' | 'ended' | 'complicated' | 'dormant';
  keyMoments: string[];
}

/**
 * 形成的経験
 */
export interface FormativeExperience {
  experienceId: string;
  title: string;
  description: string;
  ageRange: string;
  lessonsLearned: string[];
  skillsGained: string[];
  traitsFormed: string[];
  impact: number; // 0-10
}

/**
 * キャラクター関係性
 */
export interface CharacterRelationship {
  relationshipId: string;
  targetCharacterId: string;
  targetCharacterName: string;
  relationshipType: string;
  currentStatus: RelationshipStatus;
  history: RelationshipHistoryEntry[];
  dynamics: RelationshipDynamics;
  metadata: RelationshipMetadata;
}

/**
 * 関係性状態
 */
export interface RelationshipStatus {
  status: 'positive' | 'negative' | 'neutral' | 'complex';
  intensity: number; // 0-10
  trust: number; // 0-10
  understanding: number; // 0-10
  conflict: number; // 0-10
  dependency: number; // 0-10
  lastInteraction: string;
}

/**
 * 関係性履歴エントリ
 */
export interface RelationshipHistoryEntry {
  entryId: string;
  chapterNumber: number;
  event: string;
  impact: number;
  statusChange: Partial<RelationshipStatus>;
  timestamp: string;
}

/**
 * 関係性力学
 */
export interface RelationshipDynamics {
  powerBalance: number; // -10 to 10 (negative = other has power)
  emotionalConnection: number; // 0-10
  commonGoals: string[];
  conflictSources: string[];
  interactionPatterns: string[];
  growthPotential: number; // 0-10
}

/**
 * 関係性メタデータ
 */
export interface RelationshipMetadata {
  established: string;
  lastUpdated: string;
  significance: number; // 0-10
  narrativeRole: string;
  tags: string[];
}

/**
 * 詳細感情状態
 */
export interface DetailedEmotionalState {
  primary: string;
  secondary: string[];
  intensity: number; // 0-10
  stability: number; // 0-10
  triggers: string[];
  coping: string[];
  lastChange: string;
  influences: EmotionalInfluence[];
}

/**
 * 感情的影響
 */
export interface EmotionalInfluence {
  source: string;
  type: 'character' | 'event' | 'environment' | 'internal';
  impact: number; // -10 to 10
  duration: 'temporary' | 'ongoing' | 'permanent';
}

/**
 * 身体的状態
 */
export interface PhysicalCondition {
  health: number; // 0-10
  energy: number; // 0-10
  fitness: number; // 0-10
  injuries: InjuryRecord[];
  disabilities: DisabilityRecord[];
  appearance: AppearanceRecord;
}

/**
 * 精神状態
 */
export interface MentalCondition {
  clarity: number; // 0-10
  focus: number; // 0-10
  stress: number; // 0-10
  confidence: number; // 0-10
  mentalIssues: MentalIssueRecord[];
  copingMechanisms: string[];
}

/**
 * 社会的地位
 */
export interface SocialStatus {
  reputation: number; // 0-10
  influence: number; // 0-10
  connections: number; // 0-10
  socialCircles: string[];
  roles: SocialRole[];
  responsibilities: string[];
}

/**
 * スキル記録
 */
export interface SkillRecord {
  skillId: string;
  name: string;
  level: number; // 0-10
  experience: number;
  category: string;
  acquiredDate: string;
  lastUsed: string;
  relevantSituations: string[];
}

/**
 * 能力記録
 */
export interface AbilityRecord {
  abilityId: string;
  name: string;
  description: string;
  type: 'innate' | 'learned' | 'granted' | 'magical';
  power: number; // 0-10
  limitations: string[];
  cost: string;
  cooldown?: string;
}

/**
 * 知識記録
 */
export interface KnowledgeRecord {
  knowledgeId: string;
  domain: string;
  description: string;
  depth: number; // 0-10
  breadth: number; // 0-10
  source: string;
  acquiredDate: string;
  relevance: number; // 0-10
}

/**
 * 所有物記録
 */
export interface PossessionRecord {
  itemId: string;
  name: string;
  description: string;
  value: number;
  significance: number; // 0-10
  condition: string;
  location: string;
  acquiredDate: string;
}

/**
 * リソース記録
 */
export interface ResourceRecord {
  resourceId: string;
  type: 'financial' | 'social' | 'informational' | 'material' | 'time';
  name: string;
  amount: number;
  unit: string;
  availability: number; // 0-10
  renewability: 'renewable' | 'finite' | 'unknown';
}

/**
 * 義務記録
 */
export interface ObligationRecord {
  obligationId: string;
  type: 'legal' | 'moral' | 'social' | 'personal' | 'professional';
  description: string;
  priority: number; // 0-10
  deadline?: string;
  consequences: string[];
  progress: number; // 0-10 (completion)
}

/**
 * 目標記録
 */
export interface GoalRecord {
  goalId: string;
  title: string;
  description: string;
  type: 'short_term' | 'medium_term' | 'long_term' | 'life_goal';
  priority: number; // 0-10
  progress: number; // 0-10
  deadline?: string;
  obstacles: string[];
  resources: string[];
  dependencies: string[];
}

/**
 * 動機記録
 */
export interface MotivationRecord {
  motivationId: string;
  type: 'survival' | 'security' | 'belonging' | 'esteem' | 'self_actualization';
  description: string;
  intensity: number; // 0-10
  source: string;
  satisfactionLevel: number; // 0-10
  related: string[];
}

/**
 * 対立記録
 */
export interface ConflictRecord {
  conflictId: string;
  type: 'internal' | 'interpersonal' | 'societal' | 'ideological';
  description: string;
  severity: number; // 0-10
  parties: string[];
  stakes: string[];
  possibleResolutions: string[];
  progress: number; // 0-10 toward resolution
}

/**
 * キャラクター開発記録
 */
export interface CharacterDevelopmentRecord {
  recordId: string;
  chapterNumber: number;
  developmentType: 'personality' | 'skill' | 'relationship' | 'goal' | 'backstory';
  description: string;
  significance: number; // 0-10
  impact: string[];
  timestamp: string;
  relatedEvents: string[];
}

/**
 * キャラクター登場記録
 */
export interface CharacterAppearanceRecord {
  recordId: string;
  chapterNumber: number;
  role: 'protagonist' | 'deuteragonist' | 'supporting' | 'minor' | 'mentioned';
  significance: number; // 0-10
  screenTime: number; // estimated minutes/pages
  interactions: string[];
  impact: string;
  timestamp: string;
}

/**
 * キャラクター変更記録
 */
export interface CharacterChangeRecord {
  recordId: string;
  chapterNumber: number;
  changeType: 'state' | 'personality' | 'relationship' | 'backstory' | 'metadata';
  fieldChanged: string;
  previousValue: any;
  newValue: any;
  reason: string;
  source: string;
  timestamp: string;
  significance: number; // 0-10
}

/**
 * キャラクター統計
 */
export interface CharacterStatistics {
  totalAppearances: number;
  totalScreenTime: number;
  averageSignificance: number;
  relationshipCount: number;
  developmentEvents: number;
  conflictInvolvement: number;
  lastActivity: string;
  firstAppearance: number;
  peakChapter: number;
  trendingTopics: string[];
}

/**
 * フォーマット済みキャラクターデータ
 */
export interface FormattedCharacterData {
  shortDescription: string;
  mediumDescription: string;
  longDescription: string;
  personalityProfile: string;
  relationshipSummary: string;
  backgroundSummary: string;
  currentStatusSummary: string;
  developmentArc: string;
  keyQuotes: string[];
  characterTags: string[];
  lastFormatted: string;
}

/**
 * キャラクターメタデータ
 */
export interface CharacterMetadata {
  createdAt: string;
  createdBy: string;
  lastUpdated: string;
  updatedBy: string;
  version: string;
  locked: boolean;
  archivalStatus: 'active' | 'archived' | 'deprecated';
  importanceScore: number; // 0-10
  narrativeRole: string;
  tags: string[];
  notes: string[];
}

// インジュリー、障害、外見などの詳細型
export interface InjuryRecord {
  injuryId: string;
  type: string;
  severity: number; // 0-10
  healingRate: number; // 0-10
  description: string;
  acquiredDate: string;
  expectedHealing?: string;
}

export interface DisabilityRecord {
  disabilityId: string;
  type: string;
  severity: number; // 0-10
  description: string;
  adaptations: string[];
  impact: string[];
}

export interface AppearanceRecord {
  height: string;
  build: string;
  hairColor: string;
  eyeColor: string;
  distinctiveFeatures: string[];
  style: string;
  mannerisms: string[];
}

export interface MentalIssueRecord {
  issueId: string;
  type: string;
  severity: number; // 0-10
  description: string;
  triggers: string[];
  coping: string[];
  professional: string[];
}

export interface SocialRole {
  roleId: string;
  title: string;
  organization: string;
  responsibilities: string[];
  authority: number; // 0-10
  visibility: number; // 0-10
}