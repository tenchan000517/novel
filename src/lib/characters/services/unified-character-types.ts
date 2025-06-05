/**
 * @fileoverview 統合キャラクターサービス型定義
 * @description
 * 7つの専門サービス統合と記憶階層システム連携のための
 * 拡張型定義を提供
 */

import {
  Character,
  CharacterState,
  CharacterPsychology,
  Relationship,
  CharacterParameter,
  Skill,
  CharacterType,
  GrowthPhase
} from './types';

import {
  MemoryLevel,
  UnifiedMemoryContext,
  CharacterMasterRecord
} from '@/lib/memory/core/types';

// ============================================================================
// 詳細付きキャラクター情報（統合基盤対応）
// ============================================================================

/**
 * 詳細付きキャラクター情報（統合版）
 */
export interface CharacterWithDetails {
  id: string;
  name: string;
  description: string;
  type: CharacterType;
  emotionalState: string;
  skills: Array<{ name: string; level: number; proficiency?: number; }>;
  parameters: Array<{ name: string; value: number; category?: string; }>;
  growthPhase: string | null;
  relationships: Array<{
    targetCharacterId: string;
    targetCharacterName: string;
    relationshipType: string;
    strength: number;
    lastInteraction?: string;
  }>;
  recentAppearances: Array<{
    chapterNumber: number;
    summary: string;
    significance?: number;
  }>;
  personality?: {
    traits: string[];
    goals: string[];
    fears: string[];
  };
  state: {
    isActive: boolean;
    developmentStage: number;
    lastAppearance: number;
    activeGrowthPlanId?: string;
  };
  // 🆕 統合基盤データ
  unifiedData?: UnifiedCharacterData;
  hierarchicalData?: HierarchicalCharacterData;
  integrationMetadata?: UnifiedMetadata;
}

// ============================================================================
// 生成コンテキスト
// ============================================================================

/**
 * プロンプト生成コンテキスト
 */
export interface GenerationContext {
  /** 現在の章番号 */
  chapterNumber: number;
  
  /** 生成目的 */
  purpose: 'DIALOGUE' | 'ACTION' | 'NARRATION' | 'DESCRIPTION' | 'ANALYSIS';
  
  /** ストーリーコンテキスト */
  storyContext: {
    currentArc: string;
    theme: string;
    tone: string;
    pacing: string;
  };
  
  /** フォーカスレベル */
  focusLevel: 'PRIMARY' | 'SECONDARY' | 'BACKGROUND';
  
  /** 要求される詳細度 */
  detailLevel: 'BASIC' | 'ENHANCED' | 'COMPREHENSIVE' | 'DEEP_ANALYSIS';
  
  /** 関連キャラクター */
  relatedCharacters?: string[];
  
  /** 特定の分析要求 */
  analysisRequests?: string[];
}

// ============================================================================
// 統合キャラクターデータ
// ============================================================================

/**
 * 統合キャラクターデータ（7サービス統合版）
 */
export interface UnifiedCharacterData {
  /** 基本キャラクター情報（詳細付き） */
  character: CharacterWithDetails;
  
  /** 進化・発展情報 */
  evolution: CharacterEvolution;
  
  /** 心理分析情報 */
  psychology: PsychologyAnalysis;
  
  /** 関係性マップ */
  relationships: RelationshipMap;
  
  /** 動的パラメータ */
  parameters: DynamicParameters;
  
  /** スキル進行情報 */
  skills: SkillProgression;
  
  /** 検出履歴 */
  detection: DetectionHistory;
  
  /** 統合メタデータ */
  metadata: UnifiedMetadata;
}

/**
 * キャラクター進化情報
 */
export interface CharacterEvolution {
  /** 現在の発展段階 */
  currentStage: number;
  
  /** 発展経路 */
  developmentPath: {
    completed: DevelopmentMilestone[];
    upcoming: DevelopmentMilestone[];
    alternatives: DevelopmentMilestone[];
  };
  
