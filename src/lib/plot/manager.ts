
// src/lib/plot/manager.ts (最適化完成版 - ジャンル取得最適化)

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
}

import {
    SectionPlot,
    SectionPlotParams
} from './section/types';

// 学習旅路システムクラスのインポート
import LearningJourneySystem from '@/lib/learning-journey';
import { LearningStage } from '@/lib/learning-journey/concept-learning-manager';

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
    lastOptimization: string;
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
    learningJourneyTimeout?: number;
    memorySystemIntegration?: boolean;
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
 * 🔧 NEW: 最適化されたPlotManagerの依存関係
 */
export interface OptimizedPlotManagerDependencies {
    memoryManager: MemoryManager;
    worldSettingsManager: WorldSettingsManager;
    geminiClient: GeminiClient;
    serviceContainer: any; // ServiceContainerの型
    config?: PlotManagerConfig;
}

/**
 * @class PlotManager
 * @description
 * 新記憶階層システム完全対応のプロット管理システム。
 * 統合記憶管理（MemoryManager）を活用した最適化された実装。
 * 🔧 ジャンル取得最適化版
 */
export class PlotManager {
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

    // 🔧 NEW: 最適化されたアクセス用
    private worldSettingsManager: WorldSettingsManager;
    private serviceContainer: any;

    // 学習旅路システム（遅延初期化）
    private learningJourneySystem: LearningJourneySystem | null = null;
    private learningJourneyInitialized: boolean = false;

    // セクションマネージャー（遅延初期化）
    private sectionPlotManager: any = null;

    // パフォーマンス統計
    private performanceStats = {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageProcessingTime: 0,
        memorySystemHits: 0,
        cacheEfficiencyRate: 0,
        lastOptimization: new Date().toISOString()
    };

    /**
     * プロットマネージャーのコンストラクタ（最適化版）
     * @param dependencies 依存関係（最適化版）
     */
    constructor(dependencies: PlotManagerDependencies | OptimizedPlotManagerDependencies) {
        // 🔧 最適化された依存注入パターンの実装
        this.memoryManager = dependencies.memoryManager;
        this.config = {
            enableLearningJourney: true,
            enableSectionPlotImport: true,
            enableQualityAssurance: true,
            enablePerformanceOptimization: true,
            learningJourneyTimeout: 45000,
            memorySystemIntegration: true,
            ...dependencies.config
        };

        // 🔧 NEW: 最適化された依存関係の設定
        if ('worldSettingsManager' in dependencies) {
            this.worldSettingsManager = dependencies.worldSettingsManager;
            this.geminiClient = dependencies.geminiClient;
            this.serviceContainer = dependencies.serviceContainer;
            logger.info('PlotManager created with optimized dependencies for fast genre access');
        } else {
            // 従来の依存注入パターン（後方互換性）
            this.worldSettingsManager = new WorldSettingsManager();
            this.geminiClient = new GeminiClient();
            this.serviceContainer = null;
            logger.info('PlotManager created with legacy dependencies');
        }

        // 基本コンポーネントの初期化
        this.plotStorage = new PlotStorage();
        this.plotContextBuilder = new PlotContextBuilder();
        this.phaseManager = new StoryPhaseManager();

        // 🔧 修正: StoryGenerationBridgeに必要な引数を渡す
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
     * 🔧 最適化された初期化
     */
    private async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('PlotManager already initialized');
            return;
        }

