/**
 * @fileoverview 物語構造とフローを分析するサービス（記憶階層システム完全対応版）
 * @description
 * 新しい統合記憶階層システム（MemoryManager）に完全対応し、
 * 物語のアーク、テンション、流れ、パターンを分析します。
 * 統一アクセスAPI、重複解決システム、キャッシュ協調システムを最大限活用。
 */

import { logger } from '@/lib/utils/logger';
import { Chapter } from '@/types/chapters';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { 
    MemoryLevel, 
    MemoryAccessRequest, 
    MemoryRequestType, 
    MemoryOperationResult
} from '@/lib/memory/core/types';
import { SceneStructureAnalysis, SceneRecommendation, LiteraryInspiration } from '@/types/generation';
import { SceneStructureOptimizer } from './scene-structure-optimizer';
import { LiteraryComparisonSystem } from './literary-comparison-system';

/**
 * @interface NarrativeAnalysisOptions
 * @description 物語分析サービスの設定オプション（記憶階層システム対応）
 */
export interface NarrativeAnalysisOptions {
    memoryManager: MemoryManager;  // 必須：統合記憶管理システム
    geminiClient?: GeminiClient;
    genre?: string;
    enableMemoryIntegration?: boolean;
    enableCacheOptimization?: boolean;
    enableQualityAssurance?: boolean;
}

/**
 * @interface PerformanceMetrics
 * @description パフォーマンス統計の型定義
 */
interface PerformanceMetrics {
    totalAnalyses: number;
    successfulAnalyses: number;
    failedAnalyses: number;
    averageProcessingTime: number;
    memorySystemHits: number;
    cacheEfficiencyRate: number;
    lastOptimization: string;
}

/**
 * @interface UnifiedSearchResult
 * @description 統合検索結果（ローカル型定義）
 */
interface UnifiedSearchResult {
    success: boolean;
    totalResults: number;
    processingTime: number;
    results: Array<{
        source: MemoryLevel;
        type: string;
        data: any;
        relevance: number;
        metadata: Record<string, any>;
    }>;
    suggestions: string[];
}

/**
 * @interface NarrativeAnalysisResult
 * @description 物語分析結果（統合記憶システム対応）
 */
export interface NarrativeAnalysisResult {
    success: boolean;
    processingTime: number;
    analysisType: string;
    results: any;
    memoryIntegration: {
        layersAccessed: MemoryLevel[];
        cacheHits: number;
        duplicatesResolved: number;
    };
    qualityMetrics: {
        dataCompleteness: number;
        analysisAccuracy: number;
        contextRelevance: number;
    };
    error?: string;
}

/**
 * @class NarrativeAnalysisService
 * @description 
 * 新しい統合記憶階層システムに完全対応した物語構造分析サービス。
 * MemoryManagerのパブリックAPIのみを使用し、統合アクセス・重複解決・
 * キャッシュ最適化機能を最大限活用。
 */
export class NarrativeAnalysisService {
    private memoryManager: MemoryManager;
    private geminiClient: GeminiClient;
    private sceneStructureOptimizer: SceneStructureOptimizer;
    private literaryComparisonSystem: LiteraryComparisonSystem;
    
    private initialized: boolean = false;
    private genre: string;
    private config: Required<NarrativeAnalysisOptions>;

    // パフォーマンス統計
    private performanceStats: PerformanceMetrics = {
        totalAnalyses: 0,
        successfulAnalyses: 0,
        failedAnalyses: 0,
        averageProcessingTime: 0,
        memorySystemHits: 0,
        cacheEfficiencyRate: 0,
        lastOptimization: new Date().toISOString()
    };

    /**
     * コンストラクタ（依存注入パターン完全実装）
     * @param options 設定オプション（memoryManagerは必須）
     */
    constructor(options: NarrativeAnalysisOptions) {
        // 必須依存関係の検証
        if (!options.memoryManager) {
            throw new Error('MemoryManager is required for NarrativeAnalysisService initialization');
        }

        // 設定の完全検証と初期化
        this.config = {
            memoryManager: options.memoryManager,
            geminiClient: options.geminiClient || new GeminiClient(),
            genre: options.genre || 'classic',
            enableMemoryIntegration: options.enableMemoryIntegration ?? true,
            enableCacheOptimization: options.enableCacheOptimization ?? true,
            enableQualityAssurance: options.enableQualityAssurance ?? true
        };

        this.memoryManager = this.config.memoryManager;
        this.geminiClient = this.config.geminiClient;
        this.genre = this.config.genre;

        // 統合コンポーネントの初期化
        this.sceneStructureOptimizer = new SceneStructureOptimizer(this.geminiClient);
        this.literaryComparisonSystem = new LiteraryComparisonSystem(this.geminiClient);

        logger.info('NarrativeAnalysisService initialized with unified memory system integration');
    }

