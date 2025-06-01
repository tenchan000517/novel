// src/lib/memory/long-term/world-knowledge.ts
/**
 * @fileoverview 統合世界知識管理システム（リファクタリング版）
 * @description
 * 🔧 4箇所の重複解決を含む世界知識の統合管理
 * 🔧 長期記憶として基本設定・知識・概念定義を一元管理
 * 🔧 重複処理解決システムの実装
 */

import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { Foreshadowing, PersistentEventType } from '@/types/memory';
import { Character } from '@/types/characters';
import { ConsolidationGuard } from './consolidation-guard';

// ============================================================================
// 型定義：統合世界知識システム
// ============================================================================

/**
 * 統合世界設定マスターレコード（4箇所重複解決）
 */
interface WorldSettingsMasterRecord {
    description: string;
    regions: string[];
    history: string[];
    rules: string[];
    genre: string;
    version: string;
    lastUpdated: string;
    consolidatedFrom: string[]; // 統合元の4箇所
    consolidationTimestamp: string;
    conflicts: ConflictResolution[];
}

/**
 * 統合ジャンル設定マスターレコード（6箇所分散解決）
 */
interface GenreSettingsMasterRecord {
    genre: string;
    characteristics: string[];
    typicalElements: string[];
    recommendedTones: string[];
    emotionalDimensions: string[];
    structuralPatterns: string[];
    sources: string[]; // 統合元の6箇所
    lastConsolidated: string;
    priority: number;
}

/**
 * テンプレートマスターレコード
 */
interface TemplateMasterRecord {
    templateId: string;
    templateType: string;
    content: string;
    variables: string[];
    effectiveness: number;
    usageCount: number;
    applicableGenres: string[];
    lastOptimized: string;
}

/**
 * システム設定マスターレコード
 */
interface SystemConfigMasterRecord {
    configId: string;
    category: string;
    settings: Record<string, any>;
    validationRules: string[];
    dependencies: string[];
    lastValidated: string;
}

/**
 * 世界知識データベース
 */
interface WorldKnowledgeDatabase {
    locations: Map<string, LocationRecord>;
    events: Map<string, HistoricalEventRecord>;
    cultures: Map<string, CultureRecord>;
    technologies: Map<string, TechnologyRecord>;
    magicSystems: Map<string, MagicSystemRecord>;
    politicalSystems: Map<string, PoliticalSystemRecord>;
    lastUpdated: string;
}

/**
 * 概念定義レコード
 */
interface ConceptDefinitionRecord {
    conceptId: string;
    name: string;
    definition: string;
    synonyms: string[];
    relatedConcepts: string[];
    importance: number;
    firstIntroduced: number; // チャプター番号
    usageFrequency: number;
}

/**
 * 伏線データベース
 */
interface ForeshadowingDatabase {
    activeForeshadowing: Map<string, Foreshadowing>;
    resolvedForeshadowing: Map<string, Foreshadowing>;
    patterns: ForeshadowingPattern[];
    effectiveness: ForeshadowingEffectiveness[];
    nextId: number;
}

/**
 * 伏線パターン
 */
interface ForeshadowingPattern {
    patternId: string;
    type: string;
    description: string;
    effectivenessRate: number;
    recommendedTiming: number[];
    genre: string[];
}

/**
 * 伏線効果分析
 */
interface ForeshadowingEffectiveness {
    foreshadowingId: string;
    introducedChapter: number;
    resolvedChapter: number;
    readerEngagement: number;
    plotSignificance: number;
    executionQuality: number;
}

/**
 * セクション定義レコード
 */
interface SectionDefinitionRecord {
    sectionId: string;
    sectionType: string;
    description: string;
    requirements: string[];
    dependencies: string[];
    expectedLength: number;
    difficultyLevel: number;
}

/**
 * 競合解決記録
 */
interface ConflictResolution {
    conflictType: string;
    sourceA: string;
    sourceB: string;
    resolution: string;
    resolutionReason: string;
    resolvedAt: string;
}

/**
 * 場所レコード
 */
interface LocationRecord {
    locationId: string;
    name: string;
    description: string;
    type: string;
    parentLocation?: string;
    significance: number;
    visitedChapters: number[];
}

/**
 * 歴史的イベントレコード
 */
interface HistoricalEventRecord {
    eventId: string;
    name: string;
    description: string;
    timeline: string;
    impact: number;
    relatedCharacters: string[];
    relatedLocations: string[];
}

/**
 * 文化レコード
 */
interface CultureRecord {
    cultureId: string;
    name: string;
    description: string;
    values: string[];
    customs: string[];
    language?: string;
    territory: string[];
}

