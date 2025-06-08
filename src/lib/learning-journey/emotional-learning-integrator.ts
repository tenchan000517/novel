/**
 * @fileoverview 感情学習統合器 - 完全版メインクラス
 * @description 
 * 分割されたコンポーネントを統合し、統一されたAPIを提供する完全版メインクラス。
 * 元の機能をすべて保持しつつ、適切に分割されたアーキテクチャで実装。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { EventBus } from './event-bus';
import { LearningStage } from './concept-learning-manager';
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { MemoryLevel } from '@/lib/memory/core/types';
import { Chapter } from '@/types/chapters';

// 分割された型定義とコンポーネントのインポート
import {
    EmotionalArcDesign,
    EmpatheticPoint,
    CatharticExperience,
    EmotionLearningSyncMetrics,
    EmotionalLearningIntegratorConfig,
    PerformanceMetrics,
    IntegratedEmotionalPlan,
    EmotionalIntegratorDiagnostics,
    BusinessFrameworkName,
    EmotionAnalysisResult
} from './emotional-types';

// ヘルパー・コンポーネントのインポート
import {
    safeMemoryOperation,
    verifyMemorySystemIntegration,
    getMemorySystemStatusSafe,
    diagnoseMemoryOperations
} from './business-frameworks/memory-operations';

import { ContentProcessingHelper } from './business-frameworks/content-processing';

// 専門コンポーネントのインポート
import { EmotionalArcDesigner } from './business-frameworks/emotional-arc-designer';
import { EmpatheticPointsGenerator } from './business-frameworks/empathetic-points-generator';
import { CatharticExperienceDesigner } from './business-frameworks/cathartic-experience-designer';

// ビジネスフレームワーク戦略のインポート
import { 
    businessFrameworkStrategyFactory,
    getBusinessFrameworkStrategy 
} from './business-frameworks/strategy-factory';

// プロンプト生成器のインポート
import {
    createSynchronizationPrompt,
    createEmotionAnalysisPrompt
} from './business-frameworks/prompt-generators';

// バリデーション・解析ヘルパーのインポート
import {
    parseSynchronizationResponse,
    parseEmotionAnalysisResponse
} from './business-frameworks/validation-helpers';

/**
 * @class EmotionalLearningIntegrator
 * @description
 * 感情学習統合の完全版クラス。
 * 分割されたコンポーネントを統合し、元の全機能を提供。
 */
export class EmotionalLearningIntegrator {
    private config: Required<EmotionalLearningIntegratorConfig>;
    private initialized: boolean = false;
    private performanceStats!: PerformanceMetrics;
    
    // 専門コンポーネント
    private emotionalArcDesigner!: EmotionalArcDesigner;
    private empatheticPointsGenerator!: EmpatheticPointsGenerator;
    private catharticExperienceDesigner!: CatharticExperienceDesigner;
    private contentProcessingHelper!: ContentProcessingHelper;

    /**
     * コンストラクタ - 依存注入パターンで完全実装
     */
    constructor(
        private memoryManager: MemoryManager,
        private geminiClient: GeminiClient,
        private eventBus: EventBus,
        config?: Partial<EmotionalLearningIntegratorConfig>
    ) {
        this.validateConfiguration(config);
        this.config = this.mergeWithDefaults(config);
        this.initializeInternalState();
        this.initializeComponents();

        logger.info('EmotionalLearningIntegrator (complete) initialized with all components');
    }

    /**
     * 専門コンポーネントの初期化
     * @private
     */
    private initializeComponents(): void {
        this.emotionalArcDesigner = new EmotionalArcDesigner(this.memoryManager, this.config);
        this.empatheticPointsGenerator = new EmpatheticPointsGenerator(this.geminiClient, this.config);
        this.catharticExperienceDesigner = new CatharticExperienceDesigner(this.geminiClient, this.config);
        this.contentProcessingHelper = new ContentProcessingHelper(this.geminiClient, this.config);
    }

