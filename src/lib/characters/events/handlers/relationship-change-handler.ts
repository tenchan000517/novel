/**
 * 関係性変更イベントハンドラ
 * 関係性変更に関連するイベントを処理する
 */
import { IRelationshipRepository, IEventBus } from '../../core/interfaces';
import {
    RelationshipCreatedEvent,
    RelationshipUpdatedEvent,
    RelationshipDeletedEvent,
    RelationshipStrengthenedEvent,
    RelationshipWeakenedEvent,
    EventTypes,
    LogLevel,
    EventPriority
} from '../event-types';
import { PersistenceError, NotFoundError } from '../../core/errors';
import { RelationshipType } from '@/lib/characters/core/types';
// デフォルトエクスポートではなく名前付きエクスポートを使用
import { eventBus } from '../character-event-bus';

/**
 * 関係性変更ハンドラの設定オプション
 */
export interface RelationshipChangeHandlerOptions {
    /** イベントログレベル */
    logLevel?: LogLevel;
    /** 自動保存を有効にするかどうか */
    autoSave?: boolean;
    /** 相互関係を自動的に更新するかどうか */
    updateMutualRelationships?: boolean;
}

/**
 * 関係性変更ハンドラクラス
 * 関係性関連イベントの標準処理を提供
 */
export class RelationshipChangeHandler {
    /** イベントバスインスタンス */
    private eventBus: IEventBus;

    /** 関係性リポジトリ */
    private relationshipRepository: IRelationshipRepository;

    /** イベント購読リスト */
    private subscriptions: { unsubscribe: () => void }[] = [];

    /** 設定オプション */
    private options: RelationshipChangeHandlerOptions = {
        logLevel: LogLevel.INFO,
        autoSave: true,
        updateMutualRelationships: true
    };

    /**
     * コンストラクタ
     * @param relationshipRepository 関係性リポジトリ
     * @param eventBusInstance イベントバスインスタンス
     * @param options 設定オプション
     */
    constructor(
        relationshipRepository: IRelationshipRepository,
        eventBusInstance: IEventBus = eventBus,
        options: RelationshipChangeHandlerOptions = {}
    ) {
        this.relationshipRepository = relationshipRepository;
        this.eventBus = eventBusInstance;
        this.options = { ...this.options, ...options };
    }

    /**
     * ハンドラの初期化
     * イベントの購読を設定
     */
    public initialize(): void {
        this.registerEventHandlers();
    }

    /**
     * イベントハンドラの登録
     * @private
     */
    private registerEventHandlers(): void {
        // 関係性作成イベント - ジェネリック型引数を削除
        this.subscriptions.push(
            this.eventBus.subscribe(
                EventTypes.RELATIONSHIP_CREATED,
                this.handleRelationshipCreated.bind(this)
            )
        );

        // 関係性更新イベント - ジェネリック型引数を削除
        this.subscriptions.push(
            this.eventBus.subscribe(
                EventTypes.RELATIONSHIP_UPDATED,
                this.handleRelationshipUpdated.bind(this)
            )
        );

        // 関係性削除イベント - ジェネリック型引数を削除
        this.subscriptions.push(
            this.eventBus.subscribe(
                EventTypes.RELATIONSHIP_DELETED,
                this.handleRelationshipDeleted.bind(this)
            )
        );

        // 関係性強化イベント - ジェネリック型引数を削除
        this.subscriptions.push(
            this.eventBus.subscribe(
                EventTypes.RELATIONSHIP_STRENGTHENED,
                this.handleRelationshipStrengthened.bind(this)
            )
        );

        // 関係性弱化イベント - ジェネリック型引数を削除
        this.subscriptions.push(
            this.eventBus.subscribe(
                EventTypes.RELATIONSHIP_WEAKENED,
                this.handleRelationshipWeakened.bind(this)
            )
        );

        this.log('Relationship change event handlers registered', LogLevel.DEBUG);
    }

    /**
     * ハンドラの終了処理
     * すべての購読を解除
     */
    public dispose(): void {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
        this.subscriptions = [];
        this.log('Relationship change event handlers unsubscribed', LogLevel.DEBUG);
    }

