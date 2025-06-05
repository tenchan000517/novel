// src\lib\analysis\coordinators\interfaces.ts
/**
 * @fileoverview コーディネータインターフェース
 * @description
 * 分析コーディネータと最適化コーディネータの共通インターフェース定義。
 * システム全体での一貫性と拡張性を保証します。
 */

import {
  GenerationContext,
  ChapterAnalysis,
  ThemeResonanceAnalysis,
  StyleAnalysis,
  ExpressionPatterns,
  QualityMetrics
} from '@/types/generation';

import { ReaderExperienceAnalysis } from '@/lib/analysis/services/reader/reader-experience-analysis-service';
import { CharacterAnalysisResult } from '@/lib/analysis/services/character/character-analysis-service';
import { Character, CharacterPsychology } from '@/lib/characters/core/types';

// =========================================================================
// 基本型定義
// =========================================================================

/**
 * @interface BaseCoordinatorOptions
 * @description 全コーディネータ共通のオプション
 */
export interface BaseCoordinatorOptions {
  /** キャッシュを有効にするか */
  enableCache?: boolean;
  /** 並列処理を有効にするか */
  enableParallelProcessing?: boolean;
  /** 詳細ログを有効にするか */
  enableDetailedLogging?: boolean;
}

/**
 * @interface BaseMetadata
 * @description 基本メタデータ
 */
export interface BaseMetadata {
  /** 処理タイムスタンプ */
  timestamp: string;
  /** 使用されたサービス一覧 */
  servicesUsed: string[];
  /** 処理時間（ミリ秒） */
  processingTime: number;
  /** キャッシュヒット率 */
  cacheHitRate: number;
}

/**
 * @interface CacheableCoordinator
 * @description キャッシュ機能を持つコーディネータの基本インターフェース
 */
export interface CacheableCoordinator {
  /** キャッシュをクリアする */
  clearCache(): void;
}

// =========================================================================
// 分析コーディネータ関連
// =========================================================================

/**
 * @interface AnalysisCoordinatorOptions
 * @description 分析コーディネータのオプション
 */
export interface AnalysisCoordinatorOptions extends BaseCoordinatorOptions {
  /** 統合最適化を有効にするか */
  optimizeForIntegration?: boolean;
}

/**
 * @interface IntegratedAnalysisResult
 * @description 統合分析結果
 */
export interface IntegratedAnalysisResult {
  // 基本章分析
  chapterAnalysis: ChapterAnalysis;

  // テーマ分析
  themeAnalysis: ThemeResonanceAnalysis;
  foreshadowingProcessing: {
    resolvedForeshadowing: any[];
    generatedCount: number;
    totalActive: number;
  };

  // 文体分析
  styleAnalysis: StyleAnalysis;
  expressionPatterns: ExpressionPatterns;

  // キャラクター分析
  characterAnalysis: CharacterAnalysisResult;

  // 物語構造分析
  sceneStructure: SceneStructureAnalysis;
  sceneRecommendations: SceneRecommendation[];
  literaryInspirations: LiteraryInspiration;

  // 読者体験分析
  readerExperience: ReaderExperienceAnalysis;

  // 品質メトリクス
  qualityMetrics: QualityMetrics;

  // 統合改善提案
  integratedSuggestions: string[];

  // メタデータ
  analysisMetadata: AnalysisMetadata;
}

/**
 * @interface AnalysisMetadata
 * @description 分析メタデータ
 */
export interface AnalysisMetadata extends BaseMetadata {
  /** 分析タイムスタンプ */
  analysisTimestamp: string;
}

/**
 * @interface SceneStructureAnalysis
 * @description シーン構造分析
 */
export interface SceneStructureAnalysis {
  typeDistribution: {
    [sceneType: string]: number;
  };
  lengthDistribution: {
    min: number;
    max: number;
    avg: number;
    stdDev: number;
  };
  paceVariation: number;
  transitionTypes: {
    types: { [transitionType: string]: number };
    smoothness: number;
  };
}

/**
 * @interface SceneRecommendation
 * @description シーン推奨
 */
