/**
 * @fileoverview キャッシュストレージ管理システム
 * @description
 * 統合記憶階層システムの短期記憶キャッシュを管理するクラス。
 * 高速アクセス、TTL管理、LRUアルゴリズムによる効率的なキャッシュ管理を提供します。
 */

import { logger } from '@/lib/utils/logger';

/**
 * キャッシュエントリー
 */
interface CacheEntry<T = any> {
    key: string;
    value: T;
    createdAt: Date;
    lastAccessedAt: Date;
    expiresAt?: Date;
    accessCount: number;
    size: number;
    tags: string[];
    priority: number;
}

/**
 * キャッシュ統計情報
 */
interface CacheStatistics {
    totalEntries: number;
    totalSize: number;
    hitCount: number;
    missCount: number;
    hitRate: number;
    avgAccessTime: number;
    oldestEntry?: Date;
    newestEntry?: Date;
    memoryUsage: number;
}

/**
 * キャッシュオプション
 */
interface CacheOptions {
    ttl?: number; // Time To Live (ms)
    priority?: number; // 優先度 (1-10)
    tags?: string[]; // タグ
    compress?: boolean; // 圧縮するか
    persistent?: boolean; // 永続化するか
}

/**
 * キャッシュクエリオプション
 */
interface CacheQueryOptions {
    tags?: string[];
    minPriority?: number;
    maxAge?: number;
    pattern?: string;
    limit?: number;
}

/**
 * キャッシュ最適化結果
 */
interface OptimizationResult {
    entriesRemoved: number;
    memoryFreed: number;
    timeSpent: number;
    strategy: string;
}

/**
 * @class CacheStorage
 * @description
 * 統合記憶階層システムの短期記憶キャッシュを管理するクラス。
 * LRUアルゴリズム、TTL管理、優先度ベースの削除を実装します。
 */
export class CacheStorage {
    private cache: Map<string, CacheEntry> = new Map();
    private accessOrder: Map<string, number> = new Map(); // LRU管理用
    private sizeLimit: number = 100 * 1024 * 1024; // 100MB
    private entryLimit: number = 10000; // 最大エントリー数
    private currentSize: number = 0;
    private accessCounter: number = 0;
    private statistics: CacheStatistics = {
        totalEntries: 0,
        totalSize: 0,
        hitCount: 0,
        missCount: 0,
        hitRate: 0,
        avgAccessTime: 0,
        memoryUsage: 0
    };
    private cleanupInterval: NodeJS.Timeout | null = null;
    private initialized: boolean = false;

    // キャッシュ戦略設定
    private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30分
    private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5分
    private readonly MAX_ACCESS_TIME_SAMPLES = 1000;
    private accessTimeSamples: number[] = [];

