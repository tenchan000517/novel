// src\types\generation.ts
/**
 * @fileoverview 生成システム型定義（インポート修正版）
 * @description 新しい型定義構造に対応したインポート修正
 */

// ============================================================================
// 基本型定義
// ============================================================================
import { Character } from './characters';
import { Chapter } from './chapters';

// ============================================================================
// キャラクター関連型（感情・心理分析）
// ============================================================================
import {
    CharacterPsychology,
    EmotionalArcDesign,
    ChapterEmotionAnalysis
} from './characters';

// ============================================================================
// プロット・世界設定型
// ============================================================================
import { WorldSettings, ThemeSettings } from '@/lib/plot/types';

// ============================================================================
// 物語記憶システム専用型（修正）
// ============================================================================
import { NarrativeState } from '@/lib/memory/long-term/types';

// ============================================================================
// 基本メモリ型（永続的イベント）
// ============================================================================
import { PersistentEventsContext } from '@/types/memory';

// ============================================================================
// 学習システム型
// ============================================================================
import {
    LearningStage,
    CatharticExperience,
    EmpatheticPoint,
    EmotionLearningSyncMetrics
} from '@/lib/learning-journey';
/**
 * 小説生成に関連する型定義
 */

import { CorrectionHistoryEntry } from './correction';

/**
 * シーンの種類
 */
export type SceneType = 'INTRODUCTION' | 'DEVELOPMENT' | 'CLIMAX' | 'RESOLUTION' | 'TRANSITION';

/**
 * シーン情報
 */
export interface Scene {
    /** シーンID */
    id: string;

    /** シーンタイプ */
    type: SceneType;

    /** シーンタイトル */
    title?: string;

    /** 開始位置 */
    startPosition: number;

    /** 終了位置 */
    endPosition: number;

    /** 登場キャラクター */
    characters: string[];

    /** シーンの要約 */
    summary?: string;

    /** シーンの感情基調 */
    emotionalTone?: string;

    /** テンションレベル (0-1) */
    tension?: number;

    /** シーンの内容（簡易バージョンとの互換性） */
    content?: string;

    /** 場所（簡易バージョンとの互換性） */
    location?: string;

    /** 時間枠（簡易バージョンとの互換性） */
    timeframe?: string;

    /** シーンの長さ - フェーズ3: シーン構造最適化システム */
    length?: number;

    /** 視点キャラクター - フェーズ3: シーン構造最適化システム */
    pov?: string;
}

/**
 * 詳細なシーン情報 - フェーズ3: シーン構造最適化システム
 */
export interface SceneInfo {
    /** シーンタイトル */
    title: string;

    /** シーンタイプ */
    type: string;

    /** 登場キャラクター */
    characters: string[];

    /** 場所 */
    location: string;

    /** シーンの要約 */
    summary: string;

    /** チャプター番号 */
    chapterNumber: number;

    /** シーンの長さ */
    length?: number;

    /** 視点キャラクター */
    pov?: string;
}

/**
 * シーン構造分析 - フェーズ3: シーン構造最適化システム
 */
export interface SceneStructureAnalysis {
    /** シーンタイプの分布 */
    typeDistribution: { [type: string]: number };

    /** シーン長の分布 */
    lengthDistribution: LengthDistribution;

    /** ペースの変動 */
    paceVariation: number;

    /** 遷移タイプの分析 */
    transitionTypes: TransitionAnalysis;

    /** 視点の分布 */
    povsDistribution?: { [pov: string]: number };
}

/**
 * 長さの分布 - フェーズ3: シーン構造最適化システム
 */
export interface LengthDistribution {
    /** 最小長 */
    min: number;

    /** 最大長 */
    max: number;

    /** 平均長 */
    avg: number;

    /** 標準偏差 */
    stdDev: number;
}

/**
 * 遷移分析 - フェーズ3: シーン構造最適化システム
 */
export interface TransitionAnalysis {
    /** 遷移タイプの分布 */
    types: { [type: string]: number };

    /** 遷移の滑らかさ */
    smoothness: number;
}

/**
 * シーン推奨 - フェーズ3: シーン構造最適化システム
 */
