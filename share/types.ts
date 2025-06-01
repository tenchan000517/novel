// src/lib/memory/core/types.ts
/**
 * @fileoverview 統合記憶階層システム型定義
 * @description
 * 統合記憶管理システムで使用される全ての型定義を提供します。
 * 短期・中期・長期記憶の統合と、重複処理排除のための型定義を含みます。
 */

import { Chapter } from '@/types/chapters';
import { CharacterState, SignificantEvent } from '@/types/memory';

// ============================================================================
// Core Memory System Types
// ============================================================================

/**
 * メモリ階層レベル
 */
export enum MemoryLevel {
    SHORT_TERM = 'SHORT_TERM',
    MID_TERM = 'MID_TERM',
    LONG_TERM = 'LONG_TERM'
}

/**
 * メモリ階層設定
 */
export interface MemoryHierarchyConfig {
    shortTerm: {
        maxChapters: number;
        retentionTime: number; // milliseconds
        cacheEnabled: boolean;
    };
    midTerm: {
        maxAnalysisRecords: number;
        compressionEnabled: boolean;
        analysisDepth: number;
    };
    longTerm: {
        compressionThreshold: number;
        knowledgeIntegrationEnabled: boolean;
        permanentRetention: boolean;
    };
}

/**
 * 統合記憶コンテキスト
 */
export interface UnifiedMemoryContext {
    chapterNumber: number;
    timestamp: string;
    
    // Short Term Context
    shortTerm: {
        recentChapters: ChapterContextData[];
        immediateCharacterStates: Map<string, CharacterState>;
        keyPhrases: string[];
        processingBuffers: ProcessingBuffer[];
    };
    
    // Mid Term Context
    midTerm: {
        narrativeProgression: NarrativeProgressionData;
        analysisResults: AnalysisResultData[];
        characterEvolution: CharacterEvolutionData[];
        systemStatistics: SystemStatisticsData;
        qualityMetrics: QualityMetricsData;
    };
    
    // Long Term Context
    longTerm: {
        consolidatedSettings: ConsolidatedSettingsData;
        knowledgeDatabase: KnowledgeDatabaseData;
        systemKnowledgeBase: SystemKnowledgeBaseData;
        completedRecords: CompletedRecordsData;
    };
    
    // Integration Data
    integration: {
        resolvedDuplicates: ResolvedDuplicateData[];
        cacheStatistics: CacheStatisticsData;
        accessOptimizations: AccessOptimizationData[];
    };
}

/**
 * メモリアクセス要求
 */
export interface MemoryAccessRequest {
    chapterNumber: number;
    requestType: MemoryRequestType;
    targetLayers: MemoryLevel[];
    filters?: MemoryAccessFilters;
    options?: MemoryAccessOptions;
}

/**
 * メモリアクセス応答
 */
export interface MemoryAccessResponse {
    success: boolean;
    context: UnifiedMemoryContext | null;
    fromCache: boolean;
    processingTime: number;
    error?: string;
    metadata?: {
        layersAccessed: MemoryLevel[];
        duplicatesResolved: number;
        cacheHits: number;
    };
}

/**
 * メモリ要求タイプ
 */
export enum MemoryRequestType {
    CHAPTER_CONTEXT = 'CHAPTER_CONTEXT',
    CHARACTER_ANALYSIS = 'CHARACTER_ANALYSIS',
    NARRATIVE_STATE = 'NARRATIVE_STATE',
    WORLD_KNOWLEDGE = 'WORLD_KNOWLEDGE',
    SYSTEM_DIAGNOSTICS = 'SYSTEM_DIAGNOSTICS',
    INTEGRATED_CONTEXT = 'INTEGRATED_CONTEXT'
}

/**
 * メモリアクセスフィルター
 */
export interface MemoryAccessFilters {
    characterIds?: string[];
    eventTypes?: string[];
    analysisTypes?: string[];
    timeRange?: {
        startChapter: number;
        endChapter: number;
    };
    significance?: {
        min: number;
        max: number;
    };
}

/**
 * メモリアクセスオプション
 */
