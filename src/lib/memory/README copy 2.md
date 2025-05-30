# 記憶階層システム仕様書（実装版）

## 📋 システム概要

### システム構成
記憶階層システムは以下の3層構造と統合システムで構成されています：

- **短期記憶層**（ShortTermMemory）
- **中期記憶層**（MidTermMemory） 
- **長期記憶層**（LongTermMemory）
- **統合システム**（Integration Components）

### ディレクトリ構造
```
src/lib/memory copy/
├── core/
│   ├── memory-manager.ts          # メインマネージャー
│   ├── types.ts                   # 型定義
│   ├── interfaces.ts              # 統一インターフェース
│   ├── unified-access-api.ts      # 統一アクセスAPI
│   └── data-integration-processor.ts # データ統合処理
├── integration/
│   ├── cache-coordinator.ts       # キャッシュ協調
│   ├── duplicate-resolver.ts      # 重複解決
│   ├── access-optimizer.ts        # アクセス最適化
│   └── quality-assurance.ts       # 品質保証
├── short-term/
│   └── short-term-memory.ts       # 短期記憶ファサード
├── mid-term/
│   └── mid-term-memory.ts         # 中期記憶ファサード
└── long-term/
    └── long-term-memory.ts        # 長期記憶ファサード
```

---

## 🔧 メインエントリーポイント

### MemoryManager（memory-manager.ts）

#### 基本情報
- **クラス名**: `MemoryManager`
- **役割**: 統合記憶階層システムの中核管理クラス
- **設定**: `MemoryManagerConfig`インターフェースで設定

#### 主要メソッド

##### 初期化
```typescript
async initialize(): Promise<void>  // ライン 161-190
```
- 4つのフェーズで初期化を実行
- サポートシステム → コア統合システム → 記憶階層 → システム統合の順

##### 章処理（最重要機能）
```typescript
async processChapter(chapter: Chapter): Promise<SystemOperationResult>  // ライン 198-330
```
- 実行内容:
  1. 短期記憶への追加（line 215）
  2. 中期記憶への統合処理（line 219）
  3. データ統合処理の実行（line 224）
  4. 重複解決処理（line 229）
  5. キャッシュ協調処理（line 235）
  6. 長期記憶への条件付き処理
  7. 品質チェック（有効な場合）
  8. 自動バックアップ（有効な場合）

##### 統合検索
```typescript
async unifiedSearch(query: string, memoryLevels: MemoryLevel[]): Promise<UnifiedSearchResult>  // ライン 338-425
```

##### システム最適化
```typescript
async optimizeSystem(): Promise<SystemOptimizationResult>  // ライン 433-540
```

##### システム診断
```typescript
async performSystemDiagnostics(): Promise<SystemDiagnostics>  // ライン 548-625
```

##### システム状態取得
```typescript
async getSystemStatus(): Promise<MemorySystemStatus>  // ライン 673-730
```

---

## 📊 記憶階層仕様

### 1. 短期記憶層（ShortTermMemory）

#### 基本情報
- **ファイル**: `short-term/short-term-memory.ts`
- **実装**: `IMemoryLayer`インターフェースを実装
- **統合コンポーネント**: 4つ
  - GenerationCache
  - ImmediateContext
  - ProcessingBuffers
  - TemporaryAnalysis

#### 設定
```typescript
interface ShortTermMemoryConfig {
    maxChapters: number;
    cacheEnabled: boolean;
    autoCleanupEnabled?: boolean;
    cleanupIntervalMinutes?: number;
    maxRetentionHours?: number;
}
```

#### 主要メソッド
```typescript
async initialize(): Promise<void>
async addChapter(chapter: Chapter): Promise<OperationResult>
async getDiagnostics(): Promise<DiagnosticsResult>
async getStatus(): Promise<StatusResult>
async getDataSize(): Promise<number>
async save(): Promise<void>
async cleanup(): Promise<void>
```

#### 章処理フロー
1. `updateImmediateContext(chapter)` - ImmediateContextに章追加
2. `cacheGeneration(chapter)` - 生成キャッシュの更新
3. `bufferProcessing(chapter)` - 処理バッファの作成・管理
4. `performAnalysis(chapter)` - 一時分析の実行

