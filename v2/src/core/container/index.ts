/**
 * Service Container - Public Interface
 * 
 * サービスコンテナの公開インターフェース
 * Version 2.0要件: 依存性注入・ライフサイクル管理・ヘルス監視
 */

// コアコンテナ
export { ServiceContainer } from './service-container';
import { ServiceContainer } from './service-container';
import type { IServiceContainer, ServiceFactory } from './interfaces';

// インターフェース
export type {
  IServiceContainer,
  IDependencyResolver,
  ILifecycleManager,
  IHealthMonitor,
  IErrorHandler,
  ServiceFactory,
  ServiceRegistration,
  ServiceInstance,
  ServiceRegistrationOptions,
  ServiceMetadata,
  ServiceLifecycleState,
  HealthStatus,
  ServiceHealthStatus,
  EventHandler,
  DependencyValidationResult,
  ServiceInfo,
  ResolutionRecord,
  ResolvedDependencies,
  ServiceDependencyGraph,
  GraphNode,
  CircularDependency,
  DependencyIssue,
  DependencyWarning,
  ServiceError,
  ErrorStatistics,
  ContainerEventData,
  SystemMetrics,
  ServiceMetrics,
  MemoryUsage
} from './interfaces';

// 内部で使用するためのimport
import {
  ServiceLifecycle,
  LifecycleState,
  HealthState,
  ServiceErrorType,
  ErrorSeverity,
  ContainerEvent
} from './interfaces';

import { LogLevel } from './types';

// 列挙型も値として使用するためexport
export {
  ServiceLifecycle,
  LifecycleState,
  HealthState,
  ServiceErrorType,
  ErrorSeverity,
  ContainerEvent
} from './interfaces';

// 型定義
export type {
  ServiceContainerConfig,
  DependencyResolverConfig,
  LifecycleManagerConfig,
  HealthMonitorConfig,
  ErrorHandlerConfig,
  PerformanceMetrics,
  ContainerPerformanceMetrics,
  ServicePerformanceMetrics,
  DependencyPerformanceMetrics,
  HealthPerformanceMetrics,
  ErrorPerformanceMetrics,
  ResolutionCache,
  CacheEntry,
  CacheStatistics,
  MonitoringConfig,
  AlertingConfig,
  AlertRule,
  AlertCondition,
  ReportingConfig,
  SecurityConfig,
  AccessControlConfig,
  TokenValidationConfig,
  EnvironmentConfig,
  ConfigSource,
  SecretsConfig,
  FeatureFlag,
  DiagnosticInfo,
  ServiceDiagnosticInfo,
  DependencyDiagnostic,
  TroubleshootingGuide,
  HealthThresholds,
  ErrorReportingConfig,
  MemoryMetrics,
  HealthTrend,
  AlertChannel,
  SuppressionRule,
  EscalationPolicy,
  AlertAction,
  ReportDestination,
  ServicePermission,
  RegionConfig,
  FeatureFlagCondition,
  SystemInfo,
  ContainerStatus,
  ServiceDependencyDiagnostic,
  PerformanceSnapshot,
  HealthSnapshot,
  ErrorSummary,
  ServicePerformanceSnapshot,
  ServiceErrorSummary,
  ServiceConfigSnapshot,
  DependencyIssueInfo,
  TroubleshootingScenario,
  CommonIssue,
  ResolutionStep,
  PreventiveMeasure
} from './types';

// 列挙型も値として使用するためexport
export {
  LogLevel,
  Environment,
  ConfigSourceType,
  SecretsProvider,
  AlertSeverity,
  ComparisonOperator,
  AggregationType,
  ReportFormat,
  AccessPolicy,
  ServiceStatus,
  DependencyStatus
} from './types';

// 便利な型エイリアス
export type ServiceContainerInstance = import('./service-container').ServiceContainer;

export const DEFAULT_CONTAINER_CONFIG: Partial<import('./types').ServiceContainerConfig> = {
  enableHealthMonitoring: true,
  enableDependencyValidation: true,
  enableLifecycleManagement: true,
  enableErrorRecovery: true,
  maxResolutionDepth: 50,
  defaultResolutionTimeout: 30000,
  healthCheckInterval: 60000,
  errorRetentionPeriod: 86400000, // 24 hours
  performanceMonitoring: true,
  debugMode: false,
  logLevel: LogLevel.INFO
};

export const DEFAULT_DEPENDENCY_RESOLVER_CONFIG: Partial<import('./types').DependencyResolverConfig> = {
  allowCircularDependencies: false,
  maxCircularDepth: 10,
  strictValidation: true,
  autoResolutionEnabled: true,
  cacheResolutions: true,
  parallelResolution: false,
  resolutionTimeout: 30000
};

