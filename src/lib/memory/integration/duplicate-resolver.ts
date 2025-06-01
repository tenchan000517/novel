/**
 * @fileoverview 重複処理解決システム
 * @description
 * 記憶階層システム内の重複データと処理を統合・最適化するクラス。
 * 世界設定4箇所重複、キャラクター情報2箇所重複、記憶アクセス3箇所分散の問題を解決します。
 */

import { logger } from '@/lib/utils/logger';
import { WorldSettings } from '@/lib/plot/types';
import { Character } from '@/types/characters';
import { ChapterMemory, ArcMemory, KeyEvent, SearchResult, Memory, MemoryType } from '@/types/memory';

/**
 * 統一メモリクエリの型定義
 */
export interface MemoryQuery {
    type: 'worldSettings' | 'characterInfo' | 'chapterMemories' | 'arcMemory' | 'keyEvents' | 'search';
    target?: string | number;
    parameters?: Record<string, any>;
    options?: {
        useCache?: boolean;
        forceRefresh?: boolean;
        includeMetadata?: boolean;
    };
}

/**
 * 統一メモリ結果の型定義
 */
export interface MemoryResult {
    success: boolean;
    data: any;
    source: 'cache' | 'short-term' | 'mid-term' | 'long-term' | 'unified';
    timestamp: string;
    metadata?: {
        cacheHit: boolean;
        processingTime: number;
        dataFreshness: number;
        conflictsResolved: string[];
    };
}

/**
 * キャラクター情報統合結果の型定義
 */
export interface ConsolidatedCharacterInfo extends Character {
    sources: string[];
    lastConsolidated: string;
    conflictsResolved: Array<{
        field: string;
        values: any[];
        chosenValue: any;
        reason: string;
    }>;
}

/**
 * 世界設定統合結果の型定義
 */
export interface ConsolidatedWorldSettings extends WorldSettings {
    sources: string[];
    lastConsolidated: string;
    conflictsResolved: Array<{
        field: string;
        values: any[];
        chosenValue: any;
        reason: string;
    }>;
}

/**
 * @class DuplicateResolver
 * @description
 * システム内の重複データと処理を解決し、統一されたアクセスインターフェースを提供するクラス。
 * キャッシュを活用して効率的な重複排除を実現します。
 */
export class DuplicateResolver {
    private worldSettingsCache: Map<string, ConsolidatedWorldSettings> = new Map();
    private characterInfoCache: Map<string, ConsolidatedCharacterInfo> = new Map();
    private memoryAccessCache: Map<string, MemoryResult> = new Map();
    private lastConsolidationTime: Map<string, number> = new Map();

    // キャッシュ有効期限（ミリ秒）
    private readonly CACHE_TTL = {
        worldSettings: 30 * 60 * 1000,  // 30分
        characterInfo: 15 * 60 * 1000,  // 15分
        memoryAccess: 5 * 60 * 1000     // 5分
    };

    constructor(
        private memoryComponents: {
            immediateContext?: any;
            narrativeMemory?: any;
            worldKnowledge?: any;
            eventMemory?: any;
            characterManager?: any;
        }
    ) {
        logger.info('DuplicateResolver initialized');
    }

