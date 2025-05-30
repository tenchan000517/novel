// // src/lib/ai/ai-result-cache.ts
// import * as crypto from 'crypto';
// import { logger } from '../utils/logger';

// export class AIResultCache {
//   private static instance: AIResultCache;
//   private cache: Map<string, { result: string, timestamp: Date }> = new Map();
//   private maxCacheSize: number = 500; // デフォルトの最大キャッシュサイズ
//   private cacheTTL: number = 60 * 60 * 1000; // デフォルトTTL: 1時間
  
//   private constructor() {
//     logger.info('AIResultCache initialized');
//   }
  
//   public static getInstance(): AIResultCache {
//     if (!AIResultCache.instance) {
//       AIResultCache.instance = new AIResultCache();
//     }
//     return AIResultCache.instance;
//   }
  
//   // キャッシュからの取得
//   public get(key: string): string | null {
//     const cacheKey = this.generateCacheKey(key);
//     const cachedItem = this.cache.get(cacheKey);
    
//     if (!cachedItem) return null;
    
//     // TTLチェック
//     if (Date.now() - cachedItem.timestamp.getTime() > this.cacheTTL) {
//       this.cache.delete(cacheKey);
//       return null;
//     }
    
//     return cachedItem.result;
//   }
  
//   // キャッシュへの保存
//   public set(key: string, result: string): void {
//     const cacheKey = this.generateCacheKey(key);
    
//     this.cache.set(cacheKey, {
//       result,
//       timestamp: new Date()
//     });
    
//     // キャッシュサイズ制限
//     if (this.cache.size > this.maxCacheSize) {
//       // 最も古いエントリを削除
//       const oldestKey = Array.from(this.cache.entries())
//         .sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime())[0][0];
//       this.cache.delete(oldestKey);
//     }
//   }
  
//   // キャッシュキーの生成
//   private generateCacheKey(input: string): string {
//     return crypto.createHash('md5').update(input).digest('hex');
//   }
  
//   // キャッシュ設定の変更
//   public configure(options: { maxSize?: number, ttl?: number }): void {
//     if (options.maxSize !== undefined) this.maxCacheSize = options.maxSize;
//     if (options.ttl !== undefined) this.cacheTTL = options.ttl;
    
//     logger.info('AIResultCache configuration updated', options);
//   }
  
//   // キャッシュのクリア
//   public clear(): void {
//     this.cache.clear();
//     logger.info('AIResultCache cleared');
//   }
  
//   // キャッシュ統計の取得
//   public getStats(): { size: number, maxSize: number, ttl: number } {
//     return {
//       size: this.cache.size,
//       maxSize: this.maxCacheSize,
//       ttl: this.cacheTTL
//     };
//   }
// }