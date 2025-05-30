// src/lib/memory/narrative/storage-diagnostic-manager.ts
/**
 * @fileoverview ストレージ診断管理クラス
 * @description
 * NarrativeMemoryシステムのストレージ状態を診断し、
 * 問題の特定と修復を行う専門クラス
 */

import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { ChapterAnalysisManager } from './chapter-summary-manager';
import { CharacterTrackingManager } from './character-tracking-manager';
import { EmotionalDynamicsManager } from './emotional-dynamics-manager';
import { NarrativeStateManager } from './narrative-state-manager';
import { WorldContextManager } from './world-context-manager';
import { IManager } from './types';

/**
 * @interface StorageFileInfo
 * @description ストレージファイル情報
 */
interface StorageFileInfo {
    path: string;
    exists: boolean;
    size?: number;
    readable?: boolean;
    parseable?: boolean;
    lastModified?: string;
}

/**
 * @interface ManagerDiagnosticInfo
 * @description マネージャー診断情報
 */
interface ManagerDiagnosticInfo {
    name: string;
    initialized: boolean;
    dataCount: number;
    hasData: boolean;
    errors: string[];
}

/**
 * @interface StorageDiagnosticResult
 * @description ストレージ診断結果
 */
interface StorageDiagnosticResult {
    files: StorageFileInfo[];
    managers: ManagerDiagnosticInfo[];
    errors: string[];
    warnings: string[];
    overallHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    recommendations: string[];
}

/**
 * @interface StorageRepairResult
 * @description ストレージ修復結果
 */
interface StorageRepairResult {
    success: boolean;
    repaired: string[];
    errors: string[];
    warnings: string[];
}

/**
 * @class StorageDiagnosticManager  
 * @description ストレージ診断と修復を専門に行うクラス
 */
export class StorageDiagnosticManager implements IManager {
    private initialized: boolean = false;
    
    // 期待されるファイルパスのリスト
    private readonly expectedFiles = [
        'narrative-memory/summaries.json',
        'narrative-memory/characters.json', 
        'narrative-memory/emotional-dynamics.json',
        'narrative-memory/state.json',
        'narrative-memory/turning-points.json',
        'narrative-memory/world-context.json'
    ];

