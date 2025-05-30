// src/lib/storage/enhanced-storage.ts
/**
 * @fileoverview 拡張されたローカルファイルシステムを使用したストレージプロバイダー
 * @description
 * このファイルはローカルファイルシステムを使用したStorageProviderインターフェースの拡張実装を提供します。
 * 基本的なファイル操作に加えて、バックアップ機能、ファイルメタデータの取得、ファイルの移動・コピー、
 * サブディレクトリ一覧取得などの高度な機能を備えています。
 * 
 * @role
 * - ストレージ抽象化レイヤーの一部として、拡張されたローカルファイルシステム操作を提供
 * - StorageProviderインターフェースに準拠し、ストレージ操作の統一されたAPIを提供
 * - 開発環境および本番環境でのデータ永続化を担当
 * 
 * @dependencies
 * - fs/promises - ファイルシステム操作のための非同期APIを提供
 * - path - ファイルパス操作のユーティリティを提供
 * - ./types - StorageProviderインターフェースとLocalStorageOptionsの型定義
 * - ../utils/logger - ログ出力機能
 * - @/lib/utils/error-handler - エラーハンドリング機能
 * 
 * @flow
 * 1. EnhancedLocalStorageProviderのインスタンス化とベースディレクトリの設定
 * 2. ファイルシステムに対する各種操作（読み込み、書き込み、メタデータ取得、バックアップなど）
 * 3. エラーハンドリングとロギング
 * 4. 結果の返却または例外のスロー
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync, statSync, mkdirSync } from 'fs';
import { StorageProvider, LocalStorageOptions, FileMetadata } from './types';
import { logger } from '../utils/logger';
import { logError } from '@/lib/utils/error-handler';

/**
 * @class EnhancedLocalStorageProvider
 * @description 拡張されたローカルファイルシステムを使用したストレージプロバイダー実装クラス
 * 
 * @role
 * - ローカルファイルシステムをバックエンドとしたストレージプロバイダーを提供
 * - StorageProviderインターフェースの実装と拡張
 * - バックアップ、メタデータ、移動・コピーなどの高度な機能を提供
 * - ファイルシステムとの通信処理、エラーハンドリング、ロギングを担当
 * 
 * @used-by
 * - コードからは使用元を特定できません
 * 
 * @depends-on
 * - fs/promises - ファイルシステム操作
 * - path - パス操作
 * - logger (../utils/logger) - ロギング機能
 * - logError (@/lib/utils/error-handler) - エラーハンドリング機能
 * 
 * @lifecycle
 * 1. コンストラクタでの初期化（ベースディレクトリの設定と作成）
 * 2. StorageProviderインターフェースのメソッド呼び出し
 * 3. 内部的にファイルシステム操作とバックアップ処理
 * 4. 結果の返却またはエラーハンドリング
 * 
 * @example-flow
 * 呼び出し元 → EnhancedLocalStorageProvider.writeFile → 
 *   ensureDirectoryExists → 
 *   createBackupIfNeeded → 
 *   fs.writeFile →
 *   内容の書き込みまたはエラーハンドリング
 */
export class EnhancedLocalStorageProvider implements StorageProvider {
    private baseDir: string;
    private options: Required<LocalStorageOptions>;

    /**
     * 拡張されたローカルストレージプロバイダーを初期化
     * 
     * 指定されたベースディレクトリを基準に、ファイルパスを解決します。
     * オプションに応じてベースディレクトリが存在しない場合は自動的に作成します。
     * 初期化後、ログに初期化情報を記録します。
     * 
     * @constructor
     * @param {LocalStorageOptions} options - 設定オプション
     * @param {string} options.baseDir - ベースディレクトリのパス
     * @param {boolean} [options.createBaseDir=false] - 初期化時にベースディレクトリを作成するか
     * @param {boolean} [options.backupEnabled=false] - バックアップ機能を有効にするか
     * @param {number} [options.backupRetentionDays=0] - バックアップ保持期間（日数）
     * @param {string} [options.logLevel='info'] - ログレベル
     * @param {number} [options.operationTimeout=0] - 操作タイムアウト（ミリ秒）
     * 
     * @throws {Error} ベースディレクトリが存在せず、createBaseDirがfalseの場合
     * 
     * @usage
     * // 初期化方法
     * const storage = new EnhancedLocalStorageProvider({
     *   baseDir: './data',
     *   createBaseDir: true,
     *   backupEnabled: true,
     *   logLevel: 'info'
     * });
     * 
     * @call-flow
     * 1. オプションのデフォルト値を設定
     * 2. ベースディレクトリを内部プロパティに設定
     * 3. 必要に応じてベースディレクトリを作成
     * 4. 初期化完了のログ出力
     * 
     * @initialization
     * - ベースディレクトリパスを内部プロパティとして保持
     * - オプションに従ってディレクトリ作成やログレベルの設定
     */
    constructor(options: LocalStorageOptions) {
        // デフォルトオプションと併合
        this.options = {
            baseDir: options.baseDir,
            createBaseDir: options.createBaseDir ?? false,
            backupEnabled: options.backupEnabled ?? false,
            backupRetentionDays: options.backupRetentionDays ?? 0,
            logLevel: options.logLevel ?? 'info',
            operationTimeout: options.operationTimeout ?? 0,
        };

        this.baseDir = this.options.baseDir;

        // ベースディレクトリの確認と作成
        if (!existsSync(this.baseDir)) {
            if (this.options.createBaseDir) {
                try {
                    mkdirSync(this.baseDir, { recursive: true });
                    logger.info(`Base directory created: ${this.baseDir}`);
                } catch (error) {
                    logError(error, { error }, `Error creating base directory: ${this.baseDir}`);
                    throw new Error(`Failed to create base directory: ${this.baseDir}`);
                }
            } else {
                throw new Error(`Base directory does not exist: ${this.baseDir}`);
            }
        } else if (!statSync(this.baseDir).isDirectory()) {
            throw new Error(`Base path exists but is not a directory: ${this.baseDir}`);
        }

        // バックアップディレクトリの準備
        if (this.options.backupEnabled) {
            this.prepareBackupDirectory();
        }

        logger.info('Enhanced local storage provider initialized', {
            baseDir: this.baseDir,
            backupEnabled: this.options.backupEnabled,
            logLevel: this.options.logLevel,
        });
    }

