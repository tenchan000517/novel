// src/lib/plot/story-generation-bridge.ts

import {
    ChapterDirectives, CharacterState, StoryGenerationContext,
    BridgeAnalysisResult, PromptElements, PlotProgressInfo
} from './bridge-types';
import { ConcretePlotPoint, AbstractPlotGuideline } from './types';
import { Chapter } from '@/types/chapters';
import { logger } from '@/lib/utils/logger';
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { 
    MemoryLevel, 
    MemoryRequestType,
    UnifiedSearchResult,
    SystemOperationResult 
} from '@/lib/memory/core/types';
import { 
    NarrativeState, 
    NarrativeStateInfo,
    EmotionalCurvePoint 
} from '@/lib/memory/long-term/types';
import { KeyEvent } from '@/types/memory';

interface SafeMemoryOperationOptions {
    useMemorySystemIntegration: boolean;
    fallbackStrategy: 'conservative' | 'optimistic';
    timeoutMs: number;
    retryAttempts: number;
}

/**
 * パフォーマンス統計の型定義
 */
interface PerformanceMetrics {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageProcessingTime: number;
    memorySystemHits: number;
    cacheEfficiencyRate: number;
    lastOptimization: string;
}

/**
 * @class StoryGenerationBridge
 * @description
 * 物語生成プロセスにおいて、プロットデータと統合記憶システムの情報を橋渡しし、
 * 次のチャプター生成に必要な具体的指示を提供するクラス。
 * 新しい記憶階層システムの能力を最大限活用した完全統合実装。
 * 
 * @role
 * - 統合記憶階層システムとプロットシステムの完全橋渡し
 * - 次のチャプター生成に必要な情報の選別・整理・最適化
 * - プロンプトのプレースホルダーに挿入する具体的内容の提供
 * - エラー処理とフォールバック戦略の完全実装
 */
export class StoryGenerationBridge {
    private memoryManager: MemoryManager;
    private operationOptions: SafeMemoryOperationOptions;
    
    // パフォーマンス統計（明示的型定義）
    private performanceMetrics: PerformanceMetrics = {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageProcessingTime: 0,
        memorySystemHits: 0,
        cacheEfficiencyRate: 0,
        lastOptimization: new Date().toISOString()
    };

    /**
     * コンストラクタ
     * @param memoryManager 統合記憶管理システム
     * @param options 安全な記憶操作オプション
     */
    constructor(
        memoryManager: MemoryManager,
        options: Partial<SafeMemoryOperationOptions> = {}
    ) {
        this.memoryManager = memoryManager;
        this.operationOptions = {
            useMemorySystemIntegration: true,
            fallbackStrategy: 'optimistic',
            timeoutMs: 30000,
            retryAttempts: 3,
            ...options
        };

        logger.info('StoryGenerationBridge initialized with unified memory system integration');
    }

    /**
     * 章の生成に必要な指示を生成する
     * @param chapterNumber 対象の章番号
     * @param concretePlot 具体的プロット
     * @param abstractGuideline 抽象的ガイドライン
     * @param narrativeState 物語状態情報
     * @param phaseInfo 物語フェーズ情報（オプション）
     * @returns 章指示情報
     */
    async generateChapterDirectives(
        chapterNumber: number,
        concretePlot: ConcretePlotPoint | null,
        abstractGuideline: AbstractPlotGuideline,
        narrativeState: NarrativeStateInfo | null = null,
        phaseInfo: any = null
    ): Promise<ChapterDirectives> {
        const startTime = Date.now();
        
        try {
            this.performanceMetrics.totalOperations++;
            
            logger.info(`[StoryGenerationBridge] 章${chapterNumber}の指示を統合記憶システムで生成開始`);

            // 統合記憶システムから包括的状態を取得
            const memoryState = await this.fetchIntegratedMemoryState(chapterNumber);

            // 最新の物語状態を取得（引数で渡されていない場合）
            if (!narrativeState) {
                narrativeState = memoryState.narrativeState;
            }

            // 統合分析を実行
            const analysisResult = await this.analyzeIntegratedContext({
                chapterNumber,
                plotElements: {
                    concrete: concretePlot,
                    abstract: abstractGuideline,
                },
                memoryElements: memoryState,
                worldSettings: await this.fetchConsolidatedWorldSettings(),
                themeSettings: await this.fetchConsolidatedThemeSettings(),
                phaseInfo
            });

            // 章の目標を決定
            const chapterGoal = this.determineChapterGoal(
                concretePlot,
                abstractGuideline,
                analysisResult,
                phaseInfo
            );

            // 必須プロット要素を抽出
            const requiredPlotElements = this.extractRequiredPlotElements(
                concretePlot,
                abstractGuideline,
                analysisResult
            );

            // 現在の場所を決定
            const currentLocation = this.determineCurrentLocation(narrativeState, concretePlot);

            // 現在の状況を記述
            const currentSituation = this.determineCurrentSituation(narrativeState, memoryState.shortTerm);

            // 活動中のキャラクターを特定
            const activeCharacters = await this.identifyActiveCharacters(
                chapterNumber,
                concretePlot,
                memoryState
            );

            // 世界設定の焦点を決定
            const worldElementsFocus = this.determineWorldElementsFocus(
                concretePlot,
                abstractGuideline,
                memoryState
            );

            // テーマ的焦点を決定
            const thematicFocus = this.determineThematicFocus(
                abstractGuideline,
                analysisResult
            );

            // 感情曲線を取得
            const emotionalCurve = await this.fetchEmotionalCurve(chapterNumber);

            // 結果の構築
            const directives: ChapterDirectives = {
                chapterGoal,
                requiredPlotElements,
                currentLocation,
                currentSituation,
                activeCharacters,
                worldElementsFocus,
                thematicFocus,
                narrativeState,
                tension: narrativeState.tensionLevel || this.calculateRecommendedTension(analysisResult, narrativeState),
                emotionalGoal: this.determineEmotionalGoal(abstractGuideline, narrativeState, analysisResult),
                emotionalCurve
            };

            // 提案シーンを追加（オプション）
            if (analysisResult.suggestedAdjustments.length > 0) {
                directives.suggestedScenes = this.suggestScenes(
                    concretePlot,
                    abstractGuideline,
                    narrativeState,
                    analysisResult
                );
            }

            // パフォーマンス統計を更新
            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, true);

            logger.debug(`[StoryGenerationBridge] 章${chapterNumber}の指示生成完了`, {
                chapterGoal: directives.chapterGoal,
                elementsCount: directives.requiredPlotElements.length,
                charactersCount: directives.activeCharacters.length,
                processingTime
            });

            return directives;

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, false);
            
