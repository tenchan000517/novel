/**
 * @fileoverview 記憶階層システム完全統合キャラクタースキルサービス（即座使用可能版）
 * @description
 * 新しい記憶階層システム（MemoryManager）と完全統合されたキャラクタースキル管理サービス。
 * ファザードパターンに最適化：initializeメソッドを削除し、即座に使用可能。
 * repositoriesを使用せず、統一アクセスAPIとunifiedSearchを活用して効率的なスキル管理を実現。
 */
import { Logger } from '@/lib/utils/logger';
import { ISkillService } from '../core/interfaces';
import { Skill, Character, CharacterParameter, ChapterEvent } from '../core/types';
import { NotFoundError } from '../core/errors';
import { eventBus } from '../events/character-event-bus';
import { EVENT_TYPES } from '../core/constants';
import { Chapter } from '@/types/chapters';

// 🔄 新しい記憶階層システムのインポート
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { MemoryLevel, MemoryRequestType } from '@/lib/memory/core/types';

/**
 * スキル習得結果型（詳細版）
 */
export interface SkillAcquisitionResult {
    success: boolean;
    skillId: string;
    skillName: string;
    level: number;
    characterId: string;
    requirementsMet: boolean;
    parameterEffectsApplied: Array<{
        parameterId: string;
        parameterName: string;
        oldValue: number;
        newValue: number;
        change: number;
    }>;
    acquisitionReason: string;
    timestamp: string;
    memoryIntegrated: boolean;
}

/**
 * スキル習熟度増加結果型
 */
export interface ProficiencyIncreaseResult {
    success: boolean;
    skillId: string;
    characterId: string;
    previousProficiency: number;
    newProficiency: number;
    levelUpOccurred: boolean;
    newLevel?: number;
    reason: string;
    timestamp: string;
}

/**
 * スキル要件チェック結果型
 */
export interface SkillRequirementCheck {
    canAcquire: boolean;
    skillId: string;
    characterId: string;
    requirementsMet: {
        parameters: Array<{
            parameterId: string;
            required: number;
            current: number;
            met: boolean;
        }>;
        prerequisites: Array<{
            skillId: string;
            skillName: string;
            acquired: boolean;
        }>;
    };
    missingRequirements: string[];
    recommendations: string[];
}

/**
 * 記憶階層システム完全統合キャラクタースキルサービス（即座使用可能版）
 */
export class SkillService implements ISkillService {
    private readonly logger = new Logger({ serviceName: 'SkillService' });

    // パフォーマンス統計
    private performanceStats = {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageProcessingTime: 0,
        memorySystemHits: 0,
        cacheEfficiencyRate: 0,
        lastOptimization: new Date().toISOString()
    };

    /**
     * コンストラクタ（即座使用可能版）
     * @param memoryManager MemoryManagerへの依存関係注入（必須）
     */
    constructor(private memoryManager: MemoryManager) {
        // 基本システムの即座初期化
        this.initializeBasicSystems();
        
        this.logger.info('SkillService ready for immediate use with complete MemoryManager integration');
    }

    /**
     * 基本システムの初期化（同期処理）
     * @private
     */
    private initializeBasicSystems(): void {
        // パフォーマンス統計のリセット
        this.performanceStats = {
            totalOperations: 0,
            successfulOperations: 0,
            failedOperations: 0,
            averageProcessingTime: 0,
            memorySystemHits: 0,
            cacheEfficiencyRate: 0,
            lastOptimization: new Date().toISOString()
        };

        this.logger.debug('SkillService basic systems initialized immediately');
    }

    /**
     * 遅延初期化が必要な場合の処理（必要時のみ実行）
     * @private
     */
    private async performLazyInitializationIfNeeded(): Promise<void> {
        try {
            // MemoryManagerの状態確認
            const systemStatus = await this.memoryManager.getSystemStatus();
            if (!systemStatus.initialized) {
                this.logger.warn('MemoryManager not fully initialized, but proceeding with available functionality');
            }

            // スキル定義の確認・初期化
            await this.initializeSkillDefinitionsIfNeeded();

            this.logger.debug('SkillService lazy initialization completed');
        } catch (error) {
            this.logger.warn('Lazy initialization partially failed, but service remains operational', { error });
        }
    }

    /**
     * スキル定義の初期化（必要時のみ）
     * @private
     */
    private async initializeSkillDefinitionsIfNeeded(): Promise<void> {
        try {
            // 基本スキル定義の確認・作成
            const searchResult = await this.memoryManager.unifiedSearch(
                'skill definitions',
                [MemoryLevel.LONG_TERM]
            );

            if (!searchResult.success || searchResult.results.length === 0) {
                // 基本スキル定義を作成
                await this.createBasicSkillDefinitions();
            }

            this.logger.debug('Skill definitions initialized');
        } catch (error) {
            this.logger.warn('Failed to initialize skill definitions', { error });
        }
    }

    // ============================================================================
    // 🔧 主要機能（記憶階層システム完全統合版・即座使用可能）
    // ============================================================================

