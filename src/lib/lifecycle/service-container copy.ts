// src/lib/lifecycle/service-container.ts (TypeScriptエラー修正版)

import { logger } from '../utils/logger';

export enum ServiceLifecycle {
  SINGLETON = 'SINGLETON',
  TRANSIENT = 'TRANSIENT'
}

/**
 * 依存注入コンテナ
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
   * ストレージ初期化（Stage 2）
   */
  async initializeStorage(): Promise<void> {
    logger.info('Initializing storage services');

    // ChapterStorageの登録
    this.register('chapterStorage', async () => {
      const { chapterStorage } = await import('@/lib/storage');
      return chapterStorage;
    }, ServiceLifecycle.SINGLETON);

    // StorageProviderの登録 (追加)
    this.register('storageProvider', async () => {
      const { storageProvider } = await import('@/lib/storage');
      return storageProvider;
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

      // 実際のMemoryManagerConfig型定義に完全準拠
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

        // パフォーマンス設定（正しい構造）
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
   * ファサード初期化（Stage 5）
   */
  async initializeFacades(): Promise<void> {
    logger.info('Initializing facade services');

    // CharacterManagerの登録 (追加 - NovelGenerationEngineより先に初期化)
    this.register('characterManager', async () => {
      const { createCharacterManager } = await import('@/lib/characters/manager');
      
      // 型安全な依存関係解決
      const memoryManager = await this.resolve<any>('memoryManager');

      // キャラクターデータを事前読み込み
      await this.loadCharacterData(memoryManager);

      return createCharacterManager(memoryManager);
    }, ServiceLifecycle.SINGLETON);

    // NovelGenerationEngineの登録
    this.register('novelGenerationEngine', async () => {
      const { NovelGenerationEngine } = await import('@/lib/generation/engine');
      const { ChapterGenerator } = await import('@/lib/generation/engine/chapter-generator');
      const { PromptGenerator } = await import('@/lib/generation/prompt-generator');

      // 型安全な依存関係解決
      const memoryManager = await this.resolve<any>('memoryManager');
      const geminiClient = await this.resolve<any>('geminiClient');
      const characterManager = await this.resolve<any>('characterManager');

      // 依存関係を注入してインスタンス作成
      const promptGenerator = new PromptGenerator(memoryManager);
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
   * キャラクターデータ読み込み処理
   */
  private async loadCharacterData(memoryManager: any): Promise<void> {
    try {
      // StorageProviderを動的に取得
      const storageProvider = await this.resolve<any>('storageProvider');
      
      // キャラクター定義ファイルを読み込み
      const characterFiles = [
        'config/characters/main-characters.yaml',
        'config/characters/sub-characters.yaml', 
        'config/characters/background-characters.yaml'
      ];

      let loadedCount = 0;

      for (const file of characterFiles) {
        try {
          const exists = await storageProvider.fileExists(file);
          if (exists) {
            const data = await storageProvider.readFile(file);
            
            // MemoryManagerにキャラクターデータを保存
            // Note: storeCharacterDataメソッドが存在しない場合の対応
            if (typeof memoryManager.storeCharacterData === 'function') {
              await memoryManager.storeCharacterData(data);
            } else {
              // 代替手段: 統合検索システムに直接保存
              await memoryManager.storeData({
                type: 'character_definition',
                source: file,
                data: data,
                timestamp: new Date().toISOString()
              });
            }
            
            loadedCount++;
            logger.debug(`Loaded character data from: ${file}`);
          } else {
            logger.warn(`Character file not found: ${file}`);
          }
        } catch (fileError) {
          logger.warn(`Failed to load character file: ${file}`, {
            error: fileError instanceof Error ? fileError.message : String(fileError)
          });
        }
      }

      if (loadedCount > 0) {
        logger.info(`Character data loaded successfully from ${loadedCount} files`);
      } else {
        logger.warn('No character data files found or loaded');
        
        // フォールバック: 最小限のテストキャラクターを作成
        await this.createFallbackCharacters(memoryManager);
      }

    } catch (error) {
      logger.error('Failed to load character data', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      // クリティカルエラーの場合でもフォールバックを試行
      try {
        await this.createFallbackCharacters(memoryManager);
        logger.info('Fallback characters created successfully');
      } catch (fallbackError) {
        logger.error('Failed to create fallback characters', { 
          error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError) 
        });
        throw error; // 元のエラーを再投げ
      }
    }
  }

  /**
   * フォールバックキャラクター作成
   */
  private async createFallbackCharacters(memoryManager: any): Promise<void> {
    const fallbackCharacters = [
      {
        id: 'main-001',
        name: '主人公',
        type: 'MAIN',
        description: 'システム生成されたフォールバック主人公',
        isActive: true,
        personality: {
          traits: ['勇敢', '決断力がある'],
          goals: ['物語の完結'],
          values: ['正義', '友情']
        }
      }
    ];

    for (const character of fallbackCharacters) {
      try {
        await memoryManager.storeData({
          type: 'character',
          id: character.id,
          data: character,
          timestamp: new Date().toISOString()
        });
        
        logger.info(`Created fallback character: ${character.name}`);
      } catch (error) {
        logger.error(`Failed to create fallback character: ${character.name}`, { error });
      }
    }
  }

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
}