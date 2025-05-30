# 📚 記憶階層システム完全移行仕様書

> **⚠️ 重要**: この仕様書は開発者の混乱を防ぐため、実装コードから抽出した**事実のみ**を記載しています。

---

## 🚨 CRITICAL: 即座に必要な情報

### 1. システム構造の変化

#### ✅ 新システム構造 (移行先)
```
src/lib/memory/  # ← 新しいパス（"copy"を削除）
├── core/
│   ├── memory-manager.ts              # 🔄 統合マネージャー
│   ├── types.ts                       # 🔄 統一型定義
│   ├── interfaces.ts                  # 🔄 統一インターフェース
│   ├── unified-access-api.ts          # 🆕 統一アクセスAPI
│   └── data-integration-processor.ts  # 🆕 データ統合処理
├── integration/
│   ├── cache-coordinator.ts           # 🆕 キャッシュ協調
│   ├── duplicate-resolver.ts          # 🆕 重複解決
│   ├── access-optimizer.ts            # 🆕 アクセス最適化
│   └── quality-assurance.ts           # 🆕 品質保証
├── short-term/
│   └── short-term-memory.ts           # 🆕 短期記憶ファサード
├── mid-term/
│   └── mid-term-memory.ts             # 🆕 中期記憶ファサード
└── long-term/
    └── long-term-memory.ts             # 🆕 長期記憶ファサード
```

#### ❌ 廃止予定ファイル (移行元)
```
src/lib/memory/
├── world-knowledge.ts        ❌ 廃止 → long-term-memory.ts
├── narrative-memory.ts       ❌ 廃止 → core/memory-manager.ts
├── event-memory.ts          ❌ 廃止 → integration/duplicate-resolver.ts
├── immediate-context.ts     ❌ 廃止 → short-term-memory.ts
└── memory-manager.ts        ❌ 廃止 → core/memory-manager.ts (統合版)
```

---

## 🔥 API破壊的変更マップ

### A. インポート文の変更

#### ❌ 旧インポート (使用禁止)
```typescript
// これらは全て削除してください
import { WorldKnowledge } from '@/lib/memory/world-knowledge';
import { NarrativeMemory } from '@/lib/memory/narrative-memory';
import { EventMemory } from '@/lib/memory/event-memory';
import { ImmediateContext } from '@/lib/memory/immediate-context';
```

#### ✅ 新インポート (必須)
```typescript
// 新しい統合アクセス方法
import { MemoryManager } from '@/lib/memory/core/memory-manager';

// 初期化
const memoryManager = new MemoryManager(config);
await memoryManager.initialize();
```

### B. メソッド呼び出しの変更

| 旧API | 新API | 備考 |
|-------|-------|------|
| `narrativeMemory.updateNarrativeState(chapter)` | `memoryManager.processChapter(chapter)` | **最重要API** |
| `worldKnowledge.getWorldSettings()` | `memoryManager.duplicateResolver.getConsolidatedWorldSettings()` | 重複解決済み |
| `worldKnowledge.getCharacter(name)` | `memoryManager.duplicateResolver.getConsolidatedCharacterInfo(id)` | ID形式に変更 |
| `eventMemory.recordSignificantEvent(event)` | `memoryManager.detectAndStoreChapterEvents(chapter)` | 自動検出・保存 |
| `immediateContext.addChapter(chapter)` | `memoryManager.processChapter(chapter)` | 統合処理 |
| `narrativeMemory.getCurrentState(num)` | `memoryManager.getNarrativeState(num)` | ファサード経由 |

---

## 🎯 コンポーネント別移行ガイド

### 1. CharacterManager の移行

#### ❌ 旧コード
```typescript
import { WorldKnowledge } from '@/lib/memory/world-knowledge';

class CharacterManager {
  async getCharacterInfo(name: string) {
    const character = await this.worldKnowledge.getCharacter(name);
    return character;
  }
}
```