export interface SceneRecommendation {
    /** 推奨タイプ */
    type: string;

    /** 推奨の説明 */
    description: string;

    /** 推奨理由 */
    reason: string;
}

/**
 * キャラクター登場情報
 */
export interface CharacterAppearance {
    /** キャラクターID */
    characterId: string;

    /** キャラクター名 */
    characterName: string;

    /** 登場シーン */
    scenes: string[];

    /** セリフ数 */
    dialogueCount: number;

    /** 重要度 (0-1) */
    significance: number;

    /** 行動（簡易バージョンとの互換性） */
    actions?: string[];

    /** 感情（簡易バージョンとの互換性） */
    emotions?: string[];
}

/**
 * テーマ出現情報
 */
export interface ThemeOccurrence {
    /** テーマID */
    themeId: string;

    /** テーマ名 */
    themeName: string;

    /** 関連表現 */
    expressions: string[];

    /** 強度 (0-1) */
    strength: number;

    /** テーマ（簡易バージョンとの互換性） */
    theme?: string;

    /** コンテキスト（簡易バージョンとの互換性） */
    contexts?: string[];
}

/**
 * 伏線要素
 */
export interface ForeshadowingElement {
    /** 伏線ID */
    id: string;

    /** 伏線の説明 */
    description: string;

    /** テキスト位置 */
    position: number;

    /** 伏線のテキスト */
    text: string;

    /** 予定回収チャプター範囲 */
    plannedResolutionChapter?: [number, number];

    /** 関連キャラクター */
    relatedCharacters?: string[];

    /** 要素（簡易バージョンとの互換性） */
    element?: string;

    /** チャプター（簡易バージョンとの互換性） */
    chapter?: number;

    /** 解決チャプター（簡易バージョンとの互換性） */
    resolutionChapter?: number;

    /** 解決済みフラグ（簡易バージョンとの互換性） */
    isResolved?: boolean;
}

/**
 * 伏線統合度評価 - フェーズ3: 伏線統合度評価と導入手法の多様化
 */
export interface ForeshadowingEvaluation {
    /** 自然さ (1-10) */
    naturalness: number;

    /** 明示性 (1-10) - 低いほど微妙、高いほど明白 */
    explicitness: number;

    /** 統合度 (1-10) - 物語の他の要素との有機的な結びつき */
    integration: number;

    /** 導入方法 */
    method: string;

    /** 強み */
    strengths: string[];

    /** 弱点 */
    weaknesses: string[];
}

/**
 * 伏線導入手法提案 - フェーズ3: 伏線統合度評価と導入手法の多様化
 */
export interface ForeshadowingMethodSuggestion {
    /** 導入手法 */
    method: string;

    /** 手法の説明 */
    description: string;

    /** 具体例 */
    examples: string[];
}

/**
 * 品質メトリクス
 */
export interface QualityMetrics {
    /** 読みやすさ (0-1) */
    readability: number;

    /** 一貫性 (0-1) */
    consistency: number;

    /** 引き込み度 (0-1) */
    engagement: number;

    /** キャラクター描写 (0-1) */
    characterDepiction: number;

    /** オリジナリティ (0-1) */
    originality: number;

    /** 総合スコア (0-1) */
    overall: number;

    /** 整合性（簡易バージョンとの互換性） */
    coherence?: number;

    /** キャラクター一貫性（簡易バージョンとの互換性） */
    characterConsistency?: number;

    /** 詳細データ（拡張版） */
    details?: any;
}

/**
 * 問題と修正情報
 */
export interface IssueAndFix {
    /** 問題の種類 */
    issueType: string;

    /** 問題の説明 */
    issueDescription: string;

    /** 修正内容 */
    fixDescription: string;

    /** 修正前テキスト */
    originalText?: string;

    /** 修正後テキスト */
    correctedText?: string;
}

/**
 * 文体分析結果 - フェーズ2: 文体の適応的最適化システム
 */
export interface StyleAnalysis {
    /** 平均文長 */
    avgSentenceLength: number;

    /** 文のバラエティ度 */
    sentenceVariety: number;

    /** 語彙の豊かさ */
    vocabularyRichness: number;

