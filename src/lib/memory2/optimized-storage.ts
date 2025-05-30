// src/lib/memory/optimized-storage.ts
import { logger } from '@/lib/utils/logger';

/**
 * @class OptimizedStorageProvider
 * @description
 * 効率的なデータ永続化のための最適化されたストレージプロバイダです。
 * キャッシュ、バッチ処理、遅延書き込み、リトライロジックを実装することで、
 * パフォーマンスと信頼性を向上させています。
 */
export class OptimizedStorageProvider {
  private cache = new Map<string, any>();
  private pendingWrites = new Map<string, NodeJS.Timeout>();
  private readonly WRITE_DELAY = 500; // ms
  private readonly MAX_RETRY = 3;
  private readonly cachedPaths = new Set<string>();
  
  /**
   * コンストラクタ
   */
  constructor() {
    // キャッシュ対象のパスを登録
    this.registerCachedPaths([
      'world-knowledge/current.json',
      'narrative-memory/state.json',
      'immediate-context/metadata.json'
    ]);
  }
  
  /**
   * キャッシュ対象のパスを登録します
   * 
   * @param paths キャッシュ対象のパス配列
   */
  registerCachedPaths(paths: string[]): void {
    paths.forEach(path => this.cachedPaths.add(path));
  }
  
  /**
   * ファイルを読み込みます
   * 
   * @param path ファイルパス
   * @returns {Promise<string>} ファイルの内容
   */
  async readFile(path: string): Promise<string> {
    // キャッシュが有効なパスかつキャッシュにデータがある場合はキャッシュから返す
    if (this.cachedPaths.has(path) && this.cache.has(path)) {
      logger.debug(`Cache hit for: ${path}`);
      return this.cache.get(path);
    }
    
    // ファイルを読み込む
    const content = await this.realReadFile(path);
    
    // キャッシュ対象の場合はキャッシュに保存
    if (this.cachedPaths.has(path)) {
      this.cache.set(path, content);
    }
    
    return content;
  }
  
  /**
   * 実際のファイル読み込み処理
   * 実環境では外部ストレージサービスへの接続などを実装
   */
  private async realReadFile(path: string): Promise<string> {
    // 実際の実装では外部ストレージやファイルシステムからの読み込み
    // ダミー実装
    return '{}';
  }
  
  /**
   * ファイルを書き込みます
   * 
   * @param path ファイルパス
   * @param content 書き込む内容
   * @returns {Promise<void>} 処理完了時に解決するPromise
   */
  async writeFile(path: string, content: string): Promise<void> {
    // キャッシュ対象の場合はキャッシュを更新
    if (this.cachedPaths.has(path)) {
      this.cache.set(path, content);
    }
    
    // 既存の保留中の書き込みがあればクリア
    if (this.pendingWrites.has(path)) {
      clearTimeout(this.pendingWrites.get(path)!);
    }
    
    // 遅延書き込みでバッチ化
    const timeout = setTimeout(async () => {
      try {
        await this.executeWrite(path, content);
        this.pendingWrites.delete(path);
      } catch (error) {
        logger.error(`Failed to write file: ${path}`, { error: error instanceof Error ? error.message : String(error) });
        // バックアップを試みる
        await this.writeBackup(path, content);
      }
    }, this.WRITE_DELAY);
    
    this.pendingWrites.set(path, timeout);
  }
  
  /**
   * 実際の書き込み処理（リトライロジック付き）
   * 
   * @param path ファイルパス
   * @param content 書き込む内容
   * @param retry リトライ回数
   * @returns {Promise<void>} 処理完了時に解決するPromise
   */
  private async executeWrite(path: string, content: string, retry: number = 0): Promise<void> {
    try {
      await this.realWriteFile(path, content);
      logger.debug(`Successfully wrote file: ${path}`);
    } catch (error) {
      if (retry < this.MAX_RETRY) {
        // リトライ
        logger.warn(`Retrying write to ${path} (${retry + 1}/${this.MAX_RETRY})`);
        await new Promise(resolve => setTimeout(resolve, 100 * (retry + 1)));
        return this.executeWrite(path, content, retry + 1);
      } else {
        // リトライ上限に達した
        throw error;
      }
    }
  }
  
  /**
   * 実際のファイル書き込み処理
   * 実環境では外部ストレージサービスへの接続などを実装
   */
  private async realWriteFile(path: string, content: string): Promise<void> {
    // 実際の実装では外部ストレージやファイルシステムへの書き込み
    // ダミー実装
  }
  
  /**
   * バックアップ書き込み
   * 
   * @param path ファイルパス
   * @param content 書き込む内容
   * @returns {Promise<void>} 処理完了時に解決するPromise
   */
  private async writeBackup(path: string, content: string): Promise<void> {
    try {
      const backupPath = `${path}.backup`;
      await this.realWriteFile(backupPath, content);
      logger.info(`Wrote backup file: ${backupPath}`);
    } catch (error) {
      logger.error(`Failed to write backup file: ${path}`, { error: error instanceof Error ? error.message : String(error) });
    }
  }
  
  /**
   * すべての保留中の書き込みを即時実行します
   * アプリケーション終了時などに使用
   * 
   * @returns {Promise<void>} 処理完了時に解決するPromise
   */
  async flushAll(): Promise<void> {
    const promises: Promise<void>[] = [];
    
    // すべての保留中の書き込みを即時実行
    for (const [path, timeout] of this.pendingWrites.entries()) {
      clearTimeout(timeout);
      
      // キャッシュされているデータを取得
      const content = this.cachedPaths.has(path) && this.cache.has(path)
        ? this.cache.get(path)
        : null;
      
      if (content !== null) {
        promises.push(this.executeWrite(path, content));
      }
    }
    
    // すべての書き込みが完了するまで待機
    if (promises.length > 0) {
      logger.info(`Flushing ${promises.length} pending writes`);
      await Promise.all(promises);
      this.pendingWrites.clear();
    }
  }
  
  /**
   * ディレクトリが存在するか確認します
   * 
   * @param path ディレクトリパス
   * @returns {Promise<boolean>} 存在する場合はtrue
   */
  async directoryExists(path: string): Promise<boolean> {
    try {
      // 実際の実装では外部ストレージやファイルシステムの確認
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * ディレクトリを作成します
   * 
   * @param path ディレクトリパス
   * @returns {Promise<void>} 処理完了時に解決するPromise
   */
  async createDirectory(path: string): Promise<void> {
    try {
      // 実際の実装では外部ストレージやファイルシステムでのディレクトリ作成
    } catch (error) {
      logger.error(`Failed to create directory: ${path}`, { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }
  
  /**
   * ファイルが存在するか確認します
   * 
   * @param path ファイルパス
   * @returns {Promise<boolean>} 存在する場合はtrue
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      // 実際の実装では外部ストレージやファイルシステムの確認
      return true;
    } catch (error) {
      return false;
    }
  }
}