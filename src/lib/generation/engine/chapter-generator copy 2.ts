// src/lib/generation/engine/chapter-generator.ts（依存注入対応版）
import { GeminiClient } from '../gemini-client';
import { ContextGenerator } from '../context-generator';
import { PromptGenerator } from '../prompt-generator';
import { TextParser } from './text-parser';

// 新記憶階層システム統合
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import {
    MemoryLevel,
    MemoryAccessRequest,
    MemoryRequestType,
} from '@/lib/memory/core/types';

import { GenerationContext, GenerateChapterRequest, ThemeEnhancement, ForeshadowingElement, StyleGuidance } from '@/types/generation';
import { Chapter } from '@/types/chapters';
import { logger } from '@/lib/utils/logger';
import { GenerationError } from '@/lib/utils/error-handler';

// 拡張型定義
interface EnhancedGenerationContext extends GenerationContext {
    unifiedMemoryData?: {
        searchSuccess: boolean;
        totalResults: number;
        processingTime: number;
        layersAccessed: MemoryLevel[];
        resultsByLayer: {
            shortTerm: number;
            midTerm: number;
            longTerm: number;
        };
    };
    integrationMetadata?: {
        unifiedSearchUsed: boolean;
        fallbackToTraditional: boolean;
        keyPhrasesCount?: number;
        characterStatesCount?: number;
        error?: string;
    };

    keyPhrases?: string[];
    characterStates?: Map<string, any>;
    narrativeProgression?: any;
    characterEvolution?: any[];
    qualityMetrics?: any;
    consolidatedSettings?: any;
    knowledgeDatabase?: any;
    resolvedDuplicates?: any[];
    accessOptimizations?: any[];
}

import { parameterManager } from '@/lib/parameters';
import { plotManager } from '@/lib/plot';
import { characterManager } from '@/lib/characters/manager';
import { chapterStorage, storageProvider } from '@/lib/storage';

// analysisモジュール統合（依存性注入対応）
import { ContentAnalysisManager } from '@/lib/analysis/content-analysis-manager';
import { PreGenerationPipeline } from '@/lib/analysis/pipelines/pre-generation-pipeline';
import { PostGenerationPipeline } from '@/lib/analysis/pipelines/post-generation-pipeline';
import { AnalysisCoordinator } from '@/lib/analysis/coordinators/analysis-coordinator';
import {
    OptimizationCoordinator,
    createOptimizationCoordinator,
    OptimizationCoordinatorDependencies
} from '@/lib/analysis/coordinators/optimization-coordinator';
import { GeminiAdapter } from '@/lib/analysis/adapters/gemini-adapter';

// 「魂のこもった学びの物語」システムのインポート
import LearningJourneySystem from '@/lib/learning-journey';
import { LearningStage } from '@/lib/learning-journey/concept-learning-manager';

import { withTimeout } from '@/lib/utils/promise-utils';

// プロンプト保存機能のインポート
import { promptStorage } from '@/lib/utils/prompt-storage';

// タイムアウト設定
const TIMEOUT_CONFIG = {
    GENERATION: {
        CONTEXT: 240000,
        PROMPT: 60000,
        AI_GENERATION: 180000,
        MEMORY_PROCESSING: 120000,
        TOTAL_CHAPTER: 600000
    }
};

// 拡張型定義
interface ExtendedGenerateChapterRequest extends GenerateChapterRequest {
    improvementSuggestions?: string[];
    themeEnhancements?: ThemeEnhancement[];
    styleGuidance?: StyleGuidance;
    alternativeExpressions?: any;
    literaryInspirations?: any;
    characterPsychology?: any;
    tensionOptimization?: any;
    characters?: Array<{ id: string; name: string; type: string; }>;
}

/**
 * @class ChapterGenerator
 * @description 小説のチャプター生成を担当するクラス（依存注入対応版）
 */
export class ChapterGenerator {
    private geminiClient: GeminiClient;
    private contextGenerator: ContextGenerator;
    private promptGenerator: PromptGenerator;
    private textParser: TextParser;
    private memoryManager: MemoryManager;
    private contentAnalysisManager: ContentAnalysisManager;
    private learningJourneySystem?: LearningJourneySystem;

