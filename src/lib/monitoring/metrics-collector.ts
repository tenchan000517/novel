// src/lib/monitoring/metrics-collector.ts
import { Gauge, Counter, Histogram, register } from 'prom-client';
import { logger } from '../utils/logger';
import { logError } from '@/lib/utils/error-handler';

/**
 * システム全体のメトリクス収集を管理するクラス
 * Prometheusフォーマットでメトリクスを収集・提供
 */
export class MetricsCollector {
  private static instance: MetricsCollector;
  
  // 生成関連メトリクス
  private generationTime: Histogram;
  private generationSuccess: Counter;
  private generationFailure: Counter;
  private activeGenerations: Gauge;
  
  // ストレージ操作メトリクス
  private storageOperationTime: Histogram;
  private cacheHits: Counter;
  private cacheMisses: Counter;
  
  // システムリソースメトリクス
  private memoryUsage: Gauge;
  private cpuUsage: Gauge;
  
  // API関連メトリクス
  private apiRequestDuration: Histogram;
  private apiRequestTotal: Counter;
  private apiErrorTotal: Counter;
  
  private constructor() {
    // Prometheusメトリクスの設定とデフォルトラベル
    register.setDefaultLabels({
      app: 'auto-novel-system'
    });
    
    // 生成時間ヒストグラム
    this.generationTime = new Histogram({
      name: 'chapter_generation_duration_seconds',
      help: 'Time taken to generate a chapter',
      labelNames: ['status'],
      buckets: [1, 5, 10, 20, 30, 60, 120, 300] // 1秒〜5分
    });
    
    // 生成成功カウンター
    this.generationSuccess = new Counter({
      name: 'chapter_generation_success_total',
      help: 'Total number of successful chapter generations'
    });
    
    // 生成失敗カウンター
    this.generationFailure = new Counter({
      name: 'chapter_generation_failure_total',
      help: 'Total number of failed chapter generations',
      labelNames: ['reason']
    });
    
    // アクティブ生成数ゲージ
    this.activeGenerations = new Gauge({
      name: 'active_generations',
      help: 'Number of currently active generation processes'
    });
    
    // ストレージ操作時間ヒストグラム
    this.storageOperationTime = new Histogram({
      name: 'storage_operation_duration_ms',
      help: 'Duration of storage operations in milliseconds',
      labelNames: ['operation', 'source'],
      buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000] // 5ms〜5秒
    });
    
