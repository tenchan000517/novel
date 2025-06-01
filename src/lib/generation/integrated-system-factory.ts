/**
 * @fileoverview 統合ファクトリー＆初期化システム（記憶改装システム対応版）
 * @description 
 * 新記憶階層システムとの統合問題を解決する最小限かつ最適化されたファクトリーシステム
 */

import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { MemoryManager, MemoryManagerConfig } from '@/lib/memory/core/memory-manager';
import { ContentAnalysisManager } from '@/lib/analysis/content-analysis-manager';
import { NarrativeAnalysisService, NarrativeAnalysisOptions } from '@/lib/analysis/services/narrative/narrative-analysis-service';
import { PreGenerationPipeline } from '@/lib/analysis/pipelines/pre-generation-pipeline';
import { PostGenerationPipeline } from '@/lib/analysis/pipelines/post-generation-pipeline';
import { AnalysisCoordinator } from '@/lib/analysis/coordinators/analysis-coordinator';
import { OptimizationCoordinator } from '@/lib/analysis/coordinators/optimization-coordinator';
import { GeminiAdapter } from '@/lib/analysis/adapters/gemini-adapter';
import { storageProvider } from '@/lib/storage';

/**
 * システム初期化状態
 */
interface SystemInitializationState {
    memoryManagerInitialized: boolean;
    memoryManagerValidated: boolean;
    coreServicesInitialized: boolean;
    integrationLayerInitialized: boolean;
    fullyOperational: boolean;
    lastValidation: string;
    errors: string[];
}

/**
 * ファクトリー設定
 */
interface IntegratedSystemFactoryConfig {
    memoryManagerConfig: MemoryManagerConfig;
    enableFallbackMode: boolean;
    validationTimeout: number;
    retryAttempts: number;
}

/**
 * @class IntegratedSystemFactory
 * @description 
 * 新記憶階層システムとanalysisモジュールの統合ファクトリー
 * 依存注入の問題を根本解決し、適切な初期化順序を保証
 */
export class IntegratedSystemFactory {
    private static instance: IntegratedSystemFactory | null = null;
    private initialized: boolean = false;
    private state: SystemInitializationState;
    
    // 中核コンポーネント
    private memoryManager: MemoryManager | null = null;
    private contentAnalysisManager: ContentAnalysisManager | null = null;
    private narrativeAnalysisService: NarrativeAnalysisService | null = null;
    
    // 初期化プロミス（重複初期化防止）
    private initializationPromise: Promise<void> | null = null;

    private constructor(private config: IntegratedSystemFactoryConfig) {
        this.state = {
            memoryManagerInitialized: false,
            memoryManagerValidated: false,
            coreServicesInitialized: false,
            integrationLayerInitialized: false,
            fullyOperational: false,
            lastValidation: '',
            errors: []
        };
        
        logger.info('IntegratedSystemFactory created with memory system integration support');
    }

    /**
     * シングルトンインスタンス取得
     */
    static getInstance(config?: IntegratedSystemFactoryConfig): IntegratedSystemFactory {
        if (!IntegratedSystemFactory.instance) {
            if (!config) {
                throw new Error('Configuration required for first-time initialization');
            }
            IntegratedSystemFactory.instance = new IntegratedSystemFactory(config);
        }
        return IntegratedSystemFactory.instance;
    }

    /**
     * システム全体の初期化（最優先メソッド）
     */
    async initializeSystem(geminiClient: GeminiClient): Promise<void> {
        if (this.initialized) {
            logger.info('System already initialized');
            return;
        }

        if (this.initializationPromise) {
            logger.info('Initialization in progress, waiting...');
            return this.initializationPromise;
        }

        this.initializationPromise = this._performInitialization(geminiClient);
        
        try {
            await this.initializationPromise;
            this.initialized = true;
            logger.info('✅ Integrated system initialization completed successfully');
        } catch (error) {
            this.initializationPromise = null;
            logger.error('❌ System initialization failed', { error });
            throw error;
        }
    }