    /**
     * システム初期化
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('EmotionalLearningIntegrator already initialized');
            return;
        }

        try {
            if (this.config.useMemorySystemIntegration) {
                await verifyMemorySystemIntegration(this.memoryManager);
            }

            this.initialized = true;
            logger.info('EmotionalLearningIntegrator initialization completed successfully');

        } catch (error) {
            logger.error('Failed to initialize EmotionalLearningIntegrator', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 学習段階に適した感情アークを設計する（プロット・キャラクター統合強化版）
     * @param conceptName 概念名
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @returns 感情アーク設計
     */
    async designEmotionalArc(
        conceptName: string,
        stage: LearningStage,
        chapterNumber: number
    ): Promise<EmotionalArcDesign> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();
            this.performanceStats.totalAnalyses++;

            logger.info(`Designing emotional arc for concept ${conceptName} at stage ${stage} with plot and character integration`);

            // 専門コンポーネントによる統合感情アーク設計
            const emotionalArc = await this.emotionalArcDesigner.designIntegratedEmotionalArc(
                conceptName, 
                stage, 
                chapterNumber
            );

            // 統合記憶システムへの保存
            await this.saveEmotionalArcToMemory(emotionalArc, conceptName, stage, chapterNumber);

            // イベント発行（統合情報付き）
            this.eventBus.publish('emotional.arc.designed', {
                conceptName,
                stage,
                chapterNumber,
                arc: emotionalArc,
                integratedDesign: true
            });

