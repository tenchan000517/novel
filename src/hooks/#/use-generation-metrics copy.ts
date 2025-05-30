import { useState, useEffect } from 'react';

interface GenerationMetricsData {
  metrics: {
    averageTime: number;
    qualityScore: number;
    successRate: number;
    todayCount: number;
  };
  trend: {
    performance: {
      date: string;
      value: number;
    }[];
    quality: {
      category: string;
      value: number;
    }[];
  };
}

export const useGenerationMetrics = () => {
  const [data, setData] = useState<GenerationMetricsData>({
    metrics: {
      averageTime: 0,
      qualityScore: 0,
      successRate: 0,
      todayCount: 0
    },
    trend: {
      performance: [],
      quality: []
    }
  });
  
  useEffect(() => {
    // モックデータ生成（実際の実装ではAPIリクエストを行う）
    const fetchMetrics = () => {
      // 過去7日分の日付を生成
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
      }).reverse();
      
      // パフォーマンストレンドデータ
      const performance = dates.map(date => ({
        date,
        value: Math.floor(Math.random() * 30) + 15 // 15-45秒
      }));
      
      // 品質カテゴリデータ
      const qualityCategories = ['読みやすさ', '一貫性', '魅力度', 'キャラクター', 'プロット'];
      const quality = qualityCategories.map(category => ({
        category,
        value: Math.floor(Math.random() * 30) + 70 // 70-100%
      }));
      
      setData({
        metrics: {
          averageTime: Math.floor(Math.random() * 20) + 20, // 20-40秒
          qualityScore: Math.floor(Math.random() * 15) + 85, // 85-100%
          successRate: Math.floor(Math.random() * 10) + 90, // 90-100%
          todayCount: Math.floor(Math.random() * 10) + 1 // 1-10章
        },
        trend: {
          performance,
          quality
        }
      });
    };
    
    // 初回データ取得
    fetchMetrics();
    
    // 定期的にメトリクスを更新（実際の実装ではWebSocketやポーリング）
    const intervalId = setInterval(fetchMetrics, 60000); // 1分ごと
    
    return () => clearInterval(intervalId);
  }, []);
  
  return data;
};