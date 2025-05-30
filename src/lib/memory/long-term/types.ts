// src/lib/memory/narrative/types.ts
/**
 * @fileoverview 物語記憶システム統合型定義
 * @description 最も拡張された型定義を統合し、全システムで使用
 */

import { Chapter } from '@/types/chapters';
import { GeminiClient } from '@/lib/generation/gemini-client';

// ============================================================================
// 基本列挙型
// ============================================================================

/**
 * @enum NarrativeState
 * @description 物語状態の列挙型（ビジネスジャンル対応強化版）
 */
export enum NarrativeState {
    // 共通状態
    INTRODUCTION = 'INTRODUCTION',
    DAILY_LIFE = 'DAILY_LIFE',
    JOURNEY = 'JOURNEY',
    INVESTIGATION = 'INVESTIGATION',
    PRE_BATTLE = 'PRE_BATTLE',
    BATTLE = 'BATTLE',
    POST_BATTLE = 'POST_BATTLE',
    TRAINING = 'TRAINING',
    REVELATION = 'REVELATION',
    DILEMMA = 'DILEMMA',
    RESOLUTION = 'RESOLUTION',
    CLOSURE = 'CLOSURE',

    // ビジネスジャンル特有の状態
    BUSINESS_MEETING = 'BUSINESS_MEETING',
    PRODUCT_DEVELOPMENT = 'PRODUCT_DEVELOPMENT',
    PITCH_PRESENTATION = 'PITCH_PRESENTATION',
    MARKET_RESEARCH = 'MARKET_RESEARCH',
    TEAM_BUILDING = 'TEAM_BUILDING',
    FUNDING_ROUND = 'FUNDING_ROUND',
    BUSINESS_PIVOT = 'BUSINESS_PIVOT',
    CUSTOMER_DISCOVERY = 'CUSTOMER_DISCOVERY',
    PRODUCT_LAUNCH = 'PRODUCT_LAUNCH',
    
    // 追加のビジネス特化状態
    MARKET_COMPETITION = 'MARKET_COMPETITION',
    STRATEGIC_PREPARATION = 'STRATEGIC_PREPARATION',
    PERFORMANCE_REVIEW = 'PERFORMANCE_REVIEW',
    BUSINESS_DEVELOPMENT = 'BUSINESS_DEVELOPMENT',
    SKILL_DEVELOPMENT = 'SKILL_DEVELOPMENT',
    FINANCIAL_CHALLENGE = 'FINANCIAL_CHALLENGE',
    EXPANSION_PHASE = 'EXPANSION_PHASE',
    ACQUISITION_NEGOTIATION = 'ACQUISITION_NEGOTIATION',
    CULTURE_BUILDING = 'CULTURE_BUILDING',
    CRISIS_MANAGEMENT = 'CRISIS_MANAGEMENT',
    MARKET_ENTRY = 'MARKET_ENTRY',
    REGULATORY_COMPLIANCE = 'REGULATORY_COMPLIANCE',
    PARTNERSHIP_DEVELOPMENT = 'PARTNERSHIP_DEVELOPMENT',
    MARKET_SCALING = 'MARKET_SCALING',
}

/**
 * @enum BusinessGrowthPhase
 * @description 企業成長フェーズ
 */
export enum BusinessGrowthPhase {
    IDEA = "IDEA_PHASE",
    VALIDATION = "VALIDATION_PHASE",
    EARLY_TRACTION = "EARLY_TRACTION",
    SCALE = "SCALE_PHASE",
    EXPANSION = "EXPANSION_PHASE",
    MATURITY = "MATURITY_PHASE"
}

/**
 * @enum PersistentEventType
 * @description 永続的イベントタイプ
 */
export enum PersistentEventType {
    DEATH = 'DEATH',
    MARRIAGE = 'MARRIAGE',
    BIRTH = 'BIRTH',
    PROMOTION = 'PROMOTION',
    SKILL_ACQUISITION = 'SKILL_ACQUISITION',
    MAJOR_INJURY = 'MAJOR_INJURY',
    TRANSFORMATION = 'TRANSFORMATION',
    RELOCATION = 'RELOCATION'
}

// ============================================================================
// 基本インターフェース
// ============================================================================

/**
 * @interface ManagerConstructorOptions
 * @description マネージャーコンストラクタのオプション
 */
export interface ManagerConstructorOptions {
    geminiClient?: GeminiClient;
}

