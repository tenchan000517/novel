# 🏗️ AI小説生成システム Version2 - 完成形ディレクトリ構造詳細設計

## 📁 完全ディレクトリ構造

```
src/
├── app/                           # Next.js App Router
├── core/                          # システム制御層
├── systems/                       # 専門システム群
├── generation/                    # 生成制御層
├── components/                    # UIコンポーネント
├── config/                        # 静的設定ファイル
├── types/                         # 全システム共通型定義
└── utils/                         # 全システム共通ユーティリティ
```

---

## 🧠 core/ - システム制御層詳細設計

### 📂 core/container/
```
core/container/
├── index.ts                       # 公開インターフェース
├── service-container.ts           # メインサービスコンテナ
├── dependency-resolver.ts         # 依存性解決
├── lifecycle-manager.ts           # ライフサイクル管理
├── health-monitor.ts              # システムヘルス監視
├── error-handler.ts               # エラーハンドリング
├── interfaces.ts                  # コンテナ固有インターフェース
└── types.ts                       # コンテナ固有型定義
```

#### core/container/service-container.ts
```typescript
export interface IServiceContainer {
  register<T>(token: string, factory: ServiceFactory<T>, dependencies?: string[]): void
  get<T>(token: string): T
  has(token: string): boolean
  initialize(): Promise<void>
  shutdown(): Promise<void>
  getHealth(): HealthStatus
}

export class ServiceContainer implements IServiceContainer {
  // パブリックメソッド
  + register<T>(token: string, factory: ServiceFactory<T>, dependencies?: string[]): void
  + get<T>(token: string): T
  + has(token: string): boolean
  + initialize(): Promise<void>
  + shutdown(): Promise<void>
  + getHealth(): HealthStatus
  + addEventListener(event: ContainerEvent, handler: EventHandler): void
  + removeEventListener(event: ContainerEvent, handler: EventHandler): void
  
  // プライベートメソッド
  - validateToken(token: string): void
  - validateFactory<T>(factory: ServiceFactory<T>): void
  - buildDependencyGraph(): DependencyGraph
  - validateCircularDependencies(): void
  - createInstance<T>(registration: ServiceRegistration<T>): T
  - cacheInstance<T>(token: string, instance: T): void
  - clearCache(): void
  
  // ヘルパーメソッド
  - logRegistration(token: string): void
  - logResolution(token: string): void
  - handleResolutionError(token: string, error: Error): never
}
```

#### core/container/dependency-resolver.ts
```typescript
export interface IDependencyResolver {
  resolve(services: ServiceRegistration[]): ResolvedDependencies
  validateDependencies(services: ServiceRegistration[]): ValidationResult
  getInitializationOrder(services: ServiceRegistration[]): string[]
}

export class DependencyResolver implements IDependencyResolver {
  // パブリックメソッド
  + resolve(services: ServiceRegistration[]): ResolvedDependencies
  + validateDependencies(services: ServiceRegistration[]): ValidationResult
  + getInitializationOrder(services: ServiceRegistration[]): string[]
  + detectCircularDependencies(services: ServiceRegistration[]): CircularDependency[]
  
  // プライベートメソッド
  - buildGraph(services: ServiceRegistration[]): DependencyGraph
  - topologicalSort(graph: DependencyGraph): string[]
  - findCycles(graph: DependencyGraph): Cycle[]
  - validateServiceExists(token: string, allServices: ServiceRegistration[]): boolean
  
  // ヘルパーメソッド
  - createGraphNode(service: ServiceRegistration): GraphNode
  - addEdge(graph: DependencyGraph, from: string, to: string): void
  - getServiceByToken(token: string, services: ServiceRegistration[]): ServiceRegistration | null
}
```

### 📂 core/lifecycle/
```
core/lifecycle/
├── index.ts                       # 公開インターフェース
├── application-lifecycle.ts       # アプリケーションライフサイクル
├── initialization-orchestrator.ts # 初期化オーケストレーター
├── shutdown-manager.ts            # シャットダウン管理
├── phase-controller.ts            # フェーズ制御
├── system-monitor.ts              # システム監視
├── interfaces.ts                  # ライフサイクル固有インターフェース
└── types.ts                       # ライフサイクル固有型定義
```

#### core/lifecycle/application-lifecycle.ts
```typescript
export interface IApplicationLifecycle {
  start(): Promise<void>
  stop(): Promise<void>
  restart(): Promise<void>
  getStatus(): LifecycleStatus
  getCurrentPhase(): InitializationPhase
}

export class ApplicationLifecycle implements IApplicationLifecycle {
  // パブリックメソッド
  + start(): Promise<void>
  + stop(): Promise<void>
  + restart(): Promise<void>
  + getStatus(): LifecycleStatus
  + getCurrentPhase(): InitializationPhase
  + addEventListener(event: LifecycleEvent, handler: LifecycleEventHandler): void
  + removeEventListener(event: LifecycleEvent, handler: LifecycleEventHandler): void
  + waitForPhase(phase: InitializationPhase, timeout?: number): Promise<void>
  
  // プライベートメソッド
  - executePhase1(): Promise<void>  // 静的設定ロード
  - executePhase2(): Promise<void>  // サービスコンテナ初期化
  - executePhase3(): Promise<void>  // 記憶階層システム起動
  - executePhase4(): Promise<void>  // 専門システム群起動
  - executePhase5(): Promise<void>  // 生成制御層初期化
  - executePhase6(): Promise<void>  // システム統合テスト
  - handlePhaseError(phase: InitializationPhase, error: Error): Promise<void>
  - validatePhaseCompletion(phase: InitializationPhase): Promise<boolean>
  
  // ヘルパーメソッド
  - updatePhaseStatus(phase: InitializationPhase, status: PhaseStatus): void
  - notifyPhaseChange(phase: InitializationPhase): void
  - calculatePhaseProgress(): number
  - createPhaseReport(phase: InitializationPhase): PhaseReport
}
```

### 📂 core/ai-client/
```
core/ai-client/
├── index.ts                       # 公開インターフェース
├── unified-ai-client.ts           # 統一AIクライアント
├── rate-limiter.ts                # レート制限
├── request-queue.ts               # リクエストキュー
├── response-processor.ts          # レスポンス処理
├── cost-optimizer.ts              # コスト最適化
├── cache-manager.ts               # キャッシュ管理
├── interfaces.ts                  # AIクライアント固有インターフェース
└── types.ts                       # AIクライアント固有型定義
```