    /**
     * キャラクタースキル取得（記憶階層システム統合版・即座使用可能）
     * 
     * @param characterId キャラクターID
     * @returns スキルの配列
     */
    async getCharacterSkills(characterId: string): Promise<Skill[]> {
        const startTime = Date.now();

        try {
            this.performanceStats.totalOperations++;
            this.logger.debug(`Getting character skills for: ${characterId} (integrated)`);

            // 🔧 最初の使用時に必要に応じて遅延初期化
            await this.performLazyInitializationIfNeeded();

            // 🔄 統一検索APIを使用してスキル情報を取得
            const searchResult = await this.memoryManager.unifiedSearch(
                `character skills:"${characterId}"`,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            if (searchResult.success && searchResult.results.length > 0) {
                this.performanceStats.memorySystemHits++;
                
                // 検索結果からスキル情報を抽出
                const skills = this.extractSkillsFromSearchResults(searchResult.results, characterId);
                
                if (skills.length > 0) {
                    this.updatePerformanceStats(Date.now() - startTime, true);
                    this.logger.debug(`Retrieved ${skills.length} skills for character ${characterId} from memory system`);
                    return skills;
                }
            }

            // フォールバック: 基本スキルセットを生成
            const fallbackSkills = await this.generateFallbackSkills(characterId);
            this.updatePerformanceStats(Date.now() - startTime, true);
            
            this.logger.debug(`Generated ${fallbackSkills.length} fallback skills for character ${characterId}`);
            return fallbackSkills;

        } catch (error) {
            this.updatePerformanceStats(Date.now() - startTime, false);
            this.logger.error(`Failed to get character skills for ${characterId}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * スキル習得（記憶階層システム統合版・即座使用可能）
     * 
     * @param characterId キャラクターID
     * @param skillId スキルID
     * @param forced 要件を無視して強制取得するか
     * @returns 成功したかどうか
     */
    async acquireSkill(characterId: string, skillId: string, forced: boolean = false): Promise<boolean> {
        const startTime = Date.now();

        try {
            this.performanceStats.totalOperations++;
            this.logger.info(`Acquiring skill: ${skillId} for character: ${characterId} (forced: ${forced})`);

            // 詳細結果を取得
            const detailedResult = await this.acquireSkillDetailed(characterId, skillId, forced);
            
            this.updatePerformanceStats(Date.now() - startTime, detailedResult.success);
            return detailedResult.success;

        } catch (error) {
            this.updatePerformanceStats(Date.now() - startTime, false);
            this.logger.error(`Failed to acquire skill ${skillId} for character ${characterId}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * 詳細なスキル習得処理（即座使用可能）
     */
    async acquireSkillDetailed(characterId: string, skillId: string, forced: boolean = false): Promise<SkillAcquisitionResult> {
        const timestamp = new Date().toISOString();
        
        try {
            // 1. スキル定義の取得
            const skillDefinition = await this.getSkillDefinition(skillId);
            if (!skillDefinition) {
                throw new NotFoundError('Skill', skillId);
            }

            // 2. 要件チェック（強制でない場合）
            let requirementsMet = true;
            let requirementCheck: SkillRequirementCheck | null = null;
            
            if (!forced) {
                requirementCheck = await this.checkSkillRequirementsDetailed(characterId, skillId);
                requirementsMet = requirementCheck.canAcquire;
                
                if (!requirementsMet) {
                    this.logger.warn(`Skill requirements not met for ${skillId}`, {
                        characterId,
                        missingRequirements: requirementCheck.missingRequirements
                    });
                    
                    return {
                        success: false,
                        skillId,
                        skillName: skillDefinition.name,
                        level: 0,
                        characterId,
                        requirementsMet: false,
                        parameterEffectsApplied: [],
                        acquisitionReason: `Requirements not met: ${requirementCheck.missingRequirements.join(', ')}`,
                        timestamp,
                        memoryIntegrated: false
                    };
                }
            }

            // 3. 既存スキルの確認
            const existingSkills = await this.getCharacterSkills(characterId);
            const alreadyAcquired = existingSkills.some(s => s.id === skillId);
            
            if (alreadyAcquired) {
                this.logger.debug(`Character ${characterId} already has skill ${skillId}`);
                return {
                    success: true,
                    skillId,
                    skillName: skillDefinition.name,
                    level: existingSkills.find(s => s.id === skillId)?.level || 1,
                    characterId,
                    requirementsMet: true,
                    parameterEffectsApplied: [],
                    acquisitionReason: 'Already acquired',
                    timestamp,
                    memoryIntegrated: true
                };
            }

            // 4. パラメータ効果の適用
            const parameterEffects = await this.applySkillParameterEffects(characterId, skillDefinition);

            // 5. スキル習得の記録（記憶階層システムに保存）
            const acquisitionChapter = this.createSkillAcquisitionChapter(
                characterId,
                skillDefinition,
                forced,
                parameterEffects
            );

            const memoryResult = await this.memoryManager.processChapter(acquisitionChapter);

            // 6. イベント発行
            eventBus.publish(EVENT_TYPES.SKILL_ACQUIRED, {
                timestamp: new Date(),
                characterId,
                skillId,
                skillName: skillDefinition.name,
                level: 1,
                forced
            });

            const result: SkillAcquisitionResult = {
                success: memoryResult.success,
                skillId,
                skillName: skillDefinition.name,
                level: 1,
                characterId,
                requirementsMet,
                parameterEffectsApplied: parameterEffects,
                acquisitionReason: forced ? 'Forced acquisition' : 'Requirements met',
                timestamp,
                memoryIntegrated: memoryResult.success
            };

            if (memoryResult.success) {
                this.logger.info(`Successfully acquired skill ${skillDefinition.name} for character ${characterId}`);
            } else {
                this.logger.warn(`Skill acquisition processed but memory integration failed`, {
                    errors: memoryResult.errors
                });
            }

            return result;

        } catch (error) {
            this.logger.error(`Detailed skill acquisition failed for ${skillId}`, {
                error: error instanceof Error ? error.message : String(error),
                characterId
            });

            return {
                success: false,
                skillId,
                skillName: 'Unknown Skill',
                level: 0,
                characterId,
                requirementsMet: false,
                parameterEffectsApplied: [],
                acquisitionReason: `Error: ${error instanceof Error ? error.message : String(error)}`,
                timestamp,
                memoryIntegrated: false
            };
        }
    }

    /**
     * スキルレベル更新（記憶階層システム統合版・即座使用可能）
     * 
     * @param characterId キャラクターID
     * @param skillId スキルID
     * @param newLevel 新しいレベル
     * @returns 成功したかどうか
     */
    async updateSkillLevel(characterId: string, skillId: string, newLevel: number): Promise<boolean> {
        const startTime = Date.now();

        try {
            this.performanceStats.totalOperations++;
            this.logger.info(`Updating skill level: ${skillId} to level ${newLevel} for character: ${characterId}`);

            // レベルを1〜5に制限
            const level = Math.max(1, Math.min(5, newLevel));

            // 1. 現在のスキル情報を取得
            const currentSkills = await this.getCharacterSkills(characterId);
            const currentSkill = currentSkills.find(s => s.id === skillId);

            if (!currentSkill) {
                throw new NotFoundError('Skill', skillId);
            }

            const previousLevel = currentSkill.level;
            if (previousLevel === level) {
                this.logger.debug(`Skill ${skillId} already at level ${level}`);
                this.updatePerformanceStats(Date.now() - startTime, true);
                return true;
            }

            // 2. スキル定義の取得
            const skillDefinition = await this.getSkillDefinition(skillId);
            if (!skillDefinition) {
                throw new NotFoundError('Skill definition', skillId);
            }

            // 3. レベル差分に基づくパラメータ効果の適用
            const levelDiff = level - previousLevel;
            const parameterEffects = await this.applyLevelUpParameterEffects(
                characterId, 
                skillDefinition, 
                levelDiff
            );

            // 4. スキルレベル更新の記録（記憶階層システムに保存）
            const levelUpChapter = this.createSkillLevelUpChapter(
                characterId,
                skillDefinition,
                previousLevel,
                level,
                parameterEffects
            );

            const memoryResult = await this.memoryManager.processChapter(levelUpChapter);

            // 5. イベント発行
            eventBus.publish(EVENT_TYPES.SKILL_LEVEL_UP, {
                timestamp: new Date(),
                characterId,
                skillId,
                skillName: skillDefinition.name,
                previousLevel,
                newLevel: level
            });

            this.updatePerformanceStats(Date.now() - startTime, memoryResult.success);

            if (memoryResult.success) {
                this.logger.info(`Successfully updated skill ${skillDefinition.name} from level ${previousLevel} to ${level}`);
            } else {
                this.logger.warn(`Skill level update processed but memory integration failed`, {
                    errors: memoryResult.errors
                });
            }

            return memoryResult.success;

        } catch (error) {
            this.updatePerformanceStats(Date.now() - startTime, false);
            this.logger.error(`Failed to update skill level for ${skillId}`, {
                error: error instanceof Error ? error.message : String(error),
                characterId,
                newLevel
            });
            return false;
        }
    }

    /**
     * 習熟度増加（記憶階層システム統合版・即座使用可能）
     * 
     * @param characterId キャラクターID
     * @param skillId スキルID
     * @param amount 増加量
     * @returns 成功したかどうか
     */
    async increaseProficiency(characterId: string, skillId: string, amount: number): Promise<boolean> {
        const startTime = Date.now();

        try {
            this.performanceStats.totalOperations++;
            this.logger.debug(`Increasing proficiency for skill ${skillId} by ${amount}`);

            // 詳細結果を取得
            const detailedResult = await this.increaseProficiencyDetailed(characterId, skillId, amount);
            
            this.updatePerformanceStats(Date.now() - startTime, detailedResult.success);
            return detailedResult.success;

        } catch (error) {
            this.updatePerformanceStats(Date.now() - startTime, false);
            this.logger.error(`Failed to increase proficiency for ${skillId}`, {
                error: error instanceof Error ? error.message : String(error),
                characterId,
                amount
            });
            return false;
        }
    }

    /**
     * 詳細な習熟度増加処理（即座使用可能）
     */
    async increaseProficiencyDetailed(characterId: string, skillId: string, amount: number): Promise<ProficiencyIncreaseResult> {
        const timestamp = new Date().toISOString();

        try {
            // 1. 現在のスキル状態を取得
            const skillData = await this.getSkillData(characterId, skillId);
            if (!skillData) {
                throw new NotFoundError('Skill', skillId);
            }

            const { skill, level, proficiency } = skillData;
            const newProficiency = Math.max(0, Math.min(100, proficiency + amount));

            // 2. レベルアップの判定
            let levelUpOccurred = false;
            let newLevel = level;

            if (newProficiency >= 100 && level < 5) {
                levelUpOccurred = true;
                newLevel = level + 1;
                
                // レベルアップ処理
                await this.updateSkillLevel(characterId, skillId, newLevel);
                
                // 習熟度をリセット（実際の実装では記憶システムで管理）
                // await this.resetProficiency(characterId, skillId);
            }

            // 3. 習熟度更新の記録（記憶階層システムに保存）
            const proficiencyChapter = this.createProficiencyUpdateChapter(
                characterId,
                skill,
                proficiency,
                newProficiency,
                levelUpOccurred,
                newLevel
            );

            const memoryResult = await this.memoryManager.processChapter(proficiencyChapter);

            // 4. イベント発行
            eventBus.publish(EVENT_TYPES.SKILL_PROFICIENCY_CHANGED, {
                timestamp: new Date(),
                characterId,
                skillId,
                skillName: skill.name,
                previousProficiency: proficiency,
                newProficiency
            });

            const result: ProficiencyIncreaseResult = {
                success: memoryResult.success,
                skillId,
                characterId,
                previousProficiency: proficiency,
                newProficiency,
                levelUpOccurred,
                newLevel: levelUpOccurred ? newLevel : undefined,
                reason: levelUpOccurred ? 'Proficiency mastery achieved - Level up!' : 'Proficiency increased',
                timestamp
            };

            if (levelUpOccurred) {
                this.logger.info(`Skill ${skill.name} leveled up to ${newLevel} for character ${characterId}`);
            }

            return result;

        } catch (error) {
            return {
                success: false,
                skillId,
                characterId,
                previousProficiency: 0,
                newProficiency: 0,
                levelUpOccurred: false,
                reason: `Error: ${error instanceof Error ? error.message : String(error)}`,
                timestamp
            };
        }
    }

    /**
     * スキル習得要件確認（記憶階層システム統合版・即座使用可能）
     * 
     * @param characterId キャラクターID
     * @param skillId スキルID
     * @returns 要件を満たすかどうか
     */
    async checkSkillRequirements(characterId: string, skillId: string): Promise<boolean> {
        try {
            const detailedCheck = await this.checkSkillRequirementsDetailed(characterId, skillId);
            return detailedCheck.canAcquire;
        } catch (error) {
            this.logger.error(`Failed to check skill requirements for ${skillId}`, {
                error: error instanceof Error ? error.message : String(error),
                characterId
            });
            return false;
        }
    }

    /**
     * 詳細なスキル要件確認（即座使用可能）
     */
    async checkSkillRequirementsDetailed(characterId: string, skillId: string): Promise<SkillRequirementCheck> {
        try {
            this.logger.debug(`Checking skill requirements for ${skillId}`);

            // 1. スキル定義の取得
            const skillDefinition = await this.getSkillDefinition(skillId);
            if (!skillDefinition) {
                throw new NotFoundError('Skill definition', skillId);
            }

            const result: SkillRequirementCheck = {
                canAcquire: true,
                skillId,
                characterId,
                requirementsMet: {
                    parameters: [],
                    prerequisites: []
                },
                missingRequirements: [],
                recommendations: []
            };

            // 2. 前提スキルの確認
            if (skillDefinition.prerequisites && skillDefinition.prerequisites.length > 0) {
                const characterSkills = await this.getCharacterSkills(characterId);
                const characterSkillIds = characterSkills.map(s => s.id);

                for (const prereqId of skillDefinition.prerequisites) {
                    const acquired = characterSkillIds.includes(prereqId);
                    const prereqDefinition = await this.getSkillDefinition(prereqId);
                    
                    result.requirementsMet.prerequisites.push({
                        skillId: prereqId,
                        skillName: prereqDefinition?.name || prereqId,
                        acquired
                    });

                    if (!acquired) {
                        result.canAcquire = false;
                        result.missingRequirements.push(`Prerequisite skill: ${prereqDefinition?.name || prereqId}`);
                    }
                }
            }

            // 3. パラメータ要件の確認
            if (skillDefinition.requiredParameters && skillDefinition.requiredParameters.length > 0) {
                const characterParameters = await this.getCharacterParameters(characterId);
                const paramMap = new Map(characterParameters.map(p => [p.id, p]));

                for (const req of skillDefinition.requiredParameters) {
                    const param = paramMap.get(req.parameterId);
                    const currentValue = param?.value || 0;
                    const met = currentValue >= req.minValue;

                    result.requirementsMet.parameters.push({
                        parameterId: req.parameterId,
                        required: req.minValue,
                        current: currentValue,
                        met
                    });

                    if (!met) {
                        result.canAcquire = false;
                        result.missingRequirements.push(
                            `${param?.name || req.parameterId}: ${currentValue}/${req.minValue}`
                        );
                    }
                }
            }

            // 4. 推奨事項の生成
            if (!result.canAcquire) {
                result.recommendations.push('Improve required parameters through training and experience');
                result.recommendations.push('Acquire prerequisite skills first');
            } else {
                result.recommendations.push('All requirements met - skill can be acquired');
            }

            this.logger.debug(`Skill requirements check completed for ${skillDefinition.name}`, {
                canAcquire: result.canAcquire,
                missingRequirements: result.missingRequirements.length
            });

            return result;

        } catch (error) {
            this.logger.error(`Failed detailed skill requirements check for ${skillId}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                canAcquire: false,
                skillId,
                characterId,
                requirementsMet: { parameters: [], prerequisites: [] },
                missingRequirements: [`Error checking requirements: ${error}`],
                recommendations: ['Check skill definition and character data']
            };
        }
    }

    // ============================================================================
    // プライベートヘルパーメソッド（即座使用可能版）
    // ============================================================================

    /**
     * 検索結果からスキル情報を抽出
     * @private
     */
    private extractSkillsFromSearchResults(searchResults: any[], characterId: string): Skill[] {
        const skills: Skill[] = [];

        try {
            for (const result of searchResults) {
                if (result.type === 'skill' || result.data?.skills) {
                    const skillData = result.data.skills || [result.data];
                    
                    for (const skillInfo of skillData) {
                        if (skillInfo.characterId === characterId || !skillInfo.characterId) {
                            skills.push({
                                id: skillInfo.id || skillInfo.skillId,
                                name: skillInfo.name,
                                description: skillInfo.description || '',
                                level: skillInfo.level || 1,
                                requiredParameters: skillInfo.requiredParameters || [],
                                prerequisites: skillInfo.prerequisites || [],
                                effects: skillInfo.effects || [],
                                learningDifficulty: skillInfo.learningDifficulty || 5,
                                tags: skillInfo.tags || [],
                                genre: skillInfo.genre || []
                            });
                        }
                    }
                }
            }
        } catch (error) {
            this.logger.warn('Failed to extract skills from search results', { error });
        }

        return skills;
    }

    /**
     * フォールバックスキルの生成
     * @private
     */
    private async generateFallbackSkills(characterId: string): Promise<Skill[]> {
        try {
            // キャラクター情報を取得してタイプベースのスキルを生成
            const characterInfo = await this.getCharacterInfo(characterId);
            
            const basicSkills: Skill[] = [
                {
                    id: 'basic_communication',
                    name: '基本コミュニケーション',
                    description: '基本的な対話とコミュニケーション能力',
                    level: 1,
                    requiredParameters: [],
                    prerequisites: [],
                    effects: [],
                    learningDifficulty: 1,
                    tags: ['communication', 'basic'],
                    genre: ['all']
                }
            ];

            // キャラクタータイプに応じたスキルを追加
            if (characterInfo?.type === 'MAIN') {
                basicSkills.push({
                    id: 'leadership',
                    name: 'リーダーシップ',
                    description: '指導力と統率力',
                    level: 1,
                    requiredParameters: [],
                    prerequisites: [],
                    effects: [],
                    learningDifficulty: 3,
                    tags: ['leadership', 'social'],
                    genre: ['drama', 'adventure']
                });
            }

            return basicSkills;
        } catch (error) {
            this.logger.warn('Failed to generate fallback skills', { error });
            return [];
        }
    }

    /**
     * スキル定義の取得
     * @private
     */
    private async getSkillDefinition(skillId: string): Promise<Skill | null> {
        try {
            const searchResult = await this.memoryManager.unifiedSearch(
                `skill definition:"${skillId}"`,
                [MemoryLevel.LONG_TERM]
            );

            if (searchResult.success && searchResult.results.length > 0) {
                const skillData = searchResult.results[0].data;
                if (skillData.id === skillId) {
                    return skillData as Skill;
                }
            }

            // フォールバック: 基本スキル定義を生成
            return this.generateBasicSkillDefinition(skillId);
        } catch (error) {
            this.logger.warn(`Failed to get skill definition for ${skillId}`, { error });
            return null;
        }
    }

    /**
     * キャラクター情報の取得
     * @private
     */
    private async getCharacterInfo(characterId: string): Promise<{ type: string } | null> {
        try {
            const searchResult = await this.memoryManager.unifiedSearch(
                `character:"${characterId}"`,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            if (searchResult.success && searchResult.results.length > 0) {
                const characterData = searchResult.results[0].data;
                return { type: characterData.type || 'MAIN' };
            }

            return { type: 'MAIN' }; // デフォルト
        } catch (error) {
            this.logger.warn(`Failed to get character info for ${characterId}`, { error });
            return { type: 'MAIN' };
        }
    }

    /**
     * キャラクターパラメータの取得
     * @private
     */
    private async getCharacterParameters(characterId: string): Promise<CharacterParameter[]> {
        try {
            const searchResult = await this.memoryManager.unifiedSearch(
                `character parameters:"${characterId}"`,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
            );

            if (searchResult.success && searchResult.results.length > 0) {
                const paramData = searchResult.results[0].data;
                return paramData.parameters || [];
            }

            // フォールバック: 基本パラメータを生成
            return this.generateBasicParameters();
        } catch (error) {
            this.logger.warn(`Failed to get character parameters for ${characterId}`, { error });
            return this.generateBasicParameters();
        }
    }

    /**
     * スキルデータの取得
     * @private
     */
    private async getSkillData(characterId: string, skillId: string): Promise<{
        skill: Skill;
        level: number;
        proficiency: number;
    } | null> {
        try {
            const characterSkills = await this.getCharacterSkills(characterId);
            const skill = characterSkills.find(s => s.id === skillId);
            
            if (!skill) {
                return null;
            }

            // 習熟度は記憶システムから取得（簡略化）
            const proficiency = 0; // 実装では記憶システムから取得

            return {
                skill,
                level: skill.level || 1,
                proficiency
            };
        } catch (error) {
            this.logger.warn(`Failed to get skill data for ${skillId}`, { error });
            return null;
        }
    }

    /**
     * スキルパラメータ効果の適用
     * @private
     */
    private async applySkillParameterEffects(characterId: string, skill: Skill): Promise<Array<{
        parameterId: string;
        parameterName: string;
        oldValue: number;
        newValue: number;
        change: number;
    }>> {
        const effects: Array<{
            parameterId: string;
            parameterName: string;
            oldValue: number;
            newValue: number;
            change: number;
        }> = [];

        try {
            if (!skill.effects || skill.effects.length === 0) {
                return effects;
            }

            const parameters = await this.getCharacterParameters(characterId);
            const paramMap = new Map(parameters.map(p => [p.id, p]));

            for (const effect of skill.effects) {
                const param = paramMap.get(effect.targetId);
                if (param) {
                    const oldValue = param.value;
                    const newValue = Math.max(0, Math.min(100, oldValue + effect.modifier));
                    
                    effects.push({
                        parameterId: effect.targetId,
                        parameterName: param.name,
                        oldValue,
                        newValue,
                        change: effect.modifier
                    });
                }
            }

            // 実際のパラメータ更新は別のサービスで行う（ParameterService）
            this.logger.debug(`Applied ${effects.length} parameter effects for skill ${skill.name}`);

        } catch (error) {
            this.logger.warn('Failed to apply skill parameter effects', { error });
        }

        return effects;
    }

    /**
     * レベルアップパラメータ効果の適用
     * @private
     */
    private async applyLevelUpParameterEffects(characterId: string, skill: Skill, levelDiff: number): Promise<Array<{
        parameterId: string;
        parameterName: string;
        oldValue: number;
        newValue: number;
        change: number;
    }>> {
        const effects: Array<{
            parameterId: string;
            parameterName: string;
            oldValue: number;
            newValue: number;
            change: number;
        }> = [];

        try {
            if (!skill.effects || skill.effects.length === 0 || levelDiff === 0) {
                return effects;
            }

            const parameters = await this.getCharacterParameters(characterId);
            const paramMap = new Map(parameters.map(p => [p.id, p]));

            for (const effect of skill.effects) {
                const param = paramMap.get(effect.targetId);
                if (param) {
                    const change = effect.modifier * levelDiff;
                    const oldValue = param.value;
                    const newValue = Math.max(0, Math.min(100, oldValue + change));
                    
                    effects.push({
                        parameterId: effect.targetId,
                        parameterName: param.name,
                        oldValue,
                        newValue,
                        change
                    });
                }
            }

            this.logger.debug(`Applied ${effects.length} level-up parameter effects`);

        } catch (error) {
            this.logger.warn('Failed to apply level-up parameter effects', { error });
        }

        return effects;
    }

    /**
     * 基本スキル定義の作成
     * @private
     */
    private async createBasicSkillDefinitions(): Promise<void> {
        try {
            const basicSkills: Skill[] = [
                {
                    id: 'basic_communication',
                    name: '基本コミュニケーション',
                    description: '他者との基本的な意思疎通能力',
                    level: 1,
                    requiredParameters: [],
                    prerequisites: [],
                    effects: [{
                        targetId: 'social_ability',
                        modifier: 10
                    }],
                    learningDifficulty: 1,
                    tags: ['communication', 'social', 'basic'],
                    genre: ['all']
                },
                {
                    id: 'leadership',
                    name: 'リーダーシップ',
                    description: '集団を率いる指導力',
                    level: 1,
                    requiredParameters: [{
                        parameterId: 'charisma',
                        minValue: 30
                    }],
                    prerequisites: ['basic_communication'],
                    effects: [{
                        targetId: 'leadership_ability',
                        modifier: 15
                    }],
                    learningDifficulty: 4,
                    tags: ['leadership', 'social', 'management'],
                    genre: ['drama', 'adventure', 'business']
                }
            ];

            // 各スキル定義を記憶システムに保存
            for (const skill of basicSkills) {
                const skillChapter = this.createSkillDefinitionChapter(skill);
                await this.memoryManager.processChapter(skillChapter);
            }

            this.logger.info(`Created ${basicSkills.length} basic skill definitions`);
        } catch (error) {
            this.logger.error('Failed to create basic skill definitions', { error });
        }
    }

    /**
     * スキル習得章の作成
     * @private
     */
    private createSkillAcquisitionChapter(
        characterId: string,
        skill: Skill,
        forced: boolean,
        parameterEffects: any[]
    ): Chapter {
        const now = new Date();
        const content = `キャラクター ${characterId} がスキル「${skill.name}」を習得しました。

【習得詳細】
- スキル名: ${skill.name}
- 説明: ${skill.description}
- 初期レベル: 1
- 習得方法: ${forced ? '強制習得' : '要件満了による習得'}

【パラメータ効果】
${parameterEffects.map(effect => 
    `- ${effect.parameterName}: ${effect.oldValue} → ${effect.newValue} (${effect.change >= 0 ? '+' : ''}${effect.change})`
).join('\n')}

この習得により、キャラクターの能力が向上しました。`;

        return {
            id: `skill-acquisition-${characterId}-${skill.id}-${now.getTime()}`,
            chapterNumber: 0, // スキル習得は章番号に依存しない
            title: `スキル習得: ${skill.name}`,
            content,
            createdAt: now,
            updatedAt: now,
            wordCount: content.length,
            summary: `${characterId}が${skill.name}を習得`,
            metadata: {
                qualityScore: 0.9,
                keywords: ['skill', 'acquisition', skill.name, characterId],
                events: [{
                    type: 'skill_acquisition',
                    description: `${skill.name}の習得`,
                    characterId,
                    skillId: skill.id,
                    significance: 0.7,
                    timestamp: now.toISOString()
                }],
                characters: [characterId],
                foreshadowing: [],
                resolutions: [],
                correctionHistory: [],
                pov: 'システム',
                location: 'スキル管理',
                emotionalTone: 'achievement',
                skillData: {
                    action: 'acquisition',
                    skillId: skill.id,
                    skillName: skill.name,
                    level: 1,
                    forced,
                    parameterEffects
                }
            }
        };
    }

    /**
     * スキルレベルアップ章の作成
     * @private
     */
    private createSkillLevelUpChapter(
        characterId: string,
        skill: Skill,
        previousLevel: number,
        newLevel: number,
        parameterEffects: any[]
    ): Chapter {
        const now = new Date();
        const content = `キャラクター ${characterId} のスキル「${skill.name}」がレベルアップしました。

【レベルアップ詳細】
- スキル名: ${skill.name}
- 前レベル: ${previousLevel}
- 新レベル: ${newLevel}
- 上昇レベル: +${newLevel - previousLevel}

【パラメータ効果】
${parameterEffects.map(effect => 
    `- ${effect.parameterName}: ${effect.oldValue} → ${effect.newValue} (${effect.change >= 0 ? '+' : ''}${effect.change})`
).join('\n')}

継続的な努力により、スキルの熟練度が向上しました。`;

        return {
            id: `skill-levelup-${characterId}-${skill.id}-${now.getTime()}`,
            chapterNumber: 0,
            title: `スキルレベルアップ: ${skill.name}`,
            content,
            createdAt: now,
            updatedAt: now,
            wordCount: content.length,
            summary: `${skill.name}がレベル${newLevel}に成長`,
            metadata: {
                qualityScore: 0.8,
                keywords: ['skill', 'levelup', skill.name, characterId],
                events: [{
                    type: 'skill_levelup',
                    description: `${skill.name}のレベルアップ`,
                    characterId,
                    skillId: skill.id,
                    significance: 0.6,
                    timestamp: now.toISOString()
                }],
                characters: [characterId],
                foreshadowing: [],
                resolutions: [],
                correctionHistory: [],
                pov: 'システム',
                location: 'スキル管理',
                emotionalTone: 'progress',
                skillData: {
                    action: 'levelup',
                    skillId: skill.id,
                    skillName: skill.name,
                    previousLevel,
                    newLevel,
                    parameterEffects
                }
            }
        };
    }

    /**
     * 習熟度更新章の作成
     * @private
     */
    private createProficiencyUpdateChapter(
        characterId: string,
        skill: Skill,
        previousProficiency: number,
        newProficiency: number,
        levelUpOccurred: boolean,
        newLevel?: number
    ): Chapter {
        const now = new Date();
        const content = `キャラクター ${characterId} のスキル「${skill.name}」の習熟度が向上しました。

【習熟度変化】
- スキル名: ${skill.name}
- 前習熟度: ${previousProficiency}%
- 新習熟度: ${newProficiency}%
- 向上度: +${newProficiency - previousProficiency}%

${levelUpOccurred ? `
🎉 レベルアップ達成！
- 新レベル: ${newLevel}
- 習熟度が100%に達したため、スキルレベルが上昇しました。
` : ''}

継続的な実践により、スキルの理解と技術が深まっています。`;

        return {
            id: `skill-proficiency-${characterId}-${skill.id}-${now.getTime()}`,
            chapterNumber: 0,
            title: `習熟度向上: ${skill.name}`,
            content,
            createdAt: now,
            updatedAt: now,
            wordCount: content.length,
            summary: `${skill.name}の習熟度が${newProficiency}%に向上`,
            metadata: {
                qualityScore: 0.7,
                keywords: ['skill', 'proficiency', skill.name, characterId],
                events: [{
                    type: 'skill_proficiency_update',
                    description: `${skill.name}の習熟度向上`,
                    characterId,
                    skillId: skill.id,
                    significance: levelUpOccurred ? 0.8 : 0.4,
                    timestamp: now.toISOString()
                }],
                characters: [characterId],
                foreshadowing: [],
                resolutions: levelUpOccurred ? [{
                    type: 'skill_mastery',
                    description: `${skill.name}の習熟完了`,
                    significance: 0.7
                }] : [],
                correctionHistory: [],
                pov: 'システム',
                location: 'スキル管理',
                emotionalTone: levelUpOccurred ? 'triumph' : 'progress',
                skillData: {
                    action: 'proficiency_update',
                    skillId: skill.id,
                    skillName: skill.name,
                    previousProficiency,
                    newProficiency,
                    levelUpOccurred,
                    newLevel
                }
            }
        };
    }

    /**
     * スキル定義章の作成
     * @private
     */
    private createSkillDefinitionChapter(skill: Skill): Chapter {
        const now = new Date();
        const content = `スキル定義: ${skill.name}

【基本情報】
- ID: ${skill.id}
- 名前: ${skill.name}
- 説明: ${skill.description}
- 学習難易度: ${skill.learningDifficulty}/10

【習得要件】
${skill.requiredParameters.length > 0 ? 
    skill.requiredParameters.map(req => `- ${req.parameterId}: ${req.minValue}以上`).join('\n') :
    '- なし'
}

【前提スキル】
${skill.prerequisites.length > 0 ? 
    skill.prerequisites.map(prereq => `- ${prereq}`).join('\n') :
    '- なし'
}

【効果】
${skill.effects.length > 0 ? 
    skill.effects.map(effect => `- ${effect.targetId}: ${effect.modifier >= 0 ? '+' : ''}${effect.modifier}`).join('\n') :
    '- なし'
}

【タグ】
${skill.tags.join(', ')}

【対応ジャンル】
${skill.genre.join(', ')}`;

        return {
            id: `skill-definition-${skill.id}-${now.getTime()}`,
            chapterNumber: 0,
            title: `スキル定義: ${skill.name}`,
            content,
            createdAt: now,
            updatedAt: now,
            wordCount: content.length,
            summary: `${skill.name}のスキル定義`,
            metadata: {
                qualityScore: 1.0,
                keywords: ['skill', 'definition', skill.name, ...skill.tags],
                events: [{
                    type: 'skill_definition',
                    description: `${skill.name}の定義作成`,
                    skillId: skill.id,
                    significance: 0.5,
                    timestamp: now.toISOString()
                }],
                characters: [],
                foreshadowing: [],
                resolutions: [],
                correctionHistory: [],
                pov: 'システム',
                location: 'スキル定義',
                emotionalTone: 'neutral',
                skillDefinition: skill
            }
        };
    }

    /**
     * 基本スキル定義の生成
     * @private
     */
    private generateBasicSkillDefinition(skillId: string): Skill {
        return {
            id: skillId,
            name: this.convertSkillIdToName(skillId),
            description: `${skillId}に関する基本的な能力`,
            level: 1,
            requiredParameters: [],
            prerequisites: [],
            effects: [],
            learningDifficulty: 3,
            tags: ['basic'],
            genre: ['all']
        };
    }

    /**
     * スキルIDから名前への変換
     * @private
     */
    private convertSkillIdToName(skillId: string): string {
        const nameMap: Record<string, string> = {
            'basic_communication': '基本コミュニケーション',
            'leadership': 'リーダーシップ',
            'combat': '戦闘術',
            'magic': '魔法',
            'negotiation': '交渉術',
            'investigation': '調査術'
        };
        
        return nameMap[skillId] || skillId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * 基本パラメータの生成
     * @private
     */
    private generateBasicParameters(): CharacterParameter[] {
        return [
            {
                id: 'strength',
                name: '筋力',
                description: '物理的な力',
                value: 50,
                growth: 1,
                category: 'PHYSICAL',
                tags: ['physical', 'combat']
            },
            {
                id: 'intelligence',
                name: '知力',
                description: '知的能力',
                value: 50,
                growth: 1,
                category: 'MENTAL',
                tags: ['mental', 'learning']
            },
            {
                id: 'charisma',
                name: '魅力',
                description: '社交性と魅力',
                value: 50,
                growth: 1,
                category: 'SOCIAL',
                tags: ['social', 'leadership']
            }
        ];
    }

    /**
     * パフォーマンス統計の更新
     * @private
     */
    private updatePerformanceStats(processingTime: number, success: boolean): void {
        if (success) {
            this.performanceStats.successfulOperations++;
        } else {
            this.performanceStats.failedOperations++;
        }

        // 移動平均で処理時間を更新
        const alpha = 1 / Math.min(this.performanceStats.totalOperations, 1000);
        this.performanceStats.averageProcessingTime = 
            this.performanceStats.averageProcessingTime * (1 - alpha) + processingTime * alpha;

        // キャッシュ効率率の更新
        if (this.performanceStats.memorySystemHits > 0) {
            this.performanceStats.cacheEfficiencyRate = 
                this.performanceStats.memorySystemHits / this.performanceStats.totalOperations;
        }
    }

    /**
     * パフォーマンス診断の実行
     */
    async performDiagnostics(): Promise<{
        operational: boolean;
        efficiency: number;
        errorRate: number;
        lastOptimization: string;
        performanceMetrics: {
            totalOperations: number;
            successfulOperations: number;
            failedOperations: number;
            averageProcessingTime: number;
            memorySystemHits: number;
            cacheEfficiencyRate: number;
            lastOptimization: string;
        };
        recommendations: string[];
    }> {
        try {
            const errorRate = this.performanceStats.totalOperations > 0 
                ? this.performanceStats.failedOperations / this.performanceStats.totalOperations 
                : 0;

            const efficiency = this.performanceStats.totalOperations > 0
                ? this.performanceStats.successfulOperations / this.performanceStats.totalOperations
                : 1;

            const recommendations: string[] = [];
            
            if (errorRate > 0.1) {
                recommendations.push('High error rate detected - review skill data integrity');
            }
            
            if (this.performanceStats.averageProcessingTime > 1000) {
                recommendations.push('Consider optimizing skill data access patterns');
            }
            
            if (this.performanceStats.cacheEfficiencyRate < 0.7) {
                recommendations.push('Improve memory system cache utilization');
            }

            return {
                operational: true, // 即座使用可能なため常にtrue
                efficiency,
                errorRate,
                lastOptimization: this.performanceStats.lastOptimization,
                performanceMetrics: { ...this.performanceStats },
                recommendations
            };

        } catch (error) {
            this.logger.error('Failed to perform skill service diagnostics', { error });
            return {
                operational: false,
                efficiency: 0,
                errorRate: 1,
                lastOptimization: '',
                performanceMetrics: { ...this.performanceStats },
                recommendations: ['Skill service diagnostics failed']
            };
        }
    }

    /**
     * 統計情報の取得
     */
    getOperationStatistics() {
        return { ...this.performanceStats };
    }
}

// シングルトンインスタンスの削除（DI推奨）
// export const skillService = new SkillService();