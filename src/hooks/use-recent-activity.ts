// src/hooks/use-recent-activity.ts
import { useState, useEffect, useCallback } from 'react';

interface Activity {
  id: string;
  type: 'GENERATION' | 'CORRECTION' | 'EDITING' | 'SYSTEM';
  title: string;
  description: string;
  timestamp: string;
  details?: string;
}

// 設定値
const AUTO_REFRESH_INTERVAL = 10 * 60 * 1000; // 10分間隔（ミリ秒）

export const useRecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // データ取得関数
  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 複数のソースからアクティビティデータを収集
      const allActivities: Activity[] = [];
      
      // 1. 修正履歴の取得（correction API）
      try {
        const correctionResponse = await fetch('/api/correction?chapterId=latest');
        if (correctionResponse.ok) {
          const correctionData = await correctionResponse.json();
          
          if (correctionData.success && correctionData.data.correctionStats?.history) {
            const correctionActivities = correctionData.data.correctionStats.history.map((entry: any) => ({
              id: `correction-${entry.timestamp}`,
              type: 'CORRECTION' as const,
              title: '自動修正が完了しました',
              description: `${entry.correctionCount}件の修正が適用されました`,
              timestamp: formatTimestamp(new Date(entry.timestamp)),
              details: entry.details || `修正数: ${entry.correctionCount}`
            }));
            
            allActivities.push(...correctionActivities);
          }
        }
      } catch (correctionError) {
        console.warn('Failed to fetch correction activities:', correctionError);
      }
      
      // 2. フィードバック履歴の取得（editor/feedback API）
      try {
        const feedbackResponse = await fetch('/api/editor/feedback');
        if (feedbackResponse.ok) {
          const feedbackData = await feedbackResponse.json();
          
          if (feedbackData.success && feedbackData.history) {
            const feedbackActivities = feedbackData.history.map((entry: any) => ({
              id: `feedback-${entry.id || entry.timestamp}`,
              type: 'EDITING' as const,
              title: 'エディターフィードバック',
              description: entry.content || '編集者からのフィードバックが登録されました',
              timestamp: formatTimestamp(new Date(entry.timestamp)),
              details: `タイプ: ${entry.type}, エディターID: ${entry.editorId || 'unknown'}`
            }));
            
            allActivities.push(...feedbackActivities);
          }
        }
      } catch (feedbackError) {
        console.warn('Failed to fetch feedback activities:', feedbackError);
      }
      
      // 3. 介入履歴の取得（editor/interventions API）
      try {
        const interventionResponse = await fetch('/api/editor/interventions');
        if (interventionResponse.ok) {
          const interventionData = await interventionResponse.json();
          
          if (interventionData.success && interventionData.history) {
            const interventionActivities = interventionData.history.map((entry: any) => ({
              id: `intervention-${entry.id || entry.timestamp}`,
              type: 'EDITING' as const,
              title: '編集者による介入',
              description: entry.command || '編集者が手動介入を実行しました',
              timestamp: formatTimestamp(new Date(entry.timestamp)),
              details: `タイプ: ${entry.type}, ターゲット: ${entry.target}`
            }));
            
            allActivities.push(...interventionActivities);
          }
        }
      } catch (interventionError) {
        console.warn('Failed to fetch intervention activities:', interventionError);
      }
      
      // 4. 生成履歴を構築（直接的なAPIはないが、インメモリデータとして構築）
      // 生成APIの使用状況を記録できないため、システム全体のステータスから推測
      try {
        const statusResponse = await fetch('/api/generation');
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          
          if (statusData.success && statusData.data.lastGeneration) {
            const generationActivity = {
              id: `generation-${Date.now()}`,
              type: 'GENERATION' as const,
              title: 'チャプター生成完了',
              description: statusData.data.lastGeneration.description || 'チャプターが生成されました',
              timestamp: formatTimestamp(new Date(statusData.data.lastGeneration.timestamp || Date.now())),
              details: `チャプター: ${statusData.data.lastGeneration.chapterNumber}, 品質スコア: ${statusData.data.lastGeneration.qualityScore || 'N/A'}`
            };
            
            allActivities.push(generationActivity);
          }
        }
      } catch (generationError) {
        console.warn('Failed to fetch generation activities:', generationError);
      }
      
      // タイムスタンプでソート（新しい順）
      allActivities.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      // 重複の除去（IDベース）
      const uniqueActivities = allActivities.filter((activity, index, self) =>
        index === self.findIndex((a) => a.id === activity.id)
      );
      
      setActivities(uniqueActivities);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Failed to fetch activities:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // 初回マウント時とタイマーでデータ取得
  useEffect(() => {
    // 初回データ取得
    fetchActivities();
    
    // 長めの間隔でデータを自動更新
    const intervalId = setInterval(fetchActivities, AUTO_REFRESH_INTERVAL);
    
    // クリーンアップ
    return () => clearInterval(intervalId);
  }, [fetchActivities]);
  
  // タイムスタンプを人間が読みやすい形式にフォーマット
  function formatTimestamp(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    
    if (diffMin < 1) return '数秒前';
    if (diffMin < 60) return `${diffMin}分前`;
    
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}時間前`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}日前`;
    
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
  
  return {
    activities,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchActivities // 手動更新用関数
  };
};