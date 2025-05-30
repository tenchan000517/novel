// src/lib/editor/version-control.ts
import { Document, EditorEdit, EditorSession } from './collaborative-editor';
import { EditorStorageAdapter } from './storage-adapter';
import { generateId } from '@/lib/utils/id-generator';
import { logError } from '@/lib/utils/error-handler';
import { logger } from '../utils/logger';

/**
 * 変更履歴
 */
interface ChangeHistory {
  /** 履歴ID */
  id: string;
  
  /** ドキュメントID */
  documentId: string;
  
  /** 変更バージョン */
  version: number;
  
  /** 変更操作 */
  changes: EditorEdit[];
  
  /** 編集者ID */
  editorId: string;
  
  /** 変更日時 */
  timestamp: Date;
  
  /** コミットメッセージ */
  message?: string;
  
  /** メタデータ */
  metadata?: Record<string, any>;
}

/**
 * 変更ドキュメント
 */
interface DocumentRevision {
  /** リビジョンID */
  revisionId: string;
  
  /** ドキュメント */
  document: Document;
  
  /** 関連変更履歴ID */
  changeHistoryId: string;
  
  /** リビジョンメタデータ */
  metadata?: Record<string, any>;
}

/**
 * バージョン管理クラス
 * ドキュメントの変更履歴を管理
 */
export class VersionControl {
  // インメモリキャッシュ
  private history: Map<string, ChangeHistory[]> = new Map();
  private latestVersions: Map<string, Document> = new Map();
  private tempStorage: Map<string, Document> = new Map();
  private changesBuffer: Map<string, EditorEdit[]> = new Map();
  
  // ストレージアダプター
  private storage: EditorStorageAdapter;
  
  /**
   * バージョン管理システムを初期化
   * @param storage ストレージアダプター
   */
  constructor(storage: EditorStorageAdapter) {
    this.storage = storage;
    logger.info('Version control system initialized');
  }
  
  /**
   * 変更を記録
   * @param session エディタセッション
   * @param edit 編集操作
   */
  async recordChange(
    session: EditorSession,
    edit: EditorEdit
  ): Promise<void> {
    try {
      const documentId = session.document.id;
      
      // 変更バッファを取得または初期化
      let editsBuffer = this.changesBuffer.get(documentId) || [];
      
      // 変更を追加
      editsBuffer.push(edit);
      
      // バッファを更新
      this.changesBuffer.set(documentId, editsBuffer);
      
      // ドキュメントの履歴を取得
      let documentHistory = this.history.get(documentId) || [];
      
      // 変更履歴を作成
      const changeHistory: ChangeHistory = {
        id: generateId(),
        documentId,
        version: session.document.version + 1,
        changes: [edit],
        editorId: session.editorId,
        timestamp: new Date(),
        metadata: {
          sessionId: session.id
        }
      };
      
      // 履歴に追加
      documentHistory.push(changeHistory);
      this.history.set(documentId, documentHistory);
      
      // テンポラリストレージに現在のドキュメントを保存
      this.tempStorage.set(documentId, { ...session.document });
      
      logger.debug(`Recorded change for document ${documentId}, new version: ${changeHistory.version}`);
    } catch (error) {
      logError(error as Error, 
        { sessionId: session.id, documentId: session.document.id, edit }, 
        'Error recording change'
      );
    }
  }
  
  /**
   * 複数の変更を記録
   * @param session エディタセッション
   * @param edits 編集操作の配列
   */
  async recordChanges(
    session: EditorSession,
    edits: EditorEdit[]
  ): Promise<void> {
    try {
      const documentId = session.document.id;
      
      // 変更バッファを取得または初期化
      let editsBuffer = this.changesBuffer.get(documentId) || [];
      
      // 変更を追加
      editsBuffer.push(...edits);
      
      // バッファを更新
      this.changesBuffer.set(documentId, editsBuffer);
      
      // ドキュメントの履歴を取得
      let documentHistory = this.history.get(documentId) || [];
      
      // 変更履歴を作成
      const changeHistory: ChangeHistory = {
        id: generateId(),
        documentId,
        version: session.document.version + 1,
        changes: [...edits],
        editorId: session.editorId,
        timestamp: new Date(),
        metadata: {
          sessionId: session.id,
          batchEdit: true,
          count: edits.length
        }
      };
      
      // 履歴に追加
      documentHistory.push(changeHistory);
      this.history.set(documentId, documentHistory);
      
      // テンポラリストレージに現在のドキュメントを保存
      this.tempStorage.set(documentId, { ...session.document });
      
      logger.debug(`Recorded ${edits.length} changes for document ${documentId}, new version: ${changeHistory.version}`);
    } catch (error) {
      logError(error as Error, 
        { sessionId: session.id, documentId: session.document.id, editsCount: edits.length }, 
        'Error recording changes'
      );
    }
  }
  