#### core/ai-client/unified-ai-client.ts
```typescript
export interface IUnifiedAIClient {
  generate(request: GenerationRequest): Promise<GenerationResponse>
  batchGenerate(requests: GenerationRequest[]): Promise<GenerationResponse[]>
  getUsageStatistics(): UsageStatistics
  getCostEstimate(request: GenerationRequest): CostEstimate
}

export class UnifiedAIClient implements IUnifiedAIClient {
  // パブリックメソッド
  + generate(request: GenerationRequest): Promise<GenerationResponse>
  + batchGenerate(requests: GenerationRequest[]): Promise<GenerationResponse[]>
  + getUsageStatistics(): UsageStatistics
  + getCostEstimate(request: GenerationRequest): CostEstimate
  + clearCache(): void
  + setRateLimit(limit: RateLimit): void
  + addEventListener(event: AIClientEvent, handler: AIClientEventHandler): void
  
  // プライベートメソッド
  - processRequest(request: GenerationRequest): Promise<GenerationResponse>
  - queueRequest(request: GenerationRequest): Promise<void>
  - dequeueRequest(): GenerationRequest | null
  - applyRateLimit(request: GenerationRequest): Promise<void>
  - validateRequest(request: GenerationRequest): ValidationResult
  - optimizePrompt(prompt: string): OptimizedPrompt
  - handleAPIError(error: APIError): never
  
  // ヘルパーメソッド
  - calculateTokenCount(text: string): number
  - estimateCost(request: GenerationRequest): number
  - logAPIUsage(request: GenerationRequest, response: GenerationResponse): void
  - updateStatistics(usage: UsageData): void
}
```

---

## 🧠 systems/ - 専門システム群詳細設計

## 🗄️ systems/memory/ - 記憶階層システム

### 📂 systems/memory/
```
systems/memory/
├── index.ts                       # 公開インターフェース
├── core/                          # コア機能
│   ├── memory-manager.ts          # 統合メモリマネージャー
│   ├── unified-access-api.ts      # 統一アクセスAPI
│   ├── data-integration.ts        # データ統合処理
│   └── search-engine.ts           # 検索エンジン
├── short-term/                    # 短期記憶
│   ├── index.ts
│   ├── short-term-memory.ts       # 短期記憶管理
│   ├── continuity-tracker.ts      # 連続性追跡
│   ├── immediate-context.ts       # 即座コンテキスト
│   └── cleanup-scheduler.ts       # クリーンアップスケジューラー
├── mid-term/                      # 中期記憶
│   ├── index.ts
│   ├── mid-term-memory.ts         # 中期記憶管理
│   ├── section-analyzer.ts        # 篇分析
│   ├── evolution-tracker.ts       # 進化追跡
│   └── promotion-manager.ts       # 昇格管理
├── long-term/                     # 長期記憶
│   ├── index.ts
│   ├── long-term-memory.ts        # 長期記憶管理
│   ├── knowledge-database.ts      # 知識データベース
│   ├── search-optimizer.ts        # 検索最適化
│   └── consolidation-engine.ts    # 統合エンジン
├── integration/                   # 統合機能
│   ├── cache-coordinator.ts       # キャッシュ統合
│   ├── duplicate-resolver.ts      # 重複解決
│   ├── quality-assurance.ts       # 品質保証
│   └── access-optimizer.ts        # アクセス最適化
├── storage/                       # ストレージ層
│   ├── persistent-storage.ts      # 永続化ストレージ
│   ├── backup-system.ts           # バックアップシステム
│   ├── migration-tools.ts         # マイグレーションツール
│   └── compression-engine.ts      # 圧縮エンジン
├── interfaces.ts                  # メモリ固有インターフェース
├── types.ts                       # メモリ固有型定義
└── utils/                         # メモリ専用ユーティリティ
    ├── memory-validator.ts        # メモリ検証
    ├── data-serializer.ts         # データシリアライザー
    └── performance-monitor.ts     # パフォーマンス監視
```

#### systems/memory/core/memory-manager.ts
```typescript
export interface IMemoryManager {
  storeShortTerm(data: ShortTermData): Promise<void>
  storeMidTerm(data: MidTermData): Promise<void>
  storeLongTerm(data: LongTermData): Promise<void>
  searchUnified(query: SearchQuery): Promise<SearchResult[]>
  getRecentContext(depth: number): Promise<ContextData[]>
  promoteToHigherLevel(memoryId: string, level: MemoryLevel): Promise<void>
}

export class MemoryManager implements IMemoryManager {
  // パブリックメソッド
  + storeShortTerm(data: ShortTermData): Promise<void>
  + storeMidTerm(data: MidTermData): Promise<void>
  + storeLongTerm(data: LongTermData): Promise<void>
  + searchUnified(query: SearchQuery): Promise<SearchResult[]>
  + getRecentContext(depth: number): Promise<ContextData[]>
  + promoteToHigherLevel(memoryId: string, level: MemoryLevel): Promise<void>
  + cleanup(): Promise<void>
  + getStatistics(): MemoryStatistics
  + validateIntegrity(): Promise<IntegrityReport>
  
  // プライベートメソッド
  - routeToAppropriateLevel(data: MemoryData): MemoryLevel
  - validateDataIntegrity(data: MemoryData): ValidationResult
  - optimizeStorageDistribution(): Promise<void>
  - coordinateSearchAcrossLevels(query: SearchQuery): Promise<SearchResult[]>
  - handleMemoryOverflow(level: MemoryLevel): Promise<void>
  - synchronizeLevels(): Promise<void>
  
  // ヘルパーメソッド
  - calculateMemoryImportance(data: MemoryData): number
  - determineRetentionPeriod(data: MemoryData): number
  - createMemorySnapshot(): MemorySnapshot
  - logMemoryOperation(operation: MemoryOperation): void
}
```

#### systems/memory/short-term/short-term-memory.ts
```typescript
export interface IShortTermMemory {
  store(data: ShortTermData): Promise<void>
  getRecent(count: number): Promise<ShortTermData[]>
  getByTimeRange(startTime: Date, endTime: Date): Promise<ShortTermData[]>
  updateData(dataId: string, updates: Partial<ShortTermData>): Promise<void>
  cleanup(): Promise<void>
}

export class ShortTermMemory implements IShortTermMemory {
  // パブリックメソッド
  + store(data: ShortTermData): Promise<void>
  + getRecent(count: number): Promise<ShortTermData[]>
  + getByTimeRange(startTime: Date, endTime: Date): Promise<ShortTermData[]>
  + updateData(dataId: string, updates: Partial<ShortTermData>): Promise<void>
  + cleanup(): Promise<void>
  + getContinuityData(): ContinuityData
  + getCharacterStates(): CharacterStateMap
  
  // プライベートメソッド
  - isExpired(data: ShortTermData): boolean
  - enforceCapacityLimit(): Promise<void>
  - selectDataForEviction(): ShortTermData[]
  - validateDataContinuity(data: ShortTermData): boolean
  - updateContinuityChain(data: ShortTermData): void
  - compressOldData(): Promise<void>
  
  // ヘルパーメソッド
  - calculateDataImportance(data: ShortTermData): number
  - createDataIndex(): DataIndex
  - sortByRelevance(data: ShortTermData[]): ShortTermData[]
  - logShortTermOperation(operation: string, data: ShortTermData): void
}
```

## 👥 systems/character/ - キャラクター管理システム

