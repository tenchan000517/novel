// src/lib/analysis/pipeline/advanced-steps.ts

import { AnalysisStep, PipelineContext } from './chapter-analysis-pipeline';
import { Chapter } from '@/types/chapters';
import { GeminiAdapter } from '@/lib/analysis/adapters/gemini-adapter';
import { JsonParser } from '@/lib/utils/json-parser';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { logger } from '@/lib/utils/logger';

/**
 * 繰り返しパターン検出ステップ
 * 章内の繰り返されるパターンを検出し、改善提案を行います
 */
export class RepetitionPatternStep implements AnalysisStep<Chapter, any> {
  readonly name = 'repetitionPatternAnalysis';
  readonly timeout = 30000;
  
  constructor(private geminiAdapter: GeminiAdapter) {}
  
  async execute(chapter: Chapter, context: PipelineContext): Promise<any> {
    logger.debug(`Analyzing repetition patterns for chapter ${chapter.chapterNumber}`);
    
    // 章の内容からサンプルを抽出（長すぎる場合は適切にサンプリング）
    const content = chapter.content;
    const sampleContent = this.extractSample(content);
    
    // パターン分析用プロンプト
    const prompt = `
以下の小説の章から、繰り返し表現や類似パターンを検出してください：

${sampleContent}

以下のカテゴリで分析を行ってください：
1. 文体パターン（同じ文構造が繰り返される箇所）
2. 語彙の反復（同じ語句が近接して使われる箇所）
3. 描写パターン（類似した描写が繰り返される箇所）
4. 対話パターン（会話の導入や結びの表現が同じ）
5. キャラクター行動パターン（キャラクターの行動描写のパターン）

各カテゴリで検出された繰り返しパターンを示し、改善提案を行ってください。
反復が効果的に使われている場合はそれも指摘してください。

JSON形式で回答してください：
{
  "repetitionPatterns": [
    {
      "type": "パターンタイプ",
      "examples": ["例1", "例2"],
      "frequency": 出現回数,
      "isEffective": true/false,
      "improvementSuggestion": "改善提案"
    }
  ],
  "overallRepetitiveness": 0～1の数値,
  "effectiveRepetitions": ["効果的な繰り返し1", "効果的な繰り返し2"],
  "generalSuggestions": ["全般的な改善提案1", "全般的な改善提案2"]
}
`;

    try {
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
        repetitionPatterns: [],
        overallRepetitiveness: 0.5,
        effectiveRepetitions: [],
        generalSuggestions: [
          "文体にバリエーションを持たせることで、読者の興味を維持できます",
          "同じ表現の繰り返しを避け、類義語や異なる表現方法を探してください"
        ]
      };

      // レスポンスを解析
      const result = JsonParser.parseFromAIResponse(response, defaultResult);
      
      // 検出結果に基づいて問題を特定
      const issues = this.identifyIssuesFromPatterns(result);
      
      logger.info(`Completed repetition pattern analysis for chapter ${chapter.chapterNumber}`, {
        patternsDetected: result.repetitionPatterns.length,
        overallRepetitiveness: result.overallRepetitiveness,
        issuesDetected: issues.length
      });
      
      return {
        repetitionAnalysis: result,
        detectedIssues: issues
      };
    } catch (error) {
      logger.error(`Failed to analyze repetition patterns for chapter ${chapter.chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      
      // エラー時はデフォルト値を返す
      return {
        repetitionAnalysis: {
          repetitionPatterns: [],
          overallRepetitiveness: 0.5,
          effectiveRepetitions: [],
          generalSuggestions: [
            "文体にバリエーションを持たせることで、読者の興味を維持できます",
            "同じ表現の繰り返しを避け、類義語や異なる表現方法を探してください"
          ]
        },
        detectedIssues: []
      };
    }
  }
  
  /**
   * サンプルコンテンツを抽出
   * @param content 元のコンテンツ
   * @returns サンプルコンテンツ
   */
  private extractSample(content: string): string {
    // コンテンツが短い場合はそのまま返す
    if (content.length <= 6000) {
      return content;
    }
    
    // 長い場合は複数の箇所からサンプリング
    const thirdLength = Math.floor(content.length / 3);
    
    const beginning = content.substring(0, 2000);
    const middle = content.substring(thirdLength, thirdLength + 2000);
    const end = content.substring(content.length - 2000);
    
    return `# 冒頭部分\n${beginning}\n\n# 中間部分\n${middle}\n\n# 終盤部分\n${end}`;
  }
  
  /**
   * パターン検出結果から問題を特定
   * @param result パターン検出結果
   * @returns 検出された問題
   */
  private identifyIssuesFromPatterns(result: any): any[] {
    const issues: any[] = [];
    
    // 繰り返しが多すぎる場合に問題として報告
    if (result.overallRepetitiveness > 0.7) {
      issues.push({
        type: 'style',
        severity: 'medium',
        message: '繰り返し表現が多すぎます。文体にさらにバリエーションを持たせることを検討してください。'
      });
    }
    
    // 非効果的な繰り返しパターンを報告
    if (result.repetitionPatterns && Array.isArray(result.repetitionPatterns)) {
      const ineffectivePatterns = result.repetitionPatterns.filter((p: any) => p.isEffective === false);
      
      for (const pattern of ineffectivePatterns) {
        if (pattern.frequency > 3) { // 3回以上繰り返される場合のみ問題として報告
          issues.push({
            type: 'style',
            severity: 'low',
            message: `「${pattern.type}」パターンの繰り返しが検出されました: ${pattern.examples[0]}`,
            suggestion: pattern.improvementSuggestion
          });
        }
      }
    }
    
    return issues;
  }
}

/**
 * 感情フロー分析ステップ
 * 章内の感情の流れを分析し、エンゲージメントを評価します
 */
export class EmotionalFlowStep implements AnalysisStep<Chapter, any> {
  readonly name = 'emotionalFlowAnalysis';
  readonly timeout = 40000;
  
