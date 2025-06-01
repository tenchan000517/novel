// src/lib/foreshadowing/planned-foreshadowing-manager.ts

/**
 * @fileoverview 計画済み伏線管理システム（新記憶階層システム統合版）
 * @description
 * 新しい統合記憶階層システムに完全対応した計画済み伏線管理システム。
 * MemoryManagerとの統合により、伏線の導入・解決タイミングを最適化し、
 * 物語全体の一貫性と品質を保証します。
 */

import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import {
  MemoryLevel,
  UnifiedMemoryContext,
  MemoryOperationResult,
  SystemOperationResult
} from '@/lib/memory/core/types';
import { Foreshadowing } from '@/types/memory';
import { Chapter } from '@/types/chapters';

/**
 * 計画済み伏線インターフェース
 */
export interface PlannedForeshadowing {
  id: string;
  description: string;
  plannedIntroductionChapter: number;
  plannedResolutionChapter: number;
  importance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'CHARACTER' | 'PLOT' | 'WORLD' | 'MYSTERY' | 'THEME';
  context: string;
  resolution_context: string;
  hints: PlannedHint[];
  dependencies: string[];
  isIntroduced: boolean;
  isResolved: boolean;
  actualIntroductionChapter?: number;
  actualResolutionChapter?: number;
  qualityMetrics: {
    consistency: number;
    impact: number;
    subtlety: number;
    payoff: number;
  };
  metadata: {
    createdAt: string;
    lastUpdated: string;
    version: string;
    author: string;
    tags: string[];
  };
}

/**
 * 計画済みヒントインターフェース
 */
export interface PlannedHint {
  id: string;
  foreshadowingId: string;
  chapterNumber: number;
  hint: string;
  subtlety: number; // 1-10, 1が非常に微妙、10が明確
  isUsed: boolean;
  effectiveness?: number; // 使用後の効果測定
}

/**
 * 管理設定インターフェース
 */
export interface PlannedForeshadowingConfig {
  enableMemoryIntegration: boolean;
  enableAutoOptimization: boolean;
  enableQualityTracking: boolean;
  maxCacheSize: number;
  cacheExpirationMinutes: number;
  qualityThresholds: {
    consistency: number;
    impact: number;
    subtlety: number;
    payoff: number;
  };
  autoSaveInterval: number;
}

/**
 * 操作統計インターフェース
 */
interface OperationStatistics {
  totalPlannedForeshadowings: number;
  introducedCount: number;
  resolvedCount: number;
  pendingIntroduction: number;
  pendingResolution: number;
  averageQualityScore: number;
  lastOptimization: string;
  memorySystemHits: number;
  cacheEfficiencyRate: number;
}

/**
 * @class PlannedForeshadowingManager
 * @description
 * 計画済み伏線の管理を担当する統合クラス。
 * 新しい記憶階層システムと完全に統合し、伏線の導入・解決・品質管理を包括的に処理します。
 */
export class PlannedForeshadowingManager {
  private memoryManager: MemoryManager;
  private config: PlannedForeshadowingConfig;
  private plannedForeshadowings: Map<string, PlannedForeshadowing>;
  private loaded: boolean = false;
  private cacheTimestamp: string = '';
  private saveTimer: NodeJS.Timeout | null = null;

  // パフォーマンス統計
  private performanceStats: OperationStatistics = {
    totalPlannedForeshadowings: 0,
    introducedCount: 0,
    resolvedCount: 0,
    pendingIntroduction: 0,
    pendingResolution: 0,
    averageQualityScore: 0,
    lastOptimization: new Date().toISOString(),
    memorySystemHits: 0,
    cacheEfficiencyRate: 0
  };

  /**
   * コンストラクタ
   * @param memoryManager 統合記憶管理システム
   * @param config 管理設定
   */
  constructor(
    memoryManager: MemoryManager,
    config?: Partial<PlannedForeshadowingConfig>
  ) {
    this.memoryManager = memoryManager;
    this.config = this.mergeWithDefaults(config);
    this.plannedForeshadowings = new Map();

    this.validateConfiguration();
    this.initializeAutoSave();

    logger.info('PlannedForeshadowingManager initialized with unified memory integration', {
      config: this.config,
      memoryIntegration: this.config.enableMemoryIntegration
    });
  }

