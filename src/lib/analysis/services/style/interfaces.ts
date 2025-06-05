// src\lib\analysis\services\style\interfaces.ts
/**
 * @fileoverview 文体と表現パターンの分析サービスのインターフェース定義
 * @description
 * StyleAnalysisServiceが実装すべきメソッドを定義します。
 */

import {
  StyleAnalysis,
  StyleGuidance,
  ExpressionPatterns,
  ExpressionAlternatives
} from '@/types/generation';
import { ExpressionUsageResult } from '@/lib/analysis/core/types';

/**
 * 主語パターン分析用のインターフェース
 */
export interface SubjectPatternAnalysis {
  repeatedSubjects: RepeatedSubjectPattern[];
  subjectDiversityScore: number;
  suggestions: string[];
}

/**
 * 繰り返し主語パターンの詳細
 */
export interface RepeatedSubjectPattern {
  subject: string;
  count: number;
  startIndex: number;
  endIndex: number;
}

/**
 * @interface IStyleAnalysisService
 * @description 文体と表現パターンの分析を行うサービスのインターフェース
 */
export interface IStyleAnalysisService {
  /**
   * 初期化
   * サービスの初期化処理を行います
   */
  initialize(): Promise<void>;

  /**
   * 文体分析
   * テキストの文体特性を分析します
   * 
   * @param content テキスト内容
   * @returns 文体分析結果
   */
  analyzeStyle(content: string): Promise<StyleAnalysis>;

  /**
   * 表現パターン分析
   * テキストの表現パターンを分析します
   * 
   * @param content テキスト内容
   * @returns 表現パターン分析結果
   */
  analyzeExpressionPatterns(content: string): Promise<ExpressionPatterns>;

  /**
   * 主語パターン分析
   * テキストの主語使用パターンを分析します
   * 
   * @param content テキスト内容
   * @returns 主語パターン分析結果
   */
  analyzeSubjectPatterns(content: string): Promise<SubjectPatternAnalysis>;

  /**
   * 表現分析
   * テキスト内の特徴的な表現パターン、繰り返し使用されている表現などを
   * 検出し分析します。
   * 
   * @param content テキスト内容
   * @returns 分析結果
   */
  analyzeExpressions(content: string): Promise<ExpressionUsageResult>;

  /**
   * スタイル改善提案の生成
   * 
   * 章分析結果に基づいてスタイル改善の提案を生成します
   * 
   * @param analysis 章分析結果
   * @param chapterNumber 章番号
   * @returns 改善提案の配列
   */
  generateStyleImprovementSuggestions?(analysis: any, chapterNumber: number): Promise<string[]>;
}