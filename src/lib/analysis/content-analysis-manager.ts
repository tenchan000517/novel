/**
 * @fileoverview コンテンツ分析マネージャー（ファサード）
 * @description 
 * ChapterGenerator/ContextGeneratorとの唯一の統合窓口。
 * 既存の分析・最適化サービスを統合し、章生成前後の処理を一元管理します。
 * @path src/lib/analysis/content-analysis-manager.ts
 */

import { logger } from '@/lib/utils/logger';
import { GenerationContext } from '@/types/generation';
import { Chapter } from '@/types/chapters';
import { PreGenerationPipeline, GenerationEnhancements } from '@/lib/analysis/pipelines/pre-generation-pipeline';
import { PostGenerationPipeline, ChapterProcessingResult } from '@/lib/analysis/pipelines/post-generation-pipeline';

// 既存の型定義をインポート
import { 
  NarrativeContext, 
  CharacterRecommendation 
} from '@/lib/characters/core/types';

/**
 * 章生成準備結果
 */
export interface ChapterPreparationResult {
  /** 生成拡張データ */
  enhancements: GenerationEnhancements;
  /** 処理時間 */
  processingTime: number;
  /** 準備成功フラグ */
  success: boolean;
  /** エラーメッセージ（失敗時） */
  error?: string;
}

/**
 * @class ContentAnalysisManager
 * @description コンテンツ分析管理ファサード
 * 
 * ChapterGenerator/ContextGeneratorとanalysisモジュール間の唯一の統合窓口。
 * 以下の責任を持ちます：
 * - 生成前パイプラインの実行と結果変換
 * - 生成後パイプラインの実行と結果変換
 * - エラーハンドリングとフォールバック処理
 * - 結果の型変換とフォーマット
 */
export class ContentAnalysisManager {
  private preGenerationPipeline: PreGenerationPipeline;
  private postGenerationPipeline: PostGenerationPipeline;

  /**
   * コンストラクタ
   * 
   * @param preGenerationPipeline 生成前パイプライン
   * @param postGenerationPipeline 生成後パイプライン
   */
  constructor(
    preGenerationPipeline: PreGenerationPipeline,
    postGenerationPipeline: PostGenerationPipeline
  ) {
    this.preGenerationPipeline = preGenerationPipeline;
    this.postGenerationPipeline = postGenerationPipeline;

    logger.info('ContentAnalysisManager initialized');
  }

