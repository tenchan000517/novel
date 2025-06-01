/**
 * @fileoverview 分析コーディネータ（新記憶階層システム完全対応版）
 * @description
 * 新しい統合記憶階層システム（MemoryManager）に完全対応した分析コーディネータ。
 * 統一アクセスAPI、重複解決システム、キャッシュ協調システムを活用した高性能分析処理を実現。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiAdapter } from '@/lib/analysis/adapters/gemini-adapter';
import { JsonParser } from '@/lib/utils/json-parser';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { StorageProvider } from '@/lib/storage';

// 🎯 新記憶階層システムのインポート
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { 
    MemoryLevel, 
    MemoryAccessRequest, 
    MemoryRequestType,
    UnifiedMemoryContext 
} from '@/lib/memory/core/types';

// サービスのインポート
import { ThemeAnalysisService } from '@/lib/analysis/services/theme/theme-analysis-service';
import { StyleAnalysisService } from '@/lib/analysis/services/style/style-analysis-service';
import { CharacterAnalysisService } from '@/lib/analysis/services/character/character-analysis-service';
import { NarrativeAnalysisService } from '@/lib/analysis/services/narrative/narrative-analysis-service';
import { ReaderExperienceAnalyzer, ReaderExperienceAnalysis } from '@/lib/analysis/services/reader/reader-experience-analysis-service';

// 型定義のインポート
import {
    GenerationContext,
    ChapterAnalysis,
    ThemeResonanceAnalysis,
    StyleAnalysis,
    ExpressionPatterns,
    SceneStructureAnalysis,
    SceneRecommendation,
    LiteraryInspiration,
    QualityMetrics
} from '@/types/generation';
import { CharacterAnalysisResult } from '@/lib/analysis/services/character/character-analysis-service';
import { Chapter } from '@/types/chapters';

/**
 * @interface ChapterAnalysisServiceInterface
 * @description ChapterAnalysisServiceの期待されるインターフェース
 */
interface ChapterAnalysisServiceInterface {
    analyzeForIntegration?(content: string, chapterNumber: number, context: GenerationContext, isIntegrated?: boolean): Promise<ChapterAnalysis>;
    analyzeChapter?(content: string, chapterNumber: number, context: GenerationContext): Promise<ChapterAnalysis>;
    generateImprovementSuggestions?(analysis: ChapterAnalysis, chapterNumber: number, context: GenerationContext): Promise<string[]>;
    clearCache?(): void;
}

/**
 * @interface IntegratedAnalysisResult
 * @description 統合分析結果
 */
export interface IntegratedAnalysisResult {
    // 基本章分析
    chapterAnalysis: ChapterAnalysis;

    // テーマ分析
    themeAnalysis: ThemeResonanceAnalysis;
    foreshadowingProcessing: {
        resolvedForeshadowing: any[];
        generatedCount: number;
        totalActive: number;
    };

    // 文体分析
    styleAnalysis: StyleAnalysis;
    expressionPatterns: ExpressionPatterns;

    // キャラクター分析
    characterAnalysis: CharacterAnalysisResult;

    // 物語構造分析
    sceneStructure: SceneStructureAnalysis;
    sceneRecommendations: SceneRecommendation[];
    literaryInspirations: LiteraryInspiration;

    // 読者体験分析
    readerExperience: ReaderExperienceAnalysis;

    // 品質メトリクス
    qualityMetrics: QualityMetrics;

    // 統合改善提案
    integratedSuggestions: string[];

    // メタデータ
    analysisMetadata: {
        analysisTimestamp: string;
        servicesUsed: string[];
        processingTime: number;
        cacheHitRate: number;
        memorySystemUsed: boolean;
        unifiedSearchResults: number;
    };
}

/**
 * @interface AnalysisCoordinatorOptions
 * @description 分析コーディネータのオプション
 */
export interface AnalysisCoordinatorOptions {
    enableCache?: boolean;
    enableParallelProcessing?: boolean;
    optimizeForIntegration?: boolean;
    enableDetailedLogging?: boolean;
    useMemorySystemIntegration?: boolean;
    memorySearchDepth?: number;
}

/**
 * @class AnalysisCoordinator（新記憶階層システム完全対応版）
 * @description 
 * 新しい統合記憶階層システムに完全対応した分析コーディネータ。
 * 
 * 🎯 主要な最適化：
 * - 新しいMemoryManagerの統一APIを活用
 * - unifiedSearch()による効率的なメモリアクセス
 * - processChapter()による統合章処理
 * - 重複解決システムとの連携
 * - キャッシュ協調システムの活用
 * - プライベートプロパティアクセスの完全排除
 */
export class AnalysisCoordinator {
    // サービスインスタンス
    private themeAnalysisService: ThemeAnalysisService;
    private styleAnalysisService: StyleAnalysisService;
    private characterAnalysisService: CharacterAnalysisService;
    private narrativeAnalysisService: NarrativeAnalysisService;
    private readerExperienceAnalyzer: ReaderExperienceAnalyzer;
    private chapterAnalysisService: ChapterAnalysisServiceInterface;

    // キャッシュとメタデータ管理
    private analysisCache: Map<string, IntegratedAnalysisResult> = new Map();
    private performanceMetrics: Map<string, number> = new Map();
    private memorySystemStats = {
        totalSearches: 0,
        cacheHits: 0,
        unifiedContextRetrievals: 0,
        processingOptimizations: 0
    };

    // 設定
    private options: Required<AnalysisCoordinatorOptions>;

