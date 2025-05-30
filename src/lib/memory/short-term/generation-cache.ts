// src/lib/memory/short-term/generation-cache.ts
/**
 * @fileoverview 統合記憶階層システム - 短期記憶：生成キャッシュ
 * @description
 * PromptGenerator、ContextGenerator、Pre/PostGenerationの一時処理結果を管理する
 * 統合キャッシュシステム。12コンポーネントのデータ救済機能を提供します。
 */

import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { Chapter } from '@/types/chapters';

/**
 * @interface ActivePromptGeneration
 * @description PromptGenerator一時データ
 */
interface ActivePromptGeneration {
    id: string;
    chapterNumber: number;
    templateType: string;
    generationStage: 'preparation' | 'context_building' | 'section_assembly' | 'completion';
    contextData: any;
    templateData: any;
    sectionResults: Map<string, any>;
    startTime: string;
    lastUpdateTime: string;
    status: 'active' | 'paused' | 'completed' | 'failed';
    errorMessages: string[];
    qualityMetrics?: {
        coherenceScore: number;
        contextRelevance: number;
        templateAdherence: number;
    };
}

/**
 * @interface TemplateProcessingState
 * @description テンプレート処理状態
 */
interface TemplateProcessingState {
    templateId: string;
    templateType: string;
    processingStage: 'loading' | 'validation' | 'customization' | 'application' | 'finalization';
    customizations: any[];
    validationResults: {
        isValid: boolean;
        warnings: string[];
        errors: string[];
    };
    applicationResults: {
        appliedSections: string[];
        skippedSections: string[];
        modifiedSections: string[];
    };
    performanceMetrics: {
        processingTimeMs: number;
        memoryUsageMB: number;
        complexityScore: number;
    };
    timestamp: string;
}

/**
 * @interface SectionBuildingState
 * @description セクション構築状態
 */
interface SectionBuildingState {
    sectionId: string;
    sectionType: string;
    buildingStage: 'initialization' | 'content_gathering' | 'structure_building' | 'refinement' | 'completion';
    contentSources: Array<{
        sourceType: string;
        sourceId: string;
        weight: number;
        retrievedData: any;
    }>;
    structureElements: {
        introduction: any;
        body: any[];
        conclusion: any;
        transitions: any[];
    };
    refinementHistory: Array<{
        refinementType: string;
        beforeState: any;
        afterState: any;
        timestamp: string;
    }>;
    qualityAssessment: {
        contentQuality: number;
        structuralCoherence: number;
        narrativeFlow: number;
        overallScore: number;
    };
    timestamp: string;
}

/**
 * @interface ContextGenerationState
 * @description ContextGenerator一時状態
 */
interface ContextGenerationState {
    generationId: string;
    chapterNumber: number;
    contextType: 'integrated' | 'character_focused' | 'world_focused' | 'event_focused';
    gatheringStage: 'source_identification' | 'data_collection' | 'integration' | 'validation' | 'completion';
    dataSources: {
        immediateContext: any;
        narrativeMemory: any;
        worldKnowledge: any;
        eventRegistry: any;
        characterManager: any;
    };
    integrationResults: {
        unifiedContext: any;
        conflictResolutions: Array<{
            conflictType: string;
            conflictDescription: string;
            resolution: string;
            confidence: number;
        }>;
        dataQualityScores: {
            completeness: number;
            accuracy: number;
            consistency: number;
            relevance: number;
        };
    };
    startTime: string;
    completionTime?: string;
    status: 'initializing' | 'gathering' | 'integrating' | 'validating' | 'completed' | 'failed';
}

/**
 * @interface IntegrationProcessingState
 * @description 統合処理状態
 */
interface IntegrationProcessingState {
    processingId: string;
    integrationType: 'memory_layer_integration' | 'cross_component_sync' | 'cache_coordination';
    processingSteps: Array<{
        stepName: string;
        stepStatus: 'pending' | 'processing' | 'completed' | 'failed';
        startTime: string;
        endTime?: string;
        resultData?: any;
        errorInfo?: string;
    }>;
    dependencyMap: {
        requiredComponents: string[];
        optionalComponents: string[];
        completedDependencies: string[];
        failedDependencies: string[];
    };
    resourceUsage: {
        cpuUsagePercent: number;
        memoryUsageMB: number;
        diskIOOperations: number;
        networkRequests: number;
    };
    timestamp: string;
}