#### ✅ 新コード
```typescript
import { MemoryManager } from '@/lib/memory/core/memory-manager';

class CharacterManager {
  constructor(private memoryManager: MemoryManager) {}
  
  async getCharacterInfo(characterId: string) {
    const character = await this.memoryManager.duplicateResolver
      .getConsolidatedCharacterInfo(characterId);
    return character;
  }
}
```

### 2. PlotManager の移行

#### ❌ 旧コード
```typescript
import { NarrativeMemory } from '@/lib/memory/narrative-memory';

class PlotManager {
  async updateStoryState(chapter: Chapter) {
    await this.narrativeMemory.updateNarrativeState(chapter);
  }
}
```

#### ✅ 新コード
```typescript
import { MemoryManager } from '@/lib/memory/core/memory-manager';

class PlotManager {
  constructor(private memoryManager: MemoryManager) {}
  
  async updateStoryState(chapter: Chapter) {
    // 統合処理により自動的に全記憶層が更新される
    const result = await this.memoryManager.processChapter(chapter);
    
    if (!result.success) {
      throw new Error('Chapter processing failed');
    }
  }
}
```

### 3. ContextGenerator の移行

#### ❌ 旧コード
```typescript
import { WorldKnowledge } from '@/lib/memory/world-knowledge';
import { NarrativeMemory } from '@/lib/memory/narrative-memory';
import { EventMemory } from '@/lib/memory/event-memory';

class ContextGenerator {
  async generateContext(chapterNumber: number) {
    const worldSettings = await this.worldKnowledge.getWorldSettings();
    const narrativeState = await this.narrativeMemory.getCurrentState(chapterNumber);
    const events = await this.eventMemory.getLocationEvents(location);
    
    return { worldSettings, narrativeState, events };
  }
}
```

#### ✅ 新コード
```typescript
import { MemoryManager } from '@/lib/memory/core/memory-manager';

class ContextGenerator {
  constructor(private memoryManager: MemoryManager) {}
  
  async generateContext(chapterNumber: number) {
    // 統一アクセスAPIを使用
    const request: MemoryAccessRequest = {
      chapterNumber,
      requestType: MemoryRequestType.INTEGRATED_CONTEXT,
      targetLayers: [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
    };
    
    const response = await this.memoryManager.unifiedAccessAPI.processRequest(request);
    
    if (response.success) {
      return response.context;
    }
    
    throw new Error('Failed to generate context');
  }
}
```

### 4. ChapterGenerator の移行

#### ❌ 旧コード
```typescript
// 複数コンポーネントへの個別アクセス
const worldContext = await worldKnowledge.getRelevantContext(chapterNumber);
const narrativeState = await narrativeMemory.getCurrentState(chapterNumber);
const characterStates = await immediateContext.getCharacterStates();
```

#### ✅ 新コード
```typescript
// 統合検索による一元化
const searchResult = await memoryManager.unifiedSearch('context for chapter', [
  MemoryLevel.SHORT_TERM, 
  MemoryLevel.MID_TERM, 
  MemoryLevel.LONG_TERM
]);

// または統一アクセスAPI
const result = await memoryManager.unifiedAccessAPI.processRequest({
  chapterNumber,
  requestType: MemoryRequestType.CHAPTER_CONTEXT,
  targetLayers: [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
});
```

---

## ⚙️ 設定・初期化仕様

### 1. MemoryManagerConfig 完全仕様

