// src/app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * ホームページ
 */
export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Auto Novel System</h1>
        <p className="text-xl text-gray-600 mb-8">
          AI技術を活用した完全自動小説生成システム
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/chapters" passHref>
            <Button variant="primary">
              小説を読む
            </Button>
          </Link>
          <Link href="/about" passHref>
            <Button variant="outline">
              システムについて
            </Button>
          </Link>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6 text-center">最新のチャプター</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* チャプター例（実際には動的に生成） */}
          {[1, 2, 3, 4].map((id) => (
            <Card key={id} className="p-6">
              <h3 className="text-xl font-semibold mb-2">チャプター {id}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                これは自動生成された小説のチャプターのサンプルテキストです。実際のシステムでは、AIによって本格的な小説が生成されます。
              </p>
              <Link href={`/chapters/${id}`} passHref>
                <Button size="sm" variant="link">
                  続きを読む
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6 text-center">システムの特徴</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="text-center p-4">
            <h3 className="text-lg font-semibold mb-2">高度な生成エンジン</h3>
            <p className="text-gray-600">
              最新のAI技術を活用し、人間のような文章を生成します。
            </p>
          </div>
          <div className="text-center p-4">
            <h3 className="text-lg font-semibold mb-2">階層的記憶管理</h3>
            <p className="text-gray-600">
              物語の一貫性を保つための革新的な記憶システムを実装。
            </p>
          </div>
          <div className="text-center p-4">
            <h3 className="text-lg font-semibold mb-2">キャラクター管理</h3>
            <p className="text-gray-600">
              登場人物の性格や関係性を自動で管理・発展させます。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
