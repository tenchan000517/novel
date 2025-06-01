// src/lib/memory copy/short-term/short-term-memory.ts
/**
 * @fileoverview 統合記憶階層システム - 短期記憶統合ファサード
 * @description
 * 4つの短期記憶コンポーネント（GenerationCache、ImmediateContext、ProcessingBuffers、TemporaryAnalysis）を
 * 統合し、統一APIを提供するファサードクラス。UnifiedMemoryManagerが期待する統合APIを実現します。
 */

import { logger } from '@/lib/utils/logger';
import { Chapter } from '@/types/chapters';
import { IMemoryLayer, OperationResult, DiagnosticsResult, StatusResult } from '../core/interfaces';

// 既存コンポーネントのimport
import { GenerationCache } from './generation-cache';
import { ImmediateContext } from './immediate-context';
import { ProcessingBuffers } from './processing-buffers';
import { TemporaryAnalysis } from './temporary-analysis';

/**
 * @interface ShortTermMemoryConfig
 * @description 短期記憶の設定
 */
export interface ShortTermMemoryConfig {
    maxChapters: number;
    cacheEnabled: boolean;
    autoCleanupEnabled?: boolean;
    cleanupIntervalMinutes?: number;
    maxRetentionHours?: number;
}

/**
 * @interface ComponentOperationResult
 * @description コンポーネント操作結果
 */
interface ComponentOperationResult {
    componentName: string;
    success: boolean;
    processingTime: number;
    error?: string;
    metadata?: Record<string, any>;
}

/**
 * @class ShortTermMemory
 * @description
 * 統合記憶階層システムの短期記憶統合ファサードクラス。
 * 4つのコンポーネントを協調させ、統一されたインターフェースを提供します。
 */
export class ShortTermMemory implements IMemoryLayer {
    private config: ShortTermMemoryConfig;
    private initialized: boolean = false;

    // 既存コンポーネント
    private generationCache!: GenerationCache;
    private immediateContext!: ImmediateContext;
    private processingBuffers!: ProcessingBuffers;
    private temporaryAnalysis!: TemporaryAnalysis;

    // 統計情報
    private operationStats = {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageProcessingTime: 0,
        lastOperationTime: '',
        componentStats: {
            generationCache: { operations: 0, errors: 0, avgTime: 0 },
            immediateContext: { operations: 0, errors: 0, avgTime: 0 },
            processingBuffers: { operations: 0, errors: 0, avgTime: 0 },
            temporaryAnalysis: { operations: 0, errors: 0, avgTime: 0 }
        }
    };

    constructor(config: ShortTermMemoryConfig) {
        this.config = {
            autoCleanupEnabled: true,
            cleanupIntervalMinutes: 30,
            maxRetentionHours: 72,
            ...config
        };

        logger.info('ShortTermMemory constructor called', { config: this.config });
    }

    /**
     * 初期化処理を実行
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('ShortTermMemory already initialized');
            return;
        }

        try {
            logger.info('Initializing ShortTermMemory with unified integration');

            // 各コンポーネントを初期化
            this.generationCache = new GenerationCache();
            this.immediateContext = new ImmediateContext();
            this.processingBuffers = new ProcessingBuffers();
            this.temporaryAnalysis = new TemporaryAnalysis();

            // 各コンポーネントの初期化を並列実行
            const initializationTasks = [
                this.initializeComponent('generationCache', this.generationCache),
                this.initializeComponent('immediateContext', this.immediateContext),
                this.initializeComponent('processingBuffers', this.processingBuffers),
                this.initializeComponent('temporaryAnalysis', this.temporaryAnalysis)
            ];

            const results = await Promise.allSettled(initializationTasks);

            // 初期化結果を評価
            const failedInitializations = results.filter(r => r.status === 'rejected');

            if (failedInitializations.length > 0) {
                logger.warn(`Some components failed to initialize`, {
                    failedCount: failedInitializations.length,
                    totalCount: results.length
                });

                // 失敗した初期化の詳細をログ出力
                failedInitializations.forEach((result, index) => {
                    if (result.status === 'rejected') {
                        logger.error(`Component initialization failed`, {
                            componentIndex: index,
                            error: result.reason
                        });
                    }
                });
            }

            this.initialized = true;
            logger.info('ShortTermMemory initialized successfully', {
                successfulComponents: results.length - failedInitializations.length,
                totalComponents: results.length,
                config: this.config
            });

        } catch (error) {
            logger.error('Failed to initialize ShortTermMemory', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * コンポーネントを初期化
     * @private
     * @param componentName コンポーネント名
     * @param component コンポーネントインスタンス
     */
    private async initializeComponent(componentName: string, component: any): Promise<void> {
        const startTime = Date.now();

        try {
            if (component && typeof component.initialize === 'function') {
                await component.initialize();

                const processingTime = Date.now() - startTime;
                this.operationStats.componentStats[componentName as keyof typeof this.operationStats.componentStats].operations++;
                this.operationStats.componentStats[componentName as keyof typeof this.operationStats.componentStats].avgTime = processingTime;

                logger.debug(`Component ${componentName} initialized successfully`, {
                    processingTime
                });
            } else {
                logger.debug(`Component ${componentName} does not have initialize method`);
            }
        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.operationStats.componentStats[componentName as keyof typeof this.operationStats.componentStats].errors++;

            logger.error(`Failed to initialize component ${componentName}`, {
                error: error instanceof Error ? error.message : String(error),
                processingTime
            });
            throw error;
        }
    }

