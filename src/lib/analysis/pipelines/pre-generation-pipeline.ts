/**
 * @fileoverview 生成前パイプライン
 * @description 章生成前の分析→最適化→コンテキスト拡張データ生成フロー
 * @path src/lib/analysis/pipeline/pre-generation-pipeline.ts
 */

import { logger } from '@/lib/utils/logger';
import {
  GenerationContext,
  ThemeEnhancement,
  StyleGuidance,
  LiteraryInspiration,
  LiteraryTechnique
} from '@/types/generation';
import { AnalysisCoordinator } from '@/lib/analysis/coordinators/analysis-coordinator';
import { OptimizationCoordinator } from '@/lib/analysis/coordinators/optimization-coordinator';
import {
  SymbolicElement,
  ForeshadowingOpportunity
} from '@/lib/analysis/core/types';

/**
 * 生成前拡張データ（ContextGeneratorのoptionsに渡される）
 */
export interface GenerationEnhancements {
  improvementSuggestions: string[];

  // 🔧 NEW: LiteraryComparisonSystemからの機能
  literaryInspirations?: LiteraryInspiration; // AI選択による定型文ガイドライン

  themeEnhancements: ThemeEnhancement[];
  styleGuidance?: StyleGuidance;
  alternativeExpressions?: any;
  characterPsychology?: { [id: string]: any };
  tensionOptimization?: any;

  foreshadowingOpportunities?: ForeshadowingOpportunity[]; // 伏線機会
  symbolicElements?: SymbolicElement[]; // 象徴要素
  literaryTechniques?: LiteraryTechnique[]; // 文学的技法

}

/**
 * @class PreGenerationPipeline
 * @description 生成前の分析→最適化→コンテキスト拡張データ生成フロー
 * 
 * ChapterGeneratorの以下の処理をパイプライン化：
 * 1. 前章の改善提案取得
 * 2. テーマ強化取得
 * 3. ContextGeneratorのoptionsに統合
 */
export class PreGenerationPipeline {
  constructor(
    private analysisCoordinator: AnalysisCoordinator,
    private optimizationCoordinator: OptimizationCoordinator
  ) {
    logger.info('PreGenerationPipeline initialized');
  }

