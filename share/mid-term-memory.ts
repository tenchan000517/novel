// src\lib\memory copy\mid-term\mid-term-memory.ts
/**
 * @fileoverview 中期記憶統合ファサード - 中期記憶階層
 * @description
 * 5つの中期記憶コンポーネントを統合し、統一APIを提供するファサードクラス。
 * AnalysisResults、CharacterEvolution、NarrativeProgression、QualityMetrics、SystemStatisticsを統合管理します。
 */

import { logger } from '@/lib/utils/logger';
import { Chapter } from '@/types/chapters';
import { IMemoryLayer, OperationResult, DiagnosticsResult, StatusResult } from '../core/interfaces';

// 既存コンポーネントのimport
import { AnalysisResultsManager } from './analysis-results';
import { CharacterEvolutionManager } from './character-evolution';
import { NarrativeProgressionManager } from './narrative-progression';

/**
 * @interface QualityMetricsManager
 * @description 品質指標管理の基本インターフェース（実装が必要）
 */
interface QualityMetricsManager {
  initialize?(): Promise<void>;
  updateFromChapter?(chapter: Chapter): Promise<void>;
  save?(): Promise<void>;
  cleanup?(): Promise<void>;
  getQualityScore?(): number;
  getMetrics?(): Record<string, number>;
}

/**
 * @interface SystemStatisticsManager  
 * @description システム統計管理の基本インターフェース（実装が必要）
 */
interface SystemStatisticsManager {
  initialize?(): Promise<void>;
  updateFromChapter?(chapter: Chapter): Promise<void>;
  save?(): Promise<void>;
  cleanup?(): Promise<void>;
  getStatistics?(): Record<string, any>;
  getPerformanceMetrics?(): Record<string, number>;
}

/**
 * @interface MidTermMemoryConfig
 * @description 中期記憶設定
 */
export interface MidTermMemoryConfig {
  maxAnalysisResults: number;
  enableEvolutionTracking: boolean;
  enableProgressionAnalysis: boolean;
  qualityThreshold: number;
}

/**
 * @class MidTermMemory
 * @description 中期記憶統合管理クラス
 */
export class MidTermMemory implements IMemoryLayer {
  private config: MidTermMemoryConfig;
  private initialized: boolean = false;
  
  // 既存コンポーネント
  private analysisResults!: AnalysisResultsManager;
  private characterEvolution!: CharacterEvolutionManager;
  private narrativeProgression!: NarrativeProgressionManager;
  private qualityMetrics!: QualityMetricsManager;
  private systemStatistics!: SystemStatisticsManager;

  constructor(config: MidTermMemoryConfig) {
    this.config = config;
  }

