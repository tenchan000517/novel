// src/lib/learning-journey/context-manager.ts

/**
 * @fileoverview コンテキスト管理
 * @description
 * 記憶階層との連携と状態管理を行うコンポーネント。
 * 章情報の保存・取得、キャラクター記憶の連携、長期・短期コンテキストの管理を担当する。
 */

import { logger } from '@/lib/utils/logger';
import { EventBus } from './event-bus';
import { MemoryManager, memoryManager } from '@/lib/memory/manager';
import { CharacterManager } from '@/lib/characters/manager';
import { ContentAnalysisManager } from '@/lib/analysis/content-analysis-manager'; // シングルトンを削除
import { Chapter } from '@/types/chapters';
import { GenerationContext } from '@/types/generation';
import { SearchOptions } from '@/lib/memory/narrative/types';
import { CharacterState } from '@/types/memory';

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

export interface ExtendedSearchOptions extends SearchOptions {
    chapterRange?: {
        start: number;
        end: number;
    };
    characterIds?: string[];
    keywords?: string[];
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

// ImmediateContextから返されるデータの型を定義
interface ChapterInfo {
    chapter: Chapter;
    characterState: Map<string, CharacterState>;
    timestamp: string;
    keyPhrases?: string[];
}

/**
 * @class ContextManager
 * @description
 * 記憶階層との連携と状態管理を行うクラス。
 * 章情報の保存・取得、キャラクター記憶の連携、長期・短期コンテキストの管理を担当する。
 */
export class ContextManager {
    private context: StoryContext | null = null;
    private initialized: boolean = false;

    /**
     * コンストラクタ
     * @param eventBus イベントバス
     * @param memoryManager 記憶管理（オプション）
     * @param characterManager キャラクター管理（オプション）
     * @param contentAnalysisManager コンテンツ分析管理（オプション）
     */
    constructor(
        private eventBus: EventBus,
        private memoryManager: MemoryManager = memoryManager, // デフォルトはシングルトン
        private characterManager?: CharacterManager,
        private contentAnalysisManager?: ContentAnalysisManager // オプショナルに変更
    ) {
        logger.info('ContextManager created');
    }

    /**
     * 初期化する
     */
    async initialize(storyId: string): Promise<void> {
        if (this.initialized && this.context) {
            logger.info('ContextManager already initialized');
            return;
        }

        try {
            logger.info(`Initializing ContextManager for story ${storyId}...`);

            // 初期コンテキストの設定
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

            // 記憶管理が利用可能ならロード
            if (this.memoryManager) {
                await this.loadFromMemoryHierarchy(storyId);
            }

            // イベント購読の設定
            this.setupEventSubscriptions();

            this.initialized = true;
            logger.info('ContextManager initialized successfully');

            // 初期化完了イベント発行
            this.eventBus.publish('context.updated', {
                storyId,
                action: 'initialized'
            });
        } catch (error) {
            logger.error('Failed to initialize ContextManager', {
                error: error instanceof Error ? error.message : String(error),
                storyId
            });
            throw error;
        }
    }

    /**
     * 記憶階層からコンテキストをロードする
     * @param storyId 物語ID
     */
    private async loadFromMemoryHierarchy(storyId: string): Promise<void> {
        if (!this.memoryManager) {
            logger.warn('Memory Manager not available, skipping context load');
            return;
        }

        try {
            logger.info(`Loading context from memory hierarchy for story ${storyId}`);

            // WorldKnowledgeからコンテキスト状態を取得
            const worldKnowledge = this.memoryManager.getLongTermMemory();
            const settings = worldKnowledge.getWorldSettings();

            if (settings.learningContext) {
                // 保存されたコンテキストがあれば読み込む
                this.context = settings.learningContext;
                logger.info('Loaded context from memory hierarchy');
            } else {
                logger.info('No existing context found in memory hierarchy, using default');
            }

            // ImmediateContextから最近の章情報を取得
            const immediateContext = this.memoryManager.getShortTermMemory();
            const recentChapters = await immediateContext.getRecentChapters();

            if (recentChapters && recentChapters.length > 0) {
                // 章情報を変換してコンテキストに追加
                // 型を明示的に指定
                const recentChapterInfo = recentChapters.map((chapterInfo: ChapterInfo) => {
                    const chapter = chapterInfo.chapter;
                    return {
                        chapterNumber: chapter.chapterNumber,
                        title: chapter.title || `第${chapter.chapterNumber}章`,
                        summary: chapter.metadata?.summary || '',
                        mainEvents: []
                    };
                });

                // 最新の章番号をコンテキストに設定
                const latestChapter = recentChapterInfo.reduce(
                    (max: number, chapter: { chapterNumber: number }) => Math.max(max, chapter.chapterNumber),
                    0
                );

                if (latestChapter > 0) {
                    this.context!.currentChapter = latestChapter;
                }

                // 既存の章情報とマージ
                this.context!.recentChapters = recentChapterInfo;
            }
        } catch (error) {
            logger.error('Failed to load context from memory hierarchy', {
                error: error instanceof Error ? error.message : String(error),
                storyId
            });
            // エラーは上位に伝播させず、デフォルトコンテキストを使用
        }
    }

