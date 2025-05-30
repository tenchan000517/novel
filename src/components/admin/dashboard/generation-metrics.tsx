import { useGenerationMetrics } from '@/hooks/use-generation-metrics';
import { Card } from '@/components/ui/card';
import { LineChart, BarChart } from '@/components/ui/charts';

export const GenerationMetrics = () => {
    const { data, isLoading, error } = useGenerationMetrics();
    
    if (isLoading) return <div>読み込み中...</div>;
    if (error) return <div>エラー: {error}</div>;
    
    return (
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">生成メトリクス</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-500">平均生成時間</div>
              <div className="text-2xl font-bold">
                {data.metrics.averageTime}秒
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">品質スコア</div>
              <div className="text-2xl font-bold">
                {data.metrics.qualityScore}%
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">成功率</div>
              <div className="text-2xl font-bold">
                {data.metrics.successRate}%
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">今日の生成数</div>
              <div className="text-2xl font-bold">
                {data.metrics.todayCount}章
              </div>
            </div>
          </div>
          
          <div className="h-48">
            <h3 className="text-sm font-medium mb-2">生成パフォーマンス推移</h3>
            <LineChart 
              data={data.trend.performance} 
              xKey="date" 
              yKey="value"
              color="#3B82F6"
            />
          </div>
          
          <div className="h-48 mt-4">
            <h3 className="text-sm font-medium mb-2">品質評価分布</h3>
            <BarChart 
              data={data.trend.quality} 
              xKey="category"
              yKey="value"
              color="#10B981"
            />
          </div>
        </div>
      </Card>
    );
  };