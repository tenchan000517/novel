/**
 * @fileoverview 文体と表現の最適化サービス実装
 * @description
 * 文体分析に基づく改善提案と表現最適化のための推奨を提供します。
 * 文体ガイダンス、表現多様化、繰り返し表現の改善などの機能を提供します。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiAdapter } from '@/lib/analysis/adapters/gemini-adapter';
import { JsonParser } from '@/lib/utils/json-parser';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { storageProvider } from '@/lib/storage';

import {
  StyleGuidance,
  ExpressionAlternatives,
  StyleAnalysis,
  ExpressionPatterns
} from '@/types/generation';

import {
  IStyleOptimizationService,
  ICacheStorage,
  SubjectPatternOptimizationRequest
} from '@/lib/analysis/core/interfaces';

import {
  SubjectPatternOptimization,
  StructureRecommendation,
  RepetitionAlternative
} from '@/lib/analysis/core/types';

import { CacheStorage } from '@/lib/analysis/utils/cache-storage';
import { IStyleAnalysisService } from '@/lib/analysis/services/style/interfaces';

/**
 * @class StyleOptimizationService
 * @description
 * 文体と表現の最適化を担当するサービスクラス。
 * 文体ガイダンス生成、表現多様化の推奨、繰り返し表現の改善提案などの機能を提供します。
 * 
 * @implements IStyleOptimizationService
 */
export class StyleOptimizationService implements IStyleOptimizationService {
  private cache: ICacheStorage;
  private defaultTTL: number = 3600000; // 1時間
  private initialized: boolean = false;

  /**
   * コンストラクタ
   * @param geminiAdapter Gemini API アダプター
   * @param styleAnalysisService 文体分析サービス
   * @param cache キャッシュストレージ（オプション）
   */
  constructor(
    private geminiAdapter: GeminiAdapter,
    private styleAnalysisService: IStyleAnalysisService,
    cache?: ICacheStorage
  ) {
    this.cache = cache || new CacheStorage();
    logger.info('StyleOptimizationService: 初期化完了');
  }

  /**
   * 初期化確認メソッド
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * 初期化メソッド
   */
  private async initialize(): Promise<void> {
    if (this.initialized) {
      logger.debug('StyleOptimizationService: 既に初期化済み');
      return;
    }

    try {
      logger.info('StyleOptimizationService: 初期化開始');
      this.initialized = true;
      logger.info('StyleOptimizationService: 初期化完了');
    } catch (error) {
      logger.error('StyleOptimizationService: 初期化中にエラー', {
        error: error instanceof Error ? error.message : String(error)
      });
      this.initialized = true; // エラーでも続行可能
    }
  }