export interface MemoryAccessOptions {
    includeCache?: boolean;
    resolveDuplicates?: boolean;
    optimizeAccess?: boolean;
    deepAnalysis?: boolean;
    compressionLevel?: number;
}

/**
 * メモリ操作結果
 */
export interface MemoryOperationResult {
    success: boolean;
    processingTime: number;
    shortTermUpdated: boolean;
    integrationProcessed: boolean;
    duplicatesResolved: number;
    error?: string;
    metadata?: {
        chapterNumber?: number;
        dataSize?: number;
        timestamp: string;
    };
}

// ============================================================================
// Data Structure Types
// ============================================================================

/**
 * 章コンテキストデータ
 */
export interface ChapterContextData {
    chapter: Chapter;
    characterStates: Map<string, CharacterState>;
    keyPhrases: string[];
    analysisResults: ChapterAnalysisResult[];
    timestamp: string;
}

/**
 * 処理バッファ
 */
export interface ProcessingBuffer {
    id: string;
    type: ProcessingBufferType;
    data: any;
    timestamp: string;
    expiryTime: string;
}

export enum ProcessingBufferType {
    PROMPT_GENERATION = 'PROMPT_GENERATION',
    CONTEXT_GENERATION = 'CONTEXT_GENERATION',
    AI_ANALYSIS = 'AI_ANALYSIS',
    TEXT_ANALYSIS = 'TEXT_ANALYSIS',
    CHARACTER_DETECTION = 'CHARACTER_DETECTION'
}

/**
 * 物語進行データ
 */
export interface NarrativeProgressionData {
    storyState: StoryStateSnapshot[];
    chapterProgression: Map<number, ChapterProgressionRecord>;
    arcProgression: Map<number, ArcProgressionRecord>;
    tensionHistory: Map<number, TensionHistoryRecord>;
    turningPointsHistory: TurningPointRecord[];
}

/**
 * 分析結果データ
 */
export interface AnalysisResultData {
    emotionalArcDesigns: Map<number, EmotionalArcDesignRecord>;
    textAnalysisResults: Map<number, TextAnalysisResultRecord>;
    detectionResults: Map<number, DetectionResultRecord>;
    preGenerationResults: Map<number, PreGenerationResultRecord>;
    postGenerationResults: Map<number, PostGenerationResultRecord>;
}

/**
 * キャラクター進化データ
 */
export interface CharacterEvolutionData {
    developmentHistory: Map<string, CharacterDevelopmentRecord[]>;
    changeHistory: Map<string, CharacterChangeRecord[]>;
    relationshipEvolution: Map<string, RelationshipEvolutionRecord[]>;
    psychologyEvolution: Map<string, PsychologyEvolutionRecord[]>;
}

/**
 * システム統計データ
 */
export interface SystemStatisticsData {
    promptGenerationStats: PromptGenerationStatsRecord[];
    templateUsageStats: TemplateUsageStatsRecord[];
    tensionOptimizationStats: TensionOptimizationStatsRecord[];
    componentPerformanceStats: Map<string, ComponentPerformanceStats>;
    systemIntegrationStats: SystemIntegrationStatsRecord[];
}

/**
 * 品質メトリクスデータ
 */
export interface QualityMetricsData {
    chapterQualityHistory: ChapterQualityRecord[];
    systemQualityMetrics: SystemQualityMetricsRecord[];
    diagnosticHistory: DiagnosticHistoryRecord[];
    systemHealthMetrics: SystemHealthMetricsRecord[];
}

/**
 * 統合設定データ
 */
export interface ConsolidatedSettingsData {
    worldSettingsMaster: WorldSettingsMasterRecord;
    genreSettingsMaster: GenreSettingsMasterRecord;
    templateMaster: TemplateMasterRecord;
    systemConfigMaster: SystemConfigMasterRecord;
}

/**
 * 知識データベースデータ
 */
export interface KnowledgeDatabaseData {
    characters: Map<string, CharacterMasterRecord>;
    worldKnowledge: WorldKnowledgeDatabase;
    conceptDefinitions: Map<string, ConceptDefinitionRecord>;
    foreshadowingDatabase: ForeshadowingDatabase;
    sectionDefinitions: Map<string, SectionDefinitionRecord>;
}

