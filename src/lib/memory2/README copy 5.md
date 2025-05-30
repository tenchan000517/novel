# 📊 統合記憶階層設計案 v2.0 
## 学習旅程システム調査結果反映版

## 🔍 アップデート内容

### 新たに判明した重要な要件
1. **EmotionalLearningIntegrator**の保存処理不安定性への対応
2. **PromptGenerator**の完全なデータ保存機能追加
3. **EventBus**のログ・統計管理機能強化
4. **重複アクセスパターン**の統合設計
5. **学習段階遷移**の詳細追跡機能
6. **感情学習同期**の専用データ構造

---

## 🏗️ 統合記憶階層 v2.0 全体構造

```typescript
interface UnifiedMemoryHierarchy {
  // 短期記憶 (1-10章程度の最近データ + 一時情報)
  shortTerm: ShortTermMemory;
  
  // 中期記憶 (アーク・篇単位 + 進行状態 + 分析結果)
  midTerm: MidTermMemory;
  
  // 長期記憶 (永続設定 + 完了済み分析 + システム状態)
  longTerm: LongTermMemory;
  
  // 統合アクセスAPI（重複除去・安定性重視）
  unifiedAPI: UnifiedMemoryAPI;
  
  // 🆕 イベント駆動統合管理
  eventDrivenState: EventDrivenStateManager;
}
```

---

## 🟢 短期記憶設計 v2.0

```typescript
interface ShortTermMemory {
  // === 章コンテンツ（既存＋拡張） ===
  chapters: {
    content: Map<number, ChapterContent>;
    states: Map<number, ChapterState>;
    recentCache: ChapterContent[];
    
    // 🆕 章ごとの一時分析結果
    temporaryAnalysis: Map<number, TemporaryAnalysisData>;
  };
  
  // === 🆕 プロンプト管理（PromptGenerator対応） ===
  prompts: {
    // 生成されたプロンプトの完全ログ
    generatedPrompts: Map<number, GeneratedPromptLog>;
    
    // プロンプト生成の統計情報
    generationStats: PromptGenerationStats;
    
    // テンプレート使用履歴
    templateUsage: Map<string, TemplateUsageLog>;
    
    // デバッグ用のプロンプト評価結果
    promptEvaluations: Map<number, PromptEvaluationResult>;
  };
  
  // === 🆕 イベント管理（EventBus統合） ===
  events: {
    // イベントログ（最近100件）
    recentEvents: EventLogEntry[];
    
    // イベント統計（リアルタイム）
    eventStats: EventStatistics;
    
    // 購読状態のスナップショット
    subscriptionStates: Map<string, SubscriptionState>;
    
    // イベント関連エラーログ
    eventErrors: EventErrorLog[];
  };
  
  // === 生成コンテキスト（既存＋強化） ===
  generationContext: {
    chapterContextCache: Map<number, GenerationContext>;
    lastPromptInfo: Map<number, PromptInfo>;
    
    // 🆕 学習旅程特有のコンテキスト
    learningContextCache: Map<number, LearningGenerationContext>;
    
    // 🆕 感情統合コンテキスト
    emotionalContextCache: Map<number, EmotionalGenerationContext>;
  };
}

// 🆕 学習旅程システム用の新しいデータ型
interface GeneratedPromptLog {
  chapterNumber: number;
  promptType: PromptType;
  generatedPrompt: string;
  generationOptions: any;
  timestamp: string;
  resultingContent?: string; // 生成された内容（後から更新）
  evaluationScore?: number;  // プロンプトの効果評価
}

interface LearningGenerationContext {
  chapterNumber: number;
  conceptName: string;
  learningStage: LearningStage;
  embodimentPlan: EmbodimentPlan;
  previousStageTransition?: LearningStageTransition;
}

interface EmotionalGenerationContext {
  chapterNumber: number;
  emotionalArc: EmotionalArcDesign;
  catharticExperience?: CatharticExperience;
  empatheticPoints: EmpatheticPoint[];
  syncMetrics?: EmotionLearningSyncMetrics;
}
```

