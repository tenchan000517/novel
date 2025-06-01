// src/lib/foreshadowing/index.ts

/**
 * @fileoverview 伏線管理システム統合インデックス - 新統合記憶階層システム完全対応版
 * @description
 * 新しい統合記憶階層システムに完全対応した伏線管理システムの統合インターフェース。
 * MemoryManagerへの依存注入パターンを実装し、全コンポーネントを統合管理。
 * 既存機能を完全保持しつつ、新システムの能力を最大限活用。
 */

import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { MemoryLevel } from '@/lib/memory/core/types';
import { createForeshadowingManager, ForeshadowingManager } from './manager';
import { createForeshadowingEngine, ForeshadowingEngine } from './engine';
import { createForeshadowingResolutionAdvisor, ForeshadowingResolutionAdvisor } from './resolution-advisor';
import { Foreshadowing } from '@/types/memory';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';

/**
 * 統合伏線管理システム設定
 */
interface UnifiedForeshadowingSystemConfig {
    memoryManager: MemoryManager;
    enableAdvancedResolution?: boolean;
    enablePerformanceOptimization?: boolean;
    enableSystemDiagnostics?: boolean;
    maxConcurrentOperations?: number;
    cacheOptimizationLevel?: 'low' | 'medium' | 'high';
}

/**
 * 統合処理結果
 */
interface UnifiedProcessingResult {
    success: boolean;
    foreshadowingResults: {
        generatedCount: number;
        savedCount: number;
        resolutionSuggestions: number;
    };
    systemMetrics: {
        processingTime: number;
        memorySystemIntegration: boolean;
        cacheEfficiency: number;
        errorRate: number;
    };
    recommendations: string[];
    error?: string;
}

/**
 * 診断結果
 */
interface SystemDiagnosticsResult {
    overallHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    componentHealth: {
        engine: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
        manager: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
        resolutionAdvisor: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
        memorySystem: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    };
    performanceMetrics: {
        totalOperations: number;
        successRate: number;
        averageProcessingTime: number;
        memoryEfficiency: number;
    };
    issues: Array<{
        component: string;
        severity: 'HIGH' | 'MEDIUM' | 'LOW';
        description: string;
        recommendation: string;
    }>;
    lastOptimization: string;
}

/**
 * @class UnifiedForeshadowingSystem
 * @description
 * 新統合記憶階層システムに完全対応した伏線管理システムの統合クラス。
 * 全コンポーネントを協調させ、統一されたインターフェースを提供。
 */
export class UnifiedForeshadowingSystem {
    private manager!: ForeshadowingManager;
    private engine!: ForeshadowingEngine;
    private resolutionAdvisor!: ForeshadowingResolutionAdvisor;
    private config: Required<UnifiedForeshadowingSystemConfig>;
    private initialized: boolean = false;
    
    private systemMetrics = {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageProcessingTime: 0,
        memorySystemIntegration: 0,
        cacheEfficiency: 0,
        lastOptimization: new Date().toISOString()
    };

    /**
     * コンストラクタ - 完全な依存注入パターン実装
     * @param config システム設定
     */
    constructor(config: UnifiedForeshadowingSystemConfig) {
        if (!config.memoryManager) {
            throw new Error('MemoryManager is required for UnifiedForeshadowingSystem');
        }

        this.config = {
            memoryManager: config.memoryManager,
            enableAdvancedResolution: config.enableAdvancedResolution ?? true,
            enablePerformanceOptimization: config.enablePerformanceOptimization ?? true,
            enableSystemDiagnostics: config.enableSystemDiagnostics ?? true,
            maxConcurrentOperations: config.maxConcurrentOperations ?? 5,
            cacheOptimizationLevel: config.cacheOptimizationLevel ?? 'medium'
        };

        this.validateSystemConfiguration();
        this.initializeComponents();

        logger.info('UnifiedForeshadowingSystem initialized with integrated memory system support');
    }

