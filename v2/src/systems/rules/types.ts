/**
 * Version 2.0 - Rules Management System Types
 * 
 * ルール管理システムの型定義
 * - 文章ルール: 一貫した文体・表記ルール
 * - 物語ルール: 世界観・設定の論理的整合性  
 * - 品質ルール: 最低品質基準の維持
 */

// ============================================================================
// Core Rule Types (基本ルール型)
// ============================================================================

/**
 * ルールカテゴリ
 */
export type RuleCategory = 
  | 'writing'    // 文章ルール
  | 'story'      // 物語ルール
  | 'quality';   // 品質ルール

/**
 * ルール優先度
 */
export type RulePriority = 
  | 'critical'   // 絶対遵守
  | 'high'       // 高優先度
  | 'medium'     // 中優先度
  | 'low'        // 低優先度
  | 'optional';  // 任意

/**
 * ルール適用範囲
 */
export type RuleScope = 
  | 'global'     // 全体
  | 'chapter'    // 章レベル
  | 'section'    // 篇レベル
  | 'scene'      // シーンレベル
  | 'paragraph'  // 段落レベル
  | 'sentence';  // 文レベル

/**
 * ルール違反の重要度
 */
export type ViolationSeverity = 
  | 'critical'   // 致命的
  | 'major'      // 重大
  | 'minor'      // 軽微
  | 'warning';   // 警告

// ============================================================================
// Writing Rules (文章ルール)
// ============================================================================

/**
 * 文章ルール
 * 要件: 一貫した文体・表記ルール
 */
export interface WritingRule {
  id: string;
  name: string;
  category: 'writing';
  type: WritingRuleType;
  description: string;
  priority: RulePriority;
  scope: RuleScope;
  
  // ルール設定
  config: WritingRuleConfig;
  
  // 適用条件
  conditions: RuleCondition[];
  
  // 違反対応
  violationHandling: ViolationHandling;
  
  // メタデータ
  metadata: RuleMetadata;
}

/**
 * 文章ルールタイプ
 */
export type WritingRuleType = 
  | 'style'          // 文体ルール
  | 'notation'       // 表記ルール
  | 'grammar'        // 文法ルール
  | 'formatting'     // 書式ルール
  | 'consistency'    // 一貫性ルール
  | 'readability';   // 読みやすさルール

/**
 * 文章ルール設定
 */
export interface WritingRuleConfig {
  // 文体設定
  style?: {
    tone: 'formal' | 'casual' | 'literary' | 'conversational';
    person: 'first' | 'second' | 'third';
    tense: 'past' | 'present' | 'future';
    voice: 'active' | 'passive';
    register: 'high' | 'medium' | 'low';
  };
  
  // 表記設定
  notation?: {
    numberFormat: 'arabic' | 'kanji' | 'mixed';
    quotationMarks: 'double' | 'single' | 'japanese';
    punctuation: 'standard' | 'literary' | 'modern';
    honorifics: 'formal' | 'casual' | 'context';
  };
  
  // 文法設定
  grammar?: {
    sentenceLength: { min: number; max: number; preferred: number };
    paragraphLength: { min: number; max: number; preferred: number };
    passiveVoiceLimit: number; // 受動態使用率制限
    repetitionLimit: number;   // 重複表現制限
  };
  
  // 一貫性設定
  consistency?: {
    characterNames: boolean;   // キャラクター名統一
    terminology: boolean;      // 用語統一
    timeExpression: boolean;   // 時間表現統一
    placeNames: boolean;       // 地名統一
  };
}

// ============================================================================
// Story Rules (物語ルール)
// ============================================================================

/**
 * 物語ルール
 * 要件: 世界観・設定の論理的整合性
 */
export interface StoryRule {
  id: string;
  name: string;
  category: 'story';
  type: StoryRuleType;
  description: string;
  priority: RulePriority;
  scope: RuleScope;
  
  // ルール設定
  config: StoryRuleConfig;
  
  // 適用条件
  conditions: RuleCondition[];
  
  // 違反対応
  violationHandling: ViolationHandling;
  
  // メタデータ
  metadata: RuleMetadata;
}

/**
 * 物語ルールタイプ
 */
export type StoryRuleType = 
  | 'world_consistency'    // 世界観一貫性
  | 'character_behavior'   // キャラクター行動
  | 'plot_logic'          // プロット論理性
  | 'setting_integrity'   // 設定整合性
  | 'timeline_coherence'  // 時系列整合性
  | 'physics_rules';      // 物理法則

/**
 * 物語ルール設定
 */
export interface StoryRuleConfig {
  // 世界観設定
  worldRules?: {
    physicsLaws: string[];      // 物理法則
    magicSystem?: MagicSystem;  // 魔法システム
    technology: TechnologyLevel; // 技術レベル
    socialStructure: SocialStructure; // 社会構造
  };
  
