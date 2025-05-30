/**
 * @fileoverview テーマ、象徴、伏線の分析を担当するサービス
 * @description
 * 物語のテーマ、モチーフ、象徴、伏線を分析し、それらの一貫性と発展を
 * 評価する総合サービス。個別に分散していた分析機能を一元化して管理します。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiAdapter } from '../../adapters/gemini-adapter';
import { MemoryManager } from '@/lib/memory/manager';
import { JsonParser } from '@/lib/utils/json-parser';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { IThemeAnalysisService } from './interfaces';
import { logError } from '@/lib/utils/error-handler';
import { parameterManager } from '@/lib/parameters';
import { StorageProvider } from '@/lib/storage';

import {
  ThemeResonanceAnalysis,
  ThemeEnhancement,
  ForeshadowingElement,
  SymbolismAnalysis,
  ThemePresenceVisualization,
  ThemeElementResonance,
  ThemeConsistencyAnalysis,
  ThemeImageryMapping,
  MotifTrackingResult
} from '../../core/types';

/**
 * @class ThemeAnalysisService
 * @description 
 * テーマとモチーフの分析を担当するサービスクラス。
 * 物語の深層的な意味構造を分析し、伏線や象徴的要素を検出、追跡します。
 * 
 * @implements IThemeAnalysisService
 */
export class ThemeAnalysisService implements IThemeAnalysisService {
  // キャッシュ
  private themeResonanceCache: Map<string, ThemeResonanceAnalysis> = new Map();
  private symbolismCache: Map<string, SymbolismAnalysis> = new Map();
  private foreshadowingPlans: Map<number, any[]> = new Map();

  // 伏線はボトムアップ (メモリマネージャー) アプローチでトラックする
  private resolvedForeshadowingCache: Map<number, ForeshadowingElement[]> = new Map();

  /**
   * @constructor
   * @param geminiAdapter Gemini API アダプター
   * @param memoryManager メモリマネージャー 
   */
  constructor(
    private geminiAdapter: GeminiAdapter,
    private memoryManager: MemoryManager,
    private storageAdapter: StorageProvider, // 正しく型付けされたパラメータ

  ) {
    logger.info('ThemeAnalysisService: 初期化完了');
  }

