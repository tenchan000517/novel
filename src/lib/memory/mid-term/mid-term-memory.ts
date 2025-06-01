/**
 * @fileoverview 中期記憶統合ファサード - 中期記憶階層（更新版）
 * @description
 * 5つの中期記憶コンポーネントを統合し、統一APIを提供するファサードクラス。
 * AnalysisResults、CharacterEvolution、NarrativeProgression、QualityMetrics、SystemStatisticsを統合管理します。
 * 実装版QualityMetricsManagerとSystemStatisticsManagerを統合。
 */

import { logger } from '@/lib/utils/logger';
import { Chapter } from '@/types/chapters';
import { IMemoryLayer, OperationResult, DiagnosticsResult, StatusResult } from '../core/interfaces';

// 既存コンポーネントのimport
import { AnalysisResultsManager } from './analysis-results';
import { CharacterEvolutionManager } from './character-evolution';
import { NarrativeProgressionManager } from './narrative-progression';

// 実装版コンポーネントのimport
import { QualityMetricsManager, QualityMetricsConfig } from './quality-metrics';
import { SystemStatisticsManager, SystemStatisticsConfig } from './system-statistics';

/**
 * @interface MidTermMemoryConfig
 * @description 中期記憶設定（拡張版）
 */
export interface MidTermMemoryConfig {
  maxAnalysisResults: number;
  enableEvolutionTracking: boolean;
  enableProgressionAnalysis: boolean;
  qualityThreshold: number;
  
  // 品質指標設定
  qualityMetrics?: Partial<QualityMetricsConfig>;
  
  // システム統計設定
  systemStatistics?: Partial<SystemStatisticsConfig>;
  
  // 統合設定
  enableCrossComponentAnalysis: boolean;
  enableRealTimeQualityMonitoring: boolean;
  enablePerformanceOptimization: boolean;
}

/**
 * @interface MidTermMemoryStatistics
 * @description 中期記憶統計情報
 */
export interface MidTermMemoryStatistics {
  analysisResults: {
    emotionalAnalysisCount: number;
    textAnalysisCount: number;
    detectionCount: number;
    preGenerationCount: number;
    postGenerationCount: number;
    averageConfidence: number;
    processingTimeAverage: number;
  };
  characterEvolution: {
    totalDevelopments: number;
    totalChanges: number;
    totalRelationshipEvolutions: number;
    totalPsychologyEvolutions: number;
    activeCharacterArcs: number;
    averageArcProgress: number;
  };
  narrativeProgression: {
    totalTurningPoints: number;
    completedArcs: number;
    analysisResultsCount: number;
    averageTensionChange: number;
  };
  qualityMetrics: {
    overall: string;
    averageScore: number;
    trend: string;
    recentImprovement: boolean;
    alertCount: number;
    topIssues: string[];
  };
  systemStatistics: Record<string, any>;
}

/**
 * @class MidTermMemory
 * @description 中期記憶統合管理クラス（実装版）
 */
export class MidTermMemory implements IMemoryLayer {
  private config: MidTermMemoryConfig;
  private initialized: boolean = false;
  
  // 既存コンポーネント
  private analysisResults!: AnalysisResultsManager;
  private characterEvolution!: CharacterEvolutionManager;
  private narrativeProgression!: NarrativeProgressionManager;
  
  // 実装版コンポーネント
  private qualityMetrics!: QualityMetricsManager;
  private systemStatistics!: SystemStatisticsManager;

  // 統合処理用
  private crossComponentAnalysisEnabled: boolean = false;
  private lastIntegratedAnalysis: string = '';
  private componentHealthStatus: Map<string, boolean> = new Map();

