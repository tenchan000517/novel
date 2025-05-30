// src/lib/editor/collaborative-editor.ts
import { ConflictResolver } from './conflict-resolver';
import { VersionControl } from './version-control';
import { EditorStorageAdapter } from './storage-adapter';
import { generateId, generateSessionId } from '@/lib/utils/id-generator';
import { logError, logWarn } from '@/lib/utils/error-handler';
import { logger } from '../utils/logger';
import { storageProvider } from '../storage';

/**
 * ドキュメント
 */
export interface Document {
  /** ドキュメントID */
  id: string;
  
  /** ドキュメントタイトル */
  title: string;
  
  /** ドキュメント内容 */
  content: string;
  
  /** ドキュメントバージョン */
  version: number;
  
  /** 最終更新日時 */
  updatedAt: Date;
  
  /** メタデータ */
  metadata: Record<string, any>;
}

/**
 * 編集操作
 */
export interface EditorEdit {
  /** 編集タイプ */
  type: 'INSERT' | 'DELETE' | 'REPLACE';
  
  /** 編集位置 */
  position: number;
  
  /** 編集内容（挿入・置換時）*/
  text?: string;
  
  /** 削除長（削除時）*/
  deleteLength?: number;
  
  /** 置換対象（置換時）*/
  replaceTarget?: string;
  
  /** タイムスタンプ */
  timestamp: Date;
  
  /** 編集者ID */
  editorId: string;
  
  /** メタデータ */
  metadata?: Record<string, any>;
}

/**
 * エディタセッション
 */
export interface EditorSession {
  /** セッションID */
  id: string;
  
  /** 編集者ID */
  editorId: string;
  
  /** ドキュメント */
  document: Document;
  
  /** セッション開始時間 */
  startedAt: Date;
  
  /** 最終アクティブ時間 */
  lastActive: Date;
  
  /** セッションのステータス */
  status: 'ACTIVE' | 'IDLE' | 'ENDED';
  
  /** 保留中の編集 */
  pendingEdits: EditorEdit[];
  
  /** メタデータ */
  metadata?: Record<string, any>;
}

/**
 * コンフリクト
 */
export interface Conflict {
  /** 行番号 */
  lineNumber: number;
  
  /** 基本内容 */
  baseContent: string;
  
  /** 編集内容 */
  editedContent: string;
  
  /** 他の内容 */
  otherContent: string;
  
  /** コンフリクトタイプ */
  type: string;
}

/**
 * 解決戦略
 */
export interface ResolutionStrategy {
  /** コンフリクトインデックス */
  conflictIndex: number;
  
  /** 戦略タイプ */
  type: 'TAKE_MINE' | 'TAKE_THEIRS' | 'MERGE' | 'MANUAL';
  
  /** 提案内容 */
  suggestedContent?: string;
}

/**
 * 解決内容
 */
export interface Resolution {
  /** コンフリクト */
  conflicts: Conflict[];
  
  /** 解決戦略 */
  strategies: ResolutionStrategy[];
  
  /** マージ済みドキュメント */
  mergedDocument: Document;
}

/**
 * 編集結果
 */
export interface EditResult {
  /** 成功フラグ */
  success: boolean;
  
  /** 結果ドキュメント */
  document?: Document;
  
  /** コンフリクト */
  conflicts?: Conflict[];
  
  /** 解決提案 */
  resolution?: Resolution;
  
  /** エラーメッセージ */
  error?: string;
}

/**
 * 協調編集クラス
 * 複数ユーザーによる同時編集をサポート
 */
export class CollaborativeEditor {
  private sessions: Map<string, EditorSession> = new Map();
  private documents: Map<string, Document> = new Map();
  private conflictResolver: ConflictResolver;
  private versionControl: VersionControl;
  private storage: EditorStorageAdapter;
  
