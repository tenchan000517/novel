// services/relationship-service.ts
/**
 * @fileoverview 関係性サービス
 * @description
 * キャラクター間の関係性を管理するサービスクラス。
 * 関係性の更新、取得、分析などの機能を提供し、
 * リポジトリレイヤーとの連携を担当します。
 */
import { IRelationshipService } from '../core/interfaces';
import {
    Character,
    Relationship,
    RelationshipType,
    RelationshipAnalysis,
    RelationshipResponse,
    CharacterCluster
} from '../core/types';
import { relationshipRepository } from '../repositories/relationship-repository';
import { characterRepository } from '../repositories/character-repository';
import { eventBus } from '../events/character-event-bus';
import { EVENT_TYPES } from '../core/constants';
import { logger } from '@/lib/utils/logger';
import { NotFoundError } from '../core/errors';

/**
 * 関係性サービスクラス
 * キャラクター間の関係性を管理する
 */
export class RelationshipService implements IRelationshipService {
    /**
     * 関係性更新
     * @param char1Id 1人目のキャラクターID
     * @param char2Id 2人目のキャラクターID
     * @param type 関係性タイプ
     * @param strength 関係性の強さ
     */
    async updateRelationship(char1Id: string, char2Id: string, type: string, strength: number): Promise<void> {
        try {
            // 両方のキャラクターの存在を確認
            const character1 = await characterRepository.getCharacterById(char1Id);
            if (!character1) {
                throw new NotFoundError('Character', char1Id);
            }

            const character2 = await characterRepository.getCharacterById(char2Id);
            if (!character2) {
                throw new NotFoundError('Character', char2Id);
            }

            // 有効な強度値かチェック
            if (strength < 0 || strength > 1) {
                throw new Error(`無効な関係性強度: ${strength}。0から1の範囲で指定してください。`);
            }

            // 既存の関係性を取得
            const existingRelationship = await relationshipRepository.getRelationship(char1Id, char2Id);

            // 関係性オブジェクトを構築
            const relationshipData: Relationship = {
                targetId: char2Id,
                type: type as RelationshipType,
                strength,
                lastInteraction: new Date(),
                description: '',
                history: []
            };

            // 既存の関係性データが存在する場合は保持
            if (existingRelationship) {
                relationshipData.history = existingRelationship.history || [];
                relationshipData.description = existingRelationship.description || '';
            }

            // 関係性履歴を更新
            if (existingRelationship) {
                (relationshipData.history as any[]).push({
                    timestamp: new Date(),
                    previousType: existingRelationship.type,
                    previousStrength: existingRelationship.strength,
                    newType: type,
                    newStrength: strength,
                    reason: 'Updated relationship'
                });
            }

            // リポジトリに保存
            await relationshipRepository.saveRelationship(char1Id, char2Id, relationshipData);

            // 両方のキャラクターのリレーションシップリストも更新
            await this.updateCharacterRelationshipLists(char1Id, char2Id, relationshipData);

            // 関係性更新イベントを発行
            eventBus.publish(EVENT_TYPES.RELATIONSHIP_UPDATED, {
                timestamp: new Date(),
                char1Id,
                char2Id,
                relationship: relationshipData,
                previousRelationship: existingRelationship
            });

            logger.info(`関係性を更新しました: ${character1.name} <-> ${character2.name}, タイプ: ${type}, 強度: ${strength}`);
        } catch (error) {
            logger.error(`関係性更新中にエラーが発生しました: ${char1Id} <-> ${char2Id}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * キャラクターの関係性リストを更新する
     * @private
     * @param char1Id 1人目のキャラクターID
     * @param char2Id 2人目のキャラクターID
     * @param relationship 関係性
     */
    private async updateCharacterRelationshipLists(
        char1Id: string,
        char2Id: string,
        relationship: Relationship
    ): Promise<void> {
        try {
            // 両方のキャラクターを取得
            const char1 = await characterRepository.getCharacterById(char1Id);
            const char2 = await characterRepository.getCharacterById(char2Id);

            if (!char1 || !char2) return;

            // キャラクター1の関係性リストを更新
            const char1Relationships = char1.relationships || [];
            const char1RelationshipIndex = char1Relationships.findIndex(rel => rel.targetId === char2Id);

            if (char1RelationshipIndex >= 0) {
                // 既存の関係性を更新
                char1Relationships[char1RelationshipIndex] = {
                    ...char1Relationships[char1RelationshipIndex],
                    type: relationship.type,
                    strength: relationship.strength,
                    targetName: char2.name
                };
            } else {
                // 新しい関係性を追加
                char1Relationships.push({
                    targetId: char2Id,
                    targetName: char2.name,
                    type: relationship.type,
                    strength: relationship.strength,
                    history: []
                });
            }

            // キャラクター2の関係性リストを更新
            const char2Relationships = char2.relationships || [];
            const char2RelationshipIndex = char2Relationships.findIndex(rel => rel.targetId === char1Id);

            // 逆方向の関係タイプを取得
            const reverseType = this.getReverseRelationshipType(relationship.type);

            if (char2RelationshipIndex >= 0) {
                // 既存の関係性を更新
                char2Relationships[char2RelationshipIndex] = {
                    ...char2Relationships[char2RelationshipIndex],
                    type: reverseType,
                    strength: relationship.strength,
                    targetName: char1.name
                };
            } else {
                // 新しい関係性を追加
                char2Relationships.push({
                    targetId: char1Id,
                    targetName: char1.name,
                    type: reverseType,
                    strength: relationship.strength,
                    history: []
                });
            }

            // 両方のキャラクターを更新
            await characterRepository.updateCharacterProperty(char1Id, 'relationships', char1Relationships);
            await characterRepository.updateCharacterProperty(char2Id, 'relationships', char2Relationships);
        } catch (error) {
            logger.error(`キャラクター関係性リスト更新中にエラーが発生しました: ${char1Id} <-> ${char2Id}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            // エラーを投げずに続行
        }
    }

    /**
     * 逆方向の関係タイプを取得する
     * @private
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
     * 関連キャラクター取得
     * @param characterId キャラクターID
     * @returns 関連するキャラクターIDの配列
     */
    async getConnectedCharacters(characterId: string): Promise<string[]> {
        try {
            // キャラクターの存在確認
            const character = await characterRepository.getCharacterById(characterId);
            if (!character) {
                throw new NotFoundError('Character', characterId);
            }

            // 関係性リポジトリから関連キャラクターを取得
            const relationshipResponse = await relationshipRepository.getCharacterRelationships(characterId);

            // 関連するキャラクターIDの一意な集合を作成
            const connectedCharacterIds = new Set<string>();
            for (const rel of relationshipResponse.relationships) {
                if ('targetId' in rel) {
                    connectedCharacterIds.add(rel.targetId);
                } else if ('characters' in rel && Array.isArray((rel as any).characters)) {
                    for (const charId of (rel as any).characters) {
                        if (charId !== characterId) {
                            connectedCharacterIds.add(charId);
                        }
                    }
                }
            }

            return Array.from(connectedCharacterIds);
        } catch (error) {
            logger.error(`関連キャラクター取得中にエラーが発生しました: ${characterId}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * キャラクター関係性取得
     * @param characterId キャラクターID
     * @returns 関係性データレスポンス
     */
    async getCharacterRelationships(characterId: string): Promise<RelationshipResponse> {
        try {
            // キャラクターの存在確認
            const character = await characterRepository.getCharacterById(characterId);
            if (!character) {
                throw new NotFoundError('Character', characterId);
            }

            // リポジトリから関係性を取得
            const relationshipResponse = await relationshipRepository.getCharacterRelationships(characterId);

            // キャラクター情報を関係性に追加
            const enrichedRelationships: Relationship[] = [];
            for (const rel of relationshipResponse.relationships) {
                // 関係性の対象IDを確認
                let targetId: string | undefined;

                if ('targetId' in rel) {
                    targetId = rel.targetId;
                } else if ('characters' in rel && Array.isArray((rel as any).characters)) {
                    // 対象IDをcharacters配列から取得
                    targetId = (rel as any).characters.find((id: string) => id !== characterId);
                }

                if (targetId) {
                    // 対象キャラクターの名前を取得
                    const targetCharacter = await characterRepository.getCharacterById(targetId);
                    if (targetCharacter) {
                        const enrichedRel: Relationship = {
                            ...rel,
                            targetId,
                            targetName: targetCharacter.name
                        };
                        enrichedRelationships.push(enrichedRel);
                    }
                }
            }

            // RelationshipResponse形式で返す
            return {
                relationships: enrichedRelationships
            };
        } catch (error) {
            logger.error(`キャラクター関係性取得中にエラーが発生しました: ${characterId}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            // エラー時は空のレスポンスを返す
            return { relationships: [] };
        }
    }

    /**
     * 関係性動態分析
     * @returns 関係性分析結果
     */
    async analyzeRelationshipDynamics(): Promise<RelationshipAnalysis> {
        try {
            // 関係性グラフデータを取得
            const graphData = await relationshipRepository.getRelationshipGraph();

            // 関係性クラスターを検出
            const clusters = await this.detectRelationshipClusters();

            // 対立関係を検出
            const tensions = await this.detectTensions();

            // 関係性発展を追跡
            const developments = await this.trackRelationshipDevelopments();

            // 分析結果を構築
            const analysis: RelationshipAnalysis = {
                clusters,
                tensions,
                developments,
                visualData: graphData
            };

            // 分析イベントを発行
            eventBus.publish(EVENT_TYPES.RELATIONSHIP_ANALYZED, {
                timestamp: new Date(),
                analysis
            });

            return analysis;
        } catch (error) {
            logger.error('関係性動態分析中にエラーが発生しました', {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー時の最小限のレスポンス
            return {
                clusters: [],
                tensions: [],
                developments: [],
                visualData: { nodes: [], edges: [] }
            };
        }
    }

    /**
     * 関係性クラスター検出
     * @returns キャラクタークラスターの配列
     */
    async detectRelationshipClusters(): Promise<CharacterCluster[]> {
        try {
            // すべての関係性を取得
            const allRelationships = await relationshipRepository.getAllRelationships();

            // すべてのキャラクターを取得
            const allCharacters = await characterRepository.getAllCharacters();

            // キャラクターIDからキャラクターへのマップを作成
            const characterMap = new Map<string, Character>();
            for (const character of allCharacters) {
                characterMap.set(character.id, character);
            }

            // 関係グラフを構築
            const relationGraph = new Map<string, Map<string, { type: RelationshipType; strength: number; }>>();

            // すべてのキャラクターをグラフに追加
            for (const character of allCharacters) {
                relationGraph.set(character.id, new Map());
            }

            // 関係性をグラフに追加
            for (const relationship of allRelationships) {
                let char1Id: string;
                let char2Id: string;

                if ('targetId' in relationship) {
                    // targetIdがある場合
                    const sourceCharacters = Array.from(relationGraph.keys()).filter(id =>
                        relationGraph.get(id)?.has(relationship.targetId)
                    );

                    if (sourceCharacters.length > 0) {
                        char1Id = sourceCharacters[0];
                        char2Id = relationship.targetId;
                    } else {
                        continue; // 関係性の主体が不明
                    }
                } else if ('characters' in relationship && Array.isArray((relationship as any).characters)) {
                    // characters配列がある場合
                    const chars = (relationship as any).characters;
                    if (chars.length >= 2) {
                        char1Id = chars[0];
                        char2Id = chars[1];
                    } else {
                        continue; // 関係性の両方のキャラクターがない
                    }
                } else {
                    continue; // 不明な関係性フォーマット
                }

                // 両方のキャラクターが存在するか確認
                if (!relationGraph.has(char1Id) || !relationGraph.has(char2Id)) {
                    continue;
                }

                // 関係性の強度とタイプを取得
                const type = relationship.type;
                const strength = relationship.strength;

                // 双方向に関係性を追加
                relationGraph.get(char1Id)?.set(char2Id, { type, strength });
                relationGraph.get(char2Id)?.set(char1Id, {
                    type: this.getReverseRelationshipType(type),
                    strength
                });
            }

            // クラスター検出アルゴリズムを実装
            const clusters = this.detectClusters(relationGraph);

            // 結果のクラスター配列を構築
            const resultClusters: CharacterCluster[] = [];

            for (let i = 0; i < clusters.length; i++) {
                const clusterMembers = clusters[i];
                if (clusterMembers.length < 2) continue; // 単一メンバーのクラスターは無視

                // クラスターIDを生成
                const clusterId = `cluster_${i}`;

                // クラスター内での優勢な関係性タイプを特定
                const dominantRelation = this.getDominantRelationType(clusterMembers, relationGraph);

                // クラスターの結束度を計算
                const cohesion = this.calculateClusterCohesion(clusterMembers, relationGraph);

                resultClusters.push({
                    id: clusterId,
                    members: clusterMembers,
                    dominantRelation,
                    cohesion
                });
            }

            return resultClusters;
        } catch (error) {
            logger.error('関係性クラスター検出中にエラーが発生しました', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * クラスターの検出
     * @private
     * @param relationGraph 関係グラフ
     * @returns クラスターの配列
     */
    private detectClusters(
        relationGraph: Map<string, Map<string, { type: RelationshipType; strength: number; }>>
    ): string[][] {
        // クラスター検出のためのデータ構造
        const clusters: string[][] = [];
        const visited = new Set<string>();

        // すべてのキャラクターを処理
        for (const characterId of relationGraph.keys()) {
            if (visited.has(characterId)) continue;

            // 新しいクラスターを開始
            const cluster = this.buildCluster(characterId, relationGraph, visited);
            if (cluster.length > 0) {
                clusters.push(cluster);
            }
        }

        return clusters;
    }

    /**
     * 単一のクラスターを構築する
     * @private
     * @param startId 開始キャラクターID
     * @param relationGraph 関係グラフ
     * @param visited 訪問済みセット
     * @returns クラスターメンバー配列
     */
    private buildCluster(
        startId: string,
        relationGraph: Map<string, Map<string, { type: RelationshipType; strength: number; }>>,
        visited: Set<string>
    ): string[] {
        const cluster: string[] = [];

        // 幅優先探索でクラスターを構築
        const queue: string[] = [startId];
        visited.add(startId);

        while (queue.length > 0) {
            const currentId = queue.shift()!;
            cluster.push(currentId);

            const relations = relationGraph.get(currentId);
            if (!relations) continue;

            // 強い関係性を持つキャラクターをクラスターに追加
            for (const [targetId, relation] of relations.entries()) {
                if (visited.has(targetId)) continue;

                // 関係性の強度閾値（0.6以上をクラスターとみなす）
                if (relation.strength >= 0.6) {
                    queue.push(targetId);
                    visited.add(targetId);
                }
            }
        }

        return cluster;
    }

    /**
     * クラスター内の優勢な関係タイプを取得する
     * @private
     * @param members クラスターメンバー配列
     * @param relationGraph 関係グラフ
     * @returns 優勢な関係タイプ
     */
    private getDominantRelationType(
        members: string[],
        relationGraph: Map<string, Map<string, { type: RelationshipType; strength: number; }>>
    ): RelationshipType {
        const typeCounts: Record<RelationshipType, number> = {} as Record<RelationshipType, number>;

        // 各メンバー間の関係をカウント
        for (let i = 0; i < members.length; i++) {
            for (let j = i + 1; j < members.length; j++) {
                const relations = relationGraph.get(members[i]);
                if (relations && relations.has(members[j])) {
                    const relationType = relations.get(members[j])!.type;
                    typeCounts[relationType] = (typeCounts[relationType] || 0) + 1;
                }
            }
        }

        // 最も多い関係タイプを特定
        let maxCount = 0;
        let dominantType: RelationshipType = 'NEUTRAL';

        for (const [type, count] of Object.entries(typeCounts)) {
            if (count > maxCount) {
                maxCount = count;
                dominantType = type as RelationshipType;
            }
        }

        return dominantType;
    }

    /**
     * クラスターの結束度を計算する
     * @private
     * @param members クラスターメンバー配列
     * @param relationGraph 関係グラフ
     * @returns 結束度（0-1）
     */
    private calculateClusterCohesion(
        members: string[],
        relationGraph: Map<string, Map<string, { type: RelationshipType; strength: number; }>>
    ): number {
        if (members.length <= 1) return 0;

        let totalStrength = 0;
        let relationCount = 0;

        // 各メンバー間の関係強度の平均を計算
        for (let i = 0; i < members.length; i++) {
            for (let j = i + 1; j < members.length; j++) {
                const relations = relationGraph.get(members[i]);
                if (relations && relations.has(members[j])) {
                    totalStrength += relations.get(members[j])!.strength;
                    relationCount++;
                }
            }
        }

        return relationCount > 0 ? totalStrength / relationCount : 0;
    }

    /**
     * 対立関係検出
     * @returns 対立関係情報の配列
     */
    async detectTensions(): Promise<any[]> {
        try {
            // すべての関係性を取得
            const allRelationships = await relationshipRepository.getAllRelationships();

            // 対立関係のタイプ
            const tensionTypes: RelationshipType[] = ['ENEMY', 'RIVAL'];

            // 結果配列
            const tensions: any[] = [];

            // 各関係性を調査
            for (const relationship of allRelationships) {
                // 関係性のキャラクターを特定
                let char1Id: string | undefined;
                let char2Id: string | undefined;

                if ('targetId' in relationship) {
                    // targetIdがある場合、sourceIdを探索
                    const sourceCharacters = await this.findSourceCharacters(relationship.targetId);
                    if (sourceCharacters.length > 0) {
                        char1Id = sourceCharacters[0];
                        char2Id = relationship.targetId;
                    }
                } else if ('characters' in relationship && Array.isArray((relationship as any).characters)) {
                    // characters配列がある場合
                    const chars = (relationship as any).characters;
                    if (chars.length >= 2) {
                        char1Id = chars[0];
                        char2Id = chars[1];
                    }
                }

                // 両方のキャラクターが確認できる場合のみ処理
                if (char1Id && char2Id) {
                    // 対立関係で強度が高いものを検出
                    if (tensionTypes.includes(relationship.type) && relationship.strength >= 0.7) {
                        // 両方のキャラクター情報を取得
                        const char1 = await characterRepository.getCharacterById(char1Id);
                        const char2 = await characterRepository.getCharacterById(char2Id);

                        if (char1 && char2) {
                            tensions.push({
                                characters: [char1Id, char2Id],
                                characterNames: [char1.name, char2.name],
                                type: relationship.type,
                                intensity: relationship.strength,
                                description: relationship.description || this.generateTensionDescription(char1.name, char2.name, relationship),
                            });
                        }
                    }
                }
            }

            return tensions;
        } catch (error) {
            logger.error('対立関係検出中にエラーが発生しました', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 対象キャラクターの関係元を探索
     * @private
     * @param targetId 対象キャラクターID
     * @returns 関係元キャラクターID配列
     */
    private async findSourceCharacters(targetId: string): Promise<string[]> {
        // すべてのキャラクターを取得
        const allCharacters = await characterRepository.getAllCharacters();

        // targetIdへの関係を持つキャラクターを探索
        const sourceCharacters: string[] = [];

        for (const character of allCharacters) {
            if (character.relationships) {
                for (const rel of character.relationships) {
                    if (rel.targetId === targetId) {
                        sourceCharacters.push(character.id);
                        break;
                    }
                }
            }
        }

        return sourceCharacters;
    }

    /**
     * 対立関係の説明を生成する
     * @private
     * @param char1Name キャラクター1の名前
     * @param char2Name キャラクター2の名前
     * @param relationship 関係性
     * @returns 説明文
     */
    private generateTensionDescription(char1Name: string, char2Name: string, relationship: Relationship): string {
        // カスタム説明があればそれを使用
        if (relationship.description) {
            return relationship.description;
        }

        // デフォルトの説明
        let description = `${char1Name}と${char2Name}の間に強い`;

        switch (relationship.type) {
            case 'ENEMY':
                description += '敵対関係';
                break;
            case 'RIVAL':
                description += 'ライバル関係';
                break;
            default:
                description += `${relationship.type}関係`;
        }

        return `${description}があります。強度: ${relationship.strength.toFixed(2)}`;
    }

    /**
     * 関係性発展追跡
     * @returns 発展情報の配列
     */
    async trackRelationshipDevelopments(): Promise<any[]> {
        try {
            // すべての関係性を取得
            const allRelationships = await relationshipRepository.getAllRelationships();

            // 発展追跡の結果配列
            const developments: any[] = [];

            // 各関係性の履歴を調査
            for (const relationship of allRelationships) {
                // 関係性のキャラクターを特定
                let char1Id: string | undefined;
                let char2Id: string | undefined;

                if ('targetId' in relationship) {
                    // targetIdがある場合、sourceIdを探索
                    const sourceCharacters = await this.findSourceCharacters(relationship.targetId);
                    if (sourceCharacters.length > 0) {
                        char1Id = sourceCharacters[0];
                        char2Id = relationship.targetId;
                    }
                } else if ('characters' in relationship && Array.isArray((relationship as any).characters)) {
                    // characters配列がある場合
                    const chars = (relationship as any).characters;
                    if (chars.length >= 2) {
                        char1Id = chars[0];
                        char2Id = chars[1];
                    }
                }

                // 履歴がある場合のみ発展を分析
                if (char1Id && char2Id && relationship.history && relationship.history.length > 1) {
                    // 最新の履歴エントリと一つ前を比較
                    const latest = relationship.history[relationship.history.length - 1];
                    const previous = relationship.history[relationship.history.length - 2];

                    // 関係タイプまたは強度に変化がある場合
                    if (latest.newType !== previous.newType ||
                        Math.abs(latest.newStrength - previous.newStrength) > 0.1) {

                        // キャラクター情報を取得
                        const char1 = await characterRepository.getCharacterById(char1Id);
                        const char2 = await characterRepository.getCharacterById(char2Id);

                        if (char1 && char2) {
                            developments.push({
                                characters: [char1Id, char2Id],
                                characterNames: [char1.name, char2.name],
                                from: {
                                    type: previous.newType,
                                    strength: previous.newStrength
                                },
                                to: {
                                    type: latest.newType,
                                    strength: latest.newStrength
                                },
                                timestamp: latest.timestamp,
                                significance: Math.abs(latest.newStrength - previous.newStrength),
                                description: this.generateDevelopmentDescription(char1.name, char2.name, previous, latest)
                            });
                        }
                    }
                }
            }

            // 重要度順にソート
            return developments.sort((a, b) => b.significance - a.significance);
        } catch (error) {
            logger.error('関係性発展追跡中にエラーが発生しました', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 関係性発展の説明を生成する
     * @private
     * @param char1Name キャラクター1の名前
     * @param char2Name キャラクター2の名前
     * @param previous 前の関係性状態
     * @param latest 最新の関係性状態
     * @returns 説明文
     */
    private generateDevelopmentDescription(
        char1Name: string,
        char2Name: string,
        previous: any,
        latest: any
    ): string {
        // 関係タイプの変化
        if (previous.newType !== latest.newType) {
            return `${char1Name}と${char2Name}の関係性が「${previous.newType}」から「${latest.newType}」に変化しました`;
        }

        // 強度のみの変化
        const strengthDiff = latest.newStrength - previous.newStrength;
        const direction = strengthDiff > 0 ? '強化' : '弱化';

        return `${char1Name}と${char2Name}の「${latest.newType}」関係が${direction}されました（${Math.abs(strengthDiff).toFixed(2)}ポイント）`;
    }
}

// シングルトンインスタンスをエクスポート
export const relationshipService = new RelationshipService();