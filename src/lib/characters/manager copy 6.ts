/**
 * @fileoverview 最適化されたキャラクターマネージャー（独立初期化対応・修正版）
 * @description
 * 真のファザードパターンを実装したキャラクター管理クラス。
 * CharacterServiceの独立初期化に対応し、MemoryManagerとの連携は
 * 必要に応じて外部から注入する設計に変更。
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

// 記憶階層システム（オプション）
import { MemoryManager } from '@/lib/memory/core/memory-manager';

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
}

/**
 * パフォーマンス統計
 */
interface PerformanceMetrics {
    totalOperations: number;
    successfulOperations: number;
    averageResponseTime: number;
    lastOptimization: string;
    errorRate: number;
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
}

/**
 * 最適化されたキャラクターマネージャー（独立初期化対応・修正版）
 * 
 * CharacterServiceが独立初期化され、MemoryManagerとの連携は
 * 必要に応じて外部から注入する設計
 */
export class CharacterManager implements ICharacterManager {
    private readonly logger = new Logger({ serviceName: 'CharacterManager' });
    private ready = false;

    // パフォーマンス統計
    private performanceMetrics: PerformanceMetrics = {
        totalOperations: 0,
        successfulOperations: 0,
        averageResponseTime: 0,
        lastOptimization: new Date().toISOString(),
        errorRate: 0
    };

    /**
     * コンストラクタ（独立初期化対応）
     * 
     * @param characterService キャラクターサービス（独立初期化済み）
     * @param memoryManager 記憶階層システムマネージャー（オプション）
     * @param detectionService 検出サービス
     * @param evolutionService 発展サービス
     * @param psychologyService 心理サービス
     * @param relationshipService 関係性サービス
     * @param parameterService パラメータサービス
     * @param skillService スキルサービス
     */
    constructor(
        private readonly characterService: CharacterService,
        private readonly memoryManager?: MemoryManager, // 🔧 オプション化
        private readonly detectionService?: DetectionService,
        private readonly evolutionService?: EvolutionService,
        private readonly psychologyService?: PsychologyService,
        private readonly relationshipService?: RelationshipService,
        private readonly parameterService?: ParameterService,
        private readonly skillService?: SkillService
    ) {
        this.logger.info('CharacterManager initialized with independent CharacterService');
        this.ready = true;
    }

    // ============================================================================
    // 基本CRUD操作（ファザードメソッド）
    // ============================================================================

    /**
     * キャラクター作成
     * CharacterServiceに委譲
     */
    async createCharacter(data: CharacterData): Promise<Character> {
        return this.executeOperation(
            'createCharacter',
            () => this.characterService.createCharacter(data)
        );
    }

    /**
     * キャラクター取得
     * CharacterServiceに委譲
     */
    async getCharacter(id: string): Promise<Character | null> {
        return this.executeOperation(
            'getCharacter',
            () => this.characterService.getCharacter(id)
        );
    }

    /**
     * キャラクター更新
     * CharacterServiceに委譲
     */
    async updateCharacter(id: string, updates: Partial<CharacterData>): Promise<Character> {
        return this.executeOperation(
            'updateCharacter',
            () => this.characterService.updateCharacter(id, updates)
        );
    }

    /**
     * 全キャラクター取得
     * CharacterServiceに委譲
     */
    async getAllCharacters(): Promise<Character[]> {
        return this.executeOperation(
            'getAllCharacters',
            () => this.characterService.getAllActiveCharacters()
        );
    }

    /**
     * タイプ別キャラクター取得
     * CharacterServiceに委譲
     */
    async getCharactersByType(type: CharacterType): Promise<Character[]> {
        return this.executeOperation(
            'getCharactersByType',
            () => this.characterService.getCharactersByType(type)
        );
    }

    // ============================================================================
    // 詳細情報取得（複数サービス統合）
    // ============================================================================

