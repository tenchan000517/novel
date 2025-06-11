/**
 * Version 2.0 - 統一AIクライアント型定義
 * 
 * 全AIプロバイダーを統一的に管理するための型定義
 */

import { OperationResult, SystemMetrics } from './common';

// ============================================================================
// AIプロバイダー基本型
// ============================================================================

export enum AIProvider {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  CLAUDE = 'claude',
  LOCAL = 'local'
}

export enum AIModelType {
  TEXT_GENERATION = 'text-generation',
  TEXT_ANALYSIS = 'text-analysis',
  EMBEDDING = 'embedding',
  CLASSIFICATION = 'classification',
  TRANSLATION = 'translation'
}

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  type: AIModelType;
  version: string;
  maxTokens: number;
  costPerToken: number;
  capabilities: AICapability[];
  performance: ModelPerformance;
}

export interface AICapability {
  name: string;
  supported: boolean;
  quality: number; // 0-1
  speed: number;   // 0-1
}

export interface ModelPerformance {
  averageLatency: number;
  throughput: number;
  reliability: number;
  qualityScore: number;
}

// ============================================================================
// リクエスト・レスポンス型
// ============================================================================

export interface AIRequest {
  id: string;
  type: AIRequestType;
  model?: string;
  content: AIContent;
  options: AIOptions;
  metadata: {
    source: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    timeout: number;
    retryAttempts: number;
  };
}

export type AIRequestType = 
  | 'text-generation'
  | 'text-analysis'
  | 'content-enhancement'
  | 'quality-assessment'
  | 'translation'
  | 'summarization'
  | 'classification';

export interface AIContent {
  prompt?: string;
  text?: string;
  context?: string[];
  examples?: AIExample[];
  constraints?: string[];
}

export interface AIExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  format?: 'text' | 'json' | 'markdown';
  language?: string;
  style?: string;
}

// ============================================================================
// レスポンス型
// ============================================================================

export interface AIResponse {
  id: string;
  requestId: string;
  model: string;
  provider: AIProvider;
  content: string;
  metadata: AIResponseMetadata;
  usage: TokenUsage;
  quality: QualityMetrics;
}

export interface AIResponseMetadata {
  finishReason: 'completed' | 'length' | 'stop' | 'error';
  processingTime: number;
  modelVersion: string;
  timestamp: string;
  cacheHit: boolean;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
}

export interface QualityMetrics {
  relevance: number;
  coherence: number;
  fluency: number;
  accuracy: number;
  creativity: number;
  overall: number;
}

// ============================================================================
// バッチ処理
// ============================================================================

export interface AIBatchRequest {
  id: string;
  requests: AIRequest[];
  strategy: BatchStrategy;
  options: BatchOptions;
}

export interface BatchStrategy {
  type: 'parallel' | 'sequential' | 'adaptive';
  maxConcurrency: number;
  failureHandling: 'stop' | 'continue' | 'retry';
  loadBalancing: boolean;
}

export interface BatchOptions {
  timeout: number;
  retryAttempts: number;
  priorityQueuing: boolean;
  resultCaching: boolean;
}

export interface AIBatchResponse {
  id: string;
  batchId: string;
  responses: (AIResponse | AIError)[];
  summary: BatchSummary;
  metadata: {
    totalProcessingTime: number;
    averageResponseTime: number;
    successRate: number;
    totalCost: number;
  };
}

export interface BatchSummary {
  total: number;
  successful: number;
  failed: number;
  cached: number;
  totalTokens: number;
  totalCost: number;
}

// ============================================================================
// エラー処理
// ============================================================================

export interface AIError {
  code: string;
  message: string;
  type: AIErrorType;
  retryable: boolean;
  details?: any;
}

export enum AIErrorType {
  AUTHENTICATION = 'authentication',
  RATE_LIMIT = 'rate_limit',
  QUOTA_EXCEEDED = 'quota_exceeded',
  MODEL_UNAVAILABLE = 'model_unavailable',
  INVALID_REQUEST = 'invalid_request',
  TIMEOUT = 'timeout',
  NETWORK_ERROR = 'network_error',
  CONTENT_FILTERED = 'content_filtered',
  UNKNOWN = 'unknown'
}

