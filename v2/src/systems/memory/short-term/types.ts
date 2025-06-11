/**
 * 短期記憶システムの型定義
 */

import type { ShortTermData } from '../interfaces';

// 短期記憶設定
export interface ShortTermMemoryConfig {
  maxRetentionHours: number;
  maxItems: number;
  cleanupInterval: number;
  compressionEnabled: boolean;
  backupEnabled: boolean;
}

// クリーンアップ結果
export interface CleanupResult {
  removedCount: number;
  totalItems: number;
  storageSize: number;
  duration: number;
}

// 連続性検証結果
export interface ContinuityValidation {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
  missingChapters: number[];
}

// データ重要度計算結果
export interface ImportanceCalculation {
  baseImportance: number;
  chapterBonus: number;
  characterStateBonus: number;
  learningProgressBonus: number;
  finalImportance: number;
}

// ストレージ統計
export interface StorageStatistics {
  totalItems: number;
  totalSize: number;
  averageAge: number;
  oldestItem: Date;
  newestItem: Date;
  dataTypeDistribution: Map<string, number>;
}

// パフォーマンスメトリックス
export interface PerformanceMetrics {
  averageStoreTime: number;
  averageRetrievalTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  operationsPerSecond: number;
}

// バックアップメタデータ
export interface BackupMetadata {
  timestamp: Date;
  itemCount: number;
  dataSize: number;
  compressionRatio: number;
  checksum: string;
}