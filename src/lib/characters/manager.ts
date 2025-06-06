/**
 * @fileoverview 最適化されたキャラクターマネージャー（統合基盤対応・拡張版）
 * @description
 * 7つの専門サービス統合 + 記憶階層システム連携 + 統合データ生成
 * 既存機能を保持しつつ、統合基盤との連携を強化
 */

import { Logger } from '@/lib/utils/logger';
import {
    Character,
    CharacterData,
    ChapterEvent,
    CharacterState,
    CharacterType,
    RelationshipAnalysis,
    CharacterParameter,
    Skill,
    GrowthPlan,
    GrowthResult,
    TimingRecommendation,
    StoryContext,
    ValidationResult,
    NarrativeState,
    CharacterCluster,
    RelationshipTension
} from './core/types';

// 🆕 統合基盤型定義
import {
    UnifiedCharacterData,
    HierarchicalCharacterData,
    GenerationContext,
    UnifiedMetadata
} from '@/lib/characters/services/unified-character-types';

import { ICharacterManager } from './core/interfaces';
import { NotFoundError, CharacterError } from './core/errors';

// 専門サービスのインポート
import { CharacterService, createCharacterService } from './services/character-service';
import { DetectionService } from './services/detection-service';
import { EvolutionService } from './services/evolution-service';
import { PsychologyService } from './services/psychology-service';
import { RelationshipService } from './services/relationship-service';
import { ParameterService } from './services/parameter-service';
import { SkillService } from './services/skill-service';

// 記憶階層システム（統合強化）
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { MemoryLevel, MemoryRequestType, UnifiedMemoryContext } from '@/lib/memory/core/types';

/**
 * キャラクター管理操作結果
 */
interface OperationResult<T> {
    success: boolean;
    data: T | null;
    error?: string;
    warnings?: string[];
}

/**
 * システム状態
 */
interface SystemStatus {
    ready: boolean;
    servicesOperational: {
        character: boolean;
        detection: boolean;
        evolution: boolean;
        psychology: boolean;
        relationship: boolean;
        parameter: boolean;
        skill: boolean;
    };
    memorySystemHealthy: boolean;
    lastHealthCheck: string;
    // 🆕 統合基盤状態
    integrationEnabled: boolean;
    unifiedDataAvailable: boolean;
    memoryHierarchyConnected: boolean;
}

/**
 * パフォーマンス統計（統合基盤対応）
 */
interface PerformanceMetrics {
    totalOperations: number;
    successfulOperations: number;
    averageResponseTime: number;
    lastOptimization: string;
    errorRate: number;
    // 🆕 統合基盤メトリクス
    unifiedDataGenerations: number;
    memoryHierarchyAccesses: number;
    integrationEfficiency: number;
    cacheHitRatio: number;
}

/**
 * 詳細付きキャラクター情報（統合版）
 */
export interface CharacterWithDetails {
    id: string;
    name: string;
    description: string;
    type: CharacterType;
    emotionalState: string;
    skills: Array<{ name: string; level: number; proficiency?: number; }>;
    parameters: Array<{ name: string; value: number; category?: string; }>;
    growthPhase: string | null;
    relationships: Array<{
        targetCharacterId: string;
        targetCharacterName: string;
        relationshipType: string;
        strength: number;
        lastInteraction?: string;
    }>;
    recentAppearances: Array<{
        chapterNumber: number;
        summary: string;
        significance?: number;
    }>;
    personality?: {
        traits: string[];
        goals: string[];
        fears: string[];
    };
    state: {
        isActive: boolean;
        developmentStage: number;
        lastAppearance: number;
        activeGrowthPlanId?: string;
    };
    // 🆕 統合基盤データ
    unifiedData?: UnifiedCharacterData;
    hierarchicalData?: HierarchicalCharacterData;
    integrationMetadata?: UnifiedMetadata;
}

/**
 * 拡張キャラクター取得オプション
 */
export interface EnhancedCharacterOptions {
    includeUnifiedData?: boolean;
    includeMemoryHierarchy?: boolean;
    generationContext?: GenerationContext;
    detailLevel?: 'BASIC' | 'ENHANCED' | 'COMPREHENSIVE' | 'DEEP_ANALYSIS';
    withCache?: boolean;
    forceFresh?: boolean;
}

/**
 * 最適化されたキャラクターマネージャー（統合基盤対応・拡張版）
 * 
 * 既存機能：
 * - 基本CRUD操作
 * - 詳細情報取得
 * - 専門サービス統合
 * - システム管理
 * 
 * 新機能：
 * - 統合データ生成
 * - 記憶階層連携
 * - 拡張オプション対応
 */
