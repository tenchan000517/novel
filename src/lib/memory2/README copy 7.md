# 📊 統合記憶階層設計案 v3.0 
## 伏線管理システム統合完了版

## 🔍 v3.0 アップデート内容

### 🆕 伏線管理システム統合による新要件
1. **計画済み伏線管理**のファイルシステムから記憶階層への完全統合
2. **AI分析結果の完全保存**（ResolutionAdvisor等の解決提案データ）
3. **伏線統計・メトリクス**の包括的管理機能
4. **伏線重複処理**の統合最適化
5. **伏線整合性管理**の自動化システム
6. **伏線解決トラッキング**の詳細履歴機能

### 🔧 重複処理統合による効率化
- **5箇所の記憶アクセス重複**→統合API化
- **3箇所のForeshadowing型変換重複**→共通ユーティリティ化
- **全コンポーネントのエラーハンドリング**→統一化

---

## 🏗️ 統合記憶階層 v3.0 全体構造

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
  
  // イベント駆動統合管理
  eventDrivenState: EventDrivenStateManager;
  
  // 🆕 伏線専用統合管理
  foreshadowingIntegration: ForeshadowingIntegratedManager;
}
```

---

## 🟢 短期記憶設計 v3.0

```typescript
interface ShortTermMemory {
  // === 章コンテンツ（既存＋拡張） ===
  chapters: {
    content: Map<number, ChapterContent>;
    states: Map<number, ChapterState>;
    recentCache: ChapterContent[];
    temporaryAnalysis: Map<number, TemporaryAnalysisData>;
  };
  
  // === プロンプト管理（PromptGenerator対応）===
  prompts: {
    generatedPrompts: Map<number, GeneratedPromptLog>;
    generationStats: PromptGenerationStats;
    templateUsage: Map<string, TemplateUsageLog>;
    promptEvaluations: Map<number, PromptEvaluationResult>;
  };
  
  // === イベント管理（EventBus統合） ===
  events: {
    recentEvents: EventLogEntry[];
    eventStats: EventStatistics;
    subscriptionStates: Map<string, SubscriptionState>;
    eventErrors: EventErrorLog[];
  };
  
  // === 🆕 伏線一時データ（新規追加） ===
  foreshadowing: {
    // 伏線生成の一時ログ
    generationLogs: Map<number, ForeshadowingGenerationLog>;
    
    // AI解決提案の一時結果
    resolutionSuggestions: Map<number, ResolutionSuggestion[]>;
    
    // 重複チェック結果キャッシュ
    duplicateCheckCache: Map<string, DuplicateCheckResult>;
    
    // 🆕 伏線解決分析の一時結果
    resolutionAnalysisTemp: Map<number, ForeshadowingResolutionAnalysis>;
    
    // AI評価結果（デバッグ用保存）
    aiEvaluationLogs: Map<string, AIForeshadowingEvaluation>;
    
    // プロンプト生成履歴（伏線関連）
    foreshadowingPrompts: Map<number, ForeshadowingPromptLog>;
  };
  
  // === 生成コンテキスト（既存＋強化） ===
  generationContext: {
    chapterContextCache: Map<number, GenerationContext>;
    lastPromptInfo: Map<number, PromptInfo>;
    learningContextCache: Map<number, LearningGenerationContext>;
    emotionalContextCache: Map<number, EmotionalGenerationContext>;
    
    // 🆕 伏線統合コンテキスト
    foreshadowingContextCache: Map<number, ForeshadowingGenerationContext>;
  };
}

// 🆕 伏線システム用の新しいデータ型
interface ForeshadowingGenerationLog {
  chapterNumber: number;
  generatedCount: number;
  aiGeneratedCount: number;
  plannedIntroducedCount: number;
  skippedDuplicateCount: number;
  failedGenerationCount: number;
  totalProcessingTime: number;
  timestamp: string;
  errorDetails?: ForeshadowingError[];
}

interface ForeshadowingGenerationContext {
  chapterNumber: number;
  existingForeshadowings: Foreshadowing[];
  plannedForeshadowingsToIntroduce: PlannedForeshadowing[];
  plannedForeshadowingsToResolve: PlannedForeshadowing[];
  hintsForChapter: Array<{foreshadowing: PlannedForeshadowing, hint: string}>;
  resolutionCandidates: Foreshadowing[];
  staleDetectionResults: Foreshadowing[];
}

