// // src/lib/ai/ai-monitoring-dashboard.ts
// import { AIServiceManager } from './ai-service-manager';
// import { AIServiceFacade } from './ai-service-facade';
// import { apiThrottler } from '../utils/api-throttle';
// import { requestQueue } from '../utils/request-queue';
// import { logger } from '../utils/logger';

// export class AIMonitoringDashboard {
//   private static instance: AIMonitoringDashboard;
//   private aiService: AIServiceManager;
//   private aiFacade: AIServiceFacade;
//   private monitoringInterval: NodeJS.Timeout | null = null;
//   private statusListeners: Array<(status: any) => void> = [];
  
//   private constructor() {
//     this.aiService = AIServiceManager.getInstance();
//     this.aiFacade = AIServiceFacade.getInstance();
//   }
  
//   public static getInstance(): AIMonitoringDashboard {
//     if (!AIMonitoringDashboard.instance) {
//       AIMonitoringDashboard.instance = new AIMonitoringDashboard();
//     }
//     return AIMonitoringDashboard.instance;
//   }
  
//   // モニタリングを開始
//   public startMonitoring(intervalMs: number = 10000): void {
//     if (this.monitoringInterval) {
//       this.stopMonitoring();
//     }
    
//     this.monitoringInterval = setInterval(() => {
//       const status = this.getStatus();
//       this.notifyListeners(status);
      
//       // ログ出力
//       if (status.activeRequests > 0) {
//         logger.info('AI Service status update', { 
//           activeRequests: status.activeRequests,
//           queuedRequests: status.queueStats.queueLength
//         });
//       }
//     }, intervalMs);
    
//     logger.info(`AI monitoring started with interval ${intervalMs}ms`);
//   }
  
//   // モニタリングを停止
//   public stopMonitoring(): void {
//     if (this.monitoringInterval) {
//       clearInterval(this.monitoringInterval);
//       this.monitoringInterval = null;
//       logger.info('AI monitoring stopped');
//     }
//   }
  
//   // 現在のステータスを取得
//   public getStatus(): any {
//     const stats = this.aiService.getStats();
//     const activeRequests = this.aiService.getActiveRequests();
//     const throttlerStats = apiThrottler.getStats();
//     const queueStats = requestQueue.getStats();
    
//     return {
//       timestamp: new Date(),
//       stats,
//       activeRequests: activeRequests.length,
//       requestDetails: activeRequests,
//       throttlerStats,
//       queueStats
//     };
//   }
  
//   // ステータスリスナーを追加
//   public addStatusListener(listener: (status: any) => void): void {
//     this.statusListeners.push(listener);
//   }
  
//   // ステータスリスナーを削除
//   public removeStatusListener(listener: (status: any) => void): void {
//     const index = this.statusListeners.indexOf(listener);
//     if (index !== -1) {
//       this.statusListeners.splice(index, 1);
//     }
//   }
  
//   // リスナーに通知
//   private notifyListeners(status: any): void {
//     this.statusListeners.forEach(listener => {
//       try {
//         listener(status);
//       } catch (error) {
//         logger.warn('Error in AI monitoring status listener', {
//           error: error instanceof Error ? error.message : String(error)
//         });
//       }
//     });
//   }
  
//   // パフォーマンスログを記録
//   public logPerformanceReport(): void {
//     const stats = this.aiService.getStats();
//     logger.info('AI Service Performance Report', {
//       totalRequests: stats.totalRequests,
//       successRate: stats.totalRequests > 0 
//         ? (stats.successfulRequests / stats.totalRequests * 100).toFixed(2) + '%' 
//         : 'N/A',
//       averageResponseTime: stats.averageResponseTime.toFixed(2) + 'ms',
//       requestsByType: stats.requestsByType
//     });
//   }
  
//   // レート制限監視機能
//   public startRateLimitMonitoring(): void {
//     // 現在のスロットラー状態をチェック
//     const monitoringInterval = setInterval(() => {
//       const throttlerStats = apiThrottler.getStats();
//       const queueStats = requestQueue.getStats();
      
//       // レート制限に近づいたら警告
//       if (throttlerStats.requestsInWindow > throttlerStats.maxRequestsPerMinute * 0.8) {
//         logger.warn('Approaching API rate limit', {
//           current: throttlerStats.requestsInWindow,
//           limit: throttlerStats.maxRequestsPerMinute,
//           remainingTime: `${Math.round(throttlerStats.remainingWindowTime / 1000)}s`
//         });
//       }
      
//       // キューが長くなりすぎたら警告
//       if (queueStats.queueLength > 20) {
//         logger.warn('Request queue is building up', {
//           queueLength: queueStats.queueLength,
//           breakdown: queueStats.priorityBreakdown
//         });
//       }
      
//       // バックオフ状態を検出
//       if (throttlerStats.isPaused) {
//         logger.warn('API throttler is in backoff mode', {
//           backoffTime: throttlerStats.backoffTime,
//           queuedRequests: queueStats.queueLength
//         });
//       }
//     }, 10000); // 10秒ごとにチェック
//   }
  
//   // 統計をリセット
//   public resetStats(): void {
//     this.aiService.resetStats();
//     logger.info('AI service stats reset');
//   }
// }