    /**
     * 内部初期化実装
     */
    private async _performInitialization(geminiClient: GeminiClient): Promise<void> {
        logger.info('🚀 Starting integrated system initialization...');

        try {
            // Phase 1: MemoryManager初期化と検証
            await this._initializeMemoryManager();
            
            // Phase 2: コアサービス初期化
            await this._initializeCoreServices(geminiClient);
            
            // Phase 3: 統合レイヤー初期化
            await this._initializeIntegrationLayer(geminiClient);
            
            // Phase 4: 最終検証
            await this._performFinalValidation();
            
            this.state.fullyOperational = true;
            this.state.lastValidation = new Date().toISOString();
            
        } catch (error) {
            this.state.errors.push(error instanceof Error ? error.message : String(error));
            logger.error('System initialization failed in phase', { error, state: this.state });
            throw error;
        }
    }

    /**
     * Phase 1: MemoryManager初期化と検証
     */
    private async _initializeMemoryManager(): Promise<void> {
        logger.info('📝 Phase 1: Initializing and validating MemoryManager...');

        try {
            // MemoryManager作成
            this.memoryManager = new MemoryManager(this.config.memoryManagerConfig);
            
            // 初期化実行
            await this.memoryManager.initialize();
            this.state.memoryManagerInitialized = true;
            
            // 初期化状態の検証
            const systemStatus = await this.memoryManager.getSystemStatus();
            if (!systemStatus.initialized) {
                throw new Error('MemoryManager failed initialization verification');
            }
            
            // システム診断実行
            const diagnostics = await this.memoryManager.performSystemDiagnostics();
            if (diagnostics.systemHealth === 'CRITICAL') {
                if (!this.config.enableFallbackMode) {
                    throw new Error(`MemoryManager in critical state: ${diagnostics.issues.join(', ')}`);
                }
                logger.warn('MemoryManager in critical state but fallback mode enabled', {
                    issues: diagnostics.issues
                });
            }
            
            this.state.memoryManagerValidated = true;
            logger.info('✅ MemoryManager initialized and validated successfully');
            
        } catch (error) {
            logger.error('❌ MemoryManager initialization failed', { error });
            throw new Error(`MemoryManager initialization failed: ${error}`);
        }
    }

    /**
     * Phase 2: コアサービス初期化
     */
    private async _initializeCoreServices(geminiClient: GeminiClient): Promise<void> {
        logger.info('🔧 Phase 2: Initializing core services with MemoryManager injection...');

        if (!this.memoryManager) {
            throw new Error('MemoryManager not available for core services initialization');
        }

        try {
            // NarrativeAnalysisService を MemoryManager と共に初期化
            const narrativeOptions: NarrativeAnalysisOptions = {
                memoryManager: this.memoryManager,  // 🔥 重要: MemoryManagerを明示的に注入
                geminiClient: geminiClient,
                genre: 'classic',
                enableMemoryIntegration: true,
                enableCacheOptimization: true,
                enableQualityAssurance: true
            };

            this.narrativeAnalysisService = new NarrativeAnalysisService(narrativeOptions);
            await this.narrativeAnalysisService.initialize();
            
            this.state.coreServicesInitialized = true;
            logger.info('✅ Core services initialized successfully');
            
        } catch (error) {
            logger.error('❌ Core services initialization failed', { error });
            throw new Error(`Core services initialization failed: ${error}`);
        }
    }

    /**
     * Phase 3: 統合レイヤー初期化
     */
    private async _initializeIntegrationLayer(geminiClient: GeminiClient): Promise<void> {
        logger.info('🔗 Phase 3: Initializing integration layer...');

        if (!this.memoryManager || !this.narrativeAnalysisService) {
            throw new Error('Prerequisites not available for integration layer initialization');
        }

        try {
            // GeminiAdapter初期化
            const geminiAdapter = new GeminiAdapter(geminiClient);
            
            // AnalysisCoordinator をMemoryManagerと共に初期化
            const analysisCoordinator = new AnalysisCoordinator(
                geminiAdapter,
                this.memoryManager,  // 🔥 重要: MemoryManagerを注入
                storageProvider
            );

            // OptimizationCoordinator初期化
            const optimizationCoordinator = new OptimizationCoordinator(
                geminiAdapter,
                this.narrativeAnalysisService  // 🔥 重要: 初期化済みのNarrativeAnalysisServiceを注入
            );

            // パイプライン初期化
            const preGenerationPipeline = new PreGenerationPipeline(
                analysisCoordinator,
                optimizationCoordinator
            );

            const postGenerationPipeline = new PostGenerationPipeline(
                analysisCoordinator,
                optimizationCoordinator
            );

            // ContentAnalysisManager初期化
            this.contentAnalysisManager = new ContentAnalysisManager(
                preGenerationPipeline,
                postGenerationPipeline
            );

            // ヘルスチェック実行
            const healthCheck = await this.contentAnalysisManager.healthCheck();
            if (healthCheck.status === 'unhealthy') {
                if (!this.config.enableFallbackMode) {
                    throw new Error('ContentAnalysisManager health check failed');
                }
                logger.warn('ContentAnalysisManager unhealthy but fallback mode enabled', {
                    details: healthCheck.details
                });
            }

            this.state.integrationLayerInitialized = true;
            logger.info('✅ Integration layer initialized successfully');
            
        } catch (error) {
            logger.error('❌ Integration layer initialization failed', { error });
            throw new Error(`Integration layer initialization failed: ${error}`);
        }
    }

