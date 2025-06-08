/**
 * @fileoverview ソクラテス式対話感情戦略
 * @description 問いかけによる自発的発見に特化した感情アーク設計と共感ポイント生成
 */

import { LearningStage } from '../concept-learning-manager';
import { EmotionalArcDesign, EmpatheticPoint } from '../emotional-types';
import { BusinessFrameworkEmotionalStrategy } from './base-strategy';

/**
 * ソクラテス式対話特化感情戦略クラス
 */
export class SocraticDialogueEmotionalStrategy extends BusinessFrameworkEmotionalStrategy {
    constructor() {
        super('SOCRATIC_DIALOGUE');
    }

    /**
     * ソクラテス式対話特化感情アークを作成
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @returns ソクラテス式対話特化感情アーク
     */
    createEmotionalArc(stage: LearningStage, chapterNumber: number): EmotionalArcDesign {
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
     * ソクラテス式対話特化共感ポイントを作成
     * @param stage 学習段階
     * @returns ソクラテス式対話特化共感ポイント配列
     */
    createEmpatheticPoints(stage: LearningStage): EmpatheticPoint[] {
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

            case LearningStage.APPLICATION:
            case LearningStage.THEORY_APPLICATION:
                return [
                    {
                        type: 'character',
                        position: 0.2,
                        intensity: 0.7,
                        description: '他者との対話で問いかけ技術を実践する緊張感'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.8,
                        description: '相互学習による新たな発見の喜び'
                    },
                    {
                        type: 'realization',
                        position: 0.8,
                        intensity: 0.8,
                        description: '対話の力による共同探求の価値への理解'
                    }
                ];

            case LearningStage.INTEGRATION:
            case LearningStage.PRACTICAL_MASTERY:
                return [
                    {
                        type: 'character',
                        position: 0.3,
                        intensity: 0.8,
                        description: '問いかけることが自然になった知的成熟'
                    },
                    {
                        type: 'transformation',
                        position: 0.6,
                        intensity: 0.9,
                        description: '生涯学習者としての確固たるアイデンティティ'
                    },
                    {
                        type: 'situation',
                        position: 0.8,
                        intensity: 0.8,
                        description: '他者に問いかけの技法を教える充実感'
                    }
                ];

            default:
                return this.createDefaultEmpatheticPoints(stage);
        }
    }

    /**
     * ソクラテス式対話特有のトーン強化を取得
     * @returns トーン強化文字列
     */
    protected getFrameworkSpecificToneEnhancement(): string {
        return " - 自発的発見を促進";
    }
}