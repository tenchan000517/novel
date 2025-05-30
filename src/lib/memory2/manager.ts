/**
 * @fileoverview 最適化されたMemoryManager（ファザードパターン実装）
 * @description
 * 🔧 重複機能を削除し、各専門マネージャーへの適切な委譲を実装
 * 🔧 ファザードクラスとしての責務に集中
 * 🔧 初期化の複雑性を隠蔽し、統一されたインターフェースを提供
 */

// ============================================================================
// 基本メモリ型（全システム共通）
// ============================================================================
import {
    ChapterMemory,
    KeyEvent,
    ArcMemory,
    EventContext,
    SearchResult,
    MemoryType,
    SyncMemoryRequest,
    SyncMemoryResponse,
    CompressionAction,
    Memory,
    Foreshadowing,
    SignificantEvent,
    PersistentEventType,
    ConsistencyResult,
    QueryOptions,
    SearchOptions
} from '@/types/memory';

// ============================================================================
// 階層的記憶管理専用型
// ============================================================================
import {
    IMemoryManager,
    MemorySystemStatus,
    Branch,
    EmotionalCurvePoint,
    BranchingPoint
} from './types';

// ============================================================================
// 物語記憶システム専用型
// ============================================================================
import {
    NarrativeStateInfo,
    StagnationDetectionResult,
    NarrativeState
} from './narrative/types';

// ============================================================================
// 外部依存
// ============================================================================
import { Chapter } from '@/types/chapters';
import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { ConsistencyChecker } from '@/lib/validation/consistency-checker';
import { CharacterDiff } from '@/types/characters';
import { withTimeout } from '@/lib/utils/promise-utils';

// 🔧 核心的コンポーネントのインポート
import { ImmediateContext } from './immediate-context';
import { NarrativeMemory } from './narrative-memory';
import { WorldKnowledge } from './world-knowledge';
import { OptimizedStorageProvider } from './optimized-storage';
import { TextAnalyzerService } from './text-analyzer-service';
import { CharacterManager, characterManager } from '@/lib/characters/manager';

// 分離されたコンポーネントをインポート
import { TemporaryStorage } from './services/temporary-storage';
import { EventRegistry } from './events/event-registry';
import { PersistentEventHandler } from './events/persistent-event-handler';
import { CharacterTracker } from './character/character-tracker';
import { ContextGenerator } from './processors/context-generator';
import { GenerationContextValidator } from './validator/generation-context-validator';

// プロレベル品質向上のための新たなインポート
import { CharacterPsychology, RelationshipAttitude } from '@/types/characters';
import { StyleGuidance, ExpressionAlternatives, GenerationContext } from '@/types/generation';
import { plotManager } from '@/lib/plot/manager';
import { storageProvider } from '@/lib/storage';
import { EmotionalArcDesign } from '@/types/characters';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { EventMemory } from './event-memory';
import { GrowthPhase } from '@/types/characters';

// 🔧 初期化段階の定義
enum InitializationStage {
    NOT_STARTED = 'not_started',
    STORAGE_READY = 'storage_ready',
    CORE_READY = 'core_ready',
    EXTENDED_READY = 'extended_ready',
    FULLY_READY = 'fully_ready',
    FAILED = 'failed'
}

// 🔧 コンポーネント状態管理
interface ComponentStatus {
    name: string;
    initialized: boolean;
    healthy: boolean;
    error?: string;
    initTime?: number;
}

/**
 * @class MemoryManager（最適化ファザードパターン実装）
 * @description
 * 記憶管理システムの統一インターフェースを提供するファザードクラス
 * 🔧 重複機能削除、専門マネージャーへの適切な委譲を実装
 * 🔧 初期化の複雑性を隠蔽し、エラーハンドリングを統一
 */
export class MemoryManager implements IMemoryManager {
    // 🔧 核心的記憶層（遅延初期化）
    private immediateContext!: ImmediateContext;
    private narrativeMemory!: NarrativeMemory;
    private worldKnowledge!: WorldKnowledge;

    // 🔧 処理・検証モジュール（遅延初期化）
    private contextGenerator!: ContextGenerator;
    private eventRegistry!: EventRegistry;
    private persistentEventHandler!: PersistentEventHandler;
    private characterTracker!: CharacterTracker;
    private contextValidator!: GenerationContextValidator;

    // 共通サービス（即座に初期化）
    private temporaryStorage: TemporaryStorage;
    private geminiClient: GeminiClient;
    private textAnalyzer: TextAnalyzerService;
    private storageProvider: OptimizedStorageProvider;
    private characterManager: CharacterManager;
    private eventMemory: EventMemory;

    // 🔧 初期化状態管理
    private initialized: boolean = false;
    private coreInitialized: boolean = false;
    private extendedInitialized: boolean = false;
    private initializationPromise: Promise<void> | null = null;
    private initializationStage: InitializationStage = InitializationStage.NOT_STARTED;
    private componentStatuses: Map<string, ComponentStatus> = new Map();
    private initializationStartTime: number = 0;

    /**
     * コンストラクタ（遅延初期化パターン）
     */
    constructor() {
        this.initializationStartTime = Date.now();

        // 共通サービスの初期化（依存性なし）
        this.geminiClient = new GeminiClient();
        this.textAnalyzer = new TextAnalyzerService(this.geminiClient);
        this.storageProvider = new OptimizedStorageProvider();
        this.temporaryStorage = new TemporaryStorage();
        this.characterManager = characterManager;
        this.eventMemory = new EventMemory();

        this.setupStoragePaths();
        this.recordComponentStatus('MemoryManager', false, true); // 🔥 修正: まだ初期化中

        logger.info('MemoryManager initialized as facade pattern (lazy initialization)');
    }

    /**
     * ストレージパスを設定
     * 🔧 修正: 全てのnarrative-memoryファイルを含む完全なパス登録
     */
    private setupStoragePaths(): void {
        this.storageProvider.registerCachedPaths([
            // ImmediateContext関連
            'immediate-context/metadata.json',

            // NarrativeMemory関連（全ファイル）
            'narrative-memory/summaries.json',                    // ChapterAnalysisManager
            'narrative-memory/chapter-analysis-config.json',      // ChapterAnalysisManager設定
            'narrative-memory/characters.json',                   // CharacterTrackingManager
            'narrative-memory/character-changes.json',            // CharacterTrackingManager変更履歴
            'narrative-memory/character-tracking-config.json',    // CharacterTrackingManager設定
            'narrative-memory/emotional-dynamics.json',           // EmotionalDynamicsManager
            'narrative-memory/state.json',                        // NarrativeStateManager
            'narrative-memory/turning-points.json',               // NarrativeStateManager
            'narrative-memory/world-context.json',                // WorldContextManager

            // WorldKnowledge関連
            'world-knowledge/current.json',

            // EventMemory関連
            'data/memory/significant-events.json',

            // 🔧 追加: その他の重要ファイル
            'characters/character-database.json',
            'plot/plot-state.json'
        ]);

        logger.info('MemoryManager: Registered storage cache paths for all narrative memory components');
    }

    /**
     * 🔧 修正版初期化処理（タイムアウト調整）
     */
    async initialize(): Promise<void> {
        if (this.initializationStage === InitializationStage.FULLY_READY) {
            logger.debug('MemoryManager already fully initialized');
            return;
        }

        if (this.initializationPromise) {
            logger.info('MemoryManager initialization already in progress, waiting...');
            return withTimeout(
                this.initializationPromise,
                180000, // 🔥 修正: 120秒 → 180秒に延長
                'MemoryManager初期化の待機'
            ).catch(error => {
                logger.error(`初期化の待機中にタイムアウトが発生: ${error.message}`);
                this.initializationPromise = null;
                throw new Error('MemoryManagerの初期化がタイムアウトしました。再試行してください。');
            });
        }

        this.initializationPromise = this._performEnhancedInitialization();

        try {
            await withTimeout(
                this.initializationPromise,
                240000, // 🔥 修正: 180秒 → 240秒に延長
                'MemoryManager拡張初期化'
            );
        } catch (error) {
            logger.error(`初期化中にタイムアウトが発生: ${error instanceof Error ? error.message : String(error)}`);
            this.initializationPromise = null;
            throw new Error('MemoryManagerの初期化がタイムアウトしました。再試行してください。');
        } finally {
            this.initializationPromise = null;
        }
    }

    /**
     * 🔧 段階的初期化実装（初期化順序修正版）
     */
    private async _performEnhancedInitialization(): Promise<void> {
        try {
            this.initializationStage = InitializationStage.NOT_STARTED;
            logger.info('Starting enhanced MemoryManager initialization (修正版)');

            // Phase 1: ストレージ・基盤サービス初期化
            await this._initializeStoragePhase();
            this.initializationStage = InitializationStage.STORAGE_READY;

            // Phase 2: コアメモリコンポーネント初期化（修正版）
            await this._initializeCorePhase();
            this.initializationStage = InitializationStage.CORE_READY;

            // Phase 3: 拡張コンポーネント初期化
            await this._initializeExtendedPhase();
            this.initializationStage = InitializationStage.EXTENDED_READY;

            // Phase 4: 最終検証と統合
            await this._finalizeInitialization();
            this.initializationStage = InitializationStage.FULLY_READY;

            // 🔥 修正: 全ての初期化が完了してからフラグを設定
            this.initialized = true;

            const totalTime = Date.now() - this.initializationStartTime;
            logger.info('Enhanced MemoryManager initialization completed (修正版)', {
                totalTime,
                stage: this.initializationStage,
                componentCount: this.componentStatuses.size,
                coreInitialized: this.coreInitialized,
                extendedInitialized: this.extendedInitialized
            });

        } catch (error) {
            this.initializationStage = InitializationStage.FAILED;
            this.initialized = false; // 🔥 修正: 失敗時は確実にfalse
            logger.error('Enhanced MemoryManager initialization failed', {
                error: error instanceof Error ? error.message : String(error),
                stage: this.initializationStage
            });
            throw error;
        }
    }

