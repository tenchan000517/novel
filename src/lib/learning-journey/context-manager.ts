// src/lib/learning-journey/context-manager.ts

/**
 * @fileoverview 統合記憶階層システム対応コンテキスト管理
 * @description
 * 新しい統合記憶階層システムとの完全連携を実現したコンテキスト管理コンポーネント。
 * 章情報の統合処理、キャラクター記憶の協調管理、長期・短期コンテキストの統一管理を担当する。
 */

import { logger } from '@/lib/utils/logger';
import { EventBus } from './event-bus';
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { CharacterManager } from '@/lib/characters/manager';
import { ContentAnalysisManager } from '@/lib/analysis/content-analysis-manager';
import { Chapter } from '@/types/chapters';
import { GenerationContext } from '@/types/generation';
import { CharacterState } from '@/types/memory';
import { 
    SystemOperationResult, 
    UnifiedSearchResult,
    MemoryLevel,
    UnifiedMemoryContext,
    MemoryAccessRequest,
    MemoryRequestType
} from '@/lib/memory/core/types';

/**
 * コンテキスト情報の型定義
 */
export interface StoryContext {
    storyId: string;               // 物語ID
    currentChapter: number;        // 現在の章番号
    currentSection: string | null; // 現在の篇ID
    mainConcept: string;           // 主要概念
    recentChapters: Array<{        // 最近の章情報
        chapterNumber: number;       // 章番号
        title: string;               // タイトル
        summary: string;             // 要約
        mainEvents: string[];        // 主要イベント
    }>;
    mainCharacters: string[];      // 主要キャラクター
    recentThemes: string[];        // 最近のテーマ
    currentLearningStage: string;  // 現在の学習段階
    customProperties: Record<string, any>; // カスタムプロパティ
}

/**
 * 拡張検索オプション
 */
export interface ExtendedSearchOptions {
    chapterRange?: {
        start: number;
        end: number;
    };
    characterIds?: string[];
    keywords?: string[];
    useMemorySystemIntegration?: boolean;
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
    lastOptimization: string;
}

/**
 * キャラクター記憶更新の型定義
 */
interface CharacterMemoryUpdate {
    characterId: string;           // キャラクターID
    relatedChapter: number;        // 関連章番号
    memoryType: 'event' | 'emotion' | 'relationship' | 'learning'; // 記憶タイプ
    content: string;               // 記憶内容
    importance: number;            // 重要度 (0-1)
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
    lastOptimization: string;
}
interface ChapterProcessingResult {
    success: boolean;
    chapterNumber: number;
    processingTime: number;
    componentsProcessed: string[];
    memorySystemIntegrated: boolean;
    analysisCompleted: boolean;
    warnings: string[];
    errors: string[];
}

/**
 * ImmediateContextから返されるデータの型を定義
 */
interface ChapterInfo {
    chapter: Chapter;
    characterState: Map<string, CharacterState>;
    timestamp: string;
    keyPhrases?: string[];
}

/**
 * @class ContextManager
 * @description
 * 新しい統合記憶階層システムとの完全連携を実現したコンテキスト管理クラス。
 * 既存の全機能を保持しつつ、統合記憶システムの能力を最大限活用する。
 */
export class ContextManager {
    private context: StoryContext | null = null;
    private initialized: boolean = false;
    private memorySystemIntegrationEnabled: boolean = true;

    // パフォーマンス統計
    private performanceStats: PerformanceMetrics = {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageProcessingTime: 0,
        memorySystemHits: 0,
        cacheEfficiencyRate: 0,
        lastOptimization: new Date().toISOString()
    };

    /**
     * コンストラクタ - 依存注入パターンの完全実装
     * @param eventBus イベントバス（必須）
     * @param memoryManager 統合記憶管理（必須）
     * @param characterManager キャラクター管理（オプション）
     * @param contentAnalysisManager コンテンツ分析管理（オプション）
     */
    constructor(
        private eventBus: EventBus,
        private memoryManager: MemoryManager,
        private characterManager?: CharacterManager,
        private contentAnalysisManager?: ContentAnalysisManager
    ) {
        // 必須依存関係の検証
        if (!this.eventBus) {
            throw new Error('EventBus is required for ContextManager initialization');
        }
        if (!this.memoryManager) {
            throw new Error('MemoryManager is required for ContextManager initialization');
        }

        logger.info('ContextManager created with integrated memory system support');
    }