    // キャッシュヒットカウンター
    this.cacheHits = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache']
    });
    
    // キャッシュミスカウンター
    this.cacheMisses = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache']
    });
    
    // メモリ使用量ゲージ
    this.memoryUsage = new Gauge({
      name: 'process_memory_usage_bytes',
      help: 'Process memory usage in bytes',
      labelNames: ['type']
    });
    
    // CPU使用量ゲージ
    this.cpuUsage = new Gauge({
      name: 'process_cpu_usage_percentage',
      help: 'Process CPU usage in percentage'
    });
    
    // APIリクエスト時間ヒストグラム
    this.apiRequestDuration = new Histogram({
      name: 'api_request_duration_seconds',
      help: 'API request duration in seconds',
      labelNames: ['method', 'endpoint', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10, 30] // 10ms〜30秒
    });
    
    // APIリクエスト数カウンター
    this.apiRequestTotal = new Counter({
      name: 'api_requests_total',
      help: 'Total count of API requests',
      labelNames: ['method', 'endpoint', 'status']
    });
    
    // APIエラー数カウンター
    this.apiErrorTotal = new Counter({
      name: 'api_errors_total',
      help: 'Total count of API errors',
      labelNames: ['method', 'endpoint', 'error_code']
    });
    
    // 定期的なリソースメトリクス収集
    this.startPeriodicCollection();
    
    logger.info('Metrics collector initialized');
  }
  
  /**
   * シングルトンインスタンスの取得
   */
  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }
  
  /**
   * 生成時間の記録
   * @param duration 生成時間（秒）
   * @param status 生成ステータス
   */
  recordGenerationTime(duration: number, status: string = 'success'): void {
    this.generationTime.labels(status).observe(duration);
    logger.debug(`Recorded generation time: ${duration}s with status: ${status}`);
  }
  
  /**
   * 生成成功の記録
   */
  recordGenerationSuccess(): void {
    this.generationSuccess.inc();
  }
  
  /**
   * 生成失敗の記録
   * @param reason 失敗理由
   */
  recordGenerationFailure(reason: string = 'unknown'): void {
    this.generationFailure.labels(reason).inc();
  }
  
  /**
   * アクティブ生成数の増加
   */
  incrementActiveGenerations(): void {
    this.activeGenerations.inc();
  }
  
  /**
   * アクティブ生成数の減少
   */
  decrementActiveGenerations(): void {
    this.activeGenerations.dec();
  }
  
  /**
   * ストレージ操作時間の記録
   * @param operation 操作タイプ（read, write, list, delete）
   * @param source ソース（cache, storage, error, total）
   * @param duration 操作時間（ミリ秒）
   */
  recordStorageOperationTime(operation: string, source: string, duration: number): void {
    this.storageOperationTime.labels(operation, source).observe(duration);
  }
  
  /**
   * キャッシュヒットの記録
   * @param cache キャッシュタイプ
   */
  incrementCacheHits(cache: string = 'redis'): void {
    this.cacheHits.labels(cache).inc();
  }
  
  /**
   * キャッシュミスの記録
   * @param cache キャッシュタイプ
   */
  incrementCacheMisses(cache: string = 'redis'): void {
    this.cacheMisses.labels(cache).inc();
  }
  
  /**
   * APIリクエストの記録
   * @param method HTTPメソッド
   * @param endpoint エンドポイント
   * @param status HTTPステータスコード
   * @param duration リクエスト時間（秒）
   */
  recordApiRequest(method: string, endpoint: string, status: number, duration: number): void {
    const statusStr = status.toString();
    this.apiRequestDuration.labels(method, endpoint, statusStr).observe(duration);
    this.apiRequestTotal.labels(method, endpoint, statusStr).inc();
    
    // エラー発生時にエラーカウンターも増加
    if (status >= 400) {
      const errorCode = status >= 500 ? 'server_error' : 'client_error';
      this.apiErrorTotal.labels(method, endpoint, errorCode).inc();
    }
  }
  
  /**
   * 定期的なメトリクス収集を開始
   */
  private startPeriodicCollection(): void {
    // 5秒ごとにリソースメトリクスを収集
    setInterval(() => {
      try {
        // メモリ使用量の収集
        const memoryUsage = process.memoryUsage();
        this.memoryUsage.labels('heap_used').set(memoryUsage.heapUsed);
        this.memoryUsage.labels('heap_total').set(memoryUsage.heapTotal);
        this.memoryUsage.labels('rss').set(memoryUsage.rss);
        this.memoryUsage.labels('external').set(memoryUsage.external);
        
        // CPU使用量の収集（Node.jsでは直接取得できないため、推定値）
        const startTime = process.hrtime();
        const startUsage = process.cpuUsage();
        
        // ビジーループでCPU使用率をシミュレート
        setTimeout(() => {
          const elapsedTime = process.hrtime(startTime);
          const elapsedMs = elapsedTime[0] * 1000 + elapsedTime[1] / 1e6;
          
          const cpuUsage = process.cpuUsage(startUsage);
          const userCpuMs = cpuUsage.user / 1000;
          const systemCpuMs = cpuUsage.system / 1000;
          
          // CPU使用率の計算（ユーザー + システム時間 / 経過時間）
          const cpuPercentage = ((userCpuMs + systemCpuMs) / elapsedMs) * 100;
          this.cpuUsage.set(isNaN(cpuPercentage) ? 0 : cpuPercentage);
        }, 500);
      } catch (error: unknown) {
        logError(error, {}, "Error collecting resource metrics:");
      }
    }, 5000);
  }
  
  /**
   * メトリクスをPrometheusフォーマットで取得
   */
  async getMetrics(): Promise<string> {
    return register.metrics();
  }
  
  /**
   * 特定のメトリクスの現在値を取得
   * @param name メトリクス名
   */
  getMetricValue(name: string): number | null {
    try {
      const metric = register.getSingleMetric(name);
      if (!metric) {
        return null;
      }
      
      // メトリクスタイプによって取得方法が異なる
      if (metric instanceof Counter || metric instanceof Gauge) {
        return (metric as any).get().values[0].value;
      }
      
      return null;
    } catch (error: unknown) {
      logError(error, {}, "Error getting metric value for ${name}:");
      return null;
    }
  }
  
  /**
   * メトリクスレジストリをリセット
   */
  resetMetrics(): void {
    register.clear();
    MetricsCollector.instance = new MetricsCollector();
  }
}

