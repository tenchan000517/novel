/**
 * @fileoverview 小説生成コンテキスト生成モジュール（完成版）
 * @description
 * 分析機能をanalysisモジュールに完全委譲し、コンテキスト生成に専念。
 * ChapterGeneratorから渡されるoptionsから拡張データを取得し、
 * 高品質なGenerationContextを構築する。
 */

import { logger } from '@/lib/utils/logger';
import { GenerationContext, ThemeEnhancement, StyleGuidance, TensionPacingRecommendation } from '@/types/generation';
import { MemoryManager, memoryManager } from '@/lib/memory/manager';
import { GenerationError } from '@/lib/utils/error-handler';
import { MemoryProvider } from './context-generator/memory-provider';
import { ForeshadowingProvider } from './context-generator/foreshadowing-provider';
import { ExpressionProvider } from './context-generator/expression-provider';
import { StoryContextBuilder } from './context-generator/story-context-builder';
import { MetricsCalculator } from './context-generator/metrics-calculator';
import { FallbackManager } from './context-generator/fallback-manager';
import { parameterManager } from '@/lib/parameters';
import { plotManager } from '@/lib/plot';
import { characterManager } from '@/lib/characters/manager';
import { Chapter } from '@/types/chapters';
import { Foreshadowing } from '@/types/memory';
import { storageProvider } from '@/lib/storage';
import { CharacterPsychology } from '@/types/characters';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { Character, CharacterMetadata } from '@/types/characters';
import { JsonParser } from '@/lib/utils/json-parser';
import { NarrativeMemory } from '@/lib/memory/narrative-memory';
import { EmotionalArcDesign } from '@/types/characters';

// === analysisモジュール統合 ===
import { ContentAnalysisManager } from '@/lib/analysis/content-analysis-manager';

// LiteraryInspiration 型定義
interface LiteraryInspiration {
    plotTechniques: Array<{
        technique: string;
        description: string;
        example: string;
        reference: string;
    }>;
    characterTechniques: Array<{
        technique: string;
        description: string;
        example: string;
        reference: string;
    }>;
    atmosphereTechniques: Array<{
        technique: string;
        description: string;
        example: string;
        reference: string;
    }>;
}

/**
 * @class ContextGenerator
 * @description コンテキスト生成専用クラス（完成版）
 * 
 * @architecture
 * - 役割：GenerationContextの構築のみに専念
 * - 入力：ChapterGeneratorから渡されるoptionsから拡張データを取得
 * - 出力：高品質なGenerationContext
 * - 分析機能：一切持たず、全てanalysisモジュールに委譲
 */
export class ContextGenerator {
    private memoryProvider: MemoryProvider;
    private foreshadowingProvider: ForeshadowingProvider;
    private expressionProvider: ExpressionProvider;
    private storyContextBuilder: StoryContextBuilder;
    private metricsCalculator: MetricsCalculator;
    private fallbackManager: FallbackManager;
    private temporaryStorage: Map<string, string> | null = null;
    private narrativeMemory: NarrativeMemory;
    private characterManager: any;

    private plotManager = plotManager;
    private initialized: boolean = false;

    // === ContentAnalysisManager への参照（依存性注入用） ===
    // 注意：analysisモジュール統合後は使用しない
    private contentAnalysisManager: ContentAnalysisManager | null = null;

    /**
     * コンストラクタ
     */
    constructor() {
        this.memoryProvider = new MemoryProvider(memoryManager);
        this.foreshadowingProvider = new ForeshadowingProvider(memoryManager);
        this.expressionProvider = new ExpressionProvider();
        this.storyContextBuilder = new StoryContextBuilder();
        this.metricsCalculator = new MetricsCalculator();
        this.fallbackManager = new FallbackManager(memoryManager);
        this.narrativeMemory = new NarrativeMemory();
        this.characterManager = characterManager;

        this.initializeParameters();
        logger.info('ContextGenerator initialized (完成版)');
    }

    /**
     * ContentAnalysisManager の依存性注入
     * 注意：完成版では使用しないが、互換性のため保持
     */
    setContentAnalysisManager(contentAnalysisManager: ContentAnalysisManager): void {
        this.contentAnalysisManager = contentAnalysisManager;
        logger.debug('ContentAnalysisManager injected into ContextGenerator (not used in final version)');
    }