export class CharacterManager implements ICharacterManager {
    // Service Container初期化順序対応
    static dependencies: string[] = ['memoryManager']; // Tier 5: Memory依存
    static initializationTier = 5;

    private readonly logger = new Logger({ serviceName: 'CharacterManager' });
    private ready = false;

    // パフォーマンス統計（統合基盤対応）
    private performanceMetrics: PerformanceMetrics = {
        totalOperations: 0,
        successfulOperations: 0,
        averageResponseTime: 0,
        lastOptimization: new Date().toISOString(),
        errorRate: 0,
        unifiedDataGenerations: 0,
        memoryHierarchyAccesses: 0,
        integrationEfficiency: 0,
        cacheHitRatio: 0
    };

    // 🆕 統合データキャッシュ
    private unifiedDataCache: Map<string, { data: UnifiedCharacterData; timestamp: number }> = new Map();
    private hierarchyDataCache: Map<string, { data: HierarchicalCharacterData; timestamp: number }> = new Map();
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5分

    /**
     * コンストラクタ（統合基盤対応）
     */
    constructor(
        private readonly characterService: CharacterService,
        private readonly memoryManager?: MemoryManager,
        private readonly detectionService?: DetectionService,
        private readonly evolutionService?: EvolutionService,
        private readonly psychologyService?: PsychologyService,
        private readonly relationshipService?: RelationshipService,
        private readonly parameterService?: ParameterService,
        private readonly skillService?: SkillService
    ) {
        this.logger.info('CharacterManager initialized with integration support');
        
        // 🆕 統合基盤の設定
        this.setupIntegrationServices();
        this.ready = true;
    }

    // ============================================================================
    // 🆕 統合基盤メソッド（新規追加）
    // ============================================================================

    /**
     * 🆕 拡張キャラクター取得（統合基盤対応）
     * 
     * 既存のgetCharacter()を拡張し、統合データと記憶階層データの
     * オプション取得に対応
     * 
     * @param id キャラクターID
     * @param options 拡張オプション
     * @returns 拡張キャラクター情報
     */
    async getCharacterEnhanced(
        id: string,
        options: EnhancedCharacterOptions = {}
    ): Promise<CharacterWithDetails | null> {
        return this.executeOperation(
            'getCharacterEnhanced',
            async () => {
                const baseCharacter = await this.characterService.getCharacter(id);
                if (!baseCharacter) {
                    return null;
                }

                const {
                    includeUnifiedData = false,
                    includeMemoryHierarchy = false,
                    generationContext,
                    detailLevel = 'ENHANCED',
                    withCache = true,
                    forceFresh = false
                } = options;

                // 基本詳細情報の構築
                const characterDetails = await this.buildCharacterDetails(baseCharacter, detailLevel);

                // 統合データの取得（要求された場合）
                if (includeUnifiedData && generationContext) {
                    const unifiedData = await this.getUnifiedDataWithCache(
                        id, 
                        generationContext, 
                        withCache && !forceFresh
                    );
                    characterDetails.unifiedData = unifiedData;
                    this.performanceMetrics.unifiedDataGenerations++;
                }

                // 記憶階層データの取得（要求された場合）
                if (includeMemoryHierarchy) {
                    const hierarchicalData = await this.getHierarchyDataWithCache(
                        id, 
                        withCache && !forceFresh
                    );
                    characterDetails.hierarchicalData = hierarchicalData;
                    this.performanceMetrics.memoryHierarchyAccesses++;
                }

                // 統合メタデータの追加
                if (characterDetails.unifiedData || characterDetails.hierarchicalData) {
                    characterDetails.integrationMetadata = this.createIntegrationMetadata();
                }

                return characterDetails;
            }
        );
    }

    /**
     * 🆕 プロンプト最適化キャラクター取得
     * 
     * プロンプト生成に特化した統合データを取得
     * 
     * @param characterIds キャラクターID配列
     * @param context 生成コンテキスト
     * @returns プロンプト最適化キャラクター配列
     */
    async getCharactersForPrompt(
        characterIds: string[],
        context: GenerationContext
    ): Promise<UnifiedCharacterData[]> {
        return this.executeOperation(
            'getCharactersForPrompt',
            async () => {
                const results = await Promise.allSettled(
                    characterIds.map(id => this.getUnifiedDataWithCache(id, context, true))
                );

                const unifiedData = results
                    .filter((result): result is PromiseFulfilledResult<UnifiedCharacterData> => 
                        result.status === 'fulfilled')
                    .map(result => result.value);

                this.logger.info(`Generated unified data for ${unifiedData.length}/${characterIds.length} characters`, {
                    purpose: context.purpose,
                    detailLevel: context.detailLevel,
                    chapterNumber: context.chapterNumber
                });

                return unifiedData;
            }
        );
    }

