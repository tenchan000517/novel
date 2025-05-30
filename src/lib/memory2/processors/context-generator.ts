/**
 * @fileoverview 統合記憶コンテキスト生成を担当するジェネレーター
 * @description
 * メモリマネージャーから切り出された統合記憶コンテキスト生成機能を提供するクラスです。
 * 各記憶レイヤーからの情報を統合して物語生成のためのコンテキストを生成します。
 */
import { logger } from '@/lib/utils/logger';
import { ImmediateContext } from '../immediate-context';
import { NarrativeMemory } from '../narrative-memory';
import { WorldKnowledge } from '../world-knowledge';
import { EventRegistry } from '../events/event-registry';
import { characterManager } from '@/lib/characters/manager';
import { EventContext, ArcMemory, ChapterMemory, KeyEvent } from '@/types/memory';
import { NarrativeState, NarrativeStateInfo } from '@/lib/memory/narrative/types';
// Character型をインポート
import { Character } from '@/lib/characters/core/types';

/**
 * @class ContextGenerator
 * @description
 * 統合記憶コンテキスト生成を担当するジェネレータークラス。
 * ImmediateContext、NarrativeMemory、WorldKnowledge、EventRegistry、CharacterManagerと連携し、
 * 各レイヤーからの情報を統合して物語生成のためのコンテキストを生成します。
 */
export class ContextGenerator {
    /**
     * ContextGeneratorを初期化します
     * @param immediateContext ImmediateContextインスタンス
     * @param narrativeMemory NarrativeMemoryインスタンス
     * @param worldKnowledge WorldKnowledgeインスタンス
     * @param eventRegistry EventRegistryインスタンス
     * @param characterManager CharacterManagerインスタンス
     */
    constructor(
        private immediateContext: ImmediateContext,
        private narrativeMemory: NarrativeMemory,
        private worldKnowledge: WorldKnowledge,
        private eventRegistry: EventRegistry,
        private characterManager: any
    ) { }

