// src/lib/generation/engine.ts
import { Chapter } from '@/types/chapters';
import { GenerateChapterRequest, GenerationContext } from '@/types/generation';
import { SystemParameters } from '@/types/parameters';
import { GeminiClient } from './gemini-client';
import { parameterManager } from '@/lib/parameters';
import { logger } from '@/lib/utils/logger';
import { GenerationError } from '@/lib/utils/error-handler';
import { ChapterGenerator } from './engine/chapter-generator';
import { PromptGenerator } from './prompt-generator'
import { MemoryManager, MemoryManagerConfig } from '@/lib/memory/core/memory-manager'; // 追加
import { setGlobalMemoryManager, initializePlotManager, getPlotManagerStatus } from '@/lib/plot';

/**
 * @class NovelGenerationEngine
 * @description 小説生成エンジンのファサードクラス
 * 
 * @role
 * - 外部からの要求を適切なコンポーネントに委譲する
 * - 各コンポーネント間の連携を調整する
 * - 公開APIを提供する
 */
class NovelGenerationEngine {
  private chapterGenerator: ChapterGenerator;
  private geminiClient: GeminiClient;
  private promptGenerator: PromptGenerator;
  private memoryManager: MemoryManager; // 追加
  // 初期化状態を追跡するためのフラグ
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  /**
   * コンストラクタ
   * 
   * NovelGenerationEngineクラスのインスタンスを初期化します。
   * 内部で使用する各コンポーネントのインスタンスを生成します。
   */
  constructor() {
    this.geminiClient = new GeminiClient();
    this.promptGenerator = new PromptGenerator();

    // MemoryManagerの完全なデフォルト設定
    const memoryConfig: MemoryManagerConfig = {
      shortTermConfig: {
        maxChapters: 10,
        cacheEnabled: true,
        autoCleanupEnabled: false, // 🔥 無限ループ防止のため無効化
        cleanupIntervalMinutes: 60, // 長めに設定
        maxRetentionHours: 24
      },
      midTermConfig: {
        maxAnalysisResults: 100,
        enableEvolutionTracking: true,
        enableProgressionAnalysis: true,
        qualityThreshold: 0.7,
        enableCrossComponentAnalysis: false, // 🔥 開発時は無効
        enableRealTimeQualityMonitoring: false, // 🔥 無限ループ防止のため無効化
        enablePerformanceOptimization: false // 🔥 開発時は無効
      },
      longTermConfig: {
        enableAutoLearning: false, // 🔥 無限ループ防止のため無効化
        consolidationInterval: 3600000, // 1時間（ミリ秒）
        archiveOldData: false, // 開発時は無効
        enablePredictiveAnalysis: false, // 開発時は無効
        qualityThreshold: 0.8
      },
      integrationEnabled: true,
      enableQualityAssurance: true,
      enableAutoBackup: false, // 開発時は無効
      enablePerformanceOptimization: true,
      enableDataMigration: true,
      cacheSettings: {
        sizeLimit: 104857600, // 100MB
        entryLimit: 1000,
        cleanupInterval: 3600000 // 🔥 1時間（無限ループ防止のため長めに設定）
      },
      optimizationSettings: {
        enablePredictiveAccess: false, // 🔥 開発時は無効
        enableConsistencyValidation: false, // 🔥 開発時は無効
        enablePerformanceMonitoring: false // 🔥 開発時は無効
      },
      qualityAssurance: {
        enableRealTimeMonitoring: false, // 🔥 無限ループ防止のため無効化
        enablePredictiveAnalysis: false, // 開発時は無効
        enableAutomaticRecovery: false, // 開発時は無効
        checkInterval: 300000, // 5分（長めに設定）
        alertThresholds: {
          dataIntegrity: 0.9,
          systemStability: 0.8,
          performance: 0.7,
          operationalEfficiency: 0.8
        }
      },
      backup: {
        enabled: false, // 開発時は無効
        schedule: {
          fullBackupInterval: 86400000, // 24時間
          incrementalInterval: 3600000, // 1時間
          maxBackupCount: 10,
          retentionDays: 30
        },
        compression: {
          enabled: true,
          level: 6
        }
      }
    };

    this.memoryManager = new MemoryManager(memoryConfig);

    // ChapterGeneratorの初期化（memoryManagerを追加）
    this.chapterGenerator = new ChapterGenerator(
      this.geminiClient,
      this.promptGenerator,
      this.memoryManager
    );

    // パラメータマネージャーの初期化を確認
    this.initializeParameters();

    logger.info('NovelGenerationEngine initialized');
  }

