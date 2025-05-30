// services/character-service.ts
/**
 * @fileoverview キャラクターサービス
 * @description
 * キャラクター管理のメインロジックを提供するサービスクラス。
 * キャラクターの作成、取得、更新、登場記録、インタラクション記録などの
 * 機能を提供し、リポジトリレイヤーとの連携を担当します。
 */
import { ICharacterService } from '../core/interfaces';
import {
  Character,
  CharacterData,
  CharacterState,
  ChapterEvent,
  ValidationResult,
  CharacterAppearance,
  Interaction,
  CharacterHistory  
} from '../core/types';
import { characterRepository } from '../repositories/character-repository';
import { eventBus } from '../events/character-event-bus';
import { EVENT_TYPES } from '../core/constants';
import { logger } from '@/lib/utils/logger';
import { generateId } from '@/lib/utils/helpers';
import { CharacterError, NotFoundError, ValidationError } from '../core/errors';

/**
 * キャラクターサービスクラス
 * キャラクター管理の中心的なロジックを提供
 */
export class CharacterService implements ICharacterService {
  /**
   * 新しいキャラクターを作成する
   * @param data キャラクターデータ
   * @returns 作成されたキャラクター
   */
  async createCharacter(data: CharacterData): Promise<Character> {
    try {
      // データバリデーション
      this.validateNewCharacterData(data);

      // キャラクターオブジェクトの作成
      const character: Character = {
        id: generateId(),
        ...data,
        // ショートネームが確実に存在するように保証
        shortNames: data.shortNames || [],
        // 呼称辞書も初期化
        nicknames: data.nicknames || {},
        state: this.initializeCharacterState(data),
        history: this.initializeHistory(),
        metadata: {
          createdAt: new Date(),
          lastUpdated: new Date(),
          version: 1,
          tags: data.metadata?.tags || []
        },
      };

      // リポジトリに保存
      await characterRepository.saveCharacter(character);

      // キャラクター作成イベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_CREATED, {
        timestamp: new Date(),
        character
      });

