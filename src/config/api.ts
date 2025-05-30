
// src/config/api.ts
/**
 * API設定
 */

import { config } from './environment';
import { API } from './constants';

/**
 * API基本設定
 */
export const apiConfig = {
  /**
   * APIベースURL
   */
  baseUrl: config.app.apiUrl,
  
  /**
   * APIバージョン
   */
  version: API.VERSION,
  
  /**
   * デフォルトのヘッダー
   */
  headers: {
    'Content-Type': 'application/json',
  },
  
  /**
   * タイムアウト（ミリ秒）
   */
  timeout: 30000,
  
  /**
   * リクエスト再試行設定
   */
  retry: {
    /**
     * 最大再試行回数
     */
    maxRetries: 3,
    
    /**
     * 初期遅延（ミリ秒）
     */
    initialDelay: 300,
    
    /**
     * 遅延倍率
     */
    backoffFactor: 2,
  },
};

/**
 * Gemini API設定
 */
export const geminiApiConfig = {
  /**
   * APIベースURL
   */
  baseUrl: 'https://generativelanguage.googleapis.com',
  
  /**
   * APIバージョン
   */
  version: 'v1',
  
  /**
   * APIキー
   */
  apiKey: config.gemini.apiKey,
  
  /**
   * レート制限（リクエスト/分）
   */
  rateLimit: config.gemini.rateLimit,
  
  /**
   * タイムアウト（ミリ秒）
   */
  timeout: 60000,
  
  /**
   * デフォルトのモデル
   */
  defaultModel: 'gemini-pro',
  
  /**
   * 再試行設定
   */
  retry: {
    maxRetries: 2,
    initialDelay: 500,
    backoffFactor: 1.5,
  },
};

/**
 * API エンドポイント
 */
export const apiEndpoints = {
  /**
   * 生成関連
   */
  generation: {
    /**
     * チャプター生成
     */
    chapter: '/generation/chapter',
    
    /**
     * コンテキスト取得
     */
    context: '/generation/context',
    
    /**
     * 検証
     */
    validate: '/generation/validate',
  },
  
  /**
   * キャラクター関連
   */
  characters: {
    /**
     * 一覧・作成
     */
    base: '/characters',
    
    /**
     * 個別操作
     */
    detail: (id: string) => `/characters/${id}`,
    
    /**
     * 昇格
     */
    promote: '/characters/promote',
    
    /**
     * 関係性
     */
    relationships: '/characters/relationships',
  },
  
  /**
   * 記憶関連
   */
  memory: {
    /**
     * 基本操作
     */
    base: '/memory',
    
    /**
     * 検索
     */
    search: '/memory/search',
    
    /**
     * 同期
     */
    sync: '/memory/sync',
  },
  
  /**
   * 編集者関連
   */
  editor: {
    /**
     * 介入
     */
    intervention: '/editor/intervention',
    
    /**
     * フィードバック
     */
    feedback: '/editor/feedback',
  },
  
  /**
   * 分析関連
   */
  analysis: {
    /**
     * 品質分析
     */
    quality: '/analysis/quality',
    
    /**
     * メトリクス
     */
    metrics: '/analysis/metrics',
  },
};