// src/lib/memory/short-term/immediate-context.ts
/**
 * @fileoverview 統合記憶階層システム - 短期記憶：即座コンテキスト
 * @description
 * 最新3-5章の生データと基本的なコンテキスト情報を保持する短期記憶の中核システム。
 * 統合記憶階層設計に基づき、生データ保持とリアルタイムキャッシュ機能を提供します。
 */

import { Chapter } from '@/types/chapters';
import { CharacterState } from '@/types/memory';
import { logger } from '@/lib/utils/logger';
import { TextAnalyzerService } from '../text-analyzer-service';
import { storageProvider } from '@/lib/storage';
import { characterManager } from '@/lib/characters/manager';
import { Character } from '@/types/characters';
import { CharacterChangeInfo } from '@/types/characters';

/**
 * @interface ChapterDataEntry
 * @description 章データエントリ（完全データ保持用）
 */
interface ChapterDataEntry {
    chapter: Chapter;
    content: string;
    metadata: ChapterMetadata;
    processingState: ProcessingState;
    characterState: Map<string, CharacterState>;
    keyPhrases: string[];
    timestamp: string;
    contentHash: string; // 内容の変更検出用
}

/**
 * @interface ChapterMetadata
 * @description 章メタデータ
 */
interface ChapterMetadata {
    chapterNumber: number;
    wordCount: number;
    characterCount: number;
    keyPhraseCount: number;
    lastAnalyzed: string;
    analysisVersion: string;
    qualityScore?: number;
}

/**
 * @interface ProcessingState
 * @description 処理状態追跡
 */
interface ProcessingState {
    analysisCompleted: boolean;
    contextGenerated: boolean;
    characterStatesExtracted: boolean;
    keyPhrasesExtracted: boolean;
    lastProcessingTime: string;
    processingErrors: string[];
}

/**
 * @interface RealtimeCacheEntry
 * @description リアルタイムキャッシュエントリ
 */
interface RealtimeCacheEntry<T> {
    data: T;
    timestamp: string;
    ttl: number; // 生存時間（ミリ秒）
    accessCount: number;
    lastAccessed: string;
}

/**
 * @interface ImmediateContextStatus
 * @description 即座コンテキストの状態情報
 */
interface ImmediateContextStatus {
    initialized: boolean;
    chapterCount: number;
    cacheHitRate: number;
    totalCacheEntries: number;
    lastUpdateTime: string | null;
    memoryUsage: {
        chaptersInMemory: number;
        cacheEntries: number;
        estimatedSizeKB: number;
    };
}

/**
 * @class ImmediateContext
 * @description
 * 統合記憶階層システムの短期記憶中核クラス。
 * 最大5章の生データを完全保持し、リアルタイムキャッシュと高速アクセスを提供します。
 * 12コンポーネントの一時データ救済機能を含みます。
 */
export class ImmediateContext {
    private static readonly MAX_CHAPTERS = 5; // 最大5章保持（拡張）
    private static readonly CACHE_TTL_DEFAULT = 30 * 60 * 1000; // 30分のデフォルトTTL
    private static readonly MAX_CACHE_ENTRIES = 1000; // 最大キャッシュエントリ数

    // 🔴 短期記憶：生データ保持
    private chapterDataEntries: Map<number, ChapterDataEntry> = new Map();
    
    // 🔴 短期記憶：リアルタイムキャッシュ
    private realtimeCache: Map<string, RealtimeCacheEntry<any>> = new Map();
    
    // 🔴 短期記憶：頻繁アクセスデータ
    private frequentAccessData: Map<string, any> = new Map();
    
    // 🔴 統合キャッシュシステム
    private characterInfoCache: Map<string, any> = new Map();
    private worldSettingsCache: any = null;
    private formatResultsCache: Map<string, any> = new Map();
    
    // キャラクター状態メタデータ
    private characterStateWithMetadata: Map<number, any[]> = new Map();
    
