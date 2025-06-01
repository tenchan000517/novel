// src\lib\analysis\services\narrative\interfaces.ts
/**
 * @fileoverview 物語分析サービスインターフェース定義
 * @description
 * 物語構造とフローを分析するサービスのインターフェースを定義します。
 * アーク、テンション、流れ、パターンを分析し、一貫性のある物語展開を支援します。
 */

import { Chapter } from '@/types/chapters';
import { 
  NarrativeState, 
  NarrativeStateInfo, 
  TurningPoint, 
  StateTransition, 
  StagnationDetectionResult, 
  EmotionalCurvePoint 
} from '@/lib/memory/long-term/types';
import { 
  SceneStructureAnalysis, 
  SceneRecommendation, 
  LiteraryInspiration 
} from '@/types/generation';
import { GeminiClient } from '@/lib/generation/gemini-client';

/**
 * @interface GenerationContext
 * @description 生成コンテキスト情報
 */
export interface GenerationContext {
  /** 世界設定 */
  worldSettings?: string;
  /** 章番号 */
  chapterNumber: number;
  /** 総章数 */
  totalChapters?: number;
  /** ジャンル */
  genre?: string;
  /** その他の任意のプロパティ */
  [key: string]: any;
}

/**
 * @interface NarrativeAnalysisOptions
 * @description 物語分析サービスの設定オプション
 */
export interface NarrativeAnalysisOptions {
  /** Gemini APIクライアント */
  geminiClient?: GeminiClient;
  /** ジャンル */
  genre?: string;
}

/**
 * @interface INarrativeAnalysisService
 * @description 物語構造とフローを分析するサービスのインターフェース
 * 
 * このサービスは物語のアークとフェーズ、テンション、流れ、パターンを分析し、
 * 一貫性のある物語展開と品質向上をサポートします。
 */
export interface INarrativeAnalysisService {
  /**
   * シーン構造を分析
   * @param lastChapters 分析対象の章数
   * @returns シーン構造分析結果
   */
  analyzeSceneStructure(lastChapters?: number): Promise<SceneStructureAnalysis>;

  /**
   * シーン推奨を生成
   * @param chapterNumber 章番号
   * @returns シーン推奨の配列
   */
  generateSceneRecommendations(chapterNumber: number): Promise<SceneRecommendation[]>;

  /**
   * 文学的インスピレーションを生成
   * @param context コンテキスト情報
   * @param chapterNumber 章番号
   * @returns 文学的インスピレーション
   */
  generateLiteraryInspirations(
    context: GenerationContext,
    chapterNumber: number
  ): Promise<LiteraryInspiration>;

  /**
   * すべてのターニングポイントを取得
   * @returns ターニングポイントの配列
   */
  getTurningPoints(): TurningPoint[];

  /**
   * 特定の章のターニングポイントを取得
   * @param chapterNumber 章番号
   * @returns ターニングポイント（存在しない場合はnull）
   */
  getTurningPointForChapter(chapterNumber: number): TurningPoint | null;

  /**
   * ジャンルを設定
   * @param genre ジャンル
   */
  setGenre(genre: string): void;

  /**
   * 現在のジャンルを取得
   * @returns ジャンル
   */
  getGenre(): string;

  /**
   * 現在のテンションレベルを取得
   * @returns テンションレベル（0-10）
   */
  getCurrentTensionLevel(): number;

  /**
   * 章の要約を取得
   * @param chapterNumber 章番号
   * @returns 要約テキスト（存在しない場合はnull）
   */
  getChapterSummary(chapterNumber: number): string | null;
}

/**
 * @interface INarrativeAnalysisServiceFactory
 * @description 物語分析サービスのファクトリーインターフェース
 * 物語分析サービスのインスタンスを作成するファクトリー
 */
export interface INarrativeAnalysisServiceFactory {
  /**
   * 物語分析サービスのインスタンスを作成
   * @param options 設定オプション
   * @returns 物語分析サービスのインスタンス
   */
  createNarrativeAnalysisService(options?: NarrativeAnalysisOptions): INarrativeAnalysisService;
}

/**
 * @interface ISceneStructureOptimizer
 * @description シーン構造最適化のインターフェース
 */
export interface ISceneStructureOptimizer {
  /**
   * シーン構造分析
   * @param chapters 分析対象の章配列
   * @returns シーン構造分析結果
   */
  analyzeSceneStructure(chapters: Chapter[]): SceneStructureAnalysis;
  
  /**
   * シーン推奨生成
   * @param analysis シーン構造分析結果
   * @param chapterNumber 対象章番号
   * @returns シーン推奨の配列
   */
  generateSceneRecommendations(
    analysis: SceneStructureAnalysis, 
    chapterNumber: number
  ): Promise<SceneRecommendation[]>;
}

/**
 * @interface ILiteraryComparisonSystem
 * @description 文学的比較分析を提供するインターフェース
 */
export interface ILiteraryComparisonSystem {
  /**
   * 文学的インスピレーションを生成する
   * @param context 生成コンテキスト
   * @param chapterNumber 章番号
   * @returns 文学的インスピレーション
   */
  generateLiteraryInspirations(
    context: GenerationContext,
    chapterNumber: number
  ): Promise<LiteraryInspiration>;
  
  /**
   * ジャンルと参考作品から特定の文学的テクニックの詳細を取得する
   * @param genre ジャンル
   * @param techniqueType テクニックの種類（'plot', 'character', 'atmosphere'）
   * @param techniqueName テクニック名
   * @returns テクニックの詳細
   */
  getTechniqueDetails(
    genre: string,
    techniqueType: 'plot' | 'character' | 'atmosphere',
    techniqueName: string
  ): Promise<any | null>;
  
  /**
   * 物語の現在の状態に基づいて関連する文学作品を推薦する
   * @param context 生成コンテキスト
   * @param currentThemes 現在のテーマ（配列）
   * @returns 推薦作品とその関連性
   */
  recommendRelatedWorks(
    context: GenerationContext,
    currentThemes: string[]
  ): Promise<Array<{ title: string, author: string, relevance: string }>>;
  
  /**
   * 特定の物語要素に関する文学的アプローチを分析する
   * @param elementType 要素タイプ（'conflict', 'resolution', 'revelation'など）
   * @param elementContext 要素の文脈情報
   * @param genre ジャンル
   * @returns 文学的アプローチのガイダンス
   */
  analyzeNarrativeElement(
    elementType: string,
    elementContext: string,
    genre: string
  ): Promise<{ approaches: string[], examples: string[] }>;
}