interface AIForeshadowingEvaluation {
  foreshadowingId: string;
  chapterNumber: number;
  evaluationType: 'generation' | 'resolution' | 'consistency';
  prompt: string;
  response: string;
  parsedResult: any;
  confidence: number;
  processingTime: number;
  timestamp: string;
  errors?: string[];
}
```

---

## 🟡 中期記憶設計 v3.0

```typescript
interface MidTermMemory {
  // === 構造系データ（既存＋拡張） ===
  structure: {
    arcs: Map<number, ArcInfo>;
    sections: Map<string, SectionInfo>;
    phases: Map<number, PhaseInfo>;
    chapterToSectionMap: Map<number, string>;
    
    // 学習旅程構造
    learningJourney: {
      conceptStageMap: Map<string, ConceptLearningMap>;
      stageTransitions: Array<LearningStageTransition>;
      sectionLearningDesigns: Map<string, SectionLearningDesign>;
    };
  };
  
  // === 物語進行状態（StoryContext等を統合） ===
  narrativeProgress: {
    currentStoryState: StoryProgressState;
    progressHistory: Array<ProgressSnapshot>;
    chapterCompletionStatus: Map<number, ChapterCompletionInfo>;
    sectionProgressStates: Map<string, SectionProgressState>;
  };
  
  // === 🆕 伏線進行管理（新規大型追加） ===
  foreshadowingProgress: {
    // 活発に進行中の伏線状態
    activeForeshadowings: Map<string, ActiveForeshadowingState>;
    
    // 伏線解決履歴（章ごと）
    resolutionHistory: Map<number, ForeshadowingResolutionRecord[]>;
    
    // 計画済み伏線の進行状況（ファイルシステムから移行）
    plannedForeshadowingProgress: Map<string, PlannedForeshadowingProgress>;
    
    // 伏線関連のヒント進行状況
    hintProgress: Map<string, HintProgressRecord>;
    
    // 伏線整合性状況の履歴
    consistencyCheckHistory: Array<ForeshadowingConsistencySnapshot>;
    
    // 🆕 古い伏線管理（長期未解決追跡）
    staleForeshadowingManagement: {
      detectionHistory: Array<StaleForeshadowingDetection>;
      resolutionActions: Array<StaleForeshadowingResolution>;
      preventionMetrics: StaleForeshadowingPreventionMetrics;
    };
  };
  
  // === 分析結果系（既存＋学習旅程分析＋伏線分析） ===
  analysis: {
    // 既存のプロット分析
    plotAnalysis: Map<string, PlotAnalysisResult>;
    consistencyResults: Map<number, ConsistencyResult>;
    sectionCoherence: Map<string, CoherenceAnalysis>;
    
    // 学習旅程分析結果
    learningAnalysis: {
      conceptEmbodiment: Map<number, ConceptEmbodimentAnalysis>;
      stageDetection: Map<number, LearningStageDetectionResult>;
      learningProgress: Map<string, LearningProgressEvaluation>;
    };
    
    // 感情分析結果（EmotionalIntegrator用）
    emotionalAnalysis: {
      chapterEmotions: Map<number, ChapterEmotionalAnalysis>;
      syncAnalysis: Map<number, EmotionLearningSyncAnalysis>;
      empatheticAnalysis: Map<number, EmpatheticPointAnalysis>;
    };
    
    // 🆕 伏線分析結果（包括的な新規追加）
    foreshadowingAnalysis: {
      // AI生成伏線の効果分析
      generationEffectivenessAnalysis: Map<number, ForeshadowingGenerationEffectiveness>;
      
      // 伏線解決の成功率分析
      resolutionSuccessAnalysis: Map<number, ForeshadowingResolutionSuccess>;
      
      // 計画済み vs AI生成の比較分析
      plannedVsAIAnalysis: Array<PlannedVsAIComparisonResult>;
      
      // 伏線密度・分布分析
      densityDistributionAnalysis: Map<string, ForeshadowingDensityAnalysis>;
      
      // 読者体験への影響分析
      readerImpactAnalysis: Map<number, ForeshadowingReaderImpactAnalysis>;
      
      // 🆕 AIプロンプト効果分析（伏線特化）
      promptEffectivenessAnalysis: Map<string, ForeshadowingPromptEffectiveness>;
    };
  };
  