/**
 * @interface UpdateOptions
 * @description 更新オプション
 */
export interface UpdateOptions {
    genre?: string;
    totalChapters?: number;
    currentArcNumber?: number;
}

/**
 * @interface IManager
 * @description 各マネージャーの共通インターフェース
 */
export interface IManager {
    initialize(): Promise<void>;
    updateFromChapter(chapter: Chapter, options?: UpdateOptions): Promise<void>;
    save(): Promise<void>;
}

// ============================================================================
// 物語構造関連
// ============================================================================

/**
 * @interface NarrativeStateInfo
 * @description 物語状態情報（完全版）
 */
export interface NarrativeStateInfo {
    state: NarrativeState;
    tensionLevel: number;
    stagnationDetected: boolean;
    suggestedNextState?: NarrativeState;
    duration: number;
    location: string;
    timeOfDay: string;
    weather: string;
    presentCharacters: string[];
    genre: string;
    
    // 内部状態
    currentArcNumber: number;
    currentTheme: string;
    arcStartChapter: number;
    arcEndChapter: number;
    arcCompleted: boolean;
    turningPoints: TurningPoint[];
    
    // 指標情報
    metrics?: NarrativeMetrics;
    totalChapters?: number;
    
    // 進行情報
    progressionInstruction?: string;
}

/**
 * @interface StateTransition
 * @description 状態遷移情報
 */
export interface StateTransition {
    fromState: NarrativeState;
    toState: NarrativeState;
    chapter: number;
    timestamp: string;
    keyEvent?: string;
}

/**
 * @interface StagnationDetectionResult
 * @description 停滞検出結果
 */
export interface StagnationDetectionResult {
    detected: boolean;
    cause: string;
    score: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    recommendations: string[];
}

/**
 * @interface TurningPoint
 * @description 物語のターニングポイント情報
 */
export interface TurningPoint {
    chapter: number;
    description: string;
    significance: number;
    timestamp?: string;
}

// ============================================================================
// キャラクター関連
// ============================================================================

/**
 * @interface CharacterProgress
 * @description キャラクターの進行状況
 */
export interface CharacterProgress {
    name: string;
    firstAppearance: number;
    lastAppearance: number;
    appearanceCount: number;
    developmentPoints: {
        chapter: number;
        event: string;
        timestamp: string;
    }[];
}

/**
 * @interface CharacterChangeInfo
 * @description キャラクター変化情報
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

// ============================================================================
// 章・要約関連
// ============================================================================

/**
 * @interface ChapterSummary
 * @description 章の要約情報
 */
export interface ChapterSummary {
    chapterNumber: number;
    summary: string;
    timestamp: string;
}

/**
 * @interface ChapterMemory
 * @description チャプターメモリー（拡張版）
 */
export interface ChapterMemory {
    chapter: number;
    summary: string;
    key_events?: KeyEvent[];
    character_states?: CharacterState[];
    timestamp: string;
    emotional_impact: number;
    plot_significance: number;
    foreshadowing?: Foreshadowing[];
    resolved_foreshadowing?: {
        id: string;
        description: string;
        resolution: string;
    }[];
    emotionAnalysis?: ChapterEmotionAnalysis;
    foreshadowingEvaluation?: ForeshadowingEvaluation;
}

/**
 * @interface KeyEvent
 * @description キーイベント
 */
export interface KeyEvent {
    event: string;
    chapter: number;
    significance: number;
    location?: string;
    characters?: string[];
}

/**
 * @interface CharacterState
 * @description キャラクター状態
 */
export interface CharacterState {
    name: string;
    mood?: string;
    development?: string;
    relationships?: Relationship[];
}

/**
 * @interface Relationship
 * @description 関係性
 */
export interface Relationship {
    character: string;
    relation: string;
    trust_level?: number;
}

// ============================================================================
// 感情・テンション関連
// ============================================================================

/**
 * @interface EmotionalCurvePoint
 * @description 感情曲線のポイント
 */
export interface EmotionalCurvePoint {
    chapter: number;
    tension: number;
    emotion: string;
    event?: string;
}

/**
 * @interface ChapterEmotionAnalysis
 * @description 章の感情分析結果
 */
export interface ChapterEmotionAnalysis {
    emotionalDimensions: {
        hopeVsDespair: { start: number, middle: number, end: number };
        comfortVsTension: { start: number, middle: number, end: number };
        joyVsSadness: { start: number, middle: number, end: number };
        empathyVsIsolation: { start: number, middle: number, end: number };
        curiosityVsIndifference: { start: number, middle: number, end: number };
    };
    overallTone: string;
    emotionalImpact: number;
}