    /**
     * コンストラクタ
     * @param options 初期化オプション
     */
    constructor(options?: {
        sizeLimit?: number;
        entryLimit?: number;
        cleanupInterval?: number;
    }) {
        if (options?.sizeLimit) this.sizeLimit = options.sizeLimit;
        if (options?.entryLimit) this.entryLimit = options.entryLimit;
        if (options?.cleanupInterval) {
            this.CLEANUP_INTERVAL = options.cleanupInterval;
        }

        logger.info('CacheStorage initializing...', {
            sizeLimit: this.sizeLimit,
            entryLimit: this.entryLimit,
            cleanupInterval: this.CLEANUP_INTERVAL
        });
    }

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('CacheStorage already initialized');
            return;
        }

        try {
            logger.info('Initializing CacheStorage...');

            // 定期クリーンアップの開始
            this.startPeriodicCleanup();

            // 統計情報の初期化
            this.updateStatistics();

            this.initialized = true;
            logger.info('CacheStorage initialized successfully');

        } catch (error) {
            logger.error('Failed to initialize CacheStorage', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw new Error(`CacheStorage initialization failed: ${error}`);
        }
    }

    /**
     * キャッシュにデータを設定
     * @param key キー
     * @param value 値
     * @param options キャッシュオプション
     */
    async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
        const startTime = Date.now();

        try {
            if (!this.initialized) {
                await this.initialize();
            }

            // 既存エントリーの削除（サイズ計算のため）
            if (this.cache.has(key)) {
                const existingEntry = this.cache.get(key)!;
                this.currentSize -= existingEntry.size;
            }

            // 新しいエントリーの作成
            const now = new Date();
            const serializedValue = JSON.stringify(value);
            const size = this.calculateSize(serializedValue);

            const entry: CacheEntry<T> = {
                key,
                value,
                createdAt: now,
                lastAccessedAt: now,
                expiresAt: options.ttl ? new Date(now.getTime() + options.ttl) :
                    new Date(now.getTime() + this.DEFAULT_TTL),
                accessCount: 0,
                size,
                tags: options.tags || [],
                priority: options.priority || 5
            };

            // 容量チェックと最適化
            await this.ensureCapacity(size);

            // キャッシュに追加
            this.cache.set(key, entry);
            this.currentSize += size;
            this.accessOrder.set(key, ++this.accessCounter);

            // 統計更新
            this.updateStatistics();
            this.recordAccessTime(Date.now() - startTime);

            logger.debug(`Cache set: ${key}`, {
                size,
                ttl: options.ttl,
                priority: entry.priority,
                tags: entry.tags
            });

        } catch (error) {
            logger.error(`Failed to set cache entry: ${key}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * キャッシュからデータを取得
     * @param key キー
     */
    async get<T>(key: string): Promise<T | null> {
        const startTime = Date.now();

        try {
            if (!this.initialized) {
                await this.initialize();
            }

            const entry = this.cache.get(key) as CacheEntry<T> | undefined;

            if (!entry) {
                this.statistics.missCount++;
                this.updateStatistics();
                return null;
            }

            // 有効期限チェック
            if (entry.expiresAt && entry.expiresAt < new Date()) {
                await this.delete(key);
                this.statistics.missCount++;
                this.updateStatistics();
                return null;
            }

            // アクセス情報の更新
            entry.lastAccessedAt = new Date();
            entry.accessCount++;
            this.accessOrder.set(key, ++this.accessCounter);

            // 統計更新
            this.statistics.hitCount++;
            this.updateStatistics();
            this.recordAccessTime(Date.now() - startTime);

            logger.debug(`Cache hit: ${key}`, {
                accessCount: entry.accessCount,
                age: Date.now() - entry.createdAt.getTime()
            });

            return entry.value;

        } catch (error) {
            logger.error(`Failed to get cache entry: ${key}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return null;
        }
    }

    /**
     * キャッシュエントリーを削除
     * @param key キー
     */
    async delete(key: string): Promise<boolean> {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            const entry = this.cache.get(key);
            if (!entry) {
                return false;
            }

            this.cache.delete(key);
            this.accessOrder.delete(key);
            this.currentSize -= entry.size;

            this.updateStatistics();

            logger.debug(`Cache deleted: ${key}`, {
                size: entry.size
            });

            return true;

        } catch (error) {
            logger.error(`Failed to delete cache entry: ${key}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * キャッシュが存在するかチェック
     * @param key キー
     */
    async has(key: string): Promise<boolean> {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            const entry = this.cache.get(key);
            if (!entry) {
                return false;
            }

            // 有効期限チェック
            if (entry.expiresAt && entry.expiresAt < new Date()) {
                await this.delete(key);
                return false;
            }

            return true;

        } catch (error) {
            logger.error(`Failed to check cache entry: ${key}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * タグでキャッシュを検索
     * @param options クエリオプション
     */
    async query(options: CacheQueryOptions = {}): Promise<Array<{
        key: string;
        value: any;
        metadata: Omit<CacheEntry, 'value'>;
    }>> {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            let results = Array.from(this.cache.entries());

            // タグフィルタ
            if (options.tags && options.tags.length > 0) {
                results = results.filter(([_, entry]) =>
                    options.tags!.some(tag => entry.tags.includes(tag))
                );
            }

            // 優先度フィルタ
            if (options.minPriority !== undefined) {
                results = results.filter(([_, entry]) => entry.priority >= options.minPriority!);
            }

            // 年齢フィルタ
            if (options.maxAge !== undefined) {
                const cutoffTime = Date.now() - options.maxAge;
                results = results.filter(([_, entry]) =>
                    entry.createdAt.getTime() >= cutoffTime
                );
            }

            // パターンフィルタ
            if (options.pattern) {
                const regex = new RegExp(options.pattern, 'i');
                results = results.filter(([key]) => regex.test(key));
            }

            // 制限
            if (options.limit) {
                results = results.slice(0, options.limit);
            }

            return results.map(([key, entry]) => ({
                key,
                value: entry.value,
                metadata: {
                    key: entry.key,
                    createdAt: entry.createdAt,
                    lastAccessedAt: entry.lastAccessedAt,
                    expiresAt: entry.expiresAt,
                    accessCount: entry.accessCount,
                    size: entry.size,
                    tags: entry.tags,
                    priority: entry.priority
                }
            }));

        } catch (error) {
            logger.error('Failed to query cache', {
                error: error instanceof Error ? error.message : String(error),
                options
            });
            return [];
        }
    }

    /**
     * タグでキャッシュを削除
     * @param tags タグ配列
     */
    async deleteByTags(tags: string[]): Promise<number> {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            let deletedCount = 0;
            const keysToDelete: string[] = [];

            for (const [key, entry] of this.cache.entries()) {
                if (tags.some(tag => entry.tags.includes(tag))) {
                    keysToDelete.push(key);
                }
            }

            for (const key of keysToDelete) {
                if (await this.delete(key)) {
                    deletedCount++;
                }
            }

            logger.info(`Deleted ${deletedCount} cache entries by tags`, { tags });
            return deletedCount;

        } catch (error) {
            logger.error('Failed to delete cache entries by tags', {
                error: error instanceof Error ? error.message : String(error),
                tags
            });
            return 0;
        }
    }

    /**
     * キャッシュをクリア
     */
    async clear(): Promise<void> {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            const entriesCount = this.cache.size;
            const sizeCleared = this.currentSize;

            this.cache.clear();
            this.accessOrder.clear();
            this.currentSize = 0;

            this.updateStatistics();

            logger.info(`Cache cleared`, {
                entriesCleared: entriesCount,
                memoryFreed: sizeCleared
            });

        } catch (error) {
            logger.error('Failed to clear cache', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 期限切れエントリーのクリーンアップ
     */
    async cleanup(): Promise<OptimizationResult> {
        const startTime = Date.now();
        let entriesRemoved = 0;
        let memoryFreed = 0;

        try {
            if (!this.initialized) {
                await this.initialize();
            }

            const now = new Date();
            const keysToDelete: string[] = [];

            // 期限切れエントリーの特定
            for (const [key, entry] of this.cache.entries()) {
                if (entry.expiresAt && entry.expiresAt < now) {
                    keysToDelete.push(key);
                    memoryFreed += entry.size;
                }
            }

            // 削除実行
            for (const key of keysToDelete) {
                if (await this.delete(key)) {
                    entriesRemoved++;
                }
            }

            const result: OptimizationResult = {
                entriesRemoved,
                memoryFreed,
                timeSpent: Date.now() - startTime,
                strategy: 'TTL_CLEANUP'
            };

            if (entriesRemoved > 0) {
                logger.info(`Cache cleanup completed`, {
                    entriesRemoved: result.entriesRemoved,
                    memoryFreed: result.memoryFreed,
                    timeSpent: result.timeSpent,
                    strategy: result.strategy
                });
            }

            return result;

        } catch (error) {
            logger.error('Failed to cleanup cache', {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                entriesRemoved,
                memoryFreed,
                timeSpent: Date.now() - startTime,
                strategy: 'TTL_CLEANUP_FAILED'
            };
        }
    }

    /**
     * LRU最適化
     */
    async optimizeLRU(): Promise<OptimizationResult> {
        const startTime = Date.now();
        let entriesRemoved = 0;
        let memoryFreed = 0;

        try {
            if (!this.initialized) {
                await this.initialize();
            }

            // エントリー数が制限を超えている場合
            if (this.cache.size <= this.entryLimit) {
                return {
                    entriesRemoved: 0,
                    memoryFreed: 0,
                    timeSpent: Date.now() - startTime,
                    strategy: 'LRU_NOT_NEEDED'
                };
            }

            // アクセス順でソート（古いものから削除）
            const sortedEntries = Array.from(this.accessOrder.entries())
                .sort(([, orderA], [, orderB]) => orderA - orderB);

            const entriesToRemove = this.cache.size - this.entryLimit;

            for (let i = 0; i < entriesToRemove && i < sortedEntries.length; i++) {
                const [key] = sortedEntries[i];
                const entry = this.cache.get(key);

                if (entry) {
                    memoryFreed += entry.size;
                    if (await this.delete(key)) {
                        entriesRemoved++;
                    }
                }
            }

            const result: OptimizationResult = {
                entriesRemoved,
                memoryFreed,
                timeSpent: Date.now() - startTime,
                strategy: 'LRU_OPTIMIZATION'
            };

            logger.info(`LRU optimization completed`, {
                entriesRemoved: result.entriesRemoved,
                memoryFreed: result.memoryFreed,
                timeSpent: result.timeSpent,
                strategy: result.strategy
            });
            return result;

        } catch (error) {
            logger.error('Failed to optimize LRU cache', {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                entriesRemoved,
                memoryFreed,
                timeSpent: Date.now() - startTime,
                strategy: 'LRU_OPTIMIZATION_FAILED'
            };
        }
    }

    /**
     * 統計情報の取得
     */
    async getStatistics(): Promise<CacheStatistics> {
        this.updateStatistics();
        return { ...this.statistics };
    }

    /**
     * キャッシュの最適化（全戦略実行）
     */
    async optimize(): Promise<{
        success: boolean;
        results: OptimizationResult[];
        totalEntriesRemoved: number;
        totalMemoryFreed: number;
    }> {
        try {
            logger.info('Starting comprehensive cache optimization...');

            const results: OptimizationResult[] = [];

            // 1. TTLクリーンアップ
            const cleanupResult = await this.cleanup();
            results.push(cleanupResult);

            // 2. LRU最適化
            const lruResult = await this.optimizeLRU();
            results.push(lruResult);

            // 3. サイズベース最適化
            const sizeResult = await this.optimizeBySize();
            results.push(sizeResult);

            const totalEntriesRemoved = results.reduce((sum, r) => sum + r.entriesRemoved, 0);
            const totalMemoryFreed = results.reduce((sum, r) => sum + r.memoryFreed, 0);

            logger.info('Cache optimization completed', {
                totalEntriesRemoved,
                totalMemoryFreed,
                strategies: results.length
            });

            return {
                success: true,
                results,
                totalEntriesRemoved,
                totalMemoryFreed
            };

        } catch (error) {
            logger.error('Cache optimization failed', {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                success: false,
                results: [],
                totalEntriesRemoved: 0,
                totalMemoryFreed: 0
            };
        }
    }

    /**
     * シャットダウン処理
     */
    async shutdown(): Promise<void> {
        try {
            logger.info('Shutting down CacheStorage...');

            // 定期クリーンアップの停止
            if (this.cleanupInterval) {
                clearInterval(this.cleanupInterval);
                this.cleanupInterval = null;
            }

            // 最終クリーンアップ
            await this.cleanup();

            // キャッシュクリア
            await this.clear();

            this.initialized = false;
            logger.info('CacheStorage shutdown completed');

        } catch (error) {
            logger.error('Failed to shutdown CacheStorage', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

    /**
     * 定期クリーンアップの開始
     * @private
     */
    private startPeriodicCleanup(): void {
        this.cleanupInterval = setInterval(async () => {
            try {
                await this.cleanup();
            } catch (error) {
                logger.error('Periodic cleanup failed', { error });
            }
        }, this.CLEANUP_INTERVAL);

        logger.debug('Periodic cleanup started', {
            interval: this.CLEANUP_INTERVAL
        });
    }

    /**
     * 容量確保
     * @private
     */
    private async ensureCapacity(requiredSize: number): Promise<void> {
        if (this.currentSize + requiredSize <= this.sizeLimit) {
            return;
        }

        logger.debug('Ensuring cache capacity', {
            currentSize: this.currentSize,
            requiredSize,
            sizeLimit: this.sizeLimit
        });

        // LRU最適化を実行
        await this.optimizeLRU();

        // まだ容量が足りない場合は追加最適化
        if (this.currentSize + requiredSize > this.sizeLimit) {
            await this.optimizeBySize();
        }
    }

    /**
     * サイズベース最適化
     * @private
     */
    private async optimizeBySize(): Promise<OptimizationResult> {
        const startTime = Date.now();
        let entriesRemoved = 0;
        let memoryFreed = 0;

        try {
            // 低優先度かつ大きいサイズのエントリーを削除
            const entries = Array.from(this.cache.entries())
                .sort(([, a], [, b]) => {
                    // 優先度が低く、サイズが大きいものを先に削除
                    const scoreA = a.size / a.priority;
                    const scoreB = b.size / b.priority;
                    return scoreB - scoreA;
                });

            const targetSize = this.sizeLimit * 0.8; // 80%まで削減

            for (const [key, entry] of entries) {
                if (this.currentSize <= targetSize) break;

                memoryFreed += entry.size;
                if (await this.delete(key)) {
                    entriesRemoved++;
                }
            }

            return {
                entriesRemoved,
                memoryFreed,
                timeSpent: Date.now() - startTime,
                strategy: 'SIZE_OPTIMIZATION'
            };

        } catch (error) {
            logger.error('Size optimization failed', { error });
            return {
                entriesRemoved,
                memoryFreed,
                timeSpent: Date.now() - startTime,
                strategy: 'SIZE_OPTIMIZATION_FAILED'
            };
        }
    }

    /**
     * サイズ計算
     * @private
     */
    private calculateSize(data: string): number {
        // 文字列のバイト数を概算
        return new Blob([data]).size;
    }

    /**
     * 統計情報の更新
     * @private
     */
    private updateStatistics(): void {
        this.statistics.totalEntries = this.cache.size;
        this.statistics.totalSize = this.currentSize;
        this.statistics.hitRate = this.statistics.hitCount + this.statistics.missCount > 0 ?
            this.statistics.hitCount / (this.statistics.hitCount + this.statistics.missCount) : 0;
        this.statistics.memoryUsage = this.currentSize / this.sizeLimit;

        // 最古・最新エントリーの更新
        if (this.cache.size > 0) {
            const entries = Array.from(this.cache.values());
            const sortedByCreation = entries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            this.statistics.oldestEntry = sortedByCreation[0].createdAt;
            this.statistics.newestEntry = sortedByCreation[sortedByCreation.length - 1].createdAt;
        }
    }

    /**
     * アクセス時間の記録
     * @private
     */
    private recordAccessTime(accessTime: number): void {
        this.accessTimeSamples.push(accessTime);

        // サンプル数を制限
        if (this.accessTimeSamples.length > this.MAX_ACCESS_TIME_SAMPLES) {
            this.accessTimeSamples = this.accessTimeSamples.slice(-this.MAX_ACCESS_TIME_SAMPLES);
        }

        // 平均アクセス時間を計算
        this.statistics.avgAccessTime = this.accessTimeSamples.reduce((sum, time) => sum + time, 0) /
            this.accessTimeSamples.length;
    }
}

// シングルトンインスタンスをエクスポート
export const cacheStorage = new CacheStorage();