/**
 * @interface PreGenerationTempResult
 * @description Pre-Generation一時結果
 */
interface PreGenerationTempResult {
    resultId: string;
    chapterNumber: number;
    processingType: 'character_analysis' | 'world_context_prep' | 'narrative_state_check' | 'foreshadowing_prep';
    analysisResults: {
        characterStates: any[];
        worldContextData: any;
        narrativeStateInfo: any;
        foreshadowingElements: any[];
    };
    recommendations: {
        focusCharacters: string[];
        suggestedTones: string[];
        narrativeDirections: string[];
        warningFlags: string[];
    };
    qualityMetrics: {
        dataCompleteness: number;
        contextRelevance: number;
        narrativeConsistency: number;
        characterCoherence: number;
    };
    processingDuration: number;
    timestamp: string;
}

/**
 * @interface PostGenerationTempResult
 * @description Post-Generation一時結果
 */
interface PostGenerationTempResult {
    resultId: string;
    chapterNumber: number;
    generatedContent: string;
    analysisResults: {
        qualityAssessment: {
            overallQuality: number;
            narrativeCoherence: number;
            characterConsistency: number;
            worldConsistency: number;
            emotionalResonance: number;
        };
        detectedIssues: Array<{
            issueType: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            description: string;
            suggestedFix: string;
        }>;
        improvementSuggestions: Array<{
            suggestionType: string;
            priority: number;
            description: string;
            implementation: string;
        }>;
    };
    performanceMetrics: {
        generationTimeMs: number;
        analysisTimeMs: number;
        totalProcessingTimeMs: number;
        resourceUtilization: number;
    };
    timestamp: string;
}

/**
 * @interface GenerationCacheStatus
 * @description 生成キャッシュの状態情報
 */
interface GenerationCacheStatus {
    initialized: boolean;
    activeGenerations: number;
    completedGenerations: number;
    cacheHitRate: number;
    totalCacheSize: number;
    memoryUsageMB: number;
    lastCleanupTime: string | null;
    performanceMetrics: {
        averageGenerationTime: number;
        cacheEfficiencyRate: number;
        errorRate: number;
    };
}

/**
 * @class GenerationCache
 * @description
 * 統合記憶階層システムの生成キャッシュクラス。
 * PromptGenerator、ContextGenerator、Pre/PostGenerationの一時処理結果を管理し、
 * 重複処理の排除と高速化を実現します।
 */
export class GenerationCache {
    private static readonly MAX_ACTIVE_GENERATIONS = 50;
    private static readonly CACHE_CLEANUP_INTERVAL = 60 * 60 * 1000; // 1時間
    private static readonly MAX_CACHE_AGE = 4 * 60 * 60 * 1000; // 4時間

    // 🔴 PromptGenerator救済データ
    private promptGenerationCache: Map<string, ActivePromptGeneration> = new Map();
    private templateProcessingCache: Map<string, TemplateProcessingState> = new Map();
    private sectionBuildingCache: Map<string, SectionBuildingState> = new Map();

    // 🔴 ContextGenerator救済データ
    private contextGenerationCache: Map<string, ContextGenerationState> = new Map();
    private integrationProcessingCache: Map<string, IntegrationProcessingState> = new Map();

    // 🔴 Pre/PostGeneration救済データ
    private preGenerationResultsCache: Map<string, PreGenerationTempResult> = new Map();
    private postGenerationResultsCache: Map<string, PostGenerationTempResult> = new Map();

    // キャッシュ統計
    private cacheStats = {
        hits: 0,
        misses: 0,
        totalRequests: 0,
        averageResponseTime: 0,
        errorCount: 0
    };

    private initialized: boolean = false;
    private cleanupTimer: NodeJS.Timeout | null = null;

    constructor() { }

