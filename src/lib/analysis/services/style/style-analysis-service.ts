/**
 * @fileoverview 文体と表現パターンの分析サービス実装
 * @description
 * テキストの文体特性、表現パターン、主語使用パターンを分析し、文体の最適化と
 * 言語パターンの多様化のための推奨事項を提供します。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiAdapter } from '../../adapters/gemini-adapter';
import { JsonParser } from '@/lib/utils/json-parser';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { storageProvider } from '@/lib/storage';
import { StorageAdapter } from '../../adapters/storage-adapter';

import { ExpressionUsageResult } from '@/lib/analysis/core/types'
import {
  StyleAnalysis,
  StyleGuidance,
  ExpressionPatterns,
  ExpressionAlternatives
} from '@/types/generation';

import { IStyleAnalysisService } from './interfaces';
import { ICacheStorage } from '@/lib/analysis/core/interfaces';
import { CacheStorage } from '@/lib/analysis/utils/cache-storage';

// 主語パターン分析用のインターフェース
interface SubjectPatternAnalysis {
  repeatedSubjects: RepeatedSubjectPattern[];
  subjectDiversityScore: number;
  suggestions: string[];
}

// 繰り返しパターンの詳細
interface RepeatedSubjectPattern {
  subject: string;
  count: number;
  startIndex: number;
  endIndex: number;
}

/**
 * @class StyleAnalysisService
 * @description 文体と表現パターンの分析を行うサービス
 * 
 * @implements IStyleAnalysisService
 */
export class StyleAnalysisService implements IStyleAnalysisService {
  // ✅ 統一キャッシュ
  private cache: ICacheStorage;

  // 初期化フラグ
  private initialized: boolean = false;

  // キャッシュTTL (1時間)
  private cacheTTL: number = 3600000;

  /**
   * コンストラクタ
   * @param geminiAdapter GeminiAPIアダプタ
   * @param storageAdapter ストレージアダプタ
   * @param cache キャッシュストレージ（オプション）
   */
  constructor(
    private geminiAdapter: GeminiAdapter,
    private storageAdapter: StorageAdapter,
    cache?: ICacheStorage
  ) {
    this.cache = cache || new CacheStorage();
    logger.info('StyleAnalysisService: インスタンス化');
  }

  /**
   * 初期化
   * キャッシュの読み込みなど、初期化処理を行います
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.debug('StyleAnalysisService: 既に初期化済み');
      return;
    }

    try {
      logger.info('StyleAnalysisService: 初期化開始');
      this.initialized = true;
      logger.info('StyleAnalysisService: 初期化完了');
    } catch (error) {
      logger.error('StyleAnalysisService: 初期化中にエラーが発生', {
        error: error instanceof Error ? error.message : String(error)
      });
      // 初期化エラーでも続行可能に
      this.initialized = true;
    }
  }

  /**
   * 文体分析
   * テキストの文体特性を分析します
   * 
   * @param content テキスト内容
   * @returns 文体分析結果
   */
  async analyzeStyle(content: string): Promise<StyleAnalysis> {
    await this.ensureInitialized();

    try {
      // キャッシュキーの生成（テキスト内容のハッシュ）
      const cacheKey = `style_analysis_${this.hashContent(content)}`;

      // 統一キャッシュから取得
      const cachedResult = this.cache.get<StyleAnalysis>(cacheKey);
      if (cachedResult) {
        logger.debug('StyleAnalysisService: キャッシュから文体分析結果を取得');
        return cachedResult;
      }

      logger.info('StyleAnalysisService: 文体分析を実行');

      // 基本的なテキスト統計情報を収集
      const basicStats = this.analyzeBasicTextStatistics(content);

      // AIによる拡張分析（長いテキストの場合）
      let aiAnalysis: Partial<StyleAnalysis> = {};

      if (content.length > 500) {
        aiAnalysis = await this.analyzeStyleWithAI(content);
      }

      // 基本統計とAI分析を組み合わせた結果
      const result: StyleAnalysis = {
        avgSentenceLength: basicStats.avgSentenceLength,
        sentenceVariety: aiAnalysis.sentenceVariety || basicStats.sentenceVariety,
        vocabularyRichness: aiAnalysis.vocabularyRichness || basicStats.vocabularyRichness,
        narrativeVoice: aiAnalysis.narrativeVoice,
        tenseConsistency: aiAnalysis.tenseConsistency,
        sentimentBalance: aiAnalysis.sentimentBalance
      };

      // 統一キャッシュに保存（1時間有効）
      this.cache.set(cacheKey, result, 3600000);

      return result;
    } catch (error) {
      logger.error('StyleAnalysisService: 文体分析中にエラーが発生', {
        error: error instanceof Error ? error.message : String(error)
      });

      // エラー時は基本的な分析結果を返す
      return {
        avgSentenceLength: 20,
        sentenceVariety: 0.5,
        vocabularyRichness: 0.5
      };
    }
  }