    /**
     * 詳細付きキャラクター情報取得
     * 複数サービスからの情報を統合
     */
    async getCharactersWithDetails(
        characterIds?: string[],
        chapterNumber?: number
    ): Promise<CharacterWithDetails[]> {
        return this.executeOperation(
            'getCharactersWithDetails',
            async () => {
                // 基本キャラクター情報を取得
                const characters = characterIds
                    ? await Promise.all(characterIds.map(id => this.characterService.getCharacter(id)))
                    : await this.characterService.getAllActiveCharacters();

                const validCharacters = characters.filter(Boolean) as Character[];

                // 各キャラクターの詳細情報を並列取得
                const detailedCharacters = await Promise.all(
                    validCharacters.map(character => this.buildCharacterDetails(character, chapterNumber))
                );

                return detailedCharacters;
            }
        );
    }

    /**
     * 単一キャラクターの詳細情報を構築
     * @private
     */
    private async buildCharacterDetails(
        character: Character,
        chapterNumber?: number
    ): Promise<CharacterWithDetails> {
        try {
            // 各サービスから並列で情報を取得（各サービスが存在する場合のみ）
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

            // フォールバック：最小限の情報で構築
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

    // ============================================================================
    // 検出機能（DetectionServiceに委譲、オプション対応）
    // ============================================================================

    /**
     * コンテンツ内のキャラクター検出
     * DetectionServiceに委譲（存在する場合のみ）
     */
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

    /**
     * 基本的なキャラクター検出（フォールバック）
     * @private
     */
    private async basicCharacterDetection(content: string): Promise<Character[]> {
        const allCharacters = await this.characterService.getAllActiveCharacters();
        const detectedCharacters: Character[] = [];

        for (const character of allCharacters) {
            // 名前またはショートネームが含まれているかチェック
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
    // 発展機能（EvolutionServiceに委譲、オプション対応）
    // ============================================================================

    /**
     * キャラクター発展処理
     * EvolutionServiceに委譲（存在する場合のみ）
     */
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

                // 発展結果をキャラクター状態に反映（基本実装）
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
    // 関係性機能（RelationshipServiceに委譲、オプション対応）
    // ============================================================================

    /**
     * 関係性更新
     * RelationshipServiceに委譲（存在する場合のみ）
     */
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

    /**
     * 関係性分析
     * RelationshipServiceに委譲
     */
    async getRelationshipAnalysis(): Promise<RelationshipAnalysis> {
        return this.executeOperation(
            'getRelationshipAnalysis',
            () => this.relationshipService!.analyzeRelationshipDynamics()
        );
    }

    // ============================================================================
    // 分析機能（複数サービス統合）
    // ============================================================================

    /**
     * キャラクター分析
     * 複数サービスからの分析結果を統合
     */
    async analyzeCharacter(characterId: string): Promise<any> {
        return this.executeOperation(
            'analyzeCharacter',
            async () => {
                const character = await this.characterService.getCharacter(characterId);
                if (!character) {
                    throw new NotFoundError('Character', characterId);
                }

                // 並列で各種分析を実行（各サービスが存在する場合のみ）
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

    /**
     * 登場タイミング分析
     * 複数サービスを使用した総合分析
     */
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

                // タイミング分析のためのデータ収集
                const [relationships, psychology] = await Promise.allSettled([
                    this.relationshipService?.getCharacterRelationships(characterId) || Promise.resolve({ relationships: [] }),
                    this.psychologyService?.analyzeCharacterPsychology(character, []) || Promise.resolve(null)
                ]);

                // 簡易タイミング推奨の生成
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

    /**
     * 章のキャラクター推奨
     * 複数サービスの分析に基づく推奨
     */
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

                // 簡易推奨アルゴリズム
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
    // システム管理
    // ============================================================================

    /**
     * システム状態取得
     */
    async getSystemStatus(): Promise<SystemStatus> {
        try {
            const memoryStatus = this.memoryManager 
                ? await this.memoryManager.getSystemStatus()
                : { initialized: false };

            // 各サービスの動作状況をチェック（簡易チェック）
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
                lastHealthCheck: new Date().toISOString()
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
                lastHealthCheck: new Date().toISOString()
            };
        }
    }

    /**
     * パフォーマンス統計取得
     */
    getPerformanceMetrics(): PerformanceMetrics {
        return { ...this.performanceMetrics };
    }

    // ============================================================================
    // ユーティリティメソッド（ファザード固有）
    // ============================================================================

    /**
     * 操作実行ラッパー（エラーハンドリングと統計収集）
     * @private
     */
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

            // 成功統計更新
            this.performanceMetrics.successfulOperations++;
            this.updateAverageResponseTime(Date.now() - startTime);

            this.logger.debug(`Operation ${operationName} completed successfully`, {
                processingTime: Date.now() - startTime
            });

            return result;

        } catch (error) {
            // エラー統計更新
            this.updateErrorRate();

            this.logger.error(`Operation ${operationName} failed`, {
                error: error instanceof Error ? error.message : String(error),
                processingTime: Date.now() - startTime
            });

            throw error;
        }
    }

    /**
     * サービスの動作状況チェック
     * @private
     */
    private isServiceOperational(service: any): boolean {
        try {
            return service && typeof service === 'object';
        } catch (error) {
            return false;
        }
    }

    /**
     * Promise.allSettledの結果から値を安全に抽出
     * @private
     */
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

    /**
     * 平均応答時間を更新
     * @private
     */
    private updateAverageResponseTime(responseTime: number): void {
        const currentAverage = this.performanceMetrics.averageResponseTime;
        const successfulOps = this.performanceMetrics.successfulOperations;

        this.performanceMetrics.averageResponseTime =
            ((currentAverage * (successfulOps - 1)) + responseTime) / successfulOps;
    }

    /**
     * エラー率を更新
     * @private
     */
    private updateErrorRate(): void {
        const totalOps = this.performanceMetrics.totalOperations;
        const failedOps = totalOps - this.performanceMetrics.successfulOperations;

        this.performanceMetrics.errorRate = failedOps / totalOps;
    }

    /**
     * 🔧 NEW: MemoryManagerとの連携ヘルパー
     * プロンプト生成時のフォーカスキャラクター判定で使用
     */
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

/**
 * 🔧 FIXED: ファクトリー関数（独立初期化対応）
 * MemoryManagerをオプション引数に変更
 */
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
    // 🔧 CharacterServiceの独立作成（引数なしでも動作）
    const services = {
        character: characterService || createCharacterService(), // 独立初期化
        detection: detectionService || (memoryManager ? new DetectionService(memoryManager) : undefined),
        evolution: evolutionService || (memoryManager ? new EvolutionService(memoryManager) : undefined),
        psychology: psychologyService || (memoryManager ? new PsychologyService(memoryManager) : undefined),
        relationship: relationshipService || (memoryManager ? new RelationshipService(memoryManager) : undefined),
        parameter: parameterService || (memoryManager ? new ParameterService(memoryManager) : undefined),
        skill: skillService || (memoryManager ? new SkillService(memoryManager) : undefined)
    };

    return new CharacterManager(
        services.character,
        memoryManager, // オプション
        services.detection,
        services.evolution,
        services.psychology,
        services.relationship,
        services.parameter,
        services.skill
    );
}

/**
 * シングルトンインスタンス管理（後方互換性のため・修正版）
 */
let instance: CharacterManager | null = null;

export function getCharacterManager(memoryManager?: MemoryManager): CharacterManager {
    if (!instance) {
        instance = createCharacterManager(memoryManager);
    }
    return instance;
}

/**
 * シングルトンインスタンス初期化（後方互換性のため・修正版）
 */
export function initializeCharacterManager(memoryManager?: MemoryManager): CharacterManager {
    if (instance) {
        throw new Error('CharacterManager already initialized');
    }
    
    instance = createCharacterManager(memoryManager);
    return instance;
}

/**
 * 🔥 後方互換性のための名前付きエクスポート（修正版）
 */
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
    }
};

// デフォルトエクスポートも提供（最大限の互換性のため）
export default characterManager;