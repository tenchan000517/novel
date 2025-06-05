/**
 * @fileoverview テーマ強化サービス実装
 * @description
 * テーマとモチーフの強化を担当するサービス。
 * 作品のテーマ性を深め、象徴と隠喩の使用提案、伏線設置と回収の最適化提案など、
 * 文学的な深みと一貫性を向上させるための機能を提供します。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiAdapter } from '@/lib/analysis/adapters/gemini-adapter';
import { JsonParser } from '@/lib/utils/json-parser';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { storageProvider } from '@/lib/storage';

import { ICacheStorage } from '@/lib/analysis/core/interfaces';



import { IThemeEnhancementService } from '@/lib/analysis/enhancement/theme/interfaces';


import {
  ThemeEnhancement,
  ThemeEnhancementRequest,
  LiteraryTechniqueRequest,
  LiteraryInspiration,
  LiteraryTechnique,
  ThemeResonanceAnalysis,
  SymbolicElement,
  ForeshadowingOpportunity
} from '@/lib/analysis/core/types';

import { CacheStorage } from '@/lib/analysis/utils/cache-storage';

/**
 * ジャンル別テーマ強化戦略
 */
enum ThematicStrategy {
  SYMBOLIC = 'symbolic',     // 象徴主義的手法
  DIRECT = 'direct',         // 直接的手法
  REFLECTIVE = 'reflective', // 内省的手法
  CONTRAST = 'contrast',     // 対比的手法
  AMBIGUOUS = 'ambiguous'    // 曖昧性を活用する手法
}

/**
 * @class ThemeEnhancementService
 * @description
 * テーマとモチーフの強化を担当するサービスクラス。
 * テーマ共鳴強化の推奨、象徴と隠喩の使用提案、伏線設置と回収の最適化提案、
 * 文学的技法の推奨、一貫したテーマ発展の支援などの機能を提供します。
 * 
 * @implements IThemeEnhancementService
 */
export class ThemeEnhancementService implements IThemeEnhancementService {
  private cache: ICacheStorage;
  private defaultTTL: number = 3600000; // 1時間
  private literaryTechniquesDatabase: Map<string, LiteraryTechnique[]>;
  
  /**
   * コンストラクタ
   * @param geminiAdapter Gemini API アダプター
   */
  constructor(private geminiAdapter: GeminiAdapter) {
    this.cache = new CacheStorage();
    this.literaryTechniquesDatabase = new Map();
    this.initializeLiteraryTechniques();
    logger.info('ThemeEnhancementService: 初期化完了');
  }
  
