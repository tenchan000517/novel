// src/lib/storage/storage-initializer.ts
/**
 * @fileoverview ストレージ初期化・修復スクリプト
 * @description
 * 小説生成システムに必要なディレクトリ構造とデフォルトファイルを自動作成する
 * ディレクトリが見つからない問題を根本的に解決する
 */

import { StorageProvider } from './types';
import { logger } from '../utils/logger';

/**
 * 必要なディレクトリ構造の定義
 */
const REQUIRED_DIRECTORIES = [
    // 短期記憶関連
    'data/short-term',
    'data/short-term/chapters',
    'data/short-term/cache',
    'data/short-term/processing',
    
    // 中期記憶関連
    'data/mid-term',
    'data/mid-term/narrative',
    'data/mid-term/analysis',
    'data/mid-term/statistics',
    'data/mid-term-memory',
    
    // 長期記憶関連
    'data/long-term',
    'data/long-term/settings',
    'data/long-term/knowledge',
    'data/long-term/completed',
    'data/long-term/completed/sections',
    'data/long-term/completed/arcs',
    'data/long-term-memory',
    'data/long-term-memory/completed',
    'data/long-term-memory/completed/sections',
    'data/long-term-memory/completed/arcs',
    'data/long-term-memory/system-knowledge',
    
    // キャラクター関連
    'data/characters',
    'data/characters/main',
    'data/characters/sub-characters',
    'data/characters/mob-characters',
    'world-knowledge/characters',
    
    // システム関連
    'data/metadata',
    'data/backup',
    'data/migrations',
    'data/migrations/records',
    'data/rollback-data',
    'data/migrations/temp',
    
    // 一時分析
    'data/temporary-analysis',
    
    // ワールド知識
    'world-knowledge',
    'world-knowledge/settings',
    'world-knowledge/locations',
    'world-knowledge/events'
];

/**
 * デフォルトファイルの定義
 */
const DEFAULT_FILES = {
    // 長期記憶のデフォルトファイル
    'data/long-term-memory/completed/effectiveness-records.json': JSON.stringify([], null, 2),
    'data/long-term-memory/system-knowledge/patterns.json': JSON.stringify([], null, 2),
    
    // 中期記憶のデフォルトファイル
    'data/mid-term-memory/analysis-results.json': JSON.stringify({
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        results: []
    }, null, 2),
    'data/mid-term-memory/character-evolution.json': JSON.stringify({
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        characters: {}
    }, null, 2),
    'data/mid-term-memory/narrative-progression.json': JSON.stringify({
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        progression: []
    }, null, 2),
    'data/mid-term-memory/quality-metrics.json': JSON.stringify({
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        metrics: {}
    }, null, 2),
    'data/mid-term-memory/system-statistics.json': JSON.stringify({
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        statistics: {}
    }, null, 2),
    
    // 短期記憶のデフォルトファイル
    'data/short-term/processing-buffers.json': JSON.stringify({
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        buffers: {}
    }, null, 2),
    'data/short-term/generation-cache.json': JSON.stringify({
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        cache: {}
    }, null, 2),
    'data/short-term/immediate-context-metadata.json': JSON.stringify({
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        context: {}
    }, null, 2),
    
    // 一時分析のデフォルトファイル
    'data/temporary-analysis/emotional-analysis.json': JSON.stringify({
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        analyses: {}
    }, null, 2),
    'data/temporary-analysis/detection-results.json': JSON.stringify({
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        results: {}
    }, null, 2),
    
    // キャラクターマスターレコード
    'long-term-memory/knowledge/characters/master-records.json': JSON.stringify([], null, 2),
    
    // システム設定
    'data/metadata/system-config.json': JSON.stringify({
        version: '2.0.0',
        initialized: true,
        lastInitialization: new Date().toISOString(),
        features: {
            characterConsolidation: true,
            memoryHierarchy: true,
            qualityMetrics: true
        }
    }, null, 2)
};

/**
 * ストレージ初期化クラス
 */
export class StorageInitializer {
    constructor(private storage: StorageProvider) {}

    /**
     * 完全な初期化を実行
     */
    async initializeStorage(): Promise<void> {
        logger.info('Starting storage initialization...');
        
        try {
            // ディレクトリ構造の作成
            await this.createDirectoryStructure();
            
            // デフォルトファイルの作成
            await this.createDefaultFiles();
            
            // 初期化状態の検証
            await this.verifyInitialization();
            
            logger.info('Storage initialization completed successfully');
        } catch (error) {
            logger.error('Storage initialization failed', { error });
            throw error;
        }
    }

    /**
     * 必要なディレクトリ構造を作成
     */
    private async createDirectoryStructure(): Promise<void> {
        logger.info('Creating directory structure...');
        
        for (const dir of REQUIRED_DIRECTORIES) {
            try {
                const exists = await this.storage.directoryExists(dir);
                if (!exists) {
                    await this.storage.createDirectory(dir);
                    logger.debug(`Created directory: ${dir}`);
                } else {
                    logger.debug(`Directory already exists: ${dir}`);
                }
            } catch (error) {
                logger.warn(`Failed to create directory: ${dir}`, { error });
                // 続行（一部のディレクトリ作成に失敗しても他を試行）
            }
        }
        
        logger.info('Directory structure creation completed');
    }

