import React from 'react';

/**
 * カードコンポーネントのプロップス
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 子要素
   */
  children: React.ReactNode;
  /**
   * 影のサイズ
   */
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  /**
   * ボーダー有無
   */
  bordered?: boolean;
}

/**
 * 汎用カードコンポーネント
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, shadow = 'md', bordered = true, children, ...props }, ref) => {
    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow',
      lg: 'shadow-lg',
    };

    return (
      <div
        className={`
          bg-white dark:bg-gray-800 
          rounded-lg 
          ${bordered ? 'border border-gray-200 dark:border-gray-700' : ''}
          ${shadowClasses[shadow]}
          overflow-hidden
          ${className || ''}
        `}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * カードヘッダーコンポーネント
 */
export const CardHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * カードタイトルコンポーネント
 */
export const CardTitle = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3
      className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className || ''}`}
      {...props}
    >
      {children}
    </h3>
  );
};

/**
 * カード説明コンポーネント
 */
export const CardDescription = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${className || ''}`}
      {...props}
    >
      {children}
    </p>
  );
};

/**
 * カード本文コンポーネント
 */
export const CardBody = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`px-6 py-4 ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

/**
 * カード本文コンポーネント（CardBodyの別名）
 */
export const CardContent = CardBody;

/**
 * カードフッターコンポーネント
 */
export const CardFooter = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};