  /**
   * テーマ共鳴分析を実行
   * テキスト内のテーマ表現を分析し、各テーマの強度や表現方法を評価します
   * 
   * @param content 分析対象のテキスト
   * @param themes テーマの配列
   * @returns テーマ共鳴分析結果
   */
  async analyzeThemeResonance(content: string, themes: string[]): Promise<ThemeResonanceAnalysis> {
    try {
      logger.info('テーマ共鳴分析を実行します', {
        themesCount: themes.length
      });

      // キャッシュキーの生成
      const cacheKey = this.generateCacheKey(content, themes);

      // キャッシュをチェック
      const cachedAnalysis = this.themeResonanceCache.get(cacheKey);
      if (cachedAnalysis) {
        logger.debug('キャッシュからテーマ共鳴分析結果を取得しました');
        return cachedAnalysis;
      }

      // テーマが空の場合はデフォルトテーマを使用
      const effectiveThemes = themes.length > 0 ? themes : ['成長', '変化', '挑戦'];

      // 分析用プロンプト
      const prompt = `
以下の小説本文を分析し、指定されたテーマがどのように表現されているか評価してください：

本文：${content.substring(0, 6000)}

テーマ：${effectiveThemes.map(t => `- ${t}`).join('\n')}

各テーマについて：
1. 明示的な言及（最大3つの具体的な箇所）
2. 暗示的な表現（象徴、メタファーなど。最大3つ）
3. 表現強度（1-10のスケール）
4. 表現方法（対話、内面描写、行動など。最大3つ）
5. 他のテーマとの関連性

また、全体的なテーマの一貫性（1-10）、最も支配的なテーマ、テーマ間の緊張関係についても評価してください。

JSONフォーマットで結果を返してください：
{
  "themes": {
    "テーマ1": {
      "explicitMentions": ["言及1", "言及2", "言及3"],
      "implicitExpressions": ["表現1", "表現2", "表現3"],
      "strength": 数値,
      "expressionMethods": ["方法1", "方法2", "方法3"],
      "relatedThemes": ["関連テーマ1", "関連テーマ2"]
    },
    "テーマ2": { ... }
  },
  "overallCoherence": 数値,
  "dominantTheme": "最も支配的なテーマ",
  "themeTensions": {
    "テーマ1とテーマ2": 数値
  }
}`;

      // APIスロットリングを利用してリクエスト
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(prompt, {
          temperature: 0.3,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );

      // JSONパース
      const defaultAnalysis = this.createFallbackAnalysis(effectiveThemes);
      const analysis = JsonParser.parseFromAIResponse<ThemeResonanceAnalysis>(
        response,
        defaultAnalysis
      );

      // 結果の検証と修正
      const validatedAnalysis = this.validateAnalysis(analysis, effectiveThemes);

      // キャッシュに保存
      this.themeResonanceCache.set(cacheKey, validatedAnalysis);

      logger.info('テーマ共鳴分析が完了しました', {
        themesAnalyzed: validatedAnalysis.themes ? Object.keys(validatedAnalysis.themes).length : 0,
        dominantTheme: validatedAnalysis.dominantTheme,
        overallCoherence: validatedAnalysis.overallCoherence
      });

      return validatedAnalysis;
    } catch (error) {
      logger.error('テーマ共鳴分析に失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });

      // エラー時はフォールバック値を返す
      return this.createFallbackAnalysis(themes);
    }
  }

  /**
 * ストーリーのテーマを取得する
 * @private
 */
  private async getStoryThemes(): Promise<string[]> {
    try {
      // メモリマネージャーからテーマ情報を取得
      const worldKnowledge = this.memoryManager.getLongTermMemory();
      const storyMetadata = await worldKnowledge.getStoryMetadata();

      if (storyMetadata && storyMetadata.themes && Array.isArray(storyMetadata.themes)) {
        return storyMetadata.themes;
      }

      return [];
    } catch (error) {
      logger.warn('Failed to get story themes', {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
 * 伏線生成数を取得する
 * @private
 * @returns 伏線生成数（1-5の範囲）
 */
  private getGenerationCount(): number {
    try {
      const params = parameterManager.getParameters();
      // plot.foreshadowingDensity を伏線生成数として利用
      if (params.plot && typeof params.plot.foreshadowingDensity === 'number') {
        // 密度から生成数に変換（1-5の範囲に収める）
        const density = params.plot.foreshadowingDensity;
        // 密度から生成数への変換ロジック（例: 密度0→1個、密度1→5個）
        return Math.max(1, Math.min(5, Math.round(density * 5)));
      }

      // 型アサーションを使用して安全にアクセス（代替手段）
      const extendedParams = params as any;
      if (extendedParams.foreshadowing &&
        typeof extendedParams.foreshadowing.generationCount === 'number') {
        return extendedParams.foreshadowing.generationCount;
      }

      return 2; // デフォルト値
    } catch (error) {
      logger.warn('伏線生成数の取得に失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      return 2; // エラー時のデフォルト値
    }
  }

  /**
   * 伏線処理を実行
   * 章の内容から伏線を検出、追跡、生成します
   * 
   * @param content 章コンテンツ
   * @param chapterNumber 章番号
   * @returns 処理結果
   */
  async processForeshadowing(content: string, chapterNumber: number): Promise<any> {
    try {
      // 1. 伏線の解決検出（最も重要なステップ）
      const resolvedForeshadowing = await this.detectResolvedForeshadowing(content, chapterNumber);

      // 解決した伏線を更新
      await this.updateResolvedForeshadowing(resolvedForeshadowing, chapterNumber);

      // 現在のアクティブな伏線を取得
      const worldKnowledge = this.memoryManager.getLongTermMemory();
      const activeForeshadowing = await worldKnowledge.getUnresolvedForeshadowing();

      // 条件付き処理：伏線が少ない場合のみ新しい伏線を生成
      let generatedForeshadowing = [];
      if (activeForeshadowing.length < 5) {
        const newForeshadowing = await this.generateNewForeshadowing(content, chapterNumber);

        // 新しい伏線を追加
        for (const foreshadow of newForeshadowing) {
          try {
            const added = await worldKnowledge.addForeshadowing({
              description: foreshadow.description,
              chapter_introduced: chapterNumber,
              urgency: foreshadow.urgency || 'medium',
              potential_resolution: foreshadow.potentialResolution
            });
            if (added) {
              generatedForeshadowing.push(added);
            }
          } catch (addError) {
            logger.warn(`Failed to add new foreshadowing: ${foreshadow.description}`, {
              error: addError instanceof Error ? addError.message : String(addError)
            });
          }
        }
      } else {
        logger.info(`十分な伏線（${activeForeshadowing.length}件）が存在するため、新規生成をスキップ`);
      }

      // 伏線計画の更新（特定条件でのみ実行）
      if (chapterNumber % 5 === 0 || activeForeshadowing.length < 3) {
        await this.updateForeshadowingPlan(chapterNumber);
      }

      return {
        resolvedForeshadowing,
        generatedCount: generatedForeshadowing.length,
        totalActive: activeForeshadowing.length
      };
    } catch (error) {
      logger.error('伏線処理に失敗しました', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });
      return { resolvedForeshadowing: [], generatedCount: 0, totalActive: 0 };
    }
  }

  /**
   * 解決された伏線を検出する
   * 
   * @param content 章コンテンツ
   * @param chapterNumber 章番号
   * @returns 解決された伏線配列
   */
  async detectResolvedForeshadowing(content: string, chapterNumber: number): Promise<any[]> {
    try {
      // キャッシュをチェック
      const cachedResult = this.resolvedForeshadowingCache.get(chapterNumber);
      if (cachedResult) {
        return cachedResult;
      }

      // 未解決の伏線を取得
      const worldKnowledge = this.memoryManager.getLongTermMemory();
      const unresolvedForeshadowing = await worldKnowledge.getUnresolvedForeshadowing();

      if (unresolvedForeshadowing.length === 0) {
        logger.info('未解決の伏線がありません');
        return [];
      }

      // 伏線解決分析プロンプト
      const prompt = `
以下の小説テキストを分析し、未解決の伏線が解決（回収）されているか確認してください。

本文：
${content.substring(0, 6000)}

未解決の伏線リスト：
${unresolvedForeshadowing.map((fs: { id: string; description: string; chapter_introduced: number }, index: number) =>
        `${index + 1}. ID: ${fs.id} - ${fs.description} (${fs.chapter_introduced}章で導入)`
      ).join('\n')}

解決されたと判断される伏線について、以下の形式でJSON出力してください：
[
  {
    "id": "伏線ID",
    "description": "伏線の説明",
    "resolutionDescription": "どのように解決されたかの説明",
    "resolutionScore": 解決の確実性（0-1）
  }
]

伏線が解決されていない場合は、空の配列[]を返してください。
`;

      // APIスロットリングを使用して分析を実行
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(prompt, {
          temperature: 0.2,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );

      // レスポンスを解析
      const resolvedForeshadowing = JsonParser.parseFromAIResponse<any[]>(response, []);

      // 結果を検証
      const validResults = Array.isArray(resolvedForeshadowing)
        ? resolvedForeshadowing.filter(item =>
          item && item.id &&
          unresolvedForeshadowing.some((fs: { id: string }) => fs.id === item.id) &&
          (item.resolutionScore === undefined || item.resolutionScore >= 0.7)
        )
        : [];

      // キャッシュに保存
      this.resolvedForeshadowingCache.set(chapterNumber, validResults);

      logger.info(`${validResults.length}件の解決された伏線を検出しました`, { chapterNumber });
      return validResults;
    } catch (error) {
      logger.error('解決された伏線の検出に失敗しました', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });
      return [];
    }
  }

  /**
   * 新しい伏線を生成する
   * 
   * @param content 章コンテンツ
   * @param chapterNumber 章番号
   * @returns 生成された伏線配列
   */
  async generateNewForeshadowing(content: string, chapterNumber: number): Promise<any[]> {
    try {
      // 物語の状態情報を取得
      const narrativeState = await this.memoryManager.getNarrativeState(chapterNumber);

      // 既存のアクティブな伏線を取得
      const worldKnowledge = this.memoryManager.getLongTermMemory();
      const activeForeshadowing = await worldKnowledge.getUnresolvedForeshadowing();

      // アクティブな伏線IDのマップを作成（重複防止用）
      const existingForeshadowingIds = new Set(activeForeshadowing.map((f: { id: string }) => f.id));

      // 伏線生成プロンプト
      const prompt = `
以下の小説本文を分析し、今後の展開につながる新しい伏線を抽出または生成してください。

本文：
${content.substring(0, 6000)}

現在の物語状態：
- 現在の章: ${chapterNumber}
- 物語の状態: ${narrativeState.state || '不明'}
- 場所: ${narrativeState.location || '不明'}
- 現在の登場キャラクター: ${(narrativeState.presentCharacters || []).join(', ') || '不明'}

既存のアクティブな伏線（${activeForeshadowing.length}件）：
${activeForeshadowing.slice(0, 5).map((fs: { description: string }) => `- ${fs.description}`).join('\n')}

新しい伏線を最大3つ提案してください。各伏線には以下の情報を含めてください：
- 伏線の説明（明確かつ具体的に）
- 伏線の緊急度（low/medium/high）
- 想定される回収方法

JSONフォーマットで出力してください：
[
  {
    "description": "伏線の説明",
    "urgency": "緊急度(low/medium/high)",
    "potentialResolution": "想定される回収方法"
  }
]

伏線は物語の流れに自然に溶け込むものを選び、既存の伏線と重複しないようにしてください。
`;

      // APIスロットリングを使用して生成を実行
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(prompt, {
          temperature: 0.6,
          purpose: 'generation',
          responseFormat: 'json'
        })
      );

      // レスポンスを解析
      const newForeshadowing = JsonParser.parseFromAIResponse<any[]>(response, []);

      // 結果を検証し、有効な伏線のみを返す
      const validForeshadowing = Array.isArray(newForeshadowing)
        ? newForeshadowing.filter(item =>
          item &&
          item.description &&
          item.description.length > 10 &&
          item.potentialResolution
        )
        : [];

      logger.info(`${validForeshadowing.length}件の新しい伏線を生成しました`, { chapterNumber });
      return validForeshadowing;
    } catch (error) {
      logger.error('新しい伏線の生成に失敗しました', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });
      return [];
    }
  }

  /**
   * テーマ存在の可視化
   * 章の内容からテーマの表現度合いを可視化します
   * 
   * @param content 章の内容
   * @param theme テーマ
   * @returns 可視化情報
   */
  async visualizeThemePresence(content: string, theme: string): Promise<ThemePresenceVisualization> {
    try {
      logger.info(`テーマ「${theme}」の存在感を可視化します`);

      // 章を10個のセグメントに分割
      const segmentLength = Math.ceil(content.length / 10);
      const segments: string[] = [];

      for (let i = 0; i < 10; i++) {
        const start = i * segmentLength;
        const end = Math.min(start + segmentLength, content.length);
        segments.push(content.substring(start, end));
      }

      // 各セグメントでのテーマ存在度を検出
      const presenceMap: Array<{ position: number, strength: number }> = [];
      const keywordMatches: Array<{ index: number, context: string }> = [];

      // テーマに関連するキーワードのパターン（正規表現）
      const themePattern = new RegExp(`${theme}|${this.getRelatedKeywords(theme).join('|')}`, 'gi');

      // 各セグメントを分析
      segments.forEach((segment, index) => {
        // 単純なキーワードマッチング
        const matches = segment.match(themePattern) || [];
        const matchCount = matches.length;

        // キーワードの出現頻度に基づく強度計算
        const baseStrength = Math.min(10, matchCount * 2);

        // 各マッチの文脈を記録
        for (const match of matches) {
          const matchIndex = segment.indexOf(match);
          if (matchIndex >= 0) {
            const start = Math.max(0, matchIndex - 20);
            const end = Math.min(segment.length, matchIndex + match.length + 20);
            const context = segment.substring(start, end);

            keywordMatches.push({
              index: index * segmentLength + matchIndex,
              context
            });
          }
        }

        // セグメントの結果を記録
        presenceMap.push({
          position: (index + 0.5) / 10, // セグメントの中央位置（0-1）
          strength: baseStrength || 1 // 最低1の強度
        });
      });

      // 最も強い表現箇所を特定（上位3つまで）
      const highPoints = keywordMatches
        .sort((a, b) => b.context.length - a.context.length)
        .slice(0, 3)
        .map(match => ({
          position: match.index / content.length, // 相対位置（0-1）
          excerpt: match.context
        }));

      // 全体スコアを計算（単純な平均）
      const overallScore = presenceMap.reduce((sum, item) => sum + item.strength, 0) / presenceMap.length;

      logger.info(`テーマ「${theme}」の可視化が完了しました`, {
        overallScore,
        highPointsCount: highPoints.length
      });

      return {
        presenceMap,
        highPoints,
        overallScore
      };
    } catch (error) {
      logger.error(`テーマ「${theme}」の可視化に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });

      // エラー時はダミーデータを返す
      return {
        presenceMap: [
          { position: 0.05, strength: 2 },
          { position: 0.15, strength: 3 },
          { position: 0.25, strength: 4 },
          { position: 0.35, strength: 5 },
          { position: 0.45, strength: 6 },
          { position: 0.55, strength: 6 },
          { position: 0.65, strength: 7 },
          { position: 0.75, strength: 8 },
          { position: 0.85, strength: 7 },
          { position: 0.95, strength: 5 }
        ],
        highPoints: [],
        overallScore: 5
      };
    }
  }

  /**
   * テーマと物語要素の関連性を分析する
   * 
   * @param theme テーマ
   * @param elementType 物語要素タイプ（'character', 'setting', 'conflict' など）
   * @param context 物語要素の文脈情報
   * @returns 関連性分析と強化提案
   */
  async analyzeThemeElementResonance(
    theme: string,
    elementType: string,
    context: string
  ): Promise<ThemeElementResonance> {
    try {
      logger.info(`テーマ「${theme}」と要素「${elementType}」の共鳴を分析します`);

      // 分析プロンプト
      const prompt = `
テーマと物語要素の関連性分析

テーマ: ${theme}
物語要素: ${elementType}
文脈: ${context}

以下の項目について分析してください：
1. このテーマとこの物語要素の関連性（0-10のスケール）
2. この物語要素を通じてテーマをより強く表現するための具体的な提案（3つ）
3. この組み合わせから得られる象徴的な意味や可能性

JSONフォーマットで結果を返してください：
{
  "relevance": 数値,
  "suggestions": ["提案1", "提案2", "提案3"],
  "symbolicPotential": "象徴的な意味や可能性の説明"
}`;

      // APIスロットリングを利用してリクエスト
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(prompt, {
          temperature: 0.4,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );

      // デフォルト値
      const defaultResult: ThemeElementResonance = {
        relevance: 5,
        suggestions: [
          `${elementType}を通じて「${theme}」をより明確に表現する`,
          `${elementType}に「${theme}」に関連する特性や挑戦を追加する`,
          `${elementType}と「${theme}」の矛盾や緊張関係を探る`
        ],
        symbolicPotential: `${theme}と${elementType}の組み合わせには、より深い象徴的な可能性があります`
      };

      // レスポンスを解析
      const result = JsonParser.parseFromAIResponse<ThemeElementResonance>(response, defaultResult);

      // 結果の検証
      if (typeof result.relevance !== 'number') {
        result.relevance = 5;
      }

      if (!Array.isArray(result.suggestions) || result.suggestions.length === 0) {
        result.suggestions = defaultResult.suggestions;
      }

      if (!result.symbolicPotential) {
        result.symbolicPotential = defaultResult.symbolicPotential;
      }

      logger.info(`テーマ「${theme}」と要素「${elementType}」の共鳴分析が完了しました`, {
        relevance: result.relevance,
        suggestionsCount: result.suggestions.length
      });

      return result;
    } catch (error) {
      logger.error('テーマ要素共鳴分析に失敗しました', {
        error: error instanceof Error ? error.message : String(error),
        theme,
        elementType
      });

      // エラー時はデフォルト値を返す
      return {
        relevance: 5,
        suggestions: [
          `${elementType}を通じて「${theme}」をより明確に表現してください`,
          `${elementType}に「${theme}」に関連する要素を取り入れてください`,
          `${elementType}の発展において「${theme}」を意識してください`
        ],
        symbolicPotential: `${theme}と${elementType}の関係性をさらに探求することで物語に深みが生まれるでしょう`
      };
    }
  }

  /**
   * 象徴とイメージの分析
   * テキスト内の象徴、隠喩、比喩などを分析します
   * 
   * @param content 分析対象のテキスト
   * @returns 象徴分析結果
   */
  async analyzeSymbolismAndImagery(content: string): Promise<SymbolismAnalysis> {
    try {
      logger.info('象徴とイメージの分析を実行します');

      // キャッシュキーの生成
      const cacheKey = this.generateCacheKey(content);

      // キャッシュをチェック
      const cachedAnalysis = this.symbolismCache.get(cacheKey);
      if (cachedAnalysis) {
        logger.debug('キャッシュから象徴分析結果を取得しました');
        return cachedAnalysis;
      }

      // 分析プロンプト
      const prompt = `
以下の小説テキストに含まれる象徴、隠喩、比喩などの文学的技法を分析してください。

テキスト：
${content.substring(0, 6000)}

以下の項目について分析を行ってください：
1. 主要な象徴とその意味
2. 繰り返されるイメージやモチーフ
3. 隠喩表現とその効果
4. 比喩表現とその効果
5. これらの象徴・イメージがテーマとどのように関連しているか

JSONフォーマットで結果を返してください：
{
  "symbols": [
    {
      "symbol": "象徴の名前",
      "occurrences": ["出現箇所1", "出現箇所2"],
      "meaning": "意味の解釈",
      "thematicConnection": "テーマとの関連"
    }
  ],
  "motifs": [
    {
      "motif": "モチーフの名前",
      "occurrences": ["出現箇所1", "出現箇所2"],
      "significance": "重要性の説明"
    }
  ],
  "metaphors": [
    {
      "expression": "隠喩表現",
      "context": "文脈",
      "interpretation": "解釈"
    }
  ],
  "similes": [
    {
      "expression": "比喩表現",
      "context": "文脈",
      "effect": "効果の説明"
    }
  ],
  "thematicIntegration": "象徴・イメージとテーマの統合についての総合的分析"
}`;

      // APIスロットリングを使用して分析を実行
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(prompt, {
          temperature: 0.3,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );

      // デフォルト値
      const defaultAnalysis: SymbolismAnalysis = {
        symbols: [],
        motifs: [],
        metaphors: [],
        similes: [],
        thematicIntegration: "象徴やイメージの使用が限定的なため、テーマとの統合に改善の余地があります"
      };

      // レスポンスを解析
      const analysis = JsonParser.parseFromAIResponse<SymbolismAnalysis>(response, defaultAnalysis);

      // 結果の検証と修正
      if (!Array.isArray(analysis.symbols)) analysis.symbols = [];
      if (!Array.isArray(analysis.motifs)) analysis.motifs = [];
      if (!Array.isArray(analysis.metaphors)) analysis.metaphors = [];
      if (!Array.isArray(analysis.similes)) analysis.similes = [];

      // キャッシュに保存
      this.symbolismCache.set(cacheKey, analysis);

      logger.info('象徴とイメージの分析が完了しました', {
        symbolsCount: analysis.symbols.length,
        motifsCount: analysis.motifs.length,
        metaphorsCount: analysis.metaphors.length,
        similesCount: analysis.similes.length
      });

      return analysis;
    } catch (error) {
      logger.error('象徴とイメージの分析に失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });

      // エラー時はデフォルト値を返す
      return {
        symbols: [],
        motifs: [],
        metaphors: [],
        similes: [],
        thematicIntegration: "分析中にエラーが発生しました"
      };
    }
  }

  /**
   * テーマの一貫性分析
   * 複数の章にわたるテーマの一貫性と発展を分析します
   * 
   * @param contents 章ごとの内容の配列
   * @param theme 分析対象のテーマ
   * @returns テーマ一貫性分析結果
   */
  async analyzeThemeConsistency(contents: string[], theme: string): Promise<ThemeConsistencyAnalysis> {
    try {
      logger.info(`テーマ「${theme}」の一貫性を分析します`, {
        chaptersCount: contents.length
      });

      if (contents.length < 2) {
        throw new Error('一貫性分析には少なくとも2つの章が必要です');
      }

      // 各章の要約を生成
      const summaries = await Promise.all(
        contents.map(async (content, index) => {
          try {
            // 短い要約を生成
            const prompt = `
以下の章を100-150文字程度に要約してください。特にテーマ「${theme}」に関連する要素に注目してください。

章 ${index + 1}:
${content.substring(0, 3000)}

要約:`;

            const summary = await apiThrottler.throttledRequest(() =>
              this.geminiAdapter.generateText(prompt, {
                temperature: 0.1,
                targetLength: 150
              })
            );

            return { chapterIndex: index, summary };
          } catch (error) {
            logger.warn(`章 ${index + 1} の要約生成に失敗しました`, {
              error: error instanceof Error ? error.message : String(error)
            });
            return { chapterIndex: index, summary: `章 ${index + 1} の要約（生成失敗）` };
          }
        })
      );

      // 一貫性分析プロンプト
      const prompt = `
次の各章の要約を分析し、テーマ「${theme}」の一貫性と発展を評価してください。

${summaries.map(s => `章 ${s.chapterIndex + 1}:\n${s.summary}`).join('\n\n')}

以下の項目について分析してください：
1. テーマの一貫性スコア（0-10）
2. 章ごとのテーマの強度変化
3. テーマの発展パターン（螺旋状、直線的、対立解消など）
4. 不整合や弱い部分
5. テーマ発展の改善提案

JSONフォーマットで結果を返してください：
{
  "consistencyScore": 数値,
  "strengthByChapter": [数値, 数値, ...],
  "developmentPattern": "パターンの説明",
  "weakPoints": [
    { "chapter": 章番号, "issue": "問題の説明" }
  ],
  "improvementSuggestions": ["提案1", "提案2", "提案3"]
}`;

      // APIスロットリングを使用して分析を実行
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(prompt, {
          temperature: 0.3,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );

      // デフォルト値
      const defaultAnalysis: ThemeConsistencyAnalysis = {
        consistencyScore: 7,
        strengthByChapter: contents.map(() => 5),
        developmentPattern: "テーマの発展が適度に続いています",
        weakPoints: [],
        improvementSuggestions: [
          `テーマ「${theme}」をより明確に表現してください`,
          "テーマの複数の側面を探求してください",
          "テーマの反対側の視点も提示してください"
        ]
      };

      // レスポンスを解析
      const analysis = JsonParser.parseFromAIResponse<ThemeConsistencyAnalysis>(response, defaultAnalysis);

      // 結果の検証と修正
      if (!Array.isArray(analysis.strengthByChapter) || analysis.strengthByChapter.length !== contents.length) {
        analysis.strengthByChapter = contents.map(() => 5);
      }

      if (!Array.isArray(analysis.weakPoints)) {
        analysis.weakPoints = [];
      }

      if (!Array.isArray(analysis.improvementSuggestions)) {
        analysis.improvementSuggestions = defaultAnalysis.improvementSuggestions;
      }

      logger.info(`テーマ「${theme}」の一貫性分析が完了しました`, {
        consistencyScore: analysis.consistencyScore,
        weakPointsCount: analysis.weakPoints.length
      });

      return analysis;
    } catch (error) {
      logger.error(`テーマ「${theme}」の一貫性分析に失敗しました`, {
        error: error instanceof Error ? error.message : String(error),
        chaptersCount: contents.length
      });

      // エラー時はデフォルト値を返す
      return {
        consistencyScore: 7,
        strengthByChapter: contents.map(() => 5),
        developmentPattern: "テーマの発展に関する分析中にエラーが発生しました",
        weakPoints: [],
        improvementSuggestions: [
          `テーマ「${theme}」をより明確に表現してください`,
          "テーマの複数の側面を探求してください",
          "章ごとのテーマの表現に一貫性を持たせてください"
        ]
      };
    }
  }

  /**
   * イメージマップの作成
   * 作品全体の象徴とイメージのマッピングを作成します
   * 
   * @param contents 章ごとの内容の配列
   * @returns イメージマップ
   */
  async createImageryMapping(contents: string[]): Promise<ThemeImageryMapping> {
    try {
      logger.info('イメージマップの作成を開始します', {
        chaptersCount: contents.length
      });

      if (contents.length === 0) {
        throw new Error('イメージマップ作成には少なくとも1つの章が必要です');
      }

      // 各章の象徴分析を実行
      const chapterAnalyses = await Promise.all(
        contents.map((content, index) =>
          this.analyzeSymbolismAndImagery(content)
            .then(analysis => ({ chapterIndex: index, analysis }))
            .catch(error => {
              logger.warn(`章 ${index + 1} の象徴分析に失敗しました`, {
                error: error instanceof Error ? error.message : String(error)
              });
              return {
                chapterIndex: index,
                analysis: {
                  symbols: [],
                  motifs: [],
                  metaphors: [],
                  similes: [],
                  thematicIntegration: "分析に失敗しました"
                }
              };
            })
        )
      );

      // 全章の象徴とモチーフを集計
      const allSymbols = new Map<string, { count: number, chapters: number[], meanings: string[] }>();
      const allMotifs = new Map<string, { count: number, chapters: number[], significances: string[] }>();

      chapterAnalyses.forEach(({ chapterIndex, analysis }) => {
        // 象徴を集計
        analysis.symbols.forEach((symbol: { symbol: string; occurrences?: string[]; meaning?: string }) => {
          const key = symbol.symbol.toLowerCase();
          const existing = allSymbols.get(key) || { count: 0, chapters: [], meanings: [] };

          existing.count += symbol.occurrences?.length || 1;
          existing.chapters.push(chapterIndex);
          if (symbol.meaning && !existing.meanings.includes(symbol.meaning)) {
            existing.meanings.push(symbol.meaning);
          }

          allSymbols.set(key, existing);
        });

        // モチーフを集計
        analysis.motifs.forEach((motif: { motif: string; occurrences?: string[]; significance?: string }) => {
          const key = motif.motif.toLowerCase();
          const existing = allMotifs.get(key) || { count: 0, chapters: [], significances: [] };

          existing.count += motif.occurrences?.length || 1;
          existing.chapters.push(chapterIndex);
          if (motif.significance && !existing.significances.includes(motif.significance)) {
            existing.significances.push(motif.significance);
          }

          allMotifs.set(key, existing);
        });
      });

      // イメージマップを構築
      const result: ThemeImageryMapping = {
        dominantSymbols: Array.from(allSymbols.entries())
          .map(([symbol, data]) => ({
            name: symbol,
            occurrenceCount: data.count,
            chapterOccurrences: [...new Set(data.chapters)].sort((a, b) => a - b),
            meanings: data.meanings
          }))
          .sort((a, b) => b.occurrenceCount - a.occurrenceCount)
          .slice(0, 10),

        recurringMotifs: Array.from(allMotifs.entries())
          .map(([motif, data]) => ({
            name: motif,
            occurrenceCount: data.count,
            chapterOccurrences: [...new Set(data.chapters)].sort((a, b) => a - b),
            significances: data.significances
          }))
          .sort((a, b) => b.occurrenceCount - a.occurrenceCount)
          .slice(0, 10),

        imageryNetworks: this.identifyImageryNetworks(allSymbols, allMotifs),

        developmentSuggestions: [
          "物語全体を通じて主要な象徴を一貫して発展させてください",
          "対立する象徴群を対比的に使用してテーマを強調してください",
          "象徴・モチーフの出現パターンに意図を持たせてください"
        ]
      };

      // 開発提案の生成
      if (result.dominantSymbols.length > 0 && contents.length > 1) {
        try {
          const topSymbols = result.dominantSymbols.slice(0, 3).map((s: { name: string }) => s.name).join('、');
          const topMotifs = result.recurringMotifs.slice(0, 3).map((m: { name: string }) => m.name).join('、');

          const prompt = `
以下の小説で使用されている主要な象徴とモチーフに基づいて、イメージの活用と発展に関する提案を行ってください。

主要な象徴: ${topSymbols}
繰り返されるモチーフ: ${topMotifs}

これらの象徴とモチーフをより効果的に活用するための提案を3つ示してください。
各提案は具体的かつ実行可能なものにしてください。

提案を配列形式で出力してください:
["提案1", "提案2", "提案3"]`;

          // APIスロットリングを使用して提案を生成
          const response = await apiThrottler.throttledRequest(() =>
            this.geminiAdapter.generateText(prompt, {
              temperature: 0.4,
              purpose: 'suggestion',
              responseFormat: 'json'
            })
          );

          // レスポンスを解析
          const suggestions = JsonParser.parseFromAIResponse<string[]>(response, []);

          if (Array.isArray(suggestions) && suggestions.length > 0) {
            result.developmentSuggestions = suggestions;
          }
        } catch (error) {
          logger.warn('象徴・モチーフの開発提案生成に失敗しました', {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      logger.info('イメージマップの作成が完了しました', {
        dominantSymbolsCount: result.dominantSymbols.length,
        recurringMotifsCount: result.recurringMotifs.length,
        networksCount: result.imageryNetworks.length
      });

      return result;
    } catch (error) {
      logger.error('イメージマップの作成に失敗しました', {
        error: error instanceof Error ? error.message : String(error),
        chaptersCount: contents.length
      });

      // エラー時はデフォルト値を返す
      return {
        dominantSymbols: [],
        recurringMotifs: [],
        imageryNetworks: [],
        developmentSuggestions: [
          "物語全体を通じて一貫したイメージやモチーフを発展させてください",
          "象徴的な要素を通じてテーマを強調してください",
          "対比的なイメージを使用して意味の層を深めてください"
        ]
      };
    }
  }

  /**
   * モチーフの追跡
   * 特定のモチーフが物語全体でどのように出現し発展するかを追跡します
   * 
   * @param motif モチーフ名
   * @param contents 章ごとの内容の配列
   * @returns モチーフ追跡結果
   */
  async trackMotif(motif: string, contents: string[]): Promise<MotifTrackingResult> {
    try {
      logger.info(`モチーフ「${motif}」の追跡を開始します`, {
        chaptersCount: contents.length
      });

      if (contents.length === 0) {
        throw new Error('モチーフ追跡には少なくとも1つの章が必要です');
      }

      // 各章でのモチーフ出現を分析
      const chapterOccurrences = await Promise.all(
        contents.map(async (content, index) => {
          try {
            // モチーフ分析プロンプト
            const prompt = `
以下の章から、モチーフ「${motif}」の出現と使われ方を分析してください。

章 ${index + 1}:
${content.substring(0, 4000)}

以下の項目について分析してください：
1. モチーフの出現回数と重要度（0-10）
2. モチーフが具体的に現れる箇所（最大3つ）
3. このモチーフがどのように使われているか（直接的か象徴的か）
4. モチーフの意味や効果
5. モチーフの変化や発展（前の章と比較して）

JSONフォーマットで結果を返してください：
{
  "occurrenceCount": 数値,
  "significance": 数値(0-10),
  "examples": ["例1", "例2", "例3"],
  "usage": "直接的|象徴的|両方",
  "meaning": "モチーフの意味や効果",
  "development": "モチーフの変化や発展"
}`;

            // APIスロットリングを使用して分析を実行
            const response = await apiThrottler.throttledRequest(() =>
              this.geminiAdapter.generateText(prompt, {
                temperature: 0.2,
                purpose: 'analysis',
                responseFormat: 'json'
              })
            );

            // デフォルト値
            const defaultResult = {
              occurrenceCount: 0,
              significance: 0,
              examples: [],
              usage: "なし",
              meaning: "この章ではモチーフが検出されませんでした",
              development: "変化なし"
            };

            // レスポンスを解析
            const result = JsonParser.parseFromAIResponse(response, defaultResult);

            return {
              chapterIndex: index,
              analysis: result
            };
          } catch (error) {
            logger.warn(`章 ${index + 1} のモチーフ分析に失敗しました`, {
              error: error instanceof Error ? error.message : String(error)
            });

            return {
              chapterIndex: index,
              analysis: {
                occurrenceCount: 0,
                significance: 0,
                examples: [],
                usage: "分析失敗",
                meaning: "分析中にエラーが発生しました",
                development: "不明"
              }
            };
          }
        })
      );

      // 発展パターン分析プロンプト
      const occurrencesText = chapterOccurrences
        .map(({ chapterIndex, analysis }) =>
          `章 ${chapterIndex + 1}: 出現回数=${analysis.occurrenceCount}, 重要度=${analysis.significance}, 使用方法=${analysis.usage}`
        )
        .join('\n');

      const developmentPrompt = `
モチーフ「${motif}」の各章での出現パターンを分析し、その発展と全体的なパターンを特定してください。

出現パターン:
${occurrencesText}

以下の項目について分析してください：
1. モチーフの発展パターン（上昇、下降、波状、強調など）
2. モチーフとテーマの関連性
3. モチーフの効果的な使用方法と改善提案

JSONフォーマットで結果を返してください：
{
  "developmentPattern": "発展パターンの説明",
  "thematicConnection": "テーマとの関連性",
  "effectiveUses": ["効果的な使用例1", "効果的な使用例2"],
  "suggestions": ["提案1", "提案2", "提案3"]
}`;

      // APIスロットリングを使用して発展パターン分析を実行
      const developmentResponse = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(developmentPrompt, {
          temperature: 0.3,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );

      // デフォルト値
      const defaultDevelopment = {
        developmentPattern: "明確なパターンが検出されませんでした",
        thematicConnection: "テーマとの明確な関連性は検出されませんでした",
        effectiveUses: [],
        suggestions: [
          `モチーフ「${motif}」をより一貫して使用してください`,
          "モチーフとテーマの関連性を強化してください",
          "モチーフの象徴的な使用を検討してください"
        ]
      };

      // レスポンスを解析
      const developmentAnalysis = JsonParser.parseFromAIResponse(developmentResponse, defaultDevelopment);

      // 結果の構築
      const result: MotifTrackingResult = {
        motif,
        occurrencesByChapter: chapterOccurrences.map(({ chapterIndex, analysis }) => ({
          chapter: chapterIndex + 1,
          occurrenceCount: analysis.occurrenceCount,
          significance: analysis.significance,
          examples: analysis.examples || [],
          usage: analysis.usage,
          meaning: analysis.meaning
        })),
        developmentPattern: developmentAnalysis.developmentPattern,
        thematicConnection: developmentAnalysis.thematicConnection,
        effectiveUses: developmentAnalysis.effectiveUses || [],
        suggestions: developmentAnalysis.suggestions || defaultDevelopment.suggestions
      };

      logger.info(`モチーフ「${motif}」の追跡が完了しました`, {
        totalOccurrences: result.occurrencesByChapter.reduce((sum: number, item: { occurrenceCount: number }) => sum + item.occurrenceCount, 0)
      });

      return result;
    } catch (error) {
      logger.error(`モチーフ「${motif}」の追跡に失敗しました`, {
        error: error instanceof Error ? error.message : String(error),
        chaptersCount: contents.length
      });

      // エラー時はデフォルト値を返す
      return {
        motif,
        occurrencesByChapter: contents.map((_, index) => ({
          chapter: index + 1,
          occurrenceCount: 0,
          significance: 0,
          examples: [],
          usage: "分析失敗",
          meaning: "分析中にエラーが発生しました"
        })),
        developmentPattern: "分析中にエラーが発生しました",
        thematicConnection: "不明",
        effectiveUses: [],
        suggestions: [
          `モチーフ「${motif}」の使用を一貫させてください`,
          "モチーフの象徴的な意味を明確にしてください",
          "モチーフとテーマの関連性を強化してください"
        ]
      };
    }
  }

  async saveThemeEnhancements(chapterNumber: number, enhancements: ThemeEnhancement[]): Promise<void> {
    try {
      // ディレクトリの存在を確認し、必要に応じて作成
      const dirPath = 'theme-enhancements';
      try {
        const dirExists = await this.storageAdapter.directoryExists(dirPath);
        if (!dirExists) {
          await this.storageAdapter.createDirectory(dirPath);
        }
      } catch (dirError) {
        logger.warn(`Failed to create directory for theme enhancements, attempting to save file anyway`, {
          error: dirError instanceof Error ? dirError.message : String(dirError)
        });
      }

      // 次の章用のファイルパスを構築
      const filePath = `${dirPath}/chapter_${chapterNumber + 1}.json`;

      // JSONにシリアライズして保存
      await this.storageAdapter.writeFile(filePath, JSON.stringify(enhancements));

      logger.info(`Saved ${enhancements.length} theme enhancements for next chapter`, {
        nextChapter: chapterNumber + 1,
        filePath
      });
    } catch (error) {
      logger.error('Failed to save theme enhancements', {
        error: error instanceof Error ? error.message : String(error),
        nextChapter: chapterNumber + 1
      });
    }
  }

  /**
 * 重要イベントの抽出と保存処理
 * 
 * 章の内容から重要イベントを抽出し、EventMemoryに保存します
 * @param {string} content 章の内容
 * @param {number} chapterNumber 章番号 
 */
  async extractAndStoreSignificantEvents(content: string, chapterNumber: number): Promise<void> {
    try {
      logger.debug(`Extracting significant events from chapter ${chapterNumber}`);

      // 重要イベント抽出用のプロンプト
      const prompt = `
以下の章から、物語上重要かつ将来の章でも覚えておくべきイベントを抽出してください。
特に：
- キャラクター間の重要な対話、対立、約束
- 警告やルール違反とその結果
- 場所に関連する特別な出来事
- キャラクターが受けた重要な教訓
- 初めて起きた出来事やキャラクターの重要な決断

章の内容:
${content.substring(0, 5000)}...

JSON形式で返却してください。各イベントには以下を含めてください：
- description: イベントの詳細説明
- involvedCharacters: 関与したキャラクター（配列）
- location: イベントの場所
- type: イベントタイプ（WARNING, CONFLICT, PROMISE, DISCOVERY, RULE_VIOLATION など）
- significance: 重要度（0.0～1.0）
- consequence: イベントの結果や影響（ある場合）
`;

      // APIスロットリングを利用してリクエスト
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(prompt, {
          temperature: 0.3,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );

      try {
        // JSONの解析
        const jsonMatch = response.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) ||
          response.match(/\[[\s\S]*?\]/);

        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
        const events = JSON.parse(jsonStr);

        if (!Array.isArray(events)) {
          throw new Error('Invalid events format');
        }

        // 重要度の高いイベントのみをフィルタリング
        const significantEvents = events.filter(event => event.significance >= 0.6);

        // イベントを記録
        for (const event of significantEvents) {
          await this.memoryManager.recordSignificantEvent({
            id: `event-${chapterNumber}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            chapterNumber,
            description: event.description,
            involvedCharacters: Array.isArray(event.involvedCharacters) ? event.involvedCharacters : [],
            location: event.location || '',
            type: event.type || 'EVENT',
            significance: event.significance || 0.7,
            consequence: event.consequence,
            timestamp: new Date().toISOString()
          });
        }

        logger.info(`Extracted and stored ${significantEvents.length} significant events from chapter ${chapterNumber}`);
      } catch (parseError) {
        logger.error('Failed to parse significant events', {
          error: parseError instanceof Error ? parseError.message : String(parseError),
          response: response.substring(0, 200)
        });
      }
    } catch (error) {
      logger.error('Failed to extract and store significant events', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });
    }
  }

