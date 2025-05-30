/**
 * キャラクター関係性リポジトリの実装
 * キャラクター間の関係性データの永続化を担当
 */
import { IRelationshipRepository } from '../core/interfaces';
import { Relationship, RelationshipType, RelationshipResponse } from '../core/types';
import { STORAGE_KEYS } from '../core/constants';
import { PersistenceError, NotFoundError } from '../core/errors';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';

export class RelationshipRepository implements IRelationshipRepository {
    // インメモリキャッシュ
    private relationshipCache: Map<string, Relationship> = new Map();
    private graphCache: any = null;
    private cacheExpiry: number = 30 * 60 * 1000; // 30分キャッシュ有効期限
    private lastCacheReset: number = Date.now();

    /**
     * 2キャラクター間の関係性取得
     * @param char1Id 1人目のキャラクターID
     * @param char2Id 2人目のキャラクターID
     * @returns 関係性オブジェクトまたはnull
     */
    async getRelationship(char1Id: string, char2Id: string): Promise<Relationship | null> {
        try {
            // キャッシュ有効期限チェック
            this.checkAndResetCache();

            // IDを常に同じ順序にソートして一意のキャッシュキーを生成
            const [id1, id2] = [char1Id, char2Id].sort();
            const cacheKey = `${id1}_${id2}`;

            // キャッシュから関係性を取得
            if (this.relationshipCache.has(cacheKey)) {
                return this.relationshipCache.get(cacheKey) || null;
            }

            // ファイルパスの生成
            const filePath = `relationships/pairs/${id1}_${id2}.json`;

            // ファイルが存在するか確認
            const exists = await storageProvider.fileExists(filePath);
            if (!exists) {
                return null;
            }

            // ファイルから関係性データを読み込む
            const content = await storageProvider.readFile(filePath);
            const relationshipData = JSON.parse(content) as Relationship;

            // キャッシュに関係性を格納
            this.relationshipCache.set(cacheKey, relationshipData);

            return relationshipData;
        } catch (error) {
            logger.error(`関係性の取得に失敗しました: ${char1Id} <-> ${char2Id}`);
            throw new PersistenceError(
                'read',
                'Relationship',
                `Failed to get relationship between ${char1Id} and ${char2Id}`,
                error instanceof Error ? error : new Error(String(error))
            );
        }
    }

    /**
     * 関係性の保存
     * 双方向の関係性を自動的に処理します
     * 
     * @param char1Id 1人目のキャラクターID
     * @param char2Id 2人目のキャラクターID
     * @param relationship 保存する関係性
     */
    async saveRelationship(char1Id: string, char2Id: string, relationship: Relationship): Promise<void> {
        try {
            // IDを常に同じ順序にソートして一意のファイルパスを生成
            const [id1, id2] = [char1Id, char2Id].sort();
            const cacheKey = `${id1}_${id2}`;

            // 正規化されたリレーションシップデータを構築
            // ターゲットIDが必ず2人目のIDになるよう設定
            const normalizedRelationship: Relationship = {
                ...relationship,
                targetId: id2,
            };

            // キャッシュを更新
            this.relationshipCache.set(cacheKey, normalizedRelationship);

            // ディレクトリの存在確認
            await this.ensureDirectoryExists('relationships/pairs');

            // ファイルパスの生成
            const filePath = `relationships/pairs/${id1}_${id2}.json`;

            // JSONとして保存
            const content = JSON.stringify(normalizedRelationship, null, 2);
            await storageProvider.writeFile(filePath, content);

            logger.debug(`関係性を保存しました: ${filePath}`);

            // グラフキャッシュを無効化 (getAllRelationshipsなどで再構築されるようにする)
            this.graphCache = null;
        } catch (error) {
            logger.error(`関係性の保存に失敗しました: ${char1Id} <-> ${char2Id}`);
            throw new PersistenceError(
                'save',
                'Relationship',
                `Failed to save relationship between ${char1Id} and ${char2Id}`,
                error instanceof Error ? error : new Error(String(error))
            );
        }
    }