### 📂 systems/character/
```
systems/character/
├── index.ts                       # 公開インターフェース
├── core/                          # コア機能
│   ├── character-manager.ts       # キャラクター管理
│   ├── character-factory.ts       # キャラクター生成
│   ├── character-repository.ts    # キャラクターリポジトリ
│   └── character-validator.ts     # キャラクター検証
├── mbti/                          # MBTI統合システム
│   ├── mbti-analyzer.ts           # MBTI分析
│   ├── mbti-database.ts           # MBTI統計データベース
│   ├── learning-pattern-map.ts    # 学習パターンマッピング
│   ├── behavior-predictor.ts      # 行動予測
│   └── growth-tendency-analyzer.ts # 成長傾向分析
├── psychology/                    # 心理分析
│   ├── psychology-analyzer.ts     # 心理分析
│   ├── emotion-tracker.ts         # 感情追跡
│   ├── behavior-analyzer.ts       # 行動分析
│   └── psychological-profiler.ts  # 心理プロファイル
├── growth/                        # 成長管理
│   ├── growth-manager.ts          # 成長管理
│   ├── growth-plan-generator.ts   # 成長計画生成
│   ├── milestone-tracker.ts       # マイルストーン追跡
│   └── evolution-predictor.ts     # 進化予測
├── relationships/                 # 関係性管理
│   ├── relationship-manager.ts    # 関係性管理
│   ├── relationship-analyzer.ts   # 関係性分析
│   ├── interaction-tracker.ts     # インタラクション追跡
│   └── social-network-analyzer.ts # ソーシャルネットワーク分析
├── skills/                        # スキル管理
│   ├── skill-manager.ts           # スキル管理
│   ├── skill-tree-builder.ts      # スキルツリー構築
│   ├── proficiency-tracker.ts     # 習熟度追跡
│   └── learning-path-optimizer.ts # 学習経路最適化
├── parameters/                    # パラメータ管理
│   ├── parameter-manager.ts       # パラメータ管理
│   ├── parameter-calculator.ts    # パラメータ計算
│   ├── growth-simulator.ts        # 成長シミュレーター
│   └── balance-validator.ts       # バランス検証
├── detection/                     # 検出システム
│   ├── character-detector.ts      # キャラクター検出
│   ├── appearance-tracker.ts      # 登場追跡
│   ├── mention-analyzer.ts        # 言及分析
│   └── relevance-calculator.ts    # 関連度計算
├── interfaces.ts                  # キャラクター固有インターフェース
├── types.ts                       # キャラクター固有型定義
└── utils/                         # キャラクター専用ユーティリティ
    ├── character-serializer.ts    # キャラクターシリアライザー
    ├── name-generator.ts          # 名前生成器
    └── personality-calculator.ts   # 性格計算機
```

#### systems/character/core/character-manager.ts
```typescript
export interface ICharacterManager {
  createCharacter(definition: CharacterDefinition): Promise<Character>
  getCharacter(characterId: string): Promise<Character | null>
  updateCharacter(characterId: string, updates: CharacterUpdate): Promise<Character>
  deleteCharacter(characterId: string): Promise<void>
  getAllCharacters(): Promise<Character[]>
  getCharactersByType(type: CharacterType): Promise<Character[]>
  searchCharacters(criteria: SearchCriteria): Promise<Character[]>
}

export class CharacterManager implements ICharacterManager {
  // パブリックメソッド
  + createCharacter(definition: CharacterDefinition): Promise<Character>
  + getCharacter(characterId: string): Promise<Character | null>
  + updateCharacter(characterId: string, updates: CharacterUpdate): Promise<Character>
  + deleteCharacter(characterId: string): Promise<void>
  + getAllCharacters(): Promise<Character[]>
  + getCharactersByType(type: CharacterType): Promise<Character[]>
  + searchCharacters(criteria: SearchCriteria): Promise<Character[]>
  + getCharacterWithDetails(characterId: string): Promise<DetailedCharacter>
  + analyzeCharacterPsychology(characterId: string): Promise<PsychologyAnalysis>
  + getCharacterRelationships(characterId: string): Promise<Relationship[]>
  + trackCharacterGrowth(characterId: string): Promise<GrowthHistory>
  
  // プライベートメソッド
  - validateCharacterDefinition(definition: CharacterDefinition): ValidationResult
  - assignMBTIProfile(personality: PersonalityTraits): MBTIProfile
  - generateInitialParameters(character: Character): CharacterParameters
  - createDefaultGrowthPlan(character: Character): GrowthPlan
  - indexCharacterForSearch(character: Character): void
  - handleCharacterCreationEvent(character: Character): void
  
  // ヘルパーメソッド
  - buildCharacterSearchIndex(): SearchIndex
  - calculateCharacterComplexity(character: Character): number
  - generateCharacterSummary(character: Character): CharacterSummary
  - logCharacterOperation(operation: string, characterId: string): void
}
```

#### systems/character/mbti/mbti-analyzer.ts
```typescript
export interface IMBTIAnalyzer {
  analyzeMBTI(personality: PersonalityTraits): MBTIAnalysis
  getLearningPattern(mbtiType: MBTIType): LearningPattern
  getBehaviorPattern(mbtiType: MBTIType): BehaviorPattern
  getGrowthTendencies(mbtiType: MBTIType): GrowthTendency[]
  predictBehavior(mbtiType: MBTIType, situation: Situation): BehaviorPrediction
}

export class MBTIAnalyzer implements IMBTIAnalyzer {
  // パブリックメソッド
  + analyzeMBTI(personality: PersonalityTraits): MBTIAnalysis
  + getLearningPattern(mbtiType: MBTIType): LearningPattern
  + getBehaviorPattern(mbtiType: MBTIType): BehaviorPattern
  + getGrowthTendencies(mbtiType: MBTIType): GrowthTendency[]
  + predictBehavior(mbtiType: MBTIType, situation: Situation): BehaviorPrediction
  + getStatisticalData(mbtiType: MBTIType): MBTIStatistics
  + generateFailureScenarios(mbtiType: MBTIType): FailureScenario[]
  + analyzeTeachingStyle(mbtiType: MBTIType): TeachingStyle
  
  // プライベートメソッド
  - calculateMBTIDimensions(traits: PersonalityTraits): MBTIDimensions
  - mapTraitsToMBTI(traits: PersonalityTraits): MBTIType
  - validateMBTIConsistency(analysis: MBTIAnalysis): boolean
  - loadStatisticalDatabase(): MBTIDatabase
  - processPersonalityIndicators(traits: PersonalityTraits): IndicatorScores
  
  // ヘルパーメソッド
  - normalizeDimensionScores(scores: DimensionScores): NormalizedScores
  - createMBTIProfile(type: MBTIType, confidence: number): MBTIProfile
  - generateMBTIReport(analysis: MBTIAnalysis): MBTIReport
  - logMBTIAnalysis(input: PersonalityTraits, output: MBTIAnalysis): void
}
```

## 🎓 systems/learning/ - 学習旅程システム

