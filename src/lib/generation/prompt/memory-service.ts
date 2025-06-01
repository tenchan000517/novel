/**
 * @fileoverview 新統合記憶階層システム対応メモリサービス
 * @description 
 * 統合記憶管理システム（MemoryManager）を活用した前章情報・シーン連続性サービス。
 * 新しい記憶階層システムの能力を最大限活用し、型安全性と拡張性を確保。
 */

import { logger } from '@/lib/utils/logger';
import { Chapter } from '@/types/chapters';

// 新統合記憶階層システムのインポート
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { 
    MemoryLevel, 
    MemoryRequestType,
    UnifiedSearchResult
} from '@/lib/memory/core/types';

/**
 * @interface MemoryServiceConfig
 * @description メモリサービス設定
 */
export interface MemoryServiceConfig {
    useMemorySystemIntegration: boolean;
    fallbackEnabled: boolean;
    cacheEnabled: boolean;
    searchOptimization: boolean;
    maxRetries: number;
    timeoutMs: number;
}

/**
 * @interface SceneContinuityInfo
 * @description シーン連続性情報
 */
export interface SceneContinuityInfo {
    previousScene: string;
    characterPositions: string;
    timeElapsed: string;
    location: string;
    endingGuidance: string;
}

/**
 * @interface PreviousChapterEndingResult
 * @description 前章終了部分の取得結果
 */
export interface PreviousChapterEndingResult {
    success: boolean;
    content: string;
    source: 'unified-memory' | 'cache' | 'fallback';
    metadata?: {
        chapterNumber: number;
        processingTime: number;
        qualityScore: number;
        dataFreshness: number;
    };
}

/**
 * @interface MemoryServiceDiagnostics
 * @description メモリサービス診断情報
 */
interface MemoryServiceDiagnostics {
    operational: boolean;
    memoryManagerStatus: boolean;
    unifiedSearchOperational: boolean;
    cacheHitRate: number;
    averageResponseTime: number;
    errorRate: number;
    lastSuccessfulOperation: string;
    recommendations: string[];
}

/**
 * @class MemoryService
 * @description
 * 新統合記憶階層システムを活用した高度なメモリサービス。
 * 前章情報の取得、シーン連続性管理、物語状態の分析を統合的に提供。
 */
export class MemoryService {
    private config: MemoryServiceConfig;
    private initialized: boolean = false;
    private memoryManager: MemoryManager;

    // パフォーマンス統計
    private performanceMetrics = {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageProcessingTime: 0,
        memorySystemHits: 0,
        cacheHits: 0,
        fallbackUsed: 0,
        lastOptimization: new Date().toISOString()
    };

    /**
     * コンストラクタ - 依存注入パターンによる初期化
     * @param memoryManager 統合記憶管理システム
     * @param config サービス設定
     */
    constructor(
        memoryManager: MemoryManager,
        config?: Partial<MemoryServiceConfig>
    ) {
        this.memoryManager = memoryManager;
        this.config = {
            useMemorySystemIntegration: true,
            fallbackEnabled: true,
            cacheEnabled: true,
            searchOptimization: true,
            maxRetries: 3,
            timeoutMs: 10000,
            ...config
        };

        this.validateConfiguration();
        logger.info('MemoryService initialized with unified memory system integration', {
            config: this.config
        });
    }

