/**
 * Version 2.0 - AIリクエストルーター
 * 
 * リクエストを適切なプロバイダーにルーティング
 */

import { AIRequest, AIBatchRequest, AIResponse, AIError, AIRequestType, AIModelType } from '@/types/ai-client';
import { ModelManager } from './model-manager';
import { ProviderFactory } from './provider-factory';

interface RequestRouterConfig {
  modelManager: ModelManager;
  providerFactory: ProviderFactory;
  logger?: any;
}

export class RequestRouter {
  private modelManager: ModelManager;
  private providerFactory: ProviderFactory;
  private logger: any;

  constructor(config: RequestRouterConfig) {
    this.modelManager = config.modelManager;
    this.providerFactory = config.providerFactory;
    this.logger = config.logger || console;
  }

  async routeRequest(request: AIRequest): Promise<any> {
    // モデル選択
    let modelId = request.model;
    if (!modelId) {
      // AIRequestTypeからAIModelTypeへのマッピング
      const modelType = this.mapRequestTypeToModelType(request.type);
      const optimalModel = await this.modelManager.selectOptimalModel(
        modelType,
        {
          type: modelType,
          minQuality: 0.8,
          maxLatency: 5000,
          maxCost: 0.001,
          capabilities: []
        }
      );
      modelId = optimalModel.id;
    }

    const model = await this.modelManager.getModel(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    // プロバイダー取得
    const provider = await this.providerFactory.getProvider(model.provider);
    return provider;
  }

  async processBatch(batchRequest: AIBatchRequest): Promise<(AIResponse | AIError)[]> {
    const results: (AIResponse | AIError)[] = [];
    
    // バッチ戦略に基づいて処理
    if (batchRequest.strategy.type === 'parallel') {
      const promises = batchRequest.requests.map(async (request) => {
        try {
          const provider = await this.routeRequest(request);
          return await provider.generateText(request);
        } catch (error) {
          return {
            code: 'PROCESSING_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
            type: 'unknown' as any,
            retryable: false
          } as AIError;
        }
      });

      return await Promise.all(promises);
    }

    // シーケンシャル処理
    for (const request of batchRequest.requests) {
      try {
        const provider = await this.routeRequest(request);
        const response = await provider.generateText(request);
        results.push(response);
      } catch (error) {
        results.push({
          code: 'PROCESSING_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          type: 'unknown' as any,
          retryable: false
        } as AIError);
      }
    }

    return results;
  }

  private mapRequestTypeToModelType(requestType: AIRequestType): AIModelType {
    switch (requestType) {
      case 'text-generation':
      case 'content-enhancement':
      case 'summarization':
        return AIModelType.TEXT_GENERATION;
      case 'text-analysis':
      case 'quality-assessment':
      case 'classification':
        return AIModelType.TEXT_ANALYSIS;
      case 'translation':
        return AIModelType.TRANSLATION;
      default:
        return AIModelType.TEXT_GENERATION;
    }
  }
}