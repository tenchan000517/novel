import { MemoryLevel, MemoryRequestType } from '@/lib/memory/core/types';

/**
 * キャラクターモジュールの型定義
 */

/**
 * キャラクターの種類を表す型
 * MAIN: メインキャラクター
 * SUB: サブキャラクター
 * MOB: モブキャラクター
 */
export type CharacterType = 'MAIN' | 'SUB' | 'MOB';

/**
 * キャラクターの役割を表す型
 */
export type CharacterRole = 'PROTAGONIST' | 'ANTAGONIST' | 'MENTOR' | 'ALLY' | 'RIVAL' | 'OTHER';

/**
 * 感情状態を表す型
 */
export type EmotionalState = 'HAPPY' | 'SAD' | 'ANGRY' | 'FEARFUL' | 'NEUTRAL' | 'EXCITED' | 'CONFUSED' | 'DETERMINED' | 'CONCERNED';

/**
 * 関係性の種類を表す型
 */
export type RelationshipType =
    'PARENT' | 'CHILD' | 'MENTOR' | 'STUDENT' | 'LEADER' | 'FOLLOWER' |
    'LOVER' | 'PROTECTOR' | 'PROTECTED' | 'FRIEND' | 'ENEMY' | 'RIVAL' |
    'COLLEAGUE' | 'NEUTRAL';

/**
 * 性格特性の定義
 */
export interface PersonalityTraits {
    /** 特性のリスト（例: "勇敢", "慎重", "明るい"など） */
    traits: string[];

    /** 言葉使いや話し方のパターン */
    speechPatterns?: string[];

    /** 特徴的な癖や習慣 */
    quirks?: string[];

    /** 重要視する価値観 */
    values?: string[];

    /** 動的な性格特性（発展処理で使用） */
    [key: string]: any;
}

/**
 * キャラクターの外見に関する定義
 */
export interface Appearance {
    /** 物理的特徴の説明 */
    physicalDescription: string;

    /** 特徴的な衣装や装飾品 */
    clothing: string;

    /** 際立った特徴 */
    distinguishingFeatures: string[];
}

/**
 * キャラクターの背景設定
 */
export interface Backstory {
    /** 背景の概要 */
    summary: string;

    /** 重要な過去の出来事 */
    significantEvents: string[];

    /** 過去のトラウマや影響を受けた出来事 */
    trauma?: string[];

    /** 生い立ちに関する情報 */
    origin?: string;

    /** 詳細な歴史 (昇格時に生成) */
    detailedHistory?: string;

    /** 動機 (昇格時に生成) */
    motivations?: string;

    /** 秘密 (昇格時に生成) */
    secrets?: string;
}

/**
 * キャラクター間の関係性
 */
export interface Relationship {
    /** 関係のある相手のキャラクターID */
    targetId: string;

    /** 関係を持つ相手の名前 */
    targetName?: string;

    /** 関係の種類 */
    type: RelationshipType;

    /** 関係の強さ（0-1） */
    strength: number;

    /** 関係の説明 */
    description?: string;

    /** 最後のインタラクション */
    lastInteraction?: Date;

    /** 関係の履歴 */
    history?: any[];
}

/**
 * 登場記録
 */
export interface CharacterAppearance {
    chapterNumber: number;
    timestamp: Date;
    significance: number;
    summary?: string;
    emotionalImpact?: number;
}

/**
 * インタラクション記録
 */
export interface Interaction {
    chapterNumber: number;
    targetCharacterId: string;
    type: string;
    description: string;
    impact: number;
    timestamp: Date;
}

/**
 * 発展マイルストーン
 */
export interface DevelopmentMilestone {
    stage: number;
    description: string;
    achievedAt?: Date;
    chapterNumber?: number;
}

/**
 * キャラクターの履歴
 */
export interface CharacterHistory {
    appearances: CharacterAppearance[];
    interactions: Interaction[];
    developmentPath: DevelopmentMilestone[];
}

/**
 * キャラクターの状態
 */
