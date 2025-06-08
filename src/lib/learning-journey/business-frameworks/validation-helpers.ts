/**
 * @fileoverview バリデーション・解析ヘルパー
 * @description AI応答の解析、データバリデーション、型安全な変換処理を提供
 */

import { logger } from '@/lib/utils/logger';
import { JsonParser } from '@/lib/utils/json-parser';
import { LearningStage } from '../concept-learning-manager';
import {
    EmotionLearningSyncMetrics,
    EmpatheticPoint,
    EmotionAnalysisResult,
    CatharticExperience
} from '../emotional-types';

/**
 * 同期分析レスポンスの安全な解析
 * @param response AI応答文字列
 * @returns バリデーション済み同期指標
 */
export function parseSynchronizationResponse(response: string): EmotionLearningSyncMetrics {
    try {
        const metrics = JsonParser.parseFromAIResponse(response, createDefaultSyncMetrics());
        return validateSyncMetrics(metrics);
    } catch (error) {
        logger.error(`Failed to parse synchronization response`, { error });
        return createDefaultSyncMetrics();
    }
}

/**
 * 共感ポイントレスポンスの安全な解析
 * @param response AI応答文字列
 * @param stage 学習段階（フォールバック用）
 * @returns バリデーション済み共感ポイント配列
 */
export function parseEmpatheticPointsResponse(response: string, stage: LearningStage): EmpatheticPoint[] {
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
                    type: validateEmpatheticPointType(point.type),
                    position: Math.max(0, Math.min(1, point.position)),
                    intensity: Math.max(0, Math.min(1, point.intensity)),
                    description: String(point.description)
                }))
                .filter((point: EmpatheticPoint): boolean => 
                    point.description.length > 0
                );

            return validPoints.length > 0 ? validPoints : createDefaultEmpatheticPoints(stage);
        }
    } catch (error) {
        logger.error(`Failed to parse empathetic points response`, { error });
    }

    return createDefaultEmpatheticPoints(stage);
}

/**
 * 感情分析レスポンスの安全な解析
 * @param response AI応答文字列
 * @returns バリデーション済み感情分析結果
 */