  /**
   * 表現パターン分析
   * テキストの表現パターンを分析します
   * 
   * @param content テキスト内容
   * @returns 表現パターン分析結果
   */
  async analyzeExpressionPatterns(content: string): Promise<ExpressionPatterns> {
    await this.ensureInitialized();

    try {
      // キャッシュキーの生成（テキスト内容のハッシュ）
      const cacheKey = `expression_patterns_${this.hashContent(content)}`;

      // 統一キャッシュをチェック
      const cachedResult = this.cache.get<ExpressionPatterns>(cacheKey);
      if (cachedResult) {
        logger.debug('StyleAnalysisService: キャッシュから表現パターン分析結果を取得');
        return cachedResult;
      }

      logger.info('StyleAnalysisService: 表現パターン分析を実行');

      // ルールベースの基本パターン抽出
      const basicPatterns = this.extractBasicPatterns(content);

      // AIを使用した拡張パターン抽出（テキストが十分長い場合）
      let aiPatterns: ExpressionPatterns = {
        verbPhrases: [],
        adjectivalExpressions: [],
        dialoguePatterns: [],
        conjunctions: [],
        sentenceStructures: []
      };

      if (content.length > 1000) {
        try {
          // APIスロットリングを使用して制御されたリクエストを実行
          aiPatterns = await apiThrottler.throttledRequest(() =>
            this.extractPatternsWithAI(content)
          );
        } catch (aiError) {
          logger.warn('StyleAnalysisService: AI表現パターン分析に失敗', {
            error: aiError instanceof Error ? aiError.message : String(aiError)
          });
        }
      }

      // 基本分析とAI分析を統合
      const mergedPatterns: ExpressionPatterns = { ...aiPatterns };
      for (const category in basicPatterns) {
        if (!mergedPatterns[category]) mergedPatterns[category] = [];
        mergedPatterns[category] = [...mergedPatterns[category], ...basicPatterns[category]];
      }

      // 重複を排除
      for (const category in mergedPatterns) {
        const seenExpressions = new Set<string>();
        mergedPatterns[category] = mergedPatterns[category].filter(item => {
          if (seenExpressions.has(item.expression)) return false;
          seenExpressions.add(item.expression);
          return true;
        });

        // 頻度順にソート
        mergedPatterns[category].sort((a, b) => b.frequency - a.frequency);
      }

      // 統一キャッシュに保存
      this.cache.set(cacheKey, mergedPatterns, this.cacheTTL);

      return mergedPatterns;
    } catch (error) {
      logger.error('StyleAnalysisService: 表現パターン分析中にエラーが発生', {
        error: error instanceof Error ? error.message : String(error)
      });

      // エラー時は空のパターンセットを返す
      return {
        verbPhrases: [],
        adjectivalExpressions: [],
        dialoguePatterns: [],
        conjunctions: [],
        sentenceStructures: []
      };
    }
  }

