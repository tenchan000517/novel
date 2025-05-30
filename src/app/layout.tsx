// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';

// フォント設定
const inter = Inter({ subsets: ['latin'] });

// メタデータ
export const metadata: Metadata = {
  title: 'Auto Novel System',
  description: 'AI小説自動生成システム',
};

/**
 * ルートレイアウト
 * アプリケーション全体のレイアウトを定義
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}