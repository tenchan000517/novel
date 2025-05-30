// src\lib\generation\context-generator\memory-provider.ts
/**
 * @fileoverview 記憶情報提供モジュール
 * @description
 * このファイルは、コンテキスト生成に必要な階層的記憶（短期・中期・長期）を提供します。
 * MemoryManagerから必要な情報を取得し、適切な形式に整形します。
 */

import { logger } from '@/lib/utils/logger';
import { MemoryManager } from '@/lib/memory/manager';
import { storageProvider } from '@/lib/storage';
import { parseYaml } from '@/lib/utils/yaml-helper';

/**
 * 記憶プロバイダークラス
 * 階層的記憶管理システムから記憶情報を取得する
 */
export class MemoryProvider {
    private memoryManager: MemoryManager;

    /**
     * コンストラクタ
     * @param memoryManager 記憶マネージャーのインスタンス
     */
    constructor(memoryManager: MemoryManager) {
        this.memoryManager = memoryManager;
        logger.info('MemoryProvider initialized');
    }

    /**
     * 基本設定の存在を確認し、必要に応じて初期化する
     * 
     * 特に最初のチャプター生成前に呼び出され、世界設定、テーマトラッカー、アーク情報などの
     * 基本的な設定ファイルが存在するかを確認します。
     */
    async ensureBasicSettingsExist(): Promise<void> {
        try {
            logger.info('Checking basic story settings');

            // 世界設定の確認
            const worldSettingsExist = await storageProvider.fileExists('config/world-settings.yaml');
            if (!worldSettingsExist) {
                logger.warn('World settings file not found. System may not generate appropriate context.');
            }

            // テーマトラッカーの確認
            const themeTrackerExist = await storageProvider.fileExists('config/theme-tracker.yaml');
            if (!themeTrackerExist) {
                logger.warn('Theme tracker file not found. System may not generate appropriate context.');
            }

            // アーク情報の確認
            const currentArc = await this.memoryManager.getCurrentArc(1);
            if (!currentArc) {
                logger.warn('No arc information found for initial chapters. Will attempt to derive from story config.');
                // ストーリープロットファイルからアーク情報を作成する処理を追加する
                // この実装は、MemoryManagerクラスの拡張が必要
                // await this.initializeArcFromStoryConfig();
            }
        } catch (error) {
            logger.error('Failed to check basic settings', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 短期記憶の取得
     * @param chapterNumber チャプター番号
     * @returns 短期記憶データ
     */
    async getShortTermMemory(chapterNumber: number): Promise<any> {
        try {
            // MemoryManagerから直接最近のチャプターメモリを取得
            const memories = await this.memoryManager.getRecentChapterMemories(
                Math.max(1, chapterNumber - 1)
            );

            if (!memories || memories.length === 0) {
                logger.warn(`No short-term memories found for chapter ${chapterNumber}`);
                return { chapters: [] };
            }

            return { chapters: memories };
        } catch (error) {
            logger.error(`Failed to retrieve short-term memory for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー時は空の短期記憶を返す
            return { chapters: [] };
        }
    }

    /**
     * 中期記憶の取得
     * @param chapterNumber チャプター番号
     * @returns 中期記憶データ
     */
    async getMidTermMemory(chapterNumber: number): Promise<any> {
        try {
            // MemoryManagerから直接現在のアーク情報を取得
            const currentArc = await this.memoryManager.getCurrentArc(chapterNumber);

            if (!currentArc) {
                logger.warn(`No arc information found for chapter ${chapterNumber}`);

                // アーク情報がない場合は基本的なストーリー構成から抽出する
                const basicStoryInfo = await this.getBasicStoryInfo();
                return {
                    currentArc: {
                        number: Math.ceil(chapterNumber / 5), // 仮のアーク番号
                        theme: basicStoryInfo.theme || '物語の展開',
                        summary: basicStoryInfo.summary || '物語の進行',
                        chapter_range: {
                            start: Math.floor((chapterNumber - 1) / 5) * 5 + 1,
                            end: Math.floor((chapterNumber - 1) / 5) * 5 + 5
                        }
                    },
                    keyEvents: []
                };
            }

            // MemoryManagerから直接重要イベントを取得
            const keyEvents = await this.memoryManager.getImportantEvents(
                currentArc.chapter_range?.start || 1,
                currentArc.chapter_range?.end || chapterNumber
            );

            return {
                currentArc,
                keyEvents
            };
        } catch (error) {
            logger.error(`Failed to retrieve mid-term memory for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー時は基本設定から中期記憶を生成
            const basicStoryInfo = await this.getBasicStoryInfo();
            return {
                currentArc: {
                    number: Math.ceil(chapterNumber / 5),
                    theme: basicStoryInfo.theme || '物語の展開',
                    summary: basicStoryInfo.summary || '物語の進行',
                    chapter_range: {
                        start: Math.floor((chapterNumber - 1) / 5) * 5 + 1,
                        end: Math.floor((chapterNumber - 1) / 5) * 5 + 5
                    }
                },
                keyEvents: []
            };
        }
    }

    /**
     * 長期記憶の取得
     * @returns 長期記憶データ
     */
    async getLongTermMemory(): Promise<any> {
        try {
            // 世界設定の取得
            const worldSettings = await this.getWorldSettings();

            // テーマの取得
            const theme = await this.getTheme();

            // 重要な因果関係の取得
            const causalityMap = await this.getCausalityMap();

            return {
                worldSettings,
                theme,
                causalityMap
            };
        } catch (error) {
            logger.error('Failed to retrieve long-term memory', {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー時は基本設定から長期記憶を生成
            const basicStoryInfo = await this.getBasicStoryInfo();
            return {
                worldSettings: basicStoryInfo.worldSettings || '物語の舞台設定',
                theme: basicStoryInfo.theme || '物語のテーマ',
                causalityMap: []
            };
        }
    }

    /**
     * 世界設定の取得
     * @returns 整形された世界設定
     */
    private async getWorldSettings(): Promise<string> {
        try {
            // 世界設定ファイルの読み込み
            const exists = await storageProvider.fileExists('config/world-settings.yaml');

            if (!exists) {
                logger.warn('World settings file not found');
                // 基本的なストーリー情報を取得
                const basicStoryInfo = await this.getBasicStoryInfo();
                return basicStoryInfo.worldSettings || '物語の舞台設定';
            }

            const rawContent = await storageProvider.readFile('config/world-settings.yaml');
            const settings = parseYaml(rawContent);

            // 設定の整形
            let formattedSettings = '';

            if (settings.description) {
                formattedSettings += settings.description + '\n\n';
            }

            if (settings.regions && Array.isArray(settings.regions)) {
                formattedSettings += '## 地域\n';
                formattedSettings += settings.regions.join('\n') + '\n\n';
            }

            if (settings.history && Array.isArray(settings.history)) {
                formattedSettings += '## 歴史\n';
                formattedSettings += settings.history.join('\n') + '\n\n';
            }

            if (settings.rules && Array.isArray(settings.rules)) {
                formattedSettings += '## 世界のルール\n';
                formattedSettings += settings.rules.join('\n');
            }

            return formattedSettings;
        } catch (error) {
            logger.error('Failed to retrieve world settings', {
                error: error instanceof Error ? error.message : String(error)
            });

            // 基本的なストーリー情報を取得
            const basicStoryInfo = await this.getBasicStoryInfo();
            return basicStoryInfo.worldSettings || '物語の舞台設定';
        }
    }

    /**
     * テーマの取得
     * @returns テーマ
     */
    private async getTheme(): Promise<string> {
        try {
            // テーマファイルの読み込み
            const exists = await storageProvider.fileExists('config/theme-tracker.yaml');

            if (!exists) {
                logger.warn('Theme tracker file not found');
                // 基本的なストーリー情報を取得
                const basicStoryInfo = await this.getBasicStoryInfo();
                return basicStoryInfo.theme || '物語のテーマ';
            }

            const rawContent = await storageProvider.readFile('config/theme-tracker.yaml');
            const theme = parseYaml(rawContent);

            if (theme.description) {
                return theme.description;
            }

            if (theme.evolution && Array.isArray(theme.evolution) && theme.evolution.length > 0) {
                // 最新のテーマを返す
                const latestTheme = theme.evolution[theme.evolution.length - 1];
                return latestTheme.theme;
            }

            // 基本的なストーリー情報を取得
            const basicStoryInfo = await this.getBasicStoryInfo();
            return basicStoryInfo.theme || '物語のテーマ';
        } catch (error) {
            logger.error('Failed to retrieve theme', {
                error: error instanceof Error ? error.message : String(error)
            });

            // 基本的なストーリー情報を取得
            const basicStoryInfo = await this.getBasicStoryInfo();
            return basicStoryInfo.theme || '物語のテーマ';
        }
    }

    /**
     * 因果関係マップの取得
     * @returns 因果関係マップ
     */
    private async getCausalityMap(): Promise<any[]> {
        try {
            // 因果関係マップファイルの読み込み
            const exists = await storageProvider.fileExists('config/causality-map.yaml');

            if (!exists) {
                logger.warn('Causality map file not found');
                return [];
            }

            const rawContent = await storageProvider.readFile('config/causality-map.yaml');
            const causalityMap = parseYaml(rawContent);

            if (Array.isArray(causalityMap)) {
                return causalityMap;
            }

            return [];
        } catch (error) {
            logger.error('Failed to retrieve causality map', {
                error: error instanceof Error ? error.message : String(error)
            });

            return [];
        }
    }

    /**
     * 基本的なストーリー情報の取得
     * @returns 基本的なストーリー情報
     */
    async getBasicStoryInfo(): Promise<any> {
        try {
            logger.info('Retrieving basic story information');

            // story-plot.yamlファイルの読み込み
            let storyPlot: any = {};
            const storyPlotExists = await storageProvider.fileExists('config/story-plot.yaml');

            if (storyPlotExists) {
                const content = await storageProvider.readFile('config/story-plot.yaml');
                storyPlot = parseYaml(content) || {};
            } else {
                logger.warn('Story plot file not found');
            }

            // 世界設定ファイルの読み込み
            let worldSettings: any = {};
            const worldSettingsExists = await storageProvider.fileExists('config/world-settings.yaml');

            if (worldSettingsExists) {
                const content = await storageProvider.readFile('config/world-settings.yaml');
                worldSettings = parseYaml(content) || {};
            } else {
                logger.warn('World settings file not found');
            }

            // テーマトラッカーファイルの読み込み
            let themeTracker: any = {};
            const themeTrackerExists = await storageProvider.fileExists('config/theme-tracker.yaml');

            if (themeTrackerExists) {
                const content = await storageProvider.readFile('config/theme-tracker.yaml');
                themeTracker = parseYaml(content) || {};
            } else {
                logger.warn('Theme tracker file not found');
            }

            // 統合された基本情報
            return {
                // ジャンル（デフォルトは汎用的な「物語」）
                genre: storyPlot.genre || worldSettings.genre || themeTracker.genre || '物語',

                // テーマ
                theme: themeTracker.description || storyPlot.theme || worldSettings.theme || '物語のテーマ',

                // 世界設定
                worldSettings: worldSettings.description || storyPlot.setting || '物語の舞台設定',

                // 概要
                summary: storyPlot.summary || themeTracker.summary || '物語の進行',

                // 時代背景
                era: worldSettings.era || storyPlot.era || '現代',

                // 場所
                location: worldSettings.location || storyPlot.location || '物語の舞台'
            };
        } catch (error) {
            logger.error('Failed to retrieve basic story information', {
                error: error instanceof Error ? error.message : String(error)
            });

            // 最小限の汎用情報を返す
            return {
                genre: '物語',
                theme: '物語のテーマ',
                worldSettings: '物語の舞台設定',
                summary: '物語の進行',
                era: '現代',
                location: '物語の舞台'
            };
        }
    }
}