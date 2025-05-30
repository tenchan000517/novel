// src/lib/memory/immediate-context.ts
import { Chapter } from '@/types/chapters';
import { CharacterState } from '@/types/memory';
import { logger } from '@/lib/utils/logger';
import { TextAnalyzerService } from './text-analyzer-service';
import { storageProvider } from '@/lib/storage';
import { characterManager } from '@/lib/characters/manager';
import { Character } from '@/types/characters';
import { CharacterChangeInfo } from '@/types/characters';

/**
 * @interface ImmediateContextStatus
 * @description 即時コンテキストの状態情報を表す型定義
 */
interface ImmediateContextStatus {
    initialized: boolean;
    chapterCount: number;
    lastUpdateTime: string | null;
}

/**
 * @class ImmediateContext
 * @description
 * 物語の直近のチャプター（最大3章）の生テキストと基本的なコンテキスト情報を保持する
 * 即時コンテキスト管理クラスです。章をまたいだ自然な連続性を提供します。
 * AIリクエストの依存度を最小限に抑え、主にルールベースの抽出を行います。
 */
export class ImmediateContext {
    private static readonly MAX_CHAPTERS = 3; // 最大3章のみ保持
    private recentChapters: {
        chapter: Chapter;
        characterState: Map<string, CharacterState>;
        keyPhrases: string[];
        timestamp: string;
    }[] = [];

    // キャッシュマップ
    private chapterCache: Map<number, Chapter> = new Map();
    private characterStateWithMetadata: Map<number, any[]> = new Map();

    private initialized: boolean = false;

    /**
     * コンストラクタ
     * 
     * @param textAnalyzer テキスト分析サービス（オプション）
     */
    constructor(private textAnalyzer?: TextAnalyzerService) { }

    /**
     * 初期化処理を実行します
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('ImmediateContext already initialized');
            return;
        }

        try {
            // ストレージから保存済みのメタデータを読み込む
            await this.loadFromStorage();

            this.initialized = true;
            logger.info('ImmediateContext initialized successfully');
        } catch (error: unknown) {
            logger.error('Failed to initialize ImmediateContext', { error: error instanceof Error ? error.message : String(error) });
            // 初期化に失敗しても、空の状態で続行
            this.initialized = true;
        }
    }

    /**
     * ストレージからデータを読み込みます
     */
    private async loadFromStorage(): Promise<void> {
        try {
            // メタデータを読み込む（存在すれば）
            const metadataExists = await this.storageExists('immediate-context/metadata.json');

            if (metadataExists) {
                const metadataContent = await this.readFromStorage('immediate-context/metadata.json');
                const metadata = JSON.parse(metadataContent);

                // メタデータから最近のチャプター情報を取得
                if (metadata.recentChapters && Array.isArray(metadata.recentChapters)) {
                    // 各チャプターを読み込む
                    for (const chapterMeta of metadata.recentChapters) {
                        const chapterPath = `chapters/chapter_${chapterMeta.chapterNumber}.json`;
                        if (await this.storageExists(chapterPath)) {
                            const chapterContent = await this.readFromStorage(chapterPath);
                            const chapter = JSON.parse(chapterContent) as Chapter;

                            // キャッシュに追加
                            this.chapterCache.set(chapter.chapterNumber, chapter);

                            // チャプター状態を再構築
                            const characterState = new Map<string, CharacterState>();

                            // キーフレーズを抽出
                            const keyPhrases = this.extractKeyPhrases(chapter.content);

                            // 再構築したデータを追加
                            this.recentChapters.push({
                                chapter,
                                characterState,
                                keyPhrases,
                                timestamp: chapterMeta.timestamp
                            });

                            // 最大数を維持
                            if (this.recentChapters.length > ImmediateContext.MAX_CHAPTERS) {
                                this.recentChapters = this.recentChapters.slice(0, ImmediateContext.MAX_CHAPTERS);
                            }
                        }
                    }
                }
            }
        } catch (error: unknown) {
            logger.error('Failed to load ImmediateContext from storage', { error: error instanceof Error ? error.message : String(error) });
            // エラー時は空の状態で続行
        }
    }

