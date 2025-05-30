// // src/lib/analysis/pipeline/chapter-analysis-pipeline-factory.ts

// import { ChapterAnalysisPipeline, PipelineOptions } from './chapter-analysis-pipeline';
// import { 
//   BasicAnalysisStep, 
//   CharacterAnalysisStep, 
//   ThemeAnalysisStep, 
//   StyleAnalysisStep,
//   ForeshadowingAnalysisStep,
//   NarrativeStructureStep,
//   SceneExtractionStep,
//   QualityMetricsAggregationStep,
//   ReaderExperienceStep
// } from './analysis-steps';
// import { ChapterAnalysisService } from '@/lib/analysis/services/chapter/chapter-analysis-service';
// import { CharacterAnalysisService } from '@/lib/analysis/services/character-analysis-service';
// import { StyleAnalysisService } from '@/lib/analysis/services/style-analysis-service';
// import { ThemeAnalysisService } from '@/lib/analysis/services/theme-analysis-service';
// import { NarrativeAnalysisService } from '@/lib/analysis/services/narrative-analysis-service';
// import { GeminiAdapter } from '@/lib/analysis/adapters/gemini-adapter';
// import { MemoryManager } from '@/lib/memory/manager';
// import { logger } from '@/lib/utils/logger';

// /**
//  * 章分析パイプラインファクトリ
//  * 様々な用途に適したパイプラインを構築します
//  */
// export class ChapterAnalysisPipelineFactory {
//   private chapterAnalysisService: ChapterAnalysisService;
//   private characterAnalysisService: CharacterAnalysisService;
//   private styleAnalysisService: StyleAnalysisService;
//   private themeAnalysisService: ThemeAnalysisService;
//   private narrativeAnalysisService: NarrativeAnalysisService;
  
//   /**
//    * コンストラクタ
//    * @param geminiAdapter AI生成・分析用アダプター
//    * @param memoryManager メモリマネージャー
//    */
//   constructor(
//     private geminiAdapter: GeminiAdapter,
//     private memoryManager: MemoryManager
//   ) {
//     // 依存サービスの初期化
//     this.chapterAnalysisService = new ChapterAnalysisService(geminiAdapter);
//     this.characterAnalysisService = new CharacterAnalysisService(geminiAdapter);
//     this.styleAnalysisService = new StyleAnalysisService(geminiAdapter);
//     this.themeAnalysisService = new ThemeAnalysisService(geminiAdapter, memoryManager);
//     this.narrativeAnalysisService = new NarrativeAnalysisService({ geminiClient: geminiAdapter });
    
//     logger.info('ChapterAnalysisPipelineFactory: 初期化完了');
//   }
  
//   /**
//    * 標準的な分析パイプラインを作成
//    * バランスの取れた分析を行うパイプライン
//    * 
//    * @param options パイプラインオプション
//    * @returns 章分析パイプライン
//    */
//   createStandardPipeline(options?: Partial<PipelineOptions>): ChapterAnalysisPipeline {
//     const pipeline = new ChapterAnalysisPipeline(options);
    
//     // 基本分析ステップ
//     const basicAnalysisStep = new BasicAnalysisStep(this.chapterAnalysisService);
//     pipeline.addStep(basicAnalysisStep);
    
//     // シーン抽出ステップ
//     const sceneExtractionStep = new SceneExtractionStep(this.chapterAnalysisService);
//     pipeline.addStep(sceneExtractionStep);
    
//     // 並列分析ステップ
//     const characterAnalysisStep = new CharacterAnalysisStep(this.characterAnalysisService);
//     const themeAnalysisStep = new ThemeAnalysisStep(this.themeAnalysisService);
//     const styleAnalysisStep = new StyleAnalysisStep(this.styleAnalysisService);
    
//     pipeline.addParallelSteps([
//       characterAnalysisStep,
//       themeAnalysisStep,
//       styleAnalysisStep
//     ]);
    
//     // 伏線分析ステップ
//     const foreshadowingStep = new ForeshadowingAnalysisStep(this.themeAnalysisService);
//     pipeline.addStep(foreshadowingStep);
    
//     // 物語構造分析ステップ
//     const narrativeStructureStep = new NarrativeStructureStep(this.narrativeAnalysisService);
//     pipeline.addStep(narrativeStructureStep);
    