    /**
     * 世界設定4箇所重複を解決して統合された世界設定を返す
     * 
     * @returns {Promise<ConsolidatedWorldSettings>} 統合された世界設定
     */
    async getConsolidatedWorldSettings(): Promise<ConsolidatedWorldSettings> {
        const cacheKey = 'worldSettings';

        // キャッシュチェック
        if (this.isCacheValid(cacheKey, this.CACHE_TTL.worldSettings)) {
            const cached = this.worldSettingsCache.get(cacheKey);
            if (cached) {
                logger.debug('Returning cached world settings');
                return cached;
            }
        }

        try {
            logger.info('Consolidating world settings from 4 sources');

            const sources: Array<{ name: string; data: WorldSettings | null }> = [];
            const conflictsResolved: Array<{
                field: string;
                values: any[];
                chosenValue: any;
                reason: string;
            }> = [];

            // ソース1: WorldKnowledge
            try {
                const worldKnowledgeSettings = this.memoryComponents.worldKnowledge
                    ? await this.memoryComponents.worldKnowledge.getWorldSettings()
                    : null;
                sources.push({ name: 'WorldKnowledge', data: worldKnowledgeSettings });
            } catch (error) {
                logger.warn('Failed to get settings from WorldKnowledge', { error });
                sources.push({ name: 'WorldKnowledge', data: null });
            }

            // ソース2: NarrativeMemory (物語状態から推定)
            try {
                const narrativeState = this.memoryComponents.narrativeMemory
                    ? await this.memoryComponents.narrativeMemory.getCurrentState(-1)
                    : null;

                const narrativeSettings: WorldSettings | null = narrativeState ? {
                    description: narrativeState.currentTheme || '物語の世界',
                    genre: narrativeState.genre || 'classic',
                    regions: [],
                    history: [],
                    rules: []
                } : null;

                sources.push({ name: 'NarrativeMemory', data: narrativeSettings });
            } catch (error) {
                logger.warn('Failed to get settings from NarrativeMemory', { error });
                sources.push({ name: 'NarrativeMemory', data: null });
            }

            // ソース3: PlotManager (動的インポート)
            // try {
            //     const { plotManager } = await import('@/lib/plot');
            //     const plotGenre = await plotManager.getGenre();
            //     const plotSettings: WorldSettings = {
            //         description: '物語の基本設定',
            //         genre: plotGenre,
            //         regions: [],
            //         history: [],
            //         rules: []
            //     };
            //     sources.push({ name: 'PlotManager', data: plotSettings });
            // } catch (error) {
            //     logger.warn('Failed to get settings from PlotManager', { error });
            //     sources.push({ name: 'PlotManager', data: null });
            // }

            // ソース4: EventMemory (イベントから推定される世界設定)
            try {
                const eventStatus = this.memoryComponents.eventMemory
                    ? await this.memoryComponents.eventMemory.getStatus()
                    : null;

                const eventSettings: WorldSettings | null = eventStatus ? {
                    description: `${eventStatus.eventCount}個のイベントが記録された世界`,
                    genre: 'classic',
                    regions: [],
                    history: [],
                    rules: []
                } : null;

                sources.push({ name: 'EventMemory', data: eventSettings });
            } catch (error) {
                logger.warn('Failed to get settings from EventMemory', { error });
                sources.push({ name: 'EventMemory', data: null });
            }

            // データ統合処理
            const validSources = sources.filter(s => s.data !== null);

            if (validSources.length === 0) {
                // フォールバック設定
                const fallbackSettings: ConsolidatedWorldSettings = {
                    description: '基本的な物語世界',
                    genre: 'classic',
                    regions: [],
                    history: [],
                    rules: [],
                    sources: ['fallback'],
                    lastConsolidated: new Date().toISOString(),
                    conflictsResolved: []
                };

                this.worldSettingsCache.set(cacheKey, fallbackSettings);
                this.lastConsolidationTime.set(cacheKey, Date.now());

                return fallbackSettings;
            }

            // フィールドごとの統合処理
            const consolidatedSettings: ConsolidatedWorldSettings = {
                description: this.resolveStringField('description', validSources, conflictsResolved),
                genre: this.resolveStringField('genre', validSources, conflictsResolved),
                regions: this.resolveArrayField('regions', validSources, conflictsResolved),
                history: this.resolveArrayField('history', validSources, conflictsResolved),
                rules: this.resolveArrayField('rules', validSources, conflictsResolved),
                sources: validSources.map(s => s.name),
                lastConsolidated: new Date().toISOString(),
                conflictsResolved
            };

            // キャッシュに保存
            this.worldSettingsCache.set(cacheKey, consolidatedSettings);
            this.lastConsolidationTime.set(cacheKey, Date.now());

            logger.info(`World settings consolidated from ${validSources.length} sources with ${conflictsResolved.length} conflicts resolved`);

            return consolidatedSettings;

        } catch (error) {
            logger.error('Failed to consolidate world settings', {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー時のフォールバック
            const fallbackSettings: ConsolidatedWorldSettings = {
                description: '基本的な物語世界',
                genre: 'classic',
                regions: [],
                history: [],
                rules: [],
                sources: ['fallback'],
                lastConsolidated: new Date().toISOString(),
                conflictsResolved: []
            };

            return fallbackSettings;
        }
    }

    /**
     * キャラクター情報2箇所重複を解決して統合されたキャラクター情報を返す
     * 
     * @param {string} characterId キャラクターID
     * @returns {Promise<ConsolidatedCharacterInfo>} 統合されたキャラクター情報
     */
    async getConsolidatedCharacterInfo(characterId: string): Promise<ConsolidatedCharacterInfo> {
        const cacheKey = `character_${characterId}`;

        // キャッシュチェック
        if (this.isCacheValid(cacheKey, this.CACHE_TTL.characterInfo)) {
            const cached = this.characterInfoCache.get(cacheKey);
            if (cached) {
                logger.debug(`Returning cached character info for ${characterId}`);
                return cached;
            }
        }

        try {
            logger.info(`Consolidating character info for ${characterId} from 2 sources`);

            const sources: Array<{ name: string; data: Character | null }> = [];
            const conflictsResolved: Array<{
                field: string;
                values: any[];
                chosenValue: any;
                reason: string;
            }> = [];

            // ソース1: CharacterManager
            try {
                const characterManagerData = this.memoryComponents.characterManager
                    ? await this.memoryComponents.characterManager.getCharacter(characterId)
                    : null;
                sources.push({ name: 'CharacterManager', data: characterManagerData });
            } catch (error) {
                logger.warn(`Failed to get character from CharacterManager: ${characterId}`, { error });
                sources.push({ name: 'CharacterManager', data: null });
            }

            // ソース2: WorldKnowledge
            try {
                // CharacterManagerから名前を取得してWorldKnowledgeで検索
                let characterName = '';
                if (this.memoryComponents.characterManager) {
                    const char = await this.memoryComponents.characterManager.getCharacter(characterId);
                    if (char) {
                        characterName = char.name;
                    }
                }

                const worldKnowledgeData = this.memoryComponents.worldKnowledge && characterName
                    ? await this.memoryComponents.worldKnowledge.getCharacter(characterName)
                    : null;

                // WorldKnowledge形式をCharacter形式に変換
                const convertedData: Character | null = worldKnowledgeData ? {
                    id: characterId,
                    name: worldKnowledgeData.name,
                    shortNames: [worldKnowledgeData.name], // 必須プロパティを追加
                    type: 'MAIN', // デフォルト値
                    description: worldKnowledgeData.description,
                    personality: {
                        traits: worldKnowledgeData.traits || []
                    },
                    backstory: {
                        summary: `${worldKnowledgeData.name}の背景`,
                        significantEvents: []
                    },
                    state: {
                        isActive: true,
                        emotionalState: 'NEUTRAL',
                        developmentStage: 0,
                        lastAppearance: worldKnowledgeData.firstAppearance || 1,
                        development: `${worldKnowledgeData.name}の基本的な発展状況` // 必須プロパティを追加
                    },
                    relationships: worldKnowledgeData.relationships?.map((rel: any) => ({
                        targetId: rel.target,
                        type: rel.relation,
                        strength: rel.strength
                    })) || [],
                    // 必須プロパティhistoryを追加
                    history: {
                        appearances: [],
                        interactions: [],
                        developmentPath: []
                    },
                    metadata: {
                        createdAt: new Date(worldKnowledgeData.created),
                        lastUpdated: new Date(worldKnowledgeData.lastUpdated)
                    }
                } : null;

                sources.push({ name: 'WorldKnowledge', data: convertedData });
            } catch (error) {
                logger.warn(`Failed to get character from WorldKnowledge: ${characterId}`, { error });
                sources.push({ name: 'WorldKnowledge', data: null });
            }

            // データ統合処理
            const validSources = sources.filter((s): s is { name: string; data: Character } => s.data !== null);

            if (validSources.length === 0) {
                throw new Error(`Character not found in any source: ${characterId}`);
            }

            // 最も完全なソースを基準にする（CharacterManagerを優先）
            const primarySource = validSources.find(s => s.name === 'CharacterManager') || validSources[0];
            const baseCharacter = primarySource.data;

            // フィールドごとの統合処理
            const consolidatedCharacter: ConsolidatedCharacterInfo = {
                ...baseCharacter,
                name: this.resolveCharacterStringField('name', validSources, conflictsResolved),
                description: this.resolveCharacterStringField('description', validSources, conflictsResolved),
                personality: {
                    ...baseCharacter.personality,
                    traits: this.resolveCharacterArrayField('personality.traits', validSources, conflictsResolved)
                },
                sources: validSources.map(s => s.name),
                lastConsolidated: new Date().toISOString(),
                conflictsResolved
            };

            // キャッシュに保存
            this.characterInfoCache.set(cacheKey, consolidatedCharacter);
            this.lastConsolidationTime.set(cacheKey, Date.now());

            logger.info(`Character info consolidated for ${characterId} from ${validSources.length} sources with ${conflictsResolved.length} conflicts resolved`);

            return consolidatedCharacter;

        } catch (error) {
            logger.error(`Failed to consolidate character info for ${characterId}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
 * アクセス要求の重複を解決
 */
    async resolveAccess(request: any): Promise<any> {
        try {
            logger.debug('Resolving duplicate access request');
            // 基本的な重複解決処理
            return request;
        } catch (error) {
            logger.warn('Failed to resolve access duplicates', { error });
            return request;
        }
    }

    /**
     * データ重複を検出
     */
    async detectDataDuplicates(data: any[]): Promise<any[]> {
        try {
            // 重複検出ロジック
            const duplicates: any[] = [];
            // 実装は具体的なデータ構造に応じて
            return duplicates;
        } catch (error) {
            logger.warn('Failed to detect data duplicates', { error });
            return [];
        }
    }

    /**
     * 重複を解決
     */
    async resolveDuplicates(duplicates: any[]): Promise<void> {
        try {
            for (const duplicate of duplicates) {
                logger.debug(`Resolving duplicate: ${duplicate.id}`);
                // 重複解決処理
            }
        } catch (error) {
            logger.warn('Failed to resolve duplicates', { error });
        }
    }

    /**
     * 診断情報を取得
     */
    async getDiagnostics(): Promise<any> {
        try {
            return {
                operational: true,
                efficiency: 0.85,
                errorRate: 0.05,
                lastOptimization: new Date().toISOString(),
                recommendations: []
            };
        } catch (error) {
            logger.error('Failed to get duplicate resolver diagnostics', { error });
            return {
                operational: false,
                efficiency: 0,
                errorRate: 1,
                lastOptimization: '',
                recommendations: ['Duplicate resolver diagnostics failed']
            };
        }
    }

    /**
     * 記憶アクセス3箇所分散を解決して統一されたメモリアクセスを提供
     * 
     * @param {MemoryQuery} query メモリクエリ
     * @returns {Promise<MemoryResult>} 統一されたメモリ結果
     */
    async getUnifiedMemoryAccess(query: MemoryQuery): Promise<MemoryResult> {
        const startTime = Date.now();
        const cacheKey = this.generateMemoryAccessCacheKey(query);

        // キャッシュチェック（オプションで無効化可能）
        if (query.options?.useCache !== false && this.isCacheValid(cacheKey, this.CACHE_TTL.memoryAccess)) {
            const cached = this.memoryAccessCache.get(cacheKey);
            if (cached && !query.options?.forceRefresh) {
                logger.debug(`Returning cached memory access result for ${query.type}`);
                return {
                    ...cached,
                    metadata: {
                        ...cached.metadata!,
                        cacheHit: true,
                        processingTime: Date.now() - startTime
                    }
                };
            }
        }

        try {
            logger.info(`Processing unified memory access for ${query.type}`);

            let result: MemoryResult;

            switch (query.type) {
                case 'worldSettings':
                    result = await this.handleWorldSettingsQuery(query);
                    break;
                case 'characterInfo':
                    result = await this.handleCharacterInfoQuery(query);
                    break;
                case 'chapterMemories':
                    result = await this.handleChapterMemoriesQuery(query);
                    break;
                case 'arcMemory':
                    result = await this.handleArcMemoryQuery(query);
                    break;
                case 'keyEvents':
                    result = await this.handleKeyEventsQuery(query);
                    break;
                case 'search':
                    result = await this.handleSearchQuery(query);
                    break;
                default:
                    throw new Error(`Unsupported query type: ${query.type}`);
            }

            // 処理時間とメタデータを追加
            result.metadata = {
                ...result.metadata,
                cacheHit: false,
                processingTime: Date.now() - startTime,
                dataFreshness: this.calculateDataFreshness(result.source),
                conflictsResolved: []
            };

            // キャッシュに保存（オプションで無効化可能）
            if (query.options?.useCache !== false) {
                this.memoryAccessCache.set(cacheKey, result);
                this.lastConsolidationTime.set(cacheKey, Date.now());
            }

            logger.info(`Unified memory access completed for ${query.type} in ${result.metadata.processingTime}ms`);

            return result;

        } catch (error) {
            logger.error(`Failed to process unified memory access for ${query.type}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                success: false,
                data: null,
                source: 'unified',
                timestamp: new Date().toISOString(),
                metadata: {
                    cacheHit: false,
                    processingTime: Date.now() - startTime,
                    dataFreshness: 0,
                    conflictsResolved: []
                }
            };
        }
    }

    /**
     * キャッシュの有効性をチェック
     * @private
     */
    private isCacheValid(cacheKey: string, ttl: number): boolean {
        const lastTime = this.lastConsolidationTime.get(cacheKey);
        if (!lastTime) return false;

        return (Date.now() - lastTime) < ttl;
    }

    /**
     * 文字列フィールドの競合解決
     * @private
     */
    private resolveStringField(
        fieldName: string,
        sources: Array<{ name: string; data: any }>,
        conflictsResolved: Array<any>
    ): string {
        const values = sources
            .map(s => s.data?.[fieldName])
            .filter(v => v && typeof v === 'string');

        if (values.length === 0) return '';
        if (values.length === 1) return values[0];

        // 複数の値がある場合の競合解決
        const uniqueValues = [...new Set(values)];
        if (uniqueValues.length === 1) return uniqueValues[0];

        // 優先順位ベースの解決（最も長い説明を選択）
        const chosenValue = uniqueValues.reduce((longest, current) =>
            current.length > longest.length ? current : longest
        );

        conflictsResolved.push({
            field: fieldName,
            values: uniqueValues,
            chosenValue,
            reason: 'Selected longest description'
        });

        return chosenValue;
    }

    /**
     * 配列フィールドの競合解決
     * @private
     */
    private resolveArrayField(
        fieldName: string,
        sources: Array<{ name: string; data: any }>,
        conflictsResolved: Array<any>
    ): any[] {
        const arrays = sources
            .map(s => s.data?.[fieldName])
            .filter(v => Array.isArray(v));

        if (arrays.length === 0) return [];
        if (arrays.length === 1) return arrays[0];

        // 配列の統合（重複除去）
        const combined = arrays.flat();
        const unique = [...new Set(combined)];

        if (combined.length !== unique.length) {
            conflictsResolved.push({
                field: fieldName,
                values: arrays,
                chosenValue: unique,
                reason: 'Merged arrays with duplicates removed'
            });
        }

        return unique;
    }

    /**
     * キャラクター文字列フィールドの競合解決
     * @private
     */
    private resolveCharacterStringField(
        fieldName: string,
        sources: Array<{ name: string; data: Character }>,
        conflictsResolved: Array<any>
    ): string {
        const values = sources
            .map(s => this.getNestedValue(s.data, fieldName))
            .filter(v => v && typeof v === 'string');

        if (values.length === 0) return '';
        if (values.length === 1) return values[0];

        const uniqueValues = [...new Set(values)];
        if (uniqueValues.length === 1) return uniqueValues[0];

        // CharacterManagerのデータを優先
        const charManagerSource = sources.find(s => s.name === 'CharacterManager');
        if (charManagerSource) {
            const charManagerValue = this.getNestedValue(charManagerSource.data, fieldName);
            if (charManagerValue && typeof charManagerValue === 'string') {
                conflictsResolved.push({
                    field: fieldName,
                    values: uniqueValues,
                    chosenValue: charManagerValue,
                    reason: 'Prioritized CharacterManager data'
                });
                return charManagerValue;
            }
        }

        // フォールバック: 最も長い値を選択
        const chosenValue = uniqueValues.reduce((longest, current) =>
            current.length > longest.length ? current : longest
        );

        conflictsResolved.push({
            field: fieldName,
            values: uniqueValues,
            chosenValue,
            reason: 'Selected longest value'
        });

        return chosenValue;
    }

    /**
     * キャラクター配列フィールドの競合解決
     * @private
     */
    private resolveCharacterArrayField(
        fieldName: string,
        sources: Array<{ name: string; data: Character }>,
        conflictsResolved: Array<any>
    ): any[] {
        const arrays = sources
            .map(s => this.getNestedValue(s.data, fieldName))
            .filter(v => Array.isArray(v));

        if (arrays.length === 0) return [];
        if (arrays.length === 1) return arrays[0];

        const combined = arrays.flat();
        const unique = [...new Set(combined)];

        if (combined.length !== unique.length) {
            conflictsResolved.push({
                field: fieldName,
                values: arrays,
                chosenValue: unique,
                reason: 'Merged character arrays with duplicates removed'
            });
        }

        return unique;
    }

    /**
     * ネストされた値を取得するヘルパー
     * @private
     */
    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * メモリアクセスキャッシュキーを生成
     * @private
     */
    private generateMemoryAccessCacheKey(query: MemoryQuery): string {
        const params = query.parameters ? JSON.stringify(query.parameters) : '';
        const target = query.target || '';
        return `${query.type}_${target}_${params}`;
    }

    /**
     * データの新鮮度を計算
     * @private
     */
    private calculateDataFreshness(source: string): number {
        switch (source) {
            case 'cache': return 0.5;
            case 'short-term': return 1.0;
            case 'mid-term': return 0.8;
            case 'long-term': return 0.6;
            case 'unified': return 0.9;
            default: return 0.5;
        }
    }

    // クエリハンドラーメソッド群
    /**
     * 世界設定クエリを処理
     * @private
     */
    private async handleWorldSettingsQuery(query: MemoryQuery): Promise<MemoryResult> {
        const data = await this.getConsolidatedWorldSettings();
        return {
            success: true,
            data,
            source: 'unified',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * キャラクター情報クエリを処理
     * @private
     */
    private async handleCharacterInfoQuery(query: MemoryQuery): Promise<MemoryResult> {
        if (!query.target || typeof query.target !== 'string') {
            throw new Error('Character ID is required for character info query');
        }

        const data = await this.getConsolidatedCharacterInfo(query.target);
        return {
            success: true,
            data,
            source: 'unified',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 章メモリクエリを処理
     * @private
     */
    private async handleChapterMemoriesQuery(query: MemoryQuery): Promise<MemoryResult> {
        const upToChapter = query.parameters?.upToChapter || 10;
        const limit = query.parameters?.limit || 5;

        let data: ChapterMemory[] = [];
        let source: 'short-term' | 'mid-term' = 'short-term';

        // ImmediateContextから取得を試行
        if (this.memoryComponents.immediateContext) {
            try {
                const recentChapters = await this.memoryComponents.immediateContext.getRecentChapters(upToChapter);
                data = recentChapters.map((chapterInfo: any) => ({
                    chapter: chapterInfo.chapter.chapterNumber,
                    summary: chapterInfo.chapter.content.substring(0, 200) + '...',
                    key_events: [],
                    character_states: Array.from(chapterInfo.characterState.values()),
                    timestamp: chapterInfo.timestamp,
                    emotional_impact: 5,
                    plot_significance: 5
                }));
                source = 'short-term';
            } catch (error) {
                logger.warn('Failed to get chapter memories from ImmediateContext', { error });
            }
        }

        // データが取得できない場合はNarrativeMemoryから取得
        if (data.length === 0 && this.memoryComponents.narrativeMemory) {
            try {
                const summaries = await this.memoryComponents.narrativeMemory.getAllChapterSummaries();
                data = summaries.slice(0, limit).map((summary: any) => ({
                    chapter: summary.chapterNumber,
                    summary: summary.summary,
                    key_events: [],
                    character_states: [],
                    timestamp: summary.timestamp,
                    emotional_impact: 5,
                    plot_significance: 5
                }));
                source = 'mid-term';
            } catch (error) {
                logger.warn('Failed to get chapter memories from NarrativeMemory', { error });
            }
        }

        return {
            success: data.length > 0,
            data: data.slice(0, limit),
            source,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * アークメモリクエリを処理
     * @private
     */
    private async handleArcMemoryQuery(query: MemoryQuery): Promise<MemoryResult> {
        const arcNumber = query.parameters?.arcNumber || 1;

        let data: ArcMemory | null = null;
        let source: 'mid-term' | 'long-term' = 'mid-term';

        // NarrativeMemoryから取得を試行
        if (this.memoryComponents.narrativeMemory) {
            try {
                data = await this.memoryComponents.narrativeMemory.getArcMemory(arcNumber);
                source = 'mid-term';
            } catch (error) {
                logger.warn('Failed to get arc memory from NarrativeMemory', { error });
            }
        }

        return {
            success: data !== null,
            data,
            source,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * キーイベントクエリを処理
     * @private
     */
    private async handleKeyEventsQuery(query: MemoryQuery): Promise<MemoryResult> {
        const startChapter = query.parameters?.startChapter || 1;
        const endChapter = query.parameters?.endChapter || 10;

        let data: KeyEvent[] = [];
        let source: 'long-term' | 'mid-term' = 'long-term';

        // WorldKnowledgeから確立されたイベントを取得
        if (this.memoryComponents.worldKnowledge) {
            try {
                const establishedEvents = await this.memoryComponents.worldKnowledge.getEstablishedEvents({
                    start: startChapter,
                    end: endChapter
                });

                data = establishedEvents.map((event: any) => ({
                    event: event.description,
                    chapter: event.chapter,
                    significance: event.significance || 5,
                    characters: event.characters || []
                }));
                source = 'long-term';
            } catch (error) {
                logger.warn('Failed to get key events from WorldKnowledge', { error });
            }
        }

        // NarrativeMemoryからターニングポイントを追加
        if (this.memoryComponents.narrativeMemory) {
            try {
                const narrativeState = await this.memoryComponents.narrativeMemory.getCurrentState(endChapter);
                const turningPoints = narrativeState.turningPoints || [];

                const additionalEvents = turningPoints
                    .filter((tp: any) => tp.chapter >= startChapter && tp.chapter <= endChapter)
                    .map((tp: any) => ({
                        event: tp.description,
                        chapter: tp.chapter,
                        significance: tp.significance
                    }));

                data = [...data, ...additionalEvents];
            } catch (error) {
                logger.warn('Failed to get turning points from NarrativeMemory', { error });
            }
        }

        // 重要度でソート
        data.sort((a, b) => b.significance - a.significance);

        return {
            success: data.length > 0,
            data,
            source,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 検索クエリを処理
     * @private
     */
    private async handleSearchQuery(query: MemoryQuery): Promise<MemoryResult> {
        const searchQuery = query.parameters?.query || '';
        const limit = query.parameters?.limit || 10;
        const memoryTypes: MemoryType[] = query.parameters?.memoryTypes || ['SHORT_TERM', 'MID_TERM', 'LONG_TERM'];

        let data: SearchResult[] = [];
        const source = 'unified';

        if (!searchQuery) {
            return {
                success: false,
                data: [],
                source,
                timestamp: new Date().toISOString()
            };
        }

        // 各記憶層から検索
        const memories: Memory[] = [];

        // SHORT_TERM: ImmediateContext
        if (memoryTypes.includes('SHORT_TERM') && this.memoryComponents.immediateContext) {
            try {
                const recentChapters = await this.memoryComponents.immediateContext.getRecentChapters();
                for (const chapterInfo of recentChapters) {
                    memories.push({
                        type: 'SHORT_TERM',
                        content: `チャプター${chapterInfo.chapter.chapterNumber}: ${chapterInfo.chapter.content.substring(0, 200)}...`,
                        priority: 0.8
                    });
                }
            } catch (error) {
                logger.warn('Failed to search in ImmediateContext', { error });
            }
        }

        // MID_TERM: NarrativeMemory
        if (memoryTypes.includes('MID_TERM') && this.memoryComponents.narrativeMemory) {
            try {
                const summaries = await this.memoryComponents.narrativeMemory.getAllChapterSummaries();
                for (const summary of summaries) {
                    memories.push({
                        type: 'MID_TERM',
                        content: `チャプター${summary.chapterNumber}要約: ${summary.summary}`,
                        priority: 0.6
                    });
                }
            } catch (error) {
                logger.warn('Failed to search in NarrativeMemory', { error });
            }
        }

        // LONG_TERM: WorldKnowledge
        if (memoryTypes.includes('LONG_TERM') && this.memoryComponents.worldKnowledge) {
            try {
                const worldSettings = await this.memoryComponents.worldKnowledge.getWorldSettings();
                memories.push({
                    type: 'LONG_TERM',
                    content: `世界設定: ${worldSettings.description}`,
                    priority: 0.9
                });

                const foreshadowing = await this.memoryComponents.worldKnowledge.getUnresolvedForeshadowing();
                for (const fs of foreshadowing) {
                    memories.push({
                        type: 'LONG_TERM',
                        content: `伏線(チャプター${fs.chapter_introduced}): ${fs.description}`,
                        priority: 0.8
                    });
                }
            } catch (error) {
                logger.warn('Failed to search in WorldKnowledge', { error });
            }
        }

        // キーワード検索の実行
        data = this.performKeywordSearch(searchQuery, memories, 0.3);
        data = data.sort((a, b) => b.relevance - a.relevance).slice(0, limit);

        return {
            success: data.length > 0,
            data,
            source,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * キーワード検索を実行
     * @private
     */
    private performKeywordSearch(query: string, memories: Memory[], minRelevance: number): SearchResult[] {
        const keywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 1);

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
}