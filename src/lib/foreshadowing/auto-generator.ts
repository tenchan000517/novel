/**
 * @fileoverview 伏線自動生成モジュール - 新記憶階層システム完全対応版
 * @description
 * 統合記憶階層システムに最適化された伏線自動生成コンポーネント。
 * MemoryManagerの統一APIを最大限活用し、AI (Gemini)による創造的な伏線生成、
 * インテリジェントな重複検出、統合記憶システムへの効率的な保存を実現。
 */

import { GeminiClient } from '@/lib/generation/gemini-client';
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { 
    MemoryLevel, 
    MemoryRequestType,
    UnifiedMemoryContext 
} from '@/lib/memory/core/types';
import { Foreshadowing } from '@/types/memory';
import { Chapter } from '@/types/chapters';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';

/**
 * 伏線生成設定
 */
interface ForeshadowingGenerationConfig {
    useMemorySystemIntegration: boolean;
    enableIntelligentDuplicateDetection: boolean;
    enableContextEnrichment: boolean;
    maxRetries: number;
    timeoutMs: number;
    defaultCount: number;
}

/**
 * 伏線生成結果
 */
interface ForeshadowingGenerationResult {
    success: boolean;
    generated: number;
    saved: number;
    duplicatesDetected: number;
    errors: string[];
    processingTime: number;
    contextEnrichmentUsed: boolean;
    memoryIntegrationSuccess: boolean;
}

/**
 * 伏線生成統計
 */
interface ForeshadowingStatistics {
    totalGenerations: number;
    totalSaved: number;
    totalDuplicatesDetected: number;
    averageProcessingTime: number;
    memoryIntegrationSuccessRate: number;
    contextEnrichmentRate: number;
    lastGenerationTime: string;
}

/**
 * 診断結果
 */
interface ForeshadowingGeneratorDiagnostics {
    operational: boolean;
    efficiency: number;
    errorRate: number;
    lastOptimization: string;
    recommendations: string[];
    statistics: ForeshadowingStatistics;
    memorySystemStatus: {
        connected: boolean;
        lastSuccessfulAccess: string;
        duplicateDetectionAccuracy: number;
    };
}

/**
 * 伏線自動生成クラス - 新記憶階層システム完全対応版
 * 
 * 統合記憶階層システムの能力を最大限活用した高度な伏線生成機能を提供。
 * AI生成、インテリジェント重複検出、記憶統合、パフォーマンス最適化を実現。
 */
export class ForeshadowingAutoGenerator {
    private geminiClient: GeminiClient;
    private readonly config: ForeshadowingGenerationConfig;
    
    // 統計・診断情報
    private lastResult: ForeshadowingGenerationResult | null = null;
    private statistics: ForeshadowingStatistics;
    private memorySystemStatus: {
        connected: boolean;
        lastSuccessfulAccess: string;
        duplicateDetectionAccuracy: number;
    };

    /**
     * 伏線自動生成器を初期化
     * @param memoryManager 統合記憶マネージャー（必須依存注入）
     * @param geminiClient Gemini APIクライアント（オプション）
     * @param config 生成設定（オプション）
     */
    constructor(
        private memoryManager: MemoryManager,
        geminiClient?: GeminiClient,
        config?: Partial<ForeshadowingGenerationConfig>
    ) {
        // 必須依存性の検証
        if (!this.memoryManager) {
            throw new Error('MemoryManager is required for ForeshadowingAutoGenerator initialization');
        }

        this.geminiClient = geminiClient || new GeminiClient();
        
        // 設定の完全検証と初期化
        this.config = {
            useMemorySystemIntegration: true,
            enableIntelligentDuplicateDetection: true,
            enableContextEnrichment: true,
            maxRetries: 3,
            timeoutMs: 30000,
            defaultCount: 3,
            ...config
        };

        // 統計情報の初期化
        this.statistics = {
            totalGenerations: 0,
            totalSaved: 0,
            totalDuplicatesDetected: 0,
            averageProcessingTime: 0,
            memoryIntegrationSuccessRate: 0,
            contextEnrichmentRate: 0,
            lastGenerationTime: ''
        };

        this.memorySystemStatus = {
            connected: false,
            lastSuccessfulAccess: '',
            duplicateDetectionAccuracy: 0
        };

        logger.info('ForeshadowingAutoGenerator: 新記憶階層システム完全対応版で初期化完了', {
            memoryIntegration: this.config.useMemorySystemIntegration,
            duplicateDetection: this.config.enableIntelligentDuplicateDetection,
            contextEnrichment: this.config.enableContextEnrichment
        });
    }