### 📂 systems/learning/
```
systems/learning/
├── index.ts                       # 公開インターフェース
├── core/                          # コア機能
│   ├── learning-journey-manager.ts # 学習旅程管理
│   ├── journey-orchestrator.ts    # 旅程オーケストレーター
│   ├── stage-progression.ts       # 段階進行管理
│   └── learning-validator.ts      # 学習検証
├── frameworks/                    # フレームワークデータベース
│   ├── framework-database.ts      # フレームワークDB
│   ├── framework-loader.ts        # フレームワークローダー
│   ├── framework-categorizer.ts   # フレームワーク分類
│   ├── framework-adapter.ts       # フレームワーク適応
│   └── custom-framework-builder.ts # カスタムフレームワーク構築
├── journey/                       # 学習旅程管理
│   ├── journey-builder.ts         # 旅程構築
│   ├── stage-manager.ts          # ステージ管理
│   ├── progress-tracker.ts       # 進捗追跡
│   ├── milestone-detector.ts     # マイルストーン検出
│   └── learning-event-generator.ts # 学習イベント生成
├── integration/                   # キャラクター統合
│   ├── character-learning-integrator.ts # キャラクター学習統合
│   ├── mbti-learning-mapper.ts    # MBTI学習マッピング
│   ├── personality-adapter.ts     # 性格適応
│   ├── failure-scenario-generator.ts # 失敗シナリオ生成
│   └── teaching-interaction-simulator.ts # 教育インタラクションシミュレーター
├── conceptualization/             # 概念化システム
│   ├── concept-transformer.ts     # 概念変換
│   ├── presentation-optimizer.ts  # プレゼンテーション最適化
│   ├── famous-framework-handler.ts # 有名フレームワーク処理
│   └── natural-embedding-engine.ts # 自然埋め込みエンジン
├── emotional/                     # 感情学習統合
│   ├── emotional-arc-designer.ts  # 感情アーク設計
│   ├── cathartic-moment-creator.ts # カタルシス瞬間創造
│   ├── empathy-point-generator.ts # 共感ポイント生成
│   └── emotional-learning-tracker.ts # 感情学習追跡
├── business-frameworks/           # ビジネスフレームワーク
│   ├── framework-library.ts       # フレームワークライブラリ
│   ├── strategy-factory.ts        # 戦略ファクトリ
│   ├── base-strategy.ts          # 基底戦略
│   ├── adler-psychology-strategy.ts # アドラー心理学戦略
│   ├── drucker-management-strategy.ts # ドラッカー経営戦略
│   ├── issue-driven-strategy.ts   # 課題解決戦略
│   └── socratic-dialogue-strategy.ts # ソクラテス対話戦略
├── interfaces.ts                  # 学習固有インターフェース
├── types.ts                       # 学習固有型定義
└── utils/                         # 学習専用ユーティリティ
    ├── learning-calculator.ts     # 学習計算機
    ├── concept-validator.ts       # 概念検証
    └── progress-analyzer.ts       # 進捗分析
```

#### systems/learning/core/learning-journey-manager.ts
```typescript
export interface ILearningJourneyManager {
  createJourney(character: Character, objective: LearningObjective): Promise<LearningJourney>
  updateProgress(journeyId: string, progress: LearningProgress): Promise<void>
  getJourney(journeyId: string): Promise<LearningJourney | null>
  getCurrentStage(journeyId: string): Promise<LearningStage | null>
  advanceStage(journeyId: string): Promise<StageAdvancement>
  generateLearningEvent(journey: LearningJourney): Promise<LearningEvent>
}

export class LearningJourneyManager implements ILearningJourneyManager {
  // パブリックメソッド
  + createJourney(character: Character, objective: LearningObjective): Promise<LearningJourney>
  + updateProgress(journeyId: string, progress: LearningProgress): Promise<void>
  + getJourney(journeyId: string): Promise<LearningJourney | null>
  + getCurrentStage(journeyId: string): Promise<LearningStage | null>
  + advanceStage(journeyId: string): Promise<StageAdvancement>
  + generateLearningEvent(journey: LearningJourney): Promise<LearningEvent>
  + analyzeJourneyEffectiveness(journeyId: string): Promise<EffectivenessReport>
  + getRecommendedFrameworks(character: Character): Promise<Framework[]>
  + simulateJourneyOutcome(journey: LearningJourney): Promise<OutcomeSimulation>
  
  // プライベートメソッド
  - selectOptimalFramework(objective: LearningObjective, character: Character): Promise<Framework>
  - personalizeFramework(framework: Framework, character: Character): PersonalizedFramework
  - calculateLearningDifficulty(framework: Framework, character: Character): number
  - validateJourneyConsistency(journey: LearningJourney): ValidationResult
  - createLearningStages(framework: Framework, character: Character): LearningStage[]
  - handleStageTransition(journey: LearningJourney, newStage: LearningStage): void
  
  // ヘルパーメソッド
  - mapMBTIToLearningStyle(mbtiType: MBTIType): LearningStyle
  - generateFailureScenarios(character: Character, framework: Framework): FailureScenario[]
  - calculateJourneyComplexity(journey: LearningJourney): number
  - logJourneyOperation(operation: string, journeyId: string): void
}
```

#### systems/learning/frameworks/framework-database.ts
```typescript
export interface IFrameworkDatabase {
  getFramework(frameworkId: string): Promise<Framework | null>
  getFrameworksByCategory(category: FrameworkCategory): Promise<Framework[]>
  getFamousFrameworks(): Promise<Framework[]>
  searchFrameworks(query: string): Promise<Framework[]>
  addFramework(framework: Framework): Promise<void>
  updateFramework(frameworkId: string, updates: FrameworkUpdate): Promise<void>
}

export class FrameworkDatabase implements IFrameworkDatabase {
  // パブリックメソッド
  + getFramework(frameworkId: string): Promise<Framework | null>
  + getFrameworksByCategory(category: FrameworkCategory): Promise<Framework[]>
  + getFamousFrameworks(): Promise<Framework[]>
  + searchFrameworks(query: string): Promise<Framework[]>
  + addFramework(framework: Framework): Promise<void>
  + updateFramework(frameworkId: string, updates: FrameworkUpdate): Promise<void>
  + getFrameworkHierarchy(): Promise<FrameworkHierarchy>
  + validateFramework(framework: Framework): ValidationResult
  + getFrameworkStatistics(): Promise<FrameworkStatistics>
  
  // プライベートメソッド
  - loadFrameworkData(): Promise<void>
  - categorizeFramework(framework: Framework): FrameworkCategory
  - buildSearchIndex(): SearchIndex
  - validateFrameworkStructure(framework: Framework): ValidationResult
  - createFrameworkMetadata(framework: Framework): FrameworkMetadata
  - updateFrameworkIndex(framework: Framework): void
  
  // ヘルパーメソッド
  - calculateFrameworkComplexity(framework: Framework): number
  - generateFrameworkSummary(framework: Framework): FrameworkSummary
  - isFrameworkFamous(framework: Framework): boolean
  - logFrameworkOperation(operation: string, frameworkId: string): void
}
```

## 📖 systems/plot/ - プロット管理システム

