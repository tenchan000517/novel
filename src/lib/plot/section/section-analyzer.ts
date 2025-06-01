// src/lib/plot/section/section-analyzer.ts
/**
 * @fileoverview 中期プロット（篇）の実装状態を分析するクラス（新記憶階層システム対応版）
 * @description
 * 篇の一貫性分析、学習目標達成度分析、感情アーク実現度分析、
 * および改善提案を行うためのクラス。
 * 新しい統合記憶階層システムに完全対応し、統一アクセスAPIを活用。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { logError } from '@/lib/utils/error-handler';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { SectionPlotManager } from './section-plot-manager';
import {
    SectionPlot,
    CoherenceAnalysis,
    ObjectiveProgress,
    EmotionalArcProgress,
    ImprovementSuggestion,
    EmotionalCurvePoint
} from './types';

// 新記憶階層システムの型をインポート
import { 
    MemoryLevel, 
    UnifiedSearchResult, 
    SystemOperationResult,
} from '@/lib/memory/core/types';

/**
 * @interface SectionAnalyzerConfig
 * @description SectionAnalyzerの設定
 */
interface SectionAnalyzerConfig {
    useMemorySystemIntegration: boolean;
    enableCacheOptimization: boolean;
    fallbackToLocalAnalysis: boolean;
    maxAnalysisRetries: number;
    analysisTimeout: number;
}

/**
 * @interface AnalysisMetrics
 * @description 分析パフォーマンスメトリクス
 */
interface AnalysisMetrics {
    totalAnalyses: number;
    successfulAnalyses: number;
    failedAnalyses: number;
    averageProcessingTime: number;
    memorySystemHits: number;
    cacheEfficiencyRate: number;
    lastOptimization: string;
}

/**
 * @class SectionAnalyzer
 * @description 篇の実装状態を分析するクラス（新記憶階層システム対応）
 */
export class SectionAnalyzer {
    private config: SectionAnalyzerConfig;
    private analysisMetrics: AnalysisMetrics;

    /**
     * コンストラクタ
     * 
     * @param sectionPlotManager セクションプロットマネージャー
     * @param memoryManager 統合記憶管理システム（新システム）
     * @param geminiClient Geminiクライアント
     * @param options 設定オプション
     */
    constructor(
        private sectionPlotManager: SectionPlotManager,
        private memoryManager: MemoryManager,
        private geminiClient: GeminiClient,
        private options: Partial<SectionAnalyzerConfig> = {}
    ) {
        this.config = {
            useMemorySystemIntegration: true,
            enableCacheOptimization: true,
            fallbackToLocalAnalysis: true,
            maxAnalysisRetries: 3,
            analysisTimeout: 30000,
            ...options
        };

        this.analysisMetrics = {
            totalAnalyses: 0,
            successfulAnalyses: 0,
            failedAnalyses: 0,
            averageProcessingTime: 0,
            memorySystemHits: 0,
            cacheEfficiencyRate: 0,
            lastOptimization: new Date().toISOString()
        };

        logger.info('SectionAnalyzer initialized with new memory hierarchy system', {
            config: this.config
        });
    }

    /**
     * セクションの一貫性を分析
     * 
     * @param sectionId セクションID
     * @returns 一貫性分析結果
     */
    async analyzeSectionCoherence(sectionId: string): Promise<CoherenceAnalysis> {
        const startTime = Date.now();
        this.analysisMetrics.totalAnalyses++;

        try {
            logger.info(`Analyzing coherence for section ${sectionId} using unified memory system`);

            // セクション情報を取得
            const section = await this.sectionPlotManager.getSection(sectionId);
            if (!section) {
                throw new Error(`Section ${sectionId} not found`);
            }

            // 章範囲を取得
            const { start, end } = section.chapterRange;

            // 新記憶階層システムから章データを安全に取得
            const chapters = await this.getChapterDataSafely(start, end);

            // 章が見つからない場合
            if (chapters.length === 0) {
                return this.generateDefaultCoherenceAnalysis();
            }

            // 統合記憶システムから追加コンテキストを取得
            const memoryContext = await this.getUnifiedMemoryContext(start, end);

            // AIによる一貫性分析
            const aiAnalysisResult = await this.performAICoherenceAnalysis(
                section, 
                chapters, 
                memoryContext
            );

            this.analysisMetrics.successfulAnalyses++;
            this.updateAnalysisMetrics(Date.now() - startTime);

            logger.info(`Successfully analyzed coherence for section ${sectionId}`, {
                processingTime: Date.now() - startTime,
                chapterCount: chapters.length,
                memoryContextUsed: !!memoryContext
            });

            return aiAnalysisResult;

        } catch (error) {
            this.analysisMetrics.failedAnalyses++;
            logError(error, { sectionId }, 'Failed to analyze section coherence');
            
            // フォールバック処理
            if (this.config.fallbackToLocalAnalysis) {
                logger.warn('Falling back to local analysis for coherence');
                return this.generateDefaultCoherenceAnalysis();
            }
            
            throw error;
        }
    }