    /**
     * コンストラクタ（依存注入対応版）
     */
    constructor(
        geminiClient: GeminiClient,
        promptGenerator: PromptGenerator,
        memoryManager: MemoryManager,
        contentAnalysisManager?: ContentAnalysisManager
    ) {
        this.geminiClient = geminiClient;
        this.promptGenerator = promptGenerator;
        this.memoryManager = memoryManager;
        this.textParser = new TextParser();
        this.contextGenerator = new ContextGenerator(memoryManager);

        // ContentAnalysisManagerの依存性注入
        if (contentAnalysisManager) {
            this.contentAnalysisManager = contentAnalysisManager;
        } else {
            // デフォルトのContentAnalysisManagerを作成
            try {
                const geminiAdapter = new GeminiAdapter(geminiClient);
                const analysisCoordinator = new AnalysisCoordinator(
                    geminiAdapter,
                    memoryManager,
                    storageProvider
                );

                const optimizationCoordinatorDependencies: OptimizationCoordinatorDependencies = {
                    characterManager: characterManager.getInstance(memoryManager),
                    memoryManager: memoryManager,
                };

                const optimizationCoordinator = createOptimizationCoordinator(
                    geminiAdapter,
                    optimizationCoordinatorDependencies
                );

                const preGenerationPipeline = new PreGenerationPipeline(
                    analysisCoordinator,
                    optimizationCoordinator
                );

                const postGenerationPipeline = new PostGenerationPipeline(
                    analysisCoordinator,
                    optimizationCoordinator
                );

                this.contentAnalysisManager = new ContentAnalysisManager(
                    preGenerationPipeline,
                    postGenerationPipeline
                );

                logger.info('ContentAnalysisManager initialized with dependency injection');

            } catch (error) {
                logger.error('Failed to initialize ContentAnalysisManager with dependency injection, using fallback', {
                    error: error instanceof Error ? error.message : String(error)
                });
                this.contentAnalysisManager = null as any;
            }
        }

        // ContextGeneratorへの依存性注入
        if (this.contentAnalysisManager) {
            this.contextGenerator.setContentAnalysisManager(this.contentAnalysisManager);
        }

        // LearningJourneySystemの初期化
        try {
            this.learningJourneySystem = new LearningJourneySystem(
                this.geminiClient,
                this.memoryManager,
                characterManager.getInstance(this.memoryManager)
            );

            // 非同期初期化は背景で実行
            this.learningJourneySystem.initialize('default-story').catch(error => {
                logger.warn('LearningJourneySystem background initialization failed', { error });
                this.learningJourneySystem = undefined;
            });

        } catch (error) {
            logger.warn('Failed to initialize LearningJourneySystem', { error });
            this.learningJourneySystem = undefined;
        }

        logger.info('ChapterGenerator ready for immediate use with unified memory system integration');
    }