  /** 成長計画 */
  growthPlan: {
    active: GrowthPlanData | null;
    completed: GrowthPlanData[];
    potential: GrowthPlanData[];
  };
  
  /** 進化予測 */
  evolutionPrediction: {
    nextMilestone: DevelopmentMilestone | null;
    estimatedChapters: number;
    confidence: number;
  };
  
  /** 変化履歴 */
  changeHistory: CharacterChangeRecord[];
}

/**
 * 心理分析情報
 */
export interface PsychologyAnalysis {
  /** 現在の心理状態 */
  currentPsychology: CharacterPsychology;
  
  /** 感情動向 */
  emotionalTrends: {
    dominant: string;
    secondary: string[];
    stability: number;
    volatility: number;
  };
  
  /** 行動予測 */
  behaviorPredictions: {
    likelyActions: string[];
    unlikelyActions: string[];
    confidence: number;
  };
  
  /** 内的動機 */
  motivation: {
    primary: string;
    secondary: string[];
    conflicts: string[];
  };
  
  /** 心理的パターン */
  patterns: {
    responsePatterns: ResponsePattern[];
    decisionPatterns: DecisionPattern[];
    adaptationPatterns: AdaptationPattern[];
  };
}

/**
 * 関係性マップ
 */
export interface RelationshipMap {
  /** 直接的関係 */
  direct: {
    relationships: EnhancedRelationship[];
    clusters: RelationshipCluster[];
    influences: InfluenceMap;
  };
  
  /** 間接的関係 */
  indirect: {
    connections: IndirectConnection[];
    networkPosition: NetworkPosition;
    socialDynamics: SocialDynamics;
  };
  
  /** 関係性進化 */
  evolution: {
    recentChanges: RelationshipChange[];
    trends: RelationshipTrend[];
    predictions: RelationshipPrediction[];
  };
  
  /** 関係性分析 */
  analysis: {
    socialRole: string;
    networkImportance: number;
    conflictPotential: number;
    supportNetwork: string[];
  };
}

/**
 * 動的パラメータ
 */
export interface DynamicParameters {
  /** 現在値 */
  current: ParameterSet;
  
  /** 成長傾向 */
  growth: {
    trends: ParameterTrend[];
    projections: ParameterProjection[];
    bottlenecks: ParameterBottleneck[];
  };
  
  /** 相対評価 */
  comparative: {
    peerComparison: PeerComparison;
    typeComparison: TypeComparison;
    optimalRanges: OptimalRange[];
  };
  
  /** パラメータ履歴 */
  history: {
    changes: ParameterChange[];
    milestones: ParameterMilestone[];
    correlations: ParameterCorrelation[];
  };
}

/**
 * スキル進行情報
 */
export interface SkillProgression {
  /** 習得済みスキル */
  acquired: EnhancedSkill[];
  
  /** 習得可能スキル */
  available: AvailableSkill[];
  
  /** スキル系統 */
  skillTrees: {
    trees: SkillTree[];
    progressPaths: SkillPath[];
    masteryLevels: MasteryLevel[];
  };
  
  /** 学習パターン */
  learningPattern: {
    strengths: string[];
    weaknesses: string[];
    preferredMethods: string[];
    learningSpeed: number;
  };
  
  /** スキル相関 */
  correlations: {
    synergies: SkillSynergy[];
    conflicts: SkillConflict[];
    dependencies: SkillDependency[];
  };
}

/**
 * 検出履歴
 */
export interface DetectionHistory {
  /** 登場履歴 */
  appearances: {
    recent: AppearanceRecord[];
    patterns: AppearancePattern[];
    frequency: AppearanceFrequency;
  };
  
  /** 言及履歴 */
  mentions: {
    direct: MentionRecord[];
    indirect: MentionRecord[];
    context: MentionContext[];
  };
  