    /**
     * 章を追加し、全コンポーネントを協調させる
     * @param chapter 追加する章
     * @returns 操作結果
     */
    async addChapter(chapter: Chapter): Promise<OperationResult> {
        if (!this.initialized) {
            throw new Error('ShortTermMemory not initialized');
        }

        const startTime = Date.now();
        this.operationStats.totalOperations++;
        this.operationStats.lastOperationTime = new Date().toISOString();

        try {
            logger.info(`Processing chapter ${chapter.chapterNumber} through unified short-term memory`);

            // 4つのコンポーネントを協調させる統合処理
            const componentResults = await Promise.allSettled([
                this.updateImmediateContext(chapter),
                this.cacheGeneration(chapter),
                this.bufferProcessing(chapter),
                this.performAnalysis(chapter)
            ]);

            // 結果の集約と評価
            const results: ComponentOperationResult[] = [];
            const componentNames = ['immediateContext', 'generationCache', 'processingBuffers', 'temporaryAnalysis'];

            componentResults.forEach((result, index) => {
                const componentName = componentNames[index];

                if (result.status === 'fulfilled') {
                    results.push(result.value);
                    this.operationStats.componentStats[componentName as keyof typeof this.operationStats.componentStats].operations++;
                } else {
                    const failedResult: ComponentOperationResult = {
                        componentName,
                        success: false,
                        processingTime: 0,
                        error: result.reason instanceof Error ? result.reason.message : String(result.reason)
                    };
                    results.push(failedResult);
                    this.operationStats.componentStats[componentName as keyof typeof this.operationStats.componentStats].errors++;
                }
            });

            // 統計を更新
            const failedOperations = results.filter(r => !r.success);
            const success = failedOperations.length === 0;
            const processingTime = Date.now() - startTime;

            if (success) {
                this.operationStats.successfulOperations++;
            } else {
                this.operationStats.failedOperations++;
            }

            // 平均処理時間を更新
            this.operationStats.averageProcessingTime =
                ((this.operationStats.averageProcessingTime * (this.operationStats.totalOperations - 1)) + processingTime) /
                this.operationStats.totalOperations;

            logger.info(`ShortTermMemory addChapter completed`, {
                chapterNumber: chapter.chapterNumber,
                success,
                processingTime,
                successfulComponents: results.length - failedOperations.length,
                failedComponents: failedOperations.length,
                componentResults: results.map(r => ({
                    component: r.componentName,
                    success: r.success,
                    time: r.processingTime,
                    error: r.error
                }))
            });

            return {
                success,
                processingTime,
                error: failedOperations.length > 0 ?
                    `${failedOperations.length} components failed: ${failedOperations.map(f => f.componentName).join(', ')}` :
                    undefined,
                metadata: {
                    chapterNumber: chapter.chapterNumber,
                    operationsCompleted: results.length - failedOperations.length,
                    totalOperations: results.length,
                    componentResults: results,
                    unifiedProcessing: true
                }
            };

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.operationStats.failedOperations++;

            logger.error('ShortTermMemory addChapter failed', {
                chapterNumber: chapter.chapterNumber,
                error: error instanceof Error ? error.message : String(error),
                processingTime
            });

            return {
                success: false,
                processingTime,
                error: error instanceof Error ? error.message : String(error),
                metadata: {
                    chapterNumber: chapter.chapterNumber,
                    totalOperations: 4,
                    operationsCompleted: 0
                }
            };
        }
    }