    // 統計情報
    private accessStats = {
        cacheHits: 0,
        cacheMisses: 0,
        totalAccesses: 0
    };

    private initialized: boolean = false;

    /**
     * コンストラクタ
     * @param textAnalyzer テキスト分析サービス（オプション）
     */
    constructor(private textAnalyzer?: TextAnalyzerService) {}

    /**
     * 初期化処理を実行します
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('ImmediateContext already initialized');
            return;
        }

        try {
            // ストレージから保存済みデータを読み込む
            await this.loadFromStorage();

            // キャッシュの初期化
            await this.initializeCache();

            this.initialized = true;
            logger.info('ImmediateContext initialized successfully with unified memory hierarchy');
        } catch (error) {
            logger.error('Failed to initialize ImmediateContext', { 
                error: error instanceof Error ? error.message : String(error) 
            });
            this.initialized = true;
        }
    }

    /**
     * キャッシュシステムの初期化
     * @private
     */
    private async initializeCache(): Promise<void> {
        // 統合キャッシュの初期設定
        this.worldSettingsCache = null;
        this.characterInfoCache.clear();
        this.formatResultsCache.clear();
        
        // リアルタイムキャッシュの初期化
        this.realtimeCache.clear();
        
        logger.debug('Unified cache system initialized');
    }

    /**
     * ストレージからデータを読み込みます
     * @private
     */
    private async loadFromStorage(): Promise<void> {
        try {
            const metadataExists = await this.storageExists('short-term/immediate-context-metadata.json');

            if (metadataExists) {
                const metadataContent = await this.readFromStorage('short-term/immediate-context-metadata.json');
                const metadata = JSON.parse(metadataContent);

                // 章データエントリを復元
                if (metadata.chapterDataEntries && Array.isArray(metadata.chapterDataEntries)) {
                    for (const chapterMeta of metadata.chapterDataEntries) {
                        await this.loadChapterDataEntry(chapterMeta.chapterNumber);
                    }
                }

                // キャッシュデータを復元
                if (metadata.cacheEntries) {
                    await this.loadCacheEntries(metadata.cacheEntries);
                }
            }
        } catch (error) {
            logger.error('Failed to load ImmediateContext from storage', { 
                error: error instanceof Error ? error.message : String(error) 
            });
        }
    }

    /**
     * 個別章データエントリを読み込み
     * @private
     * @param chapterNumber 章番号
     */
    private async loadChapterDataEntry(chapterNumber: number): Promise<void> {
        try {
            const chapterPath = `short-term/chapters/chapter-${chapterNumber}.json`;
            if (await this.storageExists(chapterPath)) {
                const chapterContent = await this.readFromStorage(chapterPath);
                const chapterData = JSON.parse(chapterContent);

                // ChapterDataEntryを復元
                const entry: ChapterDataEntry = {
                    chapter: chapterData.chapter,
                    content: chapterData.content,
                    metadata: chapterData.metadata,
                    processingState: chapterData.processingState,
                    characterState: new Map(chapterData.characterState || []),
                    keyPhrases: chapterData.keyPhrases || [],
                    timestamp: chapterData.timestamp,
                    contentHash: chapterData.contentHash
                };

                this.chapterDataEntries.set(chapterNumber, entry);
            }
        } catch (error) {
            logger.warn(`Failed to load chapter data entry ${chapterNumber}`, { error });
        }
    }

    /**
     * キャッシュエントリを読み込み
     * @private
     * @param cacheMetadata キャッシュメタデータ
     */
    private async loadCacheEntries(cacheMetadata: any): Promise<void> {
        try {
            // 統合キャッシュエントリの復元
            if (cacheMetadata.worldSettingsCache) {
                this.worldSettingsCache = cacheMetadata.worldSettingsCache;
            }

            if (cacheMetadata.characterInfoCache) {
                for (const [key, value] of Object.entries(cacheMetadata.characterInfoCache)) {
                    this.characterInfoCache.set(key, value);
                }
            }

            if (cacheMetadata.formatResultsCache) {
                for (const [key, value] of Object.entries(cacheMetadata.formatResultsCache)) {
                    this.formatResultsCache.set(key, value);
                }
            }
        } catch (error) {
            logger.warn('Failed to load cache entries', { error });
        }
    }