    /**
     * 学習目標達成度を分析
     * 
     * @param sectionId セクションID
     * @returns 学習目標達成度分析結果
     */
    async analyzeLearningObjectiveProgress(sectionId: string): Promise<ObjectiveProgress> {
        const startTime = Date.now();
        this.analysisMetrics.totalAnalyses++;

        try {
            logger.info(`Analyzing learning objective progress for section ${sectionId}`);

            // セクション情報を取得
            const section = await this.sectionPlotManager.getSection(sectionId);
            if (!section) {
                throw new Error(`Section ${sectionId} not found`);
            }

            // 章範囲を取得
            const { start, end } = section.chapterRange;

            // 統合記憶システムから分析データを取得
            const analysisContext = await this.getAnalysisContextFromMemory(start, end);
            const chapters = await this.getChapterDataSafely(start, end);

            // 章が見つからない場合
            if (chapters.length === 0) {
                return this.generateDefaultObjectiveProgress(section);
            }

            // AIによる学習目標達成度分析
            const aiAnalysisResult = await this.performAIObjectiveAnalysis(
                section, 
                chapters, 
                analysisContext
            );

            this.analysisMetrics.successfulAnalyses++;
            this.updateAnalysisMetrics(Date.now() - startTime);

            logger.info(`Successfully analyzed learning objective progress for section ${sectionId}`, {
                processingTime: Date.now() - startTime,
                chapterCount: chapters.length
            });

            return aiAnalysisResult;

        } catch (error) {
            this.analysisMetrics.failedAnalyses++;
            logError(error, { sectionId }, 'Failed to analyze learning objective progress');

            // フォールバック処理
            if (this.config.fallbackToLocalAnalysis) {
                try {
                    const section = await this.sectionPlotManager.getSection(sectionId);
                    if (section) {
                        return this.generateDefaultObjectiveProgress(section);
                    }
                } catch (getError) {
                    logger.warn('Failed to get section for fallback analysis', { getError });
                }
            }

            // 完全なデフォルト分析を返す
            return {
                cognitiveProgress: 0.5,
                affectiveProgress: 0.4,
                behavioralProgress: 0.3,
                examples: [],
                gaps: ['分析に必要なデータが不足しています']
            };
        }
    }

    /**
     * 感情アーク実現度を分析
     * 
     * @param sectionId セクションID
     * @returns 感情アーク実現度分析結果
     */
    async analyzeEmotionalArcRealization(sectionId: string): Promise<EmotionalArcProgress> {
        const startTime = Date.now();
        this.analysisMetrics.totalAnalyses++;

        try {
            logger.info(`Analyzing emotional arc realization for section ${sectionId}`);

            // セクション情報を取得
            const section = await this.sectionPlotManager.getSection(sectionId);
            if (!section) {
                throw new Error(`Section ${sectionId} not found`);
            }

            // 章範囲を取得
            const { start, end } = section.chapterRange;

            // 統合記憶システムから感情データを取得
            const emotionalContext = await this.getEmotionalContextFromMemory(start, end);
            const chapters = await this.getChapterDataSafely(start, end);

            // 章が見つからない場合
            if (chapters.length === 0) {
                return this.generateDefaultEmotionalArcProgress(section);
            }

            // AIによる感情アーク実現度分析
            const aiAnalysisResult = await this.performAIEmotionalAnalysis(
                section, 
                chapters, 
                emotionalContext
            );

            this.analysisMetrics.successfulAnalyses++;
            this.updateAnalysisMetrics(Date.now() - startTime);

            logger.info(`Successfully analyzed emotional arc realization for section ${sectionId}`, {
                processingTime: Date.now() - startTime,
                chapterCount: chapters.length
            });

            return aiAnalysisResult;

        } catch (error) {
            this.analysisMetrics.failedAnalyses++;
            logError(error, { sectionId }, 'Failed to analyze emotional arc realization');

            // フォールバック処理
            if (this.config.fallbackToLocalAnalysis) {
                try {
                    const section = await this.sectionPlotManager.getSection(sectionId);
                    if (section) {
                        return this.generateDefaultEmotionalArcProgress(section);
                    }
                } catch (getError) {
                    logger.warn('Failed to get section for fallback analysis', { getError });
                }
            }

            // 完全なデフォルト分析を返す
            return {
                overallRealization: 0.5,
                stageRealization: {
                    opening: 0.6,
                    midpoint: 0.5,
                    conclusion: 0.4
                },
                tensionPointsRealization: [],
                catharticRealization: {
                    realized: false
                }
            };
        }
    }

