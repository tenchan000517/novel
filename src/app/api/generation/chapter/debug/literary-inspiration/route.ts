// // src/app/api/generation/chapter/debug/literary-inspiration/route.ts

// import { NextResponse } from 'next/server';
// import { GeminiClient } from '@/lib/generation/gemini-client';
// import { LiteraryComparisonSystem } from '@/lib/analysis/sercvices/narrative/literary-comparison-system';
// import { WorldSettingsManager } from '@/lib/plot/world-settings-manager';
// import { logger } from '@/lib/utils/logger';
// import { apiThrottler } from '@/lib/utils/api-throttle';

// /**
//  * タイムアウト時間を計測するユーティリティクラス
//  */
// class TimeoutTracker {
//   private timeouts: Map<string, NodeJS.Timeout> = new Map();
//   private timings: Map<string, number> = new Map();
  
//   startTimer(key: string, timeoutMs: number, onTimeout: () => void): void {
//     this.clearTimer(key);
//     this.timings.set(key, Date.now());
//     const timeout = setTimeout(() => {
//       this.timings.delete(key);
//       onTimeout();
//     }, timeoutMs);
//     this.timeouts.set(key, timeout);
//   }
  
//   stopTimer(key: string): number | null {
//     const startTime = this.timings.get(key);
//     this.clearTimer(key);
//     if (startTime) {
//       const elapsedTime = Date.now() - startTime;
//       this.timings.delete(key);
//       return elapsedTime;
//     }
//     return null;
//   }
  
//   private clearTimer(key: string): void {
//     const timeout = this.timeouts.get(key);
//     if (timeout) {
//       clearTimeout(timeout);
//       this.timeouts.delete(key);
//     }
//   }
// }

// /**
//  * POST リクエストハンドラ - App Router 形式
//  */
// export async function POST(request: Request) {
//   const timeoutTracker = new TimeoutTracker();
//   const debugInfo: Record<string, any> = {
//     steps: [],
//     timings: {},
//     apiThrottlerState: {},
//     worldSettings: {
//       inspected: false,
//       data: null
//     }
//   };
  
//   // デバッグステップを記録する関数
//   const logStep = (step: string, data?: any) => {
//     const stepInfo = {
//       step,
//       timestamp: new Date().toISOString(),
//       timeMs: Date.now()
//     };
    
//     if (data) {
//       Object.assign(stepInfo, { data });
//     }
    
//     debugInfo.steps.push(stepInfo);
//     logger.debug(`Debug LCS [${step}]`, {
//       timestamp: new Date().toISOString(),
//       ...(data ? { data } : {})
//     });
//   };

//   try {
//     // リクエストのJSONデータを取得
//     const body = await request.json();
    
//     const { 
//       chapterNumber = 1, 
//       genre = '', 
//       timeoutSeconds = 30,
//       useTestWorldSettings = false,
//       testWorldSettings = '',
//       inspectOnly = false
//     } = body;
    
//     logger.info('Debug literary inspiration generation started', {
//       chapterNumber,
//       genre,
//       timeoutSeconds,
//       useTestWorldSettings,
//       timestamp: new Date().toISOString()
//     });

//     const startTime = Date.now();

//     // APIスロットラーの状態を監視
//     const monitorApiThrottler = () => {
//       try {
//         const throttlerState = {
//           queueSize: (apiThrottler as any).queue?.length || 'unknown',
//           isProcessing: (apiThrottler as any).isProcessing || false,
//           requestsThisWindow: (apiThrottler as any).requestsThisWindow || 0,
//         };
//         debugInfo.apiThrottlerState = throttlerState;
//         return throttlerState;
//       } catch (error) {
//         return { error: 'Could not access apiThrottler state' };
//       }
//     };

//     // 初期状態を記録
//     logStep('init', { 
//       apiThrottlerState: monitorApiThrottler(),
//       inspectOnly
//     });

//     // GeminiClientのインスタンス作成
//     logStep('create_gemini_client');
//     const geminiClient = new GeminiClient();
    
//     // WorldSettingsManagerのインスタンス作成 - 実際の設定を検査
//     logStep('create_world_settings_manager');
//     const worldSettingsManager = new WorldSettingsManager();
    
//     // 既存の世界設定を検査
//     logStep('inspect_world_settings_start');
//     try {
//       // 利用可能なメソッドを取得
//       const methods = Object.getOwnPropertyNames(
//         Object.getPrototypeOf(worldSettingsManager)
//       ).filter(m => typeof (worldSettingsManager as any)[m] === 'function');
      
//       logStep('world_settings_available_methods', { methods });
      
//       // 現在の世界設定を取得するメソッドを探して実行
//       let currentSettings = null;
      
//       if (typeof (worldSettingsManager as any).getSettings === 'function') {
//         currentSettings = await (worldSettingsManager as any).getSettings();
//         logStep('world_settings_current', { 
//           source: 'getSettings',
//           settings: currentSettings 
//         });
//       }
//       else if (typeof (worldSettingsManager as any).getWorldSettings === 'function') {
//         currentSettings = await (worldSettingsManager as any).getWorldSettings();
//         logStep('world_settings_current', { 
//           source: 'getWorldSettings',
//           settings: currentSettings 
//         });
//       }
//       else if (typeof (worldSettingsManager as any).getCurrentSettings === 'function') {
//         currentSettings = await (worldSettingsManager as any).getCurrentSettings();
//         logStep('world_settings_current', { 
//           source: 'getCurrentSettings',
//           settings: currentSettings 
//         });
//       }
      
