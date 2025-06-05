// src/lib/storage/index.ts
/**
 * @fileoverview ストレージプロバイダーのファクトリーとデフォルトインスタンスを提供
 * @description
 * このファイルは、環境設定に基づいて適切なストレージプロバイダーを作成し、
 * アプリケーション全体で使用する単一のストレージプロバイダーインスタンスを提供します。
 * また、ストレージ関連の型とクラスの再エクスポートも行います。
 * 標準および拡張ストレージプロバイダーをサポートしています。
 * 
 * @role
 * - ストレージ抽象化レイヤーのエントリーポイントとして機能
 * - 環境設定に基づく適切なストレージプロバイダーの作成
 * - アプリケーション全体で使用するストレージインスタンスの提供
 * - ストレージ関連の型と実装クラスの集約的なエクスポート
 * 
 * @dependencies
 * - ./types - ストレージプロバイダーのインターフェースと設定オプションの型定義
 * - ./github-storage - GitHubをバックエンドとしたストレージプロバイダー実装
 * - ./local-storage - ローカルファイルシステムをバックエンドとしたストレージプロバイダー実装
 * - ./enhanced-storage - 拡張機能を持つローカルファイルシステムストレージプロバイダー実装
 * - ../utils/logger - ロギング機能
 * 
 * @flow
 * 1. 環境変数に基づいて使用するストレージプロバイダーを決定
 * 2. 対応するストレージプロバイダーのインスタンスを作成
 * 3. 作成したインスタンスをアプリケーション全体で使用できるようにエクスポート
 */

import {
    StorageProvider,
    GitHubStorageOptions,
    LocalStorageOptions,
    FileMetadata
} from './types';
import { GitHubStorageProvider } from './github-storage';
import { LocalStorageProvider } from './local-storage';
import { EnhancedLocalStorageProvider } from './enhanced-storage';
import { logger } from '../utils/logger';
import { ChapterStorageService } from './chapter-storage';

console.log('Loading storage/index.ts');
console.log('Environment variables in storage/index.ts:', {
    ENABLE_LOCAL_STORAGE: process.env.ENABLE_LOCAL_STORAGE,
    LOCAL_STORAGE_DIR: process.env.LOCAL_STORAGE_DIR,
    USE_ENHANCED_STORAGE: process.env.USE_ENHANCED_STORAGE,
    ENABLE_BACKUP: process.env.ENABLE_BACKUP
});

// 型とクラスのエクスポート
export type {
    StorageProvider,
    GitHubStorageOptions,
    LocalStorageOptions,
    FileMetadata
};
export {
    GitHubStorageProvider,
    LocalStorageProvider,
    EnhancedLocalStorageProvider,
    ChapterStorageService
};

/**
 * 環境に応じたストレージプロバイダーを作成します
 * 
 * 環境変数の設定に基づいて、ローカルファイルシステム、拡張ローカルファイルシステム、
 * またはGitHubリポジトリをバックエンドとしたストレージプロバイダーのインスタンスを作成し返却します。
 * 
 * @returns {StorageProvider} 設定済みのストレージプロバイダー
 * @throws {Error} GITHUB_TOKEN環境変数が設定されていない場合
 * @throws {Error} GITHUB_REPO環境変数が設定されていない場合
 * 
 * @usage
 * // 直接呼び出し（通常は不要）
 * const storage = createStorageProvider();
 * 
 * @call-flow
 * 1. ENABLE_LOCAL_STORAGE環境変数の確認
 * 2. ローカルストレージが有効な場合:
 *    a. USE_ENHANCED_STORAGE環境変数の確認
 *    b. LOCAL_STORAGE_DIR環境変数の取得（デフォルトは'data'）
 *    c. 拡張ストレージが有効な場合はEnhancedLocalStorageProviderインスタンスの作成
 *    d. 標準の場合はLocalStorageProviderインスタンスの作成と返却
 * 3. GitHubストレージを使用する場合:
 *    a. 必須環境変数（GITHUB_TOKEN、GITHUB_REPO）の確認
 *    b. オプション環境変数（GITHUB_BRANCH、GITHUB_BASE_DIR）の取得
 *    c. GitHubStorageProviderインスタンスの作成と返却
 * 
 * @error-handling
 * - 必須のGitHub設定（トークン、リポジトリ）が不足している場合、明示的なエラーをスロー
 * - その他の設定エラーは各ストレージプロバイダーのコンストラクタで処理
 * 
 * @monitoring
 * - ログレベル: INFO（どのストレージプロバイダーを使用するかを記録）
 */

