/**
 * @fileoverview 文学的比較分析システム
 * @description 外部JSON定型文とAI選択による動的な文学的インスピレーション生成
 */

import { GeminiClient } from '@/lib/generation/gemini-client';
import { logger } from '@/lib/utils/logger';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { JsonParser } from '@/lib/utils/json-parser';
import { storageAdapter } from '@/lib/analysis/adapters/storage-adapter';
import { WorldSettingsManager } from '@/lib/plot/world-settings-manager';
import {
  LiteraryInspiration,
  LiteraryTechnique,
  LiteraryGuidelinesData,
  LiteraryGuideline,
  CollectedContext,
  JudgmentAxis
} from '@/types/literary';
import {
  GenerationContext,

} from '@/types/generation';

/**
 * @class ContextCollector
 * @description 文学的インスピレーション選択のためのコンテキスト情報収集
 */
class ContextCollector {
  private axes: JudgmentAxis[] = [
    {
      key: 'stage',
      priority: 10,
      extractor: () => this.getStage(),
      formatter: (stage) => `物語進行段階: ${stage}`,
      validator: (data) => typeof data === 'string' && data.length > 0
    },
    {
      key: 'genre',
      priority: 9,
      extractor: () => this.getGenre(),
      formatter: (genre) => `ジャンル: ${genre}`,
      validator: (data) => typeof data === 'string' && data.length > 0
    }
  ];

  private currentContext: GenerationContext | null = null;

  async collectAvailableContexts(context: GenerationContext): Promise<CollectedContext[]> {
    this.currentContext = context;
    const collectedContexts: CollectedContext[] = [];

    const sortedAxes = [...this.axes].sort((a, b) => b.priority - a.priority);

    for (const axis of sortedAxes) {
      try {
        const rawData = await axis.extractor();

        if (axis.validator && !axis.validator(rawData)) {
          continue;
        }

        const formattedText = axis.formatter(rawData);

        collectedContexts.push({
          axisKey: axis.key,
          formattedText,
          rawData,
          priority: axis.priority
        });

      } catch (error) {
        logger.debug(`判断軸 "${axis.key}" の取得失敗`, { error });
      }
    }

    return collectedContexts.slice(0, 5);
  }

  private async getStage(): Promise<string> {
    if (!this.currentContext) return '序盤';

    // undefined対策でデフォルト値を設定
    const chapterNumber = this.currentContext.chapterNumber || 1;
    const totalChapters = this.currentContext.totalChapters || 20;

    const position = totalChapters > 0
      ? chapterNumber / totalChapters
      : chapterNumber / 20;

    if (position < 0.3) return '序盤';
    else if (position < 0.7) return '中盤';
    else return '終盤';
  }

  private async getGenre(): Promise<string> {
    return this.currentContext?.genre || 'business';
  }

  addJudgmentAxis(axis: JudgmentAxis): void {
    this.axes.push(axis);
    this.axes.sort((a, b) => b.priority - a.priority);
  }
}

/**
 * @class LiteraryComparisonSystem
 * @description 文学的比較分析を提供するクラス
 */
export class LiteraryComparisonSystem {
  private guidelinesData: LiteraryGuidelinesData | null = null;
  private contextCollector: ContextCollector;
  private worldSettingsManager: WorldSettingsManager;

  constructor(
    private geminiClient: GeminiClient,
    worldSettingsManager?: WorldSettingsManager
  ) {
    logger.info('LiteraryComparisonSystem initialized');
    this.worldSettingsManager = worldSettingsManager || new WorldSettingsManager();
    this.contextCollector = new ContextCollector();
    this.loadGuidelines();
  }