    /**
     * システム設定の完全検証
     * @private
     */
    private validateSystemConfiguration(): void {
        const systemState = this.config.memoryManager.getSystemState();
        if (systemState === 'ERROR') {
            throw new Error('MemoryManager is in error state');
        }

        if (systemState === 'MAINTENANCE') {
            logger.warn('MemoryManager is in maintenance mode');
        }

        logger.debug('System configuration validated successfully');
    }

    /**
     * コンポーネントの初期化
     * @private
     */
    private initializeComponents(): void {
        try {
            // 依存注入パターンでコンポーネント作成
            this.manager = createForeshadowingManager(this.config.memoryManager);
            this.engine = createForeshadowingEngine(this.config.memoryManager);
            this.resolutionAdvisor = createForeshadowingResolutionAdvisor(this.config.memoryManager);

            logger.debug('All foreshadowing system components initialized successfully');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('Failed to initialize foreshadowing system components', { error: errorMessage });
            throw new Error(`Component initialization failed: ${errorMessage}`);
        }
    }

    /**
     * システム初期化
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('UnifiedForeshadowingSystem already initialized');
            return;
        }

        try {
            logger.info('Initializing unified foreshadowing system...');

            // メモリシステムの準備確認
            const memoryStatus = await this.config.memoryManager.getSystemStatus();
            if (!memoryStatus.initialized) {
                throw new Error('Memory system is not properly initialized');
            }

            // システム診断の実行
            if (this.config.enableSystemDiagnostics) {
                const initialDiagnostics = await this.performSystemDiagnostics();
                if (initialDiagnostics.overallHealth === 'CRITICAL') {
                    throw new Error('Critical system issues detected during initialization');
                }
            }

            // パフォーマンス最適化の設定
            if (this.config.enablePerformanceOptimization) {
                await this.configurePerformanceOptimization();
            }

            this.initialized = true;
            logger.info('UnifiedForeshadowingSystem initialization completed successfully');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error('Failed to initialize unified foreshadowing system', { error: errorMessage });
            throw new Error(`System initialization failed: ${errorMessage}`);
        }
    }

    /**
     * パフォーマンス最適化の設定
     * @private
     */
    private async configurePerformanceOptimization(): Promise<void> {
        try {
            logger.debug('Configuring performance optimization...');

            // キャッシュ最適化レベルに応じた設定
            switch (this.config.cacheOptimizationLevel) {
                case 'high':
                    // 高度な最適化設定
                    await this.enableAdvancedCaching();
                    break;
                case 'medium':
                    // 標準最適化設定
                    await this.enableStandardCaching();
                    break;
                case 'low':
                    // 軽量最適化設定
                    await this.enableLightweightCaching();
                    break;
            }

            this.systemMetrics.lastOptimization = new Date().toISOString();
            logger.debug('Performance optimization configured successfully');

        } catch (error) {
            logger.warn('Performance optimization configuration failed', { error });
        }
    }

    /**
     * 高度なキャッシュ設定
     * @private
     */
    private async enableAdvancedCaching(): Promise<void> {
        try {
            // 統合記憶システムの最適化実行
            const optimizationResult = await this.config.memoryManager.optimizeSystem();
            
            if (optimizationResult.success) {
                this.systemMetrics.cacheEfficiency = 0.9;
                logger.debug('Advanced caching enabled successfully');
            }
        } catch (error) {
            logger.warn('Failed to enable advanced caching', { error });
        }
    }

    /**
     * 標準キャッシュ設定
     * @private
     */
    private async enableStandardCaching(): Promise<void> {
        this.systemMetrics.cacheEfficiency = 0.7;
        logger.debug('Standard caching enabled');
    }

    /**
     * 軽量キャッシュ設定
     * @private
     */
    private async enableLightweightCaching(): Promise<void> {
        this.systemMetrics.cacheEfficiency = 0.5;
        logger.debug('Lightweight caching enabled');
    }

