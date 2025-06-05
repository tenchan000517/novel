// src/lib/storage/github-storage.ts
/**
 * @fileoverview GitHub APIを使用したストレージプロバイダー実装
 * @description
 * このファイルはGitHubリポジトリをバックエンドとしたストレージプロバイダーを実装しています。
 * OctokitライブラリをラップしてStorageProviderインターフェースに準拠した形でファイル操作を提供し、
 * ファイルの読み書き、リスト取得、存在確認、ディレクトリ作成、ファイル削除などの基本的なストレージ操作を
 * GitHubリポジトリに対して行うことができます。
 * 
 * @role
 * - ストレージ抽象化レイヤーの一部として、GitHubリポジトリをストレージとして使用するための実装を提供
 * - StorageProviderインターフェースに準拠し、ストレージ操作の統一されたAPIを提供
 * - GitHub APIとの通信を抽象化し、エラーハンドリングとロギングを提供
 * 
 * @dependencies
 * - @octokit/rest - GitHub APIとの通信を行うライブラリ
 * - ./types - StorageProviderインターフェースとGitHubStorageOptionsの型定義
 * - ../utils/logger - ログ出力機能
 * - @/lib/utils/error-handler - エラーハンドリング機能
 * 
 * @types
 * - StorageProvider (./types) - 実装するインターフェース
 * - GitHubStorageOptions (./types) - 設定オプションの型
 * 
 * @api-endpoints
 * このファイルからGitHub APIの以下のエンドポイントが利用されます:
 * - GET /repos/{owner}/{repo}/contents/{path} - ファイル内容の取得、ディレクトリ一覧の取得、ファイル存在確認
 * - PUT /repos/{owner}/{repo}/contents/{path} - ファイル作成・更新
 * - DELETE /repos/{owner}/{repo}/contents/{path} - ファイル削除
 * 
 * @flow
 * 1. GitHubStorageProviderのインスタンス化とオプション検証
 * 2. GitHub APIとの通信（Octokitを使用）
 * 3. エラーハンドリングとロギング
 * 4. 結果の返却または例外のスロー
 * 
 */

import { Octokit } from '@octokit/rest';
import { StorageProvider, GitHubStorageOptions } from './types';
import { logger } from '../utils/logger';
import { logError } from '@/lib/utils/error-handler';


/**
 * @class GitHubStorageProvider
 * @description GitHub APIを使用したストレージプロバイダー実装クラス
 * 
 * @role
 * - GitHubリポジトリをバックエンドとしたストレージプロバイダーを提供
 * - StorageProviderインターフェースの実装
 * - GitHub APIとの通信処理、エラーハンドリング、ロギングを担当
 * 
 * @used-by
 * - コードからは使用元を特定できません
 * 
 * @depends-on
 * - Octokit (@octokit/rest) - GitHub APIクライアント
 * - logger (../utils/logger) - ロギング機能
 * - logError (@/lib/utils/error-handler) - エラーハンドリング機能
 * 
 * @lifecycle
 * 1. コンストラクタでの初期化（トークン、リポジトリ、ブランチなどの設定）
 * 2. StorageProviderインターフェースのメソッド呼び出し
 * 3. 内部的にGitHub APIとの通信処理
 * 4. 結果の返却またはエラーハンドリング
 * 
 * @example-flow
 * 呼び出し元 → GitHubStorageProvider.readFile → 
 *   getFullPath → 
 *   octokit.repos.getContent →
 *   Base64デコード →
 *   内容の返却またはエラーハンドリング
 */
export class GitHubStorageProvider implements StorageProvider {
    private octokit: Octokit;
    private owner: string;
    private repo: string;
    private branch: string;
    private baseDir: string;

