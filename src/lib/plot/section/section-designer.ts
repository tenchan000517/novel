// src/lib/plot/section/section-designer.ts
/**
 * @fileoverview 中期プロット（篇）の詳細設計を行うクラス
 * @description
 * セクションの構造設計、学習段階と章のマッピング、感情アークの設計、
 * キャラクター変容アークの設計などを担当します。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { logError } from '@/lib/utils/error-handler';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { LearningStage } from '@/lib/learning-journey/concept-learning-manager';
import { SectionPlotManager } from './section-plot-manager';
import {
  SectionPlot,
  NarrativeStructureDesign,
  EmotionalDesign,
  CharacterDesign,
  ChapterOutline
} from './types';

interface TensionPoint {
    relativePosition: number;
    intensity: number;
    // 他に必要なプロパティがあれば追加
  }

/**
 * @class SectionDesigner
 * @description 篇の詳細設計を行うクラス
 */
export class SectionDesigner {
  /**
   * コンストラクタ
   * 
   * @param sectionPlotManager セクションプロットマネージャー
   * @param geminiClient Geminiクライアント
   */
  constructor(
    private sectionPlotManager: SectionPlotManager,
    private geminiClient: GeminiClient
  ) {}

  /**
   * 篇の構造設計
   * 
   * @param sectionId セクションID
   * @returns 物語構造設計
   */
  async designSectionStructure(sectionId: string): Promise<NarrativeStructureDesign> {
    try {
      logger.info(`Designing narrative structure for section ${sectionId}`);

      // セクション情報を取得
      const section = await this.sectionPlotManager.getSection(sectionId);
      if (!section) {
        throw new Error(`Section ${sectionId} not found`);
      }

      // 現在の構造を抽出
      const structure = section.structure;
      const learning = section.learningJourneyDesign;

      // チャプター範囲を計算
      const { start, end } = section.chapterRange;
      const chapterCount = end - start + 1;

      // 重要シーンを生成
      const keyScenes = await this.generateKeyScenes(section, chapterCount);

      // ターニングポイントを生成
      const turningPoints = await this.generateTurningPoints(section, chapterCount);

      // 物語のスレッドを生成
      const narrativeThreads = await this.generateNarrativeThreads(section);

      // 伏線を生成
      const sectionForeshadowing = await this.generateForeshadowing(section);

      // 他セクションとの接続
      const relations = this.sectionPlotManager.getSectionRelationship(sectionId);
      const intersectionWithOtherSections = await this.generateIntersections(section, relations);

      // 構造設計を構築
      const narrativeStructure: NarrativeStructureDesign = {
        keyScenes,
        turningPoints,
        narrativeThreads,
        sectionForeshadowing,
        intersectionWithOtherSections
      };

      // 結果を更新
      await this.sectionPlotManager.updateSection(sectionId, {
        narrativeStructureDesign: narrativeStructure
      });

      logger.info(`Successfully designed narrative structure for section ${sectionId}`);
      return narrativeStructure;
    } catch (error) {
      logError(error, { sectionId }, 'Failed to design section structure');
      // エラー時は空の構造を返す
      return {
        keyScenes: [],
        turningPoints: [],
        narrativeThreads: [],
        sectionForeshadowing: [],
        intersectionWithOtherSections: {
          previous: '',
          next: ''
        }
      };
    }
  }