export interface CharacterState {
    isActive: boolean;
    relationships?: Relationship[];
    developmentStage: number;
    lastAppearance: number | null;
    emotionalState: EmotionalState;
    summary?: string;
    significance?: number;
    hasDialogue?: boolean;
    changes?: CharacterChangeInfo[];
    development: string;
    isDeceased?: boolean;              // 死亡状態
    maritalStatus?: string;            // 結婚状態
    spouseId?: string | null;          // 配偶者ID
    parentIds?: string[];              // 親キャラクターID
    childrenIds?: string[];            // 子キャラクターID
    skills?: string[];                 // 習得スキル
    location?: string;                 // 現在地
    lastStateChange?: {                // 最終状態変化
        type: string;
        chapterNumber: number;
        description: string;
    };
    parameters?: CharacterParameter[];
    skill?: Array<{
        skillId: string;
        acquired: Date;
        level: number;
        proficiency: number; // 0-100 習熟度
    }>;
    activeGrowthPlanId?: string;
    completedGrowthPlans?: string[];
    growthPhaseHistory?: Array<{
        phaseId: string;
        startedAt: Date;
        completedAt?: Date;
        chapterStart: number;
        chapterEnd?: number;
    }>;

    promotionHistory?: Array<{
        chapter: number;
        title: string;
        description: string;
        timestamp: string;
    }>;

    injuries?: Array<{
        id: string;
        description: string;
        severity: 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
        chapter: number;
        isHealed: boolean;
        timestamp: string;
    }>;

    health?: number; // 0-100の健康状態

    transformations?: Array<{
        type: string;
        description: string;
        chapter: number;
        isPermanent: boolean;
        timestamp: string;
    }>;

    forms?: Array<{
        name: string;
        description: string;
        acquiredInChapter: number;
    }>;

    currentForm?: string; // 現在の形態
}

/**
 * キャラクター変化情報
 */
export interface CharacterChangeInfo {
    attribute: string;
    previousValue: any;
    currentValue: any;
    classification?: {
        type: string;
        scope: string;
        confidence: number;
        explanation: string;
        narrativeSignificance?: number;
    };
}

/**
 * 昇格履歴
 */
export interface PromotionRecord {
    fromType: CharacterType;
    toType: CharacterType;
    timestamp: Date;
    reason?: string;
}

/**
 * キャラクターメタデータ
 */
export interface CharacterMetadata {
    createdAt: Date;
    lastUpdated: Date;
    version?: number;
    tags?: string[];
    /** 永続的イベント履歴 */
    persistentEvents?: Array<{
        type: string;
        chapterNumber: number;
        description: string;
    }>;
}

/**
 * スキル定義型
 */
export interface Skill {
    id: string;
    name: string;
    description: string;
    level: number;         // 0: 未習得, 1-5: 初級〜伝説級
    requiredParameters: Array<{
        parameterId: string;
        minValue: number;    // このパラメータの最小必要値
    }>;
    prerequisites: string[]; // 前提スキルID
    effects: Array<{
        targetId: string;    // 影響するパラメータID
        modifier: number;    // 修正値
    }>;
    learningDifficulty: number; // 1-10 習得難易度
    tags: string[];        // タグ（「戦闘」「ビジネス」「魔法」など）
    genre: string[];       // 該当ジャンル
}

/**
 * 成長計画型
 */
export interface GrowthPlan {
    id: string;
    characterId: string;
    name: string;
    description: string;
    targetParameters: Array<{
        parameterId: string;
        targetValue: number;
        priority: number;    // 1-10 優先度
    }>;
    targetSkills: Array<{
        skillId: string;
        priority: number;    // 1-10 優先度
        narrativeRequirement?: string; // 物語的要件（「師匠との出会い」など）
    }>;
    growthPhases: GrowthPhase[];
    estimatedDuration: number;  // 予想所要章数
    isActive: boolean;
}

/**
 * 成長フェーズ
 */
