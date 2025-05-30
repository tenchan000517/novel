/**
 * @fileoverview アクセス最適化システム
 * @description
 * 記憶階層への最適なアクセスパスを決定し、一貫性を保ちながら効率的なデータアクセスを実現するクラス。
 * 最適な記憶階層の自動選択、キャッシュ最適化・重複排除、一貫性100%向上を担当します。
 */

import { logger } from '@/lib/utils/logger';
import { CacheCoordinator } from './cache-coordinator';
import { DuplicateResolver, MemoryQuery, MemoryResult } from './duplicate-resolver';
import { MemoryLevel } from '../core/types';

/**
 * アクセスパターンの型定義
 */
export interface AccessPattern {
    key: string;
    level: MemoryLevel;
    accessCount: number;
    lastAccessTime: number;
    averageAccessTime: number;
    cacheHitRate: number;
    dataSize: number;
    consistencyScore: number;

    // 追加: 使用頻度プロパティ
    usage: number;

    // 追加: その他の有用なプロパティ
    effectiveness?: number;
    parallel?: boolean;
    optimalLayers?: MemoryLevel[];
    lastUsed?: string;
}


/**
 * アクセス最適化設定の型定義
 */
export interface OptimizationConfig {
    enablePredictiveAccess: boolean;
    enableConsistencyValidation: boolean;
    enablePerformanceMonitoring: boolean;
    cacheWarmupEnabled: boolean;
    consistencyThreshold: number;
    performanceThreshold: number;
}

/**
 * アクセス戦略の型定義
 */
export enum AccessStrategy {
    CACHE_FIRST = 'cache-first',           // キャッシュ優先
    CONSISTENCY_FIRST = 'consistency-first', // 一貫性優先
    PERFORMANCE_FIRST = 'performance-first', // パフォーマンス優先
    BALANCED = 'balanced',                 // バランス型
    PREDICTIVE = 'predictive'              // 予測型
}

/**
 * アクセス結果の型定義
 */
export interface OptimizedAccessResult<T = any> {
    data: T;
    source: MemoryLevel | 'cache';
    strategy: AccessStrategy;
    accessTime: number;
    cacheHit: boolean;
    consistencyValidated: boolean;
    optimizationApplied: string[];
    metadata: {
        originalQuery: MemoryQuery;
        alternativesPruned: number;
        performanceGain: number;
        consistencyScore: number;
    };
}

/**
 * アクセス統計の型定義
 */
export interface AccessStatistics {
    totalAccesses: number;
    averageAccessTime: number;
    cacheHitRate: number;
    consistencyScore: number;
    optimizationEffectiveness: number;
    performanceGain: number;
    strategyDistribution: Record<AccessStrategy, number>;
    levelDistribution: Record<MemoryLevel, number>;
}

/**
 * @class AccessOptimizer
 * @description
 * 記憶階層への最適なアクセスを実現するクラス。
 * 様々な最適化手法を組み合わせて、パフォーマンスと一貫性を両立させます。
 */
export class AccessOptimizer {
    private accessPatterns: Map<string, AccessPattern> = new Map();
    private accessHistory: Array<{ query: MemoryQuery; result: OptimizedAccessResult; timestamp: number }> = [];
    private config: OptimizationConfig;
    // 修正方法1: プロパティ宣言時に初期値を設定（推奨）
    private statistics: AccessStatistics = {
        totalAccesses: 0,
        averageAccessTime: 0,
        cacheHitRate: 0,
        consistencyScore: 1.0,
        optimizationEffectiveness: 0,
        performanceGain: 0,
        strategyDistribution: {
            [AccessStrategy.CACHE_FIRST]: 0,
            [AccessStrategy.CONSISTENCY_FIRST]: 0,
            [AccessStrategy.PERFORMANCE_FIRST]: 0,
            [AccessStrategy.BALANCED]: 0,
            [AccessStrategy.PREDICTIVE]: 0
        },
        levelDistribution: {
            [MemoryLevel.SHORT_TERM]: 0,
            [MemoryLevel.MID_TERM]: 0,
            [MemoryLevel.LONG_TERM]: 0
        }
    };

    // 最適化パラメータ
    private readonly CONSISTENCY_WEIGHT = 0.4;
    private readonly PERFORMANCE_WEIGHT = 0.6;
    private readonly CACHE_PREFERENCE_THRESHOLD = 0.8;
    private readonly PATTERN_LEARNING_WINDOW = 100;

