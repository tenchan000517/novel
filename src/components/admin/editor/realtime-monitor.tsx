// src/components/admin/editor/realtime-monitor.tsx
import React from 'react';
import { useRealtime } from '@/hooks/use-realtime';
import { RefreshCw } from 'lucide-react';

export const RealtimeMonitor: React.FC = () => {
  const { status, metrics, isLoading, error, lastUpdated, refresh } = useRealtime();
  
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
        <h2 className="text-lg font-semibold">リアルタイムモニタリング</h2>
        
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
      
      {isLoading && !status ? (
        <div className="flex justify-center p-6">
          <div className="animate-pulse">データ読み込み中...</div>
        </div>
      ) : status ? (
        <>
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">システム状態</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                status.currentState === 'IDLE' 
                  ? 'bg-green-500' 
                  : status.currentState === 'GENERATING' 
                    ? 'bg-yellow-500' 
                    : status.currentState === 'ERROR' 
                      ? 'bg-red-500' 
                      : status.currentState === 'MAINTENANCE'
                        ? 'bg-purple-500'
                        : 'bg-gray-500'
              }`}></div>
              <span className="text-sm">{status.stateLabel}</span>
            </div>
            {status.currentState === 'GENERATING' && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${status.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {status.progressLabel} ({status.progress}%)
                </p>
              </div>
            )}
          </div>
          
          {metrics && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">パフォーマンスメトリクス</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">API応答時間:</span>
                  <span>{metrics.apiLatency}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">生成速度:</span>
                  <span>{metrics.generationSpeed} tokens/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">メモリ使用率:</span>
                  <span>{metrics.memoryUsage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">キャッシュ効率:</span>
                  <span>{metrics.cacheEfficiency}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">エラー発生率:</span>
                  <span>{metrics.errorRate}%</span>
                </div>
              </div>
            </div>
          )}
          
          {status.recentEvents && status.recentEvents.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">直近のイベント</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {status.recentEvents.map(event => (
                  <div key={event.id} className="text-sm">
                    <span className="text-gray-500 text-xs">{event.timestamp}</span>
                    <span className="ml-2">{event.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-4 text-gray-500">
          データがありません。更新ボタンを押してください。
        </div>
      )}
    </div>
  );
};