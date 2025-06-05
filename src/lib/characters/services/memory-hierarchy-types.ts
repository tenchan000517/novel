/**
 * @fileoverview 記憶階層連携用型定義
 * @description 専門サービスと記憶階層システムの連携用データ型
 */

import { MemoryLevel } from '@/lib/memory/core/types';
import { Character, CharacterDevelopment, CharacterPsychology, Relationship } from '../core/types';

// ============================================================================
// 共通記憶階層データ型
// ============================================================================

/**
 * 記憶階層データの基底インターフェース
 */
export interface BaseMemoryHierarchyData {
    serviceType: 'evolution' | 'psychology' | 'relationship';
    timestamp: Date;
    confidence: number;
    dataVersion: string;
    metadata: {
        source: string;
        validUntil?: Date;
        processingTime: number;
        qualityScore: number;
    };
}

/**
 * 階層別データ分類
 */
export interface HierarchicalDataClassification {
    shortTerm: {
        data: any;
        priority: number;
        expiryTime: Date;
        accessCount: number;
    };
    midTerm: {
        data: any;
        patterns: string[];
        stability: number;
        evolutionRate: number;
    };
    longTerm: {
        data: any;
        permanence: number;
        fundamentalScore: number;
        historicalSignificance: number;
    };
}

// ============================================================================
// Evolution Service 記憶階層データ型
// ============================================================================

/**
 * 進化サービス固有記憶階層データ
 */
export interface EvolutionMemoryData extends BaseMemoryHierarchyData {
    serviceType: 'evolution';
    characterId: string;
    developmentData: {
        currentStage: number;
        recentChanges: CharacterDevelopment[];
        growthPatterns: Array<{
            pattern: string;
            frequency: number;
            significance: number;
        }>;
        milestones: Array<{
            stage: number;
            achieved: boolean;
            estimatedChapter: number;
        }>;
    };
    hierarchicalClassification: HierarchicalDataClassification;
}

/**
 * 進化サービス階層別データ
 */
export interface EvolutionHierarchicalData {
    characterId: string;
    shortTerm: {
        currentDevelopment: CharacterDevelopment | null;
        recentGrowthEvents: Array<{
            event: string;
            impact: number;
            chapter: number;
        }>;
        activePlan: {
            planId: string;
            currentPhase: string;
            progress: number;
        } | null;
    };
    midTerm: {
        growthPatterns: Array<{
            patternType: string;
            occurrenceRate: number;
            predictedNextOccurrence: number;
        }>;
        stageHistory: Array<{
            stage: number;
            duration: number;
            keyEvents: string[];
        }>;
        skillEvolution: Array<{
            skillId: string;
            progressRate: number;
            plateaus: number[];
        }>;
    };
    longTerm: {
        fundamentalTraits: Record<string, number>;
        coreGrowthVector: {
            direction: string;
            magnitude: number;
            stability: number;
        };
        characterArchetype: {
            primary: string;
            secondary: string[];
            archetypeStability: number;
        };
        permanentMilestones: Array<{
            milestone: string;
            chapter: number;
            impact: number;
        }>;
    };
}

// ============================================================================
// Psychology Service 記憶階層データ型
// ============================================================================

/**
 * 心理サービス固有記憶階層データ
 */
export interface PsychologyMemoryData extends BaseMemoryHierarchyData {
    serviceType: 'psychology';
    characterId: string;
    psychologyData: {
        currentState: CharacterPsychology;
        emotionalHistory: Array<{
            emotion: string;
            intensity: number;
            trigger: string;
            chapter: number;
        }>;
        behaviorPatterns: Array<{
            situation: string;
            response: string;
            frequency: number;
        }>;
        relationshipAttitudes: Record<string, {
            attitude: string;
            intensity: number;
            stability: number;
        }>;
    };
    hierarchicalClassification: HierarchicalDataClassification;
}

/**
 * 心理サービス階層別データ
 */