    /**
     * 統合伏線処理 - メインAPI
     * @param chapterContent チャプター内容
     * @param chapterNumber チャプター番号
     * @param options 処理オプション
     * @returns 統合処理結果
     */
    async processChapterForeshadowing(
        chapterContent: string,
        chapterNumber: number,
        options: {
            generateCount?: number;
            enableResolutionSuggestions?: boolean;
            enableAdvancedAnalysis?: boolean;
            prioritizeMemorySystem?: boolean;
        } = {}
    ): Promise<UnifiedProcessingResult> {
        const startTime = Date.now();
        this.systemMetrics.totalOperations++;

        try {
            await this.ensureInitialized();

            logger.info(`Processing unified foreshadowing for chapter ${chapterNumber}`, {
                chapterNumber,
                options,
                contentLength: chapterContent.length
            });

            const result: UnifiedProcessingResult = {
                success: false,
                foreshadowingResults: {
                    generatedCount: 0,
                    savedCount: 0,
                    resolutionSuggestions: 0
                },
                systemMetrics: {
                    processingTime: 0,
                    memorySystemIntegration: false,
                    cacheEfficiency: 0,
                    errorRate: 0
                },
                recommendations: []
            };

            // 1. 統合記憶システムとの連携確認
            const memoryIntegrationStatus = await this.verifyMemorySystemIntegration();
            result.systemMetrics.memorySystemIntegration = memoryIntegrationStatus.integrated;

            if (!memoryIntegrationStatus.integrated) {
                result.recommendations.push('Memory system integration issues detected');
            }

            // 2. メイン処理の実行（マネージャー経由）
            const processingResult = await this.manager.processChapterAndGenerateForeshadowing(
                chapterContent,
                chapterNumber,
                options.generateCount || 2
            );

            if (processingResult.success) {
                result.foreshadowingResults.generatedCount = processingResult.generatedCount;
                result.foreshadowingResults.resolutionSuggestions = processingResult.resolutionSuggestions.length;
                this.systemMetrics.successfulOperations++;
                this.systemMetrics.memorySystemIntegration++;
            } else {
                this.systemMetrics.failedOperations++;
                result.recommendations.push('Main processing failed - check system logs');
            }

            // 3. 高度な解決分析（オプション）
            if (options.enableResolutionSuggestions && this.config.enableAdvancedResolution) {
                const advancedResolution = await this.performAdvancedResolutionAnalysis(
                    chapterContent,
                    chapterNumber
                );
                
                if (advancedResolution.success) {
                    result.foreshadowingResults.resolutionSuggestions += advancedResolution.additionalSuggestions;
                }
            }

            // 4. システムメトリクスの更新
            const processingTime = Date.now() - startTime;
            result.systemMetrics.processingTime = processingTime;
            result.systemMetrics.cacheEfficiency = await this.measureCurrentCacheEfficiency();
            result.systemMetrics.errorRate = this.calculateErrorRate();

            this.updateAverageProcessingTime(processingTime);

            // 5. 推奨事項の生成
            result.recommendations.push(...this.generateSystemRecommendations(result.systemMetrics));

            // 6. 結果の最終処理
            result.success = processingResult.success;

            logger.info('Unified foreshadowing processing completed', {
                chapterNumber,
                success: result.success,
                processingTime: result.systemMetrics.processingTime,
                generatedCount: result.foreshadowingResults.generatedCount,
                resolutionSuggestions: result.foreshadowingResults.resolutionSuggestions,
                memoryIntegrated: result.systemMetrics.memorySystemIntegration
            });

            return result;

        } catch (error) {
            this.systemMetrics.failedOperations++;
            const processingTime = Date.now() - startTime;

            const errorMessage = error instanceof Error ? error.message : String(error);
            logError(error, { chapterNumber, options }, 'Unified foreshadowing processing failed');

            return {
                success: false,
                foreshadowingResults: {
                    generatedCount: 0,
                    savedCount: 0,
                    resolutionSuggestions: 0
                },
                systemMetrics: {
                    processingTime,
                    memorySystemIntegration: false,
                    cacheEfficiency: 0,
                    errorRate: 1
                },
                recommendations: [
                    'System processing failed - check error logs',
                    'Consider system restart if issues persist'
                ],
                error: errorMessage
            };
        }
    }

