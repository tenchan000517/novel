/**
 * @fileoverview 関係性分析コンポーネント
 * @description
 * キャラクター間の関係性を分析するコンポーネント。
 * 関係性のクラスター検出、対立関係検出、発展追跡、可視化データ生成を担当します。
 * RelationshipGraphから分析ロジックのみを抽出して責任を明確に分離しています。
 */
import { IRelationshipAnalyzer } from '../core/interfaces';
import { 
  CharacterCluster, 
  RelationshipType, 
  RelationshipTension,
  Relationship
} from '../core/types';
import { IRelationshipRepository } from '../core/interfaces';
import { ICharacterRepository } from '../core/interfaces';
import { relationshipRepository } from '../repositories/relationship-repository';
import { characterRepository } from '../repositories/character-repository';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';

/**
 * 関係性分析クラス
 * キャラクター間の関係性のパターンや動態を分析
 */
export class RelationshipAnalyzer implements IRelationshipAnalyzer {
  private relationshipRepo: IRelationshipRepository;
  private characterRepo: ICharacterRepository;
  
  // 分析結果のキャッシュ
  private clusterCache: {
    clusters: CharacterCluster[];
    timestamp: number;
  } | null = null;
  
  private tensionCache: {
    tensions: RelationshipTension[];
    timestamp: number;
  } | null = null;
  
  private developmentCache: {
    developments: any[];
    timestamp: number;
  } | null = null;
  
  // キャッシュの有効期間 (10分)
  private readonly CACHE_TTL_MS = 600000;
  
  /**
   * コンストラクタ
   * @param relationshipRepo 関係性リポジトリ
   * @param characterRepo キャラクターリポジトリ
   */
  constructor(
    relationshipRepo: IRelationshipRepository = relationshipRepository,
    characterRepo: ICharacterRepository = characterRepository
  ) {
    this.relationshipRepo = relationshipRepo;
    this.characterRepo = characterRepo;
    logger.info('RelationshipAnalyzer: 初期化完了');
  }

  /**
   * クラスター検出
   * 関係性の強さに基づいてキャラクターをグループ化したクラスターを検出します
   * 
   * @returns キャラクタークラスターの配列
   */
  async detectClusters(): Promise<CharacterCluster[]> {
    try {
      // キャッシュチェック
      if (this.clusterCache && (Date.now() - this.clusterCache.timestamp < this.CACHE_TTL_MS)) {
        logger.debug('クラスター検出: キャッシュを使用します');
        return this.clusterCache.clusters;
      }
      
      logger.info('関係性クラスターの検出を開始します');
      
      // すべての関係性を取得
      const allRelationships = await this.relationshipRepo.getAllRelationships();
      
      // すべてのキャラクターを取得
      const allCharacters = await this.characterRepo.getAllCharacters();
      
      // キャラクターIDからキャラクターへのマップを作成
      const characterMap = new Map();
      for (const character of allCharacters) {
        characterMap.set(character.id, character);
      }
      
      // 関係グラフを構築
      const relationGraph = this.buildRelationshipGraph(allRelationships, allCharacters);
      
      // クラスター検出アルゴリズムを実行
      const clusters = this.findClusters(relationGraph);
      
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
      
      // 結果をキャッシュに保存
      this.clusterCache = {
        clusters: resultClusters,
        timestamp: Date.now()
      };
      
      logger.info(`${resultClusters.length}件の関係性クラスターを検出しました`);
      return resultClusters;
    } catch (error) {
      logError(error, {}, 'クラスター検出中にエラーが発生しました');
      return [];
    }
  }

