/**
 * Version 2.0 - サービスコンテナ型定義
 * 
 * 依存注入とサービス管理のための型定義
 */

import { SystemId, SystemHealth, SystemConfiguration, OperationResult } from './common';

// ============================================================================
// サービス定義
// ============================================================================

export interface ServiceDefinition {
  id: string;
  name: string;
  version: string;
  dependencies: string[];
  singleton: boolean;
  lazy: boolean;
  initializationOrder: number;
  factory: ServiceFactory<any>;
  healthCheck?: HealthCheckFunction;
  shutdownHook?: ShutdownHookFunction;
}

export interface ServiceFactory<T> {
  (container: IServiceContainer): Promise<T>;
}

export interface HealthCheckFunction {
  (): Promise<SystemHealth>;
}

export interface ShutdownHookFunction {
  (): Promise<void>;
}

// ============================================================================
// サービスコンテナインターフェース
// ============================================================================

export interface IServiceContainer {
  // サービス登録
  register<T>(definition: ServiceDefinition): void;
  registerSingleton<T>(id: string, factory: ServiceFactory<T>): void;
  registerTransient<T>(id: string, factory: ServiceFactory<T>): void;
  
  // サービス取得
  get<T>(serviceId: string): Promise<T>;
  getOptional<T>(serviceId: string): Promise<T | null>;
  getAll<T>(tag: string): Promise<T[]>;
  
  // ライフサイクル管理
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  restart(serviceId: string): Promise<void>;
  
  // ヘルスチェック
  checkHealth(): Promise<ContainerHealth>;
  checkServiceHealth(serviceId: string): Promise<SystemHealth>;
  
  // 設定管理
  updateConfiguration(serviceId: string, config: Partial<SystemConfiguration>): Promise<void>;
  getConfiguration(serviceId: string): Promise<SystemConfiguration>;
  
  // イベント
  on(event: ContainerEvent, handler: ContainerEventHandler): void;
  off(event: ContainerEvent, handler: ContainerEventHandler): void;
  emit(event: ContainerEvent, data: any): Promise<void>;
}

// ============================================================================
// コンテナ状態管理
// ============================================================================

export enum ContainerStatus {
  UNINITIALIZED = 'uninitialized',
  INITIALIZING = 'initializing',
  READY = 'ready',
  SHUTTING_DOWN = 'shutting_down',
  SHUTDOWN = 'shutdown',
  ERROR = 'error'
}

export interface ContainerHealth {
  status: ContainerStatus;
  services: Record<string, SystemHealth>;
  totalServices: number;
  healthyServices: number;
  unhealthyServices: number;
  lastHealthCheck: string;
  uptime: number;
}

// ============================================================================
// 初期化フェーズ管理
// ============================================================================

export enum InitializationPhase {
  INFRASTRUCTURE = 1,  // ロガー、設定管理など
  STORAGE = 2,          // データベース、ファイルシステムなど
  CORE = 3,             // メモリ管理、AI クライアントなど
  BUSINESS = 4,         // ビジネスロジック、ファサードなど
  PRESENTATION = 5      // API、UI コンポーネントなど
}

export interface PhaseConfiguration {
  phase: InitializationPhase;
  services: string[];
  timeout: number;
  retryAttempts: number;
  onPhaseComplete?: (phase: InitializationPhase) => Promise<void>;
  onPhaseError?: (phase: InitializationPhase, error: Error) => Promise<void>;
}

// ============================================================================
// イベントシステム
// ============================================================================

export type ContainerEvent = 
  | 'service-registered'
  | 'service-initialized'
  | 'service-health-changed'
  | 'service-error'
  | 'container-ready'
  | 'container-shutdown'
  | 'configuration-updated';

export interface ContainerEventHandler {
  (data: any): Promise<void>;
}

// ============================================================================
// 依存関係解決
// ============================================================================

export interface DependencyNode {
  serviceId: string;
  dependencies: string[];
  dependents: string[];
  initializationOrder: number;
  status: 'pending' | 'initializing' | 'ready' | 'error';
}

export interface DependencyGraph {
  nodes: Map<string, DependencyNode>;
  executionOrder: string[];
  circularDependencies: string[][];
}

// ============================================================================
// サービス状態
// ============================================================================

export enum ServiceLifecycleState {
  REGISTERED = 'registered',
  INITIALIZING = 'initializing',
  READY = 'ready',
  ERROR = 'error',
  SHUTTING_DOWN = 'shutting_down',
  SHUTDOWN = 'shutdown'
}

export interface ServiceInstance<T = any> {
  id: string;
  instance: T;
  definition: ServiceDefinition;
  state: ServiceLifecycleState;
  createdAt: string;
  lastAccessed: string;
  accessCount: number;
  health: SystemHealth;
}

// ============================================================================
// 設定・監視
// ============================================================================

export interface ContainerConfiguration {
  initializationTimeout: number;
  shutdownTimeout: number;
  healthCheckInterval: number;
  maxRetryAttempts: number;
  enableMetrics: boolean;
  enableHealthChecks: boolean;
  phases: PhaseConfiguration[];
}

export interface ContainerMetrics {
  totalServices: number;
  readyServices: number;
  initializationTime: number;
  averageServiceInitTime: number;
  totalServiceAccesses: number;
  averageHealthCheckTime: number;
  lastMetricsUpdate: string;
  serviceMetrics: Record<string, ServiceMetrics>;
}

export interface ServiceMetrics {
  serviceId: string;
  accessCount: number;
  averageResponseTime: number;
  lastAccessed: string;
  initializationTime: number;
  healthCheckCount: number;
  errorCount: number;
}

// ============================================================================
// エラー管理
// ============================================================================

export class ServiceContainerError extends Error {
  constructor(
    message: string,
    public serviceId?: string,
    public phase?: InitializationPhase,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ServiceContainerError';
  }
}

export class DependencyResolutionError extends ServiceContainerError {
  constructor(
    serviceId: string,
    dependencies: string[],
    missingDependencies: string[]
  ) {
    super(
      `Failed to resolve dependencies for service '${serviceId}'. Missing: ${missingDependencies.join(', ')}`,
      serviceId
    );
    this.name = 'DependencyResolutionError';
  }
}

export class CircularDependencyError extends ServiceContainerError {
  constructor(cycle: string[]) {
    super(`Circular dependency detected: ${cycle.join(' -> ')}`);
    this.name = 'CircularDependencyError';
  }
}