### 2. 中期記憶層（MidTermMemory）

#### 基本情報
- **ファイル**: `mid-term/mid-term-memory.ts`
- **実装**: `IMemoryLayer`インターフェースを実装
- **統合コンポーネント**: 5つ
  - AnalysisResultsManager
  - CharacterEvolutionManager
  - NarrativeProgressionManager
  - QualityMetricsManager（stub実装）
  - SystemStatisticsManager（stub実装）

#### 設定
```typescript
interface MidTermMemoryConfig {
    maxAnalysisResults: number;
    enableEvolutionTracking: boolean;
    enableProgressionAnalysis: boolean;
    qualityThreshold: number;
}
```

#### 章処理フロー
1. `processAnalysisResults(chapter)` - 分析結果の処理
2. `processCharacterEvolution(chapter)` - キャラクター進化の処理
3. `processNarrativeProgression(chapter)` - 物語進行の処理
4. `processQualityMetrics(chapter)` - 品質指標の処理
5. `processSystemStatistics(chapter)` - システム統計の処理

### 3. 長期記憶層（LongTermMemory）

#### 基本情報
- **ファイル**: `long-term/long-term-memory.ts`
- **統合コンポーネント**: 4つ
  - CharacterDatabase
  - HistoricalRecords
  - SystemKnowledge
  - WorldKnowledge

#### 設定
```typescript
interface LongTermMemoryConfig {
    enableAutoLearning: boolean;
    consolidationInterval: number; // 統合処理の間隔（分）
    archiveOldData: boolean;
    enablePredictiveAnalysis: boolean;
    qualityThreshold: number;
}
```

#### 主要機能
```typescript
async processChapterCompletion(chapterNumber: number, chapterData: Chapter, extractedData: any): Promise<void>
async performConsolidation(): Promise<{charactersConsolidated: number; conflictsResolved: number; patternsLearned: number; qualityScore: number}>
async search(query: string, options?: any): Promise<{characters: any[]; historical: any[]; knowledge: any[]; world: any[]; totalResults: number}>
async validateDataIntegrity(): Promise<{isValid: boolean; issues: string[]; suggestions: string[]}>
async getStatistics(): Promise<LongTermMemoryStats>
```

---

## 🔄 統合システム

### 1. 統一アクセスAPI（UnifiedAccessAPI）

#### 基本情報
- **ファイル**: `core/unified-access-api.ts`
- **役割**: 記憶階層への統一されたアクセスインターフェース

#### 主要メソッド
```typescript
async processRequest(request: MemoryAccessRequest): Promise<MemoryAccessResponse>  // ライン 78-175
async processBatchRequests(requests: MemoryAccessRequest[]): Promise<MemoryAccessResponse[]>  // ライン 183-225
async optimizeAccessPatterns(): Promise<{optimized: boolean; improvements: string[]}>  // ライン 233-290
async getDiagnostics(): Promise<IntegrationDiagnostics>  // ライン 298-330
```

#### アクセス戦略
1. 重複処理の解決
2. キャッシュチェック
3. 最適化されたアクセス戦略の決定
4. 階層的データアクセス
5. データ統合
6. キャッシュへの保存
7. アクセスパターンの学習

### 2. キャッシュ協調システム（CacheCoordinator）

#### 基本情報
- **ファイル**: `integration/cache-coordinator.ts`
- **役割**: 記憶階層間のキャッシュ管理と協調処理

#### 主要メソッド
```typescript
async coordinateCache(cacheKey: string, data: any, level: MemoryLevel): Promise<void>  // ライン 141-226
async predictiveCache(nextChapterNumber: number, config?: PreloadConfiguration): Promise<void>  // ライン 234-290
async get<T>(cacheKey: string, level: MemoryLevel): Promise<T | null>  // ライン 298-340
async invalidate(cacheKey: string, level: MemoryLevel, reason: string): Promise<void>  // ライン 348-395
getStatistics(): CacheStatistics  // ライン 403-407
```