export interface GrowthPhase {
    id: string;
    name: string;
    description: string;
    stageRequirement: number;   // 必要発展段階
    chapterEstimate: [number, number]; // 予想章範囲
    parameterChanges: Array<{
        parameterId: string;
        change: number;      // 変化量
    }>;
    skillAcquisitions: string[]; // 習得スキルID
    narrativeElements: string[]; // 物語要素（「挫折」「師匠との出会い」など）
    completionCriteria: string; // 完了条件
}

/**
 * キャラクターパラメータ
 */
export interface CharacterParameter {
    id: string;
    name: string;
    description: string;
    value: number;         // 現在値（0-100）
    growth: number;        // 成長率
    category: ParameterCategory;
    tags: string[];        // タグ（「戦闘」「ビジネス」「対人」など）
}

/**
 * パラメータカテゴリ
 */
export type ParameterCategory = 'PHYSICAL' | 'MENTAL' | 'SOCIAL' | 'TECHNICAL' | 'SPECIAL';

/**
 * キャラクターの精神的成長状態
 */
export interface MentalGrowthState {
    traumas: Array<{
        id: string;
        description: string;
        resolved: boolean;
        resolutionChapter?: number;
    }>;
    beliefs: Array<{
        id: string;
        description: string;
        strength: number;    // 1-10 信念の強さ
        acquired: number;    // 獲得章番号
    }>;
    worldview: string;     // 世界観/人生観
    motivation: string;    // 根本的な動機
    emotionalPatterns: Array<{
        trigger: string;
        response: string;
        intensity: number;   // 1-10 強度
    }>;
}

/**
 * キャラクター情報の完全な定義
 */
export interface Character {
    /** 一意のキャラクターID */
    id: string;

    /** キャラクター名 */
    name: string;

    /** ショートネーム配列 */
    shortNames: string[];

    /** 他キャラからの呼称 */
    nicknames?: Record<string, string[]>;

    /** キャラクターの説明 */
    description: string;

    /** キャラクターの種類 */
    type: CharacterType;

    /** キャラクターの重要度 (0-1) */
    significance?: number;

    /** キャラクターの役割 */
    role?: CharacterRole;

    /** キャラクターの目標 */
    goals?: string[];

    /** キャラクターの初登場章 */
    firstAppearance?: number;

    /** 性格特性 */
    personality?: PersonalityTraits;

    /** 外見 */
    appearance?: Appearance;

    /** 背景設定 */
    backstory?: Backstory;

    /** 他キャラクターとの関係性 */
    relationships?: Relationship[];

    /** キャラクターの状態 */
    state: CharacterState;

    /** キャラクターの現在の状態 */
    currentState?: string;

    /** キャラクターの感情状態 */
    emotionalState?: string;

    /** キャラクターの履歴 */
    history: CharacterHistory;

    /** 昇格履歴 */
    promotionHistory?: PromotionRecord[];

    /** メタデータ */
    metadata: CharacterMetadata;

    /** 心理情報 - フェーズ1: 深層キャラクター心理モデル */
    psychology?: CharacterPsychology;
}

export interface RelationshipResponse {
    relationships: Relationship[];
}

/**
 * 不変キャラクターデータ（ID生成時に設定され、ほとんど変更されないデータ）
 */
export interface ImmutableCharacterData {
    name: string;
    shortNames: string[];
    description: string;
    appearance?: Appearance;
    backstory?: Backstory;
}

/**
 * 可変キャラクターデータ（頻繁に更新される可能性のあるデータ）
 */
export interface MutableCharacterData {
    type: CharacterType;
    role?: CharacterRole;
    personality?: PersonalityTraits;
    nicknames?: Record<string, string[]>;
    goals?: string[];
    relationships?: Relationship[];
    state: Partial<CharacterState>;
    currentState?: string;
    emotionalState?: string;
}

/**
 * キャラクター作成時のデータ
 * 不変データと可変データの両方を含む
 */
export interface CharacterData extends ImmutableCharacterData, MutableCharacterData {
    metadata?: {
        tags?: string[];
    };
}

/**
 * キャラクター評価メトリクス
 */
