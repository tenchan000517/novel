/**
 * @fileoverview プロンプト生成クラス
 * @description 小説生成用の高度なプロンプトを生成する
 */

import { GenerationContext } from '@/types/generation';
import { logger } from '@/lib/utils/logger';
import { TemplateManager } from './prompt/template-manager';
import { PromptFormatter } from './prompt/prompt-formatter';
import { SectionBuilder } from './prompt/section-builder';
import { MemoryService } from './prompt/memory-service';
import { CharacterManager } from '@/lib/characters/manager';
import { WorldKnowledge } from '@/lib/memory/world-knowledge';
import { WorldSettingsManager } from '@/lib/plot/world-settings-manager';
import { PlotManager } from '@/lib/plot/manager';
import { LearningJourneySystem, LearningStage } from '@/lib/learning-journey';

import { ljsDiagnostics, LJSCheck } from '@/lib/utils/debug/learning-journey-diagnostics';

/**
 * プロンプト生成クラス
 * ジャンル特性に最適化されたプロンプトを生成
 */
export class PromptGenerator {
  private templateManager: TemplateManager;
  private formatter: PromptFormatter;
  private sectionBuilder: SectionBuilder;
  private memoryService: MemoryService;
  private characterManager?: CharacterManager;
  private worldKnowledge?: WorldKnowledge;
  private worldSettingsManager?: WorldSettingsManager;
  private plotManager?: PlotManager;
  private learningJourneySystem?: LearningJourneySystem;

  // 初期化プロミスを保持するプロパティを追加
  private initializationPromise: Promise<void>;
  private isInitialized: boolean = false;

  /**
   * コンストラクタ
   * @param {object} options 初期化オプション
   */
  constructor(options?: {
    characterManager?: CharacterManager;
    worldKnowledge?: WorldKnowledge;
    worldSettingsManager?: WorldSettingsManager;
    plotManager?: PlotManager;
    learningJourneySystem?: LearningJourneySystem;
  }) {
    this.characterManager = options?.characterManager;
    this.worldKnowledge = options?.worldKnowledge;
    this.worldSettingsManager = options?.worldSettingsManager;
    this.plotManager = options?.plotManager;
    this.learningJourneySystem = options?.learningJourneySystem;

    // 各ヘルパークラスの初期化
    this.templateManager = new TemplateManager();
    this.formatter = new PromptFormatter(this.characterManager);
    this.memoryService = new MemoryService();
    this.sectionBuilder = new SectionBuilder(
      this.formatter,
      this.templateManager,
      this.learningJourneySystem
    );

    // 初期化プロミスを開始
    this.initializationPromise = this.initialize();

    logger.info('PromptGenerator created', {
      hasLearningJourneySystem: !!this.learningJourneySystem
    });
  }

  /**
   * 非同期初期化処理
   * @private
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.info('PromptGenerator initialization starting');

      // テンプレートの読み込みを待機
      await this.templateManager.load();

      this.isInitialized = true;
      logger.info('PromptGenerator initialized successfully');
    } catch (err) {
      logger.error('Failed to load templates', { error: err });

      // フォールバックテンプレートを設定
      try {
        await this.setFallbackTemplates();
        this.isInitialized = true;
        logger.info('PromptGenerator initialized with fallback templates');
      } catch (fallbackErr) {
        logger.error('Failed to set fallback templates', { error: fallbackErr });
        // 最小限の状態で初期化完了とする
        this.isInitialized = true;
      }
    }
  }

  /**
   * フォールバックテンプレートを設定
   * @private
   */
  private async setFallbackTemplates(): Promise<void> {
    // TemplateManagerにsetFallbackTemplatesメソッドがない場合の対処
    if (typeof this.templateManager.setFallbackTemplates === 'function') {
      await this.templateManager.setFallbackTemplates();
    } else {
      logger.warn('TemplateManager.setFallbackTemplates is not available, using minimal templates');
      // 最小限のテンプレート情報を直接設定（TemplateManagerの内部実装に依存）
    }
  }

