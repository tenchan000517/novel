// src/components/admin/editor/learning-insights-panel.tsx
import { useState, useEffect } from 'react';

export const LearningInsightsPanel: React.FC = () => {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        // APIリクエストをシミュレーション
        setTimeout(() => {
          setInsights({
            patterns: [
              {
                type: 'CHARACTER_CONSISTENCY',
                description: 'キャラクターの一貫性に関する問題傾向',
                frequency: 0.37,
                impact: 'HIGH'
              },
              {
                type: 'PLOT_PACING',
                description: 'プロットの展開速度に関する問題傾向',
                frequency: 0.22,
                impact: 'MEDIUM'
              }
            ],
            trends: [
              {
                category: 'QUALITY',
                direction: 'INCREASING',
                description: '総合的な品質評価は上昇傾向にある'
              },
              {
                category: 'CONSISTENCY',
                direction: 'STABLE',
                description: '一貫性に関する評価は安定している'
              }
            ],
            improvements: [
              {
                target: 'CHARACTER_MANAGER',
                description: 'キャラクター設定の継続的な参照機能を強化',
                priority: 'HIGH'
              },
              {
                target: 'PLOT_MANAGER',
                description: 'テンションカーブの自動調整機能を実装',
                priority: 'MEDIUM'
              }
            ]
          });
          setIsLoading(false);
        }, 1200);
      } catch (error) {
        console.error('インサイトの取得に失敗しました:', error);
        setIsLoading(false);
      }
    };
    
    fetchInsights();
  }, []);
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">学習インサイト</h2>
        <p className="text-sm text-gray-600">フィードバックからの学習成果</p>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ) : insights ? (
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">検出されたパターン</h3>
              <div className="space-y-2">
                {insights.patterns.map((pattern: any, index: number) => (
                  <div key={index} className="border-l-4 pl-3 py-1" style={{ borderColor: pattern.impact === 'HIGH' ? '#DC2626' : '#F59E0B' }}>
                    <p className="font-medium">{pattern.type}</p>
                    <p className="text-sm text-gray-600">{pattern.description}</p>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>頻度: {Math.round(pattern.frequency * 100)}%</span>
                      <span>影響: {pattern.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">トレンド</h3>
              <div className="space-y-2">
                {insights.trends.map((trend: any, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <div>
                      <span className="font-medium">{trend.category}</span>
                      <p className="text-sm text-gray-600">{trend.description}</p>
                    </div>
                    <span className={`text-sm font-medium ${
                      trend.direction === 'INCREASING' 
                        ? 'text-green-600' 
                        : trend.direction === 'DECREASING' 
                          ? 'text-red-600' 
                          : 'text-gray-600'
                    }`}>
                      {trend.direction === 'INCREASING' ? '↑' : trend.direction === 'DECREASING' ? '↓' : '→'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">推奨改善</h3>
              <div className="space-y-2">
                {insights.improvements.map((improvement: any, index: number) => (
                  <div key={index} className="border p-2 rounded-md">
                    <div className="flex justify-between">
                      <span className="font-medium">{improvement.target}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        improvement.priority === 'HIGH' 
                          ? 'bg-red-100 text-red-800' 
                          : improvement.priority === 'MEDIUM' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {improvement.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{improvement.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            データが見つかりませんでした
          </div>
        )}
      </div>
    </div>
  );
};