    /**
     * 物語コンテキストから伏線を生成
     * @param context 物語の現在のコンテキスト
     * @param currentChapter 現在のチャプター番号
     * @param count 生成する伏線の数
     * @returns 生成された伏線の配列
     */
    async generateForeshadowing(
        context: string,
        currentChapter: number,
        count: number = this.config.defaultCount
    ): Promise<Foreshadowing[]> {
        return await this.executeWithPerformanceTracking(
            async () => {
                logger.info('伏線の自動生成開始', { 
                    chapterNumber: currentChapter, 
                    count,
                    useMemorySystem: this.config.useMemorySystemIntegration
                });

                // 記憶階層システムからの豊富なコンテキスト取得
                const enrichedContext = await this.getEnrichedContext(context, currentChapter);

                // AI生成用の高度プロンプト作成
                const prompt = this.createAdvancedGenerationPrompt(
                    enrichedContext.finalContext, 
                    currentChapter, 
                    count,
                    enrichedContext.worldSettings,
                    enrichedContext.characterInfo
                );

                // リトライロジック付きAI生成
                const response = await this.retryGenerationRequest(
                    () => this.geminiClient.generateText(prompt, {
                        temperature: 0.7,
                        targetLength: 2000
                    }),
                    '伏線生成'
                );

                // 応答解析と検証
                const generatedForeshadowing = this.parseAndValidateResponse(response, currentChapter);

                logger.info('伏線の自動生成完了', { 
                    generated: generatedForeshadowing.length,
                    contextEnrichmentUsed: enrichedContext.enrichmentUsed
                });

                return generatedForeshadowing;
            },
            'generateForeshadowing'
        );
    }

    /**
     * 伏線を生成して記憶階層システムに保存
     * @param context 物語の現在のコンテキスト
     * @param currentChapter 現在のチャプター番号
     * @param count 生成する伏線の数
     * @returns 保存された伏線の数
     */
    async generateAndSaveForeshadowing(
        context: string,
        currentChapter: number,
        count: number = this.config.defaultCount
    ): Promise<number> {
        const startTime = Date.now();
        this.statistics.totalGenerations++;

        try {
            logger.info('伏線の生成と保存開始', { 
                chapterNumber: currentChapter, 
                count 
            });

            // Step 1: 記憶階層システムの状態確認
            const systemStatus = await this.verifyMemorySystemStatus();
            
            // Step 2: 伏線生成
            const generatedForeshadowing = await this.generateForeshadowing(context, currentChapter, count);

            // Step 3: インテリジェント重複検出
            const uniqueForeshadowing = await this.performIntelligentDuplicateDetection(generatedForeshadowing);

            // Step 4: 記憶階層システムへの保存
            const savedCount = await this.saveToMemorySystem(uniqueForeshadowing, currentChapter);

            // Step 5: 結果記録と統計更新
            const processingTime = Date.now() - startTime;
            this.lastResult = {
                success: true,
                generated: generatedForeshadowing.length,
                saved: savedCount,
                duplicatesDetected: generatedForeshadowing.length - uniqueForeshadowing.length,
                errors: [],
                processingTime,
                contextEnrichmentUsed: this.config.enableContextEnrichment,
                memoryIntegrationSuccess: systemStatus.initialized
            };

            this.updateStatistics(this.lastResult);

            logger.info('伏線の生成と保存完了', {
                generated: generatedForeshadowing.length,
                saved: savedCount,
                duplicatesDetected: this.lastResult.duplicatesDetected,
                processingTime
            });

            return savedCount;

        } catch (error) {
            return this.handleGenerationError(error, context, currentChapter, count, Date.now() - startTime);
        }
    }

