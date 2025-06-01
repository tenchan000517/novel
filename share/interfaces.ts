/**
 * @fileoverview 統一記憶階層システム - 統一インターフェース定義
 * @description
 * 全ての記憶層と統合コンポーネントが従うべき契約を定義。
 * UnifiedMemoryManagerが期待する統合APIを実現するための核となるインターフェース。
 */

import { Chapter } from '@/types/chapters';
import { Character } from '@/types/characters';

// ============================================================================
// 基本操作結果型
// ============================================================================

/**
 * 基本的な操作結果型
 */
interface OperationResult {  // ✅ export を削除
  success: boolean;
  error?: string;
  processingTime?: number;
  metadata?: Record<string, any>;
}

/**
 * 診断結果型
 */
interface DiagnosticsResult {  // ✅ export を削除
  healthy: boolean;
  issues: string[];
  metrics: Record<string, number>;
  lastCheck: string;
}

/**
 * ステータス結果型
 */
interface StatusResult {  // ✅ export を削除
  initialized: boolean;
  dataCount: number;
  lastUpdate: string;
  memoryUsage?: number;
}

// ============================================================================
// 記憶層統一インターフェース
// ============================================================================

/**
 * 記憶層統一インターフェース
 * 全ての記憶層（短期・中期・長期）が実装すべき基本契約
 */
interface IMemoryLayer {  // ✅ export を削除
  initialize(): Promise<void>;
  addChapter(chapter: Chapter): Promise<OperationResult>;
  getDiagnostics(): Promise<DiagnosticsResult>;
  getStatus(): Promise<StatusResult>;
  getDataSize(): Promise<number>;
  save(): Promise<void>;
  cleanup(): Promise<void>;
  
  // 追加メソッド（必要に応じて各層で実装）
  getContext?(request: any): Promise<any>;
  compress?(): Promise<OperationResult>;
}

// ============================================================================
// 統合コンポーネント共通インターフェース
// ============================================================================

/**
 * 統合コンポーネント共通インターフェース
 */
interface IIntegrationComponent {  // ✅ export を削除
  initialize(): Promise<void>;
  getDiagnostics(): Promise<DiagnosticsResult>;
  cleanup(): Promise<void>;
}

// ============================================================================
// キャッシュコーディネーター固有インターフェース
// ============================================================================

/**
 * キャッシュ統計データ型
 */
interface CacheStatisticsData {  // ✅ export を削除
  hitRatio: number;
  missRatio: number;
  totalRequests: number;
  cacheSize: number;
  lastOptimization: string;
  hitRate?: number; // 互換性のため
  avgAccessTime?: number; // 互換性のため
  memoryUsage?: {
    shortTerm: number;
    midTerm: number;
    longTerm: number;
  };
  evictionCount?: number;
}

/**
 * キャッシュコーディネーター固有インターフェース
 */
interface ICacheCoordinator extends IIntegrationComponent {  // ✅ export を削除
  invalidateChapterCache(chapterNumber: number): Promise<void>;
  validateCacheHealth(): Promise<{ isHealthy: boolean; issues: string[] }>;
  optimizeCache(): Promise<{ optimized: boolean; improvements: string[] }>;
  getStatistics(): Promise<CacheStatisticsData>;
  saveCache(): Promise<void>;
  
  // 基本キャッシュ操作
  get<T>(key: string, level?: string): Promise<T | null>;
  coordinateCache(key: string, data: any, level?: string): Promise<void>;
  invalidate(key: string, level?: string, reason?: string): Promise<void>;
  clear(level?: string): Promise<void>;
  predictiveCache?(target: any, config?: any): Promise<void>;
}

// ============================================================================
// 重複解決器固有インターフェース
// ============================================================================

/**
 * 統一メモリクエリの型定義
 */
interface MemoryQuery {  // ✅ export を削除
  type: 'worldSettings' | 'characterInfo' | 'chapterMemories' | 'arcMemory' | 'keyEvents' | 'search';
  target?: string | number;
  parameters?: Record<string, any>;
  options?: {
    useCache?: boolean;
    forceRefresh?: boolean;
    includeMetadata?: boolean;
  };
}

/**
 * 統一メモリ結果の型定義
 */
interface MemoryResult {  // ✅ export を削除
  success: boolean;
  data: any;
  source: 'cache' | 'short-term' | 'mid-term' | 'long-term' | 'unified';
  timestamp: string;
  metadata?: {
    cacheHit: boolean;
    processingTime: number;
    dataFreshness: number;
    conflictsResolved: string[];
  };
}

/**
 * 重複解決器固有インターフェース
 */
interface IDuplicateResolver extends IIntegrationComponent {  // ✅ export を削除
  detectChapterDuplicates(chapter: Chapter): Promise<any[]>;
  resolveDuplicates(duplicates: any[]): Promise<void>;
  performCleanup(): Promise<{ cleaned: boolean; removedCount: number }>;
  
