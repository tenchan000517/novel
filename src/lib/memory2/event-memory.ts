// src\lib\memory\event-memory.ts

import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { SignificantEvent, QueryOptions, EventContext } from '@/types/memory';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { JsonParser } from '@/lib/utils/json-parser';
import { Chapter } from '@/types/chapters';

/**
 * @class EventMemory
 * @description
 * 重要イベントを専門に管理するコンポーネントです。
 * キャラクター間の重要な対話/対立、場所関連イベント、警告や約束などの
 * 参照精度を高めるためのインデックス機能を提供します。
 * このクラスは純粋なイベント管理に特化し、状態変更などの複合処理は行いません。
 */
export class EventMemory {
    private events: Map<string, SignificantEvent> = new Map();
    private locationIndex: Map<string, SignificantEvent[]> = new Map();
    private characterIndex: Map<string, SignificantEvent[]> = new Map();
    private typeIndex: Map<string, SignificantEvent[]> = new Map();
    private initialized: boolean = false;
    private geminiClient: GeminiClient;

    /**
     * コンストラクタ
     * @param geminiClient GeminiClient インスタンス (オプション)
     */
    constructor(geminiClient?: GeminiClient) {
        this.geminiClient = geminiClient || new GeminiClient();
        logger.info('EventMemory initialized');
    }

    /**
     * 初期化処理
     * イベントデータの読み込みとインデックス構築を行います
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('EventMemory already initialized');
            return;
        }

        try {
            await this.loadEvents();
            this.initialized = true;
            logger.info('EventMemory initialization complete');
        } catch (error) {
            logger.error('Failed to initialize EventMemory', {
                error: error instanceof Error ? error.message : String(error)
            });
            // 初期化失敗時も空の状態で続行
            this.initialized = true;
        }
    }

    /**
     * イベント保存場所からの読み込み
     * @private
     */
    private async loadEvents(): Promise<void> {
        try {
            // ファイルの存在確認
            const exists = await storageProvider.fileExists('memory/significant-events.json');
            if (!exists) {
                logger.info('No significant events data found, starting with empty state');
                return;
            }

            const data = await storageProvider.readFile('memory/significant-events.json');
            const eventsArray = JSON.parse(data);

            for (const event of eventsArray) {
                const key = this.generateEventKey(event);
                this.events.set(key, event);
            }

            // インデックスの作成
            await this.reindexEvents(Array.from(this.events.values()));
            logger.info(`Loaded ${this.events.size} significant events`);
        } catch (error) {
            // ファイルが存在しない場合や読み込みエラーは無視
            logger.warn('Failed to load event history', { error });
        }
    }

    /**
     * 重要イベントの記録
     * @param event 重要イベント情報
     */
    async recordSignificantEvent(event: SignificantEvent): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        const key = this.generateEventKey(event);

        // 既存イベントの更新または新規イベントの追加
        const existingEvent = this.events.get(key);
        if (existingEvent) {
            // 重要度の更新（最大値を採用）
            event.significance = Math.max(existingEvent.significance, event.significance);

            // 関連情報の統合
            event.relatedEvents = [...(existingEvent.relatedEvents || []), ...(event.relatedEvents || [])];

            logger.debug(`Updating existing event: ${key}`);
        } else {
            // 新規イベントの場合、類似イベントをチェック
            const similarEvent = await this.checkForSimilarEvent(event);
            if (similarEvent) {
                // 類似イベントが見つかった場合、関連付け
                logger.debug(`Found similar event to new event: ${key}`);
                event.relatedEvents = [...(event.relatedEvents || []), similarEvent.id];

                // 類似イベントにも相互に関連付け
                similarEvent.relatedEvents = [...(similarEvent.relatedEvents || []), event.id];
                this.events.set(this.generateEventKey(similarEvent), similarEvent);

                // 反復が検出された場合は重要度を上げる
                event.significance = Math.min(1.0, event.significance + 0.1);
            } else {
                logger.debug(`Recording new significant event: ${key}`);
            }
        }

