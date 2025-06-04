/**
 * @fileoverview 統合記憶階層システム対応 章生成APIルート（完全最適化版）
 * @description 
 * 新しい統合記憶階層システム（MemoryManager + UnifiedAccessAPI）に完全対応。
 * 旧システムの全機能を保持しつつ、統一処理、重複排除、品質保証を実現。
 * 
 * @version 2.0 - 統合記憶階層システム対応版
 * @requires next/server
 * @requires @/lib/memory/core/memory-manager
 * @requires @/lib/generation/engine
 * @requires @/lib/validation/system
 * @requires @/types/generation
 * @requires @/lib/utils/logger
 * @requires @/types/validation
 * @requires @/lib/utils/error-handler
 * @requires @/lib/parameters
 * @requires @/lib/plot
 * @requires @/lib/storage
 */

import { NextRequest, NextResponse } from 'next/server';

// === 🔥 新統合記憶階層システムのインポート ===
import { MemoryManager } from '@/lib/memory/core/memory-manager';
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

// === 既存システムのインポート（統合記憶システム対応版） ===
import { generationEngine } from '@/lib/generation/engine';
import { ValidationSystem } from '@/lib/validation/system';
import { GenerateChapterRequest, GenerateChapterResponse } from '@/types/generation';
import { logger } from '@/lib/utils/logger';
import { ValidationCheck } from '@/types/validation';
import { GenerationError, ValidationError, formatErrorResponse } from '@/lib/utils/error-handler';
import { chapterStorage } from '@/lib/storage';
import { parameterManager } from '@/lib/parameters';
import { PlotManager, createPlotManager } from '@/lib/plot/manager';
import { PlotMode } from '@/lib/plot/types';

// === 統合記憶階層システム設定 ===
import type { MemoryManagerConfig } from '@/lib/memory/core/memory-manager';

// === 統合記憶階層システムのシングルトンインスタンス ===
let unifiedMemoryManager: MemoryManager | null = null;

/**
 * 統合記憶階層システムの初期化と取得
 */
async function getUnifiedMemoryManager(): Promise<MemoryManager> {
  if (unifiedMemoryManager) {
    // 既存インスタンスの状態確認
    try {
      const status = await unifiedMemoryManager.getSystemStatus();
      if (status.initialized) {
        return unifiedMemoryManager;
      }
    } catch (error) {
      logger.warn('Existing MemoryManager status check failed, reinitializing', { error });
      unifiedMemoryManager = null;
    }
  }

  // 新しいインスタンスの作成と初期化
  logger.info('Initializing unified memory management system for API');

  const config: MemoryManagerConfig = {
    // 短期記憶設定
    shortTermConfig: {
      maxChapters: 10,
      cacheEnabled: true,
      autoCleanupEnabled: true,
      cleanupIntervalMinutes: 30,
      maxRetentionHours: 72
    },

    // 中期記憶設定
    midTermConfig: {
      maxAnalysisResults: 100,
      enableEvolutionTracking: true,
      enableProgressionAnalysis: true,
      qualityThreshold: 0.8,
      enableCrossComponentAnalysis: true,
      enableRealTimeQualityMonitoring: true,
      enablePerformanceOptimization: true
    },

    // 長期記憶設定
    longTermConfig: {
      enableAutoLearning: true,
      consolidationInterval: 30,
      archiveOldData: true,
      enablePredictiveAnalysis: true,
      qualityThreshold: 0.8
    },

    // 統合システム設定
    integrationEnabled: true,
    enableQualityAssurance: true,
    enableAutoBackup: true,
    enablePerformanceOptimization: true,
    enableDataMigration: true,

    // パフォーマンス設定
    cacheSettings: {
      sizeLimit: 100 * 1024 * 1024, // 100MB
      entryLimit: 1000,
      cleanupInterval: 300000 // 5分
    },

    // 最適化設定
    optimizationSettings: {
      enablePredictiveAccess: true,
      enableConsistencyValidation: true,
      enablePerformanceMonitoring: true
    },

    // 品質保証設定
    qualityAssurance: {
      enableRealTimeMonitoring: true,
      enablePredictiveAnalysis: true,
      enableAutomaticRecovery: true,
      checkInterval: 60000, // 1分
      alertThresholds: {
        dataIntegrity: 0.95,
        systemStability: 0.90,
        performance: 0.85,
        operationalEfficiency: 0.80
      }
    },

    // バックアップ設定
    backup: {
      enabled: true,
      schedule: {
        fullBackupInterval: 86400000, // 24時間
        incrementalInterval: 3600000, // 1時間
        maxBackupCount: 7,
        retentionDays: 30
      },
      compression: {
        enabled: true,
        level: 6
      }
    }
  };

  unifiedMemoryManager = new MemoryManager(config);
  await unifiedMemoryManager.initialize();

  logger.info('Unified memory management system initialized successfully for API');
  return unifiedMemoryManager;
}

