// // src/lib/ai/ai-service-facade.ts
// import { AIServiceManager, AITaskType, AITaskRequest } from './ai-service-manager';
// import { AIResultCache } from './ai-result-cache';
// import { logger } from '../utils/logger';
// import { RequestPriority } from '../utils/api-throttle';
// import { GenerationOptions } from '@/types/generation';

// // キャッシュ対象とするAIタスクタイプ
// const CACHEABLE_TASKS = [
//   AITaskType.SUMMARY,
//   AITaskType.ANALYSIS,
//   AITaskType.CONSISTENCY_CHECK
// ];

// // シンプルなインターフェースでAIサービスを提供
// export class AIServiceFacade {
//   private static instance: AIServiceFacade;
//   private aiService: AIServiceManager;
//   private cache: AIResultCache;
  
//   private constructor() {
//     this.aiService = AIServiceManager.getInstance();
//     this.cache = AIResultCache.getInstance();
//     logger.info('AIServiceFacade initialized');
//   }
  
//   public static getInstance(): AIServiceFacade {
//     if (!AIServiceFacade.instance) {
//       AIServiceFacade.instance = new AIServiceFacade();
//     }
//     return AIServiceFacade.instance;
//   }
  
//   // テキスト生成 - 本文生成用の主要メソッド
//   public async generateContent(prompt: string, options?: GenerationOptions): Promise<string> {
//     return this.executeTask({
//       type: AITaskType.CONTENT_GENERATION,
//       prompt,
//       options,
//       priority: RequestPriority.HIGH
//     });
//   }
  
//   // テキスト分析 - 分析用メソッド
//   public async analyzeText(prompt: string, options?: GenerationOptions): Promise<string> {
//     return this.executeTask({
//       type: AITaskType.ANALYSIS,
//       prompt,
//       options
//     });
//   }
  
//   // 要約生成 - 要約用メソッド
//   public async generateSummary(prompt: string, options?: GenerationOptions): Promise<string> {
//     return this.executeTask({
//       type: AITaskType.SUMMARY,
//       prompt,
//       options: {
//         temperature: options?.temperature ?? 0.3,
//         ...options
//       }
//     });
//   }
  
//   // 整合性チェック - プロットチェック用
//   public async checkConsistency(prompt: string, options?: GenerationOptions): Promise<string> {
//     return this.executeTask({
//       type: AITaskType.CONSISTENCY_CHECK,
//       prompt,
//       options: {
//         temperature: options?.temperature ?? 0.2,
//         responseFormat: options?.responseFormat ?? 'json',
//         ...options
//       }
//     });
//   }
  
//   // イベント検出 - イベント検出用
//   public async detectEvents(prompt: string, options?: GenerationOptions): Promise<string> {
//     return this.executeTask({
//       type: AITaskType.EVENT_DETECTION,
//       prompt,
//       options: {
//         temperature: options?.temperature ?? 0.2,
//         responseFormat: options?.responseFormat ?? 'json',
//         ...options
//       }
//     });
//   }
  
//   // キャラクター分析・開発 - キャラクター成長用
//   public async analyzeCharacter(prompt: string, options?: GenerationOptions): Promise<string> {
//     return this.executeTask({
//       type: AITaskType.CHARACTER_GROWTH,
//       prompt,
//       options
//     });
//   }
  
//   // 伏線処理 - 伏線関連処理用
//   public async processForeshadowing(prompt: string, options?: GenerationOptions): Promise<string> {
//     return this.executeTask({
//       type: AITaskType.FORESHADOWING,
//       prompt,
//       options
//     });
//   }
  
//   // 内部実行メソッド - キャッシュ対応
//   private async executeTask(request: AITaskRequest): Promise<string> {
//     // キャッシュ可能タスクかチェック
//     if (CACHEABLE_TASKS.includes(request.type)) {
//       // キャッシュキー生成
//       const cacheKey = this.generateCacheKey(request);
      
//       // キャッシュ確認
//       const cachedResult = this.cache.get(cacheKey);
//       if (cachedResult) {
//         logger.debug(`Cache hit for ${request.type} task`);
//         return cachedResult;
//       }
      
//       // キャッシュにない場合は通常実行
//       const result = await this.aiService.executeTask(request);
      
//       // 結果をキャッシュに保存
//       this.cache.set(cacheKey, result);
      
//       return result;
//     }
    
//     // キャッシュ非対象はそのまま実行
//     return this.aiService.executeTask(request);
//   }
  
//   // キャッシュキー生成
//   private generateCacheKey(request: AITaskRequest): string {
//     return `${request.type}:${request.prompt}:${JSON.stringify(request.options)}`;
//   }
  
//   // 複数のAIタスクを順次実行
//   public async executeSequential(requests: AITaskRequest[]): Promise<string[]> {
//     const results: string[] = [];
//     for (const request of requests) {
//       const result = await this.executeTask(request);
//       results.push(result);
//     }
//     return results;
//   }
  
//   // 統計情報取得
//   public getStats() {
//     return this.aiService.getStats();
//   }
  
//   // 現在のリクエストステータス情報
//   public getStatus() {
//     return {
//       activeRequests: this.aiService.getActiveRequestCount(),
//       requestDetails: this.aiService.getActiveRequests(),
//       cacheStats: this.cache.getStats()
//     };
//   }
  
//   // キャッシュのクリア
//   public clearCache(): void {
//     this.cache.clear();
//   }
// }