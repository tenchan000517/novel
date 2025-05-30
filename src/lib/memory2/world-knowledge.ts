// src/lib/memory/world-knowledge.ts
import { Foreshadowing, PersistentEventType } from '@/types/memory';
import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { storageProvider } from '@/lib/storage';
import { CharacterManager, characterManager } from '@/lib/characters/manager';
import { WorldSettings } from '@/lib/plot/types';

/**
 * @interface CharacterProfile
 * @description キャラクターのプロファイル情報
 */
interface CharacterProfile {
    name: string;
    description: string;
    traits?: string[];
    firstAppearance: number;
    created: string;
    lastUpdated: string;
    relationships?: {
        target: string;
        relation: string;
        strength: number;
    }[];
}

/**
 * @interface EstablishedEvent
 * @description 確立された事実やイベント
 */
interface EstablishedEvent {
    id: string;
    chapter: number;
    title: string;
    description: string;
    significance?: number;
    characters?: string[];
    timestamp: string;
}

// /**
//  * @interface WorldSettings
//  * @description 世界設定情報
//  */
// interface WorldSettings {
//     description: string;
//     regions?: string[];
//     history?: string[];
//     rules?: string[];
// }

/**
 * @interface WorldKnowledgeStatus
 * @description 世界知識の状態情報
 */
interface WorldKnowledgeStatus {
    initialized: boolean;
    characterCount: number;
    eventCount: number;
    foreshadowingCount: number;
    lastUpdateTime: string | null;
}

/**
 * @class WorldKnowledge
 * @description
 * 不変的設定、確立事実、長期保存情報を管理する世界知識管理クラスです。
 * キャラクター情報はCharacterManagerに委譲し、物語に適切なコンテキストを提供します。
 */
export class WorldKnowledge {
    private worldSettings: WorldSettings = this.initializeWorldSettings();
    private establishedEvents: Map<number, EstablishedEvent[]> = new Map();
    private foreshadowElements: Foreshadowing[] = [];
    private lastChangeTimestamp: string = new Date().toISOString();
    private initialized: boolean = false;
    public getGenre(): string {
        return this.worldSettings.genre || 'classic'; // ジャンル情報を返す、なければデフォルト値
    }
    /**
     * コンストラクタ
     * 
     * @param geminiClient AIテキスト生成クライアント（オプション）
     * @param characterManager キャラクターマネージャー（オプション）
     */
    constructor(
        private geminiClient?: GeminiClient,
        private characterManager: CharacterManager = characterManager // デフォルト値としてシングルトンを使用
    ) { }

    /**
     * 初期化処理を実行します
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('WorldKnowledge already initialized');
            return;
        }

        try {
            // ストレージから保存済みのデータを読み込む
            await this.loadFromStorage();

            // ⭐ 修正: PlotManagerからジャンルを取得して設定
            await this.updateGenreFromPlotManager();

            this.initialized = true;
            logger.info('WorldKnowledge initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize WorldKnowledge', { error: error instanceof Error ? error.message : String(error) });
            this.initialized = true;
        }
    }

    // ⭐ 新規追加: PlotManagerからジャンルを取得して更新
    private async updateGenreFromPlotManager(): Promise<void> {
        try {
            const { plotManager } = await import('@/lib/plot');
            const currentGenre = await plotManager.getGenre();
            
            if (currentGenre && currentGenre !== 'classic') {
                logger.info(`Updating WorldKnowledge genre from '${this.worldSettings.genre}' to '${currentGenre}'`);
                
                this.worldSettings = {
                    ...this.worldSettings,
                    genre: currentGenre
                };
                
                // 変更をマーク
                this.lastChangeTimestamp = new Date().toISOString();
                
                logger.info(`WorldKnowledge genre updated to: ${currentGenre}`);
            }
        } catch (error) {
            logger.warn('Failed to update genre from PlotManager', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

        // ⭐ 新規追加: 外部からジャンルを設定するメソッド
    async setGenre(genre: string): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        if (this.worldSettings.genre !== genre) {
            logger.info(`Updating WorldKnowledge genre from '${this.worldSettings.genre}' to '${genre}'`);
            
            this.worldSettings = {
                ...this.worldSettings,
                genre: genre
            };
            
            this.lastChangeTimestamp = new Date().toISOString();
            
            logger.info(`WorldKnowledge genre successfully updated to: ${genre}`);
            
            // 注意: ジャンル更新は即座にメモリ内で反映されます
            // ファイルへの永続化は他の変更と一緒に行われます
        }
    }

    /**
     * ストレージからデータを読み込みます
     */
    private async loadFromStorage(): Promise<void> {
        try {
            // 現在のデータを読み込む（存在すれば）
            const currentExists = await this.storageExists('world-knowledge/current.json');

            if (currentExists) {
                const currentContent = await this.readFromStorage('world-knowledge/current.json');
                const currentData = JSON.parse(currentContent);

                // 世界設定を復元
                if (currentData.worldSettings) {
                    this.worldSettings = currentData.worldSettings;
                }

                // 確立イベントを復元
                if (currentData.establishedEvents && Array.isArray(currentData.establishedEvents)) {
                    this.establishedEvents = new Map(currentData.establishedEvents);
                }

                // 伏線要素を復元
                if (currentData.foreshadowElements && Array.isArray(currentData.foreshadowElements)) {
                    this.foreshadowElements = currentData.foreshadowElements;
                }

                // タイムスタンプを復元
                if (currentData.lastChangeTimestamp) {
                    this.lastChangeTimestamp = currentData.lastChangeTimestamp;
                }
            }
        } catch (error) {
            logger.error('Failed to load WorldKnowledge from storage', { error: error instanceof Error ? error.message : String(error) });
            // エラー時は空の状態で続行
        }
    }


