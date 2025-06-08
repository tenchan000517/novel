/**
 * @fileoverview ビジネスフレームワーク感情戦略 - 基底クラス
 * @description 各ビジネスフレームワークの感情戦略実装の基底となる抽象クラス
 */

import { LearningStage } from '../concept-learning-manager';
import { 
    EmotionalArcDesign, 
    EmpatheticPoint, 
    BusinessFrameworkName,
    EmotionalDimension 
} from '../emotional-types';

/**
 * ビジネスフレームワーク感情戦略の抽象基底クラス
 */
export abstract class BusinessFrameworkEmotionalStrategy {
    protected readonly frameworkName: BusinessFrameworkName;

    constructor(frameworkName: BusinessFrameworkName) {
        this.frameworkName = frameworkName;
    }

    /**
     * フレームワーク特化感情アークを作成（抽象メソッド）
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @returns 感情アーク設計
     */
    abstract createEmotionalArc(
        stage: LearningStage, 
        chapterNumber: number
    ): EmotionalArcDesign;

    /**
     * フレームワーク特化共感ポイントを作成（抽象メソッド）
     * @param stage 学習段階
     * @returns 共感ポイント配列
     */
    abstract createEmpatheticPoints(stage: LearningStage): EmpatheticPoint[];

    /**
     * ビジネス学習段階に応じた感情アークの強化（共通実装）
     * @param emotionalArc 基本感情アーク
     * @param stage 学習段階
     * @returns 強化された感情アーク
     */
    protected enhanceEmotionalArcForBusinessStage(
        emotionalArc: EmotionalArcDesign,
        stage: LearningStage
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
                enhancedArc.reason += ` ${this.frameworkName}導入段階として学習意欲を促進。`;
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
        enhancedArc.recommendedTone += this.getFrameworkSpecificToneEnhancement();

        return enhancedArc;
    }

    /**
     * ビジネス学習段階特化共感ポイントを作成（共通実装）
     * @param stage 学習段階
     * @returns ビジネス段階特化共感ポイント
     */
    protected createBusinessStageEmpatheticPoints(stage: LearningStage): EmpatheticPoint[] {
        const basePoints: EmpatheticPoint[] = [];

        switch (stage) {
            case LearningStage.INTRODUCTION:
                basePoints.push({
                    type: 'character',
                    position: 0.1,
                    intensity: 0.6,
                    description: `${this.frameworkName}という新しい概念への好奇心と期待`
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
     * フレームワーク特有のトーン強化を取得（抽象メソッド）
     * @returns フレームワーク特有のトーン強化文字列
     */
    protected abstract getFrameworkSpecificToneEnhancement(): string;

    /**
     * デフォルトの感情アークを作成（共通実装）
     * @returns デフォルト感情アーク
     */
    protected createDefaultEmotionalArc(): EmotionalArcDesign {
        return {
            recommendedTone: `${this.frameworkName}のバランスのとれた学習トーン`,
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
            reason: `${this.frameworkName}における基本的な学習感情の流れを表現`
        };
    }

    /**
     * デフォルトの共感ポイントを作成（共通実装）
     * @param stage 学習段階
     * @returns デフォルト共感ポイント配列
     */
    protected createDefaultEmpatheticPoints(stage: LearningStage): EmpatheticPoint[] {
        return [
            {
                type: 'character',
                position: 0.3,
                intensity: 0.6,
                description: `${this.frameworkName}学習過程での内面的な成長`
            },
            {
                type: 'realization',
                position: 0.6,
                intensity: 0.7,
                description: `${this.frameworkName}に関する重要な気づき`
            },
            {
                type: 'situation',
                position: 0.8,
                intensity: 0.6,
                description: `${this.frameworkName}理解が深まる状況`
            }
        ];
    }

    /**
     * フレームワーク名を取得
     * @returns フレームワーク名
     */
    public getFrameworkName(): BusinessFrameworkName {
        return this.frameworkName;
    }
}

/**
 * ビジネスフレームワーク戦略ファクトリー
 */
export interface BusinessFrameworkStrategyFactory {
    /**
     * 指定されたフレームワーク名に対応する戦略インスタンスを作成
     * @param frameworkName フレームワーク名
     * @returns 戦略インスタンス
     */
    createStrategy(frameworkName: BusinessFrameworkName): BusinessFrameworkEmotionalStrategy;

    /**
     * サポートされているフレームワーク名の一覧を取得
     * @returns サポートされているフレームワーク名配列
     */
    getSupportedFrameworks(): BusinessFrameworkName[];
}