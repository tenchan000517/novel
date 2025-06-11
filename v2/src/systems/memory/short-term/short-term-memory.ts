/**
 * 短期記憶管理システム
 * 最近のチャプター情報と連続性データを管理（最大72時間保持）
 */

import type {
  IShortTermMemory,
  ShortTermData
} from '../interfaces';
import type { OperationResult } from '@/types/common';
import type {
  ContinuityData,
  CharacterStateMap,
  DataIndex
} from '../types';
import { logger } from '@/core/infrastructure/logger';

export class ShortTermMemory implements IShortTermMemory {
  private readonly maxRetentionHours = 72;
  private readonly maxItems = 1000;
  private readonly cleanupInterval = 3600000; // 1時間
  
  private dataStore: Map<string, ShortTermData> = new Map();
  private dataIndex: DataIndex[] = [];
  private continuityChain: ContinuityData[] = [];
  private characterStates: CharacterStateMap = {};
  private cleanupTimer?: NodeJS.Timeout;

  constructor() {
    this.startCleanupScheduler();
  }

  /**
   * 短期記憶にデータを保存
   */
  async store(data: ShortTermData): Promise<OperationResult<void>> {
    const startTime = Date.now();
    
    try {
      // データ検証
      if (!this.validateData(data)) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid short-term data'
          },
          metadata: {
            operationId: this.generateOperationId(),
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: 'memory.short-term'
          }
        };
      }

      // 容量制限チェック
      await this.enforceCapacityLimit();

      // データ保存
      this.dataStore.set(data.id, data);
      
      // インデックス更新
      this.updateDataIndex(data);
      
      // 連続性チェーン更新
      if (data.chapterNumber) {
        this.updateContinuityChain(data);
      }
      
      // キャラクター状態更新
      if (data.characterStates) {
        this.updateCharacterStates(data.characterStates);
      }

      logger.info(`Stored short-term data: ${data.id}`);
      
      return {
        success: true,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.short-term'
        }
      };
    } catch (error) {
      logger.error('Failed to store short-term data:', error);
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to store short-term data',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.short-term'
        }
      };
    }
  }

  /**
   * 最近のデータを取得
   */
  async getRecent(count: number): Promise<OperationResult<ShortTermData[]>> {
    const startTime = Date.now();
    
    try {
      const sortedData = Array.from(this.dataStore.values())
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, count);
      
      return {
        success: true,
        data: sortedData,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.short-term'
        }
      };
    } catch (error) {
      logger.error('Failed to get recent data:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get recent data',
          details: error
        },
        data: [],
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.short-term'
        }
      };
    }
  }

  /**
   * 時間範囲でデータを取得
   */
  async getByTimeRange(
    startTime: Date, 
    endTime: Date
  ): Promise<OperationResult<ShortTermData[]>> {
    const opStartTime = Date.now();
    
    try {
      const filteredData = Array.from(this.dataStore.values())
        .filter(data => {
          const dataTime = data.timestamp.getTime();
          return dataTime >= startTime.getTime() && dataTime <= endTime.getTime();
        })
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      return {
        success: true,
        data: filteredData,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - opStartTime,
          systemId: 'memory.short-term'
        }
      };
    } catch (error) {
      logger.error('Failed to get data by time range:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get data by time range',
          details: error
        },
        data: [],
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - opStartTime,
          systemId: 'memory.short-term'
        }
      };
    }
  }

  /**
   * データ更新
   */
  async updateData(
    dataId: string, 
    updates: Partial<ShortTermData>
  ): Promise<OperationResult<void>> {
    const startTime = Date.now();
    
    try {
      const existingData = this.dataStore.get(dataId);
      if (!existingData) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Data with id ${dataId} not found`
          },
          metadata: {
            operationId: this.generateOperationId(),
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: 'memory.short-term'
          }
        };
      }

      // 更新データのマージ
      const updatedData: ShortTermData = {
        ...existingData,
        ...updates,
        id: dataId, // IDは変更不可
        timestamp: existingData.timestamp // タイムスタンプは保持
      };

      this.dataStore.set(dataId, updatedData);
      this.updateDataIndex(updatedData);

      return {
        success: true,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.short-term'
        }
      };
    } catch (error) {
      logger.error('Failed to update data:', error);
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update data',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.short-term'
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
      const now = Date.now();
      const expirationTime = this.maxRetentionHours * 60 * 60 * 1000;
      let removedCount = 0;

      // 期限切れデータの削除
      for (const [id, data] of this.dataStore.entries()) {
        if (now - data.timestamp.getTime() > expirationTime) {
          this.dataStore.delete(id);
          removedCount++;
        }
      }

      // インデックスの再構築
      if (removedCount > 0) {
        this.rebuildDataIndex();
      }

      logger.info(`Cleaned up ${removedCount} expired items from short-term memory`);

      return {
        success: true,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.short-term',
          additionalInfo: { removedCount }
        }
      };
    } catch (error) {
      logger.error('Failed to cleanup short-term memory:', error);
      return {
        success: false,
        error: {
          code: 'CLEANUP_ERROR',
          message: 'Failed to cleanup short-term memory',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.short-term'
        }
      };
    }
  }

  /**
   * 連続性データを取得
   */
  async getContinuityData(): Promise<OperationResult<Map<string, any>>> {
    const startTime = Date.now();
    
    try {
      const continuityMap = new Map<string, any>();
      
      // 最新の連続性データを取得
      if (this.continuityChain.length > 0) {
        const latestContinuity = this.continuityChain[this.continuityChain.length - 1];
        continuityMap.set('latest', latestContinuity);
        continuityMap.set('chain', this.continuityChain.slice(-10)); // 直近10件
        continuityMap.set('characterMoods', latestContinuity.characterMoods);
        continuityMap.set('plotProgress', latestContinuity.plotProgress);
        continuityMap.set('unresolvedEvents', latestContinuity.unresolvedEvents);
      }

      return {
        success: true,
        data: continuityMap,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.short-term'
        }
      };
    } catch (error) {
      logger.error('Failed to get continuity data:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get continuity data',
          details: error
        },
        data: new Map(),
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.short-term'
        }
      };
    }
  }

  /**
   * キャラクター状態を取得
   */
  async getCharacterStates(): Promise<OperationResult<Map<string, any>>> {
    const startTime = Date.now();
    
    try {
      const statesMap = new Map<string, any>();
      
      Object.entries(this.characterStates).forEach(([characterId, state]) => {
        statesMap.set(characterId, state);
      });

      return {
        success: true,
        data: statesMap,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.short-term'
        }
      };
    } catch (error) {
      logger.error('Failed to get character states:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get character states',
          details: error
        },
        data: new Map(),
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.short-term'
        }
      };
    }
  }

  // プライベートメソッド

  private isExpired(data: ShortTermData): boolean {
    const now = Date.now();
    const dataAge = now - data.timestamp.getTime();
    return dataAge > this.maxRetentionHours * 60 * 60 * 1000;
  }

  private async enforceCapacityLimit(): Promise<void> {
    if (this.dataStore.size >= this.maxItems) {
      const itemsToRemove = this.selectDataForEviction();
      itemsToRemove.forEach(item => {
        this.dataStore.delete(item.id);
      });
      this.rebuildDataIndex();
    }
  }

  private selectDataForEviction(): ShortTermData[] {
    // 重要度と古さを考慮して削除対象を選択
    const sortedData = Array.from(this.dataStore.values())
      .sort((a, b) => {
        // 重要度が低い順、同じなら古い順
        const importanceDiff = (a.metadata.importance || 0) - (b.metadata.importance || 0);
        if (importanceDiff !== 0) return importanceDiff;
        return a.timestamp.getTime() - b.timestamp.getTime();
      });
    
    // 下位10%を削除対象とする
    const removeCount = Math.ceil(this.maxItems * 0.1);
    return sortedData.slice(0, removeCount);
  }

  private validateDataContinuity(data: ShortTermData): boolean {
    if (!data.chapterNumber) return true;
    
    // チャプター番号の連続性をチェック
    const lastChapter = this.continuityChain[this.continuityChain.length - 1]?.chapterNumber;
    if (lastChapter && data.chapterNumber !== lastChapter + 1) {
      logger.warn(`Chapter continuity break: expected ${lastChapter + 1}, got ${data.chapterNumber}`);
    }
    
    return true;
  }

  private updateContinuityChain(data: ShortTermData): void {
    if (!data.chapterNumber) return;
    
    const continuityData: ContinuityData = {
      chapterNumber: data.chapterNumber,
      characterMoods: data.characterStates ? 
        new Map(Object.entries(data.characterStates).map(([id, state]) => [id, state.currentMood])) : 
        new Map(),
      plotProgress: data.immediateContext || '',
      unresolvedEvents: [], // TODO: 実装時に適切に設定
      activeRelationships: new Map() // TODO: 実装時に適切に設定
    };
    
    this.continuityChain.push(continuityData);
    
    // 連続性チェーンのサイズ制限
    if (this.continuityChain.length > 100) {
      this.continuityChain = this.continuityChain.slice(-50);
    }
  }

  private updateCharacterStates(states: Map<string, any>): void {
    states.forEach((state, characterId) => {
      this.characterStates[characterId] = {
        ...this.characterStates[characterId],
        ...state,
        lastUpdated: new Date()
      };
    });
  }

  private validateData(data: ShortTermData): boolean {
    if (!data.id || !data.timestamp || !data.dataType || !data.content) {
      return false;
    }
    
    if (!data.metadata || typeof data.metadata.importance !== 'number') {
      return false;
    }
    
    return true;
  }

  private updateDataIndex(data: ShortTermData): void {
    // 既存のインデックスを削除
    this.dataIndex = this.dataIndex.filter(index => index.id !== data.id);
    
    // 新しいインデックスを追加
    this.dataIndex.push({
      id: data.id,
      dataType: data.dataType,
      timestamp: data.timestamp,
      importance: data.metadata.importance,
      keywords: data.metadata.tags || [],
      relationships: [] // TODO: 関係性の抽出実装
    });
  }

  private rebuildDataIndex(): void {
    this.dataIndex = [];
    this.dataStore.forEach(data => {
      this.updateDataIndex(data);
    });
  }

  private startCleanupScheduler(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup().catch(error => {
        logger.error('Scheduled cleanup failed:', error);
      });
    }, this.cleanupInterval);
  }

  private generateOperationId(): string {
    return `stm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateDataImportance(data: ShortTermData): number {
    let importance = data.metadata.importance || 0.5;
    
    // チャプターデータは重要度を上げる
    if (data.chapterNumber) {
      importance += 0.2;
    }
    
    // キャラクター状態を含むデータは重要度を上げる
    if (data.characterStates && data.characterStates.size > 0) {
      importance += 0.1;
    }
    
    // 学習進捗を含むデータは重要度を上げる
    if (data.learningProgress && data.learningProgress.size > 0) {
      importance += 0.1;
    }
    
    return Math.min(importance, 1.0);
  }

  /**
   * デストラクタ
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}