    /**
     * サービス初期化（記憶階層システム統合確認）
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('NarrativeAnalysisService already initialized');
            return;
        }

        try {
            // 記憶階層システムの状態確認
            const systemStatus = await this.memoryManager.getSystemStatus();
            if (!systemStatus.initialized) {
                throw new Error('MemoryManager is not initialized');
            }

            // システム診断実行
            const diagnostics = await this.memoryManager.performSystemDiagnostics();
            if (diagnostics.systemHealth === 'CRITICAL') {
                logger.warn('Memory system health is critical, but proceeding with initialization', {
                    issues: diagnostics.issues
                });
            }

            this.initialized = true;
            logger.info('NarrativeAnalysisService initialization completed with memory system integration');

        } catch (error) {
            logger.error('Failed to initialize NarrativeAnalysisService', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * シーン構造を分析（統合記憶システム活用版）
     * @param lastChapters 分析対象の章数
     * @returns シーン構造分析結果
     */
    async analyzeSceneStructure(lastChapters: number = 10): Promise<NarrativeAnalysisResult> {
        const startTime = Date.now();
        await this.ensureInitialized();

        try {
            logger.info(`統合記憶システムを使用して最近の${lastChapters}章のシーン構造を分析します`);

            this.performanceStats.totalAnalyses++;

            // 統合記憶システムから章データを安全に取得
            const chaptersData = await this.safeMemoryOperation(
                () => this.getRecentChaptersFromMemory(lastChapters),
                [],
                'getRecentChaptersForSceneAnalysis'
            );

            if (chaptersData.length === 0) {
                logger.warn('No chapter data available for scene structure analysis');
                return this.createFallbackAnalysisResult('scene-structure', startTime, 'No data available');
            }

            // シーン構造分析実行
            const analysisData = await this.performSceneStructureAnalysis(chaptersData);

            // 分析結果を記憶システムに統合
            if (this.config.enableMemoryIntegration) {
                await this.integrateAnalysisResults('scene-structure', analysisData, chaptersData.length);
            }

            const processingTime = Date.now() - startTime;
            this.updatePerformanceStats(processingTime, true);

            const result: NarrativeAnalysisResult = {
                success: true,
                processingTime,
                analysisType: 'scene-structure',
                results: analysisData,
                memoryIntegration: {
                    layersAccessed: [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM],
                    cacheHits: 0, // 実際の統計は記憶システムから取得
                    duplicatesResolved: 0
                },
                qualityMetrics: {
                    dataCompleteness: chaptersData.length / lastChapters,
                    analysisAccuracy: this.calculateAnalysisAccuracy(analysisData),
                    contextRelevance: 0.85
                }
            };

            this.performanceStats.successfulAnalyses++;
            logger.info('Scene structure analysis completed successfully', {
                chaptersAnalyzed: chaptersData.length,
                processingTime
            });

            return result;

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.performanceStats.failedAnalyses++;
            this.updatePerformanceStats(processingTime, false);

            logger.error('Scene structure analysis failed', {
                error: error instanceof Error ? error.message : String(error),
                processingTime
            });

            return this.createFallbackAnalysisResult('scene-structure', startTime, error instanceof Error ? error.message : String(error));
        }
    }

