// src\lib\analysis\services\theme\interfaces.ts
/**
 * @fileoverview サービスインターフェース定義
 * @description
 * アプリケーション全体で使用される各種サービスのインターフェースを定義します。
 */

import {
  ThemeResonanceAnalysis,
  ThemeEnhancement,
  ForeshadowingElement,
  SymbolismAnalysis,
  ThemePresenceVisualization,
  ThemeElementResonance,
  ThemeConsistencyAnalysis,
  ThemeImageryMapping,
  MotifTrackingResult
} from '../../core/types';

/**
 * @interface IThemeAnalysisService
 * @description
 * テーマ分析サービスのインターフェース。
 * テーマの分析、伏線の処理、モチーフの追跡、象徴の分析などの機能を提供します。
 */
export interface IThemeAnalysisService {
  /**
   * テーマ共鳴分析を実行
   * テキスト内のテーマ表現を分析し、各テーマの強度や表現方法を評価します
   * 
   * @param content 分析対象のテキスト
   * @param themes テーマの配列
   * @returns テーマ共鳴分析結果
   */
  analyzeThemeResonance(content: string, themes: string[]): Promise<ThemeResonanceAnalysis>;

  /**
   * 伏線処理を実行
   * 章の内容から伏線を検出、追跡、生成します
   * 
   * @param content 章コンテンツ
   * @param chapterNumber 章番号
   * @returns 処理結果
   */
  processForeshadowing(content: string, chapterNumber: number): Promise<{
    resolvedForeshadowing: ForeshadowingElement[];
    generatedCount: number;
    totalActive: number;
  }>;

  /**
   * 解決された伏線を検出する
   * 
   * @param content 章コンテンツ
   * @param chapterNumber 章番号
   * @returns 解決された伏線配列
   */
  detectResolvedForeshadowing(content: string, chapterNumber: number): Promise<ForeshadowingElement[]>;

  /**
   * 新しい伏線を生成する
   * 
   * @param content 章コンテンツ
   * @param chapterNumber 章番号
   * @returns 生成された伏線配列
   */
  generateNewForeshadowing(content: string, chapterNumber: number): Promise<ForeshadowingElement[]>;

  /**
   * テーマ存在の可視化
   * 章の内容からテーマの表現度合いを可視化します
   * 
   * @param content 章の内容
   * @param theme テーマ
   * @returns 可視化情報
   */
  visualizeThemePresence(content: string, theme: string): Promise<ThemePresenceVisualization>;

  /**
   * テーマと物語要素の関連性を分析する
   * 
   * @param theme テーマ
   * @param elementType 物語要素タイプ（'character', 'setting', 'conflict' など）
   * @param context 物語要素の文脈情報
   * @returns 関連性分析と強化提案
   */
  analyzeThemeElementResonance(
    theme: string,
    elementType: string,
    context: string
  ): Promise<ThemeElementResonance>;

  /**
   * 象徴とイメージの分析
   * テキスト内の象徴、隠喩、比喩などを分析します
   * 
   * @param content 分析対象のテキスト
   * @returns 象徴分析結果
   */
  analyzeSymbolismAndImagery(content: string): Promise<SymbolismAnalysis>;

  /**
   * テーマの一貫性分析
   * 複数の章にわたるテーマの一貫性と発展を分析します
   * 
   * @param contents 章ごとの内容の配列
   * @param theme 分析対象のテーマ
   * @returns テーマ一貫性分析結果
   */
  analyzeThemeConsistency(contents: string[], theme: string): Promise<ThemeConsistencyAnalysis>;

  /**
   * イメージマップの作成
   * 作品全体の象徴とイメージのマッピングを作成します
   * 
   * @param contents 章ごとの内容の配列
   * @returns イメージマップ
   */
  createImageryMapping(contents: string[]): Promise<ThemeImageryMapping>;

  /**
   * モチーフの追跡
   * 特定のモチーフが物語全体でどのように出現し発展するかを追跡します
   * 
   * @param motif モチーフ名
   * @param contents 章ごとの内容の配列
   * @returns モチーフ追跡結果
   */
  trackMotif(motif: string, contents: string[]): Promise<MotifTrackingResult>;

  /**
   * テーマ強化提案を保存する
   * 次の章用のテーマ強化提案を保存します
   * 
   * @param chapterNumber 章番号
   * @param enhancements テーマ強化提案の配列
   * @returns 処理完了後に解決するPromise
   */
  saveThemeEnhancements(chapterNumber: number, enhancements: ThemeEnhancement[]): Promise<void>;
}

/**
 * テーマ分析サービスのファクトリーインターフェース
 * テーマ分析サービスのインスタンスを作成するファクトリー
 */
export interface IThemeAnalysisServiceFactory {
  /**
   * テーマ分析サービスのインスタンスを作成
   * @returns テーマ分析サービスのインスタンス
   */
  createThemeAnalysisService(): IThemeAnalysisService;
}

/**
 * メモリマネージャーインターフェース
 * 物語のメモリを管理するコンポーネント
 */
export interface IMemoryManager {
  /**
   * 長期記憶を取得
   * @returns 長期記憶へのアクセスオブジェクト
   */
  getLongTermMemory(): any;

  /**
   * 物語の状態を取得
   * @param chapterNumber 章番号
   * @returns 物語の状態オブジェクト
   */
  getNarrativeState(chapterNumber: number): Promise<any>;

  /**
   * 最近の章のメモリを取得
   * @param startChapter 開始章番号
   * @param count 取得する章数
   * @returns 章のメモリ配列
   */
  getRecentChapterMemories(startChapter: number, count: number): Promise<any[]>;

  /**
   * 現在のアークを取得
   * @param chapterNumber 章番号
   * @returns 現在のアーク情報
   */
  getCurrentArc(chapterNumber: number): Promise<any>;

  /**
   * 伏線状態を更新
   * @param resolvedForeshadowing 解決された伏線の配列
   * @param chapterNumber 章番号
   * @returns 更新完了後に解決するPromise
   */
  updateForeshadowingStatus(resolvedForeshadowing: any[], chapterNumber: number): Promise<void>;
}