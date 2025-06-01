// src/lib/learning-journey/index.ts

/**
 * @fileoverview 学びの物語システム統合モジュール（統合記憶階層システム完全対応版）
 * @description
 * 「魂のこもった学びの物語」を実現するためのコンポーネントを統合する最適化されたモジュール。
 * 新しい統合記憶階層システムと完全統合し、型安全性・パフォーマンス・エラーハンドリングを全て最適化。
 */

// コアコンポーネント
export {
    ConceptLearningManager,
    LearningStage,
    type BusinessConcept,
    type LearningRecord,
    type EmbodimentPlan
} from './concept-learning-manager';

export {
    StoryTransformationDesigner,
    type Section,
    type SceneRecommendation,
    type TensionRecommendation
} from './story-transformation-designer';

export {
    EmotionalLearningIntegrator,
    type EmotionalArcDesign,
    type EmotionalDimension,
    type EmpatheticPoint,
    type CatharticExperience,
    type EmotionLearningSyncMetrics
} from './emotional-learning-integrator';

// 支援コンポーネント
export {
    ContextManager,
    type StoryContext
} from './context-manager';

export {
    PromptGenerator,
    PromptType,
    type ChapterGenerationOptions,
    type DialogueGenerationOptions
} from './prompt-generator';

export {
    EventBus,
    type EventType,
    type EventHandler,
    eventBus
} from './event-bus';

// 統合記憶階層システム関連
import { GeminiClient } from '@/lib/generation/gemini-client';
import { ConceptLearningManager, LearningStage } from './concept-learning-manager';
import { StoryTransformationDesigner } from './story-transformation-designer';
import { EmotionalLearningIntegrator } from './emotional-learning-integrator';
import { ContextManager } from './context-manager';
import { PromptGenerator } from './prompt-generator';
import { EventBus, eventBus } from './event-bus';
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { CharacterManager } from '@/lib/characters/manager';
import { logger } from '@/lib/utils/logger';
import { withTimeout } from '@/lib/utils/promise-utils';
import { Chapter } from '@/types/chapters';
import { 
    SystemOperationResult,
    MemoryLevel,
    MemorySystemStatus as UnifiedMemorySystemStatus,
    SystemHealth
} from '@/lib/memory/core/types';

/**
 * システム設定インターフェース
 */
export interface LearningJourneySystemConfig {
    // 統合記憶システム設定
    memorySystemIntegration: {
        enabled: boolean;
        maxRetries: number;
        timeoutMs: number;
        fallbackEnabled: boolean;
    };
    
    // コンポーネント初期化設定
    initialization: {
        timeoutMs: number;
        criticalComponentsRequired: string[];
        allowPartialInitialization: boolean;
    };
    
    // パフォーマンス設定
    performance: {
        enableCaching: boolean;
        enableOptimization: boolean;
        enableDiagnostics: boolean;
        maxProcessingTimeMs: number;
    };
    
    // エラーハンドリング設定
    errorHandling: {
        enableGracefulDegradation: boolean;
        maxFailureCount: number;
        autoRecovery: boolean;
    };
}

/**
 * システム統計情報
 */
interface SystemStatistics {
    initialization: {
        totalTime: number;
        componentsInitialized: number;
        componentsActive: number;
        memorySystemIntegrated: boolean;
    };
    performance: {
        totalOperations: number;
        successfulOperations: number;
        failedOperations: number;
        averageProcessingTime: number;
        memorySystemHits: number;
        cacheEfficiencyRate: number;
    };
    lastOptimization: string;
    systemHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
}

/**
 * コンポーネント状態管理
 */
interface ComponentStatus {
    conceptManager: { initialized: boolean; functional: boolean; };
    storyDesigner: { initialized: boolean; functional: boolean; };
    emotionalIntegrator: { initialized: boolean; functional: boolean; };
    contextManager: { initialized: boolean; functional: boolean; };
    promptGenerator: { initialized: boolean; functional: boolean; };
    memorySystem: { initialized: boolean; healthy: boolean; };
}

/**
 * 標準コンポーネント状態
 */
interface StandardComponentStatus {
    initialized: boolean;
    functional: boolean;
}

/**
 * ローカルメモリシステム状態（独自拡張）
 */
interface LocalMemorySystemStatus {
    initialized: boolean;
    healthy: boolean;
}

/**
 * @class LearningJourneySystem
 * @description
 * 「魂のこもった学びの物語」システムのメインファサードクラス。
 * 統合記憶階層システムと完全統合し、最適化されたパフォーマンスとエラーハンドリングを提供。
 */
export class LearningJourneySystem {
    private initialized: boolean = false;
    private config: LearningJourneySystemConfig;
    
    // コンポーネント
    private conceptManager!: ConceptLearningManager;
    private storyDesigner!: StoryTransformationDesigner;
    private emotionalIntegrator!: EmotionalLearningIntegrator;
    private contextManager!: ContextManager;
    private promptGenerator!: PromptGenerator;
    
    // 状態管理
    private componentStatus: ComponentStatus = {
        conceptManager: { initialized: false, functional: false },
        storyDesigner: { initialized: false, functional: false },
        emotionalIntegrator: { initialized: false, functional: false },
        contextManager: { initialized: false, functional: false },
        promptGenerator: { initialized: false, functional: false },
        memorySystem: { initialized: false, healthy: false }
    };
    
    // パフォーマンス統計
    private statistics: SystemStatistics = {
        initialization: {
            totalTime: 0,
            componentsInitialized: 0,
            componentsActive: 0,
            memorySystemIntegrated: false
        },
        performance: {
            totalOperations: 0,
            successfulOperations: 0,
            failedOperations: 0,
            averageProcessingTime: 0,
            memorySystemHits: 0,
            cacheEfficiencyRate: 0
        },
        lastOptimization: new Date().toISOString(),
        systemHealth: 'HEALTHY'
    };

    /**
     * コンストラクタ - 依存注入パターンの完全実装
     * @param geminiClient AIモデルとの通信を行うクライアント
     * @param memoryManager 統合記憶管理システム
     * @param characterManager キャラクター管理（オプション）
     * @param config システム設定（オプション）
     */
    constructor(
        private geminiClient: GeminiClient,
        private memoryManager: MemoryManager,
        private characterManager?: CharacterManager,
        config?: Partial<LearningJourneySystemConfig>
    ) {
        // 設定の完全検証と初期化
        this.validateDependencies();
        this.config = this.mergeWithDefaults(config);
        this.initializeInternalState();

        logger.info('LearningJourneySystem created with unified memory system integration');
    }

