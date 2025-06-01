// src/lib/plot/section/index.ts
/**
 * @fileoverview 中期プロット（篇）システムのエクスポート管理（新記憶階層システム完全対応版）
 * @description
 * 「篇」システムの各コンポーネントをエクスポートし、新しい統合記憶階層システムに
 * 完全対応した外部アクセスポイントを提供します。
 * 
 * 新機能:
 * - 統合記憶階層システムの完全活用
 * - 依存注入パターンによる設定管理
 * - パフォーマンス監視・診断機能
 * - 動的設定更新とシステム最適化
 * - 完全なエラーハンドリングとフォールバック
 */

import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';

// 新記憶階層システムの型とクラスをインポート
import { MemoryManager, MemoryManagerConfig } from '@/lib/memory/core/memory-manager';
import { 
    MemoryLevel, 
    SystemOperationResult, 
    MemorySystemStatus 
} from '@/lib/memory/core/types';

// 生成システムとAIクライアント
import { GeminiClient } from '@/lib/generation/gemini-client';

// 学習旅路システム
import LearningJourneySystem from '@/lib/learning-journey';

// 型定義をエクスポート
export type {
    SectionPlot,
    SectionPlotParams,
    SectionStructure,
    LearningJourneyDesign,
    EmotionalDesign,
    CharacterDesign,
    NarrativeStructureDesign,
    MetaInformation,
    EmotionalTone,
    CoherenceAnalysis,
    ObjectiveProgress,
    EmotionalArcProgress,
    ImprovementSuggestion,
    ChapterOutline
} from './types';

// 各クラスをエクスポート
export { SectionPlotManager } from './section-plot-manager';
export { SectionDesigner } from './section-designer';
export { SectionAnalyzer } from './section-analyzer';
export { SectionStorage } from './section-storage';
export { SectionBridge } from './section-bridge';

/**
 * セクションシステム設定
 */
export interface SectionSystemConfig {
    // 記憶システム統合設定
    memorySystem: {
        useIntegration: boolean;
        enableCaching: boolean;
        enableOptimization: boolean;
        enableQualityAssurance: boolean;
        enableAutoBackup: boolean;
        fallbackToLocalAnalysis: boolean;
    };
    
    // パフォーマンス設定
    performance: {
        maxAnalysisRetries: number;
        analysisTimeout: number;
        contextTimeout: number;
        enableMetricsCollection: boolean;
        enableDiagnostics: boolean;
    };
    
    // AI生成設定
    aiGeneration: {
        enableAdvancedPrompts: boolean;
        useContextualGeneration: boolean;
        enableIterativeRefinement: boolean;
        maxGenerationAttempts: number;
    };
    
    // 品質管理設定
    qualityAssurance: {
        enableValidation: boolean;
        enableConsistencyChecks: boolean;
        enableContentAnalysis: boolean;
        qualityThreshold: number;
    };
}

/**
 * システム診断結果
 */
export interface SectionSystemDiagnostics {
    healthy: boolean;
    systemVersion: string;
    components: {
        sectionPlotManager: ComponentStatus;
        sectionDesigner: ComponentStatus;
        sectionAnalyzer: ComponentStatus;
        sectionBridge: ComponentStatus;
        memorySystem: ComponentStatus;
    };
    memorySystemStatus: MemorySystemStatus | null;
    performanceMetrics: PerformanceMetrics;
    recommendations: string[];
    lastOptimization: string;
}

/**
 * コンポーネント状態
 */
export interface ComponentStatus {
    initialized: boolean;
    healthy: boolean;
    lastActivity: string;
    errorCount: number;
    operationCount: number;
    averageResponseTime: number;
}

/**
 * パフォーマンスメトリクス
 */
export interface PerformanceMetrics {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageProcessingTime: number;
    memorySystemHits: number;
    cacheEfficiencyRate: number;
    qualityScore: number;
}

/**
 * セクションシステムマネージャー
 * @description 新記憶階層システムに完全対応したセクションシステムの統合管理クラス
 */
class SectionSystemManager {
    private initialized: boolean = false;
    private initializationPromise: Promise<void> | null = null;
    private memoryManager: MemoryManager | null = null;
    private geminiClient: GeminiClient | null = null;
    private learningJourneySystem: LearningJourneySystem | undefined = undefined;
    private sectionPlotManager: any = null;
    private config: SectionSystemConfig;
    private performanceMetrics: PerformanceMetrics;
    private componentStatuses: Map<string, ComponentStatus> = new Map();

