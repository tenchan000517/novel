import { storageProvider } from '@/lib/storage';
import * as path from 'path';
import { SystemParameters, ParameterPreset, ParameterHistory, ParameterChangeEvent } from '../../types/parameters';
import { IParameterManager } from './types';
import { DEFAULT_PARAMETERS } from './default-parameters';
import { ParameterValidator } from './parameter-validator';
import { logger } from '../utils/logger';
import { logError } from '../utils/error-handler';

/**
 * パラメータ管理システム
 * システム全体の設定パラメータを一元管理するシングルトンクラス
 */
export class ParameterManager implements IParameterManager {
    // Service Container初期化順序対応
    static dependencies: string[] = []; // Tier 4: 依存なし
    static initializationTier = 4;

    private static instance: ParameterManager;
    private currentParameters: SystemParameters;
    private presets: Map<string, ParameterPreset> = new Map();
    private history: ParameterHistory[] = [];
    private eventListeners: ((path: string, value: any) => void)[] = [];
    private initialized: boolean = false;

    // ファイルパスの定数
    private readonly BASE_DIR = 'data'; // 基本ディレクトリを追加
    private readonly CONFIG_DIR = path.join(this.BASE_DIR, 'config');
    private readonly PARAMETERS_DIR = path.join(this.BASE_DIR, 'parameters');
    private readonly TEMPLATES_DIR = path.join(this.PARAMETERS_DIR, 'templates');
    private readonly USER_CONFIG_DIR = path.join(this.PARAMETERS_DIR, 'user-configurations');
    private readonly SYSTEM_PARAMETERS_PATH = path.join(this.CONFIG_DIR, 'system-parameters.json');

    /**
     * シングルトンインスタンス取得
     * @returns ParameterManagerのシングルトンインスタンス
     */
    public static getInstance(): ParameterManager {
        if (!this.instance) {
            this.instance = new ParameterManager();
        }
        return this.instance;
    }

    /**
     * プライベートコンストラクタ（シングルトンパターン）
     */
    private constructor() {
        this.currentParameters = JSON.parse(JSON.stringify(DEFAULT_PARAMETERS));
        logger.info('ParameterManager created');
    }

    /**
     * 初期化処理
     * ディレクトリ作成、設定ファイル読み込み、プリセット読み込みを行う
     */
    public async initialize(): Promise<void> {
        if (this.initialized) {
            logger.debug('ParameterManager already initialized');
            return;
        }

        try {
            // 必要なディレクトリが存在することを確認
            await this.ensureDirectoriesExist();

            // 保存されているパラメータを読み込み
            await this.loadSavedParameters();

            // 初期化完了
            this.initialized = true;

            // プリセットを読み込み
            await this.loadPresets();

            logger.info('ParameterManager fully initialized');
        } catch (error) {
            logError(error, {}, 'Failed to initialize parameter manager');
            throw new Error('Failed to initialize parameter manager: ' + (error instanceof Error ? error.message : String(error)));
        }
    }

    /**
     * 必要なディレクトリが存在することを確認
     * 存在しない場合は作成する
     */
    private async ensureDirectoriesExist(): Promise<void> {
        try {
            const directories = [
                this.CONFIG_DIR,
                this.PARAMETERS_DIR,
                this.TEMPLATES_DIR,
                this.USER_CONFIG_DIR
            ];

            for (const dir of directories) {
                if (!(await storageProvider.directoryExists(dir))) {
                    await storageProvider.createDirectory(dir);
                    logger.info(`Created directory: ${dir}`);
                }
            }
        } catch (error) {
            logError(error, {}, 'Failed to ensure directories exist');
            throw error;
        }
    }