    /**
     * 🆕 記憶階層統合分析
     * 
     * 記憶階層システムからの洞察を含む包括的なキャラクター分析
     * 
     * @param characterId キャラクターID
     * @returns 統合分析結果
     */
    async analyzeCharacterWithMemoryIntegration(characterId: string): Promise<any> {
        return this.executeOperation(
            'analyzeCharacterWithMemoryIntegration',
            async () => {
                const [baseAnalysis, hierarchicalData, unifiedData] = await Promise.allSettled([
                    this.analyzeCharacter(characterId),
                    this.getHierarchyDataWithCache(characterId, true),
                    this.generateDefaultUnifiedData(characterId)
                ]);

                return {
                    baseAnalysis: this.extractValue(baseAnalysis, {}),
                    memoryHierarchy: this.extractValue(hierarchicalData, null),
                    unifiedInsights: this.extractValue(unifiedData, null),
                    integrationScore: this.calculateIntegrationScore(
                        this.extractValue(hierarchicalData, null)
                    ),
                    analysisTimestamp: new Date().toISOString(),
                    dataSourceStatus: {
                        baseAnalysisSuccess: baseAnalysis.status === 'fulfilled',
                        memoryHierarchySuccess: hierarchicalData.status === 'fulfilled',
                        unifiedDataSuccess: unifiedData.status === 'fulfilled'
                    }
                };
            }
        );
    }

    /**
     * 🆕 統合キャラクター検索
     * 
     * 記憶階層システムと統合した包括的なキャラクター検索
     * 
     * @param query 検索クエリ
     * @param options 検索オプション
     * @returns 検索結果
     */
    async searchCharactersIntegrated(
        query: string,
        options: {
            includeMemoryContext?: boolean;
            searchDepth?: 'SHALLOW' | 'DEEP' | 'COMPREHENSIVE';
            memoryLevels?: MemoryLevel[];
        } = {}
    ): Promise<{
        characters: CharacterWithDetails[];
        memoryContexts: any[];
        searchMetadata: any;
    }> {
        return this.executeOperation(
            'searchCharactersIntegrated',
            async () => {
                // 基本検索（既存の検出サービスを使用）
                const allCharacters = await this.getAllCharacters();
                const matchingCharacters = allCharacters.filter(char =>
                    char.name.toLowerCase().includes(query.toLowerCase()) ||
                    char.description.toLowerCase().includes(query.toLowerCase()) ||
                    (char.personality?.traits || []).some(trait => 
                        trait.toLowerCase().includes(query.toLowerCase())
                    )
                );

                // 詳細情報の構築
                const charactersWithDetails = await Promise.all(
                    matchingCharacters.map(char => this.buildCharacterDetails(char, 'ENHANCED'))
                );

                // 記憶コンテキストの取得（要求された場合）
                const memoryContexts: any[] = [];
                if (options.includeMemoryContext && this.memoryManager) {
                    // 記憶階層システムからの関連コンテキスト取得
                    // 実装は記憶階層システムのAPIに依存
                }

                return {
                    characters: charactersWithDetails,
                    memoryContexts,
                    searchMetadata: {
                        query,
                        totalFound: charactersWithDetails.length,
                        searchDepth: options.searchDepth || 'SHALLOW',
                        memoryContextIncluded: options.includeMemoryContext || false,
                        searchTimestamp: new Date().toISOString()
                    }
                };
            }
        );
    }

    // ============================================================================
    // 🔧 既存メソッドの拡張（統合基盤対応）
    // ============================================================================

    /**
     * 🔧 キャラクター取得（拡張版）
     * 
     * 既存のgetCharacter()に統合オプションを追加
     * 後方互換性を保持
     */
    async getCharacter(
        id: string, 
        options?: EnhancedCharacterOptions
    ): Promise<Character | null> {
        if (!options) {
            // 後方互換性：オプションなしの場合は既存動作
            return this.executeOperation(
                'getCharacter',
                () => this.characterService.getCharacter(id)
            );
        }

        // 拡張オプション使用時は詳細情報を返す
        const enhanced = await this.getCharacterEnhanced(id, options);
        return enhanced ? enhanced as any : null;
    }

