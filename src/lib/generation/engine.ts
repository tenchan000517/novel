// src/lib/generation/engine.ts (依存注入対応版)
import { Chapter } from '@/types/chapters';
import { GenerateChapterRequest, GenerationContext } from '@/types/generation';
import { SystemParameters } from '@/types/parameters';
import { GeminiClient } from './gemini-client';
import { parameterManager } from '@/lib/parameters';
import { logger } from '@/lib/utils/logger';
import { GenerationError } from '@/lib/utils/error-handler';
import { ChapterGenerator } from './engine/chapter-generator';
import { PromptGenerator } from './prompt-generator';
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { setGlobalMemoryManager, initializePlotManager, getPlotManagerStatus } from '@/lib/plot';
import { applicationLifecycleManager } from '@/lib/lifecycle/application-lifecycle-manager';

/**
 * @class NovelGenerationEngine
 * @description 小説生成エンジンのファサードクラス（依存注入対応版）
 */
class NovelGenerationEngine {
  private chapterGenerator: ChapterGenerator;
  private geminiClient: GeminiClient;
  private promptGenerator: PromptGenerator;
  private memoryManager: MemoryManager;

  /**
   * コンストラクタ（依存注入対応版）
   */
  constructor(
    memoryManager: MemoryManager,
    chapterGenerator: ChapterGenerator,
    promptGenerator: PromptGenerator,
    geminiClient: GeminiClient
  ) {
    this.memoryManager = memoryManager;
    this.chapterGenerator = chapterGenerator;
    this.promptGenerator = promptGenerator;
    this.geminiClient = geminiClient;

    // PlotManagerとの統合設定
    this.setupPlotManagerIntegration();

    // パラメータ変更リスナーの設定
    this.setupParameterChangeListener();

    logger.info('NovelGenerationEngine ready for immediate use');
  }

