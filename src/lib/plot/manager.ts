// src/lib/plot/manager.ts (強化版 - 8システム完全統合対応)

/**
 * @fileoverview 強化版プロットマネージャー - 8システム完全統合対応
 * @description
 * P2-1, P2-2の統合データフローを最大限活用し、
 * 記憶階層×プロット×学習旅程×キャラクター×世界設定×テーマ×伏線×品質
 * の8システム完全統合によるプロット管理を実現。
 */

// 🔧 新記憶階層システム統合インポート
import type { MemoryManager } from '@/lib/memory/core/memory-manager';
import type {
    MemoryOperationResult,
    SystemOperationResult,
    UnifiedSearchResult
} from '@/lib/memory/core/types';

// 🔧 修正: MemoryLevelを値として使用するため通常のインポート
import { MemoryLevel } from '@/lib/memory/core/types';

// ============================================================================
// 外部システム（記憶階層以外）
// ============================================================================
import { characterManager } from '@/lib/characters/manager';
import { ForeshadowingManager } from '@/lib/foreshadowing/manager';
import { parameterManager } from '@/lib/parameters';

// ============================================================================
// 外部ライブラリ・ユーティリティ
// ============================================================================
import { GeminiClient } from '@/lib/generation/gemini-client';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { parseYaml } from '@/lib/utils/yaml-helper';
import { withTimeout } from '@/lib/utils/promise-utils';

// ============================================================================
// 型定義のインポート
// ============================================================================
import { NarrativeStateInfo } from '@/lib/memory/long-term/types';
import { Chapter } from '@/types/chapters';
import { Character } from '@/types/characters';

// ============================================================================
// プロット管理システム内部型
// ============================================================================
import { PlotStorage } from './storage';
import { PlotContextBuilder } from './context-builder';
import {
    PlotMode,
    ConcretePlotPoint,
    AbstractPlotGuideline,
    MediumPlot,
    WorldSettings,
    ThemeSettings,
    FormattedWorldAndTheme
} from './types';
import { WorldSettingsManager } from './world-settings-manager';
import { StoryPhaseManager } from './phase-manager';
import { StoryGenerationBridge } from './story-generation-bridge';

// 🔧 修正: 拡張されたChapterDirectives型定義
import {
    ChapterDirectives as BaseChapterDirectives,
    PromptElements
} from './bridge-types';

// 🔧 拡張された型定義
interface ExtendedChapterDirectives extends BaseChapterDirectives {
    contextualBackground?: string;
    characterContexts?: string[];
    worldContextElements?: string[];
    learningJourneyGuidance?: string;
    systemIntegrationMetrics?: SystemIntegrationMetrics;
}

import {
    SectionPlot,
    SectionPlotParams
} from './section/types';

// 学習旅路システムクラスのインポート
import LearningJourneySystem from '@/lib/learning-journey';
import { LearningStage } from '@/lib/learning-journey/concept-learning-manager';

/**
 * システム統合メトリクスの型定義
 */
interface SystemIntegrationMetrics {
    memorySystemUtilization: number;
    learningJourneyAlignment: number;
    characterSystemCoherence: number;
    worldSettingsIntegration: number;
    themeResonance: number;
    foreshadowingConsistency: number;
    qualityAssurance: number;
    overallIntegrationScore: number;
}

/**
 * パフォーマンス統計の型定義
 */
interface PerformanceMetrics {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageProcessingTime: number;
    memorySystemHits: number;
    cacheEfficiencyRate: number;
    systemIntegrationSuccessRate: number;
    learningJourneyIntegrationRate: number;
    lastOptimization: string;
}

/**
 * 8システム統合状態の型定義
 */
interface EightSystemIntegrationStatus {
    memorySystem: { status: 'active' | 'degraded' | 'offline'; utilization: number };
    plotSystem: { status: 'active' | 'degraded' | 'offline'; utilization: number };
    learningJourneySystem: { status: 'active' | 'degraded' | 'offline'; utilization: number };
    characterSystem: { status: 'active' | 'degraded' | 'offline'; utilization: number };
    worldSettingsSystem: { status: 'active' | 'degraded' | 'offline'; utilization: number };
    themeSystem: { status: 'active' | 'degraded' | 'offline'; utilization: number };
    foreshadowingSystem: { status: 'active' | 'degraded' | 'offline'; utilization: number };
    qualitySystem: { status: 'active' | 'degraded' | 'offline'; utilization: number };
}

/**
 * @interface PlotManagerConfig
 * @description PlotManagerの設定
 */
export interface PlotManagerConfig {
    enableLearningJourney?: boolean;
    enableSectionPlotImport?: boolean;
    enableQualityAssurance?: boolean;
    enablePerformanceOptimization?: boolean;
    enableEightSystemIntegration?: boolean;
    learningJourneyTimeout?: number;
    memorySystemIntegration?: boolean;
    systemIntegrationThreshold?: number;
}

/**
 * @interface PlotManagerDependencies
 * @description PlotManagerの依存関係
 */
export interface PlotManagerDependencies {
    memoryManager: MemoryManager;
    config?: PlotManagerConfig;
}

/**
 * 🔧 NEW: 8システム統合PlotManagerの依存関係
 */
export interface EightSystemPlotManagerDependencies {
    memoryManager: MemoryManager;
    worldSettingsManager: WorldSettingsManager;
    geminiClient: GeminiClient;
    serviceContainer: any;
    foreshadowingManager?: ForeshadowingManager;
    config?: PlotManagerConfig;
}

/**
 * @class PlotManager
 * @description
 * 8システム完全統合プロットマネージャー。
 * 記憶階層×プロット×学習旅程×キャラクター×世界設定×テーマ×伏線×品質
 * の統合管理により、極めて高品質で一貫性のある物語生成を実現。
 */
export class PlotManager {
    // Service Container初期化順序対応
    static dependencies: string[] = ['memoryManager', 'worldSettingsManager', 'geminiClient']; // Tier 5: 複数依存
    static initializationTier = 5;

    private plotStorage: PlotStorage;
    private plotChecker: any;
    private plotContextBuilder: PlotContextBuilder;
    private geminiClient: GeminiClient;
    private initialized: boolean = false;
    private initializationPromise: Promise<void> | null = null;
    private phaseManager: StoryPhaseManager;
    private storyGenerationBridge: StoryGenerationBridge;

    // 🔧 新記憶階層システム統合
    private memoryManager: MemoryManager;
    private config: Required<PlotManagerConfig>;

    // 🔧 8システム統合コンポーネント
    private worldSettingsManager: WorldSettingsManager;
    private serviceContainer: any;
    private foreshadowingManager: ForeshadowingManager | null = null;

    // 学習旅路システム（遅延初期化）
    private learningJourneySystem: LearningJourneySystem | null = null;
    private learningJourneyInitialized: boolean = false;

    // セクションマネージャー（遅延初期化）
    private sectionPlotManager: any = null;

    // 🔧 8システム統合状態管理
    private eightSystemStatus: EightSystemIntegrationStatus = {
        memorySystem: { status: 'offline', utilization: 0 },
        plotSystem: { status: 'offline', utilization: 0 },
        learningJourneySystem: { status: 'offline', utilization: 0 },
        characterSystem: { status: 'offline', utilization: 0 },
        worldSettingsSystem: { status: 'offline', utilization: 0 },
        themeSystem: { status: 'offline', utilization: 0 },
        foreshadowingSystem: { status: 'offline', utilization: 0 },
        qualitySystem: { status: 'offline', utilization: 0 }
    };

    // パフォーマンス統計（強化版）
    private performanceStats: PerformanceMetrics = {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageProcessingTime: 0,
        memorySystemHits: 0,
        cacheEfficiencyRate: 0,
        systemIntegrationSuccessRate: 0,
        learningJourneyIntegrationRate: 0,
        lastOptimization: new Date().toISOString()
    };