#### キャッシュ有効期限
```typescript
private readonly CACHE_TTL = {
    [MemoryLevel.SHORT_TERM]: 5 * 60 * 1000,   // 5分
    [MemoryLevel.MID_TERM]: 30 * 60 * 1000,    // 30分
    [MemoryLevel.LONG_TERM]: 2 * 60 * 60 * 1000 // 2時間
};
```

### 3. 重複解決システム（DuplicateResolver）

#### 基本情報
- **ファイル**: `integration/duplicate-resolver.ts`
- **役割**: システム内の重複データと処理を統合・最適化

#### 主要メソッド
```typescript
async getConsolidatedWorldSettings(): Promise<ConsolidatedWorldSettings>  // ライン 85-190
async getConsolidatedCharacterInfo(characterId: string): Promise<ConsolidatedCharacterInfo>  // ライン 198-285
async getUnifiedMemoryAccess(query: MemoryQuery): Promise<MemoryResult>  // ライン 293-380
```

#### 解決対象
- 世界設定4箇所重複
- キャラクター情報2箇所重複
- 記憶アクセス3箇所分散

### 4. アクセス最適化システム（AccessOptimizer）

#### 基本情報
- **ファイル**: `integration/access-optimizer.ts`
- **役割**: 記憶階層への最適なアクセスパスを決定

#### 主要メソッド
```typescript
async optimizedAccess<T>(query: MemoryQuery, preferredStrategy?: AccessStrategy): Promise<OptimizedAccessResult<T>>  // ライン 97-185
async determineOptimalStrategy(query: MemoryQuery): Promise<AccessStrategy>  // ライン 193-250
async optimizeAccessPatterns(): Promise<{optimized: boolean; improvements: string[]}>
getStatistics(): AccessStatistics  // ライン 700-702
```

#### アクセス戦略
```typescript
enum AccessStrategy {
    CACHE_FIRST = 'cache-first',
    CONSISTENCY_FIRST = 'consistency-first',
    PERFORMANCE_FIRST = 'performance-first',
    BALANCED = 'balanced',
    PREDICTIVE = 'predictive'
}
```

### 5. 品質保証システム（QualityAssurance）

#### 基本情報
- **ファイル**: `integration/quality-assurance.ts`
- **役割**: 統合記憶階層システムの品質保証

#### 主要メソッド
```typescript
async performComprehensiveDiagnostic(): Promise<DiagnosticResult>
getCurrentMetrics(): QualityMetrics
async generateQualityReport(periodDays?: number): Promise<QualityAssuranceReport>
updateConfiguration(newConfig: Partial<MonitoringConfig>): void
stopMonitoring(): void
```

#### 品質メトリクス
- データ整合性（目標: 95%以上）
- システム安定性（目標: 90%以上）
- パフォーマンス（目標: 85%以上）
- 運用効率（目標: 80%以上）

### 6. データ統合処理システム（DataIntegrationProcessor）

#### 基本情報
- **ファイル**: `core/data-integration-processor.ts`
- **役割**: 記憶階層間でのデータ統合、整合性管理、データ移行

#### 主要メソッド
```typescript
async processChapterData(chapter: Chapter): Promise<ChapterDataProcessingResult>  // ライン 110-205
async validateDataIntegrity(): Promise<DataIntegrityResult>  // ライン 213-290
async attemptAutoRepair(issues: IntegrityIssue[]): Promise<{repaired: boolean; repairedCount: number}>  // ライン 298-340
async migrateExistingData(): Promise<DataMigrationResult>  // ライン 348-420
```

---

## 📋 型定義

### 主要な型

#### 記憶レベル
```typescript
enum MemoryLevel {
    SHORT_TERM = 'SHORT_TERM',
    MID_TERM = 'MID_TERM',
    LONG_TERM = 'LONG_TERM'
}
```

#### メモリアクセス要求
```typescript
interface MemoryAccessRequest {
    chapterNumber: number;
    requestType: MemoryRequestType;
    targetLayers: MemoryLevel[];
    filters?: MemoryAccessFilters;
    options?: MemoryAccessOptions;
}
```

#### メモリアクセス応答
```typescript
interface MemoryAccessResponse {
    success: boolean;
    context: UnifiedMemoryContext | null;
    fromCache: boolean;
    processingTime: number;
    error?: string;
    metadata?: {
        layersAccessed: MemoryLevel[];
        duplicatesResolved: number;
        cacheHits: number;
    };
}
```