  /**
   * 初期化完了を待機
   * @private
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializationPromise;
    }
  }

  /**
   * コンテキストからプロンプトを生成する（統合修正版 + 診断コード）
   * @param {GenerationContext} context 生成コンテキスト情報
   * @returns {Promise<string>} 構築されたプロンプト文字列
   */
  async generate(context: GenerationContext): Promise<string> {
    // 初期化完了を待機
    await this.ensureInitialized();

    logger.debug('Generating enhanced prompt from context');

    // 🔬 診断チェックポイント: プロンプト生成開始
    LJSCheck.info('PROMPT_GENERATION', 'START', {
      chapterNumber: context.chapterNumber,
      hasLearningJourney: !!(context as any).learningJourney
    });

    try {
      // 🎯 STEP 1: 基本情報の準備
      const enrichedContext = await this.enrichContextWithLearningJourney(context);

      // 🔬 診断チェックポイント: コンテキスト拡張結果確認
      if ((enrichedContext as any).learningJourney) {
        LJSCheck.success('CONTEXT_ENRICHMENT', 'SUCCESS', {
          mainConcept: (enrichedContext as any).learningJourney.mainConcept,
          learningStage: (enrichedContext as any).learningJourney.learningStage,
          hasEmbodimentPlan: !!(enrichedContext as any).learningJourney.embodimentPlan,
          hasEmotionalArc: !!(enrichedContext as any).learningJourney.emotionalArc
        });
      } else {
        LJSCheck.failure('CONTEXT_ENRICHMENT', 'FAILED', 'Context enrichment did not add learningJourney data');
      }

      const genre = this.getGenreFromContext(context);
      const chapterType = this.identifyChapterType(context);

      // 🎯 STEP 2: 強化された連続性情報を取得（新しいヘルパー使用）
      const { previousChapterEnding, continuityInfo } = await this.getEnhancedContinuityInfo(context.chapterNumber || 1);
      const { purpose, plotPoints } = this.sectionBuilder.getChapterPurposeAndPlotPoints(context);

      // 🎯 STEP 3: 基本テンプレートを取得（既存の豊富なテンプレートを活用）
      let prompt = this.getBaseTemplateWithFallback();

      // 🎯 STEP 4: 基本プレースホルダーを置換
      prompt = this.replaceBasicPlaceholders(prompt, context, genre, {
        purpose,
        plotPoints,
        previousChapterEnding,
        ...continuityInfo
      });

      // 🎯 STEP 5: 詳細コンテンツの置換（世界設定、キャラクター等）
      prompt = await this.replaceContentPlaceholders(prompt, context);

      // 🎯 STEP 6: テンション・ペーシング情報を追加
      prompt = this.addTensionAndPacingDescriptions(prompt, context);

      // 🎯 STEP 7: 全セクションを安全に統合的に追加（新しいヘルパー使用）
      const sections = await this.buildSectionsSafely(context, genre);
      prompt += sections.join('\n');

      // 🎯 STEP 8: 残りの統合処理
      prompt = await this.addRemainingIntegrations(prompt, context, genre, chapterType);

      // 🎯 STEP 9: 学習旅程プロンプトとの統合
      prompt = this.integratePrompts(prompt, enrichedContext);

      // 🎯 STEP 10: 出力形式指示を確実に追加
      prompt = this.ensureOutputFormatInstructions(prompt, context);

      // 🎯 STEP 11: 最終品質チェック（新しいヘルパー使用）
      const validation = this.validatePromptCompleteness(prompt, context);
      if (!validation.isComplete) {
        logger.warn('Generated prompt is incomplete', {
          missing: validation.missingElements,
          suggestions: validation.suggestions
        });
      } else {
        logger.info('Generated prompt passed completeness validation');
      }

      // 🔬 診断チェックポイント: 最終プロンプト確認
      const learningKeywords = ['学びの物語ガイダンス', '感情アーク', 'カタルシス体験', '共感ポイント', '体現化ガイド'];
      const keywordMatches = learningKeywords.map(keyword => ({
        keyword,
        found: prompt.includes(keyword)
      }));

      const foundKeywords = keywordMatches.filter(k => k.found).length;
      if (foundKeywords === 0) {
        LJSCheck.failure('INTEGRATION', 'FINAL_PROMPT_NO_LEARNING_CONTENT', 'Final prompt contains no learning journey content', keywordMatches);
      } else if (foundKeywords < 3) {
        LJSCheck.warning('INTEGRATION', 'FINAL_PROMPT_PARTIAL_LEARNING_CONTENT', `Only ${foundKeywords}/5 learning keywords found`, keywordMatches);
      } else {
        LJSCheck.success('INTEGRATION', 'FINAL_PROMPT_HAS_LEARNING_CONTENT', { foundKeywords, totalKeywords: learningKeywords.length });
      }

      return prompt;
    } catch (error) {
      // 🔬 診断チェックポイント: エラー発生
      LJSCheck.failure('PROMPT_GENERATION', 'ERROR', error instanceof Error ? error.message : String(error));

      logger.error('Error generating enhanced prompt', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      // エラー時はシンプルなプロンプトを生成
      return this.generateFallbackPrompt(context);
    }
  }

  /**
   * 残りの統合処理を行う（セクション以外の統合要素）
   * @private
   */
  private async addRemainingIntegrations(
    prompt: string,
    context: GenerationContext,
    genre: string,
    chapterType: string
  ): Promise<string> {
    let result = prompt;

    // 🎯 重点キャラクターの決定と埋め込み
    const focusCharacters = this.sectionBuilder.determineFocusCharacters(context);
    result = result.replace('{focusCharacters}', focusCharacters.join('、'));

    // 🎯 伏線情報の処理
    if (context.foreshadowing && Array.isArray(context.foreshadowing)) {
      result = result.replace('{foreshadowing}', this.formatter.formatForeshadowing(context.foreshadowing));
    } else {
      result = result.replace('{foreshadowing}', '特になし');
    }

    // 🎯 矛盾情報の処理
    if (context.contradictions && Array.isArray(context.contradictions)) {
      result = result.replace('{contradictions}', this.formatter.formatContradictions(context.contradictions));
    } else {
      result = result.replace('{contradictions}', '特になし');
    }

    // 🎯 プロット指示の挿入
    result = this.insertPlotDirective(result, context);

    // 🎯 物語状態ガイダンスの置換
    result = this.replaceNarrativeStateGuidance(result, context, genre);

    // 🎯 永続的イベント情報の追加
    if (context.persistentEvents) {
      result += this.formatter.formatPersistentEvents(context.persistentEvents);
    }

    // 🎯 重要イベント・連続性ガイダンスの追加
    result = this.addSignificantEventsSection(result, context);
    result = this.addContinuityGuidanceSection(result, context);

    // 🎯 章タイプ・ジャンル固有ガイダンスの追加
    const chapterTypeGuidance = this.templateManager.getChapterTypeInstructions(chapterType, genre);
    if (chapterTypeGuidance) {
      result += `\n${chapterTypeGuidance}`;
    }

    const genreGuidance = this.templateManager.getGenreGuidance(genre);
    if (genreGuidance) {
      result += `\n${genreGuidance}`;
    }

    // 🎯 プロット要素があれば追加
    if (context.plotPoints && context.plotPoints.length > 0) {
      result += `\n【このチャプターで扱うべきプロット】\n`;
      result += context.plotPoints.map(point => `- ${point}`).join('\n');
    }

    // 🎯 表現制約があれば追加
    if (context.expressionConstraints && context.expressionConstraints.length > 0) {
      result += `\n【表現上の制約】\n`;
      result += context.expressionConstraints.map(constraint => `- ${constraint}`).join('\n');
    }

    return result;
  }

  /**
   * 出力形式指示を確実に追加する新メソッド
   * @private
   */
  private ensureOutputFormatInstructions(prompt: string, context: GenerationContext): string {
    // 既に出力形式が含まれているかチェック
    if (prompt.includes('【出力形式】') || prompt.includes('以下の形式で出力')) {
      return prompt;
    }

    // 目標文字数の取得
    const targetLength = context.targetLength || 8000;

    // 詳細な出力形式指示を追加
    const outputFormat = `

【出力形式】
以下の形式で出力してください:

---
title: (章のタイトルをここに記入)
pov: (視点キャラクターをここに記入)
location: (主な舞台をここに記入)
timeframe: (時間設定をここに記入)
emotionalTone: (感情基調をここに記入)
summary: (章の要約を100文字程度でここに記入)
---

(ここから直接本文を書き始めてください。タグや見出しは使わずに、物語の本文を約${targetLength}文字以上書いてください。この本文セクションは次の「---」まで続きます)

---
scenes:
  - title: (シーン1タイトル)
    type: (INTRODUCTION/DEVELOPMENT/CLIMAX/RESOLUTION/TRANSITIONのいずれか)
    characters: (登場キャラクター、カンマ区切り)
    location: (場所)
    summary: (シーンの要約)
  - title: (シーン2タイトル)
    type: (シーンタイプ)
    characters: (登場キャラクター)
    location: (場所)
    summary: (シーンの要約)
keywords: (重要キーワード、カンマ区切り)
events: (主要イベント、カンマ区切り)
---`;

    return prompt + outputFormat;
  }

  // 🎯 追加の統合ヘルパーメソッド群

  /**
   * 強化された連続性情報を取得
   * @private
   */
  private async getEnhancedContinuityInfo(chapterNumber: number): Promise<{
    previousChapterEnding: string,
    continuityInfo: {
      previousScene: string,
      characterPositions: string,
      timeElapsed: string,
      location: string,
      endingGuidance: string
    }
  }> {
    try {
      const [previousChapterEnding, continuityInfo] = await Promise.all([
        this.memoryService.getPreviousChapterEnding(chapterNumber),
        this.memoryService.getSceneContinuityInfo(chapterNumber)
      ]);

      return {
        previousChapterEnding,
        continuityInfo
      };
    } catch (error) {
      logger.warn('Failed to get enhanced continuity info', { error });
      return {
        previousChapterEnding: chapterNumber <= 1 ?
          '物語の始まりです。' :
          '前章の情報にアクセスできません。新しい章を自由に展開してください。',
        continuityInfo: {
          previousScene: '特になし',
          characterPositions: '特になし',
          timeElapsed: '前章からの自然な時間経過',
          location: '前章と同じ場所、または自然な移動先',
          endingGuidance: '次章への興味を引く展開で終わらせる'
        }
      };
    }
  }

  /**
   * エラーハンドリングを強化したSectionBuilder統合
   * @private
   */
  private async buildSectionsSafely(
    context: GenerationContext,
    genre: string
  ): Promise<string[]> {
    const sectionBuilders = [
      { name: 'characterPsychology', fn: () => this.sectionBuilder.buildCharacterPsychologySection(context) },
      { name: 'characterGrowth', fn: () => this.sectionBuilder.buildCharacterGrowthSection(context, genre) },
      { name: 'emotionalArc', fn: () => this.sectionBuilder.buildEmotionalArcSection(context, genre) },
      { name: 'styleGuidance', fn: () => this.sectionBuilder.buildStyleGuidanceSection(context, genre) },
      { name: 'expressionAlternatives', fn: () => this.sectionBuilder.buildExpressionAlternativesSection(context, genre) },
      { name: 'readerExperience', fn: () => this.sectionBuilder.buildReaderExperienceSection(context, genre) },
      { name: 'literaryInspiration', fn: () => this.sectionBuilder.buildLiteraryInspirationSection(context, genre) },
      { name: 'themeEnhancement', fn: () => this.sectionBuilder.buildThemeEnhancementSection(context, genre) },
      { name: 'tensionGuidance', fn: () => this.sectionBuilder.buildTensionGuidanceSection(context, genre) },
      { name: 'businessSpecific', fn: () => this.sectionBuilder.buildBusinessSpecificSection(genre) },
      { name: 'learningJourney', fn: () => this.sectionBuilder.buildLearningJourneySection(context, genre) }
    ];

    const sections: string[] = [];

    for (const { name, fn } of sectionBuilders) {
      try {
        // 🔬 診断チェックポイント: 学習旅程セクション構築
        if (name === 'learningJourney') {
          LJSCheck.info('SECTION_BUILDING', 'LEARNING_SECTION_START', {
            hasLearningJourneyInContext: !!(context as any).learningJourney,
            genre
          });

          const section = fn();
          
          if (!section) {
            LJSCheck.failure('SECTION_BUILDING', 'LEARNING_SECTION_EMPTY', 'buildLearningJourneySection returned empty result');
          } else if (section.trim().length === 0) {
            LJSCheck.failure('SECTION_BUILDING', 'LEARNING_SECTION_BLANK', 'buildLearningJourneySection returned blank content');
          } else {
            sections.push(section);
            LJSCheck.success('SECTION_BUILDING', 'LEARNING_SECTION_BUILT', {
              sectionLength: section.length,
              preview: section.substring(0, 100) + '...'
            });
            logger.debug(`Successfully built ${name} section`);
          }
        } else {
          const section = fn();
          if (section && section.trim()) {
            sections.push(section);
            logger.debug(`Successfully built ${name} section`);
          }
        }
      } catch (error) {
        if (name === 'learningJourney') {
          LJSCheck.failure('SECTION_BUILDING', 'LEARNING_SECTION_ERROR', error instanceof Error ? error.message : String(error));
        }
        
        logger.warn(`Failed to build ${name} section`, {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return sections;
  }

  /**
   * プロンプト品質保証のための最終検証
   * @private
   */
  private validatePromptCompleteness(prompt: string, context: GenerationContext): {
    isComplete: boolean;
    missingElements: string[];
    suggestions: string[];
  } {
    const required = [
      { check: prompt.includes('章番号'), element: '章番号' },
      { check: prompt.includes('目標文字数'), element: '目標文字数' },
      { check: prompt.includes('前章') || context.chapterNumber === 1, element: '前章情報' },
      { check: prompt.includes('【出力形式】') || prompt.includes('以下の形式'), element: '出力形式指示' },
      { check: prompt.includes('登場人物'), element: 'キャラクター情報' },
      { check: prompt.includes('世界設定'), element: '世界設定' }
    ];

    const missing = required.filter(r => !r.check).map(r => r.element);

    const suggestions: string[] = [];
    if (missing.length > 0) {
      suggestions.push(`欠落している要素を追加: ${missing.join(', ')}`);
    }
    if (!prompt.includes('五感') && !prompt.includes('描写')) {
      suggestions.push('描写に関する指示を追加');
    }
    if (!prompt.includes('テンション') && !prompt.includes('ペーシング')) {
      suggestions.push('テンション・ペーシング指示を追加');
    }

    return {
      isComplete: missing.length === 0,
      missingElements: missing,
      suggestions
    };
  }

  /**
   * 基本テンプレートを取得（フォールバック対応）
   * @private
   */
  private getBaseTemplateWithFallback(): string {
    try {
      // 既存のテンプレートマネージャーから詳細なテンプレートを取得
      return this.templateManager.getBaseTemplate();
    } catch (error) {
      logger.warn('Failed to get base template, using fallback', { error });
      // promptTemplates.jsonの基本テンプレートと同等のフォールバック
      return `# 【小説生成指示】
## 基本情報
- 章番号: {chapterNumber}/{totalChapters}
- 目標文字数: {targetLength}文字程度
- 語り口調: {narrativeStyle}
- トーン: {tone}
- テーマ: {theme}
- ジャンル: {genre}

## 前章の状況（直接続きを書いてください）
{previousChapterEnding}

## 展開指示（必ず遵守してください）
- この章の目的: {chapterPurpose}
- 達成すべきプロット要素: {requiredPlotPoints}
- 章の終わり方方針: {chapterEndingGuidance}

## 表現指標
- テンションレベル: {tensionLevel} ({tensionDescription})
- ペーシングレベル: {pacingLevel} ({pacingDescription})

## 世界設定
{worldSettings}

## 登場人物
{characters}

## 物語の文脈
{storyContext}

## この章で特に重視するキャラクター
{focusCharacters}

## 伏線情報
{foreshadowing}

## 物語状態ガイダンス
{narrativeStateGuidance}

## 注意すべき矛盾点
{contradictions}

## シーン連続性指示（必ず遵守してください）
- 前章の最終シーン: {previousSceneDescription}
- 登場キャラクターの位置: {characterPositions}
- 時間経過: {timeElapsed}
- 場所: {currentLocation}

## 一般指示
- 目標文字数（{targetLength}字程度）を意識してください
- {narrativeStyle}で描写を展開してください
- キャラクターの個性が伝わる会話と行動を描写してください
- 五感を使った描写を心がけてください
- **前章からの直接的な続きとして書き、物語を必ず前進させてください**
- **各シーンで必ず新しい進展または変化を生じさせてください**
- 物語として意味のある展開を作ってください`;
    }
  }

  /**
   * フォールバック用のシンプルなプロンプトを生成する
   * @private
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {string} シンプルなプロンプト
   */
  private generateFallbackPrompt(context: GenerationContext): string {
    return `
# 小説生成指示
- 章番号: ${context.chapterNumber || 1}
- 目標文字数: ${context.targetLength || 8000}文字程度
- ジャンル: ${context.genre || '指定なし'}
- テーマ: ${context.theme || '指定なし'}

## 設定
${context.worldSettings ? (typeof context.worldSettings === 'string' ? context.worldSettings : '世界設定あり') : '特定の設定はありません。自由に創造してください。'}

## 登場人物
${context.characters && context.characters.length > 0
        ? context.characters.map(c => `- ${c.name}: ${c.description || ''}`).join('\n')
        : '登場人物は自由に創造してください。'}

## ストーリーコンテキスト
${context.storyContext || '特に指定はありません。自由に展開してください。'}

## プロット要素
${context.plotPoints && context.plotPoints.length > 0
        ? context.plotPoints.map(p => `- ${p}`).join('\n')
        : '特定のプロット要素はありません。自由に発展させてください。'}

## 一般指示
- 目標文字数を意識して執筆してください
- 登場人物の個性が伝わる描写を心がけてください
- 読者の興味を引く展開を考えてください
- 五感を使った描写を心がけてください
    `;
  }

  /**
   * 基本プレースホルダーの置換
   * @private
   * @param {string} template テンプレート文字列
   * @param {GenerationContext} context 生成コンテキスト
   * @param {string} genre ジャンル
   * @param {object} additionalData 追加データ
   * @returns {string} 置換後のテンプレート
   */
  private replaceBasicPlaceholders(
    template: string,
    context: GenerationContext,
    genre: string,
    additionalData: {
      purpose: string,
      plotPoints: string,
      previousChapterEnding: string,
      previousScene: string,
      characterPositions: string,
      timeElapsed: string,
      location: string,
      endingGuidance: string
    }
  ): string {
    // 基本情報の置換（既存のロジックを保持しつつ拡張）
    let result = template
      .replace('{chapterNumber}', String(context.chapterNumber || 1))
      .replace('{totalChapters}', String((context as any).totalChapters || '?'))
      .replace(/\{targetLength\}/g, String(context.targetLength || 8000))
      .replace('{narrativeStyle}', context.narrativeStyle || '三人称視点')
      .replace('{tone}', context.tone || '標準的な語り口')
      .replace('{theme}', context.theme || '成長と冒険')
      .replace('{genre}', genre);

    // 追加データの置換（既存のロジック）
    result = result
      .replace('{previousChapterEnding}', additionalData.previousChapterEnding)
      .replace('{chapterPurpose}', additionalData.purpose)
      .replace('{requiredPlotPoints}', additionalData.plotPoints)
      .replace('{previousSceneDescription}', additionalData.previousScene)
      .replace('{characterPositions}', additionalData.characterPositions)
      .replace('{timeElapsed}', additionalData.timeElapsed)
      .replace('{currentLocation}', additionalData.location)
      .replace('{chapterEndingGuidance}', additionalData.endingGuidance);

    return result;
  }

  /**
   * テンションとペーシングの説明を追加する
   * @private
   * @param {string} template テンプレート文字列
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {string} 置換後のテンプレート
   */
  private addTensionAndPacingDescriptions(template: string, context: GenerationContext): string {
    const tensionLevel = (context as any).tension || 0.5;
    const pacingLevel = (context as any).pacing || 0.5;

    return template
      .replace('{tensionLevel}', `${Math.round(tensionLevel * 10)}/10`)
      .replace('{tensionDescription}', this.getDescriptionByLevelWithFallback('tensionDescriptions', tensionLevel))
      .replace('{pacingLevel}', `${Math.round(pacingLevel * 10)}/10`)
      .replace('{pacingDescription}', this.getDescriptionByLevelWithFallback('pacingDescriptions', pacingLevel));
  }

  /**
   * レベル別説明を取得（フォールバック対応）
   * @private
   */
  private getDescriptionByLevelWithFallback(category: string, level: number): string {
    try {
      return this.templateManager.getDescriptionByLevel(category, level);
    } catch (error) {
      logger.warn(`Failed to get ${category} description, using fallback`, { level });

      if (category === 'tensionDescriptions') {
        if (level < 0.3) return '静かで穏やかな雰囲気';
        if (level < 0.7) return '適度な緊張感';
        return '高い緊張感とスリル';
      } else if (category === 'pacingDescriptions') {
        if (level < 0.3) return 'ゆっくりとした展開';
        if (level < 0.7) return '中程度のテンポ';
        return '速いテンポでの展開';
      }

      return '標準的な展開';
    }
  }


  /**
   * 詳細なセクションを追加する
   * @private
   * @param {string} prompt 基本プロンプト
   * @param {GenerationContext} context 生成コンテキスト
   * @param {string} genre ジャンル
   * @param {string} chapterType 章タイプ
   * @returns {Promise<string>} 拡張されたプロンプト
   */
  private async addDetailedSections(
    prompt: string,
    context: GenerationContext,
    genre: string,
    chapterType: string
  ): Promise<string> {
    // 世界設定・キャラクター情報・ストーリーコンテキストの置換
    prompt = await this.replaceContentPlaceholders(prompt, context);

    // 重点的に描写すべきキャラクターを特定
    const focusCharacters = this.sectionBuilder.determineFocusCharacters(context);
    prompt = prompt.replace('{focusCharacters}', focusCharacters.join('、'));

    // 伏線情報の最適化フォーマット
    if (context.foreshadowing && Array.isArray(context.foreshadowing)) {
      prompt = prompt.replace('{foreshadowing}', this.formatter.formatForeshadowing(context.foreshadowing));
    } else {
      prompt = prompt.replace('{foreshadowing}', '特になし');
    }

    // プロット指示を挿入（存在する場合）
    prompt = this.insertPlotDirective(prompt, context);

    // 物語状態のガイダンスを追加
    prompt = this.replaceNarrativeStateGuidance(prompt, context, genre);

    // 矛盾情報の処理
    if (context.contradictions && Array.isArray(context.contradictions)) {
      prompt = prompt.replace('{contradictions}', this.formatter.formatContradictions(context.contradictions));
    } else {
      prompt = prompt.replace('{contradictions}', '特になし');
    }

    // 永続的イベント情報セクションの追加
    if (context.persistentEvents) {
      prompt += this.formatter.formatPersistentEvents(context.persistentEvents);
      logger.debug('Added persistent events section to prompt');
    }

    // 重要イベント情報セクションの追加
    prompt = this.addSignificantEventsSection(prompt, context);

    // 連続性ガイダンスセクションの追加
    prompt = this.addContinuityGuidanceSection(prompt, context);

    // キャラクターの心理状態セクションを追加
    const psychologySection = this.sectionBuilder.buildCharacterPsychologySection(context);
    if (psychologySection) {
      prompt += psychologySection;
    }

    // キャラクター成長・スキル情報セクションを追加
    const growthSection = this.sectionBuilder.buildCharacterGrowthSection(context, genre);
    if (growthSection) {
      prompt += growthSection;
      logger.debug('Added character growth and skills section to prompt');
    }

    // 感情アークセクションを追加
    const emotionalArcSection = this.sectionBuilder.buildEmotionalArcSection(context, genre);
    if (emotionalArcSection) {
      prompt += emotionalArcSection;
      logger.debug('Added emotional arc design to prompt');
    }

    // 学習旅程セクションを追加（「魂のこもった学びの物語」統合）
    const learningJourneySection = this.sectionBuilder.buildLearningJourneySection(context, genre);
    if (learningJourneySection) {
      prompt += learningJourneySection;
      logger.debug('Added learning journey section to prompt');
    }

    // 文体ガイダンスセクションを追加
    const styleSection = this.sectionBuilder.buildStyleGuidanceSection(context, genre);
    if (styleSection) {
      prompt += styleSection;
    }

    // 表現多様化セクションを追加
    const expressionSection = this.sectionBuilder.buildExpressionAlternativesSection(context, genre);
    if (expressionSection) {
      prompt += expressionSection;
    }

    // 読者体験向上セクションを追加
    const readerSection = this.sectionBuilder.buildReaderExperienceSection(context, genre);
    if (readerSection) {
      prompt += readerSection;
    }

    // 文学的インスピレーションセクションを追加
    const literarySection = this.sectionBuilder.buildLiteraryInspirationSection(context, genre);
    if (literarySection) {
      prompt += literarySection;
    }

    // テーマ表現の深化セクションを追加
    const themeSection = this.sectionBuilder.buildThemeEnhancementSection(context, genre);
    if (themeSection) {
      prompt += themeSection;
    }

    // テンション構築セクションを追加
    const tensionSection = this.sectionBuilder.buildTensionGuidanceSection(context, genre);
    if (tensionSection) {
      prompt += tensionSection;
    }

    // ビジネスジャンル向けの特別セクションを追加
    const businessSpecificSection = this.sectionBuilder.buildBusinessSpecificSection(genre);
    if (businessSpecificSection) {
      prompt += businessSpecificSection;
    }

    // 章タイプ固有の指示を追加
    const chapterTypeGuidance = this.templateManager.getChapterTypeInstructions(chapterType, genre);
    if (chapterTypeGuidance) {
      prompt += `\n${chapterTypeGuidance}`;
    }

    // ジャンル固有のガイダンスを追加
    const genreGuidance = this.templateManager.getGenreGuidance(genre);
    if (genreGuidance) {
      prompt += `\n${genreGuidance}`;
    }

    // プロット関連情報があれば追加
    if (context.plotPoints && context.plotPoints.length > 0) {
      prompt += `\n【このチャプターで扱うべきプロット】\n`;
      prompt += context.plotPoints.map(point => `- ${point}`).join('\n');
    }

    // 表現制約があれば追加
    if (context.expressionConstraints && context.expressionConstraints.length > 0) {
      prompt += `\n【表現上の制約】\n`;
      prompt += context.expressionConstraints.map(constraint => `- ${constraint}`).join('\n');
    }

    return prompt;
  }

  /**
   * コンテキストに学習旅程情報を追加する
   * @private
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {Promise<GenerationContext>} 拡張されたコンテキスト
   */
  private async enrichContextWithLearningJourney(context: GenerationContext): Promise<GenerationContext> {
    // 🔬 診断チェックポイント: 学習旅程コンテキスト拡張開始
    LJSCheck.info('CONTEXT_ENRICHMENT', 'ENRICHMENT_START', {
      hasExistingLearningJourney: !!(context as any).learningJourney,
      chapterNumber: context.chapterNumber,
      hasLearningJourneySystem: !!this.learningJourneySystem
    });

    // LearningJourneySystemが利用できない場合は元のコンテキストを返す
    if (!this.learningJourneySystem || !this.learningJourneySystem.isInitialized()) {
      LJSCheck.failure('CONTEXT_ENRICHMENT', 'LJS_NOT_AVAILABLE', 'LearningJourneySystem not available or not initialized', {
        hasSystem: !!this.learningJourneySystem,
        isInitialized: this.learningJourneySystem?.isInitialized()
      });
      return context;
    }

    try {
      const chapterNumber = context.chapterNumber || 1;
      logger.debug(`Enriching context with learning journey for chapter ${chapterNumber}`);

      // 既にlearningJourneyが設定されている場合はそのまま返す
      if ((context as any).learningJourney) {
        logger.debug('Context already contains learning journey information');
        LJSCheck.info('CONTEXT_ENRICHMENT', 'ALREADY_ENRICHED', 'Context already contains learning journey data');
        return context;
      }

      // コンテキストの浅いコピーを作成
      const enrichedContext = { ...context };

      // メイン概念を取得（もし直接設定されていなければ）
      const mainConcept = await this.getMainConcept(context);
      if (!mainConcept) {
        LJSCheck.failure('CONTEXT_ENRICHMENT', 'MAIN_CONCEPT_NOT_FOUND', 'Main concept could not be determined');
        return context;
      }

      LJSCheck.success('CONTEXT_ENRICHMENT', 'MAIN_CONCEPT_OBTAINED', { mainConcept });

      // 学習段階を判断
      const learningStage = await this.learningJourneySystem.concept.determineLearningStage(
        mainConcept,
        chapterNumber
      );

      LJSCheck.success('CONTEXT_ENRICHMENT', 'LEARNING_STAGE_DETERMINED', { learningStage });

      // 体現化プランを取得
      const embodimentPlan = await this.learningJourneySystem.concept.getEmbodimentPlan(
        mainConcept,
        chapterNumber
      );

      // 感情アーク設計を取得
      const emotionalArc = await this.learningJourneySystem.emotion.designEmotionalArc(
        mainConcept,
        learningStage,
        chapterNumber
      );

      // カタルシス体験を取得
      const catharticExperience = await this.learningJourneySystem.emotion.designCatharticExperience(
        mainConcept,
        learningStage,
        chapterNumber
      );

      // シーン推奨を取得
      const sceneRecommendations = await this.learningJourneySystem.story.generateSceneRecommendations(
        mainConcept,
        learningStage,
        chapterNumber
      );

      // 共感ポイントを生成
      const empatheticPoints = await this.learningJourneySystem.emotion.generateEmpatheticPoints(
        '',  // 内容がまだないので空文字
        mainConcept,
        learningStage
      );

      // 学習旅程情報をコンテキストに追加
      (enrichedContext as any).learningJourney = {
        mainConcept,
        learningStage,
        embodimentPlan,
        emotionalArc,
        catharticExperience: catharticExperience || undefined,
        sceneRecommendations,
        empatheticPoints
      };

      LJSCheck.success('CONTEXT_ENRICHMENT', 'ENRICHMENT_SUCCESS', {
        mainConcept,
        learningStage,
        hasEmbodimentPlan: !!embodimentPlan,
        hasEmotionalArc: !!emotionalArc,
        hasCatharticExperience: !!catharticExperience,
        sceneRecommendationsCount: sceneRecommendations?.length || 0,
        empatheticPointsCount: empatheticPoints?.length || 0
      });

      logger.debug('Successfully enriched context with learning journey information', {
        mainConcept,
        learningStage,
        hasEmbodimentPlan: !!embodimentPlan,
        hasEmotionalArc: !!emotionalArc,
        hasCatharticExperience: !!catharticExperience,
        sceneRecommendationsCount: sceneRecommendations?.length || 0
      });

      return enrichedContext;
    } catch (error) {
      logger.error('Error enriching context with learning journey', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      LJSCheck.failure('CONTEXT_ENRICHMENT', 'ENRICHMENT_ERROR', error instanceof Error ? error.message : String(error));
      return context;
    }
  }

  /**
   * メインコンセプトを取得する
   * @private
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {Promise<string | null>} メインコンセプト
   */
  private async getMainConcept(context: GenerationContext): Promise<string | null> {
    // コンテキストから直接取得（もし設定されていれば）
    if ((context as any).mainConcept) {
      return (context as any).mainConcept;
    }

    // PlotManagerから取得（もし利用可能であれば）
    if (this.plotManager) {
      try {
        const formattedWorldAndTheme = await this.plotManager.getFormattedWorldAndTheme();
        if (formattedWorldAndTheme.theme) {
          return 'ISSUE DRIVEN'; // テーマがあればデフォルトコンセプトを返す
        }
      } catch (error) {
        logger.warn('Error fetching theme from plot manager', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // ビジネスジャンルの場合はデフォルトのコンセプトを返す
    const genre = this.getGenreFromContext(context);
    if (genre === 'business') {
      return 'ISSUE DRIVEN';
    }

    return null;
  }

  /**
 * 既存プロンプトと学習旅程プロンプトを統合する
 * @private
 * @param {string} prompt 既存プロンプト
 * @param {GenerationContext} context 生成コンテキスト
 * @returns {string} 統合されたプロンプト
 */
  private integratePrompts(prompt: string, context: GenerationContext): string {
    // 直接のLearningJourneyPromptがある場合
    if ((context as any).rawLearningJourneyPrompt) {
      const rawLearningJourneyPrompt = (context as any).rawLearningJourneyPrompt;
      const instructionSections = this.extractInstructionSections(rawLearningJourneyPrompt);

      // MODE OVERRIDEの場合でも、第1章では特別処理
      if (instructionSections.some(section => section.title.includes('MODE OVERRIDE'))) {
        // 👇 第1章の場合は特別な統合方法を使用
        if (context.chapterNumber === 1) {
          return this.getFirstChapterIntegratedPrompt(prompt, rawLearningJourneyPrompt);
        }
        // それ以外の章は通常の統合方法
        return this.getModeOverrideIntegratedPrompt(prompt, rawLearningJourneyPrompt);
      }

      // 重要な指示セクションを組み込む
      if (instructionSections.length > 0) {
        // 既存プロンプトの最後に統合ガイダンスとして追加
        prompt += "\n## 「魂のこもった学びの物語」の追加ガイダンス\n";
        prompt += "以下の要素を物語に必ず取り入れてください：\n\n";

        for (const section of instructionSections) {
          if (this.isImportantSection(section.title)) {
            prompt += `### ${section.title}\n${section.content}\n\n`;
          }
        }
      }
    }

    return prompt;
  }

  /**
 * 第1章用の特別な統合プロンプトを取得する
 * @private
 * @param {string} originalPrompt 元のプロンプト
 * @param {string} learningJourneyPrompt 学習旅程プロンプト
 * @returns {string} 統合されたプロンプト
 */
  private getFirstChapterIntegratedPrompt(originalPrompt: string, learningJourneyPrompt: string): string {
    // 学習旅程プロンプトから重要な学習要素を抽出
    const learningStageRegex = /・学習段階: ([^\n]+)/;
    const empatheticPointsRegex = /## 共感ポイント\n([\s\S]*?)(?=##|$)/;
    const emotionalArcRegex = /### 感情アーク\n([\s\S]*?)(?=###|$)/;

    const learningStageMatch = learningJourneyPrompt.match(learningStageRegex);
    const empatheticPointsMatch = learningJourneyPrompt.match(empatheticPointsRegex);
    const emotionalArcMatch = learningJourneyPrompt.match(emotionalArcRegex);

    const learningStage = learningStageMatch ? learningStageMatch[1].trim() : '';
    const empatheticPoints = empatheticPointsMatch ? empatheticPointsMatch[1].trim() : '';
    const emotionalArc = emotionalArcMatch ? emotionalArcMatch[1].trim() : '';

    // 基本プロンプトをベースにする（第1章では基本プロンプトを優先）
    let integratedPrompt = originalPrompt;

    // 学習要素を基本プロンプトの後に追加
    integratedPrompt += "\n\n## 学びの物語の追加要素\n";

    if (learningStage) {
      integratedPrompt += `### 学習段階\n・${learningStage}\n\n`;
    }

    if (emotionalArc) {
      integratedPrompt += `### 感情アーク\n${emotionalArc}\n\n`;
    }

    if (empatheticPoints) {
      integratedPrompt += `### 共感ポイント\n${empatheticPoints}\n\n`;
    }

    // 重要な執筆ガイドライン（魂のこもった物語の核心部分）
    integratedPrompt += `
## 重要な執筆ガイドライン
1. **変容と成長**: キャラクターの内面変化を通して読者に共感体験を提供する
2. **体験的学習**: 概念を説明するのではなく、キャラクターの体験を通して読者が自然と学べるようにする
3. **感情の旅**: 指定された感情アークに沿って読者を感情的な旅に連れていく
4. **共感ポイント**: 指定された共感ポイントを効果的に描写し、読者の感情移入を促す
5. **カタルシス**: 学びと感情が統合された瞬間を印象的に描く
6. **自然な対話**: 教科書的な説明ではなく、自然な対話と内面描写で概念を表現する
7. **具体的な場面**: 抽象的な概念を具体的なビジネスシーンで表現する
`;

    return integratedPrompt;
  }

  /**
   * 指示セクションを抽出する
   * @private
   * @param {string} prompt プロンプト文字列
   * @returns {Array<{title: string, content: string}>} 指示セクション
   */
  private extractInstructionSections(prompt: string): Array<{ title: string, content: string }> {
    const sections: Array<{ title: string, content: string }> = [];
    const sectionRegex = /##\s+([^\n]+)\n([\s\S]*?)(?=##|$)/g;

    let match;
    while ((match = sectionRegex.exec(prompt)) !== null) {
      sections.push({
        title: match[1].trim(),
        content: match[2].trim()
      });
    }

    return sections;
  }

  /**
   * 重要なセクションかどうかを判断する
   * @private
   * @param {string} sectionTitle セクションタイトル
   * @returns {boolean} 重要なセクションかどうか
   */
  private isImportantSection(sectionTitle: string): boolean {
    const importantSections = [
      "重要な執筆ガイドライン",
      "変容と成長",
      "体験的学習",
      "感情の旅",
      "共感ポイント",
      "カタルシス",
      "執筆の重点",
      "学びのポイント",
      "MODE OVERRIDE"
    ];

    return importantSections.some(important =>
      sectionTitle.includes(important) ||
      important.includes(sectionTitle)
    );
  }

  /**
   * 最適化されたプロンプト統合メソッド
   * 基本プロンプトと学習旅程プロンプトを章に応じて適切に統合する
   * @private
   * @param {string} originalPrompt 元のプロンプト
   * @param {string} learningJourneyPrompt 学習旅程プロンプト
   * @param {number} chapterNumber 章番号
   * @returns {string} 統合されたプロンプト
   */
  private getModeOverrideIntegratedPrompt(originalPrompt: string, learningJourneyPrompt: string, chapterNumber: number = 1): string {
    // 必須セクションの正規表現パターン
    // インデックスシグネチャを追加
    const sectionPatterns: { [key: string]: RegExp } = {
      // 基本構造セクション
      basicInfo: /## 基本情報\n([\s\S]*?)(?=##|$)/,
      previousChapter: /## 前章の状況\n([\s\S]*?)(?=##|$)/,
      plotDirective: /## 展開指示\n([\s\S]*?)(?=##|$)/,
      worldSettings: /## 世界設定\n([\s\S]*?)(?=##|$)/,
      characters: /## 登場人物\n([\s\S]*?)(?=##|$)/,
      storyContext: /## 物語の文脈\n([\s\S]*?)(?=##|$)/,
      storyStructure: /## 物語構造とプロット指示\n([\s\S]*?)(?=##|$)/,
      sceneContinuity: /## シーン連続性指示\n([\s\S]*?)(?=##|$)/,
      outputFormat: /【出力形式】\n([\s\S]*?)(?=##|$)/,

      // 補完セクション
      characterPsychology: /## キャラクターの心理状態\n([\s\S]*?)(?=##|$)/,
      characterGrowth: /## キャラクターの成長とスキル情報\n([\s\S]*?)(?=##|$)/,
      emotionalArc: /## 感情アークの設計\n([\s\S]*?)(?=##|$)/,
      tensionGuidance: /## テンション構築の詳細ガイダンス\n([\s\S]*?)(?=##|$)/,
      styleGuidance: /## 文体ガイダンス\n([\s\S]*?)(?=##|$)/,
      expressionDiversity: /## 表現の多様化\n([\s\S]*?)(?=##|$)/,
      literaryTechniques: /## 文学的手法のインスピレーション\n([\s\S]*?)(?=##|$)/
    };

    // 各セクションの内容を抽出
    const extractedSections: Record<string, string> = {};

    // セクションを抽出する関数
    const extractSection = (source: string, patternKey: string): string => {
      const match = source.match(sectionPatterns[patternKey]);
      return match && match[1] ? match[1].trim() : '';
    };

    // 全セクションを抽出
    for (const [key, _] of Object.entries(sectionPatterns)) {
      extractedSections[key] = extractSection(originalPrompt, key);
    }

    // 第1章かそれ以外かでベースプロンプトを選択
    let integratedPrompt = '';

    if (chapterNumber === 1) {
      // 第1章は基本プロンプトをベースにし、学習要素を追加
      integratedPrompt = originalPrompt;

      // 学習旅程の重要要素を抽出
      const learningStageRegex = /・学習段階: ([^\n]+)/;
      const conceptNameRegex = /・概念: ([^\n]+)/;
      const empatheticPointsRegex = /## 共感ポイント\n([\s\S]*?)(?=##|$)/;
      const embodimentGuideRegex = /### 体現化ガイド\n([\s\S]*?)(?=###|$)/;

      const learningStageMatch = learningJourneyPrompt.match(learningStageRegex);
      const conceptNameMatch = learningJourneyPrompt.match(conceptNameRegex);
      const empatheticPointsMatch = learningJourneyPrompt.match(empatheticPointsRegex);
      const embodimentGuideMatch = learningJourneyPrompt.match(embodimentGuideRegex);

      const learningStage = learningStageMatch ? learningStageMatch[1].trim() : '';
      const conceptName = conceptNameMatch ? conceptNameMatch[1].trim() : '';
      const empatheticPoints = empatheticPointsMatch ? empatheticPointsMatch[1].trim() : '';
      const embodimentGuide = embodimentGuideMatch ? embodimentGuideMatch[1].trim() : '';

      // 学習要素を追加（基本プロンプトの後に）
      const learningSection = `
## 学びの物語ガイダンス
・概念: ${conceptName}
・学習段階: ${learningStage}

### 体現化ガイド
${embodimentGuide}

## 共感ポイント
${empatheticPoints}

## 重要な執筆ガイドライン
1. **変容と成長**: キャラクターの内面変化を通して読者に共感体験を提供する
2. **体験的学習**: 概念を説明するのではなく、キャラクターの体験を通して読者が自然と学べるようにする
3. **感情の旅**: 指定された感情アークに沿って読者を感情的な旅に連れていく
4. **共感ポイント**: 指定された共感ポイントを効果的に描写し、読者の感情移入を促す
5. **カタルシス**: 学びと感情が統合された瞬間を印象的に描く
6. **自然な対話**: 教科書的な説明ではなく、自然な対話と内面描写で概念を表現する
7. **具体的な場面**: 抽象的な概念を具体的なビジネスシーンで表現する
`;

      // 【出力形式】の前に学習要素を挿入
      const outputFormatIndex = integratedPrompt.indexOf('【出力形式】');
      if (outputFormatIndex !== -1) {
        integratedPrompt =
          integratedPrompt.substring(0, outputFormatIndex) +
          learningSection +
          '\n\n' +
          integratedPrompt.substring(outputFormatIndex);
      } else {
        integratedPrompt += '\n\n' + learningSection;
      }

      return integratedPrompt;
    } else {
      // 第2章以降は学習旅程プロンプトをベースに必要なセクションを追加
      integratedPrompt = learningJourneyPrompt;

      // セクションの最適な配置順序
      const sectionOrder = [
        'basicInfo',
        'worldSettings',
        'characters',
        'previousChapter',
        'plotDirective',
        'storyContext',
        'storyStructure',
        'sceneContinuity',
        'characterPsychology',
        'characterGrowth',
        'emotionalArc',
        'tensionGuidance',
        'styleGuidance',
        'expressionDiversity',
        'literaryTechniques',
        'outputFormat'
      ];

      // 各セクションを配置順に追加（存在し、未追加のもののみ）
      for (const sectionKey of sectionOrder) {
        const sectionContent = extractedSections[sectionKey];
        const sectionTitle = sectionKey === 'outputFormat' ? '【出力形式】' : `## ${this.formatSectionTitle(sectionKey)}`;

        // セクションが存在し、まだ追加されていない場合のみ追加
        if (sectionContent && !integratedPrompt.includes(sectionTitle)) {
          // 出力形式は最後に追加
          if (sectionKey === 'outputFormat') {
            integratedPrompt += `\n\n${sectionTitle}\n${sectionContent}`;
          }
          // 基本情報は先頭に追加
          else if (sectionKey === 'basicInfo') {
            integratedPrompt = `${sectionTitle}\n${sectionContent}\n\n${integratedPrompt}`;
          }
          // それ以外は適切な位置に追加
          else {
            integratedPrompt += `\n\n${sectionTitle}\n${sectionContent}`;
          }
        }
      }
    }

    return integratedPrompt;
  }

  /**
   * セクションキーを表示用タイトルに変換
   * @private
   * @param {string} sectionKey セクションキー
   * @returns {string} 表示用タイトル
   */
  private formatSectionTitle(sectionKey: string): string {
    const titleMap: Record<string, string> = {
      basicInfo: '基本情報',
      previousChapter: '前章の状況',
      plotDirective: '展開指示',
      worldSettings: '世界設定',
      characters: '登場人物',
      storyContext: '物語の文脈',
      storyStructure: '物語構造とプロット指示',
      sceneContinuity: 'シーン連続性指示',
      characterPsychology: 'キャラクターの心理状態',
      characterGrowth: 'キャラクターの成長とスキル情報',
      emotionalArc: '感情アークの設計',
      tensionGuidance: 'テンション構築の詳細ガイダンス',
      styleGuidance: '文体ガイダンス',
      expressionDiversity: '表現の多様化',
      literaryTechniques: '文学的手法のインスピレーション'
    };

    return titleMap[sectionKey] || sectionKey;
  }

  /**
   * 世界設定・キャラクター情報・ストーリーコンテキストを置換する
   * @private
   * @param {string} prompt プロンプト文字列
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {Promise<string>} 置換後のプロンプト
   */
  private async replaceContentPlaceholders(prompt: string, context: GenerationContext): Promise<string> {
    // 世界設定の置換
    let worldSettings = '';

    // PlotManagerを使用して世界設定とテーマを取得
    if (this.plotManager) {
      try {
        const formattedWorldAndTheme = await this.plotManager.getFormattedWorldAndTheme();
        if (formattedWorldAndTheme.worldSettings) {
          worldSettings = formattedWorldAndTheme.worldSettings;
        }
      } catch (error) {
        logger.warn('Error fetching world settings from plot manager', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // PlotManagerからの取得に失敗した場合はcontextから直接取得
    if (!worldSettings && context.worldSettings) {
      worldSettings = this.formatter.formatWorldSettings(context.worldSettings);
    }

    // キャラクター情報の置換
    const characters = await this.formatter.formatCharacters(context.characters || []);

    // プロンプトに情報を追加
    return prompt
      .replace('{worldSettings}', worldSettings || '特に指定なし')
      .replace('{characters}', characters)
      .replace('{storyContext}', context.storyContext || '');
  }

  /**
   * プロット指示を挿入する
   * @private
   * @param {string} prompt プロンプト文字列
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {string} 処理後のプロンプト
   */
  private insertPlotDirective(prompt: string, context: GenerationContext): string {
    if (!(context as any).plotDirective) {
      return prompt;
    }

    const contextInsertPoint = prompt.indexOf("## 物語の文脈");
    if (contextInsertPoint !== -1) {
      // プロット指示を挿入
      return prompt.substring(0, contextInsertPoint) +
        (context as any).plotDirective +
        "\n\n" +
        prompt.substring(contextInsertPoint);
    }

    // 挿入ポイントが見つからない場合はそのまま返す
    return prompt;
  }

  /**
   * 物語状態のガイダンスを置換する
   * @private
   * @param {string} prompt プロンプト文字列
   * @param {GenerationContext} context 生成コンテキスト
   * @param {string} genre ジャンル
   * @returns {string} 置換後のプロンプト
   */
  private replaceNarrativeStateGuidance(prompt: string, context: GenerationContext, genre: string): string {
    if ((context as any).narrativeState) {
      const narrativeState = (context as any).narrativeState;
      const state = narrativeState.state || 'DEFAULT';
      const stateGuidance = this.templateManager.getNarrativeStateGuidance(state, genre);

      // フォーマッターを使用して物語状態のガイダンスを整形
      const guidance = this.formatter.formatNarrativeStateGuidance(
        narrativeState,
        genre,
        stateGuidance ? [stateGuidance] : []
      );

      return prompt.replace('{narrativeStateGuidance}', guidance);
    } else {
      return prompt.replace('{narrativeStateGuidance}', '物語を自然に進行させてください');
    }
  }

  /**
   * 重要イベント情報セクションを追加する
   * @private
   * @param {string} prompt プロンプト文字列
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {string} 追加後のプロンプト
   */
  private addSignificantEventsSection(prompt: string, context: GenerationContext): string {
    if (!(context as any).significantEvents) {
      return prompt;
    }

    const significantEvents = (context as any).significantEvents;

    // イベントデータの存在確認
    const hasLocationHistory = significantEvents.locationHistory && significantEvents.locationHistory.length > 0;
    const hasCharacterInteractions = significantEvents.characterInteractions && significantEvents.characterInteractions.length > 0;
    const hasWarningsPromises = significantEvents.warningsAndPromises && significantEvents.warningsAndPromises.length > 0;

    // 少なくとも1種類のイベントデータがある場合のみセクションを追加
    if (hasLocationHistory || hasCharacterInteractions || hasWarningsPromises) {
      let eventContextSection = `
      ## 保持すべき重要な事前イベント
      ${this.formatter.formatEventSubsection(significantEvents.locationHistory, '現在の場所で起きた重要な出来事')}
      ${this.formatter.formatEventSubsection(significantEvents.characterInteractions, '登場キャラクター間の重要な対話・対立歴')}
      ${this.formatter.formatEventSubsection(significantEvents.warningsAndPromises, '守るべき約束・警告・ルール')}

      ### 重要指示
      - 上記の重要イベントとの整合性を必ず維持してください
      - 特に警告や約束に関するイベントは、キャラクターが記憶しているはずです
      - 同じ場所で類似イベントが起きる場合は、必ず過去の出来事を参照し言及してください
      - 重要な警告や約束が破られる場合は、キャラクターがその結果を認識するよう描写してください
      - 過去に同様のイベントが起きた場合、キャラクターはそれを覚えており、会話の中で言及したり、内心で比較したりしてください
      - 過去のイベントから学んだ教訓がある場合、キャラクターの行動や決断に反映させてください
      `;

      prompt += eventContextSection;
      logger.debug('Added significant events section to prompt');
    }

    return prompt;
  }

  /**
   * 連続性ガイダンスセクションを追加する
   * @private
   * @param {string} prompt プロンプト文字列
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {string} 追加後のプロンプト
   */
  private addContinuityGuidanceSection(prompt: string, context: GenerationContext): string {
    if (!(context as any).continuityGuidance) {
      return prompt;
    }

    const guidance = (context as any).continuityGuidance;
    let continuitySection = "\n## 章間の連続性ガイダンス\n";

    // 章の始め方
    if (guidance.suggestedStartingPoint) {
      continuitySection += `### 章の始め方\n${guidance.suggestedStartingPoint}\n\n`;
    }

    // 必須要素
    if (guidance.mustAddressElements && guidance.mustAddressElements.length > 0) {
      continuitySection += "### 必ず対応すべき要素（優先度高）\n以下の要素には必ず触れてください：\n";
      guidance.mustAddressElements.forEach((element: string) => {
        continuitySection += `- ${element}\n`;
      });
      continuitySection += "\n";
    }

    // 推奨要素
    if (guidance.suggestedElements && guidance.suggestedElements.length > 0) {
      continuitySection += "### 対応が望ましい要素（優先度中）\n可能であれば、以下の要素にも触れてください：\n";
      guidance.suggestedElements.forEach((element: string) => {
        continuitySection += `- ${element}\n`;
      });
      continuitySection += "\n";
    }

    // あおり対策
    if (guidance.avoidGenericTeasers) {
      continuitySection += "### 章の終わり方（重要）\n";
      continuitySection += "- 「物語ははじまったばかり」「冒険はまだ終わらない」「新たな敵、新たな謎」などの一般的なあおり文は避けてください\n";
      continuitySection += "- 章の終わりは、具体的な次の展開を示唆するか、現在の問題に適切な区切りをつけてください\n";
      continuitySection += "- 多数の謎や敵を一度に示唆するのではなく、1-2の具体的な要素に絞ってください\n\n";
    }

    // 結末タイプ別ガイダンス
    if (guidance.endingType === "cliffhanger") {
      continuitySection += "### クリフハンガー対応\n";
      continuitySection += "前章はクリフハンガー（未解決の緊張状態）で終わっています。この章ではその状況から始めて、何らかの解決や展開を提供してください。\n\n";
    }

    // プロンプトに連続性セクションを追加
    prompt += continuitySection;
    logger.debug('Added chapter continuity guidance to prompt');

    return prompt;
  }

  /**
   * コンテキストからジャンル情報を取得するヘルパーメソッド
   * @private
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {string} 特定されたジャンル（小文字）
   */
  private getGenreFromContext(context: GenerationContext): string {
    // 1. WorldKnowledge からジャンルを取得（最優先）
    if (this.worldKnowledge) {
      try {
        const worldGenre = this.worldKnowledge.getGenre();
        if (worldGenre) {
          return worldGenre.toLowerCase();
        }
      } catch (error) {
        logger.warn('WorldKnowledge からのジャンル取得に失敗', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // 2. context.genre が直接指定されている場合
    if (context.genre) {
      return typeof context.genre === 'string'
        ? context.genre.toLowerCase()
        : 'classic';
    }

    // 3. narrativeStateからジャンルを取得
    const narrativeState = (context as any).narrativeState;
    if (narrativeState && narrativeState.genre) {
      return typeof narrativeState.genre === 'string'
        ? narrativeState.genre.toLowerCase()
        : 'classic';
    }

    // 4. 世界設定とテーマからジャンルを推定
    const worldSettings = context.worldSettings
      ? (typeof context.worldSettings === 'string' ? context.worldSettings : '')
      : '';
    const theme = context.theme || '';
    return this.determineGenre(worldSettings + ' ' + theme);
  }

  /**
   * 物語のジャンルを推定する
   * @private
   * @param {string} theme テーマやキーワードを含む文字列
   * @returns {string} 特定されたジャンル
   */
  private determineGenre(theme: string): string {
    // 各キーワードに対応するジャンル
    const genreKeywords: Record<string, string[]> = {
      fantasy: ['魔法', 'ファンタジー', '冒険', '魔術', '竜', '異世界'],
      mystery: ['謎', '探偵', '事件', '推理', '犯罪'],
      romance: ['恋愛', 'ロマンス', '愛', '恋'],
      thriller: ['サスペンス', 'スリラー', '緊張', '危険'],
      scifi: ['SF', '宇宙', '未来', 'テクノロジー', 'AI'],
      business: ['ビジネス', '起業', 'スタートアップ', '会社', '企業',
        'マーケティング', '経営', '戦略', '顧客', '投資', 'ピッチ',
        '製品開発', '市場', '資金調達', 'チーム', 'プロダクト']
    };

    // テーマ文字列からジャンルを検出
    for (const [genre, keywords] of Object.entries(genreKeywords)) {
      for (const keyword of keywords) {
        if (theme.includes(keyword)) {
          return genre;
        }
      }
    }

    return 'classic'; // デフォルトジャンル
  }

  /**
   * 章タイプを識別する
   * @private
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {string} 識別された章タイプ
   */
  private identifyChapterType(context: GenerationContext): string {
    // コンテキストに明示的な章タイプがある場合はそれを使用
    if ((context as any).chapterType) {
      return (context as any).chapterType;
    }

    // デフォルトタイプ
    let chapterType = 'STANDARD';

    // ジャンルを判定
    const genre = this.getGenreFromContext(context);
    logger.debug(`Determined genre for chapter type: ${genre}`);

    // ビジネスジャンルの場合は特化した章タイプを返す
    if (genre === 'business') {
      // 章番号に基づく初期章タイプ
      if (context.chapterNumber && context.chapterNumber <= 1) {
        return 'BUSINESS_INTRODUCTION';
      }

      // 物語状態に基づく章タイプ
      const narrativeState = (context as any).narrativeState;
      if (narrativeState && narrativeState.state) {
        const state = narrativeState.state;
        // ビジネス特化状態であれば対応する章タイプを返す
        const businessStates = [
          'BUSINESS_MEETING', 'PRODUCT_DEVELOPMENT', 'PITCH_PRESENTATION',
          'MARKET_RESEARCH', 'TEAM_BUILDING', 'FUNDING_ROUND',
          'BUSINESS_PIVOT', 'CUSTOMER_DISCOVERY', 'PRODUCT_LAUNCH',
          'MARKET_COMPETITION', 'STRATEGIC_PREPARATION', 'PERFORMANCE_REVIEW',
          'BUSINESS_DEVELOPMENT', 'SKILL_DEVELOPMENT', 'FINANCIAL_CHALLENGE',
          'EXPANSION_PHASE', 'ACQUISITION_NEGOTIATION', 'CULTURE_BUILDING',
          'CRISIS_MANAGEMENT', 'MARKET_ENTRY', 'REGULATORY_COMPLIANCE',
          'PARTNERSHIP_DEVELOPMENT', 'MARKET_SCALING'
        ];

        if (businessStates.includes(state)) {
          return state;
        }
      }

      // デフォルトとしてビジネス課題章
      return 'BUSINESS_CHALLENGE';
    }

    // 既存の非ビジネスジャンル用コード
    const narrativeState = (context as any).narrativeState;
    if (narrativeState) {
      const state = narrativeState.state;
      switch (state) {
        case 'BATTLE':
          chapterType = 'ACTION';
          break;
        case 'REVELATION':
          chapterType = 'REVELATION';
          break;
        case 'INTRODUCTION':
          if (context.chapterNumber && context.chapterNumber <= 1) {
            chapterType = 'OPENING';
          } else {
            chapterType = 'NEW_ARC';
          }
          break;
        case 'RESOLUTION':
          if (narrativeState.arcCompleted ||
            ((context as any).totalChapters && context.chapterNumber &&
              context.chapterNumber >= (context as any).totalChapters - 1)) {
            chapterType = 'CLOSING';
          } else {
            chapterType = 'ARC_RESOLUTION';
          }
          break;
        default:
          if (typeof state === 'string') {
            chapterType = state;
          }
      }
    }

    // テンション値に基づいて調整
    if ((context as any).tension) {
      const tension = (context as any).tension;
      if (tension >= 0.8 && chapterType === 'STANDARD') {
        chapterType = 'ACTION';
      } else if (tension <= 0.3 && chapterType === 'STANDARD') {
        chapterType = 'INTROSPECTION';
      }
    }

    // アーク位置に基づくオーバーライド
    if ((context as any).midTermMemory && (context as any).midTermMemory.currentArc) {
      const arc = (context as any).midTermMemory.currentArc;
      if (arc.chapter_range && context.chapterNumber) {
        if (arc.chapter_range.start === context.chapterNumber) {
          chapterType = 'NEW_ARC';
        } else if (arc.chapter_range.end === context.chapterNumber && arc.chapter_range.end !== -1) {
          chapterType = 'ARC_RESOLUTION';
        }
      }
    }

    return chapterType;
  }
}