    /**
     * 関係性作成イベントハンドラ
     * @param data 関係性作成イベントデータ
     */
    public async handleRelationshipCreated(data: RelationshipCreatedEvent): Promise<void> {
        this.log(`Relationship created: ${data.char1Id} -> ${data.char2Id} (${data.relationship.type})`, LogLevel.INFO);

        try {
            if (this.options && this.options.autoSave) {
                // 関係性を保存
                await this.relationshipRepository.saveRelationship(data.char1Id, data.char2Id, data.relationship);
                this.log(`Relationship saved: ${data.char1Id} -> ${data.char2Id}`, LogLevel.DEBUG);
            }

            // 相互関係の自動更新（設定に応じて）
            if (this.options && this.options.updateMutualRelationships) {
                await this.updateMutualRelationship(data.char1Id, data.char2Id, data.relationship);
            }

            // 関係グラフの更新
            await this.updateRelationshipGraph();
        } catch (error) {
            this.handleError(
                `Failed to save relationship between ${data.char1Id} and ${data.char2Id}`,
                error,
                data.char1Id,
                data.char2Id
            );
        }
    }

    /**
     * 関係性更新イベントハンドラ
     * @param data 関係性更新イベントデータ
     */
    public async handleRelationshipUpdated(data: RelationshipUpdatedEvent): Promise<void> {
        this.log(`Relationship updated: ${data.char1Id} -> ${data.char2Id} (${data.relationship.type})`, LogLevel.INFO);

        try {
            if (this.options && this.options.autoSave) {
                // 関係性を保存
                await this.relationshipRepository.saveRelationship(data.char1Id, data.char2Id, data.relationship);
                this.log(`Relationship updated: ${data.char1Id} -> ${data.char2Id}`, LogLevel.DEBUG);
            }

            // タイプが変更された場合の処理
            if (data.previousRelationship && data.previousRelationship.type !== data.relationship.type) {
                this.log(`Relationship type changed: ${data.previousRelationship.type} -> ${data.relationship.type}`, LogLevel.INFO);

                // 相互関係の自動更新（設定に応じて）
                if (this.options && this.options.updateMutualRelationships) {
                    await this.updateMutualRelationship(data.char1Id, data.char2Id, data.relationship);
                }
            }

            // 関係性の強さが変更された場合の処理
            if (data.previousRelationship && data.previousRelationship.strength !== data.relationship.strength) {
                if (data.relationship.strength > data.previousRelationship.strength) {
                    // 関係性強化イベントを発行
                    this.eventBus.publish(EventTypes.RELATIONSHIP_STRENGTHENED, {
                        char1Id: data.char1Id,
                        char2Id: data.char2Id,
                        relationType: data.relationship.type,
                        previousStrength: data.previousRelationship.strength,
                        newStrength: data.relationship.strength,
                        reason: 'Updated from relationship update',
                        timestamp: new Date()
                    });
                } else {
                    // 関係性弱化イベントを発行
                    this.eventBus.publish(EventTypes.RELATIONSHIP_WEAKENED, {
                        char1Id: data.char1Id,
                        char2Id: data.char2Id,
                        relationType: data.relationship.type,
                        previousStrength: data.previousRelationship.strength,
                        newStrength: data.relationship.strength,
                        reason: 'Updated from relationship update',
                        timestamp: new Date()
                    });
                }
            }

            // 関係グラフの更新
            await this.updateRelationshipGraph();
        } catch (error) {
            this.handleError(
                `Failed to update relationship between ${data.char1Id} and ${data.char2Id}`,
                error,
                data.char1Id,
                data.char2Id
            );
        }
    }