  /** インタラクション履歴 */
  interactions: {
    recent: InteractionRecord[];
    patterns: InteractionPattern[];
    networks: InteractionNetwork[];
  };
  
  /** 検出メトリクス */
  metrics: {
    visibility: number;
    prominence: number;
    narrativeImportance: number;
    readerEngagement: number;
  };
}

/**
 * 統合メタデータ
 */
export interface UnifiedMetadata {
  /** 統合タイムスタンプ */
  unifiedAt: Date;
  
  /** データソース */
  sources: {
    character: string;
    evolution: string;
    psychology: string;
    relationships: string;
    parameters: string;
    skills: string;
    detection: string;
  };
  
  /** 品質メトリクス */
  quality: {
    completeness: number;
    consistency: number;
    reliability: number;
    freshness: number;
  };
  
  /** 統合統計 */
  statistics: {
    dataPoints: number;
    processingTime: number;
    cacheHits: number;
    errorCount: number;
  };
}

// ============================================================================
// 記憶階層統合データ
// ============================================================================

/**
 * 記憶階層統合キャラクターデータ
 */
export interface HierarchicalCharacterData {
  /** 短期記憶データ */
  shortTerm: CharacterShortTermData;
  
  /** 中期記憶データ */
  midTerm: CharacterMidTermData;
  
  /** 長期記憶データ */
  longTerm: CharacterLongTermData;
  
  /** 階層間整合性 */
  consistency: HierarchyConsistency;
  
  /** 統合コンテキスト */
  context: UnifiedMemoryContext;
}

/**
 * 短期記憶キャラクターデータ
 */
export interface CharacterShortTermData {
  /** 最近の状態 */
  recentStates: CharacterState[];
  
  /** 即座の変化 */
  immediateChanges: CharacterChange[];
  
  /** アクティブな感情 */
  activeEmotions: EmotionalState[];
  
  /** 直近のインタラクション */
  recentInteractions: RecentInteraction[];
  
  /** 処理中のイベント */
  processingEvents: ProcessingEvent[];
}

/**
 * 中期記憶キャラクターデータ
 */
export interface CharacterMidTermData {
  /** 発展分析 */
  developmentAnalysis: DevelopmentAnalysis;
  
  /** 関係性進化 */
  relationshipEvolution: RelationshipEvolution;
  
  /** パターン認識 */
  patterns: IdentifiedPattern[];
  
  /** 中期トレンド */
  trends: CharacterTrend[];
  
  /** 分析結果 */
  analysisResults: AnalysisResult[];
}

/**
 * 長期記憶キャラクターデータ
 */
export interface CharacterLongTermData {
  /** 統合プロファイル */
  consolidatedProfile: ConsolidatedCharacterProfile;
  
  /** 知識体系 */
  knowledgeBase: CharacterKnowledgeBase;
  
  /** 永続的特性 */
  persistentTraits: PersistentTrait[];
  
  /** 生涯発展記録 */
  lifetimeDevelopment: LifetimeDevelopmentRecord;
  
  /** マスターレコード */
  masterRecord: CharacterMasterRecord;
}

/**
 * 階層間整合性
 */
export interface HierarchyConsistency {
  /** 整合性スコア */
  score: number;
  
  /** 不整合項目 */
  inconsistencies: Inconsistency[];
  
  /** 解決提案 */
  resolutionSuggestions: ResolutionSuggestion[];
  
  /** 統合品質 */
  integrationQuality: number;
}

// ============================================================================
// 補助型定義
// ============================================================================

export interface DevelopmentMilestone {
  id: string;
  description: string;
  targetStage: number;
  estimatedChapter: number;
  significance: number;
  prerequisites: string[];
  outcomes: string[];
}

export interface GrowthPlanData {
  id: string;
  name: string;
  description: string;
  phases: GrowthPhase[];
  targetDuration: number;
  estimatedCompletion: number;
}

