/**
 * Version 2.0 - AIメトリクス収集
 * 
 * AI使用量とパフォーマンスの監視
 */

import {
  AIRequest,
  AIResponse,
  AIError,
  AIClientMetrics,
  UsageReport,
  TimeRange,
  AIProvider
} from '@/types/ai-client';

interface MetricsCollectorConfig {
  enabled: boolean;
  logger?: any;
}

export class MetricsCollector {
  private enabled: boolean;
  private logger: any;
  private metrics: AIClientMetrics;

  constructor(config: MetricsCollectorConfig) {
    this.enabled = config.enabled;
    this.logger = config.logger || console;

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      cacheHitRate: 0,
      providerMetrics: {
        [AIProvider.GEMINI]: {
          provider: AIProvider.GEMINI,
          requests: 0,
          failures: 0,
          averageLatency: 0,
          totalCost: 0,
          availability: 1
        },
        [AIProvider.OPENAI]: {
          provider: AIProvider.OPENAI,
          requests: 0,
          failures: 0,
          averageLatency: 0,
          totalCost: 0,
          availability: 1
        },
        [AIProvider.CLAUDE]: {
          provider: AIProvider.CLAUDE,
          requests: 0,
          failures: 0,
          averageLatency: 0,
          totalCost: 0,
          availability: 1
        },
        [AIProvider.LOCAL]: {
          provider: AIProvider.LOCAL,
          requests: 0,
          failures: 0,
          averageLatency: 0,
          totalCost: 0,
          availability: 1
        }
      }
    };
  }

  recordRequest(request: AIRequest, response: AIResponse, processingTime: number): void {
    if (!this.enabled) return;

    this.metrics.totalRequests++;
    this.metrics.successfulRequests++;
    this.metrics.totalTokensUsed += response.usage.totalTokens;
    this.metrics.totalCost += response.usage.cost;

    // 平均レスポンス時間の更新
    this.updateAverageResponseTime(processingTime);

    // プロバイダー別メトリクス
    this.updateProviderMetrics(response.provider, processingTime, response.usage.cost, false);
  }

  recordError(request: AIRequest, error: AIError): void {
    if (!this.enabled) return;

    this.metrics.totalRequests++;
    this.metrics.failedRequests++;
  }

  recordCacheHit(requestType: string): void {
    if (!this.enabled) return;

    // キャッシュヒット率の計算は簡略化
    this.metrics.cacheHitRate = Math.min(1, this.metrics.cacheHitRate + 0.01);
  }

  async getMetrics(): Promise<AIClientMetrics> {
    return { ...this.metrics };
  }

  async generateUsageReport(timeRange: TimeRange): Promise<UsageReport> {
    // 簡易実装 - 実際にはデータベースから履歴を取得
    return {
      timeRange,
      totalRequests: this.metrics.totalRequests,
      totalTokens: this.metrics.totalTokensUsed,
      totalCost: this.metrics.totalCost,
      breakdown: {
        byProvider: Object.entries(this.metrics.providerMetrics).reduce((acc, [provider, metrics]) => {
          acc[provider as AIProvider] = {
            requests: metrics.requests,
            tokens: 0, // TODO: implement
            cost: metrics.totalCost,
            averageLatency: metrics.averageLatency
          };
          return acc;
        }, {} as any),
        byModel: {} as any,
        byType: {} as any
      },
      trends: []
    };
  }

  private updateAverageResponseTime(newTime: number): void {
    const totalTime = this.metrics.averageResponseTime * (this.metrics.successfulRequests - 1) + newTime;
    this.metrics.averageResponseTime = totalTime / this.metrics.successfulRequests;
  }

  private updateProviderMetrics(provider: AIProvider, latency: number, cost: number, isFailure: boolean): void {
    if (!this.metrics.providerMetrics[provider]) {
      this.metrics.providerMetrics[provider] = {
        provider,
        requests: 0,
        failures: 0,
        averageLatency: 0,
        totalCost: 0,
        availability: 1
      };
    }

    const metrics = this.metrics.providerMetrics[provider];
    metrics.requests++;
    
    if (isFailure) {
      metrics.failures++;
    } else {
      metrics.totalCost += cost;
    }

    // 平均レイテンシの更新
    const successfulRequests = metrics.requests - metrics.failures;
    if (successfulRequests > 0) {
      metrics.averageLatency = (metrics.averageLatency * (successfulRequests - 1) + latency) / successfulRequests;
    }

    // 可用性の計算
    metrics.availability = (metrics.requests - metrics.failures) / metrics.requests;
  }
}