```typescript
const config: MemoryManagerConfig = {
  // 短期記憶設定
  shortTermConfig: {
    maxChapters: 10,                    // 保持する最大章数
    cacheEnabled: true,                 // キャッシュ有効化
    autoCleanupEnabled: true,           // 自動クリーンアップ
    cleanupIntervalMinutes: 30,         // クリーンアップ間隔（分）
    maxRetentionHours: 72               // 最大保持時間（時）
  },
  
  // 中期記憶設定
  midTermConfig: {
    maxAnalysisResults: 100,            // 最大分析結果数
    enableEvolutionTracking: true,      // 進化追跡有効化
    enableProgressionAnalysis: true,    // 進行分析有効化
    qualityThreshold: 0.8               // 品質しきい値（0-1）
  },
  
  // 長期記憶設定
  longTermConfig: {
    enableAutoLearning: true,           // 自動学習有効化
    consolidationInterval: 30,          // 統合処理間隔（分）
    archiveOldData: true,              // 古いデータのアーカイブ
    enablePredictiveAnalysis: true,     // 予測分析有効化
    qualityThreshold: 0.8              // 品質しきい値（0-1）
  },
  
  // 統合システム設定
  integrationEnabled: true,             // 統合機能有効化
  enableQualityAssurance: true,         // 品質保証有効化
  enableAutoBackup: true,              // 自動バックアップ有効化
  enablePerformanceOptimization: true,  // パフォーマンス最適化
  enableDataMigration: true            // データ移行有効化
};
```

### 2. 初期化手順（必須）

```typescript
// Step 1: MemoryManager作成
const memoryManager = new MemoryManager(config);

// Step 2: 初期化実行（必須）
await memoryManager.initialize();

// Step 3: 他のコンポーネントにMemoryManagerを注入
const characterManager = new CharacterManager(memoryManager);
const plotManager = new PlotManager(memoryManager);
const contextGenerator = new ContextGenerator(memoryManager);

// Step 4: システム全体の初期化
await Promise.all([
  characterManager.initialize(),
  plotManager.initialize(),
  contextGenerator.initialize()
]);
```

### 3. 依存関係（重要）

```typescript
// 正しい依存関係
MemoryManager (core)
    ↓
CharacterManager → MemoryManager
PlotManager → MemoryManager
ContextGenerator → MemoryManager
ChapterGenerator → MemoryManager
```

---

## 🔄 新しい統一アクセスパターン

### 1. 章処理（最重要API）

```typescript
// 旧: 複数のメソッド呼び出しが必要
await narrativeMemory.updateNarrativeState(chapter);
await worldKnowledge.extractCharacterNames(chapter.content);
await eventMemory.detectAndStoreEvents(chapter);

// 新: 1つのメソッドで全て処理
const result = await memoryManager.processChapter(chapter);

if (!result.success) {
  console.error('Processing failed:', result.errors);
  // エラーハンドリング
}
```

### 2. 統一検索API

```typescript
// 複数の記憶層から統合検索
const searchResult = await memoryManager.unifiedSearch('キーワード', [
  MemoryLevel.SHORT_TERM,   // 短期記憶
  MemoryLevel.MID_TERM,     // 中期記憶
  MemoryLevel.LONG_TERM     // 長期記憶
]);

console.log(`Found ${searchResult.totalResults} results`);
```

### 3. 重複解決システム

```typescript
// 統合済みデータの取得（重複なし）
const worldSettings = await memoryManager.duplicateResolver.getConsolidatedWorldSettings();
const characterInfo = await memoryManager.duplicateResolver.getConsolidatedCharacterInfo(characterId);
const memoryAccess = await memoryManager.duplicateResolver.getUnifiedMemoryAccess(query);
```

### 4. キャッシュ協調システム

```typescript
// インテリジェントなキャッシュ操作
await memoryManager.cacheCoordinator.coordinateCache(key, data, MemoryLevel.SHORT_TERM);

// 予測キャッシュ（次の章のデータを先読み）
await memoryManager.cacheCoordinator.predictiveCache(nextChapterNumber);

// キャッシュ統計取得
const stats = memoryManager.cacheCoordinator.getStatistics();
```

---

## 🛠️ データ移行手順

### 1. 既存データの移行

```typescript
// 自動データ移行の実行
const migrationResult = await memoryManager.dataIntegrationProcessor.migrateExistingData();

if (migrationResult.success) {
  console.log('Data migration completed successfully');
} else {
  console.error('Migration failed:', migrationResult.errors);
}
```

### 2. 移行対象データ