/**
 * 技術レコード
 */
interface TechnologyRecord {
    technologyId: string;
    name: string;
    description: string;
    developmentLevel: number;
    availability: string;
    limitations: string[];
    relatedTechnologies: string[];
}

/**
 * 魔法システムレコード
 */
interface MagicSystemRecord {
    systemId: string;
    name: string;
    description: string;
    rules: string[];
    limitations: string[];
    practitioners: string[];
    power: number;
}

/**
 * 政治システムレコード
 */
interface PoliticalSystemRecord {
    systemId: string;
    name: string;
    type: string;
    description: string;
    rulers: string[];
    laws: string[];
    territory: string[];
    stability: number;
}

// ============================================================================
// 統合世界知識クラス
// ============================================================================

/**
 * @class WorldKnowledge
 * @description
 * 統合世界知識管理システム（リファクタリング版）
 * 4箇所の重複解決と統合基本設定管理を実現
 */
export class WorldKnowledge {
    // 統合基本設定（重複解決済み）
    private consolidatedSettings: {
        worldSettingsMaster: WorldSettingsMasterRecord;
        genreSettingsMaster: GenreSettingsMasterRecord;
        templateMaster: Map<string, TemplateMasterRecord>;
        systemConfigMaster: Map<string, SystemConfigMasterRecord>;
    };

    // キャラクター・世界知識データベース
    private knowledgeDatabase: {
        characters: Map<string, Character>;
        worldKnowledge: WorldKnowledgeDatabase;
        conceptDefinitions: Map<string, ConceptDefinitionRecord>;
        foreshadowingDatabase: ForeshadowingDatabase;
        sectionDefinitions: Map<string, SectionDefinitionRecord>;
    };

    private initialized: boolean = false;
    private lastConsolidationTime: string = '';

