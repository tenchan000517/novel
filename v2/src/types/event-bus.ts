/**
 * Version 2.0 - イベントバス型定義
 * 
 * システム間通信のためのイベント駆動アーキテクチャ型定義
 */

import { SystemId, OperationResult } from './common';

// ============================================================================
// イベント基本型
// ============================================================================

export interface SystemEvent<T = any> {
  id: string;
  type: EventType;
  source: SystemId;
  target?: SystemId | SystemId[];
  data: T;
  metadata: EventMetadata;
}

export interface EventMetadata {
  timestamp: string;
  version: string;
  correlationId?: string;
  causationId?: string;
  priority: EventPriority;
  ttl?: number;
  retryAttempts?: number;
  tags?: string[];
}

export enum EventPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// ============================================================================
// イベントタイプ定義
// ============================================================================

export type EventType = 
  // システムライフサイクル
  | 'system.initialized'
  | 'system.shutdown'
  | 'system.health.changed'
  | 'system.error'
  
  // データ操作
  | 'data.created'
  | 'data.updated'
  | 'data.deleted'
  | 'data.query.executed'
  
  // コンテンツ生成
  | 'content.generation.started'
  | 'content.generation.completed'
  | 'content.generation.failed'
  | 'content.analysis.completed'
  
  // キャラクター
  | 'character.created'
  | 'character.updated'
  | 'character.evolution.triggered'
  | 'character.relationship.changed'
  
  // ストーリー
  | 'chapter.generated'
  | 'plot.updated'
  | 'theme.changed'
  | 'world.setting.updated'
  
  // 学習
  | 'learning.concept.identified'
  | 'learning.journey.updated'
  | 'learning.pattern.detected'
  
  // 品質管理
  | 'quality.assessment.completed'
  | 'quality.threshold.violated'
  | 'quality.improvement.suggested'
  
  // メモリ管理
  | 'memory.consolidated'
  | 'memory.archived'
  | 'memory.retrieved'
  
  // AI関連
  | 'ai.request.queued'
  | 'ai.response.received'
  | 'ai.model.switched'
  | 'ai.quota.exceeded'
  
  // カスタムイベント
  | `custom.${string}`;

// ============================================================================
// イベントハンドラー
// ============================================================================

export interface EventHandler<T = any> {
  (event: SystemEvent<T>): Promise<EventHandlerResult>;
}

export interface EventHandlerResult {
  success: boolean;
  data?: any;
  error?: string;
  stopPropagation?: boolean;
  retry?: boolean;
}

export interface EventSubscription {
  id: string;
  eventType: EventType | EventTypePattern;
  handler: EventHandler;
  options: SubscriptionOptions;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

export interface SubscriptionOptions {
  priority: number;
  maxRetries: number;
  timeout: number;
  filter?: EventFilter;
  onError?: ErrorHandler;
  onSuccess?: SuccessHandler;
}

export type EventTypePattern = string; //支持通配符，如 "content.*", "system.health.*"

export interface EventFilter {
  (event: SystemEvent): boolean;
}

export interface ErrorHandler {
  (error: Error, event: SystemEvent): Promise<void>;
}

export interface SuccessHandler {
  (result: EventHandlerResult, event: SystemEvent): Promise<void>;
}

// ============================================================================
// イベントバスインターフェース
// ============================================================================

export interface IEventBus {
  // イベント発行
  emit<T>(event: SystemEvent<T>): Promise<OperationResult<EventEmissionResult>>;
  emitAndWait<T>(event: SystemEvent<T>): Promise<OperationResult<EventHandlerResult[]>>;
  
  // イベント購読
  subscribe<T>(
    eventType: EventType | EventTypePattern,
    handler: EventHandler<T>,
    options?: Partial<SubscriptionOptions>
  ): Promise<OperationResult<EventSubscription>>;
  
  unsubscribe(subscriptionId: string): Promise<OperationResult<void>>;
  unsubscribeAll(eventType?: EventType | EventTypePattern): Promise<OperationResult<number>>;
  
