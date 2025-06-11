/**
 * Configuration Management System - Public Interface
 * 
 * 設定管理システムの公開インターフェース
 * Version 2.0要件: 設定管理・動的設定・バリデーション・プロファイル管理
 */

// コアマネージャー
export { ConfigurationManager } from './core/configuration-manager';
import { ConfigurationManager } from './core/configuration-manager';

// インターフェース
export type {
  IConfigurationManager,
  IConfigurationValidator,
  IConfigurationProfileManager,
  IConfigurationTemplateManager,
  IConfigurationChangeManager,
  IConfigurationSecurityManager,
  ConfigurationValue,
  ConfigurationData,
  ConfigurationUpdate,
  ConfigurationUpdateResult,
  ConfigurationChange,
  ConfigurationChangeCallback,
  ConfigurationBackup
} from './interfaces';

// 型定義のインポート
import {
  ConfigurationManagerConfig,
  ConfigurationValidationConfig,
  ConfigurationSecurityConfig,
  ConfigurationProfileConfig,
  ConfigurationProfile,
  ConfigurationTemplate,
  ConfigurationContext,
  ValidationLevel,
  AccessControlModel,
  ConfigurationScope,
  ConfigurationType,
  ConfigurationSource,
  TemplateCategory,
  SecurityLevel,
  PerformanceImpact
} from './types';

import {
  ConfigurationUpdate
} from './interfaces';

import {
  ConfigurationValue,
  ConfigurationData
} from './types';

// 型定義
export type {
  ConfigurationManagerConfig,
  ConfigurationValidationConfig,
  ConfigurationSecurityConfig,
  ConfigurationProfileConfig,
  ConfigurationProfile,
  ConfigurationSchema,
  ConfigurationValidation,
  ConfigurationHistory,
  ConfigurationTemplate,
  ConfigurationContext,
  ConfigurationMetrics,
  ConfigurationStatistics,
  ConfigurationReport,
  SchemaProperty,
  SchemaDependency,
  BusinessRule,
  ValidationRule,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationRecommendation,
  ProfileMetadata,
  TemplateParameter,
  ConfigurationStructure,
  UsageMetrics,
  PerformanceMetrics,
  ValidationMetrics,
  SecurityMetrics,
  ProfileMetrics,
  TemplateMetrics,
  ConfigurationType,
  ConfigurationScope,
  ConfigurationSource,
  ValidationLevel,
  ValidationType,
  ValidationSeverity,
  ValidationErrorType,
  ValidationWarningType,
  HistoryOperation,
  TemplateCategory,
  ProfileCategory,
  ProfileComplexity,
  ParameterType,
  AccessControlModel,
  SecurityLevel,
  PerformanceImpact,
  RuleSeverity,
  RuleCategory,
  ValidatorType,
  RecommendationType,
  RecommendationPriority,
  PropertyConstraint,
  PropertyValidation,
  PropertyMetadata,
  DependencyCondition,
  DependencyAction,
  ValidationParameter,
  ValueMetadata,
  HistoryMetadata,
  SchemaMetadata,
  TemplateMetadata,
  TemplateConstraint,
  TemplateDocumentation,
  TimePeriod
} from './types';

// デフォルトコンフィグ
export const DEFAULT_CONFIGURATION_CONFIG: Partial<ConfigurationManagerConfig> = {
  enableDynamicConfiguration: true,
  enableConfigurationValidation: true,
  enableConfigurationHistory: true,
  enableConfigurationBackup: true,
  enableSecurityFeatures: true,
  defaultValidationLevel: ValidationLevel.STANDARD,
  configurationTimeout: 5000,
  backupRetentionDays: 30,
  historyRetentionDays: 90,
  encryptSensitiveData: true,
  realTimeValidation: false,
  cacheConfiguration: true,
  batchUpdates: false,
  enableNotifications: true
};

export const DEFAULT_VALIDATION_CONFIG: Partial<ConfigurationValidationConfig> = {
  validationLevel: ValidationLevel.STANDARD,
  enableSchemaValidation: true,
  enableTypeValidation: true,
  enableRangeValidation: true,
  enableBusinessRuleValidation: true,
  enableCrossDependencyValidation: true,
  strictMode: false,
  warningsAsErrors: false,
  validationTimeout: 3000
};

export const DEFAULT_SECURITY_CONFIG: Partial<ConfigurationSecurityConfig> = {
  enableAccessControl: true,
  enableEncryption: true,
  enableAuditLogging: true,
  enableAnomalyDetection: false,
  encryptionAlgorithm: 'AES-256',
  accessControlModel: AccessControlModel.RBAC,
  auditRetentionDays: 365,
  securityScanInterval: 86400000
};

