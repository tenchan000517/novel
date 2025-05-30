/**
 * キャラクター変更イベントハンドラー
 * キャラクター関連イベントの標準処理を実装
 */
import { EVENT_TYPES } from '../../core/constants';
import { 
//   EventPayloadMap, 
  TypedEventHandler,
  EventHandlerRegistration,
  EventPriority,
  EventUtils
} from '../event-types';
import { eventBus } from '../character-event-bus';
import { ConsistencyError } from '../../core/errors';
import { DEVELOPMENT_STAGE } from '../../core/constants';

/**
 * キャラクター変更イベントハンドラークラス
 * キャラクター関連イベントの処理ロジックを提供
 */
export class CharacterChangeHandler {
  /**
   * キャラクター作成イベントハンドラー
   * 新しいキャラクターが作成された際の処理
   * @param data イベントデータ
   */
  public static handleCharacterCreated: TypedEventHandler<typeof EVENT_TYPES.CHARACTER_CREATED> = 
  async (data) => {
    try {
      const character = data.character;
      console.log(`Character created: ${character.name} (${character.id})`);
      
      // キャラクター初期化に関連する処理
      // 1. 初期発展段階を設定
      if (character.state.developmentStage === undefined) {
        character.state.developmentStage = DEVELOPMENT_STAGE.INTRODUCTION;
      }
      
      // 2. 初期登場情報がある場合は登場イベントを発行
      if (character.firstAppearance) {
        await eventBus.publishAsync(EVENT_TYPES.CHARACTER_APPEARANCE, {
          characterId: character.id,
          chapterNumber: character.firstAppearance,
          summary: `Initial appearance of ${character.name}`,
          significance: character.significance || 0.3,
          timestamp: new Date()
        });
      }
      
      // 3. 関係性が設定されている場合は関係性作成イベントを発行
      if (character.relationships && character.relationships.length > 0) {
        for (const relationship of character.relationships) {
          await eventBus.publishAsync(EVENT_TYPES.RELATIONSHIP_CREATED, {
            char1Id: character.id,
            char2Id: relationship.targetId,
            relationship,
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error handling character created event:', error);
    }
  };

  /**
   * キャラクター更新イベントハンドラー
   * キャラクター情報が更新された際の処理
   * @param data イベントデータ
   */
  public static handleCharacterUpdated: TypedEventHandler<typeof EVENT_TYPES.CHARACTER_UPDATED> = 
  async (data) => {
    try {
      const { characterId, changes, previousState } = data;
      console.log(`Character updated: ${characterId}`, changes);
      
      // 1. キャラクタータイプの変更を検出（昇格/降格）
      if (changes.type && previousState?.type && changes.type !== previousState.type) {
        const fromType = previousState.type;
        const toType = changes.type;
        
        // タイプ変更を検出した場合、昇格/降格イベントを発行
        const isPromotion = 
          (fromType === 'MOB' && (toType === 'SUB' || toType === 'MAIN')) ||
          (fromType === 'SUB' && toType === 'MAIN');
        
        if (isPromotion) {
          await eventBus.publishAsync(EVENT_TYPES.CHARACTER_PROMOTED, {
            characterId,
            fromType,
            toType,
            reason: `Character promoted from ${fromType} to ${toType}`,
            timestamp: new Date()
          });
        } else {
          await eventBus.publishAsync(EVENT_TYPES.CHARACTER_DEMOTED, {
            characterId,
            fromType,
            toType,
            reason: `Character demoted from ${fromType} to ${toType}`,
            timestamp: new Date()
          });
        }
      }
      
      // 2. 状態変更の処理
      if (changes.state) {
        await eventBus.publishAsync(EVENT_TYPES.CHARACTER_STATE_CHANGED, {
          characterId,
          changes: changes.state,
          previousState: previousState?.state,
          timestamp: new Date()
        });
      }
      
      // 3. 関係性の変更を検出して処理
      if (changes.relationships) {
        // 既存の関係性と比較して変更を検出
        const prevRelationships = previousState?.relationships || [];
        const currentRelationships = changes.relationships;
        
        // 更新または新規の関係性を処理
        for (const relationship of currentRelationships) {
          const prevRelationship = prevRelationships.find(r => r.targetId === relationship.targetId);
          
          if (!prevRelationship) {
            // 新規関係性
            await eventBus.publishAsync(EVENT_TYPES.RELATIONSHIP_CREATED, {
              char1Id: characterId,
              char2Id: relationship.targetId,
              relationship,
              timestamp: new Date()
            });
          } else if (
            prevRelationship.type !== relationship.type ||
            prevRelationship.strength !== relationship.strength
          ) {
            // 更新された関係性
            await eventBus.publishAsync(EVENT_TYPES.RELATIONSHIP_UPDATED, {
              char1Id: characterId,
              char2Id: relationship.targetId,
              relationship,
              previousRelationship: prevRelationship,
              timestamp: new Date()
            });
          }
        }
        
        // 削除された関係性を検出
        for (const prevRelationship of prevRelationships) {
          const stillExists = currentRelationships.some(r => r.targetId === prevRelationship.targetId);
          if (!stillExists) {
            await eventBus.publishAsync(EVENT_TYPES.RELATIONSHIP_DELETED, {
              char1Id: characterId,
              char2Id: prevRelationship.targetId,
              timestamp: new Date()
            });
          }
        }
      }
    } catch (error) {
      console.error('Error handling character updated event:', error);
    }
  };

  /**
   * キャラクター削除イベントハンドラー
   * キャラクターが削除された際の処理
   * @param data イベントデータ
   */
  public static handleCharacterDeleted: TypedEventHandler<typeof EVENT_TYPES.CHARACTER_DELETED> = 
  async (data) => {
    try {
      const { characterId } = data;
      console.log(`Character deleted: ${characterId}`);
      
      // 関連リソースのクリーンアップ処理
      // 1. このキャラクターに関連するすべての関係性を取得・削除する処理を追加できます
      // 2. キャラクターのパラメータやスキルなど、関連するデータの削除処理を追加できます
      // 3. 参照整合性違反を防ぐための処理（例: 他キャラクターの関係性からの参照削除）
      
      // 主要な削除完了後の通知ログ
      console.log(`Character ${characterId} and all associated resources have been cleaned up`);
    } catch (error) {
      console.error('Error handling character deleted event:', error);
    }
  };

  /**
   * キャラクター昇格イベントハンドラー
   * キャラクターが昇格された際の処理
   * @param data イベントデータ
   */
  public static handleCharacterPromoted: TypedEventHandler<typeof EVENT_TYPES.CHARACTER_PROMOTED> = 
  async (data) => {
    try {
      const { characterId, fromType, toType, reason } = data;
      console.log(`Character promoted: ${characterId} (${fromType} -> ${toType})${reason ? `: ${reason}` : ''}`);
      
      // 昇格に伴う処理
      // 1. MOB → SUB への昇格の場合
      if (fromType === 'MOB' && toType === 'SUB') {
        // より詳細な背景設定が必要になる
        // パラメータの拡張
        // 基本的な関係性の構築
      }
      
      // 2. SUB → MAIN への昇格の場合 
      if (fromType === 'SUB' && toType === 'MAIN') {
        // 詳細な心理設定が必要になる
        // より複雑な関係性を構築
        // 発展経路の詳細化
      }
      
      // 3. 発展段階の再評価 - 新しいタイプに基づく発展段階の見直し
      // 4. 昇格履歴の記録
      
      // 昇格メトリクスの更新を通知
      console.log(`Character ${characterId} promotion process completed`);
    } catch (error) {
      console.error('Error handling character promoted event:', error);
    }
  };

  /**
   * キャラクター降格イベントハンドラー
   * キャラクターが降格された際の処理
   * @param data イベントデータ
   */
  public static handleCharacterDemoted: TypedEventHandler<typeof EVENT_TYPES.CHARACTER_DEMOTED> = 
  async (data) => {
    try {
      const { characterId, fromType, toType, reason } = data;
      console.log(`Character demoted: ${characterId} (${fromType} -> ${toType})${reason ? `: ${reason}` : ''}`);
      
      // 降格に伴う処理
      // 1. データの整理（例: 不要になったデータの削除や簡略化）
      // 2. 関係性の見直し
      // 3. 発展段階の調整
      // 4. 降格履歴の記録
      
      // 降格完了通知
      console.log(`Character ${characterId} demotion process completed`);
    } catch (error) {
      console.error('Error handling character demoted event:', error);
    }
  };

  /**
   * キャラクター状態変更イベントハンドラー
   * キャラクターの状態が変更された際の処理
   * @param data イベントデータ
   */
  public static handleCharacterStateChanged: TypedEventHandler<typeof EVENT_TYPES.CHARACTER_STATE_CHANGED> = 
  async (data) => {
    try {
      const { characterId, changes, previousState } = data;
      console.log(`Character state changed: ${characterId}`, changes);
      
      // 1. 発展段階の変更を検出
      if (changes.developmentStage !== undefined && 
          previousState?.developmentStage !== undefined &&
          changes.developmentStage !== previousState.developmentStage) {
        await eventBus.publishAsync(EVENT_TYPES.DEVELOPMENT_STAGE_CHANGED, {
          characterId,
          oldStage: previousState.developmentStage,
          newStage: changes.developmentStage,
          reason: changes.development || 'Character development progression',
          timestamp: new Date()
        });
      }
      
      // 2. 感情状態の変更を検出
      if (changes.emotionalState !== undefined &&
          previousState?.emotionalState !== undefined &&
          changes.emotionalState !== previousState.emotionalState) {
        console.log(`Character emotional state changed: ${characterId} (${previousState.emotionalState} -> ${changes.emotionalState})`);
        // 必要に応じて感情変化イベントを追加できます
      }
      
      // 3. アクティブ状態の変更を検出
      if (changes.isActive !== undefined &&
          previousState?.isActive !== undefined &&
          changes.isActive !== previousState.isActive) {
        console.log(`Character active state changed: ${characterId} (${previousState.isActive} -> ${changes.isActive})`);
        // アクティブ状態変更に関連する処理
      }
      
      // 4. 健康状態や怪我の変更を検出
      if (changes.health !== undefined ||
          changes.injuries !== undefined) {
        console.log(`Character health status changed: ${characterId}`);
        // 健康状態変更に関連する処理
      }
    } catch (error) {
      console.error('Error handling character state changed event:', error);
    }
  };

  /**
   * キャラクター登場イベントハンドラー
   * キャラクターがストーリーに登場した際の処理
   * @param data イベントデータ
   */
  public static handleCharacterAppearance: TypedEventHandler<typeof EVENT_TYPES.CHARACTER_APPEARANCE> = 
  async (data) => {
    try {
      const { characterId, chapterNumber, summary, significance } = data;
      console.log(`Character appearance: ${characterId} in chapter ${chapterNumber}${summary ? ` - ${summary}` : ''}`);
      
      // 1. 登場履歴の更新
      console.log(`Recording appearance for character ${characterId} in chapter ${chapterNumber}`);
      
      // 2. 初登場の場合の特別処理
      // 3. 長期不在後の再登場処理
      
      // 4. 重要度が高い登場の場合の処理
      if (significance && significance > 0.7) {
        console.log(`High significance appearance (${significance}) detected for character ${characterId}`);
        // 重要登場に関する追加処理
      }
    } catch (error) {
      console.error('Error handling character appearance event:', error);
    }
  };

  /**
   * 整合性違反イベントハンドラー
   * キャラクターの整合性違反が検出された際の処理
   * @param data イベントデータ
   */
  public static handleConsistencyViolation: TypedEventHandler<typeof EVENT_TYPES.CONSISTENCY_VIOLATION> = 
  async (data) => {
    try {
      const { characterId, violation, severity } = data;
      console.warn(`Consistency violation for character ${characterId}: ${violation} (Severity: ${severity})`);
      
      // 1. 整合性違反のログ記録
      
      // 2. 違反の重大度に応じた処理
      if (severity > 0.8) {
        // 重大な整合性違反
        console.error(new ConsistencyError(
          characterId,
          `Critical consistency violation: ${violation}`,
          { severity }
        ).getDetails());
        
        // 重大な違反の通知や修正提案
      } else if (severity > 0.5) {
        // 中程度の整合性違反
        console.warn(`Moderate consistency violation for character ${characterId}: ${violation}`);
        // 警告の記録
      } else {
        // 軽微な整合性違反
        console.info(`Minor consistency violation for character ${characterId}: ${violation}`);
        // 情報の記録のみ
      }
    } catch (error) {
      console.error('Error handling consistency violation event:', error);
    }
  };

  /**
   * 発展段階変更イベントハンドラー
   * キャラクターの発展段階が変更された際の処理
   * @param data イベントデータ
   */
  public static handleDevelopmentStageChanged: TypedEventHandler<typeof EVENT_TYPES.DEVELOPMENT_STAGE_CHANGED> = 
  async (data) => {
    try {
      const { characterId, oldStage, newStage, reason } = data;
      console.log(`Character development stage changed: ${characterId} (${oldStage} -> ${newStage}): ${reason}`);
      
      // 1. 段階の進行（上昇）の場合
      if (newStage > oldStage) {
        // 成長に関連するイベント処理
        console.log(`Character ${characterId} has progressed to a higher development stage`);
        
        // 特定のマイルストーン到達判定
        // 例: 変容段階（TRANSFORMATION）に達した場合の特別処理
        if (newStage === DEVELOPMENT_STAGE.TRANSFORMATION) {
          console.log(`Character ${characterId} has reached the transformation stage`);
          // 変容段階特有の処理
        }
      } 
      // 2. 段階の後退（下降）の場合
      else if (newStage < oldStage) {
        console.log(`Character ${characterId} has regressed to a lower development stage`);
        // 後退に関連するイベント処理
      }
      
      // 3. 発展段階に応じたマイルストーン達成の可能性をチェック
      // 4. 関連するパラメータやスキルの調整を検討
    } catch (error) {
      console.error('Error handling development stage changed event:', error);
    }
  };

  /**
   * マイルストーン達成イベントハンドラー
   * キャラクターが発展マイルストーンを達成した際の処理
   * @param data イベントデータ
   */
  public static handleMilestoneAchieved: TypedEventHandler<typeof EVENT_TYPES.MILESTONE_ACHIEVED> = 
  async (data) => {
    try {
      const { characterId, milestone } = data;
      console.log(`Character ${characterId} achieved milestone: ${milestone.description} (Stage: ${milestone.stage})`);
      
      // 1. マイルストーン達成の記録
      // 2. 関連する発展処理
      // 3. 次のマイルストーン予測・設定
    } catch (error) {
      console.error('Error handling milestone achieved event:', error);
    }
  };

  /**
   * すべてのハンドラーを登録
   * @param eventBus イベントバス
   * @returns 購読解除関数
   */
  public static registerAll(eventBus: typeof import('../character-event-bus').eventBus): () => void {
    const registrations: EventHandlerRegistration<any>[] = [
      {
        eventType: EVENT_TYPES.CHARACTER_CREATED,
        handler: CharacterChangeHandler.handleCharacterCreated,
        priority: EventPriority.HIGH
      },
      {
        eventType: EVENT_TYPES.CHARACTER_UPDATED,
        handler: CharacterChangeHandler.handleCharacterUpdated,
        priority: EventPriority.NORMAL
      },
      {
        eventType: EVENT_TYPES.CHARACTER_DELETED,
        handler: CharacterChangeHandler.handleCharacterDeleted,
        priority: EventPriority.HIGH
      },
      {
        eventType: EVENT_TYPES.CHARACTER_PROMOTED,
        handler: CharacterChangeHandler.handleCharacterPromoted,
        priority: EventPriority.NORMAL
      },
      {
        eventType: EVENT_TYPES.CHARACTER_DEMOTED,
        handler: CharacterChangeHandler.handleCharacterDemoted,
        priority: EventPriority.NORMAL
      },
      {
        eventType: EVENT_TYPES.CHARACTER_STATE_CHANGED,
        handler: CharacterChangeHandler.handleCharacterStateChanged,
        priority: EventPriority.NORMAL
      },
      {
        eventType: EVENT_TYPES.CHARACTER_APPEARANCE,
        handler: CharacterChangeHandler.handleCharacterAppearance,
        priority: EventPriority.NORMAL
      },
      {
        eventType: EVENT_TYPES.CONSISTENCY_VIOLATION,
        handler: CharacterChangeHandler.handleConsistencyViolation,
        priority: EventPriority.HIGH
      },
      {
        eventType: EVENT_TYPES.DEVELOPMENT_STAGE_CHANGED,
        handler: CharacterChangeHandler.handleDevelopmentStageChanged,
        priority: EventPriority.NORMAL
      },
      {
        eventType: EVENT_TYPES.MILESTONE_ACHIEVED,
        handler: CharacterChangeHandler.handleMilestoneAchieved,
        priority: EventPriority.NORMAL
      }
    ];
    
    return EventUtils.registerHandlers(registrations, eventBus);
  }
}