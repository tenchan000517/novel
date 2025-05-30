// /**
//  * @fileoverview メモリシステムとの一貫したインターフェースを提供するアダプタークラス
//  * @description
//  * 分析システムからメモリシステムへのアクセスを標準化し、
//  * 各種記憶層へのクエリと更新操作を抽象化します。
//  */

// import { MemoryManager, memoryManager } from '@/lib/memory/manager';
// import { ImmediateContext } from '@/lib/memory/immediate-context';
// import { NarrativeMemory } from '@/lib/memory/narrative-memory';
// import { WorldKnowledge } from '@/lib/memory/world-knowledge';
// import { logger } from '@/lib/utils/logger';

// // 各種型をインポート
// import {
//     ChapterMemory,
//     KeyEvent,
//     ArcMemory,
//     Memory,
//     Foreshadowing,
//     SignificantEvent,
//     PersistentEventType
// } from '@/types/memory';
// import {
//     SearchOptions,
//     NarrativeStateInfo,
//     StagnationDetectionResult,
//     EmotionalCurvePoint
// } from '@/lib/memory/types';
// import { Chapter } from '@/types/chapters';
// import { CharacterDiff } from '@/types/characters';
// import { GenerationContext } from '@/types/generation';

// /**
//  * メモリアダプタークラス
//  * 分析システムからメモリシステムへのアクセスを標準化するアダプタークラス
//  */
// export class MemoryAdapter {
//     private memoryManager: MemoryManager;
//     private cacheEnabled: boolean = true;
//     private cacheTimeout: number = 60000; // 1分のキャッシュタイムアウト
//     private cache: Map<string, { data: any, timestamp: number }> = new Map();

//     /**
//      * コンストラクタ
//      * @param memManager MemoryManagerのインスタンス（省略時はシングルトンを使用）
//      */
//     constructor(memManager?: MemoryManager) {
//         this.memoryManager = memManager || memoryManager;
//         logger.info('MemoryAdapter: 初期化完了');
//     }

//     /**
//      * 初期化処理
//      * メモリシステムが初期化されていない場合は初期化する
//      */
//     async initialize(): Promise<void> {
//         try {
//             const isInitialized = await this.memoryManager.isInitialized();
//             if (!isInitialized) {
//                 logger.info('MemoryAdapter: メモリシステムの初期化を開始');
//                 await this.memoryManager.initialize();
//                 logger.info('MemoryAdapter: メモリシステムの初期化が完了');
//             }
//         } catch (error) {
//             logger.error('MemoryAdapter: メモリシステムの初期化に失敗', {
//                 error: error instanceof Error ? error.message : String(error)
//             });
//             throw new Error('メモリシステムの初期化に失敗しました');
//         }
//     }

//     /**
//      * メモリシステムの状態を確認
//      * @returns メモリシステムの初期化状態
//      */
//     async isInitialized(): Promise<boolean> {
//         return this.memoryManager.isInitialized();
//     }

//     /**
//      * キャッシュの有効/無効を設定
//      * @param enabled キャッシュを有効にするかどうか
//      */
//     setCacheEnabled(enabled: boolean): void {
//         this.cacheEnabled = enabled;
//         logger.debug(`MemoryAdapter: キャッシュを${enabled ? '有効' : '無効'}に設定`);
//     }

//     /**
//      * キャッシュタイムアウトを設定
//      * @param timeout タイムアウト時間（ミリ秒）
//      */
//     setCacheTimeout(timeout: number): void {
//         this.cacheTimeout = timeout;
//         logger.debug(`MemoryAdapter: キャッシュタイムアウトを${timeout}msに設定`);
//     }

//     /**
//      * キャッシュをクリア
//      */
//     clearCache(): void {
//         this.cache.clear();
//         logger.debug('MemoryAdapter: キャッシュをクリア');
//     }

//     /**
//      * 短期記憶へのアクセス
//      * @returns ImmediateContextインスタンス
//      */
//     getShortTermMemory(): ImmediateContext {
//         return this.memoryManager.getShortTermMemory();
//     }

