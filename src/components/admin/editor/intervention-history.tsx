// src/components/admin/editor/intervention-history.tsx
interface HistoryItem {
    id: string;
    timestamp: string;
    type: string;
    target: string;
    command: string;
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
  }
  
  interface InterventionHistoryProps {
    history: HistoryItem[];
  }
  
  export const InterventionHistory: React.FC<InterventionHistoryProps> = ({ history }) => {
    if (history.length === 0) {
      return (
        <div className="mt-4 text-center py-6 text-gray-500 text-sm">
          介入履歴はありません
        </div>
      );
    }
    
    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">最近の介入</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {history.map((item) => (
            <div 
              key={item.id}
              className="border-l-4 pl-3 py-2 text-sm hover:bg-gray-50"
              style={{
                borderLeftColor: 
                  item.status === 'SUCCESS' 
                    ? '#10B981' // green-500
                    : item.status === 'FAILED' 
                      ? '#EF4444' // red-500
                      : '#F59E0B' // amber-500
              }}
            >
              <div className="flex justify-between">
                <span className="font-medium">{item.type}</span>
                <span className="text-gray-500 text-xs">{item.timestamp}</span>
              </div>
              <p className="text-gray-700 mt-1">{item.command}</p>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">ターゲット: {item.target}</span>
                <span className={`text-xs ${
                  item.status === 'SUCCESS' 
                    ? 'text-green-600' 
                    : item.status === 'FAILED' 
                      ? 'text-red-600' 
                      : 'text-amber-600'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };