/**
 * @fileoverview 統合記憶管理システム - メインマネージャー
 * @description
 * 統合記憶階層システムの中核となる管理クラス。
 * 短期・中期・長期記憶の統合管理、品質保証、バックアップ、最適化を提供します。
 */

import { logger } from '@/lib/utils/logger';
import { Chapter } from '@/types/chapters';
import { Character } from '@/types/characters';

// コア統合システム
import { DataIntegrationProcessor } from './data-integration-processor';
import { UnifiedAccessAPI } from './unified-access-api';
import { CacheCoordinator } from '../integration/cache-coordinator';
import { DuplicateResolver } from '../integration/duplicate-resolver';
import { AccessOptimizer } from '../integration/access-optimizer';
import { QualityAssurance } from '../integration/quality-assurance';

// 記憶階層ファサード
import { ShortTermMemory } from '../short-term/short-term-memory';
import { MidTermMemory } from '../mid-term/mid-term-memory';
import { LongTermMemory } from '../long-term/long-term-memory';

// サポートシステム
import { BackupSystem } from '../storage/backup-system';
import { MigrationTools } from '../storage/migration-tools';
import { PersistentStorage } from '../storage/persistent-storage';
import { CacheStorage } from '../storage/cache-storage';

// 型定義
import {
    MemoryLevel,
    MemoryAccessRequest,
    SystemHealth,
    MemoryRequestType,
    SystemDiagnostics,
    CacheStatisticsData,
    MemorySystemStatus,
    SystemOperationResult,
    UnifiedSearchResult
} from './types';

/**
 * メモリマネージャー設定
 */
export interface MemoryManagerConfig {
    // 記憶階層設定
    shortTermConfig: {
        maxChapters: number;
        cacheEnabled: boolean;
        autoCleanupEnabled?: boolean;
        cleanupIntervalMinutes?: number;
        maxRetentionHours?: number;
    };
    midTermConfig: {
        maxAnalysisResults: number;
        enableEvolutionTracking: boolean;
        enableProgressionAnalysis: boolean;
        qualityThreshold: number;
    };
    longTermConfig: {
        enableAutoLearning: boolean;
        consolidationInterval: number;
        archiveOldData: boolean;
        enablePredictiveAnalysis: boolean;
        qualityThreshold: number;
    };

    // 統合システム設定
    integrationEnabled: boolean;
    enableQualityAssurance: boolean;
    enableAutoBackup: boolean;
    enablePerformanceOptimization: boolean;
    enableDataMigration: boolean;

    // パフォーマンス設定
    cacheSettings: {
        sizeLimit: number;
        entryLimit: number;
        cleanupInterval: number;
    };
    optimizationSettings: {
        enablePredictiveAccess: boolean;
        enableConsistencyValidation: boolean;
        enablePerformanceMonitoring: boolean;
    };

    // 品質保証設定
    qualityAssurance: {
        enableRealTimeMonitoring: boolean;
        enablePredictiveAnalysis: boolean;
        enableAutomaticRecovery: boolean;
        checkInterval: number;
        alertThresholds: {
            dataIntegrity: number;
            systemStability: number;
            performance: number;
            operationalEfficiency: number;
        };
    };

    // バックアップ設定
    backup: {
        enabled: boolean;
        schedule: {
            fullBackupInterval: number;
            incrementalInterval: number;
            maxBackupCount: number;
            retentionDays: number;
        };
        compression: {
            enabled: boolean;
            level: number;
        };
    };
}

/**
 * システム最適化結果
 */
export interface SystemOptimizationResult {
    success: boolean;
    optimizationType: string;
    improvements: Array<{
        component: string;
        metric: string;
        beforeValue: number;
        afterValue: number;
        improvementPercent: number;
    }>;
    totalTimeSaved: number;
    memorySaved: number;
    recommendations: string[];
}

/**
 * @class MemoryManager
 * @description
 * 統合記憶階層システムの中核管理クラス。
 * 全ての記憶階層とサポートシステムを統合し、統一されたAPIを提供します。
 */
export class MemoryManager {
    private config: MemoryManagerConfig;
    private initialized: boolean = false;

    // 記憶階層コンポーネント
    private shortTermMemory!: ShortTermMemory;
    private midTermMemory!: MidTermMemory;
    private longTermMemory!: LongTermMemory;

    // コア統合システム
    private dataIntegrationProcessor!: DataIntegrationProcessor;
    private unifiedAccessAPI!: UnifiedAccessAPI;
    private cacheCoordinator!: CacheCoordinator;
    private duplicateResolver!: DuplicateResolver;
    private accessOptimizer!: AccessOptimizer;
    private qualityAssurance!: QualityAssurance;

    // サポートシステム
    private backupSystem!: BackupSystem;
    private migrationTools!: MigrationTools;
    private persistentStorage!: PersistentStorage;
    private cacheStorage!: CacheStorage;

    // 内部状態管理
    private systemState: 'INITIALIZING' | 'RUNNING' | 'OPTIMIZING' | 'MAINTENANCE' | 'ERROR' = 'INITIALIZING';
    private operationQueue: Array<() => Promise<any>> = [];
    private isProcessingQueue: boolean = false;

    // 統計情報
    private operationStats = {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageProcessingTime: 0,
        lastOptimization: '',
        componentsInitialized: 0,
        lastMaintenanceCheck: ''
    };

