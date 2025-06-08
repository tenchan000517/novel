/**
 * @fileoverview 感情アーク設計エンジン
 * @description プロット統合、キャラクター発達、学習段階を考慮した感情アーク設計
 */

import { logger } from '@/lib/utils/logger';
import { LearningStage } from '../concept-learning-manager';
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { MemoryLevel } from '@/lib/memory/core/types';
import {
    EmotionalArcDesign,
    EmotionalDimension,
    TripleIntegrationResult,
    EmotionalLearningIntegratorConfig
} from '../emotional-types';
import { safeMemoryOperation } from './memory-operations';

/**
 * 感情アーク設計エンジンクラス
 */
export class EmotionalArcDesigner {
    constructor(
        private memoryManager: MemoryManager,
        private config: Required<EmotionalLearningIntegratorConfig>
    ) {}

    /**
     * 学習段階に適した感情アークを設計する（プロット・キャラクター統合強化版）
     * @param conceptName 概念名
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @returns 統合された感情アーク設計
     */
    async designIntegratedEmotionalArc(
        conceptName: string,
        stage: LearningStage,
        chapterNumber: number
    ): Promise<EmotionalArcDesign> {
        try {
            logger.info(`Designing integrated emotional arc for concept ${conceptName} at stage ${stage}`);

            // プロット統合情報を取得
            const plotIntegrationResult = await safeMemoryOperation(
                this.memoryManager,
                () => this.memoryManager.unifiedSearch(
                    `plot context chapter ${chapterNumber} tension emotion`,
                    [MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
                ),
                { success: false, totalResults: 0, processingTime: 0, results: [], suggestions: [] },
                'getPlotIntegrationForEmotionalArc',
                this.config
            );

            // キャラクター発達情報を取得
            const characterDevelopmentResult = await safeMemoryOperation(
                this.memoryManager,
                () => this.memoryManager.unifiedSearch(
                    `character development psychology emotion chapter ${chapterNumber}`,
                    [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
                ),
                { success: false, totalResults: 0, processingTime: 0, results: [], suggestions: [] },
                'getCharacterDevelopmentForEmotionalArc',
                this.config
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

            // 統合結果を感情アークに反映
            emotionalArc.reason += ` 統合度: ${(tripleIntegrationResult.integrationScore * 100).toFixed(1)}%`;

            return emotionalArc;

        } catch (error) {
            logger.error(`Failed to design integrated emotional arc for ${conceptName}`, { error });
            return this.createDefaultEmotionalArc();
        }
    }

    /**
     * 学習段階に応じた基本感情アークを作成
     * @param stage 学習段階
     * @returns 基本感情アーク
     */
    createStageBasedEmotionalArc(stage: LearningStage): EmotionalArcDesign {
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

            // ビジネス学習段階
            case LearningStage.INTRODUCTION:
                return {
                    recommendedTone: "関心と期待の醸成",
                    emotionalJourney: {
                        opening: [
                            { dimension: "関心", level: 6 },
                            { dimension: "期待", level: 5 }
                        ],
                        development: [
                            { dimension: "理解", level: 7 },
                            { dimension: "興味", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "学習意欲", level: 8 },
                            { dimension: "次段階への期待", level: 7 }
                        ]
                    },
                    reason: "導入段階では、概念への関心を育み、本格的な学習への動機を形成"
                };

            case LearningStage.THEORY_APPLICATION:
                return {
                    recommendedTone: "理論と実践の架け橋",
                    emotionalJourney: {
                        opening: [
                            { dimension: "理解", level: 7 },
                            { dimension: "実践意欲", level: 6 }
                        ],
                        development: [
                            { dimension: "試行錯誤", level: 7 },
                            { dimension: "発見", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "手応え", level: 8 },
                            { dimension: "自信", level: 7 }
                        ]
                    },
                    reason: "理論適用段階では、知識を実践に移す過程での発見と手応えを表現"
                };

            case LearningStage.FAILURE_EXPERIENCE:
                return {
                    recommendedTone: "建設的な失敗からの学び",
                    emotionalJourney: {
                        opening: [
                            { dimension: "挑戦", level: 7 },
                            { dimension: "期待", level: 6 }
                        ],
                        development: [
                            { dimension: "困難", level: 8 },
                            { dimension: "学びへの転換", level: 7 }
                        ],
                        conclusion: [
                            { dimension: "成長実感", level: 9 },
                            { dimension: "新たな理解", level: 8 }
                        ]
                    },
                    reason: "失敗体験段階では、困難を乗り越えることで得られる深い学びと成長を表現"
                };

            case LearningStage.PRACTICAL_MASTERY:
                return {
                    recommendedTone: "習熟と指導への発展",
                    emotionalJourney: {
                        opening: [
                            { dimension: "熟練", level: 8 },
                            { dimension: "応用力", level: 9 }
                        ],
                        development: [
                            { dimension: "創造的応用", level: 9 },
                            { dimension: "指導への意欲", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "習熟の満足", level: 9 },
                            { dimension: "貢献の喜び", level: 8 }
                        ]
                    },
                    reason: "実践習熟段階では、高度な応用力と他者への指導による貢献の喜びを表現"
                };

            default:
                return this.createDefaultEmotionalArc();
        }
    }

    /**
     * プロット統合による感情アークの強化
     * @param emotionalArc 基本感情アーク
     * @param plotIntegrationResult プロット統合結果
     * @param stage 学習段階
     * @returns 強化された感情アーク
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
                            level: Math.min(8, dim.level + 1)
                        }));
                        break;
                    case 'rising_action':
                        enhancedArc.emotionalJourney.development = enhancedArc.emotionalJourney.development.map(dim => ({
                            ...dim,
                            level: Math.min(10, dim.level + 2)
                        }));
                        break;
                    case 'climax':
                        enhancedArc.emotionalJourney.conclusion = enhancedArc.emotionalJourney.conclusion.map(dim => ({
                            ...dim,
                            level: Math.min(10, dim.level + 3)
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
     * @param emotionalArc 基本感情アーク
     * @param characterDevelopmentResult キャラクター発達結果
     * @param stage 学習段階
     * @returns 調整された感情アーク
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

                if (characterData.developmentStage >= 5) {
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
     * @param emotionalArc 感情アーク
     * @param plotResult プロット結果
     * @param characterResult キャラクター結果
     * @param conceptName 概念名
     * @param stage 学習段階
     * @returns 三者統合結果
     */
    private async performTripleIntegrationSync(
        emotionalArc: EmotionalArcDesign,
        plotResult: any,
        characterResult: any,
        conceptName: string,
        stage: LearningStage
    ): Promise<TripleIntegrationResult> {
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

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

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

    private calculateDevelopmentModifier(developmentStage: number, learningStage: LearningStage): number {
        try {
            const stageOrder = this.getStageOrder(learningStage);
            const expectedDevelopment = stageOrder * 1.5;
            const difference = developmentStage - expectedDevelopment;

            return Math.max(-2, Math.min(2, Math.round(difference / 2)));
        } catch (error) {
            return 0;
        }
    }

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

    private calculateStageEmotionAlignment(emotionalArc: EmotionalArcDesign, stage: LearningStage): number {
        try {
            const expectedEmotions: Record<LearningStage, string[]> = {
                [LearningStage.MISCONCEPTION]: ['自信', '混乱', 'フラストレーション'],
                [LearningStage.EXPLORATION]: ['好奇心', '発見', '期待'],
                [LearningStage.CONFLICT]: ['葛藤', '緊張', '決断'],
                [LearningStage.INSIGHT]: ['驚き', '興奮', '解放感'],
                [LearningStage.APPLICATION]: ['自信', '集中', '達成感'],
                [LearningStage.INTEGRATION]: ['調和', '満足感', '創造性'],
                [LearningStage.INTRODUCTION]: ['関心', '期待', '学習意欲'],
                [LearningStage.THEORY_APPLICATION]: ['実践意欲', '緊張感', '集中'],
                [LearningStage.FAILURE_EXPERIENCE]: ['挑戦', '学び', '成長実感'],
                [LearningStage.PRACTICAL_MASTERY]: ['自信', '応用力', '指導力']
            };

            const expected = expectedEmotions[stage] || [];
            if (expected.length === 0) return 0.5;

            const actualDimensions = [
                ...emotionalArc.emotionalJourney.opening,
                ...emotionalArc.emotionalJourney.development,
                ...emotionalArc.emotionalJourney.conclusion
            ].map(dim => dim.dimension);

            const matches = expected.filter(exp =>
                actualDimensions.some(actual => actual.includes(exp) || exp.includes(actual))
            );

            return matches.length / expected.length;
        } catch (error) {
            return 0.5;
        }
    }

    private getStageOrder(stage: LearningStage): number {
        const stageOrder: Record<LearningStage, number> = {
            [LearningStage.MISCONCEPTION]: 1,
            [LearningStage.EXPLORATION]: 2,
            [LearningStage.CONFLICT]: 3,
            [LearningStage.INSIGHT]: 4,
            [LearningStage.APPLICATION]: 5,
            [LearningStage.INTEGRATION]: 6,
            [LearningStage.INTRODUCTION]: 1,
            [LearningStage.THEORY_APPLICATION]: 2,
            [LearningStage.FAILURE_EXPERIENCE]: 3,
            [LearningStage.PRACTICAL_MASTERY]: 4
        };

        return stageOrder[stage] || 0;
    }

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
}