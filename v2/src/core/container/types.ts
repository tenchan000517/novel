/**
 * Service Container Types
 * 
 * サービスコンテナの型定義
 * Version 2.0要件: 依存性注入・ライフサイクル管理・ヘルス監視の型定義
 */

import type { SystemId } from '@/types/common';
import type {
  ServiceLifecycle,
  LifecycleState,
  HealthState,
  ContainerEvent,
  ServiceErrorType,
  ErrorSeverity
} from './interfaces';

// ============================================================================
// コンテナ設定
// ============================================================================

// 修正: 不足しているプロパティを追加
export interface ServiceContainerConfig {
  enableHealthMonitoring: boolean;
  enableDependencyValidation: boolean;
  enableLifecycleManagement: boolean;
  enableErrorRecovery: boolean;
  maxResolutionDepth: number;
  defaultResolutionTimeout: number;
  healthCheckInterval: number;
  errorRetentionPeriod: number;
  performanceMonitoring: boolean;
  debugMode: boolean;
  logLevel: LogLevel;
  // ApplicationLifecycleManager用の追加プロパティ
  initializationTimeout?: number;
  enableMetrics?: boolean;
  enableHealthChecks?: boolean;
}

export interface DependencyResolverConfig {
  allowCircularDependencies: boolean;
  maxCircularDepth: number;
  strictValidation: boolean;
  autoResolutionEnabled: boolean;
  cacheResolutions: boolean;
  parallelResolution: boolean;
  resolutionTimeout: number;
}

export interface LifecycleManagerConfig {
  initializationTimeout: number;
  shutdownTimeout: number;
  gracefulShutdown: boolean;
  autoRecovery: boolean;
  retryAttempts: number;
  retryDelay: number;
  trackLifecycleHistory: boolean;
}

export interface HealthMonitorConfig {
  enabled: boolean;
  checkInterval: number;
  timeout: number;
  retries: number;
  alertThresholds: HealthThresholds;
  enablePredictiveMonitoring: boolean;
  historyRetention: number;
  realTimeNotifications: boolean;
}

export interface ErrorHandlerConfig {
  enableAutoRecovery: boolean;
  maxRetryAttempts: number;
  retryBackoffMultiplier: number;
  errorAggregation: boolean;
  alertingEnabled: boolean;
  logStackTraces: boolean;
  errorReporting: ErrorReportingConfig;
}

// ============================================================================
// パフォーマンス・メトリクス
// ============================================================================

export interface PerformanceMetrics {
  containerMetrics: ContainerPerformanceMetrics;
  serviceMetrics: Map<string, ServicePerformanceMetrics>;
  dependencyMetrics: DependencyPerformanceMetrics;
  healthMetrics: HealthPerformanceMetrics;
  errorMetrics: ErrorPerformanceMetrics;
  lastUpdated: Date;
}

export interface ContainerPerformanceMetrics {
  totalResolutions: number;
  successfulResolutions: number;
  failedResolutions: number;
  averageResolutionTime: number;
  peakResolutionTime: number;
  resolutionThroughput: number;
  memoryUsage: MemoryMetrics;
  cacheHitRate: number;
  concurrentResolutions: number;
}

export interface ServicePerformanceMetrics {
  token: string;
  creationTime: number;
  initializationTime: number;
  lastAccessTime: Date;
  accessCount: number;
  errorCount: number;
  averageResponseTime: number;
  peakResponseTime: number;
  memoryFootprint: number;
  cpuUsage: number;
  healthScore: number;
}

export interface DependencyPerformanceMetrics {
  totalDependencies: number;
  resolvedDependencies: number;
  circularDependencies: number;
  missingDependencies: number;
  resolutionDepth: number;
  graphComplexity: number;
  cacheEfficiency: number;
}

export interface HealthPerformanceMetrics {
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageCheckTime: number;
  healthTrends: HealthTrend[];
  alertsGenerated: number;
  falsePositives: number;
}

export interface ErrorPerformanceMetrics {
  totalErrors: number;
  errorsByType: Map<ServiceErrorType, number>;
  errorsByService: Map<string, number>;
  averageErrorResolution: number;
  errorRecoveryRate: number;
  criticalErrors: number;
}

// ============================================================================
// キャッシュ・最適化
// ============================================================================

export interface ResolutionCache {
  enabled: boolean;
  maxSize: number;
  ttl: number;
  hitCount: number;
  missCount: number;
  entries: Map<string, CacheEntry>;
  statistics: CacheStatistics;
}

export interface CacheEntry {
  key: string;
  value: any;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  size: number;
  ttl: number;
}

export interface CacheStatistics {
  hitRate: number;
  missRate: number;
  evictionCount: number;
  totalSize: number;
  averageAccessTime: number;
  hotKeys: string[];
}

// ============================================================================
// 監視・アラート
// ============================================================================

export interface MonitoringConfig {
  enabled: boolean;
  realTimeMonitoring: boolean;
  metricCollection: boolean;
  alerting: AlertingConfig;
  reporting: ReportingConfig;
  dashboardEnabled: boolean;
}

export interface AlertingConfig {
  enabled: boolean;
  channels: AlertChannel[];
  rules: AlertRule[];
  suppressionRules: SuppressionRule[];
  escalationPolicies: EscalationPolicy[];
}

export interface AlertRule {
  id: string;
  name: string;
  condition: AlertCondition;
  severity: AlertSeverity;
  threshold: number;
  duration: number;
  enabled: boolean;
  actions: AlertAction[];
}

export interface AlertCondition {
  metric: string;
  operator: ComparisonOperator;
  value: number;
  aggregation?: AggregationType;
  timeWindow?: number;
}