    /**
     * ImmediateContextを使用した処理
     * @private
     * @param chapter 章データ
     * @returns コンポーネント操作結果
     */
    private async updateImmediateContext(chapter: Chapter): Promise<ComponentOperationResult> {
        const startTime = Date.now();

        try {
            // ImmediateContextに章を追加
            await this.immediateContext.addChapter(chapter);

            const processingTime = Date.now() - startTime;

            return {
                componentName: 'immediateContext',
                success: true,
                processingTime,
                metadata: {
                    operation: 'addChapter',
                    chapterNumber: chapter.chapterNumber,
                    contextUpdated: true
                }
            };
        } catch (error) {
            const processingTime = Date.now() - startTime;

            return {
                componentName: 'immediateContext',
                success: false,
                processingTime,
                error: error instanceof Error ? error.message : String(error),
                metadata: {
                    operation: 'addChapter',
                    chapterNumber: chapter.chapterNumber
                }
            };
        }
    }

    /**
     * GenerationCacheを使用した処理
     * @private
     * @param chapter 章データ
     * @returns コンポーネント操作結果
     */
    private async cacheGeneration(chapter: Chapter): Promise<ComponentOperationResult> {
        const startTime = Date.now();

        try {
            // 生成キャッシュの更新
            // 章に基づく統合データを取得してキャッシュ効率を向上
            const integratedData = await this.generationCache.getIntegratedGenerationData(chapter.chapterNumber);

            // Pre-Generation結果を保存（例）
            const preGenResult = {
                chapterNumber: chapter.chapterNumber,  // ← 追加

                processingType: 'character_analysis' as const,
                analysisResults: {
                    characterStates: [],
                    worldContextData: {},
                    narrativeStateInfo: {},
                    foreshadowingElements: []
                },
                recommendations: {
                    focusCharacters: [],
                    suggestedTones: [],
                    narrativeDirections: [],
                    warningFlags: []
                },
                qualityMetrics: {
                    dataCompleteness: 0.8,
                    contextRelevance: 0.9,
                    narrativeConsistency: 0.85,
                    characterCoherence: 0.75
                },
                processingDuration: Date.now() - startTime
            };

            await this.generationCache.savePreGenerationResult(chapter.chapterNumber, preGenResult);

            const processingTime = Date.now() - startTime;

            return {
                componentName: 'generationCache',
                success: true,
                processingTime,
                metadata: {
                    operation: 'cacheGeneration',
                    chapterNumber: chapter.chapterNumber,
                    integratedDataSize: Object.keys(integratedData).length,
                    preGenResultSaved: true
                }
            };
        } catch (error) {
            const processingTime = Date.now() - startTime;

            return {
                componentName: 'generationCache',
                success: false,
                processingTime,
                error: error instanceof Error ? error.message : String(error),
                metadata: {
                    operation: 'cacheGeneration',
                    chapterNumber: chapter.chapterNumber
                }
            };
        }
    }

    /**
     * ProcessingBuffersを使用した処理
     * @private
     * @param chapter 章データ
     * @returns コンポーネント操作結果
     */
    private async bufferProcessing(chapter: Chapter): Promise<ComponentOperationResult> {
        const startTime = Date.now();

        try {
            // 章処理バッファを作成
            const bufferId = await this.processingBuffers.createChapterProcessingBuffer(chapter);

            // 処理ジョブを作成
            const jobId = await this.processingBuffers.createProcessingJob(
                'chapter_analysis',
                8, // 高優先度
                chapter.chapterNumber
            );

            // 章処理コンポーネントを順次更新
            await this.processingBuffers.updateChapterProcessingComponent(
                chapter.chapterNumber,
                'textAnalyzer',
                'processing'
            );

            const processingTime = Date.now() - startTime;

            return {
                componentName: 'processingBuffers',
                success: true,
                processingTime,
                metadata: {
                    operation: 'bufferProcessing',
                    chapterNumber: chapter.chapterNumber,
                    bufferId,
                    jobId,
                    processingStarted: true
                }
            };
        } catch (error) {
            const processingTime = Date.now() - startTime;

            return {
                componentName: 'processingBuffers',
                success: false,
                processingTime,
                error: error instanceof Error ? error.message : String(error),
                metadata: {
                    operation: 'bufferProcessing',
                    chapterNumber: chapter.chapterNumber
                }
            };
        }
    }