  /**
   * 前章コンテンツ取得メソッド
   */
  private async getPreviousChapterContent(chapterNumber: number): Promise<string | null> {
    try {
      if (chapterNumber <= 0) return null;

      const prevChapterPath = `chapters/chapter_${chapterNumber}.json`;
      if (await storageProvider.fileExists(prevChapterPath)) {
        const content = await storageProvider.readFile(prevChapterPath);
        const chapter = JSON.parse(content);
        return chapter.content || null;
      }
      return null;
    } catch (error) {
      logger.warn(`前章コンテンツ取得に失敗: ${chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * 文体ガイダンス生成
   * 文体改善のためのガイダンスを生成します
   * 
   * @param chapterNumber 章番号
   * @param context コンテキスト情報
   * @returns 文体ガイダンス
   */
  async generateStyleGuidance(chapterNumber: number, context: any): Promise<StyleGuidance> {
    await this.ensureInitialized();

    try {
      // 統一キャッシュをチェック
      const cacheKey = `style_guidance_${chapterNumber}`;
      const cachedGuidance = this.cache.get<StyleGuidance>(cacheKey);
      if (cachedGuidance) {
        logger.debug(`StyleOptimizationService: キャッシュから章${chapterNumber}の文体ガイダンスを取得`);
        return cachedGuidance;
      }

      logger.info(`StyleOptimizationService: 章${chapterNumber}の文体ガイダンスを生成`);

      // 前章のコンテンツを取得
      const prevChapterContent = await this.getPreviousChapterContent(chapterNumber - 1);

      let guidance: StyleGuidance;

      if (prevChapterContent && prevChapterContent.length > 100) {
        // 高品質な分析サービスに委譲
        const styleAnalysis = await this.styleAnalysisService.analyzeStyle(prevChapterContent);

        // 正しい引数で AI ガイダンスを生成
        guidance = await apiThrottler.throttledRequest(() =>
          this.generateStyleGuidanceWithAI(styleAnalysis, context, chapterNumber)
        );
      } else {
        // 前章の内容がない場合は基本ガイダンス
        guidance = this.generateBasicStyleGuidance(context);
      }

      // 統一キャッシュに保存
      this.cache.set(cacheKey, guidance, this.defaultTTL);

      return guidance;
    } catch (error) {
      logger.warn(`StyleOptimizationService: 章${chapterNumber}の文体ガイダンス生成中にエラー`, {
        error: error instanceof Error ? error.message : String(error)
      });

      // フォールバックガイダンスを返す
      return this.createFallbackStyleGuidance(context);
    }
  }

  /**
   * AIを使用した文体ガイダンス生成
   * @private
   * @param styleAnalysis 文体分析結果
   * @param context コンテキスト情報
   * @param chapterNumber 章番号
   * @returns 文体ガイダンス
   */
  private async generateStyleGuidanceWithAI(
    styleAnalysis: StyleAnalysis,
    context: any,
    chapterNumber: number
  ): Promise<StyleGuidance> {
    try {
      // 文体分析結果を文字列化
      const analysisStr = JSON.stringify({
        avgSentenceLength: styleAnalysis.avgSentenceLength,
        sentenceVariety: styleAnalysis.sentenceVariety,
        vocabularyRichness: styleAnalysis.vocabularyRichness,
        narrativeVoice: styleAnalysis.narrativeVoice,
        tenseConsistency: styleAnalysis.tenseConsistency
      }, null, 2);

      // ジャンルとテーマ情報
      const genre = context?.genre || '';
      const theme = context?.theme || '';
      const tension = context?.tension || 0.5;

      // 前章の内容があれば取得（最大1000文字）
      let prevChapterSummary = '';
      try {
        const prevChapterPath = `chapters/chapter_${chapterNumber - 1}.json`;
        if (await storageProvider.fileExists(prevChapterPath)) {
          const prevChapterContent = await storageProvider.readFile(prevChapterPath);
          const prevChapter = JSON.parse(prevChapterContent);

          if (prevChapter.content) {
            prevChapterSummary = prevChapter.content.substring(0, 1000) + '...';
          }
        }
      } catch (prevError) {
        logger.warn(`前章の内容取得に失敗しました`, {
          error: prevError instanceof Error ? prevError.message : String(prevError)
        });
      }

      // プロンプトの作成
      const prompt = `
あなたは文体最適化の専門家です。以下の情報に基づいて、章${chapterNumber}で使用する最適な文体に関するガイダンスを提供してください。

## 前章の文体分析結果
${analysisStr}

${prevChapterSummary ? `## 前章の内容サンプル\n${prevChapterSummary}\n` : ''}

## 作品情報
- ジャンル: ${genre}
- テーマ: ${theme}
- テンション値: ${tension}
- 章番号: ${chapterNumber}

## 必要なガイダンス
以下のカテゴリ別に、実用的かつ具体的なガイダンスを提供してください：
1. general: 全般的な文体ガイダンス
2. sentenceStructure: 文構造に関するガイダンス
3. vocabulary: 語彙選択に関するガイダンス 
4. rhythm: リズムと文の流れに関するガイダンス

各カテゴリは配列形式で、少なくとも2つの提案を含めてください。
提案は70〜100文字程度の具体的なアドバイスであるべきです。

ガイダンスを作成する際は以下の点を考慮してください：
- ジャンルに適した文体（例：ミステリーなら簡潔な描写、ファンタジーなら豊かな描写）
- 現在のテンション値に合わせた文体（緊張感の高低）
- 前章の文体分析結果から改善できる点
- 文体の一貫性を保ちながら変化をつける方法
- 単調にならない工夫（文長のバリエーション、語彙の多様化など）

以下のJSON形式で結果を返してください：
{
  "general": ["ガイダンス1", "ガイダンス2", ...],
  "sentenceStructure": ["ガイダンス1", "ガイダンス2", ...],
  "vocabulary": ["ガイダンス1", "ガイダンス2", ...],
  "rhythm": ["ガイダンス1", "ガイダンス2", ...]
}
`;

      // APIスロットリングを使用してAIガイダンスを生成
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(prompt, {
          temperature: 0.3,
          purpose: 'guidance',
          responseFormat: 'json'
        })
      );

      // デフォルト値
      const defaultGuidance = this.createFallbackStyleGuidance(context);

      // JsonParserを使用してレスポンスを解析
      const guidance = JsonParser.parseFromAIResponse<StyleGuidance>(response, defaultGuidance);

      // 結果の検証とフォーマット
      return this.validateStyleGuidance(guidance, defaultGuidance);
    } catch (error) {
      logger.error(`AIによる文体ガイダンス生成中にエラーが発生しました`, {
        error: error instanceof Error ? error.message : String(error)
      });

      // エラー時はフォールバック値を返す
      return this.createFallbackStyleGuidance(context);
    }
  }

  /**
   * 基本的な文体ガイダンス生成
   * @private
   * @param context コンテキスト情報
   * @returns 基本的な文体ガイダンス
   */
  private generateBasicStyleGuidance(context: any): StyleGuidance {
    // ジャンルやテーマに基づいた基本ガイダンスを生成
    const genre = context?.genre || '';
    const theme = context?.theme || '';
    const tension = context?.tension || 0.5;

    const guidance: StyleGuidance = {
      general: [
        "文体に変化をつけ、読者の興味を維持してください",
        "同じ表現の繰り返しを避け、多様な表現を心がけてください"
      ],
      sentenceStructure: [
        "文の長さに変化をつけてリズム感を出してください",
        "重要なポイントは短い文で強調し、描写は長めの文で表現してください"
      ],
      vocabulary: [
        "感情を表す言葉をより具体的に使い分け、感情の機微を表現してください",
        "抽象的な表現よりも具体的な表現を優先し、読者がイメージしやすくしてください"
      ],
      rhythm: [
        "緊迫したシーンでは短い文を、説明的なシーンでは長めの文を使い分けてください",
        "段落の長さにもリズム感を持たせ、短い段落と長い段落を組み合わせてください"
      ]
    };

    // ジャンルに応じた追加ガイダンス
    if (genre.toLowerCase().includes('ファンタジー')) {
      guidance.vocabulary.push("世界観を表現する独特の言葉遣いを一貫して使用し、世界の雰囲気を醸成してください");
      guidance.sentenceStructure.push("描写的な部分では修飾語を豊かに使い、読者が世界を視覚的に体験できるようにしてください");
    } else if (genre.toLowerCase().includes('ミステリー')) {
      guidance.sentenceStructure.push("伏線を自然に埋め込むために、重要な情報は物語の流れに溶け込ませるように配置してください");
      guidance.rhythm.push("緊張感を高めるシーンでは短く鋭い文を使い、テンポを速めて読者の緊張を高めてください");
    } else if (genre.toLowerCase().includes('恋愛')) {
      guidance.vocabulary.push("感情の機微を表現する豊かな語彙を用い、登場人物の心の動きを繊細に描写してください");
      guidance.rhythm.push("感情的な高まりに合わせてリズムを変化させ、読者の感情を誘導するように文章を構成してください");
    } else if (genre.toLowerCase().includes('歴史')) {
      guidance.vocabulary.push("時代背景に合致した語彙や表現を用い、時代の雰囲気を自然に伝えてください");
      guidance.general.push("史実と創作のバランスをとり、歴史的な正確さと物語としての面白さを両立させてください");
    } else if (genre.toLowerCase().includes('sf')) {
      guidance.vocabulary.push("科学的概念や未来技術を説明する際は、簡潔かつ理解しやすい表現を心がけてください");
      guidance.sentenceStructure.push("複雑な設定説明の際は、短い文で小分けにし、読者が理解しやすいように工夫してください");
    }

    // テンション値に応じた調整
    if (tension > 0.7) {
      guidance.rhythm.push("高いテンションに合わせて短い文と短い段落を多用し、テンポの速さを維持してください");
      guidance.sentenceStructure.push("切迫感を表現するために、主語と述語の距離を近づけた直接的な文を使用してください");
    } else if (tension < 0.4) {
      guidance.rhythm.push("穏やかな雰囲気に合わせて、流れるような長めの文を使い、ゆったりとしたペースを維持してください");
      guidance.vocabulary.push("落ち着いた雰囲気を醸成する語彙を選び、静謐さや安定感を表現してください");
    }

    return guidance;
  }

  /**
   * フォールバック用の文体ガイダンス作成
   * @private
   * @param context コンテキスト情報
   * @returns フォールバック文体ガイダンス
   */
  private createFallbackStyleGuidance(context: any): StyleGuidance {
    return {
      general: [
        "文体に変化をつけ、より自然な流れを心がけてください",
        "同じ表現の繰り返しを避けてください"
      ],
      sentenceStructure: [
        "文の長さに変化をつけてリズム感を出してください",
        "一文一義を意識し、1つの文に複数の内容を詰め込みすぎないようにしてください"
      ],
      vocabulary: [
        "感情を表す言葉をより具体的に使い分けてください",
        "抽象的な表現よりも具体的な表現を心がけてください"
      ],
      rhythm: [
        "緊迫したシーンでは短い文を、説明的なシーンでは長めの文を使いましょう",
        "段落の長さにもリズムをつけ、読みやすさを向上させてください"
      ]
    };
  }

  /**
   * 文体ガイダンスを検証し、必要に応じて補完する
   * @private
   * @param guidance 検証対象のガイダンス
   * @param defaultGuidance デフォルトガイダンス
   * @returns 検証・補完済みガイダンス
   */
  private validateStyleGuidance(guidance: StyleGuidance, defaultGuidance: StyleGuidance): StyleGuidance {
    const validated: StyleGuidance = { ...guidance };

    // 各カテゴリが配列でない場合や空の場合はデフォルト値を使用
    if (!Array.isArray(validated.general) || validated.general.length === 0) {
      validated.general = defaultGuidance.general;
    }

    if (!Array.isArray(validated.sentenceStructure) || validated.sentenceStructure.length === 0) {
      validated.sentenceStructure = defaultGuidance.sentenceStructure;
    }

    if (!Array.isArray(validated.vocabulary) || validated.vocabulary.length === 0) {
      validated.vocabulary = defaultGuidance.vocabulary;
    }

    if (!Array.isArray(validated.rhythm) || validated.rhythm.length === 0) {
      validated.rhythm = defaultGuidance.rhythm;
    }

    return validated;
  }

  /**
   * 代替表現提案
   * 繰り返しを避けるための代替表現を提案します
   * 
   * @param expressionPatterns 表現パターン分析結果
   * @param context コンテキスト情報（ジャンル、テーマなど）
   * @returns 代替表現提案
   */
  async suggestAlternativeExpressions(
    expressionPatterns: ExpressionPatterns,
    context: any
  ): Promise<ExpressionAlternatives> {
    try {
      // パターンが空の場合は空オブジェクトを返す
      if (!expressionPatterns || Object.keys(expressionPatterns).length === 0) {
        logger.warn('表現パターンが空のため、代替表現は生成しません');
        return {};
      }

      // キャッシュキーの生成（表現パターンのハッシュに基づく）
      const cacheKey = `alt-expressions-${this.hashObject(expressionPatterns)}`;

      // キャッシュをチェック
      const cachedAlternatives = this.cache.get<ExpressionAlternatives>(cacheKey);
      if (cachedAlternatives) {
        logger.debug(`StyleOptimizationService: キャッシュから代替表現を取得`);
        return cachedAlternatives;
      }

      logger.info('代替表現提案を生成します');

      // AIを使用した代替表現生成
      const alternatives = await this.generateAlternativesWithAI(expressionPatterns, context);

      // キャッシュに保存
      this.cache.set(cacheKey, alternatives, this.defaultTTL);

      logger.info('代替表現提案を生成しました', {
        verbCount: Object.keys(alternatives.verbAlternatives || {}).length,
        adjectiveCount: Object.keys(alternatives.adjectiveAlternatives || {}).length,
        dialogueCount: Object.keys(alternatives.dialogueAlternatives || {}).length,
        conjunctionCount: Object.keys(alternatives.conjunctionAlternatives || {}).length,
        structureCount: Object.keys(alternatives.structureAlternatives || {}).length
      });

      return alternatives;
    } catch (error) {
      logger.error('代替表現提案生成中にエラーが発生しました', {
        error: error instanceof Error ? error.message : String(error)
      });

      // エラー時は空オブジェクトを返す
      return {};
    }
  }

  /**
   * AIを使用した代替表現生成
   * @private
   * @param patterns 表現パターン
   * @param context コンテキスト情報
   * @returns 代替表現提案
   */
  private async generateAlternativesWithAI(
    patterns: ExpressionPatterns,
    context: any
  ): Promise<ExpressionAlternatives> {
    try {
      // 最も頻度の高い表現パターンだけを抽出（各カテゴリから最大5つまで）
      const topPatterns: ExpressionPatterns = {
        verbPhrases: patterns.verbPhrases?.slice(0, 5) || [],
        adjectivalExpressions: patterns.adjectivalExpressions?.slice(0, 5) || [],
        dialoguePatterns: patterns.dialoguePatterns?.slice(0, 5) || [],
        conjunctions: patterns.conjunctions?.slice(0, 5) || [],
        sentenceStructures: patterns.sentenceStructures?.slice(0, 5) || []
      };

      // ジャンル・テーマ情報
      const genre = context?.genre || '';
      const theme = context?.theme || '';

      // プロンプトの作成
      const prompt = `
あなは表現の多様化を専門とするエディターです。以下に示す繰り返し使用されている表現パターンに対して、多様な代替表現を提案してください。

## 作品情報
- ジャンル: ${genre}
- テーマ: ${theme}

## 現在のパターン
${JSON.stringify(topPatterns, null, 2)}

## 指示
各表現に対して2〜3の多様な代替案を提供してください。以下の点を考慮してください：
- ジャンルの雰囲気に合った表現選択
- テーマを効果的に表現する言葉選び
- 日本語の自然さと読みやすさ
- 原文のニュアンスを維持しつつ表現を多様化

## 出力形式
以下のJSONフォーマットで代替表現を提案してください：
{
  "verbAlternatives": {
    "表現1": ["代替1", "代替2", "代替3"],
    "表現2": ["代替1", "代替2", "代替3"]
  },
  "adjectiveAlternatives": {
    "表現1": ["代替1", "代替2", "代替3"],
    "表現2": ["代替1", "代替2", "代替3"]
  },
  "dialogueAlternatives": {
    "表現1": ["代替1", "代替2", "代替3"],
    "表現2": ["代替1", "代替2", "代替3"]
  },
  "conjunctionAlternatives": {
    "表現1": ["代替1", "代替2", "代替3"],
    "表現2": ["代替1", "代替2", "代替3"]
  },
  "structureAlternatives": {
    "表現1": ["代替1", "代替2", "代替3"],
    "表現2": ["代替1", "代替2", "代替3"]
  }
}
`;

      // APIスロットリングを使用してAI生成を実行
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(prompt, {
          temperature: 0.4,
          purpose: 'suggestion',
          responseFormat: 'json'
        })
      );

      // JsonParserを使用してレスポンスを解析
      const alternatives = JsonParser.parseFromAIResponse<ExpressionAlternatives>(response, {});

      // 結果の検証
      return this.validateAlternatives(alternatives);
    } catch (error) {
      logger.error('AIによる代替表現生成中にエラーが発生しました', {
        error: error instanceof Error ? error.message : String(error)
      });

      return this.createFallbackAlternatives();
    }
  }

  /**
   * 代替表現を検証・整形する
   * @private
   * @param alternatives 代替表現
   * @returns 検証・整形後の代替表現
   */
  private validateAlternatives(alternatives: ExpressionAlternatives): ExpressionAlternatives {
    const validated: ExpressionAlternatives = {};

    // カテゴリごとに検証
    if (alternatives.verbAlternatives && typeof alternatives.verbAlternatives === 'object') {
      validated.verbAlternatives = alternatives.verbAlternatives;
    }

    if (alternatives.adjectiveAlternatives && typeof alternatives.adjectiveAlternatives === 'object') {
      validated.adjectiveAlternatives = alternatives.adjectiveAlternatives;
    }

    if (alternatives.dialogueAlternatives && typeof alternatives.dialogueAlternatives === 'object') {
      validated.dialogueAlternatives = alternatives.dialogueAlternatives;
    }

    if (alternatives.conjunctionAlternatives && typeof alternatives.conjunctionAlternatives === 'object') {
      validated.conjunctionAlternatives = alternatives.conjunctionAlternatives;
    }

    if (alternatives.structureAlternatives && typeof alternatives.structureAlternatives === 'object') {
      validated.structureAlternatives = alternatives.structureAlternatives;
    }

    return validated;
  }

  /**
   * フォールバック用の代替表現作成
   * @private
   * @returns フォールバック代替表現
   */
  private createFallbackAlternatives(): ExpressionAlternatives {
    return {
      verbAlternatives: {
        "歩き出した": ["足を踏み出した", "歩み始めた", "歩を進めた"],
        "見つめた": ["凝視した", "注視した", "目を向けた"]
      },
      adjectiveAlternatives: {
        "美しい": ["麗しい", "艶やかな", "綺麗な"],
        "悲しい": ["哀しい", "物悲しい", "悲痛な"]
      },
      dialogueAlternatives: {
        "と言った": ["と告げた", "と話した", "と口にした"],
        "と叫んだ": ["と声を張り上げた", "と声を上げた", "と声を荒げた"]
      },
      conjunctionAlternatives: {
        "しかし": ["だが", "けれども", "だけれど"],
        "そして": ["また", "それから", "そうして"]
      },
      structureAlternatives: {
        "〜のような〜": ["〜に似た〜", "〜を思わせる〜", "〜を連想させる〜"],
        "〜であった": ["〜だった", "〜となっていた", "〜と言える"]
      }
    };
  }

  /**
   * 主語パターン最適化提案
   * 主語の使用パターンを最適化するための提案を生成します
   * 
   * @param subjectPatterns 主語パターン分析結果
   * @param context コンテキスト情報
   * @returns 主語パターン最適化提案
   */
  async optimizeSubjectPatterns(
    subjectPatterns: SubjectPatternOptimizationRequest,
    context: any
  ): Promise<SubjectPatternOptimization> {
    try {
      // 多様性スコアが高い場合は問題なし
      if (subjectPatterns.subjectDiversityScore > 0.8) {
        return {
          score: subjectPatterns.subjectDiversityScore,
          problems: [],
          suggestions: ["主語の多様性は良好です。現状の文体を維持してください。"]
        };
      }

      // キャッシュキーの生成
      const cacheKey = `subject-opt-${this.hashObject(subjectPatterns)}`;

      // キャッシュをチェック
      const cachedOptimization = this.cache.get<SubjectPatternOptimization>(cacheKey);
      if (cachedOptimization) {
        logger.debug(`StyleOptimizationService: キャッシュから主語パターン最適化提案を取得`);
        return cachedOptimization;
      }

      logger.info('主語パターン最適化提案を生成します', {
        diversityScore: subjectPatterns.subjectDiversityScore
      });

      // 繰り返し主語から問題を特定
      const problems = subjectPatterns.repeatedSubjects.map(subject =>
        `「${subject.subject}」が${subject.count}回連続で使用されています`
      );

      // AIを使用した最適化提案生成
      const optimization = await this.generateSubjectOptimizationWithAI(subjectPatterns, context);

      // 問題を結合
      optimization.problems = [...problems, ...(optimization.problems || [])];

      // キャッシュに保存
      this.cache.set(cacheKey, optimization, this.defaultTTL);

      logger.info('主語パターン最適化提案を生成しました', {
        problemsCount: optimization.problems.length,
        suggestionsCount: optimization.suggestions.length
      });

      return optimization;
    } catch (error) {
      logger.error('主語パターン最適化提案生成中にエラーが発生しました', {
        error: error instanceof Error ? error.message : String(error)
      });

      // エラー時はデフォルト提案を返す
      return this.createFallbackSubjectOptimization(subjectPatterns);
    }
  }

  /**
   * AIを使用した主語パターン最適化提案生成
   * @private
   * @param subjectPatterns 主語パターン分析結果
   * @param context コンテキスト情報
   * @returns 主語パターン最適化提案
   */
  private async generateSubjectOptimizationWithAI(
    subjectPatterns: SubjectPatternOptimizationRequest,
    context: any
  ): Promise<SubjectPatternOptimization> {
    try {
      // プロンプトの作成
      const prompt = `
あなたは日本語文章の構造に詳しい編集者です。以下の主語パターン分析結果をもとに、文章の改善提案を行ってください。

## 主語パターン分析
- 主語多様性スコア: ${subjectPatterns.subjectDiversityScore}（0〜1、高いほど多様）
- 繰り返されている主語:
${subjectPatterns.repeatedSubjects.map(s => `  - 「${s.subject}」が${s.count}回連続使用`).join('\n')}

## 作品情報
- ジャンル: ${context?.genre || '不明'}
- テーマ: ${context?.theme || '不明'}

## 指示
1. 主語パターンの問題点を特定してください（繰り返しの主語以外にも問題があれば）
2. 具体的な改善提案を5つ提示してください（例を含む具体的なものにしてください）

## 出力形式
以下のJSON形式で出力してください：
{
  "score": 主語多様性スコア,
  "problems": ["問題点1", "問題点2", ...],
  "suggestions": ["改善提案1", "改善提案2", ...]
}
`;

      // APIスロットリングを使用してAI生成を実行
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(prompt, {
          temperature: 0.3,
          purpose: 'suggestion',
          responseFormat: 'json'
        })
      );

      // デフォルト値を準備
      const defaultOptimization: SubjectPatternOptimization = {
        score: subjectPatterns.subjectDiversityScore,
        problems: [],
        suggestions: [
          "同じ主語の連続使用を避け、代名詞や省略を活用してください",
          "文の構造を変えて、主語以外の要素から文を始めることも検討してください",
          "日本語の特性を活かし、文脈が明確な場合は主語を省略してください"
        ]
      };

      // JsonParserを使用してレスポンスを解析
      const optimization = JsonParser.parseFromAIResponse<SubjectPatternOptimization>(
        response,
        defaultOptimization
      );

      // 結果の検証
      if (!Array.isArray(optimization.problems)) {
        optimization.problems = [];
      }

      if (!Array.isArray(optimization.suggestions) || optimization.suggestions.length === 0) {
        optimization.suggestions = defaultOptimization.suggestions;
      }

      // スコアを元の値で上書き
      optimization.score = subjectPatterns.subjectDiversityScore;

      return optimization;
    } catch (error) {
      logger.error('AIによる主語パターン最適化提案生成中にエラーが発生しました', {
        error: error instanceof Error ? error.message : String(error)
      });

      return this.createFallbackSubjectOptimization(subjectPatterns);
    }
  }

  /**
   * フォールバック用の主語パターン最適化提案作成
   * @private
   * @param subjectPatterns 主語パターン分析結果
   * @returns フォールバック最適化提案
   */
  private createFallbackSubjectOptimization(
    subjectPatterns: SubjectPatternOptimizationRequest
  ): SubjectPatternOptimization {
    // 繰り返し主語から問題を特定
    const problems = subjectPatterns.repeatedSubjects.map(subject =>
      `「${subject.subject}」が${subject.count}回連続で使用されています`
    );

    return {
      score: subjectPatterns.subjectDiversityScore,
      problems,
      suggestions: [
        "同じ主語（特にキャラクター名）を3回以上連続して使わないでください",
        "代名詞（「彼」「彼女」「その人」など）を適切に活用してください",
        "日本語の特性を活かし、文脈が明確な場合は主語を省略してください",
        "複数の文を接続詞や接続助詞で結んで一文にすることで、主語の繰り返しを減らしてください",
        "視点や語り手を変えることで、異なる主語から描写することも検討してください"
      ]
    };
  }

  /**
   * 文構造の改善提案を生成
   * 文の構造を改善するための提案を生成します
   * 
   * @param styleAnalysis 文体分析結果
   * @param context コンテキスト情報
   * @returns 文構造改善提案
   */
  async generateStructureRecommendations(
    styleAnalysis: StyleAnalysis,
    context: any
  ): Promise<StructureRecommendation[]> {
    try {
      // キャッシュキーの生成
      const cacheKey = `structure-rec-${this.hashObject(styleAnalysis)}-${context?.genre || ''}`;

      // キャッシュをチェック
      const cachedRecommendations = this.cache.get<StructureRecommendation[]>(cacheKey);
      if (cachedRecommendations) {
        logger.debug(`StyleOptimizationService: キャッシュから文構造改善提案を取得`);
        return cachedRecommendations;
      }

      logger.info('文構造改善提案を生成します');

      // AIを使用した改善提案生成
      const recommendations = await this.generateStructureRecommendationsWithAI(styleAnalysis, context);

      // キャッシュに保存
      this.cache.set(cacheKey, recommendations, this.defaultTTL);

      logger.info('文構造改善提案を生成しました', {
        recommendationsCount: recommendations.length
      });

      return recommendations;
    } catch (error) {
      logger.error('文構造改善提案生成中にエラーが発生しました', {
        error: error instanceof Error ? error.message : String(error)
      });

      // エラー時はデフォルト提案を返す
      return this.createFallbackStructureRecommendations(context);
    }
  }

  /**
   * AIを使用した文構造改善提案生成
   * @private
   * @param styleAnalysis 文体分析結果
   * @param context コンテキスト情報
   * @returns 文構造改善提案
   */
  private async generateStructureRecommendationsWithAI(
    styleAnalysis: StyleAnalysis,
    context: any
  ): Promise<StructureRecommendation[]> {
    try {
      // 文体分析結果を文字列化
      const analysisStr = JSON.stringify({
        avgSentenceLength: styleAnalysis.avgSentenceLength,
        sentenceVariety: styleAnalysis.sentenceVariety,
        vocabularyRichness: styleAnalysis.vocabularyRichness,
        narrativeVoice: styleAnalysis.narrativeVoice,
        tenseConsistency: styleAnalysis.tenseConsistency
      }, null, 2);

      // ジャンルとテーマ情報
      const genre = context?.genre || '';
      const theme = context?.theme || '';
      const tension = context?.tension || 0.5;

      // プロンプトの作成
      const prompt = `
あなたは小説の文構造の専門家です。以下の文体分析結果とコンテキスト情報に基づいて、文構造の改善提案を行ってください。

## 文体分析結果
${analysisStr}

## 作品情報
- ジャンル: ${genre}
- テーマ: ${theme}
- テンション値: ${tension}

## 指示
文構造の改善に焦点を当てた具体的な提案を5つ生成してください。各提案には以下の内容を含めてください：
- タイプ: 改善の種類（バリエーション、リズム、修飾語、主述関係など）
- 問題: 現在の文体における問題や改善点
- 提案: 具体的な改善アイデア
- 例: 改善前と改善後の具体例

## 出力形式
以下のJSON形式で出力してください：
[
  {
    "type": "改善タイプ",
    "issue": "問題点の説明",
    "suggestion": "具体的な改善提案",
    "example": {
      "before": "改善前の例",
      "after": "改善後の例"
    }
  },
  ...
]
`;

      // APIスロットリングを使用してAI生成を実行
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(prompt, {
          temperature: 0.4,
          purpose: 'suggestion',
          responseFormat: 'json'
        })
      );

      // JsonParserを使用してレスポンスを解析
      const recommendations = JsonParser.parseFromAIResponse<StructureRecommendation[]>(
        response,
        []
      );

      // 結果の検証
      if (!Array.isArray(recommendations) || recommendations.length === 0) {
        return this.createFallbackStructureRecommendations(context);
      }

      // 最大5つの提案に制限
      return recommendations.slice(0, 5).map(rec => this.validateStructureRecommendation(rec));
    } catch (error) {
      logger.error('AIによる文構造改善提案生成中にエラーが発生しました', {
        error: error instanceof Error ? error.message : String(error)
      });

      return this.createFallbackStructureRecommendations(context);
    }
  }

  /**
   * 文構造改善提案を検証する
   * @private
   * @param recommendation 文構造改善提案
   * @returns 検証後の文構造改善提案
   */
  private validateStructureRecommendation(recommendation: StructureRecommendation): StructureRecommendation {
    const validated: StructureRecommendation = { ...recommendation };

    // 必須フィールドが無い場合はデフォルト値を設定
    if (!validated.type) {
      validated.type = "構造改善";
    }

    if (!validated.issue) {
      validated.issue = "文構造に改善の余地があります";
    }

    if (!validated.suggestion) {
      validated.suggestion = "より効果的な文構造を検討してください";
    }

    if (!validated.example) {
      validated.example = {
        before: "改善前の例が提供されていません",
        after: "改善後の例が提供されていません"
      };
    } else if (!validated.example.before || !validated.example.after) {
      validated.example = {
        before: validated.example.before || "改善前の例が提供されていません",
        after: validated.example.after || "改善後の例が提供されていません"
      };
    }

    return validated;
  }

  /**
   * フォールバック用の文構造改善提案作成
   * @private
   * @param context コンテキスト情報
   * @returns フォールバック改善提案
   */
  private createFallbackStructureRecommendations(context: any): StructureRecommendation[] {
    // ジャンルに基づく調整
    const genre = (context?.genre || '').toLowerCase();

    // 基本的な提案
    const recommendations: StructureRecommendation[] = [
      {
        type: "文長のバリエーション",
        issue: "一定の長さの文が続くと単調に感じられます",
        suggestion: "短い文と長い文を意図的に組み合わせ、リズム感を生み出してください",
        example: {
          before: "彼は部屋に入った。彼は窓を開けた。彼は深呼吸をした。彼は机に向かった。",
          after: "彼は部屋に入り、窓を開けた。深呼吸をする。そして、静かに机に向かった。"
        }
      },
      {
        type: "主述の関係",
        issue: "主語と述語の距離が離れすぎると読みにくくなります",
        suggestion: "主語と述語の距離を適切に保ち、文の構造を明確にしてください",
        example: {
          before: "彼女は、長い廊下を通り、何人もの同僚に挨拶をしながら、時折立ち止まっては窓外の景色を眺め、オフィスに向かった。",
          after: "彼女はオフィスに向かった。長い廊下を通り、何人もの同僚に挨拶をしながら。時折立ち止まっては窓外の景色を眺めていた。"
        }
      },
      {
        type: "修飾語の配置",
        issue: "修飾語が多すぎると文が複雑になりすぎます",
        suggestion: "修飾語の量と配置を意識し、重要な情報が埋もれないようにしてください",
        example: {
          before: "赤くて大きくて丸い、とても鮮やかな色をした、表面がつるつるとした新鮮なリンゴを彼は手に取った。",
          after: "彼は手に取った。赤くて大きな、つるつるとした新鮮なリンゴを。鮮やかな色が目を引いた。"
        }
      }
    ];

    // ジャンル特化の提案を追加
    if (genre.includes('ミステリー') || genre.includes('推理')) {
      recommendations.push({
        type: "情報の小出し",
        issue: "重要な情報が一度に明かされると伏線として機能しません",
        suggestion: "重要な情報や手がかりは複数の文に分散させ、さりげなく提示してください",
        example: {
          before: "彼は血の付いたナイフを手袋をしたまま拾い、証拠を隠すために川に投げ捨てた。",
          after: "彼は手袋をしたまま、それを拾い上げた。刃に何かが付着している。後に川のせせらぎだけが、秘密を知ることになる。"
        }
      });
    } else if (genre.includes('ファンタジー')) {
      recommendations.push({
        type: "世界観の描写",
        issue: "ファンタジー世界の説明が長くなりがちです",
        suggestion: "世界観の説明は物語の進行に合わせて少しずつ行い、説明的にならないようにしてください",
        example: {
          before: "魔法の王国アルディアは、高い山々に囲まれ、魔法の力が満ち溢れ、七人の賢者が治め、千年の歴史を持つ古代から続く王国だった。",
          after: "アルディア王国の輪郭が山々の向こうに浮かび上がった。空気が肌に触れるたび、微かに震える。この地に満ちる魔法の力を感じた。"
        }
      });
    } else if (genre.includes('恋愛') || genre.includes('ロマンス')) {
      recommendations.push({
        type: "感情描写",
        issue: "感情の説明が直接的になりすぎることがあります",
        suggestion: "感情は行動や生理反応、周囲の描写を通して間接的に表現してください",
        example: {
          before: "彼女は彼に会えて嬉しかった。心臓がドキドキして、とても緊張した。",
          after: "彼の姿が見えた瞬間、足が勝手に走り出していた。頬が熱くなる。手のひらに爪が食い込むのも気にならない。"
        }
      });
    }

    return recommendations;
  }

  /**
   * 繰り返し表現の代替提案を生成
   * 繰り返し使用されている表現の代替案を提案します
   * 
   * @param repetitions 繰り返し表現のリスト
   * @param context コンテキスト情報
   * @returns 繰り返し表現の代替提案
   */
  async generateRepetitionAlternatives(
    repetitions: string[],
    context: any
  ): Promise<RepetitionAlternative[]> {
    try {
      if (!repetitions || repetitions.length === 0) {
        logger.warn('繰り返し表現が空のため、代替提案は生成しません');
        return [];
      }

      // キャッシュキーの生成
      const cacheKey = `rep-alt-${this.hashObject(repetitions)}`;

      // キャッシュをチェック
      const cachedAlternatives = this.cache.get<RepetitionAlternative[]>(cacheKey);
      if (cachedAlternatives) {
        logger.debug(`StyleOptimizationService: キャッシュから繰り返し表現代替提案を取得`);
        return cachedAlternatives;
      }

      logger.info('繰り返し表現の代替提案を生成します', {
        repetitionsCount: repetitions.length
      });

      // AIを使用した代替提案生成
      const alternatives = await this.generateRepetitionAlternativesWithAI(repetitions, context);

      // キャッシュに保存
      this.cache.set(cacheKey, alternatives, this.defaultTTL);

      logger.info('繰り返し表現の代替提案を生成しました', {
        alternativesCount: alternatives.length
      });

      return alternatives;
    } catch (error) {
      logger.error('繰り返し表現代替提案生成中にエラーが発生しました', {
        error: error instanceof Error ? error.message : String(error)
      });

      // エラー時はデフォルト提案を返す
      return this.createFallbackRepetitionAlternatives(repetitions);
    }
  }

  /**
   * AIを使用した繰り返し表現代替提案生成
   * @private
   * @param repetitions 繰り返し表現のリスト
   * @param context コンテキスト情報
   * @returns 繰り返し表現の代替提案
   */
  private async generateRepetitionAlternativesWithAI(
    repetitions: string[],
    context: any
  ): Promise<RepetitionAlternative[]> {
    try {
      // 最大10個の表現に制限
      const limitedRepetitions = repetitions.slice(0, 10);

      // ジャンルとテーマ情報
      const genre = context?.genre || '';
      const theme = context?.theme || '';

      // プロンプトの作成
      const prompt = `
あなは表現の多様化を専門とするエディターです。以下の繰り返し使用されている表現に対して、代替表現を提案してください。

## 作品情報
- ジャンル: ${genre}
- テーマ: ${theme}

## 繰り返し表現
${limitedRepetitions.map((rep, idx) => `${idx + 1}. "${rep}"`).join('\n')}

## 指示
各表現に対して3〜5の多様な代替案を提供してください。以下の点を考慮してください：
- ジャンルの雰囲気に合った表現選択
- 日本語の自然さと読みやすさ
- 原文のニュアンスを維持しつつ表現を多様化
- それぞれの代替案は異なる表現であること

## 出力形式
以下のJSON配列形式で代替表現を提案してください：
[
  {
    "original": "元の表現",
    "alternatives": ["代替1", "代替2", "代替3", ...],
    "context": "この表現が使われる一般的な文脈"
  },
  ...
]
`;

      // APIスロットリングを使用してAI生成を実行
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(prompt, {
          temperature: 0.4,
          purpose: 'suggestion',
          responseFormat: 'json'
        })
      );

      // JsonParserを使用してレスポンスを解析
      const alternatives = JsonParser.parseFromAIResponse<RepetitionAlternative[]>(response, []);

      // 結果の検証
      if (!Array.isArray(alternatives) || alternatives.length === 0) {
        return this.createFallbackRepetitionAlternatives(repetitions);
      }

      // 各代替提案を検証
      return alternatives.map(alt => this.validateRepetitionAlternative(alt));
    } catch (error) {
      logger.error('AIによる繰り返し表現代替提案生成中にエラーが発生しました', {
        error: error instanceof Error ? error.message : String(error)
      });

      return this.createFallbackRepetitionAlternatives(repetitions);
    }
  }

  /**
   * 繰り返し表現代替提案を検証する
   * @private
   * @param alternative 繰り返し表現代替提案
   * @returns 検証後の繰り返し表現代替提案
   */
  private validateRepetitionAlternative(alternative: RepetitionAlternative): RepetitionAlternative {
    const validated: RepetitionAlternative = { ...alternative };

    // 必須フィールドが無い場合はデフォルト値を設定
    if (!validated.original) {
      validated.original = "不明な表現";
    }

    if (!Array.isArray(validated.alternatives) || validated.alternatives.length === 0) {
      validated.alternatives = ["代替表現なし"];
    }

    if (!validated.context) {
      validated.context = "一般的な文脈";
    }

    return validated;
  }

  /**
   * フォールバック用の繰り返し表現代替提案作成
   * @private
   * @param repetitions 繰り返し表現のリスト
   * @returns フォールバック代替提案
   */
  private createFallbackRepetitionAlternatives(repetitions: string[]): RepetitionAlternative[] {
    // 汎用的な代替表現マップ
    const genericAlternatives: { [key: string]: string[] } = {
      "見た": ["目にした", "観察した", "眺めた", "凝視した"],
      "言った": ["告げた", "話した", "述べた", "語った"],
      "思った": ["考えた", "感じた", "推測した", "理解した"],
      "走った": ["駆けた", "疾走した", "駆け出した", "突進した"],
      "美しい": ["麗しい", "綺麗な", "艶やかな", "華麗な"],
      "突然": ["不意に", "唐突に", "急に", "いきなり"],
      "ゆっくりと": ["徐々に", "ゆったりと", "ゆるやかに", "じっくりと"],
      "静かに": ["穏やかに", "物静かに", "黙々と", "音もなく"]
    };

    return repetitions.map(rep => {
      // 汎用マップに存在するか確認
      if (genericAlternatives[rep]) {
        return {
          original: rep,
          alternatives: genericAlternatives[rep],
          context: "一般的な文脈"
        };
      }

      // 存在しない場合はデフォルト値
      return {
        original: rep,
        alternatives: [
          "代替表現1（AIが生成できませんでした）",
          "代替表現2（AIが生成できませんでした）",
          "代替表現3（AIが生成できませんでした）"
        ],
        context: "一般的な文脈"
      };
    });
  }

  /**
   * オブジェクトからハッシュ値を生成（キャッシュキー用）
   * @private
   * @param obj オブジェクト
   * @returns ハッシュ文字列
   */
  private hashObject(obj: any): string {
    const str = JSON.stringify(obj);
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return hash.toString();
  }
}