    /**
     * バックアップディレクトリを準備
     * 
     * バックアップ機能が有効な場合に、バックアップディレクトリを作成します。
     * 保持期間が設定されている場合は、古いバックアップを清掃します。
     * 
     * @private
     * @async
     * @returns {Promise<void>} 処理完了後に解決するPromise
     * 
     * @throws {Error} バックアップディレクトリ作成中にエラーが発生した場合
     * 
     * @call-flow
     * 1. バックアップディレクトリパスを生成
     * 2. バックアップディレクトリを作成
     * 3. 必要に応じて古いバックアップを清掃
     * 
     * @called-by
     * - constructor - 初期化時にバックアップディレクトリを準備
     * 
     * @error-handling
     * - ディレクトリ作成中のエラーはlogError関数でログ記録
     * - クリーンアップ中のエラーはログに記録するが、処理は続行
     */
    private async prepareBackupDirectory(): Promise<void> {
        try {
            const backupDir = path.join(this.baseDir, '_backups');
            
            // バックアップディレクトリが存在しない場合は作成
            if (!existsSync(backupDir)) {
                await fs.mkdir(backupDir, { recursive: true });
                logger.info(`Backup directory created: ${backupDir}`);
            }
            
            // 保持期間が設定されている場合は古いバックアップを清掃
            if (this.options.backupRetentionDays > 0) {
                try {
                    await this.cleanupOldBackups();
                } catch (cleanupError) {
                    logger.warn('Failed to cleanup old backups', { error: cleanupError });
                }
            }
        } catch (error) {
            logError(error, { error }, 'Error preparing backup directory');
            throw error;
        }
    }

    /**
     * 古いバックアップを清掃
     * 
     * 設定された保持期間より古いバックアップファイルを削除します。
     * 
     * @private
     * @async
     * @returns {Promise<void>} 処理完了後に解決するPromise
     * 
     * @call-flow
     * 1. バックアップディレクトリ内のすべてのファイルを取得
     * 2. 各ファイルの最終更新日時をチェック
     * 3. 保持期間より古いファイルを削除
     * 
     * @called-by
     * - prepareBackupDirectory - バックアップディレクトリの準備時に呼び出し
     * 
     * @error-handling
     * - 個々のファイル削除エラーはログに記録し、処理は継続
     */
    private async cleanupOldBackups(): Promise<void> {
        const backupDir = path.join(this.baseDir, '_backups');
        const retentionMs = this.options.backupRetentionDays * 24 * 60 * 60 * 1000;
        const cutoffDate = new Date(Date.now() - retentionMs);
        
        try {
            // バックアップディレクトリが存在するか確認
            const dirExists = existsSync(backupDir);
            if (!dirExists) return;
            
            // バックアップディレクトリ内の全ファイルとディレクトリを再帰的に取得
            const cleanupDir = async (dirPath: string) => {
                const entries = await fs.readdir(dirPath, { withFileTypes: true });
                
                for (const entry of entries) {
                    const entryPath = path.join(dirPath, entry.name);
                    
                    if (entry.isDirectory()) {
                        // サブディレクトリを再帰的に処理
                        await cleanupDir(entryPath);
                        
                        // 空のディレクトリを削除
                        const subEntries = await fs.readdir(entryPath);
                        if (subEntries.length === 0) {
                            await fs.rmdir(entryPath);
                        }
                    } else if (entry.isFile() && entry.name.endsWith('.bak')) {
                        // ファイルの更新日時を取得
                        const stats = await fs.stat(entryPath);
                        
                        // 保持期間より古いファイルを削除
                        if (stats.mtime < cutoffDate) {
                            try {
                                await fs.unlink(entryPath);
                                logger.debug(`Removed old backup: ${entryPath}`);
                            } catch (err) {
                                logger.warn(`Failed to remove old backup: ${entryPath}`, { error: err });
                            }
                        }
                    }
                }
            };
            
            await cleanupDir(backupDir);
            logger.info('Backup cleanup completed');
        } catch (error) {
            logger.error('Error during backup cleanup', { error });
            throw error;
        }
    }

