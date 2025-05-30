// src/lib/learning-journey/story-transformation-designer.ts

/**
 * @fileoverview 物語変容設計
 * @description
 * 物語構造と篇・章の管理を行うコンポーネント。
 * 学習段階に応じた最適なシーン構造の推奨、物語テンションの調整を担当する。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { EventBus } from './event-bus';
import { LearningStage } from './concept-learning-manager';
import { memoryManager } from '@/lib/memory/manager';

/**
 * 篇情報を表す型
 */
export interface Section {
  id: string;                  // 篇ID
  number: number;              // 篇番号
  title: string;               // 篇タイトル
  theme: string;               // 篇テーマ
  mainConcept: string;         // 主要概念
  startChapter: number;        // 開始章
  endChapter: number;          // 終了章
  learningGoal: string;        // 学習目標
  transformationGoal: string;  // 変容目標
  emotionalGoal: string;       // 感情目標
  created: string;             // 作成日時
  updated: string;             // 更新日時
}

/**
 * シーン推奨を表す型
 */
export interface SceneRecommendation {
  type: string;                // 推奨タイプ
  description: string;         // 説明
  reason: string;              // 理由
}

/**
 * テンション推奨を表す型
 */
export interface TensionRecommendation {
  recommendedTension: number;  // 推奨テンション (0-1)
  reason: string;              // 理由
  direction: 'increase' | 'decrease' | 'maintain' | 'peak' | 'establish'; // 方向
}

/**
 * @class StoryTransformationDesigner
 * @description
 * 物語構造と篇・章の管理を行うクラス。
 * SectionManagerとLearningSceneDesignerを統合したもの。
 */
export class StoryTransformationDesigner {
  private sections: Map<string, Section> = new Map();
  private initialized: boolean = false;
  
  /**
   * コンストラクタ
   * @param geminiClient AIによる生成支援用クライアント
   * @param eventBus イベントバス
   */
  constructor(
    private geminiClient: GeminiClient,
    private eventBus: EventBus
  ) {
    logger.info('StoryTransformationDesigner created');
  }

