// src/lib/plot/section/section-bridge.ts
/**
 * @fileoverview 中期プロット（篇）と他システムとの橋渡しを行うクラス（新記憶階層システム対応版）
 * @description
 * 他のシステムコンポーネントとの連携を担当し、
 * 章生成コンテキストに篇情報を統合します。
 * 新しい統合記憶階層システムに完全対応し、統一アクセスAPIを活用。
 */

import { logger } from '@/lib/utils/logger';
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { SectionPlotManager } from './section-plot-manager';
import { GenerationContext } from '@/types/generation';
import { SectionPlot } from './types';

// 新記憶階層システムの型をインポート
import { 
    MemoryLevel, 
    UnifiedSearchResult,
    SystemOperationResult
} from '@/lib/memory/core/types';

/**
 * @interface ChapterData
 * @description 章データの型定義
 */
interface ChapterData {
    chapter: {
        chapterNumber: number;
        title: string;
        content?: string;
    };
    summary: string;
}

/**
 * @interface NarrativeStateData
 * @description 物語状態データの型定義
 */
interface NarrativeStateData {
    state: string;
    location?: string;
    presentCharacters?: string[];
    tensionLevel?: number;
}

/**
 * @interface SectionMemoryData
 * @description セクション記憶データの型定義
 */
interface SectionMemoryData {
    analysisResults: any[];
    progressData: any;
    emotionalData: any;
    learningData: any;
}

/**
 * @interface SectionBridgeConfig
 * @description SectionBridgeの設定
 */
interface SectionBridgeConfig {
    useMemorySystemIntegration: boolean;
    enableCacheOptimization: boolean;
    fallbackToBasicContext: boolean;
    maxRetries: number;
    contextTimeout: number;
}

/**
 * @interface BridgeMetrics
 * @description ブリッジパフォーマンスメトリクス
 */
interface BridgeMetrics {
    totalContextGenerations: number;
    successfulGenerations: number;
    failedGenerations: number;
    averageProcessingTime: number;
    memorySystemHits: number;
    cacheEfficiencyRate: number;
    lastOptimization: string;
}

/**
 * @class SectionBridge
 * @description 中期プロットと他システムとの橋渡しを行うクラス（新記憶階層システム対応）
 */
export class SectionBridge {
    private config: SectionBridgeConfig;
    private bridgeMetrics: BridgeMetrics;

    /**
     * コンストラクタ
     * 
     * @param sectionPlotManager セクションプロットマネージャー
     * @param memoryManager 統合記憶管理システム（新システム）
     * @param options 設定オプション
     */
    constructor(
        private sectionPlotManager: SectionPlotManager,
        private memoryManager: MemoryManager,
        private options: Partial<SectionBridgeConfig> = {}
    ) {
        this.config = {
            useMemorySystemIntegration: true,
            enableCacheOptimization: true,
            fallbackToBasicContext: true,
            maxRetries: 3,
            contextTimeout: 30000,
            ...options
        };

        this.bridgeMetrics = {
            totalContextGenerations: 0,
            successfulGenerations: 0,
            failedGenerations: 0,
            averageProcessingTime: 0,
            memorySystemHits: 0,
            cacheEfficiencyRate: 0,
            lastOptimization: new Date().toISOString()
        };

        logger.info('SectionBridge initialized with new memory hierarchy system', {
            config: this.config
        });
    }