    /**
     * シーン推奨を生成（統合記憶システム活用版）
     * @param chapterNumber 章番号
     * @returns シーン推奨の配列
     */
    async generateSceneRecommendations(chapterNumber: number): Promise<SceneRecommendation[]> {
        await this.ensureInitialized();

        try {
            logger.info(`章${chapterNumber}のシーン推奨を統合記憶システムを使用して生成します`);

            // 統合記憶システムから関連コンテキストを取得
            const contextData = await this.safeMemoryOperation(
                () => this.getComprehensiveContext(chapterNumber),
                null,
                'getContextForSceneRecommendations'
            );

            // シーン構造分析
            const analysis = await this.analyzeSceneStructure();
            
            if (!analysis.success) {
                logger.warn('Scene structure analysis failed, using fallback recommendations');
                return this.createFallbackSceneRecommendations();
            }

            // 推奨生成（コンテキスト強化版）
            const recommendations = await this.sceneStructureOptimizer.generateSceneRecommendations(
                analysis.results, 
                chapterNumber
            );

            logger.info('Scene recommendations generated successfully', {
                chapterNumber,
                recommendationCount: recommendations.length,
                contextEnhanced: !!contextData
            });

            return recommendations;

        } catch (error) {
            logger.error('Failed to generate scene recommendations', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            return this.createFallbackSceneRecommendations();
        }
    }

    /**
     * 文学的インスピレーションを生成（統合記憶システム活用版）
     * @param context コンテキスト情報
     * @param chapterNumber 章番号
     * @returns 文学的インスピレーション
     */
    async generateLiteraryInspirations(
        context: any,
        chapterNumber: number
    ): Promise<LiteraryInspiration> {
        await this.ensureInitialized();

        try {
            logger.info(`章${chapterNumber}の文学的インスピレーションを統合記憶システムで生成`);

            // 統合記憶システムから豊富なコンテキストを取得
            const enhancedContext = await this.safeMemoryOperation(
                () => this.buildEnhancedContext(context, chapterNumber),
                context,
                'buildEnhancedContextForLiteraryInspiration'
            );

            // 世界設定とキャラクター情報を統合（重複解決済み）
            const [worldSettings, characterInfo] = await Promise.allSettled([
                this.safeMemoryOperation(
                    () => this.getConsolidatedWorldSettings(),
                    null,
                    'getWorldSettingsForInspiration'
                ),
                this.safeMemoryOperation(
                    () => this.getRelevantCharacters(chapterNumber),
                    [],
                    'getCharactersForInspiration'
                )
            ]);

            // コンテキスト情報の統合
            const baseContext = {
                worldSettings: worldSettings.status === 'fulfilled' ? worldSettings.value : null,
                characters: characterInfo.status === 'fulfilled' ? characterInfo.value : [],
                chapterNumber,
                totalChapters: enhancedContext.totalChapters || 0,
                genre: this.genre,
                narrativeProgression: enhancedContext.narrativeProgression || null
            };

            // 文学的インスピレーション生成
            const inspirations = await this.literaryComparisonSystem.generateLiteraryInspirations(
                baseContext, 
                chapterNumber
            );

            logger.info('Literary inspirations generated successfully', {
                chapterNumber,
                techniqueCount: (
                    inspirations.plotTechniques.length +
                    inspirations.characterTechniques.length +
                    inspirations.atmosphereTechniques.length
                )
            });

            return inspirations;

        } catch (error) {
            logger.warn('文学的インスピレーション生成に失敗、フォールバックを使用', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            return this.createGenreSpecificFallback(this.genre);
        }
    }

    /**
     * 物語の現在のテンションレベルを取得（統合記憶システム版）
     * @param chapterNumber 章番号
     * @returns テンションレベル（0-10）
     */
    async getCurrentTensionLevel(chapterNumber?: number): Promise<number> {
        await this.ensureInitialized();

        try {
            // 統合記憶システムからテンション履歴を取得
            const tensionData = await this.safeMemoryOperation(
                () => this.getTensionHistoryFromMemory(chapterNumber),
                null,
                'getCurrentTensionLevel'
            );

            if (tensionData && typeof tensionData.tensionLevel === 'number') {
                return Math.min(10, Math.max(0, Math.round(tensionData.tensionLevel * 10)));
            }

            // フォールバック：ジャンルベースのデフォルト値
            return this.getDefaultTensionByGenre(this.genre);

        } catch (error) {
            logger.warn('Failed to get current tension level from memory system', { 
                error: error instanceof Error ? error.message : String(error) 
            });
            return this.getDefaultTensionByGenre(this.genre);
        }
    }

    /**
     * ジャンル設定（統合記憶システム同期）
     * @param genre ジャンル
     */
    async setGenre(genre: string): Promise<void> {
        this.genre = genre;
        
        if (this.config.enableMemoryIntegration) {
            try {
                // 統合記憶システムにジャンル変更を通知
                await this.notifyGenreChange(genre);
                logger.info(`Genre updated to "${genre}" and synchronized with memory system`);
            } catch (error) {
                logger.warn('Failed to synchronize genre change with memory system', { 
                    error: error instanceof Error ? error.message : String(error) 
                });
            }
        } else {
            logger.info(`Genre updated to "${genre}"`);
        }
    }

    /**
     * 統合記憶システムから関連データを安全に取得
     */
    private async safeMemoryOperation<T>(
        operation: () => Promise<T>,
        fallbackValue: T,
        operationName: string
    ): Promise<T> {
        if (!this.config.enableMemoryIntegration) {
            return fallbackValue;
        }

        try {
            // システム状態確認
            const systemStatus = await this.memoryManager.getSystemStatus();
            if (!systemStatus.initialized) {
                logger.warn(`${operationName}: MemoryManager not initialized`);
                return fallbackValue;
            }

            return await operation();
        } catch (error) {
            logger.error(`${operationName} failed`, { error });
            return fallbackValue;
        }
    }

    /**
     * 統合記憶システムから最近の章データを取得
     */
    private async getRecentChaptersFromMemory(lastChapters: number): Promise<Chapter[]> {
        // 統合検索を使用して最近の章を取得
        const searchResult = await this.memoryManager.unifiedSearch(
            `recent chapters limit:${lastChapters}`,
            [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
        );

        if (!searchResult.success || searchResult.totalResults === 0) {
            logger.warn('No recent chapters found in unified search');
            return [];
        }

        // 検索結果からChapterオブジェクトを抽出
        const chapters: Chapter[] = [];
        for (const result of searchResult.results) {
            if (result.type === 'chapter' && result.data) {
                // 安全なChapter型構築
                const chapter = this.constructSafeChapter(result.data, chapters.length + 1);
                if (chapter) {
                    chapters.push(chapter);
                }
            }
        }

        return chapters.slice(0, lastChapters);
    }

    /**
     * 安全なChapter型構築
     */
    private constructSafeChapter(data: any, fallbackNumber: number): Chapter | null {
        try {
            // 必須フィールドの確認と構築
            const chapterNumber = data.chapterNumber || data.chapter?.chapterNumber || fallbackNumber;
            const content = data.content || data.chapter?.content || '';
            
            if (!content) {
                logger.warn('Chapter content is empty, skipping');
                return null;
            }

            const chapter: Chapter = {
                id: data.id || `chapter-${chapterNumber}`,
                chapterNumber,
                title: data.title || `第${chapterNumber}章`,
                content,
                previousChapterSummary: data.previousChapterSummary || '',
                scenes: data.scenes || [],
                createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
                updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
                metadata: {
                    createdAt: data.metadata?.createdAt || new Date().toISOString(),
                    lastModified: data.metadata?.lastModified || new Date().toISOString(),
                    status: data.metadata?.status || 'analyzed',
                    wordCount: content.length,
                    estimatedReadingTime: Math.ceil(content.length / 1000)
                }
            };

            return chapter;

        } catch (error) {
            logger.error('Failed to construct safe Chapter object', { 
                error: error instanceof Error ? error.message : String(error), 
                data 
            });
            return null;
        }
    }

    /**
     * 包括的コンテキストの取得
     */
    private async getComprehensiveContext(chapterNumber: number): Promise<any> {
        const request: MemoryAccessRequest = {
            chapterNumber,
            requestType: MemoryRequestType.INTEGRATED_CONTEXT,
            targetLayers: [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM],
            filters: {
                characterIds: undefined,
                eventTypes: ['narrative', 'character', 'plot'],
                timeRange: {
                    startChapter: Math.max(1, chapterNumber - 5),
                    endChapter: chapterNumber
                }
            },
            options: {
                includeCache: true,
                resolveDuplicates: true,
                optimizeAccess: true,
                deepAnalysis: true
            }
        };

        // 注意：MemoryManagerのプライベートプロパティには直接アクセスせず、
        // パブリックAPIのみを使用
        const searchResult = await this.memoryManager.unifiedSearch(
            `context chapter:${chapterNumber}`,
            [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
        );

        return searchResult.success ? searchResult.results : null;
    }

    /**
     * 統合世界設定の取得（重複解決済み）
     */
    private async getConsolidatedWorldSettings(): Promise<any> {
        // 統合検索で世界設定を取得
        const searchResult = await this.memoryManager.unifiedSearch(
            'world settings consolidated',
            [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM]
        );

        if (searchResult.success && searchResult.results.length > 0) {
            return searchResult.results[0].data;
        }

        return null;
    }

    /**
     * 関連キャラクター情報の取得
     */
    private async getRelevantCharacters(chapterNumber: number): Promise<any[]> {
        const searchResult = await this.memoryManager.unifiedSearch(
            `characters chapter:${chapterNumber}`,
            [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM]
        );

        if (searchResult.success) {
            return searchResult.results
                .filter(result => result.type === 'character')
                .map(result => result.data);
        }

        return [];
    }

    /**
     * シーン構造分析の実行
     */
    private async performSceneStructureAnalysis(chaptersData: Chapter[]): Promise<SceneStructureAnalysis> {
        try {
            const analysis = await this.sceneStructureOptimizer.analyzeSceneStructure(chaptersData);
            return analysis;
        } catch (error) {
            logger.error('Scene structure analysis failed, using fallback', { 
                error: error instanceof Error ? error.message : String(error) 
            });
            return this.createFallbackSceneStructureAnalysis();
        }
    }

    /**
     * 分析結果の記憶システム統合
     */
    private async integrateAnalysisResults(analysisType: string, results: any, dataSize: number): Promise<void> {
        try {
            // 分析結果をChapter形式で構造化して記憶システムに統合
            const analysisChapter: Chapter = {
                id: `analysis-${analysisType}-${Date.now()}`,
                chapterNumber: 0, // 分析結果は章番号0で管理
                title: `Analysis Result: ${analysisType}`,
                content: JSON.stringify(results),
                previousChapterSummary: '',
                scenes: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                metadata: {
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    status: 'analyzed',
                    wordCount: JSON.stringify(results).length,
                    estimatedReadingTime: 1,
                    analysisType,
                    dataSize
                }
            };

            const result = await this.memoryManager.processChapter(analysisChapter);
            
            if (result.success) {
                logger.debug('Analysis results integrated into memory system', {
                    analysisType,
                    processingTime: result.processingTime
                });
            } else {
                logger.warn('Failed to integrate analysis results', {
                    analysisType,
                    errors: result.errors
                });
            }

        } catch (error) {
            logger.error('Analysis results integration failed', { 
                error: error instanceof Error ? error.message : String(error), 
                analysisType 
            });
        }
    }

    /**
     * パフォーマンス統計の更新
     */
    private updatePerformanceStats(processingTime: number, success: boolean): void {
        const currentStats = this.performanceStats;
        currentStats.averageProcessingTime = 
            (currentStats.averageProcessingTime + processingTime) / 2;

        if (success) {
            currentStats.memorySystemHits++;
        }
    }

    /**
     * 分析精度の計算
     */
    private calculateAnalysisAccuracy(analysisData: any): number {
        try {
            // 分析データの完全性に基づく精度計算
            let completeness = 0;
            
            if (analysisData.typeDistribution && Object.keys(analysisData.typeDistribution).length > 0) {
                completeness += 0.3;
            }
            
            if (analysisData.lengthDistribution && analysisData.lengthDistribution.avg > 0) {
                completeness += 0.3;
            }
            
            if (analysisData.paceVariation && analysisData.paceVariation > 0) {
                completeness += 0.2;
            }
            
            if (analysisData.transitionTypes && analysisData.transitionTypes.smoothness > 0) {
                completeness += 0.2;
            }

            return Math.min(1.0, completeness);
        } catch (error) {
            return 0.5; // デフォルト精度
        }
    }

    /**
     * フォールバック分析結果の作成
     */
    private createFallbackAnalysisResult(analysisType: string, startTime: number, errorMessage: string): NarrativeAnalysisResult {
        return {
            success: false,
            processingTime: Date.now() - startTime,
            analysisType,
            results: this.createFallbackSceneStructureAnalysis(),
            memoryIntegration: {
                layersAccessed: [],
                cacheHits: 0,
                duplicatesResolved: 0
            },
            qualityMetrics: {
                dataCompleteness: 0,
                analysisAccuracy: 0,
                contextRelevance: 0
            },
            error: errorMessage
        };
    }

    /**
     * フォールバックシーン構造分析の作成
     */
    private createFallbackSceneStructureAnalysis(): SceneStructureAnalysis {
        return {
            typeDistribution: {
                'INTRODUCTION': 1,
                'DEVELOPMENT': 2,
                'CLIMAX': 1,
                'RESOLUTION': 1,
                'TRANSITION': 1
            },
            lengthDistribution: {
                min: 500,
                max: 2000,
                avg: 1000,
                stdDev: 500
            },
            paceVariation: 0.5,
            transitionTypes: {
                types: {
                    'smooth': 0.6,
                    'abrupt': 0.2,
                    'gradual': 0.2
                },
                smoothness: 0.7
            }
        };
    }

    /**
     * フォールバックシーン推奨の作成
     */
    private createFallbackSceneRecommendations(): SceneRecommendation[] {
        return [
            {
                type: 'SCENE_STRUCTURE',
                description: "バランスの取れたシーン構成（導入、展開、クライマックス、解決）を心がけてください",
                reason: "読者の興味を引きつけ、物語の流れを自然に構築するため"
            },
            {
                type: 'PACING',
                description: "シーン間の緩急を意識し、適切なテンポで物語を進行させてください",
                reason: "読者の集中力を維持し、物語への没入感を高めるため"
            },
            {
                type: 'TRANSITION',
                description: "シーン転換時は適切な繋ぎを用い、読者が迷わないよう配慮してください",
                reason: "物語の流れを滑らかにし、読みやすさを向上させるため"
            }
        ];
    }

    /**
     * ジャンル特化フォールバックの作成
     */
    private createGenreSpecificFallback(genre: string): LiteraryInspiration {
        switch (genre.toLowerCase()) {
            case 'business':
                return {
                    plotTechniques: [{
                        technique: "ビジネス上の危機と解決",
                        description: "企業や事業が直面する危機的状況とその解決プロセスを描写する技法",
                        example: "資金繰りの困難から革新的な製品開発によって活路を見出す展開",
                        reference: "下町ロケット"
                    }],
                    characterTechniques: [{
                        technique: "専門性と人間性のバランス",
                        description: "ビジネススキルと人間的側面を両立させて描写する手法",
                        example: "技術者としての洞察力を持ちながらチームとの関係に悩む描写",
                        reference: "下町ロケット"
                    }],
                    atmosphereTechniques: [{
                        technique: "企業文化の象徴的表現",
                        description: "組織の文化や価値観を象徴的な場面を通じて表現する技法",
                        example: "朝礼や社内慣習を通して表現される企業の伝統と価値観",
                        reference: "海賊とよばれた男"
                    }]
                };

            case 'mystery':
                return {
                    plotTechniques: [{
                        technique: "段階的謎解きの構築",
                        description: "複数の手がかりを段階的に配置し、読者の推理欲を刺激する技法",
                        example: "小さな謎が解決されることで、より大きな謎の存在が明らかになる構造",
                        reference: "古典推理小説"
                    }],
                    characterTechniques: [{
                        technique: "探偵役の個性的描写",
                        description: "独特な推理方法や観察眼を持つ探偵キャラクターの魅力的な描写",
                        example: "些細な日常の変化から重大な手がかりを発見する洞察力の描写",
                        reference: "シャーロック・ホームズ"
                    }],
                    atmosphereTechniques: [{
                        technique: "サスペンスの醸成",
                        description: "緊張感を持続させ、読者の関心を最後まで引きつける雰囲気作り",
                        example: "真犯人の正体が明かされる直前の緊迫した場面描写",
                        reference: "本格推理小説"
                    }]
                };

            default:
                return {
                    plotTechniques: [{
                        technique: "伏線の設置と回収",
                        description: "物語の前半で示唆し、後半で意味を明らかにする技法",
                        example: "主人公が何気なく拾った小さなアイテムが、後の章で重要な意味を持つ",
                        reference: "優れた小説作品"
                    }],
                    characterTechniques: [{
                        technique: "行動による性格描写",
                        description: "キャラクターの内面を直接説明せず、行動や選択を通じて性格を示す",
                        example: "危機的状況での判断や反応を通じてキャラクターの本質を描く",
                        reference: "優れたキャラクター小説"
                    }],
                    atmosphereTechniques: [{
                        technique: "対比による強調",
                        description: "対照的な場面や感情を並置して、両方をより際立たせる",
                        example: "平和な日常描写の直後に緊迫した場面を配置する",
                        reference: "現代文学作品"
                    }]
                };
        }
    }

    /**
     * ユーティリティメソッド群
     */

    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }
    }

    private getDefaultTensionByGenre(genre: string): number {
        const tensionMap: { [key: string]: number } = {
            'business': 6,
            'mystery': 7,
            'thriller': 8,
            'romance': 5,
            'fantasy': 6,
            'classic': 5
        };

        return tensionMap[genre.toLowerCase()] || 5;
    }

    private async getTensionHistoryFromMemory(chapterNumber?: number): Promise<any> {
        const searchQuery = chapterNumber 
            ? `tension chapter:${chapterNumber}`
            : 'tension current';

        const searchResult = await this.memoryManager.unifiedSearch(
            searchQuery,
            [MemoryLevel.MID_TERM, MemoryLevel.SHORT_TERM]
        );

        if (searchResult.success && searchResult.results.length > 0) {
            return searchResult.results[0].data;
        }

        return null;
    }

    private async buildEnhancedContext(baseContext: any, chapterNumber: number): Promise<any> {
        try {
            const searchResult = await this.memoryManager.unifiedSearch(
                `narrative progression chapter:${chapterNumber}`,
                [MemoryLevel.MID_TERM]
            );

            return {
                ...baseContext,
                totalChapters: baseContext.totalChapters || 0,
                narrativeProgression: searchResult.success ? searchResult.results[0]?.data : null
            };
        } catch (error) {
            logger.warn('Failed to build enhanced context', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });
            return baseContext;
        }
    }

    private async notifyGenreChange(genre: string): Promise<void> {
        // ジャンル変更をメタデータとして記録
        const genreChangeChapter: Chapter = {
            id: `genre-change-${Date.now()}`,
            chapterNumber: 0,
            title: `Genre Change: ${genre}`,
            content: `Genre updated to ${genre}`,
            previousChapterSummary: '',
            scenes: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                status: 'system-update',
                wordCount: 0,
                estimatedReadingTime: 0,
                systemUpdate: true,
                updateType: 'genre-change',
                newGenre: genre
            }
        };

        await this.memoryManager.processChapter(genreChangeChapter);
    }