  /**
   * 重要シーンを生成
   * 
   * @param section セクション情報
   * @param chapterCount 章数
   * @returns 重要シーンの配列
   */
  private async generateKeyScenes(
    section: SectionPlot,
    chapterCount: number
  ): Promise<NarrativeStructureDesign['keyScenes']> {
    try {
      // 学習段階と感情設計に基づいて重要シーンを生成
      const learning = section.learningJourneyDesign;
      const emotion = section.emotionalDesign;

      // AIによる重要シーンの生成
      const prompt = `
あなたは物語構造設計の専門家です。
以下の情報に基づいて、${chapterCount}章からなるセクション「${section.structure.title}」の重要シーンを3-5つ設計してください。

【セクション情報】
- テーマ: ${section.structure.theme}
- 物語フェーズ: ${section.structure.narrativePhase}
- 主要概念: ${learning.mainConcept}
- 学習段階: ${learning.primaryLearningStage}
- 感情アーク: ${emotion.emotionalArc.opening} → ${emotion.emotionalArc.midpoint} → ${emotion.emotionalArc.conclusion}

各シーンには以下の情報を含めてください:
1. 説明: シーンの内容
2. 目的: シーンが物語に果たす役割
3. 相対位置: 0.0〜1.0の値でセクション内での位置
4. 学習との関連: 主要概念や学習段階との関連性

結果はJSONの配列形式で、以下のフォーマットで出力してください:
[
  {
    "description": "シーンの説明",
    "purpose": "シーンの目的",
    "relativePosition": 0.2,
    "learningConnection": "学習との関連"
  },
  ...
]
`;

      // AIによる生成を実行
      const response = await apiThrottler.throttledRequest(() => 
        this.geminiClient.generateText(prompt, { responseFormat: "json" })
      );

      // 応答をjsonとしてパース
      try {
        const keyScenes = JSON.parse(response);
        if (Array.isArray(keyScenes)) {
          return keyScenes;
        }
        logger.warn('AI response is not a valid array', { response });
        return this.generateDefaultKeyScenes(section, chapterCount);
      } catch (parseError) {
        logger.error('Failed to parse AI response as JSON', { 
          error: parseError, 
          response 
        });
        return this.generateDefaultKeyScenes(section, chapterCount);
      }
    } catch (error) {
      logger.error('Failed to generate key scenes', { error });
      return this.generateDefaultKeyScenes(section, chapterCount);
    }
  }

  /**
   * デフォルトの重要シーンを生成
   */
  private generateDefaultKeyScenes(
    section: SectionPlot,
    chapterCount: number
  ): NarrativeStructureDesign['keyScenes'] {
    return [
      {
        description: `${section.structure.title}の導入部`,
        purpose: "セクションのテーマと主要概念を紹介する",
        relativePosition: 0.1,
        learningConnection: `${section.learningJourneyDesign.mainConcept}の基本的な理解を確立する`
      },
      {
        description: `${section.structure.title}の中盤の転機`,
        purpose: "葛藤と課題を深める",
        relativePosition: 0.5,
        learningConnection: `${section.learningJourneyDesign.mainConcept}の複雑さや奥深さを探求する`
      },
      {
        description: `${section.structure.title}のクライマックス`,
        purpose: "主要な学びと感情の交差点",
        relativePosition: 0.8,
        learningConnection: `${section.learningJourneyDesign.mainConcept}への理解が深まる重要な洞察の瞬間`
      }
    ];
  }

  /**
   * ターニングポイントを生成
   * 
   * @param section セクション情報
   * @param chapterCount 章数
   * @returns ターニングポイントの配列
   */
  private async generateTurningPoints(
    section: SectionPlot,
    chapterCount: number
  ): Promise<NarrativeStructureDesign['turningPoints']> {
    try {
      // 学習段階と感情設計に基づいてターニングポイントを生成
      const learning = section.learningJourneyDesign;
      const emotion = section.emotionalDesign;

      // AIによるターニングポイントの生成
      const prompt = `
あなたは物語構造設計の専門家です。
以下の情報に基づいて、${chapterCount}章からなるセクション「${section.structure.title}」のターニングポイントを2-3つ設計してください。

【セクション情報】
- テーマ: ${section.structure.theme}
- 物語フェーズ: ${section.structure.narrativePhase}
- 主要概念: ${learning.mainConcept}
- 学習段階: ${learning.primaryLearningStage}
- 感情アーク: ${emotion.emotionalArc.opening} → ${emotion.emotionalArc.midpoint} → ${emotion.emotionalArc.conclusion}

各ターニングポイントには以下の情報を含めてください:
1. 説明: 何が起こるか
2. 影響: 物語や登場人物への影響
3. 相対位置: 0.0〜1.0の値でセクション内での位置

結果はJSONの配列形式で、以下のフォーマットで出力してください:
[
  {
    "description": "ターニングポイントの説明",
    "impact": "影響",
    "relativePosition": 0.33
  },
  ...
]
`;

      // AIによる生成を実行
      const response = await apiThrottler.throttledRequest(() => 
        this.geminiClient.generateText(prompt, { responseFormat: "json" })
      );

      // 応答をJSONとしてパース
      try {
        const turningPoints = JSON.parse(response);
        if (Array.isArray(turningPoints)) {
          return turningPoints;
        }
        logger.warn('AI response is not a valid array', { response });
        return this.generateDefaultTurningPoints(section);
      } catch (parseError) {
        logger.error('Failed to parse AI response as JSON', { 
          error: parseError, 
          response 
        });
        return this.generateDefaultTurningPoints(section);
      }
    } catch (error) {
      logger.error('Failed to generate turning points', { error });
      return this.generateDefaultTurningPoints(section);
    }
  }