export interface ReportingConfig {
  enabled: boolean;
  interval: number;
  format: ReportFormat;
  destinations: ReportDestination[];
  includeMetrics: boolean;
  includeHealth: boolean;
  includeErrors: boolean;
}

// ============================================================================
// セキュリティ・認証
// ============================================================================

export interface SecurityConfig {
  authenticationEnabled: boolean;
  authorizationEnabled: boolean;
  encryptionEnabled: boolean;
  auditLogging: boolean;
  accessControl: AccessControlConfig;
  tokenValidation: TokenValidationConfig;
}

export interface AccessControlConfig {
  enabled: boolean;
  defaultPolicy: AccessPolicy;
  servicePermissions: Map<string, ServicePermission[]>;
  roleBasedAccess: boolean;
  ipWhitelist: string[];
}

export interface TokenValidationConfig {
  enabled: boolean;
  algorithm: string;
  secretKey: string;
  tokenExpiry: number;
  refreshTokenEnabled: boolean;
  blacklistEnabled: boolean;
}

// ============================================================================
// 設定・環境
// ============================================================================

export interface EnvironmentConfig {
  environment: Environment;
  configSources: ConfigSource[];
  secretsManagement: SecretsConfig;
  featureFlags: FeatureFlag[];
  regionConfig: RegionConfig;
}

export interface ConfigSource {
  type: ConfigSourceType;
  location: string;
  priority: number;
  watchForChanges: boolean;
  encryptionEnabled: boolean;
}

export interface SecretsConfig {
  provider: SecretsProvider;
  rotationEnabled: boolean;
  rotationInterval: number;
  encryptionAlgorithm: string;
  backupEnabled: boolean;
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  conditions: FeatureFlagCondition[];
  rolloutPercentage: number;
  expiresAt?: Date;
}

// ============================================================================
// 診断・トラブルシューティング
// ============================================================================

export interface DiagnosticInfo {
  timestamp: Date;
  systemInfo: SystemInfo;
  containerStatus: ContainerStatus;
  serviceStatuses: Map<string, ServiceDiagnosticInfo>;
  dependencyGraph: ServiceDependencyDiagnostic;
  performanceSnapshot: PerformanceSnapshot;
  healthSnapshot: HealthSnapshot;
  errorSummary: ErrorSummary;
}

export interface ServiceDiagnosticInfo {
  token: string;
  status: ServiceStatus;
  lifecycle: LifecycleState;
  health: HealthState;
  dependencies: DependencyDiagnostic[];
  performance: ServicePerformanceSnapshot;
  errors: ServiceErrorSummary;
  configuration: ServiceConfigSnapshot;
}

export interface DependencyDiagnostic {
  token: string;
  status: DependencyStatus;
  resolutionTime: number;
  circularReference: boolean;
  issues: DependencyIssueInfo[];
}

export interface TroubleshootingGuide {
  scenarios: TroubleshootingScenario[];
  commonIssues: CommonIssue[];
  resolutionSteps: ResolutionStep[];
  preventiveMeasures: PreventiveMeasure[];
}

// ============================================================================
// 列挙型・定数（修正: exportを追加）
// ============================================================================

export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export enum Environment {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

export enum ConfigSourceType {
  FILE = 'file',
  ENVIRONMENT = 'environment',
  DATABASE = 'database',
  REMOTE = 'remote',
  MEMORY = 'memory'
}

export enum SecretsProvider {
  LOCAL = 'local',
  VAULT = 'vault',
  AWS_SECRETS = 'aws_secrets',
  AZURE_KEYVAULT = 'azure_keyvault',
  GCP_SECRET = 'gcp_secret'
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum ComparisonOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_EQUAL = 'greater_equal',
  LESS_EQUAL = 'less_equal',
  CONTAINS = 'contains',
  MATCHES = 'matches'
}

export enum AggregationType {
  SUM = 'sum',
  AVERAGE = 'average',
  MINIMUM = 'minimum',
  MAXIMUM = 'maximum',
  COUNT = 'count',
  PERCENTILE = 'percentile'
}

export enum ReportFormat {
  JSON = 'json',
  XML = 'xml',
  CSV = 'csv',
  HTML = 'html',
  PDF = 'pdf'
}

export enum AccessPolicy {
  ALLOW = 'allow',
  DENY = 'deny',
  INHERIT = 'inherit'
}

export enum ServiceStatus {
  UNKNOWN = 'unknown',
  REGISTERED = 'registered',
  INITIALIZING = 'initializing',
  RUNNING = 'running',
  DEGRADED = 'degraded',
  STOPPED = 'stopped',
  ERROR = 'error'
}

export enum DependencyStatus {
  RESOLVED = 'resolved',
  PENDING = 'pending',
  MISSING = 'missing',
  CIRCULAR = 'circular',
  ERROR = 'error'
}

// ============================================================================
// 型エイリアス（詳細実装用）
// ============================================================================

export type HealthThresholds = Record<string, number>;
export type ErrorReportingConfig = any;
export type MemoryMetrics = any;
export type HealthTrend = any;
export type AlertChannel = any;
export type SuppressionRule = any;
export type EscalationPolicy = any;
export type AlertAction = any;
export type ReportDestination = any;
export type ServicePermission = any;
export type RegionConfig = any;
export type FeatureFlagCondition = any;
export type SystemInfo = any;
export type ContainerStatus = any;
export type ServiceDependencyDiagnostic = any;
export type PerformanceSnapshot = any;
export type HealthSnapshot = any;
export type ErrorSummary = any;
export type ServicePerformanceSnapshot = any;
export type ServiceErrorSummary = any;
export type ServiceConfigSnapshot = any;
export type DependencyIssueInfo = any;
export type TroubleshootingScenario = any;
export type CommonIssue = any;
export type ResolutionStep = any;
export type PreventiveMeasure = any;