export interface PsychologyHierarchicalData {
    characterId: string;
    shortTerm: {
        currentEmotionalState: Record<string, number>;
        recentMoodChanges: Array<{
            from: string;
            to: string;
            trigger: string;
            intensity: number;
            chapter: number;
        }>;
        activeFears: string[];
        activeDesires: string[];
        temporaryConflicts: string[];
    };
    midTerm: {
        emotionalPatterns: Array<{
            trigger: string;
            response: string;
            frequency: number;
            intensity: number;
        }>;
        relationshipDynamics: Record<string, {
            trend: 'improving' | 'declining' | 'stable';
            changeRate: number;
            keyEvents: string[];
        }>;
        behaviorAdaptations: Array<{
            situation: string;
            adaptedResponse: string;
            learningProgress: number;
        }>;
        internalConflictResolution: Array<{
            conflict: string;
            resolutionApproach: string;
            progress: number;
        }>;
    };
    longTerm: {
        corePersonality: {
            traits: Record<string, number>;
            values: string[];
            beliefs: string[];
            worldview: string;
        };
        fundamentalFears: string[];
        fundamentalDesires: string[];
        characterTemplate: {
            psychologicalArchetype: string;
            motivationalStructure: string;
            defensePatterns: string[];
        };
        permanentTrauma: Array<{
            event: string;
            impact: number;
            adaptations: string[];
        }>;
        permanentGrowth: Array<{
            insight: string;
            chapter: number;
            transformationLevel: number;
        }>;
    };
}

// ============================================================================
// Relationship Service 記憶階層データ型
// ============================================================================

/**
 * 関係性サービス固有記憶階層データ
 */
export interface RelationshipMemoryData extends BaseMemoryHierarchyData {
    serviceType: 'relationship';
    networkData: {
        totalRelationships: number;
        activeConnections: Array<{
            char1Id: string;
            char2Id: string;
            relationship: Relationship;
            lastUpdate: Date;
        }>;
        networkMetrics: {
            density: number;
            clustering: number;
            centralCharacters: string[];
        };
        clusterData: Array<{
            clusterId: string;
            members: string[];
            cohesion: number;
            type: string;
        }>;
    };
    hierarchicalClassification: HierarchicalDataClassification;
}

/**
 * 関係性サービス階層別データ
 */
export interface RelationshipHierarchicalData {
    characterId?: string; // 特定キャラクター用。全体分析時はundefined
    shortTerm: {
        recentInteractions: Array<{
            targetId: string;
            interactionType: string;
            impact: number;
            chapter: number;
            outcome: string;
        }>;
        activeConflicts: Array<{
            participantIds: string[];
            conflictType: string;
            intensity: number;
            resolution: 'pending' | 'escalating' | 'de-escalating';
        }>;
        temporaryAlliances: Array<{
            participantIds: string[];
            purpose: string;
            strength: number;
            expectedDuration: number;
        }>;
        emergingRelationships: Array<{
            char1Id: string;
            char2Id: string;
            relationshipType: string;
            confidence: number;
        }>;
    };
    midTerm: {
        relationshipEvolution: Array<{
            char1Id: string;
            char2Id: string;
            evolutionPattern: string;
            changeRate: number;
            significantMoments: Array<{
                chapter: number;
                event: string;
                impact: number;
            }>;
        }>;
        networkShifts: Array<{
            shiftType: 'cluster_formation' | 'cluster_dissolution' | 'role_change';
            affectedCharacters: string[];
            impact: number;
            duration: number;
        }>;
        conflictPatterns: Array<{
            participantPattern: string;
            triggerPattern: string;
            resolutionPattern: string;
            frequency: number;
        }>;
        alliancePatterns: Array<{
            formationTrigger: string;
            typicalDuration: number;
            successRate: number;
            commonParticipants: string[];
        }>;
    };
    longTerm: {
        fundamentalRelationships: Array<{
            char1Id: string;
            char2Id: string;
            relationshipArchetype: string;
            stabilityScore: number;
            foundationalEvents: string[];
        }>;
        characterRoles: Record<string, {
            networkRole: string;
            influenceLevel: number;
            stability: number;
            roleHistory: string[];
        }>;
        permanentNetworkStructure: {
            coreClusters: Array<{
                clusterId: string;
                permanentMembers: string[];
                clusterArchetype: string;
                formationChapter: number;
            }>;
            structuralPatterns: string[];
            networkEvolutionTrend: string;
        };
        historicalMilestones: Array<{
            milestone: string;
            chapter: number;
            networkImpact: number;
            permanentChanges: string[];
        }>;
    };
}