export function createStorageProvider(): StorageProvider {

    console.log('[createStorageProvider] Environment variables:', {
        ENABLE_LOCAL_STORAGE: process.env.ENABLE_LOCAL_STORAGE,
        LOCAL_STORAGE_DIR: process.env.LOCAL_STORAGE_DIR,
        USE_ENHANCED_STORAGE: process.env.USE_ENHANCED_STORAGE,
        ENABLE_BACKUP: process.env.ENABLE_BACKUP
    });

    const useLocalStorage = process.env.ENABLE_LOCAL_STORAGE === 'true';
    const useEnhancedStorage = process.env.USE_ENHANCED_STORAGE === 'true';
    const enableBackup = process.env.ENABLE_BACKUP === 'true';

    console.log('[createStorageProvider] useLocalStorage:', useLocalStorage);
    console.log('[createStorageProvider] useEnhancedStorage:', useEnhancedStorage);

    if (useLocalStorage) {
        const baseDir = process.env.LOCAL_STORAGE_DIR || 'data';

        if (useEnhancedStorage) {
            logger.info('Using enhanced local storage provider with advanced features');
            console.log('[createStorageProvider] Creating EnhancedLocalStorageProvider with baseDir:', baseDir);

            const options: LocalStorageOptions = {
                baseDir,
                createBaseDir: true,
                backupEnabled: enableBackup,
                backupRetentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '7'),
                logLevel: process.env.STORAGE_LOG_LEVEL as any || 'info'
            };

            const provider = new EnhancedLocalStorageProvider(options);

            // プロバイダーが持つメソッドを確認
            console.log('[createStorageProvider] EnhancedLocalStorageProvider methods:',
                Object.getOwnPropertyNames(Object.getPrototypeOf(provider)));

            // StorageProviderインターフェースが実装されているか確認
            if (typeof provider.fileExists !== 'function' ||
                typeof provider.directoryExists !== 'function') {
                console.error('[createStorageProvider] EnhancedLocalStorageProvider does not implement required methods');
                throw new Error('EnhancedLocalStorageProvider is missing required methods');
            }

            return provider;
        } else {
            logger.info('Using standard local storage provider for development');
            console.log('[createStorageProvider] Creating LocalStorageProvider with baseDir:', baseDir);

            const options: LocalStorageOptions = { baseDir };
            const provider = new LocalStorageProvider(options);

            // プロバイダーが持つメソッドを確認
            console.log('[createStorageProvider] LocalStorageProvider methods:',
                Object.getOwnPropertyNames(Object.getPrototypeOf(provider)));

            // StorageProviderインターフェースが実装されているか確認
            if (typeof provider.fileExists !== 'function' ||
                typeof provider.directoryExists !== 'function') {
                console.error('[createStorageProvider] LocalStorageProvider does not implement required methods');
                throw new Error('LocalStorageProvider is missing required methods');
            }

            return provider;
        }
    } else {
        logger.info('Using GitHub storage provider');
        const token = process.env.GITHUB_TOKEN;
        const repo = process.env.GITHUB_REPO;

        if (!token) throw new Error('GITHUB_TOKEN environment variable is required');
        if (!repo) throw new Error('GITHUB_REPO environment variable is required');

        const options: GitHubStorageOptions = {
            token,
            repo,
            branch: process.env.GITHUB_BRANCH || 'main',
            baseDir: process.env.GITHUB_BASE_DIR,
        };

        return new GitHubStorageProvider(options);
    }
}

