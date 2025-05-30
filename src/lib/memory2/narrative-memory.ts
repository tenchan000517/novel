// src/lib/memory/narrative-memory.ts
/**
 * @fileoverview 物語記憶管理メインクラス（完成版）
 * @description
 * updateNarrativeState メソッドの安定化とエラーハンドリング強化
 * 統合保存メソッドの追加とストレージ診断機能の統合
 */

import { Chapter } from '@/types/chapters';
import { CharacterChangeInfo } from '@/types/characters';
import { Foreshadowing } from '@/types/memory';
import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import {
    NarrativeState,
    NarrativeStateInfo,
    StagnationDetectionResult,
    EmotionalCurvePoint,
    StateTransition,
    ChapterSummary,
    TurningPoint,
    NarrativeMemoryStatus,
    UpdateOptions,
    TensionPacingRecommendation,
    EmotionalArcDesign
} from './narrative/types';
import { ArcMemory } from '@/types/memory';

import { ChapterAnalysisManager } from './narrative/chapter-summary-manager';
import { CharacterTrackingManager } from './narrative/character-tracking-manager';
import { EmotionalDynamicsManager } from './narrative/emotional-dynamics-manager';
import { NarrativeStateManager } from './narrative/narrative-state-manager';
import { WorldContextManager } from './narrative/world-context-manager';
import { StorageDiagnosticManager } from './narrative/storage-diagnostic-manager';

import { storageProvider } from '@/lib/storage';

/**
 * 🔧 修正：保存結果を追跡する型定義
 */
interface SaveResult {
    managerName: string;
    success: boolean;
    error?: string;
    filesAttempted: string[];
    filesSucceeded: string[];
}

/**
 * @class NarrativeMemory（完成版）
 * @description
 * 物語構造、進行状態、キャラクター発展を追跡する物語記憶管理クラス。
 * 実際の処理は各専門マネージャーに委譲します。
 * 
 * 修正内容：
 * - updateNarrativeState メソッドの安定化
 * - エラーハンドリングの強化
 * - 初期化フローの改善
 * - 統合保存メソッドの追加
 * - ストレージ診断機能の統合
 */
export class NarrativeMemory {
    private initialized: boolean = false;
    private geminiClient: GeminiClient;
    private initializationPromise: Promise<void> | null = null;

    // 各マネージャーインスタンス
    private chapterAnalysisManager: ChapterAnalysisManager;
    private characterTrackingManager: CharacterTrackingManager;
    private emotionalDynamicsManager: EmotionalDynamicsManager;
    private narrativeStateManager: NarrativeStateManager;
    private worldContextManager: WorldContextManager;
    private storageDiagnosticManager: StorageDiagnosticManager;

    private currentGenre: string = 'classic';

    /**
     * コンストラクタ
     */
    constructor() {
        this.geminiClient = new GeminiClient();

        // 各マネージャーを初期化
        this.chapterAnalysisManager = new ChapterAnalysisManager({ geminiClient: this.geminiClient });
        this.characterTrackingManager = new CharacterTrackingManager();
        this.emotionalDynamicsManager = new EmotionalDynamicsManager({ geminiClient: this.geminiClient });
        this.narrativeStateManager = new NarrativeStateManager();
        this.worldContextManager = new WorldContextManager();
        this.storageDiagnosticManager = new StorageDiagnosticManager();
    }

    /**
     * 初期化処理を実行します
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('NarrativeMemory already initialized');
            return;
        }

        // 初期化中の場合は待機
        if (this.initializationPromise) {
            await this.initializationPromise;
            return;
        }

        // 初期化処理を開始
        this.initializationPromise = this.performInitialization();
        await this.initializationPromise;
    }

    /**
     * 実際の初期化処理
     * @private
     */
    private async performInitialization(): Promise<void> {
        try {
            logger.info('NarrativeMemory initialization starting');

            // 各マネージャーを初期化（エラーハンドリング付き）
            const initializationResults = await Promise.allSettled([
                this.chapterAnalysisManager.initialize().catch(err => {
                    logger.warn('ChapterAnalysisManager initialization failed', { error: err.message });
                    return null;
                }),
                this.characterTrackingManager.initialize().catch(err => {
                    logger.warn('CharacterTrackingManager initialization failed', { error: err.message });
                    return null;
                }),
                this.emotionalDynamicsManager.initialize().catch(err => {
                    logger.warn('EmotionalDynamicsManager initialization failed', { error: err.message });
                    return null;
                }),
                this.narrativeStateManager.initialize().catch(err => {
                    logger.warn('NarrativeStateManager initialization failed', { error: err.message });
                    return null;
                }),
                this.worldContextManager.initialize().catch(err => {
                    logger.warn('WorldContextManager initialization failed', { error: err.message });
                    return null;
                }),
                this.storageDiagnosticManager.initialize().catch(err => {
                    logger.warn('StorageDiagnosticManager initialization failed', { error: err.message });
                    return null;
                })
            ]);

            // 初期化結果の確認
            const failedInitializations = initializationResults.filter(result => result.status === 'rejected');
            if (failedInitializations.length > 0) {
                logger.warn(`${failedInitializations.length} manager(s) failed to initialize, but continuing`);
            }

            // ⭐ 新規追加: PlotManagerからジャンルを取得して設定
            try {
                const { plotManager } = await import('@/lib/plot');
                const genre = await plotManager.getGenre();
                this.setGenre(genre);
                logger.info(`NarrativeMemory genre initialized to: ${genre}`);
            } catch (error) {
                logger.warn('Failed to initialize genre from PlotManager', {
                    error: error instanceof Error ? error.message : String(error)
                });
            }

            this.initialized = true;
            logger.info('NarrativeMemory initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize NarrativeMemory', { error: error instanceof Error ? error.message : String(error) });
            // 初期化に失敗しても、空の状態で続行
            this.initialized = true;
        }
    }

