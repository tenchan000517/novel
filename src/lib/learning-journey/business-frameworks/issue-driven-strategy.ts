/**
 * @fileoverview ISSUE DRIVEN感情戦略
 * @description 課題解決思考に特化した感情アーク設計と共感ポイント生成
 */

import { LearningStage } from '../concept-learning-manager';
import { EmotionalArcDesign, EmpatheticPoint } from '../emotional-types';
import { BusinessFrameworkEmotionalStrategy } from './base-strategy';

/**
 * ISSUE DRIVEN特化感情戦略クラス
 */
export class IssueDrivernEmotionalStrategy extends BusinessFrameworkEmotionalStrategy {
    constructor() {
        super('ISSUE_DRIVEN');
    }

    /**
     * ISSUE DRIVEN特化感情アークを作成
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @returns ISSUE DRIVEN特化感情アーク
     */
    createEmotionalArc(stage: LearningStage, chapterNumber: number): EmotionalArcDesign {
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
     * ISSUE DRIVEN特化共感ポイントを作成
     * @param stage 学習段階
     * @returns ISSUE DRIVEN特化共感ポイント配列
     */
    createEmpatheticPoints(stage: LearningStage): EmpatheticPoint[] {
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

            case LearningStage.APPLICATION:
            case LearningStage.THEORY_APPLICATION:
                return [
                    {
                        type: 'character',
                        position: 0.2,
                        intensity: 0.7,
                        description: '解決策実行時の責任感と緊張感'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.8,
                        description: '効果測定と改善のサイクルでの手応え'
                    },
                    {
                        type: 'realization',
                        position: 0.8,
                        intensity: 0.7,
                        description: '実践を通じた課題解決能力の向上実感'
                    }
                ];

            case LearningStage.INTEGRATION:
            case LearningStage.PRACTICAL_MASTERY:
                return [
                    {
                        type: 'character',
                        position: 0.3,
                        intensity: 0.8,
                        description: '課題発見が自然な習慣となった自信'
                    },
                    {
                        type: 'transformation',
                        position: 0.6,
                        intensity: 0.9,
                        description: '組織全体の問題解決に貢献する使命感'
                    },
                    {
                        type: 'situation',
                        position: 0.8,
                        intensity: 0.8,
                        description: '他者に課題解決思考を教える充実感'
                    }
                ];

            default:
                return this.createDefaultEmpatheticPoints(stage);
        }
    }

    /**
     * ISSUE DRIVEN特有のトーン強化を取得
     * @returns トーン強化文字列
     */
    protected getFrameworkSpecificToneEnhancement(): string {
        return " - 課題解決思考を重視";
    }
}