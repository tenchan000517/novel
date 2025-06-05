// src/lib/storage/types.ts
/**
 * @fileoverview ストレージ抽象化レイヤーの型定義（拡張版）
 * @description
 * このファイルは、ストレージ操作を抽象化するためのインターフェースと
 * 各ストレージプロバイダーの設定オプションの型定義を提供します。
 * これらの型定義により、異なるストレージバックエンド間で
 * 一貫したAPIを提供することが可能になります。
 * 
 * @role
 * - ストレージ操作の統一インターフェースを定義
 * - 各ストレージプロバイダーの設定オプションの型を定義
 * - 型安全なストレージアクセスを提供
 * 
 * @dependencies
 * なし（純粋な型定義ファイル）
 * 
 * @used-by
 * - ./index.ts - 型のエクスポートとストレージプロバイダーの作成
 * - ./github-storage.ts - GitHubストレージプロバイダーの実装
 * - ./local-storage.ts - ローカルストレージプロバイダーの実装
 * - ./optimized-storage.ts - キャッシュを使用した最適化されたストレージプロバイダー
 * - アプリケーション全体 - ストレージ操作のインターフェースとして
 */

/**
 * ファイルのメタデータ
 * 
 * ファイルに関する詳細情報を提供するインターフェースです。
 * サイズ、作成日時、更新日時などのファイル属性を含みます。
 * 
 * @role
 * - ファイルに関する詳細情報を標準化された形式で提供
 * - ファイル操作の前後でファイルの状態を確認するために使用
 * 
 * @usage
 * // ファイルメタデータの取得例
 * const metadata = await storage.getFileMetadata('path/to/file.txt');
 * console.log(`サイズ: ${metadata.size}バイト`);
 * console.log(`更新日時: ${metadata.modifiedAt.toISOString()}`);
 */
export interface FileMetadata {
    /**
     * ファイルパス
     * 
     * ストレージプロバイダーのベースディレクトリからの相対パスです。
     * 
     * @type {string}
     */
    path: string;

    /**
     * ファイルサイズ（バイト）
     * 
     * ファイルのバイト単位のサイズです。
     * 
     * @type {number}
     */
    size: number;

    /**
     * 作成日時
     * 
     * ファイルが作成された日時です。
     * 
     * @type {Date}
     */
    createdAt: Date;

    /**
     * 最終更新日時
     * 
     * ファイルが最後に更新された日時です。
     * 
     * @type {Date}
     */
    modifiedAt: Date;

    /**
     * ディレクトリかどうか
     * 
     * trueの場合はディレクトリ、falseの場合はファイルを示します。
     * 
     * @type {boolean}
     */
    isDirectory: boolean;
}

/**
 * ストレージプロバイダーのインターフェース
 * 
 * 異なるストレージバックエンド（GitHub、ローカルファイルシステムなど）間で
 * 一貫したファイル操作APIを提供するための共通インターフェースです。
 * すべてのストレージプロバイダー実装はこのインターフェースに準拠する必要があります。
 * 
 * @role
 * - ファイルシステム操作の抽象化レイヤーを提供
 * - 異なるストレージバックエンド間で一貫したAPIを確保
 * - アプリケーションコードからストレージの実装詳細を隠蔽
 * 
 * @implemented-by
 * - GitHubStorageProvider - GitHubリポジトリをバックエンドとして使用
 * - LocalStorageProvider - ローカルファイルシステムをバックエンドとして使用
 * - OptimizedStorage - 基本ストレージプロバイダーにキャッシュ層を追加
 * 
 * @usage
 * // ストレージプロバイダーの使用例
 * const storage: StorageProvider = new SomeStorageProvider(options);
 * 
 * // ファイル読み込み
 * const content = await storage.readFile('path/to/file.txt');
 * 
 * // ファイル書き込み
 * await storage.writeFile('path/to/file.txt', 'ファイル内容');
 */
export interface StorageProvider {
    /**
     * ファイルを読み込みます
     * 
     * 指定されたパスのファイルを読み込み、その内容を文字列として返します。
     * ファイルが存在しない場合は例外をスローします。
     * 
     * @param {string} path - ファイルパス
     * @returns {Promise<string>} ファイル内容の文字列
     * @throws {Error} ファイルが存在しない場合
     * @throws {Error} ファイル読み込み中にエラーが発生した場合
     * 
     * @usage
     * try {
     *   const content = await storage.readFile('path/to/file.txt');
     *   console.log(content);
     * } catch (error) {
     *   console.error('ファイル読み込みエラー:', error.message);
     * }
     */
    readFile(path: string): Promise<string>;

