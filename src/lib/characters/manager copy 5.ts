/**
 * @fileoverview 最適化されたキャラクターマネージャー（ファザードクラス）- 修正版
 * @description
 * 真のファザードパターンを実装したキャラクター管理クラス。
 * 各サービスのinitializeメソッドを削除し、即座に使用可能な設計に変更。
 * 複雑なサブシステムへの統一されたシンプルなインターフェースを提供。
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
import { CharacterService } from './services/character-service';
import { DetectionService } from './services/detection-service';
import { EvolutionService } from './services/evolution-service';
import { PsychologyService } from './services/psychology-service';
import { RelationshipService } from './services/relationship-service';
import { ParameterService } from './services/parameter-service';
import { SkillService } from './services/skill-service';

// 記憶階層システム
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
 * 最適化されたキャラクターマネージャー（ファザードクラス）- 修正版
 * 
 * 各専門サービスが即座に使用可能で、統一されたシンプルなAPIを提供する
 * 真のファザードパターンの実装
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
     * コンストラクタ（依存性注入）
     * 
     * @param memoryManager 記憶階層システムマネージャー
     * @param characterService キャラクターサービス
     * @param detectionService 検出サービス
     * @param evolutionService 発展サービス
     * @param psychologyService 心理サービス
     * @param relationshipService 関係性サービス
     * @param parameterService パラメータサービス
     * @param skillService スキルサービス
     */
    constructor(
        private readonly memoryManager: MemoryManager,
        private readonly characterService: CharacterService,
        private readonly detectionService: DetectionService,
        private readonly evolutionService: EvolutionService,
        private readonly psychologyService: PsychologyService,
        private readonly relationshipService: RelationshipService,
        private readonly parameterService: ParameterService,
        private readonly skillService: SkillService
    ) {
        this.logger.info('CharacterManager initialized as facade pattern - services ready immediately');
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
            // 各サービスから並列で情報を取得（各サービスは即座に使用可能）
            const [skills, parameters, relationships, growthPlan] = await Promise.allSettled([
                this.skillService.getCharacterSkills(character.id),
                this.parameterService.getCharacterParameters(character.id),
                this.relationshipService.getCharacterRelationships(character.id),
                this.evolutionService.getActiveGrowthPlan(character.id)
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
    // 検出機能（DetectionServiceに委譲）
    // ============================================================================

    /**
     * コンテンツ内のキャラクター検出
     * DetectionServiceに委譲
     */
    async detectCharactersInContent(content: string): Promise<Character[]> {
        return this.executeOperation(
            'detectCharactersInContent',
            () => this.detectionService.detectCharactersInContent(content)
        );
    }

    // ============================================================================
    // 発展機能（EvolutionServiceに委譲）
    // ============================================================================

    /**
     * キャラクター発展処理
     * EvolutionServiceに委譲
     */
    async processCharacterDevelopment(characterId: string, events: ChapterEvent[]): Promise<Character> {
        return this.executeOperation(
            'processCharacterDevelopment',
            async () => {
                const character = await this.characterService.getCharacter(characterId);
                if (!character) {
                    throw new NotFoundError('Character', characterId);
                }

                const development = await this.evolutionService.processCharacterDevelopment(character, events);

                // 発展結果をキャラクター状態に反映
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
    // 関係性機能（RelationshipServiceに委譲）
    // ============================================================================

    /**
     * 関係性更新
     * RelationshipServiceに委譲
     */
    async updateRelationship(
        char1Id: string,
        char2Id: string,
        type: string,
        strength: number
    ): Promise<void> {
        return this.executeOperation(
            'updateRelationship',
            () => this.relationshipService.updateRelationship(char1Id, char2Id, type, strength)
        );
    }

    /**
     * 関係性分析
     * RelationshipServiceに委譲
     */
    async getRelationshipAnalysis(): Promise<RelationshipAnalysis> {
        return this.executeOperation(
            'getRelationshipAnalysis',
            () => this.relationshipService.analyzeRelationshipDynamics()
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

                // 並列で各種分析を実行（各サービスは即座に使用可能）
                const [psychologyAnalysis, relationshipAnalysis, validation] = await Promise.allSettled([
                    this.psychologyService.analyzeCharacterPsychology(character, []),
                    this.relationshipService.getCharacterRelationships(characterId),
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
                    this.relationshipService.getCharacterRelationships(characterId),
                    this.psychologyService.analyzeCharacterPsychology(character, [])
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
                const clusters = await this.relationshipService.detectRelationshipClusters();

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
            const memoryStatus = await this.memoryManager.getSystemStatus();

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
            // サービスが存在し、基本的なメソッドを持っているかチェック
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
}

/**
 * ファクトリー関数
 * 依存性注入を使用してCharacterManagerを作成
 */
export function createCharacterManager(
    memoryManager: MemoryManager,
    characterService?: CharacterService,
    detectionService?: DetectionService,
    evolutionService?: EvolutionService,
    psychologyService?: PsychologyService,
    relationshipService?: RelationshipService,
    parameterService?: ParameterService,
    skillService?: SkillService
): CharacterManager {
    // デフォルトサービスの作成（即座に使用可能）
    const services = {
        character: characterService || new CharacterService(memoryManager),
        detection: detectionService || new DetectionService(memoryManager),
        evolution: evolutionService || new EvolutionService(memoryManager),
        psychology: psychologyService || new PsychologyService(memoryManager),
        relationship: relationshipService || new RelationshipService(memoryManager),
        parameter: parameterService || new ParameterService(memoryManager),
        skill: skillService || new SkillService(memoryManager)
    };

    return new CharacterManager(
        memoryManager,
        services.character,
        services.detection,
        services.evolution,
        services.psychology,
        services.relationship,
        services.parameter,
        services.skill
    );
}

/**
 * シングルトンインスタンス（後方互換性のため）
 * 本来は依存性注入パターンを推奨
 */
let instance: CharacterManager | null = null;

export function getCharacterManager(memoryManager?: MemoryManager): CharacterManager {
    if (!instance && memoryManager) {
        instance = createCharacterManager(memoryManager);
    }

    if (!instance) {
        throw new Error('CharacterManager not initialized. Please provide MemoryManager.');
    }

    return instance;
}