    /**
     * すべての関係性データ取得
     * @returns 関係性データの配列
     */
    async getAllRelationships(): Promise<Relationship[]> {
        try {
            // キャッシュ有効期限チェック
            this.checkAndResetCache();

            // relationships/pairs ディレクトリの存在確認
            const exists = await storageProvider.directoryExists('relationships/pairs');
            if (!exists) {
                return [];
            }

            // ディレクトリ内のすべてのファイルリストを取得
            const files = await storageProvider.listFiles('relationships/pairs');

            // 各ファイルから関係性を読み込む
            const relationships: Relationship[] = [];

            for (const file of files) {
                if (!file.endsWith('.json')) continue;

                const filePath = `relationships/pairs/${file}`;
                const content = await storageProvider.readFile(filePath);

                try {
                    const relationship = JSON.parse(content) as Relationship;
                    relationships.push(relationship);

                    // キャッシュの更新
                    const [id1, id2] = file.replace('.json', '').split('_');
                    const cacheKey = `${id1}_${id2}`;
                    this.relationshipCache.set(cacheKey, relationship);
                } catch (error) {
                    logger.warn(`関係性ファイルの解析に失敗しました: ${filePath}`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }

            return relationships;
        } catch (error) {
            logger.error(`すべての関係性の取得に失敗しました`);
            throw new PersistenceError(
                'readAll',
                'Relationship',
                'Failed to get all relationships',
                error instanceof Error ? error : new Error(String(error))
            );
        }
    }

    /**
     * キャラクターの全関係性取得
     * @param characterId キャラクターID
     * @returns そのキャラクターが関わる全関係性
     */
    async getCharacterRelationships(characterId: string): Promise<RelationshipResponse> {
        try {
            // すべての関係性を取得
            const allRelationships = await this.getAllRelationships();

            // 指定したキャラクターが関連する関係性をフィルタリング
            const filteredRelationships = allRelationships.filter(relationship => {
                // 関係性データの構造に合わせてフィルタリング
                if (relationship.targetId === characterId) {
                    return true;
                }

                // characters 配列がある場合はそれも確認
                if ('characters' in relationship &&
                    Array.isArray((relationship as any).characters) &&
                    (relationship as any).characters.includes(characterId)) {
                    return true;
                }

                return false;
            });

            // RelationshipResponse 形式で返す
            return {
                relationships: filteredRelationships
            };
        } catch (error) {
            logger.error(`キャラクターの関係性取得に失敗しました: ${characterId}`);
            throw new PersistenceError(
                'read',
                'CharacterRelationships',
                `Failed to get relationships for character ${characterId}`,
                error instanceof Error ? error : new Error(String(error))
            );
        }
    }

    /**
     * 関係グラフの保存
     * @param graphData 関係グラフデータ
     */
    async saveRelationshipGraph(graphData: any): Promise<void> {
        try {
            // ディレクトリの存在確認
            await this.ensureDirectoryExists('relationships');

            // グラフデータを保存
            const filePath = `relationships/${STORAGE_KEYS.RELATIONSHIP_GRAPH}.json`;
            const content = JSON.stringify(graphData, null, 2);

            await storageProvider.writeFile(filePath, content);

            // キャッシュを更新
            this.graphCache = graphData;

            logger.debug(`関係性グラフを保存しました: ${filePath}`);
        } catch (error) {
            logger.error(`関係性グラフの保存に失敗しました`);
            throw new PersistenceError(
                'save',
                'RelationshipGraph',
                'Failed to save relationship graph',
                error instanceof Error ? error : new Error(String(error))
            );
        }
    }

    /**
     * 関係グラフの取得
     * @returns 関係グラフデータ
     */
    async getRelationshipGraph(): Promise<any> {
        try {
            // キャッシュから取得
            if (this.graphCache !== null) {
                return this.graphCache;
            }

            const filePath = `relationships/${STORAGE_KEYS.RELATIONSHIP_GRAPH}.json`;

            // ファイルの存在確認
            const exists = await storageProvider.fileExists(filePath);
            if (!exists) {
                // グラフが存在しない場合は空のグラフを返す
                return { nodes: [], edges: [] };
            }

            // ファイルからグラフデータを読み込む
            const content = await storageProvider.readFile(filePath);
            const graphData = JSON.parse(content);

            // キャッシュを更新
            this.graphCache = graphData;

            return graphData;
        } catch (error) {
            logger.error(`関係性グラフの取得に失敗しました`);
            throw new PersistenceError(
                'read',
                'RelationshipGraph',
                'Failed to get relationship graph',
                error instanceof Error ? error : new Error(String(error))
            );
        }
    }

    /**
     * 双方向関係性を生成
     * あるキャラクターから見た関係性を、相手から見た関係性に変換します
     * 
     * @param relationship 元の関係性
     * @param originalSourceId 元の関係性の主体ID
     * @returns 変換された関係性
     */
    private reverseRelationship(relationship: Relationship, originalSourceId: string): Relationship {
        // 逆方向の関係タイプを取得
        const reversedType = this.getReverseRelationshipType(relationship.type);

        // 新しい関係性オブジェクトを返却
        return {
            ...relationship,
            type: reversedType,
            targetId: originalSourceId,
        };
    }

    /**
     * 逆方向の関係タイプを取得
     * 
     * @param type 関係タイプ
     * @returns 逆方向の関係タイプ
     */
    private getReverseRelationshipType(type: RelationshipType): RelationshipType {
        // 対称的な関係は同じタイプを返す
        const symmetricalTypes: RelationshipType[] = ['FRIEND', 'ENEMY', 'RIVAL', 'COLLEAGUE', 'NEUTRAL', 'LOVER'];
        if (symmetricalTypes.includes(type)) {
            return type;
        }

        // 非対称的な関係は対応する逆関係を返す
        const reverseMap: Record<RelationshipType, RelationshipType> = {
            'PARENT': 'CHILD',
            'CHILD': 'PARENT',
            'MENTOR': 'STUDENT',
            'STUDENT': 'MENTOR',
            'LEADER': 'FOLLOWER',
            'FOLLOWER': 'LEADER',
            'LOVER': 'LOVER',  // 恋愛関係は対称的
            'PROTECTOR': 'PROTECTED',
            'PROTECTED': 'PROTECTOR',
            'FRIEND': 'FRIEND',
            'ENEMY': 'ENEMY',
            'RIVAL': 'RIVAL',
            'COLLEAGUE': 'COLLEAGUE',
            'NEUTRAL': 'NEUTRAL',
        };

        return reverseMap[type] || 'NEUTRAL';
    }

    /**
     * ディレクトリの存在を確認し、存在しない場合は作成
     * 
     * @param dirPath ディレクトリパス
     */
    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            // ディレクトリの存在を確認
            const exists = await storageProvider.directoryExists(dirPath);

            if (!exists) {
                // ディレクトリを作成
                await storageProvider.createDirectory(dirPath);
                logger.debug(`ディレクトリを作成しました: ${dirPath}`);
            }
        } catch (error) {
            // エラーの場合でも継続（後続の操作で適切なエラーが発生する）
            logger.warn(`ディレクトリ確認中にエラーが発生しました: ${dirPath}`, {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * キャッシュの有効期限をチェックし、必要に応じてリセット
     */
    private checkAndResetCache(): void {
        const now = Date.now();
        if (now - this.lastCacheReset > this.cacheExpiry) {
            this.relationshipCache.clear();
            this.graphCache = null;
            this.lastCacheReset = now;
            logger.debug('関係性キャッシュをリセットしました');
        }
    }
}

export const relationshipRepository = new RelationshipRepository();