    /**
     * ストレージにパスが存在するか確認します
     */
    private async storageExists(path: string): Promise<boolean> {
        try {
            return await storageProvider.fileExists(path);
        } catch (error: unknown) {
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

                // パスに応じたデフォルト値を返す
                if (path.includes('metadata.json')) {
                    return JSON.stringify({
                        recentChapters: [],
                        lastUpdateTime: new Date().toISOString()
                    });
                }

                return '{}'; // その他のファイルのデフォルト値
            }
        } catch (error: unknown) {
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
        } catch (error: unknown) {
            logger.error(`ファイル書き込みエラー: ${path}`, { error });
            throw error;
        }
    }

    /**
     * 章を追加し、即時コンテキストを更新します
     */
    async addChapter(chapter: Chapter): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        // キャラクター状態の抽出 - ルールベースの抽出を優先、必要に応じてAI分析
        const characterState = await this.extractCharacterState(chapter);

        // キーフレーズの抽出 - 正規表現ベースで実装
        const keyPhrases = this.extractKeyPhrases(chapter.content);

        // 新しいコンテキストを追加
        this.recentChapters.unshift({
            chapter,
            characterState,
            keyPhrases,
            timestamp: new Date().toISOString()
        });

        // 最大保持数を超えたら古いものを削除
        if (this.recentChapters.length > ImmediateContext.MAX_CHAPTERS) {
            this.recentChapters = this.recentChapters.slice(0, ImmediateContext.MAX_CHAPTERS);
        }

        // キャッシュの更新
        this.chapterCache.set(chapter.chapterNumber, chapter);

        // 永続化
        await this.save();

        logger.info(`Added chapter ${chapter.chapterNumber} to ImmediateContext`);
    }

    /**
     * 最新の章を取得します
     */
    getLatestChapter(): Chapter | null {
        return this.recentChapters[0]?.chapter || null;
    }

    /**
     * 最近の章情報を取得します
     * 
     * @param upToChapter 取得する最大章番号（オプション）
     * @returns 最近の章情報配列
     */
    async getRecentChapters(upToChapter?: number): Promise<{
        chapter: Chapter;
        characterState: Map<string, CharacterState>;
        keyPhrases: string[];
        timestamp: string;
    }[]> {
        if (!this.initialized) {
            await this.initialize();
        }

        if (upToChapter === undefined) {
            return [...this.recentChapters];
        }

        return this.recentChapters.filter(item => item.chapter.chapterNumber <= upToChapter);
    }

    /**
     * 指定された章番号の章を取得します
     */
    async getChapter(chapterNumber: number): Promise<Chapter | null> {
        if (!this.initialized) {
            await this.initialize();
        }

        // キャッシュにあればそこから返す
        if (this.chapterCache.has(chapterNumber)) {
            return this.chapterCache.get(chapterNumber) || null;
        }

        // 最近の章から検索
        const found = this.recentChapters.find(item => item.chapter.chapterNumber === chapterNumber);

        if (found) {
            return found.chapter;
        }

        // ストレージから読み込み試行
        try {
            const chapterPath = `chapters/chapter_${chapterNumber}.json`;
            if (await this.storageExists(chapterPath)) {
                const chapterData = await this.readFromStorage(chapterPath);
                const chapter = JSON.parse(chapterData) as Chapter;
                this.chapterCache.set(chapterNumber, chapter);
                return chapter;
            }
        } catch (error: unknown) {
            logger.warn(`Chapter ${chapterNumber} not found in storage`);
        }

        return null;
    }

    /**
     * 繰り返し使用されているフレーズを検出します
     * 
     * @param threshold 閾値（デフォルト3）
     * @returns 繰り返されているフレーズの配列
     */
    async getRepeatedPhrases(threshold: number = 3): Promise<string[]> {
        if (!this.initialized) {
            await this.initialize();
        }

        // キーフレーズを統合
        const allPhrases = this.recentChapters.flatMap(item => item.keyPhrases);

        // 出現頻度カウント
        const phraseCount = new Map<string, number>();
        allPhrases.forEach(phrase => {
            const count = phraseCount.get(phrase) || 0;
            phraseCount.set(phrase, count + 1);
        });

        // 閾値以上の頻度で出現するフレーズを抽出
        return Array.from(phraseCount.entries())
            .filter(([_, count]) => count >= threshold)
            .map(([phrase]) => phrase);
    }

    /**
     * 章からキャラクター状態を抽出します
     */
    private async extractCharacterState(chapter: Chapter): Promise<Map<string, CharacterState>> {
        const result = new Map<string, CharacterState>();

        // キャラクターマネージャーからすべてのキャラクター一覧を取得
        const allCharacters = await this.getAllRegisteredCharacters();
        
        // 各キャラクターについて、テキスト内での出現を確認
        for (const character of allCharacters) {
            if (this.isCharacterPresentInContent(character.name, chapter.content)) {
                result.set(character.name, {
                    name: character.name,
                    mood: this.detectCharacterMood(chapter.content, character.name),
                    development: ""
                });
            }
        }

        // テキスト分析サービスがあれば、より詳細な分析を実行
        if (this.textAnalyzer && result.size > 0) {
            try {
                const analyzedStates = await this.textAnalyzer.analyzeCharacterStates(
                    chapter.content,
                    Array.from(result.keys())
                );

                // 分析結果で状態を更新
                analyzedStates.forEach(state => {
                    if (result.has(state.name)) {
                        result.set(state.name, {
                            ...result.get(state.name)!,
                            ...state
                        });
                    } else {
                        result.set(state.name, state);
                    }
                });
            } catch (error: unknown) {
                logger.warn('Failed to analyze character states using AI, using rule-based extraction only', { error: error instanceof Error ? error.message : String(error) });
            }
        }

        return result;
    }

    /**
     * すべての登録済みキャラクターを取得する
     * キャラクターマネージャーとの連携を想定
     * 
     * @private
     * @returns {Promise<any[]>} キャラクター配列
     */
    private async getAllRegisteredCharacters(): Promise<Character[]> {
        try {
            // 直接インポートしたシングルトンのcharacterManagerを使用
            try {
                // characterManager シングルトンを使用
                return await characterManager.getAllCharacters();
            } catch (err) {
                // シングルトンでエラーが発生した場合はストレージからフォールバック
                logger.warn('Failed to get characters from characterManager, falling back to storage', {
                    error: err instanceof Error ? err.message : String(err)
                });
                
                // ストレージから取得
                const mainCharacters = await this.getCharactersFromStorage('characters/main');
                const subCharacters = await this.getCharactersFromStorage('characters/sub-characters');
                const mobCharacters = await this.getCharactersFromStorage('characters/mob-characters');
                
                return [...mainCharacters, ...subCharacters, ...mobCharacters];
            }
        } catch (error) {
            logger.warn('Failed to get registered characters', { 
                error: error instanceof Error ? error.message : String(error) 
            });
            return [];
        }
    }
    
    /**
     * ストレージからキャラクター情報を取得する
     * 
     * @private
     * @param {string} path ストレージパス
     * @returns {Promise<any[]>} キャラクター配列
     */
    private async getCharactersFromStorage(path: string): Promise<any[]> {
        try {
            const files = await storageProvider.listFiles(path);
            const characters = [];
            
            for (const file of files) {
                if (file.endsWith('.json') || file.endsWith('.yaml')) {
                    try {
                        const content = await storageProvider.readFile(file);
                        const character = file.endsWith('.json') 
                            ? JSON.parse(content)
                            : {}; // YAML対応が必要ならここに追加
                        
                        if (character && character.name) {
                            characters.push(character);
                        }
                    } catch (fileError) {
                        logger.warn(`Failed to read character file: ${file}`, {
                            error: fileError instanceof Error ? fileError.message : String(fileError)
                        });
                    }
                }
            }
            
            return characters;
        } catch (error) {
            logger.warn(`Failed to list character files from: ${path}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * キャラクターがコンテンツ内に存在するか確認
     * 
     * @private
     * @param {string} name キャラクター名
     * @param {string} content 内容テキスト
     * @returns {boolean} 存在するかどうか
     */
    private isCharacterPresentInContent(name: string, content: string): boolean {
        // 2文字未満の名前は除外（誤検出リスクが高い）
        if (name.length < 2) return false;
        
        // 名前をエスケープして正規表現で使用できるようにする
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // 文脈に応じたキャラクター出現パターン
        const contextPatterns = [
            new RegExp(`${escapedName}[はがのをに]`, 'g'),  // 助詞を伴う出現
            new RegExp(`「${escapedName}」`, 'g'),          // 引用部での出現
            new RegExp(`「${escapedName}[、。」]`, 'g'),    // 発言者として
            new RegExp(`${escapedName}[（(]`, 'g'),         // 補足説明内での出現
            new RegExp(`[。、」!?]\s*${escapedName}`, 'g')  // 文の区切り後の出現
        ];
        
        // いずれかのパターンにマッチするか
        return contextPatterns.some(pattern => pattern.test(content));
    }

    /**
     * キャラクターのムードを検出する
     * 
     * @private
     * @param {string} content 内容テキスト
     * @param {string} name キャラクター名
     * @returns {string} ムード
     */
    private detectCharacterMood(content: string, name: string): string {
        // キャラクター名の前後のテキストを取得するための正規表現
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const nameContextPattern = new RegExp(`([^。]+${escapedName}[^。]*[はがのをに][^。]*。)`, 'g');
        const matches = Array.from(content.matchAll(nameContextPattern)).map(m => m[1] || '');
        
        // 感情キーワードの定義
        const moodKeywords = {
            '喜び': ['笑', '嬉し', '楽し', '喜'],
            '悲しみ': ['泣', '悲し', '辛', '寂し'],
            '怒り': ['怒', '激怒', '苛立', '不満'],
            '恐怖': ['恐', '怖', '震え', '怯え'],
            '驚き': ['驚', 'びっくり', '目を見開'],
            '平静': ['冷静', '落ち着', '静か']
        };

        // 感情カウント
        const moodCounts: Record<string, number> = {};
        Object.keys(moodKeywords).forEach(mood => {
            moodCounts[mood] = 0;
        });

        // 各マッチについて感情キーワードをカウント
        matches.forEach(matchText => {
            Object.entries(moodKeywords).forEach(([mood, keywords]) => {
                if (keywords.some(keyword => matchText.includes(keyword))) {
                    moodCounts[mood]++;
                }
            });
        });

        // 最も多く検出された感情を返す
        const maxMood = Object.entries(moodCounts)
            .reduce((max, [mood, count]) => count > max[1] ? [mood, count] : max, ['不明', 0]);

        return maxMood[1] > 0 ? maxMood[0] : '不明';
    }

    /**
     * 章からキーフレーズを抽出します（正規表現ベース）
     */
    private extractKeyPhrases(text: string): string[] {
        // 特徴的な表現パターンを抽出する正規表現
        const patterns = [
            // 強調表現
            /「.*?」/g,
            // 描写パターン
            /[一-龯ぁ-んァ-ヶ]{3,}(した|している|していた)/g,
            // 特徴的な接続詞パターン
            /(しかし|けれども|だから|それゆえに|ところが)[、。]/g,
            // 文末表現
            /[一-龯ぁ-んァ-ヶ]{2,}(だった|である|だろう)[。]/g
        ];

        // パターンに一致する表現を抽出
        const phrases: string[] = [];
        patterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                phrases.push(...matches);
            }
        });

        // 重複を除去して返却（最大100個まで）
        return [...new Set(phrases)].slice(0, 100);
    }

    /**
     * キャラクター状態を更新します
     */
    async updateCharacterState(
        chapter: Chapter,
        characterName: string,
        changes: CharacterChangeInfo[]
    ): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        // 該当する章の情報を検索
        const chapterInfo = this.recentChapters.find(
            info => info.chapter.chapterNumber === chapter.chapterNumber
        );

        if (!chapterInfo) {
            logger.warn(`Cannot update character state: Chapter ${chapter.chapterNumber} not found in ImmediateContext`);
            return;
        }

        // キャラクター状態を取得または作成
        let characterState = chapterInfo.characterState.get(characterName);

        if (!characterState) {
            // キャラクターが存在するか確認
            if (this.isCharacterPresentInContent(characterName, chapter.content)) {
                characterState = {
                    name: characterName,
                    development: '',
                    mood: this.detectCharacterMood(chapter.content, characterName)
                };
            } else {
                logger.warn(`Character ${characterName} not detected in chapter ${chapter.chapterNumber} content`);
                return;
            }
        }

        // 変化を反映
        let development = characterState.development || '';

        // 重要な変化を発展として記録
        const significantChanges = changes.filter(
            c => (c.classification?.narrativeSignificance || 0) >= 0.6
        );

        if (significantChanges.length > 0) {
            const changeDesc = significantChanges
                .map(c => `${c.attribute}が「${c.previousValue}」から「${c.currentValue}」に変化`)
                .join('、');

            development += development ? `、${changeDesc}` : changeDesc;

            // 発展情報を更新
            characterState.development = development;
        }

        // キャラクター状態を更新
        chapterInfo.characterState.set(characterName, characterState);

        // 保存
        await this.save();
    }

    /**
     * 詳細なキャラクター状態メタデータでの更新
     * 
     * @param {Chapter} chapter 章情報
     * @param {any[]} detailedStates 詳細なキャラクター状態の配列
     * @returns {Promise<void>} 処理完了Promise
     */
    async updateCharacterStateWithMetadata(chapter: Chapter, detailedStates: any[]): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        logger.debug(`Updating character states with metadata for chapter ${chapter.chapterNumber}`);

        // 該当する章の情報を検索
        const chapterInfo = this.recentChapters.find(
            info => info.chapter.chapterNumber === chapter.chapterNumber
        );

        if (!chapterInfo) {
            logger.warn(`Cannot update character state: Chapter ${chapter.chapterNumber} not found in ImmediateContext`);
            return;
        }

        // 詳細なキャラクターメタデータを保存するマップを初期化
        if (!this.characterStateWithMetadata) {
            this.characterStateWithMetadata = new Map();
        }

        // 実際に章に登場するキャラクターのみをフィルタリング
        const filteredStates = detailedStates.filter(state => 
            this.isCharacterPresentInContent(state.name, chapter.content)
        );
        
        if (filteredStates.length !== detailedStates.length) {
            logger.info(`Filtered out ${detailedStates.length - filteredStates.length} characters not present in chapter ${chapter.chapterNumber}`);
        }

        // 章番号に紐づくキャラクター状態マップを更新
        this.characterStateWithMetadata.set(chapter.chapterNumber, filteredStates);

        // 既存のupdateCharacterStateも同じデータから更新（互換性のため）
        const simpleMap = new Map();
        for (const state of filteredStates) {
            simpleMap.set(state.name, {
                name: state.name,
                mood: state.emotionalState,
                development: state.summary || ''
            });
        }

        // 既存のcharacterStateマップを更新
        chapterInfo.characterState = simpleMap;

        // 状態の保存
        await this.save();

        logger.info(`Updated ${filteredStates.length} character states with metadata for chapter ${chapter.chapterNumber}`);
    }

    /**
     * 詳細なメタデータ付きキャラクター状態を取得
     * 
     * @param {number} chapterNumber 章番号
     * @returns {any[] | null} 詳細なキャラクター状態、存在しない場合はnull
     */
    getCharacterStateWithMetadata(chapterNumber: number): any[] | null {
        if (!this.characterStateWithMetadata) {
            return null;
        }

        return this.characterStateWithMetadata.get(chapterNumber) || null;
    }

    /**
     * 状態情報を取得します
     */
    async getStatus(): Promise<ImmediateContextStatus> {
        if (!this.initialized) {
            await this.initialize();
        }

        return {
            initialized: this.initialized,
            chapterCount: this.recentChapters.length,
            lastUpdateTime: this.recentChapters[0]?.timestamp || null
        };
    }

    /**
     * データを永続化します
     */
    private async save(): Promise<void> {
        try {
            // 各章を個別に保存
            for (const item of this.recentChapters) {
                const chapterNumber = item.chapter.chapterNumber;
                await this.writeToStorage(
                    `chapters/chapter_${chapterNumber}.json`,
                    JSON.stringify(item.chapter)
                );
            }

            // メタデータを保存
            const metadata = {
                recentChapters: this.recentChapters.map(item => ({
                    chapterNumber: item.chapter.chapterNumber,
                    timestamp: item.timestamp,
                    keyPhraseCount: item.keyPhrases.length,
                    characterCount: item.characterState.size
                }))
            };

            await this.writeToStorage(
                'immediate-context/metadata.json',
                JSON.stringify(metadata)
            );

            logger.info(`Saved ImmediateContext with ${this.recentChapters.length} chapters`);
        } catch (error: unknown) {
            logger.error('Failed to save ImmediateContext', { error: error instanceof Error ? error.message : String(error) });
        }
    }
}