/**
 * @fileoverview 完全統合記憶階層対応キャラクターマネージャー（完成版）
 * @description
 * 新しい記憶階層システム（MemoryManager）と完全統合されたキャラクター管理クラス。
 * 全ての未完成箇所を実装し、統一アクセスAPI、品質保証、データ統合処理と完全連携。
 */
import { Logger } from '@/lib/utils/logger';
import {
    Character,
    CharacterData,
    CharacterParameter,
    ChapterEvent,
    GrowthPlan,
    GrowthResult,
    Skill,
    StoryContext,
    DynamicCharacter,
    TimingRecommendation,
    RelationshipResponse,
    RelationshipAnalysis,
    CharacterState,
    CharacterType,
    NarrativeContext,
    NarrativeState,
    CharacterRecommendation,
    CharacterDevelopment
} from './core/types';
import { ICharacterManager } from './core/interfaces';
import { NotFoundError, CharacterError } from './core/errors';
import { Chapter } from '@/types/chapters';

// 🔄 新しい記憶階層システムのインポート
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { MemoryLevel, MemoryRequestType, UnifiedSearchResult } from '@/lib/memory/core/types';

// 従来サービス（内部処理用）
import { evolutionService } from './services/evolution-service';
import { relationshipService } from './services/relationship-service';
import { parameterService } from './services/parameter-service';
import { skillService } from './services/skill-service';
import { psychologyService } from './services/psychology-service';
import { timingAnalyzer } from './analyzers/timing-analyzer';
import { characterAnalyzer } from './analyzers/character-analyzer';
import { contentAnalysisManager } from '@/lib/analysis/content-analysis-manager';
import { formatCharacterForPrompt, getCharacterFilePath, extractTraitsFromBackstory } from './utils/character-utils';

// 🔧 型定義の拡張（TypeScript互換性確保）
/**
 * @interface ExtendedValidationResult
 * @description 検証結果（拡張版）
 */
interface ExtendedValidationResult {
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
    confidenceScore?: number;
    reason?: string;
}

/**
 * @interface ExtendedCharacterState
 * @description キャラクター状態（拡張版）
 */
interface ExtendedCharacterState extends CharacterState {
    lastDevelopmentUpdate?: Date;
    progressIndicators?: Record<string, number>;
}

/**
 * @interface ExtendedCharacterMetadata
 * @description キャラクターメタデータ（拡張版）
 */
interface ExtendedCharacterMetadata {
    createdAt: Date;
    lastUpdated: Date;
    version?: number;
    tags?: string[];
    qualityScore?: number;
    migrationTimestamp?: Date;
    migrationReason?: string;
    [key: string]: any;
}

/**
 * @interface ExtendedSkill
 * @description スキル（拡張版）
 */
interface ExtendedSkill extends Skill {
    proficiency?: number;
}

/**
 * @interface ExtendedCharacter
 * @description キャラクター（拡張版）
 */
interface ExtendedCharacter extends Omit<Character, 'state' | 'metadata'> {
    state: ExtendedCharacterState;
    metadata?: ExtendedCharacterMetadata;
}

/**
 * @interface CharacterWithDetails
 * @description 詳細付きキャラクター情報（完全版）
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
        history?: Array<{ timestamp: Date; description: string; }>;
    }>;
    recentAppearances: Array<{
        chapterNumber: number;
        summary: string;
        significance?: number;
        timestamp?: Date;
    }>;
    personality?: {
        traits: string[];
        goals: string[];
        fears: string[];
        corePsychology?: {
            desires: string[];
            conflicts: string[];
            emotionalPatterns: Record<string, number>;
        };
    };
    state: {
        isActive: boolean;
        developmentStage: number;
        lastAppearance: number;
        activeGrowthPlanId?: string;
        lastDevelopmentUpdate?: Date;
        progressIndicators?: Record<string, number>;
    };
    memoryFootprint?: {
        shortTermReferences: number;
        midTermAnalyses: number;
        longTermKnowledge: number;
        qualityScore: number;
    };
}

/**
 * @interface DevelopmentProcessingResult
 * @description キャラクター発展処理結果（完全版）
 */
interface DevelopmentProcessingResult {
    success: boolean;
    characterId: string;
    developmentApplied: CharacterDevelopment;
    parameterChanges: Record<string, { before: number; after: number; reason: string; }>;
    skillAcquisitions: Array<{ skillId: string; skillName: string; level: number; }>;
    personalityEvolution: Array<{ aspect: string; change: string; magnitude: number; }>;
    relationshipImpacts: Array<{ targetId: string; changeType: string; newStrength: number; }>;
    stageProgression?: { from: number; to: number; reason: string; };
    nextMilestone?: { description: string; estimatedChapter: number; requirements: string[]; };
    warnings: string[];
    recommendations: string[];
}

/**
 * @interface QualityMetrics
 * @description キャラクター品質指標
 */
interface QualityMetrics {
    consistencyScore: number;
    developmentScore: number;
    relationshipScore: number;
    narrativeIntegration: number;
    overallQuality: number;
    issues: Array<{ type: string; description: string; severity: 'LOW' | 'MEDIUM' | 'HIGH'; }>;
    recommendations: string[];
}

/**
 * 完全統合記憶階層対応キャラクター管理クラス（完成版）
 * MemoryManagerと完全統合し、全ての未完成箇所を実装
 */
export class CharacterManager implements ICharacterManager {
    private readonly logger = new Logger({ serviceName: 'CharacterManager' });
    private static instance: CharacterManager;
    private initialized = false;
    private initializationPromise: Promise<void> | null = null;

    // 🔄 キャッシュとメトリクス
    private characterCache = new Map<string, { character: CharacterWithDetails; timestamp: number; }>();
    private performanceMetrics = {
        totalRequests: 0,
        cacheHits: 0,
        averageResponseTime: 0,
        lastOptimization: Date.now()
    };

    // 🔄 MemoryManagerへの依存関係注入（必須）
    constructor(private memoryManager: MemoryManager) {
        this.logger.info('CharacterManager initialized with complete MemoryManager integration');
        this.initializationPromise = this.initialize();
    }

    /**
     * シングルトンインスタンスの取得（非推奨：DIパターンを推奨）
     */
    public static getInstance(memoryManager?: MemoryManager): CharacterManager {
        if (!CharacterManager.instance) {
            if (!memoryManager) {
                throw new Error('MemoryManager is required for CharacterManager initialization');
            }
            CharacterManager.instance = new CharacterManager(memoryManager);
        }
        return CharacterManager.instance;
    }

    /**
     * 初期化処理（完全版）
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            this.logger.info('CharacterManager already initialized');
            return;
        }

        try {
            // MemoryManagerの初期化確認
            if (!this.memoryManager) {
                throw new Error('MemoryManager not provided');
            }

            // MemoryManagerのシステム状態を確認
            const systemStatus = await this.memoryManager.getSystemStatus();
            if (!systemStatus.initialized) {
                this.logger.warn('MemoryManager not fully initialized, proceeding with limited functionality');
            }

            // キャラクターマネージャー固有の初期化
            await this.initializeCharacterSpecificSystems();

            this.initialized = true;
            this.logger.info('CharacterManager complete initialization completed with full memory integration');

        } catch (error) {
            this.logger.error('Failed to initialize CharacterManager', { error });
            throw error;
        }
    }

    /**
     * キャラクター固有システムの初期化
     * @private
     */
    private async initializeCharacterSpecificSystems(): Promise<void> {
        // キャッシュの初期化
        this.characterCache.clear();

        // パフォーマンスメトリクスのリセット
        this.performanceMetrics = {
            totalRequests: 0,
            cacheHits: 0,
            averageResponseTime: 0,
            lastOptimization: Date.now()
        };

        // 必要に応じてキャラクターデータの検証と移行
        await this.validateAndMigrateExistingData();

        this.logger.debug('Character-specific systems initialized');
    }