// ============================================================================
// 統合データ型
// ============================================================================

/**
 * サービス固有記憶階層データの統合型
 */
export type ServiceSpecificMemoryData = 
    | EvolutionMemoryData 
    | PsychologyMemoryData 
    | RelationshipMemoryData;

/**
 * 階層別データの統合型
 */
export type HierarchicalServiceData = 
    | EvolutionHierarchicalData 
    | PsychologyHierarchicalData 
    | RelationshipHierarchicalData;

// ============================================================================
// 記憶階層連携インターフェース
// ============================================================================

/**
 * 記憶階層連携機能を持つサービスのインターフェース
 */
export interface IMemoryHierarchyIntegration {
    /**
     * サービス固有データを記憶階層用形式で取得
     */
    getDataForMemoryHierarchy(): Promise<ServiceSpecificMemoryData>;
    
    /**
     * 指定記憶階層との統合処理
     */
    integrateWithMemoryLayer(layer: MemoryLevel): Promise<void>;
    
    /**
     * 階層別データ取得（キャラクター固有またはサービス全体）
     */
    getHierarchicalData(characterId?: string): Promise<HierarchicalServiceData>;
}

// ============================================================================
// ユーティリティ型
// ============================================================================

/**
 * データ階層分類のためのユーティリティ
 */
export interface DataClassificationCriteria {
    temporality: {
        shortTermMaxAge: number; // ミリ秒
        midTermMaxAge: number;   // ミリ秒
        longTermThreshold: number; // 永続性スコア閾値
    };
    significance: {
        minShortTermScore: number;
        minMidTermScore: number;
        minLongTermScore: number;
    };
    frequency: {
        highFrequencyThreshold: number;
        lowFrequencyThreshold: number;
    };
}

/**
 * 記憶階層統合設定
 */
export interface MemoryHierarchyIntegrationConfig {
    enableShortTermSync: boolean;
    enableMidTermSync: boolean;
    enableLongTermSync: boolean;
    syncInterval: number; // ミリ秒
    maxMemoryUsage: number; // バイト
    qualityThreshold: number; // 0-1
    classificationCriteria: DataClassificationCriteria;
}

/**
 * 統合処理結果
 */
export interface IntegrationResult {
    success: boolean;
    layer: MemoryLevel;
    itemsProcessed: number;
    processingTime: number;
    errors: string[];
    memoryUsage: number;
    qualityScore: number;
}

/**
 * 階層別統計情報
 */
export interface HierarchicalStatistics {
    shortTerm: {
        itemCount: number;
        memoryUsage: number;
        averageAge: number;
        accessFrequency: number;
    };
    midTerm: {
        itemCount: number;
        memoryUsage: number;
        patternCount: number;
        stabilityScore: number;
    };
    longTerm: {
        itemCount: number;
        memoryUsage: number;
        permanenceScore: number;
        historicalDepth: number;
    };
}

/**
 * キャラクターアーキタイプの型定義
 */
export type CharacterArchetype = 
    | 'hero' 
    | 'mentor' 
    | 'guardian' 
    | 'explorer' 
    | 'rebel' 
    | 'lover' 
    | 'creator' 
    | 'jester' 
    | 'sage' 
    | 'magician' 
    | 'ruler' 
    | 'innocent';