    /**
     * Phase 4: 最終検証
     */
    private async _performFinalValidation(): Promise<void> {
        logger.info('🔍 Phase 4: Performing final system validation...');

        try {
            // 全コンポーネントの存在確認
            if (!this.memoryManager || !this.contentAnalysisManager || !this.narrativeAnalysisService) {
                throw new Error('Not all components are properly initialized');
            }

            // 統合テスト（軽量版）
            const testChapterNumber = 0;
            
            // MemoryManagerの動作確認
            const systemStatus = await this.memoryManager.getSystemStatus();
            if (!systemStatus.initialized) {
                throw new Error('MemoryManager validation failed');
            }

            // ContentAnalysisManagerの動作確認
            const healthCheck = await this.contentAnalysisManager.healthCheck();
            if (healthCheck.status === 'unhealthy' && !this.config.enableFallbackMode) {
                throw new Error('ContentAnalysisManager validation failed');
            }

            // NarrativeAnalysisServiceの動作確認
            const narrativeDiagnostics = await this.narrativeAnalysisService.performDiagnostics();
            if (narrativeDiagnostics.serviceHealth === 'CRITICAL' && !this.config.enableFallbackMode) {
                throw new Error('NarrativeAnalysisService validation failed');
            }

            logger.info('✅ Final system validation completed successfully');
            
        } catch (error) {
            logger.error('❌ Final validation failed', { error });
            throw new Error(`Final validation failed: ${error}`);
        }
    }

    /**
     * ContentAnalysisManager取得（安全）
     */
    getContentAnalysisManager(): ContentAnalysisManager {
        if (!this.initialized || !this.contentAnalysisManager) {
            throw new Error('ContentAnalysisManager not available. Ensure system is initialized first.');
        }
        return this.contentAnalysisManager;
    }

    /**
     * MemoryManager取得（安全）
     */
    getMemoryManager(): MemoryManager {
        if (!this.initialized || !this.memoryManager) {
            throw new Error('MemoryManager not available. Ensure system is initialized first.');
        }
        return this.memoryManager;
    }

    /**
     * NarrativeAnalysisService取得（安全）
     */
    getNarrativeAnalysisService(): NarrativeAnalysisService {
        if (!this.initialized || !this.narrativeAnalysisService) {
            throw new Error('NarrativeAnalysisService not available. Ensure system is initialized first.');
        }
        return this.narrativeAnalysisService;
    }

    /**
     * システム状態の取得
     */
    getSystemState(): SystemInitializationState {
        return { ...this.state };
    }

    /**
     * システムの健全性確認
     */
    async isSystemHealthy(): Promise<boolean> {
        try {
            if (!this.initialized) return false;

            // 各コンポーネントの健全性チェック
            const memoryStatus = await this.memoryManager?.getSystemStatus();
            const analysisHealth = await this.contentAnalysisManager?.healthCheck();
            const narrativeHealth = await this.narrativeAnalysisService?.performDiagnostics();

            return !!(
                memoryStatus?.initialized &&
                analysisHealth?.status !== 'unhealthy' &&
                narrativeHealth?.serviceHealth !== 'CRITICAL'
            );
        } catch (error) {
            logger.error('Health check failed', { error });
            return false;
        }
    }

    /**
     * システムリセット（開発・テスト用）
     */
    static resetInstance(): void {
        IntegratedSystemFactory.instance = null;
        logger.info('IntegratedSystemFactory instance reset');
    }
}

/**
 * @class NovelGenerationEngineFactory
 * @description NovelGenerationEngine用の統合ファクトリー（記憶改装システム対応）
 */
export class NovelGenerationEngineFactory {
    private systemFactory: IntegratedSystemFactory;

