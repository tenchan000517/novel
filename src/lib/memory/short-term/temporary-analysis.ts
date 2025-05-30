/**
 * @fileoverview 短期記憶における一時分析結果管理クラス
 * @description
 * 統合記憶階層システムの短期記憶層で、生成処理とAI分析の一時結果を管理します。
 * 12コンポーネントのデータ救済と重複処理排除を実現する統合キャッシュシステムを提供します。
 * 
 * 管理対象：
 * - PromptGenerator一時データ
 * - ContextGenerator一時データ
 * - Pre/PostGeneration一時データ
 * - EmotionalArcDesigner一時結果
 * - TextAnalyzer一時キャッシュ
 * - Detection一時結果
 * - 統合キャッシュシステム（重複解決、フォーマット結果）
 */

import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { Chapter } from '@/types/chapters';
import { Character } from '@/types/characters';
import { GenerationContext } from '@/types/generation';

// ============================================================================
// 型定義 - PromptGenerator一時データ
// ============================================================================

/**
 * アクティブなプロンプト生成状態
 */
interface ActivePromptGeneration {
    chapterNumber: number;
    templateId: string;
    context: GenerationContext;
    progress: 'STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    startTime: string;
    intermediateResults: string[];
    metadata: {
        retryCount: number;
        lastError?: string;
        estimatedCompletion?: string;
    };
}

/**
 * テンプレート処理状態
 */
interface TemplateProcessingState {
    templateId: string;
    processingSteps: Array<{
        step: string;
        status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
        result?: any;
        error?: string;
        timestamp: string;
    }>;
    currentStep: number;
    totalSteps: number;
    startTime: string;
}

/**
 * セクション構築状態
 */
interface SectionBuildingState {
    sectionId: string;
    chapterNumber: number;
    buildingPhase: 'ANALYSIS' | 'SYNTHESIS' | 'REFINEMENT' | 'COMPLETION';
    components: Map<string, {
        type: string;
        content: string;
        priority: number;
        status: 'DRAFT' | 'REVIEWED' | 'APPROVED';
    }>;
    dependencies: string[];
    estimatedLength: number;
    actualLength?: number;
}

// ============================================================================
// 型定義 - ContextGenerator一時データ
// ============================================================================

/**
 * コンテキスト生成状態
 */
interface ContextGenerationState {
    chapterNumber: number;
    generationPhase: 'COLLECTION' | 'INTEGRATION' | 'VALIDATION' | 'COMPLETION';
    collectedSources: Array<{
        source: 'SHORT_TERM' | 'MID_TERM' | 'LONG_TERM' | 'WORLD_KNOWLEDGE' | 'CHARACTER_DATA';
        data: any;
        weight: number;
        timestamp: string;
    }>;
    integrationProgress: {
        completed: string[];
        inProgress: string[];
        pending: string[];
    };
    validationResults: {
        consistency: boolean;
        completeness: number;
        issues: string[];
    };
}

/**
 * 統合処理状態
 */
interface IntegrationProcessingState {
    processId: string;
    sourceTypes: string[];
    targetFormat: string;
    integrationRules: Array<{
        rule: string;
        priority: number;
        applied: boolean;
    }>;
    conflicts: Array<{
        source1: string;
        source2: string;
        conflictType: string;
        resolution?: string;
    }>;
    result?: any;
}

// ============================================================================
// 型定義 - Pre/PostGeneration一時データ
// ============================================================================

/**
 * 前処理一時結果
 */
interface PreGenerationTempResult {
    chapterNumber: number;
    processingSteps: Array<{
        stepName: string;
        input: any;
        output: any;
        processingTime: number;
        status: 'SUCCESS' | 'WARNING' | 'ERROR';
        metadata?: any;
    }>;
    contextEnhancements: {
        addedElements: string[];
        modifiedElements: string[];
        removedElements: string[];
    };
    validationResults: {
        passed: boolean;
        warnings: string[];
        errors: string[];
    };
    timestamp: string;
}

/**
 * 後処理一時結果
 */
interface PostGenerationTempResult {
    chapterNumber: number;
    originalContent: string;
    processedContent: string;
    appliedImprovements: Array<{
        type: string;
        description: string;
        before: string;
        after: string;
        confidence: number;
    }>;
    qualityMetrics: {
        coherence: number;
        engagement: number;
        consistency: number;
        overallScore: number;
    };
    suggestions: string[];
    timestamp: string;
}

// ============================================================================
// 型定義 - AI分析一時結果
// ============================================================================

/**
 * 感情分析一時結果
 */