  // === 設計系データ（学習旅程設計を統合＋伏線設計追加） ===
  design: {
    // 既存の設計データ
    sectionDesigns: Map<string, SectionDesign>;
    
    // 感情学習統合設計
    emotionalLearningDesign: {
      emotionalArcs: Map<string, EmotionalArcDesign>;
      catharticExperiences: Map<string, CatharticExperience>;
      sectionEmotionalIntegration: Map<string, SectionEmotionalIntegration>;
    };
    
    // シーン・テンション設計
    sceneDesign: {
      sceneRecommendations: Map<number, SceneRecommendation[]>;
      tensionDesigns: Map<number, TensionRecommendation>;
      chapterStructures: Map<string, ChapterStructureDesign[]>;
    };
    
    // 🆕 伏線統合設計（新規大型追加）
    foreshadowingDesign: {
      // 篇ごとの伏線戦略設計
      sectionForeshadowingStrategy: Map<string, SectionForeshadowingStrategy>;
      
      // 伏線解決タイミング設計
      resolutionTimingDesign: Map<string, ForeshadowingResolutionTiming>;
      
      // 伏線密度制御設計
      densityControlDesign: Map<string, ForeshadowingDensityControl>;
      
      // ヒント配置戦略
      hintPlacementStrategy: Map<string, HintPlacementStrategy>;
      
      // 🆕 伏線テンション統合設計
      foreshadowingTensionIntegration: Map<string, ForeshadowingTensionIntegration>;
    };
  };
  
  // === 統合進捗管理（既存＋伏線進捗追加） ===
  integratedProgress: {
    // 既存
    syncMetrics: Map<string, EmotionLearningSyncMetrics>;
    turningPoints: Array<TurningPoint>;
    emotionalCurve: Array<EmotionalCurvePoint>;
    qualityEvolution: Array<QualityEvolutionPoint>;
    
    // 🆕 伏線品質進化追跡
    foreshadowingQualityEvolution: Array<ForeshadowingQualityPoint>;
    
    // 🆕 伏線解決カーブ
    foreshadowingResolutionCurve: Array<ForeshadowingResolutionPoint>;
    
    // 🆕 統合ナラティブ品質（伏線+感情+学習）
    integratedNarrativeQuality: Array<IntegratedNarrativeQualityPoint>;
  };
}

// 🆕 伏線システム特有のデータ型
interface ActiveForeshadowingState {
  foreshadowing: Foreshadowing;
  currentStatus: 'introduced' | 'hinted' | 'building' | 'ready_for_resolution' | 'resolved';
  lastUpdateChapter: number;
  hintingHistory: Array<HintingRecord>;
  buildupActions: Array<BuildupAction>;
  resolutionReadiness: ResolutionReadinessScore;
  readerEngagementMetrics: ForeshadowingEngagementMetrics;
}

interface PlannedForeshadowingProgress {
  plannedForeshadowing: PlannedForeshadowing;
  actualIntroductionChapter?: number;
  actualResolutionChapter?: number;
  deviationFromPlan: PlanDeviationMetrics;
  adaptationActions: Array<ForeshadowingAdaptationAction>;
  effectivenessScore: number;
}

interface ForeshadowingConsistencySnapshot {
  chapterNumber: number;
  timestamp: string;
  overallConsistency: boolean;
  issueCount: number;
  issues: Array<ForeshadowingConsistencyIssue>;
  resolutionActions: Array<ConsistencyResolutionAction>;
  preventionMeasures: Array<ConsistencyPreventionMeasure>;
}