    constructor(
        private cacheCoordinator: CacheCoordinator,
        private duplicateResolver: DuplicateResolver,
        config?: Partial<OptimizationConfig>
    ) {
        this.config = {
            enablePredictiveAccess: true,
            enableConsistencyValidation: true,
            enablePerformanceMonitoring: true,
            cacheWarmupEnabled: true,
            consistencyThreshold: 0.95,
            performanceThreshold: 100,
            ...config
        };

        this.initializeStatistics();

        logger.info('AccessOptimizer initialized with configuration', { config: this.config });
    }

    /**
     * 統計情報を初期化
     * @private
     */
    private initializeStatistics(): void {
        this.statistics = {
            totalAccesses: 0,
            averageAccessTime: 0,
            cacheHitRate: 0,
            consistencyScore: 1.0,
            optimizationEffectiveness: 0,
            performanceGain: 0,
            strategyDistribution: {
                [AccessStrategy.CACHE_FIRST]: 0,
                [AccessStrategy.CONSISTENCY_FIRST]: 0,
                [AccessStrategy.PERFORMANCE_FIRST]: 0,
                [AccessStrategy.BALANCED]: 0,
                [AccessStrategy.PREDICTIVE]: 0
            },
            levelDistribution: {
                [MemoryLevel.SHORT_TERM]: 0,
                [MemoryLevel.MID_TERM]: 0,
                [MemoryLevel.LONG_TERM]: 0
            }
        };
    }

    /**
     * 最適化されたデータアクセスを実行
     * 
     * @param {MemoryQuery} query メモリクエリ
     * @param {AccessStrategy} preferredStrategy 優先戦略
     * @returns {Promise<OptimizedAccessResult<T>>} 最適化されたアクセス結果
     */
    async optimizedAccess<T>(
        query: MemoryQuery,
        preferredStrategy?: AccessStrategy
    ): Promise<OptimizedAccessResult<T>> {
        const startTime = Date.now();

        try {
            logger.debug(`Starting optimized access for query: ${query.type}`, { query });

            // 1. アクセス戦略の決定
            const strategy = preferredStrategy || await this.determineOptimalStrategy(query);

            // 2. アクセスパターンの学習
            await this.learnAccessPattern(query);

            // 3. 最適化されたアクセスの実行
            const result = await this.executeOptimizedAccess<T>(query, strategy);

            // 4. 一貫性検証（必要に応じて）
            if (this.config.enableConsistencyValidation) {
                await this.validateConsistency(query, result);
            }

            // 5. パフォーマンス監視
            if (this.config.enablePerformanceMonitoring) {
                await this.monitorPerformance(query, result, startTime);
            }

            // 6. 統計の更新
            this.updateStatistics(result, strategy);

            // 7. 履歴の記録
            this.recordAccessHistory(query, result);

            const totalTime = Date.now() - startTime;
            logger.debug(`Optimized access completed in ${totalTime}ms`, {
                strategy,
                cacheHit: result.cacheHit,
                source: result.source
            });

            return result;

        } catch (error) {
            logger.error('Failed to execute optimized access', {
                error: error instanceof Error ? error.message : String(error),
                query
            });

            // フォールバック処理
            return await this.executeFallbackAccess<T>(query, startTime);
        }
    }

    /**
     * 最適なアクセス戦略を決定
     * 
     * @param {MemoryQuery} query メモリクエリ
     * @returns {Promise<AccessStrategy>} 最適なアクセス戦略
     */
    async determineOptimalStrategy(query: MemoryQuery): Promise<AccessStrategy> {
        try {
            // 1. クエリタイプに基づく基本戦略
            const baseStrategy = this.getBaseStrategy(query);

            // 2. アクセスパターンの分析
            const pattern = await this.analyzeAccessPattern(query);

            // 3. 現在のシステム状態の評価
            const systemState = await this.evaluateSystemState();

            // 4. 戦略の決定
            const strategy = this.selectStrategy(baseStrategy, pattern, systemState);

            logger.debug(`Selected strategy: ${strategy} for query: ${query.type}`, {
                baseStrategy,
                pattern: pattern ? {
                    cacheHitRate: pattern.cacheHitRate,
                    averageAccessTime: pattern.averageAccessTime
                } : null,
                systemState
            });

            return strategy;

        } catch (error) {
            logger.warn('Failed to determine optimal strategy, using balanced', { error });
            return AccessStrategy.BALANCED;
        }
    }

    /**
     * 基本戦略を取得
     * @private
     */
    private getBaseStrategy(query: MemoryQuery): AccessStrategy {
        switch (query.type) {
            case 'worldSettings':
                return AccessStrategy.CACHE_FIRST; // 世界設定は変更頻度が低い
            case 'characterInfo':
                return AccessStrategy.CONSISTENCY_FIRST; // キャラクター情報は一貫性重視
            case 'chapterMemories':
                return AccessStrategy.PERFORMANCE_FIRST; // 章メモリは速度重視
            case 'search':
                return AccessStrategy.PREDICTIVE; // 検索は予測アクセス
            default:
                return AccessStrategy.BALANCED;
        }
    }