    /** 語りの視点（一人称・三人称など） */
    narrativeVoice?: string;

    /** 時制の一貫性 (0-1) */
    tenseConsistency?: number;

    /** 感情のバランス（ポジティブ・ネガティブのバランス、0-1） */
    sentimentBalance?: number;

    /** リズム分析 */
    rhythm?: number;

    /** 複雑語の使用数 */
    complexWords?: number;

    /** 文体の特徴的なパターン */
    patterns?: string[];

    /** 主語の多様性スコア */
    subjectDiversityScore?: number;
}

/**
 * 文体ガイダンス - フェーズ2: 文体の適応的最適化システム
 */
export interface StyleGuidance {
    /** 一般的なアドバイス */
    general: string[];

    /** 文構造に関するアドバイス */
    sentenceStructure: string[];

    /** 語彙に関するアドバイス */
    vocabulary: string[];

    /** 文のリズムに関するアドバイス */
    rhythm: string[];

    /** 具体例 */
    examples?: StyleExample[];
}

// 具体例のインターフェース
interface StyleExample {
    before: string;
    after: string;
}

/**
 * 表現パターン - フェーズ2: 言語パターン多様化エンジン
 */
export interface ExpressionPatterns {
    /** カテゴリー別の表現パターン */
    [category: string]: {
        /** 表現 */
        expression: string;

        /** 出現頻度 */
        frequency: number;
    }[];
}

/**
 * 代替表現提案 - フェーズ2: 言語パターン多様化エンジン
 */
export interface ExpressionAlternatives {
    // 具体的なカテゴリ（StyleOptimizationService の実装に合わせる）
    verbAlternatives?: { [expression: string]: string[] };
    adjectiveAlternatives?: { [expression: string]: string[] };
    dialogueAlternatives?: { [expression: string]: string[] };
    conjunctionAlternatives?: { [expression: string]: string[] };
    structureAlternatives?: { [expression: string]: string[] };
    
    // 拡張性のための汎用カテゴリ
    [category: string]: { [expression: string]: string[] } | undefined;
  }

/**
 * 読者体験分析 - フェーズ4: 読者体験メタ分析システム
 */
export interface ReaderExperienceAnalysis {
    /** 興味維持度 (1-10) */
    interestRetention: number;

    /** 感情移入度 (1-10) */
    empathy: number;

    /** 理解度 (1-10) */
    clarity: number;

    /** 予想外度 (1-10) */
    unexpectedness: number;

    /** 続きへの期待度 (1-10) */
    anticipation: number;

    /** 総合スコア (1-10) */
    overallScore: number;

    /** 弱点 */
    weakPoints: {
        /** 問題点 */
        point: string;

        /** 改善提案 */
        suggestion?: string;
    }[];

    /** 強み */
    strengths: string[];
}

/**
 * 文学的インスピレーション - フェーズ4: 文学的比較分析システム
 */
export interface LiteraryInspiration {
    /** プロット展開手法 */
    plotTechniques: LiteraryTechnique[];

    /** キャラクター描写手法 */
    characterTechniques: LiteraryTechnique[];

    /** 雰囲気構築手法 */
    atmosphereTechniques: LiteraryTechnique[];
}

/**
 * 文学的テクニック - フェーズ4: 文学的比較分析システム
 */
export interface LiteraryTechnique {
    /** 手法名 */
    technique: string;

    /** 説明 */
    description: string;

    /** 具体例 */
    example: string;

    /** 参考作品 */
    reference: string;
}

/**
 * テーマ共鳴分析 - フェーズ5: テーマ共鳴分析と深化システム
 */
export interface ThemeResonanceAnalysis {
    /** テーマごとの分析 */
    themes: {
        [themeName: string]: {
            /** 明示的な言及 */
            explicitMentions: string[];

            /** 暗示的な表現 */
            implicitExpressions: string[];

            /** 表現強度 (1-10) */
            strength: number;

            /** 表現方法 */
            expressionMethods: string[];

            /** 関連テーマ */
            relatedThemes: string[];

            /** 具体的な表現 */
            expressions?: string[];
        };
    };

