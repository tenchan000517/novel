// src/lib/storage/local-storage.ts
/**
 * @fileoverview ローカルファイルシステムを使用したストレージプロバイダー
 * @description
 * このファイルはローカルファイルシステムを使用したStorageProviderインターフェースの実装を提供します。
 * 主に開発環境での使用を想定しており、ファイルの読み書きや一覧取得、存在確認、ディレクトリ作成、
 * ファイル削除などの基本的なストレージ操作をローカルファイルシステムに対して行うことができます。
 * 
 * @role
 * - ストレージ抽象化レイヤーの一部として、ローカルファイルシステムをストレージとして使用するための実装を提供
 * - StorageProviderインターフェースに準拠し、ストレージ操作の統一されたAPIを提供
 * - 主に開発環境でのデータ永続化を担当
 * 
 * @dependencies
 * - fs/promises - ファイルシステム操作のための非同期APIを提供
 * - path - ファイルパス操作のユーティリティを提供
 * - ./types - StorageProviderインターフェースとLocalStorageOptionsの型定義
 * - ../utils/logger - ログ出力機能
 * - @/lib/utils/error-handler - エラーハンドリング機能
 * 
 * @flow
 * 1. LocalStorageProviderのインスタンス化とベースディレクトリの設定
 * 2. ファイルシステムに対する各種操作（読み込み、書き込み、一覧取得など）
 * 3. エラーハンドリングとロギング
 * 4. 結果の返却または例外のスロー
 */

import fs from 'fs/promises';
import path from 'path';
import { StorageProvider, LocalStorageOptions } from './types';
import { logger } from '../utils/logger';
import { logError } from '@/lib/utils/error-handler';


/**
 * @class LocalStorageProvider
 * @description ローカルファイルシステムを使用したストレージプロバイダー実装クラス
 * 
 * @role
 * - ローカルファイルシステムをバックエンドとしたストレージプロバイダーを提供
 * - StorageProviderインターフェースの実装
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
 * 1. コンストラクタでの初期化（ベースディレクトリの設定）
 * 2. StorageProviderインターフェースのメソッド呼び出し
 * 3. 内部的にファイルシステム操作
 * 4. 結果の返却またはエラーハンドリング
 * 
 * @example-flow
 * 呼び出し元 → LocalStorageProvider.readFile → 
 *   getFullPath → 
 *   fs.readFile →
 *   内容の返却またはエラーハンドリング
 */
export class LocalStorageProvider implements StorageProvider {
    private baseDir: string;

