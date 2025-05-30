// src\lib\analysis\enhancement\theme\interfaces.ts
/**
 * @fileoverview テーマ強化サービスのインターフェース定義
 * @description
 * テーマとモチーフの強化を担当するサービスのインターフェースを定義します。
 * 作品のテーマ性を深め、象徴と隠喩の使用提案、伏線設置と回収の最適化提案など、
 * 文学的な深みと一貫性を向上させるためのインターフェースを提供します。
 */

import {
  ThemeEnhancement,
  LiteraryInspiration,
  ThemeResonanceAnalysis,
  SymbolicElement,
  ForeshadowingOpportunity
} from '../../core/types';

/**
 * @interface IThemeEnhancementService
 * @description
 * テーマとモチーフの強化を担当するサービスのインターフェース。
 * テーマ共鳴強化の推奨、象徴と隠喩の使用提案、伏線設置と回収の最適化提案、
 * 文学的技法の推奨、一貫したテーマ発展の支援などの機能を提供します。
 */
export interface IThemeEnhancementService {
  /**
   * 初期化
   */
  initialize(): Promise<void>;
  
  /**
   * テーマ強化提案の生成
   * テーマ分析結果に基づいて、テーマをより効果的に表現するための提案を生成します。
   * 
   * @param themeAnalysis テーマ分析結果
   * @param chapterNumber 章番号
   * @param context コンテキスト情報（任意）
   * @returns テーマ強化提案の配列
   */
  generateThemeEnhancements(
    themeAnalysis: ThemeResonanceAnalysis,
    chapterNumber: number,
    context?: any
  ): Promise<ThemeEnhancement[]>;
  
  /**
   * 文学的技法提案の生成
   * 文学的技法の活用提案を生成します。
   * 
   * @param context コンテキスト情報
   * @param chapterNumber 章番号
   * @returns 文学的技法提案
   */
  generateLiteraryInspirations(
    context: any,
    chapterNumber: number
  ): Promise<LiteraryInspiration>;
  
  /**
   * 象徴要素の提案生成
   * テーマを強化するための象徴要素を提案します。
   * 
   * @param themes テーマ配列
   * @param chapterNumber 章番号
   * @param genre ジャンル
   * @returns 象徴要素の提案
   */
  suggestSymbolicElements(
    themes: string[],
    chapterNumber: number,
    genre?: string
  ): Promise<SymbolicElement[]>;
  
  /**
   * 伏線機会の検出
   * テキスト内の伏線設置機会を検出します。
   * 
   * @param content テキスト内容
   * @param chapterNumber 章番号
   * @param themes テーマ配列
   * @returns 伏線機会の配列
   */
  detectForeshadowingOpportunities(
    content: string,
    chapterNumber: number,
    themes: string[]
  ): Promise<ForeshadowingOpportunity[]>;
}