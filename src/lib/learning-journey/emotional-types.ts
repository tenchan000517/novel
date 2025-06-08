/**
 * @fileoverview 感情学習統合システム - 型定義
 * @description 感情学習統合に関連するすべての型定義とインターフェース
 */

import { LearningStage } from './concept-learning-manager';

/**
 * 感情次元を表す型
 */
export interface EmotionalDimension {
    dimension: string;  // 感情次元名
    level: number;      // 強度 (0-10)
}

/**
 * 感情アーク設計を表す型
 */
export interface EmotionalArcDesign {
    recommendedTone: string;  // 推奨トーン
    emotionalJourney: {       // 感情の旅
        opening: EmotionalDimension[];      // 始まり
        development: EmotionalDimension[];  // 展開
        conclusion: EmotionalDimension[];   // 結末
    };
    reason: string;           // 設計理由
}

/**
 * 共感ポイントを表す型
 */
export interface EmpatheticPoint {
    type: 'character' | 'situation' | 'decision' | 'realization' | 'transformation';
    position: number;   // 章内での相対位置 (0-1)
    intensity: number;  // 強度 (0-1)
    description: string; // 説明
}

/**
 * カタルシス体験を表す型
 */
export interface CatharticExperience {
    type: 'emotional' | 'intellectual' | 'moral' | 'transformative';
    intensity: number;        // 強度 (0-1)
    trigger: string;          // トリガー
    buildup: string[];        // 準備段階
    peakMoment: string;       // ピーク瞬間
    aftermath: string;        // 余韻
    relatedLearningStage: LearningStage;
    relatedConcept: string;
}

/**
 * 感情学習同期指標を表す型
 */
export interface EmotionLearningSyncMetrics {
    peakSynchronization: number;     // 感情ピークと学習ポイントの同期度 (0-1)
    progressionAlignment: number;    // 感情変化と理解進展の一致度 (0-1)
    emotionalResonance: number;      // 感情的共鳴強度 (0-1)
    themeEmotionIntegration: number; // テーマと感情の統合度 (0-1)
    catharticMomentEffect: number;   // カタルシス瞬間の効果 (0-1)
    measurementConfidence: number;   // 測定の信頼性 (0-1)
}

/**
 * EmotionalLearningIntegrator設定インターフェース
 */
export interface EmotionalLearningIntegratorConfig {
    useMemorySystemIntegration?: boolean;
    enableAdvancedAnalysis?: boolean;
    cacheEmotionalDesigns?: boolean;
    maxRetries?: number;
    timeoutMs?: number;
}

/**
 * 内部パフォーマンス統計
 */
export interface PerformanceMetrics {
    totalAnalyses: number;
    successfulAnalyses: number;
    failedAnalyses: number;
    averageProcessingTime: number;
    memorySystemHits: number;
    cacheEfficiencyRate: number;
    lastOptimization: string;
}

/**
 * 感情分析結果を表す型
 */
export interface EmotionAnalysisResult {
    overallTone: string;
    emotionalImpact: number;
    emotionalDimensions?: {
        hopeVsDespair?: { start: number; middle: number; end: number };
        comfortVsTension?: { start: number; middle: number; end: number };
        joyVsSadness?: { start: number; middle: number; end: number };
    };
}

/**
 * 統合感情学習計画を表す型
 */
export interface IntegratedEmotionalPlan {
    emotionalArc: EmotionalArcDesign;
    catharticExperience: CatharticExperience | null;
    empatheticPoints: EmpatheticPoint[];
    syncRecommendations: string[];
}

/**
 * 三者統合結果を表す型
 */
export interface TripleIntegrationResult {
    integrationScore: number;
    recommendations: string[];
    enhancements: string[];
}

/**
 * AI分析オプションを表す型
 */
export interface AIAnalysisOptions {
    temperature?: number;
    responseFormat?: 'json' | 'text';
    maxTokens?: number;
    timeout?: number;
}

/**
 * ビジネスフレームワーク名の型
 */
export type BusinessFrameworkName = 
    | 'ISSUE_DRIVEN'
    | 'SOCRATIC_DIALOGUE' 
    | 'ADLER_PSYCHOLOGY'
    | 'DRUCKER_MANAGEMENT';

/**
 * 診断結果を表す型
 */
export interface EmotionalIntegratorDiagnostics {
    initialized: boolean;
    performanceMetrics: PerformanceMetrics;
    memorySystemStatus: any;
    recommendations: string[];
    memorySystemError?: string;
}