    /**
     * イベント購読を設定する
     */
    private setupEventSubscriptions(): void {
        // 学習段階更新イベントの購読
        this.eventBus.subscribe('learning.stage.updated', (payload) => {
            if (this.context) {
                this.context.currentLearningStage = payload.stage;
                logger.info(`Updated learning stage in context to ${payload.stage}`);

                // WorldKnowledgeに保存
                this.saveContextToWorldKnowledge();
            }
        });

        // 篇更新イベントの購読
        this.eventBus.subscribe('section.updated', (payload) => {
            if (this.context) {
                this.context.currentSection = payload.sectionId;
                logger.info(`Updated current section in context to ${payload.sectionId}`);

                // WorldKnowledgeに保存
                this.saveContextToWorldKnowledge();
            }
        });

        // 章生成イベントの購読
        this.eventBus.subscribe('chapter.generated', (payload) => {
            if (this.context) {
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

                    // 最大3章まで保持
                    if (this.context.recentChapters.length > 3) {
                        this.context.recentChapters.pop();
                    }
                }

                logger.info(`Updated current chapter in context to ${payload.chapterNumber}`);

                // WorldKnowledgeに保存
                this.saveContextToWorldKnowledge();

                // 文脈更新イベント発行
                this.eventBus.publish('context.updated', {
                    storyId: this.context.storyId,
                    action: 'chapter_updated',
                    chapterNumber: payload.chapterNumber
                });
            }
        });
    }

