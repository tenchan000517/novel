/**
 * @fileoverview データ移行ツール
 * @description
 * 統合記憶階層システムのデータ移行・変換ツール。
 * バージョンアップ時のデータ移行、フォーマット変換、整合性チェック、ロールバック機能を提供します。
 */

import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { withTimeout } from '@/lib/utils/promise-utils';

/**
 * 移行状態
 */
type MigrationStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';

/**
 * データフォーマットバージョン
 */
type DataVersion = '1.0.0' | '1.1.0' | '1.2.0' | '2.0.0';

/**
 * 移行タイプ
 */
type MigrationType = 'SCHEMA_UPGRADE' | 'DATA_CONSOLIDATION' | 'FORMAT_CONVERSION' | 'STRUCTURE_REORGANIZATION';

/**
 * 移行記録
 */
interface MigrationRecord {
    id: string;
    type: MigrationType;
    fromVersion: DataVersion;
    toVersion: DataVersion;
    status: MigrationStatus;
    startedAt: Date;
    completedAt?: Date;
    duration?: number;
    description: string;
    affectedComponents: string[];
    dataProcessed: number;
    errors: string[];
    rollbackData?: any;
    checksum: string;
}

/**
 * 移行計画
 */
interface MigrationPlan {
    id: string;
    name: string;
    description: string;
    fromVersion: DataVersion;
    toVersion: DataVersion;
    steps: MigrationStep[];
    dependencies: string[];
    estimatedDuration: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    rollbackSupported: boolean;
}

/**
 * 移行ステップ
 */
interface MigrationStep {
    id: string;
    name: string;
    description: string;
    type: MigrationType;
    component: string;
    transformFunction: string;
    validation: string;
    required: boolean;
    dependsOn?: string[];
}

/**
 * 移行結果
 */
interface MigrationResult {
    success: boolean;
    migrationId: string;
    processedComponents: string[];
    failedComponents: string[];
    dataProcessed: number;
    errors: string[];
    warnings: string[];
    duration: number;
    rollbackId?: string;
}

/**
 * データ検証結果
 */
interface ValidationResult {
    valid: boolean;
    component: string;
    issues: Array<{
        type: 'ERROR' | 'WARNING' | 'INFO';
        message: string;
        field?: string;
        value?: any;
    }>;
    suggestion?: string;
}

/**
 * 移行オプション
 */
interface MigrationOptions {
    dryRun?: boolean;
    skipValidation?: boolean;
    createBackup?: boolean;
    continueOnError?: boolean;
    batchSize?: number;
    timeout?: number;
}

/**
 * @class MigrationTools
 * @description
 * 統合記憶階層システムのデータ移行・変換ツール。
 * バージョン間のデータ移行、フォーマット変換、整合性チェックを提供します。
 */
export class MigrationTools {
    private readonly MIGRATION_BASE_PATH = 'migrations';
    private readonly MIGRATION_RECORDS_FILE = 'migration-records.json';
    private readonly ROLLBACK_DATA_PATH = 'rollback-data';

    private migrationRecords: Map<string, MigrationRecord> = new Map();
    private migrationPlans: Map<string, MigrationPlan> = new Map();
    private currentMigration: string | null = null;
    private initialized: boolean = false;

    // 現在サポートされているデータバージョン
    private readonly SUPPORTED_VERSIONS: DataVersion[] = ['1.0.0', '1.1.0', '1.2.0', '2.0.0'];
    private readonly CURRENT_VERSION: DataVersion = '2.0.0';

