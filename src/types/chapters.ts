// src/types/chapters.ts
import { Scene, ChapterAnalysis } from './generation'; // ←これだけ！

/**
 * チャプター情報
 */
export interface Chapter {
  /**
   * チャプターID
   */
  id: string;

  /**
   * チャプタータイトル
   */
  title: string;

  /**
   * チャプター番号
   */
  chapterNumber: number;

  /**
   * チャプター本文
   */
  content: string;

  /**
   * 単語数
   */
  wordCount?: number;

  /**
   * 作成日時
   */
  createdAt: Date;

  /**
   * 最終更新日時
   */
  updatedAt: Date;

  /**
   * チャプター要約
   */
  summary?: string;

  /**
   * シーン情報
   */
  scenes?: Scene[];

  /**
   * 分析情報
   */
  analysis?: ChapterAnalysis;

  /**
   * メタデータ
   */
  metadata: ChapterMetadata;

  // テスト用のプロパティを追加
  previousChapterSummary?: string;
}


/**
 * チャプターメタデータ
 */
export interface ChapterMetadata {
  /**
   * 視点キャラクター
   */
  pov?: string;

  /**
   * 主な舞台
   */
  location?: string;

  /**
   * 時間設定
   */
  timeframe?: string;

  /**
   * 感情基調
   */
  emotionalTone?: string;

  /**
   * 重要キーワード
   */
  keywords?: string[];

  /**
   * 品質スコア
   */
  qualityScore?: number;

  /**
   * イベント
   */
  events?: any[];

  /**
   * 登場キャラクター
   */
  characters?: any[];

  /**
   * 伏線
   */
  foreshadowing?: any[];

  /**
   * 伏線回収
   */
  resolutions?: any[];

  /**
   * 修正履歴
   */
  correctionHistory?: any[];

  updatedAt?: Date; // ← これでOK

  plotConsistencyResult?: 'CONSISTENT' | 'ISSUES_DETECTED' | 'UNKNOWN';

  /**
   * その他のメタデータ
   */
  [key: string]: any;
}