export interface CharacterMetrics {
    appearances: number;
    interactions: number;
    plotRelevance: number;
    characterDevelopment: number;
    readerEngagement: number;
}

/**
 * キャラクター昇格の評価結果
 */
export interface PromotionEvaluation {
    /** 昇格の適格性 */
    eligible: boolean;

    /** 目標キャラクタータイプ */
    targetType: CharacterType | null;

    /** 昇格スコア */
    score: number;

    /** 評価レコメンデーション */
    recommendation: string;
}

/**
 * キャラクタークラスター
 */
export interface CharacterCluster {
    // 基本プロパティ
    id: string;
    members: string[];
    dominantRelation: RelationshipType;
    cohesion: number;

    // 🆕 記憶階層システム統合プロパティ
    memorySystemValidated: boolean;     // 記憶システムでの検証済みフラグ
    crossLevelConsistency: number;      // クロスレベル整合性スコア (0-1)
    lastAnalyzed: string;               // 最終分析日時（ISO文字列）

    // オプショナル拡張プロパティ
    memberNames?: string[];             // メンバー名のリスト
    clusterStrength?: number;           // クラスター結束強度 (0-1)
    memoryLevelDistribution?: Record<MemoryLevel, number>;  // 記憶レベル分布
    evolutionHistory?: Array<{         // クラスター変遷履歴
        timestamp: string;
        membershipChanges: {
            added: string[];
            removed: string[];
        };
        cohesionChange: number;
        reason: string;
    }>;

    // 分析結果
    analysisData?: {
        centralityScores: Record<string, number>;   // 各メンバーの中心性スコア
        subgroups: Array<{                          // サブグループ
            members: string[];
            internalCohesion: number;
            relationToMainGroup: number;
        }>;
        stabilityScore: number;                     // 安定性スコア (0-1)
        influenceRank: number;                      // 影響力ランク
    };

    // メタデータ
    metadata?: {
        createdAt: Date;
        updatedAt: Date;
        version: number;
        analysisSource: 'AUTO' | 'MANUAL' | 'MEMORY_INTEGRATION';
        qualityScore: number;
    };
}

export type StabilityTrend = 'stable' | 'increasing' | 'decreasing' | 'volatile';

/**
 * 関係性の対立
 */
export interface RelationshipTension {
    // 基本プロパティ
    characters: [string, string];
    type: RelationshipType;
    intensity: number;
    description: string;

    // 🆕 記憶階層システム統合プロパティ
    characterNames: [string, string];  // キャラクター名のペア
    memorySystemValidated: boolean;    // 記憶システムでの検証済みフラグ
    lastAnalyzed: string;              // 最終分析日時（ISO文字列）
    stabilityTrend: 'stable' | 'increasing' | 'decreasing' | 'volatile';  // 安定性傾向

    // オプショナル拡張プロパティ
    crossLevelConsistency?: number;    // クロスレベル整合性スコア (0-1)
    memoryLevel?: MemoryLevel;         // 主要存在記憶レベル
    systemConfidence?: number;         // システム信頼度 (0-1)
    relatedEvents?: Array<{           // 関連イベント履歴
        chapterNumber: number;
        description: string;
        impact: number;
        timestamp: string;
    }>;

    // メタデータ
    metadata?: {
        createdAt: Date;
        updatedAt: Date;
        version: number;
        analysisSource: 'AUTO' | 'MANUAL' | 'MEMORY_INTEGRATION';
    };
}

/**
 * RelationshipNetworkAnalysis型定義
 */
export interface RelationshipNetworkAnalysis {
    totalRelationships: number;
    networkDensity: number;
    averageConnectivity: number;
    centralCharacters: Array<{
        characterId: string;
        characterName: string;
        connectivityScore: number;
        influenceRank: number;
    }>;
    isolatedCharacters: string[];
    strongestConnections: Array<{
        char1Id: string;
        char2Id: string;
        strength: number;
        type: RelationshipType;
    }>;
    memorySystemValidated: boolean;
    analysisQuality: number;
}

/**
 * 関係性分析
 */
