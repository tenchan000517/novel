// src\lib\storage\chapter-storage.ts

/**
 * @fileoverview 小説チャプターのストレージサービス
 * @description
 * このファイルは、生成された小説チャプターをストレージに保存し、
 * 取得するためのサービスクラスを提供します。
 * StorageProviderインターフェースを利用してストレージの実装詳細を抽象化し、
 * マークダウン形式でチャプターを保存・取得する機能を提供します。
 * 
 * @role
 * - 生成された小説チャプターのストレージ操作の抽象化
 * - 共通のチャプターファイル形式（マークダウン+FrontMatter）の管理
 * - ストレージプロバイダーとアプリケーションロジックの橋渡し
 */

import { StorageProvider } from './types';
import { Chapter } from '@/types/chapters';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from './index';
import yaml from 'js-yaml';
import path from 'path';

/**
 * @class ChapterStorageService
 * @description 小説チャプターのストレージ操作を担当するサービスクラス
 * 
 * @role
 * - チャプターのストレージへの保存と取得
 * - チャプターファイルの形式管理（マークダウン+FrontMatter）
 * - 保存パス生成やメタデータ管理などの共通ロジックを提供
 */
export class ChapterStorageService {
    private storage: StorageProvider;
    private chaptersBaseDir: string;

    /**
     * コンストラクタ
     * 
     * ChapterStorageServiceクラスのインスタンスを初期化します。
     * デフォルトでは環境から提供されるストレージプロバイダーを使用します。
     * 
     * @param {StorageProvider} [storage] - ストレージプロバイダー（省略時はデフォルト）
     * @param {string} [chaptersBaseDir='chapters'] - チャプター保存のベースディレクトリ
     */
    constructor(storage?: StorageProvider, chaptersBaseDir: string = 'chapters') {
        this.storage = storage || storageProvider;
        this.chaptersBaseDir = chaptersBaseDir;
        logger.info('ChapterStorageService initialized', { baseDir: this.chaptersBaseDir });
    }

    /**
     * チャプターのファイルパスを生成
     * 
     * 指定されたチャプター番号に基づいてストレージ内のファイルパスを生成します。
     * 
     * @private
     * @param {number} chapterNumber - チャプター番号
     * @returns {string} ストレージ内のファイルパス
     */
    private getChapterFilePath(chapterNumber: number): string {
        return path.join(this.chaptersBaseDir, `chapter-${String(chapterNumber).padStart(3, '0')}.md`);
    }

    /**
     * メタデータのファイルパスを生成
     * 
     * 指定されたチャプター番号に基づいてメタデータファイルのパスを生成します。
     * 
     * @private
     * @param {number} chapterNumber - チャプター番号
     * @returns {string} メタデータファイルのパス
     */
    private getMetadataFilePath(chapterNumber: number): string {
        return path.join(this.chaptersBaseDir, `chapter-${String(chapterNumber).padStart(3, '0')}-metadata.json`);
    }

