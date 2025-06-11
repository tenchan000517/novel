/**
 * Service Container Interfaces
 * 
 * サービスコンテナのインターフェース定義
 * Version 2.0要件: 依存性注入・ライフサイクル管理・ヘルス監視
 */

import type { OperationResult, SystemId } from '@/types/common';

// ============================================================================
// コアインターフェース
// ============================================================================

export interface IServiceContainer {
  readonly systemId: SystemId;
  
  // サービス登録
  register<T>(token: string, factory: ServiceFactory<T>, options?: ServiceRegistrationOptions): void;
  registerSingleton<T>(token: string, factory: ServiceFactory<T>, options?: ServiceRegistrationOptions): void;
  registerTransient<T>(token: string, factory: ServiceFactory<T>, options?: ServiceRegistrationOptions): void;
  
  // サービス解決
  get<T>(token: string): Promise<T>;
  getSync<T>(token: string): T;
  tryGet<T>(token: string): Promise<T | null>;
  tryGetSync<T>(token: string): T | null;
  
  // サービス管理
  has(token: string): boolean;
  unregister(token: string): void;
  dispose(token: string): Promise<void>;
  
  // ライフサイクル管理
  initialize(): Promise<OperationResult<void>>;
  shutdown(): Promise<OperationResult<void>>;
  restart(): Promise<OperationResult<void>>;
  
  // ヘルス監視
  getHealth(): Promise<OperationResult<HealthStatus>>;
  getServiceHealth(token: string): Promise<OperationResult<ServiceHealthStatus>>;
  
  // イベント管理
  addEventListener(event: ContainerEvent, handler: EventHandler): void;
  removeEventListener(event: ContainerEvent, handler: EventHandler): void;
  
  // 依存性分析
  getDependencies(token: string): string[];
  getDependents(token: string): string[];
  validateDependencies(): OperationResult<DependencyValidationResult>;
  
  // デバッグ・診断
  getRegisteredServices(): ServiceInfo[];
  getResolutionHistory(): ResolutionRecord[];
  clearCache(): void;
}

export interface IDependencyResolver {
  resolve(services: ServiceRegistration[]): OperationResult<ResolvedDependencies>;
  validateDependencies(services: ServiceRegistration[]): OperationResult<DependencyValidationResult>;
  getInitializationOrder(services: ServiceRegistration[]): string[];
  detectCircularDependencies(services: ServiceRegistration[]): CircularDependency[];
  analyzeServiceGraph(): ServiceDependencyGraph;
}

export interface ILifecycleManager {
  readonly systemId: SystemId;
  
  initialize(services: Map<string, ServiceInstance>): Promise<OperationResult<void>>;
  shutdown(services: Map<string, ServiceInstance>): Promise<OperationResult<void>>;
  restart(services: Map<string, ServiceInstance>): Promise<OperationResult<void>>;
  
  initializeService(token: string, instance: ServiceInstance): Promise<OperationResult<void>>;
  shutdownService(token: string, instance: ServiceInstance): Promise<OperationResult<void>>;
  
  getLifecycleState(token: string): ServiceLifecycleState;
  getAllLifecycleStates(): Map<string, ServiceLifecycleState>;
}

export interface IHealthMonitor {
  readonly systemId: SystemId;
  
  checkHealth(): Promise<OperationResult<HealthStatus>>;
  checkServiceHealth(token: string): Promise<OperationResult<ServiceHealthStatus>>;
  startMonitoring(): void;
  stopMonitoring(): void;
  
  registerHealthCheck(token: string, check: HealthCheck): void;
  unregisterHealthCheck(token: string): void;
  
  getHealthHistory(): HealthRecord[];
  getServiceHealthHistory(token: string): ServiceHealthRecord[];
}

export interface IErrorHandler {
  readonly systemId: SystemId;
  
  handleRegistrationError(error: ServiceError): void;
  handleResolutionError(error: ServiceError): void;
  handleLifecycleError(error: ServiceError): void;
  handleHealthCheckError(error: ServiceError): void;
  