  /**
   * 変更を保存
   * @param document ドキュメント
   * @param changes 変更の配列
   */
  async saveChanges(
    document: Document,
    changes: EditorEdit[]
  ): Promise<void> {
    try {
      const documentId = document.id;
      
      // 最新バージョンを更新
      const updatedDocument: Document = {
        ...document,
        updatedAt: new Date()
      };
      
      this.latestVersions.set(documentId, updatedDocument);
      
      // GitHubストレージに保存
      await this.storage.saveDocument(updatedDocument);
      
      // リビジョンを保存
      await this.storage.saveRevision(updatedDocument, generateId());
      
      // バッファをクリア
      this.changesBuffer.delete(documentId);
      
      // テンポラリストレージから削除
      this.tempStorage.delete(documentId);
      
      logger.info(`Saved changes for document ${documentId}, version: ${document.version}`);
    } catch (error) {
      logError(error as Error, 
        { documentId: document.id, changesCount: changes.length }, 
        'Error saving changes'
      );
    }
  }
  
  /**
   * 最新バージョンを取得
   * @param documentId ドキュメントID
   * @returns 最新のドキュメント
   */
  async getLatestVersion(documentId: string): Promise<Document | null> {
    try {
      // メモリキャッシュの確認
      const latestInMemory = this.latestVersions.get(documentId);
      const tempVersion = this.tempStorage.get(documentId);
      
      // テンポラリストレージに最新の変更があればそれを優先
      if (tempVersion && (!latestInMemory || tempVersion.version >= latestInMemory.version)) {
        return tempVersion;
      }
      
      if (latestInMemory) {
        return latestInMemory;
      }
      
      // ストレージから最新バージョンを取得
      const document = await this.storage.loadDocument(documentId);
      
      // キャッシュに保存
      if (document) {
        this.latestVersions.set(documentId, document);
      }
      
      return document;
    } catch (error) {
      logError(error as Error, { documentId }, 'Error getting latest version');
      return null;
    }
  }
  
  /**
   * 特定バージョンを取得
   * @param documentId ドキュメントID
   * @param version バージョン番号
   * @returns 指定バージョンのドキュメント
   */
  async getVersion(
    documentId: string,
    version: number
  ): Promise<Document | null> {
    try {
      // 最新バージョンがリクエストされたバージョンであれば返す
      const latestVersion = await this.getLatestVersion(documentId);
      if (latestVersion && latestVersion.version === version) {
        return latestVersion;
      }
      
      // ストレージからリビジョンを取得
      const revisionDocument = await this.storage.loadRevision(documentId, version);
      
      return revisionDocument;
    } catch (error) {
      logError(error as Error, { documentId, version }, 'Error getting version');
      return null;
    }
  }
  
  /**
   * 変更履歴を取得
   * @param documentId ドキュメントID
   * @returns 変更履歴の配列
   */
  async getHistory(documentId: string): Promise<any[]> {
    try {
      // インメモリの履歴を取得
      const inMemoryHistory = this.history.get(documentId) || [];
      
      // ストレージからリビジョン情報を取得
      const revisions = await this.storage.listRevisions(documentId);
      
      // リビジョン情報を履歴形式に変換
      const storageHistory = revisions.map(rev => ({
        id: generateId(),
        documentId,
        version: rev.version,
        changes: [],
        editorId: 'UNKNOWN',
        timestamp: rev.timestamp,
        message: 'Saved revision'
      }));
      
      // 両方をマージして重複を排除
      const combinedHistory = [...inMemoryHistory];
      
      // バージョン番号に基づいて重複を防止
      for (const historyItem of storageHistory) {
        if (!combinedHistory.some(item => item.version === historyItem.version)) {
          combinedHistory.push(historyItem);
        }
      }
      
      // 日付順にソート
      return combinedHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      logError(error as Error, { documentId }, 'Error getting history');
      return [];
    }
  }
  
  /**
   * リビジョン履歴を取得
   * @param documentId ドキュメントID
   * @returns リビジョン履歴
   */
  async getRevisionHistory(documentId: string): Promise<any[]> {
    try {
      // ストレージからリビジョン情報を取得
      return await this.storage.listRevisions(documentId);
    } catch (error) {
      logError(error as Error, { documentId }, 'Error getting revision history');
      return [];
    }
  }
  
  /**
   * 特定のバージョンに戻す
   * @param documentId ドキュメントID
   * @param version バージョン番号
   * @returns 成功フラグ
   */
  async revertToVersion(
    documentId: string,
    version: number
  ): Promise<boolean> {
    try {
      // 指定バージョンのドキュメントを取得
      const document = await this.getVersion(documentId, version);
      
      if (!document) {
        logger.warn(`Version ${version} of document ${documentId} not found`);
        return false;
      }
      
      // 最新バージョンを更新
      const revertedDocument: Document = {
        ...document,
        version: document.version,
        updatedAt: new Date(),
        metadata: {
          ...document.metadata,
          revertedFrom: document.version,
          revertedAt: new Date()
        }
      };
      
      this.latestVersions.set(documentId, revertedDocument);
      
      // ストレージに保存
      await this.storage.saveDocument(revertedDocument);
      
      // 新しいリビジョンとして保存
      await this.storage.saveRevision(revertedDocument, generateId());
      
      // 履歴に戻した記録を残す
      const revertChangeHistory: ChangeHistory = {
        id: generateId(),
        documentId,
        version: revertedDocument.version + 1,
        changes: [{
          type: 'REPLACE',
          position: 0,
          text: revertedDocument.content,
          deleteLength: 0, // ダミー値
          timestamp: new Date(),
          editorId: 'SYSTEM',
          metadata: {
            revertOperation: true,
            originalVersion: version
          }
        }],
        editorId: 'SYSTEM',
        timestamp: new Date(),
        message: `Reverted to version ${version}`
      };
      
      // 履歴に追加
      const documentHistory = this.history.get(documentId) || [];
      documentHistory.push(revertChangeHistory);
      this.history.set(documentId, documentHistory);
      
      logger.info(`Reverted document ${documentId} to version ${version}`);
      return true;
    } catch (error) {
      logError(error as Error, 
        { documentId, version }, 
        'Error reverting to version'
      );
      return false;
    }
  }
  
