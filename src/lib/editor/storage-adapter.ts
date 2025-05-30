// src/lib/editor/storage-adapter.ts
import { StorageProvider } from '../storage/types';
import { Document } from './collaborative-editor';
import { logger } from '../utils/logger';
import { generateId } from '../utils/id-generator';
import { logError } from '../utils/error-handler';

/**
 * 協調編集のためのストレージパス設定
 */
interface CollaborationStoragePaths {
  /** ドキュメント本体のパス形式 */
  documentPath: (documentId: string) => string;
  
  /** リビジョンのパス形式 */
  revisionPath: (documentId: string, version: number) => string;
  
  /** セッション情報のパス形式 */
  sessionPath: (sessionId: string) => string;
  
  /** ドキュメントのセッション一覧パス形式 */
  documentSessionsPath: (documentId: string) => string;
}

/**
 * デフォルトのストレージパス設定
 */
const DEFAULT_STORAGE_PATHS: CollaborationStoragePaths = {
  documentPath: (documentId: string) => `editor/documents/${documentId}.json`,
  revisionPath: (documentId: string, version: number) => `editor/revisions/${documentId}/v${version}.json`,
  sessionPath: (sessionId: string) => `editor/sessions/${sessionId}.json`,
  documentSessionsPath: (documentId: string) => `editor/document-sessions/${documentId}.json`,
};

/**
 * GitHubストレージと協調編集を接続するアダプター
 * このクラスは協調編集と永続化層の橋渡しをする
 */
export class EditorStorageAdapter {
  private storage: StorageProvider;
  private paths: CollaborationStoragePaths;
  private cache: Map<string, any> = new Map();
  
  /**
   * エディタストレージアダプターを初期化
   * @param storage ストレージプロバイダー
   * @param paths カスタムパス設定（オプション）
   */
  constructor(
    storage: StorageProvider,
    paths: Partial<CollaborationStoragePaths> = {}
  ) {
    this.storage = storage;
    this.paths = { ...DEFAULT_STORAGE_PATHS, ...paths };
    
    logger.info('Editor storage adapter initialized');
  }
  
  /**
   * ドキュメントを読み込む
   * @param documentId ドキュメントID
   * @returns ドキュメント（存在しない場合はnull）
   */
  async loadDocument(documentId: string): Promise<Document | null> {
    try {
      const cacheKey = `document:${documentId}`;
      
      // キャッシュ確認
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
      
      const path = this.paths.documentPath(documentId);
      const exists = await this.storage.fileExists(path);
      
      if (!exists) {
        logger.warn(`Document not found: ${documentId}`);
        return null;
      }
      
      const content = await this.storage.readFile(path);
      const document = JSON.parse(content) as Document;
      
      // キャッシュに保存
      this.cache.set(cacheKey, document);
      
      return document;
    } catch (error) {
      logError(error, { documentId }, `Error loading document: ${documentId}`);
      return null;
    }
  }
  
  /**
   * ドキュメントを保存
   * @param document ドキュメント
   * @returns 成功フラグ
   */
  async saveDocument(document: Document): Promise<boolean> {
    try {
      const path = this.paths.documentPath(document.id);
      
      // JSONに変換
      const content = JSON.stringify(document, null, 2);
      
      // ストレージに保存
      await this.storage.writeFile(path, content);
      
      // キャッシュを更新
      const cacheKey = `document:${document.id}`;
      this.cache.set(cacheKey, document);
      
      logger.info(`Document saved: ${document.id} (version: ${document.version})`);
      return true;
    } catch (error) {
      logError(error, { documentId: document.id }, `Error saving document: ${document.id}`);
      return false;
    }
  }
  
