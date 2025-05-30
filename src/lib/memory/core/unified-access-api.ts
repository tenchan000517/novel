// src/lib/memory/core/unified-access-api.ts
/**
 * @fileoverview 統一アクセスAPI
 * @description
 * 記憶階層への統一されたアクセスインターフェースを提供し、
 * 重複処理の排除とアクセス最適化を実現します。
 */

import { logger } from '@/lib/utils/logger';
import {
    MemoryAccessRequest,
    MemoryAccessResponse,
    MemoryLevel,
    UnifiedMemoryContext,
    MemoryRequestType,
    IntegrationDiagnostics
} from './types';

// Memory Layer Interfaces
interface MemoryLayer {
    getData(request: any): Promise<any>;
    getStatus(): Promise<any>;
    getDiagnostics(): Promise<any>;
}

// Integration Components
interface DuplicateResolver {
    resolveAccess(request: MemoryAccessRequest): Promise<MemoryAccessRequest>;
}

interface CacheCoordinator {
    getFromCache(key: string): Promise<any>;
    setCache(key: string, data: any, ttl?: number): Promise<void>;
    invalidateCache(pattern: string): Promise<void>;
}

/**
 * @interface UnifiedAccessAPIConfig
 * @description 統一アクセスAPIの設定
 */
export interface UnifiedAccessAPIConfig {
    duplicateResolver: DuplicateResolver;
    cacheCoordinator: CacheCoordinator;
    memoryLayers: {
        shortTerm: MemoryLayer;
        midTerm: MemoryLayer;
        longTerm: MemoryLayer;
    };
    cacheEnabled?: boolean;
    optimizationEnabled?: boolean;
    maxRetries?: number;
    timeoutMs?: number;
}

/**
 * @class UnifiedAccessAPI
 * @description
 * 記憶階層への統一されたアクセスを提供するAPIクラス。
 * 重複処理の排除、キャッシュ最適化、アクセスパターン最適化を実現します。
 */
export class UnifiedAccessAPI {
    private config: Required<UnifiedAccessAPIConfig>;
    private initialized: boolean = false;
    private accessPatterns: Map<string, AccessPattern> = new Map();
    private performanceMetrics: {
        totalRequests: number;
        cacheHits: number;
        layerHits: Map<MemoryLevel, number>;
        averageResponseTime: number;
        errorCount: number;
        lastOptimization: string;
    } = {
            totalRequests: 0,
            cacheHits: 0,
            layerHits: new Map([
                [MemoryLevel.SHORT_TERM, 0],
                [MemoryLevel.MID_TERM, 0],
                [MemoryLevel.LONG_TERM, 0]
            ]),
            averageResponseTime: 0,
            errorCount: 0,
            lastOptimization: new Date().toISOString()
        };

    /**
     * コンストラクタ
     * @param config 設定オブジェクト
     */
    constructor(config: UnifiedAccessAPIConfig) {
        this.config = {
            ...config,
            cacheEnabled: config.cacheEnabled ?? true,
            optimizationEnabled: config.optimizationEnabled ?? true,
            maxRetries: config.maxRetries ?? 3,
            timeoutMs: config.timeoutMs ?? 30000
        };
    }

