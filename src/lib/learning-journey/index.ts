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
    // Service Container初期化順序対応
    static dependencies: string[] = []; // Tier 4: 独立システム
    static initializationTier = 4;

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

            // 10. プロット連携情報の統合
            const plotIntegration = await this.integratePlotWithLearning(
                section, conceptName, learningStage, chapterNumber
            );

            // 11. プロンプト生成オプションの組み立て（プロット連携強化版）
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
                targetLength: { min: 3000, max: 6000 },
                
                // プロット連携強化情報
                plotIntegration: plotIntegration,
                plotEnhancement: (section as any)?.plotEnhancement,
                learningPlotAlignment: (section as any)?.learningPlotAlignment,
                
                // 統合効果の活用
                integratedGuidance: this.generateIntegratedGuidance(
                    plotIntegration, learningStage, conceptName
                )
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

    /**
     * プロットと学習の統合処理
     * @private
     */
    private async integratePlotWithLearning(
        section: any,
        conceptName: string,
        learningStage: LearningStage,
        chapterNumber: number
    ): Promise<any> {
        try {
            logger.info(`Integrating plot with learning for chapter ${chapterNumber}, stage ${learningStage}`);

            // プロット情報の収集
            const plotDataResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    `plot integration learningStage ${learningStage} concept "${conceptName}"`,
                    [MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
                ),
                { success: false, totalResults: 0, processingTime: 0, results: [], suggestions: [] },
                'integratePlotWithLearning'
            );

            // 基本統合情報
            const baseIntegration: {
                learningToPlotInfluence: {
                    currentStage: LearningStage;
                    progressRate: number;
                    suggestedPlotDirection: string[];
                    plotConstraints: string[];
                };
                plotToLearningInfluence: {
                    currentPhase: string;
                    tensionLevel: number;
                    learningCatalysts: string[];
                    stageAdvancementTriggers: string[];
                };
                integrationScore: number;
                optimizationRecommendations: string[];
            } = {
                learningToPlotInfluence: {
                    currentStage: learningStage,
                    progressRate: this.calculateStageProgressRate(learningStage, chapterNumber),
                    suggestedPlotDirection: this.getSuggestedPlotDirection(learningStage),
                    plotConstraints: this.getPlotConstraints(learningStage)
                },
                plotToLearningInfluence: {
                    currentPhase: (section as any)?.plotEnhancement?.currentPhase || 'unknown',
                    tensionLevel: (section as any)?.learningPlotAlignment?.tensionOptimization || 0.5,
                    learningCatalysts: this.getLearningCatalysts(learningStage),
                    stageAdvancementTriggers: this.getStageAdvancementTriggers(learningStage)
                },
                integrationScore: this.calculateIntegrationScore(section, learningStage),
                optimizationRecommendations: []
            };

            // プロットデータが利用可能な場合の強化
            if (plotDataResult.success && plotDataResult.totalResults > 0) {
                baseIntegration.optimizationRecommendations = this.extractOptimizationRecommendations(
                    plotDataResult, learningStage, conceptName
                );
                baseIntegration.integrationScore = Math.min(1.0, baseIntegration.integrationScore + 0.2);
            }

            return baseIntegration;

        } catch (error) {
            logger.error('Failed to integrate plot with learning', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber,
                learningStage
            });

            // エラー時のフォールバック統合情報
            return {
                learningToPlotInfluence: {
                    currentStage: learningStage,
                    progressRate: 0.5,
                    suggestedPlotDirection: ['学習進行に沿った展開'],
                    plotConstraints: ['学習阻害要素の回避']
                },
                plotToLearningInfluence: {
                    currentPhase: 'recovery',
                    tensionLevel: 0.5,
                    learningCatalysts: ['基本的な学習機会'],
                    stageAdvancementTriggers: ['章の進行']
                },
                integrationScore: 0.3,
                optimizationRecommendations: ['エラー回復後の再統合']
            };
        }
    }

    /**
     * 統合ガイダンスの生成
     * @private
     */
    private generateIntegratedGuidance(
        plotIntegration: any,
        learningStage: LearningStage,
        conceptName: string
    ): string[] {
        const guidance = [];

        // 学習段階に基づくガイダンス
        switch (learningStage) {
            case LearningStage.MISCONCEPTION:
                guidance.push('プロット展開で概念の限界や問題点を自然に露呈させる');
                guidance.push('キャラクターの誤解が引き起こす状況を通じて学習機会を創出');
                break;
            case LearningStage.EXPLORATION:
                guidance.push('プロットの転換点で新しい視点や情報との出会いを演出');
                guidance.push('探索段階の不確実性をプロットの緊張感と調和させる');
                break;
            case LearningStage.CONFLICT:
                guidance.push('内的葛藤とプロットの外的対立を相互強化させる');
                guidance.push('価値観の衝突をストーリーの主要な対立軸として活用');
                break;
            case LearningStage.INSIGHT:
                guidance.push('プロットのクライマックスと学習の気づきの瞬間を同期させる');
                guidance.push('洞察の瞬間がストーリー展開の転換点となるよう設計');
                break;
            case LearningStage.APPLICATION:
                guidance.push('新しい理解の実践機会をプロット展開に自然に組み込む');
                guidance.push('試行錯誤のプロセスをストーリーの成長アークと連動させる');
                break;
            case LearningStage.INTEGRATION:
                guidance.push('統合された理解がストーリーの解決に直接貢献するよう構成');
                guidance.push('次の学習ステージへの橋渡しをプロットの新展開で示唆');
                break;
        }

        // プロット統合情報に基づくガイダンス
        if (plotIntegration) {
            if (plotIntegration.integrationScore > 0.7) {
                guidance.push('プロットと学習の高い統合度を活かした相乗効果を最大化');
            }

            if (plotIntegration.optimizationRecommendations && plotIntegration.optimizationRecommendations.length > 0) {
                guidance.push(...plotIntegration.optimizationRecommendations.slice(0, 2));
            }
        }

        // 概念特化ガイダンス
        if (conceptName === 'ISSUE DRIVEN') {
            guidance.push('課題解決プロセスをプロット展開の骨格として活用');
            guidance.push('顧客視点の変化をキャラクター関係性の発展と連動させる');
        }

        return guidance;
    }

    /**
     * 学習段階の順序を取得
     * @private
     */
    private getStageOrder(stage: LearningStage): number {
        const stageOrder: Record<LearningStage, number> = {
            [LearningStage.MISCONCEPTION]: 1,
            [LearningStage.EXPLORATION]: 2,
            [LearningStage.CONFLICT]: 3,
            [LearningStage.INSIGHT]: 4,
            [LearningStage.APPLICATION]: 5,
            [LearningStage.INTEGRATION]: 6
        };
        return stageOrder[stage] || 0;
    }

    /**
     * 学習段階の進行率を計算
     * @private
     */
    private calculateStageProgressRate(stage: LearningStage, chapterNumber: number): number {
        const stageOrder = this.getStageOrder(stage);
        const maxStages = Object.keys(LearningStage).length;
        const baseProgress = (stageOrder - 1) / maxStages;
        
        // 章内での進行も考慮（簡易計算）
        const withinStageProgress = (chapterNumber % 5) / 5;
        
        return Math.min(1.0, baseProgress + (withinStageProgress / maxStages));
    }

    /**
     * 学習段階に応じた推奨プロット方向を取得
     * @private
     */
    private getSuggestedPlotDirection(stage: LearningStage): string[] {
        const directions: Record<LearningStage, string[]> = {
            [LearningStage.MISCONCEPTION]: [
                '既存のアプローチの限界を露呈する状況',
                '問題の複雑さを段階的に明らかにする展開',
                '簡単な解決策が通用しない現実の提示'
            ],
            [LearningStage.EXPLORATION]: [
                '新しい情報源や視点との出会い',
                '多様な選択肢や可能性の提示',
                '探索を促進する状況の創出'
            ],
            [LearningStage.CONFLICT]: [
                '価値観の対立を軸とした展開',
                '選択を迫る重要な局面の設定',
                '内的・外的対立の相互強化'
            ],
            [LearningStage.INSIGHT]: [
                '洞察を促す決定的な出来事',
                '点と点が繋がる瞬間の演出',
                'ブレイクスルーを支援する状況'
            ],
            [LearningStage.APPLICATION]: [
                '新しい理解の実践機会の提供',
                '段階的な成功と挫折の体験',
                'スキル向上の具体的な表現'
            ],
            [LearningStage.INTEGRATION]: [
                '統合された理解の自然な発揮',
                '次の学習段階への準備となる展開',
                '達成感と新たな挑戦の提示'
            ]
        };

        return directions[stage] || ['標準的なストーリー展開'];
    }

    /**
     * 学習段階に応じたプロット制約を取得
     * @private
     */
    private getPlotConstraints(stage: LearningStage): string[] {
        const constraints: Record<LearningStage, string[]> = {
            [LearningStage.MISCONCEPTION]: [
                '簡単すぎる解決策の提示を避ける',
                '学習機会を奪う過度な支援を控える'
            ],
            [LearningStage.EXPLORATION]: [
                '結論を急がない展開を心がける',
                '探索を阻害する早急な答えの提示を避ける'
            ],
            [LearningStage.CONFLICT]: [
                '一方的な価値観の押し付けを避ける',
                '葛藤を軽視した安易な解決を控える'
            ],
            [LearningStage.INSIGHT]: [
                '洞察の瞬間を軽視した展開を避ける',
                '気づきの価値を薄める情報過多を控える'
            ],
            [LearningStage.APPLICATION]: [
                '完璧な実行への過度な期待を避ける',
                '失敗や試行錯誤を否定する展開を控える'
            ],
            [LearningStage.INTEGRATION]: [
                '統合への到達を軽視した展開を避ける',
                '次の学習への継続性を阻害する完結を控える'
            ]
        };

        return constraints[stage] || ['一般的な制約事項'];
    }

    /**
     * 学習触媒要素を取得
     * @private
     */
    private getLearningCatalysts(stage: LearningStage): string[] {
        const catalysts: Record<LearningStage, string[]> = {
            [LearningStage.MISCONCEPTION]: ['現実との摩擦', '予想外の結果', '他者からの指摘'],
            [LearningStage.EXPLORATION]: ['新しい出会い', '多様な選択肢', '探索の機会'],
            [LearningStage.CONFLICT]: ['価値観の衝突', '重要な選択', '内的な葛藤'],
            [LearningStage.INSIGHT]: ['決定的な体験', '直感的な理解', '突然の気づき'],
            [LearningStage.APPLICATION]: ['実践の機会', '具体的な挑戦', '段階的な成功'],
            [LearningStage.INTEGRATION]: ['自然な適用', '他者への伝達', '新たな挑戦']
        };

        return catalysts[stage] || ['一般的な学習機会'];
    }

    /**
     * 段階進展のトリガーを取得
     * @private
     */
    private getStageAdvancementTriggers(stage: LearningStage): string[] {
        const triggers: Record<LearningStage, string[]> = {
            [LearningStage.MISCONCEPTION]: ['現状への疑問の芽生え', '限界の体験'],
            [LearningStage.EXPLORATION]: ['新しい視点の発見', '選択肢の認識'],
            [LearningStage.CONFLICT]: ['葛藤の深化', '選択への圧力'],
            [LearningStage.INSIGHT]: ['洞察の獲得', '理解の飛躍'],
            [LearningStage.APPLICATION]: ['実践の成功', 'スキルの向上'],
            [LearningStage.INTEGRATION]: ['自然な適用', '次への準備']
        };

        return triggers[stage] || ['時間の経過'];
    }

    /**
     * 統合スコアを計算
     * @private
     */
    private calculateIntegrationScore(section: any, learningStage: LearningStage): number {
        let score = 0.5; // ベースライン

        // セクション情報による調整
        if (section) {
            if (section.plotEnhancement) {
                score += 0.2;
            }
            if (section.learningPlotAlignment) {
                score += section.learningPlotAlignment.plotLearningAlignment * 0.3;
            }
        }

        // 学習段階による調整
        if (learningStage === LearningStage.INSIGHT || learningStage === LearningStage.CONFLICT) {
            score += 0.1; // 重要な段階での統合効果向上
        }

        return Math.min(1.0, score);
    }

    /**
     * 最適化推奨事項を抽出
     * @private
     */
    private extractOptimizationRecommendations(
        plotSearchResult: any,
        learningStage: LearningStage,
        conceptName: string
    ): string[] {
        const recommendations: string[] = [];

        try {
            for (const result of plotSearchResult.results) {
                if (result.data && result.data.plotOptimization) {
                    recommendations.push(...result.data.plotOptimization.recommendations || []);
                }

                if (result.data && result.data.learningIntegration) {
                    recommendations.push(...result.data.learningIntegration.suggestions || []);
                }
            }

            // 学習段階特化の推奨事項
            if (learningStage === LearningStage.CONFLICT) {
                recommendations.push('葛藤段階では内的・外的対立の相互強化を重視');
            }

            if (conceptName === 'ISSUE DRIVEN') {
                recommendations.push('課題解決プロセスとプロット展開の同期を強化');
            }

        } catch (error) {
            logger.warn('Failed to extract optimization recommendations', { error });
            recommendations.push('基本的な統合最適化を実施');
        }

        return recommendations.slice(0, 3); // 最大3つまで
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
     * セクション取得（プロットシステム連携拡張対応）
     * @private
     */
    private async getSectionWithFallback(chapterNumber: number): Promise<any> {
        if (this.componentStatus.storyDesigner.functional) {
            try {
                const section = await this.storyDesigner.getSectionByChapter(chapterNumber);
                
                // プロットシステムからの追加情報を統合記憶システムから取得
                const plotContextResult = await this.safeMemoryOperation(
                    () => this.memoryManager.unifiedSearch(
                        `plot section chapter${chapterNumber} storyArc phase`,
                        [MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
                    ),
                    { success: false, totalResults: 0, processingTime: 0, results: [], suggestions: [] },
                    'getSectionPlotContext'
                );

                // プロット情報でセクションを強化
                if (plotContextResult.success && plotContextResult.totalResults > 0) {
                    section.plotEnhancement = this.extractPlotEnhancementFromSearch(plotContextResult, chapterNumber);
                    section.learningPlotAlignment = this.calculateLearningPlotAlignment(section, plotContextResult);
                }

                return section;
            } catch (error) {
                logger.warn('Failed to get section from StoryDesigner', { error });
            }
        }

        // プロットマネージャーからの直接取得を試行
        if (this.memoryManager) {
            try {
                const plotDataResult = await this.safeMemoryOperation(
                    () => this.memoryManager.unifiedSearch(
                        `plot strategy chapter${chapterNumber} plotMode`,
                        [MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
                    ),
                    { success: false, totalResults: 0, processingTime: 0, results: [], suggestions: [] },
                    'getSectionPlotFallback'
                );

                if (plotDataResult.success && plotDataResult.totalResults > 0) {
                    const plotBasedSection = this.buildSectionFromPlotData(plotDataResult, chapterNumber);
                    if (plotBasedSection) {
                        return plotBasedSection;
                    }
                }
            } catch (error) {
                logger.warn('Failed to get plot-based section', { error });
            }
        }

        // フォールバック：デフォルトセクション（プロット連携情報付き）
        return {
            id: 'default-section',
            number: 1,
            title: '学びの始まり',
            mainConcept: 'ISSUE DRIVEN',
            startChapter: 1,
            endChapter: 10,
            plotEnhancement: {
                currentPhase: 'introduction',
                storyArc: 'learning_foundation',
                plotMode: 'CONCRETE',
                narrativePurpose: '概念学習の基盤を構築する'
            },
            learningPlotAlignment: {
                plotLearningAlignment: 0.7,
                tensionOptimization: 0.6,
                storyProgressionSupport: 0.8
            }
        };
    }

    /**
     * 検索結果からプロット強化情報を抽出
     * @private
     */
    private extractPlotEnhancementFromSearch(searchResult: any, chapterNumber: number): any {
        try {
            for (const result of searchResult.results) {
                if (result.data && result.data.plotContext) {
                    const plotContext = result.data.plotContext;
                    return {
                        currentPhase: plotContext.phase || 'unknown',
                        storyArc: plotContext.currentArc?.name || 'main_arc',
                        plotMode: plotContext.mode || 'CONCRETE',
                        narrativePurpose: plotContext.narrativeContext || '',
                        chapterSpecificGuidance: plotContext.shortTermGoals || []
                    };
                }

                if (result.data && result.data.plotStrategy) {
                    const strategy = result.data.plotStrategy;
                    return {
                        currentPhase: 'strategic_phase',
                        storyArc: 'strategic_arc',
                        plotMode: strategy.globalStrategy?.preferredMode || 'CONCRETE',
                        narrativePurpose: '戦略的プロット展開',
                        strategicGuidance: strategy.arcStrategies || []
                    };
                }
            }

            return {
                currentPhase: 'default_phase',
                storyArc: 'learning_arc',
                plotMode: 'CONCRETE',
                narrativePurpose: '学習旅程の進行'
            };
        } catch (error) {
            logger.warn('Failed to extract plot enhancement from search', { error });
            return {
                currentPhase: 'error_recovery',
                storyArc: 'recovery_arc',
                plotMode: 'CONCRETE',
                narrativePurpose: 'エラー回復からの学習'
            };
        }
    }

    /**
     * 学習とプロットの整合度を計算
     * @private
     */
    private calculateLearningPlotAlignment(section: any, plotSearchResult: any): any {
        try {
            let alignmentScore = 0.5; // ベースライン
            let tensionScore = 0.5;
            let supportScore = 0.5;

            // プロット情報が利用可能な場合の調整
            if (plotSearchResult.success && plotSearchResult.totalResults > 0) {
                alignmentScore = 0.7; // プロット情報が利用可能
                
                for (const result of plotSearchResult.results) {
                    if (result.data && result.data.plotContext) {
                        const plotContext = result.data.plotContext;
                        
                        // アークの一致度で調整
                        if (plotContext.currentArc && section.mainConcept) {
                            if (plotContext.currentArc.theme === section.mainConcept) {
                                alignmentScore = Math.min(1.0, alignmentScore + 0.2);
                            }
                        }

                        // 緊張度の最適化
                        if (plotContext.mode === 'CONFLICT' || plotContext.phase === 'climax') {
                            tensionScore = 0.8;
                        } else if (plotContext.mode === 'RESOLUTION') {
                            tensionScore = 0.4;
                        }

                        // ストーリー進行支援度
                        if (plotContext.shortTermGoals && plotContext.shortTermGoals.length > 0) {
                            supportScore = 0.8;
                        }
                    }
                }
            }

            return {
                plotLearningAlignment: alignmentScore,
                tensionOptimization: tensionScore,
                storyProgressionSupport: supportScore
            };
        } catch (error) {
            logger.warn('Failed to calculate learning-plot alignment', { error });
            return {
                plotLearningAlignment: 0.5,
                tensionOptimization: 0.5,
                storyProgressionSupport: 0.5
            };
        }
    }

    /**
     * プロットデータからセクションを構築
     * @private
     */
    private buildSectionFromPlotData(plotSearchResult: any, chapterNumber: number): any | null {
        try {
            for (const result of plotSearchResult.results) {
                if (result.data && result.data.plotStrategy) {
                    const strategy = result.data.plotStrategy;
                    
                    // 章範囲に基づいてセクションを推定
                    let sectionNumber = Math.ceil(chapterNumber / 5); // 5章ごとにセクション
                    let startChapter = (sectionNumber - 1) * 5 + 1;
                    let endChapter = sectionNumber * 5;

                    return {
                        id: `plot-based-section-${sectionNumber}`,
                        number: sectionNumber,
                        title: `第${sectionNumber}篇`,
                        mainConcept: 'ISSUE DRIVEN', // デフォルト概念
                        startChapter,
                        endChapter,
                        plotEnhancement: {
                            currentPhase: `section_${sectionNumber}`,
                            storyArc: 'main_learning_arc',
                            plotMode: strategy.globalStrategy?.preferredMode || 'CONCRETE',
                            narrativePurpose: `第${sectionNumber}篇の学習目標達成`
                        },
                        learningPlotAlignment: {
                            plotLearningAlignment: 0.8,
                            tensionOptimization: 0.7,
                            storyProgressionSupport: 0.9
                        }
                    };
                }
            }

            return null;
        } catch (error) {
            logger.warn('Failed to build section from plot data', { error });
            return null;
        }
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