    // データスキーマ定義
    private readonly DATA_SCHEMAS = {
        '1.0.0': {
            'immediate-context': {
                structure: 'flat',
                files: ['metadata.json', 'chapters.json'],
                format: 'simple-json'
            },
            'narrative-memory': {
                structure: 'single-file',
                files: ['narrative-state.json'],
                format: 'legacy-json'
            },
            'world-knowledge': {
                structure: 'mixed',
                files: ['world-settings.json', 'characters.json', 'foreshadowing.json'],
                format: 'mixed-json'
            }
        },
        '1.1.0': {
            'immediate-context': {
                structure: 'flat',
                files: ['metadata.json', 'chapters.json'],
                format: 'simple-json'
            },
            'narrative-memory': {
                structure: 'single-file',
                files: ['narrative-state.json'],
                format: 'legacy-json'
            },
            'world-knowledge': {
                structure: 'mixed',
                files: ['world-settings.json', 'characters.json', 'foreshadowing.json'],
                format: 'mixed-json'
            }
        },
        '1.2.0': {
            'immediate-context': {
                structure: 'enhanced',
                files: ['metadata.json', 'chapters.json', 'cache.json'],
                format: 'enhanced-json'
            },
            'narrative-memory': {
                structure: 'multi-file',
                files: ['summaries.json', 'characters.json', 'state.json'],
                format: 'structured-json'
            },
            'world-knowledge': {
                structure: 'mixed',
                files: ['world-settings.json', 'characters.json', 'foreshadowing.json'],
                format: 'mixed-json'
            }
        },
        '2.0.0': {
            'immediate-context': {
                structure: 'hierarchical',
                files: ['metadata.json', 'chapters/', 'cache/', 'processing/'],
                format: 'unified-json'
            },
            'narrative-memory': {
                structure: 'component-based',
                files: [
                    'summaries.json', 'characters.json', 'emotional-dynamics.json',
                    'state.json', 'turning-points.json', 'world-context.json'
                ],
                format: 'unified-json'
            },
            'world-knowledge': {
                structure: 'unified',
                files: ['current.json'],
                format: 'unified-json'
            }
        }
    };