    /** 全体的な一貫性 (1-10) */
    overallCoherence: number;

    /** 主要テーマ */
    dominantTheme: string;

    /** テーマの緊張関係 */
    themeTensions: {
        /** テーマの組み合わせごとの緊張度 (1-10) */
        [themeCombo: string]: number;
    };
}

/**
 * 軽視されているテーマ - フェーズ5: テーマ共鳴分析と深化システム
 */
export interface NeglectedTheme {
    /** テーマ名 */
    name: string;

    /** 現在の強度 */
    strength: number;

    /** 現在の表現 */
    currentExpressions: string[];
}

/**
 * テーマ強化提案 - フェーズ5: テーマ共鳴分析と深化システム
 */
export interface ThemeEnhancement {
    /** テーマ */
    theme: string;

    /** 提案 */
    suggestion: string;

    /** アプローチ */
    approaches: string[];
}

/**
 * テンション推奨 - フェーズ5: ダイナミックテンション最適化アルゴリズム
 */
export interface TensionRecommendation {
    /** 推奨テンション値 */
    recommendedTension: number;

    /** 推奨理由 */
    reason: string;

    /** 方向性 */
    direction: "increase" | "decrease" | "maintain" | "establish";
}

/**
 * ペーシング推奨 - フェーズ5: ダイナミックテンション最適化アルゴリズム
 */
export interface PacingRecommendation {
    /** 推奨ペーシング値 */
    recommendedPacing: number;

    /** 説明 */
    description: string;
}

/**
 * テンション・ペーシング推奨 - フェーズ5: ダイナミックテンション最適化アルゴリズム
 */
export interface TensionPacingRecommendation {
    /** テンション推奨 */
    tension: TensionRecommendation;

    /** ペーシング推奨 */
    pacing: PacingRecommendation;
}

/**
 * チャプター分析
 */
export interface ChapterAnalysis {
    /** キャラクター登場 */
    characterAppearances: CharacterAppearance[];

    /** テーマ出現 */
    themeOccurrences: ThemeOccurrence[];

    /** 伏線要素 */
    foreshadowingElements: ForeshadowingElement[];

    /** 品質メトリクス */
    qualityMetrics: QualityMetrics;

    /** 検出された問題 */
    detectedIssues?: IssueAndFix[];

    /** プロット整合性情報 */
    plotConsistency?: {
        consistent: boolean;
        issueCount: number;
        majorIssues: number;
    };

    /** キャラクター心理情報 */
    characterPsychologies?: { [id: string]: CharacterPsychology };

    /** 文体分析結果 */
    styleAnalysis?: StyleAnalysis;

    /** 表現パターン */
    expressionPatterns?: ExpressionPatterns;

    /** テーマ共鳴分析 */
    themeResonance?: ThemeResonanceAnalysis;

    /** テーマ強化提案 */
    themeEnhancements?: ThemeEnhancement[];

    /** テンションレベル */
    tensionLevel?: number;

    /** テンション要因 */
    tensionFactors?: string[];

    /** 読者体験分析 */
    readerExperience?: ReaderExperienceAnalysis;

    /** フェーズ1: 感情アークの設計システム */
    emotionAnalysis?: ChapterEmotionAnalysis;

    /** フェーズ3: 伏線統合度評価 */
    foreshadowingEvaluation?: ForeshadowingEvaluation;

    /** フェーズ3: シーン構造分析 */
    sceneStructureAnalysis?: SceneStructureAnalysis;

    /** 「魂のこもった学びの物語」システムの分析結果 - null許容 */
    learningJourney?: {
        /** 感情分析結果 */
        emotionAnalysis?: {
            overallTone: string;
            emotionalImpact: number;
            emotionalDimensions?: any;
        } | null | undefined;
        /** 感情と学習の同期メトリクス */
        syncMetrics?: EmotionLearningSyncMetrics | null | undefined;
    } | null | undefined;

    metadata?: ChapterMetadata;
    textStats?: TextStatistics;
    scenes?: Scene[]; // ← これを追加！！🎯

}

export interface TextStatistics {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    averageSentenceLength: number;
    dialoguePercentage?: number; // ← optionalにする
}

