/**
 * @fileoverview キャラクター登場タイミング分析コンポーネント
 * @description
 * ストーリーコンテキストとキャラクター特性に基づいて、
 * キャラクターが最適に登場するタイミングを分析・推奨する機能を提供します。
 * プロット関連度、キャラクター発展、ナラティブペーシング、読者期待などの要因を
 * 総合的に考慮した分析を行います。
 */
import { ITimingAnalyzer } from '../core/interfaces';
import { 
  Character, 
  TimingRecommendation, 
  StoryContext, 
  TimingAnalysis, 
  TimingFactor 
} from '../core/types';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';

/**
 * タイミング分析クラス
 * キャラクターの最適な登場タイミングを分析・推奨
 */
export class TimingAnalyzer implements ITimingAnalyzer {
  // 分析結果のキャッシュ
  private analysisCache: Map<string, {
    analysis: TimingAnalysis;
    timestamp: number;
    contextHash: string;
  }> = new Map();
  
  // キャッシュの有効期間 (1時間)
  private readonly CACHE_TTL_MS = 3600000;
  
  /**
   * コンストラクタ
   */
  constructor() {
    logger.info('TimingAnalyzer: 初期化完了');
  }

  /**
   * タイミング推奨取得
   * キャラクターとストーリー文脈に基づいて最適な登場タイミングを推奨します
   * 
   * @param character キャラクター
   * @param storyContext ストーリー文脈
   * @returns タイミング推奨
   */
  async getTimingRecommendation(
    character: Character,
    storyContext: StoryContext
  ): Promise<TimingRecommendation> {
    try {
      logger.info(`キャラクター「${character.name}」の登場タイミング分析を開始します`);
      
      // キャッシュチェック
      const contextHash = this.generateContextHash(character.id, storyContext);
      const cachedResult = this.analysisCache.get(character.id);
      
      if (cachedResult && 
          Date.now() - cachedResult.timestamp < this.CACHE_TTL_MS &&
          cachedResult.contextHash === contextHash) {
        logger.debug(`キャラクター「${character.name}」のタイミング分析: キャッシュを使用します`);
        const analysis = cachedResult.analysis;
        
        return {
          recommendedChapter: analysis.optimalChapter,
          significance: analysis.significance,
          reason: analysis.reason,
          alternatives: analysis.alternatives,
          preparationNeeded: analysis.preparation
        };
      }
      
      // 各要因の分析
      const analysisResult = await this.analyzeTimingFactors(character, storyContext);
      
      // 結果をキャッシュ
      this.analysisCache.set(character.id, {
        analysis: analysisResult,
        timestamp: Date.now(),
        contextHash
      });
      
      // 推奨情報の構築
      const recommendation: TimingRecommendation = {
        recommendedChapter: analysisResult.optimalChapter,
        significance: analysisResult.significance,
        reason: analysisResult.reason,
        alternatives: analysisResult.alternatives,
        preparationNeeded: analysisResult.preparation,
      };

      logger.info(`キャラクター「${character.name}」のタイミング分析完了: 推奨チャプター ${recommendation.recommendedChapter}`);
      return recommendation;
    } catch (error) {
      logError(error, {}, `キャラクター「${character.name}」のタイミング分析中にエラーが発生しました`);
      
      // フォールバック推奨
      return {
        recommendedChapter: storyContext.currentChapter + 1,
        significance: 'MEDIUM',
        reason: 'エラーが発生したため、デフォルトの推奨を提供します',
        alternatives: [storyContext.currentChapter + 2, storyContext.currentChapter + 3],
        preparationNeeded: ['キャラクター紹介の準備']
      };
    }
  }

  /**
   * タイミング要因を分析する
   * 4つの主要要因に基づいて総合的な分析を実施します
   * 
   * @param character キャラクター
   * @param context ストーリー文脈
   * @returns タイミング分析結果
   */
  async analyzeTimingFactors(
    character: Character,
    context: StoryContext
  ): Promise<TimingAnalysis> {
    try {
      // 各要因の分析
      const factors: TimingFactor[] = [
        await this.analyzePlotRelevance(character, context),
        await this.analyzeCharacterDevelopment(character, context),
        await this.analyzeNarrativePacing(character, context),
        await this.analyzeReaderExpectations(character, context)
      ];

      // 分析結果の統合
      return this.synthesizeAnalysis(factors, character, context);
    } catch (error) {
      logError(error, {}, `キャラクター「${character.name}」のタイミング要因分析中にエラーが発生しました`);
      
      // エラー時のフォールバック
      return {
        optimalChapter: context.currentChapter + 1,
        significance: 'MEDIUM',
        score: 0.5,
        reason: '分析エラーが発生しました。デフォルト値を使用します。',
        factors: [],
        alternatives: [context.currentChapter + 2, context.currentChapter + 3],
        preparation: ['キャラクター紹介の準備']
      };
    }
  }

