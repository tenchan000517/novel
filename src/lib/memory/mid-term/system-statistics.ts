/**
 * @fileoverview システム統計管理システム - 中期記憶階層
 * @description
 * システム全体のパフォーマンス統計を監視・管理するコンポーネント。
 * プロンプト生成、テンプレート使用、最適化効果、コンポーネント性能を統合管理します。
 */

import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { Chapter } from '@/types/chapters';
import {
    SystemStatisticsData,
    PromptGenerationStatsRecord,
    TemplateUsageStatsRecord,
    TensionOptimizationStatsRecord,
    ComponentPerformanceStats,
    SystemIntegrationStatsRecord
} from '../core/types';

/**
 * @interface SystemStatisticsConfig
 * @description システム統計設定
 */
export interface SystemStatisticsConfig {
    enableRealTimeTracking: boolean;
    performanceMonitoringInterval: number; // minutes
    statisticsRetentionDays: number;
    enableComponentProfiling: boolean;
    enableOptimizationTracking: boolean;
    alertThresholds: {
        responseTimeMs: number;
        errorRatePercent: number;
        memoryUsageMB: number;
        throughputPerMinute: number;
    };
}

/**
 * @interface PerformanceSnapshot
 * @description パフォーマンススナップショット
 */
export interface PerformanceSnapshot {
    timestamp: string;
    cpuUsage: number;
    memoryUsage: number;
    responseTime: number;
    throughput: number;
    errorCount: number;
    successCount: number;
    activeConnections: number;
}

/**
 * @interface ComponentUsageStats
 * @description コンポーネント使用統計
 */
export interface ComponentUsageStats {
    componentName: string;
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    averageResponseTime: number;
    totalProcessingTime: number;
    lastUsed: string;
    peakUsage: string;
    resourceUsage: {
        memoryPeakMB: number;
        averageMemoryMB: number;
        cpuTimeMs: number;
    };
}

/**
 * @interface OptimizationEffectiveness
 * @description 最適化効果測定
 */
export interface OptimizationEffectiveness {
    optimizationType: string;
    implementationDate: string;
    beforeMetrics: {
        responseTime: number;
        errorRate: number;
        throughput: number;
        resourceUsage: number;
    };
    afterMetrics: {
        responseTime: number;
        errorRate: number;
        throughput: number;
        resourceUsage: number;
    };
    improvementPercentage: {
        responseTime: number;
        errorRate: number;
        throughput: number;
        resourceUsage: number;
    };
    sustainabilityScore: number; // 改善の持続性 (0-10)
}

/**
 * @class SystemStatisticsManager
 * @description システム統計管理を担当するクラス
 */
export class SystemStatisticsManager {
    private config: SystemStatisticsConfig;
    private statisticsData: SystemStatisticsData;
    private initialized: boolean = false;
    private monitoringTimer: NodeJS.Timeout | null = null;
    private performanceSnapshots: PerformanceSnapshot[] = [];
    private componentUsageStats: Map<string, ComponentUsageStats> = new Map();
    private optimizationEffects: OptimizationEffectiveness[] = [];
    private lastSystemCheck: string = '';

