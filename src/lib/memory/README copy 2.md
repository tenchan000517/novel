# 記憶階層システム完全仕様書（事実ベース版）

## 📋 システム概要

### 基本構成
記憶階層システムは以下の構造で実装されています：

```
src/lib/memory copy/
├── core/                           # 中核システム
│   ├── memory-manager.ts          # メインマネージャー
│   ├── types.ts                   # 型定義
│   ├── interfaces.ts              # 統一インターフェース  
│   ├── unified-access-api.ts      # 統一アクセスAPI
│   └── data-integration-processor.ts
├── integration/                    # 統合システム
│   ├── cache-coordinator.ts       # キャッシュ協調
│   ├── duplicate-resolver.ts      # 重複解決
│   ├── access-optimizer.ts        # アクセス最適化
│   └── quality-assurance.ts       # 品質保証
├── short-term/                     # 短期記憶層
│   └── short-term-memory.ts
├── mid-term/                       # 中期記憶層
│   └── mid-term-memory.ts
└── long-term/                      # 長期記憶層
    └── long-term-memory.ts
```

---

## 🔧 統合コンポーネントの正確なコンストラクタ仕様

### 1. MemoryManager
```typescript
// ファイル: memory-manager.ts
constructor(config: MemoryManagerConfig) {
    this.config = config;
    logger.info('MemoryManager created with comprehensive configuration');
}
```
- **設定適用**: コンストラクタではデフォルト値を適用しない
- **ログ出力**: 初期化時に包括的設定でのログ出力

### 2. DataIntegrationProcessor  
```typescript
// ファイル: data-integration-processor.ts
constructor(config: DataIntegrationProcessorConfig) {
    this.config = {
        ...config,
        integrationEnabled: config.integrationEnabled ?? true,
        validationEnabled: config.validationEnabled ?? true,
        autoMigrationEnabled: config.autoMigrationEnabled ?? true,
        compressionThreshold: config.compressionThreshold ?? 1000,
        integrityCheckInterval: config.integrityCheckInterval ?? 24 * 60 * 60 * 1000 // 24時間
    };
}
```

### 3. UnifiedAccessAPI
```typescript
// ファイル: unified-access-api.ts  
constructor(config: UnifiedAccessAPIConfig) {
    this.config = {
        ...config,
        cacheEnabled: config.cacheEnabled ?? true,
        optimizationEnabled: config.optimizationEnabled ?? true,
        maxRetries: config.maxRetries ?? 3,
        timeoutMs: config.timeoutMs ?? 30000
    };
}
```

### 4. AccessOptimizer
```typescript
// ファイル: access-optimizer.ts
constructor(
    private cacheCoordinator: CacheCoordinator,
    private duplicateResolver: DuplicateResolver,
    config?: Partial<OptimizationConfig>
) {
    this.config = {
        enablePredictiveAccess: true,
        enableConsistencyValidation: true,
        enablePerformanceMonitoring: true,
        cacheWarmupEnabled: true,
        consistencyThreshold: 0.95,
        performanceThreshold: 100,
        ...config
    };
}
```

### 5. CacheCoordinator
```typescript
// ファイル: cache-coordinator.ts
constructor(
    private memoryComponents: {
        immediateContext?: any;
        narrativeMemory?: any;
        worldKnowledge?: any;
        eventMemory?: any;
        characterManager?: any;
    }
) {
    this.initializeCaches();
    this.initializeStatistics();
    this.startPeriodicCleanup();
}
```
- **自動実行**: コンストラクタで3つの初期化メソッドを実行

### 6. DuplicateResolver
```typescript
// ファイル: duplicate-resolver.ts
constructor(
    private memoryComponents: {
        immediateContext?: any;
        narrativeMemory?: any;
        worldKnowledge?: any;
        eventMemory?: any;
        characterManager?: any;
    }
) {
    logger.info('DuplicateResolver initialized');
}
```