  constructor(private geminiAdapter: GeminiAdapter) {}
  
  async execute(chapter: Chapter, context: PipelineContext): Promise<any> {
    logger.debug(`Analyzing emotional flow for chapter ${chapter.chapterNumber}`);
    
    // 章を複数のセグメントに分割
    const segments = this.segmentContent(chapter.content);
    
    // 分析用プロンプト
    const prompt = `
以下の小説の章を複数のセグメントに分けて、各セグメントの感情的な基調とその変化を分析してください。

${segments.map((segment, i) => `# セグメント ${i + 1}\n${segment}`).join('\n\n')}

各セグメントについて分析を行い、以下を評価してください：
1. 主要な感情（喜び、悲しみ、怒り、恐れ、期待、驚きなど）
2. 感情の強度（0-10のスケール）
3. 読者に与える心理的効果
4. 物語上の役割（緊張の構築、安堵の提供、内面の掘り下げなど）

また、章全体を通しての感情の流れとその効果についても評価してください。
感情の変化にメリハリがあるか、エンゲージメントを高める効果があるかなどを分析してください。

JSON形式で回答してください：
{
  "segments": [
    {
      "segmentNumber": 1,
      "dominantEmotion": "主要な感情",
      "emotionalIntensity": 感情の強度(0-10),
      "readerEffect": "読者への効果",
      "narrativeRole": "物語上の役割"
    }
  ],
  "emotionalArc": {
    "pattern": "感情の変化パターン",
    "highestPoint": {
      "segmentNumber": 最も感情が強いセグメント番号,
      "emotion": "その感情",
      "intensity": 強度
    },
    "lowestPoint": {
      "segmentNumber": 最も感情が弱いセグメント番号,
      "emotion": "その感情",
      "intensity": 強度
    }
  },
  "engagementScore": エンゲージメントスコア(0-10),
  "emotionalBalance": 感情バランススコア(0-10),
  "suggestions": ["改善提案1", "改善提案2"]
}
`;

    try {
      // APIスロットリングを使用して分析を実行
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(prompt, {
          temperature: 0.3,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );

      // デフォルト値
      const defaultResult = {
        segments: [],
        emotionalArc: {
          pattern: "未分析",
          highestPoint: { segmentNumber: 0, emotion: "不明", intensity: 5 },
          lowestPoint: { segmentNumber: 0, emotion: "不明", intensity: 5 }
        },
        engagementScore: 5,
        emotionalBalance: 5,
        suggestions: [
          "感情の起伏を意識的に設計し、読者の興味を引きつけてください",
          "キャラクターの内面描写を通じて感情をより直接的に表現するとよいでしょう"
        ]
      };

      // レスポンスを解析
      const result = JsonParser.parseFromAIResponse(response, defaultResult);
      
      // 感情の流れから品質メトリクスを算出
      const qualityMetrics = this.calculateQualityMetricsFromEmotionalFlow(result);
      
      logger.info(`Completed emotional flow analysis for chapter ${chapter.chapterNumber}`, {
        engagementScore: result.engagementScore,
        emotionalBalance: result.emotionalBalance,
        pattern: result.emotionalArc?.pattern
      });
      
      return {
        emotionalFlowAnalysis: result,
        qualityMetrics
      };
    } catch (error) {
      logger.error(`Failed to analyze emotional flow for chapter ${chapter.chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      
      // エラー時はデフォルト値を返す
      return {
        emotionalFlowAnalysis: {
          segments: [],
          emotionalArc: {
            pattern: "分析エラー",
            highestPoint: { segmentNumber: 0, emotion: "不明", intensity: 5 },
            lowestPoint: { segmentNumber: 0, emotion: "不明", intensity: 5 }
          },
          engagementScore: 5,
          emotionalBalance: 5,
          suggestions: [
            "感情の起伏を意識的に設計し、読者の興味を引きつけてください",
            "キャラクターの内面描写を通じて感情をより直接的に表現するとよいでしょう"
          ]
        },
        qualityMetrics: {
          engagement: 0.5
        }
      };
    }
  }
  
