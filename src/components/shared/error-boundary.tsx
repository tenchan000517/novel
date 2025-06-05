// src/components/shared/error-boundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/utils/logger';

/**
 * エラーバウンダリーコンポーネントのプロップス
 */
interface ErrorBoundaryProps {
  /**
   * 子要素
   */
  children: ReactNode;
  /**
   * カスタムフォールバックUI
   */
  fallback?: ReactNode;
  /**
   * エラー発生時のコールバック
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * エラーバウンダリーコンポーネントの状態
 */
interface ErrorBoundaryState {
  /**
   * エラーが発生したかどうか
   */
  hasError: boolean;
  /**
   * エラーオブジェクト
   */
  error?: Error;
}

/**
 * エラーバウンダリーコンポーネント
 * 子コンポーネントでエラーが発生した場合にフォールバックUIを表示
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // エラー状態を更新
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // エラーをログに記録
    logger.error('コンポーネントエラーが発生しました:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // カスタムエラーハンドラーを呼び出し
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  // エラー状態をリセット
  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // カスタムフォールバックUIがあればそれを表示
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // デフォルトのフォールバックUI
      return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            コンポーネントエラー
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            コンポーネントの表示中にエラーが発生しました。もう一度お試しください。
          </p>
          
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md overflow-auto">
              <p className="font-mono text-sm text-red-500">
                {this.state.error.message}
              </p>
              <p className="font-mono text-xs text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-wrap">
                {this.state.error.stack}
              </p>
            </div>
          )}
          
          <Button onClick={this.handleReset}>再試行</Button>
        </div>
      );
    }

    return this.props.children;
  }
}