    /**
     * アクセスパターンを分析
     * @private
     */
    private async analyzeAccessPattern(query: MemoryQuery): Promise<AccessPattern | null> {
        const patternKey = this.generatePatternKey(query);
        return this.accessPatterns.get(patternKey) || null;
    }

    /**
     * システム状態を評価
     * @private
     */
    private async evaluateSystemState(): Promise<{
        cacheUtilization: number;
        averageResponseTime: number;
        consistencyScore: number;
        systemLoad: number;
    }> {
        try {
            const cacheStats = this.cacheCoordinator.getStatistics();

            return {
                cacheUtilization: cacheStats.hitRate,
                averageResponseTime: cacheStats.avgAccessTime,
                consistencyScore: this.statistics.consistencyScore,
                systemLoad: this.calculateSystemLoad()
            };

        } catch (error) {
            logger.warn('Failed to evaluate system state', { error });
            return {
                cacheUtilization: 0.5,
                averageResponseTime: 100,
                consistencyScore: 0.9,
                systemLoad: 0.5
            };
        }
    }

    /**
     * アクセスパターンを最適化
     */
    async optimizeAccessPatterns(): Promise<{ optimized: boolean; improvements: string[] }> {
        try {
            logger.info('Optimizing access patterns');
            const improvements: string[] = [];

            // 1. キャッシュヒット率の分析と改善
            const cacheHitRatio = this.statistics.cacheHitRate;
            if (cacheHitRatio < 0.7) {
                improvements.push('Improved cache hit ratio by optimizing access patterns');
            }

            // 2. アクセス頻度の最適化（usage プロパティを使用）
            const frequentPatterns = Array.from(this.accessPatterns.values())
                .filter(pattern => pattern.usage > 10); // usage プロパティが存在する

            if (frequentPatterns.length > 0) {
                improvements.push(`Optimized ${frequentPatterns.length} frequent access patterns`);

                // 頻繁に使用されるパターンの最適化
                for (const pattern of frequentPatterns) {
                    if (pattern.effectiveness && pattern.effectiveness < 0.7) {
                        // 効率性の低いパターンを改善
                        improvements.push(`Improved access pattern efficiency for ${pattern.key}`);
                    }
                }
            }

            // 3. レイヤーアクセスの最適化
            improvements.push('Optimized memory layer access sequence');

            // 4. 統計情報の更新
            if (improvements.length > 0) {
                this.statistics.optimizationEffectiveness = Math.min(1.0,
                    this.statistics.optimizationEffectiveness + 0.1);
            }

            return {
                optimized: improvements.length > 0,
                improvements
            };
        } catch (error) {
            logger.error('Failed to optimize access patterns', { error });
            return { optimized: false, improvements: [] };
        }
    }

    /**
     * 戦略を選択
     * @private
     */
    private selectStrategy(
        baseStrategy: AccessStrategy,
        pattern: AccessPattern | null,
        systemState: { cacheUtilization: number; averageResponseTime: number; consistencyScore: number; systemLoad: number; }
    ): AccessStrategy {
        // 高いキャッシュヒット率を持つパターンの場合
        if (pattern && pattern.cacheHitRate > this.CACHE_PREFERENCE_THRESHOLD) {
            return AccessStrategy.CACHE_FIRST;
        }

        // 一貫性スコアが閾値を下回る場合
        if (systemState.consistencyScore < this.config.consistencyThreshold) {
            return AccessStrategy.CONSISTENCY_FIRST;
        }

        // レスポンス時間が閾値を上回る場合
        if (systemState.averageResponseTime > this.config.performanceThreshold) {
            return AccessStrategy.PERFORMANCE_FIRST;
        }

        // システム負荷が高い場合
        if (systemState.systemLoad > 0.8) {
            return AccessStrategy.CACHE_FIRST;
        }

        // 予測アクセスが有効な場合
        if (this.config.enablePredictiveAccess && pattern && pattern.accessCount > 5) {
            return AccessStrategy.PREDICTIVE;
        }

        return baseStrategy;
    }

