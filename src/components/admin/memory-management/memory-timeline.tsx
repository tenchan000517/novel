import { useMemory } from '@/hooks/use-memory';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const MemoryTimeline = () => {
  const { timeline, isLoading } = useMemory();
  
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'CHAPTER': return 'bg-blue-500';
      case 'CHARACTER': return 'bg-green-500';
      case 'PLOT': return 'bg-purple-500';
      case 'WORLD': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>タイムライン</CardTitle>
        <CardDescription>記憶の時系列表示</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex">
                <div className="w-4 h-4 rounded-full bg-gray-200 mt-1 mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative pl-6 max-h-72 overflow-y-auto space-y-4 mt-2">
            {/* 垂直線 */}
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {timeline.map((event) => (
              <div key={event.id} className="relative">
                {/* イベントマーカー */}
                <div className={`absolute -left-4 w-4 h-4 rounded-full ${getEventTypeColor(event.type)}`}></div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium">{event.title}</h4>
                    <span className="text-xs text-gray-500">{event.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  {event.chapter && (
                    <div className="text-xs text-gray-500 mt-1">チャプター {event.chapter}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};