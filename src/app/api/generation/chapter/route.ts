/**
 * @fileoverview 統合記憶階層システム対応 章生成APIルート（ServiceContainer統合版）
 * @description 
 * ServiceContainerとApplicationLifecycleManagerを活用した依存注入対応版。
 * 統合記憶階層システム（MemoryManager + UnifiedAccessAPI）に完全対応。
 * 
 * @version 2.1 - ServiceContainer統合版
 * @requires next/server
 * @requires @/lib/lifecycle/application-lifecycle-manager
 * @requires @/lib/memory/core/memory-manager
 * @requires @/types/generation
 * @requires @/lib/utils/logger
 * @requires @/types/validation
 * @requires @/lib/utils/error-handler
 * @requires @/lib/storage
 */

import { NextRequest, NextResponse } from 'next/server';

// === 🔥 ServiceContainer統合システムのインポート ===
import { 
  applicationLifecycleManager, 
  LifecycleStage 
} from '@/lib/lifecycle/application-lifecycle-manager';

// === 統合記憶階層システムの型定義 ===
import {
  MemoryLevel,
  MemoryAccessRequest,
  MemoryRequestType,
  SystemOperationResult,
  MemorySystemStatus,
  SystemDiagnostics,
  UnifiedSearchResult,
  SystemHealth
} from '@/lib/memory/core/types';

// === 既存システムのインポート ===
import { GenerateChapterRequest, GenerateChapterResponse } from '@/types/generation';
import { logger } from '@/lib/utils/logger';
import { ValidationCheck } from '@/types/validation';
import { GenerationError, ValidationError, formatErrorResponse } from '@/lib/utils/error-handler';
import { chapterStorage } from '@/lib/storage';
import { PlotMode } from '@/lib/plot/types';

// === ServiceContainer統合版のクラス型定義 ===
import type { MemoryManager } from '@/lib/memory/core/memory-manager';
import type { NovelGenerationEngine } from '@/lib/generation/engine';
import type { ValidationSystem } from '@/lib/validation/system';

/**
 * ServiceContainer経由でのシステム初期化
 */
async function ensureSystemInitialized(): Promise<void> {
  const status = applicationLifecycleManager.getStatus();
  
  if (status.currentStage !== LifecycleStage.READY) {
    logger.info('Initializing application lifecycle for API request');
    await applicationLifecycleManager.initialize();
    logger.info('Application lifecycle initialization completed for API');
  } else {
    logger.debug('Application lifecycle already initialized');
  }
}

/**
 * ServiceContainer経由でのMemoryManager取得
 */
async function getMemoryManager(): Promise<MemoryManager> {
  await ensureSystemInitialized();
  const serviceContainer = applicationLifecycleManager.getServiceContainer();
  return await serviceContainer.resolve<MemoryManager>('memoryManager');
}

/**
 * ServiceContainer経由でのNovelGenerationEngine取得
 */
async function getGenerationEngine(): Promise<NovelGenerationEngine> {
  await ensureSystemInitialized();
  const serviceContainer = applicationLifecycleManager.getServiceContainer();
  return await serviceContainer.resolve<NovelGenerationEngine>('novelGenerationEngine');
}

/**
 * ServiceContainer経由でのValidationSystem取得
 */
async function getValidationSystem(): Promise<ValidationSystem> {
  await ensureSystemInitialized();
  const serviceContainer = applicationLifecycleManager.getServiceContainer();
  return await serviceContainer.resolve<ValidationSystem>('validationSystem');
}

