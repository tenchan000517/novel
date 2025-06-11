/**
 * Version 2.0 - 共通型定義
 * 
 * 全システムで使用される基本的な型とインターフェース
 * 12独立システム設計における基盤型定義
 */

// ============================================================================
// 基本識別子型
// ============================================================================

export type SystemId = string;
export type ServiceId = string;
export type OperationId = string;
export type RequestId = string;

// ============================================================================
// システム状態管理
// ============================================================================

export enum SystemStatus {
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  DEGRADED = 'degraded',
  OFFLINE = 'offline',
  ERROR = 'error'
}

export interface SystemHealth {
  status: SystemStatus;
  lastHealthCheck: string;
  uptime: number;
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
  };
  resources: {
    memory: number;
    cpu: number;
    disk: number;
  };
}

// ============================================================================
// オペレーション結果型
// ============================================================================

export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    operationId: OperationId;
    timestamp: string;
    processingTime: number;
    systemId: SystemId;
    additionalInfo?: any;
  };
  warnings?: string[];
}

export interface BatchOperationResult<T = any> {
  success: boolean;
  results: OperationResult<T>[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    processingTime: number;
  };
  metadata: {
    batchId: string;
    timestamp: string;
    systemId: SystemId;
  };
}

// ============================================================================
// イベントシステム
// ============================================================================

export interface SystemEvent {
  id: string;
  type: string;
  source: SystemId;
  target?: SystemId;
  data: any;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface EventHandler<T = any> {
  (event: SystemEvent): Promise<OperationResult<T>>;
}

// ============================================================================
// データアクセス抽象化
// ============================================================================

export interface DatabaseQuery {
  collection: string;
  filter?: Record<string, any>;
  sort?: Record<string, 1 | -1>;
  limit?: number;
  offset?: number;
}

export interface DataAccessResult<T = any> {
  data: T[];
  total: number;
  hasMore: boolean;
  metadata: {
    queryTime: number;
    source: string;
    cacheHit: boolean;
  };
}

// ============================================================================
// 設定管理
// ============================================================================

export interface SystemConfiguration {
  systemId: SystemId;
  enabled: boolean;
  settings: Record<string, any>;
  dependencies: SystemId[];
  healthCheck: {
    interval: number;
    timeout: number;
    retries: number;
  };
}

export interface ConfigurationUpdate {
  systemId: SystemId;
  updates: Partial<SystemConfiguration>;
  timestamp: string;
  author: string;
}

// ============================================================================
// メトリクス・監視
// ============================================================================

export interface SystemMetrics {
  systemId: SystemId;
  timestamp: string;
  performance: {
    operationsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    successRate: number;
  };
  resources: {
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    networkIO: number;
  };
  custom: Record<string, number>;
}

export interface MetricsAggregation {
  timeRange: {
    start: string;
    end: string;
  };
  metrics: SystemMetrics[];
  aggregated: {
    average: SystemMetrics;
    peak: SystemMetrics;
    minimum: SystemMetrics;
  };
}

// ============================================================================
// 品質保証
// ============================================================================

export interface QualityMetrics {
  consistency: number;
  accuracy: number;
  completeness: number;
  relevance: number;
  readability: number;
  overall: number;
}

export interface QualityAssessment {
  content: string;
  metrics: QualityMetrics;
  issues: QualityIssue[];
  recommendations: string[];
  timestamp: string;
}

export interface QualityIssue {
  type: 'warning' | 'error' | 'suggestion';
  category: string;
  message: string;
  location?: {
    start: number;
    end: number;
  };
  severity: 'low' | 'medium' | 'high';
}

// ============================================================================
// ユーティリティ型
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

export interface Versioned {
  version: number;
  versionHistory: {
    version: number;
    timestamp: string;
    changes: string[];
  }[];
}

// ============================================================================
// ペジネーション
// ============================================================================

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// ============================================================================
// 検索・フィルタリング
// ============================================================================

export interface SearchQuery {
  query: string;
  filters: Record<string, any>;
  fuzzy?: boolean;
  boost?: Record<string, number>;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  facets: Record<string, SearchFacet[]>;
  suggestions: string[];
  metadata: {
    queryTime: number;
    searchQuery: SearchQuery;
  };
}

export interface SearchFacet {
  value: string;
  count: number;
}

// ============================================================================
// エクスポートされた型のユニオン
// ============================================================================

export type SystemResult = OperationResult | BatchOperationResult;
export type SystemData = DataAccessResult | PaginatedResult<any> | SearchResult<any>;