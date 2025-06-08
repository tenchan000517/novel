/**
 * @fileoverview カタルシス体験設計器
 * @description 学習段階に応じた感情的カタルシス体験の設計と最適化
 */

import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { LearningStage } from '../concept-learning-manager';
import {
    CatharticExperience,
    EmotionalLearningIntegratorConfig,
    AIAnalysisOptions
} from '../emotional-types';
import { createCatharticExperiencePrompt } from './prompt-generators';
import { parseCatharticExperienceResponse } from './validation-helpers';

/**
 * カタルシス体験設計器クラス
 */
export class CatharticExperienceDesigner {
    constructor(
        private geminiClient: GeminiClient,
        private config: Required<EmotionalLearningIntegratorConfig>
    ) {}

    /**
     * カタルシス体験を設計する
     * @param conceptName 概念名
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @param content 章内容（オプション）
     * @returns カタルシス体験の設計
     */
    async designCatharticExperience(
        conceptName: string,
        stage: LearningStage,
        chapterNumber: number,
        content?: string
    ): Promise<CatharticExperience | null> {
        try {
            // カタルシスが適切な学習段階かチェック
            if (!this.isCatharticAppropriateForStage(stage)) {
                logger.info(`Cathartic experience not appropriate for stage ${stage}, skipping design`);
                return null;
            }

            logger.info(`Designing cathartic experience for ${conceptName} at stage ${stage}`);

            // コンテンツベースの分析（利用可能な場合）
            let aiAnalyzedExperiences: CatharticExperience[] = [];
            if (content && this.config.enableAdvancedAnalysis) {
                aiAnalyzedExperiences = await this.analyzeContentForCatharsis(content, conceptName, stage);
            }

            // 学習段階に適したカタルシス体験を生成
            const stageBasedExperience = this.createStageBasedCatharticExperience(conceptName, stage);

            // AI分析結果との統合
            const integratedExperience = this.integrateAIAnalysisWithStageDesign(
                stageBasedExperience,
                aiAnalyzedExperiences
            );

            // カタルシス体験の強化と最適化
            const optimizedExperience = this.optimizeCatharticExperience(integratedExperience, stage);

            return optimizedExperience;

        } catch (error) {
            logger.error(`Failed to design cathartic experience for ${conceptName}`, { error });
            return null;
        }
    }

    /**
     * 複数のカタルシス体験候補から最適なものを選択
     * @param experiences カタルシス体験候補配列
     * @param stage 学習段階
     * @returns 最適化されたカタルシス体験
     */
    selectOptimalCatharticExperience(
        experiences: CatharticExperience[],
        stage: LearningStage
    ): CatharticExperience | null {
        if (experiences.length === 0) return null;
        if (experiences.length === 1) return experiences[0];

        // スコアリング基準
        const scoredExperiences = experiences.map(exp => ({
            experience: exp,
            score: this.calculateCatharticScore(exp, stage)
        }));

        // 最高スコアの体験を選択
        scoredExperiences.sort((a, b) => b.score - a.score);
        return scoredExperiences[0].experience;
    }

    /**
     * カタルシス体験の品質評価
     * @param experience カタルシス体験
     * @param stage 学習段階
     * @returns 品質スコア (0-1)
     */
    evaluateCatharticQuality(experience: CatharticExperience, stage: LearningStage): number {
        const factors = {
            stageAppropriatenessScore: this.calculateStageAppropriatenessScore(experience, stage),
            intensityScore: this.calculateIntensityScore(experience),
            narrativeQualityScore: this.calculateNarrativeQualityScore(experience),
            emotionalResonanceScore: this.calculateEmotionalResonanceScore(experience),
            learningAlignmentScore: this.calculateLearningAlignmentScore(experience, stage)
        };

        // 重み付き平均
        return (
            factors.stageAppropriatenessScore * 0.25 +
            factors.intensityScore * 0.2 +
            factors.narrativeQualityScore * 0.2 +
            factors.emotionalResonanceScore * 0.2 +
            factors.learningAlignmentScore * 0.15
        );
    }

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

    /**
     * 学習段階がカタルシス体験に適しているかを判断
     * @param stage 学習段階
     * @returns カタルシス適用可能な場合true
     */
    private isCatharticAppropriateForStage(stage: LearningStage): boolean {
        // カタルシスが効果的な学習段階
        const catharticStages = [
            LearningStage.INSIGHT,
            LearningStage.APPLICATION,
            LearningStage.INTEGRATION,
            LearningStage.THEORY_APPLICATION,
            LearningStage.FAILURE_EXPERIENCE,
            LearningStage.PRACTICAL_MASTERY
        ];

        return catharticStages.includes(stage);
    }

