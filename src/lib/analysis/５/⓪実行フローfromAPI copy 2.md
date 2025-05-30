# ChapterAnalysisPipeline 統合ガイド

## 概要

`ChapterAnalysisPipeline` は章の分析処理を柔軟かつ拡張可能な方法で行うためのフレームワークです。このガイドでは、既存システムに分析パイプラインを統合する方法について説明します。

## 1. 基本概念

### パイプラインとステップ

パイプラインは一連の分析ステップを順序付けて実行するためのフレームワークです。各ステップは独立した分析タスクを実行し、その結果をパイプラインコンテキストを通じて共有します。

- **AnalysisStep**: 個別の分析タスクを定義するインターフェース
- **PipelineContext**: パイプライン実行中に共有されるデータを保持するオブジェクト
- **ChapterAnalysisPipeline**: パイプラインの構築と実行を担当するクラス
- **ChapterAnalysisPipelineFactory**: 様々なタイプのパイプラインを作成するファクトリークラス

### 主要なコンポーネント

- `chapter-analysis-pipeline.ts`: パイプラインのコア機能を定義
- `analysis-steps.ts`: 基本的な分析ステップの実装
- `advanced-steps.ts`: 高度な分析ステップの実装
- `chapter-analysis-pipeline-factory.ts`: 様々なパイプラインを構築するファクトリー
- `performance-monitor.ts`: パイプラインのパフォーマンスを監視するユーティリティ

## 2. 既存コードへの統合手順

### 2.1 基本的な統合

最も簡単な統合方法は、既存の `ChapterAnalyzer` クラスを修正して、内部的にパイプラインを使用するように変更することです。

```typescript
// 既存の分析関数をパイプラインに置き換える例
async analyzeChapter(content: string, chapterNumber: number, context: GenerationContext): Promise<ChapterAnalysis> {
  // パイプラインファクトリを作成
  const pipelineFactory = new ChapterAnalysisPipelineFactory(this.geminiClient, this.memoryManager);
  
  // 適切なパイプラインを構築
  const pipeline = pipelineFactory.createStandardPipeline();
  
  // 章オブジェクトを構築
  const chapter = {
    id: `chapter-${chapterNumber}`,
    chapterNumber,
    title: `第${chapterNumber}章`,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
    wordCount: this.countWords(content),
    summary: '',
    scenes: []
  };
  
  // パイプラインを実行
  return await pipeline.execute(chapter, context);
}
```

### 2.2 段階的な移行

既存のコードを段階的に移行するために、パイプラインとレガシーコードを並行して使用することもできます。

```typescript
async analyzeChapter(content: string, chapterNumber: number, context: GenerationContext): Promise<ChapterAnalysis> {
  // フラグで新旧の実装を切り替え
  const useNewPipeline = parameterManager.getParameters().features.useNewAnalysisPipeline;
  
  if (useNewPipeline) {
    // 新しいパイプラインベースの実装
    const pipelineFactory = new ChapterAnalysisPipelineFactory(this.geminiClient, this.memoryManager);
    const pipeline = pipelineFactory.createStandardPipeline();
    
    const chapter = { /* 章オブジェクトを構築 */ };
    return await pipeline.execute(chapter, context);
  } else {
    // 既存の実装
    return this.legacyAnalyzeChapter(content, chapterNumber, context);
  }
}

// 既存の実装をレガシーメソッドとして保持
private async legacyAnalyzeChapter(content: string, chapterNumber: number, context: GenerationContext): Promise<ChapterAnalysis> {
  // 既存の実装コード
}
```

### 2.3 カスタムパイプラインの構築

特定の要件に合わせてカスタムパイプラインを構築することもできます。

```typescript
// 特定の分析タスクに特化したパイプラインの構築
async analyzeThemeConsistency(chapters: Chapter[]): Promise<any> {
  const pipelineFactory = new ChapterAnalysisPipelineFactory(this.geminiClient, this.memoryManager);
  
  // カスタムパイプラインビルダーを取得
  const pipeline = pipelineFactory.getCustomPipelineBuilder();
  
  // 必要なサービスを取得
  const services = pipelineFactory.getServices();
  
  // テーマ分析ステップのみを追加
  const themeStep = new ThemeAnalysisStep(services.themeAnalysisService);
  pipeline.addStep(themeStep);
  
  // 各章を分析
  const results = [];
  for (const chapter of chapters) {
    const result = await pipeline.execute(chapter);
    results.push({
      chapterNumber: chapter.chapterNumber,
      themeOccurrences: result.themeOccurrences
    });
  }
  
  return results;
}
```

## 3. 機能拡張

### 3.1 新しい分析ステップの追加

新しい分析ステップを追加するには、`AnalysisStep` インターフェースを実装したクラスを作成します。

```typescript
class MyCustomAnalysisStep implements AnalysisStep {
  readonly name = 'myCustomAnalysis';
  readonly timeout = 30000;
  
  constructor(private myService: MyService) {}
  
  async execute(chapter: Chapter, context: PipelineContext): Promise<any> {
    // 分析ロジックを実装
    const result = await this.myService.analyzeCustomAspect(chapter.content);
    
    // 結果を返す
    return {
      customAnalysisResult: result
    };
  }
}
```

