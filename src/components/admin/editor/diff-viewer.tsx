// src/components/admin/editor/diff-viewer.tsx
interface DiffViewerProps {
  original: { content: string } | null; // nullも許容するように修正
  modified: { content: string } | null;
}
  
export const DiffViewer: React.FC<DiffViewerProps> = ({ original, modified }) => {
  // nullチェックを追加
  if (!original || !modified) {
    return <div>比較するドキュメントがありません</div>;
  }    // 実際の実装ではより複雑な差分表示ロジックを使用します
    // ここではシンプルな実装にしています
    
    // ダミーの差分表示
    const renderDummyDiff = () => {
      const lines = modified.content.split('\n');
      
      return (
        <div className="font-mono text-sm">
          {lines.map((line, index) => {
            // ランダムに差分表示（実際の実装では実際の差分を計算）
            const isDiff = index % 7 === 0;
            const isAddition = index % 11 === 0;
            
            return (
              <div 
                key={index} 
                className={`py-1 px-2 ${
                  isDiff 
                    ? isAddition 
                      ? 'bg-green-100 border-l-4 border-green-500' 
                      : 'bg-red-100 border-l-4 border-red-500'
                    : ''
                }`}
              >
                <span className="text-gray-500 inline-block w-8">{index + 1}</span>
                <span>{line}</span>
              </div>
            );
          })}
        </div>
      );
    };
    
    return (
      <div className="border rounded-md overflow-x-auto">
        {renderDummyDiff()}
      </div>
    );
  };