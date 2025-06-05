/**
 * キャラクターモジュールのイベントバス実装
 * コンポーネント間の疎結合通信を実現するための中央ハブ
 */
import { IEventBus } from '../core/interfaces';
import { EventData, EventHandler, EventSubscription } from '../core/types';
import { v4 as uuidv4 } from 'uuid';

// サブスクリプション情報を内部で管理するためのインターフェース
interface Subscription {
    id: string;
    eventType: string;
    callback: EventHandler<any>;
    once: boolean;
}

/**
 * キャラクターイベントバス
 * シングルトンパターンで実装されたイベント発行・購読システム
 */
export class CharacterEventBus implements IEventBus {
    private static instance: CharacterEventBus;
    private subscriptions: Map<string, Subscription[]>;
    private eventBuffer: Array<{ eventType: string; data: EventData }>;
    private isProcessing: boolean;
    private debugMode: boolean;
    private eventLoopDetection: Map<string, number>;
    private maxLoopThreshold: number;

    /**
     * プライベートコンストラクタ - シングルトンパターン
     */
    private constructor() {
        this.subscriptions = new Map<string, Subscription[]>();
        this.eventBuffer = [];
        this.isProcessing = false;
        this.debugMode = process.env.NODE_ENV === 'development';
        this.eventLoopDetection = new Map<string, number>();
        this.maxLoopThreshold = 10; // イベントループ検出のしきい値
    }

    /**
     * インスタンス取得メソッド - シングルトンパターン
     * @returns CharacterEventBusのシングルトンインスタンス
     */
    public static getInstance(): CharacterEventBus {
        if (!CharacterEventBus.instance) {
            CharacterEventBus.instance = new CharacterEventBus();
        }
        return CharacterEventBus.instance;
    }

    /**
     * イベントの発行
     * @param eventType イベントタイプ
     * @param data イベントデータ
     */
    public publish(eventType: string, data: EventData): void {
        if (this.debugMode) {
            console.log(`[EventBus] Publishing event: ${eventType}`, data);
        }

        // イベントループ検出
        this.detectEventLoop(eventType);

        // タイムスタンプが設定されていない場合は設定
        if (!data.timestamp) {
            data.timestamp = new Date();
        }

        // イベントをバッファに追加
        this.eventBuffer.push({ eventType, data });

        // バッファの処理を開始（処理中でなければ）
        if (!this.isProcessing) {
            this.processEventBuffer();
        }
    }

    /**
     * イベントの購読
     * @param eventType イベントタイプ
     * @param callback コールバック関数
     * @returns 購読解除用の情報
     */
    public subscribe(eventType: string, callback: EventHandler<any>): EventSubscription {
        const id = uuidv4();
        const subscription: Subscription = {
            id,
            eventType,
            callback,
            once: false
        };

        if (!this.subscriptions.has(eventType)) {
            this.subscriptions.set(eventType, []);
        }

        this.subscriptions.get(eventType)!.push(subscription);

        if (this.debugMode) {
            console.log(`[EventBus] Subscription added: ${eventType} (ID: ${id})`);
        }

        return {
            eventType,
            id,
            unsubscribe: () => this.unsubscribe({ eventType, id, unsubscribe: () => { } })
        };
    }

    /**
     * 購読解除
     * @param subscription 購読情報
     */
    public unsubscribe(subscription: EventSubscription): void {
        const { eventType, id } = subscription;

        if (!this.subscriptions.has(eventType)) {
            return;
        }

        const subscriptions = this.subscriptions.get(eventType)!;
        const index = subscriptions.findIndex(sub => sub.id === id);

        if (index !== -1) {
            subscriptions.splice(index, 1);

            if (this.debugMode) {
                console.log(`[EventBus] Subscription removed: ${eventType} (ID: ${id})`);
            }

            // サブスクリプションリストが空になったら削除
            if (subscriptions.length === 0) {
                this.subscriptions.delete(eventType);
            }
        }
    }

