/**
 * @fileoverview 生成後パイプライン
 * @description 生成後の章分析→品質評価→次章準備フロー
 * @path src/lib/analysis/pipeline/post-generation-pipeline.ts
 */

import { logger } from '@/lib/utils/logger';
import { GenerationContext } from '@/types/generation';
import { Chapter } from '@/types/chapters';
import { AnalysisCoordinator } from '@/lib/analysis/coordinators/analysis-coordinator';
import { OptimizationCoordinator } from '@/lib/analysis/coordinators/optimization-coordinator';

/**
 * 生成後処理結果
 */
export interface ChapterProcessingResult {
  comprehensiveAnalysis: any;
  qualityMetrics: any;
  nextChapterSuggestions: string[];
  processingTime: number;
}

/**
 * @class PostGenerationPipeline
 * @description 生成後の章分析→品質評価→次章準備フロー
 * 
 * ChapterGeneratorの以下の処理をパイプライン化：
 * 1. 包括的分析の実行
 * 2. 品質メトリクスの抽出
 * 3. 次章用改善提案の生成
 * 4. 次章用データの保存準備
 */
export class PostGenerationPipeline {
  constructor(
    private analysisCoordinator: AnalysisCoordinator,
    private optimizationCoordinator: OptimizationCoordinator
  ) {
    logger.info('PostGenerationPipeline initialized');
  }