    /**
     * 伏線を章として記憶階層システムに統合
     * @param foreshadowing 統合する伏線
     * @param chapterNumber チャプター番号
     */
    async integrateForeshadowingAsChapter(
        foreshadowing: Foreshadowing,
        chapterNumber: number
    ): Promise<boolean> {
        return await this.safeMemoryOperation(
            async () => {
                // Chapter型に完全準拠した構築
                const chapter: Chapter = {
                    id: `foreshadowing-${foreshadowing.id}`,
                    chapterNumber,
                    title: `伏線統合: ${foreshadowing.description.substring(0, 30)}...`,
                    content: this.createForeshadowingChapterContent(foreshadowing),
                    previousChapterSummary: '',
                    scenes: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    metadata: {
                        createdAt: new Date().toISOString(),
                        lastModified: new Date().toISOString(),
                        status: 'foreshadowing-integration',
                        wordCount: foreshadowing.description.length,
                        estimatedReadingTime: 1,
                        foreshadowingId: foreshadowing.id,
                        foreshadowingType: 'integration'
                    }
                };

                const result = await this.memoryManager.processChapter(chapter);
                
                if (!result.success) {
                    throw new Error(`Foreshadowing integration failed: ${result.errors.join(', ')}`);
                }

                logger.info('伏線を章として統合完了', {
                    foreshadowingId: foreshadowing.id,
                    chapterNumber,
                    processingTime: result.processingTime
                });

                return true;
            },
            false,
            'integrateForeshadowingAsChapter'
        );
    }

    /**
     * 最後の生成結果を取得
     */
    getLastGenerationResult(): ForeshadowingGenerationResult | null {
        return this.lastResult;
    }

    /**
     * 生成統計を取得
     */
    getStatistics(): ForeshadowingStatistics {
        return { ...this.statistics };
    }

    /**
     * 診断情報を取得
     */
    async getDiagnostics(): Promise<ForeshadowingGeneratorDiagnostics> {
        try {
            const efficiency = this.calculateSystemEfficiency();
            const errorRate = this.calculateErrorRate();

            const recommendations: string[] = [];

            if (efficiency < 0.8) {
                recommendations.push('Consider optimizing memory system integration');
            }

            if (errorRate > 0.1) {
                recommendations.push('High error rate detected in foreshadowing generation');
            }

            if (this.statistics.memoryIntegrationSuccessRate < 0.9) {
                recommendations.push('Memory system integration issues detected');
            }

            if (!this.memorySystemStatus.connected) {
                recommendations.push('Memory system connection issues detected');
            }

            return {
                operational: this.memorySystemStatus.connected,
                efficiency,
                errorRate,
                lastOptimization: new Date().toISOString(),
                recommendations,
                statistics: this.statistics,
                memorySystemStatus: { ...this.memorySystemStatus }
            };

        } catch (error) {
            logger.error('Failed to get ForeshadowingAutoGenerator diagnostics', { error });
            
            return {
                operational: false,
                efficiency: 0,
                errorRate: 1,
                lastOptimization: '',
                recommendations: ['Diagnostics failed - check system status'],
                statistics: this.statistics,
                memorySystemStatus: this.memorySystemStatus
            };
        }
    }

    /**
     * 統計をリセット
     */
    resetStatistics(): void {
        this.statistics = {
            totalGenerations: 0,
            totalSaved: 0,
            totalDuplicatesDetected: 0,
            averageProcessingTime: 0,
            memoryIntegrationSuccessRate: 0,
            contextEnrichmentRate: 0,
            lastGenerationTime: ''
        };
        this.lastResult = null;
        
        logger.info('ForeshadowingAutoGenerator statistics reset');
    }

    // ============================================================================
    // Private Methods - Memory System Integration
    // ============================================================================