    /**
     * デフォルトファイルを作成
     */
    private async createDefaultFiles(): Promise<void> {
        logger.info('Creating default files...');
        
        for (const [filePath, content] of Object.entries(DEFAULT_FILES)) {
            try {
                const exists = await this.storage.fileExists(filePath);
                if (!exists) {
                    await this.storage.writeFile(filePath, content);
                    logger.debug(`Created default file: ${filePath}`);
                } else {
                    logger.debug(`Default file already exists: ${filePath}`);
                }
            } catch (error) {
                logger.warn(`Failed to create default file: ${filePath}`, { error });
                // 続行（一部のファイル作成に失敗しても他を試行）
            }
        }
        
        logger.info('Default files creation completed');
    }

    /**
     * 初期化状態を検証
     */
    private async verifyInitialization(): Promise<void> {
        logger.info('Verifying initialization...');
        
        const criticalDirectories = [
            'data/long-term-memory/completed/sections',
            'data/long-term-memory/completed/arcs',
            'data/long-term-memory/system-knowledge',
            'data/mid-term-memory',
            'data/short-term',
            'data/temporary-analysis'
        ];

        const criticalFiles = [
            'data/long-term-memory/completed/effectiveness-records.json',
            'data/long-term-memory/system-knowledge/patterns.json',
            'data/mid-term-memory/analysis-results.json'
        ];

        // ディレクトリの検証
        for (const dir of criticalDirectories) {
            const exists = await this.storage.directoryExists(dir);
            if (!exists) {
                logger.warn(`Critical directory missing: ${dir}`);
            } else {
                logger.debug(`Critical directory verified: ${dir}`);
            }
        }

        // ファイルの検証
        for (const file of criticalFiles) {
            const exists = await this.storage.fileExists(file);
            if (!exists) {
                logger.warn(`Critical file missing: ${file}`);
            } else {
                logger.debug(`Critical file verified: ${file}`);
            }
        }
        
        logger.info('Initialization verification completed');
    }

    /**
     * 修復モードで実行（既存ファイルを保護しながら不足分を補完）
     */
    async repairStorage(): Promise<void> {
        logger.info('Starting storage repair...');
        
        try {
            // 不足しているディレクトリのみ作成
            for (const dir of REQUIRED_DIRECTORIES) {
                const exists = await this.storage.directoryExists(dir);
                if (!exists) {
                    await this.storage.createDirectory(dir);
                    logger.info(`Repaired missing directory: ${dir}`);
                }
            }

            // 不足しているデフォルトファイルのみ作成
            for (const [filePath, content] of Object.entries(DEFAULT_FILES)) {
                const exists = await this.storage.fileExists(filePath);
                if (!exists) {
                    await this.storage.writeFile(filePath, content);
                    logger.info(`Repaired missing file: ${filePath}`);
                }
            }
            
            logger.info('Storage repair completed successfully');
        } catch (error) {
            logger.error('Storage repair failed', { error });
            throw error;
        }
    }

    /**
     * ストレージの健全性診断
     */
    async diagnoseStorage(): Promise<{
        status: 'healthy' | 'needs_repair' | 'critical';
        missingDirectories: string[];
        missingFiles: string[];
        recommendations: string[];
    }> {
        logger.info('Starting storage diagnosis...');
        
        const missingDirectories: string[] = [];
        const missingFiles: string[] = [];
        const recommendations: string[] = [];

        // ディレクトリチェック
        for (const dir of REQUIRED_DIRECTORIES) {
            const exists = await this.storage.directoryExists(dir);
            if (!exists) {
                missingDirectories.push(dir);
            }
        }

        // ファイルチェック
        for (const filePath of Object.keys(DEFAULT_FILES)) {
            const exists = await this.storage.fileExists(filePath);
            if (!exists) {
                missingFiles.push(filePath);
            }
        }

        // ステータス判定
        let status: 'healthy' | 'needs_repair' | 'critical';
        if (missingDirectories.length === 0 && missingFiles.length === 0) {
            status = 'healthy';
        } else if (missingDirectories.length < 5 && missingFiles.length < 3) {
            status = 'needs_repair';
            recommendations.push('repairStorage()メソッドの実行を推奨します');
        } else {
            status = 'critical';
            recommendations.push('initializeStorage()メソッドによる完全初期化が必要です');
        }

        if (missingDirectories.length > 0) {
            recommendations.push(`${missingDirectories.length}個のディレクトリが不足しています`);
        }
        if (missingFiles.length > 0) {
            recommendations.push(`${missingFiles.length}個のデフォルトファイルが不足しています`);
        }

        logger.info('Storage diagnosis completed', {
            status,
            missingDirectories: missingDirectories.length,
            missingFiles: missingFiles.length
        });

        return {
            status,
            missingDirectories,
            missingFiles,
            recommendations
        };
    }
}

/**
 * 自動修復機能付きストレージ初期化関数
 */
export async function initializeStorageWithAutoRepair(storage: StorageProvider): Promise<void> {
    const initializer = new StorageInitializer(storage);
    
    // まず診断を実行
    const diagnosis = await initializer.diagnoseStorage();
    
    logger.info('Storage diagnosis result', {
        status: diagnosis.status,
        recommendations: diagnosis.recommendations
    });

    // ステータスに応じて適切な処理を実行
    switch (diagnosis.status) {
        case 'healthy':
            logger.info('Storage is healthy, no action needed');
            break;
        case 'needs_repair':
            logger.info('Storage needs repair, executing repair...');
            await initializer.repairStorage();
            break;
        case 'critical':
            logger.info('Storage is in critical state, executing full initialization...');
            await initializer.initializeStorage();
            break;
    }
}

/**
 * 使用例とエクスポート
 */
export { StorageInitializer as default };