  /**
   * デフォルトのターニングポイントを生成
   */
  private generateDefaultTurningPoints(
    section: SectionPlot
  ): NarrativeStructureDesign['turningPoints'] {
    return [
      {
        description: `${section.learningJourneyDesign.mainConcept}に関する重要な発見`,
        impact: "登場人物の理解と視点が大きく変わる",
        relativePosition: 0.4
      },
      {
        description: `${section.structure.theme}をめぐる危機や葛藤`,
        impact: "登場人物が行動を変え、新たな方向性を模索する",
        relativePosition: 0.75
      }
    ];
  }

  /**
   * 物語のスレッドを生成
   * 
   * @param section セクション情報
   * @returns 物語のスレッドの配列
   */
  private async generateNarrativeThreads(
    section: SectionPlot
  ): Promise<NarrativeStructureDesign['narrativeThreads']> {
    try {
      // テーマと学習設計に基づいて物語のスレッドを生成
      const theme = section.structure.theme;
      const learning = section.learningJourneyDesign;

      // AIによる物語のスレッドの生成
      const prompt = `
あなたは物語構造設計の専門家です。
以下の情報に基づいて、セクション「${section.structure.title}」の物語スレッド（プロットライン）を2-3つ設計してください。

【セクション情報】
- テーマ: ${theme}
- 主要概念: ${learning.mainConcept}
- 学習段階: ${learning.primaryLearningStage}
- 変容の弧: ${learning.transformationalArc.startingState} → ${learning.transformationalArc.endState}

各スレッドには以下の情報を含めてください:
1. スレッド名: スレッドの種類や焦点
2. 発展プロセス: どのように展開するか

結果はJSONの配列形式で、以下のフォーマットで出力してください:
[
  {
    "thread": "スレッド名",
    "development": "発展プロセス"
  },
  ...
]
`;

      // AIによる生成を実行
      const response = await apiThrottler.throttledRequest(() => 
        this.geminiClient.generateText(prompt, { responseFormat: "json" })
      );

      // 応答をJSONとしてパース
      try {
        const threads = JSON.parse(response);
        if (Array.isArray(threads)) {
          return threads;
        }
        logger.warn('AI response is not a valid array', { response });
        return this.generateDefaultNarrativeThreads(section);
      } catch (parseError) {
        logger.error('Failed to parse AI response as JSON', { 
          error: parseError, 
          response 
        });
        return this.generateDefaultNarrativeThreads(section);
      }
    } catch (error) {
      logger.error('Failed to generate narrative threads', { error });
      return this.generateDefaultNarrativeThreads(section);
    }
  }

  /**
   * デフォルトの物語スレッドを生成
   */
  private generateDefaultNarrativeThreads(
    section: SectionPlot
  ): NarrativeStructureDesign['narrativeThreads'] {
    return [
      {
        thread: `${section.learningJourneyDesign.mainConcept}の理解`,
        development: "概念への初期的な誤解から段階的な理解へと発展する"
      },
      {
        thread: `${section.structure.theme}の探求`,
        development: "テーマの表面的な検討から深い洞察へと発展する"
      },
      {
        thread: "人間関係の変化",
        development: "初期の緊張から協力と相互理解へと発展する"
      }
    ];
  }