### 📂 systems/plot/
```
systems/plot/
├── index.ts                       # 公開インターフェース
├── core/                          # コア機能
│   ├── plot-manager.ts            # プロット管理
│   ├── plot-orchestrator.ts       # プロットオーケストレーター
│   ├── consistency-validator.ts   # 一貫性検証
│   └── plot-analyzer.ts           # プロット分析
├── layers/                        # 3層プロット構造
│   ├── layer-manager.ts           # レイヤー管理
│   ├── concrete-plot.ts           # 具体的プロット
│   ├── section-plot.ts            # 篇プロット
│   ├── abstract-plot.ts           # 抽象的プロット
│   └── layer-synchronizer.ts      # レイヤー同期
├── quality/                       # 品質保証
│   ├── quality-controller.ts      # 品質制御
│   ├── deviation-detector.ts      # 逸脱検出
│   ├── professional-standard.ts   # プロ品質基準
│   └── improvement-generator.ts   # 改善提案生成
├── adaptation/                    # 動的調整
│   ├── adaptive-controller.ts     # 適応制御
│   ├── trajectory-adjuster.ts     # 軌道調整
│   ├── natural-flow-optimizer.ts  # 自然フロー最適化
│   └── story-pace-manager.ts      # ストーリーペース管理
├── bridge/                        # 生成ブリッジ
│   ├── generation-bridge.ts       # 生成ブリッジ
│   ├── context-adapter.ts         # コンテキスト適応
│   ├── directive-generator.ts     # 指示生成
│   └── element-formatter.ts       # 要素フォーマッター
├── interfaces.ts                  # プロット固有インターフェース
├── types.ts                       # プロット固有型定義
└── utils/                         # プロット専用ユーティリティ
    ├── plot-validator.ts          # プロット検証
    ├── narrative-calculator.ts    # 物語計算機
    └── structure-analyzer.ts      # 構造分析
```

#### systems/plot/core/plot-manager.ts
```typescript
export interface IPlotManager {
  getConcretePlot(chapterNumber: number): Promise<ConcretePlot | null>
  getSectionPlot(sectionId: string): Promise<SectionPlot | null>
  getAbstractPlot(): Promise<AbstractPlot>
  updatePlotProgression(progression: PlotProgression): Promise<void>
  validatePlotConsistency(): Promise<ConsistencyReport>
  generatePlotDirective(chapterNumber: number): Promise<PlotDirective>
}

export class PlotManager implements IPlotManager {
  // パブリックメソッド
  + getConcretePlot(chapterNumber: number): Promise<ConcretePlot | null>
  + getSectionPlot(sectionId: string): Promise<SectionPlot | null>
  + getAbstractPlot(): Promise<AbstractPlot>
  + updatePlotProgression(progression: PlotProgression): Promise<void>
  + validatePlotConsistency(): Promise<ConsistencyReport>
  + generatePlotDirective(chapterNumber: number): Promise<PlotDirective>
  + adjustPlotDirection(adjustment: PlotAdjustment): Promise<void>
  + getPlotStatistics(): Promise<PlotStatistics>
  + analyzeNarrativeFlow(): Promise<NarrativeFlowAnalysis>
  
  // プライベートメソッド
  - synchronizeLayerConsistency(): Promise<void>
  - calculatePlotDeviation(intended: Plot, actual: Plot): DeviationReport
  - identifyPlotTensions(): TensionPoint[]
  - validateNarrativeLogic(plot: Plot): ValidationResult
  - optimizePlotFlow(plot: Plot): OptimizedPlot
  - handlePlotInconsistency(inconsistency: PlotInconsistency): void
  
  // ヘルパーメソッド
  - mapChapterToSection(chapterNumber: number): string
  - calculatePlotComplexity(plot: Plot): number
  - generatePlotSummary(plot: Plot): PlotSummary
  - logPlotOperation(operation: string, plotData: any): void
}
```

## 🎨 systems/theme/ - テーマ管理システム

### 📂 systems/theme/
```
systems/theme/
├── index.ts                       # 公開インターフェース
├── core/                          # コア機能
│   ├── theme-manager.ts           # テーマ管理
│   ├── theme-orchestrator.ts      # テーマオーケストレーター
│   ├── consistency-guardian.ts    # 一貫性守護
│   └── theme-analyzer.ts          # テーマ分析
├── evolution/                     # テーマ進化
│   ├── evolution-tracker.ts       # 進化追跡
│   ├── natural-progression.ts     # 自然進行
│   ├── depth-enhancer.ts          # 深化促進
│   └── variation-generator.ts     # バリエーション生成
├── expression/                    # テーマ表現
│   ├── expression-adapter.ts      # 表現適応
│   ├── subtle-integration.ts      # 微妙な統合
│   ├── resonance-calculator.ts    # 共鳴計算
│   └── impact-optimizer.ts        # インパクト最適化
├── validation/                    # テーマ検証
│   ├── consistency-validator.ts   # 一貫性検証
│   ├── depth-analyzer.ts          # 深度分析
│   ├── message-clarity-checker.ts # メッセージ明確性チェック
│   └── reader-impact-assessor.ts  # 読者インパクト評価
├── interfaces.ts                  # テーマ固有インターフェース
├── types.ts                       # テーマ固有型定義
└── utils/                         # テーマ専用ユーティリティ
    ├── theme-calculator.ts        # テーマ計算機
    ├── metaphor-generator.ts      # メタファー生成
    └── symbolism-analyzer.ts      # 象徴分析
```

## 🌍 systems/world/ - 世界観設定システム

### 📂 systems/world/
```
systems/world/
├── index.ts                       # 公開インターフェース
├── core/                          # コア機能
│   ├── world-manager.ts           # 世界管理
│   ├── setting-coordinator.ts     # 設定統合
│   ├── consistency-enforcer.ts    # 一貫性強制
│   └── world-analyzer.ts          # 世界分析
├── evolution/                     # 世界進化
│   ├── evolution-engine.ts        # 進化エンジン
│   ├── natural-change-simulator.ts # 自然変化シミュレーター
│   ├── event-driven-evolution.ts  # イベント駆動進化
│   └── temporal-consistency.ts    # 時間的一貫性
├── description/                   # 世界描写
│   ├── description-generator.ts   # 描写生成
│   ├── immersion-enhancer.ts      # 没入感強化
│   ├── detail-optimizer.ts        # 詳細最適化
│   └── atmosphere-creator.ts      # 雰囲気創造
├── validation/                    # 世界検証
│   ├── logic-validator.ts         # 論理検証
│   ├── physics-checker.ts         # 物理チェック
│   ├── culture-consistency.ts     # 文化一貫性
│   └── timeline-validator.ts      # タイムライン検証
├── interfaces.ts                  # 世界固有インターフェース
├── types.ts                       # 世界固有型定義
└── utils/                         # 世界専用ユーティリティ
    ├── world-calculator.ts        # 世界計算機
    ├── geography-generator.ts     # 地理生成
    └── culture-analyzer.ts        # 文化分析
```