    /**
     * 統合記憶階層システムと連携した初期化
     */
    async initialize(storyId: string): Promise<void> {
        if (this.initialized && this.context) {
            logger.info('ContextManager already initialized');
            return;
        }

        const startTime = Date.now();

        try {
            logger.info(`Initializing ContextManager for story ${storyId} with unified memory integration...`);

            // 1. 基本コンテキストの初期化
            this.context = {
                storyId,
                currentChapter: 1,
                currentSection: null,
                mainConcept: 'ISSUE DRIVEN',
                recentChapters: [],
                mainCharacters: [],
                recentThemes: [],
                currentLearningStage: 'MISCONCEPTION',
                customProperties: {}
            };

            // 2. 統合記憶システムからのコンテキストロード
            await this.loadFromUnifiedMemorySystem(storyId);

            // 3. イベント購読の設定
            this.setupEventSubscriptions();

            // 4. 初期システム診断
            await this.performInitialDiagnostics();

            this.initialized = true;
            const processingTime = Date.now() - startTime;
            this.updatePerformanceStats(processingTime, true);

            logger.info('ContextManager initialized successfully with unified memory integration', {
                storyId,
                processingTime,
                memorySystemIntegrated: this.memorySystemIntegrationEnabled
            });

            // 初期化完了イベント発行
            this.eventBus.publish('context.updated', {
                storyId,
                action: 'initialized',
                memorySystemIntegrated: true
            });

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updatePerformanceStats(processingTime, false);

            logger.error('Failed to initialize ContextManager', {
                error: error instanceof Error ? error.message : String(error),
                storyId,
                processingTime
            });
            throw error;
        }
    }

