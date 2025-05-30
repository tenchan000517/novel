// src/lib/plot/storage.ts
import { storageProvider } from '@/lib/storage';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { parseYaml, stringifyYaml } from '@/lib/utils/yaml-helper';
import { ConcretePlotPoint, AbstractPlotGuideline, MediumPlot, PlotStrategy } from './types';

/**
 * @class PlotStorage
 * @description
 * プロットデータの永続化ストレージとのインターフェースを提供します。
 * 
 * @role
 * - プロットデータの読み込みと保存
 * - ファイル形式の変換
 * - エラーハンドリング
 */
export class PlotStorage {
    private initialized = false;

    /**
     * ストレージシステムの初期化
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            // ディレクトリの存在確認
            await this.ensureDirectoryExists('config/story-plot');
            this.initialized = true;
            logger.info('プロットストレージが初期化されました');
        } catch (error) {
            logError(error, {}, 'プロットストレージの初期化に失敗しました');
            throw error;
        }
    }

    /**
     * 具体的プロットデータを読み込みます
     */
    async loadConcretePlot(): Promise<ConcretePlotPoint[]> {
        try {
            const filePath = 'config/story-plot/concrete-plot.yaml';

            // ファイルが存在するか確認
            if (!(await storageProvider.fileExists(filePath))) {
                logger.info(`具体的プロットファイル ${filePath} が存在しません。空の配列を返します。`);
                return [];
            }

            // ファイルを読み込む
            const content = await storageProvider.readFile(filePath);
            const parsed = parseYaml(content);

            // 検証とフォーマット
            if (!Array.isArray(parsed)) {
                logger.warn(`具体的プロットファイルの形式が不正です: ${filePath}`);
                return [];
            }

            return parsed;
        } catch (error) {
            logError(error, {}, '具体的プロットの読み込みに失敗しました');
            return [];
        }
    }

    /**
 * 中期プロットを読み込みます
 * @returns 中期プロットデータ
 */
    async loadMediumPlot(): Promise<MediumPlot | null> {
        try {
            const filePath = 'data/config/story-plot/medium-plot.yaml';

            // ファイルが存在するか確認
            if (!(await storageProvider.fileExists(filePath))) {
                logger.info(`中期プロットファイル ${filePath} が存在しません。`);
                return null;
            }

            // ファイルを読み込む
            const content = await storageProvider.readFile(filePath);
            const parsed = parseYaml(content);

            // 検証
            if (typeof parsed !== 'object' || parsed === null || !parsed.sections) {
                logger.warn(`中期プロットファイルの形式が不正です: ${filePath}`);
                return null;
            }

            logger.info(`中期プロットをファイル ${filePath} から読み込みました`);
            return parsed as MediumPlot;
        } catch (error) {
            logError(error, {}, '中期プロットの読み込みに失敗しました');
            return null;
        }
    }

    /**
 * 特定の章に対応する中期プロットのセクションを取得します
 * @param chapterNumber 章番号
 * @returns 該当するセクション
 */
    async loadMediumPlotSectionForChapter(chapterNumber: number): Promise<any | null> {
        try {
            const mediumPlot = await this.loadMediumPlot();

            if (!mediumPlot || !mediumPlot.sections) {
                return null;
            }

            // 章番号に対応するセクションを探す
            const section = mediumPlot.sections.find(section =>
                chapterNumber >= section.chapterRange.start &&
                chapterNumber <= section.chapterRange.end
            );

            return section || null;
        } catch (error) {
            logError(error, { chapterNumber }, '章に対応する中期プロットセクションの読み込みに失敗しました');
            return null;
        }
    }

    /**
     * 抽象的プロットデータを読み込みます
     */
    async loadAbstractPlot(): Promise<AbstractPlotGuideline[]> {
        try {
            const filePath = 'config/story-plot/abstract-plot.yaml';

            // ファイルが存在するか確認
            if (!(await storageProvider.fileExists(filePath))) {
                logger.info(`抽象的プロットファイル ${filePath} が存在しません。空の配列を返します。`);
                return [];
            }

            // ファイルを読み込む
            const content = await storageProvider.readFile(filePath);
            const parsed = parseYaml(content);

            // 検証とフォーマット
            if (!Array.isArray(parsed)) {
                logger.warn(`抽象的プロットファイルの形式が不正です: ${filePath}`);
                return [];
            }

            return parsed;
        } catch (error) {
            logError(error, {}, '抽象的プロットの読み込みに失敗しました');
            return [];
        }
    }