## 🎬 systems/genre/ - ジャンル管理システム

### 📂 systems/genre/
```
systems/genre/
├── index.ts                       # 公開インターフェース
├── core/                          # コア機能
│   ├── genre-manager.ts           # ジャンル管理
│   ├── setting-loader.ts          # 設定ローダー
│   ├── adaptation-engine.ts       # 適応エンジン
│   └── genre-analyzer.ts          # ジャンル分析
├── characteristics/               # ジャンル特性
│   ├── characteristic-database.ts # 特性データベース
│   ├── style-mapper.ts            # スタイルマッピング
│   ├── tension-profiler.ts        # テンション分析
│   └── expectation-manager.ts     # 期待管理
├── adaptation/                    # ジャンル適応
│   ├── content-adapter.ts         # コンテンツ適応
│   ├── character-adapter.ts       # キャラクター適応
│   ├── plot-adapter.ts            # プロット適応
│   └── style-adapter.ts           # スタイル適応
├── validation/                    # ジャンル検証
│   ├── compliance-checker.ts      # 準拠チェック
│   ├── authenticity-validator.ts  # 真正性検証
│   ├── reader-expectation-tester.ts # 読者期待テスト
│   └── genre-consistency-monitor.ts # ジャンル一貫性監視
├── interfaces.ts                  # ジャンル固有インターフェース
├── types.ts                       # ジャンル固有型定義
└── utils/                         # ジャンル専用ユーティリティ
    ├── genre-classifier.ts        # ジャンル分類器
    ├── trope-analyzer.ts          # トロープ分析
    └── convention-checker.ts      # 慣例チェッカー
```

## 📊 systems/analysis/ - 分析システム

### 📂 systems/analysis/
```
systems/analysis/
├── index.ts                       # 公開インターフェース
├── core/                          # コア機能
│   ├── analysis-engine.ts         # 分析エンジン
│   ├── quality-assessor.ts        # 品質評価
│   ├── multi-dimensional-analyzer.ts # 多次元分析
│   └── insight-generator.ts       # 洞察生成
├── quality/                       # 品質分析
│   ├── readability-analyzer.ts    # 読みやすさ分析
│   ├── engagement-calculator.ts   # エンゲージメント計算
│   ├── coherence-checker.ts       # 一貫性チェック
│   └── impact-assessor.ts         # インパクト評価
├── reader-experience/             # 読者体験分析
│   ├── experience-simulator.ts    # 体験シミュレーター
│   ├── emotional-journey-tracker.ts # 感情旅程追跡
│   ├── learning-effectiveness.ts  # 学習効果
│   └── satisfaction-predictor.ts  # 満足度予測
├── narrative/                     # 物語分析
│   ├── structure-analyzer.ts      # 構造分析
│   ├── flow-optimizer.ts          # フロー最適化
│   ├── tension-curve-analyzer.ts  # テンション曲線分析
│   └── pacing-evaluator.ts        # ペーシング評価
├── improvement/                   # 改善提案
│   ├── improvement-engine.ts      # 改善エンジン
│   ├── weakness-detector.ts       # 弱点検出
│   ├── enhancement-suggester.ts   # 強化提案
│   └── optimization-planner.ts    # 最適化計画
├── interfaces.ts                  # 分析固有インターフェース
├── types.ts                       # 分析固有型定義
└── utils/                         # 分析専用ユーティリティ
    ├── metric-calculator.ts       # メトリック計算機
    ├── statistics-engine.ts       # 統計エンジン
    └── visualization-helper.ts    # 可視化ヘルパー
```

## ✨ systems/expression/ - 表現提案システム

### 📂 systems/expression/
```
systems/expression/
├── index.ts                       # 公開インターフェース
├── core/                          # コア機能
│   ├── expression-enhancer.ts     # 表現強化
│   ├── style-optimizer.ts         # スタイル最適化
│   ├── variation-generator.ts     # バリエーション生成
│   └── expression-analyzer.ts     # 表現分析
├── style/                         # 文体管理
│   ├── style-adapter.ts           # スタイル適応
│   ├── character-voice-mapper.ts  # キャラクター声調マッピング
│   ├── scene-tone-adjuster.ts     # シーン調子調整
│   └── mood-expression-engine.ts  # ムード表現エンジン
├── emotional/                     # 感情表現
│   ├── emotion-amplifier.ts       # 感情増幅
│   ├── subtlety-enhancer.ts       # 微細表現強化
│   ├── psychological-depth.ts     # 心理的深度
│   └── empathy-generator.ts       # 共感生成
├── variety/                       # 表現多様性
│   ├── repetition-detector.ts     # 反復検出
│   ├── synonym-suggester.ts       # 類義語提案
│   ├── pattern-breaker.ts         # パターン打破
│   └── freshness-injector.ts      # 新鮮さ注入
├── interfaces.ts                  # 表現固有インターフェース
├── types.ts                       # 表現固有型定義
└── utils/                         # 表現専用ユーティリティ
    ├── expression-calculator.ts   # 表現計算機
    ├── metaphor-database.ts       # メタファーデータベース
    └── rhetorical-analyzer.ts     # 修辞分析
```

## 📏 systems/rules/ - ルール管理システム

### 📂 systems/rules/
```
systems/rules/
├── index.ts                       # 公開インターフェース
├── core/                          # コア機能
│   ├── rule-manager.ts            # ルール管理
│   ├── rule-engine.ts             # ルールエンジン
│   ├── enforcement-controller.ts  # 強制制御
│   └── violation-handler.ts       # 違反処理
├── categories/                    # ルールカテゴリ
│   ├── writing-rules.ts           # 文章ルール
│   ├── narrative-rules.ts         # 物語ルール
│   ├── consistency-rules.ts       # 一貫性ルール
│   └── quality-rules.ts           # 品質ルール
├── validation/                    # ルール検証
│   ├── grammar-validator.ts       # 文法検証
│   ├── style-validator.ts         # スタイル検証
│   ├── logic-validator.ts         # 論理検証
│   └── format-validator.ts        # フォーマット検証
├── configuration/                 # ルール設定
│   ├── rule-loader.ts             # ルールローダー
│   ├── custom-rule-builder.ts     # カスタムルール構築
│   ├── priority-manager.ts        # 優先度管理
│   └── exception-handler.ts       # 例外処理
├── interfaces.ts                  # ルール固有インターフェース
├── types.ts                       # ルール固有型定義
└── utils/                         # ルール専用ユーティリティ
    ├── rule-parser.ts             # ルール解析器
    ├── pattern-matcher.ts         # パターンマッチャー
    └── severity-calculator.ts     # 重要度計算機
```

## 🎯 systems/foreshadowing/ - 伏線管理システム