export interface ChapterMetadata {
    title: string;
    summary: string;
    keywords: string[];
}


/**
 * 生成結果
 */
export interface GenerationResult {
    /** 生成されたチャプター */
    chapter: Chapter;

    /** 生成メトリクス */
    metrics: {
        /** 生成時間（ミリ秒） */
        generationTime: number;

        /** 品質スコア */
        qualityScore: number;

        /** 修正数 */
        correctionCount: number;
    };

    /** 生成に使用されたコンテキスト */
    usedContext?: {
        shortTermSummary: string;
        midTermSummary: string;
        activeCharacters: string[];
    };
}

/**
 * キャラクターの成長情報の型定義
 */
export interface CharacterGrowthInfo {
    mainCharacters: Array<{
        id: string;
        name: string;
        description: string;
        emotionalState: string;
        skills: Array<{
            name: string;
            level: number;
        }>;
        parameters: Array<{
            name: string;
            value: number;
        }>;
        growthPhase: string | null;
    }>;
    supportingCharacters: Array<{
        id: string;
        name: string;
        description: string;
        emotionalState: string;
        skills: Array<{
            name: string;
            level: number;
        }>;
        parameters: Array<{
            name: string;
            value: number;
        }>;
        growthPhase: string | null;
    }>;
}

// LearningJourney情報の型定義
export interface LearningJourneyContext {
    /** 主要概念名 */
    mainConcept: string;
    /** 学習段階 */
    learningStage: LearningStage;
    /** 体現化プラン */
    embodimentPlan?: any;
    /** 感情アーク設計 */
    emotionalArc?: EmotionalArcDesign;
    /** カタルシス体験 */
    catharticExperience?: CatharticExperience;
    /** 共感ポイント */
    empatheticPoints?: EmpatheticPoint[];
    /** シーン推奨 */
    sceneRecommendations?: any[];
}


/**
 * 小説生成に必要なコンテキスト情報インターフェース
 */
export interface GenerationContext {
    /** 章番号 */
    chapterNumber?: number;

    /** 章の総数 */
    totalChapters?: number;

    /** 前の章のコンテンツ */
    previousChapterContent?: string;

    /** 前の章のタイトル */
    previousChapterTitle?: string;

    /** 最近の章の情報 */
    recentChapters?: Array<{
        number: number;
        title: string;
        summary: string;
    }>;

    /** 目標文字数 */
    targetLength?: number;

    /** 語り口調（「一人称視点」「三人称視点」など） */
    narrativeStyle?: string;

    /** 語りのトーン（「明るい」「暗い」「シリアス」など） */
    tone?: string;

    /** 物語のテーマ */
    theme?: string;

    /** テンション値 (0-1) */
    tension?: number;

    /** ペーシング値 (0-1) */
    pacing?: number;

    /** 世界設定 */
    worldSettings?: string;

    /** 登場キャラクター情報 */
    characters?: Character[];

    /** 重点的に描写すべきキャラクター */
    focusCharacters?: (string | { name: string })[];

    /** 物語の文脈（これまでの展開） */
    storyContext?: string;

    /** 伏線情報 */
    foreshadowing?: any[];

    /** 矛盾情報 */
    contradictions?: any[];

    /** この章で扱うべきプロットポイント */
    plotPoints?: string[];

    /** 表現上の制約 */
    expressionConstraints?: string[];

    /** 前章からの改善提案 */
    improvementSuggestions?: string[];

    // 追加: 重要イベント情報
    significantEvents?: {
        locationHistory: string[];
        characterInteractions: string[];
        warningsAndPromises: string[];
    };

    /** 物語状態情報 */
    narrativeState?: {
        /** 現在の物語状態 */
        state: NarrativeState;
        /** アークが完了したかどうか */
        arcCompleted?: boolean;
        /** 停滞が検出されたかどうか */
        stagnationDetected?: boolean;
        /** 現在の状態が続いている章数 */
        duration?: number;
        /** 推奨される次の状態 */
        suggestedNextState?: NarrativeState;
        /** 推奨される展開方向 */
        recommendations?: string[];
        /** 時間帯 */
        timeOfDay?: string;
        /** 場所 */
        location?: string;
        /** 天候 */
        weather?: string;

        // 新しく追加するプロパティ
        presentCharacters?: string[]; // 現在のシーンに登場しているキャラクター

        tensionLevel?: number; // テンションレベル
    };

