// src/hooks/use-editor.ts
import { useState, useEffect, useCallback } from 'react';
import { generateId } from '@/lib/utils/id-generator';

// エディタで扱うドキュメントの型
export interface EditorDocument {
  id: string;
  title: string;
  content: string;
  version: number;
  updatedAt: string;
}

export interface UseEditorReturn {
  editorId: string;
  currentDocument: EditorDocument | null;
  isLoading: boolean;
  error: string | null;
  loadDocument: (documentId: string) => Promise<void>;
  saveDocument: (content: string) => Promise<boolean>;
  updateContent: (content: string) => void;
}

/**
 * エディタの状態と操作を管理するフック
 */
export const useEditor = (): UseEditorReturn => {
  // エディターIDの管理 - 一貫性のためローカルストレージから取得または生成
  const [editorId] = useState<string>(() => {
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
  
  const [currentDocument, setCurrentDocument] = useState<EditorDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * ドキュメントを読み込む
   */
  const loadDocument = useCallback(async (documentId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // APIからドキュメントを取得
      const response = await fetch(`/api/documents/${documentId}`);
      
      if (!response.ok) {
        throw new Error(`ドキュメントの取得に失敗しました: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.document) {
        setCurrentDocument(data.document);
      } else {
        throw new Error(data.error || 'ドキュメントの取得に失敗しました');
      }
    } catch (err) {
      setError((err as Error).message);
      console.error('ドキュメント読み込みエラー:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * ドキュメントを保存する
   */
  const saveDocument = useCallback(async (content: string): Promise<boolean> => {
    if (!currentDocument) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // APIにドキュメントを保存
      const response = await fetch(`/api/documents/${currentDocument.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          editorId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`ドキュメントの保存に失敗しました: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.document) {
        setCurrentDocument(data.document);
        return true;
      } else {
        throw new Error(data.error || 'ドキュメントの保存に失敗しました');
      }
    } catch (err) {
      setError((err as Error).message);
      console.error('ドキュメント保存エラー:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentDocument, editorId]);
  
  /**
   * エディタ内容を更新する（保存せずに状態のみ更新）
   */
  const updateContent = useCallback((content: string) => {
    if (!currentDocument) return;
    
    setCurrentDocument(prev => {
      if (!prev) return null;
      return {
        ...prev,
        content
      };
    });
  }, [currentDocument]);
  
  return {
    editorId,
    currentDocument,
    isLoading,
    error,
    loadDocument,
    saveDocument,
    updateContent
  };
};