    /**
     * ファイルパスを完全なパスに変換
     * 
     * 相対パスをベースディレクトリからの完全なパスに変換します。
     * 
     * @private
     * @param {string} filePath - 相対パス
     * @returns {string} 完全なパス
     * 
     * @usage
     * // 内部的な使用方法
     * const fullPath = this.getFullPath('path/to/file.txt');
     * 
     * @call-flow
     * 1. path.joinを使用してベースディレクトリと相対パスを結合
     * 2. 結合されたパスを返却
     * 
     * @called-by
     * - ほぼすべてのメソッド - ファイルパスの変換のために使用
     */
    private getFullPath(filePath: string): string {
        return path.join(this.baseDir, filePath);
    }

    /**
     * ファイルの親ディレクトリを再帰的に作成
     * 
     * 指定されたファイルパスの親ディレクトリが存在しない場合、
     * 再帰的に作成します。
     * 
     * @private
     * @async
     * @param {string} filePath - ファイルパス
     * @returns {Promise<void>} 処理完了後に解決するPromise
     * 
     * @throws {Error} ディレクトリ作成中にエラーが発生した場合
     * 
     * @usage
     * // 内部的な使用方法
     * await this.ensureDirectoryExists(fullPath);
     * 
     * @call-flow
     * 1. path.dirnameを使用してファイルの親ディレクトリパスを取得
     * 2. fs.mkdirを使用して再帰的にディレクトリを作成
     * 3. エラー発生時はlogErrorでログ記録し、例外をスロー
     * 
     * @called-by
     * - writeFile - ファイル書き込み前にディレクトリを作成
     * - copyFile - コピー先ディレクトリを確保
     * - moveFile - 移動先ディレクトリを確保
     * 
     * @error-handling
     * - 作成中にエラーが発生した場合はlogError関数でログ記録
     * - 発生したエラーをそのままスロー
     */
    private async ensureDirectoryExists(filePath: string): Promise<void> {
        const dirname = path.dirname(filePath);
        try {
            await fs.mkdir(dirname, { recursive: true });
            logger.debug(`Directory created or confirmed: ${dirname}`);
        } catch (error: unknown) {
            logError(error, { error }, `Error creating directory: ${dirname}`);
            throw error;
        }
    }

    /**
     * ファイルのバックアップを作成（必要な場合）
     * 
     * バックアップが有効で、ファイルが存在する場合にバックアップを作成します。
     * バックアップはタイムスタンプ付きのファイル名で_backupsディレクトリに保存されます。
     * 
     * @private
     * @async
     * @param {string} filePath - バックアップするファイルのパス
     * @returns {Promise<void>} 処理完了後に解決するPromise
     * 
     * @call-flow
     * 1. バックアップが有効かどうかを確認
     * 2. ファイルが存在するかどうかを確認
     * 3. ファイルパスからバックアップパスを生成
     * 4. バックアップディレクトリを作成
     * 5. ファイルをバックアップディレクトリにコピー
     * 
     * @called-by
     * - writeFile - ファイル上書き前にバックアップ
     * - deleteFile - ファイル削除前にバックアップ
     * - moveFile - ファイル移動前にバックアップ
     * 
     * @error-handling
     * - バックアップ作成中のエラーはログに記録するが、元の操作は中断しない
     */
    private async createBackupIfNeeded(filePath: string): Promise<void> {
        // バックアップが無効または操作対象がバックアップ自体の場合は何もしない
        if (!this.options.backupEnabled || filePath.includes('_backups/')) {
            return;
        }

        const fullPath = this.getFullPath(filePath);
        
        try {
            // ファイルが存在しない場合は何もしない
            if (!existsSync(fullPath)) {
                return;
            }

            const stats = await fs.stat(fullPath);
            if (!stats.isFile()) {
                return; // ディレクトリの場合はバックアップしない
            }

            // タイムスタンプとバックアップパスを生成
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const relativePath = path.relative(this.baseDir, fullPath);
            const filename = path.basename(relativePath);
            const relativeDir = path.dirname(relativePath);
            
            // バックアップディレクトリパスを作成
            const backupBaseDir = path.join(this.baseDir, '_backups');
            const backupDir = path.join(backupBaseDir, relativeDir);
            await fs.mkdir(backupDir, { recursive: true });
            
            // バックアップファイル名とパスを生成
            const backupFilename = `${filename}.${timestamp}.bak`;
            const backupPath = path.join(backupDir, backupFilename);
            
            // ファイルをコピーしてバックアップを作成
            await fs.copyFile(fullPath, backupPath);
            
            logger.debug(`Backup created: ${backupPath}`);
        } catch (error) {
            logger.warn(`Failed to create backup for ${filePath}`, { error });
            // バックアップのエラーは無視して処理を続行
        }
    }

