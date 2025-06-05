/**
 * @fileoverview キャッシュ協調システム
 * @description
 * 記憶階層間のキャッシュ管理と協調処理を行うクラス。
 * 短期→中期→長期の順でキャッシュ管理を行い、無効化・更新の協調処理を実現します。
 */

import { logger } from '@/lib/utils/logger';
import {
    CacheStatisticsData,
    MemoryLevel
} from '../core/types';

/**
 * キャッシュエントリの型定義
 */
export interface CacheEntry<T = any> {
    key: string;
    data: T;
    level: MemoryLevel;
    timestamp: number;
    expiryTime: number;
    accessCount: number;
    lastAccessTime: number;
    dependencies: string[];
    metadata?: {
        size: number;
        priority: number;
        tags: string[];
    };
}

/**
 * キャッシュ統計情報の型定義
 */
export interface CacheStatistics {
    totalEntries: number;
    hitRate: number;
    missRate: number;
    avgAccessTime: number;
    memoryUsage: {
        shortTerm: number;
        midTerm: number;
        longTerm: number;
    };
    evictionCount: number;
    lastCleanupTime: number;
}

/**
 * キャッシュ無効化イベントの型定義
 */
export interface CacheInvalidationEvent {
    type: 'UPDATE' | 'DELETE' | 'EXPIRE' | 'DEPENDENCY_CHANGE';
    affectedKeys: string[];
    level: MemoryLevel;
    timestamp: number;
    reason: string;
}

/**
 * プリロード設定の型定義
 */
export interface PreloadConfiguration {
    chapterNumber: number;
    preloadDepth: number; // 何章先まで予測するか
    priorities: {
        characters: number;
        worldSettings: number;
        narrativeState: number;
        foreshadowing: number;
    };
}

/**
 * @class CacheCoordinator
 * @description
 * 記憶階層間のキャッシュ管理と協調処理を行うクラス。
 * 階層間でのキャッシュの整合性を保ち、効率的なデータアクセスを実現します。
 */
export class CacheCoordinator {
    private caches: Map<MemoryLevel, Map<string, CacheEntry>> = new Map();

    // 修正: プロパティ宣言時に初期化（推奨方法）
    private statistics: CacheStatistics = {
        totalEntries: 0,
        hitRate: 0,
        missRate: 0,
        avgAccessTime: 0,
        memoryUsage: {
            shortTerm: 0,
            midTerm: 0,
            longTerm: 0
        },
        evictionCount: 0,
        lastCleanupTime: Date.now()
    };

    private invalidationQueue: CacheInvalidationEvent[] = [];
    private preloadQueue: Array<{ key: string; level: MemoryLevel; priority: number }> = [];

    // キャッシュサイズ制限（メガバイト）
    private readonly MAX_CACHE_SIZE = {
        [MemoryLevel.SHORT_TERM]: 50,
        [MemoryLevel.MID_TERM]: 100,
        [MemoryLevel.LONG_TERM]: 200
    };

    // キャッシュ有効期限（ミリ秒）
    private readonly CACHE_TTL = {
        [MemoryLevel.SHORT_TERM]: 5 * 60 * 1000,   // 5分
        [MemoryLevel.MID_TERM]: 30 * 60 * 1000,    // 30分
        [MemoryLevel.LONG_TERM]: 2 * 60 * 60 * 1000 // 2時間
    };

    // アクセス統計
    private accessStats = {
        hits: 0,
        misses: 0,
        totalAccessTime: 0,
        accessCount: 0
    };

    constructor(
        private memoryComponents: {
            immediateContext?: any;
            narrativeMemory?: any;
            worldKnowledge?: any;
            eventMemory?: any;
            characterManager?: any;
        }
    ) {
        this.initializeCaches();
        this.initializeStatistics();
        this.startPeriodicCleanup();

        logger.info('CacheCoordinator initialized');
    }

    /**
     * キャッシュを初期化
     * @private
     */
    private initializeCaches(): void {
        this.caches.set(MemoryLevel.SHORT_TERM, new Map());
        this.caches.set(MemoryLevel.MID_TERM, new Map());
        this.caches.set(MemoryLevel.LONG_TERM, new Map());
    }

