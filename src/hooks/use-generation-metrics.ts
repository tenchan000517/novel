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
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // 実際のAPIからメトリクスデータを取得
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        
        // メトリクスデータ取得
        const metricsResponse = await fetch('/api/metrics/generation');
        if (!metricsResponse.ok) {
          throw new Error('Failed to fetch generation metrics');
        }
        
        const metricsData = await metricsResponse.json();
        
        // 品質メトリクスデータ取得
        const qualityResponse = await fetch('/api/metrics/quality');
        if (!qualityResponse.ok) {
          throw new Error('Failed to fetch quality metrics');
        }
        
        const qualityData = await qualityResponse.json();
        
        // APIレスポンスから必要なデータを抽出・整形
        setData({
          metrics: {
            averageTime: metricsData.data.averageGenerationTime || 0,
            qualityScore: metricsData.data.averageQualityScore || 0,
            successRate: metricsData.data.successRate || 0, 
            todayCount: metricsData.data.todayGenerations || 0
          },
          trend: {
            performance: metricsData.data.trends?.map((item: any) => ({
              date: item.date,
              value: item.generationTime
            })) || [],
            quality: qualityData.data.categories?.map((item: any) => ({
              category: item.name,
              value: item.score
            })) || []
          }
        });
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching generation metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // 初回データ取得
    fetchMetrics();
    
    // 30秒ごとにデータを更新
    const intervalId = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return {
    data,
    isLoading,
    error
  };
};