    /**
     * ストレージにパスが存在するか確認します
     */
    private async storageExists(path: string): Promise<boolean> {
        try {
            return await storageProvider.fileExists(path);
        } catch (error) {
            logger.error(`ファイル存在確認エラー: ${path}`, { error });
            return false;
        }
    }

    /**
     * ストレージからデータを読み込みます
     */
    private async readFromStorage(path: string): Promise<string> {
        try {
            // ファイルが存在するか確認
            const exists = await storageProvider.fileExists(path);

            if (exists) {
                // 実際にファイルからデータを読み込む
                return await storageProvider.readFile(path);
            } else {
                logger.warn(`ファイルが存在しません: ${path}`);

                // デフォルト値を返す
                if (path.includes('current.json')) {
                    return JSON.stringify({
                        worldSettings: this.initializeWorldSettings(),
                        establishedEvents: [],
                        foreshadowElements: [],
                        lastChangeTimestamp: new Date().toISOString()
                    });
                }
                return '{}';
            }
        } catch (error) {
            logger.error(`ファイル読み込みエラー: ${path}`, { error });
            return '{}'; // エラー時はデフォルト値を返す
        }
    }

    /**
     * ストレージにデータを書き込みます
     */
    private async writeToStorage(path: string, content: string): Promise<void> {
        try {
            // 親ディレクトリが存在することを確認
            const directory = path.substring(0, path.lastIndexOf('/'));
            if (directory) {
                await storageProvider.createDirectory(directory);
            }

            // ファイルに書き込む
            await storageProvider.writeFile(path, content);
            logger.debug(`ファイルに書き込みました: ${path}`);
        } catch (error) {
            logger.error(`ファイル書き込みエラー: ${path}`, { error });
            throw error;
        }
    }

    /**
     * 世界設定を取得します
     * 
     * @returns {WorldSettings} 世界設定
     */
    getWorldSettings(): WorldSettings {
        return { ...this.worldSettings };
    }

    /**
     * 特定キャラクターの情報を取得します（CharacterManagerに委譲）
     * 
     * @param name キャラクター名
     * @returns {CharacterProfile|null} キャラクタープロファイル、存在しない場合はnull
     */
    async getCharacter(name: string): Promise<CharacterProfile | null> {
        logger.debug(`[WorldKnowledge] getCharacter called for "${name}"`);

        if (!name) {
            logger.warn(`[WorldKnowledge] getCharacter called with empty name`);
            return null;
        }

        try {
            // CharacterManagerに委譲
            const character = await this.characterManager.getCharacterByName(name);
            if (!character) return null;

            // 必要に応じて形式変換
            return this.convertToWorldKnowledgeFormat(character);
        } catch (error) {
            logger.error(`[WorldKnowledge] Error in getCharacter for "${name}": ${error instanceof Error ? error.message : String(error)}`, {
                stack: error instanceof Error ? error.stack : 'No stack trace'
            });

            return null;
        }
    }

    /**
     * すべてのキャラクター情報を取得します（CharacterManagerに委譲）
     * 
     * @returns {CharacterProfile[]} キャラクタープロファイルの配列
     */
    async getAllCharacters(): Promise<CharacterProfile[]> {
        // CharacterManagerに委譲
        const characters = await this.characterManager.getAllCharacters();
        return characters.map(character => this.convertToWorldKnowledgeFormat(character));
    }