  /**
   * 生成後パイプライン実行
   * 
   * @param chapter 生成された章
   * @param context 生成コンテキスト
   * @returns 処理結果
   */
  async execute(chapter: Chapter, context: GenerationContext): Promise<ChapterProcessingResult> {
    try {
      logger.info(`Starting post-generation pipeline for chapter ${chapter.chapterNumber}`);
      const startTime = Date.now();

      // 1. 包括的分析の実行（AnalysisCoordinator使用）
      const analysisResults = await this.executeComprehensiveAnalysis(
        chapter.content,
        chapter.chapterNumber,
        context
      );

      // 2. 品質メトリクスの抽出
      const qualityMetrics = this.extractQualityMetrics(analysisResults);

      // 3. 次章用最適化提案の生成
      const nextChapterOptimizations = await this.generateNextChapterOptimizations(
        chapter,
        context,
        analysisResults
      );

      // 4. 次章用改善提案の統合
      const nextChapterSuggestions = this.integrateNextChapterSuggestions(
        analysisResults,
        nextChapterOptimizations
      );

      const processingTime = Date.now() - startTime;

      const result: ChapterProcessingResult = {
        comprehensiveAnalysis: analysisResults,
        qualityMetrics,
        nextChapterSuggestions,
        processingTime
      };

      logger.info(`Post-generation pipeline completed for chapter ${chapter.chapterNumber}`, {
        processingTime,
        analysisQuality: qualityMetrics?.overall || 0,
        nextChapterSuggestionCount: nextChapterSuggestions.length,
        analysisSuccessful: !!analysisResults,
        optimizationSuccessful: !!nextChapterOptimizations
      });

      return result;
    } catch (error) {
      logger.error('Post-generation pipeline failed', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber: chapter.chapterNumber,
        stack: error instanceof Error ? error.stack : undefined
      });

      // フォールバック結果を返す
      const processingTime = Date.now() - Date.now();
      return this.createFallbackResult(chapter, processingTime);
    }
  }

  /**
   * 包括的分析の実行
   * 
   * @private
   * @param content 章コンテンツ
   * @param chapterNumber 章番号
   * @param context 生成コンテキスト
   * @returns 分析結果
   */
  private async executeComprehensiveAnalysis(
    content: string,
    chapterNumber: number,
    context: GenerationContext
  ): Promise<any> {
    try {
      logger.debug(`Executing comprehensive analysis for chapter ${chapterNumber}`);

      const analysisResults = await this.analysisCoordinator.analyzeChapter(
        content,
        chapterNumber,
        context
      );

      logger.debug(`Comprehensive analysis completed for chapter ${chapterNumber}`, {
        hasQualityMetrics: !!analysisResults.qualityMetrics,
        hasThemeAnalysis: !!analysisResults.themeAnalysis,
        hasStyleAnalysis: !!analysisResults.styleAnalysis,
        hasCharacterAnalysis: !!analysisResults.characterAnalysis,
        hasReaderExperience: !!analysisResults.readerExperience,
        suggestionCount: analysisResults.integratedSuggestions?.length || 0
      });

      return analysisResults;
    } catch (error) {
      logger.error('Comprehensive analysis failed in post-generation pipeline', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });

      // フォールバック分析結果を返す
      return this.createFallbackAnalysis(chapterNumber, context);
    }
  }

  /**
   * 品質メトリクスの抽出
   * 
   * @private
   * @param analysisResults 分析結果
   * @returns 品質メトリクス
   */
  private extractQualityMetrics(analysisResults: any): any {
    try {
      if (!analysisResults || !analysisResults.qualityMetrics) {
        logger.warn('No quality metrics found in analysis results, using defaults');
        return this.createDefaultQualityMetrics();
      }

      const metrics = analysisResults.qualityMetrics;

      logger.debug('Quality metrics extracted', {
        overall: metrics.overall,
        readability: metrics.readability,
        consistency: metrics.consistency,
        engagement: metrics.engagement,
        characterDepiction: metrics.characterDepiction,
        originality: metrics.originality
      });

      return metrics;
    } catch (error) {
      logger.error('Failed to extract quality metrics', { error });
      return this.createDefaultQualityMetrics();
    }
  }

  /**
   * 次章用最適化提案の生成
   * 
   * @private
   * @param chapter 生成された章
   * @param context 生成コンテキスト
   * @param analysisResults 分析結果
   * @returns 最適化結果
   */
  private async generateNextChapterOptimizations(
    chapter: Chapter,
    context: GenerationContext,
    analysisResults: any
  ): Promise<any> {
    try {
      logger.debug(`Generating next chapter optimizations for chapter ${chapter.chapterNumber + 1}`);

      // 次章用のコンテキストを準備
      const nextChapterContext: GenerationContext = {
        ...context,
        chapterNumber: chapter.chapterNumber + 1
      };

      // OptimizationCoordinatorの入力形式に変換
      const optimizationInput = {
        themeAnalysis: analysisResults.themeAnalysis || this.createDefaultThemeAnalysis(),
        styleAnalysis: analysisResults.styleAnalysis || this.createDefaultStyleAnalysis(),
        expressionPatterns: analysisResults.expressionPatterns || this.createDefaultExpressionPatterns(),
        qualityMetrics: analysisResults.qualityMetrics || this.createDefaultQualityMetrics(),
        characters: context.characters || [],
        characterPsychologies: context.characterPsychology || {}
      };

      const optimizationResults = await this.optimizationCoordinator.optimizeChapter(
        chapter.content,
        chapter.chapterNumber + 1,
        nextChapterContext,
        optimizationInput
      );

      logger.debug(`Next chapter optimizations completed for chapter ${chapter.chapterNumber + 1}`, {
        hasThemeOptimization: !!optimizationResults.themeOptimization,
        hasStyleOptimization: !!optimizationResults.styleOptimization,
        hasCharacterOptimization: !!optimizationResults.characterOptimization,
        hasTensionOptimization: !!optimizationResults.tensionOptimization,
        prioritizedSuggestionCount: optimizationResults.integratedRecommendations?.prioritizedSuggestions?.length || 0
      });

      return optimizationResults;
    } catch (error) {
      logger.warn('Next chapter optimization generation failed, using fallback', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber: chapter.chapterNumber
      });
      return null;
    }
  }

  /**
   * 次章用改善提案の統合
   * 
   * @private
   * @param analysisResults 分析結果
   * @param optimizationResults 最適化結果
   * @returns 統合された改善提案
   */
  private integrateNextChapterSuggestions(
    analysisResults: any,
    optimizationResults: any
  ): string[] {
    const suggestions: string[] = [];

    try {
      // 1. 分析結果からの改善提案
      if (analysisResults?.integratedSuggestions) {
        suggestions.push(...analysisResults.integratedSuggestions);
        logger.debug(`Added ${analysisResults.integratedSuggestions.length} suggestions from analysis`);
      }

      // 2. 品質メトリクスに基づく改善提案
      if (analysisResults?.qualityMetrics) {
        const qualityBasedSuggestions = this.generateQualityBasedSuggestions(analysisResults.qualityMetrics);
        suggestions.push(...qualityBasedSuggestions);
        logger.debug(`Added ${qualityBasedSuggestions.length} quality-based suggestions`);
      }

      // 3. 最適化結果からの改善提案
      if (optimizationResults?.integratedRecommendations?.prioritizedSuggestions) {
        const prioritizedSuggestions = optimizationResults.integratedRecommendations.prioritizedSuggestions
          .filter((s: any) => s.priority === 'high' || s.priority === 'medium')
          .map((s: any) => s.description);
        
        suggestions.push(...prioritizedSuggestions);
        logger.debug(`Added ${prioritizedSuggestions.length} prioritized suggestions from optimization`);
      }

      // 4. カテゴリ別最適化からの特化提案
      const categoryBasedSuggestions = this.extractCategoryBasedSuggestions(optimizationResults);
      suggestions.push(...categoryBasedSuggestions);
      logger.debug(`Added ${categoryBasedSuggestions.length} category-based suggestions`);

      // 重複除去と制限
      const uniqueSuggestions = [...new Set(suggestions)];
      const finalSuggestions = uniqueSuggestions.slice(0, 10); // 最大10個

      logger.debug('Next chapter suggestions integration completed', {
        totalBeforeDeduplication: suggestions.length,
        totalAfterDeduplication: uniqueSuggestions.length,
        finalCount: finalSuggestions.length
      });

      return finalSuggestions;
    } catch (error) {
      logger.error('Failed to integrate next chapter suggestions', { error });
      return this.createFallbackSuggestions();
    }
  }

  /**
   * 品質メトリクスに基づく改善提案生成
   * 
   * @private
   * @param qualityMetrics 品質メトリクス
   * @returns 品質ベースの改善提案
   */
  private generateQualityBasedSuggestions(qualityMetrics: any): string[] {
    const suggestions: string[] = [];

    try {
      if (qualityMetrics.engagement < 0.7) {
        suggestions.push('読者の興味を引く要素を追加してください');
        suggestions.push('物語の展開にメリハリをつけてください');
      }

      if (qualityMetrics.characterDepiction < 0.7) {
        suggestions.push('キャラクターの描写をより深く行ってください');
        suggestions.push('キャラクターの感情や動機をより明確に表現してください');
      }

      if (qualityMetrics.consistency < 0.7) {
        suggestions.push('物語の一貫性を保ってください');
        suggestions.push('設定や世界観の矛盾がないか確認してください');
      }

      if (qualityMetrics.readability < 0.7) {
        suggestions.push('文章の読みやすさを向上させてください');
        suggestions.push('文の構造や語彙選択を見直してください');
      }

      if (qualityMetrics.originality < 0.7) {
        suggestions.push('独自性のある表現や展開を心がけてください');
        suggestions.push('予測可能すぎる展開を避けてください');
      }

      return suggestions;
    } catch (error) {
      logger.error('Failed to generate quality-based suggestions', { error });
      return [];
    }
  }

  /**
   * カテゴリ別最適化からの特化提案抽出
   * 
   * @private
   * @param optimizationResults 最適化結果
   * @returns カテゴリベースの改善提案
   */
  private extractCategoryBasedSuggestions(optimizationResults: any): string[] {
    const suggestions: string[] = [];

    if (!optimizationResults) {
      return suggestions;
    }

    try {
      // テーマ最適化からの提案
      if (optimizationResults.themeOptimization?.themeEnhancements) {
        optimizationResults.themeOptimization.themeEnhancements.forEach((enhancement: any) => {
          if (enhancement.suggestion) {
            suggestions.push(enhancement.suggestion);
          }
        });
      }

      // 文体最適化からの提案
      if (optimizationResults.styleOptimization?.styleGuidance) {
        const styleGuidance = optimizationResults.styleOptimization.styleGuidance;
        if (styleGuidance.general) {
          suggestions.push(...styleGuidance.general.slice(0, 2));
        }
      }

      // テンション最適化からの提案
      if (optimizationResults.tensionOptimization?.tensionOptimizationSuggestions) {
        suggestions.push(...optimizationResults.tensionOptimization.tensionOptimizationSuggestions.slice(0, 2));
      }

      return suggestions;
    } catch (error) {
      logger.error('Failed to extract category-based suggestions', { error });
      return [];
    }
  }

  /**
   * フォールバック結果作成
   * 
   * @private
   * @param chapter 章
   * @param processingTime 処理時間
   * @returns フォールバック結果
   */
  private createFallbackResult(chapter: Chapter, processingTime: number): ChapterProcessingResult {
    logger.debug(`Creating fallback result for chapter ${chapter.chapterNumber}`);

    return {
      comprehensiveAnalysis: this.createFallbackAnalysis(chapter.chapterNumber, {} as GenerationContext),
      qualityMetrics: this.createDefaultQualityMetrics(),
      nextChapterSuggestions: this.createFallbackSuggestions(),
      processingTime
    };
  }

  /**
   * フォールバック分析結果作成
   * 
   * @private
   * @param chapterNumber 章番号
   * @param context 生成コンテキスト
   * @returns フォールバック分析結果
   */
  private createFallbackAnalysis(chapterNumber: number, context: GenerationContext): any {
    return {
      chapterAnalysis: {
        characterAppearances: [],
        themeOccurrences: [],
        foreshadowingElements: [],
        detectedIssues: [],
        scenes: [],
        metadata: { title: `第${chapterNumber}章`, summary: '', keywords: [] },
        textStats: { wordCount: 1000, sentenceCount: 20, paragraphCount: 5, averageSentenceLength: 50 }
      },
      themeAnalysis: this.createDefaultThemeAnalysis(),
      styleAnalysis: this.createDefaultStyleAnalysis(),
      expressionPatterns: this.createDefaultExpressionPatterns(),
      characterAnalysis: {
        characterAppearances: [],
        characterPsychologies: [],
        characterGrowth: { updatedCharacters: [], growthSummary: { totalCharactersAnalyzed: 0, charactersWithGrowth: 0, majorGrowthEvents: [] } },
        relationshipDynamics: []
      },
      sceneStructure: {
        typeDistribution: { 'DEVELOPMENT': 1 },
        lengthDistribution: { min: 500, max: 2000, avg: 1000, stdDev: 500 },
        paceVariation: 0.5,
        transitionTypes: { types: {}, smoothness: 0.7 }
      },
      sceneRecommendations: [],
      literaryInspirations: {
        plotTechniques: [],
        characterTechniques: [],
        atmosphereTechniques: []
      },
      readerExperience: {
        interestRetention: 7,
        empathy: 7,
        clarity: 7,
        unexpectedness: 7,
        anticipation: 7,
        overallScore: 7,
        weakPoints: [],
        strengths: ['十分な読者体験の提供']
      },
      qualityMetrics: this.createDefaultQualityMetrics(),
      integratedSuggestions: ['章の分析でエラーが発生しました。基本的な改善を心がけてください。'],
      foreshadowingProcessing: { resolvedForeshadowing: [], generatedCount: 0, totalActive: 0 },
      analysisMetadata: {
        analysisTimestamp: new Date().toISOString(),
        servicesUsed: ['Fallback'],
        processingTime: 0,
        cacheHitRate: 0
      }
    };
  }

  /**
   * デフォルト品質メトリクス作成
   * 
   * @private
   * @returns デフォルト品質メトリクス
   */
  private createDefaultQualityMetrics(): any {
    return {
      readability: 0.75,
      consistency: 0.7,
      engagement: 0.7,
      characterDepiction: 0.7,
      originality: 0.65,
      overall: 0.7,
      coherence: 0.7,
      characterConsistency: 0.7
    };
  }

  /**
   * デフォルトテーマ分析作成
   * 
   * @private
   * @returns デフォルトテーマ分析
   */
  private createDefaultThemeAnalysis(): any {
    return {
      themes: { '成長': 0.7 },
      overallCoherence: 7,
      dominantTheme: '成長',
      themeTensions: {}
    };
  }

  /**
   * デフォルト文体分析作成
   * 
   * @private
   * @returns デフォルト文体分析
   */
  private createDefaultStyleAnalysis(): any {
    return {
      avgSentenceLength: 20,
      sentenceVariety: 0.5,
      vocabularyRichness: 0.5
    };
  }

  /**
   * デフォルト表現パターン作成
   * 
   * @private
   * @returns デフォルト表現パターン
   */
  private createDefaultExpressionPatterns(): any {
    return {
      verbPhrases: [],
      adjectivalExpressions: [],
      dialoguePatterns: [],
      conjunctions: [],
      sentenceStructures: []
    };
  }

  /**
   * フォールバック改善提案作成
   * 
   * @private
   * @returns フォールバック改善提案
   */
  private createFallbackSuggestions(): string[] {
    return [
      'キャラクターの感情描写を深めてください',
      'テーマの一貫性を保ちながら発展させてください',
      '読者の興味を維持するペース配分を心がけてください',
      '場面転換をスムーズに行ってください',
      '対話の自然さを向上させてください'
    ];
  }

  /**
   * パイプラインの健全性チェック
   * 
   * @returns 健全性チェック結果
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      analysisCoordinator: boolean;
      optimizationCoordinator: boolean;
    };
  }> {
    try {
      const analysisHealthy = !!this.analysisCoordinator;
      const optimizationHealthy = !!this.optimizationCoordinator;

      const allHealthy = analysisHealthy && optimizationHealthy;
      const someHealthy = analysisHealthy || optimizationHealthy;

      return {
        status: allHealthy ? 'healthy' : (someHealthy ? 'degraded' : 'unhealthy'),
        details: {
          analysisCoordinator: analysisHealthy,
          optimizationCoordinator: optimizationHealthy
        }
      };
    } catch (error) {
      logger.error('PostGenerationPipeline health check failed', { error });
      return {
        status: 'unhealthy',
        details: {
          analysisCoordinator: false,
          optimizationCoordinator: false
        }
      };
    }
  }
}