    /**
     * GitHubストレージプロバイダーを初期化します
     * 
     * 必要なパラメータの検証を行い、Octokitクライアントを初期化します。
     * リポジトリ名は「username/repo」形式である必要があります。
     * 
     * @constructor
     * @param {GitHubStorageOptions} options - 設定オプション
     * @param {string} options.token - GitHub APIトークン
     * @param {string} options.repo - リポジトリ名（username/repo形式）
     * @param {string} [options.branch='main'] - ブランチ名（デフォルトは'main'）
     * @param {string} [options.baseDir=''] - ベースディレクトリパス（デフォルトは空文字）
     * 
     * @throws {Error} GitHub tokenが指定されていない場合
     * @throws {Error} リポジトリ名が無効な形式の場合
     * 
     * @usage
     * // 初期化方法
     * const githubStorage = new GitHubStorageProvider({
     *   token: 'github_personal_access_token',
     *   repo: 'username/repository',
     *   branch: 'main',
     *   baseDir: 'storage'
     * });
     * 
     * @call-flow
     * 1. 引数の検証（トークンとリポジトリ名の形式）
     * 2. Octokitクライアントの初期化
     * 3. リポジトリ名の分解（owner/repo）
     * 4. 内部プロパティの設定
     * 5. 初期化完了のログ出力
     * 
     * @initialization
     * - Octokitクライアントを初期化し、認証情報を設定
     * - リポジトリ名をowner/repo形式に分解
     * - ブランチ名とベースディレクトリを設定（デフォルト値の適用）
     * 
     * @error-handling
     * - トークンが指定されていない場合、エラーをスロー
     * - リポジトリ名が無効な形式の場合、エラーをスロー
     */
    constructor(options: GitHubStorageOptions) {
        if (!options.token) {
            throw new Error('GitHub token is required');
        }

        if (!options.repo || !options.repo.includes('/')) {
            throw new Error('Invalid repository format. Expected: username/repo');
        }

        this.octokit = new Octokit({ auth: options.token });
        [this.owner, this.repo] = options.repo.split('/');
        this.branch = options.branch || 'main';
        this.baseDir = options.baseDir || '';

        logger.info('GitHub storage provider initialized', {
            repo: options.repo,
            branch: this.branch,
            baseDir: this.baseDir,
        });
    }

    /**
     * ファイルパスを完全なパスに変換します
     * 
     * ベースディレクトリが設定されている場合、相対パスとベースディレクトリを結合して
     * GitHubリポジトリ内の完全なパスを生成します。
     * 
     * @private
     * @param {string} path - 相対パス
     * @returns {string} リポジトリ内の完全なパス
     * 
     * @usage
     * // 内部的な使用方法
     * const fullPath = this.getFullPath('path/to/file.txt');
     * 
     * @call-flow
     * 1. ベースディレクトリの有無を確認
     * 2. ベースディレクトリがある場合は結合、ない場合はそのまま返却
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
    private getFullPath(path: string): string {
        return this.baseDir ? `${this.baseDir}/${path}` : path;
    }

    /**
     * GitHubリポジトリからファイルを読み込みます
     * 
     * 指定されたパスのファイルをGitHub APIを通じて取得し、
     * Base64デコードしてUTF-8文字列として返します。
     * 
     * @async
     * @param {string} path - ファイルパス
     * @returns {Promise<string>} ファイル内容のPromise
     * 
     * @throws {Error} ファイルが見つからない場合（404エラー）
     * @throws {Error} パスがディレクトリの場合
     * @throws {Error} コンテンツを取得できない場合
     * @throws {Error} GitHub API通信エラーの場合
     * 
     * @usage
     * // 使用方法
     * try {
     *   const content = await githubStorage.readFile('path/to/file.txt');
     *   console.log(content);
     * } catch (error) {
     *   console.error('ファイル読み込みエラー:', error.message);
     * }
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * - 推奨呼び出し環境: サーバーサイド
     * - 前提条件: GitHubStorageProviderが正しく初期化済みであること
     * 
     * @call-flow
     * 1. getFullPathを使用して完全パスを生成
     * 2. ファイル読み込み開始のデバッグログ出力
     * 3. GitHub APIを使用してファイル内容を取得
     * 4. 応答データの検証（ディレクトリではなくファイルであること）
     * 5. 応答データのcontentプロパティの存在確認
     * 6. Base64からUTF-8へのデコード
     * 7. デコードされた内容の返却
     * 
     * @external-dependencies
     * - GitHub API - /repos/{owner}/{repo}/contents/{path} エンドポイント
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * 
     * @error-handling
     * - 404エラーの場合は「ファイルが見つからない」エラーを生成
     * - 応答がディレクトリの場合は適切なエラーを生成
     * - contentプロパティがない場合はエラーを生成
     * - その他のエラーはlogError関数でログ記録し、そのままスロー
     * 
     * @performance-considerations
     * - GitHub APIの呼び出し回数に制限がある可能性あり
     * - 大きなファイルの場合はメモリ使用量に注意
     * 
     * @monitoring
     * - ログレベル: DEBUG（開始時）、WARN/ERROR（エラー時）
     */
    async readFile(path: string): Promise<string> {
        try {
            const fullPath = this.getFullPath(path);
            logger.debug(`Reading file from GitHub: ${fullPath}`);

            const response = await this.octokit.repos.getContent({
                owner: this.owner,
                repo: this.repo,
                path: fullPath,
                ref: this.branch,
            });

            if (Array.isArray(response.data)) {
                throw new Error(`Path is a directory, not a file: ${path}`);
            }

            if (!('content' in response.data)) {
                throw new Error(`Could not get content for: ${path}`);
            }

            // GitHubはBase64でエンコードされたコンテンツを返す
            const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
            return content;
        } catch (error: unknown) {
            if ((error as any).status === 404) {
                logger.warn(`File not found in GitHub: ${path}`);
                throw new Error(`File not found: ${path}`);
            }

            logError(error, { error }, "Error reading file from GitHub: ${path}");
            throw error;
        }
    }

