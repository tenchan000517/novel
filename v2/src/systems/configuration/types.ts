/**
 * Configuration Management System Types
 * 
 * 設定管理システムの型定義
 * Version 2.0要件: 設定管理・動的設定・バリデーション・プロファイル管理の型定義
 */

import type { SystemId } from '@/types/common';

// ============================================================================
// システム設定・設定
// ============================================================================

export interface ConfigurationManagerConfig {
  enableDynamicConfiguration: boolean;
  enableConfigurationValidation: boolean;
  enableConfigurationHistory: boolean;
  enableConfigurationBackup: boolean;
  enableSecurityFeatures: boolean;
  defaultValidationLevel: ValidationLevel;
  configurationTimeout: number;
  backupRetentionDays: number;
  historyRetentionDays: number;
  encryptSensitiveData: boolean;
  realTimeValidation: boolean;
  cacheConfiguration: boolean;
  batchUpdates: boolean;
  enableNotifications: boolean;
}

export interface ConfigurationValidationConfig {
  validationLevel: ValidationLevel;
  enableSchemaValidation: boolean;
  enableTypeValidation: boolean;
  enableRangeValidation: boolean;
  enableBusinessRuleValidation: boolean;
  enableCrossDependencyValidation: boolean;
  strictMode: boolean;
  warningsAsErrors: boolean;
  validationTimeout: number;
}

export interface ConfigurationSecurityConfig {
  enableAccessControl: boolean;
  enableEncryption: boolean;
  enableAuditLogging: boolean;
  enableAnomalyDetection: boolean;
  encryptionAlgorithm: string;
  accessControlModel: AccessControlModel;
  auditRetentionDays: number;
  securityScanInterval: number;
}

export interface ConfigurationProfileConfig {
  enableProfileManagement: boolean;
  enableProfileComparison: boolean;
  enableProfileOptimization: boolean;
  enableProfileTemplates: boolean;
  maxProfilesPerUser: number;
  profileCacheSize: number;
  defaultProfileScope: ConfigurationScope;
}

// ============================================================================
// 設定基本型
// ============================================================================

export interface ConfigurationProfile {
  profileId: string;
  name: string;
  description: string;
  scope: ConfigurationScope;
  configurations: ConfigurationData;
  metadata: ProfileMetadata;
  isActive: boolean;
  version: string;
  tags: string[];
  owner: string;
  permissions: ProfilePermission[];
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
}