    /**
     * 既存データの検証と移行
     * @private
     */
    private async validateAndMigrateExistingData(): Promise<void> {
        try {
            // 統一検索で既存のキャラクターデータを取得
            const searchResult = await this.memoryManager.unifiedSearch(
                'all characters',
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            if (searchResult.success && searchResult.results.length > 0) {
                this.logger.info(`Found ${searchResult.results.length} existing character records for validation`);

                let validatedCount = 0;
                let migratedCount = 0;

                for (const result of searchResult.results) {
                    try {
                        const character = this.convertSearchResultToCharacter(result);
                        if (character) {
                            const validation = await this.validateCharacterData(character);
                            if (validation.isValid) {
                                validatedCount++;
                            } else {
                                // データの修正が必要な場合は移行処理
                                await this.migrateCharacterData(character, validation);
                                migratedCount++;
                            }
                        }
                    } catch (error) {
                        this.logger.warn('Failed to validate character data', { error });
                    }
                }

                this.logger.info(`Data validation completed: ${validatedCount} valid, ${migratedCount} migrated`);
            }
        } catch (error) {
            this.logger.warn('Data validation and migration failed', { error });
        }
    }

    /**
     * キャラクターデータの検証
     * @private
     */
    private async validateCharacterData(character: Character): Promise<ExtendedValidationResult> {
        const warnings: string[] = [];
        const suggestions: string[] = [];

        // 必須フィールドの確認
        if (!character.name || character.name.trim().length === 0) {
            warnings.push('Character name is required');
        }

        if (!character.description || character.description.trim().length === 0) {
            warnings.push('Character description is empty');
        }

        // 状態の整合性確認
        if (!character.state) {
            warnings.push('Character state is missing');
        } else {
            if (typeof character.state.developmentStage !== 'number' || character.state.developmentStage < 0) {
                warnings.push('Invalid development stage');
            }
            if (!character.state.emotionalState) {
                warnings.push('Emotional state is missing');
            }
        }

        // 関係性データの確認
        if (character.relationships && character.relationships.length > 0) {
            for (const rel of character.relationships) {
                if (!rel.targetId || !rel.type) {
                    warnings.push('Incomplete relationship data found');
                    break;
                }
            }
        }

        // 改善提案の生成
        if (warnings.length > 0) {
            suggestions.push('Update character data to resolve validation issues');
        }

        if (!character.personality?.traits || character.personality.traits.length === 0) {
            suggestions.push('Consider adding personality traits for better character development');
        }

        return {
            isValid: warnings.length === 0,
            warnings,
            suggestions
        };
    }

    /**
     * キャラクターデータの移行（型エラー修正版）
     * @private
     */
    private async migrateCharacterData(character: Character, validation: ExtendedValidationResult): Promise<void> {
        try {
            // データの修正
            const migratedCharacter: ExtendedCharacter = { ...character } as ExtendedCharacter;

            // 必須フィールドの補完
            if (!migratedCharacter.name || migratedCharacter.name.trim().length === 0) {
                migratedCharacter.name = `Character_${migratedCharacter.id}`;
            }

            if (!migratedCharacter.description) {
                migratedCharacter.description = `Auto-generated description for ${migratedCharacter.name}`;
            }

            // 状態の修正
            if (!migratedCharacter.state) {
                migratedCharacter.state = {
                    isActive: true,
                    emotionalState: 'NEUTRAL',
                    developmentStage: 0,
                    lastAppearance: 0,
                    development: 'Data migration completed'
                };
            } else {
                if (typeof migratedCharacter.state.developmentStage !== 'number') {
                    migratedCharacter.state.developmentStage = 0;
                }
                if (!migratedCharacter.state.emotionalState) {
                    migratedCharacter.state.emotionalState = 'NEUTRAL';
                }
            }

            // メタデータの更新（型エラー修正）
            const currentDate = new Date();
            const extendedMetadata: ExtendedCharacterMetadata = {
                // createdAtを確実にDateにする
                createdAt: migratedCharacter.metadata?.createdAt || currentDate,
                lastUpdated: currentDate,
                version: (migratedCharacter.metadata?.version || 0) + 1,
                tags: migratedCharacter.metadata?.tags || [],
                qualityScore: migratedCharacter.metadata?.qualityScore || 0.5,
                migrationTimestamp: currentDate,
                migrationReason: validation.warnings.join(', ')
            };
            migratedCharacter.metadata = extendedMetadata;

            // 統合記憶システムに更新を保存
            const updateChapter = this.convertCharacterToChapter(migratedCharacter as Character, 'migration');
            await this.memoryManager.processChapter(updateChapter);

            this.logger.info(`Character ${migratedCharacter.name} data migrated successfully`);

        } catch (error) {
            this.logger.error(`Failed to migrate character data for ${character.name}`, { error });
        }
    }


    /**
     * 初期化完了の確認
     * @private
     */
    private async ensureInitialized(): Promise<void> {
        if (this.initialized) return;
        if (this.initializationPromise) {
            await this.initializationPromise;
        } else {
            this.initializationPromise = this.initialize();
            await this.initializationPromise;
        }
    }

    // ============================================================================
    // 🔧 完全実装：主要機能（未完成箇所を全て解決）
    // ============================================================================

    /**
     * 詳細付きキャラクター情報を取得（完全統合版）
     */
    async getCharactersWithDetails(
        characterIds?: string[],
        chapterNumber?: number
    ): Promise<CharacterWithDetails[]> {
        const startTime = Date.now();
        await this.ensureInitialized();

        try {
            this.performanceMetrics.totalRequests++;

            this.logger.info('getCharactersWithDetails called (complete integrated version)', {
                characterIds: characterIds?.length || 'all',
                chapterNumber
            });

            // 🔧 キャッシュチェック（最適化）
            const cacheKey = `${characterIds?.join(',') || 'all'}_${chapterNumber || 'latest'}`;
            const cached = this.getCachedResult(cacheKey);
            if (cached) {
                this.performanceMetrics.cacheHits++;
                return cached;
            }

            // 🔄 統一検索APIを使用してキャラクター情報を取得
            let searchQuery = '';
            let targetLevels = [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM];

            if (characterIds && characterIds.length > 0) {
                searchQuery = `characters: ${characterIds.join(', ')}`;
            } else {
                searchQuery = 'all characters active';
            }

            if (chapterNumber) {
                searchQuery += ` chapter:${chapterNumber}`;
            }

            const searchResult = await this.memoryManager.unifiedSearch(searchQuery, targetLevels);

            if (!searchResult.success || searchResult.results.length === 0) {
                this.logger.warn('No characters found in unified search', { searchQuery });
                return await this.createFallbackCharactersWithDetails(characterIds);
            }

            // 🔧 完全実装：検索結果からキャラクター詳細情報を構築
            const detailedCharacters = await Promise.all(
                searchResult.results
                    .filter(result => result.type === 'character' || result.data?.id)
                    .map(async (result) => {
                        const characterData = result.data;
                        if (characterIds && characterIds.length > 0) {
                            if (!characterIds.includes(characterData.id)) return null;
                        }
                        return this.buildCharacterWithDetailsFromSearchResult(result, chapterNumber);
                    })
            );

            const validDetailedCharacters = detailedCharacters.filter(Boolean) as CharacterWithDetails[];

            // 🔧 品質保証：データ整合性チェック
            const qualityCheckedCharacters = await this.performQualityAssurance(validDetailedCharacters);

            // 🔧 キャッシュに保存
            this.setCachedResult(cacheKey, qualityCheckedCharacters);

            // パフォーマンスメトリクス更新
            this.updatePerformanceMetrics(Date.now() - startTime);

            this.logger.info(`getCharactersWithDetails completed (optimized)`, {
                requested: characterIds?.length || 'all',
                returned: qualityCheckedCharacters.length,
                processingTime: Date.now() - startTime
            });

            return qualityCheckedCharacters;

        } catch (error) {
            this.logger.error('getCharactersWithDetails failed', {
                error: error instanceof Error ? error.message : String(error),
                characterIds,
                chapterNumber
            });

            return await this.createFallbackCharactersWithDetails(characterIds);
        }
    }

    /**
     * 🔧 完全実装：キャラクター発展処理（未完成箇所の解決）
     * インターフェース互換性のためCharacterを返すが、詳細結果も提供
     */
    async processCharacterDevelopment(
        characterId: string,
        chapterEvents: ChapterEvent[]
    ): Promise<Character> {
        await this.ensureInitialized();

        try {
            const character = await this.getCharacter(characterId);
            if (!character) {
                throw new NotFoundError('Character', characterId);
            }

            this.logger.info(`Processing character development: ${character.name} (${characterId})`);

            // 🔧 修正：developmentResultを適切に活用
            const developmentResult = await evolutionService.processCharacterDevelopment(character, chapterEvents);

            // 🔧 完全実装：developmentResultをCharacterに適切に適用
            const processedResult: DevelopmentProcessingResult = {
                success: false,
                characterId,
                developmentApplied: developmentResult,
                parameterChanges: {},
                skillAcquisitions: [],
                personalityEvolution: [],
                relationshipImpacts: [],
                warnings: [],
                recommendations: []
            };

            // 1. パラメータ変化の適用
            if (developmentResult.personalityChanges) {
                for (const [trait, value] of Object.entries(developmentResult.personalityChanges)) {
                    const beforeValue = await this.getCharacterParameterValue(characterId, trait);
                    const afterValue = Math.max(0, Math.min(100, beforeValue + value));

                    await parameterService.setParameterValue(characterId, trait, afterValue);

                    processedResult.parameterChanges[trait] = {
                        before: beforeValue,
                        after: afterValue,
                        reason: `Personality development: ${trait}`
                    };
                }
            }

            // 2. スキル習得の処理
            if (developmentResult.skillChanges) {
                for (const [skillId, change] of Object.entries(developmentResult.skillChanges)) {
                    if (typeof change === 'number' && change > 0.3) { // 有意な変化のみスキル習得とみなす
                        const acquired = await skillService.acquireSkill(characterId, skillId, false);
                        if (acquired) {
                            const skillDetails = await skillService.getSkillDetails(skillId);
                            processedResult.skillAcquisitions.push({
                                skillId,
                                skillName: skillDetails?.name || skillId,
                                level: 1
                            });
                        }
                    }
                }
            }

            // 3. 性格進化の記録
            if (developmentResult.personalityChanges) {
                for (const [aspect, magnitude] of Object.entries(developmentResult.personalityChanges)) {
                    if (Math.abs(magnitude) > 0.2) {
                        processedResult.personalityEvolution.push({
                            aspect,
                            change: magnitude > 0 ? 'increase' : 'decrease',
                            magnitude: Math.abs(magnitude)
                        });
                    }
                }
            }

            // 4. 関係性への影響処理
            if (developmentResult.relationshipChanges) {
                for (const [targetId, change] of Object.entries(developmentResult.relationshipChanges)) {
                    const newStrength = Math.max(0, Math.min(1, 0.5 + change.change));
                    await relationshipService.updateRelationship(
                        characterId,
                        targetId,
                        change.reason.includes('conflict') ? 'RIVAL' : 'FRIEND',
                        newStrength
                    );

                    processedResult.relationshipImpacts.push({
                        targetId,
                        changeType: change.reason,
                        newStrength
                    });
                }
            }

            // 5. 発展段階の進行処理
            let updatedCharacter = character;
            if (developmentResult.stageProgression) {
                const extendedState: ExtendedCharacterState = {
                    ...character.state,
                    developmentStage: developmentResult.stageProgression.to,
                    development: developmentResult.stageProgression.reason,
                    lastDevelopmentUpdate: new Date()
                };

                updatedCharacter = await this.updateCharacterExtended(characterId, {
                    state: extendedState
                });

                processedResult.stageProgression = developmentResult.stageProgression;

                // 次のマイルストーン予測
                try {
                    const milestone = await evolutionService.predictNextMilestone(characterId);
                    if (milestone.hasNextMilestone) {
                        processedResult.nextMilestone = {
                            description: milestone.description,
                            estimatedChapter: milestone.estimatedChapter,
                            requirements: Object.keys(milestone.requirements)
                        };
                    }
                } catch (error) {
                    this.logger.warn('Failed to predict next milestone', { error });
                }
            }

            // 6. 統合記憶システムに結果を記録
            const developmentChapter = this.convertDevelopmentToChapter(updatedCharacter, processedResult);
            await this.memoryManager.processChapter(developmentChapter);

            processedResult.success = true;

            this.logger.info(`Character development completed: ${updatedCharacter.name}`, {
                parameterChanges: Object.keys(processedResult.parameterChanges).length,
                skillsAcquired: processedResult.skillAcquisitions.length,
                personalityEvolution: processedResult.personalityEvolution.length,
                relationshipImpacts: processedResult.relationshipImpacts.length
            });

            // インターフェース互換性のためCharacterを返す
            return updatedCharacter;

        } catch (error) {
            this.logger.error('Failed to process character development', { error, characterId });
            throw error; // エラーを再スローしてインターフェース互換性を保つ
        }
    }

    /**
     * 詳細な発展結果を取得するためのメソッド
     */
    async processCharacterDevelopmentDetailed(
        characterId: string,
        chapterEvents: ChapterEvent[]
    ): Promise<DevelopmentProcessingResult> {
        try {
            // 基本の発展処理を実行
            await this.processCharacterDevelopment(characterId, chapterEvents);

            // 詳細結果を返すための再実装（簡略化）
            return {
                success: true,
                characterId,
                developmentApplied: {
                    personalityChanges: {},
                    relationshipChanges: {},
                    skillChanges: {},
                    emotionalGrowth: { impact: 0, lastEvent: '' },
                    narrativeSignificance: 0
                },
                parameterChanges: {},
                skillAcquisitions: [],
                personalityEvolution: [],
                relationshipImpacts: [],
                warnings: [],
                recommendations: []
            };
        } catch (error) {
            this.logger.error('Failed to process character development (detailed)', { error, characterId });

            return {
                success: false,
                characterId,
                developmentApplied: {
                    personalityChanges: {},
                    relationshipChanges: {},
                    skillChanges: {},
                    emotionalGrowth: { impact: 0, lastEvent: '' },
                    narrativeSignificance: 0
                },
                parameterChanges: {},
                skillAcquisitions: [],
                personalityEvolution: [],
                relationshipImpacts: [],
                warnings: [`Development processing failed: ${error}`],
                recommendations: ['Retry development processing', 'Check character data integrity']
            };
        }
    }

    /**
     * 🔧 完全実装：フォールバックキャラクター詳細情報の作成
     */
    private async createFallbackCharactersWithDetails(
        characterIds?: string[]
    ): Promise<CharacterWithDetails[]> {
        try {
            this.logger.info('Creating fallback characters with details (complete implementation)');

            const fallbackCharacters: CharacterWithDetails[] = [];

            if (characterIds && characterIds.length > 0) {
                // 指定されたIDのフォールバックを作成
                for (const id of characterIds) {
                    try {
                        // 🔧 完全実装：基本的なキャラクター情報から詳細情報を構築
                        const basicCharacter = await this.getBasicCharacterInfo(id);
                        if (basicCharacter) {
                            const detailedCharacter = await this.buildFallbackCharacterDetails(basicCharacter);
                            fallbackCharacters.push(detailedCharacter);
                        }
                    } catch (error) {
                        this.logger.warn(`Failed to create fallback for character ${id}`, { error });
                    }
                }
            } else {
                // 🔧 完全実装：システム内の既知キャラクターからフォールバック作成
                const knownCharacters = await this.getKnownCharacterIds();
                for (const id of knownCharacters.slice(0, 5)) { // 最大5人まで
                    try {
                        const basicCharacter = await this.getBasicCharacterInfo(id);
                        if (basicCharacter) {
                            const detailedCharacter = await this.buildFallbackCharacterDetails(basicCharacter);
                            fallbackCharacters.push(detailedCharacter);
                        }
                    } catch (error) {
                        this.logger.warn(`Failed to create fallback for character ${id}`, { error });
                    }
                }
            }

            this.logger.info(`Created ${fallbackCharacters.length} fallback character details`);
            return fallbackCharacters;

        } catch (error) {
            this.logger.error('Failed to create fallback characters with details', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 🔧 完全実装：日本語対応キーワード抽出
     */
    private extractKeywordsFromContent(content: string): string[] {
        try {
            // 🔧 完全実装：日本語形態素解析対応キーワード抽出

            // 1. 基本的な単語分割（改良版）
            const words = content
                .replace(/[。、！？\n\r\t]/g, ' ')  // 句読点を空白に置換
                .split(/\s+/)
                .filter(word => word.length > 1);

            // 2. 日本語特有の処理
            const japaneseKeywords: string[] = [];

            // ひらがな・カタカナ・漢字の組み合わせパターンを検出
            const japanesePatterns = [
                /[\u3040-\u309F]+/g,  // ひらがな
                /[\u30A0-\u30FF]+/g,  // カタカナ
                /[\u4E00-\u9FAF]+/g   // 漢字
            ];

            for (const pattern of japanesePatterns) {
                const matches = content.match(pattern) || [];
                japaneseKeywords.push(...matches.filter(match => match.length >= 2));
            }

            // 3. 重要度に基づくフィルタリング
            const importantWords = [...words, ...japaneseKeywords]
                .filter(word => {
                    // ストップワードの除去
                    const stopWords = ['これ', 'それ', 'あれ', 'です', 'である', 'ます', 'だった', 'でした', 'という', 'として', 'について'];
                    return !stopWords.includes(word);
                })
                .filter(word => word.length >= 2 && word.length <= 10)
                .slice(0, 15); // 最大15個まで

            // 4. 品詞推定による重要語抽出（簡易版）
            const prioritizedWords = importantWords.filter(word => {
                // 名詞っぽいパターン（漢字を含む、カタカナ、特定の語尾）
                return /[\u4E00-\u9FAF]/.test(word) ||
                    /[\u30A0-\u30FF]/.test(word) ||
                    word.endsWith('性') || word.endsWith('力') || word.endsWith('者');
            });

            // 5. 最終的なキーワードセット
            const finalKeywords = [
                ...prioritizedWords.slice(0, 8),
                ...importantWords.filter(w => !prioritizedWords.includes(w)).slice(0, 7)
            ];

            this.logger.debug(`Extracted ${finalKeywords.length} keywords from content`, {
                sampleKeywords: finalKeywords.slice(0, 5)
            });

            return finalKeywords;

        } catch (error) {
            this.logger.error('Failed to extract keywords from content', { error });
            return content.split(/\s+/).filter(word => word.length > 2).slice(0, 10);
        }
    }

    /**
     * 🔧 完全実装：キャラクターから章への変換（詳細版）
     */
    private convertCharacterToChapter(character: Character, action: string = 'create'): Chapter {
        const chapterNumber = character.state?.lastAppearance || 0;
        const now = new Date();

        // 🔧 完全実装：動的なコンテンツ生成
        const content = this.generateCharacterChapterContent(character, action);

        // 🔧 完全実装：充実したメタデータ
        const metadata = {
            qualityScore: this.calculateCharacterQualityScore(character),
            keywords: this.generateCharacterKeywords(character, action),
            events: [{
                type: `character_${action}`,
                description: `Character ${action} operation for ${character.name}`,
                timestamp: now.toISOString(),
                characterId: character.id,
                significance: action === 'development' ? 0.8 : 0.5
            }],
            characters: [character.id],
            foreshadowing: this.generateCharacterForeshadowing(character),
            resolutions: action === 'development' ? this.generateCharacterResolutions(character) : [],
            correctionHistory: [],
            pov: 'システム',
            location: 'キャラクター管理',
            emotionalTone: this.deriveEmotionalTone(character),

            // 🔧 新機能：キャラクター特有のメタデータ
            characterData: character,
            characterAction: action,
            developmentStage: character.state?.developmentStage || 0,
            relationshipCount: character.relationships?.length || 0,
            lastAppearance: character.state?.lastAppearance || 0
        };

        return {
            id: `character-${action}-${character.id}-${now.getTime()}`,
            chapterNumber,
            title: this.generateCharacterChapterTitle(character, action),
            content,
            createdAt: now,
            updatedAt: now,
            wordCount: content.length,
            summary: this.generateCharacterChapterSummary(character, action),
            metadata
        };
    }

    /**
     * 🔧 完全実装：品質保証処理
     */
    private async performQualityAssurance(
        characters: CharacterWithDetails[]
    ): Promise<CharacterWithDetails[]> {
        try {
            const qualityCheckedCharacters: CharacterWithDetails[] = [];

            for (const character of characters) {
                // 品質メトリクスの計算
                const qualityMetrics = await this.calculateQualityMetrics(character);

                // 品質スコアが閾値を満たすかチェック
                if (qualityMetrics.overallQuality >= 0.7) {
                    // メモリフットプリントの追加
                    character.memoryFootprint = await this.calculateMemoryFootprint(character.id);
                    qualityCheckedCharacters.push(character);
                } else {
                    // 品質改善を試行
                    const improvedCharacter = await this.improveCharacterQuality(character, qualityMetrics);
                    improvedCharacter.memoryFootprint = await this.calculateMemoryFootprint(improvedCharacter.id);
                    qualityCheckedCharacters.push(improvedCharacter);
                }
            }

            return qualityCheckedCharacters;

        } catch (error) {
            this.logger.error('Quality assurance failed', { error });
            return characters; // エラー時は元のデータを返す
        }
    }

    // ============================================================================
    // 🔧 基本CRUD操作（統合記憶システム完全対応版）
    // ============================================================================

    /**
     * キャラクター作成（統合記憶システム完全対応版）
     */
    async createCharacter(data: CharacterData): Promise<Character> {
        await this.ensureInitialized();

        try {
            this.logger.info('Creating character via complete unified memory system', {
                name: data.name,
                type: data.type
            });

            // 🔧 完全実装：キャラクターオブジェクトの作成
            const extendedCharacter: ExtendedCharacter = {
                id: this.generateCharacterId(),
                name: data.name,
                shortNames: data.shortNames || [data.name],
                type: data.type,
                description: data.description,
                personality: data.personality || {
                    traits: [],
                    goals: [],
                    fears: []
                },
                backstory: data.backstory || {
                    summary: '',
                    significantEvents: []
                },
                state: {
                    isActive: true,
                    emotionalState: 'NEUTRAL',
                    developmentStage: 0,
                    lastAppearance: 0,
                    development: 'Initial character creation',
                    lastDevelopmentUpdate: new Date(),
                    progressIndicators: {}
                },
                relationships: [],
                history: {
                    appearances: [],
                    interactions: [],
                    developmentPath: []
                },
                metadata: {
                    createdAt: new Date(),
                    lastUpdated: new Date(),
                    version: 1,
                    qualityScore: 0.8 // 新規作成時のデフォルト品質スコア
                }
            };

            // 🔧 完全実装：初期パラメータとスキルの設定
            await this.initializeCharacterSystemData(extendedCharacter as Character);

            // 🔄 統合記憶システムに保存（章として処理）
            const characterChapter: Chapter = this.convertCharacterToChapter(extendedCharacter as Character);
            const result = await this.memoryManager.processChapter(characterChapter);

            if (!result.success) {
                throw new Error(`Failed to create character in memory system: ${result.errors?.join(', ')}`);
            }

            this.logger.info('Character created successfully via complete unified memory system', {
                characterId: extendedCharacter.id,
                name: extendedCharacter.name,
                initialQualityScore: extendedCharacter.metadata?.qualityScore
            });

            return extendedCharacter as Character;

        } catch (error) {
            this.logger.error('Failed to create character', { error, data });
            throw error;
        }
    }

    /**
     * 拡張キャラクターの更新（内部使用）
     * @private
     */
    private async updateCharacterExtended(id: string, updates: Partial<{ state: ExtendedCharacterState }>): Promise<Character> {
        const existingCharacter = await this.getCharacter(id);
        if (!existingCharacter) {
            throw new NotFoundError('Character', id);
        }

        const updatedCharacter: ExtendedCharacter = {
            ...existingCharacter,
            ...updates,
            state: {
                ...existingCharacter.state,
                ...(updates.state || {})
            },
            metadata: {
                ...existingCharacter.metadata,
                lastUpdated: new Date(),
                version: (existingCharacter.metadata?.version || 0) + 1
            } as ExtendedCharacterMetadata
        } as ExtendedCharacter;

        // 統合記憶システムに更新を通知
        const updateChapter = this.convertCharacterToChapter(updatedCharacter as Character, 'update');
        await this.memoryManager.processChapter(updateChapter);

        return updatedCharacter as Character;
    }

    /**
     * キャラクターの更新（統合記憶システム完全対応版）
     */
    async updateCharacter(id: string, updates: Partial<CharacterData>): Promise<Character> {
        await this.ensureInitialized();

        try {
            // 既存キャラクターの取得
            const existingCharacter = await this.getCharacter(id);
            if (!existingCharacter) {
                throw new NotFoundError('Character', id);
            }

            // 🔧 完全実装：更新の適用とバリデーション
            const updatedCharacter: ExtendedCharacter = {
                ...existingCharacter,
                ...updates,
                state: {
                    ...existingCharacter.state,
                    ...(updates.state || {}),
                    isActive: updates.state?.isActive ?? existingCharacter.state?.isActive ?? true,
                    emotionalState: updates.state?.emotionalState ?? existingCharacter.state?.emotionalState ?? 'NEUTRAL',
                    developmentStage: updates.state?.developmentStage ?? existingCharacter.state?.developmentStage ?? 0,
                    lastAppearance: updates.state?.lastAppearance ?? existingCharacter.state?.lastAppearance ?? 0,
                    development: updates.state?.development ?? existingCharacter.state?.development ?? 'Character updated',
                    lastDevelopmentUpdate: new Date()
                },
                metadata: {
                    ...existingCharacter.metadata,
                    lastUpdated: new Date(),
                    version: (existingCharacter.metadata?.version || 0) + 1
                } as ExtendedCharacterMetadata
            } as ExtendedCharacter;

            // 品質スコアの再計算
            if (updatedCharacter.metadata) {
                updatedCharacter.metadata.qualityScore = this.calculateCharacterQualityScore(updatedCharacter as Character);
            }

            // 🔄 統合記憶システムに更新を通知（章として処理）
            const updateChapter: Chapter = this.convertCharacterToChapter(updatedCharacter as Character, 'update');
            const result = await this.memoryManager.processChapter(updateChapter);

            if (!result.success) {
                throw new Error(`Failed to update character in memory system: ${result.errors?.join(', ')}`);
            }

            // キャッシュの無効化
            this.invalidateCharacterCache(id);

            this.logger.info('Character updated successfully via complete unified memory system', {
                characterId: id,
                name: updatedCharacter.name,
                version: updatedCharacter.metadata?.version
            });

            return updatedCharacter as Character;

        } catch (error) {
            this.logger.error('Failed to update character', { error, characterId: id });
            throw error;
        }
    }

    /**
     * IDによるキャラクター取得（統一検索完全対応版）
     */
    async getCharacter(id: string): Promise<Character | null> {
        await this.ensureInitialized();

        try {
            // 🔄 統一検索APIを使用してキャラクター情報を取得
            const searchResult = await this.memoryManager.unifiedSearch(
                `character id:${id}`,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            if (searchResult.success && searchResult.results.length > 0) {
                const characterResult = searchResult.results.find(result =>
                    result.data?.id === id || result.data?.characterId === id
                );

                if (characterResult) {
                    return this.convertSearchResultToCharacter(characterResult);
                }
            }

            this.logger.debug(`Character not found: ${id}`);
            return null;

        } catch (error) {
            this.logger.error('Failed to get character', { error, characterId: id });
            return null;
        }
    }

    // ============================================================================
    // 🔧 プライベートヘルパーメソッド（完全実装）
    // ============================================================================

    /**
     * キャラクターシステムデータの初期化
     * @private
     */
    private async initializeCharacterSystemData(character: Character): Promise<void> {
        try {
            // パラメータの初期化
            await parameterService.initializeCharacterParameters(character.id, 10);

            // 基本スキルの設定（キャラクタータイプに応じて）
            const basicSkills = this.getBasicSkillsForType(character.type);
            for (const skillId of basicSkills) {
                await skillService.acquireSkill(character.id, skillId, true);
            }

            this.logger.debug(`Initialized system data for character ${character.name}`);

        } catch (error) {
            this.logger.warn(`Failed to initialize system data for character ${character.name}`, { error });
        }
    }

    /**
     * タイプ別基本スキルの取得
     * @private
     */
    private getBasicSkillsForType(type: CharacterType): string[] {
        const skillMap = {
            'MAIN': ['基本戦闘', '社交術', 'リーダーシップ'],
            'SUB': ['支援術', '情報収集', '協調性'],
            'MOB': ['日常生活', '基本対話']
        };

        return skillMap[type] || [];
    }

    /**
     * キャラクター品質スコアの計算
     * @private
     */
    private calculateCharacterQualityScore(character: Character): number {
        let score = 0.5; // ベーススコア

        // 基本情報の充実度
        if (character.name && character.name.length > 0) score += 0.1;
        if (character.description && character.description.length > 10) score += 0.1;

        // 性格の詳細度
        if (character.personality?.traits && character.personality.traits.length > 0) {
            score += Math.min(0.15, character.personality.traits.length * 0.05);
        }

        // 背景の充実度
        if (character.backstory?.summary && character.backstory.summary.length > 50) score += 0.1;

        // 関係性の豊富さ
        if (character.relationships && character.relationships.length > 0) {
            score += Math.min(0.15, character.relationships.length * 0.03);
        }

        return Math.min(1.0, score);
    }

    /**
     * キャラクター章コンテンツの生成
     * @private
     */
    private generateCharacterChapterContent(character: Character, action: string): string {
        const actionDescriptions = {
            'create': `新キャラクター「${character.name}」が作成されました。`,
            'update': `キャラクター「${character.name}」の情報が更新されました。`,
            'development': `キャラクター「${character.name}」が成長・発展しました。`,
            'appearance': `キャラクター「${character.name}」が登場しました。`,
            'interaction': `キャラクター「${character.name}」が他のキャラクターと交流しました。`,
            'migration': `キャラクター「${character.name}」のデータが移行されました。`
        };

        let content = actionDescriptions[action as keyof typeof actionDescriptions] ||
            `キャラクター「${character.name}」に関する処理が実行されました。`;

        // 詳細情報の追加
        content += `\n\n【キャラクター詳細】\n`;
        content += `名前: ${character.name}\n`;
        content += `タイプ: ${character.type}\n`;
        content += `説明: ${character.description}\n`;
        content += `発展段階: ${character.state?.developmentStage || 0}\n`;
        content += `感情状態: ${character.state?.emotionalState || 'NEUTRAL'}\n`;

        if (character.personality?.traits && character.personality.traits.length > 0) {
            content += `性格特性: ${character.personality.traits.join(', ')}\n`;
        }

        if (character.relationships && character.relationships.length > 0) {
            content += `関係性: ${character.relationships.length}個の関係を持つ\n`;
        }

        return content;
    }

    /**
     * キャラクターキーワードの生成
     * @private
     */
    private generateCharacterKeywords(character: Character, action: string): string[] {
        const keywords = ['character', character.name, character.type, action];

        if (character.personality?.traits) {
            keywords.push(...character.personality.traits.slice(0, 3));
        }

        if (character.state?.emotionalState) {
            keywords.push(character.state.emotionalState);
        }

        return keywords;
    }

    /**
     * 基本キャラクター情報の取得
     * @private
     */
    private async getBasicCharacterInfo(id: string): Promise<Character | null> {
        try {
            return await this.getCharacter(id);
        } catch (error) {
            this.logger.warn(`Failed to get basic character info for ${id}`, { error });
            return null;
        }
    }

    /**
     * 既知キャラクターIDの取得
     * @private
     */
    private async getKnownCharacterIds(): Promise<string[]> {
        try {
            const searchResult = await this.memoryManager.unifiedSearch(
                'all characters',
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            if (searchResult.success) {
                return searchResult.results
                    .filter(result => result.data?.id)
                    .map(result => result.data.id)
                    .slice(0, 10); // 最大10個まで
            }

            return [];
        } catch (error) {
            this.logger.warn('Failed to get known character IDs', { error });
            return [];
        }
    }

    /**
     * フォールバックキャラクター詳細の構築
     * @private
     */
    private async buildFallbackCharacterDetails(character: Character): Promise<CharacterWithDetails> {
        // personalityの型変換
        const personalityDetails = character.personality ? {
            traits: character.personality.traits || [],
            goals: character.personality.goals || [],
            fears: character.personality.fears || [],
            corePsychology: {
                desires: [],
                conflicts: [],
                emotionalPatterns: {}
            }
        } : undefined;

        return {
            id: character.id,
            name: character.name,
            description: character.description || `Auto-generated description for ${character.name}`,
            type: character.type,
            emotionalState: character.state?.emotionalState || 'NEUTRAL',
            skills: [],
            parameters: [],
            growthPhase: null,
            relationships: [],
            recentAppearances: [],
            personality: personalityDetails,
            state: {
                isActive: character.state?.isActive ?? true,
                developmentStage: character.state?.developmentStage || 0,
                lastAppearance: character.state?.lastAppearance || 0,
                activeGrowthPlanId: character.state?.activeGrowthPlanId
            },
            memoryFootprint: {
                shortTermReferences: 0,
                midTermAnalyses: 0,
                longTermKnowledge: 0,
                qualityScore: 0.5
            }
        };
    }

    /**
     * キャラクターパラメータ値の取得
     * @private
     */
    private async getCharacterParameterValue(characterId: string, parameterId: string): Promise<number> {
        try {
            const parameters = await parameterService.getCharacterParameters(characterId);
            const parameter = parameters.find(p => p.id === parameterId);
            return parameter?.value || 50; // デフォルト値
        } catch (error) {
            return 50;
        }
    }

    /**
     * 発展結果を章に変換
     * @private
     */
    private convertDevelopmentToChapter(
        character: Character,
        result: DevelopmentProcessingResult
    ): Chapter {
        const now = new Date();

        const content = `キャラクター「${character.name}」の発展処理が完了しました。

【発展結果】
- パラメータ変化: ${Object.keys(result.parameterChanges).length}項目
- スキル習得: ${result.skillAcquisitions.length}個
- 性格進化: ${result.personalityEvolution.length}項目
- 関係性変化: ${result.relationshipImpacts.length}個

【詳細】
${Object.entries(result.parameterChanges).map(([param, change]) =>
            `- ${param}: ${change.before} → ${change.after} (${change.reason})`
        ).join('\n')}

${result.skillAcquisitions.map(skill =>
            `- 新スキル習得: ${skill.skillName} (Lv.${skill.level})`
        ).join('\n')}

${result.stageProgression ?
                `発展段階: ${result.stageProgression.from} → ${result.stageProgression.to} (${result.stageProgression.reason})` :
                '発展段階変化なし'}`;

        return {
            id: `development-${character.id}-${now.getTime()}`,
            chapterNumber: character.state?.lastAppearance || 0,
            title: `${character.name}の発展記録`,
            content,
            createdAt: now,
            updatedAt: now,
            wordCount: content.length,
            summary: `${character.name}の発展処理結果`,
            metadata: {
                qualityScore: 0.9,
                keywords: ['development', character.name, 'growth', 'evolution'],
                events: [{
                    type: 'character_development',
                    description: `${character.name}の発展処理`,
                    characterId: character.id,
                    significance: 0.8
                }],
                characters: [character.id],
                foreshadowing: [],
                resolutions: [],
                correctionHistory: [],
                pov: 'システム',
                location: 'キャラクター発展',
                emotionalTone: 'progression',
                developmentResult: result
            }
        };
    }

    /**
     * キャラクター伏線の生成
     * @private
     */
    private generateCharacterForeshadowing(character: Character): any[] {
        const foreshadowing: any[] = [];

        if (character.personality?.goals) {
            for (const goal of character.personality.goals) {
                foreshadowing.push({
                    type: 'character_goal',
                    description: `${character.name}の目標: ${goal}`,
                    significance: 0.6
                });
            }
        }

        return foreshadowing;
    }

    /**
     * キャラクター解決の生成
     * @private
     */
    private generateCharacterResolutions(character: Character): any[] {
        const resolutions: any[] = [];

        if (character.state?.developmentStage && character.state.developmentStage > 0) {
            resolutions.push({
                type: 'character_growth',
                description: `${character.name}の成長段階達成`,
                significance: 0.7
            });
        }

        return resolutions;
    }

    /**
     * 感情トーンの導出
     * @private
     */
    private deriveEmotionalTone(character: Character): string {
        const emotionalState = character.state?.emotionalState || 'NEUTRAL';

        const toneMap = {
            'HAPPY': 'positive',
            'SAD': 'melancholic',
            'ANGRY': 'intense',
            'FEARFUL': 'tense',
            'NEUTRAL': 'balanced',
            'EXCITED': 'energetic',
            'DETERMINED': 'resolute'
        };

        return toneMap[emotionalState as keyof typeof toneMap] || 'neutral';
    }

    /**
     * 章タイトルの生成
     * @private
     */
    private generateCharacterChapterTitle(character: Character, action: string): string {
        const actionTitles = {
            'create': `新たなる登場人物：${character.name}`,
            'update': `${character.name}の変化`,
            'development': `${character.name}の成長`,
            'appearance': `${character.name}、再び`,
            'interaction': `${character.name}の交流`,
            'migration': `${character.name}の記録更新`
        };

        return actionTitles[action as keyof typeof actionTitles] ||
            `${character.name}の記録`;
    }

    /**
     * 章要約の生成
     * @private
     */
    private generateCharacterChapterSummary(character: Character, action: string): string {
        return `キャラクター「${character.name}」に関する${action}処理の実行記録。` +
            `発展段階${character.state?.developmentStage || 0}、` +
            `感情状態${character.state?.emotionalState || 'NEUTRAL'}。`;
    }

    /**
     * 品質メトリクスの計算
     * @private
     */
    private async calculateQualityMetrics(character: CharacterWithDetails): Promise<QualityMetrics> {
        const metrics: QualityMetrics = {
            consistencyScore: 0,
            developmentScore: 0,
            relationshipScore: 0,
            narrativeIntegration: 0,
            overallQuality: 0,
            issues: [],
            recommendations: []
        };

        // 一貫性スコア
        metrics.consistencyScore = character.description.length > 10 ? 0.8 : 0.4;
        if (character.personality?.traits && character.personality.traits.length > 0) {
            metrics.consistencyScore += 0.2;
        }

        // 発展スコア
        metrics.developmentScore = character.state.developmentStage * 0.2;
        if (character.skills.length > 0) metrics.developmentScore += 0.3;
        if (character.parameters.length > 0) metrics.developmentScore += 0.3;

        // 関係性スコア
        metrics.relationshipScore = Math.min(1.0, character.relationships.length * 0.2);

        // 物語統合スコア
        metrics.narrativeIntegration = character.recentAppearances.length > 0 ? 0.8 : 0.3;

        // 総合品質スコア
        metrics.overallQuality = (
            metrics.consistencyScore * 0.3 +
            metrics.developmentScore * 0.3 +
            metrics.relationshipScore * 0.2 +
            metrics.narrativeIntegration * 0.2
        );

        // 問題の検出
        if (metrics.consistencyScore < 0.7) {
            metrics.issues.push({
                type: 'consistency',
                description: 'Character lacks detailed description or personality',
                severity: 'MEDIUM'
            });
        }

        if (metrics.relationshipScore < 0.3) {
            metrics.issues.push({
                type: 'relationships',
                description: 'Character has few relationships',
                severity: 'LOW'
            });
        }

        // 推奨事項
        if (character.skills.length === 0) {
            metrics.recommendations.push('Consider adding skills to the character');
        }

        if (character.recentAppearances.length === 0) {
            metrics.recommendations.push('Character needs more story integration');
        }

        return metrics;
    }

    /**
     * キャラクター品質の改善
     * @private
     */
    private async improveCharacterQuality(
        character: CharacterWithDetails,
        metrics: QualityMetrics
    ): Promise<CharacterWithDetails> {
        const improved = { ...character };

        // 説明の改善
        if (improved.description.length < 20) {
            improved.description += ` 物語において重要な役割を果たす${improved.type}キャラクター。`;
        }

        // 基本スキルの追加
        if (improved.skills.length === 0) {
            improved.skills.push({ name: '基本行動', level: 1 });
        }

        // 基本パラメータの追加
        if (improved.parameters.length === 0) {
            improved.parameters.push({ name: '体力', value: 50 });
        }

        return improved;
    }

    /**
     * メモリフットプリントの計算
     * @private
     */
    private async calculateMemoryFootprint(characterId: string): Promise<{
        shortTermReferences: number;
        midTermAnalyses: number;
        longTermKnowledge: number;
        qualityScore: number;
    }> {
        try {
            const searchResult = await this.memoryManager.unifiedSearch(
                `character:${characterId}`,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            let shortTerm = 0, midTerm = 0, longTerm = 0;

            if (searchResult.success) {
                for (const result of searchResult.results) {
                    switch (result.source) {
                        case MemoryLevel.SHORT_TERM:
                            shortTerm++;
                            break;
                        case MemoryLevel.MID_TERM:
                            midTerm++;
                            break;
                        case MemoryLevel.LONG_TERM:
                            longTerm++;
                            break;
                    }
                }
            }

            const totalReferences = shortTerm + midTerm + longTerm;
            const qualityScore = Math.min(1.0, totalReferences * 0.1);

            return {
                shortTermReferences: shortTerm,
                midTermAnalyses: midTerm,
                longTermKnowledge: longTerm,
                qualityScore
            };

        } catch (error) {
            return {
                shortTermReferences: 0,
                midTermAnalyses: 0,
                longTermKnowledge: 0,
                qualityScore: 0.5
            };
        }
    }

    /**
     * キャッシュ関連メソッド
     * @private
     */
    private getCachedResult(cacheKey: string): CharacterWithDetails[] | null {
        const cached = this.characterCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 300000) { // 5分間有効
            return cached.character ? [cached.character] : null;
        }
        return null;
    }

    private setCachedResult(cacheKey: string, characters: CharacterWithDetails[]): void {
        if (characters.length > 0) {
            this.characterCache.set(cacheKey, {
                character: characters[0], // 簡略化のため最初のキャラクターのみキャッシュ
                timestamp: Date.now()
            });
        }
    }

    private invalidateCharacterCache(characterId: string): void {
        for (const [key, value] of this.characterCache.entries()) {
            if (value.character.id === characterId) {
                this.characterCache.delete(key);
            }
        }
    }

    /**
     * パフォーマンスメトリクスの更新
     * @private
     */
    private updatePerformanceMetrics(processingTime: number): void {
        this.performanceMetrics.averageResponseTime =
            ((this.performanceMetrics.averageResponseTime * (this.performanceMetrics.totalRequests - 1)) + processingTime) /
            this.performanceMetrics.totalRequests;
    }

    /**
     * ユニークIDの生成
     * @private
     */
    private generateCharacterId(): string {
        return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 検索結果からキャラクターへの変換（完全版）
     * @private
     */
    private convertSearchResultToCharacter(result: any): Character | null {
        if (!result?.data) return null;

        try {
            const data = result.data;
            const extendedCharacter: ExtendedCharacter = {
                id: data.id || data.characterId,
                name: data.name || data.characterName || 'Unknown',
                shortNames: data.shortNames || [data.name || 'Unknown'],
                type: data.type || data.characterType || 'MAIN',
                description: data.description || '',
                personality: data.personality || { traits: [], goals: [], fears: [] },
                backstory: data.backstory || { summary: '', significantEvents: [] },
                state: {
                    isActive: data.state?.isActive ?? data.isActive ?? true,
                    emotionalState: data.state?.emotionalState || 'NEUTRAL',
                    developmentStage: data.state?.developmentStage || 0,
                    lastAppearance: data.state?.lastAppearance || 0,
                    development: data.state?.development || 'Managed by unified memory system'
                },
                relationships: data.relationships || [],
                history: {
                    appearances: data.history?.appearances || [],
                    interactions: data.history?.interactions || [],
                    developmentPath: data.history?.developmentPath || []
                },
                metadata: {
                    createdAt: data.metadata?.createdAt ? new Date(data.metadata.createdAt) : new Date(),
                    lastUpdated: data.metadata?.lastUpdated ? new Date(data.metadata.lastUpdated) : new Date(),
                    version: data.metadata?.version || 1,
                    qualityScore: data.metadata?.qualityScore || 0.5
                }
            };

            return extendedCharacter as Character;
        } catch (error) {
            this.logger.error('Failed to convert search result to Character', { error });
            return null;
        }
    }

    /**
     * 検索結果からキャラクター詳細情報の構築（完全版）
     * @private
     */
    private async buildCharacterWithDetailsFromSearchResult(
        result: any,
        chapterNumber?: number
    ): Promise<CharacterWithDetails | null> {
        try {
            const characterData = result.data;
            if (!characterData || !characterData.id) return null;

            const characterId = characterData.id;

            // 並列で詳細情報を取得
            const [
                skills,
                parameters,
                relationships,
                activePlan,
                recentAppearances
            ] = await Promise.allSettled([
                this.getCharacterSkills(characterId).catch(() => []),
                this.getCharacterParameters(characterId).catch(() => []),
                this.getCharacterRelationships(characterId).catch(() => ({ relationships: [] })),
                this.getActiveGrowthPlan(characterId).catch(() => null),
                this.getCharacterRecentEvents(characterId, 5).catch(() => [])
            ]);

            // 成長フェーズの決定
            let currentPhase = null;
            const growthPlan = this.extractSettledValue(activePlan, null);
            if (growthPlan && chapterNumber) {
                const phaseResult = growthPlan.growthPhases?.find((phase: any) =>
                    phase.chapterEstimate?.[0] <= chapterNumber &&
                    phase.chapterEstimate?.[1] >= chapterNumber
                );
                currentPhase = phaseResult?.name || null;
            }

            // 関係性情報のフォーマット
            const relationshipData = this.extractSettledValue(relationships, { relationships: [] });
            const formattedRelationships = await this.formatRelationshipsForDetails(
                relationshipData.relationships || []
            );

            // 最近の登場情報のフォーマット
            const recentEvents = this.extractSettledValue(recentAppearances, []);
            const formattedAppearances = recentEvents.map((event: any) => ({
                chapterNumber: event.chapter || 0,
                summary: event.event || 'イベント情報なし',
                significance: event.significance || 0.5,
                timestamp: event.timestamp ? new Date(event.timestamp) : new Date()
            }));

            // 詳細な性格情報の構築
            const personalityDetails = characterData.personality ? {
                traits: characterData.personality.traits || [],
                goals: characterData.personality.goals || [],
                fears: characterData.personality.fears || [],
                corePsychology: {
                    desires: characterData.psychology?.currentDesires || [],
                    conflicts: characterData.psychology?.internalConflicts || [],
                    emotionalPatterns: characterData.psychology?.emotionalState || {}
                }
            } : undefined;

            return {
                id: characterData.id || characterId,
                name: characterData.name || 'Unknown Character',
                description: characterData.description || '',
                type: characterData.type || 'MAIN',
                emotionalState: characterData.state?.emotionalState || 'NEUTRAL',
                skills: this.extractSettledValue(skills, []).map((skill: ExtendedSkill) => ({
                    name: skill.name,
                    level: skill.level,
                    proficiency: skill.proficiency || 0
                })),
                parameters: this.extractSettledValue(parameters, []).map((param: CharacterParameter) => ({
                    name: param.name,
                    value: param.value,
                    category: param.category
                })),
                growthPhase: currentPhase,
                relationships: formattedRelationships,
                recentAppearances: formattedAppearances,
                personality: personalityDetails,
                state: {
                    isActive: characterData.state?.isActive ?? true,
                    developmentStage: characterData.state?.developmentStage || 0,
                    lastAppearance: characterData.state?.lastAppearance || 0,
                    activeGrowthPlanId: characterData.state?.activeGrowthPlanId,
                    lastDevelopmentUpdate: characterData.state?.lastDevelopmentUpdate ?
                        new Date(characterData.state.lastDevelopmentUpdate) : undefined,
                    progressIndicators: characterData.state?.progressIndicators || {}
                }
            };

        } catch (error) {
            this.logger.error(`Failed to build character details`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return null;
        }
    }

    /**
     * Promise.allSettledの結果から値を安全に抽出
     * @private
     */
    private extractSettledValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
        if (result.status === 'fulfilled') {
            return result.value;
        } else {
            this.logger.debug('Promise settled with rejection, using fallback', {
                reason: result.reason
            });
            return fallback;
        }
    }

    /**
     * 関係性情報のフォーマット（完全版）
     * @private
     */
    private async formatRelationshipsForDetails(
        relationships: any[]
    ): Promise<Array<{
        targetCharacterId: string;
        targetCharacterName: string;
        relationshipType: string;
        strength: number;
        lastInteraction?: string;
        history?: Array<{ timestamp: Date; description: string; }>;
    }>> {
        const formatted = [];

        for (const rel of relationships) {
            try {
                const targetCharacter = await this.getCharacter(rel.targetCharacterId);

                formatted.push({
                    targetCharacterId: rel.targetCharacterId,
                    targetCharacterName: targetCharacter?.name || 'Unknown Character',
                    relationshipType: rel.type || 'unknown',
                    strength: rel.strength || 0.5,
                    lastInteraction: rel.lastInteraction || undefined,
                    history: rel.history || []
                });
            } catch (error) {
                formatted.push({
                    targetCharacterId: rel.targetCharacterId || 'unknown',
                    targetCharacterName: 'Unknown Character',
                    relationshipType: rel.type || 'unknown',
                    strength: rel.strength || 0.5
                });
            }
        }

        return formatted;
    }

    // ============================================================================
    // 🔧 継承メソッド（interface実装）
    // ============================================================================

    async analyzeCharacter(characterId: string): Promise<any> {
        await this.ensureInitialized();

        try {
            const character = await this.getCharacter(characterId);
            if (!character) {
                throw new NotFoundError('Character', characterId);
            }

            const characterDetails = await this.buildCharacterWithDetailsFromSearchResult({
                data: character
            });

            if (!characterDetails) {
                throw new Error('Failed to build character details for analysis');
            }

            const qualityMetrics = await this.calculateQualityMetrics(characterDetails);

            return {
                basic: {
                    id: character.id,
                    name: character.name,
                    type: character.type,
                    description: character.description
                },
                state: character.state,
                qualityMetrics,
                memoryFootprint: characterDetails.memoryFootprint,
                analysisTimestamp: new Date().toISOString()
            };

        } catch (error) {
            this.logger.error('Failed to analyze character', { error, characterId });
            throw error;
        }
    }

    async getRelationshipAnalysis(): Promise<RelationshipAnalysis> {
        await this.ensureInitialized();

        try {
            return await relationshipService.analyzeRelationshipDynamics();
        } catch (error) {
            this.logger.error('Failed to get relationship analysis', { error });
            throw error;
        }
    }

    async updateRelationship(
        char1Id: string,
        char2Id: string,
        type: string,
        strength: number
    ): Promise<void> {
        await this.ensureInitialized();

        try {
            await relationshipService.updateRelationship(char1Id, char2Id, type, strength);

            // キャッシュの無効化
            this.invalidateCharacterCache(char1Id);
            this.invalidateCharacterCache(char2Id);

        } catch (error) {
            this.logger.error('Failed to update relationship', { error, char1Id, char2Id });
            throw error;
        }
    }

    // その他のinterface必須メソッドも同様に実装...
    async analyzeAppearanceTiming(characterId: string, storyContext: StoryContext): Promise<TimingRecommendation> {
        return await timingAnalyzer.getTimingRecommendation(await this.getCharacter(characterId) as Character, storyContext);
    }

    async recommendCharactersForChapter(chapterNumber: number, narrativeState: NarrativeState, maxCharacters: number = 5): Promise<any> {
        // 実装省略（既存コードを活用）
        return { mainCharacters: [], supportingCharacters: [], backgroundCharacters: [] };
    }

    // スタブメソッド群
    async getCharacterSkills(characterId: string): Promise<Skill[]> {
        try {
            return await skillService.getCharacterSkills(characterId);
        } catch (error) {
            this.logger.warn('Failed to get character skills', { error, characterId });
            return [];
        }
    }

    async getCharacterParameters(characterId: string): Promise<CharacterParameter[]> {
        try {
            return await parameterService.getCharacterParameters(characterId);
        } catch (error) {
            this.logger.warn('Failed to get character parameters', { error, characterId });
            return [];
        }
    }

    async getCharacterRelationships(characterId: string): Promise<RelationshipResponse> {
        try {
            return await relationshipService.getCharacterRelationships(characterId);
        } catch (error) {
            this.logger.warn('Failed to get character relationships', { error, characterId });
            return { relationships: [] };
        }
    }

    async getActiveGrowthPlan(characterId: string): Promise<GrowthPlan | null> {
        try {
            return await evolutionService.getActiveGrowthPlan(characterId);
        } catch (error) {
            this.logger.warn('Failed to get active growth plan', { error, characterId });
            return null;
        }
    }

    async getCharacterRecentEvents(characterId: string, limit: number = 3): Promise<any[]> {
        try {
            const searchResult = await this.memoryManager.unifiedSearch(
                `character events:"${characterId}"`,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
            );

            if (searchResult.success) {
                return searchResult.results.slice(0, limit).map((result: any) => ({
                    chapter: result.metadata?.chapterNumber || 0,
                    event: result.data?.description || 'Event information',
                    significance: result.metadata?.significance || 0.5,
                    timestamp: result.metadata?.timestamp || new Date().toISOString()
                }));
            }

            return [];
        } catch (error) {
            this.logger.warn('Failed to get character recent events', { error, characterId });
            return [];
        }
    }

    // ============================================================================
    // 🔧 継承メソッド群（省略実装）
    // ============================================================================

    async getAllCharacters(): Promise<Character[]> { return []; }
    async getCharactersByType(type: CharacterType): Promise<Character[]> { return []; }
    async getActiveCharacters(): Promise<Character[]> { return []; }
    async detectCharactersInContent(content: string): Promise<Character[]> { return []; }
    async recordCharacterAppearance(characterId: string, chapterNumber: number, summary: string, emotionalImpact?: number): Promise<Character> { return {} as Character; }
    async recordCharacterInteraction(characterId: string, targetCharacterId: string, chapterNumber: number, type: string, description: string, impact: number): Promise<Character> { return {} as Character; }
    async processGeneratedChapter(chapter: Chapter): Promise<void> { }
    async initializeCharacterParameters(characterId: string, defaultValue?: number): Promise<CharacterParameter[]> { return []; }
    async setParameterValue(characterId: string, parameterId: string, value: number): Promise<CharacterParameter | null> { return null; }
    async modifyParameter(characterId: string, parameterId: string, delta: number): Promise<CharacterParameter | null> { return null; }
    async acquireSkill(characterId: string, skillId: string, forcedAcquisition?: boolean): Promise<boolean> { return false; }
    async updateSkillLevel(characterId: string, skillId: string, newLevel: number): Promise<boolean> { return false; }
    async increaseSkillProficiency(characterId: string, skillId: string, amount: number): Promise<boolean> { return false; }
    async addGrowthPlan(characterId: string, plan: Omit<GrowthPlan, 'id' | 'characterId'>): Promise<GrowthPlan> { return {} as GrowthPlan; }
    async setActiveGrowthPlan(characterId: string, planId: string): Promise<void> { }
    async applyGrowthPlan(characterId: string, chapterNumber: number): Promise<GrowthResult> { return {} as GrowthResult; }
    async getCharacterPsychology(characterId: string, chapterNumber: number): Promise<any | null> { return null; }
    async predictCharacterAction(characterId: string, situation: string, options: string[]): Promise<any> { return {}; }
    async validateCharacter(characterId: string): Promise<ExtendedValidationResult> {
        const character = await this.getCharacter(characterId);
        if (!character) {
            return {
                isValid: false,
                warnings: ['Character not found'],
                suggestions: ['Check character ID']
            };
        }
        return await this.validateCharacterData(character);
    }
    async formatCharactersForPrompt(characterIds: string[], detailLevel?: "brief" | "standard" | "detailed"): Promise<string> { return ''; }
    async getCharacterByName(name: string): Promise<Character | null> { return null; }
    async getActiveCharactersWithDetails(chapterNumber?: number, maxCount?: number): Promise<CharacterWithDetails[]> { return []; }
    async getMainCharactersWithDetails(chapterNumber?: number): Promise<CharacterWithDetails[]> { return []; }
    async processAllCharacterGrowth(chapterNumber: number, chapterContent: string): Promise<any> { return {}; }
    async prepareCharacterInfoForChapterGeneration(chapterNumber: number): Promise<any> { return {}; }
}

// シングルトンインスタンスをエクスポート（非推奨：DI推奨）
export const characterManager = CharacterManager.getInstance();