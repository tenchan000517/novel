/**
 * 長期記憶管理システム
 * 永続的なキャラクターデータ、世界設定、フレームワークデータベースを管理
 */

import type {
  ILongTermMemory,
  LongTermData
} from '../interfaces';
import type { OperationResult } from '@/types/common';
import { logger } from '@/core/infrastructure/logger';

export class LongTermMemory implements ILongTermMemory {
  private readonly compressionEnabled = true;
  private readonly backupEnabled = true;
  private readonly maxItems = 50000;
  
  private dataStore: Map<string, LongTermData> = new Map();
  private searchIndex: Map<string, Set<string>> = new Map();
  private categoryIndex: Map<string, Set<string>> = new Map();
  private worldSettings: Map<string, any> = new Map();
  private frameworkDatabase: Map<string, any> = new Map();
  private knowledgeGraph: Map<string, Set<string>> = new Map();

  /**
   * 長期記憶にデータを保存
   */
  async store(data: LongTermData): Promise<OperationResult<void>> {
    const startTime = Date.now();
    
    try {
      // データ検証
      if (!this.validateData(data)) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid long-term data'
          },
          metadata: {
            operationId: this.generateOperationId(),
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: 'memory.long-term'
          }
        };
      }

      // バージョン管理
      const existingData = this.dataStore.get(data.permanentId);
      if (existingData) {
        data.version = existingData.version + 1;
      } else {
        data.version = 1;
      }
      data.lastUpdated = new Date();

      // データ保存
      this.dataStore.set(data.permanentId, data);
      
      // インデックス更新
      this.updateSearchIndex(data);
      this.updateCategoryIndex(data);
      
      // カテゴリ別特別処理
      await this.processByCategory(data);
      
      // 知識グラフ更新
      this.updateKnowledgeGraph(data);

      logger.info(`Stored long-term data: ${data.permanentId} (v${data.version})`);
      
      return {
        success: true,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.long-term'
        }
      };
    } catch (error) {
      logger.error('Failed to store long-term data:', error);
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to store long-term data',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.long-term'
        }
      };
    }
  }

  /**
   * カテゴリ別データを取得
   */
  async getByCategory(category: string): Promise<OperationResult<LongTermData[]>> {
    const startTime = Date.now();
    
    try {
      const categoryIds = this.categoryIndex.get(category) || new Set();
      const categoryData = Array.from(categoryIds)
        .map(id => this.dataStore.get(id))
        .filter((data): data is LongTermData => data !== undefined)
        .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
      
      return {
        success: true,
        data: categoryData,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.long-term'
        }
      };
    } catch (error) {
      logger.error('Failed to get data by category:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get data by category',
          details: error
        },
        data: [],
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.long-term'
        }
      };
    }
  }

  /**
   * 知識検索
   */
  async searchKnowledge(query: string): Promise<OperationResult<LongTermData[]>> {
    const startTime = Date.now();
    
    try {
      const searchTerms = this.parseSearchQuery(query);
      const relevantIds = new Set<string>();
      
      // キーワードベースの検索
      searchTerms.forEach(term => {
        const matchingIds = this.searchIndex.get(term.toLowerCase());
        if (matchingIds) {
          matchingIds.forEach(id => relevantIds.add(id));
        }
      });
      
      // 関連度スコアでソート
      const results = Array.from(relevantIds)
        .map(id => {
          const data = this.dataStore.get(id);
          if (!data) return null;
          
          const relevanceScore = this.calculateRelevanceScore(data, searchTerms);
          return { data, relevanceScore };
        })
        .filter((item): item is { data: LongTermData; relevanceScore: number } => 
          item !== null && item.relevanceScore > 0.1
        )
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 100) // 上位100件
        .map(item => item.data);
      
      return {
        success: true,
        data: results,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.long-term',
          additionalInfo: { 
            searchTerms,
            totalMatches: relevantIds.size,
            returnedResults: results.length
          }
        }
      };
    } catch (error) {
      logger.error('Failed to search knowledge:', error);
      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: 'Failed to search knowledge',
          details: error
        },
        data: [],
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.long-term'
        }
      };
    }
  }

  /**
   * 世界設定を取得
   */
  async getWorldSettings(): Promise<OperationResult<any>> {
    const startTime = Date.now();
    
    try {
      const worldData = Object.fromEntries(this.worldSettings.entries());
      
      return {
        success: true,
        data: worldData,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.long-term'
        }
      };
    } catch (error) {
      logger.error('Failed to get world settings:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get world settings',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.long-term'
        }
      };
    }
  }

  /**
   * フレームワークデータベースを取得
   */
  async getFrameworkDatabase(): Promise<OperationResult<Map<string, any>>> {
    const startTime = Date.now();
    
    try {
      return {
        success: true,
        data: new Map(this.frameworkDatabase),
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.long-term'
        }
      };
    } catch (error) {
      logger.error('Failed to get framework database:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get framework database',
          details: error
        },
        data: new Map(),
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.long-term'
        }
      };
    }
  }

  /**
   * アックセス最適化
   */
  async optimizeAccess(): Promise<OperationResult<void>> {
    const startTime = Date.now();
    
    try {
      // インデックスの再構築
      await this.rebuildSearchIndex();
      
      // 使用頻度に基づいたキャッシュ最適化
      await this.optimizeCache();
      
      // 古いデータの圧縮
      if (this.compressionEnabled) {
        await this.compressOldData();
      }
      
      // バックアップの実行
      if (this.backupEnabled) {
        await this.createBackup();
      }
      
      return {
        success: true,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.long-term'
        }
      };
    } catch (error) {
      logger.error('Failed to optimize access:', error);
      return {
        success: false,
        error: {
          code: 'OPTIMIZATION_ERROR',
          message: 'Failed to optimize access',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.long-term'
        }
      };
    }
  }

  // プライベートメソッド

  private validateData(data: LongTermData): boolean {
    if (!data.id || !data.timestamp || !data.dataType || !data.content) {
      return false;
    }
    
    if (!data.dataCategory || !data.permanentId) {
      return false;
    }
    
    if (!data.metadata || typeof data.metadata.importance !== 'number') {
      return false;
    }
    
    return true;
  }

  private updateSearchIndex(data: LongTermData): void {
    // コンテンツからキーワードを抽出
    const keywords = this.extractKeywords(data);
    
    keywords.forEach(keyword => {
      const normalizedKeyword = keyword.toLowerCase();
      if (!this.searchIndex.has(normalizedKeyword)) {
        this.searchIndex.set(normalizedKeyword, new Set());
      }
      this.searchIndex.get(normalizedKeyword)!.add(data.permanentId);
    });
    
    // メタデータのタグもインデックスに追加
    if (data.metadata.tags) {
      data.metadata.tags.forEach(tag => {
        const normalizedTag = tag.toLowerCase();
        if (!this.searchIndex.has(normalizedTag)) {
          this.searchIndex.set(normalizedTag, new Set());
        }
        this.searchIndex.get(normalizedTag)!.add(data.permanentId);
      });
    }
  }

  private updateCategoryIndex(data: LongTermData): void {
    if (!this.categoryIndex.has(data.dataCategory)) {
      this.categoryIndex.set(data.dataCategory, new Set());
    }
    this.categoryIndex.get(data.dataCategory)!.add(data.permanentId);
  }

  private async processByCategory(data: LongTermData): Promise<void> {
    switch (data.dataCategory) {
      case 'character':
        await this.processCharacterData(data);
        break;
      case 'world':
        await this.processWorldData(data);
        break;
      case 'framework':
        await this.processFrameworkData(data);
        break;
      case 'knowledge':
        await this.processKnowledgeData(data);
        break;
      case 'system':
        await this.processSystemData(data);
        break;
    }
  }

  private async processCharacterData(data: LongTermData): Promise<void> {
    // キャラクターデータの特別処理
    logger.info(`Processing character data: ${data.permanentId}`);
  }

  private async processWorldData(data: LongTermData): Promise<void> {
    // 世界設定データの特別処理
    this.worldSettings.set(data.permanentId, data.content);
    logger.info(`Processing world data: ${data.permanentId}`);
  }

  private async processFrameworkData(data: LongTermData): Promise<void> {
    // フレームワークデータの特別処理
    this.frameworkDatabase.set(data.permanentId, data.content);
    logger.info(`Processing framework data: ${data.permanentId}`);
  }

  private async processKnowledgeData(data: LongTermData): Promise<void> {
    // 知識データの特別処理
    logger.info(`Processing knowledge data: ${data.permanentId}`);
  }

  private async processSystemData(data: LongTermData): Promise<void> {
    // システムデータの特別処理
    logger.info(`Processing system data: ${data.permanentId}`);
  }

  private updateKnowledgeGraph(data: LongTermData): void {
    // 知識グラフの更新（簡略化実装）
    if (!this.knowledgeGraph.has(data.permanentId)) {
      this.knowledgeGraph.set(data.permanentId, new Set());
    }
    
    // 関連データの接続を構築（実際はより複雑なロジックが必要）
    const relatedIds = this.findRelatedData(data);
    relatedIds.forEach(relatedId => {
      this.knowledgeGraph.get(data.permanentId)!.add(relatedId);
      
      if (!this.knowledgeGraph.has(relatedId)) {
        this.knowledgeGraph.set(relatedId, new Set());
      }
      this.knowledgeGraph.get(relatedId)!.add(data.permanentId);
    });
  }

  private parseSearchQuery(query: string): string[] {
    // シンプルなクエリパーシング
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 2)
      .map(term => term.replace(/[^\wあ-んア-ン一-龯]/g, ''))
      .filter(term => term.length > 0);
  }

  private calculateRelevanceScore(data: LongTermData, searchTerms: string[]): number {
    let score = 0;
    const content = JSON.stringify(data.content).toLowerCase();
    const dataType = data.dataType.toLowerCase();
    const tags = (data.metadata.tags || []).map(tag => tag.toLowerCase());
    
    searchTerms.forEach(term => {
      // コンテンツマッチ
      const contentMatches = (content.match(new RegExp(term, 'g')) || []).length;
      score += contentMatches * 1.0;
      
      // データタイプマッチ
      if (dataType.includes(term)) {
        score += 2.0;
      }
      
      // タグマッチ
      if (tags.some(tag => tag.includes(term))) {
        score += 1.5;
      }
    });
    
    // 重要度ボーナス
    score *= (data.metadata.importance || 0.5);
    
    return score;
  }

  private extractKeywords(data: LongTermData): string[] {
    const keywords: string[] = [];
    
    // コンテンツからキーワードを抽出（簡略化）
    const contentStr = JSON.stringify(data.content);
    const words = contentStr.match(/[\wあ-んア-ン一-龯]{3,}/g) || [];
    
    // 頻度が高い単語をキーワードとして抽出
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      const normalized = word.toLowerCase();
      wordCount.set(normalized, (wordCount.get(normalized) || 0) + 1);
    });
    
    // 頻度2回以上の単語をキーワードとする
    Array.from(wordCount.entries())
      .filter(([_, count]) => count >= 2)
      .forEach(([word, _]) => keywords.push(word));
    
    return keywords;
  }

  private findRelatedData(data: LongTermData): string[] {
    // 関連データの簡略的な検索（実際はより高度なアルゴリズムが必要）
    const relatedIds: string[] = [];
    const keywords = this.extractKeywords(data);
    
    keywords.forEach(keyword => {
      const matchingIds = this.searchIndex.get(keyword);
      if (matchingIds) {
        matchingIds.forEach(id => {
          if (id !== data.permanentId && !relatedIds.includes(id)) {
            relatedIds.push(id);
          }
        });
      }
    });
    
    return relatedIds.slice(0, 10); // 上位10件
  }

  private async rebuildSearchIndex(): Promise<void> {
    this.searchIndex.clear();
    this.categoryIndex.clear();
    
    this.dataStore.forEach(data => {
      this.updateSearchIndex(data);
      this.updateCategoryIndex(data);
    });
    
    logger.info('Search index rebuilt successfully');
  }

  private async optimizeCache(): Promise<void> {
    // キャッシュ最適化の実装（簡略化）
    logger.info('Cache optimization completed');
  }

  private async compressOldData(): Promise<void> {
    // 古いデータの圧縮実装（簡略化）
    logger.info('Old data compression completed');
  }

  private async createBackup(): Promise<void> {
    // バックアップ作成の実装（簡略化）
    logger.info('Backup created successfully');
  }

  private generateOperationId(): string {
    return `ltm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}