    /**
     * GitHubリポジトリにファイルを書き込みます
     * 
     * 指定されたパスにファイルを作成または更新します。
     * 既存ファイルの場合はSHAを取得して更新、存在しない場合は新規作成します。
     * 
     * @async
     * @param {string} path - ファイルパス
     * @param {string} content - 書き込む内容
     * @returns {Promise<void>} 処理完了後に解決するPromise
     * 
     * @throws {Error} GitHub API通信エラーの場合
     * 
     * @usage
     * // 使用方法
     * try {
     *   await githubStorage.writeFile('path/to/file.txt', 'ファイル内容');
     *   console.log('ファイルが正常に書き込まれました');
     * } catch (error) {
     *   console.error('ファイル書き込みエラー:', error.message);
     * }
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * - 推奨呼び出し環境: サーバーサイド
     * - 前提条件: GitHubStorageProviderが正しく初期化済みであること
     * 
     * @call-flow
     * 1. getFullPathを使用して完全パスを生成
     * 2. ファイル書き込み開始のデバッグログ出力
     * 3. 既存ファイルのSHA取得を試行
     * 4. ファイルを作成または更新（SHAがある場合は更新、ない場合は作成）
     * 5. ファイル書き込み成功のログ出力
     * 
     * @external-dependencies
     * - GitHub API - /repos/{owner}/{repo}/contents/{path} エンドポイント（GET, PUT）
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * 
     * @error-handling
     * - 既存ファイルのSHA取得時の404エラーは正常として処理（新規作成として扱う）
     * - その他のエラーはlogError関数でログ記録し、そのままスロー
     * 
     * @state-changes
     * - GitHubリポジトリ内のファイルが作成または更新される
     * - コミットメッセージ: "Update {path}"
     * 
     * @performance-considerations
     * - GitHub APIの呼び出し回数に制限がある可能性あり（SHAの取得と書き込みで最大2回のAPI呼び出し）
     * - 大きなファイルの場合はBase64エンコードによるオーバーヘッドに注意
     * 
     * @monitoring
     * - ログレベル: DEBUG（開始時）、INFO（成功時）、ERROR（エラー時）
     */
    async writeFile(path: string, content: string): Promise<void> {
        try {
            const fullPath = this.getFullPath(path);
            logger.debug(`Writing file to GitHub: ${fullPath}`);

            // 既存のファイルのSHA取得を試みる
            let sha: string | undefined;
            try {
                const existingFile = await this.octokit.repos.getContent({
                    owner: this.owner,
                    repo: this.repo,
                    path: fullPath,
                    ref: this.branch,
                });

                if (!Array.isArray(existingFile.data) && 'sha' in existingFile.data) {
                    sha = existingFile.data.sha;
                }
            } catch (error: unknown) {
                // ファイルが存在しない場合はSHAは不要
                if ((error as any).status === 404) {
                    throw error;
                }
            }

            // ファイルを作成または更新
            await this.octokit.repos.createOrUpdateFileContents({
                owner: this.owner,
                repo: this.repo,
                path: fullPath,
                message: `Update ${path}`,
                content: Buffer.from(content).toString('base64'),
                branch: this.branch,
                sha,
            });

            logger.info(`File successfully written to GitHub: ${path}`);
        } catch (error: unknown) {
            logError(error, { error }, "Error writing file to GitHub: ${path}");
            throw error;
        }
    }

