/**
 * @fileoverview バックアップシステム
 * @description
 * 統合記憶階層システムの包括的バックアップ・復旧システム。
 * 定期バックアップ、差分バックアップ、データ復旧、バージョン管理を提供します。
 */

import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { withTimeout } from '@/lib/utils/promise-utils';

/**
 * バックアップタイプ
 */
type BackupType = 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL' | 'MANUAL';

/**
 * バックアップ状態
 */
type BackupStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'RESTORED';

/**
 * バックアップメタデータ
 */
interface BackupMetadata {
    id: string;
    type: BackupType;
    status: BackupStatus;
    createdAt: Date;
    completedAt?: Date;
    size: number;
    fileCount: number;
    checksum: string;
    version: string;
    description?: string;
    baseBackupId?: string; // 増分バックアップのベース
    error?: string;
    memoryComponents: string[];
}

/**
 * バックアップ構成
 */
interface BackupConfig {
    enabled: boolean;
    schedule: {
        fullBackupInterval: number; // フルバックアップ間隔（ms）
        incrementalInterval: number; // 増分バックアップ間隔（ms）
        maxBackupCount: number; // 保持する最大バックアップ数
        retentionDays: number; // 保持期間（日）
    };
    compression: {
        enabled: boolean;
        level: number; // 圧縮レベル（1-9）
    };
    encryption: {
        enabled: boolean;
        algorithm: string;
    };
    verification: {
        enabled: boolean;
        checksumAlgorithm: string;
    };
}

/**
 * 復旧オプション
 */
interface RestoreOptions {
    backupId: string;
    components?: string[]; // 特定コンポーネントのみ復旧
    dryRun?: boolean; // テスト実行
    overwrite?: boolean; // 既存データの上書き
    validateBeforeRestore?: boolean; // 復旧前の検証
}

/**
 * 復旧結果
 */
interface RestoreResult {
    success: boolean;
    backupId: string;
    restoredComponents: string[];
    failedComponents: string[];
    filesRestored: number;
    errors: string[];
    timeTaken: number;
}

/**
 * バックアップスケジュール情報
 */
interface ScheduleInfo {
    nextFullBackup: Date;
    nextIncrementalBackup: Date;
    lastFullBackup?: Date;
    lastIncrementalBackup?: Date;
    isRunning: boolean;
}

/**
 * @class BackupSystem
 * @description
 * 統合記憶階層システムの包括的バックアップシステム。
 * 自動スケジュール、差分バックアップ、データ復旧機能を提供します。
 */
export class BackupSystem {
    private readonly BACKUP_BASE_PATH = 'backups';
    private readonly METADATA_FILE = 'backup-metadata.json';
    private readonly CONFIG_FILE = 'backup-config.json';
    
    private config: BackupConfig = {
        enabled: true,
        schedule: {
            fullBackupInterval: 24 * 60 * 60 * 1000, // 24時間
            incrementalInterval: 60 * 60 * 1000, // 1時間
            maxBackupCount: 30,
            retentionDays: 30
        },
        compression: {
            enabled: true,
            level: 6
        },
        encryption: {
            enabled: false,
            algorithm: 'AES-256'
        },
        verification: {
            enabled: true,
            checksumAlgorithm: 'SHA-256'
        }
    };

    private backupMetadata: Map<string, BackupMetadata> = new Map();
    private scheduleIntervals: Map<string, NodeJS.Timeout> = new Map();
    private currentBackupOperation: string | null = null;
    private initialized: boolean = false;

    // 記憶階層コンポーネントのパス定義
    private readonly MEMORY_COMPONENTS = {
        'immediate-context': [
            'immediate-context/metadata.json',
            'chapters/'
        ],
        'narrative-memory': [
            'narrative-memory/summaries.json',
            'narrative-memory/characters.json',
            'narrative-memory/emotional-dynamics.json',
            'narrative-memory/state.json',
            'narrative-memory/turning-points.json',
            'narrative-memory/world-context.json'
        ],
        'world-knowledge': [
            'world-knowledge/current.json'
        ],
        'event-memory': [
            'memory/significant-events.json'
        ],
        'character-data': [
            'characters/character-database.json',
            'characters/main/',
            'characters/sub-characters/',
            'characters/mob-characters/'
        ]
    };

