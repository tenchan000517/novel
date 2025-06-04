/**
 * @fileoverview テスト用プロンプト生成APIエンドポイント
 * @description 実際の章生成フローと同じプロンプトを生成し保存するテスト専用API
 */

import { NextRequest, NextResponse } from 'next/server';

// ServiceContainer統合システム
import { 
  applicationLifecycleManager, 
  LifecycleStage 
} from '@/lib/lifecycle/application-lifecycle-manager';

// 既存システムのインポート
import { GenerateChapterRequest } from '@/types/generation';
import { logger } from '@/lib/utils/logger';
import { ValidationError, GenerationError, formatErrorResponse } from '@/lib/utils/error-handler';
import { promptStorage } from '@/lib/utils/prompt-storage';

// ServiceContainer統合版のクラス型定義
import type { MemoryManager } from '@/lib/memory/core/memory-manager';
import type { NovelGenerationEngine } from '@/lib/generation/engine';
import type { PromptGenerator } from '@/lib/generation/prompt-generator';

// 拡張型定義（ChapterGeneratorと同じ）
interface ExtendedGenerateChapterRequest extends GenerateChapterRequest {
  chapterNumber?: number;
  improvementSuggestions?: string[];
  themeEnhancements?: any[];
  styleGuidance?: any;
  alternativeExpressions?: any;
  literaryInspirations?: any;
  characterPsychology?: any;
  tensionOptimization?: any;
  characters?: Array<{ id: string; name: string; type: string; }>;
}

// タイムアウト設定
const TIMEOUT_CONFIG = {
  CONTEXT_GENERATION: 240000,
  PROMPT_GENERATION: 60000,
  TOTAL_OPERATION: 300000
};

/**
 * ServiceContainer経由でのシステム初期化
 */
