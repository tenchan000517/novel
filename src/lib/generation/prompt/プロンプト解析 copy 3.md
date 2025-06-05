# AI小説生成システム ライフサイクル一元管理アーキテクチャ

## 1. 完成形ディレクトリ構造

```
src/lib/
├── lifecycle/
│   ├── application-lifecycle-manager.ts    # 🔥 NEW: 統一ライフサイクル管理者
│   ├── service-container.ts                # 🔧 REFACTOR: 純粋な依存注入コンテナ
│   └── lifecycle-events.ts                 # 🔥 NEW: ライフサイクルイベント定義
├── memory/
│   └── core/
│       └── memory-manager.ts               # 🔧 REFACTOR: 初期化ロジック削除
├── analysis/
│   └── content-analysis-manager.ts         # 🔧 REFACTOR: 初期化ロジック削除
├── characters/
│   └── manager.ts                          # 🔧 REFACTOR: 初期化ロジック削除
├── foreshadowing/
│   └── manager.ts                          # 🔧 REFACTOR: 初期化ロジック削除
├── generation/
│   ├── engine/
│   │   └── chapter-generator.ts            # 🔧 REFACTOR: 初期化ロジック削除
│   ├── context-generator.ts                # 🔧 REFACTOR: 初期化ロジック削除
│   └── prompt-generator.ts                 # 🔧 REFACTOR: 初期化ロジック削除
├── learning-journey/
│   └── concept-learning-manager.ts         # 🔧 REFACTOR: 初期化ロジック削除
├── plot/
│   └── manager.ts                          # 🔧 REFACTOR: 初期化ロジック削除
├── parameters/
│   └── manager.ts                          # 🔧 REFACTOR: 初期化ロジック削除
└── storage/
    └── index.ts                            # 🔧 REFACTOR: 初期化ロジック削除
```

## 2. 統一ライフサイクル管理システム

### ApplicationLifecycleManager（新規作成）
```typescript
export class ApplicationLifecycleManager {
    private serviceContainer: ServiceContainer;
    private currentStage: LifecycleStage = LifecycleStage.NOT_STARTED;
    private stageHistory: LifecycleStageResult[] = [];

    async initialize(): Promise<void> {
        // Stage 1: Infrastructure
        await this.executeStage(LifecycleStage.INFRASTRUCTURE, () => 
            this.serviceContainer.initializeInfrastructure()
        );
        
        // Stage 2: Storage
        await this.executeStage(LifecycleStage.STORAGE, () => 
            this.serviceContainer.initializeStorage()
        );
        
        // Stage 3: Memory System
        await this.executeStage(LifecycleStage.MEMORY, () => 
            this.serviceContainer.initializeMemorySystem()
        );
        
        // Stage 4: Core Services
        await this.executeStage(LifecycleStage.CORE_SERVICES, () => 
            this.serviceContainer.initializeCoreServices()
        );
        
        // Stage 5: Facades
        await this.executeStage(LifecycleStage.FACADES, () => 
            this.serviceContainer.initializeFacades()
        );
        
        // Stage 6: Application Ready
        this.currentStage = LifecycleStage.READY;
    }
}
```

## 3. ServiceContainer（リファクタリング）

```typescript
export class ServiceContainer {
    // 🔧 初期化ロジックを段階別に整理
    
    async initializeInfrastructure(): Promise<void> {
        this.register('logger', () => new Logger(), ServiceLifecycle.SINGLETON);
        this.register('eventBus', () => new EventBus(), ServiceLifecycle.SINGLETON);
    }
    
    async initializeStorage(): Promise<void> {
        this.register('storageProvider', () => createStorageProvider(), ServiceLifecycle.SINGLETON);
        this.register('persistentStorage', (container) => 
            new PersistentStorage(container.resolve('storageProvider')), ServiceLifecycle.SINGLETON);
    }
    
    async initializeMemorySystem(): Promise<void> {
        this.register('memoryManager', (container) => 
            new MemoryManager(container.resolve('persistentStorage')), ServiceLifecycle.SINGLETON);
    }
    
    async initializeCoreServices(): Promise<void> {
        this.register('parameterManager', () => ParameterManager.getInstance(), ServiceLifecycle.SINGLETON);
        this.register('geminiClient', () => new GeminiClient(), ServiceLifecycle.SINGLETON);
    }
    
    async initializeFacades(): Promise<void> {
        this.register('characterManager', (container) => 
            new CharacterManager(container.resolve('memoryManager')), ServiceLifecycle.SINGLETON);
        this.register('plotManager', (container) => 
            new PlotManager(container.resolve('memoryManager')), ServiceLifecycle.SINGLETON);
        // ... 他のファサード
    }
}
```

## 4. 各コンポーネントのリファクタリング方針