    /**
     * コンストラクタ
     */
    constructor() {
        this.consolidatedSettings = {
            worldSettingsMaster: this.createDefaultWorldSettings(),
            genreSettingsMaster: this.createDefaultGenreSettings(),
            templateMaster: new Map(),
            systemConfigMaster: new Map()
        };

        this.knowledgeDatabase = {
            characters: new Map(),
            worldKnowledge: this.createDefaultWorldKnowledgeDatabase(),
            conceptDefinitions: new Map(),
            foreshadowingDatabase: this.createDefaultForeshadowingDatabase(),
            sectionDefinitions: new Map()
        };

        logger.info('WorldKnowledge (Refactored) initialized');
    }

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('WorldKnowledge already initialized');
            return;
        }

        try {
            // ストレージからの読み込み
            await this.loadConsolidatedSettings();
            await this.loadKnowledgeDatabase();

            // 統合処理実行（4箇所重複解決）
            await this.performInitialConsolidation();

            this.initialized = true;
            this.lastConsolidationTime = new Date().toISOString();

            logger.info('WorldKnowledge initialization completed with consolidation');
        } catch (error) {
            logger.error('Failed to initialize WorldKnowledge', {
                error: error instanceof Error ? error.message : String(error)
            });
            this.initialized = true; // エラー時も続行
        }
    }

    // ============================================================================
    // 重複処理解決システム（4箇所統合）
    // ============================================================================

    /**
     * 初期統合処理（4箇所の重複解決）
     */
    private async performInitialConsolidation(): Promise<void> {
        const guard = ConsolidationGuard.getInstance();
        const check = guard.canStartConsolidation('world-consolidation');
        
        if (!check.allowed) {
            logger.debug('World consolidation blocked by guard', { reason: check.reason });
            return;
        }
    
        const consolidationId = guard.startConsolidation('world-consolidation');
    
        try {
            // 4箇所の世界設定ソースを統合
            await this.consolidateWorldSettingsFromMultipleSources();

            // 6箇所のジャンル設定を統合
            await this.consolidateGenreSettingsFromMultipleSources();

            // テンプレート統合
            await this.consolidateTemplates();

            // システム設定統合
            await this.consolidateSystemConfigs();

            logger.info('Initial consolidation completed successfully');
        } catch (error) {
            logger.error('Failed to perform initial consolidation', { error });
            throw error;
        } finally {
            guard.endConsolidation(consolidationId, 'world-consolidation');
        }
    }

    /**
     * 世界設定の4箇所統合
     */
    private async consolidateWorldSettingsFromMultipleSources(): Promise<void> {
        const sources = [
            'narrative-memory/world-context.json',
            'plot/world-settings.json',
            'world-knowledge/current.json',
            'characters/world-context.json'
        ];

        const worldSettingsData: any[] = [];
        const conflicts: ConflictResolution[] = [];

        // 各ソースからデータ収集
        for (const source of sources) {
            try {
                if (await storageProvider.fileExists(source)) {
                    const content = await storageProvider.readFile(source);
                    const data = JSON.parse(content);

                    if (data.worldSettings || data.description) {
                        worldSettingsData.push({
                            source,
                            data: data.worldSettings || data,
                            timestamp: data.lastUpdated || new Date().toISOString()
                        });
                    }
                }
            } catch (error) {
                logger.warn(`Failed to load world settings from ${source}`, { error });
            }
        }

        if (worldSettingsData.length === 0) {
            logger.warn('No world settings sources found, using defaults');
            return;
        }

        // 統合処理
        const consolidatedData = this.mergeWorldSettingsData(worldSettingsData, conflicts);

        // 統合結果を保存
        this.consolidatedSettings.worldSettingsMaster = {
            ...consolidatedData,
            version: '1.0.0',
            lastUpdated: new Date().toISOString(),
            consolidatedFrom: sources,
            consolidationTimestamp: new Date().toISOString(),
            conflicts
        };

        logger.info(`Consolidated world settings from ${worldSettingsData.length} sources with ${conflicts.length} conflicts resolved`);
    }

    /**
     * ジャンル設定の6箇所統合
     */
    private async consolidateGenreSettingsFromMultipleSources(): Promise<void> {
        const sources = [
            'plot/genre-settings.json',
            'narrative-memory/genre-config.json',
            'generation/genre-templates.json',
            'emotional-arc/genre-patterns.json',
            'characters/genre-archetypes.json',
            'world-knowledge/genre-definitions.json'
        ];

        const genreSettingsData: any[] = [];

        // 各ソースからデータ収集
        for (const source of sources) {
            try {
                if (await storageProvider.fileExists(source)) {
                    const content = await storageProvider.readFile(source);
                    const data = JSON.parse(content);

                    if (data.genre || data.genreSettings) {
                        genreSettingsData.push({
                            source,
                            data: data.genreSettings || data,
                            priority: this.getSourcePriority(source)
                        });
                    }
                }
            } catch (error) {
                logger.warn(`Failed to load genre settings from ${source}`, { error });
            }
        }

        // ジャンル統合処理
        const consolidatedGenre = this.mergeGenreSettingsData(genreSettingsData);

        this.consolidatedSettings.genreSettingsMaster = {
            ...consolidatedGenre,
            sources: sources,
            lastConsolidated: new Date().toISOString(),
            priority: Math.max(...genreSettingsData.map(d => d.priority))
        };

        logger.info(`Consolidated genre settings from ${genreSettingsData.length} sources`);
    }

    /**
     * テンプレート統合
     */
    private async consolidateTemplates(): Promise<void> {
        try {
            const templateSources = [
                'templates/prompt-templates.json',
                'generation/templates.json',
                'memory/template-cache.json'
            ];

            for (const source of templateSources) {
                if (await storageProvider.fileExists(source)) {
                    const content = await storageProvider.readFile(source);
                    const templates = JSON.parse(content);

                    if (Array.isArray(templates)) {
                        templates.forEach((template: any) => {
                            const masterTemplate: TemplateMasterRecord = {
                                templateId: template.id || `template-${Date.now()}`,
                                templateType: template.type || 'unknown',
                                content: template.content || template.template || '',
                                variables: template.variables || [],
                                effectiveness: template.effectiveness || 0.5,
                                usageCount: template.usageCount || 0,
                                applicableGenres: template.genres || ['classic'],
                                lastOptimized: template.lastOptimized || new Date().toISOString()
                            };

                            this.consolidatedSettings.templateMaster.set(masterTemplate.templateId, masterTemplate);
                        });
                    }
                }
            }

            logger.info(`Consolidated ${this.consolidatedSettings.templateMaster.size} templates`);
        } catch (error) {
            logger.error('Failed to consolidate templates', { error });
        }
    }

    /**
     * システム設定統合
     */
    private async consolidateSystemConfigs(): Promise<void> {
        try {
            const configSources = [
                'config/system-config.json',
                'settings/app-settings.json',
                'memory/memory-config.json'
            ];

            for (const source of configSources) {
                if (await storageProvider.fileExists(source)) {
                    const content = await storageProvider.readFile(source);
                    const configs = JSON.parse(content);

                    Object.entries(configs).forEach(([key, value]: [string, any]) => {
                        const masterConfig: SystemConfigMasterRecord = {
                            configId: key,
                            category: value.category || 'general',
                            settings: value.settings || value,
                            validationRules: value.validationRules || [],
                            dependencies: value.dependencies || [],
                            lastValidated: new Date().toISOString()
                        };

                        this.consolidatedSettings.systemConfigMaster.set(key, masterConfig);
                    });
                }
            }

            logger.info(`Consolidated ${this.consolidatedSettings.systemConfigMaster.size} system configs`);
        } catch (error) {
            logger.error('Failed to consolidate system configs', { error });
        }
    }

    // ============================================================================
    // データマージング・競合解決
    // ============================================================================

    /**
     * 世界設定データのマージ
     */
    private mergeWorldSettingsData(worldSettingsData: any[], conflicts: ConflictResolution[]): any {
        const merged = {
            description: '',
            regions: [] as string[],
            history: [] as string[],
            rules: [] as string[],
            genre: 'classic'
        };

        // 各フィールドのマージ処理
        worldSettingsData.forEach((sourceData, index) => {
            const data = sourceData.data;

            // 説明のマージ（最も詳細なものを選択）
            if (data.description && data.description.length > merged.description.length) {
                if (merged.description && merged.description !== data.description) {
                    conflicts.push({
                        conflictType: 'description',
                        sourceA: merged.description,
                        sourceB: data.description,
                        resolution: data.description,
                        resolutionReason: 'Selected longer description',
                        resolvedAt: new Date().toISOString()
                    });
                }
                merged.description = data.description;
            }

            // 配列フィールドのマージ（重複排除）
            if (data.regions && Array.isArray(data.regions)) {
                const newRegions = data.regions.filter((r: string) => !merged.regions.includes(r));
                merged.regions.push(...newRegions);
            }

            if (data.history && Array.isArray(data.history)) {
                const newHistory = data.history.filter((h: string) => !merged.history.includes(h));
                merged.history.push(...newHistory);
            }

            if (data.rules && Array.isArray(data.rules)) {
                const newRules = data.rules.filter((r: string) => !merged.rules.includes(r));
                merged.rules.push(...newRules);
            }

            // ジャンルのマージ（最後に更新されたものを優先）
            if (data.genre && data.genre !== 'classic') {
                if (merged.genre !== 'classic' && merged.genre !== data.genre) {
                    conflicts.push({
                        conflictType: 'genre',
                        sourceA: merged.genre,
                        sourceB: data.genre,
                        resolution: data.genre,
                        resolutionReason: 'Selected latest genre update',
                        resolvedAt: new Date().toISOString()
                    });
                }
                merged.genre = data.genre;
            }
        });

        return merged;
    }

    /**
     * ジャンル設定データのマージ
     */
    private mergeGenreSettingsData(genreSettingsData: any[]): any {
        if (genreSettingsData.length === 0) {
            return this.createDefaultGenreSettings();
        }

        // 優先度順にソート
        genreSettingsData.sort((a, b) => b.priority - a.priority);

        const merged = {
            genre: 'classic',
            characteristics: [] as string[],
            typicalElements: [] as string[],
            recommendedTones: [] as string[],
            emotionalDimensions: [] as string[],
            structuralPatterns: [] as string[]
        };

        genreSettingsData.forEach(sourceData => {
            const data = sourceData.data;

            // ジャンル設定のマージ
            if (data.genre) merged.genre = data.genre;

            if (data.characteristics && Array.isArray(data.characteristics)) {
                data.characteristics.forEach((char: string) => {
                    if (!merged.characteristics.includes(char)) {
                        merged.characteristics.push(char);
                    }
                });
            }

            if (data.typicalElements && Array.isArray(data.typicalElements)) {
                data.typicalElements.forEach((elem: string) => {
                    if (!merged.typicalElements.includes(elem)) {
                        merged.typicalElements.push(elem);
                    }
                });
            }

            if (data.recommendedTones && Array.isArray(data.recommendedTones)) {
                data.recommendedTones.forEach((tone: string) => {
                    if (!merged.recommendedTones.includes(tone)) {
                        merged.recommendedTones.push(tone);
                    }
                });
            }

            if (data.emotionalDimensions && Array.isArray(data.emotionalDimensions)) {
                data.emotionalDimensions.forEach((dim: string) => {
                    if (!merged.emotionalDimensions.includes(dim)) {
                        merged.emotionalDimensions.push(dim);
                    }
                });
            }

            if (data.structuralPatterns && Array.isArray(data.structuralPatterns)) {
                data.structuralPatterns.forEach((pattern: string) => {
                    if (!merged.structuralPatterns.includes(pattern)) {
                        merged.structuralPatterns.push(pattern);
                    }
                });
            }
        });

        return merged;
    }

    /**
     * ソース優先度の取得
     */
    private getSourcePriority(source: string): number {
        const priorityMap: Record<string, number> = {
            'plot/genre-settings.json': 10,
            'narrative-memory/genre-config.json': 9,
            'generation/genre-templates.json': 8,
            'emotional-arc/genre-patterns.json': 7,
            'characters/genre-archetypes.json': 6,
            'world-knowledge/genre-definitions.json': 5
        };

        return priorityMap[source] || 1;
    }

    // ============================================================================
    // パブリックAPI（統合データアクセス）
    // ============================================================================

    /**
     * 統合世界設定を取得（4箇所統合済み）
     */
    async getConsolidatedWorldSettings(): Promise<WorldSettingsMasterRecord> {
        if (!this.initialized) {
            await this.initialize();
        }

        return { ...this.consolidatedSettings.worldSettingsMaster };
    }

    /**
     * 統合ジャンル設定を取得（6箇所統合済み）
     */
    async getConsolidatedGenreSettings(): Promise<GenreSettingsMasterRecord> {
        if (!this.initialized) {
            await this.initialize();
        }

        return { ...this.consolidatedSettings.genreSettingsMaster };
    }

    /**
     * 統合キャラクター情報を取得（2箇所重複解決）
     */
    async getConsolidatedCharacterInfo(characterId: string): Promise<Character | null> {
        if (!this.initialized) {
            await this.initialize();
        }

        return this.knowledgeDatabase.characters.get(characterId) || null;
    }

    /**
     * 統一記憶アクセス（3箇所分散解決）
     */
    async getUnifiedMemoryAccess(query: any): Promise<any> {
        if (!this.initialized) {
            await this.initialize();
        }

        // 統一されたメモリアクセスインターフェース
        const results = {
            worldSettings: await this.getConsolidatedWorldSettings(),
            genreSettings: await this.getConsolidatedGenreSettings(),
            concepts: this.searchConcepts(query.term),
            foreshadowing: this.searchForeshadowing(query.term),
            relevantKnowledge: this.getRelevantKnowledge(query.context)
        };

        return results;
    }

    /**
     * 概念検索
     */
    private searchConcepts(term: string): ConceptDefinitionRecord[] {
        if (!term) return [];

        const results: ConceptDefinitionRecord[] = [];

        for (const concept of this.knowledgeDatabase.conceptDefinitions.values()) {
            if (concept.name.toLowerCase().includes(term.toLowerCase()) ||
                concept.definition.toLowerCase().includes(term.toLowerCase()) ||
                concept.synonyms.some(syn => syn.toLowerCase().includes(term.toLowerCase()))) {
                results.push(concept);
            }
        }

        return results.sort((a, b) => b.importance - a.importance);
    }

    /**
     * 伏線検索
     */
    private searchForeshadowing(term: string): Foreshadowing[] {
        if (!term) return [];

        const results: Foreshadowing[] = [];

        for (const foreshadowing of this.knowledgeDatabase.foreshadowingDatabase.activeForeshadowing.values()) {
            if (foreshadowing.description.toLowerCase().includes(term.toLowerCase())) {
                results.push(foreshadowing);
            }
        }

        // 修正版1: nullish coalescing演算子を使用してデフォルト値を設定
        return results.sort((a, b) => (b.significance ?? 0) - (a.significance ?? 0));
    }

    /**
     * 関連知識取得
     */
    private getRelevantKnowledge(context: string): any {
        // コンテキストに基づいた関連知識の取得
        return {
            locations: this.getRelevantLocations(context),
            events: this.getRelevantEvents(context),
            cultures: this.getRelevantCultures(context)
        };
    }

    /**
     * 関連場所取得
     */
    private getRelevantLocations(context: string): LocationRecord[] {
        const results: LocationRecord[] = [];

        for (const location of this.knowledgeDatabase.worldKnowledge.locations.values()) {
            if (location.description.toLowerCase().includes(context.toLowerCase()) ||
                location.type.toLowerCase().includes(context.toLowerCase())) {
                results.push(location);
            }
        }

        return results.sort((a, b) => b.significance - a.significance);
    }

    /**
     * 関連イベント取得
     */
    private getRelevantEvents(context: string): HistoricalEventRecord[] {
        const results: HistoricalEventRecord[] = [];

        for (const event of this.knowledgeDatabase.worldKnowledge.events.values()) {
            if (event.description.toLowerCase().includes(context.toLowerCase())) {
                results.push(event);
            }
        }

        return results.sort((a, b) => b.impact - a.impact);
    }

    /**
     * 関連文化取得
     */
    private getRelevantCultures(context: string): CultureRecord[] {
        const results: CultureRecord[] = [];

        for (const culture of this.knowledgeDatabase.worldKnowledge.cultures.values()) {
            if (culture.description.toLowerCase().includes(context.toLowerCase()) ||
                culture.values.some(value => value.toLowerCase().includes(context.toLowerCase()))) {
                results.push(culture);
            }
        }

        return results;
    }

    // ============================================================================
    // 伏線管理システム
    // ============================================================================

    /**
     * 伏線を追加
     */
    async addForeshadowing(foreshadowing: Partial<Foreshadowing>): Promise<Foreshadowing> {
        if (!this.initialized) {
            await this.initialize();
        }

        const newForeshadowing: Foreshadowing = {
            id: foreshadowing.id || `fs-${Date.now()}`,
            description: foreshadowing.description || '',
            chapter_introduced: foreshadowing.chapter_introduced || 1,
            resolved: false,
            urgency: foreshadowing.urgency || 'medium',
            createdTimestamp: new Date().toISOString(),
            updatedTimestamp: new Date().toISOString(),
            significance: foreshadowing.significance || 5,
            relatedCharacters: foreshadowing.relatedCharacters || []
        };

        this.knowledgeDatabase.foreshadowingDatabase.activeForeshadowing.set(
            newForeshadowing.id,
            newForeshadowing
        );

        await this.saveForeshadowingDatabase();

        logger.info(`Added foreshadowing: ${newForeshadowing.description}`);
        return newForeshadowing;
    }

    /**
     * 伏線を解決
     */
    async resolveForeshadowing(
        id: string,
        resolutionChapter: number,
        resolutionDescription: string
    ): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        const foreshadowing = this.knowledgeDatabase.foreshadowingDatabase.activeForeshadowing.get(id);
        if (!foreshadowing) {
            throw new Error(`Foreshadowing with ID ${id} not found`);
        }

        const resolvedForeshadowing: Foreshadowing = {
            ...foreshadowing,
            resolved: true,
            resolution_chapter: resolutionChapter,
            resolution_description: resolutionDescription,
            updatedTimestamp: new Date().toISOString()
        };

        // アクティブから削除し、解決済みに移動
        this.knowledgeDatabase.foreshadowingDatabase.activeForeshadowing.delete(id);
        this.knowledgeDatabase.foreshadowingDatabase.resolvedForeshadowing.set(id, resolvedForeshadowing);

        await this.saveForeshadowingDatabase();

        logger.info(`Resolved foreshadowing: ${foreshadowing.description}`);
    }

    /**
     * 未解決伏線取得
     */
    getUnresolvedForeshadowing(): Foreshadowing[] {
        return Array.from(this.knowledgeDatabase.foreshadowingDatabase.activeForeshadowing.values());
    }

    /**
     * 解決済み伏線取得
     */
    getResolvedForeshadowing(): Foreshadowing[] {
        return Array.from(this.knowledgeDatabase.foreshadowingDatabase.resolvedForeshadowing.values());
    }

    // ============================================================================
    // 概念管理システム
    // ============================================================================

    /**
     * 概念を追加
     */
    async addConcept(concept: Partial<ConceptDefinitionRecord>): Promise<ConceptDefinitionRecord> {
        if (!this.initialized) {
            await this.initialize();
        }

        const newConcept: ConceptDefinitionRecord = {
            conceptId: concept.conceptId || `concept-${Date.now()}`,
            name: concept.name || '',
            definition: concept.definition || '',
            synonyms: concept.synonyms || [],
            relatedConcepts: concept.relatedConcepts || [],
            importance: concept.importance || 5,
            firstIntroduced: concept.firstIntroduced || 1,
            usageFrequency: concept.usageFrequency || 0
        };

        this.knowledgeDatabase.conceptDefinitions.set(newConcept.conceptId, newConcept);
        await this.saveConceptDefinitions();

        logger.info(`Added concept: ${newConcept.name}`);
        return newConcept;
    }

    /**
     * 概念を更新
     */
    async updateConcept(conceptId: string, updates: Partial<ConceptDefinitionRecord>): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        const existing = this.knowledgeDatabase.conceptDefinitions.get(conceptId);
        if (!existing) {
            throw new Error(`Concept with ID ${conceptId} not found`);
        }

        const updated = { ...existing, ...updates };
        this.knowledgeDatabase.conceptDefinitions.set(conceptId, updated);
        await this.saveConceptDefinitions();

        logger.info(`Updated concept: ${updated.name}`);
    }

    /**
     * 概念使用頻度を増加
     */
    async incrementConceptUsage(conceptId: string): Promise<void> {
        const concept = this.knowledgeDatabase.conceptDefinitions.get(conceptId);
        if (concept) {
            concept.usageFrequency++;
            await this.saveConceptDefinitions();
        }
    }

    // ============================================================================
    // ストレージ管理
    // ============================================================================

    /**
     * 統合設定の読み込み
     */
    private async loadConsolidatedSettings(): Promise<void> {
        try {
            const settingsPath = 'long-term-memory/settings/consolidated-settings.json';
            if (await storageProvider.fileExists(settingsPath)) {
                const content = await storageProvider.readFile(settingsPath);
                const data = JSON.parse(content);

                if (data.worldSettingsMaster) {
                    this.consolidatedSettings.worldSettingsMaster = data.worldSettingsMaster;
                }
                if (data.genreSettingsMaster) {
                    this.consolidatedSettings.genreSettingsMaster = data.genreSettingsMaster;
                }
            }
        } catch (error) {
            logger.warn('Failed to load consolidated settings', { error });
        }
    }

    /**
     * 知識データベースの読み込み
     */
    private async loadKnowledgeDatabase(): Promise<void> {
        try {
            // 概念定義の読み込み
            const conceptsPath = 'long-term-memory/knowledge/concepts/concepts.json';
            if (await storageProvider.fileExists(conceptsPath)) {
                const content = await storageProvider.readFile(conceptsPath);
                const concepts = JSON.parse(content);

                if (Array.isArray(concepts)) {
                    concepts.forEach(concept => {
                        this.knowledgeDatabase.conceptDefinitions.set(concept.conceptId, concept);
                    });
                }
            }

            // 伏線データベースの読み込み
            await this.loadForeshadowingDatabase();

        } catch (error) {
            logger.warn('Failed to load knowledge database', { error });
        }
    }

    /**
     * 伏線データベースの読み込み
     */
    private async loadForeshadowingDatabase(): Promise<void> {
        try {
            const foreshadowingPath = 'long-term-memory/knowledge/foreshadowing/foreshadowing.json';
            if (await storageProvider.fileExists(foreshadowingPath)) {
                const content = await storageProvider.readFile(foreshadowingPath);
                const data = JSON.parse(content);

                if (data.activeForeshadowing && Array.isArray(data.activeForeshadowing)) {
                    data.activeForeshadowing.forEach((fs: Foreshadowing) => {
                        this.knowledgeDatabase.foreshadowingDatabase.activeForeshadowing.set(fs.id, fs);
                    });
                }

                if (data.resolvedForeshadowing && Array.isArray(data.resolvedForeshadowing)) {
                    data.resolvedForeshadowing.forEach((fs: Foreshadowing) => {
                        this.knowledgeDatabase.foreshadowingDatabase.resolvedForeshadowing.set(fs.id, fs);
                    });
                }
            }
        } catch (error) {
            logger.warn('Failed to load foreshadowing database', { error });
        }
    }

    /**
     * 統合設定の保存
     */
    async saveConsolidatedSettings(): Promise<void> {
        try {
            const settingsPath = 'long-term-memory/settings/consolidated-settings.json';
            const data = {
                worldSettingsMaster: this.consolidatedSettings.worldSettingsMaster,
                genreSettingsMaster: this.consolidatedSettings.genreSettingsMaster,
                lastSaved: new Date().toISOString()
            };

            await storageProvider.writeFile(settingsPath, JSON.stringify(data, null, 2));
            logger.debug('Consolidated settings saved');
        } catch (error) {
            logger.error('Failed to save consolidated settings', { error });
        }
    }

    /**
     * 概念定義の保存
     */
    private async saveConceptDefinitions(): Promise<void> {
        try {
            const conceptsPath = 'long-term-memory/knowledge/concepts/concepts.json';
            const concepts = Array.from(this.knowledgeDatabase.conceptDefinitions.values());

            await storageProvider.writeFile(conceptsPath, JSON.stringify(concepts, null, 2));
            logger.debug('Concept definitions saved');
        } catch (error) {
            logger.error('Failed to save concept definitions', { error });
        }
    }

    /**
     * 伏線データベースの保存
     */
    private async saveForeshadowingDatabase(): Promise<void> {
        try {
            const foreshadowingPath = 'long-term-memory/knowledge/foreshadowing/foreshadowing.json';
            const data = {
                activeForeshadowing: Array.from(this.knowledgeDatabase.foreshadowingDatabase.activeForeshadowing.values()),
                resolvedForeshadowing: Array.from(this.knowledgeDatabase.foreshadowingDatabase.resolvedForeshadowing.values()),
                patterns: this.knowledgeDatabase.foreshadowingDatabase.patterns,
                effectiveness: this.knowledgeDatabase.foreshadowingDatabase.effectiveness,
                lastUpdated: new Date().toISOString()
            };

            await storageProvider.writeFile(foreshadowingPath, JSON.stringify(data, null, 2));
            logger.debug('Foreshadowing database saved');
        } catch (error) {
            logger.error('Failed to save foreshadowing database', { error });
        }
    }

    /**
     * 全データの保存
     */
    async save(): Promise<void> {
        await Promise.all([
            this.saveConsolidatedSettings(),
            this.saveConceptDefinitions(),
            this.saveForeshadowingDatabase()
        ]);
    }

    // ============================================================================
    // デフォルト値作成
    // ============================================================================

    /**
     * デフォルト世界設定作成
     */
    private createDefaultWorldSettings(): WorldSettingsMasterRecord {
        return {
            description: '基本的な物語世界',
            regions: [],
            history: [],
            rules: [],
            genre: 'classic',
            version: '1.0.0',
            lastUpdated: new Date().toISOString(),
            consolidatedFrom: [],
            consolidationTimestamp: new Date().toISOString(),
            conflicts: []
        };
    }

    /**
     * デフォルトジャンル設定作成
     */
    private createDefaultGenreSettings(): GenreSettingsMasterRecord {
        return {
            genre: 'classic',
            characteristics: ['伝統的', '普遍的'],
            typicalElements: ['キャラクター成長', '物語展開'],
            recommendedTones: ['中立的', 'バランス重視'],
            emotionalDimensions: ['希望と絶望', '安心と緊張'],
            structuralPatterns: ['起承転結', '三幕構成'],
            sources: [],
            lastConsolidated: new Date().toISOString(),
            priority: 5
        };
    }

    /**
     * デフォルト世界知識データベース作成
     */
    private createDefaultWorldKnowledgeDatabase(): WorldKnowledgeDatabase {
        return {
            locations: new Map(),
            events: new Map(),
            cultures: new Map(),
            technologies: new Map(),
            magicSystems: new Map(),
            politicalSystems: new Map(),
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * デフォルト伏線データベース作成
     */
    private createDefaultForeshadowingDatabase(): ForeshadowingDatabase {
        return {
            activeForeshadowing: new Map(),
            resolvedForeshadowing: new Map(),
            patterns: [],
            effectiveness: [],
            nextId: 1
        };
    }

    // ============================================================================
    // 状態管理・診断
    // ============================================================================

    /**
     * システム状態取得
     */
    async getStatus(): Promise<{
        initialized: boolean;
        lastConsolidationTime: string;
        consolidatedSources: number;
        conceptCount: number;
        activeForeshadowingCount: number;
        resolvedForeshadowingCount: number;
    }> {
        return {
            initialized: this.initialized,
            lastConsolidationTime: this.lastConsolidationTime,
            consolidatedSources: this.consolidatedSettings.worldSettingsMaster.consolidatedFrom.length,
            conceptCount: this.knowledgeDatabase.conceptDefinitions.size,
            activeForeshadowingCount: this.knowledgeDatabase.foreshadowingDatabase.activeForeshadowing.size,
            resolvedForeshadowingCount: this.knowledgeDatabase.foreshadowingDatabase.resolvedForeshadowing.size
        };
    }

    /**
     * 統合診断
     */
    async diagnoseConsolidation(): Promise<{
        worldSettingsConflicts: number;
        lastConsolidation: string;
        sourceCoverage: string[];
        recommendations: string[];
    }> {
        const recommendations: string[] = [];

        if (this.consolidatedSettings.worldSettingsMaster.conflicts.length > 0) {
            recommendations.push('世界設定に競合が検出されています。手動確認を推奨します');
        }

        const daysSinceConsolidation = Math.floor(
            (Date.now() - new Date(this.lastConsolidationTime).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceConsolidation > 7) {
            recommendations.push('統合処理から7日以上経過しています。再統合を検討してください');
        }

        return {
            worldSettingsConflicts: this.consolidatedSettings.worldSettingsMaster.conflicts.length,
            lastConsolidation: this.lastConsolidationTime,
            sourceCoverage: this.consolidatedSettings.worldSettingsMaster.consolidatedFrom,
            recommendations
        };
    }

    /**
     * 手動再統合実行
     */
    async forceReconsolidation(): Promise<void> {
        logger.info('Starting forced reconsolidation');

        // 統合データをリセット
        this.consolidatedSettings = {
            worldSettingsMaster: this.createDefaultWorldSettings(),
            genreSettingsMaster: this.createDefaultGenreSettings(),
            templateMaster: new Map(),
            systemConfigMaster: new Map()
        };

        // 再統合実行
        await this.performInitialConsolidation();
        await this.save();

        logger.info('Forced reconsolidation completed');
    }
}