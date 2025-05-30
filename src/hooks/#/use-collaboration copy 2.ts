// src/hooks/use-collaboration.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Document, EditorEdit } from '@/lib/editor/collaborative-editor';

/**
 * 編集者情報
 */
export interface EditorInfo {
  /** 編集者ID */
  id: string;
  
  /** 編集者名 */
  name: string;
  
  /** ステータス */
  status: 'ACTIVE' | 'IDLE' | 'OFFLINE';
  
  /** 最終アクティビティ */
  lastActivity: string;
  
  /** カーソル位置 */
  cursorPosition?: number;
  
  /** 選択範囲 */
  selection?: { start: number; end: number };
}

/**
 * コンフリクト情報
 */
export interface ConflictInfo {
  /** コンフリクト数 */
  count: number;
  
  /** コンフリクト詳細 */
  details: {
    lineNumber: number;
    baseContent: string;
    editedContent: string;
    otherContent: string;
  }[];
  
  /** 解決戦略 */
  strategies: {
    conflictIndex: number;
    type: string;
    suggestedContent?: string;
  }[];
}

/**
 * 解決結果
 */
interface ResolutionResult {
  /** 成功フラグ */
  success: boolean;
  
  /** 結果ドキュメント */
  document?: Document;
  
  /** エラーメッセージ */
  error?: string;
}

/**
 * 編集結果
 */
interface EditResult {
  /** 成功フラグ */
  success: boolean;
  
  /** 結果ドキュメント */
  document?: Document;
  
  /** コンフリクト情報 */
  conflict?: ConflictInfo;
  
  /** エラーメッセージ */
  error?: string;
}

/**
 * バージョン情報
 */
interface VersionInfo {
  /** 現在のバージョン */
  currentVersion: number;
  
  /** 履歴 */
  versions: {
    version: number;
    timestamp: Date;
  }[];
}

/**
 * 協調編集のためのフック
 */
