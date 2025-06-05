/**
 * キャラクターモジュールの定数定義
 */
import { CharacterType, EmotionalState, RelationshipType, ParameterCategory } from './types';

/**
 * 感情状態の定数
 */
export const EMOTIONAL_STATE = {
    HAPPY: 'HAPPY' as EmotionalState,
    SAD: 'SAD' as EmotionalState,
    ANGRY: 'ANGRY' as EmotionalState,
    FEARFUL: 'FEARFUL' as EmotionalState,
    NEUTRAL: 'NEUTRAL' as EmotionalState,
    EXCITED: 'EXCITED' as EmotionalState,
    CONFUSED: 'CONFUSED' as EmotionalState,
    DETERMINED: 'DETERMINED' as EmotionalState,
    CONCERNED: 'CONCERNED' as EmotionalState
} as const;

/**
 * キャラクタータイプの定数
 */
export const CHARACTER_TYPE = {
    MAIN: 'MAIN' as CharacterType,
    SUB: 'SUB' as CharacterType,
    MOB: 'MOB' as CharacterType
} as const;

/**
 * 関係性タイプの定数
 */
export const RELATIONSHIP_TYPE = {
    PARENT: 'PARENT' as RelationshipType,
    CHILD: 'CHILD' as RelationshipType,
    MENTOR: 'MENTOR' as RelationshipType,
    STUDENT: 'STUDENT' as RelationshipType,
    LEADER: 'LEADER' as RelationshipType,
    FOLLOWER: 'FOLLOWER' as RelationshipType,
    LOVER: 'LOVER' as RelationshipType,
    PROTECTOR: 'PROTECTOR' as RelationshipType,
    PROTECTED: 'PROTECTED' as RelationshipType,
    FRIEND: 'FRIEND' as RelationshipType,
    ENEMY: 'ENEMY' as RelationshipType,
    RIVAL: 'RIVAL' as RelationshipType,
    COLLEAGUE: 'COLLEAGUE' as RelationshipType,
    NEUTRAL: 'NEUTRAL' as RelationshipType
} as const;

/**
 * パラメータカテゴリの定数
 */
export const PARAMETER_CATEGORY = {
    PHYSICAL: 'PHYSICAL' as ParameterCategory,
    MENTAL: 'MENTAL' as ParameterCategory,
    SOCIAL: 'SOCIAL' as ParameterCategory,
    TECHNICAL: 'TECHNICAL' as ParameterCategory,
    SPECIAL: 'SPECIAL' as ParameterCategory
} as const;

/**
 * イベントタイプの定数
 */
export const EVENT_TYPES = {
    // キャラクタイベント
    CHARACTER_CREATED: 'character.created',
    CHARACTER_UPDATED: 'character.updated',
    CHARACTER_DELETED: 'character.deleted',
    CHARACTER_PROMOTED: 'character.promoted',
    CHARACTER_DEMOTED: 'character.demoted',
    CHARACTER_STATE_CHANGED: 'character.state.changed',
    CHARACTER_APPEARANCE: 'character.appearance',

    // 関係性イベント
    RELATIONSHIP_CREATED: 'relationship.created',
    RELATIONSHIP_UPDATED: 'relationship.updated',
    RELATIONSHIP_DELETED: 'relationship.deleted',
    RELATIONSHIP_STRENGTHENED: 'relationship.strengthened',
    RELATIONSHIP_WEAKENED: 'relationship.weakened',

    // パラメータとスキルイベント
    PARAMETER_CHANGED: 'parameter.changed',
    SKILL_ACQUIRED: 'skill.acquired',
    SKILL_LEVEL_UP: 'skill.level.up',
    SKILL_PROFICIENCY_CHANGED: 'skill.proficiency.changed',

    // 発展イベント
    DEVELOPMENT_STAGE_CHANGED: 'development.stage.changed',
    GROWTH_PLAN_STARTED: 'growth.plan.started',
    GROWTH_PLAN_COMPLETED: 'growth.plan.completed',
    GROWTH_PHASE_COMPLETED: 'growth.phase.completed',
    MILESTONE_ACHIEVED: 'milestone.achieved',

    // 分析イベント
    CHARACTER_ANALYZED: 'character.analyzed',
    RELATIONSHIP_ANALYZED: 'relationship.analyzed',
    CONSISTENCY_VIOLATION: 'consistency.violation',
    TIMING_RECOMMENDATION: 'timing.recommendation',

    // 追加するイベントタイプ
    CHARACTER_DEVELOPMENT_REQUESTED: 'character.development.requested',
    CHARACTER_DEVELOPMENT_COMPLETED: 'character.development.completed',

    // インタラクションイベント
    CHARACTER_INTERACTION: 'character.interaction',
    CHARACTER_VALIDATION_REQUESTED: 'character.validation.requested', // 追加

} as const;

/**
 * 発展段階の定数
 */
export const DEVELOPMENT_STAGE = {
    /** 初期導入段階: キャラクター登場初期 */
    INTRODUCTION: 1,

    /** 確立段階: 基本的な性格や役割が確立 */
    ESTABLISHMENT: 2,

    /** 発展段階: 複雑さが増し、深みが加わる */
    DEVELOPMENT: 3,

    /** 変容段階: 重要な転機や変化 */
    TRANSFORMATION: 4,

    /** 成熟段階: 変化を受け入れ、新たな平衡状態 */
    MATURATION: 5,

    /** 完成段階: キャラクターアークの完成 */
    COMPLETION: 6
} as const;

/**
 * 文字検出のための正規表現パターン
 */
export const DETECTION_PATTERNS = {
    /** 名前一致のパターン */
    NAME_MATCH: (name: string) => new RegExp(`\\b${name}\\b`, 'i'),

    /** 台詞パターン (汎用) */
    DIALOG_GENERAL: /「([^」]+)」|"([^"]+)"|'([^']+)'/g,

    /** キャラクター指定台詞パターン */
    DIALOG_CHARACTER: (name: string) => new RegExp(`${name}[はがも]?[、：:]*[「"]([^」"]+)[」"]`, 'g'),

    /** 動作パターン */
    ACTION: /([a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)(?:は|が)([a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]+)(?:した|する|して)/g
} as const;

/**
 * リポジトリストレージキーの定数
 */
export const STORAGE_KEYS = {
    CHARACTERS: 'characters',
    RELATIONSHIPS: 'relationships',
    RELATIONSHIP_GRAPH: 'relationshipGraph',
    PARAMETERS: 'parameters',
    PARAMETER_DEFINITIONS: 'definitions',
    SKILLS: 'skills',
    SKILL_DEFINITIONS: 'definitions',
    GROWTH_PLANS: 'growthPlans',
    TEMPLATES: 'characterTemplates'
} as const;

/**
 * キャラクター検証の閾値定数
 */
export const VALIDATION_THRESHOLDS = {
    /** 一貫性最小スコア */
    MIN_CONSISTENCY_SCORE: 0.7,

    /** 矛盾検出の閾値 */
    CONTRADICTION_THRESHOLD: 0.8,

    /** 変化許容範囲 */
    ACCEPTABLE_CHANGE_MAGNITUDE: 0.3
} as const;