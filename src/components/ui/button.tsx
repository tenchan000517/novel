// src/components/ui/button.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// ボタンのバリエーションを定義
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-gray-400',
        ghost: 'hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-400',
        link: 'text-blue-600 hover:underline focus:ring-blue-500 p-0 h-auto',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

/**
 * ボタンコンポーネントのプロップス
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * 子要素
   */
  children: React.ReactNode;
  /**
   * フルワイドスタイルの適用
   */
  fullWidth?: boolean;
  /**
   * 読み込み状態
   */
  isLoading?: boolean;
}

/**
 * 汎用ボタンコンポーネント
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={`${buttonVariants({ variant, size })} ${fullWidth ? 'w-full' : ''} ${className || ''}`}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';