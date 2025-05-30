/**
 * 篇の状態
 */
export enum SectionState {
    NOT_STARTED = 'NOT_STARTED',   // 未開始
    IN_PROGRESS = 'IN_PROGRESS',   // 進行中
    COMPLETED = 'COMPLETED'        // 完了
  }
  
  /**
   * 篇の完了メトリクス
   */
  export interface SectionCompletionMetrics {
    embodimentLevel: number;       // 概念体現レベル (0-1)
    completionChapter: number;     // 完了章番号
    emotionalImpact: number;       // 感情的インパクト (1-10)
    completionTimestamp: string;   // 完了日時
  }
  
  /**
   * 篇の定義
   */
  export interface Section {
    id: string;                    // 篇ID
    number: number;                // 篇番号
    title: string;                 // 篇タイトル
    mainConcept: string;           // 主要概念
    startChapter: number;          // 開始章番号
    endChapter: number;            // 終了章番号（推定）
    description: string;           // 篇の説明
    learningGoals: string[];       // 学習目標
    state: SectionState;           // 状態
    progress: number;              // 進捗 (0-1)
    completionMetrics?: SectionCompletionMetrics; // 完了メトリクス
  }