---

## 🟡 中期記憶設計 v2.0

```typescript
interface MidTermMemory {
  // === 構造系データ（既存＋拡張） ===
  structure: {
    arcs: Map<number, ArcInfo>;
    sections: Map<string, SectionInfo>;
    phases: Map<number, PhaseInfo>;
    chapterToSectionMap: Map<number, string>;
    
    // 🆕 学習旅程構造
    learningJourney: {
      // 概念の学習段階マッピング
      conceptStageMap: Map<string, ConceptLearningMap>;
      
      // 学習段階遷移履歴
      stageTransitions: Array<LearningStageTransition>;
      
      // 篇ごとの学習設計
      sectionLearningDesigns: Map<string, SectionLearningDesign>;
    };
  };
  
  // === 🆕 物語進行状態（StoryContext等を統合） ===
  narrativeProgress: {
    // 現在の物語状態（ContextManager.StoryContextから移行）
    currentStoryState: StoryProgressState;
    
    // 進行状態履歴
    progressHistory: Array<ProgressSnapshot>;
    
    // 章完了状態
    chapterCompletionStatus: Map<number, ChapterCompletionInfo>;
    
    // 篇進行状況
    sectionProgressStates: Map<string, SectionProgressState>;
  };
  
  // === 分析結果系（既存＋学習旅程分析） ===
  analysis: {
    // 既存のプロット分析
    plotAnalysis: Map<string, PlotAnalysisResult>;
    consistencyResults: Map<number, ConsistencyResult>;
    sectionCoherence: Map<string, CoherenceAnalysis>;
    
    // 🆕 学習旅程分析結果
    learningAnalysis: {
      // 概念体現化分析結果
      conceptEmbodiment: Map<number, ConceptEmbodimentAnalysis>;
      
      // 学習段階検出結果
      stageDetection: Map<number, LearningStageDetectionResult>;
      
      // 学習進捗評価
      learningProgress: Map<string, LearningProgressEvaluation>;
    };
    
    // 🆕 感情分析結果（EmotionalIntegrator用）
    emotionalAnalysis: {
      // 章ごとの感情分析
      chapterEmotions: Map<number, ChapterEmotionalAnalysis>;
      
      // 感情学習同期分析
      syncAnalysis: Map<number, EmotionLearningSyncAnalysis>;
      
      // 共感ポイント分析結果
      empatheticAnalysis: Map<number, EmpatheticPointAnalysis>;
    };
  };
  
  // === 設計系データ（学習旅程設計を統合） ===
  design: {
    // 既存の設計データ
    sectionDesigns: Map<string, SectionDesign>;
    
    // 🆕 感情学習統合設計
    emotionalLearningDesign: {
      // 感情アーク設計（安定保存）
      emotionalArcs: Map<string, EmotionalArcDesign>;
      
      // カタルシス体験設計
      catharticExperiences: Map<string, CatharticExperience>;
      
      // 篇ごとの感情設計統合
      sectionEmotionalIntegration: Map<string, SectionEmotionalIntegration>;
    };
    
    // 🆕 シーン・テンション設計
    sceneDesign: {
      // 章ごとのシーン推奨
      sceneRecommendations: Map<number, SceneRecommendation[]>;
      
      // テンション設計
      tensionDesigns: Map<number, TensionRecommendation>;
      
      // 章構造設計結果
      chapterStructures: Map<string, ChapterStructureDesign[]>;
    };
  };
  
  // === 🆕 統合進捗管理 ===
  integratedProgress: {
    // 感情学習同期指標（リアルタイム更新）
    syncMetrics: Map<string, EmotionLearningSyncMetrics>;
    
    // ターニングポイント管理
    turningPoints: Array<TurningPoint>;
    
    // 感情曲線データ
    emotionalCurve: Array<EmotionalCurvePoint>;
    
    // 品質進化トラッキング
    qualityEvolution: Array<QualityEvolutionPoint>;
  };
}

// 🆕 学習旅程特有のデータ型
interface StoryProgressState {
  storyId: string;
  currentChapter: number;
  currentSection: string | null;
  mainConcept: string;
  currentLearningStage: LearningStage;
  recentChapters: RecentChapterInfo[];
  mainCharacters: string[];
  activeEmotionalArcs: string[];
  lastUpdated: string;
}

interface ConceptLearningMap {
  conceptName: string;
  currentStage: LearningStage;
  stageHistory: Array<{
    stage: LearningStage;
    chapterNumber: number;
    confidence: number;
    examples: string[];
    timestamp: string;
  }>;
  nextExpectedTransition?: {
    expectedChapter: number;
    targetStage: LearningStage;
    confidence: number;
  };
}

interface SectionEmotionalIntegration {
  sectionId: string;
  emotionalGoal: string;
  arcProgression: EmotionalArcProgression;
  catharticMoments: CatharticMoment[];
  syncTargets: EmotionalSyncTarget[];
  achievementMetrics: EmotionalAchievementMetrics;
}
```