  /**
   * 設定のデフォルト値とマージ
   * @private
   */
  private mergeWithDefaults(config?: Partial<PlannedForeshadowingConfig>): PlannedForeshadowingConfig {
    return {
      enableMemoryIntegration: true,
      enableAutoOptimization: true,
      enableQualityTracking: true,
      maxCacheSize: 1000,
      cacheExpirationMinutes: 60,
      qualityThresholds: {
        consistency: 0.8,
        impact: 0.7,
        subtlety: 0.6,
        payoff: 0.8
      },
      autoSaveInterval: 30000, // 30秒
      ...config
    };
  }

  /**
   * 設定の検証
   * @private
   */
  private validateConfiguration(): void {
    if (!this.memoryManager) {
      throw new Error('MemoryManager is required for PlannedForeshadowingManager initialization');
    }

    const { qualityThresholds } = this.config;
    if (qualityThresholds.consistency < 0 || qualityThresholds.consistency > 1) {
      throw new Error('Quality threshold for consistency must be between 0 and 1');
    }

    if (this.config.maxCacheSize <= 0) {
      throw new Error('Max cache size must be greater than 0');
    }

    logger.debug('PlannedForeshadowingManager configuration validated successfully');
  }

  /**
   * 自動保存の初期化
   * @private
   */
  private initializeAutoSave(): void {
    if (this.config.autoSaveInterval > 0) {
      this.saveTimer = setInterval(async () => {
        try {
          await this.savePlannedForeshadowings();
        } catch (error) {
          logger.warn('Auto-save failed', { error });
        }
      }, this.config.autoSaveInterval);

      logger.debug('Auto-save initialized', { interval: this.config.autoSaveInterval });
    }
  }

  /**
   * 計画済み伏線をメモリシステムから読み込み
   */
  async loadPlannedForeshadowings(): Promise<void> {
    if (this.loaded && this.isCacheValid()) {
      logger.debug('Using cached planned foreshadowings');
      return;
    }

    try {
      logger.info('Loading planned foreshadowings from unified memory system');

      if (!this.config.enableMemoryIntegration) {
        logger.warn('Memory integration disabled, using empty dataset');
        this.loaded = true;
        return;
      }

      // システム状態の確認
      const systemStatus = await this.memoryManager.getSystemStatus();
      if (!systemStatus.initialized) {
        logger.warn('MemoryManager not initialized, attempting initialization');
        await this.memoryManager.initialize();
      }

      // 統合検索による計画済み伏線の取得
      const searchResult = await this.safeMemoryOperation(
        () => this.memoryManager.unifiedSearch(
          'planned foreshadowing configuration data',
          [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM]
        ),
        { success: false, totalResults: 0, results: [], processingTime: 0, suggestions: [] },
        'loadPlannedForeshadowings'
      );

      if (searchResult.success && searchResult.results.length > 0) {
        await this.processSearchResults(searchResult.results);
        this.performanceStats.memorySystemHits++;
      } else {
        logger.info('No existing planned foreshadowings found, starting with empty dataset');
        this.initializeDefaultPlannedForeshadowings();
      }

      this.loaded = true;
      this.cacheTimestamp = new Date().toISOString();
      this.updateStatistics();

      logger.info('Planned foreshadowings loaded successfully', {
        count: this.plannedForeshadowings.size,
        memorySystemHits: this.performanceStats.memorySystemHits
      });

    } catch (error) {
      logError(error, {}, 'Failed to load planned foreshadowings');
      this.initializeDefaultPlannedForeshadowings();
      this.loaded = true;
    }
  }

  /**
   * 検索結果を処理して計画済み伏線に変換
   * @private
   */
  private async processSearchResults(results: any[]): Promise<void> {
    for (const result of results) {
      try {
        if (result.type === 'plannedForeshadowing' && result.data) {
          const plannedForeshadowing = this.validateAndNormalizePlannedForeshadowing(result.data);
          if (plannedForeshadowing) {
            this.plannedForeshadowings.set(plannedForeshadowing.id, plannedForeshadowing);
          }
        }
      } catch (error) {
        logger.warn('Failed to process search result', {
          error: error instanceof Error ? error.message : String(error),
          resultType: result.type
        });
      }
    }
  }

