/**
 * Configuration Management System Interfaces
 * 
 * 設定管理システムのインターフェース定義
 * Version 2.0要件: 設定管理・動的設定・バリデーション・プロファイル管理
 */

import type { OperationResult, SystemId } from '@/types/common';
import type {
  ConfigurationManagerConfig,
  ConfigurationProfile,
  ConfigurationSchema,
  ConfigurationValidation,
  ConfigurationHistory,
  ConfigurationTemplate,
  ConfigurationContext,
  ConfigurationMetrics,
  ConfigurationStatistics,
  ConfigurationReport,
  ConfigurationType,
  ConfigurationScope,
  ConfigurationSource,
  ValidationLevel,
  TimePeriod,
} from './types';

// ============================================================================
// メイン設定マネージャーインターフェース
// ============================================================================

export interface IConfigurationManager {
  readonly systemId: SystemId;

  // 設定管理
  getConfiguration(key: string, scope?: ConfigurationScope): Promise<OperationResult<ConfigurationValue>>;
  setConfiguration(key: string, value: ConfigurationValue, scope?: ConfigurationScope): Promise<OperationResult<void>>;
  updateConfiguration(updates: ConfigurationUpdate[]): Promise<OperationResult<ConfigurationUpdateResult>>;
  deleteConfiguration(key: string, scope?: ConfigurationScope): Promise<OperationResult<void>>;

  // 設定検証
  validateConfiguration(config: ConfigurationData): Promise<OperationResult<ConfigurationValidation>>;
  validateSchema(schema: ConfigurationSchema): Promise<OperationResult<SchemaValidation>>;
  checkConfigurationIntegrity(): Promise<OperationResult<IntegrityCheck>>;
  verifyConfigurationConsistency(configs: ConfigurationData[]): Promise<OperationResult<ConsistencyCheck>>;

  // プロファイル管理
  createConfigurationProfile(profile: ConfigurationProfile): Promise<OperationResult<ConfigurationProfile>>;
  getConfigurationProfile(profileId: string): Promise<OperationResult<ConfigurationProfile>>;
  updateConfigurationProfile(profileId: string, updates: Partial<ConfigurationProfile>): Promise<OperationResult<ConfigurationProfile>>;
  deleteConfigurationProfile(profileId: string): Promise<OperationResult<void>>;

  // テンプレート管理
  createConfigurationTemplate(template: ConfigurationTemplate): Promise<OperationResult<ConfigurationTemplate>>;
  applyConfigurationTemplate(templateId: string, context: ConfigurationContext): Promise<OperationResult<ConfigurationData>>;
  generateTemplateFromProfile(profileId: string): Promise<OperationResult<ConfigurationTemplate>>;
  validateTemplate(template: ConfigurationTemplate): Promise<OperationResult<TemplateValidation>>;

  // 履歴・バックアップ
  getConfigurationHistory(key?: string, timeframe?: TimePeriod): Promise<OperationResult<ConfigurationHistory[]>>;
  createConfigurationBackup(scope?: ConfigurationScope): Promise<OperationResult<ConfigurationBackup>>;
  restoreConfigurationBackup(backupId: string): Promise<OperationResult<RestoreResult>>;
  rollbackConfiguration(targetVersion: string): Promise<OperationResult<RollbackResult>>;

  // 動的設定
  subscribeToConfigurationChanges(key: string, callback: ConfigurationChangeCallback): Promise<OperationResult<SubscriptionId>>;
  unsubscribeFromConfigurationChanges(subscriptionId: SubscriptionId): Promise<OperationResult<void>>;
  broadcastConfigurationChange(change: ConfigurationChange): Promise<OperationResult<BroadcastResult>>;
  reloadConfiguration(scope?: ConfigurationScope): Promise<OperationResult<ReloadResult>>;

  // 統計・監視
  getConfigurationStatistics(): Promise<OperationResult<ConfigurationStatistics>>;
  generateConfigurationReport(period: TimePeriod): Promise<OperationResult<ConfigurationReport>>;
  monitorConfigurationHealth(): Promise<OperationResult<HealthMonitoring>>;
  trackConfigurationUsage(timeframe: TimePeriod): Promise<OperationResult<UsageTracking>>;

  // システム管理
  healthCheck(): Promise<{ healthy: boolean; issues: string[] }>;
}

// ============================================================================
// 設定検証インターフェース
// ============================================================================

export interface IConfigurationValidator {
  // 基本検証
  validateValue(value: ConfigurationValue, schema: ValueSchema): Promise<OperationResult<ValueValidation>>;
  validateType(value: ConfigurationValue, expectedType: ConfigurationType): Promise<OperationResult<TypeValidation>>;
  validateRange(value: ConfigurationValue, range: ValueRange): Promise<OperationResult<RangeValidation>>;