    /**
     * コンストラクタ
     */
    constructor() {
        logger.debug('StorageDiagnosticManager instantiated');
    }

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('StorageDiagnosticManager already initialized');
            return;
        }

        try {
            // ストレージプロバイダーの動作確認
            await this.verifyStorageProvider();
            
            this.initialized = true;
            logger.info('StorageDiagnosticManager initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize StorageDiagnosticManager', { 
                error: error instanceof Error ? error.message : String(error) 
            });
            // 初期化に失敗しても、診断機能は提供する
            this.initialized = true;
        }
    }

    /**
     * ストレージプロバイダーの動作確認
     * @private
     */
    private async verifyStorageProvider(): Promise<void> {
        try {
            // テスト用の小さなファイルの書き込み・読み込み・削除
            const testPath = 'diagnostic-test.json';
            const testData = JSON.stringify({ test: true, timestamp: new Date().toISOString() });

            await storageProvider.writeFile(testPath, testData);
            const readData = await storageProvider.readFile(testPath);
            
            if (readData !== testData) {
                throw new Error('Storage provider read/write verification failed');
            }

            // テストファイルを削除（可能であれば）
            try {
                if (typeof (storageProvider as any).deleteFile === 'function') {
                    await (storageProvider as any).deleteFile(testPath);
                }
            } catch (deleteError) {
                // 削除に失敗してもエラーにはしない
                logger.debug('Test file deletion failed (non-critical)', { error: deleteError });
            }

            logger.debug('Storage provider verification successful');
        } catch (error) {
            logger.warn('Storage provider verification failed', { error });
            throw error;
        }
    }

    /**
     * 空のupdateFromChapterメソッド（IManager実装のため）
     */
    async updateFromChapter(): Promise<void> {
        // 診断マネージャーは章更新を行わない
        return;
    }

    /**
     * 空のsaveメソッド（IManager実装のため）
     */
    async save(): Promise<void> {
        // 診断マネージャーは独自のデータを保存しない
        return;
    }

    /**
     * ストレージファイルの診断
     */
    async diagnoseStorage(): Promise<{
        files: { path: string; exists: boolean; size?: number }[];
        errors: string[];
    }> {
        const fileStatus: { path: string; exists: boolean; size?: number }[] = [];
        const errors: string[] = [];

        logger.info('Starting storage file diagnosis');

        for (const filePath of this.expectedFiles) {
            try {
                const exists = await storageProvider.fileExists(filePath);
                
                if (exists) {
                    try {
                        const content = await storageProvider.readFile(filePath);
                        
                        // JSONとしてパース可能かチェック
                        try {
                            JSON.parse(content);
                            fileStatus.push({
                                path: filePath,
                                exists: true,
                                size: content.length
                            });
                        } catch (parseError) {
                            fileStatus.push({
                                path: filePath,
                                exists: true,
                                size: content.length
                            });
                            errors.push(`${filePath}: JSON解析エラー - ${parseError}`);
                        }
                    } catch (readError) {
                        fileStatus.push({ 
                            path: filePath, 
                            exists: true 
                        });
                        errors.push(`${filePath}: 読み込みエラー - ${readError}`);
                    }
                } else {
                    fileStatus.push({ 
                        path: filePath, 
                        exists: false 
                    });
                    logger.debug(`File does not exist: ${filePath}`);
                }
            } catch (error) {
                fileStatus.push({ 
                    path: filePath, 
                    exists: false 
                });
                errors.push(`${filePath}: 存在確認エラー - ${error}`);
            }
        }

        logger.info(`Storage diagnosis completed. Found ${fileStatus.filter(f => f.exists).length}/${this.expectedFiles.length} files`);
        
        return { files: fileStatus, errors };
    }

    /**
     * マネージャーの診断
     */
    async diagnoseManagers(
        chapterAnalysisManager: ChapterAnalysisManager,
        characterTrackingManager: CharacterTrackingManager,
        emotionalDynamicsManager: EmotionalDynamicsManager,
        narrativeStateManager: NarrativeStateManager,
        worldContextManager: WorldContextManager
    ): Promise<{
        managers: { name: string; initialized: boolean; dataCount: number }[];
        errors: string[];
    }> {
        const managers: { name: string; initialized: boolean; dataCount: number }[] = [];
        const errors: string[] = [];

        logger.info('Starting manager diagnosis');

        // ChapterAnalysisManager
        try {
            const summaries = await chapterAnalysisManager.getAllChapterSummaries();
            managers.push({
                name: 'ChapterAnalysisManager',
                initialized: true,
                dataCount: summaries.length
            });
            logger.debug(`ChapterAnalysisManager: ${summaries.length} summaries`);
        } catch (error) {
            managers.push({
                name: 'ChapterAnalysisManager', 
                initialized: false,
                dataCount: 0
            });
            errors.push(`ChapterAnalysisManager診断エラー: ${error instanceof Error ? error.message : String(error)}`);
        }

        // CharacterTrackingManager
        try {
            const characters = characterTrackingManager.getAllCharacterProgress();
            managers.push({
                name: 'CharacterTrackingManager',
                initialized: true,
                dataCount: characters.length
            });
            logger.debug(`CharacterTrackingManager: ${characters.length} characters`);
        } catch (error) {
            managers.push({
                name: 'CharacterTrackingManager',
                initialized: false, 
                dataCount: 0
            });
            errors.push(`CharacterTrackingManager診断エラー: ${error instanceof Error ? error.message : String(error)}`);
        }

        // NarrativeStateManager
        try {
            const turningPoints = narrativeStateManager.getTurningPoints();
            managers.push({
                name: 'NarrativeStateManager',
                initialized: true,
                dataCount: turningPoints.length
            });
            logger.debug(`NarrativeStateManager: ${turningPoints.length} turning points`);
        } catch (error) {
            managers.push({
                name: 'NarrativeStateManager',
                initialized: false,
                dataCount: 0
            });
            errors.push(`NarrativeStateManager診断エラー: ${error instanceof Error ? error.message : String(error)}`);
        }

        // EmotionalDynamicsManager
        try {
            const tensionLevel = emotionalDynamicsManager.getCurrentTensionLevel();
            const genre = emotionalDynamicsManager.getGenre();
            managers.push({
                name: 'EmotionalDynamicsManager',
                initialized: true,
                dataCount: tensionLevel > 0 ? 1 : 0
            });
            logger.debug(`EmotionalDynamicsManager: tension=${tensionLevel}, genre=${genre}`);
        } catch (error) {
            managers.push({
                name: 'EmotionalDynamicsManager',
                initialized: false,
                dataCount: 0
            });
            errors.push(`EmotionalDynamicsManager診断エラー: ${error instanceof Error ? error.message : String(error)}`);
        }

        // WorldContextManager
        try {
            const envInfo = worldContextManager.getEnvironmentInfo();
            const genre = worldContextManager.getGenre();
            managers.push({
                name: 'WorldContextManager',
                initialized: true,
                dataCount: (envInfo.location || envInfo.timeOfDay || envInfo.weather) ? 1 : 0
            });
            logger.debug(`WorldContextManager: location=${envInfo.location}, genre=${genre}`);
        } catch (error) {
            managers.push({
                name: 'WorldContextManager',
                initialized: false,
                dataCount: 0
            });
            errors.push(`WorldContextManager診断エラー: ${error instanceof Error ? error.message : String(error)}`);
        }

        logger.info(`Manager diagnosis completed. ${managers.filter(m => m.initialized).length}/${managers.length} managers initialized`);

        return { managers, errors };
    }

    /**
     * 完全な診断レポートを生成
     */
    async generateDiagnosticReport(
        chapterAnalysisManager: ChapterAnalysisManager,
        characterTrackingManager: CharacterTrackingManager,
        emotionalDynamicsManager: EmotionalDynamicsManager,
        narrativeStateManager: NarrativeStateManager,
        worldContextManager: WorldContextManager
    ): Promise<string> {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            logger.info('Generating comprehensive diagnostic report');

            const storageResults = await this.diagnoseStorage();
            const managerResults = await this.diagnoseManagers(
                chapterAnalysisManager,
                characterTrackingManager,
                emotionalDynamicsManager,
                narrativeStateManager,
                worldContextManager
            );

            let report = '=== NARRATIVE MEMORY 診断レポート ===\n\n';

            // 全体的な健康状態の評価
            const existingFiles = storageResults.files.filter(f => f.exists).length;
            const initializedManagers = managerResults.managers.filter(m => m.initialized).length;
            const totalErrors = storageResults.errors.length + managerResults.errors.length;

            let overallHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL';
            if (totalErrors === 0 && existingFiles === this.expectedFiles.length && initializedManagers === managerResults.managers.length) {
                overallHealth = 'HEALTHY';
            } else if (totalErrors <= 3 && existingFiles >= Math.floor(this.expectedFiles.length * 0.7)) {
                overallHealth = 'WARNING';
            } else {
                overallHealth = 'CRITICAL';
            }

            const healthEmoji = overallHealth === 'HEALTHY' ? '✅' : overallHealth === 'WARNING' ? '⚠️' : '❌';
            report += `🏥 全体的な健康状態: ${healthEmoji} ${overallHealth}\n\n`;

            // ストレージファイル状態
            report += '📁 ストレージファイル状態:\n';
            for (const file of storageResults.files) {
                const status = file.exists ? '✅' : '❌';
                const size = file.size ? ` (${file.size} bytes)` : '';
                report += `  ${status} ${file.path}${size}\n`;
            }

            if (storageResults.errors.length > 0) {
                report += '\n❌ ストレージエラー:\n';
                for (const error of storageResults.errors) {
                    report += `  - ${error}\n`;
                }
            }

            // マネージャー状態
            report += '\n🔧 マネージャー状態:\n';
            for (const manager of managerResults.managers) {
                const status = manager.initialized ? '✅' : '❌';
                report += `  ${status} ${manager.name} (データ数: ${manager.dataCount})\n`;
            }

            if (managerResults.errors.length > 0) {
                report += '\n❌ マネージャーエラー:\n';
                for (const error of managerResults.errors) {
                    report += `  - ${error}\n`;
                }
            }

            // 統計情報
            report += '\n📊 統計情報:\n';
            report += `  - 初期化済みマネージャー: ${initializedManagers}/${managerResults.managers.length}\n`;
            report += `  - 存在するファイル: ${existingFiles}/${this.expectedFiles.length}\n`;
            report += `  - 総エラー数: ${totalErrors}\n`;

            // データの詳細
            report += '\n📈 データ詳細:\n';
            const chapterManager = managerResults.managers.find(m => m.name === 'ChapterAnalysisManager');
            const characterManager = managerResults.managers.find(m => m.name === 'CharacterTrackingManager');
            const stateManager = managerResults.managers.find(m => m.name === 'NarrativeStateManager');
            
            if (chapterManager) {
                report += `  - 章要約: ${chapterManager.dataCount}件\n`;
            }
            if (characterManager) {
                report += `  - キャラクター: ${characterManager.dataCount}件\n`;
            }
            if (stateManager) {
                report += `  - ターニングポイント: ${stateManager.dataCount}件\n`;
            }

            // 推奨事項
            report += '\n💡 推奨事項:\n';
            const recommendations = this.generateRecommendations(storageResults, managerResults, overallHealth);
            for (const recommendation of recommendations) {
                report += `  - ${recommendation}\n`;
            }

            // タイムスタンプ
            report += `\n⏰ レポート作成日時: ${new Date().toISOString()}\n`;

            logger.info('Diagnostic report generated successfully');
            return report;
        } catch (error) {
            const errorMessage = `❌ 診断レポート生成に失敗: ${error instanceof Error ? error.message : String(error)}`;
            logger.error('Failed to generate diagnostic report', { error });
            return errorMessage;
        }
    }

    /**
     * 推奨事項を生成
     * @private
     */
    private generateRecommendations(
        storageResults: { files: { path: string; exists: boolean; size?: number }[]; errors: string[] },
        managerResults: { managers: { name: string; initialized: boolean; dataCount: number }[]; errors: string[] },
        overallHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL'
    ): string[] {
        const recommendations: string[] = [];

        // ファイル不存在の問題
        const missingFiles = storageResults.files.filter(f => !f.exists);
        if (missingFiles.length > 0) {
            recommendations.push(`${missingFiles.length}個の必要ファイルが見つかりません。ストレージ修復を実行してください。`);
        }

        // マネージャー初期化の問題
        const uninitializedManagers = managerResults.managers.filter(m => !m.initialized);
        if (uninitializedManagers.length > 0) {
            recommendations.push(`${uninitializedManagers.length}個のマネージャーが正常に初期化されていません。アプリケーションの再起動を検討してください。`);
        }

        // データ数の問題
        const managersWithoutData = managerResults.managers.filter(m => m.initialized && m.dataCount === 0);
        if (managersWithoutData.length > 2) {
            recommendations.push('複数のマネージャーにデータがありません。新しい章の追加を行ってください。');
        }

        // エラーの問題
        const totalErrors = storageResults.errors.length + managerResults.errors.length;
        if (totalErrors > 5) {
            recommendations.push('多数のエラーが検出されました。ログを確認し、システムの復旧を検討してください。');
        }

        // 全体的な健康状態に基づく推奨事項
        switch (overallHealth) {
            case 'CRITICAL':
                recommendations.push('システムが重篤な状態です。すぐにストレージ修復を実行し、必要に応じてデータのバックアップと復元を行ってください。');
                break;
            case 'WARNING':
                recommendations.push('いくつかの問題が検出されました。定期的な診断とメンテナンスを実行してください。');
                break;
            case 'HEALTHY':
                recommendations.push('システムは正常に動作しています。定期的な診断で状態を監視し続けてください。');
                break;
        }

        // ファイルサイズの問題
        const largeFiles = storageResults.files.filter(f => f.exists && f.size && f.size > 100000); // 100KB超
        if (largeFiles.length > 0) {
            recommendations.push('一部のストレージファイルが大きくなっています。古いデータのアーカイブを検討してください。');
        }

        const emptyFiles = storageResults.files.filter(f => f.exists && f.size === 0);
        if (emptyFiles.length > 0) {
            recommendations.push('空のファイルが検出されました。これらのファイルの修復または再生成を検討してください。');
        }

        return recommendations;
    }

    /**
     * ストレージ修復を試行
     */
    async repairStorage(
        chapterAnalysisManager: ChapterAnalysisManager,
        characterTrackingManager: CharacterTrackingManager,
        emotionalDynamicsManager: EmotionalDynamicsManager,
        narrativeStateManager: NarrativeStateManager,
        worldContextManager: WorldContextManager
    ): Promise<StorageRepairResult> {
        const repaired: string[] = [];
        const errors: string[] = [];
        const warnings: string[] = [];

        logger.info('Starting storage repair process');

        try {
            if (!this.initialized) {
                await this.initialize();
            }

            // 1. 診断を実行して問題を特定
            const diagnosis = await this.diagnoseStorage();
            const missingFiles = diagnosis.files.filter(f => !f.exists);

            if (missingFiles.length === 0) {
                logger.info('No missing files detected, no repair needed');
                return {
                    success: true,
                    repaired: ['診断の結果、修復が必要なファイルはありませんでした'],
                    errors: [],
                    warnings: []
                };
            }

            // 2. 欠落ファイルの修復
            for (const missingFile of missingFiles) {
                try {
                    await this.repairSingleFile(
                        missingFile.path,
                        chapterAnalysisManager,
                        characterTrackingManager,
                        emotionalDynamicsManager,
                        narrativeStateManager,
                        worldContextManager
                    );
                    repaired.push(missingFile.path);
                    logger.info(`Successfully repaired: ${missingFile.path}`);
                } catch (repairError) {
                    const errorMsg = `${missingFile.path}の修復に失敗: ${repairError instanceof Error ? repairError.message : String(repairError)}`;
                    errors.push(errorMsg);
                    logger.error(`Failed to repair ${missingFile.path}`, { error: repairError });
                }
            }

            // 3. マネージャーの再保存を試行
            try {
                await Promise.all([
                    chapterAnalysisManager.save(),
                    characterTrackingManager.save(),
                    emotionalDynamicsManager.save(),
                    narrativeStateManager.save(),
                    worldContextManager.save()
                ]);
                repaired.push('全マネージャーのデータ再保存');
                logger.info('All managers saved successfully during repair');
            } catch (saveError) {
                warnings.push(`マネージャー再保存中に警告: ${saveError instanceof Error ? saveError.message : String(saveError)}`);
            }

            const success = errors.length === 0;
            
            logger.info(`Storage repair completed. Success: ${success}, Repaired: ${repaired.length}, Errors: ${errors.length}`);

            return {
                success,
                repaired,
                errors,
                warnings
            };
        } catch (error) {
            logger.error('Storage repair process failed', { error });
            return {
                success: false,
                repaired,
                errors: [`修復プロセス全体でエラー: ${error instanceof Error ? error.message : String(error)}`, ...errors],
                warnings
            };
        }
    }

    /**
     * 単一ファイルの修復
     * @private
     */
    private async repairSingleFile(
        filePath: string,
        chapterAnalysisManager: ChapterAnalysisManager,
        characterTrackingManager: CharacterTrackingManager,
        emotionalDynamicsManager: EmotionalDynamicsManager,
        narrativeStateManager: NarrativeStateManager,
        worldContextManager: WorldContextManager
    ): Promise<void> {
        logger.debug(`Attempting to repair file: ${filePath}`);

        let defaultContent: string;

        // ファイルタイプに応じたデフォルトコンテンツの生成
        switch (filePath) {
            case 'narrative-memory/summaries.json':
                defaultContent = JSON.stringify([], null, 2);
                break;
                
            case 'narrative-memory/characters.json':
                defaultContent = JSON.stringify([], null, 2);
                break;
                
            case 'narrative-memory/emotional-dynamics.json':
                defaultContent = JSON.stringify({
                    tensionPoints: [],
                    tensionHistory: {},
                    emotionalTones: [],
                    chapterEmotions: {},
                    genre: 'classic',
                    syncMetricsData: {}
                }, null, 2);
                break;
                
            case 'narrative-memory/state.json':
                defaultContent = JSON.stringify({
                    currentState: 'INTRODUCTION',
                    currentArcNumber: 1,
                    currentTheme: '物語の始まり',
                    arcStartChapter: 1,
                    arcEndChapter: -1,
                    arcCompleted: false,
                    stateTransitions: [],
                    turningPoints: [],
                    genre: 'classic'
                }, null, 2);
                break;
                
            case 'narrative-memory/turning-points.json':
                defaultContent = JSON.stringify([], null, 2);
                break;
                
            case 'narrative-memory/world-context.json':
                defaultContent = JSON.stringify({
                    genre: 'classic',
                    previousLocation: '',
                    currentLocation: '',
                    currentTimeOfDay: '',
                    currentWeather: ''
                }, null, 2);
                break;
                
            default:
                throw new Error(`Unknown file type: ${filePath}`);
        }

        // ファイルの作成
        try {
            await storageProvider.writeFile(filePath, defaultContent);
            logger.debug(`Successfully created default file: ${filePath}`);
        } catch (writeError) {
            throw new Error(`Failed to write default content to ${filePath}: ${writeError}`);
        }

        // ファイル作成後の検証
        try {
            const verifyContent = await storageProvider.readFile(filePath);
            JSON.parse(verifyContent); // JSON解析可能か確認
            logger.debug(`Successfully verified repaired file: ${filePath}`);
        } catch (verifyError) {
            throw new Error(`Failed to verify repaired file ${filePath}: ${verifyError}`);
        }
    }

    /**
     * 特定のマネージャーの健康状態を確認
     */
    async checkManagerHealth(managerName: string, manager: IManager): Promise<{
        healthy: boolean;
        errors: string[];
        warnings: string[];
    }> {
        const errors: string[] = [];
        const warnings: string[] = [];

        try {
            // 基本的な操作テスト
            await manager.initialize();
            await manager.save();
            
            logger.debug(`Manager ${managerName} health check passed`);
            return {
                healthy: true,
                errors: [],
                warnings: []
            };
        } catch (error) {
            const errorMsg = `${managerName} health check failed: ${error instanceof Error ? error.message : String(error)}`;
            errors.push(errorMsg);
            logger.warn(`Manager health check failed for ${managerName}`, { error });
            
            return {
                healthy: false,
                errors,
                warnings
            };
        }
    }

    /**
     * システム全体のクリーンアップ
     */
    async cleanup(): Promise<{
        success: boolean;
        cleaned: string[];
        errors: string[];
    }> {
        const cleaned: string[] = [];
        const errors: string[] = [];

        try {
            logger.info('Starting system cleanup');

            // 一時ファイルやテストファイルの削除
            const tempFiles = [
                'diagnostic-test.json',
                'temp-diagnostic.json',
                'backup-test.json'
            ];

            for (const tempFile of tempFiles) {
                try {
                    if (await storageProvider.fileExists(tempFile)) {
                        if (typeof (storageProvider as any).deleteFile === 'function') {
                            await (storageProvider as any).deleteFile(tempFile);
                            cleaned.push(tempFile);
                        }
                    }
                } catch (deleteError) {
                    errors.push(`Failed to delete ${tempFile}: ${deleteError}`);
                }
            }

            logger.info(`Cleanup completed. Cleaned: ${cleaned.length}, Errors: ${errors.length}`);

            return {
                success: errors.length === 0,
                cleaned,
                errors
            };
        } catch (error) {
            logger.error('Cleanup process failed', { error });
            return {
                success: false,
                cleaned,
                errors: [`Cleanup process error: ${error}`, ...errors]
            };
        }
    }
}