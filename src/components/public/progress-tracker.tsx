// src/components/public/progress-tracker.tsx
interface ProgressTrackerProps {
    chapter: number;
    total: number;
  }
  
  export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ chapter, total }) => {
    const progress = (chapter / total) * 100;
    
    return (
      <div className="progress-tracker mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            読書進捗
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(progress)}% 完了
          </span>
        </div>
        
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-indigo-600 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 flex justify-between">
          <span>第1章</span>
          <span>現在: 第{chapter}章</span>
          <span>第{total}章</span>
        </div>
      </div>
    );
  };