    /**
     * 確立されたイベントを取得します
     * 
     * @param chapterRange 章範囲（オプション）
     * @returns {EstablishedEvent[]} 確立されたイベントの配列
     */
    getEstablishedEvents(
        chapterRange?: { start?: number, end?: number }
    ): EstablishedEvent[] {
        try {
            logger.debug(`[WorldKnowledge] getEstablishedEvents called with range: ${chapterRange ? `${chapterRange.start || 0}-${chapterRange.end || 'max'}` : 'all'}`);

            // Map が初期化されているか確認
            if (!this.establishedEvents) {
                logger.warn(`[WorldKnowledge] establishedEvents map is not initialized`);
                return []; // 空の配列を返す
            }

            logger.debug(`[WorldKnowledge] establishedEvents map has ${this.establishedEvents.size} entries`);

            let result: EstablishedEvent[] = [];

            // チャプター範囲が指定されていない場合は全てのイベントを返す
            if (!chapterRange) {
                try {
                    logger.debug(`[WorldKnowledge] collecting all events without range filter`);
                    // flat()を使わず、安全にフラット化する
                    Array.from(this.establishedEvents.entries()).forEach(([chapter, events]) => {
                        if (Array.isArray(events)) {
                            logger.debug(`[WorldKnowledge] adding ${events.length} events from chapter ${chapter}`);
                            result.push(...events);
                        } else {
                            logger.warn(`[WorldKnowledge] events for chapter ${chapter} is not an array`);
                        }
                    });
                } catch (error: unknown) {
                    logger.error(`[WorldKnowledge] error collecting all events: ${error instanceof Error ? error.message : String(error)}`);
                }
            } else {
                const start = chapterRange.start || 0;
                const end = Math.min(chapterRange.end || 100, 100); // 最大100章までに制限

                logger.debug(`[WorldKnowledge] collecting events for chapters ${start} to ${end}`);

                // 指定範囲内のイベントを収集
                for (let chapter = start; chapter <= end; chapter++) {
                    try {
                        if (this.establishedEvents.has(chapter)) {
                            const events = this.establishedEvents.get(chapter);
                            if (Array.isArray(events)) {
                                logger.debug(`[WorldKnowledge] adding ${events.length} events from chapter ${chapter}`);
                                result.push(...events);
                            } else {
                                logger.warn(`[WorldKnowledge] events for chapter ${chapter} is not an array`);
                            }
                        }
                    } catch (error: unknown) {
                        logger.error(`[WorldKnowledge] error processing chapter ${chapter}: ${error instanceof Error ? error.message : String(error)}`);
                    }
                }
            }

            logger.debug(`[WorldKnowledge] collected ${result.length} events in total before sorting`);

            // 空配列の場合は早期リターン（ソートをスキップ）
            if (result.length === 0) {
                logger.debug(`[WorldKnowledge] returning empty array`);
                return [];
            }

            // 安全にソート
            try {
                logger.debug(`[WorldKnowledge] sorting ${result.length} events`);
                result.sort((a, b) => {
                    const chapterA = typeof a.chapter === 'number' ? a.chapter : 0;
                    const chapterB = typeof b.chapter === 'number' ? b.chapter : 0;
                    return chapterA - chapterB;
                });
                logger.debug(`[WorldKnowledge] events sorted successfully`);
            } catch (error: unknown) {
                logger.error(`[WorldKnowledge] error sorting events: ${error instanceof Error ? error.message : String(error)}`);
                // ソートエラーでも結果を返す（ソートなしで）
            }

            return result;
        } catch (error: unknown) {
            logger.error(`[WorldKnowledge] Error in getEstablishedEvents: ${error instanceof Error ? error.message : String(error)}`);
            return []; // 空の配列を返す
        }
    }

    /**
     * キャラクターの永続的事実を確立します
     * 
     * @param eventId イベントID
     * @param characterName キャラクター名
     * @param eventType イベントタイプ
     * @param chapterNumber 章番号
     * @param description イベントの説明
     * @param location 場所（省略可能）
     * @returns {Promise<void>} 処理完了時に解決するPromise
     */
    async establishPersistentFact(
        eventId: string,
        characterName: string,
        eventType: PersistentEventType,
        chapterNumber: number,
        description: string,
        location: string = '不明'
    ): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        // establishEventの仕組みを利用して永続的事実を記録
        await this.establishEvent({
            id: eventId,
            chapter: chapterNumber,
            title: `${characterName}の${eventType}`,
            description: description,
            significance: 0.8, // 永続的イベントは重要度高め
            characters: [characterName],
            timestamp: new Date().toISOString()
        });

