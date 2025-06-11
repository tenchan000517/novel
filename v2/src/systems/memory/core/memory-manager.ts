/**
 * 統合メモリマネージャー
 * 短期・中期・長期記憶を統括し、統一的なアクセスを提供
 */

import type { 
  IMemoryManager, 
  IShortTermMemory, 
  IMidTermMemory, 
  ILongTermMemory,
  MemoryData,
  ShortTermData,
  MidTermData,
  LongTermData,
  SearchQuery,
  SearchResult,
  MemoryStatistics,
  IntegrityReport
} from '../interfaces';
import { MemoryLevel } from '../interfaces';
import type { OperationResult, SystemId } from '@/types/common';
import type { MemoryOperation, MemorySnapshot } from '../types';
import { logger } from '@/core/infrastructure/logger';

export class MemoryManager implements IMemoryManager {
  private readonly systemId: SystemId = 'memory';
  private shortTermMemory!: IShortTermMemory;
  private midTermMemory!: IMidTermMemory;
  private longTermMemory!: ILongTermMemory;
  private operationHistory: MemoryOperation[] = [];
  private lastSnapshot?: MemorySnapshot;

  constructor(
    shortTerm: IShortTermMemory,
    midTerm: IMidTermMemory,
    longTerm: ILongTermMemory
  ) {
    this.shortTermMemory = shortTerm;
    this.midTermMemory = midTerm;
    this.longTermMemory = longTerm;
  }

  /**
   * 短期記憶にデータを保存
   */
  async storeShortTerm(data: ShortTermData): Promise<OperationResult<void>> {
    const startTime = Date.now();
    
    try {
      // データ検証
      const validation = this.validateDataIntegrity(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.errors.join(', ')
          },
          metadata: {
            operationId: this.generateOperationId(),
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: this.systemId
          }
        };
      }

      // 適切なレベルへのルーティング
      const targetLevel = this.routeToAppropriateLevel(data);
      if (targetLevel !== MemoryLevel.SHORT_TERM) {
        logger.warn(`Data routed to ${targetLevel} instead of SHORT_TERM`);
      }

      // 短期記憶に保存
      const result = await this.shortTermMemory.store(data);
      
      // 操作履歴記録
      this.recordOperation({
        operationType: 'store',
        memoryLevel: MemoryLevel.SHORT_TERM,
        dataId: data.id,
        timestamp: new Date(),
        success: result.success,
        duration: Date.now() - startTime
      });