  /**
   * 伏線を生成
   * 
   * @param section セクション情報
   * @returns 伏線の配列
   */
  private async generateForeshadowing(
    section: SectionPlot
  ): Promise<NarrativeStructureDesign['sectionForeshadowing']> {
    try {
      // 構造とターニングポイントに基づいて伏線を生成
      const structure = section.structure;
      const narrativePhase = structure.narrativePhase;
      
      // このセクションの後に来るセクションがあるかどうかを確認
      const relationships = this.sectionPlotManager.getSectionRelationship(section.id);
      const hasNextSection = !!relationships.next;

      // AIによる伏線の生成
      const prompt = `
あなたは物語構造設計の専門家です。
以下の情報に基づいて、セクション「${structure.title}」の伏線を2-4つ設計してください。
${hasNextSection ? '次のセクションに回収される伏線も含めてください。' : 'このセクション内で回収される伏線を設計してください。'}

【セクション情報】
- テーマ: ${structure.theme}
- 物語フェーズ: ${narrativePhase}
- 章範囲: ${section.chapterRange.start}〜${section.chapterRange.end}章

各伏線には以下の情報を含めてください:
1. 要素: 伏線の内容
2. 設置ポイント: どの章に設置するか (章番号)
3. 回収予定セクション: 回収するセクション番号 (オプション)

結果はJSONの配列形式で、以下のフォーマットで出力してください:
[
  {
    "element": "伏線の要素",
    "plantingPoint": 5,
    "payoffSection": 2
  },
  ...
]
`;

      // AIによる生成を実行
      const response = await apiThrottler.throttledRequest(() => 
        this.geminiClient.generateText(prompt, { responseFormat: "json" })
      );

      // 応答をJSONとしてパース
      try {
        const foreshadowing = JSON.parse(response);
        if (Array.isArray(foreshadowing)) {
          return foreshadowing;
        }
        logger.warn('AI response is not a valid array', { response });
        return this.generateDefaultForeshadowing(section);
      } catch (parseError) {
        logger.error('Failed to parse AI response as JSON', { 
          error: parseError, 
          response 
        });
        return this.generateDefaultForeshadowing(section);
      }
    } catch (error) {
      logger.error('Failed to generate foreshadowing', { error });
      return this.generateDefaultForeshadowing(section);
    }
  }

  /**
   * デフォルトの伏線を生成
   */
  private generateDefaultForeshadowing(
    section: SectionPlot
  ): NarrativeStructureDesign['sectionForeshadowing'] {
    const { start, end } = section.chapterRange;
    const midPoint = Math.floor((start + end) / 2);
    
    return [
      {
        element: `${section.learningJourneyDesign.mainConcept}に関連する小さな手がかり`,
        plantingPoint: start + 1,
        payoffSection: section.structure.number + 1
      },
      {
        element: `${section.structure.theme}に関連する象徴的な出来事や会話`,
        plantingPoint: midPoint,
        payoffSection: section.structure.number
      }
    ];
  }

  /**
   * 他セクションとの接続を生成
   * 
   * @param section セクション情報
   * @param relations セクションの関係性
   * @returns 他セクションとの接続情報
   */
  private async generateIntersections(
    section: SectionPlot,
    relations: { prev: string | null; next: string | null }
  ): Promise<NarrativeStructureDesign['intersectionWithOtherSections']> {
    try {
      let previousConnection = '';
      let nextConnection = '';

      // 前のセクションがある場合
      if (relations.prev) {
        const prevSection = await this.sectionPlotManager.getSection(relations.prev);
        if (prevSection) {
          previousConnection = `前のセクション「${prevSection.structure.title}」からの${prevSection.structure.theme}の発展と、${section.structure.theme}への移行`;
        } else {
          previousConnection = '前のセクションからの自然な流れ';
        }
      } else {
        previousConnection = '物語の導入としての開始';
      }

      // 次のセクションがある場合
      if (relations.next) {
        const nextSection = await this.sectionPlotManager.getSection(relations.next);
        if (nextSection) {
          nextConnection = `次のセクション「${nextSection.structure.title}」への橋渡しとなる${section.structure.theme}の締めくくりと${nextSection.structure.theme}の示唆`;
        } else {
          nextConnection = '次のセクションへの伏線と布石';
        }
      } else {
        nextConnection = '物語サイクルの締めくくり';
      }

      return {
        previous: previousConnection,
        next: nextConnection
      };
    } catch (error) {
      logger.error('Failed to generate intersections', { error });
      return {
        previous: '前のセクションからの連続性',
        next: '次のセクションへの準備'
      };
    }
  }

