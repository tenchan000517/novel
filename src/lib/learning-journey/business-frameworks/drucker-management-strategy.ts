/**
 * @fileoverview ドラッカーマネジメント感情戦略
 * @description 効果性と継続革新に特化した感情アーク設計と共感ポイント生成
 */

import { LearningStage } from '../concept-learning-manager';
import { EmotionalArcDesign, EmpatheticPoint } from '../emotional-types';
import { BusinessFrameworkEmotionalStrategy } from './base-strategy';

/**
 * ドラッカーマネジメント特化感情戦略クラス
 */
export class DruckerManagementEmotionalStrategy extends BusinessFrameworkEmotionalStrategy {
    constructor() {
        super('DRUCKER_MANAGEMENT');
    }

    /**
     * ドラッカーマネジメント特化感情アークを作成
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @returns ドラッカーマネジメント特化感情アーク
     */
    createEmotionalArc(stage: LearningStage, chapterNumber: number): EmotionalArcDesign {
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
     * ドラッカーマネジメント特化共感ポイントを作成
     * @param stage 学習段階
     * @returns ドラッカーマネジメント特化共感ポイント配列
     */
    createEmpatheticPoints(stage: LearningStage): EmpatheticPoint[] {
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

            case LearningStage.APPLICATION:
            case LearningStage.THEORY_APPLICATION:
                return [
                    {
                        type: 'character',
                        position: 0.2,
                        intensity: 0.8,
                        description: 'マネジメント理論を実践する責任感と意欲'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.9,
                        description: '組織の成果向上を実感する達成感'
                    },
                    {
                        type: 'realization',
                        position: 0.8,
                        intensity: 0.8,
                        description: 'マネジメントの影響力の大きさへの認識'
                    }
                ];

            case LearningStage.INTEGRATION:
            case LearningStage.PRACTICAL_MASTERY:
                return [
                    {
                        type: 'character',
                        position: 0.3,
                        intensity: 0.9,
                        description: '効果性思考が自然となったマネジメントの自信'
                    },
                    {
                        type: 'transformation',
                        position: 0.6,
                        intensity: 0.9,
                        description: '組織と社会の発展に貢献する使命感'
                    },
                    {
                        type: 'situation',
                        position: 0.8,
                        intensity: 0.8,
                        description: '次世代マネジャーを育成する充実感'
                    }
                ];

            default:
                return this.createDefaultEmpatheticPoints(stage);
        }
    }

    /**
     * ドラッカーマネジメント特有のトーン強化を取得
     * @returns トーン強化文字列
     */
    protected getFrameworkSpecificToneEnhancement(): string {
        return " - 効果性と継続革新を重視";
    }
}