- ✅ **WorldKnowledge データ** → LongTermMemory.WorldKnowledge
- ✅ **NarrativeMemory データ** → MidTermMemory.NarrativeProgressionManager
- ✅ **EventMemory データ** → DataIntegrationProcessor
- ✅ **CharacterMemory データ** → LongTermMemory.CharacterDatabase
- ✅ **分析結果データ** → MidTermMemory.AnalysisResultsManager

### 3. 移行検証

```typescript
// データ整合性の検証
const integrity = await memoryManager.dataIntegrationProcessor.validateDataIntegrity();

if (!integrity.isValid) {
  console.warn('Data integrity issues:', integrity.issues);
  
  // 自動修復の試行
  const repair = await memoryManager.dataIntegrationProcessor.attemptAutoRepair(integrity.issues);
  
  if (repair.repaired) {
    console.log(`Repaired ${repair.repairedCount} issues`);
  }
}
```

---

## 🚨 エラーハンドリング

### 1. SystemOperationResult パターン

```typescript
interface SystemOperationResult {
  success: boolean;
  operationType: string;
  processingTime: number;
  affectedComponents: string[];
  details: Record<string, any>;
  warnings: string[];
  errors: string[];
}

// 使用例
const result = await memoryManager.processChapter(chapter);

if (!result.success) {
  // エラー詳細の表示
  console.error('Operation failed:', result.operationType);
  console.error('Errors:', result.errors);
  console.error('Warnings:', result.warnings);
  
  // 影響を受けたコンポーネントの確認
  console.log('Affected components:', result.affectedComponents);
}
```

### 2. 段階的エラー回復

```typescript
try {
  await memoryManager.processChapter(chapter);
} catch (error) {
  console.error('Chapter processing failed:', error.message);
  
  // 段階的な回復処理
  if (error.message.includes('short-term')) {
    // 短期記憶のみの処理を試行
    await memoryManager.shortTermMemory.addChapter(chapter);
  }
  
  if (error.message.includes('mid-term')) {
    // 中期記憶のみの処理を試行
    await memoryManager.midTermMemory.addChapter(chapter);
  }
}
```

---

## 📊 診断・監視API

### 1. システム診断

```typescript
// 包括的システム診断
const diagnostics = await memoryManager.performSystemDiagnostics();

console.log('System health:', diagnostics.systemHealth);
console.log('Issues:', diagnostics.issues);
console.log('Recommendations:', diagnostics.recommendations);

// 詳細診断
console.log('Memory layers:', diagnostics.memoryLayers);
console.log('Integration status:', diagnostics.integrationStatus);
```

### 2. パフォーマンス監視

```typescript
// システム状態の取得
const status = await memoryManager.getSystemStatus();

console.log('Initialization status:', status.initialized);
console.log('Last update:', status.lastUpdateTime);
console.log('Performance metrics:', status.performanceMetrics);
console.log('Cache statistics:', status.cacheStatistics);
```

### 3. 品質保証

```typescript
// 品質チェックの実行
const qa = await memoryManager.qualityAssurance.performComprehensiveDiagnostic();

if (qa.overallScore < 0.8) {
  console.warn('Quality issues detected');
  console.log('Quality report:', qa.detailedReport);
}
```

---

## 🚀 最適化・パフォーマンス

### 1. システム最適化

```typescript
// 自動最適化の実行
const optimization = await memoryManager.optimizeSystem();

if (optimization.success) {
  console.log('Optimizations applied:', optimization.improvements);
  console.log('Performance gain:', optimization.performanceImprovement);
  console.log('Memory saved:', optimization.memorySaved);
}
```

### 2. 統計情報

```typescript
// 操作統計の取得
const stats = memoryManager.getOperationStatistics();

console.log('Total operations:', stats.totalOperations);
console.log('Success rate:', stats.successRate);
console.log('Average processing time:', stats.averageProcessingTime);

// キャッシュ統計
const cacheStats = await memoryManager.getCacheStatistics();
console.log('Cache hit rate:', cacheStats.hitRate);
console.log('Cache efficiency:', cacheStats.efficiency);
```