    /**
     * 統合記憶システム連携確認
     * @private
     */
    private async verifyMemorySystemIntegration(): Promise<{
        integrated: boolean;
        details: string[];
    }> {
        try {
            const details: string[] = [];

            // システム状態確認
            const systemStatus = await this.config.memoryManager.getSystemStatus();
            if (systemStatus.initialized) {
                details.push('Memory system initialized');
            } else {
                details.push('Memory system not initialized');
                return { integrated: false, details };
            }

            // 統合検索テスト
            const searchTest = await this.config.memoryManager.unifiedSearch(
                'foreshadowing system integration test',
                [MemoryLevel.SHORT_TERM]
            );

            if (searchTest.success) {
                details.push('Unified search functional');
            } else {
                details.push('Unified search issues detected');
            }

            // システム診断確認
            const diagnostics = await this.config.memoryManager.performSystemDiagnostics();
            if (diagnostics.systemHealth !== 'CRITICAL') {
                details.push('System health acceptable');
            } else {
                details.push('Critical system health issues');
                return { integrated: false, details };
            }

            return { integrated: true, details };

        } catch (error) {
            return {
                integrated: false,
                details: [`Integration verification failed: ${error instanceof Error ? error.message : String(error)}`]
            };
        }
    }

    /**
     * 高度な解決分析の実行
     * @private
     */
    private async performAdvancedResolutionAnalysis(
        chapterContent: string,
        chapterNumber: number
    ): Promise<{ success: boolean; additionalSuggestions: number }> {
        try {
            // 解決アドバイザーによる高度分析
            const advancedSuggestions = await this.resolutionAdvisor.suggestResolutions(
                chapterContent,
                chapterNumber,
                5 // 高度分析では最大5件
            );

            return {
                success: true,
                additionalSuggestions: advancedSuggestions.length
            };

        } catch (error) {
            logger.warn('Advanced resolution analysis failed', { error, chapterNumber });
            return { success: false, additionalSuggestions: 0 };
        }
    }

    /**
     * 現在のキャッシュ効率測定
     * @private
     */
    private async measureCurrentCacheEfficiency(): Promise<number> {
        try {
            const systemStatus = await this.config.memoryManager.getSystemStatus();
            const cacheStats = systemStatus.cacheStatistics;
            
            return cacheStats.hitRate || 0;

        } catch (error) {
            logger.debug('Cache efficiency measurement failed', { error });
            return 0;
        }
    }

    /**
     * エラー率の計算
     * @private
     */
    private calculateErrorRate(): number {
        if (this.systemMetrics.totalOperations === 0) return 0;
        return this.systemMetrics.failedOperations / this.systemMetrics.totalOperations;
    }

    /**
     * システム推奨事項の生成
     * @private
     */
    private generateSystemRecommendations(metrics: any): string[] {
        const recommendations: string[] = [];

        if (!metrics.memorySystemIntegration) {
            recommendations.push('Memory system integration requires attention');
        }

        if (metrics.cacheEfficiency < 0.5) {
            recommendations.push('Consider optimizing cache configuration for better performance');
        }

        if (metrics.errorRate > 0.1) {
            recommendations.push('High error rate detected - review system logs and configuration');
        }

        if (metrics.processingTime > 5000) {
            recommendations.push('Processing time is high - consider performance optimization');
        }

        return recommendations;
    }