export const DEFAULT_PROFILE_CONFIG: Partial<ConfigurationProfileConfig> = {
  enableProfileManagement: true,
  enableProfileComparison: true,
  enableProfileOptimization: true,
  enableProfileTemplates: true,
  maxProfilesPerUser: 10,
  profileCacheSize: 100,
  defaultProfileScope: ConfigurationScope.APPLICATION
};

// ファクトリー関数
export function createConfigurationManager(
  config?: Partial<ConfigurationManagerConfig>,
  validationConfig?: Partial<ConfigurationValidationConfig>,
  securityConfig?: Partial<ConfigurationSecurityConfig>,
  profileConfig?: Partial<ConfigurationProfileConfig>
): ConfigurationManager {
  return new ConfigurationManager(
    { ...DEFAULT_CONFIGURATION_CONFIG, ...config },
    { ...DEFAULT_VALIDATION_CONFIG, ...validationConfig },
    { ...DEFAULT_SECURITY_CONFIG, ...securityConfig },
    { ...DEFAULT_PROFILE_CONFIG, ...profileConfig }
  );
}

// ユーティリティ関数

/**
 * 設定値を作成
 */
export function createConfigurationValue(
  value: any,
  type: ConfigurationType,
  options?: Partial<ConfigurationValue>
): ConfigurationValue {
  return {
    value,
    type,
    encrypted: false,
    sensitive: false,
    source: ConfigurationSource.API,
    metadata: {} as any,
    lastModified: new Date(),
    modifiedBy: 'system',
    ...options
  };
}

/**
 * 設定プロファイルを作成
 */
export function createConfigurationProfile(
  name: string,
  description: string,
  scope: ConfigurationScope,
  configurations: ConfigurationData,
  options?: Partial<ConfigurationProfile>
): ConfigurationProfile {
  return {
    profileId: `profile-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    name,
    description,
    scope,
    configurations,
    metadata: {} as any,
    isActive: false,
    version: '1.0.0',
    tags: [],
    owner: 'system',
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...options
  };
}

/**
 * 設定テンプレートを作成
 */
export function createConfigurationTemplate(
  name: string,
  description: string,
  category: TemplateCategory,
  options?: Partial<ConfigurationTemplate>
): ConfigurationTemplate {
  return {
    templateId: `template-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    name,
    description,
    version: '1.0.0',
    category,
    parameters: [],
    configurationStructure: {} as any,
    defaultValues: {},
    constraints: [],
    documentation: {} as any,
    metadata: {} as any,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...options
  };
}

/**
 * 設定コンテキストを作成
 */
export function createConfigurationContext(
  environment: string,
  application: string,
  version: string,
  options?: Partial<ConfigurationContext>
): ConfigurationContext {
  return {
    environment,
    application,
    version,
    deployment: 'default',
    customProperties: {},
    ...options
  };
}

/**
 * 設定更新を作成
 */
export function createConfigurationUpdate(
  key: string,
  value: ConfigurationValue,
  options?: Partial<ConfigurationUpdate>
): ConfigurationUpdate {
  return {
    key,
    value,
    scope: ConfigurationScope.APPLICATION,
    reason: 'Manual update',
    requester: 'system',
    ...options
  };
}

// 定数とヘルパー
export const CONFIGURATION_EVENTS = {
  VALUE_CHANGED: 'value_changed' as const,
  PROFILE_ACTIVATED: 'profile_activated' as const,
  PROFILE_DEACTIVATED: 'profile_deactivated' as const,
  TEMPLATE_APPLIED: 'template_applied' as const,
  VALIDATION_FAILED: 'validation_failed' as const,
  BACKUP_CREATED: 'backup_created' as const,
  BACKUP_RESTORED: 'backup_restored' as const,
  CONFIG_ROLLBACK: 'config_rollback' as const,
  SECURITY_VIOLATION: 'security_violation' as const,
  HEALTH_CHECK_FAILED: 'health_check_failed' as const
};

export const VALIDATION_THRESHOLDS = {
  ERROR_THRESHOLD: 0.1,
  WARNING_THRESHOLD: 0.3,
  INFO_THRESHOLD: 0.5
} as const;

export const PERFORMANCE_THRESHOLDS = {
  RESPONSE_TIME_MS: 1000,
  THROUGHPUT_RPS: 100,
  ERROR_RATE: 0.05,
  CACHE_HIT_RATE: 0.8
} as const;

export const SECURITY_LEVELS = {
  PUBLIC: 0,
  INTERNAL: 1,
  CONFIDENTIAL: 2,
  RESTRICTED: 3,
  TOP_SECRET: 4
} as const;

export const BACKUP_INTERVALS = {
  HOURLY: 3600000,
  DAILY: 86400000,
  WEEKLY: 604800000,
  MONTHLY: 2592000000
} as const;

export const HISTORY_RETENTION = {
  SHORT: 7,    // 7 days
  MEDIUM: 30,  // 30 days
  LONG: 90,    // 90 days
  EXTENDED: 365 // 1 year
} as const;

