/**
 * イベントタイプと関連する型定義
 */
import { EVENT_TYPES } from '../core/constants';
import {
    EventData,
    Character,
    CharacterData,
    CharacterState,
    Relationship,
    CharacterPsychology,
    TimingRecommendation,
    ValidationResult,
    CharacterParameter,
    Skill,
    GrowthPlan
} from '../core/types';

/**
 * ログレベル列挙型
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARNING = 2,
    ERROR = 3,
    NONE = 4
}

/**
 * イベント優先度列挙型
 */
export enum EventPriority {
    LOWEST = 0,
    LOW = 1,
    NORMAL = 2,
    HIGH = 3,
    HIGHEST = 4,
    CRITICAL = 5
}

/**
 * イベントタイプの読み取り専用オブジェクト
 * constants.ts からの再エクスポート
 */
export const EventTypes = { ...EVENT_TYPES } as const;

/**
 * イベントカテゴリー列挙型
 */
export enum EventCategory {
    CHARACTER = 'character',
    RELATIONSHIP = 'relationship',
    PARAMETER = 'parameter',
    SKILL = 'skill',
    DEVELOPMENT = 'development',
    ANALYSIS = 'analysis'
}

// ===== キャラクターイベント =====

/**
 * キャラクター作成イベントデータ
 */
export interface CharacterCreatedEvent extends EventData {
    /** 作成されたキャラクター */
    character: Character;
}

/**
 * キャラクター更新イベントデータ
 */
export interface CharacterUpdatedEvent extends EventData {
    /** キャラクターID */
    characterId: string;
    /** 更新されたキャラクター */
    character: Character;
    /** 変更内容 */
    changes: Partial<CharacterData>;
    /** 更新前の状態 */
    previousState?: Partial<Character>;
}

/**
 * キャラクター削除イベントデータ
 */
export interface CharacterDeletedEvent extends EventData {
    /** 削除されたキャラクターID */
    characterId: string;
    /** 削除されたキャラクター名 */
    characterName: string;
}

/**
 * キャラクター昇格イベントデータ
 */
export interface CharacterPromotedEvent extends EventData {
    /** キャラクターID */
    characterId: string;
    /** 元のタイプ */
    fromType: string;
    /** 新しいタイプ */
    toType: string;
    /** 昇格理由 */
    reason?: string;
}

/**
 * キャラクター降格イベントデータ
 */
export interface CharacterDemotedEvent extends EventData {
    /** キャラクターID */
    characterId: string;
    /** 元のタイプ */
    fromType: string;
    /** 新しいタイプ */
    toType: string;
    /** 降格理由 */
    reason?: string;
}

/**
 * キャラクター状態変更イベントデータ
 */
export interface CharacterStateChangedEvent extends EventData {
    /** キャラクターID */
    characterId: string;
    /** 更新された状態 */
    state: Partial<CharacterState>;
    /** 更新前の状態 */
    previousState?: Partial<CharacterState>;
    /** 変更種別 */
    changeType: string;
}

/**
 * キャラクター登場イベントデータ
 */
export interface CharacterAppearanceEvent extends EventData {
    /** キャラクターID */
    characterId: string;
    /** 章番号 */
    chapterNumber: number;
    /** 重要度 */
    significance: number;
    /** 概要 */
    summary?: string;
}

// ===== 関係性イベント =====

/**
 * 関係性作成イベントデータ
 */
export interface RelationshipCreatedEvent extends EventData {
    /** キャラクター1のID */
    char1Id: string;
    /** キャラクター2のID */
    char2Id: string;
    /** 作成された関係性 */
    relationship: Relationship;
}

/**
 * 関係性更新イベントデータ
 */
export interface RelationshipUpdatedEvent extends EventData {
    /** キャラクター1のID */
    char1Id: string;
    /** キャラクター2のID */
    char2Id: string;
    /** 更新された関係性 */
    relationship: Relationship;
    /** 更新前の関係性 */
    previousRelationship?: Relationship;
}

/**
 * 関係性削除イベントデータ
 */
export interface RelationshipDeletedEvent extends EventData {
    /** キャラクター1のID */
    char1Id: string;
    /** キャラクター2のID */
    char2Id: string;
    /** 削除された関係性タイプ */
    relationType: string;
}

/**
 * 関係性強化イベントデータ
 */
export interface RelationshipStrengthenedEvent extends EventData {
    /** キャラクター1のID */
    char1Id: string;
    /** キャラクター2のID */
    char2Id: string;
    /** 関係性タイプ */
    relationType: string;
    /** 以前の強度 */
    previousStrength: number;
    /** 新しい強度 */
    newStrength: number;
    /** 強化の理由 */
    reason?: string;
}

