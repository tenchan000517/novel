// src\lib\lifecycle\application-lifecycle-manager.ts

/**
 * @fileoverview アプリケーションライフサイクル一元管理システム
 * @description システム全体の初期化を段階的に管理する唯一の責任者
 */

import { ServiceContainer } from './service-container';
import { logger } from '../utils/logger';

export enum LifecycleStage {
  NOT_STARTED = 'NOT_STARTED',
  INFRASTRUCTURE = 'INFRASTRUCTURE',    // Logger, EventBus
  STORAGE = 'STORAGE',                  // StorageProvider
  MEMORY = 'MEMORY',                    // MemoryManager
  CORE_SERVICES = 'CORE_SERVICES',      // ParameterManager, GeminiClient
  FACADES = 'FACADES',                  // All Manager Classes
  READY = 'READY'                       // Application Ready
}

interface LifecycleStageResult {
  stage: LifecycleStage;
  success: boolean;
  duration: number;
  error?: string;
}

/**
 * アプリケーションライフサイクル一元管理クラス
 * システム全体の初期化を段階的に実行する唯一の責任者
 */
export class ApplicationLifecycleManager {
  private serviceContainer: ServiceContainer;
  private currentStage: LifecycleStage = LifecycleStage.NOT_STARTED;
  private stageHistory: LifecycleStageResult[] = [];
  private startTime: number = 0;

  constructor() {
    this.serviceContainer = new ServiceContainer();
    logger.info('ApplicationLifecycleManager created');
  }

  /**
   * システム全体の初期化を段階的に実行
   * 各段階で失敗した場合は即座に停止
   */
  async initialize(): Promise<void> {
    if (this.currentStage !== LifecycleStage.NOT_STARTED) {
      logger.warn('System already initialized or in progress');
      return;
    }

    this.startTime = Date.now();
    logger.info('Starting application lifecycle initialization');

    try {
      // Stage 1: Infrastructure (Logger, EventBus)
      await this.executeStage(LifecycleStage.INFRASTRUCTURE, () => 
        this.serviceContainer.initializeInfrastructure()
      );
      
      // Stage 2: Storage (StorageProvider)
      await this.executeStage(LifecycleStage.STORAGE, () => 
        this.serviceContainer.initializeStorage()
      );
      
      // Stage 3: Memory System (MemoryManager)
      await this.executeStage(LifecycleStage.MEMORY, () => 
        this.serviceContainer.initializeMemorySystem()
      );
      
      // Stage 4: Core Services (ParameterManager, GeminiClient)
      await this.executeStage(LifecycleStage.CORE_SERVICES, () => 
        this.serviceContainer.initializeCoreServices()
      );
      
      // Stage 5: Facades (All Manager Classes)
      await this.executeStage(LifecycleStage.FACADES, () => 
        this.serviceContainer.initializeFacades()
      );
      
      // Stage 6: Application Ready
      this.currentStage = LifecycleStage.READY;
      
      const totalTime = Date.now() - this.startTime;
      logger.info('Application lifecycle initialization completed', {
        totalTime,
        stages: this.stageHistory.length
      });

    } catch (error) {
      logger.error('Application lifecycle initialization failed', {
        currentStage: this.currentStage,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 段階的実行ヘルパー
   */
  private async executeStage(
    stage: LifecycleStage, 
    execution: () => Promise<void>
  ): Promise<void> {
    const stageStart = Date.now();
    logger.info(`Starting lifecycle stage: ${stage}`);

    try {
      await execution();
      
      const duration = Date.now() - stageStart;
      this.currentStage = stage;
      this.stageHistory.push({
        stage,
        success: true,
        duration
      });

      logger.info(`Lifecycle stage completed: ${stage}`, { duration });

    } catch (error) {
      const duration = Date.now() - stageStart;
      this.stageHistory.push({
        stage,
        success: false,
        duration,
        error: error instanceof Error ? error.message : String(error)
      });

      logger.error(`Lifecycle stage failed: ${stage}`, {
        duration,
        error: error instanceof Error ? error.message : String(error)
      });

      throw error;
    }
  }

  /**
   * 現在のライフサイクル状態を取得
   */
  getStatus(): {
    currentStage: LifecycleStage;
    isReady: boolean;
    history: LifecycleStageResult[];
    totalInitializationTime: number;
  } {
    return {
      currentStage: this.currentStage,
      isReady: this.currentStage === LifecycleStage.READY,
      history: [...this.stageHistory],
      totalInitializationTime: this.startTime ? Date.now() - this.startTime : 0
    };
  }

  /**
   * サービスコンテナへのアクセス
   * 初期化完了後のみ使用可能
   */
  getServiceContainer(): ServiceContainer {
    if (this.currentStage !== LifecycleStage.READY) {
      throw new Error('Application not ready - services not available');
    }
    return this.serviceContainer;
  }
}

// シングルトンインスタンス
export const applicationLifecycleManager = new ApplicationLifecycleManager();