    constructor(config?: Partial<SectionSystemConfig>) {
        // デフォルト設定とカスタム設定をマージ
        this.config = {
            memorySystem: {
                useIntegration: true,
                enableCaching: true,
                enableOptimization: true,
                enableQualityAssurance: true,
                enableAutoBackup: true,
                fallbackToLocalAnalysis: true
            },
            performance: {
                maxAnalysisRetries: 3,
                analysisTimeout: 30000,
                contextTimeout: 15000,
                enableMetricsCollection: true,
                enableDiagnostics: true
            },
            aiGeneration: {
                enableAdvancedPrompts: true,
                useContextualGeneration: true,
                enableIterativeRefinement: true,
                maxGenerationAttempts: 3
            },
            qualityAssurance: {
                enableValidation: true,
                enableConsistencyChecks: true,
                enableContentAnalysis: true,
                qualityThreshold: 0.8
            },
            ...config
        };

        // パフォーマンスメトリクスの初期化
        this.performanceMetrics = {
            totalOperations: 0,
            successfulOperations: 0,
            failedOperations: 0,
            averageProcessingTime: 0,
            memorySystemHits: 0,
            cacheEfficiencyRate: 0,
            qualityScore: 0.8
        };

        logger.info('SectionSystemManager created with advanced memory integration', {
            config: this.config
        });
    }

    /**
     * システム全体の初期化
     */
    async initialize(
        memoryManagerConfig?: Partial<MemoryManagerConfig>,
        geminiClientConfig?: any
    ): Promise<void> {
        if (this.initialized) {
            logger.info('SectionSystemManager already initialized');
            return;
        }

        if (this.initializationPromise) {
            await this.initializationPromise;
            return;
        }

        this.initializationPromise = this.performInitialization(
            memoryManagerConfig,
            geminiClientConfig
        );

        await this.initializationPromise;
    }