    /**
     * 関係性削除イベントハンドラ
     * @param data 関係性削除イベントデータ
     */
    public async handleRelationshipDeleted(data: RelationshipDeletedEvent): Promise<void> {
        this.log(`Relationship deleted: ${data.char1Id} -> ${data.char2Id} (${data.relationType})`, LogLevel.INFO);

        try {
            // 現在の関係性を取得
            const relationship = await this.relationshipRepository.getRelationship(data.char1Id, data.char2Id);

            if (!relationship) {
                this.log(`Relationship not found for deletion: ${data.char1Id} -> ${data.char2Id}`, LogLevel.WARNING);
                return;
            }

            // 'NEUTRAL' タイプの空の関係性を保存（削除の代わり）
            const neutralRelationship = {
                targetId: data.char2Id,
                type: 'NEUTRAL' as RelationshipType,
                strength: 0,
                description: 'Relationship reset to neutral'
            };

            if (this.options && this.options.autoSave) {
                await this.relationshipRepository.saveRelationship(data.char1Id, data.char2Id, neutralRelationship);
                this.log(`Relationship reset to neutral: ${data.char1Id} -> ${data.char2Id}`, LogLevel.DEBUG);
            }

            // 相互関係の自動更新（設定に応じて）
            if (this.options && this.options.updateMutualRelationships) {
                const neutralMutualRelationship = {
                    targetId: data.char1Id,
                    type: 'NEUTRAL' as RelationshipType,
                    strength: 0,
                    description: 'Relationship reset to neutral (mutual update)'
                };

                if (this.options && this.options.autoSave) {
                    await this.relationshipRepository.saveRelationship(data.char2Id, data.char1Id, neutralMutualRelationship);
                    this.log(`Mutual relationship reset to neutral: ${data.char2Id} -> ${data.char1Id}`, LogLevel.DEBUG);
                }
            }

            // 関係グラフの更新
            await this.updateRelationshipGraph();
        } catch (error) {
            this.handleError(
                `Failed to delete relationship between ${data.char1Id} and ${data.char2Id}`,
                error,
                data.char1Id,
                data.char2Id
            );
        }
    }

    /**
     * 関係性強化イベントハンドラ
     * @param data 関係性強化イベントデータ
     */
    public async handleRelationshipStrengthened(data: RelationshipStrengthenedEvent): Promise<void> {
        this.log(`Relationship strengthened: ${data.char1Id} -> ${data.char2Id} (${data.relationType})`, LogLevel.INFO);

        try {
            // 現在の関係性を取得
            const relationship = await this.relationshipRepository.getRelationship(data.char1Id, data.char2Id);

            if (!relationship) {
                throw new NotFoundError('Relationship', `${data.char1Id}-${data.char2Id}`);
            }

            // 関係性の強さを更新
            relationship.strength = data.newStrength;

            if (data.reason) {
                // 理由がある場合は説明も更新
                relationship.description = relationship.description
                    ? `${relationship.description}; ${data.reason}`
                    : data.reason;
            }

            if (this.options && this.options.autoSave) {
                await this.relationshipRepository.saveRelationship(data.char1Id, data.char2Id, relationship);
                this.log(`Relationship strength updated: ${data.char1Id} -> ${data.char2Id}`, LogLevel.DEBUG);
            }

            // 更新イベントの発行
            this.eventBus.publish(EventTypes.RELATIONSHIP_UPDATED, {
                char1Id: data.char1Id,
                char2Id: data.char2Id,
                relationship,
                previousRelationship: { ...relationship, strength: data.previousStrength },
                timestamp: new Date()
            });
        } catch (error) {
            this.handleError(
                `Failed to strengthen relationship between ${data.char1Id} and ${data.char2Id}`,
                error,
                data.char1Id,
                data.char2Id
            );
        }
    }