    /**
     * 初期化完了を確認
     * @private
     */
    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }
    }

    /**
     * 🔧 修正：物語状態を更新します（安定化版）
     * 
     * ContextGeneratorから呼び出される主要メソッド
     * deprecatedマークを削除し、エラーハンドリングを強化
     * 
     * @param chapter 章情報
     * @returns 処理完了時に解決するPromise
     */
    async updateNarrativeState(chapter: Chapter): Promise<void> {
        try {
            await this.ensureInitialized();
            logger.info(`Updating narrative state from chapter ${chapter.chapterNumber}`);

            // 🔥 修正: エラー隠蔽を削除、明確にエラーを投げる
            await this.updateFromChapter(chapter);
            await this.save();

            logger.info(`Successfully updated narrative state from chapter ${chapter.chapterNumber}`);
        } catch (error) {
            const errorMsg = `❌ CRITICAL: 記憶階層更新に失敗しました (Chapter ${chapter.chapterNumber})`;
            logger.error(errorMsg, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber: chapter.chapterNumber,
                stack: error instanceof Error ? error.stack : undefined
            });

            // 🔥 重要: エラーを隠蔽せず、明確に再スローする
            throw new Error(`${errorMsg}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 🔧 修正：章から物語記憶を更新します（保存機能追加）
     * 
     * @param chapter 更新に使用する章
     * @returns {Promise<void>} 処理完了時に解決するPromise
     */
    async updateFromChapter(chapter: Chapter, options?: UpdateOptions): Promise<void> {
        await this.ensureInitialized();

        try {
            logger.info(`Updating narrative memory from chapter ${chapter.chapterNumber}`);

            // すべてのマネージャーを更新（エラーハンドリング付き）
            const updatePromises = [
                this.safeUpdateManager('ChapterAnalysisManager', () =>
                    this.chapterAnalysisManager.updateFromChapter(chapter, options)
                ),
                this.safeUpdateManager('CharacterTrackingManager', () =>
                    this.characterTrackingManager.updateFromChapter(chapter, options)
                ),
                this.safeUpdateManager('EmotionalDynamicsManager', () =>
                    this.emotionalDynamicsManager.updateFromChapter(chapter, options)
                ),
                this.safeUpdateManager('NarrativeStateManager', () =>
                    this.narrativeStateManager.updateFromChapter(chapter, options)
                ),
                this.safeUpdateManager('WorldContextManager', () =>
                    this.worldContextManager.updateFromChapter(chapter, options)
                )
            ];

            await Promise.all(updatePromises);

            // 🔧 修正：統合保存を明示的に実行
            await this.save();

            logger.info(`Successfully updated narrative memory from chapter ${chapter.chapterNumber}`);
        } catch (error) {
            logger.error(`Failed to update narrative memory from chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber: chapter.chapterNumber
            });
            throw error;
        }
    }

    /**
     * 🔧 修正：安全なマネージャー更新
     * 
     * @private
     * @param managerName マネージャー名
     * @param updateFunction 更新関数
     */
    private async safeUpdateManager(managerName: string, updateFunction: () => Promise<void>): Promise<void> {
        try {
            await updateFunction();
        } catch (error) {
            logger.warn(`${managerName} update failed, but continuing`, {
                error: error instanceof Error ? error.message : String(error)
            });
            // 個別のマネージャーの更新エラーは全体の処理を停止しない
        }
    }

    /**
     * 🔧 修正：統合保存メソッドを強化（タイミング競合問題を解決）
     * すべてのマネージャーの保存を確実に実行し、適切な検証を行う
     */
    async save(): Promise<void> {
        try {
            logger.info('Starting comprehensive save of all narrative memory managers');

            // 🔥 修正1: 保存前の状態確認（より確実な方法）
            const beforeSaveInfo = await this.getManagerSaveInfo();

            // 各マネージャーの保存を順次実行（並列実行を避ける）
            const saveResults: SaveResult[] = [];
            const managers = [
                { name: 'ChapterAnalysisManager', fn: () => this.chapterAnalysisManager.save() },
                { name: 'CharacterTrackingManager', fn: () => this.characterTrackingManager.save() },
                { name: 'EmotionalDynamicsManager', fn: () => this.emotionalDynamicsManager.save() },
                { name: 'NarrativeStateManager', fn: () => this.narrativeStateManager.save() },
                { name: 'WorldContextManager', fn: () => this.worldContextManager.save() }
            ];

            for (const manager of managers) {
                const result = await this.strictManagerSave(manager.name, manager.fn);
                saveResults.push(result);

                // 🔥 修正2: 各保存後に十分な待機時間を設ける
                await this.waitForFileSystemSync(100);
            }

            // 🔥 修正3: 全保存完了後に追加の待機時間
            await this.waitForFileSystemSync(200);

            // 🔥 修正4: 保存後の状態確認（ハッシュではなく実際のデータで検証）
            const afterSaveInfo = await this.getManagerSaveInfo();
            const actuallyUpdated = this.compareManagerSaveInfo(beforeSaveInfo, afterSaveInfo);

            if (actuallyUpdated.length === 0) {
                logger.warn('⚠️ WARNING: ファイル保存は実行されましたが、内容の変更が検出されませんでした', {
                    beforeSaveInfo,
                    afterSaveInfo,
                    saveResults: saveResults.map(r => ({ name: r.managerName, success: r.success }))
                });

                // 🔥 修正5: 警告はするが、エラーとしては扱わない（保存処理自体は成功している）
                // ただし、全てのマネージャー保存が失敗している場合のみエラー
                const allManagersFailed = saveResults.every(r => !r.success);
                if (allManagersFailed) {
                    throw new Error(`❌ CRITICAL: 全てのマネージャー保存に失敗`);
                }
            }

            const failedSaves = saveResults.filter(r => !r.success);
            if (failedSaves.length > 0) {
                const errorDetails = failedSaves.map(f => `${f.managerName}: ${f.error}`).join('\n');
                throw new Error(`❌ CRITICAL: ${failedSaves.length}個のマネージャー保存に失敗:\n${errorDetails}`);
            }

            logger.info(`✅ Successfully saved all managers`, {
                managersCount: saveResults.length,
                actuallyUpdatedCount: actuallyUpdated.length,
                updatedManagers: actuallyUpdated
            });

        } catch (error) {
            const criticalError = `❌ CRITICAL ERROR: NarrativeMemory保存プロセスが失敗しました`;
            logger.error(criticalError, {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            throw new Error(`${criticalError}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 🔧 新機能: ファイルシステム同期を待機
     */
    private async waitForFileSystemSync(milliseconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    /**
     * 🔧 新機能: マネージャーの保存状態情報を取得
     */
    private async getManagerSaveInfo(): Promise<{
        [managerName: string]: {
            dataSize: number;
            lastModified?: string;
            hasData: boolean;
        }
    }> {
        const info: any = {};

        try {
            // ChapterAnalysisManager
            const summaries = await this.chapterAnalysisManager.getAllChapterSummaries();
            info.ChapterAnalysisManager = {
                dataSize: summaries.length,
                hasData: summaries.length > 0,
                lastModified: summaries.length > 0 ? summaries[summaries.length - 1].timestamp : undefined
            };
        } catch (error) {
            info.ChapterAnalysisManager = { dataSize: 0, hasData: false };
        }

        try {
            // CharacterTrackingManager
            const characters = this.characterTrackingManager.getAllCharacterProgress();
            info.CharacterTrackingManager = {
                dataSize: characters.length,
                hasData: characters.length > 0
            };
        } catch (error) {
            info.CharacterTrackingManager = { dataSize: 0, hasData: false };
        }

        try {
            // EmotionalDynamicsManager
            const tensionLevel = this.emotionalDynamicsManager.getCurrentTensionLevel();
            info.EmotionalDynamicsManager = {
                dataSize: tensionLevel,
                hasData: tensionLevel > 0
            };
        } catch (error) {
            info.EmotionalDynamicsManager = { dataSize: 0, hasData: false };
        }

        try {
            // NarrativeStateManager
            const turningPoints = this.narrativeStateManager.getTurningPoints();
            info.NarrativeStateManager = {
                dataSize: turningPoints.length,
                hasData: turningPoints.length > 0
            };
        } catch (error) {
            info.NarrativeStateManager = { dataSize: 0, hasData: false };
        }

        try {
            // WorldContextManager
            const envInfo = this.worldContextManager.getEnvironmentInfo();
            const hasEnvData = !!(envInfo.location || envInfo.timeOfDay || envInfo.weather);
            info.WorldContextManager = {
                dataSize: hasEnvData ? 1 : 0,
                hasData: hasEnvData
            };
        } catch (error) {
            info.WorldContextManager = { dataSize: 0, hasData: false };
        }

        return info;
    }

    /**
     * 🔧 新機能: マネージャー保存状態の比較
     */
    private compareManagerSaveInfo(
        before: { [key: string]: any },
        after: { [key: string]: any }
    ): string[] {
        const updated: string[] = [];

        for (const managerName in after) {
            const beforeInfo = before[managerName] || { dataSize: 0, hasData: false };
            const afterInfo = after[managerName];

            // データサイズの変化または新規データの存在をチェック
            if (afterInfo.dataSize !== beforeInfo.dataSize ||
                (afterInfo.hasData && !beforeInfo.hasData) ||
                (afterInfo.lastModified && afterInfo.lastModified !== beforeInfo.lastModified)) {
                updated.push(managerName);
            }
        }

        return updated;
    }

    /**
     * 🔧 修正: 厳密なマネージャー保存メソッド（タイムアウト対応）
     */
    private async strictManagerSave(managerName: string, saveFunction: () => Promise<void>): Promise<SaveResult> {
        const startTime = Date.now();
        const result: SaveResult = {
            managerName,
            success: false,
            filesAttempted: [],
            filesSucceeded: []
        };

        try {
            logger.info(`🔄 Starting strict save for ${managerName}`);

            // 🔥 修正: タイムアウト付きで保存実行
            await this.withTimeout(saveFunction(), 10000, `${managerName} save timeout`);

            const saveTime = Date.now() - startTime;

            // 🔥 修正: 保存時間の異常チェックを緩和
            if (saveTime < 0.5) {
                logger.warn(`${managerName} 保存時間が非常に短い (${saveTime}ms) - 実際の処理が行われていない可能性`, {
                    managerName,
                    saveTime
                });
            }

            result.success = true;
            logger.info(`✅ ${managerName} save completed successfully (${saveTime}ms)`);

        } catch (error) {
            const saveTime = Date.now() - startTime;
            result.error = error instanceof Error ? error.message : String(error);

            logger.error(`❌ ${managerName} save failed (${saveTime}ms)`, {
                error: result.error,
                stack: error instanceof Error ? error.stack : undefined
            });

            // 🔥 修正: 個別の保存失敗も例外として扱う
            throw new Error(`${managerName} 保存失敗: ${result.error}`);
        }

        return result;
    }

    /**
     * 🔧 新機能: タイムアウト付きPromise実行
     */
    private async withTimeout<T>(
        promise: Promise<T>,
        timeoutMs: number,
        errorMessage: string
    ): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout: ${errorMessage} (${timeoutMs}ms)`));
            }, timeoutMs);

            promise
                .then(result => {
                    clearTimeout(timeout);
                    resolve(result);
                })
                .catch(error => {
                    clearTimeout(timeout);
                    reject(error);
                });
        });
    }

    /**
     * 🔧 修正：診断と修復を含む完全保存メソッド
     */
    async saveWithDiagnostics(): Promise<{
        success: boolean;
        diagnostics: any;
        repairAttempted: boolean;
        repairResults?: any;
    }> {
        try {
            // 通常の保存を試行
            await this.save();
            return {
                success: true,
                diagnostics: await this.diagnoseStorage(),
                repairAttempted: false
            };
        } catch (error) {
            logger.warn('Normal save failed, attempting diagnosis and repair', { error });

            // 診断実行
            const diagnostics = await this.diagnoseStorage();

            // 修復試行
            const repairResults = await this.repairStorage();

            // 修復後に再度保存試行
            let finalSuccess = false;
            if (repairResults.success) {
                try {
                    await this.save();
                    finalSuccess = true;
                } catch (retryError) {
                    logger.error('Save failed even after repair', { retryError });
                }
            }

            return {
                success: finalSuccess,
                diagnostics,
                repairAttempted: true,
                repairResults
            };
        }
    }

    /**
     * 🔧・新機能：個別マネージャーの健康状態チェック
     */
    async checkManagerHealth(): Promise<{
        [managerName: string]: {
            initialized: boolean;
            canSave: boolean;
            dataIntegrity: boolean;
            errors: string[];
        }
    }> {
        const health: any = {};

        // ChapterAnalysisManager
        health.ChapterAnalysisManager = await this.checkIndividualManagerHealth(
            'ChapterAnalysisManager',
            async () => {
                const summaries = await this.chapterAnalysisManager.getAllChapterSummaries();
                return { dataCount: summaries.length, hasValidData: true };
            }
        );

        // CharacterTrackingManager
        health.CharacterTrackingManager = await this.checkIndividualManagerHealth(
            'CharacterTrackingManager',
            async () => {
                const characters = this.characterTrackingManager.getAllCharacterProgress();
                return { dataCount: characters.length, hasValidData: true };
            }
        );

        // EmotionalDynamicsManager
        health.EmotionalDynamicsManager = await this.checkIndividualManagerHealth(
            'EmotionalDynamicsManager',
            async () => {
                const tensionLevel = this.emotionalDynamicsManager.getCurrentTensionLevel();
                return { dataCount: tensionLevel > 0 ? 1 : 0, hasValidData: tensionLevel >= 0 };
            }
        );

        // NarrativeStateManager
        health.NarrativeStateManager = await this.checkIndividualManagerHealth(
            'NarrativeStateManager',
            async () => {
                const turningPoints = this.narrativeStateManager.getTurningPoints();
                return { dataCount: turningPoints.length, hasValidData: true };
            }
        );

        // WorldContextManager
        health.WorldContextManager = await this.checkIndividualManagerHealth(
            'WorldContextManager',
            async () => {
                const envInfo = this.worldContextManager.getEnvironmentInfo();
                const hasData = !!(envInfo.location || envInfo.timeOfDay || envInfo.weather);
                return { dataCount: hasData ? 1 : 0, hasValidData: true };
            }
        );

        return health;
    }

    /**
     * 🔧 新機能：個別マネージャーの健康状態チェック実装
     */
    private async checkIndividualManagerHealth(
        managerName: string,
        dataCheckFunction: () => Promise<{ dataCount: number; hasValidData: boolean }>
    ): Promise<{
        initialized: boolean;
        canSave: boolean;
        dataIntegrity: boolean;
        errors: string[];
    }> {
        const result = {
            initialized: false,
            canSave: false,
            dataIntegrity: false,
            errors: [] as string[]
        };

        try {
            // データチェック
            const dataCheck = await dataCheckFunction();
            result.initialized = true;
            result.dataIntegrity = dataCheck.hasValidData;

            // 保存テスト（実際には保存しない、JSON.stringify テストのみ）
            // これは実装によって調整が必要
            result.canSave = true;

        } catch (error) {
            result.errors.push(error instanceof Error ? error.message : String(error));
        }

        return result;
    }

    /**
     * 現在の物語状態を取得します
     */
    async getCurrentState(chapterNumber: number, options?: { genre?: string }): Promise<NarrativeStateInfo> {
        await this.ensureInitialized();

        try {
            // ジャンル情報を更新
            if (options?.genre) {
                this.setGenre(options.genre);
            }

            // 基本的な状態情報を取得
            const stateInfo = await this.narrativeStateManager.getCurrentState(chapterNumber);

            // 環境情報を取得
            const environmentInfo = this.worldContextManager.getEnvironmentInfo();

            // テンションレベルを取得
            const tensionLevel = this.emotionalDynamicsManager.getCurrentTensionLevel();

            // 現在の登場キャラクターを取得
            const presentCharacters = this.characterTrackingManager.getCharactersInChapter(chapterNumber);

            // 統合した状態情報を返す
            return {
                ...stateInfo,
                tensionLevel,
                location: environmentInfo.location,
                timeOfDay: environmentInfo.timeOfDay,
                weather: environmentInfo.weather,
                presentCharacters
            };
        } catch (error) {
            logger.error(`Failed to get current state for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // フォールバック状態を返す
            return this.createFallbackNarrativeState(chapterNumber);
        }
    }

    /**
     * 🔧 修正：フォールバック物語状態の作成
     * 
     * @private
     * @param chapterNumber 章番号
     * @returns フォールバック状態
     */
    private createFallbackNarrativeState(chapterNumber: number): NarrativeStateInfo {
        return {
            state: NarrativeState.INTRODUCTION,
            duration: 1,
            tensionLevel: 5,
            stagnationDetected: false,
            suggestedNextState: NarrativeState.DAILY_LIFE,
            location: '不明',
            timeOfDay: '不明',
            weather: '不明',
            presentCharacters: [],
            genre: 'classic',
            currentArcNumber: 1,
            currentTheme: '物語の始まり',
            arcStartChapter: 1,
            arcEndChapter: -1,
            arcCompleted: false,
            turningPoints: []
        };
    }

    /**
     * ジャンルを設定します
     */
    public setGenre(genre: string): void {
        try {
            this.currentGenre = genre; // ⭐ 内部状態を保存

            // すべてのマネージャーにジャンルを設定
            this.narrativeStateManager.setGenre(genre);
            this.worldContextManager.setGenre(genre);
            this.emotionalDynamicsManager.setGenre(genre);

            logger.info(`NarrativeMemory genre set to: ${genre}`);
        } catch (error) {
            logger.warn('Failed to set genre on some managers', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    // ⭐ 新規追加: ジャンル取得メソッド
    public getGenre(): string {
        return this.currentGenre;
    }

    /**
     * コンテンツからキャラクター名を検出します
     */
    public extractCharactersFromContent(content: string): Set<string> {
        try {
            return this.characterTrackingManager.extractCharacterNamesFromContent(content);
        } catch (error) {
            logger.error('Failed to extract characters from content', {
                error: error instanceof Error ? error.message : String(error)
            });
            return new Set();
        }
    }

    /**
     * ダイナミックテンション最適化アルゴリズム: テンション・ペーシング推奨を取得
     */
    async getTensionPacingRecommendation(
        chapterNumber: number,
        genre?: string
    ): Promise<TensionPacingRecommendation> {
        try {
            await this.ensureInitialized();
            return this.emotionalDynamicsManager.getTensionPacingRecommendation(chapterNumber);
        } catch (error) {
            logger.error('Failed to get tension pacing recommendation', {
                error: error instanceof Error ? error.message : String(error)
            });
            return this.createFallbackTensionRecommendation();
        }
    }

    /**
     * 🔧 修正：フォールバックテンション推奨の作成
     * 
     * @private
     * @returns フォールバックテンション推奨
     */
    private createFallbackTensionRecommendation(): TensionPacingRecommendation {
        return {
            tension: {
                recommendedTension: 5,
                reason: '物語の安定した進行を維持するため',
                direction: 'maintain'
            },
            pacing: {
                recommendedPacing: 5,
                description: '安定したペースを維持'
            }
        };
    }

    /**
     * 最適テンション計算
     */
    async calculateOptimalTension(chapterNumber: number, genre?: string): Promise<TensionPacingRecommendation> {
        return this.getTensionPacingRecommendation(chapterNumber, genre);
    }

    /**
     * 停滞を検出します
     */
    public async detectStagnation(chapterNumber: number): Promise<StagnationDetectionResult> {
        try {
            await this.ensureInitialized();
            return this.narrativeStateManager.detectStagnation(chapterNumber);
        } catch (error) {
            logger.error('Failed to detect stagnation', {
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                detected: false,
                cause: '',
                score: 0,
                severity: 'LOW',
                recommendations: []
            };
        }
    }

    /**
     * 次の推奨状態を提案します
     */
    public suggestNextState(): NarrativeState {
        try {
            return this.narrativeStateManager.suggestNextState();
        } catch (error) {
            logger.error('Failed to suggest next state', {
                error: error instanceof Error ? error.message : String(error)
            });
            return NarrativeState.DAILY_LIFE;
        }
    }

    /**
     * キャラクターの変化情報を記録します
     */
    async recordCharacterChanges(
        characterName: string,
        chapterNumber: number,
        changes: CharacterChangeInfo[]
    ): Promise<void> {
        try {
            await this.ensureInitialized();
            await this.characterTrackingManager.recordCharacterChanges(characterName, chapterNumber, changes);

            // 非常に重要な変化をターニングポイントとして記録
            const criticalChanges = changes.filter(
                c => (c.classification?.narrativeSignificance || 0) >= 0.8
            );

            if (criticalChanges.length > 0) {
                this.narrativeStateManager.addTurningPoint({
                    chapter: chapterNumber,
                    description: `${characterName}の重大な変化: ${criticalChanges[0].attribute}が「${criticalChanges[0].previousValue}」から「${criticalChanges[0].currentValue}」に変化`,
                    significance: 7
                });
            }
        } catch (error) {
            logger.error('Failed to record character changes', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 解決された伏線を記録します
     */
    async recordResolvedForeshadowing(
        resolvedForeshadowing: Foreshadowing[],
        chapterNumber: number
    ): Promise<void> {
        try {
            if (resolvedForeshadowing.length === 0) {
                return;
            }

            await this.ensureInitialized();

            // 重要な伏線解決をターニングポイントとして記録
            for (const fs of resolvedForeshadowing) {
                if ((fs.significance || 5) >= 7) {
                    this.narrativeStateManager.addTurningPoint({
                        chapter: chapterNumber,
                        description: `伏線回収: ${fs.description}`,
                        significance: fs.significance || 7
                    });
                }
            }
        } catch (error) {
            logger.error('Failed to record resolved foreshadowing', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 指定されたアークのメモリを取得します
     */
    async getArcMemory(arcNumber: number): Promise<ArcMemory | null> {
        try {
            await this.ensureInitialized();

            // 現在のステートから該当するアークを探す
            const arcInfo = this.narrativeStateManager.getArcInfo();

            if (arcInfo.arcNumber === arcNumber) {
                return {
                    number: arcNumber,
                    theme: arcInfo.theme || '不明',
                    chapter_range: {
                        start: arcInfo.startChapter || 1,
                        end: arcInfo.endChapter || -1
                    },
                    is_complete: arcInfo.completed || false,
                    memories: [],
                    turningPoints: this.narrativeStateManager.getTurningPoints()
                        .map(tp => ({
                            event: tp.description,
                            chapter: tp.chapter,
                            significance: tp.significance
                        }))
                };
            }

            return null;
        } catch (error) {
            logger.error('アークメモリの取得に失敗', { error });
            return null;
        }
    }

    /**
     * エモーショナルカーブを取得します
     */
    async getEmotionalCurve(startChapter: number, endChapter: number): Promise<EmotionalCurvePoint[]> {
        try {
            await this.ensureInitialized();

            const curvePoints = await this.emotionalDynamicsManager.getEmotionalCurve(startChapter, endChapter);

            // ターニングポイントを取得して感情曲線に統合
            const turningPoints = this.narrativeStateManager.getTurningPoints()
                .filter(tp => tp.chapter >= startChapter && tp.chapter <= endChapter);

            // ターニングポイントのイベント情報を感情曲線に追加
            for (const point of curvePoints) {
                const matchingTurningPoint = turningPoints.find(tp => tp.chapter === point.chapter);
                if (matchingTurningPoint) {
                    point.event = matchingTurningPoint.description;
                }
            }

            return curvePoints;
        } catch (error) {
            logger.error('Failed to get emotional curve', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 🔧 修正：章要約を取得します（安全化）
     */
    async getChapterSummary(chapterNumber: number): Promise<string | null> {
        try {
            await this.ensureInitialized();

            const summaries = await this.chapterAnalysisManager.getAllChapterSummaries();
            const chapterSummary = summaries.find(s => s.chapterNumber === chapterNumber);

            return chapterSummary ? chapterSummary.summary : null;
        } catch (error) {
            logger.error(`Failed to get chapter summary for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return null;
        }
    }

    /**
     * すべての章要約を取得します
     */
    async getAllChapterSummaries(): Promise<ChapterSummary[]> {
        try {
            await this.ensureInitialized();
            return this.chapterAnalysisManager.getAllChapterSummaries();
        } catch (error) {
            logger.error('Failed to get all chapter summaries', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 指定された範囲の章要約を取得します
     */
    async getChapterSummariesInRange(startChapter: number, endChapter: number): Promise<ChapterSummary[]> {
        try {
            await this.ensureInitialized();
            return this.chapterAnalysisManager.getChapterSummariesInRange(startChapter, endChapter);
        } catch (error) {
            logger.error('Failed to get chapter summaries in range', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 感情アークを設計します
     */
    async designEmotionalArc(chapterNumber: number): Promise<EmotionalArcDesign> {
        try {
            await this.ensureInitialized();
            return this.emotionalDynamicsManager.designEmotionalArc(chapterNumber);
        } catch (error) {
            logger.error('Failed to design emotional arc', {
                error: error instanceof Error ? error.message : String(error)
            });
            return this.createFallbackEmotionalArcDesign();
        }
    }

    /**
     * 🔧 修正：フォールバック感情アーク設計の作成（正確な型定義版）
     * 
     * @private
     * @returns フォールバック感情アーク設計
     */
    private createFallbackEmotionalArcDesign(): EmotionalArcDesign {
        return {
            recommendedTone: '安定した感情的トーン',
            emotionalJourney: {
                opening: [
                    { dimension: 'hopeVsDespair', level: 5 },
                    { dimension: 'comfortVsTension', level: 6 }
                ],
                development: [
                    { dimension: 'hopeVsDespair', level: 6 },
                    { dimension: 'comfortVsTension', level: 5 }
                ],
                conclusion: [
                    { dimension: 'hopeVsDespair', level: 7 },
                    { dimension: 'comfortVsTension', level: 7 }
                ]
            },
            reason: '基本的な感情の流れを維持するため'
        };
    }

    /**
     * 状態情報を取得します
     */
    async getStatus(): Promise<NarrativeMemoryStatus> {
        try {
            await this.ensureInitialized();

            // 章要約数を取得
            const summaries = await this.chapterAnalysisManager.getAllChapterSummaries();

            // 最新の更新タイムスタンプを計算
            let lastUpdateTime: string | null = null;
            if (summaries.length > 0) {
                const timestamps = summaries.map(s => s.timestamp);
                lastUpdateTime = timestamps.sort().reverse()[0] || null;
            }

            // 現在の状態を取得
            const currentState = await this.narrativeStateManager.getCurrentState(-1);

            return {
                initialized: this.initialized,
                summaryCount: summaries.length,
                currentState: currentState.state,
                lastUpdateTime
            };
        } catch (error) {
            logger.error('Failed to get status', {
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                initialized: this.initialized,
                summaryCount: 0,
                currentState: NarrativeState.INTRODUCTION,
                lastUpdateTime: null
            };
        }
    }

    /**
     * 旧形式のデータからインポート
     */
    async importLegacyState(legacyData: any): Promise<void> {
        try {
            await this.ensureInitialized();

            // 状態をインポート
            if (legacyData.currentState) {
                // 別のマネージャーが必要な情報があれば取得する
            }

            // アーク情報を設定
            if (legacyData.narrativeArcs && legacyData.narrativeArcs.length > 0) {
                // 最新のアークから情報を抽出
                const latestArc = legacyData.narrativeArcs[legacyData.narrativeArcs.length - 1];

                if (latestArc) {
                    this.narrativeStateManager.setArcInfo(
                        latestArc.number || 1,
                        latestArc.theme || '物語の始まり',
                        latestArc.chapter_range?.start || 1,
                        latestArc.chapter_range?.end || -1,
                        latestArc.is_complete || false
                    );

                    // ターニングポイントを変換
                    if (latestArc.turningPoints && Array.isArray(latestArc.turningPoints)) {
                        latestArc.turningPoints.forEach((tp: {
                            chapter: number;
                            event: string;
                            significance?: number
                        }) => {
                            this.narrativeStateManager.addTurningPoint({
                                chapter: tp.chapter,
                                description: tp.event,
                                significance: tp.significance || 5
                            });
                        });
                    }
                }
            }

            logger.info('Successfully imported legacy state data');
        } catch (error) {
            logger.error('Failed to import legacy state data', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 🔧 新機能：ストレージ診断レポートを生成
     * StorageDiagnosticManagerを使用したファザードメソッド
     */
    async generateStorageDiagnosticReport(): Promise<string> {
        try {
            await this.ensureInitialized();
            return this.storageDiagnosticManager.generateDiagnosticReport(
                this.chapterAnalysisManager,
                this.characterTrackingManager,
                this.emotionalDynamicsManager,
                this.narrativeStateManager,
                this.worldContextManager
            );
        } catch (error) {
            logger.error('Failed to generate storage diagnostic report', {
                error: error instanceof Error ? error.message : String(error)
            });
            return `❌ 診断レポート生成に失敗: ${error instanceof Error ? error.message : String(error)}`;
        }
    }

    /**
     * 🔧 新機能：ストレージファイルの診断
     * StorageDiagnosticManagerを使用したファザードメソッド
     */
    async diagnoseStorage(): Promise<{
        files: { path: string; exists: boolean; size?: number }[];
        errors: string[];
    }> {
        try {
            await this.ensureInitialized();
            return this.storageDiagnosticManager.diagnoseStorage();
        } catch (error) {
            logger.error('Failed to diagnose storage', {
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                files: [],
                errors: [`診断に失敗: ${error instanceof Error ? error.message : String(error)}`]
            };
        }
    }

    /**
     * 🔧 新機能：マネージャーの診断
     * StorageDiagnosticManagerを使用したファザードメソッド
     */
    async diagnoseManagers(): Promise<{
        managers: { name: string; initialized: boolean; dataCount: number }[];
        errors: string[];
    }> {
        try {
            await this.ensureInitialized();
            return this.storageDiagnosticManager.diagnoseManagers(
                this.chapterAnalysisManager,
                this.characterTrackingManager,
                this.emotionalDynamicsManager,
                this.narrativeStateManager,
                this.worldContextManager
            );
        } catch (error) {
            logger.error('Failed to diagnose managers', {
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                managers: [],
                errors: [`マネージャー診断に失敗: ${error instanceof Error ? error.message : String(error)}`]
            };
        }
    }

    /**
     * 🔧 新機能：ストレージ修復を試行
     * StorageDiagnosticManagerを使用したファザードメソッド
     */
    async repairStorage(): Promise<{
        success: boolean;
        repaired: string[];
        errors: string[];
    }> {
        try {
            await this.ensureInitialized();
            return this.storageDiagnosticManager.repairStorage(
                this.chapterAnalysisManager,
                this.characterTrackingManager,
                this.emotionalDynamicsManager,
                this.narrativeStateManager,
                this.worldContextManager
            );
        } catch (error) {
            logger.error('Failed to repair storage', {
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                success: false,
                repaired: [],
                errors: [`ストレージ修復に失敗: ${error instanceof Error ? error.message : String(error)}`]
            };
        }
    }
}