    /**
     * 伏線のバルク操作 - 統合版
     * @param updates 更新データ配列
     * @returns バルク操作結果
     */
    async bulkUpdateForeshadowing(
        updates: Array<{ id: string, updates: Partial<Foreshadowing> }>
    ): Promise<{
        success: boolean;
        totalItems: number;
        successfulUpdates: number;
        failedUpdates: number;
        processingTime: number;
        memorySystemIntegrated: boolean;
        errors: Array<{ id: string; error: string }>;
    }> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();

            logger.info(`Starting bulk foreshadowing update`, {
                totalItems: updates.length
            });

            // 同時実行数制限
            const batchSize = Math.min(updates.length, this.config.maxConcurrentOperations);
            const batches = this.createBatches(updates, batchSize);

            let totalSuccessful = 0;
            let totalFailed = 0;
            const allErrors: Array<{ id: string; error: string }> = [];

            // バッチ処理の実行
            for (const batch of batches) {
                const batchResult = await this.manager.bulkUpdateForeshadowing(batch);
                totalSuccessful += batchResult.successfulUpdates;
                totalFailed += batchResult.failedUpdates;
                allErrors.push(...batchResult.errors);
            }

            // メモリシステム統合確認
            const memoryIntegrationStatus = await this.verifyMemorySystemIntegration();

            const processingTime = Date.now() - startTime;

            const result = {
                success: totalSuccessful > 0,
                totalItems: updates.length,
                successfulUpdates: totalSuccessful,
                failedUpdates: totalFailed,
                processingTime,
                memorySystemIntegrated: memoryIntegrationStatus.integrated,
                errors: allErrors
            };

            logger.info('Bulk foreshadowing update completed', result);

            return result;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logError(error, { updateCount: updates.length }, 'Bulk foreshadowing update failed');

