// src/components/admin/editor/quality-indicators.tsx
import { useEffect, useState } from 'react';
import { useQualityMetrics } from '@/hooks/use-quality-metrics';

interface QualityIndicatorsProps {
  document: {
    id: string;
    title: string;
    content: string;
    version: number;
    updatedAt: string;
    metadata?: Record<string, any>;
  } | null;
}

export const QualityIndicators: React.FC<QualityIndicatorsProps> = ({ document }) => {
  const [localMetrics, setLocalMetrics] = useState<Array<{category: string; score: number}>>([]);
  const [localOverallScore, setLocalOverallScore] = useState(0);
  
  // チャプターIDを取得する関数
  const getChapterInfo = (doc: QualityIndicatorsProps['document']) => {
    if (!doc) return { id: null, number: null };
    
    // IDがchapter-から始まる場合
    if (doc.id.startsWith('chapter-')) {
      const numberMatch = doc.id.match(/chapter-(\d+)/);
      return { 
        id: doc.id, 
        number: numberMatch ? parseInt(numberMatch[1]) : null 
      };
    }
    
    // メタデータからチャプター情報を取得
    const chapterId = doc.metadata?.chapterId;
    const chapterNumber = doc.metadata?.chapterNumber;
    
    if (chapterId) return { id: String(chapterId), number: chapterNumber };
    
    // タイトルからチャプター番号を抽出
    const titleMatch = doc.title.match(/第(\d+)章|Chapter\s+(\d+)/i);
    if (titleMatch) {
      const number = parseInt(titleMatch[1] || titleMatch[2]);
      return { id: `chapter-${number}`, number };
    }
    
    return { id: null, number: null };
  };

  const { id: chapterId, number: chapterNumber } = document ? getChapterInfo(document) : { id: null, number: null };
  
  // useQualityMetricsフックを使用してAPIからデータを取得
  const { metrics, isLoading, error } = useQualityMetrics(
    chapterId ? 
      { chapterIds: [chapterId] } : 
      chapterNumber ? 
        { fromChapter: chapterNumber, toChapter: chapterNumber } : 
        undefined
  );

  // APIデータがない場合のためのローカル計算
  useEffect(() => {
    if (!document) {
      setLocalMetrics([]);
      setLocalOverallScore(0);
      return;
    }

    // 既存のqualityScoreがあれば使用
    const storedScore = document.metadata?.qualityScore as number | undefined;
    const baseScore = storedScore || 0.8;
    
    // コンテンツの特性に基づいてスコアを調整
    const contentLength = document.content.length;
    const paragraphCount = document.content.split(/\n\n+/).length;
    const dialogueCount = (document.content.match(/「.*?」/g) || []).length;
    
    const lengthFactor = Math.min(1, Math.max(0.7, contentLength / 8000));
    const dialogueFactor = Math.min(1, Math.max(0.7, dialogueCount / 20));
    const paragraphFactor = Math.min(1, Math.max(0.7, paragraphCount / 30));
    
    const metrics = [
      { 
        category: '読みやすさ', 
        score: baseScore * (0.8 * paragraphFactor + 0.2 * lengthFactor)
      },
      { 
        category: '一貫性', 
        score: baseScore * 0.95
      },
      { 
        category: '引き込み度', 
        score: baseScore * (0.6 * dialogueFactor + 0.4 * paragraphFactor)
      },
      { 
        category: 'キャラクター描写', 
        score: baseScore * dialogueFactor
      },
      { 
        category: 'オリジナリティ', 
        score: baseScore * 0.85
      }
    ];
    
    setLocalMetrics(metrics);
    
    // 総合スコアを計算
    const avgScore = metrics.reduce((sum, item) => sum + item.score, 0) / metrics.length;
    setLocalOverallScore(avgScore);
  }, [document]);

  const getScoreColor = (score: number) => {
    if (score >= 0.85) return 'text-green-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!document) {
    return null;
  }

  // APIデータが利用可能な場合はそれを使用、そうでなければローカル計算を使用
  const displayMetrics = !isLoading && !error && metrics && metrics.categoryScores.length > 0 
    ? metrics.categoryScores 
    : localMetrics;
    
  const overallScore = !isLoading && !error && metrics ? metrics.averageScore : localOverallScore;

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-sm font-medium mb-3">品質指標</h3>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-full mb-4"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center">
              <div className="h-4 bg-gray-200 rounded w-24 mr-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full mx-2"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold">総合スコア</span>
            <span className={`text-lg font-bold ${getScoreColor(overallScore)}`}>
              {Math.round(overallScore * 100)}%
            </span>
          </div>

          <div className="space-y-2">
            {displayMetrics.map(indicator => (
              <div key={indicator.category} className="flex items-center">
                <span className="text-sm w-32">{indicator.category}</span>
                <div className="flex-1 mx-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        indicator.score >= 0.85
                          ? 'bg-green-500'
                          : indicator.score >= 0.7
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${indicator.score * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className={`text-sm font-medium ${getScoreColor(indicator.score)}`}>
                  {Math.round(indicator.score * 100)}%
                </span>
              </div>
            ))}
          </div>
          
          {error && (
            <div className="text-yellow-500 text-xs mt-2">
              品質APIに接続できないため、推定値を表示しています
            </div>
          )}
        </>
      )}
    </div>
  );
};