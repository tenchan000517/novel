// src/components/admin/analytics/foreshadowing-tracker.tsx
import { useForeshadowing } from '@/hooks/use-foreshadowing';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// 修正: ForeshadowingElement インターフェースをローカルに定義
interface ForeshadowingElement {
  id: string;
  description: string;
  context: string;
  chapterIntroduced: number;
  isResolved: boolean;
  plannedResolution?: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  relatedCharacters?: string[];
  relatedElements?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const ForeshadowingTracker = () => {
  const { foreshadowingElements, statistics, isLoading } = useForeshadowing();

  const progress = statistics
    ? Math.round((statistics.resolvedCount / statistics.totalCount) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>伏線追跡</CardTitle>
        <CardDescription>設置された伏線とその回収状況</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">伏線回収進捗</span>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {statistics && (
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <div className="text-gray-500">設置済み伏線</div>
                    <div className="font-medium">{statistics.totalCount}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">回収済み伏線</div>
                    <div className="font-medium">{statistics.resolvedCount}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">重要度高</div>
                    <div className="font-medium">{statistics.highPriorityCount}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">回収予定</div>
                    <div className="font-medium">次の {statistics.plannedResolutionCount} チャプター
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">未回収の伏線</h3>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {foreshadowingElements
                  .filter((element: ForeshadowingElement) => !element.isResolved)
                  .map((element: ForeshadowingElement) => (
                    <div key={element.id} className="text-sm border p-3 rounded-md">
                      <div className="flex justify-between">
                        <div className="font-medium">{element.description}</div>
                        <div
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            element.priority === 'HIGH'
                              ? 'bg-red-100 text-red-800'
                              : element.priority === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {element.priority}
                        </div>
                      </div>
                      <div className="text-gray-600 mt-1">{element.context}</div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>設置: Ch.{element.chapterIntroduced}</span>
                        {element.plannedResolution && (
                          <span>予定回収: Ch.{element.plannedResolution}</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};