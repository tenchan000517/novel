// // src/lib/analysis/pipeline/chapter-analysis-pipeline.ts

// import { logger } from '@/lib/utils/logger';
// import { Chapter } from '@/types/chapters';
// import { GenerationContext, ChapterAnalysis } from '@/types/generation';
// import { withTimeout } from '@/lib/utils/promise-utils';

// /**
//  * 分析ステップインターフェース
//  * パイプラインの各ステップを定義します
//  */
// export interface AnalysisStep<TInput = any, TOutput = any> {
//   /**
//    * ステップの名前
//    */
//   readonly name: string;
  
//   /**
//    * ステップの実行関数
//    * @param input 入力データ
//    * @param context パイプラインコンテキスト
//    * @returns 出力データのPromise
//    */
//   execute(input: TInput, context: PipelineContext): Promise<TOutput>;
  
//   /**
//    * ステップが実行可能か判定する関数
//    * @param context パイプラインコンテキスト
//    * @returns 実行可能な場合はtrue
//    */
//   shouldRun?(context: PipelineContext): boolean;
  
//   /**
//    * タイムアウト時間（ミリ秒）
//    */
//   timeout?: number;
// }

// /**
//  * パイプラインコンテキスト
//  * パイプライン実行中に共有されるデータ
//  */
// export interface PipelineContext {
//   /**
//    * 章データ
//    */
//   chapter: Chapter;
  
//   /**
//    * 生成コンテキスト
//    */
//   generationContext?: GenerationContext;
  
//   /**
//    * 中間結果を保持するオブジェクト
//    */
//   intermediateResults: Record<string, any>;
  
//   /**
//    * エラー情報
//    */
//   errors: Map<string, Error>;
  
//   /**
//    * パイプラインオプション
//    */
//   options: PipelineOptions;
// }

// /**
//  * パイプラインオプション
//  */
// export interface PipelineOptions {
//   /**
//    * デフォルトのタイムアウト時間（ミリ秒）
//    */
//   defaultTimeout?: number;
  
//   /**
//    * エラー時に実行を継続するかどうか
//    */
//   continueOnError?: boolean;
  
//   /**
//    * 詳細なログを出力するかどうか
//    */
//   verbose?: boolean;
  
//   /**
//    * 部分的な結果を許可するかどうか
//    */
//   allowPartialResults?: boolean;
// }

// /**
//  * 実行ステップ定義
//  * パイプライン内の各ステップ情報
//  */
// interface ExecutionStep {
//   step: AnalysisStep;
//   isParallel: boolean;
//   dependsOn: string[];
// }

// /**
//  * 章分析パイプライン
//  * 章の分析を段階的に行うためのパイプライン
//  */
// export class ChapterAnalysisPipeline {
//   private steps: Map<string, ExecutionStep> = new Map();
//   private executionOrder: string[] = [];
//   private parallelGroups: string[][] = [];
//   private defaultOptions: PipelineOptions = {
//     defaultTimeout: 30000,
//     continueOnError: true,
//     verbose: false,
//     allowPartialResults: true
//   };
  
//   /**
//    * コンストラクタ
//    * @param options パイプラインオプション
//    */
//   constructor(options?: Partial<PipelineOptions>) {
//     this.defaultOptions = { ...this.defaultOptions, ...options };
//   }
  
//   /**
//    * 直列実行ステップを追加
//    * @param step 分析ステップ
//    * @param dependsOn 依存するステップの名前の配列
//    */
//   addStep(step: AnalysisStep, dependsOn: string[] = []): ChapterAnalysisPipeline {
//     this.validateDependencies(dependsOn);
    
//     this.steps.set(step.name, {
//       step,
//       isParallel: false,
//       dependsOn
//     });
    
//     this.executionOrder.push(step.name);
    
//     logger.debug(`Added serial step: ${step.name}`, {
//       dependsOn: dependsOn.length > 0 ? dependsOn.join(', ') : 'none'
//     });
    
//     return this;
//   }
  
//   /**
//    * 並列実行グループにステップを追加
//    * @param steps 分析ステップの配列
//    * @param dependsOn 依存するステップの名前の配列
//    */
//   addParallelSteps(steps: AnalysisStep[], dependsOn: string[] = []): ChapterAnalysisPipeline {
//     this.validateDependencies(dependsOn);
    
