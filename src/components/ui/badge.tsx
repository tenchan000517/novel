// src/components/ui/badge.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// バッジのバリエーションを定義
const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-blue-100 text-blue-800',
        secondary: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        danger: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-indigo-100 text-indigo-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * バッジコンポーネントのプロップス
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * バッジコンポーネント
 * ステータスや分類を表示するための小さなラベル
 */
export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${badgeVariants({ variant })} ${className || ''}`}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';