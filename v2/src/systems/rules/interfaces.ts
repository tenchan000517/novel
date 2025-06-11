/**
 * Version 2.0 - Rules Management System Interfaces
 * 
 * ルール管理システムインターフェース定義
 * - 文章ルール: 一貫した文体・表記ルール
 * - 物語ルール: 世界観・設定の論理的整合性
 * - 品質ルール: 最低品質基準の維持
 */

import { OperationResult } from '@/types/common';
import {
  RuleCategory,
  WritingRule,
  StoryRule,
  QualityRule,
  RuleValidationResult,
  RuleEnforcementConfig,
  RuleViolation,
  RuleSet,
  RuleApplication,
  RuleContext,
  RuleConflictResolution
} from './types';

/**
 * ルール管理システムメインインターフェース
 */
export interface IRulesManager {
  // ルール管理
  addRule(rule: WritingRule | StoryRule | QualityRule): Promise<OperationResult<string>>;
  updateRule(ruleId: string, updates: Partial<WritingRule | StoryRule | QualityRule>): Promise<OperationResult<void>>;
  removeRule(ruleId: string): Promise<OperationResult<void>>;
  getRule(ruleId: string): Promise<OperationResult<WritingRule | StoryRule | QualityRule>>;
  
  // ルールセット管理
  createRuleSet(name: string, category: RuleCategory): Promise<OperationResult<RuleSet>>;
  getRuleSet(category: RuleCategory): Promise<OperationResult<RuleSet>>;
  updateRuleSet(category: RuleCategory, ruleSet: Partial<RuleSet>): Promise<OperationResult<void>>;
  
  // ルール適用・検証
  validateContent(content: string, context: RuleContext): Promise<OperationResult<RuleValidationResult>>;
  enforceRules(content: string, context: RuleContext): Promise<OperationResult<string>>;
  checkCompliance(content: string, ruleIds: string[]): Promise<OperationResult<RuleValidationResult>>;
  
  // 違反処理
  handleViolations(violations: RuleViolation[]): Promise<OperationResult<RuleApplication[]>>;
  resolveConflicts(conflicts: RuleViolation[]): Promise<OperationResult<RuleConflictResolution>>;
  
  // システム管理
  getSystemHealth(): Promise<OperationResult<{ healthy: boolean; ruleCount: number; validationCount: number }>>;
  optimizeRules(): Promise<OperationResult<void>>;
  exportRules(): Promise<OperationResult<RuleSet[]>>;
  importRules(ruleSets: RuleSet[]): Promise<OperationResult<void>>;
}

/**
 * 文章ルール管理インターフェース
 */
export interface IWritingRulesManager {
  // 文体ルール
  validateWritingStyle(content: string, context: RuleContext): Promise<OperationResult<RuleValidationResult>>;
  enforceWritingStyle(content: string, styleRules: WritingRule[]): Promise<OperationResult<string>>;
  
  // 表記ルール
  validateNotation(content: string): Promise<OperationResult<RuleValidationResult>>;
  standardizeNotation(content: string): Promise<OperationResult<string>>;
  
  // 文法ルール
  validateGrammar(content: string): Promise<OperationResult<RuleValidationResult>>;
  correctGrammar(content: string): Promise<OperationResult<string>>;
  
  // 一貫性チェック
  checkStyleConsistency(content: string, previousContent: string[]): Promise<OperationResult<RuleValidationResult>>;
  maintainConsistency(content: string, referenceStyle: any): Promise<OperationResult<string>>;
}

/**
 * 物語ルール管理インターフェース
 */
export interface IStoryRulesManager {
  // 世界観ルール
  validateWorldConsistency(content: string, worldRules: StoryRule[]): Promise<OperationResult<RuleValidationResult>>;
  enforceWorldRules(content: string, context: RuleContext): Promise<OperationResult<string>>;
  
  // 設定整合性
  validateSettingConsistency(content: string, settings: any): Promise<OperationResult<RuleValidationResult>>;
  maintainSettingIntegrity(content: string, context: RuleContext): Promise<OperationResult<string>>;
  
  // キャラクター行動ルール
  validateCharacterBehavior(content: string, characterRules: StoryRule[]): Promise<OperationResult<RuleValidationResult>>;
  enforceCharacterConsistency(content: string, context: RuleContext): Promise<OperationResult<string>>;
  
  // プロット論理性
  validatePlotLogic(content: string, plotRules: StoryRule[]): Promise<OperationResult<RuleValidationResult>>;
  maintainPlotCoherence(content: string, context: RuleContext): Promise<OperationResult<string>>;
}