    /**
     * チャプターをストレージに保存
     * 
     * 生成されたチャプターオブジェクトをマークダウン形式でストレージに保存します。
     * チャプターの内容はマークダウン本文とし、メタデータはFrontMatterとして
     * ファイルの先頭に追加します。また、詳細なメタデータは別ファイルとして保存します。
     * 
     * @async
     * @param {Chapter} chapter - 保存するチャプターオブジェクト
     * @returns {Promise<string>} 保存されたファイルのパス
     * 
     * @throws {Error} ストレージ操作中にエラーが発生した場合
     */
    async saveChapter(chapter: Chapter): Promise<string> {
        const filePath = this.getChapterFilePath(chapter.chapterNumber);
        const metadataPath = this.getMetadataFilePath(chapter.chapterNumber);

        try {
            // チャプターディレクトリが存在することを確認
            if (!(await this.storage.directoryExists(this.chaptersBaseDir))) {
                await this.storage.createDirectory(this.chaptersBaseDir);
                logger.info(`Created chapters directory: ${this.chaptersBaseDir}`);
            }

            // FrontMatter用のメタデータ作成
            const frontMatterData = {
                title: chapter.title,
                chapterNumber: chapter.chapterNumber,
                wordCount: chapter.wordCount,
                createdAt: chapter.createdAt,
                updatedAt: chapter.updatedAt,
                summary: chapter.summary,
                pov: chapter.metadata.pov,
                location: chapter.metadata.location,
                timeframe: chapter.metadata.timeframe,
                emotionalTone: chapter.metadata.emotionalTone,
                qualityScore: chapter.metadata.qualityScore,
            };

            // FrontMatterとチャプター内容を結合
            const frontMatter = yaml.dump(frontMatterData);
            const fileContent = `---\n${frontMatter}---\n\n${chapter.content}`;

            // チャプターファイル書き込み
            await this.storage.writeFile(filePath, fileContent);

            // 詳細なメタデータを別ファイルに保存（検索・分析用）
            await this.storage.writeFile(metadataPath, JSON.stringify({
                id: chapter.id,
                scenes: chapter.scenes,
                analysis: chapter.analysis,
                metadata: chapter.metadata
            }, null, 2));

            logger.info(`Chapter ${chapter.chapterNumber} saved successfully`, {
                path: filePath,
                metadataPath,
                size: fileContent.length
            });

            return filePath;
        } catch (error) {
            logger.error(`Failed to save chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                path: filePath
            });
            throw new Error(`Failed to save chapter: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 指定されたチャプター番号のチャプターを取得
     * 
     * ストレージから指定されたチャプター番号のチャプターを読み込み、
     * Chapterオブジェクトとして返します。
     * 
     * @async
     * @param {number} chapterNumber - 取得するチャプター番号
     * @returns {Promise<Chapter|null>} チャプターオブジェクト、存在しない場合はnull
     */
    async getChapter(chapterNumber: number): Promise<Chapter | null> {
        const filePath = this.getChapterFilePath(chapterNumber);
        const metadataPath = this.getMetadataFilePath(chapterNumber);

        try {
            // チャプターファイルの存在確認
            if (!(await this.storage.fileExists(filePath))) {
                logger.info(`Chapter ${chapterNumber} not found`, { path: filePath });
                return null;
            }

            // チャプターファイル読み込み
            const fileContent = await this.storage.readFile(filePath);

            // FrontMatterとコンテンツを分離
            const frontMatterRegex = /^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/;
            const match = fileContent.match(frontMatterRegex);

            if (!match) {
                logger.warn(`Invalid format in chapter file: ${filePath}`);
                return null;
            }

            const [, frontMatterYaml, content] = match;
            const frontMatter = yaml.load(frontMatterYaml) as any;

            // メタデータファイル読み込み
            let metadata = {};
            let scenes = [];
            let analysis = undefined; // analysis を初期状態では undefined に
            let id = `chapter-${chapterNumber}`;

            try {
                if (await this.storage.fileExists(metadataPath)) {
                    const metadataContent = await this.storage.readFile(metadataPath);
                    const metadataJson = JSON.parse(metadataContent);
                    metadata = metadataJson.metadata || {};
                    scenes = metadataJson.scenes || [];
                    // メタデータファイルからanalysisを取得、なければChapterAnalysisの要件を満たすデフォルト値を設定
                    if (metadataJson.analysis) {
                        analysis = {
                            characterAppearances: metadataJson.analysis.characterAppearances || [],
                            themeOccurrences: metadataJson.analysis.themeOccurrences || [],
                            foreshadowingElements: metadataJson.analysis.foreshadowingElements || [],
                            qualityMetrics: metadataJson.analysis.qualityMetrics || {},
                            ...metadataJson.analysis
                        };
                    }
                    id = metadataJson.id || id;
                }
            } catch (metadataError) {
                logger.warn(`Metadata file not found or invalid: ${metadataPath}`, {
                    error: metadataError instanceof Error ? metadataError.message : String(metadataError)
                });
                // メタデータファイルがなくても処理続行
            }

            // Chapterオブジェクト構築
            const chapter: Chapter = {
                id,
                title: frontMatter.title || `第${chapterNumber}章`,
                chapterNumber,
                content,
                wordCount: frontMatter.wordCount || 0,
                createdAt: frontMatter.createdAt ? new Date(frontMatter.createdAt) : new Date(),
                updatedAt: frontMatter.updatedAt ? new Date(frontMatter.updatedAt) : new Date(),
                summary: frontMatter.summary || '',
                scenes,
                analysis, // undefined または 適切なプロパティを持つオブジェクト
                metadata: {
                    pov: frontMatter.pov || '',
                    location: frontMatter.location || '',
                    timeframe: frontMatter.timeframe || '',
                    emotionalTone: frontMatter.emotionalTone || '',
                    qualityScore: frontMatter.qualityScore || 0,
                    keywords: [],
                    events: [],
                    characters: [],
                    foreshadowing: [],
                    resolvedForeshadowing: [],
                    resolutions: [],
                    correctionHistory: [],
                    updatedAt: new Date(),
                    generationVersion: '1.0',
                    generationTime: 0,
                    ...metadata
                }
            };

            logger.info(`Chapter ${chapterNumber} loaded successfully`, { path: filePath });
            return chapter;
        } catch (error) {
            logger.error(`Failed to load chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                path: filePath
            });
            return null;
        }
    }

    /**
     * 保存されているすべてのチャプターの一覧を取得
     * 
     * @async
     * @returns {Promise<Array<{number: number, title: string, createdAt: Date}>>} チャプター情報の配列
     */
    async listAllChapters(): Promise<Array<{ number: number, title: string, createdAt: Date }>> {
        try {
            // チャプターディレクトリが存在しない場合は空配列を返す
            if (!(await this.storage.directoryExists(this.chaptersBaseDir))) {
                return [];
            }

            // チャプターディレクトリ内のファイル一覧を取得
            const files = await this.storage.listFiles(this.chaptersBaseDir);

            // チャプターファイルをフィルタリング
            const chapterFiles = files.filter(file =>
                file.includes(`${this.chaptersBaseDir}/chapter-`) &&
                file.endsWith('.md') &&
                !file.includes('-metadata')
            );

            // 各チャプターの情報を抽出
            const chapters = await Promise.all(chapterFiles.map(async (file) => {
                try {
                    const content = await this.storage.readFile(file);

                    // FrontMatterを抽出
                    const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
                    const match = content.match(frontMatterRegex);

                    if (match) {
                        const frontMatter = yaml.load(match[1]) as any;
                        return {
                            number: frontMatter.chapterNumber,
                            title: frontMatter.title,
                            createdAt: frontMatter.createdAt ? new Date(frontMatter.createdAt) : new Date()
                        };
                    }

                    // ファイル名からチャプター番号を抽出
                    const filename = path.basename(file);
                    const numberMatch = filename.match(/chapter-(\d{3})\.md/);
                    if (numberMatch) {
                        return {
                            number: parseInt(numberMatch[1], 10),
                            title: `第${parseInt(numberMatch[1], 10)}章`,
                            createdAt: new Date()
                        };
                    }

                    return null;
                } catch (error) {
                    logger.warn(`Failed to parse chapter file: ${file}`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                    return null;
                }
            }));

            // nullを除外して番号順にソート
            return chapters
                .filter(chapter => chapter !== null)
                .sort((a, b) => a.number - b.number);
        } catch (error) {
            logger.error('Failed to list chapters', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 最新のチャプター番号を取得
     * 
     * @async
     * @returns {Promise<number>} 最新のチャプター番号、チャプターが存在しない場合は0
     */
    async getLatestChapterNumber(): Promise<number> {
        const chapters = await this.listAllChapters();
        if (chapters.length === 0) {
            return 0;
        }

        return Math.max(...chapters.map(chapter => chapter.number));
    }

    /**
     * 指定されたチャプターが存在するかチェック
     * 
     * @async
     * @param {number} chapterNumber - チェックするチャプター番号
     * @returns {Promise<boolean>} チャプターが存在する場合はtrue
     */
    async chapterExists(chapterNumber: number): Promise<boolean> {
        const filePath = this.getChapterFilePath(chapterNumber);
        return await this.storage.fileExists(filePath);
    }

    /**
     * 指定されたチャプターを削除
     * 
     * @async
     * @param {number} chapterNumber - 削除するチャプター番号
     * @returns {Promise<boolean>} 削除が成功した場合はtrue
     */
    async deleteChapter(chapterNumber: number): Promise<boolean> {
        const filePath = this.getChapterFilePath(chapterNumber);
        const metadataPath = this.getMetadataFilePath(chapterNumber);

        try {
            // チャプターファイルが存在する場合のみ削除
            if (await this.storage.fileExists(filePath)) {
                await this.storage.deleteFile(filePath);
                logger.info(`Chapter file deleted: ${filePath}`);
            }

            // メタデータファイルが存在する場合のみ削除
            if (await this.storage.fileExists(metadataPath)) {
                await this.storage.deleteFile(metadataPath);
                logger.info(`Metadata file deleted: ${metadataPath}`);
            }

            return true;
        } catch (error) {
            logger.error(`Failed to delete chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }
}