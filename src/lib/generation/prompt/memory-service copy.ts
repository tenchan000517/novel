/**
 * @fileoverview メモリサービスクラス
 * @description 前章情報やシーン連続性情報にアクセスするためのサービス
 */

import { logger } from '@/lib/utils/logger';
import { memoryManager } from '@/lib/memory/manager';
import { NarrativeState } from '@/lib/memory/types';
import { ImmediateContext } from '@/lib/memory/immediate-context';

/**
 * メモリサービスクラス
 * 章間の連続性や物語記憶に関連する情報を取得する
 */
export class MemoryService {
  private immediateContext?: ImmediateContext;

  /**
   * コンストラクタ
   */
  constructor() {
    try {
      this.immediateContext = memoryManager.getShortTermMemory();
    } catch (error) {
      logger.warn('Failed to initialize ImmediateContext', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 前章の終了部分を取得する
   * @param {number} chapterNumber 現在の章番号
   * @returns {Promise<string>} 前章の終了部分
   */
  public async getPreviousChapterEnding(chapterNumber: number): Promise<string> {
    if (chapterNumber <= 1) {
      return '物語の始まりです。';
    }

    try {
      if (!this.immediateContext) {
        this.initializeImmediateContext();
      }

      if (!this.immediateContext) {
        return '前章のデータにアクセスできません。新しい章の展開を自由に始めてください。';
      }

      // 前章を取得
      const previousChapter = await this.immediateContext.getChapter(chapterNumber - 1);

      if (!previousChapter) {
        return '前章のデータがありません。';
      }

      // 前章の最後の部分を抽出（段落単位で区切る）
      const content = previousChapter.content;
      const paragraphs = content.split(/\n+/);

      // 最後の2〜3段落を抽出
      const lastParagraphs = paragraphs.slice(-3);

      return `以下は前章の最後の部分です。この続きを書いてください：\n\n${lastParagraphs.join('\n\n')}`;
    } catch (error) {
      // メモリマネージャーが初期化されていない場合のフォールバック
      logger.warn(`Failed to get previous chapter ending for chapter ${chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return '前の章の情報にアクセスできません。新しい章を自由に展開してください。';
    }
  }

  /**
   * シーン連続性情報を取得する
   * @param {number} chapterNumber 現在の章番号
   * @returns {Promise<object>} シーン連続性情報
   */
  public async getSceneContinuityInfo(chapterNumber: number): Promise<{
    previousScene: string,
    characterPositions: string,
    timeElapsed: string,
    location: string,
    endingGuidance: string
  }> {
    // デフォルト値
    const defaultInfo = {
      previousScene: '特になし',
      characterPositions: '特になし',
      timeElapsed: '前章からの自然な時間経過',
      location: '前章と同じ場所、または自然な移動先',
      endingGuidance: '次章への興味を引く展開で終わらせる'
    };

    if (chapterNumber <= 1) {
      return {
        ...defaultInfo,
        previousScene: '物語の始まりです',
        endingGuidance: '主人公が最初の課題に直面するところで終わらせる'
      };
    }

    try {
      if (!this.immediateContext) {
        this.initializeImmediateContext();
      }

      if (!this.immediateContext) {
        return defaultInfo;
      }

      // 前章を取得
      const previousChapter = await this.immediateContext.getChapter(chapterNumber - 1);

      if (!previousChapter) {
        return defaultInfo;
      }

      // 前章の最後のシーンを特定
      let previousScene = '前章の最後のシーン情報がありません';
      let characterPositions = '';
      let location = '';

      if (previousChapter.scenes && previousChapter.scenes.length > 0) {
        const lastScene = previousChapter.scenes[previousChapter.scenes.length - 1];
        previousScene = `『${lastScene.title}』: ${lastScene.summary}`;
        // 修正: 配列を文字列に変換
        characterPositions = Array.isArray(lastScene.characters)
          ? lastScene.characters.join('、')
          : lastScene.characters || '';
        location = lastScene.location || '';
      }

      // 物語状態に基づく章の終わり方ガイダンス
      let endingGuidance = defaultInfo.endingGuidance;
      const narrativeState = await this.getNarrativeState(chapterNumber - 1);

      // 状態に基づく終わり方の指示
      if (narrativeState && narrativeState.state) {
        endingGuidance = this.getEndingGuidanceByState(narrativeState.state, narrativeState.tensionLevel || 0);
      }

      return {
        previousScene,
        characterPositions: `${characterPositions || '主要キャラクター'}が${location || '前章の場所'}にいる状態から始める`,
        timeElapsed: '前章から直後、または短時間経過',
        location: location || defaultInfo.location,
        endingGuidance
      };
    } catch (error) {
      logger.error('シーン連続性情報の取得に失敗', { 
        error: error instanceof Error ? error.message : String(error)
      });
      return defaultInfo;
    }
  }

  /**
   * 物語状態を取得する
   * @param {number} chapterNumber 章番号
   * @returns {Promise<any>} 物語状態
   */
  private async getNarrativeState(chapterNumber: number): Promise<any> {
    try {
      return await memoryManager.getNarrativeState(chapterNumber);
    } catch (error) {
      logger.warn(`Failed to get narrative state for chapter ${chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return { state: 'UNKNOWN' };
    }
  }

  /**
   * 状態に基づく章の終わり方ガイダンスを取得する
   * @param {string} state 物語状態
   * @param {number} tensionLevel テンションレベル
   * @returns {string} 終わり方ガイダンス
   */
  private getEndingGuidanceByState(state: string, tensionLevel: number): string {
    switch (state) {
      case NarrativeState.JOURNEY:
        return '新たな場所の発見や予期せぬ出会いなど、旅の新展開で終わらせる';
      case NarrativeState.INVESTIGATION:
        return '重要な手がかりの発見や新たな謎の浮上で終わらせる';
      case NarrativeState.BATTLE:
        return '戦いの決定的瞬間または予想外の展開で終わらせる';
      case NarrativeState.REVELATION:
        return '明らかになった真実に対するキャラクターの反応と次の行動への布石で終わらせる';
      case NarrativeState.STRATEGIC_PREPARATION:
        return '次の戦略を模索しつつ、チームの意見が割れる場面で終わらせる';
      case NarrativeState.MARKET_COMPETITION:
        return '競争の激化を示し、対抗策を考える場面で終わらせる';
      case NarrativeState.PERFORMANCE_REVIEW:
        return '評価の結果がまだ見えず、メンバーが緊張感を抱えたまま終わらせる';
      case NarrativeState.FINANCIAL_CHALLENGE:
        return '財務の見通しが悪化し、次の打開策を模索する場面で終わらせる';
      case NarrativeState.ACQUISITION_NEGOTIATION:
        return '買収条件がまとまらず、交渉が難航する場面で終わらせる';
      case NarrativeState.CRISIS_MANAGEMENT:
        return '危機が一時的に収束するが、後遺症が残る場面で終わらせる';
      case NarrativeState.MARKET_ENTRY:
        return '市場への初動が成功するか不確実な状況で終わらせる';
      case NarrativeState.PARTNERSHIP_DEVELOPMENT:
        return '提携先と合意目前で意見が食い違う場面で終わらせる';
      case NarrativeState.MARKET_SCALING:
        return '規模拡大のメリットとリスクが交差する場面で終わらせる';
      default:
        return '物語を自然に進行させ、次章への期待感を持たせる';
    }

    // テンションレベルに基づく調整は末尾に追加
    return tensionLevel > 7 
      ? '。高いテンションを維持し、クリフハンガー的要素を含めること'
      : '';
  }

  /**
   * ImmediateContextを初期化する
   * @private
   */
  private initializeImmediateContext(): void {
    try {
      this.immediateContext = memoryManager.getShortTermMemory();
    } catch (error) {
      logger.warn('Failed to initialize ImmediateContext', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}