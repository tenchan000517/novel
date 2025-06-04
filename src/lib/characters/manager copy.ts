/**
 * @fileoverview 完全統合記憶階層対応キャラクターマネージャー（完成版）
 * @description
 * 新しい記憶階層システム（MemoryManager）と完全統合されたキャラクター管理クラス。
 * 既存の全機能を保持し、統一アクセスAPIを活用した最適化版。
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
    CharacterRecommendation
} from './core/types';
import { ICharacterManager } from './core/interfaces';
import { NotFoundError } from './core/errors';
import { Chapter } from '@/types/chapters';

// 🔄 新しい記憶階層システムのインポート
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { MemoryLevel, MemoryRequestType } from '@/lib/memory/core/types';

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

/**
 * @interface CharacterWithDetails
 * @description 詳細付きキャラクター情報
 */
export interface CharacterWithDetails {
    id: string;
    name: string;
    description: string;
    type: CharacterType;
    emotionalState: string;
    skills: Array<{ name: string; level: number; }>;
    parameters: Array<{ name: string; value: number; }>;
    growthPhase: string | null;
    relationships: Array<{
        targetCharacterId: string;
        targetCharacterName: string;
        relationshipType: string;
        strength: number;
    }>;
    recentAppearances: Array<{
        chapterNumber: number;
        summary: string;
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
}

/**
 * @interface ValidationResult
 * @description キャラクター検証結果
 */
interface ValidationResult {
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
}

/**
 * 完全統合記憶階層対応キャラクター管理クラス（完成版）
 * MemoryManagerと完全統合し、既存の全機能を保持します
 */
export class CharacterManager implements ICharacterManager {
    private readonly logger = new Logger({ serviceName: 'CharacterManager' });
    private static instance: CharacterManager;
    private initialized = false;
    private initializationPromise: Promise<void> | null = null;

    // 🔄 MemoryManagerへの依存関係注入（必須）
    constructor(private memoryManager: MemoryManager) {
        this.logger.info('CharacterManager initialized with MemoryManager integration');
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
     * 初期化処理
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

            this.initialized = true;
            this.logger.info('CharacterManager initialization completed with memory integration');

        } catch (error) {
            this.logger.error('Failed to initialize CharacterManager', { error });
            throw error;
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
    // 🔧 新しい統一アクセスAPIを活用した主要機能
    // ============================================================================

    /**
     * 詳細付きキャラクター情報を取得（統一アクセス版）
     */
    async getCharactersWithDetails(
        characterIds?: string[],
        chapterNumber?: number
    ): Promise<CharacterWithDetails[]> {
        await this.ensureInitialized();

        try {
            this.logger.info('getCharactersWithDetails called (unified access)', {
                characterIds: characterIds?.length || 'all',
                chapterNumber
            });

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
                return this.createFallbackCharactersWithDetails(characterIds);
            }

            // 検索結果からキャラクター詳細情報を構築
            const detailedCharacters = await Promise.all(
                searchResult.results
                    .filter(result => result.type === 'character' || result.data?.id)
                    .map(async (result) => {
                        const characterData = result.data;
                        if (characterIds && characterIds.length > 0) {
                            // 指定されたIDに含まれるもののみ
                            if (!characterIds.includes(characterData.id)) return null;
                        }
                        return this.buildCharacterWithDetailsFromSearchResult(result, chapterNumber);
                    })
            );

            const validDetailedCharacters = detailedCharacters.filter(Boolean) as CharacterWithDetails[];

            this.logger.info(`getCharactersWithDetails completed`, {
                requested: characterIds?.length || 'all',
                returned: validDetailedCharacters.length
            });

            return validDetailedCharacters;

        } catch (error) {
            this.logger.error('getCharactersWithDetails failed', {
                error: error instanceof Error ? error.message : String(error),
                characterIds,
                chapterNumber
            });

            // フォールバック: 基本的なキャラクター情報を返す
            return this.createFallbackCharactersWithDetails(characterIds);
        }
    }