  getErrorHistory(): ServiceError[];
  getErrorStatistics(): ErrorStatistics;
  clearErrorHistory(): void;
}

// ============================================================================
// サービス定義
// ============================================================================

export interface ServiceFactory<T> {
  (container: IServiceContainer): T | Promise<T>;
}

export interface ServiceRegistration {
  token: string;
  factory: ServiceFactory<any>;
  lifecycle: ServiceLifecycle;
  dependencies: string[];
  options: ServiceRegistrationOptions;
  metadata: ServiceMetadata;
}

export interface ServiceInstance {
  token: string;
  instance: any;
  lifecycle: ServiceLifecycle;
  state: ServiceLifecycleState;
  dependencies: string[];
  dependents: string[];
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  metadata: ServiceMetadata;
}

// 修正: lifecycleプロパティを追加
export interface ServiceRegistrationOptions {
  lifecycle?: ServiceLifecycle;
  dependencies?: string[];
  lazy?: boolean;
  priority?: number;
  healthCheck?: HealthCheck;
  dispose?: DisposeFunction;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface ServiceMetadata {
  name: string;
  description?: string;
  version?: string;
  author?: string;
  tags: string[];
  registeredAt: Date;
  lastModified: Date;
  customData: Record<string, any>;
}

// ============================================================================
// ライフサイクル管理
// ============================================================================

export interface ServiceLifecycleState {
  current: LifecycleState;
  history: LifecycleTransition[];
  lastTransition: Date;
  errors: LifecycleError[];
}

export interface LifecycleTransition {
  from: LifecycleState;
  to: LifecycleState;
  timestamp: Date;
  success: boolean;
  duration: number;
  error?: LifecycleError;
}

export interface LifecycleError {
  state: LifecycleState;
  error: Error;
  timestamp: Date;
  context: any;
}

// ============================================================================
// ヘルス監視
// ============================================================================

export interface HealthStatus {
  overall: HealthState;
  services: Map<string, ServiceHealthStatus>;
  systemMetrics: SystemMetrics;
  timestamp: Date;
  issues: HealthIssue[];
  recommendations: HealthRecommendation[];
}

export interface ServiceHealthStatus {
  token: string;
  state: HealthState;
  lastCheck: Date;
  responseTime: number;
  errorCount: number;
  uptime: number;
  metrics: ServiceMetrics;
  issues: ServiceHealthIssue[];
}

export interface HealthCheck {
  name: string;
  check: () => Promise<HealthCheckResult>;
  interval?: number;
  timeout?: number;
  retries?: number;
}

export interface HealthCheckResult {
  healthy: boolean;
  message?: string;
  data?: any;
  responseTime: number;
}

export interface HealthRecord {
  timestamp: Date;
  status: HealthStatus;
  duration: number;
}

export interface ServiceHealthRecord {
  timestamp: Date;
  token: string;
  status: ServiceHealthStatus;
  duration: number;
}

// ============================================================================
// 依存性分析
// ============================================================================

export interface ResolvedDependencies {
  resolutionOrder: string[];
  dependencyGraph: ServiceDependencyGraph;
  circularDependencies: CircularDependency[];
  issues: DependencyIssue[];
}

export interface DependencyValidationResult {
  valid: boolean;
  issues: DependencyIssue[];
  warnings: DependencyWarning[];
  circularDependencies: CircularDependency[];
  missingDependencies: string[];
}

export interface ServiceDependencyGraph {
  nodes: Map<string, GraphNode>;
  edges: Map<string, Set<string>>;
  roots: string[];
  leaves: string[];
}

export interface GraphNode {
  token: string;
  dependencies: string[];
  dependents: string[];
  depth: number;
  metadata: ServiceMetadata;
}

export interface CircularDependency {
  cycle: string[];
  severity: 'warning' | 'error';
  impact: string[];
}

export interface DependencyIssue {
  type: 'missing' | 'circular' | 'version' | 'conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  services: string[];
  message: string;
  suggestion?: string;
}

export interface DependencyWarning {
  type: 'unused' | 'deprecated' | 'performance' | 'compatibility';
  services: string[];
  message: string;
  suggestion?: string;
}

// ============================================================================
// エラー管理
// ============================================================================

export interface ServiceError {
  id: string;
  type: ServiceErrorType;
  code: string;
  message: string;
  service?: string;
  timestamp: Date;
  stack?: string;
  context: any;
  severity: ErrorSeverity;
}

export interface ErrorStatistics {
  totalErrors: number;
  errorsByType: Map<ServiceErrorType, number>;
  errorsByService: Map<string, number>;
  recentErrors: ServiceError[];
  errorRate: number;
  lastError?: ServiceError;
}

// ============================================================================
// イベント管理
// ============================================================================

export interface ContainerEventData {
  type: ContainerEvent;
  timestamp: Date;
  data: any;
  source?: string;
}

export interface EventHandler {
  (data: ContainerEventData): void | Promise<void>;
}

// ============================================================================
// 診断・デバッグ
// ============================================================================

export interface ServiceInfo {
  token: string;
  lifecycle: ServiceLifecycle;
  state: ServiceLifecycleState;
  dependencies: string[];
  dependents: string[];
  metadata: ServiceMetadata;
  instance?: any;
  statistics: ServiceStatistics;
}

export interface ResolutionRecord {
  token: string;
  timestamp: Date;
  success: boolean;
  duration: number;
  error?: Error;
  stackTrace?: string;
}

export interface ServiceStatistics {
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  errorCount: number;
  averageResponseTime: number;
  totalResponseTime: number;
  peakMemoryUsage: number;
  currentMemoryUsage: number;
}

// ============================================================================
// システムメトリクス
// ============================================================================

export interface SystemMetrics {
  registeredServices: number;
  activeServices: number;
  totalResolutions: number;
  successfulResolutions: number;
  failedResolutions: number;
  averageResolutionTime: number;
  memoryUsage: MemoryUsage;
  uptime: number;
}

export interface ServiceMetrics {
  instances: number;
  resolutions: number;
  errors: number;
  averageResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface MemoryUsage {
  used: number;
  total: number;
  peak: number;
  collections: number;
}

// ============================================================================
// 列挙型・定数（修正: exportを追加して値として使用可能にする）
// ============================================================================

export enum ServiceLifecycle {
  SINGLETON = 'singleton',
  TRANSIENT = 'transient',
  SCOPED = 'scoped'
}

export enum LifecycleState {
  NOT_CREATED = 'not_created',
  CREATING = 'creating',
  CREATED = 'created',
  INITIALIZING = 'initializing',
  READY = 'ready',
  RUNNING = 'running',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  DISPOSING = 'disposing',
  DISPOSED = 'disposed',
  ERROR = 'error'
}

export enum HealthState {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown'
}

export enum ContainerEvent {
  SERVICE_REGISTERED = 'service_registered',
  SERVICE_UNREGISTERED = 'service_unregistered',
  SERVICE_RESOLVED = 'service_resolved',
  SERVICE_DISPOSED = 'service_disposed',
  DEPENDENCY_RESOLVED = 'dependency_resolved',
  HEALTH_CHECK_COMPLETED = 'health_check_completed',
  ERROR_OCCURRED = 'error_occurred',
  LIFECYCLE_CHANGED = 'lifecycle_changed',
  CONTAINER_INITIALIZED = 'container_initialized',
  CONTAINER_SHUTDOWN = 'container_shutdown'
}

export enum ServiceErrorType {
  REGISTRATION = 'registration',
  RESOLUTION = 'resolution',
  LIFECYCLE = 'lifecycle',
  DEPENDENCY = 'dependency',
  HEALTH_CHECK = 'health_check',
  DISPOSAL = 'disposal',
  SYSTEM = 'system'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// ============================================================================
// 型エイリアス
// ============================================================================

export type DisposeFunction = (instance: any) => void | Promise<void>;
export type HealthIssue = any;
export type HealthRecommendation = any;
export type ServiceHealthIssue = any;