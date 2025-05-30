// src/lib/generation/engine/chapter-generator.ts（完成版）
import { GeminiClient } from '../gemini-client';
import { ContextGenerator } from '../context-generator';
import { PromptGenerator } from '../prompt-generator';
import { TextParser } from './text-parser';
import { WorldKnowledge } from '@/lib/memory/world-knowledge';
import { WorldSettingsManager } from '@/lib/plot/world-settings-manager';
import { GenerationContext, GenerateChapterRequest, ThemeEnhancement, ForeshadowingElement, StyleGuidance } from '@/types/generation';
import { Chapter } from '@/types/chapters';
import { logger } from '@/lib/utils/logger';
import { GenerationError } from '@/lib/utils/error-handler';
import { parameterManager } from '@/lib/parameters';
import { plotManager } from '@/lib/plot';
import { characterManager } from '@/lib/characters/manager';
import { memoryManager } from '@/lib/memory/manager';
import { chapterStorage, storageProvider } from '@/lib/storage';
import { JsonParser } from '@/lib/utils/json-parser';
import { apiThrottler } from '@/lib/utils/api-throttle';

// === analysisモジュール統合 ===
import { ContentAnalysisManager } from '@/lib/analysis/content-analysis-manager';
import { PreGenerationPipeline } from '@/lib/analysis/pipelines/pre-generation-pipeline';
import { PostGenerationPipeline } from '@/lib/analysis/pipelines/post-generation-pipeline';
import { AnalysisCoordinator } from '@/lib/analysis/coordinators/analysis-coordinator';
import { OptimizationCoordinator } from '@/lib/analysis/coordinators/optimization-coordinator';
import { GeminiAdapter } from '@/lib/analysis/adapters/gemini-adapter';

// 「魂のこもった学びの物語」システムのインポート
import LearningJourneySystem from '@/lib/learning-journey';
import { LearningStage } from '@/lib/learning-journey/concept-learning-manager';

import { withTimeout } from '@/lib/utils/promise-utils';

import { ljsDiagnostics, LJSCheck } from '@/lib/utils/debug/learning-journey-diagnostics';

// === 🔥 修正: タイムアウト設定の定数化 ===
const TIMEOUT_CONFIG = {
    INITIALIZATION: {
        TOTAL: 180000,          // 🔥 修正: 120秒 → 180秒
        HEALTH_CHECK: 20000,    // 🔥 修正: 15秒 → 20秒
        MEMORY_INIT: 45000,     // 🔥 修正: 30秒 → 45秒
        WORLD_INIT: 25000,      // 🔥 修正: 20秒 → 25秒
        LEARNING_INIT: 35000,   // 🔥 修正: 30秒 → 35秒
        FIRST_CHAPTER_CHECK: 30000
    },
    GENERATION: {
        CONTEXT: 240000,        // 🔥 修正: 180秒 → 240秒（4分）
        PROMPT: 60000,          // プロンプト生成：60秒
        AI_GENERATION: 180000,  // AI生成：180秒（3分）
        TOTAL_CHAPTER: 600000   // 🔥 修正: 全体10分に延長
    }
};

// === 拡張型定義 ===
interface ExtendedGenerateChapterRequest extends GenerateChapterRequest {
    improvementSuggestions?: string[];
    themeEnhancements?: ThemeEnhancement[];
    styleGuidance?: StyleGuidance;
    alternativeExpressions?: any;
    literaryInspirations?: any;
    characterPsychology?: any;
    tensionOptimization?: any;
}

/**
 * @class ChapterGenerator
 * @description 小説のチャプター生成を担当するクラス（完成版）
 * 
 * @architecture
 * - 生成前：ContentAnalysisManager.prepareChapterGeneration()で拡張データ取得
 * - 生成後：ContentAnalysisManager.processGeneratedChapter()で分析・次章準備
 * - 個別API依存を排除し、パイプライン設計に完全準拠
 */
export class ChapterGenerator {
    private geminiClient: GeminiClient;
    private contextGenerator: ContextGenerator;
    private promptGenerator: PromptGenerator;
    private textParser: TextParser;

    // 依存コンポーネント
    private worldKnowledge?: WorldKnowledge;
    private worldSettingsManager?: WorldSettingsManager;

    // === analysisモジュール統合 ===
    private contentAnalysisManager: ContentAnalysisManager;

    // 「魂のこもった学びの物語」システム
    private learningJourneySystem?: LearningJourneySystem;

    // 🔥 修正: 記憶更新競合回避のためのロック管理
    private memoryUpdateLocks = new Map<number, Promise<void>>();

    // 初期化状態を追跡するためのフラグ
    private initialized: boolean = false;
    private initializationPromise: Promise<void> | null = null;

    /**
     * コンストラクタ（完成版）
     */
    constructor(
        geminiClient: GeminiClient,
        promptGenerator: PromptGenerator,
        contentAnalysisManager?: ContentAnalysisManager
    ) {
        this.geminiClient = geminiClient;
        this.contextGenerator = new ContextGenerator();
        this.promptGenerator = promptGenerator;
        this.textParser = new TextParser();

        // === analysisモジュール統合 ===
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
                const optimizationCoordinator = new OptimizationCoordinator(
                    geminiAdapter,
                    null // styleAnalysisService - 実際の実装では適切なインスタンスを渡す
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
            } catch (error) {
                logger.error('Failed to initialize ContentAnalysisManager, using fallback', {
                    error: error instanceof Error ? error.message : String(error)
                });
                // フォールバック：基本的なContentAnalysisManagerを作成
                this.contentAnalysisManager = null as any; // 一時的な対応
            }
        }