/**
 * 関係性弱化イベントデータ
 */
export interface RelationshipWeakenedEvent extends EventData {
    /** キャラクター1のID */
    char1Id: string;
    /** キャラクター2のID */
    char2Id: string;
    /** 関係性タイプ */
    relationType: string;
    /** 以前の強度 */
    previousStrength: number;
    /** 新しい強度 */
    newStrength: number;
    /** 弱化の理由 */
    reason?: string;
}

// ===== パラメータとスキルイベント =====

/**
 * パラメータ変更イベントデータ
 */
export interface ParameterChangedEvent extends EventData {
    /** キャラクターID */
    characterId: string;
    /** パラメータID */
    parameterId: string;
    /** パラメータ名 */
    parameterName: string;
    /** 以前の値 */
    oldValue: number;
    /** 新しい値 */
    newValue: number;
    /** 変更理由 */
    reason?: string;
    /** パラメータオブジェクト */
    parameter?: CharacterParameter;
}

/**
 * スキル取得イベントデータ
 */
export interface SkillAcquiredEvent extends EventData {
    /** キャラクターID */
    characterId: string;
    /** スキルID */
    skillId: string;
    /** スキル名 */
    skillName: string;
    /** スキルレベル */
    level: number;
    /** 取得方法 */
    acquisitionMethod?: string;
    /** スキルオブジェクト */
    skill?: Skill;
}

/**
 * スキルレベルアップイベントデータ
 */
export interface SkillLevelUpEvent extends EventData {
    /** キャラクターID */
    characterId: string;
    /** スキルID */
    skillId: string;
    /** スキル名 */
    skillName: string;
    /** 以前のレベル */
    oldLevel: number;
    /** 新しいレベル */
    newLevel: number;
    /** レベルアップ理由 */
    reason?: string;
}

/**
 * スキル習熟度変更イベントデータ
 */
export interface SkillProficiencyChangedEvent extends EventData {
    /** キャラクターID */
    characterId: string;
    /** スキルID */
    skillId: string;
    /** 以前の習熟度 */
    oldProficiency: number;
    /** 新しい習熟度 */
    newProficiency: number;
    /** 変更理由 */
    reason?: string;
}

// ===== 発展イベント =====

/**
 * 発展段階変更イベントデータ
 */
export interface DevelopmentStageChangedEvent extends EventData {
    /** キャラクターID */
    characterId: string;
    /** 以前の段階 */
    oldStage: number;
    /** 新しい段階 */
    newStage: number;
    /** 変更理由 */
    reason: string;
    /** 変更の章番号 */
    chapterNumber?: number;
}

/**
 * 成長計画開始イベントデータ
 */
export interface GrowthPlanStartedEvent extends EventData {
    /** キャラクターID */
    characterId: string;
    /** 成長計画ID */
    planId: string;
    /** 成長計画名 */
    planName: string;
    /** 開始章 */
    startChapter: number;
    /** 成長計画オブジェクト */
    plan: GrowthPlan;
}

/**
 * 成長計画完了イベントデータ
 */
export interface GrowthPlanCompletedEvent extends EventData {
    /** キャラクターID */
    characterId: string;
    /** 成長計画ID */
    planId: string;
    /** 成長計画名 */
    planName: string;
    /** 開始章 */
    startChapter: number;
    /** 完了章 */
    completionChapter: number;
    /** 結果の概要 */
    summary: string;
}

/**
 * 成長フェーズ完了イベントデータ
 */
export interface GrowthPhaseCompletedEvent extends EventData {
    /** キャラクターID */
    characterId: string;
    /** 成長計画ID */
    planId: string;
    /** フェーズID */
    phaseId: string;
    /** フェーズ名 */
    phaseName: string;
    /** 完了章 */
    chapterNumber: number;
    /** 次のフェーズ */
    nextPhase?: string;
}

/**
 * マイルストーン達成イベントデータ
 */
export interface MilestoneAchievedEvent extends EventData {
    /** キャラクターID */
    characterId: string;
    /** マイルストーン段階 */
    stage: number;
    /** マイルストーンの説明 */
    description: string;
    /** 達成章 */
    chapterNumber: number;
}

// ===== 分析イベント =====

/**
 * キャラクター分析イベントデータ
 */
export interface CharacterAnalyzedEvent extends EventData {
    /** キャラクターID */
    characterId: string;
    /** 分析タイプ */
    analysisType: string;
    /** 分析結果 */
    result: any;
    /** 心理分析結果 */
    psychology?: CharacterPsychology;
}