  constructor(config: MidTermMemoryConfig) {
    // デフォルト値を設定
    const defaultConfig: Partial<MidTermMemoryConfig> = {
      enableCrossComponentAnalysis: true,
      enableRealTimeQualityMonitoring: true,
      enablePerformanceOptimization: true
    };

    // ユーザー設定でデフォルト値をオーバーライド
    this.config = {
      ...defaultConfig,
      ...config
    };
    
    this.crossComponentAnalysisEnabled = this.config.enableCrossComponentAnalysis;
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
      logger.info('Initializing MidTermMemory components with enhanced integration');

      // 既存コンポーネントの初期化
      this.analysisResults = new AnalysisResultsManager();
      this.characterEvolution = new CharacterEvolutionManager();
      this.narrativeProgression = new NarrativeProgressionManager();
      
      // 実装版コンポーネントの初期化
      this.qualityMetrics = new QualityMetricsManager(this.config.qualityMetrics);
      this.systemStatistics = new SystemStatisticsManager(this.config.systemStatistics);
      
      // 各コンポーネントの初期化
      const initializationResults = await Promise.allSettled([
        this.initializeComponentWithHealth(this.analysisResults, 'AnalysisResults'),
        this.initializeComponentWithHealth(this.characterEvolution, 'CharacterEvolution'),
        this.initializeComponentWithHealth(this.narrativeProgression, 'NarrativeProgression'),
        this.initializeComponentWithHealth(this.qualityMetrics, 'QualityMetrics'),
        this.initializeComponentWithHealth(this.systemStatistics, 'SystemStatistics')
      ]);

      // 初期化結果の分析
      const successfulInitializations = initializationResults.filter(r => r.status === 'fulfilled').length;
      const failedInitializations = initializationResults.filter(r => r.status === 'rejected').length;

      if (failedInitializations > 0) {
        logger.warn(`${failedInitializations} components failed to initialize`, {
          successfulInitializations,
          failedInitializations
        });
      }

      // クロスコンポーネント分析の設定
      if (this.crossComponentAnalysisEnabled) {
        await this.setupCrossComponentAnalysis();
      }
      
      this.initialized = true;
      this.lastIntegratedAnalysis = new Date().toISOString();

      logger.info('MidTermMemory initialized successfully with enhanced integration', {
        componentsInitialized: successfulInitializations,
        componentsFailed: failedInitializations,
        crossComponentAnalysis: this.crossComponentAnalysisEnabled,
        qualityMonitoring: this.config.enableRealTimeQualityMonitoring
      });
      
    } catch (error) {
      logger.error('Failed to initialize MidTermMemory', { 
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 健康状態監視付きでコンポーネントを初期化
   * @private
   */
  private async initializeComponentWithHealth(component: any, name: string): Promise<void> {
    try {
      if (component && typeof component.initialize === 'function') {
        await component.initialize();
        this.componentHealthStatus.set(name, true);
        logger.debug(`${name} component initialized successfully`);
      } else {
        this.componentHealthStatus.set(name, false);
        logger.warn(`${name} component has no initialize method or is undefined`);
      }
    } catch (error) {
      this.componentHealthStatus.set(name, false);
      logger.error(`Failed to initialize ${name} component`, { 
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * クロスコンポーネント分析の設定
   * @private
   */
  private async setupCrossComponentAnalysis(): Promise<void> {
    try {
      logger.debug('Setting up cross-component analysis');
      
      // コンポーネント間の相関分析設定
      // 実際の実装では、各コンポーネントのデータ相関を分析する仕組みを構築
      
      logger.debug('Cross-component analysis setup completed');
    } catch (error) {
      logger.error('Failed to setup cross-component analysis', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 章を追加し、全中期記憶コンポーネントを統合更新
   */
  async addChapter(chapter: Chapter): Promise<OperationResult> {
    if (!this.initialized) {
      throw new Error('MidTermMemory not initialized');
    }

    const startTime = Date.now();
    logger.info(`Processing chapter ${chapter.chapterNumber} through enhanced MidTermMemory`, {
      chapterNumber: chapter.chapterNumber,
      chapterTitle: chapter.title,
      crossComponentAnalysis: this.crossComponentAnalysisEnabled
    });

    try {
      // 5つのコンポーネントを協調させる統合処理
      const processingResults = await Promise.allSettled([
        this.processAnalysisResults(chapter),
        this.processCharacterEvolution(chapter),
        this.processNarrativeProgression(chapter),
        this.processQualityMetrics(chapter),
        this.processSystemStatistics(chapter)
      ]);

      // 結果の詳細分析
      const componentResults = this.analyzeProcessingResults(processingResults);
      
      // クロスコンポーネント分析の実行
      if (this.crossComponentAnalysisEnabled) {
        await this.performCrossComponentAnalysis(chapter, componentResults);
      }

      // 統合品質チェック
      await this.performIntegratedQualityCheck(chapter, componentResults);

      const processingTime = Date.now() - startTime;
      const success = componentResults.failedOperations.length === 0;
      
      // 処理結果のログ
      if (componentResults.failedOperations.length > 0) {
        componentResults.failedOperations.forEach((result, index) => {
          if (result.status === 'rejected') {
            logger.error(`MidTermMemory component ${index} failed`, {
              error: result.reason instanceof Error ? result.reason.message : String(result.reason)
            });
          }
        });
      }
      
      logger.info(`Enhanced MidTermMemory addChapter completed`, {
        chapterNumber: chapter.chapterNumber,
        success,
        processingTime,
        successfulOperations: componentResults.successfulOperations.length,
        failedOperations: componentResults.failedOperations.length,
        totalOperations: processingResults.length,
        crossComponentAnalysis: this.crossComponentAnalysisEnabled
      });

      return {
        success,
        processingTime,
        error: componentResults.failedOperations.length > 0 ? 
          `${componentResults.failedOperations.length} out of ${processingResults.length} operations failed` : undefined,
        metadata: {
          chapterNumber: chapter.chapterNumber,
          successfulOperations: componentResults.successfulOperations.length,
          failedOperations: componentResults.failedOperations.length,
          totalOperations: processingResults.length,
          components: {
            analysisResults: processingResults[0].status === 'fulfilled',
            characterEvolution: processingResults[1].status === 'fulfilled',
            narrativeProgression: processingResults[2].status === 'fulfilled',
            qualityMetrics: processingResults[3].status === 'fulfilled',
            systemStatistics: processingResults[4].status === 'fulfilled'
          },
          crossComponentAnalysis: this.crossComponentAnalysisEnabled,
          integrationHealth: this.getIntegrationHealth(),
          qualityScore: await this.getIntegratedQualityScore()
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('Enhanced MidTermMemory addChapter failed', { 
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
          failedAt: 'initialization',
          componentHealth: Object.fromEntries(this.componentHealthStatus)
        }
      };
    }
  }

  /**
   * 処理結果を分析
   * @private
   */
  private analyzeProcessingResults(results: PromiseSettledResult<void>[]): {
    successfulOperations: PromiseFulfilledResult<void>[];
    failedOperations: PromiseRejectedResult[];
  } {
    const successfulOperations = results.filter(r => r.status === 'fulfilled') as PromiseFulfilledResult<void>[];
    const failedOperations = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
    
    return { successfulOperations, failedOperations };
  }

  /**
   * クロスコンポーネント分析を実行
   * @private
   */
  private async performCrossComponentAnalysis(chapter: Chapter, componentResults: any): Promise<void> {
    try {
      logger.debug(`Performing cross-component analysis for chapter ${chapter.chapterNumber}`);

      // 品質と進化の相関分析
      const qualityScore = this.qualityMetrics?.getQualityScore() || 0;
      const evolutionStats = this.characterEvolution?.getEvolutionStatistics();
      
      if (qualityScore > 0 && evolutionStats) {
        // 品質スコアとキャラクター進化の相関を分析
        const correlationStrength = this.calculateQualityEvolutionCorrelation(qualityScore, evolutionStats);
        
        if (correlationStrength > 0.7) {
          logger.info('Strong positive correlation detected between quality and character evolution', {
            chapterNumber: chapter.chapterNumber,
            qualityScore,
            correlationStrength
          });
        }
      }

      // 物語進行と品質の関係分析
      const narrativeStats = this.narrativeProgression?.getStatistics();
      if (narrativeStats && qualityScore > 0) {
        const narrativeQualityRelation = this.analyzeNarrativeQualityRelation(narrativeStats, qualityScore);
        
        if (narrativeQualityRelation.shouldOptimize) {
          logger.info('Narrative optimization opportunity detected', {
            chapterNumber: chapter.chapterNumber,
            recommendation: narrativeQualityRelation.recommendation
          });
        }
      }

      this.lastIntegratedAnalysis = new Date().toISOString();
    } catch (error) {
      logger.error('Cross-component analysis failed', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 品質-進化相関を計算
   * @private
   */
  private calculateQualityEvolutionCorrelation(qualityScore: number, evolutionStats: any): number {
    // 簡易相関計算
    const evolutionActivity = (evolutionStats.totalDevelopments + evolutionStats.totalChanges) / 100;
    const normalizedQuality = qualityScore / 10;
    
    return Math.min(1.0, Math.abs(normalizedQuality - evolutionActivity));
  }

  /**
   * 物語-品質関係を分析
   * @private
   */
  private analyzeNarrativeQualityRelation(narrativeStats: any, qualityScore: number): {
    shouldOptimize: boolean;
    recommendation: string;
  } {
    const turningPointDensity = narrativeStats.totalTurningPoints / Math.max(narrativeStats.completedArcs, 1);
    
    if (qualityScore < 6.0 && turningPointDensity < 2.0) {
      return {
        shouldOptimize: true,
        recommendation: 'Increase narrative tension with more turning points'
      };
    }
    
    if (qualityScore > 8.0 && turningPointDensity > 5.0) {
      return {
        shouldOptimize: true,
        recommendation: 'Consider reducing narrative complexity for better flow'
      };
    }
    
    return {
      shouldOptimize: false,
      recommendation: 'Narrative-quality balance is optimal'
    };
  }

  /**
   * 統合品質チェックを実行
   * @private
   */
  private async performIntegratedQualityCheck(chapter: Chapter, componentResults: any): Promise<void> {
    try {
      if (!this.config.enableRealTimeQualityMonitoring) return;

      const qualityScore = this.qualityMetrics?.getQualityScore() || 0;
      const systemStats = this.systemStatistics?.getPerformanceMetrics() || {};
      
      // 統合品質指標の計算
      const integratedQuality = this.calculateIntegratedQuality(qualityScore, systemStats, componentResults);
      
      if (integratedQuality < this.config.qualityThreshold) {
        logger.warn('Integrated quality below threshold', {
          chapterNumber: chapter.chapterNumber,
          integratedQuality,
          threshold: this.config.qualityThreshold,
          qualityScore,
          systemPerformance: systemStats.averageResponseTime || 0
        });
      }
    } catch (error) {
      logger.error('Integrated quality check failed', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 統合品質を計算
   * @private
   */
  private calculateIntegratedQuality(qualityScore: number, systemStats: any, componentResults: any): number {
    const qualityFactor = qualityScore / 10; // 0-1に正規化
    const performanceFactor = systemStats.averageResponseTime 
      ? Math.max(0, 1 - (systemStats.averageResponseTime / 5000)) // 5秒を基準
      : 0.8;
    const reliabilityFactor = componentResults.successfulOperations.length / 5; // 全5コンポーネント
    
    return (qualityFactor * 0.5 + performanceFactor * 0.3 + reliabilityFactor * 0.2);
  }

  /**
   * 診断情報を取得（拡張版）
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
          const isHealthy = this.componentHealthStatus.get(check.name) || false;
          metrics[`${check.name}_available`] = isHealthy ? 1 : 0;
          
          if (!isHealthy) {
            issues.push(`${check.name} component not healthy`);
          }
        } catch (error) {
          issues.push(`${check.name} health check failed: ${error instanceof Error ? error.message : String(error)}`);
          metrics[`${check.name}_available`] = 0;
        }
      }

      // 実装版コンポーネントからの詳細メトリクス
      if (this.qualityMetrics) {
        try {
          const qualityMetrics = this.qualityMetrics.getMetrics();
          Object.entries(qualityMetrics).forEach(([key, value]) => {
            metrics[`quality_${key}`] = typeof value === 'number' ? value : 0;
          });
        } catch (error) {
          issues.push('Quality metrics unavailable');
        }
      }

      if (this.systemStatistics) {
        try {
          const performanceMetrics = this.systemStatistics.getPerformanceMetrics();
          Object.entries(performanceMetrics).forEach(([key, value]) => {
            metrics[`performance_${key}`] = typeof value === 'number' ? value : 0;
          });
        } catch (error) {
          issues.push('System statistics unavailable');
        }
      }

      // 統合健全性の計算
      const integrationHealth = this.getIntegrationHealth();
      metrics.integrationHealth = integrationHealth;
      
      if (integrationHealth < 0.8) {
        issues.push('Integration health below optimal level');
      }

      const healthy = issues.length === 0;

      return {
        healthy,
        issues,
        metrics: {
          ...metrics,
          totalComponents: 5,
          activeComponents: Object.values(metrics).filter(v => v === 1).length,
          initializationStatus: this.initialized ? 1 : 0,
          crossComponentAnalysis: this.crossComponentAnalysisEnabled ? 1 : 0,
          lastIntegratedAnalysis: Date.now() - new Date(this.lastIntegratedAnalysis).getTime()
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
   * 統合健全性を取得
   * @private
   */
  private getIntegrationHealth(): number {
    const healthyComponents = Array.from(this.componentHealthStatus.values())
      .filter(healthy => healthy).length;
    const totalComponents = this.componentHealthStatus.size;
    
    return totalComponents > 0 ? healthyComponents / totalComponents : 0;
  }

  /**
   * ステータス情報を取得（拡張版）
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

      // 実装版コンポーネントからの統計
      if (this.qualityMetrics) {
        try {
          const qualityMetrics = this.qualityMetrics.getMetrics();
          dataCount += qualityMetrics.totalChaptersAnalyzed || 0;
        } catch (error) {
          logger.debug('Failed to get quality metrics statistics', { error });
        }
      }

      if (this.systemStatistics) {
        try {
          const performanceHistory = this.systemStatistics.getPerformanceHistory(10);
          dataCount += performanceHistory.length;
          
          // メモリ使用量の推定
          const recentPerformance = performanceHistory[0];
          if (recentPerformance) {
            memoryUsage = recentPerformance.memoryUsage;
          }
        } catch (error) {
          logger.debug('Failed to get system statistics', { error });
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

      // メモリ使用量を追加
      totalSize += status.memoryUsage || 0;

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
      logger.info('Saving enhanced MidTermMemory data');

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
        logger.info('All enhanced MidTermMemory components saved successfully');
      }

    } catch (error) {
      logger.error('Failed to save enhanced MidTermMemory', { 
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
      logger.info('Cleaning up enhanced MidTermMemory resources');

      // 各コンポーネントのクリーンアップ
      const cleanupOperations = [
        this.cleanupComponentIfExists(this.analysisResults, 'AnalysisResults'),
        this.cleanupComponentIfExists(this.characterEvolution, 'CharacterEvolution'),
        this.cleanupComponentIfExists(this.narrativeProgression, 'NarrativeProgression'),
        this.cleanupComponentIfExists(this.qualityMetrics, 'QualityMetrics'),
        this.cleanupComponentIfExists(this.systemStatistics, 'SystemStatistics')
      ];

      await Promise.allSettled(cleanupOperations);
      
      // 内部状態のクリーンアップ
      this.componentHealthStatus.clear();
      this.crossComponentAnalysisEnabled = false;
      this.initialized = false;
      
      logger.info('Enhanced MidTermMemory cleanup completed');

    } catch (error) {
      logger.error('Failed to cleanup enhanced MidTermMemory', { 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // ============================================================================
  // プライベートヘルパーメソッド
  // ============================================================================

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
   * 統合品質スコアを取得
   * @private
   */
  private async getIntegratedQualityScore(): Promise<number> {
    try {
      const qualityScore = this.qualityMetrics?.getQualityScore() || 0;
      const systemPerformance = this.systemStatistics?.getPerformanceMetrics();
      
      if (!systemPerformance) return qualityScore;
      
      // 品質とパフォーマンスの統合スコア
      const performanceFactor = systemPerformance.uptime / 100;
      const responseFactor = Math.max(0, 1 - (systemPerformance.averageResponseTime / 5000));
      
      return (qualityScore * 0.7 + performanceFactor * 5 * 0.2 + responseFactor * 5 * 0.1);
    } catch (error) {
      logger.error('Failed to calculate integrated quality score', { error });
      return 0;
    }
  }

  // ============================================================================
  // パブリックアクセサーメソッド（拡張版）
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
   * 品質指標管理インスタンスを取得
   */
  getQualityMetrics(): QualityMetricsManager | null {
    return this.qualityMetrics || null;
  }

  /**
   * システム統計管理インスタンスを取得
   */
  getSystemStatistics(): SystemStatisticsManager | null {
    return this.systemStatistics || null;
  }

  /**
   * 統合統計情報を取得（拡張版）
   */
  getIntegratedStatistics(): MidTermMemoryStatistics {
    try {
      return {
        analysisResults: this.analysisResults ? this.analysisResults.getAnalysisStatistics() : {
          emotionalAnalysisCount: 0,
          textAnalysisCount: 0,
          detectionCount: 0,
          preGenerationCount: 0,
          postGenerationCount: 0,
          averageConfidence: 0,
          processingTimeAverage: 0
        },
        characterEvolution: this.characterEvolution ? this.characterEvolution.getEvolutionStatistics() : {
          totalDevelopments: 0,
          totalChanges: 0,
          totalRelationshipEvolutions: 0,
          totalPsychologyEvolutions: 0,
          activeCharacterArcs: 0,
          averageArcProgress: 0
        },
        narrativeProgression: this.narrativeProgression ? this.narrativeProgression.getStatistics() : {
          totalTurningPoints: 0,
          completedArcs: 0,
          analysisResultsCount: 0,
          averageTensionChange: 0
        },
        qualityMetrics: this.qualityMetrics ? this.qualityMetrics.getQualitySummary() : {
          overall: 'UNKNOWN',
          averageScore: 0,
          trend: 'STABLE',
          recentImprovement: false,
          alertCount: 0,
          topIssues: []
        },
        systemStatistics: this.systemStatistics ? this.systemStatistics.getStatistics() : {}
      };
    } catch (error) {
      logger.error('Failed to get integrated statistics', { 
        error: error instanceof Error ? error.message : String(error)
      });
      return {
        analysisResults: { emotionalAnalysisCount: 0, textAnalysisCount: 0, detectionCount: 0, preGenerationCount: 0, postGenerationCount: 0, averageConfidence: 0, processingTimeAverage: 0 },
        characterEvolution: { totalDevelopments: 0, totalChanges: 0, totalRelationshipEvolutions: 0, totalPsychologyEvolutions: 0, activeCharacterArcs: 0, averageArcProgress: 0 },
        narrativeProgression: { totalTurningPoints: 0, completedArcs: 0, analysisResultsCount: 0, averageTensionChange: 0 },
        qualityMetrics: { overall: 'ERROR', averageScore: 0, trend: 'UNKNOWN', recentImprovement: false, alertCount: 0, topIssues: [] },
        systemStatistics: {}
      };
    }
  }

  /**
   * 最適化推奨事項を取得
   */
  getOptimizationRecommendations(): {
    urgent: string[];
    suggested: string[];
    informational: string[];
  } {
    const recommendations = {
      urgent: [] as string[],
      suggested: [] as string[],
      informational: [] as string[]
    };

    try {
      // 品質指標からの推奨事項
      if (this.qualityMetrics) {
        const qualityScore = this.qualityMetrics.getQualityScore();
        if (qualityScore < this.config.qualityThreshold) {
          recommendations.urgent.push(`Quality score ${qualityScore.toFixed(2)} below threshold ${this.config.qualityThreshold}`);
        }

        const activeAlerts = this.qualityMetrics.getActiveAlerts();
        if (activeAlerts.length > 0) {
          recommendations.urgent.push(`${activeAlerts.length} active quality alerts need attention`);
        }
      }

      // システム統計からの推奨事項
      if (this.systemStatistics) {
        const performanceMetrics = this.systemStatistics.getPerformanceMetrics();
        if (performanceMetrics.averageResponseTime > 3000) {
          recommendations.suggested.push('Consider optimizing system response time');
        }

        if (performanceMetrics.errorRate > 2.0) {
          recommendations.urgent.push('High error rate detected - investigate system stability');
        }
      }

      // 統合健全性からの推奨事項
      const integrationHealth = this.getIntegrationHealth();
      if (integrationHealth < 0.8) {
        recommendations.suggested.push('Some components are not operating optimally');
      }

      // クロスコンポーネント分析からの推奨事項
      if (this.crossComponentAnalysisEnabled) {
        recommendations.informational.push('Cross-component analysis is active');
      } else {
        recommendations.suggested.push('Enable cross-component analysis for better insights');
      }

    } catch (error) {
      recommendations.urgent.push('Failed to analyze system state for recommendations');
    }

    return recommendations;
  }

  /**
   * システム健全性レポートを取得
   */
  getSystemHealthReport(): {
    overallHealth: number;
    componentHealth: Record<string, boolean>;
    qualityTrend: string;
    performanceTrend: string;
    recommendations: string[];
    lastUpdate: string;
  } {
    const integrationHealth = this.getIntegrationHealth();
    const componentHealth = Object.fromEntries(this.componentHealthStatus);
    
    let qualityTrend = 'STABLE';
    let performanceTrend = 'STABLE';

    try {
      if (this.qualityMetrics) {
        const qualitySummary = this.qualityMetrics.getQualitySummary();
        qualityTrend = qualitySummary.trend;
      }

      if (this.systemStatistics) {
        const performanceHistory = this.systemStatistics.getPerformanceHistory(5);
        if (performanceHistory.length >= 2) {
          const recentPerf = performanceHistory[0].responseTime;
          const olderPerf = performanceHistory[performanceHistory.length - 1].responseTime;
          
          if (recentPerf < olderPerf * 0.9) {
            performanceTrend = 'IMPROVING';
          } else if (recentPerf > olderPerf * 1.1) {
            performanceTrend = 'DECLINING';
          }
        }
      }
    } catch (error) {
      logger.debug('Error calculating trends in health report', { error });
    }

    const optimizationRecs = this.getOptimizationRecommendations();
    const allRecommendations = [
      ...optimizationRecs.urgent,
      ...optimizationRecs.suggested,
      ...optimizationRecs.informational
    ];

    return {
      overallHealth: integrationHealth,
      componentHealth,
      qualityTrend,
      performanceTrend,
      recommendations: allRecommendations,
      lastUpdate: new Date().toISOString()
    };
  }
}