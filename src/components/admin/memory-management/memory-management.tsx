import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useMemory } from '@/hooks/use-memory';

/**
 * 記憶検索コンポーネント
 */
export const MemorySearch = () => {
  const [query, setQuery] = useState('');
  const [memoryType, setMemoryType] = useState<string>('ALL');
  const { searchMemory, isSearching } = useMemory();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      searchMemory(query, memoryType);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>記憶検索</CardTitle>
        <CardDescription>ストーリー内の記憶や情報を検索</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="キーワードを入力..."
              className="flex-1 p-2 border rounded-md"
            />
            <select
              value={memoryType}
              onChange={(e) => setMemoryType(e.target.value)}
              className="p-2 border rounded-md min-w-32"
            >
              <option value="ALL">すべての記憶</option>
              <option value="SHORT_TERM">短期記憶</option>
              <option value="MID_TERM">中期記憶</option>
              <option value="LONG_TERM">長期記憶</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 sm:w-auto w-full"
              disabled={isSearching}
            >
              {isSearching ? '検索中...' : '検索'}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setQuery('主人公')}
              className="px-3 py-1 text-xs bg-gray-100 rounded-full hover:bg-gray-200"
            >
              主人公
            </button>
            <button
              type="button"
              onClick={() => setQuery('伏線')}
              className="px-3 py-1 text-xs bg-gray-100 rounded-full hover:bg-gray-200"
            >
              伏線
            </button>
            <button
              type="button"
              onClick={() => setQuery('世界設定')}
              className="px-3 py-1 text-xs bg-gray-100 rounded-full hover:bg-gray-200"
            >
              世界設定
            </button>
            <button
              type="button"
              onClick={() => setQuery('キーアイテム')}
              className="px-3 py-1 text-xs bg-gray-100 rounded-full hover:bg-gray-200"
            >
              キーアイテム
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

/**
 * 記憶階層表示コンポーネント
 */
export const MemoryHierarchy = () => {
  const { hierarchy, expandNode, collapseNode, isLoading } = useMemory();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>記憶階層</CardTitle>
        <CardDescription>短期・中期・長期の記憶構造</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="ml-4">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/5"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            <MemoryNode 
              node={hierarchy.root} 
              level={0}
              onExpand={expandNode}
              onCollapse={collapseNode}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * 記憶ノードコンポーネント
 */
interface MemoryNodeProps {
  node: any;
  level: number;
  onExpand: (nodeId: string) => void;
  onCollapse: (nodeId: string) => void;
}

const MemoryNode = ({ node, level, onExpand, onCollapse }: MemoryNodeProps) => {
  if (!node) return null;
  
  const handleToggle = () => {
    if (node.expanded) {
      onCollapse(node.id);
    } else {
      onExpand(node.id);
    }
  };
  
  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return 'border-blue-200';
      case 1: return 'border-green-200';
      case 2: return 'border-yellow-200';
      case 3: return 'border-purple-200';
      default: return 'border-gray-200';
    }
  };
  
  return (
    <div className={`border-l-2 ${getLevelColor(level)} pl-4 ml-2 py-1`}>
      <div className="flex items-center">
        {node.children && node.children.length > 0 && (
          <button
            onClick={handleToggle}
            className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 mr-2"
          >
            {node.expanded ? '−' : '+'}
          </button>
        )}
        <div className="font-medium">{node.name}</div>
        {node.chapter && (
          <div className="text-xs text-gray-500 ml-2">Ch.{node.chapter}</div>
        )}
      </div>
      
      {node.description && (
        <div className="text-sm text-gray-600 mt-1">{node.description}</div>
      )}
      
      {node.expanded && node.children && (
        <div className="mt-2 space-y-2">
          {node.children.map((child: any) => (
            <MemoryNode
              key={child.id}
              node={child}
              level={level + 1}
              onExpand={onExpand}
              onCollapse={onCollapse}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * 記憶タイムラインコンポーネント
 */
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

/**
 * 記憶ビューワーコンポーネント
 */
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