        logger.info(`Established persistent fact: ${eventType} for ${characterName} in chapter ${chapterNumber}`);
    }

    /**
     * 特定章の参照に必要なコンテキストを生成します
     * 
     * @param chapterNumber 章番号
     * @returns {string} マークダウン形式のコンテキスト
     */
    async getRelevantContext(chapterNumber: number): Promise<string> {
        logger.debug(`[WorldKnowledge] getRelevantContext starting for chapter ${chapterNumber}`);

        if (!this.initialized) {
            logger.debug(`[WorldKnowledge] initializing first...`);
            await this.initialize();
            logger.debug(`[WorldKnowledge] initialization complete`);
        }

        try {
            // 世界設定の取得
            logger.debug(`[WorldKnowledge] retrieving world settings...`);
            const settings = this.getWorldSettings();
            logger.debug(`[WorldKnowledge] world settings retrieved: ${settings.description.substring(0, 50)}...`);

            // 関連するキャラクターを特定
            logger.debug(`[WorldKnowledge] getting relevant characters...`);
            const relevantCharacters = await this.getRelevantCharacters(chapterNumber);
            logger.debug(`[WorldKnowledge] relevant characters retrieved: ${relevantCharacters.length} characters`);

            // キャラクター内容のログ
            if (relevantCharacters.length > 0) {
                logger.debug(`[WorldKnowledge] first character: ${JSON.stringify({
                    name: relevantCharacters[0].name,
                    hasDescription: !!relevantCharacters[0].description,
                    descriptionLength: relevantCharacters[0].description ? relevantCharacters[0].description.length : 0
                })}`);
            }

            // 関連する確立イベントを特定
            logger.debug(`[WorldKnowledge] getting established events...`);
            const relevantEvents = this.getEstablishedEvents({
                end: chapterNumber - 1 // 現在の章より前のイベントのみ
            }).slice(-5); // 最新5つのみ
            logger.debug(`[WorldKnowledge] established events retrieved: ${relevantEvents.length} events`);

            // 関連する伏線を特定
            logger.debug(`[WorldKnowledge] getting unresolved foreshadowing...`);
            const relevantForeshadowing = this.getUnresolvedForeshadowing()
                .filter(f => f.chapter_introduced <= chapterNumber);
            logger.debug(`[WorldKnowledge] unresolved foreshadowing filtered: ${relevantForeshadowing.length} items`);

            // マークダウン形式でコンテキストを構築
            logger.debug(`[WorldKnowledge] building markdown sections...`);
            const settingsSection = `## 世界設定\n${settings.description}`;
            logger.debug(`[WorldKnowledge] settings section built`);

            logger.debug(`[WorldKnowledge] building characters section...`);
            const charactersSection = relevantCharacters.length > 0
                ? `## 登場キャラクター\n${relevantCharacters.map((c, i) => {
                    logger.debug(`[WorldKnowledge] processing character ${i + 1}/${relevantCharacters.length}: ${c.name}`);
                    return `- **${c.name}**: ${c.description || `キャラクター: ${c.name}`}`;
                }).join('\n')}`
                : '';
            logger.debug(`[WorldKnowledge] characters section built: ${charactersSection.length} chars`);

            logger.debug(`[WorldKnowledge] building events section...`);
            const eventsSection = relevantEvents.length > 0
                ? `## 確立されたイベント\n${relevantEvents.map(e =>
                    `- **${e.title}** (章${e.chapter}): ${e.description}`
                ).join('\n')}`
                : '';
            logger.debug(`[WorldKnowledge] events section built`);

            logger.debug(`[WorldKnowledge] building foreshadowing section...`);
            const foreshadowingSection = relevantForeshadowing.length > 0
                ? `## 未解決の伏線\n${relevantForeshadowing.map(f =>
                    `- **${f.description}** (章${f.chapter_introduced}で導入)`
                ).join('\n')}`
                : '';
            logger.debug(`[WorldKnowledge] foreshadowing section built`);

            // 各セクションを結合
            logger.debug(`[WorldKnowledge] joining all sections...`);
            const result = [
                settingsSection,
                charactersSection,
                eventsSection,
                foreshadowingSection
            ].filter(s => s).join('\n\n');

            logger.debug(`[WorldKnowledge] getRelevantContext completed: ${result.length} chars`);
            return result;
        } catch (error) {
            logger.error(`[WorldKnowledge] Error in getRelevantContext: ${error instanceof Error ? error.message : String(error)}`, {
                stack: error instanceof Error ? error.stack : 'No stack trace',
                chapterNumber
            });
            // エラー時は最小限のコンテキストを返す
            return `## 世界設定\n基本的な物語世界`;
        }
    }

    // キャッシュ用のプロパティを追加
    private extractionCache: Record<string, string[]> = {};

    /**
     * 章からキャラクター名を抽出（AI支援）
     * 
     * AIを使用して、章のテキストからキャラクター名を抽出します。
     * AIリクエスト数を最適化するため、キャッシュ機構を使用します。
     * 
     * @param {string} content 章のテキスト内容
     * @returns {Promise<string[]>} 抽出されたキャラクター名の配列
     */
    async extractCharacterNames(content: string): Promise<string[]> {
        // キャラクターマネージャーに処理を委譲
        try {
            // CharacterManagerのdetectCharactersInContentメソッドを使用
            const characters = await this.characterManager.detectCharactersInContent(content);
            return characters.map(char => char.name);
        } catch (error) {
            logger.error('キャラクター名抽出エラー', { error });

            // エラー時はシンプルなルールベース抽出でフォールバック
            return this.extractCharacterNamesRuleBased(content);
        }
    }

    /**
 * 章からキャラクター情報を更新
 * @param characterNames 検出されたキャラクター名のリスト
 * @param chapterNumber 章番号
 */
    async updateCharactersFromChapter(characterNames: string[], chapterNumber: number): Promise<void> {
        try {
            // 直近のイベントを取得
            const recentEvents = this.getEstablishedEvents({
                start: chapterNumber,
                end: chapterNumber
            });

            // 各イベントをキャラクター情報で更新
            for (const event of recentEvents) {
                // イベント説明内に出現するキャラクターを検出
                const appearedInEvent = characterNames.filter(name =>
                    event.description.includes(name)
                );

                // キャラクターが検出された場合、イベントを更新
                if (appearedInEvent.length > 0) {
                    event.characters = appearedInEvent;
                    await this.establishEvent(event);
                }
            }

            logger.debug(`Updated characters for ${recentEvents.length} events in chapter ${chapterNumber}`);
        } catch (error) {
            logger.error('Failed to update characters from chapter', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber: chapterNumber
            });
        }
    }

    /**
     * ルールベースのキャラクター名抽出（バックアップ）
     */
    private extractCharacterNamesRuleBased(content: string): string[] {
        // 括弧内のキャラクター名を抽出（3文字以上のみ）
        const validCharacterRegex = /「([一-龯ぁ-んァ-ヶ]{3,10})」/g;
        const nameSet = new Set<string>();
        let match;

        while ((match = validCharacterRegex.exec(content)) !== null) {
            nameSet.add(match[1]);
        }

        const names = Array.from(nameSet);
        logger.debug(`ルールベース抽出: ${names.length}個のキャラクター名を検出`);

        return names;
    }

    /**
     * 特定章に関連するキャラクターを取得します
     * 
     * @param chapterNumber 章番号
     * @returns {Promise<CharacterProfile[]>} キャラクタープロファイルの配列
     */
    private async getRelevantCharacters(chapterNumber: number): Promise<CharacterProfile[]> {
        logger.debug(`[WorldKnowledge] getRelevantCharacters starting for chapter ${chapterNumber}`);

        if (!this.initialized) {
            logger.debug(`[WorldKnowledge] initializing first...`);
            await this.initialize();
            logger.debug(`[WorldKnowledge] initialization complete`);
        }

        try {
            // 最近の章に登場したキャラクターを特定
            const relevantCharacterNames = new Set<string>();

            // 直近10章を対象
            const recentChapterStart = Math.max(1, chapterNumber - 10);
            logger.debug(`[WorldKnowledge] scanning chapters ${recentChapterStart} to ${chapterNumber}`);

            for (let i = recentChapterStart; i <= chapterNumber; i++) {
                logger.debug(`[WorldKnowledge] checking events for chapter ${i}`);
                const events = this.establishedEvents.get(i) || [];
                logger.debug(`[WorldKnowledge] found ${events.length} events for chapter ${i}`);

                // イベントに関連するキャラクターを収集
                events.forEach((event, idx) => {
                    logger.debug(`[WorldKnowledge] processing event ${idx + 1}/${events.length} in chapter ${i}`);

                    if (event.characters && Array.isArray(event.characters)) {
                        logger.debug(`[WorldKnowledge] event has ${event.characters.length} characters`);
                        event.characters.forEach(char => {
                            if (char) {
                                relevantCharacterNames.add(char);
                                logger.debug(`[WorldKnowledge] added character "${char}" to relevant names`);
                            }
                        });
                    } else {
                        logger.debug(`[WorldKnowledge] event has no characters array`);
                    }
                });
            }

            logger.debug(`[WorldKnowledge] found ${relevantCharacterNames.size} unique character names`);

            // CharacterManagerから関連キャラクターを取得
            const relevantCharacters: CharacterProfile[] = [];

            for (const name of relevantCharacterNames) {
                const character = await this.characterManager.getCharacterByName(name);
                if (character) {
                    // 内部形式からWorldKnowledge形式に変換
                    relevantCharacters.push(this.convertToWorldKnowledgeFormat(character));
                }
            }

            // イベントに関連するキャラクターがいない場合のフォールバック
            if (relevantCharacters.length === 0) {
                logger.debug(`[WorldKnowledge] no relevant characters found, adding default characters`);

                // メインキャラクターを取得
                const mainCharacters = await this.characterManager.getCharactersByType('MAIN');

                // 最大3つまでのメインキャラクターを変換
                for (const mainChar of mainCharacters.slice(0, 3)) {
                    relevantCharacters.push(this.convertToWorldKnowledgeFormat(mainChar));
                }

                // それでも見つからない場合はダミーキャラクターを追加
                if (relevantCharacters.length === 0) {
                    logger.debug(`[WorldKnowledge] still no characters, adding dummy character`);

                    relevantCharacters.push({
                        name: "主要キャラクター",
                        description: "物語の中心となる人物",
                        firstAppearance: 1,
                        created: new Date().toISOString(),
                        lastUpdated: new Date().toISOString()
                    });

                    logger.debug(`[WorldKnowledge] dummy character added`);
                }
            }

            logger.debug(`[WorldKnowledge] getRelevantCharacters completed, returning ${relevantCharacters.length} characters`);
            return relevantCharacters;
        } catch (error) {
            logger.error(`[WorldKnowledge] Error in getRelevantCharacters: ${error instanceof Error ? error.message : String(error)}`, {
                stack: error instanceof Error ? error.stack : 'No stack trace',
                chapterNumber
            });

            // エラー時は空の配列を返す
            return [];
        }
    }

    /**
     * 世界設定を更新します
     * 
     * @param settings 更新する設定（部分的）
     * @returns {Promise<void>} 処理完了時に解決するPromise
     */
    async updateWorldSettings(settings: Partial<WorldSettings>): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        // 現在の設定とマージ
        this.worldSettings = { ...this.worldSettings, ...settings };

        // バージョン管理を削除し、タイムスタンプのみ更新
        this.lastChangeTimestamp = new Date().toISOString();

        // 永続化（キャラクター情報を含まない保存）
        await this.saveWithoutCharacters();

        logger.info(`Updated world settings`);
    }

    /**
 * 物語の要約を取得します
 * @param chapterRange 章範囲（オプション）
 * @returns {any[]} 物語要約の配列
 */
    getSummaries(chapterRange?: { start?: number, end?: number }): any[] {
        try {
            logger.debug(`[WorldKnowledge] getSummaries called with range: ${chapterRange ? `${chapterRange.start || 0}-${chapterRange.end || 'max'}` : 'all'}`);

            // 確立されたイベントを取得
            const events = this.getEstablishedEvents(chapterRange);

            // イベントからサマリーを生成
            const summaries = events.map(event => ({
                id: event.id,
                chapter: event.chapter,
                title: event.title,
                summary: event.description,
                timestamp: event.timestamp,
                characters: event.characters || []
            }));

            logger.debug(`[WorldKnowledge] generated ${summaries.length} summaries`);
            return summaries;
        } catch (error) {
            logger.error(`[WorldKnowledge] Error in getSummaries: ${error instanceof Error ? error.message : String(error)}`);
            return []; // エラー時は空の配列を返す
        }
    }

    /**
     * キャラクター情報を追加または更新します（CharacterManagerに委譲）
     * 
     * @param character キャラクタープロファイル
     * @returns {Promise<void>} 処理完了時に解決するPromise
     */
    async addOrUpdateCharacter(character: CharacterProfile): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        // CharacterManagerに委譲
        const managerFormat = this.convertToCharacterManagerFormat(character);

        const existingChar = await this.characterManager.getCharacterByName(character.name);
        if (existingChar) {
            await this.characterManager.updateCharacter(existingChar.id, managerFormat);
            logger.info(`Updated character: ${character.name}`);
            // } else {
            //     await this.characterManager.addCharacter(managerFormat);
            //     logger.info(`Added new character: ${character.name}`);
        }

        // タイムスタンプを更新
        this.lastChangeTimestamp = new Date().toISOString();

        // 永続化（キャラクター情報は保存しない）
        await this.saveWithoutCharacters();
    }

    /**
     * CharacterManagerのキャラクター形式に変換するヘルパーメソッド
     * 
     * @param profile WorldKnowledge形式のキャラクター
     * @returns CharacterManager形式に変換したキャラクター
     */
    private convertToCharacterManagerFormat(profile: CharacterProfile): any {
        return {
            name: profile.name,
            type: 'MOB',  // デフォルトタイプはMOB
            description: profile.description,
            personality: {
                traits: profile.traits || []
            },
            backstory: {
                summary: `${profile.name}はチャプター${profile.firstAppearance}で初登場`,
                significantEvents: []
            },
            state: {
                isActive: true,
                emotionalState: 'NEUTRAL',
                developmentStage: 0,
                lastAppearance: profile.firstAppearance
            }
        };
    }

    /**
     * CharacterManagerのキャラクターをWorldKnowledge形式に変換するヘルパーメソッド
     * 
     * @param character CharacterManager形式のキャラクター
     * @returns WorldKnowledge形式に変換したキャラクター
     */
    private convertToWorldKnowledgeFormat(character: any): CharacterProfile {
        const relationships = character.relationships?.map((rel: any) => ({
            target: rel.targetName || rel.targetId,
            relation: rel.type || '',
            strength: rel.strength || 0.5
        })) || [];

        return {
            name: character.name,
            description: character.description || `${character.name} - キャラクター`,
            traits: character.personality?.traits || [],
            firstAppearance: character.state?.lastAppearance || character.history?.appearances?.[0]?.chapterNumber || 1,
            created: character.metadata?.createdAt?.toISOString() || new Date().toISOString(),
            lastUpdated: character.metadata?.lastUpdated?.toISOString() || new Date().toISOString(),
            relationships
        };
    }

    /**
     * イベントを確立します
     * 
     * @param event イベント情報
     * @returns {Promise<void>} 処理完了時に解決するPromise
     */
    async establishEvent(event: EstablishedEvent): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        // 章番号のマップが存在しなければ初期化
        if (!this.establishedEvents.has(event.chapter)) {
            this.establishedEvents.set(event.chapter, []);
        }

        // イベントにIDがなければ追加
        if (!event.id) {
            event.id = `event-${event.chapter}-${Date.now()}`;
        }

        // タイムスタンプがなければ追加
        if (!event.timestamp) {
            event.timestamp = new Date().toISOString();
        }

        // イベントを追加
        this.establishedEvents.get(event.chapter)!.push(event);

        // タイムスタンプを更新
        this.lastChangeTimestamp = new Date().toISOString();

        // 永続化（キャラクター情報は保存しない）
        await this.saveWithoutCharacters();

        logger.info(`Established event: ${event.title} in chapter ${event.chapter}`);
    }

    /**
     * 伏線を追加します
     * 
     * @param element 伏線要素（部分的）
     * @returns {Promise<Foreshadowing>} 追加された伏線
     */
    async addForeshadowing(element: Partial<Foreshadowing>): Promise<Foreshadowing> {
        if (!this.initialized) {
            await this.initialize();
        }

        // 必須フィールドの検証
        if (!element.description) {
            throw new Error('Foreshadowing description is required');
        }

        if (!element.chapter_introduced) {
            throw new Error('Chapter introduced is required');
        }

        // 完全な伏線オブジェクトの作成
        const newElement: Foreshadowing = {
            id: element.id || `fs-${Date.now()}`,
            description: element.description,
            chapter_introduced: element.chapter_introduced,
            resolved: element.resolved || false,
            urgency: element.urgency || 'medium',
            createdTimestamp: element.createdTimestamp || new Date().toISOString(),
            updatedTimestamp: element.updatedTimestamp || new Date().toISOString(),
            // オプションフィールド
            potential_resolution: element.potential_resolution,
            resolution_chapter: element.resolution_chapter,
            resolution_description: element.resolution_description,
            plannedResolution: element.plannedResolution,
            relatedCharacters: element.relatedCharacters || [],
            significance: element.significance || 5
        };

        // 伏線リストに追加
        this.foreshadowElements.push(newElement);

        // タイムスタンプを更新
        this.lastChangeTimestamp = new Date().toISOString();

        // 永続化（キャラクター情報は保存しない）
        await this.saveWithoutCharacters();

        logger.info(`Added foreshadowing: ${newElement.description} in chapter ${newElement.chapter_introduced}`);

        return newElement;
    }

    /**
     * 伏線を解決します
     * 
     * @param id 伏線ID
     * @param resolutionChapter 解決章番号
     * @param resolutionDescription 解決内容
     * @returns {Promise<void>} 処理完了時に解決するPromise
     */
    async resolveForeshadowing(
        id: string,
        resolutionChapter: number,
        resolutionDescription: string
    ): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        // IDで伏線を検索
        const index = this.foreshadowElements.findIndex(f => f.id === id);

        if (index === -1) {
            throw new Error(`Foreshadowing with ID ${id} not found`);
        }

        // 伏線を解決済みに更新
        this.foreshadowElements[index] = {
            ...this.foreshadowElements[index],
            resolved: true,
            resolution_chapter: resolutionChapter,
            resolution_description: resolutionDescription,
            updatedTimestamp: new Date().toISOString()
        };

        // タイムスタンプを更新
        this.lastChangeTimestamp = new Date().toISOString();

        // 永続化（キャラクター情報は保存しない）
        await this.saveWithoutCharacters();

        logger.info(`Resolved foreshadowing: ${this.foreshadowElements[index].description} in chapter ${resolutionChapter}`);
    }

    /**
     * 伏線を更新します
     * 
     * @param id 伏線ID
     * @param updates 更新データ
     * @returns {Promise<Foreshadowing>} 更新された伏線
     */
    async updateForeshadowing(
        id: string,
        updates: Partial<Foreshadowing>
    ): Promise<Foreshadowing> {
        if (!this.initialized) {
            await this.initialize();
        }

        // IDで伏線を検索
        const index = this.foreshadowElements.findIndex(f => f.id === id);

        if (index === -1) {
            throw new Error(`Foreshadowing with ID ${id} not found`);
        }

        // 伏線を更新
        this.foreshadowElements[index] = {
            ...this.foreshadowElements[index],
            ...updates,
            updatedTimestamp: new Date().toISOString()
        };

        // タイムスタンプを更新
        this.lastChangeTimestamp = new Date().toISOString();

        // 永続化（キャラクター情報は保存しない）
        await this.saveWithoutCharacters();

        logger.info(`Updated foreshadowing: ${this.foreshadowElements[index].description}`);

        return this.foreshadowElements[index];
    }

    /**
     * 未解決の伏線を取得します
     * 
     * @returns {Foreshadowing[]} 未解決の伏線の配列
     */
    getUnresolvedForeshadowing(): Foreshadowing[] {
        return this.foreshadowElements.filter(f => !f.resolved);
    }

    /**
     * 解決済みの伏線を取得します
     * 
     * @returns {Foreshadowing[]} 解決済みの伏線の配列
     */
    getResolvedForeshadowing(): Foreshadowing[] {
        return this.foreshadowElements.filter(f => f.resolved);
    }

    /**
     * 最近追加された伏線を取得します
     * 
     * @param chapterNumber 現在のチャプター番号
     * @param limit 最大取得数
     * @returns {Foreshadowing[]} 最近追加された伏線の配列
     */
    async getRecentForeshadowing(chapterNumber: number, limit: number = 3): Promise<Foreshadowing[]> {
        const unresolved = this.getUnresolvedForeshadowing();

        // チャプター番号で降順ソート（最新のものが先頭）
        const sorted = unresolved.sort((a, b) => b.chapter_introduced - a.chapter_introduced);

        // 指定された章数以内に導入された伏線のみをフィルタリング
        const recent = sorted.filter(fs => fs.chapter_introduced >= Math.max(1, chapterNumber - 5));

        // 指定された数だけ返す
        return recent.slice(0, limit);
    }

    /**
     * すべての伏線を取得します
     * 
     * @returns {Foreshadowing[]} 伏線の配列
     */
    getAllForeshadowing(): Foreshadowing[] {
        return [...this.foreshadowElements];
    }

    /**
     * 世界設定の初期化
     * 
     * @returns {WorldSettings} 初期世界設定
     */
    private initializeWorldSettings(): WorldSettings {
        return {
            description: '基本的な物語世界',
            regions: [],
            history: [],
            rules: [],
            genre: 'classic' // デフォルト値（後でupdateGenreFromPlotManager()で更新される）
        };
    }

    /**
     * キャラクター情報を除いた永続化を行う
     * 
     * @private
     */
    private async saveWithoutCharacters(): Promise<void> {
        try {
            // 現在のデータを保存（キャラクター情報を除く）
            const currentData = {
                worldSettings: this.worldSettings,
                establishedEvents: Array.from(this.establishedEvents.entries()),
                foreshadowElements: this.foreshadowElements,
                lastChangeTimestamp: this.lastChangeTimestamp
            };

            // メインデータファイルに保存
            await this.writeToStorage(
                'world-knowledge/current.json',
                JSON.stringify(currentData, null, 2)
            );

            logger.info(`WorldKnowledge saved successfully`);
        } catch (error) {
            logger.error('Failed to save world knowledge', { error });
            throw error;
        }
    }

    /**
     * 旧形式のデータからインポート
     */
    async importLegacyData(legacyData: any): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        // 世界設定をインポート
        if (legacyData.worldSettings) {
            this.worldSettings = legacyData.worldSettings;
        }

        // キャラクタープロファイルをインポート
        if (legacyData.characterProfiles && Array.isArray(legacyData.characterProfiles)) {
            for (const profile of legacyData.characterProfiles) {
                await this.addOrUpdateCharacter({
                    name: profile.name,
                    description: profile.description || `${profile.name} - キャラクター`,
                    traits: profile.traits || [],
                    firstAppearance: profile.firstAppearance || 1,
                    created: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                });
            }
        }

        // 伏線をインポート
        if (legacyData.foreshadowElements && Array.isArray(legacyData.foreshadowElements)) {
            for (const element of legacyData.foreshadowElements) {
                await this.addForeshadowing(element);
            }
        }

        logger.info('Successfully imported legacy data');
    }

    /**
     * 状態情報を取得します
     * 
     * @returns {Promise<WorldKnowledgeStatus>} 世界知識の状態情報
     */
    async getStatus(): Promise<WorldKnowledgeStatus> {
        if (!this.initialized) {
            await this.initialize();
        }

        // CharacterManagerからキャラクター数を取得
        const characters = await this.characterManager.getAllCharacters();

        return {
            initialized: this.initialized,
            characterCount: characters.length,
            eventCount: Array.from(this.establishedEvents.values()).flat().length,
            foreshadowingCount: this.foreshadowElements.length,
            lastUpdateTime: this.lastChangeTimestamp
        };
    }

    /**
     * キャラクターデータを更新（キャラクター変更反映用）
     */
    async refreshCharacterData(characterId: string): Promise<void> {
        // 基本的にはCharacterManagerにすべて委譲しているため、
        // このメソッドでの特別な処理は不要
        logger.info(`Character data refreshed: ${characterId}`);
    }

    /**
     * 重複する伏線をチェックします
     */
    async checkDuplicateForeshadowing(description: string): Promise<boolean> {
        try {
            // 既存の伏線を取得
            const existingForeshadowing = await this.getUnresolvedForeshadowing();

            // 説明文の類似性をチェック（シンプルな文字列比較）
            for (const fs of existingForeshadowing) {
                // 説明文の50%以上が一致するかチェック
                const similarity = this.calculateStringSimilarity(
                    description.toLowerCase(),
                    fs.description.toLowerCase()
                );

                if (similarity > 0.5) {
                    return true; // 重複あり
                }
            }

            return false; // 重複なし
        } catch (error) {
            logger.error('伏線の重複チェック中にエラーが発生', { error });
            return false; // エラー時は重複なしとして扱う
        }
    }

    /**
     * 2つの文字列の類似性を計算します（0〜1の値）
     */
    private calculateStringSimilarity(str1: string, str2: string): number {
        // シンプルな実装 - 長い方の文字列に含まれる短い方の単語の割合
        const words1 = str1.split(/\s+/);
        const words2 = str2.split(/\s+/);

        const [shorter, longer] = words1.length <= words2.length
            ? [words1, words2]
            : [words2, words1];

        let matchCount = 0;
        for (const word of shorter) {
            if (longer.includes(word)) {
                matchCount++;
            }
        }

        return matchCount / shorter.length;
    }
}