interface SectionForeshadowingStrategy {
  sectionId: string;
  foreshadowingGoals: string[];
  densityTarget: ForeshadowingDensityTarget;
  resolutionStrategy: ForeshadowingResolutionStrategy;
  hintingStrategy: ForeshadowingHintingStrategy;
  qualityMetrics: ForeshadowingQualityMetrics;
  integrationWithEmotions: EmotionalForeshadowingIntegration;
  integrationWithLearning: LearningForeshadowingIntegration;
}
```

---

## 🔴 長期記憶設計 v3.0

```typescript
interface LongTermMemory {
  // === 設定系データ（既存＋拡張） ===
  settings: {
    worldSettings: WorldSettings;
    themeSettings: ThemeSettings;
    genreSettings: GenreSettings;
    
    // 学習旅程システム設定
    learningJourneySettings: {
      conceptDefinitions: Map<string, BusinessConcept>;
      stageDefinitions: LearningStageDefinitions;
      emotionalIntegrationSettings: EmotionalIntegrationSettings;
    };
    
    // プロンプト生成設定
    promptGenerationSettings: {
      templates: Map<PromptType, PromptTemplate>;
      generationPreferences: PromptGenerationPreferences;
      qualityStandards: PromptQualityStandards;
    };
    
    // 🆕 伏線システム設定（大型新規追加）
    foreshadowingSystemSettings: {
      // 伏線生成の基本設定
      generationSettings: ForeshadowingGenerationSettings;
      
      // 計画済み伏線の定義（ファイルシステムから完全移行）
      plannedForeshadowingDefinitions: Map<string, PlannedForeshadowingDefinition>;
      
      // 伏線品質基準・評価ルール
      qualityStandards: ForeshadowingQualityStandards;
      
      // 解決タイミング・戦略のテンプレート
      resolutionStrategies: Map<string, ForeshadowingResolutionStrategy>;
      
      // AI評価・生成のパラメータ設定
      aiGenerationParameters: ForeshadowingAIParameters;
      
      // 🆕 伏線統合ルール（学習・感情との連携）
      integrationRules: ForeshadowingIntegrationRules;
    };
  };
  
  // === キャラクター系（既存維持） ===
  characters: {
    profiles: Map<string, CharacterProfile>;
    relationships: Map<string, CharacterRelationships>;
    memories: Map<string, CharacterMemoryCollection>;
    growthHistory: Map<string, CharacterGrowth[]>;
  };
  
  // === 🆕 伏線永続データ（新規大型追加） ===
  foreshadowingPersistent: {
    // 伏線マスターデータ（全伏線の基本情報）
    foreshadowingMaster: Map<string, ForeshadowingMasterRecord>;
    
    // 完了した伏線の最終記録
    completedForeshadowings: Map<string, CompletedForeshadowingRecord>;
    
    // 計画済み伏線のマスターデータ（ファイルから移行）
    plannedForeshadowingMaster: Map<string, PlannedForeshadowingMasterRecord>;
    
    // 伏線テンプレート・パターンライブラリ
    foreshadowingTemplates: Map<string, ForeshadowingTemplate>;
    
    // 成功した伏線戦略のライブラリ
    successfulStrategies: Map<string, SuccessfulForeshadowingStrategy>;
    
    // 🆕 伏線関連の知識ベース
    foreshadowingKnowledgeBase: {
      // 効果的な伏線パターン
      effectivePatterns: Array<EffectiveForeshadowingPattern>;
      
      // 失敗パターンと対策
      failurePatterns: Array<ForeshadowingFailurePattern>;
      
      // ジャンル別伏線戦略
      genreSpecificStrategies: Map<string, GenreForeshadowingStrategy>;
      
      // 読者反応パターン
      readerResponsePatterns: Array<ForeshadowingReaderResponse>;
    };
  };
  
  // === 学習コンテキスト統合管理（既存＋伏線統合） ===
  learningContext: {
    sectionConceptMappings: Map<string, SectionConceptMapping>;
    completedLearningStages: Map<string, CompletedLearningRecord>;
    conceptRelationships: Map<string, ConceptRelationship[]>;
    learningEffectivenessMetrics: Array<LearningEffectivenessRecord>;
    
    // 🆕 伏線学習統合
    foreshadowingLearningIntegration: {
      // 伏線による学習効果の記録
      foreshadowingLearningEffects: Map<string, ForeshadowingLearningEffect>;
      
      // 概念と伏線の関連付け
      conceptForeshadowingLinks: Map<string, ConceptForeshadowingLink[]>;
      
      // 学習段階での伏線活用戦略
      stageForeshadowingStrategies: Map<LearningStage, StageForeshadowingStrategy>;
    };
  };
  