    /**
     * コンテンツからカタルシス体験を分析
     * @param content 章内容
     * @param conceptName 概念名
     * @param stage 学習段階
     * @returns AI分析されたカタルシス体験配列
     */
    private async analyzeContentForCatharsis(
        content: string,
        conceptName: string,
        stage: LearningStage
    ): Promise<CatharticExperience[]> {
        try {
            const truncatedContent = this.safeContentTruncation(content, 4000);
            const prompt = createCatharticExperiencePrompt(truncatedContent, conceptName, stage);

            const response = await this.executeAIAnalysis(prompt, {
                temperature: 0.2,
                responseFormat: 'json'
            });

            return parseCatharticExperienceResponse(response, conceptName, stage);
        } catch (error) {
            logger.warn('Failed to analyze content for catharsis', { error });
            return [];
        }
    }

    /**
     * 学習段階に応じたカタルシス体験を作成
     * @param conceptName 概念名
     * @param stage 学習段階
     * @returns 段階ベースのカタルシス体験
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

            case LearningStage.THEORY_APPLICATION:
                return {
                    type: 'intellectual',
                    intensity: 0.6,
                    trigger: `理論を現実に適用する瞬間の発見`,
                    buildup: [
                        '理論的知識を実践場面で試す',
                        '理論と現実のギャップに戸惑う',
                        '調整と工夫を重ねる過程',
                        '理論が現実に適用できる瞬間を捉える'
                    ],
                    peakMoment: `${conceptName}の理論が現実の問題解決に見事に適用できた瞬間。知識が生きた力として働く実感と、理論の価値への深い理解。`,
                    aftermath: `理論的理解と実践的応用が統合され、${conceptName}を現実の様々な場面で活用できる自信が生まれる。`,
                    relatedLearningStage: stage,
                    relatedConcept: conceptName
                };

            case LearningStage.FAILURE_EXPERIENCE:
                return {
                    type: 'moral',
                    intensity: 0.8,
                    trigger: `失敗を通じた深い学びの発見`,
                    buildup: [
                        '期待を持って挑戦する',
                        '予想外の困難や失敗に直面する',
                        '失敗の原因を深く分析する',
                        '失敗の中に隠された価値ある学びを発見する'
                    ],
                    peakMoment: `失敗体験が${conceptName}の真の理解への扉を開く瞬間。痛みを伴う経験が、かけがえのない洞察と成長をもたらす深い感動。`,
                    aftermath: `失敗への恐れが学びへの意欲に変わり、${conceptName}に対するより深く実践的な理解が得られる。困難を乗り越える自信も獲得する。`,
                    relatedLearningStage: stage,
                    relatedConcept: conceptName
                };

            case LearningStage.PRACTICAL_MASTERY:
                return {
                    type: 'transformative',
                    intensity: 0.9,
                    trigger: `習熟による創造的応用の瞬間`,
                    buildup: [
                        '基本的な応用に熟練する',
                        '様々な状況での応用を経験する',
                        '創造的なアレンジや発展を試みる',
                        '他者に指導する機会を得る'
                    ],
                    peakMoment: `${conceptName}を創造的に発展させ、独自のアプローチを生み出した瞬間。習得者から創造者へと変容する深い充実感と誇り。`,
                    aftermath: `${conceptName}の真のマスターとなり、概念を発展させ他者に伝える使命感と能力を獲得する。学習者から教育者への完全な変容。`,
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
     * AI分析結果と段階設計の統合
     * @param stageExperience 段階ベース体験
     * @param aiExperiences AI分析体験配列
     * @returns 統合されたカタルシス体験
     */
    private integrateAIAnalysisWithStageDesign(
        stageExperience: CatharticExperience,
        aiExperiences: CatharticExperience[]
    ): CatharticExperience {
        if (aiExperiences.length === 0) {
            return stageExperience;
        }

        // 最も適切なAI分析結果を選択
        const bestAIExperience = aiExperiences.reduce((best, current) => 
            current.intensity > best.intensity ? current : best
        );

        // 統合戦略: ベースは段階設計、AI分析で強化
        return {
            ...stageExperience,
            trigger: this.enhanceTriggerWithAI(stageExperience.trigger, bestAIExperience.trigger),
            buildup: this.enhanceBuildupWithAI(stageExperience.buildup, bestAIExperience.buildup),
            peakMoment: this.enhancePeakMomentWithAI(stageExperience.peakMoment, bestAIExperience.peakMoment),
            intensity: Math.max(stageExperience.intensity, bestAIExperience.intensity * 0.8)
        };
    }