  // キャラクター設定
  characterRules?: {
    behaviorConsistency: boolean;    // 行動一貫性
    growthConstraints: GrowthConstraint[]; // 成長制約
    relationshipRules: RelationshipRule[]; // 関係性ルール
    abilityLimitations: AbilityLimit[];    // 能力制限
  };
  
  // プロット設定
  plotRules?: {
    causality: boolean;           // 因果関係必須
    timelineConsistency: boolean; // 時系列一貫性
    conflictResolution: string[]; // 解決方法制約
    pacing: PacingRule[];         // ペーシングルール
  };
  
  // 設定整合性
  settingRules?: {
    geographyConsistency: boolean; // 地理的整合性
    culturalConsistency: boolean;  // 文化的整合性
    economicLogic: boolean;        // 経済的論理性
    politicalStructure: boolean;   // 政治構造整合性
  };
}

// ============================================================================
// Quality Rules (品質ルール)
// ============================================================================

/**
 * 品質ルール
 * 要件: 最低品質基準の維持
 */
export interface QualityRule {
  id: string;
  name: string;
  category: 'quality';
  type: QualityRuleType;
  description: string;
  priority: RulePriority;
  scope: RuleScope;
  
  // ルール設定
  config: QualityRuleConfig;
  
  // 適用条件
  conditions: RuleCondition[];
  
  // 違反対応
  violationHandling: ViolationHandling;
  
  // メタデータ
  metadata: RuleMetadata;
}

/**
 * 品質ルールタイプ
 */
export type QualityRuleType = 
  | 'readability'        // 読みやすさ
  | 'engagement'         // エンゲージメント
  | 'professional'       // プロ基準
  | 'originality'        // 独創性
  | 'coherence'          // 一貫性
  | 'completeness';      // 完成度

/**
 * 品質ルール設定
 */
export interface QualityRuleConfig {
  // 読みやすさ設定
  readability?: {
    minScore: number;              // 最低スコア
    sentenceComplexity: number;    // 文章複雑度制限
    vocabularyLevel: number;       // 語彙レベル
    flowSmoothness: number;        // 流れの滑らかさ
  };
  
  // エンゲージメント設定
  engagement?: {
    minTensionLevel: number;       // 最低テンション
    emotionalVariety: number;      // 感情の多様性
    surpriseElements: number;      // 意外性要素
    readerInvolvement: number;     // 読者関与度
  };
  
  // プロ基準設定
  professional?: {
    craftmanshipLevel: number;     // 技巧レベル
    industryStandards: string[];   // 業界基準
    marketExpectations: string[];  // 市場期待
    criticalAcclaim: number;       // 批評的評価
  };
  
  // 独創性設定
  originality?: {
    uniquenessThreshold: number;   // 独自性閾値
    clicheAvoidance: string[];     // 避けるべき陳腐表現
    innovativeElements: number;    // 革新的要素
    creativeRisk: number;          // 創造的リスク
  };
}

// ============================================================================
// Rule Management Types (ルール管理型)
// ============================================================================

/**
 * ルールセット
 */
export interface RuleSet {
  id: string;
  name: string;
  category: RuleCategory;
  description: string;
  rules: (WritingRule | StoryRule | QualityRule)[];
  
  // 設定
  config: RuleSetConfig;
  
  // メタデータ
  metadata: {
    version: string;
    createdAt: Date;
    updatedAt: Date;
    author: string;
    usage: number;
    effectiveness: number;
  };
}

/**
 * ルールセット設定
 */
export interface RuleSetConfig {
  enforcement: 'strict' | 'moderate' | 'lenient';
  conflictResolution: 'priority' | 'merge' | 'manual';
  autoCorrection: boolean;
  warningThreshold: number;
  failureThreshold: number;
}

/**
 * ルール適用条件
 */
export interface RuleCondition {
  type: 'content' | 'context' | 'metadata';
  field: string;
  operator: 'equals' | 'contains' | 'matches' | 'range';
  value: any;
  negate?: boolean;
}

/**
 * 違反処理設定
 */
export interface ViolationHandling {
  action: 'ignore' | 'warn' | 'correct' | 'block';
  autoCorrection?: {
    enabled: boolean;
    method: string;
    confidence: number;
  };
  userNotification?: {
    enabled: boolean;
    severity: ViolationSeverity;
    message: string;
  };
}

/**
 * ルールメタデータ
 */
export interface RuleMetadata {
  version: string;
  createdAt: Date;
  updatedAt: Date;
  author: string;
  tags: string[];
  usage: {
    count: number;
    lastUsed: Date;
    effectiveness: number;
  };
  dependencies?: string[];
  conflicts?: string[];
}

