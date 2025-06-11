/**
 * Version 2.0 - Memory Collector
 * 
 * 記憶階層システムからの関連データ収集
 */

import { OperationResult } from '@/types/common';
import { IMemoryManager, MemoryData, SearchQuery, SearchResult, MemoryLevel } from '@/systems/memory/interfaces';
import { MemoryManager } from '@/systems/memory/core/memory-manager';
import { DataCoordinator } from '../core/data-coordinator';
import { SystemType } from '../types';

export interface IMemoryCollector {
  /**
   * 章生成に関連する記憶データを収集
   */
  collectRelevantMemories(chapterNumber: number, context: MemoryCollectionContext): Promise<OperationResult<CollectedMemoryData>>;
  
  /**
   * 特定の記憶レベルからデータを収集
   */
  collectFromLevel(level: MemoryLevel, query: SearchQuery): Promise<OperationResult<SearchResult[]>>;
  
  /**
   * キーワードベースでの記憶検索
   */
  searchMemoriesByKeywords(keywords: string[], options?: SearchOptions): Promise<OperationResult<SearchResult[]>>;
  
  /**
   * 時系列での記憶データ収集
   */
  collectTimelineMemories(timeRange: TimeRange, chapterNumber: number): Promise<OperationResult<TimelineMemoryData[]>>;
  
  /**
   * 重要度の高い記憶データを優先収集
   */
  collectHighPriorityMemories(chapterNumber: number, minImportance: number): Promise<OperationResult<PrioritizedMemoryData[]>>;
}

export interface MemoryCollectionContext {
  chapterNumber: number;
  themes: string[];
  characters: string[];
  locations: string[];
  concepts: string[];
  maxDataSize?: number;
  timeFrame?: TimeRange;
  priorityLevel?: 'low' | 'medium' | 'high';
}

export interface CollectedMemoryData {
  shortTermMemories: SearchResult[];
  midTermMemories: SearchResult[];
  longTermMemories: SearchResult[];
  totalRelevanceScore: number;
  collectionMetadata: {
    searchQueries: SearchQuery[];
    processingTime: number;
    dataPoints: number;
    coverageScore: number;
  };
}

export interface SearchOptions {
  includeShortTerm?: boolean;
  includeMidTerm?: boolean;
  includeLongTerm?: boolean;
  maxResults?: number;
  minRelevance?: number;
  sortBy?: 'relevance' | 'importance' | 'timestamp';
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface TimelineMemoryData {
  memory: MemoryData;
  relevanceScore: number;
  temporalPosition: number;
  contextualImportance: number;
}

export interface PrioritizedMemoryData {
  memory: MemoryData;
  priorityScore: number;
  relevanceFactors: string[];
  chapterRelevance: number;
}

export class MemoryCollector implements IMemoryCollector {
  private memoryManager: IMemoryManager;
  private dataCoordinator: DataCoordinator;
  private logger: any;

  constructor(memoryManager?: IMemoryManager, dataCoordinator?: DataCoordinator, logger?: any) {
    // Data Coordinator経由で実際のMemoryManagerを取得
    this.dataCoordinator = dataCoordinator || new DataCoordinator();
    
    if (memoryManager) {
      this.memoryManager = memoryManager;
    } else {
      // Data Coordinatorから実際のMemoryManagerを取得
      const memoryConnection = this.dataCoordinator.getSystemConnections()
        .find(conn => conn.systemType === SystemType.MEMORY);
      
      if (memoryConnection?.isConnected) {
        this.memoryManager = memoryConnection.manager as IMemoryManager;
        this.logger?.info('Using real MemoryManager from DataCoordinator');
      } else {
        // フォールバック: 直接MemoryManagerインスタンスを作成
        const { ShortTermMemory } = require('@/systems/memory/short-term/short-term-memory');
        const { MidTermMemory } = require('@/systems/memory/mid-term/mid-term-memory');
        const { LongTermMemory } = require('@/systems/memory/long-term/long-term-memory');
        
        this.memoryManager = new MemoryManager(
          new ShortTermMemory(),
          new MidTermMemory(),
          new LongTermMemory()
        );
        this.logger?.warn('Creating new MemoryManager instance as fallback');
      }
    }
    
    this.logger = logger || console;
  }