export interface RelationshipAnalysis {
    clusters: CharacterCluster[];
    tensions: RelationshipTension[];
    developments: any[];
    visualData: any;

    // 🆕 記憶階層システム統合情報（新規追加）
    networkAnalysis?: RelationshipNetworkAnalysis;
    analysisTimestamp?: Date;
    confidence?: number;
    memorySystemValidated?: boolean;
    systemHealthScore?: number;
    crossMemoryLevelConsistency?: number;
}

/**
 * 発展影響
 */
export interface DevelopmentImpact {
    personality: Record<string, number>;
    relationships: Record<string, { change: number; reason: string }>;
    skills: Record<string, { improvement: number; reason: string }>;
    emotional: Record<string, any>;
    narrative: number;
}

/**
 * キャラクター発展
 */
export interface CharacterDevelopment {
    personalityChanges: Record<string, number>;
    relationshipChanges: Record<string, { change: number; reason: string }>;
    skillChanges: Record<string, { improvement: number; reason: string }>;
    emotionalGrowth: Record<string, any>;
    narrativeSignificance: number;
    stageProgression?: {
        from: number;
        to: number;
        reason: string;
    };
}

/**
 * 発展経路
 */
export interface DevelopmentPath {
    milestones: Milestone[];
    growthEvents: GrowthEvent[];
    transformationArcs: TransformationArc[];
    phase: DevelopmentPathPhase;
    targetStage: number;
    currentStage: number;
    estimatedCompletionChapter: number;
}

/**
 * 成長処理の結果
 */
export interface GrowthResult {
    /** 成長計画ID */
    planId: string;
    /** 適用されたキャラクターID */
    characterId: string;
    /** 成長前のキャラクター状態 */
    beforeState: Partial<CharacterState>;
    /** 成長後のキャラクター状態 */
    afterState: Partial<CharacterState>;
    /** パラメータ変化 */
    parameterChanges: Record<string, { before: number, after: number }>;
    /** 取得スキル */
    acquiredSkills: string[];
    /** 完了した成長フェーズ */
    completedPhase?: string;
    /** 次のフェーズ */
    nextPhase?: string;
    /** 計画完了したかどうか */
    planCompleted: boolean;
}

/**
 * チャプターイベント
 */
export interface ChapterEvent {
    id: string;
    type: string;
    subType?: string;
    description?: string;
    affectedCharacters: string[];
    relatedCharacters?: string[];
    intensity?: number;
    outcome?: 'SUCCESS' | 'FAILURE' | 'NEUTRAL';
    skillArea?: string;
    additionalData?: {
        relatedSkills?: string[];
        masteryLevel?: number;
        [key: string]: any;
    };
}

/**
 * タイミング要因
 */
export interface TimingFactor {
    type: 'PLOT_RELEVANCE' | 'CHARACTER_DEVELOPMENT' | 'NARRATIVE_PACING' | 'READER_EXPECTATIONS';
    score: number;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
}

/**
 * タイミング分析
 */
export interface TimingAnalysis {
    optimalChapter: number;
    significance: 'LOW' | 'MEDIUM' | 'HIGH';
    score: number;
    reason: string;
    factors: TimingFactor[];
    alternatives: number[];
    preparation: string[];
}

/**
 * タイミング推奨
 */
export interface TimingRecommendation {
    recommendedChapter: number;
    significance: 'LOW' | 'MEDIUM' | 'HIGH';
    reason: string;
    alternatives: number[];
    preparationNeeded: string[];
}

/**
 * ストーリーコンテキスト
 */
export interface StoryContext {
    currentChapter: number;
    totalChapters: number;
    plotPoints: any[];
    storyPacing?: string;
    currentArc?: {
        name: string;
        theme: string;
        approximateChapters: [number, number];
    };
    recentAppearances: any[];
    [key: string]: any;
}

/**
 * キャラクター発展経路のフェーズを表す型
 */
export type DevelopmentPathPhase =
    'INTRODUCTION' | 'PROGRESSION' | 'MAJOR_TRANSFORMATION' |
    'REFINEMENT' | 'MINOR_DEVELOPMENT' | 'SUPPORTING_ROLE' | 'STATIC';

