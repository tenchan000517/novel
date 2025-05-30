/**
 * @fileoverview サービスインターフェース定義
 * @description
 * アプリケーション全体で使用される主要なインターフェースを定義します。
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
} from './types';

/**
 * 主語パターン最適化のリクエスト
 */
export interface SubjectPatternOptimizationRequest {
  repeatedSubjects: Array<{
    subject: string;
    count: number;
  }>;
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
   * @param styleAnalysis 文体分析結果
   * @param context コンテキスト情報（ジャンル、テーマなど）
   * @param chapterNumber 章番号
   * @returns 文体ガイダンス
   */
  generateStyleGuidance(
    chapterNumber: number,  // ← 実装に合わせる
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
 * @interface ICacheStorage
 * @description 有効期限つきのキャッシュストレージインターフェース
 */
export interface ICacheStorage {
  /**
   * キャッシュに値を設定
   * @param key キー
   * @param value 値
   * @param ttl 有効期限（ミリ秒）
   */
  set<T>(key: string | number, value: T, ttl?: number): void;
  
  /**
   * キャッシュから値を取得
   * @param key キー
   * @returns キャッシュ値（存在しないかExpireしている場合はnull）
   */
  get<T>(key: string | number): T | null;
  
  /**
   * キャッシュから項目を削除
   * @param key キー
   * @returns 削除成功時はtrue
   */
  delete(key: string | number): boolean;
  
  /**
   * キャッシュをクリア
   */
  clear(): void;
  
  /**
   * 指定したプレフィックスを持つキーのエントリをすべて削除
   * @param prefix キープレフィックス
   */
  deleteByPrefix(prefix: string): void;
  
  /**
   * 期限切れのエントリを削除
   */
  removeExpired(): void;
  
  /**
   * キャッシュの数を取得
   * @returns キャッシュエントリ数
   */
  size(): number;
}

