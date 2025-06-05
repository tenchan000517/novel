// src/components/admin/editor/quality-indicators.tsx
interface QualityIndicatorsProps {
  document: {
    metadata?: {
      qualityScore?: number;
    } | undefined;
  } | null; // nullも許容するように修正
}

export const QualityIndicators: React.FC<QualityIndicatorsProps> = ({ document }) => {
  // nullと未定義のチェックを追加
  const qualityScore = document?.metadata?.qualityScore || 0;

  // ダミーの品質指標（実際の実装ではAPIから取得）
  const indicators = [
    { name: '読みやすさ', score: 0.82 },
    { name: '一貫性', score: 0.91 },
    { name: '引き込み度', score: 0.85 },
    { name: 'キャラクター描写', score: 0.78 },
    { name: 'オリジナリティ', score: 0.76 }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 0.85) return 'text-green-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-sm font-medium mb-3">品質指標</h3>

      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-bold">総合スコア</span>
        <span className={`text-lg font-bold ${getScoreColor(qualityScore)}`}>
          {Math.round(qualityScore * 100)}%
        </span>
      </div>

      <div className="space-y-2">
        {indicators.map(indicator => (
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