/**
 * 変容アークのタイプを表す型
 */
export type ArcType =
    'REDEMPTION' | 'FALL' | 'GROWTH' | 'CORRUPTION' | 'DISILLUSIONMENT' |
    'MATURATION' | 'EDUCATION' | 'ENLIGHTENMENT' | 'TRAGEDY' | 'REBIRTH' |
    'DISCOVERY' | 'SUPPORTING' | 'PARALLEL';

/**
 * 変容アーク情報
 */
export interface TransformationArc {
    type: ArcType;
    description: string;
    theme: string;
    beginStage: number;
    peakStage: number;
    resolutionStage: number;
    keyPoints: string[];
}

/**
 * 成長イベント情報
 */
export interface GrowthEvent {
    type: string;
    targetChapter: number;
    description: string;
    significance: number;
    triggers: string[];
    outcomes: string[];
    completed: boolean;
}

/**
 * 発展マイルストーン情報
 */
export interface Milestone {
    stage: number;
    description: string;
    requirements: any;
    estimatedChapter: number;
    achieved: boolean;
}

/**
 * キャラクター変化のタイプを表す型
 * - GROWTH: 永続的な成長や性格の発展
 * - TEMPORARY: 一時的な感情や状態の変化
 * - CONTRADICTION: 既存の性格・設定と矛盾する変化
 */
export type ChangeType = 'GROWTH' | 'TEMPORARY' | 'CONTRADICTION';

/**
 * 変化の影響範囲を表す型
 */
export type ChangeScope = 'CORE_PERSONALITY' | 'RELATIONSHIPS' | 'SKILLS' | 'EMOTIONAL_STATE' | 'APPEARANCE' | 'MOTIVATION';

/**
 * キャラクター変化の分類結果を表すインターフェース
 */
export interface ChangeClassification {
    /** 変化のタイプ */
    type: ChangeType;
    /** 変化の影響範囲 */
    scope: ChangeScope;
    /** 分類の確信度（0-1） */
    confidence: number;
    /** 分類の説明 */
    explanation: string;
    /** プロット上の重要度（0-1）*/
    narrativeSignificance?: number;
}

/**
 * キャラクターの変化項目を表すインターフェース
 */
export interface CharacterChange {
    /** 変化した属性名 */
    attribute: string;
    /** 変化前の値 */
    previousValue: any;
    /** 変化後の値 */
    currentValue: any;
    /** 変化の分類（分類後に設定） */
    classification?: ChangeClassification;
}

/**
 * キャラクター状態の差分を表すインターフェース
 */
export interface CharacterDiff {
    /** キャラクター名 */
    name: string;
    /** キャラクターID */
    id: string;
    /** 最後の登場チャプター */
    lastAppearance?: number;
    /** 現在の発展段階 */
    developmentStage?: number;
    /** 検出された変化のリスト */
    changes: CharacterChange[];
}

/**
 * プロット文脈情報を表すインターフェース
 */
export interface PlotContext {
    /** 最近のチャプター要約 */
    recentSummaries: string;
    /** 重要イベント */
    keyEvents: string[];
    /** 現在のアーク情報 */
    currentArc?: string;
    /** テーマ情報 */
    themes?: string[];
}

/**
 * キャラクターテンプレート
 */
export interface CharacterTemplate {
    id: string;
    name: string;
    description?: string;
    personality?: {
        traits?: string[];
        values?: string[];
        quirks?: string[];
    };
    backstory?: {
        template?: string;
        significantEvents?: string[];
        origin?: string;
    };
    relationships?: Relationship[];
    suggestedType?: CharacterType;
    developmentPath?: any;
    roleSettings?: {
        preferredEmotionalState?: EmotionalState;
        initialDevelopmentStage?: number;
    };
}

/**
 * 動的に生成されたキャラクター
 */
export interface DynamicCharacter extends Character {
    // 特別なプロパティが必要な場合は追加
    generationMetadata?: {
        template?: string;
        generatedAt: Date;
        parameters?: any;
    };
}