  /**
   * 学習段階と章のマッピング
   * 
   * @param sectionId セクションID
   * @returns 章から学習段階へのマッピング
   */
  async mapLearningStageToChapters(sectionId: string): Promise<Map<number, LearningStage>> {
    try {
      logger.info(`Mapping learning stages to chapters for section ${sectionId}`);

      // セクション情報を取得
      const section = await this.sectionPlotManager.getSection(sectionId);
      if (!section) {
        throw new Error(`Section ${sectionId} not found`);
      }

      // 学習設計を取得
      const learning = section.learningJourneyDesign;
      
      // 章範囲を取得
      const { start, end } = section.chapterRange;
      const chapterCount = end - start + 1;
      
      // 結果のマップを初期化
      const resultMap = new Map<number, LearningStage>();
      
      // 主要な学習段階
      const primaryStage = learning.primaryLearningStage;
      
      // 副次的な学習段階
      const secondaryStages = learning.secondaryLearningStages || [];
      
      // 単純なケース: 副次的段階がない場合、すべての章を主要段階にマッピング
      if (secondaryStages.length === 0) {
        for (let chapter = start; chapter <= end; chapter++) {
          resultMap.set(chapter, primaryStage);
        }
        return resultMap;
      }
      
      // 複雑なケース: 学習段階の進行をモデル化
      // セクションを3つの部分に分割
      const firstThird = Math.floor(chapterCount / 3) + start;
      const secondThird = Math.floor(chapterCount * 2 / 3) + start;
      
      // 通常は主要段階から副次的段階への進行を考慮する
      if (secondaryStages.length >= 1) {
        const secondaryStage = secondaryStages[0];
        
        // 最初の部分は主要段階
        for (let chapter = start; chapter < firstThird; chapter++) {
          resultMap.set(chapter, primaryStage);
        }
        
        // 中間部分は混合（ウェイト付け）
        for (let chapter = firstThird; chapter < secondThird; chapter++) {
          // 相対位置に基づいて段階を決定
          const relativePos = (chapter - firstThird) / (secondThird - firstThird);
          resultMap.set(chapter, relativePos < 0.5 ? primaryStage : secondaryStage);
        }
        
        // 最後の部分は副次的段階
        for (let chapter = secondThird; chapter <= end; chapter++) {
          resultMap.set(chapter, secondaryStage);
        }
      }
      
      return resultMap;
    } catch (error) {
      logError(error, { sectionId }, 'Failed to map learning stages to chapters');
      // エラー時は空のマップを返す
      return new Map<number, LearningStage>();
    }
  }

  /**
   * 感情アークを設計
   * 
   * @param sectionId セクションID
   * @returns 感情設計
   */
  async designEmotionalJourney(sectionId: string): Promise<EmotionalDesign> {
    try {
      logger.info(`Designing emotional journey for section ${sectionId}`);

      // セクション情報を取得
      const section = await this.sectionPlotManager.getSection(sectionId);
      if (!section) {
        throw new Error(`Section ${sectionId} not found`);
      }

      // 構造とテーマを取得
      const structure = section.structure;
      const learning = section.learningJourneyDesign;
      
      // 現在の感情設計があれば活用
      const currentEmotional = section.emotionalDesign;
      
      // AIによる感情アークの設計
      const prompt = `
あなたは物語の感情設計の専門家です。
以下の情報に基づいて、セクション「${structure.title}」の感情アークと読者体験を設計してください。

【セクション情報】
- テーマ: ${structure.theme}
- 物語フェーズ: ${structure.narrativePhase}
- 主要概念: ${learning.mainConcept}
- 学習段階: ${learning.primaryLearningStage}
- 変容の弧: ${learning.transformationalArc.startingState} → ${learning.transformationalArc.endState}

感情設計には以下の要素を含めてください:
1. 感情の弧: 開始・中間・結末の感情トーン
2. 緊張ポイント: 2-3つの感情的緊張のポイント（相対位置と強度）
3. カタルシスの瞬間: 感情的解放や洞察の重要な瞬間
4. 読者感情の旅: 全体を通じた読者の感情体験
5. 感情的リターン: 最終的な感情的満足や学び

結果はJSON形式で、次のフォーマットで出力してください:
{
  "emotionalArc": {
    "opening": "開始時の感情トーン",
    "midpoint": "中間点の感情トーン",
    "conclusion": "結末の感情トーン"
  },
  "tensionPoints": [
    {
      "relativePosition": 0.3,
      "intensity": 0.7,
      "description": "緊張ポイントの説明"
    },
    ...
  ],
  "catharticMoment": {
    "relativePosition": 0.85,
    "type": "intellectual",
    "description": "カタルシスの説明"
  },
  "readerEmotionalJourney": "読者の感情的体験の説明",
  "emotionalPayoff": "感情的リターンの説明"
}
`;

      // AIによる生成を実行
      const response = await apiThrottler.throttledRequest(() => 
        this.geminiClient.generateText(prompt, { responseFormat: "json" })
      );

      // 応答をJSONとしてパース
      try {
        const emotionalDesign = JSON.parse(response);
        
        // 基本的な検証
        if (emotionalDesign && 
            emotionalDesign.emotionalArc && 
            emotionalDesign.tensionPoints &&
            emotionalDesign.catharticMoment) {
          
          // 緊張ポイントの相対位置と強度が0〜1の範囲内かを確認して修正
          if (Array.isArray(emotionalDesign.tensionPoints)) {
            emotionalDesign.tensionPoints = emotionalDesign.tensionPoints.map((point: TensionPoint) => ({
              ...point,
              relativePosition: Math.max(0, Math.min(1, point.relativePosition)),
              intensity: Math.max(0, Math.min(1, point.intensity))
            }));
          }
          
          // カタルシスの相対位置を確認して修正
          if (emotionalDesign.catharticMoment) {
            emotionalDesign.catharticMoment.relativePosition = Math.max(0, Math.min(1, 
              emotionalDesign.catharticMoment.relativePosition
            ));
          }
          
          // 結果を更新
          await this.sectionPlotManager.updateSection(sectionId, {
            emotionalDesign
          });
          
          logger.info(`Successfully designed emotional journey for section ${sectionId}`);
          return emotionalDesign;
        }
        
        logger.warn('AI response is not a valid emotional design', { response });
        return currentEmotional;
      } catch (parseError) {
        logger.error('Failed to parse AI response as JSON', { 
          error: parseError, 
          response 
        });
        return currentEmotional;
      }
    } catch (error) {
      logError(error, { sectionId }, 'Failed to design emotional journey');
      
      // セクション情報を取得してデフォルト設計を返す
      try {
        const section = await this.sectionPlotManager.getSection(sectionId);
        if (section) {
          return section.emotionalDesign;
        }
      } catch (getError) {
        // 無視
      }
      
      // 完全にデフォルトの設計を返す
      return {
        emotionalArc: {
          opening: '期待',
          midpoint: '葛藤',
          conclusion: '理解'
        },
        tensionPoints: [
          {
            relativePosition: 0.3,
            intensity: 0.6,
            description: '初期の困難や葛藤'
          },
          {
            relativePosition: 0.7,
            intensity: 0.8,
            description: '解決への道のりでの最大の障害'
          }
        ],
        catharticMoment: {
          relativePosition: 0.85,
          type: 'intellectual',
          description: '主要概念についての重要な洞察'
        },
        readerEmotionalJourney: '混乱から好奇心を経て知的満足へ',
        emotionalPayoff: '概念の深い理解と新たな視点'
      };
    }
  }