  /**
   * 生成前パイプライン実行
   * 
   * @param chapterNumber 章番号
   * @param previousContent 前章コンテンツ
   * @returns 生成拡張データ
   */
  async execute(chapterNumber: number, previousContent?: string): Promise<GenerationEnhancements> {
    try {
      logger.info(`Starting pre-generation pipeline for chapter ${chapterNumber}`);
      const startTime = Date.now();

      // 前章がない場合は基本的な拡張データのみ返す
      if (chapterNumber <= 1 || !previousContent) {
        logger.info('First chapter or no previous content, returning basic enhancements');
        return this.createBasicEnhancements();
      }

      // 1. 前章コンテンツの包括的分析（AnalysisCoordinator使用）
      const analysisResults = await this.executeAnalysis(previousContent, chapterNumber - 1);

      // 2. 分析結果に基づく最適化提案の生成（OptimizationCoordinator使用）
      const optimizationResults = await this.executeOptimization(
        previousContent,
        chapterNumber - 1,
        analysisResults
      );

      // 3. 結果統合：GenerationEnhancements型に変換
      const enhancements = this.integrateResults(analysisResults, optimizationResults);

      const processingTime = Date.now() - startTime;
      logger.info(`Pre-generation pipeline completed for chapter ${chapterNumber}`, {
        processingTime,
        hasAnalysis: !!analysisResults,
        hasOptimization: !!optimizationResults,
        suggestionCount: enhancements.improvementSuggestions.length,
        themeEnhancementCount: enhancements.themeEnhancements.length
      });

      return enhancements;
    } catch (error) {
      logger.error('Pre-generation pipeline failed', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });

      // フォールバック: 基本的な拡張データを返す
      return this.createBasicEnhancements();
    }
  }

  /**
   * 前章コンテンツの分析実行
   * 
   * @private
   * @param content 前章コンテンツ
   * @param chapterNumber 前章番号
   * @returns 分析結果
   */
  private async executeAnalysis(content: string, chapterNumber: number): Promise<any> {
    try {
      logger.debug(`Executing analysis for previous chapter ${chapterNumber}`);

      // 最小限のコンテキストで分析実行
      const minimalContext: Partial<GenerationContext> = {
        chapterNumber: chapterNumber,
        characters: [],
        tension: 0.5,
        pacing: 0.5
      };

      const analysisResults = await this.analysisCoordinator.analyzeChapter(
        content,
        chapterNumber,
        minimalContext as GenerationContext
      );

      logger.debug(`Analysis completed for chapter ${chapterNumber}`, {
        hasQualityMetrics: !!analysisResults.qualityMetrics,
        hasThemeAnalysis: !!analysisResults.themeAnalysis,
        suggestionCount: analysisResults.integratedSuggestions?.length || 0
      });

      return analysisResults;
    } catch (error) {
      logger.warn('Analysis execution failed in pre-generation pipeline', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });
      return null;
    }
  }

  /**
   * 最適化提案の生成実行
   * 
   * @private
   * @param content 前章コンテンツ
   * @param chapterNumber 前章番号
   * @param analysisResults 分析結果
   * @returns 最適化結果
   */
  private async executeOptimization(
    content: string,
    chapterNumber: number,
    analysisResults: any
  ): Promise<any> {
    if (!analysisResults) {
      logger.debug('No analysis results, skipping optimization');
      return null;
    }

    try {
      logger.debug(`Executing optimization for previous chapter ${chapterNumber}`);

      // 最小限のコンテキスト
      const minimalContext: Partial<GenerationContext> = {
        chapterNumber: chapterNumber,
        characters: [],
        tension: 0.5,
        pacing: 0.5,
        genre: 'general'
      };

      // OptimizationCoordinatorの入力形式に変換
      const optimizationInput = {
        themeAnalysis: analysisResults.themeAnalysis || { themes: {}, overallCoherence: 0.7, dominantTheme: '成長' },
        styleAnalysis: analysisResults.styleAnalysis || { avgSentenceLength: 20, sentenceVariety: 0.5, vocabularyRichness: 0.5 },
        expressionPatterns: analysisResults.expressionPatterns || { verbPhrases: [], adjectivalExpressions: [], dialoguePatterns: [], conjunctions: [], sentenceStructures: [] },
        qualityMetrics: analysisResults.qualityMetrics || { overall: 0.7, readability: 0.7, consistency: 0.7, engagement: 0.7, characterDepiction: 0.7, originality: 0.7 },
        characters: [],
        characterPsychologies: {}
      };

      const optimizationResults = await this.optimizationCoordinator.optimizeChapter(
        content,
        chapterNumber,
        minimalContext as GenerationContext,
        optimizationInput
      );

      logger.debug(`Optimization completed for chapter ${chapterNumber}`, {
        hasThemeOptimization: !!optimizationResults.themeOptimization,
        hasStyleOptimization: !!optimizationResults.styleOptimization,
        hasCharacterOptimization: !!optimizationResults.characterOptimization,
        hasTensionOptimization: !!optimizationResults.tensionOptimization
      });

      return optimizationResults;
    } catch (error) {
      logger.warn('Optimization execution failed in pre-generation pipeline', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });
      return null;
    }
  }

  /**
   * 分析・最適化結果をGenerationEnhancementsに統合
   * 
   * @private
   * @param analysisResults 分析結果
   * @param optimizationResults 最適化結果
   * @returns 統合された拡張データ
   */
  private integrateResults(analysisResults: any, optimizationResults: any): GenerationEnhancements {
    const enhancements: GenerationEnhancements = {
      improvementSuggestions: [],
      themeEnhancements: [],
    };

    // 1. 分析結果からの改善提案統合
    if (analysisResults?.integratedSuggestions) {
      enhancements.improvementSuggestions.push(...analysisResults.integratedSuggestions);
    }

    // 2. 🔧 NEW: LiteraryComparisonSystemからの文学的インスピレーション
    if (analysisResults?.literaryInspirations) {
      enhancements.literaryInspirations = analysisResults.literaryInspirations;
      logger.debug('Added literary inspirations from NEW LiteraryComparisonSystem');
    }

    // 3. 最適化結果からの各種提案統合
    if (optimizationResults) {
      // 🔧 EXISTING: ThemeEnhancementServiceからのテーマ強化
      if (optimizationResults.themeOptimization?.themeEnhancements) {
        enhancements.themeEnhancements = optimizationResults.themeOptimization.themeEnhancements;
        logger.debug(`Added ${enhancements.themeEnhancements.length} theme enhancements from ThemeEnhancementService`);
      }

      // 🔧 EXISTING: ThemeEnhancementServiceからの追加機能
      if (optimizationResults.themeOptimization?.literaryTechniques) {
        enhancements.literaryTechniques = optimizationResults.themeOptimization.literaryTechniques;
        logger.debug('Added literary techniques from ThemeEnhancementService');
      }

      if (optimizationResults.themeOptimization?.symbolicElements) {
        enhancements.symbolicElements = optimizationResults.themeOptimization.symbolicElements;
        logger.debug('Added symbolic elements from ThemeEnhancementService');
      }

      if (optimizationResults.themeOptimization?.foreshadowingOpportunities) {
        enhancements.foreshadowingOpportunities = optimizationResults.themeOptimization.foreshadowingOpportunities;
        logger.debug('Added foreshadowing opportunities from ThemeEnhancementService');
      }

      // 文体ガイダンスの統合
      if (optimizationResults.styleOptimization?.styleGuidance) {
        enhancements.styleGuidance = optimizationResults.styleOptimization.styleGuidance;
      }

      // 表現代替案の統合
      if (optimizationResults.styleOptimization?.expressionAlternatives) {
        enhancements.alternativeExpressions = optimizationResults.styleOptimization.expressionAlternatives;
      }

      // キャラクター心理学の統合
      if (optimizationResults.characterOptimization?.characterDepthPrompts) {
        enhancements.characterPsychology = optimizationResults.characterOptimization.characterDepthPrompts;
      }

      // テンション最適化の統合
      if (optimizationResults.tensionOptimization?.tensionPacingRecommendation) {
        enhancements.tensionOptimization = optimizationResults.tensionOptimization.tensionPacingRecommendation;
      }
    }

    // 🔧 重要: 両システムからのデータが適切に統合されているかログ出力
    logger.info('Results integration completed with both systems', {
      hasNewLiteraryInspirations: !!enhancements.literaryInspirations,
      hasThemeEnhancements: !!enhancements.themeEnhancements,
      hasLiteraryTechniques: !!enhancements.literaryTechniques,
      hasSymbolicElements: !!enhancements.symbolicElements,
      hasForeshadowingOpportunities: !!enhancements.foreshadowingOpportunities
    });

    // 重複する改善提案の除去
    enhancements.improvementSuggestions = [...new Set(enhancements.improvementSuggestions)];

    return enhancements;
  }

  /**
   * 基本的な拡張データを作成（フォールバック用）
   * 
   * @private
   * @returns 基本的な拡張データ
   */
  private createBasicEnhancements(): GenerationEnhancements {
    logger.debug('Creating basic enhancements (fallback)');

    return {
      improvementSuggestions: [
        'キャラクターの感情を深く描写してください',
        '読者の興味を引く展開を心がけてください',
        'テーマの一貫性を保ちながら発展させてください'
      ],
      themeEnhancements: [],
      styleGuidance: {
        general: [
          '自然で読みやすい文体を心がけてください',
          '文章のリズムに変化をつけてください'
        ],
        sentenceStructure: [
          '文の長さに変化をつけてください',
          '単調な構造を避けてください'
        ],
        vocabulary: [
          '適切な語彙を選択してください',
          '表現の多様性を意識してください'
        ],
        rhythm: [
          '読みやすいリズムを意識してください',
          'テンポの緩急をつけてください'
        ]
      },
      alternativeExpressions: {},
      literaryInspirations: {
        plotTechniques: [
          {
            technique: '対比構造',
            description: '対照的な場面や状況を並置して、両方の特性を強調する',
            example: '平和な日常の描写の直後に緊迫した場面を配置する',
            reference: '古典文学からモダン作品まで広く使用される技法'
          }
        ],
        characterTechniques: [
          {
            technique: '行動による性格描写',
            description: 'キャラクターの内面を直接説明せず、行動や選択を通じて性格を示す',
            example: '危機的状況での判断や反応を通じてキャラクターの本質を描く',
            reference: '優れたキャラクター小説'
          }
        ],
        atmosphereTechniques: [
          {
            technique: '感情移入的環境描写',
            description: 'キャラクターの感情状態を反映した環境描写',
            example: '主人公の不安な心理状態を、曇り空や不気味な風の音で間接的に表現する',
            reference: 'ゴシック文学など'
          }
        ]
      }
    };
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
      logger.error('PreGenerationPipeline health check failed', { error });
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