  /**
   * 初期化する
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.info('StoryTransformationDesigner already initialized');
      return;
    }

    try {
      logger.info('Initializing StoryTransformationDesigner...');
      
      // WorldKnowledgeから既存セクションを読み込む
      const worldKnowledge = memoryManager.getLongTermMemory();
      const settings = worldKnowledge.getWorldSettings();
      
      if (settings.narrativeSections && Array.isArray(settings.narrativeSections)) {
        this.sections = new Map(
          settings.narrativeSections.map((section: Section) => [section.id, section])
        );
        logger.info(`Loaded ${this.sections.size} sections from WorldKnowledge`);
      } else {
        // 既存データがなければ初期篇構造を生成
        await this.generateInitialSections();
      }
      
      this.initialized = true;
      logger.info('StoryTransformationDesigner initialized successfully');
      
      // 初期化完了イベント発行
      this.eventBus.publish('story.designer.initialized', {
        sectionCount: this.sections.size
      });
    } catch (error) {
      logger.error('Failed to initialize StoryTransformationDesigner', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 初期篇構造を生成する
   */
  private async generateInitialSections(): Promise<void> {
    try {
      logger.info('Generating initial sections');
      
      // 初期篇構造の定義
      const initialSections: Section[] = [
        {
          id: 'section-1',
          number: 1,
          title: '覚醒',
          theme: '起業の原点と初期の挑戦',
          mainConcept: 'ISSUE DRIVEN',
          startChapter: 1,
          endChapter: 5,
          learningGoal: '課題起点思考の基礎を理解する',
          transformationGoal: '自己中心から顧客中心への視点転換',
          emotionalGoal: '混乱から好奇心への感情的変化',
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        },
        {
          id: 'section-2',
          number: 2,
          title: '探求',
          theme: '顧客理解と価値創造',
          mainConcept: 'ISSUE DRIVEN',
          startChapter: 6,
          endChapter: 10,
          learningGoal: '顧客の本質的課題を探る方法を習得する',
          transformationGoal: '表面的ニーズへの対応から本質的課題の探求へ',
          emotionalGoal: '混乱と葛藤を経て気づきへと至る感情プロセス',
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        },
        {
          id: 'section-3',
          number: 3,
          title: '変容',
          theme: '組織づくりとリーダーシップ',
          mainConcept: 'ISSUE DRIVEN',
          startChapter: 11,
          endChapter: 15,
          learningGoal: '課題起点のアプローチを組織に浸透させる方法を学ぶ',
          transformationGoal: '個人的な実践から組織的な浸透へ',
          emotionalGoal: '気づきを実践する中での自信と成長の感情',
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        }
      ];
      
      // 篇をMapに格納
      for (const section of initialSections) {
        this.sections.set(section.id, section);
      }
      
      // WorldKnowledgeに保存
      const worldKnowledge = memoryManager.getLongTermMemory();
      await worldKnowledge.updateWorldSettings({
        narrativeSections: Array.from(this.sections.values())
      });
      
      logger.info(`Generated ${initialSections.length} initial sections`);
    } catch (error) {
      logger.error('Failed to generate initial sections', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 篇を取得する
   * @param sectionId 篇ID
   * @returns 篇情報、見つからない場合はnull
   */
  getSection(sectionId: string): Section | null {
    this.ensureInitialized();
    return this.sections.get(sectionId) || null;
  }

  /**
   * 章番号から篇を取得する
   * @param chapterNumber 章番号
   * @returns 篇情報、見つからない場合はnull
   */
  getSectionByChapter(chapterNumber: number): Section | null {
    this.ensureInitialized();
    
    for (const section of this.sections.values()) {
      if (chapterNumber >= section.startChapter && chapterNumber <= section.endChapter) {
        return section;
      }
    }
    
    return null;
  }

  /**
   * すべての篇を取得する
   * @returns 篇情報の配列
   */
  getAllSections(): Section[] {
    this.ensureInitialized();
    return Array.from(this.sections.values())
      .sort((a, b) => a.number - b.number);
  }

  /**
   * 新しい篇を作成する
   * @param section 篇情報
   * @returns 作成された篇ID
   */
  async createSection(section: Omit<Section, 'id' | 'created' | 'updated'>): Promise<string> {
    this.ensureInitialized();
    
    // IDの生成
    const id = `section-${section.number}`;
    
    // 既存の同じ番号の篇をチェック
    const existingSection = this.getAllSections().find(s => s.number === section.number);
    if (existingSection) {
      logger.warn(`Section with number ${section.number} already exists, will be overwritten`);
    }
    
    // 新しい篇オブジェクトを作成
    const newSection: Section = {
      id,
      ...section,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    
    // 篇を保存
    this.sections.set(id, newSection);
    
    // WorldKnowledgeに保存
    const worldKnowledge = memoryManager.getLongTermMemory();
    await worldKnowledge.updateWorldSettings({
      narrativeSections: Array.from(this.sections.values())
    });
    
    // イベント発行
    this.eventBus.publish('section.created', {
      sectionId: id,
      sectionNumber: section.number
    });
    
    logger.info(`Created section with ID ${id} and number ${section.number}`);
    return id;
  }

  /**
   * 篇を更新する
   * @param sectionId 篇ID
   * @param updates 更新情報
   * @returns 更新成功の真偽値
   */
  async updateSection(
    sectionId: string,
    updates: Partial<Omit<Section, 'id' | 'created' | 'updated'>>
  ): Promise<boolean> {
    this.ensureInitialized();
    
    // 更新対象の篇を取得
    const section = this.getSection(sectionId);
    if (!section) {
      logger.warn(`Cannot update section: Section with ID ${sectionId} not found`);
      return false;
    }
    
    // 篇を更新
    const updatedSection: Section = {
      ...section,
      ...updates,
      updated: new Date().toISOString()
    };
    
    // 更新された篇を保存
    this.sections.set(sectionId, updatedSection);
    
    // WorldKnowledgeに保存
    const worldKnowledge = memoryManager.getLongTermMemory();
    await worldKnowledge.updateWorldSettings({
      narrativeSections: Array.from(this.sections.values())
    });
    
    // イベント発行
    this.eventBus.publish('section.updated', {
      sectionId,
      sectionNumber: updatedSection.number
    });
    
    logger.info(`Updated section with ID ${sectionId}`);
    return true;
  }

  /**
   * 学習段階に適したシーン推奨を生成する
   * @param conceptName 概念名
   * @param stage 学習段階
   * @param chapterNumber 章番号
   * @returns シーン推奨の配列
   */
  async generateSceneRecommendations(
    conceptName: string,
    stage: LearningStage,
    chapterNumber: number
  ): Promise<SceneRecommendation[]> {
    try {
      logger.info(`Generating scene recommendations for concept ${conceptName} at stage ${stage}`);
      
      // 章が属する篇を取得
      const section = this.getSectionByChapter(chapterNumber);
      
      if (!section) {
        logger.warn(`No section found for chapter ${chapterNumber}, using default settings`);
        return this.getDefaultSceneRecommendations(stage);
      }
      
      // 学習段階に応じたシーンパターンを取得
      const stagePattern = this.getStageSpecificScenePattern(stage);
      
      // テンション推奨を生成
      const tensionRecommendation = this.generateTensionRecommendation(stage);
      
      // シーン推奨を生成
      const sceneRecommendations: SceneRecommendation[] = [
        {
          type: 'LEARNING_SPECIFIC',
          description: `${this.formatLearningStage(stage)}段階に適した「${stagePattern.scenePattern}」を含めてください`,
          reason: `概念「${conceptName}」の${this.formatLearningStage(stage)}を効果的に表現するため`
        },
        {
          type: 'ESSENTIAL_ELEMENTS',
          description: `以下の要素を含めてください: ${stagePattern.keyElements.join('、 ')}`,
          reason: `${this.formatLearningStage(stage)}段階の重要な要素を確実に含めるため`
        },
        {
          type: 'TENSION_LEVEL',
          description: `テンションレベルを${Math.round(tensionRecommendation.recommendedTension * 10)}に設定し、${tensionRecommendation.direction}の方向性を持たせてください`,
          reason: tensionRecommendation.reason
        },
        {
          type: 'SECTION_THEME',
          description: `篇のテーマ「${section.theme}」を反映させてください`,
          reason: `物語全体の一貫性を保つため`
        },
        {
          type: 'TRANSFORMATION_GOAL',
          description: `この篇の変容目標「${section.transformationGoal}」に沿った変化を含めてください`,
          reason: `篇を通した成長の流れを作るため`
        }
      ];
      
      // イベント発行
      this.eventBus.publish('scene.recommendations.generated', {
        conceptName,
        stage,
        chapterNumber,
        recommendationsCount: sceneRecommendations.length
      });
      
      return sceneRecommendations;
    } catch (error) {
      logger.error(`Failed to generate scene recommendations for ${conceptName}`, {
        error: error instanceof Error ? error.message : String(error),
        stage,
        chapterNumber
      });
      
      // エラー時はデフォルト推奨を返す
      return this.getDefaultSceneRecommendations(stage);
    }
  }

  /**
   * テンション推奨を生成する
   * @param stage 学習段階
   * @returns テンション推奨
   */
  generateTensionRecommendation(stage: LearningStage): TensionRecommendation {
    // 学習段階に応じた推奨テンションを生成
    switch (stage) {
      case LearningStage.MISCONCEPTION:
        return {
          recommendedTension: 0.6,
          reason: "誤解段階では、キャラクターが概念の限界に直面し始める緊張感を表現",
          direction: "increase"
        };
        
      case LearningStage.EXPLORATION:
        return {
          recommendedTension: 0.5,
          reason: "探索段階では、新しい視点を探る好奇心と既存理解への執着の間の穏やかな緊張感を表現",
          direction: "maintain"
        };
        
      case LearningStage.CONFLICT:
        return {
          recommendedTension: 0.75,
          reason: "葛藤段階では、相反する視点の間での内的・外的な緊張感を高めに設定",
          direction: "increase"
        };
        
      case LearningStage.INSIGHT:
        return {
          recommendedTension: 0.8,
          reason: "気づき段階では、重要な洞察が得られる瞬間の感動的な緊張感を表現",
          direction: "peak"
        };
        
      case LearningStage.APPLICATION:
        return {
          recommendedTension: 0.65,
          reason: "応用段階では、新たな理解を実践する過程での集中と適度な緊張感を表現",
          direction: "maintain"
        };
        
      case LearningStage.INTEGRATION:
        return {
          recommendedTension: 0.5,
          reason: "統合段階では、概念が自然に体現される安定感と次のステップへの期待感のバランスを表現",
          direction: "maintain"
        };
        
      default:
        return {
          recommendedTension: 0.6,
          reason: "学習プロセスに適した一般的な緊張感を維持",
          direction: "maintain"
        };
    }
  }

  /**
   * 篇の情報に基づいた章構造を設計する
   * @param sectionId 篇ID
   * @returns 章構造の配列
   */
  async designChapterStructure(sectionId: string): Promise<Array<{
    chapterNumber: number;
    suggestedTitle: string;
    learningFocus: string;
    recommendedTension: number;
  }>> {
    try {
      logger.info(`Designing chapter structure for section ${sectionId}`);
      
      // 篇情報を取得
      const section = this.getSection(sectionId);
      if (!section) {
        logger.warn(`Section with ID ${sectionId} not found, cannot design chapter structure`);
        return [];
      }
      
      // 章の数を計算
      const chapterCount = section.endChapter - section.startChapter + 1;
      
      // 章構造を生成
      const chapterStructure = [];
      
      // テンションカーブを設計
      const tensionPoints = this.designTensionCurve(chapterCount);
      
      // 章ごとに情報を設定
      for (let i = 0; i < chapterCount; i++) {
        const chapterNumber = section.startChapter + i;
        const progress = i / (chapterCount - 1); // 0から1の進行度
        
        const suggestedTitle = await this.generateChapterTitle(
          section, 
          chapterNumber, 
          progress
        );
        
        chapterStructure.push({
          chapterNumber,
          suggestedTitle,
          learningFocus: this.generateLearningFocus(section, progress),
          recommendedTension: tensionPoints[i]
        });
      }
      
      // イベント発行
      this.eventBus.publish('chapter.structure.designed', {
        sectionId,
        chapterCount
      });
      
      return chapterStructure;
    } catch (error) {
      logger.error(`Failed to design chapter structure for section ${sectionId}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      
      return [];
    }
  }

  /**
   * 章タイトルを生成する
   * @param section 篇情報
   * @param chapterNumber 章番号
   * @param progress 進行度（0-1）
   * @returns 章タイトル
   */
  private async generateChapterTitle(
    section: Section,
    chapterNumber: number,
    progress: number
  ): Promise<string> {
    // 簡易実装: 進行度に応じたデフォルトタイトルを返す
    if (progress < 0.33) {
      return `${section.title}の始まり`;
    } else if (progress < 0.66) {
      return `${section.title}の展開`;
    } else {
      return `${section.title}の転機`;
    }
    
    // 本来はAIを使用してコンテキストに応じたタイトルを生成
  }

  /**
   * 学習フォーカスを生成する
   * @param section 篇情報
   * @param progress 進行度（0-1）
   * @returns 学習フォーカス
   */
  private generateLearningFocus(section: Section, progress: number): string {
    // 進行度に応じて学習フォーカスを変える
    if (progress < 0.25) {
      return `${section.mainConcept}の誤解段階から探索段階への導入`;
    } else if (progress < 0.5) {
      return `${section.mainConcept}への理解を深める探索`;
    } else if (progress < 0.75) {
      return `${section.mainConcept}に関する葛藤と気づき`;
    } else {
      return `${section.mainConcept}の応用と統合に向けた準備`;
    }
  }

  /**
   * テンションカーブを設計する
   * @param chapterCount 章の数
   * @returns 各章のテンション値の配列
   */
  private designTensionCurve(chapterCount: number): number[] {
    const tensionPoints: number[] = [];
    
    // シンプルな上昇カーブの場合
    for (let i = 0; i < chapterCount; i++) {
      // 0.5から0.85までの値でカーブを形成
      const baseValue = 0.5 + (0.35 * i / (chapterCount - 1));
      
      // 変化に若干のランダム性を持たせる
      const randomVariation = (Math.random() * 0.1) - 0.05;
      const tensionValue = Math.max(0.3, Math.min(0.9, baseValue + randomVariation));
      
      tensionPoints.push(parseFloat(tensionValue.toFixed(2)));
    }
    
    return tensionPoints;
  }

  /**
   * 学習段階に適したシーンパターンを取得する
   * @param stage 学習段階
   * @returns シーンパターン情報
   */
  private getStageSpecificScenePattern(stage: LearningStage): {
    sceneType: string;
    scenePattern: string;
    keyElements: string[];
  } {
    switch (stage) {
      case LearningStage.MISCONCEPTION:
        return {
          sceneType: 'PROBLEM_DEMONSTRATION',
          scenePattern: '問題実証パターン',
          keyElements: [
            '誤解に基づく行動とその結果',
            '既存パラダイムの限界を示す要素',
            '違和感や疑問の初期的な兆し',
            '表面的な解決の試みとその失敗'
          ]
        };
        
      case LearningStage.EXPLORATION:
        return {
          sceneType: 'NEW_PERSPECTIVE',
          scenePattern: '新しい視点パターン',
          keyElements: [
            '新たな視点や情報との出会い',
            '疑問の発生と探索行動',
            '好奇心を刺激する要素',
            '既存の理解への疑問'
          ]
        };
        
      case LearningStage.CONFLICT:
        return {
          sceneType: 'PERSPECTIVE_CLASH',
          scenePattern: '視点衝突パターン',
          keyElements: [
            '異なる視点間の対立',
            '内的葛藤の表現',
            '価値観の再評価',
            '決断を迫られる状況'
          ]
        };
        
      case LearningStage.INSIGHT:
        return {
          sceneType: 'REALIZATION',
          scenePattern: '閃きパターン',
          keyElements: [
            '気づきの瞬間',
            '視界が広がる体験',
            '新たな理解の言語化',
            'パラダイムシフトの表現'
          ]
        };
        
      case LearningStage.APPLICATION:
        return {
          sceneType: 'PRACTICAL_TEST',
          scenePattern: '実践テストパターン',
          keyElements: [
            '新しい理解の実践機会',
            '意識的な適用プロセス',
            '成果の確認',
            'フィードバックと調整'
          ]
        };
        
      case LearningStage.INTEGRATION:
        return {
          sceneType: 'NATURAL_EXPRESSION',
          scenePattern: '自然表現パターン',
          keyElements: [
            '概念の自然な表現',
            '他者への伝達',
            '無意識的な体現',
            '次のレベルへの示唆'
          ]
        };
        
      default:
        return {
          sceneType: 'LEARNING_SCENE',
          scenePattern: '学習基本パターン',
          keyElements: [
            '概念の理解と適用',
            '学びの機会',
            '内省と気づき',
            '成長の表現'
          ]
        };
    }
  }

  /**
   * デフォルトのシーン推奨を取得する
   * @param stage 学習段階
   * @returns シーン推奨の配列
   */
  private getDefaultSceneRecommendations(stage: LearningStage): SceneRecommendation[] {
    const stagePattern = this.getStageSpecificScenePattern(stage);
    const tensionRecommendation = this.generateTensionRecommendation(stage);
    
    return [
      {
        type: 'LEARNING_SPECIFIC',
        description: `${this.formatLearningStage(stage)}段階に適した「${stagePattern.scenePattern}」を含めてください`,
        reason: `${this.formatLearningStage(stage)}を効果的に表現するため`
      },
      {
        type: 'ESSENTIAL_ELEMENTS',
        description: `以下の要素を含めてください: ${stagePattern.keyElements.join('、 ')}`,
        reason: `${this.formatLearningStage(stage)}段階の重要な要素を確実に含めるため`
      },
      {
        type: 'TENSION_LEVEL',
        description: `テンションレベルを${Math.round(tensionRecommendation.recommendedTension * 10)}に設定してください`,
        reason: tensionRecommendation.reason
      }
    ];
  }

  /**
   * 初期化済みかどうかを確認し、必要に応じて初期化する
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('StoryTransformationDesigner is not initialized. Call initialize() first.');
    }
  }

  /**
   * 学習段階を日本語表記で取得
   * @param stage 学習段階
   * @returns 日本語表記
   */
  private formatLearningStage(stage: LearningStage): string {
    const japaneseStages: {[key in LearningStage]?: string} = {
      [LearningStage.MISCONCEPTION]: '誤解',
      [LearningStage.EXPLORATION]: '探索',
      [LearningStage.CONFLICT]: '葛藤',
      [LearningStage.INSIGHT]: '気づき',
      [LearningStage.APPLICATION]: '応用',
      [LearningStage.INTEGRATION]: '統合'
    };
    
    return japaneseStages[stage] || stage;
  }
}