    /**
     * 統合記憶コンテキストを生成します
     * @param chapterNumber 章番号
     * @returns 統合された記憶コンテキスト
     */
    async generateIntegratedContext(chapterNumber: number): Promise<any> {
        logger.info(`Generating integrated memory context for chapter ${chapterNumber}`);

        try {
            // 章番号の安全な処理
            const safeChapterNumber = Math.max(1, chapterNumber);
            const prevChapterNumber = Math.max(1, safeChapterNumber - 1);

            logger.debug(`Using safe chapter numbers - current: ${safeChapterNumber}, previous: ${prevChapterNumber}`);

            // ステップ1: 一次情報の取得
            // --------------------------------------------------------

            // 基本的な物語状態の取得
            const narrativeState = await this.getNarrativeState(safeChapterNumber);
            logger.debug(`Got narrative state for chapter ${safeChapterNumber}`);

            // 短期記憶情報（最近の章）
            const shortTermData = await this.getRecentChapterMemories(prevChapterNumber, 3);
            logger.debug(`Got short term data for chapter ${safeChapterNumber}`);

            // 物語アーク情報（中期記憶）
            const midTermData = await this.getCurrentArc(safeChapterNumber);
            logger.debug(`Got mid term data for chapter ${safeChapterNumber}`);

            // 世界記憶文脈
            const worldMemory = await this.worldKnowledge.getRelevantContext(safeChapterNumber);
            logger.debug(`Got world memory context for chapter ${safeChapterNumber}`);

            // 伏線情報（未解決の伏線）
            const rawForeshadowing = await this.worldKnowledge.getUnresolvedForeshadowing();
            logger.debug(`Got raw foreshadowing for chapter ${safeChapterNumber}`);

            // 重要イベント（確立されたイベント）
            const rawEstablishedEvents = await this.worldKnowledge.getEstablishedEvents({
                start: Math.max(1, safeChapterNumber - 10),
                end: prevChapterNumber
            });
            logger.debug(`Got raw established events for chapter ${safeChapterNumber}`);

            // ステップ2: 派生情報の取得・計算
            // --------------------------------------------------------

            // 伏線のフィルタリング・関連度計算
            const relevantForeshadowing = this.filterRelevantForeshadowing(
                rawForeshadowing || [],
                safeChapterNumber,
                worldMemory || ''
            );
            logger.debug(`Filtered to ${relevantForeshadowing?.length || 0} relevant foreshadowing elements`);

            // 統合された重要イベント情報
            const recentEvents = await this.getImportantEvents(Math.max(1, safeChapterNumber - 10), prevChapterNumber);
            logger.debug(`Got integrated important events for chapter ${safeChapterNumber}`);

            // 関連キャラクター特定
            const relevantCharacterIds = await this.identifyRelevantCharacters(
                safeChapterNumber,
                shortTermData || [],
                recentEvents || []
            );
            logger.debug(`Identified relevant characters for chapter ${safeChapterNumber}`);

            // キャラクター詳細情報
            const characterDetails = await this.characterManager.getCharactersWithDetails(relevantCharacterIds);
            logger.debug(`Got details for ${characterDetails.length} characters`);

            // 重要イベント情報取得（EventRegistryから）
            const eventContext: EventContext = {
                location: narrativeState.location,
                characters: relevantCharacterIds,
                time: narrativeState.timeOfDay
            };
            const significantEvents = await this.getSignificantContextEvents(eventContext);
            logger.debug(`Retrieved significant events context`);

            // イベントのランク付け・フィルタリング
            const keyEvents = this.rankAndFilterEvents(recentEvents || [], safeChapterNumber);
            logger.debug(`Ranked and filtered events for chapter ${safeChapterNumber}`);

            // キャラクター関係性マップ構築
            const relationships = this.buildRelationshipMap(characterDetails || [], recentEvents || []);
            logger.debug(`Built relationship map for characters`);

            // 統合された記憶コンテキスト（純粋に記憶に関する情報のみ）
            logger.info(`Successfully generated integrated memory context for chapter ${safeChapterNumber}`);

            return {
                chapterNumber: safeChapterNumber,
                narrativeState,
                arc: midTermData,
                recentChapters: shortTermData,
                worldMemory,
                keyEvents,
                foreshadowing: relevantForeshadowing,
                characters: characterDetails,
                relationships,
                significantEvents,
                // 矛盾検出情報
                contradictions: []
            };
        } catch (error) {
            logger.error('Failed to generate integrated memory context', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                chapterNumber
            });

            // エラー時は最小限の記憶コンテキストを返す
            return await this.generateMinimalFallbackContext(chapterNumber);
        }
    }

    /**
     * 最小限のフォールバックコンテキストを生成します
     * @param chapterNumber 章番号
     * @returns 最小限のコンテキスト
     * @private
     */
    private async generateMinimalFallbackContext(chapterNumber: number): Promise<any> {
        try {
            // 最低限必要な情報のみを取得
            const narrativeState = await this.getNarrativeStateMinimal(chapterNumber);

            // メインキャラクターのみを取得
            const mainCharacters = await this.characterManager.getCharactersByType('MAIN');

            return {
                chapterNumber,
                narrativeState,
                arc: { theme: "物語の進行" },
                recentChapters: [],
                worldContext: '基本的な物語設定',
                keyEvents: [],
                foreshadowing: [],
                characters: mainCharacters.slice(0, 3), // 最大3キャラクター
                relationships: {},
                contradictions: [],
                plotPoints: []
            };
        } catch (fallbackError) {
            logger.error('Failed to generate even minimal fallback context', {
                error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
                chapterNumber
            });

            // 絶対最小限の情報
            return {
                chapterNumber,
                narrativeState: {
                    state: 'UNKNOWN',
                    tensionLevel: 5,
                    pacing: 0.5
                },
                characters: []
            };
        }
    }

    /**
     * 重要イベントコンテキストを取得します
     * @param context イベントコンテキスト
     * @returns フォーマットされた重要イベント情報
     */
    async getSignificantContextEvents(context: EventContext): Promise<{
        locationHistory: string[],
        characterInteractions: string[],
        warningsAndPromises: string[]
    }> {
        try {
            // 1. 場所に関連する重要イベントを取得
            const locationEvents = await this.eventRegistry.getLocationEvents(
                context.location || '',
                { limit: 3, minSignificance: 0.7 }
            );

            // 2. キャラクター間の重要なインタラクション履歴を取得
            const characterInteractions = context.characters && context.characters.length > 0
                ? await this.eventRegistry.getSignificantCharacterInteractions(
                    context.characters,
                    { limit: 5, minSignificance: 0.6 }
                )
                : [];

            // 3. 警告・衝突・約束など特定タイプのイベントを取得
            const warningsAndPromises = context.characters && context.characters.length > 0
                ? await this.eventRegistry.getEventsByTypes(
                    ['WARNING', 'PROMISE', 'CONFLICT', 'RULE_VIOLATION'],
                    {
                        involvedCharacters: context.characters,
                        limit: 3,
                        minSignificance: 0.8
                    }
                )
                : [];

            // イベントをプロンプト用にフォーマット
            return {
                locationHistory: this.formatEventsForPrompt(locationEvents),
                characterInteractions: this.formatEventsForPrompt(characterInteractions),
                warningsAndPromises: this.formatEventsForPrompt(warningsAndPromises)
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

    /**
      * 最近のチャプターメモリを取得します
      */
    async getRecentChapterMemories(upToChapter: number, limit?: number): Promise<ChapterMemory[]> {

        try {
            // ImmediateContextから章情報を取得
            const chapters = await this.immediateContext.getRecentChapters(upToChapter);

            // 章情報からChapterMemoryに変換
            const chapterMemories: ChapterMemory[] = [];

            for (const chapterInfo of chapters) {
                const chapter = chapterInfo.chapter;

                // NarrativeMemoryから章要約を取得
                const summary = await this.narrativeMemory.getChapterSummary(chapter.chapterNumber);

                // WorldKnowledgeからキーイベントを取得
                const keyEvents = await this.worldKnowledge.getEstablishedEvents({
                    start: chapter.chapterNumber,
                    end: chapter.chapterNumber
                });

                // ChapterMemory形式に変換
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
                    emotional_impact: 5,  // デフォルト値
                    plot_significance: 5  // デフォルト値
                };

                chapterMemories.push(chapterMemory);
            }

            // チャプター番号の降順でソート
            const sortedMemories = chapterMemories.sort((a, b) => b.chapter - a.chapter);

            // 制限がある場合は適用
            return limit ? sortedMemories.slice(0, limit) : sortedMemories;
        } catch (error) {
            logger.error('Failed to get recent chapter memories', { error: error instanceof Error ? error.message : String(error) });
            return [];
        }
    }

    /**
     * 現在のアーク情報を取得します
     */
    async getCurrentArc(chapterNumber: number): Promise<ArcMemory | null> {

        try {
            // NarrativeMemoryから現在の物語状態を取得
            const narrativeState = await this.narrativeMemory.getCurrentState(chapterNumber);

            // 物語状態からArcMemory形式に変換
            const currentArc: ArcMemory = {
                number: narrativeState.currentArcNumber || 1,
                theme: narrativeState.currentTheme || '物語の始まり',
                chapter_range: {
                    start: narrativeState.arcStartChapter || 1,
                    end: narrativeState.arcEndChapter || -1
                },
                is_complete: narrativeState.arcCompleted || false,
                memories: [],
                turningPoints: (narrativeState.turningPoints || []).map(tp => ({
                    event: tp.description,
                    chapter: tp.chapter,
                    significance: tp.significance
                }))
            };

            return currentArc;
        } catch (error) {
            logger.error('Failed to get current arc', { error: error instanceof Error ? error.message : String(error) });
            return null;
        }
    }

    /**
      * 重要イベントを取得します
      */
    async getImportantEvents(startChapter: number, endChapter: number): Promise<KeyEvent[]> {

        try {
            // WorldKnowledgeから確立されたイベントを取得
            const establishedEvents = await this.worldKnowledge.getEstablishedEvents({
                start: startChapter,
                end: endChapter
            });

            // NarrativeMemoryからターニングポイントを取得
            const narrativeState = await this.narrativeMemory.getCurrentState(endChapter);
            const turningPoints = narrativeState.turningPoints || [];

            // 両方をKeyEvent形式に変換して統合
            const keyEvents: KeyEvent[] = [
                // 確立されたイベントの変換
                ...establishedEvents.map(event => ({
                    event: event.description,
                    chapter: event.chapter,
                    significance: event.significance || 5,
                    characters: event.characters || []
                })),

                // ターニングポイントの変換
                ...turningPoints
                    .filter(tp => tp.chapter >= startChapter && tp.chapter <= endChapter)
                    .map(tp => ({
                        event: tp.description,
                        chapter: tp.chapter,
                        significance: tp.significance
                    }))
            ];

            // 重要度でソート
            return keyEvents.sort((a, b) => b.significance - a.significance);
        } catch (error) {
            logger.error('Failed to get important events', { error: error instanceof Error ? error.message : String(error) });
            return [];
        }
    }

    /**
     * 物語状態を取得します
     * @param chapterNumber 章番号
     * @returns 物語状態情報
     */
    private async getNarrativeState(chapterNumber: number): Promise<NarrativeStateInfo> {
        return this.narrativeMemory.getCurrentState(chapterNumber);
    }

    /**
     * 最小限の物語状態を取得します（エラーリカバリー用）
     * @param chapterNumber 章番号
     * @returns 最小限の物語状態
     * @private
     */
    private async getNarrativeStateMinimal(chapterNumber: number): Promise<NarrativeStateInfo> {
        try {
            // NarrativeMemory の getCurrentState メソッドを使用して必要な情報を取得
            const simplifiedState = await this.narrativeMemory.getCurrentState(chapterNumber);

            // 必要な情報が取得できた場合はそれを返す
            if (simplifiedState) {
                return {
                    state: simplifiedState.state || NarrativeState.DAILY_LIFE,
                    tensionLevel: simplifiedState.tensionLevel || 5,
                    stagnationDetected: simplifiedState.stagnationDetected || false,
                    duration: simplifiedState.duration || 1,
                    presentCharacters: simplifiedState.presentCharacters || [],
                    location: simplifiedState.location || "不明な場所",
                    timeOfDay: simplifiedState.timeOfDay || "不明な時間",
                    weather: simplifiedState.weather || "不明な天候",
                    genre: simplifiedState.genre || "classic",
                    suggestedNextState: simplifiedState.suggestedNextState || NarrativeState.DAILY_LIFE,

                    // ★ 必須プロパティ補完！ここが超重要っ！🔥
                    currentArcNumber: simplifiedState.currentArcNumber ?? 0,
                    currentTheme: simplifiedState.currentTheme ?? "未定",
                    arcStartChapter: simplifiedState.arcStartChapter ?? chapterNumber,
                    arcEndChapter: simplifiedState.arcEndChapter ?? chapterNumber,
                    arcCompleted: simplifiedState.arcCompleted ?? false,
                    turningPoints: simplifiedState.turningPoints ?? []
                };
            }

            // 基本情報が取得できなかった場合のデフォルト値
            return {
                state: NarrativeState.DAILY_LIFE,
                tensionLevel: 5,
                stagnationDetected: false,
                duration: 1,
                presentCharacters: [],
                location: "不明な場所",
                timeOfDay: "不明な時間",
                weather: "不明な天候",
                genre: "classic",
                suggestedNextState: NarrativeState.DAILY_LIFE,

                currentArcNumber: 0,
                currentTheme: "未定",
                arcStartChapter: chapterNumber,
                arcEndChapter: chapterNumber,
                arcCompleted: false,
                turningPoints: []
            };
        } catch (error) {
            logger.error('Failed to get minimal narrative state', { error });

            // 最終フォールバック
            return {
                state: NarrativeState.DAILY_LIFE,
                tensionLevel: 5,
                stagnationDetected: false,
                duration: 1,
                presentCharacters: [],
                location: "不明な場所",
                timeOfDay: "不明な時間",
                weather: "不明な天候",
                genre: "classic",
                suggestedNextState: NarrativeState.DAILY_LIFE,

                currentArcNumber: 0,
                currentTheme: "未定",
                arcStartChapter: chapterNumber,
                arcEndChapter: chapterNumber,
                arcCompleted: false,
                turningPoints: []
            };
        }
    }

    /**
     * イベントをプロンプト用に整形するヘルパーメソッド
     * @param events イベント配列
     * @returns フォーマットされたイベント文字列の配列
     * @private
     */
    private formatEventsForPrompt(events: any[]): string[] {
        if (!events || events.length === 0) return [];

        return events.map(event =>
            `${event.description}（第${event.chapterNumber}章）${event.consequence ? `\n結果: ${event.consequence}` : ''
            }`
        );
    }

    /**
     * 関連する伏線をフィルタリングします
     * @param foreshadowing 伏線配列
     * @param chapterNumber 章番号
     * @param worldContext 世界コンテキスト
     * @returns フィルタリングされた伏線
     * @private
     */
    private filterRelevantForeshadowing(foreshadowing: any[], chapterNumber: number, worldContext: string): any[] {
        if (!foreshadowing || foreshadowing.length === 0) {
            return [];
        }

        // 1. 章番号に基づくフィルタリング
        // - チャプター導入から5章以上経っている伏線を優先
        // - ただし30章以上経っている伏線は解決を強く促す
        const filtered = foreshadowing.map(fs => {
            let relevance = 0.5; // デフォルト値

            const chaptersElapsed = chapterNumber - fs.chapter_introduced;

            // 経過章数によるスコア調整
            if (chaptersElapsed < 3) {
                // 導入されたばかりの伏線は低スコア
                relevance = 0.3;
            } else if (chaptersElapsed >= 3 && chaptersElapsed < 10) {
                // 少し時間が経った伏線は適度なスコア
                relevance = 0.5;
            } else if (chaptersElapsed >= 10 && chaptersElapsed < 20) {
                // 十分に時間が経った伏線は高スコア
                relevance = 0.7;
            } else if (chaptersElapsed >= 20) {
                // 長く解決されていない伏線は非常に高スコア
                relevance = 0.9;
            }

            // 伏線の緊急度を追加
            let urgencyLevel = 0;
            if (fs.urgency === 'low') urgencyLevel = 0.3;
            else if (fs.urgency === 'medium') urgencyLevel = 0.5;
            else if (fs.urgency === 'high') urgencyLevel = 0.7;
            else if (fs.urgency === 'critical') urgencyLevel = 0.9;
            else urgencyLevel = 0.5; // デフォルト

            // 潜在的な解決方法（あれば）
            const potentialResolution = fs.potential_resolution ||
                fs.potentialResolution ||
                '';

            return {
                ...fs,
                relevance,
                urgencyLevel,
                potential_resolution: potentialResolution
            };
        });

        // 2. 関連度でソートして上位のものを返す
        return filtered
            .sort((a, b) => {
                // 緊急度が高い伏線を優先
                const urgencyDiff = b.urgencyLevel - a.urgencyLevel;
                if (Math.abs(urgencyDiff) > 0.1) return urgencyDiff;

                // その次に関連度で判断
                return b.relevance - a.relevance;
            })
            .slice(0, 5); // 最大5つまで
    }

    /**
     * 関連キャラクターを特定します
     * @param chapterNumber 章番号
     * @param recentChapters 最近の章
     * @param recentEvents 最近のイベント
     * @returns 関連キャラクターID配列
     * @private
     */
    private async identifyRelevantCharacters(
        chapterNumber: number,
        recentChapters: any[],
        recentEvents: any[]
    ): Promise<string[]> {
        try {
            // 1. メインキャラクターを確実に含める
            const mainCharacters = await this.characterManager.getCharactersByType('MAIN');
            const mainCharacterIds = mainCharacters.map((char: Character) => char.id);

            // 2. 直近の章に登場したキャラクターを特定
            const recentlyAppearedCharacterIds = new Set<string>();

            // 直近の章からキャラクターを収集
            for (const chapter of recentChapters) {
                if (chapter.character_states) {
                    for (const state of chapter.character_states) {
                        // CharacterManagerからIDを取得
                        const character = await this.characterManager.getCharacterByName(state.name);
                        if (character) {
                            recentlyAppearedCharacterIds.add(character.id);
                        }
                    }
                }
            }

            // 3. 重要イベントに登場したキャラクターを特定
            const eventCharacterIds = new Set<string>();

            // イベントからキャラクターを収集
            for (const event of recentEvents) {
                if (event.characters && Array.isArray(event.characters)) {
                    for (const charName of event.characters) {
                        const character = await this.characterManager.getCharacterByName(charName);
                        if (character) {
                            eventCharacterIds.add(character.id);
                        }
                    }
                }
            }

            // 4. 物語状態に基づく推奨キャラクターを取得
            const narrativeState = await this.getNarrativeState(chapterNumber);
            const recommendedIds = await this.getStateBasedCharacterRecommendations(narrativeState);

            // 5. すべてのキャラクターIDを結合し、優先度順にソート
            // - メインキャラクターは常に上位
            // - 次に重要イベントのキャラクター
            // - 次に直近の登場キャラクター
            // - 最後に推奨キャラクター

            // 重複を除去しながら順番に追加
            const allCharacterIds = new Set<string>([
                ...mainCharacterIds,
                ...Array.from(eventCharacterIds),
                ...Array.from(recentlyAppearedCharacterIds),
                ...recommendedIds
            ]);

            // 最大10人に制限
            return Array.from(allCharacterIds).slice(0, 10);
        } catch (error) {
            logger.error('キャラクター特定エラー', { error });

            // エラー時はメインキャラクターのみ返す
            const mainCharacters = await this.characterManager.getCharactersByType('MAIN');
            return mainCharacters.map((char: Character) => char.id);
        }
    }

    /**
     * 物語状態に基づくキャラクター推奨を取得します
     * @param narrativeState 物語状態
     * @returns 推奨キャラクターID配列
     * @private
     */
    private async getStateBasedCharacterRecommendations(narrativeState: NarrativeStateInfo): Promise<string[]> {
        try {
            // 物語状態に基づく推奨
            if (narrativeState.presentCharacters && narrativeState.presentCharacters.length > 0) {
                const characterIds: string[] = [];

                // 名前からIDへの変換
                for (const name of narrativeState.presentCharacters) {
                    const character = await this.characterManager.getCharacterByName(name);
                    if (character) {
                        characterIds.push(character.id);
                    }
                }

                return characterIds;
            }

            // 代替: ステータスに応じたキャラクター推奨
            // - テンションが高い場合は積極的なキャラクター
            // - 停滞検出時は変化をもたらすキャラクター
            if (narrativeState.tensionLevel > 7) {
                // 高テンション時はサブキャラクターも活躍
                const subCharacters = await this.characterManager.getCharactersByType('SUB');
                return subCharacters.slice(0, 3).map((char: Character) => char.id);
            } else if (narrativeState.stagnationDetected) {
                // 停滞時は新しいキャラクターを導入
                const allCharacters = await this.characterManager.getAllCharacters();
                const inactiveCharacters = allCharacters
                    .filter((char: Character) => !char.state.isActive)
                    .slice(0, 2)
                    .map((char: Character) => char.id);

                return inactiveCharacters;
            }

            // デフォルトは空配列
            return [];
        } catch (error) {
            logger.warn('キャラクター推奨取得エラー', { error });
            return [];
        }
    }

    /**
     * イベントのランク付けとフィルタリングを行います
     * @param events イベント配列
     * @param chapterNumber 章番号
     * @returns ランク付けされたイベント
     * @private
     */
    private rankAndFilterEvents(events: any[], chapterNumber: number): any[] {
        if (!events || events.length === 0) {
            return [];
        }

        // 重要度とチャプター番号でランク付け
        return events
            .map(event => {
                // 経過章数に基づくスコア計算
                const chaptersDiff = chapterNumber - event.chapter;
                let recencyScore = 1 - (Math.min(chaptersDiff, 10) / 10);

                // 重要度・新しさ・インパクトを総合的に評価
                const totalScore = (
                    (event.significance || 5) / 10 * 0.6 + // 重要度（60%）
                    recencyScore * 0.4                     // 新しさ（40%）
                );

                return {
                    ...event,
                    totalScore
                };
            })
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 5); // 最大5つのイベント
    }

    /**
     * 関係マップを構築します
     * @param characters キャラクター配列
     * @param events イベント配列
     * @returns 関係マップ
     * @private
     */
    private buildRelationshipMap(characters: any[], events: any[]): object {
        const relationshipMap: { [key: string]: any[] } = {};

        // キャラクター間の関係を構築
        for (const char of characters) {
            if (!char || !char.name) continue;

            const relationships: any[] = [];

            // 他のキャラクターとの関係を検査
            for (const otherChar of characters) {
                if (!otherChar || !otherChar.name || char.name === otherChar.name) continue;

                // 関係を記録
                relationships.push({
                    name: otherChar.name,
                    type: 'CHARACTER',
                    // この部分は実装依存。関係情報がある場合はそれを使用
                    relationship: 'RELATED'
                });
            }

            // イベントとの関係
            for (const event of events) {
                if (event.characters && Array.isArray(event.characters) &&
                    event.characters.includes(char.name)) {
                    relationships.push({
                        event: event.event,
                        type: 'EVENT',
                        chapter: event.chapter,
                        significance: event.significance || 5
                    });
                }
            }

            relationshipMap[char.name] = relationships;
        }

        return relationshipMap;
    }
}