//     const parallelGroup: string[] = [];
    
//     for (const step of steps) {
//       this.steps.set(step.name, {
//         step,
//         isParallel: true,
//         dependsOn
//       });
      
//       parallelGroup.push(step.name);
//       this.executionOrder.push(step.name);
//     }
    
//     this.parallelGroups.push(parallelGroup);
    
//     logger.debug(`Added parallel group with ${steps.length} steps`, {
//       steps: steps.map(s => s.name).join(', '),
//       dependsOn: dependsOn.length > 0 ? dependsOn.join(', ') : 'none'
//     });
    
//     return this;
//   }
  
//   /**
//    * 条件付きでステップを追加
//    * @param step 分析ステップ
//    * @param condition 条件関数
//    * @param dependsOn 依存するステップの名前の配列
//    */
//   addConditionalStep(
//     step: AnalysisStep, 
//     condition: (context: PipelineContext) => boolean,
//     dependsOn: string[] = []
//   ): ChapterAnalysisPipeline {
//     // オリジナルのshouldRunを保存
//     const originalShouldRun = step.shouldRun;
    
//     // 条件付きステップのshouldRunを上書き
//     const stepWithCondition = {
//       ...step,
//       shouldRun: (context: PipelineContext) => {
//         // オリジナルの条件と新しい条件の両方を評価
//         const originalResult = originalShouldRun ? originalShouldRun(context) : true;
//         return originalResult && condition(context);
//       }
//     };
    
//     return this.addStep(stepWithCondition, dependsOn);
//   }
  
//   /**
//    * パイプラインを実行
//    * @param chapter 分析対象の章
//    * @param generationContext 生成コンテキスト
//    * @param options 実行オプション
//    * @returns 分析結果
//    */
//   async execute(
//     chapter: Chapter,
//     generationContext?: GenerationContext,
//     options?: Partial<PipelineOptions>
//   ): Promise<ChapterAnalysis> {
//     const startTime = Date.now();
//     logger.info(`Starting analysis pipeline for chapter ${chapter.chapterNumber}`, {
//       title: chapter.title,
//       stepsCount: this.steps.size
//     });
    
//     // パイプラインコンテキストの初期化
//     const context: PipelineContext = {
//       chapter,
//       generationContext,
//       intermediateResults: {},
//       errors: new Map(),
//       options: { ...this.defaultOptions, ...options }
//     };
    
//     // 実行対象ステップの決定
//     const stepsToExecute = this.determineExecutionSteps(context);
    
//     try {
//       // 依存関係に基づいて実行順序を最適化
//       const optimizedOrder = this.optimizeExecutionOrder(stepsToExecute);
      
//       // ステップの実行
//       for (const group of optimizedOrder) {
//         if (group.length === 1) {
//           // 直列実行
//           const stepName = group[0];
//           const execStep = this.steps.get(stepName)!;
          
//           await this.executeStep(execStep, context);
//         } else {
//           // 並列実行
//           const parallelPromises = group.map(stepName => {
//             const execStep = this.steps.get(stepName)!;
//             return this.executeStep(execStep, context);
//           });
          
//           await Promise.allSettled(parallelPromises);
//         }
//       }
      
//       // 結果の集約
//       const result = this.aggregateResults(context);
      
//       const duration = Date.now() - startTime;
//       logger.info(`Analysis pipeline completed for chapter ${chapter.chapterNumber}`, {
//         duration,
//         errorsCount: context.errors.size,
//         result: context.options.verbose ? JSON.stringify(result).substring(0, 200) + '...' : undefined
//       });
      
//       return result;
//     } catch (error) {
//       const duration = Date.now() - startTime;
//       logger.error(`Analysis pipeline failed for chapter ${chapter.chapterNumber}`, {
//         duration,
//         error: error instanceof Error ? error.message : String(error),
//         errorsCount: context.errors.size
//       });
      
//       // 部分的な結果を許可する場合は現状の結果を返す
//       if (context.options.allowPartialResults) {
//         return this.aggregateResults(context);
//       }
      