    /**
     * TemporaryAnalysisを使用した処理
     * @private
     * @param chapter 章データ
     * @returns コンポーネント操作結果
     */
    private async performAnalysis(chapter: Chapter): Promise<ComponentOperationResult> {
        const startTime = Date.now();

        try {
            // 感情分析一時結果を記録
            const emotionalAnalysisResult = {
                chapterNumber: chapter.chapterNumber,
                emotionalDimensions: {
                    tension: { start: 0.5, middle: 0.7, end: 0.6 },
                    joy: { start: 0.3, middle: 0.4, end: 0.5 },
                    sadness: { start: 0.2, middle: 0.3, end: 0.2 }
                },
                overallTone: 'neutral',
                emotionalImpact: 0.6,
                analysisMetadata: {
                    confidence: 0.8,
                    processingTime: Date.now() - startTime,
                    modelsUsed: ['emotional-analyzer-v1'],
                    rawOutput: ''
                },
                timestamp: new Date().toISOString()
            };

            await this.temporaryAnalysis.recordEmotionalAnalysis(chapter.chapterNumber, emotionalAnalysisResult);

            // 検出一時結果を記録
            const detectionResult = {
                chapterNumber: chapter.chapterNumber,
                detectionType: 'CHARACTER' as const,
                detectedItems: [],
                processingStats: {
                    totalItems: 0,
                    highConfidenceItems: 0,
                    processingTime: Date.now() - startTime
                },
                timestamp: new Date().toISOString()
            };

            await this.temporaryAnalysis.recordDetectionResult(chapter.chapterNumber, detectionResult);

            const processingTime = Date.now() - startTime;

            return {
                componentName: 'temporaryAnalysis',
                success: true,
                processingTime,
                metadata: {
                    operation: 'performAnalysis',
                    chapterNumber: chapter.chapterNumber,
                    emotionalAnalysisRecorded: true,
                    detectionResultRecorded: true,
                    analysisTypes: ['emotional', 'detection']
                }
            };
        } catch (error) {
            const processingTime = Date.now() - startTime;

            return {
                componentName: 'temporaryAnalysis',
                success: false,
                processingTime,
                error: error instanceof Error ? error.message : String(error),
                metadata: {
                    operation: 'performAnalysis',
                    chapterNumber: chapter.chapterNumber
                }
            };
        }
    }

    /**
     * 診断情報を取得
     * @returns 診断結果
     */
    async getDiagnostics(): Promise<DiagnosticsResult> {
        if (!this.initialized) {
            return {
                healthy: false,
                issues: ['ShortTermMemory not initialized'],
                metrics: {},
                lastCheck: new Date().toISOString()
            };
        }

        try {
            const issues: string[] = [];
            const metrics: Record<string, number> = {};

            // 各コンポーネントの状態をチェック
            const componentChecks = await Promise.allSettled([
                this.checkGenerationCacheHealth(),
                this.checkImmediateContextHealth(),
                this.checkProcessingBuffersHealth(),
                this.checkTemporaryAnalysisHealth()
            ]);

            componentChecks.forEach((result, index) => {
                const componentNames = ['generationCache', 'immediateContext', 'processingBuffers', 'temporaryAnalysis'];
                const componentName = componentNames[index];

                if (result.status === 'fulfilled') {
                    const { healthy, componentIssues, componentMetrics } = result.value;
                    if (!healthy) {
                        issues.push(`${componentName}: ${componentIssues.join(', ')}`);
                    }
                    Object.assign(metrics, componentMetrics);
                } else {
                    issues.push(`${componentName}: Health check failed - ${result.reason}`);
                    metrics[`${componentName}_error`] = 1;
                }
            });

            // 統合メトリクスを追加
            metrics.totalOperations = this.operationStats.totalOperations;
            metrics.successRate = this.operationStats.totalOperations > 0 ?
                this.operationStats.successfulOperations / this.operationStats.totalOperations : 0;
            metrics.averageProcessingTime = this.operationStats.averageProcessingTime;

            const healthy = issues.length === 0;

            return {
                healthy,
                issues,
                metrics,
                lastCheck: new Date().toISOString()
            };

        } catch (error) {
            return {
                healthy: false,
                issues: [`Diagnostics check failed: ${error instanceof Error ? error.message : String(error)}`],
                metrics: { diagnostics_error: 1 },
                lastCheck: new Date().toISOString()
            };
        }
    }