      logger.info(`新しいキャラクターを作成しました: ${character.name} (${character.id})`);
      return character;
    } catch (error) {
      logger.error('キャラクター作成中にエラーが発生しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 新規キャラクターデータのバリデーション
   * @private
   * @param data キャラクターデータ
   */
  private validateNewCharacterData(data: CharacterData): void {
    const errors: Record<string, string[]> = {};

    // 必須フィールドの確認
    if (!data.name) {
      if (!errors.name) errors.name = [];
      errors.name.push('キャラクター名は必須です');
    }

    if (!data.type) {
      if (!errors.type) errors.type = [];
      errors.type.push('キャラクタータイプは必須です');
    }

    if (!data.description) {
      if (!errors.description) errors.description = [];
      errors.description.push('キャラクター説明は必須です');
    }

    // タイプの確認
    if (data.type && !['MAIN', 'SUB', 'MOB'].includes(data.type)) {
      if (!errors.type) errors.type = [];
      errors.type.push(`無効なキャラクタータイプです: ${data.type}`);
    }

    // 関係性データのバリデーション
    if (data.relationships) {
      errors.relationships = [];
      
      for (let i = 0; i < data.relationships.length; i++) {
        const relation = data.relationships[i];
        
        if (!relation.targetId) {
          errors.relationships.push(`関係性[${i}]: targetIdは必須です`);
        }

        if (!relation.type) {
          errors.relationships.push(`関係性[${i}]: typeは必須です`);
        }

        if (typeof relation.strength !== 'number' ||
            relation.strength < 0 ||
            relation.strength > 1) {
          errors.relationships.push(`関係性[${i}]: strengthは0〜1の数値である必要があります`);
        }
      }
      
      // エラーがなければ削除
      if (errors.relationships.length === 0) {
        delete errors.relationships;
      }
    }

    // エラーがあれば例外をスロー
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('キャラクターデータが無効です', errors);
    }
  }

  /**
   * IDによるキャラクター取得
   * @param id キャラクターID
   * @returns キャラクターオブジェクトまたはnull
   */
  async getCharacter(id: string): Promise<Character | null> {
    try {
      return await characterRepository.getCharacterById(id);
    } catch (error) {
      logger.error(`キャラクター取得中にエラーが発生しました: ${id}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * キャラクターの更新
   * @param id キャラクターID
   * @param updates 更新データ
   * @returns 更新されたキャラクター
   */
  async updateCharacter(id: string, updates: Partial<CharacterData>): Promise<Character> {
    try {
      // キャラクターの存在確認
      const existing = await characterRepository.getCharacterById(id);
      if (!existing) {
        throw new NotFoundError('Character', id);
      }

      // 更新データのバリデーション
      this.validateCharacterUpdates(updates, existing);

      // キャラクターの更新前状態を記録
      const previousState = { ...existing };

      // 更新の実行
      const updated = await characterRepository.updateCharacter(id, updates);

      // 更新イベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_UPDATED, {
        timestamp: new Date(),
        characterId: id,
        changes: updates,
        previousState
      });

      logger.info(`キャラクターを更新しました: ${updated.name} (${updated.id})`);
      return updated;
    } catch (error) {
      logger.error(`キャラクター更新中にエラーが発生しました: ${id}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * キャラクター更新データのバリデーション
   * @private
   * @param updates 更新データ
   * @param existing 既存のキャラクター
   */
  private validateCharacterUpdates(updates: Partial<CharacterData>, existing: Character): void {
    const errors: Record<string, string[]> = {};

    // タイプの更新は特別な処理が必要 (昇格APIを使用すべき)
    if (updates.type && updates.type !== existing.type) {
      if (!errors.type) errors.type = [];
      errors.type.push('キャラクタータイプは直接更新できません。昇格APIを使用してください');
    }

    // 関係性データのバリデーション
    if (updates.relationships) {
      errors.relationships = [];
      
      for (let i = 0; i < updates.relationships.length; i++) {
        const relation = updates.relationships[i];
        
        if (!relation.targetId) {
          errors.relationships.push(`関係性[${i}]: targetIdは必須です`);
        }

        // 自分自身との関係性は禁止
        if (relation.targetId === existing.id) {
          errors.relationships.push(`関係性[${i}]: 自分自身との関係性は設定できません`);
        }

        if (!relation.type) {
          errors.relationships.push(`関係性[${i}]: typeは必須です`);
        }

        if (typeof relation.strength !== 'number' ||
            relation.strength < 0 ||
            relation.strength > 1) {
          errors.relationships.push(`関係性[${i}]: strengthは0〜1の数値である必要があります`);
        }
      }
      
      // エラーがなければ削除
      if (errors.relationships.length === 0) {
        delete errors.relationships;
      }
    }

    // エラーがあれば例外をスロー
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('キャラクター更新データが無効です', errors);
    }
  }

  /**
   * キャラクターの登場記録
   * @param id キャラクターID
   * @param chapterNumber 章番号
   * @param summary 概要
   * @returns 更新されたキャラクター
   */
  async recordAppearance(id: string, chapterNumber: number, summary: string): Promise<Character> {
    try {
      // キャラクターの存在確認
      const character = await characterRepository.getCharacterById(id);
      if (!character) {
        throw new NotFoundError('Character', id);
      }

      // 登場記録の作成
      const appearance: CharacterAppearance = {
        chapterNumber,
        timestamp: new Date(),
        significance: 0.5, // デフォルト値
        summary
      };

      // キャラクター状態の更新
      const updatedState: Partial<CharacterState> = {
        ...character.state,
        lastAppearance: chapterNumber
      };

      // 状態の更新を適用
      await characterRepository.saveCharacterState(id, updatedState as CharacterState);

      // 履歴の更新
      const updatedHistory = {
        ...character.history,
        appearances: [...character.history.appearances, appearance]
      };

      // 履歴プロパティを更新
      await characterRepository.updateCharacterProperty(id, 'history', updatedHistory);

      // 登場イベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_APPEARANCE, {
        timestamp: new Date(),
        characterId: id,
        chapterNumber,
        summary
      });

      // 更新されたキャラクターを取得
      const updatedCharacter = await characterRepository.getCharacterById(id);
      if (!updatedCharacter) {
        throw new Error(`更新後のキャラクターが見つかりません: ${id}`);
      }

      logger.info(`キャラクターの登場を記録しました: ${character.name} (${id}), 章番号: ${chapterNumber}`);
      return updatedCharacter;
    } catch (error) {
      logger.error(`キャラクター登場記録中にエラーが発生しました: ${id}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * インタラクション記録
   * @param id キャラクターID
   * @param targetId 対象キャラクターID
   * @param type インタラクションタイプ
   * @param data 追加データ
   */
  async recordInteraction(id: string, targetId: string, type: string, data: any): Promise<void> {
    try {
      // キャラクターの存在確認
      const character = await characterRepository.getCharacterById(id);
      if (!character) {
        throw new NotFoundError('Character', id);
      }

      // 対象キャラクターの存在確認
      const targetCharacter = await characterRepository.getCharacterById(targetId);
      if (!targetCharacter) {
        throw new NotFoundError('Character', targetId);
      }

      // インタラクション記録の作成
      const interaction: Interaction = {
        chapterNumber: data.chapterNumber || 0,
        targetCharacterId: targetId,
        type,
        description: data.description || `${type}インタラクション`,
        impact: data.impact || 0.5,
        timestamp: new Date()
      };

      // 履歴の更新
      const updatedHistory = {
        ...character.history,
        interactions: [...character.history.interactions, interaction]
      };

      // 履歴プロパティを更新
      await characterRepository.updateCharacterProperty(id, 'history', updatedHistory);

      // インタラクションイベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_INTERACTION, {
        timestamp: new Date(),
        sourceCharacterId: id,
        targetCharacterId: targetId,
        interactionType: type,
        data
      });

      logger.info(`インタラクションを記録しました: ${character.name} -> ${targetCharacter.name}, タイプ: ${type}`);
    } catch (error) {
      logger.error(`インタラクション記録中にエラーが発生しました: ${id} -> ${targetId}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * キャラクター発展処理
   * @param id キャラクターID
   * @param events 章イベント配列
   * @returns 更新されたキャラクター
   */
  async processCharacterDevelopment(id: string, events: ChapterEvent[]): Promise<Character> {
    try {
      // キャラクターの存在確認
      const character = await characterRepository.getCharacterById(id);
      if (!character) {
        throw new NotFoundError('Character', id);
      }

      // 発展処理イベントの発行（他サービスが処理）
      eventBus.publish(EVENT_TYPES.CHARACTER_DEVELOPMENT_REQUESTED, {
        timestamp: new Date(),
        characterId: id,
        events,
        character
      });

      // Note: 実際の処理はEvolutionServiceで行われ、その結果としてCHARACTER_UPDATEDイベントが発行される
      // ここでは直接更新せず、イベントバスを介した非同期処理に委ねる

      // 処理が完了するまで少し待機
      await new Promise(resolve => setTimeout(resolve, 100));

      // 最新のキャラクター状態を取得
      const updatedCharacter = await characterRepository.getCharacterById(id);
      if (!updatedCharacter) {
        throw new Error(`更新後のキャラクターが見つかりません: ${id}`);
      }

      logger.info(`キャラクター発展処理を実行しました: ${character.name} (${id})`);
      return updatedCharacter;
    } catch (error) {
      logger.error(`キャラクター発展処理中にエラーが発生しました: ${id}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * キャラクター設定の検証
   * @param character キャラクター
   * @returns 検証結果
   */
  async validateCharacter(character: Character): Promise<ValidationResult> {
    try {
      // 基本的な構造チェック
      const structureValid = this.validateCharacterStructure(character);
      if (!structureValid.isValid) {
        return structureValid;
      }

      // 一貫性チェックイベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_VALIDATION_REQUESTED, {
        timestamp: new Date(),
        character
      });

      // 実際の検証は他のサービスで実施されるため、ここでは基本的な検証結果を返す
      return {
        isValid: true,
        confidenceScore: 0.9,
        reason: "基本的なキャラクター構造は有効です"
      };
    } catch (error) {
      logger.error(`キャラクター検証中にエラーが発生しました: ${character.id}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      
      return {
        isValid: false,
        confidenceScore: 0,
        reason: `検証中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * キャラクター構造の基本検証
   * @private
   * @param character 検証するキャラクター
   * @returns 検証結果
   */
  private validateCharacterStructure(character: Character): ValidationResult {
    // 必須フィールドの確認
    if (!character.id || !character.name || !character.type || !character.description) {
      return {
        isValid: false,
        confidenceScore: 0,
        reason: "必須フィールドが不足しています (id, name, type, description)"
      };
    }

    // タイプの確認
    if (!['MAIN', 'SUB', 'MOB'].includes(character.type)) {
      return {
        isValid: false,
        confidenceScore: 0,
        reason: `無効なキャラクタータイプです: ${character.type}`
      };
    }

    // 状態の確認
    if (!character.state) {
      return {
        isValid: false,
        confidenceScore: 0,
        reason: "キャラクター状態が不足しています"
      };
    }

    // 履歴の確認
    if (!character.history) {
      return {
        isValid: false,
        confidenceScore: 0,
        reason: "キャラクター履歴が不足しています"
      };
    }

    return {
      isValid: true,
      confidenceScore: 1,
      reason: "キャラクター構造は有効です"
    };
  }

  /**
   * キャラクター状態の更新
   * @param id キャラクターID
   * @param state 新しい状態
   * @returns 更新されたキャラクター
   */
  async updateCharacterState(id: string, state: Partial<CharacterState>): Promise<Character> {
    try {
      // キャラクターの存在確認
      const character = await characterRepository.getCharacterById(id);
      if (!character) {
        throw new NotFoundError('Character', id);
      }

      // 前の状態を保存
      const previousState = { ...character.state };

      // 状態の更新
      const updatedState: CharacterState = {
        ...character.state,
        ...state
      };

      // リポジトリに保存
      await characterRepository.saveCharacterState(id, updatedState);

      // 状態変更イベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_STATE_CHANGED, {
        timestamp: new Date(),
        characterId: id,
        previousState,
        currentState: updatedState
      });

      // 更新されたキャラクターを取得
      const updatedCharacter = await characterRepository.getCharacterById(id);
      if (!updatedCharacter) {
        throw new Error(`更新後のキャラクターが見つかりません: ${id}`);
      }

      logger.info(`キャラクター状態を更新しました: ${character.name} (${id})`);
      return updatedCharacter;
    } catch (error) {
      logger.error(`キャラクター状態更新中にエラーが発生しました: ${id}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * キャラクター状態の初期化
   * @private
   * @param data キャラクターデータ
   * @returns 初期化された状態
   */
  private initializeCharacterState(data: CharacterData): CharacterState {
    return {
      isActive: data.state?.isActive !== undefined ? data.state.isActive : (data.type === 'MAIN'),
      emotionalState: data.state?.emotionalState || 'NEUTRAL',
      developmentStage: data.state?.developmentStage || 0,
      lastAppearance: data.state?.lastAppearance || null,
      development: '',
      relationships: []
    };
  }

  /**
   * キャラクター履歴の初期化
   * @private
   * @returns 初期化された履歴
   */
  private initializeHistory(): CharacterHistory {
    return {
      appearances: [],
      developmentPath: [],
      interactions: [],
    };
  }
}

// シングルトンインスタンスをエクスポート
export const characterService = new CharacterService();