    /**
     * ファイルを読み込む
     * 
     * 指定されたパスのファイルを読み込み、文字列として返します。
     * ファイルが存在しない場合や読み込み中にエラーが発生した場合は例外をスローします。
     * 
     * @async
     * @param {string} filePath - ファイルパス
     * @returns {Promise<string>} ファイル内容のPromise
     * 
     * @throws {Error} ファイルが見つからない場合（ENOENT）
     * @throws {Error} その他のファイル読み込みエラーの場合
     * 
     * @usage
     * // 使用方法
     * try {
     *   const content = await storage.readFile('path/to/file.txt');
     *   console.log(content);
     * } catch (error) {
     *   console.error('ファイル読み込みエラー:', error.message);
     * }
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * - 推奨呼び出し環境: 特に制限なし
     * - 前提条件: LocalStorageProviderが正しく初期化済みであること
     * 
     * @call-flow
     * 1. getFullPathを使用して完全パスを生成
     * 2. ファイル読み込み開始のデバッグログ出力
     * 3. fs.readFileを使用してファイル内容を取得
     * 4. 内容を返却
     * 
     * @external-dependencies
     * - fs/promises - readFileメソッド
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * 
     * @error-handling
     * - ENOENTエラーの場合は「ファイルが見つからない」エラーを生成
     * - その他のエラーはlogError関数でログ記録し、そのままスロー
     * 
     * @monitoring
     * - ログレベル: DEBUG（開始時）、WARN/ERROR（エラー時）
     */
    async readFile(filePath: string): Promise<string> {
        try {
            const fullPath = this.getFullPath(filePath);
            logger.debug(`Reading file from local storage: ${fullPath}`);

            const content = await fs.readFile(fullPath, 'utf-8');
            return content;
        } catch (error: unknown) {
            const err = error as NodeJS.ErrnoException;
            if (err.code === 'ENOENT') {
                logger.warn(`File not found in local storage: ${filePath}`);
                throw new Error(`File not found: ${filePath}`);
            }
            logError(error, { error }, `Error reading file from local storage: ${filePath}`);
            throw error;
        }
    }

    /**
     * ファイルを書き込む
     * 
     * 指定されたパスにファイルを書き込みます。
     * ファイルの親ディレクトリが存在しない場合は自動的に作成します。
     * バックアップが有効な場合、既存のファイルはバックアップされます。
     * 
     * @async
     * @param {string} filePath - ファイルパス
     * @param {string} content - 書き込む内容
     * @returns {Promise<void>} 処理完了後に解決するPromise
     * 
     * @throws {Error} ディレクトリ作成中にエラーが発生した場合
     * @throws {Error} ファイル書き込み中にエラーが発生した場合
     * 
     * @usage
     * // 使用方法
     * try {
     *   await storage.writeFile('path/to/file.txt', 'ファイル内容');
     *   console.log('ファイルが正常に書き込まれました');
     * } catch (error) {
     *   console.error('ファイル書き込みエラー:', error.message);
     * }
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * - 推奨呼び出し環境: 特に制限なし
     * - 前提条件: LocalStorageProviderが正しく初期化済みであること
     * 
     * @call-flow
     * 1. getFullPathを使用して完全パスを生成
     * 2. ファイル書き込み開始のデバッグログ出力
     * 3. ensureDirectoryExistsを使用して親ディレクトリを作成
     * 4. createBackupIfNeededを使用して既存ファイルをバックアップ
     * 5. fs.writeFileを使用してファイルを書き込み
     * 6. 書き込み成功のログ出力
     * 
     * @external-dependencies
     * - fs/promises - writeFileメソッド、mkdirメソッド
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * - ensureDirectoryExists - 親ディレクトリを作成
     * - createBackupIfNeeded - 既存ファイルをバックアップ
     * 
     * @error-handling
     * - ディレクトリ作成中のエラーはensureDirectoryExists内で処理
     * - ファイル書き込み中のエラーはlogError関数でログ記録し、そのままスロー
     * 
     * @state-changes
     * - ローカルファイルシステムにファイルが作成または更新される
     * - 必要に応じて親ディレクトリも作成される
     * - バックアップが有効な場合は既存ファイルのバックアップも作成される
     * 
     * @monitoring
     * - ログレベル: DEBUG（開始時）、INFO（成功時）、ERROR（エラー時）
     */
    async writeFile(filePath: string, content: string): Promise<void> {
        try {
            const fullPath = this.getFullPath(filePath);
            logger.debug(`Writing file to local storage: ${fullPath}`);

            // ディレクトリが存在することを確認
            await this.ensureDirectoryExists(fullPath);

            // 既存ファイルのバックアップを作成（設定されている場合）
            await this.createBackupIfNeeded(filePath);

            await fs.writeFile(fullPath, content, 'utf-8');

            logger.info(`File successfully written to local storage: ${filePath}`);
        } catch (error: unknown) {
            logError(error, { error }, `Error writing file to local storage: ${filePath}`);
            throw error;
        }
    }