  /**
   * キャラクターアークを設計
   * 
   * @param sectionId セクションID
   * @returns キャラクター設計
   */
  async designCharacterArcs(sectionId: string): Promise<CharacterDesign> {
    try {
      logger.info(`Designing character arcs for section ${sectionId}`);

      // セクション情報を取得
      const section = await this.sectionPlotManager.getSection(sectionId);
      if (!section) {
        throw new Error(`Section ${sectionId} not found`);
      }

      // 構造とテーマを取得
      const structure = section.structure;
      const learning = section.learningJourneyDesign;
      const emotion = section.emotionalDesign;
      
      // 現在のキャラクター設計
      const currentCharacters = section.characterDesign;
      const mainCharacters = currentCharacters.mainCharacters.length > 0 
        ? currentCharacters.mainCharacters 
        : ['主人公', 'サブキャラクター1', 'サブキャラクター2'];
      
      // AIによるキャラクターアークの設計
      const prompt = `
あなたは物語のキャラクター設計の専門家です。
以下の情報に基づいて、セクション「${structure.title}」の登場人物の変化と関係性を設計してください。

【セクション情報】
- テーマ: ${structure.theme}
- 主要概念: ${learning.mainConcept}
- 学習段階: ${learning.primaryLearningStage}
- 感情アーク: ${emotion.emotionalArc.opening} → ${emotion.emotionalArc.midpoint} → ${emotion.emotionalArc.conclusion}

【主要キャラクター】
${mainCharacters.map(char => `- ${char}`).join('\n')}

キャラクター設計には以下の要素を含めてください:
1. キャラクターの役割: 各キャラクターの学習における役割と物語機能
2. 関係性の発展: 2-3組のキャラクター間の関係性の変化
3. 個別キャラクターの変容: 各キャラクターの内的変化と成長

結果はJSON形式で、次のフォーマットで出力してください:
{
  "characterRoles": {
    "キャラクター名1": {
      "learningRole": "mentor",
      "narrativeFunction": "機能の説明"
    },
    ...
  },
  "relationshipDevelopments": [
    {
      "characters": ["キャラクター名1", "キャラクター名2"],
      "startingDynamic": "初期関係性",
      "evolution": "発展プロセス",
      "endDynamic": "最終関係性"
    },
    ...
  ],
  "characterTransformations": {
    "キャラクター名1": {
      "startingState": "初期状態",
      "internalObstacles": ["障害1", "障害2"],
      "growthMoments": ["成長の瞬間1", "成長の瞬間2"],
      "endState": "最終状態"
    },
    ...
  }
}
`;

      // AIによる生成を実行
      const response = await apiThrottler.throttledRequest(() => 
        this.geminiClient.generateText(prompt, { responseFormat: "json" })
      );

      // 応答をJSONとしてパース
      try {
        const characterDesign = JSON.parse(response);
        
        // 基本的な検証
        if (characterDesign && 
            characterDesign.characterRoles && 
            characterDesign.relationshipDevelopments &&
            characterDesign.characterTransformations) {
          
          // メインキャラクターリストを保持
          characterDesign.mainCharacters = mainCharacters;
          
          // 結果を更新
          await this.sectionPlotManager.updateSection(sectionId, {
            characterDesign
          });
          
          logger.info(`Successfully designed character arcs for section ${sectionId}`);
          return characterDesign;
        }
        
        logger.warn('AI response is not a valid character design', { response });
        return currentCharacters;
      } catch (parseError) {
        logger.error('Failed to parse AI response as JSON', { 
          error: parseError, 
          response 
        });
        return currentCharacters;
      }
    } catch (error) {
      logError(error, { sectionId }, 'Failed to design character arcs');
      
      // セクション情報を取得してデフォルト設計を返す
      try {
        const section = await this.sectionPlotManager.getSection(sectionId);
        if (section) {
          return section.characterDesign;
        }
      } catch (getError) {
        // 無視
      }
      
      // デフォルトのキャラクター設計を返す
      return {
        mainCharacters: ['主人公', 'サブキャラクター1', 'サブキャラクター2'],
        characterRoles: {
          '主人公': {
            learningRole: 'reflector',
            narrativeFunction: '概念の体験者として読者の代理となる'
          },
          'サブキャラクター1': {
            learningRole: 'mentor',
            narrativeFunction: '知識や導きを提供する'
          },
          'サブキャラクター2': {
            learningRole: 'challenger',
            narrativeFunction: '主人公の理解に挑戦を与える'
          }
        },
        relationshipDevelopments: [
          {
            characters: ['主人公', 'サブキャラクター1'],
            startingDynamic: '懐疑的な関係',
            evolution: '信頼の構築',
            endDynamic: '相互理解と尊敬'
          }
        ],
        characterTransformations: {
          '主人公': {
            startingState: '概念に対する誤解または無知',
            internalObstacles: ['固定観念', '恐れ'],
            growthMoments: ['重要な洞察', '行動の変化'],
            endState: '概念の理解と適用能力'
          }
        }
      };
    }
  }

