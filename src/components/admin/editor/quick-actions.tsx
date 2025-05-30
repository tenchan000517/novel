// src/components/admin/editor/quick-actions.tsx
import { useState } from 'react';

interface ActionButton {
  id: string;
  label: string;
  icon: string;
  description: string;
  action: () => void;
}

export const QuickActions: React.FC = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  const handleAction = async (id: string, action: () => void) => {
    setIsLoading(id);
    try {
      await action();
    } catch (error) {
      console.error(`Action ${id} failed:`, error);
    } finally {
      setIsLoading(null);
    }
  };
  
  const actions: ActionButton[] = [
    {
      id: 'generate',
      label: '生成開始',
      icon: '▶️',
      description: '次のチャプターの生成を開始します',
      action: () => new Promise(resolve => setTimeout(resolve, 1000))
    },
    {
      id: 'pause',
      label: '一時停止',
      icon: '⏸️',
      description: '生成プロセスを一時停止します',
      action: () => new Promise(resolve => setTimeout(resolve, 500))
    },
    {
      id: 'regenerate',
      label: '再生成',
      icon: '🔄',
      description: '現在のチャプターを再生成します',
      action: () => new Promise(resolve => setTimeout(resolve, 1500))
    },
    {
      id: 'validate',
      label: '検証',
      icon: '✅',
      description: 'チャプターの品質を検証します',
      action: () => new Promise(resolve => setTimeout(resolve, 800))
    },
    {
      id: 'publish',
      label: '公開',
      icon: '📢',
      description: 'チャプターを公開します',
      action: () => new Promise(resolve => setTimeout(resolve, 700))
    },
    {
      id: 'optimize',
      label: '最適化',
      icon: '⚡',
      description: '生成設定を最適化します',
      action: () => new Promise(resolve => setTimeout(resolve, 600))
    }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">クイックアクション</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => handleAction(action.id, action.action)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
              isLoading === action.id 
                ? 'bg-gray-100 text-gray-400' 
                : 'hover:bg-gray-50 hover:border-gray-300'
            }`}
            disabled={isLoading !== null}
            title={action.description}
          >
            <span className="text-2xl mb-1">{action.icon}</span>
            <span className="text-sm">{action.label}</span>
            {isLoading === action.id && (
              <span className="mt-1 w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};