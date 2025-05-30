// src/components/shared/header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * ナビゲーションリンクの型定義
 */
interface NavLink {
  name: string;
  href: string;
  adminOnly?: boolean;
}

/**
 * ナビゲーションリンク設定
 */
const navLinks: NavLink[] = [
  { name: 'ホーム', href: '/' },
  { name: 'チャプター', href: '/chapters' },
  { name: 'キャラクター', href: '/characters' },
  { name: 'システムについて', href: '/about' },
  { name: '管理', href: '/admin/dashboard', adminOnly: true },
];

/**
 * ヘッダーコンポーネント
 */
export function Header(): React.ReactElement {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // 開発環境では管理者機能を表示する
  const isAdmin = process.env.NODE_ENV === 'development';
  
  // パスが現在のリンクと一致しているか確認する関数
  const isActivePath = (path: string): boolean => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path) || false;
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* ロゴ部分 */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">Auto Novel</span>
            </Link>
          </div>
          
          {/* デスクトップ用ナビゲーション */}
          <nav className="hidden md:ml-6 md:flex md:space-x-4 md:items-center">
            {navLinks
              .filter(link => !link.adminOnly || isAdmin)
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActivePath(link.href)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
          </nav>
          
          {/* モバイル用メニューボタン */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">メニューを開く</span>
              {/* ハンバーガーアイコン */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* 閉じるアイコン */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
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
          </div>
        </div>
      </div>

      {/* モバイル用メニュー */}
      <div
        className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks
            .filter(link => !link.adminOnly || isAdmin)
            .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath(link.href)
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
        </div>
      </div>
    </header>
  );
}