/**
 * @fileoverview キャラクタースキルサービス
 * @description
 * キャラクタースキルの管理を担当するサービス。
 * スキルの取得、習得、レベル更新、習熟度管理機能を提供します。
 */
import { ISkillService } from '../core/interfaces';
import { Skill } from '../core/types';
import { ISkillRepository } from '../core/interfaces';
import { IParameterRepository } from '../core/interfaces';
import { skillRepository } from '../repositories/skill-repository';
import { parameterRepository } from '../repositories/parameter-repository';
import { logger } from '@/lib/utils/logger';
import { NotFoundError } from '../core/errors';
import { eventBus } from '../events/character-event-bus';
import { EVENT_TYPES } from '../core/constants';

export class SkillService implements ISkillService {
  private repository: ISkillRepository;
  private parameterRepository: IParameterRepository;
  
  /**
   * コンストラクタ
   * @param repository スキルリポジトリ
   * @param paramRepository パラメータリポジトリ
   */
  constructor(
    repository: ISkillRepository = skillRepository,
    paramRepository: IParameterRepository = parameterRepository
  ) {
    this.repository = repository;
    this.parameterRepository = paramRepository;
    logger.info('SkillService: 初期化完了');
  }

  /**
   * キャラクタースキル取得
   * キャラクターのスキルを取得します
   * 
   * @param characterId キャラクターID
   * @returns スキルの配列
   */
  async getCharacterSkills(characterId: string): Promise<Skill[]> {
    try {
      logger.debug(`キャラクター「${characterId}」のスキルを取得します`);
      
      // スキルを取得
      const skills = await this.repository.getCharacterSkills(characterId);
      
      logger.debug(`キャラクター「${characterId}」の${skills.length}個のスキルを取得しました`);
      return skills;
    } catch (error) {
      logger.error(`キャラクター「${characterId}」のスキル取得に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * スキル取得
   * キャラクターにスキルを習得させます
   * 
   * @param characterId キャラクターID
   * @param skillId スキルID
   * @param forced 要件を無視して強制取得するか
   * @returns 成功したかどうか
   */
  async acquireSkill(characterId: string, skillId: string, forced: boolean = false): Promise<boolean> {
    try {
      logger.info(`キャラクター「${characterId}」にスキル「${skillId}」を習得させます`, {
        forced
      });
      
      // 強制取得でない場合は習得要件をチェック
      if (!forced) {
        const meetsRequirements = await this.checkSkillRequirements(characterId, skillId);
        if (!meetsRequirements) {
          logger.warn(`キャラクター「${characterId}」はスキル「${skillId}」の習得要件を満たしていません`);
          return false;
        }
      }
      
      // 全スキル定義を取得
      const allSkillDefs = await this.repository.getSkillDefinitions();
      const skillDef = allSkillDefs.find(s => s.id === skillId);
      
      if (!skillDef) {
        throw new NotFoundError('Skill', skillId);
      }
      
      // キャラクターのスキルを取得
      const existingSkills = await this.repository.getCharacterSkills(characterId);
      
      // 既に習得済みなら何もしない
      if (existingSkills.some(s => s.id === skillId)) {
        logger.debug(`キャラクター「${characterId}」は既にスキル「${skillId}」を習得しています`);
        return true;
      }
      
      // スキルを追加
      const updatedSkills = [
        ...existingSkills,
        {
          ...skillDef,
          level: 1 // 初期レベル
        }
      ];
      
      // スキルを保存
      await this.repository.saveCharacterSkills(characterId, updatedSkills);
      
      // スキル効果をパラメータに適用（レベル1相当）
      if (skillDef.effects && skillDef.effects.length > 0) {
        // パラメータを取得
        const parameters = await this.parameterRepository.getCharacterParameters(characterId);
        
        // 各効果を適用
        for (const effect of skillDef.effects) {
          const paramIndex = parameters.findIndex(p => p.id === effect.targetId);
          if (paramIndex >= 0) {
            const paramValue = parameters[paramIndex].value;
            parameters[paramIndex].value = Math.max(0, Math.min(100, paramValue + effect.modifier));
          }
        }
        
        // パラメータを保存
        await this.parameterRepository.saveCharacterParameters(characterId, parameters);
      }
      
      // イベント発行: スキル習得
      eventBus.publish(EVENT_TYPES.SKILL_ACQUIRED, {
        timestamp: new Date(),
        characterId,
        skillId,
        skillName: skillDef.name,
        level: 1,
        forced
      });
      
      logger.info(`キャラクター「${characterId}」がスキル「${skillDef.name}」を習得しました`);
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        logger.warn(`スキル「${skillId}」が見つかりません: ${error.message}`);
        return false;
      }
      
      logger.error(`キャラクター「${characterId}」のスキル「${skillId}」習得に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * スキルレベル更新
   * スキルのレベルを更新します
   * 
   * @param characterId キャラクターID
   * @param skillId スキルID
   * @param newLevel 新しいレベル
   * @returns 成功したかどうか
   */
  async updateSkillLevel(characterId: string, skillId: string, newLevel: number): Promise<boolean> {
    try {
      logger.info(`キャラクター「${characterId}」のスキル「${skillId}」のレベルを${newLevel}に更新します`);
      
      // レベルを1〜5に制限
      const level = Math.max(1, Math.min(5, newLevel));
      
      // キャラクターのスキルを取得
      const skills = await this.repository.getCharacterSkills(characterId);
      const skillIndex = skills.findIndex(s => s.id === skillId);
      
      if (skillIndex === -1) {
        throw new NotFoundError('Skill', skillId);
      }
      
      // 変更前のレベルを記録
      const previousLevel = skills[skillIndex].level;
      
      // 同じレベルなら変更なし
      if (previousLevel === level) {
        return true;
      }
      
      // スキル定義を取得
      const allSkillDefs = await this.repository.getSkillDefinitions();
      const skillDef = allSkillDefs.find(s => s.id === skillId);
      
      if (!skillDef) {
        throw new NotFoundError('Skill definition', skillId);
      }
      
      // レベルを更新
      skills[skillIndex].level = level;
      
      // スキルを保存
      await this.repository.saveCharacterSkills(characterId, skills);
      
      // スキル効果をパラメータに適用（レベル差分に応じて）
      if (skillDef.effects && skillDef.effects.length > 0) {
        // レベル差分に基づく係数
        const levelDiff = level - previousLevel;
        
        // パラメータを取得
        const parameters = await this.parameterRepository.getCharacterParameters(characterId);
        
        // 各効果を適用
        for (const effect of skillDef.effects) {
          const paramIndex = parameters.findIndex(p => p.id === effect.targetId);
          if (paramIndex >= 0) {
            const paramValue = parameters[paramIndex].value;
            parameters[paramIndex].value = Math.max(0, Math.min(100, 
              paramValue + (effect.modifier * levelDiff)
            ));
          }
        }
        
        // パラメータを保存
        await this.parameterRepository.saveCharacterParameters(characterId, parameters);
      }
      
      // イベント発行: スキルレベルアップ
      eventBus.publish(EVENT_TYPES.SKILL_LEVEL_UP, {
        timestamp: new Date(),
        characterId,
        skillId,
        skillName: skillDef.name,
        previousLevel,
        newLevel: level
      });
      
      logger.info(`キャラクター「${characterId}」のスキル「${skillDef.name}」のレベルを${previousLevel}から${level}に更新しました`);
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        logger.warn(error.message);
        return false;
      }
      
      logger.error(`キャラクター「${characterId}」のスキル「${skillId}」のレベル更新に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 習熟度増加
   * スキルの習熟度を増加させます
   * 
   * @param characterId キャラクターID
   * @param skillId スキルID
   * @param amount 増加量
   * @returns 成功したかどうか
   */
  async increaseProficiency(characterId: string, skillId: string, amount: number): Promise<boolean> {
    try {
      logger.debug(`キャラクター「${characterId}」のスキル「${skillId}」の習熟度を${amount}増加させます`);
      
      // キャラクターのスキルを取得
      const skillData = await this.getSkillData(characterId, skillId);
      if (!skillData) {
        throw new NotFoundError('Skill', skillId);
      }
      
      // 習熟度を更新
      const { skill, proficiency, level } = skillData;
      const newProficiency = Math.max(0, Math.min(100, proficiency + amount));
      
      // 習熟度をアップデート
      await this.repository.updateSkillProficiency(characterId, skillId, newProficiency);
      
      // イベント発行: 習熟度変更
      eventBus.publish(EVENT_TYPES.SKILL_PROFICIENCY_CHANGED, {
        timestamp: new Date(),
        characterId,
        skillId,
        skillName: skill.name,
        previousProficiency: proficiency,
        newProficiency
      });
      
      // レベルアップの条件をチェック
      if (newProficiency >= 100 && level < 5) {
        // 習熟度をリセットしてレベルアップ
        await this.repository.updateSkillProficiency(characterId, skillId, 0);
        await this.updateSkillLevel(characterId, skillId, level + 1);
        
        logger.info(`キャラクター「${characterId}」のスキル「${skill.name}」が習熟度満了でレベルアップしました: ${level} -> ${level + 1}`);
      } else {
        logger.debug(`キャラクター「${characterId}」のスキル「${skill.name}」の習熟度を${proficiency}から${newProficiency}に更新しました`);
      }
      
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        logger.warn(error.message);
        return false;
      }
      
      logger.error(`キャラクター「${characterId}」のスキル「${skillId}」の習熟度更新に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * スキル習得要件確認
   * スキルの習得要件を満たしているか確認します
   * 
   * @param characterId キャラクターID
   * @param skillId スキルID
   * @returns 要件を満たすかどうか
   */
  async checkSkillRequirements(characterId: string, skillId: string): Promise<boolean> {
    try {
      logger.debug(`キャラクター「${characterId}」のスキル「${skillId}」習得要件をチェックします`);
      
      // スキル定義を取得
      const allSkillDefs = await this.repository.getSkillDefinitions();
      const skillDef = allSkillDefs.find(s => s.id === skillId);
      
      if (!skillDef) {
        throw new NotFoundError('Skill definition', skillId);
      }
      
      // 前提スキルの確認
      if (skillDef.prerequisites && skillDef.prerequisites.length > 0) {
        const characterSkills = await this.repository.getCharacterSkills(characterId);
        const characterSkillIds = characterSkills.map(s => s.id);
        
        for (const prereqId of skillDef.prerequisites) {
          if (!characterSkillIds.includes(prereqId)) {
            logger.debug(`キャラクター「${characterId}」は前提スキル「${prereqId}」を習得していません`);
            return false;
          }
        }
      }
      
      // パラメータ要件の確認
      if (skillDef.requiredParameters && skillDef.requiredParameters.length > 0) {
        const parameters = await this.parameterRepository.getCharacterParameters(characterId);
        const paramMap = new Map(parameters.map(p => [p.id, p]));
        
        for (const req of skillDef.requiredParameters) {
          const param = paramMap.get(req.parameterId);
          if (!param || param.value < req.minValue) {
            const paramDef = await this.parameterRepository.getParameterDefinitions().then(
              defs => defs.find(d => d.id === req.parameterId)
            );
            
            logger.debug(`キャラクター「${characterId}」のパラメータ「${paramDef?.name || req.parameterId}」が要件を満たしていません（必要:${req.minValue}, 現在:${param?.value || 0}）`);
            return false;
          }
        }
      }
      
      // すべての要件を満たしている
      logger.debug(`キャラクター「${characterId}」はスキル「${skillDef.name}」の習得要件を満たしています`);
      return true;
    } catch (error) {
      logger.error(`スキル「${skillId}」の習得要件チェックに失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * ジャンル別スキル取得
   * 指定したジャンルに適したスキルを取得します
   * 
   * @param genre ジャンル
   * @returns スキルの配列
   */
  async getSkillsForGenre(genre: string): Promise<Skill[]> {
    try {
      logger.debug(`「${genre}」ジャンルに適したスキルを取得します`);
      
      // 全スキル定義を取得
      const allSkillDefs = await this.repository.getSkillDefinitions();
      
      // ジャンルでフィルタリング
      const genreSkills = allSkillDefs.filter(skill => 
        skill.genre && skill.genre.some(g => g.toLowerCase() === genre.toLowerCase())
      );
      
      return genreSkills;
    } catch (error) {
      logger.error(`「${genre}」ジャンル用スキルの取得に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * タグ別スキル取得
   * 指定したタグを持つスキルを取得します
   * 
   * @param tag タグ
   * @returns スキルの配列
   */
  async getSkillsByTag(tag: string): Promise<Skill[]> {
    try {
      logger.debug(`「${tag}」タグを持つスキルを取得します`);
      
      // 全スキル定義を取得
      const allSkillDefs = await this.repository.getSkillDefinitions();
      
      // タグでフィルタリング
      const taggedSkills = allSkillDefs.filter(skill => 
        skill.tags && skill.tags.some(t => t.toLowerCase() === tag.toLowerCase())
      );
      
      return taggedSkills;
    } catch (error) {
      logger.error(`「${tag}」タグを持つスキルの取得に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * スキル詳細取得
   * スキルの詳細情報を取得します
   * 
   * @param skillId スキルID
   * @returns スキル詳細情報
   */
  async getSkillDetails(skillId: string): Promise<Skill | null> {
    try {
      logger.debug(`スキル「${skillId}」の詳細情報を取得します`);
      
      // 全スキル定義を取得
      const allSkillDefs = await this.repository.getSkillDefinitions();
      
      // スキルを検索
      const skillDef = allSkillDefs.find(s => s.id === skillId);
      
      if (!skillDef) {
        logger.warn(`スキル定義「${skillId}」が見つかりません`);
        return null;
      }
      
      return skillDef;
    } catch (error) {
        logger.error(`スキル「${skillId}」の詳細取得に失敗しました`, {
            error: error instanceof Error ? error.message : String(error)
          });
          return null;
        }
      }
    
      /**
       * スキルデータの取得
       * キャラクターのスキルレベルと習熟度を含むデータを取得します
       * 
       * @private
       * @param characterId キャラクターID
       * @param skillId スキルID
       */
      private async getSkillData(characterId: string, skillId: string): Promise<{
        skill: Skill;
        level: number;
        proficiency: number;
      } | null> {
        try {
          // キャラクターのスキルと習熟度データを取得
          const characterSkills = await this.repository.getCharacterSkills(characterId);
          
          // スキルが見つからなければnullを返す
          const skillIndex = characterSkills.findIndex(s => s.id === skillId);
          if (skillIndex === -1) {
            return null;
          }
          
          // スキル定義を取得
          const allSkillDefs = await this.repository.getSkillDefinitions();
          const skillDef = allSkillDefs.find(s => s.id === skillId);
          
          if (!skillDef) {
            return null;
          }
          
          // スキルデータを返す
          return {
            skill: skillDef,
            level: characterSkills[skillIndex].level || 1,
            proficiency: 0 // リポジトリからの実際の習熟度を取得するようにすべき
          };
        } catch (error) {
          logger.error(`スキルデータの取得に失敗しました: ${characterId}, ${skillId}`, {
            error: error instanceof Error ? error.message : String(error)
          });
          return null;
        }
      }
    }
    
    // シングルトンインスタンスをエクスポート
    export const skillService = new SkillService();