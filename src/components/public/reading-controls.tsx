// src/components/public/reading-controls.tsx
interface ReadingControlsProps {
    fontSize: number;
    setFontSize: (size: number) => void;
    lineHeight: number;
    setLineHeight: (height: number) => void;
  }
  
  export const ReadingControls: React.FC<ReadingControlsProps> = ({
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight
  }) => {
    return (
      <div className="reading-controls mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">表示設定</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="font-size" className="block text-xs text-gray-600 mb-1">
              文字サイズ: {fontSize}px
            </label>
            <div className="flex items-center">
              <button 
                onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                className="p-1 text-gray-500 hover:text-gray-700"
                aria-label="文字サイズを小さく"
              >
                <span className="text-xs">A</span>
              </button>
              <input
                id="font-size"
                type="range"
                min="12"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full mx-2"
              />
              <button 
                onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                className="p-1 text-gray-500 hover:text-gray-700"
                aria-label="文字サイズを大きく"
              >
                <span className="text-lg">A</span>
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="line-height" className="block text-xs text-gray-600 mb-1">
              行間: {lineHeight.toFixed(1)}
            </label>
            <div className="flex items-center">
              <button 
                onClick={() => setLineHeight(Math.max(1.2, lineHeight - 0.1))}
                className="p-1 text-gray-500 hover:text-gray-700"
                aria-label="行間を狭く"
              >
                <span className="text-xs">—</span>
              </button>
              <input
                id="line-height"
                type="range"
                min="1.2"
                max="2.5"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                className="w-full mx-2"
              />
              <button 
                onClick={() => setLineHeight(Math.min(2.5, lineHeight + 0.1))}
                className="p-1 text-gray-500 hover:text-gray-700"
                aria-label="行間を広く"
              >
                <span className="text-xs">≡</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };