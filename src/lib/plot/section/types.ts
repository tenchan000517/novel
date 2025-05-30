// src/lib/plot/section/types.ts
/**
 * @fileoverview 中期プロット（篇）システムの型定義
 * @description
 * 章単位の具体的プロットと全体的な抽象プロットの中間に位置する
 * 「篇（セクション）」システムのための型定義を提供します。
 */
import { LearningStage } from '@/lib/learning-journey/concept-learning-manager';

/**
 * @interface SectionPlot
 * @description 章をまとめる「篇（セクション）」の中期プロット情報
 */
export interface SectionPlot {
  /** セクションの一意識別子 */
  id: string;
  
  /** 章の範囲 */
  chapterRange: {
    start: number;
    end: number;
  };
  
  /** セクションの構造的要素 */
  structure: SectionStructure;
  
  /** 学習関連要素 */
  learningJourneyDesign: LearningJourneyDesign;
  
  /** 感情関連要素 */
  emotionalDesign: EmotionalDesign;
  
  /** キャラクター関連要素 */
  characterDesign: CharacterDesign;
  
  /** 物語構造関連要素 */
  narrativeStructureDesign: NarrativeStructureDesign;
  
  /** メタ情報 */
  metaInformation: MetaInformation;
}

/**
 * @interface SectionPlotParams
 * @description セクションプロット作成のためのパラメータ
 */
export interface SectionPlotParams {
  /** タイトル */
  title: string;
  
  /** 章の範囲 */
  chapterRange: {
    start: number;
    end: number;
  };
  
  /** 物語のフェーズ */
  narrativePhase: string;
  
  /** 中心テーマ */
  theme: string;
  
  /** 主要な概念 */
  mainConcept: string;
  
  /** 中心となる学習段階 */
  primaryLearningStage: LearningStage;
  
  /** モチーフ（オプション） */
  motifs?: string[];
  
  /** 主要舞台設定（オプション） */
  setting?: string;
  
  /** 主要キャラクター（オプション） */
  mainCharacters?: string[];
  
  /** 編集者メモ（オプション） */
  editorNotes?: string;
}

/**
 * @interface SectionStructure
 * @description セクションの構造的要素
 */
export interface SectionStructure {
  /** セクションID */
  id: string;
  
  /** セクションタイトル */
  title: string;
  
  /** セクション番号 */
  number: number;
  
  /** 章範囲 */
  chapterRange: {
    start: number;
    end: number;
  };
  
  /** 物語の段階 */
  narrativePhase: string;
  
  /** 中心テーマ */
  theme: string;
  
  /** モチーフ・象徴 */
  motifs: string[];
  
  /** 主要舞台設定 */
  setting: string;
}

/**
 * @interface LearningJourneyDesign
 * @description 学習関連要素
 */
export interface LearningJourneyDesign {
  /** 主要概念 */
  mainConcept: string;
  
  /** 副次的概念 */
  secondaryConcepts: string[];
  
  /** 中心となる学習段階 */
  primaryLearningStage: LearningStage;
  
  /** 副次的学習段階 */
  secondaryLearningStages: LearningStage[];
  
  /** 学習目標 */
  learningObjectives: {
    /** 認知的目標 */
    cognitive: string;
    
    /** 感情的目標 */
    affective: string;
    
    /** 行動的目標 */
    behavioral: string;
  };
  
  /** 変容の弧 */
  transformationalArc: {
    /** 初期状態 */
    startingState: string;
    
    /** 乗り越える課題 */
    challenges: string[];
    
    /** 得るべき洞察 */
    insights: string[];
    
    /** 終着点 */
    endState: string;
  };
  
  /** 概念の体現方法 */
  conceptEmbodiments: {
    /** 使用するメタファー */
    metaphors: string[];
    
    /** 具体的な状況 */
    situations: string[];
    
    /** 対話テーマ */
    dialogueThemes: string[];
  };
}

export interface EmotionalCurvePoint {
    chapter: number;
    emotion: string;
    tension: number;
  }

/**
 * @interface EmotionalDesign
 * @description 感情関連要素
 */
export interface EmotionalDesign {
  /** 感情の弧 */
  emotionalArc: {
    /** 開始時のトーン */
    opening: EmotionalTone;
    
    /** 中間点のトーン */
    midpoint: EmotionalTone;
    
    /** 結末のトーン */
    conclusion: EmotionalTone;
  };
  
  /** 緊張ポイント */
  tensionPoints: Array<{
    /** 相対位置（0-1） */
    relativePosition: number;
    
    /** 強度（0-1） */
    intensity: number;
    
    /** 説明 */
    description: string;
  }>;
  
  /** カタルシスの瞬間 */
  catharticMoment: {
    /** 相対位置 */
    relativePosition: number;
    
    /** タイプ */
    type: 'intellectual' | 'emotional' | 'moral' | 'transformative';
    
    /** 説明 */
    description: string;
  };
  
  /** 読者が辿る感情の旅 */
  readerEmotionalJourney: string;
  
  /** 感情的リターン */
  emotionalPayoff: string;
}

/**
 * @interface CharacterDesign
 * @description キャラクター関連要素
 */
export interface CharacterDesign {
  /** 主要キャラクター */
  mainCharacters: string[];
  
  /** キャラクターの役割 */
  characterRoles: Record<string, {
    /** 学習における役割 */
    learningRole: 'mentor' | 'challenger' | 'reflector' | 'supporter';
    
    /** 物語機能 */
    narrativeFunction: string;
  }>;
  
  /** 関係性の発展 */
  relationshipDevelopments: Array<{
    /** 関係するキャラクター */
    characters: [string, string];
    
    /** 初期関係性 */
    startingDynamic: string;
    
    /** 発展プロセス */
    evolution: string;
    
    /** 最終関係性 */
    endDynamic: string;
  }>;
  