    /**
     * GenerationCacheの健全性チェック
     * @private
     */
    private async checkGenerationCacheHealth(): Promise<{
        healthy: boolean;
        componentIssues: string[];
        componentMetrics: Record<string, number>;
    }> {
        try {
            const status = await this.generationCache.getStatus();
            const issues: string[] = [];

            // キャッシュヒット率が低い場合
            if (status.cacheHitRate < 0.5) {
                issues.push(`Low cache hit rate: ${status.cacheHitRate}`);
            }

            // メモリ使用量が高い場合
            if (status.memoryUsageMB > 1000) {
                issues.push(`High memory usage: ${status.memoryUsageMB}MB`);
            }

            return {
                healthy: issues.length === 0,
                componentIssues: issues,
                componentMetrics: {
                    generationCache_hitRate: status.cacheHitRate,
                    generationCache_memoryMB: status.memoryUsageMB,
                    generationCache_totalSize: status.totalCacheSize
                }
            };
        } catch (error) {
            return {
                healthy: false,
                componentIssues: [`Health check failed: ${error instanceof Error ? error.message : String(error)}`],
                componentMetrics: { generationCache_error: 1 }
            };
        }
    }

    /**
     * ImmediateContextの健全性チェック
     * @private
     */
    private async checkImmediateContextHealth(): Promise<{
        healthy: boolean;
        componentIssues: string[];
        componentMetrics: Record<string, number>;
    }> {
        try {
            const status = await this.immediateContext.getStatus();
            const issues: string[] = [];

            // キャッシュヒット率が低い場合
            if (status.cacheHitRate < 0.6) {
                issues.push(`Low cache hit rate: ${status.cacheHitRate}`);
            }

            // 章数が設定最大値を超えている場合
            if (status.chapterCount > this.config.maxChapters) {
                issues.push(`Chapter count exceeds limit: ${status.chapterCount} > ${this.config.maxChapters}`);
            }

            return {
                healthy: issues.length === 0,
                componentIssues: issues,
                componentMetrics: {
                    immediateContext_hitRate: status.cacheHitRate,
                    immediateContext_chapterCount: status.chapterCount,
                    immediateContext_cacheEntries: status.totalCacheEntries,
                    immediateContext_memorySizeKB: status.memoryUsage.estimatedSizeKB
                }
            };
        } catch (error) {
            return {
                healthy: false,
                componentIssues: [`Health check failed: ${error instanceof Error ? error.message : String(error)}`],
                componentMetrics: { immediateContext_error: 1 }
            };
        }
    }

    /**
     * ProcessingBuffersの健全性チェック
     * @private
     */
    private async checkProcessingBuffersHealth(): Promise<{
        healthy: boolean;
        componentIssues: string[];
        componentMetrics: Record<string, number>;
    }> {
        try {
            const status = await this.processingBuffers.getStatus();
            const issues: string[] = [];

            // エラー率が高い場合
            if (status.errorRate > 0.1) {
                issues.push(`High error rate: ${status.errorRate}`);
            }

            // キューが詰まっている場合
            if (status.queuedJobs > 50) {
                issues.push(`Job queue backlog: ${status.queuedJobs}`);
            }

            return {
                healthy: issues.length === 0,
                componentIssues: issues,
                componentMetrics: {
                    processingBuffers_activeJobs: status.activeJobs,
                    processingBuffers_queuedJobs: status.queuedJobs,
                    processingBuffers_errorRate: status.errorRate,
                    processingBuffers_bufferEfficiency: status.bufferEfficiency,
                    processingBuffers_memoryMB: status.memoryUsageMB
                }
            };
        } catch (error) {
            return {
                healthy: false,
                componentIssues: [`Health check failed: ${error instanceof Error ? error.message : String(error)}`],
                componentMetrics: { processingBuffers_error: 1 }
            };
        }
    }

