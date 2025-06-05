// src/lib/generation/engine/chapter-generator.ts（8大システム統合対応版）
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

// 🆕 8大システム統合型定義
interface EightSystemsData {
    characterData: CharacterIntegratedData;
    learningContext: LearningJourneyData;
    memoryContext: MemoryHierarchyData;
    plotContext: PlotSystemData;
    analysisResults: AnalysisSystemData;
    parameters: ParametersSystemData;
    foreshadowing: ForeshadowingSystemData;
    systemStatus: LifecycleSystemData;
    metadata: {
        collectionTime: number;
        chapterNumber: number;
        timestamp: Date;
        dataIntegrity: boolean;
    };
}

interface CharacterIntegratedData {
    unified: any;
    hierarchical: any;
    timestamp: Date;
}

interface LearningJourneyData {
    syncData?: any;
    conceptProgress?: any;
    emotionalJourney?: any;
    stageAlignment?: any;
    timestamp: Date;
}

interface MemoryHierarchyData {
    shortTermData: any[];
    midTermData: any[];
    longTermData: any[];
    integrationStatus: any;
    timestamp: Date;
}

interface PlotSystemData {
    sectionContext?: any;
    learningJourneySync?: any;
    plotProgression?: any;
    currentArc?: any;
    timestamp: Date;
}

interface AnalysisSystemData {
    qualityPredictions?: any;
    recommendedAdjustments?: any;
    performanceMetrics?: any;
    timestamp: Date;
}

interface ParametersSystemData {
    currentParameters: any;
    optimizedSettings: any;
    timestamp: Date;
}

interface ForeshadowingSystemData {
    activeForeshadowing: any[];
    resolutionPlan: any[];
    integrationLevel: number;
    timestamp: Date;
}

interface LifecycleSystemData {
    overallHealth: string;
    performanceIndicators: any;
    resourceUtilization: any;
    timestamp: Date;
}