export type AIErrorTypeValue = `${AIErrorType}`;

// ============================================================================
// 統一AIクライアントインターフェース
// ============================================================================

export interface IUnifiedAIClient {
  // モデル管理
  getAvailableModels(): Promise<AIModel[]>;
  getModel(id: string): Promise<AIModel | null>;
  selectOptimalModel(type: AIModelType, requirements: ModelRequirements): Promise<AIModel>;
  
  // リクエスト処理
  generateText(request: AIRequest): Promise<OperationResult<AIResponse>>;
  analyzeText(request: AIRequest): Promise<OperationResult<AIResponse>>;
  batchProcess(batchRequest: AIBatchRequest): Promise<OperationResult<AIBatchResponse>>;
  
  // ストリーミング
  generateTextStream(request: AIRequest): AsyncIterable<AIStreamChunk>;
  
  // キャッシュ管理
  getCachedResponse(cacheKey: string): Promise<AIResponse | null>;
  setCachedResponse(cacheKey: string, response: AIResponse, ttl: number): Promise<void>;
  clearCache(pattern?: string): Promise<void>;
  
  // 監視・メトリクス
  getMetrics(): Promise<AIClientMetrics>;
  getUsageReport(timeRange: TimeRange): Promise<UsageReport>;
  
  // 設定
  updateProviderConfig(provider: AIProvider, config: ProviderConfig): Promise<void>;
  getProviderConfig(provider: AIProvider): Promise<ProviderConfig>;
}

export interface ModelRequirements {
  type: AIModelType;
  minQuality: number;
  maxLatency: number;
  maxCost: number;
  capabilities: string[];
}

export interface AIStreamChunk {
  id: string;
  requestId: string;
  content: string;
  delta: string;
  isComplete: boolean;
  metadata: {
    chunkIndex: number;
    timestamp: string;
  };
}

// ============================================================================
// 設定・監視
// ============================================================================

export interface ProviderConfig {
  provider: AIProvider;
  enabled: boolean;
  apiKey: string;
  endpoint?: string;
  defaultModel: string;
  rateLimits: RateLimits;
  retryPolicy: RetryPolicy;
  caching: CachingConfig;
}

export interface RateLimits {
  requestsPerMinute: number;
  tokensPerMinute: number;
  concurrentRequests: number;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential';
  baseDelay: number;
  maxDelay: number;
  retryableErrors: AIErrorTypeValue[];
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  keyPrefix: string;
  excludeTypes: AIRequestType[];
}

export interface AIClientMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  totalCost: number;
  cacheHitRate: number;
  providerMetrics: Record<AIProvider, ProviderMetrics>;
}

export interface ProviderMetrics {
  provider: AIProvider;
  requests: number;
  failures: number;
  averageLatency: number;
  totalCost: number;
  availability: number;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface UsageReport {
  timeRange: TimeRange;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  breakdown: {
    byProvider: Record<AIProvider, UsageBreakdown>;
    byModel: Record<string, UsageBreakdown>;
    byType: Record<AIRequestType, UsageBreakdown>;
  };
  trends: UsageTrend[];
}

export interface UsageBreakdown {
  requests: number;
  tokens: number;
  cost: number;
  averageLatency: number;
}

export interface UsageTrend {
  date: string;
  requests: number;
  tokens: number;
  cost: number;
}

// ============================================================================
// プロバイダー固有型
// ============================================================================

export interface GeminiConfig extends ProviderConfig {
  projectId: string;
  location: string;
  safetySettings: SafetySetting[];
}

export interface SafetySetting {
  category: string;
  threshold: string;
}

export interface OpenAIConfig extends ProviderConfig {
  organization?: string;
  assistantId?: string;
  functionCalling: boolean;
}