    /**
     * 章を生成する（統合記憶階層システム対応版）
     */
    async generate(
        chapterNumber: number,
        options?: ExtendedGenerateChapterRequest
    ): Promise<Chapter> {
        const startTime = Date.now();

        logger.info(`Starting chapter ${chapterNumber} generation (unified memory system)`, {
            timeouts: TIMEOUT_CONFIG.GENERATION,
            options,
            targetLength: options?.targetLength,
            forcedGeneration: options?.forcedGeneration,
            overrides: options?.overrides
        });

        try {
            const params = parameterManager.getParameters();

            // システム状態の確認
            const systemStatus = await this.memoryManager.getSystemStatus();
            if (!systemStatus.initialized) {
                throw new GenerationError(
                    'Unified memory system is not properly initialized',
                    'MEMORY_SYSTEM_NOT_INITIALIZED'
                );
            }

            // 第1章の生成前には初期化チェックを行う
            if (chapterNumber === 1) {
                const initCheck = await this.checkInitializationForFirstChapter();
                if (!initCheck.initialized) {
                    throw new GenerationError(
                        `First chapter generation failed: ${initCheck.reason}`,
                        'INITIALIZATION_ERROR'
                    );
                }
            }

            // 生成前パイプライン実行
            let enhancementOptions: ExtendedGenerateChapterRequest = { ...options };

            if (chapterNumber > 1 && this.contentAnalysisManager) {
                try {
                    logger.info(`Executing pre-generation pipeline for chapter ${chapterNumber}`);

                    const previousChapterContent = await this.getPreviousChapterContentViaUnifiedAccess(chapterNumber - 1);

                    const preparationResult = await withTimeout(
                        this.contentAnalysisManager.prepareChapterGeneration(
                            chapterNumber,
                            previousChapterContent
                        ),
                        60000,
                        'Pre-generation pipeline'
                    );

                    if (preparationResult.success) {
                        const enhancements = preparationResult.enhancements;
                        enhancementOptions = {
                            ...options,
                            improvementSuggestions: enhancements.improvementSuggestions,
                            themeEnhancements: enhancements.themeEnhancements,
                            styleGuidance: enhancements.styleGuidance,
                            alternativeExpressions: enhancements.alternativeExpressions,
                            literaryInspirations: enhancements.literaryInspirations,
                            characterPsychology: enhancements.characterPsychology,
                            tensionOptimization: enhancements.tensionOptimization
                        };

                        logger.info(`Pre-generation pipeline completed for chapter ${chapterNumber}`, {
                            processingTime: preparationResult.processingTime,
                            enhancementCount: Object.keys(enhancements).length
                        });
                    }
                } catch (error) {
                    logger.warn(`Pre-generation pipeline failed for chapter ${chapterNumber}`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }

            // 統合コンテキスト生成
            logger.info(`Generating unified context for chapter ${chapterNumber}`);

            const context: EnhancedGenerationContext = await withTimeout(
                this.generateUnifiedContext(chapterNumber, enhancementOptions),
                TIMEOUT_CONFIG.GENERATION.CONTEXT,
                `章${chapterNumber}の統合コンテキスト生成`
            );

            logger.info(`Unified context generation completed for chapter ${chapterNumber}`);

            // LearningJourneySystem統合処理
            let learningJourneyPrompt: string | null = null;
            if (this.learningJourneySystem && this.learningJourneySystem.isInitialized()) {
                try {
                    logger.info(`Generating learning journey prompt for chapter ${chapterNumber}`);
                    learningJourneyPrompt = await withTimeout(
                        this.learningJourneySystem.generateChapterPrompt(chapterNumber),
                        30000,
                        'Learning Journey prompt generation'
                    );

                    await this.enhanceContextWithLearningJourney(context, chapterNumber);
                    logger.info(`Successfully enhanced context with learning journey for chapter ${chapterNumber}`);
                } catch (error) {
                    logger.warn(`Learning journey enhancement failed for chapter ${chapterNumber}`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }

            // プロンプト生成
            logger.info(`Starting prompt generation for chapter ${chapterNumber}`);

            const prompt = await withTimeout(
                this.promptGenerator.generate(context as GenerationContext),
                TIMEOUT_CONFIG.GENERATION.PROMPT,
                'プロンプト生成'
            );

            const enhancedPrompt = this.integrateLearnJourneyPromptIntoPrimaryPrompt(prompt, learningJourneyPrompt);
            logger.info(`Prompt generation completed for chapter ${chapterNumber}`, {
                promptLength: enhancedPrompt.length,
                hasLearningJourneyPrompt: !!learningJourneyPrompt
            });

            // 🆕 プロンプトの保存
            try {
                const savedPromptPath = await promptStorage.savePrompt(enhancedPrompt, context as GenerationContext, {
                    hasLearningJourneyPrompt: !!learningJourneyPrompt,
                    promptLength: enhancedPrompt.length,
                    generationMethod: 'ServiceContainer統合版',
                    memorySystemOptimized: true,
                    enhancementOptionsUsed: Object.keys(enhancementOptions).length,
                    preGenerationPipelineUsed: chapterNumber > 1 && !!this.contentAnalysisManager
                });
                logger.info(`Prompt saved successfully for chapter ${chapterNumber}`, {
                    savedPath: savedPromptPath
                });
            } catch (promptSaveError) {
                logger.warn(`Failed to save prompt for chapter ${chapterNumber}`, {
                    error: promptSaveError instanceof Error ? promptSaveError.message : String(promptSaveError)
                });
                // プロンプト保存失敗は生成処理を停止させない
            }

            // テキスト生成
            logger.info(`Calling Gemini API for chapter ${chapterNumber}`);

            const generatedText = await withTimeout(
                this.geminiClient.generateText(enhancedPrompt, {
                    targetLength: enhancementOptions?.targetLength || params.generation.targetLength,
                    temperature: params.generation.temperature,
                    frequencyPenalty: params.generation.frequencyPenalty,
                    presencePenalty: params.generation.presencePenalty,
                    ...(enhancementOptions?.overrides?.model ? { model: enhancementOptions.overrides.model } : {}),
                    purpose: 'content',
                    overrides: {
                        topK: enhancementOptions?.overrides?.topK || params.generation.topK,
                        topP: enhancementOptions?.overrides?.topP || params.generation.topP,
                        tension: enhancementOptions?.overrides?.tension || context.tension,
                        pacing: enhancementOptions?.overrides?.pacing || context.pacing
                    }
                }),
                TIMEOUT_CONFIG.GENERATION.AI_GENERATION,
                'AI生成'
            );

            logger.info(`Text generation completed for chapter ${chapterNumber}`, {
                textLength: generatedText.length
            });

            // テキストパース
            const { content, metadata } = this.textParser.parseGeneratedContent(generatedText, chapterNumber);

            // 基本章オブジェクトの作成
            const baseChapter: Chapter = {
                id: `chapter-${chapterNumber}`,
                title: metadata.title || `第${chapterNumber}章`,
                chapterNumber: chapterNumber,
                content: content,
                wordCount: this.textParser.countWords(content),
                createdAt: new Date(),
                updatedAt: new Date(),
                summary: metadata.summary || '',
                scenes: metadata.scenes || [],
                analysis: {
                    characterAppearances: [],
                    themeOccurrences: [],
                    foreshadowingElements: [],
                    qualityMetrics: {
                        readability: 0.7,
                        consistency: 0.7,
                        engagement: 0.7,
                        characterDepiction: 0.7,
                        originality: 0.65,
                        overall: 0.7,
                        coherence: 0.7,
                        characterConsistency: 0.7
                    },
                    detectedIssues: []
                },
                metadata: {
                    pov: metadata.pov || '',
                    location: metadata.location || '',
                    timeframe: metadata.timeframe || '',
                    emotionalTone: metadata.emotionalTone || '',
                    keywords: metadata.keywords || [],
                    qualityScore: 0.7,
                    events: metadata.events || [],
                    characters: metadata.characters || [],
                    foreshadowing: metadata.foreshadowing || [],
                    resolvedForeshadowing: [],
                    resolutions: metadata.resolutions || [],
                    correctionHistory: [],
                    updatedAt: new Date(),
                    generationVersion: '5.0-unified-memory-system',
                    generationTime: Date.now() - startTime
                }
            };

            // 統合記憶システムによる一元処理
            logger.info(`Processing chapter through unified memory system for chapter ${chapterNumber}`);

            const memoryProcessingResult = await withTimeout(
                this.memoryManager.processChapter(baseChapter),
                TIMEOUT_CONFIG.GENERATION.MEMORY_PROCESSING,
                '統合記憶システムによる章処理'
            );

            if (!memoryProcessingResult.success) {
                logger.warn(`Memory processing completed with issues for chapter ${chapterNumber}`, {
                    errors: memoryProcessingResult.errors,
                    warnings: memoryProcessingResult.warnings,
                    affectedComponents: memoryProcessingResult.affectedComponents
                });
            } else {
                logger.info(`Memory processing completed successfully for chapter ${chapterNumber}`, {
                    processingTime: memoryProcessingResult.processingTime,
                    affectedComponents: memoryProcessingResult.affectedComponents,
                    operationType: memoryProcessingResult.operationType
                });
            }

            // プロット整合性チェック
            let plotConsistency: { consistent: boolean; issues: any[] };
            try {
                plotConsistency = await plotManager.checkGeneratedContentConsistency(
                    content,
                    chapterNumber
                );
            } catch (error) {
                logger.warn(`Plot consistency check failed for chapter ${chapterNumber}`, {
                    error: error instanceof Error ? error.message : String(error)
                });
                plotConsistency = { consistent: true, issues: [] };
            }

            // 生成後パイプライン実行
            logger.info(`Executing post-generation pipeline for chapter ${chapterNumber}`);

            let finalChapter = baseChapter;

            if (this.contentAnalysisManager) {
                try {
                    const processingResult = await withTimeout(
                        this.contentAnalysisManager.processGeneratedChapter(baseChapter, context as GenerationContext),
                        90000,
                        'Post-generation pipeline'
                    );

                    // 分析結果を統合
                    finalChapter = {
                        ...baseChapter,
                        analysis: {
                            ...(baseChapter.analysis || {}),
                            ...processingResult.comprehensiveAnalysis,
                            qualityMetrics: processingResult.qualityMetrics,
                            plotConsistency: {
                                consistent: plotConsistency.consistent,
                                issueCount: plotConsistency.issues.length,
                                majorIssues: plotConsistency.issues.filter(i => i.severity === "HIGH").length
                            }
                        },
                        metadata: {
                            ...baseChapter.metadata,
                            qualityScore: processingResult.qualityMetrics.overall,
                            analysisMetadata: {
                                analysisTimestamp: new Date().toISOString(),
                                analysisProcessingTime: processingResult.processingTime,
                                analysisServicesUsed: processingResult.comprehensiveAnalysis?.analysisMetadata?.servicesUsed || [],
                                nextChapterSuggestionsCount: processingResult.nextChapterSuggestions.length,
                                memoryProcessingResult: {
                                    success: memoryProcessingResult.success,
                                    processingTime: memoryProcessingResult.processingTime,
                                    affectedComponents: memoryProcessingResult.affectedComponents.length
                                }
                            },
                            qualityEnhancements: {
                                readerExperienceImprovements: (enhancementOptions.improvementSuggestions || []).length,
                                themeEnhancements: (enhancementOptions.themeEnhancements || []).length,
                                styleGuidance: !!enhancementOptions.styleGuidance,
                                unifiedMemorySystemUsed: true,
                                learningJourneyIntegrated: !!learningJourneyPrompt
                            }
                        }
                    };

                    logger.info(`Chapter ${chapterNumber} generation completed with unified memory system (統合版)`, {
                        generationTimeMs: Date.now() - startTime,
                        contentLength: content.length,
                        memoryProcessingSuccess: memoryProcessingResult.success,
                        memoryComponentsAffected: memoryProcessingResult.affectedComponents.length,
                        qualityScore: processingResult.qualityMetrics.overall,
                        systemOptimizationsApplied: memoryProcessingResult.details
                    });

                } catch (analysisError) {
                    logger.warn(`Post-generation pipeline failed for chapter ${chapterNumber}`, {
                        error: analysisError instanceof Error ? analysisError.message : String(analysisError)
                    });

                    finalChapter = {
                        ...baseChapter,
                        metadata: {
                            ...baseChapter.metadata,
                            analysisMetadata: {
                                analysisTimestamp: new Date().toISOString(),
                                analysisProcessingTime: 0,
                                analysisError: analysisError instanceof Error ? analysisError.message : String(analysisError),
                                memoryProcessingResult: {
                                    success: memoryProcessingResult.success,
                                    processingTime: memoryProcessingResult.processingTime,
                                    affectedComponents: memoryProcessingResult.affectedComponents.length
                                }
                            }
                        }
                    };
                }
            }

            // キャラクター状態の更新
            try {
                await this.contextGenerator.processGeneratedChapter(finalChapter);
                logger.info(`Character information processing completed for chapter ${chapterNumber}`);
            } catch (error) {
                logger.warn(`Character information processing failed for chapter ${chapterNumber}`, {
                    error: error instanceof Error ? error.message : String(error)
                });
            }

            return finalChapter;

        } catch (error) {
            logger.error(`Failed to generate chapter ${chapterNumber} with unified memory system`, {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });

            throw new GenerationError(
                `Chapter ${chapterNumber} generation failed: ${error instanceof Error ? error.message : String(error)}`,
                'CHAPTER_GENERATION_FAILED'
            );
        }
    }

    // =========================================================================
    // 統合記憶システム専用メソッド
    // =========================================================================

    /**
     * 統合アクセスAPIを使用した前章コンテンツ取得
     */
    private async getPreviousChapterContentViaUnifiedAccess(chapterNumber: number): Promise<string | undefined> {
        try {
            const searchResult = await this.memoryManager.unifiedSearch(
                `chapter ${chapterNumber} content`,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
            );

            if (searchResult.success && searchResult.totalResults > 0) {
                const chapterResult = searchResult.results.find(result =>
                    result.type === 'chapter' &&
                    result.data.chapterNumber === chapterNumber
                );

                return chapterResult?.data.content;
            }

            // フォールバック: 従来の方法
            const previousChapter = await chapterStorage.getChapter(chapterNumber);
            return previousChapter?.content;

        } catch (error) {
            logger.warn(`Failed to get previous chapter ${chapterNumber} content via unified access`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return undefined;
        }
    }

    /**
     * 統合記憶システムを使用したコンテキスト生成
     */
    private async generateUnifiedContext(
        chapterNumber: number,
        options: ExtendedGenerateChapterRequest
    ): Promise<EnhancedGenerationContext> {
        logger.debug(`Generating unified context for chapter ${chapterNumber}`);

        try {
            // 統一検索APIによる統合コンテキスト取得
            const searchQuery = `chapter context for ${chapterNumber}`;
            const targetLayers = [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM];

            const unifiedSearchResult = await this.memoryManager.unifiedSearch(searchQuery, targetLayers);

            if (!unifiedSearchResult.success || unifiedSearchResult.totalResults === 0) {
                logger.warn(`Unified search failed for chapter ${chapterNumber}, falling back to traditional context generation`);
                const traditionalContext = await this.contextGenerator.generateContext(chapterNumber, options);

                const fallbackContext: EnhancedGenerationContext = {
                    ...traditionalContext,
                    integrationMetadata: {
                        unifiedSearchUsed: false,
                        fallbackToTraditional: true,
                        error: 'Unified search returned no results'
                    }
                };

                return fallbackContext;
            }

            // 従来のコンテキスト生成もバックアップとして実行
            const traditionalContext = await this.contextGenerator.generateContext(chapterNumber, options);

            // 検索結果から各記憶レイヤーのデータを抽出
            const shortTermResults = unifiedSearchResult.results.filter(r => r.source === MemoryLevel.SHORT_TERM);
            const midTermResults = unifiedSearchResult.results.filter(r => r.source === MemoryLevel.MID_TERM);
            const longTermResults = unifiedSearchResult.results.filter(r => r.source === MemoryLevel.LONG_TERM);

            // recentChaptersを適切な型に変換
            const recentChapters = shortTermResults
                .filter(r => r.type === 'chapter' && r.data?.chapterNumber)
                .map(r => ({
                    number: r.data.chapterNumber,
                    title: r.data.title || `第${r.data.chapterNumber}章`,
                    summary: r.data.summary || ''
                }))
                .slice(0, 5);

            // キャラクター状態データの抽出と変換
            const characterStates = new Map<string, any>();
            shortTermResults
                .filter(r => r.type === 'character' && r.data?.characterId)
                .forEach(r => {
                    characterStates.set(r.data.characterId, r.data);
                });

            // キーフレーズの抽出
            const keyPhrases = shortTermResults
                .filter(r => r.data?.keyPhrases)
                .flatMap(r => r.data.keyPhrases)
                .slice(0, 20);

            // 中期記憶データの抽出
            const narrativeProgression = midTermResults.find(r => r.type === 'narrative')?.data;
            const characterEvolution = midTermResults.filter(r => r.type === 'characterEvolution').map(r => r.data);
            const qualityMetrics = midTermResults.find(r => r.type === 'quality')?.data;

            // 長期記憶データの抽出
            const consolidatedSettings = longTermResults.find(r => r.type === 'settings')?.data;
            const knowledgeDatabase = longTermResults.find(r => r.type === 'knowledge')?.data;

            // 統合システムデータの抽出
            const integrationResults = unifiedSearchResult.results.filter(r => r.type === 'integration');
            const resolvedDuplicates = integrationResults.filter(r => r.data?.type === 'duplicate').map(r => r.data);
            const accessOptimizations = integrationResults.filter(r => r.data?.type === 'optimization').map(r => r.data);

            // 統合コンテキストを構築
            const enhancedContext: EnhancedGenerationContext = {
                ...traditionalContext,

                // 統合記憶システムからの拡張データ
                unifiedMemoryData: {
                    searchSuccess: unifiedSearchResult.success,
                    totalResults: unifiedSearchResult.totalResults,
                    processingTime: unifiedSearchResult.processingTime,
                    layersAccessed: [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM],
                    resultsByLayer: {
                        shortTerm: shortTermResults.length,
                        midTerm: midTermResults.length,
                        longTerm: longTermResults.length
                    }
                },

                // 短期記憶からの最新情報
                recentChapters: recentChapters,

                // 統合記憶システムから取得したデータを条件付きで追加
                ...(keyPhrases.length > 0 && { keyPhrases }),
                ...(characterStates.size > 0 && { characterStates }),
                ...(narrativeProgression && { narrativeProgression }),
                ...(characterEvolution.length > 0 && { characterEvolution }),
                ...(qualityMetrics && { qualityMetrics }),
                ...(consolidatedSettings && { consolidatedSettings }),
                ...(knowledgeDatabase && { knowledgeDatabase }),
                ...(resolvedDuplicates.length > 0 && { resolvedDuplicates }),
                ...(accessOptimizations.length > 0 && { accessOptimizations }),

                // 統合システムメタデータ
                integrationMetadata: {
                    unifiedSearchUsed: true,
                    fallbackToTraditional: false,
                    keyPhrasesCount: keyPhrases.length,
                    characterStatesCount: characterStates.size
                }
            };

            logger.info(`Unified context generated successfully for chapter ${chapterNumber}`, {
                totalResults: unifiedSearchResult.totalResults,
                processingTime: unifiedSearchResult.processingTime,
                recentChaptersCount: recentChapters.length,
                keyPhrasesCount: keyPhrases.length,
                characterStatesCount: characterStates.size
            });

            return enhancedContext;

        } catch (error) {
            logger.error(`Unified context generation failed for chapter ${chapterNumber}, falling back to traditional method`, {
                error: error instanceof Error ? error.message : String(error)
            });

            const fallbackContext = await this.contextGenerator.generateContext(chapterNumber, options);

            const enhancedFallbackContext: EnhancedGenerationContext = {
                ...fallbackContext,
                integrationMetadata: {
                    unifiedSearchUsed: false,
                    fallbackToTraditional: true,
                    error: error instanceof Error ? error.message : String(error)
                }
            };

            return enhancedFallbackContext;
        }
    }

    // =========================================================================
    // LearningJourneySystem統合メソッド
    // =========================================================================

    private async enhanceContextWithLearningJourney(
        context: EnhancedGenerationContext,
        chapterNumber: number
    ): Promise<void> {
        if (!this.learningJourneySystem || !this.learningJourneySystem.isInitialized()) {
            return;
        }

        try {
            const mainConcept = "ISSUE DRIVEN";
            const learningStage = await this.learningJourneySystem.concept.determineLearningStage(
                mainConcept,
                chapterNumber
            );

            const embodimentPlan = await this.learningJourneySystem.concept.getEmbodimentPlan(
                mainConcept,
                chapterNumber
            );

            const emotionalArc = await this.learningJourneySystem.emotion.designEmotionalArc(
                mainConcept,
                learningStage,
                chapterNumber
            );

            const catharticExperience = await this.learningJourneySystem.emotion.designCatharticExperience(
                mainConcept,
                learningStage,
                chapterNumber
            );

            const sceneRecommendations = await this.learningJourneySystem.story.generateSceneRecommendations(
                mainConcept,
                learningStage,
                chapterNumber
            );

            context.learningJourney = {
                mainConcept,
                learningStage,
                embodimentPlan,
                emotionalArc,
                catharticExperience: catharticExperience === null ? undefined : catharticExperience,
                sceneRecommendations
            };

            logger.info(`Enhanced context with learning journey data for chapter ${chapterNumber}`, {
                concept: mainConcept,
                stage: learningStage
            });
        } catch (error) {
            logger.warn(`Failed to enhance context with learning journey data for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    private integrateLearnJourneyPromptIntoPrimaryPrompt(
        primaryPrompt: string,
        learningJourneyPrompt: string | null
    ): string {
        if (!learningJourneyPrompt) {
            return primaryPrompt;
        }

        try {
            const importantSections = this.extractImportantSectionsFromLearningJourneyPrompt(learningJourneyPrompt);

            return `${primaryPrompt}

## 「魂のこもった学びの物語」要素の追加
以下の要素を物語に組み込み、ビジネス概念の学びと感情的な旅を融合させてください。

${importantSections}

物語を通して、読者が概念を体験的に学べるよう工夫してください。説明ではなく、体験を通じた学びを提供する物語を目指してください。`;
        } catch (error) {
            logger.warn('Failed to integrate learning journey prompt, using original prompt', {
                error: error instanceof Error ? error.message : String(error)
            });
            return primaryPrompt;
        }
    }

    private extractImportantSectionsFromLearningJourneyPrompt(prompt: string): string {
        const importantSections = [
            "重要な執筆ガイドライン",
            "変容と成長",
            "体験的学習",
            "感情の旅",
            "共感ポイント",
            "カタルシス"
        ];

        let extractedGuidance = "";

        for (const section of importantSections) {
            const regex = new RegExp(`##?\\s*${section}[\\s\\S]*?(?=##|$)`, "i");
            const match = prompt.match(regex);
            if (match) {
                extractedGuidance += match[0] + "\n\n";
            }
        }

        return extractedGuidance || "学びの物語の要素を取り入れ、キャラクターの内面の変化と概念理解を結びつけてください。";
    }

    // =========================================================================
    // ユーティリティメソッド
    // =========================================================================

    private async checkInitializationForFirstChapter(): Promise<{ initialized: boolean, reason?: string }> {
        try {
            const systemStatus = await this.memoryManager.getSystemStatus();
            if (!systemStatus.initialized) {
                return {
                    initialized: false,
                    reason: '統合記憶システムが正しく初期化されていません'
                };
            }

            const diagnostics = await this.memoryManager.performSystemDiagnostics();
            if (diagnostics.systemHealth === 'CRITICAL') {
                return {
                    initialized: false,
                    reason: `記憶システムに重大な問題があります: ${diagnostics.issues.join(', ')}`
                };
            }

            const plotCheckResult = await this.checkPlotFileExistsDirect();
            if (!plotCheckResult) {
                return {
                    initialized: false,
                    reason: 'プロットファイルが見つかりません'
                };
            }

            // const characterCheckResult = await this.checkMainCharactersExist();
            // if (!characterCheckResult.exist) {
            //     return {
            //         initialized: false,
            //         reason: `メインキャラクターが設定されていません: ${characterCheckResult.message}`
            //     };
            // }

            const params = parameterManager.getParameters();
            if (!params || !params.generation) {
                return {
                    initialized: false,
                    reason: 'システムパラメータが正しく初期化されていません'
                };
            }

            const apiKeyValid = await this.geminiClient.validateApiKey();
            if (!apiKeyValid) {
                return {
                    initialized: false,
                    reason: 'GeminiのAPIキーが無効です'
                };
            }

            return { initialized: true };
        } catch (error) {
            return {
                initialized: false,
                reason: `初期化チェック中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    private async checkPlotFileExistsDirect(): Promise<boolean> {
        try {
            const abstractPlotExists = await storageProvider.fileExists('config/story-plot/abstract-plot.yaml');
            const concretePlotExists = await storageProvider.fileExists('config/story-plot/concrete-plot.yaml');
            const mediumPlotExists = await storageProvider.fileExists('config/story-plot/medium-plot.yaml');

            return abstractPlotExists || concretePlotExists || mediumPlotExists;
        } catch (error) {
            logger.error('プロットファイル確認エラー', {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    private async checkMainCharactersExist(): Promise<{ exist: boolean, message: string }> {
        try {
            const mainCharacters = await characterManager.getCharactersByType('MAIN', this.memoryManager);

            if (!mainCharacters || mainCharacters.length === 0) {
                return { exist: false, message: 'メインキャラクターが定義されていません' };
            }

            return { exist: true, message: `${mainCharacters.length}人のメインキャラクターが存在します` };
        } catch (error) {
            return {
                exist: false,
                message: `メインキャラクターの確認中にエラー: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    // =========================================================================
    // パラメータ管理メソッド（既存機能保持）
    // =========================================================================

    updateParameter(path: string, value: any): void {
        parameterManager.updateParameter(path, value);
    }

    applyPreset(presetName: string): boolean {
        return parameterManager.applyPreset(presetName);
    }

    /**
     * 統合記憶システムの状態取得
     */
    async getMemorySystemStatus() {
        return await this.memoryManager.getSystemStatus();
    }

    /**
     * 統合記憶システムの診断実行
     */
    async performMemorySystemDiagnostics() {
        return await this.memoryManager.performSystemDiagnostics();
    }

    /**
     * 統合記憶システムの最適化実行
     */
    async optimizeMemorySystem() {
        return await this.memoryManager.optimizeSystem();
    }
}