### 3.2 ファクトリーの拡張

特定のユースケースに特化したパイプラインを定義するには、ファクトリークラスに新しいメソッドを追加します。

```typescript
class ExtendedChapterAnalysisPipelineFactory extends ChapterAnalysisPipelineFactory {
  // 特定ドメイン向けのパイプラインを構築
  createBusinessDomainPipeline(options?: Partial<PipelineOptions>): ChapterAnalysisPipeline {
    const pipeline = new ChapterAnalysisPipeline(options);
    
    // 基本ステップ
    const basicStep = new BasicAnalysisStep(this.getServices().chapterAnalysisService);
    pipeline.addStep(basicStep);
    
    // ビジネスドメイン固有のステップ
    const businessTermsStep = new BusinessTermsAnalysisStep(this.customBusinessService);
    pipeline.addStep(businessTermsStep);
    
    return pipeline;
  }
}
```

### 3.3 パフォーマンスモニタリングの統合

パフォーマンス監視を統合するには、モニタリングデコレータを使用します。

```typescript
// パフォーマンスモニタリング付きのパイプライン構築
const pipeline = withPipelinePerformanceMonitoring(
  () => pipelineFactory.createStandardPipeline(),
  (metrics) => {
    // メトリクスをログやデータベースに保存
    logger.debug(`Step ${metrics.stepName} took ${metrics.executionTimeMs}ms`);
    performanceDB.saveStepMetrics(metrics);
  }
);

// パイプライン実行
const result = await pipeline.execute(chapter, context);

// パフォーマンスレポートを取得
const report = result._performanceReport;
if (report) {
  logger.info(`Pipeline execution took ${report.totalExecutionTimeMs}ms`);
  
  // 最も遅いステップを表示
  if (report.slowestStep) {
    logger.warn(`Slowest step was ${report.slowestStep.stepName} (${report.slowestStep.executionTimeMs}ms)`);
  }
}
```

## 4. ベストプラクティス

### 4.1 エラーハンドリング

各ステップでは適切なエラーハンドリングを行い、タイムアウトには十分なマージンを設定します。

```typescript
async execute(chapter: Chapter, context: PipelineContext): Promise<any> {
  try {
    // 分析ロジック
    return result;
  } catch (error) {
    logger.error(`Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    
    // フォールバック値を返す
    return { 
      // デフォルト結果 
    };
  }
}
```

### 4.2 依存関係の管理

ステップ間の依存関係は明示的に定義し、循環依存を避けます。

```typescript
// 依存関係の明示的な定義
pipeline.addStep(qualityMetricsStep, [
  basicAnalysisStep.name,
  styleAnalysisStep.name
]);
```

### 4.3 並列処理の最適化

独立した処理は並列実行することで、パフォーマンスを向上させます。

```typescript
// 並列処理の定義
pipeline.addParallelSteps([
  characterAnalysisStep,
  themeAnalysisStep,
  styleAnalysisStep
]);
```

### 4.4 条件付き実行

すべてのケースで全ての分析を実行するのではなく、状況に応じて実行すべきステップを選択します。

```typescript
// 条件付きステップの追加
pipeline.addConditionalStep(
  detailedAnalysisStep,
  (context) => context.options.detailedAnalysis === true,
  [basicAnalysisStep.name]
);
```

## 5. トラブルシューティング

### 5.1 一般的な問題と解決策

#### タイムアウトエラー

**問題**: 特定のステップがタイムアウトする
**解決策**: 
- ステップのタイムアウト値を増やす
- 処理を複数のステップに分割する
- 入力データのサイズを制限する

```typescript
// タイムアウト値の増加
const step = new ComplexAnalysisStep();
step.timeout = 60000; // 60秒に増加
```

#### メモリ使用量の問題

**問題**: 分析処理中にメモリ使用量が急増する
**解決策**:
- 入力データをチャンクに分割して処理する
- 中間結果の保持を最小限に抑える

#### 依存関係の問題

**問題**: ステップの依存関係が解決できない
**解決策**:
- 依存グラフを確認し、循環依存を解消する
- 依存関係を明示的に定義する

### 5.2 診断ツール

パフォーマンス問題の診断には、`PerformanceMonitoringDB` クラスを活用します。

```typescript
// パフォーマンス傾向の分析
const performanceDB = PerformanceMonitoringDB.getInstance();
const trends = performanceDB.analyzeTrends();

// 最適化提案の取得
const suggestions = performanceDB.suggestOptimizations();
console.log('パフォーマンス最適化提案:', suggestions);
```

## 6. まとめ

`ChapterAnalysisPipeline` フレームワークを活用することで、章分析を柔軟かつ拡張可能な方法で行うことができます。既存のシステムに段階的に統合することで、コードの保守性と拡張性を向上させつつ、パフォーマンスの最適化も実現できます。

新しい分析機能を追加する際は、独立したステップとして実装し、適切なパイプラインに組み込むことで、システム全体の複雑性を増すことなく機能拡張が可能です。