            logger.error(`[StoryGenerationBridge] 章${chapterNumber}の指示生成中にエラーが発生しました`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber,
                processingTime
            });

            // 強化されたフォールバック指示を生成
            return this.generateEnhancedFallbackDirectives(chapterNumber, abstractGuideline, narrativeState, error);
        }
    }

    /**
     * 統合記憶システムから状態を取得
     * @param chapterNumber 章番号
     * @returns 統合記憶状態
     */
    private async fetchIntegratedMemoryState(chapterNumber: number): Promise<{
        shortTerm: any,
        midTerm: any,
        longTerm: any,
        narrativeState: NarrativeStateInfo
    }> {
        return await this.safeMemoryOperation(
            async () => {
                // 統合検索による包括的データ取得
                const searchResults = await this.memoryManager.unifiedSearch(
                    `chapter context data for chapter ${chapterNumber}`,
                    [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
                );

                if (!searchResults.success) {
                    throw new Error('Unified search failed');
                }

                // システム状態から追加情報を取得
                const systemStatus = await this.memoryManager.getSystemStatus();

                // 物語状態の構築
                const narrativeState = this.constructNarrativeState(chapterNumber, searchResults, systemStatus);

                return {
                    shortTerm: this.extractShortTermData(searchResults),
                    midTerm: this.extractMidTermData(searchResults),
                    longTerm: this.extractLongTermData(searchResults),
                    narrativeState
                };
            },
            {
                shortTerm: { recentChapters: [], currentChapter: null, importantEvents: [] },
                midTerm: { currentArc: null },
                longTerm: { summaries: [] },
                narrativeState: this.createDefaultNarrativeState(chapterNumber)
            },
            'fetchIntegratedMemoryState'
        );
    }

    /**
     * 物語状態を構築
     * @private
     */
    private constructNarrativeState(
        chapterNumber: number, 
        searchResults: UnifiedSearchResult,
        systemStatus: any
    ): NarrativeStateInfo {
        // 検索結果から物語状態情報を抽出
        const narrativeData = searchResults.results.find(r => 
            r.type === 'narrative' || r.metadata?.source === 'midTerm'
        );

        if (narrativeData?.data) {
            // 型安全な物語状態の構築
            const baseState: NarrativeStateInfo = {
                state: this.mapStringToNarrativeState(narrativeData.data.state) || NarrativeState.DAILY_LIFE,
                tensionLevel: narrativeData.data.tensionLevel || 5,
                stagnationDetected: narrativeData.data.stagnationDetected || false,
                duration: narrativeData.data.duration || 1,
                location: narrativeData.data.location || '不特定の場所',
                timeOfDay: narrativeData.data.timeOfDay || '昼間',
                weather: narrativeData.data.weather || '晴れ',
                presentCharacters: narrativeData.data.presentCharacters || [],
                genre: narrativeData.data.genre || '未定義',
                currentArcNumber: narrativeData.data.currentArcNumber || Math.ceil(chapterNumber / 10),
                currentTheme: narrativeData.data.currentTheme || `第${Math.ceil(chapterNumber / 10)}アークのテーマ`,
                arcStartChapter: narrativeData.data.arcStartChapter || Math.max(1, (Math.ceil(chapterNumber / 10) - 1) * 10 + 1),
                arcEndChapter: narrativeData.data.arcEndChapter || Math.ceil(chapterNumber / 10) * 10,
                arcCompleted: narrativeData.data.arcCompleted || false,
                turningPoints: narrativeData.data.turningPoints || []
            };

            return baseState;
        }

        // フォールバック: デフォルト状態を作成
        return this.createDefaultNarrativeState(chapterNumber);
    }

    /**
     * 文字列をNarrativeState enumにマップ
     * @private
     */
    private mapStringToNarrativeState(stateString: string): NarrativeState | null {
        // NarrativeState enumの値と照合
        const stateMapping: { [key: string]: NarrativeState } = {
            'INTRODUCTION': NarrativeState.INTRODUCTION,
            'DAILY_LIFE': NarrativeState.DAILY_LIFE,
            'JOURNEY': NarrativeState.JOURNEY,
            'PRE_BATTLE': NarrativeState.PRE_BATTLE,
            'BATTLE': NarrativeState.BATTLE,
            'POST_BATTLE': NarrativeState.POST_BATTLE,
            'INVESTIGATION': NarrativeState.INVESTIGATION,
            'TRAINING': NarrativeState.TRAINING,
            'REVELATION': NarrativeState.REVELATION,
            'DILEMMA': NarrativeState.DILEMMA,
            'RESOLUTION': NarrativeState.RESOLUTION,
            'CLOSURE': NarrativeState.CLOSURE,
            'BUSINESS_MEETING': NarrativeState.BUSINESS_MEETING,
            'PRODUCT_DEVELOPMENT': NarrativeState.PRODUCT_DEVELOPMENT,
            'PITCH_PRESENTATION': NarrativeState.PITCH_PRESENTATION,
            'MARKET_RESEARCH': NarrativeState.MARKET_RESEARCH,
            'TEAM_BUILDING': NarrativeState.TEAM_BUILDING,
            'FUNDING_ROUND': NarrativeState.FUNDING_ROUND,
            'BUSINESS_PIVOT': NarrativeState.BUSINESS_PIVOT,
            'CUSTOMER_DISCOVERY': NarrativeState.CUSTOMER_DISCOVERY,
            'PRODUCT_LAUNCH': NarrativeState.PRODUCT_LAUNCH,
            'MARKET_COMPETITION': NarrativeState.MARKET_COMPETITION,
            'STRATEGIC_PREPARATION': NarrativeState.STRATEGIC_PREPARATION,
            'PERFORMANCE_REVIEW': NarrativeState.PERFORMANCE_REVIEW,
            'BUSINESS_DEVELOPMENT': NarrativeState.BUSINESS_DEVELOPMENT,
            'SKILL_DEVELOPMENT': NarrativeState.SKILL_DEVELOPMENT,
            'FINANCIAL_CHALLENGE': NarrativeState.FINANCIAL_CHALLENGE,
            'EXPANSION_PHASE': NarrativeState.EXPANSION_PHASE,
            'ACQUISITION_NEGOTIATION': NarrativeState.ACQUISITION_NEGOTIATION,
            'CULTURE_BUILDING': NarrativeState.CULTURE_BUILDING,
            'CRISIS_MANAGEMENT': NarrativeState.CRISIS_MANAGEMENT,
            'MARKET_ENTRY': NarrativeState.MARKET_ENTRY,
            'REGULATORY_COMPLIANCE': NarrativeState.REGULATORY_COMPLIANCE,
            'PARTNERSHIP_DEVELOPMENT': NarrativeState.PARTNERSHIP_DEVELOPMENT,
            'MARKET_SCALING': NarrativeState.MARKET_SCALING
        };

        return stateMapping[stateString] || null;
    }

    /**
     * 短期記憶データを抽出
     * @private
     */
    private extractShortTermData(searchResults: UnifiedSearchResult): any {
        const shortTermResults = searchResults.results.filter(r => 
            r.source === MemoryLevel.SHORT_TERM || r.metadata?.source === 'shortTerm'
        );

        return {
            recentChapters: shortTermResults.filter(r => r.type === 'chapter').map(r => r.data),
            currentChapter: shortTermResults.find(r => r.type === 'current')?.data || null,
            importantEvents: shortTermResults.filter(r => r.type === 'event').map(r => {
                // KeyEvent型に適合するように変換
                const eventData = r.data;
                return {
                    chapter: eventData.chapter || 0,
                    event: eventData.title || eventData.name || eventData.event || 'Unknown Event',
                    significance: eventData.significance || r.relevance || 0.5
                } as KeyEvent;
            })
        };
    }

    /**
     * 中期記憶データを抽出
     * @private
     */
    private extractMidTermData(searchResults: UnifiedSearchResult): any {
        const midTermResults = searchResults.results.filter(r => 
            r.source === MemoryLevel.MID_TERM || r.metadata?.source === 'midTerm'
        );

        return {
            currentArc: midTermResults.find(r => r.type === 'arc')?.data || null,
            analysisResults: midTermResults.filter(r => r.type === 'analysis').map(r => r.data),
            characterEvolution: midTermResults.filter(r => r.type === 'character').map(r => r.data)
        };
    }

    /**
     * 長期記憶データを抽出
     * @private
     */
    private extractLongTermData(searchResults: UnifiedSearchResult): any {
        const longTermResults = searchResults.results.filter(r => 
            r.source === MemoryLevel.LONG_TERM || r.metadata?.source === 'longTerm'
        );

        return {
            summaries: longTermResults.filter(r => r.type === 'summary').map(r => r.data),
            worldKnowledge: longTermResults.filter(r => r.type === 'world').map(r => r.data),
            characters: longTermResults.filter(r => r.type === 'character').map(r => r.data)
        };
    }

    /**
     * 感情曲線データを取得
     * @param chapterNumber 章番号
     * @returns 感情曲線データ
     */
    private async fetchEmotionalCurve(chapterNumber: number): Promise<EmotionalCurvePoint[] | undefined> {
        return await this.safeMemoryOperation(
            async () => {
                const searchResults = await this.memoryManager.unifiedSearch(
                    `emotional curve tension history chapters ${Math.max(1, chapterNumber - 5)} to ${chapterNumber - 1}`,
                    [MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
                );

                if (!searchResults.success || searchResults.results.length === 0) {
                    return undefined;
                }

                // 感情曲線データを抽出・構築
                const emotionalData = searchResults.results
                    .filter(r => r.type === 'emotional' || r.type === 'tension')
                    .map(r => r.data)
                    .filter(data => data && typeof data === 'object');

                if (emotionalData.length === 0) {
                    return undefined;
                }

                // EmotionalCurvePointの配列を構築
                return emotionalData.map((data, index) => ({
                    chapter: data.chapter || (Math.max(1, chapterNumber - 5) + index),
                    emotion: data.emotion || data.emotionalTone || 'neutral',
                    tension: data.tension || data.tensionLevel || 5,
                    event: data.event || data.description || undefined
                })).slice(0, 5); // 最新5章分
            },
            undefined,
            'fetchEmotionalCurve'
        );
    }

    /**
     * 統合世界設定を取得
     * @returns 統合済み世界設定情報
     */
    private async fetchConsolidatedWorldSettings(): Promise<any> {
        return await this.safeMemoryOperation(
            async () => {
                const searchResults = await this.memoryManager.unifiedSearch(
                    'world settings configuration genre environment',
                    [MemoryLevel.LONG_TERM]
                );

                if (!searchResults.success) {
                    return {};
                }

                // 世界設定を統合
                const worldResults = searchResults.results.filter(r => 
                    r.type === 'world' || r.type === 'settings' || r.type === 'knowledge'
                );

                const consolidatedSettings: any = {};

                for (const result of worldResults) {
                    if (result.data && typeof result.data === 'object') {
                        Object.assign(consolidatedSettings, result.data);
                    }
                }

                return consolidatedSettings;
            },
            {},
            'fetchConsolidatedWorldSettings'
        );
    }

    /**
     * 統合テーマ設定を取得
     * @returns 統合済みテーマ設定情報
     */
    private async fetchConsolidatedThemeSettings(): Promise<any> {
        return await this.safeMemoryOperation(
            async () => {
                const searchResults = await this.memoryManager.unifiedSearch(
                    'theme narrative tone emotional genre setting',
                    [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM]
                );

                if (!searchResults.success) {
                    return {};
                }

                // テーマ設定を統合
                const themeResults = searchResults.results.filter(r => 
                    r.type === 'theme' || r.type === 'narrative' || r.metadata?.category === 'theme'
                );

                const consolidatedThemes: any = {};

                for (const result of themeResults) {
                    if (result.data && typeof result.data === 'object') {
                        Object.assign(consolidatedThemes, result.data);
                    }
                }

                return consolidatedThemes;
            },
            {},
            'fetchConsolidatedThemeSettings'
        );
    }

    /**
     * 統合コンテキストの分析を行う
     * @param context 統合コンテキスト
     * @returns 分析結果
     */
    private async analyzeIntegratedContext(context: StoryGenerationContext): Promise<BridgeAnalysisResult> {
        const { chapterNumber, plotElements, memoryElements, phaseInfo } = context;

        try {
            // プロット進行の一致度計算
            const plotProgressAlignment = this.calculatePlotAlignment(
                plotElements.concrete,
                memoryElements.shortTerm.importantEvents || []
            );

            // テンション投影の計算
            const tensionProjection = this.projectTension(
                memoryElements.narrativeState.tensionLevel || 5,
                plotElements.abstract,
                phaseInfo
            );

            // 次に重要な要素の特定
            const keyElementsForNext = this.identifyKeyElements(context);

            // 物語の方向性決定
            const narrativeDirection = this.determineNarrativeDirection(context);

            // 提案される調整を生成
            const suggestedAdjustments = this.generateSuggestedAdjustments(context);

            // 継続性を保つべき要素
            const continuityElements = this.identifyContinuityElements(context);

            // 推奨されるペース
            const recommendedPacing = this.determinePacing(context);

            return {
                plotProgressAlignment,
                suggestedAdjustments,
                keyElementsForNext,
                narrativeDirection,
                tensionProjection,
                continuityElements,
                recommendedPacing
            };

        } catch (error) {
            logger.warn('Context analysis partially failed, using fallback analysis', { error });
            
            // フォールバック分析
            return {
                plotProgressAlignment: 0.7,
                suggestedAdjustments: ['統合分析エラーのため基本的な進行を推奨'],
                keyElementsForNext: ['物語の自然な進行'],
                narrativeDirection: '既存の流れを継続',
                tensionProjection: memoryElements.narrativeState.tensionLevel || 5,
                continuityElements: ['前章からの継続性維持'],
                recommendedPacing: '安定したペース'
            };
        }
    }

    /**
     * プロット進行の一致度を計算
     * @param concretePlot 具体的プロット
     * @param importantEvents 重要イベント
     * @returns 一致度 (0-1)
     */
    private calculatePlotAlignment(
        concretePlot: ConcretePlotPoint | null,
        importantEvents: KeyEvent[]
    ): number {
        if (!concretePlot || !concretePlot.keyEvents || concretePlot.keyEvents.length === 0) {
            return 0.5; // 中程度の一致度をデフォルトとする
        }

        if (importantEvents.length === 0) {
            return 0.6; // イベントがない場合は少し高めのデフォルト
        }

        // 実際の一致度計算
        let matchCount = 0;
        for (const plotEvent of concretePlot.keyEvents) {
            for (const memoryEvent of importantEvents) {
                // 簡易的な文字列一致チェック
                if (memoryEvent.event.toLowerCase().includes(plotEvent.toLowerCase()) ||
                    plotEvent.toLowerCase().includes(memoryEvent.event.toLowerCase())) {
                    matchCount++;
                    break;
                }
            }
        }

        const alignment = Math.min(1.0, matchCount / Math.max(concretePlot.keyEvents.length, importantEvents.length));
        return Math.max(0.3, alignment); // 最低30%の一致度を保証
    }

    /**
     * テンションを予測
     * @param currentTension 現在のテンション
     * @param abstractGuideline 抽象ガイドライン
     * @param phaseInfo フェーズ情報
     * @returns 予測テンション
     */
    private projectTension(
        currentTension: number,
        abstractGuideline: AbstractPlotGuideline,
        phaseInfo: any
    ): number {
        let projectedTension = currentTension;

        // フェーズ情報に基づく調整
        if (phaseInfo) {
            if (phaseInfo.phase === 'CLIMAX') {
                projectedTension = Math.max(8, currentTension);
            } else if (phaseInfo.phase === 'ENDING') {
                projectedTension = Math.min(7, currentTension);
            } else if (phaseInfo.isTransitionPoint) {
                projectedTension = Math.min(10, currentTension + 1);
            }
        }

        // 感情トーンによる調整
        if (abstractGuideline.emotionalTone) {
            if (abstractGuideline.emotionalTone.includes('緊張') ||
                abstractGuideline.emotionalTone.includes('危機')) {
                projectedTension = Math.min(10, projectedTension + 1);
            } else if (abstractGuideline.emotionalTone.includes('穏やか') ||
                abstractGuideline.emotionalTone.includes('平和')) {
                projectedTension = Math.max(1, projectedTension - 1);
            }
        }

        return Math.max(1, Math.min(10, Math.round(projectedTension)));
    }

    /**
     * 重要な要素を特定
     * @param context コンテキスト
     * @returns 重要な要素
     */
    private identifyKeyElements(context: StoryGenerationContext): string[] {
        const { plotElements, memoryElements, phaseInfo } = context;
        const keyElements: string[] = [];

        // 具体的プロットからの要素
        if (plotElements.concrete) {
            if (plotElements.concrete.requiredElements && plotElements.concrete.requiredElements.length > 0) {
                keyElements.push(...plotElements.concrete.requiredElements.slice(0, 3));
            }

            if (plotElements.concrete.keyEvents && plotElements.concrete.keyEvents.length > 0) {
                keyElements.push(...plotElements.concrete.keyEvents.slice(0, 2));
            }
        }

        // 抽象ガイドラインからの要素
        if (plotElements.abstract && plotElements.abstract.potentialDirections) {
            const selectedDirection = plotElements.abstract.potentialDirections[0];
            if (selectedDirection) {
                keyElements.push(selectedDirection);
            }
        }

        // フェーズ情報からの要素
        if (phaseInfo) {
            if (phaseInfo.phase === 'CLIMAX') {
                keyElements.push('重要な対決または課題の解決');
            } else if (phaseInfo.phase === 'ENDING') {
                keyElements.push('物語の主要テーマの集約');
            } else if (phaseInfo.isTransitionPoint) {
                keyElements.push('次のフェーズへの自然な移行');
            }
        }

        // 記憶システムからの重要要素
        if (memoryElements.shortTerm.importantEvents) {
            const recentImportantEvents = memoryElements.shortTerm.importantEvents
                .filter((event: KeyEvent) => event.significance > 0.7)
                .slice(0, 2)
                .map((event: KeyEvent) => `「${event.event}」の展開`);
            keyElements.push(...recentImportantEvents);
        }

        // 重複を排除
        return [...new Set(keyElements)];
    }

    /**
     * 物語の方向性を決定
     * @param context コンテキスト
     * @returns 物語の方向性
     */
    private determineNarrativeDirection(context: StoryGenerationContext): string {
        const { plotElements, memoryElements, phaseInfo } = context;

        // 具体的プロットの目標を優先
        if (plotElements.concrete && plotElements.concrete.storyGoal) {
            return plotElements.concrete.storyGoal;
        }

        // フェーズに基づく方向性
        if (phaseInfo) {
            const phaseDirections = {
                'EARLY': '物語の基盤を確立し、キャラクターの動機を明確化する',
                'MIDDLE': '葛藤を深め、キャラクターの成長を促進する',
                'LATE': 'サブプロットを解決に向かわせ、クライマックスへの準備を整える',
                'CLIMAX': '中心的な葛藤の解決と主要キャラクターの変化を描く',
                'ENDING': '物語の結末を示し、変化したキャラクターと世界の姿を描く'
            };
            
            if (phaseDirections[phaseInfo.phase as keyof typeof phaseDirections]) {
                return phaseDirections[phaseInfo.phase as keyof typeof phaseDirections];
            }
        }

        // 抽象ガイドラインのテーマに基づく方向性
        if (plotElements.abstract) {
            return `${plotElements.abstract.theme}を探求しながら物語を発展させる`;
        }

        // 記憶システムから現在のテーマを取得
        if (memoryElements.narrativeState.currentTheme) {
            return `${memoryElements.narrativeState.currentTheme}を中心とした物語の自然な展開`;
        }

        return '物語の自然な展開を継続する';
    }

    /**
     * 提案される調整を生成
     * @param context コンテキスト
     * @returns 提案される調整
     */
    private generateSuggestedAdjustments(context: StoryGenerationContext): string[] {
        const { plotElements, memoryElements, chapterNumber, phaseInfo } = context;
        const adjustments: string[] = [];

        // 物語の停滞が検出された場合
        if (memoryElements.narrativeState.stagnationDetected) {
            adjustments.push('物語の進展を加速させるため、新しい課題または情報を導入する');
        }

        // テンションレベルに基づく調整
        const tensionLevel = memoryElements.narrativeState.tensionLevel || 5;
        if (tensionLevel < 3 && chapterNumber > 3) {
            adjustments.push('物語の緊張感を高めるため、対立要素や障害を導入する');
        } else if (tensionLevel > 8 && phaseInfo && phaseInfo.phase !== 'CLIMAX') {
            adjustments.push('持続的な高テンションを避けるため、静的なシーンや内省の瞬間を含める');
        }

        // プロット整合性に基づく調整
        const plotAlignment = this.calculatePlotAlignment(
            plotElements.concrete,
            memoryElements.shortTerm.importantEvents || []
        );

        if (plotAlignment < 0.6) {
            adjustments.push('プロット設計と実際の展開の整合性を高めるため、計画された要素の再導入を検討する');
        }

        // フェーズ特有の調整
        if (phaseInfo?.isTransitionPoint) {
            adjustments.push(`次のフェーズ「${phaseInfo.nextPhase}」への移行を準備するための要素を含める`);
        }

        // キャラクター活動に基づく調整
        if (memoryElements.narrativeState.presentCharacters && 
            memoryElements.narrativeState.presentCharacters.length < 2) {
            adjustments.push('キャラクター間の相互作用を増やし、関係性の発展を促進する');
        }

        return adjustments;
    }

    /**
     * 継続性を保つべき要素を特定
     * @param context コンテキスト
     * @returns 継続性を保つべき要素
     */
    private identifyContinuityElements(context: StoryGenerationContext): string[] {
        const { memoryElements } = context;
        const elements: string[] = [];

        // 現在の章の状況
        if (memoryElements.shortTerm.currentChapter) {
            elements.push('前章から継続する状況や会話');
        }

        // 重要イベントに関連する継続要素
        if (memoryElements.shortTerm.importantEvents && memoryElements.shortTerm.importantEvents.length > 0) {
            const recentEvents = memoryElements.shortTerm.importantEvents
                .slice(-3)
                .map((event: KeyEvent) => event.event);

            elements.push(...recentEvents.map((e: string) => `「${e}」の影響や結果`));
        }

        // 現在のアークに関連する継続要素
        if (memoryElements.narrativeState.currentTheme) {
            elements.push(`「${memoryElements.narrativeState.currentTheme}」の一貫した探求`);
        }

        // キャラクターの状態継続
        if (memoryElements.narrativeState.presentCharacters && 
            memoryElements.narrativeState.presentCharacters.length > 0) {
            elements.push('登場キャラクターの感情状態と関係性の継続');
        }

        // 場所と時間の継続性
        if (memoryElements.narrativeState.location) {
            elements.push(`${memoryElements.narrativeState.location}での状況の継続性`);
        }

        return elements;
    }

    /**
     * 推奨されるペースを決定
     * @param context コンテキスト
     * @returns 推奨されるペース
     */
    private determinePacing(context: StoryGenerationContext): string {
        const { memoryElements, phaseInfo } = context;

        // フェーズに基づくペース
        if (phaseInfo) {
            const phaseMapping = {
                'EARLY': '情報と設定を丁寧に展開する控えめなペース',
                'MIDDLE': '複雑さと深みを加えながら、安定したペースで進行',
                'LATE': '展開を加速させ、クライマックスに向けたペースアップ',
                'CLIMAX': '重要なイベントを効果的に描写する、緊張感のある速いペース',
                'ENDING': '結論と解決を丁寧に描く、落ち着いたペース'
            };

            if (phaseMapping[phaseInfo.phase as keyof typeof phaseMapping]) {
                return phaseMapping[phaseInfo.phase as keyof typeof phaseMapping];
            }
        }

        // テンションレベルに基づくペース
        const tensionLevel = memoryElements.narrativeState.tensionLevel || 5;
        if (tensionLevel >= 8) {
            return '緊張感を維持する速いペース';
        } else if (tensionLevel <= 3) {
            return '情景や感情を描写する余裕を持った穏やかなペース';
        }

        return 'バランスの取れた標準的なペース';
    }

    /**
     * 章の目標を決定
     * @param concretePlot 具体的プロット
     * @param abstractGuideline 抽象的ガイドライン
     * @param analysisResult 分析結果
     * @param phaseInfo フェーズ情報
     * @returns 章の目標
     */
    private determineChapterGoal(
        concretePlot: ConcretePlotPoint | null,
        abstractGuideline: AbstractPlotGuideline,
        analysisResult: BridgeAnalysisResult,
        phaseInfo: any = null
    ): string {
        // 具体的プロットが存在する場合、そこから目標を設定
        if (concretePlot && concretePlot.storyGoal) {
            return concretePlot.storyGoal;
        }

        // フェーズ情報がある場合、それに基づいた目標
        if (phaseInfo) {
            if (phaseInfo.isTransitionPoint) {
                return `現在のフェーズ「${phaseInfo.phase}」を締めくくり、次のフェーズ「${phaseInfo.nextPhase}」への移行を準備する`;
            }

            const phaseGoals = {
                'EARLY': `${abstractGuideline.theme}の基盤を確立し、キャラクターと世界を発展させる`,
                'MIDDLE': `${abstractGuideline.theme}に関する葛藤を深め、物語の複雑さを増す`,
                'LATE': `クライマックスに向け${abstractGuideline.theme}の解決への道筋を作る`,
                'CLIMAX': `${abstractGuideline.theme}における中心的な葛藤の解決を描く`,
                'ENDING': `${abstractGuideline.theme}の探求を締めくくり、変化した世界と登場人物を描く`
            };

            if (phaseGoals[phaseInfo.phase as keyof typeof phaseGoals]) {
                return phaseGoals[phaseInfo.phase as keyof typeof phaseGoals];
            }
        }

        // 分析結果からの方向性
        if (analysisResult.narrativeDirection) {
            return analysisResult.narrativeDirection;
        }

        // デフォルト目標
        return `${abstractGuideline.theme}を中心に、${abstractGuideline.emotionalTone}の雰囲気で物語を進展させる`;
    }

    /**
     * 必須プロット要素を抽出
     * @param concretePlot 具体的プロット
     * @param abstractGuideline 抽象的ガイドライン
     * @param analysisResult 分析結果
     * @returns 必須プロット要素
     */
    private extractRequiredPlotElements(
        concretePlot: ConcretePlotPoint | null,
        abstractGuideline: AbstractPlotGuideline,
        analysisResult: BridgeAnalysisResult
    ): string[] {
        const elements = [];

        // 具体的プロットからの要素
        if (concretePlot) {
            if (concretePlot.keyEvents && concretePlot.keyEvents.length > 0) {
                elements.push(...concretePlot.keyEvents);
            }

            if (concretePlot.requiredElements && concretePlot.requiredElements.length > 0) {
                elements.push(...concretePlot.requiredElements);
            }

            if (concretePlot.mustHaveOutcome) {
                elements.push(`必須の結果: ${concretePlot.mustHaveOutcome}`);
            }
        }

        // 抽象ガイドラインからの方向性
        if (abstractGuideline.potentialDirections && abstractGuideline.potentialDirections.length > 0) {
            const selectedDirection = abstractGuideline.potentialDirections[0];
            elements.push(`${selectedDirection}への展開`);
        }

        // テーマ的メッセージ
        if (abstractGuideline.thematicMessage) {
            elements.push(`テーマのメッセージ: ${abstractGuideline.thematicMessage}`);
        }

        // 分析結果からの重要要素
        if (analysisResult.keyElementsForNext && analysisResult.keyElementsForNext.length > 0) {
            elements.push(...analysisResult.keyElementsForNext);
        }

        // 継続性の要素
        if (analysisResult.continuityElements && analysisResult.continuityElements.length > 0) {
            elements.push(...analysisResult.continuityElements);
        }

        return [...new Set(elements)];
    }

    /**
     * 現在の場所を決定
     * @param narrativeState 物語状態
     * @param concretePlot 具体的プロット
     * @returns 現在の場所
     */
    private determineCurrentLocation(
        narrativeState: NarrativeStateInfo | null,
        concretePlot: ConcretePlotPoint | null
    ): string {
        // 物語状態からの場所情報
        if (narrativeState && narrativeState.location) {
            const timeDesc = narrativeState.timeOfDay ? `${narrativeState.timeOfDay}の` : '';
            const weatherDesc = narrativeState.weather ? `${narrativeState.weather}の` : '';
            return `${timeDesc}${weatherDesc}${narrativeState.location}`;
        }

        // 具体的プロットから場所を推論
        if (concretePlot && concretePlot.requiredElements) {
            const locationElement = concretePlot.requiredElements.find(
                e => e.includes('場所') || e.includes('ロケーション') || e.includes('舞台')
            );

            if (locationElement) {
                return locationElement;
            }
        }

        return "前章から継続する場所";
    }

    /**
     * 現在の状況を決定
     * @param narrativeState 物語状態
     * @param shortTermMemory 短期記憶
     * @returns 現在の状況
     */
    private determineCurrentSituation(
        narrativeState: NarrativeStateInfo | null,
        shortTermMemory: any
    ): string {
        if (!narrativeState) {
            return "物語の進行中の状況";
        }

        const tensionDesc = this.getTensionDescription(narrativeState.tensionLevel || 5);
        const stateDesc = this.getStateDescription(narrativeState.state);

        let situation = `現在${stateDesc}の状態で、${tensionDesc}雰囲気が漂っています。`;

        if (narrativeState.stagnationDetected) {
            situation += " 物語は停滞気味で、新たな展開が求められています。";
        }

        if (narrativeState.currentTheme) {
            situation += ` 「${narrativeState.currentTheme}」というテーマを探求中です。`;
        }

        if (shortTermMemory.importantEvents && shortTermMemory.importantEvents.length > 0) {
            const latestEvent = shortTermMemory.importantEvents[shortTermMemory.importantEvents.length - 1];
            if (latestEvent && latestEvent.description) {
                situation += ` 最近の重要な出来事として「${latestEvent.description}」があります。`;
            }
        }

        return situation;
    }

    /**
     * 緊張度の説明を取得
     * @param tensionLevel 緊張度
     * @returns 緊張度の説明
     */
    private getTensionDescription(tensionLevel: number): string {
        if (tensionLevel >= 8) return "非常に緊迫した";
        if (tensionLevel >= 6) return "緊張感のある";
        if (tensionLevel >= 4) return "やや緊張した";
        if (tensionLevel >= 2) return "比較的穏やかな";
        return "落ち着いた";
    }

    /**
     * 状態の説明を取得
     * @param state 状態
     * @returns 状態の説明
     */
    private getStateDescription(state: NarrativeState): string {
        // NarrativeState enumを文字列表現に変換
        const stateMap: { [key in NarrativeState]: string } = {
            [NarrativeState.INTRODUCTION]: "物語の導入",
            [NarrativeState.DAILY_LIFE]: "日常生活",
            [NarrativeState.JOURNEY]: "旅の途中",
            [NarrativeState.PRE_BATTLE]: "対決の前",
            [NarrativeState.BATTLE]: "対決の最中",
            [NarrativeState.POST_BATTLE]: "対決の後",
            [NarrativeState.INVESTIGATION]: "調査",
            [NarrativeState.TRAINING]: "訓練",
            [NarrativeState.REVELATION]: "真実の発覚",
            [NarrativeState.DILEMMA]: "葛藤",
            [NarrativeState.RESOLUTION]: "解決",
            [NarrativeState.CLOSURE]: "締めくくり",
            [NarrativeState.BUSINESS_MEETING]: "ビジネスミーティング",
            [NarrativeState.PRODUCT_DEVELOPMENT]: "製品開発",
            [NarrativeState.PITCH_PRESENTATION]: "ピッチプレゼン",
            [NarrativeState.MARKET_RESEARCH]: "市場調査",
            [NarrativeState.TEAM_BUILDING]: "チーム構築",
            [NarrativeState.FUNDING_ROUND]: "資金調達",
            [NarrativeState.BUSINESS_PIVOT]: "ビジネスピボット",
            [NarrativeState.CUSTOMER_DISCOVERY]: "顧客発見",
            [NarrativeState.PRODUCT_LAUNCH]: "製品ローンチ",
            [NarrativeState.MARKET_COMPETITION]: "市場競争",
            [NarrativeState.STRATEGIC_PREPARATION]: "戦略準備",
            [NarrativeState.PERFORMANCE_REVIEW]: "成果評価",
            [NarrativeState.BUSINESS_DEVELOPMENT]: "事業開発",
            [NarrativeState.SKILL_DEVELOPMENT]: "能力開発",
            [NarrativeState.FINANCIAL_CHALLENGE]: "財務的課題",
            [NarrativeState.EXPANSION_PHASE]: "拡大フェーズ",
            [NarrativeState.ACQUISITION_NEGOTIATION]: "買収交渉",
            [NarrativeState.CULTURE_BUILDING]: "文化構築",
            [NarrativeState.CRISIS_MANAGEMENT]: "危機管理",
            [NarrativeState.MARKET_ENTRY]: "市場参入",
            [NarrativeState.REGULATORY_COMPLIANCE]: "規制対応",
            [NarrativeState.PARTNERSHIP_DEVELOPMENT]: "パートナーシップ開発",
            [NarrativeState.MARKET_SCALING]: "市場スケーリング"
        };

        return stateMap[state] || "未定義の状態";
    }

    /**
     * 活動中のキャラクターを特定
     * @param chapterNumber 章番号
     * @param concretePlot 具体的プロット
     * @param memoryState 記憶状態
     * @returns 活動中のキャラクター
     */
    private async identifyActiveCharacters(
        chapterNumber: number,
        concretePlot: ConcretePlotPoint | null,
        memoryState: any
    ): Promise<CharacterState[]> {
        const characterStates: CharacterState[] = [];

        // 具体的プロットのキャラクターフォーカス
        if (concretePlot && concretePlot.characterFocus && concretePlot.characterFocus.length > 0) {
            concretePlot.characterFocus.forEach(character => {
                characterStates.push({
                    name: character,
                    currentState: "プロットに指定",
                    role: "焦点キャラクター"
                });
            });
        }

        // 物語状態の現在のキャラクター
        if (memoryState.narrativeState.presentCharacters) {
            memoryState.narrativeState.presentCharacters.forEach((character: string) => {
                if (!characterStates.some(c => c.name === character)) {
                    characterStates.push({
                        name: character,
                        currentState: "現在のシーンに登場",
                        role: "シーン参加者"
                    });
                }
            });
        }

        // 統合記憶システムから追加のキャラクター情報を取得
        try {
            const characterSearchResults = await this.memoryManager.unifiedSearch(
                `active characters chapter ${chapterNumber} current scene`,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
            );

            if (characterSearchResults.success) {
                const characterResults = characterSearchResults.results.filter(r => 
                    r.type === 'character' || r.metadata?.category === 'character'
                );

                characterResults.forEach(result => {
                    if (result.data && result.data.name) {
                        if (!characterStates.some(c => c.name === result.data.name)) {
                            characterStates.push({
                                name: result.data.name,
                                currentState: result.data.state || "記憶システムから取得",
                                role: result.data.role || "関連キャラクター"
                            });
                        }
                    }
                });
            }
        } catch (error) {
            logger.debug('Character search failed, using available data', { error });
        }

        return characterStates;
    }

    /**
     * 世界設定の焦点を決定
     * @param concretePlot 具体的プロット
     * @param abstractGuideline 抽象的ガイドライン
     * @param memoryState 記憶状態
     * @returns 世界設定の焦点
     */
    private determineWorldElementsFocus(
        concretePlot: ConcretePlotPoint | null,
        abstractGuideline: AbstractPlotGuideline,
        memoryState: any
    ): string[] {
        const elements: string[] = [];

        // 具体的プロットから関連する世界設定要素を抽出
        if (concretePlot && concretePlot.requiredElements && concretePlot.requiredElements.length > 0) {
            const worldElements = concretePlot.requiredElements.filter(
                e => e.includes("世界") || e.includes("設定") || e.includes("場所") || e.includes("環境")
            );

            if (worldElements.length > 0) {
                elements.push(...worldElements);
            }
        }

        // 抽象ガイドラインから世界設定関連の要素を抽出
        if (abstractGuideline.potentialDirections && abstractGuideline.potentialDirections.length > 0) {
            const worldDirections = abstractGuideline.potentialDirections.filter(
                d => d.includes("世界") || d.includes("設定") || d.includes("環境")
            );

            if (worldDirections.length > 0) {
                elements.push(...worldDirections);
            }
        }

        // 物語状態から関連要素を抽出
        if (memoryState.narrativeState) {
            const { location, timeOfDay, weather } = memoryState.narrativeState;
            if (location && timeOfDay && weather) {
                elements.push(`${timeOfDay}の${weather}の${location}の雰囲気`);
            }
        }

        // 中期記憶からのアーク関連の世界設定
        if (memoryState.midTerm.currentArc && memoryState.midTerm.currentArc.setting) {
            elements.push(`アーク「${memoryState.midTerm.currentArc.name}」における世界設定の要素`);
        }

        // 十分な要素がなければデフォルト追加
        if (elements.length === 0) {
            elements.push("現在の場所と時代の設定を自然に描写");
            elements.push("物語の雰囲気に合った環境描写");
        }

        return [...new Set(elements)];
    }

    /**
     * テーマ的焦点を決定
     * @param abstractGuideline 抽象的ガイドライン
     * @param analysisResult 分析結果
     * @returns テーマ的焦点
     */
    private determineThematicFocus(
        abstractGuideline: AbstractPlotGuideline,
        analysisResult: BridgeAnalysisResult
    ): string[] {
        const thematic = [abstractGuideline.theme];

        if (abstractGuideline.thematicMessage) {
            thematic.push(abstractGuideline.thematicMessage);
        }

        if (abstractGuideline.phasePurpose) {
            thematic.push(abstractGuideline.phasePurpose);
        }

        thematic.push(`${abstractGuideline.emotionalTone}の雰囲気を維持`);

        if (analysisResult.narrativeDirection) {
            thematic.push(analysisResult.narrativeDirection);
        }

        return thematic;
    }

    /**
     * 推奨テンションを計算
     * @param analysisResult 分析結果
     * @param narrativeState 物語状態
     * @returns 推奨テンション
     */
    private calculateRecommendedTension(
        analysisResult: BridgeAnalysisResult,
        narrativeState: NarrativeStateInfo | null
    ): number {
        let tension = analysisResult.tensionProjection;

        if (narrativeState && narrativeState.tensionLevel) {
            tension = (tension + narrativeState.tensionLevel) / 2;
        }

        return Math.round(tension);
    }

    /**
     * 感情的目標を決定
     * @param abstractGuideline 抽象的ガイドライン
     * @param narrativeState 物語状態
     * @param analysisResult 分析結果
     * @returns 感情的目標
     */
    private determineEmotionalGoal(
        abstractGuideline: AbstractPlotGuideline,
        narrativeState: NarrativeStateInfo | null,
        analysisResult: BridgeAnalysisResult
    ): string {
        const emotionalBase = abstractGuideline.emotionalTone;
        const tensionLevel = narrativeState?.tensionLevel || analysisResult.tensionProjection;
        
        let intensityModifier = "";
        if (tensionLevel >= 8) {
            intensityModifier = "激しい";
        } else if (tensionLevel >= 6) {
            intensityModifier = "強い";
        } else if (tensionLevel <= 3) {
            intensityModifier = "穏やかな";
        }

        return intensityModifier ? `${intensityModifier}${emotionalBase}` : emotionalBase;
    }

    /**
     * シーンを提案
     * @param concretePlot 具体的プロット
     * @param abstractGuideline 抽象的ガイドライン
     * @param narrativeState 物語状態
     * @param analysisResult 分析結果
     * @returns 提案シーン
     */
    private suggestScenes(
        concretePlot: ConcretePlotPoint | null,
        abstractGuideline: AbstractPlotGuideline,
        narrativeState: NarrativeStateInfo | null,
        analysisResult: BridgeAnalysisResult
    ): string[] {
        const potentialScenes: string[] = [];

        // 具体的プロットからのシーン提案
        if (concretePlot && concretePlot.keyEvents && concretePlot.keyEvents.length > 0) {
            concretePlot.keyEvents.forEach(event => {
                potentialScenes.push(`${event}を中心としたシーン`);
            });
        }

        // 抽象ガイドラインからのシーン提案
        if (abstractGuideline.potentialDirections && abstractGuideline.potentialDirections.length > 0) {
            abstractGuideline.potentialDirections.forEach(direction => {
                potentialScenes.push(`${direction}に焦点を当てたシーン`);
            });
        }

        // 物語状態からのシーン提案
        if (narrativeState) {
            const sceneMapping: { [key in NarrativeState]?: string } = {
                [NarrativeState.BATTLE]: "緊迫した対決シーン",
                [NarrativeState.MARKET_COMPETITION]: "緊迫した対決シーン",
                [NarrativeState.REVELATION]: "重要な真実が明らかになるシーン",
                [NarrativeState.JOURNEY]: "新しい展開への移行シーン",
                [NarrativeState.BUSINESS_DEVELOPMENT]: "新しい展開への移行シーン",
                [NarrativeState.DILEMMA]: "内的葛藤や決断のシーン",
                [NarrativeState.DAILY_LIFE]: "日常の中で重要な会話や気づきのシーン",
                [NarrativeState.RESOLUTION]: "問題解決への一歩を示すシーン"
            };

            if (sceneMapping[narrativeState.state]) {
                potentialScenes.push(sceneMapping[narrativeState.state]!);
            }
        }

        // 分析結果からのシーン提案
        if (analysisResult.recommendedPacing) {
            potentialScenes.push(`${analysisResult.recommendedPacing}のシーン構成`);
        }

        return [...new Set(potentialScenes)].slice(0, 3);
    }

    /**
     * プロンプト要素として整形
     * @param directives 章指示
     * @returns プロンプト要素
     */
    formatAsPromptElements(directives: ChapterDirectives): PromptElements {
        const elements: PromptElements = {
            CHAPTER_GOAL: directives.chapterGoal,
            REQUIRED_PLOT_ELEMENTS: this.formatList(directives.requiredPlotElements),
            CURRENT_LOCATION: directives.currentLocation,
            CURRENT_SITUATION: directives.currentSituation,
            ACTIVE_CHARACTERS: this.formatCharacters(directives.activeCharacters),
            WORLD_ELEMENTS_FOCUS: this.formatList(directives.worldElementsFocus),
            THEMATIC_FOCUS: this.formatList(directives.thematicFocus)
        };

        if (directives.suggestedScenes && directives.suggestedScenes.length > 0) {
            elements.SUGGESTED_SCENES = this.formatList(directives.suggestedScenes);
        }

        if (directives.emotionalGoal) {
            elements.EMOTIONAL_GOAL = directives.emotionalGoal;
        }

        if (directives.tension) {
            elements.TENSION_LEVEL = `${directives.tension}/10`;
        }

        if (directives.emotionalCurve && directives.emotionalCurve.length > 0) {
            elements.EMOTIONAL_CURVE = this.formatEmotionalCurve(directives.emotionalCurve);
        }

        return elements;
    }

    /**
     * プロット進行状況を分析
     * @param concretePlot 具体的プロット
     * @param recentChapters 最近の章
     * @returns 進行状況
     */
    analyzeProgress(
        concretePlot: ConcretePlotPoint | null,
        recentChapters: any[]
    ): PlotProgressInfo {
        if (!concretePlot || !concretePlot.keyEvents || concretePlot.keyEvents.length === 0) {
            return {
                completedElements: [],
                pendingElements: [],
                progressPercentage: 0,
                currentFocus: "未定義のプロット"
            };
        }

        // 完了した要素と未完了要素を分析
        const completedElements: string[] = [];
        const pendingElements = [...concretePlot.keyEvents];

        // 実際の進行度を計算
        let progressPercentage = 0.5;
        
        if (recentChapters && recentChapters.length > 0) {
            // 最近の章でどの要素が達成されたかを分析
            const recentContent = recentChapters.map(chapter => 
                chapter.content || chapter.title || ''
            ).join(' ').toLowerCase();

            for (let i = pendingElements.length - 1; i >= 0; i--) {
                const element = pendingElements[i];
                if (recentContent.includes(element.toLowerCase().substring(0, 10))) {
                    completedElements.push(element);
                    pendingElements.splice(i, 1);
                }
            }

            progressPercentage = Math.min(0.9, 
                completedElements.length / (completedElements.length + pendingElements.length)
            );
        }

        return {
            completedElements,
            pendingElements,
            progressPercentage,
            currentFocus: concretePlot.title || "物語の進行"
        };
    }

    /**
     * 安全な記憶操作
     * @private
     */
    private async safeMemoryOperation<T>(
        operation: () => Promise<T>,
        fallbackValue: T,
        operationName: string
    ): Promise<T> {
        if (!this.operationOptions.useMemorySystemIntegration) {
            return fallbackValue;
        }

        let lastError: Error | null = null;

        for (let attempt = 0; attempt < this.operationOptions.retryAttempts; attempt++) {
            try {
                // システム状態確認
                const systemStatus = await this.memoryManager.getSystemStatus();
                if (!systemStatus.initialized) {
                    logger.warn(`${operationName}: MemoryManager not initialized (attempt ${attempt + 1})`);
                    if (this.operationOptions.fallbackStrategy === 'conservative') {
                        return fallbackValue;
                    }
                    continue;
                }

                // タイムアウト付きで操作を実行
                const result = await Promise.race([
                    operation(),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('Operation timeout')), this.operationOptions.timeoutMs)
                    )
                ]);

                this.performanceMetrics.memorySystemHits++;
                return result;

            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                logger.warn(`${operationName} failed (attempt ${attempt + 1}/${this.operationOptions.retryAttempts})`, { 
                    error: lastError.message 
                });

                if (attempt < this.operationOptions.retryAttempts - 1) {
                    // 指数バックオフで再試行
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }

        logger.error(`${operationName} failed after ${this.operationOptions.retryAttempts} attempts`, { 
            error: lastError?.message 
        });
        return fallbackValue;
    }

    /**
     * 強化されたフォールバック指示を生成
     * @private
     */
    private generateEnhancedFallbackDirectives(
        chapterNumber: number,
        abstractGuideline: AbstractPlotGuideline,
        narrativeState: NarrativeStateInfo | null,
        error: unknown
    ): ChapterDirectives {
        if (!narrativeState) {
            narrativeState = this.createDefaultNarrativeState(chapterNumber);
        }

        logger.info(`Generating enhanced fallback directives for chapter ${chapterNumber}`, {
            error: error instanceof Error ? error.message : String(error)
        });

        return {
            chapterGoal: `${abstractGuideline.theme}を探求しながら物語を進展させる（システム制限による基本モード）`,
            requiredPlotElements: [
                `${abstractGuideline.emotionalTone}の雰囲気の中での出来事`,
                `${abstractGuideline.theme}に関連する展開`,
                "キャラクターの成長機会",
                "前章からの自然な継続"
            ],
            currentLocation: narrativeState.location || "前章から継続する場所",
            currentSituation: `${this.getStateDescription(narrativeState.state)}の状況で物語が進行中（統合記憶システム制限下）`,
            activeCharacters: narrativeState.presentCharacters?.map(name => ({
                name,
                currentState: "物語に参加中",
                role: "登場人物"
            })) || [
                { name: "主人公", currentState: "物語の中心", role: "主要人物" }
            ],
            worldElementsFocus: [
                "現在の環境描写",
                "世界観の重要要素",
                "物語の雰囲気に合った設定"
            ],
            thematicFocus: [
                abstractGuideline.theme,
                `${abstractGuideline.emotionalTone}の雰囲気の維持`,
                "物語の一貫性の保持"
            ],
            narrativeState,
            tension: narrativeState.tensionLevel || 5,
            emotionalGoal: abstractGuideline.emotionalTone,
            suggestedScenes: [
                "物語の自然な流れに沿ったシーン",
                "キャラクターの内面や関係性を描くシーン",
                "テーマの探求を深めるシーン"
            ]
        };
    }

    /**
     * デフォルトの物語状態を作成
     * @private
     */
    private createDefaultNarrativeState(chapterNumber: number): NarrativeStateInfo {
        const arcNumber = Math.ceil(chapterNumber / 10);
        const arcStartChapter = Math.max(1, (arcNumber - 1) * 10 + 1);
        const arcEndChapter = arcNumber * 10;

        return {
            state: NarrativeState.DAILY_LIFE,
            tensionLevel: 5,
            stagnationDetected: false,
            duration: 1,
            location: "不特定の場所",
            timeOfDay: "昼間",
            weather: "晴れ",
            presentCharacters: [],
            genre: "未定義",
            currentArcNumber: arcNumber,
            currentTheme: `第${arcNumber}アークのテーマ`,
            arcStartChapter,
            arcEndChapter,
            arcCompleted: false,
            turningPoints: []
        };
    }

    /**
     * パフォーマンス統計を更新
     * @private
     */
    private updatePerformanceMetrics(processingTime: number, success: boolean): void {
        this.performanceMetrics.totalOperations++;
        
        if (success) {
            this.performanceMetrics.successfulOperations++;
        } else {
            this.performanceMetrics.failedOperations++;
        }

        // 平均処理時間を更新
        this.performanceMetrics.averageProcessingTime = 
            ((this.performanceMetrics.averageProcessingTime * (this.performanceMetrics.totalOperations - 1)) + processingTime) /
            this.performanceMetrics.totalOperations;

        // キャッシュ効率率を計算
        this.performanceMetrics.cacheEfficiencyRate = 
            this.performanceMetrics.totalOperations > 0 
                ? this.performanceMetrics.memorySystemHits / this.performanceMetrics.totalOperations 
                : 0;
    }

    /**
     * ユーティリティメソッド
     * @private
     */
    private formatList(items: string[]): string {
        return items.map(item => `- ${item}`).join('\n');
    }

    private formatCharacters(characters: CharacterState[]): string {
        return characters.map(char => {
            let charText = `- ${char.name} (${char.role}): ${char.currentState}`;

            if (char.goals && char.goals.length > 0) {
                charText += `\n  目標: ${char.goals.join(', ')}`;
            }

            if (char.conflicts && char.conflicts.length > 0) {
                charText += `\n  葛藤: ${char.conflicts.join(', ')}`;
            }

            if (char.relationshipFocus && char.relationshipFocus.length > 0) {
                charText += `\n  関係性: ${char.relationshipFocus.join(', ')}`;
            }

            if (char.development) {
                charText += `\n  発展: ${char.development}`;
            }

            return charText;
        }).join('\n');
    }

    private formatEmotionalCurve(curve: EmotionalCurvePoint[]): string {
        let result = "直近の感情曲線:\n";

        result += curve.map(point => {
            let pointText = `- 章${point.chapter}: ${point.emotion} (テンション: ${point.tension}/10)`;
            if (point.event) {
                pointText += ` - ${point.event}`;
            }
            return pointText;
        }).join('\n');

        const lastPoint = curve[curve.length - 1];
        if (lastPoint) {
            result += `\n\n推奨: 前章の「${lastPoint.emotion}」からの自然な変化を意識して展開を描写`;
        }

        return result;
    }

    /**
     * 診断情報を取得
     * @returns パフォーマンス統計と診断情報
     */
    async performDiagnostics(): Promise<{
        performanceMetrics: PerformanceMetrics;
        systemStatus: string;
        recommendations: string[];
    }> {
        const recommendations: string[] = [];

        // 成功率チェック
        const successRate = this.performanceMetrics.totalOperations > 0 
            ? this.performanceMetrics.successfulOperations / this.performanceMetrics.totalOperations 
            : 0;

        if (successRate < 0.8) {
            recommendations.push('統合記憶システムとの連携成功率が低下しています');
        }

        // 処理時間チェック
        if (this.performanceMetrics.averageProcessingTime > 5000) {
            recommendations.push('平均処理時間が長すぎます。システム最適化を検討してください');
        }

        // メモリシステム活用率チェック
        if (this.performanceMetrics.cacheEfficiencyRate < 0.6) {
            recommendations.push('記憶システムの活用率が低いです。統合検索の活用を増やしてください');
        }

        const systemStatus = successRate > 0.9 ? 'EXCELLENT' : 
                           successRate > 0.7 ? 'GOOD' : 
                           successRate > 0.5 ? 'DEGRADED' : 'CRITICAL';

        return {
            performanceMetrics: { ...this.performanceMetrics },
            systemStatus,
            recommendations
        };
    }

    /**
     * 設定を更新
     * @param newOptions 新しいオプション
     */
    updateConfiguration(newOptions: Partial<SafeMemoryOperationOptions>): void {
        this.operationOptions = { ...this.operationOptions, ...newOptions };
        logger.info('StoryGenerationBridge configuration updated', { newOptions });
    }
}