async function ensureSystemInitialized(): Promise<void> {
  const status = applicationLifecycleManager.getStatus();
  
  if (status.currentStage !== LifecycleStage.READY) {
    logger.info('Initializing application lifecycle for test prompt API');
    await applicationLifecycleManager.initialize();
    logger.info('Application lifecycle initialization completed for test prompt API');
  } else {
    logger.debug('Application lifecycle already initialized for test prompt API');
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
 * ServiceContainer経由でのPromptGenerator直接取得
 */
async function getPromptGenerator(): Promise<PromptGenerator> {
  await ensureSystemInitialized();
  const serviceContainer = applicationLifecycleManager.getServiceContainer();
  
  // PromptGeneratorは通常ChapterGeneratorの内部で使用されるため、
  // 同じ依存関係で新規作成する
  const memoryManager = await serviceContainer.resolve<MemoryManager>('memoryManager');
  
  // PromptGeneratorの動的作成
  const { PromptGenerator } = await import('@/lib/generation/prompt-generator');
  
  try {
    // 他の依存関係の取得を試行（型安全な方法）
    let worldSettingsManager: any = undefined;
    let plotManager: any = undefined;
    let learningJourneySystem: any = undefined;
    
    try {
      worldSettingsManager = await serviceContainer.resolve('worldSettingsManager');
    } catch (error) {
      logger.debug('worldSettingsManager not available in ServiceContainer');
      worldSettingsManager = undefined;
    }
    
    try {
      plotManager = await serviceContainer.resolve('plotManager');
    } catch (error) {
      logger.debug('plotManager not available in ServiceContainer');
      plotManager = undefined;
    }
    
    try {
      learningJourneySystem = await serviceContainer.resolve('learningJourneySystem');
    } catch (error) {
      logger.debug('learningJourneySystem not available in ServiceContainer');
      learningJourneySystem = undefined;
    }
    
    return new PromptGenerator(
      memoryManager,
      worldSettingsManager,
      plotManager,
      learningJourneySystem
    );
  } catch (error) {
    logger.warn('Some dependencies not available, creating PromptGenerator with minimal dependencies', { error });
    return new PromptGenerator(memoryManager);
  }
}

/**
 * ChapterGeneratorの統合コンテキスト生成ロジックの再現
 */
async function generateTestContext(
  chapterNumber: number,
  options: ExtendedGenerateChapterRequest,
  generationEngine: NovelGenerationEngine
): Promise<any> {
  logger.info(`Generating test context for chapter ${chapterNumber}`);
  
  try {
    // ChapterGeneratorの内部メソッドにアクセスできないため、
    // 類似のコンテキストを構築
    
    // 基本的なGenerationContextの構築
    const basicContext = {
      chapterNumber,
      targetLength: options.targetLength || 8000,
      genre: 'business', // デフォルト
      theme: 'ビジネス成長物語',
      narrativeStyle: '三人称視点',
      tone: '親しみやすく知的',
      worldSettings: '現代の日本のスタートアップ環境',
      characters: options.characters || [],
      plotPoints: [],
      foreshadowing: [],
      storyContext: '起業家の成長物語',
      ...options
    };

    // 統合記憶システムからの情報取得を試行
    const memoryManager = await getMemoryManager();
    
    try {
      const systemStatus = await memoryManager.getSystemStatus();
      if (systemStatus.initialized) {
        // 統合検索による情報取得を試行
        const searchResult = await memoryManager.unifiedSearch(
          `chapter context for ${chapterNumber}`,
          ['SHORT_TERM', 'MID_TERM', 'LONG_TERM'] as any
        );
        
        if (searchResult.success) {
          (basicContext as any).unifiedMemoryData = {
            searchSuccess: searchResult.success,
            totalResults: searchResult.totalResults,
            processingTime: searchResult.processingTime,
            layersAccessed: ['SHORT_TERM', 'MID_TERM', 'LONG_TERM'],
            resultsByLayer: {
              shortTerm: searchResult.results.filter(r => r.source === 'SHORT_TERM').length,
              midTerm: searchResult.results.filter(r => r.source === 'MID_TERM').length,
              longTerm: searchResult.results.filter(r => r.source === 'LONG_TERM').length
            }
          };
          
          logger.info(`Test context enriched with unified memory data for chapter ${chapterNumber}`, {
            totalResults: searchResult.totalResults
          });
        }
      }
    } catch (error) {
      logger.warn(`Failed to enhance test context with unified memory for chapter ${chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // 学習旅程システムとの統合を試行
    try {
      const serviceContainer = applicationLifecycleManager.getServiceContainer();
      let learningJourneySystem;
      
      try {
        learningJourneySystem = await serviceContainer.resolve('learningJourneySystem') as any;
      } catch (error) {
        logger.debug('learningJourneySystem not available in ServiceContainer');
        learningJourneySystem = undefined;
      }
      
      if (learningJourneySystem && typeof learningJourneySystem.isInitialized === 'function' && learningJourneySystem.isInitialized()) {
        const mainConcept = 'ISSUE DRIVEN';
        const learningStage = await learningJourneySystem.concept.determineLearningStage(mainConcept, chapterNumber);
        
        (basicContext as any).learningJourney = {
          mainConcept,
          learningStage,
          embodimentPlan: await learningJourneySystem.concept.getEmbodimentPlan(mainConcept, chapterNumber),
          emotionalArc: await learningJourneySystem.emotion.designEmotionalArc(mainConcept, learningStage, chapterNumber),
          sceneRecommendations: await learningJourneySystem.story.generateSceneRecommendations(mainConcept, learningStage, chapterNumber)
        };
        
        logger.info(`Test context enriched with learning journey for chapter ${chapterNumber}`, {
          concept: mainConcept,
          stage: learningStage
        });
      }
    } catch (error) {
      logger.warn(`Failed to enhance test context with learning journey for chapter ${chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });
    }

    return basicContext;
    
  } catch (error) {
    logger.error(`Failed to generate test context for chapter ${chapterNumber}`, {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * テスト用プロンプト生成エンドポイント（POST）
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const operationStartTime = Date.now();

  try {
    logger.info('[Test Prompt API] Prompt generation test request received', {
      timestamp: new Date().toISOString()
    });

    // === ServiceContainer経由でのシステム初期化と依存関係取得 ===
    await ensureSystemInitialized();
    
    const memoryManager = await getMemoryManager();
    const generationEngine = await getGenerationEngine();
    const promptGenerator = await getPromptGenerator();

    logger.info('[Test Prompt API] All services resolved successfully');

    // システム状態の事前確認
    const systemStatus = await memoryManager.getSystemStatus();
    if (!systemStatus.initialized) {
      throw new GenerationError(
        'Unified memory system is not properly initialized',
        'MEMORY_SYSTEM_NOT_INITIALIZED'
      );
    }

    // === リクエストの解析と検証 ===
    const requestData = await request.json() as ExtendedGenerateChapterRequest;
    const chapterNumber = parseInt(request.nextUrl.searchParams.get('chapterNumber') || requestData.chapterNumber?.toString() || '1');

    logger.debug('[Test Prompt API] Request parsed', {
      chapterNumber,
      targetLength: requestData.targetLength,
      overrides: requestData.overrides
    });

    // ServiceContainer経由でParameterManagerを取得
    const serviceContainer = applicationLifecycleManager.getServiceContainer();
    const parameterManager = await serviceContainer.resolve('parameterManager') as any;
    const params = parameterManager.getParameters();

    if (isNaN(chapterNumber) || chapterNumber < 1) {
      logger.warn('[Test Prompt API] Invalid chapter number', { chapterNumber });
      throw new ValidationError('Invalid chapter number');
    }

    // 目標文字数の検証
    const requestTargetLength = requestData.targetLength || params.generation.targetLength;
    const minLength = params.generation.minLength;
    const maxLength = params.generation.maxLength;

    if (requestTargetLength < minLength || requestTargetLength > maxLength) {
      logger.warn('[Test Prompt API] Invalid target length', {
        targetLength: requestTargetLength,
        validRange: `${minLength}-${maxLength}`
      });
      throw new ValidationError(`Target length must be between ${minLength} and ${maxLength} characters`);
    }

    // === 統合コンテキスト生成（ChapterGeneratorと同じフロー） ===
    logger.info(`[Test Prompt API] Generating unified context for chapter ${chapterNumber}`);

    const contextStartTime = Date.now();
    const testContext = await Promise.race([
      generateTestContext(chapterNumber, requestData, generationEngine),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Context generation timeout')), TIMEOUT_CONFIG.CONTEXT_GENERATION)
      )
    ]);
    const contextGenerationTime = Date.now() - contextStartTime;

    logger.info(`[Test Prompt API] Test context generation completed for chapter ${chapterNumber}`, {
      contextGenerationTime
    });

    // === プロンプト生成（実際のフローと同じ） ===
    logger.info(`[Test Prompt API] Starting prompt generation for chapter ${chapterNumber}`);

    const promptStartTime = Date.now();
    const generatedPrompt = await Promise.race([
      promptGenerator.generate(testContext),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Prompt generation timeout')), TIMEOUT_CONFIG.PROMPT_GENERATION)
      )
    ]) as string;
    const promptGenerationTime = Date.now() - promptStartTime;

    logger.info(`[Test Prompt API] Prompt generation completed for chapter ${chapterNumber}`, {
      promptLength: generatedPrompt.length,
      promptGenerationTime
    });

    // === プロンプトの保存 ===
    logger.info(`[Test Prompt API] Saving generated prompt for chapter ${chapterNumber}`);

    const savedPromptPath = await promptStorage.savePrompt(generatedPrompt, testContext, {
      isTestGeneration: true,
      contextGenerationTime,
      promptGenerationTime,
      totalOperationTime: Date.now() - operationStartTime,
      serviceContainerUsed: true,
      memorySystemOptimized: true,
      testMode: 'prompt-only-generation'
    });

    logger.info(`[Test Prompt API] Prompt saved successfully for chapter ${chapterNumber}`, {
      savedPath: savedPromptPath,
      totalOperationTime: Date.now() - operationStartTime
    });

    // === レスポンスの構築 ===
    return NextResponse.json({
      success: true,
      data: {
        message: `Test prompt generated and saved successfully for chapter ${chapterNumber}`,
        chapterNumber,
        promptInfo: {
          length: generatedPrompt.length,
          savedPath: savedPromptPath,
          filename: savedPromptPath.split('/').pop()
        },
        metrics: {
          contextGenerationTime,
          promptGenerationTime,
          totalOperationTime: Date.now() - operationStartTime
        },
        systemInfo: {
          memorySystemUsed: !!(testContext as any).unifiedMemoryData,
          learningJourneyIntegrated: !!(testContext as any).learningJourney,
          serviceContainerUsed: true
        },
        context: {
          chapterNumber: testContext.chapterNumber,
          targetLength: testContext.targetLength,
          genre: testContext.genre,
          theme: testContext.theme,
          charactersCount: testContext.characters?.length || 0,
          memorySystemStatus: systemStatus.initialized ? 'initialized' : 'not_initialized'
        },
        // テスト用なので実際のプロンプトも含める（デバッグ用）
        ...(process.env.NODE_ENV === 'development' && {
          generatedPrompt: generatedPrompt.substring(0, 1000) + '...' // 先頭1000文字のみ
        })
      }
    });

  } catch (error) {
    const errorTime = Date.now() - operationStartTime;

    // 詳細なエラーログ記録
    if (error instanceof GenerationError || error instanceof ValidationError) {
      logger.warn('[Test Prompt API] Test prompt generation process error', {
        error: error.message,
        code: error instanceof GenerationError ? error.code : 'VALIDATION_ERROR',
        operationTime: errorTime
      });
    } else {
      logger.error('[Test Prompt API] Failed to generate test prompt', {
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
 * 保存されたプロンプト一覧取得エンドポイント（GET）
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('[Test Prompt API] Saved prompts list request received');

    // 保存されたプロンプトファイルの一覧を取得
    const savedPrompts = await promptStorage.listSavedPrompts();

    // クエリパラメータの解析
    const url = new URL(request.url);
    const chapterFilter = url.searchParams.get('chapter');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // フィルタリング
    let filteredPrompts = savedPrompts;
    if (chapterFilter) {
      const chapterNumber = parseInt(chapterFilter);
      if (!isNaN(chapterNumber)) {
        filteredPrompts = savedPrompts.filter(p => p.chapterNumber === chapterNumber);
      }
    }

    // ページネーション
    const totalCount = filteredPrompts.length;
    const paginatedPrompts = filteredPrompts.slice(offset, offset + limit);

    logger.info('[Test Prompt API] Saved prompts list retrieved', {
      totalCount,
      filteredCount: filteredPrompts.length,
      returnedCount: paginatedPrompts.length,
      chapterFilter,
      limit,
      offset
    });

    return NextResponse.json({
      success: true,
      data: {
        prompts: paginatedPrompts.map(prompt => ({
          filename: prompt.filename,
          chapterNumber: prompt.chapterNumber,
          timestamp: prompt.timestamp,
          relativePath: `data/prompts/${prompt.filename}`
        })),
        pagination: {
          total: totalCount,
          filtered: filteredPrompts.length,
          limit,
          offset,
          hasNext: offset + limit < filteredPrompts.length,
          hasPrev: offset > 0
        },
        filters: {
          chapter: chapterFilter
        }
      }
    });

  } catch (error) {
    logger.error('[Test Prompt API] Failed to get saved prompts list', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LIST_ERROR',
          message: (error as Error).message || 'Failed to get saved prompts list'
        }
      },
      { status: 500 }
    );
  }
}