    /**
     * カタルシス体験の最適化
     * @param experience カタルシス体験
     * @param stage 学習段階
     * @returns 最適化されたカタルシス体験
     */
    private optimizeCatharticExperience(
        experience: CatharticExperience,
        stage: LearningStage
    ): CatharticExperience {
        const optimized = { ...experience };

        // 学習段階に応じた強度調整
        optimized.intensity = this.adjustIntensityForStage(experience.intensity, stage);

        // ビルドアップの最適化
        optimized.buildup = this.optimizeBuildupSequence(experience.buildup, stage);

        // ピーク瞬間の強化
        optimized.peakMoment = this.enhancePeakMoment(experience.peakMoment, stage);

        return optimized;
    }

    /**
     * カタルシススコアの計算
     * @param experience カタルシス体験
     * @param stage 学習段階
     * @returns スコア (0-1)
     */
    private calculateCatharticScore(experience: CatharticExperience, stage: LearningStage): number {
        return this.evaluateCatharticQuality(experience, stage);
    }

    /**
     * 段階適切性スコアの計算
     * @param experience カタルシス体験
     * @param stage 学習段階
     * @returns 段階適切性スコア (0-1)
     */
    private calculateStageAppropriatenessScore(experience: CatharticExperience, stage: LearningStage): number {
        // 段階とタイプの適合度マトリックス
        const stageTypeMatch: Record<LearningStage, Array<CatharticExperience['type']>> = {
            [LearningStage.INSIGHT]: ['intellectual', 'emotional'],
            [LearningStage.APPLICATION]: ['emotional', 'transformative'],
            [LearningStage.INTEGRATION]: ['transformative', 'intellectual'],
            [LearningStage.THEORY_APPLICATION]: ['intellectual'],
            [LearningStage.FAILURE_EXPERIENCE]: ['moral', 'emotional'],
            [LearningStage.PRACTICAL_MASTERY]: ['transformative'],
            // その他の段階はデフォルト
            [LearningStage.MISCONCEPTION]: ['emotional'],
            [LearningStage.EXPLORATION]: ['intellectual'],
            [LearningStage.CONFLICT]: ['moral'],
            [LearningStage.INTRODUCTION]: ['emotional']
        };

        const appropriateTypes = stageTypeMatch[stage] || ['intellectual'];
        return appropriateTypes.includes(experience.type) ? 1.0 : 0.5;
    }

    /**
     * 強度スコアの計算
     * @param experience カタルシス体験
     * @returns 強度スコア (0-1)
     */
    private calculateIntensityScore(experience: CatharticExperience): number {
        // 0.6-0.9の範囲が理想的
        const idealMin = 0.6;
        const idealMax = 0.9;
        
        if (experience.intensity >= idealMin && experience.intensity <= idealMax) {
            return 1.0;
        } else if (experience.intensity < idealMin) {
            return experience.intensity / idealMin;
        } else {
            return idealMax / experience.intensity;
        }
    }

    /**
     * 物語品質スコアの計算
     * @param experience カタルシス体験
     * @returns 物語品質スコア (0-1)
     */
    private calculateNarrativeQualityScore(experience: CatharticExperience): number {
        let score = 0;

        // ビルドアップの質
        if (experience.buildup.length >= 3 && experience.buildup.length <= 6) {
            score += 0.3;
        }

        // ピーク瞬間の描写の質
        if (experience.peakMoment.length >= 50 && experience.peakMoment.length <= 200) {
            score += 0.3;
        }

        // 余韻の質
        if (experience.aftermath.length >= 30 && experience.aftermath.length <= 150) {
            score += 0.2;
        }

        // トリガーの明確性
        if (experience.trigger.length >= 10 && experience.trigger.length <= 100) {
            score += 0.2;
        }

        return Math.min(1.0, score);
    }

    /**
     * 感情共鳴スコアの計算
     * @param experience カタルシス体験
     * @returns 感情共鳴スコア (0-1)
     */
    private calculateEmotionalResonanceScore(experience: CatharticExperience): number {
        const emotionWords = ['感動', '喜び', '驚き', '満足', '感激', '興奮', '安心', '達成', '充実', '誇り'];
        const allText = [
            experience.trigger,
            ...experience.buildup,
            experience.peakMoment,
            experience.aftermath
        ].join(' ');

        const emotionCount = emotionWords.filter(word => allText.includes(word)).length;
        return Math.min(1.0, emotionCount / 5); // 5個以上で満点
    }

    /**
     * 学習整合スコアの計算
     * @param experience カタルシス体験
     * @param stage 学習段階
     * @returns 学習整合スコア (0-1)
     */
    private calculateLearningAlignmentScore(experience: CatharticExperience, stage: LearningStage): number {
        const learningWords = ['理解', '学習', '発見', '気づき', '成長', '習得', '応用', '実践'];
        const conceptText = experience.peakMoment + ' ' + experience.aftermath;
        
        const learningCount = learningWords.filter(word => conceptText.includes(word)).length;
        return Math.min(1.0, learningCount / 4); // 4個以上で満点
    }