  // === 完了済み分析結果（既存＋拡張） ===
  completedAnalysis: {
    sectionSummaries: Map<string, SectionSummary>;
    arcSummaries: Map<number, ArcSummary>;
    qualityTrends: Array<QualityMetrics>;
    completedLearningJourneys: Map<string, CompletedLearningJourneyAnalysis>;
    emotionalLearningEffectiveness: Array<EmotionalLearningEffectivenessRecord>;
    promptEffectivenessHistory: Array<PromptEffectivenessRecord>;
    
    // 🆕 伏線完了分析（新規追加）
    completedForeshadowingAnalysis: {
      // 伏線成功事例の詳細分析
      successCaseAnalysis: Map<string, ForeshadowingSuccessCaseAnalysis>;
      
      // 長期的な伏線効果測定
      longTermEffectivenessAnalysis: Array<LongTermForeshadowingEffectiveness>;
      
      // 伏線システム改善履歴
      systemImprovementHistory: Array<ForeshadowingSystemImprovement>;
      
      // 読者エンゲージメント長期分析
      readerEngagementLongTermAnalysis: Array<ForeshadowingReaderEngagementAnalysis>;
      
      // 🆕 統合ナラティブ効果分析（伏線+学習+感情）
      integratedNarrativeEffectiveness: Array<IntegratedNarrativeEffectiveness>;
    };
  };
  
  // === システム運用管理（既存＋伏線運用追加） ===
  systemOperation: {
    eventSystemSettings: {
      subscriptionPersistence: Map<string, PersistentSubscription>;
      eventRetentionPolicies: EventRetentionPolicy[];
      alertSettings: EventAlertSettings;
    };
    qualityStandards: SystemQualityStandards;
    operationalMetrics: Array<SystemOperationalMetrics>;
    
    // 🆕 伏線システム運用管理
    foreshadowingSystemOperation: {
      // 伏線生成・管理の運用設定
      operationalSettings: ForeshadowingOperationalSettings;
      
      // システム監視・アラート設定
      monitoringSettings: ForeshadowingMonitoringSettings;
      
      // バックアップ・復旧設定
      backupSettings: ForeshadowingBackupSettings;
      
      // パフォーマンス最適化設定
      performanceSettings: ForeshadowingPerformanceSettings;
    };
  };
}

// 🆕 長期記憶用の新しい伏線データ型
interface ForeshadowingMasterRecord {
  id: string;
  originalForeshadowing: Foreshadowing;
  creationMethod: 'ai_generated' | 'planned' | 'hybrid';
  lifecycleHistory: Array<ForeshadowingLifecycleEvent>;
  qualityMetrics: ForeshadowingQualityMetrics;
  integrationRecords: ForeshadowingIntegrationRecords;
  readerImpactScore: number;
  lessonsLearned: string[];
}

interface PlannedForeshadowingMasterRecord {
  id: string;
  originalPlannedForeshadowing: PlannedForeshadowing;
  executionHistory: Array<PlannedForeshadowingExecution>;
  adaptationHistory: Array<PlannedForeshadowingAdaptation>;
  complianceScore: number;
  effectivenessVsPlan: EffectivenessComparisonMetrics;
  migrationFromFileSystem: {
    originalFilePath: string;
    migrationDate: string;
    dataIntegrityCheck: boolean;
  };
}

interface ForeshadowingIntegrationRules {
  // 学習旅程システムとの統合ルール
  learningIntegrationRules: {
    conceptIntroductionRules: ConceptForeshadowingRule[];
    stageTransitionRules: StageForeshadowingRule[];
    embodimentSupportRules: EmbodimentForeshadowingRule[];
  };
  
  // 感情システムとの統合ルール
  emotionalIntegrationRules: {
    emotionalArcSupportRules: EmotionalForeshadowingRule[];
    catharsisBuildupRules: CatharsisForeshadowingRule[];
    tensionIntegrationRules: TensionForeshadowingRule[];
  };
  