/**
 * ナラティブ状態
 */
export interface NarrativeState {
    theme?: string;
    tone?: string;
    setting?: string;
    arc?: string;
    pacing?: string;
}

/**
 * 物語コンテキストを表す型
 * NarrativeState列挙型と区別するためのインターフェース
 */
export interface NarrativeContext {
    /** 物語のペース */
    pacing: string;
    /** 現在のアーク名 */
    arc: string;
    /** 現在のテーマ */
    theme: string;
    /** その他の物語状態情報 */
    [key: string]: any;
}

/**
* キャラクター推奨情報
*/
export interface CharacterRecommendation {
    /** キャラクターID */
    id: string;
    /** キャラクター名 */
    name: string;
    /** 推奨理由 */
    reason: string;
}

/**
 * 章のキャラクター推奨レスポンス
 */
export interface ChapterCharacterRecommendations {
    /** メインキャラクター */
    mainCharacters: CharacterRecommendation[];
    /** サポートキャラクター */
    supportingCharacters: CharacterRecommendation[];
    /** 背景キャラクター */
    backgroundCharacters: CharacterRecommendation[];
}

/**
 * キャラクターの心理状態を表す型 - フェーズ1: 深層キャラクター心理モデル
 */
export interface CharacterPsychology {
    /** 現在の欲求 */
    currentDesires: string[];

    /** 現在の恐れ */
    currentFears: string[];

    /** 内的葛藤 */
    internalConflicts: string[];

    /** 感情状態（感情名:強度） */
    emotionalState: { [key: string]: number };

    /** 他キャラへの感情的態度 */
    relationshipAttitudes: { [characterId: string]: RelationshipAttitude };

    // 🔧 記憶階層システム統合要素
    /** 記憶システムから検出されたパターン */
    memorySystemPatterns?: string[];

    /** 記憶システム最終更新日時 */
    lastMemorySystemUpdate?: string;

    /** 記憶システムで検証済みかどうか */
    memorySystemValidated?: boolean;
}

/**
 * キャラクターの他者への感情的態度 - フェーズ1: 深層キャラクター心理モデル
 */
export interface RelationshipAttitude {
    /** 感情（信頼、疑念、愛情など） */
    attitude: string;

    /** 強度（0-1） */
    intensity: number;

    /** 変化しつつあるか */
    isDynamic: boolean;

    /** 最近の変化の説明 */
    recentChange: string;

    // 🔧 記憶階層システム統合要素
    /** 記憶システムから得られた洞察 */
    memorySystemInsights?: string[];

    /** 記憶システムで検証済みかどうか */
    memorySystemValidated?: boolean;
}

/**
 * 心理分析結果（記憶階層システム統合版）
 */
export interface PsychologyAnalysisResult {
    success: boolean;
    characterId: string;
    psychology: CharacterPsychology;
    confidence: number;
    processingTime: number;
    memorySystemValidated: boolean;
    learningDataStored: boolean;
    qualityScore: number;
    warnings: string[];
    recommendations: string[];
}

/**
 * 行動予測結果（記憶階層システム統合版）
 */
export interface BehaviorPredictionResult {
    success: boolean;
    characterId: string;
    predictions: Record<string, string>;
    confidence: number;
    memoryContextUsed: boolean;
    psychologyBased: boolean;
    recommendations: string[];
}

/**
 * 感情応答シミュレーション結果（記憶階層システム統合版）
 */
export interface EmotionalSimulationResult {
    success: boolean;
    characterId: string;
    dominantEmotion: string;
    emotionalResponses: Record<string, number>;
    explanation: string;
    memorySystemIntegrated: boolean;
    confidence: number;
}

/**
 * パフォーマンス統計（記憶階層システム統合版）
 */
export interface PsychologyPerformanceMetrics {
    totalAnalyses: number;
    successfulAnalyses: number;
    failedAnalyses: number;
    averageProcessingTime: number;
    memorySystemHits: number;
    cacheEfficiencyRate: number;
    lastOptimization: string;
}

