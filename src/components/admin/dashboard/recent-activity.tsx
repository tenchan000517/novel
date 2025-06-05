// src/components/admin/editor/recent-activity.tsx
import React from 'react';
import { useRecentActivity } from '@/hooks/use-recent-activity';
import { RefreshCw } from 'lucide-react';

// アクティビティタイプに応じたアイコンコンポーネント
const ActivityIcon = ({ type }: { type: 'GENERATION' | 'CORRECTION' | 'EDITING' | 'SYSTEM' }) => {
  const colors = {
    GENERATION: 'bg-green-100 text-green-600',
    CORRECTION: 'bg-blue-100 text-blue-600',
    EDITING: 'bg-purple-100 text-purple-600',
    SYSTEM: 'bg-gray-100 text-gray-600'
  };
  
  const icons = {
    GENERATION: '🔄',
    CORRECTION: '🔧',
    EDITING: '✏️',
    SYSTEM: '🔔'
  };
  
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colors[type]}`}>
      {icons[type]}
    </div>
  );
};

export const RecentActivity = () => {
  const { activities, isLoading, error, lastUpdated, refresh } = useRecentActivity();
  
  // フォーマット関数
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'データなし';
    return date.toLocaleString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">最近のアクティビティ</h2>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            最終更新: {formatLastUpdated(lastUpdated)}
          </span>
          
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition disabled:opacity-50"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            更新
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded">
          エラーが発生しました: {error.message}
        </div>
      )}
      
      {isLoading && activities.length === 0 ? (
        <div className="flex justify-center p-6">
          <div className="animate-pulse">データ読み込み中...</div>
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-start space-x-3">
              <ActivityIcon type={activity.type} />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-medium">{activity.title}</h3>
                  <span className="text-xs text-gray-500">{activity.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                {activity.details && (
                  <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4 text-gray-500">
          アクティビティがありません。更新ボタンを押してください。
        </div>
      )}
    </div>
  );
};