        // === ContextGenerator への依存性注入 ===
        if (this.contentAnalysisManager) {
            this.contextGenerator.setContentAnalysisManager(this.contentAnalysisManager);
        }

        // WorldKnowledgeインスタンスの生成
        try {
            this.worldKnowledge = new WorldKnowledge();
            logger.info('WorldKnowledge initialized in ChapterGenerator');
        } catch (error) {
            logger.warn('Failed to initialize WorldKnowledge', {
                error: error instanceof Error ? error.message : String(error)
            });
        }

        // WorldSettingsManagerインスタンスの生成
        try {
            this.worldSettingsManager = new WorldSettingsManager();
            logger.info('WorldSettingsManager initialized in ChapterGenerator');
        } catch (error) {
            logger.warn('Failed to initialize WorldSettingsManager', {
                error: error instanceof Error ? error.message : String(error)
            });
        }

        // 「魂のこもった学びの物語」システムの初期化
        try {
            this.learningJourneySystem = new LearningJourneySystem(
                geminiClient,
                memoryManager,
                characterManager
            );
            logger.info('LearningJourneySystem initialized in ChapterGenerator');
        } catch (error) {
            logger.warn('Failed to initialize LearningJourneySystem', {
                error: error instanceof Error ? error.message : String(error)
            });
        }