  /** 個別キャラクターの変容 */
  characterTransformations: Record<string, {
    /** 初期状態 */
    startingState: string;
    
    /** 内的障害 */
    internalObstacles: string[];
    
    /** 成長の瞬間 */
    growthMoments: string[];
    
    /** 最終状態 */
    endState: string;
  }>;
}

/**
 * @interface NarrativeStructureDesign
 * @description 物語構造関連要素
 */
export interface NarrativeStructureDesign {
  /** 重要シーン */
  keyScenes: Array<{
    /** 説明 */
    description: string;
    
    /** 目的 */
    purpose: string;
    
    /** 相対位置 */
    relativePosition: number;
    
    /** 学習との関連 */
    learningConnection: string;
  }>;
  
  /** ターニングポイント */
  turningPoints: Array<{
    /** 説明 */
    description: string;
    
    /** 影響 */
    impact: string;
    
    /** 相対位置 */
    relativePosition: number;
  }>;
  
  /** 物語のスレッド */
  narrativeThreads: Array<{
    /** スレッド名 */
    thread: string;
    
    /** 発展プロセス */
    development: string;
  }>;
  
  /** 伏線 */
  sectionForeshadowing: Array<{
    /** 要素 */
    element: string;
    
    /** 設置ポイント */
    plantingPoint: number;
    
    /** 回収予定セクション */
    payoffSection?: number;
  }>;
  
  /** 他セクションとの接続 */
  intersectionWithOtherSections: {
    /** 前セクションとの接続 */
    previous: string;
    
    /** 次セクションとの接続 */
    next: string;
  };
}

/**
 * @interface MetaInformation
 * @description メタ情報要素
 */
export interface MetaInformation {
  /** 作成日時 */
  created: string;
  
  /** 最終更新日時 */
  lastModified: string;
  
  /** バージョン */
  version: number;
  
  /** 編集者メモ */
  editorNotes: string;
  
  /** 生成に使用したプロンプト */
  generationPrompts: string[];
  
  /** 全体ストーリーとの関係 */
  relationToOverallStory: string;
}

/**
 * @type EmotionalTone
 * @description 感情トーン
 */
export type EmotionalTone = string;

/**
 * @interface CoherenceAnalysis
 * @description 一貫性分析結果
 */
export interface CoherenceAnalysis {
  /** 全体的な一貫性スコア (0-10) */
  overallScore: number;
  
  /** 問題のある領域 */
  problematicAreas: Array<{
    /** 問題の種類 */
    type: 'theme' | 'character' | 'plot' | 'setting' | 'tone';
    
    /** 説明 */
    description: string;
    
    /** 深刻度 (0-10) */
    severity: number;
  }>;
  
  /** 改善提案 */
  improvementSuggestions: string[];
}

/**
 * @interface ObjectiveProgress
 * @description 学習目標達成度分析結果
 */
export interface ObjectiveProgress {
  /** 認知的目標の達成度 (0-1) */
  cognitiveProgress: number;
  
  /** 感情的目標の達成度 (0-1) */
  affectiveProgress: number;
  
  /** 行動的目標の達成度 (0-1) */
  behavioralProgress: number;
  
  /** 具体的な例 */
  examples: Array<{
    /** 目標タイプ */
    objectiveType: 'cognitive' | 'affective' | 'behavioral';
    
    /** 例の説明 */
    description: string;
    
    /** 章番号 */
    chapterNumber: number;
  }>;
  
  /** 達成のギャップ */
  gaps: string[];
}

/**
 * @interface EmotionalArcProgress
 * @description 感情アーク実現度分析結果
 */
export interface EmotionalArcProgress {
  /** 全体的な実現度 (0-1) */
  overallRealization: number;
  
  /** 感情的弧の段階ごとの実現度 */
  stageRealization: {
    /** 開始部分の実現度 (0-1) */
    opening: number;
    
    /** 中間点の実現度 (0-1) */
    midpoint: number;
    
    /** 結末部分の実現度 (0-1) */
    conclusion: number;
  };
  
  /** 緊張ポイントの実現 */
  tensionPointsRealization: Array<{
    /** 計画された緊張ポイント */
    planned: {
      /** 相対位置 */
      relativePosition: number;
      
      /** 強度 */
      intensity: number;
      
      /** 説明 */
      description: string;
    };
    
    /** 実際の緊張ポイント */
    actual: {
      /** 実際の章 */
      chapter: number;
      
      /** 実際の強度 */
      intensity: number;
      
      /** 実際の説明 */
      description: string;
    } | null;
  }>;
  
  /** カタルシスの実現 */
  catharticRealization: {
    /** 実現されたか */
    realized: boolean;
    
    /** 実際の章 */
    actualChapter?: number;
    
    /** 説明 */
    description?: string;
  };
}

/**
 * @interface ImprovementSuggestion
 * @description 改善提案
 */
export interface ImprovementSuggestion {
  /** 改善領域 */
  area: 'theme' | 'character' | 'learning' | 'emotion' | 'plot' | 'pacing';
  
  /** 提案内容 */
  suggestion: string;
  
  /** 対象章範囲 */
  targetChapters: number[];
  
  /** 優先度 (1-5) */
  priority: number;
}

/**
 * @interface ChapterOutline
 * @description 章の概要
 */
export interface ChapterOutline {
  /** 章番号 */
  chapterNumber: number;
  
  /** タイトル */
  title: string;
  
  /** 概要 */
  summary: string;
  
  /** 学習段階 */
  learningStage: LearningStage;
  
  /** 感情トーン */
  emotionalTone: EmotionalTone;
  
  /** 重要イベント */
  keyEvents: string[];
}