// src/components/shared/navigation.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * ナビゲーションアイテムの型定義
 */
interface NavItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
}

/**
 * ナビゲーションセクションの型定義
 */
interface NavSection {
  title?: string;
  items: NavItem[];
}

/**
 * ナビゲーションコンポーネントのプロップス
 */
interface NavigationProps {
  sections: NavSection[];
  className?: string;
}

/**
 * サイドナビゲーションコンポーネント
 */
export function Navigation({ sections, className = '' }: NavigationProps): React.ReactElement {
  const pathname = usePathname();
  
  // パスが現在のリンクと一致しているか確認する関数
  const isActive = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href) || false;
  };

  return (
    <nav className={`space-y-6 ${className}`}>
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-1">
          {section.title && (
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </h3>
          )}
          
          <div className="space-y-1">
            {section.items.map((item, itemIndex) => (
              <Link
                key={itemIndex}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {item.icon && (
                  <span className="mr-3 h-6 w-6 flex items-center justify-center">
                    {item.icon}
                  </span>
                )}
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}