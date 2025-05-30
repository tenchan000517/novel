// src/lib/utils/error-handler.ts
/**
 * アプリケーション全体で使用するエラーハンドリング機能
 */

import { logger } from './logger';

export type LogMetadata = Record<string, unknown>;

/**
 * アプリケーション固有のエラー基底クラス
 */
export class AppError extends Error {
  /**
   * エラーコード
   */
  public readonly code: string;
  
  /**
   * HTTPステータスコード
   */
  public readonly statusCode: number;
  
  /**
   * 追加詳細情報
   */
  public readonly details?: Record<string, unknown>;
  
  /**
   * エラーを初期化
   * @param message エラーメッセージ
   * @param code エラーコード
   * @param statusCode HTTPステータスコード
   * @param details 追加詳細情報
   */
  constructor(
    message: string,
    code = 'INTERNAL_ERROR',
    statusCode = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    
    // Error スタックトレースを正しく設定
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

/**
 * リソースが見つからないエラー
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

/**
 * 権限エラー
 */
export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 'FORBIDDEN', 403);
  }
}

/**
 * 外部サービスのエラー
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: Record<string, unknown>) {
    super(`${service} service error: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502, details);
  }
}

/**
 * レート制限エラー
 */
export class RateLimitError extends AppError {
  constructor(service: string, resetTime?: Date) {
    super(
      `Rate limit exceeded for ${service}`,
      'RATE_LIMIT_EXCEEDED',
      429,
      resetTime ? { resetAt: resetTime.toISOString() } : undefined
    );
  }
}

/**
 * エラーのスタックトレースとメタデータをログ出力
 * @param error エラーオブジェクトまたは任意のエラー値
 * @param metadata 追加メタデータ
 * @param message オプションのカスタムエラーメッセージ
 */
export function logError(
    error: unknown, 
    metadata?: Record<string, unknown>,
    message?: string
  ): void {
    // エラーオブジェクトの型確認と変換
    const errorDetails: Record<string, unknown> = {
      ...metadata,
    };
    
    if (error instanceof Error) {
      errorDetails.name = error.name;
      errorDetails.message = error.message;
      errorDetails.stack = error.stack;
      
      if (error instanceof AppError) {
        errorDetails.code = error.code;
        errorDetails.statusCode = error.statusCode;
        errorDetails.details = error.details;
      }
    } else {
      errorDetails.value = String(error);
      errorDetails.type = typeof error;
    }
    
    const logMessage = message || 
      (error instanceof Error ? `Error occurred: ${error.message}` : 'Unknown error occurred');
    
    logger.error(logMessage, errorDetails);
  }

/**
 * エラーをAPIレスポンス形式に変換
 * @param error エラーオブジェクト
 * @returns APIレスポンス形式のエラーオブジェクト
 */
export function formatErrorResponse(error: Error): {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
} {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }
  
  // 未知のエラーの場合は一般的なエラーメッセージを返す
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : error.message,
    },
  };
}

/**
 * API関数のエラーハンドリングをラップする高階関数
 * @param fn API関数
 * @returns ラップされた関数
 */
export function withErrorHandling<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error as Error, { args });
      throw error;
    }
  };
}

// src/lib/utils/error-handler.ts に追加
/**
 * 警告をログに記録する
 * @param message 警告メッセージ
 * @param error エラーオブジェクトまたは任意のエラー値
 * @param metadata 追加メタデータ
 */
export function logWarn(
    message: string,
    error: unknown, 
    metadata?: Record<string, unknown>
  ): void {
    const warnDetails: Record<string, unknown> = {
      ...metadata,
    };
    
    if (error instanceof Error) {
      warnDetails.name = error.name;
      warnDetails.message = error.message;
      warnDetails.stack = error.stack;
      
      if (error instanceof AppError) {
        warnDetails.code = error.code;
        warnDetails.statusCode = error.statusCode;
        warnDetails.details = error.details;
      }
    } else {
      warnDetails.value = String(error);
      warnDetails.type = typeof error;
    }
    
    logger.warn(message, warnDetails);
  }

  export class GenerationError extends Error {
    constructor(
      message: string,
      public readonly code: string = 'GENERATION_ERROR',
      public readonly details?: Record<string, unknown>
    ) {
      super(message);
      this.name = 'GenerationError';
    }
  }

  /**
 * 未知のエラーから安全にメッセージを抽出
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
  }