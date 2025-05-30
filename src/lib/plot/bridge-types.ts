// src/lib/plot/bridge-types.ts

import { EmotionalCurvePoint } from '@/lib/memory/types';
import { KeyEvent } from '@/types/memory';
import { NarrativeStateInfo } from '@/lib/memory/narrative/types';
/**
 * @interface ChapterDirectives
 * @description 章の生成に必要な具体的な指示情報
 */
export interface ChapterDirectives {
  chapterGoal: string;              // 章の目標
  requiredPlotElements: string[];   // 必須のプロット要素
  currentLocation: string;          // 現在の場所
  currentSituation: string;         // 現在の状況
  activeCharacters: CharacterState[]; // 活動中のキャラクター
  worldElementsFocus: string[];     // 焦点を当てる世界設定要素
  thematicFocus: string[];          // 焦点を当てるテーマ的要素
  suggestedScenes?: string[];       // 提案されるシーン（オプション）
  narrativeState?: NarrativeStateInfo; // 物語状態情報
  tension?: number;                 // 緊張度 (1-10)
  emotionalGoal?: string;           // 感情的目標
  emotionalCurve?: EmotionalCurvePoint[]; // 感情曲線
}

/**
 * @interface CharacterState
 * @description キャラクターの現在の状態
 */
export interface CharacterState {
  name: string;                     // キャラクター名
  currentState: string;             // 現在の状態
  role: string;                     // 章での役割
  goals?: string[];                 // 目標
  conflicts?: string[];             // 葛藤
  relationshipFocus?: string[];     // 焦点を当てる関係性
  development?: string;             // 発展方向
}

/**
 * @interface LocationInfo
 * @description 場所の情報
 */
export interface LocationInfo {
  name: string;                     // 場所の名前
  description: string;              // 場所の説明
  atmosphere: string;               // 雰囲気
  significance: string;             // 重要性
}

/**
 * @interface ThematicElement
 * @description テーマ的要素
 */
export interface ThematicElement {
  theme: string;                    // テーマ
  expression: string;               // 表現方法
  significance: string;             // 重要性
}

/**
 * @interface StoryGenerationContext
 * @description 物語生成に必要なコンテキスト情報
 */
export interface StoryGenerationContext {
  chapterNumber: number;            // 章番号
  plotElements: {                   // プロット要素
    concrete: any;                  // 具体的プロット
    abstract: any;                  // 抽象的プロット
    midTerm?: any;                  // 中期プロット
  };
  memoryElements: {
    shortTerm: {
      recentChapters: any[];
      currentChapter: any;
      importantEvents: KeyEvent[]; // KeyEvent型を使用
    };
    midTerm: {
      currentArc: any;
    };
    longTerm: {
      summaries: any[];
    };
    narrativeState: NarrativeStateInfo;
  };
  worldSettings: any;               // 世界設定
  themeSettings: any;               // テーマ設定
  phaseInfo?: any;                  // 物語フェーズ情報
}

/**
 * @interface BridgeAnalysisResult
 * @description ブリッジによる分析結果
 */
export interface BridgeAnalysisResult {
  plotProgressAlignment: number;     // プロット進行の一致度 (0-1)
  suggestedAdjustments: string[];    // 提案される調整
  keyElementsForNext: string[];      // 次に重要な要素
  narrativeDirection: string;        // 物語の方向性
  tensionProjection: number;         // 緊張度の予測 (1-10)
  continuityElements?: string[];     // 継続性を保つべき要素
  recommendedPacing?: string;        // 推奨されるペース
}

/**
 * @interface PromptElements
 * @description プロンプトに挿入する要素
 */
export interface PromptElements {
  CHAPTER_GOAL: string;
  REQUIRED_PLOT_ELEMENTS: string;
  CURRENT_LOCATION: string;
  CURRENT_SITUATION: string;
  ACTIVE_CHARACTERS: string;
  WORLD_ELEMENTS_FOCUS: string;
  THEMATIC_FOCUS: string;
  [key: string]: string;            // インデックスシグネチャでその他のプレースホルダーにも対応
}

/**
 * @interface PlotProgressInfo
 * @description プロットの進行状況に関する情報
 */
export interface PlotProgressInfo {
  completedElements: string[];      // 完了したプロット要素
  pendingElements: string[];        // 未完了のプロット要素
  progressPercentage: number;       // 進行度割合 (0-1)
  currentFocus: string;             // 現在の焦点
  nextMilestone?: string;           // 次のマイルストーン
}