//       debugInfo.worldSettings = {
//         inspected: true,
//         data: currentSettings,
//         methods
//       };
      
//       // ジャンル情報も取得
//       if (typeof (worldSettingsManager as any).getGenre === 'function') {
//         const currentGenre = await (worldSettingsManager as any).getGenre();
//         logStep('world_settings_genre', { genre: currentGenre });
//         debugInfo.worldSettings.genre = currentGenre;
//       }
      
//     } catch (wsError) {
//       logStep('world_settings_inspection_error', { 
//         error: wsError instanceof Error ? wsError.message : String(wsError)
//       });
//     }
    
//     // 検査のみモードの場合はここで終了
//     if (inspectOnly) {
//       return NextResponse.json({
//         success: true,
//         message: 'Inspection completed',
//         debugInfo
//       }, { status: 200 });
//     }
    
//     // テストモードの場合はテスト用の世界設定を使用
//     if (useTestWorldSettings && testWorldSettings) {
//       logStep('using_test_world_settings', { 
//         testSettings: testWorldSettings.substring(0, 100) + '...' 
//       });
      
//       // 世界設定の更新を試みる
//       try {
//         if (typeof (worldSettingsManager as any).setWorldSettings === 'function') {
//           await (worldSettingsManager as any).setWorldSettings(testWorldSettings);
//           logStep('test_world_settings_set', { method: 'setWorldSettings' });
//         }
//         else if (typeof (worldSettingsManager as any).updateSettings === 'function') {
//           await (worldSettingsManager as any).updateSettings(testWorldSettings);
//           logStep('test_world_settings_set', { method: 'updateSettings' });
//         }
//       } catch (setError) {
//         logStep('test_world_settings_error', {
//           error: setError instanceof Error ? setError.message : String(setError)
//         });
//       }
//     }

//     // LiteraryComparisonSystemのインスタンス作成
//     logStep('create_literary_comparison_system');
//     const literaryComparisonSystem = new LiteraryComparisonSystem(
//       geminiClient, 
//       worldSettingsManager
//     );

//     // 処理開始前のログ
//     logStep('prepare_generation', {
//       setupTimeMs: Date.now() - startTime,
//       apiThrottlerState: monitorApiThrottler()
//     });

//     // 生成コンテキストの作成
//     const context = {
//       genre: genre || undefined,
//       chapterNumber,
//       totalChapters: 10,
//       _debugMode: true
//     };

//     // タイムアウトを設定
//     let isTimedOut = false;
//     timeoutTracker.startTimer('generation', timeoutSeconds * 1000, () => {
//       isTimedOut = true;
//       logStep('timeout', { 
//         timeoutSeconds,
//         apiThrottlerState: monitorApiThrottler()
//       });
//     });

//     // 生成実行
//     logStep('start_generation', { context });
//     const startGeneration = Date.now();
    
//     let result;
//     try {
//       // メインのインスピレーション生成処理
//       result = await literaryComparisonSystem.generateLiteraryInspirations(context, chapterNumber);
      
//       // 成功した場合、タイマーを停止
//       const generationTime = timeoutTracker.stopTimer('generation');
//       logStep('generation_complete', { 
//         timeMs: generationTime,
//         resultSize: JSON.stringify(result).length,
//         apiThrottlerState: monitorApiThrottler()
//       });
//     } catch (genError) {
//       const generationTime = timeoutTracker.stopTimer('generation') || (Date.now() - startGeneration);
//       logStep('generation_error', { 
//         timeMs: generationTime,
//         error: genError instanceof Error ? genError.message : String(genError),
//         stack: genError instanceof Error ? genError.stack : undefined,
//         apiThrottlerState: monitorApiThrottler()
//       });
      
//       result = {
//         error: genError instanceof Error ? genError.message : String(genError)
//       };
//     }

//     // 最終状態の監視
//     monitorApiThrottler();
    
//     // 総合的なタイミング計測
//     debugInfo.timings = {
//       total: Date.now() - startTime,
//       generation: Date.now() - startGeneration
//     };

//     // タイムアウトした場合のレスポンス
//     if (isTimedOut) {
//       return NextResponse.json({
//         success: false,
//         error: `Operation timed out after ${timeoutSeconds} seconds`,
//         debugInfo
//       }, { status: 408 });
//     }

//     // 結果とデバッグ情報をレスポンス
//     return NextResponse.json({
//       success: true,
//       result,
//       debugInfo
//     }, { status: 200 });
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : String(error);
//     const errorStack = error instanceof Error ? error.stack : undefined;

//     logger.error('Debug literary inspiration generation failed', {
//       error: errorMessage,
//       errorStack,
//       timestamp: new Date().toISOString()
//     });

//     return NextResponse.json({
//       success: false,
//       error: errorMessage,
//       errorStack,
//       debugInfo
//     }, { status: 500 });
//   }
// }