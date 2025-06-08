// src/lib/learning-journey/emotional-learning-integrator.ts

/**
 * @fileoverview 感情学習統合器 - 新記憶階層システム完全対応版
 * @description
 * 概念学習と感情体験を統合するコンポーネント。
 * 新しい統合記憶階層システムのパブリックAPIのみを使用し、
 * 型安全性とエラーハンドリングを完全実装。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { EventBus } from './event-bus';
import { LearningStage } from './concept-learning-manager';
import { JsonParser } from '@/lib/utils/json-parser';

// 新記憶階層システムの型とインターフェース
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import {
    MemoryLevel,
    MemoryAccessRequest,
    MemoryRequestType,
    UnifiedMemoryContext,
    SystemOperationResult
} from '@/lib/memory/core/types';
import { Chapter } from '@/types/chapters';

/**
 * 感情次元を表す型
 */
export interface EmotionalDimension {
    dimension: string;  // 感情次元名
    level: number;      // 強度 (0-10)
}

/**
 * 感情アーク設計を表す型
 */
export interface EmotionalArcDesign {
    recommendedTone: string;  // 推奨トーン
    emotionalJourney: {       // 感情の旅
        opening: EmotionalDimension[];      // 始まり
        development: EmotionalDimension[];  // 展開
        conclusion: EmotionalDimension[];   // 結末
    };
    reason: string;           // 設計理由
}

/**
 * 共感ポイントを表す型
 */
export interface EmpatheticPoint {
    type: 'character' | 'situation' | 'decision' | 'realization' | 'transformation';
    position: number;   // 章内での相対位置 (0-1)
    intensity: number;  // 強度 (0-1)
    description: string; // 説明
}

/**
 * カタルシス体験を表す型
 */
export interface CatharticExperience {
    type: 'emotional' | 'intellectual' | 'moral' | 'transformative';
    intensity: number;        // 強度 (0-1)
    trigger: string;          // トリガー
    buildup: string[];        // 準備段階
    peakMoment: string;       // ピーク瞬間
    aftermath: string;        // 余韻
    relatedLearningStage: LearningStage;
    relatedConcept: string;
}

/**
 * 感情学習同期指標を表す型
 */
export interface EmotionLearningSyncMetrics {
    peakSynchronization: number;     // 感情ピークと学習ポイントの同期度 (0-1)
    progressionAlignment: number;    // 感情変化と理解進展の一致度 (0-1)
    emotionalResonance: number;      // 感情的共鳴強度 (0-1)
    themeEmotionIntegration: number; // テーマと感情の統合度 (0-1)
    catharticMomentEffect: number;   // カタルシス瞬間の効果 (0-1)
    measurementConfidence: number;   // 測定の信頼性 (0-1)
}

/**
 * EmotionalLearningIntegrator設定インターフェース
 */
export interface EmotionalLearningIntegratorConfig {
    useMemorySystemIntegration?: boolean;
    enableAdvancedAnalysis?: boolean;
    cacheEmotionalDesigns?: boolean;
    maxRetries?: number;
    timeoutMs?: number;
}

/**
 * 内部パフォーマンス統計
 */
interface PerformanceMetrics {
    totalAnalyses: number;
    successfulAnalyses: number;
    failedAnalyses: number;
    averageProcessingTime: number;
    memorySystemHits: number;
    cacheEfficiencyRate: number;
    lastOptimization: string;
}

/**
 * @class EmotionalLearningIntegrator
 * @description
 * 概念学習と感情体験を統合するクラス。
 * 新しい統合記憶階層システムと完全統合し、型安全性を確保。
 */
export class EmotionalLearningIntegrator {
    private config: Required<EmotionalLearningIntegratorConfig>;
    private initialized: boolean = false;

    // 内部統計（typeof this問題を回避するため明示的型定義）
    private performanceStats: PerformanceMetrics = {
        totalAnalyses: 0,
        successfulAnalyses: 0,
        failedAnalyses: 0,
        averageProcessingTime: 0,
        memorySystemHits: 0,
        cacheEfficiencyRate: 0,
        lastOptimization: new Date().toISOString()
    };

    /**
     * コンストラクタ - 依存注入パターンで完全実装
     * @param memoryManager 統合記憶管理システム
     * @param geminiClient AIモデルとの通信を行うクライアント
     * @param eventBus イベントバス
     * @param config 設定オプション
     */
    constructor(
        private memoryManager: MemoryManager,
        private geminiClient: GeminiClient,
        private eventBus: EventBus,
        config?: Partial<EmotionalLearningIntegratorConfig>
    ) {
        // 設定の完全検証と初期化
        this.validateConfiguration(config);
        this.config = this.mergeWithDefaults(config);
        this.initializeInternalState();

        logger.info('EmotionalLearningIntegrator initialized with unified memory integration');
    }

    /**
     * 設定の完全検証
     * @private
     */
    private validateConfiguration(config?: Partial<EmotionalLearningIntegratorConfig>): void {
        if (!this.memoryManager) {
            throw new Error('MemoryManager is required for EmotionalLearningIntegrator initialization');
        }

        if (!this.geminiClient) {
            throw new Error('GeminiClient is required for EmotionalLearningIntegrator initialization');
        }

        if (!this.eventBus) {
            throw new Error('EventBus is required for EmotionalLearningIntegrator initialization');
        }
    }

    /**
     * デフォルト設定とのマージ
     * @private
     */
    private mergeWithDefaults(config?: Partial<EmotionalLearningIntegratorConfig>): Required<EmotionalLearningIntegratorConfig> {
        return {
            useMemorySystemIntegration: true,
            enableAdvancedAnalysis: true,
            cacheEmotionalDesigns: true,
            maxRetries: 3,
            timeoutMs: 30000,
            ...config
        };
    }

    /**
     * 内部状態の初期化
     * @private
     */
    private initializeInternalState(): void {
        this.performanceStats = {
            totalAnalyses: 0,
            successfulAnalyses: 0,
            failedAnalyses: 0,
            averageProcessingTime: 0,
            memorySystemHits: 0,
            cacheEfficiencyRate: 0,
            lastOptimization: new Date().toISOString()
        };
    }

    /**
     * システム初期化
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('EmotionalLearningIntegrator already initialized');
            return;
        }

        try {
            // 記憶システムの状態確認
            if (this.config.useMemorySystemIntegration) {
                await this.verifyMemorySystemIntegration();
            }

            this.initialized = true;
            logger.info('EmotionalLearningIntegrator initialization completed successfully');

        } catch (error) {
            logger.error('Failed to initialize EmotionalLearningIntegrator', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 記憶システム統合の検証
     * @private
     */
    private async verifyMemorySystemIntegration(): Promise<void> {
        try {
            const systemStatus = await this.memoryManager.getSystemStatus();
            if (!systemStatus.initialized) {
                throw new Error('MemoryManager is not properly initialized');
            }

            logger.debug('Memory system integration verified successfully');
        } catch (error) {
            logger.error('Memory system integration verification failed', { error });
            throw error;
        }
    }

    /**
     * 学習段階に適した感情アークを設計する（プロット・キャラクター統合強化版）
     * 
     * @param conceptName 概念名
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @returns 感情アーク設計
     */
    async designEmotionalArc(
        conceptName: string,
        stage: LearningStage,
        chapterNumber: number
    ): Promise<EmotionalArcDesign> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();

            logger.info(`Designing emotional arc for concept ${conceptName} at stage ${stage} with plot and character integration`);
            this.performanceStats.totalAnalyses++;