//     /**
//      * 中期記憶へのアクセス
//      * @returns NarrativeMemoryインスタンス
//      */
//     getMidTermMemory(): NarrativeMemory {
//         return this.memoryManager.getMidTermMemory();
//     }

//     /**
//      * 長期記憶へのアクセス
//      * @returns WorldKnowledgeインスタンス
//      */
//     getLongTermMemory(): WorldKnowledge {
//         return this.memoryManager.getLongTermMemory();
//     }

//     /**
//      * 最近のチャプターメモリを取得
//      * @param upToChapter 取得対象の最大章番号
//      * @param limit 取得する最大数
//      * @returns チャプターメモリの配列
//      */
//     async getRecentChapterMemories(upToChapter: number, limit?: number): Promise<ChapterMemory[]> {
//         await this.ensureInitialized();

//         const cacheKey = `recent-chapters-${upToChapter}-${limit || 'all'}`;
//         const cachedData = this.getFromCache<ChapterMemory[]>(cacheKey);

//         if (cachedData) {
//             return cachedData;
//         }

//         try {
//             const memories = await this.memoryManager.getRecentChapterMemories(upToChapter, limit);
//             this.saveToCache(cacheKey, memories);
//             return memories;
//         } catch (error) {
//             logger.error('MemoryAdapter: 最近のチャプターメモリ取得に失敗', {
//                 error: error instanceof Error ? error.message : String(error),
//                 upToChapter,
//                 limit
//             });
//             return [];
//         }
//     }

//     /**
//      * 現在のアーク情報を取得
//      * @param chapterNumber 章番号
//      * @returns アークメモリ
//      */
//     async getCurrentArc(chapterNumber: number): Promise<ArcMemory | null> {
//         await this.ensureInitialized();

//         const cacheKey = `current-arc-${chapterNumber}`;
//         const cachedData = this.getFromCache<ArcMemory | null>(cacheKey);

//         if (cachedData !== undefined) {
//             return cachedData;
//         }

//         try {
//             const arc = await this.memoryManager.getCurrentArc(chapterNumber);
//             this.saveToCache(cacheKey, arc);
//             return arc;
//         } catch (error) {
//             logger.error('MemoryAdapter: 現在のアーク取得に失敗', {
//                 error: error instanceof Error ? error.message : String(error),
//                 chapterNumber
//             });
//             return null;
//         }
//     }

//     /**
//      * 前章の情報を取得
//      * 
//      * @param {number} chapterNumber 現在の章番号
//      * @param {number} count 取得する章数（デフォルト: 2）
//      * @returns {Promise<Chapter[]>} 前章の配列
//      */
//     async fetchPreviousChapters(chapterNumber: number, count: number = 2): Promise<Chapter[]> {
//         await this.ensureInitialized();

//         const cacheKey = `previous-chapters-${chapterNumber}-${count}`;
//         const cachedData = this.getFromCache<Chapter[]>(cacheKey);

//         if (cachedData) {
//             return cachedData;
//         }

//         try {
//             const previousChapters: Chapter[] = [];

//             if (chapterNumber > 1) {
//                 const shortTermMemory = this.getShortTermMemory();

//                 // 指定数の前章を取得
//                 for (let i = Math.max(1, chapterNumber - count); i < chapterNumber; i++) {
//                     try {
//                         const prevChapter = await shortTermMemory.getChapter(i);
//                         if (prevChapter) {
//                             previousChapters.push(prevChapter);
//                         }
//                     } catch (innerError) {
//                         logger.warn(`Failed to retrieve chapter ${i}`, {
//                             error: innerError instanceof Error ? innerError.message : String(innerError)
//                         });
//                     }
//                 }
//             }

//             this.saveToCache(cacheKey, previousChapters);
//             return previousChapters;
//         } catch (error) {
//             logger.warn('Failed to fetch previous chapters', {
//                 error: error instanceof Error ? error.message : String(error)
//             });
//             return [];
//         }
//     }

