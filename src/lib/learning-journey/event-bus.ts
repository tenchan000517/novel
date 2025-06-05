// src/lib/learning-journey/event-bus.ts

/**
 * @fileoverview イベントバス
 * @description
 * シンプルな非同期コンポーネント間通信を提供するイベントバス。
 * 複雑なデータフロー管理を簡略化し、必要最小限の機能を提供する。
 */

import { logger } from '@/lib/utils/logger';

/**
 * イベントタイプの列挙型（P3-2統合強化版）
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
  | 'learning.plot.integrated'           // P3-2: 学習とプロットの統合
  | 'learning.character.synced'          // P3-2: 学習とキャラクター同期
  
  // 篇・章関連イベント
  | 'section.created'
  | 'section.updated'
  | 'section.deleted'
  | 'chapter.structure.designed'
  | 'scene.recommendations.generated'
  | 'plot.integration.enhanced'          // P3-2: プロット統合強化
  
  // 感情・変容関連イベント（P3-2強化）
  | 'emotional.arc.designed'
  | 'empathetic.points.generated'
  | 'cathartic.experience.designed'
  | 'emotion.learning.synchronized'
  | 'chapter.emotion.analyzed'
  | 'emotional.plot.aligned'             // P3-2: 感情とプロットの整合
  | 'transformation.character.synced'    // P3-2: 変容とキャラクター同期
  
  // 統合システムイベント（P3-2新規）
  | 'triple.integration.completed'       // 感情×プロット×キャラクター統合
  | 'integration.quality.scored'         // 統合品質スコア
  | 'cross.system.optimized'            // クロスシステム最適化
  
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

  /**
   * 統合システム用のイベント発行（P3-2専用）
   * @param integrationData 統合データ
   */
  async publishIntegrationEvent(integrationData: {
    type: 'learning_plot' | 'emotion_character' | 'triple_integration';
    conceptName: string;
    stage?: string;
    chapterNumber?: number;
    integrationScore?: number;
    recommendations?: string[];
    plotPhase?: string;
    characterData?: any;
    emotionalData?: any;
  }): Promise<void> {
    try {
      // 統合タイプに応じたイベントの発行
      switch (integrationData.type) {
        case 'learning_plot':
          await this.publish('learning.plot.integrated', {
            conceptName: integrationData.conceptName,
            stage: integrationData.stage,
            chapterNumber: integrationData.chapterNumber,
            plotPhase: integrationData.plotPhase,
            integrationScore: integrationData.integrationScore,
            recommendations: integrationData.recommendations || [],
            timestamp: new Date().toISOString()
          });
          
          await this.publish('plot.integration.enhanced', {
            conceptName: integrationData.conceptName,
            enhancementLevel: integrationData.integrationScore || 0.5,
            plotPhase: integrationData.plotPhase,
            learningStage: integrationData.stage
          });
          break;

        case 'emotion_character':
          await this.publish('emotional.plot.aligned', {
            conceptName: integrationData.conceptName,
            stage: integrationData.stage,
            chapterNumber: integrationData.chapterNumber,
            emotionalData: integrationData.emotionalData,
            characterData: integrationData.characterData,
            alignmentScore: integrationData.integrationScore
          });
          
          await this.publish('transformation.character.synced', {
            conceptName: integrationData.conceptName,
            characterTransformation: integrationData.characterData,
            emotionalTransformation: integrationData.emotionalData,
            syncQuality: integrationData.integrationScore
          });
          break;

        case 'triple_integration':
          await this.publish('triple.integration.completed', {
            conceptName: integrationData.conceptName,
            stage: integrationData.stage,
            chapterNumber: integrationData.chapterNumber,
            integrationScore: integrationData.integrationScore,
            plotPhase: integrationData.plotPhase,
            characterData: integrationData.characterData,
            emotionalData: integrationData.emotionalData,
            recommendations: integrationData.recommendations || [],
            timestamp: new Date().toISOString()
          });
          
          // 品質スコア発行
          await this.publish('integration.quality.scored', {
            conceptName: integrationData.conceptName,
            qualityScore: integrationData.integrationScore,
            integrationType: 'triple',
            components: ['learning', 'plot', 'character', 'emotion']
          });
          break;
      }

      logger.debug(`Published integration event for type: ${integrationData.type}`);

    } catch (error) {
      logger.error(`Failed to publish integration event for type: ${integrationData.type}`, {
        error: error instanceof Error ? error.message : String(error),
        integrationData
      });
    }
  }

  /**
   * クロスシステム最適化イベントの発行（P3-2専用）
   * @param optimizationData 最適化データ
   */
  async publishOptimizationEvent(optimizationData: {
    systems: string[];
    optimizationType: 'performance' | 'integration' | 'quality';
    improvementScore: number;
    recommendations: string[];
    processingTime?: number;
  }): Promise<void> {
    try {
      await this.publish('cross.system.optimized', {
        systems: optimizationData.systems,
        optimizationType: optimizationData.optimizationType,
        improvementScore: optimizationData.improvementScore,
        recommendations: optimizationData.recommendations,
        processingTime: optimizationData.processingTime,
        timestamp: new Date().toISOString()
      });

      logger.debug(`Published optimization event for systems: ${optimizationData.systems.join(', ')}`);

    } catch (error) {
      logger.error(`Failed to publish optimization event`, {
        error: error instanceof Error ? error.message : String(error),
        optimizationData
      });
    }
  }

  /**
   * 統合品質の監視と自動イベント発行（P3-2専用）
   * @param qualityData 品質データ
   */
  async monitorIntegrationQuality(qualityData: {
    conceptName: string;
    currentScore: number;
    targetScore: number;
    components: Array<{
      name: string;
      score: number;
      status: 'healthy' | 'degraded' | 'critical';
    }>;
  }): Promise<void> {
    try {
      // 品質スコアの評価
      const qualityStatus = qualityData.currentScore >= qualityData.targetScore ? 'healthy' :
                          qualityData.currentScore >= qualityData.targetScore * 0.7 ? 'degraded' : 'critical';

      // 品質監視イベントの発行
      await this.publish('integration.quality.scored', {
        conceptName: qualityData.conceptName,
        qualityScore: qualityData.currentScore,
        targetScore: qualityData.targetScore,
        qualityStatus,
        components: qualityData.components,
        needsAttention: qualityStatus !== 'healthy',
        timestamp: new Date().toISOString()
      });

      // 品質が低下している場合は最適化推奨
      if (qualityStatus === 'critical') {
        const criticalComponents = qualityData.components
          .filter(comp => comp.status === 'critical')
          .map(comp => comp.name);

        await this.publishOptimizationEvent({
          systems: criticalComponents,
          optimizationType: 'quality',
          improvementScore: qualityData.targetScore - qualityData.currentScore,
          recommendations: [
            `重要コンポーネント ${criticalComponents.join(', ')} の改善が必要`,
            '統合品質の向上のための緊急対応を推奨'
          ]
        });
      }

      logger.debug(`Monitored integration quality for concept: ${qualityData.conceptName}, status: ${qualityStatus}`);

    } catch (error) {
      logger.error(`Failed to monitor integration quality`, {
        error: error instanceof Error ? error.message : String(error),
        qualityData
      });
    }
  }

  /**
   * 統合関連イベントのフィルタリング取得（P3-2専用）
   * @param filter フィルタ条件
   * @returns フィルタリングされたイベントログ
   */
  getIntegrationEventLog(filter?: {
    eventTypes?: EventType[];
    conceptName?: string;
    timeRange?: { start: string; end: string };
    limit?: number;
  }): Array<{eventType: EventType, timestamp: string, payload: any}> {
    let filteredLog = [...this.eventLog];

    // 統合関連イベントタイプでフィルタリング
    const integrationEventTypes: EventType[] = [
      'learning.plot.integrated',
      'learning.character.synced',
      'emotional.plot.aligned',
      'transformation.character.synced',
      'triple.integration.completed',
      'integration.quality.scored',
      'cross.system.optimized',
      'plot.integration.enhanced'
    ];

    if (filter?.eventTypes) {
      filteredLog = filteredLog.filter(log => filter.eventTypes!.includes(log.eventType));
    } else {
      filteredLog = filteredLog.filter(log => integrationEventTypes.includes(log.eventType));
    }

    // 概念名でフィルタリング
    if (filter?.conceptName) {
      filteredLog = filteredLog.filter(log => 
        log.payload?.conceptName === filter.conceptName
      );
    }

    // 時間範囲でフィルタリング
    if (filter?.timeRange) {
      const startTime = new Date(filter.timeRange.start);
      const endTime = new Date(filter.timeRange.end);
      filteredLog = filteredLog.filter(log => {
        const logTime = new Date(log.timestamp);
        return logTime >= startTime && logTime <= endTime;
      });
    }

    // 制限数の適用
    if (filter?.limit) {
      filteredLog = filteredLog.slice(-filter.limit);
    }

    return filteredLog;
  }
}

// シングルトンインスタンスを作成
export const eventBus = new EventBus();