  /**
   * ドキュメントリビジョンを保存
   * @param document ドキュメント
   * @param revisionId リビジョンID（オプション、省略時は自動生成）
   * @returns 成功フラグ
   */
  async saveRevision(document: Document, revisionId?: string): Promise<boolean> {
    try {
      const path = this.paths.revisionPath(document.id, document.version);
      
      // リビジョン情報作成
      const revision = {
        revisionId: revisionId || generateId(),
        document,
        timestamp: new Date(),
      };
      
      // JSONに変換
      const content = JSON.stringify(revision, null, 2);
      
      // ストレージに保存
      await this.storage.writeFile(path, content);
      
      logger.info(`Revision saved: ${document.id} (version: ${document.version})`);
      return true;
    } catch (error) {
      logError(error, 
        { documentId: document.id, version: document.version }, 
        `Error saving revision: ${document.id} v${document.version}`
      );
      return false;
    }
  }
  
  /**
   * リビジョンを読み込む
   * @param documentId ドキュメントID
   * @param version バージョン番号
   * @returns ドキュメント（存在しない場合はnull）
   */
  async loadRevision(documentId: string, version: number): Promise<Document | null> {
    try {
      const path = this.paths.revisionPath(documentId, version);
      const exists = await this.storage.fileExists(path);
      
      if (!exists) {
        logger.warn(`Revision not found: ${documentId} v${version}`);
        return null;
      }
      
      const content = await this.storage.readFile(path);
      const revision = JSON.parse(content);
      
      return revision.document;
    } catch (error) {
      logError(error, 
        { documentId, version }, 
        `Error loading revision: ${documentId} v${version}`
      );
      return null;
    }
  }
  
  /**
   * ドキュメントのリビジョン一覧を取得
   * @param documentId ドキュメントID
   * @returns リビジョン情報の配列
   */
  async listRevisions(documentId: string): Promise<{version: number, timestamp: Date}[]> {
    try {
      const baseDir = `editor/revisions/${documentId}`;
      
      // ディレクトリが存在するか確認
      const exists = await this.storage.directoryExists(baseDir);
      if (!exists) {
        return [];
      }
      
      // ファイル一覧を取得
      const files = await this.storage.listFiles(baseDir);
      
      // バージョン情報を抽出
      const versionRegex = /v(\d+)\.json$/;
      const revisions = [];
      
      for (const file of files) {
        const match = file.match(versionRegex);
        if (match && match[1]) {
          const version = parseInt(match[1], 10);
          
          // リビジョンファイルから情報を読み取る
          try {
            const content = await this.storage.readFile(file);
            const revision = JSON.parse(content);
            
            revisions.push({
              version,
              timestamp: new Date(revision.timestamp)
            });
          } catch (error) {
            logger.warn(`Error parsing revision file: ${file}`);
          }
        }
      }
      
      // バージョン降順でソート
      return revisions.sort((a, b) => b.version - a.version);
    } catch (error) {
      logError(error, { documentId }, `Error listing revisions: ${documentId}`);
      return [];
    }
  }
  
  /**
   * セッション情報を保存
   * @param sessionId セッションID
   * @param sessionData セッションデータ
   * @returns 成功フラグ
   */
  async saveSession(sessionId: string, sessionData: any): Promise<boolean> {
    try {
      const path = this.paths.sessionPath(sessionId);
      
      // JSONに変換
      const content = JSON.stringify(sessionData, null, 2);
      
      // ストレージに保存
      await this.storage.writeFile(path, content);
      
      // ドキュメントに関連付けられたセッション一覧も更新
      if (sessionData.document && sessionData.document.id) {
        await this.addSessionToDocument(sessionData.document.id, sessionId);
      }
      
      logger.info(`Session saved: ${sessionId}`);
      return true;
    } catch (error) {
      logError(error, { sessionId }, `Error saving session: ${sessionId}`);
      return false;
    }
  }
  
  /**
   * セッション情報を読み込む
   * @param sessionId セッションID
   * @returns セッションデータ（存在しない場合はnull）
   */
  async loadSession(sessionId: string): Promise<any | null> {
    try {
      const path = this.paths.sessionPath(sessionId);
      const exists = await this.storage.fileExists(path);
      
      if (!exists) {
        return null;
      }
      
      const content = await this.storage.readFile(path);
      return JSON.parse(content);
    } catch (error) {
      logError(error, { sessionId }, `Error loading session: ${sessionId}`);
      return null;
    }
  }
  