    /**
     * コンストラクタ
     */
    constructor() {
        logger.info('MigrationTools initializing...');
        this.initializeMigrationPlans();
    }

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('MigrationTools already initialized');
            return;
        }

        try {
            logger.info('Initializing MigrationTools...');

            // 移行ディレクトリの作成
            await this.createMigrationStructure();

            // 移行記録の読み込み
            await this.loadMigrationRecords();

            // システムバージョンの確認
            await this.validateSystemVersion();

            this.initialized = true;
            logger.info('MigrationTools initialized successfully');

        } catch (error) {
            logger.error('Failed to initialize MigrationTools', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw new Error(`MigrationTools initialization failed: ${error}`);
        }
    }

    /**
     * システムバージョンの検出
     */
    async detectCurrentVersion(): Promise<DataVersion> {
        try {
            // 各コンポーネントのファイル構造を確認してバージョンを推定
            const versionIndicators = {
                '1.0.0': [
                    'narrative-state.json',
                    'characters.json',
                    'world-settings.json'
                ],
                '2.0.0': [
                    'narrative-memory/summaries.json',
                    'narrative-memory/emotional-dynamics.json',
                    'world-knowledge/current.json'
                ]
            };

            for (const [version, indicators] of Object.entries(versionIndicators)) {
                let matchCount = 0;
                for (const indicator of indicators) {
                    if (await storageProvider.fileExists(indicator)) {
                        matchCount++;
                    }
                }

                // 指標の70%以上が存在すればそのバージョンと判定
                if (matchCount / indicators.length >= 0.7) {
                    logger.info(`Detected data version: ${version}`);
                    return version as DataVersion;
                }
            }

            // デフォルトは最新バージョン
            logger.info('Could not detect version, assuming current version');
            return this.CURRENT_VERSION;

        } catch (error) {
            logger.error('Failed to detect current version', { error });
            return this.CURRENT_VERSION;
        }
    }

    /**
     * 移行の実行
     * @param planId 移行計画ID
     * @param options 移行オプション
     */
    async executeMigration(planId: string, options: MigrationOptions = {}): Promise<MigrationResult> {
        const migrationId = this.generateMigrationId();
        const startTime = Date.now();

        try {
            logger.info(`Starting migration: ${planId} (${migrationId})`);

            if (this.currentMigration) {
                throw new Error('Another migration is already running');
            }

            const plan = this.migrationPlans.get(planId);
            if (!plan) {
                throw new Error(`Migration plan not found: ${planId}`);
            }

            this.currentMigration = migrationId;

            // 移行記録の初期化
            const record: MigrationRecord = {
                id: migrationId,
                type: 'SCHEMA_UPGRADE',
                fromVersion: plan.fromVersion,
                toVersion: plan.toVersion,
                status: 'RUNNING',
                startedAt: new Date(),
                description: plan.description,
                affectedComponents: plan.steps.map(step => step.component),
                dataProcessed: 0,
                errors: [],
                checksum: ''
            };

            this.migrationRecords.set(migrationId, record);

            // バックアップの作成
            let rollbackId: string | undefined;
            if (options.createBackup) {
                rollbackId = await this.createRollbackBackup(migrationId);
            }

            // ドライランの場合
            if (options.dryRun) {
                const dryRunResult = await this.performDryRun(plan, options);
                record.status = 'COMPLETED';
                record.completedAt = new Date();
                record.duration = Date.now() - startTime;

                return dryRunResult;
            }

            // 実際の移行処理
            const result = await this.performMigration(plan, options);

            // 移行記録の更新
            record.status = result.success ? 'COMPLETED' : 'FAILED';
            record.completedAt = new Date();
            record.duration = Date.now() - startTime;
            record.dataProcessed = result.dataProcessed;
            record.errors = result.errors;
            record.checksum = await this.generateMigrationChecksum(migrationId);

            this.migrationRecords.set(migrationId, record);
            await this.saveMigrationRecords();

            logger.info(`Migration completed: ${migrationId}`, {
                success: result.success,
                duration: record.duration,
                dataProcessed: result.dataProcessed
            });

            return {
                ...result,
                rollbackId
            };

        } catch (error) {
            logger.error(`Migration failed: ${migrationId}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー記録の更新
            const record = this.migrationRecords.get(migrationId);
            if (record) {
                record.status = 'FAILED';
                record.completedAt = new Date();
                record.duration = Date.now() - startTime;
                record.errors.push(error instanceof Error ? error.message : String(error));
                this.migrationRecords.set(migrationId, record);
                await this.saveMigrationRecords();
            }

            return {
                success: false,
                migrationId,
                processedComponents: [],
                failedComponents: [],
                dataProcessed: 0,
                errors: [error instanceof Error ? error.message : String(error)],
                warnings: [],
                duration: Date.now() - startTime
            };

        } finally {
            this.currentMigration = null;
        }
    }

    /**
     * データの検証
     * @param component 検証対象コンポーネント
     * @param version データバージョン
     */
    async validateData(component: string, version: DataVersion): Promise<ValidationResult> {
        try {
            logger.debug(`Validating data: ${component} (version ${version})`);

            const schema = this.DATA_SCHEMAS[version]?.[component as keyof typeof this.DATA_SCHEMAS[typeof version]];
            if (!schema) {
                return {
                    valid: false,
                    component,
                    issues: [{
                        type: 'ERROR',
                        message: `Schema not found for component ${component} version ${version}`
                    }]
                };
            }

            const issues: ValidationResult['issues'] = [];

            // ファイル存在確認
            for (const file of schema.files) {
                if (!await storageProvider.fileExists(file)) {
                    issues.push({
                        type: 'WARNING',
                        message: `File not found: ${file}`,
                        field: 'file',
                        value: file
                    });
                }
            }

            // JSONファイルの構文確認
            for (const file of schema.files.filter(f => f.endsWith('.json'))) {
                if (await storageProvider.fileExists(file)) {
                    try {
                        const content = await storageProvider.readFile(file);
                        JSON.parse(content);
                    } catch (jsonError) {
                        issues.push({
                            type: 'ERROR',
                            message: `Invalid JSON in file: ${file}`,
                            field: 'json_syntax',
                            value: file
                        });
                    }
                }
            }

            // 構造特有の検証
            await this.validateComponentStructure(component, version, issues);

            return {
                valid: !issues.some(issue => issue.type === 'ERROR'),
                component,
                issues,
                suggestion: issues.length > 0 ? this.generateValidationSuggestion(issues) : undefined
            };

        } catch (error) {
            logger.error(`Data validation failed: ${component}`, { error });
            return {
                valid: false,
                component,
                issues: [{
                    type: 'ERROR',
                    message: `Validation error: ${error}`
                }]
            };
        }
    }

    /**
     * 移行のロールバック
     * @param migrationId 移行ID
     */
    async rollbackMigration(migrationId: string): Promise<boolean> {
        try {
            logger.info(`Starting rollback for migration: ${migrationId}`);

            const record = this.migrationRecords.get(migrationId);
            if (!record) {
                throw new Error(`Migration record not found: ${migrationId}`);
            }

            if (record.status !== 'COMPLETED' && record.status !== 'FAILED') {
                throw new Error(`Cannot rollback migration in status: ${record.status}`);
            }

            // ロールバックデータの確認
            const rollbackPath = `${this.ROLLBACK_DATA_PATH}/${migrationId}`;
            if (!await storageProvider.fileExists(rollbackPath)) {
                throw new Error('Rollback data not found');
            }

            // ロールバック実行
            await this.performRollback(migrationId, rollbackPath);

            // 記録の更新
            record.status = 'ROLLED_BACK';
            this.migrationRecords.set(migrationId, record);
            await this.saveMigrationRecords();

            logger.info(`Rollback completed: ${migrationId}`);
            return true;

        } catch (error) {
            logger.error(`Rollback failed: ${migrationId}`, { error });
            return false;
        }
    }

    /**
     * 移行記録の取得
     */
    async getMigrationHistory(): Promise<MigrationRecord[]> {
        try {
            const records = Array.from(this.migrationRecords.values());
            return records.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
        } catch (error) {
            logger.error('Failed to get migration history', { error });
            return [];
        }
    }

    /**
     * 利用可能な移行計画の取得
     */
    async getAvailableMigrationPlans(fromVersion?: DataVersion): Promise<MigrationPlan[]> {
        try {
            let plans = Array.from(this.migrationPlans.values());

            if (fromVersion) {
                plans = plans.filter(plan => plan.fromVersion === fromVersion);
            }

            return plans.sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            logger.error('Failed to get migration plans', { error });
            return [];
        }
    }

    /**
     * データフォーマットの変換
     * @param data 変換対象データ
     * @param fromVersion 変換元バージョン
     * @param toVersion 変換先バージョン
     * @param component コンポーネント名
     */
    async convertDataFormat(
        data: any,
        fromVersion: DataVersion,
        toVersion: DataVersion,
        component: string
    ): Promise<any> {
        try {
            logger.debug(`Converting data format: ${component} ${fromVersion} -> ${toVersion}`);

            // バージョン間の変換ルール
            const transformKey = `${fromVersion}-${toVersion}-${component}`;
            const transformer = this.getDataTransformer(transformKey);

            if (!transformer) {
                logger.warn(`No transformer found for: ${transformKey}`);
                return data; // 変換できない場合は元データを返す
            }

            const convertedData = await transformer(data);

            logger.debug(`Data conversion completed: ${component}`);
            return convertedData;

        } catch (error) {
            logger.error(`Data conversion failed: ${component}`, { error });
            throw error;
        }
    }

    /**
     * システム全体の移行ステータス取得
     */
    async getSystemMigrationStatus(): Promise<{
        currentVersion: DataVersion;
        targetVersion: DataVersion;
        pendingMigrations: string[];
        lastMigration?: MigrationRecord;
        needsMigration: boolean;
    }> {
        try {
            const currentVersion = await this.detectCurrentVersion();
            const records = Array.from(this.migrationRecords.values());
            const lastMigration = records.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0];

            const pendingMigrations = Array.from(this.migrationPlans.values())
                .filter(plan => plan.fromVersion === currentVersion && plan.toVersion !== currentVersion)
                .map(plan => plan.id);

            return {
                currentVersion,
                targetVersion: this.CURRENT_VERSION,
                pendingMigrations,
                lastMigration,
                needsMigration: currentVersion !== this.CURRENT_VERSION
            };

        } catch (error) {
            logger.error('Failed to get system migration status', { error });
            return {
                currentVersion: '1.0.0',
                targetVersion: this.CURRENT_VERSION,
                pendingMigrations: [],
                needsMigration: true
            };
        }
    }

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

    /**
     * 移行ディレクトリ構造の作成
     * @private
     */
    private async createMigrationStructure(): Promise<void> {
        const directories = [
            this.MIGRATION_BASE_PATH,
            `${this.MIGRATION_BASE_PATH}/records`,
            this.ROLLBACK_DATA_PATH,
            `${this.MIGRATION_BASE_PATH}/temp`
        ];

        for (const dir of directories) {
            await storageProvider.createDirectory(dir);
        }

        logger.debug('Migration directory structure created');
    }

    /**
     * 移行計画の初期化
     * @private
     */
    private initializeMigrationPlans(): void {
        // 1.0.0 -> 2.0.0 移行計画
        const plan_1_0_to_2_0: MigrationPlan = {
            id: 'upgrade-1.0-to-2.0',
            name: 'Upgrade to Unified Memory System v2.0',
            description: 'Migrate from legacy format to unified memory hierarchy system',
            fromVersion: '1.0.0',
            toVersion: '2.0.0',
            estimatedDuration: 30000, // 30秒
            riskLevel: 'MEDIUM',
            rollbackSupported: true,
            dependencies: [],
            steps: [
                {
                    id: 'migrate-immediate-context',
                    name: 'Migrate Immediate Context',
                    description: 'Convert flat structure to hierarchical structure',
                    type: 'STRUCTURE_REORGANIZATION',
                    component: 'immediate-context',
                    transformFunction: 'transformImmediateContext_1_0_to_2_0',
                    validation: 'validateImmediateContext_2_0',
                    required: true
                },
                {
                    id: 'migrate-narrative-memory',
                    name: 'Migrate Narrative Memory',
                    description: 'Split single file into component-based structure',
                    type: 'DATA_CONSOLIDATION',
                    component: 'narrative-memory',
                    transformFunction: 'transformNarrativeMemory_1_0_to_2_0',
                    validation: 'validateNarrativeMemory_2_0',
                    required: true,
                    dependsOn: ['migrate-immediate-context']
                },
                {
                    id: 'migrate-world-knowledge',
                    name: 'Migrate World Knowledge',
                    description: 'Consolidate multiple files into unified format',
                    type: 'FORMAT_CONVERSION',
                    component: 'world-knowledge',
                    transformFunction: 'transformWorldKnowledge_1_0_to_2_0',
                    validation: 'validateWorldKnowledge_2_0',
                    required: true,
                    dependsOn: ['migrate-narrative-memory']
                }
            ]
        };

        this.migrationPlans.set(plan_1_0_to_2_0.id, plan_1_0_to_2_0);

        logger.debug(`Initialized ${this.migrationPlans.size} migration plans`);
    }

    /**
     * 移行記録の読み込み
     * @private
     */
    private async loadMigrationRecords(): Promise<void> {
        try {
            const recordsPath = `${this.MIGRATION_BASE_PATH}/records/${this.MIGRATION_RECORDS_FILE}`;
            if (await storageProvider.fileExists(recordsPath)) {
                const content = await storageProvider.readFile(recordsPath);
                const recordsArray = JSON.parse(content) as Array<[string, any]>;

                this.migrationRecords = new Map(recordsArray.map(([id, record]) => [
                    id,
                    {
                        ...record,
                        startedAt: new Date(record.startedAt),
                        completedAt: record.completedAt ? new Date(record.completedAt) : undefined
                    }
                ]));

                logger.debug(`Loaded ${this.migrationRecords.size} migration records`);
            }
        } catch (error) {
            logger.warn('Failed to load migration records, starting fresh', { error });
            this.migrationRecords = new Map();
        }
    }

    /**
     * 移行記録の保存
     * @private
     */
    private async saveMigrationRecords(): Promise<void> {
        try {
            const recordsPath = `${this.MIGRATION_BASE_PATH}/records/${this.MIGRATION_RECORDS_FILE}`;
            const recordsArray = Array.from(this.migrationRecords.entries());
            await storageProvider.writeFile(recordsPath, JSON.stringify(recordsArray, null, 2));
            logger.debug('Migration records saved');
        } catch (error) {
            logger.error('Failed to save migration records', { error });
        }
    }

    /**
     * システムバージョンの検証
     * @private
     */
    private async validateSystemVersion(): Promise<void> {
        const currentVersion = await this.detectCurrentVersion();
        if (!this.SUPPORTED_VERSIONS.includes(currentVersion)) {
            throw new Error(`Unsupported data version: ${currentVersion}`);
        }
        logger.info(`System data version validated: ${currentVersion}`);
    }

    /**
     * 移行の実行
     * @private
     */
    private async performMigration(plan: MigrationPlan, options: MigrationOptions): Promise<MigrationResult> {
        const result: MigrationResult = {
            success: true,
            migrationId: plan.id,
            processedComponents: [],
            failedComponents: [],
            dataProcessed: 0,
            errors: [],
            warnings: [],
            duration: 0
        };

        const startTime = Date.now();

        try {
            // 依存関係の確認
            await this.validateDependencies(plan);

            // 各ステップの実行
            for (const step of plan.steps) {
                try {
                    logger.debug(`Executing migration step: ${step.name}`);

                    // 依存ステップの完了確認
                    if (step.dependsOn) {
                        for (const dependency of step.dependsOn) {
                            if (!result.processedComponents.includes(dependency)) {
                                throw new Error(`Dependency not satisfied: ${dependency}`);
                            }
                        }
                    }

                    // ステップの実行
                    const stepResult = await this.executeMigrationStep(step, options);
                    result.dataProcessed += stepResult.dataProcessed;
                    result.processedComponents.push(step.component);

                    if (stepResult.warnings.length > 0) {
                        result.warnings.push(...stepResult.warnings);
                    }

                } catch (stepError) {
                    const errorMessage = stepError instanceof Error ? stepError.message : String(stepError);
                    logger.error(`Migration step failed: ${step.name}`, { error: errorMessage });

                    result.failedComponents.push(step.component);
                    result.errors.push(`Step ${step.name}: ${errorMessage}`);

                    if (step.required && !options.continueOnError) {
                        result.success = false;
                        break;
                    }
                }
            }

            // 最終検証
            if (result.success && !options.skipValidation) {
                const validationResults = await this.validateMigrationResult(plan, result.processedComponents);
                for (const validation of validationResults) {
                    if (!validation.valid) {
                        result.errors.push(`Validation failed for ${validation.component}`);
                        result.success = false;
                    }
                }
            }

            result.duration = Date.now() - startTime;
            return result;

        } catch (error) {
            result.success = false;
            result.errors.push(error instanceof Error ? error.message : String(error));
            result.duration = Date.now() - startTime;
            return result;
        }
    }

    /**
     * ドライランの実行
     * @private
     */
    private async performDryRun(plan: MigrationPlan, options: MigrationOptions): Promise<MigrationResult> {
        logger.info(`Performing dry run for migration plan: ${plan.name}`);

        // 実際の処理は行わず、検証のみ実行
        const result: MigrationResult = {
            success: true,
            migrationId: plan.id,
            processedComponents: [],
            failedComponents: [],
            dataProcessed: 0,
            errors: [],
            warnings: ['This was a dry run - no actual changes were made'],
            duration: 0
        };

        const startTime = Date.now();

        try {
            // 各ステップの事前検証
            for (const step of plan.steps) {
                const validation = await this.validateData(step.component, plan.fromVersion);
                if (!validation.valid) {
                    result.errors.push(`Pre-validation failed for ${step.component}`);
                    result.failedComponents.push(step.component);
                } else {
                    result.processedComponents.push(step.component);
                }
            }

            result.success = result.errors.length === 0;
            result.duration = Date.now() - startTime;

            logger.info(`Dry run completed`, {
                success: result.success,
                processedComponents: result.processedComponents.length,
                failedComponents: result.failedComponents.length
            });

            return result;

        } catch (error) {
            result.success = false;
            result.errors.push(error instanceof Error ? error.message : String(error));
            result.duration = Date.now() - startTime;
            return result;
        }
    }

    /**
     * 移行ステップの実行
     * @private
     */
    private async executeMigrationStep(step: MigrationStep, options: MigrationOptions): Promise<{
        dataProcessed: number;
        warnings: string[];
    }> {
        const transformer = this.getDataTransformer(step.transformFunction);
        if (!transformer) {
            throw new Error(`Transformer not found: ${step.transformFunction}`);
        }

        let dataProcessed = 0;
        let warnings: string[] = [];

        // コンポーネントのデータを取得
        const componentData = await this.loadComponentData(step.component);
        if (!componentData) {
            warnings.push(`No data found for component: ${step.component}`);
            return { dataProcessed, warnings };
        }

        // データ変換
        const transformedData = await transformer(componentData);
        dataProcessed = this.calculateDataSize(transformedData);

        // 変換後データの保存
        await this.saveTransformedData(step.component, transformedData);

        // 検証
        const validator = this.getDataValidator(step.validation);
        if (validator) {
            const validationResult = await validator(transformedData);
            if (!validationResult.valid) {
                throw new Error(`Validation failed: ${validationResult.issues.map(i => i.message).join(', ')}`);
            }
        }

        return { dataProcessed, warnings };
    }

    /**
     * ロールバックバックアップの作成
     * @private
     */
    private async createRollbackBackup(migrationId: string): Promise<string> {
        const rollbackId = `rollback-${migrationId}`;
        const rollbackPath = `${this.ROLLBACK_DATA_PATH}/${rollbackId}`;

        try {
            await storageProvider.createDirectory(rollbackPath);

            // 全コンポーネントのバックアップ
            const components = ['immediate-context', 'narrative-memory', 'world-knowledge'];

            for (const component of components) {
                const componentData = await this.loadComponentData(component);
                if (componentData) {
                    const backupPath = `${rollbackPath}/${component}.json`;
                    await storageProvider.writeFile(backupPath, JSON.stringify(componentData, null, 2));
                }
            }

            logger.info(`Rollback backup created: ${rollbackId}`);
            return rollbackId;

        } catch (error) {
            logger.error(`Failed to create rollback backup: ${rollbackId}`, { error });
            throw error;
        }
    }

    /**
     * ロールバックの実行
     * @private
     */
    private async performRollback(migrationId: string, rollbackPath: string): Promise<void> {
        try {
            const backupFiles = await storageProvider.listFiles(rollbackPath);

            for (const backupFile of backupFiles) {
                if (backupFile.endsWith('.json')) {
                    const component = backupFile.replace('.json', '').split('/').pop();
                    if (component) {
                        const backupData = await storageProvider.readFile(backupFile);
                        const data = JSON.parse(backupData);
                        await this.saveTransformedData(component, data);
                    }
                }
            }

            logger.info(`Rollback completed: ${migrationId}`);

        } catch (error) {
            logger.error(`Rollback execution failed: ${migrationId}`, { error });
            throw error;
        }
    }

    /**
     * コンポーネントデータの読み込み
     * @private
     */
    private async loadComponentData(component: string): Promise<any> {
        try {
            // 現在のバージョンに基づいてファイルパスを決定
            const currentVersion = await this.detectCurrentVersion();
            const schema = this.DATA_SCHEMAS[currentVersion]?.[component as keyof typeof this.DATA_SCHEMAS[typeof currentVersion]];

            if (!schema) {
                return null;
            }

            let componentData: any = {};

            // 複数ファイルの場合は統合
            for (const file of schema.files) {
                if (await storageProvider.fileExists(file)) {
                    if (file.endsWith('.json')) {
                        const content = await storageProvider.readFile(file);
                        const data = JSON.parse(content);

                        // ファイル名をキーとして統合
                        const fileName = file.split('/').pop()?.replace('.json', '') || 'data';
                        componentData[fileName] = data;
                    }
                }
            }

            return Object.keys(componentData).length > 0 ? componentData : null;

        } catch (error) {
            logger.error(`Failed to load component data: ${component}`, { error });
            return null;
        }
    }

    /**
     * 変換後データの保存
     * @private
     */
    private async saveTransformedData(component: string, data: any): Promise<void> {
        try {
            // 新バージョンのスキーマに基づいて保存
            const schema = this.DATA_SCHEMAS[this.CURRENT_VERSION]?.[component as keyof typeof this.DATA_SCHEMAS[typeof this.CURRENT_VERSION]];

            if (!schema) {
                throw new Error(`Schema not found for component: ${component}`);
            }

            // 各ファイルにデータを分散保存
            for (const file of schema.files) {
                if (file.endsWith('.json')) {
                    const fileName = file.split('/').pop()?.replace('.json', '') || 'data';
                    const fileData = data[fileName] || {};

                    // ディレクトリの作成
                    const directory = file.substring(0, file.lastIndexOf('/'));
                    if (directory) {
                        await storageProvider.createDirectory(directory);
                    }

                    await storageProvider.writeFile(file, JSON.stringify(fileData, null, 2));
                }
            }

        } catch (error) {
            logger.error(`Failed to save transformed data: ${component}`, { error });
            throw error;
        }
    }

    /**
     * データ変換器の取得
     * @private
     */
    private getDataTransformer(transformerName: string): ((data: any) => Promise<any>) | null {
        const transformers: Record<string, (data: any) => Promise<any>> = {
            'transformImmediateContext_1_0_to_2_0': async (data: any) => {
                return {
                    metadata: data.metadata || {},
                    chapters: data.chapters || {},
                    cache: {},
                    processing: {}
                };
            },
            'transformNarrativeMemory_1_0_to_2_0': async (data: any) => {
                const oldData = data['narrative-state'] || {};
                return {
                    summaries: oldData.summaries || [],
                    characters: oldData.characters || {},
                    'emotional-dynamics': oldData.emotionalDynamics || {},
                    state: oldData.state || {},
                    'turning-points': oldData.turningPoints || [],
                    'world-context': oldData.worldContext || {}
                };
            },
            'transformWorldKnowledge_1_0_to_2_0': async (data: any) => {
                return {
                    current: {
                        worldSettings: data['world-settings'] || {},
                        characters: data.characters || {},
                        foreshadowing: data.foreshadowing || {},
                        establishedEvents: [],
                        lastChangeTimestamp: new Date().toISOString()
                    }
                };
            }
        };

        return transformers[transformerName] || null;
    }

    /**
     * データ検証器の取得
     * @private
     */
    private getDataValidator(validatorName: string): ((data: any) => Promise<ValidationResult>) | null {
        const validators: Record<string, (data: any) => Promise<ValidationResult>> = {
            'validateImmediateContext_2_0': async (data: any) => {
                const issues: ValidationResult['issues'] = [];

                if (!data.metadata) {
                    issues.push({ type: 'ERROR', message: 'Missing metadata' });
                }

                return {
                    valid: issues.filter(i => i.type === 'ERROR').length === 0,
                    component: 'immediate-context',
                    issues
                };
            },
            'validateNarrativeMemory_2_0': async (data: any) => {
                const issues: ValidationResult['issues'] = [];

                const requiredFields = ['summaries', 'characters', 'state'];
                for (const field of requiredFields) {
                    if (!data[field]) {
                        issues.push({ type: 'ERROR', message: `Missing required field: ${field}` });
                    }
                }

                return {
                    valid: issues.filter(i => i.type === 'ERROR').length === 0,
                    component: 'narrative-memory',
                    issues
                };
            },
            'validateWorldKnowledge_2_0': async (data: any) => {
                const issues: ValidationResult['issues'] = [];

                if (!data.current) {
                    issues.push({ type: 'ERROR', message: 'Missing current data' });
                }

                return {
                    valid: issues.filter(i => i.type === 'ERROR').length === 0,
                    component: 'world-knowledge',
                    issues
                };
            }
        };

        return validators[validatorName] || null;
    }

    /**
     * コンポーネント構造の検証
     * @private
     */
    private async validateComponentStructure(
        component: string,
        version: DataVersion,
        issues: ValidationResult['issues']
    ): Promise<void> {
        try {
            // バージョン固有の構造検証ロジック
            if (version === '2.0.0') {
                if (component === 'narrative-memory') {
                    const requiredFiles = [
                        'narrative-memory/summaries.json',
                        'narrative-memory/state.json'
                    ];

                    for (const file of requiredFiles) {
                        if (!await storageProvider.fileExists(file)) {
                            issues.push({
                                type: 'ERROR',
                                message: `Required file missing: ${file}`,
                                field: 'structure',
                                value: file
                            });
                        }
                    }
                }
            }
        } catch (error) {
            issues.push({
                type: 'ERROR',
                message: `Structure validation error: ${error}`,
                field: 'structure_validation'
            });
        }
    }

    /**
     * 検証結果の提案生成
     * @private
     */
    private generateValidationSuggestion(issues: ValidationResult['issues']): string {
        const errorCount = issues.filter(i => i.type === 'ERROR').length;
        const warningCount = issues.filter(i => i.type === 'WARNING').length;

        if (errorCount > 0) {
            return `Found ${errorCount} error(s) that must be fixed before migration. Consider running data repair or creating backup.`;
        } else if (warningCount > 0) {
            return `Found ${warningCount} warning(s). Migration can proceed but review warnings first.`;
        }

        return 'Data validation passed successfully.';
    }

    /**
     * 依存関係の検証
     * @private
     */
    private async validateDependencies(plan: MigrationPlan): Promise<void> {
        for (const dependency of plan.dependencies) {
            const dependentPlan = this.migrationPlans.get(dependency);
            if (!dependentPlan) {
                throw new Error(`Dependent migration plan not found: ${dependency}`);
            }

            // 依存する移行が完了しているかチェック
            const dependentRecords = Array.from(this.migrationRecords.values())
                .filter(record => record.id === dependency && record.status === 'COMPLETED');

            if (dependentRecords.length === 0) {
                throw new Error(`Dependent migration not completed: ${dependency}`);
            }
        }
    }

    /**
     * 移行結果の検証
     * @private
     */
    private async validateMigrationResult(
        plan: MigrationPlan,
        processedComponents: string[]
    ): Promise<ValidationResult[]> {
        const results: ValidationResult[] = [];

        for (const component of processedComponents) {
            const result = await this.validateData(component, plan.toVersion);
            results.push(result);
        }

        return results;
    }

    /**
     * データサイズの計算
     * @private
     */
    private calculateDataSize(data: any): number {
        return JSON.stringify(data).length;
    }

    /**
     * 移行チェックサムの生成
     * @private
     */
    private async generateMigrationChecksum(migrationId: string): Promise<string> {
        // 簡易的な実装
        const record = this.migrationRecords.get(migrationId);
        if (!record) return '';

        const checksumData = `${record.id}-${record.fromVersion}-${record.toVersion}-${record.dataProcessed}`;
        return this.simpleHash(checksumData);
    }

    /**
     * 簡易ハッシュ関数
     * @private
     */
    private simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * 移行IDの生成
     * @private
     */
    private generateMigrationId(): string {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        return `migration-${timestamp}-${randomSuffix}`;
    }
}

// シングルトンインスタンスをエクスポート
export const migrationTools = new MigrationTools();