//     /**
//      * 重要イベントを取得
//      * @param startChapter 開始章番号
//      * @param endChapter 終了章番号
//      * @returns 重要イベントの配列
//      */
//     async getImportantEvents(startChapter: number, endChapter: number): Promise<KeyEvent[]> {
//         await this.ensureInitialized();

//         const cacheKey = `important-events-${startChapter}-${endChapter}`;
//         const cachedData = this.getFromCache<KeyEvent[]>(cacheKey);

//         if (cachedData) {
//             return cachedData;
//         }

//         try {
//             const events = await this.memoryManager.getImportantEvents(startChapter, endChapter);
//             this.saveToCache(cacheKey, events);
//             return events;
//         } catch (error) {
//             logger.error('MemoryAdapter: 重要イベント取得に失敗', {
//                 error: error instanceof Error ? error.message : String(error),
//                 startChapter,
//                 endChapter
//             });
//             return [];
//         }
//     }

//     /**
//      * メモリ検索を実行
//      * @param query 検索クエリ
//      * @param options 検索オプション
//      * @returns 検索結果
//      */
//     async searchMemories(query: string, options?: SearchOptions): Promise<Memory[]> {
//         await this.ensureInitialized();

//         // 検索結果はキャッシュしない（常に最新の結果を取得）
//         try {
//             const searchResults = await this.memoryManager.searchMemories(query, options);
//             return searchResults.map(result => result.memory);
//         } catch (error) {
//             logger.error('MemoryAdapter: メモリ検索に失敗', {
//                 error: error instanceof Error ? error.message : String(error),
//                 query
//             });
//             return [];
//         }
//     }

//     /**
//      * 物語状態を取得
//      * @param chapterNumber 章番号
//      * @returns 物語状態情報
//      */
//     async getNarrativeState(chapterNumber: number): Promise<NarrativeStateInfo> {
//         await this.ensureInitialized();

//         const cacheKey = `narrative-state-${chapterNumber}`;
//         const cachedData = this.getFromCache<NarrativeStateInfo>(cacheKey);

//         if (cachedData) {
//             return cachedData;
//         }

//         try {
//             const state = await this.memoryManager.getNarrativeState(chapterNumber);
//             this.saveToCache(cacheKey, state);
//             return state;
//         } catch (error) {
//             logger.error('MemoryAdapter: 物語状態取得に失敗', {
//                 error: error instanceof Error ? error.message : String(error),
//                 chapterNumber
//             });

//             // エラー時のデフォルト値
//             return {
//                 state: 'INTRODUCTION',
//                 tensionLevel: 5,
//                 currentArcNumber: 1,
//                 currentTheme: '物語の始まり',
//                 arcStartChapter: 1,
//                 arcEndChapter: -1,
//                 arcCompleted: false,
//                 turningPoints: [],
//                 stagnationDetected: false,
//                 duration: 0,
//                 location: '',
//                 timeOfDay: '',
//                 weather: '',
//                 presentCharacters: []
//             };
//         }
//     }

//     /**
//      * 停滞検出を実行
//      * @param chapterNumber 章番号
//      * @returns 停滞検出結果
//      */
//     async detectStagnation(chapterNumber: number): Promise<StagnationDetectionResult> {
//         await this.ensureInitialized();

//         try {
//             return await this.memoryManager.detectStagnation(chapterNumber);
//         } catch (error) {
//             logger.error('MemoryAdapter: 停滞検出に失敗', {
//                 error: error instanceof Error ? error.message : String(error),
//                 chapterNumber
//             });

//             // エラー時のデフォルト値
//             return {
//                 detected: false,
//                 type: 'UNKNOWN',
//                 severity: 0,
//                 recommendations: []
//             };
//         }
//     }

//     /**
//      * 永続的イベントを取得
//      * @param type イベントタイプ
//      * @returns 永続的イベントの配列
//      */
//     async getPersistentEventsByType(type: PersistentEventType): Promise<SignificantEvent[]> {
//         await this.ensureInitialized();

//         const cacheKey = `persistent-events-${type}`;
//         const cachedData = this.getFromCache<SignificantEvent[]>(cacheKey);

//         if (cachedData) {
//             return cachedData;
//         }

