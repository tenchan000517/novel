// src/lib/utils/api-throttle.ts
/**
 * @fileoverview 修正版APIスロットリング機能（完全動作版）
 * 🔧 processNextRequest()の実装不備を修正
 * 🔧 キューからのリクエスト実行ロジックを追加
 * 🔧 適切なPromise resolve/reject処理を実装
 */
import { logger } from '../utils/logger';

export enum RequestPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// 🔧 修正: キューアイテムの型定義を拡張
interface QueuedRequest<T = any> {
  resolve: (result: T) => void;
  reject: (error: any) => void;
  priority: RequestPriority;
  timestamp: number;
  requestFn: () => Promise<T>; // 🔧 追加: 実行するリクエスト関数
}

export class APIThrottler {
  private static instance: APIThrottler;
  private requestsInWindow: number = 0;
  private windowStartTime: number = Date.now();
  private maxRequestsPerMinute: number = 50;
  
  // 🔧 修正: 型定義を適用
  private waitingRequests: QueuedRequest[] = [];
  
  private processingTimer: NodeJS.Timeout | null = null;
  private paused: boolean = false;
  private backoffTime: number = 0;
  private errorCount: number = 0;

  private constructor() {
    // 毎分ウィンドウをリセット
    setInterval(() => {
      this.resetRequestWindow();
    }, 60000);
  }

  public static getInstance(): APIThrottler {
    if (!APIThrottler.instance) {
      APIThrottler.instance = new APIThrottler();
    }
    return APIThrottler.instance;
  }
  
  public updateLimits(maxRequestsPerMinute: number): void {
    this.maxRequestsPerMinute = maxRequestsPerMinute;
    logger.info(`API throttler limits updated: ${maxRequestsPerMinute} requests per minute`);
  }

  private resetRequestWindow(): void {
    this.requestsInWindow = 0;
    this.windowStartTime = Date.now();
    
    if (this.errorCount === 0) {
      this.backoffTime = 0;
    }
    
    logger.debug('API request window reset');
    
    // 🔧 追加: ウィンドウリセット時にキュー処理を再開
    if (this.waitingRequests.length > 0 && !this.processingTimer) {
      this.startQueueProcessing();
    }
  }