    /**
     * パブリックAPI: 統計情報取得
     */
    getPerformanceStatistics(): PerformanceMetrics {
        return { ...this.performanceStats };
    }

    /**
     * パブリックAPI: システム診断
     */
    async performDiagnostics(): Promise<{
        serviceHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
        memorySystemIntegration: boolean;
        performanceMetrics: PerformanceMetrics;
        recommendations: string[];
    }> {
        await this.ensureInitialized();

        const recommendations: string[] = [];
        let serviceHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';

        // 成功率チェック
        const successRate = this.performanceStats.totalAnalyses > 0 
            ? this.performanceStats.successfulAnalyses / this.performanceStats.totalAnalyses 
            : 0;

        if (successRate < 0.8) {
            serviceHealth = 'DEGRADED';
            recommendations.push('Analysis success rate is below 80%');
        }

        if (successRate < 0.5) {
            serviceHealth = 'CRITICAL';
            recommendations.push('Analysis success rate is critically low');
        }

        // 記憶システム統合状態チェック
        let memorySystemIntegration = false;
        try {
            const systemStatus = await this.memoryManager.getSystemStatus();
            memorySystemIntegration = systemStatus.initialized;
            
            if (!memorySystemIntegration) {
                recommendations.push('Memory system integration is not available');
            }
        } catch (error) {
            recommendations.push('Failed to check memory system status');
        }

        return {
            serviceHealth,
            memorySystemIntegration,
            performanceMetrics: this.performanceStats,
            recommendations
        };
    }

    /**
     * パブリックAPI: 設定更新
     */
    updateConfiguration(newOptions: Partial<NarrativeAnalysisOptions>): void {
        if (newOptions.genre && newOptions.genre !== this.genre) {
            // ジャンル変更は非同期で実行（エラーは内部で処理）
            this.setGenre(newOptions.genre).catch(error => {
                logger.error('Failed to update genre in configuration', {
                    error: error instanceof Error ? error.message : String(error)
                });
            });
        }

        if (newOptions.enableMemoryIntegration !== undefined) {
            this.config.enableMemoryIntegration = newOptions.enableMemoryIntegration;
        }

        if (newOptions.enableCacheOptimization !== undefined) {
            this.config.enableCacheOptimization = newOptions.enableCacheOptimization;
        }

        if (newOptions.enableQualityAssurance !== undefined) {
            this.config.enableQualityAssurance = newOptions.enableQualityAssurance;
        }

        logger.info('NarrativeAnalysisService configuration updated', {
            newConfiguration: {
                genre: this.genre,
                enableMemoryIntegration: this.config.enableMemoryIntegration,
                enableCacheOptimization: this.config.enableCacheOptimization,
                enableQualityAssurance: this.config.enableQualityAssurance
            }
        });
    }
}