    /**
     * 統計情報を初期化
     * @private
     */
    private initializeStatistics(): void {
        this.statistics = {
            totalEntries: 0,
            hitRate: 0,
            missRate: 0,
            avgAccessTime: 0,
            memoryUsage: {
                shortTerm: 0,
                midTerm: 0,
                longTerm: 0
            },
            evictionCount: 0,
            lastCleanupTime: Date.now()
        };
    }

    /**
     * 定期的なキャッシュクリーンアップを開始
     * @private
     */
    private startPeriodicCleanup(): void {
        setInterval(() => {
            this.performCleanup();
        }, 10 * 60 * 1000); // 10分間隔
    }

    /**
     * 階層間キャッシュ管理を実行
     * 
     * @param {string} cacheKey キャッシュキー
     * @param {any} data データ
     * @param {MemoryLevel} level メモリレベル
     * @returns {Promise<void>}
     */
    async coordinateCache(cacheKey: string, data: any, level: MemoryLevel): Promise<void> {
        const startTime = Date.now();

        try {
            logger.debug(`Coordinating cache for key: ${cacheKey} at level: ${level}`);

            // データサイズの計算
            const dataSize = this.calculateDataSize(data);

            // キャッシュ容量チェック
            await this.ensureCacheCapacity(level, dataSize);

            // 依存関係の解析
            const dependencies = this.analyzeDependencies(cacheKey, data);

            // キャッシュエントリの作成
            const entry: CacheEntry = {
                key: cacheKey,
                data,
                level,
                timestamp: Date.now(),
                expiryTime: Date.now() + this.CACHE_TTL[level],
                accessCount: 0,
                lastAccessTime: Date.now(),
                dependencies,
                metadata: {
                    size: dataSize,
                    priority: this.calculatePriority(cacheKey, level),
                    tags: this.generateTags(cacheKey, data)
                }
            };

            // キャッシュに保存
            const cache = this.caches.get(level)!;
            cache.set(cacheKey, entry);

            // 階層間の協調処理
            await this.coordinateHierarchy(cacheKey, data, level);

            // 統計の更新
            this.updateStatistics();

            // 無効化イベントの処理
            await this.processInvalidationEvents();

            const processingTime = Date.now() - startTime;
            logger.debug(`Cache coordination completed for ${cacheKey} in ${processingTime}ms`);

        } catch (error) {
            logger.error(`Failed to coordinate cache for ${cacheKey}`, {
                error: error instanceof Error ? error.message : String(error),
                level
            });
            throw error;
        }
    }