// ストレージプロバイダーをエクスポート（デフォルトではなく名前付きエクスポート）
export const storageProvider: StorageProvider = (() => {
    try {
        console.log('[storageProvider] Initializing storage provider');
        const provider = createStorageProvider();

        // 必要なメソッドが存在するか最終確認
        console.log('[storageProvider] Created provider with methods:',
            Object.getOwnPropertyNames(Object.getPrototypeOf(provider)));

        return provider;
    } catch (error) {
        console.error('[storageProvider] Failed to initialize storage provider:', error);
        // エラー発生時はダミーのプロバイダーを返す（テスト失敗を明示的にするため）
        throw new Error('Failed to initialize storage provider: ' + error);
    }
})();

// チャプターストレージサービスのシングルトンインスタンス
export const chapterStorage = new ChapterStorageService(storageProvider);

console.log('storageProvider created:', {
    isDefined: !!storageProvider,
    hasFileExists: typeof storageProvider.fileExists === 'function',
    type: Object.prototype.toString.call(storageProvider),
    methods: Object.getOwnPropertyNames(Object.getPrototypeOf(storageProvider)),
    isEnhanced: false // EnhancedLocalStorageProviderをチェックせずにfalseを返す

});

/**
 * アプリケーション全体で使用するデフォルトのストレージプロバイダー
 * 
 * 環境設定に基づいて自動的に作成された、適切なストレージプロバイダーの
 * シングルトンインスタンスです。アプリケーション内の任意の場所からインポートして
 * 使用することができます。
 * 
 * 拡張ストレージプロバイダーが有効な場合は、ファイルメタデータの取得や
 * バックアップ機能、ファイルのコピー・移動などの高度な機能も利用できます。
 * 
 * @type {StorageProvider}
 * 
 * @type {ChapterStorageService}
 * 
 * @singleton
 * アプリケーション全体で共有される単一のインスタンスです。
 * アプリケーション起動時にcreateStorageProvider関数によって初期化されます。
 * 
 * @initialization
 * アプリケーション起動時に自動的に初期化されます。
 * 環境変数の設定に基づいて、適切なストレージプロバイダーが使用されます。
 * 
 * @usage
 * // アプリケーション内でのストレージプロバイダーの使用方法
 * import { storageProvider } from '@/lib/storage';
 * 
 * import { chapterStorage } from '@/lib/storage';
 * // ファイルの読み込み
 * const content = await storageProvider.readFile('path/to/file.txt');
 * 
 * // ファイルの書き込み
 * await storageProvider.writeFile('path/to/file.txt', 'ファイル内容');
 * 
 * // 拡張機能を使用する場合（EnhancedLocalStorageProviderのみ）
 * if ('getFileMetadata' in storageProvider) {
 *   const metadata = await storageProvider.getFileMetadata('path/to/file.txt');
 *   console.log(`ファイルサイズ: ${metadata.size}バイト`);
 * }
 * 
 * @example
 * // 実装例
 * import { storageProvider } from '@/lib/storage';
 * 
 * async function loadUserData(userId) {
 *   const path = `users/${userId}/profile.json`;
 *   if (await storageProvider.fileExists(path)) {
 *     const data = await storageProvider.readFile(path);
 *     return JSON.parse(data);
 *   }
 *   return null;
 * }
 * 
 * // 拡張機能を使った実装例
 * import { storageProvider, EnhancedLocalStorageProvider } from '@/lib/storage';
 * 
 * async function backupAndUpdateUserData(userId, newData) {
 *   const path = `users/${userId}/profile.json`;
 *   
 *   // 拡張ストレージプロバイダーの機能を使用
 *   if (storageProvider instanceof EnhancedLocalStorageProvider) {
 *     // ファイルをバックアップディレクトリにコピー
 *     const backupPath = `backups/users/${userId}/profile-${Date.now()}.json`;
 *     if (await storageProvider.fileExists(path)) {
 *       await storageProvider.copyFile(path, backupPath);
 *     }
 *   }
 *   
 *   // 新しいデータを書き込み
 *   await storageProvider.writeFile(path, JSON.stringify(newData, null, 2));
 *   
 *   return newData;
 * }
 * 
 * 
 * // チャプターの保存
 * await chapterStorage.saveChapter(chapterObject);
 * 
 * // チャプターの取得
 * const chapter = await chapterStorage.getChapter(chapterNumber);
 * 
 * // チャプター一覧の取得
 * const chapters = await chapterStorage.listAllChapters();
 */