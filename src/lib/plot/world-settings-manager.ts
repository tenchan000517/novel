// src/lib/plot/world-settings-manager.ts
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { storageProvider } from '@/lib/storage';
import { parseYaml, stringifyYaml } from '@/lib/utils/yaml-helper'; // stringifyYamlをインポート
import { WorldSettings, ThemeSettings, FormattedWorldAndTheme } from './types';

/**
 * @class WorldSettingsManager
 * @description
 * 物語の世界設定とテーマ設定を管理するクラス
 * 
 * @role
 * - 世界設定とテーマ設定ファイルの読み込みと提供
 * - プロンプト用に整形された設定を生成
 * - 設定の検証と整合性確認
 */
export class WorldSettingsManager {
    private worldSettings: WorldSettings | null = null;
    private themeSettings: ThemeSettings | null = null;
    private initialized: boolean = false;
    private initializationPromise: Promise<void> | null = null;

    /**
     * WorldSettingsManagerのコンストラクタ
     */
    constructor() {
        logger.info('WorldSettingsManager created');
    }

    /**
     * 世界設定マネージャーを初期化します
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this._initialize();
        return this.initializationPromise;
    }

    /**
     * 内部初期化処理
     */
    private async _initialize(): Promise<void> {
        try {
            logger.info('Starting WorldSettingsManager initialization');

            // 世界設定ファイルの読み込み
            await this.loadWorldSettings();

            // テーマファイルの読み込み
            await this.loadThemeSettings();

            this.initialized = true;
            logger.info('WorldSettingsManager initialization completed');
        } catch (error) {
            logError(error, {}, 'WorldSettingsManager initialization failed');
            // エラーでも初期化完了とマークして後続処理に影響を与えないようにする
            this.initialized = true;
            throw error;
        } finally {
            this.initializationPromise = null;
        }
    }

    /**
     * 初期化完了を確認し、必要に応じて待機します
     */
    private async ensureInitialized(): Promise<void> {
        if (this.initialized) return;
        if (this.initializationPromise) {
            await this.initializationPromise;
        } else {
            this.initializationPromise = this.initialize();
            await this.initializationPromise;
        }
    }

    /**
     * 世界設定ファイルを読み込みます
     */
    private async loadWorldSettings(): Promise<void> {
        try {
            const filePath = 'config/world-settings.yaml';

            if (!(await storageProvider.fileExists(filePath))) {
                logger.warn(`World settings file not found: ${filePath}`);
                return;
            }

            const content = await storageProvider.readFile(filePath);

            if (!content || content.length === 0) {
                logger.warn('World settings file is empty');
                return;
            }

            // YAMLのパース
            this.worldSettings = parseYaml(content) as WorldSettings;

            logger.info('World settings loaded successfully', {
                hasDescription: !!this.worldSettings?.description,
                regions: this.worldSettings?.regions?.length || 0
            });
        } catch (error) {
            logError(error, {}, 'Failed to load world settings');
            this.worldSettings = null;
        }
    }

    /**
     * テーマ設定ファイルを読み込みます
     */
    private async loadThemeSettings(): Promise<void> {
        try {
            const filePath = 'config/theme-tracker.yaml';

            if (!(await storageProvider.fileExists(filePath))) {
                logger.warn(`Theme tracker file not found: ${filePath}`);
                return;
            }

            const content = await storageProvider.readFile(filePath);

            if (!content || content.length === 0) {
                logger.warn('Theme tracker file is empty');
                return;
            }

            // YAMLのパース
            this.themeSettings = parseYaml(content) as ThemeSettings;

            logger.info('Theme settings loaded successfully', {
                hasDescription: !!this.themeSettings?.description,
                mainThemes: this.themeSettings?.mainThemes?.length || 0
            });
        } catch (error) {
            logError(error, {}, 'Failed to load theme settings');
            this.themeSettings = null;
        }
    }

    /**
     * 世界設定を取得します
     */
    async getWorldSettings(): Promise<WorldSettings | null> {
        await this.ensureInitialized();
        return this.worldSettings;
    }

    /**
     * テーマ設定を取得します
     */
    async getThemeSettings(): Promise<ThemeSettings | null> {
        await this.ensureInitialized();
        return this.themeSettings;
    }

    /**
     * 世界設定が有効かどうかを確認します
     */
    async hasValidWorldSettings(): Promise<boolean> {
        await this.ensureInitialized();
        return !!this.worldSettings && !!this.worldSettings.description;
    }