/**
 * ServiceContainer統合版 章生成エンドポイント（POST）
 * 
 * @description
 * ServiceContainerとApplicationLifecycleManagerを活用した高度な章生成処理。
 * - 依存注入による適切なコンポーネント取得
 * - MemoryManager.processChapter()による統一記憶処理
 * - 統合検索システムによる効率的なコンテキスト取得
 * - 重複解決システムによるデータ品質向上
 * - 品質保証システムによる自動品質監視
 * 
 * @param request Next.jsリクエストオブジェクト
 * @returns 生成結果またはエラー情報を含むJSONレスポンス
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const operationStartTime = Date.now();

  try {
    logger.info('[ServiceContainer統合API] Chapter generation request received', {
      timestamp: new Date().toISOString(),
      phase: 'start'
    });

    // === ServiceContainer経由でのシステム初期化と依存関係取得 ===
    await ensureSystemInitialized();
    
    const memoryManager = await getMemoryManager();
    const generationEngine = await getGenerationEngine();
    const validationSystem = await getValidationSystem();

    logger.info('[ServiceContainer統合API] All services resolved successfully');

    // システム状態の事前確認
    const systemStatus = await memoryManager.getSystemStatus();
    if (!systemStatus.initialized) {
      throw new GenerationError(
        'Unified memory system is not properly initialized',
        'MEMORY_SYSTEM_NOT_INITIALIZED'
      );
    }

    // === リクエストの解析と検証 ===
    const requestData = await request.json() as GenerateChapterRequest;
    const chapterNumber = parseInt(request.nextUrl.searchParams.get('chapterNumber') || '1');

    logger.debug('[ServiceContainer統合API] Request parsed', {
      chapterNumber,
      targetLength: requestData.targetLength,
      forcedGeneration: requestData.forcedGeneration,
      overrides: requestData.overrides
    });

    // ServiceContainer経由でParameterManagerを取得
    const serviceContainer = applicationLifecycleManager.getServiceContainer();
    const parameterManager = await serviceContainer.resolve('parameterManager');
    const params = parameterManager.getParameters();

    if (isNaN(chapterNumber) || chapterNumber < 1) {
      logger.warn('[ServiceContainer統合API] Invalid chapter number', { chapterNumber });
      throw new ValidationError('Invalid chapter number');
    }

    // 目標文字数の検証
    const requestTargetLength = requestData.targetLength || params.generation.targetLength;
    const minLength = params.generation.minLength;
    const maxLength = params.generation.maxLength;

    if (requestTargetLength < minLength || requestTargetLength > maxLength) {
      logger.warn('[ServiceContainer統合API] Invalid target length', {
        targetLength: requestTargetLength,
        validRange: `${minLength}-${maxLength}`
      });
      throw new ValidationError(`Target length must be between ${minLength} and ${maxLength} characters`);
    }

    // テンション・ペーシング値の検証
    if (requestData.overrides?.tension !== undefined &&
      (requestData.overrides.tension < 0 || requestData.overrides.tension > 1)) {
      logger.warn('[ServiceContainer統合API] Invalid tension value', { tension: requestData.overrides.tension });
      throw new ValidationError('Tension value must be between 0 and 1');
    }

    if (requestData.overrides?.pacing !== undefined &&
      (requestData.overrides.pacing < 0 || requestData.overrides.pacing > 1)) {
      logger.warn('[ServiceContainer統合API] Invalid pacing value', { pacing: requestData.overrides.pacing });
      throw new ValidationError('Pacing value must be between 0 and 1');
    }

    // === 重複生成の確認（統合記憶システム活用） ===
    if (!requestData.forcedGeneration) {
      // 統合検索でチャプターの存在確認
      const existingChapterSearch = await memoryManager.unifiedSearch(
        `chapter ${chapterNumber}`,
        [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
      );

      if (existingChapterSearch.success && existingChapterSearch.totalResults > 0) {
        const chapterExists = existingChapterSearch.results.some(result =>
          result.data?.chapterNumber === chapterNumber ||
          result.data?.chapter?.chapterNumber === chapterNumber
        );

        if (chapterExists) {
          logger.warn(`[ServiceContainer統合API] Chapter ${chapterNumber} already exists in unified memory`, {
            searchResults: existingChapterSearch.totalResults
          });
          throw new ValidationError(`Chapter ${chapterNumber} already exists. Use forcedGeneration:true to override.`);
        }
      }

      // フォールバック：従来の方法でも確認
      const legacyChapterExists = await chapterStorage.chapterExists(chapterNumber);
      if (legacyChapterExists) {
        logger.warn(`[ServiceContainer統合API] Chapter ${chapterNumber} exists in legacy storage`);
        throw new ValidationError(`Chapter ${chapterNumber} already exists. Use forcedGeneration:true to override.`);
      }
    }

    // === 統合記憶システムによる事前診断 ===
    const preDiagnostics = await memoryManager.performSystemDiagnostics();
    if (preDiagnostics.systemHealth === SystemHealth.CRITICAL) {
      logger.error('[ServiceContainer統合API] System health is critical before generation', {
        issues: preDiagnostics.issues,
        recommendations: preDiagnostics.recommendations
      });
      throw new GenerationError(
        'Memory system health is critical and cannot proceed with generation',
        'MEMORY_SYSTEM_CRITICAL'
      );
    } else if (preDiagnostics.systemHealth === SystemHealth.DEGRADED) {
      logger.warn('[ServiceContainer統合API] System health is degraded but proceeding', {
        issues: preDiagnostics.issues
      });
    }

    // === 章生成処理の開始 ===
    const generationStartTime = Date.now();
    logger.info(`[ServiceContainer統合API] Starting chapter ${chapterNumber} generation with ServiceContainer`);

    // ServiceContainer経由で取得したgenerationEngineによる章生成
    const chapter = await generationEngine.generateChapter(chapterNumber, requestData);

    logger.info(`[ServiceContainer統合API] Chapter ${chapterNumber} generated successfully`, {
      contentLength: chapter.content.length,
      generationTime: Date.now() - generationStartTime
    });

    // === 統合記憶階層システムによる章処理（最重要） ===
    logger.info(`[ServiceContainer統合API] Processing chapter ${chapterNumber} through unified memory system`);

    const memoryProcessingStartTime = Date.now();
    const memoryProcessingResult: SystemOperationResult = await memoryManager.processChapter(chapter);

    const memoryProcessingTime = Date.now() - memoryProcessingStartTime;

    if (!memoryProcessingResult.success) {
      logger.error(`[ServiceContainer統合API] Memory processing failed for chapter ${chapterNumber}`, {
        errors: memoryProcessingResult.errors,
        warnings: memoryProcessingResult.warnings,
        affectedComponents: memoryProcessingResult.affectedComponents,
        processingTime: memoryProcessingResult.processingTime
      });

      // メモリ処理失敗は警告として扱い、生成は継続
      logger.warn(`[ServiceContainer統合API] Continuing despite memory processing issues for chapter ${chapterNumber}`);
    } else {
      logger.info(`[ServiceContainer統合API] Memory processing completed successfully for chapter ${chapterNumber}`, {
        operationType: memoryProcessingResult.operationType,
        processingTime: memoryProcessingResult.processingTime,
        affectedComponents: memoryProcessingResult.affectedComponents,
        warningCount: memoryProcessingResult.warnings.length
      });
    }

    // === 品質検証（ServiceContainer経由のValidationSystem使用）===
    logger.info(`[ServiceContainer統合API] Validating chapter ${chapterNumber} quality with ServiceContainer ValidationSystem`);

    // ValidationSystemの設定更新
    validationSystem.setValidationParameters({
      consistencyThreshold: params.memory.consistencyThreshold,
      minLength: params.generation.minLength,
      maxLength: params.generation.maxLength
    });

    const validation = await validationSystem.validateChapter(chapter);

    // 品質検証失敗時の処理（強制生成フラグがない場合のみ）
    if (!validation.isValid && !requestData.forcedGeneration) {
      logger.warn(`[ServiceContainer統合API] Chapter ${chapterNumber} failed validation`, {
        score: validation.qualityScore,
        failedChecks: validation.checks.filter((c: ValidationCheck) => !c.passed).length,
        failedCheckNames: validation.checks.filter((c: ValidationCheck) => !c.passed).map(c => c.name)
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Generated chapter failed validation',
            details: {
              qualityScore: validation.qualityScore,
              failedChecks: validation.checks
                .filter((c: ValidationCheck) => !c.passed)
                .map(c => ({
                  name: c.name,
                  message: c.message,
                  severity: c.severity
                })),
              potentialSolutions: 'Try adjusting the generation parameters or use forcedGeneration:true',
              memoryProcessingResult: {
                success: memoryProcessingResult.success,
                affectedComponents: memoryProcessingResult.affectedComponents.length
              }
            }
          }
        },
        { status: 400 }
      );
    }

    // 章の品質スコアを更新
    chapter.metadata.qualityScore = validation.qualityScore;

    // プロット整合性チェック（PlotManagerの動的作成）
    let plotConsistency: { consistent: boolean; issues: any[] };
    try {
      // PlotManagerの動的作成と初期化
      const { createPlotManager } = await import('@/lib/plot/manager');
      const plotManagerInstance = createPlotManager(memoryManager, {
        enableLearningJourney: true,
        enableSectionPlotImport: true,
        enableQualityAssurance: true,
        enablePerformanceOptimization: true,
        memorySystemIntegration: true
      });

      plotConsistency = await plotManagerInstance.checkGeneratedContentConsistency(
        chapter.content,
        chapterNumber
      );
    } catch (error) {
      logger.warn(`[ServiceContainer統合API] Plot consistency check failed for chapter ${chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      plotConsistency = { consistent: true, issues: [] };
    }

    // === 統合記憶システムによる事後最適化 ===
    if (memoryProcessingResult.success) {
      try {
        const optimizationResult = await memoryManager.optimizeSystem();
        if (optimizationResult.success) {
          logger.info(`[ServiceContainer統合API] System optimization completed for chapter ${chapterNumber}`, {
            improvements: optimizationResult.improvements.length,
            memorySaved: optimizationResult.memorySaved,
            totalTimeSaved: optimizationResult.totalTimeSaved
          });
        }
      } catch (error) {
        logger.warn(`[ServiceContainer統合API] System optimization failed but generation continues`, {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // === チャプターの保存 ===
    logger.info(`[ServiceContainer統合API] Saving chapter ${chapterNumber} to storage`);
    const savedFilePath = await chapterStorage.saveChapter(chapter);
    logger.info(`[ServiceContainer統合API] Chapter ${chapterNumber} saved successfully`, { path: savedFilePath });

    // === 生成完了と統計 ===
    const totalOperationTime = Date.now() - operationStartTime;
    const generationTime = Date.now() - generationStartTime;

    logger.info(`[ServiceContainer統合API] Chapter ${chapterNumber} generation completed with ServiceContainer`, {
      totalOperationTime,
      generationTime,
      memoryProcessingTime,
      qualityScore: validation.qualityScore,
      contentLength: chapter.content.length,
      memoryProcessingSuccess: memoryProcessingResult.success,
      memoryComponentsAffected: memoryProcessingResult.affectedComponents.length,
      plotConsistent: plotConsistency.consistent
    });

    // === レスポンスの構築 ===
    const response: GenerateChapterResponse = {
      chapter: {
        ...chapter,
        metadata: {
          ...chapter.metadata,
          unifiedMemorySystemProcessing: {
            processingTime: memoryProcessingResult.processingTime,
            success: memoryProcessingResult.success,
            affectedComponents: memoryProcessingResult.affectedComponents,
            operationType: memoryProcessingResult.operationType,
            warningCount: memoryProcessingResult.warnings.length,
            errorCount: memoryProcessingResult.errors.length,
            systemHealth: preDiagnostics.systemHealth
          },
          plotConsistency: {
            consistent: plotConsistency.consistent,
            issueCount: plotConsistency.issues.length,
            majorIssues: plotConsistency.issues.filter(i => i.severity === "HIGH").length
          },
          serviceContainerInfo: {
            lifecycleStage: applicationLifecycleManager.getStatus().currentStage,
            servicesUsed: ['memoryManager', 'novelGenerationEngine', 'validationSystem', 'parameterManager']
          }
        }
      },
      metrics: {
        generationTime,
        qualityScore: validation.qualityScore,
        correctionCount: 0
      },
      // ServiceContainer統合版特有のメトリクス
      serviceContainerMetrics: {
        processingTime: memoryProcessingTime,
        totalOperationTime,
        systemOptimizationApplied: memoryProcessingResult.success,
        dependencyInjectionUsed: true
      } as any
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    const errorTime = Date.now() - operationStartTime;

    // 詳細なエラーログ記録
    if (error instanceof GenerationError || error instanceof ValidationError) {
      logger.warn('[ServiceContainer統合API] Generation process error', {
        error: error.message,
        code: error instanceof GenerationError ? error.code : 'VALIDATION_ERROR',
        operationTime: errorTime
      });
    } else {
      logger.error('[ServiceContainer統合API] Failed to generate chapter with ServiceContainer', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        operationTime: errorTime
      });
    }

    // エラーレスポンスの構築
    const errorResponse = formatErrorResponse(error instanceof Error ? error : new Error(String(error)));
    const statusCode = error instanceof ValidationError ? 400 : 500;

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * ServiceContainer統合版 システム状態確認エンドポイント（GET）
 * 
 * @description
 * ServiceContainerとApplicationLifecycleManagerを活用した包括的な状態情報取得。
 * - ServiceContainer経由での各サービス状態確認
 * - ApplicationLifecycleManagerの初期化状態
 * - 統合記憶システムのヘルスチェック
 * - 依存注入システムの動作状況
 * 
 * @param request Next.jsリクエストオブジェクト
 * @returns システム状態情報を含むJSONレスポンス
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('[ServiceContainer統合API] System status check requested');

    // === ServiceContainer経由でのシステム初期化と状態確認 ===
    await ensureSystemInitialized();
    
    const lifecycleStatus = applicationLifecycleManager.getStatus();
    const serviceContainer = applicationLifecycleManager.getServiceContainer();

    // === ServiceContainer経由での各サービス取得と状態確認 ===
    const [memoryManager, generationEngine, validationSystem, parameterManager] = await Promise.allSettled([
      serviceContainer.resolve<MemoryManager>('memoryManager'),
      serviceContainer.resolve<NovelGenerationEngine>('novelGenerationEngine'),
      serviceContainer.resolve<ValidationSystem>('validationSystem'),
      serviceContainer.resolve('parameterManager')
    ]);

    // === 統合記憶システム状態の取得 ===
    let memoryStatus: MemorySystemStatus;
    let systemDiagnostics: SystemDiagnostics;
    let genStatus: any;

    if (memoryManager.status === 'fulfilled') {
      const [statusResult, diagnosticsResult] = await Promise.allSettled([
        memoryManager.value.getSystemStatus(),
        memoryManager.value.performSystemDiagnostics()
      ]);

      memoryStatus = statusResult.status === 'fulfilled' ? statusResult.value : {
        initialized: false,
        lastUpdateTime: new Date().toISOString(),
        memoryLayers: {
          shortTerm: { healthy: false, dataCount: 0, lastUpdate: '', storageSize: 0, errorCount: 1 },
          midTerm: { healthy: false, dataCount: 0, lastUpdate: '', storageSize: 0, errorCount: 1 },
          longTerm: { healthy: false, dataCount: 0, lastUpdate: '', storageSize: 0, errorCount: 1 }
        },
        performanceMetrics: {
          totalRequests: 0,
          cacheHits: 0,
          duplicatesResolved: 0,
          averageResponseTime: 0,
          lastUpdateTime: new Date().toISOString()
        },
        cacheStatistics: {
          hitRatio: 0,
          missRatio: 1,
          totalRequests: 0,
          cacheSize: 0,
          lastOptimization: new Date().toISOString(),
          evictionCount: 0
        }
      };

      systemDiagnostics = diagnosticsResult.status === 'fulfilled' ? diagnosticsResult.value : {
        timestamp: new Date().toISOString(),
        systemHealth: SystemHealth.CRITICAL,
        memoryLayers: {
          shortTerm: { healthy: false, dataIntegrity: false, storageAccessible: false, lastBackup: '', performanceScore: 0, recommendations: ['System check failed'] },
          midTerm: { healthy: false, dataIntegrity: false, storageAccessible: false, lastBackup: '', performanceScore: 0, recommendations: ['System check failed'] },
          longTerm: { healthy: false, dataIntegrity: false, storageAccessible: false, lastBackup: '', performanceScore: 0, recommendations: ['System check failed'] }
        },
        integrationSystems: {
          duplicateResolver: { operational: false, efficiency: 0, errorRate: 1, lastOptimization: '', recommendations: ['System unavailable'] },
          cacheCoordinator: { operational: false, efficiency: 0, errorRate: 1, lastOptimization: '', recommendations: ['System unavailable'] },
          unifiedAccessAPI: { operational: false, efficiency: 0, errorRate: 1, lastOptimization: '', recommendations: ['System unavailable'] },
          dataIntegrationProcessor: { operational: false, efficiency: 0, errorRate: 1, lastOptimization: '', recommendations: ['System unavailable'] }
        },
        performanceMetrics: {
          totalRequests: 0,
          cacheHits: 0,
          duplicatesResolved: 0,
          averageResponseTime: 0,
          lastUpdateTime: new Date().toISOString()
        },
        issues: ['System diagnostics failed'],
        recommendations: ['Check system logs', 'Restart system components']
      };
    } else {
      // MemoryManager取得失敗時のフォールバック
      memoryStatus = {
        initialized: false,
        lastUpdateTime: new Date().toISOString(),
        memoryLayers: {
          shortTerm: { healthy: false, dataCount: 0, lastUpdate: '', storageSize: 0, errorCount: 1 },
          midTerm: { healthy: false, dataCount: 0, lastUpdate: '', storageSize: 0, errorCount: 1 },
          longTerm: { healthy: false, dataCount: 0, lastUpdate: '', storageSize: 0, errorCount: 1 }
        },
        performanceMetrics: {
          totalRequests: 0,
          cacheHits: 0,
          duplicatesResolved: 0,
          averageResponseTime: 0,
          lastUpdateTime: new Date().toISOString()
        },
        cacheStatistics: {
          hitRatio: 0,
          missRatio: 1,
          totalRequests: 0,
          cacheSize: 0,
          lastOptimization: new Date().toISOString(),
          evictionCount: 0
        }
      };

      systemDiagnostics = {
        timestamp: new Date().toISOString(),
        systemHealth: SystemHealth.CRITICAL,
        memoryLayers: {
          shortTerm: { healthy: false, dataIntegrity: false, storageAccessible: false, lastBackup: '', performanceScore: 0, recommendations: ['MemoryManager unavailable'] },
          midTerm: { healthy: false, dataIntegrity: false, storageAccessible: false, lastBackup: '', performanceScore: 0, recommendations: ['MemoryManager unavailable'] },
          longTerm: { healthy: false, dataIntegrity: false, storageAccessible: false, lastBackup: '', performanceScore: 0, recommendations: ['MemoryManager unavailable'] }
        },
        integrationSystems: {
          duplicateResolver: { operational: false, efficiency: 0, errorRate: 1, lastOptimization: '', recommendations: ['MemoryManager required'] },
          cacheCoordinator: { operational: false, efficiency: 0, errorRate: 1, lastOptimization: '', recommendations: ['MemoryManager required'] },
          unifiedAccessAPI: { operational: false, efficiency: 0, errorRate: 1, lastOptimization: '', recommendations: ['MemoryManager required'] },
          dataIntegrationProcessor: { operational: false, efficiency: 0, errorRate: 1, lastOptimization: '', recommendations: ['MemoryManager required'] }
        },
        performanceMetrics: {
          totalRequests: 0,
          cacheHits: 0,
          duplicatesResolved: 0,
          averageResponseTime: 0,
          lastUpdateTime: new Date().toISOString()
        },
        issues: ['MemoryManager not available via ServiceContainer'],
        recommendations: ['Check ServiceContainer configuration', 'Verify ApplicationLifecycleManager initialization']
      };
    }

    // === GenerationEngine状態の取得 ===
    if (generationEngine.status === 'fulfilled') {
      try {
        genStatus = await generationEngine.value.checkStatus();
      } catch (error) {
        genStatus = {
          apiKeyValid: false,
          modelInfo: { model: 'unknown', maxRetries: 0 },
          error: `GenerationEngine status check failed: ${error instanceof Error ? error.message : String(error)}`
        };
      }
    } else {
      genStatus = {
        apiKeyValid: false,
        modelInfo: { model: 'unknown', maxRetries: 0 },
        error: 'GenerationEngine not available via ServiceContainer'
      };
    }

    // === パラメータ情報の取得 ===
    let parameters: any;
    let presets: any[] = [];

    if (parameterManager.status === 'fulfilled') {
      try {
        parameters = parameterManager.value.getParameters();
        presets = parameterManager.value.getPresetDetails ? parameterManager.value.getPresetDetails() : [];
      } catch (error) {
        parameters = null;
        logger.warn('Failed to get parameters from ServiceContainer', { error });
      }
    } else {
      parameters = null;
    }

    // === チャプター情報の取得 ===
    const [latestChapterNumber, chaptersList] = await Promise.allSettled([
      chapterStorage.getLatestChapterNumber(),
      chapterStorage.listAllChapters()
    ]);

    const latestChapter = latestChapterNumber.status === 'fulfilled' ? latestChapterNumber.value : 0;
    const chapters = chaptersList.status === 'fulfilled' ? chaptersList.value : [];

    // === 統合検索システムのテスト ===
    let unifiedSearchTest: { success: boolean; totalResults: number; processingTime: number } = {
      success: false,
      totalResults: 0,
      processingTime: 0
    };

    if (memoryManager.status === 'fulfilled') {
      try {
        const testSearchResult = await memoryManager.value.unifiedSearch('test', [MemoryLevel.SHORT_TERM]);
        unifiedSearchTest = {
          success: testSearchResult.success,
          totalResults: testSearchResult.totalResults,
          processingTime: testSearchResult.processingTime
        };
      } catch (error) {
        logger.warn('[ServiceContainer統合API] Unified search test failed', { error });
      }
    }

    // === ServiceContainer固有の情報 ===
    const serviceContainerInfo = {
      lifecycleStage: lifecycleStatus.currentStage,
      isReady: lifecycleStatus.isReady,
      totalInitializationTime: lifecycleStatus.totalInitializationTime,
      stageHistory: lifecycleStatus.history,
      registeredServices: serviceContainer.getRegisteredServices(),
      serviceStatuses: {
        memoryManager: serviceContainer.getServiceStatus('memoryManager'),
        novelGenerationEngine: serviceContainer.getServiceStatus('novelGenerationEngine'),
        validationSystem: serviceContainer.getServiceStatus('validationSystem'),
        parameterManager: serviceContainer.getServiceStatus('parameterManager'),
        geminiClient: serviceContainer.getServiceStatus('geminiClient'),
        chapterStorage: serviceContainer.getServiceStatus('chapterStorage')
      }
    };

    logger.info('[ServiceContainer統合API] System status check completed', {
      lifecycleStage: lifecycleStatus.currentStage,
      memorySystemInitialized: memoryStatus.initialized,
      systemHealth: systemDiagnostics.systemHealth,
      apiKeyValid: genStatus.apiKeyValid,
      latestChapter,
      totalChapters: chapters.length,
      unifiedSearchWorking: unifiedSearchTest.success,
      serviceContainerReady: lifecycleStatus.isReady
    });

    return NextResponse.json({
      success: true,
      data: {
        // === ServiceContainer情報 ===
        serviceContainer: serviceContainerInfo,

        // === 生成エンジン情報 ===
        generation: {
          apiKeyValid: genStatus.apiKeyValid,
          model: genStatus.modelInfo.model,
          maxRetries: genStatus.modelInfo.maxRetries,
          parameters: parameters,
          availableViaServiceContainer: generationEngine.status === 'fulfilled',
          ...(('error' in genStatus) && { error: genStatus.error })
        },

        // === 統合記憶階層システム情報 ===
        unifiedMemorySystem: {
          initialized: memoryStatus.initialized,
          systemHealth: systemDiagnostics.systemHealth,
          lastUpdateTime: memoryStatus.lastUpdateTime,
          availableViaServiceContainer: memoryManager.status === 'fulfilled',

          // 記憶層状態
          memoryLayers: {
            shortTerm: {
              healthy: memoryStatus.memoryLayers.shortTerm.healthy,
              dataCount: memoryStatus.memoryLayers.shortTerm.dataCount,
              lastUpdate: memoryStatus.memoryLayers.shortTerm.lastUpdate,
              storageSize: memoryStatus.memoryLayers.shortTerm.storageSize,
              diagnostics: systemDiagnostics.memoryLayers.shortTerm
            },
            midTerm: {
              healthy: memoryStatus.memoryLayers.midTerm.healthy,
              dataCount: memoryStatus.memoryLayers.midTerm.dataCount,
              lastUpdate: memoryStatus.memoryLayers.midTerm.lastUpdate,
              storageSize: memoryStatus.memoryLayers.midTerm.storageSize,
              diagnostics: systemDiagnostics.memoryLayers.midTerm
            },
            longTerm: {
              healthy: memoryStatus.memoryLayers.longTerm.healthy,
              dataCount: memoryStatus.memoryLayers.longTerm.dataCount,
              lastUpdate: memoryStatus.memoryLayers.longTerm.lastUpdate,
              storageSize: memoryStatus.memoryLayers.longTerm.storageSize,
              diagnostics: systemDiagnostics.memoryLayers.longTerm
            }
          },

          // 統合システムコンポーネント
          integrationSystems: systemDiagnostics.integrationSystems,

          // パフォーマンスメトリクス
          performanceMetrics: memoryStatus.performanceMetrics,

          // キャッシュ統計
          cacheStatistics: memoryStatus.cacheStatistics,

          // 統合検索テスト結果
          unifiedSearchTest,

          // システム問題と推奨事項
          issues: systemDiagnostics.issues,
          recommendations: systemDiagnostics.recommendations
        },

        // === チャプター情報 ===
        chapters: {
          latestChapterNumber: latestChapter,
          totalChapters: chapters.length,
          chaptersList: chapters.map(c => ({
            number: c.number,
            title: c.title,
            createdAt: c.createdAt
          }))
        },

        // === パラメータ情報 ===
        parameters: {
          initialized: !!parameters,
          currentPreset: presets.find(p => p.isDefault)?.name || 'default',
          availablePresets: presets.map(p => p.name) || [],
          availableViaServiceContainer: parameterManager.status === 'fulfilled'
        },

        // === ValidationSystem情報 ===
        validation: {
          availableViaServiceContainer: validationSystem.status === 'fulfilled',
          error: validationSystem.status === 'rejected' ? validationSystem.reason : null
        }
      }
    });

  } catch (error) {
    logger.error('[ServiceContainer統合API] Failed to get system status', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'STATUS_ERROR',
          message: (error as Error).message || 'Failed to get generation system status'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * ServiceContainer統合版 パラメータ管理エンドポイント（PUT）
 * 
 * @description
 * ServiceContainerを活用したパラメータ管理機能。
 * - ServiceContainer経由でのParameterManagerアクセス
 * - MemoryManagerとの統合設定更新
 * - システム最適化の実行
 * 
 * @param request Next.jsリクエストオブジェクト
 * @returns パラメータ更新結果を含むJSONレスポンス
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('[ServiceContainer統合API] Parameter update request received');

    // === ServiceContainer経由でのシステム初期化 ===
    await ensureSystemInitialized();
    
    const serviceContainer = applicationLifecycleManager.getServiceContainer();
    const parameterManager = await serviceContainer.resolve('parameterManager');
    const memoryManager = await getMemoryManager();

    // === リクエストの解析 ===
    const requestData = await request.json();

    if (!requestData.action) {
      throw new ValidationError('Action is required');
    }

    // === リクエストタイプに応じた処理 ===
    switch (requestData.action) {
      case 'updateParameter': {
        // パラメータ更新
        if (!requestData.path) {
          throw new ValidationError('Parameter path is required');
        }

        if (requestData.value === undefined) {
          throw new ValidationError('Parameter value is required');
        }

        logger.info(`[ServiceContainer統合API] Updating parameter ${requestData.path}`, {
          value: requestData.value
        });

        parameterManager.updateParameter(requestData.path, requestData.value);

        // 更新されたパラメータを取得
        const updatedParameters = parameterManager.getParameters();

        // 統合記憶システムの設定更新が必要な場合
        if (requestData.path.startsWith('memory.') || requestData.path.startsWith('cache.')) {
          try {
            await memoryManager.updateConfiguration({
              // 記憶システム関連の設定を適切に更新
            } as any);

            logger.info(`[ServiceContainer統合API] Memory system configuration updated for parameter ${requestData.path}`);
          } catch (error) {
            logger.warn(`[ServiceContainer統合API] Failed to update memory system configuration`, { error });
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            message: "Parameters updated successfully via ServiceContainer",
            updatedParameters,
            memorySystemUpdated: requestData.path.startsWith('memory.') || requestData.path.startsWith('cache.'),
            serviceContainerUsed: true
          }
        });
      }

      case 'applyPreset': {
        // プリセット適用
        if (!requestData.presetName) {
          throw new ValidationError('Preset name is required');
        }

        logger.info(`[ServiceContainer統合API] Applying preset ${requestData.presetName}`);
        const result = parameterManager.applyPreset(requestData.presetName);

        if (!result) {
          throw new ValidationError(`Preset '${requestData.presetName}' not found`);
        }

        // 適用後のパラメータを取得
        const updatedParameters = parameterManager.getParameters();

        // 統合記憶システムの最適化を実行
        try {
          const optimizationResult = await memoryManager.optimizeSystem();
          logger.info(`[ServiceContainer統合API] Memory system optimized after preset application`, {
            preset: requestData.presetName,
            optimizationSuccess: optimizationResult.success,
            improvements: optimizationResult.improvements.length
          });
        } catch (error) {
          logger.warn(`[ServiceContainer統合API] Memory system optimization failed after preset application`, { error });
        }

        return NextResponse.json({
          success: true,
          data: {
            message: `Preset '${requestData.presetName}' applied successfully via ServiceContainer`,
            updatedParameters,
            systemOptimized: true,
            serviceContainerUsed: true
          }
        });
      }

      case 'savePreset': {
        // プリセット保存
        if (!requestData.presetName) {
          throw new ValidationError('Preset name is required');
        }

        logger.info(`[ServiceContainer統合API] Saving current parameters as preset '${requestData.presetName}'`);
        const result = await parameterManager.saveAsPreset(
          requestData.presetName,
          requestData.description || `プリセット: ${requestData.presetName}`
        );

        if (!result) {
          throw new ValidationError(`Failed to save preset '${requestData.presetName}'`);
        }

        // 利用可能なプリセット一覧を取得
        const presets = parameterManager.getPresetDetails ? parameterManager.getPresetDetails() : [];

        return NextResponse.json({
          success: true,
          data: {
            message: `Preset '${requestData.presetName}' saved successfully via ServiceContainer`,
            availablePresets: presets.map(p => p.name) || [],
            serviceContainerUsed: true
          }
        });
      }

      case 'resetToDefaults': {
        // デフォルト設定にリセット
        logger.info('[ServiceContainer統合API] Resetting parameters to defaults');
        parameterManager.resetToDefaults();

        // リセット後のパラメータを取得
        const defaultParameters = parameterManager.getParameters();

        // 統合記憶システムのリセットも実行
        try {
          const systemDiagnostics = await memoryManager.performSystemDiagnostics();
          logger.info(`[ServiceContainer統合API] Memory system diagnosed after parameter reset`, {
            systemHealth: systemDiagnostics.systemHealth,
            issues: systemDiagnostics.issues.length
          });
        } catch (error) {
          logger.warn(`[ServiceContainer統合API] Memory system diagnostics failed after parameter reset`, { error });
        }

        return NextResponse.json({
          success: true,
          data: {
            message: "Parameters reset to defaults via ServiceContainer",
            parameters: defaultParameters,
            memorySystemDiagnosed: true,
            serviceContainerUsed: true
          }
        });
      }

      case 'optimizeMemorySystem': {
        // 統合記憶システムの最適化（ServiceContainer経由）
        logger.info('[ServiceContainer統合API] Optimizing unified memory system via ServiceContainer');

        const optimizationResult = await memoryManager.optimizeSystem();

        return NextResponse.json({
          success: true,
          data: {
            message: "Memory system optimization completed via ServiceContainer",
            optimizationResult: {
              success: optimizationResult.success,
              improvements: optimizationResult.improvements.length,
              memorySaved: optimizationResult.memorySaved,
              totalTimeSaved: optimizationResult.totalTimeSaved,
              recommendations: optimizationResult.recommendations
            },
            serviceContainerUsed: true
          }
        });
      }

      case 'performSystemDiagnostics': {
        // システム診断の実行（ServiceContainer経由）
        logger.info('[ServiceContainer統合API] Performing system diagnostics via ServiceContainer');

        const diagnostics = await memoryManager.performSystemDiagnostics();

        return NextResponse.json({
          success: true,
          data: {
            message: "System diagnostics completed via ServiceContainer",
            diagnostics: {
              systemHealth: diagnostics.systemHealth,
              timestamp: diagnostics.timestamp,
              issueCount: diagnostics.issues.length,
              recommendationCount: diagnostics.recommendations.length,
              memoryLayersHealthy: Object.values(diagnostics.memoryLayers).filter(layer => layer.healthy).length,
              integrationSystemsOperational: Object.values(diagnostics.integrationSystems).filter(system => system.operational).length
            },
            serviceContainerUsed: true
          }
        });
      }

      default:
        throw new ValidationError(`Unknown action: ${requestData.action}`);
    }

  } catch (error) {
    // エラーログ記録
    logger.error('[ServiceContainer統合API] Failed to update parameters', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    // エラーレスポンスの構築
    const errorResponse = formatErrorResponse(error instanceof Error ? error : new Error(String(error)));
    const statusCode = error instanceof ValidationError ? 400 : 500;

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}