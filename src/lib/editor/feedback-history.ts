// src/lib/editor/feedback-history.ts
import { EditorFeedback, ClassifiedFeedback, ActionItem } from './feedback-processor';

/**
 * フィードバック履歴エントリ
 */
export interface FeedbackHistoryEntry {
  /** フィードバック */
  feedback: EditorFeedback;
  
  /** 分類結果 */
  classification: ClassifiedFeedback;
  
  /** アクションアイテム */
  actionItems: ActionItem[];
  
  /** アクション状態 */
  actionStatus: {
    completedCount: number;
    totalCount: number;
    lastUpdate: Date;
  };
  
  /** 学習ステータス */
  learningStatus: {
    applied: boolean;
    model: string;
    timestamp: Date;
  };
}

/**
 * フィードバック履歴管理クラス
 */
export class FeedbackHistory {
  private history: FeedbackHistoryEntry[] = [];
  private maxHistorySize = 1000;
  
  constructor() {
    this.loadHistory();
  }
  
  /**
   * フィードバックを記録
   * @param feedback 編集者フィードバック
   * @param classification 分類結果
   * @param actionItems アクションアイテム
   * @returns 成功フラグ
   */
  async record(
    feedback: EditorFeedback,
    classification: ClassifiedFeedback,
    actionItems: ActionItem[]
  ): Promise<boolean> {
    const entry: FeedbackHistoryEntry = {
      feedback,
      classification,
      actionItems,
      actionStatus: {
        completedCount: 0,
        totalCount: actionItems.length,
        lastUpdate: new Date()
      },
      learningStatus: {
        applied: false,
        model: 'pending',
        timestamp: new Date()
      }
    };
    
    // 履歴に追加
    this.history.unshift(entry);
    
    // 最大サイズを超えた場合、古いエントリを削除
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
    
    // 保存
    this.saveHistory();
    
    return true;
  }
  
  /**
   * 履歴を取得
   * @param fromDate 開始日時
   * @returns 履歴エントリの配列
   */
  async getHistory(fromDate?: Date): Promise<FeedbackHistoryEntry[]> {
    if (!fromDate) {
      return this.history;
    }
    
    // 指定日時以降のエントリをフィルタリング
    return this.history.filter(entry => 
      new Date(entry.feedback.timestamp) >= fromDate
    );
  }
  
  /**
   * アクション状態を更新
   * @param feedbackId フィードバックID
   * @param completedCount 完了したアクション数
   * @returns 成功フラグ
   */
  async updateActionStatus(
    feedbackId: string,
    completedCount: number
  ): Promise<boolean> {
    const entry = this.history.find(e => e.feedback.chapterId === feedbackId);
    
    if (!entry) {
      return false;
    }
    
    entry.actionStatus = {
      completedCount: Math.min(completedCount, entry.actionItems.length),
      totalCount: entry.actionItems.length,
      lastUpdate: new Date()
    };
    
    this.saveHistory();
    
    return true;
  }
  
  /**
   * 学習状態を更新
   * @param feedbackId フィードバックID
   * @param applied 適用フラグ
   * @param model モデル名
   * @returns 成功フラグ
   */
  async updateLearningStatus(
    feedbackId: string,
    applied: boolean,
    model: string
  ): Promise<boolean> {
    const entry = this.history.find(e => e.feedback.chapterId === feedbackId);
    
    if (!entry) {
      return false;
    }
    
    entry.learningStatus = {
      applied,
      model,
      timestamp: new Date()
    };
    
    this.saveHistory();
    
    return true;
  }
  
  /**
   * 履歴をロード
   */
  private loadHistory(): void {
    // 実際の実装ではローカルストレージまたはデータベースから読み込み
    
    // ダミーデータ
    this.history = [
      {
        feedback: {
          chapterId: 'chapter-42',
          type: 'CHARACTER',
          content: '鈴木美咲のキャラクターがブレているように感じます。もっと内向的なはずではないでしょうか？',
          rating: 3,
          editorId: 'editor-1',
          timestamp: new Date(Date.now() - 86400000) // 1日前
        },
        classification: {
          originalFeedback: {} as EditorFeedback, // ダミー
          categories: ['CHARACTER', 'CONSISTENCY'],
          sentiment: { score: -0.3, label: 'NEGATIVE' },
          priority: 'MEDIUM',
          affectedComponents: ['CHARACTER_MANAGER', 'CONSISTENCY_CHECKER']
        },
        actionItems: [
          {
            title: 'キャラクター設定の確認',
            description: '鈴木美咲のキャラクター設定を確認し、一貫性を確保',
            priority: 'MEDIUM',
            assignee: 'REVIEWER',
            dueDate: new Date(Date.now() + 86400000) // 1日後
          }
        ],
        actionStatus: {
          completedCount: 0,
          totalCount: 1,
          lastUpdate: new Date(Date.now() - 86400000)
        },
        learningStatus: {
          applied: false,
          model: 'pending',
          timestamp: new Date(Date.now() - 86400000)
        }
      },
      {
        feedback: {
          chapterId: 'chapter-41',
          type: 'PLOT',
          content: '伏線の回収が不十分です。第35章で言及されていた古代の剣についてもっと掘り下げるべきです。',
          rating: 2,
          editorId: 'editor-2',
          timestamp: new Date(Date.now() - 172800000) // 2日前
        },
        classification: {
          originalFeedback: {} as EditorFeedback, // ダミー
          categories: ['PLOT', 'CONSISTENCY'],
          sentiment: { score: -0.5, label: 'NEGATIVE' },
          priority: 'HIGH',
          affectedComponents: ['PLOT_MANAGER', 'FORESHADOWING_MANAGER']
        },
        actionItems: [
          {
            title: '伏線の回収確認',
            description: '古代の剣に関する伏線の回収状況を確認',
            priority: 'HIGH',
            assignee: 'LEAD_EDITOR',
            dueDate: new Date(Date.now() - 86400000) // 1日前（期限切れ）
          }
        ],
        actionStatus: {
          completedCount: 1,
          totalCount: 1,
          lastUpdate: new Date(Date.now() - 43200000) // 12時間前
        },
        learningStatus: {
          applied: true,
          model: 'plot-consistency-v2',
          timestamp: new Date(Date.now() - 21600000) // 6時間前
        }
      }
    ];
  }
  
  /**
   * 履歴を保存
   */
  private saveHistory(): void {
    // 実際の実装ではローカルストレージまたはデータベースに保存
    console.log(`Saved ${this.history.length} feedback history entries`);
  }
}