// src/lib/editor/feedback-processor.ts
import { FeedbackHistory } from './feedback-history';
import { LearningEngine } from './learning-engine';
import { FeedbackType } from '@/types/editor';

/**
 * フィードバックの分類
 */
export interface ClassifiedFeedback {
  /** 元のフィードバック */
  originalFeedback: EditorFeedback;
  
  /** カテゴリー */
  categories: string[];
  
  /** 感情分析結果 */
  sentiment: {
    score: number;
    label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  };
  
  /** 優先度 */
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  
  /** 影響を受けるコンポーネント */
  affectedComponents: string[];
}

/**
 * アクションアイテム
 */
export interface ActionItem {
  /** タイトル */
  title: string;
  
  /** 説明 */
  description: string;
  
  /** 優先度 */
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  
  /** 担当者 */
  assignee: string;
  
  /** 期日 */
  dueDate: Date;
}

/**
 * フィードバック結果
 */
export interface FeedbackResult {
  /** 確認フラグ */
  acknowledged: boolean;
  
  /** 分類結果 */
  classification: ClassifiedFeedback;
  
  /** アクションアイテム */
  actionItems: ActionItem[];
  
  /** 影響評価 */
  impact: {
    scope: string;
    significance: number;
    suggestedChanges: string[];
  };
}

/**
 * 編集者フィードバック
 */
export interface EditorFeedback {
  /** チャプターID */
  chapterId: string;
  
  /** フィードバックタイプ */
  type: FeedbackType;
  
  /** フィードバック内容 */
  content: string;
  
  /** 評価 (1-5) */
  rating?: number;
  
  /** 提案 */
  suggestions?: string[];
  
  /** 編集者ID */
  editorId: string;
  
  /** タイムスタンプ */
  timestamp: Date;
}

/**
 * フィードバックプロセッサ
 * 編集者からのフィードバックを処理し、学習に活用するクラス
 */
export class FeedbackProcessor {
  private feedbackHistory: FeedbackHistory;
  private learningEngine: LearningEngine;
  
  constructor() {
    this.feedbackHistory = new FeedbackHistory();
    this.learningEngine = new LearningEngine();
  }
  
  /**
   * フィードバックを処理
   * @param feedback 編集者フィードバック
   * @returns 処理結果
   */
  async processFeedback(feedback: EditorFeedback): Promise<FeedbackResult> {
    console.log(`Processing feedback for chapter ${feedback.chapterId} of type ${feedback.type}`);
    
    // フィードバックの分類
    const classified = await this.classifyFeedback(feedback);
    
    // 学習システムへの反映
    await this.learningEngine.incorporateFeedback(classified);
    
    // アクションアイテムの生成
    const actionItems = await this.generateActionItems(classified);
    
    // 履歴に記録
    await this.feedbackHistory.record(feedback, classified, actionItems);
    
    // 影響評価
    const impact = await this.assessImpact(classified);
    
    return {
      acknowledged: true,
      classification: classified,
      actionItems,
      impact
    };
  }
  
  /**
   * フィードバック履歴を取得
   * @param timeRange 時間範囲（オプション）
   * @returns フィードバック履歴
   */
  async getFeedbackHistory(timeRange?: string): Promise<any> {
    // 時間範囲に基づいてフィルタリング
    let fromDate: Date | undefined;
    
    if (timeRange) {
      const now = new Date();
      
      switch (timeRange) {
        case 'today':
          fromDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          fromDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          fromDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        // その他の時間範囲...
      }
    }
    
    return await this.feedbackHistory.getHistory(fromDate);
  }
  
  /**
   * フィードバックの分類
   * @param feedback 編集者フィードバック
   * @returns 分類結果
   */
  private async classifyFeedback(feedback: EditorFeedback): Promise<ClassifiedFeedback> {
    // カテゴリーの特定
    const categories = await this.categorizeFeedback(feedback);
    
    // 感情分析
    const sentiment = await this.analyzeSentiment(feedback);
    
    // 優先度の計算
    const priority = this.calculatePriority(feedback, categories, sentiment);
    
    // 影響を受けるコンポーネントの特定
    const affectedComponents = this.identifyAffectedComponents(feedback);
    
    return {
      originalFeedback: feedback,
      categories,
      sentiment,
      priority,
      affectedComponents
    };
  }
  