  /**
   * 文学的インスピレーションを生成する
   */
  async generateLiteraryInspirations(
    context: GenerationContext,
    chapterNumber: number
  ): Promise<LiteraryInspiration> {
    try {
      logger.info(`Generating literary inspirations for chapter ${chapterNumber}`);

      const genre = await this.determineGenre(context);

      if (!this.guidelinesData || !this.guidelinesData[genre]) {
        logger.warn(`Guidelines not found for genre: ${genre}`);
        return this.createDefaultInspiration(genre);
      }

      const collectedContexts = await this.contextCollector.collectAvailableContexts({
        ...context,
        chapterNumber,
        genre
      });

      const selectedGuidelines = await this.selectGuidelinesWithAI(
        this.guidelinesData[genre],
        collectedContexts,
        chapterNumber
      );

      const inspiration = this.convertToInspiration(selectedGuidelines);

      logger.info('Literary inspiration generation completed', {
        genre,
        chapterNumber,
        selectedCount: selectedGuidelines.length
      });

      return inspiration;

    } catch (error) {
      logger.error('Failed to generate literary inspirations', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });

      return this.createDefaultInspiration('business');
    }
  }

  /**
   * JSONファイルからガイドラインを読み込み
   */
  private async loadGuidelines(): Promise<void> {
    try {
      // ストレージアダプターからキャッシュ読み込み
      const cachedData = await storageAdapter.loadCache<LiteraryGuidelinesData>('literary-guidelines');

      if (cachedData) {
        this.guidelinesData = cachedData;
        logger.info('Guidelines loaded from cache');
        return;
      }

      // デフォルトデータを使用
      this.guidelinesData = this.createDefaultGuidelinesData();

      // キャッシュに保存（1時間）
      await storageAdapter.saveCache('literary-guidelines', this.guidelinesData, 3600000);

      logger.info('Guidelines loaded with default data');

    } catch (error) {
      logger.error('Failed to load guidelines', { error });
      this.guidelinesData = this.createDefaultGuidelinesData();
    }
  }

  /**
   * AI選択による適切なガイドライン選択
   */
  private async selectGuidelinesWithAI(
    availableGuidelines: LiteraryGuideline[],
    contexts: CollectedContext[],
    chapterNumber: number
  ): Promise<LiteraryGuideline[]> {
    try {
      const contextText = contexts.length > 0
        ? contexts.map(c => c.formattedText).join('\n')
        : `章番号: ${chapterNumber}`;

      const prompt = this.buildSelectionPrompt(availableGuidelines, contextText);

      const response = await apiThrottler.throttledRequest(() =>
        this.geminiClient.generateText(prompt, {
          temperature: 0.3,
          purpose: 'selection',
          responseFormat: 'json'
        })
      );

      const selectedIndices = this.parseSelectionResponse(response);

      const selectedGuidelines = selectedIndices
        .filter(index => index >= 0 && index < availableGuidelines.length)
        .map(index => availableGuidelines[index]);

      return this.adjustSelectionCount(selectedGuidelines, availableGuidelines);

    } catch (error) {
      logger.error('AI選択に失敗、ランダム選択にフォールバック', { error });
      return this.randomSelection(availableGuidelines, 3);
    }
  }

  /**
   * AI選択プロンプト構築
   */
  private buildSelectionPrompt(guidelines: LiteraryGuideline[], contextText: string): string {
    const guidelinesList = guidelines
      .map((g, index) => `${index + 1}. ${g.technique} - ${g.description}`)
      .join('\n');

    return `
以下の状況に基づいて、最適な文学ガイドライン3つを選択してください。

現在の状況:
${contextText}

選択肢:
${guidelinesList}

以下のJSON形式で回答してください:
{
  "selectedIndices": [1, 5, 12],
  "reasoning": "選択理由"
}
`;
  }

  /**
   * AI選択レスポンスの解析
   */
  private parseSelectionResponse(response: string): number[] {
    const defaultIndices = [0, 1, 2];

    try {
      const parsed = JsonParser.parseFromAIResponse(response, { selectedIndices: defaultIndices });

      if (parsed.selectedIndices && Array.isArray(parsed.selectedIndices)) {
        return parsed.selectedIndices.map((idx: any) => Number(idx) - 1);
      }
    } catch (error) {
      logger.debug('AI選択レスポンス解析失敗', { error });
    }

    const numbers = response.match(/\d+/g);
    if (numbers) {
      return numbers.slice(0, 4).map(n => Number(n) - 1);
    }

    return defaultIndices;
  }

  /**
   * 選択数を適切に調整
   */
  private adjustSelectionCount(
    selected: LiteraryGuideline[],
    available: LiteraryGuideline[]
  ): LiteraryGuideline[] {
    if (selected.length >= 3) {
      return selected.slice(0, 4);
    }

    const remaining = available.filter(g => !selected.some(s => s.id === g.id));
    const additional = this.randomSelection(remaining, 3 - selected.length);

    return [...selected, ...additional];
  }

  /**
   * ランダム選択
   */
  private randomSelection(guidelines: LiteraryGuideline[], count: number): LiteraryGuideline[] {
    const shuffled = [...guidelines].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, guidelines.length));
  }

  /**
   * ガイドラインをLiteraryInspiration形式に変換
   */
  private convertToInspiration(guidelines: LiteraryGuideline[]): LiteraryInspiration {
    const techniques = guidelines.map(g => ({
      technique: g.technique,
      description: g.description,
      example: g.example,
      reference: g.reference
    }));

    const plotTechniques: LiteraryTechnique[] = [];
    const characterTechniques: LiteraryTechnique[] = [];
    const atmosphereTechniques: LiteraryTechnique[] = [];

    techniques.forEach((technique, index) => {
      switch (index % 3) {
        case 0: plotTechniques.push(technique); break;
        case 1: characterTechniques.push(technique); break;
        case 2: atmosphereTechniques.push(technique); break;
      }
    });

    if (plotTechniques.length === 0 && techniques.length > 0) {
      plotTechniques.push(techniques[0]);
    }
    if (characterTechniques.length === 0 && techniques.length > 1) {
      characterTechniques.push(techniques[1]);
    }
    if (atmosphereTechniques.length === 0 && techniques.length > 2) {
      atmosphereTechniques.push(techniques[2]);
    }

    return { plotTechniques, characterTechniques, atmosphereTechniques };
  }

  /**
   * ジャンルを判定する
   */
  private async determineGenre(context: GenerationContext): Promise<string> {
    try {
      const worldSettingsGenre = await this.worldSettingsManager.getGenre();
      if (worldSettingsGenre && worldSettingsGenre !== 'classic') {
        return worldSettingsGenre.toLowerCase();
      }

      return 'business';

    } catch (error) {
      logger.error('ジャンル判定失敗', { error });
      return 'business';
    }
  }

  /**
   * デフォルトのインスピレーション作成
   */
  private createDefaultInspiration(genre: string): LiteraryInspiration {
    if (genre === 'business') {
      return {
        plotTechniques: [{
          technique: "ビジネス上の危機と解決を描く際は",
          description: "『下町ロケット』のように、企業や事業が直面する危機的状況とその解決プロセスを段階的に描写してください",
          example: "資金繰りの困難から革新的な製品開発によって活路を見出す展開を描く",
          reference: "下町ロケット"
        }],
        characterTechniques: [{
          technique: "専門性と人間性のバランスを描く際は",
          description: "『海賊とよばれた男』のように、ビジネススキルと人間的側面を両立させて立体的に描写してください",
          example: "技術者としての洞察力を持ちながらチームとの関係に悩む内面を描写する",
          reference: "海賊とよばれた男"
        }],
        atmosphereTechniques: [{
          technique: "企業文化を表現する際は",
          description: "『七つの会議』のように、組織の文化や価値観を象徴的な場面を通じて具体的に表現してください",
          example: "朝礼や社内慣習を通して企業の伝統と価値観を自然に描写する",
          reference: "七つの会議"
        }]
      };
    }

    return {
      plotTechniques: [{
        technique: "伏線を設置・回収する際は",
        description: "物語の前半で自然に示唆し、後半で効果的に意味を明らかにしてください",
        example: "何気ない発言や小物が、後の重要な場面で決定的な役割を果たす",
        reference: "優れた小説作品"
      }],
      characterTechniques: [{
        technique: "行動による性格描写を行う際は",
        description: "直接的な説明を避け、行動や選択を通じて性格を表現してください",
        example: "危機的状況での判断や反応を通じてキャラクターの本質を描く",
        reference: "優れたキャラクター小説"
      }],
      atmosphereTechniques: [{
        technique: "対比による強調を行う際は",
        description: "対照的な場面や感情を効果的に並置して印象を強化してください",
        example: "平和な日常描写の直後に緊迫した場面を配置する",
        reference: "現代文学作品"
      }]
    };
  }

  /**
   * デフォルトガイドラインデータ作成
   */
  private createDefaultGuidelinesData(): LiteraryGuidelinesData {
    return {
      business: [
        {
          id: "biz_001",
          technique: "ビジネス専門用語を使用する際は",
          description: "『下町ロケット』のように、技術的な内容を一般読者にも理解できる会話として表現してください",
          example: "専門用語を説明的にならず、キャラクター同士の自然な会話の中で意味が分かるように配置する",
          reference: "下町ロケット",
          applicableContexts: ["dialogue", "technical_discussion"]
        },
        {
          id: "biz_002",
          technique: "心理描写を行う際は",
          description: "『海賊とよばれた男』のように、経営判断の重圧を過去の信念との対比で表現してください",
          example: "ビジネス上の決断に迷う内面を、創業時の理想と現実のギャップとして描写する",
          reference: "海賊とよばれた男",
          applicableContexts: ["character_development", "decision_making"]
        },
        {
          id: "biz_003",
          technique: "対話シーンを書く際は",
          description: "『七つの会議』のように、表面的な議論の裏にある各人の本音や利害関係を、微細な表情や言葉選びで暗示してください",
          example: "会議での発言に隠された個人的な思惑を、仕草や視線の描写で間接的に表現する",
          reference: "七つの会議",
          applicableContexts: ["meeting_scenes", "negotiation"]
        }
      ]
    };
  }

  addJudgmentAxis(axis: JudgmentAxis): void {
    this.contextCollector.addJudgmentAxis(axis);
  }
}