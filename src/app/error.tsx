// src/app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/utils/logger';

/**
 * エラーページコンポーネント
 * クライアントコンポーネントである必要がある
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをログに記録
    logger.error('クライアント側のエラーが発生しました:', { 
      message: error.message, 
      stack: error.stack,
      digest: error.digest 
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">問題が発生しました</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        申し訳ありませんが、予期しないエラーが発生しました。もう一度お試しいただくか、問題が解決しない場合は管理者にお問い合わせください。
      </p>
      <div className="flex space-x-4">
        <Button onClick={reset} variant="primary">
          再試行
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="outline">
          ホームに戻る
        </Button>
      </div>
      
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-md text-left overflow-auto max-w-xl">
          <p className="font-mono text-sm text-red-500">{error.message}</p>
          <p className="font-mono text-xs text-gray-600 mt-2 whitespace-pre-wrap">{error.stack}</p>
        </div>
      )}
    </div>
  );
}