    /**
     * プロット展開戦略を読み込みます
     */
    async loadPlotStrategy(): Promise<PlotStrategy> {
        try {
            const filePath = 'config/story-plot/plot-strategy.yaml';

            // ファイルが存在するか確認
            if (!(await storageProvider.fileExists(filePath))) {
                logger.info(`プロット戦略ファイル ${filePath} が存在しません。デフォルト戦略を返します。`);
                return this.getDefaultPlotStrategy();
            }

            // ファイルを読み込む
            const content = await storageProvider.readFile(filePath);
            const parsed = parseYaml(content);

            // 検証
            if (typeof parsed !== 'object' || parsed === null) {
                logger.warn(`プロット戦略ファイルの形式が不正です: ${filePath}`);
                return this.getDefaultPlotStrategy();
            }

            return parsed as PlotStrategy;
        } catch (error) {
            logError(error, {}, 'プロット戦略の読み込みに失敗しました');
            return this.getDefaultPlotStrategy();
        }
    }

    /**
     * 具体的プロットを保存します
     */
    async saveConcretePlot(plot: ConcretePlotPoint[]): Promise<void> {
        try {
            const filePath = 'config/story-plot/concrete-plot.yaml';
            const content = stringifyYaml(plot);
            await storageProvider.writeFile(filePath, content);
            logger.info(`具体的プロットをファイル ${filePath} に保存しました`);
        } catch (error) {
            logError(error, {}, '具体的プロットの保存に失敗しました');
            throw error;
        }
    }

    /**
     * 抽象的プロットを保存します
     */
    async saveAbstractPlot(plot: AbstractPlotGuideline[]): Promise<void> {
        try {
            const filePath = 'config/story-plot/abstract-plot.yaml';
            const content = stringifyYaml(plot);
            await storageProvider.writeFile(filePath, content);
            logger.info(`抽象的プロットをファイル ${filePath} に保存しました`);
        } catch (error) {
            logError(error, {}, '抽象的プロットの保存に失敗しました');
            throw error;
        }
    }

    /**
     * プロット戦略を保存します
     */
    async savePlotStrategy(strategy: PlotStrategy): Promise<void> {
        try {
            const filePath = 'config/story-plot/plot-strategy.yaml';
            const content = stringifyYaml(strategy);
            await storageProvider.writeFile(filePath, content);
            logger.info(`プロット戦略をファイル ${filePath} に保存しました`);
        } catch (error) {
            logError(error, {}, 'プロット戦略の保存に失敗しました');
            throw error;
        }
    }

    // ヘルパーメソッド

    /**
     * プロットデータが保存されているディレクトリを確保します
     * 既存のメソッドをオーバーライド
     */
    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            if (!(await storageProvider.directoryExists(dirPath))) {
                await storageProvider.createDirectory(dirPath);
                logger.info(`ディレクトリを作成しました: ${dirPath}`);
            }

            // 中期プロット用のディレクトリも確認
            const mediumPlotDir = 'data/config/story-plot';
            if (!(await storageProvider.directoryExists(mediumPlotDir))) {
                await storageProvider.createDirectory(mediumPlotDir);
                logger.info(`中期プロット用ディレクトリを作成しました: ${mediumPlotDir}`);
            }
        } catch (error) {
            logError(error, { dirPath }, 'ディレクトリの確認または作成に失敗しました');
            throw error;
        }
    }

    /**
     * デフォルトのプロット戦略を生成します
     */
    private getDefaultPlotStrategy(): PlotStrategy {
        return {
            globalStrategy: {
                preferredMode: "mixed",
                abstractRatio: 0.6,
                plotComplexity: "medium"
            },
            chapterModeOverrides: [],
            arcStrategies: []
        };
    }
}