  /**
   * プロット関連度を分析する
   * キャラクターとプロットポイントの関連度を評価します
   * 
   * @private
   * @param character キャラクター
   * @param context ストーリー文脈
   * @returns プロット関連度要因
   */
  private async analyzePlotRelevance(
    character: Character,
    context: StoryContext
  ): Promise<TimingFactor> {
    try {
      // キャラクターとプロットポイントの関連度計算
      const relevance = this.calculatePlotRelevance(character, context.plotPoints);

      return {
        type: 'PLOT_RELEVANCE',
        score: relevance,
        impact: this.calculateImpact(relevance),
        description: `プロット関連度: ${(relevance * 100).toFixed(1)}%`
      };
    } catch (error) {
      logError(error, {}, `キャラクター「${character.name}」のプロット関連度分析でエラーが発生しました`);
      return {
        type: 'PLOT_RELEVANCE',
        score: 0.3,
        impact: 'MEDIUM',
        description: 'プロット関連度の分析に失敗しました'
      };
    }
  }

  /**
   * キャラクター発展を分析する
   * キャラクターの発展段階とストーリー進行状況を比較分析します
   * 
   * @private
   * @param character キャラクター
   * @param context ストーリー文脈
   * @returns キャラクター発展要因
   */
  private async analyzeCharacterDevelopment(
    character: Character,
    context: StoryContext
  ): Promise<TimingFactor> {
    try {
      // キャラクター発展段階とストーリーの現在位置を比較
      const developmentStage = character.state?.developmentStage || 0;
      const expectedStage = this.calculateExpectedStage(context.currentChapter, context.totalChapters);

      // 発展ステージの差に基づくスコア
      const stageDifference = Math.abs(developmentStage - expectedStage);
      const score = Math.max(0, 1 - (stageDifference / 3));

      return {
        type: 'CHARACTER_DEVELOPMENT',
        score,
        impact: this.calculateImpact(score),
        description: `キャラクター発展: 現在ステージ ${developmentStage}, 期待ステージ ${expectedStage.toFixed(1)}`
      };
    } catch (error) {
      logError(error, {}, `キャラクター「${character.name}」の発展分析でエラーが発生しました`);
      return {
        type: 'CHARACTER_DEVELOPMENT',
        score: 0.5,
        impact: 'MEDIUM',
        description: 'キャラクター発展の分析に失敗しました'
      };
    }
  }

  /**
   * ナラティブペーシングを分析する
   * 物語のテンポとキャラクター登場の頻度を分析します
   * 
   * @private
   * @param character キャラクター
   * @param context ストーリー文脈
   * @returns ナラティブペーシング要因
   */
  private async analyzeNarrativePacing(
    character: Character,
    context: StoryContext
  ): Promise<TimingFactor> {
    try {
      // 物語のペースとキャラクター登場の密度を分析
      const pacing = context.storyPacing || 'MEDIUM';
      const characterDensity = this.calculateCharacterDensity(context);

      const pacingScore = this.calculatePacingScore(pacing, characterDensity);
      const pacingImpact = this.calculatePacingImpact(character.type);

      return {
        type: 'NARRATIVE_PACING',
        score: pacingScore,
        impact: pacingImpact,
        description: `ナラティブペーシング: ${pacing}, キャラクター密度: ${characterDensity.toFixed(2)}`
      };
    } catch (error) {
      logError(error, {}, `キャラクター「${character.name}」のナラティブペーシング分析でエラーが発生しました`);
      return {
        type: 'NARRATIVE_PACING',
        score: 0.5,
        impact: 'MEDIUM',
        description: 'ナラティブペーシングの分析に失敗しました'
      };
    }
  }

