// src/app/loading.tsx
/**
 * ローディング状態のコンポーネント
 * Next.jsのサスペンスの仕組みで使用される
 */
export default function Loading() {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-lg text-gray-700">読み込み中...</span>
      </div>
    );
  }