  // スキーマ検証
  validateAgainstSchema(config: ConfigurationData, schema: ConfigurationSchema): Promise<OperationResult<SchemaValidationResult>>;
  validateSchemaStructure(schema: ConfigurationSchema): Promise<OperationResult<StructureValidation>>;
  checkSchemaCompatibility(oldSchema: ConfigurationSchema, newSchema: ConfigurationSchema): Promise<OperationResult<CompatibilityCheck>>;

  // 整合性検証
  validateCrossDependencies(configs: ConfigurationData[]): Promise<OperationResult<DependencyValidation>>;
  checkBusinessRules(config: ConfigurationData): Promise<OperationResult<BusinessRuleValidation>>;
  validateEnvironmentConsistency(config: ConfigurationData, environment: string): Promise<OperationResult<EnvironmentValidation>>;
}

// ============================================================================
// 設定プロファイル管理インターフェース
// ============================================================================

export interface IConfigurationProfileManager {
  // プロファイル作成・管理
  createProfile(name: string, description: string, configs: ConfigurationData): Promise<OperationResult<ConfigurationProfile>>;
  cloneProfile(sourceProfileId: string, newName: string): Promise<OperationResult<ConfigurationProfile>>;
  mergeProfiles(profileIds: string[], strategy: MergeStrategy): Promise<OperationResult<ConfigurationProfile>>;
  compareProfiles(profileId1: string, profileId2: string): Promise<OperationResult<ProfileComparison>>;

  // プロファイル適用
  activateProfile(profileId: string): Promise<OperationResult<ActivationResult>>;
  deactivateProfile(profileId: string): Promise<OperationResult<DeactivationResult>>;
  switchProfile(fromProfileId: string, toProfileId: string): Promise<OperationResult<SwitchResult>>;
  previewProfileChanges(profileId: string): Promise<OperationResult<ChangePreview>>;

  // プロファイル分析
  analyzeProfileUsage(profileId: string, timeframe: TimePeriod): Promise<OperationResult<UsageAnalysis>>;
  identifyProfileConflicts(profileIds: string[]): Promise<OperationResult<ConflictAnalysis>>;
  suggestProfileOptimizations(profileId: string): Promise<OperationResult<OptimizationSuggestion[]>>;
}

// ============================================================================
// 設定テンプレート管理インターフェース
// ============================================================================

export interface IConfigurationTemplateManager {
  // テンプレート作成・管理
  createTemplate(name: string, description: string, config: ConfigurationData): Promise<OperationResult<ConfigurationTemplate>>;
  parameterizeTemplate(templateId: string, parameters: TemplateParameter[]): Promise<OperationResult<ParameterizedTemplate>>;
  validateTemplateParameters(template: ConfigurationTemplate, parameters: ParameterValues): Promise<OperationResult<ParameterValidation>>;
  instantiateTemplate(templateId: string, parameters: ParameterValues): Promise<OperationResult<ConfigurationData>>;

  // テンプレート分析
  analyzeTemplateUsage(templateId: string, timeframe: TimePeriod): Promise<OperationResult<TemplateUsageAnalysis>>;
  identifyTemplatePatterns(configs: ConfigurationData[]): Promise<OperationResult<TemplatePattern[]>>;
  suggestTemplateImprovements(templateId: string): Promise<OperationResult<TemplateImprovement[]>>;
  generateTemplateDocumentation(templateId: string): Promise<OperationResult<TemplateDocumentation>>;
}

// ============================================================================
// 設定変更管理インターフェース
// ============================================================================

export interface IConfigurationChangeManager {
  // 変更追跡
  trackChange(change: ConfigurationChange): Promise<OperationResult<ChangeRecord>>;
  getChangeHistory(key?: string, timeframe?: TimePeriod): Promise<OperationResult<ChangeRecord[]>>;
  analyzeChangeImpact(change: ConfigurationChange): Promise<OperationResult<ImpactAnalysis>>;
  predictChangeConsequences(change: ConfigurationChange): Promise<OperationResult<ConsequencePrediction>>;

  // 変更管理
  proposeChange(change: ConfigurationChange): Promise<OperationResult<ChangeProposal>>;
  approveChange(changeId: string, approver: string): Promise<OperationResult<ApprovalResult>>;
  implementChange(changeId: string): Promise<OperationResult<ImplementationResult>>;
  rollbackChange(changeId: string): Promise<OperationResult<RollbackResult>>;

  // 変更通知
  notifyChangeStakeholders(change: ConfigurationChange): Promise<OperationResult<NotificationResult>>;
  scheduleChangeDeployment(change: ConfigurationChange, schedule: DeploymentSchedule): Promise<OperationResult<ScheduleResult>>;
  monitorChangeDeployment(changeId: string): Promise<OperationResult<DeploymentMonitoring>>;
}

// ============================================================================
// 設定セキュリティ管理インターフェース
// ============================================================================