/**
 * 章の感情分析を表す型 - フェーズ1: 感情アークの設計システム
 */
export interface ChapterEmotionAnalysis {
    /** 感情的次元の分析 */
    emotionalDimensions: {
        /** 希望と絶望の間の感情的変移 */
        hopeVsDespair: EmotionalProgression;
        /** 安心と緊張の間の感情的変移 */
        comfortVsTension: EmotionalProgression;
        /** 喜びと悲しみの間の感情的変移 */
        joyVsSadness: EmotionalProgression;
        /** 共感と孤立の間の感情的変移 */
        empathyVsIsolation: EmotionalProgression;
        /** 好奇心と無関心の間の感情的変移 */
        curiosityVsIndifference: EmotionalProgression;
    };
    /** 全体的な感情的トーン */
    overallTone: string;
    /** 感情的影響力 (0-10) */
    emotionalImpact: number;
}

/**
 * 感情的変移を表す型 - フェーズ1: 感情アークの設計システム
 */
export interface EmotionalProgression {
    /** 開始時の感情レベル (0-10) */
    start: number;
    /** 中間時の感情レベル (0-10) */
    middle: number;
    /** 終了時の感情レベル (0-10) */
    end: number;
}

/**
 * 感情アークの設計を表す型 - フェーズ1: 感情アークの設計システム
 */
export interface EmotionalArcDesign {
    /** 推奨される感情的トーン */
    recommendedTone: string;
    /** 感情的な旅 */
    emotionalJourney: {
        /** 冒頭部の感情設計 */
        opening: { dimension: string, level: number }[];
        /** 展開部の感情設計 */
        development: { dimension: string, level: number }[];
        /** 結末部の感情設計 */
        conclusion: { dimension: string, level: number }[];
    };
    /** 設計理由の説明 */
    reason: string;
}

/**
 * アクション検証結果
 */
export interface ValidationResult {
    /** 有効かどうか */
    isValid: boolean;
    /** 信頼度スコア（0-1） */
    confidenceScore: number;
    /** 理由説明 */
    reason: string;
    /** 提案される代替アクション */
    alternatives?: string[];
}

/**
 * イベント購読情報
 */
export interface EventSubscription {
    /** イベントタイプ */
    eventType: string;
    /** 購読ID */
    id: string;
    /** 購読解除関数 */
    unsubscribe: () => void;
}

/**
 * イベントデータの基底インターフェース
 */
export interface EventData {
    /** イベント発生タイムスタンプ */
    timestamp: Date;
    /** イベント固有データ */
    [key: string]: any;
}

/**
 * キャラクター作成イベントデータ
 */
export interface CharacterCreatedEventData extends EventData {
    character: Character;
}

/**
 * キャラクター更新イベントデータ
 */
export interface CharacterUpdatedEventData extends EventData {
    characterId: string;
    changes: Partial<CharacterData>;
    previousState?: Partial<Character>;
}

/**
 * 関係性更新イベントデータ
 */
export interface RelationshipUpdatedEventData extends EventData {
    char1Id: string;
    char2Id: string;
    relationship: Relationship;
    previousRelationship?: Relationship;
}

/**
 * パラメータ変更イベントデータ
 */
export interface ParameterChangedEventData extends EventData {
    characterId: string;
    parameterId: string;
    oldValue: number;
    newValue: number;
}

/**
 * スキル取得イベントデータ
 */
export interface SkillAcquiredEventData extends EventData {
    characterId: string;
    skillId: string;
    level: number;
}

/**
 * イベントハンドラ型定義
 */
export type EventHandler<T extends EventData> = (data: T) => void | Promise<void>;

/**
 * キャラクターインデックスアイテム
 * 検索と検出の効率化のための軽量なキャラクター表現
 */
export interface CharacterIndexItem {
    id: string;
    name: string;
    shortNames: string[];
    nicknames: string[];
    type: CharacterType;
    isActive: boolean;
    lastAppearance: number | null;
    keywords: string[];
}