export interface CharacterChangeRecord {
  timestamp: Date;
  changeType: string;
  description: string;
  impact: number;
  chapter: number;
}

export interface ResponsePattern {
  trigger: string;
  response: string;
  frequency: number;
  confidence: number;
}

export interface DecisionPattern {
  situation: string;
  decisionType: string;
  factors: string[];
  likelihood: number;
}

export interface AdaptationPattern {
  stressor: string;
  adaptationMethod: string;
  effectiveness: number;
  timeline: number;
}

export interface EnhancedRelationship extends Relationship {
  dynamics: RelationshipDynamics;
  evolution: RelationshipEvolution;
  predictions: RelationshipPrediction[];
}

export interface RelationshipCluster {
  members: string[];
  centerCharacter: string;
  cohesion: number;
  influence: number;
}

export interface InfluenceMap {
  influencers: Array<{ characterId: string; influence: number }>;
  influenced: Array<{ characterId: string; influence: number }>;
  networks: InfluenceNetwork[];
}

export interface IndirectConnection {
  targetCharacterId: string;
  connectionPath: string[];
  strength: number;
  significance: number;
}

export interface NetworkPosition {
  centrality: number;
  betweenness: number;
  closeness: number;
  clustering: number;
}

export interface SocialDynamics {
  socialRole: string;
  groupMemberships: string[];
  conflicts: string[];
  alliances: string[];
}

export interface RelationshipChange {
  targetCharacterId: string;
  changeType: string;
  magnitude: number;
  chapter: number;
  reason: string;
}

export interface RelationshipTrend {
  targetCharacterId: string;
  trend: string;
  confidence: number;
  duration: number;
}

export interface RelationshipPrediction {
  targetCharacterId: string;
  predictedState: string;
  probability: number;
  timeframe: number;
}

export interface ParameterSet {
  parameters: CharacterParameter[];
  aggregates: ParameterAggregate[];
  scores: ParameterScore[];
}

export interface ParameterTrend {
  parameterId: string;
  trend: string;
  rate: number;
  confidence: number;
}

export interface ParameterProjection {
  parameterId: string;
  projectedValue: number;
  timeframe: number;
  confidence: number;
}

export interface ParameterBottleneck {
  parameterId: string;
  bottleneckType: string;
  severity: number;
  solutions: string[];
}

export interface PeerComparison {
  peers: Array<{ characterId: string; comparison: number }>;
  rank: number;
  percentile: number;
}

export interface TypeComparison {
  typeAverage: number;
  deviation: number;
  rank: number;
}

export interface OptimalRange {
  parameterId: string;
  min: number;
  max: number;
  current: number;
  target: number;
}

export interface ParameterChange {
  parameterId: string;
  oldValue: number;
  newValue: number;
  delta: number;
  chapter: number;
  reason: string;
}

export interface ParameterMilestone {
  parameterId: string;
  milestone: string;
  value: number;
  chapter: number;
  significance: number;
}

export interface ParameterCorrelation {
  parameter1: string;
  parameter2: string;
  correlation: number;
  significance: number;
}

export interface EnhancedSkill extends Skill {
  masteryLevel: string;
  proficiencyScore: number;
  learningProgress: number;
  usage: SkillUsage;
}

export interface AvailableSkill {
  skill: Skill;
  accessibility: number;
  requiredEffort: number;
  estimatedTime: number;
  prerequisites: string[];
}

export interface SkillTree {
  rootSkill: string;
  branches: SkillBranch[];
  completionRate: number;
  masteryLevel: string;
}

export interface SkillPath {
  skills: string[];
  description: string;
  difficulty: number;
  estimatedDuration: number;
}

export interface MasteryLevel {
  skillId: string;
  level: string;
  requirements: string[];
  benefits: string[];
}

export interface SkillSynergy {
  skills: string[];
  synergyType: string;
  benefit: number;
  description: string;
}