//       throw error;
//     }
//   }
  
//   /**
//    * 単一ステップを実行
//    * @param execStep 実行ステップ
//    * @param context パイプラインコンテキスト
//    */
//   private async executeStep(execStep: ExecutionStep, context: PipelineContext): Promise<void> {
//     const { step } = execStep;
    
//     // 実行条件をチェック
//     if (step.shouldRun && !step.shouldRun(context)) {
//       logger.debug(`Skipping step ${step.name} as shouldRun returned false`);
//       return;
//     }
    
//     // 入力データの準備
//     const input = this.prepareInputForStep(step, execStep.dependsOn, context);
    
//     logger.debug(`Executing step: ${step.name}`);
//     const stepStartTime = Date.now();
    
//     try {
//       // タイムアウト付きで実行
//       const timeout = step.timeout || context.options.defaultTimeout || 30000;
//       const result = await withTimeout(
//         step.execute(input, context),
//         timeout,
//         `Analysis step: ${step.name}`
//       );
      
//       // 結果を保存
//       context.intermediateResults[step.name] = result;
      
//       const duration = Date.now() - stepStartTime;
//       logger.debug(`Completed step: ${step.name}`, { duration });
//     } catch (error) {
//       const duration = Date.now() - stepStartTime;
//       logger.error(`Failed executing step: ${step.name}`, {
//         duration,
//         error: error instanceof Error ? error.message : String(error)
//       });
      
//       // エラーを記録
//       context.errors.set(step.name, error instanceof Error ? error : new Error(String(error)));
      
//       // エラー時に続行しない設定の場合は例外を投げる
//       if (!context.options.continueOnError) {
//         throw error;
//       }
//     }
//   }
  
//   /**
//    * ステップの入力データを準備
//    * @param step 実行ステップ
//    * @param dependencies 依存ステップ名配列
//    * @param context パイプラインコンテキスト
//    * @returns 入力データ
//    */
//   private prepareInputForStep(
//     step: AnalysisStep,
//     dependencies: string[],
//     context: PipelineContext
//   ): any {
//     // 依存がない場合は章データを入力とする
//     if (dependencies.length === 0) {
//       return context.chapter;
//     }
    
//     // 依存が1つの場合はその結果を入力とする
//     if (dependencies.length === 1) {
//       return context.intermediateResults[dependencies[0]];
//     }
    
//     // 複数の依存がある場合は、依存ステップ名をキーとした結果オブジェクトを作成
//     const input: Record<string, any> = {};
//     for (const dep of dependencies) {
//       input[dep] = context.intermediateResults[dep];
//     }
    
//     return input;
//   }
  
//   /**
//    * 依存関係が有効か検証
//    * @param dependencies 依存ステップ名配列
//    */
//   private validateDependencies(dependencies: string[]): void {
//     for (const dep of dependencies) {
//       if (!this.steps.has(dep)) {
//         throw new Error(`Dependency not found: ${dep}`);
//       }
//     }
//   }
  
//   /**
//    * 実行するステップを決定
//    * @param context パイプラインコンテキスト
//    * @returns 実行するステップ名の配列
//    */
//   private determineExecutionSteps(context: PipelineContext): string[] {
//     const stepsToExecute: string[] = [];
    
//     for (const stepName of this.executionOrder) {
//       const execStep = this.steps.get(stepName)!;
      
//       // shouldRunをチェック
//       if (execStep.step.shouldRun && !execStep.step.shouldRun(context)) {
//         continue;
//       }
      
//       // 依存関係ですでに失敗したステップがある場合はスキップ
//       const hasDependencyError = execStep.dependsOn.some(dep => context.errors.has(dep));
//       if (hasDependencyError && !context.options.continueOnError) {
//         continue;
//       }
      
//       stepsToExecute.push(stepName);
//     }
    
//     return stepsToExecute;
//   }
  
//   /**
//    * 実行順序を最適化
//    * @param stepsToExecute 実行するステップ名の配列
//    * @returns 最適化された実行グループの配列
//    */
//   private optimizeExecutionOrder(stepsToExecute: string[]): string[][] {
//     const result: string[][] = [];
//     const visited = new Set<string>();
    