### A. MemoryManager
```typescript
// 🔧 BEFORE: 独自初期化ロジック
class MemoryManager {
    async initialize(): Promise<void> { /* 複雑な初期化 */ }
}

// 🔧 AFTER: 純粋な依存注入
class MemoryManager {
    constructor(
        private persistentStorage: PersistentStorage,
        private logger: Logger
    ) {
        // 即座に使用可能、初期化メソッド不要
    }
}
```

### B. CharacterManager
```typescript
// 🔧 BEFORE: ファサードが初期化管理
class CharacterManager {
    private initialized = false;
    async initialize(): Promise<void> { /* 初期化ロジック */ }
}

// 🔧 AFTER: 純粋なファサード
class CharacterManager {
    constructor(
        private memoryManager: MemoryManager,
        private characterService: CharacterService
    ) {
        // 即座に使用可能
    }
}
```

### C. ChapterGenerator
```typescript
// 🔧 BEFORE: 複雑な初期化チェーン
class ChapterGenerator {
    private initializationPromise: Promise<void> | null = null;
    async ensureInitialized(): Promise<void> { /* 複雑 */ }
}

// 🔧 AFTER: シンプルな依存注入
class ChapterGenerator {
    constructor(
        private memoryManager: MemoryManager,
        private contextGenerator: ContextGenerator,
        private promptGenerator: PromptGenerator
    ) {
        // 即座に使用可能
    }
}
```

## 5. ライフサイクルステージ定義

```typescript
enum LifecycleStage {
    NOT_STARTED = 'NOT_STARTED',
    INFRASTRUCTURE = 'INFRASTRUCTURE',    // Logger, EventBus
    STORAGE = 'STORAGE',                  // StorageProvider, PersistentStorage
    MEMORY = 'MEMORY',                    // MemoryManager
    CORE_SERVICES = 'CORE_SERVICES',      // ParameterManager, GeminiClient
    FACADES = 'FACADES',                  // All Manager Classes
    READY = 'READY'                       // Application Ready
}
```

## 6. 依存関係マップ

```
Stage 1 (INFRASTRUCTURE):
├── Logger
└── EventBus

Stage 2 (STORAGE):
├── StorageProvider
└── PersistentStorage → StorageProvider

Stage 3 (MEMORY):
└── MemoryManager → PersistentStorage, Logger

Stage 4 (CORE_SERVICES):
├── ParameterManager
└── GeminiClient

Stage 5 (FACADES):
├── CharacterManager → MemoryManager
├── PlotManager → MemoryManager
├── ForeshadowingManager → MemoryManager
├── ContentAnalysisManager → MemoryManager
├── ContextGenerator → MemoryManager
├── PromptGenerator → MemoryManager
├── ChapterGenerator → MemoryManager, ContextGenerator, PromptGenerator
└── ConceptLearningManager → MemoryManager, GeminiClient
```

## 7. 各エンジニアの作業方針

### Infrastructure チーム
- **作業内容**: ApplicationLifecycleManager作成
- **削除対象**: 既存の個別初期化ロジック
- **保持対象**: 既存のビジネスロジック

### Memory チーム  
- **作業内容**: MemoryManager初期化ロジック削除
- **変更内容**: コンストラクタ依存注入のみ
- **保持対象**: processChapter等の全メソッド

### Analysis チーム
- **作業内容**: ContentAnalysisManager初期化ロジック削除
- **変更内容**: コンストラクタ依存注入のみ
- **保持対象**: 分析ロジック全体

### Characters チーム
- **作業内容**: CharacterManager初期化ロジック削除
- **変更内容**: コンストラクタ依存注入のみ
- **保持対象**: キャラクター管理ロジック全体

### Generation チーム
- **作業内容**: ChapterGenerator, ContextGenerator, PromptGenerator初期化ロジック削除
- **変更内容**: コンストラクタ依存注入のみ
- **保持対象**: 生成ロジック全体

### Plot チーム
- **作業内容**: PlotManager初期化ロジック削除
- **変更内容**: コンストラクタ依存注入のみ
- **保持対象**: プロット管理ロジック全体

### Learning チーム
- **作業内容**: ConceptLearningManager初期化ロジック削除
- **変更内容**: コンストラクタ依存注入のみ
- **保持対象**: 学習ロジック全体

## 8. 実装優先順位

1. **ApplicationLifecycleManager作成** (Infrastructure チーム)
2. **ServiceContainer段階別初期化追加** (Infrastructure チーム)  
3. **MemoryManager初期化削除** (Memory チーム)
4. **各ファサード初期化削除** (各チーム並行)
5. **統合テスト** (Infrastructure チーム)

## 9. 成功指標

- ✅ 全初期化ロジックがApplicationLifecycleManagerに集約
- ✅ 各コンポーネントのコンストラクタ依存注入のみ
- ✅ 循環依存の完全排除
- ✅ 既存機能の100%保持
- ✅ システム起動時間の最適化