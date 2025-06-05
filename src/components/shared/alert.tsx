// src/components/shared/alert.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// アラートのバリエーションを定義
const alertVariants = cva(
  'relative w-full rounded-lg border p-4',
  {
    variants: {
      variant: {
        info: 'bg-blue-50 text-blue-800 border-blue-200',
        success: 'bg-green-50 text-green-800 border-green-200',
        warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        error: 'bg-red-50 text-red-800 border-red-200',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

/**
 * アラートコンポーネントのプロップス
 */
export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /**
   * アラートのタイトル
   */
  title?: string;
  /**
   * アイコン要素
   */
  icon?: React.ReactNode;
  /**
   * 閉じるボタンを表示するかどうか
   */
  closable?: boolean;
  /**
   * 閉じるボタンがクリックされたときのコールバック
   */
  onClose?: () => void;
}

/**
 * アラートコンポーネント
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant,
      title,
      icon,
      closable = false,
      onClose,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`${alertVariants({ variant })} ${className || ''}`}
        role="alert"
        {...props}
      >
        <div className="flex items-start">
          {icon && <div className="flex-shrink-0 mr-3">{icon}</div>}
          <div className="flex-1">
            {title && <h5 className="text-sm font-medium mb-1">{title}</h5>}
            <div className="text-sm">{children}</div>
          </div>
          {closable && onClose && (
            <button
              type="button"
              className="flex-shrink-0 ml-3 h-5 w-5 inline-flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
              onClick={onClose}
            >
              <span className="sr-only">閉じる</span>
              <svg
                className="h-3 w-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';