    /**
     * 章生成コンテキストに篇情報を統合
     * 
     * @param chapterNumber 章番号
     * @returns 統合された章生成コンテキスト
     */
    async generateChapterContextWithSection(chapterNumber: number): Promise<GenerationContext> {
        const startTime = Date.now();
        this.bridgeMetrics.totalContextGenerations++;

        try {
            logger.info(`Generating chapter context with section for chapter ${chapterNumber} using unified memory system`);

            // 基本的な章生成コンテキストを作成
            const baseContext = await this.createBaseContextWithMemorySystem(chapterNumber);

            // 該当する篇を取得
            const section = await this.sectionPlotManager.getSectionByChapter(chapterNumber);
            if (!section) {
                logger.info(`No section found for chapter ${chapterNumber}, returning base context`);
                this.bridgeMetrics.successfulGenerations++;
                this.updateBridgeMetrics(Date.now() - startTime);
                return baseContext;
            }

            // 篇情報を統合したコンテキストを作成
            const enhancedContext = await this.enhanceContextWithSectionAndMemory(
                baseContext, 
                section, 
                chapterNumber
            );

            this.bridgeMetrics.successfulGenerations++;
            this.updateBridgeMetrics(Date.now() - startTime);

            logger.info(`Successfully generated context with section for chapter ${chapterNumber}`, {
                processingTime: Date.now() - startTime,
                sectionId: section.id,
                memorySystemUsed: this.config.useMemorySystemIntegration
            });

            return enhancedContext;

        } catch (error) {
            this.bridgeMetrics.failedGenerations++;
            this.updateBridgeMetrics(Date.now() - startTime);

            logger.error(`Failed to generate context with section for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                processingTime: Date.now() - startTime
            });

            // エラー時は基本コンテキストを返す
            if (this.config.fallbackToBasicContext) {
                return await this.createFallbackContext(chapterNumber);
            }
            
            throw error;
        }
    }

    // ============================================================================
    // 新記憶階層システム統合メソッド
    // ============================================================================

    /**
     * 新記憶階層システムを使用して基本コンテキストを作成
     */
    private async createBaseContextWithMemorySystem(chapterNumber: number): Promise<GenerationContext> {
        try {
            // 統合記憶システムから章関連データを並列取得
            const [
                recentChaptersData,
                previousChapterData,
                narrativeStateData,
                worldContextData
            ] = await Promise.allSettled([
                this.getRecentChaptersFromMemory(chapterNumber),
                this.getPreviousChapterFromMemory(chapterNumber),
                this.getNarrativeStateFromMemory(chapterNumber),
                this.getWorldContextFromMemory(chapterNumber)
            ]);

            // 結果を安全に抽出
            const recentChapters = this.extractSettledResult(recentChaptersData, []);
            const previousChapter = this.extractSettledResult(previousChapterData, null);
            const narrativeState = this.extractSettledResult(narrativeStateData, this.getDefaultNarrativeState());
            const worldContext = this.extractSettledResult(worldContextData, '');

            // 基本コンテキストを構築
            return {
                chapterNumber,
                previousChapterContent: previousChapter?.content || '',
                previousChapterTitle: previousChapter?.title || '',
                recentChapters: recentChapters.map((c: ChapterData) => ({
                    number: c.chapter.chapterNumber,
                    title: c.chapter.title,
                    summary: c.summary || ''
                })),
                narrativeState: {
                    state: narrativeState.state as any, // 型キャストで回避
                    location: narrativeState.location || '',
                    presentCharacters: narrativeState.presentCharacters || [],
                    tensionLevel: narrativeState.tensionLevel || 5
                },
                worldContext,
                theme: '', // themeContext から変更
                additionalContext: {},
                sectionContext: null
            };

        } catch (error) {
            logger.error(`Failed to create base context with memory system for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // フォールバックとして基本的なコンテキストを返す
            return await this.createFallbackContext(chapterNumber);
        }
    }

    /**
     * 統合記憶システムから最近の章を取得
     */
    private async getRecentChaptersFromMemory(chapterNumber: number): Promise<ChapterData[]> {
        try {
            const searchQuery = `recent chapters before ${chapterNumber} summary content`;
            const searchResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    searchQuery,
                    [MemoryLevel.SHORT_TERM]
                ),
                { success: false, results: [], totalResults: 0, processingTime: 0, suggestions: [] },
                'getRecentChaptersFromMemory'
            );

            if (!searchResult.success || searchResult.totalResults === 0) {
                return [];
            }

            this.bridgeMetrics.memorySystemHits++;

            // 検索結果から章データを抽出
            const chapters: ChapterData[] = [];
            for (const result of searchResult.results) {
                if (result.type === 'chapter' && result.data) {
                    const chapterData = this.extractChapterDataFromResult(result.data, chapterNumber);
                    if (chapterData) {
                        chapters.push(chapterData);
                    }
                }
            }

            // 章番号でソートして最新の3章を返す
            return chapters
                .sort((a, b) => b.chapter.chapterNumber - a.chapter.chapterNumber)
                .slice(0, 3);

        } catch (error) {
            logger.warn('Failed to get recent chapters from memory', { error, chapterNumber });
            return [];
        }
    }

    /**
     * 統合記憶システムから前の章を取得
     */
    private async getPreviousChapterFromMemory(chapterNumber: number): Promise<{ title: string; content: string } | null> {
        if (chapterNumber <= 1) {
            return null;
        }

        try {
            const searchQuery = `chapter ${chapterNumber - 1} title content`;
            const searchResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    searchQuery,
                    [MemoryLevel.SHORT_TERM]
                ),
                null,
                'getPreviousChapterFromMemory'
            );

            if (!searchResult?.success || searchResult.totalResults === 0) {
                return null;
            }

            this.bridgeMetrics.memorySystemHits++;

            // 前の章データを検索結果から抽出
            for (const result of searchResult.results) {
                if (result.type === 'chapter' && result.data) {
                    const data = result.data;
                    if (data.chapterNumber === chapterNumber - 1) {
                        return {
                            title: data.title || `第${chapterNumber - 1}章`,
                            content: data.content || ''
                        };
                    }
                }
            }

            return null;

        } catch (error) {
            logger.warn('Failed to get previous chapter from memory', { error, chapterNumber });
            return null;
        }
    }

    /**
     * 統合記憶システムから物語状態を取得
     */
    private async getNarrativeStateFromMemory(chapterNumber: number): Promise<NarrativeStateData> {
        try {
            const searchQuery = `narrative state chapter ${chapterNumber} location characters tension`;
            const searchResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    searchQuery,
                    [MemoryLevel.MID_TERM, MemoryLevel.SHORT_TERM]
                ),
                null,
                'getNarrativeStateFromMemory'
            );

            if (!searchResult?.success || searchResult.totalResults === 0) {
                return this.getDefaultNarrativeState();
            }

            this.bridgeMetrics.memorySystemHits++;

            // 物語状態データを検索結果から抽出
            for (const result of searchResult.results) {
                if (result.type === 'narrative' || result.type === 'state') {
                    const data = result.data;
                    if (data && typeof data === 'object') {
                        return {
                            state: data.state || 'INTRODUCTION',
                            location: data.location || '',
                            presentCharacters: Array.isArray(data.presentCharacters) 
                                ? data.presentCharacters 
                                : (Array.isArray(data.characters) ? data.characters : []),
                            tensionLevel: typeof data.tensionLevel === 'number' 
                                ? data.tensionLevel 
                                : 5
                        };
                    }
                }
            }

            return this.getDefaultNarrativeState();

        } catch (error) {
            logger.warn('Failed to get narrative state from memory', { error, chapterNumber });
            return this.getDefaultNarrativeState();
        }
    }

    /**
     * 統合記憶システムから世界コンテキストを取得
     */
    private async getWorldContextFromMemory(chapterNumber: number): Promise<string> {
        try {
            const searchQuery = `world context settings knowledge chapter ${chapterNumber}`;
            const searchResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    searchQuery,
                    [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM]
                ),
                null,
                'getWorldContextFromMemory'
            );

            if (!searchResult?.success || searchResult.totalResults === 0) {
                return '';
            }

            this.bridgeMetrics.memorySystemHits++;

            // 世界コンテキストを検索結果から構築
            const contextParts: string[] = [];
            for (const result of searchResult.results) {
                if (result.type === 'knowledge' || result.type === 'world') {
                    const data = result.data;
                    if (data && typeof data === 'object') {
                        if (data.description) {
                            contextParts.push(data.description);
                        }
                        if (data.worldSettings) {
                            contextParts.push(JSON.stringify(data.worldSettings, null, 2));
                        }
                    }
                }
            }

            return contextParts.join('\n').substring(0, 1000); // 長さ制限

        } catch (error) {
            logger.warn('Failed to get world context from memory', { error, chapterNumber });
            return '';
        }
    }

    /**
     * 篇情報を統合したコンテキストを作成（記憶システム連携強化版）
     */
    private async enhanceContextWithSectionAndMemory(
        baseContext: GenerationContext,
        section: SectionPlot,
        chapterNumber: number
    ): Promise<GenerationContext> {
        try {
            // セクション内での相対位置を計算 (0-1)
            const { start, end } = section.chapterRange;
            const relativePosition = (chapterNumber - start) / (end - start || 1);

            // 統合記憶システムからセクション関連データを取得
            const sectionMemoryData = await this.getSectionMemoryData(section, chapterNumber);

            // 重要なシーンやターニングポイントを特定
            const keyScenes = this.findRelevantKeyScenes(section, relativePosition);
            const turningPoints = this.findRelevantTurningPoints(section, relativePosition);

            // 感情アークの情報を取得
            const emotionalInfo = this.getEmotionalArcInfo(section, relativePosition);

            // 学習関連の情報を取得
            const learningInfo = this.getLearningInfo(section);

            // 章の位置づけ特定（導入、中盤、結末）
            const chapterPosition = this.determineChapterPosition(relativePosition);

            // 篇コンテキストを構築
            const sectionContext = {
                id: section.id,
                title: section.structure.title,
                theme: section.structure.theme,
                narrativePhase: section.structure.narrativePhase,
                chapterPosition,
                relativePosition,
                motifs: section.structure.motifs,

                // 感情設計
                emotionalTone: emotionalInfo.currentTone,
                emotionalArc: emotionalInfo.arc,
                emotionalJourney: section.emotionalDesign.readerEmotionalJourney,

                // 学習設計
                mainConcept: learningInfo.mainConcept,
                learningStage: learningInfo.primaryLearningStage,
                learningObjectives: learningInfo.objectives,

                // 構造設計
                keyScenes,
                turningPoints,
                sectionThreads: section.narrativeStructureDesign.narrativeThreads.map(t => t.thread),

                // キャラクター設計
                mainCharacters: section.characterDesign.mainCharacters,

                // 記憶システムからの追加データ
                memoryEnhancement: sectionMemoryData
            };

            // テーマコンテキストを構築
            const themeContext = this.buildThemeContext(section);

            // 統合したコンテキストを返す
            return {
                ...baseContext,
                theme: themeContext, // themeContext の代わりに theme に代入
                sectionContext,
                additionalContext: {
                    ...(baseContext.additionalContext || {}),
                    motifs: section.structure.motifs,
                    characterRoles: section.characterDesign.characterRoles,
                    memorySystemData: sectionMemoryData
                }
            };

        } catch (error) {
            logger.error('Failed to enhance context with section and memory', { 
                error: error instanceof Error ? error.message : String(error),
                sectionId: section.id,
                chapterNumber
            });

            // エラー時は基本的な統合のみ実行
            return this.enhanceContextWithSectionBasic(baseContext, section, chapterNumber);
        }
    }

    /**
     * セクション関連のメモリデータを取得
     */
    private async getSectionMemoryData(section: SectionPlot, chapterNumber: number): Promise<SectionMemoryData | null> {
        try {
            const searchQuery = `section ${section.id} analysis progress emotional arc learning`;
            const searchResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    searchQuery,
                    [MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
                ),
                null,
                'getSectionMemoryData'
            );

            if (!searchResult?.success) {
                return null;
            }

            // セクション関連データを整理
            const memoryData: SectionMemoryData = {
                analysisResults: [],
                progressData: null,
                emotionalData: null,
                learningData: null
            };

            for (const result of searchResult.results) {
                if (result.type === 'analysis') {
                    memoryData.analysisResults.push(result.data);
                } else if (result.type === 'progress') {
                    memoryData.progressData = result.data;
                } else if (result.type === 'emotional') {
                    memoryData.emotionalData = result.data;
                } else if (result.type === 'learning') {
                    memoryData.learningData = result.data;
                }
            }

            return memoryData;

        } catch (error) {
            logger.warn('Failed to get section memory data', { error, sectionId: section.id });
            return null;
        }
    }

    /**
     * 基本的な篇統合（記憶システム使用なし）
     */
    private enhanceContextWithSectionBasic(
        baseContext: GenerationContext,
        section: SectionPlot,
        chapterNumber: number
    ): GenerationContext {
        // セクション内での相対位置を計算 (0-1)
        const { start, end } = section.chapterRange;
        const relativePosition = (chapterNumber - start) / (end - start || 1);

        // 重要なシーンやターニングポイントを特定
        const keyScenes = this.findRelevantKeyScenes(section, relativePosition);
        const turningPoints = this.findRelevantTurningPoints(section, relativePosition);

        // 感情アークの情報を取得
        const emotionalInfo = this.getEmotionalArcInfo(section, relativePosition);

        // 学習関連の情報を取得
        const learningInfo = this.getLearningInfo(section);

        // 章の位置づけ特定（導入、中盤、結末）
        const chapterPosition = this.determineChapterPosition(relativePosition);

        // 篇コンテキストを構築
        const sectionContext = {
            id: section.id,
            title: section.structure.title,
            theme: section.structure.theme,
            narrativePhase: section.structure.narrativePhase,
            chapterPosition,
            relativePosition,
            motifs: section.structure.motifs,

            // 感情設計
            emotionalTone: emotionalInfo.currentTone,
            emotionalArc: emotionalInfo.arc,
            emotionalJourney: section.emotionalDesign.readerEmotionalJourney,

            // 学習設計
            mainConcept: learningInfo.mainConcept,
            learningStage: learningInfo.primaryLearningStage,
            learningObjectives: learningInfo.objectives,

            // 構造設計
            keyScenes,
            turningPoints,
            sectionThreads: section.narrativeStructureDesign.narrativeThreads.map(t => t.thread),

            // キャラクター設計
            mainCharacters: section.characterDesign.mainCharacters
        };

        // テーマコンテキストを構築
        const themeContext = this.buildThemeContext(section);

        // 統合したコンテキストを返す
        return {
            ...baseContext,
            theme: themeContext, // themeContext の代わりに theme に代入
            sectionContext,
            additionalContext: {
                ...(baseContext.additionalContext || {}),
                motifs: section.structure.motifs,
                characterRoles: section.characterDesign.characterRoles
            }
        };
    }

    // ============================================================================
    // ユーティリティ・ヘルパーメソッド
    // ============================================================================

    /**
     * 安全なメモリ操作
     */
    private async safeMemoryOperation<T>(
        operation: () => Promise<T>,
        fallbackValue: T,
        operationName: string
    ): Promise<T> {
        if (!this.config.useMemorySystemIntegration) {
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
            logger.error(`${operationName} failed`, { 
                error: error instanceof Error ? error.message : String(error) 
            });
            return fallbackValue;
        }
    }

    /**
     * Promise.allSettled結果を安全に抽出
     */
    private extractSettledResult<T>(
        result: PromiseSettledResult<T>, 
        fallbackValue: T
    ): T {
        return result.status === 'fulfilled' ? result.value : fallbackValue;
    }

    /**
     * 検索結果から章データを抽出
     */
    private extractChapterDataFromResult(
        resultData: any, 
        beforeChapter: number
    ): ChapterData | null {
        try {
            if (resultData.chapterNumber && 
                resultData.chapterNumber < beforeChapter) {
                
                return {
                    chapter: {
                        chapterNumber: resultData.chapterNumber,
                        title: resultData.title || `第${resultData.chapterNumber}章`,
                        content: resultData.content
                    },
                    summary: resultData.summary || resultData.content?.substring(0, 200) || ''
                };
            }
            return null;
        } catch (error) {
            logger.warn('Failed to extract chapter data from result', { error, resultData });
            return null;
        }
    }

    /**
     * デフォルトの物語状態を取得
     */
    private getDefaultNarrativeState(): NarrativeStateData {
        return {
            state: 'INTRODUCTION',
            location: '',
            presentCharacters: [],
            tensionLevel: 5
        };
    }

    /**
     * フォールバックコンテキストを作成
     */
    private async createFallbackContext(chapterNumber: number): Promise<GenerationContext> {
        logger.info(`Creating fallback context for chapter ${chapterNumber}`);
        
        return {
            chapterNumber,
            previousChapterContent: '',
            previousChapterTitle: '',
            recentChapters: [],
            narrativeState: {
                state: 'INTRODUCTION' as any, // 型キャストで回避
                location: '',
                presentCharacters: [],
                tensionLevel: 5
            },
            worldContext: '',
            theme: '', // themeContext から変更
            additionalContext: {},
            sectionContext: null
        };
    }

    // ============================================================================
    // 既存機能メソッド（既存機能を完全保持）
    // ============================================================================

    /**
     * 関連する重要シーンを見つける
     * 
     * @param section セクション情報
     * @param relativePosition 相対位置
     * @returns 関連する重要シーン
     */
    private findRelevantKeyScenes(section: SectionPlot, relativePosition: number): any[] {
        const keyScenes = section.narrativeStructureDesign.keyScenes || [];

        // 距離が0.2以内の重要シーンを見つける
        return keyScenes
            .filter(scene => Math.abs(scene.relativePosition - relativePosition) <= 0.2)
            .map(scene => ({
                description: scene.description,
                purpose: scene.purpose,
                learningConnection: scene.learningConnection
            }));
    }

    /**
     * 関連するターニングポイントを見つける
     * 
     * @param section セクション情報
     * @param relativePosition 相対位置
     * @returns 関連するターニングポイント
     */
    private findRelevantTurningPoints(section: SectionPlot, relativePosition: number): any[] {
        const turningPoints = section.narrativeStructureDesign.turningPoints || [];

        // 距離が0.15以内のターニングポイントを見つける
        return turningPoints
            .filter(tp => Math.abs(tp.relativePosition - relativePosition) <= 0.15)
            .map(tp => ({
                description: tp.description,
                impact: tp.impact
            }));
    }

    /**
     * 感情アークの情報を取得
     * 
     * @param section セクション情報
     * @param relativePosition 相対位置
     * @returns 感情アークの情報
     */
    private getEmotionalArcInfo(section: SectionPlot, relativePosition: number): any {
        const emotionalArc = section.emotionalDesign.emotionalArc;

        // 現在の感情トーンを決定
        let currentTone: string;
        if (relativePosition < 0.33) {
            currentTone = emotionalArc.opening;
        } else if (relativePosition < 0.66) {
            currentTone = emotionalArc.midpoint;
        } else {
            currentTone = emotionalArc.conclusion;
        }

        // 緊張ポイントを確認
        const tensionPoints = section.emotionalDesign.tensionPoints || [];
        const nearbyTensionPoint = tensionPoints.find(tp =>
            Math.abs(tp.relativePosition - relativePosition) <= 0.1
        );

        // カタルシスを確認
        const catharsis = section.emotionalDesign.catharticMoment;
        const isNearCatharsis = catharsis &&
            Math.abs(catharsis.relativePosition - relativePosition) <= 0.1;

        return {
            currentTone,
            arc: {
                opening: emotionalArc.opening,
                midpoint: emotionalArc.midpoint,
                conclusion: emotionalArc.conclusion
            },
            tensionPoint: nearbyTensionPoint,
            isNearCatharsis,
            catharsis: isNearCatharsis ? catharsis : null
        };
    }

    /**
     * 学習関連の情報を取得
     * 
     * @param section セクション情報
     * @returns 学習関連の情報
     */
    private getLearningInfo(section: SectionPlot): any {
        const learning = section.learningJourneyDesign;

        return {
            mainConcept: learning.mainConcept,
            secondaryConcepts: learning.secondaryConcepts,
            primaryLearningStage: learning.primaryLearningStage,
            secondaryLearningStages: learning.secondaryLearningStages,
            objectives: learning.learningObjectives,
            transformationalArc: {
                startingState: learning.transformationalArc.startingState,
                endState: learning.transformationalArc.endState
            },
            conceptEmbodiments: learning.conceptEmbodiments
        };
    }

    /**
     * 章の位置づけを決定
     * 
     * @param relativePosition 相対位置
     * @returns 章の位置づけ
     */
    private determineChapterPosition(relativePosition: number): string {
        if (relativePosition < 0.25) {
            return 'OPENING';
        } else if (relativePosition < 0.75) {
            return 'MIDDLE';
        } else {
            return 'CONCLUSION';
        }
    }

    /**
     * テーマコンテキストを構築
     * 
     * @param section セクション情報
     * @returns テーマコンテキスト
     */
    private buildThemeContext(section: SectionPlot): string {
        const structure = section.structure;
        const learning = section.learningJourneyDesign;
        const emotion = section.emotionalDesign;

        return `
## 「${structure.title}」のテーマと学習目標

### テーマ
${structure.theme}

### 中心概念
${learning.mainConcept}

### モチーフ
${structure.motifs.join(', ')}

### 学習目標
- 認知的目標: ${learning.learningObjectives.cognitive}
- 感情的目標: ${learning.learningObjectives.affective}
- 行動的目標: ${learning.learningObjectives.behavioral}

### 感情的旅路
${emotion.readerEmotionalJourney}

### 期待される感情的リターン
${emotion.emotionalPayoff}
`.trim();
    }

    // ============================================================================
    // メトリクス・診断メソッド
    // ============================================================================

    /**
     * ブリッジメトリクスを更新
     */
    private updateBridgeMetrics(processingTime: number): void {
        // 平均処理時間を更新
        const totalTime = this.bridgeMetrics.averageProcessingTime * (this.bridgeMetrics.totalContextGenerations - 1);
        this.bridgeMetrics.averageProcessingTime = (totalTime + processingTime) / this.bridgeMetrics.totalContextGenerations;

        // キャッシュ効率を計算
        if (this.bridgeMetrics.totalContextGenerations > 0) {
            this.bridgeMetrics.cacheEfficiencyRate = this.bridgeMetrics.memorySystemHits / this.bridgeMetrics.totalContextGenerations;
        }
    }

    /**
     * 診断情報を取得
     */
    async performDiagnostics(): Promise<{
        healthy: boolean;
        issues: string[];
        metrics: BridgeMetrics;
        recommendations: string[];
    }> {
        const issues: string[] = [];
        const recommendations: string[] = [];

        // システム健全性チェック
        if (!this.config.useMemorySystemIntegration) {
            issues.push('Memory system integration is disabled');
            recommendations.push('Enable memory system integration for enhanced context generation');
        }

        // 成功率チェック
        const successRate = this.bridgeMetrics.totalContextGenerations > 0 
            ? this.bridgeMetrics.successfulGenerations / this.bridgeMetrics.totalContextGenerations 
            : 0;

        if (successRate < 0.8) {
            issues.push(`Low context generation success rate: ${(successRate * 100).toFixed(1)}%`);
            recommendations.push('Check memory system connectivity and configuration');
        }

        // キャッシュ効率チェック
        if (this.bridgeMetrics.cacheEfficiencyRate < 0.3) {
            recommendations.push('Consider optimizing memory access patterns');
        }

        // 処理時間チェック
        if (this.bridgeMetrics.averageProcessingTime > 5000) {
            issues.push('High average processing time detected');
            recommendations.push('Consider enabling cache optimization');
        }

        const healthy = issues.length === 0;

        return {
            healthy,
            issues,
            metrics: { ...this.bridgeMetrics },
            recommendations
        };
    }

    /**
     * 設定を更新
     */
    updateConfiguration(newConfig: Partial<SectionBridgeConfig>): void {
        this.config = { ...this.config, ...newConfig };
        logger.info('SectionBridge configuration updated', { config: this.config });
    }

    /**
     * メトリクスをリセット
     */
    resetMetrics(): void {
        this.bridgeMetrics = {
            totalContextGenerations: 0,
            successfulGenerations: 0,
            failedGenerations: 0,
            averageProcessingTime: 0,
            memorySystemHits: 0,
            cacheEfficiencyRate: 0,
            lastOptimization: new Date().toISOString()
        };
        logger.info('SectionBridge metrics reset');
    }

    /**
     * メトリクスを取得
     */
    getMetrics(): BridgeMetrics {
        return { ...this.bridgeMetrics };
    }
}