  /**
   * 対立検出
   * グラフ内の対立関係（ENEMY, RIVAL）を強度が高いものを検出します
   * 
   * @returns 関係性対立の配列
   */
  async detectTensions(): Promise<RelationshipTension[]> {
    try {
      // キャッシュチェック
      if (this.tensionCache && (Date.now() - this.tensionCache.timestamp < this.CACHE_TTL_MS)) {
        logger.debug('対立関係検出: キャッシュを使用します');
        return this.tensionCache.tensions;
      }
      
      logger.info('関係性の対立を検出します');
      
      // すべての関係性を取得
      const allRelationships = await this.relationshipRepo.getAllRelationships();
      
      // 対立関係のタイプ
      const tensionTypes: RelationshipType[] = ['ENEMY', 'RIVAL'];
      
      // 結果配列
      const tensions: RelationshipTension[] = [];
      
      // 各関係性を調査
      for (const relationship of allRelationships) {
        // 関係性のキャラクターを特定
        let char1Id: string | undefined;
        let char2Id: string | undefined;
        
        // targetIdがある場合
        if ('targetId' in relationship) {
          // sourceIdを見つける必要がある
          const sourceCharacters = await this.findRelationshipsWithTarget(relationship.targetId);
          if (sourceCharacters.length > 0) {
            char1Id = sourceCharacters[0].characterId;
            char2Id = relationship.targetId;
          }
        } 
        // characters配列がある場合
        else if ('characters' in relationship && Array.isArray((relationship as any).characters)) {
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
            const char1 = await this.characterRepo.getCharacterById(char1Id);
            const char2 = await this.characterRepo.getCharacterById(char2Id);
            
            if (char1 && char2) {
              tensions.push({
                characters: [char1Id, char2Id],
                type: relationship.type,
                intensity: relationship.strength,
                description: relationship.description || this.generateTensionDescription(char1.name, char2.name, relationship)
              });
            }
          }
        }
      }
      
      // 強度でソート
      const sortedTensions = tensions.sort((a, b) => b.intensity - a.intensity);
      
      // 結果をキャッシュに保存
      this.tensionCache = {
        tensions: sortedTensions,
        timestamp: Date.now()
      };
      
      logger.info(`${sortedTensions.length}件の対立関係を検出しました`);
      return sortedTensions;
    } catch (error) {
      logError(error, {}, '対立関係検出中にエラーが発生しました');
      return [];
    }
  }

  /**
   * 関係性発展追跡
   * グラフ内の関係性履歴を分析し、関係性の変化を検出して追跡します
   * 
   * @returns 発展情報の配列
   */
  async trackRelationshipDevelopments(): Promise<any[]> {
    try {
      // キャッシュチェック
      if (this.developmentCache && (Date.now() - this.developmentCache.timestamp < this.CACHE_TTL_MS)) {
        logger.debug('関係性発展追跡: キャッシュを使用します');
        return this.developmentCache.developments;
      }
      
      logger.info('関係性の発展を追跡します');
      
      // すべての関係性を取得
      const allRelationships = await this.relationshipRepo.getAllRelationships();
      
      // 発展追跡の結果配列
      const developments: any[] = [];
      
      // 各関係性の履歴を調査
      for (const relationship of allRelationships) {
        // 関係性のキャラクターを特定
        let char1Id: string | undefined;
        let char2Id: string | undefined;
        
        // targetIdがある場合
        if ('targetId' in relationship) {
          // sourceIdを見つける必要がある
          const sourceCharacters = await this.findRelationshipsWithTarget(relationship.targetId);
          if (sourceCharacters.length > 0) {
            char1Id = sourceCharacters[0].characterId;
            char2Id = relationship.targetId;
          }
        } 
        // characters配列がある場合
        else if ('characters' in relationship && Array.isArray((relationship as any).characters)) {
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
            const char1 = await this.characterRepo.getCharacterById(char1Id);
            const char2 = await this.characterRepo.getCharacterById(char2Id);
            
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
      const sortedDevelopments = developments.sort((a, b) => b.significance - a.significance);
      
      // 結果をキャッシュに保存
      this.developmentCache = {
        developments: sortedDevelopments,
        timestamp: Date.now()
      };
      
      logger.info(`${sortedDevelopments.length}件の関係性発展を追跡しました`);
      return sortedDevelopments;
    } catch (error) {
      logError(error, {}, '関係性発展追跡中にエラーが発生しました');
      return [];
    }
  }

  /**
   * 視覚化データ生成
   * 関係性グラフをノードとエッジのデータ構造に変換し、
   * 可視化に適した形式で返します
   * 
   * @returns 可視化データ
   */
  async generateVisualizationData(): Promise<any> {
    try {
      logger.info('関係性の可視化データを生成します');
      
      // すべての関係性を取得
      const allRelationships = await this.relationshipRepo.getAllRelationships();
      
      // すべてのキャラクターを取得
      const allCharacters = await this.characterRepo.getAllCharacters();
      
      // ノードとエッジのデータを作成
      const nodes: any[] = [];
      const edges: any[] = [];
      
      // キャラクターをノードとして追加
      for (const character of allCharacters) {
        nodes.push({
          id: character.id,
          name: character.name,
          type: character.type,
          // 接続数を後で計算
          connections: 0
        });
      }
      
      // キャラクターIDからノードインデックスへのマップ
      const nodeMap = new Map();
      nodes.forEach((node, index) => {
        nodeMap.set(node.id, index);
      });
      
      // 関係性をエッジとして追加
      const processedPairs = new Set<string>();
      
      for (const relationship of allRelationships) {
        let char1Id: string | undefined;
        let char2Id: string | undefined;
        let relationType: RelationshipType = 'NEUTRAL'; // デフォルト値を設定
        let strength: number = 0; // デフォルト値を設定
        let description: string | undefined;
        
        // targetIdがある場合
        if ('targetId' in relationship) {
          char2Id = relationship.targetId;
          const sourceCharacters = await this.findRelationshipsWithTarget(relationship.targetId);
          if (sourceCharacters.length > 0) {
            char1Id = sourceCharacters[0].characterId;
          }
          relationType = relationship.type;
          strength = relationship.strength;
          description = relationship.description;
        } 
        // characters配列がある場合
        else if ('characters' in relationship && Array.isArray((relationship as any).characters)) {
          const chars = (relationship as any).characters;
          if (chars.length >= 2) {
            char1Id = chars[0];
            char2Id = chars[1];
            relationType = (relationship as any).type;
            strength = (relationship as any).strength;
            description = (relationship as any).description;
          }
        } else {
          continue; // 不明な関係性フォーマット
        }
        
        if (!char1Id || !char2Id) continue;
        
        // ID順序でソートしてペアの一意性を確保
        const [sourceId, targetId] = [char1Id, char2Id].sort();
        const pairKey = `${sourceId}-${targetId}`;
        
        // 未処理のペアのみ追加
        if (!processedPairs.has(pairKey)) {
          processedPairs.add(pairKey);
          
          // ノードマップにキャラクターが存在する場合のみエッジを追加
          if (nodeMap.has(sourceId) && nodeMap.has(targetId)) {
            edges.push({
              source: sourceId,
              target: targetId,
              type: relationType,
              strength,
              description: description || undefined
            });
            
            // 接続数を更新
            nodes[nodeMap.get(sourceId)].connections++;
            nodes[nodeMap.get(targetId)].connections++;
          }
        }
      }
      
      // クラスター情報を取得して追加
      const clusters = await this.detectClusters();
      
      // タイプ別の色情報を追加
      const nodeColorMap = {
        'MAIN': '#E57373', // 赤系
        'SUB': '#64B5F6',  // 青系
        'MOB': '#81C784'   // 緑系
      };
      
      // ノードにクラスター情報と色情報を追加
      nodes.forEach(node => {
        // クラスター所属を検索
        const cluster = clusters.find(c => c.members.includes(node.id));
        node.cluster = cluster ? cluster.id : null;
        
        // タイプに基づく色を設定
        node.color = nodeColorMap[node.type as keyof typeof nodeColorMap] || '#9E9E9E';
      });
      
      return { 
        nodes, 
        edges,
        clusters: clusters.map(c => ({
          id: c.id,
          memberCount: c.members.length,
          dominantRelation: c.dominantRelation,
          cohesion: c.cohesion
        }))
      };
    } catch (error) {
      logError(error, {}, '可視化データ生成中にエラーが発生しました');
      return { nodes: [], edges: [], clusters: [] };
    }
  }

  /**
   * 関係性グラフの統計情報を取得する
   * 
   * @returns 統計情報
   */
  async getGraphStatistics(): Promise<any> {
    try {
      logger.info('関係性グラフの統計情報を取得します');
      
      // すべての関係性を取得
      const allRelationships = await this.relationshipRepo.getAllRelationships();
      
      // すべてのキャラクターを取得
      const allCharacters = await this.characterRepo.getAllCharacters();
      
      // 関係タイプの頻度カウント
      const relationTypeCounts: Record<RelationshipType, number> = {
        'PARENT': 0, 'CHILD': 0, 'MENTOR': 0, 'STUDENT': 0, 
        'LEADER': 0, 'FOLLOWER': 0, 'LOVER': 0, 'PROTECTOR': 0,
        'PROTECTED': 0, 'FRIEND': 0, 'ENEMY': 0, 'RIVAL': 0,
        'COLLEAGUE': 0, 'NEUTRAL': 0
      };
      
      // 関係強度の合計
      let totalStrength = 0;
      let relationshipCount = 0;
      
      // 各関係性を処理
      for (const relationship of allRelationships) {
        if ('type' in relationship) {
          relationTypeCounts[relationship.type] = (relationTypeCounts[relationship.type] || 0) + 1;
          totalStrength += relationship.strength || 0;
          relationshipCount++;
        }
      }
      
      // クラスター情報
      const clusters = await this.detectClusters();
      
      // 結果の構築
      return {
        characterCount: allCharacters.length,
        relationshipCount,
        avgRelationshipStrength: relationshipCount > 0 ? totalStrength / relationshipCount : 0,
        clusterCount: clusters.length,
        isolatedCharactersCount: this.countIsolatedCharacters(allCharacters, allRelationships),
        relationTypeDistribution: relationTypeCounts,
        highestClusterCohesion: clusters.length > 0 ? 
          Math.max(...clusters.map(c => c.cohesion)) : 0,
        dominantRelationshipType: this.getDominantRelationshipTypeOverall(relationTypeCounts)
      };
    } catch (error) {
      logError(error, {}, '関係性グラフ統計情報の取得中にエラーが発生しました');
      return {
        characterCount: 0,
        relationshipCount: 0,
        avgRelationshipStrength: 0,
        clusterCount: 0,
        isolatedCharactersCount: 0,
        relationTypeDistribution: {},
        highestClusterCohesion: 0,
        dominantRelationshipType: 'NEUTRAL'
      };
    }
  }

  // プライベートヘルパーメソッド

  /**
   * 関係性グラフを構築する
   * @private
   */
  private buildRelationshipGraph(
    relationships: Relationship[], 
    characters: any[]
  ): Map<string, Map<string, { type: RelationshipType; strength: number; }>> {
    // 関係グラフを構築
    const relationGraph = new Map<string, Map<string, { type: RelationshipType; strength: number; }>>();
    
    // すべてのキャラクターをグラフに追加
    for (const character of characters) {
      relationGraph.set(character.id, new Map());
    }
    
    // 関係性をグラフに追加
    for (const relationship of relationships) {
      let char1Id: string | undefined;
      let char2Id: string | undefined;
      
      if ('targetId' in relationship) {
        // targetIdがある場合は、すでに処理済みのrelationshipから対応するsourceIdを見つける
        for (const [id, relations] of relationGraph.entries()) {
          if (relations.has(relationship.targetId)) {
            char1Id = id;
            char2Id = relationship.targetId;
            break;
          }
        }
      } else if ('characters' in relationship && Array.isArray((relationship as any).characters)) {
        // characters配列がある場合
        const chars = (relationship as any).characters;
        if (chars.length >= 2) {
          char1Id = chars[0];
          char2Id = chars[1];
        }
      }
      
      // 両方のキャラクターが存在するか確認
      if (char1Id && char2Id && relationGraph.has(char1Id) && relationGraph.has(char2Id)) {
        // 関係性の強度とタイプを取得
        const type = relationship.type;
        const strength = relationship.strength;
        
        // 双方向に関係性を追加
        relationGraph.get(char1Id)?.set(char2Id, { type, strength });
        
        // 逆方向の関係タイプを決定
        const reverseType = this.getReverseRelationshipType(type);
        relationGraph.get(char2Id)?.set(char1Id, { type: reverseType, strength });
      }
    }
    
    return relationGraph;
  }

  /**
   * 逆方向の関係タイプを取得する
   * @private
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
      'LOVER': 'LOVER',
      'PROTECTOR': 'PROTECTED',
      'PROTECTED': 'PROTECTOR',
      'FRIEND': 'FRIEND',
      'ENEMY': 'ENEMY',
      'RIVAL': 'RIVAL',
      'COLLEAGUE': 'COLLEAGUE',
      'NEUTRAL': 'NEUTRAL'
    };

    return reverseMap[type] || 'NEUTRAL';
  }

  /**
   * クラスターを検出するアルゴリズムを実行
   * @private
   */
  private findClusters(
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
   * 対立関係の説明を生成する
   * @private
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
   * 関係性発展の説明を生成する
   * @private
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

  /**
   * ターゲットへの関係性を持つキャラクターを探す
   * @private
   */
  private async findRelationshipsWithTarget(targetId: string): Promise<Array<{characterId: string, relationship: Relationship}>> {
    const result: Array<{characterId: string, relationship: Relationship}> = [];
    
    // すべてのキャラクターを取得
    const allCharacters = await this.characterRepo.getAllCharacters();
    
    // 各キャラクターの関係性を調査
    for (const character of allCharacters) {
      if (character.relationships) {
        for (const rel of character.relationships) {
          if (rel.targetId === targetId) {
            result.push({
              characterId: character.id,
              relationship: rel
            });
          }
        }
      }
    }
    
    return result;
  }

  /**
   * 孤立したキャラクターの数を計算する
   * @private
   */
  private countIsolatedCharacters(
    characters: any[], 
    relationships: Relationship[]
  ): number {
    // 関係を持つキャラクターのセット
    const connectedCharacters = new Set<string>();
    
    // 関係性から関連キャラクターを収集
    for (const rel of relationships) {
      if ('targetId' in rel) {
        connectedCharacters.add(rel.targetId);
        // targetIdがある場合は対応するsourceIdも必要
        // この実装では完全ではないが、おおよその見積もりとして使用
      } else if ('characters' in rel && Array.isArray((rel as any).characters)) {
        for (const charId of (rel as any).characters) {
          connectedCharacters.add(charId);
        }
      }
    }
    
    // 関係を持たないキャラクターをカウント
    let isolatedCount = 0;
    for (const char of characters) {
      if (!connectedCharacters.has(char.id)) {
        isolatedCount++;
      }
    }
    
    return isolatedCount;
  }

  /**
   * 全体で最も優勢な関係タイプを取得する
   * @private
   */
  private getDominantRelationshipTypeOverall(
    typeCounts: Record<RelationshipType, number>
  ): RelationshipType {
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
}

// シングルトンインスタンスをエクスポート
export const relationshipAnalyzer = new RelationshipAnalyzer();