  /**
   * フィードバックのカテゴリー分類
   * @param feedback 編集者フィードバック
   * @returns カテゴリーの配列
   */
  private async categorizeFeedback(feedback: EditorFeedback): Promise<string[]> {
    const categories: string[] = [];
    const content = feedback.content.toLowerCase();
    
    // feedbackのtypeに基づく基本カテゴリー
    categories.push(feedback.type);
    
    // コンテンツ分析による追加カテゴリー
    if (content.includes('キャラクター') || content.includes('人物')) {
      categories.push('CHARACTER');
    }
    
    if (content.includes('プロット') || content.includes('筋書き') || content.includes('ストーリー')) {
      categories.push('PLOT');
    }
    
    if (content.includes('文体') || content.includes('表現') || content.includes('言い回し')) {
      categories.push('STYLE');
    }
    
    if (content.includes('整合性') || content.includes('矛盾') || content.includes('一貫性')) {
      categories.push('CONSISTENCY');
    }
    
    if (content.includes('間違い') || content.includes('誤り') || content.includes('修正')) {
      categories.push('ERROR');
    }
    
    // 重複を削除
    return [...new Set(categories)];
  }
  
  /**
   * 感情分析
   * @param feedback 編集者フィードバック
   * @returns 感情分析結果
   */
  private async analyzeSentiment(feedback: EditorFeedback): Promise<{ score: number; label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' }> {
    // 実際の実装では感情分析APIを使用
    // ここでは簡易的な実装
    
    // レーティングに基づく感情スコア
    let score = 0;
    
    if (feedback.rating !== undefined) {
      // 1-5のレーティングを-1から1に変換
      score = (feedback.rating - 3) / 2;
    } else {
      // テキスト内容から感情スコアを推定
      const content = feedback.content.toLowerCase();
      
      // ポジティブワードの検出
      const positiveWords = ['良い', '素晴らしい', '気に入', '好き', '素敵', '感動', '面白い'];
      for (const word of positiveWords) {
        if (content.includes(word)) {
          score += 0.2;
        }
      }
      
      // ネガティブワードの検出
      const negativeWords = ['悪い', '問題', '修正', '誤り', '改善', '違和感', 'おかしい'];
      for (const word of negativeWords) {
        if (content.includes(word)) {
          score -= 0.2;
        }
      }
      
      // スコアを-1から1の範囲に制限
      score = Math.max(-1, Math.min(1, score));
    }
    
    // 感情ラベルの決定
    let label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    if (score > 0.2) {
      label = 'POSITIVE';
    } else if (score < -0.2) {
      label = 'NEGATIVE';
    } else {
      label = 'NEUTRAL';
    }
    
    return { score, label };
  }
  