interface EmotionalAnalysisTempResult {
    chapterNumber: number;
    emotionalDimensions: {
        [dimensionName: string]: {
            start: number;
            middle: number;
            end: number;
        };
    };
    overallTone: string;
    emotionalImpact: number;
    analysisMetadata: {
        confidence: number;
        processingTime: number;
        modelsUsed: string[];
        rawOutput?: string;
    };
    timestamp: string;
}

/**
 * テキスト分析キャッシュエントリ
 */
interface TextAnalysisCacheEntry {
    contentHash: string;
    analysisType: string;
    result: {
        characterStates?: any[];
        themes?: string[];
        sentiment?: any;
        keyPhrases?: string[];
        relationships?: any[];
    };
    metadata: {
        analysisDate: string;
        confidence: number;
        processingTime: number;
        cacheHits: number;
    };
    expiresAt: string;
}

/**
 * 検出一時結果
 */
interface DetectionTempResult {
    chapterNumber: number;
    detectionType: 'CHARACTER' | 'EVENT' | 'FORESHADOWING' | 'INCONSISTENCY';
    detectedItems: Array<{
        item: any;
        confidence: number;
        location: {
            start: number;
            end: number;
            context: string;
        };
        metadata?: any;
    }>;
    processingStats: {
        totalItems: number;
        highConfidenceItems: number;
        processingTime: number;
    };
    timestamp: string;
}

// ============================================================================
// 型定義 - 統合キャッシュシステム
// ============================================================================

/**
 * 世界設定キャッシュエントリ
 */
interface WorldSettingsCacheEntry {
    consolidatedSettings: {
        description: string;
        regions: string[];
        history: string[];
        rules: string[];
        genre: string;
    };
    sourceLocations: Array<{
        location: string;
        priority: number;
        lastUpdated: string;
    }>;
    consolidationMetadata: {
        lastConsolidation: string;
        conflictsResolved: number;
        mergeStrategy: string;
    };
}

/**
 * キャラクター情報キャッシュエントリ
 */
interface CharacterInfoCacheEntry {
    characterId: string;
    characterName: string;
    consolidatedInfo: {
        basic: Character;
        formatted: any;
        relationships: any[];
        history: any[];
    };
    sourceData: Array<{
        source: string;
        data: any;
        lastUpdated: string;
        reliability: number;
    }>;
    cacheMetadata: {
        created: string;
        lastAccessed: string;
        hitCount: number;
        formatRequests: number;
    };
}

/**
 * メモリアクセスキャッシュエントリ
 */
interface MemoryAccessCacheEntry {
    queryHash: string;
    queryType: 'SEARCH' | 'FILTER' | 'AGGREGATE' | 'RELATE';
    queryParams: any;
    result: any;
    metadata: {
        resultSize: number;
        processingTime: number;
        sourcesAccessed: string[];
        cacheHits: number;
        created: string;
        lastAccessed: string;
    };
    expiresAt: string;
}

/**
 * フォーマット結果キャッシュエントリ
 */
interface FormatResultsCacheEntry {
    inputHash: string;
    formatType: string;
    inputData: any;
    formattedResult: any;
    metadata: {
        formatTime: number;
        compressionRatio?: number;
        qualityScore?: number;
        created: string;
        hitCount: number;
    };
    expiresAt: string;
}

/**
 * 計算結果キャッシュエントリ
 */
interface CalculationResultsCacheEntry {
    calculationType: string;
    inputParameters: any;
    result: any;
    metadata: {
        calculationTime: number;
        complexity: 'LOW' | 'MEDIUM' | 'HIGH';
        accuracy: number;
        created: string;
        hitCount: number;
    };
    expiresAt: string;
}

// ============================================================================
// メインクラス
// ============================================================================

/**
 * @class TemporaryAnalysis
 * @description
 * 短期記憶における一時分析結果を管理するクラス。
 * 12コンポーネントのデータ救済と統合キャッシュシステムを提供し、
 * 重複処理を排除して効率的なデータアクセスを実現します。
 */
export class TemporaryAnalysis {
    // 生成処理一時結果
    private promptGeneration: Map<number, ActivePromptGeneration> = new Map();
    private templateProcessing: Map<string, TemplateProcessingState> = new Map();
    private sectionBuilding: Map<string, SectionBuildingState> = new Map();
    private contextGeneration: Map<number, ContextGenerationState> = new Map();
    private integrationProcessing: Map<string, IntegrationProcessingState> = new Map();
    private preGenerationResults: Map<number, PreGenerationTempResult> = new Map();
    private postGenerationResults: Map<number, PostGenerationTempResult> = new Map();