---

## 🔴 長期記憶設計 v2.0

```typescript
interface LongTermMemory {
  // === 設定系データ（既存＋拡張） ===
  settings: {
    worldSettings: WorldSettings;
    themeSettings: ThemeSettings;
    genreSettings: GenreSettings;
    
    // 🆕 学習旅程システム設定
    learningJourneySettings: {
      // 概念定義（ConceptLearningManager用）
      conceptDefinitions: Map<string, BusinessConcept>;
      
      // 学習段階の定義・設定
      stageDefinitions: LearningStageDefinitions;
      
      // 感情学習統合の設定
      emotionalIntegrationSettings: EmotionalIntegrationSettings;
    };
    
    // 🆕 プロンプト生成設定
    promptGenerationSettings: {
      // プロンプトテンプレート
      templates: Map<PromptType, PromptTemplate>;
      
      // 生成設定・プリファレンス
      generationPreferences: PromptGenerationPreferences;
      
      // 品質評価基準
      qualityStandards: PromptQualityStandards;
    };
  };
  
  // === キャラクター系（既存維持） ===
  characters: {
    profiles: Map<string, CharacterProfile>;
    relationships: Map<string, CharacterRelationships>;
    memories: Map<string, CharacterMemoryCollection>;
    growthHistory: Map<string, CharacterGrowth[]>;
  };
  
  // === 🆕 学習コンテキスト統合管理 ===
  learningContext: {
    // 篇と概念の関連付け（永続保存）
    sectionConceptMappings: Map<string, SectionConceptMapping>;
    
    // 完了した学習段階の記録
    completedLearningStages: Map<string, CompletedLearningRecord>;
    
    // 概念間の関係性定義
    conceptRelationships: Map<string, ConceptRelationship[]>;
    
    // 学習効果の長期評価
    learningEffectivenessMetrics: Array<LearningEffectivenessRecord>;
  };
  
  // === 完了済み分析結果（既存＋拡張） ===
  completedAnalysis: {
    sectionSummaries: Map<string, SectionSummary>;
    arcSummaries: Map<number, ArcSummary>;
    qualityTrends: Array<QualityMetrics>;
    
    // 🆕 学習旅程完了分析
    completedLearningJourneys: Map<string, CompletedLearningJourneyAnalysis>;
    
    // 🆕 感情学習統合の効果分析
    emotionalLearningEffectiveness: Array<EmotionalLearningEffectivenessRecord>;
    
    // 🆕 プロンプト効果の長期評価
    promptEffectivenessHistory: Array<PromptEffectivenessRecord>;
  };
  
  // === 🆕 システム運用管理 ===
  systemOperation: {
    // イベントシステムの永続設定
    eventSystemSettings: {
      subscriptionPersistence: Map<string, PersistentSubscription>;
      eventRetentionPolicies: EventRetentionPolicy[];
      alertSettings: EventAlertSettings;
    };
    
    // システム全体の品質基準
    qualityStandards: SystemQualityStandards;
    
    // 運用メトリクスの履歴
    operationalMetrics: Array<SystemOperationalMetrics>;
  };
}

// 🆕 長期記憶用の新しいデータ型
interface SectionConceptMapping {
  sectionId: string;
  conceptName: string;
  learningGoals: string[];
  expectedStageProgression: LearningStage[];
  emotionalIntegrationPlan: EmotionalIntegrationPlan;
  measurementCriteria: LearningMeasurementCriteria;
}

interface CompletedLearningJourneyAnalysis {
  conceptName: string;
  journeyStartChapter: number;
  journeyEndChapter: number;
  stageTransitions: LearningStageTransition[];
  emotionalSyncEffectiveness: number;
  readerEngagementMetrics: ReaderEngagementMetrics;
  lessonsLearned: string[];
  improvementRecommendations: string[];
}
```