    /**
     * 記憶階層システムの状態を確認
     * @private
     */
    private async verifyMemorySystemStatus(): Promise<{ initialized: boolean; operational: boolean }> {
        return await this.safeMemoryOperation(
            async () => {
                const systemStatus = await this.memoryManager.getSystemStatus();
                
                if (!systemStatus.initialized) {
                    logger.warn('Memory system not initialized for foreshadowing generation');
                }

                return {
                    initialized: systemStatus.initialized,
                    operational: true as boolean
                };
            },
            { initialized: false, operational: false },
            'verifyMemorySystemStatus'
        );
    }

    /**
     * 豊富なコンテキストを取得
     * @private
     */
    private async getEnrichedContext(
        baseContext: string, 
        currentChapter: number
    ): Promise<{
        finalContext: string;
        worldSettings: any;
        characterInfo: any;
        enrichmentUsed: boolean;
    }> {
        if (!this.config.enableContextEnrichment) {
            return {
                finalContext: baseContext,
                worldSettings: null,
                characterInfo: null,
                enrichmentUsed: false
            };
        }

        return await this.safeMemoryOperation(
            async () => {
                // 統合検索による関連情報取得
                const [worldResult, characterResult, narrativeResult] = await Promise.allSettled([
                    this.memoryManager.unifiedSearch(
                        'world settings foreshadowing context',
                        [MemoryLevel.LONG_TERM]
                    ),
                    this.memoryManager.unifiedSearch(
                        'character information relationships',
                        [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM]
                    ),
                    this.memoryManager.unifiedSearch(
                        `narrative progression chapter ${currentChapter}`,
                        [MemoryLevel.MID_TERM, MemoryLevel.SHORT_TERM]
                    )
                ]);

                // 結果の統合
                const worldSettings = this.extractWorldSettingsFromResult(worldResult);
                const characterInfo = this.extractCharacterInfoFromResult(characterResult);
                const narrativeInfo = this.extractNarrativeInfoFromResult(narrativeResult);

                // 強化されたコンテキストの構築
                const enrichedContext = this.buildEnrichedContext(
                    baseContext,
                    worldSettings,
                    characterInfo,
                    narrativeInfo
                );

                return {
                    finalContext: enrichedContext,
                    worldSettings,
                    characterInfo,
                    enrichmentUsed: true as boolean
                };
            },
            {
                finalContext: baseContext,
                worldSettings: null,
                characterInfo: null,
                enrichmentUsed: false
            },
            'getEnrichedContext'
        );
    }

    /**
     * インテリジェント重複検出を実行
     * @private
     */
    private async performIntelligentDuplicateDetection(
        foreshadowing: Foreshadowing[]
    ): Promise<Foreshadowing[]> {
        if (!this.config.enableIntelligentDuplicateDetection) {
            return foreshadowing;
        }

        return await this.safeMemoryOperation(
            async () => {
                const uniqueForeshadowing: Foreshadowing[] = [];

                for (const item of foreshadowing) {
                    const isDuplicate = await this.checkForSimilarForeshadowing(item);
                    
                    if (!isDuplicate) {
                        uniqueForeshadowing.push(item);
                    } else {
                        this.statistics.totalDuplicatesDetected++;
                        logger.debug('重複伏線を検出してスキップ', {
                            description: item.description.substring(0, 50)
                        });
                    }
                }

                return uniqueForeshadowing;
            },
            foreshadowing,
            'performIntelligentDuplicateDetection'
        );
    }

    /**
     * 類似伏線をチェック
     * @private
     */
    private async checkForSimilarForeshadowing(foreshadowing: Foreshadowing): Promise<boolean> {
        try {
            // 統合検索による類似伏線検索
            const searchResult = await this.memoryManager.unifiedSearch(
                `foreshadowing ${foreshadowing.description}`,
                [MemoryLevel.LONG_TERM]
            );

            if (!searchResult.success || !searchResult.results) {
                return false;
            }

            // 類似度判定（簡易版）
            for (const result of searchResult.results) {
                if (result.type === 'knowledge' && result.data) {
                    const similarity = this.calculateSimilarity(
                        foreshadowing.description,
                        result.data.description || ''
                    );

                    if (similarity > 0.8) {
                        return true;
                    }
                }
            }

            return false;

        } catch (error) {
            logger.warn('Failed to check for similar foreshadowing', { error });
            return false;
        }
    }

