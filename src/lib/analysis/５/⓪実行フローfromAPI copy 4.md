// src/lib/analysis/pipeline/usage-examples.ts

import { Chapter } from '@/types/chapters';
import { GenerationContext } from '@/types/generation';
import { GeminiAdapter } from '@/lib/analysis/adapters/gemini-adapter';
import { MemoryManager } from '@/lib/memory/manager';
import { ChapterAnalysisPipelineFactory } from './chapter-analysis-pipeline-factory';
import { 
  BasicAnalysisStep, 
  CharacterAnalysisStep, 
  ThemeAnalysisStep
} from './analysis-steps';
import { logger } from '@/lib/utils/logger';

/**
 * 標準的な分析パイプラインの使用例
 * 
 * @param chapter 分析対象の章
 * @param context 生成コンテキスト
 * @returns 分析結果
 */
export async function analyzeChapterStandard(
  chapter: Chapter, 
  context?: GenerationContext
) {
  logger.info('標準分析パイプラインを使用した章分析を開始');
  
  // パイプラインファクトリを作成
  const geminiAdapter = new GeminiAdapter();
  const memoryManager = new MemoryManager();
  const pipelineFactory = new ChapterAnalysisPipelineFactory(geminiAdapter, memoryManager);
  
  // 標準分析パイプラインを構築
  const pipeline = pipelineFactory.createStandardPipeline();
  
  // パイプライン実行
  const result = await pipeline.execute(chapter, context);
  
  logger.info('章分析が完了しました', {
    chapterNumber: chapter.chapterNumber,
    analysisResultSize: JSON.stringify(result).length
  });
  
  return result;
}

/**
 * 軽量分析パイプラインの使用例
 * 
 * @param chapter 分析対象の章
 * @param context 生成コンテキスト
 * @returns 分析結果
 */
export async function analyzeChapterLightweight(
  chapter: Chapter, 
  context?: GenerationContext
) {
  logger.info('軽量分析パイプラインを使用した章分析を開始');
  
  // パイプラインファクトリを作成
  const geminiAdapter = new GeminiAdapter();
  const memoryManager = new MemoryManager();
  const pipelineFactory = new ChapterAnalysisPipelineFactory(geminiAdapter, memoryManager);
  
  // 軽量分析パイプラインを構築
  const pipeline = pipelineFactory.createLightweightPipeline();
  
  // パイプライン実行
  const result = await pipeline.execute(chapter, context, {
    defaultTimeout: 10000 // タイムアウトを短く設定
  });
  
  logger.info('軽量章分析が完了しました', {
    chapterNumber: chapter.chapterNumber
  });
  
  return result;
}

/**
 * 詳細分析パイプラインの使用例
 * 
 * @param chapter 分析対象の章
 * @param context 生成コンテキスト
 * @returns 分析結果
 */
export async function analyzeChapterComprehensive(
  chapter: Chapter, 
  context?: GenerationContext
) {
  logger.info('詳細分析パイプラインを使用した章分析を開始');
  
  // パイプラインファクトリを作成
  const geminiAdapter = new GeminiAdapter();
  const memoryManager = new MemoryManager();
  const pipelineFactory = new ChapterAnalysisPipelineFactory(geminiAdapter, memoryManager);
  
  // 詳細分析パイプラインを構築
  const pipeline = pipelineFactory.createComprehensivePipeline();
  
  // パイプライン実行
  const result = await pipeline.execute(chapter, context);
  
  logger.info('詳細章分析が完了しました', {
    chapterNumber: chapter.chapterNumber,
    characterAppearances: result.characterAppearances?.length || 0,
    themeOccurrences: result.themeOccurrences?.length || 0,
    foreshadowingElements: result.foreshadowingElements?.length || 0
  });
  
  return result;
}

/**
 * 目的特化型パイプラインの使用例
 * 
 * @param chapter 分析対象の章
 * @param analysisType 分析タイプ
 * @param context 生成コンテキスト
 * @returns 分析結果
 */
export async function analyzeChapterFocused(
  chapter: Chapter,
  analysisType: 'character' | 'theme' | 'style',
  context?: GenerationContext
) {
  logger.info(`${analysisType}特化型パイプラインを使用した章分析を開始`);
  
  // パイプラインファクトリを作成
  const geminiAdapter = new GeminiAdapter();
  const memoryManager = new MemoryManager();
  const pipelineFactory = new ChapterAnalysisPipelineFactory(geminiAdapter, memoryManager);
  
  // 分析タイプに応じたパイプラインを構築
  let pipeline;
  switch (analysisType) {
    case 'character':
      pipeline = pipelineFactory.createCharacterFocusedPipeline();
      break;
    case 'theme':
      pipeline = pipelineFactory.createThemeFocusedPipeline();
      break;
    case 'style':
      pipeline = pipelineFactory.createStyleFocusedPipeline();
      break;
  }
  
  // パイプライン実行
  const result = await pipeline.execute(chapter, context);
  
  logger.info(`${analysisType}特化型章分析が完了しました`, {
    chapterNumber: chapter.chapterNumber
  });
  
  return result;
}

