import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const DashboardActions = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  // Fix Promise<unknown> to Promise<void> compatibility issue
  const handleAction = async (id: string, action: () => Promise<unknown>) => {
    setIsLoading(id);
    try {
      await action();
    } catch (error) {
      console.error(`Action ${id} failed:`, error);
    } finally {
      setIsLoading(null);
    }
  };
  
  const actions = [
    {
      id: 'status',
      label: 'ステータス確認',
      icon: '📊',
      description: 'システム全体の状態を詳細チェック',
      action: () => new Promise<void>(resolve => setTimeout(resolve, 800))
    },
    {
      id: 'backup',
      label: 'バックアップ',
      icon: '💾',
      description: 'データの即時バックアップを実行',
      action: () => new Promise<void>(resolve => setTimeout(resolve, 1200))
    },
    {
      id: 'analyze',
      label: '分析実行',
      icon: '🔍',
      description: 'コンテンツ品質の詳細分析',
      action: () => new Promise<void>(resolve => setTimeout(resolve, 1500))
    },
    {
      id: 'refresh',
      label: '更新',
      icon: '🔄',
      description: 'ダッシュボードデータを更新',
      action: () => new Promise<void>(resolve => setTimeout(resolve, 600))
    }
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>管理アクション</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map(action => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id, action.action)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                isLoading === action.id 
                  ? 'bg-gray-100 text-gray-400' 
                  : 'hover:bg-gray-50 hover:border-gray-300'
              }`}
              disabled={isLoading !== null}
              title={action.description}
            >
              <span className="text-2xl mb-1">{action.icon}</span>
              <span className="text-sm">{action.label}</span>
              {isLoading === action.id && (
                <span className="mt-1 w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};