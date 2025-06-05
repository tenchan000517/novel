// src/lib/generation/prompt-generator.ts (最適化完成版 - ジャンル取得最適化)

/**
 * @fileoverview 統合記憶階層システム対応プロンプト生成クラス（最適化完成版）
 */

import { GenerationContext } from '@/types/generation';
import { logger } from '@/lib/utils/logger';

// 新しい記憶階層システムのインポート
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { MemoryLevel } from '@/lib/memory/core/types';

// プロンプト生成ヘルパー
import { TemplateManager } from './prompt/template-manager';
import { PromptFormatter } from './prompt/prompt-formatter';
import { SectionBuilder } from './prompt/section-builder';

// 他の依存関係
import { WorldSettingsManager } from '@/lib/plot/world-settings-manager';
import { PlotManager } from '@/lib/plot/manager';
import { LearningJourneySystem, LearningStage } from '@/lib/learning-journey';
import { CharacterManager } from '@/lib/characters/manager';

/**
 * 統合記憶システム対応メモリサービス
 */
class UnifiedMemoryService {
  constructor(private memoryManager: MemoryManager) { }

  /**
   * 前章の終わり情報を取得
   */
  async getPreviousChapterEnding(chapterNumber: number): Promise<string> {
    try {
      if (chapterNumber <= 1) {
        return '物語の始まりです。';
      }

      const searchResult = await this.memoryManager.unifiedSearch(
        `第${chapterNumber - 1}章`,
        [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
      );

      if (searchResult.success && searchResult.results.length > 0) {
        const chapterData = this.extractChapterEndingFromSearchResults(searchResult.results);
        return chapterData || `前章（第${chapterNumber - 1}章）からの自然な続きとして物語を展開してください。`;
      }

      return `前章の情報にアクセスできませんでした。第${chapterNumber}章を新しい展開として自由に書き始めてください。`;

    } catch (error) {
      logger.warn('Failed to get previous chapter ending from unified memory', {
        chapterNumber,
        error: error instanceof Error ? error.message : String(error)
      });
      return `前章の情報取得に失敗しました。第${chapterNumber}章を自然に展開してください。`;
    }
  }

  /**
   * シーン連続性情報を取得
   */
  async getSceneContinuityInfo(chapterNumber: number): Promise<{
    previousScene: string;
    characterPositions: string;
    timeElapsed: string;
    location: string;
    endingGuidance: string;
  }> {
    try {
      const searchResult = await this.memoryManager.unifiedSearch(
        `第${Math.max(1, chapterNumber - 1)}章 シーン 場面`,
        [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
      );

      if (searchResult.success && searchResult.results.length > 0) {
        return this.extractContinuityInfoFromSearchResults(searchResult.results, chapterNumber);
      }

      return {
        previousScene: chapterNumber <= 1 ? '物語の始まり' : '前章の最終場面からの自然な続き',
        characterPositions: chapterNumber <= 1 ? '登場キャラクターの初期配置' : '前章での最終位置からの自然な継続',
        timeElapsed: chapterNumber <= 1 ? '物語開始時点' : '前章からの自然な時間経過',
        location: chapterNumber <= 1 ? '物語の開始場所' : '前章と同じ場所、または自然な移動先',
        endingGuidance: '次章への興味を引く展開で終わらせる'
      };

    } catch (error) {
      logger.warn('Failed to get scene continuity info from unified memory', {
        chapterNumber,
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        previousScene: '前章の情報にアクセスできません',
        characterPositions: '登場キャラクターの位置は前章からの自然な継続',
        timeElapsed: '前章からの適切な時間経過',
        location: '前章からの自然な場所の継続または移動',
        endingGuidance: '次章への興味を引く展開で終わらせる'
      };
    }
  }

  /**
   * 統合検索結果から章の終わり情報を抽出
   */
  private extractChapterEndingFromSearchResults(results: any[]): string | null {
    try {
      for (const result of results) {
        if (result.source === MemoryLevel.SHORT_TERM && result.data) {
          if (result.data.content) {
            const content = result.data.content;
            const endingPart = content.slice(-500);
            return `前章の終わり：\n${endingPart}\n\n前章からの直接の続きとして、自然に物語を継続してください。`;
          }

          if (result.data.chapter && result.data.chapter.content) {
            const content = result.data.chapter.content;
            const endingPart = content.slice(-500);
            return `前章の終わり：\n${endingPart}\n\n前章からの直接の続きとして、自然に物語を継続してください。`;
          }
        }
      }

      return null;
    } catch (error) {
      logger.warn('Failed to extract chapter ending from search results', { error });
      return null;
    }
  }

  /**
   * 統合検索結果から連続性情報を抽出
   */
  private extractContinuityInfoFromSearchResults(
    results: any[],
    chapterNumber: number
  ): {
    previousScene: string;
    characterPositions: string;
    timeElapsed: string;
    location: string;
    endingGuidance: string;
  } {
    try {
      let previousScene = '前章の最終場面';
      let characterPositions = '登場キャラクターは前章での位置から継続';
      let timeElapsed = '前章からの自然な時間経過';
      let location = '前章と同じ場所、または自然な移動先';

      for (const result of results) {
        if (result.source === MemoryLevel.SHORT_TERM && result.data) {
          if (result.data.content || (result.data.chapter && result.data.chapter.content)) {
            const content = result.data.content || result.data.chapter.content;
            const lastParagraphs = content.split('\n').slice(-3).join('\n');
            previousScene = `前章の最終場面：${lastParagraphs.slice(0, 200)}...`;
          }

          if (result.data.characters || result.data.characterStates) {
            const characters = result.data.characters || result.data.characterStates;
            if (Array.isArray(characters)) {
              const characterList = characters.map((char: any) =>
                `${char.name || char.id}: ${char.location || char.currentLocation || '不明'}`
              );
              if (characterList.length > 0) {
                characterPositions = `キャラクター位置：${characterList.join(', ')}`;
              }
            }
          }
        }

        if (result.source === MemoryLevel.MID_TERM && result.data) {
          if (result.data.timeElapsed) {
            timeElapsed = result.data.timeElapsed;
          }
          if (result.data.location) {
            location = result.data.location;
          }
        }
      }

      return {
        previousScene,
        characterPositions,
        timeElapsed,
        location,
        endingGuidance: '次章への興味を引く展開で終わらせる'
      };

    } catch (error) {
      logger.warn('Failed to extract continuity info from search results', { error });
      return {
        previousScene: '前章の最終場面からの自然な続き',
        characterPositions: '登場キャラクターは前章での位置から継続',
        timeElapsed: '前章からの自然な時間経過',
        location: '前章と同じ場所、または自然な移動先',
        endingGuidance: '次章への興味を引く展開で終わらせる'
      };
    }
  }
}

/**
 * 統合記憶階層システム対応プロンプト生成クラス（最適化完成版）
 */
export class PromptGenerator {
  private templateManager: TemplateManager;
  private formatter: PromptFormatter;
  private sectionBuilder: SectionBuilder;
  private unifiedMemoryService: UnifiedMemoryService;

  // 統合記憶システム
  private memoryManager?: MemoryManager;

  // 🔧 最適化された依存関係
  private worldSettingsManager?: WorldSettingsManager;
  private plotManager?: PlotManager;
  private learningJourneySystem?: LearningJourneySystem;
  private characterManager?: CharacterManager; // 🔥 追加

  /**
   * コンストラクタ（最適化版）
   */
  constructor(
    memoryManager: MemoryManager,
    worldSettingsManager?: WorldSettingsManager,
    plotManager?: PlotManager,
    learningJourneySystem?: LearningJourneySystem,
    characterManager?: CharacterManager  // 🔥 追加
  ) {
    this.memoryManager = memoryManager;
    this.worldSettingsManager = worldSettingsManager;
    this.plotManager = plotManager;
    this.learningJourneySystem = learningJourneySystem;
    this.characterManager = characterManager;  // 🔥 追加

    // 統合メモリサービスの初期化
    this.unifiedMemoryService = new UnifiedMemoryService(this.memoryManager);

    // 各ヘルパークラスの初期化
    this.templateManager = new TemplateManager();
    this.formatter = new PromptFormatter();
    this.sectionBuilder = new SectionBuilder(
      this.formatter,
      this.templateManager,
      this.learningJourneySystem
    );

    // テンプレートの同期読み込み
    this.loadTemplatesSync();

    logger.info('PromptGenerator ready for immediate use with optimized dependencies', {
      hasWorldSettingsManager: !!this.worldSettingsManager,
      hasPlotManager: !!this.plotManager,
      hasLearningJourneySystem: !!this.learningJourneySystem,
      hasCharacterManager: !!this.characterManager  // 🔥 追加
    });
  }

  /**
   * テンプレートの同期読み込み
   */
  private loadTemplatesSync(): void {
    try {
      if (typeof this.templateManager.loadSync === 'function') {
        this.templateManager.loadSync();
      } else {
        this.templateManager.load().catch(error => {
          logger.warn('Template loading failed, using fallback templates', { error });
          this.setFallbackTemplatesSync();
        });
      }
    } catch (error) {
      logger.warn('Failed to load templates synchronously, using fallback', { error });
      this.setFallbackTemplatesSync();
    }
  }

  /**
   * フォールバックテンプレートの同期設定
   */
  private setFallbackTemplatesSync(): void {
    try {
      if (typeof this.templateManager.setFallbackTemplates === 'function') {
        this.templateManager.setFallbackTemplates();
      }
    } catch (error) {
      logger.warn('Failed to set fallback templates', { error });
    }
  }

  /**
   * 統合記憶システム対応プロンプト生成（メインエントリーポイント・最適化版）
   */
  async generate(context: GenerationContext): Promise<string> {
    logger.debug('Generating optimized prompt with enhanced dependency resolution');

    try {
      // STEP 1: 学習旅程によるコンテキスト拡張
      const enrichedContext = await this.enrichContextWithLearningJourney(context);

      // 🔧 STEP 2: 最適化されたジャンル取得
      const genre = await this.getGenre(context);

      const chapterType = await this.identifyChapterTypeWithMemory(context);

      // STEP 3: 統合記憶システムから連続性情報を取得
      const { previousChapterEnding, continuityInfo } = await this.getEnhancedContinuityInfoFromMemory(
        context.chapterNumber || 1
      );
      const { purpose, plotPoints } = await this.getChapterPurposeFromMemory(context);

      // STEP 4: 基本テンプレートの取得と基本置換
      let prompt = this.getBaseTemplateWithFallback();
      prompt = this.replaceBasicPlaceholders(prompt, context, genre, {
        purpose,
        plotPoints,
        previousChapterEnding,
        ...continuityInfo
      });

      // STEP 5: 統合記憶システムからのコンテンツ置換
      prompt = await this.replaceContentPlaceholdersFromMemory(prompt, context);

      // STEP 6: テンション・ペーシング情報の追加
      prompt = this.addTensionAndPacingDescriptions(prompt, context);

      // STEP 7: 統合記憶システム対応セクション構築
      const sections = await this.buildSectionsWithUnifiedMemory(context, genre);
      prompt += sections.join('\n');

      // STEP 8: 残りの統合処理
      prompt = await this.addRemainingIntegrationsWithMemory(prompt, context, genre, chapterType);

      // STEP 9: 学習旅程プロンプト統合
      prompt = this.integratePrompts(prompt, enrichedContext);

      // STEP 10: 出力形式指示の確実な追加
      prompt = this.ensureOutputFormatInstructions(prompt, context);

      // STEP 11: 最終品質チェック
      const validation = this.validatePromptCompleteness(prompt, context);
      if (!validation.isComplete) {
        logger.warn('Generated prompt is incomplete', {
          missing: validation.missingElements,
          suggestions: validation.suggestions
        });
      } else {
        logger.info('Generated prompt passed completeness validation (optimized)');
      }

      return prompt;

    } catch (error) {
      logger.error('Error generating optimized prompt', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      return this.generateFallbackPrompt(context);
    }
  }

  /**
   * 🔧 NEW: 最適化されたジャンル取得
   */
  private async getGenre(context: GenerationContext): Promise<string> {
    try {
      // 🔧 PRIORITY 1: PlotManager経由（WorldSettingsManager優先アクセス）
      if (this.plotManager) {
        try {
          const genre = await this.plotManager.getGenre();
          if (genre && genre !== 'classic') {
            logger.debug(`Genre obtained from optimized PlotManager: ${genre}`);
            return genre;
          }
        } catch (plotError) {
          logger.debug('PlotManager genre access failed, trying alternatives', {
            error: plotError instanceof Error ? plotError.message : String(plotError)
          });
        }
      }

      // 🔧 PRIORITY 2: 直接WorldSettingsManager（フォールバック）
      if (this.worldSettingsManager) {
        try {
          const genre = await this.worldSettingsManager.getGenre();
          if (genre && genre !== 'classic') {
            logger.debug(`Genre obtained from direct WorldSettingsManager: ${genre}`);
            return genre;
          }
        } catch (wsError) {
          logger.debug('Direct WorldSettingsManager access failed', {
            error: wsError instanceof Error ? wsError.message : String(wsError)
          });
        }
      }

      // 🔧 PRIORITY 3: 記憶システム（最終フォールバック）
      if (this.memoryManager) {
        try {
          const genre = await this.getGenreFromUnifiedMemory(context);
          if (genre && genre !== 'classic') {
            logger.debug(`Genre obtained from memory system: ${genre}`);
            return genre;
          }
        } catch (memoryError) {
          logger.debug('Memory system genre access failed', {
            error: memoryError instanceof Error ? memoryError.message : String(memoryError)
          });
        }
      }

      // 🔧 PRIORITY 4: コンテキストからの推定
      return this.getGenreFromContext(context);

    } catch (error) {
      logger.warn('All genre sources failed in optimized access', { error });
      return this.getGenreFromContext(context);
    }
  }

  /**
   * 🔧 従来の記憶システムからのジャンル取得（フォールバック用）
   */
  private async getGenreFromUnifiedMemory(context: GenerationContext): Promise<string> {
    try {
      if (!this.memoryManager) {
        return this.getGenreFromContext(context);
      }

      const worldSearchResult = await this.memoryManager.unifiedSearch('世界設定 ジャンル', [MemoryLevel.LONG_TERM]);

      if (worldSearchResult.success && worldSearchResult.results.length > 0) {
        for (const result of worldSearchResult.results) {
          if (result.data?.genre) {
            return result.data.genre.toLowerCase();
          }
          if (result.data?.worldSettings?.genre) {
            return result.data.worldSettings.genre.toLowerCase();
          }
        }
      }

      const searchResult = await this.memoryManager.unifiedSearch('ジャンル genre', [MemoryLevel.LONG_TERM]);

      if (searchResult.success && searchResult.results.length > 0) {
        for (const result of searchResult.results) {
          if (result.data?.genre) {
            return result.data.genre.toLowerCase();
          }
        }
      }

      return this.getGenreFromContext(context);

    } catch (error) {
      logger.warn('Failed to get genre from unified memory', { error });
      return this.getGenreFromContext(context);
    }
  }

  /**
   * 統合記憶システムから強化された連続性情報を取得
   */
  private async getEnhancedContinuityInfoFromMemory(chapterNumber: number): Promise<{
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
      if (!this.memoryManager) {
        return this.getFallbackContinuityInfo(chapterNumber);
      }

      const [previousChapterEnding, continuityInfo] = await Promise.all([
        this.unifiedMemoryService.getPreviousChapterEnding(chapterNumber),
        this.unifiedMemoryService.getSceneContinuityInfo(chapterNumber)
      ]);

      return {
        previousChapterEnding,
        continuityInfo
      };

    } catch (error) {
      logger.warn('Failed to get enhanced continuity info from unified memory', { error, chapterNumber });
      return this.getFallbackContinuityInfo(chapterNumber);
    }
  }

  /**
   * フォールバック用連続性情報
   */
  private getFallbackContinuityInfo(chapterNumber: number): {
    previousChapterEnding: string,
    continuityInfo: {
      previousScene: string,
      characterPositions: string,
      timeElapsed: string,
      location: string,
      endingGuidance: string
    }
  } {
    return {
      previousChapterEnding: chapterNumber <= 1
        ? '物語の始まりです。'
        : '前章の情報にアクセスできません。新しい章を自由に展開してください。',
      continuityInfo: {
        previousScene: '特になし',
        characterPositions: '特になし',
        timeElapsed: '前章からの自然な時間経過',
        location: '前章と同じ場所、または自然な移動先',
        endingGuidance: '次章への興味を引く展開で終わらせる'
      }
    };
  }

  /**
   * 統合記憶システムから章の目的とプロット要素を取得
   */
  private async getChapterPurposeFromMemory(context: GenerationContext): Promise<{
    purpose: string;
    plotPoints: string;
  }> {
    try {
      if (!this.memoryManager) {
        return this.sectionBuilder.getChapterPurposeAndPlotPoints(context);
      }

      const searchResult = await this.memoryManager.unifiedSearch(
        '物語進行 プロット 目的',
        [MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
      );

      if (searchResult.success && searchResult.results.length > 0) {
        for (const result of searchResult.results) {
          if (result.source === MemoryLevel.MID_TERM && result.data) {
            return {
              purpose: `物語進行に基づく第${context.chapterNumber || 1}章の展開`,
              plotPoints: '統合記憶システムから取得したプロット要素'
            };
          }
        }
      }

      return this.sectionBuilder.getChapterPurposeAndPlotPoints(context);

    } catch (error) {
      logger.warn('Failed to get chapter purpose from unified memory', { error });
      return this.sectionBuilder.getChapterPurposeAndPlotPoints(context);
    }
  }

  /**
   * 統合記憶システムを活用した章タイプ識別
   */
  private async identifyChapterTypeWithMemory(context: GenerationContext): Promise<string> {
    try {
      if (!this.memoryManager) {
        return this.identifyChapterType(context);
      }

      const searchResult = await this.memoryManager.unifiedSearch(
        '物語状態 章タイプ',
        [MemoryLevel.MID_TERM]
      );

      if (searchResult.success && searchResult.results.length > 0) {
        for (const result of searchResult.results) {
          if (result.source === MemoryLevel.MID_TERM && result.data) {
            if (result.data.narrativeProgression) {
              return this.identifyChapterTypeFromProgression(result.data.narrativeProgression, context);
            }
            if (result.data.state || result.data.chapterType) {
              return result.data.chapterType || result.data.state || 'STANDARD';
            }
          }
        }
      }

      return this.identifyChapterType(context);

    } catch (error) {
      logger.warn('Failed to identify chapter type with memory', { error });
      return this.identifyChapterType(context);
    }
  }

  /**
   * 物語進行情報から章タイプを推定
   */
  private identifyChapterTypeFromProgression(progression: any, context: GenerationContext): string {
    const chapterNumber = context.chapterNumber || 1;

    if (chapterNumber === 1) {
      return 'OPENING';
    }

    return 'STANDARD';
  }

  /**
   * 統合記憶システムからコンテンツプレースホルダーを置換
   */
  private async replaceContentPlaceholdersFromMemory(
    prompt: string,
    context: GenerationContext
  ): Promise<string> {
    try {
      if (!this.memoryManager) {
        return this.replaceContentPlaceholders(prompt, context);
      }

      // 統合世界設定の取得
      let worldSettings = '';
      try {
        const worldSearchResult = await this.memoryManager.unifiedSearch('世界設定', [MemoryLevel.LONG_TERM]);
        if (worldSearchResult.success && worldSearchResult.results.length > 0) {
          for (const result of worldSearchResult.results) {
            if (result.data?.worldSettings) {
              worldSettings = this.formatter.formatWorldSettings(result.data.worldSettings);
              break;
            } else if (result.data && typeof result.data === 'object') {
              worldSettings = this.formatter.formatWorldSettings(result.data);
              break;
            }
          }
        }
      } catch (error) {
        logger.warn('Failed to get world settings from unified search', { error });
      }

      if (!worldSettings && this.plotManager) {
        try {
          const formattedWorldAndTheme = await this.plotManager.getFormattedWorldAndTheme();
          if (formattedWorldAndTheme.worldSettings) {
            worldSettings = formattedWorldAndTheme.worldSettings;
          }
        } catch (error) {
          logger.warn('Failed to get world settings from plot manager', { error });
        }
      }

      if (!worldSettings && context.worldSettings) {
        worldSettings = this.formatter.formatWorldSettings(context.worldSettings);
      }

      // 統合キャラクター情報の取得
      let characters = '';
      try {
        const characterSearchResult = await this.memoryManager.unifiedSearch(
          'キャラクター 登場人物',
          [MemoryLevel.SHORT_TERM, MemoryLevel.LONG_TERM]
        );

        if (characterSearchResult.success && characterSearchResult.results.length > 0) {
          characters = await this.extractCharactersFromSearchResults(characterSearchResult.results, context);
        }
      } catch (error) {
        logger.warn('Failed to get characters from unified search', { error });
      }

      if (!characters) {
        characters = await this.formatter.formatCharacters(context.characters || []);
      }

      return prompt
        .replace('{worldSettings}', worldSettings || '特に指定なし')
        .replace('{characters}', characters)
        .replace('{storyContext}', context.storyContext || '');

    } catch (error) {
      logger.error('Failed to replace content placeholders from memory', { error });
      return this.replaceContentPlaceholders(prompt, context);
    }
  }

  /**
   * 統合検索結果からキャラクター情報を抽出
   */
  private async extractCharactersFromSearchResults(
    results: any[],
    generationContext: GenerationContext
  ): Promise<string> {
    try {
      const characterInfoList: string[] = [];

      for (const result of results) {
        if (result.source === MemoryLevel.SHORT_TERM && result.data) {
          if (result.data.characters) {
            const chars = Array.isArray(result.data.characters) ? result.data.characters : [result.data.characters];
            chars.forEach((char: any) => {
              const characterInfo = `${char.name || char.id}: ${char.currentLocation || char.location || '不明な場所'}にいる`;
              characterInfoList.push(characterInfo);
            });
          }

          if (result.data.characterStates) {
            const states = result.data.characterStates;
            if (typeof states === 'object') {
              Object.entries(states).forEach(([characterId, state]: [string, any]) => {
                const characterInfo = `${characterId}: ${state.currentLocation || '不明な場所'}にいる`;
                characterInfoList.push(characterInfo);
              });
            }
          }
        }

        if (result.source === MemoryLevel.LONG_TERM && result.data) {
          if (result.data.character || result.data.characters) {
            const chars = result.data.characters || [result.data.character];
            if (Array.isArray(chars)) {
              chars.forEach((char: any) => {
                const characterInfo = `${char.name}: ${char.description || ''}`;
                characterInfoList.push(characterInfo);
              });
            }
          }
        }
      }

      if (generationContext.characters && generationContext.characters.length > 0) {
        const formattedChars = await this.formatter.formatCharacters(generationContext.characters);
        if (formattedChars) {
          characterInfoList.push(formattedChars);
        }
      }

      return characterInfoList.join('\n');

    } catch (error) {
      logger.warn('Failed to extract characters from search results', { error });
      return await this.formatter.formatCharacters(generationContext.characters || []);
    }
  }

  /**
   * 統合記憶システム対応セクション構築
   */
  private async buildSectionsWithUnifiedMemory(
    context: GenerationContext,
    genre: string
  ): Promise<string[]> {
    const sectionBuilders = [
      {
        name: 'characterPsychology',
        fn: () => this.sectionBuilder.buildCharacterPsychologySection(context)
      },
      {
        name: 'characterGrowth',
        fn: () => this.sectionBuilder.buildCharacterGrowthSection(context, genre)
      },
      {
        name: 'emotionalArc',
        fn: () => this.sectionBuilder.buildEmotionalArcSection(context, genre)
      },
      {
        name: 'styleGuidance',
        fn: () => this.sectionBuilder.buildStyleGuidanceSection(context, genre)
      },
      {
        name: 'expressionAlternatives',
        fn: () => this.sectionBuilder.buildExpressionAlternativesSection(context, genre)
      },
      {
        name: 'readerExperience',
        fn: () => this.sectionBuilder.buildReaderExperienceSection(context, genre)
      },
      {
        name: 'literaryInspiration',
        fn: () => this.sectionBuilder.buildLiteraryInspirationSection(context, genre)
      },
      {
        name: 'themeEnhancement',
        fn: () => this.sectionBuilder.buildThemeEnhancementSection(context, genre)
      },
      {
        name: 'tensionGuidance',
        fn: () => this.sectionBuilder.buildTensionGuidanceSection(context, genre)
      },
      {
        name: 'businessSpecific',
        fn: () => this.sectionBuilder.buildBusinessSpecificSection(genre)
      },
      {
        name: 'learningJourney',
        fn: () => this.sectionBuilder.buildLearningJourneySection(context, genre)
      }
    ];

    const sections: string[] = [];

    for (const { name, fn } of sectionBuilders) {
      try {
        const section = fn();
        if (section && section.trim()) {
          sections.push(section);
          logger.debug(`Successfully built ${name} section with unified memory support`);
        }
      } catch (error) {
        logger.warn(`Failed to build ${name} section`, {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return sections;
  }

  /**
   * 統合記憶システム対応の残り統合処理
   */
  private async addRemainingIntegrationsWithMemory(
    prompt: string,
    context: GenerationContext,
    genre: string,
    chapterType: string
  ): Promise<string> {
    let result = prompt;

    // 重点キャラクターの決定（統合記憶システム対応）
    const focusCharacters = await this.determineFocusCharactersWithMemory(context);
    result = result.replace('{focusCharacters}', focusCharacters.join('、'));

    // 伏線情報の処理（統合記憶システム対応）
    result = await this.processForeshadowingWithMemory(result, context);

    // 矛盾情報の処理
    if (context.contradictions && Array.isArray(context.contradictions)) {
      result = result.replace('{contradictions}', this.formatter.formatContradictions(context.contradictions));
    } else {
      result = result.replace('{contradictions}', '特になし');
    }

    // プロット指示の挿入
    result = this.insertPlotDirective(result, context);

    // 物語状態ガイダンスの置換（統合記憶システム対応）
    result = await this.replaceNarrativeStateGuidanceWithMemory(result, context, genre);

    // 永続的イベント情報の追加
    if (context.persistentEvents) {
      result += this.formatter.formatPersistentEvents(context.persistentEvents);
    }

    // 重要イベント・連続性ガイダンスの追加
    result = this.addSignificantEventsSection(result, context);
    result = this.addContinuityGuidanceSection(result, context);

    // 章タイプ・ジャンル固有ガイダンスの追加
    const chapterTypeGuidance = this.templateManager.getChapterTypeInstructions(chapterType, genre);
    if (chapterTypeGuidance) {
      result += `\n${chapterTypeGuidance}`;
    }

    const genreGuidance = this.templateManager.getGenreGuidance(genre);
    if (genreGuidance) {
      result += `\n${genreGuidance}`;
    }

    // プロット要素の追加
    if (context.plotPoints && context.plotPoints.length > 0) {
      result += `\n【このチャプターで扱うべきプロット】\n`;
      result += context.plotPoints.map(point => `- ${point}`).join('\n');
    }

    // 表現制約の追加
    if (context.expressionConstraints && context.expressionConstraints.length > 0) {
      result += `\n【表現上の制約】\n`;
      result += context.expressionConstraints.map(constraint => `- ${constraint}`).join('\n');
    }

    return result;
  }

  /**
   * 統合記憶システムを活用した重点キャラクターの決定
   */
  private async determineFocusCharactersWithMemory(context: GenerationContext): Promise<string[]> {
    try {
      if (!this.memoryManager) {
        return this.sectionBuilder.determineFocusCharacters(context);
      }

      const searchResult = await this.memoryManager.unifiedSearch(
        'キャラクター 登場人物',
        [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
      );

      if (searchResult.success && searchResult.results.length > 0) {
        const activeCharacters: string[] = [];

        for (const result of searchResult.results) {
          if (result.source === MemoryLevel.SHORT_TERM && result.data) {
            if (result.data.characters) {
              const chars = Array.isArray(result.data.characters) ? result.data.characters : [result.data.characters];
              chars.forEach((char: any) => {
                if (char.name || char.id) {
                  activeCharacters.push(char.name || char.id);
                }
              });
            }

            if (result.data.characterStates) {
              const states = result.data.characterStates;
              if (typeof states === 'object') {
                Object.keys(states).forEach(characterId => {
                  activeCharacters.push(characterId);
                });
              }
            }
          }
        }

        if (activeCharacters.length > 0) {
          return [...new Set(activeCharacters)].slice(0, 3);
        }
      }

      return this.sectionBuilder.determineFocusCharacters(context);

    } catch (error) {
      logger.warn('Failed to determine focus characters with memory', { error });
      return this.sectionBuilder.determineFocusCharacters(context);
    }
  }

  /**
   * 統合記憶システム対応の伏線処理
   */
  private async processForeshadowingWithMemory(prompt: string, context: GenerationContext): Promise<string> {
    try {
      if (!this.memoryManager) {
        if (context.foreshadowing && Array.isArray(context.foreshadowing)) {
          return prompt.replace('{foreshadowing}', this.formatter.formatForeshadowing(context.foreshadowing));
        } else {
          return prompt.replace('{foreshadowing}', '特になし');
        }
      }

      const searchResult = await this.memoryManager.unifiedSearch('伏線 foreshadowing', [
        MemoryLevel.LONG_TERM
      ]);

      let foreshadowingText = '';

      if (searchResult.success && searchResult.results.length > 0) {
        const foreshadowingItems: string[] = [];

        for (const result of searchResult.results) {
          if (result.data?.foreshadowing || result.data?.description) {
            foreshadowingItems.push(result.data.description || result.data.foreshadowing);
          }
        }

        if (foreshadowingItems.length > 0) {
          foreshadowingText = foreshadowingItems.join('\n- ');
          foreshadowingText = `- ${foreshadowingText}`;
        }
      }

      if (context.foreshadowing && Array.isArray(context.foreshadowing)) {
        const contextForeshadowing = this.formatter.formatForeshadowing(context.foreshadowing);
        if (contextForeshadowing && foreshadowingText) {
          foreshadowingText += `\n${contextForeshadowing}`;
        } else if (contextForeshadowing) {
          foreshadowingText = contextForeshadowing;
        }
      }

      return prompt.replace('{foreshadowing}', foreshadowingText || '特になし');

    } catch (error) {
      logger.warn('Failed to process foreshadowing with memory', { error });
      if (context.foreshadowing && Array.isArray(context.foreshadowing)) {
        return prompt.replace('{foreshadowing}', this.formatter.formatForeshadowing(context.foreshadowing));
      } else {
        return prompt.replace('{foreshadowing}', '特になし');
      }
    }
  }

  /**
   * 統合記憶システム対応の物語状態ガイダンス置換
   */
  private async replaceNarrativeStateGuidanceWithMemory(
    prompt: string,
    context: GenerationContext,
    genre: string
  ): Promise<string> {
    try {
      if (!this.memoryManager) {
        return this.replaceNarrativeStateGuidance(prompt, context, genre);
      }

      const searchResult = await this.memoryManager.unifiedSearch(
        '物語状態 narrative',
        [MemoryLevel.MID_TERM]
      );

      if (searchResult.success && searchResult.results.length > 0) {
        for (const result of searchResult.results) {
          if (result.source === MemoryLevel.MID_TERM && result.data?.narrativeProgression) {
            const progression = result.data.narrativeProgression;
            const guidance = this.generateGuidanceFromProgression(progression, genre);
            return prompt.replace('{narrativeStateGuidance}', guidance);
          }
        }
      }

      return this.replaceNarrativeStateGuidance(prompt, context, genre);

    } catch (error) {
      logger.warn('Failed to replace narrative state guidance with memory', { error });
      return this.replaceNarrativeStateGuidance(prompt, context, genre);
    }
  }

  /**
   * 物語進行情報からガイダンスを生成
   */
  private generateGuidanceFromProgression(progression: any, genre: string): string {
    return '統合記憶システムから取得した物語進行に基づき、適切に物語を展開してください';
  }

  // ===================================================================
  // 既存メソッドの統合記憶システム対応（修正版）
  // ===================================================================

  /**
   * 学習旅程によるコンテキスト拡張
   */
  private async enrichContextWithLearningJourney(context: GenerationContext): Promise<GenerationContext> {
    if (!this.learningJourneySystem || !this.learningJourneySystem.isInitialized()) {
      return context;
    }

    try {
      const chapterNumber = context.chapterNumber || 1;
      logger.debug(`Enriching context with learning journey for chapter ${chapterNumber}`);

      if ((context as any).learningJourney) {
        logger.debug('Context already contains learning journey information');
        return context;
      }

      const enrichedContext = { ...context };

      const mainConcept = await this.getMainConcept(context);
      if (!mainConcept) {
        return context;
      }

      const learningStage = await this.learningJourneySystem.concept.determineLearningStage(
        mainConcept,
        chapterNumber
      );

      const embodimentPlan = await this.learningJourneySystem.concept.getEmbodimentPlan(
        mainConcept,
        chapterNumber
      );

      const emotionalArc = await this.learningJourneySystem.emotion.designEmotionalArc(
        mainConcept,
        learningStage,
        chapterNumber
      );

      const catharticExperience = await this.learningJourneySystem.emotion.designCatharticExperience(
        mainConcept,
        learningStage,
        chapterNumber
      );

      const sceneRecommendations = await this.learningJourneySystem.story.generateSceneRecommendations(
        mainConcept,
        learningStage,
        chapterNumber
      );

      const empatheticPoints = await this.learningJourneySystem.emotion.generateEmpatheticPoints(
        '',
        mainConcept,
        learningStage
      );

      (enrichedContext as any).learningJourney = {
        mainConcept,
        learningStage,
        embodimentPlan,
        emotionalArc,
        catharticExperience: catharticExperience || undefined,
        sceneRecommendations,
        empatheticPoints
      };

      logger.debug('Successfully enriched context with learning journey information');

      return enrichedContext;

    } catch (error) {
      logger.error('Error enriching context with learning journey', {
        error: error instanceof Error ? error.message : String(error)
      });
      return context;
    }
  }

  /**
   * メインコンセプトを取得（統合記憶システム対応）
   */
  private async getMainConcept(context: GenerationContext): Promise<string | null> {
    if ((context as any).mainConcept) {
      return (context as any).mainConcept;
    }

    if (this.plotManager) {
      try {
        const formattedWorldAndTheme = await this.plotManager.getFormattedWorldAndTheme();
        if (formattedWorldAndTheme.theme) {
          return 'ISSUE DRIVEN';
        }
      } catch (error) {
        logger.warn('Error fetching theme from plot manager', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    if (this.memoryManager) {
      try {
        const searchResult = await this.memoryManager.unifiedSearch('テーマ theme', [MemoryLevel.LONG_TERM]);
        if (searchResult.success && searchResult.results.length > 0) {
          return 'ISSUE DRIVEN';
        }
      } catch (error) {
        logger.warn('Error fetching theme from unified memory', { error });
      }
    }

    const genre = await this.getGenreFromUnifiedMemory(context);
    if (genre === 'business') {
      return 'ISSUE DRIVEN';
    }

    return null;
  }

  // ===================================================================
  // フォールバック・ユーティリティメソッド（既存互換）
  // ===================================================================

  private getGenreFromContext(context: GenerationContext): string {
    if (context.genre) {
      return typeof context.genre === 'string' ? context.genre.toLowerCase() : 'classic';
    }

    const narrativeState = (context as any).narrativeState;
    if (narrativeState && narrativeState.genre) {
      return typeof narrativeState.genre === 'string' ? narrativeState.genre.toLowerCase() : 'classic';
    }

    const worldSettings = context.worldSettings
      ? (typeof context.worldSettings === 'string' ? context.worldSettings : '')
      : '';
    const theme = context.theme || '';
    return this.determineGenre(worldSettings + ' ' + theme);
  }

  private determineGenre(theme: string): string {
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

    for (const [genre, keywords] of Object.entries(genreKeywords)) {
      for (const keyword of keywords) {
        if (theme.includes(keyword)) {
          return genre;
        }
      }
    }

    return 'classic';
  }

  private identifyChapterType(context: GenerationContext): string {
    if ((context as any).chapterType) {
      return (context as any).chapterType;
    }

    let chapterType = 'STANDARD';
    const genre = this.getGenreFromContext(context);

    if (genre === 'business') {
      if (context.chapterNumber && context.chapterNumber <= 1) {
        return 'BUSINESS_INTRODUCTION';
      }

      const narrativeState = (context as any).narrativeState;
      if (narrativeState && narrativeState.state) {
        const state = narrativeState.state;
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

      return 'BUSINESS_CHALLENGE';
    }

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
          chapterType = context.chapterNumber && context.chapterNumber <= 1 ? 'OPENING' : 'NEW_ARC';
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

    if ((context as any).tension) {
      const tension = (context as any).tension;
      if (tension >= 0.8 && chapterType === 'STANDARD') {
        chapterType = 'ACTION';
      } else if (tension <= 0.3 && chapterType === 'STANDARD') {
        chapterType = 'INTROSPECTION';
      }
    }

    return chapterType;
  }

  // ===================================================================
  // 共通ユーティリティメソッド（既存維持）
  // ===================================================================

  private getBaseTemplateWithFallback(): string {
    try {
      return this.templateManager.getBaseTemplate();
    } catch (error) {
      logger.warn('Failed to get base template, using fallback', { error });
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
    let result = template
      .replace('{chapterNumber}', String(context.chapterNumber || 1))
      .replace('{totalChapters}', String((context as any).totalChapters || '?'))
      .replace(/\{targetLength\}/g, String(context.targetLength || 8000))
      .replace('{narrativeStyle}', context.narrativeStyle || '三人称視点')
      .replace('{tone}', context.tone || '標準的な語り口')
      .replace('{theme}', context.theme || '成長と冒険')
      .replace('{genre}', genre);

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

  private addTensionAndPacingDescriptions(template: string, context: GenerationContext): string {
    const tensionLevel = (context as any).tension || 0.5;
    const pacingLevel = (context as any).pacing || 0.5;

    return template
      .replace('{tensionLevel}', `${Math.round(tensionLevel * 10)}/10`)
      .replace('{tensionDescription}', this.getDescriptionByLevelWithFallback('tensionDescriptions', tensionLevel))
      .replace('{pacingLevel}', `${Math.round(pacingLevel * 10)}/10`)
      .replace('{pacingDescription}', this.getDescriptionByLevelWithFallback('pacingDescriptions', pacingLevel));
  }

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

  private async replaceContentPlaceholders(prompt: string, context: GenerationContext): Promise<string> {
    let worldSettings = '';

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

    if (!worldSettings && context.worldSettings) {
      worldSettings = this.formatter.formatWorldSettings(context.worldSettings);
    }

    const characters = await this.formatter.formatCharacters(context.characters || []);

    return prompt
      .replace('{worldSettings}', worldSettings || '特に指定なし')
      .replace('{characters}', characters)
      .replace('{storyContext}', context.storyContext || '');
  }

  private insertPlotDirective(prompt: string, context: GenerationContext): string {
    if (!(context as any).plotDirective) {
      return prompt;
    }

    const contextInsertPoint = prompt.indexOf("## 物語の文脈");
    if (contextInsertPoint !== -1) {
      return prompt.substring(0, contextInsertPoint) +
        (context as any).plotDirective +
        "\n\n" +
        prompt.substring(contextInsertPoint);
    }

    return prompt;
  }

  private replaceNarrativeStateGuidance(prompt: string, context: GenerationContext, genre: string): string {
    if ((context as any).narrativeState) {
      const narrativeState = (context as any).narrativeState;
      const state = narrativeState.state || 'DEFAULT';
      const stateGuidance = this.templateManager.getNarrativeStateGuidance(state, genre);

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

  private addSignificantEventsSection(prompt: string, context: GenerationContext): string {
    if (!(context as any).significantEvents) {
      return prompt;
    }

    const significantEvents = (context as any).significantEvents;

    const hasLocationHistory = significantEvents.locationHistory && significantEvents.locationHistory.length > 0;
    const hasCharacterInteractions = significantEvents.characterInteractions && significantEvents.characterInteractions.length > 0;
    const hasWarningsPromises = significantEvents.warningsAndPromises && significantEvents.warningsAndPromises.length > 0;

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

  private addContinuityGuidanceSection(prompt: string, context: GenerationContext): string {
    if (!(context as any).continuityGuidance) {
      return prompt;
    }

    const guidance = (context as any).continuityGuidance;
    let continuitySection = "\n## 章間の連続性ガイダンス\n";

    if (guidance.suggestedStartingPoint) {
      continuitySection += `### 章の始め方\n${guidance.suggestedStartingPoint}\n\n`;
    }

    if (guidance.mustAddressElements && guidance.mustAddressElements.length > 0) {
      continuitySection += "### 必ず対応すべき要素（優先度高）\n以下の要素には必ず触れてください：\n";
      guidance.mustAddressElements.forEach((element: string) => {
        continuitySection += `- ${element}\n`;
      });
      continuitySection += "\n";
    }

    if (guidance.suggestedElements && guidance.suggestedElements.length > 0) {
      continuitySection += "### 対応が望ましい要素（優先度中）\n可能であれば、以下の要素にも触れてください：\n";
      guidance.suggestedElements.forEach((element: string) => {
        continuitySection += `- ${element}\n`;
      });
      continuitySection += "\n";
    }

    if (guidance.avoidGenericTeasers) {
      continuitySection += "### 章の終わり方（重要）\n";
      continuitySection += "- 「物語ははじまったばかり」「冒険はまだ終わらない」「新たな敵、新たな謎」などの一般的なあおり文は避けてください\n";
      continuitySection += "- 章の終わりは、具体的な次の展開を示唆するか、現在の問題に適切な区切りをつけてください\n";
      continuitySection += "- 多数の謎や敵を一度に示唆するのではなく、1-2の具体的な要素に絞ってください\n\n";
    }

    if (guidance.endingType === "cliffhanger") {
      continuitySection += "### クリフハンガー対応\n";
      continuitySection += "前章はクリフハンガー（未解決の緊張状態）で終わっています。この章ではその状況から始めて、何らかの解決や展開を提供してください。\n\n";
    }

    prompt += continuitySection;
    logger.debug('Added chapter continuity guidance to prompt');

    return prompt;
  }

  private integratePrompts(prompt: string, context: GenerationContext): string {
    if ((context as any).rawLearningJourneyPrompt) {
      const rawLearningJourneyPrompt = (context as any).rawLearningJourneyPrompt;
      const instructionSections = this.extractInstructionSections(rawLearningJourneyPrompt);

      if (instructionSections.some(section => section.title.includes('MODE OVERRIDE'))) {
        if (context.chapterNumber === 1) {
          return this.getFirstChapterIntegratedPrompt(prompt, rawLearningJourneyPrompt);
        }
        return this.getModeOverrideIntegratedPrompt(prompt, rawLearningJourneyPrompt, context.chapterNumber || 1);
      }

      if (instructionSections.length > 0) {
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

  private getFirstChapterIntegratedPrompt(originalPrompt: string, learningJourneyPrompt: string): string {
    const learningStageRegex = /・学習段階: ([^\n]+)/;
    const empatheticPointsRegex = /## 共感ポイント\n([\s\S]*?)(?=##|$)/;
    const emotionalArcRegex = /### 感情アーク\n([\s\S]*?)(?=###|$)/;

    const learningStageMatch = learningJourneyPrompt.match(learningStageRegex);
    const empatheticPointsMatch = learningJourneyPrompt.match(empatheticPointsRegex);
    const emotionalArcMatch = learningJourneyPrompt.match(emotionalArcRegex);

    const learningStage = learningStageMatch ? learningStageMatch[1].trim() : '';
    const empatheticPoints = empatheticPointsMatch ? empatheticPointsMatch[1].trim() : '';
    const emotionalArc = emotionalArcMatch ? emotionalArcMatch[1].trim() : '';

    let integratedPrompt = originalPrompt;

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

  private getModeOverrideIntegratedPrompt(originalPrompt: string, learningJourneyPrompt: string, chapterNumber: number = 1): string {
    const sectionPatterns: { [key: string]: RegExp } = {
      basicInfo: /## 基本情報\n([\s\S]*?)(?=##|$)/,
      previousChapter: /## 前章の状況\n([\s\S]*?)(?=##|$)/,
      plotDirective: /## 展開指示\n([\s\S]*?)(?=##|$)/,
      worldSettings: /## 世界設定\n([\s\S]*?)(?=##|$)/,
      characters: /## 登場人物\n([\s\S]*?)(?=##|$)/,
      storyContext: /## 物語の文脈\n([\s\S]*?)(?=##|$)/,
      storyStructure: /## 物語構造とプロット指示\n([\s\S]*?)(?=##|$)/,
      sceneContinuity: /## シーン連続性指示\n([\s\S]*?)(?=##|$)/,
      outputFormat: /【出力形式】\n([\s\S]*?)(?=##|$)/,
      characterPsychology: /## キャラクターの心理状態\n([\s\S]*?)(?=##|$)/,
      characterGrowth: /## キャラクターの成長とスキル情報\n([\s\S]*?)(?=##|$)/,
      emotionalArc: /## 感情アークの設計\n([\s\S]*?)(?=##|$)/,
      tensionGuidance: /## テンション構築の詳細ガイダンス\n([\s\S]*?)(?=##|$)/,
      styleGuidance: /## 文体ガイダンス\n([\s\S]*?)(?=##|$)/,
      expressionDiversity: /## 表現の多様化\n([\s\S]*?)(?=##|$)/,
      literaryTechniques: /## 文学的手法のインスピレーション\n([\s\S]*?)(?=##|$)/
    };

    const extractedSections: Record<string, string> = {};

    const extractSection = (source: string, patternKey: string): string => {
      const match = source.match(sectionPatterns[patternKey]);
      return match && match[1] ? match[1].trim() : '';
    };

    for (const [key, _] of Object.entries(sectionPatterns)) {
      extractedSections[key] = extractSection(originalPrompt, key);
    }

    let integratedPrompt = '';

    if (chapterNumber === 1) {
      integratedPrompt = originalPrompt;

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
      integratedPrompt = learningJourneyPrompt;

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

      for (const sectionKey of sectionOrder) {
        const sectionContent = extractedSections[sectionKey];
        const sectionTitle = sectionKey === 'outputFormat' ? '【出力形式】' : `## ${this.formatSectionTitle(sectionKey)}`;

        if (sectionContent && !integratedPrompt.includes(sectionTitle)) {
          if (sectionKey === 'outputFormat') {
            integratedPrompt += `\n\n${sectionTitle}\n${sectionContent}`;
          } else if (sectionKey === 'basicInfo') {
            integratedPrompt = `${sectionTitle}\n${sectionContent}\n\n${integratedPrompt}`;
          } else {
            integratedPrompt += `\n\n${sectionTitle}\n${sectionContent}`;
          }
        }
      }
    }

    return integratedPrompt;
  }

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

  private ensureOutputFormatInstructions(prompt: string, context: GenerationContext): string {
    if (prompt.includes('【出力形式】') || prompt.includes('以下の形式で出力')) {
      return prompt;
    }

    const targetLength = context.targetLength || 8000;

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
}