export interface ConfigurationSchema {
  schemaId: string;
  name: string;
  version: string;
  description: string;
  properties: SchemaProperty[];
  required: string[];
  dependencies: SchemaDependency[];
  businessRules: BusinessRule[];
  validationRules: ValidationRule[];
  metadata: SchemaMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfigurationValidation {
  isValid: boolean;
  validationLevel: ValidationLevel;
  validationResults: ValidationResult[];
  errors: ValidationError[];
  warnings: ValidationWarning[];
  recommendations: ValidationRecommendation[];
  validatedAt: Date;
  validationDuration: number;
}

export interface ConfigurationHistory {
  historyId: string;
  key: string;
  operation: HistoryOperation;
  oldValue?: ConfigurationValue;
  newValue?: ConfigurationValue;
  scope: ConfigurationScope;
  user: string;
  reason?: string;
  metadata: HistoryMetadata;
  timestamp: Date;
}

export interface ConfigurationTemplate {
  templateId: string;
  name: string;
  description: string;
  version: string;
  category: TemplateCategory;
  parameters: TemplateParameter[];
  configurationStructure: ConfigurationStructure;
  defaultValues: ConfigurationData;
  constraints: TemplateConstraint[];
  documentation: TemplateDocumentation;
  metadata: TemplateMetadata;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfigurationContext {
  environment: string;
  application: string;
  version: string;
  deployment: string;
  tenant?: string;
  user?: string;
  locale?: string;
  timezone?: string;
  customProperties: { [key: string]: string };
}

export interface ConfigurationMetrics {
  usageMetrics: UsageMetrics;
  performanceMetrics: PerformanceMetrics;
  validationMetrics: ValidationMetrics;
  securityMetrics: SecurityMetrics;
  profileMetrics: ProfileMetrics;
  templateMetrics: TemplateMetrics;
}

export interface ConfigurationStatistics {
  totalConfigurations: number;
  configurationsByScope: Map<ConfigurationScope, number>;
  configurationsByType: Map<ConfigurationType, number>;
  activeProfiles: number;
  validationStatistics: ValidationStatistics;
  changeStatistics: ChangeStatistics;
  securityStatistics: SecurityStatistics;
  systemPerformance: SystemPerformanceStatistics;
}

export interface ConfigurationReport {
  reportId: string;
  generatedAt: Date;
  reportPeriod: ReportPeriod;
  executiveSummary: ExecutiveSummary;
  configurationAnalysis: ConfigurationAnalysis;
  validationSummary: ValidationSummary;
  securityAssessment: SecurityAssessment;
  recommendations: ReportRecommendation[];
  actionItems: ActionItem[];
  trends: ConfigurationTrend[];
}

// ============================================================================
// 設定分類・特徴型
// ============================================================================

export interface SchemaProperty {
  name: string;
  type: ConfigurationType;
  description: string;
  required: boolean;
  defaultValue?: any;
  constraints: PropertyConstraint[];
  validation: PropertyValidation;
  metadata: PropertyMetadata;
}

export interface SchemaDependency {
  dependentProperty: string;
  dependsOn: string[];
  condition: DependencyCondition;
  action: DependencyAction;
}

export interface BusinessRule {
  ruleId: string;
  name: string;
  description: string;
  condition: string;
  action: string;
  severity: RuleSeverity;
  category: RuleCategory;
  enabled: boolean;
}

export interface ValidationRule {
  ruleId: string;
  property: string;
  validator: ValidatorType;
  parameters: ValidationParameter[];
  errorMessage: string;
  warningMessage?: string;
  enabled: boolean;
}

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

// ============================================================================
// 分析結果型
// ============================================================================

export interface ValidationResult {
  property: string;
  isValid: boolean;
  validationType: ValidationType;
  severity: ValidationSeverity;
  message: string;
  details?: any;
  suggestions: string[];
}

export interface ValidationError {
  errorId: string;
  property: string;
  errorType: ValidationErrorType;
  message: string;
  details: any;
  remediation: string[];
}

export interface ValidationWarning {
  warningId: string;
  property: string;
  warningType: ValidationWarningType;
  message: string;
  impact: WarningImpact;
  recommendations: string[];
}

export interface ValidationRecommendation {
  recommendationId: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  implementation: ImplementationGuide;
  benefits: string[];
  risks: string[];
}

export interface ProfileMetadata {
  category: ProfileCategory;
  complexity: ProfileComplexity;
  size: number;
  dependencies: string[];
  compatibleVersions: string[];
  performanceImpact: PerformanceImpact;
  securityLevel: SecurityLevel;
}

export interface TemplateParameter {
  name: string;
  type: ParameterType;
  description: string;
  required: boolean;
  defaultValue?: any;
  constraints: ParameterConstraint[];
  validation: ParameterValidation;
  group?: string;
}

export interface ConfigurationStructure {
  sections: StructureSection[];
  hierarchy: StructureHierarchy;
  relationships: StructureRelationship[];
  constraints: StructureConstraint[];
}

// ============================================================================
// メトリクス・統計型
// ============================================================================

export interface UsageMetrics {
  totalAccesses: number;
  accessesByKey: Map<string, number>;
  accessesByUser: Map<string, number>;
  accessesByScope: Map<ConfigurationScope, number>;
  peakUsageTimes: TimeUsage[];
  popularConfigurations: PopularConfiguration[];
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  responseTimesByOperation: Map<string, number>;
  throughput: number;
  cacheHitRate: number;
  errorRate: number;
  systemLoad: SystemLoad;
}

export interface ValidationMetrics {
  totalValidations: number;
  validationsByLevel: Map<ValidationLevel, number>;
  validationSuccessRate: number;
  validationErrors: Map<ValidationErrorType, number>;
  validationWarnings: Map<ValidationWarningType, number>;
  averageValidationTime: number;
}

export interface SecurityMetrics {
  accessAttempts: number;
  successfulAccesses: number;
  failedAccesses: number;
  securityViolations: SecurityViolation[];
  encryptedConfigurations: number;
  auditEvents: number;
}

export interface ProfileMetrics {
  totalProfiles: number;
  activeProfiles: number;
  profilesByCategory: Map<ProfileCategory, number>;
  profileUsage: ProfileUsage[];
  profileOptimizations: number;
}

export interface TemplateMetrics {
  totalTemplates: number;
  templatesByCategory: Map<TemplateCategory, number>;
  templateUsage: TemplateUsage[];
  templateInstantiations: number;
  templateOptimizations: number;
}

// ============================================================================
// 列挙型
// ============================================================================

export enum ConfigurationType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
  DATE = 'date',
  URL = 'url',
  EMAIL = 'email',
  JSON = 'json',
  ENCRYPTED = 'encrypted',
  REFERENCE = 'reference',
  EXPRESSION = 'expression'
}

export enum ConfigurationScope {
  GLOBAL = 'global',
  APPLICATION = 'application',
  ENVIRONMENT = 'environment',
  USER = 'user',
  SESSION = 'session',
  TENANT = 'tenant',
  DEPLOYMENT = 'deployment',
  FEATURE = 'feature',
  CUSTOM = 'custom'
}

export enum ConfigurationSource {
  FILE = 'file',
  DATABASE = 'database',
  ENVIRONMENT = 'environment',
  COMMAND_LINE = 'command_line',
  API = 'api',
  USER_INPUT = 'user_input',
  DEFAULT = 'default',
  TEMPLATE = 'template',
  EXTERNAL_SERVICE = 'external_service'
}

export enum ValidationLevel {
  NONE = 'none',
  BASIC = 'basic',
  STANDARD = 'standard',
  STRICT = 'strict',
  COMPREHENSIVE = 'comprehensive'
}

export enum ValidationType {
  TYPE_VALIDATION = 'type_validation',
  RANGE_VALIDATION = 'range_validation',
  FORMAT_VALIDATION = 'format_validation',
  SCHEMA_VALIDATION = 'schema_validation',
  BUSINESS_RULE_VALIDATION = 'business_rule_validation',
  DEPENDENCY_VALIDATION = 'dependency_validation'
}

export enum ValidationSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum ValidationErrorType {
  TYPE_MISMATCH = 'type_mismatch',
  RANGE_VIOLATION = 'range_violation',
  FORMAT_ERROR = 'format_error',
  REQUIRED_MISSING = 'required_missing',
  DEPENDENCY_VIOLATION = 'dependency_violation',
  BUSINESS_RULE_VIOLATION = 'business_rule_violation',
  SCHEMA_VIOLATION = 'schema_violation'
}

export enum ValidationWarningType {
  DEPRECATED_CONFIGURATION = 'deprecated_configuration',
  PERFORMANCE_IMPACT = 'performance_impact',
  SECURITY_CONCERN = 'security_concern',
  COMPATIBILITY_ISSUE = 'compatibility_issue',
  OPTIMIZATION_OPPORTUNITY = 'optimization_opportunity'
}

export enum HistoryOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  BACKUP = 'backup',
  RESTORE = 'restore',
  ROLLBACK = 'rollback',
  MERGE = 'merge',
  SPLIT = 'split'
}