    /**
     * GitHubリポジトリの指定ディレクトリ内のファイル一覧を取得します
     * 
     * 指定されたディレクトリ内のファイルパスのリストを返します。
     * ディレクトリは含まれません。
     * 
     * @async
     * @param {string} directory - ディレクトリパス
     * @returns {Promise<string[]>} ファイルパスのリストのPromise
     * 
     * @throws {Error} パスがディレクトリではない場合
     * @throws {Error} GitHub API通信エラーの場合
     * 
     * @usage
     * // 使用方法
     * try {
     *   const files = await githubStorage.listFiles('docs');
     *   console.log('ファイル一覧:', files);
     * } catch (error) {
     *   console.error('ファイル一覧取得エラー:', error.message);
     * }
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * - 推奨呼び出し環境: サーバーサイド
     * - 前提条件: GitHubStorageProviderが正しく初期化済みであること
     * 
     * @call-flow
     * 1. getFullPathを使用して完全パスを生成
     * 2. ディレクトリ一覧取得開始のデバッグログ出力
     * 3. GitHub APIを使用してディレクトリ内容を取得
     * 4. 応答データがディレクトリ（配列）であることを確認
     * 5. ファイルのみをフィルタリング
     * 6. ベースディレクトリを除去したパスのリストを返却
     * 
     * @external-dependencies
     * - GitHub API - /repos/{owner}/{repo}/contents/{path} エンドポイント
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * 
     * @error-handling
     * - 404エラーの場合は空の配列を返却
     * - パスがディレクトリでない場合はエラーをスロー
     * - その他のエラーはlogError関数でログ記録し、そのままスロー
     * 
     * @performance-considerations
     * - ディレクトリ内のファイル数が多い場合はレスポンスサイズに注意
     * - GitHub APIのレート制限に注意
     * 
     * @monitoring
     * - ログレベル: DEBUG（開始時）、WARN（ディレクトリが存在しない場合）、ERROR（エラー時）
     */
    async listFiles(directory: string): Promise<string[]> {
        try {
            const fullPath = this.getFullPath(directory);
            logger.debug(`Listing files from GitHub directory: ${fullPath}`);

            const response = await this.octokit.repos.getContent({
                owner: this.owner,
                repo: this.repo,
                path: fullPath,
                ref: this.branch,
            });

            if (!Array.isArray(response.data)) {
                throw new Error(`Path is not a directory: ${directory}`);
            }

            // ディレクトリ内のファイルパスのみを返す
            const files = response.data
                .filter(item => item.type === 'file')
                .map(item => item.path.replace(`${this.baseDir}/`, ''));

            return files;
        } catch (error: unknown) {
            if ((error as any).status === 404) {
                logger.warn(`Directory not found in GitHub: ${directory}`);
                return [];
            }

            logError(error, { error }, "Error listing files from GitHub: ${directory}");
            throw error;
        }
    }

    /**
     * ファイルが存在するか確認します
     * 
     * 指定されたパスにファイルが存在するかどうかを確認します。
     * ディレクトリの場合はfalseを返します。
     * 
     * @async
     * @param {string} path - ファイルパス
     * @returns {Promise<boolean>} ファイルが存在する場合はtrue、それ以外はfalse
     * 
     * @throws {Error} GitHub API通信エラーの場合（404エラーを除く）
     * 
     * @usage
     * // 使用方法
     * try {
     *   const exists = await githubStorage.fileExists('path/to/file.txt');
     *   console.log('ファイルは存在' + (exists ? 'します' : 'しません'));
     * } catch (error) {
     *   console.error('ファイル存在確認エラー:', error.message);
     * }
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * - 推奨呼び出し環境: サーバーサイド
     * - 前提条件: GitHubStorageProviderが正しく初期化済みであること
     * 
     * @call-flow
     * 1. getFullPathを使用して完全パスを生成
     * 2. GitHub APIを使用してファイル情報を取得
     * 3. 応答データがディレクトリ（配列）でない場合はtrue、それ以外はfalseを返却
     * 
     * @external-dependencies
     * - GitHub API - /repos/{owner}/{repo}/contents/{path} エンドポイント
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * 
     * @error-handling
     * - 404エラーの場合はfalseを返却（ファイルが存在しないことを示す）
     * - その他のエラーはlogError関数でログ記録し、そのままスロー
     * 
     * @performance-considerations
     * - 単一のAPI呼び出しで完了するため比較的軽量
     * - GitHub APIのレート制限に注意
     */
    async fileExists(path: string): Promise<boolean> {
        try {
            const fullPath = this.getFullPath(path);

            const response = await this.octokit.repos.getContent({
                owner: this.owner,
                repo: this.repo,
                path: fullPath,
                ref: this.branch,
            });

            return !Array.isArray(response.data);
        } catch (error: unknown) {
            if ((error as any).status === 404) {
                return false;
            }

            logError(error, { error }, "Error checking if file exists: ${path}");
            throw error;
        }
    }