/**
 * 品質ルール管理インターフェース
 */
export interface IQualityRulesManager {
  // 品質基準チェック
  validateQualityStandards(content: string, qualityRules: QualityRule[]): Promise<OperationResult<RuleValidationResult>>;
  enforceQualityBaseline(content: string, context: RuleContext): Promise<OperationResult<string>>;
  
  // 読みやすさ評価
  assessReadability(content: string): Promise<OperationResult<{ score: number; suggestions: string[] }>>;
  improveReadability(content: string): Promise<OperationResult<string>>;
  
  // エンゲージメント評価
  assessEngagement(content: string, context: RuleContext): Promise<OperationResult<{ score: number; factors: string[] }>>;
  enhanceEngagement(content: string, context: RuleContext): Promise<OperationResult<string>>;
  
  // プロ基準適合
  validateProfessionalStandards(content: string): Promise<OperationResult<RuleValidationResult>>;
  elevateToProStandard(content: string, context: RuleContext): Promise<OperationResult<string>>;
}

/**
 * ルール適用エンジンインターフェース
 */
export interface IRuleEnforcementEngine {
  // ルール実行
  executeRule(rule: WritingRule | StoryRule | QualityRule, content: string, context: RuleContext): Promise<OperationResult<RuleApplication>>;
  executeBatch(rules: (WritingRule | StoryRule | QualityRule)[], content: string, context: RuleContext): Promise<OperationResult<RuleApplication[]>>;
  
  // 優先度管理
  prioritizeRules(rules: (WritingRule | StoryRule | QualityRule)[], context: RuleContext): (WritingRule | StoryRule | QualityRule)[];
  resolveRulePriorities(conflicts: RuleViolation[]): Promise<OperationResult<RuleViolation[]>>;
  
  // 設定管理
  updateEnforcementConfig(config: RuleEnforcementConfig): Promise<OperationResult<void>>;
  getEnforcementConfig(): RuleEnforcementConfig;
  
  // パフォーマンス
  optimizeExecution(rules: (WritingRule | StoryRule | QualityRule)[]): Promise<OperationResult<(WritingRule | StoryRule | QualityRule)[]>>;
  getCacheStatus(): { size: number; hitRate: number };
}

/**
 * ルール検証エンジンインターフェース
 */
export interface IRuleValidationEngine {
  // 検証実行
  validateAgainstRule(content: string, rule: WritingRule | StoryRule | QualityRule, context: RuleContext): Promise<OperationResult<RuleValidationResult>>;
  validateAgainstRuleSet(content: string, ruleSet: RuleSet, context: RuleContext): Promise<OperationResult<RuleValidationResult>>;
  
  // 違反検出
  detectViolations(content: string, rules: (WritingRule | StoryRule | QualityRule)[], context: RuleContext): Promise<OperationResult<RuleViolation[]>>;
  categorizeViolations(violations: RuleViolation[]): { critical: RuleViolation[]; major: RuleViolation[]; minor: RuleViolation[] };
  
  // 検証最適化
  optimizeValidation(rules: (WritingRule | StoryRule | QualityRule)[]): Promise<OperationResult<(WritingRule | StoryRule | QualityRule)[]>>;
  cacheValidationResults(content: string, results: RuleValidationResult): void;
}

/**
 * ルール競合解決インターフェース
 */
export interface IRuleConflictResolver {
  // 競合検出
  detectConflicts(rules: (WritingRule | StoryRule | QualityRule)[]): Promise<OperationResult<RuleViolation[]>>;
  analyzeConflictSeverity(conflicts: RuleViolation[]): Promise<OperationResult<{ severity: 'low' | 'medium' | 'high'; impact: string }[]>>;
  
  // 競合解決
  resolveConflicts(conflicts: RuleViolation[], strategy: 'priority' | 'merge' | 'manual'): Promise<OperationResult<RuleConflictResolution>>;
  suggestResolutionStrategies(conflicts: RuleViolation[]): Promise<OperationResult<string[]>>;
  
  // 競合防止
  preventConflicts(newRule: WritingRule | StoryRule | QualityRule, existingRules: (WritingRule | StoryRule | QualityRule)[]): Promise<OperationResult<{ hasConflicts: boolean; suggestions: string[] }>>;
  optimizeRuleHierarchy(rules: (WritingRule | StoryRule | QualityRule)[]): Promise<OperationResult<(WritingRule | StoryRule | QualityRule)[]>>;
}