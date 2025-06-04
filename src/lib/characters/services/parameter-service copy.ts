/**
 * @fileoverview キャラクターパラメータサービス
 * @description
 * キャラクターパラメータの管理を担当するサービス。
 * パラメータの初期化、取得、更新機能を提供します。
 */
import { IParameterService } from '../core/interfaces';
import { CharacterParameter, ParameterCategory } from '../core/types';
import { IParameterRepository } from '../core/interfaces';
import { parameterRepository } from '../repositories/parameter-repository';
import { logger } from '@/lib/utils/logger';
import { NotFoundError } from '../core/errors';
import { eventBus } from '../events/character-event-bus';
import { EVENT_TYPES } from '../core/constants';

export class ParameterService implements IParameterService {
  private repository: IParameterRepository;
  
  /**
   * コンストラクタ
   * @param repository パラメータリポジトリ
   */
  constructor(repository: IParameterRepository = parameterRepository) {
    this.repository = repository;
    logger.info('ParameterService: 初期化完了');
  }

  /**
   * キャラクターパラメータ初期化
   * キャラクターに標準パラメータを設定します
   * 
   * @param characterId キャラクターID
   * @param defaultValue デフォルト値（0-100）
   * @returns 初期化されたパラメータ配列
   */
  async initializeCharacterParameters(characterId: string, defaultValue: number = 10): Promise<CharacterParameter[]> {
    try {
      logger.info(`キャラクター「${characterId}」のパラメータを初期化します`, {
        defaultValue
      });
      
      // デフォルト値を0〜100の範囲に制限
      const validDefaultValue = Math.max(0, Math.min(100, defaultValue));
      
      // 全パラメータ定義を取得
      const allDefinitions = await this.repository.getParameterDefinitions();
      
      // 既存のキャラクターパラメータを取得
      const existingParams = await this.repository.getCharacterParameters(characterId);
      const existingParamMap = new Map(existingParams.map(p => [p.id, p]));
      
      // 各パラメータをデフォルト値でコピー
      const initializedParams: CharacterParameter[] = [];
      
      for (const definition of allDefinitions) {
        // 既存のパラメータがある場合はそれを使用、ない場合は新規作成
        if (existingParamMap.has(definition.id)) {
          initializedParams.push(existingParamMap.get(definition.id)!);
        } else {
          // 新規パラメータ
          initializedParams.push({
            ...definition,
            value: validDefaultValue,
            growth: 0
          });
        }
      }
      
      // パラメータを保存
      await this.repository.saveCharacterParameters(characterId, initializedParams);
      
      // イベント発行: パラメータ初期化
      eventBus.publish(EVENT_TYPES.PARAMETER_CHANGED, {
        timestamp: new Date(),
        characterId,
        changeType: 'initialization',
        parameters: initializedParams.map(p => ({ id: p.id, name: p.name, value: p.value }))
      });
      
      logger.info(`キャラクター「${characterId}」の${initializedParams.length}個のパラメータを初期化しました`);
      return initializedParams;
    } catch (error) {
      logger.error(`キャラクター「${characterId}」のパラメータ初期化に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * キャラクターパラメータ取得
   * キャラクターのパラメータを取得します
   * 
   * @param characterId キャラクターID
   * @returns パラメータの配列
   */
  async getCharacterParameters(characterId: string): Promise<CharacterParameter[]> {
    try {
      logger.debug(`キャラクター「${characterId}」のパラメータを取得します`);
      
      // パラメータを取得
      const parameters = await this.repository.getCharacterParameters(characterId);
      
      if (parameters.length === 0) {
        logger.debug(`キャラクター「${characterId}」のパラメータは初期化されていません`);
      }
      
      return parameters;
    } catch (error) {
      logger.error(`キャラクター「${characterId}」のパラメータ取得に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * パラメータ値設定
   * 特定のパラメータの値を設定します
   * 
   * @param characterId キャラクターID
   * @param parameterId パラメータID
   * @param value 新しい値
   * @returns 更新されたパラメータまたはnull
   */
  async setParameterValue(characterId: string, parameterId: string, value: number): Promise<CharacterParameter | null> {
    try {
      logger.debug(`キャラクター「${characterId}」のパラメータ「${parameterId}」の値を${value}に設定します`);
      
      // パラメータを取得
      const parameters = await this.repository.getCharacterParameters(characterId);
      const parameter = parameters.find(p => p.id === parameterId);
      
      if (!parameter) {
        throw new NotFoundError('Parameter', parameterId);
      }
      
      // 前の値を記録（イベント用）
      const previousValue = parameter.value;
      
      // 値を0〜100の範囲に制限
      const newValue = Math.max(0, Math.min(100, value));
      parameter.value = newValue;
      
      // パラメータを保存
      await this.repository.saveCharacterParameters(characterId, parameters);
      
      // イベント発行: パラメータ変更
      eventBus.publish(EVENT_TYPES.PARAMETER_CHANGED, {
        timestamp: new Date(),
        characterId,
        parameterId,
        parameterName: parameter.name,
        previousValue,
        newValue,
        changeType: 'set'
      });
      
      logger.info(`キャラクター「${characterId}」のパラメータ「${parameter.name}」を${previousValue}から${newValue}に変更しました`);
      return parameter;
    } catch (error) {
      if (error instanceof NotFoundError) {
        logger.warn(`パラメータ「${parameterId}」が見つかりません: ${error.message}`);
        return null;
      }
      
      logger.error(`キャラクター「${characterId}」のパラメータ「${parameterId}」の設定に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * パラメータ修正
   * パラメータ値を相対的に変更します
   * 
   * @param characterId キャラクターID
   * @param parameterId パラメータID
   * @param delta 変化量
   * @returns 更新されたパラメータまたはnull
   */
  async modifyParameter(characterId: string, parameterId: string, delta: number): Promise<CharacterParameter | null> {
    try {
      logger.debug(`キャラクター「${characterId}」のパラメータ「${parameterId}」を${delta > 0 ? '+' : ''}${delta}修正します`);
      
      // パラメータを取得
      const parameters = await this.repository.getCharacterParameters(characterId);
      const parameter = parameters.find(p => p.id === parameterId);
      
      if (!parameter) {
        throw new NotFoundError('Parameter', parameterId);
      }
      
      // 前の値を記録（イベント用）
      const previousValue = parameter.value;
      
      // 値を0〜100の範囲に制限
      const newValue = Math.max(0, Math.min(100, previousValue + delta));
      parameter.value = newValue;
      
      // パラメータを保存
      await this.repository.saveCharacterParameters(characterId, parameters);
      
      // イベント発行: パラメータ変更
      eventBus.publish(EVENT_TYPES.PARAMETER_CHANGED, {
        timestamp: new Date(),
        characterId,
        parameterId,
        parameterName: parameter.name,
        previousValue,
        newValue,
        delta,
        changeType: 'modify'
      });
      
      logger.info(`キャラクター「${characterId}」のパラメータ「${parameter.name}」を${previousValue}から${newValue}に修正しました（変化量: ${delta}）`);
      return parameter;
    } catch (error) {
      if (error instanceof NotFoundError) {
        logger.warn(`パラメータ「${parameterId}」が見つかりません: ${error.message}`);
        return null;
      }
      
      logger.error(`キャラクター「${characterId}」のパラメータ「${parameterId}」の修正に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * カテゴリ別パラメータ取得
   * 指定したカテゴリのパラメータを取得します
   * 
   * @param characterId キャラクターID
   * @param category カテゴリ
   * @returns パラメータの配列
   */
  async getParametersByCategory(characterId: string, category: string): Promise<CharacterParameter[]> {
    try {
      logger.debug(`キャラクター「${characterId}」の「${category}」カテゴリのパラメータを取得します`);
      
      // パラメータを取得
      const parameters = await this.repository.getCharacterParameters(characterId);
      
      // カテゴリでフィルタリング
      const categoryParams = parameters.filter(p => p.category === category);
      
      return categoryParams;
    } catch (error) {
      logger.error(`キャラクター「${characterId}」の「${category}」カテゴリのパラメータ取得に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * タグ別パラメータ取得
   * 指定したタグを持つパラメータを取得します
   * 
   * @param tag タグ
   * @returns パラメータの配列
   */
  async getParametersByTag(tag: string): Promise<CharacterParameter[]> {
    try {
      logger.debug(`「${tag}」タグを持つパラメータ定義を取得します`);
      
      // 全パラメータ定義を取得
      const allDefinitions = await this.repository.getParameterDefinitions();
      
      // タグでフィルタリング
      const taggedParams = allDefinitions.filter(p => 
        p.tags && p.tags.some(t => t.toLowerCase() === tag.toLowerCase())
      );
      
      return taggedParams;
    } catch (error) {
      logger.error(`「${tag}」タグを持つパラメータ取得に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * ジャンル別パラメータ取得
   * 指定したジャンルに適したパラメータを取得します
   * 
   * @param genre ジャンル
   * @returns パラメータの配列
   */
  async getParametersForGenre(genre: string): Promise<CharacterParameter[]> {
    try {
      logger.debug(`「${genre}」ジャンルに適したパラメータを取得します`);
      
      // ジャンルに応じたタグのマッピング
      const genreTagMapping: Record<string, string[]> = {
        'fantasy': ['魔法', '戦闘', '冒険'],
        'business': ['経営', '交渉', 'リーダーシップ'],
        'mystery': ['観察', '推理', '記憶'],
        'romance': ['魅力', '共感', '感情'],
        'sci-fi': ['知識', '創造性', '適応力']
      };
      
      // ジャンルに対応するタグを取得
      const tags = genreTagMapping[genre.toLowerCase()] || [];
      
      // タグに該当するパラメータを集める
      const parameterSet = new Set<CharacterParameter>();
      
      for (const tag of tags) {
        const parameters = await this.getParametersByTag(tag);
        parameters.forEach(param => parameterSet.add(param));
      }
      
      return Array.from(parameterSet);
    } catch (error) {
      logger.error(`「${genre}」ジャンル用パラメータの取得に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * パラメータ定義の全取得
   * 利用可能なすべてのパラメータ定義を取得します
   * 
   * @returns パラメータ定義配列
   */
  async getAllParameterDefinitions(): Promise<CharacterParameter[]> {
    try {
      return await this.repository.getParameterDefinitions();
    } catch (error) {
      logger.error('パラメータ定義の取得に失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * パラメータ定義の取得
   * 指定したIDのパラメータ定義を取得します
   * 
   * @param parameterId パラメータID
   * @returns パラメータ定義またはnull
   */
  async getParameterById(parameterId: string): Promise<CharacterParameter | null> {
    try {
      const allDefinitions = await this.repository.getParameterDefinitions();
      return allDefinitions.find(p => p.id === parameterId) || null;
    } catch (error) {
      logger.error(`パラメータ定義「${parameterId}」の取得に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const parameterService = new ParameterService();