// src/lib/foreshadowing/resolution-advisor.ts

import { GeminiClient } from '@/lib/generation/gemini-client';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { plannedForeshadowingManager } from './planned-foreshadowing-manager';
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { MemoryLevel, UnifiedSearchResult } from '@/lib/memory/core/types';
import { Foreshadowing } from '@/types/memory';

/**
 * 伏線解決提案の型定義
 */
interface ResolutionSuggestion {
    foreshadowing: Foreshadowing;
    chapterContent: string;
    reason: string;
    confidence: number;  // 0.0-1.0
    isHint?: boolean;
    metadata?: {
        source: 'planned' | 'ai_analysis' | 'unified_search';
        processingTime: number;
        searchResults?: number;
        qualityScore?: number;
    };
}

/**
 * 伏線解決可能性評価結果
 */
interface ResolutionEvaluationResult {
    isPossible: boolean;
    confidence: number;
    reason: string;
    snippetForResolution?: string;
    timingScore: number;
    aiAnalysisScore: number;
    finalScore: number;
}

/**
 * 統合記憶検索結果
 */
interface UnifiedForeshadowingData {
    unresolvedForeshadowing: Foreshadowing[];
    relatedMemories: any[];
    contextualHints: string[];
    qualityMetrics: {
        dataCompleteness: number;
        relevanceScore: number;
        confidenceLevel: number;
    };
}

/**
 * パフォーマンス統計の型定義
 */
interface AdvisorPerformanceMetrics {
    totalSuggestions: number;
    successfulSuggestions: number;
    failedSuggestions: number;
    averageProcessingTime: number;
    memorySystemHits: number;
    cacheEfficiencyRate: number;
    lastOptimization: string;
}

/**
 * @class ForeshadowingResolutionAdvisor
 * @description
 * 新しい統合記憶階層システムに完全対応した伏線解決提案生成クラス。
 * 統合記憶システムのunifiedSearchを活用し、型安全性とエラーハンドリングを完全実装。
 * MemoryManagerの依存注入により、システム統合を実現します。
 */
export class ForeshadowingResolutionAdvisor {
    private geminiClient: GeminiClient;
    private initialized: boolean = false;

    // パフォーマンス統計（明示的型定義）
    private performanceMetrics: AdvisorPerformanceMetrics = {
        totalSuggestions: 0,
        successfulSuggestions: 0,
        failedSuggestions: 0,
        averageProcessingTime: 0,
        memorySystemHits: 0,
        cacheEfficiencyRate: 0,
        lastOptimization: new Date().toISOString()
    };

    /**
     * コンストラクタ - MemoryManagerの依存注入
     * @param memoryManager 統合記憶管理システム
     */
    constructor(private memoryManager: MemoryManager) {
        this.geminiClient = new GeminiClient();
        this.validateConfiguration();
        this.initializeInternalState();
        
        logger.info('ForeshadowingResolutionAdvisor initialized with unified memory system integration');
    }

    /**
     * 設定の完全検証
     * @private
     */
    private validateConfiguration(): void {
        if (!this.memoryManager) {
            throw new Error('MemoryManager is required for ForeshadowingResolutionAdvisor initialization');
        }
    }

    /**
     * 内部状態の初期化
     * @private
     */
    private initializeInternalState(): void {
        this.performanceMetrics = {
            totalSuggestions: 0,
            successfulSuggestions: 0,
            failedSuggestions: 0,
            averageProcessingTime: 0,
            memorySystemHits: 0,
            cacheEfficiencyRate: 0,
            lastOptimization: new Date().toISOString()
        };
    }

