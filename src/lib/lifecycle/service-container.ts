// src/lib/lifecycle/service-container.ts (CharacterManager独立初期化対応・P5-2対応)

import { logger } from '../utils/logger';
import { 
    InitializationTier, 
    ServiceMetadata, 
    DependencyValidationResult,
    InitializationResult 
} from './types';

export enum ServiceLifecycle {
  SINGLETON = 'SINGLETON',
  TRANSIENT = 'TRANSIENT'
}

/**
 * 依存注入コンテナ（CharacterManager独立初期化対応）
 */
export class ServiceContainer {
  private services = new Map<string, { factory: () => any | Promise<any>, lifecycle: ServiceLifecycle, instance?: any, metadata?: ServiceMetadata }>();

  /**
   * サービスを登録（P5-2: メタデータ対応）
   */
  register(name: string, factory: () => any | Promise<any>, lifecycle: ServiceLifecycle = ServiceLifecycle.SINGLETON, metadata?: ServiceMetadata): void {
    this.services.set(name, { factory, lifecycle, metadata });
    logger.debug(`Registered service: ${name}`, { 
      dependencies: metadata?.dependencies || [], 
      tier: metadata?.initializationTier 
    });
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

    // 🚀 NEW: ストレージ構造の自動初期化・修復
    try {
      logger.info('Initializing storage directory structure...');
      const { storageProvider } = await import('@/lib/storage');
      const { initializeStorageWithAutoRepair } = await import('@/lib/storage/storage-initializer');

      await initializeStorageWithAutoRepair(storageProvider);
      logger.info('Storage structure initialization completed successfully');
    } catch (error) {
      logger.error('Storage structure initialization failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      // 初期化失敗でもシステム起動は継続（後続処理で個別対応）
      logger.warn('Continuing with system initialization despite storage structure issues');
    }
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
    }, ServiceLifecycle.SINGLETON, {
      dependencies: [], // 固定で設定 - Tier 3: 依存なし
      initializationTier: InitializationTier.FOUNDATION
    });
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
    }, ServiceLifecycle.SINGLETON, {
      dependencies: [], // 固定で設定 - Tier 4: 依存なし
      initializationTier: InitializationTier.CORE
    });

    // GeminiClientの登録
    this.register('geminiClient', async () => {
      const { GeminiClient } = await import('@/lib/generation/gemini-client');
      return new GeminiClient();
    }, ServiceLifecycle.SINGLETON, {
      dependencies: [], // 固定で設定 - Tier 4: 依存なし
      initializationTier: InitializationTier.CORE
    });
  }

  /**
   * ファサード初期化（Stage 5）- CharacterManager独立初期化対応
   */
  async initializeFacades(): Promise<void> {
    logger.info('Initializing facade services');

    // 🔧 FIXED: CharacterManagerの独立初期化（MemoryManager依存削除）
    this.register('characterManager', async () => {
      const { createCharacterManager, CharacterManager } = await import('@/lib/characters/manager');

      // 🔥 MemoryManager依存を削除し、独立して初期化
      logger.info('Creating CharacterManager with independent initialization');
      return createCharacterManager(); // 引数なしで呼び出し
    }, ServiceLifecycle.SINGLETON, {
      dependencies: ['memoryManager'], // 固定で設定
      initializationTier: InitializationTier.FACADE
    });

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
    }, ServiceLifecycle.SINGLETON, {
      dependencies: ['memoryManager', 'worldSettingsManager', 'geminiClient'], // 固定で設定
      initializationTier: InitializationTier.FACADE
    });

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
    }, ServiceLifecycle.SINGLETON, {
      dependencies: ['memoryManager', 'geminiClient', 'characterManager', 'plotManager'], // 固定で設定
      initializationTier: InitializationTier.FACADE
    });

    // ValidationSystemの登録
    this.register('validationSystem', async () => {
      const { ValidationSystem } = await import('@/lib/validation/system');
      const memoryManager = await this.resolve<any>('memoryManager');

      const validationSystem = new ValidationSystem(memoryManager);
      await validationSystem.initialize();
      return validationSystem;
    }, ServiceLifecycle.SINGLETON, {
      dependencies: ['memoryManager'], // 固定で設定
      initializationTier: InitializationTier.FACADE
    });
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

  /**
   * P5-2実装: 依存関係の検証
   * 循環依存や未解決の依存関係をチェック
   */
  validateDependencies(): DependencyValidationResult {
    const result: DependencyValidationResult = {
      valid: true,
      circularDependencies: [],
      unresolvedDependencies: [],
      initializationOrder: []
    };

    // 依存関係グラフの構築
    const dependencyGraph = new Map<string, string[]>();
    const serviceMetadata = new Map<string, ServiceMetadata>();

    // 登録されているサービスから依存関係情報を収集
    for (const [serviceName, service] of this.services) {
      try {
        // メタデータが既に登録されている場合はそれを使用
        if (service.metadata) {
          serviceMetadata.set(serviceName, service.metadata);
          dependencyGraph.set(serviceName, service.metadata.dependencies);
        } else {
          // フォールバック: 空の依存関係（登録時にメタデータを指定すべき）
          const fallbackMetadata: ServiceMetadata = {
            dependencies: [],
            initializationTier: InitializationTier.FACADE
          };
          serviceMetadata.set(serviceName, fallbackMetadata);
          dependencyGraph.set(serviceName, []);
          
          logger.warn(`Service ${serviceName} registered without metadata, using fallback`);
        }
      } catch (error) {
        logger.warn(`Failed to get metadata for service: ${serviceName}`, { error });
        // エラー時のフォールバック
        const fallbackMetadata: ServiceMetadata = {
          dependencies: [],
          initializationTier: InitializationTier.FACADE
        };
        serviceMetadata.set(serviceName, fallbackMetadata);
        dependencyGraph.set(serviceName, []);
      }
    }

    // 循環依存のチェック
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (node: string, path: string[] = []): string[] | null => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const dependencies = dependencyGraph.get(node) || [];
      for (const dep of dependencies) {
        if (!visited.has(dep)) {
          const cyclePath = hasCycle(dep, [...path]);
          if (cyclePath) return cyclePath;
        } else if (recursionStack.has(dep)) {
          // 循環依存を検出
          const cycleStart = path.indexOf(dep);
          return [...path.slice(cycleStart), dep];
        }
      }

      recursionStack.delete(node);
      return null;
    };

    // 全ノードをチェック
    for (const serviceName of dependencyGraph.keys()) {
      if (!visited.has(serviceName)) {
        const cycle = hasCycle(serviceName);
        if (cycle) {
          result.circularDependencies!.push(cycle);
          result.valid = false;
        }
      }
    }

    // 未解決の依存関係をチェック
    for (const [serviceName, deps] of dependencyGraph) {
      for (const dep of deps) {
        if (!this.services.has(dep)) {
          result.unresolvedDependencies!.push(`${serviceName} depends on unregistered service: ${dep}`);
          result.valid = false;
        }
      }
    }

    // 初期化順序の決定（トポロジカルソート）
    if (result.valid) {
      const sorted: string[] = [];
      const tempVisited = new Set<string>();

      const topologicalSort = (node: string) => {
        if (tempVisited.has(node)) return;
        tempVisited.add(node);

        const deps = dependencyGraph.get(node) || [];
        for (const dep of deps) {
          topologicalSort(dep);
        }

        sorted.push(node);
      };

      // Tier順にソート
      const servicesByTier = new Map<number, string[]>();
      for (const [serviceName, metadata] of serviceMetadata) {
        const tier = metadata.initializationTier;
        if (!servicesByTier.has(tier)) {
          servicesByTier.set(tier, []);
        }
        servicesByTier.get(tier)!.push(serviceName);
      }

      // Tier順に処理
      const sortedTiers = Array.from(servicesByTier.keys()).sort((a, b) => a - b);
      for (const tier of sortedTiers) {
        const services = servicesByTier.get(tier)!;
        for (const service of services) {
          topologicalSort(service);
        }
      }

      result.initializationOrder = sorted;
    }

    return result;
  }

  /**
   * P5-2実装: 統合初期化メソッド
   * 依存関係を考慮した順序での初期化
   */
  async initializeAll(): Promise<InitializationResult[]> {
    const results: InitializationResult[] = [];
    
    // 依存関係の検証
    const validation = this.validateDependencies();
    if (!validation.valid) {
      logger.error('Dependency validation failed', {
        circularDependencies: validation.circularDependencies,
        unresolvedDependencies: validation.unresolvedDependencies
      });
      throw new Error('Service dependency validation failed');
    }

    logger.info('Starting service initialization with validated order', {
      order: validation.initializationOrder
    });

    // ステージ順に初期化
    const stages = [
      { name: 'Infrastructure', method: this.initializeInfrastructure.bind(this) },
      { name: 'Storage', method: this.initializeStorage.bind(this) },
      { name: 'MemorySystem', method: this.initializeMemorySystem.bind(this) },
      { name: 'CoreServices', method: this.initializeCoreServices.bind(this) },
      { name: 'Facades', method: this.initializeFacades.bind(this) }
    ];

    for (const stage of stages) {
      const startTime = Date.now();
      try {
        logger.info(`Initializing stage: ${stage.name}`);
        await stage.method();
        results.push({
          success: true,
          serviceName: stage.name,
          duration: Date.now() - startTime
        });
      } catch (error) {
        logger.error(`Failed to initialize stage: ${stage.name}`, { error });
        results.push({
          success: false,
          serviceName: stage.name,
          error: error as Error,
          duration: Date.now() - startTime
        });
        throw error; // 初期化失敗時は処理を停止
      }
    }

    logger.info('Service initialization completed', {
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalDuration: results.reduce((sum, r) => sum + (r.duration || 0), 0)
    });

    return results;
  }
}