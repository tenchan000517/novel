// src/components/shared/footer.tsx
import React from 'react';
import Link from 'next/link';

/**
 * フッターコンポーネント
 */
export function Footer(): React.ReactElement {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-8">
        <div className="md:flex md:justify-between">
          {/* サイト情報 */}
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">Auto Novel</span>
            </Link>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
              AI技術を活用した完全自動小説生成システム
            </p>
          </div>
          
          {/* クイックリンク */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h2 className="mb-4 text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase">コンテンツ</h2>
              <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                <li>
                  <Link href="/chapters" className="hover:underline">チャプター</Link>
                </li>
                <li>
                  <Link href="/characters" className="hover:underline">キャラクター</Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h2 className="mb-4 text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase">システム</h2>
              <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                <li>
                  <Link href="/about" className="hover:underline">システムについて</Link>
                </li>
                <li>
                  <Link href="/about/architecture" className="hover:underline">アーキテクチャ</Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h2 className="mb-4 text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase">開発</h2>
              <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                <li>
                  <a href="https://github.com/yourusername/auto-novel-system" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    GitHub
                  </a>
                </li>
                <li>
                  <Link href="/admin/dashboard" className="hover:underline">
                    管理ダッシュボード
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* コピーライト */}
        <hr className="my-6 border-gray-200 dark:border-gray-700 sm:mx-auto" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} Auto Novel System. All Rights Reserved.
          </span>
          <div className="flex mt-4 sm:mt-0 space-x-6 text-gray-600 dark:text-gray-400">
            <a href="https://github.com/yourusername/auto-novel-system" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}