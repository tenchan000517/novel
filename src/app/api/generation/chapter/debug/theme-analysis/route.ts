import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

// 実際の生成フローのコンポーネントをインポート
import { GeminiAdapter } from '@/lib/analysis/adapters/gemini-adapter';
import { MemoryManager } from '@/lib/memory/manager';
import { ThemeAnalysisService } from '@/lib/analysis/services/theme/theme-analysis-service';
import { AnalysisCoordinator } from '@/lib/analysis/coordinators/analysis-coordinator';
import { ContentAnalysisManager } from '@/lib/analysis/content-analysis-manager';
import { PreGenerationPipeline } from '@/lib/analysis/pipelines/pre-generation-pipeline';
import { PostGenerationPipeline } from '@/lib/analysis/pipelines/post-generation-pipeline';
import { OptimizationCoordinator } from '@/lib/analysis/coordinators/optimization-coordinator';
import { storageProvider } from '@/lib/storage';

/**
 * 実際の生成フローでのテーマ分析デバッグAPIエンドポイント
 * POST /api/generation/chapter/debug/theme-analysis
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let debugLogs: Array<{ step: string; timestamp: number; data: any; success: boolean; error?: string }> = [];

  try {
    // リクエストボディの解析
    let requestBody;
    try {
      requestBody = await request.json();
      debugLogs.push({
        step: 'parse_request',
        timestamp: Date.now() - startTime,
        data: { 
          hasContent: !!requestBody.content, 
          contentLength: requestBody.content?.length || 0,
          hasThemes: !!requestBody.themes,
          themesCount: requestBody.themes?.length || 0,
          themes: requestBody.themes
        },
        success: true
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request body',
        debugLogs: [{
          step: 'parse_request',
          timestamp: Date.now() - startTime,
          data: null,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }]
      }, { status: 400 });
    }

    const { content, themes, testMode = 'full_flow' } = requestBody;
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Content is required and must be a string',
        debugLogs
      }, { status: 400 });
    }

    if (!themes || !Array.isArray(themes) || themes.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Themes must be a non-empty array',
        debugLogs
      }, { status: 400 });
    }

    debugLogs.push({
      step: 'validate_input',
      timestamp: Date.now() - startTime,
      data: { 
        contentLength: content.length,
        themesCount: themes.length,
        themes,
        testMode
      },
      success: true
    });

    // テストモードに応じた処理実行
    switch (testMode) {
      case 'direct_service':
        return await testDirectThemeAnalysisService(content, themes, debugLogs, startTime);
      
      case 'analysis_coordinator':
        return await testAnalysisCoordinator(content, themes, debugLogs, startTime);
      
      case 'content_analysis_manager':
        return await testContentAnalysisManager(content, themes, debugLogs, startTime);
      
      case 'full_flow':
      default:
        return await testFullGenerationFlow(content, themes, debugLogs, startTime);
    }

  } catch (error) {
    debugLogs.push({
      step: 'global_error',
      timestamp: Date.now() - startTime,
      data: null,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      debugLogs
    }, { status: 500 });
  }
}

/**
 * ThemeAnalysisServiceを直接テスト
 */