### 7. QualityAssurance
```typescript
// ファイル: quality-assurance.ts
constructor(
    private cacheCoordinator: CacheCoordinator,
    private duplicateResolver: DuplicateResolver,
    private accessOptimizer: AccessOptimizer,
    private memoryComponents: {
        immediateContext?: any;
        narrativeMemory?: any;
        worldKnowledge?: any;
        eventMemory?: any;
        characterManager?: any;
    },
    config?: Partial<MonitoringConfig>
) {
    this.config = {
        enableRealTimeMonitoring: true,
        enablePredictiveAnalysis: true,
        enableAutomaticRecovery: true,
        checkInterval: 5 * 60 * 1000, // 5分間隔
        alertThresholds: {
            dataIntegrity: 0.95,
            systemStability: 0.90,
            performance: 0.85,
            operationalEfficiency: 0.80
        },
        retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7日間
        ...config
    };
}
```

### 8. 記憶層コンストラクタ

#### ShortTermMemory
```typescript
// ファイル: short-term-memory.ts
constructor(config: ShortTermMemoryConfig) {
    this.config = {
        autoCleanupEnabled: true,
        cleanupIntervalMinutes: 30,
        maxRetentionHours: 72,
        ...config
    };
}
```

#### MidTermMemory
```typescript
// ファイル: mid-term-memory.ts
constructor(config: MidTermMemoryConfig) {
    this.config = config;
}
```

#### LongTermMemory
```typescript
// ファイル: long-term-memory.ts
constructor(config?: Partial<LongTermMemoryConfig>) {
    this.config = {
        enableAutoLearning: true,
        consolidationInterval: 30, // 30分
        archiveOldData: true,
        enablePredictiveAnalysis: true,
        qualityThreshold: 0.8,
        ...config
    };
}
```

---

## 🎯 Phase 1 基盤統合で最初に実装すべき項目

### 最優先実装項目（TOP 4）

#### 1. MemoryManager.processChapter()
- **ファイル**: `memory-manager.ts`
- **行番号**: 198-330
- **優先度**: 最重要
- **役割**: 章処理の統一エントリーポイント

**内部呼び出し順序**:
```typescript
// line 215: shortTermMemory.addChapter()
// line 219: midTermMemory.addChapter()  
// line 224: dataIntegrationProcessor.processChapterData()
// line 229: duplicateResolver.getUnifiedMemoryAccess()
// line 235: cacheCoordinator.coordinateCache()
```

#### 2. UnifiedAccessAPI.processRequest()
- **ファイル**: `unified-access-api.ts`
- **行番号**: 78-175
- **優先度**: 最重要
- **役割**: 統一データアクセスの実装

**処理フロー**:
1. 重複処理の解決
2. キャッシュチェック
3. 最適化されたアクセス戦略の決定
4. 階層的データアクセス
5. データ統合
6. キャッシュへの保存
7. アクセスパターンの学習

#### 3. CacheCoordinator.coordinateCache()
- **ファイル**: `cache-coordinator.ts`
- **行番号**: 141-226
- **優先度**: 最重要
- **役割**: キャッシュシステムの核心処理

#### 4. DuplicateResolver.getUnifiedMemoryAccess()
- **ファイル**: `duplicate-resolver.ts`
- **行番号**: 293-380
- **優先度**: 最重要
- **役割**: 重複処理解決の実装

### 次優先実装項目

#### 5. MemoryManager.initialize()
- **ファイル**: `memory-manager.ts`
- **行番号**: 161-190
- **役割**: システム初期化

**初期化フェーズ**:
1. サポートシステムの初期化
2. コア統合システムの初期化
3. 記憶階層の初期化
4. システム統合の初期化
5. 最終検証と最適化

#### 6. MemoryManager.unifiedSearch()
- **ファイル**: `memory-manager.ts`
- **行番号**: 338-425
- **役割**: 統一検索

#### 7. AccessOptimizer.optimizedAccess()
- **ファイル**: `access-optimizer.ts`
- **行番号**: 97-185
- **役割**: アクセス最適化

#### 8. DataIntegrationProcessor.processChapterData()
- **ファイル**: `data-integration-processor.ts`
- **行番号**: 110-205
- **役割**: データ統合処理

---

## 🔄 既存システムからの変更・統合項目

### データ救済が必要な12コンポーネント

以下のコンポーネントは記憶階層システムに統合される予定：

