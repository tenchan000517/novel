// src/lib/learning-journey/event-bus.ts

/**
 * @fileoverview イベントバス
 * @description
 * シンプルな非同期コンポーネント間通信を提供するイベントバス。
 * 複雑なデータフロー管理を簡略化し、必要最小限の機能を提供する。
 */

import { logger } from '@/lib/utils/logger';

/**
 * イベントタイプの列挙型
 * 使用可能なイベントタイプを定義する
 */
export type EventType =
  // 初期化イベント
  | 'system.initialized'
  | 'learning.manager.initialized'
  | 'story.designer.initialized'
  | 'prompt.generator.initialized'
  
  // 学習関連イベント
  | 'learning.stage.updated'
  | 'embodiment.plan.created'
  
  // 篇・章関連イベント
  | 'section.created'
  | 'section.updated'
  | 'section.deleted'  // 追加
  | 'chapter.structure.designed'
  | 'scene.recommendations.generated'
  
  // 感情・変容関連イベント
  | 'emotional.arc.designed'
  | 'empathetic.points.generated'
  | 'cathartic.experience.designed'
  | 'emotion.learning.synchronized'
  | 'chapter.emotion.analyzed'
  
  // 生成関連イベント
  | 'prompt.generated'
  | 'chapter.generated'
  
  // コンテキスト関連イベント
  | 'context.updated'
  | 'memory.retrieved'
  | 'character.memory.updated';

/**
 * イベントハンドラの型
 */
export type EventHandler = (payload: any) => void | Promise<void>;

/**
 * イベント購読情報の型
 */
interface EventSubscription {
  eventType: EventType;  // イベントタイプ
  handler: EventHandler; // ハンドラ関数
  id: string;            // 購読ID
}

/**
 * @class EventBus
 * @description
 * シンプルなイベントバスシステム。
 * DataFlowManagerを大幅に簡略化し、必要最小限の機能を提供する。
 */
export class EventBus {
  // イベントハンドラの管理
  private subscriptions: EventSubscription[] = [];
  // 初期化状態の追跡
  private initialized: boolean = false;
  // 最新のイベントログ
  private eventLog: Array<{eventType: EventType, timestamp: string, payload: any}> = [];
  // 最大ログサイズ
  private readonly MAX_LOG_SIZE = 50;
  
  /**
   * コンストラクタ
   */
  constructor() {
    logger.info('EventBus created');
  }
  
  /**
   * イベントバスを初期化する
   */
  initialize(): void {
    if (this.initialized) {
      logger.info('EventBus already initialized');
      return;
    }
    
    this.initialized = true;
    logger.info('EventBus initialized');
    
    // 最初のイベントを発行
    this.publish('system.initialized', { timestamp: new Date().toISOString() });
  }
  
  /**
   * イベントを発行する
   * @param eventType イベントタイプ
   * @param payload イベントデータ
   */
  async publish(eventType: EventType, payload: any): Promise<void> {
    // 初期化チェック
    if (!this.initialized) {
      this.initialize();
    }
    
    try {
      // イベントログに追加
      this.addToEventLog(eventType, payload);
      
      // 対象イベントの購読者を取得
      const subscribers = this.subscriptions.filter(sub => sub.eventType === eventType);
      
      if (subscribers.length === 0) {
        logger.debug(`No subscribers for event type: ${eventType}`);
        return;
      }
      
      logger.debug(`Publishing event [${eventType}] to ${subscribers.length} subscribers`);
      
      // 各購読者に通知（並行処理）
      const notificationPromises = subscribers.map(async (subscription) => {
        try {
          await Promise.resolve(subscription.handler(payload));
        } catch (error) {
          logger.error(`Error in event handler for [${eventType}]`, {
            error: error instanceof Error ? error.message : String(error),
            subscriptionId: subscription.id
          });
        }
      });
      
      // すべての通知を完了するまで待機
      await Promise.all(notificationPromises);
    } catch (error) {
      logger.error(`Failed to publish event [${eventType}]`, {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * イベントを購読する
   * @param eventType イベントタイプ
   * @param handler イベントハンドラ
   * @returns 購読ID（購読解除時に使用）
   */
  subscribe(eventType: EventType, handler: EventHandler): string {
    // 初期化チェック
    if (!this.initialized) {
      this.initialize();
    }
    
    // 購読IDを生成
    const subscriptionId = `sub-${eventType}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // 購読情報を追加
    this.subscriptions.push({
      eventType,
      handler,
      id: subscriptionId
    });
    
    logger.debug(`Subscribed to event [${eventType}] with ID ${subscriptionId}`);
    return subscriptionId;
  }
  
  /**
   * 購読を解除する
   * @param subscriptionId 購読ID
   * @returns 解除成功の真偽値
   */
  unsubscribe(subscriptionId: string): boolean {
    const initialCount = this.subscriptions.length;
    this.subscriptions = this.subscriptions.filter(sub => sub.id !== subscriptionId);
    
    const removed = initialCount > this.subscriptions.length;
    if (removed) {
      logger.debug(`Unsubscribed from event with ID ${subscriptionId}`);
    } else {
      logger.warn(`Subscription with ID ${subscriptionId} not found`);
    }
    
    return removed;
  }
  
  /**
   * 特定のイベントタイプの購読をすべて解除
   * @param eventType イベントタイプ
   * @returns 解除された購読の数
   */
  unsubscribeAllFromEvent(eventType: EventType): number {
    const initialCount = this.subscriptions.length;
    this.subscriptions = this.subscriptions.filter(sub => sub.eventType !== eventType);
    
    const removedCount = initialCount - this.subscriptions.length;
    logger.debug(`Unsubscribed ${removedCount} subscriptions from event [${eventType}]`);
    
    return removedCount;
  }
  
  /**
   * イベントログにイベントを追加
   * @param eventType イベントタイプ
   * @param payload イベントデータ
   * @private
   */
  private addToEventLog(eventType: EventType, payload: any): void {
    // ログサイズ制限の管理
    if (this.eventLog.length >= this.MAX_LOG_SIZE) {
      this.eventLog.shift(); // 最も古いログを削除
    }
    
    // 新しいログを追加
    this.eventLog.push({
      eventType,
      timestamp: new Date().toISOString(),
      payload
    });
  }
  
  /**
   * イベントログを取得する
   * @param limit 取得する最大イベント数
   * @returns イベントログの配列
   */
  getEventLog(limit?: number): Array<{eventType: EventType, timestamp: string, payload: any}> {
    const log = [...this.eventLog];
    return limit ? log.slice(-limit) : log;
  }
  
  /**
   * 特定のイベントタイプの購読者数を取得する
   * @param eventType イベントタイプ
   * @returns 購読者数
   */
  getSubscribersCount(eventType: EventType): number {
    return this.subscriptions.filter(sub => sub.eventType === eventType).length;
  }
  
  /**
   * 初期化状態を取得する
   * @returns 初期化済みかどうか
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// シングルトンインスタンスを作成
export const eventBus = new EventBus();