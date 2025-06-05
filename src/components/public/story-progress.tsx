// src/components/public/story-progress.tsx
export const StoryProgress = () => {
    // モックデータ（実際の実装では API から取得）
    const totalChapters = 100;
    const currentChapter = 10;
    const progress = (currentChapter / totalChapters) * 100;
    
    return (
      <section className="story-progress bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">ストーリー進行状況</h2>
        
        <div className="flex items-center mb-2">
          <div className="flex-grow">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-indigo-600 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className="ml-4 text-sm font-medium text-gray-700">
            {Math.round(progress)}%
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <div>現在: 第{currentChapter}章</div>
          <div>予定: 全{totalChapters}章</div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <div className="text-sm font-medium text-gray-500">現在のアーク</div>
            <div className="text-gray-900 font-medium">始まりの旅路</div>
          </div>
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <div className="text-sm font-medium text-gray-500">次の更新</div>
            <div className="text-gray-900 font-medium">明日 12:00</div>
          </div>
        </div>
      </section>
    );
  };