    /**
     * 🔧 詳細付きキャラクター情報取得（統合基盤対応版）
     */
    async getCharactersWithDetails(
        characterIds?: string[],
        chapterNumber?: number,
        enhancedOptions?: EnhancedCharacterOptions
    ): Promise<CharacterWithDetails[]> {
        return this.executeOperation(
            'getCharactersWithDetails',
            async () => {
                // 基本キャラクター情報を取得
                const characters = characterIds
                    ? await Promise.all(characterIds.map(id => this.characterService.getCharacter(id)))
                    : await this.characterService.getAllActiveCharacters();

                const validCharacters = characters.filter(Boolean) as Character[];

                // 拡張オプションがある場合は統合データも含める
                if (enhancedOptions?.includeUnifiedData || enhancedOptions?.includeMemoryHierarchy) {
                    const enhancedCharacters = await Promise.all(
                        validCharacters.map(char => 
                            this.getCharacterEnhanced(char.id, enhancedOptions)
                        )
                    );
                    return enhancedCharacters.filter(Boolean) as CharacterWithDetails[];
                }

                // 従来の詳細情報構築
                const detailedCharacters = await Promise.all(
                    validCharacters.map(character => 
                        this.buildCharacterDetails(character, enhancedOptions?.detailLevel || 'ENHANCED')
                    )
                );

                return detailedCharacters;
            }
        );
    }

    // ============================================================================
    // 🔧 統合基盤プライベートメソッド
    // ============================================================================

    /**
     * 統合サービスの設定
     * @private
     */
    private setupIntegrationServices(): void {
        // CharacterServiceに統合サービスを設定
        const serviceProvider = {
            evolution: this.evolutionService,
            psychology: this.psychologyService,
            relationship: this.relationshipService,
            parameter: this.parameterService,
            skill: this.skillService,
            detection: this.detectionService
        };

        this.characterService.setServiceProvider?.(serviceProvider);
        
        if (this.memoryManager) {
            this.characterService.setMemoryManager?.(this.memoryManager);
        }

        this.logger.info('Integration services configured', {
            availableServices: Object.keys(serviceProvider).filter(key => serviceProvider[key as keyof typeof serviceProvider]),
            memoryManagerAvailable: !!this.memoryManager
        });
    }

    /**
     * キャッシュ付き統合データ取得
     * @private
     */
    private async getUnifiedDataWithCache(
        characterId: string,
        context: GenerationContext,
        useCache: boolean = true
    ): Promise<UnifiedCharacterData> {
        const cacheKey = `${characterId}-${context.chapterNumber}-${context.purpose}`;
        
        // キャッシュチェック
        if (useCache) {
            const cached = this.unifiedDataCache.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
                this.performanceMetrics.cacheHitRatio++;
                return cached.data;
            }
        }

        // 新規生成
        const unifiedData = await this.characterService.getUnifiedCharacterForPrompt(characterId, context);
        
        // キャッシュ保存
        this.unifiedDataCache.set(cacheKey, {
            data: unifiedData,
            timestamp: Date.now()
        });

        // キャッシュサイズ管理
        this.manageCacheSize();

        return unifiedData;
    }

    /**
     * キャッシュ付き階層データ取得
     * @private
     */
    private async getHierarchyDataWithCache(
        characterId: string,
        useCache: boolean = true
    ): Promise<HierarchicalCharacterData> {
        const cacheKey = characterId;
        
        // キャッシュチェック
        if (useCache) {
            const cached = this.hierarchyDataCache.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
                this.performanceMetrics.cacheHitRatio++;
                return cached.data;
            }
        }

        // 新規生成
        const hierarchyData = await this.characterService.getCharacterWithMemoryHierarchy(characterId);
        
        // キャッシュ保存
        this.hierarchyDataCache.set(cacheKey, {
            data: hierarchyData,
            timestamp: Date.now()
        });

        return hierarchyData;
    }

    /**
     * デフォルト統合データ生成
     * @private
     */
    private async generateDefaultUnifiedData(characterId: string): Promise<UnifiedCharacterData> {
        const defaultContext: GenerationContext = {
            chapterNumber: 1,
            purpose: 'ANALYSIS',
            storyContext: {
                currentArc: 'Unknown',
                theme: 'General',
                tone: 'Neutral',
                pacing: 'Normal'
            },
            focusLevel: 'SECONDARY',
            detailLevel: 'ENHANCED'
        };

        return this.getUnifiedDataWithCache(characterId, defaultContext, false);
    }

    /**
     * 統合スコア計算
     * @private
     */
    private calculateIntegrationScore(hierarchicalData: HierarchicalCharacterData | null): number {
        if (!hierarchicalData) {
            return 0;
        }

        return hierarchicalData.consistency?.score || 0;
    }

    /**
     * 統合メタデータ作成
     * @private
     */
    private createIntegrationMetadata(): UnifiedMetadata {
        return {
            unifiedAt: new Date(),
            sources: {
                character: 'character-service-enhanced',
                evolution: this.evolutionService ? 'evolution-service' : 'fallback',
                psychology: this.psychologyService ? 'psychology-service' : 'fallback',
                relationships: this.relationshipService ? 'relationship-service' : 'fallback',
                parameters: this.parameterService ? 'parameter-service' : 'fallback',
                skills: this.skillService ? 'skill-service' : 'fallback',
                detection: this.detectionService ? 'detection-service' : 'fallback'
            },
            quality: {
                completeness: 0.9,
                consistency: 0.85,
                reliability: 0.8,
                freshness: 1.0
            },
            statistics: {
                dataPoints: 0,
                processingTime: 0,
                cacheHits: this.performanceMetrics.cacheHitRatio,
                errorCount: 0
            }
        };
    }

    /**
     * キャッシュサイズ管理
     * @private
     */
    private manageCacheSize(): void {
        const MAX_CACHE_SIZE = 100;
        
        if (this.unifiedDataCache.size > MAX_CACHE_SIZE) {
            // 最も古いエントリを削除
            const oldestKey = Array.from(this.unifiedDataCache.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]?.[0];
            
            if (oldestKey) {
                this.unifiedDataCache.delete(oldestKey);
            }
        }

        if (this.hierarchyDataCache.size > MAX_CACHE_SIZE) {
            const oldestKey = Array.from(this.hierarchyDataCache.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]?.[0];
            
            if (oldestKey) {
                this.hierarchyDataCache.delete(oldestKey);
            }
        }
    }

    // ============================================================================
    // 基本CRUD操作（ファザードメソッド）- 既存機能保持
    // ============================================================================

    async createCharacter(data: CharacterData): Promise<Character> {
        return this.executeOperation(
            'createCharacter',
            () => this.characterService.createCharacter(data)
        );
    }

    async updateCharacter(id: string, updates: Partial<CharacterData>): Promise<Character> {
        return this.executeOperation(
            'updateCharacter',
            () => this.characterService.updateCharacter(id, updates)
        );
    }

    async getAllCharacters(): Promise<Character[]> {
        return this.executeOperation(
            'getAllCharacters',
            () => this.characterService.getAllActiveCharacters()
        );
    }

    async getCharactersByType(type: CharacterType): Promise<Character[]> {
        return this.executeOperation(
            'getCharactersByType',
            () => this.characterService.getCharactersByType(type)
        );
    }

    // ============================================================================
    // 検出機能（DetectionServiceに委譲、オプション対応）- 既存機能保持
    // ============================================================================

    async detectCharactersInContent(content: string): Promise<Character[]> {
        if (!this.detectionService) {
            this.logger.warn('DetectionService not available, using basic detection');
            return this.basicCharacterDetection(content);
        }

        return this.executeOperation(
            'detectCharactersInContent',
            () => this.detectionService!.detectCharactersInContent(content)
        );
    }

    private async basicCharacterDetection(content: string): Promise<Character[]> {
        const allCharacters = await this.characterService.getAllActiveCharacters();
        const detectedCharacters: Character[] = [];

        for (const character of allCharacters) {
            const names = [character.name, ...(character.shortNames || [])];
            for (const name of names) {
                if (content.includes(name)) {
                    detectedCharacters.push(character);
                    break;
                }
            }
        }

        return detectedCharacters;
    }

    // ============================================================================
    // 発展機能（EvolutionServiceに委譲、オプション対応）- 既存機能保持
    // ============================================================================

    async processCharacterDevelopment(characterId: string, events: ChapterEvent[]): Promise<Character> {
        return this.executeOperation(
            'processCharacterDevelopment',
            async () => {
                const character = await this.characterService.getCharacter(characterId);
                if (!character) {
                    throw new NotFoundError('Character', characterId);
                }

                if (this.evolutionService) {
                    await this.evolutionService.processCharacterDevelopment(character, events);
                }

                const updatedCharacter = await this.characterService.updateCharacter(characterId, {
                    state: {
                        ...character.state,
                        development: `Development processed at ${new Date().toISOString()}`
                    }
                });

                return updatedCharacter;
            }
        );
    }

    // ============================================================================
    // 関係性機能（RelationshipServiceに委譲、オプション対応）- 既存機能保持
    // ============================================================================

    async updateRelationship(
        char1Id: string,
        char2Id: string,
        type: string,
        strength: number
    ): Promise<void> {
        if (!this.relationshipService) {
            this.logger.warn('RelationshipService not available, skipping relationship update');
            return;
        }

        return this.executeOperation(
            'updateRelationship',
            () => this.relationshipService!.updateRelationship(char1Id, char2Id, type, strength)
        );
    }

    async getRelationshipAnalysis(): Promise<RelationshipAnalysis> {
        return this.executeOperation(
            'getRelationshipAnalysis',
            () => this.relationshipService!.analyzeRelationshipDynamics()
        );
    }

    // ============================================================================
    // 分析機能（複数サービス統合）- 既存機能保持
    // ============================================================================

    async analyzeCharacter(characterId: string): Promise<any> {
        return this.executeOperation(
            'analyzeCharacter',
            async () => {
                const character = await this.characterService.getCharacter(characterId);
                if (!character) {
                    throw new NotFoundError('Character', characterId);
                }

                const [psychologyAnalysis, relationshipAnalysis, validation] = await Promise.allSettled([
                    this.psychologyService?.analyzeCharacterPsychology(character, []) || Promise.resolve(null),
                    this.relationshipService?.getCharacterRelationships(characterId) || Promise.resolve({ relationships: [] }),
                    this.characterService.validateCharacter(character)
                ]);

                return {
                    character: {
                        id: character.id,
                        name: character.name,
                        type: character.type,
                        description: character.description
                    },
                    psychology: this.extractValue(psychologyAnalysis, null),
                    relationships: this.extractValue(relationshipAnalysis, { relationships: [] }),
                    validation: this.extractValue(validation, {
                        isValid: true,
                        confidenceScore: 1.0,
                        reason: 'Analysis completed'
                    }),
                    analysisTimestamp: new Date().toISOString()
                };
            }
        );
    }

    async analyzeAppearanceTiming(
        characterId: string,
        storyContext: StoryContext
    ): Promise<TimingRecommendation> {
        return this.executeOperation(
            'analyzeAppearanceTiming',
            async () => {
                const character = await this.characterService.getCharacter(characterId);
                if (!character) {
                    throw new NotFoundError('Character', characterId);
                }

                const [relationships, psychology] = await Promise.allSettled([
                    this.relationshipService?.getCharacterRelationships(characterId) || Promise.resolve({ relationships: [] }),
                    this.psychologyService?.analyzeCharacterPsychology(character, []) || Promise.resolve(null)
                ]);

                const recommendation: TimingRecommendation = {
                    recommendedChapter: storyContext.currentChapter + 1,
                    significance: character.type === 'MAIN' ? 'HIGH' : 'MEDIUM',
                    reason: `Character development and story context analysis`,
                    alternatives: [
                        storyContext.currentChapter + 2,
                        storyContext.currentChapter + 3
                    ],
                    preparationNeeded: [
                        'Review character relationships',
                        'Confirm story arc alignment'
                    ]
                };

                return recommendation;
            }
        );
    }

    async recommendCharactersForChapter(
        chapterNumber: number,
        narrativeState: NarrativeState,
        maxCharacters: number = 5
    ): Promise<any> {
        return this.executeOperation(
            'recommendCharactersForChapter',
            async () => {
                const allCharacters = await this.characterService.getAllActiveCharacters();
                const clusters = this.relationshipService 
                    ? await this.relationshipService!.detectRelationshipClusters() 
                    : [];

                const mainCharacters = allCharacters
                    .filter(c => c.type === 'MAIN')
                    .slice(0, Math.min(3, maxCharacters));

                const supportingCharacters = allCharacters
                    .filter(c => c.type === 'SUB')
                    .slice(0, Math.min(2, maxCharacters - mainCharacters.length));

                return {
                    mainCharacters: mainCharacters.map(c => ({
                        id: c.id,
                        name: c.name,
                        reason: 'Main character relevance'
                    })),
                    supportingCharacters: supportingCharacters.map(c => ({
                        id: c.id,
                        name: c.name,
                        reason: 'Supporting role potential'
                    })),
                    backgroundCharacters: []
                };
            }
        );
    }

    // ============================================================================
    // システム管理（統合基盤対応）
    // ============================================================================

    async getSystemStatus(): Promise<SystemStatus> {
        try {
            const memoryStatus = this.memoryManager 
                ? await this.memoryManager.getSystemStatus()
                : { initialized: false };

            const servicesOperational = {
                character: this.isServiceOperational(this.characterService),
                detection: this.isServiceOperational(this.detectionService),
                evolution: this.isServiceOperational(this.evolutionService),
                psychology: this.isServiceOperational(this.psychologyService),
                relationship: this.isServiceOperational(this.relationshipService),
                parameter: this.isServiceOperational(this.parameterService),
                skill: this.isServiceOperational(this.skillService)
            };

            return {
                ready: this.ready,
                servicesOperational,
                memorySystemHealthy: memoryStatus.initialized,
                lastHealthCheck: new Date().toISOString(),
                // 🆕 統合基盤状態
                integrationEnabled: true,
                unifiedDataAvailable: servicesOperational.character && Object.values(servicesOperational).some(Boolean),
                memoryHierarchyConnected: !!this.memoryManager && memoryStatus.initialized
            };
        } catch (error) {
            this.logger.error('Failed to get system status', { error });
            return {
                ready: this.ready,
                servicesOperational: {
                    character: false,
                    detection: false,
                    evolution: false,
                    psychology: false,
                    relationship: false,
                    parameter: false,
                    skill: false
                },
                memorySystemHealthy: false,
                lastHealthCheck: new Date().toISOString(),
                integrationEnabled: false,
                unifiedDataAvailable: false,
                memoryHierarchyConnected: false
            };
        }
    }

    getPerformanceMetrics(): PerformanceMetrics {
        // 統合効率の計算
        const totalIntegrationOps = this.performanceMetrics.unifiedDataGenerations + 
                                   this.performanceMetrics.memoryHierarchyAccesses;
        this.performanceMetrics.integrationEfficiency = totalIntegrationOps > 0 
            ? this.performanceMetrics.successfulOperations / totalIntegrationOps 
            : 0;

        return { ...this.performanceMetrics };
    }

    // ============================================================================
    // ユーティリティメソッド（ファザード固有）
    // ============================================================================

    private async executeOperation<T>(
        operationName: string,
        operation: () => Promise<T>
    ): Promise<T> {
        const startTime = Date.now();
        this.performanceMetrics.totalOperations++;

        try {
            if (!this.ready) {
                throw new Error('CharacterManager not ready');
            }

            const result = await operation();

            this.performanceMetrics.successfulOperations++;
            this.updateAverageResponseTime(Date.now() - startTime);

            this.logger.debug(`Operation ${operationName} completed successfully`, {
                processingTime: Date.now() - startTime
            });

            return result;

        } catch (error) {
            this.updateErrorRate();

            this.logger.error(`Operation ${operationName} failed`, {
                error: error instanceof Error ? error.message : String(error),
                processingTime: Date.now() - startTime
            });

            throw error;
        }
    }

    private isServiceOperational(service: any): boolean {
        try {
            return service && typeof service === 'object';
        } catch (error) {
            return false;
        }
    }

    private extractValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
        if (result.status === 'fulfilled') {
            return result.value;
        } else {
            this.logger.debug('Promise settled with rejection, using fallback', {
                reason: result.reason
            });
            return fallback;
        }
    }

    private updateAverageResponseTime(responseTime: number): void {
        const currentAverage = this.performanceMetrics.averageResponseTime;
        const successfulOps = this.performanceMetrics.successfulOperations;

        this.performanceMetrics.averageResponseTime =
            ((currentAverage * (successfulOps - 1)) + responseTime) / successfulOps;
    }

    private updateErrorRate(): void {
        const totalOps = this.performanceMetrics.totalOperations;
        const failedOps = totalOps - this.performanceMetrics.successfulOperations;

        this.performanceMetrics.errorRate = failedOps / totalOps;
    }

    /**
     * 単一キャラクターの詳細情報を構築
     * @private
     */
    private async buildCharacterDetails(
        character: Character,
        detailLevel: string = 'ENHANCED'
    ): Promise<CharacterWithDetails> {
        try {
            const [skills, parameters, relationships, growthPlan] = await Promise.allSettled([
                this.skillService?.getCharacterSkills(character.id) || Promise.resolve([]),
                this.parameterService?.getCharacterParameters(character.id) || Promise.resolve([]),
                this.relationshipService?.getCharacterRelationships(character.id) || Promise.resolve({ relationships: [] }),
                this.evolutionService?.getActiveGrowthPlan(character.id) || Promise.resolve(null)
            ]);

            return {
                id: character.id,
                name: character.name,
                description: character.description,
                type: character.type,
                emotionalState: character.state?.emotionalState || 'NEUTRAL',
                skills: this.extractValue(skills, []).map(skill => ({
                    name: skill.name,
                    level: skill.level,
                    proficiency: 0
                })),
                parameters: this.extractValue(parameters, []).map(param => ({
                    name: param.name,
                    value: param.value,
                    category: param.category
                })),
                growthPhase: this.extractValue(growthPlan, null)?.name || null,
                relationships: this.extractValue(relationships, { relationships: [] }).relationships.map(rel => ({
                    targetCharacterId: rel.targetId,
                    targetCharacterName: rel.targetName || 'Unknown',
                    relationshipType: rel.type,
                    strength: rel.strength,
                    lastInteraction: rel.lastInteraction?.toISOString()
                })),
                recentAppearances: character.history?.appearances?.slice(-5).map(app => ({
                    chapterNumber: app.chapterNumber,
                    summary: app.summary || '',
                    significance: app.significance
                })) || [],
                personality: {
                    traits: character.personality?.traits || [],
                    goals: character.goals || [],
                    fears: character.personality?.values || []
                },
                state: {
                    isActive: character.state?.isActive ?? true,
                    developmentStage: character.state?.developmentStage || 0,
                    lastAppearance: character.state?.lastAppearance || 0,
                    activeGrowthPlanId: character.state?.activeGrowthPlanId
                }
            };

        } catch (error) {
            this.logger.error(`Failed to build character details for ${character.name}`, { error });

            return {
                id: character.id,
                name: character.name,
                description: character.description,
                type: character.type,
                emotionalState: 'NEUTRAL',
                skills: [],
                parameters: [],
                growthPhase: null,
                relationships: [],
                recentAppearances: [],
                personality: {
                    traits: character.personality?.traits || [],
                    goals: character.goals || [],
                    fears: []
                },
                state: {
                    isActive: character.state?.isActive ?? true,
                    developmentStage: character.state?.developmentStage || 0,
                    lastAppearance: character.state?.lastAppearance || 0
                }
            };
        }
    }

    async getCharactersWithMemoryContext(): Promise<{
        characters: Character[];
        memoryManager?: MemoryManager;
    }> {
        const characters = await this.characterService.getAllActiveCharacters();
        return {
            characters,
            memoryManager: this.memoryManager
        };
    }
}