    /**
     * コンテキスト状態をWorldKnowledgeに保存
     */
    private async saveContextToWorldKnowledge(): Promise<void> {
        if (!this.memoryManager || !this.context) {
            return;
        }

        try {
            // WorldKnowledgeにコンテキスト状態を保存
            const worldKnowledge = this.memoryManager.getLongTermMemory();
            await worldKnowledge.updateWorldSettings({
                learningContext: this.context
            });

            logger.debug('Context state saved to WorldKnowledge');
        } catch (error) {
            logger.error('Failed to save context to WorldKnowledge', {
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

        try {
            if (!this.context) {
                return false;
            }

            // 更新を適用
            Object.assign(this.context, updates);

            // WorldKnowledgeにコンテキスト状態を保存
            const worldKnowledge = this.memoryManager.getLongTermMemory();
            await worldKnowledge.updateWorldSettings({
                learningContext: this.context
            });

            // 更新イベント発行
            this.eventBus.publish('context.updated', {
                storyId: this.context.storyId,
                action: 'context_updated',
                updates: Object.keys(updates)
            });

            logger.info('Context updated successfully');
            return true;
        } catch (error) {
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

            // WorldKnowledgeに保存
            await this.saveContextToWorldKnowledge();

            logger.info(`Set custom property ${key} in context`);
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
     * 長期記憶に章情報を保存する
     * ChapterProcessorの機能を再現し、ContentAnalysisManagerと統合
     * @param chapterNumber 章番号
     * @param chapterData 章データ
     * @returns 保存成功の真偽値
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

        if (!this.memoryManager) {
            logger.warn('Memory Manager not available, cannot save chapter to memory');
            return false;
        }

        try {
            if (!this.context) {
                return false;
            }

            logger.info(`Processing chapter ${chapterNumber} (similar to ChapterProcessor)`);

            // Chapterオブジェクトを作成
            const chapter: Chapter = {
                id: `${this.context.storyId}-${chapterNumber}`,
                chapterNumber: chapterNumber,
                title: chapterData.title,
                content: chapterData.content,
                createdAt: new Date(),
                updatedAt: new Date(),
                metadata: {
                    summary: chapterData.summary || this.generateSummary(chapterData.content),
                    mainEvents: chapterData.mainEvents || [],
                    learningStage: chapterData.learningStage || this.context.currentLearningStage
                }
            };

            // === 元のChapterProcessor処理フローを再現 ===

            // 1. 即時コンテキストを更新（生のテキストと基本的な抽出情報を保存）
            const immediateContext = this.memoryManager.getShortTermMemory();
            await immediateContext.addChapter(chapter);
            logger.info(`Added chapter ${chapterNumber} to immediate context`);

            // 2. 物語記憶を更新（物語状態、章要約などを管理）
            const narrativeMemory = this.memoryManager.getMidTermMemory();
            const worldKnowledge = this.memoryManager.getLongTermMemory();
            const worldSettings = worldKnowledge.getWorldSettings();
            const genre = worldSettings.genre || 'classic';

            await narrativeMemory.updateFromChapter(chapter, { genre });
            logger.info(`Updated narrative memory with chapter ${chapterNumber}`);

            // 3. ContentAnalysisManagerで分析処理（元の表現分析に相当）
            // 🔥 修正: undefined チェックを追加
            if (this.contentAnalysisManager) {
                try {
                    const generationContext: GenerationContext = {
                        chapterNumber: chapterNumber,
                        theme: this.context.recentThemes.join(', ') || undefined,
                        recentChapters: this.context.recentChapters.map(ch => ({
                            number: ch.chapterNumber,
                            title: ch.title,
                            summary: ch.summary
                        })),
                        genre: genre,
                        learningJourney: this.context.currentLearningStage ? {
                            mainConcept: this.context.mainConcept,
                            learningStage: this.context.currentLearningStage as any // LearningStage型にキャスト
                        } : undefined
                    };

                    const processingResult = await this.contentAnalysisManager.processGeneratedChapter(
                        chapter,
                        generationContext
                    );

                    logger.info(`Analyzed chapter ${chapterNumber} via ContentAnalysisManager`, {
                        qualityScore: processingResult.qualityMetrics?.overall || 0,
                        nextSuggestionsCount: processingResult.nextChapterSuggestions.length
                    });
                } catch (analysisError) {
                    // 分析処理でエラーが発生しても、基本的な保存は継続
                    logger.warn(`Chapter analysis failed for chapter ${chapterNumber}, continuing with basic save`, {
                        error: analysisError instanceof Error ? analysisError.message : String(analysisError)
                    });
                }
            } else {
                // 🔥 追加: ContentAnalysisManagerが利用できない場合のログ
                logger.info(`ContentAnalysisManager not available, skipping analysis for chapter ${chapterNumber}`);
            }

            // 4. 世界知識アップデート（キャラクター検出と更新）
            await this.updateWorldKnowledgeFromChapter(chapter);
            logger.info(`Updated world knowledge from chapter ${chapterNumber}`);

            // 5. キャラクター検出と成長処理（CharacterTrackerが利用可能な場合）
            try {
                // CharacterTrackerが直接利用できない場合は、CharacterManagerを通じて処理
                if (this.characterManager) {
                    const characters = await this.characterManager.detectCharactersInContent(chapter.content);
                    logger.info(`Detected ${characters.length} characters in chapter ${chapterNumber}`);

                    // キャラクター成長処理（簡易版）
                    for (const character of characters) {
                        await this.updateCharacterMemory({
                            characterId: character.id,
                            relatedChapter: chapterNumber,
                            memoryType: 'event',
                            content: `章${chapterNumber}に登場`,
                            importance: 0.7
                        });
                    }
                }
            } catch (characterError) {
                logger.warn(`Character processing failed for chapter ${chapterNumber}`, {
                    error: characterError instanceof Error ? characterError.message : String(characterError)
                });
            }

            // コンテキストの最近の章を更新
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

                if (this.context.recentChapters.length > 3) {
                    this.context.recentChapters.pop();
                }
            }

            // 現在の章番号も更新
            this.context.currentChapter = chapterNumber;

            // WorldKnowledgeに保存
            await this.saveContextToWorldKnowledge();

            logger.info(`Successfully processed chapter ${chapterNumber} to memory hierarchy`);
            return true;
        } catch (error) {
            logger.error(`Failed to process chapter ${chapterNumber} to memory`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * 世界知識を章から更新（元のChapterProcessor.updateWorldKnowledgeFromChapter相当）
     * @param chapter 章情報
     * @private
     */
    private async updateWorldKnowledgeFromChapter(chapter: Chapter): Promise<void> {
        try {
            const worldKnowledge = this.memoryManager.getLongTermMemory();

            // キャラクター検出をCharacterManagerに委譲
            if (this.characterManager) {
                const characters = await this.characterManager.detectCharactersInContent(chapter.content);

                // 世界知識に直接キャラクター情報を更新
                await worldKnowledge.updateCharactersFromChapter(
                    characters.map(char => char.name),
                    chapter.chapterNumber
                );

                logger.info(`Updated world knowledge with ${characters.length} characters for chapter ${chapter.chapterNumber}`);
            }
        } catch (error) {
            logger.error(`Failed to update world knowledge from chapter`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber: chapter.chapterNumber
            });
        }
    }

    /**
     * キャラクター記憶を更新する
     * @param update 記憶更新情報
     * @returns 更新成功の真偽値
     */
    async updateCharacterMemory(update: CharacterMemoryUpdate): Promise<boolean> {
        this.ensureInitialized();

        if (!this.characterManager || !this.memoryManager) {
            logger.warn('Character Manager or Memory Manager not available, cannot update character memory');
            return false;
        }

        try {
            if (!this.context) {
                return false;
            }

            logger.info(`Updating memory for character ${update.characterId} related to chapter ${update.relatedChapter}`);

            // キャラクター名を取得する必要があります
            const character = await this.characterManager.getCharacter(update.characterId);
            const characterName = character ? character.name : "Unknown Character";

            await this.memoryManager.addCharacterMemory({
                characterId: update.characterId,
                characterName: characterName,
                content: update.content,
                type: update.memoryType,
                chapterNumber: update.relatedChapter,
                importance: update.importance
            });

            // キャラクターを主要キャラクターリストに追加（まだ含まれていない場合）
            if (!this.context.mainCharacters.includes(update.characterId)) {
                this.context.mainCharacters.push(update.characterId);

                // WorldKnowledgeに保存
                await this.saveContextToWorldKnowledge();
            }

            // 記憶更新イベント発行
            this.eventBus.publish('character.memory.updated', {
                characterId: update.characterId,
                memoryType: update.memoryType,
                chapterNumber: update.relatedChapter
            });

            logger.info(`Successfully updated memory for character ${update.characterId}`);
            return true;
        } catch (error) {
            logger.error(`Failed to update memory for character ${update.characterId}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * 記憶階層からリレバントな記憶を取得する
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

        if (!this.memoryManager) {
            logger.warn('Memory Manager not available, cannot retrieve memories');
            return [];
        }

        try {
            if (!this.context) {
                return [];
            }

            logger.info('Retrieving relevant memories from memory hierarchy');

            // 記憶階層から検索
            // 型アサーションを使用して型チェックをバイパス
            const memories = await this.memoryManager.searchMemories(
                this.context.storyId,
                {
                    chapterRange: query.chapterNumber
                        ? { start: Math.max(1, query.chapterNumber - 3), end: query.chapterNumber }
                        : undefined,
                    characterIds: query.characterIds,
                    keywords: query.keywords,
                    limit: query.limit || 10
                } as any // anyを使用して型チェックをバイパス
            );
            // メモリー取得イベント発行
            this.eventBus.publish('memory.retrieved', {
                count: memories.length,
                query
            });

            logger.info(`Retrieved ${memories.length} relevant memories`);
            return memories;
        } catch (error) {
            logger.error('Failed to retrieve relevant memories', {
                error: error instanceof Error ? error.message : String(error),
                query
            });
            return [];
        }
    }

    /**
     * 初期化済みかどうかを確認する
     */
    private ensureInitialized(): void {
        if (!this.initialized) {
            throw new Error('ContextManager is not initialized. Call initialize() first.');
        }
    }

    /**
     * 内容から要約を生成する（簡易実装）
     * @param content 内容
     * @returns 要約
     */
    private generateSummary(content: string): string {
        // 簡易的な要約生成（最初の200文字）
        if (content.length <= 200) {
            return content;
        }

        return content.substring(0, 197) + '...';

        // 本来はAIを使ってより良い要約を生成すべき
    }

    /**
     * 初期化状態を取得する
     * @returns 初期化済みかどうか
     */
    isInitialized(): boolean {
        return this.initialized;
    }
}