    /**
     * 記憶階層システムに保存
     * @private
     */
    private async saveToMemorySystem(
        foreshadowing: Foreshadowing[],
        currentChapter: number
    ): Promise<number> {
        let savedCount = 0;

        for (const item of foreshadowing) {
            try {
                // 伏線を章として統合
                const integrated = await this.integrateForeshadowingAsChapter(item, currentChapter);
                
                if (integrated) {
                    savedCount++;
                    logger.debug('伏線を記憶階層に保存完了', {
                        id: item.id,
                        description: item.description.substring(0, 50)
                    });
                }

            } catch (error) {
                logger.error('伏線の保存に失敗', {
                    foreshadowingId: item.id,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        this.statistics.totalSaved += savedCount;
        return savedCount;
    }

    /**
     * 安全な記憶システム操作
     * @private
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
            const result = await operation();
            this.memorySystemStatus.connected = true;
            this.memorySystemStatus.lastSuccessfulAccess = new Date().toISOString();
            return result;

        } catch (error) {
            logger.error(`Memory operation failed: ${operationName}`, { error });
            this.memorySystemStatus.connected = false;
            return fallbackValue;
        }
    }

    // ============================================================================
    // Private Methods - Generation Logic
    // ============================================================================

    /**
     * 高度生成プロンプトを作成
     * @private
     */
    private createAdvancedGenerationPrompt(
        context: string,
        currentChapter: number,
        count: number,
        worldSettings: any,
        characterInfo: any
    ): string {
        const worldContext = worldSettings?.description || 'ファンタジー世界';
        const characterContext = this.formatCharacterContext(characterInfo);

        return `
あなたはファンタジー小説の伏線設計専門家です。
以下の詳細な情報に基づいて、今後の展開で効果的に回収可能な伏線を${count}個考えてください。

## 世界観設定
${worldContext}

## キャラクター情報
${characterContext}

## 物語のコンテキスト
${context.substring(0, 3000)}

## 現在の状況
- 現在のチャプター: ${currentChapter}
- 伏線導入時期: ${currentChapter}章以降
- 回収予定時期: ${currentChapter + 2}章以降

## 伏線設計の要件
- 世界観とキャラクターに深く根ざした内容
- 読者の興味を引く神秘的・魅力的要素
- 将来的な回収時に驚きと納得感を提供
- 物語の主要テーマに関連

以下のJSONフォーマットで出力してください:
[
  {
    "description": "伏線の簡潔で魅力的な説明",
    "context": "伏線の詳細コンテキストと導入方法",
    "chapter_introduced": ${currentChapter}以降の導入チャプター番号,
    "potential_resolution": "予想される解決方法と驚きの要素",
    "urgency": "high/medium/low - 物語における重要度",
    "plannedResolution": ${currentChapter + 2}以降の解決予定チャプター,
    "relatedCharacters": ["関連キャラクター名"]
  }
]
        `.trim();
    }

    /**
     * 応答を解析・検証
     * @private
     */
    private parseAndValidateResponse(response: string, currentChapter: number): Foreshadowing[] {
        try {
            // JSON抽出の改善
            const jsonRegex = /\[\s*\{[\s\S]*?\}\s*\]/g;
            const jsonMatch = response.match(jsonRegex);

            if (!jsonMatch) {
                throw new Error('有効なJSON形式が見つかりませんでした');
            }

            const rawData = JSON.parse(jsonMatch[0]);
            
            if (!Array.isArray(rawData)) {
                throw new Error('JSON形式が配列ではありません');
            }

            return this.validateAndFormatForeshadowing(rawData, currentChapter);

        } catch (parseError) {
            logError(parseError, { response: response.substring(0, 200) }, 'AIレスポンスのパースに失敗');
            throw new Error('伏線生成結果のパースに失敗しました');
        }
    }

    /**
     * 伏線データを検証・整形
     * @private
     */
    private validateAndFormatForeshadowing(
        rawData: any[],
        currentChapter: number
    ): Foreshadowing[] {
        return rawData
            .filter((item: any) => 
                item.description && 
                typeof item.description === 'string' &&
                item.description.length > 10
            )
            .map((item: any) => {
                const foreshadowing: Foreshadowing = {
                    id: `auto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    description: item.description.trim(),
                    chapter_introduced: Math.max(currentChapter, item.chapter_introduced || currentChapter),
                    resolved: false,
                    urgency: this.validateUrgency(item.urgency),
                    createdTimestamp: new Date().toISOString(),
                    updatedTimestamp: new Date().toISOString()
                };

                // オプションフィールドの安全な追加
                if (item.context && typeof item.context === 'string') {
                    foreshadowing.context = item.context.trim();
                }

                if (item.potential_resolution && typeof item.potential_resolution === 'string') {
                    foreshadowing.potential_resolution = item.potential_resolution.trim();
                }

                if (item.plannedResolution && typeof item.plannedResolution === 'number') {
                    foreshadowing.plannedResolution = Math.max(currentChapter + 1, item.plannedResolution);
                }

                if (item.relatedCharacters && Array.isArray(item.relatedCharacters)) {
                    foreshadowing.relatedCharacters = item.relatedCharacters
                        .filter((char: unknown) => typeof char === 'string' && (char as string).trim().length > 0)
                        .map((char: unknown) => (char as string).trim());
                }

                return foreshadowing;
            });
    }

    /**
     * 緊急度を検証
     * @private
     */
    private validateUrgency(urgency: any): string {
        const validValues = ['low', 'medium', 'high', 'critical'];
        if (typeof urgency === 'string' && validValues.includes(urgency.toLowerCase())) {
            return urgency.toLowerCase();
        }
        return 'medium';
    }

    // ============================================================================
    // Private Methods - Context Enhancement
    // ============================================================================

    /**
     * 検索結果から世界設定を抽出
     * @private
     */
    private extractWorldSettingsFromResult(result: PromiseSettledResult<any>): any {
        try {
            if (result.status === 'fulfilled' && result.value?.success && result.value.results) {
                for (const item of result.value.results) {
                    if (item.type === 'knowledge' && item.data) {
                        return item.data;
                    }
                }
            }
        } catch (error) {
            logger.debug('Failed to extract world settings from result', { error });
        }
        return null;
    }

    /**
     * 検索結果からキャラクター情報を抽出
     * @private
     */
    private extractCharacterInfoFromResult(result: PromiseSettledResult<any>): any {
        try {
            if (result.status === 'fulfilled' && result.value?.success && result.value.results) {
                const characters = result.value.results
                    .filter((item: any) => item.type === 'character' || item.type === 'knowledge')
                    .map((item: any) => item.data)
                    .filter(Boolean);
                
                return characters.length > 0 ? characters : null;
            }
        } catch (error) {
            logger.debug('Failed to extract character info from result', { error });
        }
        return null;
    }

    /**
     * 検索結果から物語情報を抽出
     * @private
     */
    private extractNarrativeInfoFromResult(result: PromiseSettledResult<any>): any {
        try {
            if (result.status === 'fulfilled' && result.value?.success && result.value.results) {
                return result.value.results
                    .filter((item: any) => item.type === 'narrative' || item.type === 'analysis')
                    .map((item: any) => item.data)
                    .filter(Boolean);
            }
        } catch (error) {
            logger.debug('Failed to extract narrative info from result', { error });
        }
        return null;
    }

    /**
     * 強化されたコンテキストを構築
     * @private
     */
    private buildEnrichedContext(
        baseContext: string,
        worldSettings: any,
        characterInfo: any,
        narrativeInfo: any
    ): string {
        let enrichedContext = baseContext;

        try {
            if (worldSettings?.description) {
                enrichedContext += `\n\n【世界設定】\n${worldSettings.description}`;
            }

            if (characterInfo && Array.isArray(characterInfo) && characterInfo.length > 0) {
                const characterSummary = characterInfo
                    .map((char: any) => `${char.name || 'Unknown'}: ${char.description || ''}`)
                    .join('\n');
                enrichedContext += `\n\n【主要キャラクター】\n${characterSummary}`;
            }

            if (narrativeInfo && Array.isArray(narrativeInfo) && narrativeInfo.length > 0) {
                enrichedContext += '\n\n【物語の進行状況】\n最新の展開や重要な出来事が考慮されています';
            }

        } catch (error) {
            logger.warn('Failed to build enriched context', { error });
        }

        return enrichedContext;
    }

    /**
     * キャラクターコンテキストをフォーマット
     * @private
     */
    private formatCharacterContext(characterInfo: any): string {
        try {
            if (!characterInfo || !Array.isArray(characterInfo)) {
                return '主要キャラクターの詳細情報は利用できません';
            }

            return characterInfo
                .slice(0, 5) // 最大5キャラクター
                .map((char: any) => {
                    const name = char.name || 'Unknown';
                    const description = char.description || '';
                    const type = char.type ? ` (${char.type})` : '';
                    
                    return `- ${name}${type}: ${description}`;
                })
                .join('\n');

        } catch (error) {
            logger.warn('Failed to format character context', { error });
            return '主要キャラクターの詳細情報は利用できません';
        }
    }

    /**
     * 伏線章コンテンツを作成
     * @private
     */
    private createForeshadowingChapterContent(foreshadowing: Foreshadowing): string {
        return `
伏線統合: ${foreshadowing.description}

【詳細】
${foreshadowing.context || '詳細なコンテキストは設定されていません'}

【予想される解決方法】
${foreshadowing.potential_resolution || '解決方法は未定義です'}

【関連キャラクター】
${foreshadowing.relatedCharacters?.join(', ') || 'なし'}

【重要度】
${foreshadowing.urgency}

【導入チャプター】
${foreshadowing.chapter_introduced}

【解決予定チャプター】
${foreshadowing.plannedResolution || '未定'}
        `.trim();
    }

    // ============================================================================
    // Private Methods - Utilities
    // ============================================================================

    /**
     * 類似度を計算（簡易版）
     * @private
     */
    private calculateSimilarity(text1: string, text2: string): number {
        try {
            if (!text1 || !text2) return 0;

            const normalize = (text: string) => text.toLowerCase().replace(/[^\w\s]/g, '');
            const normalized1 = normalize(text1);
            const normalized2 = normalize(text2);

            // 簡易的なレーベンシュタイン距離による類似度計算
            const maxLength = Math.max(normalized1.length, normalized2.length);
            if (maxLength === 0) return 1;

            const distance = this.levenshteinDistance(normalized1, normalized2);
            return 1 - (distance / maxLength);

        } catch (error) {
            logger.warn('Failed to calculate similarity', { error });
            return 0;
        }
    }

    /**
     * レーベンシュタイン距離を計算
     * @private
     */
    private levenshteinDistance(str1: string, str2: string): number {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + indicator
                );
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * リトライロジック付きAI生成
     * @private
     */
    private async retryGenerationRequest(
        requestFn: () => Promise<string>,
        operationName: string
    ): Promise<string> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                logger.warn(`${operationName}の試行 ${attempt}/${this.config.maxRetries} が失敗`, {
                    error: lastError.message
                });

                if (attempt < this.config.maxRetries) {
                    const delay = 1000 * Math.pow(2, attempt - 1);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError || new Error(`${operationName}に失敗しました`);
    }

    /**
     * パフォーマンス監視付きで実行
     * @private
     */
    private async executeWithPerformanceTracking<T>(
        operation: () => Promise<T>,
        operationName: string
    ): Promise<T> {
        const startTime = Date.now();
        
        try {
            const result = await operation();
            
            const processingTime = Date.now() - startTime;
            logger.debug(`Operation ${operationName} completed`, { processingTime });
            
            return result;
        } catch (error) {
            const processingTime = Date.now() - startTime;
            logger.error(`Operation ${operationName} failed`, {
                processingTime,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 生成エラーを処理
     * @private
     */
    private handleGenerationError(
        error: unknown,
        context: string,
        currentChapter: number,
        count: number,
        processingTime: number
    ): never {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        this.lastResult = {
            success: false,
            generated: 0,
            saved: 0,
            duplicatesDetected: 0,
            errors: [errorMessage],
            processingTime,
            contextEnrichmentUsed: false,
            memoryIntegrationSuccess: false
        };

        this.statistics.lastGenerationTime = new Date().toISOString();

        logError(error, {
            context: context.substring(0, 100),
            currentChapter,
            count
        }, '伏線の生成と保存に失敗しました');
        
        throw error;
    }

    /**
     * 統計を更新
     * @private
     */
    private updateStatistics(result: ForeshadowingGenerationResult): void {
        try {
            if (result.success) {
                // 平均処理時間の更新
                this.statistics.averageProcessingTime = 
                    ((this.statistics.averageProcessingTime * (this.statistics.totalGenerations - 1)) + result.processingTime) / 
                    this.statistics.totalGenerations;

                // メモリ統合成功率の更新
                const totalGenerations = this.statistics.totalGenerations;
                const memorySuccessCount = this.statistics.memoryIntegrationSuccessRate * (totalGenerations - 1) + 
                                        (result.memoryIntegrationSuccess ? 1 : 0);
                this.statistics.memoryIntegrationSuccessRate = memorySuccessCount / totalGenerations;

                // コンテキスト強化率の更新
                const contextSuccessCount = this.statistics.contextEnrichmentRate * (totalGenerations - 1) + 
                                         (result.contextEnrichmentUsed ? 1 : 0);
                this.statistics.contextEnrichmentRate = contextSuccessCount / totalGenerations;
            }

            this.statistics.lastGenerationTime = new Date().toISOString();

        } catch (error) {
            logger.warn('Failed to update statistics', { error });
        }
    }

    /**
     * システム効率を計算
     * @private
     */
    private calculateSystemEfficiency(): number {
        try {
            const generationSuccessRate = this.statistics.totalGenerations > 0
                ? (this.statistics.totalGenerations - (this.lastResult?.errors.length || 0)) / this.statistics.totalGenerations
                : 0;

            const memoryIntegrationRate = this.statistics.memoryIntegrationSuccessRate;
            const duplicateDetectionAccuracy = this.memorySystemStatus.duplicateDetectionAccuracy;

            return (generationSuccessRate * 0.4) + (memoryIntegrationRate * 0.4) + (duplicateDetectionAccuracy * 0.2);

        } catch (error) {
            logger.warn('Failed to calculate system efficiency', { error });
            return 0;
        }
    }

    /**
     * エラー率を計算
     * @private
     */
    private calculateErrorRate(): number {
        try {
            if (this.statistics.totalGenerations === 0) return 0;
            
            const errorCount = this.lastResult?.errors.length || 0;
            return errorCount / this.statistics.totalGenerations;
        } catch (error) {
            logger.warn('Failed to calculate error rate', { error });
            return 1;
        }
    }
}

/**
 * ファクトリー関数 - MemoryManager依存注入付きインスタンス作成
 * @param memoryManager 統合記憶マネージャー
 * @param geminiClient Gemini APIクライアント（オプション）
 * @param config 生成設定（オプション）
 * @returns 設定済みForeshadowingAutoGeneratorインスタンス
 */
export function createForeshadowingAutoGenerator(
    memoryManager: MemoryManager,
    geminiClient?: GeminiClient,
    config?: Partial<ForeshadowingGenerationConfig>
): ForeshadowingAutoGenerator {
    return new ForeshadowingAutoGenerator(memoryManager, geminiClient, config);
}

/**
 * 使用例とベストプラクティス
 * 
 * @example
 * // 基本的な使用方法
 * const memoryManager = new MemoryManager(config);
 * await memoryManager.initialize();
 * 
 * const generator = createForeshadowingAutoGenerator(memoryManager);
 * 
 * // 伏線の生成と保存
 * const savedCount = await generator.generateAndSaveForeshadowing(
 *   "物語のコンテキスト...",
 *   5, // 現在のチャプター
 *   3  // 生成する伏線の数
 * );
 * 
 * // 診断情報の取得
 * const diagnostics = await generator.getDiagnostics();
 * console.log('Generator efficiency:', diagnostics.efficiency);
 */