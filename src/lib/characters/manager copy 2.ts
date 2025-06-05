/**
 * @fileoverview キャラクター管理ファサード（修正版）
 * @description
 * 未実装メソッド getCharactersWithDetails を追加し、
 * ContextGenerator からの呼び出しエラーを解決します。
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
    ValidationResult,
    CharacterState,
    CharacterType,
    NarrativeContext,
    NarrativeState,
    CharacterRecommendation
} from './core/types';
import { ICharacterManager } from './core/interfaces';
import { NotFoundError } from './core/errors';
import { Chapter } from '@/types/chapters'; // または

// サービスのインポート
import { characterService } from './services/character-service';
import { detectionService } from './services/detection-service';
import { evolutionService } from './services/evolution-service';
import { relationshipService } from './services/relationship-service';
import { parameterService } from './services/parameter-service';
import { skillService } from './services/skill-service';
import { psychologyService } from './services/psychology-service';
import { characterRepository } from './repositories/character-repository';
import { timingAnalyzer } from './analyzers/timing-analyzer';
import { characterAnalyzer } from './analyzers/character-analyzer';
import { contentAnalysisManager } from '@/lib/analysis/content-analysis-manager';

// ユーティリティのインポート
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
 * キャラクター管理ファサードクラス（修正版）
 * 外部向けのシンプルなAPIを提供し、内部で各種サービスに処理を委譲します
 */
export class CharacterManager implements ICharacterManager {
    private readonly logger = new Logger({ serviceName: 'CharacterManager' });
    private static instance: CharacterManager;
    private initialized = false;
    private initializationPromise: Promise<void> | null = null;

    /**
     * プライベートコンストラクタ（シングルトンパターン）
     */
    private constructor() {
        this.logger.info('CharacterManager: 初期化開始（修正版）');
        this.initializationPromise = this.initialize();
    }

    /**
     * シングルトンインスタンスの取得
     * @returns CharacterManager インスタンス
     */
    public static getInstance(): CharacterManager {
        if (!CharacterManager.instance) {
            CharacterManager.instance = new CharacterManager();
        }
        return CharacterManager.instance;
    }

