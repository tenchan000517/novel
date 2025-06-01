// src/lib/generation/engine.ts
import { Chapter } from '@/types/chapters';
import { GenerateChapterRequest, GenerationContext } from '@/types/generation';
import { SystemParameters } from '@/types/parameters';
import { GeminiClient } from './gemini-client';
import { parameterManager } from '@/lib/parameters';
import { logger } from '@/lib/utils/logger';
import { GenerationError } from '@/lib/utils/error-handler';
import { ChapterGenerator } from './engine/chapter-generator';
import { PromptGenerator } from './prompt-generator';

// === 🔥 新記憶階層システム統合のインポート追加 ===
import { MemoryManager, MemoryManagerConfig } from '@/lib/memory/core/memory-manager';
import { ContentAnalysisManager } from '@/lib/analysis/content-analysis-manager';
import { PreGenerationPipeline } from '@/lib/analysis/pipelines/pre-generation-pipeline';
import { PostGenerationPipeline } from '@/lib/analysis/pipelines/post-generation-pipeline';
import { AnalysisCoordinator } from '@/lib/analysis/coordinators/analysis-coordinator';
import { OptimizationCoordinator } from '@/lib/analysis/coordinators/optimization-coordinator';
import { GeminiAdapter } from '@/lib/analysis/adapters/gemini-adapter';
import { storageProvider } from '@/lib/storage';

/**
 * @class NovelGenerationEngine
 * @description 小説生成エンジンのファサードクラス（記憶階層システム統合版）
 * 
 * @role
 * - 外部からの要求を適切なコンポーネントに委譲する
 * - 各コンポーネント間の連携を調整する
 * - 小説生成に特化した公開APIを提供する
 * 
 * @designPrinciples
 * - 責任の明確化: エンジンは小説生成の責任に集中
 * - 設定の分離: MemoryManagerの詳細設定はエンジンの責任外
 * - 依存性注入: 必要なコンポーネントのみ統合
 * 
 * @note
 * MemoryManagerの設定管理は当クラスの責任外です。
 * 設定変更が必要な場合は、適切な設定管理システムが対応してください。
 */
class NovelGenerationEngine {
  private chapterGenerator: ChapterGenerator;
  private geminiClient: GeminiClient;
  private promptGenerator: PromptGenerator;
  
  // === 🔥 新記憶階層システム統合 ===
  private memoryManager: MemoryManager;
  private contentAnalysisManager: ContentAnalysisManager;
  
  // 初期化状態を追跡するためのフラグ
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  /**
   * MemoryManagerの作成（設定責任を分離）
   * 詳細な設定決定はエンジンの責任外とし、適切な設定源に委譲
   */
  private createMemoryManager(): MemoryManager {
    try {
      // TODO: 設定の責任者を明確化し、適切な設定源から取得
      // 現時点では動作に必要な最小限の設定のみ提供
      const minimalConfig: MemoryManagerConfig = {
        shortTermConfig: {
          maxChapters: 10,
          cacheEnabled: true
        },
        midTermConfig: {
          maxAnalysisResults: 50,
          enableEvolutionTracking: true,
          enableProgressionAnalysis: true,
          qualityThreshold: 0.7,
          enableCrossComponentAnalysis: true,
          enableRealTimeQualityMonitoring: true,
          enablePerformanceOptimization: true
        },
        longTermConfig: {
          enableAutoLearning: true,
          consolidationInterval: 86400000,
          archiveOldData: false,
          enablePredictiveAnalysis: false,
          qualityThreshold: 0.8
        },
        integrationEnabled: true,
        enableQualityAssurance: false,
        enableAutoBackup: false,
        enablePerformanceOptimization: false,
        enableDataMigration: false,
        cacheSettings: {
          sizeLimit: 50 * 1024 * 1024, // 50MB
          entryLimit: 500,
          cleanupInterval: 600000 // 10 minutes
        },
        optimizationSettings: {
          enablePredictiveAccess: false,
          enableConsistencyValidation: true,
          enablePerformanceMonitoring: false
        },
        qualityAssurance: {
          enableRealTimeMonitoring: false,
          enablePredictiveAnalysis: false,
          enableAutomaticRecovery: false,
          checkInterval: 300000,
          alertThresholds: {
            dataIntegrity: 0.8,
            systemStability: 0.8,
            performance: 0.7,
            operationalEfficiency: 0.7
          }
        },
        backup: {
          enabled: false,
          schedule: {
            fullBackupInterval: 86400000,
            incrementalInterval: 3600000,
            maxBackupCount: 3,
            retentionDays: 7
          },
          compression: {
            enabled: false,
            level: 1
          }
        }
      };

      return new MemoryManager(minimalConfig);
    } catch (error) {
      logger.error('Failed to create MemoryManager', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`MemoryManager creation failed: ${error}`);
    }
  }

  /**
   * コンストラクタ（記憶階層システム統合版）
   * 
   * NovelGenerationEngineクラスのインスタンスを初期化します。
   * 各コンポーネントの初期化は行いますが、詳細な設定決定は他のシステムに委譲します。
   */
  constructor() {
    // 基本コンポーネントの初期化
    this.geminiClient = new GeminiClient();
    this.promptGenerator = new PromptGenerator();
    
    // === 🔥 統合記憶管理システムの初期化（設定責任を分離） ===
    // MemoryManagerの設定はエンジンの責任外とし、最小限の設定またはデフォルトを使用
    this.memoryManager = this.createMemoryManager();
    
    // === ContentAnalysisManagerの初期化 ===
    this.contentAnalysisManager = this.initializeContentAnalysisManager();
    
    // === ChapterGeneratorの初期化（全依存関係を注入） ===
    this.chapterGenerator = new ChapterGenerator(
      this.geminiClient,
      this.promptGenerator,
      this.memoryManager,
      this.contentAnalysisManager
    );
    
    // パラメータマネージャーの初期化を確認
    this.initializeParameters();
    
    logger.info('NovelGenerationEngine initialized with memory system integration');
  }

