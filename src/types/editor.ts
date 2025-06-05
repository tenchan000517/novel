// src/types/editor.ts
/**
 * 編集者インターフェースに関連する型定義
 */

/**
 * 介入タイプ
 */
export type InterventionType = 'CHARACTER' | 'PLOT' | 'MEMORY' | 'GENERATION' | 'SYSTEM';

/**
 * 介入ターゲット
 */
export type InterventionTarget = 'CURRENT_CHAPTER' | 'FUTURE_CHAPTERS' | 'CHARACTER' | 'MEMORY' | 'WORLD_SETTINGS';

/**
 * 編集者介入リクエスト
 */
export interface InterventionRequest {
  /** 介入タイプ */
  type: InterventionType;
  
  /** 介入ターゲット */
  target: InterventionTarget;
  
  /** 自然言語コマンド */
  command: string;
  
  /** 追加パラメータ */
  parameters?: Record<string, unknown>;
}

/**
 * 編集者介入レスポンス
 */
export interface InterventionResponse {
  /** 成功フラグ */
  success: boolean;
  
  /** 実行されたアクション */
  actionsTaken: {
    type: string;
    description: string;
  }[];
  
  /** 影響を受けたコンポーネント */
  affectedComponents: {
    component: string;
    impact: string;
  }[];
  
  /** 編集者フィードバック */
  feedback: {
    message: string;
    suggestions: string[];
  };
}

/**
 * フィードバックタイプ
 */
export type FeedbackType = 'QUALITY' | 'CONSISTENCY' | 'PLOT' | 'CHARACTER' | 'STYLE';

/**
 * 編集者フィードバックリクエスト
 */
export interface FeedbackRequest {
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
}

/**
 * 編集者フィードバックレスポンス
 */
export interface FeedbackResponse {
  /** 確認フラグ */
  acknowledged: boolean;
  
  /** アクションアイテム */
  actionItems: {
    action: string;
    priority: 'low' | 'medium' | 'high';
  }[];
  
  /** 学習ポイント */
  learningPoints: {
    description: string;
    applicationAreas: string[];
  }[];
}

/**
 * パラメータ定義
 */
export interface Parameter {
    name: string;
    type: string;
    required: boolean;
    defaultValue?: any;
  }
  
  /**
   * コマンド定義
   */
  export interface Command {
    type: string;
    action: string;
    intent: string;
    parameters: Parameter[];
  }
  
  /**
   * 解析済みコマンド
   */
  export interface ParsedCommand {
    text: string;
    tokens: string[];
    entities: Record<string, any>;
    confidence: number;
  }
  
  /**
   * 解釈済みコマンド
   */
  export interface InterpretedCommand {
    type: string;
    action: string;
    parameters: Record<string, any>;
    confidence: number;
    originalCommand: string;
  }