  /**
   * 計画済み伏線データの検証と正規化
   * @private
   */
  private validateAndNormalizePlannedForeshadowing(data: any): PlannedForeshadowing | null {
    try {
      if (!data.id || !data.description) {
        return null;
      }

      return {
        id: data.id,
        description: data.description,
        plannedIntroductionChapter: data.plannedIntroductionChapter || 1,
        plannedResolutionChapter: data.plannedResolutionChapter || 10,
        importance: data.importance || 'MEDIUM',
        category: data.category || 'PLOT',
        context: data.context || '',
        resolution_context: data.resolution_context || '',
        hints: Array.isArray(data.hints) ? data.hints : [],
        dependencies: Array.isArray(data.dependencies) ? data.dependencies : [],
        isIntroduced: Boolean(data.isIntroduced),
        isResolved: Boolean(data.isResolved),
        actualIntroductionChapter: data.actualIntroductionChapter,
        actualResolutionChapter: data.actualResolutionChapter,
        qualityMetrics: {
          consistency: data.qualityMetrics?.consistency || 0.8,
          impact: data.qualityMetrics?.impact || 0.7,
          subtlety: data.qualityMetrics?.subtlety || 0.6,
          payoff: data.qualityMetrics?.payoff || 0.8
        },
        metadata: {
          createdAt: data.metadata?.createdAt || new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          version: data.metadata?.version || '1.0.0',
          author: data.metadata?.author || 'system',
          tags: Array.isArray(data.metadata?.tags) ? data.metadata.tags : []
        }
      };
    } catch (error) {
      logger.warn('Failed to validate planned foreshadowing data', { error, data });
      return null;
    }
  }

  /**
   * デフォルトの計画済み伏線を初期化
   * @private
   */
  private initializeDefaultPlannedForeshadowings(): void {
    logger.info('Initializing default planned foreshadowings');
    // デフォルトデータは空のMapで開始
    this.plannedForeshadowings.clear();
  }

  /**
   * 指定されたチャプターで導入すべき計画済み伏線を取得
   */
  getForeshadowingsToIntroduceInChapter(chapterNumber: number): PlannedForeshadowing[] {
    this.ensureLoaded();

    try {
      const toIntroduce = Array.from(this.plannedForeshadowings.values()).filter(
        foreshadowing =>
          foreshadowing.plannedIntroductionChapter === chapterNumber &&
          !foreshadowing.isIntroduced &&
          this.checkDependencies(foreshadowing)
      );

      // 重要度順にソート
      toIntroduce.sort((a, b) => {
        const importanceOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        return importanceOrder[b.importance] - importanceOrder[a.importance];
      });

      logger.debug(`Found ${toIntroduce.length} foreshadowings to introduce in chapter ${chapterNumber}`);
      return toIntroduce;

    } catch (error) {
      logError(error, { chapterNumber }, 'Failed to get foreshadowings to introduce');
      return [];
    }
  }

  /**
   * 指定されたチャプターで解決すべき計画済み伏線を取得
   */
  getForeshadowingsToResolveInChapter(chapterNumber: number): PlannedForeshadowing[] {
    this.ensureLoaded();

    try {
      const toResolve = Array.from(this.plannedForeshadowings.values()).filter(
        foreshadowing =>
          foreshadowing.plannedResolutionChapter === chapterNumber &&
          foreshadowing.isIntroduced &&
          !foreshadowing.isResolved
      );

      // 重要度と品質スコア順にソート
      toResolve.sort((a, b) => {
        const importanceOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        const aScore = importanceOrder[a.importance] + a.qualityMetrics.payoff;
        const bScore = importanceOrder[b.importance] + b.qualityMetrics.payoff;
        return bScore - aScore;
      });

      logger.debug(`Found ${toResolve.length} foreshadowings to resolve in chapter ${chapterNumber}`);
      return toResolve;

    } catch (error) {
      logError(error, { chapterNumber }, 'Failed to get foreshadowings to resolve');
      return [];
    }
  }