| コンポーネント | 調査が必要な項目 |
|---|---|
| PromptGenerator | どのようなデータを保存していたか？ |
| DynamicTensionOptimizer | 計算結果の形式と頻度は？ |
| ContextGenerator | 統合コンテキストの構造は？ |
| EmotionalArcDesigner | AI分析結果のデータ量は？ |
| StorageDiagnosticManager | 診断データの種類と保持期間は？ |
| NarrativeAnalysisService | 分析結果の更新頻度は？ |
| DetectionService | 検出結果のデータ構造は？ |
| CharacterChangeHandler | 変更履歴の詳細度は？ |
| EventBus系 | イベントログの量と種類は？ |
| PreGenerationPipeline | 前処理結果のサイズは？ |
| PostGenerationPipeline | 後処理結果の形式は？ |
| TextAnalyzerService | 分析キャッシュの有効期限は？ |

### 解決される重複処理9箇所

| 重複タイプ | 調査項目 | 解決方法 |
|---|---|---|
| 世界設定4箇所重複 | 各箇所でのデータ形式の違いは？ | `DuplicateResolver.getConsolidatedWorldSettings()` |
| キャラクター情報2箇所重複 | データの不整合パターンは？ | `DuplicateResolver.getConsolidatedCharacterInfo()` |
| 記憶アクセス3箇所分散 | アクセス頻度と性能要件は？ | `DuplicateResolver.getUnifiedMemoryAccess()` |
| ジャンル設定6箇所重複 | 設定値の優先順位は？ | 調査中 |
| AI分析重複実行 | 実行頻度と処理時間は？ | 調査中 |

### 新しい統一インターフェース

#### IMemoryLayer（全記憶層の統一インターフェース）
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

#### IIntegrationComponent（統合コンポーネント共通インターフェース）
```typescript
interface IIntegrationComponent {
    initialize(): Promise<void>;
    getDiagnostics(): Promise<DiagnosticsResult>;
    cleanup(): Promise<void>;
}
```

---

## 📊 実装済み主要メソッド仕様

### MemoryManager主要メソッド

#### processChapter() - 最重要
```typescript
async processChapter(chapter: Chapter): Promise<SystemOperationResult>
```
- **実行内容**:
  1. 短期記憶への追加（line 215）
  2. 中期記憶への統合処理（line 219）
  3. データ統合処理の実行（line 224）
  4. 重複解決処理（line 229）
  5. キャッシュ協調処理（line 235）
  6. 長期記憶への条件付き処理
  7. 品質チェック（有効な場合）
  8. 自動バックアップ（有効な場合）

#### その他主要メソッド
```typescript
async initialize(): Promise<void>                           // ライン 161-190
async unifiedSearch(query: string, memoryLevels: MemoryLevel[]): Promise<UnifiedSearchResult>  // ライン 338-425
async optimizeSystem(): Promise<SystemOptimizationResult>  // ライン 433-540
async performSystemDiagnostics(): Promise<SystemDiagnostics>  // ライン 548-625
async getSystemStatus(): Promise<MemorySystemStatus>       // ライン 673-730
```

### CacheCoordinator主要メソッド
```typescript
async coordinateCache(cacheKey: string, data: any, level: MemoryLevel): Promise<void>  // ライン 141-226
async predictiveCache(nextChapterNumber: number, config?: PreloadConfiguration): Promise<void>  // ライン 234-290
async get<T>(cacheKey: string, level: MemoryLevel): Promise<T | null>  // ライン 298-340
async invalidate(cacheKey: string, level: MemoryLevel, reason: string): Promise<void>  // ライン 348-395
getStatistics(): CacheStatistics  // ライン 403-407
```

#### キャッシュ有効期限（実装済み）
```typescript
private readonly CACHE_TTL = {
    [MemoryLevel.SHORT_TERM]: 5 * 60 * 1000,   // 5分
    [MemoryLevel.MID_TERM]: 30 * 60 * 1000,    // 30分
    [MemoryLevel.LONG_TERM]: 2 * 60 * 60 * 1000 // 2時間
};
```