// ============================================================================
// ファクトリー関数とシングルトン管理（統合基盤対応）
// ============================================================================

export function createCharacterManager(
    memoryManager?: MemoryManager,
    characterService?: CharacterService,
    detectionService?: DetectionService,
    evolutionService?: EvolutionService,
    psychologyService?: PsychologyService,
    relationshipService?: RelationshipService,
    parameterService?: ParameterService,
    skillService?: SkillService
): CharacterManager {
    const services = {
        character: characterService || createCharacterService(undefined, memoryManager, {
            evolution: evolutionService,
            psychology: psychologyService,
            relationship: relationshipService,
            parameter: parameterService,
            skill: skillService,
            detection: detectionService
        }),
        detection: detectionService || (memoryManager ? new DetectionService(memoryManager) : undefined),
        evolution: evolutionService || (memoryManager ? new EvolutionService(memoryManager) : undefined),
        psychology: psychologyService || (memoryManager ? new PsychologyService(memoryManager) : undefined),
        relationship: relationshipService || (memoryManager ? new RelationshipService(memoryManager) : undefined),
        parameter: parameterService || (memoryManager ? new ParameterService(memoryManager) : undefined),
        skill: skillService || (memoryManager ? new SkillService(memoryManager) : undefined)
    };

    return new CharacterManager(
        services.character,
        memoryManager,
        services.detection,
        services.evolution,
        services.psychology,
        services.relationship,
        services.parameter,
        services.skill
    );
}