/**
 * 関係性分析イベントデータ
 */
export interface RelationshipAnalyzedEvent extends EventData {
    /** 分析タイプ */
    analysisType: string;
    /** 分析結果 */
    result: any;
    /** 対象キャラクターIDs */
    characterIds?: string[];
}

/**
 * 整合性違反イベントデータ
 */
export interface ConsistencyViolationEvent extends EventData {
    /** キャラクターID */
    characterId: string;
    /** 違反タイプ */
    violationType: string;
    /** 違反の説明 */
    description: string;
    /** 違反の重大度 (0-1) */
    severity: number;
    /** 推奨される修正 */
    suggestedFix?: string;
}

/**
 * タイミング推奨イベントデータ
 */
export interface TimingRecommendationEvent extends EventData {
    /** キャラクターID */
    characterId: string;
    /** 推奨事項 */
    recommendation: TimingRecommendation;
}

// ===== イベントタイプマッピング =====

/**
 * イベントタイプとペイロードのマッピング
 */
export interface EventTypeToPayloadMap {
    [EventTypes.CHARACTER_CREATED]: CharacterCreatedEvent;
    [EventTypes.CHARACTER_UPDATED]: CharacterUpdatedEvent;
    [EventTypes.CHARACTER_DELETED]: CharacterDeletedEvent;
    [EventTypes.CHARACTER_PROMOTED]: CharacterPromotedEvent;
    [EventTypes.CHARACTER_DEMOTED]: CharacterDemotedEvent;
    [EventTypes.CHARACTER_STATE_CHANGED]: CharacterStateChangedEvent;
    [EventTypes.CHARACTER_APPEARANCE]: CharacterAppearanceEvent;

    [EventTypes.RELATIONSHIP_CREATED]: RelationshipCreatedEvent;
    [EventTypes.RELATIONSHIP_UPDATED]: RelationshipUpdatedEvent;
    [EventTypes.RELATIONSHIP_DELETED]: RelationshipDeletedEvent;
    [EventTypes.RELATIONSHIP_STRENGTHENED]: RelationshipStrengthenedEvent;
    [EventTypes.RELATIONSHIP_WEAKENED]: RelationshipWeakenedEvent;

    [EventTypes.PARAMETER_CHANGED]: ParameterChangedEvent;
    [EventTypes.SKILL_ACQUIRED]: SkillAcquiredEvent;
    [EventTypes.SKILL_LEVEL_UP]: SkillLevelUpEvent;
    [EventTypes.SKILL_PROFICIENCY_CHANGED]: SkillProficiencyChangedEvent;

    [EventTypes.DEVELOPMENT_STAGE_CHANGED]: DevelopmentStageChangedEvent;
    [EventTypes.GROWTH_PLAN_STARTED]: GrowthPlanStartedEvent;
    [EventTypes.GROWTH_PLAN_COMPLETED]: GrowthPlanCompletedEvent;
    [EventTypes.GROWTH_PHASE_COMPLETED]: GrowthPhaseCompletedEvent;
    [EventTypes.MILESTONE_ACHIEVED]: MilestoneAchievedEvent;

    [EventTypes.CHARACTER_ANALYZED]: CharacterAnalyzedEvent;
    [EventTypes.RELATIONSHIP_ANALYZED]: RelationshipAnalyzedEvent;
    [EventTypes.CONSISTENCY_VIOLATION]: ConsistencyViolationEvent;
    [EventTypes.TIMING_RECOMMENDATION]: TimingRecommendationEvent;
}

/**
 * イベントハンドラー登録情報
 */
export interface EventHandlerRegistration<E extends keyof EventTypeToPayloadMap> {
    /** イベントタイプ */
    eventType: E;
    /** イベントハンドラー */
    handler: TypedEventHandler<E>;
    /** 優先度 */
    priority: EventPriority;
}

/**
 * イベントユーティリティクラス
 */
export class EventUtils {
    /**
     * 複数のイベントハンドラーを登録
     * @param registrations 登録情報の配列
     * @param eventBus イベントバス
     * @returns 購読解除関数
     */
    public static registerHandlers<T>(
        registrations: EventHandlerRegistration<any>[],
        eventBus: any
    ): () => void {
        const subscriptions = registrations.map(reg =>
            eventBus.subscribe(reg.eventType, reg.handler)
        );

        return () => {
            subscriptions.forEach(sub => sub.unsubscribe());
        };
    }
}

/**
 * 型安全なイベントハンドラタイプ
 */
export type TypedEventHandler<E extends keyof EventTypeToPayloadMap> =
    (data: EventTypeToPayloadMap[E]) => void | Promise<void>;