  // 全体統合ルール
  holisticIntegrationRules: {
    narrativeCoherenceRules: NarrativeForeshadowingRule[];
    paceControlRules: PaceForeshadowingRule[];
    qualityAssuranceRules: QualityForeshadowingRule[];
  };
}
```

---

## 🔗 統合アクセスAPI v3.0

```typescript
interface UnifiedMemoryAPI {
  // === 学習旅程統合ライフサイクル（既存） ===
  learningJourneyLifecycle: {
    getIntegratedGenerationContext(chapterNumber: number): Promise<IntegratedGenerationContext>;
    saveChapterWithLearningData(chapterData: EnhancedChapterSaveData): Promise<void>;
    manageLearningTransition(transition: LearningTransitionRequest): Promise<LearningTransitionResult>;
    evaluateEmotionalLearningSync(chapterNumber: number): Promise<EmotionalLearningSyncEvaluation>;
  };
  
  // === 安定化された分析管理（既存） ===
  stableAnalysisManagement: {
    saveEmotionalAnalysisStably(data: EmotionalAnalysisData): Promise<void>;
    getConsolidatedAnalysisResults(target: AnalysisTarget): Promise<ConsolidatedAnalysisResults>;
    ensureAnalysisConsistency(analysisType: AnalysisType, scope: AnalysisScope): Promise<ConsistencyReport>;
  };
  
  // === プロンプト統合管理（既存） ===
  promptManagement: {
    generateAndTrackPrompt(request: PromptGenerationRequest): Promise<TrackedPromptResult>;
    evaluatePromptEffectiveness(chapterNumber: number): Promise<PromptEffectivenessReport>;
    optimizePromptTemplates(optimizationScope: TemplateOptimizationScope): Promise<TemplateOptimizationResult>;
  };
  
  // === 🆕 伏線統合管理（新規大型追加） ===
  foreshadowingIntegratedManagement: {
    // 統合的な伏線生成（計画済み+AI+統合分析）
    generateIntegratedForeshadowing(request: IntegratedForeshadowingRequest): Promise<IntegratedForeshadowingResult>;
    
    // 伏線解決の統合提案（AI分析+計画+コンテキスト）
    suggestIntegratedResolution(chapterNumber: number): Promise<IntegratedResolutionSuggestion>;
    
    // 伏線整合性の統合チェック（全システム横断）
    performIntegratedConsistencyCheck(scope: ConsistencyCheckScope): Promise<IntegratedConsistencyReport>;
    
    // 計画済み伏線の記憶階層統合管理
    managePlannedForeshadowingInMemory(operation: PlannedForeshadowingOperation): Promise<PlannedForeshadowingResult>;
    
    // 🆕 AI分析結果の確実な保存（ResolutionAdvisor等）
    saveAIAnalysisResults(analysisData: AIForeshadowingAnalysisData): Promise<void>;
    
    // 🆕 伏線統計・メトリクス統合管理
    manageIntegratedForeshadowingMetrics(operation: ForeshadowingMetricsOperation): Promise<ForeshadowingMetricsResult>;
    
    // 🆕 伏線品質進化追跡
    trackForeshadowingQualityEvolution(qualityData: ForeshadowingQualityData): Promise<QualityEvolutionResult>;
  };
  
  // === 重複排除アクセス管理（伏線統合対応強化） ===
  deduplicatedAccess: {
    getCommonMemoryPattern(pattern: CommonMemoryPattern): Promise<CommonMemoryResult>;
    getCachedIntegratedContext(chapterNumber: number, refresh?: boolean): Promise<CachedIntegratedContext>;
    performBatchMemoryOperations(operations: BatchMemoryOperation[]): Promise<BatchOperationResult>;
    
    // 🆕 伏線専用の重複排除アクセス
    getForeshadowingCommonPatterns(patterns: ForeshadowingAccessPattern[]): Promise<ForeshadowingCommonResult>;
    
    // 🆕 統合初期化処理（全システム共通）
    performUnifiedSystemInitialization(initScope: SystemInitializationScope): Promise<UnifiedInitializationResult>;
    
    // 🆕 統合エラーハンドリング
    handleUnifiedSystemError(error: UnifiedSystemError): Promise<ErrorHandlingResult>;
  };
  
  // === イベント駆動統合管理（既存） ===
  eventDrivenIntegration: {
    synchronizeStateViaEvents(syncRequest: EventBasedSyncRequest): Promise<SyncResult>;
    triggerAnalysisViaEvents(triggers: AnalysisTrigger[]): Promise<AnalysisScheduleResult>;
    manageEventPersistence(persistenceConfig: EventPersistenceConfig): Promise<void>;
  };
  