  /**
   * 主語パターン分析
   * テキストの主語使用パターンを分析します
   * 
   * @param content テキスト内容
   * @returns 主語パターン分析結果
   */
  async analyzeSubjectPatterns(content: string): Promise<SubjectPatternAnalysis> {
    await this.ensureInitialized();

    try {
      // キャッシュキーの生成（テキスト内容のハッシュ）
      const cacheKey = `subject_patterns_${this.hashContent(content)}`;

      // 統一キャッシュをチェック
      const cachedResult = this.cache.get<SubjectPatternAnalysis>(cacheKey);
      if (cachedResult) {
        logger.debug('StyleAnalysisService: キャッシュから主語パターン分析結果を取得');
        return cachedResult;
      }

      logger.info('StyleAnalysisService: 主語パターン分析を実行');

      // 文を抽出（句点で分割）
      const sentences = this.extractSentences(content);

      // 主語を抽出
      const subjects = this.extractSubjects(sentences);

      // 主語の繰り返しパターンを検出
      const repeatedSubjects = this.detectRepeatedSubjects(subjects);

      // 主語多様性スコアを計算
      const subjectDiversityScore = this.calculateSubjectDiversityScore(subjects);

      // 改善提案を生成
      const suggestions = this.generateSubjectDiversitySuggestions(repeatedSubjects);

      const result: SubjectPatternAnalysis = {
        repeatedSubjects,
        subjectDiversityScore,
        suggestions
      };

      // 統一キャッシュに保存
      this.cache.set(cacheKey, result, this.cacheTTL);

      return result;
    } catch (error) {
      logger.error('StyleAnalysisService: 主語パターン分析中にエラーが発生', {
        error: error instanceof Error ? error.message : String(error)
      });

      // エラー時はデフォルト値を返す
      return {
        repeatedSubjects: [],
        subjectDiversityScore: 0.5,
        suggestions: []
      };
    }
  }