    /**
     * 初期化処理を実行
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('GenerationCache already initialized');
            return;
        }

        try {
            // ストレージからキャッシュデータを復元
            await this.loadFromStorage();

            // クリーンアップタイマーを開始
            this.startCleanupTimer();

            this.initialized = true;
            logger.info('GenerationCache initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize GenerationCache', {
                error: error instanceof Error ? error.message : String(error)
            });
            this.initialized = true;
        }
    }

    /**
     * クリーンアップタイマーを開始
     * @private
     */
    private startCleanupTimer(): void {
        this.cleanupTimer = setInterval(() => {
            this.cleanupExpiredEntries();
        }, GenerationCache.CACHE_CLEANUP_INTERVAL);
    }

    // ============================================================================
    // 🔴 PromptGenerator救済機能
    // ============================================================================

    /**
     * アクティブなプロンプト生成を開始
     * @param chapterNumber 章番号
     * @param templateType テンプレートタイプ
     * @returns 生成ID
     */
    async startPromptGeneration(chapterNumber: number, templateType: string): Promise<string> {
        const generationId = `prompt-gen-${chapterNumber}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        const generation: ActivePromptGeneration = {
            id: generationId,
            chapterNumber,
            templateType,
            generationStage: 'preparation',
            contextData: {},
            templateData: {},
            sectionResults: new Map(),
            startTime: new Date().toISOString(),
            lastUpdateTime: new Date().toISOString(),
            status: 'active',
            errorMessages: []
        };

        this.promptGenerationCache.set(generationId, generation);
        await this.saveToStorage();

        logger.debug(`Started prompt generation: ${generationId}`);
        return generationId;
    }

    /**
     * プロンプト生成状態を更新
     * @param generationId 生成ID
     * @param updates 更新データ
     */
    async updatePromptGeneration(generationId: string, updates: Partial<ActivePromptGeneration>): Promise<void> {
        const generation = this.promptGenerationCache.get(generationId);
        if (!generation) {
            logger.warn(`Prompt generation not found: ${generationId}`);
            return;
        }

        // 更新データをマージ
        Object.assign(generation, updates, {
            lastUpdateTime: new Date().toISOString()
        });

        this.promptGenerationCache.set(generationId, generation);
        logger.debug(`Updated prompt generation: ${generationId}`);
    }

    /**
     * プロンプト生成を完了
     * @param generationId 生成ID
     * @param qualityMetrics 品質メトリクス
     */
    async completePromptGeneration(
        generationId: string,
        qualityMetrics?: ActivePromptGeneration['qualityMetrics']
    ): Promise<void> {
        const generation = this.promptGenerationCache.get(generationId);
        if (!generation) {
            logger.warn(`Prompt generation not found: ${generationId}`);
            return;
        }

        generation.status = 'completed';
        generation.generationStage = 'completion';
        generation.qualityMetrics = qualityMetrics;
        generation.lastUpdateTime = new Date().toISOString();

        this.promptGenerationCache.set(generationId, generation);
        await this.saveToStorage();

        logger.info(`Completed prompt generation: ${generationId}`);
    }

    /**
     * テンプレート処理状態を管理
     * @param templateId テンプレートID
     * @param state 処理状態
     */
    async setTemplateProcessingState(templateId: string, state: TemplateProcessingState): Promise<void> {
        this.templateProcessingCache.set(templateId, {
            ...state,
            timestamp: new Date().toISOString()
        });

        logger.debug(`Set template processing state: ${templateId}`);
    }

    /**
     * セクション構築状態を管理
     * @param sectionId セクションID
     * @param state 構築状態
     */
    async setSectionBuildingState(sectionId: string, state: SectionBuildingState): Promise<void> {
        this.sectionBuildingCache.set(sectionId, {
            ...state,
            timestamp: new Date().toISOString()
        });

        logger.debug(`Set section building state: ${sectionId}`);
    }

    // ============================================================================
    // 🔴 ContextGenerator救済機能
    // ============================================================================

    /**
     * コンテキスト生成を開始
     * @param chapterNumber 章番号
     * @param contextType コンテキストタイプ
     * @returns 生成ID
     */
    async startContextGeneration(
        chapterNumber: number,
        contextType: ContextGenerationState['contextType']
    ): Promise<string> {
        const generationId = `ctx-gen-${chapterNumber}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        const contextGeneration: ContextGenerationState = {
            generationId,
            chapterNumber,
            contextType,
            gatheringStage: 'source_identification',
            dataSources: {
                immediateContext: null,
                narrativeMemory: null,
                worldKnowledge: null,
                eventRegistry: null,
                characterManager: null
            },
            integrationResults: {
                unifiedContext: null,
                conflictResolutions: [],
                dataQualityScores: {
                    completeness: 0,
                    accuracy: 0,
                    consistency: 0,
                    relevance: 0
                }
            },
            startTime: new Date().toISOString(),
            status: 'initializing'
        };

        this.contextGenerationCache.set(generationId, contextGeneration);
        logger.debug(`Started context generation: ${generationId}`);
        return generationId;
    }