  /**
   * 章の概要を生成
   * 
   * @param sectionId セクションID
   * @returns 章の概要の配列
   */
  async generateChapterOutlines(sectionId: string): Promise<ChapterOutline[]> {
    try {
      logger.info(`Generating chapter outlines for section ${sectionId}`);

      // セクション情報を取得
      const section = await this.sectionPlotManager.getSection(sectionId);
      if (!section) {
        throw new Error(`Section ${sectionId} not found`);
      }

      // 章の範囲を取得
      const { start, end } = section.chapterRange;
      const chapterCount = end - start + 1;
      
      // 構造と設計を取得
      const structure = section.structure;
      const learning = section.learningJourneyDesign;
      const emotion = section.emotionalDesign;
      const narrative = section.narrativeStructureDesign;
      
      // 学習段階のマッピングを取得
      const learningStageMap = await this.mapLearningStageToChapters(sectionId);
      
      // AIによる章概要の生成
      const prompt = `
あなたは物語の章構成の専門家です。
以下の情報に基づいて、セクション「${structure.title}」の${chapterCount}章分の概要を作成してください。

【セクション情報】
- テーマ: ${structure.theme}
- 主要概念: ${learning.mainConcept}
- 感情アーク: ${emotion.emotionalArc.opening} → ${emotion.emotionalArc.midpoint} → ${emotion.emotionalArc.conclusion}

【重要なシーン】
${narrative.keyScenes.map(scene => `- ${scene.description} (位置: ${scene.relativePosition})`).join('\n')}

【ターニングポイント】
${narrative.turningPoints.map(tp => `- ${tp.description} (位置: ${tp.relativePosition})`).join('\n')}

各章の概要には以下の要素を含めてください:
1. タイトル: 章の内容を反映したタイトル
2. 概要: 100-150文字程度の章の概要
3. 学習段階: その章の主な学習段階
4. 感情トーン: その章の主な感情トーン
5. 重要イベント: その章の重要なイベント（1-2つ）

結果はJSONの配列形式で、各章に対して以下のフォーマットで出力してください:
[
  {
    "chapterNumber": 5,
    "title": "章のタイトル",
    "summary": "章の概要",
    "learningStage": "EXPLORATION",
    "emotionalTone": "好奇心と緊張",
    "keyEvents": ["イベント1", "イベント2"]
  },
  ...
]
`;

      // AIによる生成を実行
      const response = await apiThrottler.throttledRequest(() => 
        this.geminiClient.generateText(prompt, { responseFormat: "json" })
      );

      // 応答をJSONとしてパース
      try {
        const outlines = JSON.parse(response);
        if (Array.isArray(outlines)) {
          // チャプター番号の範囲を修正
          const correctedOutlines = outlines.map((outline, index) => ({
            ...outline,
            chapterNumber: start + index
          }));
          
          logger.info(`Successfully generated ${correctedOutlines.length} chapter outlines for section ${sectionId}`);
          return correctedOutlines;
        }
        
        logger.warn('AI response is not a valid array', { response });
        return this.generateDefaultChapterOutlines(section, learningStageMap);
      } catch (parseError) {
        logger.error('Failed to parse AI response as JSON', { 
          error: parseError, 
          response 
        });
        return this.generateDefaultChapterOutlines(section, learningStageMap);
      }
    } catch (error) {
      logError(error, { sectionId }, 'Failed to generate chapter outlines');
      
      // セクション情報を取得してデフォルト概要を返す
      try {
        const section = await this.sectionPlotManager.getSection(sectionId);
        if (section) {
          const learningStageMap = await this.mapLearningStageToChapters(sectionId);
          return this.generateDefaultChapterOutlines(section, learningStageMap);
        }
      } catch (getError) {
        // 無視
      }
      
      // 空の配列を返す
      return [];
    }
  }

