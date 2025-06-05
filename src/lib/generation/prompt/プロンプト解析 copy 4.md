# 各ファサードチーム作業指示書

## 🎯 共通作業方針

**すべてのファサードチームが従う原則**:
1. **初期化ロジックの完全削除**
2. **コンストラクタ依存注入への変更**
3. **既存ビジネスロジックの100%保持**
4. **余計な関数・プロパティの追加禁止**

---

## 🧠 Memory チーム

### 対象ファイル
`src/lib/memory/core/memory-manager.ts`

### 削除対象
```typescript
// 🚫 これらを削除
private initialized: boolean = false;
private initializationPromise: Promise<void> | null = null;

async initialize(): Promise<void> { ... }
private async _initialize(): Promise<void> { ... }
private async ensureInitialized(): Promise<void> { ... }
```

### 変更後のコンストラクタ
```typescript
// ✅ 変更後
constructor(
  private config: MemoryManagerConfig,
  private persistentStorage: PersistentStorage,
  private logger: Logger
) {
  // 設定の適用
  this.applyConfiguration(config);
  // 即座に使用可能
  logger.info('MemoryManager ready for immediate use');
}
```

### 保持対象 (変更禁止)
- `processChapter()` - 完全保持
- `unifiedSearch()` - 完全保持
- `getSystemStatus()` - 完全保持
- その他全ビジネスロジック

---

## 👥 Characters チーム

### 対象ファイル
`src/lib/characters/manager.ts`

### 削除対象
```typescript
// 🚫 これらを削除
private ready = false;
async initialize(): Promise<void> { ... }
private validateSystemDependencies(): void { ... }
```

### 変更後のコンストラクタ
```typescript
// ✅ 変更後 (既に正しい実装になっている)
constructor(
  private readonly memoryManager: MemoryManager,
  private readonly characterService: CharacterService,
  // ... 他のサービス
) {
  logger.info('CharacterManager initialized - services ready immediately');
  this.ready = true; // この行のみ保持
}
```

### 保持対象 (変更禁止)
- `createCharacter()` - 完全保持
- `getCharactersWithDetails()` - 完全保持
- `analyzeCharacter()` - 完全保持
- その他全ファサードメソッド

---

## 📊 Analysis チーム

### 対象ファイル
`src/lib/analysis/content-analysis-manager.ts`

### 削除対象
```typescript
// 🚫 削除対象なし (既に正しい実装)
// ContentAnalysisManagerは既に依存注入パターン
```

### 確認事項
- コンストラクタが依存注入になっているか確認
- `prepareChapterGeneration()` メソッドが保持されているか確認
- `processGeneratedChapter()` メソッドが保持されているか確認

---

## 📝 Generation チーム

### 対象ファイル群
- `src/lib/generation/prompt-generator.ts`
- `src/lib/generation/engine/chapter-generator.ts`

### PromptGenerator 削除対象
```typescript
// 🚫 これらを削除
private initializationPromise: Promise<void>;
private isInitialized: boolean = false;

async initialize(): Promise<void> { ... }
private async ensureInitialized(): Promise<void> { ... }
```

### ChapterGenerator 削除対象
```typescript
// 🚫 これらを削除
private initialized: boolean = false;
async initialize(): Promise<void> { ... }
async ensureInitialized(): Promise<void> { ... }
```

### 変更後のコンストラクタ群
```typescript
// PromptGenerator ✅ 変更後
constructor(
  private memoryManager: MemoryManager,
  private worldSettingsManager?: WorldSettingsManager,
  private plotManager?: PlotManager,
  private learningJourneySystem?: LearningJourneySystem
) {
  this.unifiedMemoryService = new UnifiedMemoryService(this.memoryManager);
  this.templateManager = new TemplateManager();
  this.formatter = new PromptFormatter();
  this.sectionBuilder = new SectionBuilder(this.formatter, this.templateManager, this.learningJourneySystem);
  logger.info('PromptGenerator ready for immediate use');
}

// ChapterGenerator ✅ 変更後
constructor(
  private geminiClient: GeminiClient,
  private promptGenerator: PromptGenerator,
  private memoryManager: MemoryManager
) {
  logger.info('ChapterGenerator ready for immediate use');
}
```

---

## 🔮 Foreshadowing チーム

### 対象ファイル
`src/lib/foreshadowing/manager.ts`

### 削除対象
```typescript
// 🚫 削除対象なし (既に正しい実装)
// ForeshadowingManagerは既に依存注入パターン
```

### 確認事項
- コンストラクタが `MemoryManager` のみを受け取っているか確認
- `processChapterAndGenerateForeshadowing()` メソッドが保持されているか確認

---

## ⚙️ Parameters チーム

### 対象ファイル
`src/lib/parameters/manager.ts`

### 削除対象
```typescript
// 🚫 これらを削除
private initialized: boolean = false;

async initialize(): Promise<void> { ... }
private async ensureDirectoriesExist(): Promise<void> { ... }
private async loadSavedParameters(): Promise<void> { ... }
```

### 変更後のコンストラクタ
```typescript
// ✅ 変更後
private constructor(
  private persistentStorage: PersistentStorage
) {
  this.currentParameters = JSON.parse(JSON.stringify(DEFAULT_PARAMETERS));
  this.loadParametersSync(); // 同期ロード
  logger.info('ParameterManager ready for immediate use');
}

// 同期的なパラメータ読み込み
private loadParametersSync(): void {
  try {
    // ファイル存在チェックと読み込み (同期版)
    if (this.persistentStorage.fileExistsSync(this.SYSTEM_PARAMETERS_PATH)) {
      const content = this.persistentStorage.readFileSync(this.SYSTEM_PARAMETERS_PATH);
      const saved = JSON.parse(content);
      this.currentParameters = this.mergeWithDefaults(saved.parameters);
    }
  } catch (error) {
    logger.warn('Failed to load parameters, using defaults');
  }
}
```

---

## 🗄️ Storage チーム

### 対象ファイル
`src/lib/storage/index.ts`

### 削除対象
```typescript
// 🚫 削除対象なし (既に正しい実装)
// createStorageProvider() 関数は保持
```

### 確認事項
- `createStorageProvider()` 関数が正常に動作するか確認
- 環境変数ベースの設定が正しく動作するか確認

---

## ✅ 各チーム完了確認項目

### 全チーム共通
- [ ] 初期化関連メソッドがすべて削除されている
- [ ] コンストラクタが依存注入パターンになっている
- [ ] 既存のビジネスロジックがすべて保持されている
- [ ] ログ出力で「ready for immediate use」が確認できる
- [ ] 余計な関数・プロパティが追加されていない

### テスト方法
各チームは以下の方法で動作確認：

```typescript
// Infrastructure チーム完了後に実行可能
import { initializeApplication } from '@/lib/lifecycle';

async function testIntegration() {
  const container = await initializeApplication();
  
  // 各ファサードが正常に取得できることを確認
  const engine = container.resolve('novelGenerationEngine');
  const status = await engine.checkStatus();
  console.log('Integration test passed:', status);
}
```

## 🚀 完了後の利点

1. **即座に使用可能**: すべてのコンポーネントが初期化なしで利用可能
2. **依存関係明確**: コンストラクタで全依存関係が見える
3. **テスト容易**: モック注入が簡単
4. **循環依存解消**: ServiceContainer が依存順序を管理
5. **エラー削減**: 初期化忘れのエラーが根絶

## 📞 問題発生時の連絡先

各チームで問題が発生した場合:
1. Infrastructure チームに依存関係の確認を依頼
2. 既存機能の保持を最優先する
3. 不明な点があれば作業を停止し確認を求める