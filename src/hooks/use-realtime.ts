// src/hooks/use-realtime.ts
import { useState, useEffect, useCallback } from 'react';

// 型定義
interface SystemStatus {
  currentState: 'IDLE' | 'GENERATING' | 'ERROR' | 'MAINTENANCE';
  stateLabel: string;
  progress: number;
  progressLabel: string;
  recentEvents: {
    id: string;
    timestamp: string;
    message: string;
  }[];
}

interface PerformanceMetrics {
  generationSpeed: number;
  apiLatency: number;
  memoryUsage: number;
  cacheEfficiency: number;
  errorRate: number;
}

// 設定値
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5分間隔（ミリ秒）

export const useRealtime = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // データ取得関数
  const fetchRealtimeData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // システムステータス取得（生成システムの状態API）
      const statusResponse = await fetch('/api/generation');
      if (!statusResponse.ok) {
        throw new Error(`Status fetch failed: ${statusResponse.statusText}`);
      }
      
      const statusData = await statusResponse.json();
      
      if (!statusData.success) {
        throw new Error(statusData.error?.message || 'Failed to fetch status');
      }
      
      // 生成状態からステータスを構築
      const generationState = statusData.data.generation;
      const memoryState = statusData.data.memory;
      
      // 状態ラベルとアクティブ状態の判定
      let currentState: 'IDLE' | 'GENERATING' | 'ERROR' | 'MAINTENANCE' = 'IDLE';
      let stateLabel = 'アイドル状態';
      let progress = 0;
      let progressLabel = '';
      
      if (!generationState.apiKeyValid) {
        currentState = 'ERROR';
        stateLabel = 'APIキーエラー';
      } else if (memoryState.memorySize > memoryState.memoryLimit * 0.9) {
        currentState = 'MAINTENANCE';
        stateLabel = 'メモリ最適化中';
      } else if (statusData.data.activeGeneration) {
        currentState = 'GENERATING';
        stateLabel = '生成中';
        progress = statusData.data.progress || 0;
        progressLabel = statusData.data.progressLabel || 'チャプター生成中';
      }
      
      // 最近のイベント情報をまとめる
      // 注：このAPIからイベント情報が直接取得できない場合は、
      // 直近の生成状態やメモリ状態から推測して構築
      const recentEvents = [];
      
      if (statusData.data.lastEvent) {
        recentEvents.push({
          id: `evt-${Date.now()}-1`,
          timestamp: new Date().toLocaleTimeString('ja-JP', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          }),
          message: statusData.data.lastEvent
        });
      }
      
      recentEvents.push({
        id: `evt-${Date.now()}-2`,
        timestamp: new Date().toLocaleTimeString('ja-JP', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        }),
        message: `システム状態: ${stateLabel}`
      });
      
      setStatus({
        currentState,
        stateLabel,
        progress,
        progressLabel,
        recentEvents
      });
      
      // パフォーマンスメトリクス取得
      const metricsResponse = await fetch('/api/performance');
      if (!metricsResponse.ok) {
        throw new Error(`Metrics fetch failed: ${metricsResponse.statusText}`);
      }
      
      const metricsData = await metricsResponse.json();
      
      if (!metricsData.success) {
        throw new Error(metricsData.error?.message || 'Failed to fetch metrics');
      }
      
      // APIからメトリクスを取得
      const performanceMetrics = metricsData.data;
      
      setMetrics({
        generationSpeed: performanceMetrics.generationSpeed?.current || 0,
        apiLatency: performanceMetrics.apiLatency?.average || 0,
        memoryUsage: performanceMetrics.memoryUsage?.percentage || 0,
        cacheEfficiency: performanceMetrics.cacheEfficiency?.hitRate || 0,
        errorRate: performanceMetrics.errorRate?.percentage || 0
      });
      
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Failed to fetch realtime data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // 初回マウント時とタイマーでデータ取得
  useEffect(() => {
    // 初回データ取得
    fetchRealtimeData();
    
    // 長めの間隔でデータを自動更新
    const intervalId = setInterval(fetchRealtimeData, AUTO_REFRESH_INTERVAL);
    
    // クリーンアップ
    return () => clearInterval(intervalId);
  }, [fetchRealtimeData]);
  
  return {
    status,
    metrics,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchRealtimeData // 手動更新用関数
  };
};