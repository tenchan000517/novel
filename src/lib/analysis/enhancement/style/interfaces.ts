// src\lib\analysis\enhancement\style\interfaces.ts
/**
 * @fileoverview 文体と表現の最適化サービスのインターフェース定義
 * @description
 * StyleOptimizationServiceが実装すべきメソッドを定義します。
 * 文体ガイダンス生成、代替表現提案、主語パターン最適化、文構造改善、
 * 繰り返し表現の代替案生成などの機能を提供します。
 */

import {
  StyleGuidance,
  ExpressionAlternatives,
  StyleAnalysis,
  ExpressionPatterns
} from '@/types/generation';

import {
  SubjectPatternOptimization,
  StructureRecommendation,
  RepetitionAlternative
} from '@/lib/analysis/core/types';

/**
 * 主語パターン最適化のリクエスト
 */
export interface SubjectPatternOptimizationRequest {
  /** 繰り返されている主語のパターン */
  repeatedSubjects: Array<{
    /** 主語 */
    subject: string;
    /** 繰り返し回数 */
    count: number;
  }>;
  /** 主語多様性スコア（0-1、高いほど多様） */
  subjectDiversityScore: number;
}

/**
 * @interface IStyleOptimizationService
 * @description
 * 文体と表現の最適化を担当するサービスのインターフェース。
 * 文体ガイダンス生成、表現多様化の推奨、繰り返し表現の改善提案などの機能を提供します。
 */
export interface IStyleOptimizationService {
  /**
   * 文体ガイダンス生成
   * 文体改善のためのガイダンスを生成します
   * 
   * @param chapterNumber 章番号
   * @param context コンテキスト情報（ジャンル、テーマなど）
   * @returns 文体ガイダンス
   */
  generateStyleGuidance(
    chapterNumber: number,
    context: any
  ): Promise<StyleGuidance>;

  /**
   * 代替表現提案
   * 繰り返しを避けるための代替表現を提案します
   * 
   * @param expressionPatterns 表現パターン分析結果
   * @param context コンテキスト情報（ジャンル、テーマなど）
   * @returns 代替表現提案
   */
  suggestAlternativeExpressions(
    expressionPatterns: ExpressionPatterns,
    context: any
  ): Promise<ExpressionAlternatives>;

  /**
   * 主語パターン最適化提案
   * 主語の使用パターンを最適化するための提案を生成します
   * 
   * @param subjectPatterns 主語パターン分析結果
   * @param context コンテキスト情報
   * @returns 主語パターン最適化提案
   */
  optimizeSubjectPatterns(
    subjectPatterns: SubjectPatternOptimizationRequest,
    context: any
  ): Promise<SubjectPatternOptimization>;

  /**
   * 文構造の改善提案を生成
   * 文の構造を改善するための提案を生成します
   * 
   * @param styleAnalysis 文体分析結果
   * @param context コンテキスト情報
   * @returns 文構造改善提案
   */
  generateStructureRecommendations(
    styleAnalysis: StyleAnalysis,
    context: any
  ): Promise<StructureRecommendation[]>;

  /**
   * 繰り返し表現の代替提案を生成
   * 繰り返し使用されている表現の代替案を提案します
   * 
   * @param repetitions 繰り返し表現のリスト
   * @param context コンテキスト情報
   * @returns 繰り返し表現の代替提案
   */
  generateRepetitionAlternatives(
    repetitions: string[],
    context: any
  ): Promise<RepetitionAlternative[]>;
}

/**
 * 文体最適化コンテキスト情報
 */
export interface StyleOptimizationContext {
  /** ジャンル */
  genre?: string;
  /** テーマ */
  theme?: string;
  /** テンション値（0-1） */
  tension?: number;
  /** ペーシング値（0-1） */
  pacing?: number;
  /** ターゲット読者層 */
  targetAudience?: string;
  /** 文体の方向性 */
  styleDirection?: 'formal' | 'casual' | 'literary' | 'commercial';
  /** 追加の制約やガイドライン */
  constraints?: string[];
}

/**
 * 文体最適化オプション
 */
export interface StyleOptimizationOptions {
  /** AI分析を使用するかどうか */
  useAIAnalysis?: boolean;
  /** 詳細レベル（1-3、高いほど詳細） */
  detailLevel?: number;
  /** キャッシュを使用するかどうか */
  useCache?: boolean;
  /** 最大提案数 */
  maxSuggestions?: number;
  /** 分析対象となる最小文字数 */
  minContentLength?: number;
}

/**
 * 文体最適化結果
 */
export interface StyleOptimizationResult {
  /** 文体ガイダンス */
  styleGuidance?: StyleGuidance;
  /** 代替表現提案 */
  expressionAlternatives?: ExpressionAlternatives;
  /** 主語パターン最適化 */
  subjectOptimization?: SubjectPatternOptimization;
  /** 文構造改善提案 */
  structureRecommendations?: StructureRecommendation[];
  /** 繰り返し表現代替案 */
  repetitionAlternatives?: RepetitionAlternative[];
  /** 処理にかかった時間（ミリ秒） */
  processingTime?: number;
  /** 使用されたキャッシュ数 */
  cacheHits?: number;
}

/**
 * 一括最適化リクエスト
 */
export interface BulkOptimizationRequest {
  /** 章番号 */
  chapterNumber: number;
  /** 文体分析結果 */
  styleAnalysis: StyleAnalysis;
  /** 表現パターン */
  expressionPatterns: ExpressionPatterns;
  /** 主語パターン分析結果 */
  subjectPatterns: SubjectPatternOptimizationRequest;
  /** 繰り返し表現リスト */
  repetitions: string[];
  /** コンテキスト情報 */
  context: StyleOptimizationContext;
  /** オプション */
  options?: StyleOptimizationOptions;
}

/**
 * 拡張インターフェース - 将来の機能追加用
 */
export interface IStyleOptimizationServiceExtended extends IStyleOptimizationService {
  /**
   * 一括最適化処理
   * 複数の最適化機能を一度に実行します
   * 
   * @param request 一括最適化リクエスト
   * @returns 最適化結果
   */
  bulkOptimize?(request: BulkOptimizationRequest): Promise<StyleOptimizationResult>;

  /**
   * 最適化履歴の取得
   * 過去の最適化結果を取得します
   * 
   * @param chapterNumber 章番号
   * @param limit 取得件数制限
   * @returns 最適化履歴
   */
  getOptimizationHistory?(chapterNumber: number, limit?: number): Promise<StyleOptimizationResult[]>;

  /**
   * キャッシュのクリア
   * 指定した章または全体のキャッシュを削除します
   * 
   * @param chapterNumber 章番号（省略時は全体）
   */
  clearCache?(chapterNumber?: number): Promise<void>;

  /**
   * サービスの健全性チェック
   * サービスが正常に動作しているかチェックします
   * 
   * @returns 健全性チェック結果
   */
  healthCheck?(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      cacheStatus: string;
      aiServiceStatus: string;
      lastOptimizationTime?: number;
    };
  }>;
}