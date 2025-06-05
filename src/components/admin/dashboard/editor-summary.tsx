import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

/**
 * エディタ情報のサマリーコンポーネント
 * 管理者ダッシュボードで使用するために、エディタの状態を簡潔に表示
 */
export const EditorSummary = () => {
  const [summary, setSummary] = useState({
    currentChapter: 45,
    totalChapters: 45,
    currentStatus: 'アイドル',
    lastGenerated: '2時間前',
    recentEdits: [
      { id: 'edit-1', chapter: 45, timestamp: '45分前', type: '自動修正' },
      { id: 'edit-2', chapter: 44, timestamp: '3時間前', type: 'エディター修正' },
      { id: 'edit-3', chapter: 45, timestamp: '5時間前', type: '生成' }
    ],
    qualityScore: 92
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // APIからデータを取得する代わりにモックデータを使用
    const fetchData = async () => {
      // 実際の実装ではAPIからデータを取得
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsLoading(false);
    };
    
    fetchData();
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>エディタ状況</CardTitle>
        <CardDescription>生成と編集の最新状態</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-500">現在のチャプター</div>
                <div className="text-2xl font-bold">
                  {summary.currentChapter} / {summary.totalChapters}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">ステータス</div>
                <div className="text-2xl font-bold flex items-center">
                  <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                  {summary.currentStatus}
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">最近の編集</h3>
              <div className="space-y-2">
                {summary.recentEdits.map(edit => (
                  <div key={edit.id} className="flex justify-between text-sm border-b pb-2">
                    <div>
                      <span className="font-medium">Ch.{edit.chapter}</span>
                      <span className="ml-2 text-gray-600">{edit.type}</span>
                    </div>
                    <span className="text-gray-500">{edit.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">品質スコア</span>
              <div className="flex items-center">
                <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                  <div 
                    className="h-2 bg-green-500 rounded-full" 
                    style={{ width: `${summary.qualityScore}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{summary.qualityScore}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};