/**
 * ビジネス概念の学習段階
 */
export enum LearningStage {
    MISCONCEPTION = 'MISCONCEPTION',   // 誤解段階
    EXPLORATION = 'EXPLORATION',       // 探索段階
    CONFLICT = 'CONFLICT',             // 葛藤段階
    INSIGHT = 'INSIGHT',               // 洞察段階
    APPLICATION = 'APPLICATION',       // 応用段階
    INTEGRATION = 'INTEGRATION'        // 統合段階
  }
  
  /**
   * 学習記録
   */
  export interface LearningRecord {
    stage: LearningStage;          // 学習段階
    chapterNumber: number;         // 記録された章番号
    timestamp: string;             // 記録日時
    insight?: string;              // 得られた洞察
    examples?: string[];           // 実例
  }
  
  /**
   * 変容要素
   */
  export interface TransformationalElement {
    description: string;           // 変容要素の説明
    fromStage: LearningStage;      // 開始段階
    toStage: LearningStage;        // 目標段階
    catalysts: string[];           // 変容触媒
  }
  
  /**
   * ビジネス概念
   */
  export interface BusinessConcept {
    id: string;                    // 概念ID
    name: string;                  // 概念名
    description: string;           // 概念説明
    category: string;              // カテゴリ
    misconceptions: string[];      // 一般的な誤解
    examples: string[];            // 実例
    relatedConcepts: string[];     // 関連概念
    transformationalElements: TransformationalElement[]; // 変容要素
    learningJourney?: LearningRecord[]; // 学習の旅の記録
  }