      return result;
    } catch (error) {
      logger.error('Failed to store short-term memory:', error);
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to store short-term memory',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * 中期記憶にデータを保存
   */
  async storeMidTerm(data: MidTermData): Promise<OperationResult<void>> {
    const startTime = Date.now();
    
    try {
      // データ検証
      const validation = this.validateDataIntegrity(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.errors.join(', ')
          },
          metadata: {
            operationId: this.generateOperationId(),
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: this.systemId
          }
        };
      }

      // 中期記憶に保存
      const result = await this.midTermMemory.store(data);
      
      // 操作履歴記録
      this.recordOperation({
        operationType: 'store',
        memoryLevel: MemoryLevel.MID_TERM,
        dataId: data.id,
        timestamp: new Date(),
        success: result.success,
        duration: Date.now() - startTime
      });

      return result;
    } catch (error) {
      logger.error('Failed to store mid-term memory:', error);
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to store mid-term memory',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * 長期記憶にデータを保存
   */
  async storeLongTerm(data: LongTermData): Promise<OperationResult<void>> {
    const startTime = Date.now();
    
    try {
      // データ検証
      const validation = this.validateDataIntegrity(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.errors.join(', ')
          },
          metadata: {
            operationId: this.generateOperationId(),
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: this.systemId
          }
        };
      }

      // 長期記憶に保存
      const result = await this.longTermMemory.store(data);
      
      // 操作履歴記録
      this.recordOperation({
        operationType: 'store',
        memoryLevel: MemoryLevel.LONG_TERM,
        dataId: data.id,
        timestamp: new Date(),
        success: result.success,
        duration: Date.now() - startTime
      });

      return result;
    } catch (error) {
      logger.error('Failed to store long-term memory:', error);
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to store long-term memory',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * 統一検索
   */
  async searchUnified(query: SearchQuery): Promise<OperationResult<SearchResult[]>> {
    const startTime = Date.now();
    
    try {
      // 各レベルでの検索を並列実行
      const searchPromises: Promise<SearchResult[]>[] = [];
      
      if (!query.levels || query.levels.includes(MemoryLevel.SHORT_TERM)) {
        searchPromises.push(this.searchShortTerm(query));
      }
      
      if (!query.levels || query.levels.includes(MemoryLevel.MID_TERM)) {
        searchPromises.push(this.searchMidTerm(query));
      }
      
      if (!query.levels || query.levels.includes(MemoryLevel.LONG_TERM)) {
        searchPromises.push(this.searchLongTerm(query));
      }

      // 結果を統合
      const results = await Promise.all(searchPromises);
      const allResults = results.flat();

      // 関連度でソート
      allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

      // 件数制限
      const limitedResults = query.limit 
        ? allResults.slice(0, query.limit)
        : allResults;

      return {
        success: true,
        data: limitedResults,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to search unified memory:', error);
      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: 'Failed to search unified memory',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * 最近のコンテキスト取得
   */
  async getRecentContext(depth: number): Promise<OperationResult<ShortTermData[]>> {
    const startTime = Date.now();
    
    try {
      const result = await this.shortTermMemory.getRecent(depth);
      
      return {
        success: result.success,
        data: result.data,
        error: result.error,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to get recent context:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get recent context',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * データの上位レベルへの昇格
   */
  async promoteToHigherLevel(
    memoryId: string, 
    targetLevel: MemoryLevel
  ): Promise<OperationResult<void>> {
    const startTime = Date.now();
    
    try {
      // 実装は省略（詳細なロジックは個別に実装）
      logger.info(`Promoting memory ${memoryId} to ${targetLevel}`);
      
      return {
        success: true,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to promote memory:', error);
      return {
        success: false,
        error: {
          code: 'PROMOTION_ERROR',
          message: 'Failed to promote memory',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * クリーンアップ
   */
  async cleanup(): Promise<OperationResult<void>> {
    const startTime = Date.now();
    
    try {
      // 各レベルのクリーンアップを並列実行
      await Promise.all([
        this.shortTermMemory.cleanup(),
        this.handleMemoryOverflow(MemoryLevel.MID_TERM),
        this.optimizeStorageDistribution()
      ]);

      return {
        success: true,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to cleanup memory:', error);
      return {
        success: false,
        error: {
          code: 'CLEANUP_ERROR',
          message: 'Failed to cleanup memory',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * 統計情報取得
   */
  async getStatistics(): Promise<OperationResult<MemoryStatistics>> {
    const startTime = Date.now();
    
    try {
      // 実装は省略（詳細な統計収集ロジックは個別に実装）
      const stats: MemoryStatistics = {
        totalItems: 0,
        itemsByLevel: new Map(),
        storageUsage: 0,
        lastCleanup: new Date(),
        performanceMetrics: {
          averageSearchTime: 0,
          cacheHitRate: 0,
          compressionRatio: 0
        }
      };

      return {
        success: true,
        data: stats,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to get statistics:', error);
      return {
        success: false,
        error: {
          code: 'STATISTICS_ERROR',
          message: 'Failed to get statistics',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * 整合性検証
   */
  async validateIntegrity(): Promise<OperationResult<IntegrityReport>> {
    const startTime = Date.now();
    
    try {
      const report: IntegrityReport = {
        isValid: true,
        errors: [],
        warnings: [],
        duplicates: 0,
        orphanedData: 0,
        recommendations: []
      };

      // 実装は省略（詳細な検証ロジックは個別に実装）

      return {
        success: true,
        data: report,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to validate integrity:', error);
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to validate integrity',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  // プライベートメソッド

  private routeToAppropriateLevel(data: MemoryData): MemoryLevel {
    // 重要度に基づいてレベルを決定
    if (data.metadata.importance >= 0.8) {
      return MemoryLevel.LONG_TERM;
    } else if (data.metadata.importance >= 0.5) {
      return MemoryLevel.MID_TERM;
    }
    return MemoryLevel.SHORT_TERM;
  }

  private validateDataIntegrity(data: MemoryData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.id) {
      errors.push('Missing data ID');
    }
    if (!data.dataType) {
      errors.push('Missing data type');
    }
    if (!data.content) {
      errors.push('Missing content');
    }
    if (!data.metadata) {
      errors.push('Missing metadata');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async searchShortTerm(query: SearchQuery): Promise<SearchResult[]> {
    // 短期記憶での検索ロジック（実装は個別に）
    return [];
  }

  private async searchMidTerm(query: SearchQuery): Promise<SearchResult[]> {
    // 中期記憶での検索ロジック（実装は個別に）
    return [];
  }

  private async searchLongTerm(query: SearchQuery): Promise<SearchResult[]> {
    // 長期記憶での検索ロジック（実装は個別に）
    return [];
  }

  private async optimizeStorageDistribution(): Promise<void> {
    // ストレージ分散の最適化ロジック
    logger.info('Optimizing storage distribution');
  }

  private async handleMemoryOverflow(level: MemoryLevel): Promise<void> {
    // メモリオーバーフロー処理
    logger.info(`Handling memory overflow for ${level}`);
  }

  private recordOperation(operation: MemoryOperation): void {
    this.operationHistory.push(operation);
    
    // 履歴サイズ制限
    if (this.operationHistory.length > 1000) {
      this.operationHistory = this.operationHistory.slice(-500);
    }
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateMemoryImportance(data: MemoryData): number {
    // 重要度計算ロジック
    return data.metadata.importance || 0.5;
  }

  private createMemorySnapshot(): MemorySnapshot {
    return {
      timestamp: new Date(),
      shortTermCount: 0,
      midTermCount: 0,
      longTermCount: 0,
      totalSize: 0,
      activeCharacters: [],
      currentChapter: 0
    };
  }
}