/**
 * システム知識ベースデータ
 */
export interface SystemKnowledgeBaseData {
    promptGenerationPatterns: PromptGenerationPattern[];
    effectiveTemplatePatterns: EffectiveTemplatePattern[];
    analysisPatterns: AnalysisPattern[];
    optimizationStrategies: OptimizationStrategy[];
    errorPatterns: ErrorPattern[];
    qualityImprovementStrategies: QualityImprovementStrategy[];
}

/**
 * 完了記録データ
 */
export interface CompletedRecordsData {
    completedSections: Map<string, CompletedSectionRecord>;
    completedArcs: Map<number, CompletedArcRecord>;
    longTermEffectivenessRecords: LongTermEffectivenessRecord[];
}

/**
 * 解決された重複データ
 */
export interface ResolvedDuplicateData {
    id: string;
    type: DuplicateType;
    originalSources: string[];
    resolvedTo: string;
    timestamp: string;
    confidence: number;
}

export enum DuplicateType {
    WORLD_SETTINGS = 'WORLD_SETTINGS',
    CHARACTER_INFO = 'CHARACTER_INFO',
    MEMORY_ACCESS = 'MEMORY_ACCESS',
    GENRE_SETTINGS = 'GENRE_SETTINGS',
    AI_ANALYSIS = 'AI_ANALYSIS'
}

/**
 * キャッシュ統計データ
 */
export interface CacheStatisticsData {
    // UnifiedAccessAPI 用プロパティ
    hitRatio: number;
    missRatio: number;
    totalRequests: number;
    cacheSize: number;
    lastOptimization: string;
    evictionCount: number;
    
    // CacheCoordinator 用プロパティ（互換性のため）
    totalEntries?: number;
    hitRate?: number;
    avgAccessTime?: number;
    memoryUsage?: {
        shortTerm: number;
        midTerm: number;
        longTerm: number;
    } | number; // 両方の形式をサポート
    hitCount?: number;
    missCount?: number;
    totalSize?: number;
}

/**
 * アクセス最適化データ
 */
export interface AccessOptimizationData {
    optimizationType: OptimizationType;
    before: PerformanceMetrics;
    after: PerformanceMetrics;
    improvement: number;
    timestamp: string;
}

export enum OptimizationType {
    CACHE_OPTIMIZATION = 'CACHE_OPTIMIZATION',
    DUPLICATE_RESOLUTION = 'DUPLICATE_RESOLUTION',
    ACCESS_PATTERN_OPTIMIZATION = 'ACCESS_PATTERN_OPTIMIZATION',
    COMPRESSION_OPTIMIZATION = 'COMPRESSION_OPTIMIZATION'
}

/**
 * パフォーマンスメトリクス
 */
export interface PerformanceMetrics {
    responseTime: number;
    memoryUsage: number;
    cacheHitRatio: number;
    duplicateRatio: number;
    compressionRatio: number;
}

// ============================================================================
// System Status and Diagnostics Types
// ============================================================================

/**
 * メモリシステムステータス
 */
export interface MemorySystemStatus {
    initialized: boolean;
    lastUpdateTime: string;
    memoryLayers: {
        shortTerm: MemoryLayerStatus;
        midTerm: MemoryLayerStatus;
        longTerm: MemoryLayerStatus;
    };
    performanceMetrics: {
        totalRequests: number;
        cacheHits: number;
        duplicatesResolved: number;
        averageResponseTime: number;
        lastUpdateTime: string;
    };
    cacheStatistics: CacheStatisticsData;
}

/**
 * メモリ層ステータス
 */
export interface MemoryLayerStatus {
    healthy: boolean;
    dataCount: number;
    lastUpdate: string;
    storageSize: number;
    errorCount: number;
}

/**
 * システム診断
 */