export interface IConfigurationSecurityManager {
  // アクセス制御
  checkPermissions(user: string, operation: ConfigurationOperation, key: string): Promise<OperationResult<PermissionCheck>>;
  grantPermission(user: string, permission: ConfigurationPermission): Promise<OperationResult<PermissionGrant>>;
  revokePermission(user: string, permission: ConfigurationPermission): Promise<OperationResult<PermissionRevocation>>;
  auditPermissions(scope?: string): Promise<OperationResult<PermissionAudit>>;

  // 暗号化・保護
  encryptSensitiveConfiguration(config: ConfigurationData): Promise<OperationResult<EncryptedConfiguration>>;
  decryptConfiguration(encryptedConfig: EncryptedConfiguration): Promise<OperationResult<ConfigurationData>>;
  maskSensitiveValues(config: ConfigurationData): Promise<OperationResult<MaskedConfiguration>>;
  validateSecurityCompliance(config: ConfigurationData): Promise<OperationResult<SecurityCompliance>>;

  // セキュリティ監視
  monitorSecurityEvents(): Promise<OperationResult<SecurityEvent[]>>;
  detectAnomalousAccess(accessPattern: AccessPattern): Promise<OperationResult<AnomalyDetection>>;
  generateSecurityReport(timeframe: TimePeriod): Promise<OperationResult<SecurityReport>>;
}

// ============================================================================
// 支援型定義
// ============================================================================

export interface ConfigurationValue {
  value: any;
  type: ConfigurationType;
  encrypted: boolean;
  sensitive: boolean;
  source: ConfigurationSource;
  metadata: ValueMetadata;
  lastModified: Date;
  modifiedBy: string;
}

export interface ConfigurationData {
  [key: string]: ConfigurationValue;
}

export interface ConfigurationUpdate {
  key: string;
  value: ConfigurationValue;
  scope?: ConfigurationScope;
  reason?: string;
  requester?: string;
}

export interface ConfigurationUpdateResult {
  successful: ConfigurationUpdate[];
  failed: FailedUpdate[];
  warnings: UpdateWarning[];
}

export interface ConfigurationChange {
  changeId: string;
  type: ChangeType;
  key: string;
  oldValue?: ConfigurationValue;
  newValue: ConfigurationValue;
  scope: ConfigurationScope;
  requester: string;
  reason: string;
  timestamp: Date;
}

export interface ConfigurationChangeCallback {
  (change: ConfigurationChange): void;
}

export interface ConfigurationBackup {
  backupId: string;
  scope: ConfigurationScope;
  data: ConfigurationData;
  metadata: BackupMetadata;
  createdAt: Date;
}

// 型エイリアス（詳細実装用）
export type SubscriptionId = string;
export type ValueSchema = any;
export type ValueRange = any;
export type ValueMetadata = any;
export type FailedUpdate = any;
export type UpdateWarning = any;
export type ChangeType = string;
export type BackupMetadata = any;
export type ValueValidation = any;
export type TypeValidation = any;
export type RangeValidation = any;
export type SchemaValidation = any;
export type SchemaValidationResult = any;
export type StructureValidation = any;
export type CompatibilityCheck = any;
export type DependencyValidation = any;
export type BusinessRuleValidation = any;
export type EnvironmentValidation = any;
export type IntegrityCheck = any;
export type ConsistencyCheck = any;
export type TemplateValidation = any;
export type RestoreResult = any;
export type RollbackResult = any;
export type BroadcastResult = any;
export type ReloadResult = any;
export type HealthMonitoring = any;
export type UsageTracking = any;
export type MergeStrategy = any;
export type ProfileComparison = any;
export type ActivationResult = any;
export type DeactivationResult = any;
export type SwitchResult = any;
export type ChangePreview = any;
export type UsageAnalysis = any;
export type ConflictAnalysis = any;
export type OptimizationSuggestion = any;
export type TemplateParameter = any;
export type ParameterizedTemplate = any;
export type ParameterValues = any;
export type ParameterValidation = any;
export type TemplateUsageAnalysis = any;
export type TemplatePattern = any;
export type TemplateImprovement = any;
export type TemplateDocumentation = any;
export type ChangeRecord = any;
export type ImpactAnalysis = any;
export type ConsequencePrediction = any;
export type ChangeProposal = any;
export type ApprovalResult = any;
export type ImplementationResult = any;
export type NotificationResult = any;
export type DeploymentSchedule = any;
export type ScheduleResult = any;
export type DeploymentMonitoring = any;
export type ConfigurationOperation = any;
export type ConfigurationPermission = any;
export type PermissionCheck = any;
export type PermissionGrant = any;
export type PermissionRevocation = any;
export type PermissionAudit = any;
export type EncryptedConfiguration = any;
export type MaskedConfiguration = any;
export type SecurityCompliance = any;
export type SecurityEvent = any;
export type AccessPattern = any;
export type AnomalyDetection = any;
export type SecurityReport = any;