  // ============================================================================
  // パブリックメソッド
  // ============================================================================

  async collectRelevantMemories(
    chapterNumber: number,
    context: MemoryCollectionContext
  ): Promise<OperationResult<CollectedMemoryData>> {
    const startTime = Date.now();
    
    try {
      this.logger.info(`Starting memory collection for chapter ${chapterNumber}`, { context });

      // フェーズ1: 検索クエリの生成
      const searchQueries = this.generateSearchQueries(context);
      this.logger.debug(`Generated ${searchQueries.length} search queries`);

      // フェーズ2: 各記憶レベルからのデータ収集
      // Data Coordinator経由で最適化されたクエリ実行
      const [shortTermResult, midTermResult, longTermResult] = await Promise.all([
        this.collectFromLevel(MemoryLevel.SHORT_TERM, searchQueries[0]),
        this.collectFromLevel(MemoryLevel.MID_TERM, searchQueries[1]),
        this.collectFromLevel(MemoryLevel.LONG_TERM, searchQueries[2])
      ]);

      this.logger.debug('Data Coordinator integration successful', {
        dataCoordinatorHealth: await this.dataCoordinator.healthCheck(),
        memorySystemStatus: this.dataCoordinator.getSystemConnections()
          .find(conn => conn.systemType === SystemType.MEMORY)
      });

      if (!shortTermResult.success || !midTermResult.success || !longTermResult.success) {
        throw new Error('Failed to collect memories from one or more levels');
      }

      // フェーズ3: 関連性スコアの計算
      const totalRelevanceScore = this.calculateTotalRelevance(
        shortTermResult.data!,
        midTermResult.data!,
        longTermResult.data!
      );

      // フェーズ4: 収集メタデータの生成
      const processingTime = Date.now() - startTime;
      const dataPoints = shortTermResult.data!.length + midTermResult.data!.length + longTermResult.data!.length;
      const coverageScore = this.calculateCoverageScore(context, dataPoints);

      const collectedData: CollectedMemoryData = {
        shortTermMemories: shortTermResult.data!,
        midTermMemories: midTermResult.data!,
        longTermMemories: longTermResult.data!,
        totalRelevanceScore,
        collectionMetadata: {
          searchQueries,
          processingTime,
          dataPoints,
          coverageScore
        }
      };

      this.logger.info(`Memory collection completed`, {
        chapterNumber,
        dataPoints,
        processingTime: `${processingTime}ms`,
        totalRelevanceScore,
        coverageScore
      });

      return {
        success: true,
        data: collectedData,
        metadata: {
          operationId: `memory-collection-${chapterNumber}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'memory-collector'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('Memory collection failed', { chapterNumber, error, processingTime });

      return {
        success: false,
        error: {
          code: 'MEMORY_COLLECTION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown memory collection error',
          details: error
        },
        metadata: {
          operationId: `memory-collection-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'memory-collector'
        }
      };
    }
  }

  async collectFromLevel(
    level: MemoryLevel,
    query: SearchQuery
  ): Promise<OperationResult<SearchResult[]>> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Collecting from ${level}`, { query });

      // 記憶レベル特有のクエリ調整
      const adjustedQuery = this.adjustQueryForLevel(query, level);

      // Data Coordinator経由での記憶検索の実行（実システム統合）
      this.logger.debug(`Executing unified search via real MemoryManager for ${level}`, { adjustedQuery });
      const searchResult = await this.memoryManager.searchUnified(adjustedQuery);
      
      if (!searchResult.success) {
        throw new Error(`Memory search failed for level ${level}: ${searchResult.error?.message}`);
      }

      const processingTime = Date.now() - startTime;

      this.logger.debug(`Collected ${searchResult.data!.length} memories from ${level}`, {
        processingTime: `${processingTime}ms`
      });

      return {
        success: true,
        data: searchResult.data!,
        metadata: {
          operationId: `level-collection-${level}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'memory-collector'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error(`Level collection failed for ${level}`, { error, processingTime });