    /**
     * 関係性弱化イベントハンドラ
     * @param data 関係性弱化イベントデータ
     */
    public async handleRelationshipWeakened(data: RelationshipWeakenedEvent): Promise<void> {
        this.log(`Relationship weakened: ${data.char1Id} -> ${data.char2Id} (${data.relationType})`, LogLevel.INFO);

        try {
            // 現在の関係性を取得
            const relationship = await this.relationshipRepository.getRelationship(data.char1Id, data.char2Id);

            if (!relationship) {
                throw new NotFoundError('Relationship', `${data.char1Id}-${data.char2Id}`);
            }

            // 関係性の強さを更新
            relationship.strength = data.newStrength;

            if (data.reason) {
                // 理由がある場合は説明も更新
                relationship.description = relationship.description
                    ? `${relationship.description}; ${data.reason}`
                    : data.reason;
            }

            if (this.options && this.options.autoSave) {
                await this.relationshipRepository.saveRelationship(data.char1Id, data.char2Id, relationship);
                this.log(`Relationship strength updated: ${data.char1Id} -> ${data.char2Id}`, LogLevel.DEBUG);
            }

            // 更新イベントの発行
            this.eventBus.publish(EventTypes.RELATIONSHIP_UPDATED, {
                char1Id: data.char1Id,
                char2Id: data.char2Id,
                relationship,
                previousRelationship: { ...relationship, strength: data.previousStrength },
                timestamp: new Date()
            });

            // 関係性がほぼ消滅した場合（閾値を下回った場合）
            if (data.newStrength < 0.1) {
                this.log(`Relationship almost dissolved: ${data.char1Id} -> ${data.char2Id}`, LogLevel.INFO);

                // 関係性が非常に弱まった場合の追加処理
                // 分析イベントなどを発行可能
            }
        } catch (error) {
            this.handleError(
                `Failed to weaken relationship between ${data.char1Id} and ${data.char2Id}`,
                error,
                data.char1Id,
                data.char2Id
            );
        }
    }

    /**
     * 相互関係の自動更新
     * @param char1Id キャラクター1のID
     * @param char2Id キャラクター2のID
     * @param relationship 元の関係性
     * @private
     */
    private async updateMutualRelationship(char1Id: string, char2Id: string, relationship: any): Promise<void> {
        try {
            // 逆の関係性を取得
            const mutualRelationship = await this.relationshipRepository.getRelationship(char2Id, char1Id);

            // 対応する相互関係のマッピング
            const mutualTypeMap: Record<string, RelationshipType> = {
                'PARENT': 'CHILD' as RelationshipType,
                'CHILD': 'PARENT' as RelationshipType,
                'MENTOR': 'STUDENT' as RelationshipType,
                'STUDENT': 'MENTOR' as RelationshipType,
                'LEADER': 'FOLLOWER' as RelationshipType,
                'FOLLOWER': 'LEADER' as RelationshipType,
                'PROTECTOR': 'PROTECTED' as RelationshipType,
                'PROTECTED': 'PROTECTOR' as RelationshipType,
                'LOVER': 'LOVER' as RelationshipType,
                'FRIEND': 'FRIEND' as RelationshipType,
                'ENEMY': 'ENEMY' as RelationshipType,
                'RIVAL': 'RIVAL' as RelationshipType,
                'COLLEAGUE': 'COLLEAGUE' as RelationshipType,
                'NEUTRAL': 'NEUTRAL' as RelationshipType
            };

            // 対応する相互関係タイプを取得
            const mutualType = mutualTypeMap[relationship.type] || ('NEUTRAL' as RelationshipType);

            if (!mutualRelationship) {
                // 相互関係が存在しない場合は作成
                const newMutualRelationship = {
                    targetId: char1Id,
                    type: mutualType,  // 型アサーションは不要になった
                    strength: relationship.strength * 0.8, // 少し弱め
                    description: `Auto-generated mutual relationship for ${relationship.type}`
                };

                if (this.options && this.options.autoSave) {
                    await this.relationshipRepository.saveRelationship(char2Id, char1Id, newMutualRelationship);
                    this.log(`Created mutual relationship: ${char2Id} -> ${char1Id} (${mutualType})`, LogLevel.DEBUG);
                }

                // 相互関係作成イベントを発行
                this.eventBus.publish(EventTypes.RELATIONSHIP_CREATED, {
                    char1Id: char2Id,
                    char2Id: char1Id,
                    relationship: newMutualRelationship,
                    timestamp: new Date()
                });
            } else if (mutualRelationship.type !== mutualType) {
                // 相互関係のタイプが対応していない場合は更新
                const updatedMutualRelationship = {
                    ...mutualRelationship,
                    type: mutualType,  // 型アサーションは不要になった
                    description: mutualRelationship.description
                        ? `${mutualRelationship.description}; Auto-updated to ${mutualType}`
                        : `Auto-updated to ${mutualType}`
                };

                if (this.options && this.options.autoSave) {
                    await this.relationshipRepository.saveRelationship(char2Id, char1Id, updatedMutualRelationship);
                    this.log(`Updated mutual relationship type: ${char2Id} -> ${char1Id} (${mutualType})`, LogLevel.DEBUG);
                }

                // 相互関係更新イベントを発行
                this.eventBus.publish(EventTypes.RELATIONSHIP_UPDATED, {
                    char1Id: char2Id,
                    char2Id: char1Id,
                    relationship: updatedMutualRelationship,
                    previousRelationship: mutualRelationship,
                    timestamp: new Date()
                });
            }
        } catch (error) {
            this.log(`Failed to update mutual relationship: ${error instanceof Error ? error.message : String(error)}`, LogLevel.ERROR);
            // エラーをスローせず、ログのみ
        }
    }