export enum TemplateCategory {
  SYSTEM = 'system',
  APPLICATION = 'application',
  ENVIRONMENT = 'environment',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  FEATURE = 'feature',
  INTEGRATION = 'integration',
  CUSTOM = 'custom'
}

export enum ProfileCategory {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  STAGING = 'staging',
  PRODUCTION = 'production',
  DEBUGGING = 'debugging',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  CUSTOM = 'custom'
}

export enum ProfileComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  ADVANCED = 'advanced'
}

export enum ParameterType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  JSON = 'json',
  FILE_PATH = 'file_path',
  URL = 'url',
  EXPRESSION = 'expression'
}

export enum AccessControlModel {
  RBAC = 'rbac',
  ABAC = 'abac',
  MAC = 'mac',
  DAC = 'dac',
  CUSTOM = 'custom'
}

export enum SecurityLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  TOP_SECRET = 'top_secret'
}

export enum PerformanceImpact {
  MINIMAL = 'minimal',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum RuleSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum RuleCategory {
  BUSINESS = 'business',
  TECHNICAL = 'technical',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  COMPLIANCE = 'compliance'
}

export enum ValidatorType {
  REGEX = 'regex',
  RANGE = 'range',
  LENGTH = 'length',
  CUSTOM = 'custom',
  EXPRESSION = 'expression'
}

export enum RecommendationType {
  OPTIMIZATION = 'optimization',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  BEST_PRACTICE = 'best_practice',
  COMPATIBILITY = 'compatibility'
}

export enum RecommendationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// ============================================================================
// 支援型定義（詳細実装用）
// ============================================================================

export interface PropertyConstraint {
  type: ConstraintType;
  value: any;
  message: string;
}

export interface PropertyValidation {
  validators: string[];
  customValidation?: string;
  asyncValidation?: boolean;
}

export interface PropertyMetadata {
  category: string;
  tags: string[];
  documentation: string;
  examples: any[];
  deprecated: boolean;
}

export interface DependencyCondition {
  expression: string;
  values: any[];
}

export interface DependencyAction {
  type: string;
  parameters: any;
}

export interface ValidationParameter {
  name: string;
  value: any;
}

export interface ValueMetadata {
  description?: string;
  category?: string;
  tags?: string[];
  documentation?: string;
  version?: string;
}

export interface HistoryMetadata {
  source: string;
  changeReason: string;
  approver?: string;
  rollbackPoint: boolean;
}

export interface SchemaMetadata {
  author: string;
  category: string;
  tags: string[];
  documentation: string;
  compatibility: string[];
}

export interface TemplateMetadata {
  author: string;
  category: TemplateCategory;
  tags: string[];
  difficulty: string;
  popularity: number;
  rating: number;
}

export interface TemplateConstraint {
  type: string;
  condition: string;
  message: string;
}

export interface TemplateDocumentation {
  description: string;
  usage: string;
  examples: TemplateExample[];
  troubleshooting: TroubleshootingGuide[];
}

// 型エイリアス（詳細実装用）
export type TimePeriod = any;
export type ProfilePermission = any;
export type ConstraintType = string;
export type WarningImpact = string;
export type ImplementationGuide = any;
export type ValidationStatistics = any;
export type ChangeStatistics = any;
export type SecurityStatistics = any;
export type SystemPerformanceStatistics = any;
export type ReportPeriod = any;
export type ExecutiveSummary = any;
export type ConfigurationAnalysis = any;
export type ValidationSummary = any;
export type SecurityAssessment = any;
export type ReportRecommendation = any;
export type ActionItem = any;
export type ConfigurationTrend = any;
export type ParameterConstraint = any;
export type ParameterValidation = any;
export type StructureSection = any;
export type StructureHierarchy = any;
export type StructureRelationship = any;
export type StructureConstraint = any;
export type TimeUsage = any;
export type PopularConfiguration = any;
export type SystemLoad = any;
export type SecurityViolation = any;
export type ProfileUsage = any;
export type TemplateUsage = any;
export type TemplateExample = any;
export type TroubleshootingGuide = any;