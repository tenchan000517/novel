/**
 * @fileoverview 分析コーディネータ（修正版）
 * @description
 * 未実装メソッド呼び出しエラーを解決し、安全なフォールバック機能を追加
 */

import { logger } from '@/lib/utils/logger';
import { GeminiAdapter } from '@/lib/analysis/adapters/gemini-adapter';
import { JsonParser } from '@/lib/utils/json-parser';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { MemoryManager } from '@/lib/memory/manager';
import { StorageProvider } from '@/lib/storage';

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
}

/**
 * @class AnalysisCoordinator（修正版）
 * @description 分析コーディネータ
 * 
 * 修正内容：
 * - 未実装メソッドの安全な呼び出し
 * - フォールバック機能の強化
 * - エラーハンドリングの改善
 * - 🔧 追加: MemoryManager初期化確保
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

    // 設定
    private options: AnalysisCoordinatorOptions;

    /**
     * コンストラクタ
     * 
     * @param geminiAdapter AI分析アダプター
     * @param memoryManager メモリマネージャー
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
            geminiClient: this.geminiAdapter as any
        });

        this.readerExperienceAnalyzer = new ReaderExperienceAnalyzer(
            this.geminiAdapter as any
        );

        // 🔧 修正：ChapterAnalysisServiceの安全な初期化
        this.chapterAnalysisService = this.createSafeChapterAnalysisService();

        logger.info('AnalysisCoordinator initialized with safety enhancements', { options: this.options });
    }

    /**
     * 🔧 追加: MemoryManager初期化確保
     */
    private async ensureMemoryManagerInitialization(): Promise<void> {
        try {
            logger.info('MemoryManager 初期化状態を確認中...');

            // 初期化されていない場合は初期化実行
            const isInitialized = await this.memoryManager.isInitialized();
            if (!isInitialized) {
                logger.info('MemoryManager を初期化します...');
                await this.memoryManager.initialize();
                logger.info('MemoryManager 初期化完了');
            } else {
                logger.info('MemoryManager は既に初期化済み');
            }

        } catch (initError) {
            logger.warn('MemoryManager 初期化に失敗しましたが、分析を続行します', {
                error: initError instanceof Error ? initError.message : String(initError)
            });
        }
    }

    /**
     * 🔧 追加: 安全な MemoryManager 操作
     */
    private async safeMemoryManagerOperation<T>(
        operation: () => Promise<T>,
        fallbackValue: T,
        operationName: string
    ): Promise<T> {
        try {
            // MemoryManager が利用可能かチェック
            const isInitialized = await this.memoryManager.isInitialized();
            if (!isInitialized) {
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
     * 🔧 修正：安全なChapterAnalysisServiceの作成
     * 
     * @private
     * @returns 安全なChapterAnalysisService
     */
    private createSafeChapterAnalysisService(): ChapterAnalysisServiceInterface {
        try {
            // 実際のChapterAnalysisServiceをインポートして初期化を試行
            const { ChapterAnalysisService } = require('@/lib/analysis/services/chapter/chapter-analysis-service');
            const instance = new ChapterAnalysisService(this.geminiAdapter);

            // 必要なメソッドが存在するかチェック
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
     * 🔧 修正：ChapterAnalysisServiceプロキシの作成
     * 
     * @private
     * @param baseService ベースサービス
     * @returns プロキシサービス
     */
    private createChapterAnalysisServiceProxy(baseService: any): ChapterAnalysisServiceInterface {
        return {
            // 🎯 キーポイント：analyzeForIntegrationメソッドの実装
            analyzeForIntegration: async (content: string, chapterNumber: number, context: GenerationContext, isIntegrated: boolean = true): Promise<ChapterAnalysis> => {
                logger.info(`Proxying analyzeForIntegration call to existing methods for chapter ${chapterNumber}`);

                try {
                    // 既存のanalyzeChapterメソッドがあるかチェック
                    if (typeof baseService.analyzeChapter === 'function') {
                        const result = await baseService.analyzeChapter(content, chapterNumber, context);
                        logger.info(`Successfully proxied to analyzeChapter for chapter ${chapterNumber}`);
                        return result;
                    }

                    // 他の分析メソッドがあるかチェック
                    if (typeof baseService.analyze === 'function') {
                        const result = await baseService.analyze(content, chapterNumber, context);
                        logger.info(`Successfully proxied to analyze for chapter ${chapterNumber}`);
                        return result;
                    }

                    // フォールバック：基本的な章分析を実行
                    logger.warn(`No suitable proxy method found, using fallback analysis for chapter ${chapterNumber}`);
                    return this.createBasicChapterAnalysis(content, chapterNumber, context);
                } catch (error) {
                    logger.error(`Proxy method failed for chapter ${chapterNumber}`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                    return this.createBasicChapterAnalysis(content, chapterNumber, context);
                }
            },

            // 既存メソッドの委譲
            analyzeChapter: baseService.analyzeChapter?.bind(baseService),
            generateImprovementSuggestions: baseService.generateImprovementSuggestions?.bind(baseService) || this.createFallbackImprovementSuggestions.bind(this),
            clearCache: baseService.clearCache?.bind(baseService) || (() => logger.info('ChapterAnalysisService cache clear skipped (not implemented)'))
        };
    }

    /**
     * 🔧 修正：フォールバックChapterAnalysisServiceの作成
     * 
     * @private
     * @returns フォールバックサービス
     */
    private createFallbackChapterAnalysisService(): ChapterAnalysisServiceInterface {
        logger.info('Creating fallback ChapterAnalysisService');

        return {
            analyzeForIntegration: async (content: string, chapterNumber: number, context: GenerationContext, isIntegrated: boolean = true): Promise<ChapterAnalysis> => {
                logger.info(`Using fallback analyzeForIntegration for chapter ${chapterNumber}`);
                return this.createBasicChapterAnalysis(content, chapterNumber, context);
            },

            analyzeChapter: async (content: string, chapterNumber: number, context: GenerationContext): Promise<ChapterAnalysis> => {
                logger.info(`Using fallback analyzeChapter for chapter ${chapterNumber}`);
                return this.createBasicChapterAnalysis(content, chapterNumber, context);
            },

            generateImprovementSuggestions: this.createFallbackImprovementSuggestions.bind(this),
            clearCache: () => logger.info('Fallback ChapterAnalysisService cache clear (no-op)')
        };
    }

    /**
     * 🔧 修正：基本的な章分析の作成
     * 
     * @private
     * @param content 章の内容
     * @param chapterNumber 章番号
     * @param context 生成コンテキスト
     * @returns 基本的な章分析結果
     */
    private async createBasicChapterAnalysis(
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<ChapterAnalysis> {
        try {
            // CharacterAnalysisServiceを活用した基本分析
            const characterAnalysis = await this.characterAnalysisService.analyzeCharacter(content, chapterNumber, context);

            // 基本的な文章統計
            const wordCount = content.length;
            const sentenceCount = (content.match(/[。！？]/g) || []).length;
            const paragraphCount = content.split('\n\n').length;

            const chapterAnalysis: ChapterAnalysis = {
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

            logger.info(`Basic chapter analysis completed for chapter ${chapterNumber}`, {
                wordCount,
                characterCount: characterAnalysis.characterAppearances.length
            });

            return chapterAnalysis;
        } catch (error) {
            logger.error(`Basic chapter analysis failed for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return this.createFallbackChapterAnalysis(chapterNumber, context);
        }
    }

    /**
     * 🔧 修正：フォールバック改善提案の作成
     * 
     * @private
     * @param analysis 分析結果
     * @param chapterNumber 章番号
     * @param context 生成コンテキスト
     * @returns 改善提案
     */
    private async createFallbackImprovementSuggestions(
        analysis: ChapterAnalysis,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<string[]> {
        const suggestions: string[] = [];

        // 🔧 修正：textStatsの安全なアクセス
        const wordCount = analysis.textStats?.wordCount || 0;

        // 文章量による提案
        if (wordCount > 0) {
            if (wordCount < 1000) {
                suggestions.push('章の内容量を増やし、より詳細な描写を加えることを検討してください');
            } else if (wordCount > 5000) {
                suggestions.push('章が長すぎる可能性があります。内容を整理し、必要に応じて分割を検討してください');
            }
        }

        // キャラクター登場による提案
        if (analysis.characterAppearances.length === 0) {
            suggestions.push('キャラクターの登場がありません。物語の進行に必要なキャラクターを登場させてください');
        } else if (analysis.characterAppearances.length > 5) {
            suggestions.push('多くのキャラクターが登場しています。焦点を絞って主要キャラクターに集中することを検討してください');
        }

        // 品質メトリクスによる提案
        if (analysis.qualityMetrics.overall < 0.6) {
            suggestions.push('全体的な品質を向上させるため、文章の見直しと推敲を行ってください');
        }

        // デフォルト提案
        if (suggestions.length === 0) {
            suggestions.push('章の内容をさらに発展させ、読者の興味を引く要素を追加することを検討してください');
        }

        return suggestions;
    }

    /**
     * 包括的章分析（修正版）
     * 
     * 全ての分析サービスを使用して章の包括的な分析を実行します。
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
            logger.info(`Starting comprehensive chapter analysis`, {
                chapterNumber,
                contentLength: content.length,
                parallelProcessing: this.options.enableParallelProcessing
            });

            // 🔧 追加: MemoryManager の明示的初期化確保
            await this.ensureMemoryManagerInitialization();

            // キャッシュチェック
            if (this.options.enableCache && this.analysisCache.has(cacheKey)) {
                logger.info('Using cached analysis result', { chapterNumber });
                return this.analysisCache.get(cacheKey)!;
            }

            // 🔧 修正：分析の実行（エラーハンドリング強化）
            const analysisResult = this.options.enableParallelProcessing
                ? await this.executeParallelAnalysis(content, chapterNumber, context)
                : await this.executeSequentialAnalysis(content, chapterNumber, context);

            // 結果の統合と品質保証
            const integratedResult = await this.integrateAnalysisResults(
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

            logger.info(`Chapter analysis completed successfully`, {
                chapterNumber,
                processingTime,
                servicesUsed: integratedResult.analysisMetadata.servicesUsed.length
            });

            return integratedResult;
        } catch (error) {
            logger.error('Comprehensive chapter analysis failed', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            // フォールバック分析結果を返す
            return this.createFallbackAnalysisResult(chapterNumber, context, Date.now() - startTime);
        }
    }

    /**
     * 🔧 修正：並列分析の実行（エラーハンドリング強化）
     * 
     * @private
     * @param content 章の内容
     * @param chapterNumber 章番号
     * @param context 生成コンテキスト
     * @returns 分析結果
     */
    private async executeParallelAnalysis(
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<any> {
        const analysisPromises = [
            // 🎯 修正：安全なChapterAnalysisService呼び出し
            this.safelyExecuteAnalysis(
                'ChapterAnalysis',
                () => this.chapterAnalysisService.analyzeForIntegration!(content, chapterNumber, context, true)
            ),

            // テーマ分析
            this.safelyExecuteAnalysis(
                'ThemeAnalysis',
                () => this.executeThemeAnalysis(content, chapterNumber, context)
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

            // 物語構造分析
            this.safelyExecuteAnalysis(
                'NarrativeAnalysis',
                () => this.executeNarrativeAnalysis(chapterNumber, context)
            ),

            // 読者体験分析
            this.safelyExecuteAnalysis(
                'ReaderExperience',
                () => this.executeReaderExperienceAnalysis(content, chapterNumber, context)
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
     * 🔧 修正：安全な分析実行
     * 
     * @private
     * @param serviceName サービス名
     * @param analysisFunction 分析関数
     * @returns 分析結果またはnull
     */
    private async safelyExecuteAnalysis<T>(
        serviceName: string,
        analysisFunction: () => Promise<T>
    ): Promise<T | null> {
        try {
            logger.debug(`Starting ${serviceName} analysis`);
            const result = await analysisFunction();
            logger.debug(`${serviceName} analysis completed successfully`);
            return result;
        } catch (error) {
            logger.warn(`${serviceName} analysis failed, using fallback`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return null;
        }
    }

    /**
     * 🔧 修正：逐次分析の実行（エラーハンドリング強化）
     * 
     * @private
     * @param content 章の内容
     * @param chapterNumber 章番号
     * @param context 生成コンテキスト
     * @returns 分析結果
     */
    private async executeSequentialAnalysis(
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<any> {
        const results: any = {};

        // 順序を最適化：依存関係の少ないものから実行
        results.chapterAnalysis = await this.safelyExecuteAnalysis(
            'ChapterAnalysis',
            () => this.chapterAnalysisService.analyzeForIntegration!(content, chapterNumber, context, true)
        );

        results.themeAnalysis = await this.safelyExecuteAnalysis(
            'ThemeAnalysis',
            () => this.executeThemeAnalysis(content, chapterNumber, context)
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
            'NarrativeAnalysis',
            () => this.executeNarrativeAnalysis(chapterNumber, context)
        );

        results.readerExperience = await this.safelyExecuteAnalysis(
            'ReaderExperience',
            () => this.executeReaderExperienceAnalysis(content, chapterNumber, context)
        );

        return results;
    }

    /**
     * 🔧 修正：テーマ分析の実行
     * 
     * @private
     * @param content 章の内容
     * @param chapterNumber 章番号
     * @param context 生成コンテキスト
     * @returns テーマ分析結果
     */
    private async executeThemeAnalysis(
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<any> {
        const themes = context.theme ? [context.theme] : ['成長', '変化', '挑戦'];

        // 🔧 修正: 安全な伏線処理
        const foreshadowingProcessing = await this.safeMemoryManagerOperation(
            () => this.themeAnalysisService.processForeshadowing(content, chapterNumber),
            { resolvedForeshadowing: [], generatedCount: 0, totalActive: 0 },
            'processForeshadowing'
        );

        const themeResonance = await this.themeAnalysisService.analyzeThemeResonance(content, themes);

        return {
            themeResonance,
            foreshadowingProcessing
        };
    }

    /**
     * 文体分析の実行
     * 
     * @private
     * @param content 章の内容
     * @returns 文体分析結果
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
     * 🔧 修正：物語構造分析の実行
     * 
     * @private
     * @param chapterNumber 章番号
     * @param context 生成コンテキスト
     * @returns 物語構造分析結果
     */
    private async executeNarrativeAnalysis(
        chapterNumber: number,
        context: GenerationContext
    ): Promise<any> {
        // 🔧 修正: 安全なシーン構造分析
        const sceneStructure = await this.safeMemoryManagerOperation(
            () => this.narrativeAnalysisService.analyzeSceneStructure(10),
            this.createFallbackSceneStructure(),
            'analyzeSceneStructure'
        );

        // 🔧 修正: 安全なシーン推奨生成
        const sceneRecommendations = await this.safeMemoryManagerOperation(
            () => this.narrativeAnalysisService.generateSceneRecommendations(chapterNumber),
            [],
            'generateSceneRecommendations'
        );

        // 文学的インスピレーション（MemoryManager非依存）
        const literaryInspirations = await this.narrativeAnalysisService.generateLiteraryInspirations(context, chapterNumber);

        return {
            sceneStructure,
            sceneRecommendations,
            literaryInspirations
        };
    }

    /**
     * 読者体験分析の実行
     * 
     * @private
     * @param content 章の内容
     * @param chapterNumber 章番号
     * @param context 生成コンテキスト
     * @returns 読者体験分析結果
     */
    private async executeReaderExperienceAnalysis(
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<ReaderExperienceAnalysis> {
        const chapter: Chapter = {
            id: `chapter-${chapterNumber}`,
            chapterNumber,
            title: `第${chapterNumber}章`,
            content,
            scenes: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
                wordCount: content.length,
                estimatedReadingTime: Math.ceil(content.length / 1000)
            }
        };

        // 🔧 修正: 前章データの安全な取得
        const previousChapters = await this.safeMemoryManagerOperation(
            async () => {
                // 前の3章を取得（読者体験分析に必要な範囲）
                const chapters: Chapter[] = [];

                for (let i = Math.max(1, chapterNumber - 3); i < chapterNumber; i++) {
                    try {
                        // MemoryManagerから章データを取得
                        const prevChapterMemory = await this.memoryManager.getRecentChapterMemories(i, 1);

                        if (prevChapterMemory.length > 0) {
                            const memory = prevChapterMemory[0];

                            // ChapterMemoryからChapter形式に変換
                            const prevChapter: Chapter = {
                                id: `chapter-${i}`,
                                chapterNumber: i,
                                title: `第${i}章`,
                                content: memory.summary, // 要約を使用（全文は重い）
                                scenes: [],
                                createdAt: new Date(memory.timestamp),
                                updatedAt: new Date(memory.timestamp),
                                metadata: {
                                    wordCount: memory.summary.length,
                                    estimatedReadingTime: Math.ceil(memory.summary.length / 1000),
                                    emotionalImpact: memory.emotional_impact,
                                    plotSignificance: memory.plot_significance
                                }
                            };

                            chapters.push(prevChapter);
                        }
                    } catch (error) {
                        logger.warn(`Failed to get chapter ${i} data for reader experience analysis`, {
                            error: error instanceof Error ? error.message : String(error)
                        });
                        // エラーが発生した章はスキップして続行
                    }
                }

                return chapters;
            },
            [], // フォールバック: 空配列
            'getPreviousChapters'
        );

        logger.info(`Reader experience analysis: using ${previousChapters.length} previous chapters for context`, {
            chapterNumber,
            previousChapterCount: previousChapters.length
        });

        return this.readerExperienceAnalyzer.analyzeReaderExperience(chapter, previousChapters);
    }

    /**
     * 分析結果の統合
     * 
     * @private
     * @param analysisResults 個別分析結果
     * @param content 章の内容
     * @param chapterNumber 章番号
     * @param context 生成コンテキスト
     * @returns 統合分析結果
     */
    private async integrateAnalysisResults(
        analysisResults: any,
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<IntegratedAnalysisResult> {
        try {
            // 統合改善提案の生成
            const integratedSuggestions = await this.generateIntegratedSuggestions(
                analysisResults,
                chapterNumber,
                context
            );

            // 分析メタデータの構築
            const analysisMetadata = {
                analysisTimestamp: new Date().toISOString(),
                servicesUsed: this.getUsedServices(analysisResults),
                processingTime: 0, // 後で設定
                cacheHitRate: this.calculateCacheHitRate()
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
            logger.error('Failed to integrate analysis results', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 統合改善提案の生成
     * 
     * @private
     * @param analysisResults 分析結果
     * @param chapterNumber 章番号
     * @param context 生成コンテキスト
     * @returns 統合改善提案
     */
    private async generateIntegratedSuggestions(
        analysisResults: any,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<string[]> {
        try {
            const allSuggestions: string[] = [];

            // 各分析からの改善提案を収集
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

            // 重複除去と優先順位付け
            const uniqueSuggestions = [...new Set(allSuggestions)];

            // 最大10個に制限し、重要度でソート
            return this.prioritizeSuggestions(uniqueSuggestions).slice(0, 10);
        } catch (error) {
            logger.warn('Failed to generate integrated suggestions', {
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
     * 改善提案の優先順位付け
     * 
     * @private
     * @param suggestions 改善提案
     * @returns 優先順位付けされた改善提案
     */
    private prioritizeSuggestions(suggestions: string[]): string[] {
        // 重要キーワードによる優先順位付け
        const priorityKeywords = ['キャラクター', 'テーマ', '読者', '感情', '一貫性'];

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
     * 
     * @private
     * @param result PromiseSettledResult
     * @returns 抽出された値またはnull
     */
    private extractSettledResult<T>(result: PromiseSettledResult<T>): T | null {
        return result.status === 'fulfilled' ? result.value : null;
    }

    /**
     * 使用されたサービスの取得
     * 
     * @private
     * @param analysisResults 分析結果
     * @returns 使用されたサービスの配列
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
     * 
     * @private
     * @returns キャッシュヒット率
     */
    private calculateCacheHitRate(): number {
        const totalRequests = this.performanceMetrics.get('totalRequests') || 0;
        const cacheHits = this.performanceMetrics.get('cacheHits') || 0;
        return totalRequests > 0 ? cacheHits / totalRequests : 0;
    }

    /**
     * パフォーマンスメトリクスの記録
     * 
     * @private
     * @param chapterNumber 章番号
     * @param processingTime 処理時間
     * @param result 分析結果
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
     * 
     * @private
     * @param content 章の内容
     * @param chapterNumber 章番号
     * @param context 生成コンテキスト
     * @returns キャッシュキー
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
     * 
     * @private
     * @param str 文字列
     * @returns ハッシュ値
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

        logger.info('All analysis caches cleared');
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
                cacheHitRate: 0
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
}