  /**
   * パラメータマネージャーの初期化を確認し、必要に応じて初期化します
   */
  private async initializeParameters(): Promise<void> {
    try {
      await parameterManager.initialize();

      // パラメータ変更時のイベントリスナーを設定
      parameterManager.onParameterChanged(this.handleParameterChange.bind(this));

      // 用途別モデルマップを設定
      const params = parameterManager.getParameters();
      if (params.generation.models) {
        this.geminiClient.setModelMap(params.generation.models);
        logger.info('Model map initialized from parameters', { models: params.generation.models });
      }

      logger.info('Parameter manager initialized in NovelGenerationEngine');
    } catch (error) {
      logger.error('Failed to initialize parameter manager', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * パラメータ変更ハンドラ
   * @param path 変更されたパラメータのパス
   * @param value 新しい値
   */
  private handleParameterChange(path: string, value: any): void {
    // 生成関連のパラメータが変更された場合の処理
    if (path.startsWith('generation.') || path === 'all') {
      logger.info(`Generation parameter changed: ${path}`);

      // モデルマップが変更された場合、GeminiClientに反映
      if (path === 'generation.models' || path === 'all') {
        const params = parameterManager.getParameters();
        if (params.generation.models) {
          this.geminiClient.setModelMap(params.generation.models);
          logger.info('Updated model map in GeminiClient', { models: params.generation.models });
        }
      }
    }
  }

  /**
   * 非同期初期化メソッド
   * 依存コンポーネントを初期化し、エンジンを使用可能な状態にします
   */
  async initialize(): Promise<void> {
    // 既に初期化済みならスキップ
    if (this.initialized) {
      return;
    }

    // 初期化が進行中なら、その結果を待機
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // 新しい初期化プロセスを開始
    this.initializationPromise = this._initialize();
    return this.initializationPromise;
  }

  /**
   * 内部初期化実装
   */
  private async _initialize(): Promise<void> {
    try {
      logger.info('Starting NovelGenerationEngine initialization');

      // 🔧 修正: MemoryManagerの初期化
      logger.info('Initializing MemoryManager');
      await this.memoryManager.initialize();
      logger.info('MemoryManager initialization completed');

      // 🔧 修正: PlotManagerの初期化を確実に実行
      logger.info('Setting up PlotManager integration');

      try {
        // グローバルメモリマネージャーを設定
        setGlobalMemoryManager(this.memoryManager);

        // PlotManagerを初期化
        logger.info('Initializing PlotManager with MemoryManager');
        const plotManagerInstance = await initializePlotManager(this.memoryManager);
        logger.info('PlotManager initialization completed successfully');

        // 初期化状態を確認
        const status = getPlotManagerStatus();
        logger.info('PlotManager status after initialization:', status);

        if (!status.isInitialized) {
          logger.warn('PlotManager initialization may have failed, but continuing...');
        }

      } catch (plotError) {
        logger.error('PlotManager initialization failed:', {
          error: plotError instanceof Error ? plotError.message : String(plotError)
        });

        // PlotManagerの初期化失敗は警告レベルで処理（システム全体を停止しない）
        logger.warn('Continuing without PlotManager integration');
      }

      // ChapterGeneratorの初期化
      logger.info('Initializing ChapterGenerator');
      await this.chapterGenerator.initialize();
      logger.info('ChapterGenerator initialization completed');

      this.initialized = true;
      logger.info('NovelGenerationEngine initialization completed successfully');

    } catch (error) {
      logger.error('Failed to initialize NovelGenerationEngine', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    } finally {
      this.initializationPromise = null;
    }
  }

  /**
 * 🔧 追加: システム状態の診断メソッド
 */
  async checkSystemStatus(): Promise<{
    apiKeyValid: boolean;
    modelInfo: any;
    parameters: SystemParameters;
    plotManagerStatus?: any;  // 追加
  }> {
    const apiKeyValid = await this.geminiClient.validateApiKey();
    const modelInfo = this.geminiClient.getModelInfo();
    const parameters = parameterManager.getParameters();

    // PlotManagerの状態も含める
    const plotManagerStatus = getPlotManagerStatus();

    return {
      apiKeyValid,
      modelInfo,
      parameters,
      plotManagerStatus  // 追加
    };
  }

  /**
  * 🔧 追加: 詳細な初期化状態確認
  */
  async performDetailedStatusCheck(): Promise<{
    engineInitialized: boolean;
    memoryManagerReady: boolean;
    plotManagerReady: boolean;
    chapterGeneratorReady: boolean;
    recommendations: string[];
  }> {
    const recommendations: string[] = [];

    // MemoryManagerの状態確認
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

    // PlotManagerの状態確認
    const plotStatus = getPlotManagerStatus();
    const plotManagerReady = plotStatus.isInitialized;
    if (!plotManagerReady) {
      recommendations.push('PlotManager requires initialization');
      if (!plotStatus.hasGlobalMemoryManager) {
        recommendations.push('PlotManager missing MemoryManager dependency');
      }
    }

    // ChapterGeneratorの状態確認（プロパティが存在する場合）
    const chapterGeneratorReady = (this.chapterGenerator as any).initialized === true;
    if (!chapterGeneratorReady) {
      recommendations.push('ChapterGenerator may require initialization');
    }

    return {
      engineInitialized: this.initialized,
      memoryManagerReady,
      plotManagerReady,
      chapterGeneratorReady,
      recommendations
    };
  }


  /**
   * システム状態情報を取得する
   * 
   * @async
   * @description
   * API エンドポイント（GET /api/generation/chapter）からの呼び出しにより実行され、
   * 
   * @returns {Promise<{apiKeyValid: boolean, modelInfo: any, parameters: SystemParameters}>} 
   *   システム状態情報を含むオブジェクト
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
   * チャプターの生成
   * 
   * 指定されたチャプター番号に基づいて小説のチャプターを生成します。
   * ChapterGeneratorに処理を委譲します。
   * 
   * @async
   * @param {number} chapterNumber チャプター番号
   * @param {GenerateChapterRequest} [options] 生成オプション
   * @returns {Promise<Chapter>} 生成されたチャプター
   * 
   * @throws {GenerationError} チャプター生成に失敗した場合
   */
  async generateChapter(
    chapterNumber: number,
    options?: GenerateChapterRequest
  ): Promise<Chapter> {
    if (!this.initialized) {
      logger.info('Ensuring initialization before chapter generation');
      await this.initialize();
    }

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

  // /**
  //  * テキスト要約の生成
  //  * 
  //  * @async
  //  * @param {string} text 要約する元のテキスト
  //  * @param {number} [maxLength=500] 要約の最大文字数
  //  * @returns {Promise<string>} 生成された要約
  //  */
  // async generateSummary(text: string, maxLength: number = 500): Promise<string> {
  //   return this.chapterGenerator.generateSummary(text, maxLength);
  // }

  // /**
  //  * キャラクター分析
  //  * 
  //  * @async
  //  * @param {string} characterName 分析するキャラクター名
  //  * @param {string} text 分析対象のテキスト
  //  * @returns {Promise<any>} キャラクター分析結果
  //  */
  // async analyzeCharacter(characterName: string, text: string): Promise<any> {
  //   return this.chapterGenerator.analyzeCharacter(characterName, text);
  // }

  /**
   * パラメータ更新
   * 
   * @param {string} path 更新するパラメータのパス
   * @param {any} value 新しい値
   */
  updateParameter(path: string, value: any): void {
    parameterManager.updateParameter(path, value);
  }

  /**
   * プリセット適用
   * 
   * @param {string} presetName 適用するプリセット名
   * @returns {boolean} 適用成功したかどうか
   */
  applyPreset(presetName: string): boolean {
    return parameterManager.applyPreset(presetName);
  }
}

// シングルトンインスタンスを作成して公開
export const generationEngine = new NovelGenerationEngine();