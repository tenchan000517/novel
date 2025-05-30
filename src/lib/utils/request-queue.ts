// src/lib/utils/enhanced-request-queue.ts
import { APIThrottler, RequestPriority } from './api-throttle';
import { logger } from '../utils/logger';

export interface QueuedRequest<T> {
  requestFn: () => Promise<T>;
  priority: RequestPriority;
  timestamp: number;
  resolve: (value: T) => void;
  reject: (reason: any) => void;
  retryCount: number;
  maxRetries: number;
}

export class RequestQueue {
  private static instance: RequestQueue;
  private queue: QueuedRequest<any>[] = [];
  private processing: boolean = false;
  private throttler: APIThrottler;
  private paused: boolean = false;
  private batchSize: number = 1;
  private batchingEnabled: boolean = false;
  private batchInterval: number = 2000;
  private batchTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.throttler = APIThrottler.getInstance();
  }

  public static getInstance(): RequestQueue {
    if (!RequestQueue.instance) {
      RequestQueue.instance = new RequestQueue();
    }
    return RequestQueue.instance;
  }

  // リクエストをキューに追加
  public enqueue<T>(
    requestFn: () => Promise<T>,
    priority: RequestPriority = RequestPriority.MEDIUM,
    maxRetries: number = 3
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const request: QueuedRequest<T> = {
        requestFn,
        priority,
        timestamp: Date.now(),
        resolve,
        reject,
        retryCount: 0,
        maxRetries
      };
      
      this.queue.push(request);
      
      logger.debug(`Request enqueued (${priority}). Queue size: ${this.queue.length}`);
      
      // 処理開始
      if (!this.processing && !this.paused) {
        if (this.batchingEnabled) {
          this.scheduleBatchProcessing();
        } else {
          this.processQueue();
        }
      }
    });
  }

  // バッチ処理をスケジュール
  private scheduleBatchProcessing(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    
    this.batchTimer = setTimeout(() => {
      this.processBatch();
    }, this.batchInterval);
  }
  
  // バッチで処理
  private async processBatch(): Promise<void> {
    if (this.paused || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    // 優先度でソート
    this.sortQueueByPriority();
    
    // 現在のバッチサイズ（最大batchSizeまで）
    const currentBatchSize = Math.min(this.batchSize, this.queue.length);
    
    logger.info(`Processing batch of ${currentBatchSize} requests`);
    
    const batchRequests = this.queue.splice(0, currentBatchSize);
    
    // シーケンシャルにリクエストを処理する（並列ではなく）
    for (const request of batchRequests) {
      await this.processRequest(request);
    }
    
    this.processing = false;
    
    // キューにまだ項目があれば次のバッチをスケジュール
    if (this.queue.length > 0) {
      this.scheduleBatchProcessing();
    }
  }

  // 通常のキュー処理（1リクエストずつ）
  private async processQueue(): Promise<void> {
    if (this.paused || this.queue.length === 0) {
      this.processing = false;
      return;
    }
    
    this.processing = true;
    
    // 優先度でソート
    this.sortQueueByPriority();
    
    const request = this.queue.shift();
    if (!request) {
      this.processing = false;
      return;
    }
    
    await this.processRequest(request);
    
    // キューにまだ項目があれば続けて処理
    if (this.queue.length > 0) {
      setImmediate(() => this.processQueue());
    } else {
      this.processing = false;
    }
  }

  // 1つのリクエストを処理
  private async processRequest<T>(request: QueuedRequest<T>): Promise<void> {
    try {
      // スロットラーを通して実行
      const result = await this.throttler.throttledRequest(
        request.requestFn,
        request.priority
      );
      
      request.resolve(result);
    } catch (error) {
      // エラーハンドリング
      if (
        request.retryCount < request.maxRetries && 
        this.shouldRetryError(error)
      ) {
        // リトライ
        request.retryCount++;
        
        // 指数バックオフで待機時間を計算
        const backoffTime = 1000 * Math.pow(2, request.retryCount) + 
                           (Math.random() * 1000);
        
        logger.info(`Retrying request (attempt ${request.retryCount}/${request.maxRetries}) after ${backoffTime}ms`);
        
        // 待機後にキューの先頭に戻す
        setTimeout(() => {
          this.queue.unshift(request);
          if (!this.processing && !this.paused) {
            if (this.batchingEnabled) {
              this.scheduleBatchProcessing();
            } else {
              this.processQueue();
            }
          }
        }, backoffTime);
      } else {
        // リトライ回数を超えたか、リトライすべきでないエラー
        request.reject(error);
      }
    }
  }

  // 優先度でキューをソート
  private sortQueueByPriority(): void {
    this.queue.sort((a, b) => {
      const priorityOrder = { 
        [RequestPriority.HIGH]: 0, 
        [RequestPriority.MEDIUM]: 1, 
        [RequestPriority.LOW]: 2 
      };
      
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      // 同じ優先度なら時間順
      return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
    });
  }

  // リトライすべきエラーかどうか判定
  private shouldRetryError(error: any): boolean {
    // retryable errors
    const errorStr = String(error);
    return errorStr.includes('quota_exceeded') ||
           errorStr.includes('rate limit') ||
           errorStr.includes('resource exhausted') ||
           errorStr.includes('timeout') ||
           errorStr.includes('network') ||
           (error.status && (error.status === 429 || error.status === 500 || error.status === 503));
  }

  // バッチ処理設定
  public configureBatching(enable: boolean, batchSize: number = 1, interval: number = 2000): void {
    this.batchingEnabled = enable;
    this.batchSize = Math.max(1, batchSize); // 最低1
    this.batchInterval = Math.max(1000, interval); // 最低1秒
    
    logger.info(`Request queue batching ${enable ? 'enabled' : 'disabled'} (size: ${this.batchSize}, interval: ${this.batchInterval}ms)`);
    
    // 設定変更後、保留中の処理があれば新しい設定で再スケジュール
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    if (this.queue.length > 0 && !this.processing && !this.paused) {
      if (this.batchingEnabled) {
        this.scheduleBatchProcessing();
      } else {
        this.processQueue();
      }
    }
  }
  
  // 一時停止/再開
  public pause(): void {
    this.paused = true;
    logger.info('Request queue processing paused');
  }
  
  public resume(): void {
    this.paused = false;
    logger.info('Request queue processing resumed');
    
    // 再開時に処理を開始
    if (this.queue.length > 0 && !this.processing) {
      if (this.batchingEnabled) {
        this.scheduleBatchProcessing();
      } else {
        this.processQueue();
      }
    }
  }
  
  // キューをクリア
  public clear(): void {
    const count = this.queue.length;
    
    // すべてのpromiseをreject
    this.queue.forEach(request => {
      request.reject(new Error('Request cancelled: Queue cleared'));
    });
    
    this.queue = [];
    logger.info(`Request queue cleared (${count} requests cancelled)`);
  }
  
  // 統計情報
  public getStats(): any {
    return {
      queueLength: this.queue.length,
      isProcessing: this.processing,
      isPaused: this.paused,
      batchingEnabled: this.batchingEnabled,
      batchSize: this.batchSize,
      batchInterval: this.batchInterval,
      priorityBreakdown: {
        high: this.queue.filter(r => r.priority === RequestPriority.HIGH).length,
        medium: this.queue.filter(r => r.priority === RequestPriority.MEDIUM).length,
        low: this.queue.filter(r => r.priority === RequestPriority.LOW).length
      }
    };
  }
}

// シングルトンインスタンス
export const requestQueue = RequestQueue.getInstance();