  /**
   * コミットメッセージを設定
   * @param documentId ドキュメントID
   * @param version バージョン番号
   * @param message コミットメッセージ
   * @returns 成功フラグ
   */
  async setCommitMessage(
    documentId: string,
    version: number,
    message: string
  ): Promise<boolean> {
    try {
      // メモリ内の履歴を更新
      const documentHistory = this.history.get(documentId) || [];
      const historyEntry = documentHistory.find(entry => entry.version === version);
      
      if (historyEntry) {
        historyEntry.message = message;
        this.history.set(documentId, documentHistory);
      }
      
      // 注: ストレージ内のリビジョンメタデータの更新は実装しません
      // 差し戻し時や、別のメカニズムでの対応を想定
      
      logger.info(`Set commit message for document ${documentId} version ${version}`);
      return true;
    } catch (error) {
      logError(error as Error, 
        { documentId, version, message }, 
        'Error setting commit message'
      );
      return false;
    }
  }
  
  /**
   * バージョン間の差分を取得
   * @param documentId ドキュメントID
   * @param fromVersion 開始バージョン
   * @param toVersion 終了バージョン
   * @returns 差分情報
   */
  async getDiff(
    documentId: string,
    fromVersion: number,
    toVersion: number
  ): Promise<any> {
    try {
      // バージョンを取得
      const fromDoc = await this.getVersion(documentId, fromVersion);
      const toDoc = await this.getVersion(documentId, toVersion);
      
      if (!fromDoc || !toDoc) {
        logger.warn(`Unable to get versions for diff: document ${documentId} from=${fromVersion} to=${toVersion}`);
        return null;
      }
      
      // 差分アルゴリズムを使用
      const diffs = diffAlgorithm.computeDiff(fromDoc.content, toDoc.content);
      
      // 行レベルの差分も計算
      const lineDiff = diffAlgorithm.getLineDiff(fromDoc.content, toDoc.content);
      
      return {
        fromVersion,
        toVersion,
        fromDate: fromDoc.updatedAt,
        toDate: toDoc.updatedAt,
        diffs,
        lineDiff,
        stats: {
          addedLines: lineDiff.added.length,
          deletedLines: lineDiff.deleted.length,
          modifiedLines: lineDiff.modified.length,
          totalChanges: lineDiff.added.length + lineDiff.deleted.length + lineDiff.modified.length
        }
      };
    } catch (error) {
      logError(error as Error, 
        { documentId, fromVersion, toVersion }, 
        'Error getting diff'
      );
      return null;
    }
  }
  
  /**
   * バージョン情報を取得
   * @param documentId ドキュメントID
   * @returns バージョン情報
   */
  async getVersionInfo(documentId: string): Promise<any> {
    try {
      // 履歴を取得
      const history = await this.getHistory(documentId);
      
      // リビジョン履歴を取得
      const revisions = await this.getRevisionHistory(documentId);
      
      // 最新バージョンを取得
      const latestVersion = await this.getLatestVersion(documentId);
      
      return {
        currentVersion: latestVersion ? latestVersion.version : null,
        historyCount: history.length,
        revisionCount: revisions.length,
        lastUpdated: latestVersion ? latestVersion.updatedAt : null,
        versions: revisions
      };
    } catch (error) {
      logError(error as Error, 
        { documentId }, 
        'Error getting version info'
      );
      return null;
    }
  }
  
  /**
   * バッファされた変更を取得
   * @param documentId ドキュメントID
   * @returns 変更の配列
   */
  getBufferedChanges(documentId: string): EditorEdit[] {
    return this.changesBuffer.get(documentId) || [];
  }
  
  /**
   * メモリキャッシュをクリア
   */
  clearCache(): void {
    this.latestVersions.clear();
    this.tempStorage.clear();
    logger.debug('Version control cache cleared');
  }
  
  /**
   * ドキュメントキャッシュを無効化
   * @param documentId ドキュメントID
   */
  invalidateDocumentCache(documentId: string): void {
    this.latestVersions.delete(documentId);
    this.tempStorage.delete(documentId);
    logger.debug(`Version control cache invalidated for document: ${documentId}`);
  }
}

// 差分アルゴリズムのインポート
import { diffAlgorithm } from './diff-algorithm';