//     // 品質メトリクス集約ステップ
//     const qualityMetricsStep = new QualityMetricsAggregationStep();
//     pipeline.addStep(qualityMetricsStep, [
//       basicAnalysisStep.name,
//       styleAnalysisStep.name
//     ]);
    
//     // 読者体験分析ステップ
//     const readerExperienceStep = new ReaderExperienceStep(this.chapterAnalysisService);
//     pipeline.addStep(readerExperienceStep, [
//       basicAnalysisStep.name
//     ]);
    
//     logger.info('標準分析パイプラインを作成しました');
//     return pipeline;
//   }
  
//   /**
//    * 軽量な分析パイプラインを作成
//    * 最小限の分析を行う高速なパイプライン
//    * 
//    * @param options パイプラインオプション
//    * @returns 章分析パイプライン
//    */
//   createLightweightPipeline(options?: Partial<PipelineOptions>): ChapterAnalysisPipeline {
//     const pipeline = new ChapterAnalysisPipeline({
//       defaultTimeout: 15000, // より短いタイムアウト
//       ...options
//     });
    
//     // 基本分析ステップのみ
//     const basicAnalysisStep = new BasicAnalysisStep(this.chapterAnalysisService);
//     pipeline.addStep(basicAnalysisStep);
    
//     // シーン抽出ステップ
//     const sceneExtractionStep = new SceneExtractionStep(this.chapterAnalysisService);
//     pipeline.addStep(sceneExtractionStep);
    
//     // 品質メトリクス集約ステップ
//     const qualityMetricsStep = new QualityMetricsAggregationStep();
//     pipeline.addStep(qualityMetricsStep, [
//       basicAnalysisStep.name
//     ]);
    
//     logger.info('軽量分析パイプラインを作成しました');
//     return pipeline;
//   }
  
//   /**
//    * キャラクター分析特化パイプラインを作成
//    * キャラクター分析に特化したパイプライン
//    * 
//    * @param options パイプラインオプション
//    * @returns 章分析パイプライン
//    */
//   createCharacterFocusedPipeline(options?: Partial<PipelineOptions>): ChapterAnalysisPipeline {
//     const pipeline = new ChapterAnalysisPipeline(options);
    
//     // 基本分析ステップ
//     const basicAnalysisStep = new BasicAnalysisStep(this.chapterAnalysisService);
//     pipeline.addStep(basicAnalysisStep);
    
//     // キャラクター分析ステップ
//     const characterAnalysisStep = new CharacterAnalysisStep(this.characterAnalysisService);
//     pipeline.addStep(characterAnalysisStep);
    
//     // 品質メトリクス集約ステップ
//     const qualityMetricsStep = new QualityMetricsAggregationStep();
//     pipeline.addStep(qualityMetricsStep, [
//       basicAnalysisStep.name
//     ]);
    
//     logger.info('キャラクター分析特化パイプラインを作成しました');
//     return pipeline;
//   }
  
//   /**
//    * テーマ・伏線分析特化パイプラインを作成
//    * テーマと伏線の分析に特化したパイプライン
//    * 
//    * @param options パイプラインオプション
//    * @returns 章分析パイプライン
//    */
//   createThemeFocusedPipeline(options?: Partial<PipelineOptions>): ChapterAnalysisPipeline {
//     const pipeline = new ChapterAnalysisPipeline(options);
    
//     // 基本分析ステップ
//     const basicAnalysisStep = new BasicAnalysisStep(this.chapterAnalysisService);
//     pipeline.addStep(basicAnalysisStep);
    
//     // テーマ分析ステップ
//     const themeAnalysisStep = new ThemeAnalysisStep(this.themeAnalysisService);
//     pipeline.addStep(themeAnalysisStep);
    
//     // 伏線分析ステップ
//     const foreshadowingStep = new ForeshadowingAnalysisStep(this.themeAnalysisService);
//     pipeline.addStep(foreshadowingStep);
    
//     // 品質メトリクス集約ステップ
//     const qualityMetricsStep = new QualityMetricsAggregationStep();
//     pipeline.addStep(qualityMetricsStep, [
//       basicAnalysisStep.name
//     ]);
    
//     logger.info('テーマ・伏線分析特化パイプラインを作成しました');
//     return pipeline;
//   }
  
//   /**
//    * 文体・表現分析特化パイプラインを作成
//    * 文体と表現パターンの分析に特化したパイプライン
//    * 
//    * @param options パイプラインオプション
//    * @returns 章分析パイプライン
//    */
//   createStyleFocusedPipeline(options?: Partial<PipelineOptions>): ChapterAnalysisPipeline {
//     const pipeline = new ChapterAnalysisPipeline(options);
    