  /**
   * 指定されたチャプターで言及すべきヒントを取得
   */
  getHintsForChapter(chapterNumber: number): Array<{ foreshadowing: PlannedForeshadowing; hint: PlannedHint }> {
    this.ensureLoaded();

    try {
      const hintsForChapter: Array<{ foreshadowing: PlannedForeshadowing; hint: PlannedHint }> = [];

      for (const foreshadowing of this.plannedForeshadowings.values()) {
        if (!foreshadowing.isIntroduced || foreshadowing.isResolved) {
          continue;
        }

        const chaptersHints = foreshadowing.hints.filter(
          hint => hint.chapterNumber === chapterNumber && !hint.isUsed
        );

        for (const hint of chaptersHints) {
          hintsForChapter.push({ foreshadowing, hint });
        }
      }

      // 微妙さ（subtlety）の高い順にソート（微妙なものから先に）
      hintsForChapter.sort((a, b) => b.hint.subtlety - a.hint.subtlety);

      logger.debug(`Found ${hintsForChapter.length} hints for chapter ${chapterNumber}`);
      return hintsForChapter;

    } catch (error) {
      logError(error, { chapterNumber }, 'Failed to get hints for chapter');
      return [];
    }
  }

  /**
   * 計画済み伏線をForeshadowing型に変換
   */
  convertToForeshadowing(planned: PlannedForeshadowing): Foreshadowing {
    try {
      const foreshadowing: Foreshadowing = {
        id: planned.id,
        description: planned.description,
        context: planned.context,
        chapter_introduced: planned.actualIntroductionChapter || planned.plannedIntroductionChapter,
        potential_resolution: planned.resolution_context,
        resolved: planned.isResolved,
        urgency: this.mapImportanceToUrgency(planned.importance),
        createdTimestamp: planned.metadata.createdAt,
        updatedTimestamp: planned.metadata.lastUpdated
      };

      // オプションフィールドの設定
      if (planned.plannedResolutionChapter) {
        foreshadowing.plannedResolution = planned.plannedResolutionChapter;
      }

      if (planned.actualResolutionChapter) {
        foreshadowing.resolution_chapter = planned.actualResolutionChapter;
      }

      if (planned.resolution_context) {
        foreshadowing.resolution_description = planned.resolution_context;
      }

      return foreshadowing;

    } catch (error) {
      logError(error, { plannedId: planned.id }, 'Failed to convert planned foreshadowing');
      throw error;
    }
  }

  /**
   * 重要度をForeshadowing形式の緊急度にマッピング
   * @private
   */
  private mapImportanceToUrgency(importance: PlannedForeshadowing['importance']): string {
    const mapping = {
      'CRITICAL': 'high',
      'HIGH': 'high',
      'MEDIUM': 'medium',
      'LOW': 'low'
    };
    return mapping[importance];
  }

  /**
   * 伏線を導入済みとしてマーク
   */
  markAsIntroduced(id: string, chapterNumber?: number): void {
    try {
      const foreshadowing = this.plannedForeshadowings.get(id);
      if (!foreshadowing) {
        logger.warn(`Planned foreshadowing not found: ${id}`);
        return;
      }

      foreshadowing.isIntroduced = true;
      if (chapterNumber !== undefined) {
        foreshadowing.actualIntroductionChapter = chapterNumber;
      }
      foreshadowing.metadata.lastUpdated = new Date().toISOString();

      this.updateStatistics();
      logger.debug(`Marked foreshadowing as introduced: ${id}`, { chapterNumber });

    } catch (error) {
      logError(error, { id, chapterNumber }, 'Failed to mark foreshadowing as introduced');
    }
  }

  /**
   * 伏線を解決済みとしてマーク
   */
  markAsResolved(id: string, chapterNumber?: number): void {
    try {
      const foreshadowing = this.plannedForeshadowings.get(id);
      if (!foreshadowing) {
        logger.warn(`Planned foreshadowing not found: ${id}`);
        return;
      }

      foreshadowing.isResolved = true;
      if (chapterNumber !== undefined) {
        foreshadowing.actualResolutionChapter = chapterNumber;
      }
      foreshadowing.metadata.lastUpdated = new Date().toISOString();

      this.updateStatistics();
      logger.debug(`Marked foreshadowing as resolved: ${id}`, { chapterNumber });

    } catch (error) {
      logError(error, { id, chapterNumber }, 'Failed to mark foreshadowing as resolved');
    }
  }