    /**
     * コンテキスト生成状態を更新
     * @param generationId 生成ID
     * @param updates 更新データ
     */
    async updateContextGeneration(generationId: string, updates: Partial<ContextGenerationState>): Promise<void> {
        const generation = this.contextGenerationCache.get(generationId);
        if (!generation) {
            logger.warn(`Context generation not found: ${generationId}`);
            return;
        }

        Object.assign(generation, updates);
        this.contextGenerationCache.set(generationId, generation);
        logger.debug(`Updated context generation: ${generationId}`);
    }

    /**
     * 統合処理状態を管理
     * @param processingId 処理ID
     * @param state 統合処理状態
     */
    async setIntegrationProcessingState(processingId: string, state: IntegrationProcessingState): Promise<void> {
        this.integrationProcessingCache.set(processingId, {
            ...state,
            timestamp: new Date().toISOString()
        });

        logger.debug(`Set integration processing state: ${processingId}`);
    }

    // ============================================================================
    // 🔴 Pre/PostGeneration救済機能
    // ============================================================================

    /**
     * Pre-Generation結果を保存
     * @param chapterNumber 章番号
     * @param result 結果データ
     */
    async savePreGenerationResult(chapterNumber: number, result: Omit<PreGenerationTempResult, 'resultId' | 'timestamp'>): Promise<string> {
        const resultId = `pre-gen-${chapterNumber}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        const tempResult: PreGenerationTempResult = {
            ...result,
            resultId,
            chapterNumber,
            timestamp: new Date().toISOString()
        };

        this.preGenerationResultsCache.set(resultId, tempResult);
        await this.saveToStorage();

        logger.debug(`Saved pre-generation result: ${resultId}`);
        return resultId;
    }

    /**
     * Post-Generation結果を保存
     * @param chapterNumber 章番号
     * @param result 結果データ
     */
    async savePostGenerationResult(chapterNumber: number, result: Omit<PostGenerationTempResult, 'resultId' | 'timestamp'>): Promise<string> {
        const resultId = `post-gen-${chapterNumber}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        const tempResult: PostGenerationTempResult = {
            ...result,
            resultId,
            chapterNumber,
            timestamp: new Date().toISOString()
        };

        this.postGenerationResultsCache.set(resultId, tempResult);
        await this.saveToStorage();

        logger.debug(`Saved post-generation result: ${resultId}`);
        return resultId;
    }

    // ============================================================================
    // 🔴 統合キャッシュ・検索機能
    // ============================================================================

    /**
     * 章番号に基づく統合検索
     * @param chapterNumber 章番号
     * @returns 統合結果
     */
    async getIntegratedGenerationData(chapterNumber: number): Promise<{
        activePromptGenerations: ActivePromptGeneration[];
        contextGenerations: ContextGenerationState[];
        preGenerationResults: PreGenerationTempResult[];
        postGenerationResults: PostGenerationTempResult[];
    }> {
        this.recordCacheAccess();

        const result = {
            activePromptGenerations: Array.from(this.promptGenerationCache.values())
                .filter(gen => gen.chapterNumber === chapterNumber),
            contextGenerations: Array.from(this.contextGenerationCache.values())
                .filter(gen => gen.chapterNumber === chapterNumber),
            preGenerationResults: Array.from(this.preGenerationResultsCache.values())
                .filter(result => result.chapterNumber === chapterNumber),
            postGenerationResults: Array.from(this.postGenerationResultsCache.values())
                .filter(result => result.chapterNumber === chapterNumber)
        };

        this.recordCacheHit();
        return result;
    }