//     // 基本分析ステップ
//     const basicAnalysisStep = new BasicAnalysisStep(this.chapterAnalysisService);
//     pipeline.addStep(basicAnalysisStep);
    
//     // 文体分析ステップ
//     const styleAnalysisStep = new StyleAnalysisStep(this.styleAnalysisService);
//     pipeline.addStep(styleAnalysisStep);
    
//     // 品質メトリクス集約ステップ
//     const qualityMetricsStep = new QualityMetricsAggregationStep();
//     pipeline.addStep(qualityMetricsStep, [
//       basicAnalysisStep.name,
//       styleAnalysisStep.name
//     ]);
    
//     logger.info('文体・表現分析特化パイプラインを作成しました');
//     return pipeline;
//   }
  
//   /**
//    * 詳細な分析パイプラインを作成
//    * 全ての分析を実行する包括的なパイプライン
//    * 
//    * @param options パイプラインオプション
//    * @returns 章分析パイプライン
//    */
//   createComprehensivePipeline(options?: Partial<PipelineOptions>): ChapterAnalysisPipeline {
//     const pipeline = new ChapterAnalysisPipeline({
//       defaultTimeout: 60000, // より長いタイムアウト
//       verbose: true,
//       ...options
//     });
    
//     // 基本分析ステップ
//     const basicAnalysisStep = new BasicAnalysisStep(this.chapterAnalysisService);
//     pipeline.addStep(basicAnalysisStep);
    
//     // シーン抽出ステップ
//     const sceneExtractionStep = new SceneExtractionStep(this.chapterAnalysisService);
//     pipeline.addStep(sceneExtractionStep);
    
//     // 第一グループの並列分析ステップ
//     const characterAnalysisStep = new CharacterAnalysisStep(this.characterAnalysisService);
//     const styleAnalysisStep = new StyleAnalysisStep(this.styleAnalysisService);
    
//     pipeline.addParallelSteps([
//       characterAnalysisStep,
//       styleAnalysisStep
//     ]);
    
//     // 第二グループの並列分析ステップ
//     const themeAnalysisStep = new ThemeAnalysisStep(this.themeAnalysisService);
//     const narrativeStructureStep = new NarrativeStructureStep(this.narrativeAnalysisService);
    
//     pipeline.addParallelSteps([
//       themeAnalysisStep,
//       narrativeStructureStep
//     ], [
//       basicAnalysisStep.name
//     ]);
    
//     // 伏線分析ステップ
//     const foreshadowingStep = new ForeshadowingAnalysisStep(this.themeAnalysisService);
//     pipeline.addStep(foreshadowingStep, [
//       themeAnalysisStep.name
//     ]);
    
//     // 品質メトリクス集約ステップ
//     const qualityMetricsStep = new QualityMetricsAggregationStep();
//     pipeline.addStep(qualityMetricsStep, [
//       basicAnalysisStep.name,
//       styleAnalysisStep.name,
//       narrativeStructureStep.name
//     ]);
    
//     // 読者体験分析ステップ
//     const readerExperienceStep = new ReaderExperienceStep(this.chapterAnalysisService);
//     pipeline.addStep(readerExperienceStep, [
//       basicAnalysisStep.name,
//       qualityMetricsStep.name
//     ]);
    
//     logger.info('詳細分析パイプラインを作成しました');
//     return pipeline;
//   }
  
//   /**
//    * カスタムパイプライン構築のためのビルダーを取得
//    * 
//    * @param options パイプラインオプション
//    * @returns 章分析パイプライン
//    */
//   getCustomPipelineBuilder(options?: Partial<PipelineOptions>): ChapterAnalysisPipeline {
//     // 設定済みパイプラインを返す
//     logger.info('カスタムパイプラインビルダーを作成しました');
//     return new ChapterAnalysisPipeline(options);
//   }
  
//   /**
//    * サービスインスタンスを取得
//    * カスタムパイプラインの構築に使用します
//    */
//   getServices() {
//     return {
//       chapterAnalysisService: this.chapterAnalysisService,
//       characterAnalysisService: this.characterAnalysisService,
//       styleAnalysisService: this.styleAnalysisService,
//       themeAnalysisService: this.themeAnalysisService,
//       narrativeAnalysisService: this.narrativeAnalysisService
//     };
//   }
// }