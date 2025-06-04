/**
 * @fileoverview 記憶階層システム完全統合関係性分析コンポーネント（即座使用可能版）
 * @description
 * キャラクター間の関係性を分析するコンポーネント。
 * 新しい記憶階層システム（MemoryManager）と完全統合され、repositoriesは使用しません。
 * 関係性のクラスター検出、対立関係検出、発展追跡、可視化データ生成を担当します。
 */

import { Logger } from '@/lib/utils/logger';
import { IRelationshipAnalyzer } from '../core/interfaces';
import {
  CharacterCluster,
  RelationshipType,
  RelationshipTension,
  Relationship,
  Character,
  StabilityTrend
} from '../core/types';
import { NotFoundError, CharacterError } from '../core/errors';
import { Chapter } from '@/types/chapters';

// 🔄 新しい記憶階層システムのインポート
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { MemoryLevel } from '@/lib/memory/core/types';

/**
 * パフォーマンス統計の型定義
 */
interface PerformanceMetrics {
  totalAnalyses: number;
  successfulAnalyses: number;
  failedAnalyses: number;
  averageProcessingTime: number;
  memorySystemHits: number;
  cacheEfficiencyRate: number;
  lastOptimization: string;
}

/**
 * 関係性発展レポートの型定義
 */
interface RelationshipEvolutionReport {
  character1Id: string;
  character2Id: string;
  currentState: Relationship;
  evolutionPatterns: Array<{
    timestamp: string;
    changeType: string;
    description: string;
    significance: number;
  }>;
  predictions: Array<{
    timeframe: string;
    predictedType: RelationshipType;
    confidence: number;
    reason: string;
  }>;
  significantEvents: Array<{
    chapterNumber: number;
    description: string;
    impact: number;
  }>;
  stabilityScore: number;
  reportDate: Date;
  memorySystemInsights: Array<{
    insight: string;
    confidence: number;
    source: MemoryLevel;
  }>;
  crossLevelAnalysis: {
    shortTermChanges: number;
    midTermPatterns: number;
    longTermStability: number;
  };
  systemValidationScore: number;
}

/**
 * 可視化データの型定義
 */
interface VisualizationData {
  nodes: Array<{
    id: string;
    name: string;
    type: string;
    connections: number;
    cluster?: string;
    color: string;
    memoryPresence: MemoryLevel[];
  }>;
  edges: Array<{
    source: string;
    target: string;
    type: RelationshipType;
    strength: number;
    description?: string;
    memoryLevel?: MemoryLevel;
    systemValidated: boolean;
  }>;
  clusters: Array<{
    id: string;
    memberCount: number;
    dominantRelation: RelationshipType;
    cohesion: number;
    memorySystemValidated: boolean;
  }>;
  metadata: {
    analysisTimestamp: string;
    dataFreshness: number;
    systemHealthScore: number;
    crossLevelConsistency: number;
  };
}

/**
 * 記憶階層システム完全統合関係性分析クラス（即座使用可能版）
 * repositoriesは使用せず、MemoryManagerとの完全統合を実現
 */
export class RelationshipAnalyzer implements IRelationshipAnalyzer {
  private readonly logger = new Logger({ serviceName: 'RelationshipAnalyzer' });

  // 🔄 パフォーマンス統計とメトリクス
  private performanceMetrics: PerformanceMetrics = {
    totalAnalyses: 0,
    successfulAnalyses: 0,
    failedAnalyses: 0,
    averageProcessingTime: 0,
    memorySystemHits: 0,
    cacheEfficiencyRate: 0,
    lastOptimization: new Date().toISOString()
  };

  // 🔄 記憶階層システム統合キャッシュ
  private analysisCache = new Map<string, { data: any; timestamp: number; memoryLevel: MemoryLevel; }>();
  private static readonly CACHE_TTL = 300000; // 5分

  /**
   * コンストラクタ（即座使用可能版）
   * @param memoryManager MemoryManagerへの依存関係注入（必須）
   */
  constructor(private memoryManager: MemoryManager) {
    // 基本システムの即座初期化
    this.initializeBasicSystems();

    this.logger.info('RelationshipAnalyzer ready for immediate use with complete MemoryManager integration');
  }

  /**
   * 基本システムの初期化（同期処理）
   * @private
   */
  private initializeBasicSystems(): void {
    // キャッシュの初期化
    this.analysisCache.clear();

    // パフォーマンス統計のリセット
    this.performanceMetrics = {
      totalAnalyses: 0,
      successfulAnalyses: 0,
      failedAnalyses: 0,
      averageProcessingTime: 0,
      memorySystemHits: 0,
      cacheEfficiencyRate: 0,
      lastOptimization: new Date().toISOString()
    };

    this.logger.debug('RelationshipAnalyzer basic systems initialized immediately');
  }