  /**
   * 読者期待を分析する
   * 前回の登場からの経過チャプター数とキャラクタータイプに基づいて
   * 読者の期待度を分析します
   * 
   * @private
   * @param character キャラクター
   * @param context ストーリー文脈
   * @returns 読者期待要因
   */
  private async analyzeReaderExpectations(
    character: Character,
    context: StoryContext
  ): Promise<TimingFactor> {
    try {
      // 前回の登場からの経過チャプター数
      const lastAppearance = character.state?.lastAppearance || 0;
      const chaptersSinceLastAppearance = context.currentChapter - lastAppearance;

      // キャラクタータイプに応じた最適な再登場間隔
      const optimalInterval = this.getOptimalReappearanceInterval(character.type);

      // 再登場時期の最適さを計算
      const intervalRatio = chaptersSinceLastAppearance / optimalInterval;
      const reappearanceScore = intervalRatio > 0.8 ?
        Math.min(1, 2 - intervalRatio) : // 最適間隔の80%以上経過していれば高スコア
        intervalRatio / 0.8; // それ未満なら徐々にスコア上昇

      return {
        type: 'READER_EXPECTATIONS',
        score: reappearanceScore,
        impact: this.calculateImpact(reappearanceScore),
        description: `読者期待: 最後の登場から ${chaptersSinceLastAppearance} チャプター経過（最適間隔: ${optimalInterval}）`
      };
    } catch (error) {
      logError(error, {}, `キャラクター「${character.name}」の読者期待分析でエラーが発生しました`);
      return {
        type: 'READER_EXPECTATIONS',
        score: 0.5,
        impact: 'MEDIUM',
        description: '読者期待の分析に失敗しました'
      };
    }
  }

  /**
   * 分析結果を統合する
   * 各要因の分析結果を重み付けして統合し、最終的な推奨を構築します
   * 
   * @private
   * @param factors 各要因の分析結果
   * @param character キャラクター
   * @param context ストーリー文脈
   * @returns 統合分析結果
   */
  private synthesizeAnalysis(
    factors: TimingFactor[],
    character: Character,
    context: StoryContext
  ): TimingAnalysis {
    try {
      // 各要因のスコアを重み付けして統合
      const weights = {
        'PLOT_RELEVANCE': 0.4,
        'CHARACTER_DEVELOPMENT': 0.25,
        'NARRATIVE_PACING': 0.2,
        'READER_EXPECTATIONS': 0.15
      };

      let totalWeightedScore = 0;
      let totalWeight = 0;
      const factorDescriptions: string[] = [];

      for (const factor of factors) {
        const weight = weights[factor.type] || 0.1;
        totalWeightedScore += factor.score * weight;
        totalWeight += weight;
        factorDescriptions.push(factor.description);
      }

      // 正規化されたスコア
      const normalizedScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0.5;

      // 最適な登場チャプターを計算
      const optimalChapter = this.calculateOptimalChapter(normalizedScore, character, context);

      // 代替チャプターを計算
      const alternatives = this.calculateAlternativeChapters(optimalChapter, character, context);

      // 登場の重要度を計算
      const significance = this.calculateAppearanceSignificance(normalizedScore, character);

      // 必要な準備を決定
      const preparation = this.determineRequiredPreparation(character, optimalChapter, context);

      return {
        optimalChapter,
        significance,
        score: normalizedScore,
        reason: `複数の要因に基づく分析: ${factorDescriptions.join(', ')}`,
        factors,
        alternatives,
        preparation
      };
    } catch (error) {
      logError(error, {}, `キャラクター「${character.name}」の分析統合でエラーが発生しました`);

      // 失敗時のフォールバック分析
      return {
        optimalChapter: context.currentChapter + 1,
        significance: 'MEDIUM',
        score: 0.5,
        reason: '分析統合に失敗しました',
        factors: [],
        alternatives: [context.currentChapter + 2, context.currentChapter + 3],
        preparation: []
      };
    }
  }

  // 分析計算用ヘルパーメソッド

