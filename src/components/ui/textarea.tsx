// src/components/ui/textarea.tsx
import React from 'react';

/**
 * テキストエリアのプロップス
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * エラーメッセージ
   */
  error?: string;
  /**
   * ヘルプテキスト
   */
  helpText?: string;
  /**
   * フルワイドスタイルの適用
   */
  fullWidth?: boolean;
}

/**
 * 汎用テキストエリアコンポーネント
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, helpText, fullWidth = true, disabled, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <textarea
          className={`
            block rounded-md border-gray-300 shadow-sm
            focus:border-blue-500 focus:ring-blue-500
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
            ${fullWidth ? 'w-full' : ''}
            ${className || ''}
          `}
          ref={ref}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        
        {(error || helpText) && (
          <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {error || helpText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';