        logger.info('ChapterGenerator initialized with analysisモジュール integration (完成版)');
    }

    /**
     * 非同期初期化メソッド
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        if (this.initializationPromise) {
            return withTimeout(
                this.initializationPromise,
                TIMEOUT_CONFIG.INITIALIZATION.TOTAL + 30000, // 待機用に余裕を追加
                'ChapterGenerator初期化の待機'
            ).catch(error => {
                logger.error(`初期化の待機中にタイムアウトが発生: ${error.message}`);
                this.initializationPromise = null;
                throw new Error('ChapterGeneratorの初期化がタイムアウトしました。再試行してください。');
            });
        }

        this.initializationPromise = this._initialize();
        return withTimeout(
            this.initializationPromise,
            TIMEOUT_CONFIG.INITIALIZATION.TOTAL,
            'ChapterGeneratorの初期化'
        ).catch(error => {
            logger.error(`初期化中にタイムアウトが発生: ${error.message}`);
            this.initializationPromise = null;
            throw new Error('ChapterGeneratorの初期化がタイムアウトしました。再試行してください。');
        });
    }

    /**
     * 内部初期化実装
     */
    private async _initialize(): Promise<void> {
        try {
            logger.info('Starting ChapterGenerator initialization (修正版)', {
                timeouts: TIMEOUT_CONFIG.INITIALIZATION
            });

            // === ContentAnalysisManager の健全性チェック ===
            if (this.contentAnalysisManager) {
                try {
                    const healthCheck = await withTimeout(
                        this.contentAnalysisManager.healthCheck(),
                        TIMEOUT_CONFIG.INITIALIZATION.HEALTH_CHECK,
                        'ContentAnalysisManagerの健全性チェック'
                    );

                    if (healthCheck.status === 'unhealthy') {
                        logger.warn('ContentAnalysisManager is unhealthy but will continue', healthCheck.details);
                    } else {
                        logger.info('ContentAnalysisManager health check completed', {
                            status: healthCheck.status,
                            services: Object.keys(healthCheck.details)
                        });
                    }
                } catch (error) {
                    logger.warn('ContentAnalysisManager health check failed, but will continue', {
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            } else {
                logger.warn('ContentAnalysisManager is not available');
            }

            // memoryManager の初期化
            await withTimeout(
                memoryManager.initialize(),
                TIMEOUT_CONFIG.INITIALIZATION.MEMORY_INIT,
                'メモリマネージャーの初期化'
            ).catch(error => {
                logger.error(`memoryManager initialization failed: ${error.message}`);
                throw error;
            });
            logger.info('memoryManager initialization completed');

            // 必須でないコンポーネントは並列初期化（個別タイムアウト）
            const initPromises: Promise<void>[] = [];

            if (this.worldKnowledge) {
                initPromises.push(
                    withTimeout(
                        this.worldKnowledge.initialize(),
                        TIMEOUT_CONFIG.INITIALIZATION.WORLD_INIT,
                        'WorldKnowledgeの初期化'
                    ).catch(error => {
                        logger.warn(`worldKnowledge initialization failed: ${error.message}`);
                    })
                );
            }

            if (this.worldSettingsManager) {
                initPromises.push(
                    withTimeout(
                        this.worldSettingsManager.initialize(),
                        TIMEOUT_CONFIG.INITIALIZATION.WORLD_INIT,
                        'WorldSettingsManagerの初期化'
                    ).catch(error => {
                        logger.warn(`worldSettingsManager initialization failed: ${error.message}`);
                    })
                );
            }

            await Promise.allSettled(initPromises);

            // LearningJourneySystemの初期化
            if (this.learningJourneySystem) {
                await withTimeout(
                    this.learningJourneySystem.initialize('default-story'),
                    TIMEOUT_CONFIG.INITIALIZATION.LEARNING_INIT,
                    'LearningJourneySystemの初期化'
                ).catch(error => {
                    logger.warn(`learningJourneySystem initialization failed: ${error.message}`);
                });
            }

            this.initialized = true;
            logger.info('ChapterGenerator initialization completed (修正版)', {
                totalTime: Date.now()
            });
        } catch (error) {
            logger.error('Failed to initialize ChapterGenerator', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        } finally {
            this.initializationPromise = null;
        }
    }

    /**
     * 章を生成する（完成版 + 診断コード）
     */
    async generate(
        chapterNumber: number,
        options?: ExtendedGenerateChapterRequest
    ): Promise<Chapter> {

        // 🔬 診断セッション開始
        const diagnosticSessionId = ljsDiagnostics.startDiagnosticSession(chapterNumber);

        // 🔬 診断チェックポイント1: LJS注入確認
        if (!this.learningJourneySystem) {
            LJSCheck.failure('CONSTRUCTION', 'LJS_INJECTION', 'LearningJourneySystem not injected');
            LJSCheck.rootCause(
                'LearningJourneySystemがChapterGeneratorに注入されていない',
                'ChapterGeneratorのコンストラクタを確認してください'
            );
        } else {
            LJSCheck.success('CONSTRUCTION', 'LJS_INJECTION', {
                type: typeof this.learningJourneySystem,
                constructorName: this.learningJourneySystem.constructor?.name
            });

            // 🔬 診断チェックポイント2: LJS初期化確認
            const isInitialized = this.learningJourneySystem.isInitialized();
            if (!isInitialized) {
                LJSCheck.failure('INITIALIZATION', 'LJS_INIT_STATUS', 'LearningJourneySystem not initialized');
                LJSCheck.rootCause(
                    'LearningJourneySystemの初期化が失敗している',
                    'initialize()メソッドの実行とMemoryManagerの状態を確認してください'
                );
            } else {
                LJSCheck.success('INITIALIZATION', 'LJS_INIT_STATUS');
            }
        }

        if (!this.initialized) {
            logger.info('Ensuring initialization before chapter generation');
            await withTimeout(
                this.initialize(),
                TIMEOUT_CONFIG.INITIALIZATION.TOTAL,
                '章生成前の初期化'
            ).catch(error => {
                logger.error(`章生成前の初期化でタイムアウト: ${error.message}`);
                throw new GenerationError(
                    `初期化がタイムアウトしました: ${error.message}`,
                    'INITIALIZATION_TIMEOUT'
                );
            });
        }

        const startTime = Date.now();

        logger.info(`Starting chapter ${chapterNumber} generation (修正版)`, {
            timeouts: TIMEOUT_CONFIG.GENERATION,
            options,
            targetLength: options?.targetLength,
            forcedGeneration: options?.forcedGeneration,
            overrides: options?.overrides
        });

        try {
            const params = parameterManager.getParameters();

            // ⭐ 新規追加: 章生成前にジャンル同期を確認
            try {
                await memoryManager.ensureGenreSynchronization();
                logger.info(`Genre synchronization confirmed for chapter ${chapterNumber}`);
            } catch (genreError) {
                logger.warn(`Genre synchronization failed for chapter ${chapterNumber}, but continuing`, {
                    error: genreError instanceof Error ? genreError.message : String(genreError)
                });
            }

            // 第1章の生成前には初期化チェックを行う
            if (chapterNumber === 1) {
                const initCheck = await withTimeout(
                    this.checkInitializationForFirstChapter(),
                    TIMEOUT_CONFIG.INITIALIZATION.FIRST_CHAPTER_CHECK,
                    '第1章の初期化チェック'
                ).catch(error => {
                    logger.error(`初期化チェックでタイムアウト: ${error.message}`);
                    return { initialized: false, reason: `初期化チェックがタイムアウトしました: ${error.message}` };
                });

                if (!initCheck.initialized) {
                    logger.error(`First chapter generation failed due to initialization issues: ${initCheck.reason}`);
                    throw new GenerationError(
                        `First chapter generation failed: ${initCheck.reason}`,
                        'INITIALIZATION_ERROR'
                    );
                }
            }

            // === 生成前パイプライン実行 ===
            let enhancementOptions: ExtendedGenerateChapterRequest = { ...options };

            if (chapterNumber > 1 && this.contentAnalysisManager) {
                try {
                    logger.info(`Executing pre-generation pipeline for chapter ${chapterNumber}`);

                    // 前章のコンテンツを取得
                    const previousChapterContent = await this.getPreviousChapterContent(chapterNumber - 1);

                    // PreGenerationPipeline実行
                    const preparationResult = await withTimeout(
                        this.contentAnalysisManager.prepareChapterGeneration(
                            chapterNumber,
                            previousChapterContent
                        ),
                        60000, // 🔥 修正: Pre-generationに60秒制限
                        'Pre-generation pipeline'
                    );

                    if (preparationResult.success) {
                        const enhancements = preparationResult.enhancements;

                        // 拡張データをoptionsに統合
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
                            suggestionCount: enhancements.improvementSuggestions.length,
                            themeEnhancementCount: enhancements.themeEnhancements.length,
                            hasStyleGuidance: !!enhancements.styleGuidance,
                            hasLiteraryInspirations: !!enhancements.literaryInspirations,
                            hasCharacterPsychology: !!enhancements.characterPsychology,
                            hasTensionOptimization: !!enhancements.tensionOptimization
                        });
                    } else {
                        logger.warn(`Pre-generation pipeline failed: ${preparationResult.error}`);
                    }
                } catch (error) {
                    logger.warn(`Failed to execute pre-generation pipeline for chapter ${chapterNumber}`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }

            logger.info(`Starting context generation for chapter ${chapterNumber}`);

            // 🔥 修正: コンテキスト生成（タイムアウト延長）
            const context = await withTimeout(
                this.contextGenerator.generateContext(chapterNumber, enhancementOptions)
                    .catch(async (error) => {
                        logger.error(`Context generation failed for chapter ${chapterNumber}, attempting recovery`, {
                            error: error instanceof Error ? error.message : String(error)
                        });
                        const fallback = await this.attemptContextRecovery(chapterNumber, error);
                        if (!fallback) {
                            throw new GenerationError(
                                `Chapter ${chapterNumber} context generation failed: ${error instanceof Error ? error.message : String(error)}`,
                                'CONTEXT_GENERATION_FAILED'
                            );
                        }
                        return fallback;
                    }),
                TIMEOUT_CONFIG.GENERATION.CONTEXT, // 🔥 修正: 240秒に延長
                `章${chapterNumber}のコンテキスト生成`
            ).catch(error => {
                logger.error(`コンテキスト生成でタイムアウト: ${error.message}`);
                throw new GenerationError(
                    `コンテキスト生成がタイムアウトしました: ${error.message}`,
                    'CONTEXT_GENERATION_TIMEOUT'
                );
            });

            logger.info(`Context generation completed for chapter ${chapterNumber}`);

            // LearningJourneySystemが初期化されている場合のみ実行
            let learningJourneyPrompt: string | null = null;
            if (this.learningJourneySystem && this.learningJourneySystem.isInitialized()) {
                try {
                    logger.info(`Generating learning journey prompt for chapter ${chapterNumber}`);
                    learningJourneyPrompt = await withTimeout(
                        this.learningJourneySystem.generateChapterPrompt(chapterNumber),
                        30000, // 30秒制限
                        'Learning Journey prompt generation'
                    );

                    await this.enhanceContextWithLearningJourney(context, chapterNumber);
                    logger.info(`Successfully generated learning journey prompt for chapter ${chapterNumber}`);
                } catch (error) {
                    logger.warn(`Failed to generate learning journey prompt for chapter ${chapterNumber}`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }

            logger.info(`Starting prompt generation for chapter ${chapterNumber}`);

            // 🔥 修正: プロンプト生成（タイムアウト設定）
            const prompt = await withTimeout(
                this.promptGenerator.generate(context)
                    .catch(async (error) => {
                        logger.error(`Prompt generation failed for chapter ${chapterNumber}, attempting recovery`, {
                            error: error instanceof Error ? error.message : String(error)
                        });
                        const fallbackPrompt = await this.attemptPromptRecovery(chapterNumber, context, error);
                        if (!fallbackPrompt) {
                            throw new GenerationError(
                                `Chapter ${chapterNumber} prompt generation failed: ${error instanceof Error ? error.message : String(error)}`,
                                'PROMPT_GENERATION_FAILED'
                            );
                        }
                        return fallbackPrompt;
                    }),
                TIMEOUT_CONFIG.GENERATION.PROMPT,
                'プロンプト生成'
            );

            // 学習旅程プロンプトを既存プロンプトに統合
            const enhancedPrompt = this.integrateLearnJourneyPromptIntoPrimaryPrompt(prompt, learningJourneyPrompt);

            logger.info(`Prompt generation completed for chapter ${chapterNumber}`, {
                promptLength: enhancedPrompt.length,
                hasLearningJourneyPrompt: !!learningJourneyPrompt
            });

            // プロンプト保存
            try {
                await this.savePrompt(chapterNumber, enhancedPrompt);
            } catch (promptSaveError) {
                logger.warn(`Failed to save prompt for chapter ${chapterNumber} but generation will continue`, {
                    error: promptSaveError instanceof Error ? promptSaveError.message : String(promptSaveError)
                });
            }

            logger.info(`Calling Gemini API for chapter ${chapterNumber}`);

            // 🔥 修正: テキスト生成（タイムアウト設定）
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
                }).catch(async (error) => {
                    logger.error(`Text generation failed for chapter ${chapterNumber}, attempting recovery`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                    const fallbackText = await this.attemptTextGenerationRecovery(chapterNumber, enhancedPrompt, error);
                    if (!fallbackText) {
                        throw new GenerationError(
                            `Chapter ${chapterNumber} text generation failed: ${error instanceof Error ? error.message : String(error)}`,
                            'TEXT_GENERATION_FAILED'
                        );
                    }
                    return fallbackText;
                }),
                TIMEOUT_CONFIG.GENERATION.AI_GENERATION,
                'AI生成'
            );

            logger.info(`Text generation completed for chapter ${chapterNumber}`, {
                textLength: generatedText.length,
                generationTime: Date.now() - startTime
            });

            // 生成テキストのパース
            const { content, metadata } = this.textParser.parseGeneratedContent(generatedText, chapterNumber);

            // 🔥 修正: 記憶更新の競合回避（直列化）
            let learningJourneyAnalysis = null;
            await this.processChapterMemoriesSerialized(
                chapterNumber,
                content,
                metadata.title || `第${chapterNumber}章`,
                context
            );

            // プロット整合性チェック
            const plotConsistency = await plotManager.checkGeneratedContentConsistency(
                content,
                chapterNumber
            ).catch(error => {
                logger.warn(`Plot consistency check failed for chapter ${chapterNumber} but generation will continue`, {
                    error: error instanceof Error ? error.message : String(error)
                });
                return { consistent: true, issues: [] };
            });

            // チャプターオブジェクトの基本構築
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
                    detectedIssues: [],
                    plotConsistency: {
                        consistent: plotConsistency.consistent,
                        issueCount: plotConsistency.issues.length,
                        majorIssues: plotConsistency.issues.filter(i => i.severity === "HIGH").length
                    },
                    learningJourney: learningJourneyAnalysis
                },
                metadata: {
                    pov: metadata.pov || '',
                    location: metadata.location || '',
                    timeframe: metadata.timeframe || '',
                    emotionalTone: metadata.emotionalTone || '',
                    keywords: metadata.keywords || [],
                    qualityScore: 0.7, // 暫定値、後で更新
                    events: metadata.events || [],
                    characters: metadata.characters || [],
                    foreshadowing: metadata.foreshadowing || [],
                    resolvedForeshadowing: [],
                    resolutions: metadata.resolutions || [],
                    correctionHistory: [],
                    updatedAt: new Date(),
                    generationVersion: '4.0-analysis-pipeline-integrated',
                    generationTime: Date.now() - startTime,
                    plotConsistencyResult: plotConsistency.consistent ? 'CONSISTENT' : 'ISSUES_DETECTED',
                    qualityEnhancements: {
                        readerExperienceImprovements: (enhancementOptions.improvementSuggestions || []).length,
                        themeEnhancements: (enhancementOptions.themeEnhancements || []).length,
                        styleGuidance: !!enhancementOptions.styleGuidance,
                        expressionDiversification: !!enhancementOptions.alternativeExpressions,
                        tensionOptimization: !!enhancementOptions.tensionOptimization,
                        literaryInspiration: !!enhancementOptions.literaryInspirations,
                        characterPsychology: !!enhancementOptions.characterPsychology,
                        learningJourney: !!learningJourneyPrompt
                    },
                    persistentEvents: [],
                    characterGrowth: [],
                    learningJourney: context.learningJourney ? {
                        mainConcept: context.learningJourney.mainConcept,
                        learningStage: context.learningJourney.learningStage,
                        emotionalArc: context.learningJourney.emotionalArc ? {
                            recommendedTone: context.learningJourney.emotionalArc.recommendedTone,
                            reason: context.learningJourney.emotionalArc.reason
                        } : undefined,
                        catharticExperience: context.learningJourney.catharticExperience ? {
                            type: context.learningJourney.catharticExperience.type,
                            trigger: context.learningJourney.catharticExperience.trigger,
                            peakMoment: context.learningJourney.catharticExperience.peakMoment
                        } : undefined
                    } : undefined
                }
            };

            // === 生成後パイプライン実行 ===
            logger.info(`Executing post-generation pipeline for chapter ${chapterNumber}`);

            if (this.contentAnalysisManager) {
                try {
                    const processingResult = await withTimeout(
                        this.contentAnalysisManager.processGeneratedChapter(baseChapter, context),
                        120000, // 🔥 修正: Post-generationに90秒制限
                        'Post-generation pipeline'
                    );

                    // 分析結果をchapterに統合
                    const enhancedChapter: Chapter = {
                        ...baseChapter,
                        analysis: {
                            ...(baseChapter.analysis || {}),
                            ...processingResult.comprehensiveAnalysis,
                            qualityMetrics: processingResult.qualityMetrics,
                            plotConsistency: baseChapter.analysis?.plotConsistency || {
                                consistent: plotConsistency.consistent,
                                issueCount: plotConsistency.issues.length,
                                majorIssues: plotConsistency.issues.filter(i => i.severity === "HIGH").length
                            },
                            learningJourney: baseChapter.analysis?.learningJourney || learningJourneyAnalysis
                        },
                        metadata: {
                            ...baseChapter.metadata,
                            qualityScore: processingResult.qualityMetrics.overall,
                            qualityEnhancements: {
                                ...baseChapter.metadata.qualityEnhancements,
                                nextChapterPreparationCompleted: true
                            },
                            analysisMetadata: {
                                analysisTimestamp: new Date().toISOString(),
                                analysisProcessingTime: processingResult.processingTime,
                                analysisServicesUsed: processingResult.comprehensiveAnalysis?.analysisMetadata?.servicesUsed || [],
                                nextChapterSuggestionsCount: processingResult.nextChapterSuggestions.length
                            }
                        }
                    };

                    // 🔧 新規追加: 章生成完了後にイベント検出・保存を実行
                    logger.info(`Processing events and saving memories for chapter ${chapterNumber}`);

                    try {
                        // 1. EventMemoryでのイベント検出・保存
                        await memoryManager.detectAndStoreChapterEvents(enhancedChapter, {
                            genre: context.genre || 'classic'
                        });

                        // 2. NarrativeMemoryの明示的保存確認（既存だが念のため）
                        await memoryManager.updateNarrativeState(enhancedChapter);

                        // 3. 統合保存の実行
                        await memoryManager.saveAllMemories();

                        logger.info(`Successfully processed and saved all memories for chapter ${chapterNumber}`);

                    } catch (memoryError) {
                        logger.error(`Memory processing failed for chapter ${chapterNumber}, but chapter generation will continue`, {
                            chapterNumber,
                            error: memoryError instanceof Error ? memoryError.message : String(memoryError)
                        });

                        // メモリ処理の失敗は章生成を止めないが、警告を残す
                        enhancedChapter.metadata = {
                            ...enhancedChapter.metadata,
                            memoryProcessingWarning: `メモリ処理に部分的な問題が発生: ${memoryError instanceof Error ? memoryError.message : String(memoryError)}`
                        };
                    }

                    logger.info(`Chapter ${chapterNumber} generation completed with comprehensive analysis (完成版)`, {
                        generationTimeMs: Date.now() - startTime,
                        contentLength: content.length,
                        sceneCount: (metadata.scenes || []).length,
                        plotConsistent: plotConsistency.consistent,
                        usedModel: enhancementOptions?.overrides?.model || params.generation.model,
                        analysisProcessingTime: processingResult.processingTime,
                        qualityScore: processingResult.qualityMetrics.overall,
                        nextChapterSuggestionCount: processingResult.nextChapterSuggestions.length,
                        learningJourneyEnabled: !!learningJourneyPrompt,
                        learningStage: context.learningJourney?.learningStage,
                        preGenerationEnhancementsUsed: {
                            improvementSuggestions: (enhancementOptions.improvementSuggestions || []).length,
                            themeEnhancements: (enhancementOptions.themeEnhancements || []).length,
                            styleGuidance: !!enhancementOptions.styleGuidance,
                            literaryInspirations: !!enhancementOptions.literaryInspirations,
                            characterPsychology: !!enhancementOptions.characterPsychology,
                            tensionOptimization: !!enhancementOptions.tensionOptimization
                        },
                        memoryUpdateStrategy: 'serialized' // 🔥 修正: 記憶更新方式の記録
                    });

                    // キャラクター状態の更新（ContextGenerator経由）
                    try {
                        await this.contextGenerator.processGeneratedChapter(enhancedChapter);
                        logger.info(`Successfully processed character information for chapter ${chapterNumber}`);
                    } catch (error) {
                        logger.warn(`Character information processing failed but chapter generation will continue`, {
                            chapterNumber,
                            error: error instanceof Error ? error.message : String(error)
                        });
                    }

                    // 永続的イベントの登録
                    if (processingResult.comprehensiveAnalysis?.persistentEvents &&
                        Array.isArray(processingResult.comprehensiveAnalysis.persistentEvents) &&
                        processingResult.comprehensiveAnalysis.persistentEvents.length > 0) {
                        try {
                            for (const event of processingResult.comprehensiveAnalysis.persistentEvents) {
                                await memoryManager.recordPersistentEvent(event);
                            }
                            logger.info(`Successfully recorded ${processingResult.comprehensiveAnalysis.persistentEvents.length} persistent events for chapter ${chapterNumber}`);
                        } catch (eventError) {
                            logger.warn(`Persistent event recording failed but chapter generation will continue`, {
                                chapterNumber,
                                error: eventError instanceof Error ? eventError.message : String(eventError)
                            });
                        }
                    }

                    // 🔬 診断終了 - ContentAnalysisManagerあり・成功時
                    await ljsDiagnostics.finalizeDiagnosticSession();
                    return enhancedChapter;

                } catch (analysisError) {
                    logger.warn(`Post-generation pipeline failed for chapter ${chapterNumber}, returning chapter with basic analysis`, {
                        error: analysisError instanceof Error ? analysisError.message : String(analysisError)
                    });

                    // 分析が失敗した場合は基本的なchapterを返す
                    const finalChapter = {
                        ...baseChapter,
                        metadata: {
                            ...baseChapter.metadata,
                            analysisMetadata: {
                                analysisTimestamp: new Date().toISOString(),
                                analysisProcessingTime: 0,
                                analysisServicesUsed: [],
                                nextChapterPreparationCompleted: false,
                                analysisError: analysisError instanceof Error ? analysisError.message : String(analysisError)
                            }
                        }
                    };

                    // キャラクター状態の更新は試行
                    try {
                        await this.contextGenerator.processGeneratedChapter(finalChapter);
                        logger.info(`Successfully processed character information for chapter ${chapterNumber}`);
                    } catch (error) {
                        logger.warn(`Character information processing failed but chapter generation will continue`, {
                            chapterNumber,
                            error: error instanceof Error ? error.message : String(error)
                        });
                    }

                    // 🔬 診断終了 - ContentAnalysisManagerあり・分析エラー時
                    await ljsDiagnostics.finalizeDiagnosticSession();
                    return finalChapter;
                }
            } else {
                logger.warn(`ContentAnalysisManager not available, returning chapter with basic analysis for chapter ${chapterNumber}`);

                // ContentAnalysisManagerが使用できない場合の基本章
                const finalChapter = {
                    ...baseChapter,
                    metadata: {
                        ...baseChapter.metadata,
                        analysisMetadata: {
                            analysisTimestamp: new Date().toISOString(),
                            analysisProcessingTime: 0,
                            analysisServicesUsed: [],
                            nextChapterPreparationCompleted: false,
                            analysisError: 'ContentAnalysisManager not available'
                        }
                    }
                };

                // キャラクター状態の更新は試行
                try {
                    await this.contextGenerator.processGeneratedChapter(finalChapter);
                    logger.info(`Successfully processed character information for chapter ${chapterNumber}`);
                } catch (error) {
                    logger.warn(`Character information processing failed but chapter generation will continue`, {
                        chapterNumber,
                        error: error instanceof Error ? error.message : String(error)
                    });
                }

                // 🔬 診断終了 - ContentAnalysisManagerなし時
                await ljsDiagnostics.finalizeDiagnosticSession();
                return finalChapter;
            }

        } catch (error) {
            logger.error(`Failed to generate chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });

            const recovered = await this.attemptRecoveryForChapter(chapterNumber, error);
            if (recovered) {
                logger.info(`Successfully recovered chapter ${chapterNumber} after error`);
                // 🔬 診断終了 - リカバリ成功時
                await ljsDiagnostics.finalizeDiagnosticSession();
                return recovered;
            }

            // 🔬 診断終了 - 最終エラー時
            LJSCheck.failure('GENERATION', 'CHAPTER_GENERATION_ERROR', error instanceof Error ? error.message : String(error));
            await ljsDiagnostics.finalizeDiagnosticSession();

            throw new GenerationError(
                `Chapter ${chapterNumber} generation failed: ${error instanceof Error ? error.message : String(error)}`,
                'CHAPTER_GENERATION_FAILED'
            );
        }
    }

    // =========================================================================
    // 🔥 修正: 記憶更新競合回避メソッド
    // =========================================================================

    /**
     * 🔥 新規追加: 章記憶処理の直列化（競合回避）
     */
    private async processChapterMemoriesSerialized(
        chapterNumber: number,
        content: string,
        title: string,
        context: GenerationContext
    ): Promise<void> {
        const lockKey = chapterNumber;

        // 既に同じ章で記憶更新処理が実行中の場合は待機
        if (this.memoryUpdateLocks.has(lockKey)) {
            logger.info(`Memory update already in progress for chapter ${chapterNumber}, waiting...`);
            await this.memoryUpdateLocks.get(lockKey);
        }

        // 新しい記憶更新処理を開始
        const updatePromise = this._executeSerializedMemoryUpdate(chapterNumber, content, title, context);
        this.memoryUpdateLocks.set(lockKey, updatePromise);

        try {
            await updatePromise;
        } finally {
            // 処理完了後にロックを削除
            this.memoryUpdateLocks.delete(lockKey);
        }
    }

    /**
     * 🔥 新規追加: 直列化された記憶更新の実行
     */
    private async _executeSerializedMemoryUpdate(
        chapterNumber: number,
        content: string,
        title: string,
        context: GenerationContext
    ): Promise<void> {
        logger.info(`Starting serialized memory update for chapter ${chapterNumber}`);

        try {
            // 🔥 修正: 1. LearningJourneySystemによる章内容処理（最初に実行）
            if (this.learningJourneySystem && this.learningJourneySystem.isInitialized()) {
                try {
                    logger.debug(`Processing chapter content with LearningJourneySystem for chapter ${chapterNumber}`);
                    await this.learningJourneySystem.processChapterContent(chapterNumber, content, title);
                    logger.debug(`LearningJourneySystem processing completed for chapter ${chapterNumber}`);
                } catch (learningError) {
                    logger.warn(`LearningJourneySystem processing failed for chapter ${chapterNumber}`, {
                        error: learningError instanceof Error ? learningError.message : String(learningError)
                    });
                }
            }

            // 🔥 修正: 2. MemoryManagerによる統合記憶処理（直列実行）
            logger.debug(`Starting MemoryManager integrated processing for chapter ${chapterNumber}`);

            // 章オブジェクトを構築
            const tempChapter: Chapter = {
                id: `temp-chapter-${chapterNumber}`,
                title: title,
                chapterNumber: chapterNumber,
                content: content,
                wordCount: content.length,
                createdAt: new Date(),
                updatedAt: new Date(),
                summary: '',
                scenes: [],
                metadata: {}
            };

            // MemoryManagerの統合記憶処理を実行（skipLearningJourneyUpdate = trueで重複回避）
            const memoryResult = await memoryManager.processChapterMemories(tempChapter, {
                genre: context.genre || 'classic',
                skipLearningJourneyUpdate: true // 🔥 重複回避フラグ
            });

            if (memoryResult.errors.length > 0) {
                logger.warn(`Memory processing completed with ${memoryResult.errors.length} errors for chapter ${chapterNumber}`, {
                    errors: memoryResult.errors
                });
            } else {
                logger.info(`Memory processing completed successfully for chapter ${chapterNumber}`, {
                    eventsDetected: memoryResult.eventsDetected,
                    narrativeUpdated: memoryResult.narrativeUpdated,
                    saved: memoryResult.saved
                });
            }

        } catch (error) {
            logger.error(`Serialized memory update failed for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            // エラーが発生しても章生成は続行（記憶処理は非必須）
        }
    }

    // =========================================================================
    // ヘルパーメソッド
    // =========================================================================

    /**
     * 前章のコンテンツを取得
     */
    private async getPreviousChapterContent(chapterNumber: number): Promise<string | undefined> {
        try {
            const previousChapter = await chapterStorage.getChapter(chapterNumber);
            return previousChapter?.content;
        } catch (error) {
            logger.warn(`Failed to get previous chapter ${chapterNumber} content`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return undefined;
        }
    }

    private async enhanceContextWithLearningJourney(
        context: GenerationContext,
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

    private async savePrompt(chapterNumber: number, prompt: string): Promise<string | null> {
        try {
            try {
                const dirExists = await storageProvider.directoryExists('prompts');
                if (!dirExists) {
                    await storageProvider.createDirectory('prompts');
                }
            } catch (dirError) {
                logger.warn('Failed to check or create prompts directory', {
                    error: dirError instanceof Error ? dirError.message : String(dirError)
                });
                return null;
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `prompt_chapter${chapterNumber}_${timestamp}.txt`;

            await storageProvider.writeFile(`prompts/${fileName}`, prompt);
            logger.info(`Prompt for chapter ${chapterNumber} saved successfully as ${fileName}`);

            return fileName;
        } catch (error) {
            logger.error('Failed to save prompt', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });
            return null;
        }
    }

    private async checkInitializationForFirstChapter(): Promise<{ initialized: boolean, reason?: string }> {
        try {
            const plotCheckResult = await withTimeout(
                this.checkPlotFileExistsDirect(),
                10000,
                'プロットファイル確認'
            ).catch(error => {
                logger.error(`プロットファイル確認でエラー: ${error.message}`);
                return false;
            });

            if (!plotCheckResult) {
                return { initialized: false, reason: 'プロットファイルが見つからないか、確認中にエラーが発生しました。' };
            }

            const characterCheckResult = await withTimeout(
                this.checkMainCharactersExist(),
                10000,
                'メインキャラクター確認'
            ).catch(error => {
                logger.error(`メインキャラクター確認でエラー: ${error.message}`);
                return { exist: false, message: `確認中にエラー: ${error.message}` };
            });

            if (!characterCheckResult.exist) {
                return { initialized: false, reason: `メインキャラクターが設定されていません: ${characterCheckResult.message}` };
            }

            const params = parameterManager.getParameters();
            if (!params || !params.generation) {
                return { initialized: false, reason: 'システムパラメータが正しく初期化されていません' };
            }

            const apiKeyValid = await withTimeout(
                this.geminiClient.validateApiKey(),
                15000,
                'APIキー検証'
            ).catch(error => {
                logger.error(`APIキー検証でエラー: ${error.message}`);
                return false;
            });

            if (!apiKeyValid) {
                return { initialized: false, reason: 'GeminiのAPIキーが無効またはエラーが発生しました' };
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
            const abstractPlotExists = await storageProvider.fileExists('data/config/story-plot/abstract-plot.yaml');
            const concretePlotExists = await storageProvider.fileExists('data/config/story-plot/concrete-plot.yaml');
            const mediumPlotExists = await storageProvider.fileExists('data/config/story-plot/medium-plot.yaml');

            const result = abstractPlotExists || concretePlotExists || mediumPlotExists;
            return result;
        } catch (error) {
            logger.error('プロットファイル直接確認エラー', {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    private async checkMainCharactersExist(): Promise<{ exist: boolean, message: string }> {
        try {
            const mainCharacters = await characterManager.getCharactersByType('MAIN');

            if (!mainCharacters || mainCharacters.length === 0) {
                return { exist: false, message: 'メインキャラクターが定義されていません' };
            }

            return { exist: true, message: `${mainCharacters.length}人のメインキャラクターが存在します` };
        } catch (error) {
            return { exist: false, message: `メインキャラクターの確認中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}` };
        }
    }

    // エラーリカバリーメソッド（簡略化）
    private async attemptRecoveryForChapter(chapterNumber: number, error: unknown): Promise<Chapter | null> {
        return null;
    }

    private async attemptContextRecovery(chapterNumber: number, error: unknown): Promise<any | null> {
        return null;
    }

    private async attemptPromptRecovery(chapterNumber: number, context: any, error: unknown): Promise<string | null> {
        return null;
    }

    private async attemptTextGenerationRecovery(chapterNumber: number, prompt: string, error: unknown): Promise<string | null> {
        return null;
    }

    updateParameter(path: string, value: any): void {
        parameterManager.updateParameter(path, value);
    }

    applyPreset(presetName: string): boolean {
        return parameterManager.applyPreset(presetName);
    }
}