  // === 🆕 伏線システム専用統合API ===
  foreshadowingSystemAPI: {
    // ファイルシステムからの移行支援
    migratePlannedForeshadowingFromFile(filePath: string): Promise<MigrationResult>;
    
    // 伏線データ変換の統合（3箇所の重複除去）
    convertToUnifiedForeshadowingFormat(data: any, sourceType: ForeshadowingSourceType): Promise<Foreshadowing>;
    
    // 伏線重複チェックの統合
    performUnifiedDuplicateCheck(foreshadowing: Foreshadowing): Promise<DuplicateCheckResult>;
    
    // 伏線統合バリデーション
    validateIntegratedForeshadowing(foreshadowing: Foreshadowing): Promise<ValidationResult>;
    
    // 🆕 伏線パフォーマンス最適化
    optimizeForeshadowingPerformance(optimizationTarget: ForeshadowingOptimizationTarget): Promise<OptimizationResult>;
  };
}

// 🆕 伏線統合API用の新しいデータ型
interface IntegratedForeshadowingRequest {
  chapterNumber: number;
  chapterContent: string;
  learningContext: LearningGenerationContext;
  emotionalContext: EmotionalGenerationContext;
  existingForeshadowings: Foreshadowing[];
  generationPreferences: ForeshadowingGenerationPreferences;
  integrationRequirements: ForeshadowingIntegrationRequirements;
}

interface IntegratedForeshadowingResult {
  generatedForeshadowings: Foreshadowing[];
  plannedForeshadowings: PlannedForeshadowing[];
  integrationAnalysis: ForeshadowingIntegrationAnalysis;
  qualityMetrics: ForeshadowingQualityMetrics;
  recommendedActions: ForeshadowingRecommendedAction[];
  systemImprovements: ForeshadowingSystemImprovement[];
}

interface IntegratedResolutionSuggestion {
  directResolutions: ResolutionSuggestion[];
  hintSuggestions: HintSuggestion[];
  buildupSuggestions: BuildupSuggestion[];
  integrationOpportunities: ForeshadowingIntegrationOpportunity[];
  timingOptimizations: ForeshadowingTimingOptimization[];
  qualityEnhancements: ForeshadowingQualityEnhancement[];
}
```

---

## 🆕 伏線専用統合管理システム

```typescript
interface ForeshadowingIntegratedManager {
  // === 計画済み伏線の完全統合管理 ===
  plannedForeshadowingIntegration: {
    // ファイルシステムから記憶階層への移行
    migrateFromFileSystem(): Promise<MigrationResult>;
    
    // 計画済み伏線の状態同期
    synchronizePlannedStates(): Promise<SynchronizationResult>;
    
    // 計画遵守率の監視
    monitorPlanCompliance(): Promise<ComplianceMonitoringResult>;
  };
  
  // === AI分析結果の確実な保存 ===
  aiAnalysisPreservation: {
    // ResolutionAdvisorの分析結果保存
    preserveResolutionAnalysis(analysis: ResolutionAnalysisData): Promise<void>;
    
    // 生成プロンプトと結果の関連付け保存
    preserveGenerationResults(results: GenerationResultsData): Promise<void>;
    
    // AI評価履歴の構造化保存
    preserveEvaluationHistory(history: EvaluationHistoryData): Promise<void>;
  };
  
  // === 重複処理の統合最適化 ===
  deduplicationOptimization: {
    // 記憶アクセス初期化の統合
    unifiedMemoryInitialization(): Promise<InitializationResult>;
    
    // Foreshadowing型変換の統合
    unifiedForeshadowingConversion(source: any, type: ConversionType): Promise<Foreshadowing>;
    
    // エラーハンドリングの統合
    unifiedErrorHandling(error: ForeshadowingError): Promise<ErrorHandlingResult>;
  };
  