    /**
     * テンプレートタイプ別検索
     * @param templateType テンプレートタイプ
     * @returns 該当する生成データ
     */
    async getGenerationsByTemplate(templateType: string): Promise<{
        promptGenerations: ActivePromptGeneration[];
        templateProcessings: TemplateProcessingState[];
    }> {
        this.recordCacheAccess();

        const result = {
            promptGenerations: Array.from(this.promptGenerationCache.values())
                .filter(gen => gen.templateType === templateType),
            templateProcessings: Array.from(this.templateProcessingCache.values())
                .filter(proc => proc.templateType === templateType)
        };

        this.recordCacheHit();
        return result;
    }

    /**
     * 品質メトリクス分析
     * @param chapterRange 章範囲
     * @returns 品質分析結果
     */
    async analyzeQualityMetrics(chapterRange: { start: number; end: number }): Promise<{
        averageQuality: number;
        qualityTrends: Array<{ chapter: number; quality: number }>;
        recommendations: string[];
    }> {
        const preResults = Array.from(this.preGenerationResultsCache.values())
            .filter(result => result.chapterNumber >= chapterRange.start && result.chapterNumber <= chapterRange.end);

        const postResults = Array.from(this.postGenerationResultsCache.values())
            .filter(result => result.chapterNumber >= chapterRange.start && result.chapterNumber <= chapterRange.end);

        const qualityTrends: Array<{ chapter: number; quality: number }> = [];
        let totalQuality = 0;
        let qualityCount = 0;

        // Pre-generation品質データ
        preResults.forEach(result => {
            const avgQuality = (
                result.qualityMetrics.dataCompleteness +
                result.qualityMetrics.contextRelevance +
                result.qualityMetrics.narrativeConsistency +
                result.qualityMetrics.characterCoherence
            ) / 4;

            qualityTrends.push({ chapter: result.chapterNumber, quality: avgQuality });
            totalQuality += avgQuality;
            qualityCount++;
        });

        // Post-generation品質データ
        postResults.forEach(result => {
            const quality = result.analysisResults.qualityAssessment.overallQuality;
            qualityTrends.push({ chapter: result.chapterNumber, quality });
            totalQuality += quality;
            qualityCount++;
        });

        const averageQuality = qualityCount > 0 ? totalQuality / qualityCount : 0;

        // 推奨事項の生成
        const recommendations: string[] = [];
        if (averageQuality < 0.7) {
            recommendations.push('品質向上のためのテンプレート見直しを推奨');
        }
        if (qualityTrends.length > 2) {
            const recentQuality = qualityTrends.slice(-3).reduce((sum, trend) => sum + trend.quality, 0) / 3;
            if (recentQuality < averageQuality * 0.9) {
                recommendations.push('最近の品質低下傾向に注意が必要');
            }
        }

        return {
            averageQuality,
            qualityTrends: qualityTrends.sort((a, b) => a.chapter - b.chapter),
            recommendations
        };
    }

    // ============================================================================
    // 🔴 キャッシュ管理・最適化機能
    // ============================================================================