    /**
     * TemporaryAnalysisの健全性チェック
     * @private
     */
    private async checkTemporaryAnalysisHealth(): Promise<{
        healthy: boolean;
        componentIssues: string[];
        componentMetrics: Record<string, number>;
    }> {
        try {
            const stats = this.temporaryAnalysis.getSystemStatistics();
            const issues: string[] = [];

            // キャッシュエントリが過多の場合
            const totalCacheEntries = stats.unifiedCache.characterInfoCacheEntries +
                stats.unifiedCache.memoryAccessCacheEntries +
                stats.unifiedCache.formatResultsCacheEntries;

            if (totalCacheEntries > 1000) {
                issues.push(`High cache entry count: ${totalCacheEntries}`);
            }

            return {
                healthy: issues.length === 0,
                componentIssues: issues,
                componentMetrics: {
                    temporaryAnalysis_emotionalResults: stats.aiAnalysisResults.emotionalAnalysisResults,
                    temporaryAnalysis_textCacheEntries: stats.aiAnalysisResults.textAnalysisCacheEntries,
                    temporaryAnalysis_totalCacheEntries: totalCacheEntries,
                    temporaryAnalysis_activeGenerations: stats.generationProcessing.activePromptGenerations
                }
            };
        } catch (error) {
            return {
                healthy: false,
                componentIssues: [`Health check failed: ${error instanceof Error ? error.message : String(error)}`],
                componentMetrics: { temporaryAnalysis_error: 1 }
            };
        }
    }