    /**
     * ディレクトリが存在するか確認します
     * 
     * 指定されたパスにディレクトリが存在するかどうかを確認します。
     * ファイルの場合はfalseを返します。
     * 
     * @async
     * @param {string} path - ディレクトリパス
     * @returns {Promise<boolean>} ディレクトリが存在する場合はtrue、それ以外はfalse
     * 
     * @throws {Error} GitHub API通信エラーの場合（404エラーを除く）
     * 
     * @usage
     * // 使用方法
     * try {
     *   const exists = await githubStorage.directoryExists('path/to/dir');
     *   console.log('ディレクトリは存在' + (exists ? 'します' : 'しません'));
     * } catch (error) {
     *   console.error('ディレクトリ存在確認エラー:', error.message);
     * }
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * - 推奨呼び出し環境: サーバーサイド
     * - 前提条件: GitHubStorageProviderが正しく初期化済みであること
     * 
     * @call-flow
     * 1. getFullPathを使用して完全パスを生成
     * 2. GitHub APIを使用してパス情報を取得
     * 3. 応答データがディレクトリ（配列）の場合はtrue、それ以外はfalseを返却
     * 
     * @external-dependencies
     * - GitHub API - /repos/{owner}/{repo}/contents/{path} エンドポイント
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * 
     * @error-handling
     * - 404エラーの場合はfalseを返却（ディレクトリが存在しないことを示す）
     * - その他のエラーはlogError関数でログ記録し、そのままスロー
     * 
     * @performance-considerations
     * - 単一のAPI呼び出しで完了するため比較的軽量
     * - GitHub APIのレート制限に注意
     */
    async directoryExists(path: string): Promise<boolean> {
        try {
            const fullPath = this.getFullPath(path);

            const response = await this.octokit.repos.getContent({
                owner: this.owner,
                repo: this.repo,
                path: fullPath,
                ref: this.branch,
            });

            return Array.isArray(response.data);
        } catch (error: unknown) {
            if ((error as any).status === 404) {
                return false;
            }

            logError(error, { error }, "Error checking if directory exists: ${path}");
            throw error;
        }
    }

    /**
     * ディレクトリを作成します
     * 
     * 指定されたパスにディレクトリを作成します。
     * GitHubでは空のディレクトリは作成できないため、.gitkeepファイルを作成して代用します。
     * 
     * @async
     * @param {string} path - ディレクトリパス
     * @returns {Promise<void>} 処理完了後に解決するPromise
     * 
     * @throws {Error} ディレクトリ作成時のエラー（writeFileメソッドからの例外）
     * 
     * @usage
     * // 使用方法
     * try {
     *   await githubStorage.createDirectory('path/to/new/dir');
     *   console.log('ディレクトリが正常に作成されました');
     * } catch (error) {
     *   console.error('ディレクトリ作成エラー:', error.message);
     * }
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * - 推奨呼び出し環境: サーバーサイド
     * - 前提条件: GitHubStorageProviderが正しく初期化済みであること
     * 
     * @call-flow
     * 1. getFullPathを使用して完全パスを生成
     * 2. ディレクトリ作成開始のデバッグログ出力
     * 3. .gitkeepファイルをディレクトリ内に作成（writeFileメソッドを使用）
     * 4. ディレクトリ作成成功のログ出力
     * 
     * @external-dependencies
     * - 内部的にwriteFileメソッドを使用しGitHub APIを呼び出し
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * - writeFile - ファイル作成
     * 
     * @state-changes
     * - GitHubリポジトリに新しい.gitkeepファイルが作成される
     * - 実質的にディレクトリ構造が作成される
     * 
     * @monitoring
     * - ログレベル: DEBUG（開始時）、INFO（成功時）
     * - エラー時はwriteFileメソッド内でログ記録
     */
    async createDirectory(path: string): Promise<void> {
        const fullPath = this.getFullPath(path);
        logger.debug(`Creating directory in GitHub: ${fullPath}`);

        // GitHubでは空のディレクトリは作成できないため、.gitkeepファイルを作成
        await this.writeFile(`${path}/.gitkeep`, '');

        logger.info(`Directory successfully created in GitHub: ${path}`);
    }