#### 統合記憶コンテキスト
```typescript
interface UnifiedMemoryContext {
    chapterNumber: number;
    timestamp: string;
    shortTerm: { /* 短期記憶データ */ };
    midTerm: { /* 中期記憶データ */ };
    longTerm: { /* 長期記憶データ */ };
    integration: { /* 統合データ */ };
}
```

---

## 🔧 主要インターフェース

### IMemoryLayer（記憶層統一インターフェース）
```typescript
interface IMemoryLayer {
    initialize(): Promise<void>;
    addChapter(chapter: Chapter): Promise<OperationResult>;
    getDiagnostics(): Promise<DiagnosticsResult>;
    getStatus(): Promise<StatusResult>;
    getDataSize(): Promise<number>;
    save(): Promise<void>;
    cleanup(): Promise<void>;
}
```

### 統合コンポーネント共通インターフェース
```typescript
interface IIntegrationComponent {
    initialize(): Promise<void>;
    getDiagnostics(): Promise<DiagnosticsResult>;
    cleanup(): Promise<void>;
}
```

---

## 🔄 使用パターン

### 1. 基本的な使用方法

#### 初期化
```typescript
const memoryManager = new MemoryManager(config);
await memoryManager.initialize();
```

#### 章処理
```typescript
const result = await memoryManager.processChapter(chapter);
if (result.success) {
    console.log('Chapter processed successfully');
}
```

#### 統合検索
```typescript
const searchResult = await memoryManager.unifiedSearch(
    'キーワード', 
    [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
);
```

### 2. 直接アクセス

#### 統一アクセスAPI使用
```typescript
const request: MemoryAccessRequest = {
    chapterNumber: 1,
    requestType: MemoryRequestType.CHAPTER_CONTEXT,
    targetLayers: [MemoryLevel.SHORT_TERM]
};
const response = await unifiedAccessAPI.processRequest(request);
```

#### キャッシュ操作
```typescript
await cacheCoordinator.coordinateCache(
    'chapter_1', 
    chapterData, 
    MemoryLevel.SHORT_TERM
);
```

### 3. 重複解決
```typescript
const worldSettings = await duplicateResolver.getConsolidatedWorldSettings();
const characterInfo = await duplicateResolver.getConsolidatedCharacterInfo('character_id');
```

### 初期化順序
1. サポートシステム初期化
2. コア統合システム初期化
3. 記憶階層初期化
4. システム統合初期化
5. 初期システム検証

### エラーハンドリング
- 全メソッドでtry-catch実装
- Promise.allSettledで並列処理の失敗を個別管理
- フォールバック処理を提供

---

## 📈 監視・診断

### システム診断項目
- データ整合性チェック
- システム安定性チェック
- パフォーマンスチェック
- 運用効率チェック
- コンポーネント健康状態チェック

### 品質メトリクス
- データ整合性スコア（目標: 95%以上）
- システム安定性スコア（目標: 90%以上）
- パフォーマンススコア（目標: 85%以上）
- 運用効率スコア（目標: 80%以上）

---

## 🔧 設定例

### MemoryManagerConfig
```typescript
const config: MemoryManagerConfig = {
    shortTermConfig: {
        maxChapters: 10,
        cacheEnabled: true,
        autoCleanupEnabled: true,
        cleanupIntervalMinutes: 30,
        maxRetentionHours: 72
    },
    midTermConfig: {
        maxAnalysisResults: 100,
        enableEvolutionTracking: true,
        enableProgressionAnalysis: true,
        qualityThreshold: 0.8
    },
    longTermConfig: {
        enableAutoLearning: true,
        consolidationInterval: 30,
        archiveOldData: true,
        enablePredictiveAnalysis: true,
        qualityThreshold: 0.8
    },
    integrationEnabled: true,
    enableQualityAssurance: true,
    enableAutoBackup: true,
    enablePerformanceOptimization: true,
    enableDataMigration: true
};
```

---

この仕様書は実装コードから抽出した事実ベースの情報のみを含んでいます。システム全体での使用に関する調査結果をお待ちしています。