    /**
     * プリロード・予測キャッシュを実行
     * 
     * @param {number} nextChapterNumber 次の章番号
     * @param {PreloadConfiguration} config プリロード設定
     * @returns {Promise<void>}
     */
    async predictiveCache(nextChapterNumber: number, config?: PreloadConfiguration): Promise<void> {
        const startTime = Date.now();

        try {
            logger.info(`Starting predictive cache for chapter ${nextChapterNumber}`);

            const preloadConfig: PreloadConfiguration = config || {
                chapterNumber: nextChapterNumber,
                preloadDepth: 3,
                priorities: {
                    characters: 0.9,
                    worldSettings: 0.8,
                    narrativeState: 0.7,
                    foreshadowing: 0.6
                }
            };

            // 予測に基づくプリロード項目の生成
            const preloadItems = await this.generatePreloadItems(preloadConfig);

            // 優先度順にソート
            preloadItems.sort((a, b) => b.priority - a.priority);

            // 並列プリロード実行（最大5件まで）
            const preloadPromises = preloadItems.slice(0, 5).map(item =>
                this.executePreload(item)
            );

            const results = await Promise.allSettled(preloadPromises);

            // 結果の集計
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            const processingTime = Date.now() - startTime;
            logger.info(`Predictive cache completed for chapter ${nextChapterNumber}: ${successful} successful, ${failed} failed (${processingTime}ms)`);

        } catch (error) {
            logger.error(`Failed to execute predictive cache for chapter ${nextChapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * キャッシュから데이터を取得
     * 
     * @param {string} cacheKey キャッシュキー
     * @param {MemoryLevel} level メモリレベル
     * @returns {Promise<any>} キャッシュされたデータ
     */
    async get<T>(cacheKey: string, level: MemoryLevel): Promise<T | null> {
        const startTime = Date.now();

        try {
            const cache = this.caches.get(level);
            if (!cache) {
                this.recordMiss();
                return null;
            }

            const entry = cache.get(cacheKey);
            if (!entry) {
                this.recordMiss();
                return null;
            }

            // 有効期限チェック
            if (Date.now() > entry.expiryTime) {
                cache.delete(cacheKey);
                this.recordMiss();
                return null;
            }

            // アクセス統計の更新
            entry.accessCount++;
            entry.lastAccessTime = Date.now();

            this.recordHit();

            const processingTime = Date.now() - startTime;
            this.accessStats.totalAccessTime += processingTime;
            this.accessStats.accessCount++;

            logger.debug(`Cache hit for ${cacheKey} at level ${level} (${processingTime}ms)`);

            return entry.data as T;

        } catch (error) {
            logger.error(`Failed to get cache for ${cacheKey}`, {
                error: error instanceof Error ? error.message : String(error),
                level
            });
            this.recordMiss();
            return null;
        }
    }

    /**
 * キャッシュから取得 (UnifiedAccessAPI用)
 */
    async getFromCache(key: string): Promise<any> {
        try {
            // 各レベルを順番に確認
            for (const level of [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]) {
                const result = await this.get(key, level);
                if (result) {
                    return result;
                }
            }
            return null;
        } catch (error) {
            logger.warn('Failed to get from cache', { error, key });
            return null;
        }
    }

    /**
     * キャッシュに設定 (UnifiedAccessAPI用)
     */
    async setCache(key: string, data: any, ttl?: number): Promise<void> {
        try {
            await this.coordinateCache(key, data, MemoryLevel.MID_TERM);
        } catch (error) {
            logger.warn('Failed to set cache', { error, key });
        }
    }

    /**
     * キャッシュパターンを無効化 (UnifiedAccessAPI用)
     */
    async invalidateCache(pattern: string): Promise<void> {
        try {
            for (const level of [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]) {
                await this.invalidate(pattern, level, 'Pattern-based invalidation');
            }
        } catch (error) {
            logger.warn('Failed to invalidate cache pattern', { error, pattern });
        }
    }

    /**
     * 診断情報を取得
     */
    async getDiagnostics(): Promise<any> {
        try {
            const stats = this.getStatistics();
            return {
                operational: true,
                efficiency: Math.min(stats.hitRate, 1.0),
                errorRate: Math.max(0, 1 - stats.hitRate),
                lastOptimization: new Date().toISOString(),
                recommendations: stats.hitRate < 0.6 ? ['Consider cache optimization'] : []
            };
        } catch (error) {
            logger.error('Failed to get cache coordinator diagnostics', { error });
            return {
                operational: false,
                efficiency: 0,
                errorRate: 1,
                lastOptimization: '',
                recommendations: ['Cache coordinator diagnostics failed']
            };
        }
    }

    /**
     * 統計情報を CacheStatisticsData 形式で返す
     */
    getStatisticsAsData(): CacheStatisticsData {
        try {
            const stats = this.getStatistics();
            return {
                hitRatio: stats.hitRate,
                missRatio: stats.missRate,
                totalRequests: stats.totalEntries,
                cacheSize: typeof stats.memoryUsage === 'object'
                    ? stats.memoryUsage.shortTerm + stats.memoryUsage.midTerm + stats.memoryUsage.longTerm
                    : stats.memoryUsage || 0,
                lastOptimization: new Date().toISOString(),
                evictionCount: stats.evictionCount,
                // 互換性のため既存プロパティも含める
                totalEntries: stats.totalEntries,
                hitRate: stats.hitRate,
                avgAccessTime: stats.avgAccessTime,
                memoryUsage: stats.memoryUsage
            };
        } catch (error) {
            logger.error('Failed to get statistics as data', { error });
            return {
                hitRatio: 0,
                missRatio: 1,
                totalRequests: 0,
                cacheSize: 0,
                lastOptimization: new Date().toISOString(),
                evictionCount: 0
            };
        }
    }

    /**
     * キャッシュを無効化
     * 
     * @param {string} cacheKey キャッシュキー
     * @param {MemoryLevel} level メモリレベル
     * @param {string} reason 無効化理由
     * @returns {Promise<void>}
     */
    async invalidate(cacheKey: string, level: MemoryLevel, reason: string): Promise<void> {
        try {
            logger.debug(`Invalidating cache for ${cacheKey} at level ${level}: ${reason}`);

            const cache = this.caches.get(level);
            if (!cache) return;

            const entry = cache.get(cacheKey);
            if (!entry) return;

            // 依存関係のあるキャッシュも無効化
            const dependentKeys = await this.findDependentKeys(cacheKey, level);

            // 無効化イベントの作成
            const invalidationEvent: CacheInvalidationEvent = {
                type: 'DELETE',
                affectedKeys: [cacheKey, ...dependentKeys],
                level,
                timestamp: Date.now(),
                reason
            };

            // キャッシュから削除
            cache.delete(cacheKey);

            // 依存関係のあるキャッシュも削除
            for (const dependentKey of dependentKeys) {
                cache.delete(dependentKey);
            }

            // 無効化イベントをキューに追加
            this.invalidationQueue.push(invalidationEvent);

            // 統計の更新
            this.updateStatistics();

            logger.debug(`Cache invalidated for ${cacheKey} and ${dependentKeys.length} dependent keys`);

        } catch (error) {
            logger.error(`Failed to invalidate cache for ${cacheKey}`, {
                error: error instanceof Error ? error.message : String(error),
                level
            });
        }
    }

    /**
     * キャッシュ統計を取得
     * 
     * @returns {CacheStatistics} キャッシュ統計情報
     */
    getStatistics(): CacheStatistics {
        this.updateStatistics();
        return { ...this.statistics };
    }

    /**
     * キャッシュをクリアする
     * 
     * @param {MemoryLevel} level メモリレベル（省略時は全レベル）
     * @returns {Promise<void>}
     */
    async clear(level?: MemoryLevel): Promise<void> {
        try {
            if (level) {
                const cache = this.caches.get(level);
                if (cache) {
                    cache.clear();
                    logger.info(`Cache cleared for level: ${level}`);
                }
            } else {
                for (const cache of this.caches.values()) {
                    cache.clear();
                }
                logger.info('All caches cleared');
            }

            this.updateStatistics();

        } catch (error) {
            logger.error('Failed to clear cache', {
                error: error instanceof Error ? error.message : String(error),
                level
            });
        }
    }

    /**
     * 階層間の協調処理を実行
     * @private
     */
    private async coordinateHierarchy(cacheKey: string, data: any, level: MemoryLevel): Promise<void> {
        try {
            // 下位レベルのキャッシュに伝播
            if (level === MemoryLevel.LONG_TERM) {
                // 長期記憶の更新は中期・短期記憶に影響
                await this.propagateToLowerLevels(cacheKey, data, MemoryLevel.MID_TERM);
                await this.propagateToLowerLevels(cacheKey, data, MemoryLevel.SHORT_TERM);
            } else if (level === MemoryLevel.MID_TERM) {
                // 中期記憶の更新は短期記憶に影響
                await this.propagateToLowerLevels(cacheKey, data, MemoryLevel.SHORT_TERM);
            }

            // 上位レベルへの通知
            await this.notifyUpperLevels(cacheKey, data, level);

        } catch (error) {
            logger.warn('Failed to coordinate hierarchy', {
                error: error instanceof Error ? error.message : String(error),
                cacheKey,
                level
            });
        }
    }

    /**
     * 下位レベルに伝播
     * @private
     */
    private async propagateToLowerLevels(cacheKey: string, data: any, targetLevel: MemoryLevel): Promise<void> {
        try {
            const cache = this.caches.get(targetLevel);
            if (!cache) return;

            const existingEntry = cache.get(cacheKey);
            if (existingEntry) {
                // 既存のエントリがある場合は更新
                existingEntry.data = data;
                existingEntry.timestamp = Date.now();
                existingEntry.expiryTime = Date.now() + this.CACHE_TTL[targetLevel];

                logger.debug(`Propagated cache update to ${targetLevel} for ${cacheKey}`);
            }

        } catch (error) {
            logger.warn(`Failed to propagate to ${targetLevel}`, { error, cacheKey });
        }
    }

    /**
     * 上位レベルに通知
     * @private
     */
    private async notifyUpperLevels(cacheKey: string, data: any, sourceLevel: MemoryLevel): Promise<void> {
        try {
            // 上位レベルのキャッシュに変更通知
            const upperLevels: MemoryLevel[] = [];

            if (sourceLevel === MemoryLevel.SHORT_TERM) {
                upperLevels.push(MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM);
            } else if (sourceLevel === MemoryLevel.MID_TERM) {
                upperLevels.push(MemoryLevel.LONG_TERM);
            }

            for (const level of upperLevels) {
                const cache = this.caches.get(level);
                if (cache) {
                    const entry = cache.get(cacheKey);
                    if (entry && entry.dependencies.length > 0) {
                        // 依存関係がある場合は無効化
                        await this.invalidate(cacheKey, level, `Dependency change from ${sourceLevel}`);
                    }
                }
            }

        } catch (error) {
            logger.warn('Failed to notify upper levels', { error, cacheKey, sourceLevel });
        }
    }

    /**
     * プリロード項目を生成
     * @private
     */
    private async generatePreloadItems(config: PreloadConfiguration): Promise<Array<{ key: string; level: MemoryLevel; priority: number }>> {
        const items: Array<{ key: string; level: MemoryLevel; priority: number }> = [];

        try {
            const { chapterNumber, preloadDepth, priorities } = config;

            // キャラクター情報のプリロード
            if (this.memoryComponents.characterManager) {
                try {
                    const characters = await this.memoryComponents.characterManager.getCharactersByType('MAIN');
                    for (const char of characters.slice(0, 3)) {
                        items.push({
                            key: `character_${char.id}`,
                            level: MemoryLevel.LONG_TERM,
                            priority: priorities.characters
                        });
                    }
                } catch (error) {
                    logger.warn('Failed to preload character info', { error });
                }
            }

            // 世界設定のプリロード
            items.push({
                key: 'worldSettings',
                level: MemoryLevel.LONG_TERM,
                priority: priorities.worldSettings
            });

            // 物語状態のプリロード
            for (let i = 0; i < preloadDepth; i++) {
                const targetChapter = chapterNumber + i;
                items.push({
                    key: `narrativeState_${targetChapter}`,
                    level: MemoryLevel.MID_TERM,
                    priority: priorities.narrativeState * (1 - i * 0.1)
                });
            }

            // 伏線情報のプリロード
            items.push({
                key: 'foreshadowing_unresolved',
                level: MemoryLevel.LONG_TERM,
                priority: priorities.foreshadowing
            });

        } catch (error) {
            logger.error('Failed to generate preload items', { error });
        }

        return items;
    }

    /**
     * プリロードを実行
     * @private
     */
    private async executePreload(item: { key: string; level: MemoryLevel; priority: number }): Promise<void> {
        try {
            logger.debug(`Executing preload for ${item.key} at level ${item.level}`);

            // キャッシュに既に存在する場合はスキップ
            const existing = await this.get(item.key, item.level);
            if (existing) {
                logger.debug(`Preload skipped for ${item.key} - already cached`);
                return;
            }

            // データの取得とキャッシュ
            const data = await this.fetchDataForPreload(item.key, item.level);
            if (data) {
                await this.coordinateCache(item.key, data, item.level);
                logger.debug(`Preload completed for ${item.key}`);
            }

        } catch (error) {
            logger.warn(`Preload failed for ${item.key}`, {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * プリロード用データ取得
     * @private
     */
    private async fetchDataForPreload(key: string, level: MemoryLevel): Promise<any> {
        try {
            // キーの種類に応じたデータ取得
            if (key === 'worldSettings' && this.memoryComponents.worldKnowledge) {
                return await this.memoryComponents.worldKnowledge.getWorldSettings();
            } else if (key.startsWith('character_') && this.memoryComponents.characterManager) {
                const characterId = key.replace('character_', '');
                return await this.memoryComponents.characterManager.getCharacter(characterId);
            } else if (key.startsWith('narrativeState_') && this.memoryComponents.narrativeMemory) {
                const chapterNumber = parseInt(key.replace('narrativeState_', ''));
                return await this.memoryComponents.narrativeMemory.getCurrentState(chapterNumber);
            } else if (key === 'foreshadowing_unresolved' && this.memoryComponents.worldKnowledge) {
                return await this.memoryComponents.worldKnowledge.getUnresolvedForeshadowing();
            }

            return null;

        } catch (error) {
            logger.warn(`Failed to fetch data for preload: ${key}`, { error });
            return null;
        }
    }

    /**
     * データサイズを計算
     * @private
     */
    private calculateDataSize(data: any): number {
        try {
            return JSON.stringify(data).length;
        } catch (error) {
            return 0;
        }
    }

    /**
     * キャッシュ容量を確保
     * @private
     */
    private async ensureCacheCapacity(level: MemoryLevel, requiredSize: number): Promise<void> {
        const cache = this.caches.get(level);
        if (!cache) return;

        const currentSize = this.calculateCacheSize(level);
        const maxSize = this.MAX_CACHE_SIZE[level] * 1024 * 1024; // MB to bytes

        if (currentSize + requiredSize > maxSize) {
            // LRU方式でエントリを削除
            await this.evictLeastRecentlyUsed(level, requiredSize);
        }
    }

    /**
     * キャッシュサイズを計算
     * @private
     */
    private calculateCacheSize(level: MemoryLevel): number {
        const cache = this.caches.get(level);
        if (!cache) return 0;

        let totalSize = 0;
        for (const entry of cache.values()) {
            totalSize += entry.metadata?.size || 0;
        }

        return totalSize;
    }

    /**
     * LRU方式でエントリを削除
     * @private
     */
    private async evictLeastRecentlyUsed(level: MemoryLevel, requiredSize: number): Promise<void> {
        const cache = this.caches.get(level);
        if (!cache) return;

        // アクセス時間でソート
        const entries = Array.from(cache.entries()).sort((a, b) =>
            a[1].lastAccessTime - b[1].lastAccessTime
        );

        let freedSize = 0;
        let evictedCount = 0;

        for (const [key, entry] of entries) {
            if (freedSize >= requiredSize) break;

            cache.delete(key);
            freedSize += entry.metadata?.size || 0;
            evictedCount++;
        }

        this.statistics.evictionCount += evictedCount;

        logger.debug(`Evicted ${evictedCount} entries from ${level} cache, freed ${freedSize} bytes`);
    }

    /**
     * 依存関係を解析
     * @private
     */
    private analyzeDependencies(cacheKey: string, data: any): string[] {
        const dependencies: string[] = [];

        try {
            // キーの種類に応じた依存関係の解析
            if (cacheKey.startsWith('character_')) {
                dependencies.push('worldSettings');
            } else if (cacheKey.startsWith('narrativeState_')) {
                dependencies.push('worldSettings', 'characterInfo');
            } else if (cacheKey === 'worldSettings') {
                // 世界設定は他の多くのキャッシュに影響
                dependencies.push('character_*', 'narrativeState_*');
            }

        } catch (error) {
            logger.warn('Failed to analyze dependencies', { error, cacheKey });
        }

        return dependencies;
    }

    /**
     * 依存関係のあるキーを検索
     * @private
     */
    private async findDependentKeys(cacheKey: string, level: MemoryLevel): Promise<string[]> {
        const dependentKeys: string[] = [];
        const cache = this.caches.get(level);
        if (!cache) return dependentKeys;

        for (const [key, entry] of cache.entries()) {
            if (entry.dependencies.includes(cacheKey) ||
                entry.dependencies.some(dep => dep.includes('*') && this.matchesPattern(cacheKey, dep))) {
                dependentKeys.push(key);
            }
        }

        return dependentKeys;
    }

    /**
     * パターンマッチング
     * @private
     */
    private matchesPattern(key: string, pattern: string): boolean {
        if (!pattern.includes('*')) return key === pattern;

        const regexPattern = pattern.replace(/\*/g, '.*');
        return new RegExp(`^${regexPattern}$`).test(key);
    }

    /**
     * 優先度を計算
     * @private
     */
    private calculatePriority(cacheKey: string, level: MemoryLevel): number {
        let priority = 0.5; // デフォルト

        // キーの種類による優先度調整
        if (cacheKey === 'worldSettings') priority = 0.9;
        else if (cacheKey.startsWith('character_')) priority = 0.8;
        else if (cacheKey.startsWith('narrativeState_')) priority = 0.7;
        else if (cacheKey.startsWith('foreshadowing_')) priority = 0.6;

        // レベルによる優先度調整
        if (level === MemoryLevel.LONG_TERM) priority += 0.1;
        else if (level === MemoryLevel.SHORT_TERM) priority -= 0.1;

        return Math.max(0, Math.min(1, priority));
    }

    /**
     * タグを生成
     * @private
     */
    private generateTags(cacheKey: string, data: any): string[] {
        const tags: string[] = [];

        try {
            // キーの種類に応じたタグ生成
            if (cacheKey.startsWith('character_')) {
                tags.push('character', 'entity');
            } else if (cacheKey.startsWith('narrativeState_')) {
                tags.push('narrative', 'state');
            } else if (cacheKey === 'worldSettings') {
                tags.push('world', 'settings', 'core');
            }

            // データの種類に応じたタグ追加
            if (data && typeof data === 'object') {
                if (data.genre) tags.push(`genre:${data.genre}`);
                if (data.type) tags.push(`type:${data.type}`);
            }

        } catch (error) {
            logger.warn('Failed to generate tags', { error, cacheKey });
        }

        return tags;
    }

    /**
     * 統計情報を更新
     * @private
     */
    private updateStatistics(): void {
        try {
            // 총 엔트리 수 계산
            let totalEntries = 0;
            const memoryUsage = {
                shortTerm: 0,
                midTerm: 0,
                longTerm: 0
            };

            for (const [level, cache] of this.caches.entries()) {
                totalEntries += cache.size;

                let levelSize = 0;
                for (const entry of cache.values()) {
                    levelSize += entry.metadata?.size || 0;
                }

                if (level === MemoryLevel.SHORT_TERM) {
                    memoryUsage.shortTerm = levelSize;
                } else if (level === MemoryLevel.MID_TERM) {
                    memoryUsage.midTerm = levelSize;
                } else if (level === MemoryLevel.LONG_TERM) {
                    memoryUsage.longTerm = levelSize;
                }
            }

            // 히트율 계산
            const totalAccesses = this.accessStats.hits + this.accessStats.misses;
            const hitRate = totalAccesses > 0 ? this.accessStats.hits / totalAccesses : 0;
            const missRate = totalAccesses > 0 ? this.accessStats.misses / totalAccesses : 0;

            // 평균 액세스 시간 계산
            const avgAccessTime = this.accessStats.accessCount > 0
                ? this.accessStats.totalAccessTime / this.accessStats.accessCount
                : 0;

            this.statistics = {
                totalEntries,
                hitRate,
                missRate,
                avgAccessTime,
                memoryUsage,
                evictionCount: this.statistics.evictionCount,
                lastCleanupTime: this.statistics.lastCleanupTime
            };

        } catch (error) {
            logger.warn('Failed to update statistics', { error });
        }
    }

    /**
     * キャッシュヒットを記録
     * @private
     */
    private recordHit(): void {
        this.accessStats.hits++;
    }

    /**
     * キャッシュミスを記録
     * @private
     */
    private recordMiss(): void {
        this.accessStats.misses++;
    }

    /**
     * 無効化イベントを処理
     * @private
     */
    private async processInvalidationEvents(): Promise<void> {
        try {
            const eventsToProcess = [...this.invalidationQueue];
            this.invalidationQueue = [];

            for (const event of eventsToProcess) {
                logger.debug(`Processing invalidation event: ${event.type} for ${event.affectedKeys.length} keys`);

                // 他のレベルにも影響を及ぼす可能성をチェック
                await this.propagateInvalidation(event);
            }

        } catch (error) {
            logger.warn('Failed to process invalidation events', { error });
        }
    }

    /**
     * 無効化を伝播
     * @private
     */
    private async propagateInvalidation(event: CacheInvalidationEvent): Promise<void> {
        try {
            const { affectedKeys, level, reason } = event;

            // 他のレベルでも同じキーを無効化
            for (const [otherLevel, cache] of this.caches.entries()) {
                if (otherLevel !== level) {
                    for (const key of affectedKeys) {
                        if (cache.has(key)) {
                            await this.invalidate(key, otherLevel, `Propagated from ${level}: ${reason}`);
                        }
                    }
                }
            }

        } catch (error) {
            logger.warn('Failed to propagate invalidation', { error });
        }
    }

    /**
     * 定期的なクリーンアップを実行
     * @private
     */
    private performCleanup(): void {
        try {
            logger.debug('Performing periodic cache cleanup');

            const now = Date.now();
            let totalCleaned = 0;

            // 각 레벨에서 만료된 엔트리 제거
            for (const [level, cache] of this.caches.entries()) {
                const keysToDelete: string[] = [];

                for (const [key, entry] of cache.entries()) {
                    if (now > entry.expiryTime) {
                        keysToDelete.push(key);
                    }
                }

                for (const key of keysToDelete) {
                    cache.delete(key);
                    totalCleaned++;
                }
            }

            this.statistics.lastCleanupTime = now;
            this.updateStatistics();

            logger.debug(`Cache cleanup completed: removed ${totalCleaned} expired entries`);

        } catch (error) {
            logger.error('Failed to perform cache cleanup', { error });
        }
    }
}