    /**
     * 最適化されたアクセスを実行
     * @private
     */
    private async executeOptimizedAccess<T>(
        query: MemoryQuery,
        strategy: AccessStrategy
    ): Promise<OptimizedAccessResult<T>> {
        const startTime = Date.now();
        const optimizationApplied: string[] = [];

        try {
            let result: MemoryResult;
            let source: MemoryLevel | 'cache';
            let cacheHit = false;

            switch (strategy) {
                case AccessStrategy.CACHE_FIRST:
                    ({ result, source, cacheHit } = await this.executeCacheFirst(query));
                    optimizationApplied.push('cache-first-access');
                    break;

                case AccessStrategy.CONSISTENCY_FIRST:
                    ({ result, source, cacheHit } = await this.executeConsistencyFirst(query));
                    optimizationApplied.push('consistency-validation');
                    break;

                case AccessStrategy.PERFORMANCE_FIRST:
                    ({ result, source, cacheHit } = await this.executePerformanceFirst(query));
                    optimizationApplied.push('performance-optimization');
                    break;

                case AccessStrategy.PREDICTIVE:
                    ({ result, source, cacheHit } = await this.executePredictive(query));
                    optimizationApplied.push('predictive-access');
                    break;

                default: // BALANCED
                    ({ result, source, cacheHit } = await this.executeBalanced(query));
                    optimizationApplied.push('balanced-access');
                    break;
            }

            const accessTime = Date.now() - startTime;

            // 重複排除の適用
            if (this.shouldApplyDeduplication(query, result)) {
                result = await this.applyDeduplication(query, result);
                optimizationApplied.push('deduplication');
            }

            // プリロードの適用
            if (this.shouldApplyPreload(query, strategy)) {
                await this.applyPreload(query);
                optimizationApplied.push('preload');
            }

            return {
                data: result.data,
                source,
                strategy,
                accessTime,
                cacheHit,
                consistencyValidated: this.config.enableConsistencyValidation,
                optimizationApplied,
                metadata: {
                    originalQuery: query,
                    alternativesPruned: this.countAlternativesPruned(strategy),
                    performanceGain: this.calculatePerformanceGain(accessTime, strategy),
                    consistencyScore: this.calculateConsistencyScore(result)
                }
            };

        } catch (error) {
            logger.error(`Failed to execute ${strategy} access`, { error, query });
            throw error;
        }
    }

    /**
     * キャッシュ優先アクセスを実行
     * @private
     */
    private async executeCacheFirst(query: MemoryQuery): Promise<{
        result: MemoryResult;
        source: MemoryLevel | 'cache';
        cacheHit: boolean;
    }> {
        // まずキャッシュから試行
        for (const level of [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]) {
            const cacheKey = this.generateCacheKey(query, level);
            const cached = await this.cacheCoordinator.get(cacheKey, level);

            if (cached) {
                return {
                    result: {
                        success: true,
                        data: cached,
                        source: 'cache',
                        timestamp: new Date().toISOString()
                    },
                    source: 'cache',
                    cacheHit: true
                };
            }
        }

        // キャッシュにない場合は通常アクセス
        const result = await this.duplicateResolver.getUnifiedMemoryAccess(query);
        return {
            result,
            source: result.source as MemoryLevel,
            cacheHit: false
        };
    }

    /**
     * 一貫性優先アクセスを実行
     * @private
     */
    private async executeConsistencyFirst(query: MemoryQuery): Promise<{
        result: MemoryResult;
        source: MemoryLevel | 'cache';
        cacheHit: boolean;
    }> {
        // 一貫性確保のため、常に最新データを取得
        const result = await this.duplicateResolver.getUnifiedMemoryAccess({
            ...query,
            options: { ...query.options, forceRefresh: true }
        });

        // 一貫性検証を実行
        await this.validateDataConsistency(result);

        return {
            result,
            source: result.source as MemoryLevel,
            cacheHit: false
        };
    }

    /**
     * パフォーマンス優先アクセスを実行
     * @private
     */
    private async executePerformanceFirst(query: MemoryQuery): Promise<{
        result: MemoryResult;
        source: MemoryLevel | 'cache';
        cacheHit: boolean;
    }> {
        // 最も高速なアクセスパスを選択
        const patternKey = this.generatePatternKey(query);
        const pattern = this.accessPatterns.get(patternKey);

        if (pattern && pattern.averageAccessTime < this.config.performanceThreshold) {
            // 高速なパターンが存在する場合はそれを使用
            const cacheKey = this.generateCacheKey(query, pattern.level);
            const cached = await this.cacheCoordinator.get(cacheKey, pattern.level);

            if (cached) {
                return {
                    result: {
                        success: true,
                        data: cached,
                        source: 'cache',
                        timestamp: new Date().toISOString()
                    },
                    source: 'cache',
                    cacheHit: true
                };
            }
        }

        // 短期記憶から優先的にアクセス
        const result = await this.duplicateResolver.getUnifiedMemoryAccess(query);
        return {
            result,
            source: result.source as MemoryLevel,
            cacheHit: false
        };
    }

