// src/config/environment.ts
/**
 * 環境設定
 */

import { Environment, CURRENT_ENV } from './constants';
import { logger, LogLevel } from '../lib/utils/logger';

/**
 * 環境ごとの設定
 */
interface EnvironmentConfig {
  /**
   * ログレベル
   */
  logLevel: LogLevel;
  
  /**
   * Gemini API設定
   */
  gemini: {
    /**
     * APIキー
     */
    apiKey: string | undefined;
    
    /**
     * レート制限（リクエスト/分）
     */
    rateLimit: number;
  };
  
  /**
   * GitHub設定
   */
  github: {
    /**
     * トークン
     */
    token: string | undefined;
    
    /**
     * リポジトリ
     */
    repo: string | undefined;
    
    /**
     * ブランチ
     */
    branch: string;
  };
  
  /**
   * ストレージ設定
   */
  storage: {
    /**
     * ローカルストレージを使用するか
     */
    useLocalStorage: boolean;
    
    /**
     * ローカルストレージのベースディレクトリ
     */
    localStorageDir: string;
  };
  
  /**
   * アプリケーション設定
   */
  app: {
    /**
     * アプリケーションURL
     */
    url: string;
    
    /**
     * API URL
     */
    apiUrl: string;
  };
}

/**
 * 開発環境設定
 */
const developmentConfig: EnvironmentConfig = {
  logLevel: LogLevel.DEBUG,
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    rateLimit: 100,
  },
  github: {
    token: process.env.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || 'develop',
  },
  storage: {
    useLocalStorage: process.env.ENABLE_LOCAL_STORAGE === 'true',
    localStorageDir: process.env.LOCAL_STORAGE_DIR || 'data',
  },
  app: {
    url: 'http://localhost:3000',
    apiUrl: 'http://localhost:3000/api',
  },
};

/**
 * ステージング環境設定
 */
const stagingConfig: EnvironmentConfig = {
  logLevel: LogLevel.INFO,
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    rateLimit: 300,
  },
  github: {
    token: process.env.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || 'staging',
  },
  storage: {
    useLocalStorage: false,
    localStorageDir: 'data',
  },
  app: {
    url: process.env.APP_URL || 'https://staging.auto-novel-system.com',
    apiUrl: process.env.API_URL || 'https://staging.auto-novel-system.com/api',
  },
};

/**
 * 本番環境設定
 */
const productionConfig: EnvironmentConfig = {
  logLevel: LogLevel.WARN,
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    rateLimit: 600,
  },
  github: {
    token: process.env.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || 'main',
  },
  storage: {
    useLocalStorage: false,
    localStorageDir: 'data',
  },
  app: {
    url: process.env.APP_URL || 'https://auto-novel-system.com',
    apiUrl: process.env.API_URL || 'https://auto-novel-system.com/api',
  },
};

/**
 * 環境ごとの設定マップ
 */
const configMap: Record<Environment, EnvironmentConfig> = {
  [Environment.DEVELOPMENT]: developmentConfig,
  [Environment.STAGING]: stagingConfig,
  [Environment.PRODUCTION]: productionConfig,
};

/**
 * 現在の環境設定を取得
 */
export const config = configMap[CURRENT_ENV];

/**
 * ロガーの設定を更新
 */
logger.updateOptions({
  minLevel: config.logLevel,
  serviceName: 'auto-novel-system',
});
