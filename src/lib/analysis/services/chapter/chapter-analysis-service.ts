/**
 * @fileoverview 章分析サービス実装
 * @description
 * 章の構造、内容、パターンの詳細分析を担当するサービス。
 * 単一の章に対する基本的な分析を行い、詳細な分析は専門サービスに委譲します。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiAdapter } from '@/lib/analysis/adapters/gemini-adapter';
import { JsonParser } from '@/lib/utils/json-parser';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { parseYaml } from '@/lib/utils/yaml-helper';
import { IChapterAnalysisService } from '@/lib/analysis/services/chapter/interfaces';

import {
  GenerationContext,
  ChapterAnalysis,
  CharacterAppearance,
  ThemeOccurrence,
  ForeshadowingElement,
  QualityMetrics,
  Scene
} from '@/types/generation';
import { AnalysisFormatter } from '@/lib/analysis/utils/analysis-formatter';

/**
 * @class ChapterAnalysisService
 * @description 章の構造、内容、パターンの詳細分析を担当するサービス
 * 
 * @implements IChapterAnalysisService
 * 
 * @role
 * - 章の構造（シーン、ストーリーフロー）分析
 * - キャラクターの登場と重要度分析
 * - テーマと伏線の検出
 * - 品質メトリクス計算
 */
export class ChapterAnalysisService implements IChapterAnalysisService {
  /** 分析結果キャッシュストア */
  private cacheStore: Map<string, ChapterAnalysis> = new Map();

  /**
   * コンストラクタ
   * 
   * 依存関係の注入を通じて、必要なサービスを受け取ります。
   * 
   * @param {GeminiAdapter} geminiAdapter AI生成・分析用アダプター
   */
  constructor(private geminiAdapter: GeminiAdapter) {
    logger.info('ChapterAnalysisService initialized');
  }