export const DEFAULT_LIFECYCLE_MANAGER_CONFIG: Partial<import('./types').LifecycleManagerConfig> = {
  initializationTimeout: 30000,
  shutdownTimeout: 30000,
  gracefulShutdown: true,
  autoRecovery: false,
  retryAttempts: 3,
  retryDelay: 1000,
  trackLifecycleHistory: true
};

export const DEFAULT_HEALTH_MONITOR_CONFIG: Partial<import('./types').HealthMonitorConfig> = {
  enabled: true,
  checkInterval: 60000,
  timeout: 5000,
  retries: 3,
  alertThresholds: {
    responseTime: 1000,
    errorRate: 0.1,
    memoryUsage: 0.8,
    cpuUsage: 0.8
  },
  enablePredictiveMonitoring: false,
  historyRetention: 7200000, // 2 hours
  realTimeNotifications: true
};

export const DEFAULT_ERROR_HANDLER_CONFIG: Partial<import('./types').ErrorHandlerConfig> = {
  enableAutoRecovery: false,
  maxRetryAttempts: 3,
  retryBackoffMultiplier: 2,
  errorAggregation: true,
  alertingEnabled: true,
  logStackTraces: true,
  errorReporting: {
    enabled: false,
    endpoint: '',
    apiKey: '',
    includeStackTrace: true,
    includeBreadcrumbs: true
  }
};

// ファクトリー関数
export function createServiceContainer(
  config?: Partial<import('./types').ServiceContainerConfig>
): ServiceContainer {
  return new ServiceContainer({
    ...DEFAULT_CONTAINER_CONFIG,
    ...config
  });
}

// ユーティリティ関数
export function createServiceFactory<T>(
  instanceCreator: (container: IServiceContainer) => T | Promise<T>
): ServiceFactory<T> {
  return instanceCreator;
}

export function createSingletonFactory<T>(
  instanceCreator: () => T | Promise<T>
): ServiceFactory<T> {
  let instance: T | null = null;
  
  return async () => {
    if (instance === null) {
      instance = await instanceCreator();
    }
    return instance;
  };
}

export function createTransientFactory<T>(
  instanceCreator: (container: IServiceContainer) => T | Promise<T>
): ServiceFactory<T> {
  return instanceCreator;
}

// システム情報
export const SERVICE_CONTAINER_INFO = {
  name: 'Service Container',
  version: '2.0.0',
  description: '依存性注入・ライフサイクル管理・ヘルス監視を提供するサービスコンテナ',
  features: [
    'サービス登録・解決',
    'ライフサイクル管理',
    '依存性注入',
    'ヘルス監視',
    'パフォーマンス追跡',
    'イベント管理',
    'エラーハンドリング',
    'デバッグ・診断機能'
  ],
  dependencies: [
    'core/infrastructure/logger',
    'types/common'
  ]
} as const;

// エクスポート用の定数（修正: enum値を使用）
export const CONTAINER_EVENTS = {
  SERVICE_REGISTERED: ContainerEvent.SERVICE_REGISTERED,
  SERVICE_UNREGISTERED: ContainerEvent.SERVICE_UNREGISTERED,
  SERVICE_RESOLVED: ContainerEvent.SERVICE_RESOLVED,
  SERVICE_DISPOSED: ContainerEvent.SERVICE_DISPOSED,
  DEPENDENCY_RESOLVED: ContainerEvent.DEPENDENCY_RESOLVED,
  HEALTH_CHECK_COMPLETED: ContainerEvent.HEALTH_CHECK_COMPLETED,
  ERROR_OCCURRED: ContainerEvent.ERROR_OCCURRED,
  LIFECYCLE_CHANGED: ContainerEvent.LIFECYCLE_CHANGED,
  CONTAINER_INITIALIZED: ContainerEvent.CONTAINER_INITIALIZED,
  CONTAINER_SHUTDOWN: ContainerEvent.CONTAINER_SHUTDOWN
};

export const LIFECYCLE_STATES = {
  NOT_CREATED: LifecycleState.NOT_CREATED,
  CREATING: LifecycleState.CREATING,
  CREATED: LifecycleState.CREATED,
  INITIALIZING: LifecycleState.INITIALIZING,
  READY: LifecycleState.READY,
  RUNNING: LifecycleState.RUNNING,
  STOPPING: LifecycleState.STOPPING,
  STOPPED: LifecycleState.STOPPED,
  DISPOSING: LifecycleState.DISPOSING,
  DISPOSED: LifecycleState.DISPOSED,
  ERROR: LifecycleState.ERROR
};

export const HEALTH_STATES = {
  HEALTHY: HealthState.HEALTHY,
  DEGRADED: HealthState.DEGRADED,
  UNHEALTHY: HealthState.UNHEALTHY,
  UNKNOWN: HealthState.UNKNOWN
};

export const SERVICE_LIFECYCLES = {
  SINGLETON: ServiceLifecycle.SINGLETON,
  TRANSIENT: ServiceLifecycle.TRANSIENT,
  SCOPED: ServiceLifecycle.SCOPED
};