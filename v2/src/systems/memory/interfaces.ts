/**
 * 記憶階層システムのインターフェース定義
 * 短期・中期・長期の3層構造で物語の記憶を管理
 */

import type { OperationResult } from '@/types/common';

// 記憶レベル定義
export enum MemoryLevel {
  SHORT_TERM = 'short_term',
  MID_TERM = 'mid_term',
  LONG_TERM = 'long_term'
}

// 基本的な記憶データ型
export interface MemoryData {
  id: string;
  timestamp: Date;
  level: MemoryLevel;
  dataType: string;
  content: any;
  metadata: {
    importance: number;
    retentionPeriod?: number;
    tags: string[];
    source: string;
  };
}

// 検索クエリ
export interface SearchQuery {
  keywords?: string[];
  dataTypes?: string[];
  levels?: MemoryLevel[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  minImportance?: number;
  tags?: string[];
  limit?: number;
}

// 検索結果
export interface SearchResult {
  data: MemoryData;
  relevanceScore: number;
  matchedKeywords: string[];
}

// 短期記憶データ
export interface ShortTermData extends MemoryData {
  chapterNumber?: number;
  characterStates?: Map<string, any>;
  tensionLevel?: number;
  learningProgress?: Map<string, number>;
  immediateContext?: string;
}

// 中期記憶データ
export interface MidTermData extends MemoryData {
  sectionId: string;
  characterEvolution: Map<string, any>;
  learningStages: Map<string, any>;
  narrativeProgress: any;
  keyEvents: any[];
}

// 長期記憶データ
export interface LongTermData extends MemoryData {
  dataCategory: 'character' | 'world' | 'framework' | 'knowledge' | 'system';
  permanentId: string;
  version: number;
  lastUpdated: Date;
}

// 記憶統計情報
export interface MemoryStatistics {
  totalItems: number;
  itemsByLevel: Map<MemoryLevel, number>;
  storageUsage: number;
  lastCleanup: Date;
  performanceMetrics: {
    averageSearchTime: number;
    cacheHitRate: number;
    compressionRatio: number;
  };
}

// 整合性レポート
export interface IntegrityReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  duplicates: number;
  orphanedData: number;
  recommendations: string[];
}

// 統合メモリマネージャーインターフェース
export interface IMemoryManager {
  // データ保存
  storeShortTerm(data: ShortTermData): Promise<OperationResult<void>>;
  storeMidTerm(data: MidTermData): Promise<OperationResult<void>>;
  storeLongTerm(data: LongTermData): Promise<OperationResult<void>>;
  
  // 統一検索
  searchUnified(query: SearchQuery): Promise<OperationResult<SearchResult[]>>;
  
  // コンテキスト取得
  getRecentContext(depth: number): Promise<OperationResult<ShortTermData[]>>;
  
  // データ昇格
  promoteToHigherLevel(memoryId: string, targetLevel: MemoryLevel): Promise<OperationResult<void>>;
  
  // メンテナンス
  cleanup(): Promise<OperationResult<void>>;
  getStatistics(): Promise<OperationResult<MemoryStatistics>>;
  validateIntegrity(): Promise<OperationResult<IntegrityReport>>;
}

// 短期記憶インターフェース
export interface IShortTermMemory {
  store(data: ShortTermData): Promise<OperationResult<void>>;
  getRecent(count: number): Promise<OperationResult<ShortTermData[]>>;
  getByTimeRange(startTime: Date, endTime: Date): Promise<OperationResult<ShortTermData[]>>;
  updateData(dataId: string, updates: Partial<ShortTermData>): Promise<OperationResult<void>>;
  cleanup(): Promise<OperationResult<void>>;
  getContinuityData(): Promise<OperationResult<Map<string, any>>>;
  getCharacterStates(): Promise<OperationResult<Map<string, any>>>;
}

// 中期記憶インターフェース
export interface IMidTermMemory {
  store(data: MidTermData): Promise<OperationResult<void>>;
  getSectionAnalysis(sectionId: string): Promise<OperationResult<MidTermData[]>>;
  getCharacterEvolution(characterId: string): Promise<OperationResult<any>>;
  getTensionPattern(): Promise<OperationResult<any>>;
  getLearningProgress(): Promise<OperationResult<Map<string, any>>>;
  promoteToLongTerm(): Promise<OperationResult<void>>;
}

// 長期記憶インターフェース
export interface ILongTermMemory {
  store(data: LongTermData): Promise<OperationResult<void>>;
  getByCategory(category: string): Promise<OperationResult<LongTermData[]>>;
  searchKnowledge(query: string): Promise<OperationResult<LongTermData[]>>;
  getWorldSettings(): Promise<OperationResult<any>>;
  getFrameworkDatabase(): Promise<OperationResult<Map<string, any>>>;
  optimizeAccess(): Promise<OperationResult<void>>;
}