export interface SkillConflict {
  skills: string[];
  conflictType: string;
  severity: number;
  resolution: string;
}

export interface SkillDependency {
  dependentSkill: string;
  prerequisiteSkill: string;
  dependencyType: string;
  strength: number;
}

export interface AppearanceRecord {
  chapter: number;
  context: string;
  prominence: number;
  significance: number;
  timestamp: Date;
}

export interface AppearancePattern {
  patternType: string;
  frequency: number;
  context: string[];
  significance: number;
}

export interface AppearanceFrequency {
  recentFrequency: number;
  averageFrequency: number;
  trend: string;
  prediction: number;
}

export interface MentionRecord {
  chapter: number;
  mentionType: string;
  context: string;
  speaker: string;
  significance: number;
}

export interface MentionContext {
  contextType: string;
  frequency: number;
  associatedCharacters: string[];
  themes: string[];
}

export interface InteractionRecord {
  chapter: number;
  interactionType: string;
  participants: string[];
  significance: number;
  outcome: string;
}

export interface InteractionPattern {
  patternType: string;
  participants: string[];
  frequency: number;
  context: string;
}

export interface InteractionNetwork {
  networkType: string;
  members: string[];
  strength: number;
  activity: number;
}

// 記憶階層関連の補助型
export interface CharacterChange {
  attribute: string;
  oldValue: any;
  newValue: any;
  significance: number;
  chapter: number;
}

export interface EmotionalState {
  emotion: string;
  intensity: number;
  duration: number;
  trigger: string;
}

export interface RecentInteraction {
  targetCharacterId: string;
  interactionType: string;
  impact: number;
  chapter: number;
}

export interface ProcessingEvent {
  eventType: string;
  description: string;
  status: string;
  expectedResolution: number;
}

export interface DevelopmentAnalysis {
  stage: number;
  direction: string;
  factors: string[];
  projections: any[];
}

export interface RelationshipEvolution {
  changes: RelationshipChange[];
  patterns: any[];
  predictions: any[];
}

export interface IdentifiedPattern {
  patternType: string;
  confidence: number;
  description: string;
  implications: string[];
}

export interface CharacterTrend {
  trendType: string;
  direction: string;
  strength: number;
  duration: number;
}

export interface AnalysisResult {
  analysisType: string;
  result: any;
  confidence: number;
  timestamp: Date;
}

export interface ConsolidatedCharacterProfile {
  coreTraits: string[];
  establishedPatterns: any[];
  permanentChanges: any[];
  masterNarrative: string;
}

export interface CharacterKnowledgeBase {
  knowledgeAreas: string[];
  expertise: any[];
  experiences: any[];
  memories: any[];
}

export interface PersistentTrait {
  trait: string;
  strength: number;
  stability: number;
  firstAppearance: number;
}

export interface LifetimeDevelopmentRecord {
  phases: any[];
  milestones: any[];
  transformations: any[];
  growth: any[];
}

export interface Inconsistency {
  type: string;
  description: string;
  severity: number;
  affectedLayers: MemoryLevel[];
}

export interface ResolutionSuggestion {
  inconsistencyId: string;
  suggestion: string;
  confidence: number;
  effort: number;
}

// 補助型の続き
export interface RelationshipDynamics {
  stability: number;
  growth: number;
  tension: number;
  harmony: number;
}

export interface InfluenceNetwork {
  networkId: string;
  members: string[];
  influence: number;
  scope: string;
}

export interface ParameterAggregate {
  category: string;
  total: number;
  average: number;
  distribution: any;
}

export interface ParameterScore {
  scoreType: string;
  value: number;
  rank: number;
  percentile: number;
}

export interface SkillUsage {
  frequency: number;
  contexts: string[];
  effectiveness: number;
  improvement: number;
}

export interface SkillBranch {
  branchName: string;
  skills: string[];
  progression: number;
  requirements: string[];
}