let instance: CharacterManager | null = null;

export function getCharacterManager(memoryManager?: MemoryManager): CharacterManager {
    if (!instance) {
        instance = createCharacterManager(memoryManager);
    }
    return instance;
}

export function initializeCharacterManager(memoryManager?: MemoryManager): CharacterManager {
    if (instance) {
        throw new Error('CharacterManager already initialized');
    }
    
    instance = createCharacterManager(memoryManager);
    return instance;
}

export const characterManager = {
    getInstance: (memoryManager?: MemoryManager): CharacterManager => {
        return getCharacterManager(memoryManager);
    },

    initialize: (memoryManager?: MemoryManager): CharacterManager => {
        return initializeCharacterManager(memoryManager);
    },

    create: createCharacterManager,

    async getCharactersByType(type: CharacterType, memoryManager?: MemoryManager): Promise<Character[]> {
        const manager = getCharacterManager(memoryManager);
        return manager.getCharactersByType(type);
    },

    async getAllCharacters(memoryManager?: MemoryManager): Promise<Character[]> {
        const manager = getCharacterManager(memoryManager);
        return manager.getAllCharacters();
    },

    async getCharacter(id: string, memoryManager?: MemoryManager): Promise<Character | null> {
        const manager = getCharacterManager(memoryManager);
        return manager.getCharacter(id);
    },

    // 🆕 統合基盤メソッド
    async getCharacterEnhanced(
        id: string, 
        options: EnhancedCharacterOptions, 
        memoryManager?: MemoryManager
    ): Promise<CharacterWithDetails | null> {
        const manager = getCharacterManager(memoryManager);
        return manager.getCharacterEnhanced(id, options);
    },

    async getCharactersForPrompt(
        characterIds: string[], 
        context: GenerationContext, 
        memoryManager?: MemoryManager
    ): Promise<UnifiedCharacterData[]> {
        const manager = getCharacterManager(memoryManager);
        return manager.getCharactersForPrompt(characterIds, context);
    }
};

export default characterManager;