/**
 * カスタムパイプラインの構築と使用例
 * 
 * @param chapter 分析対象の章
 * @param context 生成コンテキスト
 * @returns 分析結果
 */
export async function analyzeChapterCustom(
  chapter: Chapter,
  context?: GenerationContext
) {
  logger.info('カスタムパイプラインを使用した章分析を開始');
  
  // パイプラインファクトリを作成
  const geminiAdapter = new GeminiAdapter();
  const memoryManager = new MemoryManager();
  const pipelineFactory = new ChapterAnalysisPipelineFactory(geminiAdapter, memoryManager);
  
  // サービスを取得
  const services = pipelineFactory.getServices();
  
  // カスタムパイプラインを構築
  const pipeline = pipelineFactory.getCustomPipelineBuilder({
    defaultTimeout: 20000,
    continueOnError: true
  });
  
  // 基本分析ステップ
  const basicStep = new BasicAnalysisStep(services.chapterAnalysisService);
  pipeline.addStep(basicStep);
  
  // 条件に基づいてステップを追加
  if (chapter.chapterNumber > 1) {
    // キャラクター分析ステップ
    const characterStep = new CharacterAnalysisStep(services.characterAnalysisService);
    pipeline.addStep(characterStep);
  }
  
  // テーマが指定されている場合のみテーマ分析を実行
  if (context?.theme) {
    const themeStep = new ThemeAnalysisStep(services.themeAnalysisService);
    pipeline.addStep(themeStep);
  }
  
  // パイプライン実行
  const result = await pipeline.execute(chapter, context);
  
  logger.info('カスタム章分析が完了しました', {
    chapterNumber: chapter.chapterNumber
  });
  
  return result;
}

/**
 * バッチ処理での使用例
 * 
 * @param chapters 分析対象の章配列
 * @param context 生成コンテキスト
 * @returns 章ごとの分析結果
 */
export async function analyzeChaptersBatch(
  chapters: Chapter[],
  context?: GenerationContext
) {
  logger.info(`バッチ処理での章分析を開始 (${chapters.length}章)`);
  
  // パイプラインファクトリを作成
  const geminiAdapter = new GeminiAdapter();
  const memoryManager = new MemoryManager();
  const pipelineFactory = new ChapterAnalysisPipelineFactory(geminiAdapter, memoryManager);
  
  // 標準分析パイプラインを構築（再利用）
  const pipeline = pipelineFactory.createStandardPipeline();
  
  // 各章を分析（直列実行）
  const results = [];
  for (const chapter of chapters) {
    logger.info(`章 ${chapter.chapterNumber} の分析を開始`);
    
    try {
      const result = await pipeline.execute(chapter, context);
      results.push({
        chapterNumber: chapter.chapterNumber,
        result
      });
      
      logger.info(`章 ${chapter.chapterNumber} の分析が完了しました`);
    } catch (error) {
      logger.error(`章 ${chapter.chapterNumber} の分析に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      
      results.push({
        chapterNumber: chapter.chapterNumber,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  logger.info(`バッチ処理での章分析が完了しました (${results.length}章)`);
  return results;
}

/**
 * エラーハンドリングの例
 * 
 * @param chapter 分析対象の章
 * @param context 生成コンテキスト
 * @returns 分析結果
 */
export async function analyzeChapterWithErrorHandling(
  chapter: Chapter,
  context?: GenerationContext
) {
  logger.info('エラーハンドリング付き章分析を開始');
  
  // パイプラインファクトリを作成
  const geminiAdapter = new GeminiAdapter();
  const memoryManager = new MemoryManager();
  const pipelineFactory = new ChapterAnalysisPipelineFactory(geminiAdapter, memoryManager);
  
  // 分析パイプラインを構築
  const pipeline = pipelineFactory.createStandardPipeline({
    continueOnError: true,
    allowPartialResults: true
  });
  
  try {
    // パイプライン実行
    const result = await pipeline.execute(chapter, context);
    
    // エラーチェック
    if (result.analysisErrors && result.analysisErrors.length > 0) {
      logger.warn('章分析で部分的なエラーが発生しました', {
        chapterNumber: chapter.chapterNumber,
        errors: result.analysisErrors
      });
      
      // エラー情報を含めて返す
      return {
        result,
        partialSuccess: true,
        errorCount: result.analysisErrors.length
      };
    }
    
    logger.info('エラーなしで章分析が完了しました', {
      chapterNumber: chapter.chapterNumber
    });
    
    return {
      result,
      partialSuccess: false,
      errorCount: 0
    };
  } catch (error) {
    logger.error('章分析中に重大なエラーが発生しました', {
      chapterNumber: chapter.chapterNumber,
      error: error instanceof Error ? error.message : String(error)
    });
    
    // エラー情報を含めて返す
    return {
      result: null,
      partialSuccess: false,
      errorCount: 1,
      criticalError: error instanceof Error ? error.message : String(error)
    };
  }
}