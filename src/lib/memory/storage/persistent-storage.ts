/**
 * @fileoverview 永続化ストレージ管理システム
 * @description
 * 統合記憶階層システムの永続化ストレージを管理するクラス。
 * 長期記憶データの永続化、データ整合性の確保、効率的なアクセスを提供します。
 */

import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { withTimeout } from '@/lib/utils/promise-utils';

/**
 * データ整合性チェック結果
 */
interface IntegrityCheckResult {
    valid: boolean;
    issues: string[];
    corruptedFiles: string[];
    suggestions: string[];
}

/**
 * 永続化ストレージ統計情報
 */
interface StorageStatistics {
    totalFiles: number;
    totalSize: number;
    lastUpdateTime: Date;
    dataIntegrityScore: number;
    avgAccessTime: number;
    errorCount: number;
}

/**
 * 永続化オプション
 */
interface PersistOptions {
    compress?: boolean;
    backup?: boolean;
    validateOnWrite?: boolean;
    retryOnFailure?: boolean;
    timeout?: number;
}

/**
 * データ検索オプション
 */
interface QueryOptions {
    pattern?: string;
    memoryType?: 'short-term' | 'mid-term' | 'long-term';
    limit?: number;
    sortBy?: 'date' | 'size' | 'name';
    includeMetadata?: boolean;
}

/**
 * ファイルメタデータ
 */
interface FileMetadata {
    path: string;
    size: number;
    createdAt: Date;
    updatedAt: Date;
    memoryType: 'short-term' | 'mid-term' | 'long-term';
    checksum?: string;
    compressionType?: 'none' | 'gzip' | 'lz4';
}

/**
 * @class PersistentStorage
 * @description
 * 統合記憶階層システムの永続化ストレージを管理するクラス。
 * 長期記憶データの永続化、整合性チェック、効率的なアクセスを提供します。
 */
export class PersistentStorage {
    private readonly STORAGE_PATHS = {
        SHORT_TERM: 'short-term',
        MID_TERM: 'mid-term', 
        LONG_TERM: 'long-term',
        METADATA: 'metadata',
        BACKUP: 'backup'
    };

    private fileMetadataCache: Map<string, FileMetadata> = new Map();
    private accessTimeCache: Map<string, number> = new Map();
    private initialized: boolean = false;
    private statistics: StorageStatistics = {
        totalFiles: 0,
        totalSize: 0,
        lastUpdateTime: new Date(),
        dataIntegrityScore: 1.0,
        avgAccessTime: 0,
        errorCount: 0
    };