  /**
   * 章の内容を総合的に分析
   * 
   * キャラクター登場、テーマ出現、伏線要素、品質メトリクスなどを
   * 包括的に分析します。結果はキャッシュされます。
   * 
   * @param {string} content 章の内容
   * @param {number} chapterNumber 章番号
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {Promise<ChapterAnalysis>} 総合的な章分析結果
   */
  async analyzeChapter(
    content: string,
    chapterNumber: number,
    context: GenerationContext
  ): Promise<ChapterAnalysis> {
    // キャッシュをチェック
    const cacheKey = `chapter-${chapterNumber}-${content.length}`;
    if (this.cacheStore.has(cacheKey)) {
      logger.debug(`Using cached analysis for chapter ${chapterNumber}`);
      return this.cacheStore.get(cacheKey)!;
    }

    try {
      logger.info(`Analyzing chapter ${chapterNumber}`);

      // 章のパース（メタデータと本文の分離）
      const { parsedContent, metadata } = this.parseChapterContent(content, chapterNumber);

      // 基本分析を実行（キャラクター、テーマ、伏線、品質）
      const baseAnalysis = await this.performBaseAnalysis(parsedContent, chapterNumber, context);

      // シーン抽出
      const scenes = await this.extractScenes(parsedContent, chapterNumber);

      // テキスト統計情報取得
      const textStats = this.analyzeTextStatistics(parsedContent);

      // キーワード抽出
      const keywords = await this.extractKeywords(parsedContent);

      // 分析結果の構築
      const analysis: ChapterAnalysis = {
        ...baseAnalysis,
        scenes,
        metadata: {
          ...metadata,
          keywords
        },
        textStats
      };

      // キャッシュに保存
      this.cacheStore.set(cacheKey, analysis);
      logger.info(`Chapter ${chapterNumber} analysis completed successfully`, {
        scenesCount: scenes.length,
        charactersCount: baseAnalysis.characterAppearances?.length || 0,
        themesCount: baseAnalysis.themeOccurrences?.length || 0
      });

      return analysis;
    } catch (error) {
      logger.error(`Chapter analysis failed for chapter ${chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });

      // 分析に失敗した場合はフォールバック分析結果を返す
      return this.createFallbackAnalysis(chapterNumber, context);
    }
  }

  /**
   * 章の品質メトリクスを取得
   * 
   * 章の各品質メトリクス（読みやすさ、一貫性など）を取得します。
   * フル分析なしで品質のみが必要な場合に使用します。
   * 
   * @param {string} content 章の内容
   * @param {number} chapterNumber 章番号
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {Promise<QualityMetrics>} 品質メトリクス
   */
  async getQualityMetrics(
    content: string,
    chapterNumber: number,
    context: GenerationContext
  ): Promise<QualityMetrics> {
    // 既存の分析キャッシュをチェック
    const cacheKey = `chapter-${chapterNumber}-${content.length}`;
    if (this.cacheStore.has(cacheKey)) {
      const analysis = this.cacheStore.get(cacheKey)!;
      if (analysis.qualityMetrics) {
        logger.debug(`Using cached quality metrics for chapter ${chapterNumber}`);
        return analysis.qualityMetrics;
      }
    }

    // 簡易分析のプロンプト
    const qualityPrompt = `
以下の小説の章を読んで、品質メトリクスを評価してください：

${content.substring(0, 8000)}

以下のメトリクスを0〜1の範囲で評価し、JSON形式で出力してください：
- readability: 読みやすさ（文章の明瞭さ、流れのスムーズさ）
- consistency: 整合性（設定や描写の一貫性）
- engagement: 引き込み度（読者の関心を引きつける度合い）
- characterDepiction: キャラクター描写の質
- originality: オリジナリティ、独自性
- coherence: 物語の一貫性
- characterConsistency: キャラクターの一貫性

JSON形式:
{
  "readability": 0.7,
  "consistency": 0.8,
  "engagement": 0.75,
  "characterDepiction": 0.8,
  "originality": 0.65,
  "coherence": 0.75,
  "characterConsistency": 0.8,
  "overall": 0.75
}`;

    try {
      logger.info(`Analyzing quality metrics for chapter ${chapterNumber}`);

      // APIスロットリングを使用して品質分析を実行
      const qualityResponse = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(qualityPrompt, {
          temperature: 0.1,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );

      // レスポンスの解析
      const parsedQuality = JsonParser.parseFromAIResponse<QualityMetrics>(
        qualityResponse,
        this.createFallbackQualityMetrics()
      );

      // 結果の検証とフォーマット
      const formattedMetrics = this.formatQualityMetrics(parsedQuality);

      logger.debug(`Quality metrics analysis completed for chapter ${chapterNumber}`, {
        overall: formattedMetrics.overall,
        readability: formattedMetrics.readability
      });

      return formattedMetrics;
    } catch (error) {
      logger.warn(`Quality metrics analysis failed for chapter ${chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return this.createFallbackQualityMetrics();
    }
  }

  /**
   * 章のシーン情報のみを取得
   * 
   * 章の内容からシーン分割のみを行います。
   * 
   * @param {string} content 章の内容
   * @param {number} chapterNumber 章番号
   * @returns {Promise<Scene[]>} シーン情報
   */
  async getScenes(content: string, chapterNumber: number): Promise<Scene[]> {
    // 既存の分析キャッシュをチェック
    const cacheKey = `chapter-${chapterNumber}-${content.length}`;
    if (this.cacheStore.has(cacheKey)) {
      const analysis = this.cacheStore.get(cacheKey)!;
      if (analysis.scenes && analysis.scenes.length > 0) {
        logger.debug(`Using cached scenes for chapter ${chapterNumber}`);
        return analysis.scenes;
      }
    }

    // シーン抽出を実行
    return this.extractScenes(content, chapterNumber);
  }

  /**
   * 章のキャラクター登場情報を取得
   * 
   * 章に登場するキャラクターとその重要度情報を取得します。
   * 
   * @param {string} content 章の内容
   * @param {number} chapterNumber 章番号
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {Promise<CharacterAppearance[]>} キャラクター登場情報
   */
  async getCharacterAppearances(
    content: string,
    chapterNumber: number,
    context: GenerationContext
  ): Promise<CharacterAppearance[]> {
    // 既存の分析キャッシュをチェック
    const cacheKey = `chapter-${chapterNumber}-${content.length}`;
    if (this.cacheStore.has(cacheKey)) {
      const analysis = this.cacheStore.get(cacheKey)!;
      if (analysis.characterAppearances && analysis.characterAppearances.length > 0) {
        logger.debug(`Using cached character appearances for chapter ${chapterNumber}`);
        return analysis.characterAppearances;
      }
    }

    // キャラクター分析のプロンプト
    const characterPrompt = `
以下の小説の章に登場するキャラクターとその重要度を分析してください：

${content.substring(0, 8000)}

各キャラクターについて以下の情報を含めてJSONで出力してください：
- characterName: キャラクター名
- dialogueCount: 対話の回数（概算）
- significance: 重要度（0〜1の値）
- actions: 主な行動（配列形式）
- emotions: 表現された感情（配列形式）

JSON形式:
[
  {
    "characterName": "キャラクター名",
    "dialogueCount": 10,
    "significance": 0.8,
    "actions": ["行動1", "行動2"],
    "emotions": ["感情1", "感情2"]
  }
]`;

    try {
      logger.info(`Analyzing character appearances for chapter ${chapterNumber}`);

      // APIスロットリングを使用してキャラクター分析を実行
      const characterResponse = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(characterPrompt, {
          temperature: 0.2,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );

      // レスポンスの解析
      const parsedCharacters = JsonParser.parseFromAIResponse<any[]>(
        characterResponse,
        []
      );

      // 結果のフォーマット
      const formattedCharacters = this.formatCharacterAppearances(parsedCharacters, context);

      logger.debug(`Character appearances analysis completed for chapter ${chapterNumber}`, {
        characterCount: formattedCharacters.length
      });

      return formattedCharacters;
    } catch (error) {
      logger.warn(`Character appearances analysis failed for chapter ${chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return this.createFallbackCharacterAppearances(context);
    }
  }

  /**
   * 章のキーワードを抽出
   * 
   * 章の内容から重要なキーワードを抽出します。
   * 
   * @param {string} content 章の内容
   * @returns {Promise<string[]>} キーワード配列
   */
  async extractKeywords(content: string): Promise<string[]> {
    const keywordPrompt = `
以下の小説の章から重要なキーワードを抽出してください：

${content.substring(0, 8000)}

以下のカテゴリに分類して、JSONで出力してください：
- characters: 登場人物の名前
- locations: 場所
- objects: 重要なオブジェクト
- concepts: 重要な概念
- events: 重要なイベント

JSON形式:
{
  "characters": ["名前1", "名前2"],
  "locations": ["場所1", "場所2"],
  "objects": ["オブジェクト1", "オブジェクト2"],
  "concepts": ["概念1", "概念2"],
  "events": ["イベント1", "イベント2"]
}`;

    try {
      logger.info(`Extracting keywords from content`);

      // APIスロットリングを使用してキーワード抽出を実行
      const keywordResponse = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(keywordPrompt, {
          temperature: 0.2,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );

      // レスポンスの解析
      const parsedKeywords = JsonParser.parseFromAIResponse<{
        characters: string[];
        locations: string[];
        objects: string[];
        concepts: string[];
        events: string[];
      }>(keywordResponse, {
        characters: [],
        locations: [],
        objects: [],
        concepts: [],
        events: []
      });

      // すべてのカテゴリを結合
      const allKeywords = [
        ...(parsedKeywords.characters || []),
        ...(parsedKeywords.locations || []),
        ...(parsedKeywords.objects || []),
        ...(parsedKeywords.concepts || []),
        ...(parsedKeywords.events || [])
      ];

      // 重複を除去
      const uniqueKeywords = [...new Set(allKeywords)];

      logger.debug(`Keyword extraction completed`, {
        keywordCount: uniqueKeywords.length,
        categories: {
          characters: parsedKeywords.characters?.length || 0,
          locations: parsedKeywords.locations?.length || 0,
          objects: parsedKeywords.objects?.length || 0,
          concepts: parsedKeywords.concepts?.length || 0,
          events: parsedKeywords.events?.length || 0
        }
      });

      return uniqueKeywords;
    } catch (error) {
      logger.warn(`Keyword extraction failed`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
 * 品質メトリクスからの改善提案生成
 * 
 * 品質メトリクス分析結果に基づいて、改善提案を生成します。
 * 
 * @param {QualityMetrics} metrics 品質メトリクス
 * @returns {string[]} 改善提案の配列
 */
  generateQualityMetricsImprovements(metrics: QualityMetrics): string[] {
    const suggestions: string[] = [];

    // 各メトリクスのしきい値を0.6とする
    if (metrics.readability < 0.6) {
      suggestions.push("読みやすさを向上させるために、より明確で簡潔な文章を心がけてください");
    }

    if (metrics.consistency < 0.6) {
      suggestions.push("物語の一貫性を高めるために、設定やキャラクターの行動に矛盾がないか確認してください");
    }

    if (metrics.engagement < 0.6) {
      suggestions.push("読者の興味を引きつけるために、より魅力的な対立や未解決の問題を導入してください");
    }

    if (metrics.characterDepiction < 0.6) {
      suggestions.push("キャラクターの描写をより立体的にし、内面と外面の両方から掘り下げてください");
    }

    if (metrics.originality < 0.6) {
      suggestions.push("物語にオリジナリティを加えるために、予想外の展開や独自の視点を取り入れてください");
    }

    logger.debug(`Generated ${suggestions.length} quality metrics improvement suggestions`);
    return suggestions;
  }

  /**
    * 総合的な改善提案の生成
    * 
    * 章分析結果に基づいて、次章のための総合的な改善提案を生成します。
    * AnalysisCoordinatorとの統合に備えて簡素化されています。
    * 
    * @param {ChapterAnalysis} analysis 章分析結果
    * @param {number} chapterNumber 章番号
    * @param {GenerationContext} context 生成コンテキスト
    * @returns {Promise<string[]>} 改善提案の配列
    */
  async generateImprovementSuggestions(
    analysis: ChapterAnalysis,
    chapterNumber: number,
    context: GenerationContext
  ): Promise<string[]> {
    try {
      const suggestions: string[] = [];

      // 1. 品質メトリクスからの改善提案
      const qualityImprovements = this.generateQualityMetricsImprovements(analysis.qualityMetrics);
      suggestions.push(...qualityImprovements);

      // 2. テーマからの改善提案
      if (analysis.themeEnhancements) {
        const themeImprovements = analysis.themeEnhancements.map(enhancement =>
          enhancement.suggestion
        );
        suggestions.push(...themeImprovements);
      }

      // 3. 基本的な構造改善提案
      if (analysis.scenes && analysis.scenes.length < 2) {
        suggestions.push("章の構造を改善し、より明確なシーン分割を行ってください");
      }

      if (analysis.characterAppearances && analysis.characterAppearances.length < 2) {
        suggestions.push("より多くのキャラクターを登場させ、相互作用を増やしてください");
      }

      // 重複の排除と優先順位付け
      const uniqueSuggestions = [...new Set(suggestions)];

      // 最大8個に制限
      return uniqueSuggestions.slice(0, 8);
    } catch (error) {
      logger.error('Failed to generate improvement suggestions', {
        error: error instanceof Error ? error.message : String(error)
      });

      // 最低限の改善提案を返す
      return [
        "キャラクターの感情と内面描写をより深く掘り下げてください",
        "テーマを物語全体に一貫して織り込んでください",
        "読者の興味を維持するために、適度な緊張感とペースの変化を持たせてください"
      ];
    }
  }

  /**
   * AnalysisCoordinatorとの統合分析サポート
   * 
   * 包括的分析の一部として実行される場合の最適化された分析を提供します。
   * 
   * @param {string} content 章の内容
   * @param {number} chapterNumber 章番号
   * @param {GenerationContext} context 生成コンテキスト
   * @param {boolean} optimized 最適化モード（統合分析用）
   * @returns {Promise<ChapterAnalysis>} 章分析結果
   */
  async analyzeForIntegration(
    content: string,
    chapterNumber: number,
    context: GenerationContext,
    optimized: boolean = true
  ): Promise<ChapterAnalysis> {
    if (optimized) {
      // 統合分析用の最適化：重複処理を避けて高速化
      return this.performOptimizedAnalysis(content, chapterNumber, context);
    } else {
      // 通常の分析
      return this.analyzeChapter(content, chapterNumber, context);
    }
  }

  /**
   * 最適化された分析処理
   * 
   * @private
   * @param {string} content 章の内容
   * @param {number} chapterNumber 章番号
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {Promise<ChapterAnalysis>} 最適化された章分析結果
   */
  private async performOptimizedAnalysis(
    content: string,
    chapterNumber: number,
    context: GenerationContext
  ): Promise<ChapterAnalysis> {
    try {
      logger.info(`Performing optimized chapter analysis for integration (chapter ${chapterNumber})`);

      // 基本分析のみ実行（品質メトリクス中心）
      const baseAnalysis = await this.performBaseAnalysis(content, chapterNumber, context);

      // シーン抽出は簡素化
      const scenes = await this.extractBasicScenes(content, chapterNumber);

      // 最適化された分析結果
      const analysis: ChapterAnalysis = {
        ...baseAnalysis,
        scenes,
        metadata: {
          title: `第${chapterNumber}章`,
          summary: `第${chapterNumber}章の分析`,
          keywords: []
        },
        textStats: this.analyzeTextStatistics(content)
      };

      logger.info(`Optimized chapter analysis completed for chapter ${chapterNumber}`);
      return analysis;
    } catch (error) {
      logger.error(`Optimized chapter analysis failed for chapter ${chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });

      return this.createFallbackAnalysis(chapterNumber, context);
    }
  }

  /**
   * 基本的なシーン抽出（最適化版）
   * 
   * @private
   * @param {string} content 章の内容
   * @param {number} chapterNumber 章番号
   * @returns {Promise<Scene[]>} 基本的なシーン情報
   */
  private async extractBasicScenes(
    content: string,
    chapterNumber: number
  ): Promise<Scene[]> {
    try {
      // シンプルな段落ベースのシーン分割
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

      if (paragraphs.length <= 2) {
        // 短い章の場合は単一シーン
        return [{
          id: `scene-${chapterNumber}-1`,
          type: 'DEVELOPMENT',
          title: '章の内容',
          startPosition: 0,
          endPosition: content.length,
          characters: [],
          location: '',
          summary: '章全体'
        }];
      }

      // 複数段落がある場合は3つのシーンに分割
      const sceneCount = Math.min(3, Math.max(1, Math.floor(paragraphs.length / 2)));
      const scenes: Scene[] = [];

      for (let i = 0; i < sceneCount; i++) {
        scenes.push({
          id: `scene-${chapterNumber}-${i + 1}`,
          type: i === 0 ? 'INTRODUCTION' : (i === sceneCount - 1 ? 'RESOLUTION' : 'DEVELOPMENT'),
          title: `シーン${i + 1}`,
          startPosition: Math.floor((content.length / sceneCount) * i),
          endPosition: Math.floor((content.length / sceneCount) * (i + 1)),
          characters: [],
          location: '',
          summary: `第${i + 1}パート`
        });
      }

      return scenes;
    } catch (error) {
      logger.warn(`Basic scene extraction failed for chapter ${chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });

      return [{
        id: `scene-${chapterNumber}-1`,
        type: 'DEVELOPMENT',
        title: '章の内容',
        startPosition: 0,
        endPosition: content.length,
        characters: [],
        location: '',
        summary: '章全体'
      }];
    }
  }

  /**
   * キャッシュを削除します。
   * （テスト用または長期間稼働時のメモリ管理用）
   */
  clearCache(): void {
    this.cacheStore.clear();
    logger.info('Chapter analysis cache cleared');
  }

  // =========================================================================
  // 以下、プライベートヘルパーメソッド
  // =========================================================================

  /**
   * 章の内容のパース処理
   * 
   * 章の内容をメタデータと本文に分離します。
   * 
   * @private
   * @param {string} content 章の内容
   * @param {number} chapterNumber 章番号
   * @returns {{parsedContent: string; metadata: any;}} パース結果
   */
  private parseChapterContent(content: string, chapterNumber: number): {
    parsedContent: string;
    metadata: any;
  } {
    try {
      logger.debug(`Parsing content for chapter ${chapterNumber}, length: ${content.length}`);

      // 最初と最後のセクション区切りを見つける
      const firstSeparatorIndex = content.indexOf('---');
      const secondSeparatorIndex = content.indexOf('---', firstSeparatorIndex + 3);
      const lastSeparatorIndex = content.lastIndexOf('---');

      // 区切りが適切に存在するか確認
      if (firstSeparatorIndex === -1 || secondSeparatorIndex === -1 ||
        lastSeparatorIndex === -1 || secondSeparatorIndex === lastSeparatorIndex) {
        logger.warn(`Content for chapter ${chapterNumber} has improper section formatting`);
        return this.createFallbackParsedContent(content, chapterNumber);
      }

      // ヘッダーメタデータ抽出
      const headerYaml = content.substring(firstSeparatorIndex + 3, secondSeparatorIndex).trim();
      let headerMetadata;
      try {
        headerMetadata = parseYaml(headerYaml);
      } catch (yamlError) {
        logger.error(`Failed to parse header YAML`, {
          error: yamlError instanceof Error ? yamlError.message : String(yamlError)
        });
        headerMetadata = { title: `第${chapterNumber}章` };
      }

      // 本文抽出
      let parsedContent = content.substring(secondSeparatorIndex + 3, lastSeparatorIndex).trim();

      // Markdown コードブロックの処理
      if (parsedContent.startsWith('```') && parsedContent.endsWith('```')) {
        parsedContent = parsedContent.replace(/^```(json|javascript)?\s*/, '')
          .replace(/\s*```$/, '');

        // JSON の場合はさらに解析
        if (parsedContent.startsWith('{') && parsedContent.endsWith('}')) {
          try {
            const jsonContent = JSON.parse(parsedContent);
            if (jsonContent.content) {
              parsedContent = jsonContent.content;
            }
          } catch (e) {
            logger.warn(`Failed to parse JSON content: ${e}`);
          }
        }
      }

      // フッターメタデータ抽出
      const footerYaml = content.substring(lastSeparatorIndex + 3).trim();
      let footerMetadata = {};
      try {
        footerMetadata = parseYaml(footerYaml);
      } catch (yamlError) {
        logger.warn(`Failed to parse footer metadata for chapter ${chapterNumber}`, {
          error: yamlError instanceof Error ? yamlError.message : String(yamlError)
        });
      }

      return {
        parsedContent,
        metadata: { ...headerMetadata, ...footerMetadata }
      };
    } catch (error) {
      logger.error(`Failed to parse content for chapter ${chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return this.createFallbackParsedContent(content, chapterNumber);
    }
  }

  /**
   * フォールバックパース結果の作成
   * 
   * パースに失敗した場合のフォールバック結果を生成します。
   * 
   * @private
   * @param {string} content 章の内容
   * @param {number} chapterNumber 章番号
   * @returns {{parsedContent: string; metadata: any;}} フォールバックパース結果
   */
  private createFallbackParsedContent(content: string, chapterNumber: number): {
    parsedContent: string;
    metadata: any;
  } {
    logger.warn(`Using fallback content parsing for chapter ${chapterNumber}`);
    return {
      parsedContent: content,
      metadata: {
        title: `第${chapterNumber}章`,
        summary: `自動生成された第${chapterNumber}章`,
        pov: '',
        location: '',
        timeframe: '',
        emotionalTone: '',
        keywords: [],
        scenes: []
      }
    };
  }

  /**
   * 基本的な章分析の実行
   * 
   * キャラクター、テーマ、伏線、品質メトリクスの基本分析を実行します。
   * 
   * @private
   * @param {string} content 章の内容
   * @param {number} chapterNumber 章番号
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {Promise<ChapterAnalysis>} 基本分析結果
   */
  private async performBaseAnalysis(
    content: string,
    chapterNumber: number,
    context: GenerationContext
  ): Promise<ChapterAnalysis> {
    try {
      // 分析プロンプトの構築
      const analysisPrompt = this.createBaseAnalysisPrompt(content);

      // APIスロットリングを使用して分析を実行
      const analysisResponse = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(analysisPrompt, {
          temperature: 0.1, // 分析タスクのため低温に設定
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );

      // JSONレスポンスの解析
      try {
        const parsedAnalysis = JsonParser.parseFromAIResponse(analysisResponse, {
          characterAppearances: [],
          themeOccurrences: [],
          foreshadowingElements: [],
          qualityMetrics: {}
        });

        // 基本構造の検証
        if (!parsedAnalysis.characterAppearances ||
          !parsedAnalysis.themeOccurrences ||
          !parsedAnalysis.foreshadowingElements ||
          !parsedAnalysis.qualityMetrics) {
          throw new Error('Invalid analysis structure');
        }

        // 型強制と整形
        return {
          characterAppearances: this.formatCharacterAppearances(parsedAnalysis.characterAppearances, context),
          themeOccurrences: this.formatThemeOccurrences(parsedAnalysis.themeOccurrences, context),
          foreshadowingElements: this.formatForeshadowingElements(parsedAnalysis.foreshadowingElements, chapterNumber),
          qualityMetrics: this.formatQualityMetrics(parsedAnalysis.qualityMetrics),
          detectedIssues: []
        };
      } catch (parseError) {
        logger.error(`Failed to parse analysis response for chapter ${chapterNumber}`, {
          error: parseError instanceof Error ? parseError.message : String(parseError),
          response: analysisResponse.substring(0, 500)
        });

        throw parseError;
      }
    } catch (error) {
      logger.warn(`Basic chapter analysis failed for chapter ${chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });

      // 分析に失敗した場合はフォールバック分析結果を返す
      return {
        characterAppearances: this.createFallbackCharacterAppearances(context),
        themeOccurrences: this.createFallbackThemeOccurrences(context),
        foreshadowingElements: this.createFallbackForeshadowingElements(chapterNumber, context),
        qualityMetrics: this.createFallbackQualityMetrics(),
        detectedIssues: []
      };
    }
  }

  /**
   * シーン抽出
   * 
   * 章の内容からシーン情報を抽出します。
   * 
   * @private
   * @param {string} content 章の内容
   * @param {number} chapterNumber 章番号
   * @returns {Promise<Scene[]>} シーン情報の配列
   */
  private async extractScenes(
    content: string,
    chapterNumber: number
  ): Promise<Scene[]> {
    try {
      logger.info(`Extracting scenes for chapter ${chapterNumber}`);

      // シーン抽出のプロンプト
      const scenePrompt = this.createSceneExtractionPrompt(content);

      // フォールバック用の単一シーン（デフォルト値として使用）
      const fallbackScene: Scene[] = [{
        id: `scene-${chapterNumber}-1`,
        type: 'DEVELOPMENT',
        title: '章の内容',
        startPosition: 0,
        endPosition: content.length,
        characters: [],
        location: '',
        summary: '章全体'
      }];

      // APIスロットリングを使用してシーン抽出を実行
      const sceneResponse = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(scenePrompt, {
          temperature: 0.2,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );

      // JsonParserを使用してレスポンスを解析
      const parsedScenes = JsonParser.parseFromAIResponse<any[]>(sceneResponse, []);

      // 配列かどうか検証
      if (!Array.isArray(parsedScenes) || parsedScenes.length === 0) {
        logger.warn(`Invalid scene array format for chapter ${chapterNumber}`, {
          responsePreview: sceneResponse.substring(0, 200)
        });
        return fallbackScene;
      }

      // シーン情報の整形と検証
      const scenes: Scene[] = parsedScenes.map((scene, index) => {
        // 各フィールドの存在確認と型変換
        const sceneObj: Scene = {
          id: `scene-${chapterNumber}-${index + 1}`,
          type: typeof scene.type === 'string' && scene.type ? scene.type : 'DEVELOPMENT',
          title: typeof scene.title === 'string' && scene.title ? scene.title : `シーン${index + 1}`,
          startPosition: 0, // テキスト位置は不明なため0とする
          endPosition: 0,
          characters: Array.isArray(scene.characters) ? scene.characters : [],
          location: typeof scene.location === 'string' ? scene.location : '',
          summary: typeof scene.summary === 'string' ? scene.summary : '',
        };
        return sceneObj;
      });

      logger.info(`Successfully extracted ${scenes.length} scenes for chapter ${chapterNumber}`);
      return scenes;
    } catch (error) {
      logger.warn(`Scene extraction failed for chapter ${chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });

      // フォールバック：単一シーン
      return [{
        id: `scene-${chapterNumber}-1`,
        type: 'DEVELOPMENT',
        title: '章の内容',
        startPosition: 0,
        endPosition: content.length,
        characters: [],
        location: '',
        summary: '章全体'
      }];
    }
  }

  /**
   * テキスト統計分析
   * 
   * 章のテキストを統計的に分析します。
   * 
   * @private
   * @param {string} content 章の内容
   * @returns {Object} テキスト統計情報
   */
  private analyzeTextStatistics(content: string): {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    averageSentenceLength: number;
    dialoguePercentage?: number;
    characterNameFrequency?: { [key: string]: number };
  } {
    try {
      // 段落数カウント
      const paragraphCount = content.split(/\n\s*\n/).length;

      // 文数カウント（日本語と英語の両方に対応）
      const sentenceCount = content.split(/[。.！!？?]\s*/).filter(s => s.trim().length > 0).length;

      // 単語/文字数カウント
      const wordCount = this.countWords(content);

      // 平均文長
      const averageSentenceLength = sentenceCount > 0 ? Math.round(wordCount / sentenceCount * 10) / 10 : 0;

      // 対話の割合を推定
      const dialogueMatches = content.match(/「([^」]*)」/g) || [];
      const totalDialogueLength = dialogueMatches.reduce((sum, dialogue) => sum + dialogue.length, 0);
      const dialoguePercentage = Math.round(totalDialogueLength / content.length * 1000) / 10;

      // 拡張統計情報を返す
      return {
        wordCount,
        sentenceCount,
        paragraphCount,
        averageSentenceLength,
        dialoguePercentage
      };
    } catch (error) {
      logger.warn('Text statistics analysis failed', {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        wordCount: content.length,
        sentenceCount: 1,
        paragraphCount: 1,
        averageSentenceLength: content.length
      };
    }
  }

  /**
   * 単語数/文字数カウント
   * 
   * テキストの単語数または文字数をカウントします。
   * 日本語の場合は文字数、英語の場合は単語数をカウントします。
   * 
   * @private
   * @param {string} text テキスト
   * @returns {number} 単語数または文字数
   */
  private countWords(text: string): number {
    // 日本語の場合、単語数ではなく文字数をカウント
    if (/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text)) {
      return text.length;
    }

    // 英文の場合は単語数をカウント
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * プロンプト生成：基本分析
   * 
   * @private
   * @param {string} content 章の内容
   * @returns {string} 分析用プロンプト
   */
  private createBaseAnalysisPrompt(content: string): string {
    return `
以下のチャプター内容を分析し、キャラクターの登場状況、テーマの出現、伏線要素、品質メトリクスを詳細に抽出してください。
JSON形式で出力してください。

# チャプター内容
${content.substring(0, 10000)}  // 長すぎる場合は一部を切り出す

# 分析項目
1. characterAppearances: 登場キャラクター分析
2. themeOccurrences: テーマ出現分析
3. foreshadowingElements: 伏線要素分析
4. qualityMetrics: 品質メトリクス分析

# JSON出力形式
{
  "characterAppearances": [
    {
      "characterId": "キャラクターID",
      "characterName": "キャラクター名",
      "scenes": ["シーンID", ...],
      "dialogueCount": 会話数,
      "significance": 重要度(0-1),
      "actions": ["行動1", "行動2", ...],
      "emotions": ["感情1", "感情2", ...]
    }
  ],
  "themeOccurrences": [
    {
      "themeId": "テーマID",
      "themeName": "テーマ名",
      "expressions": ["表現1", "表現2", ...],
      "strength": 強度(0-1),
      "contexts": ["コンテキスト1", "コンテキスト2", ...]
    }
  ],
  "foreshadowingElements": [
    {
      "id": "伏線ID",
      "description": "伏線の説明",
      "position": テキスト位置,
      "text": "伏線テキスト",
      "plannedResolutionChapter": [最小章, 最大章],
      "relatedCharacters": ["関連キャラクター1", ...]
    }
  ],
  "qualityMetrics": {
    "readability": 読みやすさ(0-1),
    "consistency": 整合性(0-1),
    "engagement": 引き込み度(0-1),
    "characterDepiction": キャラクター描写(0-1),
    "originality": オリジナリティ(0-1),
    "overall": 総合スコア(0-1),
    "coherence": 一貫性(0-1),
    "characterConsistency": キャラクター一貫性(0-1)
  }
}`;
  }

  /**
   * プロンプト生成：シーン抽出
   * 
   * @private
   * @param {string} content 章の内容
   * @returns {string} シーン抽出用プロンプト
   */
  private createSceneExtractionPrompt(content: string): string {
    return `
以下の小説の章からシーン分割してください。

${content.substring(0, 7000)}

各シーンには以下の情報を含めてください：
1. タイプ（INTRODUCTION, DEVELOPMENT, CLIMAX, RESOLUTION, TRANSITION）
2. タイトル（内容を端的に表す）
3. 登場キャラクター
4. 場所
5. 簡潔な要約

JSONフォーマットで出力：
[
  {
    "type": "シーンタイプ",
    "title": "シーンタイトル",
    "characters": ["キャラクター1", "キャラクター2"],
    "location": "場所",
    "summary": "要約"
  }
]`;
  }

  /**
   * キャラクター登場情報のフォーマット
   * 
   * @private
   * @param {any[]} appearances キャラクター登場情報
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {CharacterAppearance[]} フォーマットされたキャラクター登場情報
   */
  private formatCharacterAppearances(
    appearances: any[],
    context: GenerationContext
  ): CharacterAppearance[] {
    if (!appearances || !Array.isArray(appearances)) {
      return this.createFallbackCharacterAppearances(context);
    }

    return appearances.map(appearance => ({
      characterId: appearance.characterId || `char-${appearance.characterName?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}`,
      characterName: appearance.characterName || 'Unknown Character',
      scenes: Array.isArray(appearance.scenes) ? appearance.scenes : [],
      dialogueCount: typeof appearance.dialogueCount === 'number' ? appearance.dialogueCount : 0,
      significance: typeof appearance.significance === 'number' ?
        Math.max(0, Math.min(1, appearance.significance)) : 0.5,
      actions: Array.isArray(appearance.actions) ? appearance.actions : [],
      emotions: Array.isArray(appearance.emotions) ? appearance.emotions : []
    }));
  }

  /**
   * テーマ出現情報のフォーマット
   * 
   * @private
   * @param {any[]} occurrences テーマ出現情報
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {ThemeOccurrence[]} フォーマットされたテーマ出現情報
   */
  private formatThemeOccurrences(
    occurrences: any[],
    context: GenerationContext
  ): ThemeOccurrence[] {
    if (!occurrences || !Array.isArray(occurrences)) {
      return this.createFallbackThemeOccurrences(context);
    }

    return occurrences.map(occurrence => ({
      themeId: occurrence.themeId || `theme-${occurrence.themeName?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}`,
      themeName: occurrence.themeName || 'Unknown Theme',
      expressions: Array.isArray(occurrence.expressions) ? occurrence.expressions : [],
      strength: typeof occurrence.strength === 'number' ?
        Math.max(0, Math.min(1, occurrence.strength)) : 0.5,
      theme: occurrence.theme || occurrence.themeName || '',
      contexts: Array.isArray(occurrence.contexts) ? occurrence.contexts : []
    }));
  }

  /**
   * 伏線要素のフォーマット
   * 
   * @private
   * @param {any[]} elements 伏線要素
   * @param {number} chapterNumber 章番号
   * @returns {ForeshadowingElement[]} フォーマットされた伏線要素
   */
  private formatForeshadowingElements(
    elements: any[],
    chapterNumber: number
  ): ForeshadowingElement[] {
    if (!elements || !Array.isArray(elements)) {
      return [];
    }

    return elements.map((element, index) => ({
      id: element.id || `foreshadowing-${chapterNumber}-${index + 1}`,
      description: element.description || 'Undefined foreshadowing element',
      position: typeof element.position === 'number' ? element.position : 0,
      text: element.text || '',
      plannedResolutionChapter: Array.isArray(element.plannedResolutionChapter) && element.plannedResolutionChapter.length === 2 ?
        element.plannedResolutionChapter as [number, number] : [chapterNumber + 2, chapterNumber + 10],
      relatedCharacters: Array.isArray(element.relatedCharacters) ? element.relatedCharacters : [],
      element: element.element || element.description || '',
      chapter: chapterNumber,
      resolutionChapter: element.resolutionChapter,
      isResolved: element.isResolved || false
    }));
  }

  /**
   * 品質メトリクスのフォーマット
   * 
   * @private
   * @param {any} metrics 品質メトリクス
   * @returns {QualityMetrics} フォーマットされた品質メトリクス
   */
  private formatQualityMetrics(metrics: any): QualityMetrics {
    if (!metrics || typeof metrics !== 'object') {
      return this.createFallbackQualityMetrics();
    }

    // 値の正規化（0-1の範囲に収める）
    const normalize = (value: any) => {
      if (typeof value !== 'number') return 0.7;
      return Math.max(0, Math.min(1, value));
    };

    return {
      readability: normalize(metrics.readability),
      consistency: normalize(metrics.consistency),
      engagement: normalize(metrics.engagement),
      characterDepiction: normalize(metrics.characterDepiction),
      originality: normalize(metrics.originality),
      overall: normalize(metrics.overall ||
        ((metrics.readability || 0) +
          (metrics.consistency || 0) +
          (metrics.engagement || 0) +
          (metrics.characterDepiction || 0) +
          (metrics.originality || 0)) / 5),
      coherence: normalize(metrics.coherence || metrics.consistency),
      characterConsistency: normalize(metrics.characterConsistency || metrics.characterDepiction)
    };
  }

  /**
   * フォールバック分析結果の作成
   * 
   * 分析に失敗した場合のフォールバック分析結果を生成します。
   * 
   * @private
   * @param {number} chapterNumber 章番号
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {ChapterAnalysis} フォールバック分析結果
   */
  private createFallbackAnalysis(chapterNumber: number, context: GenerationContext): ChapterAnalysis {
    return {
      characterAppearances: AnalysisFormatter.createFallbackCharacterAppearances(context),
      themeOccurrences: AnalysisFormatter.createFallbackThemeOccurrences(context),
      foreshadowingElements: AnalysisFormatter.createFallbackForeshadowingElements(chapterNumber, context),
      qualityMetrics: AnalysisFormatter.createFallbackQualityMetrics(),
      detectedIssues: [],
      scenes: [{
        id: `scene-${chapterNumber}-1`,
        type: 'DEVELOPMENT',
        title: '章の内容',
        startPosition: 0,
        endPosition: 1000,
        characters: [],
        location: '',
        summary: '章全体'
      }],
      metadata: {
        title: `第${chapterNumber}章`,
        summary: `自動生成された第${chapterNumber}章`,
        keywords: []
      },
      textStats: {
        wordCount: 1000,
        sentenceCount: 20,
        paragraphCount: 5,
        averageSentenceLength: 50,
        dialoguePercentage: 30
      }
    };
  }

  /**
   * フォールバックキャラクター登場情報の作成
   * 
   * @private
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {CharacterAppearance[]} フォールバックキャラクター登場情報
   */
  private createFallbackCharacterAppearances(context: GenerationContext): CharacterAppearance[] {
    // コンテキストからキャラクター情報を抽出
    return (context.characters || [])
      .slice(0, 5) // 最大5キャラクター
      .map((char: any, index: number) => ({
        characterId: `char-${char.name?.replace(/\s+/g, '-').toLowerCase() || `unknown-${index}`}`,
        characterName: char.name || `Character ${index + 1}`,
        scenes: [],
        dialogueCount: 5,
        significance: 0.8 - (index * 0.1), // 重要度を少しずつ下げる
        actions: [],
        emotions: []
      }));
  }

  /**
   * フォールバックテーマ出現情報の作成
   * 
   * @private
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {ThemeOccurrence[]} フォールバックテーマ出現情報
   */
  private createFallbackThemeOccurrences(context: GenerationContext): ThemeOccurrence[] {
    // テーマ情報
    return context.theme ?
      [{
        themeId: `theme-main`,
        themeName: typeof context.theme === 'string' ? context.theme : 'Main Theme',
        expressions: [],
        strength: 0.8,
        theme: typeof context.theme === 'string' ? context.theme : 'Main Theme',
        contexts: []
      }] : [];
  }

  /**
   * フォールバック伏線要素の作成
   * 
   * @private
   * @param {number} chapterNumber 章番号
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {ForeshadowingElement[]} フォールバック伏線要素
   */
  private createFallbackForeshadowingElements(
    chapterNumber: number,
    context: GenerationContext
  ): ForeshadowingElement[] {
    // 伏線要素
    return (context.foreshadowing || [])
      .slice(0, 3) // 最大3伏線
      .map((fore: any, index: number) => ({
        id: `foreshadowing-${chapterNumber}-${index + 1}`,
        description: typeof fore === 'string' ? fore : fore.description || `Foreshadowing element ${index + 1}`,
        position: 500 * (index + 1), // 適当な位置
        text: '',
        plannedResolutionChapter: [chapterNumber + 2, chapterNumber + 10] as [number, number],
        relatedCharacters: [],
        element: typeof fore === 'string' ? fore : fore.description || `Foreshadowing element ${index + 1}`,
        chapter: chapterNumber,
        resolutionChapter: undefined,
        isResolved: false
      }));
  }

  /**
   * フォールバック品質メトリクスの作成
   * 
   * @private
   * @returns {QualityMetrics} フォールバック品質メトリクス
   */
  private createFallbackQualityMetrics(): QualityMetrics {
    // 品質メトリクス
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
}

// シングルトンインスタンスをエクスポート
export const chapterAnalysisService = new ChapterAnalysisService(new GeminiAdapter());