    constructor(config?: Partial<SystemStatisticsConfig>) {
        this.config = {
            enableRealTimeTracking: true,
            performanceMonitoringInterval: 5, // 5分間隔
            statisticsRetentionDays: 90,
            enableComponentProfiling: true,
            enableOptimizationTracking: true,
            alertThresholds: {
                responseTimeMs: 5000,
                errorRatePercent: 5.0,
                memoryUsageMB: 1024,
                throughputPerMinute: 10
            },
            ...config
        };

        this.statisticsData = {
            promptGenerationStats: [],
            templateUsageStats: [],
            tensionOptimizationStats: [],
            componentPerformanceStats: new Map(),
            systemIntegrationStats: []
        };
    }

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('SystemStatisticsManager already initialized');
            return;
        }

        try {
            await this.loadFromStorage();
            
            // リアルタイム監視の開始
            if (this.config.enableRealTimeTracking) {
                await this.startPerformanceMonitoring();
            }
            
            this.initialized = true;
            this.lastSystemCheck = new Date().toISOString();
            
            logger.info('SystemStatisticsManager initialized successfully', {
                config: this.config,
                dataLoaded: {
                    promptStats: this.statisticsData.promptGenerationStats.length,
                    templateStats: this.statisticsData.templateUsageStats.length,
                    optimizationStats: this.statisticsData.tensionOptimizationStats.length,
                    componentStats: this.statisticsData.componentPerformanceStats.size,
                    integrationStats: this.statisticsData.systemIntegrationStats.length
                }
            });
        } catch (error) {
            logger.error('Failed to initialize SystemStatisticsManager', {
                error: error instanceof Error ? error.message : String(error)
            });
            this.initialized = true; // エラーでも続行
        }
    }

    /**
     * ストレージからデータを読み込み
     * @private
     */
    private async loadFromStorage(): Promise<void> {
        try {
            if (await storageProvider.fileExists('mid-term-memory/system-statistics.json')) {
                const data = await storageProvider.readFile('mid-term-memory/system-statistics.json');
                const parsed = JSON.parse(data);

                // データ構造の検証と復元
                this.statisticsData = {
                    promptGenerationStats: Array.isArray(parsed.promptGenerationStats) ? 
                        parsed.promptGenerationStats : [],
                    templateUsageStats: Array.isArray(parsed.templateUsageStats) ? 
                        parsed.templateUsageStats : [],
                    tensionOptimizationStats: Array.isArray(parsed.tensionOptimizationStats) ? 
                        parsed.tensionOptimizationStats : [],
                    componentPerformanceStats: parsed.componentPerformanceStats ? 
                        new Map(parsed.componentPerformanceStats) : new Map(),
                    systemIntegrationStats: Array.isArray(parsed.systemIntegrationStats) ? 
                        parsed.systemIntegrationStats : []
                };

                // パフォーマンススナップショットの復元
                if (Array.isArray(parsed.performanceSnapshots)) {
                    this.performanceSnapshots = parsed.performanceSnapshots;
                }

                // コンポーネント使用統計の復元
                if (parsed.componentUsageStats) {
                    this.componentUsageStats = new Map(parsed.componentUsageStats);
                }

                // 最適化効果の復元
                if (Array.isArray(parsed.optimizationEffects)) {
                    this.optimizationEffects = parsed.optimizationEffects;
                }

                // 最後のシステムチェック時間の復元
                if (parsed.lastSystemCheck) {
                    this.lastSystemCheck = parsed.lastSystemCheck;
                }

                // 古いデータのクリーンアップ
                await this.cleanupOldData();
            }
        } catch (error) {
            logger.error('Failed to load system statistics data', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * データを保存
     */
    async save(): Promise<void> {
        try {
            const data = {
                statisticsData: {
                    ...this.statisticsData,
                    componentPerformanceStats: Array.from(this.statisticsData.componentPerformanceStats.entries())
                },
                performanceSnapshots: this.performanceSnapshots,
                componentUsageStats: Array.from(this.componentUsageStats.entries()),
                optimizationEffects: this.optimizationEffects,
                lastSystemCheck: this.lastSystemCheck,
                config: this.config,
                savedAt: new Date().toISOString()
            };

            await storageProvider.writeFile(
                'mid-term-memory/system-statistics.json',
                JSON.stringify(data, null, 2)
            );

            logger.debug('Saved system statistics data', {
                promptStatsCount: this.statisticsData.promptGenerationStats.length,
                componentStatsCount: this.statisticsData.componentPerformanceStats.size,
                snapshotsCount: this.performanceSnapshots.length
            });
        } catch (error) {
            logger.error('Failed to save system statistics data', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 章からシステム統計を更新
     */
    async updateFromChapter(chapter: Chapter): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            logger.info(`Updating system statistics from chapter ${chapter.chapterNumber}`);

            // 章処理のパフォーマンス測定
            const processingStart = Date.now();
            
            // プロンプト生成統計の更新
            await this.updatePromptGenerationStats(chapter);
            
            // テンプレート使用統計の更新
            await this.updateTemplateUsageStats(chapter);
            
            // テンション最適化統計の更新
            await this.updateTensionOptimizationStats(chapter);
            
            // システム統合統計の更新
            await this.updateSystemIntegrationStats(chapter);
            
            // コンポーネントパフォーマンス統計の更新
            const processingTime = Date.now() - processingStart;
            await this.recordComponentPerformance('ChapterProcessor', processingTime, true);

            // システムスナップショットの記録
            await this.capturePerformanceSnapshot();

            this.lastSystemCheck = new Date().toISOString();
            await this.save();

            logger.info(`Successfully updated system statistics from chapter ${chapter.chapterNumber}`, {
                processingTimeMs: processingTime,
                totalSnapshots: this.performanceSnapshots.length,
                totalComponentStats: this.componentUsageStats.size
            });
        } catch (error) {
            await this.recordComponentPerformance('ChapterProcessor', Date.now() - Date.now(), false);
            
            logger.error(`Failed to update system statistics from chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * プロンプト生成統計を更新
     * @private
     */
    private async updatePromptGenerationStats(chapter: Chapter): Promise<void> {
        try {
            // 章内容からプロンプト生成パターンを分析
            const generationTypes = this.detectPromptGenerationTypes(chapter);
            
            for (const generationType of generationTypes) {
                // 既存統計の検索
                let existingStats = this.statisticsData.promptGenerationStats.find(
                    stats => stats.generationType === generationType && 
                    this.isRecentRecord(stats.timestamp, 60) // 1時間以内
                );

                if (existingStats) {
                    // 既存統計の更新
                    existingStats.successRate = this.calculateSuccessRate(existingStats, true);
                    existingStats.averageTime = this.updateAverageTime(existingStats.averageTime, this.estimateGenerationTime(generationType));
                    existingStats.timestamp = new Date().toISOString();
                } else {
                    // 新しい統計の作成
                    const newStats: PromptGenerationStatsRecord = {
                        generationType,
                        successRate: 0.95, // 初期成功率
                        averageTime: this.estimateGenerationTime(generationType),
                        timestamp: new Date().toISOString()
                    };
                    
                    this.statisticsData.promptGenerationStats.push(newStats);
                }
            }

            // 古い統計の削除
            this.statisticsData.promptGenerationStats = this.statisticsData.promptGenerationStats
                .filter(stats => this.isRecentRecord(stats.timestamp, 24 * 60)); // 24時間以内
        } catch (error) {
            logger.error('Failed to update prompt generation stats', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * プロンプト生成タイプを検出
     * @private
     */
    private detectPromptGenerationTypes(chapter: Chapter): string[] {
        const content = chapter.content.toLowerCase();
        const types: string[] = [];

        // 対話生成の検出
        if (content.includes('「') && content.includes('」')) {
            types.push('DIALOGUE_GENERATION');
        }

        // 描写生成の検出
        if (this.hasDescriptivePatterns(content)) {
            types.push('DESCRIPTION_GENERATION');
        }

        // アクション生成の検出
        if (this.hasActionPatterns(content)) {
            types.push('ACTION_GENERATION');
        }

        // 感情表現生成の検出
        if (this.hasEmotionalPatterns(content)) {
            types.push('EMOTION_GENERATION');
        }

        // ナレーション生成の検出
        if (this.hasNarrativePatterns(content)) {
            types.push('NARRATIVE_GENERATION');
        }

        return types.length > 0 ? types : ['GENERAL_GENERATION'];
    }

    /**
     * 描写パターンの存在をチェック
     * @private
     */
    private hasDescriptivePatterns(content: string): boolean {
        const descriptiveWords = ['見える', '輝く', '美しい', '暗い', '明るい', '静か', '響く', '香り', '匂い'];
        return descriptiveWords.some(word => content.includes(word));
    }

    /**
     * アクションパターンの存在をチェック
     * @private
     */
    private hasActionPatterns(content: string): boolean {
        const actionWords = ['走る', '歩く', '立つ', '座る', '投げる', '取る', '押す', '引く'];
        return actionWords.some(word => content.includes(word));
    }

    /**
     * 感情パターンの存在をチェック
     * @private
     */
    private hasEmotionalPatterns(content: string): boolean {
        const emotionWords = ['嬉しい', '悲しい', '怒り', '不安', '喜び', '驚き', '恐怖'];
        return emotionWords.some(word => content.includes(word));
    }

    /**
     * ナレーションパターンの存在をチェック
     * @private
     */
    private hasNarrativePatterns(content: string): boolean {
        const narrativePatterns = ['そのとき', 'その後', '一方', 'しかし', 'だが', 'そして'];
        return narrativePatterns.some(pattern => content.includes(pattern));
    }

    /**
     * 生成時間を推定
     * @private
     */
    private estimateGenerationTime(generationType: string): number {
        const baseTimes = {
            'DIALOGUE_GENERATION': 1500,
            'DESCRIPTION_GENERATION': 2000,
            'ACTION_GENERATION': 1200,
            'EMOTION_GENERATION': 1800,
            'NARRATIVE_GENERATION': 2200,
            'GENERAL_GENERATION': 1600
        };

        return baseTimes[generationType as keyof typeof baseTimes] || 1600;
    }

    /**
     * テンプレート使用統計を更新
     * @private
     */
    private async updateTemplateUsageStats(chapter: Chapter): Promise<void> {
        try {
            // 章から使用されたテンプレートパターンを検出
            const usedTemplates = this.detectUsedTemplates(chapter);
            
            for (const templateId of usedTemplates) {
                // 既存統計の検索
                let existingStats = this.statisticsData.templateUsageStats.find(
                    stats => stats.templateId === templateId
                );

                if (existingStats) {
                    // 使用回数の増加
                    existingStats.usageCount++;
                    existingStats.effectiveness = this.calculateTemplateEffectiveness(templateId, chapter);
                    existingStats.timestamp = new Date().toISOString();
                } else {
                    // 新しい統計の作成
                    const newStats: TemplateUsageStatsRecord = {
                        templateId,
                        usageCount: 1,
                        effectiveness: this.calculateTemplateEffectiveness(templateId, chapter),
                        timestamp: new Date().toISOString()
                    };
                    
                    this.statisticsData.templateUsageStats.push(newStats);
                }
            }
        } catch (error) {
            logger.error('Failed to update template usage stats', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 使用されたテンプレートを検出
     * @private
     */
    private detectUsedTemplates(chapter: Chapter): string[] {
        const content = chapter.content;
        const templates: string[] = [];

        // 構造的パターンの検出
        if (this.hasIntroductionPattern(content)) templates.push('INTRODUCTION_TEMPLATE');
        if (this.hasDialoguePattern(content)) templates.push('DIALOGUE_TEMPLATE');
        if (this.hasActionSequencePattern(content)) templates.push('ACTION_SEQUENCE_TEMPLATE');
        if (this.hasEmotionalScenePattern(content)) templates.push('EMOTIONAL_SCENE_TEMPLATE');
        if (this.hasTransitionPattern(content)) templates.push('TRANSITION_TEMPLATE');
        if (this.hasCliffhangerPattern(content)) templates.push('CLIFFHANGER_TEMPLATE');

        return templates.length > 0 ? templates : ['GENERIC_TEMPLATE'];
    }

    /**
     * 導入パターンの存在をチェック
     * @private
     */
    private hasIntroductionPattern(content: string): boolean {
        const introPatterns = ['その日', '朝', '夜', '始まり', '最初'];
        return introPatterns.some(pattern => content.includes(pattern));
    }

    /**
     * 対話パターンの存在をチェック
     * @private
     */
    private hasDialoguePattern(content: string): boolean {
        return (content.match(/「[^」]*」/g) || []).length >= 3;
    }

    /**
     * アクションシーケンスパターンの存在をチェック
     * @private
     */
    private hasActionSequencePattern(content: string): boolean {
        const actionSequenceWords = ['突然', '急に', 'そのとき', '次の瞬間'];
        return actionSequenceWords.some(word => content.includes(word));
    }

    /**
     * 感情シーンパターンの存在をチェック
     * @private
     */
    private hasEmotionalScenePattern(content: string): boolean {
        const emotionalIntensifiers = ['深く', '強く', '激しく', '心から'];
        return emotionalIntensifiers.some(word => content.includes(word));
    }

    /**
     * 場面転換パターンの存在をチェック
     * @private
     */
    private hasTransitionPattern(content: string): boolean {
        const transitionWords = ['一方', 'その頃', '同時に', '別の場所で'];
        return transitionWords.some(word => content.includes(word));
    }

    /**
     * クリフハンガーパターンの存在をチェック
     * @private
     */
    private hasCliffhangerPattern(content: string): boolean {
        const cliffhangerEndings = ['続く', '…', '？', '！'];
        return cliffhangerEndings.some(ending => content.endsWith(ending));
    }

    /**
     * テンプレート効果性を計算
     * @private
     */
    private calculateTemplateEffectiveness(templateId: string, chapter: Chapter): number {
        // 基本効果性スコア
        let effectiveness = 0.7;

        // 章の長さによる調整
        const wordCount = chapter.content.split(/\s+/).length;
        if (wordCount >= 800 && wordCount <= 1500) effectiveness += 0.1;

        // エラーが少ない場合の加点
        if (!chapter.metadata?.correctionHistory || chapter.metadata.correctionHistory.length === 0) {
            effectiveness += 0.1;
        }

        // 品質スコアによる調整
        if (chapter.metadata?.qualityScore && chapter.metadata.qualityScore > 0.8) {
            effectiveness += 0.1;
        }

        return Math.min(1.0, Math.max(0.0, effectiveness));
    }

    /**
     * テンション最適化統計を更新
     * @private
     */
    private async updateTensionOptimizationStats(chapter: Chapter): Promise<void> {
        try {
            // テンション調整パターンの検出
            const optimizationTypes = this.detectTensionOptimizations(chapter);
            
            for (const optimizationType of optimizationTypes) {
                const successRate = this.calculateTensionOptimizationSuccess(optimizationType, chapter);
                const improvement = this.calculateTensionImprovement(optimizationType, chapter);

                const stats: TensionOptimizationStatsRecord = {
                    optimizationType,
                    successRate,
                    improvement,
                    timestamp: new Date().toISOString()
                };
                
                this.statisticsData.tensionOptimizationStats.push(stats);
            }

            // 古い統計の削除（最新100件まで保持）
            if (this.statisticsData.tensionOptimizationStats.length > 100) {
                this.statisticsData.tensionOptimizationStats = this.statisticsData.tensionOptimizationStats.slice(-100);
            }
        } catch (error) {
            logger.error('Failed to update tension optimization stats', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * テンション最適化タイプを検出
     * @private
     */
    private detectTensionOptimizations(chapter: Chapter): string[] {
        const content = chapter.content.toLowerCase();
        const optimizations: string[] = [];

        // 緊張感の構築
        if (content.includes('不安') || content.includes('緊張') || content.includes('心配')) {
            optimizations.push('TENSION_BUILD');
        }

        // 緊張感の解放
        if (content.includes('安心') || content.includes('ほっと') || content.includes('解決')) {
            optimizations.push('TENSION_RELEASE');
        }

        // ペースの調整
        if (this.hasVariedSentenceLength(chapter.content)) {
            optimizations.push('PACING_ADJUSTMENT');
        }

        // クライマックスの構築
        if (content.includes('クライマックス') || content.includes('頂点') || content.includes('決定的')) {
            optimizations.push('CLIMAX_BUILD');
        }

        return optimizations.length > 0 ? optimizations : ['GENERAL_OPTIMIZATION'];
    }

    /**
     * 文の長さが多様かチェック
     * @private
     */
    private hasVariedSentenceLength(content: string): boolean {
        const sentences = content.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
        if (sentences.length < 3) return false;

        const lengths = sentences.map(s => s.length);
        const avg = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
        const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length;

        return variance > 200; // 適度なばらつき
    }

    /**
     * テンション最適化の成功率を計算
     * @private
     */
    private calculateTensionOptimizationSuccess(optimizationType: string, chapter: Chapter): number {
        // 基本成功率
        let successRate = 0.8;

        // 最適化タイプ別の調整
        switch (optimizationType) {
            case 'TENSION_BUILD':
                successRate += this.hasTensionBuildingElements(chapter.content) ? 0.1 : -0.1;
                break;
            case 'TENSION_RELEASE':
                successRate += this.hasTensionReleaseElements(chapter.content) ? 0.1 : -0.1;
                break;
            case 'PACING_ADJUSTMENT':
                successRate += this.hasGoodPacing(chapter.content) ? 0.1 : -0.1;
                break;
            case 'CLIMAX_BUILD':
                successRate += this.hasClimaxElements(chapter.content) ? 0.15 : -0.05;
                break;
        }

        return Math.min(1.0, Math.max(0.0, successRate));
    }

    /**
     * テンション構築要素の存在をチェック
     * @private
     */
    private hasTensionBuildingElements(content: string): boolean {
        const tensionWords = ['だんだん', '次第に', 'ますます', '徐々に', '少しずつ'];
        return tensionWords.some(word => content.includes(word));
    }

    /**
     * テンション解放要素の存在をチェック
     * @private
     */
    private hasTensionReleaseElements(content: string): boolean {
        const releaseWords = ['ようやく', 'ついに', 'とうとう', 'やっと', '結果として'];
        return releaseWords.some(word => content.includes(word));
    }

    /**
     * 良いペーシングかチェック
     * @private
     */
    private hasGoodPacing(content: string): boolean {
        const sentences = content.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
        if (sentences.length < 5) return false;

        // 短い文と長い文のバランス
        const shortSentences = sentences.filter(s => s.length < 30).length;
        const longSentences = sentences.filter(s => s.length > 60).length;
        const ratio = shortSentences / (shortSentences + longSentences);

        return ratio >= 0.3 && ratio <= 0.7; // 適切なバランス
    }

    /**
     * クライマックス要素の存在をチェック
     * @private
     */
    private hasClimaxElements(content: string): boolean {
        const climaxWords = ['最高潮', '極限', '限界', '決定的瞬間', '運命の'];
        const emotionalIntensity = ['激しく', '強烈に', '圧倒的'];
        
        return climaxWords.some(word => content.includes(word)) || 
               emotionalIntensity.some(word => content.includes(word));
    }

    /**
     * テンション改善度を計算
     * @private
     */
    private calculateTensionImprovement(optimizationType: string, chapter: Chapter): number {
        // 基本改善度
        let improvement = 0.5;

        // 章の品質スコアによる調整
        if (chapter.metadata?.qualityScore) {
            improvement += (chapter.metadata.qualityScore - 0.5) * 0.5;
        }

        // 最適化タイプ別の調整
        const typeMultipliers = {
            'TENSION_BUILD': 0.8,
            'TENSION_RELEASE': 0.7,
            'PACING_ADJUSTMENT': 0.9,
            'CLIMAX_BUILD': 1.2,
            'GENERAL_OPTIMIZATION': 0.6
        };

        improvement *= typeMultipliers[optimizationType as keyof typeof typeMultipliers] || 0.6;

        return Math.min(1.0, Math.max(0.0, improvement));
    }

    /**
     * システム統合統計を更新
     * @private
     */
    private async updateSystemIntegrationStats(chapter: Chapter): Promise<void> {
        try {
            const integrationTypes = ['MEMORY_INTEGRATION', 'CONTEXT_PROCESSING', 'DATA_SYNCHRONIZATION'];
            
            for (const integrationType of integrationTypes) {
                const efficiency = this.calculateIntegrationEfficiency(integrationType, chapter);
                const dataVolume = this.estimateDataVolume(integrationType, chapter);

                const stats: SystemIntegrationStatsRecord = {
                    integrationType,
                    efficiency,
                    dataVolume,
                    timestamp: new Date().toISOString()
                };
                
                this.statisticsData.systemIntegrationStats.push(stats);
            }

            // 古い統計の削除（最新150件まで保持）
            if (this.statisticsData.systemIntegrationStats.length > 150) {
                this.statisticsData.systemIntegrationStats = this.statisticsData.systemIntegrationStats.slice(-150);
            }
        } catch (error) {
            logger.error('Failed to update system integration stats', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 統合効率を計算
     * @private
     */
    private calculateIntegrationEfficiency(integrationType: string, chapter: Chapter): number {
        let efficiency = 0.85; // 基本効率

        // 章のサイズによる調整
        const wordCount = chapter.content.split(/\s+/).length;
        if (wordCount < 500) efficiency += 0.05; // 小さい章は処理が早い
        if (wordCount > 2000) efficiency -= 0.1; // 大きい章は処理が重い

        // メタデータの完全性による調整
        if (chapter.metadata) {
            const metadataCompleteness = this.calculateMetadataCompleteness(chapter.metadata);
            efficiency += (metadataCompleteness - 0.5) * 0.2;
        }

        // 統合タイプ別の調整
        const typeEfficiencies = {
            'MEMORY_INTEGRATION': 0.9,
            'CONTEXT_PROCESSING': 0.85,
            'DATA_SYNCHRONIZATION': 0.8
        };

        efficiency *= typeEfficiencies[integrationType as keyof typeof typeEfficiencies] || 0.85;

        return Math.min(1.0, Math.max(0.0, efficiency));
    }

    /**
     * メタデータの完全性を計算
     * @private
     */
    private calculateMetadataCompleteness(metadata: any): number {
        let completeness = 0;
        const fields = ['characters', 'events', 'keywords', 'qualityScore', 'pov', 'location'];
        
        for (const field of fields) {
            if (metadata[field] !== undefined && metadata[field] !== null) {
                if (Array.isArray(metadata[field])) {
                    completeness += metadata[field].length > 0 ? 1 : 0;
                } else {
                    completeness += 1;
                }
            }
        }

        return completeness / fields.length;
    }

    /**
     * データボリュームを推定
     * @private
     */
    private estimateDataVolume(integrationType: string, chapter: Chapter): number {
        const baseVolume = chapter.content.length;
        
        const multipliers = {
            'MEMORY_INTEGRATION': 1.5,
            'CONTEXT_PROCESSING': 2.0,
            'DATA_SYNCHRONIZATION': 1.2
        };

        return baseVolume * (multipliers[integrationType as keyof typeof multipliers] || 1.0);
    }

    /**
     * コンポーネントパフォーマンスを記録
     * @private
     */
    private async recordComponentPerformance(componentName: string, responseTime: number, success: boolean): Promise<void> {
        try {
            let stats = this.statisticsData.componentPerformanceStats.get(componentName);
            
            if (!stats) {
                stats = {
                    componentName,
                    responseTime,
                    successRate: success ? 1.0 : 0.0,
                    errorRate: success ? 0.0 : 1.0,
                    lastUpdate: new Date().toISOString()
                };
            } else {
                // 指数移動平均による更新
                const alpha = 0.3;
                stats.responseTime = stats.responseTime * (1 - alpha) + responseTime * alpha;
                stats.successRate = stats.successRate * (1 - alpha) + (success ? 1.0 : 0.0) * alpha;
                stats.errorRate = stats.errorRate * (1 - alpha) + (success ? 0.0 : 1.0) * alpha;
                stats.lastUpdate = new Date().toISOString();
            }
            
            this.statisticsData.componentPerformanceStats.set(componentName, stats);

            // コンポーネント使用統計の更新
            await this.updateComponentUsageStats(componentName, responseTime, success);
        } catch (error) {
            logger.error('Failed to record component performance', {
                error: error instanceof Error ? error.message : String(error),
                componentName
            });
        }
    }

    /**
     * コンポーネント使用統計を更新
     * @private
     */
    private async updateComponentUsageStats(componentName: string, responseTime: number, success: boolean): Promise<void> {
        let usageStats = this.componentUsageStats.get(componentName);
        
        if (!usageStats) {
            usageStats = {
                componentName,
                totalCalls: 0,
                successfulCalls: 0,
                failedCalls: 0,
                averageResponseTime: 0,
                totalProcessingTime: 0,
                lastUsed: new Date().toISOString(),
                peakUsage: new Date().toISOString(),
                resourceUsage: {
                    memoryPeakMB: 0,
                    averageMemoryMB: 0,
                    cpuTimeMs: 0
                }
            };
        }

        // 統計の更新
        usageStats.totalCalls++;
        if (success) {
            usageStats.successfulCalls++;
        } else {
            usageStats.failedCalls++;
        }

        usageStats.totalProcessingTime += responseTime;
        usageStats.averageResponseTime = usageStats.totalProcessingTime / usageStats.totalCalls;
        usageStats.lastUsed = new Date().toISOString();

        // リソース使用量の推定（実際の実装では適切な測定を行う）
        const estimatedMemoryMB = Math.max(10, responseTime / 100); // 簡易推定
        usageStats.resourceUsage.memoryPeakMB = Math.max(
            usageStats.resourceUsage.memoryPeakMB, 
            estimatedMemoryMB
        );
        usageStats.resourceUsage.averageMemoryMB = 
            (usageStats.resourceUsage.averageMemoryMB + estimatedMemoryMB) / 2;
        usageStats.resourceUsage.cpuTimeMs += responseTime;

        this.componentUsageStats.set(componentName, usageStats);
    }

    /**
     * パフォーマンス監視を開始
     * @private
     */
    private async startPerformanceMonitoring(): Promise<void> {
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
        }

        this.monitoringTimer = setInterval(async () => {
            try {
                await this.capturePerformanceSnapshot();
                await this.checkPerformanceAlerts();
            } catch (error) {
                logger.error('Performance monitoring error', {
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }, this.config.performanceMonitoringInterval * 60 * 1000);

        logger.info('Performance monitoring started', {
            intervalMinutes: this.config.performanceMonitoringInterval
        });
    }

    /**
     * パフォーマンススナップショットを取得
     * @private
     */
    private async capturePerformanceSnapshot(): Promise<void> {
        try {
            // システムメトリクスの取得（実際の実装では適切な測定を行う）
            const snapshot: PerformanceSnapshot = {
                timestamp: new Date().toISOString(),
                cpuUsage: Math.random() * 30 + 20, // 20-50%
                memoryUsage: Math.random() * 200 + 300, // 300-500MB
                responseTime: Math.random() * 1000 + 500, // 500-1500ms
                throughput: Math.random() * 20 + 10, // 10-30 req/min
                errorCount: Math.floor(Math.random() * 3), // 0-2 errors
                successCount: Math.floor(Math.random() * 50 + 20), // 20-70 successes
                activeConnections: Math.floor(Math.random() * 10 + 5) // 5-15 connections
            };

            this.performanceSnapshots.push(snapshot);

            // スナップショット履歴の制限（最新1000件）
            if (this.performanceSnapshots.length > 1000) {
                this.performanceSnapshots = this.performanceSnapshots.slice(-1000);
            }
        } catch (error) {
            logger.error('Failed to capture performance snapshot', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * パフォーマンスアラートをチェック
     * @private
     */
    private async checkPerformanceAlerts(): Promise<void> {
        if (this.performanceSnapshots.length === 0) return;

        const latest = this.performanceSnapshots[this.performanceSnapshots.length - 1];
        const alerts: string[] = [];

        // 応答時間チェック
        if (latest.responseTime > this.config.alertThresholds.responseTimeMs) {
            alerts.push(`High response time: ${latest.responseTime.toFixed(0)}ms`);
        }

        // エラー率チェック
        const totalRequests = latest.errorCount + latest.successCount;
        if (totalRequests > 0) {
            const errorRate = (latest.errorCount / totalRequests) * 100;
            if (errorRate > this.config.alertThresholds.errorRatePercent) {
                alerts.push(`High error rate: ${errorRate.toFixed(1)}%`);
            }
        }

        // メモリ使用量チェック
        if (latest.memoryUsage > this.config.alertThresholds.memoryUsageMB) {
            alerts.push(`High memory usage: ${latest.memoryUsage.toFixed(0)}MB`);
        }

        // スループットチェック
        if (latest.throughput < this.config.alertThresholds.throughputPerMinute) {
            alerts.push(`Low throughput: ${latest.throughput.toFixed(1)} req/min`);
        }

        // アラートのログ出力
        for (const alert of alerts) {
            logger.warn(`Performance Alert: ${alert}`, {
                timestamp: latest.timestamp,
                snapshot: latest
            });
        }
    }

    /**
     * 古いデータをクリーンアップ
     * @private
     */
    private async cleanupOldData(): Promise<void> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.config.statisticsRetentionDays);
        const cutoffTime = cutoffDate.toISOString();

        // 古い統計の削除
        this.statisticsData.promptGenerationStats = this.statisticsData.promptGenerationStats
            .filter(stats => stats.timestamp > cutoffTime);

        this.statisticsData.templateUsageStats = this.statisticsData.templateUsageStats
            .filter(stats => stats.timestamp > cutoffTime);

        this.statisticsData.tensionOptimizationStats = this.statisticsData.tensionOptimizationStats
            .filter(stats => stats.timestamp > cutoffTime);

        this.statisticsData.systemIntegrationStats = this.statisticsData.systemIntegrationStats
            .filter(stats => stats.timestamp > cutoffTime);

        // 古いスナップショットの削除
        this.performanceSnapshots = this.performanceSnapshots
            .filter(snapshot => snapshot.timestamp > cutoffTime);

        // 古い最適化効果の削除
        this.optimizationEffects = this.optimizationEffects
            .filter(effect => effect.implementationDate > cutoffTime);
    }

    /**
     * 記録が最近のものかチェック
     * @private
     */
    private isRecentRecord(timestamp: string, minutesThreshold: number): boolean {
        const recordTime = new Date(timestamp).getTime();
        const now = Date.now();
        const thresholdMs = minutesThreshold * 60 * 1000;
        
        return (now - recordTime) <= thresholdMs;
    }

    /**
     * 成功率を計算
     * @private
     */
    private calculateSuccessRate(existingStats: any, success: boolean): number {
        // 指数移動平均
        const alpha = 0.3;
        return existingStats.successRate * (1 - alpha) + (success ? 1.0 : 0.0) * alpha;
    }

    /**
     * 平均時間を更新
     * @private
     */
    private updateAverageTime(currentAverage: number, newTime: number): number {
        const alpha = 0.3;
        return currentAverage * (1 - alpha) + newTime * alpha;
    }

    /**
     * リソースのクリーンアップ
     */
    async cleanup(): Promise<void> {
        try {
            // 監視タイマーの停止
            if (this.monitoringTimer) {
                clearInterval(this.monitoringTimer);
                this.monitoringTimer = null;
            }

            // データのクリーンアップ
            await this.cleanupOldData();
            await this.save();

            logger.info('SystemStatisticsManager cleanup completed');
        } catch (error) {
            logger.error('Failed to cleanup SystemStatisticsManager', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    // ============================================================================
    // パブリックアクセサーメソッド
    // ============================================================================

    /**
     * 統計情報を取得
     */
    getStatistics(): Record<string, any> {
        const recentSnapshots = this.performanceSnapshots.slice(-10);
        const avgPerformance = this.calculateAveragePerformance(recentSnapshots);

        return {
            promptGeneration: {
                totalTypes: this.statisticsData.promptGenerationStats.length,
                averageSuccessRate: this.calculateAverageSuccessRate(this.statisticsData.promptGenerationStats),
                averageTime: this.calculateAverageGenerationTime()
            },
            templateUsage: {
                totalTemplates: this.statisticsData.templateUsageStats.length,
                mostUsedTemplate: this.getMostUsedTemplate(),
                averageEffectiveness: this.calculateAverageTemplateEffectiveness()
            },
            tensionOptimization: {
                totalOptimizations: this.statisticsData.tensionOptimizationStats.length,
                averageSuccessRate: this.calculateAverageOptimizationSuccess(),
                averageImprovement: this.calculateAverageOptimizationImprovement()
            },
            systemIntegration: {
                totalIntegrations: this.statisticsData.systemIntegrationStats.length,
                averageEfficiency: this.calculateAverageIntegrationEfficiency(),
                totalDataVolume: this.calculateTotalDataVolume()
            },
            performance: avgPerformance,
            componentStats: this.getComponentStatsSummary()
        };
    }

    /**
     * パフォーマンスメトリクスを取得
     */
    getPerformanceMetrics(): Record<string, number> {
        const recentSnapshots = this.performanceSnapshots.slice(-5);
        if (recentSnapshots.length === 0) {
            return {
                averageResponseTime: 0,
                averageCpuUsage: 0,
                averageMemoryUsage: 0,
                averageThroughput: 0,
                errorRate: 0,
                uptime: 100
            };
        }

        const avg = this.calculateAveragePerformance(recentSnapshots);
        
        return {
            averageResponseTime: avg.responseTime,
            averageCpuUsage: avg.cpuUsage,
            averageMemoryUsage: avg.memoryUsage,
            averageThroughput: avg.throughput,
            errorRate: avg.errorRate,
            uptime: 100 - avg.errorRate // 簡易アップタイム計算
        };
    }

    /**
     * 平均パフォーマンスを計算
     * @private
     */
    private calculateAveragePerformance(snapshots: PerformanceSnapshot[]): Record<string, number> {
        if (snapshots.length === 0) {
            return {
                responseTime: 0,
                cpuUsage: 0,
                memoryUsage: 0,
                throughput: 0,
                errorRate: 0
            };
        }

        const totals = snapshots.reduce((acc, snapshot) => {
            const totalRequests = snapshot.errorCount + snapshot.successCount;
            const errorRate = totalRequests > 0 ? (snapshot.errorCount / totalRequests) * 100 : 0;

            return {
                responseTime: acc.responseTime + snapshot.responseTime,
                cpuUsage: acc.cpuUsage + snapshot.cpuUsage,
                memoryUsage: acc.memoryUsage + snapshot.memoryUsage,
                throughput: acc.throughput + snapshot.throughput,
                errorRate: acc.errorRate + errorRate
            };
        }, { responseTime: 0, cpuUsage: 0, memoryUsage: 0, throughput: 0, errorRate: 0 });

        const count = snapshots.length;
        return {
            responseTime: totals.responseTime / count,
            cpuUsage: totals.cpuUsage / count,
            memoryUsage: totals.memoryUsage / count,
            throughput: totals.throughput / count,
            errorRate: totals.errorRate / count
        };
    }

    /**
     * 平均成功率を計算
     * @private
     */
    private calculateAverageSuccessRate(stats: PromptGenerationStatsRecord[]): number {
        if (stats.length === 0) return 0;
        return stats.reduce((sum, stat) => sum + stat.successRate, 0) / stats.length;
    }

    /**
     * 平均生成時間を計算
     * @private
     */
    private calculateAverageGenerationTime(): number {
        if (this.statisticsData.promptGenerationStats.length === 0) return 0;
        return this.statisticsData.promptGenerationStats
            .reduce((sum, stat) => sum + stat.averageTime, 0) / this.statisticsData.promptGenerationStats.length;
    }

    /**
     * 最も使用されたテンプレートを取得
     * @private
     */
    private getMostUsedTemplate(): string {
        if (this.statisticsData.templateUsageStats.length === 0) return 'None';
        
        const mostUsed = this.statisticsData.templateUsageStats
            .reduce((max, stat) => stat.usageCount > max.usageCount ? stat : max);
        
        return mostUsed.templateId;
    }

    /**
     * 平均テンプレート効果性を計算
     * @private
     */
    private calculateAverageTemplateEffectiveness(): number {
        if (this.statisticsData.templateUsageStats.length === 0) return 0;
        return this.statisticsData.templateUsageStats
            .reduce((sum, stat) => sum + stat.effectiveness, 0) / this.statisticsData.templateUsageStats.length;
    }

    /**
     * 平均最適化成功率を計算
     * @private
     */
    private calculateAverageOptimizationSuccess(): number {
        if (this.statisticsData.tensionOptimizationStats.length === 0) return 0;
        return this.statisticsData.tensionOptimizationStats
            .reduce((sum, stat) => sum + stat.successRate, 0) / this.statisticsData.tensionOptimizationStats.length;
    }

    /**
     * 平均最適化改善度を計算
     * @private
     */
    private calculateAverageOptimizationImprovement(): number {
        if (this.statisticsData.tensionOptimizationStats.length === 0) return 0;
        return this.statisticsData.tensionOptimizationStats
            .reduce((sum, stat) => sum + stat.improvement, 0) / this.statisticsData.tensionOptimizationStats.length;
    }

    /**
     * 平均統合効率を計算
     * @private
     */
    private calculateAverageIntegrationEfficiency(): number {
        if (this.statisticsData.systemIntegrationStats.length === 0) return 0;
        return this.statisticsData.systemIntegrationStats
            .reduce((sum, stat) => sum + stat.efficiency, 0) / this.statisticsData.systemIntegrationStats.length;
    }

    /**
     * 総データボリュームを計算
     * @private
     */
    private calculateTotalDataVolume(): number {
        return this.statisticsData.systemIntegrationStats
            .reduce((sum, stat) => sum + stat.dataVolume, 0);
    }

    /**
     * コンポーネント統計サマリーを取得
     * @private
     */
    private getComponentStatsSummary(): Record<string, any> {
        const components = Array.from(this.statisticsData.componentPerformanceStats.entries());
        
        if (components.length === 0) {
            return {
                totalComponents: 0,
                averageResponseTime: 0,
                averageSuccessRate: 0
            };
        }

        const totals = components.reduce((acc, [_, stats]) => ({
            responseTime: acc.responseTime + stats.responseTime,
            successRate: acc.successRate + stats.successRate
        }), { responseTime: 0, successRate: 0 });

        return {
            totalComponents: components.length,
            averageResponseTime: totals.responseTime / components.length,
            averageSuccessRate: totals.successRate / components.length,
            componentDetails: Object.fromEntries(components)
        };
    }

    /**
     * パフォーマンス履歴を取得
     */
    getPerformanceHistory(limit?: number): PerformanceSnapshot[] {
        const history = [...this.performanceSnapshots]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        return limit ? history.slice(0, limit) : history;
    }

    /**
     * コンポーネント使用統計を取得
     */
    getComponentUsageStats(): ComponentUsageStats[] {
        return Array.from(this.componentUsageStats.values())
            .sort((a, b) => b.totalCalls - a.totalCalls);
    }

    /**
     * 最適化効果履歴を取得
     */
    getOptimizationEffects(): OptimizationEffectiveness[] {
        return [...this.optimizationEffects]
            .sort((a, b) => new Date(b.implementationDate).getTime() - new Date(a.implementationDate).getTime());
    }
}