

## 1. 構造設計

### 1.1 連携の全体フロー

```
【生成前フロー】
ChapterGenerator.generate() 
→ 統合ファサード.executePreGeneration()
→ パイプライン（前章分析 → 最適化提案生成）
→ ContextGenerator.generateContext()（拡張コンテキスト使用）

【生成後フロー】  
ChapterGenerator.generate()（章生成完了）
→ 統合ファサード.executePostGeneration()
→ パイプライン（生成章分析 → 次章用改善提案）
→ 結果保存・次章準備
```

### 1.2 必要なアーキテクチャコンポーネント

```
統合ファサード（UnifiedAnalysisManager）
├── PreGenerationPipeline  - 生成前処理パイプライン
├── PostGenerationPipeline - 生成後処理パイプライン  
├── AnalysisCoordinator    - 分析サービス調整
├── OptimizationCoordinator - 最適化サービス調整
└── ResultIntegrator       - 結果統合・矛盾解決
```

## 2. ChapterGenerator との連携設計

### 2.1 現在の generate() メソッドへの統合ポイント

```typescript
async generate(chapterNumber: number, options?: GenerateChapterRequest): Promise<Chapter> {
  // === 統合ポイント1：生成前処理 ===
  const preAnalysis = await 統合ファサード.executePreGeneration(chapterNumber, 前章コンテンツ);
  
  // 既存：コンテキスト生成（拡張情報を含む）
  const context = await this.contextGenerator.generateContext(chapterNumber, {
    ...options,
    enhancedData: preAnalysis.enhancements // ← 拡張情報を注入
  });
  
  // 既存：プロンプト生成・テキスト生成
  const chapter = await this.generateChapter(context);
  
  // === 統合ポイント2：生成後処理 ===
  const postAnalysis = await 統合ファサード.executePostGeneration(chapter, context);
  chapter.metadata.qualityMetrics = postAnalysis.qualityMetrics;
  
  return chapter;
}
```

### 2.2 ContextGenerator との連携設計

```typescript
async generateContext(chapterNumber: number, options?: any): Promise<GenerationContext> {
  // 既存：基本コンテキスト生成
  const baseContext = await this.generateBaseContext(chapterNumber);
  
  // === 統合ポイント：拡張データの統合 ===
  if (options?.enhancedData) {
    return this.mergeEnhancedData(baseContext, options.enhancedData);
  }
  
  return baseContext;
}
```

## 3. 連携するために必要なもの

### 3.1 統合ファサード
- **役割**: ChapterGenerator/ContextGeneratorとの単一窓口
- **責任**: 生成前後の処理オーケストレーション

### 3.2 実行パイプライン
- **PreGenerationPipeline**: 前章分析 → 最適化提案 → コンテキスト拡張データ生成
- **PostGenerationPipeline**: 生成章分析 → 品質評価 → 次章用改善提案

### 3.3 サービス調整コーディネータ
- **AnalysisCoordinator**: 既存分析サービス群の並列実行・結果統合
- **OptimizationCoordinator**: 既存最適化サービス群の調整・優先度付け

### 3.4 共通インターフェース
- **IAnalysisResult**: 全分析サービスの統一結果型
- **IOptimizationSuggestion**: 全最適化サービスの統一提案型
- **IPipelineContext**: パイプライン実行コンテキスト

### 3.5 結果統合・データ変換
- **ResultIntegrator**: 分析結果の統合・矛盾解決
- **ContextEnhancer**: 分析結果 → ContextGenerator用データ変換
- **MetadataBuilder**: 生成後データ → Chapter metadata 構築

## 4. 実装に必要な理解・把握事項

### 4.1 既存分析サービスの把握
- **各サービスの入出力インターフェース**
- **実行時間・リソース使用量**
- **依存関係（実行順序の制約）**
- **エラーハンドリング方式**

### 4.2 既存システムの理解
- **ChapterGenerator.generate()の詳細フロー**
- **ContextGenerator.generateContext()の内部構造**
- **GenerationContextの構造と拡張可能性**
- **Chapter.metadataの構造**