  /**
   * デフォルトの章概要を生成
   */
  private generateDefaultChapterOutlines(
    section: SectionPlot,
    learningStageMap: Map<number, LearningStage>
  ): ChapterOutline[] {
    const { start, end } = section.chapterRange;
    const outlines: ChapterOutline[] = [];
    
    // 感情アークを分解
    const emotionalArc = section.emotionalDesign.emotionalArc;
    const emotions = [emotionalArc.opening, emotionalArc.midpoint, emotionalArc.conclusion];
    
    // 全章について概要を生成
    for (let chapterNumber = start; chapterNumber <= end; chapterNumber++) {
      // 相対位置を計算 (0-1)
      const relativePosition = (chapterNumber - start) / (end - start);
      
      // 感情トーンを相対位置から決定
      let emotionalTone: string;
      if (relativePosition < 0.33) {
        emotionalTone = emotionalArc.opening;
      } else if (relativePosition < 0.66) {
        emotionalTone = emotionalArc.midpoint;
      } else {
        emotionalTone = emotionalArc.conclusion;
      }
      
      // 学習段階をマップから取得、なければ主要段階を使用
      const learningStage = learningStageMap.get(chapterNumber) || section.learningJourneyDesign.primaryLearningStage;
      
      // 章概要を生成
      outlines.push({
        chapterNumber,
        title: `${section.structure.title} - 第${chapterNumber - start + 1}章`,
        summary: `${section.structure.theme}についての探求が続く章です。${section.learningJourneyDesign.mainConcept}の概念が進展し、登場人物は新たな課題に直面します。`,
        learningStage,
        emotionalTone,
        keyEvents: [`${learningStage}段階での${section.learningJourneyDesign.mainConcept}の探求`, `${emotionalTone}の感情を伴う体験`]
      });
    }
    
    return outlines;
  }
}