//         try {
//             const events = await this.memoryManager.getPersistentEventsByType(type);
//             this.saveToCache(cacheKey, events);
//             return events;
//         } catch (error) {
//             logger.error('MemoryAdapter: 永続的イベント取得に失敗', {
//                 error: error instanceof Error ? error.message : String(error),
//                 type
//             });
//             return [];
//         }
//     }

//     /**
//      * 感情曲線を取得
//      * @param startChapter 開始章番号
//      * @param endChapter 終了章番号
//      * @returns 感情曲線ポイントの配列
//      */
//     async getEmotionalCurve(startChapter: number, endChapter: number): Promise<EmotionalCurvePoint[]> {
//         await this.ensureInitialized();

//         const cacheKey = `emotional-curve-${startChapter}-${endChapter}`;
//         const cachedData = this.getFromCache<EmotionalCurvePoint[]>(cacheKey);

//         if (cachedData) {
//             return cachedData;
//         }

//         try {
//             const curve = await this.memoryManager.getEmotionalCurve(startChapter, endChapter);
//             this.saveToCache(cacheKey, curve);
//             return curve;
//         } catch (error) {
//             logger.error('MemoryAdapter: 感情曲線取得に失敗', {
//                 error: error instanceof Error ? error.message : String(error),
//                 startChapter,
//                 endChapter
//             });
//             return [];
//         }
//     }

//     /**
//      * 物語進行提案を生成
//      * @param chapterNumber 章番号
//      * @returns 進行提案の配列
//      */
//     async generateStoryProgressionSuggestions(chapterNumber: number): Promise<string[]> {
//         await this.ensureInitialized();

//         try {
//             return await this.memoryManager.generateStoryProgressionSuggestions(chapterNumber);
//         } catch (error) {
//             logger.error('MemoryAdapter: 物語進行提案生成に失敗', {
//                 error: error instanceof Error ? error.message : String(error),
//                 chapterNumber
//             });
//             return [
//                 'キャラクターの目標に向けた進展',
//                 '新たな課題や障害の導入',
//                 '既存の葛藤の深化'
//             ];
//         }
//     }

//     /**
//      * 章要約を取得
//      * @param chapterNumber 章番号
//      * @returns 章要約
//      */
//     async getChapterSummary(chapterNumber: number): Promise<string | null> {
//         await this.ensureInitialized();

//         const cacheKey = `chapter-summary-${chapterNumber}`;
//         const cachedData = this.getFromCache<string | null>(cacheKey);

//         if (cachedData !== undefined) {
//             return cachedData;
//         }

//         try {
//             const narrativeMemory = this.getMidTermMemory();
//             const summary = await narrativeMemory.getChapterSummary(chapterNumber);
//             this.saveToCache(cacheKey, summary);
//             return summary;
//         } catch (error) {
//             logger.error('MemoryAdapter: 章要約取得に失敗', {
//                 error: error instanceof Error ? error.message : String(error),
//                 chapterNumber
//             });
//             return null;
//         }
//     }

//     /**
//      * 統合記憶コンテキストを生成
//      * @param chapterNumber 章番号
//      * @returns 統合記憶コンテキスト
//      */
//     async generateIntegratedContext(chapterNumber: number): Promise<any> {
//         await this.ensureInitialized();

//         try {
//             return await this.memoryManager.generateIntegratedContext(chapterNumber);
//         } catch (error) {
//             logger.error('MemoryAdapter: 統合記憶コンテキスト生成に失敗', {
//                 error: error instanceof Error ? error.message : String(error),
//                 chapterNumber
//             });

//             // エラー時は最小限のコンテキストを返す
//             return {
//                 currentChapter: chapterNumber,
//                 recentSummaries: [],
//                 characterStates: {},
//                 worldContext: '基本的な世界設定',
//                 narrativeState: {
//                     state: 'UNKNOWN',
//                     tensionLevel: 5
//                 }
//             };
//         }
//     }

//     /**
//      * 章を処理する
//      * @param chapter 章データ
//      */
//     async processChapter(chapter: Chapter): Promise<void> {
//         await this.ensureInitialized();