    /**
     * テーマ設定が有効かどうかを確認します
     */
    async hasValidThemeSettings(): Promise<boolean> {
        await this.ensureInitialized();
        return !!this.themeSettings && !!this.themeSettings.description;
    }

    /**
     * 世界設定からジャンルを取得する
     * @returns {Promise<string>} ジャンル文字列
     */
    async getGenre(): Promise<string> {
        try {
            await this.ensureInitialized();

            // デバッグ情報を追加
            console.log('=== Genre Debug Info ===');
            console.log('initialized:', this.initialized);
            console.log('worldSettings exists:', !!this.worldSettings);
            console.log('worldSettings content:', this.worldSettings);
            console.log('genre value:', this.worldSettings?.genre);
            console.log('======================');

            // 直接 worldSettings から genre を取得
            if (this.worldSettings?.genre) {
                return this.worldSettings.genre;
            }

            // デフォルト
            return 'classic';
        } catch (error) {
            logger.warn('Failed to get genre from world settings', {
                error: error instanceof Error ? error.message : String(error)
            });
            return 'classic'; // デフォルトジャンル
        }
    }

    /**
     * プロンプト用に整形された世界設定を取得します
     */
    async getFormattedWorldAndTheme(): Promise<FormattedWorldAndTheme> {
        await this.ensureInitialized();

        // 世界設定の整形
        let worldSettingsText = '';
        if (this.worldSettings) {
            // 基本情報
            worldSettingsText = `【ジャンル】${this.worldSettings.genre || 'classic'}\n\n`;
            worldSettingsText += `【世界観】\n${this.worldSettings.description || ''}\n\n`;

            // 主要な地域
            if (this.worldSettings.regions && this.worldSettings.regions.length > 0) {
                worldSettingsText += `【主要舞台】\n`;
                this.worldSettings.regions.forEach(region => {
                    if (region.name && region.description) {
                        worldSettingsText += `・${region.name}: ${region.description}\n`;
                    }
                });
                worldSettingsText += '\n';
            }

            // ビジネスシステム（ビジネスジャンル向け）
            if (this.worldSettings.businessSystem && this.worldSettings.businessSystem.description) {
                worldSettingsText += `【ビジネス環境】\n${this.worldSettings.businessSystem.description}\n`;
                if (this.worldSettings.businessSystem.rules && this.worldSettings.businessSystem.rules.length > 0) {
                    this.worldSettings.businessSystem.rules.forEach(rule => {
                        worldSettingsText += `・${rule}\n`;
                    });
                }
                worldSettingsText += '\n';
            }

            // 技術レベル
            if (this.worldSettings.technology && this.worldSettings.technology.description) {
                worldSettingsText += `【技術環境】\n${this.worldSettings.technology.description}\n\n`;
            }

            // 社会システム
            if (this.worldSettings.socialSystem && this.worldSettings.socialSystem.description) {
                worldSettingsText += `【社会背景】\n${this.worldSettings.socialSystem.description}\n\n`;
            }

            // 魔法システム（ファンタジージャンル向け）
            if (this.worldSettings.magicSystem && this.worldSettings.magicSystem.description) {
                worldSettingsText += `【魔法システム】\n${this.worldSettings.magicSystem.description}\n\n`;
            }

            // 固有要素
            if (this.worldSettings.uniqueElements && this.worldSettings.uniqueElements.length > 0) {
                worldSettingsText += `【特徴的要素】\n`;
                this.worldSettings.uniqueElements.forEach(element => {
                    if (element.name && element.description) {
                        worldSettingsText += `・${element.name}: ${element.description}\n`;
                    }
                });
                worldSettingsText += '\n';
            }
        }
        // テーマの整形
        let themeText = '';
        if (this.themeSettings) {
            themeText = this.themeSettings.description || '';
        }

        return {
            worldSettings: worldSettingsText || '基本的な物語世界',
            theme: themeText || '成長と冒険',
            worldSettingsDetailed: this.worldSettings || undefined,
            themeSettingsDetailed: this.themeSettings || undefined
        };
    }

    /**
     * 強制的に設定を再読み込みします
     */
    async reload(): Promise<void> {
        this.initialized = false;
        this.worldSettings = null;
        this.themeSettings = null;
        await this.initialize();
    }
}