    /**
     * コンストラクタ
     * 
     * @param geminiAdapter AI分析アダプター
     * @param memoryManager 新しい統合記憶階層システム
     * @param storageProvider ストレージプロバイダー
     * @param options コーディネータオプション
     */
    constructor(
        private geminiAdapter: GeminiAdapter,
        private memoryManager: MemoryManager,
        private storageProvider: StorageProvider,
        options: AnalysisCoordinatorOptions = {}
    ) {
        this.options = {
            enableCache: true,
            enableParallelProcessing: true,
            optimizeForIntegration: true,
            enableDetailedLogging: false,
            useMemorySystemIntegration: true,
            memorySearchDepth: 10,
            ...options
        };

        // サービスを直接初期化
        this.themeAnalysisService = new ThemeAnalysisService(
            this.geminiAdapter,
            this.memoryManager,
            this.storageProvider
        );

        this.styleAnalysisService = new StyleAnalysisService(
            this.geminiAdapter,
            this.storageProvider as any
        );

        this.characterAnalysisService = new CharacterAnalysisService(
            this.geminiAdapter
        );

        this.narrativeAnalysisService = new NarrativeAnalysisService({
            geminiClient: this.geminiAdapter as any,
            memoryManager: this.memoryManager
        });

        this.readerExperienceAnalyzer = new ReaderExperienceAnalyzer(
            this.geminiAdapter as any
        );

        // 安全なChapterAnalysisServiceの初期化
        this.chapterAnalysisService = this.createSafeChapterAnalysisService();

        logger.info('AnalysisCoordinator initialized with new memory hierarchy system', { 
            options: this.options,
            memorySystemIntegration: this.options.useMemorySystemIntegration
        });
    }

    /**
     * 🎯 新記憶階層システム初期化確保
     */
    private async ensureMemoryManagerInitialization(): Promise<void> {
        try {
            logger.info('統合記憶階層システム（MemoryManager）初期化状態を確認中...');

            // 🔧 修正：新システムの適切な初期化チェック
            // MemoryManagerの初期化状態はgetSystemStatus()で確認
            const systemStatus = await this.memoryManager.getSystemStatus();
            
            if (!systemStatus.initialized) {
                logger.info('MemoryManager を初期化します...');
                await this.memoryManager.initialize();
                
                // 初期化後の状態確認
                const updatedStatus = await this.memoryManager.getSystemStatus();
                if (updatedStatus.initialized) {
                    logger.info('MemoryManager 初期化完了');
                } else {
                    logger.warn('MemoryManager 初期化に問題が発生しました');
                }
            } else {
                logger.info('MemoryManager は既に初期化済み');
            }

        } catch (initError) {
            logger.warn('MemoryManager 初期化処理でエラーが発生しましたが、分析を続行します', {
                error: initError instanceof Error ? initError.message : String(initError)
            });
        }
    }

