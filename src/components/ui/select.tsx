// src/components/ui/select.tsx
import React from 'react';

/**
 * セレクトオプション
 */
export interface SelectOption {
  /**
   * オプション値
   */
  value: string;
  /**
   * 表示ラベル
   */
  label: string;
  /**
   * 無効化フラグ
   */
  disabled?: boolean;
}

/**
 * セレクトコンポーネントのプロップス
 */
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  /**
   * オプション配列
   */
  options: SelectOption[];
  /**
   * エラーメッセージ
   */
  error?: string;
  /**
   * ヘルプテキスト
   */
  helpText?: string;
  /**
   * プレースホルダー
   */
  placeholder?: string;
  /**
   * フルワイドスタイルの適用
   */
  fullWidth?: boolean;
}

/**
 * 汎用セレクトコンポーネント
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      options,
      error,
      helpText,
      placeholder,
      fullWidth = true,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-1">
        <select
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
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {(error || helpText) && (
          <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {error || helpText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';