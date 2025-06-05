// services/evolution-service.ts
/**
 * @fileoverview 発展サービス
 * @description
 * キャラクターの発展と成長を管理するサービスクラス。
 * 既存のEvolutionSystemとGrowthPlanManagerを統合し、
 * キャラクターの発展計画、発展段階評価、成長処理を担当します。
 */
import { IEvolutionService } from '../core/interfaces';
import {
    Character,
    CharacterDevelopment,
    DevelopmentPath,
    ChapterEvent,
    GrowthResult,
    GrowthPlan,
    GrowthPhase,
    DevelopmentPathPhase,
    ArcType,
    Milestone,
    GrowthEvent,
    TransformationArc,
    CharacterState,
    EmotionalState 
} from '../core/types';
import { characterRepository } from '../repositories/character-repository';
import { parameterRepository } from '../repositories/parameter-repository';
import { skillRepository } from '../repositories/skill-repository';
import { eventBus } from '../events/character-event-bus';
import { EVENT_TYPES, DEVELOPMENT_STAGE } from '../core/constants';
import { logger } from '@/lib/utils/logger';
import { NotFoundError, CharacterError } from '../core/errors';
import { generateId } from '@/lib/utils/helpers';

/**
 * 発展サービスクラス
 * キャラクターの発展と成長を管理する統合サービス
 */
export class EvolutionService implements IEvolutionService {
    // 発展段階ごとの基準値定義
    private readonly STAGE_THRESHOLDS = {
        // 性格特性の深化/変容の閾値
        PERSONALITY_THRESHOLD: [0.1, 0.2, 0.3, 0.4, 0.5],
        // スキル向上の閾値
        SKILL_THRESHOLD: [0.15, 0.3, 0.5, 0.7, 0.9],
        // 関係性発展の閾値
        RELATIONSHIP_THRESHOLD: [0.1, 0.25, 0.45, 0.7, 0.9]
    };

    // キャラクタータイプごとの最大発展段階
    private readonly MAX_DEVELOPMENT_STAGE = {
        MAIN: 5,
        SUB: 3,
        MOB: 1
    };

    // 成長計画のキャッシュ
    private growthPlans: Map<string, GrowthPlan> = new Map();
    // キャラクターごとの成長計画IDの配列
    private characterGrowthPlans: Map<string, string[]> = new Map();

