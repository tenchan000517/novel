// src/components/shared/page-title.tsx
import React from 'react';

/**
 * ページタイトルコンポーネントのプロップス
 */
interface PageTitleProps {
  /**
   * タイトル
   */
  title: string;
  /**
   * サブタイトル
   */
  subtitle?: string;
  /**
   * アクション要素（ボタンなど）
   */
  actions?: React.ReactNode;
  /**
   * クラス名
   */
  className?: string;
}

/**
 * ページタイトルコンポーネント
 */
export function PageTitle({
  title,
  subtitle,
  actions,
  className = '',
}: PageTitleProps): React.ReactElement {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        {actions && <div className="mt-4 md:mt-0">{actions}</div>}
      </div>
    </div>
  );
}