  /**
   * プロット関連度を計算する
   * @private
   */
  private calculatePlotRelevance(character: Character, plotPoints: any[] = []): number {
    if (!plotPoints || plotPoints.length === 0) return 0.5;

    let relevantPoints = 0;
    let totalRelevance = 0;

    for (const point of plotPoints) {
      const relatedCharactersMatch =
        point.relatedCharacters &&
        Array.isArray(point.relatedCharacters) &&
        point.relatedCharacters.includes(character.id);

      let keywordsMatch = false;
      if (point.keywords && Array.isArray(point.keywords)) {
        keywordsMatch = point.keywords.some((keyword: string) => {
          const matchesTraits = character.personality?.traits?.includes(keyword) ?? false;

          let matchesBackstory = false;
          if (character.backstory) {
            matchesBackstory =
              character.backstory.summary.includes(keyword) ||
              (character.backstory.origin ? character.backstory.origin.includes(keyword) : false);
          }

          return matchesTraits || matchesBackstory;
        });
      }

      if (relatedCharactersMatch || keywordsMatch) {
        relevantPoints++;
        totalRelevance += point.importance || 0.5;
      }
    }

    const pointRatio = relevantPoints / plotPoints.length;
    const avgRelevance = relevantPoints > 0 ? totalRelevance / relevantPoints : 0;

    return (pointRatio * 0.7) + (avgRelevance * 0.3);
  }

  /**
   * 影響度を計算する
   * @private
   */
  private calculateImpact(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (score < 0.3) return 'LOW';
    if (score < 0.7) return 'MEDIUM';
    return 'HIGH';
  }

  /**
   * 期待される発展段階を計算する
   * @private
   */
  private calculateExpectedStage(currentChapter: number, totalChapters: number): number {
    // 物語の進行度に基づいて期待される発展段階を計算
    const storyProgress = currentChapter / totalChapters;

    // 最大5段階の発展
    return storyProgress * 5;
  }

  /**
   * キャラクター密度を計算する
   * @private
   */
  private calculateCharacterDensity(context: StoryContext): number {
    // 直近のチャプターにおけるキャラクター登場数の平均
    if (!context.recentAppearances || context.recentAppearances.length === 0) {
      return 5; // デフォルト値
    }

    const totalCharacters = context.recentAppearances.reduce(
      (sum, chapter) => sum + (chapter.characterCount || 0), 0
    );

    return totalCharacters / context.recentAppearances.length;
  }

  /**
   * ペーシングスコアを計算する
   * @private
   */
  private calculatePacingScore(pacing: string, characterDensity: number): number {
    // ペーシングと密度に基づくスコア
    // 高速ペースでは高密度が許容され、低速ペースでは低密度が望ましい

    let optimalDensity;
    switch (pacing) {
      case 'FAST':
        optimalDensity = 7;
        break;
      case 'MEDIUM':
        optimalDensity = 5;
        break;
      case 'SLOW':
        optimalDensity = 3;
        break;
      default:
        optimalDensity = 5;
    }

    // 最適密度からの乖離に基づくスコア（1に近いほど最適）
    const densityDifference = Math.abs(characterDensity - optimalDensity);
    return Math.max(0, 1 - (densityDifference / 10));
  }

  /**
   * ペーシング影響を計算する
   * @private
   */
  private calculatePacingImpact(characterType: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    // キャラクタータイプによるペーシング影響の重要度
    switch (characterType) {
      case 'MAIN':
        return 'LOW';      // メインキャラはペーシングに関わらず登場
      case 'SUB':
        return 'MEDIUM';   // サブキャラはある程度影響を受ける
      case 'MOB':
        return 'HIGH';     // モブキャラは強く影響を受ける
      default:
        return 'MEDIUM';
    }
  }

  /**
   * 最適な再登場間隔を取得する
   * @private
   */
  private getOptimalReappearanceInterval(characterType: string): number {
    // キャラクタータイプに応じた最適な再登場間隔
    switch (characterType) {
      case 'MAIN':
        return 1;        // メインキャラはほぼ毎回登場
      case 'SUB':
        return 3;        // サブキャラは3章ごとくらい
      case 'MOB':
        return 10;       // モブは10章ごとくらい
      default:
        return 5;
    }
  }

  /**
   * 最適な登場チャプターを計算する
   * @private
   */
  private calculateOptimalChapter(
    score: number,
    character: Character,
    context: StoryContext
  ): number {
    // 総合スコアが高いほど早期登場が推奨される

    const urgencyFactor = score * 2; // スコアが高いほど緊急性が高い
    const baseDelay = this.getBaseDelayByType(character.type);

    // 緊急性に応じた登場までの遅延チャプター数
    const chaptersDelay = Math.max(1, Math.round(baseDelay / urgencyFactor));

    return context.currentChapter + chaptersDelay;
  }

  /**
   * キャラクタータイプによる基本遅延を取得する
   * @private
   */
  private getBaseDelayByType(characterType: string): number {
    switch (characterType) {
      case 'MAIN':
        return 1;
      case 'SUB':
        return 3;
      case 'MOB':
        return 5;
      default:
        return 3;
    }
  }