### 4.3 パフォーマンス要件
- **分析処理の許容時間**
- **並列実行可能な最大数**
- **メモリ使用量制限**
- **キャッシュ戦略の必要性**

### 4.4 品質・エラー処理
- **分析失敗時のフォールバック戦略**
- **部分的失敗の許容範囲**
- **品質保証の基準**





## 設計完成後の具体的実装

### ChapterGenerator の変化

#### 【現在】複雑な分析処理が内部に散在
```typescript
async generate(chapterNumber: number, options?: GenerateChapterRequest): Promise<Chapter> {
  // 長い初期化処理...
  
  // 改善提案を個別取得
  let improvementSuggestions: string[] = [];
  let themeEnhancements: ThemeEnhancement[] = [];
  if (chapterNumber > 1) {
    improvementSuggestions = await this.contentAnalysisManager.getReaderExperienceImprovements(chapterNumber);
    themeEnhancements = await this.contentAnalysisManager.getThemeEnhancements(chapterNumber);
  }
  
  // コンテキスト生成
  const context = await this.contextGenerator.generateContext(chapterNumber, {
    ...options,
    improvementSuggestions,
    themeEnhancements
  });
  
  // プロンプト生成・テキスト生成...
  
  // 生成後の個別分析処理
  const analysis = await this.contentAnalysisManager.analyzeChapter(content, chapterNumber, context);
  const allImprovements = await this.contentAnalysisManager.generateImprovementSuggestions(...);
  await this.contentAnalysisManager.saveImprovementSuggestions(...);
  
  // 複雑なチャプター構築...
}
```

#### 【設計完成後】統合ファサードによるシンプル化
```typescript
export class ChapterGenerator {
  private unifiedAnalysisManager: UnifiedAnalysisManager; // ← 統合ファサード

  constructor(
    geminiClient: GeminiClient,
    promptGenerator: PromptGenerator,
    unifiedAnalysisManager?: UnifiedAnalysisManager
  ) {
    this.unifiedAnalysisManager = unifiedAnalysisManager || new UnifiedAnalysisManager();
    this.contextGenerator = new ContextGenerator(this.unifiedAnalysisManager); // 依存性注入
  }

  async generate(chapterNumber: number, options?: GenerateChapterRequest): Promise<Chapter> {
    // === 生成前処理（統合ファサードに委譲）===
    const preGenerationResult = await this.unifiedAnalysisManager.executePreGeneration({
      chapterNumber,
      previousChapterContent: chapterNumber > 1 ? await this.getPreviousChapter(chapterNumber - 1) : null,
      options
    });

    // === コンテキスト生成（拡張データを含む）===
    const context = await this.contextGenerator.generateContext(chapterNumber, {
      ...options,
      enhancedData: preGenerationResult.enhancedData // ← 統合された拡張データ
    });

    // === 既存の生成処理（変更なし）===
    const prompt = await this.promptGenerator.generate(context);
    const generatedText = await this.geminiClient.generateText(prompt, {...});
    const { content, metadata } = this.textParser.parseGeneratedContent(generatedText, chapterNumber);

    // === 生成後処理（統合ファサードに委譲）===
    const chapter = this.buildBasicChapter(chapterNumber, content, metadata);
    const postGenerationResult = await this.unifiedAnalysisManager.executePostGeneration({
      chapter,
      context,
      generationMetadata: metadata
    });

    // === 最終チャプター構築 ===
    return this.buildFinalChapter(chapter, postGenerationResult);
  }

  private buildFinalChapter(baseChapter: Chapter, analysisResult: PostGenerationResult): Chapter {
    return {
      ...baseChapter,
      analysis: analysisResult.comprehensiveAnalysis,
      metadata: {
        ...baseChapter.metadata,
        qualityScore: analysisResult.qualityMetrics.overall,
        nextChapterSuggestions: analysisResult.nextChapterSuggestions,
        processingTime: analysisResult.processingTime
      }
    };
  }
}
```

