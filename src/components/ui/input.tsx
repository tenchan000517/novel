// src/components/ui/input.tsx
import React from 'react';

/**
 * 入力フィールドのプロップス
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * エラーメッセージ
   */
  error?: string;
  /**
   * ヘルプテキスト
   */
  helpText?: string;
  /**
   * 入力フィールドの左側に表示するアイコンまたは要素
   */
  startAdornment?: React.ReactNode;
  /**
   * 入力フィールドの右側に表示するアイコンまたは要素
   */
  endAdornment?: React.ReactNode;
  /**
   * フルワイドスタイルの適用
   */
  fullWidth?: boolean;
}

/**
 * 汎用入力フィールドコンポーネント
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      error,
      helpText,
      startAdornment,
      endAdornment,
      fullWidth = true,
      disabled,
      ...props
    },
    ref
  ) => {
    // 入力フィールドのクラス
    const inputClasses = `
      block rounded-md border-gray-300 shadow-sm
      focus:border-blue-500 focus:ring-blue-500
      ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
      ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
      ${fullWidth ? 'w-full' : ''}
      ${startAdornment ? 'pl-10' : ''}
      ${endAdornment ? 'pr-10' : ''}
      ${className || ''}
    `;

    // ラッパーのクラス
    const wrapperClasses = `
      relative
      ${fullWidth ? 'w-full' : 'inline-block'}
    `;

    return (
      <div className="space-y-1">
        <div className={wrapperClasses}>
          {startAdornment && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              {startAdornment}
            </div>
          )}
          
          <input
            className={inputClasses}
            ref={ref}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
          
          {endAdornment && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
              {endAdornment}
            </div>
          )}
        </div>
        
        {(error || helpText) && (
          <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {error || helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';