    /** 中期記憶情報 */
    midTermMemory?: {
        /** 現在のアーク情報 */
        currentArc?: {
            /** アーク名 */
            name: string;
            /** アークの章範囲 */
            chapter_range?: {
                /** 開始章 */
                start: number;
                /** 終了章 (-1は未定義) */
                end: number;
            };
        };
    };

    /** ストーリー進行ガイダンス */
    storyProgressionGuidance?: {
        required: boolean;
        suggestions: string[];
    };

    /** フェーズ1: 深層キャラクター心理モデル */
    characterPsychology?: { [id: string]: CharacterPsychology };

    /** フェーズ1: 感情アークの設計システム */
    emotionalArc?: EmotionalArcDesign;

    /** フェーズ2: 文体の適応的最適化システム */
    styleAnalysis?: StyleAnalysis;
    styleGuidance?: StyleGuidance;

    /** フェーズ2: 言語パターン多様化エンジン */
    expressionPatterns?: ExpressionPatterns;
    alternativeExpressions?: ExpressionAlternatives;

    /** フェーズ3: 伏線統合度評価と導入手法の多様化 */
    foreshadowingEvaluation?: ForeshadowingEvaluation;
    foreshadowingMethodSuggestions?: ForeshadowingMethodSuggestion[];

    /** フェーズ3: シーン構造最適化システム */
    sceneStructureAnalysis?: SceneStructureAnalysis;
    sceneRecommendations?: SceneRecommendation[];

    /** フェーズ4: 読者体験メタ分析システム */
    readerExperience?: ReaderExperienceAnalysis;

    /** フェーズ4: 文学的比較分析システム */
    literaryInspirations?: LiteraryInspiration;

    /** フェーズ5: テーマ共鳴分析と深化システム */
    themeResonance?: ThemeResonanceAnalysis;
    themeEnhancements?: ThemeEnhancement[];

    /** フェーズ5: ダイナミックテンション最適化アルゴリズム */
    tensionRecommendation?: TensionRecommendation;
    pacingRecommendation?: PacingRecommendation;

    // continuityGuidance?: ContinuityGuidance;

    /** 永続的イベント情報 */
    persistentEvents?: PersistentEventsContext;

    // 新規追加: キャラクター成長情報
    characterGrowthInfo?: CharacterGrowthInfo;

    /** プロット指示（物語の骨格） */
    plotDirective?: string;

    worldSettingsData?: WorldSettings | null;  // null も許容するように修正
    themeSettingsData?: ThemeSettings | null;  // null も許容するように修正


    genre?: string; // 物語のジャンル情報

    /** 学習旅程関連情報 - 「魂のこもった学びの物語」システム */
    learningJourney?: LearningJourneyContext;

    /** 生の学習旅程プロンプト - プロンプト生成時のみの内部利用 */
    rawLearningJourneyPrompt?: string;

    /** 追加コンテキスト */
    additionalContext?: {
        [key: string]: any;
    };

    /** 世界コンテキスト */
    worldContext?: string;

    /** テーマコンテキスト */
    themeContext?: string;

    /** セクションコンテキスト */
    sectionContext?: {
        id: string;
        title: string;
        theme: string;
        narrativePhase: string;
        chapterPosition: string;
        relativePosition: number;
        motifs: string[];
        emotionalTone: string;
        emotionalArc: any;
        emotionalJourney: string;
        mainConcept: string;
        learningStage: string;
        learningObjectives: any;
        keyScenes: any[];
        turningPoints: any[];
        sectionThreads: string[];
        mainCharacters: any[];
    } | null;
}



/**
 * 生成オプション
 */
export interface GenerationOptions {
    /** 目標文字数 */
    targetLength?: number;

    /** 温度パラメータ */
    temperature?: number;

    /** 頻度ペナルティ */
    frequencyPenalty?: number;

    /** 存在ペナルティ */
    presencePenalty?: number;

