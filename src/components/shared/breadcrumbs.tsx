// src/components/shared/breadcrumbs.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * パンくずリンクの型定義
 */
interface BreadcrumbLink {
  /**
   * 表示名
   */
  name: string;
  /**
   * リンク先URL
   */
  href: string;
}

/**
 * パンくずリストのプロップス
 */
interface BreadcrumbsProps {
  /**
   * カスタムリンク（オプション）
   */
  links?: BreadcrumbLink[];
  /**
   * 自動生成を使用するか
   */
  useAutoGeneration?: boolean;
  /**
   * ホームリンクの名前
   */
  homeLabel?: string;
  /**
   * 除外するパスセグメント
   */
  excludeSegments?: string[];
  /**
   * セグメント名のマッピング
   */
  segmentMapping?: Record<string, string>;
}

/**
 * パンくずリストコンポーネント
 */
export function Breadcrumbs({
  links,
  useAutoGeneration = true,
  homeLabel = 'ホーム',
  excludeSegments = [],
  segmentMapping = {},
}: BreadcrumbsProps): React.ReactElement {
  const pathname = usePathname();
  
  // カスタムリンクが指定されている場合はそれを使用
  if (links) {
    return renderBreadcrumbs(links);
  }
  
  // 自動生成が無効な場合は空のパンくずを返す
  if (!useAutoGeneration) {
    return <></>;
  }
  
  // パスからリンクを自動生成
  const generateLinks = (): BreadcrumbLink[] => {
    if (!pathname) return [];
    
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbLinks: BreadcrumbLink[] = [{ name: homeLabel, href: '/' }];
    
    let currentPath = '';
    
    for (const segment of segments) {
      // 除外セグメントをスキップ
      if (excludeSegments.includes(segment)) continue;
      
      currentPath += `/${segment}`;
      
      // セグメント名をマッピングから取得または整形
      const segmentName = segmentMapping[segment] || formatSegmentName(segment);
      
      breadcrumbLinks.push({
        name: segmentName,
        href: currentPath,
      });
    }
    
    return breadcrumbLinks;
  };
  
  // セグメント名を整形する関数
  const formatSegmentName = (segment: string): string => {
    // 動的ルートパラメータを処理
    if (segment.startsWith('[') && segment.endsWith(']')) {
      return segment.slice(1, -1);
    }
    
    // キャメルケースやケバブケースをスペース区切りに変換し、先頭を大文字に
    return segment
      .replace(/[-_]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };
  
  return renderBreadcrumbs(generateLinks());
  
  // パンくずリストを描画する関数
  function renderBreadcrumbs(items: BreadcrumbLink[]): React.ReactElement {
    return (
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          {items.map((item, index) => (
            <li key={index} className="inline-flex items-center">
              {index > 0 && (
                <svg
                  className="w-3 h-3 mx-1 text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
              )}
              
              {index === items.length - 1 ? (
                // 現在のページ
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {item.name}
                </span>
              ) : (
                // リンク
                <Link
                  href={item.href}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  }
}