    /**
     * 依存関係の検証
     * @private
     */
    private validateDependencies(): void {
        if (!this.geminiClient) {
            throw new Error('GeminiClient is required for LearningJourneySystem initialization');
        }
        if (!this.memoryManager) {
            throw new Error('MemoryManager is required for LearningJourneySystem initialization');
        }
    }

    /**
     * デフォルト設定とのマージ
     * @private
     */
    private mergeWithDefaults(config?: Partial<LearningJourneySystemConfig>): LearningJourneySystemConfig {
        return {
            memorySystemIntegration: {
                enabled: true,
                maxRetries: 3,
                timeoutMs: 30000,
                fallbackEnabled: true,
                ...config?.memorySystemIntegration
            },
            initialization: {
                timeoutMs: 15000,
                criticalComponentsRequired: ['conceptManager', 'promptGenerator'],
                allowPartialInitialization: true,
                ...config?.initialization
            },
            performance: {
                enableCaching: true,
                enableOptimization: true,
                enableDiagnostics: true,
                maxProcessingTimeMs: 10000,
                ...config?.performance
            },
            errorHandling: {
                enableGracefulDegradation: true,
                maxFailureCount: 5,
                autoRecovery: true,
                ...config?.errorHandling
            }
        };
    }

    /**
     * 内部状態の初期化
     * @private
     */
    private initializeInternalState(): void {
        // イベントバスの初期化確認
        if (!eventBus.isInitialized()) {
            eventBus.initialize();
        }
    }

    /**
     * システム全体の初期化（統合記憶階層システム完全対応版）
     * @param storyId 物語ID
     */
    async initialize(storyId: string): Promise<void> {
        if (this.initialized) {
            logger.info('LearningJourneySystem already initialized');
            return;
        }

        const startTime = Date.now();

        try {
            logger.info(`Initializing LearningJourneySystem for story ${storyId} with unified memory integration...`);

            // 1. MemoryManagerの状態確認と初期化
            await this.ensureMemorySystemReady();

            // 2. コンポーネントの作成
            this.createComponents();

            // 3. コンポーネントの並列初期化（タイムアウトと段階的フォールバック）
            await this.initializeComponentsWithFallback(storyId);

            // 4. システム状態の検証
            this.validateSystemState();

            // 5. 最適化の実行
            if (this.config.performance.enableOptimization) {
                await this.performInitialOptimization();
            }

            // 6. 統計情報の更新
            this.updateInitializationStatistics(startTime);

            this.initialized = true;

            logger.info('LearningJourneySystem initialization completed successfully', {
                storyId,
                processingTime: Date.now() - startTime,
                componentsActive: this.statistics.initialization.componentsActive,
                memorySystemIntegrated: this.statistics.initialization.memorySystemIntegrated,
                systemHealth: this.statistics.systemHealth
            });

            // 初期化完了イベント発行
            eventBus.publish('system.initialized', {
                storyId,
                systemHealth: this.statistics.systemHealth,
                componentsActive: this.statistics.initialization.componentsActive,
                memorySystemIntegrated: this.statistics.initialization.memorySystemIntegrated,
                processingTime: Date.now() - startTime
            });

        } catch (error) {
            await this.handleInitializationFailure(error, startTime, storyId);
        }
    }

    /**
     * MemoryManagerの準備状態を確認・確保
     * @private
     */
    private async ensureMemorySystemReady(): Promise<void> {
        if (!this.config.memorySystemIntegration.enabled) {
            logger.info('Memory system integration disabled');
            this.updateMemorySystemStatus(false, false);
            return;
        }

        try {
            logger.info('Verifying memory system readiness...');

            // システム状態の確認（注意点.mdに基づく正しいAPI使用）
            const systemStatus = await this.safeMemoryOperation(
                () => this.memoryManager.getSystemStatus(),
                null,
                'ensureMemorySystemReady'
            );

            if (systemStatus && systemStatus.initialized) {
                this.updateMemorySystemStatus(true, true);
                this.statistics.initialization.memorySystemIntegrated = true;
                logger.info('Memory system verified as ready');
            } else {
                logger.warn('Memory system not properly initialized, enabling fallback mode');
                this.updateMemorySystemStatus(false, false);
                
                if (!this.config.memorySystemIntegration.fallbackEnabled) {
                    throw new Error('Memory system required but not available');
                }
            }

        } catch (error) {
            logger.error('Memory system verification failed', {
                error: error instanceof Error ? error.message : String(error)
            });

            if (this.config.memorySystemIntegration.fallbackEnabled) {
                this.updateMemorySystemStatus(false, false);
                logger.info('Continuing with limited functionality (memory system disabled)');
            } else {
                throw error;
            }
        }
    }