    /**
     * 保存されたパラメータを読み込み
     */
    private async loadSavedParameters(): Promise<void> {
        try {
            if (await storageProvider.fileExists(this.SYSTEM_PARAMETERS_PATH)) {
                const content = await storageProvider.readFile(this.SYSTEM_PARAMETERS_PATH);
                const saved = JSON.parse(content);

                // ファイルの内容を詳細にログ出力
                logger.debug(`Read system parameters file content: ${content.substring(0, 500)}...`);

                // バリデーション
                const validation = ParameterValidator.validateImport(saved);
                if (!validation.valid) {
                    logger.warn(`Invalid saved parameters: ${validation.errors.join(', ')}`);
                    logger.debug(`Validation failed for parameters: ${JSON.stringify(saved)}`);
                    return;
                }

                // 読み込み前のパラメータ値を記録
                logger.debug(`Before merge - generation parameters: ${JSON.stringify(this.currentParameters.generation || {})}`);

                this.currentParameters = this.mergeWithDefaults(saved.parameters);

                // 重要な値を明示的にログ出力
                logger.info(`Loaded saved parameters from ${this.SYSTEM_PARAMETERS_PATH}`);
                logger.debug(`After merge - generation parameters: ${JSON.stringify(this.currentParameters.generation || {})}`);

                // 特に重要な値を個別にログ出力
                if (this.currentParameters.generation) {
                    logger.info(`Loaded critical parameters - minLength: ${this.currentParameters.generation.minLength}, maxLength: ${this.currentParameters.generation.maxLength}, targetLength: ${this.currentParameters.generation.targetLength}`);
                } else {
                    logger.warn('No generation parameters found in loaded config');
                }
            } else {
                logger.info('No saved parameters found, using defaults');
                // デフォルト値をログ出力
                logger.debug(`Default parameters: ${JSON.stringify(this.currentParameters)}`);
            }
        } catch (error) {
            logError(error, {}, 'Failed to load saved parameters');
            logger.warn('Using default parameters due to load error');
            logger.debug(`Exception details: ${error instanceof Error ? error.stack : String(error)}`);
        }
    }

    /**
     * 現在のパラメータを取得
     * @returns 現在のパラメータのディープコピー
     */
    public getParameters(): SystemParameters {
        return JSON.parse(JSON.stringify(this.currentParameters));
    }