### 📂 systems/foreshadowing/
```
systems/foreshadowing/
├── index.ts                       # 公開インターフェース
├── core/                          # コア機能
│   ├── foreshadowing-manager.ts   # 伏線管理
│   ├── planting-engine.ts         # 設置エンジン
│   ├── resolution-scheduler.ts    # 解決スケジューラー
│   └── consistency-tracker.ts     # 一貫性追跡
├── multi-layer/                   # 多層伏線
│   ├── layer-coordinator.ts       # レイヤー統合
│   ├── short-term-planner.ts      # 短期計画
│   ├── medium-term-planner.ts     # 中期計画
│   ├── long-term-planner.ts       # 長期計画
│   └── cross-layer-optimizer.ts   # 横断最適化
├── subtlety/                      # 微細制御
│   ├── subtlety-controller.ts     # 微細制御
│   ├── natural-integration.ts     # 自然統合
│   ├── reader-awareness-manager.ts # 読者認識管理
│   └── revelation-timing.ts       # 発覚タイミング
├── effectiveness/                 # 効果測定
│   ├── impact-analyzer.ts         # インパクト分析
│   ├── satisfaction-predictor.ts  # 満足度予測
│   ├── surprise-calculator.ts     # 驚き計算
│   └── payoff-optimizer.ts        # ペイオフ最適化
├── interfaces.ts                  # 伏線固有インターフェース
├── types.ts                       # 伏線固有型定義
└── utils/                         # 伏線専用ユーティリティ
    ├── foreshadowing-detector.ts  # 伏線検出器
    ├── timing-calculator.ts       # タイミング計算機
    └── effectiveness-meter.ts     # 効果測定器
```

## ⚙️ systems/configuration/ - システム設定・パラメータ管理

### 📂 systems/configuration/
```
systems/configuration/
├── index.ts                       # 公開インターフェース
├── core/                          # コア機能
│   ├── configuration-manager.ts   # 設定管理
│   ├── parameter-controller.ts    # パラメータ制御
│   ├── template-manager.ts        # テンプレート管理
│   └── validation-engine.ts       # 検証エンジン
├── templates/                     # テンプレート管理
│   ├── template-loader.ts         # テンプレートローダー
│   ├── standard-template.ts       # 標準テンプレート
│   ├── quality-template.ts        # 品質テンプレート
│   ├── speed-template.ts          # 速度テンプレート
│   └── custom-template-builder.ts # カスタムテンプレート構築
├── optimization/                  # 最適化
│   ├── parameter-optimizer.ts     # パラメータ最適化
│   ├── performance-tuner.ts       # パフォーマンス調整
│   ├── quality-balancer.ts        # 品質バランサー
│   └── adaptive-controller.ts     # 適応制御
├── integration/                   # 統合管理
│   ├── system-coordinator.ts      # システム統合
│   ├── consistency-enforcer.ts    # 一貫性強制
│   ├── dependency-resolver.ts     # 依存性解決
│   └── conflict-resolver.ts       # 競合解決
├── monitoring/                    # 監視機能
│   ├── change-monitor.ts          # 変更監視
│   ├── impact-analyzer.ts         # 影響分析
│   ├── performance-tracker.ts     # パフォーマンス追跡
│   └── health-checker.ts          # ヘルスチェック
├── interfaces.ts                  # 設定固有インターフェース
├── types.ts                       # 設定固有型定義
└── utils/                         # 設定専用ユーティリティ
    ├── config-parser.ts           # 設定解析器
    ├── merger.ts                  # 設定マージャー
    └── validator.ts               # 設定検証器
```

## 🤖 systems/ml-training/ - ML/DL学習用データ収集・蓄積

### 📂 systems/ml-training/
```
systems/ml-training/
├── index.ts                       # 公開インターフェース
├── core/                          # コア機能
│   ├── data-collector.ts          # データ収集
│   ├── training-dataset-builder.ts # 訓練データセット構築
│   ├── storage-manager.ts         # ストレージ管理
│   └── export-controller.ts       # エクスポート制御
├── collection/                    # データ収集
│   ├── generation-tracker.ts      # 生成追跡
│   ├── user-behavior-tracker.ts   # ユーザー行動追跡
│   ├── quality-metrics-collector.ts # 品質メトリック収集
│   └── feedback-aggregator.ts     # フィードバック集約
├── processing/                    # データ処理
│   ├── data-preprocessor.ts       # データ前処理
│   ├── feature-extractor.ts       # 特徴抽出
│   ├── anonymizer.ts              # 匿名化
│   └── structurer.ts              # 構造化
├── analysis/                      # データ分析
│   ├── pattern-analyzer.ts        # パターン分析
│   ├── correlation-finder.ts      # 相関発見
│   ├── success-factor-identifier.ts # 成功要因特定
│   └── trend-detector.ts          # トレンド検出
├── storage/                       # ストレージ管理
│   ├── d-drive-manager.ts          # Dドライブ管理
│   ├── backup-controller.ts       # バックアップ制御
│   ├── compression-engine.ts      # 圧縮エンジン
│   └── retention-manager.ts       # 保持管理
├── interfaces.ts                  # ML訓練固有インターフェース
├── types.ts                       # ML訓練固有型定義
└── utils/                         # ML訓練専用ユーティリティ
    ├── data-validator.ts          # データ検証
    ├── statistics-calculator.ts   # 統計計算機
    └── format-converter.ts        # フォーマット変換器
```

---

## 🔄 generation/ - 生成制御層詳細設計

### 📂 generation/context/
```
generation/context/
├── index.ts                       # 公開インターフェース
├── core/                          # コア機能
│   ├── context-generator.ts       # コンテキスト生成
│   ├── data-coordinator.ts        # データ統合
│   ├── optimization-engine.ts     # 最適化エンジン
│   └── validation-controller.ts   # 検証制御
├── collectors/                    # データ収集器
│   ├── memory-collector.ts        # メモリ収集
│   ├── character-collector.ts     # キャラクター収集
│   ├── plot-collector.ts          # プロット収集
│   ├── learning-collector.ts      # 学習収集
│   ├── world-collector.ts         # 世界収集
│   ├── theme-collector.ts         # テーマ収集
│   └── analysis-collector.ts      # 分析収集
├── integration/                   # データ統合
│   ├── data-merger.ts             # データマージ
│   ├── priority-calculator.ts     # 優先度計算
│   ├── relevance-filter.ts        # 関連性フィルター
│   └── load-balancer.ts           # 負荷バランサー
├── interfaces.ts                  # コンテキスト固有インターフェース
├── types.ts                       # コンテキスト固有型定義
└── utils/                         # コンテキスト専用ユーティリティ
    ├── context-calculator.ts      # コンテキスト計算機
    ├── relevance-scorer.ts        # 関連性スコアラー
    └── data-compressor.ts         # データ圧縮器
```