    /**
     * ファイルを書き込みます
     * 
     * 指定されたパスにファイルを書き込みます。
     * ファイルが存在しない場合は新規作成し、存在する場合は上書きします。
     * 必要に応じて親ディレクトリも作成します。
     * 
     * @param {string} path - ファイルパス
     * @param {string} content - 書き込む内容
     * @returns {Promise<void>} 処理完了後に解決するPromise
     * @throws {Error} ファイル書き込み中にエラーが発生した場合
     * 
     * @usage
     * try {
     *   await storage.writeFile('path/to/file.txt', 'ファイル内容');
     *   console.log('ファイルが正常に書き込まれました');
     * } catch (error) {
     *   console.error('ファイル書き込みエラー:', error.message);
     * }
     */
    writeFile(path: string, content: string): Promise<void>;

    /**
     * ディレクトリ内のファイル一覧を取得します
     * 
     * 指定されたディレクトリ内のファイルパスのリストを返します。
     * サブディレクトリは含まれません。
     * ディレクトリが存在しない場合は空の配列を返します。
     * 
     * @param {string} directory - ディレクトリパス
     * @returns {Promise<string[]>} ファイルパスのリスト
     * @throws {Error} ディレクトリ読み込み中にエラーが発生した場合
     * 
     * @usage
     * try {
     *   const files = await storage.listFiles('docs');
     *   files.forEach(file => console.log(file));
     * } catch (error) {
     *   console.error('ファイル一覧取得エラー:', error.message);
     * }
     */
    listFiles(directory: string): Promise<string[]>;

    /**
     * ファイルが存在するか確認します
     * 
     * 指定されたパスにファイルが存在するかどうかを確認します。
     * ディレクトリの場合はfalseを返します。
     * 
     * @param {string} path - ファイルパス
     * @returns {Promise<boolean>} ファイルが存在する場合はtrue、それ以外はfalse
     * @throws {Error} 確認中にエラーが発生した場合
     * 
     * @usage
     * try {
     *   const exists = await storage.fileExists('path/to/file.txt');
     *   console.log('ファイルは存在' + (exists ? 'します' : 'しません'));
     * } catch (error) {
     *   console.error('ファイル存在確認エラー:', error.message);
     * }
     */
    fileExists(path: string): Promise<boolean>;

    /**
     * ディレクトリが存在するか確認します
     * 
     * 指定されたパスにディレクトリが存在するかどうかを確認します。
     * ファイルの場合はfalseを返します。
     * 
     * @param {string} path - ディレクトリパス
     * @returns {Promise<boolean>} ディレクトリが存在する場合はtrue、それ以外はfalse
     * @throws {Error} 確認中にエラーが発生した場合
     * 
     * @usage
     * try {
     *   const exists = await storage.directoryExists('path/to/dir');
     *   console.log('ディレクトリは存在' + (exists ? 'します' : 'しません'));
     * } catch (error) {
     *   console.error('ディレクトリ存在確認エラー:', error.message);
     * }
     */
    directoryExists(path: string): Promise<boolean>;

    /**
     * ディレクトリを作成します
     * 
     * 指定されたパスにディレクトリを作成します。
     * 親ディレクトリが存在しない場合は再帰的に作成します。
     * 
     * @param {string} path - ディレクトリパス
     * @returns {Promise<void>} 処理完了後に解決するPromise
     * @throws {Error} ディレクトリ作成中にエラーが発生した場合
     * 
     * @usage
     * try {
     *   await storage.createDirectory('path/to/new/dir');
     *   console.log('ディレクトリが正常に作成されました');
     * } catch (error) {
     *   console.error('ディレクトリ作成エラー:', error.message);
     * }
     */
    createDirectory(path: string): Promise<void>;