  /**
   * ContentAnalysisManagerの初期化
   */
  private initializeContentAnalysisManager(): ContentAnalysisManager {
    try {
      const geminiAdapter = new GeminiAdapter(this.geminiClient);
      
      const analysisCoordinator = new AnalysisCoordinator(
        geminiAdapter,
        this.memoryManager,
        storageProvider
      );
      
      const optimizationCoordinator = new OptimizationCoordinator(
        geminiAdapter,
        null // 必要に応じて他の依存関係を渡す
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

      logger.info('ContentAnalysisManager initialized successfully');
      return contentAnalysisManager;

    } catch (error) {
      logger.error('Failed to initialize ContentAnalysisManager', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      // フォールバック：最小限のContentAnalysisManagerを作成
      throw new GenerationError(
        'Failed to initialize ContentAnalysisManager',
        'CONTENT_ANALYSIS_MANAGER_INIT_FAILED'
      );
    }
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

    // NOTE: MemoryManagerの設定変更は当エンジンの責任外
    // 設定の変更が必要な場合は、適切な設定管理システムが対応する
  }

  /**
   * 非同期初期化メソッド（記憶階層システム統合版）
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
   * 内部初期化実装（記憶階層システム統合版）
   */
  private async _initialize(): Promise<void> {
    try {
      logger.info('Starting NovelGenerationEngine initialization with unified memory system');

      // === 🔥 統合記憶管理システムの初期化 ===
      logger.info('Initializing unified memory management system');
      await this.memoryManager.initialize();
      logger.info('✅ Unified memory management system initialized successfully');

      // === ContentAnalysisManagerの健全性チェック ===
      if (this.contentAnalysisManager) {
        logger.info('Performing ContentAnalysisManager health check');
        try {
          const healthCheck = await this.contentAnalysisManager.healthCheck();
          if (healthCheck.status === 'unhealthy') {
            logger.warn('ContentAnalysisManager is unhealthy but will continue', healthCheck.details);
          } else {
            logger.info('✅ ContentAnalysisManager health check completed successfully');
          }
        } catch (error) {
          logger.warn('ContentAnalysisManager health check failed, but will continue', {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      // === ChapterGeneratorの初期化 ===
      logger.info('Initializing ChapterGenerator with unified memory system');
      await this.chapterGenerator.initialize();
      logger.info('✅ ChapterGenerator initialization completed');

      this.initialized = true;
      logger.info('✅ NovelGenerationEngine initialization completed with unified memory system integration');
      
    } catch (error) {
      logger.error('❌ Failed to initialize NovelGenerationEngine with unified memory system', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    } finally {
      this.initializationPromise = null;
    }
  }

  /**
   * システム状態情報を取得する（記憶階層システム統合版）
   * 
   * @async
   * @description
   * API エンドポイント（GET /api/generation/chapter）からの呼び出しにより実行され、
   * システム状態情報を取得します。MemoryManagerの状態は委譲して取得します。
   * 
   * @returns {Promise<{apiKeyValid: boolean, modelInfo: any, parameters: SystemParameters, memorySystemStatus: any}>} 
   *   システム状態情報を含むオブジェクト
   */
  async checkStatus(): Promise<{
    apiKeyValid: boolean;
    modelInfo: any;
    parameters: SystemParameters;
    memorySystemStatus: any;
  }> {
    const apiKeyValid = await this.geminiClient.validateApiKey();
    const modelInfo = this.geminiClient.getModelInfo();
    const parameters = parameterManager.getParameters();
    
    // === 🔥 統合記憶管理システムの状態も含める（委譲） ===
    const memorySystemStatus = await this.memoryManager.getSystemStatus();

    return {
      apiKeyValid,
      modelInfo,
      parameters,
      memorySystemStatus
    };
  }

  /**
   * チャプターの生成（記憶階層システム統合版）
   * 
   * 指定されたチャプター番号に基づいて小説のチャプターを生成します。
   * ChapterGeneratorに処理を委譲し、統合記憶管理システムと連携します。
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
      logger.info(`Starting chapter ${chapterNumber} generation with unified memory system integration`);
      
      const result = await this.chapterGenerator.generate(chapterNumber, options);
      
      logger.info(`Chapter ${chapterNumber} generation completed successfully with unified memory system`);
      return result;
      
    } catch (error) {
      logger.error(`Failed to generate chapter ${chapterNumber} in NovelGenerationEngine with unified memory system`, {
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

  // === 🔥 統合記憶管理システムへのアクセスメソッド ===
  // 注意: これらはMemoryManagerへの委譲メソッドです
  // MemoryManagerの設定や詳細管理は当エンジンの責任外です

  /**
   * 統合記憶管理システムの状態取得（委譲）
   */
  async getMemorySystemStatus() {
    return await this.memoryManager.getSystemStatus();
  }

  /**
   * 統合記憶管理システムの診断実行（委譲）
   */
  async performMemorySystemDiagnostics() {
    return await this.memoryManager.performSystemDiagnostics();
  }

  /**
   * 統合記憶管理システムの最適化実行（委譲）
   */
  async optimizeMemorySystem() {
    return await this.memoryManager.optimizeSystem();
  }

  /**
   * 統合記憶管理システムの統一検索API（委譲）
   */
  async performUnifiedSearch(query: string, targetLayers?: any[]) {
    return await this.memoryManager.unifiedSearch(query, targetLayers);
  }
}

// シングルトンインスタンスを作成して公開
export const generationEngine = new NovelGenerationEngine();