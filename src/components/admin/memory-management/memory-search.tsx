import { useState } from 'react';
import { useMemory } from '@/hooks/use-memory';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const MemorySearch = () => {
  const [query, setQuery] = useState('');
  const [memoryType, setMemoryType] = useState<string>('ALL');
  const { searchMemory, isSearching } = useMemory();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      searchMemory(query, memoryType);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>記憶検索</CardTitle>
        <CardDescription>ストーリー内の記憶や情報を検索</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="キーワードを入力..."
              className="flex-1 p-2 border rounded-md"
            />
            <select
              value={memoryType}
              onChange={(e) => setMemoryType(e.target.value)}
              className="p-2 border rounded-md min-w-32"
            >
              <option value="ALL">すべての記憶</option>
              <option value="SHORT_TERM">短期記憶</option>
              <option value="MID_TERM">中期記憶</option>
              <option value="LONG_TERM">長期記憶</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 sm:w-auto w-full"
              disabled={isSearching}
            >
              {isSearching ? '検索中...' : '検索'}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setQuery('主人公')}
              className="px-3 py-1 text-xs bg-gray-100 rounded-full hover:bg-gray-200"
            >
              主人公
            </button>
            <button
              type="button"
              onClick={() => setQuery('伏線')}
              className="px-3 py-1 text-xs bg-gray-100 rounded-full hover:bg-gray-200"
            >
              伏線
            </button>
            <button
              type="button"
              onClick={() => setQuery('世界設定')}
              className="px-3 py-1 text-xs bg-gray-100 rounded-full hover:bg-gray-200"
            >
              世界設定
            </button>
            <button
              type="button"
              onClick={() => setQuery('キーアイテム')}
              className="px-3 py-1 text-xs bg-gray-100 rounded-full hover:bg-gray-200"
            >
              キーアイテム
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};