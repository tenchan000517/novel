// src/lib/foreshadowing/manager.ts

/**
 * @fileoverview 伏線管理システム - 新統合記憶階層システム完全対応版
 * @description
 * 新しい統合記憶階層システムに完全対応した伏線管理統合クラス。
 * MemoryManagerへの依存注入とパブリックAPIのみを使用した安全かつ高性能な実装。
 * 既存の伏線管理機能を完全保持しつつ、新システムの能力を最大限活用。
 */

import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { MemoryLevel } from '@/lib/memory/core/types';
import { createForeshadowingEngine, ForeshadowingEngine } from './engine';
import { Foreshadowing } from '@/types/memory';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { GeminiClient } from '@/lib/generation/gemini-client';

/**
 * 伏線処理結果
 */
interface ForeshadowingProcessingResult {
    success: boolean;
    generatedCount: number;
    resolutionSuggestions: ForeshadowingResolutionSuggestion[];
    processingTime: number;
    memorySystemIntegrated: boolean;
    error?: string;
    metadata: {
        plannedForeshadowings: number;
        aiGeneratedForeshadowings: number;
        memorySearchResults: number;
        cacheHits: number;
    };
}

/**
 * 伏線解決提案
 */
interface ForeshadowingResolutionSuggestion {
    foreshadowing: Foreshadowing;
    chapterContent: string;
    reason: string;
    confidence: number;
    resolutionMethod?: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    isHint?: boolean;
    sourceType: 'planned' | 'memory-search' | 'ai-analysis';
}

/**
 * 伏線バルク更新結果
 */
interface BulkUpdateResult {
    success: boolean;
    totalItems: number;
    successfulUpdates: number;
    failedUpdates: number;
    processingTime: number;
    errors: Array<{ id: string; error: string }>;
}

/**
 * 伏線整合性チェック結果
 */
interface ConsistencyCheckResult {
    isConsistent: boolean;
    totalForeshadowings: number;
    issues: Array<{
        id: string;
        issue: string;
        severity: 'HIGH' | 'MEDIUM' | 'LOW';
        recommendation: string;
    }>;
    processingTime: number;
    memorySystemHealth: boolean;
}

/**
 * @class ForeshadowingManager
 * @description
 * 新統合記憶階層システムに完全対応した伏線管理統合クラス。
 * MemoryManagerへの依存注入により、統合記憶システムの能力を最大限活用。
 */
export class ForeshadowingManager {
    private engine: ForeshadowingEngine;
    private geminiClient: GeminiClient;
    private performanceMetrics = {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageProcessingTime: 0,
        memorySystemHits: 0,
        cacheEfficiencyRate: 0,
        lastOptimization: new Date().toISOString()
    };

    /**
     * コンストラクタ - 完全な依存注入パターン実装
     * @param memoryManager 統合記憶管理システム（必須依存注入）
     */
    constructor(
        private memoryManager: MemoryManager
    ) {
        if (!this.memoryManager) {
            throw new Error('MemoryManager is required for ForeshadowingManager initialization');
        }

        this.validateSystemDependencies();
        this.engine = createForeshadowingEngine(this.memoryManager);
        this.geminiClient = new GeminiClient();

        logger.info('ForeshadowingManager initialized with unified memory system integration');
    }

    /**
     * システム依存関係の完全検証
     * @private
     */
    private validateSystemDependencies(): void {
        if (!this.memoryManager) {
            throw new Error('MemoryManager dependency is missing');
        }

        // システム状態の確認
        const systemState = this.memoryManager.getSystemState();
        if (systemState === 'ERROR') {
            throw new Error('MemoryManager is in error state');
        }

        logger.debug('ForeshadowingManager dependencies validated successfully');
    }