    /**
     * ディレクトリ内のファイル一覧を取得
     * 
     * 指定されたディレクトリ内のファイルパスのリストを返します。
     * ディレクトリが存在しない場合は空の配列を返します。
     * 
     * @async
     * @param {string} directory - ディレクトリパス
     * @returns {Promise<string[]>} ファイルパスのリストのPromise
     * 
     * @throws {Error} ディレクトリ読み込み中にエラーが発生した場合（ENOENTを除く）
     * 
     * @usage
     * // 使用方法
     * try {
     *   const files = await storage.listFiles('docs');
     *   console.log('ファイル一覧:', files);
     * } catch (error) {
     *   console.error('ファイル一覧取得エラー:', error.message);
     * }
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * - 推奨呼び出し環境: 特に制限なし
     * - 前提条件: LocalStorageProviderが正しく初期化済みであること
     * 
     * @call-flow
     * 1. getFullPathを使用して完全パスを生成
     * 2. ディレクトリ一覧取得開始のデバッグログ出力
     * 3. fs.readdirを使用してディレクトリ内容を取得（withFileTypesオプションで）
     * 4. ディレクトリ項目をフィルタリングし、ファイルのみを抽出
     * 5. パスを連結してファイルパスのリストを生成
     * 6. リストを返却
     * 
     * @external-dependencies
     * - fs/promises - readdirメソッド
     * - path - joinメソッド
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * 
     * @error-handling
     * - ENOENTエラーの場合は空の配列を返却
     * - その他のエラーはlogError関数でログ記録し、そのままスロー
     * 
     * @monitoring
     * - ログレベル: DEBUG（開始時）、WARN（ディレクトリが存在しない場合）、ERROR（エラー時）
     */
    async listFiles(directory: string): Promise<string[]> {
        try {
            const fullPath = this.getFullPath(directory);
            logger.debug(`Listing files from local directory: ${fullPath}`);

            const files = await fs.readdir(fullPath, { withFileTypes: true });

            // ディレクトリ内のファイルパスのみを返す（サブディレクトリは除外）
            const filePaths = files
                .filter(file => file.isFile())
                .map(file => path.join(directory, file.name));

            return filePaths;
        } catch (error: unknown) {
            const err = error as NodeJS.ErrnoException;
            if (err.code === 'ENOENT') {
                logger.warn(`Directory not found in local storage: ${directory}`);
                return [];
            }
            logError(error, { error }, `Error listing files from local storage: ${directory}`);
            throw error;
        }
    }

    /**
     * ディレクトリ内のサブディレクトリ一覧を取得
     * 
     * 指定されたディレクトリ内のサブディレクトリパスのリストを返します。
     * ディレクトリが存在しない場合は空の配列を返します。
     * 
     * @async
     * @param {string} directory - ディレクトリパス
     * @returns {Promise<string[]>} サブディレクトリパスのリストのPromise
     * 
     * @throws {Error} ディレクトリ読み込み中にエラーが発生した場合（ENOENTを除く）
     * 
     * @usage
     * // 使用方法
     * try {
     *   const dirs = await storage.listDirectories('content');
     *   console.log('サブディレクトリ一覧:', dirs);
     * } catch (error) {
     *   console.error('ディレクトリ一覧取得エラー:', error.message);
     * }
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * - 推奨呼び出し環境: 特に制限なし
     * - 前提条件: LocalStorageProviderが正しく初期化済みであること
     * 
     * @call-flow
     * 1. getFullPathを使用して完全パスを生成
     * 2. ディレクトリ一覧取得開始のデバッグログ出力
     * 3. fs.readdirを使用してディレクトリ内容を取得（withFileTypesオプションで）
     * 4. ディレクトリ項目をフィルタリングし、ディレクトリのみを抽出
     * 5. パスを連結してディレクトリパスのリストを生成
     * 6. リストを返却
     * 
     * @external-dependencies
     * - fs/promises - readdirメソッド
     * - path - joinメソッド
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * 
     * @error-handling
     * - ENOENTエラーの場合は空の配列を返却
     * - その他のエラーはlogError関数でログ記録し、そのままスロー
     */
    async listDirectories(directory: string): Promise<string[]> {
        try {
            const fullPath = this.getFullPath(directory);
            logger.debug(`Listing directories from local directory: ${fullPath}`);

            const entries = await fs.readdir(fullPath, { withFileTypes: true });

            // ディレクトリパスのみを返す（ファイルは除外）
            const dirPaths = entries
                .filter(entry => entry.isDirectory())
                .map(entry => path.join(directory, entry.name));

            return dirPaths;
        } catch (error: unknown) {
            const err = error as NodeJS.ErrnoException;
            if (err.code === 'ENOENT') {
                logger.warn(`Directory not found in local storage: ${directory}`);
                return [];
            }
            logError(error, { error }, `Error listing directories from local storage: ${directory}`);
            throw error;
        }
    }

    /**
     * ファイルが存在するか確認
     * 
     * 指定されたパスにファイルが存在するかどうかを確認します。
     * ディレクトリの場合はfalseを返します。
     * 
     * @async
     * @param {string} filePath - ファイルパス
     * @returns {Promise<boolean>} ファイルが存在する場合はtrue、それ以外はfalse
     * 
     * @throws {Error} ファイル存在確認中にエラーが発生した場合（ENOENTを除く）
     * 
     * @usage
     * // 使用方法
     * try {
     *   const exists = await storage.fileExists('path/to/file.txt');
     *   console.log('ファイルは存在' + (exists ? 'します' : 'しません'));
     * } catch (error) {
     *   console.error('ファイル存在確認エラー:', error.message);
     * }
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * - 推奨呼び出し環境: 特に制限なし
     * - 前提条件: LocalStorageProviderが正しく初期化済みであること
     * 
     * @call-flow
     * 1. getFullPathを使用して完全パスを生成
     * 2. fs.statを使用してファイル情報を取得
     * 3. stat.isFileメソッドで結果を確認し、ファイルの場合はtrueを返却
     * 
     * @external-dependencies
     * - fs/promises - statメソッド
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * 
     * @error-handling
     * - ENOENTエラーの場合はfalseを返却（ファイルが存在しないことを示す）
     * - その他のエラーはlogError関数でログ記録し、そのままスロー
     */
    async fileExists(filePath: string): Promise<boolean> {
        try {
            const fullPath = this.getFullPath(filePath);

            const stat = await fs.stat(fullPath);
            return stat.isFile();
        } catch (error: unknown) {
            const err = error as NodeJS.ErrnoException;
            if (err.code === 'ENOENT') {
                return false;
            }
            logError(error, { error }, `Error checking if file exists: ${filePath}`);
            throw error;
        }
    }