  /**
   * セッションを削除
   * @param sessionId セッションID
   * @returns 成功フラグ
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const path = this.paths.sessionPath(sessionId);
      const exists = await this.storage.fileExists(path);
      
      if (!exists) {
        return true; // 既に存在しない場合は成功とみなす
      }
      
      // セッション情報を取得してドキュメントIDを確認
      const sessionData = await this.loadSession(sessionId);
      
      // ストレージから削除
      await this.storage.deleteFile(path);
      
      // ドキュメントに関連付けられたセッション一覧からも削除
      if (sessionData && sessionData.document && sessionData.document.id) {
        await this.removeSessionFromDocument(sessionData.document.id, sessionId);
      }
      
      logger.info(`Session deleted: ${sessionId}`);
      return true;
    } catch (error) {
      logError(error, { sessionId }, `Error deleting session: ${sessionId}`);
      return false;
    }
  }
  
  /**
   * ドキュメントに関連するセッションを追加
   * @param documentId ドキュメントID
   * @param sessionId セッションID
   */
  private async addSessionToDocument(documentId: string, sessionId: string): Promise<void> {
    try {
      const path = this.paths.documentSessionsPath(documentId);
      let sessions: string[] = [];
      
      // 既存のセッション一覧を読み込む
      const exists = await this.storage.fileExists(path);
      if (exists) {
        const content = await this.storage.readFile(path);
        sessions = JSON.parse(content);
      }
      
      // セッションを追加（重複を避ける）
      if (!sessions.includes(sessionId)) {
        sessions.push(sessionId);
        
        // 更新を保存
        await this.storage.writeFile(path, JSON.stringify(sessions, null, 2));
      }
    } catch (error) {
      logError(error, 
        { documentId, sessionId }, 
        `Error adding session to document: ${documentId}, session: ${sessionId}`
      );
    }
  }
  
  /**
   * ドキュメントに関連するセッションを削除
   * @param documentId ドキュメントID
   * @param sessionId セッションID
   */
  private async removeSessionFromDocument(documentId: string, sessionId: string): Promise<void> {
    try {
      const path = this.paths.documentSessionsPath(documentId);
      
      // 既存のセッション一覧を読み込む
      const exists = await this.storage.fileExists(path);
      if (!exists) {
        return;
      }
      
      const content = await this.storage.readFile(path);
      let sessions: string[] = JSON.parse(content);
      
      // セッションを削除
      sessions = sessions.filter(id => id !== sessionId);
      
      // 更新を保存
      await this.storage.writeFile(path, JSON.stringify(sessions, null, 2));
    } catch (error) {
      logError(error, 
        { documentId, sessionId }, 
        `Error removing session from document: ${documentId}, session: ${sessionId}`
      );
    }
  }
  
  /**
   * ドキュメントに関連するセッション一覧を取得
   * @param documentId ドキュメントID
   * @returns セッションID配列
   */
  async getDocumentSessions(documentId: string): Promise<string[]> {
    try {
      const path = this.paths.documentSessionsPath(documentId);
      const exists = await this.storage.fileExists(path);
      
      if (!exists) {
        return [];
      }
      
      const content = await this.storage.readFile(path);
      return JSON.parse(content);
    } catch (error) {
      logError(error, { documentId }, `Error getting document sessions: ${documentId}`);
      return [];
    }
  }
  
  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.cache.clear();
    logger.debug('Storage adapter cache cleared');
  }
  
  /**
   * 特定のドキュメントのキャッシュをクリア
   * @param documentId ドキュメントID
   */
  invalidateDocumentCache(documentId: string): void {
    const cacheKey = `document:${documentId}`;
    this.cache.delete(cacheKey);
    logger.debug(`Cache invalidated for document: ${documentId}`);
  }
}