export interface SceneRecommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
}

/**
 * @interface LiteraryInspiration
 * @description 文学的インスピレーション
 */
export interface LiteraryInspiration {
  plotTechniques: LiteraryTechnique[];
  characterTechniques: LiteraryTechnique[];
  atmosphereTechniques: LiteraryTechnique[];
}

/**
 * @interface LiteraryTechnique
 * @description 文学技法
 */
export interface LiteraryTechnique {
  technique: string;
  description: string;
  example: string;
  reference: string;
}

/**
 * @interface IAnalysisCoordinator
 * @description 分析コーディネータのインターフェース
 */
export interface IAnalysisCoordinator extends CacheableCoordinator {
  /**
   * 包括的章分析を実行する
   * 
   * @param content 章の内容
   * @param chapterNumber 章番号
   * @param context 生成コンテキスト
   * @returns 統合分析結果
   */
  analyzeChapter(
    content: string,
    chapterNumber: number,
    context: GenerationContext
  ): Promise<IntegratedAnalysisResult>;
}

// =========================================================================
// 最適化コーディネータ関連
// =========================================================================

/**
 * @interface OptimizationCoordinatorOptions
 * @description 最適化コーディネータのオプション
 */
export interface OptimizationCoordinatorOptions extends BaseCoordinatorOptions {
  /** カテゴリごとの最大推奨数 */
  maxRecommendationsPerCategory?: number;
  /** 優先順位付け戦略 */
  prioritizationStrategy?: 'impact' | 'effort' | 'balanced';
  /** 矛盾解決を有効にするか */
  enableConflictResolution?: boolean;
  /** 相乗効果検出を有効にするか */
  enableSynergyDetection?: boolean;
}

/**
 * @interface PrioritizedSuggestion
 * @description 優先度付き改善提案
 */
export interface PrioritizedSuggestion {
  id: string;
  category: 'theme' | 'style' | 'character' | 'tension' | 'integrated';
  title: string;
  description: string;
  implementation: string;
  priority: 'high' | 'medium' | 'low';
  impact: number; // 0-1
  effort: number; // 0-1
  dependencies: string[];
  relatedSuggestions: string[];
}

/**
 * @interface ConflictResolution
 * @description 推奨間の矛盾解決
 */
export interface ConflictResolution {
  conflictType: 'contradiction' | 'redundancy' | 'resource_conflict';
  description: string;
  conflictingSuggestions: string[];
  resolution: string;
  recommendedAction: string;
}

/**
 * @interface ImplementationStep
 * @description 実装ステップ
 */
export interface ImplementationStep {
  step: number;
  phase: 'preparation' | 'core_implementation' | 'refinement' | 'validation';
  suggestions: string[];
  description: string;
  estimatedEffort: 'low' | 'medium' | 'high';
}

/**
 * @interface SynergyOpportunity
 * @description 相乗効果機会
 */
export interface SynergyOpportunity {
  title: string;
  description: string;
  involvedSuggestions: string[];
  synergisticBenefit: string;
  implementationApproach: string;
}

/**
 * @interface IntegratedRecommendations
 * @description 統合推奨
 */
export interface IntegratedRecommendations {
  prioritizedSuggestions: PrioritizedSuggestion[];
  conflictResolutions: ConflictResolution[];
  implementationOrder: ImplementationStep[];
  synergisticOpportunities: SynergyOpportunity[];
}

/**
 * @interface ThemeOptimization
 * @description テーマ最適化結果
 */
export interface ThemeOptimization {
  themeEnhancements: ThemeEnhancement[];
  literaryInspirations: LiteraryInspiration;
  symbolicElements: SymbolicElement[];
  foreshadowingOpportunities: ForeshadowingOpportunity[];
  literaryTechniques: LiteraryTechnique[];
}

/**
 * @interface StyleOptimization
 * @description 文体最適化結果
 */