    // AI分析一時結果
    private emotionalAnalysis: Map<number, EmotionalAnalysisTempResult> = new Map();
    private textAnalysisCache: Map<string, TextAnalysisCacheEntry> = new Map();
    private detectionResults: Map<number, DetectionTempResult> = new Map();

    // 統合キャッシュシステム
    private worldSettingsCache: WorldSettingsCacheEntry | null = null;
    private characterInfoCache: Map<string, CharacterInfoCacheEntry> = new Map();
    private memoryAccessCache: Map<string, MemoryAccessCacheEntry> = new Map();
    private formatResultsCache: Map<string, FormatResultsCacheEntry> = new Map();
    private calculationResultsCache: Map<string, CalculationResultsCacheEntry> = new Map();

    // システム状態
    private initialized: boolean = false;
    private lastCleanup: string = new Date().toISOString();
    private autoCleanupInterval: NodeJS.Timeout | null = null;
    private readonly MAX_RETENTION_HOURS = 72; // 72時間保持

    /**
     * コンストラクタ
     */
    constructor() {
        logger.info('TemporaryAnalysis initialized');
    }

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('TemporaryAnalysis already initialized');
            return;
        }

        try {
            // ストレージから既存データを読み込み
            await this.loadFromStorage();

            // 自動クリーンアップの設定
            this.setupAutoCleanup();

            this.initialized = true;
            logger.info('TemporaryAnalysis initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize TemporaryAnalysis', {
                error: error instanceof Error ? error.message : String(error)
            });
            this.initialized = true; // エラー時も初期化済みとして続行
        }
    }

    // ============================================================================
    // PromptGenerator一時データ管理
    // ============================================================================

    /**
     * アクティブプロンプト生成を記録
     */
    async recordActivePromptGeneration(data: ActivePromptGeneration): Promise<void> {
        try {
            this.promptGeneration.set(data.chapterNumber, data);
            await this.saveToStorage('prompt-generation', this.mapToObject(this.promptGeneration));
            
            logger.debug(`Recorded active prompt generation for chapter ${data.chapterNumber}`);
        } catch (error) {
            logger.error('Failed to record active prompt generation', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * アクティブプロンプト生成を取得
     */
    getActivePromptGeneration(chapterNumber: number): ActivePromptGeneration | null {
        return this.promptGeneration.get(chapterNumber) || null;
    }

    /**
     * テンプレート処理状態を記録
     */
    async recordTemplateProcessing(templateId: string, state: TemplateProcessingState): Promise<void> {
        try {
            this.templateProcessing.set(templateId, state);
            await this.saveToStorage('template-processing', this.mapToObject(this.templateProcessing));
            
            logger.debug(`Recorded template processing state for ${templateId}`);
        } catch (error) {
            logger.error('Failed to record template processing state', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * テンプレート処理状態を取得
     */
    getTemplateProcessingState(templateId: string): TemplateProcessingState | null {
        return this.templateProcessing.get(templateId) || null;
    }

    /**
     * セクション構築状態を記録
     */
    async recordSectionBuilding(sectionId: string, state: SectionBuildingState): Promise<void> {
        try {
            // Mapオブジェクトを通常のオブジェクトに変換
            const serializedState = {
                ...state,
                components: this.mapToObject(state.components)
            };
            
            this.sectionBuilding.set(sectionId, state);
            await this.saveToStorage('section-building', this.mapToObject(this.sectionBuilding));
            
            logger.debug(`Recorded section building state for ${sectionId}`);
        } catch (error) {
            logger.error('Failed to record section building state', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * セクション構築状態を取得
     */
    getSectionBuildingState(sectionId: string): SectionBuildingState | null {
        return this.sectionBuilding.get(sectionId) || null;
    }

    // ============================================================================
    // ContextGenerator一時データ管理
    // ============================================================================

    /**
     * コンテキスト生成状態を記録
     */
    async recordContextGeneration(chapterNumber: number, state: ContextGenerationState): Promise<void> {
        try {
            this.contextGeneration.set(chapterNumber, state);
            await this.saveToStorage('context-generation', this.mapToObject(this.contextGeneration));
            
            logger.debug(`Recorded context generation state for chapter ${chapterNumber}`);
        } catch (error) {
            logger.error('Failed to record context generation state', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * コンテキスト生成状態を取得
     */
    getContextGenerationState(chapterNumber: number): ContextGenerationState | null {
        return this.contextGeneration.get(chapterNumber) || null;
    }

    /**
     * 統合処理状態を記録
     */
    async recordIntegrationProcessing(processId: string, state: IntegrationProcessingState): Promise<void> {
        try {
            this.integrationProcessing.set(processId, state);
            await this.saveToStorage('integration-processing', this.mapToObject(this.integrationProcessing));
            
            logger.debug(`Recorded integration processing state for ${processId}`);
        } catch (error) {
            logger.error('Failed to record integration processing state', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 統合処理状態を取得
     */
    getIntegrationProcessingState(processId: string): IntegrationProcessingState | null {
        return this.integrationProcessing.get(processId) || null;
    }

    // ============================================================================
    // Pre/PostGeneration一時データ管理
    // ============================================================================

    /**
     * 前処理一時結果を記録
     */
    async recordPreGenerationResult(chapterNumber: number, result: PreGenerationTempResult): Promise<void> {
        try {
            this.preGenerationResults.set(chapterNumber, result);
            await this.saveToStorage('pre-generation-results', this.mapToObject(this.preGenerationResults));
            
            logger.debug(`Recorded pre-generation result for chapter ${chapterNumber}`);
        } catch (error) {
            logger.error('Failed to record pre-generation result', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 前処理一時結果を取得
     */
    getPreGenerationResult(chapterNumber: number): PreGenerationTempResult | null {
        return this.preGenerationResults.get(chapterNumber) || null;
    }

    /**
     * 後処理一時結果を記録
     */
    async recordPostGenerationResult(chapterNumber: number, result: PostGenerationTempResult): Promise<void> {
        try {
            this.postGenerationResults.set(chapterNumber, result);
            await this.saveToStorage('post-generation-results', this.mapToObject(this.postGenerationResults));
            
            logger.debug(`Recorded post-generation result for chapter ${chapterNumber}`);
        } catch (error) {
            logger.error('Failed to record post-generation result', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 後処理一時結果を取得
     */
    getPostGenerationResult(chapterNumber: number): PostGenerationTempResult | null {
        return this.postGenerationResults.get(chapterNumber) || null;
    }

    // ============================================================================
    // AI分析一時結果管理
    // ============================================================================

    /**
     * 感情分析一時結果を記録
     */
    async recordEmotionalAnalysis(chapterNumber: number, result: EmotionalAnalysisTempResult): Promise<void> {
        try {
            this.emotionalAnalysis.set(chapterNumber, result);
            await this.saveToStorage('emotional-analysis', this.mapToObject(this.emotionalAnalysis));
            
            logger.debug(`Recorded emotional analysis for chapter ${chapterNumber}`);
        } catch (error) {
            logger.error('Failed to record emotional analysis', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 感情分析一時結果を取得
     */
    getEmotionalAnalysis(chapterNumber: number): EmotionalAnalysisTempResult | null {
        return this.emotionalAnalysis.get(chapterNumber) || null;
    }

    /**
     * テキスト分析キャッシュを記録
     */
    async recordTextAnalysisCache(contentHash: string, entry: TextAnalysisCacheEntry): Promise<void> {
        try {
            // アクセス回数を増加
            if (this.textAnalysisCache.has(contentHash)) {
                const existing = this.textAnalysisCache.get(contentHash)!;
                existing.metadata.cacheHits++;
            }
            
            this.textAnalysisCache.set(contentHash, entry);
            await this.saveToStorage('text-analysis-cache', this.mapToObject(this.textAnalysisCache));
            
            logger.debug(`Recorded text analysis cache for hash ${contentHash.substring(0, 8)}...`);
        } catch (error) {
            logger.error('Failed to record text analysis cache', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * テキスト分析キャッシュを取得
     */
    getTextAnalysisCache(contentHash: string): TextAnalysisCacheEntry | null {
        const entry = this.textAnalysisCache.get(contentHash);
        
        if (entry) {
            // 有効期限をチェック
            if (new Date(entry.expiresAt) < new Date()) {
                this.textAnalysisCache.delete(contentHash);
                return null;
            }
            
            // ヒット数を更新
            entry.metadata.cacheHits++;
            return entry;
        }
        
        return null;
    }

    /**
     * 検出一時結果を記録
     */
    async recordDetectionResult(chapterNumber: number, result: DetectionTempResult): Promise<void> {
        try {
            this.detectionResults.set(chapterNumber, result);
            await this.saveToStorage('detection-results', this.mapToObject(this.detectionResults));
            
            logger.debug(`Recorded detection result for chapter ${chapterNumber}`);
        } catch (error) {
            logger.error('Failed to record detection result', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 検出一時結果を取得
     */
    getDetectionResult(chapterNumber: number): DetectionTempResult | null {
        return this.detectionResults.get(chapterNumber) || null;
    }

    // ============================================================================
    // 統合キャッシュシステム管理
    // ============================================================================

    /**
     * 世界設定統合キャッシュを更新
     */
    async updateWorldSettingsCache(cache: WorldSettingsCacheEntry): Promise<void> {
        try {
            this.worldSettingsCache = cache;
            await this.saveToStorage('world-settings-cache', cache);
            
            logger.debug('Updated world settings cache');
        } catch (error) {
            logger.error('Failed to update world settings cache', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 世界設定統合キャッシュを取得
     */
    getWorldSettingsCache(): WorldSettingsCacheEntry | null {
        return this.worldSettingsCache;
    }

    /**
     * キャラクター情報キャッシュを記録
     */
    async recordCharacterInfoCache(characterId: string, entry: CharacterInfoCacheEntry): Promise<void> {
        try {
            // アクセス情報を更新
            if (this.characterInfoCache.has(characterId)) {
                const existing = this.characterInfoCache.get(characterId)!;
                existing.cacheMetadata.lastAccessed = new Date().toISOString();
                existing.cacheMetadata.hitCount++;
            }
            
            this.characterInfoCache.set(characterId, entry);
            await this.saveToStorage('character-info-cache', this.mapToObject(this.characterInfoCache));
            
            logger.debug(`Recorded character info cache for ${characterId}`);
        } catch (error) {
            logger.error('Failed to record character info cache', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * キャラクター情報キャッシュを取得
     */
    getCharacterInfoCache(characterId: string): CharacterInfoCacheEntry | null {
        const entry = this.characterInfoCache.get(characterId);
        
        if (entry) {
            // アクセス情報を更新
            entry.cacheMetadata.lastAccessed = new Date().toISOString();
            entry.cacheMetadata.hitCount++;
            return entry;
        }
        
        return null;
    }

    /**
     * メモリアクセスキャッシュを記録
     */
    async recordMemoryAccessCache(queryHash: string, entry: MemoryAccessCacheEntry): Promise<void> {
        try {
            this.memoryAccessCache.set(queryHash, entry);
            await this.saveToStorage('memory-access-cache', this.mapToObject(this.memoryAccessCache));
            
            logger.debug(`Recorded memory access cache for query ${queryHash.substring(0, 8)}...`);
        } catch (error) {
            logger.error('Failed to record memory access cache', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * メモリアクセスキャッシュを取得
     */
    getMemoryAccessCache(queryHash: string): MemoryAccessCacheEntry | null {
        const entry = this.memoryAccessCache.get(queryHash);
        
        if (entry) {
            // 有効期限をチェック
            if (new Date(entry.expiresAt) < new Date()) {
                this.memoryAccessCache.delete(queryHash);
                return null;
            }
            
            // アクセス情報を更新
            entry.metadata.lastAccessed = new Date().toISOString();
            entry.metadata.cacheHits++;
            return entry;
        }
        
        return null;
    }

    /**
     * フォーマット結果キャッシュを記録
     */
    async recordFormatResultsCache(inputHash: string, entry: FormatResultsCacheEntry): Promise<void> {
        try {
            this.formatResultsCache.set(inputHash, entry);
            await this.saveToStorage('format-results-cache', this.mapToObject(this.formatResultsCache));
            
            logger.debug(`Recorded format results cache for input ${inputHash.substring(0, 8)}...`);
        } catch (error) {
            logger.error('Failed to record format results cache', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * フォーマット結果キャッシュを取得
     */
    getFormatResultsCache(inputHash: string): FormatResultsCacheEntry | null {
        const entry = this.formatResultsCache.get(inputHash);
        
        if (entry) {
            // 有効期限をチェック
            if (new Date(entry.expiresAt) < new Date()) {
                this.formatResultsCache.delete(inputHash);
                return null;
            }
            
            // ヒット数を更新
            entry.metadata.hitCount++;
            return entry;
        }
        
        return null;
    }

    /**
     * 計算結果キャッシュを記録
     */
    async recordCalculationResultsCache(
        calculationType: string, 
        inputParameters: any, 
        entry: CalculationResultsCacheEntry
    ): Promise<void> {
        try {
            const cacheKey = this.generateCalculationCacheKey(calculationType, inputParameters);
            this.calculationResultsCache.set(cacheKey, entry);
            await this.saveToStorage('calculation-results-cache', this.mapToObject(this.calculationResultsCache));
            
            logger.debug(`Recorded calculation results cache for ${calculationType}`);
        } catch (error) {
            logger.error('Failed to record calculation results cache', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 計算結果キャッシュを取得
     */
    getCalculationResultsCache(calculationType: string, inputParameters: any): CalculationResultsCacheEntry | null {
        const cacheKey = this.generateCalculationCacheKey(calculationType, inputParameters);
        const entry = this.calculationResultsCache.get(cacheKey);
        
        if (entry) {
            // 有効期限をチェック
            if (new Date(entry.expiresAt) < new Date()) {
                this.calculationResultsCache.delete(cacheKey);
                return null;
            }
            
            // ヒット数を更新
            entry.metadata.hitCount++;
            return entry;
        }
        
        return null;
    }

    // ============================================================================
    // ユーティリティメソッド
    // ============================================================================

    /**
     * 計算キャッシュキーを生成
     */
    private generateCalculationCacheKey(calculationType: string, inputParameters: any): string {
        const paramString = JSON.stringify(inputParameters, Object.keys(inputParameters).sort());
        return `${calculationType}:${this.simpleHash(paramString)}`;
    }

    /**
     * 簡易ハッシュ関数
     */
    private simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit整数に変換
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Mapをオブジェクトに変換
     */
    private mapToObject<T>(map: Map<string | number, T>): { [key: string]: T } {
        const obj: { [key: string]: T } = {};
        map.forEach((value, key) => {
            obj[String(key)] = value;
        });
        return obj;
    }

    /**
     * オブジェクトをMapに変換
     */
    private objectToMap<T>(obj: { [key: string]: T }): Map<string, T> {
        const map = new Map<string, T>();
        Object.keys(obj).forEach(key => {
            map.set(key, obj[key]);
        });
        return map;
    }

    /**
     * 数値キー用のオブジェクトをMapに変換
     */
    private objectToNumberMap<T>(obj: { [key: string]: T }): Map<number, T> {
        const map = new Map<number, T>();
        Object.keys(obj).forEach(key => {
            const numKey = parseInt(key, 10);
            if (!isNaN(numKey)) {
                map.set(numKey, obj[key]);
            }
        });
        return map;
    }

    // ============================================================================
    // ストレージ管理
    // ============================================================================

    /**
     * ストレージからデータを読み込み
     */
    private async loadFromStorage(): Promise<void> {
        try {
            const loadTasks = [
                this.loadStorageData('prompt-generation', (data) => {
                    this.promptGeneration = this.objectToNumberMap(data);
                }),
                this.loadStorageData('template-processing', (data) => {
                    this.templateProcessing = this.objectToMap(data);
                }),
                this.loadStorageData('section-building', (data) => {
                    this.sectionBuilding = this.objectToMap(data);
                }),
                this.loadStorageData('context-generation', (data) => {
                    this.contextGeneration = this.objectToNumberMap(data);
                }),
                this.loadStorageData('integration-processing', (data) => {
                    this.integrationProcessing = this.objectToMap(data);
                }),
                this.loadStorageData('pre-generation-results', (data) => {
                    this.preGenerationResults = this.objectToNumberMap(data);
                }),
                this.loadStorageData('post-generation-results', (data) => {
                    this.postGenerationResults = this.objectToNumberMap(data);
                }),
                this.loadStorageData('emotional-analysis', (data) => {
                    this.emotionalAnalysis = this.objectToNumberMap(data);
                }),
                this.loadStorageData('text-analysis-cache', (data) => {
                    this.textAnalysisCache = this.objectToMap(data);
                }),
                this.loadStorageData('detection-results', (data) => {
                    this.detectionResults = this.objectToNumberMap(data);
                }),
                this.loadStorageData('world-settings-cache', (data) => {
                    this.worldSettingsCache = data;
                }),
                this.loadStorageData('character-info-cache', (data) => {
                    this.characterInfoCache = this.objectToMap(data);
                }),
                this.loadStorageData('memory-access-cache', (data) => {
                    this.memoryAccessCache = this.objectToMap(data);
                }),
                this.loadStorageData('format-results-cache', (data) => {
                    this.formatResultsCache = this.objectToMap(data);
                }),
                this.loadStorageData('calculation-results-cache', (data) => {
                    this.calculationResultsCache = this.objectToMap(data);
                })
            ];

            await Promise.allSettled(loadTasks);
            logger.info('Loaded temporary analysis data from storage');
        } catch (error) {
            logger.error('Failed to load temporary analysis data', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 個別のストレージデータを読み込み
     */
    private async loadStorageData(
        filename: string, 
        processor: (data: any) => void
    ): Promise<void> {
        try {
            const path = `temporary-analysis/${filename}.json`;
            
            if (await storageProvider.fileExists(path)) {
                const content = await storageProvider.readFile(path);
                const data = JSON.parse(content);
                processor(data);
            }
        } catch (error) {
            logger.debug(`Failed to load ${filename}`, {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * ストレージにデータを保存
     */
    private async saveToStorage(filename: string, data: any): Promise<void> {
        try {
            const path = `temporary-analysis/${filename}.json`;
            await storageProvider.writeFile(path, JSON.stringify(data, null, 2));
        } catch (error) {
            logger.error(`Failed to save ${filename}`, {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    // ============================================================================
    // クリーンアップ管理
    // ============================================================================

    /**
     * 自動クリーンアップを設定
     */
    private setupAutoCleanup(): void {
        // 1時間ごとにクリーンアップを実行
        this.autoCleanupInterval = setInterval(() => {
            this.performCleanup().catch(error => {
                logger.error('Auto cleanup failed', {
                    error: error instanceof Error ? error.message : String(error)
                });
            });
        }, 60 * 60 * 1000); // 1時間

        logger.info('Auto cleanup scheduled every hour');
    }

    /**
     * クリーンアップを実行
     */
    async performCleanup(): Promise<void> {
        try {
            logger.info('Starting temporary analysis cleanup');

            const cutoffTime = new Date();
            cutoffTime.setHours(cutoffTime.getHours() - this.MAX_RETENTION_HOURS);
            const cutoffTimeStr = cutoffTime.toISOString();

            let totalCleaned = 0;

            // 生成処理一時結果のクリーンアップ
            totalCleaned += this.cleanupByTimestamp(this.promptGeneration, cutoffTimeStr, 'startTime');
            totalCleaned += this.cleanupByTimestamp(this.templateProcessing, cutoffTimeStr, 'startTime');
            totalCleaned += this.cleanupByTimestamp(this.preGenerationResults, cutoffTimeStr, 'timestamp');
            totalCleaned += this.cleanupByTimestamp(this.postGenerationResults, cutoffTimeStr, 'timestamp');

            // AI分析一時結果のクリーンアップ
            totalCleaned += this.cleanupByTimestamp(this.emotionalAnalysis, cutoffTimeStr, 'timestamp');
            totalCleaned += this.cleanupByTimestamp(this.detectionResults, cutoffTimeStr, 'timestamp');

            // 期限切れキャッシュのクリーンアップ
            totalCleaned += this.cleanupExpiredCache(this.textAnalysisCache, 'expiresAt');
            totalCleaned += this.cleanupExpiredCache(this.memoryAccessCache, 'expiresAt');
            totalCleaned += this.cleanupExpiredCache(this.formatResultsCache, 'expiresAt');
            totalCleaned += this.cleanupExpiredCache(this.calculationResultsCache, 'expiresAt');

            this.lastCleanup = new Date().toISOString();

            if (totalCleaned > 0) {
                // クリーンアップ後にストレージを更新
                await this.saveAllToStorage();
                logger.info(`Cleanup completed: ${totalCleaned} items removed`);
            } else {
                logger.debug('Cleanup completed: no items to remove');
            }
        } catch (error) {
            logger.error('Cleanup failed', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * タイムスタンプベースのクリーンアップ
     */
    private cleanupByTimestamp<T extends { [key: string]: any }>(
        map: Map<any, T>,
        cutoffTime: string,
        timestampField: string
    ): number {
        let cleaned = 0;
        const toDelete: any[] = [];

        map.forEach((value, key) => {
            if (value[timestampField] && value[timestampField] < cutoffTime) {
                toDelete.push(key);
            }
        });

        toDelete.forEach(key => {
            map.delete(key);
            cleaned++;
        });

        return cleaned;
    }

    /**
     * 期限切れキャッシュのクリーンアップ
     */
    private cleanupExpiredCache<T extends { expiresAt: string }>(
        map: Map<any, T>,
        expiresField: string
    ): number {
        let cleaned = 0;
        const toDelete: any[] = [];
        const now = new Date().toISOString();

        map.forEach((value, key) => {
            if (value.expiresAt < now) {
                toDelete.push(key);
            }
        });

        toDelete.forEach(key => {
            map.delete(key);
            cleaned++;
        });

        return cleaned;
    }

    /**
     * 全データをストレージに保存
     */
    private async saveAllToStorage(): Promise<void> {
        const saveTasks = [
            this.saveToStorage('prompt-generation', this.mapToObject(this.promptGeneration)),
            this.saveToStorage('template-processing', this.mapToObject(this.templateProcessing)),
            this.saveToStorage('section-building', this.mapToObject(this.sectionBuilding)),
            this.saveToStorage('context-generation', this.mapToObject(this.contextGeneration)),
            this.saveToStorage('integration-processing', this.mapToObject(this.integrationProcessing)),
            this.saveToStorage('pre-generation-results', this.mapToObject(this.preGenerationResults)),
            this.saveToStorage('post-generation-results', this.mapToObject(this.postGenerationResults)),
            this.saveToStorage('emotional-analysis', this.mapToObject(this.emotionalAnalysis)),
            this.saveToStorage('text-analysis-cache', this.mapToObject(this.textAnalysisCache)),
            this.saveToStorage('detection-results', this.mapToObject(this.detectionResults)),
            this.saveToStorage('character-info-cache', this.mapToObject(this.characterInfoCache)),
            this.saveToStorage('memory-access-cache', this.mapToObject(this.memoryAccessCache)),
            this.saveToStorage('format-results-cache', this.mapToObject(this.formatResultsCache)),
            this.saveToStorage('calculation-results-cache', this.mapToObject(this.calculationResultsCache))
        ];

        if (this.worldSettingsCache) {
            saveTasks.push(this.saveToStorage('world-settings-cache', this.worldSettingsCache));
        }

        await Promise.allSettled(saveTasks);
    }

    // ============================================================================
    // 統計・状態管理
    // ============================================================================

    /**
     * システム統計を取得
     */
    getSystemStatistics(): {
        generationProcessing: {
            activePromptGenerations: number;
            templateProcessingStates: number;
            sectionBuildingStates: number;
            contextGenerationStates: number;
            integrationProcessingStates: number;
            preGenerationResults: number;
            postGenerationResults: number;
        };
        aiAnalysisResults: {
            emotionalAnalysisResults: number;
            textAnalysisCacheEntries: number;
            detectionResults: number;
        };
        unifiedCache: {
            hasWorldSettingsCache: boolean;
            characterInfoCacheEntries: number;
            memoryAccessCacheEntries: number;
            formatResultsCacheEntries: number;
            calculationResultsCacheEntries: number;
        };
        systemInfo: {
            initialized: boolean;
            lastCleanup: string;
            maxRetentionHours: number;
        };
    } {
        return {
            generationProcessing: {
                activePromptGenerations: this.promptGeneration.size,
                templateProcessingStates: this.templateProcessing.size,
                sectionBuildingStates: this.sectionBuilding.size,
                contextGenerationStates: this.contextGeneration.size,
                integrationProcessingStates: this.integrationProcessing.size,
                preGenerationResults: this.preGenerationResults.size,
                postGenerationResults: this.postGenerationResults.size
            },
            aiAnalysisResults: {
                emotionalAnalysisResults: this.emotionalAnalysis.size,
                textAnalysisCacheEntries: this.textAnalysisCache.size,
                detectionResults: this.detectionResults.size
            },
            unifiedCache: {
                hasWorldSettingsCache: this.worldSettingsCache !== null,
                characterInfoCacheEntries: this.characterInfoCache.size,
                memoryAccessCacheEntries: this.memoryAccessCache.size,
                formatResultsCacheEntries: this.formatResultsCache.size,
                calculationResultsCacheEntries: this.calculationResultsCache.size
            },
            systemInfo: {
                initialized: this.initialized,
                lastCleanup: this.lastCleanup,
                maxRetentionHours: this.MAX_RETENTION_HOURS
            }
        };
    }

    /**
     * 手動クリーンアップを実行
     */
    async manualCleanup(): Promise<{
        success: boolean;
        itemsRemoved: number;
        error?: string;
    }> {
        try {
            const statsBefore = this.getSystemStatistics();
            await this.performCleanup();
            const statsAfter = this.getSystemStatistics();

            const itemsRemoved = 
                (statsBefore.generationProcessing.activePromptGenerations - statsAfter.generationProcessing.activePromptGenerations) +
                (statsBefore.generationProcessing.templateProcessingStates - statsAfter.generationProcessing.templateProcessingStates) +
                (statsBefore.aiAnalysisResults.emotionalAnalysisResults - statsAfter.aiAnalysisResults.emotionalAnalysisResults) +
                (statsBefore.aiAnalysisResults.textAnalysisCacheEntries - statsAfter.aiAnalysisResults.textAnalysisCacheEntries) +
                (statsBefore.unifiedCache.memoryAccessCacheEntries - statsAfter.unifiedCache.memoryAccessCacheEntries) +
                (statsBefore.unifiedCache.formatResultsCacheEntries - statsAfter.unifiedCache.formatResultsCacheEntries) +
                (statsBefore.unifiedCache.calculationResultsCacheEntries - statsAfter.unifiedCache.calculationResultsCacheEntries);

            return {
                success: true,
                itemsRemoved
            };
        } catch (error) {
            return {
                success: false,
                itemsRemoved: 0,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * リソースのクリーンアップ
     */
    destroy(): void {
        if (this.autoCleanupInterval) {
            clearInterval(this.autoCleanupInterval);
            this.autoCleanupInterval = null;
        }
        
        logger.info('TemporaryAnalysis destroyed');
    }
}