  /**
   * 協調編集システムを初期化
   * @param storageAdapter ストレージアダプター（オプション）
   */
  constructor(storageAdapter?: EditorStorageAdapter) {
    // ストレージアダプターの初期化
    this.storage = storageAdapter || new EditorStorageAdapter(storageProvider);
    
    // コンフリクトリゾルバーの初期化
    this.conflictResolver = new ConflictResolver();
    
    // バージョン管理の初期化
    this.versionControl = new VersionControl(this.storage);
    
    // セッションクリーンアップの定期実行
    setInterval(() => this.cleanupInactiveSessions(), 1000 * 60 * 30); // 30分ごと
    
    logger.info('Collaborative editor initialized');
  }
  
  /**
   * セッションを開始
   * @param editorId 編集者ID
   * @param document ドキュメント
   * @returns セッション
   */
  async startSession(editorId: string, document: Document): Promise<EditorSession> {
    logger.info(`Starting session for editor ${editorId} on document ${document.id}`);
    
    // 既存のセッションを確認
    const existingSession = this.findExistingSession(editorId, document.id);
    if (existingSession) {
      logger.info(`Reusing existing session ${existingSession.id}`);
      
      // 既存セッションを更新して返す
      existingSession.lastActive = new Date();
      existingSession.status = 'ACTIVE';
      this.sessions.set(existingSession.id, existingSession);
      return existingSession;
    }
    
    // 最新バージョンを取得
    const latestDocument = await this.getLatestDocument(document.id) || document;
    
    // ドキュメントを保存
    this.documents.set(document.id, latestDocument);
    
    // セッションを作成
    const sessionId = generateSessionId();
    const session: EditorSession = {
      id: sessionId,
      editorId,
      document: { ...latestDocument },
      startedAt: new Date(),
      lastActive: new Date(),
      status: 'ACTIVE',
      pendingEdits: [],
      metadata: {
        clientInfo: {
          startedAt: new Date().toISOString()
        }
      }
    };
    
    // セッションを保存
    this.sessions.set(sessionId, session);
    
    // ストレージにセッション情報を保存
    await this.storage.saveSession(sessionId, session);
    
    logger.info(`Session started: ${sessionId} for editor ${editorId} on document ${document.id}`);
    
    return session;
  }
  
  /**
   * 既存のセッションを検索
   * @param editorId 編集者ID
   * @param documentId ドキュメントID
   * @returns 既存セッション（存在すれば）
   */
  private findExistingSession(editorId: string, documentId: string): EditorSession | undefined {
    for (const session of this.sessions.values()) {
      if (session.editorId === editorId && 
          session.document.id === documentId && 
          session.status !== 'ENDED') {
        return session;
      }
    }
    return undefined;
  }
  