  /**
   * 初期化
   */
  async initialize(): Promise<void> {
    try {
      // 文学的技法データベースの読み込み
      await this.loadLiteraryTechniques();
      logger.info('ThemeEnhancementService: 初期化が完了しました');
    } catch (error) {
      logger.warn('ThemeEnhancementService: 初期化中にエラーが発生しました', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * テーマ強化提案の生成
   * テーマ分析結果に基づいて、テーマをより効果的に表現するための提案を生成します。
   * 
   * @param themeAnalysis テーマ分析結果
   * @param chapterNumber 章番号
   * @param context コンテキスト情報（任意）
   * @returns テーマ強化提案の配列
   */
  async generateThemeEnhancements(
    themeAnalysis: ThemeResonanceAnalysis,
    chapterNumber: number,
    context?: any
  ): Promise<ThemeEnhancement[]> {
    try {
      // キャッシュキーの生成
      const cacheKey = `theme-enhancement-${chapterNumber}-${this.hashObject(themeAnalysis)}`;
      
      // キャッシュをチェック
      const cachedEnhancements = this.cache.get<ThemeEnhancement[]>(cacheKey);
      if (cachedEnhancements) {
        logger.debug(`ThemeEnhancementService: キャッシュから章${chapterNumber}のテーマ強化提案を取得`);
        return cachedEnhancements;
      }
      
      logger.info(`ThemeEnhancementService: 章${chapterNumber}のテーマ強化提案を生成`);
      
      // リクエスト構造を作成
      const request: ThemeEnhancementRequest = {
        themeAnalysis,
        chapterNumber,
        context: context || {},
        genre: context?.genre || 'general',
        storyPhase: this.determineStoryPhase(chapterNumber, context)
      };
      
      // AIを使用したテーマ強化提案生成
      const enhancements = await this.generateThemeEnhancementsWithAI(request);
      
      // キャッシュに保存
      this.cache.set(cacheKey, enhancements, this.defaultTTL);
      
      logger.info(`テーマ強化提案を生成しました`, {
        chapterNumber,
        enhancementCount: enhancements.length
      });
      
      return enhancements;
    } catch (error) {
      logger.error(`テーマ強化提案生成中にエラーが発生しました`, {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });
      
      // エラー時はフォールバック値を返す
      return this.createFallbackThemeEnhancements(chapterNumber);
    }
  }
  
  /**
   * 文学的技法提案の生成
   * 文学的技法の活用提案を生成します。
   * 
   * @param context コンテキスト情報
   * @param chapterNumber 章番号
   * @returns 文学的技法提案
   */
  async generateLiteraryInspirations(
    context: any,
    chapterNumber: number
  ): Promise<LiteraryInspiration> {
    try {
      // キャッシュキーの生成
      const cacheKey = `literary-inspiration-${chapterNumber}`;
      
      // キャッシュをチェック
      const cachedInspirations = this.cache.get<LiteraryInspiration>(cacheKey);
      if (cachedInspirations) {
        logger.debug(`ThemeEnhancementService: キャッシュから章${chapterNumber}の文学的技法提案を取得`);
        return cachedInspirations;
      }
      
      logger.info(`ThemeEnhancementService: 章${chapterNumber}の文学的技法提案を生成`);
      
      // リクエスト構造を作成
      const request: LiteraryTechniqueRequest = {
        chapterNumber,
        worldSettings: context?.worldSettings || '',
        themeSettings: context?.theme || '',
        genre: context?.genre || 'general',
        totalChapters: context?.totalChapters || 0,
        tension: context?.tension || 0.5,
        storyPhase: this.determineStoryPhase(chapterNumber, context)
      };
      
      // AIを使用した文学的技法提案生成
      const inspirations = await this.generateLiteraryInspirationsWithAI(request);
      
      // キャッシュに保存
      this.cache.set(cacheKey, inspirations, this.defaultTTL);
      
      logger.info(`文学的技法提案を生成しました`, {
        chapterNumber,
        techniqueCount: (
          inspirations.plotTechniques.length +
          inspirations.characterTechniques.length +
          inspirations.atmosphereTechniques.length
        )
      });
      
      return inspirations;
    } catch (error) {
      logger.error(`文学的技法提案生成中にエラーが発生しました`, {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });
      
      // エラー時はフォールバック値を返す
      return this.createFallbackLiteraryInspirations();
    }
  }
  
  /**
   * 象徴要素の提案生成
   * テーマを強化するための象徴要素を提案します。
   * 
   * @param themes テーマ配列
   * @param chapterNumber 章番号
   * @param genre ジャンル
   * @returns 象徴要素の提案
   */
  async suggestSymbolicElements(
    themes: string[],
    chapterNumber: number,
    genre?: string
  ): Promise<SymbolicElement[]> {
    try {
      // キャッシュキーの生成
      const themesKey = themes.sort().join('-');
      const cacheKey = `symbolic-elements-${chapterNumber}-${themesKey}-${genre || 'general'}`;
      
      // キャッシュをチェック
      const cachedElements = this.cache.get<SymbolicElement[]>(cacheKey);
      if (cachedElements) {
        logger.debug(`ThemeEnhancementService: キャッシュから象徴要素提案を取得`);
        return cachedElements;
      }
      
      logger.info(`ThemeEnhancementService: 象徴要素提案を生成`);
      
      // テーマがない場合は空配列を返す
      if (!themes || themes.length === 0) {
        return [];
      }
      
      // AIを使用した象徴要素提案生成
      const elements = await this.generateSymbolicElementsWithAI(themes, chapterNumber, genre);
      
      // キャッシュに保存
      this.cache.set(cacheKey, elements, this.defaultTTL);
      
      logger.info(`象徴要素提案を生成しました`, {
        elementsCount: elements.length
      });
      
      return elements;
    } catch (error) {
      logger.error(`象徴要素提案生成中にエラーが発生しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      
      // エラー時はフォールバック値を返す
      return this.createFallbackSymbolicElements(themes);
    }
  }
  
  /**
   * 伏線機会の検出
   * テキスト内の伏線設置機会を検出します。
   * 
   * @param content テキスト内容
   * @param chapterNumber 章番号
   * @param themes テーマ配列
   * @returns 伏線機会の配列
   */
  async detectForeshadowingOpportunities(
    content: string,
    chapterNumber: number,
    themes: string[]
  ): Promise<ForeshadowingOpportunity[]> {
    try {
      // コンテンツが短すぎる場合は早期リターン
      if (!content || content.length < 200) {
        return [];
      }
      
      // キャッシュキーの生成
      const contentHash = this.hashContent(content);
      const themesKey = themes.sort().join('-');
      const cacheKey = `foreshadowing-opportunities-${chapterNumber}-${contentHash}-${themesKey}`;
      
      // キャッシュをチェック
      const cachedOpportunities = this.cache.get<ForeshadowingOpportunity[]>(cacheKey);
      if (cachedOpportunities) {
        logger.debug(`ThemeEnhancementService: キャッシュから伏線機会を取得`);
        return cachedOpportunities;
      }
      
      logger.info(`ThemeEnhancementService: 伏線機会を検出`);
      
      // AIを使用した伏線機会検出
      const opportunities = await this.detectForeshadowingWithAI(content, chapterNumber, themes);
      
      // キャッシュに保存
      this.cache.set(cacheKey, opportunities, this.defaultTTL);
      
      logger.info(`伏線機会を検出しました`, {
        chapterNumber,
        opportunitiesCount: opportunities.length
      });
      
      return opportunities;
    } catch (error) {
      logger.error(`伏線機会検出中にエラーが発生しました`, {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });
      
      // エラー時は空配列を返す
      return [];
    }
  }
  
  /**
   * テーマ強化のための文学的技法提案
   * 特定テーマに関連する文学的技法を提案します。
   * 
   * @param theme テーマ
   * @param genre ジャンル
   * @returns 文学的技法の配列
   */
  async suggestLiteraryTechniquesForTheme(
    theme: string,
    genre?: string
  ): Promise<LiteraryTechnique[]> {
    try {
      // キャッシュキーの生成
      const cacheKey = `literary-techniques-${theme}-${genre || 'general'}`;
      
      // キャッシュをチェック
      const cachedTechniques = this.cache.get<LiteraryTechnique[]>(cacheKey);
      if (cachedTechniques) {
        logger.debug(`ThemeEnhancementService: キャッシュからテーマの文学的技法を取得`);
        return cachedTechniques;
      }
      
      logger.info(`ThemeEnhancementService: テーマ「${theme}」の文学的技法を提案`);
      
      // データベースから技法を検索
      let techniques = this.findTechniquesForTheme(theme);
      
      // 技法が見つからない場合
      if (techniques.length === 0) {
        // AIを使用した技法生成
        techniques = await this.generateTechniquesForThemeWithAI(theme, genre);
        
        // 生成した技法をデータベースに追加
        this.addTechniquesToDatabase(theme, techniques);
      }
      
      // ジャンルで適切な技法をフィルタリング
      const filteredTechniques = this.filterTechniquesByGenre(techniques, genre);
      
      // キャッシュに保存
      this.cache.set(cacheKey, filteredTechniques, this.defaultTTL);
      
      return filteredTechniques;
    } catch (error) {
      logger.error(`テーマの文学的技法提案中にエラーが発生しました`, {
        error: error instanceof Error ? error.message : String(error),
        theme
      });
      
      // エラー時はデフォルト技法を返す
      return this.getDefaultTechniquesForTheme(theme);
    }
  }
  
  /**
   * AIを使用したテーマ強化提案生成
   * @private
   * @param request テーマ強化リクエスト
   * @returns テーマ強化提案の配列
   */
  private async generateThemeEnhancementsWithAI(
    request: ThemeEnhancementRequest
  ): Promise<ThemeEnhancement[]> {
    try {
      // テーマ分析結果から主要テーマを抽出
      const themes = request.themeAnalysis.dominantTheme ? 
        [request.themeAnalysis.dominantTheme] : 
        Object.keys(request.themeAnalysis.themes || {}).slice(0, 3);
      
      if (themes.length === 0) {
        logger.warn('テーマが見つかりません。デフォルト提案を返します');
        return this.createFallbackThemeEnhancements(request.chapterNumber);
      }
      
      // 各テーマの強度を取得
      const themeStrengths = themes.map(theme => ({
        theme,
        strength: request.themeAnalysis.themes?.[theme]?.strength || 0.5
      }));
      
      // ストーリーフェーズに基づく戦略
      const phaseStrategy = this.getPhaseStrategy(request.storyPhase);
      
      // ジャンルに基づく戦略
      const genreStrategy = this.getGenreStrategy(request.genre);
      
      // プロンプトの作成
      const prompt = `
あなたは文学のテーマと象徴性の専門家です。以下の情報に基づいて、テーマを効果的に表現・強化するための具体的な提案を生成してください。

## テーマ分析結果
主要テーマ: ${themes.join(', ')}
${themeStrengths.map(t => `- テーマ「${t.theme}」の強度: ${t.strength.toFixed(2)}`).join('\n')}

## コンテキスト情報
- 章番号: ${request.chapterNumber}
- ストーリーフェーズ: ${request.storyPhase}
- ジャンル: ${request.genre}

## 指示
このストーリーフェーズ（${request.storyPhase}）とジャンルに適した方法で、各テーマをより効果的に表現・強化するための具体的な提案を生成してください。
各テーマについて、${Math.min(themes.length * 2, 5)}つの提案を作成してください。

提案は以下の要素を含むべきです：
1. 具体的なアプローチ（例：象徴の使用、対比、メタファー、キャラクターの行動/選択を通じた表現など）
2. 具体例の提示
3. 期待される読者への効果
4. この章の文脈での適用方法

各テーマについて現在の強度を考慮し、弱いテーマにはより多くの強化提案を提供してください。
${phaseStrategy}
${genreStrategy}

## 出力形式
以下のJSON配列形式で提案を生成してください：
[
  {
    "theme": "テーマ名",
    "currentStrength": 0.7,
    "suggestion": "具体的な改善提案の説明",
    "approach": "使用するアプローチ（象徴、対比、メタファーなど）",
    "example": "具体例",
    "impact": "期待される効果"
  },
  ...
]
`;
      
      // APIスロットリングを使用してAI生成を実行
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(prompt, {
          temperature: 0.3,
          purpose: 'suggestion',
          responseFormat: 'json'
        })
      );
      
      // JsonParserを使用してレスポンスを解析
      const enhancements = JsonParser.parseFromAIResponse<ThemeEnhancement[]>(
        response, 
        []
      );
      
      // 結果の検証
      if (!Array.isArray(enhancements) || enhancements.length === 0) {
        return this.createFallbackThemeEnhancements(request.chapterNumber);
      }
      
      // 各強化提案を検証
      return enhancements.map(enhancement => this.validateThemeEnhancement(enhancement));
    } catch (error) {
      logger.error('AIによるテーマ強化提案生成中にエラーが発生しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      return this.createFallbackThemeEnhancements(request.chapterNumber);
    }
  }
  
  /**
   * AIを使用した文学的技法提案生成
   * @private
   * @param request 文学的技法リクエスト
   * @returns 文学的技法提案
   */
  private async generateLiteraryInspirationsWithAI(
    request: LiteraryTechniqueRequest
  ): Promise<LiteraryInspiration> {
    try {
      // ストーリーフェーズに基づく戦略
      const phaseStrategy = this.getPhaseStrategy(request.storyPhase);
      
      // ジャンルに基づく戦略
      const genreStrategy = this.getGenreStrategy(request.genre);
      
      // 物語の進行度を計算
      const progress = request.totalChapters > 0 
        ? request.chapterNumber / request.totalChapters 
        : request.chapterNumber / 30; // デフォルト30章と仮定
      
      // プロンプトの作成
      const prompt = `
あなたは文学技法の専門家です。以下の情報に基づいて、この章で効果的に使用できる文学技法の提案を生成してください。

## コンテキスト情報
- 章番号: ${request.chapterNumber}
- 物語の進行度: 約${Math.round(progress * 100)}%
- ストーリーフェーズ: ${request.storyPhase}
- ジャンル: ${request.genre}
- テーマ: ${request.themeSettings || '明確なテーマ情報なし'}
- テンション値: ${request.tension.toFixed(2)}（0〜1、高いほど緊張感が高い）

## 世界設定
${request.worldSettings ? request.worldSettings.substring(0, 500) + '...' : '世界設定情報なし'}

## 指示
この章で効果的に使用できる文学技法を3つのカテゴリに分けて提案してください：
1. プロット技法（物語展開に関する技法）
2. キャラクター技法（キャラクター描写に関する技法）
3. 雰囲気技法（雰囲気や環境描写に関する技法）

各カテゴリで3〜4つの技法を提案し、以下の要素を含めてください：
- 技法名
- 技法の説明
- 具体的な適用例（この章での使用方法）
- 参考となる典型的な使用例（有名な作品など）

${phaseStrategy}
${genreStrategy}

現在のストーリーフェーズとジャンルに最も適した技法に焦点を当て、テンション値に合った提案を行ってください。

## 出力形式
以下のJSON形式で出力してください：
{
  "plotTechniques": [
    {
      "technique": "技法名",
      "description": "技法の説明",
      "example": "この章での適用例",
      "reference": "参考となる典型的な使用例"
    },
    ...
  ],
  "characterTechniques": [...],
  "atmosphereTechniques": [...]
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
      
      // デフォルト値を準備
      const defaultInspiration = this.createFallbackLiteraryInspirations();
      
      // JsonParserを使用してレスポンスを解析
      const inspirations = JsonParser.parseFromAIResponse<LiteraryInspiration>(
        response, 
        defaultInspiration
      );
      
      // 結果の検証と整形
      return this.validateLiteraryInspirations(inspirations, defaultInspiration);
    } catch (error) {
      logger.error('AIによる文学的技法提案生成中にエラーが発生しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      return this.createFallbackLiteraryInspirations();
    }
  }
  
  /**
   * AIを使用した象徴要素提案生成
   * @private
   * @param themes テーマ配列
   * @param chapterNumber 章番号
   * @param genre ジャンル
   * @returns 象徴要素の配列
   */
  private async generateSymbolicElementsWithAI(
    themes: string[],
    chapterNumber: number,
    genre?: string
  ): Promise<SymbolicElement[]> {
    try {
      // ジャンルに基づく戦略
      const genreStrategy = this.getGenreStrategy(genre || 'general');
      
      // プロンプトの作成
      const prompt = `
あなたは文学的象徴と隠喩の専門家です。以下のテーマに対して、物語で使用できる効果的な象徴要素を提案してください。

## テーマ
${themes.join(', ')}

## コンテキスト情報
- 章番号: ${chapterNumber}
- ジャンル: ${genre || 'general'}

## 指示
各テーマについて、2〜3の象徴要素を提案してください。各象徴要素には以下の情報を含めてください：
- 象徴の名前/種類
- 象徴の説明（テーマとの関連性）
- 物語での使用方法
- 期待される効果
- 過度の使用を避けるための注意点

${genreStrategy}

## 出力形式
以下のJSON配列形式で出力してください：
[
  {
    "theme": "テーマ名",
    "symbolName": "象徴名",
    "description": "象徴の説明",
    "usage": "物語での使用方法",
    "effect": "期待される効果",
    "caution": "使用時の注意点"
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
      const elements = JsonParser.parseFromAIResponse<SymbolicElement[]>(
        response, 
        []
      );
      
      // 結果の検証
      if (!Array.isArray(elements) || elements.length === 0) {
        return this.createFallbackSymbolicElements(themes);
      }
      
      // 各象徴要素を検証
      return elements.map(element => this.validateSymbolicElement(element, themes));
    } catch (error) {
      logger.error('AIによる象徴要素提案生成中にエラーが発生しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      return this.createFallbackSymbolicElements(themes);
    }
  }
  
  /**
   * AIを使用した伏線機会検出
   * @private
   * @param content テキスト内容
   * @param chapterNumber 章番号
   * @param themes テーマ配列
   * @returns 伏線機会の配列
   */
  private async detectForeshadowingWithAI(
    content: string,
    chapterNumber: number,
    themes: string[]
  ): Promise<ForeshadowingOpportunity[]> {
    try {
      // テキストを短縮（最大10000文字）
      const truncatedContent = content.length > 10000 
        ? content.substring(0, 5000) + '\n...\n' + content.substring(content.length - 5000)
        : content;
      
      // プロンプトの作成
      const prompt = `
あなたは物語の伏線と構造の専門家です。以下のテキストを分析し、将来の伏線展開のために活用できる機会を特定してください。

## テキスト（章${chapterNumber}）
${truncatedContent}

## 主要テーマ
${themes.join(', ')}

## 指示
このテキスト内で、将来の展開につながる伏線として活用できる要素（会話、描写、オブジェクト、状況など）を最大5つ特定してください。
各機会について以下の情報を提供してください：
- 伏線になり得る要素
- テキスト内の位置（大まかで構いません）
- 将来の展開での活用方法（複数の可能性）
- 推奨される解決章（現在の章から何章後が適切か）
- テーマとの関連性

## 出力形式
以下のJSON配列形式で出力してください：
[
  {
    "element": "伏線要素",
    "textPosition": "テキスト内の位置の説明",
    "possibleDevelopments": ["可能性1", "可能性2", ...],
    "suggestedResolutionChapter": チャプター番号,
    "relatedTheme": "関連するテーマ",
    "importance": 0.8 // 0〜1の重要度
  },
  ...
]
`;
      
      // APIスロットリングを使用してAI生成を実行
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(prompt, {
          temperature: 0.3,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );
      
      // JsonParserを使用してレスポンスを解析
      const opportunities = JsonParser.parseFromAIResponse<ForeshadowingOpportunity[]>(
        response, 
        []
      );
      
      // 結果の検証
      if (!Array.isArray(opportunities)) {
        return [];
      }
      
      // 各伏線機会を検証
      return opportunities.map(opportunity => this.validateForeshadowingOpportunity(opportunity, chapterNumber));
    } catch (error) {
      logger.error('AIによる伏線機会検出中にエラーが発生しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      return [];
    }
  }
  
  /**
   * AIを使用したテーマ用技法生成
   * @private
   * @param theme テーマ
   * @param genre ジャンル
   * @returns 文学的技法の配列
   */
  private async generateTechniquesForThemeWithAI(
    theme: string,
    genre?: string
  ): Promise<LiteraryTechnique[]> {
    try {
      // ジャンルに基づく戦略
      const genreStrategy = this.getGenreStrategy(genre || 'general');
      
      // プロンプトの作成
      const prompt = `
あなたは文学的技法の専門家です。以下のテーマに対して、効果的に表現するための文学的技法を提案してください。

## テーマ
${theme}

## ジャンル
${genre || 'general'}

## 指示
このテーマを効果的に表現するために使用できる5つの文学的技法を提案してください。
各技法について以下の情報を提供してください：
- 技法名
- 技法の説明
- 具体的な使用例
- 期待される効果
- 適切なジャンルと文脈

${genreStrategy}

技法はなるべく多様なものを選び、直接的なものと間接的なものをバランスよく提案してください。

## 出力形式
以下のJSON配列形式で出力してください：
[
  {
    "techniqueName": "技法名",
    "description": "技法の説明",
    "example": "具体的な使用例",
    "effect": "期待される効果",
    "suitableGenres": ["適切なジャンル1", "適切なジャンル2", ...],
    "themeRelevance": 0.9 // 0〜1のテーマとの関連性
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
      const techniques = JsonParser.parseFromAIResponse<LiteraryTechnique[]>(
        response, 
        []
      );
      
      // 結果の検証
      if (!Array.isArray(techniques) || techniques.length === 0) {
        return this.getDefaultTechniquesForTheme(theme);
      }
      
      // 各技法を検証
      return techniques.map(technique => this.validateLiteraryTechnique(technique));
    } catch (error) {
      logger.error('AIによるテーマ用技法生成中にエラーが発生しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      return this.getDefaultTechniquesForTheme(theme);
    }
  }
  
  /**
   * テーマ強化提案を検証
   * @private
   * @param enhancement テーマ強化提案
   * @returns 検証済みのテーマ強化提案
   */
  private validateThemeEnhancement(enhancement: ThemeEnhancement): ThemeEnhancement {
    const validated: ThemeEnhancement = { ...enhancement };
    
    // 必須フィールドの存在確認と修正
    if (!validated.theme) {
      validated.theme = "一般的なテーマ";
    }
    
    if (validated.currentStrength === undefined || 
        validated.currentStrength < 0 || 
        validated.currentStrength > 1) {
      validated.currentStrength = 0.5;
    }
    
    if (!validated.suggestion) {
      validated.suggestion = "テーマの一貫性を維持してください";
    }
    
    if (!validated.approach) {
      validated.approach = "直接的な表現";
    }
    
    if (!validated.example) {
      validated.example = "具体例なし";
    }
    
    if (!validated.impact) {
      validated.impact = "テーマの存在感を強化";
    }
    
    return validated;
  }
  
  /**
   * 文学的技法提案を検証
   * @private
   * @param inspiration 文学的技法提案
   * @param defaultInspiration デフォルト値
   * @returns 検証済みの文学的技法提案
   */
  private validateLiteraryInspirations(
    inspiration: LiteraryInspiration,
    defaultInspiration: LiteraryInspiration
  ): LiteraryInspiration {
    const validated: LiteraryInspiration = {
      plotTechniques: [],
      characterTechniques: [],
      atmosphereTechniques: []
    };
    
    // 各カテゴリの検証
    if (Array.isArray(inspiration.plotTechniques) && inspiration.plotTechniques.length > 0) {
      validated.plotTechniques = inspiration.plotTechniques.map(this.validateTechnique);
    } else {
      validated.plotTechniques = defaultInspiration.plotTechniques;
    }
    
    if (Array.isArray(inspiration.characterTechniques) && inspiration.characterTechniques.length > 0) {
      validated.characterTechniques = inspiration.characterTechniques.map(this.validateTechnique);
    } else {
      validated.characterTechniques = defaultInspiration.characterTechniques;
    }
    
    if (Array.isArray(inspiration.atmosphereTechniques) && inspiration.atmosphereTechniques.length > 0) {
      validated.atmosphereTechniques = inspiration.atmosphereTechniques.map(this.validateTechnique);
    } else {
      validated.atmosphereTechniques = defaultInspiration.atmosphereTechniques;
    }
    
    return validated;
  }
  
  /**
   * 技法情報を検証
   * @private
   * @param technique 技法情報
   * @returns 検証済みの技法情報
   */
  private validateTechnique(technique: any): any {
    const validated: any = { ...technique };
    
    // 必須フィールドの存在確認と修正
    if (!validated.technique) {
      validated.technique = "未指定の技法";
    }
    
    if (!validated.description) {
      validated.description = "説明なし";
    }
    
    if (!validated.example) {
      validated.example = "具体例なし";
    }
    
    if (!validated.reference) {
      validated.reference = "参考例なし";
    }
    
    return validated;
  }
  
  /**
   * 象徴要素を検証
   * @private
   * @param element 象徴要素
   * @param themes テーマ配列
   * @returns 検証済みの象徴要素
   */
  private validateSymbolicElement(element: SymbolicElement, themes: string[]): SymbolicElement {
    const validated: SymbolicElement = { ...element };
    
    // 必須フィールドの存在確認と修正
    if (!validated.theme) {
      validated.theme = themes[0] || "一般的なテーマ";
    }
    
    if (!validated.symbolName) {
      validated.symbolName = "未指定の象徴";
    }
    
    if (!validated.description) {
      validated.description = "説明なし";
    }
    
    if (!validated.usage) {
      validated.usage = "物語内での使用方法は未定義";
    }
    
    if (!validated.effect) {
      validated.effect = "読者への効果は未定義";
    }
    
    if (!validated.caution) {
      validated.caution = "特に注意点なし";
    }
    
    return validated;
  }
  
  /**
   * 伏線機会を検証
   * @private
   * @param opportunity 伏線機会
   * @param currentChapter 現在の章番号
   * @returns 検証済みの伏線機会
   */
  private validateForeshadowingOpportunity(
    opportunity: ForeshadowingOpportunity,
    currentChapter: number
  ): ForeshadowingOpportunity {
    const validated: ForeshadowingOpportunity = { ...opportunity };
    
    // 必須フィールドの存在確認と修正
    if (!validated.element) {
      validated.element = "未指定の伏線要素";
    }
    
    if (!validated.textPosition) {
      validated.textPosition = "位置不明";
    }
    
    if (!Array.isArray(validated.possibleDevelopments) || validated.possibleDevelopments.length === 0) {
      validated.possibleDevelopments = ["将来の展開可能性は未定義"];
    }
    
    // 解決章の確認と修正
    const suggestedChapter = validated.suggestedResolutionChapter;
    if (typeof suggestedChapter !== 'number' || 
        suggestedChapter <= currentChapter || 
        suggestedChapter > currentChapter + 50) {
      // 現在の章から5〜15章後をデフォルトとする
      validated.suggestedResolutionChapter = currentChapter + 5 + Math.floor(Math.random() * 10);
    }
    
    if (!validated.relatedTheme) {
      validated.relatedTheme = "一般的なテーマ";
    }
    
    if (validated.importance === undefined || 
        validated.importance < 0 || 
        validated.importance > 1) {
      validated.importance = 0.5 + Math.random() * 0.3; // 0.5〜0.8のランダム値
    }
    
    return validated;
  }
  
  /**
   * 文学的技法を検証
   * @private
   * @param technique 文学的技法
   * @returns 検証済みの文学的技法
   */
  private validateLiteraryTechnique(technique: LiteraryTechnique): LiteraryTechnique {
    const validated: LiteraryTechnique = { ...technique };
    
    // 必須フィールドの存在確認と修正
    if (!validated.techniqueName) {
      validated.techniqueName = "未指定の技法";
    }
    
    if (!validated.description) {
      validated.description = "説明なし";
    }
    
    if (!validated.example) {
      validated.example = "具体例なし";
    }
    
    if (!validated.effect) {
      validated.effect = "効果は未定義";
    }
    
    if (!Array.isArray(validated.suitableGenres) || validated.suitableGenres.length === 0) {
      validated.suitableGenres = ["一般"];
    }
    
    if (validated.themeRelevance === undefined || 
        validated.themeRelevance < 0 || 
        validated.themeRelevance > 1) {
      validated.themeRelevance = 0.7;
    }
    
    return validated;
  }
  
  /**
   * フォールバック用のテーマ強化提案を作成
   * @private
   * @param chapterNumber 章番号
   * @returns フォールバックのテーマ強化提案
   */
  private createFallbackThemeEnhancements(chapterNumber: number): ThemeEnhancement[] {
    return [
      {
        theme: "成長と変化",
        currentStrength: 0.5,
        suggestion: "キャラクターの内面変化をより明示的に描写する",
        approach: "内的独白と行動の対比",
        example: "主人公の決断前の葛藤を内的独白で描き、決断後の行動変化を対比的に示す",
        impact: "キャラクターの成長過程が読者に明確に伝わる"
      },
      {
        theme: "希望と絶望",
        currentStrength: 0.4,
        suggestion: "環境描写を通じて感情的な対比を作る",
        approach: "象徴的な自然描写",
        example: "暗い空からわずかに差し込む光のように、絶望的状況の中の小さな希望を描写する",
        impact: "視覚的イメージを通じてテーマが感情的に伝わる"
      },
      {
        theme: "選択と結果",
        currentStrength: 0.6,
        suggestion: "同様の選択に直面する複数のキャラクターを対比させる",
        approach: "パラレルストーリーテリング",
        example: "同じ誘惑や選択肢に直面する複数のキャラクターが異なる選択をし、それぞれの結果を並行して描く",
        impact: "選択と結果の因果関係がより明確になる"
      }
    ];
  }
  
  /**
   * フォールバック用の文学的技法提案を作成
   * @private
   * @returns フォールバックの文学的技法提案
   */
  private createFallbackLiteraryInspirations(): LiteraryInspiration {
    return {
      plotTechniques: [
        {
          technique: "伏線の設置と回収",
          description: "物語の前半で示唆し、後半で意味を明らかにする技法",
          example: "主人公が何気なく拾った小さなアイテムが、後の章で重要な意味を持つ",
          reference: "優れた小説作品"
        },
        {
          technique: "対比構造",
          description: "対照的な場面や状況を並置して、両方の特性を強調する",
          example: "平和な日常の描写の直後に緊迫した場面を配置する",
          reference: "古典文学からモダン作品まで広く使用される技法"
        },
        {
          technique: "物語内物語",
          description: "主要な物語の中に別の物語を埋め込む",
          example: "登場人物が語る昔話や伝説が、メインストーリーと共鳴する",
          reference: "千夜一夜物語など"
        }
      ],
      characterTechniques: [
        {
          technique: "行動による性格描写",
          description: "キャラクターの内面を直接説明せず、行動や選択を通じて性格を示す",
          example: "危機的状況での判断や反応を通じてキャラクターの本質を描く",
          reference: "優れたキャラクター小説"
        },
        {
          technique: "内的矛盾",
          description: "キャラクターの矛盾する欲求や価値観を描写する",
          example: "自分の信念と相反する行動を取らざるを得ない状況での葛藤を描く",
          reference: "心理小説"
        },
        {
          technique: "象徴的な特徴",
          description: "キャラクターの本質を反映する象徴的な特徴や癖を設定する",
          example: "キャラクターの特定の癖が、その性格や過去の経験を反映している",
          reference: "文学全般"
        }
      ],
      atmosphereTechniques: [
        {
          technique: "対比による強調",
          description: "対照的な場面や感情を並置して、両方をより際立たせる",
          example: "平和な日常描写の直後に緊迫した場面を配置する",
          reference: "現代文学作品"
        },
        {
          technique: "感情移入的環境描写",
          description: "キャラクターの感情状態を反映した環境描写",
          example: "主人公の不安な心理状態を、曇り空や不気味な風の音で間接的に表現する",
          reference: "ゴシック文学など"
        },
        {
          technique: "感覚的描写の重層化",
          description: "複数の感覚（視覚、聴覚、嗅覚など）を組み合わせた描写",
          example: "場所の雰囲気を視覚だけでなく、音や匂い、触感なども含めて総合的に描写する",
          reference: "印象派文学"
        }
      ]
    };
  }
  
  /**
   * フォールバック用の象徴要素を作成
   * @private
   * @param themes テーマ配列
   * @returns フォールバックの象徴要素
   */
  private createFallbackSymbolicElements(themes: string[]): SymbolicElement[] {
    // テーマがない場合は空配列を返す
    if (!themes || themes.length === 0) {
      return [];
    }
    
    const result: SymbolicElement[] = [];
    
    // 代表的なテーマに対するデフォルト象徴
    const themeSymbols: { [key: string]: SymbolicElement[] } = {
      // 成長と変化関連
      "成長": [
        {
          theme: "成長",
          symbolName: "木や植物",
          description: "成長の視覚的表現として、時間をかけて大きくなる性質を持つ",
          usage: "キャラクターの成長に合わせて、周囲の植物の変化を描写する",
          effect: "成長の過程を自然な形で視覚化できる",
          caution: "余りに直接的な比喩は避ける"
        },
        {
          theme: "成長",
          symbolName: "四季の移り変わり",
          description: "時間の経過と変化のサイクルを表現",
          usage: "重要な成長段階を季節の変化と結びつける",
          effect: "読者に自然で普遍的な変化のパターンを思い起こさせる",
          caution: "文化によって季節の意味合いが異なる点に注意"
        }
      ],
      // 対立と葛藤関連
      "対立": [
        {
          theme: "対立",
          symbolName: "火と水",
          description: "対立する性質を持つ基本元素",
          usage: "対立する勢力やキャラクターの描写に使用",
          effect: "根源的な対立の印象を与える",
          caution: "陳腐にならないよう微妙な表現を心がける"
        },
        {
          theme: "対立",
          symbolName: "境界線",
          description: "物理的・心理的な分断を表現",
          usage: "壁、川、道など、物語の対立を象徴する境界を設定",
          effect: "対立の視覚化と分断の感覚を強調",
          caution: "象徴性を明確にしつつも自然な描写を心がける"
        }
      ],
      // 希望と絶望関連
      "希望": [
        {
          theme: "希望",
          symbolName: "光",
          description: "暗闇の中の光は普遍的な希望の象徴",
          usage: "暗い状況の中でわずかな光を描写",
          effect: "読者に希望の感情を直感的に伝える",
          caution: "過度に使用すると陳腐になりやすい"
        },
        {
          theme: "希望",
          symbolName: "鳥/飛行",
          description: "自由と可能性の象徴",
          usage: "困難な状況で鳥や飛行のイメージを導入",
          effect: "制約からの解放と新たな展望を示唆",
          caution: "文脈によっては異なる意味合いを持つ場合がある"
        }
      ]
    };
    
    // 各テーマに対応するデフォルト象徴を追加
    for (const theme of themes) {
      // テーマに直接対応する象徴があれば使用
      if (themeSymbols[theme]) {
        result.push(...themeSymbols[theme]);
        continue;
      }
      
      // 部分一致するテーマを探す
      let matched = false;
      for (const [key, symbols] of Object.entries(themeSymbols)) {
        if (theme.includes(key) || key.includes(theme)) {
          const modifiedSymbols = symbols.map(symbol => ({
            ...symbol,
            theme: theme // テーマ名を修正
          }));
          result.push(...modifiedSymbols);
          matched = true;
          break;
        }
      }
      
      // 対応するものがない場合は汎用的な象徴を追加
      if (!matched) {
        result.push({
          theme: theme,
          symbolName: "十字路/選択",
          description: "人生の岐路と決断の象徴",
          usage: "キャラクターが重要な決断を迫られる場面で物理的な十字路を配置",
          effect: "選択の重要性と複数の可能性を視覚化",
          caution: "過度に明示的にならないよう配慮する"
        });
      }
    }
    
    return result;
  }
  
  /**
   * テーマに対するデフォルト技法を取得
   * @private
   * @param theme テーマ
   * @returns デフォルトの文学的技法
   */
  private getDefaultTechniquesForTheme(theme: string): LiteraryTechnique[] {
    return [
      {
        techniqueName: "対比法",
        description: "対照的な要素や状況を並置して、テーマを際立たせる技法",
        example: `テーマ「${theme}」を強調するために対比的な状況を作り出す`,
        effect: "テーマの多面性や複雑さを示すことができる",
        suitableGenres: ["一般小説", "文学小説", "フィクション"],
        themeRelevance: 0.9
      },
      {
        techniqueName: "反復法",
        description: "特定のフレーズや状況を意図的に繰り返し、テーマを強調する",
        example: `テーマ「${theme}」に関連するキーフレーズや状況を物語全体で繰り返す`,
        effect: "テーマの存在感を高め、読者の記憶に残りやすくなる",
        suitableGenres: ["詩的小説", "文学小説", "叙情的作品"],
        themeRelevance: 0.85
      },
      {
        techniqueName: "象徴的表現",
        description: "具体的な物や状況を通じて抽象的なテーマを表現する",
        example: `テーマ「${theme}」を表現する象徴的なオブジェクトや場面を設定する`,
        effect: "直接的に述べるよりも深い印象を残すことができる",
        suitableGenres: ["文学小説", "象徴主義", "寓話"],
        themeRelevance: 0.9
      },
      {
        techniqueName: "人物の内面描写",
        description: "登場人物の内面を通じてテーマを探求する",
        example: `テーマ「${theme}」に関する登場人物の思考や感情を詳細に描写する`,
        effect: "テーマを人間的、感情的レベルで理解させることができる",
        suitableGenres: ["心理小説", "文学小説", "人間ドラマ"],
        themeRelevance: 0.8
      },
      {
        techniqueName: "状況の普遍化",
        description: "特定の状況を普遍的なレベルに昇華させる",
        example: `テーマ「${theme}」を表現する特定の出来事を、より広い人間的文脈に位置づける`,
        effect: "読者自身の経験と結びつけやすくなる",
        suitableGenres: ["哲学的小説", "文学小説", "社会小説"],
        themeRelevance: 0.75
      }
    ];
  }
  
  /**
   * 文学的技法データベースの初期化
   * @private
   */
  private initializeLiteraryTechniques(): void {
    // 基本的な文学的技法
    const basicTechniques: LiteraryTechnique[] = [
      {
        techniqueName: "対比法",
        description: "対照的な要素や状況を並置して、両者の特質を際立たせる",
        example: "光と闇、富と貧困など対極的な概念を並べて描写する",
        effect: "コントラストによって各要素の特性をより明確に示す",
        suitableGenres: ["全ジャンル"],
        themeRelevance: 0.9
      },
      {
        techniqueName: "伏線法",
        description: "後の展開を暗示する要素を事前に配置する",
        example: "後に重要になる小道具や情報を何気ない形で導入する",
        effect: "物語に一貫性と深みをもたらし、読者を知的に刺激する",
        suitableGenres: ["ミステリー", "サスペンス", "ファンタジー"],
        themeRelevance: 0.85
      },
      {
        techniqueName: "象徴主義",
        description: "具体的な物や出来事を通じて抽象的な概念を表現する",
        example: "鳥が自由を象徴するように、具体的なものに意味を持たせる",
        effect: "複雑な概念や感情を間接的かつ豊かに表現できる",
        suitableGenres: ["文学小説", "象徴主義", "詩的小説"],
        themeRelevance: 0.9
      }
    ];
    
    // 基本技法をデータベースに追加
    this.literaryTechniquesDatabase.set('basic', basicTechniques);
    
    // テーマごとの文学的技法（例）
    this.literaryTechniquesDatabase.set('成長と変化', [
      {
        techniqueName: "内的独白",
        description: "キャラクターの内面の変化を直接的に表現する",
        example: "成長前と後での内的独白を対比させる",
        effect: "読者がキャラクターの心理的成長を直接体験できる",
        suitableGenres: ["成長小説", "教養小説", "心理小説"],
        themeRelevance: 0.95
      },
      {
        techniqueName: "季節の象徴的使用",
        description: "季節の変化を人物の成長と並行させる",
        example: "キャラクターの変化を春から夏への移行として描写する",
        effect: "自然のサイクルとキャラクターの変化を結びつける",
        suitableGenres: ["文学小説", "教養小説", "詩的小説"],
        themeRelevance: 0.85
      }
    ]);
    
    this.literaryTechniquesDatabase.set('葛藤と対立', [
      {
        techniqueName: "対立的会話構造",
        description: "会話を通じて対立する価値観や思想を明らかにする",
        example: "異なる立場のキャラクター間の緊張感ある対話",
        effect: "抽象的な対立を具体的かつドラマチックに表現できる",
        suitableGenres: ["社会小説", "政治小説", "思想小説"],
        themeRelevance: 0.9
      },
      {
        techniqueName: "物理的境界の象徴的使用",
        description: "物理的な境界や障壁を精神的・社会的分断の象徴として使用",
        example: "壁、川、道などを通じて社会的・心理的な分断を表現",
        effect: "抽象的な対立を視覚的・空間的に表現できる",
        suitableGenres: ["社会小説", "歴史小説", "寓話"],
        themeRelevance: 0.85
      }
    ]);
    
    // 他のテーマごとの技法も追加...
    logger.debug('文学的技法データベースが初期化されました');
  }
  
  /**
   * 文学的技法データベースの読み込み
   * @private
   */
  private async loadLiteraryTechniques(): Promise<void> {
    try {
      // ファイルからデータベースを読み込む
      const filePath = 'data/literary-techniques.json';
      
      // ファイルが存在するか確認
      const exists = await storageProvider.fileExists(filePath);
      if (!exists) {
        logger.debug('文学的技法データベースファイルが存在しません。デフォルト値を使用します。');
        return;
      }
      
      // ファイルを読み込む
      const content = await storageProvider.readFile(filePath);
      const data = JSON.parse(content);
      
      // データをデータベースに読み込む
      if (data && typeof data === 'object') {
        for (const [key, techniques] of Object.entries(data)) {
          if (Array.isArray(techniques)) {
            this.literaryTechniquesDatabase.set(key, techniques as LiteraryTechnique[]);
          }
        }
        logger.info(`文学的技法データベースを読み込みました（${Object.keys(data).length}カテゴリ）`);
      }
    } catch (error) {
      logger.warn('文学的技法データベースの読み込み中にエラーが発生しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      // 読み込みに失敗してもデフォルト値があるので処理を継続
    }
  }
  
  /**
   * 文学的技法データベースを保存
   * @private
   */
  private async saveLiteraryTechniques(): Promise<void> {
    try {
      // データベースをJSONに変換
      const data: { [key: string]: LiteraryTechnique[] } = {};
      for (const [key, techniques] of this.literaryTechniquesDatabase.entries()) {
        data[key] = techniques;
      }
      
      // ファイルに保存
      const filePath = 'data/literary-techniques.json';
      await storageProvider.writeFile(filePath, JSON.stringify(data, null, 2));
      
      logger.info('文学的技法データベースを保存しました');
    } catch (error) {
      logger.error('文学的技法データベースの保存中にエラーが発生しました', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * データベースに技法を追加
   * @private
   * @param theme テーマ
   * @param techniques 技法の配列
   */
  private addTechniquesToDatabase(theme: string, techniques: LiteraryTechnique[]): void {
    // 既存の技法を取得
    const existingTechniques = this.literaryTechniquesDatabase.get(theme) || [];
    
    // 新しい技法を追加（重複を避ける）
    const updatedTechniques = [...existingTechniques];
    for (const technique of techniques) {
      // 同名の技法が存在するか確認
      const existingIndex = updatedTechniques.findIndex(t => 
        t.techniqueName === technique.techniqueName
      );
      
      if (existingIndex >= 0) {
        // 存在する場合は更新
        updatedTechniques[existingIndex] = technique;
      } else {
        // 存在しない場合は追加
        updatedTechniques.push(technique);
      }
    }
    
    // データベースに保存
    this.literaryTechniquesDatabase.set(theme, updatedTechniques);
    
    // 非同期でファイルに保存（エラーを無視）
    this.saveLiteraryTechniques().catch(() => {});
  }
  
  /**
   * テーマに関連する技法を検索
   * @private
   * @param theme テーマ
   * @returns 関連する技法の配列
   */
  private findTechniquesForTheme(theme: string): LiteraryTechnique[] {
    // 直接一致するテーマの技法を検索
    if (this.literaryTechniquesDatabase.has(theme)) {
      return this.literaryTechniquesDatabase.get(theme) || [];
    }
    
    // 部分一致するテーマを検索
    for (const [key, techniques] of this.literaryTechniquesDatabase.entries()) {
      if (theme.includes(key) || key.includes(theme)) {
        return techniques;
      }
    }
    
    // 一致するものがない場合は基本技法を返す
    return this.literaryTechniquesDatabase.get('basic') || [];
  }
  
  /**
   * ジャンルで技法をフィルタリング
   * @private
   * @param techniques 技法の配列
   * @param genre ジャンル
   * @returns フィルタリングされた技法の配列
   */
  private filterTechniquesByGenre(
    techniques: LiteraryTechnique[],
    genre?: string
  ): LiteraryTechnique[] {
    // ジャンルが指定されていない場合はそのまま返す
    if (!genre) {
      return techniques;
    }
    
    // ジャンルに適した技法をフィルタリング
    return techniques.filter(technique => {
      // 全ジャンル対応の場合
      if (technique.suitableGenres.includes('全ジャンル')) {
        return true;
      }
      
      // ジャンルの部分一致をチェック
      return technique.suitableGenres.some(suitableGenre => 
        suitableGenre.toLowerCase().includes(genre.toLowerCase()) ||
        genre.toLowerCase().includes(suitableGenre.toLowerCase())
      );
    });
  }
  
  /**
   * ストーリーフェーズ戦略の取得
   * @private
   * @param phase ストーリーフェーズ
   * @returns フェーズに適した戦略の説明
   */
  private getPhaseStrategy(phase: string): string {
    const phaseStrategies: { [key: string]: string } = {
      'OPENING': `
このOPENINGフェーズでは、テーマを巧妙に導入することが重要です。
- テーマの直接的な説明は避け、象徴や状況を通じて暗示してください
- 後の展開のための伏線を自然に配置してください
- キャラクターの初期状態を確立し、成長の余地を示してください`,
      
      'EARLY': `
このEARLYフェーズでは、テーマの基盤を確立することが重要です。
- テーマの初期的な探索を始めてください
- キャラクターの行動や選択を通じてテーマを示してください
- テーマに関連する世界観要素をより詳細に導入してください`,
      
      'MIDDLE': `
このMIDDLEフェーズでは、テーマをより深く複雑に発展させることが重要です。
- テーマの異なる側面や矛盾を探求してください
- 対立する視点を通じてテーマの多面性を示してください
- 初期の伏線や象徴を発展させ、より深い意味を持たせてください`,
      
      'LATE': `
このLATEフェーズでは、テーマの収束と深化を図ることが重要です。
- テーマの複雑な意味合いを解決に向けて収束させ始めてください
- キャラクターの変化とテーマの関連性をより明確にしてください
- 初期の伏線を回収し始め、テーマとの関連を示してください`,
      
      'CLIMAX': `
このCLIMAXフェーズでは、テーマの劇的な表現と総合を行うことが重要です。
- テーマを劇的な場面や選択の中で頂点に達せしめてください
- それまでの伏線や象徴を有機的に結びつけてください
- キャラクターの最終的な選択をテーマと強く関連づけてください`,
      
      'ENDING': `
このENDINGフェーズでは、テーマの解決と振り返りを行うことが重要です。
- テーマの最終的な立場や見解を提示してください
- 残った伏線を回収し、全体の一貫性を確保してください
- テーマの普遍性や今後の含意を示唆してください`
    };
    
    return phaseStrategies[phase.toUpperCase()] || `
このフェーズでは、物語の現状に合わせたテーマの表現を心がけてください。
- 物語の流れを妨げない自然な形でテーマを表現してください
- キャラクターの行動や選択を通じてテーマを示してください
- 象徴や隠喩を適切に活用してください`;
  }
  
  /**
   * ジャンル戦略の取得
   * @private
   * @param genre ジャンル
   * @returns ジャンルに適した戦略の説明
   */
  private getGenreStrategy(genre: string): string {
    const lowerGenre = genre.toLowerCase();
    
    // ジャンルに基づく最適な戦略を決定
    let strategy = ThematicStrategy.DIRECT;
    
    if (lowerGenre.includes('ファンタジー') || lowerGenre.includes('fantasy')) {
      strategy = ThematicStrategy.SYMBOLIC;
    } else if (lowerGenre.includes('ミステリー') || lowerGenre.includes('mystery') || 
               lowerGenre.includes('サスペンス') || lowerGenre.includes('suspense')) {
      strategy = ThematicStrategy.AMBIGUOUS;
    } else if (lowerGenre.includes('文学') || lowerGenre.includes('literary')) {
      strategy = ThematicStrategy.REFLECTIVE;
    } else if (lowerGenre.includes('sf') || lowerGenre.includes('science fiction')) {
      strategy = ThematicStrategy.CONTRAST;
    }
    
    const genreStrategies: { [key in ThematicStrategy]: string } = {
      [ThematicStrategy.SYMBOLIC]: `
このファンタジー的ジャンルでは、象徴主義的アプローチが効果的です：
- 魔法、異世界の要素、神話的存在などを象徴として活用
- 視覚的で印象的な象徴を通じてテーマを表現
- 物理法則を超えた状況を通じて抽象的概念を具体化`,
      
      [ThematicStrategy.DIRECT]: `
このジャンルでは、より直接的なアプローチも効果的です：
- キャラクターの行動や選択を通じてテーマを表現
- 会話や内的独白でテーマに関連する思考を明示
- 状況やプロットの展開を通じてテーマを体現`,
      
      [ThematicStrategy.REFLECTIVE]: `
この文学的ジャンルでは、内省的アプローチが効果的です：
- 深い内面描写を通じてテーマを探求
- 複雑で多層的な象徴を活用
- 普遍的人間経験との関連を強調`,
      
      [ThematicStrategy.CONTRAST]: `
このSF的ジャンルでは、対比的アプローチが効果的です：
- 現実と異なる要素を通じて現在の課題を浮き彫りに
- 科学的・社会的思考実験としてテーマを探求
- 未来/異世界の視点から現在のテーマを考察`,
      
      [ThematicStrategy.AMBIGUOUS]: `
このミステリー/サスペンス的ジャンルでは、曖昧性を活用したアプローチが効果的です：
- 直接的な表現より暗示的な表現を優先
- 複数の解釈の余地を残す
- 真実の発見プロセスとテーマを結びつける`
    };
    
    return genreStrategies[strategy];
  }
  
  /**
   * ストーリーフェーズの決定
   * @private
   * @param chapterNumber 章番号
   * @param context コンテキスト情報
   * @returns ストーリーフェーズ
   */
  private determineStoryPhase(chapterNumber: number, context?: any): string {
    // コンテキストからフェーズ情報が得られる場合はそれを使用
    if (context?.storyPhase) {
      return context.storyPhase;
    }
    
    // 総章数が分かる場合は相対的な位置から判断
    const totalChapters = context?.totalChapters || 0;
    if (totalChapters > 0) {
      const progress = chapterNumber / totalChapters;
      
      if (progress < 0.1) return 'OPENING';
      if (progress < 0.3) return 'EARLY';
      if (progress < 0.6) return 'MIDDLE';
      if (progress < 0.8) return 'LATE';
      if (progress < 0.9) return 'CLIMAX';
      return 'ENDING';
    }
    
    // 総章数が不明の場合は章番号から推定
    if (chapterNumber <= 3) return 'OPENING';
    if (chapterNumber <= 8) return 'EARLY';
    if (chapterNumber <= 20) return 'MIDDLE';
    if (chapterNumber <= 30) return 'LATE';
    if (chapterNumber <= 35) return 'CLIMAX';
    return 'ENDING';
  }
  
  /**
   * コンテンツのハッシュ値を計算
   * @private
   * @param content テキスト内容
   * @returns ハッシュ値
   */
  private hashContent(content: string): string {
    // 単純なハッシュ関数
    let hash = 0;
    if (content.length === 0) return hash.toString();
    
    // 最初の5000文字だけを使用
    const truncatedContent = content.substring(0, 5000);
    
    for (let i = 0; i < truncatedContent.length; i++) {
      const char = truncatedContent.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit整数に変換
    }
    
    return hash.toString();
  }
  
  /**
   * オブジェクトのハッシュ値を計算
   * @private
   * @param obj オブジェクト
   * @returns ハッシュ値
   */
  private hashObject(obj: any): string {
    // オブジェクトをJSON文字列に変換
    let str = "";
    try {
      str = JSON.stringify(obj);
    } catch (e) {
      // 循環参照などでJSON化できない場合の対応
      return Date.now().toString();
    }
    
    // 文字列のハッシュ計算
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit整数に変換
    }
    
    return hash.toString();
  }
}

// シングルトンインスタンスをエクスポート
export const themeEnhancementService = new ThemeEnhancementService(new GeminiAdapter());