    /** 停止シーケンス */
    stopSequences?: string[];

    /** システム指示 */
    systemInstruction?: string;

    /** 応答フォーマット */
    responseFormat?: 'text' | 'json' | 'markdown';

    /** モデル名 */
    model?: string;

    /** 生成の用途（モデル選択に影響） */
    purpose?: string;

    /** 安全性設定 */
    safetySettings?: Array<{
        category: string;
        threshold: string;
    }>;

    /** 上書き設定 */
    overrides?: {
        /** TopK パラメータ */
        topK?: number;

        /** TopP パラメータ */
        topP?: number;

        /** テンション (物語生成特有) */
        tension?: number;

        /** ペーシング (物語生成特有) */
        pacing?: number;

        /** モデル名 */
        model?: string;

        /** その他の拡張パラメータ */
        [key: string]: any;
    };
}

/**
 * 生成リクエスト
 */
export interface GenerationRequest {
    /** ターゲットチャプター番号 */
    chapterNumber: number;

    /** 目標文字数 */
    targetLength?: number;

    /** 強制生成フラグ */
    forcedGeneration?: boolean;

    /** 上書き設定 */
    overrides?: {
        tension?: number;
        pacing?: number;
        topP?: number;
        frequencyPenalty?: number;
        presencePenalty?: number;
        model?: string;
    };
}

/**
 * チャプター生成リクエスト（APIドキュメント互換）
 */
export interface GenerateChapterRequest {
    /** 目標文字数 */
    targetLength?: number;

    /** 強制生成フラグ */
    forcedGeneration?: boolean;

    /** 上書き設定 */
    overrides?: {
        /** テンション上書き */
        tension?: number;

        /** ペース上書き */
        pacing?: number;

        /** TopK パラメータ */
        topK?: number;

        /** TopP パラメータ */
        topP?: number;

        /** 頻度ペナルティ */
        frequencyPenalty?: number;

        /** 存在ペナルティ */
        presencePenalty?: number;

        /** モデル名 */
        model?: string;
    };

    /** 前章の分析結果 */
    previousAnalysis?: any;

    /** 改善提案の配列 */
    improvementSuggestions?: string[];

    /** テーマ強化提案の配列 - フェーズ5: テーマ共鳴分析と深化システム */
    themeEnhancements?: ThemeEnhancement[];

    // continuityGuidance?: ContinuityGuidance;

    /** 学習旅程プロンプト - 「魂のこもった学びの物語」システム */
    learningJourneyPrompt?: string | null;

    /** 学習旅程システム - 「魂のこもった学びの物語」システム */
    learningJourneySystem?: any;
}

/**
 * チャプター生成レスポンス（APIドキュメント互換）
 */
export interface GenerateChapterResponse {
    /** 生成されたチャプター */
    chapter: Chapter;

    /** 生成メトリクス */
    metrics: {
        generationTime: number;
        qualityScore: number;
        correctionCount: number;
    };
    plotInfo?: {
        mode: string;
        currentArc: string;
        currentTheme: string;
        shortTermGoals: string[];
        nextExpectedEvent?: string;
    };
    /** 統合記憶階層システム特有のメトリクス */
    memoryProcessingMetrics?: {
        processingTime: number;
        totalOperationTime: number;
        systemOptimizationApplied: boolean;
    };
}

/**
 * コンテキスト取得クエリパラメータ（APIドキュメント互換）
 */
export interface ContextQueryParams {
    chapterNumber?: number;
    detailed?: boolean;
}

/**
 * コンテキストレスポンス（APIドキュメント互換）
 */
export interface ContextResponse {
    shortTerm: any;
    midTerm: any;
    longTerm: any;
    characterStates: any[];
    expressionConstraints: any[];
}

/**
 * チャプター検証リクエスト（APIドキュメント互換）
 */
export interface ValidateChapterRequest {
    content: string;
    chapterNumber: number;
}

/**
 * チャプター検証レスポンス（APIドキュメント互換）
 */
export interface ValidateChapterResponse {
    isValid: boolean;
    issues: any[];
    suggestions: any[];
    qualityScore: QualityMetrics;
}