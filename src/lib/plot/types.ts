// src/lib/plot/types.ts

/**
 * プロットモードの列挙
 */
export enum PlotMode {
    CONCRETE = "CONCRETE",  // 具体的プロット
    MIDTERM = "MIDTERM",
    ABSTRACT = "ABSTRACT", // 抽象的プロット
    HYBRID = "HYBRID",     // ハイブリッド
    TRANSITION_TO_ABSTRACT = "TRANSITION_TO_ABSTRACT", // 具体→抽象への移行
    TRANSITION_TO_CONCRETE = "TRANSITION_TO_CONCRETE"  // 抽象→具体への移行
}

/**
 * 具体的プロットポイントの型定義
 */
export interface ConcretePlotPoint {
    chapterRange: [number, number];    // 適用チャプター範囲
    title: string;                     // プロットタイトル
    summary: string;                   // 概要

    // 追加するフィールド
    phase?: string;                    // 物語フェーズ
    storyArc?: string;                 // このプロットが属するストーリーアーク
    storyGoal?: string;                // この範囲での物語目標
    mustHaveOutcome?: string;          // 必ず達成すべき結果

    keyEvents: string[];               // 重要イベント
    characterFocus: string[];          // 注目キャラクター
    requiredElements: string[];        // 必須要素
    foreshadowing?: string[];          // 伏線（オプション）
}

/**
 * 抽象的プロットガイドラインの型定義
 */
export interface AbstractPlotGuideline {
    phase: string;                     // 物語のフェーズ
    theme: string;                     // テーマ
    emotionalTone: string;             // 感情的トーン

    // 追加するフィールド
    thematicMessage?: string;          // このフェーズで伝えたいメッセージ
    phasePurpose?: string;             // このフェーズの目的

    potentialDirections: string[];     // 可能性のある方向性
    prohibitedElements: string[];      // 避けるべき要素
    chapterRange?: [number, number];   // 適用チャプター範囲（オプション）
    keyCharacters?: string[];          // 焦点を当てるキャラクター（オプション）
}

/**
 * 中期プロットのデータ型
 */
export interface MediumPlot {
    title: string;
    description: string;
    version: number;
    sections: any[];
    learning_elements: {
      name: string;
      description: string;
      section: number;
    }[];
    meta: {
      version: number;
      author: string;
      creation_date: string;
      description: string;
    };
  }

/**
 * 階層的整合性チェック結果の型定義
 */
export interface HierarchicalConsistencyResult {
    consistent: boolean;
    guidance: string;
    issues: Array<{
        level: 'concrete' | 'midTerm' | 'abstract';
        memoryType: 'short' | 'mid' | 'long';
        description: string;
        severity: "LOW" | "MEDIUM" | "HIGH";
        suggestion: string;
    }>;
}

/**
 * プロット戦略の型定義
 */
export interface PlotStrategy {
    globalStrategy: {
        preferredMode: "concrete" | "abstract" | "mixed";
        abstractRatio: number;         // 0-1の間の値
        plotComplexity: "low" | "medium" | "high";
    };
    chapterModeOverrides: Array<{
        chapterRange: [number, number];
        mode: PlotMode;
        reason: string;
    }>;
    arcStrategies: Array<{
        arcName: string;
        strategy: string;
        notes: string;
    }>;
}

/**
 * プロットコンテキストの型定義
 */
export interface PlotContext {
    mode: PlotMode;                    // 現在のプロットモード
    modeInstructions: string;          // モードに応じた指示
    currentArc: {                      // 現在のアーク情報
        name: string;
        theme: string;
        approximateChapters: [number, number];
    };
    shortTermGoals: string[];          // 短期目標
    narrativeContext: string;          // 物語文脈
}

/**
 * 世界設定の型定義
 */
export interface WorldSettings {
    description: string;
    regions?: any[];
    history?: any[];
    rules?: any[];
    genre?: string;

    magicSystem?: any;
    technology?: any;
    socialSystem?: any;
    supernatural?: any[];
    uniqueElements?: any[];
    
    // ビジネスジャンル向けの追加フィールド
    businessSystem?: {
        description?: string;
        rules?: string[];
        [key: string]: any;
    };
    businessElements?: any[];
    
    customFields?: any;
}

/**
 * テーマ情報の型定義
 */
export interface ThemeSettings {
    description: string;
    mainThemes?: string[];
    subThemes?: string[];
    evolution?: any[];
    implementation?: any;
    oppositions?: any[];
    message?: any;
    conclusion?: any;
    customFields?: any;
}

/**
 * 整形済みの世界設定とテーマの型定義
 */
export interface FormattedWorldAndTheme {
    worldSettings: string;
    theme: string;
    worldSettingsDetailed?: WorldSettings;
    themeSettingsDetailed?: ThemeSettings;
}