    /**
     * コンポーネントの作成
     * @private
     */
    private createComponents(): void {
        try {
            // ConceptLearningManager
            this.conceptManager = new ConceptLearningManager(
                this.memoryManager,
                this.geminiClient,
                eventBus
            );

            // StoryTransformationDesigner  
            this.storyDesigner = new StoryTransformationDesigner(
                this.memoryManager,
                this.geminiClient,
                eventBus
            );

            // EmotionalLearningIntegrator
            this.emotionalIntegrator = new EmotionalLearningIntegrator(
                this.memoryManager,
                this.geminiClient,
                eventBus
            );

            // ContextManager
            this.contextManager = new ContextManager(
                eventBus,
                this.memoryManager,
                this.characterManager
            );

            // PromptGenerator
            this.promptGenerator = new PromptGenerator(eventBus);

            logger.debug('All components created successfully');

        } catch (error) {
            logger.error('Failed to create components', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * コンポーネントの並列初期化（フォールバック対応）
     * @private
     */
    private async initializeComponentsWithFallback(storyId: string): Promise<void> {
        logger.info('Initializing components with fallback support...');

        // 初期化タスクの定義
        const initializationTasks = [
            {
                name: 'conceptManager' as const,
                critical: true,
                task: () => this.conceptManager.initialize()
            },
            {
                name: 'storyDesigner' as const,
                critical: false,
                task: () => this.storyDesigner.initialize()
            },
            {
                name: 'emotionalIntegrator' as const,
                critical: false,
                task: () => this.emotionalIntegrator.initialize()
            },
            {
                name: 'promptGenerator' as const,
                critical: true,
                task: () => Promise.resolve(this.promptGenerator.initialize())
            },
            {
                name: 'contextManager' as const,
                critical: false,
                task: () => this.contextManager.initialize(storyId)
            }
        ];

        // 並列初期化の実行
        const initPromises = initializationTasks.map(async ({ name, critical, task }) => {
            try {
                await withTimeout(
                    task(),
                    this.config.initialization.timeoutMs,
                    `${name} initialization`
                );

                this.updateComponentStatus(name, true, true);
                this.statistics.initialization.componentsInitialized++;

                logger.debug(`${name} initialized successfully`);
                return { name, success: true, critical };

            } catch (error) {
                logger.error(`${name} initialization failed`, {
                    error: error instanceof Error ? error.message : String(error),
                    critical
                });

                this.updateComponentStatus(name, false, false);

                return { name, success: false, critical, error };
            }
        });

        // 結果の評価
        const results = await Promise.allSettled(initPromises);
        const successCount = results.filter(r => 
            r.status === 'fulfilled' && r.value.success
        ).length;

        // クリティカルコンポーネントの確認
        const criticalFailures = results
            .filter(r => r.status === 'fulfilled' && !r.value.success && r.value.critical)
            .map(r => r.status === 'fulfilled' ? r.value.name : 'unknown');

        if (criticalFailures.length > 0 && !this.config.initialization.allowPartialInitialization) {
            throw new Error(`Critical components failed to initialize: ${criticalFailures.join(', ')}`);
        }

        // アクティブコンポーネント数の更新
        this.statistics.initialization.componentsActive = successCount;

        logger.info(`Component initialization completed`, {
            total: initializationTasks.length,
            successful: successCount,
            criticalFailures: criticalFailures.length,
            allowPartial: this.config.initialization.allowPartialInitialization
        });
    }

    /**
     * システム状態の検証
     * @private
     */
    private validateSystemState(): void {
        const criticalComponents = this.config.initialization.criticalComponentsRequired;
        const availableComponents = Object.entries(this.componentStatus)
            .filter(([name, status]) => {
                if (name === 'memorySystem') {
                    return false; // メモリシステムは別途評価
                }
                return (status as StandardComponentStatus).functional;
            })
            .map(([name]) => name);

        const missingCritical = criticalComponents.filter(
            comp => !availableComponents.includes(comp)
        );

        if (missingCritical.length > 0) {
            this.statistics.systemHealth = 'CRITICAL';
            if (!this.config.initialization.allowPartialInitialization) {
                throw new Error(`Critical components not functional: ${missingCritical.join(', ')}`);
            }
        } else if (availableComponents.length < Object.keys(this.componentStatus).length - 1) {
            this.statistics.systemHealth = 'DEGRADED';
        } else {
            this.statistics.systemHealth = 'HEALTHY';
        }

        logger.info(`System state validated`, {
            systemHealth: this.statistics.systemHealth,
            availableComponents: availableComponents.length,
            criticalMissing: missingCritical.length
        });
    }

    /**
     * 初期最適化の実行
     * @private
     */
    private async performInitialOptimization(): Promise<void> {
        if (!this.config.performance.enableOptimization) {
            return;
        }

        try {
            logger.info('Performing initial system optimization...');

            // メモリシステムの最適化
            if (this.componentStatus.memorySystem.healthy) {
                await this.safeMemoryOperation(
                    () => this.memoryManager.optimizeSystem(),
                    null,
                    'performInitialOptimization'
                );
            }

            // コンポーネント個別の最適化
            const optimizationTasks = [];

            if (this.componentStatus.conceptManager.functional) {
                optimizationTasks.push(
                    this.conceptManager.optimizeSystem().catch(error => {
                        logger.warn('ConceptManager optimization failed', { error });
                        return null;
                    })
                );
            }

            if (optimizationTasks.length > 0) {
                await Promise.allSettled(optimizationTasks);
            }

            this.statistics.lastOptimization = new Date().toISOString();
            logger.debug('Initial optimization completed');

        } catch (error) {
            logger.warn('Initial optimization failed', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 初期化統計の更新
     * @private
     */
    private updateInitializationStatistics(startTime: number): void {
        this.statistics.initialization.totalTime = Date.now() - startTime;
        
        // パフォーマンス統計の初期化
        this.statistics.performance.totalOperations = 0;
        this.statistics.performance.successfulOperations = 0;
        this.statistics.performance.failedOperations = 0;
        this.statistics.performance.averageProcessingTime = this.statistics.initialization.totalTime;
        
        if (this.componentStatus.memorySystem.healthy) {
            this.statistics.performance.memorySystemHits = 1;
            this.statistics.performance.cacheEfficiencyRate = 0.8; // 初期推定値
        }
    }

    /**
     * 初期化失敗の処理
     * @private
     */
    private async handleInitializationFailure(
        error: unknown, 
        startTime: number, 
        storyId: string
    ): Promise<void> {
        const processingTime = Date.now() - startTime;
        this.statistics.systemHealth = 'CRITICAL';

        logger.error('LearningJourneySystem initialization failed', {
            error: error instanceof Error ? error.message : String(error),
            storyId,
            processingTime,
            componentStatus: this.componentStatus
        });

        if (this.config.errorHandling.enableGracefulDegradation) {
            logger.info('Attempting graceful degradation...');
            
            try {
                // 最小限の初期化（プロンプト生成のみ）
                if (!this.componentStatus.promptGenerator.functional) {
                    this.promptGenerator.initialize();
                    this.componentStatus.promptGenerator = { initialized: true, functional: true };
                }

                this.initialized = true;
                this.statistics.systemHealth = 'DEGRADED';
                this.statistics.initialization.totalTime = Date.now() - startTime;

                logger.info('LearningJourneySystem initialized in degraded mode', {
                    storyId,
                    processingTime: this.statistics.initialization.totalTime
                });

                return;

            } catch (degradationError) {
                logger.error('Graceful degradation also failed', {
                    error: degradationError instanceof Error ? degradationError.message : String(degradationError)
                });
            }
        }

        throw error;
    }

    /**
     * 章生成のためのプロンプトを作成する（統合記憶階層システム完全対応版）
     * @param chapterNumber 章番号
     * @returns 生成プロンプト
     */
    async generateChapterPrompt(chapterNumber: number): Promise<string> {
        const startTime = Date.now();
        
        try {
            this.ensureInitialized();
            this.updatePerformanceStatistics('start');

            logger.info(`Generating prompt for chapter ${chapterNumber} with unified memory integration`);

            // 1. コンテキストの取得（フォールバック対応）
            const context = await this.getContextWithFallback();

            // 2. 章が属する篇の取得
            const section = await this.getSectionWithFallback(chapterNumber);

            // 3. 概念と学習段階の取得
            const conceptName = section?.mainConcept || context.mainConcept;
            const learningStage = await this.getLearningStageWithFallback(conceptName, chapterNumber);

            // 4. シーン推奨の生成
            const sceneRecommendations = await this.getSceneRecommendationsWithFallback(
                conceptName, learningStage, chapterNumber
            );

            // 5. 感情学習設計の生成
            const emotionalArc = await this.getEmotionalArcWithFallback(
                conceptName, learningStage, chapterNumber
            );

            // 6. カタルシス体験の生成
            const catharticExperience = await this.getCatharticExperienceWithFallback(
                conceptName, learningStage, chapterNumber
            );

            // 7. 共感ポイントの生成
            const empatheticPoints = await this.getEmpatheticPointsWithFallback(
                '', conceptName, learningStage
            );

            // 8. 前章要約の取得
            const previousChapterSummary = this.getPreviousChapterSummary(context, chapterNumber);

            // 9. 関連記憶の取得
            const relevantMemories = await this.getRelevantMemoriesWithFallback(chapterNumber);

            // 10. プロンプト生成オプションの組み立て
            const chapterOptions = {
                chapterNumber,
                suggestedTitle: section ? 
                    this.generateChapterTitle(section, chapterNumber) : undefined,
                conceptName,
                learningStage,
                sceneRecommendations,
                emotionalArc,
                catharticExperience: catharticExperience || undefined,
                empatheticPoints,
                previousChapterSummary,
                relevantMemories,
                mainCharacters: context.mainCharacters,
                targetLength: { min: 3000, max: 6000 }
            };

            // 11. プロンプトの生成
            const prompt = this.promptGenerator.generateChapterPrompt(context, chapterOptions);

            // 12. 統計の更新
            const processingTime = Date.now() - startTime;
            this.updatePerformanceStatistics('success', processingTime);

            logger.info(`Successfully generated prompt for chapter ${chapterNumber}`, {
                processingTime,
                memorySystemUsed: this.componentStatus.memorySystem.healthy,
                componentsUsed: this.getActiveComponentCount()
            });

            return prompt;

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updatePerformanceStatistics('error', processingTime);

            logger.error(`Failed to generate prompt for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                processingTime
            });

            // エラー時は簡易プロンプトを返す
            return this.generateSimpleChapterPrompt(chapterNumber);
        }
    }

    /**
     * 章の内容を処理して学習進捗を更新する（統合記憶階層システム完全対応版）
     * @param chapterNumber 章番号
     * @param content 章内容
     * @param title 章タイトル
     */
    async processChapterContent(
        chapterNumber: number,
        content: string,
        title: string
    ): Promise<void> {
        const startTime = Date.now();

        try {
            this.ensureInitialized();
            this.updatePerformanceStatistics('start');

            logger.info(`Processing content for chapter ${chapterNumber} with unified memory integration`);

            // 1. コンテキストの取得
            const context = await this.getContextWithFallback();

            // 2. 概念情報の取得
            const section = await this.getSectionWithFallback(chapterNumber);
            const conceptName = section?.mainConcept || context.mainConcept;

            // 3. 概念体現化分析（フォールバック対応）
            const embodimentAnalysis = await this.analyzeConceptEmbodimentWithFallback(
                conceptName, content, chapterNumber
            );

            // 4. 学習記録の更新
            if (this.componentStatus.conceptManager.functional && embodimentAnalysis) {
                await this.conceptManager.updateConceptWithLearningRecord(conceptName, {
                    stage: embodimentAnalysis.stage,
                    chapterNumber,
                    insights: embodimentAnalysis.examples.slice(0, 1),
                    examples: embodimentAnalysis.examples.slice(1)
                }).catch(error => {
                    logger.warn('Failed to update concept learning record', { error });
                });
            }

            // 5. 感情分析の実行
            const emotionAnalysis = await this.analyzeChapterEmotionWithFallback(content);

            // 6. 感情と学習の同期度分析
            const syncMetrics = await this.analyzeSynchronizationWithFallback(
                content, conceptName, embodimentAnalysis?.stage
            );

            // 7. 章要約の生成
            const chapterSummary = await this.generateChapterSummaryWithFallback(content);

            // 8. 統合記憶システムへの章データ保存
            const saveSuccess = await this.saveChapterToMemoryWithFallback(
                chapterNumber, { title, content, summary: chapterSummary }
            );

            // 9. コンテキストの更新
            if (this.componentStatus.contextManager.functional) {
                await this.contextManager.updateContext({
                    currentChapter: chapterNumber,
                    currentLearningStage: embodimentAnalysis?.stage || context.currentLearningStage
                }).catch(error => {
                    logger.warn('Failed to update context', { error });
                });
            }

            // 10. イベントの発行
            eventBus.publish('context.updated', {
                storyId: context.storyId,
                action: 'chapter_processed',
                chapterNumber,
                conceptName,
                learningStage: embodimentAnalysis?.stage,
                memorySystemIntegrated: saveSuccess,
                processingTime: Date.now() - startTime
            });

            // 11. 統計の更新
            const processingTime = Date.now() - startTime;
            this.updatePerformanceStatistics('success', processingTime);

            logger.info(`Successfully processed content for chapter ${chapterNumber}`, {
                processingTime,
                learningStage: embodimentAnalysis?.stage,
                emotionalImpact: emotionAnalysis?.emotionalImpact || 0,
                syncMetrics: syncMetrics ? {
                    peakSynchronization: syncMetrics.peakSynchronization,
                    emotionalResonance: syncMetrics.emotionalResonance
                } : null,
                memorySystemUsed: saveSuccess
            });

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updatePerformanceStatistics('error', processingTime);

            logger.error(`Failed to process content for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                processingTime
            });

            // エラー時でも基本的な章保存は試行
            await this.saveChapterToMemoryWithFallback(chapterNumber, {
                title,
                content,
                summary: this.extractSimpleSummary(content)
            });
        }
    }

    // ============================================================================
    // フォールバック対応ヘルパーメソッド群
    // ============================================================================

    /**
     * 安全なメモリ操作パターン（統合記憶階層システム対応）
     * @private
     */
    private async safeMemoryOperation<T>(
        operation: () => Promise<T>,
        fallbackValue: T,
        operationName: string
    ): Promise<T> {
        if (!this.config.memorySystemIntegration.enabled || !this.componentStatus.memorySystem.healthy) {
            return fallbackValue;
        }

        let retries = 0;
        const maxRetries = this.config.memorySystemIntegration.maxRetries;

        while (retries < maxRetries) {
            try {
                const result = await Promise.race([
                    operation(),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('Operation timeout')), 
                                   this.config.memorySystemIntegration.timeoutMs)
                    )
                ]);

                if (retries > 0) {
                    logger.info(`${operationName} succeeded after ${retries} retries`);
                }

                this.statistics.performance.memorySystemHits++;
                return result;

            } catch (error) {
                retries++;
                logger.warn(`${operationName} failed (attempt ${retries}/${maxRetries})`, {
                    error: error instanceof Error ? error.message : String(error)
                });

                if (retries >= maxRetries) {
                    logger.error(`${operationName} failed after ${maxRetries} attempts, using fallback`);
                    return fallbackValue;
                }

                // 指数バックオフで再試行
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
            }
        }

        return fallbackValue;
    }

    /**
     * コンテキスト取得（フォールバック対応）
     * @private
     */
    private async getContextWithFallback(): Promise<any> {
        if (this.componentStatus.contextManager.functional) {
            const context = this.contextManager.getContext();
            if (context) {
                return context;
            }
        }

        // フォールバック：デフォルトコンテキスト
        return {
            storyId: 'default-story',
            currentChapter: 1,
            mainConcept: 'ISSUE DRIVEN',
            recentChapters: [],
            mainCharacters: [],
            recentThemes: [],
            currentLearningStage: 'MISCONCEPTION'
        };
    }

    /**
     * セクション取得（フォールバック対応）
     * @private
     */
    private async getSectionWithFallback(chapterNumber: number): Promise<any> {
        if (this.componentStatus.storyDesigner.functional) {
            try {
                return this.storyDesigner.getSectionByChapter(chapterNumber);
            } catch (error) {
                logger.warn('Failed to get section from StoryDesigner', { error });
            }
        }

        // フォールバック：デフォルトセクション
        return {
            id: 'default-section',
            number: 1,
            title: '学びの始まり',
            mainConcept: 'ISSUE DRIVEN',
            startChapter: 1,
            endChapter: 10
        };
    }

    /**
     * 学習段階取得（フォールバック対応）
     * @private
     */
    private async getLearningStageWithFallback(
        conceptName: string, 
        chapterNumber: number
    ): Promise<LearningStage> {
        if (this.componentStatus.conceptManager.functional) {
            try {
                return await this.conceptManager.determineLearningStage(conceptName, chapterNumber);
            } catch (error) {
                logger.warn('Failed to determine learning stage', { error });
            }
        }

        // フォールバック：章番号ベースの簡易判定
        return this.getDefaultLearningStage(chapterNumber);
    }

    /**
     * シーン推奨取得（フォールバック対応）
     * @private
     */
    private async getSceneRecommendationsWithFallback(
        conceptName: string,
        learningStage: LearningStage,
        chapterNumber: number
    ): Promise<any[]> {
        if (this.componentStatus.storyDesigner.functional) {
            try {
                return await this.storyDesigner.generateSceneRecommendations(
                    conceptName, learningStage, chapterNumber
                );
            } catch (error) {
                logger.warn('Failed to generate scene recommendations', { error });
            }
        }

        // フォールバック：デフォルト推奨
        return this.getDefaultSceneRecommendations(learningStage);
    }

    /**
     * 感情アーク取得（フォールバック対応）
     * @private
     */
    private async getEmotionalArcWithFallback(
        conceptName: string,
        learningStage: LearningStage,
        chapterNumber: number
    ): Promise<any> {
        if (this.componentStatus.emotionalIntegrator.functional) {
            try {
                return await this.emotionalIntegrator.designEmotionalArc(
                    conceptName, learningStage, chapterNumber
                );
            } catch (error) {
                logger.warn('Failed to design emotional arc', { error });
            }
        }

        // フォールバック：デフォルト感情アーク
        return this.getDefaultEmotionalArc(learningStage);
    }

    /**
     * カタルシス体験取得（フォールバック対応）
     * @private
     */
    private async getCatharticExperienceWithFallback(
        conceptName: string,
        learningStage: LearningStage,
        chapterNumber: number
    ): Promise<any> {
        if (this.componentStatus.emotionalIntegrator.functional) {
            try {
                return await this.emotionalIntegrator.designCatharticExperience(
                    conceptName, learningStage, chapterNumber
                );
            } catch (error) {
                logger.warn('Failed to design cathartic experience', { error });
            }
        }

        // カタルシス体験は必須ではないためnullを返す
        return null;
    }

    /**
     * 共感ポイント取得（フォールバック対応）
     * @private
     */
    private async getEmpatheticPointsWithFallback(
        content: string,
        conceptName: string,
        learningStage: LearningStage
    ): Promise<any[]> {
        if (this.componentStatus.emotionalIntegrator.functional) {
            try {
                return await this.emotionalIntegrator.generateEmpatheticPoints(
                    content, conceptName, learningStage
                );
            } catch (error) {
                logger.warn('Failed to generate empathetic points', { error });
            }
        }

        // フォールバック：デフォルト共感ポイント
        return this.getDefaultEmpatheticPoints(learningStage);
    }

    /**
     * 関連記憶取得（フォールバック対応）
     * @private
     */
    private async getRelevantMemoriesWithFallback(chapterNumber: number): Promise<any[]> {
        if (this.componentStatus.contextManager.functional) {
            try {
                return await this.contextManager.retrieveRelevantMemories({
                    chapterNumber: chapterNumber - 1,
                    limit: 5
                });
            } catch (error) {
                logger.warn('Failed to retrieve relevant memories', { error });
            }
        }

        // フォールバック：空配列
        return [];
    }

    /**
     * 概念体現化分析（フォールバック対応）
     * @private
     */
    private async analyzeConceptEmbodimentWithFallback(
        conceptName: string,
        content: string,
        chapterNumber: number
    ): Promise<any> {
        if (this.componentStatus.conceptManager.functional) {
            try {
                return await this.conceptManager.analyzeConceptEmbodiment(
                    conceptName, content, chapterNumber
                );
            } catch (error) {
                logger.warn('Failed to analyze concept embodiment', { error });
            }
        }

        // フォールバック：デフォルト分析
        return {
            stage: this.getDefaultLearningStage(chapterNumber),
            examples: ['基本的な学習過程'],
            confidence: 0.5
        };
    }

    /**
     * 感情分析（フォールバック対応）
     * @private
     */
    private async analyzeChapterEmotionWithFallback(content: string): Promise<any> {
        if (this.componentStatus.emotionalIntegrator.functional) {
            try {
                return await this.emotionalIntegrator.analyzeChapterEmotion(content, 'business');
            } catch (error) {
                logger.warn('Failed to analyze chapter emotion', { error });
            }
        }

        // フォールバック：デフォルト分析
        return {
            overallTone: '中立的',
            emotionalImpact: 5
        };
    }

    /**
     * 同期度分析（フォールバック対応）
     * @private
     */
    private async analyzeSynchronizationWithFallback(
        content: string,
        conceptName: string,
        stage?: LearningStage
    ): Promise<any> {
        if (this.componentStatus.emotionalIntegrator.functional && stage) {
            try {
                return await this.emotionalIntegrator.analyzeSynchronization(
                    content, conceptName, stage
                );
            } catch (error) {
                logger.warn('Failed to analyze synchronization', { error });
            }
        }

        // フォールバック：デフォルト同期指標
        return {
            peakSynchronization: 0.5,
            progressionAlignment: 0.5,
            emotionalResonance: 0.5,
            themeEmotionIntegration: 0.5,
            catharticMomentEffect: 0.4,
            measurementConfidence: 0.5
        };
    }

    /**
     * 章要約生成（フォールバック対応）
     * @private
     */
    private async generateChapterSummaryWithFallback(content: string): Promise<string> {
        try {
            const truncatedContent = content.length > 5000
                ? content.substring(0, 5000) + '...(truncated)'
                : content;

            const prompt = `
以下の章内容を200〜300文字程度で簡潔に要約してください。
ストーリーの流れ、主要な出来事、キャラクターの変化、学びのポイントを含めてください。

章内容:
${truncatedContent}

要約:
`;

            const summary = await this.geminiClient.generateText(prompt, {
                temperature: 0.3,
                targetLength: 300
            });

            return summary.trim();

        } catch (error) {
            logger.warn('Failed to generate chapter summary with AI', { error });
            return this.extractSimpleSummary(content);
        }
    }

    /**
     * 章保存（フォールバック対応）
     * @private
     */
    private async saveChapterToMemoryWithFallback(
        chapterNumber: number,
        chapterData: { title: string; content: string; summary: string; }
    ): Promise<boolean> {
        if (this.componentStatus.contextManager.functional) {
            try {
                return await this.contextManager.saveChapterToMemory(chapterNumber, {
                    ...chapterData,
                    mainEvents: this.extractMainEvents(chapterData.content)
                });
            } catch (error) {
                logger.warn('Failed to save chapter to context manager', { error });
            }
        }

        // フォールバック：統合記憶システムに直接保存を試行
        if (this.componentStatus.memorySystem.healthy) {
            try {
                // Chapter型に完全準拠した構築（注意点.mdのパターンに従う）
                const chapter: Chapter = {
                    id: `fallback-chapter-${chapterNumber}`,        // ✅ 必須
                    chapterNumber,                                  // ✅ 必須
                    title: chapterData.title,                       // ✅ 必須
                    content: chapterData.content,                   // ✅ 必須
                    previousChapterSummary: '',                     // ✅ 必須
                    scenes: [],                                     // ✅ 必須: 空配列
                    createdAt: new Date(),                          // ✅ 必須: Date型
                    updatedAt: new Date(),                          // ✅ 必須: Date型
                    metadata: {                                     // ✅ 必須オブジェクト
                        createdAt: new Date().toISOString(),
                        lastModified: new Date().toISOString(),
                        status: 'fallback_save',
                        summary: chapterData.summary,
                        wordCount: chapterData.content.length,
                        estimatedReadingTime: Math.ceil(chapterData.content.length / 1000)
                    }
                };

                const result = await this.safeMemoryOperation(
                    () => this.memoryManager.processChapter(chapter),
                    null,
                    'saveChapterToMemoryFallback'
                );

                return result?.success || false;

            } catch (error) {
                logger.warn('Failed to save chapter to memory system directly', { error });
            }
        }

        return false;
    }

    // ============================================================================
    // デフォルト値生成メソッド群
    // ============================================================================

    /**
     * デフォルト学習段階を取得
     * @private
     */
    private getDefaultLearningStage(chapterNumber: number): LearningStage {
        if (chapterNumber <= 3) return LearningStage.MISCONCEPTION;
        if (chapterNumber <= 6) return LearningStage.EXPLORATION;
        if (chapterNumber <= 9) return LearningStage.CONFLICT;
        if (chapterNumber <= 12) return LearningStage.INSIGHT;
        if (chapterNumber <= 15) return LearningStage.APPLICATION;
        return LearningStage.INTEGRATION;
    }

    /**
     * デフォルトシーン推奨を取得
     * @private
     */
    private getDefaultSceneRecommendations(learningStage: LearningStage): any[] {
        return [
            {
                type: 'LEARNING_SPECIFIC',
                description: `${this.formatLearningStage(learningStage)}段階に適したシーンを含めてください`,
                reason: `${this.formatLearningStage(learningStage)}を効果的に表現するため`
            },
            {
                type: 'CHARACTER_DEVELOPMENT',
                description: 'キャラクターの内面変化を丁寧に描写してください',
                reason: '読者の共感を促進するため'
            }
        ];
    }

    /**
     * デフォルト感情アークを取得
     * @private
     */
    private getDefaultEmotionalArc(learningStage: LearningStage): any {
        return {
            recommendedTone: 'バランスのとれた学習のトーン',
            emotionalJourney: {
                opening: [{ dimension: '関心', level: 6 }],
                development: [{ dimension: '探求', level: 7 }],
                conclusion: [{ dimension: '理解', level: 8 }]
            },
            reason: `${this.formatLearningStage(learningStage)}段階に適した感情の流れ`
        };
    }

    /**
     * デフォルト共感ポイントを取得
     * @private
     */
    private getDefaultEmpatheticPoints(learningStage: LearningStage): any[] {
        return [
            {
                type: 'character',
                position: 0.3,
                intensity: 0.7,
                description: 'キャラクターの内面的な葛藤'
            },
            {
                type: 'realization',
                position: 0.7,
                intensity: 0.8,
                description: '重要な気づきの瞬間'
            }
        ];
    }

    // ============================================================================
    // ユーティリティメソッド群
    // ============================================================================

    /**
     * 章タイトルを生成
     * @private
     */
    private generateChapterTitle(section: any, chapterNumber: number): string {
        const sectionProgress = (chapterNumber - section.startChapter) /
            (section.endChapter - section.startChapter);

        if (sectionProgress < 0.33) {
            return `${section.title}の始まり`;
        } else if (sectionProgress < 0.66) {
            return `${section.title}の展開`;
        } else {
            return `${section.title}の転機`;
        }
    }

    /**
     * 前章要約を取得
     * @private
     */
    private getPreviousChapterSummary(context: any, chapterNumber: number): string | undefined {
        const previousChapter = context.recentChapters?.find(
            (ch: any) => ch.chapterNumber === chapterNumber - 1
        );
        return previousChapter?.summary;
    }

    /**
     * 主要イベントを抽出
     * @private
     */
    private extractMainEvents(content: string): string[] {
        const sentences = content.split(/[。！？]/);
        const events: string[] = [];
        const actionKeywords = ['決めた', '始めた', '発見した', '気づいた', '変わった', '成長した', '学んだ'];

        for (const sentence of sentences) {
            if (sentence.length > 10 && actionKeywords.some(keyword => sentence.includes(keyword))) {
                events.push(sentence.trim() + '。');
                if (events.length >= 3) break;
            }
        }

        return events.length > 0 ? events : ['章の進行'];
    }

    /**
     * 簡易要約を抽出
     * @private
     */
    private extractSimpleSummary(content: string): string {
        if (content.length <= 200) {
            return content;
        }

        const sentences = content.split(/[。！？]/);
        let summary = '';
        
        for (const sentence of sentences) {
            if ((summary + sentence).length > 197) {
                break;
            }
            summary += sentence + '。';
        }

        return summary || content.substring(0, 197) + '...';
    }

    /**
     * 簡易章プロンプトを生成
     * @private
     */
    private generateSimpleChapterPrompt(chapterNumber: number): string {
        return `
あなたは「魂のこもった学びの物語」を創作するAI執筆者です。

# 第${chapterNumber}章

## 執筆ガイドライン
1. キャラクターの内面変化を通して読者に共感体験を提供する
2. ビジネス概念を説明するのではなく、キャラクターの体験を通して読者が自然と学べるようにする
3. 感情と学びが融合した物語を創る

第${chapterNumber}章の内容を執筆してください。
`;
    }

    /**
     * パフォーマンス統計を更新
     * @private
     */
    private updatePerformanceStatistics(
        result: 'start' | 'success' | 'error', 
        processingTime?: number
    ): void {
        if (result === 'start') {
            this.statistics.performance.totalOperations++;
            return;
        }

        if (result === 'success') {
            this.statistics.performance.successfulOperations++;
        } else {
            this.statistics.performance.failedOperations++;
        }

        if (processingTime !== undefined) {
            const total = this.statistics.performance.successfulOperations + 
                         this.statistics.performance.failedOperations;
            this.statistics.performance.averageProcessingTime = 
                ((this.statistics.performance.averageProcessingTime * (total - 1)) + processingTime) / total;
        }

        // キャッシュ効率率の更新
        const totalOps = this.statistics.performance.totalOperations;
        if (totalOps > 0) {
            this.statistics.performance.cacheEfficiencyRate = 
                this.statistics.performance.memorySystemHits / totalOps;
        }
    }

    /**
     * コンポーネント状態を安全に更新
     * @private
     */
    private updateComponentStatus(
        componentName: 'conceptManager' | 'storyDesigner' | 'emotionalIntegrator' | 'contextManager' | 'promptGenerator',
        initialized: boolean,
        functional: boolean
    ): void {
        switch (componentName) {
            case 'conceptManager':
                this.componentStatus.conceptManager = { initialized, functional };
                break;
            case 'storyDesigner':
                this.componentStatus.storyDesigner = { initialized, functional };
                break;
            case 'emotionalIntegrator':
                this.componentStatus.emotionalIntegrator = { initialized, functional };
                break;
            case 'contextManager':
                this.componentStatus.contextManager = { initialized, functional };
                break;
            case 'promptGenerator':
                this.componentStatus.promptGenerator = { initialized, functional };
                break;
        }
    }

    /**
     * メモリシステム状態を更新
     * @private
     */
    private updateMemorySystemStatus(initialized: boolean, healthy: boolean): void {
        this.componentStatus.memorySystem = { initialized, healthy };
    }

    /**
     * アクティブコンポーネント数を取得
     * @private
     */
    private getActiveComponentCount(): number {
        return Object.entries(this.componentStatus)
            .filter(([name, status]) => {
                if (name === 'memorySystem') {
                    return status.healthy;
                }
                return (status as StandardComponentStatus).functional;
            }).length;
    }

    /**
     * 学習段階をフォーマット
     * @private
     */
    private formatLearningStage(stage: LearningStage): string {
        const stageMapping: Record<LearningStage, string> = {
            [LearningStage.MISCONCEPTION]: '誤解',
            [LearningStage.EXPLORATION]: '探索',
            [LearningStage.CONFLICT]: '葛藤',
            [LearningStage.INSIGHT]: '気づき',
            [LearningStage.APPLICATION]: '応用',
            [LearningStage.INTEGRATION]: '統合'
        };
        
        return stageMapping[stage] || stage;
    }

    /**
     * 初期化状態を確認
     * @private
     */
    private ensureInitialized(): void {
        if (!this.initialized) {
            throw new Error('LearningJourneySystem is not initialized. Call initialize() first.');
        }
    }

    // ============================================================================
    // パブリックAPI - システム状態とアクセス
    // ============================================================================

    /**
     * 各コンポーネントへのアクセスを提供するゲッター
     */
    get concept(): ConceptLearningManager {
        this.ensureInitialized();
        if (!this.componentStatus.conceptManager.functional) {
            throw new Error('ConceptLearningManager is not functional');
        }
        return this.conceptManager;
    }

    get story(): StoryTransformationDesigner {
        this.ensureInitialized();
        if (!this.componentStatus.storyDesigner.functional) {
            throw new Error('StoryTransformationDesigner is not functional');
        }
        return this.storyDesigner;
    }

    get emotion(): EmotionalLearningIntegrator {
        this.ensureInitialized();
        if (!this.componentStatus.emotionalIntegrator.functional) {
            throw new Error('EmotionalLearningIntegrator is not functional');
        }
        return this.emotionalIntegrator;
    }

    get context(): ContextManager {
        this.ensureInitialized();
        if (!this.componentStatus.contextManager.functional) {
            throw new Error('ContextManager is not functional');
        }
        return this.contextManager;
    }

    get prompt(): PromptGenerator {
        this.ensureInitialized();
        if (!this.componentStatus.promptGenerator.functional) {
            throw new Error('PromptGenerator is not functional');
        }
        return this.promptGenerator;
    }

    get events(): EventBus {
        return eventBus;
    }

    /**
     * 初期化状態を取得する
     * @returns 初期化済みかどうか
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * システム統計を取得する
     * @returns システム統計情報
     */
    getSystemStatistics(): SystemStatistics {
        return { ...this.statistics };
    }

    /**
     * コンポーネント状態を取得する
     * @returns コンポーネント状態
     */
    getComponentStatus(): ComponentStatus {
        return { ...this.componentStatus };
    }

    /**
     * システム診断を実行する
     * @returns 診断結果
     */
    async performSystemDiagnostics(): Promise<{
        systemHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
        memorySystemStatus: UnifiedMemorySystemStatus | null;
        componentStatus: ComponentStatus;
        statistics: SystemStatistics;
        recommendations: string[];
        issues: string[];
    }> {
        const issues: string[] = [];
        const recommendations: string[] = [];

        // メモリシステム状態の確認
        let memorySystemStatus: UnifiedMemorySystemStatus | null = null;
        if (this.componentStatus.memorySystem.healthy) {
            memorySystemStatus = await this.safeMemoryOperation(
                () => this.memoryManager.getSystemStatus(),
                null,
                'diagnosticsMemorySystemStatus'
            );

            if (!memorySystemStatus?.initialized) {
                issues.push('Memory system not properly initialized');
                recommendations.push('Check memory system configuration');
            }
        } else {
            issues.push('Memory system integration not available');
            recommendations.push('Enable memory system integration for enhanced functionality');
        }

        // コンポーネント状態の分析
        const inactiveComponents = Object.entries(this.componentStatus)
            .filter(([name, status]) => {
                if (name === 'memorySystem') {
                    return false; // メモリシステムは別途評価
                }
                return !(status as StandardComponentStatus).functional;
            })
            .map(([name]) => name);

        if (inactiveComponents.length > 0) {
            issues.push(`Inactive components: ${inactiveComponents.join(', ')}`);
            recommendations.push('Restart inactive components or check their dependencies');
        }

        // パフォーマンス分析
        const successRate = this.statistics.performance.totalOperations > 0
            ? this.statistics.performance.successfulOperations / this.statistics.performance.totalOperations
            : 1;

        if (successRate < 0.8) {
            issues.push(`Low success rate: ${(successRate * 100).toFixed(1)}%`);
            recommendations.push('Investigate and resolve operation failures');
        }

        if (this.statistics.performance.averageProcessingTime > this.config.performance.maxProcessingTimeMs) {
            issues.push(`High average processing time: ${this.statistics.performance.averageProcessingTime}ms`);
            recommendations.push('Consider performance optimization');
        }

        // システム健全性の判定
        let systemHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';
        
        if (issues.some(issue => issue.includes('Memory system not properly') || inactiveComponents.length > 2)) {
            systemHealth = 'CRITICAL';
        } else if (issues.length > 0) {
            systemHealth = 'DEGRADED';
        }

        // 統計の更新
        this.statistics.systemHealth = systemHealth;

        return {
            systemHealth,
            memorySystemStatus,
            componentStatus: this.componentStatus,
            statistics: this.statistics,
            recommendations,
            issues
        };
    }

    /**
     * システム最適化を実行する
     * @returns 最適化結果
     */
    async optimizeSystem(): Promise<{
        optimized: boolean;
        improvements: string[];
        processingTime: number;
        systemHealthImproved: boolean;
    }> {
        const startTime = Date.now();
        const improvements: string[] = [];
        const previousHealth = this.statistics.systemHealth;

        try {
            logger.info('Starting system optimization...');

            // メモリシステム最適化
            if (this.componentStatus.memorySystem.healthy) {
                const memoryOptResult = await this.safeMemoryOperation(
                    () => this.memoryManager.optimizeSystem(),
                    null,
                    'optimizeMemorySystem'
                );

                if (memoryOptResult?.success) {
                    improvements.push('Memory system optimized');
                }
            }

            // コンポーネント個別最適化
            const componentOptTasks = [];

            if (this.componentStatus.conceptManager.functional) {
                componentOptTasks.push(
                    this.conceptManager.optimizeSystem().then(result => {
                        if (result.optimized) {
                            improvements.push('Concept manager optimized');
                        }
                    }).catch(error => {
                        logger.warn('Concept manager optimization failed', { error });
                    })
                );
            }

            await Promise.allSettled(componentOptTasks);

            // 統計の最適化
            this.statistics.lastOptimization = new Date().toISOString();

            // システム健全性の再評価
            const diagnostics = await this.performSystemDiagnostics();
            const systemHealthImproved = diagnostics.systemHealth !== previousHealth &&
                (diagnostics.systemHealth === 'HEALTHY' || 
                 (diagnostics.systemHealth === 'DEGRADED' && previousHealth === 'CRITICAL'));

            const processingTime = Date.now() - startTime;

            logger.info('System optimization completed', {
                improvements: improvements.length,
                processingTime,
                systemHealthImproved
            });

            return {
                optimized: improvements.length > 0,
                improvements,
                processingTime,
                systemHealthImproved
            };

        } catch (error) {
            logger.error('System optimization failed', {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                optimized: false,
                improvements: [],
                processingTime: Date.now() - startTime,
                systemHealthImproved: false
            };
        }
    }

    /**
     * システム設定を更新する
     * @param newConfig 新しい設定
     */
    updateConfiguration(newConfig: Partial<LearningJourneySystemConfig>): void {
        this.config = { ...this.config, ...newConfig };
        logger.info('LearningJourneySystem configuration updated', {
            config: this.config
        });
    }

    /**
     * システムのクリーンアップを実行する
     */
    async cleanup(): Promise<void> {
        try {
            logger.info('Starting LearningJourneySystem cleanup...');

            // 各コンポーネントのクリーンアップ
            const cleanupTasks = [];

            if (this.componentStatus.storyDesigner.functional) {
                cleanupTasks.push(this.storyDesigner.cleanup());
            }

            await Promise.allSettled(cleanupTasks);

            // 内部状態のリセット
            this.initialized = false;
            this.componentStatus = {
                conceptManager: { initialized: false, functional: false },
                storyDesigner: { initialized: false, functional: false },
                emotionalIntegrator: { initialized: false, functional: false },
                contextManager: { initialized: false, functional: false },
                promptGenerator: { initialized: false, functional: false },
                memorySystem: { initialized: false, healthy: false }
            };

            logger.info('LearningJourneySystem cleanup completed');

        } catch (error) {
            logger.error('LearningJourneySystem cleanup failed', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
}

// デフォルトエクスポートとしてファサードクラスを提供
export default LearningJourneySystem;