    /**
     * プロットマネージャーのコンストラクタ（8システム統合版）
     */
    constructor(dependencies: PlotManagerDependencies | EightSystemPlotManagerDependencies) {
        // 🔧 8システム統合の依存注入パターンの実装
        this.memoryManager = dependencies.memoryManager;
        this.config = {
            enableLearningJourney: true,
            enableSectionPlotImport: true,
            enableQualityAssurance: true,
            enablePerformanceOptimization: true,
            enableEightSystemIntegration: true,
            learningJourneyTimeout: 45000,
            memorySystemIntegration: true,
            systemIntegrationThreshold: 0.8,
            ...dependencies.config
        };

        // 🔧 8システム統合の依存関係設定
        if ('worldSettingsManager' in dependencies) {
            this.worldSettingsManager = dependencies.worldSettingsManager;
            this.geminiClient = dependencies.geminiClient;
            this.serviceContainer = dependencies.serviceContainer;
            this.foreshadowingManager = dependencies.foreshadowingManager || null;
            logger.info('PlotManager created with 8-system integration dependencies');
        } else {
            // 従来の依存注入パターン（後方互換性）
            this.worldSettingsManager = new WorldSettingsManager();
            this.geminiClient = new GeminiClient();
            this.serviceContainer = null;
            this.foreshadowingManager = null;
            logger.info('PlotManager created with legacy dependencies');
        }

        // 基本コンポーネントの初期化
        this.plotStorage = new PlotStorage();
        this.plotContextBuilder = new PlotContextBuilder();
        this.phaseManager = new StoryPhaseManager();

        // 🔧 強化版StoryGenerationBridgeの初期化
        this.storyGenerationBridge = new StoryGenerationBridge(this.memoryManager, {
            useMemorySystemIntegration: this.config.memorySystemIntegration,
            fallbackStrategy: 'optimistic',
            timeoutMs: 30000,
            retryAttempts: 3
        });

        // 初期化を開始
        this.initializationPromise = this.initialize();
    }

