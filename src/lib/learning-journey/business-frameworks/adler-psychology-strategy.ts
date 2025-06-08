/**
 * @fileoverview アドラー心理学感情戦略
 * @description 勇気と共同体感覚に特化した感情アーク設計と共感ポイント生成
 */

import { LearningStage } from '../concept-learning-manager';
import { EmotionalArcDesign, EmpatheticPoint } from '../emotional-types';
import { BusinessFrameworkEmotionalStrategy } from './base-strategy';

/**
 * アドラー心理学特化感情戦略クラス
 */
export class AdlerPsychologyEmotionalStrategy extends BusinessFrameworkEmotionalStrategy {
    constructor() {
        super('ADLER_PSYCHOLOGY');
    }

    /**
     * アドラー心理学特化感情アークを作成
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @returns アドラー心理学特化感情アーク
     */
    createEmotionalArc(stage: LearningStage, chapterNumber: number): EmotionalArcDesign {
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
     * アドラー心理学特化共感ポイントを作成
     * @param stage 学習段階
     * @returns アドラー心理学特化共感ポイント配列
     */
    createEmpatheticPoints(stage: LearningStage): EmpatheticPoint[] {
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

            case LearningStage.APPLICATION:
            case LearningStage.THEORY_APPLICATION:
                return [
                    {
                        type: 'character',
                        position: 0.2,
                        intensity: 0.8,
                        description: '実際に勇気ある行動を取る時の緊張と決意'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.9,
                        description: '他者貢献を実践した時の深い満足感'
                    },
                    {
                        type: 'realization',
                        position: 0.8,
                        intensity: 0.8,
                        description: '人間関係が改善した時の驚きと喜び'
                    }
                ];

            case LearningStage.INTEGRATION:
            case LearningStage.PRACTICAL_MASTERY:
                return [
                    {
                        type: 'character',
                        position: 0.3,
                        intensity: 0.9,
                        description: '勇気が自然な生き方となった安定感'
                    },
                    {
                        type: 'transformation',
                        position: 0.6,
                        intensity: 0.9,
                        description: '共同体感覚に基づく豊かな人生の実感'
                    },
                    {
                        type: 'situation',
                        position: 0.8,
                        intensity: 0.8,
                        description: '他者に勇気を与える存在となった充実感'
                    }
                ];

            default:
                return this.createDefaultEmpatheticPoints(stage);
        }
    }

    /**
     * アドラー心理学特有のトーン強化を取得
     * @returns トーン強化文字列
     */
    protected getFrameworkSpecificToneEnhancement(): string {
        return " - 勇気と共同体感覚を強調";
    }
}