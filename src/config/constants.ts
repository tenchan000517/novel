// src/config/constants.ts
/**
 * アプリケーション全体で使用される定数
 */

/**
 * アプリケーション環境
 */
export enum Environment {
    DEVELOPMENT = 'development',
    STAGING = 'staging',
    PRODUCTION = 'production',
  }
  
  /**
   * 現在の環境
   */
  export const CURRENT_ENV = (process.env.NODE_ENV || 'development') as Environment;
  
  /**
   * アプリケーション名
   */
  export const APP_NAME = 'Auto Novel System';
  
  /**
   * キャラクタータイプ
   */
  export enum CharacterType {
    MAIN = 'MAIN',
    SUB = 'SUB',
    MOB = 'MOB',
  }
  
  /**
   * キャラクター役割
   */
  export enum CharacterRole {
    PROTAGONIST = 'PROTAGONIST',
    ANTAGONIST = 'ANTAGONIST',
    MENTOR = 'MENTOR',
    ALLY = 'ALLY',
    RIVAL = 'RIVAL',
    OTHER = 'OTHER',
  }
  
  /**
   * 記憶タイプ
   */
  export enum MemoryType {
    SHORT_TERM = 'SHORT_TERM',
    MID_TERM = 'MID_TERM',
    LONG_TERM = 'LONG_TERM',
  }
  
  /**
   * API関連の定数
   */
  export const API = {
    /**
     * API バージョン
     */
    VERSION: 'v1',
    
    /**
     * 最大ページサイズ
     */
    MAX_PAGE_SIZE: 100,
    
    /**
     * デフォルトページサイズ
     */
    DEFAULT_PAGE_SIZE: 20,
    
    /**
     * レート制限（リクエスト/分）
     */
    RATE_LIMIT: 60,
  };
  
  /**
   * 生成関連の定数
   */
  export const GENERATION = {
    /**
     * デフォルトの目標文字数
     */
    DEFAULT_TARGET_LENGTH: 8000,
    
    /**
     * 文字数許容範囲（±）
     */
    LENGTH_TOLERANCE: 0.1,
    
    /**
     * 最大再試行回数
     */
    MAX_RETRIES: 3,
    
    /**
     * 短期記憶の最大チャプター数
     */
    SHORT_TERM_MEMORY_SIZE: 10,
    
    /**
     * 中期記憶の圧縮閾値
     */
    MID_TERM_COMPRESSION_THRESHOLD: 5,
  };
  
  /**
   * ストレージ関連の定数
   */
  export const STORAGE = {
    /**
     * 設定ディレクトリ
     */
    CONFIG_DIR: 'config',
    
    /**
     * キャラクターディレクトリ
     */
    CHARACTERS_DIR: 'characters',
    
    /**
     * チャプターディレクトリ
     */
    CHAPTERS_DIR: 'chapters',
    
    /**
     * 記憶ディレクトリ
     */
    MEMORY_DIR: 'memory',
    
    /**
     * ファイル拡張子
     */
    EXTENSIONS: {
      /**
       * YAMLファイル
       */
      YAML: '.yaml',
      
      /**
       * Markdownファイル
       */
      MARKDOWN: '.md',
    },
  };