### ContextGenerator の変化

#### 【現在】分析機能への直接依存
```typescript
export class ContextGenerator {
  private contentAnalysisManager: any = null; // 依存性注入

  async generateContext(chapterNumber: number, options?: any): Promise<GenerationContext> {
    // 複雑な個別分析処理...
    
    // キャラクター心理情報（ContentAnalysisManager経由）
    let characterPsychology = {};
    if (this.contentAnalysisManager && focusCharacterIds.length > 0) {
      characterPsychology = await this.contentAnalysisManager.getMultipleCharacterPsychology(...);
    }
    
    // 各種分析結果を個別取得
    const styleGuidance = options?.styleGuidance || await this.getDefaultStyleGuidance();
    const alternativeExpressions = options?.alternativeExpressions || {};
    const improvementSuggestions = options?.improvementSuggestions || [];
    
    // 複雑な統合処理...
  }
}
```

#### 【設計完成後】拡張データの統合に特化
```typescript
export class ContextGenerator {
  private unifiedAnalysisManager: UnifiedAnalysisManager;

  constructor(unifiedAnalysisManager: UnifiedAnalysisManager) {
    this.unifiedAnalysisManager = unifiedAnalysisManager;
  }

  async generateContext(chapterNumber: number, options?: any): Promise<GenerationContext> {
    // === 基本コンテキスト生成（既存処理）===
    const baseContext = await this.generateBaseContext(chapterNumber);

    // === 拡張データの統合 ===
    if (options?.enhancedData) {
      return this.integrateEnhancedData(baseContext, options.enhancedData);
    }

    return baseContext;
  }

  private async generateBaseContext(chapterNumber: number): Promise<GenerationContext> {
    // 既存の基本コンテキスト生成処理（変更なし）
    const integratedContext = await memoryManager.generateIntegratedContext(chapterNumber);
    const worldSettingsData = await plotManager.getStructuredWorldSettings();
    // ... 既存処理
    
    return {
      chapterNumber,
      worldSettings: integratedContext.worldContext,
      characters: enhancedCharacters,
      narrativeState: integratedContext.narrativeState,
      // ... 基本情報のみ
    };
  }

  private integrateEnhancedData(baseContext: GenerationContext, enhancedData: EnhancedData): GenerationContext {
    return {
      ...baseContext,
      // === 統合ファサードからの拡張データを統合 ===
      styleGuidance: enhancedData.styleGuidance,
      alternativeExpressions: enhancedData.alternativeExpressions,
      characterPsychology: enhancedData.characterPsychology,
      literaryInspirations: enhancedData.literaryInspirations,
      themeEnhancements: enhancedData.themeEnhancements,
      improvementSuggestions: enhancedData.improvementSuggestions,
      tensionRecommendation: enhancedData.tensionOptimization,
      // === メタデータ ===
      enhancementMetadata: {
        analysisTime: enhancedData.processingTime,
        confidenceScore: enhancedData.confidenceScore,
        appliedOptimizations: enhancedData.appliedOptimizations
      }
    };
  }
}
```

## 主な変化のポイント

### 1. 責任の分離
- **ChapterGenerator**: 章生成フローの制御のみ
- **ContextGenerator**: 基本コンテキスト生成 + 拡張データ統合
- **UnifiedAnalysisManager**: 全分析・最適化処理の統合実行

### 2. 依存関係の簡素化
- 複数の分析サービスへの直接依存 → 統合ファサードへの単一依存
- 個別の分析処理 → パイプライン化された統合処理

### 3. コードの簡潔化
- ChapterGenerator: 約300行 → 約100行
- ContextGenerator: 複雑な分析処理削除 → データ統合に特化

### 4. エラーハンドリングの統一
- 各サービスの個別エラー処理 → 統合ファサードでの一元化

### 5. パフォーマンス向上
- 順次実行 → パイプライン内での並列実行
- 重複処理の排除

この実装変化により、メインの生成フローはシンプルになり、全ての分析・最適化処理は統合ファサードが責任を持つ明確な設計になります。