    /**
     * ディレクトリが存在するか確認
     * 
     * 指定されたパスにディレクトリが存在するかどうかを確認します。
     * ファイルの場合はfalseを返します。
     * 
     * @async
     * @param {string} directoryPath - ディレクトリパス
     * @returns {Promise<boolean>} ディレクトリが存在する場合はtrue、それ以外はfalse
     * 
     * @throws {Error} ディレクトリ存在確認中にエラーが発生した場合（ENOENTを除く）
     * 
     * @usage
     * // 使用方法
     * try {
     *   const exists = await storage.directoryExists('path/to/dir');
     *   console.log('ディレクトリは存在' + (exists ? 'します' : 'しません'));
     * } catch (error) {
     *   console.error('ディレクトリ存在確認エラー:', error.message);
     * }
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * - 推奨呼び出し環境: 特に制限なし
     * - 前提条件: LocalStorageProviderが正しく初期化済みであること
     * 
     * @call-flow
     * 1. getFullPathを使用して完全パスを生成
     * 2. fs.statを使用してファイル情報を取得
     * 3. stat.isDirectoryメソッドで結果を確認し、ディレクトリの場合はtrueを返却
     * 
     * @external-dependencies
     * - fs/promises - statメソッド
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * 
     * @error-handling
     * - ENOENTエラーの場合はfalseを返却（ディレクトリが存在しないことを示す）
     * - その他のエラーはlogError関数でログ記録し、そのままスロー
     */
    async directoryExists(directoryPath: string): Promise<boolean> {
        try {
            const fullPath = this.getFullPath(directoryPath);

            const stat = await fs.stat(fullPath);
            return stat.isDirectory();
        } catch (error: unknown) {
            const err = error as NodeJS.ErrnoException;
            if (err.code === 'ENOENT') {
                return false;
            }
            logError(error, { error }, `Error checking if directory exists: ${directoryPath}`);
            throw error;
        }
    }

    /**
     * ディレクトリを作成
     * 
     * 指定されたパスにディレクトリを作成します。
     * 親ディレクトリが存在しない場合は再帰的に作成します。
     * 
     * @async
     * @param {string} directoryPath - ディレクトリパス
     * @returns {Promise<void>} 処理完了後に解決するPromise
     * 
     * @throws {Error} ディレクトリ作成中にエラーが発生した場合
     * 
     * @usage
     * // 使用方法
     * try {
     *   await storage.createDirectory('path/to/new/dir');
     *   console.log('ディレクトリが正常に作成されました');
     * } catch (error) {
     *   console.error('ディレクトリ作成エラー:', error.message);
     * }
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * - 推奨呼び出し環境: 特に制限なし
     * - 前提条件: LocalStorageProviderが正しく初期化済みであること
     * 
     * @call-flow
     * 1. getFullPathを使用して完全パスを生成
     * 2. ディレクトリ作成開始のデバッグログ出力
     * 3. fs.mkdirを使用して再帰的にディレクトリを作成
     * 4. ディレクトリ作成成功のログ出力
     * 
     * @external-dependencies
     * - fs/promises - mkdirメソッド
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * 
     * @error-handling
     * - 作成中にエラーが発生した場合はlogError関数でログ記録
     * - エラーをそのままスロー
     * 
     * @state-changes
     * - ローカルファイルシステムに新しいディレクトリが作成される
     * - 必要に応じて親ディレクトリも作成される
     * 
     * @monitoring
     * - ログレベル: DEBUG（開始時）、INFO（成功時）、ERROR（エラー時）
     */
    async createDirectory(directoryPath: string): Promise<void> {
        try {
            const fullPath = this.getFullPath(directoryPath);
            logger.debug(`Creating directory in local storage: ${fullPath}`);

            await fs.mkdir(fullPath, { recursive: true });

            logger.info(`Directory successfully created in local storage: ${directoryPath}`);
        } catch (error: unknown) {
            logError(error, { error }, `Error creating directory in local storage: ${directoryPath}`);
            throw error;
        }
    }