    /**
     * チャプターに対する伏線処理を実行 - 統合記憶システム完全活用版
     * @param chapterContent チャプター内容
     * @param chapterNumber チャプター番号
     * @param generateCount 生成する伏線数
     * @returns 処理結果
     */
    async processChapterAndGenerateForeshadowing(
        chapterContent: string,
        chapterNumber: number,
        generateCount: number = 2
    ): Promise<ForeshadowingProcessingResult> {
        const startTime = Date.now();
        this.performanceMetrics.totalOperations++;

        try {
            logger.info(`Processing foreshadowing for chapter ${chapterNumber}`, {
                chapterNumber,
                generateCount,
                contentLength: chapterContent.length
            });

            const result: ForeshadowingProcessingResult = {
                success: false,
                generatedCount: 0,
                resolutionSuggestions: [],
                processingTime: 0,
                memorySystemIntegrated: false,
                metadata: {
                    plannedForeshadowings: 0,
                    aiGeneratedForeshadowings: 0,
                    memorySearchResults: 0,
                    cacheHits: 0
                }
            };

            // 1. システム状態の確認と初期化
            const systemStatus = await this.ensureSystemReadiness();
            if (!systemStatus.ready) {
                throw new Error(`Memory system not ready: ${systemStatus.reason}`);
            }

            // 2. 新しい伏線の生成（統合記憶システム活用）
            const generationResult = await this.engine.generateForeshadowing(
                chapterContent,
                chapterNumber,
                generateCount
            );

            if (generationResult.success) {
                result.generatedCount = generationResult.savedCount;
                result.metadata.plannedForeshadowings = generationResult.sourceTypes.includes('planned') ? 1 : 0;
                result.metadata.aiGeneratedForeshadowings = generationResult.sourceTypes.includes('ai-generated') ? 1 : 0;
                this.performanceMetrics.memorySystemHits++;
            }

            // 3. 解決すべき伏線の提案（統合検索活用）
            const resolutionResult = await this.engine.suggestForeshadowingsToResolve(
                chapterContent,
                chapterNumber,
                3
            );

            if (resolutionResult.success) {
                result.resolutionSuggestions = await this.buildResolutionSuggestions(
                    resolutionResult.candidates,
                    chapterContent,
                    chapterNumber
                );
                result.metadata.memorySearchResults = resolutionResult.sourceTypes.includes('memory-search') ? 1 : 0;
            }

            // 4. 統合記憶システムとの連携確認
            result.memorySystemIntegrated = await this.verifyMemorySystemIntegration(chapterNumber);

            // 5. キャッシュ効率の測定
            const cacheStats = await this.measureCacheEfficiency();
            result.metadata.cacheHits = cacheStats.hitCount;
            this.performanceMetrics.cacheEfficiencyRate = cacheStats.efficiency;

            // 6. 結果の最終処理
            result.success = result.generatedCount > 0 || result.resolutionSuggestions.length > 0;
            result.processingTime = Date.now() - startTime;

            if (result.success) {
                this.performanceMetrics.successfulOperations++;
            } else {
                this.performanceMetrics.failedOperations++;
            }

            this.updateAverageProcessingTime(result.processingTime);

            logger.info('Foreshadowing processing completed', {
                chapterNumber,
                success: result.success,
                generatedCount: result.generatedCount,
                resolutionSuggestions: result.resolutionSuggestions.length,
                processingTime: result.processingTime,
                memorySystemIntegrated: result.memorySystemIntegrated
            });

            return result;

        } catch (error) {
            this.performanceMetrics.failedOperations++;
            const processingTime = Date.now() - startTime;

            const errorMessage = error instanceof Error ? error.message : String(error);
            logError(error, { chapterNumber, generateCount }, 'Foreshadowing processing failed');

            return {
                success: false,
                generatedCount: 0,
                resolutionSuggestions: [],
                processingTime,
                memorySystemIntegrated: false,
                error: errorMessage,
                metadata: {
                    plannedForeshadowings: 0,
                    aiGeneratedForeshadowings: 0,
                    memorySearchResults: 0,
                    cacheHits: 0
                }
            };
        }
    }

