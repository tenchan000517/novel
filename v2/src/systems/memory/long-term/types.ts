/**
 * 長期記憶システムの型定義
 */

import type { LongTermData } from '../interfaces';

// 長期記憶設定
export interface LongTermMemoryConfig {
  compressionEnabled: boolean;
  backupEnabled: boolean;
  backupInterval: number;
  maxItems: number;
  indexingEnabled: boolean;
  knowledgeGraphEnabled: boolean;
}

// 検索結果
export interface LongTermSearchResult {
  data: LongTermData;
  relevanceScore: number;
  matchedKeywords: string[];
  relatedItems: string[];
}

// 知識グラフノード
export interface KnowledgeGraphNode {
  id: string;
  type: string;
  importance: number;
  connections: Set<string>;
  lastAccessed: Date;
  accessCount: number;
}

// バックアップ情報
export interface BackupInfo {
  timestamp: Date;
  itemCount: number;
  dataSize: number;
  compressionRatio: number;
  integrity: boolean;
  location: string;
}

// インデックス統計
export interface IndexStatistics {
  totalKeywords: number;
  averageKeywordsPerItem: number;
  mostFrequentKeywords: Array<{ keyword: string; frequency: number }>;
  categoryDistribution: Map<string, number>;
  indexSize: number;
  lastRebuild: Date;
}

// アクセスパターン
export interface AccessPattern {
  itemId: string;
  accessCount: number;
  lastAccessed: Date;
  accessFrequency: number;
  popularityScore: number;
}

// データ整合性レポート
export interface LongTermIntegrityReport {
  totalItems: number;
  corruptedItems: number;
  missingReferences: number;
  duplicates: number;
  inconsistencies: string[];
  overallHealth: number;
  recommendations: string[];
}

// パフォーマンスメトリックス
export interface LongTermPerformanceMetrics {
  averageSearchTime: number;
  averageRetrievalTime: number;
  cacheHitRate: number;
  indexEfficiency: number;
  storageUtilization: number;
  queryThroughput: number;
}

// 最適化結果
export interface OptimizationResult {
  optimizationType: 'index' | 'cache' | 'compression' | 'cleanup';
  itemsProcessed: number;
  spaceSaved: number;
  performanceImprovement: number;
  duration: number;
  recommendations: string[];
}