// src/components/admin/editor/collaboration-panel.tsx
import { useState, useEffect } from 'react';
import { useEditor } from '@/hooks/use-editor';
import { useCollaboration } from '@/hooks/use-collaboration';
import { generateId } from '@/lib/utils/id-generator';

interface EditorInfo {
  id: string;
  name: string;
  status: 'ACTIVE' | 'IDLE' | 'OFFLINE';
  lastActivity: string;
}

export const CollaborationPanel: React.FC = () => {
  const { currentDocument, editorId: userEditorId } = useEditor();
  // editorIdが存在しない場合、ローカルストレージから取得または生成
  const [editorId, setEditorId] = useState<string>(() => {
    // useEditorからのIDがあればそれを使用
    if (userEditorId) return userEditorId;
    
    // ローカルストレージから取得を試みる
    const storedId = typeof window !== 'undefined' ? localStorage.getItem('editorId') : null;
    if (storedId) return storedId;
    
    // 新しいIDを生成
    const newId = generateId();
    if (typeof window !== 'undefined') {
      localStorage.setItem('editorId', newId);
    }
    return newId;
  });
  
  // editorIdが存在するようになったので、正しく呼び出す
  const { 
    activeEditors, 
    startCollaboration, 
    endCollaboration, 
    isConnected 
  } = useCollaboration(editorId);
  
  // isConnectedがtrueの場合はすでに協調編集中なので、isCollaboratingを更新
  const [isCollaborating, setIsCollaborating] = useState(isConnected);
  
  useEffect(() => {
    // 接続状態に基づいてisCollaboratingを更新
    setIsCollaborating(isConnected);
  }, [isConnected]);
  
  useEffect(() => {
    // コンポーネントがマウントされたときにセッション状態を確認
    if (activeEditors.length > 0) {
      setIsCollaborating(true);
    }
  }, [activeEditors]);
  
  const handleStartCollaboration = async () => {
    if (!currentDocument) return;
    
    try {
      // 協調編集を開始
      const success = await startCollaboration(currentDocument.id, currentDocument.content);
      if (success) {
        setIsCollaborating(true);
      }
    } catch (error) {
      console.error('協調編集の開始に失敗しました:', error);
    }
  };
  
  const handleEndCollaboration = async () => {
    try {
      const success = await endCollaboration();
      if (success) {
        setIsCollaborating(false);
      }
    } catch (error) {
      console.error('協調編集の終了に失敗しました:', error);
    }
  };
  
  if (!currentDocument) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-center text-gray-500">ドキュメントが選択されていません</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">協調編集</h2>
          <div className="text-xs text-gray-500">エディターID: {editorId.substring(0, 8)}...</div>
        </div>
        {isCollaborating ? (
          <button
            onClick={handleEndCollaboration}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            協調編集を終了
          </button>
        ) : (
          <button
            onClick={handleStartCollaboration}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            協調編集を開始
          </button>
        )}
      </div>
      
      <div className="p-4">
        {isCollaborating ? (
          <>
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">現在のエディター</h3>
              {activeEditors.length > 0 ? (
                <div className="space-y-2">
                  {activeEditors.map((editor) => (
                    <div 
                      key={editor.id}
                      className="flex justify-between items-center p-2 border rounded-md"
                    >
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          editor.status === 'ACTIVE' 
                            ? 'bg-green-500' 
                            : editor.status === 'IDLE' 
                              ? 'bg-yellow-500' 
                              : 'bg-gray-500'
                        }`}></div>
                        <span>{editor.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {editor.lastActivity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">他のエディターはいません</p>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">コンフリクト履歴</h3>
              <p className="text-sm text-gray-500">現在のコンフリクトはありません</p>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">協調編集を開始して、他のエディターと同時に作業できます</p>
            <button
              onClick={handleStartCollaboration}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              協調編集を開始
            </button>
          </div>
        )}
      </div>
    </div>
  );
};