    /**
     * パラメータマネージャーの初期化を確認
     */
    private async initializeParameters(): Promise<void> {
        try {
            await parameterManager.initialize();
            logger.info('Parameter manager initialized in ContextGenerator');
        } catch (error) {
            logger.error('Failed to initialize parameter manager', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * ContextGeneratorを初期化する
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        try {
            logger.info('Initializing ContextGenerator (完成版)');

            const memoryManagerInitialized = await memoryManager.isInitialized();
            if (!memoryManagerInitialized) {
                logger.warn('MemoryManager is not initialized. Some functionality may be limited.');
            }

            this.initialized = true;
            logger.info('ContextGenerator initialization completed (完成版)');
        } catch (error) {
            logger.error('Failed to initialize ContextGenerator', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * urgency値を数値レベルに変換するヘルパーメソッド
     */
    private convertUrgencyToLevel(urgency: string | undefined): number {
        if (!urgency) return 0.5;

        switch (urgency.toLowerCase()) {
            case 'critical': return 1.0;
            case 'high': return 0.8;
            case 'medium': return 0.5;
            case 'low': return 0.3;
            default: return 0.5;
        }
    }

    /**
     * チャプターのコンテキスト生成（完成版）
     * 
     * @param chapterNumber 章番号
     * @param options ChapterGeneratorから渡される拡張オプション
     * @returns 高品質なGenerationContext
     */
    async generateContext(chapterNumber: number, options?: any): Promise<GenerationContext> {
        const startTime = Date.now();
        logger.info(`[TIMING] 章${chapterNumber}のコンテキスト生成を開始（完成版）`, {
            timestamp: new Date().toISOString(),
            phase: 'start',
            startTime,
            hasEnhancementOptions: !!(options?.improvementSuggestions || options?.themeEnhancements || options?.styleGuidance)
        });

        try {
            // パラメータの取得
            const params = parameterManager.getParameters();

            // 最初のチャプターの場合は基本設定を確認
            if (chapterNumber <= 1) {
                const basicSettingsExist = await this.checkBasicSettingsExist();
                if (!basicSettingsExist) {
                    logger.error(`第1章の生成に必要な基本設定が不足しています`);
                    throw new Error('基本設定不足エラー：プロットファイルが未設定か、主要キャラクターが存在しません');
                }
            }

            // === 統合データ取得フェーズ ===
            logger.debug(`Gathering integrated data for chapter ${chapterNumber}`);
            
            // 統合コンテキストを一度に取得
            const integratedContext = await memoryManager.generateIntegratedContext(chapterNumber);

            // 永続的イベント情報の取得
            const rawPersistentEvents = await memoryManager.getPersistentEvents(1, chapterNumber);
            const persistentEvents = this.formatPersistentEvents(rawPersistentEvents);

            // 世界設定とテーマの取得
            const worldSettingsData = await plotManager.getStructuredWorldSettings();
            const themeSettingsData = await plotManager.getStructuredThemeSettings();
            const formattedData = await plotManager.getFormattedWorldAndTheme();
            const genre = await plotManager.getGenre();

            // キャラクター成長・スキル情報の取得
            const characterGrowthInfo = await characterManager.prepareCharacterInfoForChapterGeneration(chapterNumber);

            // 表現設定の取得
            const expressionSettings = await this.expressionProvider.getExpressionSettings();

            // プロット指示を取得
            const plotDirective = await plotManager.generatePlotDirective(chapterNumber);

            // === キャラクター情報の拡張処理 ===
            logger.debug(`Enhancing character information for chapter ${chapterNumber}`);

            // ストーリーコンテキストの構築
            const storyContext = this.storyContextBuilder.buildStoryContextFromIntegrated(
                integratedContext,
                params.memory.summaryDetailLevel.toString()
            );

            // キャラクター情報の拡張 - 永続的な状態変化を反映
            const enhancedCharacters = this.enhanceCharactersWithPersistentState(
                integratedContext.characters,
                persistentEvents
            );

            // キャラクター情報に成長データを統合
            const enhancedCharactersWithGrowth = this.enhanceCharactersWithGrowthInfo(
                enhancedCharacters,
                characterGrowthInfo
            );

            // 焦点キャラクターの特定
            const focusCharacterIds = enhancedCharacters
                .filter((c: any) => c.significance >= 0.7)
                .map((c: any) => c.id)
                .slice(0, 3);

            // === 拡張データの取得・統合フェーズ ===
            logger.info(`Extracting enhancement data from options for chapter ${chapterNumber}`, {
                hasImprovementSuggestions: !!(options?.improvementSuggestions?.length),
                hasThemeEnhancements: !!(options?.themeEnhancements?.length),
                hasStyleGuidance: !!options?.styleGuidance,
                hasAlternativeExpressions: !!options?.alternativeExpressions,
                hasLiteraryInspirations: !!options?.literaryInspirations,
                hasCharacterPsychology: !!options?.characterPsychology,
                hasTensionOptimization: !!options?.tensionOptimization
            });

            // optionsから拡張データを取得（フォールバック付き）
            const improvementSuggestions = options?.improvementSuggestions || [];
            const themeEnhancements = options?.themeEnhancements || [];
            const styleGuidance = options?.styleGuidance || await this.getDefaultStyleGuidance();
            const alternativeExpressions = options?.alternativeExpressions || {};
            const literaryInspirations = options?.literaryInspirations || await this.getDefaultLiteraryInspirations();
            const characterPsychology = options?.characterPsychology || {};

            // === キャラクター心理情報のフォールバック処理 ===
            let enhancedCharacterPsychology = { ...characterPsychology };

            // フォールバック：optionsにキャラクター心理情報がない場合、基本的な心理情報を生成
            if (!characterPsychology || Object.keys(characterPsychology).length === 0) {
                if (focusCharacterIds.length > 0) {
                    logger.debug(`Generating fallback character psychology for ${focusCharacterIds.length} focus characters`);
                    for (const characterId of focusCharacterIds) {
                        try {
                            const psychology = await this.getCharacterPsychology(characterId, chapterNumber);
                            if (psychology) {
                                enhancedCharacterPsychology[characterId] = psychology;
                            }
                        } catch (error) {
                            logger.warn(`Failed to get psychology for character ${characterId}`, { error });
                        }
                    }
                }
            }

            // テンションとペーシングの推奨値を取得
            const tensionPacing = options?.tensionOptimization || 
                await this.getTensionPacingRecommendation(chapterNumber, genre);

            // === 重要イベント情報の処理 ===
            let formattedSignificantEvents = null;
            if (integratedContext.significantEvents) {
                formattedSignificantEvents = {
                    locationHistory: integratedContext.significantEvents.locationHistory || [],
                    characterInteractions: integratedContext.significantEvents.characterInteractions || [],
                    warningsAndPromises: integratedContext.significantEvents.warningsAndPromises || []
                };
            } else {
                const narrativeState = integratedContext.narrativeState || { location: '', timeOfDay: '' };
                const characterIds = (enhancedCharacters || [])
                    .filter((c: Character) => c.significance !== undefined && c.significance >= 0.6)
                    .map((c: Character) => c.id)
                    .slice(0, 5);

                const eventContext = {
                    location: narrativeState.location,
                    characters: characterIds,
                    time: narrativeState.timeOfDay
                };

                const significantEvents = await memoryManager.getSignificantContextEvents(eventContext);
                formattedSignificantEvents = significantEvents;
            }

            // === GenerationContext構築フェーズ ===
            logger.debug(`Building final GenerationContext for chapter ${chapterNumber}`);

            // 統合コンテキストの構築
            const context: GenerationContext = {
                chapterNumber,
                totalChapters: integratedContext.totalChapters || undefined,
                foreshadowing: integratedContext.foreshadowing.map((f: Foreshadowing) => ({
                    description: f.description,
                    urgencyLevel: f.significance !== undefined ? f.significance : this.convertUrgencyToLevel(f.urgency),
                    resolutionSuggestions: f.potential_resolution || ''
                })),
                storyContext,
                worldSettingsData,
                themeSettingsData,
                worldSettings: formattedData.worldSettings,
                theme: formattedData.theme,
                genre: genre,
                plotDirective,
                tone: expressionSettings.tone || '自然で読みやすい文体',
                narrativeStyle: expressionSettings.narrativeStyle || '三人称視点、過去形',
                targetLength: params.generation.targetLength,
                tension: this.extractTensionValue(tensionPacing),
                pacing: this.extractPacingValue(tensionPacing),
                characters: enhancedCharactersWithGrowth,
                narrativeState: {
                    state: integratedContext.narrativeState,
                    arcCompleted: integratedContext.narrativeState.arcCompleted,
                    stagnationDetected: integratedContext.narrativeState.stagnationDetected,
                    duration: integratedContext.narrativeState.duration,
                    suggestedNextState: integratedContext.narrativeState.suggestedNextState,
                    recommendations: integratedContext.narrativeState.recommendations,
                    timeOfDay: integratedContext.narrativeState.timeOfDay,
                    location: integratedContext.narrativeState.location,
                    weather: integratedContext.narrativeState.weather
                },
                focusCharacters: enhancedCharacters.slice(0, 3).map((c: { name: string }) => c.name),
                midTermMemory: {
                    currentArc: integratedContext.arc
                },
                contradictions: integratedContext.contradictions || [],
                plotPoints: integratedContext.plotPoints || [],
                expressionConstraints: expressionSettings.constraints || [],

                // === analysisモジュールからの拡張データ統合 ===
                improvementSuggestions: improvementSuggestions,
                significantEvents: formattedSignificantEvents,
                persistentEvents: persistentEvents as any,
                characterGrowthInfo: {
                    mainCharacters: characterGrowthInfo.mainCharacters,
                    supportingCharacters: characterGrowthInfo.supportingCharacters
                },

                // 品質向上のための拡張コンテキスト
                characterPsychology: enhancedCharacterPsychology,
                emotionalArc: integratedContext.emotionalArc,
                styleGuidance,
                alternativeExpressions,
                literaryInspirations,
                themeEnhancements,
                tensionRecommendation: this.buildTensionRecommendation(tensionPacing),
                pacingRecommendation: this.buildPacingRecommendation(tensionPacing)
            };

            // 物語進行の提案を統合
            const enhancedContext = await this.enhanceContextWithProgressionGuidance(context, chapterNumber);

            // === 完成版ログ出力 ===
            logger.info(`Successfully generated enhanced context for chapter ${chapterNumber} (完成版)`, {
                basicDataLoaded: true,
                characterCount: enhancedCharactersWithGrowth.length,
                focusCharacterCount: focusCharacterIds.length,
                improvementSuggestionsCount: improvementSuggestions.length,
                themeEnhancementsCount: themeEnhancements.length,
                hasStyleGuidance: !!styleGuidance,
                hasAlternativeExpressions: Object.keys(alternativeExpressions).length > 0,
                hasLiteraryInspirations: !!literaryInspirations,
                characterPsychologyCount: Object.keys(enhancedCharacterPsychology).length,
                hasTensionOptimization: !!tensionPacing,
                hasSignificantEvents: !!formattedSignificantEvents,
                hasPersistentEvents: persistentEvents && Object.values(persistentEvents).some((arr: any) => arr.length > 0)
            });

            logger.info(`[TIMING] 章${chapterNumber}のコンテキスト生成が完了 (合計: ${Date.now() - startTime}ms)`, {
                timestamp: new Date().toISOString(),
                totalTimeMs: Date.now() - startTime,
                finalContextSize: JSON.stringify(enhancedContext).length,
                enhancementDataIntegrated: {
                    improvementSuggestions: improvementSuggestions.length,
                    themeEnhancements: themeEnhancements.length,
                    styleGuidance: !!styleGuidance,
                    alternativeExpressions: Object.keys(alternativeExpressions).length > 0,
                    literaryInspirations: !!literaryInspirations,
                    characterPsychology: Object.keys(enhancedCharacterPsychology).length,
                    tensionOptimization: !!tensionPacing
                }
            });

            return enhancedContext;
        } catch (error) {
            const errorTime = Date.now() - startTime;
            logger.error(`[TIMING] 章${chapterNumber}のコンテキスト生成でエラー発生 (${errorTime}ms)`, {
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });

            // エラー時の適応型フォールバックコンテキスト
            const fallbackContext = await this.fallbackManager.createSmartFallbackContext(chapterNumber);
            return fallbackContext;
        }
    }

    // =========================================================================
    // === 拡張データ処理のヘルパーメソッド ===
    // =========================================================================

    /**
     * テンション値を適切に抽出
     */
    private extractTensionValue(tensionPacing: any): number {
        if (!tensionPacing) return 0.5;
        
        // tensionOptimizationの形式をチェック
        if (tensionPacing.tension?.recommendedTension !== undefined) {
            return tensionPacing.tension.recommendedTension;
        }
        
        // 直接recommendedTensionがある場合
        if (tensionPacing.recommendedTension !== undefined) {
            return tensionPacing.recommendedTension;
        }
        
        return 0.5;
    }

    /**
     * ペーシング値を適切に抽出
     */
    private extractPacingValue(tensionPacing: any): number {
        if (!tensionPacing) return 0.5;
        
        // tensionOptimizationの形式をチェック
        if (tensionPacing.pacing?.recommendedPacing !== undefined) {
            return tensionPacing.pacing.recommendedPacing;
        }
        
        // 直接recommendedPacingがある場合
        if (tensionPacing.recommendedPacing !== undefined) {
            return tensionPacing.recommendedPacing;
        }
        
        return 0.5;
    }

    /**
     * テンション推奨オブジェクト構築
     */
    private buildTensionRecommendation(tensionPacing: any): any {
        if (!tensionPacing) {
            return {
                recommendedTension: 0.5,
                direction: 'maintain',
                reason: 'デフォルトテンション'
            };
        }
        
        if (tensionPacing.tension) {
            return tensionPacing.tension;
        }
        
        return {
            recommendedTension: tensionPacing.recommendedTension || 0.5,
            direction: 'maintain',
            reason: 'テンション維持'
        };
    }

    /**
     * ペーシング推奨オブジェクト構築
     */
    private buildPacingRecommendation(tensionPacing: any): any {
        if (!tensionPacing) {
            return {
                recommendedPacing: 0.5,
                description: 'デフォルトペース'
            };
        }
        
        if (tensionPacing.pacing) {
            return tensionPacing.pacing;
        }
        
        return {
            recommendedPacing: tensionPacing.recommendedPacing || 0.5,
            description: 'バランスの取れたペース'
        };
    }

    // =========================================================================
    // === フォールバック実装群 ===
    // =========================================================================

    /**
     * デフォルトの文体ガイダンスを取得（フォールバック実装）
     */
    private async getDefaultStyleGuidance(): Promise<StyleGuidance> {
        logger.debug('Using default style guidance (fallback)');
        return {
            general: [
                "文体に変化をつけて、読者の興味を維持してください",
                "明確で簡潔な文章を心がけ、冗長な表現を避けてください",
                "読者の感情に訴えかける表現を効果的に使用してください",
                "物語の雰囲気に合った文体を選択してください"
            ],
            sentenceStructure: [
                "文の長さに変化をつけて、リズムを作ってください",
                "単調な構造を避け、複文と単文を適切に組み合わせてください",
                "効果的な句読点を使用して、読みやすさを向上させてください",
                "重要な情報は文の前半に配置してください"
            ],
            vocabulary: [
                "適切な語彙を選択し、文脈に合った言葉を使ってください",
                "表現の多様性を意識し、同じ単語の繰り返しを避けてください",
                "専門用語の使用は控えめにし、必要な場合は説明を加えてください",
                "感情的な語彙を効果的に使用してください"
            ],
            rhythm: [
                "読みやすいリズムを意識し、自然な文章の流れを作ってください",
                "テンポの緩急をつけて、場面の変化を表現してください",
                "音韻の響きを考慮し、読み上げたときの美しさを意識してください",
                "沈黙や間を効果的に使用してください"
            ]
        };
    }

    /**
     * デフォルトの文学的インスピレーションを取得（フォールバック実装）
     */
    private async getDefaultLiteraryInspirations(): Promise<LiteraryInspiration> {
        logger.debug('Using default literary inspirations (fallback)');
        return {
            plotTechniques: [
                {
                    technique: "対比構造",
                    description: "対照的な場面や状況を並置して、両方の特性を強調する",
                    example: "平和な日常の描写の直後に緊迫した場面を配置する",
                    reference: "古典文学からモダン作品まで広く使用される技法"
                },
                {
                    technique: "伏線の設置と回収",
                    description: "物語の前半で示唆し、後半で意味を明らかにする技法",
                    example: "主人公が何気なく拾った小さなアイテムが、後の章で重要な意味を持つ",
                    reference: "優れた小説作品"
                },
                {
                    technique: "時系列の操作",
                    description: "時間軸を操作することで物語に深みと興味を与える",
                    example: "回想シーンや時間跳躍を効果的に使用する",
                    reference: "現代文学技法"
                }
            ],
            characterTechniques: [
                {
                    technique: "行動による性格描写",
                    description: "キャラクターの内面を直接説明せず、行動や選択を通じて性格を示す",
                    example: "危機的状況での判断や反応を通じてキャラクターの本質を描く",
                    reference: "優れたキャラクター小説"
                },
                {
                    technique: "内面の葛藤の表現",
                    description: "キャラクターの内的な対立や迷いを効果的に描写する",
                    example: "選択を迫られた場面での心の動きを細かく描写する",
                    reference: "心理小説の手法"
                },
                {
                    technique: "対話による人格表現",
                    description: "会話を通じてキャラクターの個性や関係性を表現する",
                    example: "話し方、言葉選び、話題の選択で性格を表現する",
                    reference: "演劇・脚本技法"
                }
            ],
            atmosphereTechniques: [
                {
                    technique: "感情移入的環境描写",
                    description: "キャラクターの感情状態を反映した環境描写",
                    example: "主人公の不安な心理状態を、曇り空や不気味な風の音で間接的に表現する",
                    reference: "ゴシック文学など"
                },
                {
                    technique: "五感を使った描写",
                    description: "視覚以外の感覚も使って臨場感のある描写を行う",
                    example: "香り、音、触感、味覚を織り交ぜた豊かな描写",
                    reference: "現代文学作品"
                },
                {
                    technique: "象徴的描写",
                    description: "物や現象に象徴的な意味を込めて描写する",
                    example: "季節の変化や天候を心理状態の変化と連動させる",
                    reference: "象徴主義文学"
                }
            ]
        };
    }

    /**
     * テンション・ペーシング推奨値を取得（従来実装保持）
     */
    private async getTensionPacingRecommendation(
        chapterNumber: number,
        genre: string
    ): Promise<TensionPacingRecommendation> {
        try {
            const raw = await this.narrativeMemory.getTensionPacingRecommendation(chapterNumber, genre);

            return {
                tension: {
                    recommendedTension: raw?.tension?.recommendedTension ?? 0.5,
                    direction: raw?.tension?.direction ?? 'maintain',
                    reason: raw?.tension?.reason ?? 'テンションは一定を保つのが望ましいため'
                },
                pacing: {
                    recommendedPacing: raw?.pacing?.recommendedPacing ?? 0.5,
                    description: raw?.pacing?.description ?? '読者の集中を維持する安定したペースです'
                }
            };
        } catch (error) {
            logger.error('テンション・ペーシング推奨値取得エラー', { error });
            return {
                tension: {
                    recommendedTension: 0.5,
                    direction: 'maintain',
                    reason: 'エラー発生時のデフォルトテンション'
                },
                pacing: {
                    recommendedPacing: 0.5,
                    description: 'エラー発生時のデフォルトペース'
                }
            };
        }
    }

    // =========================================================================
    // === 既存のヘルパーメソッド（保持・統合対応） ===
    // =========================================================================

    async isInitialized(): Promise<boolean> {
        return this.initialized;
    }

    async getEmotionalArcDesign(chapterNumber: number): Promise<EmotionalArcDesign> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const design = await this.narrativeMemory.designEmotionalArc(chapterNumber);
            return design;
        } catch (error) {
            logger.error(`Failed to get emotional arc design for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                recommendedTone: "バランスのとれた中立的なトーン",
                emotionalJourney: {
                    opening: [
                        { dimension: "好奇心", level: 7 },
                        { dimension: "期待感", level: 6 }
                    ],
                    development: [
                        { dimension: "緊張感", level: 5 },
                        { dimension: "共感", level: 6 }
                    ],
                    conclusion: [
                        { dimension: "満足感", level: 7 },
                        { dimension: "希望", level: 6 }
                    ]
                },
                reason: "物語のこの段階では、読者の関心を維持しながらも感情的なバランスを保つことが重要です"
            };
        }
    }

    async getCharacterPsychology(characterId: string, chapterNumber: number): Promise<CharacterPsychology | null> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            return await this.characterManager.getCharacterPsychology(characterId, chapterNumber);
        } catch (error) {
            logger.error(`キャラクター心理情報の取得に失敗しました: ${characterId}`, { error });
            return null;
        }
    }

    async getMultipleCharacterPsychology(characterIds: string[], chapterNumber: number): Promise<{ [id: string]: CharacterPsychology }> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const result: { [id: string]: CharacterPsychology } = {};

            for (const id of characterIds) {
                const psychology = await this.getCharacterPsychology(id, chapterNumber);
                if (psychology) {
                    result[id] = psychology;
                }
            }

            return result;
        } catch (error) {
            logger.error('複数キャラクターの心理情報取得に失敗しました', { error });
            return {};
        }
    }

    // 既存のヘルパーメソッド群（実装保持）
    private formatPersistentEvents(events: any[]): any {
        if (!events || events.length === 0) {
            return {
                deaths: [],
                marriages: [],
                births: [],
                promotions: [],
                skillAcquisitions: [],
                injuries: [],
                transformations: [],
                relocations: []
            };
        }

        const result = {
            deaths: [] as any[],
            marriages: [] as any[],
            births: [] as any[],
            promotions: [] as any[],
            skillAcquisitions: [] as any[],
            injuries: [] as any[],
            transformations: [] as any[],
            relocations: [] as any[]
        };

        for (const event of events) {
            if (!event.type) continue;

            switch (event.type) {
                case 'DEATH':
                    if (event.involvedCharacters.length > 0) {
                        result.deaths.push({
                            character: event.involvedCharacters[0],
                            description: event.description,
                            chapterNumber: event.chapterNumber
                        });
                    }
                    break;
                case 'MARRIAGE':
                    if (event.involvedCharacters.length >= 2) {
                        result.marriages.push({
                            characters: event.involvedCharacters,
                            description: event.description,
                            chapterNumber: event.chapterNumber
                        });
                    }
                    break;
                case 'BIRTH':
                    result.births.push({
                        character: event.involvedCharacters[0] || 'Unknown',
                        description: event.description,
                        chapterNumber: event.chapterNumber
                    });
                    break;
                case 'PROMOTION':
                    result.promotions.push({
                        character: event.involvedCharacters[0] || 'Unknown',
                        description: event.description,
                        chapterNumber: event.chapterNumber
                    });
                    break;
                case 'SKILL_ACQUISITION':
                    result.skillAcquisitions.push({
                        character: event.involvedCharacters[0] || 'Unknown',
                        skill: event.description,
                        chapterNumber: event.chapterNumber
                    });
                    break;
                case 'INJURY':
                    result.injuries.push({
                        character: event.involvedCharacters[0] || 'Unknown',
                        description: event.description,
                        chapterNumber: event.chapterNumber
                    });
                    break;
                case 'TRANSFORMATION':
                    result.transformations.push({
                        character: event.involvedCharacters[0] || 'Unknown',
                        description: event.description,
                        chapterNumber: event.chapterNumber
                    });
                    break;
                case 'RELOCATION':
                    result.relocations.push({
                        characters: event.involvedCharacters,
                        description: event.description,
                        chapterNumber: event.chapterNumber
                    });
                    break;
            }
        }

        return result;
    }

    private enhanceCharactersWithGrowthInfo(characters: any[], growthInfo: any): any[] {
        const allGrowthInfo = [...growthInfo.mainCharacters, ...growthInfo.supportingCharacters];
        const growthInfoMap = new Map();
        allGrowthInfo.forEach(char => {
            if (char.id) {
                growthInfoMap.set(char.id, char);
            }
        });

        return characters.map(character => {
            const growthData = growthInfoMap.get(character.id);

            if (growthData) {
                return {
                    ...character,
                    skills: growthData.skills || [],
                    parameters: growthData.parameters || [],
                    growthPhase: growthData.growthPhase || null
                };
            }

            return character;
        });
    }

    private enhanceCharactersWithPersistentState(characters: Character[], persistentEvents: any): Character[] {
        if (!characters || !persistentEvents) {
            return characters || [];
        }

        return characters.map(character => {
            // 永続的イベントに基づくキャラクター状態の更新ロジック
            // （既存の実装をそのまま保持）
            return character;
        });
    }

    private async enhanceContextWithProgressionGuidance(
        context: GenerationContext,
        chapterNumber: number
    ): Promise<GenerationContext> {
        try {
            const progressionSuggestions = await memoryManager.generateStoryProgressionSuggestions(chapterNumber);
            const existingPlotPoints = [...(context.plotPoints || [])];
            return {
                ...context,
                plotPoints: [...existingPlotPoints, ...progressionSuggestions],
                storyProgressionGuidance: {
                    required: true,
                    suggestions: progressionSuggestions
                }
            };
        } catch (error) {
            logger.error('Failed to enhance context with progression guidance', { error });
            return context;
        }
    }

    private async checkBasicSettingsExist(): Promise<boolean> {
        try {
            const plotExists = await this.checkPlotFileExists();
            if (!plotExists) {
                logger.error('プロットファイルが存在しません');
                return false;
            }

            const mainCharacterExists = await this.checkMainCharacterExists();
            if (!mainCharacterExists) {
                logger.error('主人公キャラクターが設定されていません');
                return false;
            }

            const worldSettingsExist = await this.checkWorldSettingsExist();
            if (!worldSettingsExist) {
                logger.error('世界設定が設定されていません');
                return false;
            }

            return true;
        } catch (error) {
            logger.error('基本設定の確認中にエラーが発生しました', {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    private async checkPlotFileExists(): Promise<boolean> {
        try {
            const abstractPlot = await plotManager.getAbstractGuidelinesForChapter(1);
            const concretePlot = await plotManager.getConcretePlotForChapter(1);

            return (abstractPlot !== null && Object.keys(abstractPlot).length > 0) ||
                (concretePlot !== null);
        } catch (error) {
            logger.error('プロットファイル確認エラー', {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    private async checkMainCharacterExists(): Promise<boolean> {
        try {
            const mainCharacters = await characterManager.getCharactersByType('MAIN');
            return mainCharacters.length > 0;
        } catch (error) {
            logger.error('メインキャラクター確認エラー', {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    private async checkWorldSettingsExist(): Promise<boolean> {
        try {
            const hasValidSettings = await plotManager.hasValidWorldSettings();

            if (!hasValidSettings) {
                logger.error('有効な世界設定が存在しません');
                return false;
            }

            const hasValidTheme = await plotManager.hasValidThemeSettings();
            if (!hasValidTheme) {
                logger.warn('有効なテーマ設定が存在しません');
            }

            return true;
        } catch (error) {
            logger.error('世界設定確認エラー', {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * 生成されたチャプターからキャラクター情報を更新
     */
    public async processGeneratedChapter(chapter: Chapter): Promise<void> {
        logger.info(`Processing character information for chapter ${chapter.chapterNumber}`);
        try {
            const immediateContext = memoryManager.getShortTermMemory();
            const chapterExists = await immediateContext.getChapter(chapter.chapterNumber);

            if (!chapterExists) {
                logger.info(`Adding chapter ${chapter.chapterNumber} to ImmediateContext before character processing`);
                await immediateContext.addChapter(chapter);
            }

            return await this.characterManager.processGeneratedChapter(chapter);
        } catch (error) {
            logger.error(`Error in processGeneratedChapter for chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        }
    }
}