//     // まず全ての並列グループを特定
//     const validParallelGroups = this.parallelGroups
//       .map(group => group.filter(step => stepsToExecute.includes(step)))
//       .filter(group => group.length > 0);
    
//     // 依存関係に基づいて実行順序を構築
//     for (const stepName of stepsToExecute) {
//       if (visited.has(stepName)) continue;
      
//       // すでに並列グループに含まれているか確認
//       const parallelGroup = validParallelGroups.find(group => group.includes(stepName));
      
//       if (parallelGroup) {
//         // 全ての依存関係が満たされているか確認
//         const allDependenciesMet = parallelGroup.every(step => {
//           const dependencies = this.steps.get(step)!.dependsOn;
//           return dependencies.every(dep => visited.has(dep));
//         });
        
//         if (allDependenciesMet) {
//           // 並列グループとして追加
//           result.push(parallelGroup);
//           parallelGroup.forEach(step => visited.add(step));
//         } else {
//           // 依存関係が未解決なので個別に追加
//           result.push([stepName]);
//           visited.add(stepName);
//         }
//       } else {
//         // 並列グループに含まれていない通常のステップ
//         result.push([stepName]);
//         visited.add(stepName);
//       }
//     }
    
//     return result;
//   }
  
//   /**
//    * 結果を集約
//    * @param context パイプラインコンテキスト
//    * @returns 章分析結果
//    */
//   private aggregateResults(context: PipelineContext): ChapterAnalysis {
//     // デフォルト値で初期化
//     const result: ChapterAnalysis = {
//       characterAppearances: [],
//       themeOccurrences: [],
//       foreshadowingElements: [],
//       qualityMetrics: {
//         readability: 0.7,
//         consistency: 0.7,
//         engagement: 0.7,
//         characterDepiction: 0.7,
//         originality: 0.7,
//         overall: 0.7
//       },
//       detectedIssues: []
//     };
    
//     // 中間結果から必要なデータを集約
//     for (const [stepName, stepResult] of Object.entries(context.intermediateResults)) {
//       if (!stepResult) continue;
      
//       // キャラクター出現情報
//       if (stepResult.characterAppearances && Array.isArray(stepResult.characterAppearances)) {
//         result.characterAppearances = stepResult.characterAppearances;
//       }
      
//       // テーマ出現情報
//       if (stepResult.themeOccurrences && Array.isArray(stepResult.themeOccurrences)) {
//         result.themeOccurrences = stepResult.themeOccurrences;
//       }
      
//       // 伏線要素
//       if (stepResult.foreshadowingElements && Array.isArray(stepResult.foreshadowingElements)) {
//         result.foreshadowingElements = stepResult.foreshadowingElements;
//       }
      
//       // 品質メトリクス
//       if (stepResult.qualityMetrics && typeof stepResult.qualityMetrics === 'object') {
//         result.qualityMetrics = { ...result.qualityMetrics, ...stepResult.qualityMetrics };
//       }
      
//       // シーン情報
//       if (stepResult.scenes && Array.isArray(stepResult.scenes)) {
//         result.scenes = stepResult.scenes;
//       }
      
//       // テキスト統計情報
//       if (stepResult.textStats && typeof stepResult.textStats === 'object') {
//         result.textStats = stepResult.textStats;
//       }
      
//       // 検出された問題
//       if (stepResult.detectedIssues && Array.isArray(stepResult.detectedIssues)) {
//         result.detectedIssues.push(...stepResult.detectedIssues);
//       }
      
//       // テーマ強化提案
//       if (stepResult.themeEnhancements && Array.isArray(stepResult.themeEnhancements)) {
//         result.themeEnhancements = stepResult.themeEnhancements;
//       }
      
//       // 読者体験
//       if (stepResult.readerExperience && typeof stepResult.readerExperience === 'object') {
//         result.readerExperience = stepResult.readerExperience;
//       }
//     }
    
//     // エラーを追加
//     if (context.errors.size > 0) {
//       result.analysisErrors = Array.from(context.errors.entries()).map(([stepName, error]) => ({
//         step: stepName,
//         message: error.message
//       }));
//     }
    
//     return result;
//   }
// }