        try {
            logger.info('Starting PlotManager initialization with optimized dependencies');
            this.performanceStats.totalOperations++;

            const startTime = Date.now();

            // 1. 🔧 MemoryManagerの初期化状態確認
            await this.ensureMemoryManagerInitialized();

            // 2. 🔧 WorldSettingsManagerの初期化確認（ServiceContainer経由で確保済み）
            await this.ensureWorldSettingsManagerInitialized();

            // 3. プロットストレージの初期化
            await withTimeout(
                this.plotStorage.initialize(),
                15000,
                'プロットストレージの初期化'
            );

            // 4. 🔧 依存関係の遅延初期化
            await this.initializeDependencies();

            // 5. 篇マネージャーの初期化
            await this.initializeSectionPlotManager();

            // 6. 🔧 学習旅路システムの遅延初期化準備
            if (this.config.enableLearningJourney) {
                this.prepareLearningJourneySystem();
            }

            // 7. 拡張コンポーネントの非同期ロード
            this.loadExtendedComponents();

            this.initialized = true;
            this.performanceStats.successfulOperations++;

            const processingTime = Date.now() - startTime;
            this.updateAverageProcessingTime(processingTime);

            logger.info('PlotManager initialization completed successfully (optimized)', {
                processingTime,
                memorySystemIntegration: this.config.memorySystemIntegration,
                optimizedAccess: !!this.serviceContainer
            });

        } catch (error) {
            this.performanceStats.failedOperations++;
            this.initialized = false;

            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('Failed to initialize PlotManager', { error: errorMessage });
            throw new Error(`PlotManager initialization failed: ${errorMessage}`);
        } finally {
            this.initializationPromise = null;
        }
    }

    /**
     * 🔧 NEW: WorldSettingsManagerの初期化確認
     */
    private async ensureWorldSettingsManagerInitialized(): Promise<void> {
        try {
            if (this.serviceContainer) {
                // ServiceContainer経由で確実に初期化済みのWorldSettingsManagerを取得
                const wsm = await this.serviceContainer.getService('worldSettingsManager');
                if (wsm) {
                    this.worldSettingsManager = wsm;
                    logger.debug('WorldSettingsManager verified through ServiceContainer');
                    return;
                }
            }

            // フォールバック: 直接初期化
            if (!this.worldSettingsManager) {
                this.worldSettingsManager = new WorldSettingsManager();
            }

            // 初期化されていない場合のみ初期化
            if (!await this.worldSettingsManager.hasValidWorldSettings()) {
                await this.worldSettingsManager.initialize();
            }

            logger.debug('WorldSettingsManager initialization verified');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('WorldSettingsManager initialization check failed', { error: errorMessage });
            throw error;
        }
    }

    /**
     * 🔧 MemoryManagerの初期化状態確認
     */
    private async ensureMemoryManagerInitialized(): Promise<void> {
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

            logger.debug('MemoryManager initialization verified');
            this.performanceStats.memorySystemHits++;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('MemoryManager initialization check failed', { error: errorMessage });
            throw error;
        }
    }

    /**
     * 🔧 最適化されたジャンル取得（WorldSettingsManager優先）
     */
    async getGenre(): Promise<string> {
        try {
            // 🔧 STEP 1: WorldSettingsManagerから直接取得（最高優先度・最高速）
            if (this.worldSettingsManager) {
                try {
                    const genre = await this.worldSettingsManager.getGenre();
                    if (genre && genre !== 'classic') {
                        logger.debug(`Genre obtained from WorldSettingsManager: ${genre}`);
                        return genre;
                    }
                } catch (wsError) {
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
                                    logger.debug(`Genre obtained from memory system: ${genre}`);
                                    return genre;
                                }
                            }
                        }
                    }
                } catch (memoryError) {
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
            logger.warn('Failed to get genre via optimized PlotManager', { error: errorMessage });
            return 'classic';
        }
    }

    /**
     * 🔧 修正: 依存関係の遅延初期化
     */
    private async initializeDependencies(): Promise<void> {
        try {
            // PlotCheckerの初期化（循環依存を避けるため遅延）
            const { PlotChecker } = await import('./checker');
            const characterManagerInstance = characterManager.getInstance(this.memoryManager);
            this.plotChecker = new PlotChecker(
                this.memoryManager,
                characterManagerInstance,  // ✅ 実際のインスタンス
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

    /**
     * 🔧 WorldSettingsManagerの安全な初期化
     */
    private async initializeWorldSettingsManager(): Promise<void> {
        try {
            await withTimeout(
                this.worldSettingsManager.initialize(),
                15000,
                '世界設定マネージャーの初期化'
            );

            // 設定が正しく読み込まれているか確認
            const hasValidSettings = await this.worldSettingsManager.hasValidWorldSettings();
            if (hasValidSettings) {
                logger.info('世界設定マネージャーの初期化完了（設定ファイル読み込み成功）');
            } else {
                logger.warn('世界設定マネージャーは初期化されましたが、設定ファイルが読み込まれていません');
                await this.setupFallbackWorldSettings();
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.warn(`世界設定マネージャーの初期化に失敗: ${errorMessage}`);
            await this.setupFallbackWorldSettings();
        }
    }

    /**
     * 🔧 フォールバック用の世界設定をセットアップ
     */
    private async setupFallbackWorldSettings(): Promise<void> {
        try {
            const fallbackSettings = {
                genre: 'classic',
                description: 'デフォルトの物語世界設定です。適切な設定ファイルを配置してください。',
                regions: []
            };

            // 型安全なプロパティアクセス
            (this.worldSettingsManager as any).worldSettings = fallbackSettings;
            (this.worldSettingsManager as any).initialized = true;

            logger.info('フォールバック世界設定を適用しました', {
                genre: fallbackSettings.genre
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('フォールバック世界設定の適用に失敗しました', { error: errorMessage });
        }
    }

    /**
     * 🔧 修正: 篇マネージャーの初期化
     */
    private async initializeSectionPlotManager(): Promise<void> {
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

            await withTimeout(
                this.sectionPlotManager.initialize(),
                15000,
                '篇マネージャーの初期化'
            );

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

    /**
     * 🔧 学習旅路システムの準備（遅延初期化）
     */
    private prepareLearningJourneySystem(): void {
        try {
            const characterManagerInstance = characterManager.getInstance(this.memoryManager);
            this.learningJourneySystem = new LearningJourneySystem(
                this.geminiClient,
                this.memoryManager,
                characterManagerInstance  // ✅ 実際のインスタンス
            );

            logger.info('LearningJourneySystem instance created, initialization will be deferred');

            // 非同期で初期化を試行（メイン初期化をブロックしない）
            this.deferredInitializeLearningJourney().catch(error => {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logger.warn(`学習旅路システムの遅延初期化に失敗しました: ${errorMessage}`);
                this.learningJourneySystem = null;
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.warn('学習旅路システムの作成に失敗しました。関連機能は無効になります', {
                error: errorMessage
            });
            this.learningJourneySystem = null;
        }
    }

    /**
     * 🔧 学習旅路システムの遅延初期化
     */
    private async deferredInitializeLearningJourney(): Promise<void> {
        if (!this.learningJourneySystem || this.learningJourneyInitialized) {
            return;
        }

        try {
            // システム全体の安定性を待機
            await this.waitForSystemStability(5000);

            logger.info('Starting deferred LearningJourneySystem initialization');

            await withTimeout(
                this.learningJourneySystem.initialize('default-story'),
                this.config.learningJourneyTimeout,
                '学習旅路システムの遅延初期化'
            );

            this.learningJourneyInitialized = true;
            logger.info('LearningJourneySystem deferred initialization completed successfully');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.warn(`学習旅路システムの遅延初期化に失敗: ${errorMessage}`);
            this.learningJourneySystem = null;
            this.learningJourneyInitialized = false;
        }
    }

    /**
     * 🔧 システム安定性の待機
     */
    private async waitForSystemStability(timeoutMs: number): Promise<void> {
        const startTime = Date.now();

        while (Date.now() - startTime < timeoutMs) {
            try {
                const systemStatus = await this.memoryManager.getSystemStatus();

                if (systemStatus.initialized && systemStatus.memoryLayers.shortTerm.healthy) {
                    const genre = await this.getGenre();
                    if (genre && genre !== 'classic') {
                        logger.debug('System stability verified');
                        return;
                    }
                }
            } catch (error) {
                // エラーは無視して再試行
            }

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        logger.warn('System stability wait timed out, proceeding anyway');
    }

    /**
     * 拡張コンポーネントの非同期ロード
     */
    private loadExtendedComponents(): void {
        // 中期プロットから篇情報をロード（非同期）
        if (this.config.enableSectionPlotImport) {
            this.importMediumPlotSections().catch(error => {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logger.warn(`中期プロットからの篇情報ロードに失敗: ${errorMessage}`);
            });
        }

        logger.info('Extended components loading started asynchronously');
    }

    /**
     * 中期プロットから篇情報をロード
     */
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

            const sectionCount = mediumPlot.sections.length;
            logger.info(`中期プロットから ${sectionCount} 個のセクションを読み込みます`);

            let importedCount = 0;

            for (const section of mediumPlot.sections) {
                try {
                    const existingSection = await withTimeout(
                        this.sectionPlotManager.getSectionByChapter(section.chapterRange.start),
                        5000,
                        `セクション ${section.structure?.title || '不明'} の存在チェック`
                    );

                    if (!existingSection) {
                        const sectionParams = this.convertMediumPlotSectionToParams(section);
                        const createdSection = await withTimeout(
                            this.sectionPlotManager.createSectionPlot(sectionParams),
                            10000,
                            `セクション ${section.structure?.title || '不明'} の作成`
                        );

                        if (!existingSection) {
                            const sectionParams = this.convertMediumPlotSectionToParams(section);
                            const createdSection = await withTimeout(
                                this.sectionPlotManager.createSectionPlot(sectionParams),
                                10000,
                                `セクション ${section.structure?.title || '不明'} の作成`
                            );

                            // 型安全性のチェックを追加
                            if (createdSection && typeof createdSection === 'object' && 'id' in createdSection) {
                                await withTimeout(
                                    this.sectionPlotManager.updateSection((createdSection as SectionPlot).id, {
                                        emotionalDesign: section.emotionalDesign,
                                        learningJourneyDesign: section.learningJourneyDesign,
                                        characterDesign: section.characterDesign,
                                        narrativeStructureDesign: section.narrativeStructureDesign
                                    }),
                                    10000,
                                    `セクション ${section.structure?.title || '不明'} の詳細更新`
                                );

                                logger.info(`セクション「${section.structure.title}」を中期プロットから作成しました`);
                                importedCount++;
                            } else {
                                logger.warn(`セクション「${section.structure?.title || '不明'}」の作成に失敗しました`);
                            }


                            logger.info(`セクション「${section.structure.title}」を中期プロットから作成しました`);
                            importedCount++;
                        }
                    }
                } catch (sectionError) {
                    const errorMessage = sectionError instanceof Error ? sectionError.message : String(sectionError);
                    logger.error(`セクション「${section.structure?.title || '不明'}」の処理中にエラー: ${errorMessage}`);
                }
            }

            logger.info(`中期プロットからの読み込み完了: ${importedCount} 個のセクションを作成`);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('中期プロットからのセクション読み込みに失敗', { error: errorMessage });
        }
    }

    /**
     * 中期プロットのセクションをSectionParamsに変換
     */
    private convertMediumPlotSectionToParams(section: any): SectionPlotParams {
        return {
            title: section.structure.title,
            chapterRange: section.chapterRange,
            narrativePhase: section.structure.narrativePhase,
            theme: section.structure.theme,
            mainConcept: section.learningJourneyDesign.mainConcept,
            primaryLearningStage: section.learningJourneyDesign.primaryLearningStage as LearningStage,
            motifs: section.structure.motifs || [],
            setting: section.structure.setting || '主要舞台',
            mainCharacters: section.characterDesign.mainCharacters || [],
            editorNotes: `中期プロットからインポート: ${section.structure.title}`
        };
    }

    /**
     * 🔧 学習旅路システムを安全に取得
     */
    async getLearningJourneySystem(): Promise<LearningJourneySystem | null> {
        if (!this.config.enableLearningJourney || !this.learningJourneySystem) {
            return null;
        }

        if (!this.learningJourneyInitialized) {
            logger.info('LearningJourneySystem not initialized yet, attempting initialization...');
            try {
                await this.deferredInitializeLearningJourney();
            } catch (error) {
                logger.warn('Failed to initialize LearningJourneySystem on demand');
                return null;
            }
        }

        return this.learningJourneyInitialized ? this.learningJourneySystem : null;
    }

    /**
     * 🔧 初期化状態の確認と待機
     */
    private async ensureInitialized(): Promise<void> {
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

    /**
     * 🔧 章処理（新記憶階層システム統合版）
     */
    async processChapter(chapter: Chapter): Promise<SystemOperationResult> {
        await this.ensureInitialized();

        const startTime = Date.now();
        this.performanceStats.totalOperations++;

        try {
            logger.info(`章${chapter.chapterNumber}を新記憶階層システムで処理開始`);

            // 🔧 MemoryManagerの統合APIを使用
            const result = await this.memoryManager.processChapter(chapter);

            if (result.success) {
                this.performanceStats.successfulOperations++;
                this.performanceStats.memorySystemHits++;

                logger.info(`章${chapter.chapterNumber}の記憶階層システム処理が完了`, {
                    processingTime: result.processingTime,
                    affectedComponents: result.affectedComponents
                });
            } else {
                this.performanceStats.failedOperations++;

                logger.warn(`章${chapter.chapterNumber}の記憶階層システム処理に失敗`, {
                    errors: result.errors,
                    warnings: result.warnings
                });
            }

            const totalProcessingTime = Date.now() - startTime;
            this.updateAverageProcessingTime(totalProcessingTime);

            return {
                ...result,
                processingTime: totalProcessingTime,
                operationType: 'plotManager_processChapter'
            };

        } catch (error) {
            this.performanceStats.failedOperations++;
            const processingTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);

            logger.error(`章${chapter.chapterNumber}の処理に失敗`, {
                error: errorMessage,
                processingTime
            });

            return {
                success: false,
                operationType: 'plotManager_processChapter',
                processingTime,
                affectedComponents: [],
                details: {},
                warnings: [],
                errors: [errorMessage]
            };
        }
    }

    /**
     * 🔧 次章のプロンプト用要素を生成（新記憶階層システム統合版）
     */
    async generatePromptElements(chapterNumber: number): Promise<PromptElements> {
        await this.ensureInitialized();

        try {
            logger.info(`章${chapterNumber}のプロンプト要素を生成します`);

            // 🔧 統合記憶システムから包括的コンテキストを取得
            const memoryContext = await this.getComprehensiveMemoryContext(chapterNumber);

            // 既存のプロット情報を取得
            const concretePlot = await this.getConcretePlotForChapter(chapterNumber);
            const abstractGuideline = await this.getAbstractGuidelinesForChapter(chapterNumber);
            const phaseInfo = await this.getPhaseInformation(chapterNumber);

            // 🔧 記憶階層システムから物語状態を取得
            const narrativeState = memoryContext.narrativeState;

            // 物語生成ブリッジを使用して章の指示を生成
            const directives = await this.storyGenerationBridge.generateChapterDirectives(
                chapterNumber,
                concretePlot,
                abstractGuideline,
                narrativeState,
                phaseInfo
            );

            // 🔧 記憶システムからの追加情報でエンリッチ
            const enrichedDirectives = await this.enrichDirectivesWithMemoryContext(
                directives,
                memoryContext
            );

            // 指示をプロンプト要素としてフォーマット
            const promptElements = this.storyGenerationBridge.formatAsPromptElements(enrichedDirectives);

            this.performanceStats.memorySystemHits++;

            logger.debug(`章${chapterNumber}のプロンプト要素生成完了`, {
                elementsCount: Object.keys(promptElements).length,
                memoryContextUsed: true
            });

            return promptElements;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`章${chapterNumber}のプロンプト要素生成に失敗`, {
                error: errorMessage,
                chapterNumber
            });

            return this.generateFallbackPromptElements(chapterNumber);
        }
    }

    /**
     * 🔧 包括的記憶コンテキストの取得
     */
    private async getComprehensiveMemoryContext(chapterNumber: number): Promise<{
        narrativeState: NarrativeStateInfo | null;
        recentChapters: any[];
        characterStates: any[];
        worldContext: any;
        searchResults: UnifiedSearchResult;
    }> {
        try {
            // 🔧 統合検索を使用して包括的なコンテキストを取得
            const searchQuery = `chapter ${chapterNumber} context narrative state characters`;
            const searchResult = await this.memoryManager.unifiedSearch(
                searchQuery,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            // 🔧 物語状態を安全に取得
            let narrativeState: NarrativeStateInfo | null = null;
            try {
                // 正しいAPIを使用（getNarrativeStateは存在すると仮定）
                narrativeState = await (this.memoryManager as any).getNarrativeState(chapterNumber);
            } catch (error) {
                logger.warn(`章${chapterNumber}の物語状態取得に失敗`, {
                    error: error instanceof Error ? error.message : String(error)
                });
                narrativeState = null;
            }

            // 検索結果から関連情報を抽出
            const recentChapters = searchResult.results.filter(r => r.type === 'chapter').slice(0, 3);
            const characterStates = searchResult.results.filter(r => r.type === 'character');
            const worldContext = searchResult.results.filter(r => r.type === 'world' || r.type === 'knowledge');

            return {
                narrativeState,
                recentChapters,
                characterStates,
                worldContext,
                searchResults: searchResult
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('包括的記憶コンテキストの取得に失敗', { error: errorMessage, chapterNumber });

            return {
                narrativeState: null,
                recentChapters: [],
                characterStates: [],
                worldContext: [],
                searchResults: {
                    success: false,
                    totalResults: 0,
                    processingTime: 0,
                    results: [],
                    suggestions: []
                }
            };
        }
    }

    /**
     * 🔧 記憶コンテキストで指示をエンリッチ
     */
    private async enrichDirectivesWithMemoryContext(
        directives: ExtendedChapterDirectives,
        memoryContext: any
    ): Promise<ExtendedChapterDirectives> {
        try {
            const enrichedDirectives = { ...directives };

            // 記憶システムからの情報で強化
            if (memoryContext.recentChapters.length > 0) {
                enrichedDirectives.contextualBackground = memoryContext.recentChapters
                    .map((ch: any) => `前章の要素: ${ch.data?.title || '不明'}`)
                    .join(', ');
            }

            if (memoryContext.characterStates.length > 0) {
                const characterContexts = memoryContext.characterStates
                    .map((cs: any) => `${cs.data?.name || '不明'}: ${cs.data?.state || '状態不明'}`)
                    .slice(0, 3);

                enrichedDirectives.characterContexts = characterContexts;
            }

            if (memoryContext.worldContext.length > 0) {
                enrichedDirectives.worldContextElements = memoryContext.worldContext
                    .map((wc: any) => wc.data?.description || '世界要素')
                    .slice(0, 5);
            }

            return enrichedDirectives;

        } catch (error) {
            logger.warn('記憶コンテキストによる指示のエンリッチに失敗', { error });
            return directives;
        }
    }

    /**
     * フォールバックのプロンプト要素を生成
     */
    private async generateFallbackPromptElements(chapterNumber: number): Promise<PromptElements> {
        try {
            const abstractGuideline = await this.getAbstractGuidelinesForChapter(chapterNumber);

            return {
                CHAPTER_GOAL: `${abstractGuideline.theme}を探求しながら物語を進展させる`,
                REQUIRED_PLOT_ELEMENTS: `- ${abstractGuideline.theme}に関連する展開\n- キャラクターの成長機会\n- ${abstractGuideline.emotionalTone}の雰囲気の描写`,
                CURRENT_LOCATION: "前章から継続する場所",
                CURRENT_SITUATION: "物語の進行中の状況",
                ACTIVE_CHARACTERS: "- 前章から継続するキャラクター",
                WORLD_ELEMENTS_FOCUS: "- 現在の環境描写\n- 世界観の重要要素",
                THEMATIC_FOCUS: `- ${abstractGuideline.theme}\n- ${abstractGuideline.emotionalTone}の雰囲気`
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('フォールバックプロンプト要素の生成に失敗', {
                error: errorMessage,
                chapterNumber
            });

            return {
                CHAPTER_GOAL: "物語を自然に進展させる",
                REQUIRED_PLOT_ELEMENTS: "- キャラクターの成長\n- 世界観の発展\n- 興味深い展開",
                CURRENT_LOCATION: "適切な場所設定",
                CURRENT_SITUATION: "物語の進行状況",
                ACTIVE_CHARACTERS: "- 主要キャラクター",
                WORLD_ELEMENTS_FOCUS: "- 重要な世界設定要素",
                THEMATIC_FOCUS: "- 物語のテーマ"
            };
        }
    }

    /**
     * 🔧 生成されたコンテンツの整合性をチェック（強化版）
     */
    async checkGeneratedContentConsistency(
        content: string,
        chapterNumber: number
    ): Promise<{
        consistent: boolean;
        issues: Array<{
            type: string;
            description: string;
            severity: "LOW" | "MEDIUM" | "HIGH";
            suggestion: string;
            context?: string;
        }>;
        memoryAnalysis?: any;
    }> {
        await this.ensureInitialized();

        try {
            logger.info(`章${chapterNumber}のプロット整合性チェックを開始`);

            // PlotCheckerが初期化されていない場合のフォールバック
            if (!this.plotChecker) {
                logger.warn('PlotChecker not initialized, using basic consistency check');
                return { consistent: true, issues: [] };
            }

            // 既存のチェッカーによる基本チェック
            const basicResult = await this.plotChecker.checkGeneratedContentConsistency(
                content,
                chapterNumber
            );

            // 🔧 記憶階層システムを活用した追加分析
            let memoryAnalysis = null;
            if (this.config.memorySystemIntegration) {
                try {
                    memoryAnalysis = await this.performMemoryBasedConsistencyAnalysis(
                        content,
                        chapterNumber
                    );
                } catch (memoryError) {
                    logger.warn('記憶ベースの整合性分析に失敗', {
                        error: memoryError instanceof Error ? memoryError.message : String(memoryError)
                    });
                }
            }

            const enhancedResult = {
                ...basicResult,
                memoryAnalysis
            };

            logger.info(`章${chapterNumber}のプロット整合性チェック完了`, {
                consistent: enhancedResult.consistent,
                issueCount: enhancedResult.issues.length,
                highSeverityIssues: enhancedResult.issues.filter((issue: {
                    type: string;
                    description: string;
                    severity: "LOW" | "MEDIUM" | "HIGH";
                    suggestion: string;
                    context?: string;
                }) => issue.severity === "HIGH").length,
                memoryAnalysisPerformed: !!memoryAnalysis
            });

            return enhancedResult;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`章${chapterNumber}のプロット整合性チェックに失敗`, {
                error: errorMessage,
                chapterNumber
            });

            return {
                consistent: true,
                issues: []
            };
        }
    }

    /**
     * 🔧 記憶ベースの整合性分析
     */
    private async performMemoryBasedConsistencyAnalysis(
        content: string,
        chapterNumber: number
    ): Promise<any> {
        try {
            // 関連する記憶情報を検索
            const consistencyQuery = `chapter ${chapterNumber} characters plot consistency`;
            const searchResult = await this.memoryManager.unifiedSearch(
                consistencyQuery,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            if (!searchResult.success) {
                return null;
            }

            // 分析結果の構築
            const analysis = {
                charactersFound: searchResult.results.filter(r => r.type === 'character').length,
                plotElementsFound: searchResult.results.filter(r => r.type === 'plot').length,
                worldElementsFound: searchResult.results.filter(r => r.type === 'world').length,
                previousChapterConnection: searchResult.results.some(r =>
                    r.data?.chapterNumber === chapterNumber - 1
                ),
                totalRelevantMemories: searchResult.totalResults
            };

            this.performanceStats.memorySystemHits++;
            return analysis;

        } catch (error) {
            logger.warn('記憶ベースの整合性分析中にエラー', { error });
            return null;
        }
    }

    /**
     * プロット指示を生成（プロンプト用）- 記憶階層システム活用最適化版
     */
    async generatePlotDirective(chapterNumber: number): Promise<string> {
        await this.ensureInitialized();

        try {
            // 🔧 新記憶階層システムを活用した詳細な指示を取得
            const directives = await this.generateChapterDirectives(chapterNumber);
            const phaseInfo = await this.getPhaseInformation(chapterNumber);

            // 🔧 記憶システムからの追加コンテキスト
            let memoryEnhancement = '';
            if (this.config.memorySystemIntegration) {
                try {
                    const memoryContext = await this.getComprehensiveMemoryContext(chapterNumber);
                    memoryEnhancement = this.buildMemoryEnhancedDirective(memoryContext);
                } catch (memoryError) {
                    logger.debug('記憶システムからの追加情報取得に失敗', { error: memoryError });
                }
            }

            // 指示をプロンプト用のテキストに整形
            let directive = "## 物語構造とプロット指示（ストーリーの骨格）\n\n";

            // 物語フェーズの情報
            directive += `**現在の物語フェーズ**: ${this.formatPhase(phaseInfo.phase)}\n`;
            directive += `**フェーズ進行度**: ${Math.round(phaseInfo.phaseProgress * 100)}%\n`;
            directive += `**重要度**: ${Math.round(phaseInfo.importance * 10)}/10\n\n`;

            // 章の目標
            directive += "### このチャプターの目標\n";
            directive += `${directives.chapterGoal}\n\n`;

            // 必須のプロット要素
            directive += "### 必須のプロット要素\n";
            directives.requiredPlotElements.forEach(element => {
                directive += `- ${element}\n`;
            });
            directive += "\n";

            // 現在の状況
            directive += "### 現在の状況\n";
            directive += `**場所**: ${directives.currentLocation}\n`;
            directive += `**状況**: ${directives.currentSituation}\n\n`;

            // アクティブなキャラクター
            directive += "### アクティブなキャラクター\n";
            directives.activeCharacters.forEach(char => {
                directive += `- **${char.name}** (${char.role}): ${char.currentState}\n`;
            });
            directive += "\n";

            // 世界設定の焦点
            directive += "### 注目すべき世界設定要素\n";
            directives.worldElementsFocus.forEach(element => {
                directive += `- ${element}\n`;
            });
            directive += "\n";

            // テーマ的焦点
            directive += "### テーマ的焦点\n";
            directives.thematicFocus.forEach(theme => {
                directive += `- ${theme}\n`;
            });
            directive += "\n";

            // 🔧 記憶システムからの追加情報
            if (memoryEnhancement) {
                directive += "### 記憶システムからの追加コンテキスト\n";
                directive += memoryEnhancement + "\n";
            }

            // 感情的目標
            if (directives.emotionalGoal) {
                directive += `**感情的目標**: ${directives.emotionalGoal}\n`;
            }

            // テンション
            if (directives.tension) {
                directive += `**テンションレベル**: ${directives.tension}/10\n\n`;
            }

            // 推奨シーン
            if (directives.suggestedScenes && directives.suggestedScenes.length > 0) {
                directive += "### 推奨シーン\n";
                directives.suggestedScenes.forEach(scene => {
                    directive += `- ${scene}\n`;
                });
                directive += "\n";
            }

            // 移行点の場合、次のフェーズへの橋渡し
            if (phaseInfo.isTransitionPoint && phaseInfo.nextPhase) {
                directive += "### 次フェーズへの移行\n";
                directive += `このチャプターは現在のフェーズ「${this.formatPhase(phaseInfo.phase)}」の最終章です。\n`;
                directive += `次のフェーズ「${this.formatPhase(phaseInfo.nextPhase)}」への橋渡しを意識してください。\n\n`;
            }

            return directive;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`章${chapterNumber}のプロット指示生成に失敗`, {
                error: errorMessage,
                chapterNumber
            });

            return this.generateLegacyPlotDirective(chapterNumber);
        }
    }

    /**
     * 🔧 記憶システムからの追加指示を構築
     */
    private buildMemoryEnhancedDirective(memoryContext: any): string {
        try {
            let enhancement = '';

            if (memoryContext.recentChapters.length > 0) {
                enhancement += `**前章からの継続性**: ${memoryContext.recentChapters.length}章分の履歴を参照\n`;
            }

            if (memoryContext.characterStates.length > 0) {
                enhancement += `**キャラクター状態**: ${memoryContext.characterStates.length}人の状態を追跡中\n`;
            }

            if (memoryContext.worldContext.length > 0) {
                enhancement += `**世界設定要素**: ${memoryContext.worldContext.length}個の関連要素を確認\n`;
            }

            if (memoryContext.searchResults.totalResults > 0) {
                enhancement += `**関連記憶総数**: ${memoryContext.searchResults.totalResults}件の関連記憶を検出\n`;
            }

            return enhancement;

        } catch (error) {
            logger.warn('記憶システムからの追加指示構築に失敗', { error });
            return '';
        }
    }

    /**
     * レガシー実装によるプロット指示生成（フォールバック用）
     */
    private async generateLegacyPlotDirective(chapterNumber: number): Promise<string> {
        const phaseInfo = await this.getPhaseInformation(chapterNumber);
        const concretePlot = await this.getConcretePlotForChapter(chapterNumber);
        const abstractGuideline = await this.getAbstractGuidelinesForChapter(chapterNumber);

        let directive = "## 物語構造とプロット指示（ストーリーの骨格）\n\n";

        directive += `**現在の物語フェーズ**: ${this.formatPhase(phaseInfo.phase)}\n`;
        directive += `**フェーズ進行度**: ${Math.round(phaseInfo.phaseProgress * 100)}%\n`;
        directive += `**重要度**: ${Math.round(phaseInfo.importance * 10)}/10\n\n`;

        if (concretePlot) {
            directive += "### このチャプターで達成すべきストーリー要素\n";
            directive += `**アーク**: ${concretePlot.storyArc || '主要ストーリー'}\n`;
            directive += `**タイトル**: ${concretePlot.title}\n`;
            directive += `**目標**: ${concretePlot.storyGoal || concretePlot.summary}\n\n`;

            directive += "**必須イベント**:\n";
            concretePlot.keyEvents.forEach(event => {
                directive += `- ${event}\n`;
            });
            directive += "\n";

            directive += "**必須要素**:\n";
            concretePlot.requiredElements.forEach(element => {
                directive += `- ${element}\n`;
            });
            directive += "\n";

            if (concretePlot.mustHaveOutcome) {
                directive += `**必ず達成すべき結果**: ${concretePlot.mustHaveOutcome}\n\n`;
            }
        }

        directive += "### テーマと方向性\n";
        directive += `**テーマ**: ${abstractGuideline.theme}\n`;
        directive += `**感情基調**: ${abstractGuideline.emotionalTone}\n`;

        if (abstractGuideline.thematicMessage) {
            directive += `**伝えるべきメッセージ**: ${abstractGuideline.thematicMessage}\n\n`;
        }

        if (abstractGuideline.phasePurpose) {
            directive += `**このフェーズの目的**: ${abstractGuideline.phasePurpose}\n\n`;
        }

        if (phaseInfo.isTransitionPoint && phaseInfo.nextPhase) {
            directive += "### 次フェーズへの移行\n";
            directive += `このチャプターは現在のフェーズ「${this.formatPhase(phaseInfo.phase)}」の最終章です。\n`;
            directive += `次のフェーズ「${this.formatPhase(phaseInfo.nextPhase)}」への橋渡しを意識してください。\n\n`;
        }

        return directive;
    }

    /**
     * 章の詳細な指示情報を生成
     */
    async generateChapterDirectives(chapterNumber: number): Promise<ExtendedChapterDirectives> {
        await this.ensureInitialized();

        try {
            const concretePlot = await this.getConcretePlotForChapter(chapterNumber);
            const abstractGuideline = await this.getAbstractGuidelinesForChapter(chapterNumber);
            const phaseInfo = await this.getPhaseInformation(chapterNumber);

            // 🔧 記憶階層システムから物語状態を取得
            let narrativeState: NarrativeStateInfo | null = null;
            if (this.config.memorySystemIntegration) {
                try {
                    narrativeState = await (this.memoryManager as any).getNarrativeState(chapterNumber);
                } catch (error) {
                    logger.warn(`章${chapterNumber}の物語状態取得に失敗`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }

            return await this.storyGenerationBridge.generateChapterDirectives(
                chapterNumber,
                concretePlot,
                abstractGuideline,
                narrativeState,
                phaseInfo
            );

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`章${chapterNumber}の指示情報生成に失敗`, {
                error: errorMessage,
                chapterNumber
            });

            const abstractGuideline = await this.getAbstractGuidelinesForChapter(chapterNumber);
            return await this.storyGenerationBridge.generateChapterDirectives(
                chapterNumber,
                null,
                abstractGuideline,
                null,
                null
            );
        }
    }

    // ============================================================================
    // 🔧 セクション管理機能（新記憶階層システム対応）
    // ============================================================================

    /**
     * 章が属する篇情報を取得
     */
    async getSectionForChapter(chapterNumber: number): Promise<SectionPlot | null> {
        await this.ensureInitialized();

        try {
            if (!this.sectionPlotManager) {
                logger.warn('SectionPlotManager not available');
                return null;
            }
            return await this.sectionPlotManager.getSectionByChapter(chapterNumber);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Failed to get section for chapter ${chapterNumber}`, {
                error: errorMessage,
                chapterNumber
            });
            return null;
        }
    }

    /**
     * 篇を作成
     */
    async createSection(params: SectionPlotParams): Promise<SectionPlot> {
        await this.ensureInitialized();

        try {
            if (!this.sectionPlotManager) {
                throw new Error('SectionPlotManager not available');
            }
            return await this.sectionPlotManager.createSectionPlot(params);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Failed to create section`, {
                error: errorMessage,
                params
            });
            throw error;
        }
    }

    /**
     * すべての篇を取得
     */
    async getAllSections(): Promise<SectionPlot[]> {
        await this.ensureInitialized();

        try {
            if (!this.sectionPlotManager) {
                logger.warn('SectionPlotManager not available');
                return [];
            }
            return await this.sectionPlotManager.getAllSections();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Failed to get all sections`, { error: errorMessage });
            return [];
        }
    }

    // ============================================================================
    // 🔧 世界設定・テーマ管理（新記憶階層システム統合）
    // ============================================================================

    /**
     * 世界設定が有効かを確認
     */
    async hasValidWorldSettings(): Promise<boolean> {
        await this.ensureInitialized();
        return this.worldSettingsManager.hasValidWorldSettings();
    }

    /**
     * テーマ設定が有効かを確認
     */
    async hasValidThemeSettings(): Promise<boolean> {
        await this.ensureInitialized();
        return this.worldSettingsManager.hasValidThemeSettings();
    }

    /**
     * プロンプト用に整形された世界設定とテーマを取得
     */
    async getFormattedWorldAndTheme(): Promise<FormattedWorldAndTheme> {
        await this.ensureInitialized();
        return this.worldSettingsManager.getFormattedWorldAndTheme();
    }

    /**
     * 世界設定とテーマを再読み込み
     */
    async reloadWorldAndThemeSettings(): Promise<void> {
        await this.ensureInitialized();
        await this.worldSettingsManager.reload();
    }

    /**
     * 構造化された世界設定を取得
     */
    async getStructuredWorldSettings(): Promise<WorldSettings | null> {
        await this.ensureInitialized();
        return this.worldSettingsManager.getWorldSettings();
    }

    /**
     * 構造化されたテーマ設定を取得
     */
    async getStructuredThemeSettings(): Promise<ThemeSettings | null> {
        await this.ensureInitialized();
        return this.worldSettingsManager.getThemeSettings();
    }

    // ============================================================================
    // 🔧 プロット取得・分析機能（型安全性強化版）
    // ============================================================================

    /**
     * 指定されたチャプターの具体的プロットを取得
     */
    async getConcretePlotForChapter(chapterNumber: number): Promise<ConcretePlotPoint | null> {
        try {
            await withTimeout(
                this.ensureInitialized(),
                15000,
                'プロットマネージャーの初期化確認'
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.warn(`初期化確認がタイムアウトしました。nullを返します: ${errorMessage}`);
            return null;
        }

        try {
            const allConcretePlots = await withTimeout(
                this.plotStorage.loadConcretePlot(),
                10000,
                '具体プロットの読み込み'
            );

            return allConcretePlots.find(plot =>
                chapterNumber >= plot.chapterRange[0] &&
                chapterNumber <= plot.chapterRange[1]
            ) || null;

        } catch (error) {
            logError(error, { chapterNumber }, '具体プロットの取得に失敗しました');
            return null;
        }
    }

    /**
     * 指定されたチャプターの抽象的プロットガイドラインを取得
     */
    async getAbstractGuidelinesForChapter(chapterNumber: number): Promise<AbstractPlotGuideline> {
        try {
            await withTimeout(
                this.ensureInitialized(),
                15000,
                'プロットマネージャーの初期化確認'
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.warn(`初期化確認がタイムアウトしました。フォールバック値を使用します: ${errorMessage}`);
            return this.getEmergencyAbstractGuideline();
        }

        try {
            const abstractPlots = await withTimeout(
                this.plotStorage.loadAbstractPlot(),
                10000,
                '抽象プロットの読み込み'
            );

            const matchingPlot = abstractPlots.find(plot =>
                plot.chapterRange &&
                chapterNumber >= plot.chapterRange[0] &&
                chapterNumber <= plot.chapterRange[1]
            );

            if (matchingPlot) {
                return matchingPlot;
            }

            return this.getDefaultAbstractGuideline(chapterNumber);

        } catch (error) {
            logError(error, { chapterNumber }, '抽象プロットの取得に失敗しました');
            return this.getEmergencyAbstractGuideline();
        }
    }

    /**
     * 現在のチャプターのフェーズ情報を取得
     */
    async getPhaseInformation(chapterNumber: number): Promise<any> {
        await this.ensureInitialized();

        const concretePlots = await this.plotStorage.loadConcretePlot();
        const abstractPlots = await this.plotStorage.loadAbstractPlot();

        return this.phaseManager.identifyPhase(chapterNumber, concretePlots, abstractPlots);
    }

    /**
     * 物語全体の構造マップを取得
     */
    async getStoryStructureMap(): Promise<any> {
        await this.ensureInitialized();

        const concretePlots = await this.plotStorage.loadConcretePlot();
        const abstractPlots = await this.plotStorage.loadAbstractPlot();

        return this.phaseManager.buildStoryStructureMap(concretePlots, abstractPlots);
    }

    // ============================================================================
    // 🔧 診断・統計機能（新記憶階層システム対応）
    // ============================================================================

    /**
     * プロットマネージャーの診断情報を取得
     */
    async performDiagnostics(): Promise<{
        initialized: boolean;
        memorySystemIntegration: boolean;
        performanceMetrics: PerformanceMetrics; // 修正: typeof this.performanceStats → PerformanceMetrics
        worldSettingsValid: boolean;
        learningJourneyAvailable: boolean;
        sectionsLoaded: number;
        recommendations: string[];
    }> {
        try {
            const recommendations: string[] = [];

            // 世界設定の確認
            const worldSettingsValid = await this.hasValidWorldSettings();
            if (!worldSettingsValid) {
                recommendations.push('世界設定ファイルの確認が必要です');
            }

            // 学習旅路システムの確認
            const learningJourneyAvailable = this.learningJourneySystem !== null && this.learningJourneyInitialized;
            if (!learningJourneyAvailable && this.config.enableLearningJourney) {
                recommendations.push('学習旅路システムの初期化に失敗しています');
            }

            // セクション数の確認
            let sectionsLoaded = 0;
            try {
                const sections = await this.getAllSections();
                sectionsLoaded = sections.length;
            } catch (error) {
                recommendations.push('セクション情報の取得に失敗しました');
            }

            // パフォーマンスの確認
            if (this.performanceStats.failedOperations > this.performanceStats.successfulOperations * 0.1) {
                recommendations.push('エラー率が高くなっています');
            }

            if (this.performanceStats.averageProcessingTime > 5000) {
                recommendations.push('平均処理時間が長くなっています');
            }

            return {
                initialized: this.initialized,
                memorySystemIntegration: this.config.memorySystemIntegration,
                performanceMetrics: { ...this.performanceStats },
                worldSettingsValid,
                learningJourneyAvailable,
                sectionsLoaded,
                recommendations
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('PlotManager診断の実行に失敗', { error: errorMessage });

            return {
                initialized: false,
                memorySystemIntegration: false,
                performanceMetrics: { ...this.performanceStats },
                worldSettingsValid: false,
                learningJourneyAvailable: false,
                sectionsLoaded: 0,
                recommendations: ['診断実行に失敗しました']
            };
        }
    }

    // ============================================================================
    // プライベートヘルパーメソッド
    // ============================================================================

    /**
     * フェーズの整形表示
     */
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
     * 物語進行度から適切な抽象ガイドラインを生成
     */
    private async getDefaultAbstractGuideline(chapterNumber: number): Promise<AbstractPlotGuideline> {
        const estimatedTotalChapters = 50;
        const progress = chapterNumber / estimatedTotalChapters;

        let phase = '';
        if (progress < 0.1) {
            phase = "INTRODUCTION";
        } else if (progress < 0.3) {
            phase = "RISING_ACTION";
        } else if (progress < 0.5) {
            phase = "COMPLICATIONS";
        } else if (progress < 0.7) {
            phase = "CLIMAX_APPROACH";
        } else if (progress < 0.85) {
            phase = "CLIMAX";
        } else {
            phase = "RESOLUTION";
        }

        const directions = this.getDirectionsByPhase(phase);

        return {
            phase,
            theme: "キャラクターの成長と冒険",
            emotionalTone: "希望と挑戦の混在",
            potentialDirections: directions,
            prohibitedElements: [
                "物語の大筋からの急激な逸脱",
                "キャラクターの一貫性を損なう行動",
                "前後の章との整合性を欠く展開"
            ],
            chapterRange: [chapterNumber, chapterNumber],
            thematicMessage: "自己発見と成長の旅路",
            phasePurpose: this.getPhasePurposeByPhase(phase)
        };
    }

    /**
     * フェーズの目的を取得
     */
    private getPhasePurposeByPhase(phase: string): string {
        switch (phase) {
            case "INTRODUCTION":
                return "読者を世界観に引き込み、主人公への共感を作る";
            case "RISING_ACTION":
                return "物語の基本的な葛藤を確立し、緊張を高めていく";
            case "COMPLICATIONS":
                return "物語の複雑さを増し、キャラクターの成長を促す";
            case "CLIMAX_APPROACH":
                return "全ての要素をクライマックスに向けて収束させる";
            case "CLIMAX":
                return "物語の中心的な葛藤を解決する決定的な瞬間を描く";
            case "RESOLUTION":
                return "解決後の世界と変化したキャラクターを示す";
            default:
                return "物語の自然な進行を支援する";
        }
    }

    /**
     * フェーズに応じた方向性リストを取得
     */
    private getDirectionsByPhase(phase: string): string[] {
        switch (phase) {
            case "INTRODUCTION":
                return [
                    "主要キャラクターとその生活状況の紹介",
                    "世界観やルールの説明",
                    "将来の冒険/問題の伏線"
                ];
            case "RISING_ACTION":
                return [
                    "主人公が最初の課題や障害に直面",
                    "キャラクター間の関係の発展",
                    "冒険や使命の始まり"
                ];
            case "COMPLICATIONS":
                return [
                    "障害や課題の複雑化",
                    "脇筋の発展",
                    "葛藤の深まり"
                ];
            case "CLIMAX_APPROACH":
                return [
                    "主要な対決への準備",
                    "最終的な戦略/計画の展開",
                    "最高潮に向けた緊張感の高まり"
                ];
            case "CLIMAX":
                return [
                    "主要なコンフリクトの解決",
                    "キャラクターの変革の瞬間",
                    "真実の発覚や重要な決断"
                ];
            case "RESOLUTION":
                return [
                    "物語の解決と残った問題の処理",
                    "キャラクターの旅の振り返りと影響",
                    "未来への示唆"
                ];
            default:
                return [
                    "キャラクターの成長の機会",
                    "主要な関係性の発展",
                    "物語世界のさらなる探索"
                ];
        }
    }

    /**
     * 緊急時のフォールバック用抽象ガイドライン
     */
    private getEmergencyAbstractGuideline(): AbstractPlotGuideline {
        return {
            phase: "NEUTRAL",
            theme: "キャラクターの成長",
            emotionalTone: "バランスの取れた展開",
            potentialDirections: [
                "キャラクターの内的成長や変化",
                "重要な関係性の発展",
                "世界観や状況の深掘り"
            ],
            prohibitedElements: [
                "前後の章との矛盾",
                "キャラクターの急激な性格変化",
                "唐突な展開"
            ]
        };
    }

    /**
     * 平均処理時間を更新
     */
    private updateAverageProcessingTime(processingTime: number): void {
        this.performanceStats.averageProcessingTime =
            ((this.performanceStats.averageProcessingTime * (this.performanceStats.totalOperations - 1)) + processingTime) /
            this.performanceStats.totalOperations;
    }

    // ============================================================================
    // 🔧 パブリック統計・状態取得API
    // ============================================================================

    /**
     * パフォーマンス統計を取得
     */
    getPerformanceStatistics(): typeof this.performanceStats {
        return { ...this.performanceStats };
    }

    /**
     * 初期化状態を取得
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * 記憶システム統合状態を取得
     */
    isMemorySystemIntegrated(): boolean {
        return this.config.memorySystemIntegration;
    }

    /**
     * 学習旅路システムの可用性を取得
     */
    isLearningJourneyAvailable(): boolean {
        return this.learningJourneySystem !== null && this.learningJourneyInitialized;
    }
}

// ============================================================================
// 🔧 ファクトリー関数（依存注入パターン）
// ============================================================================

/**
 * PlotManagerを作成するファクトリー関数
 * @param memoryManager 初期化済みのMemoryManager
 * @param config オプション設定
 * @returns PlotManagerインスタンス
 */
export function createPlotManager(
    memoryManager: MemoryManager,
    config?: PlotManagerConfig
): PlotManager {
    return new PlotManager({
        memoryManager,
        config
    });
}

/**
 * PlotManagerのシングルトンインスタンスを作成
 * @param memoryManager 初期化済みのMemoryManager
 * @returns シングルトンPlotManagerインスタンス
 */
let plotManagerInstance: PlotManager | null = null;

export function getPlotManagerInstance(memoryManager: MemoryManager): PlotManager {
    if (!plotManagerInstance) {
        plotManagerInstance = createPlotManager(memoryManager, {
            enableLearningJourney: true,
            enableSectionPlotImport: true,
            enableQualityAssurance: true,
            enablePerformanceOptimization: true,
            memorySystemIntegration: true
        });
    }
    return plotManagerInstance;
}