    /**
     * サービスを初期化
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('MemoryService already initialized');
            return;
        }

        try {
            // MemoryManagerの初期化状態確認
            const systemStatus = await this.memoryManager.getSystemStatus();
            
            if (!systemStatus.initialized) {
                logger.warn('MemoryManager not fully initialized, attempting initialization...');
                await this.memoryManager.initialize();
            }

            this.initialized = true;
            logger.info('MemoryService initialization completed successfully');

        } catch (error) {
            logger.error('Failed to initialize MemoryService', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw new Error(`MemoryService initialization failed: ${error}`);
        }
    }

    /**
     * 前章の終了部分を高度な統合検索で取得
     * @param chapterNumber 現在の章番号
     * @returns 前章の終了部分と詳細メタデータ
     */
    async getPreviousChapterEnding(chapterNumber: number): Promise<PreviousChapterEndingResult> {
        const startTime = Date.now();
        this.performanceMetrics.totalOperations++;

        try {
            await this.ensureInitialized();

            if (chapterNumber <= 1) {
                return this.createSuccessResult(
                    '物語の始まりです。最初の章では、主人公の日常から物語が動き出すきっかけとなる出来事を描写してください。',
                    'fallback',
                    chapterNumber,
                    Date.now() - startTime
                );
            }

            // 統合記憶システムからの前章情報取得
            const previousChapterData = await this.safeMemoryOperation(
                () => this.searchPreviousChapterData(chapterNumber - 1),
                null,
                'searchPreviousChapter'
            );

            if (previousChapterData) {
                const ending = this.extractChapterEnding(previousChapterData, chapterNumber - 1);
                this.performanceMetrics.memorySystemHits++;
                this.performanceMetrics.successfulOperations++;

                return this.createSuccessResult(
                    ending,
                    'unified-memory',
                    chapterNumber,
                    Date.now() - startTime,
                    {
                        qualityScore: this.calculateContentQuality(ending),
                        dataFreshness: this.calculateDataFreshness(previousChapterData)
                    }
                );
            }

            // フォールバック処理
            const fallbackResult = this.generateFallbackEnding(chapterNumber);
            this.performanceMetrics.fallbackUsed++;

            return this.createSuccessResult(
                fallbackResult,
                'fallback',
                chapterNumber,
                Date.now() - startTime
            );

        } catch (error) {
            this.performanceMetrics.failedOperations++;
            logger.error(`Failed to get previous chapter ending for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                processingTime: Date.now() - startTime
            });

            return {
                success: false,
                content: 'エラーが発生しました。新しい章を自由に展開してください。',
                source: 'fallback'
            };
        }
    }

    /**
     * シーン連続性情報を統合分析で取得
     * @param chapterNumber 現在の章番号
     * @returns 詳細なシーン連続性情報
     */
    async getSceneContinuityInfo(chapterNumber: number): Promise<SceneContinuityInfo> {
        const startTime = Date.now();
        this.performanceMetrics.totalOperations++;

        try {
            await this.ensureInitialized();

            const defaultInfo: SceneContinuityInfo = {
                previousScene: '特になし',
                characterPositions: '特になし',
                timeElapsed: '前章からの自然な時間経過',
                location: '前章と同じ場所、または自然な移動先',
                endingGuidance: '次章への興味を引く展開で終わらせる'
            };

            if (chapterNumber <= 1) {
                return {
                    ...defaultInfo,
                    previousScene: '物語の始まりです',
                    endingGuidance: '主人公が最初の課題に直面するところで終わらせる'
                };
            }

            // 統合検索による前章データの取得
            const previousChapterAnalysis = await this.safeMemoryOperation(
                () => this.analyzeChapterContinuity(chapterNumber - 1),
                null,
                'analyzeChapterContinuity'
            );

            if (previousChapterAnalysis) {
                this.performanceMetrics.memorySystemHits++;
                this.performanceMetrics.successfulOperations++;

                return this.buildSceneContinuityInfo(previousChapterAnalysis, chapterNumber);
            }

            // フォールバックの詳細分析
            this.performanceMetrics.fallbackUsed++;
            return this.generateIntelligentFallback(chapterNumber, defaultInfo);

        } catch (error) {
            this.performanceMetrics.failedOperations++;
            logger.error('Failed to get scene continuity info', {
                chapterNumber,
                error: error instanceof Error ? error.message : String(error),
                processingTime: Date.now() - startTime
            });

            return {
                previousScene: '前章の情報を取得できませんでした',
                characterPositions: '主要キャラクターが前章の状況を継続している状態から始める',
                timeElapsed: '前章から短時間経過',
                location: '前章と同じ場所、または自然な移動',
                endingGuidance: '物語の自然な流れで次章への期待感を持たせる'
            };
        }
    }

    /**
     * システム診断を実行
     * @returns 診断結果
     */
    async performDiagnostics(): Promise<MemoryServiceDiagnostics> {
        try {
            const systemStatus = await this.memoryManager.getSystemStatus();
            
            // 統合検索の動作確認
            const searchTest = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch('test', [MemoryLevel.SHORT_TERM]),
                null,
                'diagnosticSearch'
            );

            const errorRate = this.performanceMetrics.totalOperations > 0 
                ? this.performanceMetrics.failedOperations / this.performanceMetrics.totalOperations 
                : 0;

            const cacheHitRate = this.performanceMetrics.totalOperations > 0 
                ? this.performanceMetrics.cacheHits / this.performanceMetrics.totalOperations 
                : 0;

            const recommendations: string[] = [];

            if (errorRate > 0.1) {
                recommendations.push('High error rate detected, check memory system integration');
            }

            if (cacheHitRate < 0.3) {
                recommendations.push('Low cache hit rate, consider cache optimization');
            }

            if (!systemStatus.initialized) {
                recommendations.push('Memory system not fully initialized');
            }

            return {
                operational: this.initialized,
                memoryManagerStatus: systemStatus.initialized,
                unifiedSearchOperational: searchTest !== null,
                cacheHitRate,
                averageResponseTime: this.performanceMetrics.averageProcessingTime,
                errorRate,
                lastSuccessfulOperation: new Date().toISOString(),
                recommendations
            };

        } catch (error) {
            logger.error('Failed to perform diagnostics', { error });
            return {
                operational: false,
                memoryManagerStatus: false,
                unifiedSearchOperational: false,
                cacheHitRate: 0,
                averageResponseTime: 0,
                errorRate: 1,
                lastSuccessfulOperation: '',
                recommendations: ['System diagnostics failed - check memory manager integration']
            };
        }
    }

    /**
     * 設定を更新
     * @param newConfig 新しい設定
     */
    updateConfiguration(newConfig: Partial<MemoryServiceConfig>): void {
        const oldConfig = { ...this.config };
        this.config = { ...this.config, ...newConfig };

        logger.info('MemoryService configuration updated', {
            oldConfig,
            newConfig: this.config
        });
    }

    /**
     * パフォーマンス統計を取得
     * @returns パフォーマンス統計情報
     */
    getPerformanceMetrics(): typeof this.performanceMetrics {
        return { ...this.performanceMetrics };
    }

    // ============================================================================
    // Private Methods
    // ============================================================================

    /**
     * 設定の妥当性を検証
     * @private
     */
    private validateConfiguration(): void {
        if (!this.memoryManager) {
            throw new Error('MemoryManager is required for MemoryService initialization');
        }

        if (this.config.maxRetries < 1) {
            throw new Error('maxRetries must be at least 1');
        }

        if (this.config.timeoutMs < 1000) {
            throw new Error('timeoutMs must be at least 1000ms');
        }
    }

    /**
     * 初期化状態を確認
     * @private
     */
    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }
    }

    /**
     * 記憶システム操作を安全に実行
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

    /**
     * 前章データを検索
     * @private
     */
    private async searchPreviousChapterData(chapterNumber: number): Promise<any> {
        const searchQuery = `chapter ${chapterNumber} content ending`;
        const targetLayers = [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM];

        const searchResult = await this.memoryManager.unifiedSearch(searchQuery, targetLayers);

        if (searchResult.success && searchResult.totalResults > 0) {
            // 最も関連性の高い結果を返す
            const bestResult = searchResult.results
                .filter(result => result.relevance > 0.5)
                .sort((a, b) => b.relevance - a.relevance)[0];

            return bestResult ? bestResult.data : null;
        }

        return null;
    }

    /**
     * 章の終了部分を抽出
     * @private
     */
    private extractChapterEnding(chapterData: any, chapterNumber: number): string {
        try {
            let content = '';

            // データ構造に応じた抽出処理
            if (chapterData && typeof chapterData === 'object') {
                if (chapterData.content) {
                    content = chapterData.content;
                } else if (chapterData.chapter && chapterData.chapter.content) {
                    content = chapterData.chapter.content;
                } else if (typeof chapterData === 'string') {
                    content = chapterData;
                }
            }

            if (!content) {
                return this.generateFallbackEnding(chapterNumber + 1);
            }

            // 段落単位で区切り、最後の2-3段落を抽出
            const paragraphs = content.split(/\n+/).filter(p => p.trim().length > 0);
            
            if (paragraphs.length === 0) {
                return this.generateFallbackEnding(chapterNumber + 1);
            }

            const lastParagraphs = paragraphs.slice(-3);
            const ending = lastParagraphs.join('\n\n');

            return `以下は前章（第${chapterNumber}章）の最後の部分です。この続きから自然に展開してください：\n\n${ending}`;

        } catch (error) {
            logger.warn('Failed to extract chapter ending', { error, chapterNumber });
            return this.generateFallbackEnding(chapterNumber + 1);
        }
    }

    /**
     * 章の連続性を分析
     * @private
     */
    private async analyzeChapterContinuity(chapterNumber: number): Promise<any> {
        const analysisQuery = `chapter ${chapterNumber} scenes characters locations ending`;
        const targetLayers = [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM];

        const searchResult = await this.memoryManager.unifiedSearch(analysisQuery, targetLayers);

        if (searchResult.success && searchResult.totalResults > 0) {
            // 連続性分析に適した結果を抽出
            const relevantResults = searchResult.results
                .filter(result => result.relevance > 0.4)
                .sort((a, b) => b.relevance - a.relevance);

            return {
                chapterData: relevantResults[0]?.data,
                sceneData: relevantResults.filter(r => r.type === 'scene'),
                characterData: relevantResults.filter(r => r.type === 'character'),
                locationData: relevantResults.filter(r => r.type === 'location')
            };
        }

        return null;
    }

    /**
     * シーン連続性情報を構築
     * @private
     */
    private buildSceneContinuityInfo(
        analysisData: any, 
        chapterNumber: number
    ): SceneContinuityInfo {
        try {
            const chapterData = analysisData.chapterData;
            let previousScene = '前章の最後のシーン情報が利用できません';
            let characterPositions = '';
            let location = '';

            // 章データからシーン情報を抽出
            if (chapterData) {
                if (chapterData.scenes && Array.isArray(chapterData.scenes) && chapterData.scenes.length > 0) {
                    const lastScene = chapterData.scenes[chapterData.scenes.length - 1];
                    previousScene = `『${lastScene.title || 'シーン'}』: ${lastScene.summary || lastScene.description || '詳細情報なし'}`;
                    
                    if (lastScene.characters) {
                        characterPositions = Array.isArray(lastScene.characters)
                            ? lastScene.characters.join('、')
                            : String(lastScene.characters);
                    }
                    
                    location = lastScene.location || '';
                } else if (chapterData.content) {
                    // コンテンツから簡易抽出
                    const content = String(chapterData.content);
                    const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 0);
                    if (sentences.length > 0) {
                        previousScene = `前章の終了部分: ${sentences.slice(-2).join('。')}。`;
                    }
                }
            }

            // 物語状態に基づく終わり方ガイダンス
            const endingGuidance = this.generateStateBasedEndingGuidance(analysisData, chapterNumber);

            return {
                previousScene,
                characterPositions: characterPositions 
                    ? `${characterPositions}が${location || '前章の場所'}にいる状態から始める`
                    : '主要キャラクターが前章の状況を継続している状態から始める',
                timeElapsed: '前章から直後、または短時間経過',
                location: location || '前章と同じ場所、または自然な移動先',
                endingGuidance
            };

        } catch (error) {
            logger.error('Failed to build scene continuity info', { error });
            return this.generateIntelligentFallback(chapterNumber, {
                previousScene: '分析エラーのため前章情報を取得できませんでした',
                characterPositions: '主要キャラクターが前章の状況を継続',
                timeElapsed: '前章から短時間経過',
                location: '前章と同じ場所',
                endingGuidance: '物語の自然な流れで展開する'
            });
        }
    }

    /**
     * 状態に基づく終わり方ガイダンスを生成
     * @private
     */
    private generateStateBasedEndingGuidance(analysisData: any, chapterNumber: number): string {
        try {
            // 分析データから物語状態を推定
            const chapterData = analysisData.chapterData;
            
            if (chapterData && chapterData.metadata) {
                const metadata = chapterData.metadata;
                
                // 感情的トーンに基づく判定
                if (metadata.emotionalTone) {
                    switch (metadata.emotionalTone.toLowerCase()) {
                        case 'tense':
                        case 'dramatic':
                            return 'テンションの高い場面で章を終え、読者の期待感を高める';
                        case 'peaceful':
                        case 'calm':
                            return '穏やかな雰囲気を保ちつつ、次への布石を置いて終わらせる';
                        case 'mysterious':
                            return '謎めいた要素を残し、読者の興味を次章に向ける';
                        case 'romantic':
                            return 'ロマンチックな雰囲気を維持しつつ、関係性の進展を示唆して終わる';
                    }
                }

                // イベントタイプに基づく判定
                if (metadata.events && Array.isArray(metadata.events)) {
                    const eventTypes = metadata.events.map((e: any) => e.type || e.eventType).filter(Boolean);
                    
                    if (eventTypes.includes('battle') || eventTypes.includes('conflict')) {
                        return '戦いや対立の決定的瞬間、または意外な展開で緊張感を持続させる';
                    }
                    
                    if (eventTypes.includes('discovery') || eventTypes.includes('revelation')) {
                        return '重要な発見や真実の露呈に対するキャラクターの反応で章を締める';
                    }
                    
                    if (eventTypes.includes('romance') || eventTypes.includes('relationship')) {
                        return '人間関係の微妙な変化や感情の動きを感じさせて終わる';
                    }
                }
            }

            // 章番号に基づく基本的なガイダンス
            if (chapterNumber <= 3) {
                return '物語世界への導入を完了し、次の展開への期待感を醸成する';
            } else if (chapterNumber <= 10) {
                return '物語の中盤に向けて複雑さを増し、読者の関心を次章に引き継ぐ';
            } else {
                return 'クライマックスに向けた緊張感を高め、重要な転機を示唆して終わる';
            }

        } catch (error) {
            logger.warn('Failed to generate state-based ending guidance', { error });
            return '物語の自然な流れに従い、次章への興味を引く要素を含めて終わらせる';
        }
    }

    /**
     * フォールバック終了部分を生成
     * @private
     */
    private generateFallbackEnding(chapterNumber: number): string {
        const templates = [
            '前章の詳細な情報は取得できませんでしたが、物語の流れを自然に継続してください。',
            '前章からの展開を意識し、キャラクターの状況や感情の変化を反映させて始めてください。',
            '前章で起きた出来事の余韻を感じさせながら、新たな展開を始めてください。',
            '物語の一貫性を保ちながら、前章の雰囲気を継承して次の場面を展開してください。'
        ];

        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
        
        return `第${chapterNumber}章の開始にあたり：\n\n${randomTemplate}\n\n前章の具体的な内容は参照できませんが、物語全体の流れと一貫性を保った自然な展開を心がけてください。`;
    }

    /**
     * インテリジェントなフォールバックを生成
     * @private
     */
    private generateIntelligentFallback(
        chapterNumber: number, 
        defaultInfo: SceneContinuityInfo
    ): SceneContinuityInfo {
        // 章番号に基づく動的調整
        let enhancedGuidance = defaultInfo.endingGuidance;

        if (chapterNumber <= 5) {
            enhancedGuidance = '登場人物の魅力を引き出し、世界観への理解を深める展開で終わらせる';
        } else if (chapterNumber <= 15) {
            enhancedGuidance = '物語の中核となる謎や課題を提示し、緊張感を高めて終わらせる';
        } else {
            enhancedGuidance = 'クライマックスに向けた重要な決断や転機を示唆して終わらせる';
        }

        return {
            ...defaultInfo,
            previousScene: `第${chapterNumber - 1}章の詳細は取得できませんが、前章の流れを意識した展開を想定`,
            characterPositions: `主要キャラクターが第${chapterNumber - 1}章の状況を継続している前提で開始`,
            endingGuidance: enhancedGuidance
        };
    }

    /**
     * 成功結果を作成
     * @private
     */
    private createSuccessResult(
        content: string,
        source: 'unified-memory' | 'cache' | 'fallback',
        chapterNumber: number,
        processingTime: number,
        additionalMetadata?: Partial<PreviousChapterEndingResult['metadata']>
    ): PreviousChapterEndingResult {
        return {
            success: true,
            content,
            source,
            metadata: {
                chapterNumber,
                processingTime,
                qualityScore: this.calculateContentQuality(content),
                dataFreshness: 1.0, // デフォルト値
                ...additionalMetadata
            }
        };
    }

    /**
     * コンテンツ品質を計算
     * @private
     */
    private calculateContentQuality(content: string): number {
        if (!content || content.length < 10) return 0.1;
        
        let score = 0.5; // ベーススコア
        
        // 長さによる評価
        if (content.length > 100) score += 0.2;
        if (content.length > 300) score += 0.1;
        
        // 構造による評価
        if (content.includes('\n')) score += 0.1; // 段落構造
        if (content.includes('。')) score += 0.1; // 文の完結性
        
        return Math.min(1.0, score);
    }

    /**
     * データの新鮮度を計算
     * @private
     */
    private calculateDataFreshness(data: any): number {
        try {
            if (data && data.timestamp) {
                const dataTime = new Date(data.timestamp).getTime();
                const now = Date.now();
                const ageMs = now - dataTime;
                const ageHours = ageMs / (1000 * 60 * 60);
                
                // 1時間以内: 1.0, 24時間以内: 0.8, それ以降: 0.5
                if (ageHours <= 1) return 1.0;
                if (ageHours <= 24) return 0.8;
                return 0.5;
            }
            return 0.7; // デフォルト値
        } catch (error) {
            return 0.5;
        }
    }
}