  /**
   * セッションを終了
   * @param sessionId セッションID
   * @returns 成功フラグ
   */
  async endSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      logWarn('Attempt to end non-existent session', 
        new Error(`Session not found: ${sessionId}`), 
        { sessionId }
      );
      return false;
    }
    
    logger.info(`Ending session: ${sessionId}`);
    
    // 保留中の編集があれば保存
    if (session.pendingEdits.length > 0) {
      await this.saveDocument(sessionId);
    }
    
    // セッションのステータスを変更
    session.status = 'ENDED';
    this.sessions.set(sessionId, session);
    
    // ストレージからセッション情報を削除
    await this.storage.deleteSession(sessionId);
    
    // セッションを削除
    setTimeout(() => {
      this.sessions.delete(sessionId);
    }, 1000 * 60); // 1分後に削除
    
    logger.info(`Session ended: ${sessionId}`);
    
    return true;
  }
  
  /**
   * 編集を適用
   * @param sessionId セッションID
   * @param edit 編集操作
   * @returns 編集結果
   */
  async applyEdit(sessionId: string, edit: EditorEdit): Promise<EditResult> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return {
        success: false,
        error: `Session not found: ${sessionId}`
      };
    }
    
    logger.debug(`Applying edit to document ${session.document.id} in session ${sessionId}`);
    
    // セッションの最終アクティブ時間を更新
    session.lastActive = new Date();
    
    try {
      // 編集を適用
      const editedDocument = this.applyEditToDocument(session.document, edit);
      
      // 他のアクティブセッションを取得
      const otherSessions = this.getOtherActiveSessions(sessionId, session.document.id);
      
      // コンフリクトをチェック
      const conflicts = await this.conflictResolver.checkConflicts(
        this.documents.get(session.document.id) || session.document,
        editedDocument,
        otherSessions
      );
      
      if (conflicts.length > 0) {
        logger.info(`Conflicts detected in session ${sessionId}: ${conflicts.length} conflicts`);
        
        // 解決案を提案
        const resolution = await this.conflictResolver.suggestResolution(conflicts);
        
        // 編集を保留
        session.pendingEdits.push(edit);
        this.sessions.set(sessionId, session);
        
        return {
          success: false,
          conflicts,
          resolution,
          error: 'Conflicts detected'
        };
      }
      
      // コンフリクトがなければ編集を適用
      session.document = editedDocument;
      this.sessions.set(sessionId, session);
      
      // 編集を記録
      await this.versionControl.recordChange(session, edit);
      
      return {
        success: true,
        document: editedDocument
      };
    } catch (error) {
      logError(error as Error, { sessionId, edit }, 'Error applying edit');
      
      return {
        success: false,
        error: `Failed to apply edit: ${(error as Error).message}`
      };
    }
  }
  
  /**
   * 複数の編集を適用
   * @param sessionId セッションID
   * @param edits 編集操作の配列
   * @returns 編集結果
   */
  async applyEdits(sessionId: string, edits: EditorEdit[]): Promise<EditResult> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return {
        success: false,
        error: `Session not found: ${sessionId}`
      };
    }
    
    logger.debug(`Applying ${edits.length} edits to document ${session.document.id} in session ${sessionId}`);
    
    // セッションの最終アクティブ時間を更新
    session.lastActive = new Date();
    
    try {
      // 編集を順に適用
      let editedDocument = { ...session.document };
      
      for (const edit of edits) {
        editedDocument = this.applyEditToDocument(editedDocument, edit);
      }
      
      // 他のアクティブセッションを取得
      const otherSessions = this.getOtherActiveSessions(sessionId, session.document.id);
      
      // コンフリクトをチェック
      const conflicts = await this.conflictResolver.checkConflicts(
        this.documents.get(session.document.id) || session.document,
        editedDocument,
        otherSessions
      );
      
      if (conflicts.length > 0) {
        logger.info(`Conflicts detected in session ${sessionId}: ${conflicts.length} conflicts`);
        
        // 解決案を提案
        const resolution = await this.conflictResolver.suggestResolution(conflicts);
        
        // 編集を保留
        session.pendingEdits.push(...edits);
        this.sessions.set(sessionId, session);
        
        return {
          success: false,
          conflicts,
          resolution,
          error: 'Conflicts detected'
        };
      }
      
      // コンフリクトがなければ編集を適用
      session.document = editedDocument;
      this.sessions.set(sessionId, session);
      
      // 編集を記録
      await this.versionControl.recordChanges(session, edits);
      
      return {
        success: true,
        document: editedDocument
      };
    } catch (error) {
      logError(error as Error, { sessionId, edits }, 'Error applying edits');
      
      return {
        success: false,
        error: `Failed to apply edits: ${(error as Error).message}`
      };
    }
  }
  
  /**
   * ドキュメントを保存
   * @param sessionId セッションID
   * @returns 成功フラグ
   */
  async saveDocument(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return false;
    }
    
    logger.info(`Saving document ${session.document.id} from session ${sessionId}`);
    
    try {
      // バージョン番号を増加
      const updatedDocument: Document = {
        ...session.document,
        version: session.document.version + 1,
        updatedAt: new Date()
      };
      
      // ドキュメントを更新
      this.documents.set(updatedDocument.id, updatedDocument);
      
      // セッションのドキュメントも更新
      session.document = updatedDocument;
      const pendingEdits = [...session.pendingEdits]; // コピーを作成
      session.pendingEdits = []; // 保留中の編集をクリア
      this.sessions.set(sessionId, session);
      
      // 変更を保存
      await this.versionControl.saveChanges(updatedDocument, pendingEdits);
      
      logger.info(`Document saved: ${updatedDocument.id} (version: ${updatedDocument.version})`);
      
      return true;
    } catch (error) {
      logError(error as Error, { sessionId, documentId: session.document.id }, 'Error saving document');
      return false;
    }
  }
  
  /**
   * 解決戦略を適用
   * @param sessionId セッションID
   * @param resolution 解決内容
   * @returns 編集結果
   */
  async applyResolution(sessionId: string, resolution: Resolution): Promise<EditResult> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return {
        success: false,
        error: `Session not found: ${sessionId}`
      };
    }
    
    logger.info(`Applying resolution in session ${sessionId}`);
    
    try {
      // 解決されたドキュメントを適用
      const resolvedDocument: Document = {
        ...resolution.mergedDocument,
        version: session.document.version,
        updatedAt: new Date()
      };
      
      // セッションを更新
      session.document = resolvedDocument;
      this.sessions.set(sessionId, session);
      
      // ドキュメントを更新
      this.documents.set(resolvedDocument.id, resolvedDocument);
      
      // 保留中の編集を適用済みとしてクリア
      session.pendingEdits = [];
      
      logger.info(`Resolution applied in session ${sessionId}`);
      
      return {
        success: true,
        document: resolvedDocument
      };
    } catch (error) {
      logError(error as Error, { sessionId, resolution }, 'Error applying resolution');
      
      return {
        success: false,
        error: `Failed to apply resolution: ${(error as Error).message}`
      };
    }
  }
  
  /**
   * セッション情報を取得
   * @param sessionId セッションID
   * @returns セッション情報（存在しない場合はnull）
   */
  getSessionInfo(sessionId: string): EditorSession | null {
    // メモリセッションを確認
    const session = this.sessions.get(sessionId);
    if (session) {
      return session;
    }
    
    // ストレージから読み込みを試みる
    this.storage.loadSession(sessionId).then(sessionData => {
      if (sessionData) {
        this.sessions.set(sessionId, sessionData);
      }
    }).catch(error => {
      logger.warn(`Failed to load session ${sessionId} from storage`, { error });
    });
    
    return null;
  }
  
  /**
   * ドキュメントのセッションを取得
   * @param documentId ドキュメントID
   * @returns セッションの配列
   */
  getDocumentSessions(documentId: string): EditorSession[] {
    const documentSessions: EditorSession[] = [];
    
    // メモリからアクティブセッションを取得
    for (const session of this.sessions.values()) {
      if (session.document.id === documentId && session.status !== 'ENDED') {
        documentSessions.push(session);
      }
    }
    
    // ストレージからセッション情報を追加で取得
    this.storage.getDocumentSessions(documentId).then(async sessionIds => {
      for (const sessionId of sessionIds) {
        // 既に取得済みでないか確認
        if (!this.sessions.has(sessionId)) {
          const sessionData = await this.storage.loadSession(sessionId);
          if (sessionData && sessionData.status !== 'ENDED') {
            this.sessions.set(sessionId, sessionData);
            documentSessions.push(sessionData);
          }
        }
      }
    }).catch(error => {
      logger.warn(`Failed to load document sessions for ${documentId}`, { error });
    });
    
    return documentSessions;
  }
  
  /**
   * 編集者のアクティブセッションを取得
   * @param editorId 編集者ID
   * @returns セッションの配列
   */
  getEditorSessions(editorId: string): EditorSession[] {
    const editorSessions: EditorSession[] = [];
    
    for (const session of this.sessions.values()) {
      if (session.editorId === editorId && session.status !== 'ENDED') {
        editorSessions.push(session);
      }
    }
    
    return editorSessions;
  }
  
  /**
   * ドキュメントの最新バージョンを取得
   * @param documentId ドキュメントID
   * @returns ドキュメント（存在しない場合はnull）
   */
  async getLatestDocument(documentId: string): Promise<Document | null> {
    // バージョン管理からの取得を試みる
    return await this.versionControl.getLatestVersion(documentId);
  }
  
  /**
   * 編集履歴を取得
   * @param documentId ドキュメントID
   * @returns 変更履歴
   */
  async getEditHistory(documentId: string): Promise<any[]> {
    return await this.versionControl.getHistory(documentId);
  }
  
  /**
   * 特定バージョンに戻す
   * @param documentId ドキュメントID
   * @param version バージョン番号
   * @returns 成功フラグ
   */
  async revertToVersion(documentId: string, version: number): Promise<boolean> {
    logger.info(`Reverting document ${documentId} to version ${version}`);
    
    const result = await this.versionControl.revertToVersion(documentId, version);
    
    if (result) {
      // ドキュメントを更新
      const revertedDocument = await this.versionControl.getLatestVersion(documentId);
      
      if (revertedDocument) {
        this.documents.set(documentId, revertedDocument);
        
        // 関連セッションを更新
        for (const session of this.getDocumentSessions(documentId)) {
          session.document = { ...revertedDocument };
          session.pendingEdits = [];
          this.sessions.set(session.id, session);
        }
      }
    }
    
    return result;
  }
  
  /**
   * バージョン情報を取得
   * @param documentId ドキュメントID
   * @returns バージョン情報
   */
  async getVersionInfo(documentId: string): Promise<any> {
    return await this.versionControl.getVersionInfo(documentId);
  }
  
  /**
   * ドキュメントに編集を適用
   * @param document ドキュメント
   * @param edit 編集操作
   * @returns 編集後のドキュメント
   */
  private applyEditToDocument(document: Document, edit: EditorEdit): Document {
    const content = document.content;
    
    let newContent: string;
    
    switch (edit.type) {
      case 'INSERT':
        if (edit.position < 0 || edit.position > content.length) {
          throw new Error(`Invalid insert position: ${edit.position}`);
        }
        
        newContent = content.substring(0, edit.position) + (edit.text || '') + content.substring(edit.position);
        break;
        
      case 'DELETE':
        if (edit.position < 0 || edit.position >= content.length || !edit.deleteLength) {
          throw new Error(`Invalid delete parameters: position=${edit.position}, length=${edit.deleteLength}`);
        }
        
        newContent = content.substring(0, edit.position) + content.substring(edit.position + edit.deleteLength);
        break;
        
      case 'REPLACE':
        if (edit.position < 0 || edit.position >= content.length || !edit.replaceTarget) {
          throw new Error(`Invalid replace parameters: position=${edit.position}, target=${edit.replaceTarget}`);
        }
        
        const targetContent = content.substring(edit.position, edit.position + edit.replaceTarget.length);
        
        if (targetContent !== edit.replaceTarget) {
          throw new Error(`Replace target mismatch: expected "${edit.replaceTarget}", found "${targetContent}"`);
        }
        
        newContent = content.substring(0, edit.position) + (edit.text || '') + 
          content.substring(edit.position + edit.replaceTarget.length);
        break;
        
      default:
        throw new Error(`Unknown edit type: ${(edit as any).type}`);
    }
    
    return {
      ...document,
      content: newContent
    };
  }
  
  /**
   * 他のアクティブセッションを取得
   * @param currentSessionId 現在のセッションID
   * @param documentId ドキュメントID
   * @returns 他のアクティブセッションの配列
   */
  private getOtherActiveSessions(currentSessionId: string, documentId: string): EditorSession[] {
    const otherSessions: EditorSession[] = [];
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (sessionId !== currentSessionId && 
          session.document.id === documentId && 
          session.status === 'ACTIVE') {
        otherSessions.push(session);
      }
    }
    
    return otherSessions;
  }
  
  /**
   * 非アクティブセッションのクリーンアップ
   */
  private cleanupInactiveSessions(): void {
    const now = new Date();
    const inactivityThreshold = 1000 * 60 * 60; // 1時間
    
    for (const [sessionId, session] of this.sessions.entries()) {
      // 非アクティブ時間を計算
      const inactiveTime = now.getTime() - session.lastActive.getTime();
      
      if (inactiveTime > inactivityThreshold) {
        // 非アクティブセッションを終了
        session.status = 'ENDED';
        logger.info(`Auto-ended inactive session: ${sessionId}`);
        
        // ストレージからセッション情報を削除
        this.storage.deleteSession(sessionId).catch(error => {
          logger.warn(`Failed to delete session ${sessionId} from storage`, { error });
        });
        
        // セッションを削除
        this.sessions.delete(sessionId);
      }
    }
  }
}