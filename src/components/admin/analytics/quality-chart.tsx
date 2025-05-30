import { useQualityMetrics } from '@/hooks/use-quality-metrics';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LineChart, BarChart } from '@/components/ui/charts';

export const QualityChart = () => {
  const { metrics, trend } = useQualityMetrics();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>品質推移</CardTitle>
        <CardDescription>チャプターごとの品質評価の推移</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="h-64">
            <h3 className="text-sm font-medium mb-2">品質スコア推移</h3>
            <LineChart
              data={trend.timeline}
              xKey="chapter"
              yKey="score"
              color="#3B82F6"
            />
          </div>
          
          <div className="h-64">
            <h3 className="text-sm font-medium mb-2">分野別スコア</h3>
            <BarChart
              data={metrics.categoryScores}
              xKey="category"
              yKey="score"
              color="#10B981"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="text-gray-500 mb-1">平均品質スコア</div>
              <div className="font-medium text-lg">
                {Math.round(metrics.averageScore * 100)}%
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="text-gray-500 mb-1">最高評価チャプター</div>
              <div className="font-medium text-lg">
                チャプター {metrics.bestChapter}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="text-gray-500 mb-1">最高品質スコア</div>
              <div className="font-medium text-lg">
                {Math.round(metrics.highestScore * 100)}%
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="text-gray-500 mb-1">改善が必要な分野</div>
              <div className="font-medium text-lg">
                {metrics.improvementArea}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};