  /**
   * 章の表現を分析します
   * 
   * テキスト内の特徴的な表現パターン、繰り返し使用されている表現などを
   * 検出し分析します。
   * 
   * @param {string} content テキスト内容
   * @returns {Promise<ExpressionUsageResult>} 分析結果
   */
  async analyzeExpressions(content: string): Promise<ExpressionUsageResult> {
    await this.ensureInitialized();

    // インターフェース定義（必要に応じて型定義ファイルに移動）
    interface ExpressionUsage {
      expression: string;
      count: number;
      firstUsedPosition?: number;
      lastUsedPosition?: number;
      contexts?: string[];
      category?: 'DESCRIPTION' | 'DIALOGUE' | 'ACTION' | 'TRANSITION';
    }

    interface ExpressionUsageResult {
      newExpressions: string[];
      repeatedExpressions: string[];
      totalTracked: number;
      diversityScore: number;
    }

    try {
      // キャッシュキーの生成（テキスト内容のハッシュ）
      const cacheKey = `expressions_${this.hashContent(content)}`;

      // 統一キャッシュをチェック
      const cachedResult = this.cache.get<ExpressionUsageResult>(cacheKey);
      if (cachedResult) {
        logger.debug('StyleAnalysisService: キャッシュから表現分析結果を取得');
        return cachedResult;
      }

      logger.info('StyleAnalysisService: 表現分析を実行');

      // 新しい表現と繰り返された表現を追跡
      const newExpressions: string[] = [];
      const repeatedExpressions: string[] = [];
      const expressionTracker = new Map<string, ExpressionUsage>();

      // ルールベースで表現を抽出（基本処理）
      const extractedExpressions = this.extractExpressionsRuleBased(content);

      // AIによる分析（可能な場合）
      let aiExtractedExpressions: string[] = [];
      try {
        if (content.length > 1000) {
          aiExtractedExpressions = await this.extractExpressionsWithAI(content);
        }
      } catch (error) {
        logger.warn('StyleAnalysisService: AI表現抽出に失敗、ルールベースのみを使用', {
          error: error instanceof Error ? error.message : String(error)
        });
      }

      // ルールベースとAIの結果を結合
      const allExpressions = [...new Set([...extractedExpressions, ...aiExtractedExpressions])];

      // 各表現を処理
      for (const expression of allExpressions) {
        // 表現が既に追跡されているか確認
        if (expressionTracker.has(expression)) {
          // 既存の表現を更新
          const usage = expressionTracker.get(expression)!;
          usage.count++;

          // コンテキストを追加（最大5つまで）
          const context = this.extractExpressionContext(content, expression);
          if (context && usage.contexts) {
            if (usage.contexts.length < 5) {
              usage.contexts.push(context);
            }
          }

          // 繰り返し表現としてマーク
          if (usage.count >= 3) {
            repeatedExpressions.push(expression);
          }
        } else {
          // 新しい表現を追加
          const newUsage: ExpressionUsage = {
            expression,
            count: 1,
            contexts: this.extractExpressionContext(content, expression) ?
              [this.extractExpressionContext(content, expression) as string] :
              []
          };

          // カテゴリ分類を試行
          newUsage.category = this.categorizeExpression(expression);

          expressionTracker.set(expression, newUsage);
          newExpressions.push(expression);
        }
      }

      // 多様性スコアの計算
      const diversityScore = this.calculateExpressionDiversityScore(
        content,
        allExpressions.length,
        repeatedExpressions.length
      );

      const result: ExpressionUsageResult = {
        newExpressions,
        repeatedExpressions,
        totalTracked: allExpressions.length,
        diversityScore
      };

      // 統一キャッシュに保存
      this.cache.set(cacheKey, result, this.cacheTTL);

      return result;
    } catch (error) {
      logger.error('StyleAnalysisService: 表現分析中にエラーが発生', {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        newExpressions: [],
        repeatedExpressions: [],
        totalTracked: 0,
        diversityScore: 0.5 // デフォルト値
      };
    }
  }

  /**
   * ルールベースで表現を抽出します
   * 
   * @private
   * @param {string} content テキスト内容
   * @returns {string[]} 抽出された表現の配列
   */
  private extractExpressionsRuleBased(content: string): string[] {
    const expressions: string[] = [];

    // 特徴的な表現パターンを抽出する正規表現
    const patterns = [
      // 比喩表現パターン
      /([一-龯ぁ-んァ-ヶ]{2,})(のような|みたいな|のごとく|さながら)([一-龯ぁ-んァ-ヶ]{2,})/g,

      // 擬音語・擬態語パターン
      /[ぁ-んァ-ヶ]{2,}と([一-龯ぁ-んァ-ヶ]{2,})/g,

      // 特徴的な終わり方のフレーズパターン
      /([一-龯ぁ-んァ-ヶ]{3,})(だった|であった|になった)/g,

      // 特徴的な形容表現
      /([一-龯ぁ-んァ-ヶ]{2,})(すぎる|きわまる|極まる)/g,

      // 独特の副詞フレーズ
      /(まるで|あたかも|さも|いかにも)([一-龯ぁ-んァ-ヶ]{2,})/g,

      // 特徴的な繰り返し表現
      /([一-龯ぁ-んァ-ヶ]{1,2})([一-龯ぁ-んァ-ヶ]{1,2})\1\2/g,

      // 特徴的な修飾フレーズ
      /([一-龯ぁ-んァ-ヶ]{2,}的な)([一-龯ぁ-んァ-ヶ]{2,})/g
    ];

    // パターンに一致する表現を抽出
    patterns.forEach(pattern => {
      const matches = Array.from(content.matchAll(pattern));
      for (const match of matches) {
        if (match[0].length > 3 && match[0].length < 20) { // 長さによるフィルタリング
          expressions.push(match[0]);
        }
      }
    });

    // 特徴的な文末フレーズの検出
    const sentenceEndPattern = /([^。！？]{5,15})[。！？]/g;
    const sentenceEnds = Array.from(content.matchAll(sentenceEndPattern));
    const endPhrases: Record<string, number> = {};

    for (const match of sentenceEnds) {
      const phrase = match[1];
      endPhrases[phrase] = (endPhrases[phrase] || 0) + 1;
    }

    // 複数回使用されている文末フレーズを追加
    for (const [phrase, count] of Object.entries(endPhrases)) {
      if (count >= 2) {
        expressions.push(phrase);
      }
    }

    return [...new Set(expressions)]; // 重複を削除
  }

  /**
   * AIを使用して表現を抽出します
   * 
   * @private
   * @param {string} content テキスト内容
   * @returns {Promise<string[]>} 抽出された表現の配列
   */
  private async extractExpressionsWithAI(content: string): Promise<string[]> {
    try {
      // テキストが長すぎる場合は適切な長さに切り詰める
      const truncatedContent = content.length > 6000
        ? content.substring(0, 6000) + '...'
        : content;

      const prompt = `
以下の物語テキストから、特徴的な表現や繰り返し使用されているフレーズを抽出してください。
以下のような表現に注目してください：
1. 比喩表現や独特の形容
2. 特徴的な文末表現や修飾表現
3. 作者の個性が表れる表現パターン
4. 繰り返し使用されている言い回し

物語テキスト:
${truncatedContent}

特徴的な表現のみをリストで出力してください。各表現は5-15字程度の短い句や文節で、
物語の中で繰り返し使用されたりスタイルを特徴づけるものを選んでください。
表現だけをシンプルなJSON配列で出力してください：
["表現1", "表現2", "表現3", ...]
`;

      // APIスロットリングを使用して制御されたリクエストを実行
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateContent(prompt, {
          temperature: 0.1,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );

      // JsonParserを使用してレスポンスを解析
      const expressions = JsonParser.parseFromAIResponse<string[]>(response, []);

      // 配列かどうか検証し、無効な要素をフィルタリング
      if (!Array.isArray(expressions)) {
        logger.warn('StyleAnalysisService: AIレスポンスが有効な配列ではありません', {
          responseType: typeof expressions,
          responsePreview: response.substring(0, 200)
        });
        return [];
      }

      // 有効な文字列だけをフィルタリング
      const validExpressions = expressions.filter(expr =>
        typeof expr === 'string' && expr.trim().length > 0
      );

      logger.info(`StyleAnalysisService: ${validExpressions.length}の表現を抽出しました`);
      return validExpressions;
    } catch (error) {
      logger.error('StyleAnalysisService: AI表現抽出中にエラーが発生', {
        error: error instanceof Error ? error.message : String(error)
      });
      // エラー時は空の配列を返す
      return [];
    }
  }

  /**
   * 表現のコンテキストを抽出します
   * 
   * @private
   * @param {string} content テキスト内容
   * @param {string} expression 表現
   * @returns {string|null} 表現のコンテキスト
   */
  private extractExpressionContext(content: string, expression: string): string | null {
    try {
      const escapedExpression = expression.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`[^。！？]{0,20}${escapedExpression}[^。！？]{0,20}`, 'g');
      const match = regex.exec(content);

      if (match) {
        return match[0].trim();
      }

      return null;
    } catch (error) {
      logger.warn(`StyleAnalysisService: コンテキスト抽出に失敗: ${expression}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * 表現をカテゴリに分類します
   * 
   * @private
   * @param {string} expression 表現
   * @returns {string|undefined} カテゴリ
   */
  private categorizeExpression(expression: string): 'DESCRIPTION' | 'DIALOGUE' | 'ACTION' | 'TRANSITION' | undefined {
    // 簡易的なカテゴリ分類ルール
    if (expression.includes('「') || expression.includes('」')) {
      return 'DIALOGUE';
    } else if (expression.includes('ように') || expression.includes('ごとく') || expression.includes('さながら')) {
      return 'DESCRIPTION';
    } else if (expression.includes('した') || expression.includes('動いた') || expression.includes('行った')) {
      return 'ACTION';
    } else if (expression.includes('その後') || expression.includes('やがて') || expression.includes('しばらく')) {
      return 'TRANSITION';
    }

    return undefined;
  }

  /**
   * 表現の多様性スコアを計算します
   * 
   * @private
   * @param {string} content テキスト内容
   * @param {number} expressionCount 抽出された表現の数
   * @param {number} repeatedCount 繰り返し表現の数
   * @returns {number} 多様性スコア（0-1）
   */
  private calculateExpressionDiversityScore(
    content: string,
    expressionCount: number,
    repeatedCount: number
  ): number {
    // テキスト長に対する表現数の比率に基づいてスコアを計算
    const textLength = content.length;
    const normalizedExpressionCount = expressionCount / (textLength / 1000);

    // 繰り返し率を計算
    const repetitionFactor = repeatedCount > 0
      ? repeatedCount / expressionCount
      : 0;

    // 多様性スコアの計算（0-1の範囲）
    let score = 0.5 + (normalizedExpressionCount * 0.3) - (repetitionFactor * 0.5);

    // 範囲を0-1に制限
    return Math.max(0, Math.min(1, score));
  }

  // =========================================================================
  // 以下、プライベートヘルパーメソッド
  // =========================================================================

  /**
   * 初期化状態を確認し、必要に応じて初期化を実行
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * テキスト内容からハッシュ値を生成
   * キャッシュキーとして使用
   * 
   * @param content テキスト内容
   * @returns ハッシュ文字列
   */
  private hashContent(content: string): string {
    // 単純なハッシュ関数
    let hash = 0;
    if (content.length === 0) return hash.toString();

    // 最初の5000文字だけを使用（長すぎるテキストの処理を効率化）
    const truncatedContent = content.substring(0, 5000);

    for (let i = 0; i < truncatedContent.length; i++) {
      const char = truncatedContent.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit整数に変換
    }

    return hash.toString();
  }

  /**
   * 基本的なテキスト統計情報を分析
   * 
   * @param content テキスト内容
   * @returns 基本統計分析結果
   */
  private analyzeBasicTextStatistics(content: string): {
    avgSentenceLength: number;
    sentenceVariety: number;
    vocabularyRichness: number;
  } {
    try {
      // 文を抽出
      const sentences = this.extractSentences(content);
      if (sentences.length === 0) {
        return {
          avgSentenceLength: 0,
          sentenceVariety: 0.5,
          vocabularyRichness: 0.5
        };
      }

      // 平均文長を計算
      const sentenceLengths = sentences.map(s => s.length);
      const avgSentenceLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentences.length;

      // 文長の変動係数を計算（文の長さの多様性）
      const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgSentenceLength, 2), 0) / sentences.length;
      const stdDev = Math.sqrt(variance);
      const sentenceVariety = Math.min(1, Math.max(0, stdDev / avgSentenceLength));

      // 語彙の豊かさを計算
      const words = content
        .replace(/[、。！？「」『』（）｛｝［］…—]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 0);

      const uniqueWords = new Set(words);
      const vocabularyRichness = Math.min(1, uniqueWords.size / Math.sqrt(words.length));

      return {
        avgSentenceLength,
        sentenceVariety,
        vocabularyRichness
      };
    } catch (error) {
      logger.warn('StyleAnalysisService: 基本テキスト統計分析中にエラーが発生', {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        avgSentenceLength: 20,
        sentenceVariety: 0.5,
        vocabularyRichness: 0.5
      };
    }
  }

  /**
   * AIを使用した文体分析
   * 
   * @param content テキスト内容
   * @returns AIによる文体分析結果
   */
  private async analyzeStyleWithAI(content: string): Promise<Partial<StyleAnalysis>> {
    try {
      // テキストが長すぎる場合は適切な長さに切り詰める
      const truncatedContent = content.length > 6000
        ? content.substring(0, 6000) + '...'
        : content;

      const prompt = `
以下の小説テキストの文体を分析し、以下の特性を評価してください：

1. 平均文長（文字数）
2. 文のバリエーション（0-1の値、高いほど多様）
3. 語彙の豊かさ（0-1の値、高いほど豊か）
4. 語りの視点（一人称・三人称など）
5. 時制の一貫性（0-1の値、高いほど一貫）
6. 感情のバランス（ポジティブ・ネガティブのバランス、0-1で0は完全にネガティブ、1は完全にポジティブ）

テキスト:
${truncatedContent}

以下のJSON形式で結果を返してください：
{
  "avgSentenceLength": 数値,
  "sentenceVariety": 数値(0-1),
  "vocabularyRichness": 数値(0-1),
  "narrativeVoice": "一人称" or "三人称" or "その他",
  "tenseConsistency": 数値(0-1),
  "sentimentBalance": 数値(0-1)
}
`;

      // APIスロットリングを使用してAI分析を実行
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateContent(prompt, {
          temperature: 0.1,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );

      // JsonParserを使用してレスポンスを解析
      const defaultResponse: Partial<StyleAnalysis> = {
        avgSentenceLength: 20,
        sentenceVariety: 0.5,
        vocabularyRichness: 0.5
      };

      return JsonParser.parseFromAIResponse<Partial<StyleAnalysis>>(response, defaultResponse);
    } catch (error) {
      logger.warn('StyleAnalysisService: AI文体分析中にエラーが発生', {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        avgSentenceLength: 20,
        sentenceVariety: 0.5,
        vocabularyRichness: 0.5
      };
    }
  }

  /**
   * AIを使用した表現パターン抽出
   * 
   * @param content テキスト内容
   * @returns AIによる表現パターン分析結果
   */
  private async extractPatternsWithAI(content: string): Promise<ExpressionPatterns> {
    try {
      // テキストが長すぎる場合は適切な長さに切り詰める
      const truncatedContent = content.length > 6000
        ? content.substring(0, 6000) + '...'
        : content;

      const prompt = `
以下の小説テキストから、繰り返し使用されている表現パターンを抽出してください。
表現パターンを以下のカテゴリに分類してください：

1. 動詞フレーズ（例：「歩き出した」「考え始めた」）
2. 形容表現（例：「空のような目」「雪のように白い」）
3. 会話表現（例：「〜と尋ねた」「〜と叫んだ」）
4. 接続語（例：「しかし」「それゆえに」）
5. 文構造パターン（例：「〜は〜である」「〜ながら〜した」）

テキスト:
${truncatedContent}

各カテゴリごとに、出現頻度2回以上の表現パターンを抽出し、下記のJSON形式で出力してください：
{
  "verbPhrases": [
    { "expression": "表現パターン", "frequency": 出現回数 }
  ],
  "adjectivalExpressions": [
    { "expression": "表現パターン", "frequency": 出現回数 }
  ],
  "dialoguePatterns": [
    { "expression": "表現パターン", "frequency": 出現回数 }
  ],
  "conjunctions": [
    { "expression": "表現パターン", "frequency": 出現回数 }
  ],
  "sentenceStructures": [
    { "expression": "表現パターン", "frequency": 出現回数 }
  ]
}
`;

      // APIスロットリングを使用してAI分析を実行
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateContent(prompt, {
          temperature: 0.1,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );

      // デフォルト値
      const defaultPatterns: ExpressionPatterns = {
        verbPhrases: [],
        adjectivalExpressions: [],
        dialoguePatterns: [],
        conjunctions: [],
        sentenceStructures: []
      };

      // JsonParserを使用してレスポンスを解析
      return JsonParser.parseFromAIResponse<ExpressionPatterns>(response, defaultPatterns);
    } catch (error) {
      logger.warn('StyleAnalysisService: AI表現パターン抽出中にエラーが発生', {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        verbPhrases: [],
        adjectivalExpressions: [],
        dialoguePatterns: [],
        conjunctions: [],
        sentenceStructures: []
      };
    }
  }

  /**
   * テキストから文を抽出
   * 
   * @param text テキスト内容
   * @returns 抽出された文の配列
   */
  private extractSentences(text: string): string[] {
    // 日本語の句点で分割し、空の文を除外
    return text.split(/[。！？]/).filter(s => s.trim().length > 0);
  }

  /**
   * 文から主語を抽出
   * 
   * @param sentences 文の配列
   * @returns 主語の配列
   */
  private extractSubjects(sentences: string[]): string[] {
    const subjects: string[] = [];

    for (const sentence of sentences) {
      // 「XXは」「XXが」パターンで主語を検出
      const match = sentence.trim().match(/^([^\s]{1,10})(は|が)/);
      if (match) {
        subjects.push(match[1]); // 助詞を除いた主語部分
      } else {
        subjects.push(""); // 主語が検出できない場合
      }
    }

    return subjects;
  }

  /**
   * 連続して使用されている主語を検出
   * 
   * @param subjects 主語の配列
   * @returns 繰り返しパターンの配列
   */
  private detectRepeatedSubjects(subjects: string[]): RepeatedSubjectPattern[] {
    const patterns: RepeatedSubjectPattern[] = [];
    let currentSubject = "";
    let count = 0;
    let startIndex = 0;

    for (let i = 0; i < subjects.length; i++) {
      const subject = subjects[i];

      if (subject && subject === currentSubject) {
        count++;
      } else {
        // 3回以上連続する場合に記録
        if (count >= 3 && currentSubject) {
          patterns.push({
            subject: currentSubject,
            count,
            startIndex,
            endIndex: i - 1
          });
        }

        // 新しい主語の記録開始
        currentSubject = subject;
        count = subject ? 1 : 0;
        startIndex = i;
      }
    }

    // 最後の主語パターンを処理
    if (count >= 3 && currentSubject) {
      patterns.push({
        subject: currentSubject,
        count,
        startIndex,
        endIndex: subjects.length - 1
      });
    }

    return patterns;
  }

  /**
   * 主語の多様性スコアを計算
   * 
   * @param subjects 主語の配列
   * @returns 多様性スコア（0-1、高いほど多様）
   */
  private calculateSubjectDiversityScore(subjects: string[]): number {
    // 有効な主語（空でない）を抽出
    const validSubjects = subjects.filter(s => s.length > 0);

    if (validSubjects.length < 5) return 1.0; // 主語が少なすぎる場合は満点

    // ユニークな主語の比率
    const uniqueSubjects = new Set(validSubjects);
    const uniqueRatio = uniqueSubjects.size / validSubjects.length;

    // 連続使用率を計算
    let consecutiveCount = 0;
    for (let i = 1; i < validSubjects.length; i++) {
      if (validSubjects[i] === validSubjects[i - 1] && validSubjects[i] !== '') {
        consecutiveCount++;
      }
    }
    const consecutiveRatio = consecutiveCount / Math.max(1, validSubjects.length - 1);

    // ユニーク率と非連続率から総合スコアを計算
    // 重み付け: ユニーク率60%、非連続率40%
    const score = (uniqueRatio * 0.6) + ((1 - consecutiveRatio) * 0.4);

    return Math.max(0, Math.min(1, score));
  }

  /**
   * 主語の多様性に関する改善提案を生成
   * 
   * @param repeatedSubjects 主語の繰り返しパターン
   * @returns 改善提案の配列
   */
  private generateSubjectDiversitySuggestions(repeatedSubjects: RepeatedSubjectPattern[]): string[] {
    const suggestions: string[] = [];

    if (repeatedSubjects.length > 0) {
      suggestions.push("同じ主語（特にキャラクター名）を3回以上連続して使わないでください");
      suggestions.push("代名詞（「彼」「彼女」「その人」など）を適切に活用してください");
      suggestions.push("日本語の特性を活かし、文脈が明確な場合は主語を省略してください");
      suggestions.push("複数の文を接続詞や接続助詞で結んで一文にすることで、主語の繰り返しを減らしてください");

      // 具体的な例を追加
      for (const pattern of repeatedSubjects.slice(0, 2)) { // 最大2つの例を生成
        suggestions.push(`「${pattern.subject}」が${pattern.count}回連続で主語として使われています`);
      }
    }

    return suggestions;
  }

  /**
   * 基本的な表現パターン抽出（ルールベース）
   * 
   * @param content テキスト内容
   * @returns 表現パターン
   */
  private extractBasicPatterns(content: string): ExpressionPatterns {
    const patterns: ExpressionPatterns = {
      verbPhrases: [],
      adjectivalExpressions: [],
      dialoguePatterns: [],
      conjunctions: [],
      sentenceStructures: []
    };

    // 動詞フレーズパターン
    const verbPatterns = [
      /([一-龯ぁ-んァ-ヶ]{2,})(した|している|していた)/g,
      /([一-龯ぁ-んァ-ヶ]{2,})(れる|られる|させる)/g
    ];

    // 形容表現パターン
    const adjectivePatterns = [
      /([一-龯ぁ-んァ-ヶ]{2,})(のような|みたいな|のごとく)/g,
      /([一-龯ぁ-んァ-ヶ]{1,3})(すぎる|きわまる|極まる)/g
    ];

    // 会話表現パターン
    const dialoguePatterns = [
      /「([^」]{5,15})」/g
    ];

    // 接続語パターン
    const conjunctionPatterns = [
      /(しかし|けれども|だから|それゆえに|ところが)[、。]/g
    ];

    // 文構造パターン
    const structurePatterns = [
      /([一-龯ぁ-んァ-ヶ]{2,})は([一-龯ぁ-んァ-ヶ]{2,})(だった|である|になった)/g
    ];

    // 各パターンを処理
    this.processPatterns(content, verbPatterns, patterns.verbPhrases);
    this.processPatterns(content, adjectivePatterns, patterns.adjectivalExpressions);
    this.processPatterns(content, dialoguePatterns, patterns.dialoguePatterns);
    this.processPatterns(content, conjunctionPatterns, patterns.conjunctions);
    this.processPatterns(content, structurePatterns, patterns.sentenceStructures);

    return patterns;
  }

  /**
   * パターンマッチングと頻度カウント
   * 
   * @param text テキスト内容
   * @param patterns 正規表現パターンの配列
   * @param results 結果を格納する配列
   */
  private processPatterns(
    text: string,
    patterns: RegExp[],
    results: { expression: string, frequency: number }[]
  ): void {
    const expressionCount: Record<string, number> = {};

    // 各パターンでマッチを検索
    for (const pattern of patterns) {
      const matches = Array.from(text.matchAll(pattern));

      for (const match of matches) {
        const expression = match[0];
        expressionCount[expression] = (expressionCount[expression] || 0) + 1;
      }
    }

    // 結果を格納
    for (const [expression, frequency] of Object.entries(expressionCount)) {
      if (frequency >= 2) { // 2回以上出現するもののみ記録
        results.push({ expression, frequency });
      }
    }

    // 頻度の高い順にソート
    results.sort((a, b) => b.frequency - a.frequency);
  }
}