            this.updatePerformanceMetrics(Date.now() - startTime, true);
            return emotionalArc;

        } catch (error) {
            this.updatePerformanceMetrics(Date.now() - startTime, false);
            logger.error(`Failed to design emotional arc for ${conceptName}`, { error });
            return this.createDefaultEmotionalArc();
        }
    }

    /**
     * ビジネスフレームワーク特化感情アークを設計する
     * @param frameworkName フレームワーク名
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @returns フレームワーク特化感情アーク
     */
    async designBusinessFrameworkEmotionalArc(
        frameworkName: BusinessFrameworkName,
        stage: LearningStage,
        chapterNumber: number
    ): Promise<EmotionalArcDesign> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();
            this.performanceStats.totalAnalyses++;

            logger.info(`Designing business framework emotional arc for ${frameworkName} at stage ${stage}`);

            // 対応する戦略クラスから感情アークを取得
            const strategy = getBusinessFrameworkStrategy(frameworkName);
            let emotionalArc = strategy.createEmotionalArc(stage, chapterNumber);

            // ビジネス学習段階対応の強化
            if (this.isBusinessLearningStage(stage)) {
                emotionalArc = strategy['enhanceEmotionalArcForBusinessStage'](emotionalArc, stage);
            }

            // 統合記憶システムへの保存
            await this.saveBusinessFrameworkArcToMemory(emotionalArc, frameworkName, stage, chapterNumber);

            // イベント発行
            this.eventBus.publish('emotional.arc.designed', {
                frameworkName,
                stage,
                chapterNumber,
                arc: emotionalArc,
                businessFrameworkIntegrated: true
            });

            this.updatePerformanceMetrics(Date.now() - startTime, true);
            return emotionalArc;

        } catch (error) {
            this.updatePerformanceMetrics(Date.now() - startTime, false);
            logger.error(`Failed to design business framework emotional arc for ${frameworkName}`, { error });
            return this.createDefaultEmotionalArc();
        }
    }

    /**
     * ビジネスフレームワーク特化共感ポイントを生成する
     * @param frameworkName フレームワーク名
     * @param stage 学習段階
     * @param content 章内容（オプション）
     * @returns フレームワーク特化共感ポイント
     */
    async generateBusinessFrameworkEmpatheticPoints(
        frameworkName: BusinessFrameworkName,
        stage: LearningStage,
        content?: string
    ): Promise<EmpatheticPoint[]> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();
            this.performanceStats.totalAnalyses++;

            logger.info(`Generating business framework empathetic points for ${frameworkName} at stage ${stage}`);

            // 専門コンポーネントによる生成
            const empatheticPoints = await this.empatheticPointsGenerator.generateBusinessFrameworkPoints(
                frameworkName,
                stage,
                content
            );

            // イベント発行
            this.eventBus.publish('empathetic.points.generated', {
                frameworkName,
                stage,
                points: empatheticPoints,
                businessFrameworkIntegrated: true
            });

            this.updatePerformanceMetrics(Date.now() - startTime, true);
            return empatheticPoints;

        } catch (error) {
            this.updatePerformanceMetrics(Date.now() - startTime, false);
            logger.error(`Failed to generate business framework empathetic points for ${frameworkName}`, { error });
            return this.createDefaultEmpatheticPoints(stage);
        }
    }

    /**
     * カタルシス体験を設計する
     * @param conceptName 概念名
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @param content 章内容（オプション）
     * @returns カタルシス体験の設計
     */
    async designCatharticExperience(
        conceptName: string,
        stage: LearningStage,
        chapterNumber: number,
        content?: string
    ): Promise<CatharticExperience | null> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();
            this.performanceStats.totalAnalyses++;

            logger.info(`Designing cathartic experience for ${conceptName} at stage ${stage}`);

            // 専門コンポーネントによるカタルシス体験設計
            const catharticExperience = await this.catharticExperienceDesigner.designCatharticExperience(
                conceptName,
                stage,
                chapterNumber,
                content
            );

            // 統合記憶システムを使用した情報保存
            if (catharticExperience) {
                await this.saveCatharticExperienceToMemory(catharticExperience, conceptName, stage, chapterNumber);
            }

            // イベント発行
            this.eventBus.publish('cathartic.experience.designed', {
                conceptName,
                stage,
                chapterNumber,
                experience: catharticExperience
            });

            this.updatePerformanceMetrics(Date.now() - startTime, true);
            return catharticExperience;

        } catch (error) {
            this.updatePerformanceMetrics(Date.now() - startTime, false);
            logger.error(`Failed to design cathartic experience for ${conceptName}`, { error });
            return null;
        }
    }

    /**
     * 感情と学習の同期度を分析する
     * @param chapterContent 章内容
     * @param conceptName 概念名
     * @param stage 学習段階
     * @returns 感情学習同期指標
     */
    async analyzeSynchronization(
        chapterContent: string,
        conceptName: string,
        stage: LearningStage
    ): Promise<EmotionLearningSyncMetrics> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();
            this.performanceStats.totalAnalyses++;

            logger.info(`Analyzing emotion-learning synchronization for ${conceptName} at stage ${stage}`);

            // コンテンツの安全な切り詰め
            const truncatedContent = this.contentProcessingHelper.safeContentTruncation(chapterContent, 5000);

            // AIを使って章内容を分析
            const prompt = createSynchronizationPrompt(truncatedContent, conceptName, stage);

            const response = await this.contentProcessingHelper.executeAIAnalysis(prompt, {
                temperature: 0.1,
                responseFormat: 'json'
            }, `sync_${conceptName}_${stage}`);

            // レスポンスの安全な解析
            const metrics = parseSynchronizationResponse(response);

            // 統合記憶システムを使用した結果保存
            await this.saveSynchronizationMetricsToMemory(metrics, conceptName, stage);

            // イベント発行
            this.eventBus.publish('emotion.learning.synchronized', {
                conceptName,
                stage,
                metrics
            });

            this.updatePerformanceMetrics(Date.now() - startTime, true);
            return metrics;

        } catch (error) {
            this.updatePerformanceMetrics(Date.now() - startTime, false);
            logger.error(`Failed to analyze synchronization for ${conceptName}`, { error });
            return this.createDefaultSyncMetrics();
        }
    }

    /**
     * 共感ポイントを生成する
     * @param chapterContent 章内容
     * @param conceptName 概念名
     * @param stage 学習段階
     * @returns 共感ポイントの配列
     */
    async generateEmpatheticPoints(
        chapterContent: string,
        conceptName: string,
        stage: LearningStage
    ): Promise<EmpatheticPoint[]> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();
            this.performanceStats.totalAnalyses++;

            logger.info(`Generating empathetic points for ${conceptName} at stage ${stage}`);

            // 専門コンポーネントによる共感ポイント生成
            const validatedPoints = await this.empatheticPointsGenerator.generateFromContent(
                chapterContent,
                conceptName,
                stage
            );

            // イベント発行
            this.eventBus.publish('empathetic.points.generated', {
                conceptName,
                stage,
                points: validatedPoints
            });

            this.updatePerformanceMetrics(Date.now() - startTime, true);
            return validatedPoints;

        } catch (error) {
            this.updatePerformanceMetrics(Date.now() - startTime, false);
            logger.error(`Failed to generate empathetic points for ${conceptName}`, { error });
            return this.createDefaultEmpatheticPoints(stage);
        }
    }

    /**
     * 章内容に基づいた感情分析を行う
     * @param chapterContent 章内容
     * @param genre ジャンル
     * @returns 感情分析結果
     */
    async analyzeChapterEmotion(
        chapterContent: string,
        genre: string = 'business'
    ): Promise<EmotionAnalysisResult> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();
            this.performanceStats.totalAnalyses++;

            logger.info(`Analyzing chapter emotion`);

            // コンテンツの安全な切り詰め
            const truncatedContent = this.contentProcessingHelper.safeContentTruncation(chapterContent, 5000);

            const prompt = createEmotionAnalysisPrompt(truncatedContent, genre);

            const response = await this.contentProcessingHelper.executeAIAnalysis(prompt, {
                temperature: 0.1,
                responseFormat: 'json'
            }, `emotion_${genre}_${truncatedContent.substring(0, 50)}`);

            // レスポンスの安全な解析
            const analysis = parseEmotionAnalysisResponse(response);

            // イベント発行
            this.eventBus.publish('chapter.emotion.analyzed', {
                analysis
            });

            this.updatePerformanceMetrics(Date.now() - startTime, true);
            return analysis;

        } catch (error) {
            this.updatePerformanceMetrics(Date.now() - startTime, false);
            logger.error(`Failed to analyze chapter emotion`, { error });

            // デフォルト分析結果を返す
            return {
                overallTone: "中立的",
                emotionalImpact: 5
            };
        }
    }

    /**
     * 感情と学習の統合計画を生成する
     * @param conceptName 概念名
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @returns 感情学習統合計画
     */
    async createIntegratedPlan(
        conceptName: string,
        stage: LearningStage,
        chapterNumber: number
    ): Promise<IntegratedEmotionalPlan> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();
            this.performanceStats.totalAnalyses++;

            logger.info(`Creating integrated emotion-learning plan for ${conceptName} at stage ${stage}`);

            // 1. 感情アークの設計
            const emotionalArc = await this.designEmotionalArc(conceptName, stage, chapterNumber);

            // 2. カタルシス体験の設計
            const catharticExperience = await this.designCatharticExperience(conceptName, stage, chapterNumber);

            // 3. 共感ポイント生成
            const empatheticPoints = this.createDefaultEmpatheticPoints(stage);

            // 4. 同期推奨事項の生成
            const syncRecommendations = this.generateSyncRecommendations(stage);

            // 統合計画を統合記憶システムに保存
            await this.saveIntegratedPlanToMemory({
                emotionalArc,
                catharticExperience,
                empatheticPoints,
                syncRecommendations
            }, conceptName, stage, chapterNumber);

            this.updatePerformanceMetrics(Date.now() - startTime, true);

            // 統合計画を返す
            return {
                emotionalArc,
                catharticExperience,
                empatheticPoints,
                syncRecommendations
            };

        } catch (error) {
            this.updatePerformanceMetrics(Date.now() - startTime, false);
            logger.error(`Failed to create integrated plan for ${conceptName}`, { error });

            // エラー時はデフォルト計画を返す
            return {
                emotionalArc: this.createDefaultEmotionalArc(),
                catharticExperience: null,
                empatheticPoints: this.createDefaultEmpatheticPoints(stage),
                syncRecommendations: []
            };
        }
    }

    /**
     * セクションの感情アーク設計と同期する
     * @param sectionId セクションID
     * @param emotionalDesign 感情設計データ
     */
    async synchronizeWithSection(
        sectionId: string,
        emotionalDesign: any
    ): Promise<void> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();

            logger.info(`Synchronizing emotional design for section ${sectionId}`);

            // 統合記憶システムを使用してセクション関連データを保存
            await safeMemoryOperation(
                this.memoryManager,
                async () => {
                    const chapter: Chapter = {
                        id: `section-emotional-${sectionId}`,
                        chapterNumber: -1,
                        title: `Section Emotional Design ${sectionId}`,
                        content: JSON.stringify(emotionalDesign),
                        previousChapterSummary: '',
                        scenes: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        metadata: {
                            createdAt: new Date().toISOString(),
                            lastModified: new Date().toISOString(),
                            status: 'section_emotional_design',
                            sectionId,
                            emotionalDesign,
                            type: 'section_emotional_design',
                            wordCount: JSON.stringify(emotionalDesign).length,
                            estimatedReadingTime: 1
                        }
                    };

                    return await this.memoryManager.processChapter(chapter);
                },
                null,
                'synchronizeWithSection',
                this.config
            );

            // 感情学習の同期イベントを発行
            this.eventBus.publish('emotion.learning.synchronized', {
                sectionId,
                timestamp: new Date().toISOString(),
                emotionalDesignData: {
                    emotionalArc: emotionalDesign.emotionalArc,
                    catharticMoment: emotionalDesign.catharticMoment
                }
            });

            this.updatePerformanceMetrics(Date.now() - startTime, true);

            logger.info(`Successfully synchronized emotional design for section ${sectionId}`);

        } catch (error) {
            this.updatePerformanceMetrics(Date.now() - startTime, false);
            logger.error(`Failed to synchronize emotional design with section`, { error });
            throw error;
        }
    }

    /**
     * 診断情報を取得
     */
    async performDiagnostics(): Promise<EmotionalIntegratorDiagnostics> {
        try {
            const memorySystemStatus = await getMemorySystemStatusSafe(this.memoryManager, this.config);
            const memoryDiagnostics = await diagnoseMemoryOperations(this.memoryManager, this.config);
            
            const recommendations: string[] = [];

            // パフォーマンス推奨事項
            if (this.performanceStats.averageProcessingTime > 2000) {
                recommendations.push('Consider optimizing AI response times');
            }

            if (this.performanceStats.cacheEfficiencyRate < 0.7) {
                recommendations.push('Improve caching strategy for emotional designs');
            }

            // コンポーネント診断
            const processingStats = this.contentProcessingHelper.getProcessingStatistics();
            if (processingStats.failedAnalyses > processingStats.successfulAnalyses * 0.1) {
                recommendations.push('High AI analysis failure rate detected');
            }

            // メモリシステム推奨事項を統合
            recommendations.push(...memoryDiagnostics.recommendations);

            return {
                initialized: this.initialized,
                performanceMetrics: { ...this.performanceStats },
                memorySystemStatus,
                recommendations,
                memorySystemError: memoryDiagnostics.lastError
            };

        } catch (error) {
            logger.error('Failed to perform diagnostics', { error });
            return {
                initialized: this.initialized,
                performanceMetrics: { ...this.performanceStats },
                memorySystemStatus: { initialized: false },
                recommendations: ['System diagnostics failed - check logs'],
                memorySystemError: error instanceof Error ? error.message : String(error)
            };
        }
    }

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

    private validateConfiguration(config?: Partial<EmotionalLearningIntegratorConfig>): void {
        if (!this.memoryManager) {
            throw new Error('MemoryManager is required for EmotionalLearningIntegrator initialization');
        }
        if (!this.geminiClient) {
            throw new Error('GeminiClient is required for EmotionalLearningIntegrator initialization');
        }
        if (!this.eventBus) {
            throw new Error('EventBus is required for EmotionalLearningIntegrator initialization');
        }
    }

    private mergeWithDefaults(config?: Partial<EmotionalLearningIntegratorConfig>): Required<EmotionalLearningIntegratorConfig> {
        return {
            useMemorySystemIntegration: true,
            enableAdvancedAnalysis: true,
            cacheEmotionalDesigns: true,
            maxRetries: 3,
            timeoutMs: 30000,
            ...config
        };
    }

    private initializeInternalState(): void {
        this.performanceStats = {
            totalAnalyses: 0,
            successfulAnalyses: 0,
            failedAnalyses: 0,
            averageProcessingTime: 0,
            memorySystemHits: 0,
            cacheEfficiencyRate: 0,
            lastOptimization: new Date().toISOString()
        };
    }

    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }
    }

    private isBusinessLearningStage(stage: LearningStage): boolean {
        return [
            LearningStage.INTRODUCTION,
            LearningStage.THEORY_APPLICATION,
            LearningStage.FAILURE_EXPERIENCE,
            LearningStage.PRACTICAL_MASTERY
        ].includes(stage);
    }

    private updatePerformanceMetrics(processingTime: number, success: boolean): void {
        if (success) {
            this.performanceStats.successfulAnalyses++;
        } else {
            this.performanceStats.failedAnalyses++;
        }

        const totalAnalyses = this.performanceStats.totalAnalyses;
        this.performanceStats.averageProcessingTime =
            ((this.performanceStats.averageProcessingTime * (totalAnalyses - 1)) + processingTime) / totalAnalyses;

        this.performanceStats.cacheEfficiencyRate =
            this.performanceStats.successfulAnalyses / this.performanceStats.totalAnalyses;
    }

    // メモリ保存メソッド群
    private async saveEmotionalArcToMemory(
        emotionalArc: EmotionalArcDesign,
        conceptName: string,
        stage: LearningStage,
        chapterNumber: number
    ): Promise<void> {
        await safeMemoryOperation(
            this.memoryManager,
            async () => {
                const chapter: Chapter = {
                    id: `emotional-arc-${chapterNumber}`,
                    chapterNumber,
                    title: `感情アーク設計 - 第${chapterNumber}章`,
                    content: `概念: ${conceptName}, 段階: ${stage}`,
                    previousChapterSummary: '',
                    scenes: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    metadata: {
                        createdAt: new Date().toISOString(),
                        lastModified: new Date().toISOString(),
                        status: 'emotional_arc_designed',
                        emotionalArc,
                        conceptName,
                        learningStage: stage,
                        wordCount: emotionalArc.reason.length,
                        estimatedReadingTime: Math.ceil(emotionalArc.reason.length / 1000)
                    }
                };

                const result = await this.memoryManager.processChapter(chapter);
                if (result.success) {
                    this.performanceStats.memorySystemHits++;
                }
                return result;
            },
            null,
            'saveEmotionalArcToMemory',
            this.config
        );
    }

    private async saveBusinessFrameworkArcToMemory(
        emotionalArc: EmotionalArcDesign,
        frameworkName: BusinessFrameworkName,
        stage: LearningStage,
        chapterNumber: number
    ): Promise<void> {
        await safeMemoryOperation(
            this.memoryManager,
            async () => {
                const chapter: Chapter = {
                    id: `business-arc-${chapterNumber}`,
                    chapterNumber,
                    title: `ビジネスフレームワーク感情アーク - 第${chapterNumber}章`,
                    content: `フレームワーク: ${frameworkName}, 段階: ${stage}`,
                    previousChapterSummary: '',
                    scenes: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    metadata: {
                        createdAt: new Date().toISOString(),
                        lastModified: new Date().toISOString(),
                        status: 'business_framework_arc_designed',
                        emotionalArc,
                        frameworkName,
                        learningStage: stage,
                        businessFrameworkIntegration: true,
                        wordCount: emotionalArc.reason.length,
                        estimatedReadingTime: Math.ceil(emotionalArc.reason.length / 1000)
                    }
                };

                return await this.memoryManager.processChapter(chapter);
            },
            null,
            'saveBusinessFrameworkArcToMemory',
            this.config
        );
    }

    private async saveCatharticExperienceToMemory(
        catharticExperience: CatharticExperience,
        conceptName: string,
        stage: LearningStage,
        chapterNumber: number
    ): Promise<void> {
        await safeMemoryOperation(
            this.memoryManager,
            async () => {
                const chapter: Chapter = {
                    id: `cathartic-${chapterNumber}`,
                    chapterNumber,
                    title: `カタルシス体験 - 第${chapterNumber}章`,
                    content: catharticExperience.peakMoment,
                    previousChapterSummary: '',
                    scenes: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    metadata: {
                        createdAt: new Date().toISOString(),
                        lastModified: new Date().toISOString(),
                        status: 'cathartic_experience_designed',
                        catharticExperience,
                        conceptName,
                        learningStage: stage,
                        significance: catharticExperience.intensity,
                        wordCount: catharticExperience.peakMoment.length,
                        estimatedReadingTime: Math.ceil(catharticExperience.peakMoment.length / 1000)
                    }
                };

                const result = await this.memoryManager.processChapter(chapter);
                if (result.success) {
                    this.performanceStats.memorySystemHits++;
                }
                return result;
            },
            null,
            'storeCatharticExperience',
            this.config
        );
    }

    private async saveSynchronizationMetricsToMemory(
        metrics: EmotionLearningSyncMetrics,
        conceptName: string,
        stage: LearningStage
    ): Promise<void> {
        await safeMemoryOperation(
            this.memoryManager,
            async () => {
                const searchResult = await this.memoryManager.unifiedSearch(
                    `synchronization analysis ${conceptName}`,
                    [MemoryLevel.MID_TERM]
                );

                if (searchResult.success) {
                    this.performanceStats.memorySystemHits++;
                }
                return searchResult;
            },
            null,
            'storeSynchronizationMetrics',
            this.config
        );
    }

    private async saveIntegratedPlanToMemory(
        plan: IntegratedEmotionalPlan,
        conceptName: string,
        stage: LearningStage,
        chapterNumber: number
    ): Promise<void> {
        await safeMemoryOperation(
            this.memoryManager,
            async () => {
                const chapter: Chapter = {
                    id: `integrated-plan-${chapterNumber}`,
                    chapterNumber,
                    title: `統合感情学習計画 - 第${chapterNumber}章`,
                    content: `統合計画: 概念=${conceptName}, 段階=${stage}`,
                    previousChapterSummary: '',
                    scenes: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    metadata: {
                        createdAt: new Date().toISOString(),
                        lastModified: new Date().toISOString(),
                        status: 'integrated_plan_created',
                        conceptName,
                        learningStage: stage,
                        integratedPlan: plan,
                        wordCount: 100,
                        estimatedReadingTime: 1
                    }
                };

                return await this.memoryManager.processChapter(chapter);
            },
            null,
            'storeIntegratedPlan',
            this.config
        );
    }

    // デフォルト値生成メソッド群
    private createDefaultEmotionalArc(): EmotionalArcDesign {
        return {
            recommendedTone: "バランスのとれた中立的なトーン",
            emotionalJourney: {
                opening: [
                    { dimension: "関心", level: 7 },
                    { dimension: "期待", level: 6 }
                ],
                development: [
                    { dimension: "集中", level: 7 },
                    { dimension: "探求", level: 6 }
                ],
                conclusion: [
                    { dimension: "理解", level: 7 },
                    { dimension: "満足", level: 6 }
                ]
            },
            reason: "学習のプロセスにおける基本的な感情の流れを表現"
        };
    }

    private createDefaultEmpatheticPoints(stage: LearningStage): EmpatheticPoint[] {
        return [
            {
                type: 'character',
                position: 0.3,
                intensity: 0.6,
                description: 'キャラクターの内面的な成長の瞬間'
            },
            {
                type: 'realization',
                position: 0.6,
                intensity: 0.7,
                description: '重要な気づきが得られる場面'
            },
            {
                type: 'situation',
                position: 0.8,
                intensity: 0.6,
                description: '理解が深まる状況'
            }
        ];
    }

    private createDefaultSyncMetrics(): EmotionLearningSyncMetrics {
        return {
            peakSynchronization: 0.5,
            progressionAlignment: 0.5,
            emotionalResonance: 0.5,
            themeEmotionIntegration: 0.5,
            catharticMomentEffect: 0.4,
            measurementConfidence: 0.5
        };
    }

    private generateSyncRecommendations(stage: LearningStage): string[] {
        switch (stage) {
            case LearningStage.MISCONCEPTION:
                return [
                    '誤解の限界に直面する場面での感情的フラストレーションを強調する',
                    '表面的な理解に基づく自信と、問題発生時の感情的動揺を連動させる'
                ];

            case LearningStage.EXPLORATION:
                return [
                    '新たな視点との出会いによる好奇心と感情的高揚を同期させる',
                    '探索過程での発見と期待感の感情を段階的に強化する'
                ];

            case LearningStage.CONFLICT:
                return [
                    '内的葛藤の感情的側面を理解の深化と連動させる',
                    '価値観の対立から生じる緊張感と、決断に向かう過程の感情変化を同期させる'
                ];

            case LearningStage.INSIGHT:
                return [
                    '気づきの瞬間と感情的カタルシスを完全に同期させる',
                    '理解の急激な広がりとともに、解放感や高揚感が訪れるよう設計する'
                ];

            case LearningStage.APPLICATION:
                return [
                    '実践過程での集中感や緊張感を、スキル向上と連動させる',
                    '成功体験がもたらす達成感と自信の感情的効果を強調する'
                ];

            case LearningStage.INTEGRATION:
                return [
                    '概念の自然な体現がもたらす調和感や安定感を表現する',
                    '以前の自分との対比を通じた成長の満足感と、創造的応用への意欲を連動させる'
                ];

            default:
                return [
                    '感情の変化と学習の進展を並行して描写する',
                    '重要な理解の瞬間に感情的な高まりを設計する'
                ];
        }
    }
}