  // 統一アクセスメソッド
  getUnifiedMemoryAccess(query: MemoryQuery): Promise<MemoryResult>;
  getConsolidatedWorldSettings(): Promise<any>;
  getConsolidatedCharacterInfo(characterId: string): Promise<any>;
}

// ============================================================================
// アクセス最適化インターフェース
// ============================================================================

/**
 * アクセス統計データ型
 */
interface AccessStatisticsData {  // ✅ export を削除
  totalAccesses: number;
  averageAccessTime: number;
  cacheHitRate: number;
  consistencyScore: number;
  optimizationEffectiveness: number;
  performanceGain: number;
  strategyDistribution: Record<string, number>;
  levelDistribution: Record<string, number>;
}

/**
 * アクセス最適化インターフェース
 */
interface IAccessOptimizer extends IIntegrationComponent {  // ✅ export を削除
  optimizedAccess<T>(query: MemoryQuery, strategy?: string): Promise<any>;
  getStatistics(): AccessStatisticsData;
  updateConfiguration(config: any): void;
}

// ============================================================================
// 品質保証インターフェース
// ============================================================================

/**
 * 品質メトリクス型
 */
interface QualityMetricsData {  // ✅ export を削除
  dataIntegrity: {
    score: number;
    violations: number;
    lastValidation: number;
    criticalIssues: string[];
  };
  systemStability: {
    score: number;
    uptime: number;
    errorRate: number;
    recoveryTime: number;
    crashCount: number;
  };
  performance: {
    score: number;
    averageResponseTime: number;
    throughput: number;
    resourceUtilization: number;
    bottlenecks: string[];
  };
  operationalEfficiency: {
    score: number;
    automationLevel: number;
    maintenanceOverhead: number;
    alertAccuracy: number;
    resolutionTime: number;
  };
}

/**
 * 診断結果型（拡張版）
 */
interface ComprehensiveDiagnosticResult {  // ✅ export を削除
  overallHealth: number;
  issues: Array<{
    id: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    category: 'DATA_INTEGRITY' | 'SYSTEM_STABILITY' | 'PERFORMANCE' | 'OPERATIONAL';
    title: string;
    description: string;
    impact: string;
    recommendation: string;
    detectedAt: number;
    component: string;
    metadata: Record<string, any>;
  }>;
  recommendations: string[];
  nextCheckTime: number;
  detailedMetrics: QualityMetricsData;
  trends: {
    improving: string[];
    degrading: string[];
    stable: string[];
  };
}

/**
 * 品質保証インターフェース
 */
interface IQualityAssurance extends IIntegrationComponent {  // ✅ export を削除
  performComprehensiveDiagnostic(): Promise<ComprehensiveDiagnosticResult>;
  getCurrentMetrics(): QualityMetricsData;
  updateConfiguration(config: any): void;
  getLastDiagnosticResult(): ComprehensiveDiagnosticResult | null;
  getIssueHistory(limit?: number): any[];
  generateQualityReport(periodDays?: number): Promise<any>;
  stopMonitoring(): void;
}

// ============================================================================
// 短期記憶特有インターフェース
// ============================================================================

/**
 * 短期記憶設定型
 */
interface ShortTermMemoryConfig {  // ✅ export を削除
  maxChapters: number;
  cacheEnabled: boolean;
}

/**
 * 短期記憶インターフェース
 */
interface IShortTermMemory extends IMemoryLayer {  // ✅ export を削除
  getRecentChapters(limit?: number): Promise<any[]>;
  getCurrentContext(): Promise<any>;
  updateBuffers(data: any): Promise<void>;
  getAnalysisResults(): Promise<any>;
}

// ============================================================================
// 中期記憶特有インターフェース
// ============================================================================

/**
 * 中期記憶インターフェース
 */
interface IMidTermMemory extends IMemoryLayer {  // ✅ export を削除
  getChapterSummaries(range?: { start: number; end: number }): Promise<any[]>;
  getCharacterEvolution(characterId?: string): Promise<any>;
  getNarrativeProgression(): Promise<any>;
  getQualityMetrics(): Promise<any>;
  getSystemStatistics(): Promise<any>;
  updateAnalysisResults(results: any): Promise<void>;
}

// ============================================================================
// 長期記憶特有インターフェース
// ============================================================================

/**
 * 長期記憶インターフェース
 */
interface ILongTermMemory extends IMemoryLayer {  // ✅ export を削除
  getCharacterDatabase(): Promise<any>;
  getWorldKnowledge(): Promise<any>;
  getSystemKnowledge(): Promise<any>;
  getHistoricalRecords(): Promise<any>;
  addForeshadowing(foreshadowing: any): Promise<any>;
  resolveForeshadowing(id: string, resolution: any): Promise<void>;
  getUnresolvedForeshadowing(): Promise<any[]>;
  performLearningAndImprovement(): Promise<any>;
}

