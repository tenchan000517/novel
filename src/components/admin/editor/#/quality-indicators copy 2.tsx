// src/components/admin/editor/quality-indicators.tsx
import { useEffect, useState } from 'react';

// EditorDocumentに合わせた型定義
interface QualityIndicatorsProps {
  document: {
    id: string;
    title: string;
    content: string;
    version: number;
    updatedAt: string;
    // 以下は存在しない可能性があるプロパティ
    metadata?: Record<string, any>;
  } | null;
}

interface QualityMetrics {
  name: string;
  score: number;
}

export const QualityIndicators: React.FC<QualityIndicatorsProps> = ({ document }) => {
  // ドキュメント内容に基づいて計算した品質スコア(ダミー)
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  // ドキュメントが変更されたときに品質スコアを計算
  useEffect(() => {
    if (!document) {
      setQualityMetrics([]);
      setOverallScore(0);
      return;
    }

    // 実際のAPIからスコアを取得する代わりに、ダミーデータを生成
    // 実環境では、この部分をAPIコールに置き換えることが可能
    const metrics = generateQualityMetrics(document);
    setQualityMetrics(metrics);
    
    // 総合スコアを計算
    const avgScore = metrics.reduce((sum, item) => sum + item.score, 0) / metrics.length;
    setOverallScore(avgScore);
  }, [document]);

  // ドキュメントに基づいてダミーの品質指標を生成
  const generateQualityMetrics = (doc: QualityIndicatorsProps['document']): QualityMetrics[] => {
    if (!doc) return [];
    
    // ドキュメントからqualityScoreを取得（存在すれば）
    const storedScore = doc.metadata?.qualityScore as number | undefined;
    
    // コンテンツの長さや複雑さに基づいてスコアをランダムに変動させる
    // 実際の実装では、NLPアルゴリズムなどによるテキスト分析が入る
    const contentLength = doc.content.length;
    const randomFactor = Math.random() * 0.1 - 0.05; // -0.05から0.05までのランダム値
    
    return [
      { 
        name: '読みやすさ', 
        score: Math.min(0.95, Math.max(0.5, 0.82 + randomFactor)) 
      },
      { 
        name: '一貫性', 
        score: Math.min(0.95, Math.max(0.5, 0.91 + randomFactor)) 
      },
      { 
        name: '引き込み度', 
        score: Math.min(0.95, Math.max(0.5, 0.85 + randomFactor)) 
      },
      { 
        name: 'キャラクター描写', 
        score: Math.min(0.95, Math.max(0.5, 0.78 + randomFactor)) 
      },
      { 
        name: 'オリジナリティ', 
        score: Math.min(0.95, Math.max(0.5, 0.76 + randomFactor)) 
      }
    ];
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.85) return 'text-green-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!document) {
    return null;
  }

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-sm font-medium mb-3">品質指標</h3>

      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-bold">総合スコア</span>
        <span className={`text-lg font-bold ${getScoreColor(overallScore)}`}>
          {Math.round(overallScore * 100)}%
        </span>
      </div>

      <div className="space-y-2">
        {qualityMetrics.map(indicator => (
          <div key={indicator.name} className="flex items-center">
            <span className="text-sm w-32">{indicator.name}</span>
            <div className="flex-1 mx-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${indicator.score >= 0.85
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
    </div>
  );
};