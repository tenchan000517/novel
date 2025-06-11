/**
 * Version 2.0 - アプリケーションライフサイクル管理
 * 
 * システム全体の起動・停止・監視を管理
 */

import { ServiceContainer } from '../container/service-container';
import { OperationResult } from '@/types/common';

// 修正: 不足している型定義を追加
export enum ContainerStatus {
  UNKNOWN = 'unknown',
  INITIALIZING = 'initializing',
  READY = 'ready',
  DEGRADED = 'degraded',
  SHUTTING_DOWN = 'shutting_down',
  SHUTDOWN = 'shutdown',
  ERROR = 'error'
}

export interface ApplicationConfig {
  environment: 'development' | 'staging' | 'production';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableMetrics: boolean;
  enableHealthChecks: boolean;
  shutdownGracePeriod: number;
  initializationTimeout: number;
}

export interface ApplicationHealth {
  status: ApplicationStatus;
  version: string;
  uptime: number;
  environment: string;
  systems: {
    container: ContainerStatus;
    services: number;
    healthyServices: number;
  };
  resources: {
    memory: number;
    cpu: number;
    disk: number;
  };
  lastHealthCheck: string;
}

export enum ApplicationStatus {
  STARTING = 'starting',
  READY = 'ready',
  DEGRADED = 'degraded',
  SHUTTING_DOWN = 'shutting_down',
  STOPPED = 'stopped',
  ERROR = 'error'
}

// 修正: ServiceContainerErrorの定義を追加
export class ServiceContainerError extends Error {
  constructor(
    message: string,
    public code?: string,
    public context?: any,
    public cause?: Error
  ) {
    super(message);
    this.name = 'ServiceContainerError';
  }
}