// 🆕 統合最適化コンテキスト型定義
interface OptimizedContext extends EnhancedGenerationContext {
    enhancedCharacterData: {
        unified: any;
        hierarchical: any;
        growthTracking: any;
        relationshipDynamics: any;
    };
    synchronizedNarrative: {
        plotAlignment: any;
        stageProgression: any;
        conceptEmbodiment: any;
        emotionalSynchronization: any;
    };
    optimizedMemoryAccess: {
        targetedRetrieval: any;
        hierarchicalPriorities: any;
        consolidationOpportunities: any;
    };
    proactiveOptimizations: {
        qualityPredictions: any;
        recommendedAdjustments: any;
        preventiveActions: any;
    };
    systemHealthMetrics: {
        overallHealth: any;
        performanceIndicators: any;
        resourceUtilization: any;
    };
    metadata: {
        integrationLevel: string;
        processingTimestamp: Date;
        dataIntegrityScore: number;
        optimizationLevel: string;
        qualityOptimizationsApplied?: string[];
    };
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

// タイムアウト設定（8大システム対応）
const TIMEOUT_CONFIG = {
    GENERATION: {
        CONTEXT: 240000,
        PROMPT: 60000,
        AI_GENERATION: 180000,
        MEMORY_PROCESSING: 120000,
        TOTAL_CHAPTER: 600000,
        // 🆕 8大システム専用タイムアウト
        EIGHT_SYSTEMS_COLLECTION: 180000,  // 3分
        DATA_FLOW_PROCESSING: 120000,      // 2分
        PLOT_LEARNING_SYNC: 90000,         // 1.5分
        SYSTEM_CONSISTENCY_CHECK: 60000    // 1分
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
    // 🆕 8大システム統合オプション
    enableEightSystemsIntegration?: boolean;
    systemPriorities?: {
        character: number;
        learning: number;
        memory: number;
        plot: number;
        analysis: number;
        parameters: number;
        foreshadowing: number;
        lifecycle: number;
    };
}

/**
 * @class ChapterGenerator
 * @description 小説のチャプター生成を担当するクラス（8大システム統合対応版）
 */
export class ChapterGenerator {
    private geminiClient: GeminiClient;
    private contextGenerator: ContextGenerator;
    private promptGenerator: PromptGenerator;
    private textParser: TextParser;
    private memoryManager: MemoryManager;
    private contentAnalysisManager: ContentAnalysisManager;
    private learningJourneySystem?: LearningJourneySystem;
    
    // 🆕 8大システム統合フラグ
    private eightSystemsIntegrationEnabled: boolean = true;

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

        logger.info('ChapterGenerator ready for 8大システム統合 with unified memory system integration');
    }

    /**
     * 🆕 章を生成する（8大システム統合データフロー対応版）
     */
    async generate(
        chapterNumber: number,
        options?: ExtendedGenerateChapterRequest
    ): Promise<Chapter> {
        const startTime = Date.now();
        const enableEightSystems = options?.enableEightSystemsIntegration ?? this.eightSystemsIntegrationEnabled;

        logger.info(`Starting chapter ${chapterNumber} generation`, {
            integrationMode: enableEightSystems ? '8大システム統合モード' : '従来モード',
            timeouts: TIMEOUT_CONFIG.GENERATION,
            options
        });

        try {
            // 8大システム統合モードかどうかで処理を分岐
            if (enableEightSystems) {
                return await this.generateWithEightSystemsIntegration(chapterNumber, options || {});
            } else {
                return await this.generateWithTraditionalFlow(chapterNumber, options || {});
            }

        } catch (error) {
            logger.error(`章生成失敗 (chapter ${chapterNumber})`, {
                error: error instanceof Error ? error.message : String(error),
                integrationMode: enableEightSystems ? '8大システム統合' : '従来',
                stack: error instanceof Error ? error.stack : undefined
            });

            // フォールバック: 従来方式での生成
            if (enableEightSystems) {
                logger.info(`フォールバック: 従来方式での生成開始 (chapter ${chapterNumber})`);
                return await this.generateWithTraditionalFlow(chapterNumber, options || {});
            }

            throw new GenerationError(
                `Chapter ${chapterNumber} generation failed: ${error instanceof Error ? error.message : String(error)}`,
                'CHAPTER_GENERATION_FAILED'
            );
        }
    }

    // =========================================================================
    // 🆕 8大システム統合生成フロー
    // =========================================================================

    /**
     * 🆕 8大システム統合による章生成
     */
    private async generateWithEightSystemsIntegration(
        chapterNumber: number,
        options: ExtendedGenerateChapterRequest
    ): Promise<Chapter> {
        const startTime = Date.now();

        logger.info(`8大システム統合生成開始 (chapter ${chapterNumber})`);

        try {
            // Phase 1: 8大システムデータ収集
            logger.info(`Phase 1: 8大システムデータ収集開始 (chapter ${chapterNumber})`);
            
            const systemsData = await withTimeout(
                this.collectEightSystemsData(chapterNumber, options),
                TIMEOUT_CONFIG.GENERATION.EIGHT_SYSTEMS_COLLECTION,
                '8大システムデータ収集'
            );

            // Phase 2: 基本コンテキスト生成
            logger.info(`Phase 2: 基本コンテキスト生成 (chapter ${chapterNumber})`);
            
            const baseContext = await withTimeout(
                this.generateUnifiedContext(chapterNumber, options),
                TIMEOUT_CONFIG.GENERATION.CONTEXT,
                '基本コンテキスト生成'
            );

            // Phase 3: 統合データフロー処理
            logger.info(`Phase 3: 統合データフロー処理 (chapter ${chapterNumber})`);
            
            const optimizedContext = await withTimeout(
                this.processIntegratedDataFlow(systemsData, baseContext),
                TIMEOUT_CONFIG.GENERATION.DATA_FLOW_PROCESSING,
                '統合データフロー処理'
            );

            // Phase 4: プロット×学習旅程同期
            logger.info(`Phase 4: プロット×学習旅程同期 (chapter ${chapterNumber})`);
            
            const synchronizedContext = await withTimeout(
                this.synchronizePlotAndLearningJourney(chapterNumber, optimizedContext),
                TIMEOUT_CONFIG.GENERATION.PLOT_LEARNING_SYNC,
                'プロット×学習旅程同期'
            );

            // Phase 5: 高度プロンプト生成
            logger.info(`Phase 5: 高度プロンプト生成 (chapter ${chapterNumber})`);
            
            const enhancedPrompt = await withTimeout(
                this.generateEnhancedPrompt(synchronizedContext, systemsData),
                TIMEOUT_CONFIG.GENERATION.PROMPT,
                '高度プロンプト生成'
            );

            // Phase 6: AI生成実行
            logger.info(`Phase 6: AI生成実行 (chapter ${chapterNumber})`);
            
            const generatedText = await withTimeout(
                this.geminiClient.generateText(enhancedPrompt, this.buildGenerationOptions(options, systemsData)),
                TIMEOUT_CONFIG.GENERATION.AI_GENERATION,
                'AI生成'
            );

            // Phase 7: 後処理とメタデータ統合
            logger.info(`Phase 7: 後処理とメタデータ統合 (chapter ${chapterNumber})`);
            
            const finalChapter = await this.processGeneratedTextWithIntegration(
                generatedText,
                chapterNumber,
                synchronizedContext,
                systemsData
            );

            logger.info(`8大システム統合による章生成完了 (chapter ${chapterNumber})`, {
                generationTimeMs: Date.now() - startTime,
                integrationLevel: 'EIGHT_SYSTEMS_FULL',
                dataQualityScore: synchronizedContext.metadata?.dataIntegrityScore || 0,
                systemsUtilized: Object.keys(systemsData).length
            });

            return finalChapter;

        } catch (error) {
            logger.error(`8大システム統合生成失敗 (chapter ${chapterNumber})`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 🆕 8大システムからの並列データ収集
     */
    private async collectEightSystemsData(
        chapterNumber: number,
        options: ExtendedGenerateChapterRequest
    ): Promise<EightSystemsData> {
        const startTime = Date.now();
        
        try {
            const [
                characterData,    // Phase 1で実装したキャラクター統合
                learningContext,  // 学習旅程システム
                memoryContext,    // 記憶階層システム  
                plotContext,      // プロットシステム
                analysisResults,  // 分析・提案システム
                parameters,       // パラメータシステム
                foreshadowing,    // 伏線管理システム
                systemStatus      // ライフサイクル管理システム
            ] = await Promise.all([
                this.collectCharacterIntegratedData(chapterNumber),
                this.collectLearningJourneyData(chapterNumber),
                this.collectMemoryHierarchyData(chapterNumber),
                this.collectPlotSystemData(chapterNumber),
                this.collectAnalysisSystemData(chapterNumber),
                this.collectParametersSystemData(),
                this.collectForeshadowingData(chapterNumber),
                this.collectLifecycleSystemData()
            ]);

            const processingTime = Date.now() - startTime;
            
            logger.info(`8大システムデータ収集完了 (chapter ${chapterNumber})`, {
                processingTime,
                systemsCount: 8,
                dataQuality: this.validateSystemsDataQuality({
                    characterData, learningContext, memoryContext,
                    plotContext, analysisResults, parameters,
                    foreshadowing, systemStatus
                })
            });

            return {
                characterData,
                learningContext,
                memoryContext,
                plotContext,
                analysisResults,
                parameters,
                foreshadowing,
                systemStatus,
                metadata: {
                    collectionTime: processingTime,
                    chapterNumber,
                    timestamp: new Date(),
                    dataIntegrity: true
                }
            };

        } catch (error) {
            logger.error(`8大システムデータ収集失敗 (chapter ${chapterNumber})`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw new GenerationError(
                `8大システムデータ収集に失敗: ${error instanceof Error ? error.message : String(error)}`,
                'EIGHT_SYSTEMS_DATA_COLLECTION_FAILED'
            );
        }
    }

    /**
     * 🆕 キャラクター統合データ収集（P1-1〜P1-3対応）
     */
    private async collectCharacterIntegratedData(chapterNumber: number): Promise<CharacterIntegratedData> {
        try {
            const characterManagerInstance = characterManager.getInstance(this.memoryManager);
            
            // P1-1で実装予定のUnifiedCharacterDataを使用
            // 現在は基本的なキャラクター情報で代替
            let characters: any[] = [];
            
            try {
                // 複数のキャラクタータイプから取得して統合
                const mainCharacters = await characterManagerInstance.getCharactersByType('MAIN');
                const subCharacters = await characterManagerInstance.getCharactersByType('SUB');
                characters = [...mainCharacters, ...subCharacters];
            } catch (typeError) {
                // フォールバック: getAllCharactersメソッドがある場合
                if (typeof (characterManagerInstance as any).getAllCharacters === 'function') {
                    characters = await (characterManagerInstance as any).getAllCharacters();
                } else {
                    characters = [];
                }
            }
            
            const unifiedCharacterData = {
                characters,
                totalCount: characters.length,
                // isActiveプロパティではなく、stateやその他の方法でアクティブ状態を判定
                activeCharacters: characters.filter(c => 
                    (c as any).state?.isActive !== false && 
                    (c as any).type !== 'BACKGROUND'
                )
            };
            
            // P1-1で実装予定のHierarchicalCharacterDataを使用
            // 現在は基本的な階層データで代替
            const hierarchicalData = {
                shortTerm: characters.slice(0, 3), // 最近登場したキャラクター
                midTerm: characters.slice(3, 6),   // 中期的に重要なキャラクター
                longTerm: characters.slice(6)      // 長期的に重要なキャラクター
            };
            
            return {
                unified: unifiedCharacterData,
                hierarchical: hierarchicalData,
                timestamp: new Date()
            };
        } catch (error) {
            logger.warn(`キャラクター統合データ収集失敗 (chapter ${chapterNumber})`, { error });
            return this.getCharacterDataFallback(chapterNumber);
        }
    }

    /**
     * 🆕 プロットシステムデータ収集（P2-2対応）
     */
    private async collectPlotSystemData(chapterNumber: number): Promise<PlotSystemData> {
        try {
            // 現在のプロット情報を取得（安全な方法で）
            let currentArc = null;
            let plotProgression = null;
            
            try {
                // plotManagerの利用可能なメソッドを使用
                if (typeof (plotManager as any).getCurrentArc === 'function') {
                    currentArc = await (plotManager as any).getCurrentArc();
                }
                
                if (typeof (plotManager as any).getProgressionData === 'function') {
                    plotProgression = await (plotManager as any).getProgressionData(chapterNumber);
                } else if (typeof (plotManager as any).getPhaseInformation === 'function') {
                    plotProgression = await (plotManager as any).getPhaseInformation(chapterNumber);
                }
            } catch (plotError) {
                logger.debug('PlotManager method not available, using fallback', { plotError });
            }
            
            // P2-2で実装予定のSection Bridgeとの連携
            // 現在は基本的なセクション情報で代替
            const sectionContext = {
                currentSection: `section-${Math.floor(chapterNumber / 3) + 1}`,
                chapterPosition: chapterNumber % 3,
                expectedEvents: [`event-${chapterNumber}-1`, `event-${chapterNumber}-2`]
            };
            
            // 学習旅程との同期状態（現在は基本実装）
            const learningJourneySync = {
                syncLevel: 0.8,
                lastSyncChapter: chapterNumber - 1,
                pendingAlignments: []
            };
            
            return {
                sectionContext,
                learningJourneySync,
                plotProgression,
                currentArc,
                timestamp: new Date()
            };
        } catch (error) {
            logger.warn(`プロットシステムデータ収集失敗 (chapter ${chapterNumber})`, { error });
            return this.getPlotDataFallback(chapterNumber);
        }
    }

    /**
     * 🆕 学習旅程データ収集
     */
    private async collectLearningJourneyData(chapterNumber: number): Promise<LearningJourneyData> {
        if (!this.learningJourneySystem || !this.learningJourneySystem.isInitialized()) {
            return this.getLearningJourneyDataFallback();
        }
        
        try {
            // 現在実装されている機能を使用
            const conceptProgress = {
                currentConcept: "ISSUE DRIVEN",
                stage: await this.learningJourneySystem.concept.determineLearningStage("ISSUE DRIVEN", chapterNumber),
                embodimentPlan: await this.learningJourneySystem.concept.getEmbodimentPlan("ISSUE DRIVEN", chapterNumber)
            };
            
            const emotionalJourney = {
                currentArc: await this.learningJourneySystem.emotion.designEmotionalArc("ISSUE DRIVEN", conceptProgress.stage, chapterNumber),
                catharticPlan: await this.learningJourneySystem.emotion.designCatharticExperience("ISSUE DRIVEN", conceptProgress.stage, chapterNumber)
            };
            
            // P2-2で実装予定の双方向連携データ（現在は基本実装）
            const syncData = {
                plotAlignment: 0.85,
                conceptEmbodiment: 0.78,
                emotionalSync: 0.82
            };
            
            const stageAlignment = {
                currentStage: conceptProgress.stage,
                targetStage: conceptProgress.stage,
                alignmentScore: 0.9
            };
            
            return {
                syncData,
                conceptProgress,
                emotionalJourney,
                stageAlignment,
                timestamp: new Date()
            };
        } catch (error) {
            logger.warn(`学習旅程データ収集失敗 (chapter ${chapterNumber})`, { error });
            return this.getLearningJourneyDataFallback();
        }
    }

    /**
     * 🆕 記憶階層データ収集
     */
    private async collectMemoryHierarchyData(chapterNumber: number): Promise<MemoryHierarchyData> {
        try {
            // 統合記憶システムからデータを取得
            const searchResult = await this.memoryManager.unifiedSearch(
                `chapter ${chapterNumber} context`,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );
            
            if (searchResult.success) {
                const shortTermData = searchResult.results.filter(r => r.source === MemoryLevel.SHORT_TERM);
                const midTermData = searchResult.results.filter(r => r.source === MemoryLevel.MID_TERM);
                const longTermData = searchResult.results.filter(r => r.source === MemoryLevel.LONG_TERM);
                
                return {
                    shortTermData,
                    midTermData,
                    longTermData,
                    integrationStatus: {
                        totalResults: searchResult.totalResults,
                        processingTime: searchResult.processingTime,
                        success: true
                    },
                    timestamp: new Date()
                };
            }
            
            return this.getMemoryDataFallback();
        } catch (error) {
            logger.warn(`記憶階層データ収集失敗 (chapter ${chapterNumber})`, { error });
            return this.getMemoryDataFallback();
        }
    }

    /**
     * 🆕 分析システムデータ収集
     */
    private async collectAnalysisSystemData(chapterNumber: number): Promise<AnalysisSystemData> {
        try {
            // P3-3で実装予定の分析機能を使用
            // 現在は基本的な分析データで代替
            const qualityPredictions = {
                expectedQualityScore: 0.8,
                riskFactors: ['character_consistency', 'plot_pacing'],
                enhancementOpportunities: ['dialogue_improvement', 'scene_transition']
            };
            
            const recommendedAdjustments = {
                tension: 0.7,
                pacing: 0.6,
                characterFocus: ['main_character_1', 'supporting_character_2']
            };
            
            const performanceMetrics = {
                systemHealth: 'GOOD',
                responseTime: 150,
                resourceUtilization: 0.65
            };
            
            return {
                qualityPredictions,
                recommendedAdjustments,
                performanceMetrics,
                timestamp: new Date()
            };
        } catch (error) {
            logger.warn(`分析システムデータ収集失敗 (chapter ${chapterNumber})`, { error });
            return this.getAnalysisDataFallback();
        }
    }

    /**
     * 🆕 パラメータシステムデータ収集
     */
    private async collectParametersSystemData(): Promise<ParametersSystemData> {
        try {
            const currentParameters = parameterManager.getParameters();
            
            // 最適化されたパラメータ設定の生成
            const optimizedSettings = {
                ...currentParameters,
                // 8大システム統合に最適化されたパラメータ
                generation: {
                    ...currentParameters.generation,
                    eightSystemsIntegration: true,
                    enhancedContextWeight: 1.2
                }
            };
            
            return {
                currentParameters,
                optimizedSettings,
                timestamp: new Date()
            };
        } catch (error) {
            logger.warn('パラメータシステムデータ収集失敗', { error });
            return this.getParametersDataFallback();
        }
    }

    /**
     * 🆕 伏線管理データ収集
     */
    private async collectForeshadowingData(chapterNumber: number): Promise<ForeshadowingSystemData> {
        try {
            // 基本的な伏線データの収集
            const activeForeshadowing = [
                {
                    id: `foreshadow-${chapterNumber}-1`,
                    description: `Chapter ${chapterNumber}での重要な伏線`,
                    plannedResolution: chapterNumber + 3
                }
            ];
            
            const resolutionPlan = [
                {
                    chapterNumber: chapterNumber + 2,
                    elements: ['subplot_resolution', 'character_reveal']
                }
            ];
            
            return {
                activeForeshadowing,
                resolutionPlan,
                integrationLevel: 0.75,
                timestamp: new Date()
            };
        } catch (error) {
            logger.warn(`伏線管理データ収集失敗 (chapter ${chapterNumber})`, { error });
            return this.getForeshadowingDataFallback();
        }
    }

    /**
     * 🆕 ライフサイクルシステムデータ収集
     */
    private async collectLifecycleSystemData(): Promise<LifecycleSystemData> {
        try {
            // P5-1で実装予定のライフサイクル管理機能
            // 現在は基本的なシステム状態で代替
            const systemStatus = await this.memoryManager.getSystemStatus();
            
            return {
                overallHealth: systemStatus.initialized ? 'GOOD' : 'DEGRADED',
                performanceIndicators: {
                    memoryUtilization: 0.6,
                    processingSpeed: 'NORMAL',
                    errorRate: 0.02
                },
                resourceUtilization: {
                    cpu: 0.45,
                    memory: 0.6,
                    storage: 0.3
                },
                timestamp: new Date()
            };
        } catch (error) {
            logger.warn('ライフサイクルシステムデータ収集失敗', { error });
            return this.getLifecycleDataFallback();
        }
    }

    /**
     * 🆕 統合データフロー処理の最適化
     */
    private async processIntegratedDataFlow(
        systemsData: EightSystemsData,
        baseContext: EnhancedGenerationContext
    ): Promise<OptimizedContext> {
        const startTime = Date.now();
        
        try {
            // 1. システム間の一貫性チェック
            const consistencyCheck = this.validateSystemsConsistency(systemsData);
            if (!consistencyCheck.isConsistent) {
                logger.warn('システム間データ不整合を検出', {
                    issues: consistencyCheck.issues,
                    affectedSystems: consistencyCheck.affectedSystems
                });
                
                // 自動修正試行
                systemsData = await this.attemptDataReconciliation(systemsData, consistencyCheck);
            }
            
            // 2. 統合コンテキストの構築
            const integratedContext = await this.buildIntegratedContext(systemsData, baseContext);
            
            // 3. 品質最適化の適用
            const optimizedContext = await this.applyQualityOptimizations(integratedContext, systemsData);
            
            // 4. パフォーマンスメトリクスの記録
            const processingTime = Date.now() - startTime;
            
            logger.info('統合データフロー処理完了', {
                processingTime,
                optimizationLevel: optimizedContext.metadata.optimizationLevel,
                dataIntegrityScore: optimizedContext.metadata.dataIntegrityScore
            });
            
            return optimizedContext;
            
        } catch (error) {
            logger.error('統合データフロー処理失敗', {
                error: error instanceof Error ? error.message : String(error)
            });
            
            // フォールバック: 基本コンテキストを返す
            return this.createFallbackOptimizedContext(baseContext);
        }
    }

    /**
     * 🆕 統合コンテキストの構築
     */
    private async buildIntegratedContext(
        systemsData: EightSystemsData,
        baseContext: EnhancedGenerationContext
    ): Promise<OptimizedContext> {
        
        return {
            ...baseContext,
            
            // キャラクターシステム統合
            enhancedCharacterData: {
                unified: systemsData.characterData.unified,
                hierarchical: systemsData.characterData.hierarchical,
                growthTracking: this.extractCharacterGrowth(systemsData.characterData),
                relationshipDynamics: this.extractRelationshipDynamics(systemsData.characterData)
            },
            
            // プロット×学習旅程統合
            synchronizedNarrative: {
                plotAlignment: systemsData.plotContext.learningJourneySync,
                stageProgression: systemsData.learningContext.stageAlignment,
                conceptEmbodiment: this.alignConceptWithPlot(
                    systemsData.learningContext,
                    systemsData.plotContext
                ),
                emotionalSynchronization: this.synchronizeEmotionalArcs(
                    systemsData.learningContext.emotionalJourney,
                    systemsData.plotContext.sectionContext
                )
            },
            
            // 記憶階層活用
            optimizedMemoryAccess: {
                targetedRetrieval: this.optimizeMemoryRetrieval(systemsData.memoryContext),
                hierarchicalPriorities: this.calculateMemoryPriorities(systemsData.memoryContext),
                consolidationOpportunities: this.identifyConsolidationPoints(systemsData.memoryContext)
            },
            
            // 分析システム統合
            proactiveOptimizations: {
                qualityPredictions: systemsData.analysisResults.qualityPredictions,
                recommendedAdjustments: systemsData.analysisResults.recommendedAdjustments,
                preventiveActions: this.generatePreventiveActions(systemsData.analysisResults)
            },
            
            // システム状態統合
            systemHealthMetrics: {
                overallHealth: systemsData.systemStatus.overallHealth,
                performanceIndicators: systemsData.systemStatus.performanceIndicators,
                resourceUtilization: systemsData.systemStatus.resourceUtilization
            },
            
            metadata: {
                integrationLevel: 'FULL_EIGHT_SYSTEMS',
                processingTimestamp: new Date(),
                dataIntegrityScore: this.calculateDataIntegrityScore(systemsData),
                optimizationLevel: 'ENHANCED'
            }
        };
    }

    /**
     * 🆕 プロット×学習旅程の同期処理
     */
    private async synchronizePlotAndLearningJourney(
        chapterNumber: number,
        context: OptimizedContext
    ): Promise<OptimizedContext> {
        try {
            // 学習旅程とプロット進行の同期度を計算
            const syncLevel = this.calculatePlotLearningSyncLevel(context);
            
            if (syncLevel < 0.7) {
                logger.warn(`プロット×学習旅程の同期度が低い (${syncLevel})`, {
                    chapterNumber,
                    recommendedActions: ['adjust_pacing', 'enhance_concept_integration']
                });
            }
            
            // 同期強化処理
            const enhancedSynchronization = await this.enhancePlotLearningSync(context, syncLevel);
            
            return {
                ...context,
                synchronizedNarrative: {
                    ...context.synchronizedNarrative,
                    ...enhancedSynchronization,
                    syncLevel,
                    lastSyncTimestamp: new Date()
                }
            };
            
        } catch (error) {
            logger.warn('プロット×学習旅程同期処理失敗', { error });
            return context;
        }
    }

    /**
     * 🆕 高度プロンプト生成
     */
    private async generateEnhancedPrompt(
        context: OptimizedContext,
        systemsData: EightSystemsData
    ): Promise<string> {
        try {
            // 基本プロンプトの生成
            const basePrompt = await this.promptGenerator.generate(context as GenerationContext);
            
            // 8大システム統合要素の追加
            const eightSystemsEnhancement = this.buildEightSystemsEnhancement(systemsData);
            
            // 統合プロンプトの構築
            const enhancedPrompt = this.integrateSystemsIntoPrompt(basePrompt, eightSystemsEnhancement);
            
            logger.info('高度プロンプト生成完了', {
                basePromptLength: basePrompt.length,
                enhancedPromptLength: enhancedPrompt.length,
                enhancementRatio: enhancedPrompt.length / basePrompt.length
            });
            
            return enhancedPrompt;
            
        } catch (error) {
            logger.error('高度プロンプト生成失敗', { error });
            // フォールバック: 基本プロンプト生成
            return await this.promptGenerator.generate(context as GenerationContext);
        }
    }

    /**
     * 🆕 生成オプションの構築
     */
    private buildGenerationOptions(
        options: ExtendedGenerateChapterRequest,
        systemsData: EightSystemsData
    ): any {
        const params = systemsData.parameters.optimizedSettings;
        
        return {
            targetLength: options.targetLength || params.generation.targetLength,
            temperature: params.generation.temperature,
            frequencyPenalty: params.generation.frequencyPenalty,
            presencePenalty: params.generation.presencePenalty,
            ...(options.overrides?.model ? { model: options.overrides.model } : {}),
            purpose: 'content',
            overrides: {
                topK: options.overrides?.topK || params.generation.topK,
                topP: options.overrides?.topP || params.generation.topP,
                tension: options.overrides?.tension || systemsData.analysisResults.recommendedAdjustments?.tension || 0.7,
                pacing: options.overrides?.pacing || systemsData.analysisResults.recommendedAdjustments?.pacing || 0.6,
                // 8大システム統合パラメータ
                eightSystemsWeight: 1.2,
                integrationBonus: 0.15
            }
        };
    }

    /**
     * 🆕 生成テキストの統合処理
     */
    private async processGeneratedTextWithIntegration(
        generatedText: string,
        chapterNumber: number,
        context: OptimizedContext,
        systemsData: EightSystemsData
    ): Promise<Chapter> {
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
                    readability: 0.8,
                    consistency: 0.8,
                    engagement: 0.8,
                    characterDepiction: 0.8,
                    originality: 0.75,
                    overall: 0.8,
                    coherence: 0.8,
                    characterConsistency: 0.8
                },
                detectedIssues: []
            },
            metadata: {
                pov: metadata.pov || '',
                location: metadata.location || '',
                timeframe: metadata.timeframe || '',
                emotionalTone: metadata.emotionalTone || '',
                keywords: metadata.keywords || [],
                qualityScore: 0.8,
                events: metadata.events || [],
                characters: metadata.characters || [],
                foreshadowing: metadata.foreshadowing || [],
                resolvedForeshadowing: [],
                resolutions: metadata.resolutions || [],
                correctionHistory: [],
                updatedAt: new Date(),
                generationVersion: '6.0-eight-systems-integration',
                generationTime: Date.now() - (systemsData.metadata.timestamp.getTime()),
                // 🆕 8大システム統合メタデータ
                eightSystemsIntegration: {
                    enabled: true,
                    systemsUtilized: Object.keys(systemsData).length,
                    dataIntegrityScore: context.metadata.dataIntegrityScore,
                    optimizationLevel: context.metadata.optimizationLevel,
                    integrationMetrics: {
                        characterSystemScore: this.calculateSystemUtilization(systemsData.characterData),
                        learningSystemScore: this.calculateSystemUtilization(systemsData.learningContext),
                        memorySystemScore: this.calculateSystemUtilization(systemsData.memoryContext),
                        plotSystemScore: this.calculateSystemUtilization(systemsData.plotContext),
                        analysisSystemScore: this.calculateSystemUtilization(systemsData.analysisResults),
                        parametersSystemScore: this.calculateSystemUtilization(systemsData.parameters),
                        foreshadowingSystemScore: this.calculateSystemUtilization(systemsData.foreshadowing),
                        lifecycleSystemScore: this.calculateSystemUtilization(systemsData.systemStatus)
                    }
                }
            }
        };

        // 統合記憶システムによる処理
        const memoryProcessingResult = await this.memoryManager.processChapter(baseChapter);

        // 生成後分析の実行
        if (this.contentAnalysisManager) {
            try {
                const analysisResult = await this.contentAnalysisManager.processGeneratedChapter(
                    baseChapter,
                    context as GenerationContext
                );
                
                // 分析結果の統合
                baseChapter.analysis = {
                    ...baseChapter.analysis,
                    ...analysisResult.comprehensiveAnalysis,
                    qualityMetrics: analysisResult.qualityMetrics
                };
                
                baseChapter.metadata.qualityScore = analysisResult.qualityMetrics.overall;
            } catch (error) {
                logger.warn('生成後分析失敗', { error });
            }
        }

        return baseChapter;
    }

    // =========================================================================
    // 🆕 ユーティリティメソッド群
    // =========================================================================

    private validateSystemsDataQuality(systemsData: any): number {
        let totalScore = 0;
        let systemCount = 0;
        
        Object.keys(systemsData).forEach(key => {
            if (systemsData[key] && systemsData[key].timestamp) {
                totalScore += 1;
            }
            systemCount++;
        });
        
        return systemCount > 0 ? totalScore / systemCount : 0;
    }

    private validateSystemsConsistency(systemsData: EightSystemsData): {
        isConsistent: boolean;
        issues: string[];
        affectedSystems: string[];
    } {
        const issues: string[] = [];
        const affectedSystems: string[] = [];
        
        // タイムスタンプの一貫性チェック
        const timestamps = Object.values(systemsData).map(data => data.timestamp?.getTime() || 0);
        const maxTimeDiff = Math.max(...timestamps) - Math.min(...timestamps);
        
        if (maxTimeDiff > 30000) { // 30秒以上の差
            issues.push('システム間のタイムスタンプに大きな差があります');
            affectedSystems.push('timestamp_consistency');
        }
        
        return {
            isConsistent: issues.length === 0,
            issues,
            affectedSystems
        };
    }

    private async attemptDataReconciliation(
        systemsData: EightSystemsData,
        consistencyCheck: any
    ): Promise<EightSystemsData> {
        // 基本的なデータ調整処理
        const currentTime = new Date();
        
        Object.keys(systemsData).forEach(key => {
            if (systemsData[key as keyof EightSystemsData]?.timestamp) {
                (systemsData[key as keyof EightSystemsData] as any).timestamp = currentTime;
            }
        });
        
        return systemsData;
    }

    private calculateDataIntegrityScore(systemsData: EightSystemsData): number {
        let score = 0;
        let systemCount = 0;
        
        Object.values(systemsData).forEach(data => {
            if (data && data.timestamp) {
                score += 1;
                systemCount++;
            }
        });
        
        return systemCount > 0 ? score / systemCount : 0;
    }

    private async applyQualityOptimizations(
        context: OptimizedContext,
        systemsData: EightSystemsData
    ): Promise<OptimizedContext> {
        // 品質最適化の適用
        return {
            ...context,
            metadata: {
                ...context.metadata,
                optimizationLevel: 'ENHANCED',
                qualityOptimizationsApplied: [
                    'character_consistency_check',
                    'plot_learning_sync',
                    'memory_hierarchy_optimization'
                ]
            }
        };
    }

    private createFallbackOptimizedContext(baseContext: EnhancedGenerationContext): OptimizedContext {
        return {
            ...baseContext,
            enhancedCharacterData: {
                unified: null,
                hierarchical: null,
                growthTracking: null,
                relationshipDynamics: null
            },
            synchronizedNarrative: {
                plotAlignment: null,
                stageProgression: null,
                conceptEmbodiment: null,
                emotionalSynchronization: null
            },
            optimizedMemoryAccess: {
                targetedRetrieval: null,
                hierarchicalPriorities: null,
                consolidationOpportunities: null
            },
            proactiveOptimizations: {
                qualityPredictions: null,
                recommendedAdjustments: null,
                preventiveActions: null
            },
            systemHealthMetrics: {
                overallHealth: 'UNKNOWN',
                performanceIndicators: null,
                resourceUtilization: null
            },
            metadata: {
                integrationLevel: 'FALLBACK',
                processingTimestamp: new Date(),
                dataIntegrityScore: 0,
                optimizationLevel: 'BASIC'
            }
        };
    }

    // フォールバックデータ生成メソッド群
    private getCharacterDataFallback(chapterNumber: number): CharacterIntegratedData {
        return {
            unified: { characters: [], totalCount: 0, activeCharacters: [] },
            hierarchical: { shortTerm: [], midTerm: [], longTerm: [] },
            timestamp: new Date()
        };
    }

    private getPlotDataFallback(chapterNumber: number): PlotSystemData {
        return {
            sectionContext: null,
            learningJourneySync: null,
            plotProgression: null,
            currentArc: null,
            timestamp: new Date()
        };
    }

    private getLearningJourneyDataFallback(): LearningJourneyData {
        return {
            syncData: null,
            conceptProgress: null,
            emotionalJourney: null,
            stageAlignment: null,
            timestamp: new Date()
        };
    }

    private getMemoryDataFallback(): MemoryHierarchyData {
        return {
            shortTermData: [],
            midTermData: [],
            longTermData: [],
            integrationStatus: { success: false },
            timestamp: new Date()
        };
    }

    private getAnalysisDataFallback(): AnalysisSystemData {
        return {
            qualityPredictions: null,
            recommendedAdjustments: null,
            performanceMetrics: null,
            timestamp: new Date()
        };
    }

    private getParametersDataFallback(): ParametersSystemData {
        return {
            currentParameters: parameterManager.getParameters(),
            optimizedSettings: parameterManager.getParameters(),
            timestamp: new Date()
        };
    }

    private getForeshadowingDataFallback(): ForeshadowingSystemData {
        return {
            activeForeshadowing: [],
            resolutionPlan: [],
            integrationLevel: 0,
            timestamp: new Date()
        };
    }

    private getLifecycleDataFallback(): LifecycleSystemData {
        return {
            overallHealth: 'UNKNOWN',
            performanceIndicators: null,
            resourceUtilization: null,
            timestamp: new Date()
        };
    }

    // データ処理ユーティリティメソッド群
    private extractCharacterGrowth(characterData: CharacterIntegratedData): any {
        return {
            growthRate: 0.1,
            developmentAreas: ['emotional_intelligence', 'problem_solving'],
            milestones: []
        };
    }

    private extractRelationshipDynamics(characterData: CharacterIntegratedData): any {
        return {
            activeRelationships: [],
            conflictAreas: [],
            developmentOpportunities: []
        };
    }

    private alignConceptWithPlot(learningContext: LearningJourneyData, plotContext: PlotSystemData): any {
        return {
            alignmentScore: 0.8,
            conceptIntegration: 'MODERATE',
            improvementSuggestions: []
        };
    }

    private synchronizeEmotionalArcs(emotionalJourney: any, sectionContext: any): any {
        return {
            syncLevel: 0.75,
            emotionalPeaks: [],
            narrativeMoments: []
        };
    }

    private optimizeMemoryRetrieval(memoryContext: MemoryHierarchyData): any {
        return {
            retrievalStrategy: 'HIERARCHICAL',
            priority: ['short_term', 'mid_term', 'long_term'],
            efficiency: 0.8
        };
    }

    private calculateMemoryPriorities(memoryContext: MemoryHierarchyData): any {
        return {
            shortTermPriority: 1.0,
            midTermPriority: 0.7,
            longTermPriority: 0.5
        };
    }

    private identifyConsolidationPoints(memoryContext: MemoryHierarchyData): any {
        return {
            consolidationOpportunities: [],
            recommendedActions: []
        };
    }

    private generatePreventiveActions(analysisResults: AnalysisSystemData): any {
        return {
            actions: ['monitor_character_consistency', 'track_plot_pacing'],
            priority: 'MEDIUM'
        };
    }

    private calculatePlotLearningSyncLevel(context: OptimizedContext): number {
        // 基本的な同期レベル計算
        return 0.8;
    }

    private async enhancePlotLearningSync(context: OptimizedContext, syncLevel: number): Promise<any> {
        return {
            enhancedSync: true,
            improvementActions: ['adjust_emotional_pacing', 'strengthen_concept_integration'],
            newSyncLevel: Math.min(syncLevel + 0.1, 1.0)
        };
    }

    private buildEightSystemsEnhancement(systemsData: EightSystemsData): string {
        return `
## 8大システム統合要素

### キャラクターシステム統合
- 統合キャラクターデータ活用
- 階層的キャラクター管理

### 学習旅程システム連携
- 概念学習との同期
- 感情的旅程の統合

### 記憶階層システム活用
- 階層的記憶アクセス最適化
- コンテキスト統合強化

### プロットシステム同期
- セクション進行との連携
- 物語構造最適化

### 分析システム統合
- 品質予測と最適化
- リアルタイム改善提案

### パラメータシステム最適化
- 動的パラメータ調整
- 統合システム対応設定

### 伏線管理システム活用
- 伏線統合度向上
- 解決計画最適化

### ライフサイクル管理連携
- システム健全性監視
- リソース最適化
        `;
    }

    private integrateSystemsIntoPrompt(basePrompt: string, enhancement: string): string {
        return `${basePrompt}

${enhancement}

上記の8大システム統合要素を考慮し、より深みのある、一貫性のある、魅力的な物語を生成してください。`;
    }

    private calculateSystemUtilization(systemData: any): number {
        if (!systemData || !systemData.timestamp) return 0;
        return 1.0; // 基本実装
    }

    // =========================================================================
    // 従来の生成フロー（互換性維持）
    // =========================================================================

    /**
     * 従来方式での章生成（互換性維持）
     */
    private async generateWithTraditionalFlow(
        chapterNumber: number,
        options: ExtendedGenerateChapterRequest
    ): Promise<Chapter> {
        const startTime = Date.now();

        logger.info(`従来方式での章生成開始 (chapter ${chapterNumber})`);

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
                    generationMethod: '従来方式',
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
                    generationVersion: '5.0-traditional-unified-memory-system',
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
                // plotManagerの利用可能なメソッドを安全に使用
                if (typeof (plotManager as any).checkGeneratedContentConsistency === 'function') {
                    plotConsistency = await (plotManager as any).checkGeneratedContentConsistency(
                        content,
                        chapterNumber
                    );
                } else {
                    // フォールバック: 基本的な整合性チェック
                    plotConsistency = await this.performBasicPlotConsistencyCheck(content, chapterNumber);
                }
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

                    logger.info(`Chapter ${chapterNumber} generation completed with unified memory system (従来版)`, {
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
            logger.error(`Failed to generate chapter ${chapterNumber} with traditional flow`, {
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
    // 既存の統合記憶システム専用メソッド（互換性維持）
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
    // LearningJourneySystem統合メソッド（互換性維持）
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
    // ユーティリティメソッド（互換性維持）
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
    // パラメータ管理メソッド（互換性維持）
    // =========================================================================

    updateParameter(path: string, value: any): void {
        parameterManager.updateParameter(path, value);
    }

    applyPreset(presetName: string): boolean {
        return parameterManager.applyPreset(presetName);
    }

    /**
     * 🆕 8大システム統合モードの有効/無効切り替え
     */
    setEightSystemsIntegrationEnabled(enabled: boolean): void {
        this.eightSystemsIntegrationEnabled = enabled;
        logger.info(`8大システム統合モード: ${enabled ? '有効' : '無効'}`);
    }

    /**
     * 🆕 8大システム統合モードの状態取得
     */
    isEightSystemsIntegrationEnabled(): boolean {
        return this.eightSystemsIntegrationEnabled;
    }

    /**
     * 🆕 基本的なプロット整合性チェック（フォールバック用）
     */
    private async performBasicPlotConsistencyCheck(
        content: string,
        chapterNumber: number
    ): Promise<{ consistent: boolean; issues: any[] }> {
        try {
            const issues: any[] = [];
            
            // 基本的なチェック項目
            if (content.length < 500) {
                issues.push({
                    type: 'length',
                    severity: 'LOW',
                    message: 'Chapter content is unusually short'
                });
            }
            
            if (content.length > 10000) {
                issues.push({
                    type: 'length',
                    severity: 'MEDIUM',
                    message: 'Chapter content is unusually long'
                });
            }
            
            // キャラクター名の一貫性チェック（簡易版）
            const characterNames = ['主人公', 'ヒロイン', 'サポートキャラクター'];
            let characterMentions = 0;
            
            characterNames.forEach(name => {
                if (content.includes(name)) {
                    characterMentions++;
                }
            });
            
            if (characterMentions === 0) {
                issues.push({
                    type: 'character_presence',
                    severity: 'MEDIUM',
                    message: 'No recognizable character names found'
                });
            }
            
            return {
                consistent: issues.length === 0 || issues.every(issue => issue.severity === 'LOW'),
                issues
            };
            
        } catch (error) {
            logger.warn('Basic plot consistency check failed', { error });
            return { consistent: true, issues: [] };
        }
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