//         try {
//             await this.memoryManager.processChapter(chapter);

//             // 章に関連するキャッシュをクリア
//             this.clearChapterRelatedCache(chapter.chapterNumber);
//         } catch (error) {
//             logger.error('MemoryAdapter: 章処理に失敗', {
//                 error: error instanceof Error ? error.message : String(error),
//                 chapterNumber: chapter.chapterNumber
//             });
//             throw error;
//         }
//     }

//     /**
//      * キャラクターの変化を処理
//      * @param characterDiff キャラクター変化情報
//      * @param chapterNumber 章番号
//      */
//     async processCharacterChanges(characterDiff: CharacterDiff, chapterNumber: number): Promise<void> {
//         await this.ensureInitialized();

//         try {
//             await this.memoryManager.processCharacterChanges(characterDiff, chapterNumber);

//             // キャラクターに関連するキャッシュをクリア
//             this.clearCharacterRelatedCache(characterDiff.id);
//         } catch (error) {
//             logger.error('MemoryAdapter: キャラクター変化処理に失敗', {
//                 error: error instanceof Error ? error.message : String(error),
//                 characterId: characterDiff.id,
//                 chapterNumber
//             });
//             throw error;
//         }
//     }

//     /**
//      * 伏線状態を更新
//      * @param resolvedForeshadowing 解決された伏線
//      * @param chapterNumber 章番号
//      */
//     async updateForeshadowingStatus(
//         resolvedForeshadowing: Foreshadowing[],
//         chapterNumber: number
//     ): Promise<void> {
//         await this.ensureInitialized();

//         try {
//             await this.memoryManager.updateForeshadowingStatus(resolvedForeshadowing, chapterNumber);

//             // 伏線関連のキャッシュをクリア
//             this.clearForeshadowingRelatedCache();
//         } catch (error) {
//             logger.error('MemoryAdapter: 伏線状態更新に失敗', {
//                 error: error instanceof Error ? error.message : String(error),
//                 foreshadowingCount: resolvedForeshadowing.length,
//                 chapterNumber
//             });
//             throw error;
//         }
//     }

//     /**
//      * 永続的イベントを記録
//      * @param event 永続的イベント
//      */
//     async recordPersistentEvent(event: SignificantEvent): Promise<void> {
//         await this.ensureInitialized();

//         try {
//             await this.memoryManager.recordPersistentEvent(event);

//             // イベント関連のキャッシュをクリア
//             this.clearEventRelatedCache(event.type);
//         } catch (error) {
//             logger.error('MemoryAdapter: 永続的イベント記録に失敗', {
//                 error: error instanceof Error ? error.message : String(error),
//                 eventType: event.type
//             });
//             throw error;
//         }
//     }

//     /**
//      * 生成コンテキストを検証
//      * @param context 生成コンテキスト
//      * @returns 検証結果
//      */
//     async validateGenerationContext(context: GenerationContext): Promise<{
//         consistent: boolean;
//         issues: string[];
//     }> {
//         await this.ensureInitialized();

//         try {
//             return await this.memoryManager.validateGenerationContext(context);
//         } catch (error) {
//             logger.error('MemoryAdapter: 生成コンテキスト検証に失敗', {
//                 error: error instanceof Error ? error.message : String(error)
//             });
//             return {
//                 consistent: true, // エラー時はデフォルトで一貫性ありとする
//                 issues: []
//             };
//         }
//     }

//     /**
//      * 初期化状態を確認し、必要に応じて初期化する
//      * @private
//      */
//     private async ensureInitialized(): Promise<void> {
//         if (!await this.isInitialized()) {
//             await this.initialize();
//         }
//     }

//     /**
//      * キャッシュからデータを取得
//      * @param key キャッシュキー
//      * @returns キャッシュデータ（なければundefined）
//      * @private
//      */
//     private getFromCache<T>(key: string): T | undefined {
//         if (!this.cacheEnabled) return undefined;

//         const cached = this.cache.get(key);
//         if (!cached) return undefined;