  /**
   * 優先度の計算
   * @param feedback 編集者フィードバック
   * @param categories カテゴリー
   * @param sentiment 感情分析結果
   * @returns 優先度
   */
  private calculatePriority(
    feedback: EditorFeedback,
    categories: string[],
    sentiment: { score: number; label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' }
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    // 優先度スコアの計算
    let priorityScore = 0;
    
    // 感情がネガティブなほど優先度が高い
    if (sentiment.label === 'NEGATIVE') {
      priorityScore += 2;
    } else if (sentiment.label === 'NEUTRAL') {
      priorityScore += 1;
    }
    
    // 特定のカテゴリーは優先度が高い
    if (categories.includes('ERROR') || categories.includes('CONSISTENCY')) {
      priorityScore += 2;
    }
    
    if (categories.includes('CHARACTER') || categories.includes('PLOT')) {
      priorityScore += 1;
    }
    
    // レーティングに基づく優先度
    if (feedback.rating !== undefined) {
      if (feedback.rating <= 2) {
        priorityScore += 2;
      } else if (feedback.rating === 3) {
        priorityScore += 1;
      }
    }
    
    // 提案が含まれている場合は優先度を上げる
    if (feedback.suggestions && feedback.suggestions.length > 0) {
      priorityScore += 1;
    }
    
    // 優先度の決定
    if (priorityScore >= 4) {
      return 'HIGH';
    } else if (priorityScore >= 2) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }
  
  /**
   * 影響を受けるコンポーネントの特定
   * @param feedback 編集者フィードバック
   * @returns コンポーネントの配列
   */
  private identifyAffectedComponents(feedback: EditorFeedback): string[] {
    const components: string[] = [];
    const content = feedback.content.toLowerCase();
    
    // フィードバックタイプに基づくコンポーネント
    switch (feedback.type) {
      case 'CHARACTER':
        components.push('CHARACTER_MANAGER');
        break;
      case 'PLOT':
        components.push('PLOT_MANAGER');
        break;
      case 'CONSISTENCY':
        components.push('CONSISTENCY_CHECKER');
        break;
      case 'STYLE':
        components.push('STYLE_MANAGER');
        break;
      case 'QUALITY':
        components.push('QUALITY_CHECKER');
        break;
    }
    
    // コンテンツ分析による追加コンポーネント
    if (content.includes('生成') || content.includes('テキスト')) {
      components.push('GENERATION_ENGINE');
    }
    
    if (content.includes('記憶') || content.includes('以前の')) {
      components.push('MEMORY_MANAGER');
    }
    
    if (content.includes('キャラクター') || content.includes('人物')) {
      components.push('CHARACTER_MANAGER');
    }
    
    if (content.includes('伏線') || content.includes('回収')) {
      components.push('FORESHADOWING_MANAGER');
    }
    
    // 重複を削除
    return [...new Set(components)];
  }
  
  /**
   * アクションアイテムの生成
   * @param classified 分類されたフィードバック
   * @returns アクションアイテムの配列
   */
  private async generateActionItems(
    classified: ClassifiedFeedback
  ): Promise<ActionItem[]> {
    const items: ActionItem[] = [];
    const feedback = classified.originalFeedback;
    
    // 各カテゴリーに対するアクション
    for (const category of classified.categories) {
      const actions = await this.getActionsForCategory(category);
      
      for (const action of actions) {
        items.push({
          title: action.title,
          description: action.description,
          priority: classified.priority,
          assignee: this.determineAssignee(action, classified),
          dueDate: this.calculateDueDate(action, classified)
        });
      }
    }
    
    // フィードバック内容に基づくカスタムアクション
    if (feedback.content.includes('修正')) {
      items.push({
        title: 'コンテンツの修正',
        description: `フィードバックに基づいて内容を修正: "${feedback.content.substring(0, 50)}..."`,
        priority: classified.priority,
        assignee: 'SYSTEM',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1日後
      });
    }
    
    if (feedback.suggestions && feedback.suggestions.length > 0) {
      items.push({
        title: '提案の実装検討',
        description: `編集者の提案を検討: "${feedback.suggestions[0].substring(0, 50)}..."`,
        priority: classified.priority,
        assignee: 'REVIEWER',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3日後
      });
    }
    
    return items;
  }
  
  /**
   * カテゴリーに対するアクションを取得
   * @param category カテゴリー
   * @returns アクションの配列
   */
  private async getActionsForCategory(category: string): Promise<{ title: string; description: string }[]> {
    // カテゴリーごとのデフォルトアクション
    switch (category) {
      case 'CHARACTER':
        return [
          {
            title: 'キャラクター設定の確認',
            description: 'キャラクターの一貫性と魅力を確認し、必要に応じて調整'
          },
          {
            title: 'キャラクター表現の改善',
            description: 'キャラクターの表現方法や描写を見直し、より魅力的に'
          }
        ];
        
      case 'PLOT':
        return [
          {
            title: 'プロット要素の確認',
            description: 'ストーリーの流れや展開の論理性を確認'
          },
          {
            title: '伏線の配置/回収の確認',
            description: '伏線の効果的な配置と回収を確認'
          }
        ];
        
      case 'CONSISTENCY':
        return [
          {
            title: '整合性チェック実行',
            description: '物語全体の整合性を自動チェック'
          },
          {
            title: '矛盾点の修正',
            description: '指摘された矛盾点を修正'
          }
        ];
        
      case 'STYLE':
        return [
          {
            title: '文体の統一確認',
            description: '文体の一貫性を確認し調整'
          },
          {
            title: '表現の多様化',
            description: '表現のバリエーションを増やす'
          }
        ];
        
      case 'QUALITY':
        return [
          {
            title: '品質メトリクスの確認',
            description: '品質指標を確認し、弱点を特定'
          },
          {
            title: '生成設定の調整',
            description: '生成品質向上のためのパラメータ調整'
          }
        ];
        
      case 'ERROR':
        return [
          {
            title: 'エラー修正',
            description: '指摘されたエラーを修正'
          },
          {
            title: 'エラー防止策の実装',
            description: '同様のエラーを防ぐための仕組みを導入'
          }
        ];
        
      default:
        return [
          {
            title: 'フィードバックの確認',
            description: 'フィードバック内容を確認し適切に対応'
          }
        ];
    }
  }
  
  /**
   * 担当者の決定
   * @param action アクション
   * @param classified 分類されたフィードバック
   * @returns 担当者
   */
  private determineAssignee(
    action: { title: string; description: string },
    classified: ClassifiedFeedback
  ): string {
    // アクションタイトルに基づく担当者の決定
    if (action.title.includes('確認') || action.title.includes('チェック')) {
      return 'REVIEWER';
    }
    
    if (action.title.includes('修正') || action.title.includes('改善')) {
      return 'EDITOR';
    }
    
    if (action.title.includes('設定') || action.title.includes('調整')) {
      return 'ENGINEER';
    }
    
    // 優先度に基づく担当者の決定
    if (classified.priority === 'HIGH') {
      return 'LEAD_EDITOR';
    }
    
    // デフォルトの担当者
    return 'SYSTEM';
  }
  
  /**
   * 期日の計算
   * @param action アクション
   * @param classified 分類されたフィードバック
   * @returns 期日
   */
  private calculateDueDate(
    action: { title: string; description: string },
    classified: ClassifiedFeedback
  ): Date {
    const now = new Date();
    
    // 優先度に基づく基本期間
    let daysToAdd = 7; // デフォルト: 1週間
    
    if (classified.priority === 'HIGH') {
      daysToAdd = 1; // 高優先度: 1日
    } else if (classified.priority === 'MEDIUM') {
      daysToAdd = 3; // 中優先度: 3日
    }
    
    // アクションタイプに基づく調整
    if (action.title.includes('修正') || action.title.includes('エラー')) {
      daysToAdd = Math.max(1, daysToAdd - 1); // 修正は急ぐ
    }
    
    if (action.title.includes('確認') || action.title.includes('チェック')) {
      daysToAdd = Math.max(1, daysToAdd - 1); // 確認も急ぐ
    }
    
    if (action.title.includes('実装') || action.title.includes('導入')) {
      daysToAdd += 3; // 実装には時間がかかる
    }
    
    return new Date(now.setDate(now.getDate() + daysToAdd));
  }
  
  /**
   * 影響評価
   * @param classified 分類されたフィードバック
   * @returns 影響評価
   */
  private async assessImpact(classified: ClassifiedFeedback): Promise<any> {
    // 影響範囲を決定
    let scope = 'ISOLATED';
    
    if (classified.affectedComponents.length > 2) {
      scope = 'WIDESPREAD';
    } else if (classified.affectedComponents.length > 0) {
      scope = 'TARGETED';
    }
    
    // 重要度を計算
    let significance = 0.5; // デフォルト
    
    if (classified.priority === 'HIGH') {
      significance = 0.9;
    } else if (classified.priority === 'MEDIUM') {
      significance = 0.6;
    } else if (classified.priority === 'LOW') {
      significance = 0.3;
    }
    
    // カテゴリーによる調整
    if (classified.categories.includes('ERROR') || classified.categories.includes('CONSISTENCY')) {
      significance = Math.min(1.0, significance + 0.2);
    }
    
    if (classified.categories.includes('QUALITY') || classified.categories.includes('STYLE')) {
      significance = Math.max(0.1, significance - 0.1);
    }
    
    // 提案される変更
    const suggestedChanges = this.generateSuggestedChanges(classified);
    
    return {
      scope,
      significance,
      suggestedChanges
    };
  }
  
  /**
   * 提案される変更を生成
   * @param classified 分類されたフィードバック
   * @returns 提案される変更の配列
   */
  private generateSuggestedChanges(classified: ClassifiedFeedback): string[] {
    const changes: string[] = [];
    const feedback = classified.originalFeedback;
    
    // フィードバック自体の提案を優先
    if (feedback.suggestions && feedback.suggestions.length > 0) {
      changes.push(...feedback.suggestions);
    }
    
    // カテゴリーに基づくデフォルトの提案
    for (const category of classified.categories) {
      switch (category) {
        case 'CHARACTER':
          changes.push('キャラクターの内面描写を充実させる');
          changes.push('キャラクターの言動の一貫性を確保する');
          break;
          
        case 'PLOT':
          changes.push('ストーリー展開の論理性を向上させる');
          changes.push('伏線の回収を計画的に行う');
          break;
          
        case 'CONSISTENCY':
          changes.push('設定の整合性チェックを強化する');
          changes.push('記憶モジュールを改善する');
          break;
          
        case 'STYLE':
          changes.push('文体の多様性を向上させる');
          changes.push('表現の繰り返しを減らす');
          break;
          
        case 'QUALITY':
          changes.push('生成品質の自動チェックを強化する');
          changes.push('品質メトリクスを見直す');
          break;
          
        case 'ERROR':
          changes.push('エラー検出機能を強化する');
          changes.push('自動修正機能を改善する');
          break;
      }
    }
    
    // 重複を削除
    return [...new Set(changes)];
  }
}