  // イベント履歴
  getEventHistory(filter: EventHistoryFilter): Promise<OperationResult<SystemEvent[]>>;
  clearEventHistory(filter?: EventHistoryFilter): Promise<OperationResult<number>>;
  
  // 監視・統計
  getSubscriptions(): Promise<OperationResult<EventSubscription[]>>;
  getMetrics(): Promise<OperationResult<EventBusMetrics>>;
  
  // ライフサイクル
  start(): Promise<OperationResult<void>>;
  stop(): Promise<OperationResult<void>>;
  health(): Promise<OperationResult<EventBusHealth>>;
}

// ============================================================================
// イベント発行結果
// ============================================================================

export interface EventEmissionResult {
  eventId: string;
  subscribersNotified: number;
  successfulHandlers: number;
  failedHandlers: number;
  processingTime: number;
  errors: EventProcessingError[];
}

export interface EventProcessingError {
  subscriptionId: string;
  handlerName: string;
  error: string;
  retryable: boolean;
}

// ============================================================================
// 履歴・フィルタリング
// ============================================================================

export interface EventHistoryFilter {
  eventTypes?: EventType[];
  sources?: SystemId[];
  targets?: SystemId[];
  timeRange?: {
    start: string;
    end: string;
  };
  priorities?: EventPriority[];
  limit?: number;
  offset?: number;
}

// ============================================================================
// メトリクス・監視
// ============================================================================

export interface EventBusMetrics {
  totalEvents: number;
  eventsPerSecond: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  averageProcessingTime: number;
  eventTypeBreakdown: Record<EventType, EventTypeMetrics>;
  systemBreakdown: Record<SystemId, SystemMetrics>;
  errors: {
    total: number;
    byType: Record<string, number>;
    recent: EventProcessingError[];
  };
}

export interface EventTypeMetrics {
  eventType: EventType;
  count: number;
  averageProcessingTime: number;
  successRate: number;
  subscribers: number;
}

export interface SystemMetrics {
  systemId: SystemId;
  eventsEmitted: number;
  eventsReceived: number;
  subscriptions: number;
  averageResponseTime: number;
}

export interface EventBusHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  queueSize: number;
  processingBacklog: number;
  averageLatency: number;
  errorRate: number;
  uptime: number;
}

// ============================================================================
// 設定・オプション
// ============================================================================

export interface EventBusConfiguration {
  maxQueueSize: number;
  maxRetries: number;
  defaultTimeout: number;
  enableHistory: boolean;
  historySize: number;
  enableMetrics: boolean;
  metricsRetentionDays: number;
  processingConcurrency: number;
  deadLetterQueue: boolean;
  enablePersistence: boolean;
}

// ============================================================================
// 高度な機能
// ============================================================================

export interface EventRouter {
  route(event: SystemEvent): SystemId[];
}

export interface EventTransformer {
  transform<T, U>(event: SystemEvent<T>): Promise<SystemEvent<U>>;
}

export interface EventValidator {
  validate(event: SystemEvent): Promise<ValidationResult>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// イベントストリーム
// ============================================================================

export interface EventStream {
  id: string;
  filter: EventFilter;
  subscription: EventSubscription;
  buffer: SystemEvent[];
  maxBufferSize: number;
}

export interface EventStreamOptions {
  bufferSize: number;
  windowSize: number;
  batchSize: number;
  flushInterval: number;
}

// ============================================================================
// デッドレターキュー
// ============================================================================

export interface DeadLetterEvent {
  originalEvent: SystemEvent;
  failureReason: string;
  failureCount: number;
  firstFailure: string;
  lastFailure: string;
  subscriptionId: string;
}

export interface DeadLetterQueue {
  add(event: DeadLetterEvent): Promise<void>;
  get(limit?: number): Promise<DeadLetterEvent[]>;
  retry(eventId: string): Promise<OperationResult<void>>;
  remove(eventId: string): Promise<OperationResult<void>>;
  clear(): Promise<OperationResult<number>>;
}