    /**
     * ファイルを削除
     * 
     * 指定されたパスのファイルをローカルファイルシステムから削除します。
     * ファイルが存在しない場合は何もせず正常終了します。
     * バックアップが有効な場合、削除前にバックアップが作成されます。
     * 
     * @async
     * @param {string} filePath - 削除するファイルのパス
     * @returns {Promise<void>} 処理完了後に解決するPromise
     * 
     * @throws {Error} ファイル削除中にエラーが発生した場合（ENOENTを除く）
     * 
     * @usage
     * // 使用方法
     * try {
     *   await storage.deleteFile('path/to/file.txt');
     *   console.log('ファイルが正常に削除されました');
     * } catch (error) {
     *   console.error('ファイル削除エラー:', error.message);
     * }
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * - 推奨呼び出し環境: 特に制限なし
     * - 前提条件: LocalStorageProviderが正しく初期化済みであること
     * 
     * @call-flow
     * 1. getFullPathを使用して完全パスを生成
     * 2. ファイル削除開始のデバッグログ出力
     * 3. createBackupIfNeededを使用して既存ファイルをバックアップ
     * 4. fs.unlinkを使用してファイルを削除
     * 5. ファイル削除成功のログ出力
     * 
     * @external-dependencies
     * - fs/promises - unlinkメソッド
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * - createBackupIfNeeded - 既存ファイルをバックアップ
     * 
     * @error-handling
     * - ENOENTエラーの場合は処理を終了（ファイルが存在しないため削除不要）
     * - その他のエラーはlogError関数でログ記録し、そのままスロー
     * 
     * @state-changes
     * - ローカルファイルシステムからファイルが削除される
     * - バックアップが有効な場合はバックアップが作成される
     * 
     * @monitoring
     * - ログレベル: DEBUG（開始時）、INFO（成功時）、WARN（ファイルが存在しない場合）、ERROR（エラー時）
     */
    async deleteFile(filePath: string): Promise<void> {
        try {
            const fullPath = this.getFullPath(filePath);
            logger.debug(`Deleting file from local storage: ${fullPath}`);

            // バックアップを作成（設定されている場合）
            await this.createBackupIfNeeded(filePath);

            await fs.unlink(fullPath);

            logger.info(`File successfully deleted from local storage: ${filePath}`);
        } catch (error: unknown) {
            const err = error as NodeJS.ErrnoException;
            if (err.code === 'ENOENT') {
                logger.warn(`File not found for deletion in local storage: ${filePath}`);
                return;
            }
            logError(error, { error }, `Error deleting file from local storage: ${filePath}`);
            throw error;
        }
    }

    /**
     * ファイルのメタデータを取得
     * 
     * 指定されたパスのファイルのメタデータ情報を取得します。
     * ファイルが存在しない場合はnullを返します。
     * 
     * @async
     * @param {string} filePath - ファイルパス
     * @returns {Promise<FileMetadata | null>} ファイルメタデータまたはnull
     * 
     * @throws {Error} メタデータ取得中にエラーが発生した場合（ENOENTを除く）
     * 
     * @usage
     * // 使用方法
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
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * - 推奨呼び出し環境: 特に制限なし
     * - 前提条件: LocalStorageProviderが正しく初期化済みであること
     * 
     * @call-flow
     * 1. getFullPathを使用して完全パスを生成
     * 2. fs.statを使用してファイル情報を取得
     * 3. FileMetadataオブジェクトを構築して返却
     * 
     * @external-dependencies
     * - fs/promises - statメソッド
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * 
     * @error-handling
     * - ENOENTエラーの場合はnullを返却（ファイルが存在しないことを示す）
     * - その他のエラーはlogError関数でログ記録し、そのままスロー
     */
    async getFileMetadata(filePath: string): Promise<FileMetadata | null> {
        try {
            const fullPath = this.getFullPath(filePath);
            logger.debug(`Getting file metadata from local storage: ${fullPath}`);

            const stats = await fs.stat(fullPath);
            
            return {
                path: filePath,
                size: stats.size,
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime,
                isDirectory: stats.isDirectory()
            };
        } catch (error: unknown) {
            const err = error as NodeJS.ErrnoException;
            if (err.code === 'ENOENT') {
                logger.warn(`File not found for metadata in local storage: ${filePath}`);
                return null;
            }
            logError(error, { error }, `Error getting file metadata from local storage: ${filePath}`);
            throw error;
        }
    }