---

## 🎯 よくある移行パターン

### 1. 既存のControllerクラス

```typescript
// ❌ 旧パターン
class ChapterController {
  constructor(
    private worldKnowledge: WorldKnowledge,
    private narrativeMemory: NarrativeMemory,
    private eventMemory: EventMemory
  ) {}
  
  async processChapter(chapter: Chapter) {
    await this.narrativeMemory.updateNarrativeState(chapter);
    await this.worldKnowledge.extractCharacterNames(chapter.content);
    await this.eventMemory.recordSignificantEvent(event);
  }
}

// ✅ 新パターン
class ChapterController {
  constructor(private memoryManager: MemoryManager) {}
  
  async processChapter(chapter: Chapter) {
    const result = await this.memoryManager.processChapter(chapter);
    
    if (!result.success) {
      throw new Error(`Chapter processing failed: ${result.errors.join(', ')}`);
    }
    
    return result;
  }
}
```

### 2. 複雑な検索処理

```typescript
// ❌ 旧パターン（複数コンポーネントから個別に取得）
async function gatherContext(chapterNumber: number) {
  const characters = await worldKnowledge.getAllCharacters();
  const recentChapters = await immediateContext.getRecentChapters();
  const narrativeState = await narrativeMemory.getCurrentState(chapterNumber);
  const events = await eventMemory.getLocationEvents(location);
  
  return { characters, recentChapters, narrativeState, events };
}

// ❌ 削除: プライベートAPIへの直接アクセス
// await this.memoryManager.unifiedAccessAPI.processRequest(memoryRequest);

// ✅ 修正: パブリックなunifiedSearchメソッドを使用
const unifiedSearchResult = await this.memoryManager.unifiedSearch(searchQuery, targetLayers);

// ✅ 新パターン（統一アクセスAPI）
async function gatherContext(chapterNumber: number) {
  const request: MemoryAccessRequest = {
    chapterNumber,
    requestType: MemoryRequestType.INTEGRATED_CONTEXT,
    targetLayers: [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM],
    filters: {
      includeCharacters: true,
      includeEvents: true,
      includeNarrativeState: true
    }
  };
  
  const response = await memoryManager.unifiedAccessAPI.processRequest(request);
  
  if (response.success) {
    return response.context;
  }
  
  throw new Error('Failed to gather context');
}
```

---

## 📋 チェックリスト

### ✅ 移行完了チェック

- [ ] 旧インポート文をすべて削除
- [ ] 新しいMemoryManagerをインポート
- [ ] MemoryManagerConfigを設定
- [ ] initialize()を呼び出し
- [ ] processChapter()を使用
- [ ] エラーハンドリングを実装
- [ ] 統一アクセスAPIに移行
- [ ] データ移行を実行
- [ ] システム診断を確認

### ⚠️ 注意事項

1. **初期化順序**: MemoryManagerを最初に初期化してから他のコンポーネントに注入
2. **エラーハンドリング**: SystemOperationResultを必ずチェック
3. **パフォーマンス**: 大量のデータ処理時は診断APIで監視
4. **メモリ使用量**: 定期的な最適化を実行
5. **データ整合性**: 移行後は必ずvalidateDataIntegrity()を実行

---

## 🆘 トラブルシューティング

### よくある問題と解決方法

#### 問題1: 初期化エラー
```typescript
// エラー: MemoryManager not initialized
// 解決方法:
await memoryManager.initialize();
```

#### 問題2: データ移行失敗
```typescript
// エラー: Migration failed
// 解決方法:
const diagnostics = await memoryManager.diagnoseStorage();
await memoryManager.repairStorage();
```

#### 問題3: パフォーマンス低下
```typescript
// 解決方法:
await memoryManager.optimizeSystem();
const stats = memoryManager.getOperationStatistics();
```

---

この仕様書により、全コンポーネントが**安全かつ効率的**に新しい記憶階層システムに移行できます。