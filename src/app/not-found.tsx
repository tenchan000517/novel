// src/app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * 404 Not Foundページ
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mb-6">ページが見つかりません</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        お探しのページは存在しないか、移動または削除された可能性があります。
      </p>
      <Link href="/" passHref>
        <Button variant="primary">
          ホームに戻る
        </Button>
      </Link>
    </div>
  );
}