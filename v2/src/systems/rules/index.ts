/**
 * Version 2.0 - Rules System Index
 * 
 * ルール管理システムのエントリーポイント
 */

// Core exports
export { RulesManager } from './core/rules-manager';

// Type exports
export type {
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
  RuleConflictResolution,
  WritingRuleType,
  StoryRuleType,
  QualityRuleType,
  RulePriority,
  RuleScope,
  ViolationSeverity,
  WritingRuleConfig,
  StoryRuleConfig,
  QualityRuleConfig,
  RuleSetConfig,
  RuleCondition,
  ViolationHandling,
  RuleMetadata,
  ViolationLocation,
  RuleSuggestion,
  RuleCorrection,
  ValidationMetadata,
  RuleChange,
  ApplicationImpact
} from './types';

// Interface exports
export type {
  IRulesManager,
  IWritingRulesManager,
  IStoryRulesManager,
  IQualityRulesManager,
  IRuleEnforcementEngine,
  IRuleValidationEngine,
  IRuleConflictResolver
} from './interfaces';

// Default export
export { RulesManager as default } from './core/rules-manager';