    /**
     * 伏線解決提案を生成します
     * 
     * 統合記憶階層システムを活用し、計画済み伏線とAI分析による
     * 伏線解決提案を生成します。型安全性とエラーハンドリングを完全実装。
     * 
     * @async
     * @param {string} chapterContent チャプター内容
     * @param {number} chapterNumber チャプター番号
     * @param {number} [maxSuggestions=3] 最大提案数
     * @returns {Promise<ResolutionSuggestion[]>} 伏線解決提案の配列
     */
    async suggestResolutions(
        chapterContent: string,
        chapterNumber: number,
        maxSuggestions: number = 3
    ): Promise<ResolutionSuggestion[]> {
        const startTime = Date.now();
        const operationContext = this.createOperationContext(chapterNumber, chapterContent.length);

        try {
            logger.info(`チャプター${chapterNumber}の伏線解決提案を生成開始`, {
                chapterNumber,
                contentLength: chapterContent.length,
                maxSuggestions
            });

            this.performanceMetrics.totalSuggestions++;

            // 段階的処理の実行
            const plannedSuggestions = await this.processPlannedForeshadowings(chapterNumber);
            const unifiedMemoryData = await this.getUnifiedForeshadowingData(chapterContent, chapterNumber);
            const aiSuggestions = await this.generateAISuggestions(
                chapterContent, 
                chapterNumber, 
                unifiedMemoryData, 
                maxSuggestions - plannedSuggestions.length
            );

            // 結果の統合と最適化
            const allSuggestions = [...plannedSuggestions, ...aiSuggestions];
            const optimizedSuggestions = this.optimizeSuggestions(allSuggestions, maxSuggestions);
            
            // パフォーマンス統計の更新
            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, true);

            logger.info(`伏線解決提案生成完了`, {
                chapterNumber,
                suggestionsGenerated: optimizedSuggestions.length,
                processingTime,
                plannedCount: plannedSuggestions.length,
                aiCount: aiSuggestions.length
            });

            return optimizedSuggestions;

        } catch (error) {
            return this.handleOperationError(error, operationContext);
        }
    }

    /**
     * 計画済み伏線の処理
     * @private
     */
    private async processPlannedForeshadowings(chapterNumber: number): Promise<ResolutionSuggestion[]> {
        const startTime = Date.now();
        
        try {
            // 計画済み伏線管理システムのインスタンスを取得
            const plannedManager = plannedForeshadowingManager.getInstance(this.memoryManager);
            
            // 計画済み伏線管理システムの安全な初期化確認
            if (!plannedManager.isLoaded()) {
                await plannedManager.loadPlannedForeshadowings();
            }

            const suggestions: ResolutionSuggestion[] = [];

            // このチャプターで解決すべき計画済み伏線を取得
            const plannedToResolve = plannedManager.getForeshadowingsToResolveInChapter(chapterNumber);

            // 計画済み伏線を解決提案に変換
            for (const planned of plannedToResolve) {
                const foreshadowing = plannedManager.convertToForeshadowing(planned);

                suggestions.push({
                    foreshadowing,
                    chapterContent: planned.resolution_context || '',
                    reason: `このチャプターで計画されていた伏線「${planned.description}」の解決時期です。`,
                    confidence: 1.0,
                    metadata: {
                        source: 'planned',
                        processingTime: Date.now() - startTime,
                        qualityScore: 1.0
                    }
                });

                // 伏線を解決済みとしてマーク
                plannedManager.markAsResolved(planned.id);
            }

            // ヒント提案の追加
            const hintsForChapter = plannedManager.getHintsForChapter(chapterNumber);
            for (const hintInfo of hintsForChapter) {
                const foreshadowing = plannedManager.convertToForeshadowing(hintInfo.foreshadowing);

                suggestions.push({
                    foreshadowing,
                    chapterContent: hintInfo.hint.hint, // PlannedHint.hint は string
                    reason: `このチャプターで伏線「${hintInfo.foreshadowing.description}」に関するヒントを含めることができます。`,
                    confidence: 0.5,
                    isHint: true,
                    metadata: {
                        source: 'planned',
                        processingTime: Date.now() - startTime,
                        qualityScore: 0.7
                    }
                });
            }

            // 計画済み伏線の変更を保存
            if (plannedToResolve.length > 0) {
                await plannedManager.savePlannedForeshadowings();
            }

            return suggestions;

        } catch (error) {
            logger.error('計画済み伏線処理に失敗', {
                chapterNumber,
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 統合記憶システムから伏線データを取得
     * @private
     */
    private async getUnifiedForeshadowingData(
        chapterContent: string,
        chapterNumber: number
    ): Promise<UnifiedForeshadowingData> {
        const defaultData: UnifiedForeshadowingData = {
            unresolvedForeshadowing: [],
            relatedMemories: [],
            contextualHints: [],
            qualityMetrics: {
                dataCompleteness: 0,
                relevanceScore: 0,
                confidenceLevel: 0
            }
        };

        return await this.safeMemoryOperation(
            async () => {
                this.performanceMetrics.memorySystemHits++;

                // 統合検索による未解決伏線の取得
                const searchQuery = this.buildOptimizedSearchQuery(chapterContent, chapterNumber);
                const searchResult = await this.memoryManager.unifiedSearch(
                    searchQuery,
                    [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM, MemoryLevel.SHORT_TERM]
                );

                if (!searchResult.success || !searchResult.results) {
                    logger.warn('統合検索が失敗またはnull結果', { 
                        chapterNumber, 
                        searchSuccess: searchResult.success 
                    });
                    return defaultData;
                }

                // 検索結果から伏線データを抽出
                const unresolvedForeshadowing = this.extractForeshadowingFromSearchResults(searchResult);
                const relatedMemories = this.extractRelatedMemories(searchResult);
                const contextualHints = this.extractContextualHints(searchResult, chapterContent);

                return {
                    unresolvedForeshadowing,
                    relatedMemories,
                    contextualHints,
                    qualityMetrics: {
                        dataCompleteness: Math.min(1.0, unresolvedForeshadowing.length / 10),
                        relevanceScore: this.calculateRelevanceScore(searchResult, chapterContent),
                        confidenceLevel: Math.min(1.0, searchResult.totalResults / 20)
                    }
                };
            },
            defaultData,
            'getUnifiedForeshadowingData'
        );
    }

    /**
     * AI分析による伏線解決提案の生成
     * @private
     */
    private async generateAISuggestions(
        chapterContent: string,
        chapterNumber: number,
        unifiedData: UnifiedForeshadowingData,
        remainingCount: number
    ): Promise<ResolutionSuggestion[]> {
        if (remainingCount <= 0 || unifiedData.unresolvedForeshadowing.length === 0) {
            return [];
        }

        const suggestions: ResolutionSuggestion[] = [];
        const contentForAnalysis = chapterContent.substring(0, 6000); // AIトークン制限対応

        // 未解決伏線を順次処理
        for (const foreshadowing of unifiedData.unresolvedForeshadowing) {
            if (suggestions.length >= remainingCount) break;

            try {
                const evaluationResult = await apiThrottler.throttledRequest(() =>
                    this.evaluateResolutionPossibility(
                        foreshadowing,
                        contentForAnalysis,
                        chapterNumber,
                        unifiedData.qualityMetrics
                    )
                );

                // 信頼度が閾値を超える場合のみ追加
                if (evaluationResult.confidence >= 0.6) {
                    suggestions.push({
                        foreshadowing,
                        chapterContent: evaluationResult.snippetForResolution || '',
                        reason: evaluationResult.reason,
                        confidence: evaluationResult.confidence,
                        metadata: {
                            source: 'ai_analysis',
                            processingTime: 0, // APIスロットリング内で測定
                            qualityScore: evaluationResult.finalScore,
                            searchResults: unifiedData.unresolvedForeshadowing.length
                        }
                    });
                }

            } catch (error) {
                logError(
                    error, 
                    { foreshadowingId: foreshadowing.id, chapterNumber }, 
                    '伏線解決可能性の評価に失敗しました'
                );
                // エラーがあっても処理を継続
            }
        }

        return suggestions;
    }

    /**
     * 伏線の解決可能性を評価（統合記憶システム活用版）
     * @private
     */
    private async evaluateResolutionPossibility(
        foreshadowing: Foreshadowing,
        chapterContent: string,
        chapterNumber: number,
        qualityMetrics: UnifiedForeshadowingData['qualityMetrics']
    ): Promise<ResolutionEvaluationResult> {
        // タイミング信頼度の計算
        const timingScore = this.calculateTimingConfidence(foreshadowing, chapterNumber);

        // AIプロンプトの構築（統合記憶コンテキスト含む）
        const prompt = this.buildAnalysisPrompt(
            foreshadowing, 
            chapterContent, 
            chapterNumber, 
            qualityMetrics
        );

        try {
            const aiResponse = await this.geminiClient.generateText(prompt, {
                temperature: 0.1 // 分析タスクは低温で
            });

            // レスポンスの安全な解析
            const aiAnalysis = this.parseAIResponse(aiResponse);
            const aiScore = aiAnalysis.confidence;

            // 最終的な信頼度計算（タイミング + AI分析 + システム品質）
            const finalScore = this.calculateFinalConfidence(timingScore, aiScore, qualityMetrics);

            return {
                isPossible: aiAnalysis.isPossible && finalScore >= 0.6,
                confidence: finalScore,
                reason: aiAnalysis.reason || '統合記憶システムによる分析結果',
                snippetForResolution: aiAnalysis.isPossible ? aiAnalysis.snippetForResolution : undefined,
                timingScore,
                aiAnalysisScore: aiScore,
                finalScore
            };

        } catch (error) {
            logger.error('AI分析でエラーが発生', {
                foreshadowingId: foreshadowing.id,
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                isPossible: false,
                confidence: 0.1,
                reason: 'AI分析中にエラーが発生しました',
                timingScore,
                aiAnalysisScore: 0,
                finalScore: 0.1
            };
        }
    }

    /**
     * 安全なメモリ操作の実行
     * @private
     */
    private async safeMemoryOperation<T>(
        operation: () => Promise<T>,
        fallbackValue: T,
        operationName: string
    ): Promise<T> {
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
     * 最適化された検索クエリの構築
     * @private
     */
    private buildOptimizedSearchQuery(chapterContent: string, chapterNumber: number): string {
        // チャプター内容から重要キーワードを抽出
        const keywords = this.extractKeywords(chapterContent);
        
        // 章番号を考慮した検索クエリ
        const chapterContext = `chapter ${chapterNumber}`;
        
        // 伏線関連の具体的な検索語
        const foreshadowingTerms = ['foreshadowing', 'unresolved', 'hint', 'setup', 'prediction'];
        
        return `${keywords.slice(0, 3).join(' ')} ${chapterContext} ${foreshadowingTerms.join(' ')}`;
    }

    /**
     * キーワード抽出（簡易版）
     * @private
     */
    private extractKeywords(content: string): string[] {
        // 簡易的なキーワード抽出
        const words = content.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3)
            .filter(word => !['this', 'that', 'with', 'have', 'will', 'been', 'were'].includes(word));

        // 頻度分析による重要語抽出
        const frequency: Record<string, number> = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        return Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([word]) => word);
    }

    /**
     * 検索結果から伏線データを抽出
     * @private
     */
    private extractForeshadowingFromSearchResults(searchResult: UnifiedSearchResult): Foreshadowing[] {
        const foreshadowing: Foreshadowing[] = [];

        for (const result of searchResult.results || []) {
            try {
                // 長期記憶からの伏線データ
                if (result.source === MemoryLevel.LONG_TERM && result.data) {
                    const longTermData = result.data;
                    if (longTermData.knowledgeDatabase?.foreshadowingDatabase?.foreshadowing) {
                        foreshadowing.push(...longTermData.knowledgeDatabase.foreshadowingDatabase.foreshadowing);
                    }
                }

                // 中期記憶からの分析結果
                if (result.source === MemoryLevel.MID_TERM && result.data) {
                    // 分析結果から伏線要素を抽出（型安全）
                    const midTermData = result.data;
                    if (midTermData.analysisResults && Array.isArray(midTermData.analysisResults)) {
                        // 分析結果から伏線関連データを抽出
                    }
                }

            } catch (error) {
                logger.debug('検索結果からの伏線抽出でエラー', { 
                    error: error instanceof Error ? error.message : String(error),
                    resultType: result.type 
                });
            }
        }

        return foreshadowing;
    }

    /**
     * 関連メモリの抽出
     * @private
     */
    private extractRelatedMemories(searchResult: UnifiedSearchResult): any[] {
        const memories: any[] = [];

        for (const result of searchResult.results || []) {
            if (result.relevance > 0.5) {
                memories.push({
                    source: result.source,
                    type: result.type,
                    data: result.data,
                    relevance: result.relevance,
                    metadata: result.metadata
                });
            }
        }

        return memories;
    }

    /**
     * コンテキストヒントの抽出
     * @private
     */
    private extractContextualHints(searchResult: UnifiedSearchResult, chapterContent: string): string[] {
        const hints: string[] = [];

        // 検索結果から関連するヒントを抽出
        for (const result of searchResult.results || []) {
            if (result.type === 'hint' || result.type === 'context') {
                if (typeof result.data === 'string') {
                    hints.push(result.data);
                } else if (result.data && typeof result.data.hint === 'string') {
                    hints.push(result.data.hint);
                }
            }
        }

        return hints;
    }

    /**
     * 関連度スコアの計算
     * @private
     */
    private calculateRelevanceScore(searchResult: UnifiedSearchResult, chapterContent: string): number {
        if (!searchResult.results || searchResult.results.length === 0) {
            return 0;
        }

        const totalRelevance = searchResult.results.reduce((sum, result) => sum + result.relevance, 0);
        return Math.min(1.0, totalRelevance / searchResult.results.length);
    }

    /**
     * タイミング信頼度の計算
     * @private
     */
    private calculateTimingConfidence(foreshadowing: Foreshadowing, chapterNumber: number): number {
        const plannedChapter = foreshadowing.plannedResolution;

        if (!plannedChapter) {
            return 0.5; // 計画がない場合はデフォルト
        }

        const chapterDifference = Math.abs(plannedChapter - chapterNumber);
        
        if (chapterDifference === 0) {
            return 0.9; // 計画通りのチャプター
        } else if (chapterDifference <= 3) {
            return 0.7; // 計画の±3チャプター以内
        } else if (chapterDifference <= 5) {
            return 0.5; // 計画の±5チャプター以内
        } else {
            return 0.3; // 計画から大きく外れている
        }
    }

    /**
     * AIプロンプトの構築
     * @private
     */
    private buildAnalysisPrompt(
        foreshadowing: Foreshadowing,
        chapterContent: string,
        chapterNumber: number,
        qualityMetrics: UnifiedForeshadowingData['qualityMetrics']
    ): string {
        return `
統合記憶階層システムによる伏線解決分析

【システム品質指標】
- データ完全性: ${(qualityMetrics.dataCompleteness * 100).toFixed(1)}%
- 関連度スコア: ${(qualityMetrics.relevanceScore * 100).toFixed(1)}%
- 信頼レベル: ${(qualityMetrics.confidenceLevel * 100).toFixed(1)}%

【伏線情報】
- 説明: ${foreshadowing.description}
- 導入チャプター: ${foreshadowing.chapter_introduced}
- 詳細: ${foreshadowing.context || 'なし'}
- 想定される解決: ${foreshadowing.potential_resolution || 'なし'}
- 計画解決チャプター: ${foreshadowing.plannedResolution || 'なし'}

【現在のチャプター】
チャプター番号: ${chapterNumber}
内容:
${chapterContent}

以下の質問に答えてください:
1. このチャプターで上記の伏線を解決することは可能ですか？ (可能/不可能)
2. その判断の信頼度を0から1の値で示してください（例: 0.8）
3. その理由を簡潔に説明してください
4. もし解決可能な場合、チャプター内のどの部分（具体的なテキスト）が伏線解決に関連しますか？

回答形式:
可能性: 可能 または 不可能
信頼度: 0.0-1.0の数値
理由: 簡潔な説明
関連テキスト: チャプター内の該当テキスト（解決可能な場合のみ）
`;
    }

    /**
     * AI応答の安全な解析
     * @private
     */
    private parseAIResponse(response: string): {
        isPossible: boolean;
        confidence: number;
        reason: string;
        snippetForResolution?: string;
    } {
        try {
            // 安全なパターンマッチング
            const isPossibleMatch = response.match(/可能性:\s*(可能|不可能)/i);
            const confidenceMatch = response.match(/信頼度:\s*([0-9.]+)/i);
            const reasonMatch = response.match(/理由:\s*(.*?)(?:\n|$)/i);
            const textMatch = response.match(/関連テキスト:\s*(.*?)(?:\n\n|$)/i);

            const isPossible = !!(isPossibleMatch && isPossibleMatch[1] === '可能');
            const confidence = confidenceMatch ? Math.max(0, Math.min(1, parseFloat(confidenceMatch[1]))) : 0.5;
            const reason = reasonMatch ? reasonMatch[1].trim() : '分析結果が不明確です';
            const snippetForResolution = textMatch ? textMatch[1].trim() : undefined;

            return {
                isPossible,
                confidence,
                reason,
                snippetForResolution: isPossible ? snippetForResolution : undefined
            };

        } catch (error) {
            logger.warn('AI応答の解析に失敗', { 
                error: error instanceof Error ? error.message : String(error),
                responseLength: response.length 
            });

            return {
                isPossible: false,
                confidence: 0.3,
                reason: '応答の解析に失敗しました'
            };
        }
    }

    /**
     * 最終信頼度の計算
     * @private
     */
    private calculateFinalConfidence(
        timingScore: number,
        aiScore: number,
        qualityMetrics: UnifiedForeshadowingData['qualityMetrics']
    ): number {
        const systemQualityWeight = (qualityMetrics.dataCompleteness + qualityMetrics.confidenceLevel) / 2;
        
        return Math.max(0, Math.min(1,
            (timingScore * 0.3) +
            (aiScore * 0.5) +
            (systemQualityWeight * 0.2)
        ));
    }

    /**
     * 提案の最適化
     * @private
     */
    private optimizeSuggestions(
        suggestions: ResolutionSuggestion[],
        maxSuggestions: number
    ): ResolutionSuggestion[] {
        // 信頼度とメタデータ品質による総合スコアでソート
        return suggestions
            .sort((a, b) => {
                const scoreA = a.confidence * (a.metadata?.qualityScore || 0.5);
                const scoreB = b.confidence * (b.metadata?.qualityScore || 0.5);
                return scoreB - scoreA;
            })
            .slice(0, maxSuggestions);
    }

    /**
     * 操作コンテキストの作成
     * @private
     */
    private createOperationContext(chapterNumber: number, contentLength: number): {
        chapterNumber: number;
        contentLength: number;
        timestamp: string;
        operationId: string;
    } {
        return {
            chapterNumber,
            contentLength,
            timestamp: new Date().toISOString(),
            operationId: `foreshadowing-${chapterNumber}-${Date.now()}`
        };
    }

    /**
     * 操作エラーのハンドリング
     * @private
     */
    private handleOperationError(error: unknown, context: any): never {
        const processingTime = Date.now() - new Date(context.timestamp).getTime();
        this.updatePerformanceMetrics(processingTime, false);

        const errorDetails = {
            message: error instanceof Error ? error.message : String(error),
            context: context,
            timestamp: new Date().toISOString()
        };

        logger.error('伏線解決提案生成に失敗しました', errorDetails);

        throw new Error(
            `Foreshadowing resolution suggestion failed for chapter ${context.chapterNumber}: ${errorDetails.message}`
        );
    }

    /**
     * パフォーマンス統計の更新
     * @private
     */
    private updatePerformanceMetrics(processingTime: number, success: boolean): void {
        if (success) {
            this.performanceMetrics.successfulSuggestions++;
        } else {
            this.performanceMetrics.failedSuggestions++;
        }

        // 平均処理時間の更新
        const totalOperations = this.performanceMetrics.successfulSuggestions + this.performanceMetrics.failedSuggestions;
        this.performanceMetrics.averageProcessingTime = 
            ((this.performanceMetrics.averageProcessingTime * (totalOperations - 1)) + processingTime) / totalOperations;

        // キャッシュ効率の計算
        this.performanceMetrics.cacheEfficiencyRate = this.performanceMetrics.memorySystemHits > 0 
            ? this.performanceMetrics.successfulSuggestions / this.performanceMetrics.memorySystemHits 
            : 0;
    }

    /**
     * 診断情報の取得
     * @returns 診断結果
     */
    async performDiagnostics(): Promise<{
        operational: boolean;
        efficiency: number;
        memorySystemIntegration: boolean;
        performanceMetrics: AdvisorPerformanceMetrics;
        recommendations: string[];
    }> {
        try {
            const systemStatus = await this.memoryManager.getSystemStatus();
            const memorySystemIntegration = systemStatus.initialized;
            
            const efficiency = this.performanceMetrics.totalSuggestions > 0
                ? this.performanceMetrics.successfulSuggestions / this.performanceMetrics.totalSuggestions
                : 0;

            const recommendations: string[] = [];

            if (efficiency < 0.8) {
                recommendations.push('提案生成の成功率が低下しています。システム設定を確認してください。');
            }

            if (!memorySystemIntegration) {
                recommendations.push('記憶システムとの統合に問題があります。');
            }

            if (this.performanceMetrics.averageProcessingTime > 5000) {
                recommendations.push('処理時間が長くなっています。最適化を検討してください。');
            }

            return {
                operational: this.initialized && memorySystemIntegration,
                efficiency,
                memorySystemIntegration,
                performanceMetrics: { ...this.performanceMetrics },
                recommendations
            };

        } catch (error) {
            logger.error('診断実行に失敗', { 
                error: error instanceof Error ? error.message : String(error) 
            });

            return {
                operational: false,
                efficiency: 0,
                memorySystemIntegration: false,
                performanceMetrics: { ...this.performanceMetrics },
                recommendations: ['診断システムでエラーが発生しました。システム管理者に連絡してください。']
            };
        }
    }

    /**
     * 統計情報の取得
     */
    getPerformanceStatistics(): AdvisorPerformanceMetrics {
        return { ...this.performanceMetrics };
    }

    /**
     * 設定の更新
     */
    updateConfiguration(newConfig: Partial<{
        maxRetries: number;
        aiTemperature: number;
        confidenceThreshold: number;
    }>): void {
        // 設定更新ロジック（必要に応じて実装）
        logger.info('ForeshadowingResolutionAdvisor configuration updated', { newConfig });
    }
}

// シングルトンインスタンスのファクトリー関数
export function createForeshadowingResolutionAdvisor(memoryManager: MemoryManager): ForeshadowingResolutionAdvisor {
    return new ForeshadowingResolutionAdvisor(memoryManager);
}

// 従来の互換性を保つためのデフォルトエクスポート（要初期化）
let defaultInstance: ForeshadowingResolutionAdvisor | null = null;

export function initializeDefaultAdvisor(memoryManager: MemoryManager): void {
    defaultInstance = new ForeshadowingResolutionAdvisor(memoryManager);
}

export const resolutionAdvisor = {
    get instance() {
        if (!defaultInstance) {
            throw new Error('ForeshadowingResolutionAdvisor not initialized. Call initializeDefaultAdvisor() first.');
        }
        return defaultInstance;
    }
};