    /**
     * 初期化処理
     * @private
     */
    private async initialize(): Promise<void> {
        try {
            // 各サービスの初期化を待機（必要に応じて）
            // Note: 実際のサービス初期化方法に応じて調整
            this.initialized = true;
            this.logger.info('CharacterManager: 初期化完了（修正版）');
        } catch (error) {
            this.logger.error('CharacterManager: 初期化失敗', { error });
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

    /**
     * 🔧 修正：詳細付きキャラクター情報を取得
     * 
     * ContextGenerator で呼び出される `getCharactersWithDetails` メソッドを実装。
     * 既存の機能を活用して包括的なキャラクター情報を提供します。
     * 
     * @param characterIds キャラクターIDの配列（オプション）
     * @param chapterNumber 現在の章番号（オプション）
     * @returns 詳細付きキャラクター情報の配列
     */
    async getCharactersWithDetails(
        characterIds?: string[],
        chapterNumber?: number
    ): Promise<CharacterWithDetails[]> {
        await this.ensureInitialized();

        try {
            this.logger.info('getCharactersWithDetails called', {
                characterIds: characterIds?.length || 'all',
                chapterNumber
            });

            // 対象キャラクターの決定
            let targetCharacters: Character[] = [];

            if (characterIds && characterIds.length > 0) {
                // 指定されたIDのキャラクターを取得
                targetCharacters = await Promise.all(
                    characterIds.map(async (id) => {
                        const character = await this.getCharacter(id);
                        return character;
                    })
                ).then(chars => chars.filter(Boolean) as Character[]);
            } else {
                // 全キャラクターを取得
                targetCharacters = await this.getAllCharacters();
            }

            if (targetCharacters.length === 0) {
                this.logger.warn('No characters found for getCharactersWithDetails');
                return [];
            }

            // 各キャラクターの詳細情報を並列で取得
            const detailedCharacters = await Promise.all(
                targetCharacters.map(character => this.buildCharacterWithDetails(character, chapterNumber))
            );

            // エラーが発生したキャラクターを除外
            const validDetailedCharacters = detailedCharacters.filter(Boolean) as CharacterWithDetails[];

            this.logger.info(`getCharactersWithDetails completed`, {
                requested: targetCharacters.length,
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
     * 🔧 修正：単一キャラクターの詳細情報構築
     * 
     * @private
     * @param character ベースキャラクター
     * @param chapterNumber 章番号
     * @returns 詳細付きキャラクター情報
     */
    private async buildCharacterWithDetails(
        character: Character,
        chapterNumber?: number
    ): Promise<CharacterWithDetails | null> {
        try {
            // 並列でキャラクターの詳細情報を取得
            const [
                skills,
                parameters,
                relationships,
                activePlan,
                recentAppearances
            ] = await Promise.allSettled([
                this.getCharacterSkills(character.id).catch(() => []),
                this.getCharacterParameters(character.id).catch(() => []),
                this.getCharacterRelationships(character.id).catch(() => ({ relationships: [] })),
                this.getActiveGrowthPlan(character.id).catch(() => null),
                this.getCharacterRecentEvents(character.id, 5).catch(() => [])
            ]);

            // 成長フェーズの決定
            let currentPhase = null;
            const growthPlan = this.extractSettledValue(activePlan, null);
            if (growthPlan && chapterNumber) {
                const phaseResult = growthPlan.growthPhases.find(phase =>
                    phase.chapterEstimate[0] <= chapterNumber &&
                    phase.chapterEstimate[1] >= chapterNumber
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

            const characterWithDetails: CharacterWithDetails = {
                id: character.id,
                name: character.name,
                description: character.description,
                type: character.type,
                emotionalState: character.state?.emotionalState || 'NEUTRAL',
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
                personality: character.personality ? {
                    traits: character.personality.traits || [],
                    goals: character.personality.goals || [],
                    fears: character.personality.fears || []
                } : undefined,
                state: {
                    isActive: character.state?.isActive || false,
                    developmentStage: character.state?.developmentStage || 0,
                    lastAppearance: character.state?.lastAppearance || 0,
                    activeGrowthPlanId: character.state?.activeGrowthPlanId
                }
            };

            return characterWithDetails;
        } catch (error) {
            this.logger.error(`Failed to build character details for ${character.name}`, {
                error: error instanceof Error ? error.message : String(error),
                characterId: character.id
            });
            return null;
        }
    }

    /**
     * 🔧 修正：関係性情報のフォーマット
     * 
     * @private
     * @param relationships 関係性配列 
     * @returns フォーマットされた関係性情報
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
                // 対象キャラクターの名前を取得
                const targetCharacter = await this.getCharacter(rel.targetCharacterId);

                formatted.push({
                    targetCharacterId: rel.targetCharacterId,
                    targetCharacterName: targetCharacter?.name || 'Unknown Character',
                    relationshipType: rel.type || 'unknown',
                    strength: rel.strength || 0.5
                });
            } catch (error) {
                // エラーが発生した関係性は基本情報のみ記録
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
     * 🔧 修正：フォールバック用簡易キャラクター詳細情報の作成
     * 
     * @private
     * @param characterIds 対象キャラクターID配列
     * @returns 簡易キャラクター詳細情報
     */
    private async createFallbackCharactersWithDetails(
        characterIds?: string[]
    ): Promise<CharacterWithDetails[]> {
        try {
            this.logger.info('Creating fallback characters with details');

            // 基本キャラクター情報を取得
            let characters: Character[] = [];

            if (characterIds && characterIds.length > 0) {
                characters = await Promise.all(
                    characterIds.map(async (id) => {
                        try {
                            return await this.getCharacter(id);
                        } catch {
                            return null;
                        }
                    })
                ).then(chars => chars.filter(Boolean) as Character[]);
            } else {
                characters = await this.getAllCharacters().catch(() => []);
            }

            return characters.map((character) => ({
                id: character.id,
                name: character.name,
                description: character.description,
                type: character.type,
                emotionalState: character.state?.emotionalState || 'NEUTRAL',
                skills: [], // フォールバックでは空配列
                parameters: [], // フォールバックでは空配列
                growthPhase: null,
                relationships: [], // フォールバックでは空配列
                recentAppearances: [], // フォールバックでは空配列
                personality: character.personality ? {
                    traits: character.personality.traits || [],
                    goals: character.personality.goals || [],
                    fears: character.personality.fears || []
                } : {
                    traits: [],
                    goals: [],
                    fears: []
                },
                state: {
                    isActive: character.state?.isActive || false,
                    developmentStage: character.state?.developmentStage || 0,
                    lastAppearance: character.state?.lastAppearance || 0,
                    activeGrowthPlanId: character.state?.activeGrowthPlanId
                }
            }));
        } catch (error) {
            this.logger.error('Failed to create fallback characters with details', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 🔧 修正：Promise.allSettledの結果から値を安全に抽出
     * 
     * @private
     * @param result Promise.allSettledResult
     * @param fallback フォールバック値
     * @returns 抽出された値またはフォールバック値
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
     * 🔧 修正：アクティブキャラクターの詳細情報取得
     * 
     * ContextGeneratorでよく使用されるパターンに対応
     * 
     * @param chapterNumber 章番号
     * @param maxCount 最大取得数
     * @returns アクティブなキャラクターの詳細情報
     */
    async getActiveCharactersWithDetails(
        chapterNumber?: number,
        maxCount: number = 10
    ): Promise<CharacterWithDetails[]> {
        await this.ensureInitialized();

        try {
            this.logger.info('getActiveCharactersWithDetails called', { chapterNumber, maxCount });

            // アクティブなキャラクターを取得
            const activeCharacters = await this.getActiveCharacters();

            // 必要に応じて数を制限
            const limitedCharacters = activeCharacters.slice(0, maxCount);

            // 詳細情報を付与
            return this.getCharactersWithDetails(
                limitedCharacters.map(char => char.id),
                chapterNumber
            );
        } catch (error) {
            this.logger.error('getActiveCharactersWithDetails failed', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 🔧 修正：メインキャラクターの詳細情報取得
     * 
     * @param chapterNumber 章番号
     * @returns メインキャラクターの詳細情報
     */
    async getMainCharactersWithDetails(
        chapterNumber?: number
    ): Promise<CharacterWithDetails[]> {
        await this.ensureInitialized();

        try {
            this.logger.info('getMainCharactersWithDetails called', { chapterNumber });

            // メインキャラクターを取得
            const mainCharacters = await this.getCharactersByType('MAIN');

            // 詳細情報を付与
            return this.getCharactersWithDetails(
                mainCharacters.map(char => char.id),
                chapterNumber
            );
        } catch (error) {
            this.logger.error('getMainCharactersWithDetails failed', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 新しいキャラクターを作成する
     * @param data キャラクターデータ
     * @returns 作成されたキャラクター
     */
    async createCharacter(data: CharacterData): Promise<Character> {
        await this.ensureInitialized();
        return characterService.createCharacter(data);
    }

    /**
     * IDによるキャラクター取得
     * @param id キャラクターID
     * @returns キャラクターオブジェクトまたはnull
     */
    async getCharacter(id: string): Promise<Character | null> {
        await this.ensureInitialized();
        return characterService.getCharacter(id);
    }

    /**
     * 名前によるキャラクター取得
     * @param name キャラクター名
     * @returns キャラクターオブジェクトまたはnull
     */
    async getCharacterByName(name: string): Promise<Character | null> {
        await this.ensureInitialized();

        // すべてのキャラクターを取得
        const allCharacters = await this.getAllCharacters();

        // 完全一致検索
        const exactMatch = allCharacters.find(char => char.name === name);
        if (exactMatch) return exactMatch;

        // ショートネーム検索
        return allCharacters.find(char =>
            char.shortNames && char.shortNames.includes(name)
        ) || null;
    }

    /**
     * キャラクターの更新
     * @param id キャラクターID
     * @param updates 更新データ
     * @returns 更新されたキャラクター
     */
    async updateCharacter(id: string, updates: Partial<CharacterData>): Promise<Character> {
        await this.ensureInitialized();
        return characterService.updateCharacter(id, updates);
    }

    /**
     * すべてのキャラクターを取得
     * @returns キャラクターの配列
     */
    async getAllCharacters(): Promise<Character[]> {
        await this.ensureInitialized();
        // リポジトリから直接取得
        return characterRepository.getAllCharacters();
    }

    /**
     * タイプ別キャラクター取得
     * @param type キャラクタータイプ
     * @returns 指定タイプのキャラクター配列
     */
    async getCharactersByType(type: CharacterType): Promise<Character[]> {
        await this.ensureInitialized();
        const allCharacters = await this.getAllCharacters();
        return allCharacters.filter(char => char.type === type);
    }

    /**
     * アクティブなキャラクターを取得
     * @returns アクティブなキャラクターの配列
     */
    async getActiveCharacters(): Promise<Character[]> {
        await this.ensureInitialized();
        const allCharacters = await this.getAllCharacters();
        return allCharacters.filter(char => char.state.isActive);
    }

    /**
     * コンテンツからキャラクターを検出
     * @param content 検出対象のコンテンツ
     * @returns 検出されたキャラクターの配列
     */
    async detectCharactersInContent(content: string): Promise<Character[]> {
        await this.ensureInitialized();
        return detectionService.detectCharactersInContent(content);
    }

    /**
     * キャラクターの登場を記録
     * @param characterId キャラクターID
     * @param chapterNumber 章番号
     * @param summary 概要
     * @param emotionalImpact 感情的影響度（オプション）
     * @returns 更新されたキャラクター
     */
    async recordCharacterAppearance(
        characterId: string,
        chapterNumber: number,
        summary: string,
        emotionalImpact: number = 0
    ): Promise<Character> {
        await this.ensureInitialized();
        return characterService.recordAppearance(characterId, chapterNumber, summary);
    }

    /**
     * キャラクター間のインタラクションを記録
     * @param characterId 主体キャラクターID
     * @param targetCharacterId 対象キャラクターID
     * @param chapterNumber 章番号
     * @param type インタラクションタイプ
     * @param description 説明
     * @param impact 影響度
     * @returns 更新されたキャラクター
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

        // 基本的なデータ検証
        const character = await this.getCharacter(characterId);
        if (!character) {
            throw new NotFoundError('Character', characterId);
        }

        const targetCharacter = await this.getCharacter(targetCharacterId);
        if (!targetCharacter) {
            throw new NotFoundError('Character', targetCharacterId);
        }

        // インタラクションデータを構築
        const data = {
            chapterNumber,
            description,
            impact
        };

        // インタラクション記録
        await characterService.recordInteraction(characterId, targetCharacterId, type, data);

        // 更新されたキャラクターを返す
        return await this.getCharacter(characterId) as Character;
    }

    /**
     * キャラクターの成長を処理する
     * @param characterId キャラクターID
     * @param chapterEvents 章のイベント情報
     * @returns 更新されたキャラクター
     */
    async processCharacterDevelopment(characterId: string, chapterEvents: ChapterEvent[]): Promise<Character> {
        await this.ensureInitialized();
        return characterService.processCharacterDevelopment(characterId, chapterEvents);
    }

    /**
     * 章全体のキャラクター成長を処理
     * @param chapterNumber 章番号
     * @param chapterContent 章の内容
     * @returns 更新されたキャラクター情報
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

                // Record型から配列型への変換
                const paramChanges = Object.entries(growthResult.parameterChanges).map(([paramId, values]) => ({
                    name: paramId,
                    change: values.after - values.before
                }));

                // スキル名の配列への変換
                const skillAcquisitions = growthResult.acquiredSkills.map(skillId => ({
                    name: skillId
                }));

                // 結果を記録
                updatedCharacters.push({
                    id: character.id,
                    name: character.name,
                    growthPhase: growthResult.completedPhase || null, // appliedPhaseをcompletedPhaseに変更
                    parameterChanges: paramChanges,
                    skillAcquisitions: skillAcquisitions
                });
            } catch (error) {
                this.logger.error(`キャラクター ${character.name} の成長処理中にエラーが発生しました`, {
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        return { updatedCharacters };
    }



    /**
     * 章の生成前にキャラクター情報を収集して提供する
     * @param chapterNumber 生成する章番号
     * @returns キャラクター情報
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

        // NarrativeContext型を使用してコンテキストを定義
        const narrativeContext: NarrativeContext = {
            pacing: 'MEDIUM',
            arc: 'CURRENT_ARC',
            theme: 'DEVELOPMENT'
        };

        const recommendedChars = await contentAnalysisManager.getCharacterRecommendations(
            chapterNumber,
            narrativeContext,
            8 // 最大8キャラクター
        );

        // メインキャラクターの詳細情報を収集
        const mainCharacters = await Promise.all(
            recommendedChars.mainCharacters.map(async (rec: CharacterRecommendation) => {
                const character = await this.getCharacter(rec.id);
                if (!character) return null;

                // キャラクターのスキルとパラメータを取得
                const skills = await this.getCharacterSkills(rec.id);
                const parameters = await this.getCharacterParameters(rec.id);

                // アクティブな成長計画を取得
                const activePlan = await this.getActiveGrowthPlan(rec.id);

                // 成長フェーズを取得
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

        // サポートキャラクターの情報を収集（同様のプロセス）
        const supportingCharacters = await Promise.all(
            recommendedChars.supportingCharacters.map(async (rec: CharacterRecommendation) => {
                const character = await this.getCharacter(rec.id);
                if (!character) return null;

                // 簡略化されたスキル・パラメータ情報
                const skills = await this.getCharacterSkills(rec.id);
                const topSkills = skills
                    .sort((a, b) => b.level - a.level)
                    .slice(0, 3); // 上位3つのみ

                const parameters = await this.getCharacterParameters(rec.id);
                const topParameters = parameters
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5); // 上位5つのみ

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
                    growthPhase: null // サポートキャラクターは簡略化して成長フェーズを省略
                };
            })
        );

        return {
            mainCharacters: mainCharacters.filter(Boolean) as any[],
            supportingCharacters: supportingCharacters.filter(Boolean) as any[]
        };
    }

    // =========================================================================
    // 以下、元のメソッドをそのまま継承（省略）
    // =========================================================================

    /**
     * 関係性グラフの分析
     * @returns 関係性の分析結果
     */
    async getRelationshipAnalysis(): Promise<RelationshipAnalysis> {
        await this.ensureInitialized();
        return relationshipService.analyzeRelationshipDynamics();
    }

    /**
     * キャラクターを分析する
     * @param characterId キャラクターID
     * @returns 分析結果
     */
    async analyzeCharacter(characterId: string): Promise<any> {
        await this.ensureInitialized();

        // キャラクターを取得
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

        // 空でない基礎状態と現在の状態を使用して、characterAnalyzerに変化検出を委譲
        const characterDiff = characterAnalyzer.detectChanges(baseState, character);

        // 関連データを収集
        const parameters = await this.getCharacterParameters(characterId);
        const skills = await this.getCharacterSkills(characterId);
        const relationships = await this.getCharacterRelationships(characterId);

        // 分析結果を拡張して返す
        return {
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
    }

    /**
     * キャラクターの関係性データを取得する
     * @param characterId キャラクターID
     * @returns 関係性データレスポンス
     */
    async getCharacterRelationships(characterId: string): Promise<RelationshipResponse> {
        await this.ensureInitialized();
        return relationshipService.getCharacterRelationships(characterId);
    }

    /**
     * キャラクターの関係性を更新する
     * @param char1Id 1人目のキャラクターID
     * @param char2Id 2人目のキャラクターID
     * @param type 関係性タイプ
     * @param strength 関係性の強さ
     */
    async updateRelationship(
        char1Id: string,
        char2Id: string,
        type: string,
        strength: number
    ): Promise<void> {
        await this.ensureInitialized();
        return relationshipService.updateRelationship(char1Id, char2Id, type, strength);
    }

    /**
     * キャラクターの登場タイミングを分析する
     * @param characterId キャラクターID
     * @param storyContext ストーリーのコンテキスト
     * @returns タイミング推奨
     */
    async analyzeAppearanceTiming(
        characterId: string,
        storyContext: StoryContext
    ): Promise<TimingRecommendation> {
        await this.ensureInitialized();

        const character = await this.getCharacter(characterId);
        if (!character) {
            throw new NotFoundError('Character', characterId);
        }

        // Note: evolutionServiceに委譲（または専用のTimingAnalyzerサービスを使用）
        return timingAnalyzer.getTimingRecommendation(character, storyContext);
    }

    /**
     * チャプターに推奨するキャラクターを取得する
     * @param chapterNumber 章番号
     * @param narrativeState 物語の状態
     * @param maxCharacters 最大キャラクター数
     * @returns 推奨キャラクター情報
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
                totalChapters: 50, // 推定値
                plotPoints: [],
                storyPacing: narrativeState.pacing || 'MEDIUM',
                currentArc: {
                    name: narrativeState.arc || 'Unknown',
                    theme: narrativeState.theme || 'Unknown',
                    approximateChapters: [
                        Math.max(1, chapterNumber - 5),
                        chapterNumber + 5
                    ] as [number, number]  // タプル型として明示的にキャスト
                },
                recentAppearances: []
            };

            // timingAnalyzerを使用して分析
            const timing = await timingAnalyzer.getTimingRecommendation(character, context);
            timingScores.set(character.id, this.calculateAppearanceScore(timing, character, narrativeState));
        }

        // メインキャラクターの選定 (最大3名)
        const selectedMainCharacters = this.selectCharactersWithScores(
            mainCharacters,
            timingScores,
            Math.min(3, mainCharacters.length),
            '物語の主要人物として'
        );

        // サポートキャラクターの選定 (最大3名)
        const selectedSupportingCharacters = this.selectCharactersWithScores(
            subCharacters,
            timingScores,
            Math.min(3, maxCharacters - selectedMainCharacters.length),
            '重要な脇役として'
        );

        // 背景キャラクターの選定 (残りのスロット)
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
    }

    /**
     * キャラクターのパラメータを初期化する
     * @param characterId キャラクターID
     * @param defaultValue デフォルト値
     * @returns 初期化されたパラメータ配列
     */
    async initializeCharacterParameters(
        characterId: string,
        defaultValue: number = 10
    ): Promise<CharacterParameter[]> {
        await this.ensureInitialized();
        return parameterService.initializeCharacterParameters(characterId, defaultValue);
    }

    /**
     * キャラクターのパラメータを取得する
     * @param characterId キャラクターID
     * @returns パラメータ配列
     */
    async getCharacterParameters(characterId: string): Promise<CharacterParameter[]> {
        await this.ensureInitialized();
        return parameterService.getCharacterParameters(characterId);
    }

    /**
     * パラメータ値を設定する
     * @param characterId キャラクターID
     * @param parameterId パラメータID
     * @param value 新しい値
     * @returns 更新されたパラメータまたはnull
     */
    async setParameterValue(
        characterId: string,
        parameterId: string,
        value: number
    ): Promise<CharacterParameter | null> {
        await this.ensureInitialized();
        return parameterService.setParameterValue(characterId, parameterId, value);
    }

    /**
     * パラメータ値を相対的に変更する
     * @param characterId キャラクターID
     * @param parameterId パラメータID
     * @param delta 変化量
     * @returns 更新されたパラメータまたはnull
     */
    async modifyParameter(
        characterId: string,
        parameterId: string,
        delta: number
    ): Promise<CharacterParameter | null> {
        await this.ensureInitialized();
        return parameterService.modifyParameter(characterId, parameterId, delta);
    }

    /**
     * キャラクターのスキルを取得する
     * @param characterId キャラクターID
     * @returns スキル配列
     */
    async getCharacterSkills(characterId: string): Promise<Skill[]> {
        await this.ensureInitialized();
        return skillService.getCharacterSkills(characterId);
    }

    /**
     * キャラクターにスキルを習得させる
     * @param characterId キャラクターID
     * @param skillId スキルID
     * @param forcedAcquisition 要件を無視して強制取得するか
     * @returns 成功したかどうか
     */
    async acquireSkill(
        characterId: string,
        skillId: string,
        forcedAcquisition: boolean = false
    ): Promise<boolean> {
        await this.ensureInitialized();
        return skillService.acquireSkill(characterId, skillId, forcedAcquisition);
    }

    /**
     * キャラクターのスキルレベルを更新する
     * @param characterId キャラクターID
     * @param skillId スキルID
     * @param newLevel 新しいレベル
     * @returns 成功したかどうか
     */
    async updateSkillLevel(
        characterId: string,
        skillId: string,
        newLevel: number
    ): Promise<boolean> {
        await this.ensureInitialized();
        return skillService.updateSkillLevel(characterId, skillId, newLevel);
    }

    /**
     * スキルの習熟度を増加させる
     * @param characterId キャラクターID
     * @param skillId スキルID
     * @param amount 増加量
     * @returns 成功したかどうか
     */
    async increaseSkillProficiency(
        characterId: string,
        skillId: string,
        amount: number
    ): Promise<boolean> {
        await this.ensureInitialized();
        return skillService.increaseProficiency(characterId, skillId, amount);
    }

    /**
     * キャラクターに成長計画を追加する
     * @param characterId キャラクターID
     * @param plan 成長計画 (IDは自動生成)
     * @returns 作成された成長計画
     */
    async addGrowthPlan(
        characterId: string,
        plan: Omit<GrowthPlan, 'id' | 'characterId'>
    ): Promise<GrowthPlan> {
        await this.ensureInitialized();

        // キャラクターの存在確認
        const character = await this.getCharacter(characterId);
        if (!character) {
            throw new NotFoundError('Character', characterId);
        }

        // Note: evolutionServiceに委譲
        const createdPlan = await evolutionService.addGrowthPlan(characterId, plan);

        // 計画が活性状態なら、キャラクター状態を更新
        if (createdPlan.isActive) {
            await this.updateCharacter(characterId, {
                state: {
                    ...character.state,
                    activeGrowthPlanId: createdPlan.id
                } as CharacterState
            });
        }

        return createdPlan;
    }

    /**
     * キャラクターのアクティブな成長計画を設定する
     * @param characterId キャラクターID
     * @param planId 成長計画ID
     */
    async setActiveGrowthPlan(characterId: string, planId: string): Promise<void> {
        await this.ensureInitialized();

        // キャラクターの存在確認
        const character = await this.getCharacter(characterId);
        if (!character) {
            throw new NotFoundError('Character', characterId);
        }

        // 成長計画を設定
        await evolutionService.setActiveGrowthPlan(characterId, planId);

        // キャラクター状態を更新
        await this.updateCharacter(characterId, {
            state: {
                ...character.state,
                activeGrowthPlanId: planId
            } as CharacterState
        });
    }

    /**
     * キャラクターの成長計画を取得する
     * @param characterId キャラクターID
     * @returns 成長計画の配列
     */
    async getCharacterGrowthPlans(characterId: string): Promise<GrowthPlan[]> {
        await this.ensureInitialized();
        return evolutionService.getCharacterGrowthPlans(characterId);
    }

    /**
     * キャラクターのアクティブな成長計画を取得する
     * @param characterId キャラクターID
     * @returns アクティブな成長計画またはnull
     */
    async getActiveGrowthPlan(characterId: string): Promise<GrowthPlan | null> {
        await this.ensureInitialized();
        return evolutionService.getActiveGrowthPlan(characterId);
    }

    /**
     * キャラクターに成長計画を適用する
     * @param characterId キャラクターID
     * @param chapterNumber 章番号
     * @returns 成長結果
     */
    async applyGrowthPlan(
        characterId: string,
        chapterNumber: number
    ): Promise<GrowthResult> {
        await this.ensureInitialized();
        return evolutionService.applyGrowthPlan(characterId, chapterNumber);
    }

    /**
     * キャラクターの心理分析を取得
     * @param characterId キャラクターID
     * @param chapterNumber 章番号
     * @returns 心理分析結果またはnull
     */
    async getCharacterPsychology(characterId: string, chapterNumber: number): Promise<any | null> {
        await this.ensureInitialized();

        const character = await this.getCharacter(characterId);
        if (!character) {
            throw new NotFoundError('Character', characterId);
        }

        // 最近のイベントを取得（実装に応じて調整）
        const recentEvents = await this.getCharacterRecentEvents(characterId, 3);

        // 心理分析を実行
        return psychologyService.analyzeCharacterPsychology(character, recentEvents);
    }

    /**
     * キャラクターの最近のイベントを取得
     * @param characterId キャラクターID
     * @param limit 最大数
     * @returns イベント配列
     */
    async getCharacterRecentEvents(characterId: string, limit: number = 3): Promise<any[]> {
        await this.ensureInitialized();

        const character = await this.getCharacter(characterId);
        if (!character) return [];

        // 登場履歴からイベントを取得
        if (character.history?.appearances) {
            // 最近の登場のみ対象
            const recentAppearances = character.history.appearances
                .filter(a => a.summary)
                .sort((a, b) => b.chapterNumber - a.chapterNumber)
                .slice(0, limit);

            return recentAppearances.map(appearance => ({
                chapter: appearance.chapterNumber,
                event: appearance.summary
            }));
        }

        return [];
    }

    /**
     * プロンプト用にキャラクターをフォーマットする
     * @param characterIds キャラクターID配列
     * @param detailLevel 詳細レベル
     * @returns フォーマットされたテキスト
     */
    async formatCharactersForPrompt(
        characterIds: string[],
        detailLevel: "brief" | "standard" | "detailed" = "standard"
    ): Promise<string> {
        await this.ensureInitialized();

        const characters = await Promise.all(
            characterIds.map(id => this.getCharacter(id))
        );

        // 有効なキャラクターのみフィルタリング
        const validCharacters = characters.filter(Boolean) as Character[];

        // 詳細レベルに応じたフォーマット
        const formattedCharacters = validCharacters.map(
            character => formatCharacterForPrompt(character, detailLevel)
        );

        return formattedCharacters.join('\n\n');
    }

    /**
     * 動的キャラクターを生成する
     * @param role 役割
     * @param archetype アーキタイプ
     * @param integrationPoint 組み込みポイント
     * @param requirements 要件
     * @returns 生成されたキャラクター
     */
    async generateCharacter(
        role: string,
        archetype: string,
        integrationPoint: number,
        requirements?: {
            mustHave?: string[];
            connections?: { characterId: string; relationshipType: string }[];
        }
    ): Promise<DynamicCharacter> {
        await this.ensureInitialized();

        // Note: このメソッドは厳密にはファサードとして他のサービスに委譲される必要がある
        // 現時点ではモック実装
        throw new Error('Method not implemented: このメソッドは実際の実装では他のサービスに委譲してください');
    }

    /**
     * キャラクターの行動を予測する
     * @param characterId キャラクターID
     * @param situation 状況
     * @param options 選択肢
     * @returns 予測結果
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

        const character = await this.getCharacter(characterId);
        if (!character) {
            throw new NotFoundError('Character', characterId);
        }

        // 心理情報を取得
        const psychology = await this.getCharacterPsychology(characterId, character.state.lastAppearance || 1);

        // 予測処理（実際にはPsychologyServiceに委譲する）
        return psychologyService.predictBehaviors(character, psychology, [situation]);
    }

    /**
     * キャラクター設定の検証
     * @param characterId キャラクターID
     * @returns 検証結果
     */
    async validateCharacter(characterId: string): Promise<ValidationResult> {
        await this.ensureInitialized();

        const character = await this.getCharacter(characterId);
        if (!character) {
            throw new NotFoundError('Character', characterId);
        }

        // CharacterServiceに委譲
        return characterService.validateCharacter(character);
    }

    /**
     * キャラクター発展経路の生成
     * @param characterId キャラクターID
     * @returns 発展経路情報
     */
    async generateDevelopmentPath(characterId: string): Promise<any> {
        await this.ensureInitialized();

        const character = await this.getCharacter(characterId);
        if (!character) {
            throw new NotFoundError('Character', characterId);
        }

        // 発展経路の生成
        return evolutionService.generateDevelopmentPath(character);
    }

    /**
     * ジャンルに適したパラメータとスキルを初期化する
     * @param characterId キャラクターID
     * @param genre ジャンル
     * @returns 初期化されたパラメータとスキル
     */
    async initializeForGenre(
        characterId: string,
        genre: string
    ): Promise<{
        parameters: CharacterParameter[];
        skills: Skill[];
    }> {
        await this.ensureInitialized();

        // キャラクターを取得
        const character = await this.getCharacter(characterId);
        if (!character) {
            throw new NotFoundError('Character', characterId);
        }

        // ジャンルに適したパラメータを取得
        const genreParameters = await parameterService.getParametersForGenre(genre);

        // パラメータを初期化
        await parameterService.initializeCharacterParameters(characterId, 10);

        // ジャンル特化のパラメータを強化
        for (const param of genreParameters) {
            await parameterService.modifyParameter(characterId, param.id, 10); // 基本値の上に+10
        }

        // ジャンルに適したスキルを取得
        const genreSkills = await skillService.getSkillsForGenre(genre);

        // 基本スキルを習得（最初の3つまで）
        const basicSkills = genreSkills
            .filter(skill => skill.learningDifficulty <= 3)
            .slice(0, 3);

        for (const skill of basicSkills) {
            await skillService.acquireSkill(characterId, skill.id, true); // 強制取得
        }

        return {
            parameters: await parameterService.getCharacterParameters(characterId),
            skills: basicSkills
        };
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

        // スコア付きキャラクターリストの作成
        const scoredCharacters = characters.map(char => ({
            id: char.id,
            name: char.name,
            score: scores.get(char.id) || 0
        }));

        // スコア順にソート
        scoredCharacters.sort((a, b) => b.score - a.score);

        // 上位を選択
        return scoredCharacters.slice(0, count).map(c => ({
            id: c.id,
            name: c.name,
            reason: `${reasonPrefix} (スコア: ${c.score.toFixed(2)})`
        }));
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
        // タイミング推奨に基づくスコア
        let score = 0;

        const lastAppearance = character.state.lastAppearance || 0;

        if (timing.recommendedChapter === lastAppearance) {
            score = 0.3; // 直前のチャプターでの登場は控えめに
        } else if (timing.recommendedChapter === lastAppearance + 1) {
            score = 0.8; // 次のチャプターでの登場は有力
        } else if (timing.alternatives.includes(lastAppearance + 1)) {
            score = 0.6; // 代替タイミングでの登場も検討
        } else {
            score = 0.4; // その他
        }

        // キャラクタータイプによる調整
        if (character.type === 'MAIN') {
            score += 0.3; // メインキャラクターは登場頻度高め
        }

        // テーマとの関連性に基づく調整
        if (narrativeState.theme && character.personality?.traits) {
            const theme = narrativeState.theme.toLowerCase();
            const traits = character.personality.traits.map(t => t.toLowerCase());

            // テーマに関連する特性を持つか
            const hasRelevantTrait = traits.some(trait => theme.includes(trait) || trait.includes(theme));
            if (hasRelevantTrait) {
                score += 0.2;
            }
        }

        return Math.min(1.0, score);
    }

    /**
 * 🔧 新規追加：生成された章からキャラクター情報を処理・更新する
 * 
 * ContextGeneratorから呼び出される専用メソッド。
 * 生成された章の内容を分析し、登場キャラクターの状態更新や成長処理を行います。
 * 
 * @param chapter 生成された章オブジェクト
 * @returns Promise<void>
 */
    async processGeneratedChapter(chapter: Chapter): Promise<void> {
        await this.ensureInitialized();

        try {
            this.logger.info(`Processing generated chapter ${chapter.chapterNumber} for character updates`);

            // 1. 章に登場したキャラクターを検出
            const detectedCharacters = await this.detectCharactersInContent(chapter.content);

            if (detectedCharacters.length === 0) {
                this.logger.info(`No characters detected in chapter ${chapter.chapterNumber}`);
                return;
            }

            this.logger.info(`Detected ${detectedCharacters.length} characters in chapter ${chapter.chapterNumber}`, {
                characters: detectedCharacters.map(c => c.name)
            });

            // 2. 各キャラクターの登場記録と状態更新を並列処理
            const updatePromises = detectedCharacters.map(async (character) => {
                try {
                    // 登場記録を更新
                    await this.recordCharacterAppearance(
                        character.id,
                        chapter.chapterNumber,
                        `第${chapter.chapterNumber}章に登場: ${chapter.title || ''}`,
                        0.5 // 標準的な感情的影響度
                    );

                    // キャラクターの成長処理を適用
                    const growthResult = await this.applyGrowthPlan(character.id, chapter.chapterNumber);

                    this.logger.debug(`Applied growth plan for ${character.name}`, {
                        characterId: character.id,
                        chapterNumber: chapter.chapterNumber,
                        completedPhase: growthResult.completedPhase,
                        parameterChanges: Object.keys(growthResult.parameterChanges).length,
                        acquiredSkills: growthResult.acquiredSkills.length
                    });

                    return {
                        characterId: character.id,
                        characterName: character.name,
                        success: true,
                        growthResult
                    };
                } catch (error) {
                    this.logger.warn(`Failed to process character ${character.name} for chapter ${chapter.chapterNumber}`, {
                        error: error instanceof Error ? error.message : String(error),
                        characterId: character.id
                    });

                    return {
                        characterId: character.id,
                        characterName: character.name,
                        success: false,
                        error: error instanceof Error ? error.message : String(error)
                    };
                }
            });

            // 3. すべての更新処理の完了を待機
            const results = await Promise.all(updatePromises);

            // 4. 結果の集計とログ出力
            const successful = results.filter(r => r.success);
            const failed = results.filter(r => !r.success);

            this.logger.info(`Chapter ${chapter.chapterNumber} character processing completed`, {
                totalCharacters: detectedCharacters.length,
                successful: successful.length,
                failed: failed.length,
                successfulCharacters: successful.map(r => r.characterName),
                failedCharacters: failed.map(r => ({ name: r.characterName, error: r.error }))
            });

            // 5. 章のメタデータから追加情報を処理（オプショナル）
            if (chapter.metadata?.characters && Array.isArray(chapter.metadata.characters)) {
                await this.processChapterMetadataCharacters(chapter.metadata.characters, chapter.chapterNumber);
            }

            // 6. 関係性の更新（章内でのキャラクター間相互作用を分析）
            if (detectedCharacters.length > 1) {
                await this.processCharacterInteractionsInChapter(detectedCharacters, chapter);
            }

        } catch (error) {
            this.logger.error(`Failed to process generated chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        }
    }

    /**
     * 🔧 補助メソッド：章のメタデータからキャラクター情報を処理
     * 
     * @private
     * @param metadataCharacters 章メタデータのキャラクター情報
     * @param chapterNumber 章番号
     */
    private async processChapterMetadataCharacters(
        metadataCharacters: any[],
        chapterNumber: number
    ): Promise<void> {
        try {
            for (const charMeta of metadataCharacters) {
                if (charMeta.id || charMeta.name) {
                    let character: Character | null = null;

                    // IDまたは名前でキャラクターを特定
                    if (charMeta.id) {
                        character = await this.getCharacter(charMeta.id);
                    } else if (charMeta.name) {
                        character = await this.getCharacterByName(charMeta.name);
                    }

                    if (character) {
                        // メタデータに基づく追加処理
                        if (charMeta.emotionalState) {
                            await this.updateCharacter(character.id, {
                                state: {
                                    ...character.state,
                                    emotionalState: charMeta.emotionalState
                                } as CharacterState
                            });
                        }

                        this.logger.debug(`Updated character from metadata`, {
                            characterName: character.name,
                            chapterNumber,
                            updates: Object.keys(charMeta)
                        });
                    }
                }
            }
        } catch (error) {
            this.logger.warn(`Failed to process chapter metadata characters`, {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 🔧 補助メソッド：章内でのキャラクター間相互作用を処理
     * 
     * @private
     * @param characters 章に登場したキャラクター配列
     * @param chapter 章オブジェクト  
     */
    private async processCharacterInteractionsInChapter(
        characters: Character[],
        chapter: Chapter
    ): Promise<void> {
        try {
            // 簡単な相互作用分析（実際の実装では、より高度なNLP分析を使用）
            const interactionKeywords = ['話す', '会話', '出会う', '対話', '議論', '争う', '協力'];
            const content = chapter.content.toLowerCase();

            // キャラクター名の組み合わせで相互作用をチェック
            for (let i = 0; i < characters.length; i++) {
                for (let j = i + 1; j < characters.length; j++) {
                    const char1 = characters[i];
                    const char2 = characters[j];

                    // 両方のキャラクター名がコンテンツに含まれているかチェック
                    const char1InContent = content.includes(char1.name.toLowerCase());
                    const char2InContent = content.includes(char2.name.toLowerCase());

                    if (char1InContent && char2InContent) {
                        // 相互作用キーワードの存在をチェック
                        const hasInteractionKeyword = interactionKeywords.some(keyword =>
                            content.includes(keyword)
                        );

                        if (hasInteractionKeyword) {
                            // 基本的な相互作用を記録
                            await this.recordCharacterInteraction(
                                char1.id,
                                char2.id,
                                chapter.chapterNumber,
                                'general_interaction',
                                `第${chapter.chapterNumber}章での相互作用`,
                                0.3 // 標準的な影響度
                            );

                            this.logger.debug(`Recorded interaction between characters`, {
                                character1: char1.name,
                                character2: char2.name,
                                chapterNumber: chapter.chapterNumber
                            });
                        }
                    }
                }
            }
        } catch (error) {
            this.logger.warn(`Failed to process character interactions`, {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

}

// シングルトンインスタンスをエクスポート
export const characterManager = CharacterManager.getInstance();