### DuplicateResolver主要メソッド
```typescript
async getConsolidatedWorldSettings(): Promise<ConsolidatedWorldSettings>  // ライン 85-190
async getConsolidatedCharacterInfo(characterId: string): Promise<ConsolidatedCharacterInfo>  // ライン 198-285
async getUnifiedMemoryAccess(query: MemoryQuery): Promise<MemoryResult>  // ライン 293-380
```

### AccessOptimizer主要メソッド
```typescript
async optimizedAccess<T>(query: MemoryQuery, preferredStrategy?: AccessStrategy): Promise<OptimizedAccessResult<T>>  // ライン 97-185
async determineOptimalStrategy(query: MemoryQuery): Promise<AccessStrategy>  // ライン 193-250
async optimizeAccessPatterns(): Promise<{optimized: boolean; improvements: string[]}>
getStatistics(): AccessStatistics  // ライン 700-702
```

#### アクセス戦略（実装済み）
```typescript
enum AccessStrategy {
    CACHE_FIRST = 'cache-first',
    CONSISTENCY_FIRST = 'consistency-first',
    PERFORMANCE_FIRST = 'performance-first',
    BALANCED = 'balanced',
    PREDICTIVE = 'predictive'
}
```

---

## 📋 型定義（実装済み）

### 記憶レベル
```typescript
export enum MemoryLevel {
    SHORT_TERM = 'SHORT_TERM',
    MID_TERM = 'MID_TERM',
    LONG_TERM = 'LONG_TERM'
}
```

### メモリアクセス要求・応答
```typescript
export interface MemoryAccessRequest {
    chapterNumber: number;
    requestType: MemoryRequestType;
    targetLayers: MemoryLevel[];
    filters?: MemoryAccessFilters;
    options?: MemoryAccessOptions;
}

export interface MemoryAccessResponse {
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

### 統合記憶コンテキスト
```typescript
export interface UnifiedMemoryContext {
    chapterNumber: number;
    timestamp: string;
    shortTerm: { /* 短期記憶データ構造 */ };
    midTerm: { /* 中期記憶データ構造 */ };
    longTerm: { /* 長期記憶データ構造 */ };
    integration: { /* 統合データ構造 */ };
}
```

---

## 🚨 重要な制約事項（実装上の事実）

### 初期化順序（実装済み）
1. サポートシステム初期化
2. コア統合システム初期化  
3. 記憶階層初期化
4. システム統合初期化
5. 初期システム検証

### 品質メトリクス閾値（実装済み）
```typescript
export const QUALITY_THRESHOLDS = {
  DATA_INTEGRITY_MIN: 0.95,      // データ整合性95%以上
  SYSTEM_STABILITY_MIN: 0.90,    // システム安定性90%以上
  PERFORMANCE_MIN: 0.85,         // パフォーマンス85%以上
  OPERATIONAL_EFFICIENCY_MIN: 0.80 // 運用効率80%以上
} as const;
```

---

## 🔧 使用パターン（実装済み）

### 基本的な使用方法
```typescript
// 初期化
const memoryManager = new MemoryManager(config);
await memoryManager.initialize();

// 章処理（最重要）
const result = await memoryManager.processChapter(chapter);
if (result.success) {
    console.log('Chapter processed successfully');
}

// 統合検索
const searchResult = await memoryManager.unifiedSearch(
    'キーワード', 
    [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
);
```

### 直接アクセス
```typescript
// 統一アクセスAPI
const request: MemoryAccessRequest = {
    chapterNumber: 1,
    requestType: MemoryRequestType.CHAPTER_CONTEXT,
    targetLayers: [MemoryLevel.SHORT_TERM]
};
const response = await unifiedAccessAPI.processRequest(request);

// キャッシュ操作
await cacheCoordinator.coordinateCache(
    'chapter_1', 
    chapterData, 
    MemoryLevel.SHORT_TERM
);

// 重複解決
const worldSettings = await duplicateResolver.getConsolidatedWorldSettings();
const characterInfo = await duplicateResolver.getConsolidatedCharacterInfo('character_id');
```

---

この仕様書は実装コードから抽出した**事実のみ**を含んでいます。推測や予測は一切含まれていません。システム全体での使用に関する調査結果との統合をお待ちしています。