export interface SystemDiagnostics {
    timestamp: string;
    systemHealth: SystemHealth;
    memoryLayers: {
        shortTerm: LayerDiagnostics;
        midTerm: LayerDiagnostics;
        longTerm: LayerDiagnostics;
    };
    integrationSystems: {
        duplicateResolver: IntegrationDiagnostics;
        cacheCoordinator: IntegrationDiagnostics;
        unifiedAccessAPI: IntegrationDiagnostics;
        dataIntegrationProcessor: IntegrationDiagnostics;
    };
    performanceMetrics: {
        totalRequests: number;
        cacheHits: number;
        duplicatesResolved: number;
        averageResponseTime: number;
        lastUpdateTime: string;
    };
    issues: string[];
    recommendations: string[];
}

export enum SystemHealth {
    HEALTHY = 'HEALTHY',
    DEGRADED = 'DEGRADED',
    CRITICAL = 'CRITICAL'
}

/**
 * 層診断
 */
export interface LayerDiagnostics {
    healthy: boolean;
    dataIntegrity: boolean;
    storageAccessible: boolean;
    lastBackup: string;
    performanceScore: number;
    recommendations: string[];
}

/**
 * 統合診断
 */
export interface IntegrationDiagnostics {
    operational: boolean;
    efficiency: number;
    errorRate: number;
    lastOptimization: string;
    recommendations: string[];
}

// ============================================================================
// Record Types for Specific Data
// ============================================================================

/**
 * 章分析結果
 */
export interface ChapterAnalysisResult {
    chapterNumber: number;
    analysisType: string;
    result: any;
    confidence: number;
    timestamp: string;
}

/**
 * ストーリー状態スナップショット
 */
export interface StoryStateSnapshot {
    chapterNumber: number;
    state: string;
    timestamp: string;
    metadata: any;
}

/**
 * 章進行記録
 */
export interface ChapterProgressionRecord {
    chapterNumber: number;
    progressScore: number;
    milestones: string[];
    timestamp: string;
}

/**
 * アーク進行記録
 */
export interface ArcProgressionRecord {
    arcNumber: number;
    completionRatio: number;
    keyEvents: string[];
    timestamp: string;
}

/**
 * テンション履歴記録
 */
export interface TensionHistoryRecord {
    chapterNumber: number;
    tensionLevel: number;
    factors: string[];
    timestamp: string;
}

/**
 * ターニングポイント記録
 */
export interface TurningPointRecord {
    chapterNumber: number;
    description: string;
    significance: number;
    timestamp: string;
}

/**
 * 感情アーク設計記録
 */
export interface EmotionalArcDesignRecord {
    chapterNumber: number;
    design: any;
    effectiveness: number;
    timestamp: string;
}

/**
 * テキスト分析結果記録
 */
export interface TextAnalysisResultRecord {
    chapterNumber: number;
    analysisResults: any;
    processingTime: number;
    timestamp: string;
}

/**
 * 検出結果記録
 */
export interface DetectionResultRecord {
    chapterNumber: number;
    detectedItems: any[];
    accuracy: number;
    timestamp: string;
}

/**
 * 生成前結果記録
 */
export interface PreGenerationResultRecord {
    chapterNumber: number;
    preparationData: any;
    qualityScore: number;
    timestamp: string;
}

/**
 * 生成後結果記録
 */
export interface PostGenerationResultRecord {
    chapterNumber: number;
    refinementData: any;
    improvementScore: number;
    timestamp: string;
}

/**
 * キャラクター開発記録
 */
export interface CharacterDevelopmentRecord {
    characterId: string;
    developmentPhase: string;
    changes: any[];
    timestamp: string;
}

/**
 * キャラクター変更記録
 */
export interface CharacterChangeRecord {
    characterId: string;
    changeType: string;
    oldValue: any;
    newValue: any;
    timestamp: string;
}

/**
 * 関係進化記録
 */
export interface RelationshipEvolutionRecord {
    characterIds: string[];
    relationshipType: string;
    evolutionStage: string;
    timestamp: string;
}

/**
 * 心理進化記録
 */
export interface PsychologyEvolutionRecord {
    characterId: string;
    psychologyAspect: string;
    evolution: any;
    timestamp: string;
}