    /**
     * システム準備状態の確保
     * @private
     */
    private async ensureSystemReadiness(): Promise<{ ready: boolean; reason?: string }> {
        try {
            // システム状態の確認
            const systemState = this.memoryManager.getSystemState();
            if (systemState !== 'RUNNING') {
                return { ready: false, reason: `System state is ${systemState}` };
            }

            // システムステータスの確認
            const systemStatus = await this.memoryManager.getSystemStatus();
            if (!systemStatus.initialized) {
                return { ready: false, reason: 'Memory system not initialized' };
            }

            // システム診断の実行
            const diagnostics = await this.memoryManager.performSystemDiagnostics();
            if (diagnostics.systemHealth === 'CRITICAL') {
                return { ready: false, reason: 'Critical system health issues detected' };
            }

            return { ready: true };

        } catch (error) {
            return {
                ready: false,
                reason: `System readiness check failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    /**
     * 解決提案の構築
     * @private
     */
    private async buildResolutionSuggestions(
        candidates: Foreshadowing[],
        chapterContent: string,
        chapterNumber: number
    ): Promise<ForeshadowingResolutionSuggestion[]> {
        const suggestions: ForeshadowingResolutionSuggestion[] = [];

        for (const candidate of candidates) {
            try {
                const suggestion = await this.createResolutionSuggestion(
                    candidate,
                    chapterContent,
                    chapterNumber
                );

                if (suggestion) {
                    suggestions.push(suggestion);
                }

            } catch (error) {
                logger.warn('Failed to create resolution suggestion', {
                    foreshadowingId: candidate.id,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        // 優先度と信頼度でソート
        return suggestions.sort((a, b) => {
            if (a.priority !== b.priority) {
                const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return b.confidence - a.confidence;
        });
    }

    /**
     * 個別解決提案の作成
     * @private
     */
    private async createResolutionSuggestion(
        foreshadowing: Foreshadowing,
        chapterContent: string,
        chapterNumber: number
    ): Promise<ForeshadowingResolutionSuggestion | null> {
        try {
            // 解決可能性の評価（AIを活用）
            const evaluation = await this.evaluateResolutionPossibility(
                foreshadowing,
                chapterContent,
                chapterNumber
            );

            if (!evaluation.isPossible || evaluation.confidence < 0.6) {
                return null;
            }

            // 優先度の決定
            const priority = this.determinePriority(foreshadowing, chapterNumber);

            // ソースタイプの決定
            const sourceType = this.determineSourceType(foreshadowing);

            return {
                foreshadowing,
                chapterContent: evaluation.relevantContent || '',
                reason: evaluation.reason,
                confidence: evaluation.confidence,
                resolutionMethod: evaluation.resolutionMethod,
                priority,
                isHint: evaluation.isHint,
                sourceType
            };

        } catch (error) {
            logger.error('Failed to create resolution suggestion', {
                foreshadowingId: foreshadowing.id,
                error: error instanceof Error ? error.message : String(error)
            });
            return null;
        }
    }

    /**
     * 解決可能性の評価
     * @private
     */
    private async evaluateResolutionPossibility(
        foreshadowing: Foreshadowing,
        chapterContent: string,
        chapterNumber: number
    ): Promise<{
        isPossible: boolean;
        confidence: number;
        reason: string;
        relevantContent?: string;
        resolutionMethod?: string;
        isHint?: boolean;
    }> {
        try {
            // タイミング評価
            const timingConfidence = this.evaluateResolutionTiming(foreshadowing, chapterNumber);

            // AI評価用プロンプト
            const prompt = `
以下の伏線について、現在のチャプター内容での解決可能性を評価してください。

【伏線情報】
- 説明: ${foreshadowing.description}
- 導入チャプター: ${foreshadowing.chapter_introduced}
- 想定解決: ${foreshadowing.potential_resolution || 'なし'}
- 計画解決チャプター: ${foreshadowing.plannedResolution || 'なし'}

【現在のチャプター】
チャプター番号: ${chapterNumber}
内容: ${chapterContent.substring(0, 4000)}

以下について評価してください：
1. 解決可能性: 可能/不可能/ヒントのみ
2. 信頼度: 0.0-1.0の数値
3. 理由: 判断の根拠
4. 関連部分: チャプター内の関連テキスト
5. 解決方法: 具体的な解決アプローチ

JSON形式で回答してください：
{
  "isPossible": boolean,
  "confidence": number,
  "reason": "string",
  "relevantContent": "string",
  "resolutionMethod": "string",
  "isHint": boolean
}
`;

            const response = await this.geminiClient.generateText(prompt, {
                temperature: 0.1
            });

            const evaluation = this.parseEvaluationResponse(response);

            // タイミング信頼度を加味
            evaluation.confidence = (evaluation.confidence * 0.7) + (timingConfidence * 0.3);

            return evaluation;

        } catch (error) {
            logger.warn('Resolution possibility evaluation failed', {
                foreshadowingId: foreshadowing.id,
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                isPossible: false,
                confidence: 0.1,
                reason: 'Evaluation failed'
            };
        }
    }

    /**
     * 解決タイミングの評価
     * @private
     */
    private evaluateResolutionTiming(foreshadowing: Foreshadowing, currentChapter: number): number {
        const chaptersElapsed = currentChapter - foreshadowing.chapter_introduced;

        // 最低経過期間（3章）の確認
        if (chaptersElapsed < 3) return 0.2;

        // 計画解決時期がある場合
        if (foreshadowing.plannedResolution) {
            const timingDiff = Math.abs(currentChapter - foreshadowing.plannedResolution);
            if (timingDiff === 0) return 0.9;
            if (timingDiff <= 3) return 0.7;
            if (timingDiff <= 5) return 0.5;
            return 0.3;
        }

        // 長期未解決の場合
        if (chaptersElapsed >= 15) return 0.8;
        if (chaptersElapsed >= 10) return 0.6;
        if (chaptersElapsed >= 6) return 0.5;

        return 0.4;
    }

    /**
     * AI評価レスポンスのパース
     * @private
     */
    private parseEvaluationResponse(response: string): {
        isPossible: boolean;
        confidence: number;
        reason: string;
        relevantContent?: string;
        resolutionMethod?: string;
        isHint?: boolean;
    } {
        try {
            // JSON形式のレスポンスを解析
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    isPossible: Boolean(parsed.isPossible),
                    confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
                    reason: String(parsed.reason || ''),
                    relevantContent: parsed.relevantContent ? String(parsed.relevantContent) : undefined,
                    resolutionMethod: parsed.resolutionMethod ? String(parsed.resolutionMethod) : undefined,
                    isHint: Boolean(parsed.isHint)
                };
            }

            // フォールバック：テキスト解析
            const isPossible = response.includes('可能') && !response.includes('不可能');
            const confidenceMatch = response.match(/信頼度.*?([0-9.]+)/);
            const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5;

            return {
                isPossible,
                confidence: Math.max(0, Math.min(1, confidence)),
                reason: 'Text-based evaluation'
            };

        } catch (error) {
            logger.warn('Failed to parse evaluation response', { error });
            return {
                isPossible: false,
                confidence: 0.1,
                reason: 'Parse error'
            };
        }
    }

    /**
     * 優先度の決定
     * @private
     */
    private determinePriority(foreshadowing: Foreshadowing, currentChapter: number): 'HIGH' | 'MEDIUM' | 'LOW' {
        const chaptersElapsed = currentChapter - foreshadowing.chapter_introduced;

        // 緊急度による判定
        if (foreshadowing.urgency === 'high') {
            return 'HIGH';
        }

        // 長期未解決による判定
        if (chaptersElapsed >= 15) {
            return 'HIGH';
        }

        // 計画解決時期による判定
        if (foreshadowing.plannedResolution) {
            const timingDiff = Math.abs(currentChapter - foreshadowing.plannedResolution);
            if (timingDiff <= 1) return 'HIGH';
            if (timingDiff <= 3) return 'MEDIUM';
        }

        // 中期未解決による判定
        if (chaptersElapsed >= 8) {
            return 'MEDIUM';
        }

        return 'LOW';
    }

    /**
     * ソースタイプの決定
     * @private
     */
    private determineSourceType(foreshadowing: Foreshadowing): 'planned' | 'memory-search' | 'ai-analysis' {
        // ID形式やメタデータから判定
        if (foreshadowing.id.includes('planned')) {
            return 'planned';
        }

        if (foreshadowing.id.includes('unified') || foreshadowing.id.includes('fs-auto')) {
            return 'ai-analysis';
        }

        return 'memory-search';
    }

    /**
     * 伏線のバルク更新 - 統合記憶システム活用版
     * @param updates 更新データ配列
     * @returns バルク更新結果
     */
    async bulkUpdateForeshadowing(
        updates: Array<{ id: string, updates: Partial<Foreshadowing> }>
    ): Promise<BulkUpdateResult> {
        const startTime = Date.now();

        try {
            logger.info(`Starting bulk foreshadowing update`, {
                totalItems: updates.length
            });

            const result: BulkUpdateResult = {
                success: false,
                totalItems: updates.length,
                successfulUpdates: 0,
                failedUpdates: 0,
                processingTime: 0,
                errors: []
            };

            // システム準備状態の確認
            const systemStatus = await this.ensureSystemReadiness();
            if (!systemStatus.ready) {
                throw new Error(`System not ready: ${systemStatus.reason}`);
            }

            // 各更新を順次実行（統合記憶システム活用）
            for (const updateItem of updates) {
                try {
                    const updateResult = await this.updateSingleForeshadowingWithMemoryIntegration(
                        updateItem.id,
                        updateItem.updates
                    );

                    if (updateResult.success) {
                        result.successfulUpdates++;
                    } else {
                        result.failedUpdates++;
                        result.errors.push({
                            id: updateItem.id,
                            error: updateResult.error || 'Unknown error'
                        });
                    }

                } catch (itemError) {
                    result.failedUpdates++;
                    result.errors.push({
                        id: updateItem.id,
                        error: itemError instanceof Error ? itemError.message : String(itemError)
                    });
                }
            }

            result.success = result.successfulUpdates > 0;
            result.processingTime = Date.now() - startTime;

            logger.info('Bulk foreshadowing update completed', {
                totalItems: result.totalItems,
                successfulUpdates: result.successfulUpdates,
                failedUpdates: result.failedUpdates,
                processingTime: result.processingTime
            });

            return result;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logError(error, { updateCount: updates.length }, 'Bulk foreshadowing update failed');

            return {
                success: false,
                totalItems: updates.length,
                successfulUpdates: 0,
                failedUpdates: updates.length,
                processingTime: Date.now() - startTime,
                errors: [{ id: 'system', error: errorMessage }]
            };
        }
    }

    /**
     * 統合記憶システムを活用した単一伏線更新
     * @private
     */
    private async updateSingleForeshadowingWithMemoryIntegration(
        id: string,
        updates: Partial<Foreshadowing>
    ): Promise<{ success: boolean; error?: string }> {
        try {
            // 統合検索で現在の伏線データを取得
            const searchResult = await this.memoryManager.unifiedSearch(
                `foreshadowing id:${id}`,
                [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM]
            );

            if (!searchResult.success || searchResult.totalResults === 0) {
                return { success: false, error: 'Foreshadowing not found in memory system' };
            }

            // 更新データの構築
            const updatedForeshadowing = this.buildUpdatedForeshadowing(searchResult.results[0].data, updates);

            // 統合記憶システムへの更新保存
            const saveResult = await this.saveUpdatedForeshadowingToMemorySystem(updatedForeshadowing);

            return saveResult;

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * 更新伏線データの構築
     * @private
     */
    private buildUpdatedForeshadowing(currentData: any, updates: Partial<Foreshadowing>): Foreshadowing {
        // 安全なデータ抽出
        const baseForeshadowing = this.extractForeshadowingFromData(currentData);

        // 更新の適用
        const updatedForeshadowing: Foreshadowing = {
            ...baseForeshadowing,
            ...updates,
            updatedTimestamp: new Date().toISOString()
        };

        return updatedForeshadowing;
    }

    /**
     * データから伏線オブジェクトの安全な抽出
     * @private
     */
    private extractForeshadowingFromData(data: any): Foreshadowing {
        // データが既にForeshadowing型の場合
        if (data.id && data.description && typeof data.resolved === 'boolean') {
            return data as Foreshadowing;
        }

        // ネストされた構造から抽出
        if (data.data && typeof data.data === 'object') {
            return this.extractForeshadowingFromData(data.data);
        }

        // JSON文字列の場合
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return this.extractForeshadowingFromData(parsed);
            } catch {
                throw new Error('Invalid foreshadowing data format');
            }
        }

        throw new Error('Unable to extract foreshadowing from data');
    }

    /**
  * 更新された伏線の統合記憶システムへの保存
  * @private
  */
    private async saveUpdatedForeshadowingToMemorySystem(
        foreshadowing: Foreshadowing
    ): Promise<{ success: boolean; error?: string }> {
        try {
            // 章データとして構築
            const foreshadowingChapter = this.buildForeshadowingUpdateChapter(foreshadowing);

            // MemoryManagerのprocessChapterメソッドを活用
            const result = await this.memoryManager.processChapter(foreshadowingChapter);

            return {
                success: result.success,
                // SystemOperationResultには'errors'プロパティがあるため修正
                error: result.success ? undefined : (result.errors && result.errors.length > 0 ? result.errors[0] : 'Unknown error')
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
    /**
     * 伏線更新用章データの構築
     * @private
     */
    private buildForeshadowingUpdateChapter(foreshadowing: Foreshadowing): any {
        return {
            id: `foreshadowing-update-${foreshadowing.id}-${Date.now()}`,
            chapterNumber: foreshadowing.chapter_introduced,
            title: `伏線更新: ${foreshadowing.description.substring(0, 30)}`,
            content: JSON.stringify({
                type: 'foreshadowing-update',
                data: foreshadowing,
                operation: 'update'
            }),
            previousChapterSummary: '',
            scenes: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                status: 'foreshadowing-update',
                type: 'foreshadowing-operation',
                foreshadowingId: foreshadowing.id,
                wordCount: JSON.stringify(foreshadowing).length,
                estimatedReadingTime: 1
            }
        };
    }

    /**
     * 伏線の整合性チェック - 統合記憶システム活用版
     * @param currentChapter 現在のチャプター番号
     * @returns 整合性チェック結果
     */
    async checkForeshadowingConsistency(currentChapter: number): Promise<ConsistencyCheckResult> {
        const startTime = Date.now();

        try {
            logger.info(`Checking foreshadowing consistency for chapter ${currentChapter}`);

            const result: ConsistencyCheckResult = {
                isConsistent: false,
                totalForeshadowings: 0,
                issues: [],
                processingTime: 0,
                memorySystemHealth: false
            };

            // システム健全性の確認
            const diagnostics = await this.memoryManager.performSystemDiagnostics();
            result.memorySystemHealth = diagnostics.systemHealth !== 'CRITICAL';

            if (!result.memorySystemHealth) {
                result.issues.push({
                    id: 'system',
                    issue: 'Memory system health is critical',
                    severity: 'HIGH',
                    recommendation: 'Check system diagnostics and resolve critical issues'
                });
            }

            // 統合検索で全伏線データを取得
            const allForeshadowingsResult = await this.memoryManager.unifiedSearch(
                'foreshadowing all comprehensive',
                [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM, MemoryLevel.SHORT_TERM]
            );

            if (allForeshadowingsResult.success) {
                const foreshadowings = this.extractAllForeshadowingsFromResults(allForeshadowingsResult.results);
                result.totalForeshadowings = foreshadowings.length;

                // 各種整合性チェックを実行
                const checkResults = await Promise.allSettled([
                    this.checkResolutionConsistency(foreshadowings),
                    this.checkTimingConsistency(foreshadowings, currentChapter),
                    this.checkDuplicateConsistency(foreshadowings),
                    this.checkDataIntegrityConsistency(foreshadowings)
                ]);

                // チェック結果の統合
                checkResults.forEach((checkResult, index) => {
                    if (checkResult.status === 'fulfilled') {
                        result.issues.push(...checkResult.value);
                    } else {
                        const checkNames = ['resolution', 'timing', 'duplicate', 'data-integrity'];
                        result.issues.push({
                            id: 'system',
                            issue: `${checkNames[index]} consistency check failed`,
                            severity: 'MEDIUM',
                            recommendation: 'Review system logs for detailed error information'
                        });
                    }
                });
            } else {
                result.issues.push({
                    id: 'system',
                    issue: 'Failed to retrieve foreshadowing data from memory system',
                    severity: 'HIGH',
                    recommendation: 'Check memory system connectivity and data integrity'
                });
            }

            result.isConsistent = result.issues.length === 0;
            result.processingTime = Date.now() - startTime;

            logger.info('Foreshadowing consistency check completed', {
                isConsistent: result.isConsistent,
                totalForeshadowings: result.totalForeshadowings,
                issueCount: result.issues.length,
                processingTime: result.processingTime
            });

            return result;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logError(error, { currentChapter }, 'Foreshadowing consistency check failed');

            return {
                isConsistent: false,
                totalForeshadowings: 0,
                issues: [{
                    id: 'system',
                    issue: `Consistency check failed: ${errorMessage}`,
                    severity: 'HIGH',
                    recommendation: 'Review system logs and restart consistency check'
                }],
                processingTime: Date.now() - startTime,
                memorySystemHealth: false
            };
        }
    }

    /**
     * 検索結果から全伏線データを抽出
     * @private
     */
    private extractAllForeshadowingsFromResults(results: any[]): Foreshadowing[] {
        const foreshadowings: Foreshadowing[] = [];

        for (const result of results) {
            try {
                if (result.type === 'foreshadowing' && result.data) {
                    const extracted = this.extractForeshadowingFromData(result.data);
                    foreshadowings.push(extracted);
                }
            } catch (error) {
                logger.debug('Failed to extract foreshadowing from result', { error });
            }
        }

        return foreshadowings;
    }

    /**
     * 解決整合性チェック
     * @private
     */
    private async checkResolutionConsistency(foreshadowings: Foreshadowing[]): Promise<Array<{
        id: string;
        issue: string;
        severity: 'HIGH' | 'MEDIUM' | 'LOW';
        recommendation: string;
    }>> {
        const issues: Array<{
            id: string;
            issue: string;
            severity: 'HIGH' | 'MEDIUM' | 'LOW';
            recommendation: string;
        }> = [];

        for (const foreshadowing of foreshadowings) {
            // 解決済みだが解決チャプターがない
            if (foreshadowing.resolved && !foreshadowing.resolution_chapter) {
                issues.push({
                    id: foreshadowing.id,
                    issue: '解決済みにマークされていますが、解決チャプターが設定されていません',
                    severity: 'MEDIUM',
                    recommendation: '解決チャプター番号を設定するか、解決状態を確認してください'
                });
            }

            // 未解決だが解決チャプターがある
            if (!foreshadowing.resolved && foreshadowing.resolution_chapter) {
                issues.push({
                    id: foreshadowing.id,
                    issue: '解決チャプターが設定されていますが、未解決状態です',
                    severity: 'MEDIUM',
                    recommendation: '解決状態を更新するか、解決チャプターを削除してください'
                });
            }
        }

        return issues;
    }

    /**
     * タイミング整合性チェック
     * @private
     */
    private async checkTimingConsistency(
        foreshadowings: Foreshadowing[],
        currentChapter: number
    ): Promise<Array<{
        id: string;
        issue: string;
        severity: 'HIGH' | 'MEDIUM' | 'LOW';
        recommendation: string;
    }>> {
        const issues: Array<{
            id: string;
            issue: string;
            severity: 'HIGH' | 'MEDIUM' | 'LOW';
            recommendation: string;
        }> = [];

        for (const foreshadowing of foreshadowings) {
            // 導入チャプターが未来
            if (foreshadowing.chapter_introduced > currentChapter) {
                issues.push({
                    id: foreshadowing.id,
                    issue: `導入チャプター(${foreshadowing.chapter_introduced})が現在のチャプター(${currentChapter})より未来です`,
                    severity: 'HIGH',
                    recommendation: '導入チャプター番号を修正してください'
                });
            }

            // 長期未解決
            if (!foreshadowing.resolved) {
                const chaptersElapsed = currentChapter - foreshadowing.chapter_introduced;
                if (chaptersElapsed > 20) {
                    issues.push({
                        id: foreshadowing.id,
                        issue: `長期間（${chaptersElapsed}チャプター）未解決の伏線です`,
                        severity: 'LOW',
                        recommendation: '解決を検討するか、解決予定を設定してください'
                    });
                }
            }

            // 解決予定が過ぎている
            if (!foreshadowing.resolved && foreshadowing.plannedResolution) {
                if (foreshadowing.plannedResolution < currentChapter - 5) {
                    issues.push({
                        id: foreshadowing.id,
                        issue: `計画解決チャプター(${foreshadowing.plannedResolution})を大幅に過ぎています`,
                        severity: 'MEDIUM',
                        recommendation: '解決予定を更新するか、解決を実行してください'
                    });
                }
            }
        }

        return issues;
    }

    /**
     * 重複整合性チェック
     * @private
     */
    private async checkDuplicateConsistency(foreshadowings: Foreshadowing[]): Promise<Array<{
        id: string;
        issue: string;
        severity: 'HIGH' | 'MEDIUM' | 'LOW';
        recommendation: string;
    }>> {
        const issues: Array<{
            id: string;
            issue: string;
            severity: 'HIGH' | 'MEDIUM' | 'LOW';
            recommendation: string;
        }> = [];

        // 類似説明の検出
        for (let i = 0; i < foreshadowings.length; i++) {
            for (let j = i + 1; j < foreshadowings.length; j++) {
                const similarity = this.calculateSimilarity(
                    foreshadowings[i].description,
                    foreshadowings[j].description
                );

                if (similarity > 0.8) {
                    issues.push({
                        id: foreshadowings[i].id,
                        issue: `伏線「${foreshadowings[j].id}」と内容が類似しています（類似度: ${(similarity * 100).toFixed(1)}%）`,
                        severity: 'MEDIUM',
                        recommendation: '重複する伏線を統合するか、差異を明確にしてください'
                    });
                }
            }
        }

        return issues;
    }

    /**
     * データ整合性チェック
     * @private
     */
    private async checkDataIntegrityConsistency(foreshadowings: Foreshadowing[]): Promise<Array<{
        id: string;
        issue: string;
        severity: 'HIGH' | 'MEDIUM' | 'LOW';
        recommendation: string;
    }>> {
        const issues: Array<{
            id: string;
            issue: string;
            severity: 'HIGH' | 'MEDIUM' | 'LOW';
            recommendation: string;
        }> = [];

        for (const foreshadowing of foreshadowings) {
            // 必須フィールドのチェック
            if (!foreshadowing.id) {
                issues.push({
                    id: 'unknown',
                    issue: 'IDが設定されていない伏線があります',
                    severity: 'HIGH',
                    recommendation: 'ユニークなIDを設定してください'
                });
            }

            if (!foreshadowing.description || foreshadowing.description.length < 10) {
                issues.push({
                    id: foreshadowing.id,
                    issue: '説明が不十分または設定されていません',
                    severity: 'HIGH',
                    recommendation: '詳細な説明を設定してください'
                });
            }

            if (typeof foreshadowing.chapter_introduced !== 'number' || foreshadowing.chapter_introduced < 1) {
                issues.push({
                    id: foreshadowing.id,
                    issue: '導入チャプター番号が無効です',
                    severity: 'HIGH',
                    recommendation: '正しいチャプター番号を設定してください'
                });
            }

            // 緊急度の検証
            if (foreshadowing.urgency && !['low', 'medium', 'high'].includes(foreshadowing.urgency)) {
                issues.push({
                    id: foreshadowing.id,
                    issue: `無効な緊急度「${foreshadowing.urgency}」が設定されています`,
                    severity: 'MEDIUM',
                    recommendation: 'low, medium, high のいずれかを設定してください'
                });
            }
        }

        return issues;
    }

    /**
     * 簡易類似度計算
     * @private
     */
    private calculateSimilarity(text1: string, text2: string): number {
        if (!text1 || !text2) return 0;

        const words1 = text1.toLowerCase().split(/\s+/);
        const words2 = text2.toLowerCase().split(/\s+/);

        const commonWords = words1.filter(word => words2.includes(word));
        const totalWords = Math.max(words1.length, words2.length);

        return totalWords > 0 ? commonWords.length / totalWords : 0;
    }

    /**
     * 統合記憶システムとの連携確認
     * @private
     */
    private async verifyMemorySystemIntegration(chapterNumber: number): Promise<boolean> {
        try {
            // 簡単な統合検索テストを実行
            const testResult = await this.memoryManager.unifiedSearch(
                'system integration test',
                [MemoryLevel.SHORT_TERM]
            );

            return testResult.success;

        } catch (error) {
            logger.warn('Memory system integration verification failed', { error, chapterNumber });
            return false;
        }
    }

    /**
     * キャッシュ効率の測定
     * @private
     */
    private async measureCacheEfficiency(): Promise<{ efficiency: number; hitCount: number }> {
        try {
            const systemStatus = await this.memoryManager.getSystemStatus();
            const cacheStats = systemStatus.cacheStatistics;

            const efficiency = cacheStats.hitRate || 0;
            const hitCount = cacheStats.hitCount || 0;

            return { efficiency, hitCount };

        } catch (error) {
            logger.warn('Cache efficiency measurement failed', { error });
            return { efficiency: 0, hitCount: 0 };
        }
    }

    /**
     * パフォーマンス統計の取得
     */
    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }

    /**
     * システム診断の実行
     */
    async performDiagnostics(): Promise<{
        systemHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
        memorySystemConnectivity: boolean;
        engineMetrics: any;
        performanceMetrics: any; // typeof this.performanceMetricsの代わりに明示的な型を使用
        recommendations: string[];
    }> {
        try {
            const engineDiagnostics = await this.engine.performDiagnostics();
            const systemDiagnostics = await this.memoryManager.performSystemDiagnostics();

            const recommendations: string[] = [];
            let systemHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';

            // パフォーマンス評価
            if (this.performanceMetrics.failedOperations > this.performanceMetrics.successfulOperations * 0.1) {
                systemHealth = 'DEGRADED';
                recommendations.push('High failure rate detected in foreshadowing operations');
            }

            // メモリシステム評価
            if (systemDiagnostics.systemHealth === 'CRITICAL') {
                systemHealth = 'CRITICAL';
                recommendations.push('Critical issues detected in memory system');
            }

            // エンジン健全性評価
            if (!engineDiagnostics.memorySystemConnectivity) {
                systemHealth = 'CRITICAL';
                recommendations.push('Memory system connectivity issues in foreshadowing engine');
            }

            // キャッシュ効率評価
            if (this.performanceMetrics.cacheEfficiencyRate < 0.5) {
                recommendations.push('Consider optimizing memory access patterns for better cache efficiency');
            }

            return {
                systemHealth,
                memorySystemConnectivity: engineDiagnostics.memorySystemConnectivity,
                engineMetrics: engineDiagnostics.performanceMetrics,
                performanceMetrics: this.performanceMetrics,
                recommendations: [...recommendations, ...engineDiagnostics.recommendations]
            };

        } catch (error) {
            logError(error, {}, 'Foreshadowing manager diagnostics failed');
            return {
                systemHealth: 'CRITICAL',
                memorySystemConnectivity: false,
                engineMetrics: {},
                performanceMetrics: this.performanceMetrics,
                recommendations: ['System diagnostics failed - check error logs']
            };
        }
    }

    // ============================================================================
    // プライベートヘルパーメソッド
    // ============================================================================

    /**
     * 平均処理時間の更新
     * @private
     */
    private updateAverageProcessingTime(processingTime: number): void {
        this.performanceMetrics.averageProcessingTime =
            ((this.performanceMetrics.averageProcessingTime * (this.performanceMetrics.totalOperations - 1)) + processingTime) /
            this.performanceMetrics.totalOperations;
    }
}

// シングルトンファクトリー（依存注入対応）
export const createForeshadowingManager = (memoryManager: MemoryManager): ForeshadowingManager => {
    return new ForeshadowingManager(memoryManager);
};