    /**
     * ファイルを削除します
     * 
     * 指定されたパスのファイルを削除します。
     * ファイルが存在しない場合は何もせず正常終了します。
     * 
     * @param {string} path - ファイルパス
     * @returns {Promise<void>} 処理完了後に解決するPromise
     * @throws {Error} ファイル削除中にエラーが発生した場合
     * 
     * @usage
     * try {
     *   await storage.deleteFile('path/to/file.txt');
     *   console.log('ファイルが正常に削除されました');
     * } catch (error) {
     *   console.error('ファイル削除エラー:', error.message);
     * }
     */
    deleteFile(path: string): Promise<void>;

    /**
     * ファイルのメタデータを取得します
     * 
     * 指定されたパスのファイルに関するメタデータ情報を取得します。
     * サイズ、作成日時、更新日時などの情報が含まれます。
     * ファイルが存在しない場合はnullを返します。
     * 
     * @param {string} path - ファイルパス
     * @returns {Promise<FileMetadata | null>} ファイルメタデータまたはnull
     * @throws {Error} メタデータ取得中にエラーが発生した場合
     * 
     * @usage
     * try {
     *   const metadata = await storage.getFileMetadata('path/to/file.txt');
     *   if (metadata) {
     *     console.log(`サイズ: ${metadata.size}バイト`);
     *     console.log(`更新日時: ${metadata.modifiedAt.toISOString()}`);
     *   } else {
     *     console.log('ファイルが見つかりません');
     *   }
     * } catch (error) {
     *   console.error('メタデータ取得エラー:', error.message);
     * }
     */
    getFileMetadata?(path: string): Promise<FileMetadata | null>;

    /**
     * ファイルを移動またはリネームします
     * 
     * 指定されたパスのファイルを別のパスに移動します。
     * ファイルのリネームにも使用できます。
     * 移動先に既存のファイルがある場合は上書きします。
     * 必要に応じて移動先の親ディレクトリを作成します。
     * 
     * @param {string} sourcePath - 元のファイルパス
     * @param {string} targetPath - 移動先のパス
     * @returns {Promise<void>} 処理完了後に解決するPromise
     * @throws {Error} ファイル移動中にエラーが発生した場合
     * 
     * @usage
     * try {
     *   await storage.moveFile('path/to/old.txt', 'path/to/new.txt');
     *   console.log('ファイルが正常に移動されました');
     * } catch (error) {
     *   console.error('ファイル移動エラー:', error.message);
     * }
     */
    moveFile?(sourcePath: string, targetPath: string): Promise<void>;

    /**
     * ファイルをコピーします
     * 
     * 指定されたパスのファイルを別のパスにコピーします。
     * コピー先に既存のファイルがある場合は上書きします。
     * 必要に応じてコピー先の親ディレクトリを作成します。
     * 
     * @param {string} sourcePath - 元のファイルパス
     * @param {string} targetPath - コピー先のパス
     * @returns {Promise<void>} 処理完了後に解決するPromise
     * @throws {Error} ファイルコピー中にエラーが発生した場合
     * 
     * @usage
     * try {
     *   await storage.copyFile('path/to/original.txt', 'path/to/copy.txt');
     *   console.log('ファイルが正常にコピーされました');
     * } catch (error) {
     *   console.error('ファイルコピーエラー:', error.message);
     * }
     */
    copyFile?(sourcePath: string, targetPath: string): Promise<void>;

    /**
     * ディレクトリ内のサブディレクトリ一覧を取得します
     * 
     * 指定されたディレクトリ内のサブディレクトリパスのリストを返します。
     * ファイルは含まれません。
     * ディレクトリが存在しない場合は空の配列を返します。
     * 
     * @param {string} directory - ディレクトリパス
     * @returns {Promise<string[]>} サブディレクトリパスのリスト
     * @throws {Error} ディレクトリ読み込み中にエラーが発生した場合
     * 
     * @usage
     * try {
     *   const directories = await storage.listDirectories('content');
     *   directories.forEach(dir => console.log(dir));
     * } catch (error) {
     *   console.error('ディレクトリ一覧取得エラー:', error.message);
     * }
     */
    listDirectories?(directory: string): Promise<string[]>;
}

