/**
 * Version 2.0 - 統一AIクライアント
 * 
 * 全AIプロバイダーを統一的に管理するメインクライアント
 */

import {
  IUnifiedAIClient,
  AIModel,
  AIRequest,
  AIResponse,
  AIBatchRequest,
  AIBatchResponse,
  AIStreamChunk,
  AIProvider,
  AIModelType,
  ModelRequirements,
  ProviderConfig,
  AIClientMetrics,
  UsageReport,
  TimeRange,
  AIError,
  AIErrorType
} from '@/types/ai-client';
import { OperationResult } from '@/types/common';

import { ModelManager } from './model-manager';
import { RequestRouter } from './request-router';
import { CacheManager } from './cache-manager';
import { MetricsCollector } from './metrics-collector';
import { ProviderFactory } from './provider-factory';

export interface UnifiedAIClientConfig {
  logger?: any;
  cache?: any;
  enableMetrics?: boolean;
  enableCaching?: boolean;
  defaultTimeout?: number;
  maxRetries?: number;
}

export class UnifiedAIClient implements IUnifiedAIClient {
  private modelManager!: ModelManager;
  private requestRouter!: RequestRouter;
  private cacheManager!: CacheManager;
  private metricsCollector!: MetricsCollector;
  private providerFactory!: ProviderFactory;
  private config: Required<UnifiedAIClientConfig>;

  constructor(config: UnifiedAIClientConfig = {}) {
    this.config = {
      logger: config.logger || console,
      cache: config.cache || null,
      enableMetrics: config.enableMetrics ?? true,
      enableCaching: config.enableCaching ?? true,
      defaultTimeout: config.defaultTimeout ?? 30000,
      maxRetries: config.maxRetries ?? 3
    };

    this.initializeComponents();
  }

  // ============================================================================
  // モデル管理
  // ============================================================================

  async getAvailableModels(): Promise<AIModel[]> {
    try {
      return await this.modelManager.getAllModels();
    } catch (error) {
      this.config.logger.error('Failed to get available models:', error);
      return [];
    }
  }

  async getModel(id: string): Promise<AIModel | null> {
    try {
      return await this.modelManager.getModel(id);
    } catch (error) {
      this.config.logger.error(`Failed to get model '${id}':`, error);
      return null;
    }
  }

  async selectOptimalModel(type: AIModelType, requirements: ModelRequirements): Promise<AIModel> {
    try {
      return await this.modelManager.selectOptimalModel(type, requirements);
    } catch (error) {
      this.config.logger.error('Failed to select optimal model:', error);
      throw new Error(`Failed to select optimal model: ${error}`);
    }
  }

  // ============================================================================
  // リクエスト処理
  // ============================================================================

  async generateText(request: AIRequest): Promise<OperationResult<AIResponse>> {
    const startTime = Date.now();
    const operationId = this.generateOperationId();

    try {
      // キャッシュチェック
      if (this.config.enableCaching) {
        const cacheKey = this.generateCacheKey(request);
        const cachedResponse = await this.getCachedResponse(cacheKey);
        
        if (cachedResponse) {
          this.recordCacheHit(request.type);
          return {
            success: true,
            data: cachedResponse,
            metadata: {
              operationId,
              timestamp: new Date().toISOString(),
              processingTime: Date.now() - startTime,
              systemId: 'unified-ai-client'
            }
          };
        }
      }

      // リクエストルーティング
      const provider = await this.requestRouter.routeRequest(request);
      const response = await provider.generateText(request);

      // キャッシュ保存
      if (this.config.enableCaching && response) {
        const cacheKey = this.generateCacheKey(request);
        await this.setCachedResponse(cacheKey, response, 3600); // 1時間
      }

      // メトリクス記録
      if (this.config.enableMetrics) {
        this.metricsCollector.recordRequest(request, response, Date.now() - startTime);
      }

      return {
        success: true,
        data: response,
        metadata: {
          operationId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'unified-ai-client'
        }
      };

    } catch (error) {
      const aiError = this.handleError(error, request);
      
      if (this.config.enableMetrics) {
        this.metricsCollector.recordError(request, aiError);
      }

      return {
        success: false,
        error: {
          code: aiError.code,
          message: aiError.message,
          details: aiError.details
        },
        metadata: {
          operationId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'unified-ai-client'
        }
      };
    }
  }

  async analyzeText(request: AIRequest): Promise<OperationResult<AIResponse>> {
    request.type = 'text-analysis';
    return await this.generateText(request);
  }