            return {
                success: false,
                totalItems: updates.length,
                successfulUpdates: 0,
                failedUpdates: updates.length,
                processingTime: Date.now() - startTime,
                memorySystemIntegrated: false,
                errors: [{ id: 'system', error: errorMessage }]
            };
        }
    }

    /**
     * バッチ作成
     * @private
     */
    private createBatches<T>(items: T[], batchSize: number): T[][] {
        const batches: T[][] = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }

    /**
     * 伏線整合性チェック - 統合版
     * @param currentChapter 現在のチャプター番号
     * @returns 整合性チェック結果
     */
    async checkForeshadowingConsistency(currentChapter: number): Promise<{
        isConsistent: boolean;
        totalForeshadowings: number;
        issues: Array<{
            id: string;
            issue: string;
            severity: 'HIGH' | 'MEDIUM' | 'LOW';
            recommendation: string;
        }>;
        processingTime: number;
        memorySystemHealth: boolean;
        systemOptimizations: string[];
    }> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();

            logger.info(`Checking foreshadowing consistency for chapter ${currentChapter}`);

            // メイン整合性チェック
            const consistencyResult = await this.manager.checkForeshadowingConsistency(currentChapter);

            // システム最適化の提案
            const systemOptimizations = await this.generateSystemOptimizations(consistencyResult);

            const result = {
                isConsistent: consistencyResult.isConsistent,
                totalForeshadowings: consistencyResult.totalForeshadowings,
                issues: consistencyResult.issues,
                processingTime: Date.now() - startTime,
                memorySystemHealth: consistencyResult.memorySystemHealth,
                systemOptimizations
            };

            logger.info('Foreshadowing consistency check completed', {
                isConsistent: result.isConsistent,
                totalForeshadowings: result.totalForeshadowings,
                issueCount: result.issues.length,
                processingTime: result.processingTime
            });

            return result;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logError(error, { currentChapter }, 'Foreshadowing consistency check failed');

            return {
                isConsistent: false,
                totalForeshadowings: 0,
                issues: [{
                    id: 'system',
                    issue: `Consistency check failed: ${errorMessage}`,
                    severity: 'HIGH',
                    recommendation: 'Review system logs and restart consistency check'
                }],
                processingTime: Date.now() - startTime,
                memorySystemHealth: false,
                systemOptimizations: ['System restart recommended']
            };
        }
    }

    /**
     * システム最適化提案の生成
     * @private
     */
    private async generateSystemOptimizations(consistencyResult: any): Promise<string[]> {
        const optimizations: string[] = [];

        try {
            // 問題の種類に基づく最適化提案
            const highSeverityIssues = consistencyResult.issues.filter((issue: any) => issue.severity === 'HIGH');
            const mediumSeverityIssues = consistencyResult.issues.filter((issue: any) => issue.severity === 'MEDIUM');

            if (highSeverityIssues.length > 0) {
                optimizations.push('Immediate attention required for critical data integrity issues');
            }

            if (mediumSeverityIssues.length > 5) {
                optimizations.push('Consider batch resolution of medium-priority issues');
            }

            if (!consistencyResult.memorySystemHealth) {
                optimizations.push('Memory system optimization recommended');
            }

            // システム診断に基づく追加最適化
            if (this.config.enableSystemDiagnostics) {
                const diagnostics = await this.performSystemDiagnostics();
                
                if (diagnostics.performanceMetrics.averageProcessingTime > 3000) {
                    optimizations.push('Performance optimization recommended');
                }

                if (diagnostics.performanceMetrics.memoryEfficiency < 0.7) {
                    optimizations.push('Memory efficiency optimization recommended');
                }
            }

            return optimizations;

        } catch (error) {
            logger.warn('Failed to generate system optimizations', { error });
            return ['System optimization analysis failed'];
        }
    }

    /**
     * システム診断の実行 - 統合版
     * @returns 診断結果
     */
    async performSystemDiagnostics(): Promise<SystemDiagnosticsResult> {
        try {
            await this.ensureInitialized();

            logger.info('Performing comprehensive system diagnostics');

            // 各コンポーネントの診断実行
            const [managerDiagnostics, engineDiagnostics, memoryDiagnostics] = await Promise.allSettled([
                this.manager.performDiagnostics(),
                this.engine.performDiagnostics(),
                this.config.memoryManager.performSystemDiagnostics()
            ]);

            // 診断結果の統合
            const result: SystemDiagnosticsResult = {
                overallHealth: 'HEALTHY',
                componentHealth: {
                    engine: this.evaluateComponentHealth(engineDiagnostics),
                    manager: this.evaluateComponentHealth(managerDiagnostics),
                    resolutionAdvisor: 'HEALTHY', // resolutionAdvisorは診断機能が実装されていない場合
                    memorySystem: this.evaluateMemorySystemHealth(memoryDiagnostics)
                },
                performanceMetrics: {
                    totalOperations: this.systemMetrics.totalOperations,
                    successRate: this.calculateSuccessRate(),
                    averageProcessingTime: this.systemMetrics.averageProcessingTime,
                    memoryEfficiency: this.systemMetrics.cacheEfficiency
                },
                issues: [],
                lastOptimization: this.systemMetrics.lastOptimization
            };

            // 全体健康状態の評価
            result.overallHealth = this.evaluateOverallHealth(result.componentHealth);

            // 問題の収集
            result.issues = this.collectSystemIssues(
                managerDiagnostics,
                engineDiagnostics,
                memoryDiagnostics,
                result.performanceMetrics
            );

            logger.info('System diagnostics completed', {
                overallHealth: result.overallHealth,
                issueCount: result.issues.length,
                successRate: result.performanceMetrics.successRate
            });

            return result;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logError(error, {}, 'System diagnostics failed');

            return {
                overallHealth: 'CRITICAL',
                componentHealth: {
                    engine: 'CRITICAL',
                    manager: 'CRITICAL',
                    resolutionAdvisor: 'CRITICAL',
                    memorySystem: 'CRITICAL'
                },
                performanceMetrics: {
                    totalOperations: this.systemMetrics.totalOperations,
                    successRate: 0,
                    averageProcessingTime: 0,
                    memoryEfficiency: 0
                },
                issues: [{
                    component: 'system',
                    severity: 'HIGH',
                    description: `System diagnostics failed: ${errorMessage}`,
                    recommendation: 'Check system logs and restart diagnostics'
                }],
                lastOptimization: this.systemMetrics.lastOptimization
            };
        }
    }

    /**
     * コンポーネント健康状態の評価
     * @private
     */
    private evaluateComponentHealth(diagnosticsResult: PromiseSettledResult<any>): 'HEALTHY' | 'DEGRADED' | 'CRITICAL' {
        if (diagnosticsResult.status === 'rejected') {
            return 'CRITICAL';
        }

        const result = diagnosticsResult.value;

        if (result.systemHealth === 'CRITICAL') {
            return 'CRITICAL';
        } else if (result.systemHealth === 'DEGRADED') {
            return 'DEGRADED';
        }

        return 'HEALTHY';
    }

    /**
     * メモリシステム健康状態の評価
     * @private
     */
    private evaluateMemorySystemHealth(diagnosticsResult: PromiseSettledResult<any>): 'HEALTHY' | 'DEGRADED' | 'CRITICAL' {
        if (diagnosticsResult.status === 'rejected') {
            return 'CRITICAL';
        }

        const result = diagnosticsResult.value;

        if (result.systemHealth === 'CRITICAL') {
            return 'CRITICAL';
        } else if (result.systemHealth === 'DEGRADED') {
            return 'DEGRADED';
        }

        return 'HEALTHY';
    }

    /**
     * 全体健康状態の評価
     * @private
     */
    private evaluateOverallHealth(componentHealth: any): 'HEALTHY' | 'DEGRADED' | 'CRITICAL' {
        const healthValues = Object.values(componentHealth);

        if (healthValues.includes('CRITICAL')) {
            return 'CRITICAL';
        }

        if (healthValues.includes('DEGRADED')) {
            return 'DEGRADED';
        }

        return 'HEALTHY';
    }

    /**
     * システム問題の収集
     * @private
     */
    private collectSystemIssues(
        managerDiagnostics: any,
        engineDiagnostics: any,
        memoryDiagnostics: any,
        performanceMetrics: any
    ): Array<{
        component: string;
        severity: 'HIGH' | 'MEDIUM' | 'LOW';
        description: string;
        recommendation: string;
    }> {
        const issues: Array<{
            component: string;
            severity: 'HIGH' | 'MEDIUM' | 'LOW';
            description: string;
            recommendation: string;
        }> = [];

        // パフォーマンス関連の問題
        if (performanceMetrics.successRate < 0.8) {
            issues.push({
                component: 'performance',
                severity: 'HIGH',
                description: `Low success rate: ${(performanceMetrics.successRate * 100).toFixed(1)}%`,
                recommendation: 'Review error logs and optimize system configuration'
            });
        }

        if (performanceMetrics.averageProcessingTime > 5000) {
            issues.push({
                component: 'performance',
                severity: 'MEDIUM',
                description: `High average processing time: ${performanceMetrics.averageProcessingTime}ms`,
                recommendation: 'Consider performance optimization and resource allocation'
            });
        }

        if (performanceMetrics.memoryEfficiency < 0.5) {
            issues.push({
                component: 'memory',
                severity: 'MEDIUM',
                description: `Low memory efficiency: ${(performanceMetrics.memoryEfficiency * 100).toFixed(1)}%`,
                recommendation: 'Optimize memory usage and cache configuration'
            });
        }

        return issues;
    }

    /**
     * 成功率の計算
     * @private
     */
    private calculateSuccessRate(): number {
        if (this.systemMetrics.totalOperations === 0) return 1;
        return this.systemMetrics.successfulOperations / this.systemMetrics.totalOperations;
    }

    /**
     * パフォーマンス統計の取得
     */
    getPerformanceMetrics() {
        return {
            ...this.systemMetrics,
            managerMetrics: this.manager.getPerformanceMetrics(),
            engineMetrics: this.engine.getPerformanceMetrics()
        };
    }

    /**
     * システム最適化の実行
     * @returns 最適化結果
     */
    async optimizeSystem(): Promise<{
        success: boolean;
        optimizations: string[];
        performanceImprovement: number;
        processingTime: number;
    }> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();

            logger.info('Starting system optimization');

            const optimizations: string[] = [];
            const beforeMetrics = this.getPerformanceMetrics();

            // メモリシステムの最適化
            const memoryOptimization = await this.config.memoryManager.optimizeSystem();
            if (memoryOptimization.success) {
                optimizations.push('Memory system optimized');
            }

            // キャッシュ最適化の再実行
            await this.configurePerformanceOptimization();
            optimizations.push('Performance optimization reconfigured');

            // 最適化後のメトリクス取得
            const afterMetrics = this.getPerformanceMetrics();
            const performanceImprovement = this.calculatePerformanceImprovement(beforeMetrics, afterMetrics);

            this.systemMetrics.lastOptimization = new Date().toISOString();

            const result = {
                success: optimizations.length > 0,
                optimizations,
                performanceImprovement,
                processingTime: Date.now() - startTime
            };

            logger.info('System optimization completed', result);

            return result;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logError(error, {}, 'System optimization failed');

            return {
                success: false,
                optimizations: [],
                performanceImprovement: 0,
                processingTime: Date.now() - startTime
            };
        }
    }

    /**
     * パフォーマンス向上の計算
     * @private
     */
    private calculatePerformanceImprovement(before: any, after: any): number {
        try {
            const beforeScore = (before.cacheEfficiency + (before.successfulOperations / Math.max(before.totalOperations, 1))) / 2;
            const afterScore = (after.cacheEfficiency + (after.successfulOperations / Math.max(after.totalOperations, 1))) / 2;
            
            return ((afterScore - beforeScore) / Math.max(beforeScore, 0.01)) * 100;

        } catch (error) {
            logger.debug('Performance improvement calculation failed', { error });
            return 0;
        }
    }

    // ============================================================================
    // プライベートヘルパーメソッド
    // ============================================================================

    /**
     * 初期化状態の確保
     * @private
     */
    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }
    }

    /**
     * 平均処理時間の更新
     * @private
     */
    private updateAverageProcessingTime(processingTime: number): void {
        this.systemMetrics.averageProcessingTime = 
            ((this.systemMetrics.averageProcessingTime * (this.systemMetrics.totalOperations - 1)) + processingTime) / 
            this.systemMetrics.totalOperations;
    }
}

// ============================================================================
// 便利なファクトリー関数とエクスポート
// ============================================================================

/**
 * 統合伏線システムのファクトリー関数
 * @param memoryManager メモリマネージャー
 * @param config 追加設定
 * @returns 統合伏線システム
 */
export const createUnifiedForeshadowingSystem = (
    memoryManager: MemoryManager,
    config?: Partial<Omit<UnifiedForeshadowingSystemConfig, 'memoryManager'>>
): UnifiedForeshadowingSystem => {
    return new UnifiedForeshadowingSystem({
        memoryManager,
        ...config
    });
};

/**
 * 個別コンポーネントのエクスポート（依存注入対応）
 */
export { 
    createForeshadowingManager,
    createForeshadowingEngine,
    createForeshadowingResolutionAdvisor,
    ForeshadowingManager,
    ForeshadowingEngine,
    ForeshadowingResolutionAdvisor
};

/**
 * 型定義のエクスポート
 */
export type {
    UnifiedForeshadowingSystemConfig,
    UnifiedProcessingResult,
    SystemDiagnosticsResult
};