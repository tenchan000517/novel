/**
 * 記憶階層システム固有の型定義
 */

import type { MemoryLevel, MemoryData } from './interfaces';

// 連続性データ
export interface ContinuityData {
  chapterNumber: number;
  characterMoods: Map<string, string>;
  plotProgress: string;
  unresolvedEvents: string[];
  activeRelationships: Map<string, string>;
}

// キャラクター状態マップ
export interface CharacterStateMap {
  [characterId: string]: {
    currentMood: string;
    location: string;
    learningProgress: Map<string, number>;
    activeSkills: string[];
    recentActions: string[];
  };
}

// テンション状態
export interface TensionState {
  currentLevel: number;
  trajectory: 'rising' | 'falling' | 'stable';
  recentPeaks: number[];
  averageLevel: number;
}

// 篇分析結果
export interface SectionAnalysis {
  sectionId: string;
  chapters: number[];
  mainTheme: string;
  characterGrowth: Map<string, any>;
  learningAchievements: string[];
  emotionalPeaks: number[];
}

// 進化履歴
export interface EvolutionHistory {
  characterId: string;
  stages: Array<{
    timestamp: Date;
    fromState: any;
    toState: any;
    trigger: string;
    growthType: string;
  }>;
}

// テンションパターン
export interface TensionPattern {
  pattern: 'escalating' | 'cyclic' | 'steady' | 'chaotic';
  averageTension: number;
  variability: number;
  predictedNext: number;
}

// 学習進捗
export interface LearningProgress {
  frameworkId: string;
  characterId: string;
  currentStage: number;
  completionPercentage: number;
  failureCount: number;
  breakthroughs: string[];
}

// メモリ操作
export interface MemoryOperation {
  operationType: 'store' | 'retrieve' | 'promote' | 'delete' | 'update';
  memoryLevel: MemoryLevel;
  dataId: string;
  timestamp: Date;
  success: boolean;
  duration: number;
}

// メモリスナップショット
export interface MemorySnapshot {
  timestamp: Date;
  shortTermCount: number;
  midTermCount: number;
  longTermCount: number;
  totalSize: number;
  activeCharacters: string[];
  currentChapter: number;
}

// データインデックス
export interface DataIndex {
  id: string;
  dataType: string;
  timestamp: Date;
  importance: number;
  keywords: string[];
  relationships: string[];
}

// キャッシュ統合設定
export interface CacheConfiguration {
  maxSize: number;
  ttl: number;
  strategy: 'LRU' | 'LFU' | 'FIFO';
  compressionEnabled: boolean;
}

// データ移行設定
export interface MigrationConfig {
  sourceLevel: MemoryLevel;
  targetLevel: MemoryLevel;
  criteria: {
    minImportance?: number;
    minAge?: number;
    dataTypes?: string[];
  };
  batchSize: number;
  schedule?: string;
}

// 検索最適化設定
export interface SearchOptimization {
  indexingEnabled: boolean;
  cacheResults: boolean;
  fuzzySearchEnabled: boolean;
  maxResultSize: number;
  relevanceThreshold: number;
}

// メモリ設定
export interface MemoryConfiguration {
  shortTerm: {
    maxItems: number;
    retentionHours: number;
    cleanupInterval: number;
  };
  midTerm: {
    maxItems: number;
    retentionDays: number;
    promotionThreshold: number;
  };
  longTerm: {
    compressionEnabled: boolean;
    backupEnabled: boolean;
    backupInterval: number;
  };
  search: SearchOptimization;
  cache: CacheConfiguration;
}