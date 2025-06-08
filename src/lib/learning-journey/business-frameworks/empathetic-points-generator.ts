/**
 * @fileoverview 共感ポイント生成器
 * @description AI分析と学習段階に基づく共感ポイント生成とバリデーション
 */

import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { LearningStage } from '../concept-learning-manager';
import {
    EmpatheticPoint,
    EmotionalLearningIntegratorConfig,
    AIAnalysisOptions
} from '../emotional-types';
import {
    createEmpatheticPointsPrompt,
    createBusinessFrameworkAnalysisPrompt
} from './prompt-generators';
import { parseEmpatheticPointsResponse } from './validation-helpers';

/**
 * 共感ポイント生成器クラス
 */
export class EmpatheticPointsGenerator {
    constructor(
        private geminiClient: GeminiClient,
        private config: Required<EmotionalLearningIntegratorConfig>
    ) {}

    /**
     * 章内容に基づいた共感ポイントを生成する
     * @param chapterContent 章内容
     * @param conceptName 概念名
     * @param stage 学習段階
     * @returns 共感ポイント配列
     */
    async generateFromContent(
        chapterContent: string,
        conceptName: string,
        stage: LearningStage
    ): Promise<EmpatheticPoint[]> {
        try {
            if (!this.config.enableAdvancedAnalysis) {
                return this.createDefaultEmpatheticPoints(stage);
            }

            logger.info(`Generating empathetic points for ${conceptName} at stage ${stage}`);

            // コンテンツの安全な切り詰め
            const truncatedContent = this.safeContentTruncation(chapterContent, 5000);

            // AIを使って共感ポイントを生成
            const prompt = createEmpatheticPointsPrompt(truncatedContent, conceptName, stage);

            const response = await this.executeAIAnalysis(prompt, {
                temperature: 0.3,
                responseFormat: 'json'
            });

            // レスポンスの安全な解析
            const validatedPoints = parseEmpatheticPointsResponse(response, stage);

            // 学習段階特有の強化
            const enhancedPoints = this.enhancePointsForLearningStage(validatedPoints, stage);

            // 品質チェックとフィルタリング
            const qualityFilteredPoints = this.filterHighQualityPoints(enhancedPoints);

            return qualityFilteredPoints.length > 0 ? qualityFilteredPoints : this.createDefaultEmpatheticPoints(stage);

        } catch (error) {
            logger.error(`Failed to generate empathetic points for ${conceptName}`, { error });
            return this.createDefaultEmpatheticPoints(stage);
        }
    }

    /**
     * ビジネスフレームワーク特化共感ポイントを生成する
     * @param frameworkName フレームワーク名
     * @param stage 学習段階
     * @param content 章内容（オプション）
     * @returns フレームワーク特化共感ポイント配列
     */
    async generateBusinessFrameworkPoints(
        frameworkName: string,
        stage: LearningStage,
        content?: string
    ): Promise<EmpatheticPoint[]> {
        try {
            logger.info(`Generating business framework empathetic points for ${frameworkName} at stage ${stage}`);

            let points: EmpatheticPoint[] = [];

            // コンテンツがある場合はAI分析を実行
            if (content && this.config.enableAdvancedAnalysis) {
                const truncatedContent = this.safeContentTruncation(content, 4000);
                const prompt = createBusinessFrameworkAnalysisPrompt(truncatedContent, frameworkName, stage);

                const response = await this.executeAIAnalysis(prompt, {
                    temperature: 0.2,
                    responseFormat: 'json'
                });

                // ビジネスフレームワーク分析結果から共感ポイントを抽出
                points = this.extractEmpatheticPointsFromFrameworkAnalysis(response, stage);
            }

            // フレームワーク固有のデフォルト共感ポイントと統合
            const frameworkDefaultPoints = this.createFrameworkSpecificPoints(frameworkName, stage);
            const combinedPoints = this.combineAndDeduplicatePoints(points, frameworkDefaultPoints);

            // ビジネス学習段階特有の追加ポイント
            if (this.isBusinessLearningStage(stage)) {
                const businessStagePoints = this.createBusinessStageEmpatheticPoints(stage, frameworkName);
                return this.combineAndDeduplicatePoints(combinedPoints, businessStagePoints);
            }

            return combinedPoints;

        } catch (error) {
            logger.error(`Failed to generate business framework empathetic points for ${frameworkName}`, { error });
            return this.createFrameworkSpecificPoints(frameworkName, stage);
        }
    }

    /**
     * 複数の共感ポイント配列を統合し重複を除去する
     * @param pointArrays 複数の共感ポイント配列
     * @returns 統合・重複除去された共感ポイント配列
     */
    combineMultiplePointArrays(...pointArrays: EmpatheticPoint[][]): EmpatheticPoint[] {
        const allPoints = pointArrays.flat();
        return this.combineAndDeduplicatePoints(allPoints, []);
    }

