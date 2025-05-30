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

export const useQualityMetrics = (options?: {
  chapterIds?: string[];
  fromChapter?: number;
  toChapter?: number;
}) => {
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
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // URLパラメータの構築
        const params = new URLSearchParams();
        
        if (options?.chapterIds && options.chapterIds.length > 0) {
          params.append('chapterIds', options.chapterIds.join(','));
        }
        
        if (options?.fromChapter) {
          params.append('from', options.fromChapter.toString());
        }
        
        if (options?.toChapter) {
          params.append('to', options.toChapter.toString());
        }
        
        // APIリクエストの実行
        const response = await fetch(`/api/analysis/quality?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const apiResponse = await response.json();
        
        if (!apiResponse.success) {
          throw new Error(apiResponse.error?.message || 'Unknown error');
        }
        
        // バックエンドのレスポンス形式をフロントエンドの期待する形式に変換
        const apiData = apiResponse.data;
        
        // フロントエンド向けデータ構造に変換
        const formattedData: QualityMetricsData = {
          metrics: {
            averageScore: apiData.overallScore,
            bestChapter: findBestChapter(apiData.trends),
            highestScore: findHighestScore(apiData.trends),
            improvementArea: findImprovementArea(apiData.detailedMetrics),
            categoryScores: formatCategoryScores(apiData.detailedMetrics)
          },
          trend: {
            timeline: formatTimeline(apiData.trends),
            improvements: formatImprovements(apiData.trends)
          }
        };
        
        setData(formattedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Failed to fetch quality metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [options?.chapterIds, options?.fromChapter, options?.toChapter]);
  
  return { ...data, isLoading, error };
};

// ヘルパー関数群
function findBestChapter(trends: any[]): number {
  // チャプター別スコアから最高スコアのチャプターを特定
  const consistencyTrend = trends.find(t => t.metric === 'consistency');
  if (!consistencyTrend) return 0;
  
  const values = consistencyTrend.values;
  const chapters = consistencyTrend.chapterNumbers;
  
  if (!values || !chapters || values.length === 0) return 0;
  
  const maxIndex = values.indexOf(Math.max(...values));
  return chapters[maxIndex] || 0;
}

function findHighestScore(trends: any[]): number {
  // 全指標の中で最高スコアを特定
  let maxScore = 0;
  
  trends.forEach(trend => {
    if (trend.values && trend.values.length > 0) {
      const max = Math.max(...trend.values);
      if (max > maxScore) maxScore = max;
    }
  });
  
  return parseFloat(maxScore.toFixed(2));
}

function findImprovementArea(metrics: any): string {
  // 最もスコアが低い領域を特定
  const scores = [
    { category: '読みやすさ', score: metrics.readability },
    { category: '一貫性', score: metrics.coherence },
    { category: '引き込み度', score: metrics.engagement },
    { category: 'キャラクター描写', score: metrics.characterConsistency }
  ];
  
  const lowestScoreItem = scores.sort((a, b) => a.score - b.score)[0];
  return lowestScoreItem.category;
}

function formatCategoryScores(metrics: any): { category: string; score: number }[] {
  // メトリクスをカテゴリスコアの配列に変換
  return [
    { category: '読みやすさ', score: parseFloat(metrics.readability.toFixed(2)) },
    { category: '一貫性', score: parseFloat(metrics.coherence.toFixed(2)) },
    { category: '引き込み度', score: parseFloat(metrics.engagement.toFixed(2)) },
    { category: 'キャラクター描写', score: parseFloat(metrics.characterConsistency.toFixed(2)) },
    { category: 'プロット', score: parseFloat((metrics.consistency || 0.85).toFixed(2)) },
    { category: 'オリジナリティ', score: parseFloat((metrics.originality || 0.82).toFixed(2)) }
  ];
}

function formatTimeline(trends: any[]): { chapter: number; score: number }[] {
  // トレンドデータからチャプター別スコアのタイムラインを生成
  const consistencyTrend = trends.find(t => t.metric === 'consistency');
  if (!consistencyTrend) return [];
  
  return consistencyTrend.chapterNumbers.map((chapter: number, index: number) => ({
    chapter,
    score: parseFloat(consistencyTrend.values[index].toFixed(2))
  }));
}

function formatImprovements(trends: any[]): { metric: string; change: number }[] {
  // 各指標の変化率を計算
  return trends.map(trend => {
    const values = trend.values;
    if (!values || values.length < 2) return { metric: trend.metric, change: 0 };
    
    const firstThird = values.slice(0, Math.ceil(values.length / 3));
    const lastThird = values.slice(-Math.ceil(values.length / 3));
    
    const firstAvg = firstThird.reduce((sum: number, val: number) => sum + val, 0) / firstThird.length;
    const lastAvg = lastThird.reduce((sum: number, val: number) => sum + val, 0) / lastThird.length;
    
    const change = parseFloat((lastAvg - firstAvg).toFixed(2));
    
    // 指標名を日本語に変換
    const metricNames: Record<string, string> = {
      'consistency': '一貫性',
      'readability': '読みやすさ',
      'engagement': '引き込み度'
    };
    
    return {
      metric: metricNames[trend.metric] || trend.metric,
      change
    };
  });
}