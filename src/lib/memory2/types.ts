// src/lib/memory/types.ts
/**
 * @fileoverview 階層的記憶管理システム専用型定義
 * @description 短期・中期・長期記憶の階層的管理システム専用の型定義
 */

import { 
    ChapterMemory, 
    KeyEvent, 
    ArcMemory, 
    Memory, 
    SearchResult, 
    MemoryType, 
    SyncMemoryRequest, 
    SyncMemoryResponse,
    SearchOptions
} from '@/types/memory';
import { Chapter } from '@/types/chapters';

// ============================================================================
// 階層的記憶管理システム状態
// ============================================================================

/**
 * @interface MemorySystemStatus
 * @description 階層的記憶システム全体の現在の状態
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
// 階層的記憶管理インターフェース
// ============================================================================

/**
 * @interface IMemoryManager
 * @description 階層的記憶管理システムのマネージャーインターフェース
 * 短期記憶、中期記憶、長期記憶の3階層で構成される記憶システムを統合的に管理
 */
export interface IMemoryManager {
    /**
     * 階層的記憶システムを初期化
     */
    initialize(): Promise<void>;

    /**
     * 初期化状態を確認
     */
    isInitialized(): Promise<boolean>;

    /**
     * 最近のチャプターメモリを取得
     */
    getRecentChapterMemories(upToChapter: number, limit?: number): Promise<ChapterMemory[]>;

    /**
     * 現在のアーク情報を取得
     */
    getCurrentArc(chapterNumber: number): Promise<ArcMemory | null>;

    /**
     * 重要イベントを取得
     */
    getImportantEvents(startChapter: number, endChapter: number): Promise<KeyEvent[]>;

    /**
     * 記憶の自然言語検索を実行
     */
    searchMemories(query: string, options?: SearchOptions): Promise<SearchResult[]>;

    /**
     * 記憶の同期処理を実行
     */
    syncMemories(request: SyncMemoryRequest): Promise<SyncMemoryResponse>;

    /**
     * 特定のチャプターに関連するメモリを取得
     */
    getRelevantMemories(chapterNumber: number, options?: {
        types?: MemoryType[];
        limit?: number;
    }): Promise<Memory[]>;

    /**
     * 物語状態の取得（narrative-specific機能への依存）
     */
    getNarrativeState?(chapterNumber: number): Promise<any>;

    /**
     * 停滞検出（narrative-specific機能への依存）
     */
    detectStagnation?(chapterNumber: number): Promise<any>;
}

// ============================================================================
// 分岐管理関連（階層的記憶管理システムの拡張機能）
// ============================================================================

/**
 * @interface BranchingPoint
 * @description 分岐点
 */
export interface BranchingPoint {
    chapter: number;
    position: string;
    description: string;
    potentialOutcomes: string[];
    significance: number;
}

/**
 * @interface Branch
 * @description 分岐
 */
export interface Branch {
    id: string;
    branchingPoint: BranchingPoint;
    description: string;
    createdAt: string;
    resolved: boolean;
    resolutionChapter?: number;
    resolution?: string;
}

/**
 * @interface BranchingSimulation
 * @description 分岐シミュレーション
 */
export interface BranchingSimulation {
    id: string;
    branchId: string;
    simulatedOutcome: string;
    potentialFuture: string;
    impact: {
        plot: string;
        characters: string[];
        theme: string;
    };
    createdAt: string;
}

// ============================================================================
// 表現追跡関連（階層的記憶管理システムの拡張機能）
// ============================================================================

/**
 * @interface ExpressionUsage
 * @description 表現使用状況
 */
export interface ExpressionUsage {
    expression: string;
    count: number;
    firstUsedInChapter: number;
    lastUsedInChapter: number;
    chapters: number[];
    contexts?: string[];
    category?: 'DESCRIPTION' | 'DIALOGUE' | 'ACTION' | 'TRANSITION';
}

/**
 * @interface ExpressionUsageResult
 * @description 表現使用結果
 */
export interface ExpressionUsageResult {
    newExpressions: string[];
    repeatedExpressions: string[];
    totalTracked: number;
    diversityScore: number;
}

// ============================================================================
// 読者インパクト追跡関連（階層的記憶管理システムの拡張機能）
// ============================================================================

/**
 * @interface ReaderImpactEvent
 * @description 読者インパクトイベント
 */
export interface ReaderImpactEvent {
    id: string;
    chapter: number;
    timestamp: string;
    emotionalImpact: number;
    intellectualImpact: number;
    surpriseLevel: number;
    tensionLevel: number;
    keyMoments?: string[];
    emotionalTone: string;
}

/**
 * @interface ChapterImpactAnalysis
 * @description 章インパクト分析
 */
export interface ChapterImpactAnalysis {
    emotionalImpact: number;
    intellectualImpact: number;
    surpriseLevel: number;
    tensionLevel: number;
    keyMoments: string[];
    emotionalTone: string;
    paceRating: number;
}

/**
 * @interface EmotionalCurvePoint
 * @description 感情曲線ポイント
 */
export interface EmotionalCurvePoint {
    chapter: number;
    tension: number;
    emotion: string;
    event?: string;
}

export { NarrativeState } from '@/lib/memory/narrative/types'; // ←別ファイル定義の場合