export interface StyleOptimization {
  styleGuidance: StyleGuidance;
  expressionAlternatives: ExpressionAlternatives;
  subjectPatternOptimization: SubjectPatternOptimization;
  structureRecommendations: StructureRecommendation[];
  repetitionAlternatives: RepetitionAlternative[];
}

/**
 * @interface CharacterOptimization
 * @description キャラクター最適化結果
 */
export interface CharacterOptimization {
  depthRecommendations: { [characterId: string]: DepthRecommendation[] };
  focusCharacters: string[];
  characterDepthPrompts: { [characterId: string]: CharacterDepthPrompt };
}

/**
 * @interface TensionOptimization
 * @description テンション最適化結果
 */
export interface TensionOptimization {
  tensionPacingRecommendation: TensionPacingRecommendation;
  tensionOptimizationSuggestions: string[];
  tensionCurve: TensionCurvePoint[];
  climaxRecommendation: {
    climaxChapter: number;
    secondaryClimaxChapters: number[];
    reason: string;
  };
}

/**
 * @interface OptimizationMetadata
 * @description 最適化メタデータ
 */
export interface OptimizationMetadata extends BaseMetadata {
  /** 最適化タイムスタンプ */
  optimizationTimestamp: string;
  /** 総推奨数 */
  totalRecommendations: number;
  /** 高優先度数 */
  highPriorityCount: number;
  /** 中優先度数 */
  mediumPriorityCount: number;
  /** 低優先度数 */
  lowPriorityCount: number;
}

/**
 * @interface IntegratedOptimizationResult
 * @description 統合最適化結果
 */
export interface IntegratedOptimizationResult {
  // テーマ最適化
  themeOptimization: ThemeOptimization;

  // 文体最適化
  styleOptimization: StyleOptimization;

  // キャラクター最適化
  characterOptimization: CharacterOptimization;

  // テンション最適化
  tensionOptimization: TensionOptimization;

  // 統合推奨
  integratedRecommendations: IntegratedRecommendations;

  // メタデータ
  optimizationMetadata: OptimizationMetadata;
}

/**
 * @interface OptimizationInput
 * @description 最適化入力データ
 */
export interface OptimizationInput {
  themeAnalysis: ThemeResonanceAnalysis;
  styleAnalysis: StyleAnalysis;
  expressionPatterns: ExpressionPatterns;
  qualityMetrics: QualityMetrics;
  characters?: Character[];
  characterPsychologies?: { [id: string]: CharacterPsychology };
}

/**
 * @interface IOptimizationCoordinator
 * @description 最適化コーディネータのインターフェース
 */
export interface IOptimizationCoordinator extends CacheableCoordinator {
  /**
   * 包括的章最適化を実行する
   * 
   * @param content 章の内容
   * @param chapterNumber 章番号
   * @param context 生成コンテキスト
   * @param analysisResults 分析結果
   * @returns 統合最適化結果
   */
  optimizeChapter(
    content: string,
    chapterNumber: number,
    context: GenerationContext,
    analysisResults: OptimizationInput
  ): Promise<IntegratedOptimizationResult>;
}

// =========================================================================
// 補助型定義（外部サービスから取得する想定）
// =========================================================================

/**
 * @interface ThemeEnhancement
 * @description テーマ強化
 */
export interface ThemeEnhancement {
  theme: string;
  currentStrength: number;
  suggestion: string;
  approach: string;
  example: string;
}

/**
 * @interface SymbolicElement
 * @description 象徴的要素
 */
export interface SymbolicElement {
  element: string;
  meaning: string;
  usage: string;
  chapter: number;
}

/**
 * @interface ForeshadowingOpportunity
 * @description 伏線機会
 */
export interface ForeshadowingOpportunity {
  opportunity: string;
  placement: string;
  resolution: string;
  impact: number;
}

/**
 * @interface StyleGuidance
 * @description 文体ガイダンス
 */
export interface StyleGuidance {
  general: string[];
  sentenceStructure: string[];
  vocabulary: string[];
  rhythm: string[];
}

/**
 * @interface ExpressionAlternatives
 * @description 表現代替案
 */
export interface ExpressionAlternatives {
  [originalExpression: string]: string[];
}