  /**
   * 章生成準備
   * 
   * PreGenerationPipelineを実行し、ContextGeneratorで使用する
   * 拡張データを準備します。
   * 
   * @param chapterNumber 章番号
   * @param previousChapterContent 前章の内容（任意）
   * @returns 章生成準備結果
   */
  async prepareChapterGeneration(
    chapterNumber: number,
    previousChapterContent?: string
  ): Promise<ChapterPreparationResult> {
    const startTime = Date.now();

    try {
      logger.info(`Preparing chapter generation for chapter ${chapterNumber}`, {
        hasPreviousContent: !!previousChapterContent,
        previousContentLength: previousChapterContent?.length || 0
      });

      // PreGenerationPipeline.execute() を呼び出し
      const enhancements = await this.preGenerationPipeline.execute(
        chapterNumber,
        previousChapterContent
      );

      const processingTime = Date.now() - startTime;

      logger.info(`Chapter generation preparation completed for chapter ${chapterNumber}`, {
        processingTime,
        suggestionCount: enhancements.improvementSuggestions.length,
        themeEnhancementCount: enhancements.themeEnhancements.length,
        hasStyleGuidance: !!enhancements.styleGuidance,
        hasAlternativeExpressions: !!enhancements.alternativeExpressions,
        hasLiteraryInspirations: !!enhancements.literaryInspirations,
        hasCharacterPsychology: !!enhancements.characterPsychology,
        hasTensionOptimization: !!enhancements.tensionOptimization
      });

      // 結果をChapterPreparationResult型に変換
      return {
        enhancements,
        processingTime,
        success: true
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      logger.error('Chapter generation preparation failed', {
        error: errorMessage,
        chapterNumber,
        processingTime,
        stack: error instanceof Error ? error.stack : undefined
      });

      // エラーハンドリング（パイプライン失敗時のフォールバック）
      return {
        enhancements: this.createFallbackEnhancements(),
        processingTime,
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 生成章処理
   * 
   * PostGenerationPipelineを実行し、章の分析・品質評価・次章準備を行います。
   * 
   * @param chapter 生成された章
   * @param context 生成コンテキスト
   * @returns 章処理結果
   */
  async processGeneratedChapter(
    chapter: Chapter,
    context: GenerationContext
  ): Promise<ChapterProcessingResult> {
    const startTime = Date.now();

    try {
      logger.info(`Processing generated chapter ${chapter.chapterNumber}`, {
        contentLength: chapter.content.length,
        sceneCount: chapter.scenes?.length || 0,
        hasMetadata: !!chapter.metadata
      });

      // PostGenerationPipeline.execute() を呼び出し
      const processingResult = await this.postGenerationPipeline.execute(chapter, context);

      logger.info(`Chapter processing completed for chapter ${chapter.chapterNumber}`, {
        processingTime: processingResult.processingTime,
        qualityScore: processingResult.qualityMetrics?.overall || 0,
        nextChapterSuggestionCount: processingResult.nextChapterSuggestions.length,
        hasComprehensiveAnalysis: !!processingResult.comprehensiveAnalysis
      });

      // 次章用データの保存処理呼び出し
      await this.saveNextChapterData(chapter.chapterNumber, processingResult);

      // 結果をChapterProcessingResult型に変換（既に適切な型）
      return processingResult;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      logger.error('Chapter processing failed', {
        error: errorMessage,
        chapterNumber: chapter.chapterNumber,
        processingTime,
        stack: error instanceof Error ? error.stack : undefined
      });

      // フォールバック処理結果を返す
      return this.createFallbackProcessingResult(chapter, processingTime, errorMessage);
    }
  }

  /**
   * キャラクター推奨取得
   * 
   * 指定された章番号と物語コンテキストに基づいて、
   * 登場させるべきキャラクターを推奨します。
   * 
   * @param chapterNumber 章番号
   * @param narrativeContext 物語コンテキスト
   * @param maxCharacters 最大キャラクター数
   * @returns キャラクター推奨結果
   */
  async getCharacterRecommendations(
    chapterNumber: number,
    narrativeContext: NarrativeContext,
    maxCharacters: number
  ): Promise<{
    mainCharacters: CharacterRecommendation[];
    supportingCharacters: CharacterRecommendation[];
  }> {
    try {
      logger.info(`Getting character recommendations for chapter ${chapterNumber}`, {
        maxCharacters,
        pacing: narrativeContext.pacing,
        arc: narrativeContext.arc,
        theme: narrativeContext.theme
      });

      // 実際の実装では、キャラクター管理システムに委譲
      // 現在はフォールバック実装を提供
      const recommendations = await this.generateCharacterRecommendations(
        chapterNumber,
        narrativeContext,
        maxCharacters
      );

      logger.info(`Character recommendations generated for chapter ${chapterNumber}`, {
        mainCharacterCount: recommendations.mainCharacters.length,
        supportingCharacterCount: recommendations.supportingCharacters.length
      });

      return recommendations;
    } catch (error) {
      logger.error('Failed to get character recommendations', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber,
        maxCharacters
      });

      // フォールバック: 基本的な推奨を返す
      return {
        mainCharacters: [
          {
            id: 'main-protagonist',
            name: 'Protagonist',
            reason: 'Story protagonist'
          }
        ],
        supportingCharacters: [
          {
            id: 'supporting-1',
            name: 'Supporting Character', 
            reason: 'Supporting role'
          }
        ]
      };
    }
  }

  /**
   * キャラクター推奨生成
   * 
   * @private
   * @param chapterNumber 章番号
   * @param narrativeContext 物語コンテキスト
   * @param maxCharacters 最大キャラクター数
   * @returns 推奨結果
   */
  private async generateCharacterRecommendations(
    chapterNumber: number,
    narrativeContext: NarrativeContext,
    maxCharacters: number
  ): Promise<{
    mainCharacters: CharacterRecommendation[];
    supportingCharacters: CharacterRecommendation[];
  }> {
    // 章番号に基づく基本的な推奨ロジック
    const mainCount = Math.min(3, Math.ceil(maxCharacters * 0.4));
    const supportingCount = Math.min(5, maxCharacters - mainCount);

    const mainCharacters: CharacterRecommendation[] = [];
    const supportingCharacters: CharacterRecommendation[] = [];

    // メインキャラクターの生成
    for (let i = 0; i < mainCount; i++) {
      mainCharacters.push({
        id: `main-char-${i + 1}`,
        name: `Main Character ${i + 1}`,
        reason: `Important for ${narrativeContext.theme} theme development`,
      });
    }

    // サポートキャラクターの生成
    for (let i = 0; i < supportingCount; i++) {
      supportingCharacters.push({
        id: `support-char-${i + 1}`,
        name: `Supporting Character ${i + 1}`,
        reason: `Supports ${narrativeContext.arc} arc`,
      });
    }

    return {
      mainCharacters,
      supportingCharacters
    };
  }

  /**
   * 次章用データの保存処理
   * 
   * @private
   * @param chapterNumber 章番号
   * @param processingResult 処理結果
   */
  private async saveNextChapterData(
    chapterNumber: number,
    processingResult: ChapterProcessingResult
  ): Promise<void> {
    try {
      // 次章用の改善提案データを保存
      // 実際の保存処理は既存のストレージシステムに委譲
      logger.debug(`Saving next chapter data for chapter ${chapterNumber + 1}`, {
        suggestionCount: processingResult.nextChapterSuggestions.length
      });
      
      // 注意: 実際の保存処理は既存のストレージサービスを使用
      // 例: await this.storageService.saveNextChapterSuggestions(chapterNumber + 1, processingResult.nextChapterSuggestions);
      
    } catch (error) {
      logger.warn('Failed to save next chapter data', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });
      // 保存失敗は処理全体を止めない
    }
  }

  /**
   * フォールバック拡張データ作成
   * 
   * @private
   * @returns フォールバック拡張データ
   */
  private createFallbackEnhancements(): GenerationEnhancements {
    logger.debug('Creating fallback enhancements');

    return {
      improvementSuggestions: [
        'キャラクターの感情描写を深めてください',
        'テーマの一貫性を保ちながら発展させてください',
        '読者の興味を維持するペース配分を心がけてください'
      ],
      themeEnhancements: [],
      styleGuidance: {
        general: [
          '自然で読みやすい文体を心がけてください',
          '文章のリズムに変化をつけてください'
        ],
        sentenceStructure: [
          '文の長さに変化をつけてください'
        ],
        vocabulary: [
          '適切な語彙を選択してください'
        ],
        rhythm: [
          '読みやすいリズムを意識してください'
        ]
      },
      alternativeExpressions: {},
      literaryInspirations: {
        plotTechniques: [
          {
            technique: '対比構造',
            description: '対照的な場面や状況を並置して強調する',
            example: '平和な日常の直後に緊迫した場面を配置',
            reference: '古典文学技法'
          }
        ],
        characterTechniques: [
          {
            technique: '行動による性格描写',
            description: '行動や選択を通じて性格を示す',
            example: '危機的状況での判断を通じて本質を描く',
            reference: 'キャラクター小説技法'
          }
        ],
        atmosphereTechniques: [
          {
            technique: '感情移入的環境描写',
            description: 'キャラクターの感情を環境に反映',
            example: '不安な心理を曇り空や風の音で表現',
            reference: 'ゴシック文学技法'
          }
        ]
      }
    };
  }

  /**
   * フォールバック処理結果作成
   * 
   * @private
   * @param chapter 章
   * @param processingTime 処理時間
   * @param errorMessage エラーメッセージ
   * @returns フォールバック処理結果
   */
  private createFallbackProcessingResult(
    chapter: Chapter,
    processingTime: number,
    errorMessage: string
  ): ChapterProcessingResult {
    logger.debug(`Creating fallback processing result for chapter ${chapter.chapterNumber}`);

    return {
      comprehensiveAnalysis: {
        chapterAnalysis: {
          characterAppearances: [],
          themeOccurrences: [],
          foreshadowingElements: [],
          detectedIssues: [],
          scenes: chapter.scenes || [],
          metadata: { 
            title: chapter.title || `第${chapter.chapterNumber}章`, 
            summary: '', 
            keywords: [] 
          },
          textStats: {
            wordCount: chapter.content.length,
            sentenceCount: Math.ceil(chapter.content.length / 50),
            paragraphCount: Math.ceil(chapter.content.length / 200),
            averageSentenceLength: 50
          }
        },
        qualityMetrics: {
          readability: 0.7,
          consistency: 0.7,
          engagement: 0.7,
          characterDepiction: 0.7,
          originality: 0.7,
          overall: 0.7,
          coherence: 0.7,
          characterConsistency: 0.7
        },
        analysisMetadata: {
          analysisTimestamp: new Date().toISOString(),
          servicesUsed: ['Fallback'],
          processingTime,
          cacheHitRate: 0
        }
      },
      qualityMetrics: {
        readability: 0.7,
        consistency: 0.7,
        engagement: 0.7,
        characterDepiction: 0.7,
        originality: 0.7,
        overall: 0.7,
        coherence: 0.7,
        characterConsistency: 0.7
      },
      nextChapterSuggestions: [
        'エラーが発生しました。基本的な章構成を心がけてください。',
        'キャラクターの一貫性を保ってください。',
        'テーマの発展を意識してください。'
      ],
      processingTime
    };
  }

  /**
   * サービスの健全性チェック
   * 
   * @returns 健全性チェック結果
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      preGenerationPipeline: boolean;
      postGenerationPipeline: boolean;
    };
  }> {
    try {
      const [preHealth, postHealth] = await Promise.all([
        this.preGenerationPipeline.healthCheck(),
        this.postGenerationPipeline.healthCheck()
      ]);

      const preHealthy = preHealth.status === 'healthy';
      const postHealthy = postHealth.status === 'healthy';
      const allHealthy = preHealthy && postHealthy;
      const someHealthy = preHealthy || postHealthy;

      return {
        status: allHealthy ? 'healthy' : (someHealthy ? 'degraded' : 'unhealthy'),
        details: {
          preGenerationPipeline: preHealthy,
          postGenerationPipeline: postHealthy
        }
      };
    } catch (error) {
      logger.error('ContentAnalysisManager health check failed', { error });
      return {
        status: 'unhealthy',
        details: {
          preGenerationPipeline: false,
          postGenerationPipeline: false
        }
      };
    }
  }
}

// シングルトンインスタンスをエクスポート
export const contentAnalysisManager = new ContentAnalysisManager(
  // 実際の実装では適切なパイプラインインスタンスを渡す
  {} as PreGenerationPipeline,
  {} as PostGenerationPipeline
);