/**
 * @fileoverview 永続化ストレージとの一貫したインターフェースを提供するアダプター
 * @description
 * このファイルは、分析システムと永続化ストレージ間の抽象化レイヤーを提供するストレージアダプタークラスを
 * 実装しています。分析結果の保存、読み込み、削除などの操作を標準化し、ファイルパス管理、
 * エラーハンドリング、最適化された読み書き操作を提供します。
 * 
 * @role
 * - 分析システムと永続化ストレージ間の橋渡し
 * - 分析タイプ別のファイルパス生成と管理
 * - JSON形式データの効率的な読み書き
 * - エラーハンドリングとリカバリ戦略
 * - 書き込みのバッファリングと最適化
 */

import { StorageProvider } from '@/lib/storage/types';
import { storageProvider as defaultStorageProvider } from '@/lib/storage/index';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';

// 分析結果メタデータ型
interface AnalysisMetadata {
  type: string;
  id: string;
  version: string;
  timestamp: number;
  size: number;
}

// 書き込みバッファエントリ型
interface BufferedWrite {
  path: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

/**
 * @class StorageAdapter
 * @description
 * 永続化ストレージとの一貫したインターフェースを提供するアダプタークラス。
 * 分析結果の保存と読み込みを標準化します。
 * 
 * @role
 * - 分析結果の永続化処理
 * - キャッシュデータの保存と読み込み
 * - ファイルパスの抽象化と管理
 * - ストレージエラーのハンドリング
 * - 効率的な読み書き操作の提供
 */
export class StorageAdapter {
  // 永続化ストレージプロバイダー
  private storageProvider: StorageProvider;
  
  // 基本設定
  private baseDirectory: string;
  private defaultVersion: string;
  private maxRetries: number;
  
  // 書き込みバッファリング
  private writeBuffer: Map<string, BufferedWrite>;
  private bufferFlushInterval: number;
  private flushTimer: NodeJS.Timeout | null;
  private bufferSize: number;
  private bufferEnabled: boolean;
  
  /**
   * ストレージアダプターを初期化
   * 
   * @constructor
   * @param {Object} options - 初期化オプション
   * @param {StorageProvider} [options.storageProvider] - 使用するストレージプロバイダー
   * @param {string} [options.baseDirectory='analysis'] - 分析データ保存の基本ディレクトリ
   * @param {string} [options.defaultVersion='1.0.0'] - デフォルトのデータバージョン
   * @param {number} [options.bufferFlushInterval=5000] - バッファフラッシュ間隔（ミリ秒）
   * @param {number} [options.maxRetries=3] - 操作失敗時の最大リトライ回数
   * @param {boolean} [options.bufferEnabled=true] - 書き込みバッファリングの有効化
   */
  constructor(options: {
    storageProvider?: StorageProvider;
    baseDirectory?: string;
    defaultVersion?: string;
    bufferFlushInterval?: number;
    maxRetries?: number;
    bufferEnabled?: boolean;
  } = {}) {
    // ストレージプロバイダーの設定
    this.storageProvider = options.storageProvider || defaultStorageProvider;
    
    // 基本設定
    this.baseDirectory = options.baseDirectory || 'analysis';
    this.defaultVersion = options.defaultVersion || '1.0.0';
    this.maxRetries = options.maxRetries || 3;
    
    // バッファリング設定
    this.bufferEnabled = options.bufferEnabled !== undefined ? options.bufferEnabled : true;
    this.bufferFlushInterval = options.bufferFlushInterval || 5000; // 5秒
    this.writeBuffer = new Map<string, BufferedWrite>();
    this.flushTimer = null;
    this.bufferSize = 0;
    
    logger.info('StorageAdapter initialized', {
      baseDirectory: this.baseDirectory,
      bufferEnabled: this.bufferEnabled,
      flushInterval: this.bufferFlushInterval
    });
  }