    /**
     * アクティブキャラクターの詳細情報取得（統一アクセス版）
     */
    async getActiveCharactersWithDetails(
        chapterNumber?: number,
        maxCount: number = 10
    ): Promise<CharacterWithDetails[]> {
        await this.ensureInitialized();

        try {
            this.logger.info('getActiveCharactersWithDetails called', { chapterNumber, maxCount });

            // アクティブなキャラクターを統一検索で取得
            const searchQuery = chapterNumber
                ? `active characters chapter:${chapterNumber}`
                : 'active characters';

            const searchResult = await this.memoryManager.unifiedSearch(
                searchQuery,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            if (!searchResult.success) {
                return [];
            }

            const characterResults = searchResult.results
                .filter(result => result.type === 'character' && result.data?.state?.isActive)
                .slice(0, maxCount);

            const activeCharacters = await Promise.all(
                characterResults.map(result =>
                    this.buildCharacterWithDetailsFromSearchResult(result, chapterNumber)
                )
            );

            return activeCharacters.filter(Boolean) as CharacterWithDetails[];

        } catch (error) {
            this.logger.error('getActiveCharactersWithDetails failed', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * メインキャラクターの詳細情報取得（統一アクセス版）
     */
    async getMainCharactersWithDetails(
        chapterNumber?: number
    ): Promise<CharacterWithDetails[]> {
        await this.ensureInitialized();

        try {
            this.logger.info('getMainCharactersWithDetails called', { chapterNumber });

            // メインキャラクターを統一検索で取得
            const searchQuery = chapterNumber
                ? `main characters chapter:${chapterNumber}`
                : 'main characters type:MAIN';

            const searchResult = await this.memoryManager.unifiedSearch(
                searchQuery,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            if (!searchResult.success) {
                return [];
            }

            const mainCharacterResults = searchResult.results
                .filter(result =>
                    result.type === 'character' &&
                    (result.data?.type === 'MAIN' || result.data?.characterType === 'MAIN')
                );

            const mainCharacters = await Promise.all(
                mainCharacterResults.map(result =>
                    this.buildCharacterWithDetailsFromSearchResult(result, chapterNumber)
                )
            );

            return mainCharacters.filter(Boolean) as CharacterWithDetails[];

        } catch (error) {
            this.logger.error('getMainCharactersWithDetails failed', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    // ============================================================================
    // 🔧 基本CRUD操作（MemoryManager統合版）
    // ============================================================================

    /**
     * キャラクター作成（統合記憶システム版）
     */
    async createCharacter(data: CharacterData): Promise<Character> {
        await this.ensureInitialized();

        try {
            this.logger.info('Creating character via unified memory system', {
                name: data.name,
                type: data.type
            });

            // キャラクターオブジェクトの作成（型安全性を確保）
            const character: Character = {
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
                    development: 'Initial character creation'
                },
                relationships: [],
                history: {
                    appearances: [],
                    interactions: [],
                    developmentPath: []
                },
                metadata: {
                    createdAt: new Date(),
                    lastUpdated: new Date()
                }
            };

            // 🔄 統合記憶システムに保存（章として処理）
            const characterChapter: Chapter = this.convertCharacterToChapter(character);
            const result = await this.memoryManager.processChapter(characterChapter);

            if (!result.success) {
                throw new Error(`Failed to create character in memory system: ${result.errors?.join(', ')}`);
            }

            this.logger.info('Character created successfully via unified memory system', {
                characterId: character.id,
                name: character.name
            });

            return character;

        } catch (error) {
            this.logger.error('Failed to create character', { error, data });
            throw error;
        }
    }

    /**
     * IDによるキャラクター取得（統一検索版）
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

            return null;

        } catch (error) {
            this.logger.error('Failed to get character', { error, characterId: id });
            return null;
        }
    }

    /**
     * 名前によるキャラクター取得（統一検索版）
     */
    async getCharacterByName(name: string): Promise<Character | null> {
        await this.ensureInitialized();

        try {
            // 🔄 統一検索APIを使用
            const searchResult = await this.memoryManager.unifiedSearch(
                `character name:"${name}"`,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            if (searchResult.success && searchResult.results.length > 0) {
                // 最も関連性の高い結果を選択
                const bestMatch = searchResult.results
                    .filter(result =>
                        result.data?.name === name ||
                        result.data?.characterName === name ||
                        result.data?.shortNames?.includes(name)
                    )
                    .sort((a, b) => b.relevance - a.relevance)[0];

                if (bestMatch) {
                    return this.convertSearchResultToCharacter(bestMatch);
                }
            }

            return null;

        } catch (error) {
            this.logger.error('Failed to get character by name', { error, name });
            return null;
        }
    }

    /**
     * キャラクターの更新（統合記憶システム版）
     */
    async updateCharacter(id: string, updates: Partial<CharacterData>): Promise<Character> {
        await this.ensureInitialized();

        try {
            // 既存キャラクターの取得
            const existingCharacter = await this.getCharacter(id);
            if (!existingCharacter) {
                throw new NotFoundError('Character', id);
            }

            // 更新の適用（型安全性を確保）
            const updatedCharacter: Character = {
                ...existingCharacter,
                ...updates,
                state: {
                    isActive: updates.state?.isActive ?? existingCharacter.state?.isActive ?? true,
                    emotionalState: updates.state?.emotionalState ?? existingCharacter.state?.emotionalState ?? 'NEUTRAL',
                    developmentStage: updates.state?.developmentStage ?? existingCharacter.state?.developmentStage ?? 0,
                    lastAppearance: updates.state?.lastAppearance ?? existingCharacter.state?.lastAppearance ?? 0,
                    development: updates.state?.development ?? existingCharacter.state?.development ?? 'Character updated'
                },
                metadata: {
                    ...existingCharacter.metadata,
                    lastUpdated: new Date()
                }
            };

            // 🔄 統合記憶システムに更新を通知（章として処理）
            const updateChapter: Chapter = this.convertCharacterToChapter(updatedCharacter, 'update');
            const result = await this.memoryManager.processChapter(updateChapter);

            if (!result.success) {
                throw new Error(`Failed to update character in memory system: ${result.errors?.join(', ')}`);
            }

            return updatedCharacter;

        } catch (error) {
            this.logger.error('Failed to update character', { error, characterId: id });
            throw error;
        }
    }

    /**
     * すべてのキャラクターを取得（統一検索版）
     */
    async getAllCharacters(): Promise<Character[]> {
        await this.ensureInitialized();

        try {
            // 🔄 統一検索APIを使用
            const searchResult = await this.memoryManager.unifiedSearch(
                'all characters',
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            if (searchResult.success) {
                const characters = searchResult.results
                    .filter(result => result.type === 'character' || result.data?.id)
                    .map(result => this.convertSearchResultToCharacter(result))
                    .filter(Boolean) as Character[];

                return characters;
            }

            return [];

        } catch (error) {
            this.logger.error('Failed to get all characters', { error });
            return [];
        }
    }

    /**
     * タイプ別キャラクター取得（統一検索版）
     */
    async getCharactersByType(type: CharacterType): Promise<Character[]> {
        await this.ensureInitialized();

        try {
            const searchResult = await this.memoryManager.unifiedSearch(
                `characters type:${type}`,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            if (searchResult.success) {
                const characters = searchResult.results
                    .filter(result =>
                        result.data?.type === type || result.data?.characterType === type
                    )
                    .map(result => this.convertSearchResultToCharacter(result))
                    .filter(Boolean) as Character[];

                return characters;
            }

            return [];

        } catch (error) {
            this.logger.error('Failed to get characters by type', { error, type });
            return [];
        }
    }

    /**
     * アクティブなキャラクターを取得（統一検索版）
     */
    async getActiveCharacters(): Promise<Character[]> {
        await this.ensureInitialized();

        try {
            const searchResult = await this.memoryManager.unifiedSearch(
                'active characters',
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            if (searchResult.success) {
                const characters = searchResult.results
                    .filter(result => result.data?.state?.isActive || result.data?.isActive)
                    .map(result => this.convertSearchResultToCharacter(result))
                    .filter(Boolean) as Character[];

                return characters;
            }

            return [];

        } catch (error) {
            this.logger.error('Failed to get active characters', { error });
            return [];
        }
    }

    /**
     * コンテンツからキャラクターを検出（統一検索版）
     */
    async detectCharactersInContent(content: string): Promise<Character[]> {
        await this.ensureInitialized();

        try {
            // コンテンツの一部をキーワードとして使用
            const keywords = this.extractKeywordsFromContent(content);
            const searchQuery = `characters ${keywords.join(' ')}`;

            const searchResult = await this.memoryManager.unifiedSearch(
                searchQuery,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            if (searchResult.success) {
                const detectedCharacters = searchResult.results
                    .filter(result => {
                        if (!result.data?.name) return false;
                        // キャラクター名がコンテンツに含まれているかチェック
                        const characterName = result.data.name.toLowerCase();
                        const contentLower = content.toLowerCase();
                        return contentLower.includes(characterName);
                    })
                    .map(result => this.convertSearchResultToCharacter(result))
                    .filter(Boolean) as Character[];

                return detectedCharacters;
            }

            return [];

        } catch (error) {
            this.logger.error('Failed to detect characters in content', { error });
            return [];
        }
    }

    // ============================================================================
    // 🔧 記録・処理機能（統合記憶システム版）
    // ============================================================================

    /**
     * キャラクターの登場を記録（統合記憶システム版）
     */
    async recordCharacterAppearance(
        characterId: string,
        chapterNumber: number,
        summary: string,
        emotionalImpact: number = 0
    ): Promise<Character> {
        await this.ensureInitialized();

        try {
            const character = await this.getCharacter(characterId);
            if (!character) {
                throw new NotFoundError('Character', characterId);
            }

            // 登場記録更新
            const updatedCharacter: Character = {
                ...character,
                state: {
                    ...character.state,
                    lastAppearance: chapterNumber,
                    isActive: character.state?.isActive ?? true,
                    emotionalState: character.state?.emotionalState || 'NEUTRAL',
                    developmentStage: character.state?.developmentStage || 0,
                    development: character.state?.development || 'Character appearance recorded'
                },
                history: {
                    appearances: [
                        ...(character.history?.appearances || []),
                        {
                            chapterNumber,
                            summary,
                            emotionalImpact,
                            significance: emotionalImpact,
                            timestamp: new Date()
                        }
                    ],
                    interactions: character.history?.interactions || [],
                    developmentPath: character.history?.developmentPath || []
                }
            };

            // 🔄 記憶システムに更新を通知
            const updateChapter = this.convertCharacterToChapter(updatedCharacter, 'appearance');
            await this.memoryManager.processChapter(updateChapter);

            return updatedCharacter;

        } catch (error) {
            this.logger.error('Failed to record character appearance', { error, characterId, chapterNumber });
            throw error;
        }
    }

    /**
     * キャラクター間のインタラクションを記録（統合記憶システム版）
     */
    async recordCharacterInteraction(
        characterId: string,
        targetCharacterId: string,
        chapterNumber: number,
        type: string,
        description: string,
        impact: number
    ): Promise<Character> {
        await this.ensureInitialized();

        try {
            const character = await this.getCharacter(characterId);
            if (!character) {
                throw new NotFoundError('Character', characterId);
            }

            const targetCharacter = await this.getCharacter(targetCharacterId);
            if (!targetCharacter) {
                throw new NotFoundError('Character', targetCharacterId);
            }

            // インタラクション記録を追加
            const interaction = {
                chapterNumber,
                targetCharacterId,
                type,
                description,
                impact,
                timestamp: new Date()
            };

            const updatedCharacter: Character = {
                ...character,
                state: {
                    ...character.state,
                    isActive: character.state?.isActive ?? true,
                    emotionalState: character.state?.emotionalState || 'NEUTRAL',
                    developmentStage: character.state?.developmentStage || 0,
                    lastAppearance: character.state?.lastAppearance || 0,
                    development: character.state?.development || 'Character interaction recorded'
                },
                history: {
                    appearances: character.history?.appearances || [],
                    interactions: [...(character.history?.interactions || []), interaction],
                    developmentPath: character.history?.developmentPath || []
                }
            };

            // 🔄 記憶システムに更新を通知
            const updateChapter = this.convertCharacterToChapter(updatedCharacter, 'interaction');
            await this.memoryManager.processChapter(updateChapter);

            return updatedCharacter;

        } catch (error) {
            this.logger.error('Failed to record character interaction', { error, characterId, targetCharacterId });
            throw error;
        }
    }

    /**
     * キャラクターの成長を処理する（統合記憶システム版）
     */
    async processCharacterDevelopment(characterId: string, chapterEvents: ChapterEvent[]): Promise<Character> {
        await this.ensureInitialized();

        try {
            const character = await this.getCharacter(characterId);
            if (!character) {
                throw new NotFoundError('Character', characterId);
            }

            // 🔄 従来のevolutionServiceと記憶システムを組み合わせ
            const developmentResult = await evolutionService.processCharacterDevelopment(character, chapterEvents);

            // developmentResultをCharacter型に適合させる
            const updatedCharacter: Character = {
                ...character,
                state: {
                    isActive: character.state?.isActive ?? true,
                    emotionalState: character.state?.emotionalState || 'NEUTRAL',
                    developmentStage: (character.state?.developmentStage || 0) + 1,
                    lastAppearance: character.state?.lastAppearance || 0,
                    development: `Updated via development process`
                },
                metadata: {
                    ...character.metadata,
                    lastUpdated: new Date()
                }
            };

            // 記憶システムに成長情報を記録
            const developmentChapter = this.convertCharacterToChapter(updatedCharacter, 'development');
            await this.memoryManager.processChapter(developmentChapter);

            return updatedCharacter;

        } catch (error) {
            this.logger.error('Failed to process character development', { error, characterId });
            throw error;
        }
    }

    /**
     * 生成された章からキャラクター情報を処理・更新する（統合記憶システム版）
     */
    async processGeneratedChapter(chapter: Chapter): Promise<void> {
        await this.ensureInitialized();

        try {
            this.logger.info(`Processing chapter ${chapter.chapterNumber} for character updates`);

            // 🔄 MemoryManagerの統合処理を利用
            const result = await this.memoryManager.processChapter(chapter);

            if (!result.success) {
                this.logger.warn('Chapter processing had issues', {
                    errors: result.errors,
                    warnings: result.warnings
                });
            }

            this.logger.info(`Chapter ${chapter.chapterNumber} character processing completed`);

        } catch (error) {
            this.logger.error(`Failed to process chapter ${chapter.chapterNumber}`, { error });
            throw error;
        }
    }

    // ============================================================================
    // 🔧 分析・診断機能（既存機能を維持）
    // ============================================================================

    /**
     * キャラクターを分析する
     */
    async analyzeCharacter(characterId: string): Promise<any> {
        await this.ensureInitialized();

        try {
            const character = await this.getCharacter(characterId);
            if (!character) {
                throw new NotFoundError('Character', characterId);
            }

            // 分析用の基礎データを準備
            const baseState = {
                id: character.id,
                name: character.name,
                type: character.type,
                description: character.description,
                personality: character.personality ? { ...character.personality } : {},
                state: character.state ? {
                    developmentStage: character.state.developmentStage || 0,
                    emotionalState: character.state.emotionalState || 'NEUTRAL'
                } : {}
            };

            // 🔄 従来の分析ツールを使用
            const characterDiff = characterAnalyzer.detectChanges(baseState, character);

            // 関連データを収集
            const parameters = await this.getCharacterParameters(characterId);
            const skills = await this.getCharacterSkills(characterId);
            const relationships = await this.getCharacterRelationships(characterId);

            const analysisResult = {
                basic: {
                    id: character.id,
                    name: character.name,
                    type: character.type,
                    description: character.description
                },
                state: character.state,
                changes: characterDiff.changes,
                parameters,
                skills,
                relationships,
                analysisTimestamp: new Date().toISOString()
            };

            return analysisResult;

        } catch (error) {
            this.logger.error('Failed to analyze character', { error, characterId });
            throw error;
        }
    }

    /**
     * 関係性グラフの分析
     */
    async getRelationshipAnalysis(): Promise<RelationshipAnalysis> {
        await this.ensureInitialized();

        try {
            return await relationshipService.analyzeRelationshipDynamics();
        } catch (error) {
            this.logger.error('Failed to get relationship analysis', { error });
            throw error;
        }
    }

    /**
     * キャラクターの関係性を更新する
     */
    async updateRelationship(
        char1Id: string,
        char2Id: string,
        type: string,
        strength: number
    ): Promise<void> {
        await this.ensureInitialized();

        try {
            await relationshipService.updateRelationship(char1Id, char2Id, type, strength);
        } catch (error) {
            this.logger.error('Failed to update relationship', { error, char1Id, char2Id });
            throw error;
        }
    }

    /**
     * キャラクターの登場タイミングを分析する
     */
    async analyzeAppearanceTiming(
        characterId: string,
        storyContext: StoryContext
    ): Promise<TimingRecommendation> {
        await this.ensureInitialized();

        try {
            const character = await this.getCharacter(characterId);
            if (!character) {
                throw new NotFoundError('Character', characterId);
            }

            return await timingAnalyzer.getTimingRecommendation(character, storyContext);
        } catch (error) {
            this.logger.error('Failed to analyze appearance timing', { error, characterId });
            throw error;
        }
    }

    /**
     * チャプターに推奨するキャラクターを取得する
     */
    async recommendCharactersForChapter(
        chapterNumber: number,
        narrativeState: NarrativeState,
        maxCharacters: number = 5
    ): Promise<{
        mainCharacters: { id: string; name: string; reason: string }[];
        supportingCharacters: { id: string; name: string; reason: string }[];
        backgroundCharacters: { id: string; name: string; reason: string }[];
    }> {
        await this.ensureInitialized();

        try {
            // 全キャラクター取得
            const allCharacters = await this.getAllCharacters();

            // キャラクタータイプで分類
            const mainCharacters = allCharacters.filter(char => char.type === 'MAIN');
            const subCharacters = allCharacters.filter(char => char.type === 'SUB');
            const mobCharacters = allCharacters.filter(char => char.type === 'MOB');

            // タイミング適切性の評価
            const timingScores = new Map<string, number>();
            for (const character of allCharacters) {
                const context: StoryContext = {
                    currentChapter: chapterNumber,
                    totalChapters: 50,
                    plotPoints: [],
                    storyPacing: narrativeState.pacing || 'MEDIUM',
                    currentArc: {
                        name: narrativeState.arc || 'Unknown',
                        theme: narrativeState.theme || 'Unknown',
                        approximateChapters: [
                            Math.max(1, chapterNumber - 5),
                            chapterNumber + 5
                        ] as [number, number]
                    },
                    recentAppearances: []
                };

                const timing = await timingAnalyzer.getTimingRecommendation(character, context);
                timingScores.set(character.id, this.calculateAppearanceScore(timing, character, narrativeState));
            }

            // 選定処理
            const selectedMainCharacters = this.selectCharactersWithScores(
                mainCharacters,
                timingScores,
                Math.min(3, mainCharacters.length),
                '物語の主要人物として'
            );

            const selectedSupportingCharacters = this.selectCharactersWithScores(
                subCharacters,
                timingScores,
                Math.min(3, maxCharacters - selectedMainCharacters.length),
                '重要な脇役として'
            );

            const remainingSlots = Math.max(0, maxCharacters - selectedMainCharacters.length - selectedSupportingCharacters.length);
            const selectedBackgroundCharacters = this.selectCharactersWithScores(
                mobCharacters,
                timingScores,
                remainingSlots,
                '背景キャラクターとして'
            );

            return {
                mainCharacters: selectedMainCharacters,
                supportingCharacters: selectedSupportingCharacters,
                backgroundCharacters: selectedBackgroundCharacters
            };

        } catch (error) {
            this.logger.error('Failed to recommend characters for chapter', { error, chapterNumber });
            return {
                mainCharacters: [],
                supportingCharacters: [],
                backgroundCharacters: []
            };
        }
    }

    // ============================================================================
    // 🔧 スキル・パラメータ管理（従来APIを活用）
    // ============================================================================

    /**
     * キャラクターのパラメータを初期化する
     */
    async initializeCharacterParameters(
        characterId: string,
        defaultValue: number = 10
    ): Promise<CharacterParameter[]> {
        await this.ensureInitialized();

        try {
            return await parameterService.initializeCharacterParameters(characterId, defaultValue);
        } catch (error) {
            this.logger.error('Failed to initialize character parameters', { error, characterId });
            throw error;
        }
    }

    /**
     * パラメータ値を設定する
     */
    async setParameterValue(
        characterId: string,
        parameterId: string,
        value: number
    ): Promise<CharacterParameter | null> {
        await this.ensureInitialized();

        try {
            return await parameterService.setParameterValue(characterId, parameterId, value);
        } catch (error) {
            this.logger.error('Failed to set parameter value', { error, characterId, parameterId });
            throw error;
        }
    }

    /**
     * パラメータ値を相対的に変更する
     */
    async modifyParameter(
        characterId: string,
        parameterId: string,
        delta: number
    ): Promise<CharacterParameter | null> {
        await this.ensureInitialized();

        try {
            return await parameterService.modifyParameter(characterId, parameterId, delta);
        } catch (error) {
            this.logger.error('Failed to modify parameter', { error, characterId, parameterId });
            throw error;
        }
    }

    /**
     * キャラクターにスキルを習得させる
     */
    async acquireSkill(
        characterId: string,
        skillId: string,
        forcedAcquisition: boolean = false
    ): Promise<boolean> {
        await this.ensureInitialized();

        try {
            return await skillService.acquireSkill(characterId, skillId, forcedAcquisition);
        } catch (error) {
            this.logger.error('Failed to acquire skill', { error, characterId, skillId });
            throw error;
        }
    }

    /**
     * キャラクターのスキルレベルを更新する
     */
    async updateSkillLevel(
        characterId: string,
        skillId: string,
        newLevel: number
    ): Promise<boolean> {
        await this.ensureInitialized();

        try {
            return await skillService.updateSkillLevel(characterId, skillId, newLevel);
        } catch (error) {
            this.logger.error('Failed to update skill level', { error, characterId, skillId });
            throw error;
        }
    }

    /**
     * スキルの習熟度を増加させる
     */
    async increaseSkillProficiency(
        characterId: string,
        skillId: string,
        amount: number
    ): Promise<boolean> {
        await this.ensureInitialized();

        try {
            return await skillService.increaseProficiency(characterId, skillId, amount);
        } catch (error) {
            this.logger.error('Failed to increase skill proficiency', { error, characterId, skillId });
            throw error;
        }
    }

    // ============================================================================
    // 🔧 成長計画管理（従来APIを活用）
    // ============================================================================

    /**
     * キャラクターに成長計画を追加する
     */
    async addGrowthPlan(
        characterId: string,
        plan: Omit<GrowthPlan, 'id' | 'characterId'>
    ): Promise<GrowthPlan> {
        await this.ensureInitialized();

        try {
            const character = await this.getCharacter(characterId);
            if (!character) {
                throw new NotFoundError('Character', characterId);
            }

            const createdPlan = await evolutionService.addGrowthPlan(characterId, plan);

            if (createdPlan.isActive) {
                await this.updateCharacter(characterId, {
                    state: {
                        ...character.state,
                        activeGrowthPlanId: createdPlan.id
                    } as CharacterState
                });
            }

            return createdPlan;

        } catch (error) {
            this.logger.error('Failed to add growth plan', { error, characterId });
            throw error;
        }
    }

    /**
     * キャラクターのアクティブな成長計画を設定する
     */
    async setActiveGrowthPlan(characterId: string, planId: string): Promise<void> {
        await this.ensureInitialized();

        try {
            const character = await this.getCharacter(characterId);
            if (!character) {
                throw new NotFoundError('Character', characterId);
            }

            await evolutionService.setActiveGrowthPlan(characterId, planId);

            await this.updateCharacter(characterId, {
                state: {
                    ...character.state,
                    activeGrowthPlanId: planId
                } as CharacterState
            });

        } catch (error) {
            this.logger.error('Failed to set active growth plan', { error, characterId, planId });
            throw error;
        }
    }

    /**
     * キャラクターに成長計画を適用する
     */
    async applyGrowthPlan(
        characterId: string,
        chapterNumber: number
    ): Promise<GrowthResult> {
        await this.ensureInitialized();

        try {
            return await evolutionService.applyGrowthPlan(characterId, chapterNumber);
        } catch (error) {
            this.logger.error('Failed to apply growth plan', { error, characterId, chapterNumber });
            throw error;
        }
    }

    // ============================================================================
    // 🔧 心理分析（従来APIを活用）
    // ============================================================================

    /**
     * キャラクターの心理分析を取得
     */
    async getCharacterPsychology(characterId: string, chapterNumber: number): Promise<any | null> {
        await this.ensureInitialized();

        try {
            const character = await this.getCharacter(characterId);
            if (!character) {
                throw new NotFoundError('Character', characterId);
            }

            const recentEvents = await this.getCharacterRecentEvents(characterId, 3);
            return await psychologyService.analyzeCharacterPsychology(character, recentEvents);

        } catch (error) {
            this.logger.error('Failed to get character psychology', { error, characterId, chapterNumber });
            return null;
        }
    }

    /**
     * キャラクターの行動を予測する
     */
    async predictCharacterAction(
        characterId: string,
        situation: string,
        options: string[]
    ): Promise<{
        mostLikelyAction: string;
        probability: number;
        alternatives: { action: string; probability: number }[];
        reasoning: string;
    }> {
        await this.ensureInitialized();

        try {
            const character = await this.getCharacter(characterId);
            if (!character) {
                throw new NotFoundError('Character', characterId);
            }

            const psychology = await this.getCharacterPsychology(characterId, character.state.lastAppearance || 1);
            return await psychologyService.predictBehaviors(character, psychology, [situation]);

        } catch (error) {
            this.logger.error('Failed to predict character action', { error, characterId });
            throw error;
        }
    }

    /**
     * キャラクター設定の検証
     */
    async validateCharacter(characterId: string): Promise<ValidationResult> {
        await this.ensureInitialized();

        try {
            const character = await this.getCharacter(characterId);
            if (!character) {
                throw new NotFoundError('Character', characterId);
            }

            return await this.performCharacterValidation(character);

        } catch (error) {
            this.logger.error('Failed to validate character', { error, characterId });
            throw error;
        }
    }

    /**
     * プロンプト用にキャラクターをフォーマットする
     */
    async formatCharactersForPrompt(
        characterIds: string[],
        detailLevel: "brief" | "standard" | "detailed" = "standard"
    ): Promise<string> {
        await this.ensureInitialized();

        try {
            const characters = await Promise.all(
                characterIds.map(id => this.getCharacter(id))
            );

            const validCharacters = characters.filter(Boolean) as Character[];
            const formattedCharacters = validCharacters.map(
                character => formatCharacterForPrompt(character, detailLevel)
            );

            return formattedCharacters.join('\n\n');

        } catch (error) {
            this.logger.error('Failed to format characters for prompt', { error, characterIds });
            return '';
        }
    }

    // ============================================================================
    // 🔧 スタブメソッド（従来のサービスとの互換性維持）
    // ============================================================================

    /**
     * キャラクターのスキルを取得する
     */
    async getCharacterSkills(characterId: string): Promise<Skill[]> {
        try {
            return await skillService.getCharacterSkills(characterId);
        } catch (error) {
            this.logger.warn('Failed to get character skills', { error, characterId });
            return [];
        }
    }

    /**
     * キャラクターのパラメータを取得する
     */
    async getCharacterParameters(characterId: string): Promise<CharacterParameter[]> {
        try {
            return await parameterService.getCharacterParameters(characterId);
        } catch (error) {
            this.logger.warn('Failed to get character parameters', { error, characterId });
            return [];
        }
    }

    /**
     * キャラクターの関係性データを取得する
     */
    async getCharacterRelationships(characterId: string): Promise<RelationshipResponse> {
        try {
            return await relationshipService.getCharacterRelationships(characterId);
        } catch (error) {
            this.logger.warn('Failed to get character relationships', { error, characterId });
            return { relationships: [] };
        }
    }

    /**
     * キャラクターのアクティブな成長計画を取得する
     */
    async getActiveGrowthPlan(characterId: string): Promise<GrowthPlan | null> {
        try {
            return await evolutionService.getActiveGrowthPlan(characterId);
        } catch (error) {
            this.logger.warn('Failed to get active growth plan', { error, characterId });
            return null;
        }
    }

    /**
     * キャラクターの最近のイベントを取得
     */
    async getCharacterRecentEvents(characterId: string, limit: number = 3): Promise<any[]> {
        try {
            // 統一検索を使用して最近のイベントを取得
            const searchResult = await this.memoryManager.unifiedSearch(
                `character events:"${characterId}"`,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
            );

            if (searchResult.success) {
                return searchResult.results.slice(0, limit).map((result: any) => ({
                    chapter: result.metadata?.chapterNumber || 0,
                    event: result.data?.description || 'Event information'
                }));
            }

            return [];
        } catch (error) {
            this.logger.warn('Failed to get character recent events', { error, characterId });
            return [];
        }
    }

    // ============================================================================
    // プライベートヘルパーメソッド
    // ============================================================================

    /**
     * 検索結果からCharacterWithDetailsを構築
     * @private
     */
    private async buildCharacterWithDetailsFromSearchResult(
        result: any,
        chapterNumber?: number
    ): Promise<CharacterWithDetails | null> {
        try {
            const characterData = result.data;
            if (!characterData || !characterData.id) return null;

            // 基本情報の取得
            const characterId = characterData.id;

            // 並列でキャラクターの詳細情報を取得
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
                summary: event.event || 'イベント情報なし'
            }));

            return {
                id: characterData.id || characterId,
                name: characterData.name || 'Unknown Character',
                description: characterData.description || '',
                type: characterData.type || 'MAIN',
                emotionalState: characterData.state?.emotionalState || 'NEUTRAL',
                skills: this.extractSettledValue(skills, []).map((skill: Skill) => ({
                    name: skill.name,
                    level: skill.level
                })),
                parameters: this.extractSettledValue(parameters, []).map((param: CharacterParameter) => ({
                    name: param.name,
                    value: param.value
                })),
                growthPhase: currentPhase,
                relationships: formattedRelationships,
                recentAppearances: formattedAppearances,
                personality: characterData.personality ? {
                    traits: characterData.personality.traits || [],
                    goals: characterData.personality.goals || [],
                    fears: characterData.personality.fears || []
                } : undefined,
                state: {
                    isActive: characterData.state?.isActive ?? true,
                    developmentStage: characterData.state?.developmentStage || 0,
                    lastAppearance: characterData.state?.lastAppearance || 0,
                    activeGrowthPlanId: characterData.state?.activeGrowthPlanId
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
     * 検索結果からCharacterを変換
     * @private
     */
    private convertSearchResultToCharacter(result: any): Character | null {
        if (!result?.data) return null;

        try {
            const data = result.data;
            return {
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
                    lastUpdated: data.metadata?.lastUpdated ? new Date(data.metadata.lastUpdated) : new Date()
                }
            };
        } catch (error) {
            this.logger.error('Failed to convert search result to Character', { error });
            return null;
        }
    }

    /**
     * キャラクターを章形式に変換（記憶システムでの処理用）
     * @private
     */
    private convertCharacterToChapter(character: Character, action: string = 'create'): Chapter {
        return {
            id: `character-${action}-${character.id}`,
            chapterNumber: 0,
            title: `Character ${action}: ${character.name}`,
            content: `Character data for ${character.name} (${character.type})`,
            createdAt: new Date(),
            updatedAt: new Date(),
            wordCount: 0,
            summary: `Character ${action} operation`,
            metadata: {
                qualityScore: 1.0,
                keywords: ['character', action, character.name],
                events: [],
                characters: [character.id],
                foreshadowing: [],
                resolutions: [],
                correctionHistory: [],
                pov: 'システム',
                location: 'キャラクター管理',
                emotionalTone: 'neutral',
                characterData: character
            }
        };
    }

    /**
     * コンテンツからキーワードを抽出
     * @private
     */
    private extractKeywordsFromContent(content: string): string[] {
        // 基本的なキーワード抽出（名詞、動詞などを対象）
        const words = content.split(/\s+/)
            .filter(word => word.length > 2)
            .slice(0, 10); // 最初の10個まで

        return words;
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
     * 関係性情報のフォーマット
     * @private
     */
    private async formatRelationshipsForDetails(
        relationships: any[]
    ): Promise<Array<{
        targetCharacterId: string;
        targetCharacterName: string;
        relationshipType: string;
        strength: number;
    }>> {
        const formatted = [];

        for (const rel of relationships) {
            try {
                const targetCharacter = await this.getCharacter(rel.targetCharacterId);

                formatted.push({
                    targetCharacterId: rel.targetCharacterId,
                    targetCharacterName: targetCharacter?.name || 'Unknown Character',
                    relationshipType: rel.type || 'unknown',
                    strength: rel.strength || 0.5
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

    /**
     * フォールバック用簡易キャラクター詳細情報の作成
     * @private
     */
    private async createFallbackCharactersWithDetails(
        characterIds?: string[]
    ): Promise<CharacterWithDetails[]> {
        try {
            this.logger.info('Creating fallback characters with details');
            return [];
        } catch (error) {
            this.logger.error('Failed to create fallback characters with details', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * キャラクター検証の実行
     * @private
     */
    private async performCharacterValidation(character: Character): Promise<ValidationResult> {
        const warnings: string[] = [];

        if (!character.name || character.name.trim().length === 0) {
            warnings.push('Character name is required');
        }

        if (!character.description || character.description.trim().length === 0) {
            warnings.push('Character description is empty');
        }

        if (!character.personality?.traits || character.personality.traits.length === 0) {
            warnings.push('Character has no personality traits');
        }

        return {
            isValid: warnings.length === 0,
            warnings,
            suggestions: warnings.length > 0 ? ['Consider adding more character details'] : []
        };
    }

    /**
     * 登場スコアの計算
     * @private
     */
    private calculateAppearanceScore(
        timing: TimingRecommendation,
        character: Character,
        narrativeState: NarrativeState
    ): number {
        let score = 0.5;

        const lastAppearance = character.state.lastAppearance || 0;

        if (timing.recommendedChapter === lastAppearance) {
            score = 0.3;
        } else if (timing.recommendedChapter === lastAppearance + 1) {
            score = 0.8;
        } else if (timing.alternatives.includes(lastAppearance + 1)) {
            score = 0.6;
        } else {
            score = 0.4;
        }

        if (character.type === 'MAIN') {
            score += 0.3;
        }

        if (narrativeState.theme && character.personality?.traits) {
            const theme = narrativeState.theme.toLowerCase();
            const traits = character.personality.traits.map(t => t.toLowerCase());

            const hasRelevantTrait = traits.some(trait => theme.includes(trait) || trait.includes(theme));
            if (hasRelevantTrait) {
                score += 0.2;
            }
        }

        return Math.min(1.0, score);
    }

    /**
     * スコア付きキャラクター選択
     * @private
     */
    private selectCharactersWithScores(
        characters: Character[],
        scores: Map<string, number>,
        count: number,
        reasonPrefix: string
    ): { id: string; name: string; reason: string }[] {
        if (count <= 0) return [];

        const scoredCharacters = characters.map(char => ({
            id: char.id,
            name: char.name,
            score: scores.get(char.id) || 0
        }));

        scoredCharacters.sort((a, b) => b.score - a.score);

        return scoredCharacters.slice(0, count).map(c => ({
            id: c.id,
            name: c.name,
            reason: `${reasonPrefix} (スコア: ${c.score.toFixed(2)})`
        }));
    }

    /**
     * キャラクターIDを生成
     * @private
     */
    private generateCharacterId(): string {
        return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // ============================================================================
    // 🔧 章全体のキャラクター成長処理（統合記憶システム版）
    // ============================================================================

    /**
     * 章全体のキャラクター成長を処理
     */
    async processAllCharacterGrowth(
        chapterNumber: number,
        chapterContent: string
    ): Promise<{
        updatedCharacters: Array<{
            id: string;
            name: string;
            growthPhase: string | null;
            parameterChanges: Array<{ name: string; change: number; }>;
            skillAcquisitions: Array<{ name: string; }>;
        }>;
    }> {
        await this.ensureInitialized();

        try {
            // 章に登場したキャラクターを検出
            const detectedCharacters = await this.detectCharactersInContent(chapterContent);
            const updatedCharacters = [];

            // 各キャラクターの成長を処理
            for (const character of detectedCharacters) {
                try {
                    // 成長計画を適用
                    const growthResult = await this.applyGrowthPlan(character.id, chapterNumber);

                    // 登場記録を更新
                    await this.recordCharacterAppearance(character.id, chapterNumber,
                        `${character.name}が章${chapterNumber}に登場`, 0.5);

                    // 結果を記録
                    updatedCharacters.push({
                        id: character.id,
                        name: character.name,
                        growthPhase: growthResult.completedPhase || null,
                        parameterChanges: Object.entries(growthResult.parameterChanges).map(([paramId, values]) => ({
                            name: paramId,
                            change: values.after - values.before
                        })),
                        skillAcquisitions: growthResult.acquiredSkills.map(skillId => ({
                            name: skillId
                        }))
                    });
                } catch (error) {
                    this.logger.error(`キャラクター ${character.name} の成長処理中にエラーが発生しました`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }

            return { updatedCharacters };

        } catch (error) {
            this.logger.error('Failed to process all character growth', { error, chapterNumber });
            return { updatedCharacters: [] };
        }
    }

    /**
     * 章の生成前にキャラクター情報を収集して提供する
     */
    async prepareCharacterInfoForChapterGeneration(
        chapterNumber: number
    ): Promise<{
        mainCharacters: Array<{
            id: string;
            name: string;
            description: string;
            emotionalState: string;
            skills: Array<{ name: string; level: number; }>;
            parameters: Array<{ name: string; value: number; }>;
            growthPhase: string | null;
        }>;
        supportingCharacters: Array<any>;
    }> {
        await this.ensureInitialized();

        try {
            const narrativeContext: NarrativeContext = {
                pacing: 'MEDIUM',
                arc: 'CURRENT_ARC',
                theme: 'DEVELOPMENT'
            };

            const recommendedChars = await contentAnalysisManager.getCharacterRecommendations(
                chapterNumber,
                narrativeContext,
                8
            );

            // メインキャラクターの詳細情報を収集
            const mainCharacters = await Promise.all(
                recommendedChars.mainCharacters.map(async (rec: CharacterRecommendation) => {
                    const character = await this.getCharacter(rec.id);
                    if (!character) return null;

                    const skills = await this.getCharacterSkills(rec.id);
                    const parameters = await this.getCharacterParameters(rec.id);
                    const activePlan = await this.getActiveGrowthPlan(rec.id);

                    let currentPhase = null;
                    if (activePlan) {
                        const phaseResult = activePlan.growthPhases.find(phase =>
                            phase.chapterEstimate[0] <= chapterNumber &&
                            phase.chapterEstimate[1] >= chapterNumber
                        );
                        currentPhase = phaseResult?.name || null;
                    }

                    return {
                        id: character.id,
                        name: character.name,
                        description: character.description,
                        emotionalState: character.state.emotionalState,
                        skills: skills.map(skill => ({
                            name: skill.name,
                            level: skill.level
                        })),
                        parameters: parameters.map(param => ({
                            name: param.name,
                            value: param.value
                        })),
                        growthPhase: currentPhase
                    };
                })
            );

            // サポートキャラクターの情報を収集
            const supportingCharacters = await Promise.all(
                recommendedChars.supportingCharacters.map(async (rec: CharacterRecommendation) => {
                    const character = await this.getCharacter(rec.id);
                    if (!character) return null;

                    const skills = await this.getCharacterSkills(rec.id);
                    const topSkills = skills
                        .sort((a, b) => b.level - a.level)
                        .slice(0, 3);

                    const parameters = await this.getCharacterParameters(rec.id);
                    const topParameters = parameters
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 5);

                    return {
                        id: character.id,
                        name: character.name,
                        description: character.description,
                        emotionalState: character.state.emotionalState,
                        skills: topSkills.map(skill => ({
                            name: skill.name,
                            level: skill.level
                        })),
                        parameters: topParameters.map(param => ({
                            name: param.name,
                            value: param.value
                        })),
                        growthPhase: null
                    };
                })
            );

            return {
                mainCharacters: mainCharacters.filter(Boolean) as any[],
                supportingCharacters: supportingCharacters.filter(Boolean) as any[]
            };

        } catch (error) {
            this.logger.error('Failed to prepare character info for chapter generation', { error, chapterNumber });
            return {
                mainCharacters: [],
                supportingCharacters: []
            };
        }
    }
}

// シングルトンインスタンスをエクスポート（非推奨：DI推奨）
// export const characterManager = CharacterManager.getInstance();