// システム情報
export const CONFIGURATION_SYSTEM_INFO = {
  name: 'Configuration Management System',
  version: '2.0.0',
  description: '設定管理・動的設定・バリデーション・プロファイル管理を提供する設定管理システム',
  features: [
    '動的設定管理（Dynamic Configuration）',
    '設定バリデーション（Configuration Validation）',
    'プロファイル管理（Profile Management）',
    'テンプレート管理（Template Management）',
    '設定履歴（Configuration History）',
    'バックアップ・復元（Backup & Restore）',
    'ロールバック機能（Rollback）',
    'セキュリティ機能（Security Features）',
    'アクセス制御（Access Control）',
    'リアルタイム通知（Real-time Notifications）',
    '設定監視（Configuration Monitoring）',
    'パフォーマンス追跡（Performance Tracking）',
    '統計・報告（Statistics & Reporting）',
    '整合性チェック（Integrity Check）',
    'スキーマ検証（Schema Validation）'
  ],
  capabilities: [
    'エンタープライズ級設定管理',
    'マルチスコープ設定サポート',
    'インテリジェント検証システム',
    'プロファイルベース管理',
    'テンプレート駆動設定',
    'セキュアな設定保護',
    'リアルタイム設定更新',
    '設定変更追跡',
    'バックアップ・災害復旧',
    'パフォーマンス最適化'
  ],
  dependencies: [
    'core/infrastructure/logger',
    'types/common'
  ]
} as const;

// 設定タイプ定数
export const BASIC_TYPES = [
  ConfigurationType.STRING,
  ConfigurationType.NUMBER,
  ConfigurationType.BOOLEAN,
  ConfigurationType.ARRAY,
  ConfigurationType.OBJECT
];

export const SPECIAL_TYPES = [
  ConfigurationType.DATE,
  ConfigurationType.URL,
  ConfigurationType.EMAIL,
  ConfigurationType.JSON,
  ConfigurationType.ENCRYPTED,
  ConfigurationType.REFERENCE,
  ConfigurationType.EXPRESSION
];

export const SCOPE_HIERARCHY = [
  ConfigurationScope.GLOBAL,
  ConfigurationScope.APPLICATION,
  ConfigurationScope.ENVIRONMENT,
  ConfigurationScope.DEPLOYMENT,
  ConfigurationScope.TENANT,
  ConfigurationScope.USER,
  ConfigurationScope.SESSION
];

// ヘルパー関数
export function getConfigurationTypeCategory(type: ConfigurationType): string {
  if (BASIC_TYPES.includes(type)) return 'Basic';
  if (SPECIAL_TYPES.includes(type)) return 'Special';
  return 'Custom';
}

export function getScopeHierarchyLevel(scope: ConfigurationScope): number {
  return SCOPE_HIERARCHY.indexOf(scope);
}

export function isMoreSpecificScope(scope1: ConfigurationScope, scope2: ConfigurationScope): boolean {
  return getScopeHierarchyLevel(scope1) > getScopeHierarchyLevel(scope2);
}

export function determineValidationSeverity(level: ValidationLevel): string {
  switch (level) {
    case ValidationLevel.COMPREHENSIVE:
      return 'Very Strict';
    case ValidationLevel.STRICT:
      return 'Strict';
    case ValidationLevel.STANDARD:
      return 'Standard';
    case ValidationLevel.BASIC:
      return 'Basic';
    case ValidationLevel.NONE:
      return 'None';
    default:
      return 'Unknown';
  }
}

export function assessSecurityLevel(level: SecurityLevel): string {
  switch (level) {
    case SecurityLevel.TOP_SECRET:
      return 'Top Secret';
    case SecurityLevel.RESTRICTED:
      return 'Restricted';
    case SecurityLevel.CONFIDENTIAL:
      return 'Confidential';
    case SecurityLevel.INTERNAL:
      return 'Internal';
    case SecurityLevel.PUBLIC:
      return 'Public';
    default:
      return 'Unknown';
  }
}

export function getPerformanceImpactDescription(impact: PerformanceImpact): string {
  switch (impact) {
    case PerformanceImpact.CRITICAL:
      return 'Critical Impact';
    case PerformanceImpact.HIGH:
      return 'High Impact';
    case PerformanceImpact.MODERATE:
      return 'Moderate Impact';
    case PerformanceImpact.LOW:
      return 'Low Impact';
    case PerformanceImpact.MINIMAL:
      return 'Minimal Impact';
    default:
      return 'Unknown Impact';
  }
}

export function calculateRetentionDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export function isConfigurationExpired(lastModified: Date, retentionDays: number): boolean {
  const expirationDate = new Date(lastModified);
  expirationDate.setDate(expirationDate.getDate() + retentionDays);
  return new Date() > expirationDate;
}