// ============================================================================
// Rule Validation Types (ルール検証型)
// ============================================================================

/**
 * ルール検証結果
 */
export interface RuleValidationResult {
  success: boolean;
  score: number; // 0-1
  violations: RuleViolation[];
  suggestions: RuleSuggestion[];
  appliedCorrections: RuleCorrection[];
  metadata: ValidationMetadata;
}

/**
 * ルール違反
 */
export interface RuleViolation {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: ViolationSeverity;
  message: string;
  location: ViolationLocation;
  context: string;
  suggestion?: string;
  autoCorrection?: RuleCorrection;
}

/**
 * 違反位置
 */
export interface ViolationLocation {
  start: number;
  end: number;
  line?: number;
  column?: number;
  context: string;
}

/**
 * ルール提案
 */
export interface RuleSuggestion {
  type: 'improvement' | 'alternative' | 'enhancement';
  priority: RulePriority;
  message: string;
  location?: ViolationLocation;
  implementation?: string;
}

/**
 * ルール修正
 */
export interface RuleCorrection {
  type: 'replacement' | 'insertion' | 'deletion' | 'restructure';
  location: ViolationLocation;
  original: string;
  corrected: string;
  confidence: number; // 0-1
  explanation: string;
}

/**
 * 検証メタデータ
 */
export interface ValidationMetadata {
  processedAt: Date;
  processingTime: number;
  rulesApplied: number;
  violationsFound: number;
  correctionsApplied: number;
  confidence: number;
}

// ============================================================================
// Rule Application Types (ルール適用型)
// ============================================================================

/**
 * ルール適用
 */
export interface RuleApplication {
  ruleId: string;
  ruleName: string;
  appliedAt: Date;
  result: 'success' | 'failure' | 'partial';
  changes: RuleChange[];
  impact: ApplicationImpact;
}

/**
 * ルール変更
 */
export interface RuleChange {
  type: 'content' | 'structure' | 'metadata';
  location: ViolationLocation;
  before: string;
  after: string;
  reason: string;
}

/**
 * 適用影響
 */
export interface ApplicationImpact {
  readabilityChange: number;
  qualityChange: number;
  consistencyChange: number;
  userExperienceChange: number;
}

/**
 * ルール適用設定
 */
export interface RuleEnforcementConfig {
  mode: 'strict' | 'moderate' | 'lenient' | 'custom';
  autoCorrection: boolean;
  userConfirmation: boolean;
  batchProcessing: boolean;
  performance: {
    maxProcessingTime: number;
    maxMemoryUsage: number;
    concurrentRules: number;
  };
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    retention: number;
  };
}

/**
 * ルールコンテキスト
 */
export interface RuleContext {
  chapterNumber?: number;
  sectionId?: string;
  sceneId?: string;
  characterIds?: string[];
  genre?: string;
  targetAudience?: string;
  writingStyle?: string;
  qualityTarget?: number;
  previousContent?: string[];
  futureContent?: string[];
  metadata?: Record<string, any>;
}

/**
 * ルール競合解決
 */
export interface RuleConflictResolution {
  strategy: 'priority' | 'merge' | 'manual' | 'skip';
  resolvedRules: (WritingRule | StoryRule | QualityRule)[];
  skippedRules: (WritingRule | StoryRule | QualityRule)[];
  explanation: string;
  confidence: number;
}

// ============================================================================
// Supporting Types (サポート型)
// ============================================================================

/**
 * 魔法システム
 */
export interface MagicSystem {
  type: 'hard' | 'soft' | 'hybrid';
  rules: string[];
  limitations: string[];
  cost: string;
}

/**
 * 技術レベル
 */
export interface TechnologyLevel {
  era: 'ancient' | 'medieval' | 'modern' | 'futuristic';
  advancement: number; // 0-10
  limitations: string[];
  innovations: string[];
}

/**
 * 社会構造
 */
export interface SocialStructure {
  government: string;
  hierarchy: string[];
  classes: SocialClass[];
  institutions: string[];
}

/**
 * 社会階級
 */
export interface SocialClass {
  name: string;
  population: number;
  privileges: string[];
  restrictions: string[];
}

/**
 * 成長制約
 */
export interface GrowthConstraint {
  aspect: string;
  limitation: string;
  timeframe: string;
  exceptions?: string[];
}

/**
 * 関係性ルール
 */
export interface RelationshipRule {
  characters: string[];
  type: string;
  constraints: string[];
  development: string;
}

/**
 * 能力制限
 */
export interface AbilityLimit {
  ability: string;
  maxLevel: number;
  conditions: string[];
  consequences: string[];
}

/**
 * ペーシングルール
 */
export interface PacingRule {
  phase: string;
  duration: { min: number; max: number };
  tensionLevel: { min: number; max: number };
  events: number;
}