  // === 品質・メトリクス統合管理 ===
  qualityMetricsIntegration: {
    // 統合品質評価
    evaluateIntegratedQuality(scope: QualityEvaluationScope): Promise<IntegratedQualityReport>;
    
    // メトリクス収集・分析の統合
    collectIntegratedMetrics(): Promise<IntegratedMetricsReport>;
    
    // 改善提案の統合生成
    generateIntegratedImprovements(): Promise<IntegratedImprovementSuggestions>;
  };
}
```

---

## 🔧 実装戦略 v3.0

### Phase 1: 伏線統合基盤構築 (4-5週間)
```typescript
// 最優先: 伏線管理の安定化と統合
1. PlannedForeshadowingManagerの記憶階層統合
   - ファイルシステムからの完全移行
   - データ整合性の保証
   - 移行支援ツールの実装

2. AI分析結果の完全保存システム
   - ResolutionAdvisorの分析結果保存
   - AIプロンプト・レスポンスの構造化保存
   - デバッグ支援機能の実装

3. 重複処理の統合最適化
   - 5箇所の記憶アクセス初期化統合
   - 3箇所のForeshadowing型変換統合
   - 統一エラーハンドリング実装
```

### Phase 2: 学習旅程・感情システム統合 (3-4週間)
```typescript
// 既存システムとの統合強化
1. 学習段階遷移管理の統合
   - ConceptLearningManagerとの統合
   - 自動遷移検出の実装
   - 遷移履歴の完全管理

2. 感情学習同期の統合管理
   - EmotionalIntegratorの統合
   - リアルタイム同期評価
   - 統合レポート機能

3. 伏線・学習・感情の統合設計
   - 三位一体の品質管理
   - 統合的な物語構造分析
   - 総合的なパフォーマンス最適化
```

### Phase 3: 高度統合・運用最適化 (3-4週間)
```typescript
// 最終統合と運用効率化
1. 統合品質管理システム
   - 全システム横断の品質評価
   - 自動改善提案システム
   - 長期品質追跡システム

2. 統合ダッシュボード・監視システム
   - リアルタイム統合監視
   - パフォーマンス分析
   - 障害検出・復旧支援

3. 最適化・チューニングシステム
   - システム全体のパフォーマンス最適化
   - 記憶階層の効率化
   - AI利用コストの最適化
```

---

## 📋 移行マッピング v3.0

### 伏線管理システムから統合記憶階層への移行

| 現在の場所 | 移行先 | 統合理由 |
|---|---|---|
| `PlannedForeshadowingManager`（ファイル） | `longTerm.foreshadowingPersistent.plannedForeshadowingMaster` | **完全統合で二重管理解消** |
| `ForeshadowingAutoGenerator.生成統計` | `midTerm.foreshadowingProgress.activeForeshadowings` | 進行中の統計管理 |
| `ForeshadowingResolutionAdvisor.AI分析` | `shortTerm.foreshadowing.aiEvaluationLogs` | **AI分析結果の完全保存** |
| `ForeshadowingEngine.解決推奨` | `midTerm.analysis.foreshadowingAnalysis` | 分析結果の構造化保存 |
| `ForeshadowingManager.統合処理結果` | `midTerm.integratedProgress.integratedNarrativeQuality` | 統合品質管理 |
| 各コンポーネントの`記憶初期化重複` | `unifiedAPI.deduplicatedAccess.performUnifiedSystemInitialization` | **重複除去と効率化** |
| 各コンポーネントの`Foreshadowing変換` | `unifiedAPI.foreshadowingSystemAPI.convertToUnifiedForeshadowingFormat` | **変換処理の統合** |

### 🔄 統合による効率化効果

**1. データ重複の完全解消**
- 計画済み伏線：ファイル+記憶階層 → 記憶階層のみ
- 型変換処理：3箇所 → 1箇所の統合API
- 記憶初期化：5箇所 → 1箇所の統合API

**2. AI分析データの完全活用**
- 現在：AI分析結果破棄 → 統合保存・分析・改善
- デバッグ効率：不可能 → 完全トレーサビリティ
- 品質改善：困難 → データ駆動型改善

**3. 統合品質管理の実現**
- 現在：個別品質管理 → 伏線+学習+感情の統合品質管理
- パフォーマンス：分散処理 → 統合最適化
- 運用効率：個別運用 → 統合運用

この統合記憶階層 v3.0 により、**伏線管理システムの全課題を解決**し、**学習旅程システムとの完璧な統合**を実現し、**システム全体の効率性を大幅に向上**させることができます。