export function parseEmotionAnalysisResponse(response: string): EmotionAnalysisResult {
    try {
        const result = JsonParser.parseFromAIResponse(response, {
            overallTone: "中立的",
            emotionalImpact: 5,
            emotionalDimensions: {}
        });

        return {
            overallTone: validateStringField(result.overallTone, "中立的"),
            emotionalImpact: validateNumericRange(result.emotionalImpact, 1, 10, 5),
            emotionalDimensions: validateEmotionalDimensions(result.emotionalDimensions)
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
 * カタルシス体験レスポンスの安全な解析
 * @param response AI応答文字列
 * @param conceptName 概念名（フォールバック用）
 * @param stage 学習段階（フォールバック用）
 * @returns バリデーション済みカタルシス体験配列
 */
export function parseCatharticExperienceResponse(
    response: string, 
    conceptName: string, 
    stage: LearningStage
): CatharticExperience[] {
    try {
        const result = JsonParser.parseFromAIResponse(response, { catharticMoments: [] });

        if (Array.isArray(result.catharticMoments)) {
            const validExperiences = result.catharticMoments
                .filter((moment: any): boolean =>
                    moment !== null &&
                    moment !== undefined &&
                    typeof moment.type === 'string' &&
                    typeof moment.intensity === 'number' &&
                    typeof moment.trigger === 'string' &&
                    typeof moment.peakMoment === 'string' &&
                    typeof moment.aftermath === 'string'
                )
                .map((moment: any): CatharticExperience => ({
                    type: validateCatharticType(moment.type),
                    intensity: Math.max(0, Math.min(1, moment.intensity)),
                    trigger: String(moment.trigger),
                    buildup: Array.isArray(moment.buildup) ? 
                        moment.buildup.map((item: any) => String(item)) : 
                        [],
                    peakMoment: String(moment.peakMoment),
                    aftermath: String(moment.aftermath),
                    relatedLearningStage: stage,
                    relatedConcept: conceptName
                }))
                .filter((experience: CatharticExperience): boolean =>
                    experience.trigger.length > 0 && 
                    experience.peakMoment.length > 0
                );

            return validExperiences;
        }
    } catch (error) {
        logger.error(`Failed to parse cathartic experience response`, { error });
    }

    return [];
}

/**
 * ビジネスフレームワーク分析レスポンスの解析
 * @param response AI応答文字列
 * @returns ビジネスフレームワーク分析結果
 */
export function parseBusinessFrameworkAnalysisResponse(response: string): {
    frameworkAlignment: number;
    stageAppropriateness: number;
    motivationalEffect: number;
    understandingFacilitation: number;
    specificObservations: string;
    recommendations: string[];
} {
    try {
        const result = JsonParser.parseFromAIResponse(response, {
            frameworkAlignment: 0.5,
            stageAppropriateness: 0.5,
            motivationalEffect: 0.5,
            understandingFacilitation: 0.5,
            specificObservations: "",
            recommendations: []
        });

        return {
            frameworkAlignment: validateNumericRange(result.frameworkAlignment, 0, 1, 0.5),
            stageAppropriateness: validateNumericRange(result.stageAppropriateness, 0, 1, 0.5),
            motivationalEffect: validateNumericRange(result.motivationalEffect, 0, 1, 0.5),
            understandingFacilitation: validateNumericRange(result.understandingFacilitation, 0, 1, 0.5),
            specificObservations: validateStringField(result.specificObservations, ""),
            recommendations: Array.isArray(result.recommendations) ?
                result.recommendations.map((item: any) => String(item)) :
                []
        };
    } catch (error) {
        logger.error(`Failed to parse business framework analysis response`, { error });
        return {
            frameworkAlignment: 0.5,
            stageAppropriateness: 0.5,
            motivationalEffect: 0.5,
            understandingFacilitation: 0.5,
            specificObservations: "解析エラーが発生しました",
            recommendations: []
        };
    }
}

// ============================================================================
// バリデーション関数群
// ============================================================================

/**
 * 同期指標をバリデーション
 * @param metrics 生の指標データ
 * @returns バリデーション済み指標
 */
function validateSyncMetrics(metrics: any): EmotionLearningSyncMetrics {
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

/**
 * 共感ポイントタイプをバリデーション
 * @param type 生のタイプデータ
 * @returns バリデーション済みタイプ
 */
function validateEmpatheticPointType(type: any): 'character' | 'situation' | 'decision' | 'realization' | 'transformation' {
    const validTypes = ['character', 'situation', 'decision', 'realization', 'transformation'];
    return validTypes.includes(type) ? type : 'character';
}

/**
 * カタルシスタイプをバリデーション
 * @param type 生のタイプデータ
 * @returns バリデーション済みタイプ
 */
function validateCatharticType(type: any): 'emotional' | 'intellectual' | 'moral' | 'transformative' {
    const validTypes = ['emotional', 'intellectual', 'moral', 'transformative'];
    return validTypes.includes(type) ? type : 'emotional';
}

/**
 * 数値範囲をバリデーション
 * @param value チェック対象値
 * @param min 最小値
 * @param max 最大値
 * @param defaultValue デフォルト値
 * @returns バリデーション済み数値
 */
function validateNumericRange(value: any, min: number, max: number, defaultValue: number): number {
    if (typeof value !== 'number' || isNaN(value)) {
        return defaultValue;
    }
    return Math.max(min, Math.min(max, value));
}

/**
 * 文字列フィールドをバリデーション
 * @param value チェック対象値
 * @param defaultValue デフォルト値
 * @returns バリデーション済み文字列
 */
function validateStringField(value: any, defaultValue: string): string {
    return typeof value === 'string' && value.length > 0 ? value : defaultValue;
}

/**
 * 感情次元をバリデーション
 * @param dimensions 生の感情次元データ
 * @returns バリデーション済み感情次元
 */
function validateEmotionalDimensions(dimensions: any): any {
    if (!dimensions || typeof dimensions !== 'object') {
        return {};
    }

    const result: any = {};
    const dimensionNames = ['hopeVsDespair', 'comfortVsTension', 'joyVsSadness'];
    
    for (const dimName of dimensionNames) {
        if (dimensions[dimName] && typeof dimensions[dimName] === 'object') {
            result[dimName] = {
                start: validateNumericRange(dimensions[dimName].start, 0, 10, 5),
                middle: validateNumericRange(dimensions[dimName].middle, 0, 10, 5),
                end: validateNumericRange(dimensions[dimName].end, 0, 10, 5)
            };
        }
    }

    return result;
}

// ============================================================================
// デフォルト値生成関数群
// ============================================================================

/**
 * デフォルト同期指標を作成
 * @returns デフォルト指標
 */
function createDefaultSyncMetrics(): EmotionLearningSyncMetrics {
    return {
        peakSynchronization: 0.5,
        progressionAlignment: 0.5,
        emotionalResonance: 0.5,
        themeEmotionIntegration: 0.5,
        catharticMomentEffect: 0.4,
        measurementConfidence: 0.5
    };
}

/**
 * デフォルト共感ポイントを作成
 * @param stage 学習段階
 * @returns デフォルト共感ポイント配列
 */
function createDefaultEmpatheticPoints(stage: LearningStage): EmpatheticPoint[] {
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