      return {
        success: false,
        error: {
          code: 'LEVEL_COLLECTION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown level collection error',
          details: error
        },
        metadata: {
          operationId: `level-collection-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'memory-collector'
        }
      };
    }
  }

  async searchMemoriesByKeywords(
    keywords: string[],
    options: SearchOptions = {}
  ): Promise<OperationResult<SearchResult[]>> {
    const startTime = Date.now();
    
    try {
      this.logger.debug('Searching memories by keywords', { keywords, options });

      // デフォルトオプションの設定
      const searchOptions = {
        includeShortTerm: options.includeShortTerm ?? true,
        includeMidTerm: options.includeMidTerm ?? true,
        includeLongTerm: options.includeLongTerm ?? true,
        maxResults: options.maxResults ?? 50,
        minRelevance: options.minRelevance ?? 0.1,
        sortBy: options.sortBy ?? 'relevance'
      };

      // 検索レベルの決定
      const searchLevels: MemoryLevel[] = [];
      if (searchOptions.includeShortTerm) searchLevels.push(MemoryLevel.SHORT_TERM);
      if (searchOptions.includeMidTerm) searchLevels.push(MemoryLevel.MID_TERM);
      if (searchOptions.includeLongTerm) searchLevels.push(MemoryLevel.LONG_TERM);

      // 検索クエリの構築
      const searchQuery: SearchQuery = {
        keywords,
        levels: searchLevels,
        limit: searchOptions.maxResults
      };

      // 記憶検索の実行
      const searchResult = await this.memoryManager.searchUnified(searchQuery);
      
      if (!searchResult.success) {
        throw new Error(`Keyword search failed: ${searchResult.error?.message}`);
      }

      // 関連性フィルタリング
      const filteredResults = searchResult.data!.filter(
        result => result.relevanceScore >= searchOptions.minRelevance
      );

      // ソート処理
      const sortedResults = this.sortSearchResults(filteredResults, searchOptions.sortBy);

      const processingTime = Date.now() - startTime;

      this.logger.debug(`Found ${sortedResults.length} relevant memories`, {
        originalCount: searchResult.data!.length,
        filteredCount: sortedResults.length,
        processingTime: `${processingTime}ms`
      });

      return {
        success: true,
        data: sortedResults,
        metadata: {
          operationId: `keyword-search-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'memory-collector'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('Keyword search failed', { keywords, error, processingTime });

      return {
        success: false,
        error: {
          code: 'KEYWORD_SEARCH_FAILED',
          message: error instanceof Error ? error.message : 'Unknown keyword search error',
          details: error
        },
        metadata: {
          operationId: `keyword-search-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'memory-collector'
        }
      };
    }
  }

  async collectTimelineMemories(
    timeRange: TimeRange,
    chapterNumber: number
  ): Promise<OperationResult<TimelineMemoryData[]>> {
    const startTime = Date.now();
    
    try {
      this.logger.debug('Collecting timeline memories', { timeRange, chapterNumber });

      // 時系列検索クエリの構築
      const timelineQuery: SearchQuery = {
        timeRange,
        levels: [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM],
        limit: 100
      };

      // 時系列記憶の検索
      const searchResult = await this.memoryManager.searchUnified(timelineQuery);
      
      if (!searchResult.success) {
        throw new Error(`Timeline search failed: ${searchResult.error?.message}`);
      }

      // TimelineMemoryDataへの変換
      const timelineData: TimelineMemoryData[] = searchResult.data!.map((result, index) => {
        const temporalPosition = this.calculateTemporalPosition(result.data, timeRange);
        const contextualImportance = this.calculateContextualImportance(result.data, chapterNumber);

        return {
          memory: result.data,
          relevanceScore: result.relevanceScore,
          temporalPosition,
          contextualImportance
        };
      });

      // 時系列順でソート
      const sortedTimelineData = timelineData.sort((a, b) => 
        a.memory.timestamp.getTime() - b.memory.timestamp.getTime()
      );

      const processingTime = Date.now() - startTime;

      this.logger.debug(`Collected ${sortedTimelineData.length} timeline memories`, {
        timeRange,
        chapterNumber,
        processingTime: `${processingTime}ms`
      });

      return {
        success: true,
        data: sortedTimelineData,
        metadata: {
          operationId: `timeline-collection-${chapterNumber}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'memory-collector'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('Timeline collection failed', { timeRange, chapterNumber, error, processingTime });

      return {
        success: false,
        error: {
          code: 'TIMELINE_COLLECTION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown timeline collection error',
          details: error
        },
        metadata: {
          operationId: `timeline-collection-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'memory-collector'
        }
      };
    }
  }

  async collectHighPriorityMemories(
    chapterNumber: number,
    minImportance: number
  ): Promise<OperationResult<PrioritizedMemoryData[]>> {
    const startTime = Date.now();
    
    try {
      this.logger.debug('Collecting high priority memories', { chapterNumber, minImportance });

      // 高優先度検索クエリの構築
      const priorityQuery: SearchQuery = {
        minImportance,
        levels: [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM],
        limit: 50
      };

      // 高優先度記憶の検索
      const searchResult = await this.memoryManager.searchUnified(priorityQuery);
      
      if (!searchResult.success) {
        throw new Error(`Priority search failed: ${searchResult.error?.message}`);
      }

      // PrioritizedMemoryDataへの変換
      const prioritizedData: PrioritizedMemoryData[] = searchResult.data!.map(result => {
        const priorityScore = this.calculatePriorityScore(result.data, chapterNumber, minImportance);
        const relevanceFactors = this.identifyRelevanceFactors(result.data, chapterNumber);
        const chapterRelevance = this.calculateChapterRelevance(result.data, chapterNumber);

        return {
          memory: result.data,
          priorityScore,
          relevanceFactors,
          chapterRelevance
        };
      });

      // 優先度順でソート
      const sortedPriorityData = prioritizedData.sort((a, b) => b.priorityScore - a.priorityScore);

      const processingTime = Date.now() - startTime;

      this.logger.debug(`Collected ${sortedPriorityData.length} high priority memories`, {
        chapterNumber,
        minImportance,
        avgPriority: sortedPriorityData.reduce((sum, item) => sum + item.priorityScore, 0) / sortedPriorityData.length,
        processingTime: `${processingTime}ms`
      });

      return {
        success: true,
        data: sortedPriorityData,
        metadata: {
          operationId: `priority-collection-${chapterNumber}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'memory-collector'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('High priority collection failed', { chapterNumber, minImportance, error, processingTime });

      return {
        success: false,
        error: {
          code: 'PRIORITY_COLLECTION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown priority collection error',
          details: error
        },
        metadata: {
          operationId: `priority-collection-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'memory-collector'
        }
      };
    }
  }

  // ============================================================================
  // プライベートメソッド
  // ============================================================================

  private generateSearchQueries(context: MemoryCollectionContext): SearchQuery[] {
    const baseKeywords = [
      ...context.themes,
      ...context.characters,
      ...context.locations,
      ...context.concepts,
      `chapter-${context.chapterNumber}`
    ];

    // 短期記憶用クエリ（最近のイベント重視）
    const shortTermQuery: SearchQuery = {
      keywords: baseKeywords,
      levels: [MemoryLevel.SHORT_TERM],
      timeRange: context.timeFrame,
      limit: context.maxDataSize ? Math.floor(context.maxDataSize * 0.4) : 20
    };

    // 中期記憶用クエリ（分析結果重視）
    const midTermQuery: SearchQuery = {
      keywords: [...baseKeywords, 'analysis', 'pattern', 'progression'],
      levels: [MemoryLevel.MID_TERM],
      minImportance: 0.5,
      limit: context.maxDataSize ? Math.floor(context.maxDataSize * 0.3) : 15
    };

    // 長期記憶用クエリ（知識とパターン重視）
    const longTermQuery: SearchQuery = {
      keywords: [...baseKeywords, 'knowledge', 'rule', 'structure'],
      levels: [MemoryLevel.LONG_TERM],
      minImportance: 0.7,
      limit: context.maxDataSize ? Math.floor(context.maxDataSize * 0.3) : 15
    };

    return [shortTermQuery, midTermQuery, longTermQuery];
  }

  private adjustQueryForLevel(query: SearchQuery, level: MemoryLevel): SearchQuery {
    const adjustedQuery = { ...query };

    switch (level) {
      case MemoryLevel.SHORT_TERM:
        // 短期記憶：最近のデータを重視
        adjustedQuery.timeRange = adjustedQuery.timeRange || {
          start: new Date(Date.now() - 72 * 60 * 60 * 1000), // 72時間前
          end: new Date()
        };
        break;

      case MemoryLevel.MID_TERM:
        // 中期記憶：分析結果を重視
        adjustedQuery.dataTypes = ['analysis', 'character-evolution', 'narrative-progression'];
        adjustedQuery.minImportance = adjustedQuery.minImportance || 0.5;
        break;

      case MemoryLevel.LONG_TERM:
        // 長期記憶：確立された知識を重視
        adjustedQuery.dataTypes = ['knowledge', 'character-knowledge', 'world-knowledge'];
        adjustedQuery.minImportance = adjustedQuery.minImportance || 0.7;
        break;
    }

    return adjustedQuery;
  }

  private calculateTotalRelevance(
    shortTerm: SearchResult[],
    midTerm: SearchResult[],
    longTerm: SearchResult[]
  ): number {
    const allResults = [...shortTerm, ...midTerm, ...longTerm];
    
    if (allResults.length === 0) return 0;

    const totalRelevance = allResults.reduce((sum, result) => sum + result.relevanceScore, 0);
    return totalRelevance / allResults.length;
  }

  private calculateCoverageScore(context: MemoryCollectionContext, dataPoints: number): number {
    const expectedDataPoints = (context.themes.length + context.characters.length + context.locations.length) * 2;
    return Math.min(dataPoints / expectedDataPoints, 1.0);
  }

  private sortSearchResults(results: SearchResult[], sortBy: string): SearchResult[] {
    switch (sortBy) {
      case 'importance':
        return results.sort((a, b) => b.data.metadata.importance - a.data.metadata.importance);
      case 'timestamp':
        return results.sort((a, b) => b.data.timestamp.getTime() - a.data.timestamp.getTime());
      case 'relevance':
      default:
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
  }

  private calculateTemporalPosition(memory: MemoryData, timeRange: TimeRange): number {
    const totalDuration = timeRange.end.getTime() - timeRange.start.getTime();
    const memoryPosition = memory.timestamp.getTime() - timeRange.start.getTime();
    return Math.max(0, Math.min(1, memoryPosition / totalDuration));
  }

  private calculateContextualImportance(memory: MemoryData, chapterNumber: number): number {
    // 章番号に近い記憶ほど重要度が高い
    const chapterTag = `chapter-${chapterNumber}`;
    const hasChapterTag = memory.metadata.tags.includes(chapterTag);
    
    let importance = memory.metadata.importance;
    if (hasChapterTag) importance *= 1.5;
    
    return Math.min(importance, 1.0);
  }

  private calculatePriorityScore(memory: MemoryData, chapterNumber: number, minImportance: number): number {
    const baseScore = memory.metadata.importance;
    const chapterRelevance = this.calculateChapterRelevance(memory, chapterNumber);
    const recencyBonus = this.calculateRecencyBonus(memory);
    
    return (baseScore * 0.5) + (chapterRelevance * 0.3) + (recencyBonus * 0.2);
  }

  private calculateChapterRelevance(memory: MemoryData, chapterNumber: number): number {
    const chapterTags = memory.metadata.tags.filter(tag => tag.startsWith('chapter-'));
    if (chapterTags.length === 0) return 0.5; // デフォルト関連性
    
    const chapterNumbers = chapterTags.map(tag => parseInt(tag.split('-')[1]));
    const distances = chapterNumbers.map(num => Math.abs(num - chapterNumber));
    const minDistance = Math.min(...distances);
    
    return Math.max(0, 1 - (minDistance * 0.1));
  }

  private calculateRecencyBonus(memory: MemoryData): number {
    const hoursSinceCreation = (Date.now() - memory.timestamp.getTime()) / (1000 * 60 * 60);
    return Math.max(0, 1 - (hoursSinceCreation / 168)); // 1週間でボーナスが0になる
  }

  private identifyRelevanceFactors(memory: MemoryData, chapterNumber: number): string[] {
    const factors: string[] = [];
    
    if (memory.metadata.importance > 0.8) factors.push('high_importance');
    if (memory.metadata.tags.includes(`chapter-${chapterNumber}`)) factors.push('chapter_specific');
    if (memory.level === MemoryLevel.LONG_TERM) factors.push('established_knowledge');
    if (this.calculateRecencyBonus(memory) > 0.5) factors.push('recent_data');
    
    return factors;
  }

  // Data Coordinator統合により、実際のMemoryManagerを使用するため、
  // このメソッドは今後非推奨です
  private createMockMemoryManager(): IMemoryManager {
    this.logger.warn('Using deprecated mock MemoryManager - should use real MemoryManager via Data Coordinator');
    
    return {
      storeShortTerm: async () => ({ success: true, data: undefined, metadata: { operationId: '', timestamp: '', processingTime: 0, systemId: 'mock' } }),
      storeMidTerm: async () => ({ success: true, data: undefined, metadata: { operationId: '', timestamp: '', processingTime: 0, systemId: 'mock' } }),
      storeLongTerm: async () => ({ success: true, data: undefined, metadata: { operationId: '', timestamp: '', processingTime: 0, systemId: 'mock' } }),
      retrieveShortTerm: async () => ({ success: true, data: [], metadata: { operationId: '', timestamp: '', processingTime: 0, systemId: 'mock' } }),
      retrieveMidTerm: async () => ({ success: true, data: [], metadata: { operationId: '', timestamp: '', processingTime: 0, systemId: 'mock' } }),
      retrieveLongTerm: async () => ({ success: true, data: [], metadata: { operationId: '', timestamp: '', processingTime: 0, systemId: 'mock' } }),
      searchUnified: async (query: any) => {
        // Return mock search results
        return {
          success: true,
          data: [],
          metadata: {
            operationId: `mock-search-${Date.now()}`,
            timestamp: new Date().toISOString(),
            processingTime: 10,
            systemId: 'mock-memory'
          }
        };
      },
      promoteMemory: async () => ({ success: true, data: undefined, metadata: { operationId: '', timestamp: '', processingTime: 0, systemId: 'mock' } }),
      getMemorySnapshot: async () => ({ success: true, data: {
        shortTerm: { totalEntries: 0, oldestEntry: new Date(), newestEntry: new Date(), totalSize: 0 },
        midTerm: { totalEntries: 0, categories: {}, totalSize: 0 },
        longTerm: { totalEntries: 0, domains: {}, totalSize: 0 },
        timestamp: new Date()
      }, metadata: { operationId: '', timestamp: '', processingTime: 0, systemId: 'mock' } }),
      performMaintenance: async () => ({ success: true, data: {
        cleanedShortTerm: 0,
        consolidatedMidTerm: 0,
        optimizedLongTerm: 0,
        totalReclaimed: 0,
        duration: 0
      }, metadata: { operationId: '', timestamp: '', processingTime: 0, systemId: 'mock' } }),
      getRecentContext: async () => ({ success: true, data: [], metadata: { operationId: '', timestamp: '', processingTime: 0, systemId: 'mock' } }),
      promoteToHigherLevel: async () => ({ success: true, data: undefined, metadata: { operationId: '', timestamp: '', processingTime: 0, systemId: 'mock' } }),
      cleanup: async () => ({ success: true, data: { removed: 0, freed: 0 }, metadata: { operationId: '', timestamp: '', processingTime: 0, systemId: 'mock' } }),
      getStatistics: async () => ({ success: true, data: {
        totalItems: 0,
        itemsByLevel: {
          [MemoryLevel.SHORT_TERM]: 0,
          [MemoryLevel.MID_TERM]: 0,
          [MemoryLevel.LONG_TERM]: 0
        },
        storageUsage: {
          total: 0,
          byLevel: {
            [MemoryLevel.SHORT_TERM]: 0,
            [MemoryLevel.MID_TERM]: 0,
            [MemoryLevel.LONG_TERM]: 0
          }
        },
        lastCleanup: new Date(),
        performanceMetrics: {
          averageRetrievalTime: 0,
          averageStorageTime: 0,
          cacheHitRate: 0
        }
      }, metadata: { operationId: '', timestamp: '', processingTime: 0, systemId: 'mock' } }),
      validateIntegrity: async () => ({ success: true, data: { isValid: true, issues: [] }, metadata: { operationId: '', timestamp: '', processingTime: 0, systemId: 'mock' } })
    } as unknown as IMemoryManager;
  }

  // ============================================================================
  // Data Coordinator統合メソッド
  // ============================================================================

  /**
   * Data Coordinator経由でのメモリクエリ最適化
   */
  private async optimizeMemoryQuery(query: SearchQuery, level: MemoryLevel): Promise<SearchQuery> {
    try {
      // Data Coordinatorのクエリ最適化機能を活用
      const optimizationResult = await this.dataCoordinator.optimizeQueryExecution([
        {
          id: `memory-query-${level}-${Date.now()}`,
          systemType: SystemType.MEMORY,
          chapterNumber: 1, // TODO: 動的に設定
          parameters: { query, level },
          priority: this.getMemoryLevelPriority(level),
          timeout: 10000
        }
      ]);

      if (optimizationResult.success && optimizationResult.data!.length > 0) {
        const optimizedParams = optimizationResult.data![0].parameters;
        return optimizedParams.query || query;
      }

      return query;
    } catch (error) {
      this.logger.warn('Memory query optimization failed, using original query', { error, level });
      return query;
    }
  }

  /**
   * メモリレベルの優先度を取得
   */
  private getMemoryLevelPriority(level: MemoryLevel): number {
    const priorities = {
      [MemoryLevel.SHORT_TERM]: 0.9, // 最近のデータ重視
      [MemoryLevel.MID_TERM]: 0.8,   // 分析結果重視
      [MemoryLevel.LONG_TERM]: 0.85  // 確立された知識重視
    };
    return priorities[level] || 0.7;
  }

  /**
   * Data Coordinator経由でのシステム健全性チェック
   */
  public async checkMemorySystemHealth(): Promise<{ healthy: boolean; details: any }> {
    try {
      const healthResult = await this.dataCoordinator.healthCheck();
      const memorySystemStatus = healthResult.systemStatus.find(
        status => status.systemType === SystemType.MEMORY
      );

      return {
        healthy: memorySystemStatus?.healthy || false,
        details: {
          memorySystemStatus,
          dataCoordinatorHealth: healthResult.healthy,
          connectionMetrics: this.dataCoordinator.getSystemConnections()
            .find(conn => conn.systemType === SystemType.MEMORY)?.metrics
        }
      };
    } catch (error) {
      this.logger.error('Memory system health check failed', { error });
      return {
        healthy: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}