    /**
     * ファイルを削除します
     * 
     * 指定されたパスのファイルをGitHubリポジトリから削除します。
     * ファイルが存在しない場合は何もせず正常終了します。
     * 
     * @async
     * @param {string} path - 削除するファイルのパス
     * @returns {Promise<void>} 処理完了後に解決するPromise
     * 
     * @throws {Error} ファイルがディレクトリの場合
     * @throws {Error} GitHub API通信エラーの場合（404エラーを除く）
     * 
     * @usage
     * // 使用方法
     * try {
     *   await githubStorage.deleteFile('path/to/file.txt');
     *   console.log('ファイルが正常に削除されました');
     * } catch (error) {
     *   console.error('ファイル削除エラー:', error.message);
     * }
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * - 推奨呼び出し環境: サーバーサイド
     * - 前提条件: GitHubStorageProviderが正しく初期化済みであること
     * 
     * @call-flow
     * 1. getFullPathを使用して完全パスを生成
     * 2. ファイル削除開始のデバッグログ出力
     * 3. ファイルのSHAを取得
     * 4. 応答データがディレクトリでないことを確認
     * 5. GitHub APIを使用してファイルを削除
     * 6. ファイル削除成功のログ出力
     * 
     * @external-dependencies
     * - GitHub API - /repos/{owner}/{repo}/contents/{path} エンドポイント（GET, DELETE）
     * 
     * @helper-methods
     * - getFullPath - 相対パスを完全パスに変換
     * 
     * @error-handling
     * - 404エラーの場合は処理を終了（ファイルが存在しないため削除不要）
     * - パスがディレクトリの場合はエラーをスロー
     * - その他のエラーはlogError関数でログ記録し、そのままスロー
     * 
     * @state-changes
     * - GitHubリポジトリからファイルが削除される
     * - コミットメッセージ: "Delete {path}"
     * 
     * @performance-considerations
     * - 2つのAPI呼び出し（SHAの取得と削除）が必要
     * - GitHub APIのレート制限に注意
     * 
     * @monitoring
     * - ログレベル: DEBUG（開始時）、INFO（成功時）、WARN（ファイルが存在しない場合）、ERROR（エラー時）
     */
    async deleteFile(path: string): Promise<void> {
        try {
            const fullPath = this.getFullPath(path);
            logger.debug(`Deleting file from GitHub: ${fullPath}`);

            // ファイルのSHAを取得
            const existingFile = await this.octokit.repos.getContent({
                owner: this.owner,
                repo: this.repo,
                path: fullPath,
                ref: this.branch,
            });

            if (Array.isArray(existingFile.data)) {
                throw new Error(`Path is a directory, not a file: ${path}`);
            }

            const sha = existingFile.data.sha;

            // ファイルを削除
            await this.octokit.repos.deleteFile({
                owner: this.owner,
                repo: this.repo,
                path: fullPath,
                message: `Delete ${path}`,
                sha,
                branch: this.branch,
            });

            logger.info(`File successfully deleted from GitHub: ${path}`);
        } catch (error: unknown) {
            if ((error as any).status === 404) {
                logger.warn(`File not found for deletion in GitHub: ${path}`);
                return;
            }

            logError(error, { error }, "Error deleting file from GitHub: ${path}");
            throw error;
        }
    }
}

/**
 * GitHub APIを使用したストレージプロバイダー実装クラス
 * 
 * StorageProviderインターフェースを実装し、GitHubリポジトリをストレージとして使用するための機能を提供します。
 * ファイルの読み書き、ディレクトリ操作、存在確認などの基本的なストレージ操作をGitHubリポジトリに対して行います。
 * 
 * @type {Class<GitHubStorageProvider>}
 * 
 * @initialization
 * GitHubStorageOptionsオブジェクトを引数としてインスタンス化します。
 * 必須パラメータとしてGitHubトークンとリポジトリ名が必要です。
 * 
 * @usage
 * // GitHubStorageProviderのインスタンス化と使用
 * import { GitHubStorageProvider } from './github-storage';
 * 
 * const storage = new GitHubStorageProvider({
 *   token: 'github_personal_access_token',
 *   repo: 'username/repository',
 *   branch: 'main',
 *   baseDir: 'content'
 * });
 * 
 * // ファイル読み込み
 * const content = await storage.readFile('documents/report.md');
 * 
 * // ファイル書き込み
 * await storage.writeFile('documents/new-report.md', '# New Report\n\nContent here...');
 */