export class ApplicationLifecycleManager {
  private container: ServiceContainer;
  private config: ApplicationConfig;
  private status: ApplicationStatus = ApplicationStatus.STOPPED;
  private startTime: number = 0;
  private shutdownPromise: Promise<void> | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: ApplicationConfig) {
    this.config = config;
    // 修正: ServiceContainerConfigに適合するよう設定を調整
    this.container = new ServiceContainer({
      defaultResolutionTimeout: config.initializationTimeout,
      performanceMonitoring: config.enableMetrics,
      enableHealthMonitoring: config.enableHealthChecks,
      enableDependencyValidation: true,
      enableLifecycleManagement: true,
      enableErrorRecovery: true,
      maxResolutionDepth: 50,
      healthCheckInterval: 60000,
      errorRetentionPeriod: 86400000,
      debugMode: false,
      logLevel: 'info' as any
    });

    this.setupProcessHandlers();
  }

  // ============================================================================
  // ライフサイクル管理
  // ============================================================================

  async start(): Promise<OperationResult<void>> {
    if (this.status !== ApplicationStatus.STOPPED) {
      return {
        success: false,
        error: {
          code: 'INVALID_STATE',
          message: `Cannot start application in ${this.status} state`
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: 0,
          systemId: 'application-lifecycle'
        }
      };
    }

    const startTime = Date.now();
    this.status = ApplicationStatus.STARTING;
    this.startTime = startTime;

    try {
      console.log('🚀 Starting Novel Automation System V2...');
      
      // フェーズ1: インフラストラクチャサービス
      await this.initializePhase('Infrastructure Services', async () => {
        await this.registerInfrastructureServices();
      });

      // フェーズ2: ストレージサービス
      await this.initializePhase('Storage Services', async () => {
        await this.registerStorageServices();
      });

      // フェーズ3: コアサービス
      await this.initializePhase('Core Services', async () => {
        await this.registerCoreServices();
      });

      // フェーズ4: ビジネスサービス
      await this.initializePhase('Business Services', async () => {
        await this.registerBusinessServices();
      });

      // フェーズ5: プレゼンテーションサービス
      await this.initializePhase('Presentation Services', async () => {
        await this.registerPresentationServices();
      });

      // サービスコンテナ初期化
      const initResult = await this.container.initialize();
      if (!initResult.success) {
        throw new Error(`Container initialization failed: ${initResult.error?.message}`);
      }

      // ヘルスチェック開始
      this.startHealthChecking();

      this.status = ApplicationStatus.READY;
      const processingTime = Date.now() - startTime;

      console.log(`✅ Novel Automation System V2 started successfully in ${processingTime}ms`);

      return {
        success: true,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'application-lifecycle'
        }
      };

    } catch (error) {
      this.status = ApplicationStatus.ERROR;
      const processingTime = Date.now() - startTime;

      console.error('❌ Failed to start Novel Automation System V2:', error);

      return {
        success: false,
        error: {
          code: 'STARTUP_FAILED',
          message: error instanceof Error ? error.message : 'Unknown startup error',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'application-lifecycle'
        }
      };
    }
  }

  async stop(): Promise<OperationResult<void>> {
    if (this.shutdownPromise) {
      await this.shutdownPromise;
      return {
        success: true,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: 0,
          systemId: 'application-lifecycle'
        }
      };
    }

    const startTime = Date.now();
    this.status = ApplicationStatus.SHUTTING_DOWN;

    console.log('🛑 Stopping Novel Automation System V2...');

    this.shutdownPromise = this.performShutdown();

    try {
      await this.shutdownPromise;
      this.status = ApplicationStatus.STOPPED;
      const processingTime = Date.now() - startTime;

      console.log(`✅ Novel Automation System V2 stopped gracefully in ${processingTime}ms`);

      return {
        success: true,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'application-lifecycle'
        }
      };

    } catch (error) {
      this.status = ApplicationStatus.ERROR;
      const processingTime = Date.now() - startTime;

      console.error('❌ Error during shutdown:', error);

      return {
        success: false,
        error: {
          code: 'SHUTDOWN_FAILED',
          message: error instanceof Error ? error.message : 'Unknown shutdown error',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'application-lifecycle'
        }
      };
    } finally {
      this.shutdownPromise = null;
    }
  }

  async restart(): Promise<OperationResult<void>> {
    const stopResult = await this.stop();
    if (!stopResult.success) {
      return stopResult;
    }

    // 短い待機時間
    await new Promise(resolve => setTimeout(resolve, 1000));

    return await this.start();
  }

  // ============================================================================
  // ヘルスチェック
  // ============================================================================

  async checkHealth(): Promise<OperationResult<ApplicationHealth>> {
    const startTime = Date.now();

    try {
      // 修正: getHealth()メソッドを使用
      const healthResult = await this.container.getHealth();
      if (!healthResult.success || !healthResult.data) {
        throw new Error('Failed to get container health');
      }
      const containerHealth = healthResult.data;
      const systemResources = await this.getSystemResources();

      const health: ApplicationHealth = {
        status: this.determineApplicationStatus(containerHealth.overall),
        version: '2.0.0',
        uptime: Date.now() - this.startTime,
        environment: this.config.environment,
        systems: {
          container: this.mapHealthStateToContainerStatus(containerHealth.overall),
          services: containerHealth.systemMetrics.registeredServices,
          healthyServices: containerHealth.systemMetrics.activeServices
        },
        resources: systemResources,
        lastHealthCheck: new Date().toISOString()
      };

      return {
        success: true,
        data: health,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'application-lifecycle'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'HEALTH_CHECK_FAILED',
          message: error instanceof Error ? error.message : 'Health check failed',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'application-lifecycle'
        }
      };
    }
  }

  // ============================================================================
  // サービス登録
  // ============================================================================

  private async registerInfrastructureServices(): Promise<void> {
    // ロガーサービス
    this.container.registerSingleton('logger', async () => {
      const { Logger } = await import('../infrastructure/logger');
      return new Logger(this.config.logLevel);
    });

    // 設定管理サービス
    this.container.registerSingleton('configuration', async () => {
      const { ConfigurationManager } = await import('../infrastructure/configuration');
      return new ConfigurationManager(this.config);
    });

    // メトリクス収集サービス
    if (this.config.enableMetrics) {
      this.container.registerSingleton('metrics', async () => {
        const { MetricsCollector } = await import('../infrastructure/metrics');
        return new MetricsCollector();
      });
    }
  }

  private async registerStorageServices(): Promise<void> {
    // TODO: 実装後にコメントアウトを解除
    
    // ファイルストレージ
    this.container.registerSingleton('file-storage', async () => {
      // const { FileStorageManager } = await import('../../systems/storage/file-storage');
      // return new FileStorageManager();
      return { initialized: true }; // 仮実装
    });

    // データベース接続
    this.container.registerSingleton('database', async () => {
      // const { DatabaseManager } = await import('../../systems/storage/database');
      // return new DatabaseManager();
      return { initialized: true }; // 仮実装
    });

    // キャッシュシステム
    this.container.registerSingleton('cache', async () => {
      // const { CacheManager } = await import('../../systems/storage/cache');
      // return new CacheManager();
      return { initialized: true }; // 仮実装
    });
  }

  private async registerCoreServices(): Promise<void> {
    // 統一AIクライアント
    this.container.registerSingleton('ai-client', async (container) => {
      const { UnifiedAIClient } = await import('../ai-client/unified-ai-client');
      const logger = await container.get('logger');
      const cache = await container.get('cache');
      return new UnifiedAIClient({ logger, cache });
    });

    // メモリ管理システム（TODO: 実装後にコメントアウト解除）
    this.container.registerSingleton('memory-manager', async () => {
      // const { MemoryManager } = await import('../../systems/memory/memory-manager');
      // const storage = await container.get('file-storage');
      // const cache = await container.get('cache');
      // return new MemoryManager({ storage, cache });
      return { initialized: true }; // 仮実装
    });

    // イベントバス（TODO: 実装後にコメントアウト解除）
    this.container.registerSingleton('event-bus', async () => {
      // const { EventBus } = await import('../event-bus/event-bus');
      // return new EventBus();
      return { initialized: true }; // 仮実装
    });
  }

  private async registerBusinessServices(): Promise<void> {
    // TODO: 各システム実装後にコメントアウト解除
    
    // キャラクター管理
    this.container.registerSingleton('character-manager', async () => {
      const { CharacterManager } = await import('../../systems/character/core/character-manager');
      // const memoryManager = await container.get('memory-manager');
      // const eventBus = await container.get('event-bus');
      return new CharacterManager();
    });

    // ストーリー管理
    this.container.registerSingleton('story-manager', async () => {
      // const { StoryManager } = await import('../../systems/story/story-manager');
      // const memoryManager = await container.get('memory-manager');
      // const aiClient = await container.get('ai-client');
      // return new StoryManager({ memoryManager, aiClient });
      return { initialized: true }; // 仮実装
    });

    // 学習管理
    this.container.registerSingleton('learning-manager', async () => {
      const { LearningJourneyManager } = await import('../../systems/learning/core/learning-journey-manager');
      // const memoryManager = await container.get('memory-manager');
      // const aiClient = await container.get('ai-client');
      return new LearningJourneyManager();
    });

    // 品質管理
    this.container.registerSingleton('quality-manager', async () => {
      // const { QualityManager } = await import('../../systems/quality/quality-manager');
      // const memoryManager = await container.get('memory-manager');
      // const aiClient = await container.get('ai-client');
      // return new QualityManager({ memoryManager, aiClient });
      return { initialized: true }; // 仮実装
    });
  }

  private async registerPresentationServices(): Promise<void> {
    // TODO: プレゼンテーション層実装後にコメントアウト解除
    
    // API管理
    this.container.registerSingleton('api-manager', async () => {
      // const { APIManager } = await import('../../presentation/api/api-manager');
      // return new APIManager(container);
      return { initialized: true }; // 仮実装
    });

    // 管理画面サービス
    this.container.registerSingleton('admin-service', async () => {
      // const { AdminService } = await import('../../presentation/admin/admin-service');
      // return new AdminService(container);
      return { initialized: true }; // 仮実装
    });
  }

  // ============================================================================
  // ユーティリティ
  // ============================================================================

  private async initializePhase(phaseName: string, initFunction: () => Promise<void>): Promise<void> {
    console.log(`📋 Initializing ${phaseName}...`);
    
    try {
      await initFunction();
      console.log(`✅ ${phaseName} initialized successfully`);
    } catch (error) {
      console.error(`❌ Failed to initialize ${phaseName}:`, error);
      throw new ServiceContainerError(`Failed to initialize ${phaseName}`, undefined, undefined, error as Error);
    }
  }

  private async performShutdown(): Promise<void> {
    // ヘルスチェック停止
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // グレースフル期間の設定
    const shutdownTimeout = setTimeout(() => {
      console.warn('⚠️  Forced shutdown due to timeout');
      process.exit(1);
    }, this.config.shutdownGracePeriod);

    try {
      // サービスコンテナのシャットダウン
      const shutdownResult = await this.container.shutdown();
      if (!shutdownResult.success) {
        throw new Error(`Container shutdown failed: ${shutdownResult.error?.message}`);
      }
      
      clearTimeout(shutdownTimeout);
    } catch (error) {
      clearTimeout(shutdownTimeout);
      throw error;
    }
  }

  private setupProcessHandlers(): void {
    // グレースフルシャットダウン
    process.on('SIGTERM', () => {
      console.log('📝 Received SIGTERM, starting graceful shutdown...');
      this.stop().catch(error => {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
      });
    });

    process.on('SIGINT', () => {
      console.log('📝 Received SIGINT, starting graceful shutdown...');
      this.stop().catch(error => {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
      });
    });

    // エラーハンドリング
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      this.stop().finally(() => process.exit(1));
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      this.stop().finally(() => process.exit(1));
    });
  }

  private determineApplicationStatus(healthState: any): ApplicationStatus {
    // HealthState enum values from container
    switch (healthState) {
      case 'HEALTHY':
        return ApplicationStatus.READY;
      case 'DEGRADED':
        return ApplicationStatus.DEGRADED;
      case 'UNHEALTHY':
      case 'UNKNOWN':
        return ApplicationStatus.ERROR;
      default:
        return ApplicationStatus.DEGRADED;
    }
  }

  private mapHealthStateToContainerStatus(healthState: any): ContainerStatus {
    // Map HealthState to ContainerStatus
    switch (healthState) {
      case 'HEALTHY':
        return ContainerStatus.READY;
      case 'DEGRADED':
        return ContainerStatus.DEGRADED;
      case 'UNHEALTHY':
        return ContainerStatus.ERROR;
      case 'UNKNOWN':
        return ContainerStatus.UNKNOWN;
      default:
        return ContainerStatus.UNKNOWN;
    }
  }

  private async getSystemResources(): Promise<{ memory: number; cpu: number; disk: number }> {
    // Node.js メモリ使用量
    const memoryUsage = process.memoryUsage();
    const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);

    return {
      memory: memoryMB,
      cpu: 0, // CPU使用率は別途実装が必要
      disk: 0  // ディスク使用量は別途実装が必要
    };
  }

  private startHealthChecking(): void {
    if (this.config.enableHealthChecks) {
      this.healthCheckInterval = setInterval(async () => {
        try {
          const healthResult = await this.checkHealth();
          if (!healthResult.success) {
            console.warn('⚠️  Health check failed:', healthResult.error);
          }
        } catch (error) {
          console.error('❌ Health check error:', error);
        }
      }, 30000); // 30秒間隔
    }
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  // ============================================================================
  // パブリックアクセサー
  // ============================================================================

  getContainer(): ServiceContainer {
    return this.container;
  }

  getStatus(): ApplicationStatus {
    return this.status;
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }

  getConfig(): ApplicationConfig {
    return { ...this.config };
  }
}