  /**
   * 全ての伏線が解決済みかチェック
   */
  areAllForeshadowingsResolved(): boolean {
    this.ensureLoaded();

    try {
      const introducedForeshadowings = Array.from(this.plannedForeshadowings.values())
        .filter(f => f.isIntroduced);

      if (introducedForeshadowings.length === 0) {
        return false;
      }

      const unresolvedCount = introducedForeshadowings.filter(f => !f.isResolved).length;
      return unresolvedCount === 0;

    } catch (error) {
      logError(error, {}, 'Failed to check if all foreshadowings are resolved');
      return false;
    }
  }

  /**
  * 計画済み伏線をメモリシステムに保存
  */
  async savePlannedForeshadowings(): Promise<void> {
    if (!this.loaded) {
      logger.debug('No planned foreshadowings loaded, skipping save');
      return;
    }

    try {
      logger.info('Saving planned foreshadowings to unified memory system');

      if (!this.config.enableMemoryIntegration) {
        logger.warn('Memory integration disabled, save skipped');
        return;
      }

      // システム状態の確認
      const systemStatus = await this.memoryManager.getSystemStatus();
      if (!systemStatus.initialized) {
        logger.warn('MemoryManager not initialized for save operation');
        return;
      }

      // 保存用データの準備
      const saveData = this.prepareSaveData();

      // メモリシステムへの統合保存（長期記憶への保存）
      // MemoryOperationResultの完全な型に対応
      const saveResult = await this.safeMemoryOperation(
        () => this.saveToMemorySystem(saveData),
        {
          success: false,
          processingTime: 0,
          error: 'Memory save failed',
          shortTermUpdated: false,
          integrationProcessed: false,
          duplicatesResolved: 0,
          metadata: {
            timestamp: new Date().toISOString(),
            dataSize: 0
          }
        },
        'savePlannedForeshadowings'
      );

      if (saveResult.success) {
        this.cacheTimestamp = new Date().toISOString();
        logger.info('Planned foreshadowings saved successfully', {
          count: this.plannedForeshadowings.size,
          processingTime: saveResult.processingTime
        });
      } else {
        logger.error('Failed to save planned foreshadowings', {
          error: saveResult.error
        });
      }

    } catch (error) {
      logError(error, {}, 'Failed to save planned foreshadowings');
    }
  }

  /**
   * 保存用データの準備
   * @private
   */
  private prepareSaveData(): any {
    const data = {
      plannedForeshadowings: Array.from(this.plannedForeshadowings.values()),
      metadata: {
        version: '1.0.0',
        savedAt: new Date().toISOString(),
        count: this.plannedForeshadowings.size,
        statistics: this.performanceStats
      },
      config: this.config
    };

    return data;
  }