/**
 * @interface EmotionalArcDesign
 * @description 感情アーク設計
 */
export interface EmotionalArcDesign {
    recommendedTone: string;
    emotionalJourney: {
        opening: { dimension: string; level: number }[];
        development: { dimension: string; level: number }[];
        conclusion: { dimension: string; level: number }[];
    };
    reason: string;
}

/**
 * @interface TensionRecommendation
 * @description テンション推奨
 */
export interface TensionRecommendation {
    recommendedTension: number;
    reason: string;
    direction: "increase" | "decrease" | "maintain" | "establish";
}

/**
 * @interface PacingRecommendation
 * @description ペーシング推奨
 */
export interface PacingRecommendation {
    recommendedPacing: number;
    description: string;
}

/**
 * @interface TensionPacingRecommendation
 * @description テンション・ペーシング推奨のセット
 */
export interface TensionPacingRecommendation {
    tension: TensionRecommendation;
    pacing: PacingRecommendation;
}

// ============================================================================
// 伏線関連
// ============================================================================

/**
 * @interface Foreshadowing
 * @description 伏線情報（拡張版）
 */
export interface Foreshadowing {
    id: string;
    description: string;
    chapter_introduced: number;
    potential_resolution?: string;
    resolved: boolean;
    resolution_chapter?: number;
    resolution_description?: string;
    significance?: number;
    urgency: string;
    context?: string;
    plannedResolution?: number;
    createdTimestamp: string;
    updatedTimestamp: string;
    relatedCharacters?: string[];
    relatedElements?: string[];
    evaluation?: ForeshadowingEvaluation;
    introductionMethod?: string;
    metadata?: {
        type: string;
        conceptName: string;
        characterId: string;
        fromStage: string;
        toStage: string;
        transformationCatalyst: string;
    };
}

/**
 * @interface ForeshadowingEvaluation
 * @description 伏線評価
 */
export interface ForeshadowingEvaluation {
    integrationScore: number;
    narrativeRelevance: number;
    subtlety: number;
    payoffPotential: number;
}

/**
 * @interface ForeshadowingMethodSuggestion
 * @description 伏線手法提案
 */
export interface ForeshadowingMethodSuggestion {
    method: string;
    description: string;
    suitability: number;
}

// ============================================================================
// アーク・メモリー関連
// ============================================================================

/**
 * @interface ArcMemory
 * @description アークメモリー（拡張版）
 */
export interface ArcMemory {
    number: number;
    arc_name?: string;
    theme: string;
    themes?: string[];
    chapter_range: { start: number; end: number };
    is_complete: boolean;
    memories: CompressedMemory[];
    character_changes?: string[];
    turningPoints?: KeyEvent[];
    foreshadowing?: Foreshadowing[];
    summary?: string;
    emotionalArc?: EmotionalArcDesign;
    themeResonance?: ThemeResonanceAnalysis;
}

/**
 * @interface CompressedMemory
 * @description 圧縮されたメモリー
 */
export interface CompressedMemory {
    timeframe: { start: number; end: number };
    keyEvents: KeyEvent[];
    characterUpdates: any[];
    summary: string;
    emotionalJourney?: {
        start: string;
        peak: string;
        end: string;
        dominantEmotion: string;
    };
}

// ============================================================================
// 指標・分析関連
// ============================================================================

/**
 * @interface NarrativeMetrics
 * @description 物語の進行指標
 */
export interface NarrativeMetrics {
    pacing: number;
    complexity: number;
    novelty: number;
    coherence: number;
    characterFocus: Record<string, number>;
    emotionalTone: string;
}

/**
 * @interface ThemeResonanceAnalysis
 * @description テーマ共鳴分析
 */
export interface ThemeResonanceAnalysis {
    strength: number;
    dominantExpressions: string[];
    resonanceHistory?: {
        chapter: number;
        strength: number;
        dominantExpressions: string[];
    }[];
}

// ============================================================================
// イベント関連
// ============================================================================

/**
 * @interface SignificantEvent
 * @description 重要イベントデータ構造（拡張版）
 */
