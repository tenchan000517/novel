import { useMemory } from '@/hooks/use-memory';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const MemoryViewer = () => {
  const { selectedMemory, isLoading } = useMemory();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>記憶詳細</CardTitle>
        <CardDescription>選択した記憶の詳細情報</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        ) : !selectedMemory ? (
          <div className="text-center py-8 text-gray-500">
            <p>記憶が選択されていません</p>
            <p className="text-sm mt-2">階層ビューまたはタイムラインから記憶を選択してください</p>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-medium">{selectedMemory.title}</h3>
              <div className="flex text-sm text-gray-500 mt-1">
                <span className="mr-4">タイプ: {selectedMemory.type}</span>
                {selectedMemory.chapter && <span>チャプター: {selectedMemory.chapter}</span>}
              </div>
            </div>
            
            <div className="prose max-w-none">
              <p>{selectedMemory.content}</p>
            </div>
            
            {selectedMemory.connections && selectedMemory.connections.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">関連する記憶</h4>
                <div className="space-y-2">
                  {selectedMemory.connections.map((connection: any) => (
                    <div key={connection.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium">{connection.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{connection.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedMemory.metadata && (
              <div className="mt-6 pt-4 border-t text-sm">
                <h4 className="font-medium mb-2">メタデータ</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedMemory.metadata).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-gray-500">{key}: </span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};