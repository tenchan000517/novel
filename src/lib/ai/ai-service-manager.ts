// // src/lib/ai/ai-service-manager.ts
// import { GeminiClient } from '../generation/gemini-client';
// import { apiThrottler, RequestPriority } from '../utils/api-throttle';
// import { requestQueue } from '../utils/request-queue';
// import { logger } from '../utils/logger';
// import { parameterManager } from '../parameters';
// import { GenerationOptions } from '@/types/generation';

// export enum AITaskType {
//   CONTENT_GENERATION = 'content',      // 本文生成（modelsmapのキーと一致させる）
//   ANALYSIS = 'analysis',               // テキスト分析
//   SUMMARY = 'summary',                 // 要約生成
//   CONSISTENCY_CHECK = 'consistency',   // 整合性チェック
//   EVENT_DETECTION = 'event',           // イベント検出
//   CHARACTER_GROWTH = 'characterization', // キャラクター成長分析
//   FORESHADOWING = 'foreshadowing',     // 伏線処理
//   DEFAULT = 'default'                  // デフォルト
// }

// export interface AITaskRequest {
//   type: AITaskType;
//   prompt: string;
//   options?: GenerationOptions;
//   priority?: RequestPriority;
// }

// export interface AIServiceStats {
//   totalRequests: number;
//   successfulRequests: number;
//   failedRequests: number;
//   averageResponseTime: number;
//   requestsByType: Record<string, number>;
// }

// export class AIServiceManager {
//   private static instance: AIServiceManager;
//   private geminiClient: GeminiClient;
//   private activeRequests: Map<string, { startTime: Date, type: AITaskType }> = new Map();
  
//   // 統計情報
//   private stats: {
//     totalRequests: number;
//     successfulRequests: number;
//     failedRequests: number;
//     totalResponseTime: number;
//     requestsByType: Record<string, number>;
//   } = {
//     totalRequests: 0,
//     successfulRequests: 0,
//     failedRequests: 0,
//     totalResponseTime: 0,
//     requestsByType: Object.values(AITaskType).reduce((acc, type) => {
//       acc[type] = 0;
//       return acc;
//     }, {} as Record<string, number>)
//   };
  
//   private constructor() {
//     this.geminiClient = new GeminiClient();
    
//     // パラメータ変更通知を購読
//     parameterManager.onParameterChanged((path, value) => {
//       if (path === 'generation.models' || path === 'all') {
//         this.updateModelsFromParameters();
//       }
      
//       if (path === 'generation.apiLimits' || path === 'all') {
//         this.updateApiLimits();
//       }
      
//       if (path === 'generation.queueSettings' || path === 'all') {
//         this.updateQueueSettings();
//       }
//     });
    
//     // 初期設定
//     this.updateModelsFromParameters();
//     this.updateApiLimits();
//     this.updateQueueSettings();
    
//     logger.info('AIServiceManager initialized');
//   }

//   public static getInstance(): AIServiceManager {
//     if (!AIServiceManager.instance) {
//       AIServiceManager.instance = new AIServiceManager();
//     }
//     return AIServiceManager.instance;
//   }

//   // パラメータマネージャーからモデル設定を更新
//   private updateModelsFromParameters(): void {
//     try {
//       const params = parameterManager.getParameters();
//       if (params.generation?.models) {
//         this.geminiClient.setModelMap(params.generation.models);
//         logger.info('Updated AI models from parameters', { 
//           models: params.generation.models 
//         });
//       }
//     } catch (error) {
//       logger.error('Failed to update models from parameters', {
//         error: error instanceof Error ? error.message : String(error)
//       });
//     }
//   }
  
//   // APIリミット設定更新
//   private updateApiLimits(): void {
//     try {
//       const params = parameterManager.getParameters();
//       if (params.generation?.apiLimits) {
//         const { requestsPerMinute = 50 } = params.generation.apiLimits;
        
//         // スロットラーの設定を更新
//         apiThrottler.updateLimits(requestsPerMinute);
        
//         logger.info('Updated API limits from parameters', {
//           requestsPerMinute
//         });
//       }
//     } catch (error) {
//       logger.error('Failed to update API limits from parameters', {
//         error: error instanceof Error ? error.message : String(error)
//       });
//     }
//   }
  
//   // キュー設定更新
//   private updateQueueSettings(): void {
//     try {
//       const params = parameterManager.getParameters();
//       if (params.generation?.queueSettings) {
//         const { 
//           enableBatching = false, 
//           batchSize = 1, 
//           batchInterval = 2000 
//         } = params.generation.queueSettings;
        
//         // リクエストキューの設定を更新
//         requestQueue.configureBatching(
//           enableBatching,
//           batchSize,
//           batchInterval
//         );
        
//         logger.info('Updated queue settings from parameters', {
//           enableBatching,
//           batchSize,
//           batchInterval
//         });
//       }
//     } catch (error) {
//       logger.error('Failed to update queue settings from parameters', {
//         error: error instanceof Error ? error.message : String(error)
//       });
//     }
//   }