    /**
     * 関係グラフの更新
     * @private
     */
    private async updateRelationshipGraph(): Promise<void> {
        try {
            // すべての関係性を取得
            const allRelationships = await this.relationshipRepository.getAllRelationships();

            // 関係グラフデータの構築
            const graphData = {
                nodes: new Set<string>(),
                edges: allRelationships.map(rel => ({
                    source: rel.targetId.split('-')[0], // ここでは仮にソースIDを抽出していると仮定
                    target: rel.targetId,
                    type: rel.type,
                    strength: rel.strength
                }))
            };

            // ノードの収集
            graphData.edges.forEach(edge => {
                graphData.nodes.add(edge.source);
                graphData.nodes.add(edge.target);
            });

            // グラフデータの整形
            const formattedGraphData = {
                nodes: Array.from(graphData.nodes).map(id => ({ id })),
                edges: graphData.edges
            };

            // 関係グラフの保存
            await this.relationshipRepository.saveRelationshipGraph(formattedGraphData);
            this.log('Relationship graph updated', LogLevel.DEBUG);
        } catch (error) {
            this.log(`Failed to update relationship graph: ${error instanceof Error ? error.message : String(error)}`, LogLevel.ERROR);
            // エラーをスローせず、ログのみ
        }
    }

    /**
     * エラー処理
     * @param message エラーメッセージ
     * @param error 元のエラー
     * @param char1Id キャラクター1のID
     * @param char2Id キャラクター2のID
     * @private
     */
    private handleError(message: string, error: any, char1Id?: string, char2Id?: string): void {
        const relationshipErrorData = {
            message,
            char1Id,
            char2Id,
            error: error instanceof Error ? error.message : String(error)
        };

        // PersistenceErrorとして包む
        const wrappedError = new PersistenceError(
            'save',
            'Relationship',
            message,
            error instanceof Error ? error : new Error(String(error))
        );

        this.log(`Error: ${wrappedError.getDetails()}`, LogLevel.ERROR);

        // エラーイベントの発行
        this.eventBus.publish('error.relationship', {
            error: wrappedError,
            data: relationshipErrorData,
            timestamp: new Date()
        });
    }

    /**
     * ログ出力
     * @param message メッセージ
     * @param level ログレベル
     * @private
     */
    private log(message: string, level: LogLevel): void {
        // オプショナルチェーン演算子と nullish 合体演算子を使用
        if (level >= (this.options?.logLevel ?? LogLevel.INFO)) {
            const levelName = LogLevel[level];
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] [RelationshipChangeHandler] [${levelName}] ${message}`);
        }
    }
}

// デフォルトエクスポート（ファクトリ関数）
export default function createRelationshipChangeHandler(
    relationshipRepository: IRelationshipRepository,
    options?: RelationshipChangeHandlerOptions
): RelationshipChangeHandler {
    const handler = new RelationshipChangeHandler(relationshipRepository, eventBus, options);
    handler.initialize();
    return handler;
}