    /**
     * 期限切れエントリのクリーンアップ
     * @private
     */
    private cleanupExpiredEntries(): void {
        const now = Date.now();
        const cutoffTime = now - GenerationCache.MAX_CACHE_AGE;
        let cleanedCount = 0;

        // ActivePromptGeneration のクリーンアップ
        for (const [key, entry] of this.promptGenerationCache.entries()) {
            const entryTime = new Date(entry.lastUpdateTime || entry.startTime).getTime();
            if (entryTime < cutoffTime) {
                this.promptGenerationCache.delete(key);
                cleanedCount++;
            }
        }

        // TemplateProcessingState のクリーンアップ
        for (const [key, entry] of this.templateProcessingCache.entries()) {
            const entryTime = new Date(entry.timestamp).getTime();
            if (entryTime < cutoffTime) {
                this.templateProcessingCache.delete(key);
                cleanedCount++;
            }
        }

        // SectionBuildingState のクリーンアップ
        for (const [key, entry] of this.sectionBuildingCache.entries()) {
            const entryTime = new Date(entry.timestamp).getTime();
            if (entryTime < cutoffTime) {
                this.sectionBuildingCache.delete(key);
                cleanedCount++;
            }
        }

        // ContextGenerationState のクリーンアップ
        for (const [key, entry] of this.contextGenerationCache.entries()) {
            const entryTime = new Date(entry.completionTime || entry.startTime).getTime();
            if (entryTime < cutoffTime) {
                this.contextGenerationCache.delete(key);
                cleanedCount++;
            }
        }

        // IntegrationProcessingState のクリーンアップ
        for (const [key, entry] of this.integrationProcessingCache.entries()) {
            const entryTime = new Date(entry.timestamp).getTime();
            if (entryTime < cutoffTime) {
                this.integrationProcessingCache.delete(key);
                cleanedCount++;
            }
        }

        // PreGenerationTempResult のクリーンアップ
        for (const [key, entry] of this.preGenerationResultsCache.entries()) {
            const entryTime = new Date(entry.timestamp).getTime();
            if (entryTime < cutoffTime) {
                this.preGenerationResultsCache.delete(key);
                cleanedCount++;
            }
        }

        // PostGenerationTempResult のクリーンアップ
        for (const [key, entry] of this.postGenerationResultsCache.entries()) {
            const entryTime = new Date(entry.timestamp).getTime();
            if (entryTime < cutoffTime) {
                this.postGenerationResultsCache.delete(key);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            logger.info(`Cleaned up ${cleanedCount} expired cache entries`);
        }
    }


    /**
     * キャッシュサイズ最適化
     */
    async optimizeCacheSize(): Promise<void> {
        const totalEntries = this.getTotalCacheEntries();

        if (totalEntries > GenerationCache.MAX_ACTIVE_GENERATIONS) {
            // LRU方式で古いエントリを削除
            await this.performLRUCleanup();
        }

        logger.debug(`Cache optimization completed. Total entries: ${totalEntries}`);
    }

    /**
     * LRUクリーンアップを実行
     * @private
     */
    private async performLRUCleanup(): Promise<void> {
        // 完了済みの生成を優先的に削除
        const completedGenerations = Array.from(this.promptGenerationCache.entries())
            .filter(([_, gen]) => gen.status === 'completed')
            .sort(([_, a], [__, b]) => new Date(a.lastUpdateTime).getTime() - new Date(b.lastUpdateTime).getTime());

        const toRemove = Math.max(0, completedGenerations.length - Math.floor(GenerationCache.MAX_ACTIVE_GENERATIONS * 0.3));

        for (let i = 0; i < toRemove; i++) {
            const [key] = completedGenerations[i];
            this.promptGenerationCache.delete(key);
        }

        logger.debug(`Removed ${toRemove} completed generations during LRU cleanup`);
    }

    /**
     * 総キャッシュエントリ数を取得
     * @private
     * @returns 総エントリ数
     */
    private getTotalCacheEntries(): number {
        return this.promptGenerationCache.size +
            this.templateProcessingCache.size +
            this.sectionBuildingCache.size +
            this.contextGenerationCache.size +
            this.integrationProcessingCache.size +
            this.preGenerationResultsCache.size +
            this.postGenerationResultsCache.size;
    }

    /**
     * キャッシュアクセス統計を記録
     * @private
     */
    private recordCacheAccess(): void {
        this.cacheStats.totalRequests++;
    }

    /**
     * キャッシュヒット統計を記録
     * @private
     */
    private recordCacheHit(): void {
        this.cacheStats.hits++;
    }

    /**
     * キャッシュミス統計を記録
     * @private
     */
    private recordCacheMiss(): void {
        this.cacheStats.misses++;
    }

    /**
     * 状態情報を取得
     * @returns キャッシュ状態情報
     */
    async getStatus(): Promise<GenerationCacheStatus> {
        const hitRate = this.cacheStats.totalRequests > 0
            ? this.cacheStats.hits / this.cacheStats.totalRequests
            : 0;

        const activeGenerations = Array.from(this.promptGenerationCache.values())
            .filter(gen => gen.status === 'active').length;

        const completedGenerations = Array.from(this.promptGenerationCache.values())
            .filter(gen => gen.status === 'completed').length;

        return {
            initialized: this.initialized,
            activeGenerations,
            completedGenerations,
            cacheHitRate: Math.round(hitRate * 100) / 100,
            totalCacheSize: this.getTotalCacheEntries(),
            memoryUsageMB: this.calculateMemoryUsage(),
            lastCleanupTime: new Date().toISOString(),
            performanceMetrics: {
                averageGenerationTime: this.calculateAverageGenerationTime(),
                cacheEfficiencyRate: hitRate,
                errorRate: this.cacheStats.totalRequests > 0
                    ? this.cacheStats.errorCount / this.cacheStats.totalRequests
                    : 0
            }
        };
    }

    /**
     * メモリ使用量を計算
     * @private
     * @returns メモリ使用量（MB）
     */
    private calculateMemoryUsage(): number {
        // 概算計算
        let totalSize = 0;

        // 各キャッシュのサイズを概算
        totalSize += this.promptGenerationCache.size * 5; // KB per entry
        totalSize += this.contextGenerationCache.size * 3;
        totalSize += this.preGenerationResultsCache.size * 2;
        totalSize += this.postGenerationResultsCache.size * 4;

        return Math.round(totalSize / 1024 * 100) / 100; // MB
    }

    /**
     * 平均生成時間を計算
     * @private
     * @returns 平均生成時間（ミリ秒）
     */
    private calculateAverageGenerationTime(): number {
        const completedGenerations = Array.from(this.promptGenerationCache.values())
            .filter(gen => gen.status === 'completed');

        if (completedGenerations.length === 0) return 0;

        const totalTime = completedGenerations.reduce((sum, gen) => {
            const startTime = new Date(gen.startTime).getTime();
            const endTime = new Date(gen.lastUpdateTime).getTime();
            return sum + (endTime - startTime);
        }, 0);

        return Math.round(totalTime / completedGenerations.length);
    }

    // ============================================================================
    // 🔴 永続化機能
    // ============================================================================

    /**
     * ストレージからデータを読み込み
     * @private
     */
    private async loadFromStorage(): Promise<void> {
        try {
            const cacheExists = await storageProvider.fileExists('short-term/generation-cache.json');

            if (cacheExists) {
                const cacheContent = await storageProvider.readFile('short-term/generation-cache.json');
                const cacheData = JSON.parse(cacheContent);

                // 各キャッシュを復元
                if (cacheData.promptGenerationCache) {
                    this.promptGenerationCache = new Map(Object.entries(cacheData.promptGenerationCache));
                }
                if (cacheData.contextGenerationCache) {
                    this.contextGenerationCache = new Map(Object.entries(cacheData.contextGenerationCache));
                }
                if (cacheData.preGenerationResultsCache) {
                    this.preGenerationResultsCache = new Map(Object.entries(cacheData.preGenerationResultsCache));
                }
                if (cacheData.postGenerationResultsCache) {
                    this.postGenerationResultsCache = new Map(Object.entries(cacheData.postGenerationResultsCache));
                }
                if (cacheData.cacheStats) {
                    this.cacheStats = cacheData.cacheStats;
                }

                logger.debug('GenerationCache data loaded from storage');
            }
        } catch (error) {
            logger.error('Failed to load GenerationCache from storage', { error });
        }
    }

    /**
     * ストレージにデータを保存
     * @private
     */
    private async saveToStorage(): Promise<void> {
        try {
            const cacheData = {
                promptGenerationCache: Object.fromEntries(this.promptGenerationCache),
                templateProcessingCache: Object.fromEntries(this.templateProcessingCache),
                sectionBuildingCache: Object.fromEntries(this.sectionBuildingCache),
                contextGenerationCache: Object.fromEntries(this.contextGenerationCache),
                integrationProcessingCache: Object.fromEntries(this.integrationProcessingCache),
                preGenerationResultsCache: Object.fromEntries(this.preGenerationResultsCache),
                postGenerationResultsCache: Object.fromEntries(this.postGenerationResultsCache),
                cacheStats: this.cacheStats,
                lastSaved: new Date().toISOString()
            };

            await storageProvider.writeFile(
                'short-term/generation-cache.json',
                JSON.stringify(cacheData, null, 2)
            );

            logger.debug('GenerationCache data saved to storage');
        } catch (error) {
            logger.error('Failed to save GenerationCache to storage', { error });
        }
    }

    /**
     * クリーンアップ処理
     */
    async cleanup(): Promise<void> {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }

        await this.saveToStorage();
        logger.info('GenerationCache cleanup completed');
    }
}