    /**
     * 章を追加し、即時コンテキストを更新します（統合版）
     * @param chapter 追加する章
     */
    async addChapter(chapter: Chapter): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            logger.info(`Adding chapter ${chapter.chapterNumber} to immediate context with full data retention`);

            // 内容ハッシュの計算
            const contentHash = this.calculateContentHash(chapter.content);

            // 既存エントリのチェック
            const existingEntry = this.chapterDataEntries.get(chapter.chapterNumber);
            if (existingEntry && existingEntry.contentHash === contentHash) {
                logger.debug(`Chapter ${chapter.chapterNumber} content unchanged, skipping processing`);
                return;
            }

            // 🔴 生データの完全保持
            const chapterDataEntry = await this.createChapterDataEntry(chapter, contentHash);
            
            // エントリを追加
            this.chapterDataEntries.set(chapter.chapterNumber, chapterDataEntry);

            // 🔴 最大保持数の管理
            await this.manageChapterRetention();

            // 🔴 リアルタイムキャッシュの更新
            await this.updateRealtimeCache(chapter);

            // 永続化
            await this.save();

            logger.info(`Successfully added chapter ${chapter.chapterNumber} with complete data retention`);
        } catch (error) {
            logger.error(`Failed to add chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 章データエントリを作成
     * @private
     * @param chapter 章情報
     * @param contentHash 内容ハッシュ
     * @returns 章データエントリ
     */
    private async createChapterDataEntry(chapter: Chapter, contentHash: string): Promise<ChapterDataEntry> {
        // キャラクター状態の抽出
        const characterState = await this.extractCharacterState(chapter);

        // キーフレーズの抽出
        const keyPhrases = this.extractKeyPhrases(chapter.content);

        // メタデータの作成
        const metadata: ChapterMetadata = {
            chapterNumber: chapter.chapterNumber,
            wordCount: chapter.content.length,
            characterCount: characterState.size,
            keyPhraseCount: keyPhrases.length,
            lastAnalyzed: new Date().toISOString(),
            analysisVersion: '1.0.0'
        };

        // 処理状態の初期化
        const processingState: ProcessingState = {
            analysisCompleted: true,
            contextGenerated: false,
            characterStatesExtracted: true,
            keyPhrasesExtracted: true,
            lastProcessingTime: new Date().toISOString(),
            processingErrors: []
        };

        return {
            chapter,
            content: chapter.content,
            metadata,
            processingState,
            characterState,
            keyPhrases,
            timestamp: new Date().toISOString(),
            contentHash
        };
    }

    /**
     * 内容ハッシュを計算
     * @private
     * @param content 内容
     * @returns ハッシュ値
     */
    private calculateContentHash(content: string): string {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * 章保持数管理
     * @private
     */
    private async manageChapterRetention(): Promise<void> {
        if (this.chapterDataEntries.size <= ImmediateContext.MAX_CHAPTERS) {
            return;
        }

        // 古い章を削除（章番号の昇順でソートして古いものから削除）
        const sortedChapters = Array.from(this.chapterDataEntries.keys()).sort((a, b) => a - b);
        const chaptersToRemove = sortedChapters.slice(0, sortedChapters.length - ImmediateContext.MAX_CHAPTERS);

        for (const chapterNumber of chaptersToRemove) {
            this.chapterDataEntries.delete(chapterNumber);
            // 関連キャッシュも削除
            this.characterStateWithMetadata.delete(chapterNumber);
            
            logger.debug(`Removed chapter ${chapterNumber} from immediate context due to retention limit`);
        }
    }

    /**
     * リアルタイムキャッシュの更新
     * @private
     * @param chapter 章情報
     */
    private async updateRealtimeCache(chapter: Chapter): Promise<void> {
        const cacheKey = `latest-chapter`;
        const cacheEntry: RealtimeCacheEntry<Chapter> = {
            data: chapter,
            timestamp: new Date().toISOString(),
            ttl: ImmediateContext.CACHE_TTL_DEFAULT,
            accessCount: 0,
            lastAccessed: new Date().toISOString()
        };

        this.realtimeCache.set(cacheKey, cacheEntry);

        // キャッシュサイズ管理
        await this.manageCacheSize();
    }

    /**
     * キャッシュサイズ管理
     * @private
     */
    private async manageCacheSize(): Promise<void> {
        if (this.realtimeCache.size <= ImmediateContext.MAX_CACHE_ENTRIES) {
            return;
        }

        // LRU方式でキャッシュを削除
        const entries = Array.from(this.realtimeCache.entries());
        entries.sort((a, b) => new Date(a[1].lastAccessed).getTime() - new Date(b[1].lastAccessed).getTime());

        const entriesToRemove = entries.slice(0, entries.length - ImmediateContext.MAX_CACHE_ENTRIES);
        for (const [key] of entriesToRemove) {
            this.realtimeCache.delete(key);
        }

        logger.debug(`Removed ${entriesToRemove.length} cache entries due to size limit`);
    }

    /**
     * 🔴 統合キャッシュ：世界設定キャッシュ
     * @param key キャッシュキー
     * @returns 世界設定またはnull
     */
    getWorldSettingsCache(key: string = 'default'): any {
        this.recordCacheAccess();
        
        if (this.worldSettingsCache) {
            this.recordCacheHit();
            return this.worldSettingsCache;
        }
        
        this.recordCacheMiss();
        return null;
    }

    /**
     * 🔴 統合キャッシュ：世界設定キャッシュ設定
     * @param data 世界設定データ
     * @param key キャッシュキー
     */
    setWorldSettingsCache(data: any, key: string = 'default'): void {
        this.worldSettingsCache = {
            data,
            timestamp: new Date().toISOString(),
            key
        };
        logger.debug('World settings cache updated');
    }

    /**
     * 🔴 統合キャッシュ：キャラクター情報キャッシュ
     * @param characterId キャラクターID
     * @returns キャラクター情報またはnull
     */
    getCharacterInfoCache(characterId: string): any {
        this.recordCacheAccess();
        
        if (this.characterInfoCache.has(characterId)) {
            this.recordCacheHit();
            const entry = this.characterInfoCache.get(characterId);
            
            // アクセス回数を更新
            entry.accessCount = (entry.accessCount || 0) + 1;
            entry.lastAccessed = new Date().toISOString();
            
            return entry.data;
        }
        
        this.recordCacheMiss();
        return null;
    }

    /**
     * 🔴 統合キャッシュ：キャラクター情報キャッシュ設定
     * @param characterId キャラクターID
     * @param data キャラクター情報
     */
    setCharacterInfoCache(characterId: string, data: any): void {
        this.characterInfoCache.set(characterId, {
            data,
            timestamp: new Date().toISOString(),
            accessCount: 0,
            lastAccessed: new Date().toISOString()
        });
        logger.debug(`Character info cache updated for ${characterId}`);
    }

    /**
     * 🔴 統合キャッシュ：フォーマット結果キャッシュ
     * @param formatKey フォーマットキー
     * @returns フォーマット結果またはnull
     */
    getFormatResultsCache(formatKey: string): any {
        this.recordCacheAccess();
        
        if (this.formatResultsCache.has(formatKey)) {
            this.recordCacheHit();
            return this.formatResultsCache.get(formatKey);
        }
        
        this.recordCacheMiss();
        return null;
    }

    /**
     * 🔴 統合キャッシュ：フォーマット結果キャッシュ設定
     * @param formatKey フォーマットキー
     * @param data フォーマット結果
     */
    setFormatResultsCache(formatKey: string, data: any): void {
        this.formatResultsCache.set(formatKey, {
            data,
            timestamp: new Date().toISOString()
        });
        logger.debug(`Format results cache updated for ${formatKey}`);
    }

    /**
     * キャッシュアクセス統計を記録
     * @private
     */
    private recordCacheAccess(): void {
        this.accessStats.totalAccesses++;
    }

    /**
     * キャッシュヒット統計を記録
     * @private
     */
    private recordCacheHit(): void {
        this.accessStats.cacheHits++;
    }

    /**
     * キャッシュミス統計を記録
     * @private
     */
    private recordCacheMiss(): void {
        this.accessStats.cacheMisses++;
    }

    /**
     * 最新の章を取得します
     * @returns 最新章またはnull
     */
    getLatestChapter(): Chapter | null {
        const cacheEntry = this.realtimeCache.get('latest-chapter');
        if (cacheEntry && this.isValidCacheEntry(cacheEntry)) {
            cacheEntry.accessCount++;
            cacheEntry.lastAccessed = new Date().toISOString();
            return cacheEntry.data;
        }

        // キャッシュから取得できない場合は直接データから取得
        const latestChapterNumber = Math.max(...Array.from(this.chapterDataEntries.keys()));
        const latestEntry = this.chapterDataEntries.get(latestChapterNumber);
        
        return latestEntry ? latestEntry.chapter : null;
    }

    /**
     * キャッシュエントリの有効性チェック
     * @private
     * @param entry キャッシュエントリ
     * @returns 有効かどうか
     */
    private isValidCacheEntry(entry: RealtimeCacheEntry<any>): boolean {
        const now = Date.now();
        const entryTime = new Date(entry.timestamp).getTime();
        return (now - entryTime) < entry.ttl;
    }

    /**
     * 最近の章情報を取得します（統合版）
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

        const result = [];
        const entries = Array.from(this.chapterDataEntries.entries())
            .sort((a, b) => b[0] - a[0]); // 章番号の降順

        for (const [chapterNumber, entry] of entries) {
            if (upToChapter === undefined || chapterNumber <= upToChapter) {
                result.push({
                    chapter: entry.chapter,
                    characterState: entry.characterState,
                    keyPhrases: entry.keyPhrases,
                    timestamp: entry.timestamp
                });
            }
        }

        return result;
    }

    /**
     * 指定された章番号の章を取得します（高速化版）
     * @param chapterNumber 章番号
     * @returns 章またはnull
     */
    async getChapter(chapterNumber: number): Promise<Chapter | null> {
        if (!this.initialized) {
            await this.initialize();
        }

        // 直接メモリから取得
        const entry = this.chapterDataEntries.get(chapterNumber);
        if (entry) {
            return entry.chapter;
        }

        // ストレージから読み込み試行
        try {
            await this.loadChapterDataEntry(chapterNumber);
            const reloadedEntry = this.chapterDataEntries.get(chapterNumber);
            return reloadedEntry ? reloadedEntry.chapter : null;
        } catch (error) {
            logger.warn(`Chapter ${chapterNumber} not found`, { error });
            return null;
        }
    }

    /**
     * 章の完全データエントリを取得
     * @param chapterNumber 章番号
     * @returns 章データエントリまたはnull
     */
    getChapterDataEntry(chapterNumber: number): ChapterDataEntry | null {
        return this.chapterDataEntries.get(chapterNumber) || null;
    }

    /**
     * キャラクター状態の抽出（既存メソッドを統合）
     * @private
     * @param chapter 章情報
     * @returns キャラクター状態マップ
     */
    private async extractCharacterState(chapter: Chapter): Promise<Map<string, CharacterState>> {
        const result = new Map<string, CharacterState>();

        try {
            const allCharacters = await this.getAllRegisteredCharacters();
            
            for (const character of allCharacters) {
                if (this.isCharacterPresentInContent(character.name, chapter.content)) {
                    result.set(character.name, {
                        name: character.name,
                        mood: this.detectCharacterMood(chapter.content, character.name),
                        development: ""
                    });
                }
            }

            // テキスト分析サービスがあれば詳細分析を実行
            if (this.textAnalyzer && result.size > 0) {
                try {
                    const analyzedStates = await this.textAnalyzer.analyzeCharacterStates(
                        chapter.content,
                        Array.from(result.keys())
                    );

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
                } catch (error) {
                    logger.warn('AI analysis failed, using rule-based extraction only', { error });
                }
            }
        } catch (error) {
            logger.error('Failed to extract character state', { error });
        }

        return result;
    }

    /**
     * キーフレーズの抽出（既存メソッドを統合）
     * @private
     * @param text テキスト
     * @returns キーフレーズ配列
     */
    private extractKeyPhrases(text: string): string[] {
        const patterns = [
            /「.*?」/g,
            /[一-龯ぁ-んァ-ヶ]{3,}(した|している|していた)/g,
            /(しかし|けれども|だから|それゆえに|ところが)[、。]/g,
            /[一-龯ぁ-んァ-ヶ]{2,}(だった|である|だろう)[。]/g
        ];

        const phrases: string[] = [];
        patterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                phrases.push(...matches);
            }
        });

        return [...new Set(phrases)].slice(0, 100);
    }

    /**
     * すべての登録済みキャラクターを取得
     * @private
     * @returns キャラクター配列
     */
    private async getAllRegisteredCharacters(): Promise<Character[]> {
        try {
            return await characterManager.getAllCharacters();
        } catch (error) {
            logger.warn('Failed to get registered characters', { error });
            return [];
        }
    }

    /**
     * キャラクターの内容内存在チェック
     * @private
     * @param name キャラクター名
     * @param content 内容
     * @returns 存在するかどうか
     */
    private isCharacterPresentInContent(name: string, content: string): boolean {
        if (name.length < 2) return false;
        
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const contextPatterns = [
            new RegExp(`${escapedName}[はがのをに]`, 'g'),
            new RegExp(`「${escapedName}」`, 'g'),
            new RegExp(`「${escapedName}[、。」]`, 'g'),
            new RegExp(`${escapedName}[（(]`, 'g'),
            new RegExp(`[。、」!?]\s*${escapedName}`, 'g')
        ];
        
        return contextPatterns.some(pattern => pattern.test(content));
    }

    /**
     * キャラクターのムード検出
     * @private
     * @param content 内容
     * @param name キャラクター名
     * @returns ムード
     */
    private detectCharacterMood(content: string, name: string): string {
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const nameContextPattern = new RegExp(`([^。]+${escapedName}[^。]*[はがのをに][^。]*。)`, 'g');
        const matches = Array.from(content.matchAll(nameContextPattern)).map(m => m[1] || '');
        
        const moodKeywords = {
            '喜び': ['笑', '嬉し', '楽し', '喜'],
            '悲しみ': ['泣', '悲し', '辛', '寂し'],
            '怒り': ['怒', '激怒', '苛立', '不満'],
            '恐怖': ['恐', '怖', '震え', '怯え'],
            '驚き': ['驚', 'びっくり', '目を見開'],
            '平静': ['冷静', '落ち着', '静か']
        };

        const moodCounts: Record<string, number> = {};
        Object.keys(moodKeywords).forEach(mood => {
            moodCounts[mood] = 0;
        });

        matches.forEach(matchText => {
            Object.entries(moodKeywords).forEach(([mood, keywords]) => {
                if (keywords.some(keyword => matchText.includes(keyword))) {
                    moodCounts[mood]++;
                }
            });
        });

        const maxMood = Object.entries(moodCounts)
            .reduce((max, [mood, count]) => count > max[1] ? [mood, count] : max, ['不明', 0]);

        return maxMood[1] > 0 ? maxMood[0] : '不明';
    }

    /**
     * 状態情報を取得します（統合版）
     * @returns 状態情報
     */
    async getStatus(): Promise<ImmediateContextStatus> {
        if (!this.initialized) {
            await this.initialize();
        }

        const cacheHitRate = this.accessStats.totalAccesses > 0 
            ? this.accessStats.cacheHits / this.accessStats.totalAccesses 
            : 0;

        const estimatedSizeKB = this.calculateEstimatedMemoryUsage();

        return {
            initialized: this.initialized,
            chapterCount: this.chapterDataEntries.size,
            cacheHitRate: Math.round(cacheHitRate * 100) / 100,
            totalCacheEntries: this.realtimeCache.size + this.characterInfoCache.size + this.formatResultsCache.size,
            lastUpdateTime: this.getLatestTimestamp(),
            memoryUsage: {
                chaptersInMemory: this.chapterDataEntries.size,
                cacheEntries: this.realtimeCache.size,
                estimatedSizeKB
            }
        };
    }

    /**
     * 推定メモリ使用量計算
     * @private
     * @returns 推定メモリ使用量（KB）
     */
    private calculateEstimatedMemoryUsage(): number {
        let totalSize = 0;
        
        // 章データの推定サイズ
        for (const entry of this.chapterDataEntries.values()) {
            totalSize += entry.content.length; // 内容のサイズ
            totalSize += JSON.stringify(entry.metadata).length; // メタデータ
            totalSize += entry.keyPhrases.join('').length; // キーフレーズ
        }
        
        // キャッシュの推定サイズ
        totalSize += this.realtimeCache.size * 1000; // 概算
        totalSize += this.characterInfoCache.size * 500; // 概算
        totalSize += this.formatResultsCache.size * 200; // 概算
        
        return Math.round(totalSize / 1024); // KB変換
    }

    /**
     * 最新タイムスタンプ取得
     * @private
     * @returns 最新タイムスタンプまたはnull
     */
    private getLatestTimestamp(): string | null {
        const timestamps = Array.from(this.chapterDataEntries.values())
            .map(entry => entry.timestamp)
            .sort()
            .reverse();
        
        return timestamps.length > 0 ? timestamps[0] : null;
    }

    /**
     * キャラクター状態を更新します
     * @param chapter 章情報
     * @param characterName キャラクター名
     * @param changes 変更情報
     */
    async updateCharacterState(
        chapter: Chapter,
        characterName: string,
        changes: CharacterChangeInfo[]
    ): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        const entry = this.chapterDataEntries.get(chapter.chapterNumber);
        if (!entry) {
            logger.warn(`Cannot update character state: Chapter ${chapter.chapterNumber} not found`);
            return;
        }

        let characterState = entry.characterState.get(characterName);

        if (!characterState) {
            if (this.isCharacterPresentInContent(characterName, chapter.content)) {
                characterState = {
                    name: characterName,
                    development: '',
                    mood: this.detectCharacterMood(chapter.content, characterName)
                };
            } else {
                logger.warn(`Character ${characterName} not detected in chapter ${chapter.chapterNumber}`);
                return;
            }
        }

        // 変化を反映
        let development = characterState.development || '';
        const significantChanges = changes.filter(c => (c.classification?.narrativeSignificance || 0) >= 0.6);

        if (significantChanges.length > 0) {
            const changeDesc = significantChanges
                .map(c => `${c.attribute}が「${c.previousValue}」から「${c.currentValue}」に変化`)
                .join('、');

            development += development ? `、${changeDesc}` : changeDesc;
            characterState.development = development;
        }

        entry.characterState.set(characterName, characterState);
        await this.save();
    }

    /**
     * 詳細なキャラクター状態メタデータ付き更新
     * @param chapter 章情報
     * @param detailedStates 詳細状態配列
     */
    async updateCharacterStateWithMetadata(chapter: Chapter, detailedStates: any[]): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        const entry = this.chapterDataEntries.get(chapter.chapterNumber);
        if (!entry) {
            logger.warn(`Cannot update character state: Chapter ${chapter.chapterNumber} not found`);
            return;
        }

        const filteredStates = detailedStates.filter(state => 
            this.isCharacterPresentInContent(state.name, chapter.content)
        );
        
        this.characterStateWithMetadata.set(chapter.chapterNumber, filteredStates);

        // 既存のcharacterStateマップも更新
        const simpleMap = new Map();
        for (const state of filteredStates) {
            simpleMap.set(state.name, {
                name: state.name,
                mood: state.emotionalState,
                development: state.summary || ''
            });
        }

        entry.characterState = simpleMap;
        await this.save();

        logger.info(`Updated ${filteredStates.length} character states with metadata for chapter ${chapter.chapterNumber}`);
    }

    /**
     * 詳細メタデータ付きキャラクター状態を取得
     * @param chapterNumber 章番号
     * @returns 詳細キャラクター状態またはnull
     */
    getCharacterStateWithMetadata(chapterNumber: number): any[] | null {
        return this.characterStateWithMetadata.get(chapterNumber) || null;
    }

    /**
     * データを永続化します（統合版）
     * @private
     */
    private async save(): Promise<void> {
        try {
            // メタデータを保存
            const metadata = {
                chapterDataEntries: Array.from(this.chapterDataEntries.keys()).map(chapterNumber => ({
                    chapterNumber,
                    timestamp: this.chapterDataEntries.get(chapterNumber)!.timestamp
                })),
                cacheEntries: {
                    worldSettingsCache: this.worldSettingsCache,
                    characterInfoCache: Object.fromEntries(this.characterInfoCache),
                    formatResultsCache: Object.fromEntries(this.formatResultsCache)
                },
                accessStats: this.accessStats,
                lastSaved: new Date().toISOString()
            };

            await this.writeToStorage('short-term/immediate-context-metadata.json', JSON.stringify(metadata, null, 2));

            // 個別章データを保存
            for (const [chapterNumber, entry] of this.chapterDataEntries) {
                const chapterData = {
                    chapter: entry.chapter,
                    content: entry.content,
                    metadata: entry.metadata,
                    processingState: entry.processingState,
                    characterState: Array.from(entry.characterState.entries()),
                    keyPhrases: entry.keyPhrases,
                    timestamp: entry.timestamp,
                    contentHash: entry.contentHash
                };

                await this.writeToStorage(
                    `short-term/chapters/chapter-${chapterNumber}.json`,
                    JSON.stringify(chapterData, null, 2)
                );
            }

            logger.info(`Saved unified ImmediateContext with ${this.chapterDataEntries.size} chapters and integrated cache`);
        } catch (error) {
            logger.error('Failed to save ImmediateContext', { error });
        }
    }

    /**
     * ストレージ存在確認
     * @private
     */
    private async storageExists(path: string): Promise<boolean> {
        try {
            return await storageProvider.fileExists(path);
        } catch (error) {
            return false;
        }
    }

    /**
     * ストレージから読み込み
     * @private
     */
    private async readFromStorage(path: string): Promise<string> {
        try {
            const exists = await storageProvider.fileExists(path);
            if (exists) {
                return await storageProvider.readFile(path);
            } else {
                logger.warn(`File does not exist: ${path}`);
                return '{}';
            }
        } catch (error) {
            logger.error(`Error reading file: ${path}`, { error });
            throw error;
        }
    }

    /**
     * ストレージに書き込み
     * @private
     */
    private async writeToStorage(path: string, content: string): Promise<void> {
        try {
            const directory = path.substring(0, path.lastIndexOf('/'));
            if (directory) {
                await storageProvider.createDirectory(directory);
            }
            await storageProvider.writeFile(path, content);
        } catch (error) {
            logger.error(`Error writing file: ${path}`, { error });
            throw error;
        }
    }
}