export const useCollaboration = (editorId: string) => {
  // セッション状態
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeEditors, setActiveEditors] = useState<EditorInfo[]>([]);
  const [conflict, setConflict] = useState<ConflictInfo | null>(null);
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ポーリング用のタイマー
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  
  // イベントハンドラー
  const onEdit = useRef<((document: Document) => void) | null>(null);
  const onConflict = useRef<((conflict: ConflictInfo) => void) | null>(null);
  
  /**
   * 協調編集を開始
   * @param targetDocumentId ドキュメントID
   * @param initialContent 初期コンテンツ (オプション)
   */
  const startCollaboration = useCallback(async (
    targetDocumentId: string,
    initialContent?: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // セッション開始リクエスト
      const response = await fetch('/api/editor/collaboration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'START_SESSION',
          documentId: targetDocumentId,
          editorId
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start collaboration session');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }
      
      // セッション情報を保存
      setSessionId(data.sessionId);
      setDocumentId(targetDocumentId);
      setDocument(data.document);
      setIsConnected(true);
      
      // 初期内容が指定されている場合は適用
      if (initialContent && initialContent !== data.document.content) {
        await applyEdit({
          type: 'REPLACE',
          position: 0,
          text: initialContent,
          replaceTarget: data.document.content,
          timestamp: new Date(),
          editorId
        });
      }
      
      // ポーリングを開始
      startPolling();
      
      return true;
    } catch (err) {
      setError((err as Error).message);
      console.error('Error starting collaboration:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [editorId]);
  
  /**
   * 協調編集を終了
   */
  const endCollaboration = useCallback(async (): Promise<boolean> => {
    if (!sessionId) return false;
    
    try {
      setIsLoading(true);
      
      // ポーリングを停止
      stopPolling();
      
      // セッション終了リクエスト
      const response = await fetch('/api/editor/collaboration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'END_SESSION',
          sessionId
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to end collaboration session');
      }
      
      // セッション情報をクリア
      setSessionId(null);
      setDocumentId(null);
      setDocument(null);
      setIsConnected(false);
      setActiveEditors([]);
      setConflict(null);
      
      return data.success;
    } catch (err) {
      setError((err as Error).message);
      console.error('Error ending collaboration:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);
  
  /**
   * 編集を適用
   * @param edit 編集操作
   */
  const applyEdit = useCallback(async (
    edit: EditorEdit
  ): Promise<EditResult> => {
    if (!sessionId || !documentId) {
      return {
        success: false,
        error: 'No active collaboration session'
      };
    }
    
    try {
      setIsLoading(true);
      
      // 編集適用リクエスト
      const response = await fetch('/api/editor/collaboration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'APPLY_EDIT',
          sessionId,
          edit
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply edit');
      }
      
      if (!data.success) {
        // コンフリクトが検出された場合
        if (data.conflicts && data.resolution) {
          const conflictInfo: ConflictInfo = {
            count: data.conflicts.length,
            details: data.conflicts,
            strategies: data.resolution.strategies
          };
          
          setConflict(conflictInfo);
          
          // コンフリクトイベントをトリガー
          if (onConflict.current) {
            onConflict.current(conflictInfo);
          }
          
          return {
            success: false,
            conflict: conflictInfo,
            error: 'Conflicts detected'
          };
        }
        
        return {
          success: false,
          error: data.error || 'Unknown error occurred'
        };
      }
      
      // 編集が成功した場合、ドキュメントを更新
      if (data.result && data.result.document) {
        setDocument(data.result.document);
        
        // 編集イベントをトリガー
        if (onEdit.current) {
          onEdit.current(data.result.document);
        }
      }
      
      return {
        success: true,
        document: data.result.document
      };
    } catch (err) {
      setError((err as Error).message);
      console.error('Error applying edit:', err);
      
      return {
        success: false,
        error: (err as Error).message
      };
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, documentId]);
  
  /**
   * 複数の編集を一括適用
   * @param edits 編集操作の配列
   */
  const applyEdits = useCallback(async (
    edits: EditorEdit[]
  ): Promise<EditResult> => {
    if (!sessionId || !documentId) {
      return {
        success: false,
        error: 'No active collaboration session'
      };
    }
    
    try {
      setIsLoading(true);
      
      // 編集適用リクエスト
      const response = await fetch('/api/editor/collaboration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'APPLY_EDITS',
          sessionId,
          edits
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply edits');
      }
      
      if (!data.success) {
        // コンフリクトが検出された場合
        if (data.conflicts && data.resolution) {
          const conflictInfo: ConflictInfo = {
            count: data.conflicts.length,
            details: data.conflicts,
            strategies: data.resolution.strategies
          };
          
          setConflict(conflictInfo);
          
          // コンフリクトイベントをトリガー
          if (onConflict.current) {
            onConflict.current(conflictInfo);
          }
          
          return {
            success: false,
            conflict: conflictInfo,
            error: 'Conflicts detected'
          };
        }
        
        return {
          success: false,
          error: data.error || 'Unknown error occurred'
        };
      }
      
      // 編集が成功した場合、ドキュメントを更新
      if (data.result && data.result.document) {
        setDocument(data.result.document);
        
        // 編集イベントをトリガー
        if (onEdit.current) {
          onEdit.current(data.result.document);
        }
      }
      
      return {
        success: true,
        document: data.result.document
      };
    } catch (err) {
      setError((err as Error).message);
      console.error('Error applying edits:', err);
      
      return {
        success: false,
        error: (err as Error).message
      };
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, documentId]);
  
  /**
   * ドキュメントを保存
   */
  const saveDocument = useCallback(async (): Promise<boolean> => {
    if (!sessionId || !documentId) {
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // 保存リクエスト
      const response = await fetch('/api/editor/collaboration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'SAVE_DOCUMENT',
          sessionId
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save document');
      }
      
      return data.success;
    } catch (err) {
      setError((err as Error).message);
      console.error('Error saving document:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, documentId]);
  
  /**
   * コンフリクトを解決
   * @param strategyIndices 採用する戦略のインデックス
   */
  const resolveConflicts = useCallback(async (
    strategyIndices: number[]
  ): Promise<ResolutionResult> => {
    if (!sessionId || !conflict) {
      return {
        success: false,
        error: 'No active conflicts to resolve'
      };
    }
    
    try {
      setIsLoading(true);
      
      // 選択された戦略を適用
      const selectedStrategies = strategyIndices.map(index => conflict.strategies[index]);
      
      // 解決リクエスト
      const response = await fetch('/api/editor/collaboration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'APPLY_RESOLUTION',
          sessionId,
          strategies: selectedStrategies
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resolve conflicts');
      }
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Unknown error occurred'
        };
      }
      
      // 解決が成功した場合、ドキュメントを更新
      if (data.document) {
        setDocument(data.document);
        setConflict(null);
        
        // 編集イベントをトリガー
        if (onEdit.current) {
          onEdit.current(data.document);
        }
      }
      
      return {
        success: true,
        document: data.document
      };
    } catch (err) {
      setError((err as Error).message);
      console.error('Error resolving conflicts:', err);
      
      return {
        success: false,
        error: (err as Error).message
      };
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, conflict]);
  
  /**
   * カーソル位置を更新
   * @param position カーソル位置
   * @param selection 選択範囲 (オプション)
   */
  const updateCursorPosition = useCallback(async (
    position: number,
    selection?: { start: number; end: number }
  ): Promise<boolean> => {
    if (!sessionId || !documentId) {
      return false;
    }
    
    try {
      // カーソル位置更新リクエスト
      const response = await fetch('/api/editor/collaboration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'UPDATE_CURSOR',
          sessionId,
          editorId,
          position,
          selection
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update cursor position');
      }
      
      return data.success;
    } catch (err) {
      console.error('Error updating cursor position:', err);
      return false;
    }
  }, [sessionId, documentId, editorId]);
  
  /**
   * 特定バージョンに戻す
   * @param version バージョン番号
   */
  const revertToVersion = useCallback(async (
    version: number
  ): Promise<boolean> => {
    if (!sessionId || !documentId) {
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // バージョン戻しリクエスト
      const response = await fetch('/api/editor/collaboration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'REVERT_VERSION',
          sessionId,
          version
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to revert to version');
      }
      
      if (data.success && data.document) {
        setDocument(data.document);
        
        // バージョン情報を更新
        fetchVersionInfo();
        
        // 編集イベントをトリガー
        if (onEdit.current) {
          onEdit.current(data.document);
        }
      }
      
      return data.success;
    } catch (err) {
      setError((err as Error).message);
      console.error('Error reverting to version:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, documentId]);
  
  /**
   * バージョン情報を取得
   */
  const fetchVersionInfo = useCallback(async () => {
    if (!sessionId || !documentId) {
      return;
    }
    
    try {
      // バージョン情報取得リクエスト
      const response = await fetch(`/api/editor/collaboration/versions?documentId=${documentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch version info');
      }
      
      if (data.success) {
        setVersionInfo(data.versionInfo);
      }
    } catch (err) {
      console.error('Error fetching version info:', err);
    }
  }, [sessionId, documentId]);
  
  /**
   * セッション情報を更新
   */
  const updateSessionInfo = useCallback(async () => {
    if (!sessionId) {
      return;
    }
    
    try {
      // セッション情報取得リクエスト
      const response = await fetch(`/api/editor/collaboration?sessionId=${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 404) {
          // セッションが見つからない場合は切断
          setSessionId(null);
          setDocumentId(null);
          setDocument(null);
          setIsConnected(false);
          stopPolling();
          return;
        }
        
        throw new Error(data.error || 'Failed to update session info');
      }
      
      if (data.success) {
        // アクティブな編集者情報を更新
        setActiveEditors(data.activeEditors || []);
        
        // ドキュメントの更新があれば適用
        if (data.session && data.session.document && 
            (!document || document.version < data.session.document.version)) {
          setDocument(data.session.document);
          
          // 編集イベントをトリガー
          if (onEdit.current) {
            onEdit.current(data.session.document);
          }
        }
      }
    } catch (err) {
      console.error('Error updating session info:', err);
    }
  }, [sessionId, document]);
  
  /**
   * ポーリングを開始
   */
  const startPolling = useCallback(() => {
    // すでにポーリングが実行中の場合は停止
    stopPolling();
    
    // 新しいポーリングを開始
    pollingInterval.current = setInterval(() => {
      updateSessionInfo();
    }, 3000); // 3秒ごとに更新
    
    console.log('Started collaboration polling');
  }, [updateSessionInfo]);
  
  /**
   * ポーリングを停止
   */
  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
      console.log('Stopped collaboration polling');
    }
  }, []);
  
  /**
   * 編集イベントのリスナーを設定
   * @param callback コールバック関数
   */
  const onDocumentEdit = useCallback((callback: (document: Document) => void) => {
    onEdit.current = callback;
  }, []);
  
  /**
   * コンフリクトイベントのリスナーを設定
   * @param callback コールバック関数
   */
  const onConflictDetected = useCallback((callback: (conflict: ConflictInfo) => void) => {
    onConflict.current = callback;
  }, []);
  
  // クリーンアップ
  useEffect(() => {
    return () => {
      // セッションが開始されていれば終了
      if (sessionId) {
        endCollaboration().catch(console.error);
      }
      
      // ポーリングを停止
      stopPolling();
    };
  }, [sessionId, endCollaboration, stopPolling]);
  
  return {
    // 状態
    sessionId,
    documentId,
    document,
    isConnected,
    activeEditors,
    conflict,
    versionInfo,
    isLoading,
    error,
    
    // アクション
    startCollaboration,
    endCollaboration,
    applyEdit,
    applyEdits,
    saveDocument,
    resolveConflicts,
    updateCursorPosition,
    revertToVersion,
    fetchVersionInfo,
    
    // イベントリスナー
    onDocumentEdit,
    onConflictDetected
  };
};

export default useCollaboration;