  public async throttledRequest<T>(
    requestFn: () => Promise<T>,
    priority: RequestPriority = RequestPriority.MEDIUM
  ): Promise<T> {
    // バックオフ中なら待機
    if (this.backoffTime > 0) {
      const waitTime = this.backoffTime;
      logger.info(`API throttler in backoff mode: waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // 現在のリクエスト数が制限以内ならすぐに実行
    if (this.requestsInWindow < this.maxRequestsPerMinute && !this.paused) {
      this.requestsInWindow++;
      try {
        const result = await requestFn();
        this.errorCount = 0;
        logger.debug(`Direct API request completed successfully. Remaining in window: ${this.maxRequestsPerMinute - this.requestsInWindow}`);
        return result;
      } catch (error) {
        // レート制限エラーを検出した場合
        if (this.isRateLimitError(error)) {
          this.handleRateLimitError();
          // キューに入れて再試行
          return this.queueRequest(requestFn, priority);
        }
        throw error;
      }
    } else {
      // 制限を超えている場合はキューに入れる
      logger.info(`Request rate limit reached (${this.requestsInWindow}/${this.maxRequestsPerMinute}). Queueing request.`);
      return this.queueRequest(requestFn, priority);
    }
  }
  
  // 🔧 修正: requestFnを保存するように変更
  private queueRequest<T>(
    requestFn: () => Promise<T>,
    priority: RequestPriority
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.waitingRequests.push({
        resolve,
        reject,
        priority,
        timestamp: Date.now(),
        requestFn // 🔧 追加: リクエスト関数を保存
      });
      
      logger.info(`Request queued (${priority}). Queue size: ${this.waitingRequests.length}`);
      
      // キュー処理を開始
      this.startQueueProcessing();
    });
  }

  // 🔧 新規追加: キュー処理開始メソッド
  private startQueueProcessing(): void {
    if (!this.processingTimer && this.waitingRequests.length > 0) {
      logger.debug('Starting queue processing timer');
      this.processingTimer = setInterval(() => {
        this.processNextRequest();
      }, 1200); // 50 RPM = 約1.2秒ごとに1リクエスト
    }
  }

  // 🔧 完全実装: 次のリクエストを実際に処理
  private async processNextRequest(): Promise<void> {
    // 処理条件のチェック
    if (
      this.waitingRequests.length === 0 ||
      this.requestsInWindow >= this.maxRequestsPerMinute ||
      this.paused
    ) {
      // キューが空または制限に達した場合はタイマーを停止
      if (this.waitingRequests.length === 0 && this.processingTimer) {
        clearInterval(this.processingTimer);
        this.processingTimer = null;
        logger.debug('Queue processing stopped - no pending requests');
      }
      return;
    }
    
    // 優先度でソート (HIGH → MEDIUM → LOW)
    this.waitingRequests.sort((a, b) => {
      const priorityOrder = { 
        [RequestPriority.HIGH]: 0, 
        [RequestPriority.MEDIUM]: 1, 
        [RequestPriority.LOW]: 2 
      };
      
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
    });
    
    // 🔧 実装: キューから次のリクエストを取り出して実行
    const nextRequest = this.waitingRequests.shift();
    if (!nextRequest) return;
    
    try {
      logger.debug(`Processing queued request (${nextRequest.priority}). Remaining queue: ${this.waitingRequests.length}`);
      
      // リクエスト数をカウント
      this.requestsInWindow++;
      
      // 🔧 実装: 実際にリクエストを実行
      const result = await nextRequest.requestFn();
      
      // 🔧 実装: 成功時はresolveを呼び出し
      nextRequest.resolve(result);
      
      // エラーカウントをリセット
      this.errorCount = 0;
      
      logger.debug(`Queued request completed successfully. Remaining in window: ${this.maxRequestsPerMinute - this.requestsInWindow}`);
      
    } catch (error) {
      logger.error('Queued request failed', { 
        error: error instanceof Error ? error.message : String(error),
        priority: nextRequest.priority,
        queueSize: this.waitingRequests.length
      });
      
      // レート制限エラーの場合は特別処理
      if (this.isRateLimitError(error)) {
        // リクエストをキューの先頭に戻す（再試行のため）
        this.waitingRequests.unshift(nextRequest);
        this.handleRateLimitError();
      } else {
        // 🔧 実装: その他のエラーの場合はrejectを呼び出し
        nextRequest.reject(error);
      }
    }
    
    // キューが空になった場合はタイマーを停止
    if (this.waitingRequests.length === 0 && this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = null;
      logger.debug('Queue processing completed - all requests processed');
    }
  }
  
  private isRateLimitError(error: any): boolean {
    const errorStr = String(error);
    return errorStr.includes('quota_exceeded') || 
           errorStr.includes('rate limit') || 
           errorStr.includes('resource exhausted') ||
           errorStr.includes('429') ||
           (error.status && error.status === 429);
  }
  
  private handleRateLimitError(): void {
    this.errorCount++;
    this.paused = true;
    
    // 指数バックオフを適用
    this.backoffTime = Math.min(
      2000 * Math.pow(2, this.errorCount - 1) + Math.random() * 1000,
      60000 // 最大1分
    );
    
    logger.warn(`Rate limit hit! Backing off for ${this.backoffTime}ms. Error count: ${this.errorCount}`);
    
    // タイマーを一時停止
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = null;
    }
    
    // 一定時間後に再開
    setTimeout(() => {
      this.paused = false;
      logger.info('API throttler resumed after backoff');
      
      // キュー処理を再開
      if (this.waitingRequests.length > 0) {
        this.startQueueProcessing();
      }
    }, this.backoffTime);
  }
  
  // 🔧 拡張: デバッグ用の詳細統計
  public getStats(): any {
    const now = Date.now();
    const elapsedInWindow = now - this.windowStartTime;
    const remainingInWindow = Math.max(0, 60000 - elapsedInWindow);
    
    return {
      requestsInWindow: this.requestsInWindow,
      maxRequestsPerMinute: this.maxRequestsPerMinute,
      remainingRequests: Math.max(0, this.maxRequestsPerMinute - this.requestsInWindow),
      remainingWindowTime: remainingInWindow,
      queuedRequests: this.waitingRequests.length,
      backoffTime: this.backoffTime,
      isPaused: this.paused,
      isProcessing: this.processingTimer !== null,
      errorCount: this.errorCount,
      queueBreakdown: {
        high: this.waitingRequests.filter(r => r.priority === RequestPriority.HIGH).length,
        medium: this.waitingRequests.filter(r => r.priority === RequestPriority.MEDIUM).length,
        low: this.waitingRequests.filter(r => r.priority === RequestPriority.LOW).length
      }
    };
  }

  // 🔧 新規追加: デバッグ用メソッド
  public getQueueStatus(): string {
    const stats = this.getStats();
    return `Queue: ${stats.queuedRequests} pending, Window: ${stats.requestsInWindow}/${stats.maxRequestsPerMinute}, Processing: ${stats.isProcessing}, Paused: ${stats.isPaused}`;
  }

  // 🔧 新規追加: 強制キュー処理（デバッグ用）
  public forceProcessQueue(): void {
    logger.info('Forcing queue processing');
    this.processNextRequest();
  }
}

// シングルトンインスタンス
export const apiThrottler = APIThrottler.getInstance();