    /**
     * 共感ポイントの品質評価
     * @param points 共感ポイント配列
     * @returns 品質スコア (0-1)
     */
    evaluatePointsQuality(points: EmpatheticPoint[]): number {
        if (points.length === 0) return 0;

        let qualityScore = 0;
        const factors = {
            varietyScore: this.calculateVarietyScore(points),
            intensityDistribution: this.calculateIntensityDistribution(points),
            positionCoverage: this.calculatePositionCoverage(points),
            descriptionQuality: this.calculateDescriptionQuality(points)
        };

        // 各要素の重み付き平均
        qualityScore = (
            factors.varietyScore * 0.3 +
            factors.intensityDistribution * 0.25 +
            factors.positionCoverage * 0.25 +
            factors.descriptionQuality * 0.2
        );

        return Math.max(0, Math.min(1, qualityScore));
    }

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

    /**
     * 学習段階に応じた共感ポイントの強化
     * @param points 基本共感ポイント配列
     * @param stage 学習段階
     * @returns 強化された共感ポイント配列
     */
    private enhancePointsForLearningStage(points: EmpatheticPoint[], stage: LearningStage): EmpatheticPoint[] {
        return points.map(point => {
            const enhancedPoint = { ...point };

            // 学習段階特有の強化
            switch (stage) {
                case LearningStage.MISCONCEPTION:
                    if (point.type === 'character') {
                        enhancedPoint.intensity = Math.min(1, point.intensity + 0.1);
                        enhancedPoint.description += ' - 誤解による混乱の共感性を強化';
                    }
                    break;

                case LearningStage.INSIGHT:
                    if (point.type === 'realization') {
                        enhancedPoint.intensity = Math.min(1, point.intensity + 0.15);
                        enhancedPoint.description += ' - 突破的理解の感動を強化';
                    }
                    break;

                case LearningStage.CONFLICT:
                    if (point.type === 'decision') {
                        enhancedPoint.intensity = Math.min(1, point.intensity + 0.1);
                        enhancedPoint.description += ' - 困難な決断の重みを強化';
                    }
                    break;

                case LearningStage.PRACTICAL_MASTERY:
                    if (point.type === 'transformation') {
                        enhancedPoint.intensity = Math.min(1, point.intensity + 0.1);
                        enhancedPoint.description += ' - 習熟による変容の深さを強化';
                    }
                    break;
            }

            return enhancedPoint;
        });
    }

    /**
     * 高品質な共感ポイントをフィルタリング
     * @param points 共感ポイント配列
     * @returns フィルタリングされた共感ポイント配列
     */
    private filterHighQualityPoints(points: EmpatheticPoint[]): EmpatheticPoint[] {
        return points.filter(point => {
            // 基本的な品質チェック
            if (point.intensity < 0.4) return false;
            if (point.description.length < 10) return false;
            if (point.position < 0 || point.position > 1) return false;

            // 説明の質チェック
            const description = point.description.toLowerCase();
            const qualityIndicators = ['感情', '体験', '瞬間', '気づき', '変化', '成長', '実感', '満足', '困難', '葛藤'];
            const hasQualityIndicators = qualityIndicators.some(indicator => description.includes(indicator));

            return hasQualityIndicators;
        });
    }

    /**
     * フレームワーク分析から共感ポイントを抽出
     * @param response AI分析レスポンス
     * @param stage 学習段階
     * @returns 抽出された共感ポイント配列
     */
    private extractEmpatheticPointsFromFrameworkAnalysis(response: string, stage: LearningStage): EmpatheticPoint[] {
        try {
            // AI分析結果から共感ポイントに変換するロジック
            // 実装の詳細は分析結果の構造に依存
            return parseEmpatheticPointsResponse(response, stage);
        } catch (error) {
            logger.warn('Failed to extract empathetic points from framework analysis', { error });
            return [];
        }
    }

    /**
     * フレームワーク特有の共感ポイントを作成
     * @param frameworkName フレームワーク名
     * @param stage 学習段階
     * @returns フレームワーク特化共感ポイント配列
     */
    private createFrameworkSpecificPoints(frameworkName: string, stage: LearningStage): EmpatheticPoint[] {
        const basePoints = this.createDefaultEmpatheticPoints(stage);
        
        // フレームワーク特有の調整
        return basePoints.map(point => ({
            ...point,
            description: `${frameworkName}: ${point.description}`
        }));
    }

    /**
     * ビジネス学習段階特化共感ポイントを作成
     * @param stage 学習段階
     * @param frameworkName フレームワーク名
     * @returns ビジネス段階特化共感ポイント配列
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
     * 共感ポイントの統合と重複除去
     * @param points1 共感ポイント配列1
     * @param points2 共感ポイント配列2
     * @returns 統合・重複除去された配列
     */
    private combineAndDeduplicatePoints(points1: EmpatheticPoint[], points2: EmpatheticPoint[]): EmpatheticPoint[] {
        const combined = [...points1, ...points2];
        const deduped: EmpatheticPoint[] = [];

        for (const point of combined) {
            const isDuplicate = deduped.some(existing => 
                Math.abs(existing.position - point.position) < 0.1 &&
                existing.type === point.type &&
                this.calculateDescriptionSimilarity(existing.description, point.description) > 0.7
            );

            if (!isDuplicate) {
                deduped.push(point);
            }
        }

        // 位置順にソート
        return deduped.sort((a, b) => a.position - b.position);
    }