    /**
     * ファイルを移動またはリネームする
     * 
     * 指定されたパスのファイルを別のパスに移動します。
     * ファイルのリネームにも使用できます。
     * 移動先の親ディレクトリが存在しない場合は自動的に作成します。
     * バックアップが有効な場合、移動先に既存のファイルがあればバックアップを作成します。
     * 
     * @async
     * @param {string} sourcePath - 元のファイルパス
     * @param {string} targetPath - 移動先のパス
     * @returns {Promise<void>} 処理完了後に解決するPromise
     * 
     * @throws {Error} ソースファイルが存在しない場合
     * @throws {Error} ファイル移動中にエラーが発生した場合
     * 
     * @usage
     * // 使用方法
     * try {
     *   await storage.moveFile('path/to/old.txt', 'path/to/new.txt');
     *   console.log('ファイルが正常に移動されました');
     * } catch (error) {
     *   console.error('ファイル移動エラー:', error.message);
     * }
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * - 推奨呼び出し環境: 特に制限なし
     * - 前提条件: LocalStorageProviderが正しく初期化済みであること
     * 
     * @call-flow
     * 1. getFullPathを使用して完全パスを生成
     * 2. ファイル移動開始のデバッグログ出力
     * 3. ソースファイルの存在確認
     * 4. ensureDirectoryExistsを使用して移動先の親ディレクトリを作成
     * 5. createBackupIfNeededを使用して移動先の既存ファイルをバックアップ
     * 6. fs.renameを使用してファイルを移動
     * 7. ファイル移動成功のログ出力
     * 
     * @external-dependencies
     * - fs/promises - renameメソッド、statメソッド
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * - ensureDirectoryExists - 親ディレクトリを作成
     * - createBackupIfNeeded - 既存ファイルをバックアップ
     * 
     * @error-handling
     * - ソースファイルが存在しない場合はエラーをスロー
     * - その他のエラーはlogError関数でログ記録し、そのままスロー
     * 
     * @state-changes
     * - ローカルファイルシステム上でファイルが移動または名前変更される
     * - 必要に応じて移動先の親ディレクトリが作成される
     * - バックアップが有効な場合は移動先の既存ファイルのバックアップが作成される
     */
    async moveFile(sourcePath: string, targetPath: string): Promise<void> {
        try {
            const sourceFullPath = this.getFullPath(sourcePath);
            const targetFullPath = this.getFullPath(targetPath);
            
            logger.debug(`Moving file from ${sourcePath} to ${targetPath}`);
            
            // ソースファイルの存在確認
            if (!await this.fileExists(sourcePath)) {
                throw new Error(`Source file does not exist: ${sourcePath}`);
            }
            
            // 移動先のディレクトリを作成
            await this.ensureDirectoryExists(targetFullPath);
            
            // 移動先にファイルが存在する場合はバックアップを作成
            await this.createBackupIfNeeded(targetPath);
            
            // ファイルを移動
            await fs.rename(sourceFullPath, targetFullPath);
            
            logger.info(`File successfully moved from ${sourcePath} to ${targetPath}`);
        } catch (error: unknown) {
            logError(error, { error }, `Error moving file from ${sourcePath} to ${targetPath}`);
            throw error;
        }
    }

    /**
     * ファイルをコピーする
     * 
     * 指定されたパスのファイルを別のパスにコピーします。
     * コピー先の親ディレクトリが存在しない場合は自動的に作成します。
     * バックアップが有効な場合、コピー先に既存のファイルがあればバックアップを作成します。
     * 
     * @async
     * @param {string} sourcePath - 元のファイルパス
     * @param {string} targetPath - コピー先のパス
     * @returns {Promise<void>} 処理完了後に解決するPromise
     * 
     * @throws {Error} ソースファイルが存在しない場合
     * @throws {Error} ファイルコピー中にエラーが発生した場合
     * 
     * @usage
     * // 使用方法
     * try {
     *   await storage.copyFile('path/to/original.txt', 'path/to/copy.txt');
     *   console.log('ファイルが正常にコピーされました');
     * } catch (error) {
     *   console.error('ファイルコピーエラー:', error.message);
     * }
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * - 推奨呼び出し環境: 特に制限なし
     * - 前提条件: LocalStorageProviderが正しく初期化済みであること
     * 
     * @call-flow
     * 1. getFullPathを使用して完全パスを生成
     * 2. ファイルコピー開始のデバッグログ出力
     * 3. ソースファイルの存在確認
     * 4. ensureDirectoryExistsを使用してコピー先の親ディレクトリを作成
     * 5. createBackupIfNeededを使用してコピー先の既存ファイルをバックアップ
     * 6. fs.copyFileを使用してファイルをコピー
     * 7. ファイルコピー成功のログ出力
     * 
     * @external-dependencies
     * - fs/promises - copyFileメソッド、statメソッド
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * - ensureDirectoryExists - 親ディレクトリを作成
     * - createBackupIfNeeded - 既存ファイルをバックアップ
     * 
     * @error-handling
     * - ソースファイルが存在しない場合はエラーをスロー
     * - その他のエラーはlogError関数でログ記録し、そのままスロー
     * 
     * @state-changes
     * - ローカルファイルシステム上に新しいファイルのコピーが作成される
     * - 必要に応じてコピー先の親ディレクトリが作成される
     * - バックアップが有効な場合はコピー先の既存ファイルのバックアップが作成される
     */
    async copyFile(sourcePath: string, targetPath: string): Promise<void> {
        try {
            const sourceFullPath = this.getFullPath(sourcePath);
            const targetFullPath = this.getFullPath(targetPath);
            
            logger.debug(`Copying file from ${sourcePath} to ${targetPath}`);
            
            // ソースファイルの存在確認
            if (!await this.fileExists(sourcePath)) {
                throw new Error(`Source file does not exist: ${sourcePath}`);
            }
            
            // コピー先のディレクトリを作成
            await this.ensureDirectoryExists(targetFullPath);
            
            // コピー先にファイルが存在する場合はバックアップを作成
            await this.createBackupIfNeeded(targetPath);
            
            // ファイルをコピー
            await fs.copyFile(sourceFullPath, targetFullPath);
            
            logger.info(`File successfully copied from ${sourcePath} to ${targetPath}`);
        } catch (error: unknown) {
            logError(error, { error }, `Error copying file from ${sourcePath} to ${targetPath}`);
            throw error;
        }
    }
}