---

## 🔗 統合アクセスAPI v2.0

```typescript
interface UnifiedMemoryAPI {
  // === 🆕 学習旅程統合ライフサイクル ===
  learningJourneyLifecycle: {
    // 統合章生成コンテキスト（プロット+学習+感情）
    getIntegratedGenerationContext(chapterNumber: number): Promise<IntegratedGenerationContext>;
    
    // 章保存（学習旅程データ統合）
    saveChapterWithLearningData(chapterData: EnhancedChapterSaveData): Promise<void>;
    
    // 🆕 学習段階遷移の管理
    manageLearningTransition(transition: LearningTransitionRequest): Promise<LearningTransitionResult>;
    
    // 🆕 感情学習同期の評価・更新
    evaluateEmotionalLearningSync(chapterNumber: number): Promise<EmotionalLearningSyncEvaluation>;
  };
  
  // === 🆕 安定化された分析管理 ===
  stableAnalysisManagement: {
    // EmotionalIntegratorの安定保存
    saveEmotionalAnalysisStably(data: EmotionalAnalysisData): Promise<void>;
    
    // 全分析結果の統合取得（重複排除）
    getConsolidatedAnalysisResults(target: AnalysisTarget): Promise<ConsolidatedAnalysisResults>;
    
    // 分析結果の整合性保証
    ensureAnalysisConsistency(analysisType: AnalysisType, scope: AnalysisScope): Promise<ConsistencyReport>;
  };
  
  // === 🆕 プロンプト統合管理 ===
  promptManagement: {
    // プロンプト生成・保存・評価の統合
    generateAndTrackPrompt(request: PromptGenerationRequest): Promise<TrackedPromptResult>;
    
    // プロンプト効果の評価・フィードバック
    evaluatePromptEffectiveness(chapterNumber: number): Promise<PromptEffectivenessReport>;
    
    // プロンプトテンプレートの最適化
    optimizePromptTemplates(optimizationScope: TemplateOptimizationScope): Promise<TemplateOptimizationResult>;
  };
  
  // === 🆕 重複排除アクセス管理 ===
  deduplicatedAccess: {
    // 共通記憶取得パターンの統合
    getCommonMemoryPattern(pattern: CommonMemoryPattern): Promise<CommonMemoryResult>;
    
    // キャッシュされた統合コンテキスト
    getCachedIntegratedContext(chapterNumber: number, refresh?: boolean): Promise<CachedIntegratedContext>;
    
    // バッチ記憶操作（効率化）
    performBatchMemoryOperations(operations: BatchMemoryOperation[]): Promise<BatchOperationResult>;
  };
  
  // === イベント駆動統合管理 ===
  eventDrivenIntegration: {
    // イベントベースの状態同期
    synchronizeStateViaEvents(syncRequest: EventBasedSyncRequest): Promise<SyncResult>;
    
    // イベント駆動の分析トリガー
    triggerAnalysisViaEvents(triggers: AnalysisTrigger[]): Promise<AnalysisScheduleResult>;
    
    // イベントログの永続化管理
    manageEventPersistence(persistenceConfig: EventPersistenceConfig): Promise<void>;
  };
}
```