//         const now = Date.now();
//         if (now - cached.timestamp > this.cacheTimeout) {
//             // タイムアウトしたキャッシュを削除
//             this.cache.delete(key);
//             return undefined;
//         }

//         return cached.data as T;
//     }

//     /**
//      * データをキャッシュに保存
//      * @param key キャッシュキー
//      * @param data 保存データ
//      * @private
//      */
//     private saveToCache<T>(key: string, data: T): void {
//         if (!this.cacheEnabled) return;

//         this.cache.set(key, {
//             data,
//             timestamp: Date.now()
//         });
//     }

//     /**
//      * 章に関連するキャッシュをクリア
//      * @param chapterNumber 章番号
//      * @private
//      */
//     private clearChapterRelatedCache(chapterNumber: number): void {
//         if (!this.cacheEnabled) return;

//         const keysToDelete: string[] = [];

//         for (const key of this.cache.keys()) {
//             if (
//                 key.includes(`-${chapterNumber}`) ||
//                 key.includes(`-${chapterNumber}-`) ||
//                 key.startsWith('recent-chapters-') ||
//                 key.startsWith('current-arc-') ||
//                 key.startsWith('narrative-state-') ||
//                 key.startsWith('emotional-curve-')
//             ) {
//                 keysToDelete.push(key);
//             }
//         }

//         keysToDelete.forEach(key => this.cache.delete(key));
//         logger.debug(`MemoryAdapter: 章${chapterNumber}に関連する${keysToDelete.length}件のキャッシュをクリア`);
//     }

//     /**
//      * キャラクターに関連するキャッシュをクリア
//      * @param characterId キャラクターID
//      * @private
//      */
//     private clearCharacterRelatedCache(characterId: string): void {
//         if (!this.cacheEnabled) return;

//         // キャラクターが関係するキャッシュは広範囲に影響するため、
//         // 物語状態やアーク情報などの関連キャッシュも含めてクリア
//         const keysToDelete: string[] = [];

//         for (const key of this.cache.keys()) {
//             if (
//                 key.includes(characterId) ||
//                 key.startsWith('narrative-state-') ||
//                 key.startsWith('current-arc-')
//             ) {
//                 keysToDelete.push(key);
//             }
//         }

//         keysToDelete.forEach(key => this.cache.delete(key));
//         logger.debug(`MemoryAdapter: キャラクター${characterId}に関連する${keysToDelete.length}件のキャッシュをクリア`);
//     }

//     /**
//      * 伏線関連のキャッシュをクリア
//      * @private
//      */
//     private clearForeshadowingRelatedCache(): void {
//         if (!this.cacheEnabled) return;

//         // 伏線の変更は物語構造に大きく影響するため、
//         // 関連する多くのキャッシュをクリアする
//         const keysToDelete: string[] = [];

//         for (const key of this.cache.keys()) {
//             if (
//                 key.includes('foreshadowing') ||
//                 key.startsWith('important-events-') ||
//                 key.startsWith('narrative-state-') ||
//                 key.startsWith('current-arc-')
//             ) {
//                 keysToDelete.push(key);
//             }
//         }

//         keysToDelete.forEach(key => this.cache.delete(key));
//         logger.debug(`MemoryAdapter: 伏線関連の${keysToDelete.length}件のキャッシュをクリア`);
//     }

//     /**
//      * イベント関連のキャッシュをクリア
//      * @param eventType イベントタイプ
//      * @private
//      */
//     private clearEventRelatedCache(eventType: string): void {
//         if (!this.cacheEnabled) return;

//         const keysToDelete: string[] = [];

//         for (const key of this.cache.keys()) {
//             if (
//                 key.includes('events') ||
//                 key.includes(eventType) ||
//                 key.startsWith('narrative-state-')
//             ) {
//                 keysToDelete.push(key);
//             }
//         }

//         keysToDelete.forEach(key => this.cache.delete(key));
//         logger.debug(`MemoryAdapter: イベント(${eventType})関連の${keysToDelete.length}件のキャッシュをクリア`);
//     }
// }

// // シングルトンインスタンス
// export const memoryAdapter = new MemoryAdapter();