// ============================================================================
// 統合記憶マネージャーインターフェース
// ============================================================================

/**
 * 統合記憶マネージャーインターフェース
 * 全体システムの制御と調整を担当
 */
interface IUnifiedMemoryManager {  // ✅ export を削除
  // 基本操作
  initialize(): Promise<void>;
  addChapter(chapter: Chapter): Promise<OperationResult>;
  save(): Promise<void>;
  cleanup(): Promise<void>;
  
  // 診断・監視
  performComprehensiveDiagnostic(): Promise<ComprehensiveDiagnosticResult>;
  getSystemStatus(): Promise<{
    shortTerm: StatusResult;
    midTerm: StatusResult;
    longTerm: StatusResult;
    integration: StatusResult;
  }>;
  
  // 統合アクセス
  getUnifiedAccess(query: MemoryQuery): Promise<MemoryResult>;
  optimizedAccess<T>(query: MemoryQuery, strategy?: string): Promise<T>;
  
  // キャッシュ管理
  invalidateCache(target?: any): Promise<void>;
  optimizeCache(): Promise<{ optimized: boolean; improvements: string[] }>;
  getCacheStatistics(): Promise<CacheStatisticsData>;
  
  // 品質管理
  getCurrentQualityMetrics(): Promise<QualityMetricsData>;
  generateQualityReport(periodDays?: number): Promise<any>;
}

// ============================================================================
// ユーティリティ型
// ============================================================================

/**
 * 記憶レベル列挙型
 */
export enum MemoryLevel {  // ✅ enum は直接エクスポート可能
  SHORT_TERM = 'short-term',
  MID_TERM = 'mid-term',
  LONG_TERM = 'long-term'
}

/**
 * アクセス戦略列挙型
 */
export enum AccessStrategy {  // ✅ enum は直接エクスポート可能
  CACHE_FIRST = 'cache-first',
  CONSISTENCY_FIRST = 'consistency-first',
  PERFORMANCE_FIRST = 'performance-first',
  BALANCED = 'balanced',
  PREDICTIVE = 'predictive'
}

/**
 * 品質しきい値定数
 */
export const QUALITY_THRESHOLDS = {  // ✅ const は直接エクスポート可能
  DATA_INTEGRITY_MIN: 0.95,
  SYSTEM_STABILITY_MIN: 0.90,
  PERFORMANCE_MIN: 0.85,
  OPERATIONAL_EFFICIENCY_MIN: 0.80
} as const;

/**
 * キャッシュTTL定数
 */
export const CACHE_TTL = {  // ✅ const は直接エクスポート可能
  SHORT_TERM: 5 * 60 * 1000,   // 5分
  MID_TERM: 30 * 60 * 1000,    // 30分
  LONG_TERM: 2 * 60 * 60 * 1000 // 2時間
} as const;

// ============================================================================
// 型ガード関数
// ============================================================================

/**
 * OperationResultの型ガード
 */
export function isOperationResult(obj: any): obj is OperationResult {  // ✅ 関数は直接エクスポート可能
  return obj && typeof obj === 'object' && typeof obj.success === 'boolean';
}

/**
 * DiagnosticsResultの型ガード
 */
export function isDiagnosticsResult(obj: any): obj is DiagnosticsResult {  // ✅ 関数は直接エクスポート可能
  return obj && typeof obj === 'object' && 
         typeof obj.healthy === 'boolean' && 
         Array.isArray(obj.issues) &&
         typeof obj.lastCheck === 'string';
}

/**
 * StatusResultの型ガード
 */
export function isStatusResult(obj: any): obj is StatusResult {  // ✅ 関数は直接エクスポート可能
  return obj && typeof obj === 'object' && 
         typeof obj.initialized === 'boolean' && 
         typeof obj.dataCount === 'number' &&
         typeof obj.lastUpdate === 'string';
}

// ============================================================================
// 統一エクスポート宣言（重複エラーを回避するため、ここでのみエクスポート）
// ============================================================================

export type {
  // 基本型
  OperationResult,
  DiagnosticsResult,
  StatusResult,
  
  // 統一インターフェース
  IMemoryLayer,
  IIntegrationComponent,
  ICacheCoordinator,
  IDuplicateResolver,
  IAccessOptimizer,
  IQualityAssurance,
  
  // 記憶層固有インターフェース
  IShortTermMemory,
  IMidTermMemory,
  ILongTermMemory,
  
  // 統合マネージャー
  IUnifiedMemoryManager,
  
  // データ型
  CacheStatisticsData,
  AccessStatisticsData,
  QualityMetricsData,
  MemoryQuery,
  MemoryResult,
  ComprehensiveDiagnosticResult,
  ShortTermMemoryConfig
};