/**
 * プロンプト生成統計記録
 */
export interface PromptGenerationStatsRecord {
    generationType: string;
    successRate: number;
    averageTime: number;
    timestamp: string;
}

/**
 * テンプレート使用統計記録
 */
export interface TemplateUsageStatsRecord {
    templateId: string;
    usageCount: number;
    effectiveness: number;
    timestamp: string;
}

/**
 * テンション最適化統計記録
 */
export interface TensionOptimizationStatsRecord {
    optimizationType: string;
    successRate: number;
    improvement: number;
    timestamp: string;
}

/**
 * コンポーネントパフォーマンス統計
 */
export interface ComponentPerformanceStats {
    componentName: string;
    responseTime: number;
    successRate: number;
    errorRate: number;
    lastUpdate: string;
}

/**
 * システム統合統計記録
 */
export interface SystemIntegrationStatsRecord {
    integrationType: string;
    efficiency: number;
    dataVolume: number;
    timestamp: string;
}

/**
 * 章品質記録
 */
export interface ChapterQualityRecord {
    chapterNumber: number;
    qualityScore: number;
    qualityFactors: any;
    timestamp: string;
}

/**
 * システム品質メトリクス記録
 */
export interface SystemQualityMetricsRecord {
    metricType: string;
    value: number;
    trend: string;
    timestamp: string;
}

/**
 * 診断履歴記録
 */
export interface DiagnosticHistoryRecord {
    diagnosticType: string;
    results: any;
    issues: string[];
    timestamp: string;
}

/**
 * システム健康メトリクス記録
 */
export interface SystemHealthMetricsRecord {
    healthScore: number;
    healthFactors: any;
    recommendations: string[];
    timestamp: string;
}

// Master Records for Long Term Memory

export interface WorldSettingsMasterRecord {
    consolidatedSettings: any;
    sources: string[];
    lastUpdate: string;
}

export interface GenreSettingsMasterRecord {
    consolidatedGenre: any;
    sources: string[];
    lastUpdate: string;
}

export interface TemplateMasterRecord {
    consolidatedTemplates: any;
    sources: string[];
    lastUpdate: string;
}

export interface SystemConfigMasterRecord {
    consolidatedConfig: any;
    sources: string[];
    lastUpdate: string;
}

export interface CharacterMasterRecord {
    consolidatedCharacter: any;
    sources: string[];
    lastUpdate: string;
}

export interface WorldKnowledgeDatabase {
    knowledge: any;
    categories: string[];
    lastUpdate: string;
}

export interface ConceptDefinitionRecord {
    concept: string;
    definition: any;
    references: string[];
    lastUpdate: string;
}

export interface ForeshadowingDatabase {
    foreshadowing: any[];
    categories: string[];
    lastUpdate: string;
}

export interface SectionDefinitionRecord {
    sectionId: string;
    definition: any;
    usage: any;
    lastUpdate: string;
}

export interface CompletedSectionRecord {
    sectionId: string;
    completionData: any;
    effectiveness: number;
    timestamp: string;
}

export interface CompletedArcRecord {
    arcNumber: number;
    completionData: any;
    effectiveness: number;
    timestamp: string;
}

export interface LongTermEffectivenessRecord {
    recordType: string;
    effectivenessData: any;
    trends: any;
    timestamp: string;
}

// System Knowledge Base Records

export interface PromptGenerationPattern {
    patternId: string;
    pattern: any;
    effectiveness: number;
    usage: any;
}

export interface EffectiveTemplatePattern {
    templateId: string;
    pattern: any;
    effectiveness: number;
    contexts: string[];
}

export interface AnalysisPattern {
    analysisType: string;
    pattern: any;
    accuracy: number;
    applications: string[];
}

export interface OptimizationStrategy {
    strategyId: string;
    strategy: any;
    effectiveness: number;
    contexts: string[];
}

export interface ErrorPattern {
    errorType: string;
    pattern: any;
    frequency: number;
    solutions: string[];
}

export interface QualityImprovementStrategy {
    strategyId: string;
    strategy: any;
    effectiveness: number;
    applications: string[];
}