// src/components/admin/editor/system-status.tsx
import React from 'react';
import { useSystemStatus } from '@/hooks/use-system-status';
import { Card } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

// ステータスインジケーターコンポーネント
const StatusIndicator = ({ status }: { status: 'ONLINE' | 'DEGRADED' | 'OFFLINE' }) => {
  const colors = {
    ONLINE: 'bg-green-500',
    DEGRADED: 'bg-yellow-500',
    OFFLINE: 'bg-red-500'
  };
  
  const labels = {
    ONLINE: '正常',
    DEGRADED: '低下',
    OFFLINE: '停止'
  };
  
  return (
    <div className="flex items-center">
      <div className={`w-3 h-3 rounded-full ${colors[status]} mr-2`}></div>
      <span className="text-sm font-medium">{labels[status]}</span>
    </div>
  );
};

export const SystemStatus = () => {
  const { data, isLoading, error, lastUpdated, refresh } = useSystemStatus();
  
  // フォーマット関数
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'データなし';
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">システム状態</h2>
          
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
        
        {isLoading && !data ? (
          <div className="flex justify-center p-6">
            <div className="animate-pulse">データ読み込み中...</div>
          </div>
        ) : data ? (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>生成エンジン</span>
                <StatusIndicator status={data.status.generation} />
              </div>
              
              <div className="flex items-center justify-between">
                <span>記憶管理</span>
                <StatusIndicator status={data.status.memory} />
              </div>
              
              <div className="flex items-center justify-between">
                <span>キャラクター管理</span>
                <StatusIndicator status={data.status.characters} />
              </div>
              
              <div className="flex items-center justify-between">
                <span>API連携</span>
                <StatusIndicator status={data.status.api} />
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">システムメトリクス</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-gray-500">CPU使用率</div>
                  <div className="font-medium">{data.metrics.cpu}%</div>
                </div>
                <div>
                  <div className="text-gray-500">メモリ使用率</div>
                  <div className="font-medium">{data.metrics.memory}%</div>
                </div>
                <div>
                  <div className="text-gray-500">ディスク使用率</div>
                  <div className="font-medium">{data.metrics.disk}%</div>
                </div>
                <div>
                  <div className="text-gray-500">API呼び出し数</div>
                  <div className="font-medium">{data.metrics.apiCalls}/分</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              最終確認: {new Date(data.lastCheck).toLocaleString()}
            </div>
          </>
        ) : (
          <div className="text-center p-4 text-gray-500">
            データがありません。更新ボタンを押してください。
          </div>
        )}
      </div>
    </Card>
  );
};