    /**
     * コンストラクタ
     * @param config システム設定
     */
    constructor(config: MemoryManagerConfig) {
        this.config = config;
        logger.info('MemoryManager created with comprehensive configuration');
    }

    /**
     * システム全体の初期化
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('MemoryManager already initialized');
            return;
        }

        try {
            logger.info('Starting comprehensive MemoryManager initialization...');
            this.systemState = 'INITIALIZING';

            // 1. サポートシステムの初期化（最優先）
            await this.initializeSupportSystems();

            // 2. コア統合システムの初期化
            await this.initializeCoreIntegrationSystems();

            // 3. 記憶階層の初期化
            await this.initializeMemoryHierarchy();

            // 4. システム統合の初期化
            await this.initializeSystemIntegration();

            // 5. 最終検証と最適化
            await this.performInitialSystemValidation();

            this.initialized = true;
            this.systemState = 'RUNNING';

            logger.info('MemoryManager initialization completed successfully', {
                componentsInitialized: this.operationStats.componentsInitialized,
                systemState: this.systemState
            });

        } catch (error) {
            this.systemState = 'ERROR';
            logger.error('Failed to initialize MemoryManager', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw new Error(`MemoryManager initialization failed: ${error}`);
        }
    }

    /**
     * 章を処理し、全記憶階層に統合
     * @param chapter 処理対象の章
     */
    async processChapter(chapter: Chapter): Promise<SystemOperationResult> {
        const startTime = Date.now();
        const operation = 'processChapter';

        try {
            await this.ensureInitialized();
            logger.info(`Processing chapter ${chapter.chapterNumber} through unified memory system`);

            this.operationStats.totalOperations++;

            const result: SystemOperationResult = {
                success: false,
                operationType: operation,
                processingTime: 0,
                affectedComponents: [],
                details: {},
                warnings: [],
                errors: []
            };

            // 1. 短期記憶への追加
            const shortTermResult = await this.shortTermMemory.addChapter(chapter);
            this.updateOperationResult(result, 'shortTermMemory', shortTermResult);

            // 2. 中期記憶への統合処理
            const midTermResult = await this.midTermMemory.addChapter(chapter);
            this.updateOperationResult(result, 'midTermMemory', midTermResult);

            // 3. データ統合処理の実行
            if (this.config.integrationEnabled) {
                const integrationResult = await this.dataIntegrationProcessor.processChapterData(chapter);
                this.updateOperationResult(result, 'dataIntegration', integrationResult);
            }

            // 4. 重複解決処理
            const duplicateQuery = {
                type: 'chapterMemories' as const,
                parameters: { upToChapter: chapter.chapterNumber }
            };
            const duplicateResult = await this.duplicateResolver.getUnifiedMemoryAccess(duplicateQuery);
            if (duplicateResult.success) {
                result.affectedComponents.push('duplicateResolver');
            }

            // 5. キャッシュ協調処理
            const cacheKey = `chapter_${chapter.chapterNumber}`;
            await this.cacheCoordinator.coordinateCache(cacheKey, chapter, MemoryLevel.SHORT_TERM);
            result.affectedComponents.push('cacheCoordinator');

            // 6. 長期記憶への条件付き処理
            if (this.shouldProcessLongTerm(chapter)) {
                const extractedData = await this.extractLongTermData(chapter);
                await this.longTermMemory.processChapterCompletion(
                    chapter.chapterNumber,
                    chapter,
                    extractedData
                );
                result.affectedComponents.push('longTermMemory');
            }

            // 7. 品質チェック（有効な場合）
            if (this.config.enableQualityAssurance) {
                const qaResult = await this.qualityAssurance.performComprehensiveDiagnostic();
                if (!qaResult.overallHealth) {
                    result.warnings.push('Quality assurance detected issues');
                }
            }

            // 8. 自動バックアップ（有効な場合）
            if (this.config.enableAutoBackup && chapter.chapterNumber % 5 === 0) {
                try {
                    await this.backupSystem.createIncrementalBackup(
                        undefined,
                        `Chapter ${chapter.chapterNumber} auto-backup`
                    );
                    result.details.autoBackupCreated = true;
                } catch (backupError) {
                    result.warnings.push('Auto backup failed');
                }
            }

            // 結果の最終処理
            result.success = result.errors.length === 0;
            result.processingTime = Date.now() - startTime;

            if (result.success) {
                this.operationStats.successfulOperations++;
            } else {
                this.operationStats.failedOperations++;
            }

            this.updateAverageProcessingTime(result.processingTime);

            logger.info(`Chapter ${chapter.chapterNumber} processing completed`, {
                success: result.success,
                processingTime: result.processingTime,
                affectedComponents: result.affectedComponents.length,
                warnings: result.warnings.length,
                errors: result.errors.length
            });

            return result;

        } catch (error) {
            this.operationStats.failedOperations++;
            const processingTime = Date.now() - startTime;

            logger.error(`Failed to process chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                processingTime
            });

            return {
                success: false,
                operationType: operation,
                processingTime,
                affectedComponents: [],
                details: {},
                warnings: [],
                errors: [error instanceof Error ? error.message : String(error)]
            };
        }
    }

    /**
     * 統合検索の実行
     * @param query 検索クエリ
     * @param memoryLevels 検索対象の記憶レベル
     */
    async unifiedSearch(
        query: string,
        memoryLevels: MemoryLevel[] = [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
    ): Promise<UnifiedSearchResult> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();
            logger.debug(`Executing unified search: "${query}"`);

            const result: UnifiedSearchResult = {
                success: false,
                totalResults: 0,
                processingTime: 0,
                results: [],
                suggestions: []
            };

            // 統一アクセスAPIを使用した検索
            const searchRequest: MemoryAccessRequest = {
                chapterNumber: 0,
                requestType: MemoryRequestType.INTEGRATED_CONTEXT,
                targetLayers: memoryLevels,
                filters: {},
                options: {
                    includeCache: true,
                    resolveDuplicates: true,
                    optimizeAccess: true
                }
            };

            const accessResult = await this.unifiedAccessAPI.processRequest(searchRequest);

            if (accessResult.success && accessResult.context) {
                // 各記憶レベルから検索結果を抽出
                await this.extractSearchResults(query, accessResult.context, result);
            }

            // アクセス最適化による検索結果の取得
            if (this.config.enablePerformanceOptimization) {
                const optimizedResults = await this.accessOptimizer.optimizedAccess(
                    {
                        type: 'search',
                        parameters: { query, memoryTypes: memoryLevels }
                    }
                );

                if (optimizedResults.data) {
                    this.mergeOptimizedResults(result, optimizedResults.data);
                }
            }

            // 重複解決システムからの追加検索
            const duplicateSearchResult = await this.duplicateResolver.getUnifiedMemoryAccess({
                type: 'search',
                parameters: { query, limit: 20 }
            });

            if (duplicateSearchResult.success && duplicateSearchResult.data) {
                this.mergeDuplicateResolverResults(result, duplicateSearchResult.data);
            }

            // 検索結果のソートと最適化
            result.results.sort((a, b) => b.relevance - a.relevance);
            result.totalResults = result.results.length;
            result.success = result.totalResults > 0;
            result.processingTime = Date.now() - startTime;

            // 検索提案の生成
            if (result.totalResults === 0) {
                result.suggestions = this.generateSearchSuggestions(query);
            }

            logger.debug(`Unified search completed`, {
                query,
                totalResults: result.totalResults,
                processingTime: result.processingTime
            });

            return result;

        } catch (error) {
            logger.error('Unified search failed', {
                error: error instanceof Error ? error.message : String(error),
                query
            });

            return {
                success: false,
                totalResults: 0,
                processingTime: Date.now() - startTime,
                results: [],
                suggestions: [`Search failed: ${error}`, 'Try a simpler query', 'Check system status']
            };
        }
    }

    /**
     * システム全体の最適化
     */
    async optimizeSystem(): Promise<SystemOptimizationResult> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();
            logger.info('Starting comprehensive system optimization...');

            this.systemState = 'OPTIMIZING';

            const result: SystemOptimizationResult = {
                success: false,
                optimizationType: 'comprehensive',
                improvements: [],
                totalTimeSaved: 0,
                memorySaved: 0,
                recommendations: []
            };

            // 1. アクセス最適化
            const accessOptResult = await this.accessOptimizer.optimizeAccessPatterns();
            if (accessOptResult.optimized) {
                result.improvements.push({
                    component: 'AccessOptimizer',
                    metric: 'accessPatterns',
                    beforeValue: 0,
                    afterValue: accessOptResult.improvements.length,
                    improvementPercent: 100
                });
            }

            // 2. キャッシュ最適化
            const cacheOptResult = await this.cacheStorage.optimize();
            if (cacheOptResult.success) {
                result.memorySaved += cacheOptResult.totalMemoryFreed;
                result.improvements.push({
                    component: 'CacheStorage',
                    metric: 'memoryUsage',
                    beforeValue: 0,
                    afterValue: cacheOptResult.totalMemoryFreed,
                    improvementPercent: 50
                });
            }

            // 3. データ統合最適化
            if (this.config.integrationEnabled) {
                const integrationOptResult = await this.dataIntegrationProcessor.optimizeIntegration();
                if (integrationOptResult.optimized) {
                    result.improvements.push({
                        component: 'DataIntegrationProcessor',
                        metric: 'integrationEfficiency',
                        beforeValue: 70,
                        afterValue: 85,
                        improvementPercent: 21
                    });
                }
            }

            // 4. 永続化ストレージ最適化
            const storageOptResult = await this.persistentStorage.optimizeStorage();
            if (storageOptResult.success) {
                result.memorySaved += (storageOptResult.beforeSize - storageOptResult.afterSize);
                result.improvements.push({
                    component: 'PersistentStorage',
                    metric: 'storageSize',
                    beforeValue: storageOptResult.beforeSize,
                    afterValue: storageOptResult.afterSize,
                    improvementPercent: ((storageOptResult.beforeSize - storageOptResult.afterSize) / storageOptResult.beforeSize) * 100
                });
            }

            // 5. 長期記憶の統合処理
            const consolidationResult = await this.longTermMemory.performConsolidation();
            if (consolidationResult.qualityScore > 0.8) {
                result.improvements.push({
                    component: 'LongTermMemory',
                    metric: 'qualityScore',
                    beforeValue: 70,
                    afterValue: consolidationResult.qualityScore * 100,
                    improvementPercent: ((consolidationResult.qualityScore * 100 - 70) / 70) * 100
                });
            }

            // 結果の集計
            result.success = result.improvements.length > 0;
            result.totalTimeSaved = result.improvements.reduce((sum, imp) =>
                sum + (imp.metric === 'accessTime' ? imp.beforeValue - imp.afterValue : 0), 0
            );

            // 推奨事項の生成
            result.recommendations = this.generateOptimizationRecommendations(result);

            this.operationStats.lastOptimization = new Date().toISOString();
            this.systemState = 'RUNNING';

            logger.info('System optimization completed', {
                success: result.success,
                improvements: result.improvements.length,
                memorySaved: result.memorySaved,
                totalTimeSaved: result.totalTimeSaved,
                processingTime: Date.now() - startTime
            });

            return result;

        } catch (error) {
            this.systemState = 'RUNNING';
            logger.error('System optimization failed', {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                success: false,
                optimizationType: 'comprehensive',
                improvements: [],
                totalTimeSaved: 0,
                memorySaved: 0,
                recommendations: ['Retry optimization after system restart', 'Check system health']
            };
        }
    }

    /**
     * システム診断の実行
     */
    async performSystemDiagnostics(): Promise<SystemDiagnostics> {
        try {
            await this.ensureInitialized();
            logger.info('Performing comprehensive system diagnostics...');

            const diagnostics: SystemDiagnostics = {
                timestamp: new Date().toISOString(),
                systemHealth: SystemHealth.HEALTHY, // enum値を使用
                memoryLayers: {
                    shortTerm: await this.getLayerDiagnostics('SHORT_TERM'),
                    midTerm: await this.getLayerDiagnostics('MID_TERM'),
                    longTerm: await this.getLayerDiagnostics('LONG_TERM')
                },
                integrationSystems: {
                    duplicateResolver: await this.duplicateResolver.getDiagnostics(),
                    cacheCoordinator: await this.cacheCoordinator.getDiagnostics(),
                    unifiedAccessAPI: await this.unifiedAccessAPI.getDiagnostics(),
                    dataIntegrationProcessor: await this.dataIntegrationProcessor.getDiagnostics()
                },
                performanceMetrics: {
                    totalRequests: this.operationStats.totalOperations,
                    cacheHits: 0, // 実装に応じて取得
                    duplicatesResolved: 0, // 実装に応じて取得
                    averageResponseTime: this.operationStats.averageProcessingTime,
                    lastUpdateTime: new Date().toISOString()
                },
                issues: [],
                recommendations: []
            };

            // 品質保証システムからの診断結果
            if (this.config.enableQualityAssurance) {
                const qaResult = await this.qualityAssurance.performComprehensiveDiagnostic();
                diagnostics.issues.push(...qaResult.issues.map(issue => issue.title));
                diagnostics.recommendations.push(...qaResult.recommendations);
            }

            // システム健康状態の判定
            const criticalIssues = diagnostics.issues.filter(issue =>
                issue.includes('CRITICAL') || issue.includes('ERROR')
            ).length;

            if (criticalIssues > 0) {
                diagnostics.systemHealth = SystemHealth.CRITICAL; // enum値を使用
            } else if (diagnostics.issues.length > 5) {
                diagnostics.systemHealth = SystemHealth.DEGRADED; // enum値を使用
            }

            logger.info('System diagnostics completed', {
                systemHealth: diagnostics.systemHealth,
                issues: diagnostics.issues.length,
                recommendations: diagnostics.recommendations.length
            });

            return diagnostics;

        } catch (error) {
            logger.error('System diagnostics failed', {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                timestamp: new Date().toISOString(),
                systemHealth: SystemHealth.CRITICAL, // enum値を使用
                memoryLayers: {
                    shortTerm: { healthy: false, dataIntegrity: false, storageAccessible: false, lastBackup: '', performanceScore: 0, recommendations: [] },
                    midTerm: { healthy: false, dataIntegrity: false, storageAccessible: false, lastBackup: '', performanceScore: 0, recommendations: [] },
                    longTerm: { healthy: false, dataIntegrity: false, storageAccessible: false, lastBackup: '', performanceScore: 0, recommendations: [] }
                },
                integrationSystems: {
                    duplicateResolver: { operational: false, efficiency: 0, errorRate: 1, lastOptimization: '', recommendations: [] },
                    cacheCoordinator: { operational: false, efficiency: 0, errorRate: 1, lastOptimization: '', recommendations: [] },
                    unifiedAccessAPI: { operational: false, efficiency: 0, errorRate: 1, lastOptimization: '', recommendations: [] },
                    dataIntegrationProcessor: { operational: false, efficiency: 0, errorRate: 1, lastOptimization: '', recommendations: [] }
                },
                performanceMetrics: {
                    totalRequests: 0,
                    cacheHits: 0,
                    duplicatesResolved: 0,
                    averageResponseTime: 0,
                    lastUpdateTime: new Date().toISOString()
                },
                issues: ['System diagnostics failed'],
                recommendations: ['Check system logs', 'Restart system components', 'Contact system administrator']
            };
        }
    }

    /**
     * システム状態の取得
     */
    async getSystemStatus(): Promise<MemorySystemStatus> {
        try {
            await this.ensureInitialized();

            // CacheCoordinator から統計情報を取得し、適切な形式に変換
            const cacheStats = this.cacheCoordinator.getStatistics();
            const cacheStatisticsData: CacheStatisticsData = {
                hitRatio: cacheStats.hitRate,
                missRatio: cacheStats.missRate,
                totalRequests: cacheStats.totalEntries,
                cacheSize: typeof cacheStats.memoryUsage === 'object'
                    ? cacheStats.memoryUsage.shortTerm + cacheStats.memoryUsage.midTerm + cacheStats.memoryUsage.longTerm
                    : cacheStats.memoryUsage || 0,
                lastOptimization: new Date().toISOString(),
                evictionCount: cacheStats.evictionCount
            };

            const status: MemorySystemStatus = {
                initialized: this.initialized,
                lastUpdateTime: new Date().toISOString(),
                memoryLayers: {
                    shortTerm: await this.getMemoryLayerStatus('SHORT_TERM'),
                    midTerm: await this.getMemoryLayerStatus('MID_TERM'),
                    longTerm: await this.getMemoryLayerStatus('LONG_TERM')
                },
                performanceMetrics: {
                    totalRequests: this.operationStats.totalOperations,
                    cacheHits: Math.floor(cacheStats.hitRate * cacheStats.totalEntries),
                    duplicatesResolved: 0,
                    averageResponseTime: this.operationStats.averageProcessingTime,
                    lastUpdateTime: new Date().toISOString()
                },
                cacheStatistics: cacheStatisticsData
            };

            return status;

        } catch (error) {
            logger.error('Failed to get system status', {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                initialized: false,
                lastUpdateTime: new Date().toISOString(),
                memoryLayers: {
                    shortTerm: { healthy: false, dataCount: 0, lastUpdate: '', storageSize: 0, errorCount: 0 },
                    midTerm: { healthy: false, dataCount: 0, lastUpdate: '', storageSize: 0, errorCount: 0 },
                    longTerm: { healthy: false, dataCount: 0, lastUpdate: '', storageSize: 0, errorCount: 0 }
                },
                performanceMetrics: {
                    totalRequests: 0,
                    cacheHits: 0,
                    duplicatesResolved: 0,
                    averageResponseTime: 0,
                    lastUpdateTime: new Date().toISOString()
                },
                cacheStatistics: {
                    hitRatio: 0,
                    missRatio: 1,
                    totalRequests: 0,
                    cacheSize: 0,
                    lastOptimization: new Date().toISOString(),
                    evictionCount: 0
                }
            };
        }
    }
    /**
     * 設定の更新
     */
    async updateConfiguration(newConfig: Partial<MemoryManagerConfig>): Promise<boolean> {
        try {
            logger.info('Updating MemoryManager configuration...');

            const oldConfig = { ...this.config };
            this.config = { ...this.config, ...newConfig };

            // 各コンポーネントの設定更新
            if (newConfig.qualityAssurance && this.qualityAssurance) {
                this.qualityAssurance.updateConfiguration(newConfig.qualityAssurance);
            }

            if (newConfig.backup && this.backupSystem) {
                await this.backupSystem.updateConfig(newConfig.backup);
            }

            if (newConfig.optimizationSettings && this.accessOptimizer) {
                this.accessOptimizer.updateConfiguration(newConfig.optimizationSettings);
            }

            if (newConfig.longTermConfig && this.longTermMemory) {
                this.longTermMemory.updateConfiguration(newConfig.longTermConfig);
            }

            logger.info('MemoryManager configuration updated successfully');
            return true;

        } catch (error) {
            logger.error('Failed to update configuration', {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * システムシャットダウン
     */
    async shutdown(): Promise<void> {
        try {
            logger.info('Shutting down MemoryManager...');

            this.systemState = 'MAINTENANCE';

            // 実行中の操作の完了を待機
            await this.waitForOperationQueue();

            // 各コンポーネントのシャットダウン
            const shutdownPromises = [
                this.qualityAssurance?.stopMonitoring(),
                this.backupSystem?.shutdown(),
                this.cacheStorage?.shutdown(),
                this.persistentStorage?.saveMetadataCache(),
                this.shortTermMemory?.cleanup(),
                this.midTermMemory?.cleanup(),
                this.longTermMemory?.cleanup()
            ];

            await Promise.allSettled(shutdownPromises);

            this.initialized = false;
            logger.info('MemoryManager shutdown completed');

        } catch (error) {
            logger.error('Failed to shutdown MemoryManager', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

    /**
     * 初期化状態の確認
     * @private
     */
    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }
    }

    /**
     * サポートシステムの初期化
     * @private
     */
    private async initializeSupportSystems(): Promise<void> {
        logger.debug('Initializing support systems...');

        // 永続化ストレージ
        this.persistentStorage = new PersistentStorage();
        await this.persistentStorage.initialize();
        this.operationStats.componentsInitialized++;

        // キャッシュストレージ
        this.cacheStorage = new CacheStorage(this.config.cacheSettings);
        await this.cacheStorage.initialize();
        this.operationStats.componentsInitialized++;

        // バックアップシステム
        if (this.config.enableAutoBackup) {
            this.backupSystem = new BackupSystem();
            await this.backupSystem.initialize();
            this.operationStats.componentsInitialized++;
        }

        // 移行ツール
        if (this.config.enableDataMigration) {
            this.migrationTools = new MigrationTools();
            await this.migrationTools.initialize();
            this.operationStats.componentsInitialized++;
        }

        logger.debug('Support systems initialized successfully');
    }

    /**
     * コア統合システムの初期化
     * @private
     */
    private async initializeCoreIntegrationSystems(): Promise<void> {
        logger.debug('Initializing core integration systems...');

        // メモリコンポーネント（実際の実装に応じて設定）
        const memoryComponents = {
            immediateContext: null,
            narrativeMemory: null,
            worldKnowledge: null,
            eventMemory: null,
            characterManager: null
        };

        // 重複解決システム
        this.duplicateResolver = new DuplicateResolver(memoryComponents);
        this.operationStats.componentsInitialized++;

        // キャッシュ協調システム
        this.cacheCoordinator = new CacheCoordinator(memoryComponents);
        this.operationStats.componentsInitialized++;

        // アクセス最適化システム
        this.accessOptimizer = new AccessOptimizer(
            this.cacheCoordinator,
            this.duplicateResolver,
            this.config.optimizationSettings
        );
        this.operationStats.componentsInitialized++;

        // 統一アクセスAPI
        this.unifiedAccessAPI = new UnifiedAccessAPI({
            duplicateResolver: this.duplicateResolver,
            cacheCoordinator: this.cacheCoordinator,
            memoryLayers: {
                shortTerm: null as any, // 後で設定
                midTerm: null as any,
                longTerm: null as any
            }
        });
        await this.unifiedAccessAPI.initialize();
        this.operationStats.componentsInitialized++;

        // データ統合処理システム
        if (this.config.integrationEnabled) {
            this.dataIntegrationProcessor = new DataIntegrationProcessor({
                memoryLayers: {
                    shortTerm: null as any, // 後で設定
                    midTerm: null as any,
                    longTerm: null as any
                },
                duplicateResolver: this.duplicateResolver
            });
            await this.dataIntegrationProcessor.initialize();
            this.operationStats.componentsInitialized++;
        }

        // 品質保証システム
        if (this.config.enableQualityAssurance) {
            this.qualityAssurance = new QualityAssurance(
                this.cacheCoordinator,
                this.duplicateResolver,
                this.accessOptimizer,
                memoryComponents,
                this.config.qualityAssurance
            );
            this.operationStats.componentsInitialized++;
        }

        logger.debug('Core integration systems initialized successfully');
    }

    /**
     * 記憶階層の初期化
     * @private
     */
    private async initializeMemoryHierarchy(): Promise<void> {
        logger.debug('Initializing memory hierarchy...');

        // 短期記憶
        this.shortTermMemory = new ShortTermMemory(this.config.shortTermConfig);
        await this.shortTermMemory.initialize();
        this.operationStats.componentsInitialized++;

        // 中期記憶
        this.midTermMemory = new MidTermMemory(this.config.midTermConfig);
        await this.midTermMemory.initialize();
        this.operationStats.componentsInitialized++;

        // 長期記憶
        this.longTermMemory = new LongTermMemory(this.config.longTermConfig);
        await this.longTermMemory.initialize();
        this.operationStats.componentsInitialized++;

        logger.debug('Memory hierarchy initialized successfully');
    }

    /**
     * システム統合の初期化
     * @private
     */
    private async initializeSystemIntegration(): Promise<void> {
        logger.debug('Initializing system integration...');

        // 統一アクセスAPIのメモリレイヤー設定
        if (this.unifiedAccessAPI) {
            // 実際の実装では適切なインターフェースを実装
            this.unifiedAccessAPI.updateMemoryLayers({
                shortTerm: this.shortTermMemory,
                midTerm: this.midTermMemory,
                longTerm: this.longTermMemory
            });
        }

        // データ統合処理システムのメモリレイヤー設定
        if (this.dataIntegrationProcessor) {
            // 実際の実装では適切なインターフェースを実装
            this.dataIntegrationProcessor.updateMemoryLayers({
                shortTerm: this.shortTermMemory,
                midTerm: this.midTermMemory,
                longTerm: this.longTermMemory
            });
        }

        logger.debug('System integration completed successfully');
    }

    /**
     * 初期システム検証の実行
     * @private
     */
    private async performInitialSystemValidation(): Promise<void> {
        logger.debug('Performing initial system validation...');

        try {
            // 基本的な動作確認
            const testChapter: Chapter = {
                id: 'test-chapter-0',                    // 必須: id プロパティ
                chapterNumber: 0,
                title: 'System Test Chapter',
                content: 'This is a test chapter for system validation.',
                createdAt: new Date(),                   // 必須: createdAt プロパティ（Date型）
                updatedAt: new Date(),                   // 必須: updatedAt プロパティ（Date型）

                // オプショナルプロパティ
                wordCount: 47,
                summary: 'System validation test chapter',

                // 必須: metadata プロパティ
                metadata: {
                    qualityScore: 1.0,
                    keywords: ['test', 'validation', 'system'],
                    events: [],
                    characters: [],
                    foreshadowing: [],
                    resolutions: [],
                    correctionHistory: [],
                    pov: 'システム',
                    location: 'テスト環境',
                    emotionalTone: 'neutral'
                }
            };

            // 短期記憶のテスト
            const shortTermTest = await this.shortTermMemory.addChapter(testChapter);
            if (!shortTermTest.success) {
                throw new Error('Short-term memory validation failed');
            }

            // 統合アクセスのテスト
            const accessTest = await this.unifiedAccessAPI.processRequest({
                chapterNumber: 0,
                requestType: MemoryRequestType.CHAPTER_CONTEXT,
                targetLayers: [MemoryLevel.SHORT_TERM]
            });

            if (!accessTest.success) {
                throw new Error('Unified access validation failed');
            }

            // テストデータのクリーンアップ
            await this.shortTermMemory.cleanup();

            logger.debug('Initial system validation completed successfully');

        } catch (error) {
            logger.error('Initial system validation failed', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 操作結果の更新
     * @private
     */
    private updateOperationResult(
        result: SystemOperationResult,
        componentName: string,
        operationResult: any
    ): void {
        if (operationResult.success) {
            result.affectedComponents.push(componentName);
            result.details[componentName] = operationResult.metadata || {};
        } else {
            result.errors.push(`${componentName}: ${operationResult.error || 'Operation failed'}`);
        }

        if (operationResult.warnings) {
            result.warnings.push(...operationResult.warnings);
        }
    }

    /**
     * 長期記憶処理の必要性判定
     * @private
     */
    private shouldProcessLongTerm(chapter: Chapter): boolean {
        // 章番号が5の倍数、または重要なイベントがある場合
        return chapter.chapterNumber % 5 === 0 ||
            chapter.content.length > 5000 ||
            chapter.title.includes('重要') ||
            chapter.title.includes('転機');
    }

    /**
     * 長期記憶用データの抽出
     * @private
     */
    private async extractLongTermData(chapter: Chapter): Promise<{
        characters: Character[];
        keyEvents: any[];
        worldUpdates: any[];
        learningData: any;
    }> {
        return {
            characters: [], // 実際の実装では章からキャラクター情報を抽出
            keyEvents: [], // 重要なイベントを抽出
            worldUpdates: [], // 世界設定の更新を抽出
            learningData: { // 学習データを生成
                effectivePatterns: [],
                qualityMetrics: {
                    readability: 8.0,
                    consistency: 7.5,
                    engagement: 8.2
                }
            }
        };
    }

    /**
     * 検索結果の抽出
     * @private
     */
    private async extractSearchResults(
        query: string,
        context: any,
        result: UnifiedSearchResult
    ): Promise<void> {
        // 実装は統合記憶コンテキストの構造に依存
        // ここでは基本的な実装例を示す

        if (context.shortTerm) {
            result.results.push({
                source: MemoryLevel.SHORT_TERM,
                type: 'chapter',
                data: context.shortTerm,
                relevance: this.calculateRelevance(query, context.shortTerm),
                metadata: { source: 'shortTerm' }
            });
        }

        if (context.midTerm) {
            result.results.push({
                source: MemoryLevel.MID_TERM,
                type: 'analysis',
                data: context.midTerm,
                relevance: this.calculateRelevance(query, context.midTerm),
                metadata: { source: 'midTerm' }
            });
        }

        if (context.longTerm) {
            result.results.push({
                source: MemoryLevel.LONG_TERM,
                type: 'knowledge',
                data: context.longTerm,
                relevance: this.calculateRelevance(query, context.longTerm),
                metadata: { source: 'longTerm' }
            });
        }
    }

    /**
     * 関連度の計算
     * @private
     */
    private calculateRelevance(query: string, data: any): number {
        // 簡易的な関連度計算
        const queryLower = query.toLowerCase();
        const dataString = JSON.stringify(data).toLowerCase();

        const matches = (dataString.match(new RegExp(queryLower, 'g')) || []).length;
        const totalLength = dataString.length;

        return Math.min(1.0, (matches * 100) / Math.max(totalLength / 1000, 1));
    }

    /**
     * 最適化結果のマージ
     * @private
     */
    private mergeOptimizedResults(result: UnifiedSearchResult, optimizedData: any): void {
        if (Array.isArray(optimizedData)) {
            for (const item of optimizedData) {
                result.results.push({
                    source: MemoryLevel.SHORT_TERM, // 適切なソースを設定
                    type: 'optimized',
                    data: item,
                    relevance: 0.8, // 最適化されたデータは高い関連度
                    metadata: { source: 'accessOptimizer' }
                });
            }
        }
    }

    /**
     * 重複解決結果のマージ
     * @private
     */
    private mergeDuplicateResolverResults(result: UnifiedSearchResult, duplicateData: any): void {
        if (Array.isArray(duplicateData)) {
            for (const item of duplicateData) {
                result.results.push({
                    source: MemoryLevel.MID_TERM, // 適切なソースを設定
                    type: 'resolved',
                    data: item.memory,
                    relevance: item.relevance || 0.6,
                    metadata: { source: 'duplicateResolver', matches: item.matches }
                });
            }
        }
    }

    /**
     * 検索提案の生成
     * @private
     */
    private generateSearchSuggestions(query: string): string[] {
        const suggestions = [
            'Try using different keywords',
            'Check spelling and try again',
            'Use more specific terms',
            'Try searching in specific memory levels'
        ];

        if (query.length < 3) {
            suggestions.unshift('Try using longer search terms');
        }

        if (query.includes(' ')) {
            suggestions.push('Try searching individual words');
        }

        return suggestions;
    }

    /**
     * 最適化推奨事項の生成
     * @private
     */
    private generateOptimizationRecommendations(result: SystemOptimizationResult): string[] {
        const recommendations: string[] = [];

        if (result.memorySaved > 1024 * 1024) {
            recommendations.push('Consider enabling automatic compression for better memory efficiency');
        }

        if (result.improvements.length === 0) {
            recommendations.push('System is already well optimized');
            recommendations.push('Consider running optimization again in 24 hours');
        }

        if (result.totalTimeSaved > 1000) {
            recommendations.push('Access patterns have been significantly improved');
        }

        return recommendations;
    }

    /**
     * レイヤー診断の取得
     * @private
     */
    private async getLayerDiagnostics(layer: string): Promise<any> {
        try {
            switch (layer) {
                case 'SHORT_TERM':
                    const shortTermDiag = await this.shortTermMemory.getDiagnostics();
                    return {
                        healthy: shortTermDiag.healthy,
                        dataIntegrity: shortTermDiag.healthy,
                        storageAccessible: true,
                        lastBackup: '',
                        performanceScore: shortTermDiag.metrics.successRate * 100 || 85,
                        recommendations: shortTermDiag.issues
                    };
                case 'MID_TERM':
                    const midTermDiag = await this.midTermMemory.getDiagnostics();
                    return {
                        healthy: midTermDiag.healthy,
                        dataIntegrity: midTermDiag.healthy,
                        storageAccessible: true,
                        lastBackup: '',
                        performanceScore: midTermDiag.metrics.qualityScore * 10 || 80,
                        recommendations: midTermDiag.issues
                    };
                case 'LONG_TERM':
                    const longTermStats = await this.longTermMemory.getStatistics();
                    return {
                        healthy: longTermStats.dataIntegrityScore > 0.8,
                        dataIntegrity: longTermStats.dataIntegrityScore > 0.8,
                        storageAccessible: true,
                        lastBackup: longTermStats.lastConsolidation,
                        performanceScore: longTermStats.learningEffectiveness * 100,
                        recommendations: longTermStats.dataIntegrityScore < 0.8 ? ['Improve data integrity'] : []
                    };
                default:
                    return {
                        healthy: false,
                        dataIntegrity: false,
                        storageAccessible: false,
                        lastBackup: '',
                        performanceScore: 0,
                        recommendations: ['Unknown layer']
                    };
            }
        } catch (error) {
            return {
                healthy: false,
                dataIntegrity: false,
                storageAccessible: false,
                lastBackup: '',
                performanceScore: 0,
                recommendations: [`Diagnostic failed: ${error}`]
            };
        }
    }

    /**
     * メモリレイヤー状態の取得
     * @private
     */
    private async getMemoryLayerStatus(layer: string): Promise<any> {
        try {
            switch (layer) {
                case 'SHORT_TERM':
                    const shortTermStatus = await this.shortTermMemory.getStatus();
                    return {
                        healthy: shortTermStatus.initialized,
                        dataCount: shortTermStatus.dataCount,
                        lastUpdate: shortTermStatus.lastUpdate,
                        storageSize: shortTermStatus.memoryUsage,
                        errorCount: 0
                    };
                case 'MID_TERM':
                    const midTermStatus = await this.midTermMemory.getStatus();
                    return {
                        healthy: midTermStatus.initialized,
                        dataCount: midTermStatus.dataCount,
                        lastUpdate: midTermStatus.lastUpdate,
                        storageSize: midTermStatus.memoryUsage,
                        errorCount: 0
                    };
                case 'LONG_TERM':
                    const longTermStats = await this.longTermMemory.getStatistics();
                    return {
                        healthy: longTermStats.dataIntegrityScore > 0.8,
                        dataCount: longTermStats.charactersManaged + longTermStats.worldKnowledgeEntries,
                        lastUpdate: longTermStats.lastConsolidation,
                        storageSize: 0, // 実装に応じて取得
                        errorCount: 0
                    };
                default:
                    return {
                        healthy: false,
                        dataCount: 0,
                        lastUpdate: new Date().toISOString(),
                        storageSize: 0,
                        errorCount: 1
                    };
            }
        } catch (error) {
            return {
                healthy: false,
                dataCount: 0,
                lastUpdate: new Date().toISOString(),
                storageSize: 0,
                errorCount: 1
            };
        }
    }

    /**
     * 平均処理時間の更新
     * @private
     */
    private updateAverageProcessingTime(processingTime: number): void {
        this.operationStats.averageProcessingTime =
            ((this.operationStats.averageProcessingTime * (this.operationStats.totalOperations - 1)) + processingTime) /
            this.operationStats.totalOperations;
    }

    /**
     * 操作キューの完了待機
     * @private
     */
    private async waitForOperationQueue(): Promise<void> {
        while (this.isProcessingQueue && this.operationQueue.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    /**
     * 操作統計の取得
     */
    getOperationStatistics() {
        return { ...this.operationStats };
    }

    /**
     * システム状態の取得
     */
    getSystemState(): string {
        return this.systemState;
    }
}