    constructor(private config: IntegratedSystemFactoryConfig) {
        this.systemFactory = IntegratedSystemFactory.getInstance(config);
    }

    /**
     * 完全に初期化されたNovelGenerationEngineを作成
     */
    async createInitializedEngine(
        geminiClient: GeminiClient,
        promptGenerator: any
    ): Promise<{
        memoryManager: MemoryManager;
        contentAnalysisManager: ContentAnalysisManager;
        systemState: SystemInitializationState;
    }> {
        logger.info('🏭 Creating fully initialized NovelGenerationEngine components...');

        try {
            // システム全体の初期化
            await this.systemFactory.initializeSystem(geminiClient);

            // 初期化済みコンポーネントの取得
            const memoryManager = this.systemFactory.getMemoryManager();
            const contentAnalysisManager = this.systemFactory.getContentAnalysisManager();
            const systemState = this.systemFactory.getSystemState();

            // 最終健全性チェック
            const isHealthy = await this.systemFactory.isSystemHealthy();
            if (!isHealthy && !this.config.enableFallbackMode) {
                throw new Error('System health check failed after initialization');
            }

            logger.info('✅ NovelGenerationEngine components created successfully', {
                systemHealth: isHealthy,
                state: systemState
            });

            return {
                memoryManager,
                contentAnalysisManager,
                systemState
            };

        } catch (error) {
            logger.error('❌ Failed to create NovelGenerationEngine components', { error });
            throw new Error(`NovelGenerationEngine component creation failed: ${error}`);
        }
    }
}

/**
 * デフォルト設定
 */
export const createDefaultFactoryConfig = (): IntegratedSystemFactoryConfig => ({
    memoryManagerConfig: {
        shortTermConfig: {
            maxChapters: 10,
            cacheEnabled: true,
            autoCleanupEnabled: true,
            cleanupIntervalMinutes: 30,
            maxRetentionHours: 72
        },
        midTermConfig: {
            maxAnalysisResults: 100,
            enableEvolutionTracking: true,
            enableProgressionAnalysis: true,
            qualityThreshold: 0.8,
            enableCrossComponentAnalysis: true,
            enableRealTimeQualityMonitoring: true,
            enablePerformanceOptimization: true
        },
        longTermConfig: {
            enableAutoLearning: true,
            consolidationInterval: 30,
            archiveOldData: true,
            enablePredictiveAnalysis: true,
            qualityThreshold: 0.8
        },
        integrationEnabled: true,
        enableQualityAssurance: true,
        enableAutoBackup: true,
        enablePerformanceOptimization: true,
        enableDataMigration: true,
        cacheSettings: {
            sizeLimit: 1024 * 1024 * 100, // 100MB
            entryLimit: 10000,
            cleanupInterval: 30 * 60 * 1000 // 30分
        },
        optimizationSettings: {
            enablePredictiveAccess: true,
            enableConsistencyValidation: true,
            enablePerformanceMonitoring: true
        },
        qualityAssurance: {
            enableRealTimeMonitoring: true,
            enablePredictiveAnalysis: true,
            enableAutomaticRecovery: true,
            checkInterval: 60000, // 1分
            alertThresholds: {
                dataIntegrity: 0.95,
                systemStability: 0.90,
                performance: 0.85,
                operationalEfficiency: 0.80
            }
        },
        backup: {
            enabled: true,
            schedule: {
                fullBackupInterval: 24 * 60 * 60 * 1000, // 24時間
                incrementalInterval: 60 * 60 * 1000,      // 1時間
                maxBackupCount: 30,
                retentionDays: 7
            },
            compression: {
                enabled: true,
                level: 6
            }
        }
    },
    enableFallbackMode: true,    // プロダクション環境では推奨
    validationTimeout: 30000,    // 30秒
    retryAttempts: 3
});

/**
 * 簡易ファクトリー関数（即座に使用可能）
 */
export async function createIntegratedNovelGenerationSystem(
    geminiClient: GeminiClient,
    promptGenerator: any,
    customConfig?: Partial<IntegratedSystemFactoryConfig>
): Promise<{
    memoryManager: MemoryManager;
    contentAnalysisManager: ContentAnalysisManager;
    systemState: SystemInitializationState;
}> {
    const config = { ...createDefaultFactoryConfig(), ...customConfig };
    const factory = new NovelGenerationEngineFactory(config);
    
    return await factory.createInitializedEngine(geminiClient, promptGenerator);
}