    /**
     * ビジネス学習段階かどうかを判定
     * @param stage 学習段階
     * @returns ビジネス学習段階の場合true
     */
    private isBusinessLearningStage(stage: LearningStage): boolean {
        return [
            LearningStage.INTRODUCTION,
            LearningStage.THEORY_APPLICATION,
            LearningStage.FAILURE_EXPERIENCE,
            LearningStage.PRACTICAL_MASTERY
        ].includes(stage);
    }

    /**
     * 品質評価: バラエティスコア計算
     * @param points 共感ポイント配列
     * @returns バラエティスコア (0-1)
     */
    private calculateVarietyScore(points: EmpatheticPoint[]): number {
        const types = new Set(points.map(p => p.type));
        const maxTypes = 5; // character, situation, decision, realization, transformation
        return types.size / maxTypes;
    }

    /**
     * 品質評価: 強度分布計算
     * @param points 共感ポイント配列
     * @returns 強度分布スコア (0-1)
     */
    private calculateIntensityDistribution(points: EmpatheticPoint[]): number {
        if (points.length === 0) return 0;

        const intensities = points.map(p => p.intensity);
        const avg = intensities.reduce((sum, val) => sum + val, 0) / intensities.length;
        const variance = intensities.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / intensities.length;

        // 適度な分散があることを評価（0.6-0.8の平均強度で適度な分散）
        const idealAvg = 0.7;
        const idealVariance = 0.04;
        
        const avgScore = 1 - Math.abs(avg - idealAvg) / idealAvg;
        const varianceScore = 1 - Math.abs(variance - idealVariance) / idealVariance;

        return (avgScore + varianceScore) / 2;
    }

    /**
     * 品質評価: 位置カバレッジ計算
     * @param points 共感ポイント配列
     * @returns 位置カバレッジスコア (0-1)
     */
    private calculatePositionCoverage(points: EmpatheticPoint[]): number {
        if (points.length === 0) return 0;

        const positions = points.map(p => p.position).sort((a, b) => a - b);
        const coverage = positions[positions.length - 1] - positions[0];
        
        // 0.8以上のカバレッジを理想とする
        return Math.min(1, coverage / 0.8);
    }

    /**
     * 品質評価: 説明の質計算
     * @param points 共感ポイント配列
     * @returns 説明品質スコア (0-1)
     */
    private calculateDescriptionQuality(points: EmpatheticPoint[]): number {
        if (points.length === 0) return 0;

        const qualityScores = points.map(point => {
            const description = point.description;
            let score = 0;

            // 長さチェック（20-100文字が理想）
            if (description.length >= 20 && description.length <= 100) {
                score += 0.3;
            }

            // 感情表現の存在
            const emotionWords = ['感動', '喜び', '不安', '驚き', '満足', '困惑', '緊張', '安心', '期待', '失望'];
            if (emotionWords.some(word => description.includes(word))) {
                score += 0.3;
            }

            // 具体性チェック
            const concreteWords = ['瞬間', '時', '場面', '状況', '体験', 'プロセス', '過程'];
            if (concreteWords.some(word => description.includes(word))) {
                score += 0.2;
            }

            // 学習関連語彙
            const learningWords = ['理解', '気づき', '発見', '学び', '成長', '変化', '習得'];
            if (learningWords.some(word => description.includes(word))) {
                score += 0.2;
            }

            return Math.min(1, score);
        });

        return qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
    }

    /**
     * 説明文の類似度計算
     * @param desc1 説明文1
     * @param desc2 説明文2
     * @returns 類似度 (0-1)
     */
    private calculateDescriptionSimilarity(desc1: string, desc2: string): number {
        const words1 = desc1.toLowerCase().split(/\s+/);
        const words2 = desc2.toLowerCase().split(/\s+/);
        
        const commonWords = words1.filter(word => words2.includes(word));
        const totalWords = new Set([...words1, ...words2]).size;
        
        return commonWords.length / totalWords;
    }

    /**
     * AI分析の実行
     * @param prompt プロンプト
     * @param options 分析オプション
     * @returns AI応答
     */
    private async executeAIAnalysis(prompt: string, options: AIAnalysisOptions): Promise<string> {
        try {
            return await this.geminiClient.generateText(prompt, options);
        } catch (error) {
            logger.error('AI analysis failed', { error });
            throw error;
        }
    }

    /**
     * コンテンツの安全な切り詰め
     * @param content コンテンツ
     * @param maxLength 最大長
     * @returns 切り詰められたコンテンツ
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
     * デフォルト共感ポイントを作成
     * @param stage 学習段階
     * @returns デフォルト共感ポイント配列
     */
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
}