  /**
   * メモリシステムへの保存実行
   * @private
   */
  private async saveToMemorySystem(data: any): Promise<MemoryOperationResult> {
    const startTime = Date.now();

    try {
      logger.info('Starting unified memory system save operation', {
        dataType: 'plannedForeshadowings',
        dataSize: JSON.stringify(data).length
      });

      // 1. システム状態の確認
      const systemStatus = await this.memoryManager.getSystemStatus();
      if (!systemStatus.initialized) {
        throw new Error('MemoryManager not initialized for save operation');
      }

      // 2. plannedForeshadowings データをChapter形式に変換
      const systemChapter = this.buildSystemDataChapter(data);

      // 3. MemoryManagerの統合処理を活用して保存
      const result = await this.memoryManager.processChapter(systemChapter);

      // 4. 結果の評価と適切なレスポンス作成
      if (result.success) {
        const processingTime = Date.now() - startTime;

        logger.info('Unified memory system save completed successfully', {
          processingTime,
          affectedComponents: result.affectedComponents.length,
          dataSize: JSON.stringify(data).length
        });

        return {
          success: true,
          processingTime,
          shortTermUpdated: result.affectedComponents.includes('shortTermMemory'),
          integrationProcessed: result.affectedComponents.includes('dataIntegration'),
          duplicatesResolved: 0, // processChapter結果から取得可能
          metadata: {
            timestamp: new Date().toISOString(),
            dataSize: JSON.stringify(data).length,
            chapterNumber: 0
          }
        };
      } else {
        // processChapter が失敗した場合
        throw new Error(`Memory system processing failed: ${result.errors.join(', ')}`);
      }

    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error('Failed to save to unified memory system', {
        error: error instanceof Error ? error.message : String(error),
        processingTime,
        dataType: 'plannedForeshadowings'
      });

      return {
        success: false,
        processingTime,
        shortTermUpdated: false,
        integrationProcessed: false,
        duplicatesResolved: 0,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          timestamp: new Date().toISOString(),
          dataSize: 0,
          chapterNumber: 0
        }
      };
    }
  }

  /**
   * システムデータをChapter形式に変換
   * @private
   */
  private buildSystemDataChapter(data: any): Chapter {
    // 仕様書に従ったChapter型の完全構築
    const chapter: Chapter = {
      // 必須プロパティ
      id: `system-data-${Date.now()}`,
      chapterNumber: 0, // システムデータ用の特別な章番号
      title: 'システムデータ保存 - 計画済み伏線',
      content: this.serializeSystemData(data),
      createdAt: new Date(),
      updatedAt: new Date(),

      // オプショナルプロパティ
      wordCount: this.serializeSystemData(data).length,
      summary: `計画済み伏線データの保存: ${Object.keys(data).length}件`,
      scenes: [], // 空配列で初期化
      previousChapterSummary: '', // 空文字列で初期化

      // 必須: metadata プロパティ（型定義に従って完全構築）
      metadata: {
        // 基本メタデータ
        qualityScore: 1.0,
        keywords: ['system', 'foreshadowing', 'planned', 'data'],
        events: [],
        characters: [],
        foreshadowing: [],
        resolutions: [],
        correctionHistory: [],

        // 詳細メタデータ
        pov: 'システム',
        location: 'データ保存処理',
        emotionalTone: 'neutral',

        // システム固有のメタデータ
        systemDataType: 'plannedForeshadowings',
        dataCount: Object.keys(data).length,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        status: 'system-save',
        version: '1.0.0',
        tags: ['system-data', 'foreshadowing-manager', 'planned-data']
      }
    };

    logger.debug('System data chapter constructed successfully', {
      id: chapter.id,
      contentLength: chapter.content.length,
      dataCount: Object.keys(data).length
    });

    return chapter;
  }

  /**
   * システムデータをシリアライズ
   * @private
   */
  private serializeSystemData(data: any): string {
    try {
      // 構造化されたコンテンツとして保存
      const structuredContent = {
        dataType: 'plannedForeshadowings',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: data,
        metadata: {
          totalCount: Object.keys(data).length,
          serializedAt: new Date().toISOString(),
          format: 'structured-json'
        }
      };

      return JSON.stringify(structuredContent, null, 2);
    } catch (error) {
      logger.warn('Failed to serialize system data, using fallback', { error });
      return `System Data Save: ${new Date().toISOString()}\nData: ${JSON.stringify(data)}`;
    }
  }

  /**
   * ローディング状態の確認
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * キャッシュの有効性をチェック
   * @private
   */
  private isCacheValid(): boolean {
    if (!this.cacheTimestamp) {
      return false;
    }

    const cacheAge = Date.now() - new Date(this.cacheTimestamp).getTime();
    const maxAge = this.config.cacheExpirationMinutes * 60 * 1000;

    return cacheAge < maxAge;
  }

  /**
   * ローディング状態の確認（内部使用）
   * @private
   */
  private ensureLoaded(): void {
    if (!this.loaded) {
      throw new Error('Planned foreshadowings not loaded. Call loadPlannedForeshadowings() first.');
    }
  }

  /**
   * 依存関係のチェック
   * @private
   */
  private checkDependencies(foreshadowing: PlannedForeshadowing): boolean {
    if (foreshadowing.dependencies.length === 0) {
      return true;
    }

    return foreshadowing.dependencies.every(depId => {
      const dependency = this.plannedForeshadowings.get(depId);
      return dependency && dependency.isIntroduced;
    });
  }

  /**
   * 統計情報の更新
   * @private
   */
  private updateStatistics(): void {
    try {
      const allForeshadowings = Array.from(this.plannedForeshadowings.values());

      this.performanceStats.totalPlannedForeshadowings = allForeshadowings.length;
      this.performanceStats.introducedCount = allForeshadowings.filter(f => f.isIntroduced).length;
      this.performanceStats.resolvedCount = allForeshadowings.filter(f => f.isResolved).length;
      this.performanceStats.pendingIntroduction = allForeshadowings.filter(f => !f.isIntroduced).length;
      this.performanceStats.pendingResolution = allForeshadowings.filter(f => f.isIntroduced && !f.isResolved).length;

      // 平均品質スコアの計算
      if (allForeshadowings.length > 0) {
        const totalQuality = allForeshadowings.reduce((sum, f) => {
          const avgQuality = (f.qualityMetrics.consistency + f.qualityMetrics.impact +
            f.qualityMetrics.subtlety + f.qualityMetrics.payoff) / 4;
          return sum + avgQuality;
        }, 0);
        this.performanceStats.averageQualityScore = totalQuality / allForeshadowings.length;
      }

      // キャッシュ効率率の計算
      const totalRequests = this.performanceStats.memorySystemHits + 1; // ゼロ除算回避
      this.performanceStats.cacheEfficiencyRate = this.performanceStats.memorySystemHits / totalRequests;

    } catch (error) {
      logger.warn('Failed to update statistics', { error });
    }
  }

  /**
   * 安全なメモリ操作の実行
   * @private
   */
  private async safeMemoryOperation<T>(
    operation: () => Promise<T>,
    fallbackValue: T,
    operationName: string
  ): Promise<T> {
    try {
      // システム状態確認
      const systemStatus = await this.memoryManager.getSystemStatus();
      if (!systemStatus.initialized) {
        logger.warn(`${operationName}: MemoryManager not initialized`);
        return fallbackValue;
      }

      return await operation();
    } catch (error) {
      logger.error(`${operationName} failed`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return fallbackValue;
    }
  }

  /**
   * パフォーマンス統計の取得
   */
  getPerformanceStatistics(): OperationStatistics {
    return { ...this.performanceStats };
  }

  /**
   * 計画済み伏線を追加
   */
  addPlannedForeshadowing(plannedForeshadowing: PlannedForeshadowing): void {
    try {
      this.ensureLoaded();

      // 重複チェック
      if (this.plannedForeshadowings.has(plannedForeshadowing.id)) {
        logger.warn(`Planned foreshadowing already exists: ${plannedForeshadowing.id}`);
        return;
      }

      // 品質検証
      if (this.config.enableQualityTracking) {
        this.validateQuality(plannedForeshadowing);
      }

      this.plannedForeshadowings.set(plannedForeshadowing.id, plannedForeshadowing);
      this.updateStatistics();

      logger.debug(`Added planned foreshadowing: ${plannedForeshadowing.id}`);

    } catch (error) {
      logError(error, { id: plannedForeshadowing.id }, 'Failed to add planned foreshadowing');
    }
  }

  /**
   * 品質の検証
   * @private
   */
  private validateQuality(foreshadowing: PlannedForeshadowing): void {
    const { qualityThresholds } = this.config;
    const { qualityMetrics } = foreshadowing;

    const issues: string[] = [];

    if (qualityMetrics.consistency < qualityThresholds.consistency) {
      issues.push(`Consistency too low: ${qualityMetrics.consistency} < ${qualityThresholds.consistency}`);
    }

    if (qualityMetrics.impact < qualityThresholds.impact) {
      issues.push(`Impact too low: ${qualityMetrics.impact} < ${qualityThresholds.impact}`);
    }

    if (qualityMetrics.subtlety < qualityThresholds.subtlety) {
      issues.push(`Subtlety too low: ${qualityMetrics.subtlety} < ${qualityThresholds.subtlety}`);
    }

    if (qualityMetrics.payoff < qualityThresholds.payoff) {
      issues.push(`Payoff too low: ${qualityMetrics.payoff} < ${qualityThresholds.payoff}`);
    }

    if (issues.length > 0) {
      logger.warn(`Quality issues detected for foreshadowing ${foreshadowing.id}`, { issues });
    }
  }

  /**
   * 診断情報の取得
   */
  async performDiagnostics(): Promise<{
    isHealthy: boolean;
    issues: string[];
    recommendations: string[];
    performanceMetrics: OperationStatistics;
  }> {
    try {
      const issues: string[] = [];
      const recommendations: string[] = [];

      // ローディング状態チェック
      if (!this.loaded) {
        issues.push('Planned foreshadowings not loaded');
        recommendations.push('Call loadPlannedForeshadowings()');
      }

      // メモリシステム統合チェック
      if (this.config.enableMemoryIntegration) {
        try {
          const systemStatus = await this.memoryManager.getSystemStatus();
          if (!systemStatus.initialized) {
            issues.push('MemoryManager not initialized');
            recommendations.push('Initialize MemoryManager');
          }
        } catch (error) {
          issues.push('Failed to check MemoryManager status');
          recommendations.push('Check MemoryManager connectivity');
        }
      }

      // 品質チェック
      if (this.config.enableQualityTracking && this.performanceStats.averageQualityScore < 0.7) {
        issues.push(`Low average quality score: ${this.performanceStats.averageQualityScore}`);
        recommendations.push('Review and improve foreshadowing quality');
      }

      // キャッシュ効率チェック
      if (this.performanceStats.cacheEfficiencyRate < 0.8) {
        issues.push(`Low cache efficiency: ${this.performanceStats.cacheEfficiencyRate}`);
        recommendations.push('Consider cache optimization');
      }

      const isHealthy = issues.length === 0;

      return {
        isHealthy,
        issues,
        recommendations,
        performanceMetrics: this.performanceStats
      };

    } catch (error) {
      logError(error, {}, 'Failed to perform diagnostics');
      return {
        isHealthy: false,
        issues: ['Diagnostics failed'],
        recommendations: ['Check system logs'],
        performanceMetrics: this.performanceStats
      };
    }
  }

  /**
   * リソースのクリーンアップ
   */
  async cleanup(): Promise<void> {
    try {
      logger.info('Cleaning up PlannedForeshadowingManager');

      // 自動保存タイマーの停止
      if (this.saveTimer) {
        clearInterval(this.saveTimer);
        this.saveTimer = null;
      }

      // 最終保存の実行
      if (this.loaded && this.config.enableMemoryIntegration) {
        await this.savePlannedForeshadowings();
      }

      // データのクリア
      this.plannedForeshadowings.clear();
      this.loaded = false;
      this.cacheTimestamp = '';

      logger.info('PlannedForeshadowingManager cleanup completed');

    } catch (error) {
      logError(error, {}, 'Failed to cleanup PlannedForeshadowingManager');
    }
  }
}