---

## 🔧 実装戦略 v2.0

### Phase 1: 安定化基盤構築 (3-4週間)
```typescript
// 優先度1: 最も不安定な箇所の修正
1. EmotionalLearningIntegrator保存処理の安定化
   - 安定したAPI設計
   - エラーハンドリングの統合
   - フォールバック処理の実装

2. PromptGenerator完全ログ機能
   - プロンプト生成の全記録
   - 効果測定システム
   - デバッグ支援機能

3. 重複アクセスパターンの統合
   - 共通アクセサーの実装
   - キャッシュレイヤーの構築
   - パフォーマンス最適化
```

### Phase 2: 学習旅程統合 (3-4週間)
```typescript
// 優先度2: 学習旅程特有機能の統合
1. 学習段階遷移管理の統合
   - ConceptLearningManagerとの統合
   - 自動遷移検出の実装
   - 遷移履歴の完全管理

2. 感情学習同期の統合管理
   - EmotionalIntegratorの統合
   - リアルタイム同期評価
   - 統合レポート機能

3. コンテキスト管理の統合
   - ContextManagerの統合
   - 物語進行状態の統一管理
   - 履歴追跡の強化
```

### Phase 3: 高度機能・最適化 (2-3週間)
```typescript
// 優先度3: 高度な統合機能
1. イベント駆動アーキテクチャの完全統合
   - EventBusの永続化
   - 分析トリガーの自動化
   - 状態同期の最適化

2. 包括的品質管理システム
   - 統合品質評価
   - 自動改善提案
   - 長期品質追跡

3. 運用監視・デバッグ支援
   - 統合ダッシュボード
   - リアルタイム監視
   - 障害検出・復旧支援
```

---

## 📋 移行マッピング v2.0

### 学習旅程システムから統合記憶階層への移行

| 現在の場所 | 移行先 | 理由 |
|---|---|---|
| `ConceptLearningManager.concepts` | `longTerm.settings.learningJourneySettings.conceptDefinitions` | 永続的な概念定義 |
| `ConceptLearningManager.learningRecords` | `midTerm.structure.learningJourney.conceptStageMap` | 進行中の学習記録 |
| `ContextManager.StoryContext` | `midTerm.narrativeProgress.currentStoryState` | 進行状態情報 |
| `EmotionalIntegrator.emotionalArcs` | `midTerm.design.emotionalLearningDesign.emotionalArcs` | **安定保存** |
| `EmotionalIntegrator.syncMetrics` | `midTerm.integratedProgress.syncMetrics` | リアルタイム更新 |
| `StoryTransformationDesigner.sections` | `longTerm.settings.worldSettings.narrativeSections` | 永続的な構造定義 |
| `StoryTransformationDesigner.sceneRecommendations` | `midTerm.design.sceneDesign.sceneRecommendations` | 設計結果 |
| `PromptGenerator.generatedPrompts` | `shortTerm.prompts.generatedPrompts` | **新規追加** |
| `EventBus.eventLog` | `shortTerm.events.recentEvents` | 一時ログ |

### 重要な変更点
1. **感情関連データの安定化** - 専用領域での確実な保存
2. **プロンプトデータの完全記録** - デバッグ・改善支援
3. **学習状態の適切な分類** - 永続設定 vs 進行状態の明確な分離
4. **重複アクセスの統合** - 共通パターンの効率化

この統合記憶階層 v2.0 により、学習旅程システムの全要件を満たしつつ、安定性と効率性を大幅に改善できます。