  /**
   * コンテンツをセグメントに分割
   * @param content コンテンツ
   * @returns セグメントの配列
   */
  private segmentContent(content: string): string[] {
    // 長すぎる場合は適切なサイズに調整
    const adjustedContent = content.length > 10000 ? content.substring(0, 10000) : content;
    
    // セグメント数を決定（最低3セグメント、最大5セグメント）
    const segmentCount = Math.min(5, Math.max(3, Math.floor(adjustedContent.length / 2000)));
    
    // セグメントの長さを計算
    const segmentLength = Math.ceil(adjustedContent.length / segmentCount);
    
    // セグメントに分割
    const segments: string[] = [];
    for (let i = 0; i < segmentCount; i++) {
      const start = i * segmentLength;
      const end = Math.min(start + segmentLength, adjustedContent.length);
      
      // 自然な区切りを探す（段落の終わりなど）
      let adjustedEnd = end;
      if (end < adjustedContent.length) {
        const nextParagraph = adjustedContent.indexOf('\n\n', end);
        if (nextParagraph !== -1 && nextParagraph < end + 200) { // 200文字以内に段落の区切りがある場合
          adjustedEnd = nextParagraph;
        }
      }
      
      segments.push(adjustedContent.substring(start, adjustedEnd));
    }
    
    return segments;
  }
  
  /**
   * 感情フロー分析から品質メトリクスを計算
   * @param analysis 感情フロー分析結果
   * @returns 品質メトリクス
   */
  private calculateQualityMetricsFromEmotionalFlow(analysis: any): any {
    // エンゲージメントスコアを0-1のスケールに変換
    const engagement = (analysis.engagementScore || 5) / 10;
    
    // 感情バランスを0-1のスケールに変換
    const emotionalBalance = (analysis.emotionalBalance || 5) / 10;
    
    // 感情の起伏を計算
    const emotionalVariance = this.calculateEmotionalVariance(analysis.segments || []);
    
    return {
      engagement,
      emotionalBalance,
      emotionalVariance
    };
  }
  
  /**
   * 感情の起伏（分散）を計算
   * @param segments セグメント配列
   * @returns 感情の分散（0-1）
   */
  private calculateEmotionalVariance(segments: any[]): number {
    if (!segments || segments.length < 2) {
      return 0.5; // デフォルト値
    }
    
    // 感情強度の配列を取得
    const intensities = segments.map(s => s.emotionalIntensity || 5);
    
    // 平均を計算
    const average = intensities.reduce((sum, val) => sum + val, 0) / intensities.length;
    
    // 分散を計算
    const variance = intensities.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / intensities.length;
    
    // 分散を0-1のスケールに正規化（最大分散は理論的には25）
    return Math.min(1, variance / 25);
  }
}

/**
 * プロットマイニングステップ
 * 章から物語のプロット要素を抽出し、物語構造を分析します
 */
export class PlotMiningStep implements AnalysisStep<Chapter, any> {
  readonly name = 'plotMining';
  readonly timeout = 35000;
  
  constructor(private geminiAdapter: GeminiAdapter) {}
  