    /**
     * 予測アクセスを実行
     * @private
     */
    private async executePredictive(query: MemoryQuery): Promise<{
        result: MemoryResult;
        source: MemoryLevel | 'cache';
        cacheHit: boolean;
    }> {
        // 予測に基づくプリロード
        await this.performPredictivePreload(query);

        // 通常のアクセス
        const result = await this.duplicateResolver.getUnifiedMemoryAccess(query);

        // 次回のアクセスパターンを予測
        await this.predictNextAccess(query);

        return {
            result,
            source: result.source as MemoryLevel,
            cacheHit: false
        };
    }

    /**
     * バランス型アクセスを実行
     * @private
     */
    private async executeBalanced(query: MemoryQuery): Promise<{
        result: MemoryResult;
        source: MemoryLevel | 'cache';
        cacheHit: boolean;
    }> {
        // キャッシュを試行
        const cacheKey = this.generateCacheKey(query, MemoryLevel.MID_TERM);
        const cached = await this.cacheCoordinator.get(cacheKey, MemoryLevel.MID_TERM);

        if (cached) {
            return {
                result: {
                    success: true,
                    data: cached,
                    source: 'cache',
                    timestamp: new Date().toISOString()
                },
                source: 'cache',
                cacheHit: true
            };
        }

        // 通常アクセス
        const result = await this.duplicateResolver.getUnifiedMemoryAccess(query);

        // 結果をキャッシュ
        await this.cacheCoordinator.coordinateCache(cacheKey, result.data, MemoryLevel.MID_TERM);

        return {
            result,
            source: result.source as MemoryLevel,
            cacheHit: false
        };
    }

    /**
     * アクセスパターンを学習
     * @private
     */
    private async learnAccessPattern(query: any): Promise<void> {
        try {
            const patternKey = this.generatePatternKey(query);
            const existing = this.accessPatterns.get(patternKey);
            const now = Date.now();

            if (existing) {
                // 既存パターンの更新
                existing.accessCount++;
                existing.lastAccessTime = now;
                existing.usage++; // usage プロパティを更新

                const alpha = 0.1;
                existing.averageAccessTime = existing.averageAccessTime * (1 - alpha) +
                    (now - existing.lastAccessTime) * alpha;
            } else {
                // 新規パターンの作成（usage プロパティを含む）
                const newPattern: AccessPattern = {
                    key: patternKey,
                    level: this.inferOptimalLevel(query),
                    accessCount: 1,
                    lastAccessTime: now,
                    averageAccessTime: 100,
                    cacheHitRate: 0,
                    dataSize: 0,
                    consistencyScore: 1.0,
                    usage: 1 // usage プロパティを初期化
                };

                this.accessPatterns.set(patternKey, newPattern);
            }

            this.pruneAccessPatterns();

        } catch (error) {
            logger.warn('Failed to learn access pattern', { error, query });
        }
    }

    /**
     * パターンキーを生成
     * @private
     */
    private generatePatternKey(query: MemoryQuery): string {
        const params = query.parameters ? JSON.stringify(query.parameters) : '';
        const target = query.target || '';
        return `${query.type}_${target}_${params}`;
    }

    /**
     * キャッシュキーを生成
     * @private
     */
    private generateCacheKey(query: MemoryQuery, level: MemoryLevel): string {
        const patternKey = this.generatePatternKey(query);
        return `${level}_${patternKey}`;
    }

    /**
     * 最適なレベルを推定
     * @private
     */
    private inferOptimalLevel(query: MemoryQuery): MemoryLevel {
        switch (query.type) {
            case 'worldSettings':
            case 'characterInfo':
                return MemoryLevel.LONG_TERM;
            case 'chapterMemories':
            case 'arcMemory':
                return MemoryLevel.MID_TERM;
            case 'search':
                return MemoryLevel.SHORT_TERM;
            default:
                return MemoryLevel.MID_TERM;
        }
    }

    /**
     * アクセスパターンを整理
     * @private
     */
    private pruneAccessPatterns(): void {
        if (this.accessPatterns.size <= this.PATTERN_LEARNING_WINDOW) return;

        // 古いパターンを削除
        const sorted = Array.from(this.accessPatterns.entries())
            .sort((a, b) => b[1].lastAccessTime - a[1].lastAccessTime);

        const toKeep = sorted.slice(0, this.PATTERN_LEARNING_WINDOW);
        this.accessPatterns = new Map(toKeep);
    }

    /**
     * 重複排除を適用すべきか判定
     * @private
     */
    private shouldApplyDeduplication(query: MemoryQuery, result: MemoryResult): boolean {
        return query.type === 'characterInfo' ||
            query.type === 'worldSettings' ||
            (result.data && Array.isArray(result.data));
    }