  /**
   * 初期化処理
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.info('MidTermMemory already initialized');
      return;
    }
    
    try {
      logger.info('Initializing MidTermMemory components');

      // 各コンポーネントを初期化
      this.analysisResults = new AnalysisResultsManager();
      this.characterEvolution = new CharacterEvolutionManager();
      this.narrativeProgression = new NarrativeProgressionManager();
      
      // 品質指標とシステム統計は基本実装（実装が完了していない場合）
      this.qualityMetrics = this.createQualityMetricsStub();
      this.systemStatistics = this.createSystemStatisticsStub();
      
      // 各コンポーネントの初期化
      await Promise.all([
        this.initializeComponentIfExists(this.analysisResults, 'AnalysisResults'),
        this.initializeComponentIfExists(this.characterEvolution, 'CharacterEvolution'),
        this.initializeComponentIfExists(this.narrativeProgression, 'NarrativeProgression'),
        this.initializeComponentIfExists(this.qualityMetrics, 'QualityMetrics'),
        this.initializeComponentIfExists(this.systemStatistics, 'SystemStatistics')
      ]);
      
      this.initialized = true;
      logger.info('MidTermMemory initialized successfully with 5 components');
      
    } catch (error) {
      logger.error('Failed to initialize MidTermMemory', { 
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 章を追加し、全中期記憶コンポーネントを更新
   */
  async addChapter(chapter: Chapter): Promise<OperationResult> {
    if (!this.initialized) {
      throw new Error('MidTermMemory not initialized');
    }

    const startTime = Date.now();
    logger.info(`Processing chapter ${chapter.chapterNumber} through MidTermMemory`, {
      chapterNumber: chapter.chapterNumber,
      chapterTitle: chapter.title
    });

    try {
      // 5つのコンポーネントを協調させる統合処理
      const results = await Promise.allSettled([
        this.processAnalysisResults(chapter),
        this.processCharacterEvolution(chapter),
        this.processNarrativeProgression(chapter),
        this.processQualityMetrics(chapter),
        this.processSystemStatistics(chapter)
      ]);

      // 結果の集約と評価
      const failedOperations = results.filter(r => r.status === 'rejected');
      const successfulOperations = results.filter(r => r.status === 'fulfilled');
      const success = failedOperations.length === 0;
      
      const processingTime = Date.now() - startTime;
      
      // エラー詳細のログ出力
      if (failedOperations.length > 0) {
        failedOperations.forEach((result, index) => {
          if (result.status === 'rejected') {
            logger.error(`MidTermMemory component ${index} failed`, {
              error: result.reason instanceof Error ? result.reason.message : String(result.reason)
            });
          }
        });
      }
      
      logger.info(`MidTermMemory addChapter completed`, {
        chapterNumber: chapter.chapterNumber,
        success,
        processingTime,
        successfulOperations: successfulOperations.length,
        failedOperations: failedOperations.length,
        totalOperations: results.length
      });

      return {
        success,
        processingTime,
        error: failedOperations.length > 0 ? 
          `${failedOperations.length} out of ${results.length} operations failed` : undefined,
        metadata: {
          chapterNumber: chapter.chapterNumber,
          successfulOperations: successfulOperations.length,
          failedOperations: failedOperations.length,
          totalOperations: results.length,
          components: {
            analysisResults: results[0].status === 'fulfilled',
            characterEvolution: results[1].status === 'fulfilled',
            narrativeProgression: results[2].status === 'fulfilled',
            qualityMetrics: results[3].status === 'fulfilled',
            systemStatistics: results[4].status === 'fulfilled'
          }
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('MidTermMemory addChapter failed', { 
        chapterNumber: chapter.chapterNumber,
        error: error instanceof Error ? error.message : String(error),
        processingTime
      });

      return {
        success: false,
        processingTime,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          chapterNumber: chapter.chapterNumber,
          totalOperations: 5,
          failedAt: 'initialization'
        }
      };
    }
  }

  /**
   * 診断情報を取得
   */
  async getDiagnostics(): Promise<DiagnosticsResult> {
    if (!this.initialized) {
      return {
        healthy: false,
        issues: ['MidTermMemory not initialized'],
        metrics: {},
        lastCheck: new Date().toISOString()
      };
    }

    try {
      const issues: string[] = [];
      const metrics: Record<string, number> = {};

      // 各コンポーネントの健全性チェック
      const componentChecks = [
        { name: 'analysisResults', component: this.analysisResults },
        { name: 'characterEvolution', component: this.characterEvolution },
        { name: 'narrativeProgression', component: this.narrativeProgression },
        { name: 'qualityMetrics', component: this.qualityMetrics },
        { name: 'systemStatistics', component: this.systemStatistics }
      ];

      for (const check of componentChecks) {
        try {
          if (check.component) {
            metrics[`${check.name}_available`] = 1;
          } else {
            issues.push(`${check.name} component not available`);
            metrics[`${check.name}_available`] = 0;
          }
        } catch (error) {
          issues.push(`${check.name} health check failed: ${error instanceof Error ? error.message : String(error)}`);
          metrics[`${check.name}_available`] = 0;
        }
      }

      // 品質メトリクスの取得
      if (this.qualityMetrics && typeof this.qualityMetrics.getQualityScore === 'function') {
        try {
          metrics.qualityScore = this.qualityMetrics.getQualityScore();
        } catch (error) {
          issues.push('Quality score unavailable');
        }
      }

      const healthy = issues.length === 0;

      return {
        healthy,
        issues,
        metrics: {
          ...metrics,
          totalComponents: 5,
          activeComponents: Object.values(metrics).filter(v => v === 1).length,
          initializationStatus: this.initialized ? 1 : 0
        },
        lastCheck: new Date().toISOString()
      };

    } catch (error) {
      return {
        healthy: false,
        issues: [`Diagnostics failed: ${error instanceof Error ? error.message : String(error)}`],
        metrics: { error: 1 },
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * ステータス情報を取得
   */
  async getStatus(): Promise<StatusResult> {
    try {
      let dataCount = 0;
      let memoryUsage = 0;

      // 各コンポーネントのデータ数を集計
      if (this.analysisResults) {
        try {
          const stats = this.analysisResults.getAnalysisStatistics();
          dataCount += stats.emotionalAnalysisCount + stats.textAnalysisCount + 
                     stats.detectionCount + stats.preGenerationCount + stats.postGenerationCount;
        } catch (error) {
          logger.debug('Failed to get analysis results statistics', { error });
        }
      }

      if (this.characterEvolution) {
        try {
          const stats = this.characterEvolution.getEvolutionStatistics();
          dataCount += stats.totalDevelopments + stats.totalChanges + 
                     stats.totalRelationshipEvolutions + stats.totalPsychologyEvolutions;
        } catch (error) {
          logger.debug('Failed to get character evolution statistics', { error });
        }
      }

      if (this.narrativeProgression) {
        try {
          const stats = this.narrativeProgression.getStatistics();
          dataCount += stats.totalTurningPoints + stats.completedArcs + stats.analysisResultsCount;
        } catch (error) {
          logger.debug('Failed to get narrative progression statistics', { error });
        }
      }

      return {
        initialized: this.initialized,
        dataCount,
        lastUpdate: new Date().toISOString(),
        memoryUsage
      };

    } catch (error) {
      logger.error('Failed to get MidTermMemory status', { 
        error: error instanceof Error ? error.message : String(error)
      });
      
      return {
        initialized: this.initialized,
        dataCount: 0,
        lastUpdate: new Date().toISOString(),
        memoryUsage: 0
      };
    }
  }

  /**
   * データサイズを取得
   */
  async getDataSize(): Promise<number> {
    try {
      let totalSize = 0;

      // 各コンポーネントのデータサイズを推定
      const status = await this.getStatus();
      
      // データ数に基づく概算サイズ計算
      totalSize = status.dataCount * 1024; // 1KB per record (概算)

      return totalSize;
    } catch (error) {
      logger.error('Failed to calculate MidTermMemory data size', { 
        error: error instanceof Error ? error.message : String(error)
      });
      return 0;
    }
  }

  /**
   * データを保存
   */
  async save(): Promise<void> {
    if (!this.initialized) {
      throw new Error('MidTermMemory not initialized');
    }

    try {
      logger.info('Saving MidTermMemory data');

      // 各コンポーネントの保存を並行実行
      const saveOperations = [
        this.saveComponentIfExists(this.analysisResults, 'AnalysisResults'),
        this.saveComponentIfExists(this.characterEvolution, 'CharacterEvolution'), 
        this.saveComponentIfExists(this.narrativeProgression, 'NarrativeProgression'),
        this.saveComponentIfExists(this.qualityMetrics, 'QualityMetrics'),
        this.saveComponentIfExists(this.systemStatistics, 'SystemStatistics')
      ];

      const results = await Promise.allSettled(saveOperations);
      const failedSaves = results.filter(r => r.status === 'rejected');

      if (failedSaves.length > 0) {
        logger.warn(`${failedSaves.length} components failed to save`, {
          failedCount: failedSaves.length,
          totalCount: results.length
        });
      } else {
        logger.info('All MidTermMemory components saved successfully');
      }

    } catch (error) {
      logger.error('Failed to save MidTermMemory', { 
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * リソースのクリーンアップ
   */
  async cleanup(): Promise<void> {
    try {
      logger.info('Cleaning up MidTermMemory resources');

      // 各コンポーネントのクリーンアップ
      const cleanupOperations = [
        this.cleanupComponentIfExists(this.analysisResults, 'AnalysisResults'),
        this.cleanupComponentIfExists(this.characterEvolution, 'CharacterEvolution'),
        this.cleanupComponentIfExists(this.narrativeProgression, 'NarrativeProgression'),
        this.cleanupComponentIfExists(this.qualityMetrics, 'QualityMetrics'),
        this.cleanupComponentIfExists(this.systemStatistics, 'SystemStatistics')
      ];

      await Promise.allSettled(cleanupOperations);
      
      this.initialized = false;
      logger.info('MidTermMemory cleanup completed');

    } catch (error) {
      logger.error('Failed to cleanup MidTermMemory', { 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // ============================================================================
  // プライベートヘルパーメソッド
  // ============================================================================

  /**
   * コンポーネントが存在する場合に初期化
   */
  private async initializeComponentIfExists(component: any, name: string): Promise<void> {
    try {
      if (component && typeof component.initialize === 'function') {
        await component.initialize();
        logger.debug(`${name} component initialized`);
      } else {
        logger.debug(`${name} component has no initialize method or is undefined`);
      }
    } catch (error) {
      logger.error(`Failed to initialize ${name} component`, { 
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * コンポーネントが存在する場合に保存
   */
  private async saveComponentIfExists(component: any, name: string): Promise<void> {
    try {
      if (component && typeof component.save === 'function') {
        await component.save();
        logger.debug(`${name} component saved`);
      }
    } catch (error) {
      logger.error(`Failed to save ${name} component`, { 
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * コンポーネントが存在する場合にクリーンアップ
   */
  private async cleanupComponentIfExists(component: any, name: string): Promise<void> {
    try {
      if (component && typeof component.cleanup === 'function') {
        await component.cleanup();
        logger.debug(`${name} component cleaned up`);
      }
    } catch (error) {
      logger.error(`Failed to cleanup ${name} component`, { 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 分析結果を処理
   */
  private async processAnalysisResults(chapter: Chapter): Promise<void> {
    try {
      if (this.analysisResults && typeof this.analysisResults.updateFromChapter === 'function') {
        await this.analysisResults.updateFromChapter(chapter);
        logger.debug(`Analysis results processed for chapter ${chapter.chapterNumber}`);
      }
    } catch (error) {
      logger.error('Failed to process analysis results', {
        chapterNumber: chapter.chapterNumber,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * キャラクター進化を処理
   */
  private async processCharacterEvolution(chapter: Chapter): Promise<void> {
    try {
      if (this.characterEvolution && typeof this.characterEvolution.updateFromChapter === 'function') {
        await this.characterEvolution.updateFromChapter(chapter);
        logger.debug(`Character evolution processed for chapter ${chapter.chapterNumber}`);
      }
    } catch (error) {
      logger.error('Failed to process character evolution', {
        chapterNumber: chapter.chapterNumber,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 物語進行を処理  
   */
  private async processNarrativeProgression(chapter: Chapter): Promise<void> {
    try {
      if (this.narrativeProgression && typeof this.narrativeProgression.updateFromChapter === 'function') {
        await this.narrativeProgression.updateFromChapter(chapter);
        logger.debug(`Narrative progression processed for chapter ${chapter.chapterNumber}`);
      }
    } catch (error) {
      logger.error('Failed to process narrative progression', {
        chapterNumber: chapter.chapterNumber,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 品質指標を処理
   */
  private async processQualityMetrics(chapter: Chapter): Promise<void> {
    try {
      if (this.qualityMetrics && typeof this.qualityMetrics.updateFromChapter === 'function') {
        await this.qualityMetrics.updateFromChapter(chapter);
        logger.debug(`Quality metrics processed for chapter ${chapter.chapterNumber}`);
      }
    } catch (error) {
      logger.error('Failed to process quality metrics', {
        chapterNumber: chapter.chapterNumber,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * システム統計を処理
   */
  private async processSystemStatistics(chapter: Chapter): Promise<void> {
    try {
      if (this.systemStatistics && typeof this.systemStatistics.updateFromChapter === 'function') {
        await this.systemStatistics.updateFromChapter(chapter);
        logger.debug(`System statistics processed for chapter ${chapter.chapterNumber}`);
      }
    } catch (error) {
      logger.error('Failed to process system statistics', {
        chapterNumber: chapter.chapterNumber,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 品質指標の基本実装を作成（実装が完了していない場合）
   */
  private createQualityMetricsStub(): QualityMetricsManager {
    return {
      async initialize() {
        logger.debug('QualityMetrics stub initialized');
      },
      async updateFromChapter(chapter: Chapter) {
        logger.debug(`QualityMetrics stub processing chapter ${chapter.chapterNumber}`);
      },
      async save() {
        logger.debug('QualityMetrics stub saved');
      },
      async cleanup() {
        logger.debug('QualityMetrics stub cleaned up');
      },
      getQualityScore() {
        return 7.5; // デフォルト品質スコア
      },
      getMetrics() {
        return {
          readabilityScore: 8.0,
          consistencyScore: 7.5,
          engagementScore: 7.8
        };
      }
    };
  }

  /**
   * システム統計の基本実装を作成（実装が完了していない場合）
   */
  private createSystemStatisticsStub(): SystemStatisticsManager {
    return {
      async initialize() {
        logger.debug('SystemStatistics stub initialized');
      },
      async updateFromChapter(chapter: Chapter) {
        logger.debug(`SystemStatistics stub processing chapter ${chapter.chapterNumber}`);
      },
      async save() {
        logger.debug('SystemStatistics stub saved');
      },
      async cleanup() {
        logger.debug('SystemStatistics stub cleaned up');
      },
      getStatistics() {
        return {
          totalChaptersProcessed: 0,
          averageProcessingTime: 0,
          lastProcessed: new Date().toISOString()
        };
      },
      getPerformanceMetrics() {
        return {
          memoryUsage: 0,
          cpuUsage: 0,
          processingSpeed: 0
        };
      }
    };
  }

  // ============================================================================
  // パブリックアクセサーメソッド（便利機能）
  // ============================================================================

  /**
   * 分析結果管理インスタンスを取得
   */
  getAnalysisResults(): AnalysisResultsManager | null {
    return this.analysisResults || null;
  }

  /**
   * キャラクター進化管理インスタンスを取得
   */
  getCharacterEvolution(): CharacterEvolutionManager | null {
    return this.characterEvolution || null;
  }

  /**
   * 物語進行管理インスタンスを取得
   */
  getNarrativeProgression(): NarrativeProgressionManager | null {
    return this.narrativeProgression || null;
  }

  /**
   * 統合統計情報を取得
   */
  getIntegratedStatistics(): {
    analysisResults: any;
    characterEvolution: any;
    narrativeProgression: any;
    qualityScore: number;
    systemMetrics: any;
  } {
    try {
      return {
        analysisResults: this.analysisResults ? this.analysisResults.getAnalysisStatistics() : {},
        characterEvolution: this.characterEvolution ? this.characterEvolution.getEvolutionStatistics() : {},
        narrativeProgression: this.narrativeProgression ? this.narrativeProgression.getStatistics() : {},
        qualityScore: this.qualityMetrics && this.qualityMetrics.getQualityScore ? 
          this.qualityMetrics.getQualityScore() : 0,
        systemMetrics: this.systemStatistics && this.systemStatistics.getPerformanceMetrics ? 
          this.systemStatistics.getPerformanceMetrics() : {}
      };
    } catch (error) {
      logger.error('Failed to get integrated statistics', { 
        error: error instanceof Error ? error.message : String(error)
      });
      return {
        analysisResults: {},
        characterEvolution: {},
        narrativeProgression: {},
        qualityScore: 0,
        systemMetrics: {}
      };
    }
  }
}