//   // タスクの優先度を決定
//   private getPriorityForTaskType(type: AITaskType, requestedPriority?: RequestPriority): RequestPriority {
//     if (requestedPriority !== undefined) return requestedPriority;
    
//     // タスクタイプ別のデフォルト優先度
//     switch (type) {
//       case AITaskType.CONTENT_GENERATION:
//         return RequestPriority.HIGH;
//       case AITaskType.ANALYSIS:
//       case AITaskType.CONSISTENCY_CHECK:
//       case AITaskType.CHARACTER_GROWTH:
//         return RequestPriority.MEDIUM;
//       default:
//         return RequestPriority.LOW;
//     }
//   }

//   // AI タスクを実行
//   public async executeTask(request: AITaskRequest): Promise<string> {
//     const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     const priority = this.getPriorityForTaskType(request.type, request.priority);
//     const startTime = Date.now();
    
//     // リクエスト追跡開始
//     this.activeRequests.set(taskId, { 
//       startTime: new Date(), 
//       type: request.type 
//     });
    
//     // 統計情報更新
//     this.stats.totalRequests++;
//     this.stats.requestsByType[request.type]++;
    
//     logger.debug(`Executing AI task: ${request.type}`, {
//       priority,
//       promptLength: request.prompt.length,
//       options: request.options
//     });
    
//     try {
//       const params = parameterManager.getParameters().generation;
      
//       // オプションの準備
//       const options: GenerationOptions = {
//         temperature: request.options?.temperature ?? params.temperature,
//         frequencyPenalty: request.options?.frequencyPenalty ?? params.frequencyPenalty,
//         presencePenalty: request.options?.presencePenalty ?? params.presencePenalty,
//         purpose: request.type, // modelマッピングのためにpurposeを設定
//         ...request.options,
//         overrides: {
//           topK: request.options?.overrides?.topK ?? params.topK,
//           topP: request.options?.overrides?.topP ?? params.topP,
//           ...(request.options?.overrides || {})
//         }
//       };
      
//       // 強化されたリクエストキューを使用
//       const result = await requestQueue.enqueue(
//         () => this.geminiClient.generateText(request.prompt, options),
//         priority
//       );
      
//       const executionTime = Date.now() - startTime;
      
//       // 統計情報更新
//       this.stats.successfulRequests++;
//       this.stats.totalResponseTime += executionTime;
      
//       logger.info(`AI task completed: ${request.type}`, {
//         executionTimeMs: executionTime,
//         responseLength: result.length
//       });
      
//       // リクエスト追跡終了
//       this.activeRequests.delete(taskId);
      
//       return result;
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : String(error);
      
//       // 統計情報更新
//       this.stats.failedRequests++;
      
//       logger.error(`AI task failed: ${request.type}`, {
//         error: errorMessage,
//         executionTimeMs: Date.now() - startTime
//       });
      
//       // リクエスト追跡終了
//       this.activeRequests.delete(taskId);
      
//       throw error;
//     }
//   }

//   // バッチで順次実行
//   public async executeBatch(requests: AITaskRequest[]): Promise<string[]> {
//     logger.info(`Processing batch of ${requests.length} requests sequentially`);
    
//     // 順次実行に変更
//     const results: string[] = [];
//     for (const request of requests) {
//       const result = await this.executeTask(request);
//       results.push(result);
//     }
//     return results;
//   }
  
//   // GeminiClientのインスタンスを取得（必要な場合のみ）
//   public getGeminiClient(): GeminiClient {
//     return this.geminiClient;
//   }
  
//   // 現在のアクティブなリクエスト数を取得
//   public getActiveRequestCount(): number {
//     return this.activeRequests.size;
//   }
  
//   // アクティブリクエストの詳細情報
//   public getActiveRequests(): { id: string, startTime: Date, type: AITaskType, elapsedMs: number }[] {
//     return Array.from(this.activeRequests.entries()).map(([id, data]) => ({
//       id,
//       startTime: data.startTime,
//       type: data.type,
//       elapsedMs: Date.now() - data.startTime.getTime()
//     }));
//   }
  
//   // 統計情報の取得
//   public getStats(): AIServiceStats {
//     return {
//       totalRequests: this.stats.totalRequests,
//       successfulRequests: this.stats.successfulRequests,
//       failedRequests: this.stats.failedRequests,
//       averageResponseTime: this.stats.successfulRequests > 0 
//         ? this.stats.totalResponseTime / this.stats.successfulRequests 
//         : 0,
//       requestsByType: { ...this.stats.requestsByType }
//     };
//   }
  
//   // 統計情報のリセット
//   public resetStats(): void {
//     this.stats = {
//       totalRequests: 0,
//       successfulRequests: 0,
//       failedRequests: 0,
//       totalResponseTime: 0,
//       requestsByType: Object.values(AITaskType).reduce((acc, type) => {
//         acc[type] = 0;
//         return acc;
//       }, {} as Record<string, number>)
//     };
//     logger.info('AI service stats reset');
//   }
// }