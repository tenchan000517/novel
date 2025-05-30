/**
 * @fileoverview イベント関連機能を管理するレジストリ
 * @description
 * メモリマネージャーから切り出されたイベント関連機能を提供するクラスです。
 * EventMemoryと連携し、イベントの記録、検索、管理を担当します。
 */
import { logger } from '@/lib/utils/logger';
import { EventMemory } from '../event-memory';
import { SignificantEvent, QueryOptions, EventContext } from '@/types/memory';

/**
 * @class EventRegistry
 * @description
 * イベント関連機能を管理するレジストリクラス。
 * EventMemoryと連携し、イベントの記録、検索、管理を行います。
 */
export class EventRegistry {
    private eventMemory: EventMemory;
    private initialized: boolean = false;
    
    /**
     * EventRegistryを初期化します
     * @param eventMemory EventMemoryインスタンス
     */
    constructor(eventMemory: EventMemory) {
        this.eventMemory = eventMemory;
    }
    
    /**
     * イベントシステムを初期化します
     * @returns 初期化結果
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }
        
        await this.eventMemory.initialize();
        this.initialized = true;
        logger.info('EventRegistry initialized');
    }
    
    /**
     * 重要イベントを記録します
     * @param event 重要イベント
     * @returns 記録結果
     */
    async recordSignificantEvent(event: SignificantEvent): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }
        
        return this.eventMemory.recordSignificantEvent(event);
    }
    
    /**
     * 場所に関連する重要イベントを取得します
     * @param location 場所
     * @param options クエリオプション
     * @returns 重要イベント配列
     */
    async getLocationEvents(location: string, options?: QueryOptions): Promise<SignificantEvent[]> {
        if (!this.initialized) {
            await this.initialize();
        }
        
        return this.eventMemory.getLocationEvents(location, options);
    }
    
    /**
     * キャラクター間の重要インタラクションを取得します
     * @param characterIds キャラクターID配列
     * @param options クエリオプション
     * @returns 重要イベント配列
     */
    async getSignificantCharacterInteractions(
        characterIds: string[],
        options?: QueryOptions
    ): Promise<SignificantEvent[]> {
        if (!this.initialized) {
            await this.initialize();
        }
        
        return this.eventMemory.getSignificantCharacterInteractions(characterIds, options);
    }
    
    /**
     * イベントタイプ別の重要イベントを取得します
     * @param types イベントタイプの配列
     * @param options クエリオプション
     * @returns 重要イベント配列
     */
    async getEventsByTypes(
        types: string[],
        options?: QueryOptions & { involvedCharacters?: string[] }
    ): Promise<SignificantEvent[]> {
        if (!this.initialized) {
            await this.initialize();
        }
        
        return this.eventMemory.getEventsByTypes(types, options);
    }
    
    /**
     * 関連性のあるイベントを取得します
     * @param context イベントコンテキスト
     * @returns 重要イベント配列
     */
    async getRelatedEvents(context: EventContext): Promise<SignificantEvent[]> {
        if (!this.initialized) {
            await this.initialize();
        }
        
        return this.eventMemory.getRelatedEvents(context);
    }

    /**
     * 指定した章範囲内のイベントを検索します
     * @param options クエリオプション
     * @returns 重要イベント配列
     */
    async queryEvents(options: QueryOptions): Promise<SignificantEvent[]> {
        if (!this.initialized) {
            await this.initialize();
        }
        
        return this.eventMemory.queryEvents(options);
    }

    // /**
    //  * システムの状態情報を取得します
    //  * @returns システム状態情報
    //  */
    // async getStatus(): Promise<{ eventCount: number; lastUpdateTime: Date | null }> {
    //     if (!this.initialized) {
    //         await this.initialize();
    //     }
        
    //     return {
    //         eventCount: await this.eventMemory.getEventCount(),
    //         lastUpdateTime: await this.eventMemory.getLastUpdateTime()
    //     };
    // }
}