    /**
     * イベントバッファの処理
     * イベントを順番に処理し、対応するサブスクライバーに通知
     */
    private async processEventBuffer(): Promise<void> {
        if (this.eventBuffer.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;

        // バッファからイベントを取り出し
        const { eventType, data } = this.eventBuffer.shift()!;

        // イベントタイプに対応するサブスクリプションを取得
        const eventSubscriptions = this.subscriptions.get(eventType) || [];

        // 一度だけのサブスクリプションを識別するための配列
        const onceSubscriptions: string[] = [];

        // 各サブスクリプションに対してコールバックを非同期で実行
        const promises = eventSubscriptions.map(async (subscription) => {
            try {
                await subscription.callback(data);

                // 一度だけのサブスクリプションを記録
                if (subscription.once) {
                    onceSubscriptions.push(subscription.id);
                }
            } catch (error) {
                console.error(`[EventBus] Error in event handler for ${eventType}:`, error);
            }
        });

        // すべてのコールバックの完了を待機
        await Promise.all(promises);

        // 一度だけのサブスクリプションを削除
        onceSubscriptions.forEach(id => {
            const subscription = eventSubscriptions.find(sub => sub.id === id);
            if (subscription) {
                this.unsubscribe({
                    eventType,
                    id,
                    unsubscribe: () => { }
                });
            }
        });

        // 次のイベント処理を開始
        setImmediate(() => this.processEventBuffer());
    }

    /**
     * イベントループ検出
     * 同じイベントが短時間に大量に発生していないかチェック
     * @param eventType イベントタイプ
     */
    private detectEventLoop(eventType: string): void {
        const count = (this.eventLoopDetection.get(eventType) || 0) + 1;
        this.eventLoopDetection.set(eventType, count);

        // しきい値を超えたらループとみなす
        if (count > this.maxLoopThreshold) {
            console.warn(`[EventBus] Potential event loop detected for event type: ${eventType}`);

            // 開発環境では例外をスローしてデバッグを促す
            if (this.debugMode) {
                throw new Error(`Event loop detected: ${eventType} exceeded threshold of ${this.maxLoopThreshold}`);
            }
        }

        // 一定時間後にカウントをリセット
        setTimeout(() => {
            this.eventLoopDetection.set(eventType, 0);
        }, 1000);
    }

    /**
     * デバッグモードの設定
     * @param enabled 有効にするかどうか
     */
    public setDebugMode(enabled: boolean): void {
        this.debugMode = enabled;
    }

    /**
     * イベントの非同期発行
     * イベント発行と処理完了を待機するPromiseを返す
     * @param eventType イベントタイプ
     * @param data イベントデータ
     * @returns Promise<void>
     */
    public async publishAsync(eventType: string, data: EventData): Promise<void> {
        if (this.debugMode) {
            console.log(`[EventBus] Publishing event asynchronously: ${eventType}`, data);
        }

        // タイムスタンプが設定されていない場合は設定
        if (!data.timestamp) {
            data.timestamp = new Date();
        }

        // イベントループ検出
        this.detectEventLoop(eventType);

        // イベントをバッファに追加
        this.eventBuffer.push({ eventType, data });

        // バッファの処理を開始（処理中でなければ）
        if (!this.isProcessing) {
            this.processEventBuffer();
        }

        // すべてのイベントが処理されるまで待機
        return new Promise<void>((resolve) => {
            const checkCompletion = () => {
                // このイベントが処理されたかチェック
                // 注：この実装は簡略化されています。実際のアプリケーションでは
                // 特定のイベントの完了を追跡する仕組みが必要かもしれません
                if (!this.isProcessing && this.eventBuffer.length === 0) {
                    resolve();
                } else {
                    setTimeout(checkCompletion, 10);
                }
            };

            // すぐにチェック開始
            checkCompletion();
        });
    }
}

// シングルトンインスタンスをエクスポート
export const eventBus = CharacterEventBus.getInstance();