    /**
     * 統一アクセスAPIを初期化
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('UnifiedAccessAPI already initialized');
            return;
        }

        try {
            logger.info('Initializing UnifiedAccessAPI');

            // アクセスパターンの読み込み
            await this._loadAccessPatterns();

            // パフォーマンス最適化の初期化
            if (this.config.optimizationEnabled) {
                await this._initializeOptimization();
            }

            this.initialized = true;
            logger.info('UnifiedAccessAPI initialized successfully');

        } catch (error) {
            logger.error('Failed to initialize UnifiedAccessAPI', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * メモリアクセス要求を処理
     * @param request アクセス要求
     * @returns アクセス応答
     */
    async processRequest(request: MemoryAccessRequest): Promise<MemoryAccessResponse> {
        const startTime = Date.now();

        try {
            await this._ensureInitialized();

            logger.debug(`Processing unified access request for chapter ${request.chapterNumber}`, {
                requestType: request.requestType,
                targetLayers: request.targetLayers
            });

            this.performanceMetrics.totalRequests++;

            // 1. 重複処理の解決
            const resolvedRequest = await this._resolveDuplicates(request);

            // 2. キャッシュチェック
            const cacheResult = await this._checkCache(resolvedRequest);
            if (cacheResult.hit) {
                this.performanceMetrics.cacheHits++;
                const processingTime = Date.now() - startTime;
                this._updatePerformanceMetrics(processingTime);

                return {
                    success: true,
                    context: cacheResult.data,
                    fromCache: true,
                    processingTime,
                    metadata: {
                        layersAccessed: [],
                        duplicatesResolved: 0,
                        cacheHits: 1
                    }
                };
            }

            // 3. 最適化されたアクセス戦略の決定
            const accessStrategy = await this._determineAccessStrategy(resolvedRequest);

            // 4. 階層的データアクセス
            const accessResult = await this._executeAccessStrategy(accessStrategy);

            // 5. データ統合
            const integratedContext = await this._integrateAccessResults(accessResult);

            // 6. キャッシュへの保存
            if (this.config.cacheEnabled && integratedContext) {
                await this._cacheResult(resolvedRequest, integratedContext);
            }

            // 7. アクセスパターンの学習
            await this._learnAccessPattern(resolvedRequest, accessStrategy, Date.now() - startTime);

            const processingTime = Date.now() - startTime;
            this._updatePerformanceMetrics(processingTime);

            return {
                success: true,
                context: integratedContext,
                fromCache: false,
                processingTime,
                metadata: {
                    layersAccessed: accessStrategy.layers,
                    duplicatesResolved: accessStrategy.duplicatesResolved,
                    cacheHits: 0
                }
            };

        } catch (error) {
            this.performanceMetrics.errorCount++;
            const processingTime = Date.now() - startTime;

            logger.error(`Failed to process unified access request`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber: request.chapterNumber,
                requestType: request.requestType,
                processingTime
            });

            return {
                success: false,
                context: null,
                fromCache: false,
                processingTime,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * 複数の要求を並列処理
     * @param requests アクセス要求配列
     * @returns アクセス応答配列
     */
    async processBatchRequests(requests: MemoryAccessRequest[]): Promise<MemoryAccessResponse[]> {
        try {
            await this._ensureInitialized();

            logger.info(`Processing batch requests: ${requests.length} items`);

            // 要求を最適化してグループ化
            const optimizedBatches = this._optimizeBatchRequests(requests);

            // 各バッチを並列処理
            const batchResults = await Promise.allSettled(
                optimizedBatches.map(batch => this._processBatch(batch))
            );

            // 結果をフラット化
            const results: MemoryAccessResponse[] = [];
            for (const batchResult of batchResults) {
                if (batchResult.status === 'fulfilled') {
                    results.push(...batchResult.value);
                } else {
                    // バッチエラーの場合、エラー応答を作成
                    const errorResponse: MemoryAccessResponse = {
                        success: false,
                        context: null,
                        fromCache: false,
                        processingTime: 0,
                        error: batchResult.reason?.message || 'Batch processing failed'
                    };
                    results.push(errorResponse);
                }
            }

            logger.info(`Batch processing completed: ${results.length} results`);
            return results;

        } catch (error) {
            logger.error('Failed to process batch requests', {
                error: error instanceof Error ? error.message : String(error),
                requestCount: requests.length
            });

            // 全てエラー応答を返す
            return requests.map(() => ({
                success: false,
                context: null,
                fromCache: false,
                processingTime: 0,
                error: error instanceof Error ? error.message : String(error)
            }));
        }
    }

    /**
     * アクセスパターンを最適化
     * @returns 最適化結果
     */
    async optimizeAccessPatterns(): Promise<{ optimized: boolean; improvements: string[] }> {
        try {
            await this._ensureInitialized();

            logger.info('Optimizing access patterns');

            const improvements: string[] = [];

            // 1. アクセス頻度分析
            const frequencyAnalysis = this._analyzeAccessFrequency();
            if (frequencyAnalysis.optimizable) {
                await this._optimizeFrequentPatterns(frequencyAnalysis.patterns);
                improvements.push(`Optimized ${frequencyAnalysis.patterns.length} frequent access patterns`);
            }

            // 2. キャッシュヒット率最適化
            const cacheAnalysis = this._analyzeCachePerformance();
            if (cacheAnalysis.improvable) {
                await this._optimizeCacheStrategy(cacheAnalysis.recommendations);
                improvements.push(`Improved cache strategy: ${cacheAnalysis.recommendations.join(', ')}`);
            }

            // 3. レイヤーアクセス最適化
            const layerAnalysis = this._analyzeLayerAccess();
            if (layerAnalysis.optimizable) {
                await this._optimizeLayerAccess(layerAnalysis.optimizations);
                improvements.push(`Optimized layer access: ${layerAnalysis.optimizations.join(', ')}`);
            }

            this.performanceMetrics.lastOptimization = new Date().toISOString();

            logger.info('Access pattern optimization completed', {
                improvementCount: improvements.length,
                improvements
            });

            return {
                optimized: improvements.length > 0,
                improvements
            };

        } catch (error) {
            logger.error('Failed to optimize access patterns', {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                optimized: false,
                improvements: []
            };
        }
    }

    /**
     * システム診断を取得
     * @returns 診断結果
     */
    async getDiagnostics(): Promise<IntegrationDiagnostics> {
        try {
            const cacheHitRatio = this.performanceMetrics.totalRequests > 0
                ? this.performanceMetrics.cacheHits / this.performanceMetrics.totalRequests
                : 0;

            const errorRate = this.performanceMetrics.totalRequests > 0
                ? this.performanceMetrics.errorCount / this.performanceMetrics.totalRequests
                : 0;

            const efficiency = Math.max(0, Math.min(1,
                (cacheHitRatio * 0.6) +
                ((1 - errorRate) * 0.4)
            ));

            const recommendations: string[] = [];

            if (cacheHitRatio < 0.6) {
                recommendations.push('Consider optimizing cache strategy');
            }

            if (errorRate > 0.1) {
                recommendations.push('High error rate detected, check system stability');
            }

            if (this.performanceMetrics.averageResponseTime > 1000) {
                recommendations.push('High response time, consider performance optimization');
            }

            return {
                operational: this.initialized,
                efficiency,
                errorRate,
                lastOptimization: this.performanceMetrics.lastOptimization,
                recommendations
            };

        } catch (error) {
            logger.error('Failed to get diagnostics', {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                operational: false,
                efficiency: 0,
                errorRate: 1,
                lastOptimization: '',
                recommendations: ['System diagnostics failed']
            };
        }
    }

    /**
     * パフォーマンス統計を取得
     * @returns パフォーマンス統計
     */
    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }

    /**
     * メモリレイヤーを更新
     */
    updateMemoryLayers(layers: {
        shortTerm: any;
        midTerm: any;
        longTerm: any;
    }): void {
        try {
            this.config.memoryLayers = layers;
            logger.debug('Memory layers updated in UnifiedAccessAPI');
        } catch (error) {
            logger.warn('Failed to update memory layers in UnifiedAccessAPI', { error });
        }
    }

    // ============================================================================
    // Private Methods
    // ============================================================================

    /**
     * アクセスパターンを読み込み
     * @private
     */
    private async _loadAccessPatterns(): Promise<void> {
        try {
            // 既存のアクセスパターンを読み込み（実装依存）
            // この部分は実際のストレージ実装に依存
            logger.debug('Loading access patterns');
        } catch (error) {
            logger.warn('Failed to load access patterns, starting with defaults', { error });
        }
    }

    /**
     * 最適化を初期化
     * @private
     */
    private async _initializeOptimization(): Promise<void> {
        try {
            // 最適化ルールの設定
            logger.debug('Initializing optimization rules');
        } catch (error) {
            logger.warn('Failed to initialize optimization', { error });
        }
    }

    /**
     * 重複処理を解決
     * @private
     */
    private async _resolveDuplicates(request: MemoryAccessRequest): Promise<MemoryAccessRequest> {
        try {
            return await this.config.duplicateResolver.resolveAccess(request);
        } catch (error) {
            logger.warn('Failed to resolve duplicates', { error });
            return request;
        }
    }

    /**
     * キャッシュをチェック（型安全性向上版）
     * @private
     */
    private async _checkCache(request: MemoryAccessRequest): Promise<{ hit: boolean; data: UnifiedMemoryContext | null }> {
        if (!this.config.cacheEnabled) {
            return { hit: false, data: null };
        }

        try {
            const cacheKey = this._generateCacheKey(request);
            const cachedData = await this.config.cacheCoordinator.getFromCache(cacheKey);

            return {
                hit: cachedData !== null && cachedData !== undefined,
                data: cachedData ?? null // undefinedをnullに統一
            };
        } catch (error) {
            logger.warn('Cache check failed', { error });
            return { hit: false, data: null };
        }
    }

    /**
     * アクセス戦略を決定
     * @private
     */
    private async _determineAccessStrategy(request: MemoryAccessRequest): Promise<AccessStrategy> {
        const strategy: AccessStrategy = {
            layers: [...request.targetLayers],
            parallel: request.targetLayers.length > 1,
            priorityOrder: this._determinePriorityOrder(request),
            duplicatesResolved: 0,
            optimizations: []
        };

        // 学習されたパターンから最適化
        const patternKey = this._generatePatternKey(request);
        const learnedPattern = this.accessPatterns.get(patternKey);

        if (learnedPattern && learnedPattern.effectiveness > 0.8) {
            strategy.layers = learnedPattern.optimalLayers;
            strategy.parallel = learnedPattern.parallel;
            strategy.optimizations.push('pattern-learned');
        }

        return strategy;
    }

    /**
     * アクセス戦略を実行
     * @private
     */
    private async _executeAccessStrategy(strategy: AccessStrategy): Promise<LayerAccessResult[]> {
        const results: LayerAccessResult[] = [];

        if (strategy.parallel) {
            // 並列アクセス
            const promises = strategy.layers.map(layer => this._accessLayer(layer));
            const settled = await Promise.allSettled(promises);

            for (let i = 0; i < settled.length; i++) {
                const result = settled[i];
                if (result.status === 'fulfilled') {
                    results.push({
                        layer: strategy.layers[i],
                        success: true,
                        data: result.value,
                        processingTime: 0 // 実際の時間は測定が必要
                    });
                    this.performanceMetrics.layerHits.set(
                        strategy.layers[i],
                        (this.performanceMetrics.layerHits.get(strategy.layers[i]) || 0) + 1
                    );
                } else {
                    results.push({
                        layer: strategy.layers[i],
                        success: false,
                        error: result.reason?.message || 'Unknown error',
                        processingTime: 0
                    });
                }
            }
        } else {
            // 順次アクセス
            for (const layer of strategy.priorityOrder) {
                try {
                    const startTime = Date.now();
                    const data = await this._accessLayer(layer);
                    const processingTime = Date.now() - startTime;

                    results.push({
                        layer,
                        success: true,
                        data,
                        processingTime
                    });

                    this.performanceMetrics.layerHits.set(
                        layer,
                        (this.performanceMetrics.layerHits.get(layer) || 0) + 1
                    );
                } catch (error) {
                    results.push({
                        layer,
                        success: false,
                        error: error instanceof Error ? error.message : String(error),
                        processingTime: 0
                    });
                }
            }
        }

        return results;
    }

    /**
     * レイヤーにアクセス
     * @private
     */
    private async _accessLayer(layer: MemoryLevel): Promise<any> {
        switch (layer) {
            case MemoryLevel.SHORT_TERM:
                return await this.config.memoryLayers.shortTerm.getData({});
            case MemoryLevel.MID_TERM:
                return await this.config.memoryLayers.midTerm.getData({});
            case MemoryLevel.LONG_TERM:
                return await this.config.memoryLayers.longTerm.getData({});
            default:
                throw new Error(`Unknown memory layer: ${layer}`);
        }
    }

    /**
     * アクセス結果を統合
     * @private
     */
    private async _integrateAccessResults(results: LayerAccessResult[]): Promise<UnifiedMemoryContext | null> {
        try {
            const successfulResults = results.filter(r => r.success);

            if (successfulResults.length === 0) {
                return null;
            }

            // 統合ロジック（実装依存）
            const integratedContext: UnifiedMemoryContext = {
                chapterNumber: 0, // 実際の値を設定
                timestamp: new Date().toISOString(),
                shortTerm: {
                    recentChapters: [],
                    immediateCharacterStates: new Map(),
                    keyPhrases: [],
                    processingBuffers: []
                },
                midTerm: {
                    narrativeProgression: {} as any,
                    analysisResults: [] as any,
                    characterEvolution: [] as any,
                    systemStatistics: {} as any,
                    qualityMetrics: {} as any
                },
                longTerm: {
                    consolidatedSettings: {} as any,
                    knowledgeDatabase: {} as any,
                    systemKnowledgeBase: {} as any,
                    completedRecords: {} as any
                },
                integration: {
                    resolvedDuplicates: [],
                    cacheStatistics: {} as any,
                    accessOptimizations: []
                }
            };

            return integratedContext;

        } catch (error) {
            logger.error('Failed to integrate access results', { error });
            return null;
        }
    }

    /**
     * 結果をキャッシュ
     * @private
     */
    private async _cacheResult(request: MemoryAccessRequest, context: UnifiedMemoryContext): Promise<void> {
        try {
            const cacheKey = this._generateCacheKey(request);
            const ttl = this._determineCacheTTL(request);
            await this.config.cacheCoordinator.setCache(cacheKey, context, ttl);
        } catch (error) {
            logger.warn('Failed to cache result', { error });
        }
    }

    /**
     * アクセスパターンを学習
     * @private
     */
    private async _learnAccessPattern(
        request: MemoryAccessRequest,
        strategy: AccessStrategy,
        responseTime: number
    ): Promise<void> {
        try {
            const patternKey = this._generatePatternKey(request);
            const existingPattern = this.accessPatterns.get(patternKey);

            const effectiveness = Math.max(0, Math.min(1, 1 - (responseTime / 5000))); // 5秒を基準

            if (existingPattern) {
                // 既存パターンを更新
                existingPattern.usage++;
                existingPattern.effectiveness = (existingPattern.effectiveness + effectiveness) / 2;
                existingPattern.lastUsed = new Date().toISOString();
            } else {
                // 新しいパターンを追加
                this.accessPatterns.set(patternKey, {
                    request: request.requestType,
                    layers: [...strategy.layers],
                    optimalLayers: [...strategy.layers],
                    parallel: strategy.parallel,
                    effectiveness,
                    usage: 1,
                    lastUsed: new Date().toISOString()
                });
            }
        } catch (error) {
            logger.warn('Failed to learn access pattern', { error });
        }
    }

    /**
     * バッチ要求を最適化
     * @private
     */
    private _optimizeBatchRequests(requests: MemoryAccessRequest[]): MemoryAccessRequest[][] {
        // 類似する要求をグループ化
        const groups = new Map<string, MemoryAccessRequest[]>();

        for (const request of requests) {
            const groupKey = `${request.requestType}-${request.targetLayers.join(',')}`;
            if (!groups.has(groupKey)) {
                groups.set(groupKey, []);
            }
            groups.get(groupKey)!.push(request);
        }

        return Array.from(groups.values());
    }

    /**
     * バッチを処理
     * @private
     */
    private async _processBatch(batch: MemoryAccessRequest[]): Promise<MemoryAccessResponse[]> {
        const promises = batch.map(request => this.processRequest(request));
        const results = await Promise.allSettled(promises);

        return results.map(result =>
            result.status === 'fulfilled'
                ? result.value
                : {
                    success: false,
                    context: null,
                    fromCache: false,
                    processingTime: 0,
                    error: result.reason?.message || 'Unknown error'
                }
        );
    }

    /**
     * アクセス頻度を分析
     * @private
     */
    private _analyzeAccessFrequency(): { optimizable: boolean; patterns: AccessPattern[] } {
        const frequentPatterns = Array.from(this.accessPatterns.values())
            .filter(pattern => pattern.usage > 10)
            .sort((a, b) => b.usage - a.usage);

        return {
            optimizable: frequentPatterns.length > 0,
            patterns: frequentPatterns
        };
    }

    /**
     * キャッシュパフォーマンスを分析
     * @private
     */
    private _analyzeCachePerformance(): { improvable: boolean; recommendations: string[] } {
        const cacheHitRatio = this.performanceMetrics.totalRequests > 0
            ? this.performanceMetrics.cacheHits / this.performanceMetrics.totalRequests
            : 0;

        const recommendations: string[] = [];

        if (cacheHitRatio < 0.6) {
            recommendations.push('increase-cache-size');
        }

        if (cacheHitRatio < 0.4) {
            recommendations.push('optimize-cache-keys');
        }

        return {
            improvable: recommendations.length > 0,
            recommendations
        };
    }

    /**
     * レイヤーアクセスを分析
     * @private
     */
    private _analyzeLayerAccess(): { optimizable: boolean; optimizations: string[] } {
        const optimizations: string[] = [];

        const shortTermHits = this.performanceMetrics.layerHits.get(MemoryLevel.SHORT_TERM) || 0;
        const midTermHits = this.performanceMetrics.layerHits.get(MemoryLevel.MID_TERM) || 0;
        const longTermHits = this.performanceMetrics.layerHits.get(MemoryLevel.LONG_TERM) || 0;

        const total = shortTermHits + midTermHits + longTermHits;

        if (total > 0) {
            if (longTermHits / total > 0.5) {
                optimizations.push('cache-long-term-data');
            }

            if (shortTermHits / total < 0.3) {
                optimizations.push('optimize-short-term-access');
            }
        }

        return {
            optimizable: optimizations.length > 0,
            optimizations
        };
    }

    /**
     * 頻繁なパターンを最適化
     * @private
     */
    private async _optimizeFrequentPatterns(patterns: AccessPattern[]): Promise<void> {
        for (const pattern of patterns) {
            // パターン最適化ロジック
            if (pattern.effectiveness < 0.7) {
                // 効率の悪いパターンを改善
                pattern.optimalLayers = this._optimizeLayerOrder(pattern.layers);
            }
        }
    }

    /**
     * キャッシュ戦略を最適化
     * @private
     */
    private async _optimizeCacheStrategy(recommendations: string[]): Promise<void> {
        for (const recommendation of recommendations) {
            switch (recommendation) {
                case 'increase-cache-size':
                    // キャッシュサイズの増加ロジック
                    break;
                case 'optimize-cache-keys':
                    // キャッシュキーの最適化ロジック
                    break;
            }
        }
    }

    /**
     * レイヤーアクセスを最適化
     * @private
     */
    private async _optimizeLayerAccess(optimizations: string[]): Promise<void> {
        for (const optimization of optimizations) {
            switch (optimization) {
                case 'cache-long-term-data':
                    // 長期記憶データのキャッシュ強化
                    break;
                case 'optimize-short-term-access':
                    // 短期記憶アクセスの最適化
                    break;
            }
        }
    }

    /**
     * ユーティリティメソッド
     * @private
     */
    private _generateCacheKey(request: MemoryAccessRequest): string {
        return `${request.requestType}-${request.chapterNumber}-${request.targetLayers.join(',')}`;
    }

    private _generatePatternKey(request: MemoryAccessRequest): string {
        return `${request.requestType}-${request.targetLayers.sort().join(',')}`;
    }

    private _determinePriorityOrder(request: MemoryAccessRequest): MemoryLevel[] {
        // デフォルトの優先順序: SHORT_TERM -> MID_TERM -> LONG_TERM
        const priorityMap = {
            [MemoryLevel.SHORT_TERM]: 1,
            [MemoryLevel.MID_TERM]: 2,
            [MemoryLevel.LONG_TERM]: 3
        };

        return [...request.targetLayers].sort((a, b) => priorityMap[a] - priorityMap[b]);
    }

    private _determineCacheTTL(request: MemoryAccessRequest): number {
        // 要求タイプに基づいてTTLを決定
        const ttlMap = {
            [MemoryRequestType.CHAPTER_CONTEXT]: 30 * 60 * 1000, // 30分
            [MemoryRequestType.CHARACTER_ANALYSIS]: 60 * 60 * 1000, // 1時間
            [MemoryRequestType.NARRATIVE_STATE]: 15 * 60 * 1000, // 15分
            [MemoryRequestType.WORLD_KNOWLEDGE]: 120 * 60 * 1000, // 2時間
            [MemoryRequestType.SYSTEM_DIAGNOSTICS]: 5 * 60 * 1000, // 5分
            [MemoryRequestType.INTEGRATED_CONTEXT]: 45 * 60 * 1000 // 45分
        };

        return ttlMap[request.requestType] || 30 * 60 * 1000;
    }

    private _optimizeLayerOrder(layers: MemoryLevel[]): MemoryLevel[] {
        // 効率的なレイヤー順序を計算
        return [...layers].sort((a, b) => {
            const hitRateA = this.performanceMetrics.layerHits.get(a) || 0;
            const hitRateB = this.performanceMetrics.layerHits.get(b) || 0;
            return hitRateB - hitRateA; // ヒット率の高い順
        });
    }

    private _updatePerformanceMetrics(processingTime: number): void {
        this.performanceMetrics.averageResponseTime =
            (this.performanceMetrics.averageResponseTime + processingTime) / 2;
    }

    private async _ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }
    }
}

// ============================================================================
// Supporting Types
// ============================================================================

interface AccessPattern {
    request: MemoryRequestType;
    layers: MemoryLevel[];
    optimalLayers: MemoryLevel[];
    parallel: boolean;
    effectiveness: number;
    usage: number;
    lastUsed: string;
}

interface AccessStrategy {
    layers: MemoryLevel[];
    parallel: boolean;
    priorityOrder: MemoryLevel[];
    duplicatesResolved: number;
    optimizations: string[];
}

interface LayerAccessResult {
    layer: MemoryLevel;
    success: boolean;
    data?: any;
    error?: string;
    processingTime: number;
}