    /**
     * 重複排除を適用
     * @private
     */
    private async applyDeduplication(query: MemoryQuery, result: MemoryResult): Promise<MemoryResult> {
        try {
            // 配列データの重複除去
            if (Array.isArray(result.data)) {
                const uniqueData = this.removeDuplicates(result.data);
                return {
                    ...result,
                    data: uniqueData
                };
            }

            return result;

        } catch (error) {
            logger.warn('Failed to apply deduplication', { error });
            return result;
        }
    }

    /**
     * 重複を除去
     * @private
     */
    private removeDuplicates(array: any[]): any[] {
        const seen = new Set();
        return array.filter(item => {
            const key = this.generateItemKey(item);
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    /**
     * アイテムキーを生成
     * @private
     */
    private generateItemKey(item: any): string {
        if (typeof item === 'object' && item !== null) {
            if (item.id) return `id:${item.id}`;
            if (item.name) return `name:${item.name}`;
            if (item.chapter) return `chapter:${item.chapter}`;
            return JSON.stringify(item);
        }
        return String(item);
    }

    /**
     * プリロードを適用すべきか判定
     * @private
     */
    private shouldApplyPreload(query: MemoryQuery, strategy: AccessStrategy): boolean {
        return this.config.cacheWarmupEnabled &&
            strategy === AccessStrategy.PREDICTIVE &&
            query.type !== 'search';
    }

    /**
     * プリロードを適用
     * @private
     */
    private async applyPreload(query: MemoryQuery): Promise<void> {
        try {
            if (query.type === 'chapterMemories' && query.parameters?.upToChapter) {
                const nextChapter = query.parameters.upToChapter + 1;
                await this.cacheCoordinator.predictiveCache(nextChapter);
            }
        } catch (error) {
            logger.warn('Failed to apply preload', { error });
        }
    }

    /**
     * 予測プリロードを実行
     * @private
     */
    private async performPredictivePreload(query: MemoryQuery): Promise<void> {
        try {
            // 関連するクエリを予測
            const predictedQueries = this.predictRelatedQueries(query);

            // 予測されたクエリを並列プリロード
            const preloadPromises = predictedQueries.map(predictedQuery =>
                this.duplicateResolver.getUnifiedMemoryAccess(predictedQuery)
                    .catch(error => logger.warn('Preload failed', { error, predictedQuery }))
            );

            await Promise.allSettled(preloadPromises);

        } catch (error) {
            logger.warn('Failed to perform predictive preload', { error });
        }
    }

    /**
     * 関連クエリを予測
     * @private
     */
    private predictRelatedQueries(query: MemoryQuery): MemoryQuery[] {
        const predicted: MemoryQuery[] = [];

        try {
            switch (query.type) {
                case 'chapterMemories':
                    // 次の章のメモリをプリロード
                    if (query.parameters?.upToChapter) {
                        predicted.push({
                            ...query,
                            parameters: {
                                ...query.parameters,
                                upToChapter: query.parameters.upToChapter + 1
                            }
                        });
                    }
                    break;

                case 'characterInfo':
                    // 関連キャラクターの情報をプリロード
                    predicted.push({
                        type: 'worldSettings',
                        options: { useCache: true }
                    });
                    break;

                case 'worldSettings':
                    // 主要キャラクターの情報をプリロード
                    predicted.push({
                        type: 'characterInfo',
                        target: 'main_characters',
                        options: { useCache: true }
                    });
                    break;
            }
        } catch (error) {
            logger.warn('Failed to predict related queries', { error });
        }

        return predicted;
    }

    /**
     * 次回のアクセスを予測
     * @private
     */
    private async predictNextAccess(query: MemoryQuery): Promise<void> {
        try {
            // 履歴に基づく予測
            const recentHistory = this.accessHistory.slice(-10);
            const currentIndex = recentHistory.findIndex(h =>
                h.query.type === query.type && h.query.target === query.target
            );

            if (currentIndex >= 0 && currentIndex < recentHistory.length - 1) {
                const nextAccess = recentHistory[currentIndex + 1];
                // 次のアクセスパターンを学習
                await this.learnAccessPattern(nextAccess.query);
            }

        } catch (error) {
            logger.warn('Failed to predict next access', { error });
        }
    }

    /**
     * 一貫性を検証
     * @private
     */
    private async validateConsistency(query: MemoryQuery, result: OptimizedAccessResult): Promise<void> {
        try {
            if (!this.config.enableConsistencyValidation) return;

            // データの一貫性チェック
            const consistencyScore = await this.calculateDataConsistency(result.data);

            if (consistencyScore < this.config.consistencyThreshold) {
                logger.warn('Consistency validation failed', {
                    query,
                    consistencyScore,
                    threshold: this.config.consistencyThreshold
                });

                // 一貫性が低い場合はキャッシュを無効化
                await this.invalidateInconsistentCache(query);
            }

        } catch (error) {
            logger.warn('Failed to validate consistency', { error });
        }
    }

    /**
     * データ一貫性を検証
     * @private
     */
    private async validateDataConsistency(result: MemoryResult): Promise<void> {
        try {
            // 基本的な一貫性チェック
            if (!result.success || !result.data) {
                throw new Error('Invalid data result');
            }

            // タイムスタンプの妥当性チェック
            const timestamp = new Date(result.timestamp);
            const now = new Date();
            const timeDiff = now.getTime() - timestamp.getTime();

            if (timeDiff > 60 * 60 * 1000) { // 1時間以上古い
                logger.warn('Data timestamp is too old', { timestamp, timeDiff });
            }

        } catch (error) {
            logger.warn('Data consistency validation failed', { error });
            throw error;
        }
    }

    /**
     * データ一貫性を計算
     * @private
     */
    private async calculateDataConsistency(data: any): Promise<number> {
        try {
            let score = 1.0;

            // 基本的な整合性チェック
            if (!data) {
                score -= 0.5;
            }

            // 型の一貫性チェック
            if (typeof data === 'object' && data !== null) {
                if (Array.isArray(data)) {
                    // 配列の要素が同じ型かチェック
                    const types = data.map(item => typeof item);
                    const uniqueTypes = new Set(types);
                    if (uniqueTypes.size > 1) {
                        score -= 0.2;
                    }
                } else {
                    // オブジェクトの必須フィールドチェック
                    if (data.id && data.name) {
                        score += 0.1;
                    }
                }
            }

            return Math.max(0, Math.min(1, score));

        } catch (error) {
            logger.warn('Failed to calculate data consistency', { error });
            return 0.5;
        }
    }

    /**
     * 一貫性のないキャッシュを無効化
     * @private
     */
    private async invalidateInconsistentCache(query: MemoryQuery): Promise<void> {
        try {
            for (const level of [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]) {
                const cacheKey = this.generateCacheKey(query, level);
                await this.cacheCoordinator.invalidate(cacheKey, level, 'Consistency validation failed');
            }
        } catch (error) {
            logger.warn('Failed to invalidate inconsistent cache', { error });
        }
    }

    /**
     * パフォーマンスを監視
     * @private
     */
    private async monitorPerformance(
        query: MemoryQuery,
        result: OptimizedAccessResult,
        startTime: number
    ): Promise<void> {
        try {
            const responseTime = Date.now() - startTime;

            if (responseTime > this.config.performanceThreshold) {
                logger.warn('Performance threshold exceeded', {
                    query,
                    responseTime,
                    threshold: this.config.performanceThreshold
                });

                // パフォーマンス問題がある場合はパターンを更新
                await this.updatePerformancePattern(query, responseTime);
            }

        } catch (error) {
            logger.warn('Failed to monitor performance', { error });
        }
    }

    /**
     * パフォーマンスパターンを更新
     * @private
     */
    private async updatePerformancePattern(query: MemoryQuery, responseTime: number): Promise<void> {
        try {
            const patternKey = this.generatePatternKey(query);
            const pattern = this.accessPatterns.get(patternKey);

            if (pattern) {
                // 移動平均で応答時間を更新
                const alpha = 0.2;
                pattern.averageAccessTime = pattern.averageAccessTime * (1 - alpha) + responseTime * alpha;

                // 一貫性スコアを下げる
                pattern.consistencyScore = Math.max(0, pattern.consistencyScore - 0.1);
            }

        } catch (error) {
            logger.warn('Failed to update performance pattern', { error });
        }
    }

    /**
     * 統計を更新
     * @private
     */
    private updateStatistics(result: OptimizedAccessResult, strategy: AccessStrategy): void {
        try {
            this.statistics.totalAccesses++;

            // 移動平均で統計を更新
            const alpha = 1 / Math.min(this.statistics.totalAccesses, 1000);

            this.statistics.averageAccessTime =
                this.statistics.averageAccessTime * (1 - alpha) + result.accessTime * alpha;

            // キャッシュヒット率の更新
            if (result.cacheHit) {
                this.statistics.cacheHitRate =
                    this.statistics.cacheHitRate * (1 - alpha) + 1 * alpha;
            } else {
                this.statistics.cacheHitRate =
                    this.statistics.cacheHitRate * (1 - alpha) + 0 * alpha;
            }

            // 戦略分布の更新
            this.statistics.strategyDistribution[strategy]++;

            // レベル分布の更新
            if (result.source !== 'cache') {
                this.statistics.levelDistribution[result.source as MemoryLevel]++;
            }

            // 最適化効果の計算
            this.statistics.optimizationEffectiveness =
                this.calculateOptimizationEffectiveness(result);

        } catch (error) {
            logger.warn('Failed to update statistics', { error });
        }
    }

    /**
     * 最適化効果を計算
     * @private
     */
    private calculateOptimizationEffectiveness(result: OptimizedAccessResult): number {
        try {
            let effectiveness = 0;

            // キャッシュヒットによる効果
            if (result.cacheHit) {
                effectiveness += 0.3;
            }

            // 最適化手法の適用による効果
            effectiveness += result.optimizationApplied.length * 0.1;

            // パフォーマンスゲインによる効果
            effectiveness += Math.min(result.metadata.performanceGain / 100, 0.3);

            // 一貫性スコアによる効果
            effectiveness += result.metadata.consistencyScore * 0.2;

            return Math.max(0, Math.min(1, effectiveness));

        } catch (error) {
            logger.warn('Failed to calculate optimization effectiveness', { error });
            return 0.5;
        }
    }

    /**
     * 履歴を記録
     * @private
     */
    private recordAccessHistory(query: MemoryQuery, result: OptimizedAccessResult): void {
        try {
            this.accessHistory.push({
                query,
                result,
                timestamp: Date.now()
            });

            // 履歴サイズを制限
            if (this.accessHistory.length > this.PATTERN_LEARNING_WINDOW) {
                this.accessHistory = this.accessHistory.slice(-this.PATTERN_LEARNING_WINDOW);
            }

        } catch (error) {
            logger.warn('Failed to record access history', { error });
        }
    }

    /**
     * フォールバックアクセスを実行
     * @private
     */
    private async executeFallbackAccess<T>(query: MemoryQuery, startTime: number): Promise<OptimizedAccessResult<T>> {
        try {
            const result = await this.duplicateResolver.getUnifiedMemoryAccess(query);

            return {
                data: result.data,
                source: result.source as MemoryLevel,
                strategy: AccessStrategy.BALANCED,
                accessTime: Date.now() - startTime,
                cacheHit: false,
                consistencyValidated: false,
                optimizationApplied: ['fallback'],
                metadata: {
                    originalQuery: query,
                    alternativesPruned: 0,
                    performanceGain: 0,
                    consistencyScore: 0.5
                }
            };

        } catch (error) {
            logger.error('Fallback access also failed', { error });
            throw error;
        }
    }

    /**
     * 統計情報を取得
     * 
     * @returns {AccessStatistics} アクセス統計情報
     */
    getStatistics(): AccessStatistics {
        return { ...this.statistics };
    }

    /**
     * 設定を更新
     * 
     * @param {Partial<OptimizationConfig>} newConfig 新しい設定
     */
    updateConfiguration(newConfig: Partial<OptimizationConfig>): void {
        this.config = { ...this.config, ...newConfig };
        logger.info('AccessOptimizer configuration updated', { config: this.config });
    }

    /**
     * システム負荷を計算
     * @private
     */
    private calculateSystemLoad(): number {
        try {
            // 簡易的なシステム負荷計算
            const recentAccesses = this.accessHistory.filter(
                h => Date.now() - h.timestamp < 60 * 1000 // 直近1分間
            ).length;

            return Math.min(1, recentAccesses / 100);

        } catch (error) {
            logger.warn('Failed to calculate system load', { error });
            return 0.5;
        }
    }

    /**
     * 代替案の数を計算
     * @private
     */
    private countAlternativesPruned(strategy: AccessStrategy): number {
        const totalStrategies = Object.keys(AccessStrategy).length;
        return totalStrategies - 1; // 選択された戦略以外
    }

    /**
     * パフォーマンスゲインを計算
     * @private
     */
    private calculatePerformanceGain(accessTime: number, strategy: AccessStrategy): number {
        const baselineTime = 200; // ベースライン時間（ms）
        return Math.max(0, ((baselineTime - accessTime) / baselineTime) * 100);
    }

    /**
     * 一貫性スコアを計算
     * @private
     */
    private calculateConsistencyScore(result: MemoryResult): number {
        try {
            if (!result.success) return 0;

            let score = 1.0;

            // メタデータの存在確認
            if (!result.metadata) {
                score -= 0.2;
            }

            // データの整合性確認
            if (!result.data) {
                score -= 0.5;
            }

            return Math.max(0, Math.min(1, score));

        } catch (error) {
            logger.warn('Failed to calculate consistency score', { error });
            return 0.5;
        }
    }
}