export interface SignificantEvent {
    id: string;
    chapterNumber: number;
    description: string;
    involvedCharacters: string[];
    location: string;
    type: string;
    significance: number;
    consequence?: string;
    relatedEvents?: string[];
    timestamp?: string;
    isPersistent?: boolean;
    isResolved?: boolean;
    resolvedInChapter?: number;
    primaryCharacterId?: string;
    relatedElements?: string[];
    affectedAttributes?: string[];
    relatedGrowthPhaseId?: string;
    relatedEventPlanId?: string;
    parameterChanges?: Array<{
        characterId: string;
        parameterId: string;
        previousValue: number;
        newValue: number;
    }>;
    skillAcquisitions?: Array<{
        characterId: string;
        skillId: string;
        level: number;
    }>;
    mentalGrowthChanges?: Array<{
        characterId: string;
        aspect: string;
        description: string;
        value?: any;
    }>;
}

/**
 * @interface BusinessEvent
 * @description ビジネスイベント
 */
export interface BusinessEvent {
    title: string;
    chapterNumber: number;
    description: string;
    impact?: string;
    involvedParties?: string[];
}

/**
 * @interface BusinessStoryEvent
 * @description ビジネスストーリーイベント
 */
export interface BusinessStoryEvent {
    type: BusinessEventType;
    significance: number;
    details?: any;
}

/**
 * @enum BusinessEventType
 * @description ビジネスイベントのタイプ
 */
export enum BusinessEventType {
    FUNDING_ROUND = "funding_round",
    PRODUCT_LAUNCH = "product_launch",
    PIVOT = "pivot",
    TEAM_CONFLICT = "team_conflict",
    EXPANSION = "expansion",
    ACQUISITION = "acquisition",
    MARKET_ENTRY = "market_entry",
    COMPETITION = "competition",
    REGULATORY_CHALLENGE = "regulatory_challenge",
    FINANCIAL_CRISIS = "financial_crisis",
    LEADERSHIP_CHANGE = "leadership_change"
}

// ============================================================================
// システム状態関連
// ============================================================================

/**
 * @interface NarrativeMemoryStatus
 * @description 物語記憶の状態情報
 */
export interface NarrativeMemoryStatus {
    initialized: boolean;
    summaryCount: number;
    currentState: NarrativeState;
    lastUpdateTime: string | null;
}

/**
 * @interface MemorySystemStatus
 * @description 階層的記憶システム全体の状態
 */
export interface MemorySystemStatus {
    initialized: boolean;
    shortTerm: {
        entryCount: number;
        lastUpdateTime: string | null;
    };
    midTerm: {
        entryCount: number;
        lastUpdateTime: string | null;
        currentArc: { number: number; name: string } | null;
    };
    longTerm: {
        initialized: boolean;
        lastCompressionTime: string | null;
    };
}

// ============================================================================
// 学習・同期関連
// ============================================================================

/**
 * @interface EmotionLearningSyncMetrics
 * @description 感情学習同期指標
 */
export interface EmotionLearningSyncMetrics {
    alignmentScore: number;
    emotionalResonance: number;
    learningEffectiveness: number;
    narrativeCoherence: number;
}

/**
 * @enum LearningStage
 * @description 学習段階
 */
export enum LearningStage {
    INTRODUCTION = 'INTRODUCTION',
    DEVELOPMENT = 'DEVELOPMENT',
    MASTERY = 'MASTERY',
    APPLICATION = 'APPLICATION'
}

// ============================================================================
// 検索・クエリ関連
// ============================================================================

/**
 * @interface QueryOptions
 * @description クエリオプション
 */
export interface QueryOptions {
    limit?: number;
    minSignificance?: number;
    includeResolved?: boolean;
    sortBy?: 'significance' | 'time';
    isPersistent?: boolean;
}

/**
 * @interface SearchOptions
 * @description 検索オプション
 */
export interface SearchOptions {
    limit?: number;
    minRelevance?: number;
    memoryTypes?: string[];
    includeMeta?: boolean;
}

// ============================================================================
// その他のユーティリティ型
// ============================================================================

/**
 * @type MemoryType
 * @description メモリータイプ
 */
export type MemoryType = 'SHORT_TERM' | 'MID_TERM' | 'LONG_TERM';

/**
 * @interface Memory
 * @description メモリー
 */
export interface Memory {
    type: MemoryType;
    content: string;
    priority: number;
    metadata?: any;
}

/**
 * @interface SearchResult
 * @description 検索結果
 */
export interface SearchResult {
    memory: Memory;
    relevance: number;
    matches: string[];
}