import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const CharacterFilters = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(false);
  const [recentFilter, setRecentFilter] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 実際の実装では検索処理を実行
    console.log('Searching for:', searchQuery);
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex">
            <input
              type="text"
              placeholder="キャラクター名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
            >
              検索
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active-filter"
                checked={activeFilter}
                onChange={() => setActiveFilter(!activeFilter)}
                className="mr-2"
              />
              <label htmlFor="active-filter" className="text-sm">アクティブのみ</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="recent-filter"
                checked={recentFilter}
                onChange={() => setRecentFilter(!recentFilter)}
                className="mr-2"
              />
              <label htmlFor="recent-filter" className="text-sm">最近登場</label>
            </div>
            
            <div className="flex items-center">
              <label htmlFor="emotional-state" className="text-sm mr-2">感情状態:</label>
              <select
                id="emotional-state"
                className="text-sm p-1 border rounded"
              >
                <option value="">すべて</option>
                <option value="HAPPY">幸福</option>
                <option value="SAD">悲しみ</option>
                <option value="ANGRY">怒り</option>
                <option value="FEARFUL">恐怖</option>
                <option value="DETERMINED">決意</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <label htmlFor="development-stage" className="text-sm mr-2">発展段階:</label>
              <select
                id="development-stage"
                className="text-sm p-1 border rounded"
              >
                <option value="">すべて</option>
                <option value="0">初期</option>
                <option value="1">発展中</option>
                <option value="2">確立</option>
                <option value="3">変化</option>
                <option value="4">完成</option>
              </select>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};