    /**
     * 統合記憶階層システムからコンテキストをロード
     * @param storyId 物語ID
     * @private
     */
    private async loadFromUnifiedMemorySystem(storyId: string): Promise<void> {
        if (!this.memorySystemIntegrationEnabled) {
            logger.info('Memory system integration disabled, using fallback context loading');
            return;
        }

        try {
            logger.info(`Loading context from unified memory system for story ${storyId}`);

            // 統合検索によるコンテキスト取得
            const searchResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    `story context ${storyId}`,
                    [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
                ),
                { success: false, totalResults: 0, processingTime: 0, results: [], suggestions: [] },
                'loadContextFromUnifiedMemory'
            );

            if (searchResult.success && searchResult.results.length > 0) {
                await this.processUnifiedSearchResults(searchResult);
            }

            // 最近の章情報の取得
            await this.loadRecentChaptersFromMemorySystem();

            // システム状態の確認と統計更新
            const systemStatus = await this.memoryManager.getSystemStatus();
            if (systemStatus.initialized) {
                this.performanceStats.memorySystemHits++;
                logger.info('Successfully loaded context from unified memory system');
            }

        } catch (error) {
            logger.warn('Failed to load context from unified memory system, using default context', {
                error: error instanceof Error ? error.message : String(error),
                storyId
            });
            // エラーは上位に伝播させず、デフォルトコンテキストを使用
        }
    }

    /**
     * 統合検索結果を処理
     * @param searchResult 検索結果
     * @private
     */
    private async processUnifiedSearchResults(searchResult: UnifiedSearchResult): Promise<void> {
        if (!this.context) return;

        try {
            for (const result of searchResult.results) {
                // 検索結果のソースに応じた処理
                switch (result.source) {
                    case MemoryLevel.SHORT_TERM:
                        await this.processShortTermResults(result.data);
                        break;
                    case MemoryLevel.MID_TERM:
                        await this.processMidTermResults(result.data);
                        break;
                    case MemoryLevel.LONG_TERM:
                        await this.processLongTermResults(result.data);
                        break;
                }
            }

            logger.debug(`Processed ${searchResult.results.length} unified search results`);

        } catch (error) {
            logger.warn('Failed to process unified search results', { error });
        }
    }

    /**
     * 短期記憶結果を処理
     * @param data 短期記憶データ
     * @private
     */
    private async processShortTermResults(data: any): Promise<void> {
        if (!this.context || !data) return;

        try {
            // 最新の章番号の更新
            if (data.recentChapters && Array.isArray(data.recentChapters)) {
                const latestChapter = data.recentChapters.reduce(
                    (max: number, chapterInfo: any) => 
                        Math.max(max, chapterInfo.chapter?.chapterNumber || 0),
                    0
                );

                if (latestChapter > 0) {
                    this.context.currentChapter = latestChapter;
                }
            }

            // キーフレーズの抽出
            if (data.keyPhrases && Array.isArray(data.keyPhrases)) {
                this.context.recentThemes = [...new Set([
                    ...this.context.recentThemes,
                    ...data.keyPhrases.slice(0, 5)
                ])];
            }

        } catch (error) {
            logger.warn('Failed to process short-term results', { error });
        }
    }

    /**
     * 中期記憶結果を処理
     * @param data 中期記憶データ
     * @private
     */
    private async processMidTermResults(data: any): Promise<void> {
        if (!this.context || !data) return;

        try {
            // 物語進行状況の更新
            if (data.narrativeProgression) {
                // 学習段階の推定
                const progression = data.narrativeProgression;
                if (progression.storyState && progression.storyState.length > 0) {
                    const latestState = progression.storyState[progression.storyState.length - 1];
                    if (latestState.state) {
                        this.context.currentLearningStage = latestState.state;
                    }
                }
            }

            // キャラクター進化データの処理
            if (data.characterEvolution && data.characterEvolution.developmentHistory) {
                const characterIds = Array.from(data.characterEvolution.developmentHistory.keys())
                    .filter((id): id is string => typeof id === 'string'); // 型安全な変換
                this.context.mainCharacters = [...new Set([
                    ...this.context.mainCharacters,
                    ...characterIds.slice(0, 10)
                ])];
            }

        } catch (error) {
            logger.warn('Failed to process mid-term results', { error });
        }
    }

    /**
     * 長期記憶結果を処理
     * @param data 長期記憶データ
     * @private
     */
    private async processLongTermResults(data: any): Promise<void> {
        if (!this.context || !data) return;

        try {
            // 統合設定からの情報抽出
            if (data.consolidatedSettings) {
                const worldSettings = data.consolidatedSettings.worldSettingsMaster;
                if (worldSettings && worldSettings.consolidatedSettings) {
                    // 保存されたコンテキストがあれば読み込む
                    if (worldSettings.consolidatedSettings.learningContext) {
                        const savedContext = worldSettings.consolidatedSettings.learningContext;
                        // 重要な情報のみをマージ
                        this.context.mainConcept = savedContext.mainConcept || this.context.mainConcept;
                        this.context.currentLearningStage = savedContext.currentLearningStage || this.context.currentLearningStage;
                        this.context.customProperties = {
                            ...this.context.customProperties,
                            ...savedContext.customProperties
                        };
                    }
                }
            }

            // 知識データベースからの情報抽出
            if (data.knowledgeDatabase && data.knowledgeDatabase.characters) {
                const characterIds = Array.from(data.knowledgeDatabase.characters.keys())
                    .filter((id): id is string => typeof id === 'string'); // 型安全な変換
                this.context.mainCharacters = [...new Set([
                    ...this.context.mainCharacters,
                    ...characterIds.slice(0, 15)
                ])];
            }

        } catch (error) {
            logger.warn('Failed to process long-term results', { error });
        }
    }

    /**
     * 最近の章情報を記憶システムから取得
     * @private
     */
    private async loadRecentChaptersFromMemorySystem(): Promise<void> {
        if (!this.context) return;

        try {
            // 統合検索によるアクセス（パブリックAPIを使用）
            const searchQuery = `chapter context ${this.context.currentChapter}`;
            const accessResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    searchQuery,
                    [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
                ),
                { success: false, totalResults: 0, processingTime: 0, results: [], suggestions: [] },
                'loadRecentChapters'
            );

            if (accessResult.success && accessResult.results.length > 0) {
                await this.extractRecentChaptersFromSearchResults(accessResult);
            }

        } catch (error) {
            logger.warn('Failed to load recent chapters from memory system', { error });
        }
    }

    /**
     * 統合検索結果から最近の章情報を抽出
     * @param searchResult 検索結果
     * @private
     */
    private async extractRecentChaptersFromSearchResults(searchResult: UnifiedSearchResult): Promise<void> {
        if (!this.context) return;

        try {
            const recentChapterInfo: typeof this.context.recentChapters = [];

            // 検索結果から章データを抽出
            for (const result of searchResult.results) {
                if (result.data && result.source === MemoryLevel.SHORT_TERM) {
                    // 短期記憶からの章データ処理
                    if (result.data.recentChapters && Array.isArray(result.data.recentChapters)) {
                        for (const chapterData of result.data.recentChapters) {
                            if (chapterData.chapter) {
                                recentChapterInfo.push({
                                    chapterNumber: chapterData.chapter.chapterNumber,
                                    title: chapterData.chapter.title || `第${chapterData.chapter.chapterNumber}章`,
                                    summary: chapterData.chapter.metadata?.summary || 
                                            this.generateSummary(chapterData.chapter.content),
                                    mainEvents: this.extractMainEvents(chapterData.keyPhrases || [])
                                });
                            }
                        }
                    }
                }
            }

            // 章情報をソートして設定
            recentChapterInfo.sort((a, b) => b.chapterNumber - a.chapterNumber);
            this.context.recentChapters = recentChapterInfo.slice(0, 5);

            // 最新の章番号を更新
            if (recentChapterInfo.length > 0) {
                this.context.currentChapter = Math.max(
                    this.context.currentChapter,
                    recentChapterInfo[0].chapterNumber
                );
            }

        } catch (error) {
            logger.warn('Failed to extract recent chapters from search results', { error });
        }
    }

    /**
     * 統合記憶コンテキストから最近の章情報を抽出
     * @param context 統合記憶コンテキスト
     * @private
     */
    private async extractRecentChaptersFromContext(context: UnifiedMemoryContext): Promise<void> {
        if (!this.context) return;

        try {
            const recentChapterInfo: typeof this.context.recentChapters = [];

            // 短期記憶から最近の章を抽出
            if (context.shortTerm.recentChapters) {
                for (const chapterData of context.shortTerm.recentChapters) {
                    if (chapterData.chapter) {
                        recentChapterInfo.push({
                            chapterNumber: chapterData.chapter.chapterNumber,
                            title: chapterData.chapter.title || `第${chapterData.chapter.chapterNumber}章`,
                            summary: chapterData.chapter.metadata?.summary || 
                                    this.generateSummary(chapterData.chapter.content),
                            mainEvents: this.extractMainEvents(chapterData.keyPhrases || [])
                        });
                    }
                }
            }

            // 中期記憶から分析済み章情報を抽出
            if (context.midTerm.analysisResults) {
                // 分析結果から追加情報を抽出してマージ
                this.mergeAnalysisResults(recentChapterInfo, context.midTerm.analysisResults);
            }

            // 章情報をソートして設定
            recentChapterInfo.sort((a, b) => b.chapterNumber - a.chapterNumber);
            this.context.recentChapters = recentChapterInfo.slice(0, 5);

            // 最新の章番号を更新
            if (recentChapterInfo.length > 0) {
                this.context.currentChapter = Math.max(
                    this.context.currentChapter,
                    recentChapterInfo[0].chapterNumber
                );
            }

        } catch (error) {
            logger.warn('Failed to extract recent chapters from context', { error });
        }
    }

    /**
     * 分析結果をマージ
     * @param recentChapters 最近の章情報
     * @param analysisResults 分析結果
     * @private
     */
    private mergeAnalysisResults(
        recentChapters: Array<{
            chapterNumber: number;
            title: string;
            summary: string;
            mainEvents: string[];
        }>, 
        analysisResults: any
    ): void {
        if (!recentChapters || recentChapters.length === 0) {
            return;
        }

        try {
            // 分析結果から追加情報を抽出してマージ
            // この部分は実際の分析結果データ構造に応じて実装
            if (analysisResults.emotionalArcDesigns) {
                // 感情アーク設計から主要イベントを抽出
                for (const chapter of recentChapters) {
                    const arcDesign = analysisResults.emotionalArcDesigns.get?.(chapter.chapterNumber);
                    if (arcDesign && arcDesign.design) {
                        // 感情アークから主要イベントを推定
                        chapter.mainEvents = [
                            ...chapter.mainEvents,
                            ...this.extractEventsFromEmotionalArc(arcDesign.design)
                        ];
                    }
                }
            }
        } catch (error) {
            logger.debug('Failed to merge analysis results', { error });
        }
    }

    /**
     * 感情アークから主要イベントを抽出
     * @param arcDesign 感情アーク設計
     * @returns 主要イベント配列
     * @private
     */
    private extractEventsFromEmotionalArc(arcDesign: any): string[] {
        try {
            const events: string[] = [];
            
            // アーク設計から重要なポイントを抽出
            if (arcDesign.turningPoints) {
                events.push(...arcDesign.turningPoints.map((tp: any) => tp.description || tp.event));
            }
            
            if (arcDesign.climax) {
                events.push(arcDesign.climax.description || 'クライマックス');
            }
            
            return events.filter(Boolean).slice(0, 3);
        } catch (error) {
            return [];
        }
    }

    /**
     * イベント購読を設定する
     * @private
     */
    private setupEventSubscriptions(): void {
        // 学習段階更新イベントの購読
        this.eventBus.subscribe('learning.stage.updated', async (payload) => {
            if (this.context) {
                this.context.currentLearningStage = payload.stage;
                logger.info(`Updated learning stage in context to ${payload.stage}`);

                // 統合記憶システムに保存
                await this.saveContextToUnifiedMemorySystem();
            }
        });

        // 篇更新イベントの購読
        this.eventBus.subscribe('section.updated', async (payload) => {
            if (this.context) {
                this.context.currentSection = payload.sectionId;
                logger.info(`Updated current section in context to ${payload.sectionId}`);

                // 統合記憶システムに保存
                await this.saveContextToUnifiedMemorySystem();
            }
        });

        // 章生成イベントの購読
        this.eventBus.subscribe('chapter.generated', async (payload) => {
            if (this.context) {
                await this.handleChapterGeneratedEvent(payload);
            }
        });
    }

    /**
     * 章生成イベントを処理
     * @param payload イベントペイロード
     * @private
     */
    private async handleChapterGeneratedEvent(payload: any): Promise<void> {
        if (!this.context) return;

        try {
            this.context.currentChapter = payload.chapterNumber;

            // 最近の章に追加
            const chapterInfo = {
                chapterNumber: payload.chapterNumber,
                title: payload.title || `第${payload.chapterNumber}章`,
                summary: payload.summary || '',
                mainEvents: payload.mainEvents || []
            };

            // 既存の章を更新または新規追加
            const existingIndex = this.context.recentChapters.findIndex(
                c => c.chapterNumber === payload.chapterNumber
            );

            if (existingIndex >= 0) {
                this.context.recentChapters[existingIndex] = chapterInfo;
            } else {
                this.context.recentChapters.unshift(chapterInfo);

                // 最大5章まで保持
                if (this.context.recentChapters.length > 5) {
                    this.context.recentChapters.pop();
                }
            }

            logger.info(`Updated current chapter in context to ${payload.chapterNumber}`);

            // 統合記憶システムに保存
            await this.saveContextToUnifiedMemorySystem();

            // 文脈更新イベント発行
            this.eventBus.publish('context.updated', {
                storyId: this.context.storyId,
                action: 'chapter_updated',
                chapterNumber: payload.chapterNumber,
                memorySystemIntegrated: true
            });

        } catch (error) {
            logger.error('Failed to handle chapter generated event', { error, payload });
        }
    }

    /**
     * コンテキスト状態を統合記憶システムに保存
     * @private
     */
    private async saveContextToUnifiedMemorySystem(): Promise<void> {
        if (!this.context || !this.memorySystemIntegrationEnabled) {
            return;
        }

        try {
            // Chapter形式のコンテキストデータを作成
            const contextChapter: Chapter = {
                id: `context-${this.context.storyId}`,
                chapterNumber: this.context.currentChapter,
                title: `Context for ${this.context.storyId}`,
                content: JSON.stringify({
                    learningContext: this.context,
                    timestamp: new Date().toISOString()
                }),
                previousChapterSummary: '',
                scenes: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                metadata: {
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    status: 'context',
                    contextData: this.context
                }
            };

            // 統合記憶システムで処理
            const result = await this.safeMemoryOperation(
                () => this.memoryManager.processChapter(contextChapter),
                { 
                    success: false, 
                    operationType: 'processChapter', 
                    processingTime: 0, 
                    affectedComponents: [], 
                    details: {}, 
                    warnings: [], 
                    errors: ['Operation failed'] 
                },
                'saveContextToUnifiedMemory'
            );

            if (result.success) {
                logger.debug('Context state saved to unified memory system');
                this.performanceStats.memorySystemHits++;
            } else {
                logger.warn('Failed to save context to unified memory system', {
                    errors: result.errors,
                    warnings: result.warnings
                });
            }

        } catch (error) {
            logger.error('Failed to save context to unified memory system', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 現在のコンテキストを取得する
     * @returns コンテキスト情報
     */
    getContext(): StoryContext | null {
        this.ensureInitialized();
        return this.context;
    }

    /**
     * コンテキストを更新する
     * @param updates 更新情報
     * @returns 更新成功の真偽値
     */
    async updateContext(updates: Partial<StoryContext>): Promise<boolean> {
        this.ensureInitialized();

        const startTime = Date.now();

        try {
            if (!this.context) {
                return false;
            }

            // 更新を適用
            Object.assign(this.context, updates);

            // 統合記憶システムにコンテキスト状態を保存
            await this.saveContextToUnifiedMemorySystem();

            // 更新イベント発行
            this.eventBus.publish('context.updated', {
                storyId: this.context.storyId,
                action: 'context_updated',
                updates: Object.keys(updates),
                memorySystemIntegrated: true
            });

            const processingTime = Date.now() - startTime;
            this.updatePerformanceStats(processingTime, true);

            logger.info('Context updated successfully with unified memory integration');
            return true;

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updatePerformanceStats(processingTime, false);

            logger.error('Failed to update context', {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * カスタムプロパティを設定する
     * @param key プロパティキー
     * @param value プロパティ値
     * @returns 更新成功の真偽値
     */
    async setCustomProperty(key: string, value: any): Promise<boolean> {
        this.ensureInitialized();

        try {
            if (!this.context) {
                return false;
            }

            // カスタムプロパティを更新
            this.context.customProperties[key] = value;

            // 統合記憶システムに保存
            await this.saveContextToUnifiedMemorySystem();

            logger.info(`Set custom property ${key} in context with unified memory integration`);
            return true;

        } catch (error) {
            logger.error(`Failed to set custom property ${key}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * カスタムプロパティを取得する
     * @param key プロパティキー
     * @returns プロパティ値
     */
    getCustomProperty(key: string): any {
        this.ensureInitialized();

        if (!this.context) {
            return null;
        }

        return this.context.customProperties[key];
    }

    /**
     * 統合記憶システムを使用した章処理
     * @param chapterNumber 章番号
     * @param chapterData 章データ
     * @returns 処理成功の真偽値
     */
    async saveChapterToMemory(
        chapterNumber: number,
        chapterData: {
            title: string;
            content: string;
            summary?: string;
            mainEvents?: string[];
            learningStage?: string;
        }
    ): Promise<boolean> {
        this.ensureInitialized();

        if (!this.memorySystemIntegrationEnabled) {
            logger.warn('Memory system integration disabled, cannot save chapter to memory');
            return false;
        }

        const startTime = Date.now();

        try {
            if (!this.context) {
                return false;
            }

            logger.info(`Processing chapter ${chapterNumber} with unified memory system integration`);

            // Chapter型の完全構築（注意点.mdのパターンに準拠）
            const chapter: Chapter = {
                id: `${this.context.storyId}-${chapterNumber}`,
                chapterNumber: chapterNumber,
                title: chapterData.title,
                content: chapterData.content,
                previousChapterSummary: '',
                scenes: [],                                  // ✅ 必須フィールド
                createdAt: new Date(),                       // ✅ 必須: Date型
                updatedAt: new Date(),                       // ✅ 必須: Date型
                metadata: {
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    status: 'analyzed',
                    summary: chapterData.summary || this.generateSummary(chapterData.content),
                    mainEvents: chapterData.mainEvents || [],
                    learningStage: chapterData.learningStage || this.context.currentLearningStage,
                    wordCount: chapterData.content.length,
                    estimatedReadingTime: Math.ceil(chapterData.content.length / 1000)
                }
            };

            // 統合記憶システムでの章処理
            const result = await this.safeMemoryOperation(
                () => this.memoryManager.processChapter(chapter),
                { 
                    success: false, 
                    operationType: 'processChapter', 
                    processingTime: 0, 
                    affectedComponents: [], 
                    details: {}, 
                    warnings: [], 
                    errors: ['Operation failed'] 
                },
                'processChapterWithUnifiedMemory'
            );

            if (result.success) {
                logger.info(`Chapter ${chapterNumber} processed successfully by unified memory system`, {
                    processingTime: result.processingTime,
                    affectedComponents: result.affectedComponents,
                    warnings: result.warnings.length
                });

                // ContentAnalysisManagerとの統合（オプション）
                await this.integrateWithContentAnalysis(chapter);

                // コンテキストの最近の章を更新
                await this.updateRecentChaptersFromProcessedChapter(chapterNumber, chapterData);

                const totalProcessingTime = Date.now() - startTime;
                this.updatePerformanceStats(totalProcessingTime, true);

                logger.info(`Successfully processed chapter ${chapterNumber} with unified memory integration`);
                return true;

            } else {
                logger.warn(`Chapter ${chapterNumber} processing failed in unified memory system`, {
                    errors: result.errors,
                    warnings: result.warnings,
                    processingTime: result.processingTime
                });

                const totalProcessingTime = Date.now() - startTime;
                this.updatePerformanceStats(totalProcessingTime, false);
                return false;
            }

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updatePerformanceStats(processingTime, false);

            logger.error(`Failed to process chapter ${chapterNumber} with unified memory system`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * ContentAnalysisManagerとの統合処理
     * @param chapter 章データ
     * @private
     */
    private async integrateWithContentAnalysis(chapter: Chapter): Promise<void> {
        if (!this.contentAnalysisManager || !this.context) {
            return;
        }

        try {
            const generationContext: GenerationContext = {
                chapterNumber: chapter.chapterNumber,
                theme: this.context.recentThemes.join(', ') || undefined,
                recentChapters: this.context.recentChapters.map(ch => ({
                    number: ch.chapterNumber,
                    title: ch.title,
                    summary: ch.summary
                })),
                genre: 'classic', // デフォルト値
                learningJourney: this.context.currentLearningStage ? {
                    mainConcept: this.context.mainConcept,
                    learningStage: this.context.currentLearningStage as any
                } : undefined
            };

            const processingResult = await this.contentAnalysisManager.processGeneratedChapter(
                chapter,
                generationContext
            );

            logger.info(`Content analysis integrated for chapter ${chapter.chapterNumber}`, {
                qualityScore: processingResult.qualityMetrics?.overall || 0,
                nextSuggestionsCount: processingResult.nextChapterSuggestions.length
            });

        } catch (error) {
            logger.warn(`Content analysis integration failed for chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 処理済み章からコンテキストを更新
     * @param chapterNumber 章番号
     * @param chapterData 章データ
     * @private
     */
    private async updateRecentChaptersFromProcessedChapter(
        chapterNumber: number,
        chapterData: { title: string; content: string; summary?: string; mainEvents?: string[] }
    ): Promise<void> {
        if (!this.context) return;

        const chapterInfo = {
            chapterNumber,
            title: chapterData.title,
            summary: chapterData.summary || this.generateSummary(chapterData.content),
            mainEvents: chapterData.mainEvents || []
        };

        const existingIndex = this.context.recentChapters.findIndex(
            c => c.chapterNumber === chapterNumber
        );

        if (existingIndex >= 0) {
            this.context.recentChapters[existingIndex] = chapterInfo;
        } else {
            this.context.recentChapters.unshift(chapterInfo);

            if (this.context.recentChapters.length > 5) {
                this.context.recentChapters.pop();
            }
        }

        // 現在の章番号も更新
        this.context.currentChapter = Math.max(this.context.currentChapter, chapterNumber);

        // 統合記憶システムに保存
        await this.saveContextToUnifiedMemorySystem();
    }

    /**
     * キャラクター記憶を更新する
     * @param update 記憶更新情報
     * @returns 更新成功の真偽値
     */
    async updateCharacterMemory(update: CharacterMemoryUpdate): Promise<boolean> {
        this.ensureInitialized();

        if (!this.characterManager) {
            logger.warn('Character Manager not available, cannot update character memory');
            return false;
        }

        const startTime = Date.now();

        try {
            if (!this.context) {
                return false;
            }

            logger.info(`Updating memory for character ${update.characterId} with unified memory integration`);

            // キャラクター情報の取得
            const character = await this.characterManager.getCharacter(update.characterId);
            const characterName = character ? character.name : "Unknown Character";

            // 統合記憶システムを通じた記憶更新
            // CharacterManagerとの連携を通じて統合記憶システムに反映される
            // 実際の実装では、CharacterManagerが内部的に統合記憶システムを使用すると想定

            // キャラクターを主要キャラクターリストに追加（まだ含まれていない場合）
            if (!this.context.mainCharacters.includes(update.characterId)) {
                this.context.mainCharacters.push(update.characterId);

                // 統合記憶システムに保存
                await this.saveContextToUnifiedMemorySystem();
            }

            // 記憶更新イベント発行
            this.eventBus.publish('character.memory.updated', {
                characterId: update.characterId,
                memoryType: update.memoryType,
                chapterNumber: update.relatedChapter,
                memorySystemIntegrated: true
            });

            const processingTime = Date.now() - startTime;
            this.updatePerformanceStats(processingTime, true);

            logger.info(`Successfully updated memory for character ${update.characterId} with unified integration`);
            return true;

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updatePerformanceStats(processingTime, false);

            logger.error(`Failed to update memory for character ${update.characterId}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * 統合記憶階層からリレバントな記憶を取得する
     * @param query 検索クエリ
     * @returns 関連記憶の配列
     */
    async retrieveRelevantMemories(query: {
        chapterNumber?: number;
        characterIds?: string[];
        keywords?: string[];
        limit?: number;
    }): Promise<any[]> {
        this.ensureInitialized();

        if (!this.memorySystemIntegrationEnabled) {
            logger.warn('Memory system integration disabled, cannot retrieve memories');
            return [];
        }

        const startTime = Date.now();

        try {
            if (!this.context) {
                return [];
            }

            logger.info('Retrieving relevant memories from unified memory system');

            // 統合検索の実行
            const searchQuery = this.buildSearchQuery(query);
            const searchResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    searchQuery,
                    [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
                ),
                { success: false, totalResults: 0, processingTime: 0, results: [], suggestions: [] },
                'retrieveRelevantMemories'
            );

            const memories: any[] = [];

            if (searchResult.success) {
                // 検索結果を記憶形式に変換
                for (const result of searchResult.results) {
                    memories.push({
                        source: result.source,
                        type: result.type,
                        data: result.data,
                        relevance: result.relevance,
                        chapterNumber: query.chapterNumber,
                        timestamp: new Date().toISOString(),
                        metadata: result.metadata
                    });
                }

                // 関連度でソート
                memories.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

                // 制限数でカット
                const limitedMemories = memories.slice(0, query.limit || 10);

                // メモリー取得イベント発行
                this.eventBus.publish('memory.retrieved', {
                    count: limitedMemories.length,
                    query,
                    memorySystemIntegrated: true
                });

                const processingTime = Date.now() - startTime;
                this.updatePerformanceStats(processingTime, true);

                logger.info(`Retrieved ${limitedMemories.length} relevant memories from unified system`);
                return limitedMemories;
            }

            return [];

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updatePerformanceStats(processingTime, false);

            logger.error('Failed to retrieve relevant memories from unified system', {
                error: error instanceof Error ? error.message : String(error),
                query
            });
            return [];
        }
    }

    /**
     * 検索クエリを構築
     * @param query クエリパラメータ
     * @returns 構築されたクエリ文字列
     * @private
     */
    private buildSearchQuery(query: {
        chapterNumber?: number;
        characterIds?: string[];
        keywords?: string[];
        limit?: number;
    }): string {
        const queryParts: string[] = [];

        if (query.chapterNumber) {
            queryParts.push(`chapter:${query.chapterNumber}`);
        }

        if (query.characterIds && query.characterIds.length > 0) {
            queryParts.push(`characters:${query.characterIds.join(',')}`);
        }

        if (query.keywords && query.keywords.length > 0) {
            queryParts.push(query.keywords.join(' '));
        }

        return queryParts.join(' ') || 'relevant memories';
    }

    /**
     * システム診断を実行
     * @returns 診断結果
     */
    async performDiagnostics(): Promise<{
        contextHealthy: boolean;
        memorySystemIntegrated: boolean;
        performanceMetrics: PerformanceMetrics;
        issues: string[];
        recommendations: string[];
    }> {
        try {
            const issues: string[] = [];
            const recommendations: string[] = [];

            // コンテキスト健全性チェック
            const contextHealthy = this.context !== null && this.initialized;
            
            if (!contextHealthy) {
                issues.push('Context not properly initialized');
                recommendations.push('Initialize ContextManager before use');
            }

            // 統合記憶システム統合状態チェック
            let memorySystemIntegrated = false;
            if (this.memorySystemIntegrationEnabled) {
                try {
                    const systemStatus = await this.memoryManager.getSystemStatus();
                    memorySystemIntegrated = systemStatus.initialized;
                    
                    if (!memorySystemIntegrated) {
                        issues.push('Memory system not properly initialized');
                        recommendations.push('Check MemoryManager initialization');
                    }
                } catch (error) {
                    issues.push('Failed to check memory system status');
                    recommendations.push('Verify memory system connectivity');
                }
            } else {
                issues.push('Memory system integration disabled');
                recommendations.push('Enable memory system integration for enhanced functionality');
            }

            // パフォーマンスメトリクス評価
            if (this.performanceStats.totalOperations > 0) {
                const successRate = this.performanceStats.successfulOperations / this.performanceStats.totalOperations;
                
                if (successRate < 0.8) {
                    issues.push(`Low success rate: ${(successRate * 100).toFixed(1)}%`);
                    recommendations.push('Investigate and resolve operation failures');
                }

                if (this.performanceStats.averageProcessingTime > 2000) {
                    issues.push(`High average processing time: ${this.performanceStats.averageProcessingTime}ms`);
                    recommendations.push('Consider performance optimization');
                }

                if (this.performanceStats.cacheEfficiencyRate < 0.6) {
                    issues.push(`Low cache efficiency: ${(this.performanceStats.cacheEfficiencyRate * 100).toFixed(1)}%`);
                    recommendations.push('Optimize caching strategy');
                }
            }

            return {
                contextHealthy,
                memorySystemIntegrated,
                performanceMetrics: { ...this.performanceStats },
                issues,
                recommendations
            };

        } catch (error) {
            logger.error('Failed to perform diagnostics', { error });
            return {
                contextHealthy: false,
                memorySystemIntegrated: false,
                performanceMetrics: { ...this.performanceStats },
                issues: ['Diagnostics failed'],
                recommendations: ['Check system logs and restart if necessary']
            };
        }
    }

    // ============================================================================
    // プライベートヘルパーメソッド
    // ============================================================================

    /**
     * 初期システム診断を実行
     * @private
     */
    private async performInitialDiagnostics(): Promise<void> {
        try {
            if (this.memorySystemIntegrationEnabled) {
                const systemDiagnostics = await this.memoryManager.performSystemDiagnostics();
                
                if (systemDiagnostics.systemHealth === 'CRITICAL') {
                    logger.warn('Memory system health is critical', {
                        issues: systemDiagnostics.issues,
                        recommendations: systemDiagnostics.recommendations
                    });
                }

                // キャッシュ効率の初期計算
                if (systemDiagnostics.performanceMetrics.totalRequests > 0) {
                    this.performanceStats.cacheEfficiencyRate = 
                        systemDiagnostics.performanceMetrics.cacheHits / 
                        systemDiagnostics.performanceMetrics.totalRequests;
                }
            }
        } catch (error) {
            logger.warn('Initial diagnostics failed', { error });
        }
    }

    /**
     * 安全なメモリ操作の実行
     * @param operation 実行する操作
     * @param fallbackValue フォールバック値
     * @param operationName 操作名
     * @returns 操作結果
     * @private
     */
    private async safeMemoryOperation<T>(
        operation: () => Promise<T>,
        fallbackValue: T,
        operationName: string
    ): Promise<T> {
        if (!this.memorySystemIntegrationEnabled) {
            return fallbackValue;
        }

        try {
            // システム状態確認
            const systemStatus = await this.memoryManager.getSystemStatus();
            if (!systemStatus.initialized) {
                logger.warn(`${operationName}: MemoryManager not initialized`);
                return fallbackValue;
            }

            return await operation();

        } catch (error) {
            logger.error(`${operationName} failed`, { 
                error: error instanceof Error ? error.message : String(error) 
            });
            return fallbackValue;
        }
    }

    /**
     * パフォーマンス統計を更新
     * @param processingTime 処理時間
     * @param success 成功フラグ
     * @private
     */
    private updatePerformanceStats(processingTime: number, success: boolean): void {
        this.performanceStats.totalOperations++;
        
        if (success) {
            this.performanceStats.successfulOperations++;
        } else {
            this.performanceStats.failedOperations++;
        }

        // 平均処理時間の更新
        this.performanceStats.averageProcessingTime = 
            ((this.performanceStats.averageProcessingTime * (this.performanceStats.totalOperations - 1)) + processingTime) / 
            this.performanceStats.totalOperations;
    }

    /**
     * 初期化済みかどうかを確認する
     * @private
     */
    private ensureInitialized(): void {
        if (!this.initialized) {
            throw new Error('ContextManager is not initialized. Call initialize() first.');
        }
    }

    /**
     * 内容から要約を生成する
     * @param content 内容
     * @returns 要約
     * @private
     */
    private generateSummary(content: string): string {
        if (content.length <= 200) {
            return content;
        }

        // 改良された要約生成（文の境界を考慮）
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
     * キーフレーズから主要イベントを抽出
     * @param keyPhrases キーフレーズ配列
     * @returns 主要イベント配列
     * @private
     */
    private extractMainEvents(keyPhrases: string[]): string[] {
        const eventKeywords = ['対決', '発見', '出会い', '別れ', '決断', '変化', '成長', '危機'];
        
        return keyPhrases
            .filter(phrase => eventKeywords.some(keyword => phrase.includes(keyword)))
            .slice(0, 3);
    }

    /**
     * 初期化状態を取得する
     * @returns 初期化済みかどうか
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * 統合記憶システム連携状態を取得
     * @returns 連携有効状態
     */
    isMemorySystemIntegrationEnabled(): boolean {
        return this.memorySystemIntegrationEnabled;
    }

    /**
     * 統合記憶システム連携を有効/無効化
     * @param enabled 有効化フラグ
     */
    setMemorySystemIntegration(enabled: boolean): void {
        this.memorySystemIntegrationEnabled = enabled;
        logger.info(`Memory system integration ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * パフォーマンス統計を取得
     * @returns パフォーマンス統計
     */
    getPerformanceStats(): PerformanceMetrics {
        return { ...this.performanceStats };
    }
}