  /**
   * アダプターを初期化
   * 
   * ベースディレクトリが存在することを確認し、必要に応じて作成します。
   * バッファリングが有効な場合は、フラッシュタイマーを開始します。
   * 
   * @async
   * @returns {Promise<void>} 初期化完了を示すPromise
   */
  async initialize(): Promise<void> {
    try {
      // ベースディレクトリの存在確認・作成
      if (!(await this.storageProvider.directoryExists(this.baseDirectory))) {
        await this.storageProvider.createDirectory(this.baseDirectory);
        logger.info(`Created base directory: ${this.baseDirectory}`);
      }
      
      // 各分析タイプ用のサブディレクトリを作成
      const analysisTypes = [
        'chapter',
        'style',
        'character',
        'theme',
        'narrative',
        'metadata',
        'cache'
      ];
      
      for (const type of analysisTypes) {
        const typePath = `${this.baseDirectory}/${type}`;
        if (!(await this.storageProvider.directoryExists(typePath))) {
          await this.storageProvider.createDirectory(typePath);
          logger.debug(`Created directory for ${type} analysis: ${typePath}`);
        }
      }
      
      // バッファフラッシュタイマーのセットアップ
      if (this.bufferEnabled && !this.flushTimer) {
        this.startFlushTimer();
      }
      
      logger.info('StorageAdapter successfully initialized');
    } catch (error) {
      logger.error('Failed to initialize StorageAdapter', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`StorageAdapter initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 分析結果を保存
   * 
   * 指定されたタイプとIDの分析結果を永続化ストレージに保存します。
   * バッファリングが有効な場合は、いったんバッファに保存し、定期的にフラッシュします。
   * 
   * @async
   * @template T - 保存するデータの型
   * @param {string} type - 分析タイプ（例: 'chapter', 'style'）
   * @param {string} id - 分析ID（例: チャプター番号、ハッシュ値）
   * @param {T} data - 保存する分析データ
   * @param {string} [version] - データバージョン
   * @returns {Promise<void>} 保存完了を示すPromise
   */
  async saveAnalysisResult<T>(type: string, id: string, data: T, version?: string): Promise<void> {
    const actualVersion = version || this.defaultVersion;
    const path = this.getAnalysisPath(type, id, actualVersion);
    
    try {
      // メタデータの作成
      const metadata: AnalysisMetadata = {
        type,
        id,
        version: actualVersion,
        timestamp: Date.now(),
        size: JSON.stringify(data).length
      };
      
      // メタデータのパス
      const metadataPath = `${this.baseDirectory}/metadata/${type}-${id}.json`;
      
      // バッファリングが有効な場合
      if (this.bufferEnabled) {
        // データと一緒にメタデータもバッファに追加
        this.addToBuffer(path, data);
        this.addToBuffer(metadataPath, metadata);
        
        // バッファサイズが大きくなりすぎた場合は即時フラッシュ
        if (this.bufferSize > 5 * 1024 * 1024) { // 5MB
          await this.flushBuffer();
        }
      } else {
        // 直接書き込み
        await this.writeToStorage(path, data);
        await this.writeToStorage(metadataPath, metadata);
      }
    } catch (error) {
      logger.error(`Failed to save analysis result: ${type}-${id}`, {
        error: error instanceof Error ? error.message : String(error),
        path
      });
      throw new Error(`Failed to save analysis result: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 分析結果を読み込む
   * 
   * 指定されたタイプとIDの分析結果を永続化ストレージから読み込みます。
   * データが存在しない場合はデフォルト値またはnullを返します。
   * 
   * @async
   * @template T - 読み込むデータの型
   * @param {string} type - 分析タイプ（例: 'chapter', 'style'）
   * @param {string} id - 分析ID（例: チャプター番号、ハッシュ値）
   * @param {T} [defaultValue] - データが存在しない場合のデフォルト値
   * @param {string} [version] - データバージョン
   * @returns {Promise<T | null>} 読み込んだデータまたはnull
   */
  async loadAnalysisResult<T>(type: string, id: string, defaultValue?: T, version?: string): Promise<T | null> {
    const actualVersion = version || this.defaultVersion;
    const path = this.getAnalysisPath(type, id, actualVersion);
    
    try {
      // データがバッファに存在するかチェック
      const bufferedData = this.getFromBuffer<T>(path);
      if (bufferedData !== null) {
        return bufferedData;
      }
      
      // ファイルの存在確認
      if (!(await this.storageProvider.fileExists(path))) {
        logger.debug(`Analysis result not found: ${path}`);
        return defaultValue !== undefined ? defaultValue : null;
      }
      
      // ファイルからデータを読み込み
      const content = await this.storageProvider.readFile(path);
      
      try {
        // JSONからパース
        const parsedData = JSON.parse(content) as T;
        return parsedData;
      } catch (parseError) {
        logger.warn(`Failed to parse JSON from: ${path}`, {
          error: parseError instanceof Error ? parseError.message : String(parseError)
        });
        return defaultValue !== undefined ? defaultValue : null;
      }
    } catch (error) {
      logger.error(`Failed to load analysis result: ${type}-${id}`, {
        error: error instanceof Error ? error.message : String(error),
        path
      });
      
      // エラー時はデフォルト値を返す
      return defaultValue !== undefined ? defaultValue : null;
    }
  }

  /**
   * 分析結果の存在を確認
   * 
   * 指定されたタイプとIDの分析結果が永続化ストレージに存在するかを確認します。
   * 
   * @async
   * @param {string} type - 分析タイプ（例: 'chapter', 'style'）
   * @param {string} id - 分析ID（例: チャプター番号、ハッシュ値）
   * @param {string} [version] - データバージョン
   * @returns {Promise<boolean>} 分析結果が存在する場合はtrue
   */
  async doesAnalysisExist(type: string, id: string, version?: string): Promise<boolean> {
    const actualVersion = version || this.defaultVersion;
    const path = this.getAnalysisPath(type, id, actualVersion);
    
    // バッファ内に存在するかチェック
    if (this.writeBuffer.has(path)) {
      return true;
    }
    
    try {
      // ストレージ内に存在するかチェック
      return await this.storageProvider.fileExists(path);
    } catch (error) {
      logger.error(`Failed to check if analysis exists: ${type}-${id}`, {
        error: error instanceof Error ? error.message : String(error),
        path
      });
      return false;
    }
  }

  /**
   * 指定タイプの分析ID一覧を取得
   * 
   * 指定された分析タイプのすべてのIDリストを取得します。
   * 
   * @async
   * @param {string} type - 分析タイプ（例: 'chapter', 'style'）
   * @param {string} [version] - データバージョン
   * @returns {Promise<string[]>} 分析IDのリスト
   */
  async listAnalysisIds(type: string, version?: string): Promise<string[]> {
    const actualVersion = version || this.defaultVersion;
    const dirPath = `${this.baseDirectory}/${type}`;
    
    try {
      // ディレクトリが存在しない場合は空配列を返す
      if (!(await this.storageProvider.directoryExists(dirPath))) {
        return [];
      }
      
      // ディレクトリ内のファイル一覧を取得
      const files = await this.storageProvider.listFiles(dirPath);
      
      // ファイル名からIDを抽出
      const pattern = new RegExp(`^${type}-(.*)-v${actualVersion.replace(/\./g, '\\.')}\\.json$`);
      
      const ids = files
        .map(file => {
          const match = file.split('/').pop()?.match(pattern);
          return match ? match[1] : null;
        })
        .filter((id): id is string => id !== null);
      
      return ids;
    } catch (error) {
      logger.error(`Failed to list analysis IDs for type: ${type}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * 分析結果を削除
   * 
   * 指定されたタイプとIDの分析結果を永続化ストレージから削除します。
   * 
   * @async
   * @param {string} type - 分析タイプ（例: 'chapter', 'style'）
   * @param {string} id - 分析ID（例: チャプター番号、ハッシュ値）
   * @param {string} [version] - データバージョン
   * @returns {Promise<boolean>} 削除が成功した場合はtrue
   */
  async deleteAnalysisResult(type: string, id: string, version?: string): Promise<boolean> {
    const actualVersion = version || this.defaultVersion;
    const path = this.getAnalysisPath(type, id, actualVersion);
    const metadataPath = `${this.baseDirectory}/metadata/${type}-${id}.json`;
    
    try {
      // バッファから削除
      this.removeFromBuffer(path);
      this.removeFromBuffer(metadataPath);
      
      // ファイルの存在確認
      const exists = await this.storageProvider.fileExists(path);
      if (!exists) {
        return true; // 既に存在しない場合は成功とみなす
      }
      
      // ファイルを削除
      await this.storageProvider.deleteFile(path);
      
      // メタデータも削除
      if (await this.storageProvider.fileExists(metadataPath)) {
        await this.storageProvider.deleteFile(metadataPath);
      }
      
      logger.info(`Deleted analysis result: ${type}-${id}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete analysis result: ${type}-${id}`, {
        error: error instanceof Error ? error.message : String(error),
        path
      });
      return false;
    }
  }

  /**
   * 分析結果のファイルパスを取得
   * 
   * 指定されたタイプとIDに基づいて、分析結果のファイルパスを生成します。
   * 
   * @param {string} type - 分析タイプ（例: 'chapter', 'style'）
   * @param {string} id - 分析ID（例: チャプター番号、ハッシュ値）
   * @param {string} [version] - データバージョン
   * @returns {string} 分析結果のファイルパス
   */
  getAnalysisPath(type: string, id: string, version?: string): string {
    const actualVersion = version || this.defaultVersion;
    return `${this.baseDirectory}/${type}/${type}-${id}-v${actualVersion}.json`;
  }

  /**
   * 書き込みバッファをフラッシュ
   * 
   * バッファに保存された書き込み操作をストレージに適用します。
   * 
   * @async
   * @returns {Promise<void>} フラッシュ完了を示すPromise
   */
  async flushBuffer(): Promise<void> {
    if (this.writeBuffer.size === 0) {
      return;
    }
    
    logger.debug(`Flushing write buffer with ${this.writeBuffer.size} entries`);
    
    // 現在のバッファ内容のコピーを作成
    const entries = Array.from(this.writeBuffer.entries());
    
    // バッファをクリア
    this.writeBuffer.clear();
    this.bufferSize = 0;
    
    // すべての書き込み操作を順次実行
    for (const [path, entry] of entries) {
      try {
        await this.writeToStorage(path, entry.data);
      } catch (error) {
        // エラーが発生した場合、リトライカウントを増やして再度バッファに追加
        if (entry.retryCount < this.maxRetries) {
          logger.warn(`Failed to flush buffer entry, will retry: ${path}`, {
            error: error instanceof Error ? error.message : String(error),
            retryCount: entry.retryCount
          });
          
          this.addToBuffer(path, entry.data, entry.retryCount + 1);
        } else {
          logger.error(`Failed to flush buffer entry after ${this.maxRetries} retries: ${path}`, {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }
    
    logger.debug('Buffer flush completed');
  }

  /**
   * 古いバージョンのデータをクリーンアップ
   * 
   * 指定されたタイプとIDの古いバージョンデータを削除し、最新のもののみを保持します。
   * 
   * @async
   * @param {string} type - 分析タイプ（例: 'chapter', 'style'）
   * @param {string} id - 分析ID（例: チャプター番号、ハッシュ値）
   * @param {number} [keepCount=3] - 保持するバージョン数
   * @returns {Promise<void>} クリーンアップ完了を示すPromise
   */
  async cleanupOldVersions(type: string, id: string, keepCount: number = 3): Promise<void> {
    try {
      const dirPath = `${this.baseDirectory}/${type}`;
      
      // ディレクトリが存在しない場合は何もしない
      if (!(await this.storageProvider.directoryExists(dirPath))) {
        return;
      }
      
      // ディレクトリ内のファイル一覧を取得
      const files = await this.storageProvider.listFiles(dirPath);
      
      // 指定されたタイプとIDに一致するファイルをフィルタリング
      const pattern = new RegExp(`^${type}-${id}-v(.*)\\.json$`);
      const matchingFiles = files
        .filter(file => {
          const fileName = file.split('/').pop() || '';
          return pattern.test(fileName);
        })
        .map(file => {
          const fileName = file.split('/').pop() || '';
          const match = fileName.match(pattern);
          const version = match ? match[1] : '0.0.0';
          return { file, version };
        });
      
      // バージョンでソート（降順）
      matchingFiles.sort((a, b) => {
        // バージョン文字列を比較（セマンティックバージョニングを想定）
        const aParts = a.version.split('.').map(Number);
        const bParts = b.version.split('.').map(Number);
        
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aVal = i < aParts.length ? aParts[i] : 0;
          const bVal = i < bParts.length ? bParts[i] : 0;
          
          if (aVal !== bVal) {
            return bVal - aVal; // 降順
          }
        }
        
        return 0;
      });
      
      // 保持するバージョン数を超えた古いファイルを削除
      if (matchingFiles.length > keepCount) {
        const filesToDelete = matchingFiles.slice(keepCount);
        
        for (const { file } of filesToDelete) {
          await this.storageProvider.deleteFile(file);
          logger.debug(`Deleted old version file: ${file}`);
        }
        
        logger.info(`Cleaned up ${filesToDelete.length} old versions for ${type}-${id}`);
      }
    } catch (error) {
      logger.error(`Failed to cleanup old versions for ${type}-${id}`, {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * キャッシュデータを保存
   * 
   * 一時的なキャッシュデータを保存します。有効期限付きのキャッシュとして管理されます。
   * 
   * @async
   * @template T - 保存するデータの型
   * @param {string} key - キャッシュキー
   * @param {T} data - 保存するデータ
   * @param {number} [ttlMs=3600000] - キャッシュ有効期間（ミリ秒、デフォルト1時間）
   * @returns {Promise<void>} 保存完了を示すPromise
   */
  async saveCache<T>(key: string, data: T, ttlMs: number = 3600000): Promise<void> {
    const path = `${this.baseDirectory}/cache/${key}.json`;
    
    const cacheEntry = {
      data,
      expiresAt: Date.now() + ttlMs
    };
    
    try {
      // バッファリングが有効な場合はバッファに保存
      if (this.bufferEnabled) {
        this.addToBuffer(path, cacheEntry);
      } else {
        await this.writeToStorage(path, cacheEntry);
      }
    } catch (error) {
      logger.error(`Failed to save cache: ${key}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Failed to save cache: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * キャッシュデータを読み込む
   * 
   * 保存されたキャッシュデータを読み込みます。有効期限が切れている場合はnullを返します。
   * 
   * @async
   * @template T - 読み込むデータの型
   * @param {string} key - キャッシュキー
   * @returns {Promise<T | null>} キャッシュデータまたはnull
   */
  async loadCache<T>(key: string): Promise<T | null> {
    const path = `${this.baseDirectory}/cache/${key}.json`;
    
    try {
      // バッファから取得
      const bufferedData = this.getFromBuffer<{ data: T, expiresAt: number }>(path);
      if (bufferedData !== null) {
        // 有効期限チェック
        if (bufferedData.expiresAt > Date.now()) {
          return bufferedData.data;
        }
        // 期限切れ
        this.removeFromBuffer(path);
        return null;
      }
      
      // ファイルの存在確認
      if (!(await this.storageProvider.fileExists(path))) {
        return null;
      }
      
      // ファイルからデータを読み込み
      const content = await this.storageProvider.readFile(path);
      
      try {
        // JSONからパース
        const cacheEntry = JSON.parse(content) as { data: T, expiresAt: number };
        
        // 有効期限チェック
        if (cacheEntry.expiresAt > Date.now()) {
          return cacheEntry.data;
        }
        
        // 期限切れの場合は削除して null を返す
        await this.storageProvider.deleteFile(path);
        return null;
      } catch (parseError) {
        logger.warn(`Failed to parse cache JSON: ${key}`, {
          error: parseError instanceof Error ? parseError.message : String(parseError)
        });
        return null;
      }
    } catch (error) {
      logger.error(`Failed to load cache: ${key}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * 古いキャッシュをクリーンアップ
   * 
   * 有効期限が切れた古いキャッシュデータを削除します。
   * 
   * @async
   * @returns {Promise<number>} 削除されたキャッシュエントリの数
   */
  async cleanupExpiredCache(): Promise<number> {
    const cachePath = `${this.baseDirectory}/cache`;
    let deletedCount = 0;
    
    try {
      // キャッシュディレクトリが存在しない場合は何もしない
      if (!(await this.storageProvider.directoryExists(cachePath))) {
        return 0;
      }
      
      // キャッシュディレクトリ内のファイル一覧を取得
      const files = await this.storageProvider.listFiles(cachePath);
      const now = Date.now();
      
      // 各キャッシュファイルを確認
      for (const file of files) {
        try {
          const content = await this.storageProvider.readFile(file);
          const cacheEntry = JSON.parse(content) as { expiresAt: number };
          
          // 有効期限切れの場合は削除
          if (cacheEntry.expiresAt <= now) {
            await this.storageProvider.deleteFile(file);
            deletedCount++;
          }
        } catch (error) {
          // 読み込みやパースに失敗したファイルは削除
          await this.storageProvider.deleteFile(file);
          deletedCount++;
        }
      }
      
      logger.info(`Cleaned up ${deletedCount} expired cache entries`);
      return deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup expired cache', {
        error: error instanceof Error ? error.message : String(error)
      });
      return deletedCount;
    }
  }

  // ----- プライベートヘルパーメソッド -----

  /**
   * バッファフラッシュタイマーを開始
   * 
   * 一定間隔でバッファをフラッシュするタイマーを開始します。
   * 
   * @private
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setInterval(async () => {
      if (this.writeBuffer.size > 0) {
        try {
          await this.flushBuffer();
        } catch (error) {
          logger.error('Error in timer-based buffer flush', {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }, this.bufferFlushInterval);
    
    logger.debug(`Started buffer flush timer with interval ${this.bufferFlushInterval}ms`);
  }

  /**
   * バッファにデータを追加
   * 
   * 書き込み操作をバッファに追加します。
   * 
   * @private
   * @param {string} path - ファイルパス
   * @param {any} data - 書き込むデータ
   * @param {number} [retryCount=0] - リトライ回数
   */
  private addToBuffer(path: string, data: any, retryCount: number = 0): void {
    // データサイズの推定
    const dataString = JSON.stringify(data);
    const size = dataString.length;
    
    // バッファに追加
    this.writeBuffer.set(path, {
      path,
      data,
      timestamp: Date.now(),
      retryCount
    });
    
    // バッファサイズを更新
    this.bufferSize += size;
  }

  /**
   * バッファからデータを取得
   * 
   * 指定されたパスのデータをバッファから取得します。
   * 
   * @private
   * @template T - データの型
   * @param {string} path - ファイルパス
   * @returns {T | null} バッファ内のデータまたはnull
   */
  private getFromBuffer<T>(path: string): T | null {
    const entry = this.writeBuffer.get(path);
    return entry ? entry.data as T : null;
  }

  /**
   * バッファからエントリを削除
   * 
   * 指定されたパスのエントリをバッファから削除します。
   * 
   * @private
   * @param {string} path - ファイルパス
   */
  private removeFromBuffer(path: string): void {
    this.writeBuffer.delete(path);
  }

  /**
   * ストレージにデータを書き込む
   * 
   * データをJSON形式に変換してストレージに書き込みます。
   * 
   * @private
   * @async
   * @param {string} path - ファイルパス
   * @param {any} data - 書き込むデータ
   * @returns {Promise<void>} 書き込み完了を示すPromise
   */
  private async writeToStorage(path: string, data: any): Promise<void> {
    try {
      // 親ディレクトリの存在確認
      const dirPath = path.substring(0, path.lastIndexOf('/'));
      if (!(await this.storageProvider.directoryExists(dirPath))) {
        await this.storageProvider.createDirectory(dirPath);
      }
      
      // データをJSON文字列に変換して書き込み
      const jsonString = JSON.stringify(data, null, 2);
      await this.storageProvider.writeFile(path, jsonString);
    } catch (error) {
      logger.error(`Failed to write to storage: ${path}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const storageAdapter = new StorageAdapter();