  /**
   * 代替登場チャプターを計算する
   * @private
   */
  private calculateAlternativeChapters(
    optimalChapter: number,
    character: Character,
    context: StoryContext
  ): number[] {
    // 最適チャプターの前後に代替案を提示

    const alternatives: number[] = [];
    const flexibilityByType = {
      'MAIN': 1,
      'SUB': 2,
      'MOB': 3
    };

    const flexibility = flexibilityByType[character.type as keyof typeof flexibilityByType] || 2;

    // 前のチャプター（可能な場合）
    if (optimalChapter > context.currentChapter) {
      alternatives.push(Math.max(context.currentChapter, optimalChapter - flexibility));
    }

    // 後のチャプター
    alternatives.push(optimalChapter + flexibility);

    return alternatives;
  }

  /**
   * 登場の重要度を計算する
   * @private
   */
  private calculateAppearanceSignificance(
    score: number,
    character: Character
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    // スコアとキャラクタータイプに基づく重要度

    const typeWeights = {
      'MAIN': 0.8,
      'SUB': 0.5,
      'MOB': 0.2
    };

    const typeWeight = typeWeights[character.type as keyof typeof typeWeights] || 0.5;
    const combinedScore = (score * 0.7) + (typeWeight * 0.3);

    return this.calculateImpact(combinedScore);
  }

  /**
   * 必要な準備を決定する
   * @private
   */
  private determineRequiredPreparation(
    character: Character,
    targetChapter: number,
    context: StoryContext
  ): string[] {
    const preparation: string[] = [];

    // 初登場の場合はより多くの準備が必要
    if (!character.state?.lastAppearance) {
      preparation.push('キャラクターの明確な紹介');
      preparation.push('重要な背景情報の提示');
    }

    // 長期間登場していない場合
    if (character.state?.lastAppearance &&
        (targetChapter - character.state.lastAppearance) > 5) {
      preparation.push('前回の登場からの時間経過の説明');
      preparation.push('キャラクターの状態変化の描写');
    }

    // キャラクタータイプに応じた準備
    if (character.type === 'MAIN') {
      preparation.push('現在のアーク内での役割の明確化');
    } else if (character.type === 'SUB') {
      preparation.push('メインキャラクターとの関係性の強調');
    }

    // プロット関連の準備
    const relevantPlotPoints = this.findRelevantUpcomingPlotPoints(character, context);
    if (relevantPlotPoints.length > 0) {
      preparation.push('関連するプロットポイントへの伏線設置');
    }

    return preparation;
  }

  /**
   * 関連する今後のプロットポイントを検索する
   * @private
   */
  private findRelevantUpcomingPlotPoints(
    character: Character,
    context: StoryContext
  ): any[] {
    if (!context.plotPoints || !Array.isArray(context.plotPoints)) return [];

    return context.plotPoints.filter((point) => {
      if (!(point.chapter > context.currentChapter)) {
        return false;
      }

      // 関連キャラクターチェック
      const relatedCharactersMatch =
        point.relatedCharacters &&
        Array.isArray(point.relatedCharacters) &&
        point.relatedCharacters.includes(character.id);

      // キーワードチェック
      let keywordsMatch = false;
      if (point.keywords && Array.isArray(point.keywords)) {
        keywordsMatch = point.keywords.some((keyword: string) => {
          const matchesTraits =
            character.personality?.traits?.includes(keyword) ?? false;

            let matchesBackstory = false;
            if (character.backstory) {
              matchesBackstory =
                character.backstory.summary.includes(keyword) ||
                (character.backstory.origin ? character.backstory.origin.includes(keyword) : false);
            }

          return matchesTraits || matchesBackstory;
        });
      }

      return relatedCharactersMatch || keywordsMatch;
    });
  }

  /**
   * コンテキストのハッシュを生成する
   * キャッシュの識別に使用
   * @private
   */
  private generateContextHash(characterId: string, context: StoryContext): string {
    const relevantProps = {
      characterId,
      currentChapter: context.currentChapter,
      totalChapters: context.totalChapters,
      storyPacing: context.storyPacing,
      plotPointsCount: context.plotPoints?.length || 0,
      recentAppearancesCount: context.recentAppearances?.length || 0
    };
    
    return JSON.stringify(relevantProps);
  }
}

// シングルトンインスタンスをエクスポート
export const timingAnalyzer = new TimingAnalyzer();