    /**
     * 改善提案を生成
     * 
     * @param sectionId セクションID
     * @returns 改善提案の配列
     */
    async suggestSectionImprovements(sectionId: string): Promise<ImprovementSuggestion[]> {
        const startTime = Date.now();
        this.analysisMetrics.totalAnalyses++;

        try {
            logger.info(`Generating improvement suggestions for section ${sectionId}`);

            // セクション情報を取得
            const section = await this.sectionPlotManager.getSection(sectionId);
            if (!section) {
                throw new Error(`Section ${sectionId} not found`);
            }

            // 各種分析を実行
            const [coherenceAnalysis, objectiveProgress, emotionalArcProgress] = await Promise.all([
                this.analyzeSectionCoherence(sectionId),
                this.analyzeLearningObjectiveProgress(sectionId),
                this.analyzeEmotionalArcRealization(sectionId)
            ]);

            // 統合記憶システムから改善コンテキストを取得
            const improvementContext = await this.getImprovementContextFromMemory(section);

            // AIによる改善提案の生成
            const aiSuggestions = await this.performAIImprovementAnalysis(
                section,
                coherenceAnalysis,
                objectiveProgress,
                emotionalArcProgress,
                improvementContext
            );

            this.analysisMetrics.successfulAnalyses++;
            this.updateAnalysisMetrics(Date.now() - startTime);

            logger.info(`Successfully generated ${aiSuggestions.length} improvement suggestions for section ${sectionId}`, {
                processingTime: Date.now() - startTime
            });

            return aiSuggestions;

        } catch (error) {
            this.analysisMetrics.failedAnalyses++;
            logError(error, { sectionId }, 'Failed to suggest section improvements');

            // フォールバック処理
            if (this.config.fallbackToLocalAnalysis) {
                try {
                    const section = await this.sectionPlotManager.getSection(sectionId);
                    if (section) {
                        return this.generateDefaultImprovementSuggestions(section);
                    }
                } catch (getError) {
                    logger.warn('Failed to get section for fallback suggestions', { getError });
                }
            }

            // 完全なデフォルト提案を返す
            return [{
                area: 'theme',
                suggestion: 'テーマの一貫性を強化する',
                targetChapters: [],
                priority: 3
            }];
        }
    }

    // ============================================================================
    // 新記憶階層システム統合メソッド
    // ============================================================================

    /**
     * 統合記憶システムから章データを安全に取得
     */
    private async getChapterDataSafely(startChapter: number, endChapter: number): Promise<Array<{
        chapterNumber: number;
        title: string;
        content: string;
    }>> {
        if (!this.config.useMemorySystemIntegration) {
            logger.debug('Memory system integration disabled, returning empty chapters');
            return [];
        }

        try {
            // 統合検索を使用して章データを取得
            const searchQuery = `chapters ${startChapter} to ${endChapter} content analysis data`;
            const searchResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    searchQuery,
                    [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
                ),
                { success: false, results: [], totalResults: 0, processingTime: 0, suggestions: [] },
                'getChapterDataSafely'
            );

            if (!searchResult.success || searchResult.totalResults === 0) {
                logger.warn('No chapter data found in memory system', { 
                    startChapter, 
                    endChapter 
                });
                return [];
            }

            this.analysisMetrics.memorySystemHits++;

            // 検索結果から章データを抽出
            const chapters: Array<{
                chapterNumber: number;
                title: string;
                content: string;
            }> = [];

            for (const result of searchResult.results) {
                if (result.type === 'chapter' && result.data) {
                    // Chapter型のデータを安全に変換
                    const chapterData = this.extractChapterFromResult(result.data, startChapter, endChapter);
                    if (chapterData) {
                        chapters.push(chapterData);
                    }
                }
            }

            // 章番号でソート
            chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);

            logger.debug(`Retrieved ${chapters.length} chapters from memory system`, {
                startChapter,
                endChapter,
                chapterNumbers: chapters.map(c => c.chapterNumber)
            });

