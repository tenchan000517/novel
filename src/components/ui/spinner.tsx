// src/components/ui/spinner.tsx
import React from 'react';

/**
 * スピナーコンポーネントのプロップス
 */
export interface SpinnerProps {
  /**
   * サイズ
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * カラー
   */
  color?: 'primary' | 'secondary' | 'gray';
  /**
   * クラス名
   */
  className?: string;
}

/**
 * 読み込み中を示すスピナーコンポーネント
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
}) => {
  // サイズに応じたクラス
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  // 色に応じたクラス
  const colorClasses = {
    primary: 'border-blue-600',
    secondary: 'border-gray-600',
    gray: 'border-gray-300',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-solid border-current border-t-transparent ${sizeClasses[size]} ${colorClasses[color]} ${className || ''}`}
      role="status"
      aria-label="読み込み中"
    />
  );
};