  async batchProcess(batchRequest: AIBatchRequest): Promise<OperationResult<AIBatchResponse>> {
    const startTime = Date.now();
    const operationId = this.generateOperationId();

    try {
      const responses = await this.requestRouter.processBatch(batchRequest);
      
      const summary = {
        total: batchRequest.requests.length,
        successful: responses.filter(r => !('code' in r)).length,
        failed: responses.filter(r => 'code' in r).length,
        cached: 0, // TODO: implement cache tracking in batch
        totalTokens: responses
          .filter(r => !('code' in r))
          .reduce((sum, r) => sum + (r as AIResponse).usage.totalTokens, 0),
        totalCost: responses
          .filter(r => !('code' in r))
          .reduce((sum, r) => sum + (r as AIResponse).usage.cost, 0)
      };

      const batchResponse: AIBatchResponse = {
        id: this.generateId(),
        batchId: batchRequest.id,
        responses,
        summary,
        metadata: {
          totalProcessingTime: Date.now() - startTime,
          averageResponseTime: (Date.now() - startTime) / batchRequest.requests.length,
          successRate: summary.successful / summary.total,
          totalCost: summary.totalCost
        }
      };

      return {
        success: true,
        data: batchResponse,
        metadata: {
          operationId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'unified-ai-client'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BATCH_PROCESSING_FAILED',
          message: error instanceof Error ? error.message : 'Batch processing failed',
          details: error
        },
        metadata: {
          operationId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'unified-ai-client'
        }
      };
    }
  }

  // ============================================================================
  // ストリーミング
  // ============================================================================

  async* generateTextStream(request: AIRequest): AsyncIterable<AIStreamChunk> {
    try {
      const provider = await this.requestRouter.routeRequest(request);
      
      if (!provider.generateTextStream) {
        throw new Error('Provider does not support streaming');
      }

      yield* provider.generateTextStream(request);

    } catch (error) {
      this.config.logger.error('Stream generation failed:', error);
      
      // エラーチャンクを返す
      yield {
        id: this.generateId(),
        requestId: request.id,
        content: '',
        delta: '',
        isComplete: true,
        metadata: {
          chunkIndex: 0,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // ============================================================================
  // キャッシュ管理
  // ============================================================================

  async getCachedResponse(cacheKey: string): Promise<AIResponse | null> {
    if (!this.config.enableCaching) {
      return null;
    }

    return await this.cacheManager.get(cacheKey);
  }

  async setCachedResponse(cacheKey: string, response: AIResponse, ttl: number): Promise<void> {
    if (!this.config.enableCaching) {
      return;
    }

    await this.cacheManager.set(cacheKey, response, ttl);
  }

  async clearCache(pattern?: string): Promise<void> {
    await this.cacheManager.clear(pattern);
  }

  // ============================================================================
  // 監視・メトリクス
  // ============================================================================

  async getMetrics(): Promise<AIClientMetrics> {
    return await this.metricsCollector.getMetrics();
  }

  async getUsageReport(timeRange: TimeRange): Promise<UsageReport> {
    return await this.metricsCollector.generateUsageReport(timeRange);
  }

  // ============================================================================
  // 設定管理
  // ============================================================================

  async updateProviderConfig(provider: AIProvider, config: ProviderConfig): Promise<void> {
    await this.providerFactory.updateProviderConfig(provider, config);
    this.config.logger.info(`Updated configuration for provider '${provider}'`);
  }

  async getProviderConfig(provider: AIProvider): Promise<ProviderConfig> {
    return await this.providerFactory.getProviderConfig(provider);
  }

  // ============================================================================
  // プライベートメソッド
  // ============================================================================

  private initializeComponents(): void {
    this.modelManager = new ModelManager({
      logger: this.config.logger
    });

    this.cacheManager = new CacheManager({
      enabled: this.config.enableCaching,
      cache: this.config.cache,
      logger: this.config.logger
    });

    this.metricsCollector = new MetricsCollector({
      enabled: this.config.enableMetrics,
      logger: this.config.logger
    });

    this.providerFactory = new ProviderFactory({
      logger: this.config.logger,
      defaultTimeout: this.config.defaultTimeout,
      maxRetries: this.config.maxRetries
    });

    this.requestRouter = new RequestRouter({
      modelManager: this.modelManager,
      providerFactory: this.providerFactory,
      logger: this.config.logger
    });
  }

  private generateCacheKey(request: AIRequest): string {
    const keyData = {
      type: request.type,
      content: request.content,
      options: request.options
    };
    return `ai_${this.hashObject(keyData)}`;
  }

  private hashObject(obj: any): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private handleError(error: any, request: AIRequest): AIError {
    if (error instanceof Error) {
      // エラータイプの判定
      let errorType = AIErrorType.UNKNOWN;
      let retryable = false;

      if (error.message.includes('authentication')) {
        errorType = AIErrorType.AUTHENTICATION;
      } else if (error.message.includes('rate limit')) {
        errorType = AIErrorType.RATE_LIMIT;
        retryable = true;
      } else if (error.message.includes('quota')) {
        errorType = AIErrorType.QUOTA_EXCEEDED;
      } else if (error.message.includes('timeout')) {
        errorType = AIErrorType.TIMEOUT;
        retryable = true;
      } else if (error.message.includes('network')) {
        errorType = AIErrorType.NETWORK_ERROR;
        retryable = true;
      }

      return {
        code: errorType,
        message: error.message,
        type: errorType,
        retryable,
        details: error
      };
    }

    return {
      code: AIErrorType.UNKNOWN,
      message: 'Unknown error occurred',
      type: AIErrorType.UNKNOWN,
      retryable: false,
      details: error
    };
  }

  private recordCacheHit(requestType: string): void {
    if (this.config.enableMetrics) {
      this.metricsCollector.recordCacheHit(requestType);
    }
  }

  private generateOperationId(): string {
    return `ai_op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}