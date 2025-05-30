// src\lib\analysis\services\chapter\interfaces.ts
/**
 * @fileoverview 章分析サービスのインターフェース定義
 * @description
 * 章の構造、内容、パターンの詳細分析を行うサービスのインターフェース。
 */

import {
  GenerationContext,
  ChapterAnalysis,
  CharacterAppearance,
  ThemeOccurrence,
  ForeshadowingElement,
  QualityMetrics,
  Scene
} from '@/types/generation';

/**
 * @interface IChapterAnalysisService
 * @description 章の構造、内容、パターンの詳細分析を担当するサービスのインターフェース
 * 
 * このサービスは単一の章に対する基本的な分析を行い、以下の責任を持ちます：
 * - 章の構造（シーン、ストーリーフロー）分析
 * - キャラクターの登場と重要度分析
 * - テーマと伏線の検出（詳細な分析はThemeAnalysisServiceに委譲）
 * - 品質メトリクス計算
 * - テキスト統計分析
 */
export interface IChapterAnalysisService {
  /**
   * 章の内容を総合的に分析
   * 
   * キャラクター登場、テーマ出現、伏線要素、品質メトリクスなどを
   * 包括的に分析します。結果はキャッシュされます。
   * 
   * @param {string} content 章の内容
   * @param {number} chapterNumber 章番号
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {Promise<ChapterAnalysis>} 総合的な章分析結果
   */
  analyzeChapter(
    content: string,
    chapterNumber: number,
    context: GenerationContext
  ): Promise<ChapterAnalysis>;

  /**
   * 章の品質メトリクスを取得
   * 
   * 章の各品質メトリクス（読みやすさ、一貫性など）を取得します。
   * フル分析なしで品質のみが必要な場合に使用します。
   * 
   * @param {string} content 章の内容
   * @param {number} chapterNumber 章番号
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {Promise<QualityMetrics>} 品質メトリクス
   */
  getQualityMetrics(
    content: string,
    chapterNumber: number,
    context: GenerationContext
  ): Promise<QualityMetrics>;

  /**
   * 章のシーン情報のみを取得
   * 
   * 章の内容からシーン分割のみを行います。
   * 
   * @param {string} content 章の内容
   * @param {number} chapterNumber 章番号
   * @returns {Promise<Scene[]>} シーン情報
   */
  getScenes(content: string, chapterNumber: number): Promise<Scene[]>;

  /**
   * 章のキャラクター登場情報を取得
   * 
   * 章に登場するキャラクターとその重要度情報を取得します。
   * 
   * @param {string} content 章の内容
   * @param {number} chapterNumber 章番号
   * @param {GenerationContext} context 生成コンテキスト
   * @returns {Promise<CharacterAppearance[]>} キャラクター登場情報
   */
  getCharacterAppearances(
    content: string,
    chapterNumber: number,
    context: GenerationContext
  ): Promise<CharacterAppearance[]>;

  /**
   * 章のキーワードを抽出
   * 
   * 章の内容から重要なキーワードを抽出します。
   * 
   * @param {string} content 章の内容
   * @returns {Promise<string[]>} キーワード配列
   */
  extractKeywords(content: string): Promise<string[]>;
}

// エクスポート（シングルトンインスタンス作成後にこちらに変更する）
// export { chapterAnalysisService } from '@/lib/analysis/services/chapter/chapter-analysis-service';