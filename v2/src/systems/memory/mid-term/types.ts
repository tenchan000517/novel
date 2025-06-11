/**
 * 中期記憶システムの型定義
 */

import type { MidTermData } from '../interfaces';

// 中期記憶設定
export interface MidTermMemoryConfig {
  maxRetentionDays: number;
  maxItems: number;
  promotionThreshold: number;
  analysisEnabled: boolean;
  compressionEnabled: boolean;
}

// 篇分析結果
export interface SectionAnalysisResult {
  sectionId: string;
  analysisScore: number;
  keyInsights: string[];
  characterGrowthSummary: Map<string, any>;
  learningOutcomes: string[];
  emotionalHighlights: Array<{
    chapterNumber: number;
    intensity: number;
    emotion: string;
  }>;
}

// キャラクター進化統計
export interface CharacterEvolutionStats {
  characterId: string;
  totalEvolutions: number;
  growthRate: number;
  majorBreakthroughs: number;
  currentPhase: string;
  predictedNextPhase: string;
  confidenceScore: number;
}

// テンション分析結果
export interface TensionAnalysis {
  currentLevel: number;
  trend: 'rising' | 'falling' | 'stable' | 'volatile';
  peakCount: number;
  averageLevel: number;
  variabilityScore: number;
  patternType: 'escalating' | 'cyclic' | 'steady' | 'chaotic';
  recommendations: string[];
}

// 学習進捗統計
export interface LearningProgressStats {
  activeCharacters: number;
  totalFrameworks: number;
  averageCompletion: number;
  breakthroughRate: number;
  failureRate: number;
  estimatedCompletionTime: Date;
}

// 昇格候補
export interface PromotionCandidate {
  dataId: string;
  importanceScore: number;
  ageInDays: number;
  dataType: string;
  promotionReason: string;
  estimatedLongTermValue: number;
}

// パフォーマンスメトリックス
export interface MidTermPerformanceMetrics {
  averageAnalysisTime: number;
  dataProcessingRate: number;
  patternRecognitionAccuracy: number;
  predictionAccuracy: number;
  storageEfficiency: number;
}

// データ品質指標
export interface DataQualityMetrics {
  completenessScore: number;
  consistencyScore: number;
  accuracyScore: number;
  timelinessScore: number;
  overallQuality: number;
  issues: string[];
  recommendations: string[];
}