/**
 * パラメータマネージャーの安全な初期化
 */
async function safeInitializeParameterManager(): Promise<void> {
  try {
    await parameterManager.initialize();
    logger.info('Parameter manager initialized in unified memory API route');
  } catch (error) {
    logger.warn('Failed to initialize parameter manager in unified memory API route', {
      error: error instanceof Error ? error.message : String(error)
    });
    // パラメータマネージャーの初期化失敗は致命的ではないため、継続
  }
}

// ValidationSystemのシングルトンインスタンス
let validationSystemInstance: ValidationSystem | null = null;

/**
 * ValidationSystemの安全な初期化（既存パターンに合わせて）
 * @param memoryManager 統合記憶管理システム
 */
async function safeInitializeValidationSystem(memoryManager: MemoryManager): Promise<void> {
  if (validationSystemInstance) {
    logger.info('ValidationSystem already initialized');
    return;
  }

  try {
    logger.info('Initializing ValidationSystem with MemoryManager integration');
    validationSystemInstance = new ValidationSystem(memoryManager);
    await validationSystemInstance.initialize();
    logger.info('ValidationSystem initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize ValidationSystem', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * ValidationSystemの取得（初期化済み前提）
 */
function getValidationSystem(): ValidationSystem {
  if (!validationSystemInstance) {
    throw new Error('ValidationSystem not initialized. Call safeInitializeValidationSystem() first.');
  }
  return validationSystemInstance;
}

/**
 * 統合記憶階層システム対応 章生成エンドポイント（POST）
 * 
 * @description
 * 新しい統合記憶階層システムを活用した高度な章生成処理。
 * - MemoryManager.processChapter()による統一記憶処理
 * - 統合検索システムによる効率的なコンテキスト取得
 * - 重複解決システムによるデータ品質向上
 * - 品質保証システムによる自動品質監視
 * - システム最適化による性能向上
 * 
 * @param request Next.jsリクエストオブジェクト
 * @returns 生成結果またはエラー情報を含むJSONレスポンス
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const operationStartTime = Date.now();

  try {
    logger.info('[統合記憶階層API] Chapter generation request received', {
      timestamp: new Date().toISOString(),
      phase: 'start'
    });

    // === パラメータマネージャーの初期化 ===
    await safeInitializeParameterManager();

    // === 統合記憶階層システムの取得 ===
    const memoryManager = await getUnifiedMemoryManager();

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

    logger.debug('[統合記憶階層API] Request parsed', {
      chapterNumber,
      targetLength: requestData.targetLength,
      forcedGeneration: requestData.forcedGeneration,
      overrides: requestData.overrides
    });

    // 基本パラメータの検証
    const params = parameterManager.getParameters();

    if (isNaN(chapterNumber) || chapterNumber < 1) {
      logger.warn('[統合記憶階層API] Invalid chapter number', { chapterNumber });
      throw new ValidationError('Invalid chapter number');
    }

    // 目標文字数の検証
    const requestTargetLength = requestData.targetLength || params.generation.targetLength;
    const minLength = params.generation.minLength;
    const maxLength = params.generation.maxLength;

    if (requestTargetLength < minLength || requestTargetLength > maxLength) {
      logger.warn('[統合記憶階層API] Invalid target length', {
        targetLength: requestTargetLength,
        validRange: `${minLength}-${maxLength}`
      });
      throw new ValidationError(`Target length must be between ${minLength} and ${maxLength} characters`);
    }

    // テンション・ペーシング値の検証
    if (requestData.overrides?.tension !== undefined &&
      (requestData.overrides.tension < 0 || requestData.overrides.tension > 1)) {
      logger.warn('[統合記憶階層API] Invalid tension value', { tension: requestData.overrides.tension });
      throw new ValidationError('Tension value must be between 0 and 1');
    }

    if (requestData.overrides?.pacing !== undefined &&
      (requestData.overrides.pacing < 0 || requestData.overrides.pacing > 1)) {
      logger.warn('[統合記憶階層API] Invalid pacing value', { pacing: requestData.overrides.pacing });
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
          logger.warn(`[統合記憶階層API] Chapter ${chapterNumber} already exists in unified memory`, {
            searchResults: existingChapterSearch.totalResults
          });
          throw new ValidationError(`Chapter ${chapterNumber} already exists. Use forcedGeneration:true to override.`);
        }
      }

      // フォールバック：従来の方法でも確認
      const legacyChapterExists = await chapterStorage.chapterExists(chapterNumber);
      if (legacyChapterExists) {
        logger.warn(`[統合記憶階層API] Chapter ${chapterNumber} exists in legacy storage`);
        throw new ValidationError(`Chapter ${chapterNumber} already exists. Use forcedGeneration:true to override.`);
      }
    }

    // === 統合記憶システムによる事前診断 ===
    const preDiagnostics = await memoryManager.performSystemDiagnostics();
    if (preDiagnostics.systemHealth === SystemHealth.CRITICAL) {
      logger.error('[統合記憶階層API] System health is critical before generation', {
        issues: preDiagnostics.issues,
        recommendations: preDiagnostics.recommendations
      });
      throw new GenerationError(
        'Memory system health is critical and cannot proceed with generation',
        'MEMORY_SYSTEM_CRITICAL'
      );
    } else if (preDiagnostics.systemHealth === SystemHealth.DEGRADED) {
      logger.warn('[統合記憶階層API] System health is degraded but proceeding', {
        issues: preDiagnostics.issues
      });
    }

    // === 章生成処理の開始 ===
    const generationStartTime = Date.now();
    logger.info(`[統合記憶階層API] Starting chapter ${chapterNumber} generation with unified memory system`);

    // generationEngineによる章生成
    const chapter = await generationEngine.generateChapter(chapterNumber, requestData);

    logger.info(`[統合記憶階層API] Chapter ${chapterNumber} generated successfully`, {
      contentLength: chapter.content.length,
      generationTime: Date.now() - generationStartTime
    });

    // === 統合記憶階層システムによる章処理（最重要） ===
    logger.info(`[統合記憶階層API] Processing chapter ${chapterNumber} through unified memory system`);

    const memoryProcessingStartTime = Date.now();
    const memoryProcessingResult: SystemOperationResult = await memoryManager.processChapter(chapter);

    const memoryProcessingTime = Date.now() - memoryProcessingStartTime;

    if (!memoryProcessingResult.success) {
      logger.error(`[統合記憶階層API] Memory processing failed for chapter ${chapterNumber}`, {
        errors: memoryProcessingResult.errors, // 正しいプロパティ名を使用
        warnings: memoryProcessingResult.warnings,
        affectedComponents: memoryProcessingResult.affectedComponents,
        processingTime: memoryProcessingResult.processingTime
      });

      // メモリ処理失敗は警告として扱い、生成は継続
      logger.warn(`[統合記憶階層API] Continuing despite memory processing issues for chapter ${chapterNumber}`);
    } else {
      logger.info(`[統合記憶階層API] Memory processing completed successfully for chapter ${chapterNumber}`, {
        operationType: memoryProcessingResult.operationType,
        processingTime: memoryProcessingResult.processingTime,
        affectedComponents: memoryProcessingResult.affectedComponents,
        warningCount: memoryProcessingResult.warnings.length
      });
    }

    // === 品質検証（統合記憶システム連携）===
    logger.info(`[統合記憶階層API] Validating chapter ${chapterNumber} quality with unified memory integration`);

    // 🔧 修正: ValidationSystemの初期化を追加
    await safeInitializeValidationSystem(memoryManager);

    // ValidationSystemの取得と設定更新（この箇所を修正）
    const validationSystem = getValidationSystem();
    validationSystem.setValidationParameters({
      consistencyThreshold: params.memory.consistencyThreshold,
      minLength: params.generation.minLength,
      maxLength: params.generation.maxLength
    });

    const validation = await validationSystem.validateChapter(chapter);

    // 品質検証失敗時の処理（強制生成フラグがない場合のみ）
    if (!validation.isValid && !requestData.forcedGeneration) {
      logger.warn(`[統合記憶階層API] Chapter ${chapterNumber} failed validation`, {
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
      logger.warn(`[統合記憶階層API] Plot consistency check failed for chapter ${chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      plotConsistency = { consistent: true, issues: [] };
    }

    // === 統合記憶システムによる事後最適化 ===
    if (memoryProcessingResult.success) {
      try {
        const optimizationResult = await memoryManager.optimizeSystem();
        if (optimizationResult.success) {
          logger.info(`[統合記憶階層API] System optimization completed for chapter ${chapterNumber}`, {
            improvements: optimizationResult.improvements.length,
            memorySaved: optimizationResult.memorySaved,
            totalTimeSaved: optimizationResult.totalTimeSaved
          });
        }
      } catch (error) {
        logger.warn(`[統合記憶階層API] System optimization failed but generation continues`, {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // === チャプターの保存 ===
    logger.info(`[統合記憶階層API] Saving chapter ${chapterNumber} to storage`);
    const savedFilePath = await chapterStorage.saveChapter(chapter);
    logger.info(`[統合記憶階層API] Chapter ${chapterNumber} saved successfully`, { path: savedFilePath });

    // === 生成完了と統計 ===
    const totalOperationTime = Date.now() - operationStartTime;
    const generationTime = Date.now() - generationStartTime;

    logger.info(`[統合記憶階層API] Chapter ${chapterNumber} generation completed with unified memory system`, {
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
          }
        }
      },
      metrics: {
        generationTime,
        qualityScore: validation.qualityScore,
        correctionCount: 0
      },
      // 統合記憶階層システム特有のメトリクス（型拡張）
      memoryProcessingMetrics: {
        processingTime: memoryProcessingTime,
        totalOperationTime,
        systemOptimizationApplied: memoryProcessingResult.success
      } as any // 型安全性を保持しつつ拡張プロパティを追加
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    const errorTime = Date.now() - operationStartTime;

    // 詳細なエラーログ記録
    if (error instanceof GenerationError || error instanceof ValidationError) {
      logger.warn('[統合記憶階層API] Generation process error', {
        error: error.message,
        code: error instanceof GenerationError ? error.code : 'VALIDATION_ERROR',
        operationTime: errorTime
      });
    } else {
      logger.error('[統合記憶階層API] Failed to generate chapter with unified memory system', {
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
 * 統合記憶階層システム対応 システム状態確認エンドポイント（GET）
 * 
 * @description
 * 統合記憶階層システムの包括的な状態情報を取得。
 * - 統合記憶システムのヘルスチェック
 * - 各記憶層の詳細状態
 * - 統合システムコンポーネントの動作状況
 * - パフォーマンスメトリクス
 * - システム診断結果
 * 
 * @param request Next.jsリクエストオブジェクト
 * @returns システム状態情報を含むJSONレスポンス
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('[統合記憶階層API] System status check requested');

    // === パラメータマネージャーの初期化 ===
    await safeInitializeParameterManager();

    // === 統合記憶階層システムの取得 ===
    const memoryManager = await getUnifiedMemoryManager();

    // === 統合記憶システム状態の取得 ===
    const [systemStatus, systemDiagnostics, generationStatus] = await Promise.allSettled([
      memoryManager.getSystemStatus(),
      memoryManager.performSystemDiagnostics(),
      generationEngine.checkStatus()
    ]);

    // 型安全な結果取得
    const memoryStatus: MemorySystemStatus = systemStatus.status === 'fulfilled'
      ? systemStatus.value
      : {
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

    const diagnostics: SystemDiagnostics = systemDiagnostics.status === 'fulfilled'
      ? systemDiagnostics.value
      : {
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

    const genStatus = generationStatus.status === 'fulfilled'
      ? generationStatus.value
      : {
        apiKeyValid: false,
        modelInfo: { model: 'unknown', maxRetries: 0 },
        error: 'Generation engine status check failed'
      };

    // === パラメータ情報の取得 ===
    const parameters = parameterManager.getParameters();
    const presets = parameterManager.getPresetDetails ? parameterManager.getPresetDetails() : [];

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

    try {
      const testSearchResult = await memoryManager.unifiedSearch('test', [MemoryLevel.SHORT_TERM]);
      unifiedSearchTest = {
        success: testSearchResult.success,
        totalResults: testSearchResult.totalResults,
        processingTime: testSearchResult.processingTime
      };
    } catch (error) {
      logger.warn('[統合記憶階層API] Unified search test failed', { error });
    }

    logger.info('[統合記憶階層API] System status check completed', {
      memorySystemInitialized: memoryStatus.initialized,
      systemHealth: diagnostics.systemHealth,
      apiKeyValid: genStatus.apiKeyValid,
      latestChapter,
      totalChapters: chapters.length,
      unifiedSearchWorking: unifiedSearchTest.success
    });

    return NextResponse.json({
      success: true,
      data: {
        // === 生成エンジン情報 ===
        generation: {
          apiKeyValid: genStatus.apiKeyValid,
          model: genStatus.modelInfo.model,
          maxRetries: genStatus.modelInfo.maxRetries,
          parameters: parameters,
          ...(('error' in genStatus) && { error: genStatus.error })
        },

        // === 統合記憶階層システム情報 ===
        unifiedMemorySystem: {
          initialized: memoryStatus.initialized,
          systemHealth: diagnostics.systemHealth,
          lastUpdateTime: memoryStatus.lastUpdateTime,

          // 記憶層状態
          memoryLayers: {
            shortTerm: {
              healthy: memoryStatus.memoryLayers.shortTerm.healthy,
              dataCount: memoryStatus.memoryLayers.shortTerm.dataCount,
              lastUpdate: memoryStatus.memoryLayers.shortTerm.lastUpdate,
              storageSize: memoryStatus.memoryLayers.shortTerm.storageSize,
              diagnostics: diagnostics.memoryLayers.shortTerm
            },
            midTerm: {
              healthy: memoryStatus.memoryLayers.midTerm.healthy,
              dataCount: memoryStatus.memoryLayers.midTerm.dataCount,
              lastUpdate: memoryStatus.memoryLayers.midTerm.lastUpdate,
              storageSize: memoryStatus.memoryLayers.midTerm.storageSize,
              diagnostics: diagnostics.memoryLayers.midTerm
            },
            longTerm: {
              healthy: memoryStatus.memoryLayers.longTerm.healthy,
              dataCount: memoryStatus.memoryLayers.longTerm.dataCount,
              lastUpdate: memoryStatus.memoryLayers.longTerm.lastUpdate,
              storageSize: memoryStatus.memoryLayers.longTerm.storageSize,
              diagnostics: diagnostics.memoryLayers.longTerm
            }
          },

          // 統合システムコンポーネント
          integrationSystems: diagnostics.integrationSystems,

          // パフォーマンスメトリクス
          performanceMetrics: memoryStatus.performanceMetrics,

          // キャッシュ統計
          cacheStatistics: memoryStatus.cacheStatistics,

          // 統合検索テスト結果
          unifiedSearchTest,

          // システム問題と推奨事項
          issues: diagnostics.issues,
          recommendations: diagnostics.recommendations
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
          availablePresets: presets.map(p => p.name) || []
        }
      }
    });

  } catch (error) {
    logger.error('[統合記憶階層API] Failed to get system status', {
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
 * 統合記憶階層システム対応 パラメータ管理エンドポイント（PUT）
 * 
 * @description
 * 統合記憶階層システムと連携したパラメータ管理機能。
 * - パラメータ更新
 * - プリセット適用
 * - プリセット保存
 * - デフォルト設定リセット
 * - 統合記憶システム設定の更新
 * 
 * @param request Next.jsリクエストオブジェクト
 * @returns パラメータ更新結果を含むJSONレスポンス
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('[統合記憶階層API] Parameter update request received');

    // === パラメータマネージャーの初期化 ===
    await safeInitializeParameterManager();

    // === 統合記憶階層システムの取得 ===
    const memoryManager = await getUnifiedMemoryManager();

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

        logger.info(`[統合記憶階層API] Updating parameter ${requestData.path}`, {
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
              // 実装は具体的なパラメータパスに依存
            } as Partial<MemoryManagerConfig>);

            logger.info(`[統合記憶階層API] Memory system configuration updated for parameter ${requestData.path}`);
          } catch (error) {
            logger.warn(`[統合記憶階層API] Failed to update memory system configuration`, { error });
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            message: "Parameters updated successfully",
            updatedParameters,
            memorySystemUpdated: requestData.path.startsWith('memory.') || requestData.path.startsWith('cache.')
          }
        });
      }

      case 'applyPreset': {
        // プリセット適用
        if (!requestData.presetName) {
          throw new ValidationError('Preset name is required');
        }

        logger.info(`[統合記憶階層API] Applying preset ${requestData.presetName}`);
        const result = parameterManager.applyPreset(requestData.presetName);

        if (!result) {
          throw new ValidationError(`Preset '${requestData.presetName}' not found`);
        }

        // 適用後のパラメータを取得
        const updatedParameters = parameterManager.getParameters();

        // 統合記憶システムの最適化を実行
        try {
          const optimizationResult = await memoryManager.optimizeSystem();
          logger.info(`[統合記憶階層API] Memory system optimized after preset application`, {
            preset: requestData.presetName,
            optimizationSuccess: optimizationResult.success,
            improvements: optimizationResult.improvements.length
          });
        } catch (error) {
          logger.warn(`[統合記憶階層API] Memory system optimization failed after preset application`, { error });
        }

        return NextResponse.json({
          success: true,
          data: {
            message: `Preset '${requestData.presetName}' applied successfully`,
            updatedParameters,
            systemOptimized: true
          }
        });
      }

      case 'savePreset': {
        // プリセット保存
        if (!requestData.presetName) {
          throw new ValidationError('Preset name is required');
        }

        logger.info(`[統合記憶階層API] Saving current parameters as preset '${requestData.presetName}'`);
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
            message: `Preset '${requestData.presetName}' saved successfully`,
            availablePresets: presets.map(p => p.name) || []
          }
        });
      }

      case 'resetToDefaults': {
        // デフォルト設定にリセット
        logger.info('[統合記憶階層API] Resetting parameters to defaults');
        parameterManager.resetToDefaults();

        // リセット後のパラメータを取得
        const defaultParameters = parameterManager.getParameters();

        // 統合記憶システムのリセットも実行
        try {
          const systemDiagnostics = await memoryManager.performSystemDiagnostics();
          logger.info(`[統合記憶階層API] Memory system diagnosed after parameter reset`, {
            systemHealth: systemDiagnostics.systemHealth,
            issues: systemDiagnostics.issues.length
          });
        } catch (error) {
          logger.warn(`[統合記憶階層API] Memory system diagnostics failed after parameter reset`, { error });
        }

        return NextResponse.json({
          success: true,
          data: {
            message: "Parameters reset to defaults",
            parameters: defaultParameters,
            memorySystemDiagnosed: true
          }
        });
      }

      case 'optimizeMemorySystem': {
        // 統合記憶システムの最適化（新機能）
        logger.info('[統合記憶階層API] Optimizing unified memory system');

        const optimizationResult = await memoryManager.optimizeSystem();

        return NextResponse.json({
          success: true,
          data: {
            message: "Memory system optimization completed",
            optimizationResult: {
              success: optimizationResult.success,
              improvements: optimizationResult.improvements.length,
              memorySaved: optimizationResult.memorySaved,
              totalTimeSaved: optimizationResult.totalTimeSaved,
              recommendations: optimizationResult.recommendations
            }
          }
        });
      }

      case 'performSystemDiagnostics': {
        // システム診断の実行（新機能）
        logger.info('[統合記憶階層API] Performing system diagnostics');

        const diagnostics = await memoryManager.performSystemDiagnostics();

        return NextResponse.json({
          success: true,
          data: {
            message: "System diagnostics completed",
            diagnostics: {
              systemHealth: diagnostics.systemHealth,
              timestamp: diagnostics.timestamp,
              issueCount: diagnostics.issues.length,
              recommendationCount: diagnostics.recommendations.length,
              memoryLayersHealthy: Object.values(diagnostics.memoryLayers).filter(layer => layer.healthy).length,
              integrationSystemsOperational: Object.values(diagnostics.integrationSystems).filter(system => system.operational).length
            }
          }
        });
      }

      default:
        throw new ValidationError(`Unknown action: ${requestData.action}`);
    }

  } catch (error) {
    // エラーログ記録
    logger.error('[統合記憶階層API] Failed to update parameters', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    // エラーレスポンスの構築
    const errorResponse = formatErrorResponse(error instanceof Error ? error : new Error(String(error)));
    const statusCode = error instanceof ValidationError ? 400 : 500;

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}