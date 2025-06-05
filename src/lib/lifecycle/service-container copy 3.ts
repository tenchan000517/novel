// src/lib/lifecycle/service-container.ts (CharacterManager独立初期化対応)

import { logger } from '../utils/logger';

export enum ServiceLifecycle {
  SINGLETON = 'SINGLETON',
  TRANSIENT = 'TRANSIENT'
}

/**
 * 依存注入コンテナ（CharacterManager独立初期化対応）
 */
export class ServiceContainer {
  private services = new Map<string, { factory: () => any | Promise<any>, lifecycle: ServiceLifecycle, instance?: any }>();

  /**
   * サービスを登録
   */
  register(name: string, factory: () => any | Promise<any>, lifecycle: ServiceLifecycle = ServiceLifecycle.SINGLETON): void {
    this.services.set(name, { factory, lifecycle });
    logger.debug(`Registered service: ${name}`);
  }

  /**
   * サービスを解決
   */
  async resolve<T>(name: string): Promise<T> {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service not found: ${name}`);
    }

    if (service.lifecycle === ServiceLifecycle.SINGLETON) {
      if (!service.instance) {
        service.instance = await service.factory();
      }
      return service.instance;
    }

    return await service.factory();
  }

  /**
   * インフラストラクチャ初期化（Stage 1）
   */
  async initializeInfrastructure(): Promise<void> {
    logger.info('Initializing infrastructure services');
    // インフラ系サービスは既に利用可能
  }

  /**
   * ストレージ初期化（Stage 2）- WorldSettingsManager早期初期化追加
   */
  async initializeStorage(): Promise<void> {
    logger.info('Initializing storage services');

    // ChapterStorageの登録
    this.register('chapterStorage', async () => {
      const { chapterStorage } = await import('@/lib/storage');
      return chapterStorage;
    }, ServiceLifecycle.SINGLETON);

    // StorageProviderの登録
    this.register('storageProvider', async () => {
      const { storageProvider } = await import('@/lib/storage');
      return storageProvider;
    }, ServiceLifecycle.SINGLETON);

    // 🔧 NEW: WorldSettingsManagerの早期初期化（ジャンル取得最適化）
    this.register('worldSettingsManager', async () => {
      const { WorldSettingsManager } = await import('@/lib/plot/world-settings-manager');
      const manager = new WorldSettingsManager();
      await manager.initialize();

      logger.info('WorldSettingsManager initialized early for optimized genre access');
      return manager;
    }, ServiceLifecycle.SINGLETON);
  }

  /**
   * メモリシステム初期化（Stage 3）
   */
  async initializeMemorySystem(): Promise<void> {
    logger.info('Initializing memory system');

    // MemoryManagerの登録
    this.register('memoryManager', async () => {
      const { MemoryManager } = await import('@/lib/memory/core/memory-manager');

      const config = {
        // 記憶階層設定
        shortTermConfig: {
          maxChapters: 10,
          cacheEnabled: true,
          autoCleanupEnabled: true,
          cleanupIntervalMinutes: 30,
          maxRetentionHours: 72
        },

        // 新機能対応のmidTermConfig
        midTermConfig: {
          maxAnalysisResults: 100,
          enableEvolutionTracking: true,
          enableProgressionAnalysis: true,
          qualityThreshold: 0.8,

          // 新機能（必須）
          enableCrossComponentAnalysis: true,
          enableRealTimeQualityMonitoring: true,
          enablePerformanceOptimization: true
        },

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
        enableDataMigration: false,

        // パフォーマンス設定
        cacheSettings: {
          sizeLimit: 100, // MB
          entryLimit: 1000,
          cleanupInterval: 300000 // 5分
        },

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
            dataIntegrity: 0.9,
            systemStability: 0.7,
            performance: 0.8,
            operationalEfficiency: 0.75
          }
        },

        // バックアップ設定
        backup: {
          enabled: true,
          schedule: {
            fullBackupInterval: 24, // 24時間
            incrementalInterval: 4, // 4時間
            maxBackupCount: 10,
            retentionDays: 7
          },
          compression: {
            enabled: true,
            level: 6
          }
        }
      };

      const memoryManager = new MemoryManager(config);
      await memoryManager.initialize();
      return memoryManager;
    }, ServiceLifecycle.SINGLETON);
  }

  /**
   * コアサービス初期化（Stage 4）
   */
  async initializeCoreServices(): Promise<void> {
    logger.info('Initializing core services');

    // ParameterManagerの登録
    this.register('parameterManager', async () => {
      const { parameterManager } = await import('@/lib/parameters');
      await parameterManager.initialize();
      return parameterManager;
    }, ServiceLifecycle.SINGLETON);

    // GeminiClientの登録
    this.register('geminiClient', async () => {
      const { GeminiClient } = await import('@/lib/generation/gemini-client');
      return new GeminiClient();
    }, ServiceLifecycle.SINGLETON);
  }

  /**
   * ファサード初期化（Stage 5）- CharacterManager独立初期化対応
   */
  async initializeFacades(): Promise<void> {
    logger.info('Initializing facade services');

    // 🔧 FIXED: CharacterManagerの独立初期化（MemoryManager依存削除）
    this.register('characterManager', async () => {
      const { createCharacterManager } = await import('@/lib/characters/manager');

      // 🔥 MemoryManager依存を削除し、独立して初期化
      logger.info('Creating CharacterManager with independent initialization');
      return createCharacterManager(); // 引数なしで呼び出し
    }, ServiceLifecycle.SINGLETON);

    this.register('plotManager', async () => {
      const { createPlotManager } = await import('@/lib/plot/manager');

      // 依存関係の解決（初期化順序保証済み）
      const memoryManager = await this.resolve<any>('memoryManager');
      const worldSettingsManager = await this.resolve<any>('worldSettingsManager');
      const geminiClient = await this.resolve<any>('geminiClient');

      // 最適化された設定
      const config = {
        enableLearningJourney: true,
        enableSectionPlotImport: false, // 初期は無効化して軽量化
        enableQualityAssurance: true,
        enablePerformanceOptimization: true,
        learningJourneyTimeout: 10000, // 10秒に短縮
        memorySystemIntegration: true
      };

      // 既存のcreateePlotManagerを使用
      const plotManager = createPlotManager(memoryManager, config);

      // 🔧 最適化: 追加の依存関係を後から設定
      if (plotManager && typeof plotManager === 'object') {
        (plotManager as any).worldSettingsManager = worldSettingsManager;
        (plotManager as any).serviceContainer = this;
        (plotManager as any).geminiClient = geminiClient;
      }

      return plotManager;
    }, ServiceLifecycle.SINGLETON);

    // NovelGenerationEngineの登録（PlotManager依存）
    this.register('novelGenerationEngine', async () => {
      const { NovelGenerationEngine } = await import('@/lib/generation/engine');
      const { ChapterGenerator } = await import('@/lib/generation/engine/chapter-generator');
      const { PromptGenerator } = await import('@/lib/generation/prompt-generator');

      // 型安全な依存関係解決
      const memoryManager = await this.resolve<any>('memoryManager');
      const geminiClient = await this.resolve<any>('geminiClient');
      const characterManager = await this.resolve<any>('characterManager');  // 🔥 追加
      const plotManager = await this.resolve<any>('plotManager');

      // 🔥 CharacterManagerを含む完全な依存関係注入
      const promptGenerator = new PromptGenerator(
        memoryManager,
        undefined, // worldSettingsManager: PlotManager経由でアクセス
        plotManager,
        undefined, // learningJourneySystem: PlotManager経由でアクセス
        characterManager  // 🔥 追加
      );

      const chapterGenerator = new ChapterGenerator(geminiClient, promptGenerator, memoryManager);

      return new NovelGenerationEngine(
        memoryManager,
        chapterGenerator,
        promptGenerator,
        geminiClient
      );
    }, ServiceLifecycle.SINGLETON);

    // ValidationSystemの登録
    this.register('validationSystem', async () => {
      const { ValidationSystem } = await import('@/lib/validation/system');
      const memoryManager = await this.resolve<any>('memoryManager');

      const validationSystem = new ValidationSystem(memoryManager);
      await validationSystem.initialize();
      return validationSystem;
    }, ServiceLifecycle.SINGLETON);
  }

  /**
   * 🔥 REMOVED: loadCharacterData処理を削除
   * CharacterServiceが独立してYAMLファイルから読み込むため不要
   */

  /**
   * 🔥 REMOVED: createFallbackCharacters処理を削除
   * CharacterServiceが独立してフォールバック処理を行うため不要
   */

  /**
   * 登録されているサービス一覧を取得
   */
  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * サービスの状態を確認
   */
  getServiceStatus(name: string): { registered: boolean, instantiated: boolean } {
    const service = this.services.get(name);
    return {
      registered: !!service,
      instantiated: !!(service?.instance)
    };
  }

  /**
   * 🔧 NEW: 外部からのサービス解決用（PlotManager等で使用）
   */
  async getService<T>(name: string): Promise<T | null> {
    try {
      return await this.resolve<T>(name);
    } catch (error) {
      logger.warn(`Failed to resolve service: ${name}`, { error });
      return null;
    }
  }
}