// src/hooks/use-tension-data.ts
import { useState, useEffect, useCallback } from 'react';

interface TensionDataPoint {
  chapter: number;
  tension: number;
}

interface KeyEvent {
  id: string;
  chapter: number;
  title: string;
  description: string;
  tensionValue: number;
}

// 設定値 - この種のデータは頻繁に更新されないため、より長い間隔に設定
const AUTO_REFRESH_INTERVAL = 30 * 60 * 1000; // 30分間隔（ミリ秒）

export const useTensionData = () => {
  const [data, setData] = useState<TensionDataPoint[]>([]);
  const [keyEvents, setKeyEvents] = useState<KeyEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // データ取得関数
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 品質分析APIを使用してテンションデータを構築
      const qualityResponse = await fetch('/api/quality-analysis');
      if (!qualityResponse.ok) {
        throw new Error(`Quality analysis fetch failed: ${qualityResponse.statusText}`);
      }
      
      const qualityData = await qualityResponse.json();
      
      if (!qualityData.success) {
        throw new Error(qualityData.error?.message || 'Failed to fetch quality analysis');
      }
      
      // トレンドデータからテンションポイントを構築
      const tensionTrends = qualityData.data.trends?.find((t: any) => t.metric === 'engagement') || { values: [], chapterNumbers: [] };
      
      const tensionData: TensionDataPoint[] = [];
      for (let i = 0; i < tensionTrends.values?.length; i++) {
        tensionData.push({
          chapter: tensionTrends.chapterNumbers[i] || i + 1,
          tension: tensionTrends.values[i] / 100 // スコアは0-100スケールだが、テンションは0-1スケール
        });
      }
      
      // データが不足している場合は、伏線データからも補完
      if (tensionData.length < 3) {
        try {
          const foreshadowingResponse = await fetch('/api/foreshadowing');
          if (foreshadowingResponse.ok) {
            const foreshadowingData = await foreshadowingResponse.json();
            
            if (foreshadowingData.success && Array.isArray(foreshadowingData.data)) {
              // 伏線データからチャプターとテンション値を抽出して追加
              const foreshadowingPoints = foreshadowingData.data
                .filter((f: any) => f.chapter_introduced)
                .map((f: any) => ({
                  chapter: f.chapter_introduced,
                  tension: calculateTensionFromImportance(f.importance || 'MEDIUM')
                }));
              
              // 既存のチャプターと重複しないようにマージ
              for (const point of foreshadowingPoints) {
                if (!tensionData.some(d => d.chapter === point.chapter)) {
                  tensionData.push(point);
                }
              }
            }
          }
        } catch (foreshadowingError) {
          console.warn('Failed to fetch foreshadowing data for tension:', foreshadowingError);
        }
      }
      
      // キーイベントの構築
      // 伏線や推奨事項からキーイベントを構築
      const events: KeyEvent[] = [];
      
      // 推奨事項をイベントとして追加
      if (qualityData.data.recommendations) {
        for (let i = 0; i < qualityData.data.recommendations.length; i++) {
          const rec = qualityData.data.recommendations[i];
          const event = createKeyEventFromRecommendation(rec, i);
          if (event) {
            events.push(event);
          }
        }
      }
      
      // 伏線データからイベントを追加
      try {
        const foreshadowingResponse = await fetch('/api/foreshadowing');
        if (foreshadowingResponse.ok) {
          const foreshadowingData = await foreshadowingResponse.json();
          
          if (foreshadowingData.success && Array.isArray(foreshadowingData.data)) {
            for (const foreshadowing of foreshadowingData.data) {
              if (foreshadowing.description && foreshadowing.chapter_introduced) {
                events.push({
                  id: `foreshadow-${foreshadowing.id || Math.random().toString(36).substr(2, 9)}`,
                  chapter: foreshadowing.chapter_introduced,
                  title: foreshadowing.title || '伏線の導入',
                  description: foreshadowing.description,
                  tensionValue: calculateTensionFromImportance(foreshadowing.importance || 'MEDIUM')
                });
              }
            }
          }
        }
      } catch (foreshadowingError) {
        console.warn('Failed to fetch foreshadowing data for key events:', foreshadowingError);
      }
      
      // テンションデータとキーイベントをソート
      tensionData.sort((a, b) => a.chapter - b.chapter);
      events.sort((a, b) => a.chapter - b.chapter);
      
      setData(tensionData);
      setKeyEvents(events);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Failed to fetch tension data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // 重要度からテンション値を計算するヘルパー関数
  function calculateTensionFromImportance(importance: string): number {
    switch (importance.toUpperCase()) {
      case 'HIGH':
        return 0.8;
      case 'MEDIUM':
        return 0.6;
      case 'LOW':
        return 0.4;
      default:
        return 0.5;
    }
  }
  
  // 推奨事項からキーイベントを作成するヘルパー関数
  function createKeyEventFromRecommendation(recommendation: string, index: number): KeyEvent | null {
    // 推奨事項のテキストからイベントを抽出
    if (!recommendation) return null;
    
    // キーワードに基づいてチャプターと緊張感を推定
    const chapterMatch = recommendation.match(/チャプター(\d+)/);
    const chapter = chapterMatch ? parseInt(chapterMatch[1], 10) : (index + 1) * 5; // 適当な間隔で配置
    
    // キーワードに基づいてテンション値を推定
    let tensionValue = 0.5;
    if (recommendation.includes('クライマックス') || recommendation.includes('対決')) {
      tensionValue = 0.9;
    } else if (recommendation.includes('危機') || recommendation.includes('衝突')) {
      tensionValue = 0.8;
    } else if (recommendation.includes('展開') || recommendation.includes('転換')) {
      tensionValue = 0.7;
    }
    
    return {
      id: `rec-${index}`,
      chapter,
      title: extractTitle(recommendation),
      description: recommendation,
      tensionValue
    };
  }
  
  // 推奨事項からタイトルを抽出するヘルパー関数
  function extractTitle(recommendation: string): string {
    // 最初の文または句点までを取得
    const firstSentence = recommendation.split(/[。,.]/)[0];
    return firstSentence.length > 20 ? firstSentence.substring(0, 20) + '...' : firstSentence;
  }
  
  // 初回マウント時とタイマーでデータ取得
  useEffect(() => {
    // 初回データ取得
    fetchData();
    
    // 長めの間隔でデータを自動更新
    const intervalId = setInterval(fetchData, AUTO_REFRESH_INTERVAL);
    
    // クリーンアップ
    return () => clearInterval(intervalId);
  }, [fetchData]);
  
  return {
    data,
    keyEvents,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchData // 手動更新用関数
  };
};