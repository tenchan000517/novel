import { useMemory } from '@/hooks/use-memory';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface MemoryNode {
  id: string;
  name: string;
  description?: string;
  chapter?: number;
  children?: MemoryNode[];
  expanded?: boolean;
}

interface MemoryNodeProps {
  node: MemoryNode;
  level: number;
  onExpand: (nodeId: string) => void;
  onCollapse: (nodeId: string) => void;
}

const MemoryNodeComponent = ({ node, level, onExpand, onCollapse }: MemoryNodeProps) => {
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
            <MemoryNodeComponent
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
            <MemoryNodeComponent 
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