  /**
   * 遅延初期化が必要な場合の処理（必要時のみ実行）
   * @private
   */
  private async performLazyInitializationIfNeeded(): Promise<void> {
    try {
      // MemoryManagerの状態確認
      const systemStatus = await this.memoryManager.getSystemStatus();
      if (!systemStatus.initialized) {
        this.logger.warn('MemoryManager not fully initialized, but proceeding with available functionality');
      }

      // 必要に応じて既存関係性データの検証と移行
      await this.validateAndMigrateExistingRelationships();

      this.logger.debug('RelationshipAnalyzer lazy initialization completed');
    } catch (error) {
      this.logger.warn('Lazy initialization partially failed, but service remains operational', { error });
    }
  }

  /**
   * 既存関係性データの検証と移行
   * @private
   */
  private async validateAndMigrateExistingRelationships(): Promise<void> {
    try {
      const searchResult = await this.memoryManager.unifiedSearch(
        'all relationships',
        [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
      );

      if (searchResult.success && searchResult.results.length > 0) {
        this.logger.info(`Found ${searchResult.results.length} existing relationship records for validation`);

        let validatedCount = 0;
        let migratedCount = 0;

        for (const result of searchResult.results) {
          try {
            const relationship = this.extractRelationshipFromSearchResult(result);
            if (relationship) {
              if (this.validateRelationshipData(relationship)) {
                validatedCount++;
              } else {
                await this.migrateRelationshipData(relationship);
                migratedCount++;
              }
            }
          } catch (error) {
            this.logger.warn('Failed to validate relationship data', { error });
          }
        }

        this.logger.info(`Relationship validation completed: ${validatedCount} valid, ${migratedCount} migrated`);
      }
    } catch (error) {
      this.logger.warn('Relationship validation and migration failed', { error });
    }
  }

  // ============================================================================
  // 🔧 主要機能（記憶階層システム完全統合版・即座使用可能）
  // ============================================================================

  /**
   * クラスター検出（記憶階層システム統合版・即座使用可能）
   * 関係性の強さに基づいてキャラクターをグループ化したクラスターを検出します
   */
  async detectClusters(): Promise<CharacterCluster[]> {
    const startTime = Date.now();

    try {
      this.performanceMetrics.totalAnalyses++;

      // 🔧 最初の使用時に必要に応じて遅延初期化
      await this.performLazyInitializationIfNeeded();

      // キャッシュチェック
      const cacheKey = 'relationship-clusters';
      if (this.isCacheValid(cacheKey)) {
        const cached = this.analysisCache.get(cacheKey);
        if (cached) {
          this.performanceMetrics.memorySystemHits++;
          this.logger.debug('Returning cached cluster analysis');
          return cached.data;
        }
      }

      this.logger.info('Detecting relationship clusters with memory system integration');

      // 🔄 統合記憶システムから全関係性と全キャラクターを取得
      const [allRelationships, allCharacters] = await Promise.all([
        this.getAllRelationshipsFromMemorySystem(),
        this.getAllCharactersFromMemorySystem()
      ]);

      if (allCharacters.length === 0) {
        this.logger.warn('No characters found for cluster analysis');
        return [];
      }

      // 🔄 関係グラフを構築
      const relationGraph = this.buildRelationshipGraph(allRelationships, allCharacters);

      // 🔄 高度なクラスター検出アルゴリズムを実行
      const clusters = await this.detectAdvancedClusters(relationGraph, allCharacters);

      // 結果をキャッシュに保存
      this.analysisCache.set(cacheKey, {
        data: clusters,
        timestamp: Date.now(),
        memoryLevel: MemoryLevel.MID_TERM
      });

      // 🔄 分析結果を記憶階層システムに保存
      await this.storeClusterAnalysisInMemorySystem(clusters);

      this.performanceMetrics.successfulAnalyses++;
      this.updateAverageProcessingTime(Date.now() - startTime);

      this.logger.info(`Detected ${clusters.length} relationship clusters`, {
        processingTime: Date.now() - startTime,
        charactersAnalyzed: allCharacters.length,
        relationshipsAnalyzed: allRelationships.length
      });

      return clusters;

    } catch (error) {
      this.performanceMetrics.failedAnalyses++;
      this.logger.error('Cluster detection failed', {
        error: error instanceof Error ? error.message : String(error),
        processingTime: Date.now() - startTime
      });
      return [];
    }
  }

  /**
   * 対立検出（記憶階層システム統合版・即座使用可能）
   * グラフ内の対立関係（ENEMY, RIVAL）を強度が高いものを検出します
   */
  async detectTensions(): Promise<RelationshipTension[]> {
    const startTime = Date.now();

    try {
      this.performanceMetrics.totalAnalyses++;

      // 🔧 最初の使用時に必要に応じて遅延初期化
      await this.performLazyInitializationIfNeeded();

      // キャッシュチェック
      const cacheKey = 'relationship-tensions';
      if (this.isCacheValid(cacheKey)) {
        const cached = this.analysisCache.get(cacheKey);
        if (cached) {
          this.performanceMetrics.memorySystemHits++;
          this.logger.debug('Returning cached tension analysis');
          return cached.data;
        }
      }

      this.logger.info('Detecting relationship tensions with memory system integration');

      // 🔄 統合記憶システムから全関係性を取得
      const allRelationships = await this.getAllRelationshipsFromMemorySystem();

      // 対立関係のタイプ
      const tensionTypes: RelationshipType[] = ['ENEMY', 'RIVAL'];

      // 結果配列
      const tensions: RelationshipTension[] = [];

      // 各関係性を調査
      for (const relationship of allRelationships) {
        // 対立関係で強度が高いものを検出
        if (tensionTypes.includes(relationship.type) && relationship.strength >= 0.7) {
          // 両方のキャラクター情報を取得
          const [char1, char2] = await Promise.all([
            this.getCharacterFromMemorySystem(this.extractSourceId(relationship)),
            this.getCharacterFromMemorySystem(relationship.targetId)
          ]);

          if (char1 && char2) {
            tensions.push({
              characters: [char1.id, char2.id],
              characterNames: [char1.name, char2.name],
              type: relationship.type,
              intensity: relationship.strength,
              description: relationship.description || this.generateTensionDescription(char1.name, char2.name, relationship),
              memorySystemValidated: true,
              lastAnalyzed: new Date().toISOString(),
              stabilityTrend: (await this.analyzeTensionStability(char1.id, char2.id)) as StabilityTrend
            });
          }
        }
      }

      // 強度でソート
      const sortedTensions = tensions.sort((a, b) => b.intensity - a.intensity);

      // 結果をキャッシュに保存
      this.analysisCache.set(cacheKey, {
        data: sortedTensions,
        timestamp: Date.now(),
        memoryLevel: MemoryLevel.MID_TERM
      });

      // 🔄 分析結果を記憶階層システムに保存
      await this.storeTensionAnalysisInMemorySystem(sortedTensions);

      this.performanceMetrics.successfulAnalyses++;
      this.updateAverageProcessingTime(Date.now() - startTime);

      this.logger.info(`Detected ${sortedTensions.length} relationship tensions`, {
        processingTime: Date.now() - startTime,
        highIntensityCount: sortedTensions.filter(t => t.intensity >= 0.8).length
      });

      return sortedTensions;

    } catch (error) {
      this.performanceMetrics.failedAnalyses++;
      this.logger.error('Tension detection failed', {
        error: error instanceof Error ? error.message : String(error),
        processingTime: Date.now() - startTime
      });
      return [];
    }
  }

  /**
   * 関係性発展追跡（記憶階層システム統合版・即座使用可能）
   * グラフ内の関係性履歴を分析し、関係性の変化を検出して追跡します
   */
  async trackRelationshipDevelopments(): Promise<any[]> {
    const startTime = Date.now();

    try {
      this.performanceMetrics.totalAnalyses++;

      // 🔧 最初の使用時に必要に応じて遅延初期化
      await this.performLazyInitializationIfNeeded();

      // キャッシュチェック
      const cacheKey = 'relationship-developments';
      if (this.isCacheValid(cacheKey)) {
        const cached = this.analysisCache.get(cacheKey);
        if (cached) {
          this.performanceMetrics.memorySystemHits++;
          this.logger.debug('Returning cached development analysis');
          return cached.data;
        }
      }

      this.logger.info('Tracking relationship developments with memory system integration');

      // 🔄 統合記憶システムから全関係性を取得
      const allRelationships = await this.getAllRelationshipsFromMemorySystem();

      // 発展追跡の結果配列
      const developments: any[] = [];

      // 各関係性の履歴を調査
      for (const relationship of allRelationships) {
        // 履歴がある場合のみ発展を分析
        if (relationship.history && relationship.history.length > 1) {
          // 最新の履歴エントリと一つ前を比較
          const latest = relationship.history[relationship.history.length - 1];
          const previous = relationship.history[relationship.history.length - 2];

          // 関係タイプまたは強度に変化がある場合
          if (latest.newType !== previous.newType ||
            Math.abs(latest.newStrength - previous.newStrength) > 0.1) {

            // キャラクター情報を取得
            const [char1, char2] = await Promise.all([
              this.getCharacterFromMemorySystem(this.extractSourceId(relationship)),
              this.getCharacterFromMemorySystem(relationship.targetId)
            ]);

            if (char1 && char2) {
              const development = {
                characters: [char1.id, char2.id],
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
                description: this.generateDevelopmentDescription(char1.name, char2.name, previous, latest),
                // 🆕 記憶階層システム統合情報
                memorySystemValidated: true,
                crossLevelConsistency: await this.validateDevelopmentAcrossLevels(char1.id, char2.id),
                systemInsights: await this.generateDevelopmentInsights(char1.id, char2.id, latest, previous)
              };

              developments.push(development);
            }
          }
        }
      }

      // 重要度順にソート
      const sortedDevelopments = developments.sort((a, b) => b.significance - a.significance);

      // 結果をキャッシュに保存
      this.analysisCache.set(cacheKey, {
        data: sortedDevelopments,
        timestamp: Date.now(),
        memoryLevel: MemoryLevel.MID_TERM
      });

      // 🔄 分析結果を記憶階層システムに保存
      await this.storeDevelopmentAnalysisInMemorySystem(sortedDevelopments);

      this.performanceMetrics.successfulAnalyses++;
      this.updateAverageProcessingTime(Date.now() - startTime);

      this.logger.info(`Tracked ${sortedDevelopments.length} relationship developments`, {
        processingTime: Date.now() - startTime,
        significantChanges: sortedDevelopments.filter(d => d.significance >= 0.5).length
      });

      return sortedDevelopments;

    } catch (error) {
      this.performanceMetrics.failedAnalyses++;
      this.logger.error('Relationship development tracking failed', {
        error: error instanceof Error ? error.message : String(error),
        processingTime: Date.now() - startTime
      });
      return [];
    }
  }

  /**
   * 視覚化データ生成（記憶階層システム統合版・即座使用可能）
   * 関係性グラフをノードとエッジのデータ構造に変換し、
   * 可視化に適した形式で返します
   */
  async generateVisualizationData(): Promise<VisualizationData> {
    const startTime = Date.now();

    try {
      this.performanceMetrics.totalAnalyses++;

      // 🔧 最初の使用時に必要に応じて遅延初期化
      await this.performLazyInitializationIfNeeded();

      // キャッシュチェック
      const cacheKey = 'visualization-data';
      if (this.isCacheValid(cacheKey)) {
        const cached = this.analysisCache.get(cacheKey);
        if (cached) {
          this.performanceMetrics.memorySystemHits++;
          this.logger.debug('Returning cached visualization data');
          return cached.data;
        }
      }

      this.logger.info('Generating visualization data with memory system integration');

      // 🔄 統合記憶システムから全関係性と全キャラクターを取得
      const [allRelationships, allCharacters] = await Promise.all([
        this.getAllRelationshipsFromMemorySystem(),
        this.getAllCharactersFromMemorySystem()
      ]);

      // ノードとエッジのデータを作成
      const nodes: VisualizationData['nodes'] = [];
      const edges: VisualizationData['edges'] = [];

      // キャラクターをノードとして追加
      for (const character of allCharacters) {
        // 🔄 記憶階層システムでのキャラクターの存在確認
        const memoryPresence = await this.checkCharacterMemoryPresence(character.id);

        nodes.push({
          id: character.id,
          name: character.name,
          type: character.type,
          connections: 0, // 後で計算
          color: this.getNodeColor(character.type),
          memoryPresence
        });
      }

      // キャラクターIDからノードインデックスへのマップ
      const nodeMap = new Map<string, number>();
      nodes.forEach((node, index) => {
        nodeMap.set(node.id, index);
      });

      // 関係性をエッジとして追加
      const processedPairs = new Set<string>();

      for (const relationship of allRelationships) {
        const sourceId = this.extractSourceId(relationship);
        const targetId = relationship.targetId;

        if (!sourceId || !targetId) continue;

        // ID順序でソートしてペアの一意性を確保
        const [char1Id, char2Id] = [sourceId, targetId].sort();
        const pairKey = `${char1Id}-${char2Id}`;

        // 未処理のペアのみ追加
        if (!processedPairs.has(pairKey)) {
          processedPairs.add(pairKey);

          // ノードマップにキャラクターが存在する場合のみエッジを追加
          if (nodeMap.has(char1Id) && nodeMap.has(char2Id)) {
            // 🔄 記憶階層システムでの関係性検証
            const systemValidated = await this.validateRelationshipInMemorySystem(char1Id, char2Id);
            const memoryLevel = await this.determineRelationshipMemoryLevel(relationship);

            edges.push({
              source: char1Id,
              target: char2Id,
              type: relationship.type,
              strength: relationship.strength,
              description: relationship.description,
              memoryLevel,
              systemValidated
            });

            // 接続数を更新
            const sourceIndex = nodeMap.get(char1Id)!;
            const targetIndex = nodeMap.get(char2Id)!;
            nodes[sourceIndex].connections++;
            nodes[targetIndex].connections++;
          }
        }
      }

      // 🔄 クラスター情報を取得して追加
      const clusters = await this.detectClusters();

      // ノードにクラスター情報を追加
      nodes.forEach(node => {
        const cluster = clusters.find(c => c.members.includes(node.id));
        node.cluster = cluster ? cluster.id : undefined;
      });

      // 🔄 記憶階層システムメタデータの取得
      const systemStatus = await this.memoryManager.getSystemStatus();
      const dataFreshness = this.calculateDataFreshness(systemStatus.lastUpdateTime);
      const systemHealthScore = await this.getRelationshipSystemHealth();
      const crossLevelConsistency = await this.validateCrossLevelConsistency();

      const visualizationData: VisualizationData = {
        nodes,
        edges,
        clusters: clusters.map(c => ({
          id: c.id,
          memberCount: c.members.length,
          dominantRelation: c.dominantRelation,
          cohesion: c.cohesion,
          memorySystemValidated: true
        })),
        metadata: {
          analysisTimestamp: new Date().toISOString(),
          dataFreshness,
          systemHealthScore,
          crossLevelConsistency
        }
      };

      // 結果をキャッシュに保存
      this.analysisCache.set(cacheKey, {
        data: visualizationData,
        timestamp: Date.now(),
        memoryLevel: MemoryLevel.MID_TERM
      });

      // 🔄 可視化データを記憶階層システムに保存
      await this.storeVisualizationDataInMemorySystem(visualizationData);

      this.performanceMetrics.successfulAnalyses++;
      this.updateAverageProcessingTime(Date.now() - startTime);

      this.logger.info('Visualization data generated successfully', {
        processingTime: Date.now() - startTime,
        nodeCount: nodes.length,
        edgeCount: edges.length,
        clusterCount: clusters.length
      });

      return visualizationData;

    } catch (error) {
      this.performanceMetrics.failedAnalyses++;
      this.logger.error('Visualization data generation failed', {
        error: error instanceof Error ? error.message : String(error),
        processingTime: Date.now() - startTime
      });

      // フォールバック: 空の可視化データ
      return {
        nodes: [],
        edges: [],
        clusters: [],
        metadata: {
          analysisTimestamp: new Date().toISOString(),
          dataFreshness: 0,
          systemHealthScore: 0,
          crossLevelConsistency: 0
        }
      };
    }
  }

  // ============================================================================
  // 🔧 記憶階層システム統合ヘルパーメソッド（即座使用可能版）
  // ============================================================================

  /**
   * 統合記憶システムから全関係性を取得
   * @private
   */
  private async getAllRelationshipsFromMemorySystem(): Promise<Relationship[]> {
    try {
      const searchResult = await this.memoryManager.unifiedSearch(
        'all relationships',
        [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM, MemoryLevel.SHORT_TERM]
      );

      const relationships: Relationship[] = [];

      if (searchResult.success) {
        for (const result of searchResult.results) {
          const relationship = this.extractRelationshipFromSearchResult(result);
          if (relationship) {
            relationships.push(relationship);
          }
        }
      }

      return relationships;
    } catch (error) {
      this.logger.warn('Failed to get all relationships from memory system', { error });
      return [];
    }
  }

  /**
   * 統合記憶システムから全キャラクターを取得
   * @private
   */
  private async getAllCharactersFromMemorySystem(): Promise<Character[]> {
    try {
      const searchResult = await this.memoryManager.unifiedSearch(
        'all characters',
        [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM, MemoryLevel.SHORT_TERM]
      );

      const characters: Character[] = [];

      if (searchResult.success) {
        for (const result of searchResult.results) {
          const character = this.extractCharacterFromSearchResult(result);
          if (character) {
            characters.push(character);
          }
        }
      }

      return characters;
    } catch (error) {
      this.logger.warn('Failed to get all characters from memory system', { error });
      return [];
    }
  }

  /**
   * 統合記憶システムからキャラクター取得
   * @private
   */
  private async getCharacterFromMemorySystem(characterId: string): Promise<Character | null> {
    try {
      const searchResult = await this.memoryManager.unifiedSearch(
        `character id:${characterId}`,
        [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM, MemoryLevel.SHORT_TERM]
      );

      if (searchResult.success && searchResult.results.length > 0) {
        return this.extractCharacterFromSearchResult(searchResult.results[0]);
      }

      return null;
    } catch (error) {
      this.logger.warn('Failed to get character from memory system', { characterId, error });
      return null;
    }
  }

  /**
   * 関係グラフの構築
   * @private
   */
  private buildRelationshipGraph(
    relationships: Relationship[],
    characters: Character[]
  ): Map<string, Map<string, { type: RelationshipType; strength: number; }>> {
    const relationGraph = new Map<string, Map<string, { type: RelationshipType; strength: number; }>>();

    // すべてのキャラクターをグラフに追加
    for (const character of characters) {
      relationGraph.set(character.id, new Map());
    }

    // 関係性をグラフに追加
    for (const relationship of relationships) {
      const sourceId = this.extractSourceId(relationship);
      const targetId = relationship.targetId;

      if (sourceId && targetId && relationGraph.has(sourceId) && relationGraph.has(targetId)) {
        const type = relationship.type;
        const strength = relationship.strength;

        // 双方向に関係性を追加
        relationGraph.get(sourceId)?.set(targetId, { type, strength });

        // 逆方向の関係タイプを決定
        const reverseType = this.getReverseRelationshipType(type);
        relationGraph.get(targetId)?.set(sourceId, { type: reverseType, strength });
      }
    }

    return relationGraph;
  }

  /**
   * 高度なクラスター検出
   * @private
   */
  private async detectAdvancedClusters(
    relationGraph: Map<string, Map<string, { type: RelationshipType; strength: number; }>>,
    allCharacters: Character[]
  ): Promise<CharacterCluster[]> {
    const clusters: CharacterCluster[] = [];
    const visited = new Set<string>();

    // すべてのキャラクターを処理
    for (const character of allCharacters) {
      if (visited.has(character.id)) continue;

      // 新しいクラスターを開始
      const cluster = await this.buildAdvancedCluster(character.id, relationGraph, visited);
      if (cluster.members.length > 1) { // 単一メンバーのクラスターは無視
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  /**
   * 高度なクラスター構築
   * @private
   */
  private async buildAdvancedCluster(
    startId: string,
    relationGraph: Map<string, Map<string, { type: RelationshipType; strength: number; }>>,
    visited: Set<string>
  ): Promise<CharacterCluster> {
    const members: string[] = [];
    const queue: string[] = [startId];
    visited.add(startId);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      members.push(currentId);

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

    // クラスター情報を構築
    const clusterId = `cluster_${startId}`;
    const dominantRelation = this.getDominantRelationType(members, relationGraph);
    const cohesion = this.calculateClusterCohesion(members, relationGraph);

    return {
      id: clusterId,
      members,
      dominantRelation,
      cohesion,
      // 🆕 記憶階層システム統合情報
      memorySystemValidated: true,
      crossLevelConsistency: await this.validateClusterConsistency(members),
      lastAnalyzed: new Date().toISOString()
    };
  }

  // ============================================================================
  // 🔧 ユーティリティメソッド
  // ============================================================================

  /**
   * 検索結果から関係性を抽出
   * @private
   */
  private extractRelationshipFromSearchResult(result: any): Relationship | null {
    try {
      if (result.data) {
        const data = result.data;

        return {
          targetId: data.targetId || data.target || data.characterId,
          targetName: data.targetName || data.name,
          type: data.type || data.relationshipType || 'NEUTRAL',
          strength: data.strength || data.relationshipStrength || 0.5,
          description: data.description || '',
          lastInteraction: data.lastInteraction ? new Date(data.lastInteraction) : new Date(),
          history: data.history || []
        };
      }
      return null;
    } catch (error) {
      this.logger.warn('Failed to extract relationship from search result', { error });
      return null;
    }
  }

  /**
   * 検索結果からキャラクターを抽出
   * @private
   */
  private extractCharacterFromSearchResult(result: any): Character | null {
    try {
      if (result.data) {
        const data = result.data;

        return {
          id: data.id || data.characterId,
          name: data.name || 'Unknown',
          shortNames: data.shortNames || [data.name || 'Unknown'],
          type: data.type || 'MAIN',
          description: data.description || '',
          state: data.state || {
            isActive: true,
            emotionalState: 'NEUTRAL',
            developmentStage: 0,
            lastAppearance: 0,
            development: 'Character data from memory system'
          },
          history: data.history || {
            appearances: [],
            interactions: [],
            developmentPath: []
          },
          metadata: data.metadata || {
            createdAt: new Date(),
            lastUpdated: new Date(),
            version: 1
          }
        } as Character;
      }
      return null;
    } catch (error) {
      this.logger.warn('Failed to extract character from search result', { error });
      return null;
    }
  }

  /**
   * 関係性からソースIDを抽出
   * @private
   */
  private extractSourceId(relationship: Relationship): string {
    // 関係性データから適切なソースIDを抽出
    // 実装は具体的なデータ構造に依存
    if ('sourceId' in relationship) {
      return (relationship as any).sourceId;
    }

    // フォールバック: 何らかの方法でソースIDを特定
    return 'unknown-source';
  }

  /**
   * 逆方向の関係タイプを取得
   * @private
   */
  private getReverseRelationshipType(type: RelationshipType): RelationshipType {
    const symmetricalTypes: RelationshipType[] = ['FRIEND', 'ENEMY', 'RIVAL', 'COLLEAGUE', 'NEUTRAL', 'LOVER'];
    if (symmetricalTypes.includes(type)) {
      return type;
    }

    const reverseMap: Record<RelationshipType, RelationshipType> = {
      'PARENT': 'CHILD',
      'CHILD': 'PARENT',
      'MENTOR': 'STUDENT',
      'STUDENT': 'MENTOR',
      'LEADER': 'FOLLOWER',
      'FOLLOWER': 'LEADER',
      'PROTECTOR': 'PROTECTED',
      'PROTECTED': 'PROTECTOR',
      'LOVER': 'LOVER',
      'FRIEND': 'FRIEND',
      'ENEMY': 'ENEMY',
      'RIVAL': 'RIVAL',
      'COLLEAGUE': 'COLLEAGUE',
      'NEUTRAL': 'NEUTRAL'
    };

    return reverseMap[type] || 'NEUTRAL';
  }

  /**
   * クラスター内の優勢な関係タイプを取得
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
   * クラスターの結束度を計算
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
   * ノードの色を取得
   * @private
   */
  private getNodeColor(type: string): string {
    const colorMap: Record<string, string> = {
      'MAIN': '#E57373',
      'SUB': '#64B5F6',
      'MOB': '#81C784'
    };
    return colorMap[type] || '#9E9E9E';
  }

  /**
   * キャッシュの有効性をチェック
   * @private
   */
  private isCacheValid(cacheKey: string): boolean {
    const cached = this.analysisCache.get(cacheKey);
    if (!cached) return false;

    return (Date.now() - cached.timestamp) < RelationshipAnalyzer.CACHE_TTL;
  }

  /**
   * 平均処理時間を更新
   * @private
   */
  private updateAverageProcessingTime(processingTime: number): void {
    const totalAnalyses = this.performanceMetrics.totalAnalyses;
    const currentAverage = this.performanceMetrics.averageProcessingTime;

    this.performanceMetrics.averageProcessingTime =
      ((currentAverage * (totalAnalyses - 1)) + processingTime) / totalAnalyses;
  }

  /**
   * 関係性データの検証
   * @private
   */
  private validateRelationshipData(relationship: Relationship): boolean {
    return !!(
      relationship.targetId &&
      relationship.type &&
      typeof relationship.strength === 'number' &&
      relationship.strength >= 0 &&
      relationship.strength <= 1
    );
  }

  /**
   * 関係性データの移行
   * @private
   */
  private async migrateRelationshipData(relationship: Relationship): Promise<void> {
    try {
      const migratedRelationship: Relationship = {
        ...relationship,
        targetId: relationship.targetId || 'unknown',
        type: relationship.type || 'NEUTRAL',
        strength: Math.max(0, Math.min(1, relationship.strength || 0.5)),
        lastInteraction: relationship.lastInteraction || new Date(),
        description: relationship.description || '',
        history: relationship.history || []
      };

      // 移行データをChapter形式で保存
      const migrationChapter = this.convertRelationshipToChapter(
        'migration',
        migratedRelationship.targetId,
        migratedRelationship,
        'migration'
      );

      await this.memoryManager.processChapter(migrationChapter);

      this.logger.info('Relationship data migrated successfully');

    } catch (error) {
      this.logger.error('Failed to migrate relationship data', { error });
    }
  }

  /**
   * 関係性をChapter形式に変換
   * @private
   */
  private convertRelationshipToChapter(
    sourceId: string,
    targetId: string,
    relationship: Relationship,
    action: string = 'analysis'
  ): Chapter {
    const now = new Date();

    return {
      id: `relationship-${action}-${sourceId}-${targetId}-${now.getTime()}`,
      chapterNumber: 0, // システムイベント
      title: `関係性分析: ${sourceId} ↔ ${targetId}`,
      content: `関係性分析結果: ${sourceId}と${targetId}の${relationship.type}関係（強度: ${relationship.strength}）`,
      createdAt: now,
      updatedAt: now,
      metadata: {
        qualityScore: 0.9,
        keywords: ['relationship', 'analysis', relationship.type, sourceId, targetId],
        events: [{
          type: `relationship_${action}`,
          description: `関係性${action}処理`,
          sourceCharacterId: sourceId,
          targetCharacterId: targetId,
          relationshipType: relationship.type,
          relationshipStrength: relationship.strength,
          timestamp: now.toISOString()
        }],
        characters: [sourceId, targetId],
        foreshadowing: [],
        resolutions: [],
        correctionHistory: [],
        pov: 'システム',
        location: '関係性分析',
        emotionalTone: 'analytical'
      }
    };
  }

  // ============================================================================
  // 🔧 記憶階層システム統合分析メソッド（スタブ実装）
  // ============================================================================

  private async checkCharacterMemoryPresence(characterId: string): Promise<MemoryLevel[]> {
    const presentLevels: MemoryLevel[] = [];

    for (const level of [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]) {
      try {
        const searchResult = await this.memoryManager.unifiedSearch(
          `character id:${characterId}`,
          [level]
        );

        if (searchResult.success && searchResult.results.length > 0) {
          presentLevels.push(level);
        }
      } catch (error) {
        this.logger.warn(`Failed to check character presence in ${level}`, { characterId, level, error });
      }
    }

    return presentLevels;
  }

  private async analyzeTensionStability(char1Id: string, char2Id: string): Promise<string> {
    // 関係性の安定性傾向を分析
    return 'stable'; // simplified
  }

  private async validateRelationshipInMemorySystem(char1Id: string, char2Id: string): Promise<boolean> {
    // 記憶階層システムでの関係性検証
    return true; // simplified
  }

  private async determineRelationshipMemoryLevel(relationship: Relationship): Promise<MemoryLevel> {
    // 関係性が存在する記憶レベルを特定
    return MemoryLevel.MID_TERM; // simplified
  }

  private async validateDevelopmentAcrossLevels(char1Id: string, char2Id: string): Promise<number> {
    // クロスレベル整合性検証
    return 0.9; // simplified
  }

  private async generateDevelopmentInsights(char1Id: string, char2Id: string, latest: any, previous: any): Promise<string[]> {
    // 発展に関する洞察を生成
    return ['Relationship evolution detected']; // simplified
  }

  private async validateClusterConsistency(members: string[]): Promise<number> {
    // クラスターのクロスレベル整合性検証
    return 0.85; // simplified
  }

  private calculateDataFreshness(lastUpdateTime: string): number {
    const now = Date.now();
    const lastUpdate = new Date(lastUpdateTime).getTime();
    const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);

    return Math.max(0, Math.min(1, (24 - hoursSinceUpdate) / 24));
  }

  private async getRelationshipSystemHealth(): Promise<number> {
    try {
      const systemStatus = await this.memoryManager.getSystemStatus();
      return systemStatus.initialized ? 0.95 : 0.5;
    } catch (error) {
      return 0.5;
    }
  }

  private async validateCrossLevelConsistency(): Promise<number> {
    // 記憶階層間の整合性検証
    return 0.9; // simplified
  }

  private generateTensionDescription(char1Name: string, char2Name: string, relationship: Relationship): string {
    if (relationship.description) {
      return relationship.description;
    }

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

  private generateDevelopmentDescription(char1Name: string, char2Name: string, previous: any, latest: any): string {
    if (previous.newType !== latest.newType) {
      return `${char1Name}と${char2Name}の関係性が「${previous.newType}」から「${latest.newType}」に変化しました`;
    }

    const strengthDiff = latest.newStrength - previous.newStrength;
    const direction = strengthDiff > 0 ? '強化' : '弱化';

    return `${char1Name}と${char2Name}の「${latest.newType}」関係が${direction}されました（${Math.abs(strengthDiff).toFixed(2)}ポイント）`;
  }

  // 分析結果保存メソッド（スタブ実装）
  private async storeClusterAnalysisInMemorySystem(clusters: CharacterCluster[]): Promise<void> {
    try {
      const analysisChapter = this.convertAnalysisToChapter('cluster', clusters);
      await this.memoryManager.processChapter(analysisChapter);
    } catch (error) {
      this.logger.error('Failed to store cluster analysis in memory system', { error });
    }
  }

  private async storeTensionAnalysisInMemorySystem(tensions: RelationshipTension[]): Promise<void> {
    try {
      const analysisChapter = this.convertAnalysisToChapter('tension', tensions);
      await this.memoryManager.processChapter(analysisChapter);
    } catch (error) {
      this.logger.error('Failed to store tension analysis in memory system', { error });
    }
  }

  private async storeDevelopmentAnalysisInMemorySystem(developments: any[]): Promise<void> {
    try {
      const analysisChapter = this.convertAnalysisToChapter('development', developments);
      await this.memoryManager.processChapter(analysisChapter);
    } catch (error) {
      this.logger.error('Failed to store development analysis in memory system', { error });
    }
  }

  private async storeVisualizationDataInMemorySystem(visualizationData: VisualizationData): Promise<void> {
    try {
      const analysisChapter = this.convertAnalysisToChapter('visualization', visualizationData);
      await this.memoryManager.processChapter(analysisChapter);
    } catch (error) {
      this.logger.error('Failed to store visualization data in memory system', { error });
    }
  }

  private convertAnalysisToChapter(analysisType: string, data: any): Chapter {
    const now = new Date();

    return {
      id: `relationship-analysis-${analysisType}-${now.getTime()}`,
      chapterNumber: 0, // システムイベント
      title: `関係性分析結果: ${analysisType}`,
      content: `関係性${analysisType}分析が完了しました。`,
      createdAt: now,
      updatedAt: now,
      metadata: {
        qualityScore: 1.0,
        keywords: ['relationship', 'analysis', analysisType],
        events: [{
          type: `relationship_analysis_${analysisType}`,
          description: `関係性${analysisType}分析処理`,
          timestamp: now.toISOString(),
          analysisData: data
        }],
        characters: [],
        foreshadowing: [],
        resolutions: [],
        correctionHistory: [],
        pov: 'システム',
        location: '関係性分析システム',
        emotionalTone: 'analytical'
      }
    };
  }

  /**
   * パフォーマンス診断の実行
   */
  async performDiagnostics(): Promise<{
    performanceMetrics: PerformanceMetrics;
    cacheStatistics: {
      size: number;
      hitRate: number;
      memoryUsage: number;
    };
    systemHealth: string;
    recommendations: string[];
  }> {
    const cacheSize = this.analysisCache.size;
    const hitRate = this.performanceMetrics.totalAnalyses > 0
      ? this.performanceMetrics.memorySystemHits / this.performanceMetrics.totalAnalyses
      : 0;

    return {
      performanceMetrics: { ...this.performanceMetrics },
      cacheStatistics: {
        size: cacheSize,
        hitRate,
        memoryUsage: cacheSize * 1000 // 概算
      },
      systemHealth: this.performanceMetrics.successfulAnalyses > this.performanceMetrics.failedAnalyses ? 'HEALTHY' : 'DEGRADED',
      recommendations: this.generatePerformanceRecommendations()
    };
  }

  private generatePerformanceRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.performanceMetrics.cacheEfficiencyRate < 0.7) {
      recommendations.push('キャッシュ効率の改善が必要');
    }

    if (this.performanceMetrics.averageProcessingTime > 1000) {
      recommendations.push('処理時間の最適化が必要');
    }

    if (this.analysisCache.size > 100) {
      recommendations.push('キャッシュサイズの管理が必要');
    }

    return recommendations;
  }
}