        this.events.set(key, event);
        this.indexEvent(event);
        await this.persistEvents();
    }

    /**
     * 類似イベントのチェック
     * @private
     * @param event チェック対象イベント
     * @returns 類似イベントまたはnull
     */
    private async checkForSimilarEvent(event: SignificantEvent): Promise<SignificantEvent | null> {
        // 同じ場所とタイプのイベントを検索
        const locationEvents = this.locationIndex.get(event.location) || [];
        const sameTypeLocationEvents = locationEvents.filter(e => e.type === event.type);

        if (sameTypeLocationEvents.length === 0) {
            return null;
        }

        // キャラクターの重複をチェック
        for (const existingEvent of sameTypeLocationEvents) {
            // 重複するキャラクターの数をカウント
            const commonCharacters = existingEvent.involvedCharacters.filter(
                charId => event.involvedCharacters.includes(charId)
            );

            // 少なくとも1人のキャラクターが重複し、同じタイプのイベントで、
            // 3章以内の場合は類似イベントとみなす
            if (commonCharacters.length > 0 &&
                Math.abs(existingEvent.chapterNumber - event.chapterNumber) <= 3) {
                return existingEvent;
            }
        }

        return null;
    }

    /**
     * 場所に関連するイベントの取得
     * @param location 場所
     * @param options クエリオプション
     */
    async getLocationEvents(
        location: string,
        options?: QueryOptions
    ): Promise<SignificantEvent[]> {
        if (!this.initialized) {
            await this.initialize();
        }

        const limit = options?.limit || 10;
        const minSignificance = options?.minSignificance || 0.0;

        const events = this.locationIndex.get(location) || [];

        return events
            .filter(event => event.significance >= minSignificance)
            .sort((a, b) => b.significance - a.significance)
            .slice(0, limit);
    }

    /**
     * キャラクター間の重要インタラクションの取得
     * @param characterIds キャラクターID配列
     * @param options クエリオプション
     */
    async getSignificantCharacterInteractions(
        characterIds: string[],
        options?: QueryOptions
    ): Promise<SignificantEvent[]> {
        if (!this.initialized) {
            await this.initialize();
        }

        const limit = options?.limit || 10;
        const minSignificance = options?.minSignificance || 0.0;

        const interactionEvents: SignificantEvent[] = [];

        // 最低2キャラクターが関わるイベントを検索
        for (let i = 0; i < characterIds.length; i++) {
            for (let j = i + 1; j < characterIds.length; j++) {
                const char1 = characterIds[i];
                const char2 = characterIds[j];

                const char1Events = this.characterIndex.get(char1) || [];

                // char1のイベントからchar2も含むものをフィルタリング
                const interactions = char1Events.filter(event =>
                    event.involvedCharacters.includes(char2)
                );

                interactionEvents.push(...interactions);
            }
        }

        // 重複を削除
        const uniqueEvents = Array.from(
            new Map(interactionEvents.map(e => [this.getEventUniqueKey(e), e])).values()
        );

        return uniqueEvents
            .filter(event => event.significance >= minSignificance)
            .sort((a, b) => b.significance - a.significance)
            .slice(0, limit);
    }

    /**
     * イベントタイプ別の取得
     * @param types イベントタイプ配列
     * @param options クエリオプションと関連キャラクター
     */
    async getEventsByTypes(
        types: string[],
        options?: QueryOptions & { involvedCharacters?: string[] }
    ): Promise<SignificantEvent[]> {
        if (!this.initialized) {
            await this.initialize();
        }

        const limit = options?.limit || 10;
        const minSignificance = options?.minSignificance || 0.0;

        let typeEvents: SignificantEvent[] = [];

        // 指定されたすべてのタイプからイベントを収集
        for (const type of types) {
            const events = this.typeIndex.get(type) || [];
            typeEvents.push(...events);
        }

        // 指定されたキャラクターのフィルタリング
        if (options?.involvedCharacters && options.involvedCharacters.length > 0) {
            typeEvents = typeEvents.filter(event =>
                event.involvedCharacters.some(charId =>
                    options.involvedCharacters?.includes(charId)
                )
            );
        }

        // 永続的イベントのフィルタリング (options.isPersistentが指定されている場合)
        if (options?.isPersistent !== undefined) {
            typeEvents = typeEvents.filter(event => event.isPersistent === options.isPersistent);
        }

        // 重複を削除
        const uniqueEvents = Array.from(
            new Map(typeEvents.map(e => [this.getEventUniqueKey(e), e])).values()
        );

        return uniqueEvents
            .filter(event => event.significance >= minSignificance)
            .sort((a, b) => b.significance - a.significance)
            .slice(0, limit);
    }

    /**
     * 関連性のあるイベントを取得
     * @param context イベントコンテキスト
     */
    async getRelatedEvents(context: EventContext): Promise<SignificantEvent[]> {
        if (!this.initialized) {
            await this.initialize();
        }

        const relatedEvents: SignificantEvent[] = [];

        // 場所に関連するイベント
        if (context.location) {
            const locationEvents = await this.getLocationEvents(context.location, { limit: 3, minSignificance: 0.7 });
            relatedEvents.push(...locationEvents);
        }

        // キャラクター間のインタラクション
        if (context.characters && context.characters.length > 1) {
            const interactionEvents = await this.getSignificantCharacterInteractions(
                context.characters,
                { limit: 5, minSignificance: 0.6 }
            );
            relatedEvents.push(...interactionEvents);
        }

        // 重要な警告・約束
        if (context.characters && context.characters.length > 0) {
            const importantEvents = await this.getEventsByTypes(
                ['WARNING', 'PROMISE', 'CONFLICT', 'RULE_VIOLATION'],
                {
                    involvedCharacters: context.characters,
                    limit: 3,
                    minSignificance: 0.8
                }
            );
            relatedEvents.push(...importantEvents);
        }

        // 重複を削除して重要度でソート
        const uniqueEvents = Array.from(
            new Map(relatedEvents.map(e => [this.getEventUniqueKey(e), e])).values()
        );

        // 修正: relevance → significance に修正
        return uniqueEvents.sort((a, b) => b.significance - a.significance);
    }

    /**
     * イベントのインデックス作成
     * @private
     * @param event 重要イベント
     */
    private indexEvent(event: SignificantEvent): void {
        // 場所インデックス
        if (event.location) {
            const locationEvents = this.locationIndex.get(event.location) || [];
            locationEvents.push(event);
            this.locationIndex.set(event.location, locationEvents);
        }

        // キャラクターインデックス
        if (event.involvedCharacters) {
            for (const characterId of event.involvedCharacters) {
                const characterEvents = this.characterIndex.get(characterId) || [];
                characterEvents.push(event);
                this.characterIndex.set(characterId, characterEvents);
            }
        }

        // タイプインデックス
        if (event.type) {
            const typeEvents = this.typeIndex.get(event.type) || [];
            typeEvents.push(event);
            this.typeIndex.set(event.type, typeEvents);
        }
    }

    /**
     * インデックスの再構築
     * @param events イベント配列
     */
    async reindexEvents(events: SignificantEvent[]): Promise<void> {
        // インデックスのクリア
        this.locationIndex.clear();
        this.characterIndex.clear();
        this.typeIndex.clear();

        // 全イベントのインデックス作成
        for (const event of events) {
            this.indexEvent(event);
        }

        // 各インデックス内のイベントを重要度でソート
        for (const [location, locEvents] of this.locationIndex.entries()) {
            this.locationIndex.set(
                location,
                locEvents.sort((a, b) => b.significance - a.significance)
            );
        }

        for (const [charId, charEvents] of this.characterIndex.entries()) {
            this.characterIndex.set(
                charId,
                charEvents.sort((a, b) => b.significance - a.significance)
            );
        }

        for (const [type, typeEvents] of this.typeIndex.entries()) {
            this.typeIndex.set(
                type,
                typeEvents.sort((a, b) => b.significance - a.significance)
            );
        }

        logger.debug(`Reindexed ${events.length} events with optimized sorting`);
    }

    /**
     * イベントデータの永続化
     * @private
     */
    private async persistEvents(): Promise<void> {
        try {
            const eventsArray = Array.from(this.events.values());
            await storageProvider.writeFile(
                'memory/significant-events.json',
                JSON.stringify(eventsArray, null, 2)
            );
            logger.debug(`Persisted ${eventsArray.length} events`);
        } catch (error) {
            logger.error('Failed to persist events', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * イベントキーの生成（一意性確保のため）
     * @private
     * @param event 重要イベント
     */
    private generateEventKey(event: SignificantEvent): string {
        return `${event.chapterNumber}-${event.type}-${event.involvedCharacters?.join('-') || 'no-characters'
            }-${event.location || 'no-location'}`;
    }

    /**
     * イベントの一意キーを取得
     * @private
     * @param event 重要イベント
     */
    private getEventUniqueKey(event: SignificantEvent): string {
        return `${event.chapterNumber}-${event.type}-${event.location}`;
    }

    /**
     * ステータス情報の取得
     */
    async getStatus(): Promise<{ eventCount: number, lastUpdateTime: Date | null }> {
        return {
            eventCount: this.events.size,
            lastUpdateTime: new Date()
        };
    }

    /**
     * 指定された条件でイベントを検索するクエリメソッド
     * @param options クエリオプション
     */
    async queryEvents(options: {
        isPersistent?: boolean;
        chapterRange?: { start: number; end: number };
        types?: string[];
        involvedCharacters?: string[];
    }): Promise<SignificantEvent[]> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // すべてのイベントを配列化
            let events = Array.from(this.events.values());

            // 永続的イベントのフィルタリング
            if (options.isPersistent !== undefined) {
                events = events.filter(event => event.isPersistent === options.isPersistent);
            }

            // 章範囲でのフィルタリング
            if (options.chapterRange) {
                events = events.filter(event =>
                    event.chapterNumber >= options.chapterRange!.start &&
                    event.chapterNumber <= options.chapterRange!.end
                );
            }

            // タイプでのフィルタリング
            if (options.types && options.types.length > 0) {
                events = events.filter(event => options.types!.includes(event.type));
            }

            // 関係者でのフィルタリング
            if (options.involvedCharacters && options.involvedCharacters.length > 0) {
                events = events.filter(event =>
                    event.involvedCharacters.some(char =>
                        options.involvedCharacters!.includes(char)
                    )
                );
            }

            // 重要度と章番号でソート
            return events.sort((a, b) => {
                // まず重要度で比較
                const sigDiff = b.significance - a.significance;
                if (Math.abs(sigDiff) > 0.1) return sigDiff;

                // 同じくらいの重要度なら、最新の章を優先
                return b.chapterNumber - a.chapterNumber;
            });
        } catch (error) {
            logger.error('Failed to query events', {
                error: error instanceof Error ? error.message : String(error),
                options
            });
            return [];
        }
    }

    /**
     * 特定のキャラクターに関するイベントを取得する
     * @param characterName キャラクター名
     * @param options 検索オプション
     */
    async getCharacterEvents(
        characterName: string,
        options?: {
            chapterRange?: { start: number; end: number };
            types?: string[];
            limit?: number;
            includeReferences?: boolean;
        }
    ): Promise<SignificantEvent[]> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            let results: SignificantEvent[] = [];

            // 1. キャラクターインデックスから直接関連イベントを取得
            const directEvents = this.characterIndex.get(characterName) || [];
            results.push(...directEvents);

            // 2. 指定された章範囲でフィルタリング
            if (options?.chapterRange) {
                results = results.filter(
                    event => event.chapterNumber >= options.chapterRange!.start &&
                        event.chapterNumber <= options.chapterRange!.end
                );
            }

            // 3. 指定されたタイプでフィルタリング
            if (options?.types && options.types.length > 0) {
                results = results.filter(event => options.types!.includes(event.type));
            }

            // 4. 参照も含める場合は、説明文にキャラクター名が含まれるイベントも追加
            if (options?.includeReferences) {
                const allEvents = Array.from(this.events.values());
                const referencingEvents = allEvents.filter(event =>
                    // 直接関連イベントではないが、説明文にキャラクター名が含まれる
                    !event.involvedCharacters.includes(characterName) &&
                    event.description.includes(characterName)
                );

                // 章範囲でフィルタリング
                let filteredReferences = referencingEvents;
                if (options.chapterRange) {
                    filteredReferences = filteredReferences.filter(
                        event => event.chapterNumber >= options.chapterRange!.start &&
                            event.chapterNumber <= options.chapterRange!.end
                    );
                }

                // タイプでフィルタリング
                if (options.types && options.types.length > 0) {
                    filteredReferences = filteredReferences.filter(
                        event => options.types!.includes(event.type)
                    );
                }

                // 既存のイベントと重複しないものを追加
                const resultIds = new Set(results.map(e => e.id));
                const uniqueReferences = filteredReferences.filter(e => !resultIds.has(e.id));

                results.push(...uniqueReferences);
            }

            // 5. 重要度でソートして制限
            results.sort((a, b) => b.significance - a.significance);

            // 制限がある場合は適用
            if (options?.limit && options.limit > 0) {
                results = results.slice(0, options.limit);
            }

            return results;
        } catch (error) {
            logger.error(`キャラクターイベント取得に失敗しました`, {
                error: error instanceof Error ? error.message : String(error),
                characterName
            });
            return [];
        }
    }

    /**
     * チャプター内容から重要イベントを検出して保存
     * @param chapter 章情報
     * @param options オプション設定
     */
    async detectAndStoreEvents(chapter: Chapter, options?: { genre?: string }): Promise<void> {
        const genre = options?.genre || 'classic';

        try {
            // 重要イベント分析プロンプト
            const prompt = `
以下の章から、物語上重要かつ将来の章でも覚えておくべきイベントを抽出してください。
特に：
- キャラクター間の重要な対話、対立、約束
- 警告やルール違反とその結果
- 場所に関連する特別な出来事
- キャラクターが受けた重要な教訓

章の内容:
${chapter.content.substring(0, 5000)}...

JSON形式で返却してください。各イベントには以下を含めてください：
- description: イベントの詳細説明
- involvedCharacters: 関与したキャラクター（配列）
- location: イベントの場所
- type: イベントタイプ（WARNING, CONFLICT, PROMISE, DISCOVERY, RULE_VIOLATION など）
- significance: 重要度（0.0～1.0）
- consequence: イベントの結果や影響（ある場合）
`;

            // APIスロットリングを適用して重要イベント分析を実行
            const response = await apiThrottler.throttledRequest(() =>
                this.geminiClient.generateText(prompt, {
                    temperature: 0.3,
                    purpose: 'analysis',
                    responseFormat: 'json'
                })
            );

            // JsonParserを使用してレスポンスからJSONを抽出・解析する
            // デフォルト値として空配列を設定
            const events = JsonParser.parseFromAIResponse<any[]>(response, []);

            // 有効なイベント配列であることを確認
            if (Array.isArray(events)) {
                // 重要度が高いイベントのみ抽出
                const significantEvents = events.filter(event => event.significance >= 0.6);

                // イベントを記録
                for (const event of significantEvents) {
                    await this.recordSignificantEvent({
                        id: `event-${chapter.chapterNumber}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                        chapterNumber: chapter.chapterNumber,
                        description: event.description,
                        involvedCharacters: Array.isArray(event.involvedCharacters) ? event.involvedCharacters : [],
                        location: event.location || '',
                        type: event.type || 'EVENT',
                        significance: event.significance || 0.7,
                        consequence: event.consequence,
                        timestamp: new Date().toISOString(),
                        relatedEvents: []
                    });
                }

                logger.info(`Stored ${significantEvents.length} significant events from chapter ${chapter.chapterNumber}`);
            } else {
                logger.warn('Invalid events analysis response format', { response: response.substring(0, 200) });
            }
        } catch (error) {
            logger.error('Failed to detect and store significant events', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber: chapter.chapterNumber
            });
        }
    }
}