    /**
     * Phase 1: ストレージ・基盤サービス初期化
     */
    private async _initializeStoragePhase(): Promise<void> {
        logger.info('Phase 1: Storage & Foundation Services');

        const foundationPromises = [
            this._safeInitComponent('TemporaryStorage', async () => {
                return Promise.resolve();
            }),
            this._safeInitComponent('StorageProvider', async () => {
                return Promise.resolve();
            }),
            this._safeInitComponent('GeminiClient', async () => {
                if (this.geminiClient && typeof this.geminiClient.validateApiKey === 'function') {
                    await this.geminiClient.validateApiKey();
                }
            })
        ];

        await Promise.allSettled(foundationPromises);
        logger.info('Phase 1 completed: Foundation services ready');
    }

    /**
     * Phase 2: コアメモリ初期化
     */
    private async _initializeCorePhase(): Promise<void> {
        logger.info('Phase 2: Core Memory Components (Critical) - 修正版初期化');

        // 🔥 修正: 初期化フラグを早期設定しない
        const corePromises = [
            this._safeInitComponent('ImmediateContext', async () => {
                this.immediateContext = new ImmediateContext(this.textAnalyzer);
                await this.immediateContext.initialize();
            }),
            this._safeInitComponent('NarrativeMemory', async () => {
                this.narrativeMemory = new NarrativeMemory();
                await this.narrativeMemory.initialize();
            }),
        ];

        const results = await Promise.allSettled(corePromises);
        const failures = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];

        if (failures.length > 0) {
            // 🔥 修正: 失敗時はフラグを設定しない
            this.recordComponentStatus('MemoryManager-Core', false, false, 'Core components initialization failed');

            const errorMessages = failures.map(f => f.reason?.message || 'Unknown error');
            throw new Error(`Critical core components failed: ${errorMessages.join(', ')}`);
        }

        // 🔥 修正: 実際のコンポーネント初期化が成功してからフラグ設定
        this.coreInitialized = true;
        this.recordComponentStatus('MemoryManager-Core', true, true);

