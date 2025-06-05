// src/types/memory.ts
/**
 * @fileoverview 基本メモリ型定義
 * @description 全システム共通の基本的なメモリ関連型定義
 */

import { Chapter } from './chapters';

// ============================================================================
// 基本メモリ型
// ============================================================================

/**
 * @type MemoryType
 * @description メモリータイプ
 */
export type MemoryType = 'SHORT_TERM' | 'MID_TERM' | 'LONG_TERM';

/**
 * @interface Memory
 * @description 基本メモリー
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

/**
 * @interface SearchOptions
 * @description 検索オプション
 */
export interface SearchOptions {
    limit?: number;
    minRelevance?: number;
    memoryTypes?: MemoryType[];
    includeMeta?: boolean;
}

// ============================================================================
// 同期・圧縮関連
// ============================================================================

/**
 * @interface SyncMemoryRequest
 * @description メモリー同期リクエスト
 */
export interface SyncMemoryRequest {
    chapterNumber: number;
    force?: boolean;
    chapter?: Chapter;
}

/**
 * @interface SyncMemoryResponse
 * @description メモリー同期レスポンス
 */
export interface SyncMemoryResponse {
    success: boolean;
    updatedMemories: MemoryType[];
    compressionActions: CompressionAction[];
}

/**
 * @interface CompressionAction
 * @description 圧縮アクション
 */
export interface CompressionAction {
    type: 'compress' | 'summarize' | 'integrate';
    source: MemoryType;
    target: MemoryType;
    details: string;
}

// ============================================================================
// 基本構造体
// ============================================================================

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
 * @interface Relationship
 * @description 関係性
 */
export interface Relationship {
    character: string;
    relation: string;
    trust_level?: number;
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

// ============================================================================
// チャプターメモリー関連
// ============================================================================

/**
 * @interface ChapterMemory
 * @description チャプターメモリー
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
    emotionAnalysis?: any; // 外部型参照を避けるため
    foreshadowingEvaluation?: any; // 外部型参照を避けるため
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

/**
 * @interface ArcMemory
 * @description アークメモリー
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
    emotionalArc?: any; // 外部型参照を避けるため
    themeResonance?: any; // 外部型参照を避けるため
}

// ============================================================================
// 伏線関連
// ============================================================================

/**
 * @interface Foreshadowing
 * @description 伏線情報
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
    evaluation?: any; // 外部型参照を避けるため
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

// ============================================================================
// 永続的イベント関連
// ============================================================================

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

/**
 * @interface SignificantEvent
 * @description 重要イベントデータ構造
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


// GenerationContext インターフェースの拡張部分
export interface PersistentEventsContext {
    deaths: Array<{
        character: string;
        description: string;
        chapterNumber: number;
    }>;
    marriages: Array<{
        characters: string[];
        description: string;
        chapterNumber: number;
    }>;
    births: Array<{
        parents: string[];
        description: string;
        chapterNumber: number;
    }>;
    promotions: Array<{
        character: string;
        description: string;
        chapterNumber: number;
    }>;
    skillAcquisitions: Array<{
        character: string;
        description: string;
        chapterNumber: number;
    }>;
    injuries: Array<{
        character: string;
        description: string;
        chapterNumber: number;
    }>;
    transformations: Array<{
        character: string;
        description: string;
        chapterNumber: number;
    }>;
    relocations: Array<{
        character: string;
        description: string;
        chapterNumber: number;
    }>;
}


// ============================================================================
// クエリ関連
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
 * イベントコンテキスト型定義
 */
export interface EventContext {
    location?: string;
    characters?: string[];
    time?: string;
}

/**
 * 一貫性結果
 */
export interface ConsistencyResult {
    isConsistent: boolean;
    issues: ConsistencyIssue[];
}

/**
 * 一貫性問題
 */
export interface ConsistencyIssue {
    type: string;
    description: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    location?: {
        chapter: number;
        position?: string;
    };
    characters?: string[];
    suggestedFix?: string;
}
