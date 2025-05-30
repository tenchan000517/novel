// src/components/admin/editor/preview-panel.tsx
import { useState, useEffect, useRef } from 'react';
import { useEditor } from '@/hooks/use-editor';
import { DiffViewer } from './diff-viewer';
import { QualityIndicators } from './quality-indicators';

export const PreviewPanel: React.FC = () => {
  const { currentDocument, saveDocument, isLoading } = useEditor();
  const [showDiff, setShowDiff] = useState(false);
  // オリジナルドキュメントを保持するためのステート
  const [originalDocument, setOriginalDocument] = useState<typeof currentDocument | null>(null);
  // 初回ロード時にオリジナルドキュメントを保存
  const documentLoadedRef = useRef(false);

  // currentDocumentが変更された際に、初回のみオリジナルドキュメントとして保存
  useEffect(() => {
    if (currentDocument && !documentLoadedRef.current) {
      setOriginalDocument(JSON.parse(JSON.stringify(currentDocument)));
      documentLoadedRef.current = true;
    }
  }, [currentDocument]);

  // 変更を適用する関数
  const applyChanges = async () => {
    if (!currentDocument) return;
    
    try {
      const success = await saveDocument(currentDocument.content);
      if (success) {
        // 保存成功時にオリジナルドキュメントを更新
        setOriginalDocument(JSON.parse(JSON.stringify(currentDocument)));
        alert('変更が適用されました');
      }
    } catch (error) {
      console.error('変更の適用に失敗しました:', error);
    }
  };
  
  if (!currentDocument) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">プレビューするドキュメントがありません</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">プレビュー</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowDiff(!showDiff)}
            className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
            disabled={!originalDocument}
          >
            {showDiff ? '通常表示' : '差分表示'}
          </button>
          <button
            onClick={applyChanges}
            disabled={isLoading || !currentDocument}
            className={`px-3 py-1 text-sm bg-green-600 text-white rounded-md ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'
            }`}
          >
            {isLoading ? '適用中...' : '変更を適用'}
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {showDiff && originalDocument ? (
          <DiffViewer
            original={originalDocument}
            modified={currentDocument}
          />
        ) : (
          <div className="prose max-w-none">
            <h1>{currentDocument.title}</h1>
            <div className="whitespace-pre-wrap">
              {currentDocument.content}
            </div>
          </div>
        )}
        
        <QualityIndicators document={currentDocument} />
      </div>
    </div>
  );
};