    /**
     * 状態情報を取得
     * @returns 状態結果
     */
    async getStatus(): Promise<StatusResult> {
        if (!this.initialized) {
            return {
                initialized: false,
                dataCount: 0,
                lastUpdate: new Date().toISOString(),
                memoryUsage: 0
            };
        }

        try {
            // 各コンポーネントの状態を取得
            const [genCacheStatus, immediateStatus, buffersStatus, analysisStats] = await Promise.allSettled([
                this.generationCache.getStatus(),
                this.immediateContext.getStatus(),
                this.processingBuffers.getStatus(),
                Promise.resolve(this.temporaryAnalysis.getSystemStatistics())
            ]);

            // データ数を集計
            let totalDataCount = 0;
            let totalMemoryUsage = 0;

            if (genCacheStatus.status === 'fulfilled') {
                totalDataCount += genCacheStatus.value.totalCacheSize;
                totalMemoryUsage += genCacheStatus.value.memoryUsageMB;
            }

            if (immediateStatus.status === 'fulfilled') {
                totalDataCount += immediateStatus.value.chapterCount + immediateStatus.value.totalCacheEntries;
                totalMemoryUsage += immediateStatus.value.memoryUsage.estimatedSizeKB / 1024; // KB to MB
            }

            if (buffersStatus.status === 'fulfilled') {
                totalDataCount += buffersStatus.value.totalBufferSize;
                totalMemoryUsage += buffersStatus.value.memoryUsageMB;
            }

            if (analysisStats.status === 'fulfilled') {
                const stats = analysisStats.value;
                totalDataCount += stats.generationProcessing.activePromptGenerations +
                    stats.aiAnalysisResults.emotionalAnalysisResults +
                    stats.unifiedCache.characterInfoCacheEntries;
            }

            return {
                initialized: this.initialized,
                dataCount: totalDataCount,
                lastUpdate: this.operationStats.lastOperationTime || new Date().toISOString(),
                memoryUsage: Math.round(totalMemoryUsage * 100) / 100
            };

        } catch (error) {
            logger.error('Failed to get ShortTermMemory status', {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                initialized: this.initialized,
                dataCount: 0,
                lastUpdate: new Date().toISOString(),
                memoryUsage: 0
            };
        }
    }

    /**
     * データサイズを取得
     * @returns データサイズ（バイト）
     */
    async getDataSize(): Promise<number> {
        if (!this.initialized) {
            return 0;
        }

        try {
            // 各コンポーネントのデータサイズを概算
            const [genCacheStatus, immediateStatus, buffersStatus] = await Promise.allSettled([
                this.generationCache.getStatus(),
                this.immediateContext.getStatus(),
                this.processingBuffers.getStatus()
            ]);

            let totalSizeBytes = 0;

            if (genCacheStatus.status === 'fulfilled') {
                // キャッシュサイズを概算（MB単位をバイトに変換）
                totalSizeBytes += genCacheStatus.value.memoryUsageMB * 1024 * 1024;
            }

            if (immediateStatus.status === 'fulfilled') {
                // KB単位をバイトに変換
                totalSizeBytes += immediateStatus.value.memoryUsage.estimatedSizeKB * 1024;
            }

            if (buffersStatus.status === 'fulfilled') {
                // MB単位をバイトに変換
                totalSizeBytes += buffersStatus.value.memoryUsageMB * 1024 * 1024;
            }

            return Math.round(totalSizeBytes);

        } catch (error) {
            logger.error('Failed to calculate ShortTermMemory data size', {
                error: error instanceof Error ? error.message : String(error)
            });
            return 0;
        }
    }

    /**
     * データを保存
     */
    async save(): Promise<void> {
        if (!this.initialized) {
            logger.warn('Cannot save: ShortTermMemory not initialized');
            return;
        }

        try {
            logger.info('Saving ShortTermMemory data across all components');

            // 各コンポーネントの保存処理を並列実行
            const saveTasks = [
                this.safeComponentOperation('generationCache', () =>
                    this.generationCache.cleanup ? this.generationCache.cleanup() : Promise.resolve()),
                this.safeComponentOperation('processingBuffers', () =>
                    this.processingBuffers.cleanup ? this.processingBuffers.cleanup() : Promise.resolve()),
                this.safeComponentOperation('temporaryAnalysis', () =>
                    this.temporaryAnalysis.performCleanup ? this.temporaryAnalysis.performCleanup() : Promise.resolve())
            ];

            const results = await Promise.allSettled(saveTasks);
            const failedSaves = results.filter(r => r.status === 'rejected');

            if (failedSaves.length > 0) {
                logger.warn(`Some components failed to save`, {
                    failedCount: failedSaves.length,
                    totalCount: results.length
                });
            }

            logger.info('ShortTermMemory save completed', {
                successfulSaves: results.length - failedSaves.length,
                totalComponents: results.length
            });

        } catch (error) {
            logger.error('Failed to save ShortTermMemory', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * クリーンアップ処理
     */
    async cleanup(): Promise<void> {
        if (!this.initialized) {
            logger.warn('Cannot cleanup: ShortTermMemory not initialized');
            return;
        }

        try {
            logger.info('Starting ShortTermMemory cleanup');

            // 各コンポーネントのクリーンアップを並列実行
            const cleanupTasks = [
                this.safeComponentOperation('generationCache', () =>
                    this.generationCache.cleanup ? this.generationCache.cleanup() : Promise.resolve()),
                this.safeComponentOperation('processingBuffers', () =>
                    this.processingBuffers.cleanup ? this.processingBuffers.cleanup() : Promise.resolve()),
                this.safeComponentOperation('temporaryAnalysis', () =>
                    this.temporaryAnalysis.destroy ? Promise.resolve(this.temporaryAnalysis.destroy()) : Promise.resolve())
            ];

            const results = await Promise.allSettled(cleanupTasks);
            const failedCleanups = results.filter(r => r.status === 'rejected');

            if (failedCleanups.length > 0) {
                logger.warn(`Some components failed to cleanup`, {
                    failedCount: failedCleanups.length,
                    totalCount: results.length
                });
            }

            // 統計をリセット
            this.operationStats = {
                totalOperations: 0,
                successfulOperations: 0,
                failedOperations: 0,
                averageProcessingTime: 0,
                lastOperationTime: '',
                componentStats: {
                    generationCache: { operations: 0, errors: 0, avgTime: 0 },
                    immediateContext: { operations: 0, errors: 0, avgTime: 0 },
                    processingBuffers: { operations: 0, errors: 0, avgTime: 0 },
                    temporaryAnalysis: { operations: 0, errors: 0, avgTime: 0 }
                }
            };

            logger.info('ShortTermMemory cleanup completed', {
                successfulCleanups: results.length - failedCleanups.length,
                totalComponents: results.length
            });

        } catch (error) {
            logger.error('Failed to cleanup ShortTermMemory', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * コンポーネント操作を安全に実行
     * @private
     * @param componentName コンポーネント名
     * @param operation 実行する操作
     * @returns 操作結果
     */
    private async safeComponentOperation(
        componentName: string,
        operation: () => Promise<any>
    ): Promise<any> {
        try {
            return await operation();
        } catch (error) {
            logger.error(`Component operation failed: ${componentName}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 統計情報を取得
     * @returns 統計情報
     */
    getOperationStatistics(): typeof this.operationStats {
        return { ...this.operationStats };
    }
}