            return chapters;

        } catch (error) {
            logger.error('Failed to get chapter data from memory system', { 
                error, 
                startChapter, 
                endChapter 
            });
            return [];
        }
    }

    /**
     * 検索結果から章データを抽出
     */
    private extractChapterFromResult(
        resultData: any, 
        startChapter: number, 
        endChapter: number
    ): { chapterNumber: number; title: string; content: string; } | null {
        try {
            // Chapter型の構造に合わせて抽出
            if (resultData.chapterNumber >= startChapter && 
                resultData.chapterNumber <= endChapter) {
                
                return {
                    chapterNumber: resultData.chapterNumber,
                    title: resultData.title || `第${resultData.chapterNumber}章`,
                    content: (resultData.content || '').substring(0, 2000) // 分析用に短縮
                };
            }
            return null;
        } catch (error) {
            logger.warn('Failed to extract chapter from result data', { error, resultData });
            return null;
        }
    }

    /**
     * 統合記憶コンテキストを取得
     */
    private async getUnifiedMemoryContext(startChapter: number, endChapter: number): Promise<any> {
        try {
            const searchQuery = `narrative context chapters ${startChapter} to ${endChapter}`;
            const searchResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    searchQuery,
                    [MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
                ),
                null,
                'getUnifiedMemoryContext'
            );

            return searchResult?.results || null;
        } catch (error) {
            logger.warn('Failed to get unified memory context', { error });
            return null;
        }
    }

    /**
     * 分析コンテキストを取得
     */
    private async getAnalysisContextFromMemory(startChapter: number, endChapter: number): Promise<any> {
        try {
            const searchQuery = `analysis results character evolution narrative progression chapters ${startChapter} ${endChapter}`;
            const searchResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    searchQuery,
                    [MemoryLevel.MID_TERM]
                ),
                null,
                'getAnalysisContextFromMemory'
            );

            return searchResult?.results || null;
        } catch (error) {
            logger.warn('Failed to get analysis context from memory', { error });
            return null;
        }
    }

    /**
     * 感情コンテキストを取得
     */
    private async getEmotionalContextFromMemory(startChapter: number, endChapter: number): Promise<any> {
        try {
            const searchQuery = `emotional analysis emotional arc tension points chapters ${startChapter} ${endChapter}`;
            const searchResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    searchQuery,
                    [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
                ),
                null,
                'getEmotionalContextFromMemory'
            );

            return searchResult?.results || null;
        } catch (error) {
            logger.warn('Failed to get emotional context from memory', { error });
            return null;
        }
    }

    /**
     * 改善コンテキストを取得
     */
    private async getImprovementContextFromMemory(section: SectionPlot): Promise<any> {
        try {
            const searchQuery = `improvement patterns quality metrics system knowledge section analysis`;
            const searchResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    searchQuery,
                    [MemoryLevel.LONG_TERM]
                ),
                null,
                'getImprovementContextFromMemory'
            );

            return searchResult?.results || null;
        } catch (error) {
            logger.warn('Failed to get improvement context from memory', { error });
            return null;
        }
    }

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
            logger.error(`${operationName} failed`, { error });
            return fallbackValue;
        }
    }

    // ============================================================================
    // AI分析実行メソッド
    // ============================================================================

    /**
     * AI一貫性分析を実行
     */
    private async performAICoherenceAnalysis(
        section: SectionPlot,
        chapters: Array<{ chapterNumber: number; title: string; content: string }>,
        memoryContext: any
    ): Promise<CoherenceAnalysis> {
        const prompt = this.buildCoherenceAnalysisPrompt(section, chapters, memoryContext);
        let response: string = '';

        try {
            response = await apiThrottler.throttledRequest(() =>
                this.geminiClient.generateText(prompt, { responseFormat: "json" })
            );

            const analysis = JSON.parse(response);

            // 基本的な検証
            if (analysis &&
                typeof analysis.overallScore === 'number' &&
                Array.isArray(analysis.problematicAreas) &&
                Array.isArray(analysis.improvementSuggestions)) {

                logger.info(`Successfully analyzed coherence for section ${section.structure.title}`);
                return analysis;
            }

            logger.warn('AI response is not a valid coherence analysis', { response });
            return this.generateDefaultCoherenceAnalysis();
        } catch (parseError) {
            logger.error('Failed to parse AI response as JSON', {
                error: parseError instanceof Error ? parseError.message : String(parseError),
                response
            });
            return this.generateDefaultCoherenceAnalysis();
        }
    }

    /**
     * AI目標分析を実行
     */
    private async performAIObjectiveAnalysis(
        section: SectionPlot,
        chapters: Array<{ chapterNumber: number; title: string; content: string }>,
        analysisContext: any
    ): Promise<ObjectiveProgress> {
        const prompt = this.buildObjectiveAnalysisPrompt(section, chapters, analysisContext);
        let response: string = '';

        try {
            response = await apiThrottler.throttledRequest(() =>
                this.geminiClient.generateText(prompt, { responseFormat: "json" })
            );

            const analysis = JSON.parse(response);

            // 基本的な検証
            if (analysis &&
                typeof analysis.cognitiveProgress === 'number' &&
                typeof analysis.affectiveProgress === 'number' &&
                typeof analysis.behavioralProgress === 'number' &&
                Array.isArray(analysis.examples) &&
                Array.isArray(analysis.gaps)) {

                // 進捗率を0〜1の範囲に修正
                analysis.cognitiveProgress = Math.max(0, Math.min(1, analysis.cognitiveProgress));
                analysis.affectiveProgress = Math.max(0, Math.min(1, analysis.affectiveProgress));
                analysis.behavioralProgress = Math.max(0, Math.min(1, analysis.behavioralProgress));

                logger.info(`Successfully analyzed learning objective progress for section ${section.structure.title}`);
                return analysis;
            }

            logger.warn('AI response is not a valid objective progress analysis', { response });
            return this.generateDefaultObjectiveProgress(section);
        } catch (parseError) {
            logger.error('Failed to parse AI response as JSON', {
                error: parseError instanceof Error ? parseError.message : String(parseError),
                response
            });
            return this.generateDefaultObjectiveProgress(section);
        }
    }

    /**
     * AI感情分析を実行
     */
    private async performAIEmotionalAnalysis(
        section: SectionPlot,
        chapters: Array<{ chapterNumber: number; title: string; content: string }>,
        emotionalContext: any
    ): Promise<EmotionalArcProgress> {
        const prompt = this.buildEmotionalAnalysisPrompt(section, chapters, emotionalContext);
        let response: string = '';

        try {
            response = await apiThrottler.throttledRequest(() =>
                this.geminiClient.generateText(prompt, { responseFormat: "json" })
            );

            const analysis = JSON.parse(response);

            // 基本的な検証
            if (analysis &&
                typeof analysis.overallRealization === 'number' &&
                analysis.stageRealization &&
                Array.isArray(analysis.tensionPointsRealization) &&
                analysis.catharticRealization) {

                // 実現度を0〜1の範囲に修正
                analysis.overallRealization = Math.max(0, Math.min(1, analysis.overallRealization));
                if (analysis.stageRealization) {
                    analysis.stageRealization.opening = Math.max(0, Math.min(1, analysis.stageRealization.opening));
                    analysis.stageRealization.midpoint = Math.max(0, Math.min(1, analysis.stageRealization.midpoint));
                    analysis.stageRealization.conclusion = Math.max(0, Math.min(1, analysis.stageRealization.conclusion));
                }

                logger.info(`Successfully analyzed emotional arc realization for section ${section.structure.title}`);
                return analysis;
            }

            logger.warn('AI response is not a valid emotional arc progress analysis', { response });
            return this.generateDefaultEmotionalArcProgress(section);
        } catch (parseError) {
            logger.error('Failed to parse AI response as JSON', {
                error: parseError instanceof Error ? parseError.message : String(parseError),
                response
            });
            return this.generateDefaultEmotionalArcProgress(section);
        }
    }

    /**
     * AI改善分析を実行
     */
    private async performAIImprovementAnalysis(
        section: SectionPlot,
        coherenceAnalysis: CoherenceAnalysis,
        objectiveProgress: ObjectiveProgress,
        emotionalArcProgress: EmotionalArcProgress,
        improvementContext: any
    ): Promise<ImprovementSuggestion[]> {
        const prompt = this.buildImprovementAnalysisPrompt(
            section,
            coherenceAnalysis,
            objectiveProgress,
            emotionalArcProgress,
            improvementContext
        );
        let response: string = '';

        try {
            response = await apiThrottler.throttledRequest(() =>
                this.geminiClient.generateText(prompt, { responseFormat: "json" })
            );

            const suggestions = JSON.parse(response);

            // 基本的な検証
            if (Array.isArray(suggestions)) {
                logger.info(`Successfully generated ${suggestions.length} improvement suggestions for section ${section.structure.title}`);
                return suggestions;
            }

            logger.warn('AI response is not a valid array of improvement suggestions', { response });
            return this.generateDefaultImprovementSuggestions(section, coherenceAnalysis, objectiveProgress);
        } catch (parseError) {
            logger.error('Failed to parse AI response as JSON', {
                error: parseError instanceof Error ? parseError.message : String(parseError),
                response
            });
            return this.generateDefaultImprovementSuggestions(section, coherenceAnalysis, objectiveProgress);
        }
    }

    // ============================================================================
    // プロンプト構築メソッド
    // ============================================================================

    /**
     * 一貫性分析プロンプトを構築
     */
    private buildCoherenceAnalysisPrompt(
        section: SectionPlot,
        chapters: Array<{ chapterNumber: number; title: string; content: string }>,
        memoryContext: any
    ): string {
        const contextInfo = memoryContext ? `
【統合記憶システムからの追加コンテキスト】
${JSON.stringify(memoryContext, null, 2).substring(0, 500)}...
` : '';

        return `
あなたは物語の一貫性分析の専門家です。
以下のセクション「${section.structure.title}」の概要と、含まれる章の内容に基づいて、一貫性を分析してください。

【セクション情報】
- テーマ: ${section.structure.theme}
- 主要概念: ${section.learningJourneyDesign.mainConcept}
- 学習段階: ${section.learningJourneyDesign.primaryLearningStage}
- 章範囲: ${section.chapterRange.start}〜${section.chapterRange.end}章

【章の内容概要】
${chapters.map(ch => `
第${ch.chapterNumber}章「${ch.title}」
${ch.content.substring(0, 200)}...
`).join('\n')}

${contextInfo}

以下の観点から一貫性を分析してください:
1. テーマの一貫性
2. キャラクターの一貫性
3. プロット展開の一貫性
4. 設定の一貫性
5. トーンや雰囲気の一貫性

結果はJSON形式で、次のフォーマットで出力してください:
{
  "overallScore": 7,
  "problematicAreas": [
    {
      "type": "theme",
      "description": "問題の説明",
      "severity": 5
    }
  ],
  "improvementSuggestions": [
    "改善提案1",
    "改善提案2"
  ]
}

overallScoreは0〜10の整数で、problematicAreasのtypeは'theme'|'character'|'plot'|'setting'|'tone'のいずれかを使用し、severityは0〜10の整数で表してください。
`;
    }

    /**
     * 目標分析プロンプトを構築
     */
    private buildObjectiveAnalysisPrompt(
        section: SectionPlot,
        chapters: Array<{ chapterNumber: number; title: string; content: string }>,
        analysisContext: any
    ): string {
        const contextInfo = analysisContext ? `
【分析コンテキスト】
${JSON.stringify(analysisContext, null, 2).substring(0, 500)}...
` : '';

        const objectives = section.learningJourneyDesign.learningObjectives;
        const mainConcept = section.learningJourneyDesign.mainConcept;

        return `
あなたは教育目標達成度分析の専門家です。
以下のセクション「${section.structure.title}」の学習目標と、含まれる章の内容に基づいて、目標達成度を分析してください。

【セクション情報】
- 主要概念: ${mainConcept}
- 学習段階: ${section.learningJourneyDesign.primaryLearningStage}

【学習目標】
- 認知的目標: ${objectives.cognitive}
- 感情的目標: ${objectives.affective}
- 行動的目標: ${objectives.behavioral}

【章の内容概要】
${chapters.map(ch => `
第${ch.chapterNumber}章「${ch.title}」
${ch.content.substring(0, 200)}...
`).join('\n')}

${contextInfo}

以下の観点から学習目標の達成度を分析してください:
1. 認知的目標の達成度（0.0〜1.0）
2. 感情的目標の達成度（0.0〜1.0）
3. 行動的目標の達成度（0.0〜1.0）
4. 各目標タイプの具体的な例（章番号付き）
5. 達成のギャップや課題

結果はJSON形式で、次のフォーマットで出力してください:
{
  "cognitiveProgress": 0.7,
  "affectiveProgress": 0.5,
  "behavioralProgress": 0.3,
  "examples": [
    {
      "objectiveType": "cognitive",
      "description": "例の説明",
      "chapterNumber": 5
    }
  ],
  "gaps": [
    "ギャップ1",
    "ギャップ2"
  ]
}
`;
    }

    /**
     * 感情分析プロンプトを構築
     */
    private buildEmotionalAnalysisPrompt(
        section: SectionPlot,
        chapters: Array<{ chapterNumber: number; title: string; content: string }>,
        emotionalContext: any
    ): string {
        const contextInfo = emotionalContext ? `
【感情コンテキスト】
${JSON.stringify(emotionalContext, null, 2).substring(0, 500)}...
` : '';

        const emotionalDesign = section.emotionalDesign;
        const emotionalArc = emotionalDesign.emotionalArc;
        const tensionPoints = emotionalDesign.tensionPoints;
        const catharticMoment = emotionalDesign.catharticMoment;

        return `
あなたは物語の感情分析の専門家です。
以下のセクション「${section.structure.title}」の計画された感情アークと、実際の章の内容に基づいて、感情アークの実現度を分析してください。

【計画された感情アーク】
- 開始: ${emotionalArc.opening}
- 中間点: ${emotionalArc.midpoint}
- 結末: ${emotionalArc.conclusion}

【計画された緊張ポイント】
${tensionPoints.map((tp, i) => `${i + 1}. 位置: ${tp.relativePosition}, 強度: ${tp.intensity}, 説明: ${tp.description}`).join('\n')}

【計画されたカタルシスの瞬間】
位置: ${catharticMoment.relativePosition}, タイプ: ${catharticMoment.type}, 説明: ${catharticMoment.description}

【章の内容概要】
${chapters.map(ch => `
第${ch.chapterNumber}章「${ch.title}」
${ch.content.substring(0, 200)}...
`).join('\n')}

${contextInfo}

以下の観点から感情アークの実現度を分析してください:
1. 全体的な実現度（0.0〜1.0）
2. 段階ごとの実現度（開始、中間点、結末）
3. 緊張ポイントの実現
4. カタルシスの実現

結果はJSON形式で、次のフォーマットで出力してください:
{
  "overallRealization": 0.7,
  "stageRealization": {
    "opening": 0.8,
    "midpoint": 0.6,
    "conclusion": 0.7
  },
  "tensionPointsRealization": [
    {
      "planned": {
        "relativePosition": 0.3,
        "intensity": 0.7,
        "description": "緊張ポイントの説明"
      },
      "actual": {
        "chapter": 5,
        "intensity": 0.6,
        "description": "実際の描写"
      }
    }
  ],
  "catharticRealization": {
    "realized": true,
    "actualChapter": 8,
    "description": "実際のカタルシスの描写"
  }
}
`;
    }

    /**
     * 改善分析プロンプトを構築
     */
    private buildImprovementAnalysisPrompt(
        section: SectionPlot,
        coherenceAnalysis: CoherenceAnalysis,
        objectiveProgress: ObjectiveProgress,
        emotionalArcProgress: EmotionalArcProgress,
        improvementContext: any
    ): string {
        const contextInfo = improvementContext ? `
【改善コンテキスト（システム知識より）】
${JSON.stringify(improvementContext, null, 2).substring(0, 500)}...
` : '';

        return `
あなたは物語構造と学習内容の改善アドバイザーです。
以下のセクション「${section.structure.title}」の分析結果に基づいて、具体的な改善提案を作成してください。

【セクション情報】
- テーマ: ${section.structure.theme}
- 主要概念: ${section.learningJourneyDesign.mainConcept}
- 学習段階: ${section.learningJourneyDesign.primaryLearningStage}
- 章範囲: ${section.chapterRange.start}〜${section.chapterRange.end}章

【一貫性分析結果】
全体スコア: ${coherenceAnalysis.overallScore}/10
問題領域: 
${coherenceAnalysis.problematicAreas.map(area => `- ${area.type}: ${area.description} (深刻度: ${area.severity}/10)`).join('\n')}

【学習目標達成度】
認知的目標: ${Math.round(objectiveProgress.cognitiveProgress * 100)}%
感情的目標: ${Math.round(objectiveProgress.affectiveProgress * 100)}%
行動的目標: ${Math.round(objectiveProgress.behavioralProgress * 100)}%
ギャップ: 
${objectiveProgress.gaps.map(gap => `- ${gap}`).join('\n')}

【感情アーク実現度】
全体実現度: ${Math.round(emotionalArcProgress.overallRealization * 100)}%
カタルシス実現: ${emotionalArcProgress.catharticRealization.realized ? '達成済み' : '未達成'}

${contextInfo}

以下の領域で改善提案を作成してください:
1. テーマ/一貫性の改善
2. キャラクター開発の改善
3. 学習内容の改善
4. 感情表現の改善
5. ペース配分の改善

結果はJSONの配列形式で、次のフォーマットで出力してください:
[
  {
    "area": "theme",
    "suggestion": "改善提案の詳細",
    "targetChapters": [5, 6, 7],
    "priority": 4
  }
]

areaは'theme'|'character'|'learning'|'emotion'|'plot'|'pacing'のいずれかを使用し、priorityは1〜5の整数で、5が最も高い優先度を表します。
`;
    }

    // ============================================================================
    // デフォルト生成メソッド（既存機能保持）
    // ============================================================================

    /**
     * デフォルトの一貫性分析結果を生成
     */
    private generateDefaultCoherenceAnalysis(): CoherenceAnalysis {
        return {
            overallScore: 5,
            problematicAreas: [
                {
                    type: 'theme',
                    description: '中心テーマの一貫性が不明確',
                    severity: 5
                },
                {
                    type: 'plot',
                    description: '物語の展開に断絶がある可能性',
                    severity: 4
                }
            ],
            improvementSuggestions: [
                'セクション全体を通じたテーマの強調',
                '章間の連続性の強化',
                'キャラクターの動機の明確化'
            ]
        };
    }

    /**
     * デフォルトの学習目標達成度分析結果を生成
     */
    private generateDefaultObjectiveProgress(section: SectionPlot): ObjectiveProgress {
        const mainConcept = section.learningJourneyDesign.mainConcept;

        return {
            cognitiveProgress: 0.5,
            affectiveProgress: 0.4,
            behavioralProgress: 0.3,
            examples: [
                {
                    objectiveType: 'cognitive',
                    description: `${mainConcept}の概念に関する基本的な理解`,
                    chapterNumber: section.chapterRange.start + 1
                },
                {
                    objectiveType: 'affective',
                    description: `${mainConcept}に対する共感的な反応`,
                    chapterNumber: section.chapterRange.start + 2
                }
            ],
            gaps: [
                '行動的目標に関する具体的な例示が不足',
                '概念の複雑な側面についての深い理解が必要'
            ]
        };
    }

    /**
     * デフォルトの感情アーク実現度分析結果を生成
     */
    private generateDefaultEmotionalArcProgress(section: SectionPlot): EmotionalArcProgress {
        const emotionalDesign = section.emotionalDesign;
        const { start } = section.chapterRange;

        return {
            overallRealization: 0.6,
            stageRealization: {
                opening: 0.7,
                midpoint: 0.6,
                conclusion: 0.5
            },
            tensionPointsRealization: emotionalDesign.tensionPoints.map((tp, index) => ({
                planned: {
                    relativePosition: tp.relativePosition,
                    intensity: tp.intensity,
                    description: tp.description
                },
                actual: index === 0 ? {
                    chapter: start + Math.floor(tp.relativePosition * 3),
                    intensity: 0.6,
                    description: '部分的に実現された緊張ポイント'
                } : null
            })),
            catharticRealization: {
                realized: false,
                description: 'まだ実現されていません'
            }
        };
    }

    /**
     * デフォルトの改善提案を生成
     */
    private generateDefaultImprovementSuggestions(
        section: SectionPlot,
        coherenceAnalysis?: CoherenceAnalysis,
        objectiveProgress?: ObjectiveProgress
    ): ImprovementSuggestion[] {
        const { start, end } = section.chapterRange;
        const mainConcept = section.learningJourneyDesign.mainConcept;

        const suggestions: ImprovementSuggestion[] = [
            {
                area: 'theme',
                suggestion: `セクション全体を通じて「${section.structure.theme}」というテーマをより一貫して強調する`,
                targetChapters: [start, end],
                priority: 4
            },
            {
                area: 'learning',
                suggestion: `「${mainConcept}」の概念に対する理解の深化プロセスをより明確に描く`,
                targetChapters: Array.from({ length: end - start + 1 }, (_, i) => start + i),
                priority: 5
            },
            {
                area: 'emotion',
                suggestion: 'カタルシスの瞬間をより効果的に表現し、感情的クライマックスを強化する',
                targetChapters: [end - 1, end],
                priority: 3
            }
        ];

        // 一貫性分析から問題点を追加
        if (coherenceAnalysis && coherenceAnalysis.problematicAreas.length > 0) {
            const worstArea = coherenceAnalysis.problematicAreas.sort((a, b) => b.severity - a.severity)[0];

            // 型の変換マッピングを作成
            const typeToArea = (type: 'theme' | 'character' | 'plot' | 'setting' | 'tone'): 'theme' | 'character' | 'learning' | 'emotion' | 'plot' | 'pacing' => {
                switch (type) {
                    case 'theme': return 'theme';
                    case 'character': return 'character';
                    case 'plot': return 'plot';
                    case 'setting': return 'pacing'; // settingをpacingにマッピング
                    case 'tone': return 'emotion';   // toneをemotionにマッピング
                    default: return 'theme';         // デフォルト値
                }
            };

            suggestions.push({
                area: typeToArea(worstArea.type),
                suggestion: `${worstArea.description}の問題を解決する`,
                targetChapters: Array.from({ length: end - start + 1 }, (_, i) => start + i),
                priority: Math.min(5, Math.ceil(worstArea.severity / 2))
            });
        }

        // 学習目標のギャップを追加
        if (objectiveProgress && objectiveProgress.gaps.length > 0) {
            suggestions.push({
                area: 'learning',
                suggestion: objectiveProgress.gaps[0],
                targetChapters: [Math.floor((start + end) / 2)],
                priority: 4
            });
        }

        return suggestions;
    }

    // ============================================================================
    // メトリクス・診断メソッド
    // ============================================================================

    /**
     * 分析メトリクスを更新
     */
    private updateAnalysisMetrics(processingTime: number): void {
        // 平均処理時間を更新
        const totalTime = this.analysisMetrics.averageProcessingTime * (this.analysisMetrics.totalAnalyses - 1);
        this.analysisMetrics.averageProcessingTime = (totalTime + processingTime) / this.analysisMetrics.totalAnalyses;

        // キャッシュ効率を計算
        if (this.analysisMetrics.totalAnalyses > 0) {
            this.analysisMetrics.cacheEfficiencyRate = this.analysisMetrics.memorySystemHits / this.analysisMetrics.totalAnalyses;
        }
    }

    /**
     * 診断情報を取得
     */
    async performDiagnostics(): Promise<{
        healthy: boolean;
        issues: string[];
        metrics: AnalysisMetrics;
        recommendations: string[];
    }> {
        const issues: string[] = [];
        const recommendations: string[] = [];

        // システム健全性チェック
        if (!this.config.useMemorySystemIntegration) {
            issues.push('Memory system integration is disabled');
            recommendations.push('Enable memory system integration for enhanced analysis');
        }

        // 成功率チェック
        const successRate = this.analysisMetrics.totalAnalyses > 0 
            ? this.analysisMetrics.successfulAnalyses / this.analysisMetrics.totalAnalyses 
            : 0;

        if (successRate < 0.8) {
            issues.push(`Low analysis success rate: ${(successRate * 100).toFixed(1)}%`);
            recommendations.push('Check system configuration and AI service availability');
        }

        // キャッシュ効率チェック
        if (this.analysisMetrics.cacheEfficiencyRate < 0.3) {
            recommendations.push('Consider optimizing memory access patterns');
        }

        // 処理時間チェック
        if (this.analysisMetrics.averageProcessingTime > 10000) {
            issues.push('High average processing time detected');
            recommendations.push('Consider enabling cache optimization');
        }

        const healthy = issues.length === 0;

        return {
            healthy,
            issues,
            metrics: { ...this.analysisMetrics },
            recommendations
        };
    }

    /**
     * 設定を更新
     */
    updateConfiguration(newConfig: Partial<SectionAnalyzerConfig>): void {
        this.config = { ...this.config, ...newConfig };
        logger.info('SectionAnalyzer configuration updated', { config: this.config });
    }

    /**
     * メトリクスをリセット
     */
    resetMetrics(): void {
        this.analysisMetrics = {
            totalAnalyses: 0,
            successfulAnalyses: 0,
            failedAnalyses: 0,
            averageProcessingTime: 0,
            memorySystemHits: 0,
            cacheEfficiencyRate: 0,
            lastOptimization: new Date().toISOString()
        };
        logger.info('SectionAnalyzer metrics reset');
    }
}