  // =========================================================================
  // 以下、プライベートヘルパーメソッド
  // =========================================================================

  /**
   * キャッシュキーの生成
   */
  private generateCacheKey(content: string, themes?: string[]): string {
    // 単純なハッシュ関数
    let hash = 0;
    const text = content.substring(0, 5000) + (themes ? themes.join('') : '');

    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit整数に変換
    }

    return hash.toString();
  }

  /**
   * 分析結果を検証して必要に応じて補完する
   */
  private validateAnalysis(analysis: ThemeResonanceAnalysis, originalThemes: string[]): ThemeResonanceAnalysis {
    // テーマが無い場合は作成
    if (!analysis.themes) {
      analysis.themes = {};
    }

    // 指定された全テーマが含まれているか確認し、足りないものを補完
    originalThemes.forEach(theme => {
      if (!analysis.themes![theme]) {
        analysis.themes![theme] = {
          explicitMentions: [],
          implicitExpressions: [],
          strength: 5, // デフォルト値
          expressionMethods: [],
          relatedThemes: []
        };
      }
    });

    // 全体的な一貫性が無い場合はデフォルト値を設定
    if (typeof analysis.overallCoherence !== 'number' || isNaN(analysis.overallCoherence)) {
      analysis.overallCoherence = 7;
    }

    // 支配的テーマが無い場合は設定
    if (!analysis.dominantTheme) {
      // 強度が最も高いテーマを特定
      let maxStrength = 0;
      let dominantTheme = '';

      if (analysis.themes) {
        for (const [theme, info] of Object.entries(analysis.themes)) {
          if (info.strength !== undefined && info.strength > maxStrength) {
            maxStrength = info.strength;
            dominantTheme = theme;
          }
        }
      }

      analysis.dominantTheme = dominantTheme || originalThemes[0] || '成長';
    }

    // テーマ間の緊張関係が無い場合は空オブジェクトを設定
    if (!analysis.themeTensions) {
      analysis.themeTensions = {};
    }

    return analysis;
  }

  /**
   * 軽視されているテーマを特定
   */
  private identifyNeglectedThemes(analysis: ThemeResonanceAnalysis): Array<{
    name: string;
    strength: number;
    currentExpressions: string[];
  }> {
    try {
      const neglectedThemes: Array<{
        name: string;
        strength: number;
        currentExpressions: string[];
      }> = [];

      // themes が undefined の場合は空配列を返す
      if (!analysis.themes) {
        return [];
      }

      // 各テーマの表現強度を評価
      Object.entries(analysis.themes).forEach(([themeName, themeInfo]) => {
        // 強度が6未満のテーマを軽視されていると判断
        if (themeInfo.strength !== undefined && themeInfo.strength < 6) {
          neglectedThemes.push({
            name: themeName,
            strength: themeInfo.strength,
            currentExpressions: [
              ...(themeInfo.explicitMentions || []),
              ...(themeInfo.implicitExpressions || [])
            ]
          });
        }
      });

      // 強度の低い順にソート
      return neglectedThemes.sort((a, b) => a.strength - b.strength);
    } catch (error) {
      logger.error('軽視されたテーマの特定に失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * テーマ表現アプローチの生成
   */
  private async generateThemeApproaches(themeName: string): Promise<string[]> {
    try {
      logger.debug(`テーマ「${themeName}」のアプローチを生成します`);

      const prompt = `
以下のテーマを小説で効果的に表現するための具体的アプローチを5つ提案してください：

テーマ: ${themeName}

各アプローチは異なる表現方法を用い、50-80文字程度の具体的な説明を含めてください。
会話、内面描写、シンボリズム、行動、背景設定など、多様な表現技法を考慮してください。

JSON形式で回答してください：
["アプローチ1", "アプローチ2", "アプローチ3", "アプローチ4", "アプローチ5"]`;

      // APIスロットリングを利用してリクエスト
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(prompt, {
          temperature: 0.6,
          responseFormat: 'json'
        })
      );

      // レスポンスの解析
      const approaches = JsonParser.parseFromAIResponse<string[]>(response, []);

      // 結果の検証
      if (Array.isArray(approaches) && approaches.length > 0) {
        return approaches.slice(0, 5);
      } else {
        // 解析に失敗した場合はテキストから行を抽出
        return this.extractApproachesFromText(response, themeName);
      }
    } catch (error) {
      logger.error(`テーマ「${themeName}」のアプローチ生成に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });

      // エラー時はデフォルトアプローチを返す
      return this.getDefaultApproaches(themeName);
    }
  }

  /**
   * テキストからアプローチを抽出する
   */
  private extractApproachesFromText(text: string, themeName: string): string[] {
    try {
      // 行に分割
      const lines = text.split('\n');

      // 有用そうな行を抽出
      const approaches = lines
        .map(line => line.trim())
        .filter(line =>
          line.length > 20 &&
          !line.startsWith('```') &&
          !line.startsWith('テーマ:') &&
          !line.startsWith('JSON') &&
          !line.startsWith('[') &&
          !line.startsWith(']')
        )
        .map(line => line.replace(/^[0-9\-\*•]+\.\s*/, ''))  // 行頭の番号・記号を削除
        .slice(0, 5);  // 最大5つまで

      return approaches.length > 0 ? approaches : this.getDefaultApproaches(themeName);
    } catch (error) {
      logger.error('テキストからのアプローチ抽出に失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      return this.getDefaultApproaches(themeName);
    }
  }

  /**
   * デフォルトのテーマアプローチを取得
   */
  private getDefaultApproaches(themeName: string): string[] {
    return [
      `キャラクターの内面的葛藤を通じて「${themeName}」を探求する`,
      `対照的な状況や人物を通じて「${themeName}」の多面性を示す`,
      `物語の転換点で「${themeName}」に関連する重要な決断を組み込む`,
      `象徴やメタファーを使って「${themeName}」を暗示的に表現する`,
      `会話や議論を通じて「${themeName}」に関する異なる視点を提示する`
    ];
  }

  /**
   * フォールバック用の最小限の分析結果を作成
   */
  private createFallbackAnalysis(themes: string[]): ThemeResonanceAnalysis {
    const effectiveThemes = themes.length > 0 ? themes : ['成長', '変化', '挑戦'];

    // テーマごとのエントリを作成
    const themeEntries = effectiveThemes.map(theme => [
      theme,
      {
        explicitMentions: [],
        implicitExpressions: [],
        strength: 5,
        expressionMethods: ['対話', '描写', '行動'],
        relatedThemes: effectiveThemes.filter(t => t !== theme)
      }
    ]);

    return {
      themes: Object.fromEntries(themeEntries),
      overallCoherence: 7,
      dominantTheme: effectiveThemes[0],
      themeTensions: {}
    };
  }

  /**
   * テーマに関連するキーワードを取得
   */
  private getRelatedKeywords(theme: string): string[] {
    // テーマ別の関連キーワードマップ
    const keywordMap: { [theme: string]: string[] } = {
      '成長': ['成熟', '発展', '進化', '変化', '学び', '成長する', '変わる', '経験'],
      '愛': ['愛情', '恋', '愛する', '慈しむ', '情愛', '思いやり', '絆', '心'],
      '正義': ['公正', '正義感', '正しさ', '公平', '倫理', '道徳', '善', '悪'],
      '自由': ['解放', '自由意志', '独立', '選択', '束縛', '制約', '権利'],
      '希望': ['願い', '夢', '期待', '未来', '光', '希望的', '明るい', '可能性'],
      '運命': ['定め', '宿命', '必然', '偶然', '巡り合わせ', '予言', '予定'],
      '喪失': ['失う', '別れ', '死', '消失', '悲しみ', '悲嘆', '虚無', '孤独'],
      '復讐': ['仇', '報復', '恨み', '恨み', '恩讐', '恨む', '復讐心', '恨みを晴らす'],
      '孤独': ['孤立', '一人', '疎外', '孤独感', '寂しさ', '隔絶', '距離'],
      '友情': ['友達', '友', '絆', '信頼', '仲間', '友愛', '友情関係', '連帯'],
      '戦い': ['戦う', '闘争', '戦争', '対立', '抗争', '葛藤', '抵抗', '競争'],
      '人間性': ['人間らしさ', '人間味', '人間的', '人間らしい', '人間関係', '人間的な', '人間として'],
      '変化': ['変わる', '変容', '変遷', '変革', '変動', '変質', '転換', '異なる'],
      '挑戦': ['挑む', '困難', '試練', '苦難', '試す', '立ち向かう', '乗り越える', '克服']
    };

    // テーマが直接マップにある場合
    if (keywordMap[theme]) {
      return keywordMap[theme];
    }

    // 部分一致するテーマを探す
    for (const [key, keywords] of Object.entries(keywordMap)) {
      if (theme.includes(key) || key.includes(theme)) {
        return keywords;
      }
    }

    // デフォルトの関連キーワード
    return [
      theme + 'する',
      theme + 'な',
      theme + 'の',
      theme + '的',
      theme + 'さ'
    ];
  }

  /**
   * 解決した伏線を更新する
   */
  private async updateResolvedForeshadowing(
    resolvedForeshadowing: any[],
    chapterNumber: number
  ): Promise<void> {
    if (resolvedForeshadowing.length === 0) return;

    try {
      // WorldKnowledgeで伏線を解決
      const worldKnowledge = this.memoryManager.getLongTermMemory();

      for (const fs of resolvedForeshadowing) {
        await worldKnowledge.resolveForeshadowing(
          fs.id,
          chapterNumber,
          fs.resolutionDescription || `チャプター${chapterNumber}で解決`
        );
      }

      // MemoryManagerを通じて全体に通知
      await this.memoryManager.updateForeshadowingStatus(
        resolvedForeshadowing,
        chapterNumber
      );

      logger.info(`${resolvedForeshadowing.length}件の解決済み伏線を更新しました`);
    } catch (error) {
      logger.error('解決済み伏線の更新に失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 伏線計画の更新
   */
  private async updateForeshadowingPlan(chapterNumber: number): Promise<void> {
    try {
      // 現在アクティブな伏線を取得
      const worldKnowledge = this.memoryManager.getLongTermMemory();
      const activeForeshadowing = await worldKnowledge.getUnresolvedForeshadowing();

      // 物語状態を取得
      const narrativeState = await this.memoryManager.getNarrativeState(chapterNumber);

      // 数が少なすぎる場合は新しい伏線計画を提案
      if (activeForeshadowing.length < 3) {
        const newPlan = await this.suggestNewForeshadowingPlan(narrativeState, chapterNumber);

        // 提案を保存
        if (newPlan && newPlan.suggestions && newPlan.suggestions.length > 0) {
          for (const suggestion of newPlan.suggestions) {
            await worldKnowledge.addForeshadowing({
              description: suggestion.description,
              chapter_introduced: chapterNumber,
              urgency: 'low', // 計画段階なので低い緊急度
              potential_resolution: suggestion.potentialResolution
            });
          }
        }
      }

      // 緊急度の調整（古い伏線は緊急度を上げる）
      for (const fs of activeForeshadowing) {
        // 5章以上前の伏線で緊急度が低いものは更新
        if (chapterNumber - fs.chapter_introduced > 5 && fs.urgency === 'low') {
          await worldKnowledge.updateForeshadowing(fs.id, {
            urgency: 'medium'
          });
        }

        // 10章以上前の伏線で緊急度が中程度のものは更新
        if (chapterNumber - fs.chapter_introduced > 10 && fs.urgency === 'medium') {
          await worldKnowledge.updateForeshadowing(fs.id, {
            urgency: 'high'
          });
        }
      }
    } catch (error) {
      logger.error('伏線計画の更新に失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 新しい伏線計画を提案する
   */
  private async suggestNewForeshadowingPlan(narrativeState: any, chapterNumber: number): Promise<any> {
    try {
      // 最近のチャプター情報を取得
      const recentChapters = await this.memoryManager.getRecentChapterMemories(
        Math.max(1, chapterNumber - 3),
        3
      );

      // 現在のアーク情報を取得
      const currentArc = await this.memoryManager.getCurrentArc(chapterNumber);

      // プロンプトの構築
      const prompt = `
あなたは小説の伏線設計の専門家です。以下の情報を元に、これから設定すべき伏線を3つ考えてください。

## 現在の物語状態
${JSON.stringify(narrativeState, null, 2)}

## 現在のアーク
${JSON.stringify(currentArc, null, 2)}

## 最近のチャプター
${JSON.stringify(recentChapters, null, 2)}

指示: 現在の物語状態とアーク、最近のチャプターの内容を踏まえて、適切な伏線を3つ提案してください。
各伏線について、「description」（伏線の内容）と「potentialResolution」（想定される回収方法）を示してください。

出力形式:
{
  "suggestions": [
    {
      "description": "伏線の内容1",
      "potentialResolution": "想定される回収方法1"
    },
    {
      "description": "伏線の内容2",
      "potentialResolution": "想定される回収方法2"
    },
    {
      "description": "伏線の内容3",
      "potentialResolution": "想定される回収方法3"
    }
  ]
}
`;

      // デフォルト値となるオブジェクトを定義
      const defaultResponse = { suggestions: [] };

      // Geminiクライアントを使用して伏線提案を生成（スロットリング適用）
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(prompt, {
          temperature: 0.7,
          responseFormat: 'json'
        })
      );

      // JsonParserを使用してレスポンスを解析
      const parsedResult = JsonParser.parseFromAIResponse(response, defaultResponse);

      // 結果が期待する構造かどうか検証
      if (!parsedResult.suggestions || !Array.isArray(parsedResult.suggestions)) {
        logger.warn('伏線計画構造が不正です', {
          resultPreview: typeof response === 'string' ? response.substring(0, 200) : 'Invalid response'
        });
        return defaultResponse;
      }

      logger.info('伏線計画を生成しました', {
        suggestionCount: parsedResult.suggestions.length
      });

      return parsedResult;
    } catch (error) {
      logger.error('新規伏線計画の提案に失敗しました', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });
      return { suggestions: [] };
    }
  }

  /**
   * 象徴とモチーフからイメージネットワークを特定
   */
  private identifyImageryNetworks(
    allSymbols: Map<string, any>,
    allMotifs: Map<string, any>
  ): Array<{
    name: string;
    elements: string[];
    thematicImplication: string;
  }> {
    // 簡単なクラスタリングロジック
    const networks: Array<{
      name: string;
      elements: string[];
      thematicImplication: string;
    }> = [];

    // 関連キーワードマップ
    const relatedKeywords: { [category: string]: string[] } = {
      '自然': ['水', '火', '空', '風', '木', '山', '川', '海', '森', '雨', '花', '太陽', '月', '星'],
      '光と闇': ['光', '闇', '影', '夜', '昼', '太陽', '月', '星', '灯り', '暗闇', '明かり'],
      '動物': ['鳥', '猫', '犬', '馬', '魚', '獣', '蛇', '虎', '龍'],
      '旅と移動': ['道', '扉', '窓', '橋', '船', '車', '旅', '移動', '出発', '帰還'],
      '時間': ['時計', '季節', '年', '時', '瞬間', '過去', '未来', '現在', '永遠', '記憶'],
      '感情': ['心', '感情', '愛', '怒り', '悲しみ', '喜び', '恐れ', '希望', '絶望'],
      '対立': ['戦い', '対立', '矛盾', '葛藤', '争い', '敵', '味方', '和解']
    };

    // すべての象徴とモチーフをリストアップ
    const allElements = new Set<string>();
    allSymbols.forEach((_, key) => allElements.add(key));
    allMotifs.forEach((_, key) => allElements.add(key));

    // カテゴリごとにネットワークを作成
    for (const [category, keywords] of Object.entries(relatedKeywords)) {
      const matchingElements: string[] = [];

      // カテゴリに関連する要素を見つける
      for (const element of allElements) {
        if (keywords.some(keyword => element.includes(keyword) || keyword.includes(element))) {
          matchingElements.push(element);
        }
      }

      // 十分な要素があればネットワークを作成
      if (matchingElements.length >= 2) {
        networks.push({
          name: category,
          elements: matchingElements,
          thematicImplication: `${category}のイメージは物語全体を通じてテーマを象徴的に表現しています`
        });
      }
    }

    // 残りの要素から追加のネットワークを作成（簡易クラスタリング）
    const remainingElements = new Set(allElements);
    networks.forEach(network => {
      network.elements.forEach(element => remainingElements.delete(element));
    });

    // もし残りの要素があれば、それらを「その他」として追加
    if (remainingElements.size >= 2) {
      networks.push({
        name: "その他のイメージ群",
        elements: Array.from(remainingElements),
        thematicImplication: "これらのイメージは物語に独特の雰囲気を与えています"
      });
    }

    return networks;
  }
}