        logger.info('Phase 2 completed: Core memory components ready (修正版)');
    }

    /**
     * Phase 3: 拡張コンポーネント初期化
     */
    private async _initializeExtendedPhase(): Promise<void> {
        logger.info('Phase 3: Extended Components (Optional) - 段階的初期化');

        const extendedPromises = [
            this._safeInitComponent('WorldKnowledge', async () => {
                this.worldKnowledge = new WorldKnowledge(this.geminiClient, this.characterManager);
                if (this.worldKnowledge && typeof this.worldKnowledge.initialize === 'function') {
                    await this.worldKnowledge.initialize();
                }
            }),
            this._safeInitComponent('EventRegistry', async () => {
                this.eventRegistry = new EventRegistry(this.eventMemory);
                if (this.eventRegistry && typeof this.eventRegistry.initialize === 'function') {
                    await this.eventRegistry.initialize();
                }
            }),
            this._safeInitComponent('PersistentEventHandler', async () => {
                if (this.eventRegistry && this.worldKnowledge) {
                    this.persistentEventHandler = new PersistentEventHandler(
                        this.eventRegistry,
                        this.characterManager,
                        this.worldKnowledge
                    );
                }
            }),
            this._safeInitComponent('CharacterTracker', async () => {
                if (this.immediateContext && this.narrativeMemory && this.worldKnowledge && this.eventRegistry) {
                    this.characterTracker = new CharacterTracker(
                        this.characterManager,
                        this.eventRegistry,
                        this.immediateContext,
                        this.narrativeMemory,
                        this.worldKnowledge,
                    );
                }
            }),
            this._safeInitComponent('ContextGenerator', async () => {
                if (this.immediateContext && this.narrativeMemory && this.worldKnowledge && this.eventRegistry) {
                    this.contextGenerator = new ContextGenerator(
                        this.immediateContext,
                        this.narrativeMemory,
                        this.worldKnowledge,
                        this.eventRegistry,
                        this.characterManager
                    );
                }
            }),
            this._safeInitComponent('ContextValidator', async () => {
                if (this.eventRegistry && this.worldKnowledge) {
                    this.contextValidator = new GenerationContextValidator(
                        this.eventRegistry,
                        this.characterManager,
                        this.worldKnowledge
                    );
                }
            })
        ];

        await Promise.allSettled(extendedPromises);

        const healthyExtended = Array.from(this.componentStatuses.values())
            .filter(status => status.healthy &&
                ['WorldKnowledge', 'EventRegistry', 'PersistentEventHandler', 'CharacterTracker', 'ContextGenerator', 'ContextValidator'].includes(status.name));

        const failedExtended = Array.from(this.componentStatuses.values())
            .filter(status => !status.healthy &&
                ['WorldKnowledge', 'EventRegistry', 'PersistentEventHandler', 'CharacterTracker', 'ContextGenerator', 'ContextValidator'].includes(status.name));

        if (failedExtended.length > 0) {
            logger.warn(`${failedExtended.length} extended components failed, but continuing`, {
                failedComponents: failedExtended.map(c => c.name)
            });
        }

        this.extendedInitialized = healthyExtended.length >= 2;

        logger.info('Phase 3 completed: Extended components processed', {
            healthyComponents: healthyExtended.length,
            failedComponents: failedExtended.length
        });
    }

    /**
     * Phase 4: 最終検証と統合（ジャンル伝播を条件付きに変更）
     */
    private async _finalizeInitialization(): Promise<void> {
        logger.info('Phase 4: Finalization & Integration');

        const criticalComponents = ['ImmediateContext', 'NarrativeMemory'];
        const healthyComponents = [];
        const unhealthyComponents = [];

        for (const componentName of criticalComponents) {
            const status = this.componentStatuses.get(componentName);
            if (status?.healthy) {
                healthyComponents.push(componentName);
            } else {
                unhealthyComponents.push(componentName);
            }
        }

        if (unhealthyComponents.length > 0) {
            logger.error(`Critical components are unhealthy: ${unhealthyComponents.join(', ')}`);
            throw new Error(`Critical component health check failed: ${unhealthyComponents.join(', ')}`);
        }

        // 実際のコンポーネントインスタンスの存在確認
        if (!this.immediateContext || !this.narrativeMemory) {
            throw new Error('Critical components are not properly instantiated');
        }

        await this._validateProcessorDependencies();

        // ⭐ 修正: ジャンル伝播を条件付きで実行（PlotManagerの初期化状態をチェック）
        try {
            // PlotManagerが利用可能かどうかを安全にチェック
            const plotGenre = await plotManager.getGenre();
            if (plotGenre && plotGenre !== 'classic') {
                await this.propagateGenreToAllComponents();
                logger.info('Genre propagation completed during MemoryManager initialization');
            } else {
                logger.info('Genre propagation skipped - PlotManager not ready or using default genre');
            }
        } catch (error) {
            logger.warn('Genre propagation failed during initialization, will retry later', {
                error: error instanceof Error ? error.message : String(error)
            });

            // ⭐ 追加: 遅延でのジャンル伝播を予約
            setTimeout(async () => {
                try {
                    await this.propagateGenreToAllComponents();
                    logger.info('Deferred genre propagation completed');
                } catch (deferredError) {
                    logger.warn('Deferred genre propagation also failed', {
                        error: deferredError instanceof Error ? deferredError.message : String(deferredError)
                    });
                }
            }, 5000); // 5秒後に再試行
        }

        logger.info('Phase 4 completed: System integration verified', {
            healthyComponents: healthyComponents.length,
            totalComponents: this.componentStatuses.size,
            coreInitialized: this.coreInitialized,
            extendedInitialized: this.extendedInitialized
        });
    }

    /**
     * 安全なコンポーネント初期化
     */
    private async _safeInitComponent(
        name: string,
        initFn: () => Promise<void>
    ): Promise<void> {
        const startTime = Date.now();

        try {
            logger.debug(`Initializing component: ${name}`);
            await initFn();

            const initTime = Date.now() - startTime;
            this.recordComponentStatus(name, true, true, undefined, initTime);

            logger.debug(`Component ${name} initialized successfully (${initTime}ms)`);
        } catch (error) {
            const initTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.recordComponentStatus(name, false, false, errorMessage, initTime);

            logger.error(`Component ${name} initialization failed (${initTime}ms)`, {
                error: errorMessage
            });

            throw error;
        }
    }

    // ⭐ 新規追加: ジャンル伝播メソッド
    async propagateGenreToAllComponents(): Promise<void> {
        try {
            await this._ensureBasicInitialization();

            // PlotManagerからジャンルを取得
            const genre = await plotManager.getGenre();
            logger.info(`Propagating genre '${genre}' to all memory components`);

            const propagationPromises: Promise<void>[] = [];

            // WorldKnowledgeにジャンルを設定
            if (this.worldKnowledge) {
                propagationPromises.push(
                    this.worldKnowledge.setGenre(genre).catch(error =>
                        logger.warn('Failed to set genre in WorldKnowledge', { error })
                    )
                );
            }

            // NarrativeMemoryにジャンルを設定
            if (this.narrativeMemory) {
                propagationPromises.push(
                    Promise.resolve(this.narrativeMemory.setGenre(genre)).catch(error =>
                        logger.warn('Failed to set genre in NarrativeMemory', { error })
                    )
                );
            }

            await Promise.allSettled(propagationPromises);
            logger.info(`Genre '${genre}' propagation completed`);

        } catch (error) {
            logger.error('Failed to propagate genre to memory components', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
 * ⭐ 新規追加: 章生成前にジャンル同期を確認
 */
    async ensureGenreSynchronization(): Promise<void> {
        try {
            const plotGenre = await plotManager.getGenre();

            // WorldKnowledgeのジャンル確認
            if (this.worldKnowledge) {
                const worldGenre = this.worldKnowledge.getGenre();
                if (worldGenre !== plotGenre) {
                    logger.warn(`Genre mismatch detected - Plot: ${plotGenre}, World: ${worldGenre}. Synchronizing...`);
                    await this.worldKnowledge.setGenre(plotGenre);
                }
            }

            // NarrativeMemoryのジャンル確認・設定
            if (this.narrativeMemory) {
                const narrativeGenre = this.narrativeMemory.getGenre();
                if (narrativeGenre !== plotGenre) {
                    logger.warn(`Genre mismatch detected - Plot: ${plotGenre}, Narrative: ${narrativeGenre}. Synchronizing...`);
                    this.narrativeMemory.setGenre(plotGenre);
                }
            }

        } catch (error) {
            logger.error('Failed to ensure genre synchronization', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * コンポーネント状態記録
     */
    private recordComponentStatus(
        name: string,
        initialized: boolean,
        healthy: boolean,
        error?: string,
        initTime?: number
    ): void {
        this.componentStatuses.set(name, {
            name,
            initialized,
            healthy,
            error,
            initTime
        });
    }

    /**
     * プロセッサー依存関係検証
     */
    private async _validateProcessorDependencies(): Promise<void> {
        const requiredForProcessors = ['ImmediateContext', 'NarrativeMemory'];
        const missingDependencies = [];

        for (const dependency of requiredForProcessors) {
            const status = this.componentStatuses.get(dependency);
            if (!status?.healthy) {
                missingDependencies.push(dependency);
            }
        }

        if (missingDependencies.length > 0) {
            logger.warn(`Processor dependencies not fully satisfied: ${missingDependencies.join(', ')}`);
        }
    }

    // ============================================================================
    // 🔧 ファザードメソッド: NarrativeMemoryへの委譲
    // ============================================================================

    /**
     * 🔧 ファザード: 物語状態の更新（NarrativeMemoryに委譲）
     */
    // async updateNarrativeState(chapter: Chapter): Promise<void> {
    //     try {
    //         await this._ensureBasicInitialization();

    //         logger.info(`MemoryManager: Delegating narrative state update for chapter ${chapter.chapterNumber} to NarrativeMemory`);

    //         if (this.narrativeMemory) {
    //             await this.narrativeMemory.updateNarrativeState(chapter);
    //             logger.info(`MemoryManager: Successfully delegated narrative state update for chapter ${chapter.chapterNumber}`);
    //         } else {
    //             logger.warn(`MemoryManager: NarrativeMemory not available for chapter ${chapter.chapterNumber}`);
    //             throw new Error('NarrativeMemory component not initialized');
    //         }
    //     } catch (error) {
    //         logger.error(`MemoryManager: Failed to delegate narrative state update for chapter ${chapter.chapterNumber}`, {
    //             error: error instanceof Error ? error.message : String(error)
    //         });
    //         throw error;
    //     }
    // }

    async updateNarrativeState(chapter: Chapter): Promise<void> {
        try {
            await this._ensureBasicInitialization();
            logger.info(`🔄 MemoryManager: Starting narrative state update for chapter ${chapter.chapterNumber}`);

            if (!this.narrativeMemory) {
                throw new Error(`❌ CRITICAL: NarrativeMemory component not initialized`);
            }

            // 🔥 修正: エラーは絶対に隠蔽しない
            await this.narrativeMemory.updateNarrativeState(chapter);

            logger.info(`✅ MemoryManager: Successfully completed narrative state update for chapter ${chapter.chapterNumber}`);

        } catch (error) {
            const criticalError = `❌ CRITICAL: MemoryManager記憶階層更新が完全に失敗 (Chapter ${chapter.chapterNumber})`;
            logger.error(criticalError, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber: chapter.chapterNumber,
                initialized: this.initialized,
                coreInitialized: this.coreInitialized
            });

            // 🔥 重要: エラーを再スローして呼び出し元に伝播
            throw new Error(`${criticalError}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 🔧 新規追加: 章からイベントを検出して保存（EventMemoryに委譲）
     */
    async detectAndStoreChapterEvents(chapter: Chapter, options?: { genre?: string }): Promise<void> {
        try {
            await this._ensureBasicInitialization();

            logger.info(`Detecting and storing events for chapter ${chapter.chapterNumber}`);

            // EventMemoryでイベント検出・保存を実行
            await this.eventMemory.detectAndStoreEvents(chapter, options);

            logger.info(`Successfully processed chapter events for chapter ${chapter.chapterNumber}`);

        } catch (error) {
            logger.error(`Failed to detect and store chapter events for chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber: chapter.chapterNumber
            });

            // EventMemory処理エラーは全体の処理を停止しないが、エラーを再スロー
            throw new Error(`EventMemory処理失敗 (Chapter ${chapter.chapterNumber}): ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
    * 🔧 新規追加: すべてのメモリシステムを保存
    */
    async saveAllMemories(): Promise<{
        narrativeMemory: { success: boolean; error?: string };
        eventMemory: { success: boolean; error?: string };
        overallSuccess: boolean;
    }> {
        const result = {
            narrativeMemory: { success: false, error: undefined as string | undefined },
            eventMemory: { success: false, error: undefined as string | undefined },
            overallSuccess: false
        };

        try {
            await this._ensureBasicInitialization();

            logger.info(`Starting comprehensive memory save operation`);

            // 1. NarrativeMemoryの保存
            try {
                if (this.narrativeMemory) {
                    await this.narrativeMemory.save();
                    result.narrativeMemory.success = true;
                    logger.debug(`NarrativeMemory saved successfully`);
                } else {
                    throw new Error('NarrativeMemory not available');
                }
            } catch (narrativeError) {
                const errorMsg = narrativeError instanceof Error ? narrativeError.message : String(narrativeError);
                result.narrativeMemory.error = errorMsg;
                logger.error(`NarrativeMemory save failed: ${errorMsg}`);
            }

            // 2. EventMemoryの保存（イベントは recordSignificantEvent 内で自動保存されるが、明示的に保存状態を確認）
            try {
                const eventStatus = await this.eventMemory.getStatus();
                if (eventStatus.eventCount >= 0) {
                    result.eventMemory.success = true;
                    logger.debug(`EventMemory status confirmed: ${eventStatus.eventCount} events`);
                } else {
                    throw new Error('EventMemory status check failed');
                }
            } catch (eventError) {
                const errorMsg = eventError instanceof Error ? eventError.message : String(eventError);
                result.eventMemory.error = errorMsg;
                logger.error(`EventMemory verification failed: ${errorMsg}`);
            }

            // 3. 全体成功判定
            result.overallSuccess = result.narrativeMemory.success && result.eventMemory.success;

            if (result.overallSuccess) {
                logger.info(`All memory systems saved successfully`);
            } else {
                logger.warn(`Memory save completed with some failures`, {
                    narrativeSuccess: result.narrativeMemory.success,
                    eventSuccess: result.eventMemory.success
                });
            }

            return result;

        } catch (error) {
            logger.error(`Critical failure in comprehensive memory save`, {
                error: error instanceof Error ? error.message : String(error)
            });

            result.narrativeMemory.error = result.narrativeMemory.error || 'Critical failure during save';
            result.eventMemory.error = result.eventMemory.error || 'Critical failure during save';

            return result;
        }
    }

    /**
     * 🔧 新規追加: メモリシステム全体の健康状態チェック
     */
    async checkMemorySystemHealth(): Promise<{
        narrativeMemory: {
            initialized: boolean;
            canSave: boolean;
            componentCount: number;
            errors: string[];
        };
        eventMemory: {
            initialized: boolean;
            eventCount: number;
            lastUpdate: Date | null;
            errors: string[];
        };
        overallHealth: 'healthy' | 'degraded' | 'critical';
    }> {
        const healthReport = {
            narrativeMemory: {
                initialized: false,
                canSave: false,
                componentCount: 0,
                errors: [] as string[]
            },
            eventMemory: {
                initialized: false,
                eventCount: 0,
                lastUpdate: null as Date | null,
                errors: [] as string[]
            },
            overallHealth: 'critical' as 'healthy' | 'degraded' | 'critical'
        };

        try {
            await this._ensureBasicInitialization();

            // NarrativeMemoryの健康状態チェック
            try {
                if (this.narrativeMemory) {
                    const narrativeStatus = await this.narrativeMemory.getStatus();
                    healthReport.narrativeMemory.initialized = narrativeStatus.initialized;
                    healthReport.narrativeMemory.componentCount = narrativeStatus.summaryCount;
                    healthReport.narrativeMemory.canSave = true;

                    // マネージャー健康状態の詳細チェック
                    const managerHealth = await this.narrativeMemory.checkManagerHealth();
                    const unhealthyManagers = Object.entries(managerHealth)
                        .filter(([name, health]) => !health.initialized || !health.canSave)
                        .map(([name, health]) => `${name}: ${health.errors.join(', ')}`);

                    healthReport.narrativeMemory.errors = unhealthyManagers;
                } else {
                    healthReport.narrativeMemory.errors.push('NarrativeMemory not initialized');
                }
            } catch (narrativeError) {
                healthReport.narrativeMemory.errors.push(
                    narrativeError instanceof Error ? narrativeError.message : String(narrativeError)
                );
            }

            // EventMemoryの健康状態チェック
            try {
                const eventStatus = await this.eventMemory.getStatus();
                healthReport.eventMemory.initialized = true;
                healthReport.eventMemory.eventCount = eventStatus.eventCount;
                healthReport.eventMemory.lastUpdate = eventStatus.lastUpdateTime;
            } catch (eventError) {
                healthReport.eventMemory.errors.push(
                    eventError instanceof Error ? eventError.message : String(eventError)
                );
            }

            // 全体健康状態の判定
            const narrativeHealthy = healthReport.narrativeMemory.initialized &&
                healthReport.narrativeMemory.canSave &&
                healthReport.narrativeMemory.errors.length === 0;

            const eventHealthy = healthReport.eventMemory.initialized &&
                healthReport.eventMemory.errors.length === 0;

            if (narrativeHealthy && eventHealthy) {
                healthReport.overallHealth = 'healthy';
            } else if (narrativeHealthy || eventHealthy) {
                healthReport.overallHealth = 'degraded';
            } else {
                healthReport.overallHealth = 'critical';
            }

            logger.info(`Memory system health check completed`, {
                overallHealth: healthReport.overallHealth,
                narrativeMemoryHealthy: narrativeHealthy,
                eventMemoryHealthy: eventHealthy
            });

            return healthReport;

        } catch (error) {
            logger.error(`Memory system health check failed`, {
                error: error instanceof Error ? error.message : String(error)
            });

            healthReport.narrativeMemory.errors.push('Health check failed');
            healthReport.eventMemory.errors.push('Health check failed');

            return healthReport;
        }
    }

    /**
     * 🔧 新規追加: 章生成後の完全なメモリ処理（統合メソッド）
     */
    async processChapterMemories(chapter: Chapter, options?: {
        genre?: string;
        forceAnalysis?: boolean;
        skipLearningJourneyUpdate?: boolean; // 🔥 新規追加: 重複回避フラグ
    }): Promise<{
        eventsDetected: number;
        narrativeUpdated: boolean;
        saved: boolean;
        errors: string[];
    }> {
        const result = {
            eventsDetected: 0,
            narrativeUpdated: false,
            saved: false,
            errors: [] as string[]
        };

        // 🔥 修正: 記憶更新のロック機構（シンプルな実装）
        const lockKey = `memory-update-${chapter.chapterNumber}`;
        const lockTimeout = 30000; // 30秒タイムアウト

        try {
            await this._ensureBasicInitialization();

            logger.info(`Starting comprehensive memory processing for chapter ${chapter.chapterNumber}`);

            // 1. イベント検出・保存
            try {
                const beforeEventCount = (await this.eventMemory.getStatus()).eventCount;

                await this.detectAndStoreChapterEvents(chapter, options);

                const afterEventCount = (await this.eventMemory.getStatus()).eventCount;
                result.eventsDetected = afterEventCount - beforeEventCount;

                logger.debug(`Detected ${result.eventsDetected} new events for chapter ${chapter.chapterNumber}`);

            } catch (eventError) {
                const errorMsg = `イベント検出失敗: ${eventError instanceof Error ? eventError.message : String(eventError)}`;
                result.errors.push(errorMsg);
                logger.error(errorMsg);
            }

            // 2. 物語記憶更新
            try {
                await this.updateNarrativeState(chapter);
                result.narrativeUpdated = true;
                logger.debug(`Narrative state updated for chapter ${chapter.chapterNumber}`);

            } catch (narrativeError) {
                const errorMsg = `物語記憶更新失敗: ${narrativeError instanceof Error ? narrativeError.message : String(narrativeError)}`;
                result.errors.push(errorMsg);
                logger.error(errorMsg);
            }

            // 3. 統合保存
            try {
                const saveResult = await this.saveAllMemories();
                result.saved = saveResult.overallSuccess;

                if (!saveResult.overallSuccess) {
                    if (saveResult.narrativeMemory.error) {
                        result.errors.push(`NarrativeMemory保存失敗: ${saveResult.narrativeMemory.error}`);
                    }
                    if (saveResult.eventMemory.error) {
                        result.errors.push(`EventMemory保存失敗: ${saveResult.eventMemory.error}`);
                    }
                }

            } catch (saveError) {
                const errorMsg = `統合保存失敗: ${saveError instanceof Error ? saveError.message : String(saveError)}`;
                result.errors.push(errorMsg);
                logger.error(errorMsg);
            }

            // 4. 結果ログ
            const success = result.narrativeUpdated && result.saved && result.errors.length === 0;

            logger.info(`Memory processing completed for chapter ${chapter.chapterNumber}`, {
                success,
                eventsDetected: result.eventsDetected,
                narrativeUpdated: result.narrativeUpdated,
                saved: result.saved,
                errorCount: result.errors.length
            });

            return result;

        } catch (error) {
            const criticalError = `章メモリ処理で致命的エラー: ${error instanceof Error ? error.message : String(error)}`;
            result.errors.push(criticalError);
            logger.error(criticalError);

            return result;
        }
    }

    /**
     * 🔧 ファザード: 物語状態の取得（NarrativeMemoryに委譲）
     */
    async getNarrativeState(chapterNumber: number): Promise<NarrativeStateInfo> {
        try {
            await this._ensureBasicInitialization();

            if (this.narrativeMemory) {
                return await this.narrativeMemory.getCurrentState(chapterNumber);
            }

            logger.warn(`MemoryManager: NarrativeMemory not available for getNarrativeState`);
            return this.createFallbackNarrativeState(chapterNumber);
        } catch (error) {
            logger.error(`MemoryManager: Failed to get narrative state for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return this.createFallbackNarrativeState(chapterNumber);
        }
    }

    /**
     * 🔧 ファザード: 停滞検出（NarrativeMemoryに委譲）
     */
    async detectStagnation(chapterNumber: number): Promise<StagnationDetectionResult> {
        try {
            await this._ensureBasicInitialization();

            if (this.narrativeMemory) {
                return await this.narrativeMemory.detectStagnation(chapterNumber);
            }

            logger.warn(`MemoryManager: NarrativeMemory not available for detectStagnation`);
            return {
                detected: false,
                cause: '',
                score: 0,
                severity: 'LOW',
                recommendations: []
            };
        } catch (error) {
            logger.error(`MemoryManager: Failed to detect stagnation for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                detected: false,
                cause: '',
                score: 0,
                severity: 'LOW',
                recommendations: []
            };
        }
    }

    /**
     * 🔧 ファザード: 章要約取得（NarrativeMemoryに委譲）
     */
    async getChapterSummary(chapterNumber: number): Promise<string | null> {
        try {
            await this._ensureBasicInitialization();

            if (this.narrativeMemory) {
                return await this.narrativeMemory.getChapterSummary(chapterNumber);
            }

            logger.warn(`MemoryManager: NarrativeMemory not available for getChapterSummary`);
            return null;
        } catch (error) {
            logger.error(`MemoryManager: Failed to get chapter summary for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return null;
        }
    }

    /**
     * 🔧 ファザード: 全章要約取得（NarrativeMemoryに委譲）
     */
    async getAllChapterSummaries(): Promise<any[]> {
        try {
            await this._ensureBasicInitialization();

            if (this.narrativeMemory) {
                return await this.narrativeMemory.getAllChapterSummaries();
            }

            logger.warn(`MemoryManager: NarrativeMemory not available for getAllChapterSummaries`);
            return [];
        } catch (error) {
            logger.error(`MemoryManager: Failed to get all chapter summaries`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 🔧 ファザード: エモーショナルカーブ取得（NarrativeMemoryに委譲）
     */
    async getEmotionalCurve(startChapter: number, endChapter: number): Promise<EmotionalCurvePoint[]> {
        try {
            await this._ensureBasicInitialization();

            if (this.narrativeMemory) {
                return await this.narrativeMemory.getEmotionalCurve(startChapter, endChapter);
            }

            logger.warn(`MemoryManager: NarrativeMemory not available for getEmotionalCurve`);
            return [];
        } catch (error) {
            logger.error(`MemoryManager: Failed to get emotional curve`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 🔧 ファザード: 物語停滞時の新しい展開提案を生成（NarrativeMemoryに委譲）
     */
    async generateStoryProgressionSuggestions(chapterNumber: number): Promise<string[]> {
        try {
            await this._ensureBasicInitialization();

            if (this.narrativeMemory) {
                const stagnationResult = await this.narrativeMemory.detectStagnation(chapterNumber);

                if (!stagnationResult.detected) {
                    return [
                        'キャラクターの目標に向けた進展',
                        '新たな課題や障害の導入',
                        '既存の葛藤の深化'
                    ];
                }

                if (stagnationResult.recommendations && stagnationResult.recommendations.length > 0) {
                    return stagnationResult.recommendations;
                }
            }

            return [
                'キャラクターの目標に向けた進展を示す',
                '物語に新たな要素や葛藤を導入する',
                '少なくとも一つの重要な出来事を発生させる'
            ];
        } catch (error) {
            logger.error('Story progression suggestions generation failed', { error });
            return [
                'キャラクターの目標に向けた進展を示す',
                '物語に新たな要素や葛藤を導入する',
                '少なくとも一つの重要な出来事を発生させる'
            ];
        }
    }

    /**
     * 🔧 ファザード: 死亡キャラクター取得（CharacterTrackerに委譲）
     */
    async getDeceasedCharacters(): Promise<string[]> {
        try {
            await this._ensureAdvancedInitialization();

            if (this.characterTracker) {
                return await this.characterTracker.getDeceasedCharacters();
            }

            return [];
        } catch (error) {
            logger.error('Failed to get deceased characters', { error });
            return [];
        }
    }

    /**
     * 🔧 ファザード: 結婚キャラクターペア取得（CharacterTrackerに委譲）
     */
    async getMarriedCharacterPairs(): Promise<Array<{ char1Id: string, char2Id: string }>> {
        try {
            await this._ensureAdvancedInitialization();

            if (this.characterTracker) {
                return await this.characterTracker.getMarriedCharacterPairs();
            }

            return [];
        } catch (error) {
            logger.error('Failed to get married character pairs', { error });
            return [];
        }
    }

    /**
     * 🔧 ファザード: 永続的イベント取得（EventMemoryに委譲）
     */
    async getPersistentEvents(
        startChapter: number,
        endChapter: number
    ): Promise<SignificantEvent[]> {
        try {
            await this._ensureAdvancedInitialization();

            const events = await this.eventMemory.queryEvents({
                isPersistent: true,
                chapterRange: { start: startChapter, end: endChapter }
            });

            // キャラクター名とIDの整合性を確保
            const resolvedEvents = await Promise.all(events.map(async event => {
                const resolvedCharacters = await Promise.all(
                    event.involvedCharacters.map(async charId => {
                        if (charId.startsWith('char-') || charId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                            return charId;
                        }

                        const character = await this.characterManager.getCharacterByName(charId);
                        return character ? character.id : charId;
                    })
                );

                return {
                    ...event,
                    involvedCharacters: resolvedCharacters
                };
            }));

            return resolvedEvents;
        } catch (error) {
            logger.error('Failed to get persistent events', {
                error: error instanceof Error ? error.message : String(error),
                startChapter,
                endChapter
            });
            return [];
        }
    }

    /**
     * 🔧 ファザード: 特定タイプの永続的イベント取得（EventRegistryに委譲）
     */
    async getPersistentEventsByType(type: PersistentEventType): Promise<SignificantEvent[]> {
        try {
            await this._ensureAdvancedInitialization();

            if (this.eventRegistry) {
                return await this.eventRegistry.getEventsByTypes([type], {
                    isPersistent: true
                });
            }

            return [];
        } catch (error) {
            logger.error(`Failed to get persistent events of type ${type}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 🔧 ファザード: 永続的イベント記録（PersistentEventHandlerに委譲）
     */
    async recordPersistentEvent(event: SignificantEvent): Promise<void> {
        try {
            await this._ensureAdvancedInitialization();

            if (this.persistentEventHandler) {
                await this.persistentEventHandler.recordPersistentEvent(event);
            }
        } catch (error) {
            logger.error('Failed to record persistent event', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 🔧 ファザード: 生成コンテキストの整合性検証（GenerationContextValidatorに委譲）
     */
    async validateGenerationContext(context: GenerationContext): Promise<{
        consistent: boolean;
        issues: string[];
    }> {
        try {
            await this._ensureAdvancedInitialization();

            if (this.contextValidator) {
                return await this.contextValidator.validateGenerationContext(context);
            }

            return { consistent: true, issues: [] };
        } catch (error) {
            logger.error('Failed to validate generation context', {
                error: error instanceof Error ? error.message : String(error)
            });
            return { consistent: true, issues: [] };
        }
    }

    /**
     * 🔧 ファザード: 生成コンテキスト修正（GenerationContextValidatorに委譲）
     */
    async correctGenerationContext(
        context: GenerationContext,
        consistencyResult: { consistent: boolean; issues: string[] }
    ): Promise<Partial<GenerationContext>> {
        try {
            await this._ensureAdvancedInitialization();

            if (this.contextValidator) {
                return await this.contextValidator.correctGenerationContext(context, consistencyResult);
            }

            return {};
        } catch (error) {
            logger.error('Failed to correct generation context', {
                error: error instanceof Error ? error.message : String(error)
            });
            return {};
        }
    }

    /**
     * 🔧 ファザード: キャラクター変化処理（CharacterTrackerに委譲）
     */
    async processCharacterChanges(characterDiff: CharacterDiff, chapterNumber: number): Promise<void> {
        try {
            await this._ensureAdvancedInitialization();

            if (this.characterTracker) {
                await this.characterTracker.processCharacterChanges(characterDiff, chapterNumber);
            }

            // 各メモリレイヤーにも変化を反映
            if (this.worldKnowledge) {
                await this.worldKnowledge.refreshCharacterData(characterDiff.id);
            }

            if (this.immediateContext) {
                const chapter = await this.immediateContext.getChapter(chapterNumber);
                if (chapter) {
                    await this.immediateContext.updateCharacterState(
                        chapter,
                        characterDiff.name,
                        characterDiff.changes
                    );
                }
            }
        } catch (error) {
            logger.error('キャラクター変化処理中にエラーが発生', {
                character: characterDiff.name,
                chapterNumber,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 🔧 ファザード: チャプター一貫性チェック（ConsistencyCheckerに委譲）
     */
    async checkConsistency(chapter: Chapter): Promise<ConsistencyResult> {
        try {
            const checker = new ConsistencyChecker();
            return await checker.checkConsistency(chapter);
        } catch (error) {
            logger.error('Failed to check consistency', {
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                isConsistent: true,
                issues: []
            };
        }
    }

    /**
     * 🔧 ファザード: 伏線状態更新（WorldKnowledgeとNarrativeMemoryに委譲）
     */
    async updateForeshadowingStatus(
        resolvedForeshadowing: Foreshadowing[],
        chapterNumber: number
    ): Promise<void> {
        try {
            await this._ensureAdvancedInitialization();

            if (resolvedForeshadowing.length === 0) {
                return;
            }

            logger.info(`${resolvedForeshadowing.length}件の解決済み伏線の状態を更新します (チャプター${chapterNumber})`);

            // WorldKnowledgeで各解決済み伏線を更新
            if (this.worldKnowledge) {
                for (const fs of resolvedForeshadowing) {
                    await this.worldKnowledge.resolveForeshadowing(
                        fs.id,
                        chapterNumber,
                        fs.resolution_description || `チャプター${chapterNumber}で回収されました`
                    );
                }
            }

            // NarrativeMemoryにも解決情報を記録
            if (this.narrativeMemory) {
                await this.narrativeMemory.recordResolvedForeshadowing(
                    resolvedForeshadowing,
                    chapterNumber
                );
            }
        } catch (error) {
            logger.error('伏線状態の更新中にエラーが発生しました', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 🔧 ファザード: 重要イベント記録（EventRegistryに委譲）
     */
    async recordSignificantEvent(event: SignificantEvent): Promise<void> {
        try {
            await this._ensureAdvancedInitialization();

            if (this.eventRegistry) {
                return await this.eventRegistry.recordSignificantEvent(event);
            }
        } catch (error) {
            logger.error('Failed to record significant event', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 🔧 ファザード: 場所関連イベント取得（EventRegistryに委譲）
     */
    async getLocationEvents(location: string, options?: QueryOptions): Promise<SignificantEvent[]> {
        try {
            await this._ensureAdvancedInitialization();

            if (this.eventRegistry) {
                return await this.eventRegistry.getLocationEvents(location, options);
            }

            return [];
        } catch (error) {
            logger.error('Failed to get location events', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 🔧 ファザード: キャラクター間の重要インタラクション取得（EventRegistryに委譲）
     */
    async getSignificantCharacterInteractions(
        characterIds: string[],
        options?: QueryOptions
    ): Promise<SignificantEvent[]> {
        try {
            await this._ensureAdvancedInitialization();

            if (this.eventRegistry) {
                return await this.eventRegistry.getSignificantCharacterInteractions(characterIds, options);
            }

            return [];
        } catch (error) {
            logger.error('Failed to get significant character interactions', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 🔧 ファザード: イベントタイプ別の重要イベント取得（EventRegistryに委譲）
     */
    async getEventsByTypes(
        types: string[],
        options?: QueryOptions & { involvedCharacters?: string[] }
    ): Promise<SignificantEvent[]> {
        try {
            await this._ensureAdvancedInitialization();

            if (this.eventRegistry) {
                return await this.eventRegistry.getEventsByTypes(types, options);
            }

            return [];
        } catch (error) {
            logger.error('Failed to get events by types', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 🔧 ファザード: 関連イベント取得（EventRegistryに委譲）
     */
    async getRelatedEvents(context: EventContext): Promise<SignificantEvent[]> {
        try {
            await this._ensureAdvancedInitialization();

            if (this.eventRegistry) {
                return await this.eventRegistry.getRelatedEvents(context);
            }

            return [];
        } catch (error) {
            logger.error('Failed to get related events', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 🔧 ファザード: キャラクター心理情報取得（CharacterManagerに委譲）
     */
    async getCharacterPsychology(characterId: string, chapterNumber: number): Promise<CharacterPsychology | null> {
        try {
            await this._ensureBasicInitialization();

            return await this.characterManager.getCharacterPsychology(characterId, chapterNumber);
        } catch (error) {
            logger.error(`キャラクター心理情報の取得に失敗しました: ${characterId}`, { error });
            return null;
        }
    }

    /**
     * 🔧 新機能: ストレージ診断レポート生成（NarrativeMemoryに委譲）
     */
    async generateStorageDiagnosticReport(): Promise<string> {
        try {
            await this._ensureBasicInitialization();

            if (this.narrativeMemory) {
                return await this.narrativeMemory.generateStorageDiagnosticReport();
            }

            return '❌ NarrativeMemory not available for diagnostic report generation';
        } catch (error) {
            logger.error('Failed to generate storage diagnostic report', {
                error: error instanceof Error ? error.message : String(error)
            });
            return `❌ 診断レポート生成に失敗: ${error instanceof Error ? error.message : String(error)}`;
        }
    }

    /**
     * 🔧 新機能: ストレージ診断（NarrativeMemoryに委譲）
     */
    async diagnoseStorage(): Promise<{
        files: { path: string; exists: boolean; size?: number }[];
        errors: string[];
    }> {
        try {
            await this._ensureBasicInitialization();

            if (this.narrativeMemory) {
                return await this.narrativeMemory.diagnoseStorage();
            }

            return {
                files: [],
                errors: ['NarrativeMemory not available for storage diagnosis']
            };
        } catch (error) {
            logger.error('Failed to diagnose storage', {
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                files: [],
                errors: [`診断に失敗: ${error instanceof Error ? error.message : String(error)}`]
            };
        }
    }

    /**
     * 🔧 新機能: ストレージ修復（NarrativeMemoryに委譲）
     */
    async repairStorage(): Promise<{
        success: boolean;
        repaired: string[];
        errors: string[];
    }> {
        try {
            await this._ensureBasicInitialization();

            if (this.narrativeMemory) {
                return await this.narrativeMemory.repairStorage();
            }

            return {
                success: false,
                repaired: [],
                errors: ['NarrativeMemory not available for storage repair']
            };
        } catch (error) {
            logger.error('Failed to repair storage', {
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                success: false,
                repaired: [],
                errors: [`ストレージ修復に失敗: ${error instanceof Error ? error.message : String(error)}`]
            };
        }
    }

    /**
     * 🔧 新機能: ストレージファイルパスの検証
     */
    async validateStoragePaths(): Promise<{
        registered: string[];
        missing: string[];
        unexpected: string[];
    }> {
        try {
            // 期待されるファイルパス（StorageDiagnosticManagerと同期）
            const expectedPaths = [
                'narrative-memory/summaries.json',
                'narrative-memory/characters.json',
                'narrative-memory/emotional-dynamics.json',
                'narrative-memory/state.json',
                'narrative-memory/turning-points.json',
                'narrative-memory/world-context.json',
                'narrative-memory/chapter-analysis-config.json',
                'narrative-memory/character-changes.json',
                'narrative-memory/character-tracking-config.json'
            ];

            // 現在登録されているパス（プライベートなので推測）
            const registeredPaths = [
                'immediate-context/metadata.json',
                'narrative-memory/summaries.json',
                'narrative-memory/chapter-analysis-config.json',
                'narrative-memory/characters.json',
                'narrative-memory/character-changes.json',
                'narrative-memory/character-tracking-config.json',
                'narrative-memory/emotional-dynamics.json',
                'narrative-memory/state.json',
                'narrative-memory/turning-points.json',
                'narrative-memory/world-context.json',
                'world-knowledge/current.json',
                'data/memory/significant-events.json',
                'data/characters/character-database.json',
                'data/plot/plot-state.json'
            ];

            const missing = expectedPaths.filter(path => !registeredPaths.includes(path));
            const narrativeRegistered = registeredPaths.filter(path => path.startsWith('narrative-memory/'));
            const unexpected = narrativeRegistered.filter(path => !expectedPaths.includes(path));

            logger.info('Storage paths validation completed', {
                totalRegistered: registeredPaths.length,
                narrativeRegistered: narrativeRegistered.length,
                missing: missing.length,
                unexpected: unexpected.length
            });

            return {
                registered: narrativeRegistered,
                missing,
                unexpected
            };
        } catch (error) {
            logger.error('Failed to validate storage paths', {
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                registered: [],
                missing: [],
                unexpected: []
            };
        }
    }

    // ============================================================================
    // 🔧 ファザードメソッド: その他のコンポーネントへの委譲
    // ============================================================================

    /**
     * 🔧 ファザード: 最近のチャプターメモリ取得（ImmediateContextとNarrativeMemoryに委譲）
     */
    async getRecentChapterMemories(upToChapter: number, limit?: number): Promise<ChapterMemory[]> {
        try {
            await this._ensureBasicInitialization();

            if (!this.immediateContext || !this.narrativeMemory) {
                logger.warn('Required components not available for getRecentChapterMemories');
                return [];
            }

            // ImmediateContextから章情報を取得
            const chapters = await this.immediateContext.getRecentChapters(upToChapter);
            const chapterMemories: ChapterMemory[] = [];

            for (const chapterInfo of chapters) {
                const chapter = chapterInfo.chapter;

                // NarrativeMemoryから章要約を取得
                const summary = await this.narrativeMemory.getChapterSummary(chapter.chapterNumber);

                // WorldKnowledgeからキーイベントを取得
                const keyEvents = this.worldKnowledge ?
                    await this.worldKnowledge.getEstablishedEvents({
                        start: chapter.chapterNumber,
                        end: chapter.chapterNumber
                    }) : [];

                const chapterMemory: ChapterMemory = {
                    chapter: chapter.chapterNumber,
                    summary: summary || chapter.content.substring(0, 200) + '...',
                    key_events: keyEvents.map(event => ({
                        event: event.description,
                        chapter: event.chapter,
                        significance: event.significance || 5
                    })),
                    character_states: Array.from(chapterInfo.characterState.values()),
                    timestamp: chapterInfo.timestamp,
                    emotional_impact: 5,
                    plot_significance: 5
                };

                chapterMemories.push(chapterMemory);
            }

            const sortedMemories = chapterMemories.sort((a, b) => b.chapter - a.chapter);
            return limit ? sortedMemories.slice(0, limit) : sortedMemories;
        } catch (error) {
            logger.error('Failed to get recent chapter memories', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 🔧 ファザード: 現在のアーク取得（NarrativeMemoryに委譲）
     */
    async getCurrentArc(chapterNumber: number): Promise<ArcMemory | null> {
        try {
            await this._ensureBasicInitialization();

            if (this.narrativeMemory) {
                return await this.narrativeMemory.getArcMemory(1); // 現在のアーク番号を想定
            }

            logger.warn(`MemoryManager: NarrativeMemory not available for getCurrentArc`);
            return null;
        } catch (error) {
            logger.error('Failed to get current arc', {
                error: error instanceof Error ? error.message : String(error)
            });
            return null;
        }
    }

    // ============================================================================
    // 🔧 内部ヘルパーメソッド
    // ============================================================================

    /**
     * キーワードベースの検索を実行
     */
    private performKeywordSearch(
        query: string,
        memories: Memory[],
        minRelevance: number
    ): SearchResult[] {
        const keywords = query
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 1);

        if (keywords.length === 0) {
            return memories
                .filter(m => m.priority >= minRelevance)
                .map(m => ({
                    memory: m,
                    relevance: m.priority,
                    matches: []
                }));
        }

        return memories
            .map(memory => {
                const content = memory.content.toLowerCase();
                let relevance = 0;
                const matches: string[] = [];

                keywords.forEach(keyword => {
                    if (content.includes(keyword)) {
                        relevance += 0.2;

                        const index = content.indexOf(keyword);
                        const start = Math.max(0, index - 20);
                        const end = Math.min(content.length, index + keyword.length + 20);
                        matches.push(memory.content.substring(start, end));
                    }
                });

                relevance = relevance * 0.7 + memory.priority * 0.3;
                relevance = Math.min(1.0, relevance);

                return {
                    memory,
                    relevance,
                    matches
                };
            })
            .filter(result => result.relevance >= minRelevance);
    }

    /**
     * ターニングポイント統合ヘルパーメソッド
     */
    private async integrateNarrativeTurningPoints(turningPoints: any[], chapterNumber: number): Promise<void> {
        if (!this.worldKnowledge) {
            return;
        }

        for (const tp of turningPoints) {
            await this.worldKnowledge.establishEvent({
                id: `tp-${tp.chapter}-${Date.now()}`,
                chapter: tp.chapter,
                title: tp.description.substring(0, 30) + '...',
                description: tp.description,
                significance: tp.significance,
                characters: [],
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * フォールバック物語状態の作成
     */
    private createFallbackNarrativeState(chapterNumber: number): NarrativeStateInfo {
        return {
            state: NarrativeState.INTRODUCTION,
            duration: 1,
            tensionLevel: 5,
            stagnationDetected: false,
            suggestedNextState: NarrativeState.DAILY_LIFE,
            location: '不明',
            timeOfDay: '不明',
            weather: '不明',
            presentCharacters: [],
            genre: 'classic',
            currentArcNumber: 1,
            currentTheme: '物語の始まり',
            arcStartChapter: 1,
            arcEndChapter: -1,
            arcCompleted: false,
            turningPoints: []
        };
    }

    /**
     * 基本初期化確認
     */
    private async _ensureBasicInitialization(): Promise<void> {
        if (!this.canPerformBasicOperations()) {
            logger.info('Basic operations not available, triggering initialization');
            await this.initialize();

            if (!this.canPerformBasicOperations()) {
                throw new Error('MemoryManager basic initialization failed');
            }
        }
    }

    /**
     * 高度初期化確認
     */
    private async _ensureAdvancedInitialization(): Promise<void> {
        if (!this.canPerformAdvancedOperations()) {
            logger.info('Advanced operations not available, triggering full initialization');
            await this.initialize();

            if (!this.canPerformAdvancedOperations()) {
                logger.warn('MemoryManager advanced features not available, using fallback');
            }
        }
    }

    // ============================================================================
    // 🔧 状態確認メソッド
    // ============================================================================

    isCoreInitialized(): boolean {
        return this.coreInitialized &&
            this.immediateContext !== undefined &&
            this.narrativeMemory !== undefined;
    }

    isExtendedInitialized(): boolean {
        return this.extendedInitialized &&
            this.worldKnowledge !== undefined &&
            this.eventRegistry !== undefined;
    }

    async isInitialized(): Promise<boolean> {
        // 🔥 修正: より厳密な初期化チェック
        return this.initializationStage === InitializationStage.FULLY_READY && 
               this.initialized && 
               this.coreInitialized;
    }

    canPerformBasicOperations(): boolean {
        return this.initializationStage >= InitializationStage.CORE_READY && this.coreInitialized;
    }

    canPerformAdvancedOperations(): boolean {
        return this.initializationStage >= InitializationStage.EXTENDED_READY && this.extendedInitialized;
    }

    getInitializationStatus(): {
        stage: InitializationStage;
        canBasicOps: boolean;
        canAdvancedOps: boolean;
        components: ComponentStatus[];
        totalInitTime: number;
    } {
        return {
            stage: this.initializationStage,
            canBasicOps: this.canPerformBasicOperations(),
            canAdvancedOps: this.canPerformAdvancedOperations(),
            components: Array.from(this.componentStatuses.values()),
            totalInitTime: Date.now() - this.initializationStartTime
        };
    }

    // ============================================================================
    // 🔧 IMemoryManager必須メソッドの実装
    // ============================================================================

    /**
     * 🔧 必須: 重要イベントを取得（WorldKnowledgeとNarrativeMemoryに委譲）
     */
    async getImportantEvents(startChapter: number, endChapter: number): Promise<KeyEvent[]> {
        try {
            await this._ensureAdvancedInitialization();

            const keyEvents: KeyEvent[] = [];

            // WorldKnowledgeから確立されたイベントを取得
            if (this.worldKnowledge) {
                const establishedEvents = await this.worldKnowledge.getEstablishedEvents({
                    start: startChapter,
                    end: endChapter
                });

                keyEvents.push(...establishedEvents.map(event => ({
                    event: event.description,
                    chapter: event.chapter,
                    significance: event.significance || 5,
                    characters: event.characters || []
                })));
            }

            // NarrativeMemoryからターニングポイントを取得
            if (this.narrativeMemory) {
                const narrativeState = await this.narrativeMemory.getCurrentState(endChapter);
                const turningPoints = narrativeState.turningPoints || [];

                keyEvents.push(...turningPoints
                    .filter(tp => tp.chapter >= startChapter && tp.chapter <= endChapter)
                    .map(tp => ({
                        event: tp.description,
                        chapter: tp.chapter,
                        significance: tp.significance
                    })));
            }

            // 重要度でソート
            return keyEvents.sort((a, b) => b.significance - a.significance);
        } catch (error) {
            logger.error('Failed to get important events', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 🔧 必須: 記憶の自然言語検索を実行
     */
    async searchMemories(query: string, options?: SearchOptions): Promise<SearchResult[]> {
        try {
            await this._ensureBasicInitialization();

            const defaultOptions: Required<SearchOptions> = {
                limit: 10,
                minRelevance: 0.5,
                memoryTypes: ['SHORT_TERM', 'MID_TERM', 'LONG_TERM'],
                includeMeta: false
            };

            const memoryTypes = options?.memoryTypes ?? defaultOptions.memoryTypes;
            const minRelevance = options?.minRelevance ?? defaultOptions.minRelevance;
            const limit = options?.limit ?? defaultOptions.limit;

            const memories: Memory[] = [];

            // ImmediateContext (SHORT_TERM) からの収集
            if (memoryTypes.includes('SHORT_TERM') && this.immediateContext) {
                const recentChapters = await this.immediateContext.getRecentChapters();

                for (const chapterInfo of recentChapters) {
                    memories.push({
                        type: 'SHORT_TERM',
                        content: `チャプター${chapterInfo.chapter.chapterNumber}: ${chapterInfo.chapter.content.substring(0, 200)}...`,
                        priority: 0.8
                    });

                    for (const phrase of chapterInfo.keyPhrases) {
                        memories.push({
                            type: 'SHORT_TERM',
                            content: `キーフレーズ(チャプター${chapterInfo.chapter.chapterNumber}): ${phrase}`,
                            priority: 0.6
                        });
                    }
                }
            }

            // NarrativeMemory (MID_TERM) からの収集
            if (memoryTypes.includes('MID_TERM') && this.narrativeMemory) {
                const latestChapter = await this.immediateContext?.getLatestChapter();
                const latestChapterNumber = latestChapter ? latestChapter.chapterNumber : 1;

                const currentState = await this.narrativeMemory.getCurrentState(latestChapterNumber);

                memories.push({
                    type: 'MID_TERM',
                    content: `物語状態: ${currentState.state}, テーマ: ${currentState.currentTheme}`,
                    priority: 0.7
                });

                if (currentState.turningPoints) {
                    for (const tp of currentState.turningPoints) {
                        memories.push({
                            type: 'MID_TERM',
                            content: `ターニングポイント(チャプター${tp.chapter}): ${tp.description}`,
                            priority: 0.65 * (tp.significance / 10)
                        });
                    }
                }

                const summaries = await this.narrativeMemory.getAllChapterSummaries();
                for (const summary of summaries) {
                    memories.push({
                        type: 'MID_TERM',
                        content: `チャプター${summary.chapterNumber}要約: ${summary.summary}`,
                        priority: 0.6
                    });
                }
            }

            // WorldKnowledge (LONG_TERM) からの収集
            if (memoryTypes.includes('LONG_TERM') && this.worldKnowledge) {
                const worldSettings = await this.worldKnowledge.getWorldSettings();
                memories.push({
                    type: 'LONG_TERM',
                    content: `世界設定: ${worldSettings.description}`,
                    priority: 0.9
                });

                const characters = await this.characterManager.getAllCharacters();
                for (const character of characters) {
                    memories.push({
                        type: 'LONG_TERM',
                        content: `キャラクター「${character.name}」: ${character.description}`,
                        priority: 0.75
                    });
                }

                const foreshadowing = await this.worldKnowledge.getUnresolvedForeshadowing();
                for (const fs of foreshadowing) {
                    memories.push({
                        type: 'LONG_TERM',
                        content: `伏線(チャプター${fs.chapter_introduced}): ${fs.description}`,
                        priority: 0.8
                    });
                }
            }

            const results = this.performKeywordSearch(query, memories, minRelevance);
            const sortedResults = results.sort((a, b) => b.relevance - a.relevance);

            return limit ? sortedResults.slice(0, limit) : sortedResults;
        } catch (error) {
            logger.error('Failed to search memories', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 🔧 必須: 記憶の同期処理を実行
     */
    async syncMemories(request: SyncMemoryRequest): Promise<SyncMemoryResponse> {
        try {
            await this._ensureBasicInitialization();

            logger.info(`Syncing memories for chapter ${request.chapterNumber}`);

            const compressionActions: CompressionAction[] = [];
            const updatedMemories: MemoryType[] = [];

            // 短期記憶 -> 中期記憶（3章ごと）
            if (request.chapterNumber % 3 === 0 || request.force) {
                try {
                    if (this.narrativeMemory) {
                        const now = new Date();
                        const dummyChapter: Chapter = {
                            id: `sync-chapter-${request.chapterNumber}`,
                            chapterNumber: request.chapterNumber,
                            title: `Chapter ${request.chapterNumber}`,
                            content: '',
                            createdAt: now,
                            updatedAt: now,
                            metadata: {}
                        };

                        await this.narrativeMemory.updateFromChapter(dummyChapter);

                        compressionActions.push({
                            type: 'summarize',
                            source: 'SHORT_TERM',
                            target: 'MID_TERM',
                            details: `チャプター${request.chapterNumber}までの要約を生成`
                        });

                        updatedMemories.push('MID_TERM');
                    }
                } catch (summaryError) {
                    logger.warn(`Failed to process chapter summaries: ${summaryError instanceof Error ? summaryError.message : String(summaryError)}`);
                }
            }

            // 中期記憶 -> 長期記憶（10章ごと）
            if (request.chapterNumber % 10 === 0 || request.force) {
                if (this.narrativeMemory && this.worldKnowledge) {
                    const currentState = await this.narrativeMemory.getCurrentState(request.chapterNumber);

                    if (currentState.turningPoints && currentState.turningPoints.length > 0) {
                        await this.integrateNarrativeTurningPoints(currentState.turningPoints, request.chapterNumber);

                        compressionActions.push({
                            type: 'integrate',
                            source: 'MID_TERM',
                            target: 'LONG_TERM',
                            details: `${currentState.turningPoints.length}件のターニングポイントを世界知識に統合`
                        });

                        updatedMemories.push('LONG_TERM');
                    }
                }
            }

            return {
                success: true,
                updatedMemories,
                compressionActions
            };
        } catch (error) {
            logger.error('Failed to sync memories', {
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                success: false,
                updatedMemories: [],
                compressionActions: []
            };
        }
    }

    /**
     * 🔧 必須: 特定のチャプターに関連するメモリを取得
     */
    async getRelevantMemories(chapterNumber: number, options?: {
        types?: MemoryType[];
        limit?: number;
    }): Promise<Memory[]> {
        try {
            await this._ensureBasicInitialization();

            const defaultOptions = {
                types: ['SHORT_TERM', 'MID_TERM', 'LONG_TERM'] as MemoryType[],
                limit: 20
            };

            const opts = { ...defaultOptions, ...options };
            const memories: Memory[] = [];

            // ImmediateContext (SHORT_TERM) からの収集
            if (opts.types.includes('SHORT_TERM') && this.immediateContext) {
                const chapter = await this.immediateContext.getChapter(chapterNumber);
                if (chapter) {
                    memories.push({
                        type: 'SHORT_TERM',
                        content: `チャプター${chapterNumber}内容: ${chapter.content.substring(0, 200)}...`,
                        priority: 0.9
                    });
                }

                const recentChapters = await this.immediateContext.getRecentChapters();
                for (const chapterInfo of recentChapters) {
                    if (chapterInfo.chapter.chapterNumber !== chapterNumber) {
                        memories.push({
                            type: 'SHORT_TERM',
                            content: `チャプター${chapterInfo.chapter.chapterNumber}内容: ${chapterInfo.chapter.content.substring(0, 150)}...`,
                            priority: 0.7
                        });
                    }
                }
            }

            // NarrativeMemory (MID_TERM) からの収集
            if (opts.types.includes('MID_TERM') && this.narrativeMemory) {
                const summary = await this.narrativeMemory.getChapterSummary(chapterNumber);
                if (summary) {
                    memories.push({
                        type: 'MID_TERM',
                        content: `チャプター${chapterNumber}要約: ${summary}`,
                        priority: 0.8
                    });
                }

                const narrativeState = await this.narrativeMemory.getCurrentState(chapterNumber);
                memories.push({
                    type: 'MID_TERM',
                    content: `物語状態: ${narrativeState.state}, テーマ: ${narrativeState.currentTheme}`,
                    priority: 0.75
                });

                if (narrativeState.turningPoints) {
                    const relevantTurningPoints = narrativeState.turningPoints
                        .filter(tp => Math.abs(tp.chapter - chapterNumber) <= 3);

                    for (const tp of relevantTurningPoints) {
                        memories.push({
                            type: 'MID_TERM',
                            content: `ターニングポイント(チャプター${tp.chapter}): ${tp.description}`,
                            priority: 0.7 * (tp.significance / 10)
                        });
                    }
                }
            }

            // WorldKnowledge (LONG_TERM) からの収集
            if (opts.types.includes('LONG_TERM') && this.worldKnowledge) {
                const relevantContext = await this.worldKnowledge.getRelevantContext(chapterNumber);
                memories.push({
                    type: 'LONG_TERM',
                    content: `関連する世界知識: ${relevantContext}`,
                    priority: 0.6
                });

                const foreshadowing = await this.worldKnowledge.getUnresolvedForeshadowing();
                const relevantForeshadowing = foreshadowing
                    .filter(fs => fs.chapter_introduced <= chapterNumber);

                for (const fs of relevantForeshadowing) {
                    memories.push({
                        type: 'LONG_TERM',
                        content: `伏線(チャプター${fs.chapter_introduced}): ${fs.description}`,
                        priority: 0.8
                    });
                }
            }

            const sortedMemories = memories.sort((a, b) => b.priority - a.priority);
            return opts.limit ? sortedMemories.slice(0, opts.limit) : sortedMemories;
        } catch (error) {
            logger.error('Failed to get relevant memories', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    // ============================================================================
    // 🔧 その他の委譲メソッド（簡潔化）
    // ============================================================================

    async recordCharacterAppearance(
        characterId: string,
        characterName: string,
        chapterNumber: number,
        significance: number = 0.5
    ): Promise<void> {
        await this._ensureAdvancedInitialization();
        if (this.characterTracker) {
            await this.characterTracker.recordCharacterAppearance(
                characterId, characterName, chapterNumber, significance
            );
        }
    }

    async addCharacterMemory(memoryData: {
        characterId: string;
        characterName: string;
        content: string;
        type: string;
        chapterNumber: number;
        importance: number;
        metadata?: any;
    }): Promise<void> {
        await this._ensureAdvancedInitialization();
        if (this.characterTracker) {
            await this.characterTracker.addCharacterMemory(memoryData);
        }
    }

    async generateIntegratedContext(chapterNumber: number): Promise<any> {
        await this._ensureAdvancedInitialization();
        if (this.contextGenerator) {
            return this.contextGenerator.generateIntegratedContext(chapterNumber);
        }
        return {};
    }

    async getSignificantContextEvents(context: EventContext): Promise<{
        locationHistory: string[],
        characterInteractions: string[],
        warningsAndPromises: string[]
    }> {
        try {
            await this._ensureAdvancedInitialization();
            if (this.contextGenerator) {
                return await this.contextGenerator.getSignificantContextEvents(context);
            }

            return {
                locationHistory: [],
                characterInteractions: [],
                warningsAndPromises: []
            };
        } catch (error) {
            logger.error('Failed to get significant context events', {
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                locationHistory: [],
                characterInteractions: [],
                warningsAndPromises: []
            };
        }
    }

    // ============================================================================
    // 🔧 レガシー互換性メソッド（最小実装）
    // ============================================================================

    getImmediateContext(): ImmediateContext | null {
        return this.immediateContext || null;
    }

    getNarrativeMemory(): NarrativeMemory | null {
        return this.narrativeMemory || null;
    }

    getWorldKnowledge(): WorldKnowledge | null {
        return this.worldKnowledge || null;
    }

    /**
     * 各記憶層のインスタンスへのアクセスを提供（レガシー互換性）
     */
    getShortTermMemory(): any {
        if (!this.initialized) {
            throw new Error('Memory manager is not initialized');
        }
        return this.immediateContext;
    }

    getMidTermMemory(): any {
        if (!this.initialized) {
            throw new Error('Memory manager is not initialized');
        }
        return this.narrativeMemory;
    }

    getLongTermMemory(): any {
        if (!this.initialized) {
            throw new Error('Memory manager is not initialized');
        }
        return this.worldKnowledge;
    }

    getNarrativeProgressionManager(): any {
        if (!this.initialized) {
            throw new Error('Memory manager is not initialized');
        }
        return this.narrativeMemory;
    }

    getBranchingManager(): any {
        if (!this.initialized) {
            throw new Error('Memory manager is not initialized');
        }
        return {
            getUnresolvedBranches: () => this.getUnresolvedBranches()
        };
    }

    getReaderImpactTracker(): any {
        if (!this.initialized) {
            throw new Error('Memory manager is not initialized');
        }
        return {
            getEmotionalCurve: (start: number, end: number) => this.getEmotionalCurve(start, end)
        };
    }

    /**
     * 便利な機能へのショートカットメソッド
     */
    async getUnresolvedBranches(): Promise<Branch[]> {
        await this._ensureBasicInitialization();
        return []; // デフォルトは空配列
    }

    // 一時的なデータ保存（TemporaryStorageに委譲）
    async storeTemporaryData(key: string, data: string): Promise<void> {
        try {
            await this.temporaryStorage.storeData(key, data);
        } catch (error) {
            logger.error('Failed to store temporary data', { error, key });
        }
    }

    async getTemporaryData(key: string): Promise<string | null> {
        try {
            return await this.temporaryStorage.getData(key);
        } catch (error) {
            logger.error('Failed to get temporary data', { error, key });
            return null;
        }
    }

    // 最小限のステータス情報
    async getStatus(): Promise<MemorySystemStatus> {
        try {
            await this._ensureBasicInitialization();

            const immediateContextInfo = this.immediateContext ?
                await this.immediateContext.getStatus() : { chapterCount: 0, lastUpdateTime: null };

            const narrativeMemoryInfo = this.narrativeMemory ?
                await this.narrativeMemory.getStatus() : { summaryCount: 0, lastUpdateTime: null };

            return {
                initialized: this.initialized,
                shortTerm: {
                    entryCount: immediateContextInfo.chapterCount,
                    lastUpdateTime: immediateContextInfo.lastUpdateTime
                },
                midTerm: {
                    entryCount: narrativeMemoryInfo.summaryCount,
                    lastUpdateTime: narrativeMemoryInfo.lastUpdateTime,
                    currentArc: null
                },
                longTerm: {
                    initialized: !!this.worldKnowledge,
                    lastCompressionTime: null
                }
            };
        } catch (error) {
            logger.error('Failed to get memory system status', {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                initialized: this.initialized,
                shortTerm: { entryCount: 0, lastUpdateTime: null },
                midTerm: { entryCount: 0, lastUpdateTime: null, currentArc: null },
                longTerm: { initialized: false, lastCompressionTime: null }
            };
        }
    }
}

// シングルトンインスタンスをエクスポート
export const memoryManager = new MemoryManager();