    // 強化・最適化メソッド群
    private enhanceTriggerWithAI(baseTrigger: string, aiTrigger: string): string {
        return `${baseTrigger}（${aiTrigger}の要素を含む）`;
    }

    private enhanceBuildupWithAI(baseBuildup: string[], aiBuildup: string[]): string[] {
        const combined = [...baseBuildup];
        if (aiBuildup.length > 0) {
            combined.push(`AI分析要素: ${aiBuildup[0]}`);
        }
        return combined;
    }

    private enhancePeakMomentWithAI(basePeak: string, aiPeak: string): string {
        return `${basePeak} ${aiPeak ? `（${aiPeak.substring(0, 50)}...の洞察を含む）` : ''}`;
    }

    private adjustIntensityForStage(intensity: number, stage: LearningStage): number {
        const stageMultipliers: Record<LearningStage, number> = {
            [LearningStage.INSIGHT]: 1.1,
            [LearningStage.PRACTICAL_MASTERY]: 1.05,
            [LearningStage.INTEGRATION]: 1.0,
            [LearningStage.FAILURE_EXPERIENCE]: 0.95,
            [LearningStage.APPLICATION]: 0.9,
            [LearningStage.THEORY_APPLICATION]: 0.85,
            [LearningStage.MISCONCEPTION]: 0.8,
            [LearningStage.EXPLORATION]: 0.8,
            [LearningStage.CONFLICT]: 0.9,
            [LearningStage.INTRODUCTION]: 0.7
        };

        const multiplier = stageMultipliers[stage] || 1.0;
        return Math.max(0.1, Math.min(1.0, intensity * multiplier));
    }

    private optimizeBuildupSequence(buildup: string[], stage: LearningStage): string[] {
        // 学習段階に応じたビルドアップの最適化
        return buildup.map((step, index) => {
            const stageContext = this.getStageContext(stage);
            return `${step}${index === buildup.length - 1 ? ` - ${stageContext}` : ''}`;
        });
    }

    private enhancePeakMoment(peakMoment: string, stage: LearningStage): string {
        const stageEnhancement = this.getStageEnhancement(stage);
        return `${peakMoment} ${stageEnhancement}`;
    }

    private getStageContext(stage: LearningStage): string {
        const contexts: Record<LearningStage, string> = {
            [LearningStage.INSIGHT]: '深い洞察への準備',
            [LearningStage.APPLICATION]: '実践への移行',
            [LearningStage.INTEGRATION]: '統合への成熟',
            [LearningStage.THEORY_APPLICATION]: '理論適用の準備',
            [LearningStage.FAILURE_EXPERIENCE]: '失敗からの学びへの転換',
            [LearningStage.PRACTICAL_MASTERY]: '習熟の完成',
            [LearningStage.MISCONCEPTION]: '認識の転換',
            [LearningStage.EXPLORATION]: '探求の深化',
            [LearningStage.CONFLICT]: '決断への集約',
            [LearningStage.INTRODUCTION]: '関心の醸成'
        };
        return contexts[stage] || '学習の深化';
    }

    private getStageEnhancement(stage: LearningStage): string {
        const enhancements: Record<LearningStage, string> = {
            [LearningStage.INSIGHT]: 'この瞬間、新たな知的地平が開かれる。',
            [LearningStage.APPLICATION]: 'この体験が実践への確固たる自信を築く。',
            [LearningStage.INTEGRATION]: 'この変容により、真の習得者となる。',
            [LearningStage.THEORY_APPLICATION]: 'この適用により、理論の生きた価値を実感する。',
            [LearningStage.FAILURE_EXPERIENCE]: 'この失敗こそが、最も価値ある教師となる。',
            [LearningStage.PRACTICAL_MASTERY]: 'この習熟により、教育者への道が開かれる。',
            [LearningStage.MISCONCEPTION]: 'この認識の転換が、新たな出発点となる。',
            [LearningStage.EXPLORATION]: 'この探求が、深い理解への扉を開く。',
            [LearningStage.CONFLICT]: 'この決断が、成長への重要な一歩となる。',
            [LearningStage.INTRODUCTION]: 'この関心が、学習への情熱を点火する。'
        };
        return enhancements[stage] || 'この体験が、重要な学習の契機となる。';
    }

    // ユーティリティメソッド
    private async executeAIAnalysis(prompt: string, options: AIAnalysisOptions): Promise<string> {
        try {
            return await this.geminiClient.generateText(prompt, options);
        } catch (error) {
            logger.error('AI analysis failed in cathartic experience designer', { error });
            throw error;
        }
    }

    private safeContentTruncation(content: string, maxLength: number): string {
        if (!content || typeof content !== 'string') {
            return '';
        }
        return content.length > maxLength
            ? content.substring(0, maxLength) + '...(truncated)'
            : content;
    }
}