    /**
     * 指定されたファイルからパラメータを読み込む
     * @param filePath パラメータファイルのパス
     * @returns 読み込まれたパラメータ
     */
    public async loadParameters(filePath: string): Promise<SystemParameters> {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            if (!(await storageProvider.fileExists(filePath))) {
                throw new Error(`File not found: ${filePath}`);
            }

            const content = await storageProvider.readFile(filePath);
            const data = JSON.parse(content);

            // バリデーション
            const validation = ParameterValidator.validateImport(data);
            if (!validation.valid) {
                throw new Error(`Invalid parameter file: ${validation.errors.join(', ')}`);
            }

            // パラメータの適用
            this.currentParameters = this.mergeWithDefaults(data.parameters);

            // 全パラメータ変更通知
            this.notifyListeners('all', this.currentParameters);

            // 履歴に記録
            this.addToHistory({
                timestamp: new Date(),
                parameters: { ...this.currentParameters },
                description: "ファイルから読み込み",
                changeSummary: `${filePath} からパラメータを読み込みました`
            });

            logger.info(`Loaded parameters from ${filePath}`);
            return this.getParameters();
        } catch (error) {
            logError(error, { filePath }, 'Failed to load parameters from file');
            throw new Error(`パラメータの読み込みに失敗しました: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 現在のパラメータをファイルに保存
     * @param filePath 保存先ファイルパス（省略時はデフォルト）
     * @returns 保存成功時にtrue
     */
    public async saveParameters(filePath?: string): Promise<boolean> {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            const targetPath = filePath || this.SYSTEM_PARAMETERS_PATH;

            // ディレクトリが存在しない場合は作成
            const dir = path.dirname(targetPath);
            if (!(await storageProvider.directoryExists(dir))) {
                await storageProvider.createDirectory(dir);
            }

            // 保存データ作成
            const saveData = {
                version: "1.0.0",
                name: "システム設定",
                description: "システムパラメータ設定",
                lastModified: new Date().toISOString(),
                parameters: this.currentParameters
            };

            // 書き込み
            await storageProvider.writeFile(
                targetPath,
                JSON.stringify(saveData, null, 2)
            );

            // 履歴に記録
            this.addToHistory({
                timestamp: new Date(),
                parameters: { ...this.currentParameters },
                description: "手動保存",
                changeSummary: "パラメータをファイルに保存"
            });

            logger.info(`Saved parameters to ${targetPath}`);
            return true;
        } catch (error) {
            logError(error, { filePath }, 'Failed to save parameters');
            return false;
        }
    }

    /**
     * 現在のパラメータをJSON形式にエクスポート
     * @returns エクスポートされたJSONテキスト
     */
    public exportParameters(): string {
        if (!this.initialized) {
            logger.warn('Exporting parameters before initialization');
        }

        const exportData = {
            version: "1.0.0",
            name: "エクスポート設定",
            description: "エクスポートされたパラメータ",
            exportDate: new Date().toISOString(),
            parameters: this.currentParameters
        };

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * JSONテキストからパラメータをインポート
     * @param jsonContent JSONテキスト
     * @returns インポート成功時にtrue
     */
    public async importParameters(jsonContent: string): Promise<boolean> {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            const importData = JSON.parse(jsonContent);

            // バリデーション
            const validation = ParameterValidator.validateImport(importData);
            if (!validation.valid) {
                throw new Error(`Invalid import data: ${validation.errors.join(', ')}`);
            }

            // パラメータの統合（デフォルト値との結合）
            this.currentParameters = this.mergeWithDefaults(importData.parameters);

            // 全パラメータ変更通知
            this.notifyListeners('all', this.currentParameters);

            // 変更を自動保存
            await this.saveParameters();

            // 履歴に記録
            this.addToHistory({
                timestamp: new Date(),
                parameters: { ...this.currentParameters },
                description: "インポート",
                changeSummary: `${importData.name || 'Unknown'} からインポート`
            });

            logger.info('Successfully imported parameters');
            return true;
        } catch (error) {
            logError(error, {}, 'Failed to import parameters');
            return false;
        }
    }

    /**
     * 単一パラメータの値を更新
     * @param path パラメータのパス（ドット区切り）
     * @param value 新しい値
     */
    public updateParameter(path: string, value: any): void {
        try {
            if (!this.initialized) {
                logger.warn('Updating parameters before initialization');
            }

            const parts = path.split('.');
            let target = this.currentParameters as any;

            // 'all' は特殊ケース - 全パラメータの更新
            if (path === 'all' && typeof value === 'object') {
                // バリデーション
                const validation = ParameterValidator.validateStructure(value);
                if (!validation) {
                    throw new Error('Invalid parameter structure');
                }

                this.currentParameters = this.mergeWithDefaults(value);
                this.notifyListeners('all', this.currentParameters);

                // 変更イベント記録
                this.recordChange({
                    paramPath: 'all',
                    oldValue: 'previous parameters',
                    newValue: 'new parameters',
                    timestamp: new Date(),
                    source: 'USER'
                });

                return;
            }

            // ネストされたプロパティに対応
            for (let i = 0; i < parts.length - 1; i++) {
                if (!target[parts[i]]) {
                    target[parts[i]] = {};
                }
                target = target[parts[i]];
            }

            const lastPart = parts[parts.length - 1];
            const oldValue = target[lastPart];

            // 値が同じなら何もしない
            if (JSON.stringify(oldValue) === JSON.stringify(value)) {
                return;
            }

            target[lastPart] = value;

            // イベント通知
            this.notifyListeners(path, value);

            // 変更イベント記録
            this.recordChange({
                paramPath: path,
                oldValue,
                newValue: value,
                timestamp: new Date(),
                source: 'USER'
            });

            logger.info(`Updated parameter: ${path} = ${JSON.stringify(value)}`);
        } catch (error) {
            logError(error, { path, value }, 'Failed to update parameter');
            throw new Error(`パラメータの更新に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * イベントリスナー通知
     * @param path 変更されたパラメータパス
     * @param value 新しい値
     */
    private notifyListeners(path: string, value: any): void {
        this.eventListeners.forEach(listener => {
            try {
                listener(path, value);
            } catch (e) {
                logError(e, {}, 'Error in parameter change listener');
            }
        });
    }

    /**
     * パラメータ変更イベントの購読
     * @param callback 変更通知を受け取るコールバック関数
     */
    public onParameterChanged(callback: (path: string, value: any) => void): void {
        this.eventListeners.push(callback);
    }

    /**
     * パラメータ変更リスナーの削除
     * @param callback 削除するコールバック関数
     */
    public removeParameterChangedListener(callback: (path: string, value: any) => void): void {
        const index = this.eventListeners.indexOf(callback);
        if (index !== -1) {
            this.eventListeners.splice(index, 1);
        }
    }

    /**
     * すべてのパラメータをデフォルト値にリセット
     */
    public resetToDefaults(): void {
        if (!this.initialized) {
            logger.warn('Resetting parameters before initialization');
        }

        this.currentParameters = JSON.parse(JSON.stringify(DEFAULT_PARAMETERS));
        this.notifyListeners('all', this.currentParameters);

        // 履歴に記録
        this.addToHistory({
            timestamp: new Date(),
            parameters: { ...this.currentParameters },
            description: "リセット",
            changeSummary: "パラメータをデフォルト値にリセット"
        });

        logger.info('Reset parameters to defaults');
    }

    /**
     * 既存値とデフォルト値のマージ
     * @param params マージするパラメータ
     * @returns マージされたパラメータ
     */
    private mergeWithDefaults(params: Partial<SystemParameters>): SystemParameters {
        // ディープマージ実装
        const result = JSON.parse(JSON.stringify(DEFAULT_PARAMETERS));
        this.deepMerge(result, params);
        return result;
    }

    /**
     * ディープマージヘルパー
     * @param target マージ先オブジェクト
     * @param source マージ元オブジェクト
     * @returns マージ結果
     */
    private deepMerge(target: any, source: any): any {
        if (source === null || typeof source !== 'object') return source;
        if (target === null || typeof target !== 'object') return source;

        Object.keys(source).forEach(key => {
            if (source[key] instanceof Object && key in target) {
                target[key] = this.deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        });

        return target;
    }

    /**
     * 履歴追加
     * @param entry 追加する履歴エントリ
     */
    private addToHistory(entry: ParameterHistory): void {
        this.history.push(entry);

        // 履歴サイズ制限
        const maxHistory = this.currentParameters.system.maxHistoryItems || 100;
        if (this.history.length > maxHistory) {
            this.history.shift();
        }
    }

    /**
     * 変更記録
     * @param change 記録する変更イベント
     */
    private recordChange(change: ParameterChangeEvent): void {
        // 変更ログに記録
        logger.debug(`Parameter changed: ${change.paramPath} = ${JSON.stringify(change.newValue)} (was ${JSON.stringify(change.oldValue)})`);
    }

    /**
     * 指定されたプリセットを適用
     * @param presetName プリセット名
     * @returns 適用成功時にtrue
     */
    public applyPreset(presetName: string): boolean {
        try {
            if (!this.initialized) {
                logger.warn('Applying preset before initialization');
            }

            const preset = this.presets.get(presetName);
            if (!preset) {
                logger.warn(`Preset not found: ${presetName}`);
                return false;
            }

            // プリセットを適用
            this.currentParameters = JSON.parse(JSON.stringify(preset.parameters));
            this.notifyListeners('all', this.currentParameters);

            // 履歴に記録
            this.addToHistory({
                timestamp: new Date(),
                parameters: { ...this.currentParameters },
                description: "プリセット適用",
                changeSummary: `プリセット "${presetName}" を適用`
            });

            logger.info(`Applied preset: ${presetName}`);
            return true;
        } catch (error) {
            logError(error, { presetName }, 'Failed to apply preset');
            return false;
        }
    }

    /**
     * 現在のパラメータをプリセットとして保存
     * @param name プリセット名
     * @param description プリセットの説明
     * @returns 保存成功時にtrue
     */
    public async saveAsPreset(name: string, description?: string): Promise<boolean> {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            // プリセットオブジェクトの作成
            const preset: ParameterPreset = {
                id: name.toLowerCase().replace(/\s/g, '-'),
                name,
                description: description || `プリセット: ${name}`,
                createdDate: new Date(),
                lastModified: new Date(),
                parameters: JSON.parse(JSON.stringify(this.currentParameters)),
                tags: [],
                isDefault: false
            };

            // プリセットマップに追加
            this.presets.set(name, preset);

            // プリセット保存
            if (!(await storageProvider.directoryExists(this.TEMPLATES_DIR))) {
                await storageProvider.createDirectory(this.TEMPLATES_DIR);
            }

            const presetPath = path.join(this.TEMPLATES_DIR, `${preset.id}.json`);
            await storageProvider.writeFile(
                presetPath,
                JSON.stringify(preset, null, 2)
            );

            logger.info(`Saved preset: ${name} to ${presetPath}`);
            return true;
        } catch (error) {
            logError(error, { name }, 'Failed to save preset');
            return false;
        }
    }

    /**
     * 利用可能なプリセット名の一覧を取得
     * @returns プリセット名の配列
     */
    public getPresets(): string[] {
        if (!this.initialized) {
            logger.warn('Getting presets before initialization');
        }
        return Array.from(this.presets.keys());
    }

    /**
     * 利用可能なプリセットの詳細情報を取得
     * @returns プリセット情報の配列
     */
    public getPresetDetails(): ParameterPreset[] {
        if (!this.initialized) {
            logger.warn('Getting preset details before initialization');
        }
        return Array.from(this.presets.values());
    }

    /**
     * プリセット読み込み
     */
    private async loadPresets(): Promise<void> {
        try {
            if (!(await storageProvider.directoryExists(this.TEMPLATES_DIR))) {
                logger.info('Templates directory does not exist yet');
                return;
            }

            const files = await storageProvider.listFiles(this.TEMPLATES_DIR);
            let loadedCount = 0;

            for (const file of files) {
                if (file.endsWith('.json')) {
                    try {
                        const filePath = path.join(this.TEMPLATES_DIR, file);
                        const content = await storageProvider.readFile(filePath);
                        const preset = JSON.parse(content) as ParameterPreset;

                        // 日付文字列をDateオブジェクトに変換
                        preset.createdDate = new Date(preset.createdDate);
                        preset.lastModified = new Date(preset.lastModified);

                        // バリデーション
                        const validation = ParameterValidator.validateStructure(preset.parameters);
                        if (!validation) {
                            logger.warn(`Skipping invalid preset: ${file}`);
                            continue;
                        }

                        this.presets.set(preset.name, preset);
                        loadedCount++;
                    } catch (e) {
                        logError(e, { file }, 'Failed to load preset');
                    }
                }
            }

            logger.info(`Loaded ${loadedCount} parameter presets from ${this.TEMPLATES_DIR}`);

            // デフォルトプリセットが1つもない場合は標準プリセットを作成
            if (loadedCount === 0) {
                await this.createDefaultPresets();
            }
        } catch (error) {
            logError(error, {}, 'Failed to load presets');
        }
    }

    /**
     * デフォルトプリセットの作成
     * 初期状態でプリセットがない場合に呼び出される
     */
    private async createDefaultPresets(): Promise<void> {
        try {
            logger.info('Creating default parameter presets');

            // 標準プリセット
            await this.saveAsPreset('標準設定', '8000文字の標準小説生成パラメータ');

            // 高テンション設定
            const highTensionParams = JSON.parse(JSON.stringify(DEFAULT_PARAMETERS));
            highTensionParams.generation.temperature = 0.8;
            highTensionParams.plot.foreshadowingDensity = 0.8;
            highTensionParams.progression.tensionMinVariance = 0.2;

            this.currentParameters = highTensionParams;
            await this.saveAsPreset('高テンション設定', 'テンションとドラマを重視した設定');

            // 細密設定
            const detailParams = JSON.parse(JSON.stringify(DEFAULT_PARAMETERS));
            detailParams.memory.summaryDetailLevel = 9;
            detailParams.characters.characterBleedTolerance = 0.1;
            detailParams.plot.coherenceCheckFrequency = 2;

            this.currentParameters = detailParams;
            await this.saveAsPreset('細密設定', '詳細な描写と一貫性を重視した設定');

            // 初期値に戻す
            this.currentParameters = JSON.parse(JSON.stringify(DEFAULT_PARAMETERS));

            logger.info('Created 3 default parameter presets');
        } catch (error) {
            logError(error, {}, 'Failed to create default presets');
        }
    }
}

/**
 * シングルトンインスタンスをエクスポート
 */
export const parameterManager = ParameterManager.getInstance();