  /**
   * PlotManagerとの統合設定
   */
  private setupPlotManagerIntegration(): void {
    try {
      setGlobalMemoryManager(this.memoryManager);
      initializePlotManager(this.memoryManager);
      logger.info('PlotManager integration completed');
    } catch (error) {
      logger.warn('PlotManager integration failed, continuing without it', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * パラメータ変更リスナーの設定
   */
  private setupParameterChangeListener(): void {
    try {
      parameterManager.onParameterChanged(this.handleParameterChange.bind(this));

      const params = parameterManager.getParameters();
      if (params.generation.models) {
        this.geminiClient.setModelMap(params.generation.models);
        logger.info('Model map initialized from parameters');
      }
    } catch (error) {
      logger.warn('Parameter change listener setup failed', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * パラメータ変更ハンドラ
   */
  private handleParameterChange(path: string, value: any): void {
    if (path.startsWith('generation.') || path === 'all') {
      logger.info(`Generation parameter changed: ${path}`);

      if (path === 'generation.models' || path === 'all') {
        const params = parameterManager.getParameters();
        if (params.generation.models) {
          this.geminiClient.setModelMap(params.generation.models);
          logger.info('Updated model map in GeminiClient');
        }
      }
    }
  }

  /**
   * システム状態情報を取得する
   */
  async checkStatus(): Promise<{
    apiKeyValid: boolean;
    modelInfo: any;
    parameters: SystemParameters;
  }> {
    const apiKeyValid = await this.geminiClient.validateApiKey();
    const modelInfo = this.geminiClient.getModelInfo();
    const parameters = parameterManager.getParameters();

    return {
      apiKeyValid,
      modelInfo,
      parameters
    };
  }

  /**
   * システム状態の診断メソッド
   */
  async checkSystemStatus(): Promise<{
    apiKeyValid: boolean;
    modelInfo: any;
    parameters: SystemParameters;
    plotManagerStatus?: any;
  }> {
    const apiKeyValid = await this.geminiClient.validateApiKey();
    const modelInfo = this.geminiClient.getModelInfo();
    const parameters = parameterManager.getParameters();
    const plotManagerStatus = getPlotManagerStatus();

    return {
      apiKeyValid,
      modelInfo,
      parameters,
      plotManagerStatus
    };
  }

  /**
   * 詳細な初期化状態確認
   */
  async performDetailedStatusCheck(): Promise<{
    engineInitialized: boolean;
    memoryManagerReady: boolean;
    plotManagerReady: boolean;
    chapterGeneratorReady: boolean;
    recommendations: string[];
  }> {
    const recommendations: string[] = [];

    let memoryManagerReady = false;
    try {
      const memoryStatus = await this.memoryManager.getSystemStatus();
      memoryManagerReady = memoryStatus.initialized;
      if (!memoryManagerReady) {
        recommendations.push('MemoryManager requires initialization');
      }
    } catch (error) {
      recommendations.push('MemoryManager status check failed');
    }

    const plotStatus = getPlotManagerStatus();
    const plotManagerReady = plotStatus.isInitialized;
    if (!plotManagerReady) {
      recommendations.push('PlotManager requires initialization');
      if (!plotStatus.hasGlobalMemoryManager) {
        recommendations.push('PlotManager missing MemoryManager dependency');
      }
    }

    return {
      engineInitialized: true,
      memoryManagerReady,
      plotManagerReady,
      chapterGeneratorReady: true,
      recommendations
    };
  }

  /**
   * チャプターの生成
   */
  async generateChapter(
    chapterNumber: number,
    options?: GenerateChapterRequest
  ): Promise<Chapter> {
    try {
      return await this.chapterGenerator.generate(chapterNumber, options);
    } catch (error) {
      logger.error(`Failed to generate chapter ${chapterNumber} in NovelGenerationEngine`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      throw new GenerationError(
        `Chapter ${chapterNumber} generation failed: ${error instanceof Error ? error.message : String(error)}`,
        'CHAPTER_GENERATION_FAILED'
      );
    }
  }

  /**
   * パラメータ更新
   */
  updateParameter(path: string, value: any): void {
    parameterManager.updateParameter(path, value);
  }

  /**
   * プリセット適用
   */
  applyPreset(presetName: string): boolean {
    return parameterManager.applyPreset(presetName);
  }
}

// === ServiceContainer統合 ===

/**
 * ApplicationLifecycleManagerを使ったNovelGenerationEngineの遅延初期化
 */
let generationEngineInstance: NovelGenerationEngine | null = null;

/**
 * ServiceContainerからNovelGenerationEngineのインスタンスを取得
 * 初回呼び出し時にApplicationLifecycleManagerを初期化
 */
async function getGenerationEngineInstance(): Promise<NovelGenerationEngine> {
  if (!generationEngineInstance) {
    logger.info('Initializing NovelGenerationEngine through ServiceContainer');
    
    try {
      // ApplicationLifecycleManagerの初期化を確実に実行
      await applicationLifecycleManager.initialize();
      
      // ServiceContainerからインスタンスを取得
      const serviceContainer = applicationLifecycleManager.getServiceContainer();
      generationEngineInstance = await serviceContainer.resolve<NovelGenerationEngine>('novelGenerationEngine');
      
      logger.info('NovelGenerationEngine successfully initialized through ServiceContainer');
    } catch (error) {
      logger.error('Failed to initialize NovelGenerationEngine through ServiceContainer', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
  
  return generationEngineInstance;
}

/**
 * NovelGenerationEngineのプロキシオブジェクト
 * ServiceContainerを使った遅延初期化パターンを実装
 */
export const generationEngine = {
  /**
   * チャプター生成（ServiceContainer経由）
   */
  async generateChapter(chapterNumber: number, options?: GenerateChapterRequest): Promise<Chapter> {
    const engine = await getGenerationEngineInstance();
    return engine.generateChapter(chapterNumber, options);
  },

  /**
   * システム状態確認（ServiceContainer経由）
   */
  async checkStatus(): Promise<{
    apiKeyValid: boolean;
    modelInfo: any;
    parameters: SystemParameters;
  }> {
    const engine = await getGenerationEngineInstance();
    return engine.checkStatus();
  },

  /**
   * システム状態の詳細診断（ServiceContainer経由）
   */
  async checkSystemStatus(): Promise<{
    apiKeyValid: boolean;
    modelInfo: any;
    parameters: SystemParameters;
    plotManagerStatus?: any;
  }> {
    const engine = await getGenerationEngineInstance();
    return engine.checkSystemStatus();
  },

  /**
   * 詳細な初期化状態確認（ServiceContainer経由）
   */
  async performDetailedStatusCheck(): Promise<{
    engineInitialized: boolean;
    memoryManagerReady: boolean;
    plotManagerReady: boolean;
    chapterGeneratorReady: boolean;
    recommendations: string[];
  }> {
    const engine = await getGenerationEngineInstance();
    return engine.performDetailedStatusCheck();
  },

  /**
   * パラメータ更新（ServiceContainer経由）
   */
  async updateParameter(path: string, value: any): Promise<void> {
    const engine = await getGenerationEngineInstance();
    engine.updateParameter(path, value);
  },

  /**
   * プリセット適用（ServiceContainer経由）
   */
  async applyPreset(presetName: string): Promise<boolean> {
    const engine = await getGenerationEngineInstance();
    return engine.applyPreset(presetName);
  }
};

// クラス定義もエクスポート（既存コードとの互換性のため）
export { NovelGenerationEngine };