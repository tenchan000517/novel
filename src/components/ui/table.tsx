// src/components/ui/table.tsx
import React from 'react';

/**
 * テーブルコンポーネント
 */
export const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => {
  return (
    <div className="w-full overflow-auto">
      <table
        ref={ref}
        className={`w-full caption-bottom text-sm ${className || ''}`}
        {...props}
      />
    </div>
  );
});

Table.displayName = 'Table';

/**
 * テーブルヘッダーコンポーネント
 */
export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  return (
    <thead
      ref={ref}
      className={`border-b bg-gray-50 dark:bg-gray-800 ${className || ''}`}
      {...props}
    />
  );
});

TableHeader.displayName = 'TableHeader';

/**
 * テーブル本体コンポーネント
 */
export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  return <tbody ref={ref} className={`${className || ''}`} {...props} />;
});

TableBody.displayName = 'TableBody';

/**
 * テーブルフッターコンポーネント
 */
export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  return (
    <tfoot
      ref={ref}
      className={`border-t bg-gray-50 dark:bg-gray-800 font-medium ${className || ''}`}
      {...props}
    />
  );
});

TableFooter.displayName = 'TableFooter';

/**
 * テーブル行コンポーネント
 */
export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => {
  return (
    <tr
      ref={ref}
      className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800 ${className || ''}`}
      {...props}
    />
  );
});

TableRow.displayName = 'TableRow';

/**
 * テーブルヘッダーセルコンポーネント
 */
export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  return (
    <th
      ref={ref}
      className={`h-12 px-4 text-left align-middle font-medium text-gray-700 dark:text-gray-300 ${className || ''}`}
      {...props}
    />
  );
});

TableHead.displayName = 'TableHead';

/**
 * テーブルセルコンポーネント
 */
export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  return (
    <td
      ref={ref}
      className={`p-4 align-middle ${className || ''}`}
      {...props}
    />
  );
});

TableCell.displayName = 'TableCell';

/**
 * テーブルキャプションコンポーネント
 */
export const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => {
  return (
    <caption
      ref={ref}
      className={`mt-4 text-sm text-gray-500 dark:text-gray-400 ${className || ''}`}
      {...props}
    />
  );
});

TableCaption.displayName = 'TableCaption';