/**
 * GitHubストレージプロバイダーの設定オプション
 * 
 * GitHubリポジトリをバックエンドとして使用するストレージプロバイダーの
 * 設定オプションを定義します。
 * 
 * @role
 * - GitHubStorageProviderクラスの初期化に必要なパラメータを定義
 * - GitHub APIアクセスに必要な認証情報とリポジトリ設定を提供
 * 
 * @usage
 * const options: GitHubStorageOptions = {
 *   token: 'github_personal_access_token',
 *   repo: 'username/repository',
 *   branch: 'main',
 *   baseDir: 'content'
 * };
 * const storage = new GitHubStorageProvider(options);
 */
export interface GitHubStorageOptions {
    /**
     * GitHubパーソナルアクセストークン
     * 
     * GitHub APIにアクセスするための認証トークンです。
     * リポジトリの読み書き権限が必要です。
     * 
     * @type {string}
     * @required
     */
    token: string;

    /**
     * GitHubリポジトリ名
     * 
     * 'username/repo'形式のリポジトリ名です。
     * 例: 'octocat/Hello-World'
     * 
     * @type {string}
     * @required
     * @format 'username/repo'
     */
    repo: string;

    /**
     * GitHubブランチ名
     * 
     * 操作対象のブランチ名です。
     * 省略した場合は'main'が使用されます。
     * 
     * @type {string}
     * @optional
     * @default 'main'
     */
    branch: string;

    /**
     * ベースディレクトリパス
     * 
     * リポジトリ内の操作対象となるベースディレクトリです。
     * 指定した場合、すべてのファイルパスはこのディレクトリからの相対パスとして解釈されます。
     * 省略した場合はリポジトリのルートが使用されます。
     * 
     * @type {string}
     * @optional
     */
    baseDir?: string;
}

/**
 * ローカルストレージプロバイダーの設定オプション
 * 
 * ローカルファイルシステムをバックエンドとして使用するストレージプロバイダーの
 * 設定オプションを定義します。
 * 
 * @role
 * - LocalStorageProviderクラスの初期化に必要なパラメータを定義
 * - ファイルシステム操作の基準となるディレクトリ設定を提供
 * 
 * @usage
 * const options: LocalStorageOptions = {
 *   baseDir: './data',
 *   createBaseDir: true,
 *   backupEnabled: true,
 *   logLevel: 'info'
 * };
 * const storage = new LocalStorageProvider(options);
 */
export interface LocalStorageOptions {
    /**
     * ベースディレクトリパス
     * 
     * すべてのファイル操作の基準となるディレクトリパスです。
     * すべてのファイルパスはこのディレクトリからの相対パスとして解釈されます。
     * 
     * @type {string}
     * @required
     * @example './data', '/app/storage', 'C:\\app\\data'
     */
    baseDir: string;

    /**
     * 初期化時にベースディレクトリを作成するか
     * 
     * trueの場合、初期化時にベースディレクトリが存在しなければ自動的に作成します。
     * falseの場合、ディレクトリが存在しない場合は初期化時にエラーがスローされます。
     * 
     * @type {boolean}
     * @optional
     * @default false
     */
    createBaseDir?: boolean;

    /**
     * バックアップ機能の有効化
     * 
     * trueの場合、ファイルの上書きや削除の前に自動的にバックアップを作成します。
     * バックアップは '_backups' ディレクトリ内にタイムスタンプ付きで保存されます。
     * 
     * @type {boolean}
     * @optional
     * @default false
     */
    backupEnabled?: boolean;

    /**
     * バックアップ保持期間（日数）
     * 
     * バックアップファイルを保持する期間（日数）です。
     * 指定した日数よりも古いバックアップは自動的に削除されます。
     * 0または省略した場合、バックアップは自動削除されません。
     * 
     * @type {number}
     * @optional
     * @default 0
     */
    backupRetentionDays?: number;

    /**
     * ログレベル
     * 
     * ログ出力の詳細レベルを指定します。
     * 'debug', 'info', 'warn', 'error'のいずれかを指定します。
     * 
     * @type {string}
     * @optional
     * @default 'info'
     */
    logLevel?: 'debug' | 'info' | 'warn' | 'error';

    /**
     * オペレーションタイムアウト（ミリ秒）
     * 
     * ファイル操作のタイムアウト時間をミリ秒単位で指定します。
     * この時間を超えるとタイムアウトエラーが発生します。
     * 0または省略した場合、タイムアウトは設定されません。
     * 
     * @type {number}
     * @optional
     * @default 0
     */
    operationTimeout?: number;
}