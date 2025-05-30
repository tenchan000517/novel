import { useState, useEffect } from 'react';

interface QualityMetricsData {
  metrics: {
    averageScore: number;
    bestChapter: number;
    highestScore: number;
    improvementArea: string;
    categoryScores: {
      category: string;
      score: number;
    }[];
  };
  trend: {
    timeline: {
      chapter: number;
      score: number;
    }[];
    improvements: {
      metric: string;
      change: number;
    }[];
  };
}

export const useQualityMetrics = () => {
  const [data, setData] = useState<QualityMetricsData>({
    metrics: {
      averageScore: 0,
      bestChapter: 0,
      highestScore: 0,
      improvementArea: '',
      categoryScores: []
    },
    trend: {
      timeline: [],
      improvements: []
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // APIリクエストをシミュレーション
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // モックデータ
        const mockData: QualityMetricsData = {
          metrics: {
            averageScore: 0.87,
            bestChapter: 38,
            highestScore: 0.95,
            improvementArea: 'キャラクター描写',
            categoryScores: [
              { category: '読みやすさ', score: 0.92 },
              { category: '一貫性', score: 0.88 },
              { category: '引き込み度', score: 0.85 },
              { category: 'キャラクター描写', score: 0.78 },
              { category: 'プロット', score: 0.9 },
              { category: 'オリジナリティ', score: 0.82 }
            ]
          },
          trend: {
            timeline: Array.from({ length: 10 }, (_, i) => {
              const chapter = 36 + i;
              // 基本的に上昇傾向だが、ランダムな変動を加える
              const baseScore = 0.8 + (i * 0.01);
              const variation = (Math.random() * 0.1) - 0.05;
              return {
                chapter,
                score: Math.min(0.98, Math.max(0.75, baseScore + variation))
              };
            }),
            improvements: [
              { metric: '読みやすさ', change: 0.05 },
              { metric: '一貫性', change: 0.03 },
              { metric: 'キャラクター描写', change: -0.02 },
              { metric: 'プロット', change: 0.08 }
            ]
          }
        };
        
        setData(mockData);
      } catch (error) {
        console.error('Failed to fetch quality metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return { ...data, isLoading };
};