  async execute(chapter: Chapter, context: PipelineContext): Promise<any> {
    logger.debug(`Mining plot elements for chapter ${chapter.chapterNumber}`);
    
    // 分析用プロンプト
    const prompt = `
以下の小説の章から、物語（プロット）要素を抽出・分析してください：

${chapter.content.substring(0, 6000)}

以下の項目について分析を行ってください：
1. 主要な出来事（イベント）
2. キャラクターの決断や行動の転換点
3. 対立や葛藤の要素
4. 因果関係（あるイベントが別のイベントを引き起こすつながり）
5. 伏線や予兆
6. 物語構造上の役割（導入、展開、クライマックス、解決など）

また、この章が物語全体においてどのような役割を果たしているかについても考察してください。
物語の進行速度（ペーシング）についても評価してください。

JSON形式で回答してください：
{
  "keyEvents": [
    {
      "description": "イベントの説明",
      "significance": 重要度(0-10),
      "characters": ["関連キャラクター1", "関連キャラクター2"]
    }
  ],
  "decisionPoints": [
    {
      "character": "キャラクター名",
      "decision": "決断の内容",
      "impact": "物語への影響"
    }
  ],
  "conflicts": [
    {
      "type": "葛藤のタイプ",
      "description": "葛藤の説明",
      "parties": ["関係者1", "関係者2"]
    }
  ],
  "causalLinks": [
    {
      "cause": "原因となるイベント",
      "effect": "結果となるイベント"
    }
  ],
  "foreshadowing": [
    {
      "element": "伏線要素",
      "potentialResolution": "想定される回収"
    }
  ],
  "narrativeRole": "章の物語構造上の役割",
  "pacing": {
    "speed": "遅い|適切|速い",
    "rhythm": "一定|変化がある",
    "focusAreas": ["集中している要素1", "集中している要素2"]
  },
  "suggestions": ["プロット改善提案1", "プロット改善提案2"]
}
`;

    try {
      // APIスロットリングを使用して分析を実行
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateText(prompt, {
          temperature: 0.3,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );

      // デフォルト値
      const defaultResult = {
        keyEvents: [],
        decisionPoints: [],
        conflicts: [],
        causalLinks: [],
        foreshadowing: [],
        narrativeRole: "不明",
        pacing: {
          speed: "適切",
          rhythm: "一定",
          focusAreas: []
        },
        suggestions: [
          "プロット要素の因果関係をより明確にするとよいでしょう",
          "キャラクターの決断にもっと重みを持たせると物語に深みが増します"
        ]
      };

      // レスポンスを解析
      const result = JsonParser.parseFromAIResponse(response, defaultResult);
      
      // 物語の一貫性の分析
      const plotConsistency = this.analyzePlotConsistency(result);
      
      logger.info(`Completed plot mining for chapter ${chapter.chapterNumber}`, {
        eventsCount: result.keyEvents?.length || 0,
        narrativeRole: result.narrativeRole,
        pacingSpeed: result.pacing?.speed
      });
      
      return {
        plotElements: result,
        plotConsistency
      };
    } catch (error) {
      logger.error(`Failed to mine plot elements for chapter ${chapter.chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      
      // エラー時はデフォルト値を返す
      return {
        plotElements: {
          keyEvents: [],
          decisionPoints: [],
          conflicts: [],
          causalLinks: [],
          foreshadowing: [],
          narrativeRole: "分析エラー",
          pacing: {
            speed: "不明",
            rhythm: "不明",
            focusAreas: []
          },
          suggestions: []
        },
        plotConsistency: {
          consistent: true,
          issues: []
        }
      };
    }
  }
  
  /**
   * プロットの一貫性を分析
   * @param plotElements プロット要素
   * @returns 一貫性分析結果
   */
  private analyzePlotConsistency(plotElements: any): any {
    const issues: string[] = [];
    
    // キーイベントの重要度が低すぎないか確認
    if (plotElements.keyEvents && Array.isArray(plotElements.keyEvents)) {
      const lowImportanceEvents = plotElements.keyEvents.filter((e: any) => e.significance < 5);
      if (lowImportanceEvents.length > plotElements.keyEvents.length / 2) {
        issues.push("重要なイベントの影響力が弱く、物語の推進力が不足している可能性があります");
      }
    }
    
    // 葛藤要素が存在するか確認
    if (!plotElements.conflicts || !Array.isArray(plotElements.conflicts) || plotElements.conflicts.length === 0) {
      issues.push("葛藤要素が不足しています。キャラクター間の対立や内的葛藤を追加することで物語に深みが増します");
    }
    
    // 因果関係が存在するか確認
    if (!plotElements.causalLinks || !Array.isArray(plotElements.causalLinks) || plotElements.causalLinks.length === 0) {
      issues.push("イベント間の因果関係が明確でありません。出来事の連鎖をより論理的にすることで物語の流れが改善します");
    }
    
    // テンポが適切か確認
    if (plotElements.pacing && plotElements.pacing.speed === "遅い") {
      issues.push("物語の進行が遅すぎます。不要な描写を削減するか、より重要な出来事に焦点を当てることを検討してください");
    } else if (plotElements.pacing && plotElements.pacing.speed === "速い") {
      issues.push("物語の進行が速すぎる可能性があります。重要な瞬間により時間をかけ、読者が消化できるペースを意識してください");
    }
    
    return {
      consistent: issues.length === 0,
      issues
    };
  }
}