    /**
     * 初期化処理の実行
     * @private
     */
    private async performInitialization(
        memoryManagerConfig?: Partial<MemoryManagerConfig>,
        geminiClientConfig?: any
    ): Promise<void> {
        try {
            logger.info('Starting SectionSystemManager initialization with unified memory system');

            // 1. 統合記憶管理システムの初期化
            await this.initializeMemorySystem(memoryManagerConfig);

            // 2. AIクライアントの初期化
            await this.initializeGeminiClient(geminiClientConfig);

            // 3. セクションプロットマネージャーの初期化
            await this.initializeSectionPlotManager();

            // 4. システム診断の実行
            await this.performInitialDiagnostics();

            // 5. パフォーマンス監視の開始
            if (this.config.performance.enableMetricsCollection) {
                this.startPerformanceMonitoring();
            }

            this.initialized = true;
            logger.info('SectionSystemManager initialization completed successfully', {
                memorySystemIntegrated: !!this.memoryManager,
                componentsInitialized: this.componentStatuses.size
            });

        } catch (error) {
            logger.error('SectionSystemManager initialization failed', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw new Error(`SectionSystemManager initialization failed: ${error}`);
        }
    }

    /**
     * 統合記憶管理システムの初期化
     * @private
     */
    private async initializeMemorySystem(
        memoryManagerConfig?: Partial<MemoryManagerConfig>
    ): Promise<void> {
        try {
            // デフォルトの記憶システム設定
            const defaultMemoryConfig: MemoryManagerConfig = {
                shortTermConfig: {
                    maxChapters: 15,
                    cacheEnabled: this.config.memorySystem.enableCaching,
                    autoCleanupEnabled: true,
                    cleanupIntervalMinutes: 30,
                    maxRetentionHours: 72
                },
                midTermConfig: {
                    maxAnalysisResults: 200,
                    enableEvolutionTracking: true,
                    enableProgressionAnalysis: true,
                    qualityThreshold: this.config.qualityAssurance.qualityThreshold,
                    enableCrossComponentAnalysis: true,
                    enableRealTimeQualityMonitoring: this.config.performance.enableMetricsCollection,
                    enablePerformanceOptimization: this.config.memorySystem.enableOptimization
                },
                longTermConfig: {
                    enableAutoLearning: true,
                    consolidationInterval: 60,
                    archiveOldData: true,
                    enablePredictiveAnalysis: true,
                    qualityThreshold: this.config.qualityAssurance.qualityThreshold
                },
                integrationEnabled: this.config.memorySystem.useIntegration,
                enableQualityAssurance: this.config.memorySystem.enableQualityAssurance,
                enableAutoBackup: this.config.memorySystem.enableAutoBackup,
                enablePerformanceOptimization: this.config.memorySystem.enableOptimization,
                enableDataMigration: true,
                cacheSettings: {
                    sizeLimit: 100 * 1024 * 1024, // 100MB
                    entryLimit: 10000,
                    cleanupInterval: 30 * 60 * 1000 // 30分
                },
                optimizationSettings: {
                    enablePredictiveAccess: true,
                    enableConsistencyValidation: this.config.qualityAssurance.enableConsistencyChecks,
                    enablePerformanceMonitoring: this.config.performance.enableMetricsCollection
                },
                qualityAssurance: {
                    enableRealTimeMonitoring: true,
                    enablePredictiveAnalysis: true,
                    enableAutomaticRecovery: true,
                    checkInterval: 5 * 60 * 1000, // 5分
                    alertThresholds: {
                        dataIntegrity: 0.95,
                        systemStability: 0.90,
                        performance: 0.85,
                        operationalEfficiency: 0.80
                    }
                },
                backup: {
                    enabled: this.config.memorySystem.enableAutoBackup,
                    schedule: {
                        fullBackupInterval: 24 * 60 * 60 * 1000, // 24時間
                        incrementalInterval: 4 * 60 * 60 * 1000,  // 4時間
                        maxBackupCount: 10,
                        retentionDays: 30
                    },
                    compression: {
                        enabled: true,
                        level: 6
                    }
                }
            };

            // カスタム設定とマージ
            const finalConfig = this.mergeMemoryConfig(defaultMemoryConfig, memoryManagerConfig);

            // MemoryManagerの作成と初期化
            this.memoryManager = new MemoryManager(finalConfig);
            await this.memoryManager.initialize();

            // コンポーネント状態の記録
            this.updateComponentStatus('memoryManager', {
                initialized: true,
                healthy: true,
                lastActivity: new Date().toISOString(),
                errorCount: 0,
                operationCount: 0,
                averageResponseTime: 0
            });

            logger.info('Unified memory system initialized successfully', {
                config: finalConfig,
                integrationEnabled: finalConfig.integrationEnabled
            });

        } catch (error) {
            this.updateComponentStatus('memoryManager', {
                initialized: false,
                healthy: false,
                lastActivity: new Date().toISOString(),
                errorCount: 1,
                operationCount: 0,
                averageResponseTime: 0
            });

            logError(error, {}, 'Failed to initialize unified memory system');
            throw error;
        }
    }

    /**
     * GeminiClientの初期化
     * @private
     */
    private async initializeGeminiClient(geminiClientConfig?: any): Promise<void> {
        try {
            // GeminiClientは引数なしで初期化（geminiClientConfigは将来の拡張用）
            this.geminiClient = new GeminiClient();

            // 接続テスト（簡易）
            const testPrompt = 'Test connection - respond with "OK"';
            try {
                await this.geminiClient.generateText(testPrompt);
                
                this.updateComponentStatus('geminiClient', {
                    initialized: true,
                    healthy: true,
                    lastActivity: new Date().toISOString(),
                    errorCount: 0,
                    operationCount: 1,
                    averageResponseTime: 0
                });

                logger.info('GeminiClient initialized and tested successfully');
            } catch (testError) {
                // 接続テストに失敗してもクライアント自体は初期化
                this.updateComponentStatus('geminiClient', {
                    initialized: true,
                    healthy: false,
                    lastActivity: new Date().toISOString(),
                    errorCount: 1,
                    operationCount: 0,
                    averageResponseTime: 0
                });

                logger.warn('GeminiClient initialized but connection test failed', {
                    error: testError instanceof Error ? testError.message : String(testError)
                });
            }

        } catch (error) {
            this.updateComponentStatus('geminiClient', {
                initialized: false,
                healthy: false,
                lastActivity: new Date().toISOString(),
                errorCount: 1,
                operationCount: 0,
                averageResponseTime: 0
            });

            logError(error, {}, 'Failed to initialize GeminiClient');
            throw error;
        }
    }

    /**
     * セクションプロットマネージャーの初期化
     * @private
     */
    private async initializeSectionPlotManager(): Promise<void> {
        if (!this.memoryManager || !this.geminiClient) {
            throw new Error('MemoryManager and GeminiClient must be initialized first');
        }

        try {
            // 記憶階層システム最適化された設定でSectionPlotManagerを作成
            const { getSectionPlotManager } = await import('./section-plot-manager');
            
            const sectionConfig = {
                useMemorySystemIntegration: this.config.memorySystem.useIntegration,
                enableAutoBackup: this.config.memorySystem.enableAutoBackup,
                enableQualityAssurance: this.config.memorySystem.enableQualityAssurance,
                cacheEnabled: this.config.memorySystem.enableCaching,
                optimizationEnabled: this.config.memorySystem.enableOptimization
            };

            this.sectionPlotManager = getSectionPlotManager(
                this.memoryManager,
                this.geminiClient,
                this.learningJourneySystem,
                sectionConfig
            );

            // SectionPlotManagerの初期化
            await this.sectionPlotManager.initialize();

            this.updateComponentStatus('sectionPlotManager', {
                initialized: true,
                healthy: true,
                lastActivity: new Date().toISOString(),
                errorCount: 0,
                operationCount: 0,
                averageResponseTime: 0
            });

            logger.info('SectionPlotManager initialized with memory system integration');

        } catch (error) {
            this.updateComponentStatus('sectionPlotManager', {
                initialized: false,
                healthy: false,
                lastActivity: new Date().toISOString(),
                errorCount: 1,
                operationCount: 0,
                averageResponseTime: 0
            });

            logError(error, {}, 'Failed to initialize SectionPlotManager');
            throw error;
        }
    }

    /**
     * 初期診断の実行
     * @private
     */
    private async performInitialDiagnostics(): Promise<void> {
        if (!this.config.performance.enableDiagnostics) {
            return;
        }

        try {
            const diagnostics = await this.performSystemDiagnostics();
            
            if (!diagnostics.healthy) {
                logger.warn('Initial system diagnostics detected issues', {
                    recommendations: diagnostics.recommendations
                });
            } else {
                logger.info('Initial system diagnostics completed successfully', {
                    componentsHealthy: Object.values(diagnostics.components)
                        .filter(c => c.healthy).length,
                    totalComponents: Object.keys(diagnostics.components).length
                });
            }

        } catch (error) {
            logger.warn('Initial diagnostics failed', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * パフォーマンス監視の開始
     * @private
     */
    private startPerformanceMonitoring(): void {
        // 5分間隔でメトリクス更新
        setInterval(async () => {
            try {
                await this.updatePerformanceMetrics();
            } catch (error) {
                logger.warn('Performance metrics update failed', {
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }, 5 * 60 * 1000);

        logger.debug('Performance monitoring started');
    }

    /**
     * メモリ設定のマージ
     * @private
     */
    private mergeMemoryConfig(
        defaultConfig: MemoryManagerConfig,
        customConfig?: Partial<MemoryManagerConfig>
    ): MemoryManagerConfig {
        if (!customConfig) return defaultConfig;

        return {
            ...defaultConfig,
            ...customConfig,
            shortTermConfig: {
                ...defaultConfig.shortTermConfig,
                ...(customConfig.shortTermConfig || {})
            },
            midTermConfig: {
                ...defaultConfig.midTermConfig,
                ...(customConfig.midTermConfig || {})
            },
            longTermConfig: {
                ...defaultConfig.longTermConfig,
                ...(customConfig.longTermConfig || {})
            },
            cacheSettings: {
                ...defaultConfig.cacheSettings,
                ...(customConfig.cacheSettings || {})
            },
            optimizationSettings: {
                ...defaultConfig.optimizationSettings,
                ...(customConfig.optimizationSettings || {})
            },
            qualityAssurance: {
                ...defaultConfig.qualityAssurance,
                ...(customConfig.qualityAssurance || {})
            },
            backup: {
                ...defaultConfig.backup,
                ...(customConfig.backup || {})
            }
        };
    }

    /**
     * コンポーネント状態の更新
     * @private
     */
    private updateComponentStatus(componentName: string, status: ComponentStatus): void {
        this.componentStatuses.set(componentName, status);
    }

    /**
     * パフォーマンスメトリクスの更新
     * @private
     */
    private async updatePerformanceMetrics(): Promise<void> {
        try {
            // MemoryManagerからの統計情報取得
            if (this.memoryManager) {
                const memoryStats = this.memoryManager.getOperationStatistics();
                this.performanceMetrics.memorySystemHits = memoryStats.totalOperations;
                this.performanceMetrics.averageProcessingTime = memoryStats.averageProcessingTime;
            }

            // SectionPlotManagerからの統計情報取得
            if (this.sectionPlotManager) {
                const sectionStats = this.sectionPlotManager.getPerformanceStatistics();
                this.performanceMetrics.totalOperations = sectionStats.totalOperations;
                this.performanceMetrics.successfulOperations = sectionStats.successfulOperations;
                this.performanceMetrics.failedOperations = sectionStats.failedOperations;
            }

            // 品質スコアの計算
            const successRate = this.performanceMetrics.totalOperations > 0
                ? this.performanceMetrics.successfulOperations / this.performanceMetrics.totalOperations
                : 1;

            this.performanceMetrics.qualityScore = Math.min(1, successRate * 1.2); // 1.2倍でボーナス

        } catch (error) {
            logger.warn('Failed to update performance metrics', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * セクションプロットマネージャーの取得
     */
    async getSectionPlotManager(): Promise<any> {
        await this.ensureInitialized();
        return this.sectionPlotManager;
    }

    /**
     * 統合記憶管理システムの取得
     */
    async getMemoryManager(): Promise<MemoryManager | null> {
        await this.ensureInitialized();
        return this.memoryManager;
    }

    /**
     * 学習旅路システムの設定
     */
    setLearningJourneySystem(learningJourneySystem: LearningJourneySystem): void {
        this.learningJourneySystem = learningJourneySystem;
        
        logger.info('LearningJourneySystem configured', {
            systemProvided: !!learningJourneySystem
        });

        // 既に初期化済みの場合は再初期化が必要
        if (this.initialized && this.sectionPlotManager) {
            this.reinitializeWithLearningJourney().catch(error => {
                logger.error('Failed to reinitialize with learning journey system', {
                    error: error instanceof Error ? error.message : String(error)
                });
            });
        }
    }

    /**
     * 学習旅路システム付きで再初期化
     * @private
     */
    private async reinitializeWithLearningJourney(): Promise<void> {
        try {
            if (!this.memoryManager || !this.geminiClient) {
                throw new Error('Core systems not initialized');
            }

            const { getSectionPlotManager } = await import('./section-plot-manager');
            
            const sectionConfig = {
                useMemorySystemIntegration: this.config.memorySystem.useIntegration,
                enableAutoBackup: this.config.memorySystem.enableAutoBackup,
                enableQualityAssurance: this.config.memorySystem.enableQualityAssurance,
                cacheEnabled: this.config.memorySystem.enableCaching,
                optimizationEnabled: this.config.memorySystem.enableOptimization
            };

            this.sectionPlotManager = getSectionPlotManager(
                this.memoryManager,
                this.geminiClient,
                this.learningJourneySystem,
                sectionConfig
            );

            await this.sectionPlotManager.initialize();

            logger.info('SectionPlotManager reinitialized with LearningJourneySystem');

        } catch (error) {
            logger.error('Failed to reinitialize with learning journey system', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * システム設定の更新
     */
    async updateConfiguration(newConfig: Partial<SectionSystemConfig>): Promise<boolean> {
        try {
            logger.info('Updating SectionSystemManager configuration');

            const oldConfig = { ...this.config };
            this.config = {
                ...this.config,
                ...newConfig,
                memorySystem: {
                    ...this.config.memorySystem,
                    ...(newConfig.memorySystem || {})
                },
                performance: {
                    ...this.config.performance,
                    ...(newConfig.performance || {})
                },
                aiGeneration: {
                    ...this.config.aiGeneration,
                    ...(newConfig.aiGeneration || {})
                },
                qualityAssurance: {
                    ...this.config.qualityAssurance,
                    ...(newConfig.qualityAssurance || {})
                }
            };

            // MemoryManagerの設定更新
            if (this.memoryManager && newConfig.memorySystem) {
                const memoryConfigUpdate: Partial<MemoryManagerConfig> = {
                    integrationEnabled: newConfig.memorySystem.useIntegration,
                    enableQualityAssurance: newConfig.memorySystem.enableQualityAssurance,
                    enableAutoBackup: newConfig.memorySystem.enableAutoBackup,
                    enablePerformanceOptimization: newConfig.memorySystem.enableOptimization
                };

                await this.memoryManager.updateConfiguration(memoryConfigUpdate);
            }

            logger.info('SectionSystemManager configuration updated successfully');
            return true;

        } catch (error) {
            logger.error('Failed to update configuration', {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * システム診断の実行
     */
    async performSystemDiagnostics(): Promise<SectionSystemDiagnostics> {
        try {
            await this.ensureInitialized();

            // メモリシステム状態の取得
            let memorySystemStatus: MemorySystemStatus | null = null;
            if (this.memoryManager) {
                try {
                    memorySystemStatus = await this.memoryManager.getSystemStatus();
                } catch (error) {
                    logger.warn('Failed to get memory system status', {
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }

            // コンポーネント状態の更新
            await this.updateAllComponentStatuses();

            // システム健全性の判定
            const allComponentsHealthy = Array.from(this.componentStatuses.values())
                .every(status => status.healthy);

            const memorySystemHealthy = memorySystemStatus?.initialized || false;
            const systemHealthy = allComponentsHealthy && memorySystemHealthy;

            // 推奨事項の生成
            const recommendations = this.generateRecommendations(systemHealthy, memorySystemStatus);

            const diagnostics: SectionSystemDiagnostics = {
                healthy: systemHealthy,
                systemVersion: '2.0.0-memory-optimized',
                components: {
                    sectionPlotManager: this.componentStatuses.get('sectionPlotManager') || this.getDefaultComponentStatus(),
                    sectionDesigner: this.componentStatuses.get('sectionDesigner') || this.getDefaultComponentStatus(),
                    sectionAnalyzer: this.componentStatuses.get('sectionAnalyzer') || this.getDefaultComponentStatus(),
                    sectionBridge: this.componentStatuses.get('sectionBridge') || this.getDefaultComponentStatus(),
                    memorySystem: this.componentStatuses.get('memoryManager') || this.getDefaultComponentStatus()
                },
                memorySystemStatus,
                performanceMetrics: { ...this.performanceMetrics },
                recommendations,
                lastOptimization: new Date().toISOString()
            };

            logger.info('System diagnostics completed', {
                healthy: diagnostics.healthy,
                componentsHealthy: Object.values(diagnostics.components).filter(c => c.healthy).length,
                totalComponents: Object.keys(diagnostics.components).length
            });

            return diagnostics;

        } catch (error) {
            logger.error('System diagnostics failed', {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                healthy: false,
                systemVersion: '2.0.0-memory-optimized',
                components: {
                    sectionPlotManager: this.getDefaultComponentStatus(),
                    sectionDesigner: this.getDefaultComponentStatus(),
                    sectionAnalyzer: this.getDefaultComponentStatus(),
                    sectionBridge: this.getDefaultComponentStatus(),
                    memorySystem: this.getDefaultComponentStatus()
                },
                memorySystemStatus: null,
                performanceMetrics: { ...this.performanceMetrics },
                recommendations: [
                    'System diagnostics failed',
                    'Check system logs for detailed error information',
                    'Consider restarting the system components'
                ],
                lastOptimization: new Date().toISOString()
            };
        }
    }

    /**
     * システム最適化の実行
     */
    async optimizeSystem(): Promise<SystemOperationResult> {
        try {
            await this.ensureInitialized();

            logger.info('Starting system optimization...');
            const startTime = Date.now();

            const result: SystemOperationResult = {
                success: false,
                operationType: 'systemOptimization',
                processingTime: 0,
                affectedComponents: [],
                details: {},
                warnings: [],
                errors: []
            };

            // 1. MemoryManagerの最適化
            if (this.memoryManager) {
                try {
                    const memoryOptResult = await this.memoryManager.optimizeSystem();
                    result.affectedComponents.push('memoryManager');
                    result.details.memoryOptimization = {
                        success: memoryOptResult.success,
                        improvements: memoryOptResult.improvements.length,
                        memorySaved: memoryOptResult.memorySaved
                    };
                } catch (error) {
                    result.warnings.push(`Memory optimization failed: ${error}`);
                }
            }

            // 2. パフォーマンスメトリクスの更新
            await this.updatePerformanceMetrics();
            result.affectedComponents.push('performanceMetrics');

            // 3. コンポーネント状態の更新
            await this.updateAllComponentStatuses();
            result.affectedComponents.push('componentStatuses');

            result.success = result.errors.length === 0;
            result.processingTime = Date.now() - startTime;

            if (result.success) {
                logger.info('System optimization completed successfully', {
                    processingTime: result.processingTime,
                    affectedComponents: result.affectedComponents.length
                });
            } else {
                logger.warn('System optimization completed with issues', {
                    errors: result.errors,
                    warnings: result.warnings
                });
            }

            return result;

        } catch (error) {
            logger.error('System optimization failed', {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                success: false,
                operationType: 'systemOptimization',
                processingTime: 0,
                affectedComponents: [],
                details: {},
                warnings: [],
                errors: [error instanceof Error ? error.message : String(error)]
            };
        }
    }

    /**
     * 全コンポーネント状態の更新
     * @private
     */
    private async updateAllComponentStatuses(): Promise<void> {
        try {
            // SectionPlotManagerの診断
            if (this.sectionPlotManager) {
                try {
                    const sectionDiagnostics = await this.sectionPlotManager.performDiagnostics();
                    this.updateComponentStatus('sectionPlotManager', {
                        initialized: true,
                        healthy: sectionDiagnostics.systemHealth === 'HEALTHY',
                        lastActivity: new Date().toISOString(),
                        errorCount: sectionDiagnostics.performanceMetrics.failedOperations,
                        operationCount: sectionDiagnostics.performanceMetrics.totalOperations,
                        averageResponseTime: sectionDiagnostics.performanceMetrics.averageProcessingTime
                    });
                } catch (error) {
                    this.updateComponentStatus('sectionPlotManager', {
                        initialized: true,
                        healthy: false,
                        lastActivity: new Date().toISOString(),
                        errorCount: 1,
                        operationCount: 0,
                        averageResponseTime: 0
                    });
                }
            }

        } catch (error) {
            logger.warn('Failed to update component statuses', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 推奨事項の生成
     * @private
     */
    private generateRecommendations(
        systemHealthy: boolean,
        memorySystemStatus: MemorySystemStatus | null
    ): string[] {
        const recommendations: string[] = [];

        if (!systemHealthy) {
            recommendations.push('System health issues detected - review component diagnostics');
        }

        if (!memorySystemStatus?.initialized) {
            recommendations.push('Memory system integration issues - check configuration');
        }

        if (this.performanceMetrics.qualityScore < 0.8) {
            recommendations.push('Performance quality below threshold - consider optimization');
        }

        if (this.performanceMetrics.cacheEfficiencyRate < 0.5) {
            recommendations.push('Low cache efficiency - review caching strategy');
        }

        if (recommendations.length === 0) {
            recommendations.push('System operating optimally');
            recommendations.push('Continue regular monitoring and maintenance');
        }

        return recommendations;
    }

    /**
     * デフォルトコンポーネント状態の取得
     * @private
     */
    private getDefaultComponentStatus(): ComponentStatus {
        return {
            initialized: false,
            healthy: false,
            lastActivity: new Date().toISOString(),
            errorCount: 0,
            operationCount: 0,
            averageResponseTime: 0
        };
    }

    /**
     * 初期化の確認
     * @private
     */
    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            if (this.initializationPromise) {
                await this.initializationPromise;
            } else {
                throw new Error('SectionSystemManager not initialized');
            }
        }
    }

    /**
     * システム設定の取得
     */
    getConfiguration(): SectionSystemConfig {
        return { ...this.config };
    }

    /**
     * パフォーマンスメトリクスの取得
     */
    getPerformanceMetrics(): PerformanceMetrics {
        return { ...this.performanceMetrics };
    }

    /**
     * システムシャットダウン
     */
    async shutdown(): Promise<void> {
        try {
            logger.info('Shutting down SectionSystemManager...');

            // MemoryManagerのシャットダウン
            if (this.memoryManager) {
                await this.memoryManager.shutdown();
            }

            this.initialized = false;
            this.initializationPromise = null;
            this.componentStatuses.clear();

            logger.info('SectionSystemManager shutdown completed');

        } catch (error) {
            logger.error('SectionSystemManager shutdown failed', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
}

// シングルトンインスタンス
let _sectionSystemManager: SectionSystemManager | null = null;

/**
 * セクションシステムマネージャーのシングルトンインスタンスを取得
 * 
 * @param config システム設定（初回のみ）
 * @param memoryManagerConfig メモリマネージャー設定（初回のみ）
 * @param geminiClientConfig Geminiクライアント設定（初回のみ）
 * @param forceNew 新しいインスタンスを強制的に作成するか
 * @returns セクションシステムマネージャーのシングルトンインスタンス
 */
export async function getSectionSystemManager(
    config?: Partial<SectionSystemConfig>,
    memoryManagerConfig?: Partial<MemoryManagerConfig>,
    geminiClientConfig?: any,
    forceNew: boolean = false
): Promise<SectionSystemManager> {
    if (!_sectionSystemManager || forceNew) {
        _sectionSystemManager = new SectionSystemManager(config);
        await _sectionSystemManager.initialize(memoryManagerConfig, geminiClientConfig);
    }
    
    return _sectionSystemManager;
}

/**
 * セクションプロットマネージャーのインスタンスを取得
 * 
 * @param config システム設定（初回のみ）
 * @param memoryManagerConfig メモリマネージャー設定（初回のみ）
 * @param geminiClientConfig Geminiクライアント設定（初回のみ）
 * @returns セクションプロットマネージャーのインスタンス
 */
export async function getSectionPlotManagerInstance(
    config?: Partial<SectionSystemConfig>,
    memoryManagerConfig?: Partial<MemoryManagerConfig>,
    geminiClientConfig?: any
): Promise<any> {
    const systemManager = await getSectionSystemManager(
        config,
        memoryManagerConfig,
        geminiClientConfig
    );
    
    return await systemManager.getSectionPlotManager();
}

/**
 * 学習旅路システムを設定
 * 
 * @param learningJourneySystem 学習旅路システム
 */
export async function setLearningJourneySystem(
    learningJourneySystem: LearningJourneySystem
): Promise<void> {
    if (_sectionSystemManager) {
        _sectionSystemManager.setLearningJourneySystem(learningJourneySystem);
    } else {
        logger.warn('SectionSystemManager not initialized - LearningJourneySystem will be set on next initialization');
    }
}

/**
 * システム診断の実行
 * 
 * @returns システム診断結果
 */
export async function performSystemDiagnostics(): Promise<SectionSystemDiagnostics> {
    if (!_sectionSystemManager) {
        throw new Error('SectionSystemManager not initialized');
    }
    
    return await _sectionSystemManager.performSystemDiagnostics();
}

/**
 * システム最適化の実行
 * 
 * @returns 最適化結果
 */
export async function optimizeSystem(): Promise<SystemOperationResult> {
    if (!_sectionSystemManager) {
        throw new Error('SectionSystemManager not initialized');
    }
    
    return await _sectionSystemManager.optimizeSystem();
}

/**
 * システム設定の更新
 * 
 * @param newConfig 新しい設定
 * @returns 更新成功フラグ
 */
export async function updateSystemConfiguration(
    newConfig: Partial<SectionSystemConfig>
): Promise<boolean> {
    if (!_sectionSystemManager) {
        throw new Error('SectionSystemManager not initialized');
    }
    
    return await _sectionSystemManager.updateConfiguration(newConfig);
}

/**
 * 統合記憶管理システムの取得
 * 
 * @returns MemoryManagerのインスタンス
 */
export async function getMemoryManager(): Promise<MemoryManager | null> {
    if (!_sectionSystemManager) {
        throw new Error('SectionSystemManager not initialized');
    }
    
    return await _sectionSystemManager.getMemoryManager();
}

/**
 * セクションプロットマネージャーのインスタンスを取得（レガシー互換性）
 * 
 * @param memoryManager メモリマネージャー（必須）
 * @param geminiClient Geminiクライアント（必須）
 * @param learningJourneySystem 学習旅路システム（オプション）
 * @param config 設定オプション
 * @returns セクションプロットマネージャーのインスタンス
 */
export async function getSectionPlotManager(
    memoryManager: MemoryManager,
    geminiClient: GeminiClient,
    learningJourneySystem?: LearningJourneySystem,
    config?: any
): Promise<any> {
    // section-plot-manager.tsからの直接インポート
    const { getSectionPlotManager: getOriginalSectionPlotManager } = await import('./section-plot-manager');
    
    return getOriginalSectionPlotManager(
        memoryManager,
        geminiClient,
        learningJourneySystem,
        config
    );
}

// レガシー互換性のための関数エクスポート（重複回避のため削除）

// デフォルトエクスポート
export default {
    getSectionSystemManager,
    getSectionPlotManagerInstance,
    getSectionPlotManager,
    setLearningJourneySystem,
    performSystemDiagnostics,
    optimizeSystem,
    updateSystemConfiguration,
    getMemoryManager
};