    /**
     * コンストラクタ
     */
    constructor() {
        logger.info('BackupSystem initializing...');
    }

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('BackupSystem already initialized');
            return;
        }

        try {
            logger.info('Initializing BackupSystem...');

            // バックアップディレクトリの作成
            await this.createBackupStructure();

            // 設定とメタデータの読み込み
            await this.loadConfig();
            await this.loadBackupMetadata();

            // スケジュールの開始
            if (this.config.enabled) {
                await this.startScheduler();
            }

            // 古いバックアップのクリーンアップ
            await this.cleanupOldBackups();

            this.initialized = true;
            logger.info('BackupSystem initialized successfully');

        } catch (error) {
            logger.error('Failed to initialize BackupSystem', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw new Error(`BackupSystem initialization failed: ${error}`);
        }
    }

    /**
     * フルバックアップの実行
     * @param description バックアップの説明
     */
    async createFullBackup(description?: string): Promise<string> {
        const backupId = this.generateBackupId('FULL');
        
        try {
            logger.info(`Starting full backup: ${backupId}`);

            if (this.currentBackupOperation) {
                throw new Error('Another backup operation is already running');
            }

            this.currentBackupOperation = backupId;

            const metadata: BackupMetadata = {
                id: backupId,
                type: 'FULL',
                status: 'RUNNING',
                createdAt: new Date(),
                size: 0,
                fileCount: 0,
                checksum: '',
                version: await this.getSystemVersion(),
                description,
                memoryComponents: Object.keys(this.MEMORY_COMPONENTS)
            };

            this.backupMetadata.set(backupId, metadata);

            // バックアップの実行
            const backupPath = `${this.BACKUP_BASE_PATH}/${backupId}`;
            await storageProvider.createDirectory(backupPath);

            let totalSize = 0;
            let totalFiles = 0;

            // 各メモリコンポーネントのバックアップ
            for (const [componentName, paths] of Object.entries(this.MEMORY_COMPONENTS)) {
                const componentBackupPath = `${backupPath}/${componentName}`;
                await storageProvider.createDirectory(componentBackupPath);

                const componentResult = await this.backupComponent(componentName, paths, componentBackupPath);
                totalSize += componentResult.size;
                totalFiles += componentResult.fileCount;
            }

            // システムメタデータのバックアップ
            const metadataResult = await this.backupSystemMetadata(backupPath);
            totalSize += metadataResult.size;
            totalFiles += metadataResult.fileCount;

            // チェックサムの生成
            const checksum = await this.generateBackupChecksum(backupPath);

            // メタデータの更新
            metadata.status = 'COMPLETED';
            metadata.completedAt = new Date();
            metadata.size = totalSize;
            metadata.fileCount = totalFiles;
            metadata.checksum = checksum;

            this.backupMetadata.set(backupId, metadata);
            await this.saveBackupMetadata();

            logger.info(`Full backup completed: ${backupId}`, {
                size: totalSize,
                fileCount: totalFiles,
                duration: Date.now() - metadata.createdAt.getTime()
            });

            return backupId;

        } catch (error) {
            logger.error(`Full backup failed: ${backupId}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー状態の更新
            const metadata = this.backupMetadata.get(backupId);
            if (metadata) {
                metadata.status = 'FAILED';
                metadata.error = error instanceof Error ? error.message : String(error);
                metadata.completedAt = new Date();
                this.backupMetadata.set(backupId, metadata);
                await this.saveBackupMetadata();
            }

            throw error;
        } finally {
            this.currentBackupOperation = null;
        }
    }

    /**
     * 増分バックアップの実行
     * @param baseBackupId ベースバックアップID
     * @param description バックアップの説明
     */
    async createIncrementalBackup(baseBackupId?: string, description?: string): Promise<string> {
        const backupId = this.generateBackupId('INCREMENTAL');

        try {
            logger.info(`Starting incremental backup: ${backupId}`);

            if (this.currentBackupOperation) {
                throw new Error('Another backup operation is already running');
            }

            // ベースバックアップの特定
            const baseBackup = baseBackupId ? 
                this.backupMetadata.get(baseBackupId) : 
                this.findLatestFullBackup();

            if (!baseBackup) {
                throw new Error('No base backup found for incremental backup');
            }

            this.currentBackupOperation = backupId;

            const metadata: BackupMetadata = {
                id: backupId,
                type: 'INCREMENTAL',
                status: 'RUNNING',
                createdAt: new Date(),
                size: 0,
                fileCount: 0,
                checksum: '',
                version: await this.getSystemVersion(),
                description,
                baseBackupId: baseBackup.id,
                memoryComponents: Object.keys(this.MEMORY_COMPONENTS)
            };

            this.backupMetadata.set(backupId, metadata);

            // 増分バックアップの実行
            const backupPath = `${this.BACKUP_BASE_PATH}/${backupId}`;
            await storageProvider.createDirectory(backupPath);

            let totalSize = 0;
            let totalFiles = 0;

            // 変更されたファイルのみをバックアップ
            for (const [componentName, paths] of Object.entries(this.MEMORY_COMPONENTS)) {
                const componentBackupPath = `${backupPath}/${componentName}`;
                const changedFiles = await this.findChangedFiles(paths, baseBackup.createdAt);

                if (changedFiles.length > 0) {
                    await storageProvider.createDirectory(componentBackupPath);
                    const componentResult = await this.backupChangedFiles(changedFiles, componentBackupPath);
                    totalSize += componentResult.size;
                    totalFiles += componentResult.fileCount;
                }
            }

            // チェックサムの生成
            const checksum = await this.generateBackupChecksum(backupPath);

            // メタデータの更新
            metadata.status = 'COMPLETED';
            metadata.completedAt = new Date();
            metadata.size = totalSize;
            metadata.fileCount = totalFiles;
            metadata.checksum = checksum;

            this.backupMetadata.set(backupId, metadata);
            await this.saveBackupMetadata();

            logger.info(`Incremental backup completed: ${backupId}`, {
                baseBackupId: baseBackup.id,
                size: totalSize,
                fileCount: totalFiles,
                duration: Date.now() - metadata.createdAt.getTime()
            });

            return backupId;

        } catch (error) {
            logger.error(`Incremental backup failed: ${backupId}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー状態の更新
            const metadata = this.backupMetadata.get(backupId);
            if (metadata) {
                metadata.status = 'FAILED';
                metadata.error = error instanceof Error ? error.message : String(error);
                metadata.completedAt = new Date();
                this.backupMetadata.set(backupId, metadata);
                await this.saveBackupMetadata();
            }

            throw error;
        } finally {
            this.currentBackupOperation = null;
        }
    }

    /**
     * データの復旧
     * @param options 復旧オプション
     */
    async restoreData(options: RestoreOptions): Promise<RestoreResult> {
        const startTime = Date.now();
        const result: RestoreResult = {
            success: false,
            backupId: options.backupId,
            restoredComponents: [],
            failedComponents: [],
            filesRestored: 0,
            errors: [],
            timeTaken: 0
        };

        try {
            logger.info(`Starting data restoration: ${options.backupId}`);

            const backup = this.backupMetadata.get(options.backupId);
            if (!backup) {
                throw new Error(`Backup not found: ${options.backupId}`);
            }

            if (backup.status !== 'COMPLETED') {
                throw new Error(`Backup is not completed: ${backup.status}`);
            }

            // 復旧前の検証
            if (options.validateBeforeRestore) {
                const isValid = await this.validateBackup(options.backupId);
                if (!isValid) {
                    throw new Error('Backup validation failed');
                }
            }

            const backupPath = `${this.BACKUP_BASE_PATH}/${options.backupId}`;
            const componentsToRestore = options.components || backup.memoryComponents;

            // ドライランの場合は実際の復旧は行わない
            if (options.dryRun) {
                logger.info(`Dry run restoration for backup: ${options.backupId}`);
                result.success = true;
                result.restoredComponents = componentsToRestore;
                return result;
            }

            // 各コンポーネントの復旧
            for (const componentName of componentsToRestore) {
                try {
                    const componentPath = `${backupPath}/${componentName}`;
                    const componentExists = await storageProvider.fileExists(componentPath);

                    if (!componentExists) {
                        result.failedComponents.push(componentName);
                        result.errors.push(`Component backup not found: ${componentName}`);
                        continue;
                    }

                    const restoredFiles = await this.restoreComponent(componentName, componentPath, options.overwrite);
                    result.filesRestored += restoredFiles;
                    result.restoredComponents.push(componentName);

                    logger.debug(`Component restored: ${componentName}`, {
                        filesRestored: restoredFiles
                    });

                } catch (error) {
                    result.failedComponents.push(componentName);
                    result.errors.push(`Failed to restore ${componentName}: ${error}`);
                    logger.error(`Component restoration failed: ${componentName}`, { error });
                }
            }

            // 復旧後の整合性チェック
            await this.validateRestoredData(result.restoredComponents);

            result.success = result.restoredComponents.length > 0;
            result.timeTaken = Date.now() - startTime;

            logger.info(`Data restoration completed: ${options.backupId}`, {
                success: result.success,
                restoredComponents: result.restoredComponents.length,
                failedComponents: result.failedComponents.length,
                filesRestored: result.filesRestored,
                timeTaken: result.timeTaken
            });

            return result;

        } catch (error) {
            logger.error(`Data restoration failed: ${options.backupId}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            result.errors.push(error instanceof Error ? error.message : String(error));
            result.timeTaken = Date.now() - startTime;
            return result;
        }
    }

    /**
     * バックアップの検証
     * @param backupId バックアップID
     */
    async validateBackup(backupId: string): Promise<boolean> {
        try {
            const backup = this.backupMetadata.get(backupId);
            if (!backup) {
                logger.error(`Backup metadata not found: ${backupId}`);
                return false;
            }

            const backupPath = `${this.BACKUP_BASE_PATH}/${backupId}`;
            
            // バックアップディレクトリの存在確認
            if (!await storageProvider.fileExists(backupPath)) {
                logger.error(`Backup directory not found: ${backupPath}`);
                return false;
            }

            // チェックサムの検証
            if (this.config.verification.enabled && backup.checksum) {
                const currentChecksum = await this.generateBackupChecksum(backupPath);
                if (currentChecksum !== backup.checksum) {
                    logger.error(`Checksum mismatch for backup: ${backupId}`);
                    return false;
                }
            }

            // ファイル数の検証
            const fileCount = await this.countBackupFiles(backupPath);
            if (fileCount !== backup.fileCount) {
                logger.warn(`File count mismatch for backup: ${backupId}`, {
                    expected: backup.fileCount,
                    actual: fileCount
                });
            }

            logger.info(`Backup validation successful: ${backupId}`);
            return true;

        } catch (error) {
            logger.error(`Backup validation failed: ${backupId}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * バックアップ一覧の取得
     */
    async listBackups(): Promise<BackupMetadata[]> {
        try {
            const backups = Array.from(this.backupMetadata.values());
            return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        } catch (error) {
            logger.error('Failed to list backups', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * バックアップの削除
     * @param backupId バックアップID
     */
    async deleteBackup(backupId: string): Promise<boolean> {
        try {
            const backup = this.backupMetadata.get(backupId);
            if (!backup) {
                logger.warn(`Backup not found for deletion: ${backupId}`);
                return false;
            }

            const backupPath = `${this.BACKUP_BASE_PATH}/${backupId}`;
            
            // バックアップディレクトリの削除
            if (await storageProvider.fileExists(backupPath)) {
                await this.deleteDirectory(backupPath);
            }

            // メタデータからも削除
            this.backupMetadata.delete(backupId);
            await this.saveBackupMetadata();

            logger.info(`Backup deleted: ${backupId}`);
            return true;

        } catch (error) {
            logger.error(`Failed to delete backup: ${backupId}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * スケジュール情報の取得
     */
    async getScheduleInfo(): Promise<ScheduleInfo> {
        const now = new Date();
        const lastFullBackup = this.findLatestBackup('FULL');
        const lastIncrementalBackup = this.findLatestBackup('INCREMENTAL');

        return {
            nextFullBackup: lastFullBackup ? 
                new Date(lastFullBackup.createdAt.getTime() + this.config.schedule.fullBackupInterval) :
                new Date(now.getTime() + this.config.schedule.fullBackupInterval),
            nextIncrementalBackup: lastIncrementalBackup ?
                new Date(lastIncrementalBackup.createdAt.getTime() + this.config.schedule.incrementalInterval) :
                new Date(now.getTime() + this.config.schedule.incrementalInterval),
            lastFullBackup: lastFullBackup?.createdAt,
            lastIncrementalBackup: lastIncrementalBackup?.createdAt,
            isRunning: this.currentBackupOperation !== null
        };
    }

    /**
     * 設定の更新
     * @param newConfig 新しい設定
     */
    async updateConfig(newConfig: Partial<BackupConfig>): Promise<void> {
        try {
            this.config = { ...this.config, ...newConfig };
            await this.saveConfig();

            // スケジュールの再開始
            if (this.config.enabled) {
                await this.stopScheduler();
                await this.startScheduler();
            } else {
                await this.stopScheduler();
            }

            logger.info('Backup configuration updated');
        } catch (error) {
            logger.error('Failed to update backup configuration', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * システム終了時の処理
     */
    async shutdown(): Promise<void> {
        try {
            logger.info('Shutting down BackupSystem...');

            // スケジュールの停止
            await this.stopScheduler();

            // 実行中のバックアップの完了待ち
            if (this.currentBackupOperation) {
                logger.info('Waiting for current backup operation to complete...');
                // 実際の実装では、バックアップ操作の完了を適切に待機する
                await new Promise(resolve => setTimeout(resolve, 5000));
            }

            this.initialized = false;
            logger.info('BackupSystem shutdown completed');

        } catch (error) {
            logger.error('Failed to shutdown BackupSystem', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

    /**
     * バックアップ構造の作成
     * @private
     */
    private async createBackupStructure(): Promise<void> {
        await storageProvider.createDirectory(this.BACKUP_BASE_PATH);
        await storageProvider.createDirectory(`${this.BACKUP_BASE_PATH}/metadata`);
        logger.debug('Backup directory structure created');
    }

    /**
     * 設定の読み込み
     * @private
     */
    private async loadConfig(): Promise<void> {
        try {
            const configPath = `${this.BACKUP_BASE_PATH}/metadata/${this.CONFIG_FILE}`;
            if (await storageProvider.fileExists(configPath)) {
                const content = await storageProvider.readFile(configPath);
                const savedConfig = JSON.parse(content);
                this.config = { ...this.config, ...savedConfig };
                logger.debug('Backup configuration loaded');
            }
        } catch (error) {
            logger.warn('Failed to load backup configuration, using defaults', { error });
        }
    }

    /**
     * 設定の保存
     * @private
     */
    private async saveConfig(): Promise<void> {
        try {
            const configPath = `${this.BACKUP_BASE_PATH}/metadata/${this.CONFIG_FILE}`;
            await storageProvider.writeFile(configPath, JSON.stringify(this.config, null, 2));
            logger.debug('Backup configuration saved');
        } catch (error) {
            logger.error('Failed to save backup configuration', { error });
        }
    }

    /**
     * バックアップメタデータの読み込み
     * @private
     */
    private async loadBackupMetadata(): Promise<void> {
        try {
            const metadataPath = `${this.BACKUP_BASE_PATH}/metadata/${this.METADATA_FILE}`;
            if (await storageProvider.fileExists(metadataPath)) {
                const content = await storageProvider.readFile(metadataPath);
                const metadataArray = JSON.parse(content) as Array<[string, any]>;
                
                this.backupMetadata = new Map(metadataArray.map(([id, metadata]) => [
                    id,
                    {
                        ...metadata,
                        createdAt: new Date(metadata.createdAt),
                        completedAt: metadata.completedAt ? new Date(metadata.completedAt) : undefined
                    }
                ]));

                logger.debug(`Loaded ${this.backupMetadata.size} backup metadata entries`);
            }
        } catch (error) {
            logger.warn('Failed to load backup metadata, starting fresh', { error });
            this.backupMetadata = new Map();
        }
    }

    /**
     * バックアップメタデータの保存
     * @private
     */
    private async saveBackupMetadata(): Promise<void> {
        try {
            const metadataPath = `${this.BACKUP_BASE_PATH}/metadata/${this.METADATA_FILE}`;
            const metadataArray = Array.from(this.backupMetadata.entries());
            await storageProvider.writeFile(metadataPath, JSON.stringify(metadataArray, null, 2));
            logger.debug('Backup metadata saved');
        } catch (error) {
            logger.error('Failed to save backup metadata', { error });
        }
    }

    /**
     * スケジューラーの開始
     * @private
     */
    private async startScheduler(): Promise<void> {
        if (!this.config.enabled) return;

        // フルバックアップのスケジュール
        const fullBackupInterval = setInterval(async () => {
            try {
                await this.createFullBackup('Scheduled full backup');
            } catch (error) {
                logger.error('Scheduled full backup failed', { error });
            }
        }, this.config.schedule.fullBackupInterval);

        // 増分バックアップのスケジュール
        const incrementalBackupInterval = setInterval(async () => {
            try {
                await this.createIncrementalBackup(undefined, 'Scheduled incremental backup');
            } catch (error) {
                logger.error('Scheduled incremental backup failed', { error });
            }
        }, this.config.schedule.incrementalInterval);

        this.scheduleIntervals.set('full', fullBackupInterval);
        this.scheduleIntervals.set('incremental', incrementalBackupInterval);

        logger.info('Backup scheduler started');
    }

    /**
     * スケジューラーの停止
     * @private
     */
    private async stopScheduler(): Promise<void> {
        for (const [name, interval] of this.scheduleIntervals.entries()) {
            clearInterval(interval);
            this.scheduleIntervals.delete(name);
        }
        logger.info('Backup scheduler stopped');
    }

    /**
     * 古いバックアップのクリーンアップ
     * @private
     */
    private async cleanupOldBackups(): Promise<void> {
        try {
            const now = new Date();
            const cutoffDate = new Date(now.getTime() - (this.config.schedule.retentionDays * 24 * 60 * 60 * 1000));
            
            const backupsToDelete = Array.from(this.backupMetadata.values())
                .filter(backup => backup.createdAt < cutoffDate)
                .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

            // 最大バックアップ数の確認
            const totalBackups = this.backupMetadata.size;
            if (totalBackups > this.config.schedule.maxBackupCount) {
                const excessCount = totalBackups - this.config.schedule.maxBackupCount;
                const oldestBackups = Array.from(this.backupMetadata.values())
                    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
                    .slice(0, excessCount);

                backupsToDelete.push(...oldestBackups);
            }

            // 重複削除
            const uniqueBackupsToDelete = Array.from(new Set(backupsToDelete.map(b => b.id)))
                .map(id => backupsToDelete.find(b => b.id === id)!);

            for (const backup of uniqueBackupsToDelete) {
                await this.deleteBackup(backup.id);
                logger.info(`Old backup deleted: ${backup.id}`);
            }

            if (uniqueBackupsToDelete.length > 0) {
                logger.info(`Cleaned up ${uniqueBackupsToDelete.length} old backups`);
            }

        } catch (error) {
            logger.error('Failed to cleanup old backups', { error });
        }
    }

    /**
     * バックアップIDの生成
     * @private
     */
    private generateBackupId(type: BackupType): string {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        return `${type.toLowerCase()}-${timestamp}-${randomSuffix}`;
    }

    /**
     * システムバージョンの取得
     * @private
     */
    private async getSystemVersion(): Promise<string> {
        return '1.0.0'; // 実際の実装では package.json から取得
    }

    /**
     * 最新のフルバックアップを検索
     * @private
     */
    private findLatestFullBackup(): BackupMetadata | null {
        return this.findLatestBackup('FULL');
    }

    /**
     * 最新のバックアップを検索
     * @private
     */
    private findLatestBackup(type: BackupType): BackupMetadata | null {
        const backups = Array.from(this.backupMetadata.values())
            .filter(backup => backup.type === type && backup.status === 'COMPLETED')
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return backups.length > 0 ? backups[0] : null;
    }

    /**
     * システムメタデータのバックアップ
     * @private
     */
    private async backupSystemMetadata(backupPath: string): Promise<{ size: number; fileCount: number }> {
        let totalSize = 0;
        let fileCount = 0;

        try {
            // バックアップメタデータファイルのバックアップ
            const metadataPath = `${this.BACKUP_BASE_PATH}/metadata/${this.METADATA_FILE}`;
            if (await storageProvider.fileExists(metadataPath)) {
                const content = await storageProvider.readFile(metadataPath);
                const targetPath = `${backupPath}/system-metadata/${this.METADATA_FILE}`;
                await this.ensureDirectoryExists(targetPath);
                await storageProvider.writeFile(targetPath, content);
                totalSize += content.length;
                fileCount++;
            }

            // 設定ファイルのバックアップ
            const configPath = `${this.BACKUP_BASE_PATH}/metadata/${this.CONFIG_FILE}`;
            if (await storageProvider.fileExists(configPath)) {
                const content = await storageProvider.readFile(configPath);
                const targetPath = `${backupPath}/system-metadata/${this.CONFIG_FILE}`;
                await this.ensureDirectoryExists(targetPath);
                await storageProvider.writeFile(targetPath, content);
                totalSize += content.length;
                fileCount++;
            }

            // 現在のバックアップメタデータの状態も保存
            const currentMetadataContent = JSON.stringify(Array.from(this.backupMetadata.entries()), null, 2);
            const currentMetadataPath = `${backupPath}/system-metadata/current-backup-metadata.json`;
            await this.ensureDirectoryExists(currentMetadataPath);
            await storageProvider.writeFile(currentMetadataPath, currentMetadataContent);
            totalSize += currentMetadataContent.length;
            fileCount++;

        } catch (error) {
            logger.error('Failed to backup system metadata', { error });
        }

        return { size: totalSize, fileCount };
    }

    /**
     * コンポーネントのバックアップ
     * @private
     */
    private async backupComponent(
        componentName: string,
        paths: string[],
        backupPath: string
    ): Promise<{ size: number; fileCount: number }> {
        let totalSize = 0;
        let fileCount = 0;

        for (const path of paths) {
            try {
                if (path.endsWith('/')) {
                    // ディレクトリの場合
                    const files = await this.listDirectoryFiles(path);
                    for (const file of files) {
                        const content = await storageProvider.readFile(file);
                        const targetPath = `${backupPath}/${file}`;
                        await this.ensureDirectoryExists(targetPath);
                        await storageProvider.writeFile(targetPath, content);
                        totalSize += content.length;
                        fileCount++;
                    }
                } else {
                    // ファイルの場合
                    if (await storageProvider.fileExists(path)) {
                        const content = await storageProvider.readFile(path);
                        const targetPath = `${backupPath}/${path}`;
                        await this.ensureDirectoryExists(targetPath);
                        await storageProvider.writeFile(targetPath, content);
                        totalSize += content.length;
                        fileCount++;
                    }
                }
            } catch (error) {
                logger.warn(`Failed to backup path: ${path}`, { error });
            }
        }

        return { size: totalSize, fileCount };
    }

    /**
     * バックアップチェックサムの生成
     * @private
     */
    private async generateBackupChecksum(backupPath: string): Promise<string> {
        // 簡易的な実装（実際の実装では本格的なハッシュ計算を行う）
        try {
            const files = await this.listDirectoryFiles(backupPath);
            const contents = await Promise.all(
                files.map(file => storageProvider.readFile(file).catch(() => ''))
            );
            const combinedContent = contents.join('');
            return this.simpleHash(combinedContent);
        } catch (error) {
            logger.error('Failed to generate backup checksum', { error });
            return '';
        }
    }

    /**
     * 簡易ハッシュ関数
     * @private
     */
    private simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * 変更されたファイルの検索
     * @private
     */
    private async findChangedFiles(paths: string[], since: Date): Promise<string[]> {
        const changedFiles: string[] = [];

        for (const path of paths) {
            try {
                if (path.endsWith('/')) {
                    const files = await this.listDirectoryFiles(path);
                    for (const file of files) {
                        // 実際の実装では最終更新時刻を確認
                        // ここでは簡易的にファイルの存在確認のみ
                        if (await storageProvider.fileExists(file)) {
                            changedFiles.push(file);
                        }
                    }
                } else {
                    if (await storageProvider.fileExists(path)) {
                        changedFiles.push(path);
                    }
                }
            } catch (error) {
                logger.warn(`Failed to check file changes: ${path}`, { error });
            }
        }

        return changedFiles;
    }

    /**
     * 変更されたファイルのバックアップ
     * @private
     */
    private async backupChangedFiles(files: string[], backupPath: string): Promise<{ size: number; fileCount: number }> {
        let totalSize = 0;
        let fileCount = 0;

        for (const file of files) {
            try {
                const content = await storageProvider.readFile(file);
                const targetPath = `${backupPath}/${file}`;
                await this.ensureDirectoryExists(targetPath);
                await storageProvider.writeFile(targetPath, content);
                totalSize += content.length;
                fileCount++;
            } catch (error) {
                logger.warn(`Failed to backup changed file: ${file}`, { error });
            }
        }

        return { size: totalSize, fileCount };
    }

    /**
     * コンポーネントの復旧
     * @private
     */
    private async restoreComponent(
        componentName: string,
        componentBackupPath: string,
        overwrite: boolean = false
    ): Promise<number> {
        let restoredFiles = 0;

        try {
            const backupFiles = await this.listDirectoryFiles(componentBackupPath);

            for (const backupFile of backupFiles) {
                const relativePath = backupFile.replace(`${componentBackupPath}/`, '');
                const targetPath = relativePath;

                // 上書きの確認
                if (!overwrite && await storageProvider.fileExists(targetPath)) {
                    logger.debug(`Skipping existing file: ${targetPath}`);
                    continue;
                }

                const content = await storageProvider.readFile(backupFile);
                await this.ensureDirectoryExists(targetPath);
                await storageProvider.writeFile(targetPath, content);
                restoredFiles++;
            }

        } catch (error) {
            logger.error(`Failed to restore component: ${componentName}`, { error });
        }

        return restoredFiles;
    }

    /**
     * 復旧データの検証
     * @private
     */
    private async validateRestoredData(components: string[]): Promise<boolean> {
        try {
            // 各コンポーネントの基本的な整合性チェック
            for (const component of components) {
                const componentPaths = this.MEMORY_COMPONENTS[component as keyof typeof this.MEMORY_COMPONENTS];
                if (!componentPaths) continue;

                for (const path of componentPaths) {
                    if (!path.endsWith('/') && path.endsWith('.json')) {
                        if (await storageProvider.fileExists(path)) {
                            const content = await storageProvider.readFile(path);
                            JSON.parse(content); // JSON妥当性チェック
                        }
                    }
                }
            }

            return true;
        } catch (error) {
            logger.error('Restored data validation failed', { error });
            return false;
        }
    }

    /**
     * バックアップファイル数のカウント
     * @private
     */
    private async countBackupFiles(backupPath: string): Promise<number> {
        try {
            const files = await this.listDirectoryFiles(backupPath);
            return files.length;
        } catch (error) {
            logger.error('Failed to count backup files', { error });
            return 0;
        }
    }

    /**
     * ディレクトリファイルのリストアップ
     * @private
     */
    private async listDirectoryFiles(dirPath: string): Promise<string[]> {
        try {
            return await storageProvider.listFiles(dirPath);
        } catch (error) {
            logger.warn(`Failed to list directory files: ${dirPath}`, { error });
            return [];
        }
    }

    /**
     * ディレクトリの削除
     * @private
     */
    private async deleteDirectory(dirPath: string): Promise<void> {
        try {
            const files = await this.listDirectoryFiles(dirPath);
            for (const file of files) {
                await storageProvider.deleteFile(file);
            }
            // ディレクトリ自体の削除は storageProvider の実装に依存
        } catch (error) {
            logger.error(`Failed to delete directory: ${dirPath}`, { error });
        }
    }

    /**
     * ディレクトリの存在確認と作成
     * @private
     */
    private async ensureDirectoryExists(filePath: string): Promise<void> {
        const directory = filePath.substring(0, filePath.lastIndexOf('/'));
        if (directory) {
            await storageProvider.createDirectory(directory);
        }
    }
}

// シングルトンインスタンスをエクスポート
export const backupSystem = new BackupSystem();