    /**
     * コンストラクタ
     */
    constructor() {
        logger.info('PersistentStorage initializing...');
    }

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('PersistentStorage already initialized');
            return;
        }

        try {
            logger.info('Initializing PersistentStorage...');

            // ストレージディレクトリ構造の作成
            await this.createStorageStructure();

            // メタデータキャッシュの初期化
            await this.initializeMetadataCache();

            // 統計情報の初期化
            await this.initializeStatistics();

            this.initialized = true;
            logger.info('PersistentStorage initialized successfully');

        } catch (error) {
            logger.error('Failed to initialize PersistentStorage', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw new Error(`PersistentStorage initialization failed: ${error}`);
        }
    }

    /**
     * ストレージディレクトリ構造の作成
     * @private
     */
    private async createStorageStructure(): Promise<void> {
        try {
            const directories = [
                this.STORAGE_PATHS.SHORT_TERM,
                this.STORAGE_PATHS.MID_TERM,
                this.STORAGE_PATHS.LONG_TERM,
                this.STORAGE_PATHS.METADATA,
                this.STORAGE_PATHS.BACKUP,
                // サブディレクトリ
                `${this.STORAGE_PATHS.SHORT_TERM}/chapters`,
                `${this.STORAGE_PATHS.SHORT_TERM}/cache`,
                `${this.STORAGE_PATHS.SHORT_TERM}/processing`,
                `${this.STORAGE_PATHS.MID_TERM}/narrative`,
                `${this.STORAGE_PATHS.MID_TERM}/analysis`,
                `${this.STORAGE_PATHS.MID_TERM}/statistics`,
                `${this.STORAGE_PATHS.LONG_TERM}/settings`,
                `${this.STORAGE_PATHS.LONG_TERM}/knowledge`,
                `${this.STORAGE_PATHS.LONG_TERM}/completed`
            ];

            for (const dir of directories) {
                await storageProvider.createDirectory(dir);
            }

            logger.debug('Storage directory structure created');
        } catch (error) {
            logger.error('Failed to create storage structure', { error });
            throw error;
        }
    }

    /**
     * メタデータキャッシュの初期化
     * @private
     */
    private async initializeMetadataCache(): Promise<void> {
        try {
            const metadataPath = `${this.STORAGE_PATHS.METADATA}/file-metadata.json`;
            
            if (await storageProvider.fileExists(metadataPath)) {
                const content = await storageProvider.readFile(metadataPath);
                const metadataArray = JSON.parse(content) as Array<[string, FileMetadata]>;
                
                this.fileMetadataCache = new Map(metadataArray.map(([path, metadata]) => [
                    path,
                    {
                        ...metadata,
                        createdAt: new Date(metadata.createdAt),
                        updatedAt: new Date(metadata.updatedAt)
                    }
                ]));

                logger.debug(`Loaded ${this.fileMetadataCache.size} file metadata entries`);
            }
        } catch (error) {
            logger.warn('Failed to load metadata cache, starting fresh', { error });
            this.fileMetadataCache = new Map();
        }
    }

    /**
     * 統計情報の初期化
     * @private
     */
    private async initializeStatistics(): Promise<void> {
        try {
            const statsPath = `${this.STORAGE_PATHS.METADATA}/statistics.json`;
            
            if (await storageProvider.fileExists(statsPath)) {
                const content = await storageProvider.readFile(statsPath);
                const savedStats = JSON.parse(content);
                
                this.statistics = {
                    ...savedStats,
                    lastUpdateTime: new Date(savedStats.lastUpdateTime)
                };
            }

            // 現在の統計を更新
            await this.updateStatistics();
        } catch (error) {
            logger.warn('Failed to load statistics, using defaults', { error });
        }
    }

    /**
     * データを永続化する
     * @param path ファイルパス
     * @param data データ
     * @param memoryType 記憶タイプ
     * @param options 永続化オプション
     */
    async persistData(
        path: string,
        data: any,
        memoryType: 'short-term' | 'mid-term' | 'long-term',
        options: PersistOptions = {}
    ): Promise<void> {
        const startTime = Date.now();

        try {
            if (!this.initialized) {
                await this.initialize();
            }

            // フルパスの構築
            const fullPath = this.buildFullPath(path, memoryType);

            // データの準備
            let processedData = data;
            if (typeof data === 'object') {
                processedData = JSON.stringify(data, null, 2);
            }

            // 圧縮の適用
            if (options.compress) {
                processedData = await this.compressData(processedData);
            }

            // タイムアウト付きで書き込み実行
            const timeout = options.timeout || 10000;
            await withTimeout(
                storageProvider.writeFile(fullPath, processedData),
                timeout,
                `Data persistence timeout for ${fullPath}`
            );

            // メタデータの更新
            await this.updateFileMetadata(fullPath, processedData, memoryType, options);

            // バックアップの作成
            if (options.backup) {
                await this.createBackup(fullPath, processedData);
            }

            // 書き込み検証
            if (options.validateOnWrite) {
                await this.validateWrittenData(fullPath, processedData);
            }

            // アクセス時間の記録
            this.recordAccessTime(fullPath, Date.now() - startTime);

            logger.debug(`Successfully persisted data to ${fullPath}`, {
                size: processedData.length,
                memoryType,
                compressed: options.compress,
                duration: Date.now() - startTime
            });

        } catch (error) {
            this.statistics.errorCount++;
            logger.error(`Failed to persist data to ${path}`, {
                error: error instanceof Error ? error.message : String(error),
                memoryType,
                options
            });

            if (options.retryOnFailure) {
                logger.info(`Retrying data persistence for ${path}...`);
                await this.persistData(path, data, memoryType, { ...options, retryOnFailure: false });
            } else {
                throw error;
            }
        }
    }

    /**
     * データを読み込む
     * @param path ファイルパス
     * @param memoryType 記憶タイプ
     * @param parseJson JSONとしてパースするか
     */
    async loadData<T = any>(
        path: string,
        memoryType: 'short-term' | 'mid-term' | 'long-term',
        parseJson: boolean = true
    ): Promise<T | null> {
        const startTime = Date.now();

        try {
            if (!this.initialized) {
                await this.initialize();
            }

            const fullPath = this.buildFullPath(path, memoryType);

            // ファイル存在確認
            if (!await storageProvider.fileExists(fullPath)) {
                logger.debug(`File not found: ${fullPath}`);
                return null;
            }

            // データの読み込み
            let content = await storageProvider.readFile(fullPath);

            // 解凍の適用
            const metadata = this.fileMetadataCache.get(fullPath);
            if (metadata?.compressionType && metadata.compressionType !== 'none') {
                content = await this.decompressData(content, metadata.compressionType);
            }

            // JSONパース
            let result: T;
            if (parseJson) {
                result = JSON.parse(content) as T;
            } else {
                result = content as T;
            }

            // アクセス時間の記録
            this.recordAccessTime(fullPath, Date.now() - startTime);

            logger.debug(`Successfully loaded data from ${fullPath}`, {
                size: content.length,
                memoryType,
                duration: Date.now() - startTime
            });

            return result;

        } catch (error) {
            this.statistics.errorCount++;
            logger.error(`Failed to load data from ${path}`, {
                error: error instanceof Error ? error.message : String(error),
                memoryType
            });
            return null;
        }
    }

    /**
     * データを削除する
     * @param path ファイルパス
     * @param memoryType 記憶タイプ
     */
    async deleteData(
        path: string,
        memoryType: 'short-term' | 'mid-term' | 'long-term'
    ): Promise<boolean> {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            const fullPath = this.buildFullPath(path, memoryType);

            if (await storageProvider.fileExists(fullPath)) {
                await storageProvider.deleteFile(fullPath);
                
                // メタデータからも削除
                this.fileMetadataCache.delete(fullPath);
                this.accessTimeCache.delete(fullPath);

                logger.debug(`Successfully deleted data: ${fullPath}`);
                return true;
            }

            return false;
        } catch (error) {
            this.statistics.errorCount++;
            logger.error(`Failed to delete data: ${path}`, {
                error: error instanceof Error ? error.message : String(error),
                memoryType
            });
            return false;
        }
    }

    /**
     * データの検索
     * @param options 検索オプション
     */
    async queryData(options: QueryOptions = {}): Promise<Array<{
        path: string;
        metadata: FileMetadata;
        data?: any;
    }>> {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            let results = Array.from(this.fileMetadataCache.entries());

            // メモリタイプフィルタ
            if (options.memoryType) {
                results = results.filter(([_, metadata]) => 
                    metadata.memoryType === options.memoryType
                );
            }

            // パターンフィルタ
            if (options.pattern) {
                const regex = new RegExp(options.pattern, 'i');
                results = results.filter(([path]) => regex.test(path));
            }

            // ソート
            if (options.sortBy) {
                results.sort(([pathA, metadataA], [pathB, metadataB]) => {
                    switch (options.sortBy) {
                        case 'date':
                            return metadataB.updatedAt.getTime() - metadataA.updatedAt.getTime();
                        case 'size':
                            return metadataB.size - metadataA.size;
                        case 'name':
                            return pathA.localeCompare(pathB);
                        default:
                            return 0;
                    }
                });
            }

            // 制限
            if (options.limit) {
                results = results.slice(0, options.limit);
            }

            // データの読み込み（必要な場合）
            const queryResults = await Promise.all(
                results.map(async ([path, metadata]) => {
                    const result: any = {
                        path,
                        metadata
                    };

                    if (options.includeMetadata) {
                        const relativePath = this.extractRelativePath(path, metadata.memoryType);
                        const data = await this.loadData(relativePath, metadata.memoryType);
                        result.data = data;
                    }

                    return result;
                })
            );

            return queryResults;

        } catch (error) {
            logger.error('Failed to query data', {
                error: error instanceof Error ? error.message : String(error),
                options
            });
            return [];
        }
    }

    /**
     * データ整合性チェック
     */
    async checkDataIntegrity(): Promise<IntegrityCheckResult> {
        try {
            logger.info('Starting data integrity check...');

            const issues: string[] = [];
            const corruptedFiles: string[] = [];
            const suggestions: string[] = [];

            // 全ファイルのチェック
            let validFiles = 0;
            let totalFiles = 0;

            for (const [path, metadata] of this.fileMetadataCache.entries()) {
                totalFiles++;

                try {
                    // ファイル存在確認
                    if (!await storageProvider.fileExists(path)) {
                        issues.push(`Missing file: ${path}`);
                        corruptedFiles.push(path);
                        continue;
                    }

                    // ファイルサイズチェック
                    const content = await storageProvider.readFile(path);
                    if (content.length !== metadata.size) {
                        issues.push(`Size mismatch: ${path} (expected: ${metadata.size}, actual: ${content.length})`);
                        corruptedFiles.push(path);
                        continue;
                    }

                    // JSON検証（JSONファイルの場合）
                    if (path.endsWith('.json')) {
                        try {
                            JSON.parse(content);
                        } catch (jsonError) {
                            issues.push(`Invalid JSON: ${path}`);
                            corruptedFiles.push(path);
                            continue;
                        }
                    }

                    validFiles++;

                } catch (error) {
                    issues.push(`Check failed: ${path} - ${error}`);
                    corruptedFiles.push(path);
                }
            }

            // 統計の更新
            const integrityScore = totalFiles > 0 ? validFiles / totalFiles : 1.0;
            this.statistics.dataIntegrityScore = integrityScore;

            // 提案の生成
            if (corruptedFiles.length > 0) {
                suggestions.push('Run backup recovery for corrupted files');
                suggestions.push('Consider rebuilding metadata cache');
            }

            if (integrityScore < 0.9) {
                suggestions.push('Consider running full data migration');
            }

            const result: IntegrityCheckResult = {
                valid: issues.length === 0,
                issues,
                corruptedFiles,
                suggestions
            };

            logger.info(`Data integrity check completed`, {
                validFiles,
                totalFiles,
                integrityScore,
                issuesFound: issues.length
            });

            return result;

        } catch (error) {
            logger.error('Failed to check data integrity', {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                valid: false,
                issues: [`Integrity check failed: ${error}`],
                corruptedFiles: [],
                suggestions: ['Retry integrity check', 'Check storage system health']
            };
        }
    }

    /**
     * 統計情報の取得
     */
    async getStatistics(): Promise<StorageStatistics> {
        await this.updateStatistics();
        return { ...this.statistics };
    }

    /**
     * ストレージの最適化
     */
    async optimizeStorage(): Promise<{
        success: boolean;
        beforeSize: number;
        afterSize: number;
        filesOptimized: number;
        timeSaved: number;
    }> {
        try {
            logger.info('Starting storage optimization...');

            const beforeSize = this.statistics.totalSize;
            let filesOptimized = 0;
            let timeSaved = 0;

            // 古いファイルの圧縮
            for (const [path, metadata] of this.fileMetadataCache.entries()) {
                if (!metadata.compressionType || metadata.compressionType === 'none') {
                    const daysSinceUpdate = (Date.now() - metadata.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
                    
                    if (daysSinceUpdate > 7 && metadata.size > 1024) { // 1週間以上経過かつ1KB以上
                        const content = await storageProvider.readFile(path);
                        const compressed = await this.compressData(content);
                        
                        if (compressed.length < content.length * 0.8) { // 20%以上圧縮できる場合
                            await storageProvider.writeFile(path, compressed);
                            
                            // メタデータ更新
                            metadata.size = compressed.length;
                            metadata.compressionType = 'gzip';
                            metadata.updatedAt = new Date();
                            
                            filesOptimized++;
                            timeSaved += (content.length - compressed.length);
                        }
                    }
                }
            }

            // 統計更新
            await this.updateStatistics();
            const afterSize = this.statistics.totalSize;

            logger.info(`Storage optimization completed`, {
                filesOptimized,
                beforeSize,
                afterSize,
                sizeSaved: beforeSize - afterSize,
                timeSaved
            });

            return {
                success: true,
                beforeSize,
                afterSize,
                filesOptimized,
                timeSaved
            };

        } catch (error) {
            logger.error('Storage optimization failed', {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                success: false,
                beforeSize: 0,
                afterSize: 0,
                filesOptimized: 0,
                timeSaved: 0
            };
        }
    }

    /**
     * メタデータキャッシュの保存
     */
    async saveMetadataCache(): Promise<void> {
        try {
            const metadataPath = `${this.STORAGE_PATHS.METADATA}/file-metadata.json`;
            const metadataArray = Array.from(this.fileMetadataCache.entries());
            
            await storageProvider.writeFile(
                metadataPath, 
                JSON.stringify(metadataArray, null, 2)
            );

            // 統計情報も保存
            const statsPath = `${this.STORAGE_PATHS.METADATA}/statistics.json`;
            await storageProvider.writeFile(
                statsPath,
                JSON.stringify(this.statistics, null, 2)
            );

            logger.debug('Metadata cache saved successfully');
        } catch (error) {
            logger.error('Failed to save metadata cache', { error });
        }
    }

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

    /**
     * フルパスの構築
     * @private
     */
    private buildFullPath(path: string, memoryType: 'short-term' | 'mid-term' | 'long-term'): string {
        const basePath = this.STORAGE_PATHS[memoryType.toUpperCase().replace('-', '_') as keyof typeof this.STORAGE_PATHS];
        return `${basePath}/${path}`;
    }

    /**
     * 相対パスの抽出
     * @private
     */
    private extractRelativePath(fullPath: string, memoryType: 'short-term' | 'mid-term' | 'long-term'): string {
        const basePath = this.STORAGE_PATHS[memoryType.toUpperCase().replace('-', '_') as keyof typeof this.STORAGE_PATHS];
        return fullPath.replace(`${basePath}/`, '');
    }

    /**
     * ファイルメタデータの更新
     * @private
     */
    private async updateFileMetadata(
        fullPath: string,
        data: string,
        memoryType: 'short-term' | 'mid-term' | 'long-term',
        options: PersistOptions
    ): Promise<void> {
        const now = new Date();
        const existing = this.fileMetadataCache.get(fullPath);

        const metadata: FileMetadata = {
            path: fullPath,
            size: data.length,
            createdAt: existing?.createdAt || now,
            updatedAt: now,
            memoryType,
            compressionType: options.compress ? 'gzip' : 'none'
        };

        this.fileMetadataCache.set(fullPath, metadata);
    }

    /**
     * バックアップの作成
     * @private
     */
    private async createBackup(fullPath: string, data: string): Promise<void> {
        try {
            const backupPath = `${this.STORAGE_PATHS.BACKUP}/${Date.now()}-${fullPath.replace(/\//g, '_')}`;
            await storageProvider.writeFile(backupPath, data);
            logger.debug(`Backup created: ${backupPath}`);
        } catch (error) {
            logger.warn(`Failed to create backup for ${fullPath}`, { error });
        }
    }

    /**
     * 書き込み検証
     * @private
     */
    private async validateWrittenData(fullPath: string, originalData: string): Promise<void> {
        try {
            const writtenData = await storageProvider.readFile(fullPath);
            if (writtenData !== originalData) {
                throw new Error('Data verification failed: written data does not match original');
            }
        } catch (error) {
            logger.error(`Data validation failed for ${fullPath}`, { error });
            throw error;
        }
    }

    /**
     * データ圧縮
     * @private
     */
    private async compressData(data: string): Promise<string> {
        // 簡易的な圧縮実装（実際の実装ではgzipやlz4を使用）
        try {
            // ここでは例として、繰り返し文字列の圧縮を実装
            return data.replace(/(\s+)/g, ' ').trim();
        } catch (error) {
            logger.warn('Data compression failed, using original data', { error });
            return data;
        }
    }

    /**
     * データ解凍
     * @private
     */
    private async decompressData(data: string, compressionType: string): Promise<string> {
        // 簡易的な解凍実装
        try {
            // 実際の実装では圧縮タイプに応じた解凍を行う
            return data;
        } catch (error) {
            logger.warn('Data decompression failed, using compressed data', { error });
            return data;
        }
    }

    /**
     * アクセス時間の記録
     * @private
     */
    private recordAccessTime(path: string, accessTime: number): void {
        this.accessTimeCache.set(path, accessTime);
        
        // 平均アクセス時間の更新
        const allTimes = Array.from(this.accessTimeCache.values());
        this.statistics.avgAccessTime = allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length;
    }

    /**
     * 統計情報の更新
     * @private
     */
    private async updateStatistics(): Promise<void> {
        try {
            this.statistics.totalFiles = this.fileMetadataCache.size;
            this.statistics.totalSize = Array.from(this.fileMetadataCache.values())
                .reduce((sum, metadata) => sum + metadata.size, 0);
            this.statistics.lastUpdateTime = new Date();
        } catch (error) {
            logger.warn('Failed to update statistics', { error });
        }
    }
}

// シングルトンインスタンスをエクスポート
export const persistentStorage = new PersistentStorage();