            // プロット統合情報を取得
            const plotIntegrationResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    `plot context chapter ${chapterNumber} tension emotion`,
                    [MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
                ),
                { success: false, totalResults: 0, processingTime: 0, results: [], suggestions: [] },
                'getPlotIntegrationForEmotionalArc'
            );

            // キャラクター発達情報を取得
            const characterDevelopmentResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    `character development psychology emotion chapter ${chapterNumber}`,
                    [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
                ),
                { success: false, totalResults: 0, processingTime: 0, results: [], suggestions: [] },
                'getCharacterDevelopmentForEmotionalArc'
            );

            // 学習段階に適した基本感情アーク設計を生成
            let emotionalArc = this.createStageBasedEmotionalArc(stage);

            // プロット統合による感情アークの強化
            if (plotIntegrationResult.success && plotIntegrationResult.totalResults > 0) {
                emotionalArc = this.enhanceEmotionalArcWithPlotIntegration(
                    emotionalArc, plotIntegrationResult, stage
                );
            }

            // キャラクター発達による感情アークの調整
            if (characterDevelopmentResult.success && characterDevelopmentResult.totalResults > 0) {
                emotionalArc = this.adjustEmotionalArcForCharacterDevelopment(
                    emotionalArc, characterDevelopmentResult, stage
                );
            }

            // 感情×プロット×キャラクターの三者同期
            const tripleIntegrationResult = await this.performTripleIntegrationSync(
                emotionalArc, plotIntegrationResult, characterDevelopmentResult, conceptName, stage
            );

            // 統合記憶システムを使用した情報保存
            await this.safeMemoryOperation(
                async () => {
                    // Chapter型に完全準拠した構築
                    const chapter: Chapter = {
                        id: `arc-design-${chapterNumber}`,
                        chapterNumber,
                        title: `統合感情アーク設計 - 第${chapterNumber}章`,
                        content: `概念: ${conceptName}, 段階: ${stage}, 設計理由: ${emotionalArc.reason}`,
                        previousChapterSummary: '',
                        scenes: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        metadata: {
                            createdAt: new Date().toISOString(),
                            lastModified: new Date().toISOString(),
                            status: 'integrated_emotional_arc_designed',
                            emotionalArc,
                            conceptName,
                            learningStage: stage,
                            plotIntegration: plotIntegrationResult.success,
                            characterIntegration: characterDevelopmentResult.success,
                            tripleIntegrationScore: tripleIntegrationResult.integrationScore,
                            wordCount: emotionalArc.reason.length,
                            estimatedReadingTime: Math.ceil(emotionalArc.reason.length / 1000)
                        }
                    };

                    const result = await this.memoryManager.processChapter(chapter);
                    if (result.success) {
                        this.performanceStats.memorySystemHits++;
                    }
                    return result;
                },
                null,
                'storeIntegratedEmotionalArcDesign'
            );

            // イベント発行（統合情報付き）
            this.eventBus.publish('emotional.arc.designed', {
                conceptName,
                stage,
                chapterNumber,
                arc: emotionalArc,
                plotIntegrated: plotIntegrationResult.success,
                characterIntegrated: characterDevelopmentResult.success,
                tripleIntegrationScore: tripleIntegrationResult.integrationScore
            });

            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, true);

            return emotionalArc;

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, false);

            logger.error(`Failed to design emotional arc for ${conceptName}`, {
                error: error instanceof Error ? error.message : String(error),
                stage,
                chapterNumber
            });

            // エラー時はデフォルト設計を返す
            return this.createDefaultEmotionalArc();
        }
    }

    /**
     * プロット統合による感情アークの強化
     * @private
     */
    private enhanceEmotionalArcWithPlotIntegration(
        emotionalArc: EmotionalArcDesign,
        plotIntegrationResult: any,
        stage: LearningStage
    ): EmotionalArcDesign {
        try {
            const enhancedArc = { ...emotionalArc };
            const plotData = this.extractPlotContextFromResults(plotIntegrationResult);

            // プロット緊張度による感情レベルの調整
            if (plotData.tensionLevel !== undefined) {
                const tensionMultiplier = 1 + (plotData.tensionLevel - 0.5) * 0.4;

                enhancedArc.emotionalJourney.development = enhancedArc.emotionalJourney.development.map(dim => ({
                    ...dim,
                    level: Math.min(10, Math.max(1, Math.round(dim.level * tensionMultiplier)))
                }));
            }

            // プロットフェーズによる感情アークの調整
            if (plotData.currentPhase) {
                switch (plotData.currentPhase) {
                    case 'introduction':
                        enhancedArc.emotionalJourney.opening = enhancedArc.emotionalJourney.opening.map(dim => ({
                            ...dim,
                            level: Math.min(8, dim.level + 1) // 導入部では感情を適度に抑制
                        }));
                        break;
                    case 'rising_action':
                        enhancedArc.emotionalJourney.development = enhancedArc.emotionalJourney.development.map(dim => ({
                            ...dim,
                            level: Math.min(10, dim.level + 2) // 上昇アクションでは感情を強化
                        }));
                        break;
                    case 'climax':
                        enhancedArc.emotionalJourney.conclusion = enhancedArc.emotionalJourney.conclusion.map(dim => ({
                            ...dim,
                            level: Math.min(10, dim.level + 3) // クライマックスでは感情を最大化
                        }));
                        break;
                }
            }

            // プロットテーマによる感情トーンの調整
            if (plotData.theme && plotData.theme.includes('conflict')) {
                enhancedArc.recommendedTone += ' - プロット対立を反映した緊張感を追加';
            }

            enhancedArc.reason += ` プロット統合により${plotData.currentPhase || 'unknown'}フェーズの特性を反映。`;

            return enhancedArc;
        } catch (error) {
            logger.warn('Failed to enhance emotional arc with plot integration', { error });
            return emotionalArc;
        }
    }

    /**
     * キャラクター発達による感情アークの調整
     * @private
     */
    private adjustEmotionalArcForCharacterDevelopment(
        emotionalArc: EmotionalArcDesign,
        characterDevelopmentResult: any,
        stage: LearningStage
    ): EmotionalArcDesign {
        try {
            const adjustedArc = { ...emotionalArc };
            const characterData = this.extractCharacterDataFromResults(characterDevelopmentResult);

            // キャラクター発達段階による感情レベルの調整
            if (characterData.developmentStage !== undefined) {
                const developmentModifier = this.calculateDevelopmentModifier(characterData.developmentStage, stage);

                // 発達段階に応じて感情の複雑さを調整
                if (characterData.developmentStage >= 5) {
                    // 高発達段階では感情の複雑さを増加
                    adjustedArc.emotionalJourney.opening.push({
                        dimension: "内省",
                        level: 6 + developmentModifier
                    });
                }
            }

            // キャラクター心理による感情次元の追加
            if (characterData.psychology) {
                if (characterData.psychology.currentFears && characterData.psychology.currentFears.length > 0) {
                    adjustedArc.emotionalJourney.opening.push({
                        dimension: "不安",
                        level: Math.min(8, 4 + characterData.psychology.currentFears.length)
                    });
                }

                if (characterData.psychology.currentDesires && characterData.psychology.currentDesires.length > 0) {
                    adjustedArc.emotionalJourney.conclusion.push({
                        dimension: "希望",
                        level: Math.min(9, 5 + characterData.psychology.currentDesires.length)
                    });
                }
            }

            // キャラクター関係性による感情の調整
            if (characterData.relationships && Array.isArray(characterData.relationships)) {
                const relationshipTension = this.calculateRelationshipEmotionalTension(characterData.relationships);
                if (relationshipTension > 0.6) {
                    adjustedArc.emotionalJourney.development.push({
                        dimension: "関係性緊張",
                        level: Math.round(relationshipTension * 10)
                    });
                }
            }

            adjustedArc.reason += ` キャラクター発達段階${characterData.developmentStage || 'unknown'}の特性を反映。`;

            return adjustedArc;
        } catch (error) {
            logger.warn('Failed to adjust emotional arc for character development', { error });
            return emotionalArc;
        }
    }

    /**
     * 感情×プロット×キャラクターの三者同期
     * @private
     */
    private async performTripleIntegrationSync(
        emotionalArc: EmotionalArcDesign,
        plotResult: any,
        characterResult: any,
        conceptName: string,
        stage: LearningStage
    ): Promise<{
        integrationScore: number;
        recommendations: string[];
        enhancements: string[];
    }> {
        try {
            let integrationScore = 0.5; // ベースライン
            const recommendations: string[] = [];
            const enhancements: string[] = [];

            // プロット統合スコアの計算
            const plotScore = plotResult.success ? 0.3 : 0;
            integrationScore += plotScore;

            // キャラクター統合スコアの計算
            const characterScore = characterResult.success ? 0.3 : 0;
            integrationScore += characterScore;

            // 感情×学習段階の適合度
            const stageEmotionAlignment = this.calculateStageEmotionAlignment(emotionalArc, stage);
            integrationScore += stageEmotionAlignment * 0.4;

            // 統合品質による推奨事項の生成
            if (integrationScore > 0.8) {
                recommendations.push('高い統合度を活かした感情×学習×ストーリーの相乗効果を最大化');
                enhancements.push('三者統合の優位性を活用した深い読者体験の創出');
            } else if (integrationScore > 0.6) {
                recommendations.push('統合要素を強化して相乗効果を向上させる');
                enhancements.push('プロットまたはキャラクター要素との連携を深化');
            } else {
                recommendations.push('基本的な感情学習統合の安定化を優先');
                enhancements.push('段階的な統合要素の追加検討');
            }

            // 概念特化の推奨事項
            if (conceptName === 'ISSUE DRIVEN') {
                recommendations.push('課題解決過程における感情変化とプロット進行の同期強化');
                enhancements.push('顧客視点変化とキャラクター感情発達の統合表現');
            }

            return {
                integrationScore: Math.min(1.0, integrationScore),
                recommendations,
                enhancements
            };
        } catch (error) {
            logger.warn('Failed to perform triple integration sync', { error });
            return {
                integrationScore: 0.3,
                recommendations: ['基本的な感情統合の実施'],
                enhancements: ['段階的な統合改善']
            };
        }
    }

    private formatLearningStage(stage: LearningStage): string {
        const japaneseStages: { [key in LearningStage]?: string } = {
            [LearningStage.MISCONCEPTION]: '誤解段階',
            [LearningStage.EXPLORATION]: '探索段階',
            [LearningStage.CONFLICT]: '葛藤段階',
            [LearningStage.INSIGHT]: '気づき段階',
            [LearningStage.APPLICATION]: '応用段階',
            [LearningStage.INTEGRATION]: '統合段階',
            // 新しいビジネス学習段階
            [LearningStage.INTRODUCTION]: '導入段階',
            [LearningStage.THEORY_APPLICATION]: '理論適用段階',
            [LearningStage.FAILURE_EXPERIENCE]: '失敗体験段階',
            [LearningStage.PRACTICAL_MASTERY]: '実践習熟段階'
        };

        return japaneseStages[stage] || stage;
    }


    // ============================================================================
    // Business Framework Specific Methods - ビジネスフレームワーク特化メソッド
    // ============================================================================

    /**
     * ISSUE DRIVEN特化感情アークを作成
     * @private
     */
    private createIssueDriverEmotionalArc(stage: LearningStage, chapterNumber: number): EmotionalArcDesign {
        switch (stage) {
            case LearningStage.MISCONCEPTION:
                return {
                    recommendedTone: "課題認識の甘さと問題発見時の衝撃",
                    emotionalJourney: {
                        opening: [
                            { dimension: "安心感", level: 7 },
                            { dimension: "楽観", level: 6 }
                        ],
                        development: [
                            { dimension: "困惑", level: 8 },
                            { dimension: "危機感", level: 7 }
                        ],
                        conclusion: [
                            { dimension: "問題意識", level: 8 },
                            { dimension: "緊急性", level: 7 }
                        ]
                    },
                    reason: "ISSUE DRIVEN思考では、表面的な安心感から真の課題発見による危機感への転換が重要"
                };

            case LearningStage.EXPLORATION:
                return {
                    recommendedTone: "仮説構築と検証への意欲",
                    emotionalJourney: {
                        opening: [
                            { dimension: "探究心", level: 8 },
                            { dimension: "分析意欲", level: 7 }
                        ],
                        development: [
                            { dimension: "仮説形成", level: 8 },
                            { dimension: "検証への期待", level: 9 }
                        ],
                        conclusion: [
                            { dimension: "洞察", level: 7 },
                            { dimension: "方向性", level: 8 }
                        ]
                    },
                    reason: "課題を深く分析し、仮説を立てて検証する過程での知的興奮を表現"
                };

            case LearningStage.CONFLICT:
                return {
                    recommendedTone: "解決策選択時の判断ジレンマ",
                    emotionalJourney: {
                        opening: [
                            { dimension: "選択肢の重み", level: 7 },
                            { dimension: "判断の困難", level: 8 }
                        ],
                        development: [
                            { dimension: "優先順位の葛藤", level: 9 },
                            { dimension: "責任の重圧", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "決断", level: 9 },
                            { dimension: "覚悟", level: 8 }
                        ]
                    },
                    reason: "複数の解決策から最適解を選ぶ際の責任感と判断の重みを表現"
                };

            case LearningStage.INSIGHT:
                return {
                    recommendedTone: "根本原因発見時の突破感",
                    emotionalJourney: {
                        opening: [
                            { dimension: "集中", level: 8 },
                            { dimension: "探求", level: 7 }
                        ],
                        development: [
                            { dimension: "発見", level: 9 },
                            { dimension: "驚き", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "確信", level: 9 },
                            { dimension: "解決への道筋", level: 8 }
                        ]
                    },
                    reason: "真の課題とその解決策が見えた瞬間の突破感と確信を表現"
                };

            case LearningStage.APPLICATION:
            case LearningStage.THEORY_APPLICATION:
                return {
                    recommendedTone: "解決策実行時の実践的緊張感",
                    emotionalJourney: {
                        opening: [
                            { dimension: "実行意欲", level: 8 },
                            { dimension: "慎重さ", level: 7 }
                        ],
                        development: [
                            { dimension: "効果の実感", level: 8 },
                            { dimension: "調整の必要性", level: 6 }
                        ],
                        conclusion: [
                            { dimension: "成果", level: 8 },
                            { dimension: "改善意識", level: 7 }
                        ]
                    },
                    reason: "ISSUE DRIVEN解決策の実践とその効果測定における実用的な感情変化を表現"
                };

            case LearningStage.INTEGRATION:
            case LearningStage.PRACTICAL_MASTERY:
                return {
                    recommendedTone: "課題解決思考の習慣化",
                    emotionalJourney: {
                        opening: [
                            { dimension: "自然な問題意識", level: 8 },
                            { dimension: "体系的思考", level: 9 }
                        ],
                        development: [
                            { dimension: "予防的発想", level: 8 },
                            { dimension: "継続改善", level: 9 }
                        ],
                        conclusion: [
                            { dimension: "問題解決力の自信", level: 9 },
                            { dimension: "組織への貢献", level: 8 }
                        ]
                    },
                    reason: "ISSUE DRIVEN思考が自然な習慣となり、組織全体の問題解決に貢献する状態を表現"
                };

            default:
                return this.createDefaultEmotionalArc();
        }
    }

    /**
     * ソクラテス式対話特化感情アークを作成
     * @private
     */
    private createSocraticDialogueEmotionalArc(stage: LearningStage, chapterNumber: number): EmotionalArcDesign {
        switch (stage) {
            case LearningStage.MISCONCEPTION:
                return {
                    recommendedTone: "自分の知識への過信と問いかけによる動揺",
                    emotionalJourney: {
                        opening: [
                            { dimension: "知識への自信", level: 8 },
                            { dimension: "確信", level: 7 }
                        ],
                        development: [
                            { dimension: "問いかけへの困惑", level: 8 },
                            { dimension: "答えられない焦り", level: 7 }
                        ],
                        conclusion: [
                            { dimension: "無知の知", level: 6 },
                            { dimension: "謙虚さ", level: 7 }
                        ]
                    },
                    reason: "ソクラテス式対話の核心である「無知の知」への気づきプロセスを感情的に表現"
                };

            case LearningStage.EXPLORATION:
                return {
                    recommendedTone: "問いを通した自発的な探求意欲",
                    emotionalJourney: {
                        opening: [
                            { dimension: "好奇心", level: 8 },
                            { dimension: "問いへの関心", level: 7 }
                        ],
                        development: [
                            { dimension: "自己探求", level: 9 },
                            { dimension: "発見の喜び", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "より深い疑問", level: 7 },
                            { dimension: "探求の継続意欲", level: 8 }
                        ]
                    },
                    reason: "問いかけを通じて自分自身で答えを見つけていく過程の知的興奮を表現"
                };

            case LearningStage.CONFLICT:
                return {
                    recommendedTone: "内省による自己矛盾の発見",
                    emotionalJourney: {
                        opening: [
                            { dimension: "内省", level: 8 },
                            { dimension: "自己審問", level: 7 }
                        ],
                        development: [
                            { dimension: "矛盾の発見", level: 9 },
                            { dimension: "認知的不協和", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "整合性への意志", level: 8 },
                            { dimension: "真理への渇望", level: 9 }
                        ]
                    },
                    reason: "自己の思考の矛盾に気づき、真理を求める強い意志が生まれる過程を表現"
                };

            case LearningStage.INSIGHT:
                return {
                    recommendedTone: "自発的発見による深い理解",
                    emotionalJourney: {
                        opening: [
                            { dimension: "集中的思考", level: 8 },
                            { dimension: "内的対話", level: 9 }
                        ],
                        development: [
                            { dimension: "自己発見", level: 10 },
                            { dimension: "理解の深化", level: 9 }
                        ],
                        conclusion: [
                            { dimension: "知的満足", level: 9 },
                            { dimension: "自律的学習の自信", level: 8 }
                        ]
                    },
                    reason: "他者から教えられるのではなく、自分自身で重要な真理に到達した時の深い満足感を表現"
                };

            case LearningStage.APPLICATION:
            case LearningStage.THEORY_APPLICATION:
                return {
                    recommendedTone: "対話技法の実践による他者との相互学習",
                    emotionalJourney: {
                        opening: [
                            { dimension: "対話への意欲", level: 8 },
                            { dimension: "相互学習の期待", level: 7 }
                        ],
                        development: [
                            { dimension: "質問技術の向上", level: 8 },
                            { dimension: "他者理解の深化", level: 9 }
                        ],
                        conclusion: [
                            { dimension: "対話の満足感", level: 8 },
                            { dimension: "共同探求の価値", level: 9 }
                        ]
                    },
                    reason: "ソクラテス式対話を実践し、他者と共に学び合う価値を実感する過程を表現"
                };

            case LearningStage.INTEGRATION:
            case LearningStage.PRACTICAL_MASTERY:
                return {
                    recommendedTone: "問いかける習慣の定着と知的謙虚さ",
                    emotionalJourney: {
                        opening: [
                            { dimension: "自然な問いかけ", level: 9 },
                            { dimension: "知的謙虚さ", level: 8 }
                        ],
                        development: [
                            { dimension: "継続的学習", level: 9 },
                            { dimension: "他者への問いかけ指導", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "知的成熟", level: 9 },
                            { dimension: "真理探求の生活化", level: 8 }
                        ]
                    },
                    reason: "問いかけることが自然な習慣となり、生涯にわたる学習者としての姿勢が確立された状態を表現"
                };

            default:
                return this.createDefaultEmotionalArc();
        }
    }

    /**
     * アドラー心理学特化感情アークを作成
     * @private
     */
    private createAdlerPsychologyEmotionalArc(stage: LearningStage, chapterNumber: number): EmotionalArcDesign {
        switch (stage) {
            case LearningStage.MISCONCEPTION:
                return {
                    recommendedTone: "他責思考と被害者意識からの脱却への抵抗",
                    emotionalJourney: {
                        opening: [
                            { dimension: "被害者意識", level: 7 },
                            { dimension: "他者への不満", level: 8 }
                        ],
                        development: [
                            { dimension: "責任転嫁の習慣", level: 8 },
                            { dimension: "変化への抵抗", level: 7 }
                        ],
                        conclusion: [
                            { dimension: "自己責任への恐れ", level: 6 },
                            { dimension: "変化の必要性認識", level: 5 }
                        ]
                    },
                    reason: "アドラー心理学の課題の分離概念に触れる前の、他責的思考パターンの根深さを表現"
                };

            case LearningStage.EXPLORATION:
                return {
                    recommendedTone: "課題の分離概念への好奇心と自己責任の可能性",
                    emotionalJourney: {
                        opening: [
                            { dimension: "新しい視点への興味", level: 7 },
                            { dimension: "自己変革の可能性", level: 6 }
                        ],
                        development: [
                            { dimension: "課題分離の理解", level: 8 },
                            { dimension: "自己決定の価値", level: 7 }
                        ],
                        conclusion: [
                            { dimension: "自由への憧れ", level: 8 },
                            { dimension: "勇気の必要性", level: 7 }
                        ]
                    },
                    reason: "課題の分離により得られる自由と、それに必要な勇気への気づきプロセスを表現"
                };

            case LearningStage.CONFLICT:
                return {
                    recommendedTone: "承認欲求と自立への勇気の間の激しい葛藤",
                    emotionalJourney: {
                        opening: [
                            { dimension: "承認への執着", level: 8 },
                            { dimension: "評価への不安", level: 7 }
                        ],
                        development: [
                            { dimension: "自立への憧れ", level: 7 },
                            { dimension: "嫌われる勇気の必要性", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "勇気ある選択", level: 9 },
                            { dimension: "自己受容", level: 7 }
                        ]
                    },
                    reason: "承認欲求からの脱却という最も困難な課題への取り組みにおける激しい内的葛藤を表現"
                };

            case LearningStage.INSIGHT:
                return {
                    recommendedTone: "共同体感覚の発見と目的論的視点の獲得",
                    emotionalJourney: {
                        opening: [
                            { dimension: "孤立からの解放", level: 8 },
                            { dimension: "つながりの実感", level: 9 }
                        ],
                        development: [
                            { dimension: "貢献の喜び", level: 9 },
                            { dimension: "目的の明確化", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "所属感", level: 9 },
                            { dimension: "人生の意味", level: 8 }
                        ]
                    },
                    reason: "アドラー心理学の究極目標である共同体感覚の体験と、目的論的人生観の獲得を表現"
                };

            case LearningStage.APPLICATION:
            case LearningStage.THEORY_APPLICATION:
                return {
                    recommendedTone: "勇気ある行動の実践と他者貢献の体験",
                    emotionalJourney: {
                        opening: [
                            { dimension: "実践への勇気", level: 8 },
                            { dimension: "変化への意志", level: 7 }
                        ],
                        development: [
                            { dimension: "課題分離の実践", level: 8 },
                            { dimension: "他者貢献の手応え", level: 9 }
                        ],
                        conclusion: [
                            { dimension: "自己効力感", level: 8 },
                            { dimension: "人間関係の改善", level: 9 }
                        ]
                    },
                    reason: "アドラー心理学の実践による具体的な変化と、他者貢献を通じた充実感を表現"
                };

            case LearningStage.INTEGRATION:
            case LearningStage.PRACTICAL_MASTERY:
                return {
                    recommendedTone: "勇気と共同体感覚の生活化",
                    emotionalJourney: {
                        opening: [
                            { dimension: "自然な勇気", level: 9 },
                            { dimension: "安定した自己受容", level: 8 }
                        ],
                        development: [
                            { dimension: "継続的な他者貢献", level: 9 },
                            { dimension: "共同体への所属感", level: 9 }
                        ],
                        conclusion: [
                            { dimension: "人生の充実感", level: 9 },
                            { dimension: "幸福感", level: 8 }
                        ]
                    },
                    reason: "アドラー心理学の生き方が自然となり、勇気と共同体感覚に基づく幸福な人生の実現を表現"
                };

            default:
                return this.createDefaultEmotionalArc();
        }
    }

    /**
     * ドラッカーマネジメント特化感情アークを作成
     * @private
     */
    private createDruckerManagementEmotionalArc(stage: LearningStage, chapterNumber: number): EmotionalArcDesign {
        switch (stage) {
            case LearningStage.MISCONCEPTION:
                return {
                    recommendedTone: "効率性重視の限界と真の効果性への目覚め",
                    emotionalJourney: {
                        opening: [
                            { dimension: "効率への自信", level: 7 },
                            { dimension: "作業量への満足", level: 6 }
                        ],
                        development: [
                            { dimension: "成果の疑問", level: 8 },
                            { dimension: "方向性への不安", level: 7 }
                        ],
                        conclusion: [
                            { dimension: "効果性の必要性", level: 8 },
                            { dimension: "戦略的思考の重要性", level: 7 }
                        ]
                    },
                    reason: "「正しくやる」から「正しいことをやる」への転換の必要性に気づく過程を表現"
                };

            case LearningStage.EXPLORATION:
                return {
                    recommendedTone: "強みの発見と活用への期待",
                    emotionalJourney: {
                        opening: [
                            { dimension: "自己分析への関心", level: 7 },
                            { dimension: "可能性の探求", level: 8 }
                        ],
                        development: [
                            { dimension: "強みの発見", level: 9 },
                            { dimension: "活用方法の模索", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "強み活用への確信", level: 8 },
                            { dimension: "成果への期待", level: 9 }
                        ]
                    },
                    reason: "ドラッカーの強みに基づくマネジメント理論の探求と、その可能性への期待を表現"
                };

            case LearningStage.CONFLICT:
                return {
                    recommendedTone: "時間管理と優先順位決定の困難",
                    emotionalJourney: {
                        opening: [
                            { dimension: "時間の制約", level: 8 },
                            { dimension: "選択の困難", level: 7 }
                        ],
                        development: [
                            { dimension: "重要性vs緊急性", level: 9 },
                            { dimension: "決断の重圧", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "優先順位の明確化", level: 8 },
                            { dimension: "集中の決意", level: 9 }
                        ]
                    },
                    reason: "ドラッカーの時間管理理論における重要性と緊急性の判断の困難さと、集中の価値を表現"
                };

            case LearningStage.INSIGHT:
                return {
                    recommendedTone: "イノベーションの本質理解と継続革新の重要性",
                    emotionalJourney: {
                        opening: [
                            { dimension: "現状への疑問", level: 7 },
                            { dimension: "変化の必要性", level: 8 }
                        ],
                        development: [
                            { dimension: "イノベーションの理解", level: 9 },
                            { dimension: "継続革新の発見", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "変革への使命感", level: 9 },
                            { dimension: "未来創造の意欲", level: 8 }
                        ]
                    },
                    reason: "「今日の成功が明日の失敗を招く」というドラッカーの洞察と、継続的革新の重要性の理解を表現"
                };

            case LearningStage.APPLICATION:
            case LearningStage.THEORY_APPLICATION:
                return {
                    recommendedTone: "マネジメント実践による成果創出",
                    emotionalJourney: {
                        opening: [
                            { dimension: "実践への意欲", level: 8 },
                            { dimension: "責任感", level: 9 }
                        ],
                        development: [
                            { dimension: "組織への影響", level: 8 },
                            { dimension: "成果の実感", level: 9 }
                        ],
                        conclusion: [
                            { dimension: "マネジメントの手応え", level: 9 },
                            { dimension: "組織発展への貢献", level: 8 }
                        ]
                    },
                    reason: "ドラッカー理論の実践を通じた組織への貢献と、マネジメントの醍醐味の体験を表現"
                };

            case LearningStage.INTEGRATION:
            case LearningStage.PRACTICAL_MASTERY:
                return {
                    recommendedTone: "マネジメントの習慣化と組織の継続的発展",
                    emotionalJourney: {
                        opening: [
                            { dimension: "自然な効果性思考", level: 9 },
                            { dimension: "戦略的視点", level: 8 }
                        ],
                        development: [
                            { dimension: "組織文化への影響", level: 9 },
                            { dimension: "継続的イノベーション", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "マネジメントの誇り", level: 9 },
                            { dimension: "社会への貢献", level: 8 }
                        ]
                    },
                    reason: "ドラッカーマネジメントが自然な行動様式となり、組織と社会の発展に貢献する状態を表現"
                };

            default:
                return this.createDefaultEmotionalArc();
        }
    }

    /**
     * ビジネス学習段階に応じた感情アークの強化
     * @private
     */
    private enhanceEmotionalArcForBusinessStage(
        emotionalArc: EmotionalArcDesign,
        stage: LearningStage,
        frameworkName: string
    ): EmotionalArcDesign {
        const enhancedArc = { ...emotionalArc };

        switch (stage) {
            case LearningStage.INTRODUCTION:
                // 導入段階では期待感と学習意欲を強化
                enhancedArc.emotionalJourney.opening.push({
                    dimension: "学習意欲",
                    level: 7
                });
                enhancedArc.emotionalJourney.conclusion.push({
                    dimension: "次段階への期待",
                    level: 6
                });
                enhancedArc.reason += ` ${frameworkName}導入段階として学習意欲を促進。`;
                break;

            case LearningStage.THEORY_APPLICATION:
                // 理論適用段階では実践的緊張感と集中力を強化
                enhancedArc.emotionalJourney.development.push({
                    dimension: "実践的緊張感",
                    level: 8
                });
                enhancedArc.emotionalJourney.development.push({
                    dimension: "理論と実践の架け橋",
                    level: 7
                });
                enhancedArc.reason += ` 理論適用段階として実践的な学習体験を重視。`;
                break;

            case LearningStage.FAILURE_EXPERIENCE:
                // 失敗体験段階では建設的な失敗学習を強化
                enhancedArc.emotionalJourney.opening.push({
                    dimension: "挑戦意欲",
                    level: 7
                });
                enhancedArc.emotionalJourney.development.push({
                    dimension: "失敗からの学び",
                    level: 8
                });
                enhancedArc.emotionalJourney.conclusion.push({
                    dimension: "成長実感",
                    level: 9
                });
                enhancedArc.reason += ` 失敗体験を通した深い学習プロセスを表現。`;
                break;

            case LearningStage.PRACTICAL_MASTERY:
                // 実践的習熟段階では自信と応用力を強化
                enhancedArc.emotionalJourney.development.push({
                    dimension: "応用力",
                    level: 9
                });
                enhancedArc.emotionalJourney.conclusion.push({
                    dimension: "習熟の自信",
                    level: 9
                });
                enhancedArc.emotionalJourney.conclusion.push({
                    dimension: "指導力",
                    level: 7
                });
                enhancedArc.reason += ` 実践的習熟段階として応用力と指導力を表現。`;
                break;
        }

        // フレームワーク特有の強化
        switch (frameworkName) {
            case 'ISSUE_DRIVEN':
                enhancedArc.recommendedTone += " - 課題解決思考を重視";
                break;
            case 'SOCRATIC_DIALOGUE':
                enhancedArc.recommendedTone += " - 自発的発見を促進";
                break;
            case 'ADLER_PSYCHOLOGY':
                enhancedArc.recommendedTone += " - 勇気と共同体感覚を強調";
                break;
            case 'DRUCKER_MANAGEMENT':
                enhancedArc.recommendedTone += " - 効果性と継続革新を重視";
                break;
        }

        return enhancedArc;
    }

    /**
     * ISSUE DRIVEN特化共感ポイントを作成
     * @private
     */
    private createIssueDriverEmpatheticPoints(stage: LearningStage): EmpatheticPoint[] {
        switch (stage) {
            case LearningStage.MISCONCEPTION:
                return [
                    {
                        type: 'situation',
                        position: 0.2,
                        intensity: 0.8,
                        description: '表面的な解決策で満足している自分への違和感'
                    },
                    {
                        type: 'realization',
                        position: 0.6,
                        intensity: 0.7,
                        description: '根本原因を見逃していたことへの気づき'
                    },
                    {
                        type: 'character',
                        position: 0.8,
                        intensity: 0.6,
                        description: '真の課題発見への責任感と緊張感'
                    }
                ];

            case LearningStage.EXPLORATION:
                return [
                    {
                        type: 'character',
                        position: 0.3,
                        intensity: 0.7,
                        description: '課題の本質を探ろうとする探究心'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.8,
                        description: 'データと現実の観察による仮説構築の興奮'
                    },
                    {
                        type: 'decision',
                        position: 0.7,
                        intensity: 0.6,
                        description: '多角的視点で課題を分析する決意'
                    }
                ];

            case LearningStage.CONFLICT:
                return [
                    {
                        type: 'character',
                        position: 0.2,
                        intensity: 0.9,
                        description: '複数の解決策候補から最適解を選ぶ責任の重さ'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.8,
                        description: '限られた資源で最大効果を生む方法の模索'
                    },
                    {
                        type: 'decision',
                        position: 0.8,
                        intensity: 0.9,
                        description: 'リスクを取ってでも根本解決を目指す決断'
                    }
                ];

            case LearningStage.INSIGHT:
                return [
                    {
                        type: 'realization',
                        position: 0.4,
                        intensity: 0.9,
                        description: '真の課題と解決策の全体像が見えた瞬間'
                    },
                    {
                        type: 'character',
                        position: 0.6,
                        intensity: 0.8,
                        description: '問題解決への道筋が明確になった安堵感'
                    },
                    {
                        type: 'transformation',
                        position: 0.8,
                        intensity: 0.8,
                        description: '課題発見能力への自信の獲得'
                    }
                ];

            default:
                return this.createDefaultEmpatheticPoints(stage);
        }
    }

    /**
     * ソクラテス式対話特化共感ポイントを作成
     * @private
     */
    private createSocraticDialogueEmpatheticPoints(stage: LearningStage): EmpatheticPoint[] {
        switch (stage) {
            case LearningStage.MISCONCEPTION:
                return [
                    {
                        type: 'character',
                        position: 0.2,
                        intensity: 0.8,
                        description: '知っているつもりだったことを問われた時の戸惑い'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.7,
                        description: 'シンプルな問いに答えられない自分への驚き'
                    },
                    {
                        type: 'realization',
                        position: 0.8,
                        intensity: 0.9,
                        description: '本当は理解していなかったという謙虚な気づき'
                    }
                ];

            case LearningStage.EXPLORATION:
                return [
                    {
                        type: 'character',
                        position: 0.3,
                        intensity: 0.7,
                        description: '問いかけを通して自分の内面を探る好奇心'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.8,
                        description: '対話によって新たな視点が開かれる喜び'
                    },
                    {
                        type: 'realization',
                        position: 0.7,
                        intensity: 0.6,
                        description: '自分で答えを見つけることの価値への気づき'
                    }
                ];

            case LearningStage.CONFLICT:
                return [
                    {
                        type: 'character',
                        position: 0.2,
                        intensity: 0.9,
                        description: '自分の信念と論理の矛盾に直面した時の混乱'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.8,
                        description: '一貫した思考体系を求める内的な努力'
                    },
                    {
                        type: 'decision',
                        position: 0.8,
                        intensity: 0.7,
                        description: '真理を求めて思考を続ける意志の選択'
                    }
                ];

            case LearningStage.INSIGHT:
                return [
                    {
                        type: 'realization',
                        position: 0.4,
                        intensity: 0.9,
                        description: '自分自身で重要な真理に到達した瞬間の感動'
                    },
                    {
                        type: 'character',
                        position: 0.6,
                        intensity: 0.8,
                        description: '自発的学習能力への深い自信の獲得'
                    },
                    {
                        type: 'transformation',
                        position: 0.8,
                        intensity: 0.9,
                        description: '問いかけることの習慣化による知的成長'
                    }
                ];

            default:
                return this.createDefaultEmpatheticPoints(stage);
        }
    }

    /**
     * アドラー心理学特化共感ポイントを作成
     * @private
     */
    private createAdlerPsychologyEmpatheticPoints(stage: LearningStage): EmpatheticPoint[] {
        switch (stage) {
            case LearningStage.MISCONCEPTION:
                return [
                    {
                        type: 'character',
                        position: 0.2,
                        intensity: 0.8,
                        description: '他者のせいにする習慣から抜け出せない焦り'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.7,
                        description: '被害者意識に囚われている自分への気づき'
                    },
                    {
                        type: 'realization',
                        position: 0.8,
                        intensity: 0.6,
                        description: '自己責任の重要性への最初の理解'
                    }
                ];

            case LearningStage.EXPLORATION:
                return [
                    {
                        type: 'character',
                        position: 0.3,
                        intensity: 0.7,
                        description: '課題の分離概念への知的興味と解放感への期待'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.8,
                        description: '自分の課題と他者の課題を区別する練習'
                    },
                    {
                        type: 'realization',
                        position: 0.7,
                        intensity: 0.7,
                        description: '自己決定の自由がもたらす可能性への気づき'
                    }
                ];

            case LearningStage.CONFLICT:
                return [
                    {
                        type: 'character',
                        position: 0.2,
                        intensity: 0.9,
                        description: '承認欲求を手放すことへの恐怖と葛藤'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.8,
                        description: '嫌われる勇気を持つか安全でいるかの選択'
                    },
                    {
                        type: 'decision',
                        position: 0.8,
                        intensity: 0.9,
                        description: '自分らしく生きるための勇気ある決断'
                    }
                ];

            case LearningStage.INSIGHT:
                return [
                    {
                        type: 'realization',
                        position: 0.4,
                        intensity: 0.9,
                        description: '共同体感覚に目覚めた時の深いつながりの実感'
                    },
                    {
                        type: 'character',
                        position: 0.6,
                        intensity: 0.8,
                        description: '他者貢献によって得られる真の幸福感'
                    },
                    {
                        type: 'transformation',
                        position: 0.8,
                        intensity: 0.9,
                        description: '勇気を持って生きることへの確信'
                    }
                ];

            default:
                return this.createDefaultEmpatheticPoints(stage);
        }
    }

    /**
     * ドラッカーマネジメント特化共感ポイントを作成
     * @private
     */
    private createDruckerManagementEmpatheticPoints(stage: LearningStage): EmpatheticPoint[] {
        switch (stage) {
            case LearningStage.MISCONCEPTION:
                return [
                    {
                        type: 'character',
                        position: 0.2,
                        intensity: 0.7,
                        description: '忙しく働いているのに成果が出ない焦燥感'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.8,
                        description: '効率性を追求しても効果が上がらない疑問'
                    },
                    {
                        type: 'realization',
                        position: 0.8,
                        intensity: 0.7,
                        description: '「正しいことをやる」重要性への気づき'
                    }
                ];

            case LearningStage.EXPLORATION:
                return [
                    {
                        type: 'character',
                        position: 0.3,
                        intensity: 0.8,
                        description: '自分の強みを発見した時の驚きと喜び'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.7,
                        description: '強みを活かした働き方への期待と興奮'
                    },
                    {
                        type: 'realization',
                        position: 0.7,
                        intensity: 0.8,
                        description: 'マネジメントの真の意味への理解'
                    }
                ];

            case LearningStage.CONFLICT:
                return [
                    {
                        type: 'character',
                        position: 0.2,
                        intensity: 0.9,
                        description: '重要性と緊急性の判断に迷う責任の重圧'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.8,
                        description: '限られた時間で最大の成果を求められる緊張'
                    },
                    {
                        type: 'decision',
                        position: 0.8,
                        intensity: 0.9,
                        description: '集中すべき領域を決断する勇気'
                    }
                ];

            case LearningStage.INSIGHT:
                return [
                    {
                        type: 'realization',
                        position: 0.4,
                        intensity: 0.9,
                        description: '継続的イノベーションの必要性を悟った瞬間'
                    },
                    {
                        type: 'character',
                        position: 0.6,
                        intensity: 0.8,
                        description: '組織の未来を創造する使命感の芽生え'
                    },
                    {
                        type: 'transformation',
                        position: 0.8,
                        intensity: 0.8,
                        description: 'マネジメントの醍醐味への深い理解'
                    }
                ];

            default:
                return this.createDefaultEmpatheticPoints(stage);
        }
    }

    /**
     * ビジネス学習段階特化共感ポイントを作成
     * @private
     */
    private createBusinessStageEmpatheticPoints(stage: LearningStage, frameworkName: string): EmpatheticPoint[] {
        const basePoints: EmpatheticPoint[] = [];

        switch (stage) {
            case LearningStage.INTRODUCTION:
                basePoints.push({
                    type: 'character',
                    position: 0.1,
                    intensity: 0.6,
                    description: `${frameworkName}という新しい概念への好奇心と期待`
                });
                basePoints.push({
                    type: 'situation',
                    position: 0.5,
                    intensity: 0.5,
                    description: 'ビジネス学習への意欲と若干の不安'
                });
                break;

            case LearningStage.THEORY_APPLICATION:
                basePoints.push({
                    type: 'character',
                    position: 0.3,
                    intensity: 0.7,
                    description: '理論を実践に移そうとする緊張感と集中力'
                });
                basePoints.push({
                    type: 'situation',
                    position: 0.6,
                    intensity: 0.8,
                    description: '理論と現実のギャップに直面した時の戸惑い'
                });
                break;

            case LearningStage.FAILURE_EXPERIENCE:
                basePoints.push({
                    type: 'character',
                    position: 0.2,
                    intensity: 0.8,
                    description: '失敗から学ぼうとする建設的な姿勢'
                });
                basePoints.push({
                    type: 'realization',
                    position: 0.7,
                    intensity: 0.9,
                    description: '失敗が与えてくれた深い学びへの感謝'
                });
                break;

            case LearningStage.PRACTICAL_MASTERY:
                basePoints.push({
                    type: 'character',
                    position: 0.4,
                    intensity: 0.8,
                    description: '概念を自在に活用できる自信と満足感'
                });
                basePoints.push({
                    type: 'transformation',
                    position: 0.8,
                    intensity: 0.9,
                    description: '他者に教えられるレベルまで成長した充実感'
                });
                break;
        }

        return basePoints;
    }

    /**
     * プロットコンテキストの抽出
     * @private
     */
    private extractPlotContextFromResults(plotResult: any): any {
        const plotData: any = {
            tensionLevel: 0.5,
            currentPhase: null,
            theme: null
        };

        try {
            if (plotResult.success && plotResult.results) {
                for (const result of plotResult.results) {
                    if (result.data && result.data.plotContext) {
                        const context = result.data.plotContext;
                        plotData.tensionLevel = context.tensionLevel || plotData.tensionLevel;
                        plotData.currentPhase = context.phase || context.currentPhase;
                        plotData.theme = context.theme;
                    }

                    if (result.data && result.data.plotStrategy) {
                        const strategy = result.data.plotStrategy;
                        plotData.currentPhase = strategy.currentPhase || plotData.currentPhase;
                    }
                }
            }
        } catch (error) {
            logger.warn('Failed to extract plot context from results', { error });
        }

        return plotData;
    }

    /**
     * キャラクターデータの抽出
     * @private
     */
    private extractCharacterDataFromResults(characterResult: any): any {
        const characterData: any = {
            developmentStage: null,
            psychology: null,
            relationships: null
        };

        try {
            if (characterResult.success && characterResult.results) {
                for (const result of characterResult.results) {
                    if (result.data && result.data.character) {
                        const character = result.data.character;
                        characterData.developmentStage = character.state?.developmentStage;
                        characterData.psychology = character.psychology;
                        characterData.relationships = character.relationships;
                    }

                    if (result.data && result.data.characterAnalysis) {
                        const analysis = result.data.characterAnalysis;
                        characterData.developmentStage = analysis.developmentStage || characterData.developmentStage;
                        characterData.psychology = analysis.psychology || characterData.psychology;
                    }
                }
            }
        } catch (error) {
            logger.warn('Failed to extract character data from results', { error });
        }

        return characterData;
    }

    /**
     * 発達修正値の計算
     * @private
     */
    private calculateDevelopmentModifier(developmentStage: number, learningStage: LearningStage): number {
        try {
            const stageOrder = this.getStageOrder(learningStage);
            const expectedDevelopment = stageOrder * 1.5;
            const difference = developmentStage - expectedDevelopment;

            // -2から+2の範囲で修正値を返す
            return Math.max(-2, Math.min(2, Math.round(difference / 2)));
        } catch (error) {
            return 0;
        }
    }

    /**
     * 関係性感情緊張度の計算
     * @private
     */
    private calculateRelationshipEmotionalTension(relationships: any[]): number {
        try {
            if (!Array.isArray(relationships) || relationships.length === 0) {
                return 0.5;
            }

            let totalTension = 0;
            for (const rel of relationships) {
                switch (rel.type) {
                    case 'ENEMY':
                    case 'RIVAL':
                        totalTension += 0.9;
                        break;
                    case 'MENTOR':
                    case 'PROTECTOR':
                        totalTension += 0.3;
                        break;
                    case 'FRIEND':
                    case 'ALLY':
                        totalTension += 0.2;
                        break;
                    default:
                        totalTension += 0.5;
                }
            }

            return Math.min(1.0, totalTension / relationships.length);
        } catch (error) {
            return 0.5;
        }
    }

    /**
     * 学習段階と感情の整合度計算
     * @private
     */
    private calculateStageEmotionAlignment(emotionalArc: EmotionalArcDesign, stage: LearningStage): number {
        try {
            // 各学習段階に期待される感情特性
            const expectedEmotions: Record<LearningStage, string[]> = {
                [LearningStage.MISCONCEPTION]: ['自信', '混乱', 'フラストレーション'],
                [LearningStage.EXPLORATION]: ['好奇心', '発見', '期待'],
                [LearningStage.CONFLICT]: ['葛藤', '緊張', '決断'],
                [LearningStage.INSIGHT]: ['驚き', '興奮', '解放感'],
                [LearningStage.APPLICATION]: ['自信', '集中', '達成感'],
                [LearningStage.INTEGRATION]: ['調和', '満足感', '創造性'],
                // 新しいビジネス学習段階
                [LearningStage.INTRODUCTION]: ['関心', '期待', '学習意欲'],
                [LearningStage.THEORY_APPLICATION]: ['実践意欲', '緊張感', '集中'],
                [LearningStage.FAILURE_EXPERIENCE]: ['挑戦', '学び', '成長実感'],
                [LearningStage.PRACTICAL_MASTERY]: ['自信', '応用力', '指導力']
            };

            const expected = expectedEmotions[stage] || [];
            if (expected.length === 0) return 0.5;

            // 実際の感情アークの次元を抽出
            const actualDimensions = [
                ...emotionalArc.emotionalJourney.opening,
                ...emotionalArc.emotionalJourney.development,
                ...emotionalArc.emotionalJourney.conclusion
            ].map(dim => dim.dimension);

            // 期待される感情との一致度を計算
            const matches = expected.filter(exp =>
                actualDimensions.some(actual => actual.includes(exp) || exp.includes(actual))
            );

            return matches.length / expected.length;
        } catch (error) {
            return 0.5;
        }
    }

    /**
     * 学習段階の順序を取得
     * @private
     */
    private getStageOrder(stage: LearningStage): number {
        const stageOrder: Record<LearningStage, number> = {
            [LearningStage.MISCONCEPTION]: 1,
            [LearningStage.EXPLORATION]: 2,
            [LearningStage.CONFLICT]: 3,
            [LearningStage.INSIGHT]: 4,
            [LearningStage.APPLICATION]: 5,
            [LearningStage.INTEGRATION]: 6,
            // 新しいビジネス学習段階
            [LearningStage.INTRODUCTION]: 1,
            [LearningStage.THEORY_APPLICATION]: 2,
            [LearningStage.FAILURE_EXPERIENCE]: 3,
            [LearningStage.PRACTICAL_MASTERY]: 4
        };

        return stageOrder[stage] || 0;
    }

    /**
     * カタルシス体験を設計する
     * 
     * @param conceptName 概念名
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @returns カタルシス体験の設計
     */
    async designCatharticExperience(
        conceptName: string,
        stage: LearningStage,
        chapterNumber: number
    ): Promise<CatharticExperience | null> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();

            // カタルシスが適切な学習段階かチェック
            if (!this.isCatharticAppropriateForStage(stage)) {
                logger.info(`Cathartic experience not appropriate for stage ${stage}, skipping design`);
                return null;
            }

            logger.info(`Designing cathartic experience for ${conceptName} at stage ${stage}`);
            this.performanceStats.totalAnalyses++;

            // 学習段階に適したカタルシス体験を生成
            const catharticExperience = this.createStageBasedCatharticExperience(
                conceptName,
                stage
            );

            // 統合記憶システムを使用した情報保存
            if (catharticExperience) {
                await this.safeMemoryOperation(
                    async () => {
                        // カタルシス体験をターニングポイントとして記録
                        const chapter: Chapter = {
                            id: `cathartic-${chapterNumber}`,
                            chapterNumber,
                            title: `カタルシス体験 - 第${chapterNumber}章`,
                            content: catharticExperience.peakMoment,
                            previousChapterSummary: '',
                            scenes: [],
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            metadata: {
                                createdAt: new Date().toISOString(),
                                lastModified: new Date().toISOString(),
                                status: 'cathartic_experience_designed',
                                catharticExperience,
                                conceptName,
                                learningStage: stage,
                                significance: catharticExperience.intensity,
                                wordCount: catharticExperience.peakMoment.length,
                                estimatedReadingTime: Math.ceil(catharticExperience.peakMoment.length / 1000)
                            }
                        };

                        const result = await this.memoryManager.processChapter(chapter);
                        if (result.success) {
                            this.performanceStats.memorySystemHits++;
                        }
                        return result;
                    },
                    null,
                    'storeCatharticExperience'
                );
            }

            // イベント発行
            this.eventBus.publish('cathartic.experience.designed', {
                conceptName,
                stage,
                chapterNumber,
                experience: catharticExperience
            });

            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, true);

            return catharticExperience;

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, false);

            logger.error(`Failed to design cathartic experience for ${conceptName}`, {
                error: error instanceof Error ? error.message : String(error),
                stage,
                chapterNumber
            });

            // エラー時はnullを返す
            return null;
        }
    }

    /**
     * 感情と学習の同期度を分析する
     * 
     * @param chapterContent 章内容
     * @param conceptName 概念名
     * @param stage 学習段階
     * @returns 感情学習同期指標
     */
    async analyzeSynchronization(
        chapterContent: string,
        conceptName: string,
        stage: LearningStage
    ): Promise<EmotionLearningSyncMetrics> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();

            logger.info(`Analyzing emotion-learning synchronization for ${conceptName} at stage ${stage}`);
            this.performanceStats.totalAnalyses++;

            // コンテンツの安全な切り詰め
            const truncatedContent = this.safeContentTruncation(chapterContent, 5000);

            // AIを使って章内容を分析
            const prompt = this.createSynchronizationPrompt(
                truncatedContent,
                conceptName,
                stage
            );

            const response = await this.executeAIAnalysis(prompt, {
                temperature: 0.1,
                responseFormat: 'json'
            });

            // レスポンスの安全な解析
            const metrics = this.parseSynchronizationResponse(response);

            // 統合記憶システムを使用した結果保存
            await this.safeMemoryOperation(
                async () => {
                    const searchResult = await this.memoryManager.unifiedSearch(
                        `synchronization analysis ${conceptName}`,
                        [MemoryLevel.MID_TERM]
                    );

                    if (searchResult.success) {
                        this.performanceStats.memorySystemHits++;
                    }
                    return searchResult;
                },
                null,
                'storeSynchronizationMetrics'
            );

            // イベント発行
            this.eventBus.publish('emotion.learning.synchronized', {
                conceptName,
                stage,
                metrics
            });

            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, true);

            return metrics;

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, false);

            logger.error(`Failed to analyze synchronization for ${conceptName}`, {
                error: error instanceof Error ? error.message : String(error),
                stage
            });

            // エラー時はデフォルト指標を返す
            return this.createDefaultSyncMetrics();
        }
    }

    /**
     * 共感ポイントを生成する
     * 
     * @param chapterContent 章内容
     * @param conceptName 概念名
     * @param stage 学習段階
     * @returns 共感ポイントの配列
     */
    async generateEmpatheticPoints(
        chapterContent: string,
        conceptName: string,
        stage: LearningStage
    ): Promise<EmpatheticPoint[]> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();

            logger.info(`Generating empathetic points for ${conceptName} at stage ${stage}`);
            this.performanceStats.totalAnalyses++;

            // コンテンツの安全な切り詰め
            const truncatedContent = this.safeContentTruncation(chapterContent, 5000);

            // AIを使って共感ポイントを生成
            const prompt = this.createEmpatheticPointsPrompt(
                truncatedContent,
                conceptName,
                stage
            );

            const response = await this.executeAIAnalysis(prompt, {
                temperature: 0.3,
                responseFormat: 'json'
            });

            // レスポンスの安全な解析
            const validatedPoints = this.parseEmpatheticPointsResponse(response, stage);

            // イベント発行
            this.eventBus.publish('empathetic.points.generated', {
                conceptName,
                stage,
                points: validatedPoints
            });

            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, true);

            return validatedPoints;

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, false);

            logger.error(`Failed to generate empathetic points for ${conceptName}`, {
                error: error instanceof Error ? error.message : String(error),
                stage
            });

            // エラー時はデフォルトの共感ポイントを返す
            return this.createDefaultEmpatheticPoints(stage);
        }
    }

    /**
     * 章内容に基づいた感情分析を行う
     * 
     * @param chapterContent 章内容
     * @param genre ジャンル
     * @returns 感情分析結果
     */
    async analyzeChapterEmotion(
        chapterContent: string,
        genre: string = 'business'
    ): Promise<{
        overallTone: string;
        emotionalImpact: number;
        emotionalDimensions?: any;
    }> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();

            logger.info(`Analyzing chapter emotion`);
            this.performanceStats.totalAnalyses++;

            // コンテンツの安全な切り詰め
            const truncatedContent = this.safeContentTruncation(chapterContent, 5000);

            const prompt = this.createEmotionAnalysisPrompt(truncatedContent, genre);

            const response = await this.executeAIAnalysis(prompt, {
                temperature: 0.1,
                responseFormat: 'json'
            });

            // レスポンスの安全な解析
            const analysis = this.parseEmotionAnalysisResponse(response);

            // イベント発行
            this.eventBus.publish('chapter.emotion.analyzed', {
                analysis
            });

            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, true);

            return analysis;

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, false);

            logger.error(`Failed to analyze chapter emotion`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // デフォルト分析結果を返す
            return {
                overallTone: "中立的",
                emotionalImpact: 5
            };
        }
    }

    /**
     * ビジネスフレームワーク特化感情アークを設計する
     * @param frameworkName フレームワーク名
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @returns フレームワーク特化感情アーク設計
     */
    async designBusinessFrameworkEmotionalArc(
        frameworkName: string,
        stage: LearningStage,
        chapterNumber: number
    ): Promise<EmotionalArcDesign> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();

            logger.info(`Designing business framework emotional arc for ${frameworkName} at stage ${stage}`);
            this.performanceStats.totalAnalyses++;

            let emotionalArc: EmotionalArcDesign;

            // フレームワーク別の特化感情アーク設計
            switch (frameworkName) {
                case 'ISSUE_DRIVEN':
                    emotionalArc = this.createIssueDriverEmotionalArc(stage, chapterNumber);
                    break;
                case 'SOCRATIC_DIALOGUE':
                    emotionalArc = this.createSocraticDialogueEmotionalArc(stage, chapterNumber);
                    break;
                case 'ADLER_PSYCHOLOGY':
                    emotionalArc = this.createAdlerPsychologyEmotionalArc(stage, chapterNumber);
                    break;
                case 'DRUCKER_MANAGEMENT':
                    emotionalArc = this.createDruckerManagementEmotionalArc(stage, chapterNumber);
                    break;
                default:
                    emotionalArc = this.createStageBasedEmotionalArc(stage);
                    break;
            }

            // 4段階学習進行モデルに対応した調整
            if (stage === LearningStage.INTRODUCTION ||
                stage === LearningStage.THEORY_APPLICATION ||
                stage === LearningStage.FAILURE_EXPERIENCE ||
                stage === LearningStage.PRACTICAL_MASTERY) {
                emotionalArc = this.enhanceEmotionalArcForBusinessStage(emotionalArc, stage, frameworkName);
            }

            // 統合記憶システムを使用した情報保存
            await this.safeMemoryOperation(
                async () => {
                    const chapter: Chapter = {
                        id: `business-emotional-arc-${chapterNumber}`,
                        chapterNumber,
                        title: `ビジネス感情アーク設計 - 第${chapterNumber}章`,
                        content: `フレームワーク: ${frameworkName}, 段階: ${stage}, 設計理由: ${emotionalArc.reason}`,
                        previousChapterSummary: '',
                        scenes: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        metadata: {
                            createdAt: new Date().toISOString(),
                            lastModified: new Date().toISOString(),
                            status: 'business_framework_emotional_arc_designed',
                            emotionalArc,
                            frameworkName,
                            learningStage: stage,
                            businessFrameworkIntegration: true,
                            wordCount: emotionalArc.reason.length,
                            estimatedReadingTime: Math.ceil(emotionalArc.reason.length / 1000)
                        }
                    };

                    const result = await this.memoryManager.processChapter(chapter);
                    if (result.success) {
                        this.performanceStats.memorySystemHits++;
                    }
                    return result;
                },
                null,
                'storeBusinessFrameworkEmotionalArc'
            );

            // イベント発行（ビジネスフレームワーク統合情報付き）
            this.eventBus.publish('emotional.arc.designed' as any, {
                frameworkName,
                stage,
                chapterNumber,
                arc: emotionalArc,
                businessFrameworkIntegrated: true
            });

            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, true);

            return emotionalArc;

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, false);

            logger.error(`Failed to design business framework emotional arc for ${frameworkName}`, {
                error: error instanceof Error ? error.message : String(error),
                stage,
                chapterNumber
            });

            return this.createDefaultEmotionalArc();
        }
    }

    /**
     * ビジネスフレームワーク特化共感ポイントを生成する
     * @param frameworkName フレームワーク名
     * @param stage 学習段階
     * @param content 章内容（オプション）
     * @returns フレームワーク特化共感ポイント
     */
    async generateBusinessFrameworkEmpatheticPoints(
        frameworkName: string,
        stage: LearningStage,
        content?: string
    ): Promise<EmpatheticPoint[]> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();

            logger.info(`Generating business framework empathetic points for ${frameworkName} at stage ${stage}`);
            this.performanceStats.totalAnalyses++;

            let empatheticPoints: EmpatheticPoint[] = [];

            // フレームワーク別の特化共感ポイント生成
            switch (frameworkName) {
                case 'ISSUE_DRIVEN':
                    empatheticPoints = this.createIssueDriverEmpatheticPoints(stage);
                    break;
                case 'SOCRATIC_DIALOGUE':
                    empatheticPoints = this.createSocraticDialogueEmpatheticPoints(stage);
                    break;
                case 'ADLER_PSYCHOLOGY':
                    empatheticPoints = this.createAdlerPsychologyEmpatheticPoints(stage);
                    break;
                case 'DRUCKER_MANAGEMENT':
                    empatheticPoints = this.createDruckerManagementEmpatheticPoints(stage);
                    break;
                default:
                    empatheticPoints = this.createDefaultEmpatheticPoints(stage);
                    break;
            }

            // 4段階学習進行モデルに対応した追加共感ポイント
            if (stage === LearningStage.INTRODUCTION ||
                stage === LearningStage.THEORY_APPLICATION ||
                stage === LearningStage.FAILURE_EXPERIENCE ||
                stage === LearningStage.PRACTICAL_MASTERY) {
                const businessStagePoints = this.createBusinessStageEmpatheticPoints(stage, frameworkName);
                empatheticPoints = [...empatheticPoints, ...businessStagePoints];
            }

            // イベント発行
            this.eventBus.publish('empathetic.points.generated' as any, {
                frameworkName,
                stage,
                points: empatheticPoints,
                businessFrameworkIntegrated: true
            });

            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, true);

            return empatheticPoints;

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, false);

            logger.error(`Failed to generate business framework empathetic points for ${frameworkName}`, {
                error: error instanceof Error ? error.message : String(error),
                stage
            });

            return this.createDefaultEmpatheticPoints(stage);
        }
    }

    /**
     * 感情と学習の統合計画を生成する
     * 
     * @param conceptName 概念名
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @returns 感情学習統合計画
     */
    async createIntegratedPlan(
        conceptName: string,
        stage: LearningStage,
        chapterNumber: number
    ): Promise<{
        emotionalArc: EmotionalArcDesign;
        catharticExperience: CatharticExperience | null;
        empatheticPoints: EmpatheticPoint[];
        syncRecommendations: string[];
    }> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();

            logger.info(`Creating integrated emotion-learning plan for ${conceptName} at stage ${stage}`);
            this.performanceStats.totalAnalyses++;

            // 1. 感情アークの設計
            const emotionalArc = await this.designEmotionalArc(conceptName, stage, chapterNumber);

            // 2. カタルシス体験の設計
            const catharticExperience = await this.designCatharticExperience(conceptName, stage, chapterNumber);

            // 3. デフォルトの共感ポイント生成
            const empatheticPoints = this.createDefaultEmpatheticPoints(stage);

            // 4. 同期推奨事項の生成
            const syncRecommendations = this.generateSyncRecommendations(stage);

            // 統合計画を統合記憶システムに保存
            await this.safeMemoryOperation(
                async () => {
                    const chapter: Chapter = {
                        id: `integrated-plan-${chapterNumber}`,
                        chapterNumber,
                        title: `統合感情学習計画 - 第${chapterNumber}章`,
                        content: `統合計画: 概念=${conceptName}, 段階=${stage}`,
                        previousChapterSummary: '',
                        scenes: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        metadata: {
                            createdAt: new Date().toISOString(),
                            lastModified: new Date().toISOString(),
                            status: 'integrated_plan_created',
                            conceptName,
                            learningStage: stage,
                            integratedPlan: {
                                emotionalArc,
                                catharticExperience,
                                empatheticPoints,
                                syncRecommendations
                            },
                            wordCount: 100,
                            estimatedReadingTime: 1
                        }
                    };

                    return await this.memoryManager.processChapter(chapter);
                },
                null,
                'storeIntegratedPlan'
            );

            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, true);

            // 統合計画を返す
            return {
                emotionalArc,
                catharticExperience,
                empatheticPoints,
                syncRecommendations
            };

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, false);

            logger.error(`Failed to create integrated plan for ${conceptName}`, {
                error: error instanceof Error ? error.message : String(error),
                stage,
                chapterNumber
            });

            // エラー時はデフォルト計画を返す
            return {
                emotionalArc: this.createDefaultEmotionalArc(),
                catharticExperience: null,
                empatheticPoints: this.createDefaultEmpatheticPoints(stage),
                syncRecommendations: []
            };
        }
    }

    /**
     * セクションの感情アーク設計と同期する
     * @param sectionId セクションID
     * @param emotionalDesign 感情設計データ
     */
    async synchronizeWithSection(
        sectionId: string,
        emotionalDesign: any
    ): Promise<void> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();

            logger.info(`Synchronizing emotional design for section ${sectionId}`);

            // 統合記憶システムを使用してセクション関連データを保存
            await this.safeMemoryOperation(
                async () => {
                    // セクションデータを章として統合記憶システムに保存
                    const chapter: Chapter = {
                        id: `section-emotional-${sectionId}`,
                        chapterNumber: -1, // セクションレベルのメタデータを示す
                        title: `Section Emotional Design ${sectionId}`,
                        content: JSON.stringify(emotionalDesign),
                        previousChapterSummary: '',
                        scenes: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        metadata: {
                            createdAt: new Date().toISOString(),
                            lastModified: new Date().toISOString(),
                            status: 'section_emotional_design',
                            sectionId,
                            emotionalDesign,
                            type: 'section_emotional_design',
                            wordCount: JSON.stringify(emotionalDesign).length,
                            estimatedReadingTime: 1
                        }
                    };

                    return await this.memoryManager.processChapter(chapter);
                },
                null,
                'synchronizeWithSection'
            );

            // 感情学習の同期イベントを発行
            this.eventBus.publish('emotion.learning.synchronized', {
                sectionId,
                timestamp: new Date().toISOString(),
                emotionalDesignData: {
                    emotionalArc: emotionalDesign.emotionalArc,
                    catharticMoment: emotionalDesign.catharticMoment
                }
            });

            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, true);

            logger.info(`Successfully synchronized emotional design for section ${sectionId}`);

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(processingTime, false);

            logger.error(`Failed to synchronize emotional design with section`, {
                error: error instanceof Error ? error.message : String(error),
                sectionId
            });
            throw error;
        }
    }

    /**
     * 診断情報を取得
     */
    async performDiagnostics(): Promise<{
        initialized: boolean;
        performanceMetrics: PerformanceMetrics;
        memorySystemStatus: any;
        recommendations: string[];
        memorySystemError?: string;
    }> {
        try {
            // MemorySystemStatus型に準拠したフォールバック値を作成
            const createFallbackMemoryStatus = (): any => ({
                initialized: false,
                lastUpdateTime: new Date().toISOString(),
                memoryLayers: {
                    shortTerm: { healthy: false, dataCount: 0, lastUpdate: '', storageSize: 0, errorCount: 1 },
                    midTerm: { healthy: false, dataCount: 0, lastUpdate: '', storageSize: 0, errorCount: 1 },
                    longTerm: { healthy: false, dataCount: 0, lastUpdate: '', storageSize: 0, errorCount: 1 }
                },
                performanceMetrics: {
                    totalRequests: 0,
                    cacheHits: 0,
                    duplicatesResolved: 0,
                    averageResponseTime: 0,
                    lastUpdateTime: new Date().toISOString()
                },
                cacheStatistics: {
                    hitRatio: 0,
                    missRatio: 1,
                    totalRequests: 0,
                    cacheSize: 0,
                    lastOptimization: new Date().toISOString(),
                    evictionCount: 0
                }
            });

            let memorySystemStatus: any;
            let memorySystemError: string | undefined;

            if (this.config.useMemorySystemIntegration) {
                const result = await this.safeMemoryOperation(
                    () => this.memoryManager.getSystemStatus(),
                    null,
                    'getSystemStatus'
                );

                if (result) {
                    memorySystemStatus = result;
                } else {
                    memorySystemStatus = createFallbackMemoryStatus();
                    memorySystemError = 'Memory system unavailable';
                }
            } else {
                memorySystemStatus = createFallbackMemoryStatus();
                memorySystemError = 'Memory integration disabled';
            }

            const recommendations: string[] = [];

            // パフォーマンス推奨事項の生成
            if (this.performanceStats.averageProcessingTime > 2000) {
                recommendations.push('Consider optimizing AI response times');
            }

            if (this.performanceStats.cacheEfficiencyRate < 0.7) {
                recommendations.push('Improve caching strategy for emotional designs');
            }

            if (this.performanceStats.memorySystemHits === 0 && this.config.useMemorySystemIntegration) {
                recommendations.push('Memory system integration is not functioning properly');
            }

            // メモリシステム固有の推奨事項
            if (memorySystemError) {
                recommendations.push(`Memory system issue: ${memorySystemError}`);
            }

            if (!memorySystemStatus.initialized) {
                recommendations.push('Memory system is not properly initialized');
            }

            // メモリレイヤーの健全性チェック
            if (memorySystemStatus.memoryLayers) {
                const layers = memorySystemStatus.memoryLayers;
                if (!layers.shortTerm?.healthy) {
                    recommendations.push('Short-term memory layer requires attention');
                }
                if (!layers.midTerm?.healthy) {
                    recommendations.push('Mid-term memory layer requires attention');
                }
                if (!layers.longTerm?.healthy) {
                    recommendations.push('Long-term memory layer requires attention');
                }
            }

            return {
                initialized: this.initialized,
                performanceMetrics: { ...this.performanceStats },
                memorySystemStatus,
                recommendations,
                memorySystemError
            };

        } catch (error) {
            logger.error('Failed to perform diagnostics', { error });
            return {
                initialized: this.initialized,
                performanceMetrics: { ...this.performanceStats },
                memorySystemStatus: {
                    initialized: false,
                    lastUpdateTime: new Date().toISOString(),
                    memoryLayers: {
                        shortTerm: { healthy: false, dataCount: 0, lastUpdate: '', storageSize: 0, errorCount: 1 },
                        midTerm: { healthy: false, dataCount: 0, lastUpdate: '', storageSize: 0, errorCount: 1 },
                        longTerm: { healthy: false, dataCount: 0, lastUpdate: '', storageSize: 0, errorCount: 1 }
                    },
                    performanceMetrics: {
                        totalRequests: 0,
                        cacheHits: 0,
                        duplicatesResolved: 0,
                        averageResponseTime: 0,
                        lastUpdateTime: new Date().toISOString()
                    },
                    cacheStatistics: {
                        hitRatio: 0,
                        missRatio: 1,
                        totalRequests: 0,
                        cacheSize: 0,
                        lastOptimization: new Date().toISOString(),
                        evictionCount: 0
                    }
                },
                recommendations: ['System diagnostics failed - check logs'],
                memorySystemError: error instanceof Error ? error.message : String(error)
            };
        }
    }

    // ============================================================================
    // Private Helper Methods - 安全性とエラーハンドリングの強化
    // ============================================================================

    /**
     * 安全な記憶システム操作パターン
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

        let retries = 0;
        const maxRetries = this.config.maxRetries;

        while (retries < maxRetries) {
            try {
                // システム状態確認
                const systemStatus = await this.memoryManager.getSystemStatus();
                if (!systemStatus.initialized) {
                    logger.warn(`${operationName}: MemoryManager not initialized`);
                    return fallbackValue;
                }

                const result = await Promise.race([
                    operation(),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('Operation timeout')), this.config.timeoutMs)
                    )
                ]);

                return result;

            } catch (error) {
                retries++;
                logger.error(`${operationName} failed (attempt ${retries}/${maxRetries})`, { error });

                if (retries >= maxRetries) {
                    return fallbackValue;
                }

                // 指数バックオフで再試行
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
            }
        }

        return fallbackValue;
    }

    /**
     * 安全なコンテンツ切り詰め
     * @private
     */
    private safeContentTruncation(content: string, maxLength: number): string {
        if (!content || typeof content !== 'string') {
            return '';
        }

        return content.length > maxLength
            ? content.substring(0, maxLength) + '...(truncated)'
            : content;
    }

    /**
     * 安全なAI分析実行
     * @private
     */
    private async executeAIAnalysis(prompt: string, options: any): Promise<string> {
        try {
            return await this.geminiClient.generateText(prompt, options);
        } catch (error) {
            logger.error('AI analysis failed', { error });
            throw error;
        }
    }

    /**
     * 同期分析レスポンスの安全な解析
     * @private
     */
    private parseSynchronizationResponse(response: string): EmotionLearningSyncMetrics {
        try {
            const metrics = JsonParser.parseFromAIResponse(response, this.createDefaultSyncMetrics());
            return this.validateSyncMetrics(metrics);
        } catch (error) {
            logger.error(`Failed to parse synchronization response`, { error });
            return this.createDefaultSyncMetrics();
        }
    }

    /**
     * 共感ポイントレスポンスの安全な解析
     * @private
     */
    private parseEmpatheticPointsResponse(response: string, stage: LearningStage): EmpatheticPoint[] {
        try {
            const result = JsonParser.parseFromAIResponse(response, { points: [] });

            if (Array.isArray(result.points)) {
                // 型安全な変換処理
                const validPoints = result.points
                    .filter((point: any): boolean =>
                        point !== null &&
                        point !== undefined &&
                        typeof point.type === 'string' &&
                        typeof point.position === 'number' &&
                        typeof point.intensity === 'number' &&
                        typeof point.description === 'string'
                    )
                    .map((point: any): EmpatheticPoint => ({
                        type: point.type as 'character' | 'situation' | 'decision' | 'realization' | 'transformation',
                        position: Math.max(0, Math.min(1, point.position)),
                        intensity: Math.max(0, Math.min(1, point.intensity)),
                        description: point.description
                    }));

                return validPoints;
            }
        } catch (error) {
            logger.error(`Failed to parse empathetic points response`, { error });
        }

        return this.createDefaultEmpatheticPoints(stage);
    }

    /**
     * 感情分析レスポンスの安全な解析
     * @private
     */
    private parseEmotionAnalysisResponse(response: string): {
        overallTone: string;
        emotionalImpact: number;
        emotionalDimensions?: any;
    } {
        try {
            const result = JsonParser.parseFromAIResponse(response, {
                overallTone: "中立的",
                emotionalImpact: 5,
                emotionalDimensions: {}
            });

            return {
                overallTone: result.overallTone || "中立的",
                emotionalImpact: typeof result.emotionalImpact === 'number' ?
                    Math.min(10, Math.max(1, result.emotionalImpact)) : 5,
                emotionalDimensions: result.emotionalDimensions
            };
        } catch (error) {
            logger.error(`Failed to parse emotion analysis response`, { error });
            return {
                overallTone: "中立的",
                emotionalImpact: 5
            };
        }
    }

    /**
     * パフォーマンス指標の更新
     * @private
     */
    private updatePerformanceMetrics(processingTime: number, success: boolean): void {
        if (success) {
            this.performanceStats.successfulAnalyses++;
        } else {
            this.performanceStats.failedAnalyses++;
        }

        // 平均処理時間の更新
        const totalAnalyses = this.performanceStats.totalAnalyses;
        this.performanceStats.averageProcessingTime =
            ((this.performanceStats.averageProcessingTime * (totalAnalyses - 1)) + processingTime) / totalAnalyses;

        // キャッシュ効率率の更新
        this.performanceStats.cacheEfficiencyRate =
            this.performanceStats.successfulAnalyses / this.performanceStats.totalAnalyses;
    }

    /**
     * 初期化状態の確認
     * @private
     */
    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }
    }

    // ============================================================================
    // Existing Helper Methods - 既存機能を完全保持
    // ============================================================================

    /**
     * 学習段階に応じた感情アークを作成
     */
    private createStageBasedEmotionalArc(stage: LearningStage): EmotionalArcDesign {
        switch (stage) {
            case LearningStage.MISCONCEPTION:
                return {
                    recommendedTone: "フラストレーションと混乱のバランス",
                    emotionalJourney: {
                        opening: [
                            { dimension: "自信", level: 7 },
                            { dimension: "期待", level: 6 }
                        ],
                        development: [
                            { dimension: "混乱", level: 7 },
                            { dimension: "フラストレーション", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "自己疑問", level: 6 },
                            { dimension: "不安", level: 5 }
                        ]
                    },
                    reason: "誤解段階では、初期の過剰な自信から問題発生によるフラストレーションへの推移を表現"
                };

            case LearningStage.EXPLORATION:
                return {
                    recommendedTone: "好奇心と発見のバランス",
                    emotionalJourney: {
                        opening: [
                            { dimension: "好奇心", level: 7 },
                            { dimension: "疑問", level: 6 }
                        ],
                        development: [
                            { dimension: "探索", level: 8 },
                            { dimension: "発見", level: 7 }
                        ],
                        conclusion: [
                            { dimension: "期待", level: 7 },
                            { dimension: "可能性", level: 8 }
                        ]
                    },
                    reason: "探索段階では、新たな可能性への好奇心と発見を表現し、次の段階への期待を構築"
                };

            case LearningStage.CONFLICT:
                return {
                    recommendedTone: "葛藤と決断の緊張感",
                    emotionalJourney: {
                        opening: [
                            { dimension: "葛藤", level: 7 },
                            { dimension: "混乱", level: 6 }
                        ],
                        development: [
                            { dimension: "内的対立", level: 8 },
                            { dimension: "緊張", level: 7 }
                        ],
                        conclusion: [
                            { dimension: "決断", level: 8 },
                            { dimension: "覚悟", level: 7 }
                        ]
                    },
                    reason: "葛藤段階では、相反する視点の対立から決断へと向かう緊張感のある感情の流れを表現"
                };

            case LearningStage.INSIGHT:
                return {
                    recommendedTone: "驚きと理解の感動",
                    emotionalJourney: {
                        opening: [
                            { dimension: "緊張", level: 7 },
                            { dimension: "集中", level: 8 }
                        ],
                        development: [
                            { dimension: "驚き", level: 9 },
                            { dimension: "興奮", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "解放感", level: 9 },
                            { dimension: "満足", level: 8 }
                        ]
                    },
                    reason: "気づき段階では、緊張から驚きの瞬間を経て、新たな理解がもたらす解放感と満足を表現"
                };

            case LearningStage.APPLICATION:
                return {
                    recommendedTone: "実践と手応えのバランス",
                    emotionalJourney: {
                        opening: [
                            { dimension: "自信", level: 7 },
                            { dimension: "意欲", level: 8 }
                        ],
                        development: [
                            { dimension: "集中", level: 8 },
                            { dimension: "奮闘", level: 7 }
                        ],
                        conclusion: [
                            { dimension: "達成感", level: 8 },
                            { dimension: "喜び", level: 7 }
                        ]
                    },
                    reason: "応用段階では、新たな理解を意識的に適用する自信から、実践を通じた達成感への変化を表現"
                };

            case LearningStage.INTEGRATION:
                return {
                    recommendedTone: "調和と自信のバランス",
                    emotionalJourney: {
                        opening: [
                            { dimension: "調和", level: 8 },
                            { dimension: "安定", level: 7 }
                        ],
                        development: [
                            { dimension: "自信", level: 9 },
                            { dimension: "創造性", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "満足感", level: 9 },
                            { dimension: "充実", level: 8 }
                        ]
                    },
                    reason: "統合段階では、概念が自然な行動パターンとなり、安定と調和をもたらす状態を表現"
                };

            default:
                return this.createDefaultEmotionalArc();
        }
    }

    /**
     * デフォルトの感情アークを作成
     */
    private createDefaultEmotionalArc(): EmotionalArcDesign {
        return {
            recommendedTone: "バランスのとれた中立的なトーン",
            emotionalJourney: {
                opening: [
                    { dimension: "関心", level: 7 },
                    { dimension: "期待", level: 6 }
                ],
                development: [
                    { dimension: "集中", level: 7 },
                    { dimension: "探求", level: 6 }
                ],
                conclusion: [
                    { dimension: "理解", level: 7 },
                    { dimension: "満足", level: 6 }
                ]
            },
            reason: "学習のプロセスにおける基本的な感情の流れを表現"
        };
    }

    /**
     * 学習段階がカタルシス体験に適しているかを判断
     */
    private isCatharticAppropriateForStage(stage: LearningStage): boolean {
        return [
            LearningStage.INSIGHT,
            LearningStage.APPLICATION,
            LearningStage.INTEGRATION
        ].includes(stage);
    }

    /**
     * 学習段階に応じたカタルシス体験を作成
     */
    private createStageBasedCatharticExperience(
        conceptName: string,
        stage: LearningStage
    ): CatharticExperience {
        switch (stage) {
            case LearningStage.INSIGHT:
                return {
                    type: 'intellectual',
                    intensity: 0.9,
                    trigger: `${conceptName}の核心に触れる瞬間`,
                    buildup: [
                        '概念の限界に直面して混乱する',
                        '新たな視点の可能性を垣間見る',
                        '概念の一部が理解でき始める',
                        'ピースが徐々に繋がり始める'
                    ],
                    peakMoment: `突如として、${conceptName}の本質が明確に見え、すべてが繋がる瞬間の感動。これまでの混乱が一瞬で晴れ渡り、新たな理解の景色が広がる。`,
                    aftermath: `${conceptName}に対する理解が一変し、新たな視点で物事を見られるようになる。これまで難しかった問題も、新しい理解の光の中では解決策が見えてくる。`,
                    relatedLearningStage: stage,
                    relatedConcept: conceptName
                };

            case LearningStage.APPLICATION:
                return {
                    type: 'emotional',
                    intensity: 0.7,
                    trigger: `${conceptName}を実践する中での成功体験`,
                    buildup: [
                        '新しく得た理解を試してみる',
                        '初めは不安や戸惑いがある',
                        '徐々に手応えを感じ始める',
                        '実践によって理解が深まっていく'
                    ],
                    peakMoment: `${conceptName}を実践した結果、明確な成果が得られる瞬間。理論と実践が見事に結びつき、自信と喜びが広がる。`,
                    aftermath: `${conceptName}の適用に自信が持て、様々な状況での応用が自然にできるようになる。知識が実用的なスキルへと変化する。`,
                    relatedLearningStage: stage,
                    relatedConcept: conceptName
                };

            case LearningStage.INTEGRATION:
                return {
                    type: 'transformative',
                    intensity: 0.8,
                    trigger: `${conceptName}が自然な思考パターンとなった瞬間の認識`,
                    buildup: [
                        '概念の応用が徐々に自然になっていく',
                        '意識的な適用から無意識的な活用へ移行し始める',
                        '概念を通じて他者を導く機会が増える',
                        '概念が自己の一部として定着していく感覚'
                    ],
                    peakMoment: `ふと気づくと、${conceptName}が自分の思考や行動に自然に組み込まれており、以前の自分との違いを明確に認識する瞬間。深い満足感と成長の実感が広がる。`,
                    aftermath: `${conceptName}が自分のアイデンティティの一部となり、他者にも教えたり共有したりできるようになる。概念の本質をさらに深く理解し、創造的に発展させられるようになる。`,
                    relatedLearningStage: stage,
                    relatedConcept: conceptName
                };

            default:
                return {
                    type: 'intellectual',
                    intensity: 0.7,
                    trigger: `${conceptName}に関する重要な発見`,
                    buildup: [
                        '概念への関心が高まる',
                        '問いが生まれ、探求が始まる',
                        '新たな可能性が見え始める',
                        '理解が徐々に深まっていく'
                    ],
                    peakMoment: `${conceptName}に関する重要な洞察が得られる瞬間。理解が一気に深まり、新たな視点が開ける。`,
                    aftermath: `${conceptName}に対する理解が変化し、新たな行動や思考パターンが生まれる。成長の実感とともに次の段階への準備が整う。`,
                    relatedLearningStage: stage,
                    relatedConcept: conceptName
                };
        }
    }

    /**
     * プロンプト生成メソッド群
     */
    private createSynchronizationPrompt(
        content: string,
        conceptName: string,
        stage: LearningStage
    ): string {
        return `
あなたは感情と学習の同期分析専門家です。
以下の章内容において、感情的瞬間と学習ポイントの同期度を分析してください。

# 章内容
${content}

# 概念情報
・名前: ${conceptName}
・学習段階: ${this.formatLearningStage(stage)}

# 分析指示
以下の指標について、0から1の範囲で客観的に評価してください:

1. 感情ピークと学習ポイントの同期度 (peakSynchronization): 感情の高まりと認知的洞察の瞬間がどの程度一致しているか
2. 感情変化と理解進展の一致度 (progressionAlignment): 感情の変化曲線と概念理解の深まりがどの程度並行しているか
3. 感情的共鳴強度 (emotionalResonance): 読者がどの程度キャラクターの感情体験に共鳴できるか
4. テーマと感情の統合度 (themeEmotionIntegration): 概念のテーマと感情表現がどの程度統合されているか
5. カタルシス瞬間の効果 (catharticMomentEffect): 重要な気づきや転換点での感情的なカタルシスの効果

最後に、測定の信頼性を0から1で評価してください。

JSON形式で出力してください：
{
  "peakSynchronization": 値,
  "progressionAlignment": 値,
  "emotionalResonance": 値,
  "themeEmotionIntegration": 値,
  "catharticMomentEffect": 値,
  "measurementConfidence": 値
}
`;
    }

    private createEmpatheticPointsPrompt(
        content: string,
        conceptName: string,
        stage: LearningStage
    ): string {
        return `
あなたは物語の共感ポイント分析の専門家です。
以下の章内容から、読者が強く共感できるポイントを抽出してください。

# 章内容
${content}

# 概念情報
・名前: ${conceptName}
・学習段階: ${this.formatLearningStage(stage)}

# 分析指示
読者が共感しやすい瞬間を5つ抽出し、以下の情報を提供してください：
1. タイプ: character（キャラクターの内面）、situation（状況）、decision（決断）、realization（気づき）、transformation（変容）のいずれか
2. 位置: 章内での相対位置（0-1の数値、冒頭が0、結末が1）
3. 強度: 共感の強さ（0-1の数値）
4. 説明: 共感ポイントの簡潔な説明

JSON形式で出力してください：
{
  "points": [
    {
      "type": "タイプ",
      "position": 位置,
      "intensity": 強度,
      "description": "説明"
    },
    ...
  ]
}
`;
    }

    private createEmotionAnalysisPrompt(content: string, genre: string): string {
        return `
あなたは物語の感情分析の専門家です。
以下の章内容を分析し、感情的特徴を抽出してください。

# 章内容
${content}

# ジャンル
${genre}

# 分析指示
以下の情報を提供してください：
1. 全体のトーン
2. 感情的影響力 (1-10の数値)
3. 主要な感情次元の変化

JSON形式で出力してください：
{
  "overallTone": "全体のトーン",
  "emotionalImpact": 感情的影響力,
  "emotionalDimensions": {
    "hopeVsDespair": {"start": 値, "middle": 値, "end": 値},
    "comfortVsTension": {"start": 値, "middle": 値, "end": 値},
    "joyVsSadness": {"start": 値, "middle": 値, "end": 値}
  }
}
`;
    }

    /**
     * デフォルト値とバリデーション
     */
    private createDefaultSyncMetrics(): EmotionLearningSyncMetrics {
        return {
            peakSynchronization: 0.5,
            progressionAlignment: 0.5,
            emotionalResonance: 0.5,
            themeEmotionIntegration: 0.5,
            catharticMomentEffect: 0.4,
            measurementConfidence: 0.5
        };
    }

    private validateSyncMetrics(metrics: any): EmotionLearningSyncMetrics {
        const validateValue = (value: any, defaultValue: number): number => {
            if (typeof value !== 'number' || isNaN(value)) {
                return defaultValue;
            }
            return Math.max(0, Math.min(1, value));
        };

        return {
            peakSynchronization: validateValue(metrics.peakSynchronization, 0.5),
            progressionAlignment: validateValue(metrics.progressionAlignment, 0.5),
            emotionalResonance: validateValue(metrics.emotionalResonance, 0.5),
            themeEmotionIntegration: validateValue(metrics.themeEmotionIntegration, 0.5),
            catharticMomentEffect: validateValue(metrics.catharticMomentEffect, 0.4),
            measurementConfidence: validateValue(metrics.measurementConfidence, 0.5)
        };
    }

    private createDefaultEmpatheticPoints(stage: LearningStage): EmpatheticPoint[] {
        switch (stage) {
            case LearningStage.MISCONCEPTION:
                return [
                    {
                        type: 'character',
                        position: 0.2,
                        intensity: 0.7,
                        description: '自信過剰な判断が裏目に出た瞬間の当惑'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.6,
                        description: '誤った前提で行動した結果の失敗'
                    },
                    {
                        type: 'realization',
                        position: 0.8,
                        intensity: 0.5,
                        description: '何かが根本的に間違っているという気づきの芽生え'
                    }
                ];

            case LearningStage.EXPLORATION:
                return [
                    {
                        type: 'character',
                        position: 0.3,
                        intensity: 0.6,
                        description: '新たな視点に出会ったときの好奇心'
                    },
                    {
                        type: 'decision',
                        position: 0.5,
                        intensity: 0.7,
                        description: '従来の考え方を疑ってみる決断'
                    },
                    {
                        type: 'situation',
                        position: 0.7,
                        intensity: 0.6,
                        description: '異なる意見に耳を傾ける場面'
                    }
                ];

            case LearningStage.CONFLICT:
                return [
                    {
                        type: 'character',
                        position: 0.2,
                        intensity: 0.8,
                        description: '相反する価値観の間で揺れ動く内的葛藤'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.7,
                        description: '選択を迫られる重要な局面'
                    },
                    {
                        type: 'decision',
                        position: 0.8,
                        intensity: 0.9,
                        description: '葛藤を経て下す重要な決断'
                    }
                ];

            case LearningStage.INSIGHT:
                return [
                    {
                        type: 'character',
                        position: 0.4,
                        intensity: 0.7,
                        description: '理解の断片が繋がり始める高揚感'
                    },
                    {
                        type: 'realization',
                        position: 0.6,
                        intensity: 0.9,
                        description: '核心的な気づきが訪れる瞬間の衝撃'
                    },
                    {
                        type: 'transformation',
                        position: 0.8,
                        intensity: 0.8,
                        description: '新たな理解に基づく視点の変化'
                    }
                ];

            case LearningStage.APPLICATION:
                return [
                    {
                        type: 'character',
                        position: 0.3,
                        intensity: 0.6,
                        description: '新たな理解を試すときの不安と期待'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.7,
                        description: '実践を通じて手応えを感じる瞬間'
                    },
                    {
                        type: 'realization',
                        position: 0.8,
                        intensity: 0.8,
                        description: '理論と実践が結びついたときの充実感'
                    }
                ];

            case LearningStage.INTEGRATION:
                return [
                    {
                        type: 'character',
                        position: 0.3,
                        intensity: 0.7,
                        description: '概念が自然と身についていることに気づく瞬間'
                    },
                    {
                        type: 'transformation',
                        position: 0.6,
                        intensity: 0.8,
                        description: '以前の自分と現在の自分の違いを実感する深い変容'
                    },
                    {
                        type: 'situation',
                        position: 0.8,
                        intensity: 0.7,
                        description: '他者に自然と教えている自分を発見する場面'
                    }
                ];

            default:
                return [
                    {
                        type: 'character',
                        position: 0.3,
                        intensity: 0.6,
                        description: 'キャラクターの内面的な成長の瞬間'
                    },
                    {
                        type: 'realization',
                        position: 0.6,
                        intensity: 0.7,
                        description: '重要な気づきが得られる場面'
                    },
                    {
                        type: 'situation',
                        position: 0.8,
                        intensity: 0.6,
                        description: '理解が深まる状況'
                    }
                ];
        }
    }

    private generateSyncRecommendations(stage: LearningStage): string[] {
        switch (stage) {
            case LearningStage.MISCONCEPTION:
                return [
                    '誤解の限界に直面する場面での感情的フラストレーションを強調する',
                    '表面的な理解に基づく自信と、問題発生時の感情的動揺を連動させる'
                ];

            case LearningStage.EXPLORATION:
                return [
                    '新たな視点との出会いによる好奇心と感情的高揚を同期させる',
                    '探索過程での発見と期待感の感情を段階的に強化する'
                ];

            case LearningStage.CONFLICT:
                return [
                    '内的葛藤の感情的側面を理解の深化と連動させる',
                    '価値観の対立から生じる緊張感と、決断に向かう過程の感情変化を同期させる'
                ];

            case LearningStage.INSIGHT:
                return [
                    '気づきの瞬間と感情的カタルシスを完全に同期させる',
                    '理解の急激な広がりとともに、解放感や高揚感が訪れるよう設計する'
                ];

            case LearningStage.APPLICATION:
                return [
                    '実践過程での集中感や緊張感を、スキル向上と連動させる',
                    '成功体験がもたらす達成感と自信の感情的効果を強調する'
                ];

            case LearningStage.INTEGRATION:
                return [
                    '概念の自然な体現がもたらす調和感や安定感を表現する',
                    '以前の自分との対比を通じた成長の満足感と、創造的応用への意欲を連動させる'
                ];

            default:
                return [
                    '感情の変化と学習の進展を並行して描写する',
                    '重要な理解の瞬間に感情的な高まりを設計する'
                ];
        }
    }
}