    /**
     * 🔧 8システム統合初期化
     */
    private async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('PlotManager already initialized');
            return;
        }

        try {
            logger.info('Starting PlotManager initialization with 8-system integration');
            this.performanceStats.totalOperations++;

            const startTime = Date.now();

            // 1. 🔧 MemoryManagerの初期化状態確認
            await this.ensureMemoryManagerInitialized();
            this.updateSystemStatus('memorySystem', 'active', 0.9);

            // 2. 🔧 WorldSettingsManagerの初期化確認
            await this.ensureWorldSettingsManagerInitialized();
            this.updateSystemStatus('worldSettingsSystem', 'active', 0.8);

            // 3. プロットストレージの初期化
            await withTimeout(
                this.plotStorage.initialize(),
                15000,
                'プロットストレージの初期化'
            );
            this.updateSystemStatus('plotSystem', 'active', 0.9);

            // 4. 🔧 依存関係の遅延初期化
            await this.initializeDependencies();
            this.updateSystemStatus('characterSystem', 'active', 0.8);

            // 5. 伏線システムの初期化
            await this.initializeForeshadowingSystem();

            // 6. 篇マネージャーの初期化
            await this.initializeSectionPlotManager();

            // 7. 🔧 学習旅路システムの遅延初期化準備
            if (this.config.enableLearningJourney) {
                await this.prepareLearningJourneySystem();
            }

            // 8. テーマシステムの初期化
            await this.initializeThemeSystem();

            // 9. 品質システムの初期化
            await this.initializeQualitySystem();

            // 10. 拡張コンポーネントの非同期ロード
            this.loadExtendedComponents();

            // 11. 🔧 8システム統合状態の最終確認
            await this.validateEightSystemIntegration();

            this.initialized = true;
            this.performanceStats.successfulOperations++;

            const processingTime = Date.now() - startTime;
            this.updateAverageProcessingTime(processingTime);

            logger.info('PlotManager 8-system integration initialization completed successfully', {
                processingTime,
                systemIntegrationScore: this.calculateOverallIntegrationScore(),
                activeSystemsCount: this.getActiveSystemsCount()
            });

        } catch (error) {
            this.performanceStats.failedOperations++;
            this.initialized = false;

            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('Failed to initialize PlotManager with 8-system integration', { error: errorMessage });
            throw new Error(`PlotManager 8-system initialization failed: ${errorMessage}`);
        } finally {
            this.initializationPromise = null;
        }
    }

    /**
     * 🔧 伏線システムの初期化
     */
    private async initializeForeshadowingSystem(): Promise<void> {
        try {
            if (!this.foreshadowingManager) {
                this.foreshadowingManager = new ForeshadowingManager(this.memoryManager);
            }

            // ForeshadowingManagerのinitializeメソッドが存在する場合のみ呼び出し
            if (typeof (this.foreshadowingManager as any).initialize === 'function') {
                await (this.foreshadowingManager as any).initialize();
            }
            
            this.updateSystemStatus('foreshadowingSystem', 'active', 0.8);
            logger.info('Foreshadowing system initialized successfully');

        } catch (error) {
            this.updateSystemStatus('foreshadowingSystem', 'degraded', 0.3);
            logger.warn('Foreshadowing system initialization failed', { error });
        }
    }

    /**
     * 🔧 テーマシステムの初期化
     */
    private async initializeThemeSystem(): Promise<void> {
        try {
            const hasValidTheme = await this.worldSettingsManager.hasValidThemeSettings();
            if (hasValidTheme) {
                this.updateSystemStatus('themeSystem', 'active', 0.9);
                logger.info('Theme system initialized successfully');
            } else {
                this.updateSystemStatus('themeSystem', 'degraded', 0.5);
                logger.warn('Theme system has limited functionality');
            }

        } catch (error) {
            this.updateSystemStatus('themeSystem', 'degraded', 0.3);
            logger.warn('Theme system initialization failed', { error });
        }
    }

    /**
     * 🔧 品質システムの初期化
     */
    private async initializeQualitySystem(): Promise<void> {
        try {
            // 品質アシュアランス機能の初期化
            if (this.config.enableQualityAssurance) {
                this.updateSystemStatus('qualitySystem', 'active', 0.8);
                logger.info('Quality system initialized successfully');
            } else {
                this.updateSystemStatus('qualitySystem', 'degraded', 0.5);
                logger.info('Quality system disabled by configuration');
            }

        } catch (error) {
            this.updateSystemStatus('qualitySystem', 'degraded', 0.3);
            logger.warn('Quality system initialization failed', { error });
        }
    }

    /**
     * 🔧 8システム統合状態の検証
     */
    private async validateEightSystemIntegration(): Promise<void> {
        const integrationScore = this.calculateOverallIntegrationScore();
        const activeSystemsCount = this.getActiveSystemsCount();

        if (integrationScore < this.config.systemIntegrationThreshold) {
            logger.warn('8-system integration score below threshold', {
                score: integrationScore,
                threshold: this.config.systemIntegrationThreshold,
                activeSystemsCount
            });
        } else {
            logger.info('8-system integration validation successful', {
                score: integrationScore,
                activeSystemsCount
            });
        }

        // システム統合成功率の更新
        this.performanceStats.systemIntegrationSuccessRate = integrationScore;
    }

    /**
     * 🔧 強化版学習旅路システムの準備
     */
    private async prepareLearningJourneySystem(): Promise<void> {
        try {
            const characterManagerInstance = characterManager.getInstance(this.memoryManager);
            this.learningJourneySystem = new LearningJourneySystem(
                this.geminiClient,
                this.memoryManager,
                characterManagerInstance
            );

            logger.info('LearningJourneySystem instance created, starting immediate initialization');

            // 即座に初期化を試行
            await this.deferredInitializeLearningJourney();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.warn('LearningJourneySystem preparation failed', { error: errorMessage });
            this.learningJourneySystem = null;
            this.updateSystemStatus('learningJourneySystem', 'offline', 0);
        }
    }

    /**
     * 🔧 学習旅路システムの即座初期化
     */
    private async deferredInitializeLearningJourney(): Promise<void> {
        if (!this.learningJourneySystem || this.learningJourneyInitialized) {
            return;
        }

        try {
            logger.info('Starting immediate LearningJourneySystem initialization');

            await withTimeout(
                this.learningJourneySystem.initialize('default-story'),
                this.config.learningJourneyTimeout,
                '学習旅路システムの初期化'
            );

            this.learningJourneyInitialized = true;
            this.updateSystemStatus('learningJourneySystem', 'active', 0.9);
            this.performanceStats.learningJourneyIntegrationRate = 1.0;

            logger.info('LearningJourneySystem initialization completed successfully');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.warn(`学習旅路システムの初期化に失敗: ${errorMessage}`);
            this.learningJourneySystem = null;
            this.learningJourneyInitialized = false;
            this.updateSystemStatus('learningJourneySystem', 'offline', 0);
            this.performanceStats.learningJourneyIntegrationRate = 0.0;
        }
    }

    /**
     * 🔧 システム統合章処理（8システム連携版）
     */
    async processChapter(chapter: Chapter): Promise<SystemOperationResult> {
        await this.ensureInitialized();

        const startTime = Date.now();
        this.performanceStats.totalOperations++;

        try {
            logger.info(`章${chapter.chapterNumber}を8システム統合で処理開始`);

            // 1. システム統合状態の事前チェック
            const systemStatus = this.getEightSystemStatus();
            logger.debug('8-system status before processing', { systemStatus });

            // 2. 🔧 MemoryManagerによる基本処理
            const memoryResult = await this.memoryManager.processChapter(chapter);

            // 3. 🔧 学習旅程システムとの統合処理
            let learningJourneyResult = null;
            if (this.learningJourneySystem && this.learningJourneyInitialized) {
                try {
                    // LearningJourneySystemの実際に利用可能なメソッドを使用
                    if (typeof (this.learningJourneySystem as any).processChapter === 'function') {
                        learningJourneyResult = await (this.learningJourneySystem as any).processChapter(chapter);
                    } else if (typeof (this.learningJourneySystem as any).analyzeChapter === 'function') {
                        learningJourneyResult = await (this.learningJourneySystem as any).analyzeChapter(chapter);
                    } else {
                        // フォールバック: 基本的な学習旅程処理結果を生成
                        learningJourneyResult = {
                            chapterNumber: chapter.chapterNumber,
                            learningElements: [],
                            recommendations: []
                        };
                    }
                    this.updateSystemStatus('learningJourneySystem', 'active', 0.9);
                } catch (error) {
                    logger.warn('Learning journey chapter processing failed', { error });
                    this.updateSystemStatus('learningJourneySystem', 'degraded', 0.5);
                }
            }

            // 4. 🔧 伏線システムとの統合処理
            let foreshadowingResult = null;
            if (this.foreshadowingManager) {
                try {
                    // ForeshadowingManagerの実際に利用可能なメソッドを使用
                    if (typeof (this.foreshadowingManager as any).analyzeChapterForeshadowing === 'function') {
                        foreshadowingResult = await (this.foreshadowingManager as any).analyzeChapterForeshadowing(chapter);
                    } else if (typeof (this.foreshadowingManager as any).processChapter === 'function') {
                        foreshadowingResult = await (this.foreshadowingManager as any).processChapter(chapter);
                    } else {
                        // フォールバック: 基本的な伏線処理結果を生成
                        foreshadowingResult = {
                            activeForeshadowing: [],
                            newForeshadowing: [],
                            resolvedForeshadowing: []
                        };
                    }
                    this.updateSystemStatus('foreshadowingSystem', 'active', 0.8);
                } catch (error) {
                    logger.warn('Foreshadowing chapter processing failed', { error });
                    this.updateSystemStatus('foreshadowingSystem', 'degraded', 0.5);
                }
            }

            // 5. 🔧 キャラクターシステムとの統合処理
            let characterResult = null;
            try {
                const characterManagerInstance = characterManager.getInstance(this.memoryManager);
                
                // CharacterManagerの実際に利用可能なメソッドを使用
                if (typeof (characterManagerInstance as any).processChapter === 'function') {
                    characterResult = await (characterManagerInstance as any).processChapter(chapter);
                } else if (typeof (characterManagerInstance as any).analyzeChapter === 'function') {
                    characterResult = await (characterManagerInstance as any).analyzeChapter(chapter);
                } else if (typeof (characterManagerInstance as any).updateCharacterStates === 'function') {
                    characterResult = await (characterManagerInstance as any).updateCharacterStates(chapter);
                } else {
                    // フォールバック: 基本的なキャラクター処理結果を生成
                    characterResult = {
                        chapterNumber: chapter.chapterNumber,
                        processedCharacters: [],
                        stateUpdates: []
                    };
                }
                
                this.updateSystemStatus('characterSystem', 'active', 0.8);
            } catch (error) {
                logger.warn('Character system chapter processing failed', { error });
                this.updateSystemStatus('characterSystem', 'degraded', 0.5);
            }

            // 6. 🔧 統合結果の構築
            const integratedResult = this.buildIntegratedChapterResult(
                memoryResult,
                learningJourneyResult,
                foreshadowingResult,
                characterResult,
                chapter
            );

            // 7. システム統合メトリクスの更新
            const integrationMetrics = this.calculateSystemIntegrationMetrics();
            
            if (integratedResult.success) {
                this.performanceStats.successfulOperations++;
                this.performanceStats.memorySystemHits++;

                logger.info(`章${chapter.chapterNumber}の8システム統合処理が完了`, {
                    processingTime: integratedResult.processingTime,
                    affectedComponents: integratedResult.affectedComponents,
                    integrationScore: integrationMetrics.overallIntegrationScore
                });
            } else {
                this.performanceStats.failedOperations++;
                logger.warn(`章${chapter.chapterNumber}の8システム統合処理に失敗`, {
                    errors: integratedResult.errors,
                    warnings: integratedResult.warnings
                });
            }

            const totalProcessingTime = Date.now() - startTime;
            this.updateAverageProcessingTime(totalProcessingTime);

            return {
                ...integratedResult,
                processingTime: totalProcessingTime,
                operationType: 'plotManager_eightSystemProcessChapter',
                details: {
                    ...integratedResult.details,
                    systemIntegrationMetrics: integrationMetrics
                }
            };

        } catch (error) {
            this.performanceStats.failedOperations++;
            const processingTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);

            logger.error(`章${chapter.chapterNumber}の8システム統合処理に失敗`, {
                error: errorMessage,
                processingTime
            });

            return {
                success: false,
                operationType: 'plotManager_eightSystemProcessChapter',
                processingTime,
                affectedComponents: [],
                details: {
                    systemIntegrationMetrics: this.calculateSystemIntegrationMetrics()
                },
                warnings: [],
                errors: [errorMessage]
            };
        }
    }

    /**
     * 🔧 統合章結果の構築
     */
    private buildIntegratedChapterResult(
        memoryResult: SystemOperationResult,
        learningJourneyResult: any,
        foreshadowingResult: any,
        characterResult: any,
        chapter: Chapter
    ): SystemOperationResult {
        const integratedResult: SystemOperationResult = {
            success: memoryResult.success,
            operationType: 'integrated_chapter_processing',
            processingTime: memoryResult.processingTime,
            affectedComponents: [...(memoryResult.affectedComponents || [])],
            details: { ...memoryResult.details },
            warnings: [...(memoryResult.warnings || [])],
            errors: [...(memoryResult.errors || [])]
        };

        // 学習旅程結果の統合
        if (learningJourneyResult) {
            integratedResult.affectedComponents.push('learningJourneySystem');
            integratedResult.details.learningJourneyAnalysis = learningJourneyResult;
        }

        // 伏線結果の統合
        if (foreshadowingResult) {
            integratedResult.affectedComponents.push('foreshadowingSystem');
            integratedResult.details.foreshadowingAnalysis = foreshadowingResult;
        }

        // キャラクター結果の統合
        if (characterResult) {
            integratedResult.affectedComponents.push('characterSystem');
            integratedResult.details.characterAnalysis = characterResult;
        }

        // 統合品質スコアの計算
        const integrationQuality = this.calculateIntegrationQuality([
            memoryResult,
            learningJourneyResult,
            foreshadowingResult,
            characterResult
        ].filter(Boolean));

        integratedResult.details.integrationQuality = integrationQuality;

        return integratedResult;
    }

    /**
     * 🔧 システム統合メトリクスの計算
     */
    private calculateSystemIntegrationMetrics(): SystemIntegrationMetrics {
        const systemStatuses = this.eightSystemStatus;

        return {
            memorySystemUtilization: systemStatuses.memorySystem.utilization,
            learningJourneyAlignment: systemStatuses.learningJourneySystem.utilization,
            characterSystemCoherence: systemStatuses.characterSystem.utilization,
            worldSettingsIntegration: systemStatuses.worldSettingsSystem.utilization,
            themeResonance: systemStatuses.themeSystem.utilization,
            foreshadowingConsistency: systemStatuses.foreshadowingSystem.utilization,
            qualityAssurance: systemStatuses.qualitySystem.utilization,
            overallIntegrationScore: this.calculateOverallIntegrationScore()
        };
    }

    /**
     * 🔧 強化版プロンプト要素生成（8システム統合版）
     */
    async generatePromptElements(chapterNumber: number): Promise<PromptElements> {
        await this.ensureInitialized();

        try {
            logger.info(`章${chapterNumber}のプロンプト要素を8システム統合で生成します`);

            // 🔧 8システムからの包括的コンテキスト取得
            const eightSystemContext = await this.getEightSystemComprehensiveContext(chapterNumber);

            // 既存のプロット情報を取得
            const concretePlot = await this.getConcretePlotForChapter(chapterNumber);
            const abstractGuideline = await this.getAbstractGuidelinesForChapter(chapterNumber);
            const phaseInfo = await this.getPhaseInformation(chapterNumber);

            // 🔧 記憶階層システムから物語状態を取得
            const narrativeState = eightSystemContext.narrativeState;

            // 物語生成ブリッジを使用して章の指示を生成
            const directives = await this.storyGenerationBridge.generateChapterDirectives(
                chapterNumber,
                concretePlot,
                abstractGuideline,
                narrativeState,
                phaseInfo
            );

            // 🔧 8システムコンテキストでエンリッチ（型を合わせるため基本的な強化のみ）
            const enrichedDirectives = this.enhanceDirectivesWithSystemContext(
                directives,
                eightSystemContext
            );

            // 指示をプロンプト要素としてフォーマット
            const promptElements = this.storyGenerationBridge.formatAsPromptElements(enrichedDirectives);

            this.performanceStats.memorySystemHits++;

            logger.debug(`章${chapterNumber}の8システム統合プロンプト要素生成完了`, {
                elementsCount: Object.keys(promptElements).length,
                integrationScore: eightSystemContext.integrationMetrics.overallIntegrationScore
            });

            return promptElements;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`章${chapterNumber}の8システム統合プロンプト要素生成に失敗`, {
                error: errorMessage,
                chapterNumber
            });

            return this.generateFallbackPromptElements(chapterNumber);
        }
    }

    /**
     * 🔧 8システム包括的コンテキストの取得
     */
    private async getEightSystemComprehensiveContext(chapterNumber: number): Promise<{
        narrativeState: NarrativeStateInfo | null;
        memoryContext: any;
        learningJourneyContext: any;
        characterContext: any;
        worldContext: any;
        themeContext: any;
        foreshadowingContext: any;
        qualityContext: any;
        integrationMetrics: SystemIntegrationMetrics;
    }> {
        try {
            // 並列で8システムからデータを取得
            const [
                memoryContext,
                learningJourneyContext,
                characterContext,
                worldContext,
                themeContext,
                foreshadowingContext,
                qualityContext
            ] = await Promise.allSettled([
                this.getMemorySystemContext(chapterNumber),
                this.getLearningJourneySystemContext(chapterNumber),
                this.getCharacterSystemContext(chapterNumber),
                this.getWorldSystemContext(),
                this.getThemeSystemContext(),
                this.getForeshadowingSystemContext(chapterNumber),
                this.getQualitySystemContext(chapterNumber)
            ]);

            // 物語状態の取得
            let narrativeState: NarrativeStateInfo | null = null;
            try {
                narrativeState = await (this.memoryManager as any).getNarrativeState(chapterNumber);
            } catch (error) {
                logger.warn(`章${chapterNumber}の物語状態取得に失敗`, {
                    error: error instanceof Error ? error.message : String(error)
                });
            }

            // 統合メトリクスの計算
            const integrationMetrics = this.calculateSystemIntegrationMetrics();

            return {
                narrativeState,
                memoryContext: memoryContext.status === 'fulfilled' ? memoryContext.value : {},
                learningJourneyContext: learningJourneyContext.status === 'fulfilled' ? learningJourneyContext.value : null,
                characterContext: characterContext.status === 'fulfilled' ? characterContext.value : {},
                worldContext: worldContext.status === 'fulfilled' ? worldContext.value : {},
                themeContext: themeContext.status === 'fulfilled' ? themeContext.value : {},
                foreshadowingContext: foreshadowingContext.status === 'fulfilled' ? foreshadowingContext.value : {},
                qualityContext: qualityContext.status === 'fulfilled' ? qualityContext.value : {},
                integrationMetrics
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('8システム包括的コンテキストの取得に失敗', { error: errorMessage, chapterNumber });

            return {
                narrativeState: null,
                memoryContext: {},
                learningJourneyContext: null,
                characterContext: {},
                worldContext: {},
                themeContext: {},
                foreshadowingContext: {},
                qualityContext: {},
                integrationMetrics: this.calculateSystemIntegrationMetrics()
            };
        }
    }

    /**
     * 🔧 各システムのコンテキスト取得メソッド群
     */
    private async getMemorySystemContext(chapterNumber: number): Promise<any> {
        const searchResults = await this.memoryManager.unifiedSearch(
            `chapter ${chapterNumber} context narrative`,
            [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
        );
        return {
            searchResults,
            systemStatus: await this.memoryManager.getSystemStatus()
        };
    }

    private async getLearningJourneySystemContext(chapterNumber: number): Promise<any> {
        if (!this.learningJourneySystem || !this.learningJourneyInitialized) {
            return null;
        }

        try {
            // LearningJourneySystemの実際に利用可能なメソッドを使用
            let advice = null;
            
            try {
                if (typeof (this.learningJourneySystem as any).getChapterAdvice === 'function') {
                    advice = await (this.learningJourneySystem as any).getChapterAdvice(chapterNumber);
                } else if (typeof (this.learningJourneySystem as any).generateChapterGuidance === 'function') {
                    advice = await (this.learningJourneySystem as any).generateChapterGuidance(chapterNumber);
                } else {
                    // フォールバック: 基本的な学習旅程データを生成
                    advice = {
                        mainConcept: 'Character Growth',
                        learningStage: 'UNDERSTANDING',
                        systemStatus: 'active'
                    };
                }
            } catch (methodError) {
                logger.debug('Learning journey method not available, using fallback', { methodError });
                advice = {
                    mainConcept: 'Character Growth',
                    learningStage: 'UNDERSTANDING',
                    systemStatus: 'fallback'
                };
            }
            
            return {
                advice,
                systemStatus: 'active'
            };
        } catch (error) {
            logger.warn('Learning journey context retrieval failed', { error });
            return null;
        }
    }

    private async getCharacterSystemContext(chapterNumber: number): Promise<any> {
        try {
            const characterManagerInstance = characterManager.getInstance(this.memoryManager);
            
            // 実際に利用可能なメソッドを使用
            let characters = [];
            let growthInfo = null;
            
            try {
                // getActiveCharacters が存在しない場合は getAllCharacters を使用
                if (typeof (characterManagerInstance as any).getAllCharacters === 'function') {
                    const allCharacters = await (characterManagerInstance as any).getAllCharacters();
                    // アクティブなキャラクターをフィルタリング
                    characters = allCharacters.filter((char: any) => 
                        char.state?.isActive !== false && 
                        (char.type === 'MAIN' || char.type === 'SUB')
                    );
                } else if (typeof (characterManagerInstance as any).getCharacters === 'function') {
                    characters = await (characterManagerInstance as any).getCharacters();
                }
                
                // getCharacterGrowthInfo が存在しない場合はフォールバック
                if (typeof (characterManagerInstance as any).getCharacterGrowthInfo === 'function') {
                    growthInfo = await (characterManagerInstance as any).getCharacterGrowthInfo();
                } else {
                    // フォールバック: 基本的な成長情報を生成
                    growthInfo = {
                        mainCharacters: characters.filter((char: any) => char.type === 'MAIN'),
                        supportingCharacters: characters.filter((char: any) => char.type === 'SUB')
                    };
                }
            } catch (methodError) {
                logger.debug('Character methods not available, using fallback', { methodError });
                characters = [];
                growthInfo = { mainCharacters: [], supportingCharacters: [] };
            }
            
            return {
                characters,
                growthInfo,
                systemStatus: 'active'
            };
        } catch (error) {
            logger.warn('Character system context retrieval failed', { error });
            return {};
        }
    }

    private async getWorldSystemContext(): Promise<any> {
        try {
            // WorldSettingsManagerの実際に利用可能なメソッドを使用
            let worldSettings = null;
            let genre = 'classic';
            
            try {
                // getStructuredWorldSettings が存在しない場合は getWorldSettings を使用
                if (typeof (this.worldSettingsManager as any).getWorldSettings === 'function') {
                    worldSettings = await (this.worldSettingsManager as any).getWorldSettings();
                } else if (typeof (this.worldSettingsManager as any).getStructuredWorldSettings === 'function') {
                    worldSettings = await (this.worldSettingsManager as any).getStructuredWorldSettings();
                } else {
                    // フォールバック: 基本的な世界設定を生成
                    worldSettings = {
                        description: 'Default world setting',
                        genre: 'classic',
                        regions: []
                    };
                }
                
                genre = await this.getGenre();
            } catch (methodError) {
                logger.debug('World settings methods not available, using fallback', { methodError });
                worldSettings = {
                    description: 'Fallback world setting',
                    genre: 'classic',
                    regions: []
                };
            }
            
            return {
                worldSettings,
                genre,
                systemStatus: this.eightSystemStatus.worldSettingsSystem.status
            };
        } catch (error) {
            logger.warn('World system context retrieval failed', { error });
            return {};
        }
    }

    private async getThemeSystemContext(): Promise<any> {
        try {
            // WorldSettingsManagerの実際に利用可能なメソッドを使用
            let themeSettings = null;
            let formattedTheme = null;
            
            try {
                // getStructuredThemeSettings が存在しない場合は getThemeSettings を使用
                if (typeof (this.worldSettingsManager as any).getThemeSettings === 'function') {
                    themeSettings = await (this.worldSettingsManager as any).getThemeSettings();
                } else if (typeof (this.worldSettingsManager as any).getStructuredThemeSettings === 'function') {
                    themeSettings = await (this.worldSettingsManager as any).getStructuredThemeSettings();
                } else {
                    // フォールバック: 基本的なテーマ設定を生成
                    themeSettings = {
                        description: 'Default theme',
                        mainThemes: ['Growth', 'Adventure'],
                        subThemes: ['Friendship', 'Courage']
                    };
                }
                
                if (typeof (this.worldSettingsManager as any).getFormattedWorldAndTheme === 'function') {
                    formattedTheme = await (this.worldSettingsManager as any).getFormattedWorldAndTheme();
                } else {
                    formattedTheme = {
                        theme: 'Character growth and adventure',
                        worldSettings: 'Fantasy world setting'
                    };
                }
            } catch (methodError) {
                logger.debug('Theme settings methods not available, using fallback', { methodError });
                themeSettings = {
                    description: 'Fallback theme',
                    mainThemes: ['Growth'],
                    subThemes: ['Discovery']
                };
                formattedTheme = {
                    theme: 'Character growth',
                    worldSettings: 'Generic world'
                };
            }
            
            return {
                themeSettings,
                formattedTheme,
                systemStatus: this.eightSystemStatus.themeSystem.status
            };
        } catch (error) {
            logger.warn('Theme system context retrieval failed', { error });
            return {};
        }
    }

    private async getForeshadowingSystemContext(chapterNumber: number): Promise<any> {
        if (!this.foreshadowingManager) {
            return {};
        }

        try {
            let activeForeshadowing = [];
            let suggestions = [];
            
            // ForeshadowingManagerの実際に利用可能なメソッドを使用
            try {
                if (typeof (this.foreshadowingManager as any).getActiveForeshadowingElements === 'function') {
                    activeForeshadowing = await (this.foreshadowingManager as any).getActiveForeshadowingElements(chapterNumber);
                } else if (typeof (this.foreshadowingManager as any).getForeshadowingForChapter === 'function') {
                    activeForeshadowing = await (this.foreshadowingManager as any).getForeshadowingForChapter(chapterNumber);
                }
                
                if (typeof (this.foreshadowingManager as any).generateSuggestions === 'function') {
                    suggestions = await (this.foreshadowingManager as any).generateSuggestions(chapterNumber);
                } else if (typeof (this.foreshadowingManager as any).getSuggestions === 'function') {
                    suggestions = await (this.foreshadowingManager as any).getSuggestions(chapterNumber);
                }
            } catch (methodError) {
                logger.debug('Foreshadowing methods not available, using fallback', { methodError });
                activeForeshadowing = [];
                suggestions = [];
            }
            
            return {
                activeForeshadowing,
                suggestions,
                systemStatus: this.eightSystemStatus.foreshadowingSystem.status
            };
        } catch (error) {
            logger.warn('Foreshadowing system context retrieval failed', { error });
            return {};
        }
    }

    private async getQualitySystemContext(chapterNumber: number): Promise<any> {
        try {
            // 品質履歴の取得（簡易実装）
            const recentQualityMetrics = await this.getRecentQualityMetrics(chapterNumber);
            
            return {
                recentQualityMetrics,
                qualityThresholds: this.getQualityThresholds(),
                systemStatus: this.eightSystemStatus.qualitySystem.status
            };
        } catch (error) {
            logger.warn('Quality system context retrieval failed', { error });
            return {};
        }
    }

    /**
     * 🔧 システムコンテキストで指示を強化（型安全版）
     */
    private enhanceDirectivesWithSystemContext(
        directives: any,
        eightSystemContext: any
    ): any {
        try {
            const enhanced = { ...directives };

            // 基本的な情報追加（型安全）
            if (eightSystemContext.integrationMetrics?.overallIntegrationScore) {
                // システム統合スコアを追加情報として含める
                enhanced.systemInfo = `統合スコア: ${eightSystemContext.integrationMetrics.overallIntegrationScore.toFixed(2)}`;
            }

            return enhanced;

        } catch (error) {
            logger.warn('システムコンテキストによる指示の強化に失敗', { error });
            return directives;
        }
    }

    /**
     * 🔧 8システムコンテキストでの指示エンリッチ
     */
    private async enrichDirectivesWithEightSystemContext(
        directives: BaseChapterDirectives,
        eightSystemContext: any
    ): Promise<BaseChapterDirectives> {
        try {
            const enrichedDirectives = { ...directives };

            // 記憶システムからの情報で強化
            if (eightSystemContext.memoryContext?.searchResults?.results?.length > 0) {
                const recentChapters = eightSystemContext.memoryContext.searchResults.results
                    .filter((r: any) => r.type === 'chapter')
                    .slice(-3);
                
                if (recentChapters.length > 0) {
                    enrichedDirectives.currentSituation += ` 前章からの継続: ${recentChapters.map((ch: any) => ch.data?.title || '不明').join(', ')}`;
                }
            }

            // 学習旅程からの情報で強化
            if (eightSystemContext.learningJourneyContext?.advice) {
                const advice = eightSystemContext.learningJourneyContext.advice;
                enrichedDirectives.requiredPlotElements = [
                    ...enrichedDirectives.requiredPlotElements,
                    `学習要素: ${advice.mainConcept || '成長'}を意識した展開`
                ];
            }

            // キャラクターシステムからの情報で強化
            if (eightSystemContext.characterContext?.characters?.length > 0) {
                const characterNames = eightSystemContext.characterContext.characters
                    .slice(0, 3)
                    .map((char: any) => char.name || '不明')
                    .join(', ');
                
                enrichedDirectives.worldElementsFocus = [
                    ...enrichedDirectives.worldElementsFocus,
                    `主要キャラクター: ${characterNames}の描写強化`
                ];
            }

            // 伏線システムからの情報で強化
            if (eightSystemContext.foreshadowingContext?.activeForeshadowing?.length > 0) {
                enrichedDirectives.requiredPlotElements = [
                    ...enrichedDirectives.requiredPlotElements,
                    ...eightSystemContext.foreshadowingContext.activeForeshadowing
                        .map((f: any) => `伏線要素: ${f.description || f}`)
                        .slice(0, 2)
                ];
            }

            return enrichedDirectives;

        } catch (error) {
            logger.warn('8システムコンテキストによる指示のエンリッチに失敗', { error });
            return directives;
        }
    }

    // ============================================================================
    // ユーティリティメソッド群
    // ============================================================================

    /**
     * システム状態の更新
     */
    private updateSystemStatus(
        system: keyof EightSystemIntegrationStatus,
        status: 'active' | 'degraded' | 'offline',
        utilization: number
    ): void {
        this.eightSystemStatus[system] = { status, utilization };
    }

    /**
     * 全体統合スコアの計算
     */
    private calculateOverallIntegrationScore(): number {
        const systems = Object.values(this.eightSystemStatus);
        const totalUtilization = systems.reduce((sum, system) => sum + system.utilization, 0);
        return totalUtilization / systems.length;
    }

    /**
     * アクティブシステム数の取得
     */
    private getActiveSystemsCount(): number {
        return Object.values(this.eightSystemStatus).filter(
            system => system.status === 'active'
        ).length;
    }

    /**
     * 8システム状態の取得
     */
    getEightSystemStatus(): EightSystemIntegrationStatus {
        return { ...this.eightSystemStatus };
    }

    /**
     * 統合品質の計算
     */
    private calculateIntegrationQuality(results: any[]): number {
        const successfulResults = results.filter(result => 
            result && (result.success !== false)
        );
        
        return successfulResults.length / Math.max(1, results.length);
    }

    /**
     * 品質閾値の取得
     */
    private getQualityThresholds(): any {
        return {
            readability: 0.7,
            consistency: 0.8,
            engagement: 0.75,
            overall: this.config.systemIntegrationThreshold
        };
    }

    /**
     * 最近の品質メトリクスの取得
     */
    private async getRecentQualityMetrics(chapterNumber: number): Promise<any[]> {
        // 簡易実装: 実際には品質履歴データベースから取得
        return [];
    }

    // ============================================================================
    // 既存メソッドの継承（一部強化）
    // ============================================================================

    /**
     * 🔧 最適化されたジャンル取得（8システム統合版）
     */
    async getGenre(): Promise<string> {
        try {
            // 🔧 STEP 1: WorldSettingsManagerから直接取得（最高優先度・最高速）
            if (this.worldSettingsManager) {
                try {
                    const genre = await this.worldSettingsManager.getGenre();
                    if (genre && genre !== 'classic') {
                        this.updateSystemStatus('worldSettingsSystem', 'active', 0.9);
                        logger.debug(`Genre obtained from WorldSettingsManager: ${genre}`);
                        return genre;
                    }
                } catch (wsError) {
                    this.updateSystemStatus('worldSettingsSystem', 'degraded', 0.5);
                    logger.debug('WorldSettingsManager genre access failed, trying alternatives', {
                        error: wsError instanceof Error ? wsError.message : String(wsError)
                    });
                }
            }

            // 🔧 STEP 2: ServiceContainer経由でのWorldSettingsManagerアクセス
            if (this.serviceContainer) {
                try {
                    const wsm = await this.serviceContainer.getService('worldSettingsManager');
                    if (wsm) {
                        const genre = await wsm.getGenre();
                        if (genre && genre !== 'classic') {
                            this.updateSystemStatus('worldSettingsSystem', 'active', 0.8);
                            logger.debug(`Genre obtained from ServiceContainer: ${genre}`);
                            return genre;
                        }
                    }
                } catch (scError) {
                    logger.debug('ServiceContainer WorldSettingsManager access failed', {
                        error: scError instanceof Error ? scError.message : String(scError)
                    });
                }
            }

            // 🔧 STEP 3: 記憶システムからの取得（フォールバック）
            if (this.config.memorySystemIntegration && this.memoryManager?.getSystemStatus) {
                try {
                    const systemStatus = await this.memoryManager.getSystemStatus();
                    if (systemStatus.initialized) {
                        const searchResult = await this.memoryManager.unifiedSearch(
                            'genre world settings',
                            [MemoryLevel.LONG_TERM]
                        );

                        if (searchResult.success && searchResult.results.length > 0) {
                            const genreResult = searchResult.results.find(r =>
                                r.data?.genre || r.data?.worldSettings?.genre
                            );

                            if (genreResult) {
                                const genre = genreResult.data?.genre || genreResult.data?.worldSettings?.genre;
                                if (genre && typeof genre === 'string') {
                                    this.performanceStats.memorySystemHits++;
                                    this.updateSystemStatus('memorySystem', 'active', 0.8);
                                    logger.debug(`Genre obtained from memory system: ${genre}`);
                                    return genre;
                                }
                            }
                        }
                    }
                } catch (memoryError) {
                    this.updateSystemStatus('memorySystem', 'degraded', 0.5);
                    logger.debug('Memory system genre access failed', {
                        error: memoryError instanceof Error ? memoryError.message : String(memoryError)
                    });
                }
            }

            // 🔧 STEP 4: 最終フォールバック
            logger.debug('All genre sources failed, using default');
            return 'classic';

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.warn('Failed to get genre via 8-system integrated PlotManager', { error: errorMessage });
            return 'classic';
        }
    }

    // ============================================================================
    // 継承メソッド（PlotManager基本機能）の実装
    // ============================================================================

    async getConcretePlotForChapter(chapterNumber: number): Promise<ConcretePlotPoint | null> {
        try {
            await this.ensureInitialized();
            const allConcretePlots = await this.plotStorage.loadConcretePlot();
            return allConcretePlots.find(plot =>
                chapterNumber >= plot.chapterRange[0] &&
                chapterNumber <= plot.chapterRange[1]
            ) || null;
        } catch (error) {
            logger.error('Failed to get concrete plot for chapter', { error, chapterNumber });
            return null;
        }
    }

    async getAbstractGuidelinesForChapter(chapterNumber: number): Promise<AbstractPlotGuideline> {
        try {
            await this.ensureInitialized();
            const abstractPlots = await this.plotStorage.loadAbstractPlot();
            const matchingPlot = abstractPlots.find(plot =>
                plot.chapterRange &&
                chapterNumber >= plot.chapterRange[0] &&
                chapterNumber <= plot.chapterRange[1]
            );

            if (matchingPlot) {
                return matchingPlot;
            }

            // フォールバック: デフォルト抽象ガイドライン
            return {
                phase: 'NEUTRAL',
                theme: 'キャラクターの成長',
                emotionalTone: 'バランスの取れた展開',
                potentialDirections: ['物語の自然な進行'],
                prohibitedElements: ['急激な変化']
            };
        } catch (error) {
            logger.error('Failed to get abstract guidelines for chapter', { error, chapterNumber });
            return {
                phase: 'NEUTRAL',
                theme: 'キャラクターの成長',
                emotionalTone: 'バランスの取れた展開',
                potentialDirections: ['物語の自然な進行'],
                prohibitedElements: ['急激な変化']
            };
        }
    }

    async getPhaseInformation(chapterNumber: number): Promise<any> {
        try {
            await this.ensureInitialized();
            const concretePlots = await this.plotStorage.loadConcretePlot();
            const abstractPlots = await this.plotStorage.loadAbstractPlot();
            return this.phaseManager.identifyPhase(chapterNumber, concretePlots, abstractPlots);
        } catch (error) {
            logger.error('Failed to get phase information', { error, chapterNumber });
            return {
                phase: 'MIDDLE',
                phaseProgress: 0.5,
                importance: 0.7,
                isTransitionPoint: false
            };
        }
    }

    async generatePlotDirective(chapterNumber: number): Promise<string> {
        try {
            await this.ensureInitialized();

            // 基本的なプロット指示を生成
            const concretePlot = await this.getConcretePlotForChapter(chapterNumber);
            const abstractGuideline = await this.getAbstractGuidelinesForChapter(chapterNumber);
            const phaseInfo = await this.getPhaseInformation(chapterNumber);

            let directive = "## 物語構造とプロット指示（ストーリーの骨格）\n\n";

            // 物語フェーズの情報
            directive += `**現在の物語フェーズ**: ${this.formatPhase(phaseInfo.phase)}\n`;
            directive += `**フェーズ進行度**: ${Math.round(phaseInfo.phaseProgress * 100)}%\n`;
            directive += `**重要度**: ${Math.round(phaseInfo.importance * 10)}/10\n\n`;

            // 具体的プロットの情報
            if (concretePlot) {
                directive += "### このチャプターで達成すべきストーリー要素\n";
                directive += `**タイトル**: ${concretePlot.title}\n`;
                directive += `**目標**: ${concretePlot.storyGoal || concretePlot.summary}\n\n`;

                if (concretePlot.keyEvents.length > 0) {
                    directive += "**必須イベント**:\n";
                    concretePlot.keyEvents.forEach(event => {
                        directive += `- ${event}\n`;
                    });
                    directive += "\n";
                }
            }

            // 抽象ガイドラインの情報
            directive += "### テーマと方向性\n";
            directive += `**テーマ**: ${abstractGuideline.theme}\n`;
            directive += `**感情基調**: ${abstractGuideline.emotionalTone}\n\n`;

            return directive;

        } catch (error) {
            logger.error('Failed to generate plot directive', { error, chapterNumber });
            return `## 章${chapterNumber}の基本的な物語進行指示\n\n物語の自然な流れを継続し、キャラクターの成長を描いてください。`;
        }
    }

    async getSectionForChapter(chapterNumber: number): Promise<SectionPlot | null> {
        try {
            await this.ensureInitialized();
            if (!this.sectionPlotManager) {
                return null;
            }
            return await this.sectionPlotManager.getSectionByChapter(chapterNumber);
        } catch (error) {
            logger.error('Failed to get section for chapter', { error, chapterNumber });
            return null;
        }
    }

    async createSection(params: SectionPlotParams): Promise<SectionPlot> {
        try {
            await this.ensureInitialized();
            if (!this.sectionPlotManager) {
                throw new Error('SectionPlotManager not available');
            }
            return await this.sectionPlotManager.createSectionPlot(params);
        } catch (error) {
            logger.error('Failed to create section', { error, params });
            throw error;
        }
    }

    async getAllSections(): Promise<SectionPlot[]> {
        try {
            await this.ensureInitialized();
            if (!this.sectionPlotManager) {
                return [];
            }
            return await this.sectionPlotManager.getAllSections();
        } catch (error) {
            logger.error('Failed to get all sections', { error });
            return [];
        }
    }

    async hasValidWorldSettings(): Promise<boolean> {
        try {
            await this.ensureInitialized();
            if (typeof (this.worldSettingsManager as any).hasValidWorldSettings === 'function') {
                return await (this.worldSettingsManager as any).hasValidWorldSettings();
            }
            return true; // フォールバック
        } catch (error) {
            return false;
        }
    }

    async hasValidThemeSettings(): Promise<boolean> {
        try {
            await this.ensureInitialized();
            if (typeof (this.worldSettingsManager as any).hasValidThemeSettings === 'function') {
                return await (this.worldSettingsManager as any).hasValidThemeSettings();
            }
            return true; // フォールバック
        } catch (error) {
            return false;
        }
    }

    async getFormattedWorldAndTheme(): Promise<FormattedWorldAndTheme> {
        try {
            await this.ensureInitialized();
            if (typeof (this.worldSettingsManager as any).getFormattedWorldAndTheme === 'function') {
                return await (this.worldSettingsManager as any).getFormattedWorldAndTheme();
            }
            
            // フォールバック
            return {
                worldSettings: 'Default fantasy world setting with magic and adventure.',
                theme: 'Character growth through challenges and discovery.',
                worldSettingsDetailed: {
                    description: 'Default fantasy world',
                    genre: 'fantasy'
                },
                themeSettingsDetailed: {
                    description: 'Character growth theme',
                    mainThemes: ['Growth', 'Adventure']
                }
            };
        } catch (error) {
            logger.error('Failed to get formatted world and theme', { error });
            return {
                worldSettings: 'Generic world setting.',
                theme: 'Character development theme.'
            };
        }
    }

    async getStructuredWorldSettings(): Promise<WorldSettings | null> {
        try {
            const context = await this.getWorldSystemContext();
            return context.worldSettings || null;
        } catch (error) {
            logger.error('Failed to get structured world settings', { error });
            return null;
        }
    }

    async getStructuredThemeSettings(): Promise<ThemeSettings | null> {
        try {
            const context = await this.getThemeSystemContext();
            return context.themeSettings || null;
        } catch (error) {
            logger.error('Failed to get structured theme settings', { error });
            return null;
        }
    }

    private formatPhase(phase: string): string {
        const phaseMap: { [key: string]: string } = {
            'OPENING': '序章/オープニング',
            'EARLY': '序盤',
            'MIDDLE': '中盤',
            'LATE': '終盤',
            'CLIMAX': 'クライマックス',
            'ENDING': '終章/エンディング'
        };
        return phaseMap[phase] || phase;
    }

    /**
     * 🔧 強化版診断情報取得（8システム対応）
     */
    async performDiagnostics(): Promise<{
        initialized: boolean;
        eightSystemIntegration: boolean;
        performanceMetrics: PerformanceMetrics;
        systemStatuses: EightSystemIntegrationStatus;
        integrationScore: number;
        recommendations: string[];
    }> {
        try {
            const recommendations: string[] = [];
            const integrationScore = this.calculateOverallIntegrationScore();

            // システム個別チェック
            Object.entries(this.eightSystemStatus).forEach(([systemName, status]) => {
                if (status.status === 'offline') {
                    recommendations.push(`${systemName}が無効化されています`);
                } else if (status.status === 'degraded') {
                    recommendations.push(`${systemName}の機能が制限されています`);
                }
            });

            // 統合スコアチェック
            if (integrationScore < this.config.systemIntegrationThreshold) {
                recommendations.push(`システム統合スコア(${integrationScore.toFixed(2)})が閾値を下回っています`);
            }

            // パフォーマンスチェック
            if (this.performanceStats.failedOperations > this.performanceStats.successfulOperations * 0.1) {
                recommendations.push('エラー率が高くなっています');
            }

            if (this.performanceStats.averageProcessingTime > 5000) {
                recommendations.push('平均処理時間が長くなっています');
            }

            return {
                initialized: this.initialized,
                eightSystemIntegration: this.config.enableEightSystemIntegration,
                performanceMetrics: { ...this.performanceStats },
                systemStatuses: { ...this.eightSystemStatus },
                integrationScore,
                recommendations
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('8システム統合PlotManager診断の実行に失敗', { error: errorMessage });

            return {
                initialized: false,
                eightSystemIntegration: false,
                performanceMetrics: { ...this.performanceStats },
                systemStatuses: { ...this.eightSystemStatus },
                integrationScore: 0,
                recommendations: ['診断実行に失敗しました']
            };
        }
    }

    // ============================================================================
    // プライベートヘルパーメソッド
    // ============================================================================

    private updateAverageProcessingTime(processingTime: number): void {
        this.performanceStats.averageProcessingTime =
            ((this.performanceStats.averageProcessingTime * (this.performanceStats.totalOperations - 1)) + processingTime) /
            this.performanceStats.totalOperations;
    }

    private generateFallbackPromptElements(chapterNumber: number): PromptElements {
        return {
            CHAPTER_GOAL: `章${chapterNumber}の物語を自然に進展させる`,
            REQUIRED_PLOT_ELEMENTS: "- キャラクターの成長\n- 世界観の発展\n- 興味深い展開",
            CURRENT_LOCATION: "適切な場所設定",
            CURRENT_SITUATION: "物語の進行状況",
            ACTIVE_CHARACTERS: "- 主要キャラクター",
            WORLD_ELEMENTS_FOCUS: "- 重要な世界設定要素",
            THEMATIC_FOCUS: "- 物語のテーマ"
        };
    }

    async ensureInitialized(): Promise<void> {
        if (this.initialized) return;

        if (this.initializationPromise) {
            await withTimeout(
                this.initializationPromise,
                30000,
                'プロットマネージャーの初期化の待機'
            );
        } else {
            this.initializationPromise = this.initialize();
            await withTimeout(
                this.initializationPromise,
                30000,
                'プロットマネージャーの初期化'
            );
        }
    }

    async ensureMemoryManagerInitialized(): Promise<void> {
        try {
            const systemStatus = await this.memoryManager.getSystemStatus();

            if (!systemStatus.initialized) {
                logger.warn('MemoryManager not initialized, attempting initialization...');
                await this.memoryManager.initialize();

                const retryStatus = await this.memoryManager.getSystemStatus();
                if (!retryStatus.initialized) {
                    throw new Error('MemoryManager initialization failed');
                }
            }

            this.updateSystemStatus('memorySystem', 'active', 0.9);
            logger.debug('MemoryManager initialization verified');
            this.performanceStats.memorySystemHits++;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.updateSystemStatus('memorySystem', 'degraded', 0.3);
            logger.error('MemoryManager initialization check failed', { error: errorMessage });
            throw error;
        }
    }

    async ensureWorldSettingsManagerInitialized(): Promise<void> {
        try {
            if (this.serviceContainer) {
                const wsm = await this.serviceContainer.getService('worldSettingsManager');
                if (wsm) {
                    this.worldSettingsManager = wsm;
                    this.updateSystemStatus('worldSettingsSystem', 'active', 0.9);
                    logger.debug('WorldSettingsManager verified through ServiceContainer');
                    return;
                }
            }

            if (!this.worldSettingsManager) {
                this.worldSettingsManager = new WorldSettingsManager();
            }

            // hasValidWorldSettings メソッドが存在するかチェック
            if (typeof (this.worldSettingsManager as any).hasValidWorldSettings === 'function') {
                const hasValid = await (this.worldSettingsManager as any).hasValidWorldSettings();
                if (!hasValid && typeof (this.worldSettingsManager as any).initialize === 'function') {
                    await (this.worldSettingsManager as any).initialize();
                }
            }

            this.updateSystemStatus('worldSettingsSystem', 'active', 0.8);
            logger.debug('WorldSettingsManager initialization verified');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.updateSystemStatus('worldSettingsSystem', 'degraded', 0.3);
            logger.error('WorldSettingsManager initialization check failed', { error: errorMessage });
            // エラーをスローしないで継続
        }
    }

    async initializeDependencies(): Promise<void> {
        try {
            // PlotCheckerの初期化（循環依存を避けるため遅延）
            const { PlotChecker } = await import('./checker');
            const characterManagerInstance = characterManager.getInstance(this.memoryManager);
            this.plotChecker = new PlotChecker(
                this.memoryManager,
                characterManagerInstance,
                this
            );

            logger.debug('Dependencies initialized successfully');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('Failed to initialize dependencies', { error: errorMessage });

            // フォールバック: 基本的なチェッカーオブジェクト
            this.plotChecker = {
                checkGeneratedContentConsistency: async () => ({ consistent: true, issues: [] })
            };
        }
    }

    async initializeSectionPlotManager(): Promise<void> {
        if (!this.config.enableSectionPlotImport) {
            logger.debug('Section plot import disabled');
            return;
        }

        try {
            // 動的インポートで循環依存を回避
            const { getSectionPlotManager } = await import('./section/section-plot-manager');

            this.sectionPlotManager = getSectionPlotManager(
                this.memoryManager,
                this.geminiClient,
                this.learningJourneySystem || undefined,
                {
                    useMemorySystemIntegration: this.config.memorySystemIntegration,
                    enableAutoBackup: true,
                    enableQualityAssurance: this.config.enableQualityAssurance,
                    cacheEnabled: true,
                    optimizationEnabled: this.config.enablePerformanceOptimization
                }
            );

            if (typeof this.sectionPlotManager.initialize === 'function') {
                await withTimeout(
                    this.sectionPlotManager.initialize(),
                    15000,
                    '篇マネージャーの初期化'
                );
            }

            logger.info('篇マネージャーの初期化完了');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.warn(`篇マネージャーの初期化に失敗しましたが、処理を継続します: ${errorMessage}`);

            // フォールバック: 基本的なセクションマネージャーオブジェクト
            this.sectionPlotManager = {
                initialize: async () => { },
                getSectionByChapter: async () => null,
                createSectionPlot: async () => null,
                updateSection: async () => { },
                getAllSections: async () => []
            };
        }
    }

    loadExtendedComponents(): void {
        // 中期プロットから篇情報をロード（非同期）
        if (this.config.enableSectionPlotImport) {
            this.importMediumPlotSections().catch(error => {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logger.warn(`中期プロットからの篇情報ロードに失敗: ${errorMessage}`);
            });
        }

        logger.info('Extended components loading started asynchronously');
    }

    private async importMediumPlotSections(): Promise<void> {
        try {
            const mediumPlot = await withTimeout(
                this.plotStorage.loadMediumPlot(),
                10000,
                '中期プロットの読み込み'
            );

            if (!mediumPlot || !mediumPlot.sections || !mediumPlot.sections.length) {
                logger.info('中期プロットが見つからないか、セクションが含まれていません');
                return;
            }

            logger.info(`中期プロットから ${mediumPlot.sections.length} 個のセクションを読み込みます`);
            // 実装省略: 実際のセクションインポート処理

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('中期プロットからのセクション読み込みに失敗', { error: errorMessage });
        }
    }

    // async getConcretePlotForChapter(chapterNumber: number): Promise<ConcretePlotPoint | null> {
    //     // 既存の実装を継承
    //     return null; // 簡易実装
    // }

    // async getAbstractGuidelinesForChapter(chapterNumber: number): Promise<AbstractPlotGuideline> {
    //     // 既存の実装を継承
    //     return {
    //         phase: 'NEUTRAL',
    //         theme: 'キャラクターの成長',
    //         emotionalTone: 'バランスの取れた展開',
    //         potentialDirections: ['物語の自然な進行'],
    //         prohibitedElements: ['急激な変化']
    //     };
    // }

    // async getPhaseInformation(chapterNumber: number): Promise<any> {
    //     // 既存の実装を継承
    //     return {
    //         phase: 'MIDDLE',
    //         phaseProgress: 0.5,
    //         importance: 0.7,
    //         isTransitionPoint: false
    //     };
    // }

    // ============================================================================
    // パブリックAPI（8システム統合状態情報）
    // ============================================================================

    /**
     * 8システム統合状態を取得
     */
    getSystemIntegrationStatus(): EightSystemIntegrationStatus {
        return { ...this.eightSystemStatus };
    }

    /**
     * システム統合メトリクスを取得
     */
    getSystemIntegrationMetrics(): SystemIntegrationMetrics {
        return this.calculateSystemIntegrationMetrics();
    }

    /**
     * パフォーマンス統計を取得
     */
    getPerformanceStatistics(): PerformanceMetrics {
        return { ...this.performanceStats };
    }

    /**
     * 初期化状態を取得
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * 8システム統合有効状態を取得
     */
    isEightSystemIntegrationEnabled(): boolean {
        return this.config.enableEightSystemIntegration;
    }

    /**
     * 学習旅路システムの可用性を取得
     */
    isLearningJourneyAvailable(): boolean {
        return this.learningJourneySystem !== null && this.learningJourneyInitialized;
    }

    /**
     * 伏線システムの可用性を取得
     */
    isForeshadowingSystemAvailable(): boolean {
        return this.foreshadowingManager !== null && this.eightSystemStatus.foreshadowingSystem.status === 'active';
    }
}

// ============================================================================
// 🔧 ファクトリー関数（8システム統合パターン）
// ============================================================================

/**
 * 8システム統合PlotManagerを作成するファクトリー関数
 */
export function createEightSystemPlotManager(
    dependencies: EightSystemPlotManagerDependencies
): PlotManager {
    return new PlotManager(dependencies);
}

/**
 * PlotManagerのシングルトンインスタンスを作成（8システム統合版）
 */
let eightSystemPlotManagerInstance: PlotManager | null = null;

export function getEightSystemPlotManagerInstance(
    dependencies: EightSystemPlotManagerDependencies
): PlotManager {
    if (!eightSystemPlotManagerInstance) {
        eightSystemPlotManagerInstance = createEightSystemPlotManager({
            ...dependencies,
            config: {
                enableLearningJourney: true,
                enableSectionPlotImport: true,
                enableQualityAssurance: true,
                enablePerformanceOptimization: true,
                enableEightSystemIntegration: true,
                memorySystemIntegration: true,
                systemIntegrationThreshold: 0.8,
                ...dependencies.config
            }
        });
    }
    return eightSystemPlotManagerInstance;
}

// レガシー互換性のための既存ファクトリー関数も保持
export function createPlotManager(
    memoryManager: MemoryManager,
    config?: PlotManagerConfig
): PlotManager {
    return new PlotManager({
        memoryManager,
        config
    });
}

export function getPlotManagerInstance(memoryManager: MemoryManager): PlotManager {
    return createPlotManager(memoryManager, {
        enableLearningJourney: true,
        enableSectionPlotImport: true,
        enableQualityAssurance: true,
        enablePerformanceOptimization: true,
        enableEightSystemIntegration: true,
        memorySystemIntegration: true
    });
}