    /**
     * コンストラクタ
     */
    constructor() {
        logger.info('EvolutionService initialized');

        // キャラクター発展リクエストのイベントリスナー
        eventBus.subscribe(EVENT_TYPES.CHARACTER_DEVELOPMENT_REQUESTED, async (data) => {
            try {
                const { characterId, events, character } = data;
                // 発展処理を実行
                const development = await this.processCharacterDevelopment(character, events);

                // 結果に基づいて状態を更新
                await this.applyDevelopmentToCharacter(character, development);
            } catch (error) {
                logger.error('発展リクエスト処理中にエラーが発生しました', {
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        });
    }

    /**
     * キャラクター発展処理
     * @param character キャラクター
     * @param events 章イベント配列
     * @returns キャラクター発展情報
     */
    async processCharacterDevelopment(character: Character, events: ChapterEvent[]): Promise<CharacterDevelopment> {
        try {
            logger.info(`キャラクター発展処理開始: ${character.name} (${character.id})`);

            // 発展影響を分析
            const developmentChanges = await this.analyzeDevelopmentImpact(character, events);

            // 発展結果の構築
            const development: CharacterDevelopment = {
                personalityChanges: developmentChanges.personality,
                relationshipChanges: developmentChanges.relationships,
                skillChanges: developmentChanges.skills,
                emotionalGrowth: developmentChanges.emotional,
                narrativeSignificance: developmentChanges.narrative,
            };

            // 発展段階の評価と更新
            const newDevelopmentStage = this.evaluateDevelopmentStage(
                character.state.developmentStage || 0,
                development,
                character.type
            );

            // 発展段階が変わった場合の処理
            if (newDevelopmentStage > (character.state.developmentStage || 0)) {
                development.stageProgression = {
                    from: character.state.developmentStage || 0,
                    to: newDevelopmentStage,
                    reason: this.generateStageProgressionReason(development, character)
                };

                logger.info(`キャラクター発展段階更新: ${character.name} - ${character.state.developmentStage || 0} → ${newDevelopmentStage}`);
            }

            logger.info(`キャラクター発展処理完了: ${character.name} (${character.id})`);

            return development;
        } catch (error) {
            logger.error(`キャラクター発展処理中にエラーが発生しました: ${character.name} (${character.id})`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 発展影響を分析する
     * @private
     * @param character キャラクター
     * @param events イベント配列
     * @returns 発展影響情報
     */
    private async analyzeDevelopmentImpact(character: Character, events: ChapterEvent[]): Promise<any> {
        try {
            // 初期影響オブジェクト
            const impacts: any = {
                personality: {},
                relationships: {},
                skills: {},
                emotional: {
                    impact: 0,
                    lastEvent: ''
                },
                narrative: 0,
            };

            // キャラクターが関わるイベントを分析
            for (const event of events) {
                if (event.affectedCharacters && event.affectedCharacters.includes(character.id)) {
                    this.applyEventImpact(impacts, event, character);
                }
            }

            // キャラクターの背景と一貫性のある発展影響に調整
            this.adjustImpactsBasedOnBackground(impacts, character);

            return impacts;
        } catch (error) {
            logger.error(`発展影響分析中にエラーが発生しました: ${character.name} (${character.id})`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * イベント影響をキャラクターに適用
     * @private
     * @param impacts 発展影響
     * @param event イベント
     * @param character キャラクター
     */
    private applyEventImpact(impacts: any, event: ChapterEvent, character: Character): void {
        try {
            // イベントタイプに基づく影響の適用
            // 簡略化のため、一部のイベントタイプのみ実装
            switch (event.type) {
                case 'CONFLICT':
                    this.applyConflictImpact(impacts, event, character);
                    break;
                case 'REVELATION':
                    this.applyRevelationImpact(impacts, event, character);
                    break;
                case 'RELATIONSHIP':
                    this.applyRelationshipImpact(impacts, event, character);
                    break;
                case 'EMOTIONAL':
                    this.applyEmotionalImpact(impacts, event, character);
                    break;
                default:
                    // 未知のイベントタイプは小さな影響のみ
                    impacts.narrative += 0.1;
            }

            logger.debug(`イベント影響を適用しました: キャラクター ${character.name}, イベントタイプ ${event.type}`);
        } catch (error) {
            logger.error(`イベント影響適用中にエラーが発生しました: ${character.name}, イベント ${event.type}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            // エラーは吸収して処理を継続
        }
    }

    /**
     * 対立イベントの影響を適用
     * @private
     * @param impacts 発展影響
     * @param event イベント
     * @param character キャラクター
     */
    private applyConflictImpact(impacts: any, event: ChapterEvent, character: Character): void {
        // 対立イベントの強度による性格への影響
        const intensity = event.intensity || 0.5;

        // 関連する性格特性を変化させる
        if (event.outcome === 'SUCCESS') {
            // 成功の場合：自信、決断力などが向上
            impacts.personality.confidence = (impacts.personality.confidence || 0) + intensity * 0.2;
            impacts.personality.determination = (impacts.personality.determination || 0) + intensity * 0.15;
            impacts.narrative += intensity * 0.3;
        } else if (event.outcome === 'FAILURE') {
            // 失敗の場合：慎重さ、回復力などが向上
            impacts.personality.caution = (impacts.personality.caution || 0) + intensity * 0.2;
            impacts.personality.resilience = (impacts.personality.resilience || 0) + intensity * 0.25;
            impacts.narrative += intensity * 0.2;
        } else {
            // 中立の結果：バランスの取れた成長
            impacts.personality.adaptability = (impacts.personality.adaptability || 0) + intensity * 0.15;
            impacts.personality.wisdom = (impacts.personality.wisdom || 0) + intensity * 0.1;
            impacts.narrative += intensity * 0.15;
        }

        // 関係者に対する関係性の変化
        if (event.relatedCharacters) {
            for (const relatedCharId of event.relatedCharacters) {
                if (relatedCharId === character.id) continue;
                impacts.relationships[relatedCharId] = {
                    change: event.outcome === 'SUCCESS' ? intensity * 0.1 : -intensity * 0.1,
                    reason: `${event.description || '対立'} (${event.outcome})`,
                };
            }
        }

        // 感情の変化
        impacts.emotional.impact = (impacts.emotional.impact || 0) + intensity * 0.3;
        impacts.emotional.lastEvent = event.description || '対立イベント';
    }

    /**
     * 啓示イベントの影響を適用
     * @private
     * @param impacts 発展影響
     * @param event イベント
     * @param character キャラクター
     */
    private applyRevelationImpact(impacts: any, event: ChapterEvent, character: Character): void {
        const intensity = event.intensity || 0.5;

        // 啓示による性格・心理的変化
        impacts.personality.insight = (impacts.personality.insight || 0) + intensity * 0.3;
        impacts.personality.wisdom = (impacts.personality.wisdom || 0) + intensity * 0.2;

        // 啓示内容に応じた追加変化
        if (event.subType === 'TRUTH') {
            impacts.personality.honesty = (impacts.personality.honesty || 0) + intensity * 0.25;
            impacts.personality.trust = (impacts.personality.trust || 0) + intensity * 0.15;
        } else if (event.subType === 'BETRAYAL') {
            impacts.personality.trust = (impacts.personality.trust || 0) - intensity * 0.3;
            impacts.personality.caution = (impacts.personality.caution || 0) + intensity * 0.3;
        } else if (event.subType === 'IDENTITY') {
            impacts.personality.confidence = (impacts.personality.confidence || 0) + (Math.random() > 0.5 ? 1 : -1) * intensity * 0.3;
            impacts.personality.self_awareness = (impacts.personality.self_awareness || 0) + intensity * 0.4;
        }

        // ナラティブへの大きな影響
        impacts.narrative += intensity * 0.5;

        // 関係する人物への態度変化
        if (event.relatedCharacters) {
            for (const relatedCharId of event.relatedCharacters) {
                if (relatedCharId === character.id) continue;
                impacts.relationships[relatedCharId] = {
                    change: intensity * 0.3, // 啓示は関係性に大きな影響
                    reason: event.description || '啓示',
                };
            }
        }

        // 感情の大きな変化
        impacts.emotional.impact = (impacts.emotional.impact || 0) + intensity * 0.6;
        impacts.emotional.lastEvent = event.description || '啓示';
    }

    /**
     * 関係性イベントの影響を適用
     * @private
     * @param impacts 発展影響
     * @param event イベント
     * @param character キャラクター
     */
    private applyRelationshipImpact(impacts: any, event: ChapterEvent, character: Character): void {
        const intensity = event.intensity || 0.5;

        // 関係性変化の直接的影響
        if (event.relatedCharacters) {
            for (const relatedCharId of event.relatedCharacters) {
                if (relatedCharId === character.id) continue;

                // イベントのサブタイプに基づく影響
                let changeAmount = 0;
                if (event.subType === 'BONDING') {
                    changeAmount = intensity * 0.4;
                } else if (event.subType === 'CONFLICT') {
                    changeAmount = -intensity * 0.3;
                } else if (event.subType === 'RECONCILIATION') {
                    changeAmount = intensity * 0.5;
                } else if (event.subType === 'BETRAYAL') {
                    changeAmount = -intensity * 0.6;
                } else if (event.subType === 'SACRIFICE') {
                    changeAmount = intensity * 0.7;
                } else if (event.subType === 'ROMANTIC') {
                    changeAmount = intensity * 0.6;
                } else {
                    changeAmount = intensity * 0.2;
                }

                impacts.relationships[relatedCharId] = {
                    change: changeAmount,
                    reason: event.description || '関係性イベント',
                };
            }
        }

        // ナラティブ上の意義
        impacts.narrative += intensity * 0.25;

        // 関係性変化による性格への影響
        impacts.personality.empathy = (impacts.personality.empathy || 0) + intensity * 0.15;

        // 関係性サブタイプに応じた性格変化
        if (event.subType === 'BETRAYAL') {
            impacts.personality.trust = (impacts.personality.trust || 0) - intensity * 0.3;
            impacts.personality.caution = (impacts.personality.caution || 0) + intensity * 0.2;
        } else if (event.subType === 'SACRIFICE') {
            impacts.personality.selflessness = (impacts.personality.selflessness || 0) + intensity * 0.3;
            impacts.personality.compassion = (impacts.personality.compassion || 0) + intensity * 0.25;
        } else if (event.subType === 'ROMANTIC') {
            impacts.personality.vulnerability = (impacts.personality.vulnerability || 0) + intensity * 0.2;
            impacts.personality.openness = (impacts.personality.openness || 0) + intensity * 0.15;
        }

        // 感情的影響
        impacts.emotional.impact = (impacts.emotional.impact || 0) + intensity * 0.35;
        impacts.emotional.lastEvent = event.description || '関係性イベント';
    }

    /**
     * 感情イベントの影響を適用
     * @private
     * @param impacts 発展影響
     * @param event イベント
     * @param character キャラクター
     */
    private applyEmotionalImpact(impacts: any, event: ChapterEvent, character: Character): void {
        const intensity = event.intensity || 0.5;

        // 感情イベントの大きな影響
        impacts.emotional.impact = (impacts.emotional.impact || 0) + intensity * 0.7;
        impacts.emotional.lastEvent = event.description || '感情的出来事';

        // 感情イベントの性格への影響
        if (event.subType === 'TRAUMA') {
            impacts.personality.vulnerability = (impacts.personality.vulnerability || 0) + intensity * 0.4;
            impacts.personality.caution = (impacts.personality.caution || 0) + intensity * 0.3;
            impacts.personality.trust = (impacts.personality.trust || 0) - intensity * 0.2;
        } else if (event.subType === 'JOY') {
            impacts.personality.optimism = (impacts.personality.optimism || 0) + intensity * 0.3;
            impacts.personality.openness = (impacts.personality.openness || 0) + intensity * 0.2;
            impacts.personality.trust = (impacts.personality.trust || 0) + intensity * 0.1;
        } else if (event.subType === 'GROWTH') {
            impacts.personality.maturity = (impacts.personality.maturity || 0) + intensity * 0.4;
            impacts.personality.wisdom = (impacts.personality.wisdom || 0) + intensity * 0.3;
            impacts.personality.empathy = (impacts.personality.empathy || 0) + intensity * 0.2;
        }

        // ナラティブへの重要な影響
        impacts.narrative += intensity * 0.4;

        // 関係者への感情的影響
        if (event.relatedCharacters) {
            for (const relatedCharId of event.relatedCharacters) {
                if (relatedCharId === character.id) continue;
                impacts.relationships[relatedCharId] = {
                    change: event.subType === 'TRAUMA' ? -intensity * 0.2 :
                        event.subType === 'JOY' ? intensity * 0.3 :
                            event.subType === 'EMPATHY' ? intensity * 0.4 :
                                intensity * 0.1,
                    reason: event.description || '感情的出来事',
                };
            }
        }
    }

    /**
     * 背景に基づいて発展影響を調整する
     * @private
     * @param impacts 発展影響
     * @param character キャラクター
     */
    private adjustImpactsBasedOnBackground(impacts: any, character: Character): void {
        try {
            // キャラクターのパーソナリティ特性に基づく調整
            if (character.personality && character.personality.traits) {
                for (const trait of character.personality.traits) {
                    const lowerTrait = trait.toLowerCase();

                    // 慎重な性格なら衝動的な変化を抑制
                    if (lowerTrait.includes('慎重') || lowerTrait.includes('堅実')) {
                        if (impacts.personality.impulsivity && impacts.personality.impulsivity > 0) {
                            impacts.personality.impulsivity *= 0.5; // 衝動性の変化を半減
                        }
                    }

                    // 頑固な性格なら変化全般を減少
                    if (lowerTrait.includes('頑固') || lowerTrait.includes('固執')) {
                        for (const key in impacts.personality) {
                            impacts.personality[key] *= 0.7; // 全体的に変化を30%抑制
                        }
                    }

                    // 協調的な性格なら関係性の変化を強化
                    if (lowerTrait.includes('協調') || lowerTrait.includes('社交的')) {
                        for (const key in impacts.relationships) {
                            impacts.relationships[key].change *= 1.2; // 関係性変化を20%増強
                        }
                    }
                }
            }

            // バックストーリーに基づく調整
            if (character.backstory) {
                // トラウマがあれば関連する影響を強化
                if (character.backstory.trauma && character.backstory.trauma.length > 0) {
                    for (const trauma of character.backstory.trauma) {
                        // トラウマに関連するイベントの影響を強化
                        const lowerTrauma = trauma.toLowerCase();

                        // 例: 喪失のトラウマがあれば、別れや喪失関連の影響を強化
                        if (lowerTrauma.includes('喪失') || lowerTrauma.includes('別れ')) {
                            if (impacts.emotional.lastEvent.toLowerCase().includes('別れ') ||
                                impacts.emotional.lastEvent.toLowerCase().includes('喪失')) {
                                impacts.emotional.impact *= 1.5; // 感情的影響を50%増強
                            }
                        }

                        // 例: 裏切りのトラウマがあれば、信頼関連の影響を強化
                        if (lowerTrauma.includes('裏切り') || lowerTrauma.includes('信頼')) {
                            if (impacts.personality.trust) {
                                impacts.personality.trust *= 1.5; // 信頼性の変化を50%増強
                            }
                        }
                    }
                }
            }

            // キャラクター発展履歴に基づく調整
            if (character.history && character.history.developmentPath.length > 0) {
                // 直近の発展と一貫性を持たせる
                const recentDevelopment = character.history.developmentPath[character.history.developmentPath.length - 1];

                if (recentDevelopment && recentDevelopment.description) {
                    const description = recentDevelopment.description.toLowerCase();

                    // 直近の発展が「困難な選択」系なら決断力の変化を強化
                    if (description.includes('選択') || description.includes('決断')) {
                        if (impacts.personality.determination) {
                            impacts.personality.determination *= 1.3; // 決断力の変化を30%増強
                        }
                    }

                    // 直近の発展が「成長」系なら自信の変化を強化
                    if (description.includes('成長') || description.includes('向上')) {
                        if (impacts.personality.confidence) {
                            impacts.personality.confidence *= 1.3; // 自信の変化を30%増強
                        }
                    }
                }
            }
        } catch (error) {
            logger.error(`発展影響調整中にエラーが発生しました`, {
                error: error instanceof Error ? error.message : String(error)
            });
            // エラーは投げずに処理を継続する
        }
    }

    /**
     * 発展段階の評価
     * @param currentStage 現在の段階
     * @param development 発展情報
     * @param type 評価タイプ
     * @returns 新しい発展段階
     */
    evaluateDevelopmentStage(currentStage: number, development: CharacterDevelopment, type: string): number {
        // 発展度の計算
        const personalityDevelopment = Object.values(development.personalityChanges).reduce((sum, val) => sum + Math.abs(val), 0);
        const relationshipDevelopment = Object.values(development.relationshipChanges).reduce((sum, rel) => sum + Math.abs(rel.change), 0);
        const emotionalDevelopment = development.emotionalGrowth?.impact || 0;

        // 重み付けされた発展指数の計算
        const developmentIndex = (
            personalityDevelopment * 0.35 +
            relationshipDevelopment * 0.25 +
            emotionalDevelopment * 0.2 +
            development.narrativeSignificance * 0.2
        );

        // 発展指数に基づいた段階増加の判定
        let stageIncrement = 0;
        if (developmentIndex > 0.5) {
            stageIncrement = 1;
        } else if (developmentIndex > 0.8) {
            stageIncrement = 2;
        }

        // キャラクタータイプに応じた最大段階の制限
        const maxStage = this.MAX_DEVELOPMENT_STAGE[type as keyof typeof this.MAX_DEVELOPMENT_STAGE] || 3;
        return Math.min(maxStage, currentStage + stageIncrement);
    }

    /**
     * 発展段階進行理由の生成
     * @private
     * @param development 発展情報
     * @param character キャラクター
     * @returns 進行理由
     */
    private generateStageProgressionReason(development: CharacterDevelopment, character: Character): string {
        // 最も大きな影響を受けた要素を特定
        const strongestPersonality = this.getStrongestChange(development.personalityChanges);
        const strongestRelationship = this.getStrongestRelationshipChange(development.relationshipChanges);
        const hasEmotionalImpact = development.emotionalGrowth?.impact > 0.5;
        const hasNarrativeSignificance = development.narrativeSignificance > 0.6;

        // 理由のパターン生成
        if (strongestPersonality && strongestPersonality.value > 0.4) {
            return `${character.name}の${strongestPersonality.key}が顕著に変化し、人格の発展が見られる`;
        } else if (strongestRelationship && Math.abs(strongestRelationship.change) > 0.5) {
            const direction = strongestRelationship.change > 0 ? '深まり' : '複雑化し';
            return `他者との関係性が${direction}、視点や価値観に変化をもたらした`;
        } else if (hasEmotionalImpact) {
            return development.emotionalGrowth?.lastEvent || '感情的な成長により内面が発展した';
        } else if (hasNarrativeSignificance) {
            return '物語上の重要な出来事を経験し、存在感や役割が増大した';
        } else {
            return '複数の小さな変化の累積により、次の発展段階へ成長した';
        }
    }

    /**
     * オブジェクト内で最も大きな変化の要素を取得
     * @private
     * @param changes 変化オブジェクト
     * @returns 最大変化要素とその値、または空の場合はnull
     */
    private getStrongestChange(changes: Record<string, number>): { key: string; value: number } | null {
        if (!changes || Object.keys(changes).length === 0) return null;

        let maxKey = Object.keys(changes)[0];
        let maxValue = Math.abs(changes[maxKey]);

        for (const [key, value] of Object.entries(changes)) {
            const absValue = Math.abs(value);
            if (absValue > maxValue) {
                maxKey = key;
                maxValue = absValue;
            }
        }

        return { key: maxKey, value: maxValue };
    }

    /**
     * 関係性オブジェクトで最も大きな変化の要素を取得
     * @private
     * @param changes 関係性変化オブジェクト
     * @returns 最大変化とその情報、または空の場合はnull
     */
    private getStrongestRelationshipChange(
        changes: Record<string, { change: number; reason: string }>
    ): { id: string; change: number; reason: string } | null {
        if (!changes || Object.keys(changes).length === 0) return null;

        let maxId = Object.keys(changes)[0];
        let maxChange = Math.abs(changes[maxId].change);
        let maxReason = changes[maxId].reason;

        for (const [id, data] of Object.entries(changes)) {
            const absChange = Math.abs(data.change);
            if (absChange > maxChange) {
                maxId = id;
                maxChange = absChange;
                maxReason = data.reason;
            }
        }

        return { id: maxId, change: changes[maxId].change, reason: maxReason };
    }

    /**
     * 発展経路生成
     * @param character キャラクター
     * @returns 発展経路
     */
    async generateDevelopmentPath(character: Character): Promise<DevelopmentPath> {
        try {
            const currentStage = character.state.developmentStage || 0;
            const targetStage = this.calculateTargetStage(character);

            // 発展経路フェーズの計算
            const pathPhase = this.determinePathPhase(character, currentStage, targetStage);

            const path: DevelopmentPath = {
                milestones: await this.generateMilestones(currentStage, targetStage, character),
                growthEvents: await this.planGrowthEvents(character, pathPhase),
                transformationArcs: await this.identifyTransformationArcs(character, pathPhase),
                phase: pathPhase,
                targetStage,
                currentStage,
                estimatedCompletionChapter: this.estimateCompletionChapter(character, targetStage)
            };

            logger.info(`発展経路を生成しました: ${character.name} (${character.id}), 現在ステージ: ${currentStage}, 目標ステージ: ${targetStage}, フェーズ: ${pathPhase}`);

            return path;
        } catch (error) {
            logger.error(`発展経路生成中にエラーが発生しました: ${character.name} (${character.id})`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 発展経路フェーズを決定する
     * @private
     * @param character キャラクター
     * @param currentStage 現在の発展段階
     * @param targetStage 目標発展段階
     * @returns 発展経路フェーズ
     */
    private determinePathPhase(
        character: Character,
        currentStage: number,
        targetStage: number
    ): DevelopmentPathPhase {
        // 現在と目標の差から発展段階を決定
        const stageDifference = targetStage - currentStage;

        // キャラクタータイプと発展段階差に基づくフェーズ決定
        if (character.type === 'MAIN') {
            if (currentStage === 0) return 'INTRODUCTION';
            if (currentStage >= targetStage) return 'REFINEMENT';
            if (stageDifference > 2) return 'MAJOR_TRANSFORMATION';
            return 'PROGRESSION';
        } else if (character.type === 'SUB') {
            if (currentStage === 0) return 'INTRODUCTION';
            if (currentStage >= targetStage) return 'SUPPORTING_ROLE';
            return 'MINOR_DEVELOPMENT';
        } else { // MOB
            return 'STATIC';
        }
    }

    /**
     * 目標達成の予想チャプターを推定する
     * @private
     * @param character キャラクター
     * @param targetStage 目標段階
     * @returns 予想達成チャプター
     */
    private estimateCompletionChapter(character: Character, targetStage: number): number {
        const currentStage = character.state.developmentStage || 0;
        const lastAppearance = character.state.lastAppearance || 0;

        // 段階差に基づく必要チャプター数の計算
        const stageDifference = targetStage - currentStage;
        let estimatedChaptersNeeded = 0;

        switch (character.type) {
            case 'MAIN':
                estimatedChaptersNeeded = stageDifference * 8; // メインは平均8章/段階
                break;
            case 'SUB':
                estimatedChaptersNeeded = stageDifference * 12; // サブは平均12章/段階
                break;
            case 'MOB':
                estimatedChaptersNeeded = stageDifference * 15; // モブは平均15章/段階
                break;
            default:
                estimatedChaptersNeeded = stageDifference * 10;
        }

        // 過去の発展速度の考慮（履歴がある場合）
        if (character.history.developmentPath && character.history.developmentPath.length > 1) {
            const history = character.history.developmentPath;
            const latestMilestones = history.slice(-2); // 最新の2つのマイルストーン

            // 前回の段階進行が記録されている場合、その所要チャプター数を参考にする
            if (latestMilestones.length === 2 &&
                latestMilestones[0].chapterNumber &&
                latestMilestones[1].chapterNumber) {
                const previousProgressionChapters = latestMilestones[1].chapterNumber - latestMilestones[0].chapterNumber;
                // 過去の進行速度と標準的な進行速度の重み付け平均
                estimatedChaptersNeeded = Math.round((estimatedChaptersNeeded + previousProgressionChapters * 2) / 3);
            }
        }

        return lastAppearance + estimatedChaptersNeeded;
    }

    /**
     * 目標発展段階を計算する
     * @private
     * @param character キャラクター
     * @returns 目標発展段階
     */
    private calculateTargetStage(character: Character): number {
        // キャラクタータイプに応じた目標段階
        return this.MAX_DEVELOPMENT_STAGE[character.type as keyof typeof this.MAX_DEVELOPMENT_STAGE] || 3;
    }

    /**
     * 発展マイルストーンを生成する
     * @private
     * @param currentStage 現在の発展段階
     * @param targetStage 目標発展段階
     * @param character キャラクター
     * @returns マイルストーン配列
     */
    private async generateMilestones(
        currentStage: number,
        targetStage: number,
        character: Character
    ): Promise<Milestone[]> {
        try {
            const milestones: Milestone[] = [];

            // 現在から目標までの各段階のマイルストーンを生成
            for (let stage = currentStage + 1; stage <= targetStage; stage++) {
                milestones.push({
                    stage,
                    description: await this.generateMilestoneDescription(stage, character),
                    requirements: this.generateStageRequirements(stage, character),
                    estimatedChapter: this.estimateChapterForStage(stage, character),
                    achieved: false
                });
            }

            return milestones;
        } catch (error) {
            logger.error(`マイルストーン生成中にエラーが発生しました: ${character.name}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * マイルストーンの説明を生成する
     * @private
     * @param stage 発展段階
     * @param character キャラクター
     * @returns マイルストーン説明
     */
    private async generateMilestoneDescription(stage: number, character: Character): Promise<string> {
        // キャラクタータイプ別の説明パターン
        const stageDescriptionsByType = {
            'MAIN': [
                "初期状態",
                "基本的な特徴と動機の確立",
                "最初の内的葛藤と小さな変化",
                "重要な選択とその結果による変化",
                "深い内的葛藤と変容のきっかけ",
                "完全な性格的変容と新たな自己実現"
            ],
            'SUB': [
                "初期状態",
                "主要キャラクターとの関係確立",
                "独自の小さな目標と課題の登場",
                "物語への独自の貢献とアイデンティティ確立"
            ],
            'MOB': [
                "初期状態",
                "特徴的な役割の確立と安定した印象の形成"
            ]
        };

        // キャラクタータイプに応じた説明の取得
        const descriptions = stageDescriptionsByType[character.type as keyof typeof stageDescriptionsByType] ||
            stageDescriptionsByType['SUB']; // デフォルトはSUB用の説明

        // キャラクター特有の要素を含む説明文の生成
        let baseDescription = descriptions[stage] || "未定義の発展段階";

        // キャラクター特性に基づくカスタマイズ
        if (character.personality && character.personality.traits) {
            const traits = character.personality.traits;

            // 特性に基づく追加修飾
            if (traits.some(t => t.includes('勇敢') || t.includes('冒険'))) {
                baseDescription += "。冒険的かつ勇敢な行動を通じて成長";
            } else if (traits.some(t => t.includes('内向') || t.includes('思慮'))) {
                baseDescription += "。内省と深い思考を通じた洞察力の向上";
            } else if (traits.some(t => t.includes('社交') || t.includes('協調'))) {
                baseDescription += "。他者との関係性の中で自己を見出す";
            }
        }

        // 発展段階に応じた役割の明確化
        if (character.type === 'MAIN' && stage >= 3) {
            baseDescription += "。物語の中心として明確な立ち位置を確立";
        } else if (character.type === 'SUB' && stage >= 2) {
            baseDescription += "。主要キャラクターのサポートと独自の側面を両立";
        }

        return `ステージ${stage}: ${baseDescription}`;
    }

    /**
     * 段階ごとの要件を生成する
     * @private
     * @param stage 発展段階
     * @param character キャラクター
     * @returns 段階要件
     */
    private generateStageRequirements(stage: number, character: Character): any {
        // 基本要件
        const baseRequirements = {
            appearances: 2 * stage,
            conflicts: stage,
            relationships: stage
        };

        // キャラクタータイプに応じた追加要件
        if (character.type === 'MAIN') {
            // メインキャラクターの追加要件
            return {
                ...baseRequirements,
                challenges: Math.max(1, stage - 1),
                revelations: Math.max(0, stage - 2),
                transformativeEvent: stage >= 4 ? 1 : 0,
                resolution: stage >= 5 ? 1 : 0
            };
        } else if (character.type === 'SUB') {
            // サブキャラクターの追加要件
            return {
                ...baseRequirements,
                supportiveActions: stage,
                characterDevelopment: Math.max(0, stage - 1),
                uniqueContribution: stage >= 3 ? 1 : 0
            };
        } else {
            // モブキャラクターの要件
            return {
                appearances: stage * 3,
                recognition: 1, // 読者が認識できる特徴的な要素
                consistency: stage // 一貫した描写
            };
        }
    }

    /**
     * 段階到達の予測チャプターを推定する
     * @private
     * @param stage 発展段階
     * @param character キャラクター
     * @returns 予測チャプター
     */
    private estimateChapterForStage(stage: number, character: Character): number {
        // 簡略化した実装：キャラクタータイプによるスケーリング
        const baseChapters = {
            'MAIN': [5, 10, 20, 35, 45],
            'SUB': [10, 25, 40],
            'MOB': [15]
        };

        // 現在の登場チャプターを考慮
        const currentChapter = character.state.lastAppearance || 0;

        const stageIndex = stage - 1;
        const typeMappings = baseChapters[character.type as keyof typeof baseChapters] || [];

        // マッピングがある場合はそれを使用、ない場合は計算
        if (typeMappings[stageIndex] !== undefined) {
            return Math.max(currentChapter + 1, typeMappings[stageIndex]);
        }

        // 標準的な予測値の計算
        const baseChapter = ((stage * 10) + (character.type === 'MAIN' ? 0 : 10));

        // 現在のチャプターより先に設定
        return Math.max(currentChapter + 5, baseChapter);
    }

    /**
     * 成長イベントを計画する
     * @private
     * @param character キャラクター
     * @param pathPhase 発展経路フェーズ
     * @returns 成長イベント配列
     */
    private async planGrowthEvents(
        character: Character,
        pathPhase: DevelopmentPathPhase
    ): Promise<GrowthEvent[]> {
        try {
            // キャラクターの特性、目標、背景に基づいて成長イベントを計画
            const growthEvents: GrowthEvent[] = [];
            const currentStage = character.state.developmentStage || 0;
            const targetStage = this.calculateTargetStage(character);

            // フェーズに基づくイベント数の決定
            let eventCount = 0;

            switch (pathPhase) {
                case 'INTRODUCTION':
                    eventCount = 2; // 導入は少なめ
                    break;
                case 'PROGRESSION':
                    eventCount = Math.min(4, (targetStage - currentStage) * 2); // 段階差に比例
                    break;
                case 'MAJOR_TRANSFORMATION':
                    eventCount = Math.min(6, (targetStage - currentStage) * 2); // 大きな変化には多め
                    break;
                case 'REFINEMENT':
                    eventCount = 2; // 微調整は少なめ
                    break;
                case 'MINOR_DEVELOPMENT':
                    eventCount = 3; // 小さな発展は中程度
                    break;
                case 'SUPPORTING_ROLE':
                    eventCount = 2; // サポート役は少なめ
                    break;
                case 'STATIC':
                    eventCount = 1; // 静的キャラクターは最小限
                    break;
                default:
                    eventCount = 3; // デフォルト
            }

            // 最後の登場チャプターを基準に分散配置
            const lastAppearance = character.state.lastAppearance || 0;
            const estimatedCompletionChapter = this.estimateCompletionChapter(character, targetStage);
            const chapterRange = estimatedCompletionChapter - lastAppearance;

            // イベントの配置（最終チャプターまで分散）
            for (let i = 0; i < eventCount; i++) {
                // イベントの位置（進行度に応じて分散）
                const progression = (i + 1) / (eventCount + 1); // 0～1の範囲での相対位置
                const eventChapter = Math.floor(lastAppearance + (chapterRange * progression));

                // フェーズとインデックスに基づいたイベントタイプの選択
                const eventType = this.selectGrowthEventType(pathPhase, i, eventCount, character);

                // 前後のイベントを参照して一貫性のある説明を生成
                const prevEvent = growthEvents.length > 0 ? growthEvents[growthEvents.length - 1] : null;
                const description = this.generateGrowthEventDescription(
                    eventType, character, pathPhase, i, prevEvent
                );

                growthEvents.push({
                    type: eventType,
                    targetChapter: eventChapter,
                    description,
                    significance: this.calculateEventSignificance(pathPhase, i, eventCount),
                    triggers: this.generateEventTriggers(eventType, character),
                    outcomes: this.generatePotentialOutcomes(eventType, character),
                    completed: false
                });
            }

            return growthEvents;
        } catch (error) {
            logger.error(`成長イベント計画中にエラーが発生しました: ${character.name}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 成長イベントタイプを選択する
     * @private
     * @param pathPhase 発展経路フェーズ
     * @param index イベントインデックス
     * @param totalEvents 総イベント数
     * @param character キャラクター
     * @returns イベントタイプ
     */
    private selectGrowthEventType(
        pathPhase: DevelopmentPathPhase,
        index: number,
        totalEvents: number,
        character: Character
    ): string {
        // フェーズごとの適切なイベントタイプ
        const eventTypesByPhase: Record<DevelopmentPathPhase, string[]> = {
            'INTRODUCTION': ['CHALLENGE', 'RELATIONSHIP', 'REVELATION'],
            'PROGRESSION': ['CHALLENGE', 'RELATIONSHIP', 'CHOICE', 'LEARNING', 'EMOTIONAL'],
            'MAJOR_TRANSFORMATION': ['CONFLICT', 'REVELATION', 'SACRIFICE', 'EMOTIONAL', 'CHOICE'],
            'REFINEMENT': ['LEARNING', 'RELATIONSHIP', 'SKILL_DEVELOPMENT'],
            'MINOR_DEVELOPMENT': ['CHALLENGE', 'RELATIONSHIP', 'SKILL_DEVELOPMENT'],
            'SUPPORTING_ROLE': ['RELATIONSHIP', 'SACRIFICE', 'SUPPORT'],
            'STATIC': ['BACKDROP', 'CONSISTENT_ROLE']
        };

        const defaultTypes = ['CHALLENGE', 'RELATIONSHIP', 'EMOTIONAL'];

        // フェーズに応じたイベントタイプのプール
        const eventPool = eventTypesByPhase[pathPhase] || defaultTypes;

        // イベントの位置に応じた選択（初期、中間、後期）
        const relativePosition = totalEvents <= 1 ? 'middle' :
            index === 0 ? 'start' :
                index === totalEvents - 1 ? 'end' : 'middle';

        // 位置に応じたバイアス
        if (relativePosition === 'start') {
            // 導入的なイベント
            const startEvents = ['CHALLENGE', 'RELATIONSHIP', 'REVELATION'].filter(t => eventPool.includes(t));
            if (startEvents.length > 0) {
                return startEvents[Math.floor(Math.random() * startEvents.length)];
            }
        } else if (relativePosition === 'end') {
            // 集大成的なイベント
            const endEvents = ['CONFLICT', 'CHOICE', 'SACRIFICE', 'REVELATION'].filter(t => eventPool.includes(t));
            if (endEvents.length > 0) {
                return endEvents[Math.floor(Math.random() * endEvents.length)];
            }
        }

        // ランダム選択（どのフェーズにも当てはまらない場合）
        return eventPool[Math.floor(Math.random() * eventPool.length)];
    }

    /**
     * 成長イベントの説明を生成する
     * @private
     * @param eventType イベントタイプ
     * @param character キャラクター
     * @param pathPhase 発展経路フェーズ
     * @param index イベントインデックス
     * @param prevEvent 前のイベント
     * @returns イベント説明
     */
    private generateGrowthEventDescription(
        eventType: string,
        character: Character,
        pathPhase: DevelopmentPathPhase,
        index: number,
        prevEvent: GrowthEvent | null
    ): string {
        // イベントタイプに応じた基本説明テンプレート
        const descriptionTemplates: Record<string, string[]> = {
            'CHALLENGE': [
                '予期せぬ障害に直面し、それを乗り越える',
                '自身の限界に挑戦し、能力を試される',
                '困難な状況で適応力と忍耐力を試される'
            ],
            'RELATIONSHIP': [
                '重要な関係性の変化や発展',
                '新たな人間関係の形成と既存の関係の再評価',
                '他者との深い絆の形成または断絶'
            ],
            'REVELATION': [
                '重要な真実や秘密の発見',
                '自己理解や世界観を変える啓示',
                '隠されていた情報が明らかになる'
            ],
            'CHOICE': [
                '人格や将来を決定する重大な選択',
                '相反する価値観の間での苦渋の決断',
                '他者との関係性に影響する選択'
            ],
            'CONFLICT': [
                '直接的な対立や争い',
                '価値観や目標の衝突',
                '内部葛藤と自己との対峙'
            ],
            'SACRIFICE': [
                '大切なものを手放す決断',
                '他者のために自らを犠牲にする',
                '成長のために過去との決別'
            ],
            'LEARNING': [
                '新たなスキルや知識の習得',
                '失敗からの学びと成長',
                '人生の教訓を得る経験'
            ],
            'EMOTIONAL': [
                '感情的な転機や成長',
                '強い感情体験による内面の変化',
                '感情の解放や理解'
            ],
            'SKILL_DEVELOPMENT': [
                '特定の能力や技術の向上',
                '専門知識の深化',
                '新たな才能の発見と開発'
            ],
            'SUPPORT': [
                '他者の成長や目標達成をサポート',
                '主要人物の助力者としての役割',
                '支援を通じた間接的な成長'
            ],
            'BACKDROP': [
                '背景的存在としての一貫した役割',
                '物語の世界観を豊かにする存在',
                '特定の場所や文化の代表者'
            ],
            'CONSISTENT_ROLE': [
                '安定した役割の継続と洗練',
                '特徴的な存在としての印象強化',
                '物語に一貫性をもたらす象徴的存在'
            ]
        };

        // イベントタイプに基づくテンプレート選択
        const templates = descriptionTemplates[eventType] || ['成長の機会'];
        const baseTemplate = templates[Math.floor(Math.random() * templates.length)];

        // キャラクター名を含める
        let description = `${character.name}は${baseTemplate}`;

        // 一貫性のために前のイベントを参照（あれば）
        if (prevEvent) {
            // 特定の組み合わせに対する接続フレーズ
            if (prevEvent.type === 'CHALLENGE' && eventType === 'LEARNING') {
                description += `。以前の挑戦から得た教訓を活かし`;
            } else if (prevEvent.type === 'REVELATION' && eventType === 'CHOICE') {
                description += `。明らかになった真実に基づいて`;
            } else if (prevEvent.type === 'RELATIONSHIP' && eventType === 'EMOTIONAL') {
                description += `。関係性の変化から生じた感情と向き合い`;
            }
        }

        // フェーズに基づく追加修飾
        if (pathPhase === 'MAJOR_TRANSFORMATION') {
            description += '。この経験が人格の根本的な変容をもたらす';
        } else if (pathPhase === 'REFINEMENT') {
            description += '。すでに確立された特性をさらに洗練させる';
        } else if (pathPhase === 'SUPPORTING_ROLE') {
            description += '。物語の中での役割を強化する';
        }

        return description;
    }

    /**
     * キャラクターの全成長計画を取得する
     * @param characterId キャラクターID
     * @returns 成長計画の配列
     */
    async getCharacterGrowthPlans(characterId: string): Promise<GrowthPlan[]> {
        try {
            // キャラクターが存在するか確認
            const character = await characterRepository.getCharacterById(characterId);
            if (!character) {
                throw new NotFoundError('Character', characterId);
            }

            // このキャラクターの成長計画IDを取得
            const planIds = this.characterGrowthPlans.get(characterId) || [];

            // 成長計画オブジェクトの取得
            const plans: GrowthPlan[] = [];
            for (const planId of planIds) {
                const plan = this.growthPlans.get(planId);
                if (plan) {
                    plans.push(plan);
                }
            }

            // activeGrowthPlanIdがあり、それがplansに含まれていない場合は追加
            if (character.state.activeGrowthPlanId &&
                !plans.some(p => p.id === character.state.activeGrowthPlanId)) {
                const activePlan = await this.getActiveGrowthPlan(characterId);
                if (activePlan) {
                    plans.push(activePlan);
                }
            }

            return plans;
        } catch (error) {
            logger.error(`キャラクターの成長計画取得に失敗しました: ${characterId}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * キャラクターに成長計画を追加する
     * @param characterId キャラクターID
     * @param plan 成長計画 (IDは自動生成)
     * @returns 作成された成長計画
     */
    async addGrowthPlan(
        characterId: string,
        plan: Omit<GrowthPlan, 'id' | 'characterId'>
    ): Promise<GrowthPlan> {
        // キャラクターの存在確認
        const character = await characterRepository.getCharacterById(characterId);
        if (!character) {
            throw new NotFoundError('Character', characterId);
        }

        // 成長計画のID生成
        const planId = generateId();

        // 成長計画オブジェクト作成
        const createdPlan: GrowthPlan = {
            id: planId,
            characterId,
            ...plan
        };

        // キャッシュに保存
        this.growthPlans.set(planId, createdPlan);

        // キャラクター成長計画リストにも追加
        if (!this.characterGrowthPlans.has(characterId)) {
            this.characterGrowthPlans.set(characterId, []);
        }
        const characterPlans = this.characterGrowthPlans.get(characterId);
        if (characterPlans) {
            characterPlans.push(planId);
        }

        // 計画が活性状態なら、キャラクター状態のアクティブプランIDも更新
        if (createdPlan.isActive) {
            await characterRepository.updateCharacterProperty(
                characterId,
                'state.activeGrowthPlanId',
                createdPlan.id
            );
        }

        logger.info(`キャラクター ${character.name} に成長計画 ${createdPlan.name} (${createdPlan.id}) を追加しました`);
        return createdPlan;
    }

    /**
     * イベントの重要度を計算する
     * @private
     * @param pathPhase 発展経路フェーズ
     * @param index イベントインデックス
     * @param totalEvents 総イベント数
     * @returns 重要度（0-1）
     */
    private calculateEventSignificance(
        pathPhase: DevelopmentPathPhase,
        index: number,
        totalEvents: number
    ): number {
        // 基本重要度（位置に基づく）
        const baseSignificance = totalEvents <= 1 ? 0.5 : ((index + 1) / totalEvents);

        // フェーズによる重要度の調整
        const phaseMultiplier: Record<DevelopmentPathPhase, number> = {
            'INTRODUCTION': 0.7,
            'PROGRESSION': 0.8,
            'MAJOR_TRANSFORMATION': 1.0,
            'REFINEMENT': 0.6,
            'MINOR_DEVELOPMENT': 0.7,
            'SUPPORTING_ROLE': 0.5,
            'STATIC': 0.3
        };

        // 計算（0.3～1.0の範囲に収める）
        const multiplier = phaseMultiplier[pathPhase] || 0.7;
        return Math.min(1.0, Math.max(0.3, baseSignificance * multiplier));
    }

    /**
     * イベントのトリガー条件を生成する
     * @private
     * @param eventType イベントタイプ
     * @param character キャラクター
     * @returns トリガー条件配列
     */
    private generateEventTriggers(eventType: string, character: Character): string[] {
        // イベントタイプごとの一般的なトリガー
        const commonTriggers: Record<string, string[]> = {
            'CHALLENGE': [
                '障害や困難な状況との遭遇',
                '能力や限界を試される状況',
                '予期せぬ問題の発生'
            ],
            'RELATIONSHIP': [
                '重要な他者との対話',
                '関係性の転機となる出来事',
                '新たな人物との出会い'
            ],
            'REVELATION': [
                '隠された情報の発見',
                '予想外の事実の露呈',
                '過去の出来事に関する新たな視点'
            ],
            'CHOICE': [
                '岐路に立たされる状況',
                '相反する価値観の間で決断を迫られる',
                '重大な影響を持つ選択'
            ],
            'CONFLICT': [
                '対立する価値観や目標を持つ人物との遭遇',
                '利害の衝突',
                '内部矛盾の顕在化'
            ],
            'SACRIFICE': [
                '他者のための自己犠牲の機会',
                '大切なものと目標の間での選択',
                '高い代償を伴う決断'
            ],
            'LEARNING': [
                '新たな知識やスキルへの接触',
                '師や導き手との出会い',
                '失敗からの教訓'
            ],
            'EMOTIONAL': [
                '感情的な刺激の強い出来事',
                '過去のトラウマを呼び起こす状況',
                '重要な関係性における変化'
            ]
        };

        // キャラクター特有のトリガー要素を追加
        const specificTriggers: string[] = [];

        // 性格特性に基づくトリガー
        if (character.personality && character.personality.traits) {
            for (const trait of character.personality.traits) {
                const lowerTrait = trait.toLowerCase();

                if (lowerTrait.includes('好奇心') && ['REVELATION', 'LEARNING'].includes(eventType)) {
                    specificTriggers.push('謎めいた状況や未知の領域との遭遇');
                } else if (lowerTrait.includes('正義') && ['CONFLICT', 'CHOICE', 'SACRIFICE'].includes(eventType)) {
                    specificTriggers.push('不正や不公平な状況への直面');
                } else if (lowerTrait.includes('慎重') && ['CHOICE', 'CHALLENGE'].includes(eventType)) {
                    specificTriggers.push('リスクを伴う状況での決断');
                } else if (lowerTrait.includes('情熱') && ['EMOTIONAL', 'RELATIONSHIP'].includes(eventType)) {
                    specificTriggers.push('強い感情を引き起こす出来事や人物との接触');
                }
            }
        }

        // バックストーリーに基づくトリガー
        if (character.backstory) {
            if (character.backstory.trauma && character.backstory.trauma.length > 0) {
                specificTriggers.push('過去のトラウマを彷彿とさせる状況');
            }

            if (character.backstory.significantEvents && character.backstory.significantEvents.length > 0) {
                specificTriggers.push('過去の重要な経験に類似した状況');
            }
        }

        // 一般的なトリガーと特定のトリガーを組み合わせる
        const generalTriggers = commonTriggers[eventType] || ['状況や出来事'];
        const selectedGeneralTriggers = generalTriggers.slice(0, 2);

        return [...selectedGeneralTriggers, ...specificTriggers].slice(0, 3); // 最大3つまで
    }

    /**
     * イベントの潜在的な結果を生成する
     * @private
     * @param eventType イベントタイプ
     * @param character キャラクター
     * @returns 潜在的結果配列
     */
    private generatePotentialOutcomes(eventType: string, character: Character): string[] {
        // イベントタイプごとの一般的な結果
        const commonOutcomes: Record<string, string[]> = {
            'CHALLENGE': [
                '成功：自信と能力の向上',
                '部分的成功：教訓と適応力の獲得',
                '失敗：謙虚さと回復力の発展'
            ],
            'RELATIONSHIP': [
                '絆の強化と深化',
                '関係性の再定義',
                '距離感の変化と再評価'
            ],
            'REVELATION': [
                '世界観の拡大と再構築',
                '自己認識の変化',
                '動機や目標の再評価'
            ],
            'CHOICE': [
                '選択の結果への対処と責任',
                '新たな道への適応',
                '選択の帰結による価値観の変化'
            ],
            'CONFLICT': [
                '勝利と自己肯定',
                '妥協と相互理解',
                '敗北と謙虚さの獲得'
            ],
            'SACRIFICE': [
                '高い代償を伴う成長',
                '他者との絆の強化',
                '自己価値の再発見'
            ],
            'LEARNING': [
                '新たなスキルの習得',
                '知識の深化と応用',
                '視野の拡大'
            ],
            'EMOTIONAL': [
                '感情の理解と受容',
                '内面的な癒しと成長',
                '感情表現能力の向上'
            ]
        };

        // キャラクター特有の結果要素を追加
        const specificOutcomes: string[] = [];

        // キャラクタータイプによる結果の差別化
        if (character.type === 'MAIN') {
            specificOutcomes.push('物語内での役割と存在感の増大');
        } else if (character.type === 'SUB') {
            specificOutcomes.push('主要キャラクターとの関係性を通じた発展');
        } else { // MOB
            specificOutcomes.push('一貫性のある印象の強化');
        }

        // 発展段階による違い
        const currentStage = character.state.developmentStage || 0;
        if (currentStage < 2) {
            specificOutcomes.push('キャラクター特性の初期確立');
        } else if (currentStage < 4) {
            specificOutcomes.push('既存の特性の複雑化と深化');
        } else {
            specificOutcomes.push('内面的変容と新たな次元の獲得');
        }

        // 一般的な結果と特定の結果を組み合わせる
        const generalOutcomes = commonOutcomes[eventType] || ['成長と変化'];
        const selectedGeneralOutcomes = generalOutcomes.slice(0, 2);

        return [...selectedGeneralOutcomes, ...specificOutcomes].slice(0, 3); // 最大3つまで
    }

    /**
     * 変容アークを識別する
     * @private
     * @param character キャラクター
     * @param pathPhase 発展経路フェーズ
     * @returns 変容アーク配列
     */
    private async identifyTransformationArcs(
        character: Character,
        pathPhase: DevelopmentPathPhase
    ): Promise<TransformationArc[]> {
        try {
            // キャラクターの背景、目標、性格に基づいて変容アークを特定
            const arcs: TransformationArc[] = [];

            // フェーズに基づくアーク生成の決定
            if (pathPhase === 'STATIC' || pathPhase === 'SUPPORTING_ROLE') {
                // 静的キャラクターや単純なサポート役には複雑なアークは不要
                return [];
            }

            // キャラクタータイプと発展フェーズに基づいてアークタイプを選択
            let arcTypes: ArcType[] = [];

            if (character.type === 'MAIN') {
                // メインキャラクター用のアークタイプ
                if (pathPhase === 'MAJOR_TRANSFORMATION') {
                    arcTypes = ['REDEMPTION', 'CORRUPTION', 'TRAGEDY', 'REBIRTH'];
                } else if (pathPhase === 'PROGRESSION') {
                    arcTypes = ['GROWTH', 'MATURATION', 'EDUCATION', 'ENLIGHTENMENT'];
                } else {
                    arcTypes = ['GROWTH', 'DISCOVERY'];
                }
            } else if (character.type === 'SUB') {
                // サブキャラクター用のアークタイプ
                if (pathPhase === 'MINOR_DEVELOPMENT') {
                    arcTypes = ['GROWTH', 'DISCOVERY', 'SUPPORTING'];
                } else {
                    arcTypes = ['SUPPORTING', 'PARALLEL'];
                }
            } else {
                // MOBは通常アークを持たない
                return [];
            }

            // キャラクターの特性に最も合うアークを選択
            const selectableArcs = this.filterArcsBasedOnCharacter(arcTypes, character);

            // 発展フェーズと現状に基づいてアークの詳細を調整
            for (const arcType of selectableArcs) {
                const arc = this.constructTransformationArc(arcType, character, pathPhase);
                if (arc) {
                    arcs.push(arc);
                }

                // 通常は最大2つのアークに制限
                if (arcs.length >= (character.type === 'MAIN' ? 2 : 1)) {
                    break;
                }
            }

            return arcs;
        } catch (error) {
            logger.error(`変容アーク識別中にエラーが発生しました: ${character.name}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * キャラクターの特性に基づいてアークをフィルタリングする
     * @private
     * @param arcTypes アークタイプ配列
     * @param character キャラクター
     * @returns フィルタリングされたアークタイプ配列
     */
    private filterArcsBasedOnCharacter(arcTypes: ArcType[], character: Character): ArcType[] {
        // 性格特性に基づくフィルタリング
        if (character.personality && character.personality.traits) {
            const traits = character.personality.traits.map(t => t.toLowerCase());

            // 性格特性に基づく適合性の高いアークを優先
            const prioritizedArcs: ArcType[] = [];

            // 特定の特性とアークの相性を評価
            if (traits.some(t => t.includes('正義') || t.includes('道徳'))) {
                if (arcTypes.includes('REDEMPTION')) prioritizedArcs.push('REDEMPTION');
                if (arcTypes.includes('FALL')) prioritizedArcs.push('FALL');
            }

            if (traits.some(t => t.includes('内向') || t.includes('思慮'))) {
                if (arcTypes.includes('ENLIGHTENMENT')) prioritizedArcs.push('ENLIGHTENMENT');
                if (arcTypes.includes('DISCOVERY')) prioritizedArcs.push('DISCOVERY');
            }

            if (traits.some(t => t.includes('野心') || t.includes('権力'))) {
                if (arcTypes.includes('CORRUPTION')) prioritizedArcs.push('CORRUPTION');
                if (arcTypes.includes('DISILLUSIONMENT')) prioritizedArcs.push('DISILLUSIONMENT');
            }

            if (traits.some(t => t.includes('成長') || t.includes('冒険'))) {
                if (arcTypes.includes('GROWTH')) prioritizedArcs.push('GROWTH');
                if (arcTypes.includes('MATURATION')) prioritizedArcs.push('MATURATION');
            }

            if (traits.some(t => t.includes('協調') || t.includes('支援'))) {
                if (arcTypes.includes('SUPPORTING')) prioritizedArcs.push('SUPPORTING');
                if (arcTypes.includes('PARALLEL')) prioritizedArcs.push('PARALLEL');
            }

            // 優先アークが見つかった場合はそれを先頭に
            if (prioritizedArcs.length > 0) {
                // 優先アークを先頭に、残りは元の順序で
                const remainingArcs = arcTypes.filter(arc => !prioritizedArcs.includes(arc));
                return [...prioritizedArcs, ...remainingArcs];
            }
        }

        // フィルタリング条件に合わない場合は元のリストを返す
        return arcTypes;
    }

    /**
     * 変容アークを構築する
     * @private
     * @param arcType アークタイプ
     * @param character キャラクター
     * @param pathPhase 発展経路フェーズ
     * @returns 変容アーク
     */
    private constructTransformationArc(
        arcType: ArcType,
        character: Character,
        pathPhase: DevelopmentPathPhase
    ): TransformationArc | null {
        // 現在の発展段階と目標段階
        const currentStage = character.state.developmentStage || 0;
        const targetStage = this.calculateTargetStage(character);

        // アークの説明テンプレート
        const arcDescriptions: Record<ArcType, string> = {
            'REDEMPTION': '過ちを認識し、償い、より良い人物になる旅',
            'FALL': '善から悪へ、希望から絶望への下降',
            'GROWTH': '経験を通じた能力と自己理解の向上',
            'CORRUPTION': '理想や価値観の崩壊と道徳的堕落',
            'DISILLUSIONMENT': '幻想や信念が崩れ、現実を受け入れる過程',
            'MATURATION': '子供から大人へ、未熟から成熟への成長',
            'EDUCATION': '知識や経験の獲得による視野の拡大',
            'ENLIGHTENMENT': '深い洞察や悟りへの到達',
            'TRAGEDY': '運命的な失敗や破滅への不可避な道',
            'REBIRTH': '古い自己の死と新たな自己の誕生',
            'DISCOVERY': '自己や世界についての新たな理解',
            'SUPPORTING': '他者の成長や旅を支援する役割',
            'PARALLEL': '主要キャラクターと並行した発展と対比'
        };

        // アークのステージ配置（開始、ピーク、解決）を決定
        let beginStage = currentStage;
        let peakStage: number;
        let resolutionStage: number;

        if (pathPhase === 'MAJOR_TRANSFORMATION' || pathPhase === 'PROGRESSION') {
            // 大きな変化や発展の場合、アークは全段階にわたる
            peakStage = Math.floor((targetStage + currentStage) / 2);
            resolutionStage = targetStage;
        } else if (pathPhase === 'REFINEMENT' || pathPhase === 'MINOR_DEVELOPMENT') {
            // 洗練や小さな発展の場合、より短いアーク
            peakStage = currentStage + 1;
            resolutionStage = Math.min(targetStage, currentStage + 2);
        } else {
            // その他の場合は最小限のアーク
            peakStage = currentStage;
            resolutionStage = Math.min(targetStage, currentStage + 1);
        }

        // アークの主要テーマを生成
        const mainTheme = this.generateArcTheme(arcType, character);

        // アークのキーポイントを生成
        const keyPoints = this.generateArcKeyPoints(arcType, character, beginStage, peakStage, resolutionStage);

        return {
            type: arcType,
            description: arcDescriptions[arcType],
            theme: mainTheme,
            beginStage,
            peakStage,
            resolutionStage,
            keyPoints
        };
    }

    /**
     * アークの主要テーマを生成する
     * @private
     * @param arcType アークタイプ
     * @param character キャラクター
     * @returns アークテーマ
     */
    private generateArcTheme(arcType: ArcType, character: Character): string {
        // キャラクターの特性に基づくテーマのカスタマイズ
        let baseTheme = '';

        switch (arcType) {
            case 'REDEMPTION':
                baseTheme = '過ちからの償いと自己許容';
                break;
            case 'FALL':
                baseTheme = '理想の崩壊と道徳的下降';
                break;
            case 'GROWTH':
                baseTheme = '経験を通じた成長と自己発見';
                break;
            case 'CORRUPTION':
                baseTheme = '権力や誘惑による価値観の変化';
                break;
            case 'DISILLUSIONMENT':
                baseTheme = '幻想の崩壊と現実受容';
                break;
            case 'MATURATION':
                baseTheme = '未熟さから成熟への成長過程';
                break;
            case 'EDUCATION':
                baseTheme = '知識と経験による視野の拡大';
                break;
            case 'ENLIGHTENMENT':
                baseTheme = '深い洞察と理解への到達';
                break;
            case 'TRAGEDY':
                baseTheme = '不可避な運命と失敗';
                break;
            case 'REBIRTH':
                baseTheme = '古い自己の死と新たな始まり';
                break;
            case 'DISCOVERY':
                baseTheme = '自己と世界の新たな理解';
                break;
            case 'SUPPORTING':
                baseTheme = '他者の旅を支える役割の受容';
                break;
            case 'PARALLEL':
                baseTheme = '主要人物と対をなす発展';
                break;
            default:
                baseTheme = '人格的成長と変化';
        }

        // キャラクター特性に基づくテーマのパーソナライズ
        if (character.personality && character.personality.traits) {
            const traits = character.personality.traits.map(t => t.toLowerCase());

            // 内向的/思慮深い
            if (traits.some(t => t.includes('内向') || t.includes('思慮'))) {
                baseTheme += '、内省と自己分析を通して';
            }
            // 外向的/行動的
            else if (traits.some(t => t.includes('外向') || t.includes('行動'))) {
                baseTheme += '、行動と経験を通して';
            }

            // 勇敢/冒険的
            if (traits.some(t => t.includes('勇敢') || t.includes('冒険'))) {
                baseTheme += '、困難への挑戦により';
            }
            // 慎重/控えめ
            else if (traits.some(t => t.includes('慎重') || t.includes('控えめ'))) {
                baseTheme += '、熟考と理解により';
            }

            // 理想主義的
            if (traits.some(t => t.includes('理想') || t.includes('正義'))) {
                baseTheme += '、理想と現実の間で';
            }
            // 現実主義的
            else if (traits.some(t => t.includes('現実') || t.includes('実用'))) {
                baseTheme += '、実際的な結果を求めて';
            }
        }

        // バックストーリーに基づく追加のテーマ要素
        if (character.backstory) {
            if (character.backstory.trauma && character.backstory.trauma.length > 0) {
                baseTheme += '、過去のトラウマとの和解を経て';
            }

            if (character.backstory.significantEvents && character.backstory.significantEvents.length > 0) {
                baseTheme += '、過去の経験により形作られ';
            }
        }

        return baseTheme;
    }

    /**
     * アークのキーポイントを生成する
     * @private
     * @param arcType アークタイプ
     * @param character キャラクター
     * @param beginStage 開始段階
     * @param peakStage ピーク段階
     * @param resolutionStage 解決段階
     * @returns キーポイント配列
     */
    private generateArcKeyPoints(
        arcType: ArcType,
        character: Character,
        beginStage: number,
        peakStage: number,
        resolutionStage: number
    ): string[] {
        // アークタイプに基づくキーポイントのテンプレート
        const keyPointTemplates: Record<ArcType, string[]> = {
            'REDEMPTION': [
                '過ちや罪の認識',
                '償いの決意',
                '犠牲や困難を通じた贖罪',
                '自己許容と新たな目的の発見',
                '過去との和解と新たな自己像の確立'
            ],
            'FALL': [
                '理想や価値観への強い信念',
                '理想の実現における障害や誘惑',
                '妥協と正当化の始まり',
                '価値観の逆転と道徳的境界の超越',
                '完全な変容と元の自己からの乖離'
            ],
            'GROWTH': [
                '限界や弱点の認識',
                '成長への欲求と最初の一歩',
                '試練と失敗からの学び',
                '新たなスキルや視点の獲得',
                '能力と自己理解の向上'
            ],
            'CORRUPTION': [
                '純粋な目的や信念の存在',
                '権力や誘惑との接触',
                '最初の妥協と正当化',
                '価値観の徐々な歪曲',
                '元の理想からの完全な乖離'
            ],
            'DISILLUSIONMENT': [
                '強い信念や幻想の保持',
                '現実との最初の衝突',
                '信念の揺らぎと疑問の発生',
                '幻想の崩壊と苦痛',
                '新たな現実の受容と再構築'
            ],
            'MATURATION': [
                '若さや未熟さの特徴',
                '大人の世界との遭遇',
                '責任や困難との格闘',
                '新たな視点と自己理解の獲得',
                '成熟した視点とアイデンティティの確立'
            ],
            'EDUCATION': [
                '無知や誤解の状態',
                '新たな知識との出会い',
                '視点の拡大と深化',
                '知識の統合と応用',
                '熟達と知恵の獲得'
            ],
            'ENLIGHTENMENT': [
                '限られた視点や理解',
                '疑問や探求の始まり',
                '洞察や真実の瞬間',
                '視点の根本的な変化',
                '深い理解と受容の達成'
            ],
            'TRAGEDY': [
                '希望や野心の存在',
                '警告や不吉な兆候',
                '避けられない失敗への道',
                '破滅的な出来事',
                '喪失と教訓'
            ],
            'REBIRTH': [
                '古い自己の限界と問題',
                '危機や崩壊',
                '死のような経験',
                '再生と変容の瞬間',
                '新たな自己として再起'
            ],
            'DISCOVERY': [
                '未知または隠された部分の存在',
                '探求や調査の始まり',
                '重要な発見や啓示',
                '発見の意味の理解',
                '発見に基づく変化や行動'
            ],
            'SUPPORTING': [
                '他者の旅への関与',
                '援助や支援の提供',
                '自己犠牲や奉仕',
                '支援の影響の認識',
                '役割を通じた自己実現'
            ],
            'PARALLEL': [
                '主要人物との関係の確立',
                '類似するが異なる課題への直面',
                '主要人物との対比を通じた発展',
                '独自の解決法や結論への到達',
                '相互依存と独立の均衡'
            ]
        };

        // アークタイプに対応するテンプレートの取得
        const templates = keyPointTemplates[arcType] || keyPointTemplates['GROWTH'];

        // ステージ進行に合わせたキーポイントの選択
        const keyPoints: string[] = [];

        // 開始段階のキーポイント
        keyPoints.push(`開始 (${beginStage}): ${templates[0]}`);

        // 中間段階のキーポイント
        const middlePoints = templates.slice(1, -1);
        const middleStages = this.distributeStages(beginStage + 1, peakStage, middlePoints.length);

        for (let i = 0; i < middlePoints.length; i++) {
            keyPoints.push(`進行 (${middleStages[i]}): ${middlePoints[i]}`);
        }

        // ピーク段階のキーポイント
        keyPoints.push(`ピーク (${peakStage}): ${templates[Math.floor(templates.length / 2)]}`);

        // 解決段階のキーポイント
        keyPoints.push(`解決 (${resolutionStage}): ${templates[templates.length - 1]}`);

        return keyPoints;
    }

    /**
     * 段階を均等に分布させる
     * @private
     * @param start 開始値
     * @param end 終了値
     * @param count 分割数
     * @returns 分布した段階の配列
     */
    private distributeStages(start: number, end: number, count: number): number[] {
        if (count <= 0) return [];
        if (count === 1) return [Math.floor((start + end) / 2)];

        const result: number[] = [];
        const step = (end - start) / (count + 1);

        for (let i = 1; i <= count; i++) {
            result.push(Math.floor(start + step * i));
        }

        return result;
    }

    /**
     * 発展をキャラクターに適用する
     * @private
     * @param character キャラクター
     * @param development 発展情報
     */
    private async applyDevelopmentToCharacter(character: Character, development: CharacterDevelopment): Promise<void> {
        try {
            // 発展段階更新の有無をチェック
            const newDevelopmentStage = development.stageProgression ?
                development.stageProgression.to : character.state.developmentStage || 0;

            // 発展の説明
            let developmentSummary = '';
            if (development.stageProgression) {
                developmentSummary = development.stageProgression.reason;
            } else if (Object.keys(development.personalityChanges).length > 0) {
                const changes = Object.entries(development.personalityChanges)
                    .map(([trait, value]) => `${trait}${value >= 0 ? '+' : ''}${value.toFixed(2)}`)
                    .join(', ');
                developmentSummary = `性格の変化: ${changes}`;
            } else {
                developmentSummary = '小さな発展や変化';
            }

            // 感情状態の導出
            let emotionalState = character.state.emotionalState;
            if (development.emotionalGrowth && development.emotionalGrowth.impact > 0.3) {
                emotionalState = this.deriveEmotionalState(development.emotionalGrowth);
            }

            // キャラクター状態の更新
            const updatedState: CharacterState = {
                ...character.state,
                emotionalState,
                developmentStage: newDevelopmentStage,
                development: developmentSummary
            };

            // 発展履歴の更新
            let developmentPath = [...character.history.developmentPath];
            if (development.stageProgression || development.narrativeSignificance > 0.3) {
                developmentPath.push({
                    stage: updatedState.developmentStage,
                    description: developmentSummary,
                    achievedAt: new Date(),
                    chapterNumber: character.state.lastAppearance ?? undefined
                });
            }

            // キャラクターリポジトリで状態を更新
            await characterRepository.saveCharacterState(character.id, updatedState);

            // 発展履歴を更新
            await characterRepository.updateCharacterProperty(character.id, 'history.developmentPath', developmentPath);

            // 発展完了イベントの発行
            eventBus.publish(EVENT_TYPES.CHARACTER_DEVELOPMENT_COMPLETED, {
                timestamp: new Date(),
                characterId: character.id,
                development,
                previousDevelopmentStage: character.state.developmentStage,
                newDevelopmentStage
            });

            // 発展段階変更の場合はイベントを発行
            if (development.stageProgression) {
                eventBus.publish(EVENT_TYPES.DEVELOPMENT_STAGE_CHANGED, {
                    timestamp: new Date(),
                    characterId: character.id,
                    previousStage: development.stageProgression.from,
                    newStage: development.stageProgression.to,
                    reason: development.stageProgression.reason
                });
            }

            logger.info(`キャラクター発展を適用しました: ${character.name} (${character.id})`);
        } catch (error) {
            logger.error(`キャラクター発展の適用中にエラーが発生しました: ${character.name} (${character.id})`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 感情成長データから感情状態を導出する
     * @private
     * @param emotionalGrowth 感情成長データ
     * @returns 感情状態
     */
    private deriveEmotionalState(emotionalGrowth: any): EmotionalState {  // ここを変更
        if (!emotionalGrowth || !emotionalGrowth.lastEvent) {
            return 'NEUTRAL';
        }

        const eventLower = emotionalGrowth.lastEvent.toLowerCase();

        if (eventLower.includes('喜') || eventLower.includes('嬉') || eventLower.includes('happy') || eventLower.includes('joy')) {
            return 'HAPPY';
        }
        if (eventLower.includes('悲') || eventLower.includes('泣') || eventLower.includes('sad') || eventLower.includes('sorrow')) {
            return 'SAD';
        }
        if (eventLower.includes('怒') || eventLower.includes('憤') || eventLower.includes('angry') || eventLower.includes('rage')) {
            return 'ANGRY';
        }
        if (eventLower.includes('恐') || eventLower.includes('怖') || eventLower.includes('fear') || eventLower.includes('anxious')) {
            return 'FEARFUL';
        }
        if (eventLower.includes('決意') || eventLower.includes('覚悟') || eventLower.includes('determined')) {
            return 'DETERMINED';
        }
        if (eventLower.includes('混乱') || eventLower.includes('戸惑') || eventLower.includes('confused')) {
            return 'CONFUSED';
        }
        if (eventLower.includes('興奮') || eventLower.includes('高揚') || eventLower.includes('excited')) {
            return 'EXCITED';
        }
        if (eventLower.includes('心配') || eventLower.includes('懸念') || eventLower.includes('concerned')) {
            return 'CONCERNED';
        }

        return 'NEUTRAL';
    }

    /**
     * 成長計画を適用する
     * @param characterId キャラクターID
     * @param chapterNumber 章番号
     * @returns 成長結果
     */
    async applyGrowthPlan(characterId: string, chapterNumber: number): Promise<GrowthResult> {
        try {
            // キャラクターの存在確認
            const character = await characterRepository.getCharacterById(characterId);
            if (!character) {
                throw new NotFoundError('Character', characterId);
            }

            // アクティブな成長計画を取得
            const plan = await this.getActiveGrowthPlan(characterId);
            if (!plan) {
                return {
                    planId: '',
                    characterId,
                    beforeState: character.state,
                    afterState: character.state,
                    parameterChanges: {},
                    acquiredSkills: [],
                    planCompleted: false
                };
            }

            // 適用可能なフェーズを取得
            const phase = await this.getApplicablePhase(plan, chapterNumber, character);
            if (!phase) {
                return {
                    planId: plan.id,
                    characterId,
                    beforeState: character.state,
                    afterState: character.state,
                    parameterChanges: {},
                    acquiredSkills: [],
                    planCompleted: false
                };
            }

            // パラメータ変更の適用
            const parameterChanges: Record<string, { before: number, after: number }> = {};
            for (const change of phase.parameterChanges || []) {
                const parameters = await parameterRepository.getCharacterParameters(characterId);
                const parameter = parameters.find(p => p.id === change.parameterId);

                if (parameter) {
                    const beforeValue = parameter.value;
                    await parameterRepository.updateParameterValue(characterId, change.parameterId, parameter.value + change.change);

                    parameterChanges[change.parameterId] = {
                        before: beforeValue,
                        after: beforeValue + change.change
                    };
                }
            }

            // スキル獲得の適用
            const acquiredSkills: string[] = [];
            for (const skillId of phase.skillAcquisitions || []) {
                const skillData = {
                    id: skillId,
                    level: 1,
                    proficiency: 0
                };
                const skills = await skillRepository.getCharacterSkills(characterId);
                const existingSkill = skills.find(s => s.id === skillId);

                if (!existingSkill) {
                    const skillDefinitions = await skillRepository.getSkillDefinitions();
                    const skillDefinition = skillDefinitions.find(s => s.id === skillId);

                    if (skillDefinition) {
                        await skillRepository.saveCharacterSkills(characterId, [
                            ...skills,
                            { ...skillDefinition, ...skillData }
                        ]);
                        acquiredSkills.push(skillId);
                    }
                }
            }

            // 成長フェーズ完了を記録
            const completedPhases = character.state.growthPhaseHistory || [];
            completedPhases.push({
                phaseId: phase.id,
                startedAt: new Date(),
                completedAt: new Date(),
                chapterStart: character.state.lastAppearance || 0,
                chapterEnd: chapterNumber
            });

            // 成長後のキャラクター状態を更新
            const afterState: CharacterState = {
                ...character.state,
                growthPhaseHistory: completedPhases
            };
            await characterRepository.saveCharacterState(characterId, afterState);

            // 次のフェーズがあるかチェック
            const nextPhase = plan.growthPhases.find(p =>
                !completedPhases.some(c => c.phaseId === p.id) &&
                p.stageRequirement <= character.state.developmentStage);

            // 計画が完了したかどうか
            const planCompleted = !nextPhase;
            if (planCompleted) {
                // 計画完了イベントを発行
                eventBus.publish(EVENT_TYPES.GROWTH_PLAN_COMPLETED, {
                    timestamp: new Date(),
                    characterId,
                    planId: plan.id,
                    planName: plan.name
                });

                // 完了した計画IDを記録
                const completedPlans = character.state.completedGrowthPlans || [];
                completedPlans.push(plan.id);
                await characterRepository.updateCharacterProperty(characterId, 'state.completedGrowthPlans', completedPlans);
                await characterRepository.updateCharacterProperty(characterId, 'state.activeGrowthPlanId', null);
            }

            // 成長フェーズ完了イベントを発行
            eventBus.publish(EVENT_TYPES.GROWTH_PHASE_COMPLETED, {
                timestamp: new Date(),
                characterId,
                planId: plan.id,
                phaseId: phase.id,
                phaseName: phase.name,
                parameterChanges,
                acquiredSkills
            });

            return {
                planId: plan.id,
                characterId,
                beforeState: character.state,
                afterState,
                parameterChanges,
                acquiredSkills,
                completedPhase: phase.id,
                nextPhase: nextPhase?.id,
                planCompleted
            };
        } catch (error) {
            logger.error(`成長計画適用中にエラーが発生しました: ${characterId}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 適用可能な成長フェーズを取得する
     * @private
     * @param plan 成長計画
     * @param chapterNumber 章番号
     * @param character キャラクター
     * @returns 適用可能なフェーズまたはnull
     */
    private async getApplicablePhase(
        plan: GrowthPlan,
        chapterNumber: number,
        character: Character
    ): Promise<GrowthPhase | null> {
        if (!plan || !plan.growthPhases || plan.growthPhases.length === 0) {
            return null;
        }

        // 発展段階でフィルタ
        const developmentStage = character.state.developmentStage || 0;
        const eligiblePhases = plan.growthPhases.filter(
            phase => phase.stageRequirement <= developmentStage
        );

        if (eligiblePhases.length === 0) {
            return null;
        }

        // 章範囲でフィルタ
        const phasesInRange = eligiblePhases.filter(
            phase => chapterNumber >= phase.chapterEstimate[0] &&
                (phase.chapterEstimate[1] === -1 || chapterNumber <= phase.chapterEstimate[1])
        );

        // 既に完了したフェーズをチェック
        const completedPhaseIds = character.state.growthPhaseHistory?.map(h => h.phaseId) || [];
        const remainingPhases = phasesInRange.filter(phase => !completedPhaseIds.includes(phase.id));

        // 適用可能なフェーズがなければ、次に控えてるフェーズを返す
        if (remainingPhases.length === 0) {
            const nextPhases = eligiblePhases.filter(
                phase => chapterNumber < phase.chapterEstimate[0] &&
                    !completedPhaseIds.includes(phase.id)
            );

            return nextPhases.length > 0 ?
                nextPhases.sort((a, b) => a.chapterEstimate[0] - b.chapterEstimate[0])[0] : null;
        }

        // 適用可能なフェーズが複数ある場合は最も優先度が高いものを返す
        return remainingPhases.sort((a, b) => {
            // 章範囲の開始が早いほうを優先
            return a.chapterEstimate[0] - b.chapterEstimate[0];
        })[0];
    }

    /**
     * アクティブな成長計画を取得する
     * @param characterId キャラクターID
     * @returns アクティブな成長計画またはnull
     */
    async getActiveGrowthPlan(characterId: string): Promise<GrowthPlan | null> {
        try {
            // キャラクターの取得
            const character = await characterRepository.getCharacterById(characterId);
            if (!character || !character.state.activeGrowthPlanId) {
                return null;
            }

            const planId = character.state.activeGrowthPlanId;

            // キャッシュから計画を確認
            if (this.growthPlans.has(planId)) {
                return this.growthPlans.get(planId) || null;
            }

            // 成長計画をロードして返す (ここでは仮のダミーデータを返す)
            // 実際の実装では成長計画リポジトリからデータを取得する
            const dummyPlan: GrowthPlan = {
                id: planId,
                characterId,
                name: '成長計画',
                description: 'キャラクターの成長計画',
                targetParameters: [],
                targetSkills: [],
                growthPhases: [],
                estimatedDuration: 10,
                isActive: true
            };

            // キャッシュに保存
            this.growthPlans.set(planId, dummyPlan);

            // キャラクター成長計画リストにも追加
            if (!this.characterGrowthPlans.has(characterId)) {
                this.characterGrowthPlans.set(characterId, []);
            }
            const characterPlans = this.characterGrowthPlans.get(characterId);
            if (characterPlans && !characterPlans.includes(planId)) {
                characterPlans.push(planId);
            }

            return dummyPlan;
        } catch (error) {
            logger.error(`アクティブな成長計画の取得に失敗しました: ${characterId}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return null;
        }
    }

    /**
     * キャラクターのアクティブな成長計画を設定する
     * @param characterId キャラクターID
     * @param planId 成長計画ID
     */
    async setActiveGrowthPlan(characterId: string, planId: string): Promise<void> {
        try {
            // キャラクターの存在確認
            const character = await characterRepository.getCharacterById(characterId);
            if (!character) {
                throw new NotFoundError('Character', characterId);
            }

            // 成長計画の存在確認（キャッシュ内、またはIDリストに存在するか）
            const planIds = this.characterGrowthPlans.get(characterId) || [];
            const planExists = this.growthPlans.has(planId) || planIds.includes(planId);

            if (!planExists) {
                throw new NotFoundError('GrowthPlan', planId);
            }

            // キャッシュ内の成長計画を更新
            if (this.growthPlans.has(planId)) {
                const plan = this.growthPlans.get(planId);
                if (plan) {
                    plan.isActive = true;
                    this.growthPlans.set(planId, plan);
                }
            }

            // 他の計画を非アクティブに
            for (const id of planIds) {
                if (id !== planId && this.growthPlans.has(id)) {
                    const plan = this.growthPlans.get(id);
                    if (plan) {
                        plan.isActive = false;
                        this.growthPlans.set(id, plan);
                    }
                }
            }

            logger.info(`キャラクター ${character.name} のアクティブ成長計画を ${planId} に設定しました`);
        } catch (error) {
            logger.error(`アクティブ成長計画の設定に失敗しました: ${characterId}, ${planId}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 次のマイルストーン推定
     * @param characterId キャラクターID
     * @returns 次のマイルストーン情報
     */
    async predictNextMilestone(characterId: string): Promise<any> {
        try {
            const character = await characterRepository.getCharacterById(characterId);
            if (!character) {
                throw new NotFoundError('Character', characterId);
            }

            // 現在の発展段階と次の段階
            const currentStage = character.state.developmentStage || 0;
            const nextStage = currentStage + 1;

            // キャラクタータイプに応じた最大段階をチェック
            const maxStage = this.MAX_DEVELOPMENT_STAGE[character.type as keyof typeof this.MAX_DEVELOPMENT_STAGE] || 3;
            if (nextStage > maxStage) {
                return {
                    hasNextMilestone: false,
                    reason: `既に最大発展段階(${maxStage})に到達しています`
                };
            }

            // 次の段階の説明を生成
            const nextMilestoneDescription = await this.generateMilestoneDescription(nextStage, character);
            const requirements = this.generateStageRequirements(nextStage, character);
            const estimatedChapter = this.estimateChapterForStage(nextStage, character);

            return {
                hasNextMilestone: true,
                currentStage,
                nextStage,
                description: nextMilestoneDescription,
                requirements,
                estimatedChapter,
                progress: this.calculateMilestoneProgress(character, nextStage)
            };
        } catch (error) {
            logger.error(`次のマイルストーン推定に失敗しました: ${characterId}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * マイルストーン進行度を計算する
     * @private
     * @param character キャラクター
     * @param nextStage 次の段階
     * @returns 進行度（0-1）
     */
    private calculateMilestoneProgress(character: Character, nextStage: number): number {
        // 履歴内の登場数をカウント
        const appearances = character.history.appearances.length;

        // 要件に対する達成率
        const requirements = this.generateStageRequirements(nextStage, character);

        // 登場要件に対する達成率
        const appearanceProgress = Math.min(1, appearances / requirements.appearances);

        // 関係性の数を確認
        const relationships = character.relationships?.length || 0;
        const relationshipProgress = Math.min(1, relationships / (requirements.relationships || 1));

        // キャラクタータイプに応じた重み付け
        let progress = 0;

        if (character.type === 'MAIN') {
            // メインは多面的な成長が必要
            progress = (
                appearanceProgress * 0.3 +
                relationshipProgress * 0.3 +
                0.4 * Math.random() // 他の要素の進行度（簡略化のためランダム）
            );
        } else if (character.type === 'SUB') {
            // サブは登場と関係性が重要
            progress = (
                appearanceProgress * 0.4 +
                relationshipProgress * 0.4 +
                0.2 * Math.random()
            );
        } else { // MOB
            // モブは主に登場回数
            progress = (
                appearanceProgress * 0.7 +
                0.3 * Math.random()
            );
        }

        return Math.min(1, Math.max(0, progress));
    }
}

// シングルトンインスタンスをエクスポート
export const evolutionService = new EvolutionService();