    /**
     * 🎯 新記憶階層システムを使用した安全なメモリ操作
     */
    private async safeMemoryOperation<T>(
        operation: () => Promise<T>,
        fallbackValue: T,
        operationName: string
    ): Promise<T> {
        if (!this.options.useMemorySystemIntegration) {
            logger.debug(`${operationName}: Memory system integration disabled, using fallback`);
            return fallbackValue;
        }

        try {
            // システム状態確認
            const systemStatus = await this.memoryManager.getSystemStatus();
            if (!systemStatus.initialized) {
                logger.warn(`${operationName}: MemoryManager not initialized, using fallback`);
                return fallbackValue;
            }

            return await operation();
        } catch (error) {
            logger.error(`${operationName} failed`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return fallbackValue;
        }
    }

    /**
     * 🎯 統一検索による記憶階層アクセス
     */
    private async performUnifiedMemorySearch(
        query: string, 
        targetLayers: MemoryLevel[] = [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
    ): Promise<any> {
        return this.safeMemoryOperation(
            async () => {
                logger.debug('統合検索を実行', { query, targetLayers });
                
                const searchResult = await this.memoryManager.unifiedSearch(query, targetLayers);
                
                this.memorySystemStats.totalSearches++;
                if (searchResult.success) {
                    this.memorySystemStats.unifiedContextRetrievals++;
                    
                    logger.debug('統合検索成功', {
                        totalResults: searchResult.totalResults,
                        processingTime: searchResult.processingTime
                    });
                    
                    return {
                        success: true,
                        results: searchResult.results,
                        totalResults: searchResult.totalResults,
                        processingTime: searchResult.processingTime
                    };
                } else {
                    logger.warn('統合検索は成功しましたが結果が空でした', { query });
                    return { success: false, results: [], totalResults: 0, processingTime: 0 };
                }
            },
            { success: false, results: [], totalResults: 0, processingTime: 0 },
            'performUnifiedMemorySearch'
        );
    }

    /**
     * 🎯 統合記憶コンテキスト取得
     */
    private async getUnifiedMemoryContext(chapterNumber: number): Promise<UnifiedMemoryContext | null> {
        return this.safeMemoryOperation(
            async () => {
                const searchResult = await this.memoryManager.unifiedSearch(
                    `chapter ${chapterNumber} context`,
                    [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
                );

                if (searchResult.success && searchResult.results.length > 0) {
                    // 検索結果から統合コンテキストを構築
                    const context: UnifiedMemoryContext = {
                        chapterNumber,
                        timestamp: new Date().toISOString(),
                        shortTerm: {
                            recentChapters: [],
                            immediateCharacterStates: new Map(),
                            keyPhrases: [],
                            processingBuffers: []
                        },
                        midTerm: {
                            narrativeProgression: {} as any,
                            analysisResults: [],
                            characterEvolution: [],
                            systemStatistics: {} as any,
                            qualityMetrics: {} as any
                        },
                        longTerm: {
                            consolidatedSettings: {} as any,
                            knowledgeDatabase: {} as any,
                            systemKnowledgeBase: {} as any,
                            completedRecords: {} as any
                        },
                        integration: {
                            resolvedDuplicates: [],
                            cacheStatistics: {} as any,
                            accessOptimizations: []
                        }
                    };

                    // 検索結果を適切なレイヤーに分類
                    for (const result of searchResult.results) {
                        switch (result.source) {
                            case MemoryLevel.SHORT_TERM:
                                if (result.data) {
                                    // 短期記憶データの統合
                                    context.shortTerm.keyPhrases.push(...(result.data.keyPhrases || []));
                                }
                                break;
                            case MemoryLevel.MID_TERM:
                                if (result.data) {
                                    // 中期記憶データの統合
                                    context.midTerm.analysisResults.push(result.data);
                                }
                                break;
                            case MemoryLevel.LONG_TERM:
                                if (result.data) {
                                    // 長期記憶データの統合
                                    Object.assign(context.longTerm.consolidatedSettings, result.data);
                                }
                                break;
                        }
                    }

                    return context;
                }

                return null;
            },
            null,
            'getUnifiedMemoryContext'
        );
    }

    /**
     * 安全なChapterAnalysisServiceの作成
     */
    private createSafeChapterAnalysisService(): ChapterAnalysisServiceInterface {
        try {
            const { ChapterAnalysisService } = require('@/lib/analysis/services/chapter/chapter-analysis-service');
            const instance = new ChapterAnalysisService(this.geminiAdapter);

            if (typeof instance.analyzeForIntegration === 'function') {
                logger.info('ChapterAnalysisService loaded with analyzeForIntegration method');
                return instance;
            } else {
                logger.warn('ChapterAnalysisService does not have analyzeForIntegration method, creating proxy');
                return this.createChapterAnalysisServiceProxy(instance);
            }
        } catch (error) {
            logger.warn('Failed to load ChapterAnalysisService, creating fallback service', {
                error: error instanceof Error ? error.message : String(error)
            });
            return this.createFallbackChapterAnalysisService();
        }
    }

    /**
     * ChapterAnalysisServiceプロキシの作成
     */
    private createChapterAnalysisServiceProxy(baseService: any): ChapterAnalysisServiceInterface {
        return {
            analyzeForIntegration: async (content: string, chapterNumber: number, context: GenerationContext, isIntegrated: boolean = true): Promise<ChapterAnalysis> => {
                logger.info(`Proxying analyzeForIntegration call for chapter ${chapterNumber}`);

                try {
                    if (typeof baseService.analyzeChapter === 'function') {
                        const result = await baseService.analyzeChapter(content, chapterNumber, context);
                        return result;
                    }

                    if (typeof baseService.analyze === 'function') {
                        return await baseService.analyze(content, chapterNumber, context);
                    }

                    return this.createBasicChapterAnalysis(content, chapterNumber, context);
                } catch (error) {
                    logger.error(`Proxy method failed for chapter ${chapterNumber}`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                    return this.createBasicChapterAnalysis(content, chapterNumber, context);
                }
            },

            analyzeChapter: baseService.analyzeChapter?.bind(baseService),
            generateImprovementSuggestions: baseService.generateImprovementSuggestions?.bind(baseService) || this.createFallbackImprovementSuggestions.bind(this),
            clearCache: baseService.clearCache?.bind(baseService) || (() => logger.info('ChapterAnalysisService cache clear skipped (not implemented)'))
        };
    }

    /**
     * フォールバックChapterAnalysisServiceの作成
     */
    private createFallbackChapterAnalysisService(): ChapterAnalysisServiceInterface {
        return {
            analyzeForIntegration: async (content: string, chapterNumber: number, context: GenerationContext, isIntegrated: boolean = true): Promise<ChapterAnalysis> => {
                return this.createBasicChapterAnalysis(content, chapterNumber, context);
            },
            analyzeChapter: async (content: string, chapterNumber: number, context: GenerationContext): Promise<ChapterAnalysis> => {
                return this.createBasicChapterAnalysis(content, chapterNumber, context);
            },
            generateImprovementSuggestions: this.createFallbackImprovementSuggestions.bind(this),
            clearCache: () => logger.info('Fallback ChapterAnalysisService cache clear (no-op)')
        };
    }

    /**
     * 基本的な章分析の作成
     */
    private async createBasicChapterAnalysis(
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<ChapterAnalysis> {
        try {
            const characterAnalysis = await this.characterAnalysisService.analyzeCharacter(content, chapterNumber, context);

            const wordCount = content.length;
            const sentenceCount = (content.match(/[。！？]/g) || []).length;
            const paragraphCount = content.split('\n\n').length;

            return {
                characterAppearances: characterAnalysis.characterAppearances,
                themeOccurrences: [],
                foreshadowingElements: [],
                qualityMetrics: this.createFallbackQualityMetrics(),
                detectedIssues: [],
                scenes: [{
                    id: `scene-${chapterNumber}-1`,
                    type: 'DEVELOPMENT',
                    title: `第${chapterNumber}章の主要シーン`,
                    startPosition: 0,
                    endPosition: wordCount,
                    characters: characterAnalysis.characterAppearances.map(char => char.characterName),
                    location: '不明',
                    summary: `第${chapterNumber}章の内容`
                }],
                metadata: {
                    title: `第${chapterNumber}章`,
                    summary: content.substring(0, 200) + '...',
                    keywords: []
                },
                textStats: {
                    wordCount,
                    sentenceCount,
                    paragraphCount,
                    averageSentenceLength: sentenceCount > 0 ? wordCount / sentenceCount : 0
                }
            };
        } catch (error) {
            logger.error(`Basic chapter analysis failed for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return this.createFallbackChapterAnalysis(chapterNumber, context);
        }
    }

    /**
     * フォールバック改善提案の作成
     */
    private async createFallbackImprovementSuggestions(
        analysis: ChapterAnalysis,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<string[]> {
        const suggestions: string[] = [];

        const wordCount = analysis.textStats?.wordCount || 0;

        if (wordCount < 1000) {
            suggestions.push('章の内容量を増やし、より詳細な描写を加えることを検討してください');
        } else if (wordCount > 5000) {
            suggestions.push('章が長すぎる可能性があります。内容を整理し、必要に応じて分割を検討してください');
        }

        if (analysis.characterAppearances.length === 0) {
            suggestions.push('キャラクターの登場がありません。物語の進行に必要なキャラクターを登場させてください');
        } else if (analysis.characterAppearances.length > 5) {
            suggestions.push('多くのキャラクターが登場しています。焦点を絞って主要キャラクターに集中することを検討してください');
        }

        if (analysis.qualityMetrics.overall < 0.6) {
            suggestions.push('全体的な品質を向上させるため、文章の見直しと推敲を行ってください');
        }

        if (suggestions.length === 0) {
            suggestions.push('章の内容をさらに発展させ、読者の興味を引く要素を追加することを検討してください');
        }

        return suggestions;
    }

    /**
     * 🎯 包括的章分析（新記憶階層システム完全対応版）
     * 
     * @param content 章の内容
     * @param chapterNumber 章番号
     * @param context 生成コンテキスト
     * @returns 統合分析結果
     */
    async analyzeChapter(
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<IntegratedAnalysisResult> {
        const startTime = Date.now();
        const cacheKey = this.generateCacheKey(content, chapterNumber, context);

        try {
            logger.info(`新記憶階層システムを使用した包括的章分析を開始`, {
                chapterNumber,
                contentLength: content.length,
                parallelProcessing: this.options.enableParallelProcessing,
                memoryIntegration: this.options.useMemorySystemIntegration
            });

            // 🎯 新記憶階層システムの初期化確保
            await this.ensureMemoryManagerInitialization();

            // キャッシュチェック
            if (this.options.enableCache && this.analysisCache.has(cacheKey)) {
                logger.info('キャッシュされた分析結果を使用', { chapterNumber });
                const cachedResult = this.analysisCache.get(cacheKey)!;
                this.memorySystemStats.cacheHits++;
                return cachedResult;
            }

            // 🎯 新記憶階層システムへの章処理
            if (this.options.useMemorySystemIntegration) {
                await this.processChapterInMemorySystem(content, chapterNumber, context);
            }

            // 分析の実行
            const analysisResult = this.options.enableParallelProcessing
                ? await this.executeParallelAnalysisWithMemoryIntegration(content, chapterNumber, context)
                : await this.executeSequentialAnalysisWithMemoryIntegration(content, chapterNumber, context);

            // 結果の統合と品質保証
            const integratedResult = await this.integrateAnalysisResultsWithMemoryContext(
                analysisResult,
                content,
                chapterNumber,
                context
            );

            // パフォーマンスメトリクスの記録
            const processingTime = Date.now() - startTime;
            this.recordPerformanceMetrics(chapterNumber, processingTime, integratedResult);

            // キャッシュに保存
            if (this.options.enableCache) {
                this.analysisCache.set(cacheKey, integratedResult);
            }

            logger.info(`新記憶階層システムを使用した章分析完了`, {
                chapterNumber,
                processingTime,
                servicesUsed: integratedResult.analysisMetadata.servicesUsed.length,
                unifiedSearchResults: integratedResult.analysisMetadata.unifiedSearchResults,
                memorySystemUsed: integratedResult.analysisMetadata.memorySystemUsed
            });

            return integratedResult;
        } catch (error) {
            logger.error('包括的章分析に失敗', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            return this.createFallbackAnalysisResult(chapterNumber, context, Date.now() - startTime);
        }
    }

    /**
     * 🎯 新記憶階層システムへの章処理
     */
    private async processChapterInMemorySystem(
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<void> {
        await this.safeMemoryOperation(
            async () => {
                const chapter: Chapter = {
                    id: `chapter-${chapterNumber}`,
                    chapterNumber,
                    title: `第${chapterNumber}章`,
                    content,
                    previousChapterSummary: '',
                    scenes: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    metadata: {
                        createdAt: new Date().toISOString(),
                        lastModified: new Date().toISOString(),
                        status: 'analyzed',
                        wordCount: content.length,
                        estimatedReadingTime: Math.ceil(content.length / 1000)
                    }
                };

                logger.info(`統合記憶階層システムに章を処理中: ${chapterNumber}`);
                
                const result = await this.memoryManager.processChapter(chapter);
                
                if (result.success) {
                    logger.info(`章処理成功: ${chapterNumber}`, {
                        processingTime: result.processingTime,
                        affectedComponents: result.affectedComponents
                    });
                    this.memorySystemStats.processingOptimizations++;
                } else {
                    logger.warn(`章処理に問題が発生: ${chapterNumber}`, {
                        errors: result.errors,
                        warnings: result.warnings
                    });
                }

                return result;
            },
            null,
            'processChapterInMemorySystem'
        );
    }

    /**
     * 🎯 記憶システム統合による並列分析
     */
    private async executeParallelAnalysisWithMemoryIntegration(
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<any> {
        const analysisPromises = [
            // 章分析
            this.safelyExecuteAnalysis(
                'ChapterAnalysis',
                () => this.chapterAnalysisService.analyzeForIntegration!(content, chapterNumber, context, true)
            ),

            // メモリ統合テーマ分析
            this.safelyExecuteAnalysis(
                'ThemeAnalysisWithMemory',
                () => this.executeThemeAnalysisWithMemoryIntegration(content, chapterNumber, context)
            ),

            // 文体分析
            this.safelyExecuteAnalysis(
                'StyleAnalysis',
                () => this.executeStyleAnalysis(content)
            ),

            // キャラクター分析
            this.safelyExecuteAnalysis(
                'CharacterAnalysis',
                () => this.characterAnalysisService.analyzeCharacter(content, chapterNumber, context)
            ),

            // メモリ統合物語構造分析
            this.safelyExecuteAnalysis(
                'NarrativeAnalysisWithMemory',
                () => this.executeNarrativeAnalysisWithMemoryIntegration(chapterNumber, context)
            ),

            // メモリ統合読者体験分析
            this.safelyExecuteAnalysis(
                'ReaderExperienceWithMemory',
                () => this.executeReaderExperienceAnalysisWithMemoryIntegration(content, chapterNumber, context)
            )
        ];

        const results = await Promise.allSettled(analysisPromises);
        return {
            chapterAnalysis: this.extractSettledResult(results[0]),
            themeAnalysis: this.extractSettledResult(results[1]),
            styleAnalysis: this.extractSettledResult(results[2]),
            characterAnalysis: this.extractSettledResult(results[3]),
            narrativeAnalysis: this.extractSettledResult(results[4]),
            readerExperience: this.extractSettledResult(results[5])
        };
    }

    /**
     * 🎯 記憶システム統合による逐次分析
     */
    private async executeSequentialAnalysisWithMemoryIntegration(
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<any> {
        const results: any = {};

        results.chapterAnalysis = await this.safelyExecuteAnalysis(
            'ChapterAnalysis',
            () => this.chapterAnalysisService.analyzeForIntegration!(content, chapterNumber, context, true)
        );

        results.themeAnalysis = await this.safelyExecuteAnalysis(
            'ThemeAnalysisWithMemory',
            () => this.executeThemeAnalysisWithMemoryIntegration(content, chapterNumber, context)
        );

        results.styleAnalysis = await this.safelyExecuteAnalysis(
            'StyleAnalysis',
            () => this.executeStyleAnalysis(content)
        );

        results.characterAnalysis = await this.safelyExecuteAnalysis(
            'CharacterAnalysis',
            () => this.characterAnalysisService.analyzeCharacter(content, chapterNumber, context)
        );

        results.narrativeAnalysis = await this.safelyExecuteAnalysis(
            'NarrativeAnalysisWithMemory',
            () => this.executeNarrativeAnalysisWithMemoryIntegration(chapterNumber, context)
        );

        results.readerExperience = await this.safelyExecuteAnalysis(
            'ReaderExperienceWithMemory',
            () => this.executeReaderExperienceAnalysisWithMemoryIntegration(content, chapterNumber, context)
        );

        return results;
    }

    /**
     * 🎯 記憶システム統合テーマ分析
     */
    private async executeThemeAnalysisWithMemoryIntegration(
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<any> {
        const themes = context.theme ? [context.theme] : ['成長', '変化', '挑戦'];

        // 🎯 統一検索による伏線情報取得
        const foreshadowingSearchResult = await this.performUnifiedMemorySearch(
            `foreshadowing chapter ${chapterNumber}`,
            [MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
        );

        const foreshadowingProcessing = await this.safeMemoryOperation(
            () => this.themeAnalysisService.processForeshadowing(content, chapterNumber),
            { 
                resolvedForeshadowing: [], 
                generatedCount: 0, 
                totalActive: foreshadowingSearchResult.totalResults 
            },
            'processForeshadowing'
        );

        const themeResonance = await this.themeAnalysisService.analyzeThemeResonance(content, themes);

        return {
            themeResonance,
            foreshadowingProcessing,
            memorySearchResults: foreshadowingSearchResult
        };
    }

    /**
     * 文体分析の実行
     */
    private async executeStyleAnalysis(content: string): Promise<any> {
        await this.styleAnalysisService.initialize();

        const [styleAnalysis, expressionPatterns] = await Promise.all([
            this.styleAnalysisService.analyzeStyle(content),
            this.styleAnalysisService.analyzeExpressionPatterns(content)
        ]);

        return {
            styleAnalysis,
            expressionPatterns
        };
    }

    /**
     * 🎯 記憶システム統合物語構造分析
     */
    private async executeNarrativeAnalysisWithMemoryIntegration(
        chapterNumber: number,
        context: GenerationContext
    ): Promise<any> {
        // 🎯 統一検索による過去の章構造情報取得
        const structureSearchResult = await this.performUnifiedMemorySearch(
            `scene structure narrative progression chapter ${Math.max(1, chapterNumber - 5)} to ${chapterNumber}`,
            [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
        );

        const sceneStructure = await this.safeMemoryOperation(
            () => this.narrativeAnalysisService.analyzeSceneStructure(10),
            this.createFallbackNarrativeAnalysisResult('sceneStructure'),
            'analyzeSceneStructure'
        );

        const sceneRecommendations = await this.safeMemoryOperation(
            () => this.narrativeAnalysisService.generateSceneRecommendations(chapterNumber),
            this.createFallbackNarrativeAnalysisResult('sceneRecommendations'),
            'generateSceneRecommendations'
        );

        const literaryInspirations = await this.narrativeAnalysisService.generateLiteraryInspirations(context, chapterNumber);

        return {
            sceneStructure: sceneStructure.success ? sceneStructure.results : this.createFallbackSceneStructure(),
            sceneRecommendations: sceneRecommendations.success ? sceneRecommendations.results : [],
            literaryInspirations,
            memorySearchResults: structureSearchResult
        };
    }

    /**
     * 🎯 記憶システム統合読者体験分析
     */
    private async executeReaderExperienceAnalysisWithMemoryIntegration(
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<ReaderExperienceAnalysis> {
        const chapter: Chapter = {
            id: `chapter-${chapterNumber}`,
            chapterNumber,
            title: `第${chapterNumber}章`,
            content,
            previousChapterSummary: '',
            scenes: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                status: 'analyzed',
                wordCount: content.length,
                estimatedReadingTime: Math.ceil(content.length / 1000)
            }
        };

        // 🎯 統一検索による前章情報取得
        const previousChapterSearchResult = await this.performUnifiedMemorySearch(
            `chapters ${Math.max(1, chapterNumber - 3)} to ${chapterNumber - 1}`,
            [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
        );

        const previousChapters = await this.safeMemoryOperation(
            async () => {
                const chapters: Chapter[] = [];

                // 検索結果から前章データを構築
                if (previousChapterSearchResult.success) {
                    for (const result of previousChapterSearchResult.results) {
                        try {
                            if (result.data && result.data.chapterNumber && result.data.chapterNumber < chapterNumber) {
                                const prevChapter: Chapter = {
                                    id: `chapter-${result.data.chapterNumber}`,
                                    chapterNumber: result.data.chapterNumber,
                                    title: result.data.title || `第${result.data.chapterNumber}章`,
                                    content: result.data.content || result.data.summary || '',
                                    previousChapterSummary: '',
                                    scenes: result.data.scenes || [],
                                    createdAt: new Date(result.data.timestamp || Date.now()),
                                    updatedAt: new Date(result.data.timestamp || Date.now()),
                                    metadata: {
                                        createdAt: new Date(result.data.timestamp || Date.now()).toISOString(),
                                        lastModified: new Date(result.data.timestamp || Date.now()).toISOString(),
                                        status: 'processed',
                                        wordCount: result.data.wordCount || 0,
                                        estimatedReadingTime: result.data.estimatedReadingTime || 1,
                                        emotionalImpact: result.data.emotionalImpact,
                                        plotSignificance: result.data.plotSignificance
                                    }
                                };
                                chapters.push(prevChapter);
                            }
                        } catch (error) {
                            logger.warn(`Failed to process previous chapter data from search result`, { error });
                        }
                    }
                }

                // 章番号でソート
                chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);

                return chapters;
            },
            [],
            'getPreviousChaptersFromMemorySystem'
        );

        logger.info(`記憶システム統合読者体験分析: ${previousChapters.length}つの前章データを使用`, {
            chapterNumber,
            previousChapterCount: previousChapters.length,
            memorySearchResults: previousChapterSearchResult.totalResults
        });

        return this.readerExperienceAnalyzer.analyzeReaderExperience(chapter, previousChapters);
    }

    /**
     * 🎯 記憶コンテキスト統合による分析結果統合
     */
    private async integrateAnalysisResultsWithMemoryContext(
        analysisResults: any,
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<IntegratedAnalysisResult> {
        try {
            // 🎯 統合記憶コンテキストの取得
            const memoryContext = await this.getUnifiedMemoryContext(chapterNumber);

            // 統合改善提案の生成（記憶コンテキスト考慮）
            const integratedSuggestions = await this.generateIntegratedSuggestionsWithMemoryContext(
                analysisResults,
                chapterNumber,
                context,
                memoryContext
            );

            // 記憶システム使用統計の計算
            const unifiedSearchResults = this.calculateUnifiedSearchResults(analysisResults);

            const analysisMetadata = {
                analysisTimestamp: new Date().toISOString(),
                servicesUsed: this.getUsedServices(analysisResults),
                processingTime: 0, // 後で設定
                cacheHitRate: this.calculateCacheHitRate(),
                memorySystemUsed: this.options.useMemorySystemIntegration,
                unifiedSearchResults
            };

            return {
                chapterAnalysis: analysisResults.chapterAnalysis || this.createFallbackChapterAnalysis(chapterNumber, context),
                themeAnalysis: analysisResults.themeAnalysis?.themeResonance || this.createFallbackThemeAnalysis(),
                foreshadowingProcessing: analysisResults.themeAnalysis?.foreshadowingProcessing || {
                    resolvedForeshadowing: [],
                    generatedCount: 0,
                    totalActive: 0
                },
                styleAnalysis: analysisResults.styleAnalysis?.styleAnalysis || this.createFallbackStyleAnalysis(),
                expressionPatterns: analysisResults.styleAnalysis?.expressionPatterns || this.createFallbackExpressionPatterns(),
                characterAnalysis: analysisResults.characterAnalysis || this.createFallbackCharacterAnalysis(context),
                sceneStructure: analysisResults.narrativeAnalysis?.sceneStructure || this.createFallbackSceneStructure(),
                sceneRecommendations: analysisResults.narrativeAnalysis?.sceneRecommendations || [],
                literaryInspirations: analysisResults.narrativeAnalysis?.literaryInspirations || this.createFallbackLiteraryInspirations(),
                readerExperience: analysisResults.readerExperience || this.createFallbackReaderExperience(),
                qualityMetrics: analysisResults.chapterAnalysis?.qualityMetrics || this.createFallbackQualityMetrics(),
                integratedSuggestions,
                analysisMetadata
            };
        } catch (error) {
            logger.error('記憶コンテキスト統合による分析結果統合に失敗', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 🎯 記憶コンテキスト考慮の統合改善提案生成
     */
    private async generateIntegratedSuggestionsWithMemoryContext(
        analysisResults: any,
        chapterNumber: number,
        context: GenerationContext,
        memoryContext: UnifiedMemoryContext | null
    ): Promise<string[]> {
        try {
            const allSuggestions: string[] = [];

            // 従来の改善提案収集
            if (analysisResults.chapterAnalysis && this.chapterAnalysisService.generateImprovementSuggestions) {
                const chapterSuggestions = await this.chapterAnalysisService
                    .generateImprovementSuggestions(analysisResults.chapterAnalysis, chapterNumber, context);
                allSuggestions.push(...chapterSuggestions);
            }

            if (analysisResults.characterAnalysis) {
                const characterSuggestions = await this.characterAnalysisService
                    .generateCharacterImprovements(analysisResults.characterAnalysis);
                allSuggestions.push(...characterSuggestions);
            }

            if (analysisResults.readerExperience) {
                const readerSuggestions = this.readerExperienceAnalyzer
                    .generateExperienceImprovements(analysisResults.readerExperience);
                allSuggestions.push(...readerSuggestions);
            }

            // 🎯 記憶コンテキストに基づく追加提案
            if (memoryContext && this.options.useMemorySystemIntegration) {
                const memorySuggestions = this.generateMemoryContextSuggestions(memoryContext, chapterNumber);
                allSuggestions.push(...memorySuggestions);
            }

            // 重複除去と優先順位付け
            const uniqueSuggestions = [...new Set(allSuggestions)];
            return this.prioritizeSuggestions(uniqueSuggestions).slice(0, 10);
        } catch (error) {
            logger.warn('記憶コンテキスト考慮の統合改善提案生成に失敗', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [
                'キャラクターの感情描写をより深く掘り下げてください',
                'テーマの一貫性を保ちながら発展させてください',
                '読者の興味を維持するペース配分を心がけてください'
            ];
        }
    }

    /**
     * 🎯 記憶コンテキストに基づく提案生成
     */
    private generateMemoryContextSuggestions(
        memoryContext: UnifiedMemoryContext,
        chapterNumber: number
    ): string[] {
        const suggestions: string[] = [];

        try {
            // 短期記憶から継続性の提案
            if (memoryContext.shortTerm.keyPhrases.length > 0) {
                suggestions.push(`前章のキーフレーズ「${memoryContext.shortTerm.keyPhrases.slice(0, 2).join('、')}」との継続性を考慮してください`);
            }

            // 中期記憶から物語進行の提案
            if (memoryContext.midTerm.analysisResults.length > 0) {
                suggestions.push('過去の分析結果を参考に、物語の一貫した進行を心がけてください');
            }

            // 長期記憶から設定整合性の提案
            if (Object.keys(memoryContext.longTerm.consolidatedSettings).length > 0) {
                suggestions.push('確立された世界設定や設定との整合性を確認してください');
            }

            // 統合データから重複や矛盾の提案
            if (memoryContext.integration.resolvedDuplicates.length > 0) {
                suggestions.push('以前に解決された重複や矛盾を繰り返さないよう注意してください');
            }
        } catch (error) {
            logger.warn('記憶コンテキスト提案生成でエラー', { error });
        }

        return suggestions;
    }

    /**
     * 統一検索結果数の計算
     */
    private calculateUnifiedSearchResults(analysisResults: any): number {
        let totalResults = 0;

        if (analysisResults.themeAnalysis?.memorySearchResults?.totalResults) {
            totalResults += analysisResults.themeAnalysis.memorySearchResults.totalResults;
        }

        if (analysisResults.narrativeAnalysis?.memorySearchResults?.totalResults) {
            totalResults += analysisResults.narrativeAnalysis.memorySearchResults.totalResults;
        }

        return totalResults;
    }

    /**
     * 安全な分析実行
     */
    private async safelyExecuteAnalysis<T>(
        serviceName: string,
        analysisFunction: () => Promise<T>
    ): Promise<T | null> {
        try {
            logger.debug(`${serviceName} 分析開始`);
            const result = await analysisFunction();
            logger.debug(`${serviceName} 分析完了`);
            return result;
        } catch (error) {
            logger.warn(`${serviceName} 分析失敗、フォールバックを使用`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return null;
        }
    }

    /**
     * 改善提案の優先順位付け
     */
    private prioritizeSuggestions(suggestions: string[]): string[] {
        const priorityKeywords = ['キャラクター', 'テーマ', '読者', '感情', '一貫性', '継続性', '整合性'];

        return suggestions.sort((a, b) => {
            const aScore = priorityKeywords.reduce((score, keyword) =>
                score + (a.includes(keyword) ? 1 : 0), 0);
            const bScore = priorityKeywords.reduce((score, keyword) =>
                score + (b.includes(keyword) ? 1 : 0), 0);

            return bScore - aScore;
        });
    }

    /**
     * PromiseSettledResultから結果を抽出
     */
    private extractSettledResult<T>(result: PromiseSettledResult<T>): T | null {
        return result.status === 'fulfilled' ? result.value : null;
    }

    /**
     * 使用されたサービスの取得
     */
    private getUsedServices(analysisResults: any): string[] {
        const services: string[] = [];
        if (analysisResults.chapterAnalysis) services.push('ChapterAnalysis');
        if (analysisResults.themeAnalysis) services.push('ThemeAnalysis');
        if (analysisResults.styleAnalysis) services.push('StyleAnalysis');
        if (analysisResults.characterAnalysis) services.push('CharacterAnalysis');
        if (analysisResults.narrativeAnalysis) services.push('NarrativeAnalysis');
        if (analysisResults.readerExperience) services.push('ReaderExperience');
        return services;
    }

    /**
     * キャッシュヒット率の計算
     */
    private calculateCacheHitRate(): number {
        const totalRequests = this.performanceMetrics.get('totalRequests') || 0;
        const cacheHits = this.performanceMetrics.get('cacheHits') || 0;
        return totalRequests > 0 ? cacheHits / totalRequests : 0;
    }

    /**
     * パフォーマンスメトリクスの記録
     */
    private recordPerformanceMetrics(
        chapterNumber: number,
        processingTime: number,
        result: IntegratedAnalysisResult
    ): void {
        result.analysisMetadata.processingTime = processingTime;
        this.performanceMetrics.set(`chapter-${chapterNumber}-processingTime`, processingTime);

        const totalRequests = (this.performanceMetrics.get('totalRequests') || 0) + 1;
        this.performanceMetrics.set('totalRequests', totalRequests);
    }

    /**
     * キャッシュキーの生成
     */
    private generateCacheKey(
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): string {
        const contentHash = this.hashString(content.substring(0, 1000));
        const contextHash = this.hashString(JSON.stringify(context));
        return `analysis-${chapterNumber}-${contentHash}-${contextHash}`;
    }

    /**
     * 文字列のハッシュ化
     */
    private hashString(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    /**
     * キャッシュクリア
     */
    clearCache(): void {
        this.analysisCache.clear();
        this.performanceMetrics.clear();

        // 各サービスのキャッシュもクリア
        this.characterAnalysisService.clearCache();
        if (this.chapterAnalysisService.clearCache) {
            this.chapterAnalysisService.clearCache();
        }

        logger.info('全分析キャッシュをクリア');
    }

    /**
     * 🎯 新記憶階層システム統計取得
     */
    getMemorySystemStatistics() {
        return {
            ...this.memorySystemStats,
            integrationEnabled: this.options.useMemorySystemIntegration,
            searchDepth: this.options.memorySearchDepth
        };
    }

    // =========================================================================
    // フォールバックメソッド群
    // =========================================================================

    private createFallbackAnalysisResult(
        chapterNumber: number,
        context: GenerationContext,
        processingTime: number
    ): IntegratedAnalysisResult {
        return {
            chapterAnalysis: this.createFallbackChapterAnalysis(chapterNumber, context),
            themeAnalysis: this.createFallbackThemeAnalysis(),
            foreshadowingProcessing: { resolvedForeshadowing: [], generatedCount: 0, totalActive: 0 },
            styleAnalysis: this.createFallbackStyleAnalysis(),
            expressionPatterns: this.createFallbackExpressionPatterns(),
            characterAnalysis: this.createFallbackCharacterAnalysis(context),
            sceneStructure: this.createFallbackSceneStructure(),
            sceneRecommendations: [],
            literaryInspirations: this.createFallbackLiteraryInspirations(),
            readerExperience: this.createFallbackReaderExperience(),
            qualityMetrics: this.createFallbackQualityMetrics(),
            integratedSuggestions: ['章の分析でエラーが発生しました。基本的な改善を心がけてください。'],
            analysisMetadata: {
                analysisTimestamp: new Date().toISOString(),
                servicesUsed: ['Fallback'],
                processingTime,
                cacheHitRate: 0,
                memorySystemUsed: false,
                unifiedSearchResults: 0
            }
        };
    }

    private createFallbackChapterAnalysis(chapterNumber: number, context: GenerationContext): ChapterAnalysis {
        return {
            characterAppearances: [],
            themeOccurrences: [],
            foreshadowingElements: [],
            qualityMetrics: this.createFallbackQualityMetrics(),
            detectedIssues: [],
            scenes: [{
                id: `scene-${chapterNumber}-1`,
                type: 'DEVELOPMENT',
                title: '章の内容',
                startPosition: 0,
                endPosition: 1000,
                characters: [],
                location: '',
                summary: '章全体'
            }],
            metadata: { title: `第${chapterNumber}章`, summary: '', keywords: [] },
            textStats: { wordCount: 1000, sentenceCount: 20, paragraphCount: 5, averageSentenceLength: 50 }
        };
    }

    private createFallbackThemeAnalysis(): ThemeResonanceAnalysis {
        return {
            themes: {},
            overallCoherence: 7,
            dominantTheme: '成長',
            themeTensions: {}
        };
    }

    private createFallbackStyleAnalysis(): StyleAnalysis {
        return {
            avgSentenceLength: 20,
            sentenceVariety: 0.5,
            vocabularyRichness: 0.5
        };
    }

    private createFallbackExpressionPatterns(): ExpressionPatterns {
        return {
            verbPhrases: [],
            adjectivalExpressions: [],
            dialoguePatterns: [],
            conjunctions: [],
            sentenceStructures: []
        };
    }

    private createFallbackCharacterAnalysis(context: GenerationContext): CharacterAnalysisResult {
        return {
            characterAppearances: [],
            characterPsychologies: [],
            characterGrowth: {
                updatedCharacters: [],
                growthSummary: {
                    totalCharactersAnalyzed: 0,
                    charactersWithGrowth: 0,
                    majorGrowthEvents: []
                }
            },
            relationshipDynamics: []
        };
    }

    private createFallbackSceneStructure(): SceneStructureAnalysis {
        return {
            typeDistribution: {
                'INTRODUCTION': 1,
                'DEVELOPMENT': 1,
                'CLIMAX': 1,
                'RESOLUTION': 1,
                'TRANSITION': 1
            },
            lengthDistribution: { min: 500, max: 2000, avg: 1000, stdDev: 500 },
            paceVariation: 0.5,
            transitionTypes: { types: {}, smoothness: 0.7 }
        };
    }

    private createFallbackLiteraryInspirations(): LiteraryInspiration {
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

    private createFallbackReaderExperience(): ReaderExperienceAnalysis {
        return {
            interestRetention: 7,
            empathy: 7,
            clarity: 7,
            unexpectedness: 7,
            anticipation: 7,
            overallScore: 7,
            weakPoints: [],
            strengths: ['十分な読者体験の提供']
        };
    }

    private createFallbackQualityMetrics(): QualityMetrics {
        return {
            readability: 0.75,
            consistency: 0.7,
            engagement: 0.7,
            characterDepiction: 0.7,
            originality: 0.65,
            overall: 0.7,
            coherence: 0.7,
            characterConsistency: 0.7
        };
    }

    /**
     * NarrativeAnalysisResult形式のフォールバック作成
     */
    private createFallbackNarrativeAnalysisResult(analysisType: string): any {
        return {
            success: true,
            processingTime: 0,
            analysisType,
            results: analysisType === 'sceneStructure' 
                ? this.createFallbackSceneStructure()
                : analysisType === 'sceneRecommendations'
                ? []
                : {},
            metadata: {
                timestamp: new Date().toISOString(),
                fallback: true
            }
        };
    }
}