// シングルトンインスタンス用のファクトリー関数
let plannedForeshadowingManagerInstance: PlannedForeshadowingManager | null = null;

/**
 * PlannedForeshadowingManagerのシングルトンインスタンスを取得
 * @param memoryManager MemoryManagerインスタンス
 * @param config 設定（初回のみ）
 */
export function getPlannedForeshadowingManager(
  memoryManager?: MemoryManager,
  config?: Partial<PlannedForeshadowingConfig>
): PlannedForeshadowingManager {
  if (!plannedForeshadowingManagerInstance) {
    if (!memoryManager) {
      throw new Error('MemoryManager is required for initial PlannedForeshadowingManager creation');
    }
    plannedForeshadowingManagerInstance = new PlannedForeshadowingManager(memoryManager, config);
  }
  return plannedForeshadowingManagerInstance;
}

/**
 * 既存のシングルトンインスタンスを破棄（テスト用）
 */
export function resetPlannedForeshadowingManager(): void {
  if (plannedForeshadowingManagerInstance) {
    plannedForeshadowingManagerInstance.cleanup();
    plannedForeshadowingManagerInstance = null;
  }
}

// レガシー互換性のためのデフォルトエクスポート（実際の使用時は適切なMemoryManagerインスタンスが必要）
export const plannedForeshadowingManager = {
  getInstance: getPlannedForeshadowingManager,
  reset: resetPlannedForeshadowingManager
};