### 📂 generation/prompt/
```
generation/prompt/
├── index.ts                       # 公開インターフェース
├── core/                          # コア機能
│   ├── prompt-generator.ts        # プロンプト生成
│   ├── template-engine.ts         # テンプレートエンジン
│   ├── optimization-controller.ts # 最適化制御
│   └── quality-validator.ts       # 品質検証
├── building/                      # プロンプト構築
│   ├── structure-builder.ts       # 構造構築
│   ├── section-assembler.ts       # セクション組立
│   ├── element-formatter.ts       # 要素フォーマッター
│   └── final-optimizer.ts         # 最終最適化
├── adaptation/                    # プロンプト適応
│   ├── ai-model-adapter.ts        # AIモデル適応
│   ├── length-optimizer.ts        # 長さ最適化
│   ├── complexity-adjuster.ts     # 複雑性調整
│   └── effectiveness-enhancer.ts  # 効果強化
├── interfaces.ts                  # プロンプト固有インターフェース
├── types.ts                       # プロンプト固有型定義
└── utils/                         # プロンプト専用ユーティリティ
    ├── prompt-calculator.ts       # プロンプト計算機
    ├── token-counter.ts           # トークンカウンター
    └── quality-scorer.ts          # 品質スコアラー
```

### 📂 generation/chapter/
```
generation/chapter/
├── index.ts                       # 公開インターフェース
├── core/                          # コア機能
│   ├── chapter-generator.ts       # チャプター生成
│   ├── generation-orchestrator.ts # 生成オーケストレーター
│   ├── result-processor.ts        # 結果処理
│   └── state-updater.ts           # 状態更新
├── validation/                    # チャプター検証
│   ├── quality-validator.ts       # 品質検証
│   ├── consistency-checker.ts     # 一貫性チェック
│   ├── completeness-verifier.ts   # 完全性検証
│   └── standard-compliance.ts     # 基準準拠
├── post-processing/               # 後処理
│   ├── enhancement-processor.ts   # 強化処理
│   ├── format-adjuster.ts         # フォーマット調整
│   ├── metadata-generator.ts      # メタデータ生成
│   └── storage-coordinator.ts     # ストレージ統合
├── interfaces.ts                  # チャプター固有インターフェース
├── types.ts                       # チャプター固有型定義
└── utils/                         # チャプター専用ユーティリティ
    ├── chapter-calculator.ts      # チャプター計算機
    ├── metrics-collector.ts       # メトリック収集器
    └── consistency-validator.ts   # 一貫性検証器
```

---

## 📋 types/ - 全システム共通型定義

### 📂 types/
```
types/
├── index.ts                       # 型定義エクスポート
├── common/                        # 共通型
│   ├── base.ts                    # 基底型
│   ├── id.ts                      # ID型
│   ├── timestamp.ts               # タイムスタンプ型
│   ├── status.ts                  # ステータス型
│   └── result.ts                  # 結果型
├── systems/                       # システム別型
│   ├── memory.ts                  # メモリシステム型
│   ├── character.ts               # キャラクターシステム型
│   ├── learning.ts                # 学習システム型
│   ├── plot.ts                    # プロットシステム型
│   ├── theme.ts                   # テーマシステム型
│   ├── world.ts                   # 世界システム型
│   ├── genre.ts                   # ジャンルシステム型
│   ├── analysis.ts                # 分析システム型
│   ├── expression.ts              # 表現システム型
│   ├── rules.ts                   # ルールシステム型
│   ├── foreshadowing.ts           # 伏線システム型
│   ├── configuration.ts           # 設定システム型
│   └── ml-training.ts             # ML訓練システム型
├── generation/                    # 生成関連型
│   ├── context.ts                 # コンテキスト型
│   ├── prompt.ts                  # プロンプト型
│   └── chapter.ts                 # チャプター型
├── core/                          # コア型
│   ├── container.ts               # コンテナ型
│   ├── lifecycle.ts               # ライフサイクル型
│   └── ai-client.ts               # AIクライアント型
└── api/                           # API型
    ├── request.ts                 # リクエスト型
    ├── response.ts                # レスポンス型
    └── error.ts                   # エラー型
```

---

## 🛠️ utils/ - 全システム共通ユーティリティ

### 📂 utils/
```
utils/
├── index.ts                       # ユーティリティエクスポート
├── core/                          # コアユーティリティ
│   ├── logger.ts                  # ロガー
│   ├── error-handler.ts           # エラーハンドラー
│   ├── validator.ts               # 検証器
│   └── serializer.ts              # シリアライザー
├── async/                         # 非同期ユーティリティ
│   ├── promise-utils.ts           # Promise ユーティリティ
│   ├── retry-helper.ts            # リトライヘルパー
│   ├── timeout-controller.ts      # タイムアウト制御
│   └── queue-manager.ts           # キュー管理
├── data/                          # データユーティリティ
│   ├── transformer.ts             # データ変換器
│   ├── merger.ts                  # データマージャー
│   ├── compressor.ts              # データ圧縮器
│   └── hasher.ts                  # ハッシュ生成器
├── performance/                   # パフォーマンスユーティリティ
│   ├── profiler.ts                # プロファイラー
│   ├── cache-manager.ts           # キャッシュ管理
│   ├── memory-monitor.ts          # メモリ監視
│   └── benchmark.ts               # ベンチマーク
├── text/                          # テキストユーティリティ
│   ├── text-analyzer.ts           # テキスト分析
│   ├── tokenizer.ts               # トークナイザー
│   ├── similarity-calculator.ts   # 類似度計算
│   └── formatter.ts               # フォーマッター
└── security/                      # セキュリティユーティリティ
    ├── sanitizer.ts               # サニタイザー
    ├── encryptor.ts               # 暗号化器
    ├── access-controller.ts       # アクセス制御
    └── audit-logger.ts            # 監査ログ
```

---

## 📜 開発ルール・規約

### 🏗️ アーキテクチャルール

1. **システム独立性**: 各systems/配下のシステムは独立進化可能
2. **インターフェース統一**: 全システムがISystemInterface継承
3. **型安全性**: TypeScript完全型安全、any型禁止
4. **依存性注入**: サービスコンテナ経由でのDI必須
5. **エラーハンドリング**: 統一エラーハンドリング必須

### 📁 ディレクトリルール

1. **ファイル命名**: kebab-case（例: character-manager.ts）
2. **インターフェース**: 各システムディレクトリにinterfaces.ts必須
3. **型定義**: システム固有型はtypes.ts、共通型はtypes/
4. **ユーティリティ**: システム専用はutils/、共通はroot utils/
5. **テスト**: 各ファイルと同階層に.test.tsファイル

### 🔗 システム間連携ルール

1. **直接依存禁止**: システム間の直接import禁止
2. **サービスコンテナ経由**: 全システム間通信はコンテナ経由
3. **イベントバス**: 非同期通信はイベントバス使用
4. **データ交換**: 標準化されたデータフォーマットのみ
5. **バージョニング**: API変更時は後方互換性確保

### 🎯 品質保証ルール

1. **単体テスト**: 全パブリックメソッドのテスト必須（90%カバレッジ）
2. **統合テスト**: システム間連携テスト必須
3. **型チェック**: TypeScript strict mode必須
4. **リント**: ESLint + Prettier必須
5. **ドキュメント**: JSDocコメント必須

この完成形設計により、要件定義書の100%実現と、各システムの独立進化、保守性・拡張性の大幅向上が実現されます。