async function testDirectThemeAnalysisService(
  content: string, 
  themes: string[], 
  debugLogs: any[], 
  startTime: number
) {
  try {
    // 依存関係の初期化
    debugLogs.push({
      step: 'init_dependencies',
      timestamp: Date.now() - startTime,
      data: { initializingDependencies: true },
      success: true
    });

    const geminiAdapter = new GeminiAdapter();
    const memoryManager = new MemoryManager();
    
    // MemoryManager初期化
    try {
      await memoryManager.initialize();
      debugLogs.push({
        step: 'init_memory_manager',
        timestamp: Date.now() - startTime,
        data: { initialized: true },
        success: true
      });
    } catch (memoryError) {
      debugLogs.push({
        step: 'init_memory_manager',
        timestamp: Date.now() - startTime,
        data: null,
        success: false,
        error: memoryError instanceof Error ? memoryError.message : String(memoryError)
      });
    }

    // ThemeAnalysisService初期化
    const themeService = new ThemeAnalysisService(geminiAdapter, memoryManager, storageProvider);
    
    debugLogs.push({
      step: 'init_theme_service',
      timestamp: Date.now() - startTime,
      data: { serviceReady: !!themeService },
      success: true
    });

    // analyzeThemeResonance を直接実行
    const analysisStart = Date.now();
    const analysisResult = await themeService.analyzeThemeResonance(content, themes);
    const analysisDuration = Date.now() - analysisStart;
    
    debugLogs.push({
      step: 'direct_theme_analysis',
      timestamp: Date.now() - startTime,
      data: {
        duration: analysisDuration,
        hasResult: !!analysisResult,
        themesAnalyzed: analysisResult?.themes ? Object.keys(analysisResult.themes) : [],
        overallCoherence: analysisResult?.overallCoherence,
        dominantTheme: analysisResult?.dominantTheme,
        resultKeys: analysisResult ? Object.keys(analysisResult) : []
      },
      success: true
    });

    return NextResponse.json({
      success: true,
      testMode: 'direct_service',
      result: {
        analysisResult,
        analysisDuration
      },
      debugLogs,
      executionTime: Date.now() - startTime
    });

  } catch (error) {
    debugLogs.push({
      step: 'direct_theme_analysis',
      timestamp: Date.now() - startTime,
      data: null,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json({
      success: false,
      testMode: 'direct_service',
      error: error instanceof Error ? error.message : String(error),
      debugLogs,
      executionTime: Date.now() - startTime
    }, { status: 500 });
  }
}

/**
 * AnalysisCoordinatorを通してテスト
 */
async function testAnalysisCoordinator(
  content: string, 
  themes: string[], 
  debugLogs: any[], 
  startTime: number
) {
  try {
    // 依存関係の初期化
    const geminiAdapter = new GeminiAdapter();
    const memoryManager = new MemoryManager();
    
    await memoryManager.initialize();
    
    const analysisCoordinator = new AnalysisCoordinator(
      geminiAdapter,
      memoryManager,
      storageProvider
    );

    debugLogs.push({
      step: 'init_analysis_coordinator',
      timestamp: Date.now() - startTime,
      data: { coordinatorReady: !!analysisCoordinator },
      success: true
    });

    // ダミーのGenerationContextを作成
    const mockContext = {
      chapterNumber: 1,
      characters: [],
      tension: 0.5,
      pacing: 0.5,
      theme: themes[0] || '成長',
      genre: 'general' as const
    };

    debugLogs.push({
      step: 'create_mock_context',
      timestamp: Date.now() - startTime,
      data: { context: mockContext },
      success: true
    });

    // AnalysisCoordinator.analyzeChapter を実行
    const coordinatorStart = Date.now();
    const coordinatorResult = await analysisCoordinator.analyzeChapter(content, 1, mockContext);
    const coordinatorDuration = Date.now() - coordinatorStart;

    debugLogs.push({
      step: 'analysis_coordinator_execution',
      timestamp: Date.now() - startTime,
      data: {
        duration: coordinatorDuration,
        hasResult: !!coordinatorResult,
        hasThemeAnalysis: !!coordinatorResult.themeAnalysis,
        themeAnalysisKeys: coordinatorResult.themeAnalysis ? Object.keys(coordinatorResult.themeAnalysis) : [],
        analysisMetadata: coordinatorResult.analysisMetadata
      },
      success: true
    });

    return NextResponse.json({
      success: true,
      testMode: 'analysis_coordinator',
      result: {
        coordinatorResult,
        coordinatorDuration,
        themeAnalysisSpecific: coordinatorResult.themeAnalysis
      },
      debugLogs,
      executionTime: Date.now() - startTime
    });

  } catch (error) {
    debugLogs.push({
      step: 'analysis_coordinator_execution',
      timestamp: Date.now() - startTime,
      data: null,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json({
      success: false,
      testMode: 'analysis_coordinator',
      error: error instanceof Error ? error.message : String(error),
      debugLogs,
      executionTime: Date.now() - startTime
    }, { status: 500 });
  }
}

/**
 * ContentAnalysisManagerを通してテスト
 */
async function testContentAnalysisManager(
  content: string, 
  themes: string[], 
  debugLogs: any[], 
  startTime: number
) {
  try {
    // 依存関係の初期化
    const geminiAdapter = new GeminiAdapter();
    const memoryManager = new MemoryManager();
    
    await memoryManager.initialize();

    const analysisCoordinator = new AnalysisCoordinator(
      geminiAdapter,
      memoryManager,
      storageProvider
    );

    const optimizationCoordinator = new OptimizationCoordinator(
      geminiAdapter,
      null // styleAnalysisService - mockで代用
    );

    const preGenerationPipeline = new PreGenerationPipeline(
      analysisCoordinator,
      optimizationCoordinator
    );

    const postGenerationPipeline = new PostGenerationPipeline(
      analysisCoordinator,
      optimizationCoordinator
    );

    const contentAnalysisManager = new ContentAnalysisManager(
      preGenerationPipeline,
      postGenerationPipeline
    );

    debugLogs.push({
      step: 'init_content_analysis_manager',
      timestamp: Date.now() - startTime,
      data: { managerReady: !!contentAnalysisManager },
      success: true
    });

    // prepareChapterGeneration を実行（Pre-generation pipeline）
    const prepStart = Date.now();
    const prepResult = await contentAnalysisManager.prepareChapterGeneration(2, content);
    const prepDuration = Date.now() - prepStart;

    debugLogs.push({
      step: 'prepare_chapter_generation',
      timestamp: Date.now() - startTime,
      data: {
        duration: prepDuration,
        success: prepResult.success,
        error: prepResult.error,
        suggestionCount: prepResult.enhancements.improvementSuggestions.length,
        themeEnhancementCount: prepResult.enhancements.themeEnhancements.length,
        hasStyleGuidance: !!prepResult.enhancements.styleGuidance
      },
      success: prepResult.success
    });

    // ダミー章を作成してprocessGeneratedChapter を実行（Post-generation pipeline）
    const mockChapter = {
      id: 'test-chapter',
      chapterNumber: 1,
      title: 'テスト章',
      content: content,
      scenes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        wordCount: content.length
      }
    };

    const mockContext = {
      chapterNumber: 1,
      characters: [],
      tension: 0.5,
      pacing: 0.5,
      theme: themes[0] || '成長',
      genre: 'general' as const
    };

    const processStart = Date.now();
    const processResult = await contentAnalysisManager.processGeneratedChapter(mockChapter, mockContext);
    const processDuration = Date.now() - processStart;

    debugLogs.push({
      step: 'process_generated_chapter',
      timestamp: Date.now() - startTime,
      data: {
        duration: processDuration,
        hasComprehensiveAnalysis: !!processResult.comprehensiveAnalysis,
        hasThemeAnalysis: !!processResult.comprehensiveAnalysis?.themeAnalysis,
        qualityScore: processResult.qualityMetrics?.overall,
        nextChapterSuggestionCount: processResult.nextChapterSuggestions.length
      },
      success: true
    });

    return NextResponse.json({
      success: true,
      testMode: 'content_analysis_manager',
      result: {
        preGenerationResult: prepResult,
        postGenerationResult: processResult,
        themeAnalysisFromPost: processResult.comprehensiveAnalysis?.themeAnalysis
      },
      debugLogs,
      executionTime: Date.now() - startTime
    });

  } catch (error) {
    debugLogs.push({
      step: 'content_analysis_manager_execution',
      timestamp: Date.now() - startTime,
      data: null,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json({
      success: false,
      testMode: 'content_analysis_manager',
      error: error instanceof Error ? error.message : String(error),
      debugLogs,
      executionTime: Date.now() - startTime
    }, { status: 500 });
  }
}

/**
 * 完全な生成フローをシミュレート
 */
async function testFullGenerationFlow(
  content: string, 
  themes: string[], 
  debugLogs: any[], 
  startTime: number
) {
  try {
    debugLogs.push({
      step: 'start_full_flow_simulation',
      timestamp: Date.now() - startTime,
      data: { simulatingChapterGeneration: true },
      success: true
    });

    // 1. Direct ThemeAnalysisService test
    const directResult = await testDirectThemeAnalysisService(content, themes, [], startTime);
    
    debugLogs.push({
      step: 'full_flow_direct_service',
      timestamp: Date.now() - startTime,
      data: {
        directSuccess: directResult.status === 200,
        directResult: directResult.status === 200 ? 'success' : 'failed'
      },
      success: directResult.status === 200
    });

    // 2. AnalysisCoordinator test
    const coordinatorResult = await testAnalysisCoordinator(content, themes, [], startTime);
    
    debugLogs.push({
      step: 'full_flow_coordinator',
      timestamp: Date.now() - startTime,
      data: {
        coordinatorSuccess: coordinatorResult.status === 200,
        coordinatorResult: coordinatorResult.status === 200 ? 'success' : 'failed'
      },
      success: coordinatorResult.status === 200
    });

    // 3. ContentAnalysisManager test
    const managerResult = await testContentAnalysisManager(content, themes, [], startTime);
    
    debugLogs.push({
      step: 'full_flow_manager',
      timestamp: Date.now() - startTime,
      data: {
        managerSuccess: managerResult.status === 200,
        managerResult: managerResult.status === 200 ? 'success' : 'failed'
      },
      success: managerResult.status === 200
    });

    // 結果統合
    const flowAnalysis = {
      directService: {
        success: directResult.status === 200,
        result: directResult.status === 200 ? (await directResult.json()).result : null
      },
      analysisCoordinator: {
        success: coordinatorResult.status === 200,
        result: coordinatorResult.status === 200 ? (await coordinatorResult.json()).result : null
      },
      contentAnalysisManager: {
        success: managerResult.status === 200,
        result: managerResult.status === 200 ? (await managerResult.json()).result : null
      }
    };

    debugLogs.push({
      step: 'full_flow_analysis_complete',
      timestamp: Date.now() - startTime,
      data: {
        directServiceWorking: flowAnalysis.directService.success,
        coordinatorWorking: flowAnalysis.analysisCoordinator.success,
        managerWorking: flowAnalysis.contentAnalysisManager.success,
        allWorking: flowAnalysis.directService.success && flowAnalysis.analysisCoordinator.success && flowAnalysis.contentAnalysisManager.success
      },
      success: true
    });

    return NextResponse.json({
      success: true,
      testMode: 'full_flow',
      result: flowAnalysis,
      summary: {
        allComponentsWorking: flowAnalysis.directService.success && flowAnalysis.analysisCoordinator.success && flowAnalysis.contentAnalysisManager.success,
        workingComponents: [
          flowAnalysis.directService.success ? 'ThemeAnalysisService' : null,
          flowAnalysis.analysisCoordinator.success ? 'AnalysisCoordinator' : null,
          flowAnalysis.contentAnalysisManager.success ? 'ContentAnalysisManager' : null
        ].filter(Boolean),
        failingComponents: [
          !flowAnalysis.directService.success ? 'ThemeAnalysisService' : null,
          !flowAnalysis.analysisCoordinator.success ? 'AnalysisCoordinator' : null,
          !flowAnalysis.contentAnalysisManager.success ? 'ContentAnalysisManager' : null
        ].filter(Boolean)
      },
      debugLogs,
      executionTime: Date.now() - startTime
    });

  } catch (error) {
    debugLogs.push({
      step: 'full_flow_error',
      timestamp: Date.now() - startTime,
      data: null,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json({
      success: false,
      testMode: 'full_flow',
      error: error instanceof Error ? error.message : String(error),
      debugLogs,
      executionTime: Date.now() - startTime
    }, { status: 500 });
  }
}

/**
 * GET メソッド - ヘルプ情報を返す
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/generation/chapter/debug/theme-analysis',
    description: '実際の生成フローでのテーマ分析デバッグAPIエンドポイント',
    methods: ['POST'],
    requestBody: {
      content: 'string (required) - 分析対象のテキスト',
      themes: 'string[] (required) - 分析するテーマの配列',
      testMode: 'string (optional) - テストモード'
    },
    testModes: {
      direct_service: 'ThemeAnalysisService.analyzeThemeResonance() を直接テスト',
      analysis_coordinator: 'AnalysisCoordinator経由でのテーマ分析をテスト',
      content_analysis_manager: 'ContentAnalysisManager経由でのテーマ分析をテスト',
      full_flow: '全てのコンポーネントを順次テストして問題箇所を特定'
    },
    example: {
      content: '主人公は困難に立ち向かいながら成長していく物語です。',
      themes: ['成長', '友情', '冒険'],
      testMode: 'full_flow'
    }
  });
}