/**
 * @interface SubjectPatternOptimization
 * @description 主語パターン最適化
 */
export interface SubjectPatternOptimization {
  score: number;
  problems: string[];
  suggestions: string[];
}

/**
 * @interface StructureRecommendation
 * @description 構造推奨
 */
export interface StructureRecommendation {
  aspect: string;
  recommendation: string;
  reason: string;
  example: string;
}

/**
 * @interface RepetitionAlternative
 * @description 繰り返し代替案
 */
export interface RepetitionAlternative {
  originalPhrase: string;
  alternatives: string[];
  context: string;
}

/**
 * @interface DepthRecommendation
 * @description 深度推奨
 */
export interface DepthRecommendation {
  aspect: string;
  title: string;
  description: string;
  implementation: string;
  priority: number;
}

/**
 * @interface CharacterDepthPrompt
 * @description キャラクター深度プロンプト
 */
export interface CharacterDepthPrompt {
  characterId: string;
  focusAreas: string[];
  promptText: string;
  expectedOutcome: string;
}

/**
 * @interface TensionPacingRecommendation
 * @description テンションペース推奨
 */
export interface TensionPacingRecommendation {
  tension: {
    recommendedTension: number;
    reason: string;
    direction: 'increase' | 'decrease' | 'maintain';
  };
  pacing: {
    recommendedPacing: number;
    description: string;
  };
}

/**
 * @interface TensionCurvePoint
 * @description テンション曲線ポイント
 */
export interface TensionCurvePoint {
  chapter: number;
  tension: number;
  description: string;
  keyEvents: string[];
}

// =========================================================================
// ファクトリーインターフェース
// =========================================================================

/**
 * @interface CoordinatorFactory
 * @description コーディネータファクトリーインターフェース
 */
export interface CoordinatorFactory {
  /**
   * 分析コーディネータを作成する
   * 
   * @param options オプション
   * @returns 分析コーディネータ
   */
  createAnalysisCoordinator(options?: AnalysisCoordinatorOptions): IAnalysisCoordinator;

  /**
   * 最適化コーディネータを作成する
   * 
   * @param options オプション
   * @returns 最適化コーディネータ
   */
  createOptimizationCoordinator(options?: OptimizationCoordinatorOptions): IOptimizationCoordinator;
}

// =========================================================================
// 統合インターフェース
// =========================================================================

/**
 * @interface IntegratedCoordinatorService
 * @description 統合コーディネータサービス
 * 分析と最適化を組み合わせた高レベルインターフェース
 */
export interface IntegratedCoordinatorService {
  /**
   * 章の分析と最適化を統合実行する
   * 
   * @param content 章の内容
   * @param chapterNumber 章番号
   * @param context 生成コンテキスト
   * @returns 分析結果と最適化結果のペア
   */
  analyzeAndOptimizeChapter(
    content: string,
    chapterNumber: number,
    context: GenerationContext
  ): Promise<{
    analysis: IntegratedAnalysisResult;
    optimization: IntegratedOptimizationResult;
  }>;

  /**
   * 全キャッシュをクリアする
   */
  clearAllCaches(): void;
}

/**
 * @interface CoordinatorHealthCheck
 * @description コーディネータヘルスチェック
 */
export interface CoordinatorHealthCheck {
  /**
   * サービスの健全性をチェックする
   * 
   * @returns ヘルスステータス
   */
  checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      [serviceName: string]: {
        status: 'up' | 'down';
        responseTime?: number;
        error?: string;
      };
    };
    timestamp: string;
  }>;
}

/**
 * @type CoordinatorType
 * @description コーディネータの種類
 */
export type CoordinatorType = 'analysis' | 'optimization' | 'integrated';

/**
 * @type ProcessingStrategy
 * @description 処理戦略
 */
export type ProcessingStrategy = 'sequential' | 'parallel' | 'hybrid';

/**
 * @type CacheStrategy
 * @description キャッシュ戦略
 */
export type CacheStrategy = 'memory' | 'persistent' | 'distributed' | 'none';