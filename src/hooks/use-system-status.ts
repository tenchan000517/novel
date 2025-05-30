// src/hooks/use-system-status.ts
import { useState, useEffect, useCallback } from 'react';

interface SystemStatusData {
  status: {
    generation: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
    memory: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
    characters: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
    api: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  };
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    apiCalls: number;
  };
  lastCheck: number;
}

// 設定値
const AUTO_REFRESH_INTERVAL = 15 * 60 * 1000; // 15分間隔（ミリ秒）

export const useSystemStatus = () => {
  const [data, setData] = useState<SystemStatusData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // データ取得関数
  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 生成システム状態の取得
      const generationResponse = await fetch('/api/generation');
      if (!generationResponse.ok) {
        throw new Error(`Generation system status fetch failed: ${generationResponse.statusText}`);
      }
      
      const generationData = await generationResponse.json();
      
      if (!generationData.success) {
        throw new Error(generationData.error?.message || 'Failed to fetch generation system status');
      }
      
      // パフォーマンスメトリクスの取得
      const performanceResponse = await fetch('/api/performance');
      if (!performanceResponse.ok) {
        throw new Error(`Performance metrics fetch failed: ${performanceResponse.statusText}`);
      }
      
      const performanceData = await performanceResponse.json();
      
      if (!performanceData.success) {
        throw new Error(performanceData.error?.message || 'Failed to fetch performance metrics');
      }
      
      // システム状態の構築
      const generationStatus = generationData.data.generation.apiKeyValid ? 'ONLINE' : 'OFFLINE';
      const memoryStatus = determineMemoryStatus(generationData.data.memory);
      
      // キャラクター状態の取得（キャラクターAPIを試す）
      let charactersStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE' = 'OFFLINE';
      try {
        const characterResponse = await fetch('/api/characters?limit=1');
        if (characterResponse.ok) {
          const characterData = await characterResponse.json();
          charactersStatus = characterData.success ? 'ONLINE' : 'DEGRADED';
        }
      } catch (charError) {
        console.warn('Character system check failed:', charError);
      }
      
      // API状態の判定（他のAPIの結果に基づく）
      const apiStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE' = 
        (generationStatus === 'ONLINE' && memoryStatus === 'ONLINE') ? 'ONLINE' :
        (generationStatus === 'OFFLINE' || memoryStatus === 'OFFLINE') ? 'OFFLINE' : 'DEGRADED';
      
      // システムメトリクスの構築
      const statusData: SystemStatusData = {
        status: {
          generation: generationStatus,
          memory: memoryStatus,
          characters: charactersStatus,
          api: apiStatus
        },
        metrics: {
          cpu: performanceData.data.cpu?.usage || 0,
          memory: performanceData.data.memoryUsage?.percentage || 0,
          disk: performanceData.data.disk?.usage || 0,
          apiCalls: performanceData.data.apiCalls?.count || 0
        },
        lastCheck: Date.now()
      };
      
      setData(statusData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Failed to fetch system status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // メモリステータスの判定ヘルパー関数
  function determineMemoryStatus(memoryData: any): 'ONLINE' | 'DEGRADED' | 'OFFLINE' {
    if (!memoryData) return 'OFFLINE';
    
    // メモリサイズとリミットに基づいて状態を判定
    const memorySize = memoryData.memorySize || 0;
    const memoryLimit = memoryData.memoryLimit || 1;
    const memoryUsageRatio = memorySize / memoryLimit;
    
    if (memoryUsageRatio > 0.9) return 'DEGRADED';
    if (memoryUsageRatio > 0.99) return 'OFFLINE';
    return 'ONLINE';
  }
  
  // 初回マウント時とタイマーでデータ取得
  useEffect(() => {
    // 初回データ取得
    fetchStatus();
    
    // 長めの間隔でデータを自動更新
    const intervalId = setInterval(fetchStatus, AUTO_REFRESH_INTERVAL);
    
    // クリーンアップ
    return () => clearInterval(intervalId);
  }, [fetchStatus]);
  
  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchStatus // 手動更新用関数
  };
};