    /**
     * ローカルストレージプロバイダーを初期化
     * 
     * 指定されたベースディレクトリを基準に、ファイルパスを解決します。
     * 初期化後、ログに初期化情報を記録します。
     * 
     * @constructor
     * @param {LocalStorageOptions} options - 設定オプション
     * @param {string} options.baseDir - ベースディレクトリのパス
     * 
     * @usage
     * // 初期化方法
     * const localStorage = new LocalStorageProvider({
     *   baseDir: './data'
     * });
     * 
     * @call-flow
     * 1. options.baseDirを内部プロパティに設定
     * 2. 初期化完了のログ出力
     * 
     * @initialization
     * - ベースディレクトリパスを内部プロパティとして保持
     * - 実際のディレクトリ作成は行わない（必要時に作成）
     */
    constructor(options: LocalStorageOptions) {
        this.baseDir = options.baseDir;

        logger.info('Local storage provider initialized', {
            baseDir: this.baseDir,
        });
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
     * - readFile - 読み込むファイルの完全パスを取得
     * - writeFile - 書き込むファイルの完全パスを取得
     * - listFiles - 一覧を取得するディレクトリの完全パスを取得
     * - fileExists - 存在確認するファイルの完全パスを取得
     * - directoryExists - 存在確認するディレクトリの完全パスを取得
     * - createDirectory - 作成するディレクトリの完全パスを取得
     * - deleteFile - 削除するファイルの完全パスを取得
     */
    private getFullPath(filePath: string): string {
        // パス区切り文字を統一 (OSに関係なくスラッシュに統一)
        const normalizedPath = filePath.replace(/\\/g, '/');
        
        // パスが既にベースディレクトリで始まっているかチェック
        if (normalizedPath.startsWith(this.baseDir.replace(/\\/g, '/'))) {
            return normalizedPath;
        }
        
        // path.joinを使用してパスを正しく結合
        return path.join(this.baseDir, normalizedPath);
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
     * 
     * @error-handling
     * - 作成中にエラーが発生した場合はlogError関数でログ記録
     * - 発生したエラーをそのままスロー
     */
    private async ensureDirectoryExists(filePath: string): Promise<void> {
        const dirname = path.dirname(filePath);
        try {
            await fs.mkdir(dirname, { recursive: true });
        } catch (error: unknown) {
            logError(error, { error }, "Error creating directory: ${dirname}");
            throw error;
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
     *   const content = await localStorage.readFile('path/to/file.txt');
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
            logError(error, { error }, "Error reading file from local storage: ${filePath}");
            throw error;
        }
    }

    /**
     * ファイルを書き込む
     * 
     * 指定されたパスにファイルを書き込みます。
     * ファイルの親ディレクトリが存在しない場合は自動的に作成します。
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
     *   await localStorage.writeFile('path/to/file.txt', 'ファイル内容');
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
     * 4. fs.writeFileを使用してファイルを書き込み
     * 5. 書き込み成功のログ出力
     * 
     * @external-dependencies
     * - fs/promises - writeFileメソッド、mkdirメソッド
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * - ensureDirectoryExists - 親ディレクトリを作成
     * 
     * @error-handling
     * - ディレクトリ作成中のエラーはensureDirectoryExists内で処理
     * - ファイル書き込み中のエラーはlogError関数でログ記録し、そのままスロー
     * 
     * @state-changes
     * - ローカルファイルシステムにファイルが作成または更新される
     * - 必要に応じて親ディレクトリも作成される
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

            await fs.writeFile(fullPath, content, 'utf-8');

            logger.info(`File successfully written to local storage: ${filePath}`);
        } catch (error: unknown) {
            logError(error, { error }, "Error writing file to local storage: ${filePath}");
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
     *   const files = await localStorage.listFiles('docs');
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
            logError(error, { error }, "Error listing files from local storage: ${directory}");
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
     *   const exists = await localStorage.fileExists('path/to/file.txt');
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
            logError(error, { error }, "Error checking if file exists: ${filePath}");
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
     *   const exists = await localStorage.directoryExists('path/to/dir');
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
            logError(error, { error }, "Error checking if directory exists: ${directoryPath}");
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
     *   await localStorage.createDirectory('path/to/new/dir');
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
            logError(error, { error }, "Error creating directory in local storage: ${directoryPath}");
            throw error;
        }
    }

    /**
     * ファイルを削除
     * 
     * 指定されたパスのファイルをローカルファイルシステムから削除します。
     * ファイルが存在しない場合は何もせず正常終了します。
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
     *   await localStorage.deleteFile('path/to/file.txt');
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
     * 3. fs.unlinkを使用してファイルを削除
     * 4. ファイル削除成功のログ出力
     * 
     * @external-dependencies
     * - fs/promises - unlinkメソッド
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * 
     * @error-handling
     * - ENOENTエラーの場合は処理を終了（ファイルが存在しないため削除不要）
     * - その他のエラーはlogError関数でログ記録し、そのままスロー
     * 
     * @state-changes
     * - ローカルファイルシステムからファイルが削除される
     * 
     * @monitoring
     * - ログレベル: DEBUG（開始時）、INFO（成功時）、WARN（ファイルが存在しない場合）、ERROR（エラー時）
     */
    async deleteFile(filePath: string): Promise<void> {
        try {
            const fullPath = this.getFullPath(filePath);
            logger.debug(`Deleting file from local storage: ${fullPath}`);

            await fs.unlink(fullPath);

            logger.info(`File successfully deleted from local storage: ${filePath}`);
        } catch (error: unknown) {
            const err = error as NodeJS.ErrnoException;
            if (err.code === 'ENOENT') {
                logger.warn(`File not found for deletion in local storage: ${filePath}`);
                return;
            }
            logError(error, { error }, "Error deleting file from local storage: ${filePath}");
            throw error;
        }
    }
}

/**
 * ローカルファイルシステムを使用したストレージプロバイダー実装クラス
 * 
 * StorageProviderインターフェースを実装し、ローカルファイルシステムをストレージとして使用するための機能を提供します。
 * ファイルの読み書き、ディレクトリ操作、存在確認などの基本的なストレージ操作をローカルファイルシステムに対して行います。
 * 
 * @type {Class<LocalStorageProvider>}
 * 
 * @initialization
 * LocalStorageOptionsオブジェクトを引数としてインスタンス化します。
 * 必須パラメータとしてbaseDir（ベースディレクトリ）が必要です。
 * 
 * @usage
 * // LocalStorageProviderのインスタンス化と使用
 * import { LocalStorageProvider } from './local-storage';
 * 
 * const storage = new LocalStorageProvider({
 *   baseDir: './data'
 * });
 * 
 * // ファイル読み込み
 * const content = await storage.readFile('documents/report.md');
 * 
 * // ファイル書き込み
 * await storage.writeFile('documents/new-report.md', '# New Report\n\nContent here...');
 */