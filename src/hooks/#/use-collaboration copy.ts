// src/hooks/use-collaboration.ts
import { useState, useEffect } from 'react';

interface EditorInfo {
  id: string;
  name: string;
  status: 'ACTIVE' | 'IDLE' | 'OFFLINE';
  lastActivity: string;
}

export const useCollaboration = () => {
  const [activeEditors, setActiveEditors] = useState<EditorInfo[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // モックデータ
  const mockEditors: EditorInfo[] = [
    {
      id: 'editor-1',
      name: '佐藤編集者',
      status: 'ACTIVE',
      lastActivity: '1分前'
    },
    {
      id: 'editor-2',
      name: '鈴木レビュアー',
      status: 'IDLE',
      lastActivity: '5分前'
    }
  ];
  
  // 協調編集を開始
  const startCollaboration = async (documentId: string) => {
    // 実際の実装ではAPIを使用してセッションを作成
    console.log(`Starting collaboration on document ${documentId}`);
    
    // セッション作成のシミュレーション
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 生成されたセッションIDを保存
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
    
    // 他のエディターのリストを設定
    setActiveEditors(mockEditors);
    
    return newSessionId;
  };
  
  // 協調編集を終了
  const endCollaboration = async () => {
    if (!sessionId) return;
    
    // 実際の実装ではAPIを使用してセッションを終了
    console.log(`Ending collaboration session ${sessionId}`);
    
    // セッション終了のシミュレーション
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // セッションIDをクリア
    setSessionId(null);
    
    // エディターリストをクリア
    setActiveEditors([]);
  };
  
  // セッション情報を更新する定期的な処理
  useEffect(() => {
    if (!sessionId) return;
    
    const interval = setInterval(() => {
      // 実際の実装ではAPIを使用して最新の情報を取得
      console.log(`Updating collaboration info for session ${sessionId}`);
      
      // ステータスをランダムに更新（シミュレーション）
      setActiveEditors(prevEditors => 
        prevEditors.map(editor => ({
          ...editor,
          status: Math.random() > 0.7 ? 'IDLE' : 'ACTIVE',
          lastActivity: `${Math.floor(Math.random() * 10) + 1}分前`
        }))
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [sessionId]);
  
  return {
    activeEditors,
    sessionId,
    startCollaboration,
    endCollaboration
  };
};