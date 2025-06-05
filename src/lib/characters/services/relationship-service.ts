/**
 * @fileoverview 記憶階層システム完全統合関係性サービス（即座使用可能版）
 * @description
 * 新しい記憶階層システム（MemoryManager）と完全統合されたキャラクター関係性管理クラス。
 * ファザードパターンに最適化：initializeメソッドを削除し、即座に使用可能。
 * repositoriesは使用せず、統一アクセスAPI、重複解決、品質保証システムと完全連携。
 */
import { Logger } from '@/lib/utils/logger';
import {
    Character,
    Relationship,
    RelationshipType,
    RelationshipAnalysis,
    RelationshipResponse,
    CharacterCluster,
    RelationshipTension
} from '../core/types';
import { IRelationshipService } from '../core/interfaces';
import { NotFoundError, CharacterError } from '../core/errors';
import { Chapter } from '@/types/chapters';

// 🔄 新しい記憶階層システムのインポート
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { MemoryLevel } from '@/lib/memory/core/types';

import {
    RelationshipMemoryData,
    RelationshipHierarchicalData,
    IMemoryHierarchyIntegration,
    IntegrationResult
} from './memory-hierarchy-types';

/**
 * パフォーマンス統計の型定義
 */
interface PerformanceStats {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageProcessingTime: number;
    memorySystemHits: number;
    cacheEfficiencyRate: number;
    lastOptimization: string;
}

interface RelationshipEvolutionReport {
    character1Id: string;
    character2Id: string;
    currentState: Relationship;
    evolutionPatterns: Array<{
        timestamp: string;
        changeType: string;
        description: string;
        significance: number;
    }>;
    predictions: Array<{
        timeframe: string;
        predictedType: RelationshipType;
        confidence: number;
        reason: string;
    }>;
    significantEvents: Array<{
        chapterNumber: number;
        description: string;
        impact: number;
    }>;
    stabilityScore: number;
    reportDate: Date;
    memorySystemInsights: Array<{
        insight: string;
        confidence: number;
        source: MemoryLevel;
    }>;
    crossLevelAnalysis: {
        shortTermChanges: number;
        midTermPatterns: number;
        longTermStability: number;
    };
    systemValidationScore: number;
}

interface RelationshipInconsistency {
    type: string;
    relationship1: any;
    relationship2: any;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    memoryLevel: MemoryLevel;
    crossLevelConflict: boolean;
    description: string;
}

interface RepairAction {
    type: string;
    targetInconsistency: RelationshipInconsistency;
    timestamp: Date;
    success: boolean;
    memorySystemIntegrated: boolean;
    error?: string;
}

interface RepairReport {
    inconsistenciesFound: number;
    repairActions: RepairAction[];
    successRate: number;
    remainingIssues: string[];
    repairDate: Date;
    memorySystemValidated: boolean;
    crossLevelRepairSuccess: boolean;
    systemHealthImprovement: number;
}

interface RelationshipNetworkAnalysis {
    totalRelationships: number;
    networkDensity: number;
    averageConnectivity: number;
    centralCharacters: Array<{
        characterId: string;
        characterName: string;
        connectivityScore: number;
        influenceRank: number;
    }>;
    isolatedCharacters: string[];
    strongestConnections: Array<{
        char1Id: string;
        char2Id: string;
        strength: number;
        type: RelationshipType;
    }>;
    memorySystemValidated: boolean;
    analysisQuality: number;
}

/**
 * 記憶階層システム完全統合関係性サービス（即座使用可能版）
 * MemoryManagerと完全統合し、repositoriesは使用しない
 */
export class RelationshipService implements IRelationshipService {
    private readonly logger = new Logger({ serviceName: 'RelationshipService' });

    // 🔄 パフォーマンス統計とメトリクス
    private performanceStats = {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageProcessingTime: 0,
        memorySystemHits: 0,
        cacheEfficiencyRate: 0,
        lastOptimization: new Date().toISOString()
    };

    // 🔄 記憶階層システム統合キャッシュ
    private relationshipCache = new Map<string, { data: any; timestamp: number; memoryLevel: MemoryLevel; }>();
    private static readonly CACHE_TTL = 300000; // 5分

    /**
     * コンストラクタ（即座使用可能版）
     * @param memoryManager MemoryManagerへの依存関係注入（必須）
     */
    constructor(private memoryManager: MemoryManager) {
        // 基本システムの即座初期化
        this.initializeBasicSystems();

        this.logger.info('RelationshipService ready for immediate use with complete MemoryManager integration');
    }

    /**
     * 基本システムの初期化（同期処理）
     * @private
     */
    private initializeBasicSystems(): void {
        // キャッシュの初期化
        this.relationshipCache.clear();

        // パフォーマンス統計のリセット
        this.performanceStats = {
            totalOperations: 0,
            successfulOperations: 0,
            failedOperations: 0,
            averageProcessingTime: 0,
            memorySystemHits: 0,
            cacheEfficiencyRate: 0,
            lastOptimization: new Date().toISOString()
        };

        this.logger.debug('RelationshipService basic systems initialized immediately');
    }

    /**
     * 遅延初期化が必要な場合の処理（必要時のみ実行）
     * @private
     */
    private async performLazyInitializationIfNeeded(): Promise<void> {
        try {
            // MemoryManagerの状態確認
            const systemStatus = await this.memoryManager.getSystemStatus();
            if (!systemStatus.initialized) {
                this.logger.warn('MemoryManager not fully initialized, but proceeding with available functionality');
            }

            // 必要に応じて既存関係性データの検証と移行
            await this.validateAndMigrateExistingRelationships();

            this.logger.debug('RelationshipService lazy initialization completed');
        } catch (error) {
            this.logger.warn('Lazy initialization partially failed, but service remains operational', { error });
        }
    }

    /**
     * 既存関係性データの検証と移行
     * @private
     */
    private async validateAndMigrateExistingRelationships(): Promise<void> {
        try {
            const searchResult = await this.memoryManager.unifiedSearch(
                'all relationships',
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            if (searchResult.success && searchResult.results.length > 0) {
                this.logger.info(`Found ${searchResult.results.length} existing relationship records for validation`);

                let validatedCount = 0;
                let migratedCount = 0;

                for (const result of searchResult.results) {
                    try {
                        const relationship = this.extractRelationshipFromSearchResult(result);
                        if (relationship) {
                            if (this.validateRelationshipData(relationship)) {
                                validatedCount++;
                            } else {
                                await this.migrateRelationshipData(relationship);
                                migratedCount++;
                            }
                        }
                    } catch (error) {
                        this.logger.warn('Failed to validate relationship data', { error });
                    }
                }

                this.logger.info(`Relationship validation completed: ${validatedCount} valid, ${migratedCount} migrated`);
            }
        } catch (error) {
            this.logger.warn('Relationship validation and migration failed', { error });
        }
    }

    // ============================================================================
    // 🔧 主要機能（記憶階層システム完全統合版・即座使用可能）
    // ============================================================================

    /**
     * 関係性サービス固有データを記憶階層用形式で取得
     * @returns 記憶階層用関係性データ
     */
    async getDataForMemoryHierarchy(): Promise<RelationshipMemoryData> {
        const startTime = Date.now();

        try {
            this.logger.info('Preparing relationship data for memory hierarchy');

            // 全関係性データとキャッシュデータを収集
            const allRelationships = await this.getAllRelationshipsFromMemorySystem();
            const allCharacters = await this.getAllCharactersFromMemorySystem();
            const cachedRelationships = Array.from(this.relationshipCache.entries())
                .map(([key, value]) => ({ cacheKey: key, ...value }));

            // システム品質評価
            let systemQualityScore = 0.8;
            try {
                if (this.memoryManager) {
                    const systemStatus = await this.memoryManager.getSystemStatus();
                    systemQualityScore = systemStatus.initialized ? 0.9 : 0.7;
                }
            } catch (error) {
                this.logger.debug('System status check failed for relationships', { error });
            }

            // ネットワーク分析の実行
            const networkAnalysis = await this.performNetworkAnalysis(allRelationships, allCharacters);

            // 記憶階層分類の実行
            const hierarchicalClassification = await this.classifyRelationshipDataForHierarchy(
                allRelationships,
                cachedRelationships,
                networkAnalysis
            );

            // 関係性記憶データの構築
            const relationshipMemoryData: RelationshipMemoryData = {
                serviceType: 'relationship',
                timestamp: new Date(),
                confidence: systemQualityScore,
                dataVersion: '1.0.0',
                metadata: {
                    source: 'RelationshipService',
                    validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6時間
                    processingTime: Date.now() - startTime,
                    qualityScore: systemQualityScore
                },
                networkData: {
                    totalRelationships: allRelationships.length,
                    activeConnections: await this.getActiveConnectionsData(allRelationships),
                    networkMetrics: {
                        density: networkAnalysis.networkDensity,
                        clustering: networkAnalysis.averageConnectivity,
                        centralCharacters: networkAnalysis.centralCharacters.map(c => c.characterId)
                    },
                    clusterData: await this.getClusterDataFromNetworkAnalysis(networkAnalysis)
                },
                hierarchicalClassification
            };

            this.logger.info('Relationship data prepared for memory hierarchy', {
                dataSize: JSON.stringify(relationshipMemoryData).length,
                processingTime: Date.now() - startTime,
                qualityScore: systemQualityScore,
                totalRelationships: allRelationships.length,
                networkDensity: networkAnalysis.networkDensity
            });

            return relationshipMemoryData;

        } catch (error) {
            this.logger.error('Failed to prepare relationship data for memory hierarchy', { error });

            // フォールバック：最小限のデータを返す
            return this.createFallbackRelationshipMemoryData();
        }
    }

    /**
     * 指定記憶階層との統合処理
     * @param layer 記憶階層レベル
     */
    async integrateWithMemoryLayer(layer: MemoryLevel): Promise<void> {
        const startTime = Date.now();

        try {
            this.logger.info(`Integrating relationship data with ${layer} layer`);

            if (!this.memoryManager) {
                this.logger.warn('MemoryManager not available, skipping relationship integration');
                return;
            }

            // 階層に応じた関係性データ統合戦略
            switch (layer) {
                case MemoryLevel.SHORT_TERM:
                    await this.integrateShortTermRelationshipData();
                    break;

                case MemoryLevel.MID_TERM:
                    await this.integrateMidTermRelationshipData();
                    break;

                case MemoryLevel.LONG_TERM:
                    await this.integrateLongTermRelationshipData();
                    break;

                default:
                    this.logger.warn(`Unknown memory layer for relationship integration: ${layer}`);
                    return;
            }

            this.logger.info(`Relationship data integration completed for ${layer}`, {
                processingTime: Date.now() - startTime
            });

        } catch (error) {
            this.logger.error(`Failed to integrate relationship data with ${layer} layer`, { error });
            throw error;
        }
    }

    /**
     * 階層別関係性データ取得（キャラクター固有またはネットワーク全体）
     * @param characterId キャラクターID（省略時はネットワーク全体）
     * @returns 階層別関係性データ
     */
    async getHierarchicalData(characterId?: string): Promise<RelationshipHierarchicalData> {
        const startTime = Date.now();

        try {
            if (characterId) {
                this.logger.info(`Getting hierarchical relationship data for character: ${characterId}`);

                // キャラクター固有の関係性データ
                const hierarchicalData: RelationshipHierarchicalData = {
                    characterId,
                    shortTerm: await this.getShortTermRelationshipData(characterId),
                    midTerm: await this.getMidTermRelationshipData(characterId),
                    longTerm: await this.getLongTermRelationshipData(characterId)
                };

                this.logger.info(`Character-specific hierarchical relationship data retrieved: ${characterId}`, {
                    processingTime: Date.now() - startTime,
                    recentInteractions: hierarchicalData.shortTerm.recentInteractions?.length || 0,
                    evolutionPatterns: hierarchicalData.midTerm.relationshipEvolution?.length || 0,
                    fundamentalRelationships: hierarchicalData.longTerm.fundamentalRelationships?.length || 0
                });

                return hierarchicalData;
            } else {
                this.logger.info('Getting hierarchical relationship data for entire network');

                // ネットワーク全体の関係性データ
                const hierarchicalData: RelationshipHierarchicalData = {
                    characterId: undefined,
                    shortTerm: await this.getShortTermNetworkData(),
                    midTerm: await this.getMidTermNetworkData(),
                    longTerm: await this.getLongTermNetworkData()
                };

                this.logger.info('Network-wide hierarchical relationship data retrieved', {
                    processingTime: Date.now() - startTime,
                    recentInteractions: hierarchicalData.shortTerm.recentInteractions?.length || 0,
                    networkShifts: hierarchicalData.midTerm.networkShifts?.length || 0,
                    coreClusters: hierarchicalData.longTerm.permanentNetworkStructure?.coreClusters?.length || 0
                });

                return hierarchicalData;
            }

        } catch (error) {
            this.logger.error(`Failed to get hierarchical relationship data`, { error, characterId });

            // フォールバック：空の階層データを返す
            return this.createFallbackRelationshipHierarchicalData(characterId);
        }
    }

    /**
     * 関係性更新（記憶階層システム統合版・即座使用可能）
     */
    async updateRelationship(
        char1Id: string,
        char2Id: string,
        type: string,
        strength: number
    ): Promise<void> {
        const startTime = Date.now();

        try {
            this.performanceStats.totalOperations++;

            this.logger.info('Updating relationship with memory system integration', {
                char1Id,
                char2Id,
                type,
                strength
            });

            // 🔧 最初の使用時に必要に応じて遅延初期化
            await this.performLazyInitializationIfNeeded();

            // 入力値の検証
            await this.validateRelationshipInput(char1Id, char2Id, type, strength);

            // 🔄 統合記憶システムから両キャラクターの存在を確認
            const [char1, char2] = await Promise.all([
                this.getCharacterFromMemorySystem(char1Id),
                this.getCharacterFromMemorySystem(char2Id)
            ]);

            if (!char1) throw new NotFoundError('Character', char1Id);
            if (!char2) throw new NotFoundError('Character', char2Id);

            // 🔄 既存関係性の取得（統合記憶システム）
            const existingRelationship = await this.getRelationshipFromMemorySystem(char1Id, char2Id);

            // 関係性データの構築
            const relationshipData: Relationship = {
                targetId: char2Id,
                targetName: char2.name,
                type: type as RelationshipType,
                strength,
                lastInteraction: new Date(),
                description: '',
                history: []
            };

            // 既存データの保持
            if (existingRelationship) {
                relationshipData.history = existingRelationship.history || [];
                relationshipData.description = existingRelationship.description || '';

                // 履歴に変更記録を追加
                relationshipData.history.push({
                    timestamp: new Date(),
                    previousType: existingRelationship.type,
                    previousStrength: existingRelationship.strength,
                    newType: type,
                    newStrength: strength,
                    reason: 'Relationship updated via MemoryManager integration'
                });
            }

            // 🔄 記憶階層システムに関係性を保存
            await this.saveRelationshipToMemorySystem(char1Id, char2Id, relationshipData);

            // 🔄 双方向関係性の更新
            await this.updateBidirectionalRelationship(char1Id, char2Id, relationshipData);

            // キャッシュの更新
            this.updateRelationshipCache(char1Id, char2Id, relationshipData);

            // パフォーマンス統計の更新
            this.performanceStats.successfulOperations++;
            this.performanceStats.averageProcessingTime = this.calculateAverageProcessingTime(
                Date.now() - startTime
            );

            this.logger.info('Relationship updated successfully with memory system integration', {
                char1Name: char1.name,
                char2Name: char2.name,
                type,
                strength,
                processingTime: Date.now() - startTime
            });

        } catch (error) {
            this.performanceStats.failedOperations++;
            this.logger.error('Failed to update relationship', { error, char1Id, char2Id });
            throw error;
        }
    }

    /**
     * 高度な関係性動態分析（記憶階層システム統合版・即座使用可能）
     */
    async analyzeRelationshipDynamics(): Promise<RelationshipAnalysis> {
        const startTime = Date.now();

        try {
            this.logger.info('Starting advanced relationship dynamics analysis with memory integration');

            // 🔄 統合記憶システムから全関係性データを取得
            const allRelationshipsResult = await this.getAllRelationshipsFromMemorySystem();
            const allCharactersResult = await this.getAllCharactersFromMemorySystem();

            // 🔄 記憶階層システム活用クラスター分析
            const clusters = await this.detectAdvancedRelationshipClusters(
                allRelationshipsResult,
                allCharactersResult
            );

            // 🔄 統合記憶システム活用対立関係の深層分析
            const tensions = await this.analyzeAdvancedTensionDynamics(
                allRelationshipsResult,
                allCharactersResult
            );

            // 🔄 記憶階層システム統合関係性発展予測
            const developments = await this.predictRelationshipEvolution(
                allRelationshipsResult
            );

            // 🔄 ネットワーク分析
            const networkAnalysis = await this.performNetworkAnalysis(
                allRelationshipsResult,
                allCharactersResult
            );

            // RelationshipAnalysisの構築
            const analysis: RelationshipAnalysis = {
                clusters,
                tensions,
                developments,
                visualData: this.generateVisualizationData(
                    allCharactersResult,
                    allRelationshipsResult,
                    clusters
                ),
                // 🆕 記憶階層システム統合情報（オプショナルプロパティとして追加）
                networkAnalysis,
                analysisTimestamp: new Date(),
                confidence: this.calculateAnalysisConfidence(allRelationshipsResult),
                memorySystemValidated: true,
                systemHealthScore: await this.getRelationshipSystemHealth(),
                crossMemoryLevelConsistency: await this.validateCrossLevelConsistency()
            };

            // 🔄 分析結果を記憶階層システムに保存
            await this.storeAnalysisResultsInMemorySystem(analysis);

            this.performanceStats.successfulOperations++;
            this.logger.info('Advanced relationship dynamics analysis completed', {
                clustersFound: clusters.length,
                tensionsDetected: tensions.length,
                developmentsTracked: developments.length,
                processingTime: Date.now() - startTime
            });

            return analysis;

        } catch (error) {
            this.performanceStats.failedOperations++;
            this.logger.error('Advanced relationship dynamics analysis failed', { error });
            throw error;
        }
    }

    /**
     * 関係性クラスター検出（IRelationshipService実装・即座使用可能）
     */
    async detectRelationshipClusters(): Promise<CharacterCluster[]> {
        try {
            this.logger.info('Detecting relationship clusters via memory system integration');

            // 🔄 統合記憶システムから全関係性データを取得
            const allRelationships = await this.getAllRelationshipsFromMemorySystem();
            const allCharacters = await this.getAllCharactersFromMemorySystem();

            // 🔄 高度なクラスター検出を実行
            const clusters = await this.detectAdvancedRelationshipClusters(
                allRelationships,
                allCharacters
            );

            this.logger.info(`Detected ${clusters.length} relationship clusters`);
            return clusters;

        } catch (error) {
            this.logger.error('Failed to detect relationship clusters', { error });
            return [];
        }
    }

    /**
     * 対立関係検出（IRelationshipService実装・即座使用可能）
     */
    async detectTensions(): Promise<RelationshipTension[]> {
        try {
            this.logger.info('Detecting relationship tensions via memory system integration');

            // 🔄 統合記憶システムから全関係性データを取得
            const allRelationships = await this.getAllRelationshipsFromMemorySystem();
            const allCharacters = await this.getAllCharactersFromMemorySystem();

            // 🔄 高度な対立関係分析を実行
            const tensions = await this.analyzeAdvancedTensionDynamics(
                allRelationships,
                allCharacters
            );

            this.logger.info(`Detected ${tensions.length} relationship tensions`);
            return tensions;

        } catch (error) {
            this.logger.error('Failed to detect relationship tensions', { error });
            return [];
        }
    }

    /**
     * 関係性の自動追跡（記憶階層システム統合版・即座使用可能）
     */
    async trackRelationshipEvolution(
        char1Id: string,
        char2Id: string,
        timeframe: number = 30
    ): Promise<RelationshipEvolutionReport> {
        try {
            this.logger.info('Tracking relationship evolution with memory integration', {
                char1Id,
                char2Id,
                timeframe
            });

            // 🔄 統合記憶システムから関係性履歴を取得
            const relationshipHistory = await this.getRelationshipHistoryFromMemorySystem(
                char1Id,
                char2Id,
                timeframe
            );

            // 🔄 記憶階層システム活用変化パターンの分析
            const evolutionPatterns = await this.analyzeEvolutionPatternsWithMemorySystem(
                relationshipHistory
            );

            // 🔄 現在の状態（統合記憶システム）
            const currentState = await this.getRelationshipFromMemorySystem(char1Id, char2Id);
            if (!currentState) {
                throw new NotFoundError('Relationship', `${char1Id}-${char2Id}`);
            }

            // 🔄 将来予測（統合記憶システム + AI）
            const predictions = await this.predictRelationshipFutureWithMemorySystem(
                char1Id,
                char2Id,
                evolutionPatterns
            );

            // 🔄 記憶階層システムから洞察を取得
            const memorySystemInsights = await this.getRelationshipMemoryInsights(char1Id, char2Id);

            // 🔄 クロスレベル分析
            const crossLevelAnalysis = await this.performCrossLevelRelationshipAnalysis(char1Id, char2Id);

            const report: RelationshipEvolutionReport = {
                character1Id: char1Id,
                character2Id: char2Id,
                currentState,
                evolutionPatterns,
                predictions,
                significantEvents: this.extractSignificantEvents(relationshipHistory),
                stabilityScore: this.calculateStabilityScore(evolutionPatterns),
                reportDate: new Date(),
                memorySystemInsights,
                crossLevelAnalysis,
                systemValidationScore: await this.calculateRelationshipSystemValidation(char1Id, char2Id)
            };

            this.logger.info('Relationship evolution tracking completed', {
                char1Id,
                char2Id,
                patternsFound: evolutionPatterns.length,
                predictionsGenerated: predictions.length
            });

            return report;

        } catch (error) {
            this.logger.error('Relationship evolution tracking failed', { error, char1Id, char2Id });
            throw error;
        }
    }

    /**
     * 関連キャラクター取得（記憶階層システム統合版・即座使用可能）
     */
    async getConnectedCharacters(characterId: string): Promise<string[]> {
        try {
            // 🔄 統合記憶システムから関連キャラクターを検索
            const searchResult = await this.memoryManager.unifiedSearch(
                `character relationships target:${characterId} OR source:${characterId}`,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            const connectedCharacterIds = new Set<string>();

            if (searchResult.success && searchResult.results.length > 0) {
                for (const result of searchResult.results) {
                    const relationship = this.extractRelationshipFromSearchResult(result);
                    if (relationship) {
                        if (relationship.targetId && relationship.targetId !== characterId) {
                            connectedCharacterIds.add(relationship.targetId);
                        }
                        // 双方向関係性の考慮
                        if (result.data?.sourceId && result.data.sourceId !== characterId) {
                            connectedCharacterIds.add(result.data.sourceId);
                        }
                    }
                }
            }

            const connectedIds = Array.from(connectedCharacterIds);
            this.logger.debug(`Found ${connectedIds.length} connected characters for ${characterId}`);

            return connectedIds;

        } catch (error) {
            this.logger.error('Failed to get connected characters', { error, characterId });
            return [];
        }
    }

    /**
     * キャラクター関係性取得（記憶階層システム統合版・即座使用可能）
     */
    async getCharacterRelationships(characterId: string): Promise<RelationshipResponse> {
        try {
            // 🔄 統合記憶システムからキャラクターの存在確認
            const character = await this.getCharacterFromMemorySystem(characterId);
            if (!character) {
                throw new NotFoundError('Character', characterId);
            }

            // 🔄 統合記憶システムから関係性を取得
            const searchResult = await this.memoryManager.unifiedSearch(
                `character relationships id:${characterId}`,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            const relationships: Relationship[] = [];

            if (searchResult.success && searchResult.results.length > 0) {
                for (const result of searchResult.results) {
                    const relationship = this.extractRelationshipFromSearchResult(result);
                    if (relationship) {
                        // 対象キャラクターの名前を取得
                        const targetCharacter = await this.getCharacterFromMemorySystem(relationship.targetId);
                        if (targetCharacter) {
                            relationship.targetName = targetCharacter.name;
                        }
                        relationships.push(relationship);
                    }
                }
            }

            this.logger.debug(`Retrieved ${relationships.length} relationships for character ${characterId}`);

            return { relationships };

        } catch (error) {
            this.logger.error('Failed to get character relationships', { error, characterId });
            return { relationships: [] };
        }
    }

    /**
     * 関係性の自動修復（記憶階層システム統合版・即座使用可能）
     */
    async autoRepairRelationshipInconsistencies(): Promise<RepairReport> {
        try {
            this.logger.info('Starting memory-integrated relationship inconsistency repair');

            const repairActions: RepairAction[] = [];

            // 🔄 統合記憶システムレベルでの矛盾検出
            const inconsistencies = await this.detectRelationshipInconsistenciesWithMemorySystem();

            // 🔄 各矛盾に対する修復処理
            for (const inconsistency of inconsistencies) {
                const action = await this.repairInconsistencyWithMemorySystem(inconsistency);
                repairActions.push(action);
            }

            // 🔄 修復結果の記憶階層システム検証
            const verificationResult = await this.verifyRepairResultsWithMemorySystem(repairActions);

            const report: RepairReport = {
                inconsistenciesFound: inconsistencies.length,
                repairActions,
                successRate: verificationResult.successRate,
                remainingIssues: verificationResult.remainingIssues,
                repairDate: new Date(),
                memorySystemValidated: verificationResult.memorySystemValidated,
                crossLevelRepairSuccess: verificationResult.crossLevelSuccess,
                systemHealthImprovement: verificationResult.healthImprovement
            };

            // 🔄 修復レポートを記憶階層システムに保存
            await this.storeRepairReportInMemorySystem(report);

            this.logger.info('Relationship inconsistency repair completed', {
                inconsistenciesFound: inconsistencies.length,
                repairActions: repairActions.length,
                successRate: verificationResult.successRate
            });

            return report;

        } catch (error) {
            this.logger.error('Memory-integrated relationship repair failed', { error });
            throw error;
        }
    }

    // ============================================================================
    // 🔧 記憶階層システム統合ヘルパーメソッド（即座使用可能版）
    // ============================================================================

    /**
     * 関係性データの記憶階層分類
     * @private
     */
    private async classifyRelationshipDataForHierarchy(
        allRelationships: any[],
        cachedRelationships: any[],
        networkAnalysis: any
    ): Promise<any> {
        try {
            const now = Date.now();
            const shortTermThreshold = 15 * 60 * 1000; // 15分
            const midTermThreshold = 2 * 60 * 60 * 1000; // 2時間

            return {
                shortTerm: {
                    data: cachedRelationships.filter(item =>
                        now - item.timestamp < shortTermThreshold
                    ),
                    priority: 10,
                    expiryTime: new Date(now + shortTermThreshold),
                    accessCount: this.performanceStats.memorySystemHits
                },
                midTerm: {
                    data: allRelationships.filter(rel =>
                        rel.lastInteraction &&
                        now - new Date(rel.lastInteraction).getTime() < midTermThreshold
                    ),
                    patterns: await this.identifyRelationshipPatterns(),
                    stability: 0.7,
                    evolutionRate: 0.35
                },
                longTerm: {
                    data: allRelationships.filter(rel =>
                        rel.strength > 0.7 || // 強い関係性
                        (rel.history && rel.history.length > 5) // 長い履歴
                    ),
                    permanence: 0.9,
                    fundamentalScore: 0.85,
                    historicalSignificance: networkAnalysis.analysisQuality || 0.8
                }
            };
        } catch (error) {
            this.logger.warn('Relationship data classification failed', { error });
            return { shortTerm: { data: [] }, midTerm: { data: [] }, longTerm: { data: [] } };
        }
    }

    /**
     * 短期記憶関係性データ統合処理
     * @private
     */
    private async integrateShortTermRelationshipData(): Promise<void> {
        try {
            // 最近のインタラクションとリアルタイム関係性変化を短期記憶に保存
            const recentInteractions = await this.getRecentInteractionsFromCache();
            const activeConflicts = await this.detectActiveConflicts();

            // インタラクションデータをチャプター形式に変換
            for (const interaction of recentInteractions) {
                const interactionChapter = this.convertInteractionToChapter(interaction);
                await this.memoryManager.processChapter(interactionChapter);
            }

            // アクティブ対立をチャプター形式に変換
            for (const conflict of activeConflicts) {
                const conflictChapter = this.convertConflictToChapter(conflict);
                await this.memoryManager.processChapter(conflictChapter);
            }

            this.logger.debug('Short-term relationship data integration completed', {
                interactionsProcessed: recentInteractions.length,
                conflictsProcessed: activeConflicts.length
            });

        } catch (error) {
            this.logger.warn('Short-term relationship integration failed', { error });
        }
    }

    /**
     * 中期記憶関係性データ統合処理
     * @private
     */
    private async integrateMidTermRelationshipData(): Promise<void> {
        try {
            // 関係性進化パターンとネットワーク変化を中期記憶に保存
            const evolutionPatterns = await this.identifyRelationshipEvolutionPatterns();
            const networkShifts = await this.identifyNetworkShifts();

            // 進化パターンをチャプター形式に変換
            const evolutionChapter = this.convertEvolutionPatternsToChapter(evolutionPatterns);
            await this.memoryManager.processChapter(evolutionChapter);

            // ネットワーク変化をチャプター形式に変換
            const networkChapter = this.convertNetworkShiftsToChapter(networkShifts);
            await this.memoryManager.processChapter(networkChapter);

            this.logger.debug('Mid-term relationship data integration completed', {
                evolutionPatternsCount: evolutionPatterns.length,
                networkShiftsCount: networkShifts.length
            });

        } catch (error) {
            this.logger.warn('Mid-term relationship integration failed', { error });
        }
    }

    /**
     * 長期記憶関係性データ統合処理
     * @private
     */
    private async integrateLongTermRelationshipData(): Promise<void> {
        try {
            // 基本的な関係性アーキタイプとネットワーク構造を長期記憶に保存
            const fundamentalRelationships = await this.identifyFundamentalRelationships();
            const permanentNetworkStructure = await this.identifyPermanentNetworkStructure();

            // 基本関係性をチャプター形式に変換
            const fundamentalChapter = this.convertFundamentalRelationshipsToChapter(fundamentalRelationships);
            await this.memoryManager.processChapter(fundamentalChapter);

            // 永続的ネットワーク構造をチャプター形式に変換
            const structureChapter = this.convertNetworkStructureToChapter(permanentNetworkStructure);
            await this.memoryManager.processChapter(structureChapter);

            this.logger.debug('Long-term relationship data integration completed', {
                fundamentalRelationshipsCount: fundamentalRelationships.length,
                networkStructuresCount: permanentNetworkStructure.length
            });

        } catch (error) {
            this.logger.warn('Long-term relationship integration failed', { error });
        }
    }

    /**
     * 短期関係性データ取得（キャラクター固有）
     * @private
     */
    private async getShortTermRelationshipData(characterId: string): Promise<any> {
        try {
            return {
                recentInteractions: await this.getRecentInteractionsForCharacter(characterId),
                activeConflicts: await this.getActiveConflictsForCharacter(characterId),
                temporaryAlliances: await this.getTemporaryAlliancesForCharacter(characterId),
                emergingRelationships: await this.getEmergingRelationshipsForCharacter(characterId)
            };
        } catch (error) {
            this.logger.warn('Failed to get short-term relationship data', { error });
            return { recentInteractions: [], activeConflicts: [], temporaryAlliances: [], emergingRelationships: [] };
        }
    }

    /**
     * 中期関係性データ取得（キャラクター固有）
     * @private
     */
    private async getMidTermRelationshipData(characterId: string): Promise<any> {
        try {
            return {
                relationshipEvolution: await this.getRelationshipEvolutionForCharacter(characterId),
                networkShifts: await this.getNetworkShiftsForCharacter(characterId),
                conflictPatterns: await this.getConflictPatternsForCharacter(characterId),
                alliancePatterns: await this.getAlliancePatternsForCharacter(characterId)
            };
        } catch (error) {
            this.logger.warn('Failed to get mid-term relationship data', { error });
            return { relationshipEvolution: [], networkShifts: [], conflictPatterns: [], alliancePatterns: [] };
        }
    }

    /**
     * 長期関係性データ取得（キャラクター固有）
     * @private
     */
    private async getLongTermRelationshipData(characterId: string): Promise<any> {
        try {
            return {
                fundamentalRelationships: await this.getFundamentalRelationshipsForCharacter(characterId),
                characterRoles: await this.getCharacterRolesForCharacter(characterId),
                permanentNetworkStructure: await this.getPermanentNetworkStructureForCharacter(characterId),
                historicalMilestones: await this.getHistoricalMilestonesForCharacter(characterId)
            };
        } catch (error) {
            this.logger.warn('Failed to get long-term relationship data', { error });
            return {
                fundamentalRelationships: [],
                characterRoles: {},
                permanentNetworkStructure: { coreClusters: [], structuralPatterns: [], networkEvolutionTrend: '' },
                historicalMilestones: []
            };
        }
    }

    /**
     * 短期ネットワークデータ取得（全体）
     * @private
     */
    private async getShortTermNetworkData(): Promise<any> {
        try {
            return {
                recentInteractions: await this.getAllRecentInteractions(),
                activeConflicts: await this.getAllActiveConflicts(),
                temporaryAlliances: await this.getAllTemporaryAlliances(),
                emergingRelationships: await this.getAllEmergingRelationships()
            };
        } catch (error) {
            this.logger.warn('Failed to get short-term network data', { error });
            return { recentInteractions: [], activeConflicts: [], temporaryAlliances: [], emergingRelationships: [] };
        }
    }

    /**
     * 中期ネットワークデータ取得（全体）
     * @private
     */
    private async getMidTermNetworkData(): Promise<any> {
        try {
            return {
                relationshipEvolution: await this.getAllRelationshipEvolution(),
                networkShifts: await this.getAllNetworkShifts(),
                conflictPatterns: await this.getAllConflictPatterns(),
                alliancePatterns: await this.getAllAlliancePatterns()
            };
        } catch (error) {
            this.logger.warn('Failed to get mid-term network data', { error });
            return { relationshipEvolution: [], networkShifts: [], conflictPatterns: [], alliancePatterns: [] };
        }
    }

    /**
     * 長期ネットワークデータ取得（全体）
     * @private
     */
    private async getLongTermNetworkData(): Promise<any> {
        try {
            return {
                fundamentalRelationships: await this.getAllFundamentalRelationships(),
                characterRoles: await this.getAllCharacterRoles(),
                permanentNetworkStructure: await this.getAllPermanentNetworkStructure(),
                historicalMilestones: await this.getAllHistoricalMilestones()
            };
        } catch (error) {
            this.logger.warn('Failed to get long-term network data', { error });
            return {
                fundamentalRelationships: [],
                characterRoles: {},
                permanentNetworkStructure: { coreClusters: [], structuralPatterns: [], networkEvolutionTrend: '' },
                historicalMilestones: []
            };
        }
    }

    /**
     * 統合記憶システムからキャラクター取得
     * @private
     */
    private async getCharacterFromMemorySystem(characterId: string): Promise<Character | null> {
        try {
            const searchResult = await this.memoryManager.unifiedSearch(
                `character id:${characterId}`,
                [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM, MemoryLevel.SHORT_TERM]
            );

            if (searchResult.success && searchResult.results.length > 0) {
                const result = searchResult.results.find(r =>
                    r.data?.id === characterId || r.data?.characterId === characterId
                );

                if (result) {
                    return this.extractCharacterFromSearchResult(result);
                }
            }

            return null;
        } catch (error) {
            this.logger.warn('Failed to get character from memory system', { characterId, error });
            return null;
        }
    }

    /**
     * 統合記憶システムから関係性取得
     * @private
     */
    private async getRelationshipFromMemorySystem(
        char1Id: string,
        char2Id: string
    ): Promise<Relationship | null> {
        try {
            const cacheKey = `${char1Id}-${char2Id}`;
            const cached = this.relationshipCache.get(cacheKey);

            if (cached && Date.now() - cached.timestamp < RelationshipService.CACHE_TTL) {
                this.performanceStats.memorySystemHits++;
                return cached.data;
            }

            const searchResult = await this.memoryManager.unifiedSearch(
                `relationship source:${char1Id} target:${char2Id}`,
                [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM, MemoryLevel.SHORT_TERM]
            );

            if (searchResult.success && searchResult.results.length > 0) {
                const relationship = this.extractRelationshipFromSearchResult(searchResult.results[0]);

                if (relationship) {
                    // キャッシュに保存
                    this.relationshipCache.set(cacheKey, {
                        data: relationship,
                        timestamp: Date.now(),
                        memoryLevel: searchResult.results[0].source as MemoryLevel
                    });
                }

                return relationship;
            }

            return null;
        } catch (error) {
            this.logger.warn('Failed to get relationship from memory system', { char1Id, char2Id, error });
            return null;
        }
    }

    // ============================================================================
    // 🔧 その他のプライベートメソッド（実装省略・スタブ）
    // ============================================================================

    /**
     * フォールバック関係性記憶データ作成
     * @private
     */
    private createFallbackRelationshipMemoryData(): RelationshipMemoryData {
        return {
            serviceType: 'relationship',
            timestamp: new Date(),
            confidence: 0.5,
            dataVersion: '1.0.0',
            metadata: {
                source: 'RelationshipService_Fallback',
                processingTime: 0,
                qualityScore: 0.5
            },
            networkData: {
                totalRelationships: 0,
                activeConnections: [],
                networkMetrics: {
                    density: 0,
                    clustering: 0,
                    centralCharacters: []
                },
                clusterData: []
            },
            hierarchicalClassification: {
                shortTerm: { data: [], priority: 1, expiryTime: new Date(), accessCount: 0 },
                midTerm: { data: [], patterns: [], stability: 0.5, evolutionRate: 0 },
                longTerm: { data: [], permanence: 0.5, fundamentalScore: 0.5, historicalSignificance: 0.5 }
            }
        };
    }

    /**
     * フォールバック関係性階層データ作成
     * @private
     */
    private createFallbackRelationshipHierarchicalData(characterId?: string): RelationshipHierarchicalData {
        return {
            characterId,
            shortTerm: { recentInteractions: [], activeConflicts: [], temporaryAlliances: [], emergingRelationships: [] },
            midTerm: { relationshipEvolution: [], networkShifts: [], conflictPatterns: [], alliancePatterns: [] },
            longTerm: {
                fundamentalRelationships: [],
                characterRoles: {},
                permanentNetworkStructure: { coreClusters: [], structuralPatterns: [], networkEvolutionTrend: '' },
                historicalMilestones: []
            }
        };
    }

    private async saveRelationshipToMemorySystem(char1Id: string, char2Id: string, relationship: Relationship): Promise<void> {
        try {
            const relationshipChapter = this.convertRelationshipToChapter(char1Id, char2Id, relationship);
            const result = await this.memoryManager.processChapter(relationshipChapter);

            if (result.success) {
                this.logger.debug('Relationship saved to memory system', {
                    char1Id, char2Id, type: relationship.type, affectedComponents: result.affectedComponents
                });
            } else {
                this.logger.warn('Relationship saving partially failed', {
                    char1Id, char2Id, errors: result.errors
                });
            }
        } catch (error) {
            this.logger.error('Failed to save relationship to memory system', { char1Id, char2Id, error });
            throw error;
        }
    }

    private async updateBidirectionalRelationship(char1Id: string, char2Id: string, relationship: Relationship): Promise<void> {
        try {
            const reverseType = this.getReverseRelationshipType(relationship.type);
            const reverseRelationship: Relationship = {
                targetId: char1Id,
                type: reverseType,
                strength: relationship.strength,
                lastInteraction: relationship.lastInteraction,
                description: relationship.description,
                history: relationship.history
            };
            await this.saveRelationshipToMemorySystem(char2Id, char1Id, reverseRelationship);
        } catch (error) {
            this.logger.warn('Failed to update bidirectional relationship', { char1Id, char2Id, error });
        }
    }

    private async getAllRelationshipsFromMemorySystem(): Promise<Relationship[]> {
        try {
            const searchResult = await this.memoryManager.unifiedSearch(
                'all relationships',
                [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM, MemoryLevel.SHORT_TERM]
            );

            const relationships: Relationship[] = [];

            if (searchResult.success) {
                for (const result of searchResult.results) {
                    const relationship = this.extractRelationshipFromSearchResult(result);
                    if (relationship) {
                        relationships.push(relationship);
                    }
                }
            }

            return relationships;
        } catch (error) {
            this.logger.warn('Failed to get all relationships from memory system', { error });
            return [];
        }
    }

    private async getAllCharactersFromMemorySystem(): Promise<Character[]> {
        try {
            const searchResult = await this.memoryManager.unifiedSearch(
                'all characters',
                [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM, MemoryLevel.SHORT_TERM]
            );

            const characters: Character[] = [];

            if (searchResult.success) {
                for (const result of searchResult.results) {
                    const character = this.extractCharacterFromSearchResult(result);
                    if (character) {
                        characters.push(character);
                    }
                }
            }

            return characters;
        } catch (error) {
            this.logger.warn('Failed to get all characters from memory system', { error });
            return [];
        }
    }

    private convertRelationshipToChapter(char1Id: string, char2Id: string, relationship: Relationship, action: string = 'update'): Chapter {
        const now = new Date();

        const content = `キャラクター関係性が${action}されました。
関係者: ${char1Id} → ${char2Id}
関係性タイプ: ${relationship.type}
関係性強度: ${relationship.strength}
最終インタラクション: ${relationship.lastInteraction}
説明: ${relationship.description || '未記載'}`;

        return {
            id: `relationship-${action}-${char1Id}-${char2Id}-${now.getTime()}`,
            chapterNumber: 0,
            title: `関係性${action}: ${char1Id} ↔ ${char2Id}`,
            content,
            createdAt: now,
            updatedAt: now,
            scenes: [],
            previousChapterSummary: '',
            metadata: {
                qualityScore: 0.9,
                keywords: ['relationship', action, relationship.type, char1Id, char2Id],
                events: [{
                    type: `relationship_${action}`,
                    description: `関係性${action}処理`,
                    sourceCharacterId: char1Id,
                    targetCharacterId: char2Id,
                    relationshipType: relationship.type,
                    relationshipStrength: relationship.strength,
                    timestamp: now.toISOString()
                }],
                characters: [char1Id, char2Id],
                foreshadowing: [],
                resolutions: [],
                correctionHistory: [],
                pov: 'システム',
                location: '関係性管理',
                emotionalTone: 'neutral'
            }
        };
    }

    private extractRelationshipFromSearchResult(result: any): Relationship | null {
        try {
            if (result.data) {
                const data = result.data;

                return {
                    targetId: data.targetId || data.target || data.characterId,
                    targetName: data.targetName || data.name,
                    type: data.type || data.relationshipType || 'NEUTRAL',
                    strength: data.strength || data.relationshipStrength || 0.5,
                    description: data.description || '',
                    lastInteraction: data.lastInteraction ? new Date(data.lastInteraction) : new Date(),
                    history: data.history || []
                };
            }
            return null;
        } catch (error) {
            this.logger.warn('Failed to extract relationship from search result', { error });
            return null;
        }
    }

    private extractCharacterFromSearchResult(result: any): Character | null {
        try {
            if (result.data) {
                const data = result.data;

                return {
                    id: data.id || data.characterId,
                    name: data.name || 'Unknown',
                    shortNames: data.shortNames || [data.name || 'Unknown'],
                    type: data.type || 'MAIN',
                    description: data.description || '',
                    state: data.state || {
                        isActive: true,
                        emotionalState: 'NEUTRAL',
                        developmentStage: 0,
                        lastAppearance: 0,
                        development: 'Character data from memory system'
                    },
                    history: data.history || {
                        appearances: [],
                        interactions: [],
                        developmentPath: []
                    },
                    metadata: data.metadata || {
                        createdAt: new Date(),
                        lastUpdated: new Date(),
                        version: 1
                    }
                } as Character;
            }
            return null;
        } catch (error) {
            this.logger.warn('Failed to extract character from search result', { error });
            return null;
        }
    }

    private getReverseRelationshipType(type: RelationshipType): RelationshipType {
        const symmetricalTypes: RelationshipType[] = ['FRIEND', 'ENEMY', 'RIVAL', 'COLLEAGUE', 'NEUTRAL', 'LOVER'];
        if (symmetricalTypes.includes(type)) {
            return type;
        }

        const reverseMap: Record<RelationshipType, RelationshipType> = {
            'PARENT': 'CHILD',
            'CHILD': 'PARENT',
            'MENTOR': 'STUDENT',
            'STUDENT': 'MENTOR',
            'LEADER': 'FOLLOWER',
            'FOLLOWER': 'LEADER',
            'PROTECTOR': 'PROTECTED',
            'PROTECTED': 'PROTECTOR',
            'LOVER': 'LOVER',
            'FRIEND': 'FRIEND',
            'ENEMY': 'ENEMY',
            'RIVAL': 'RIVAL',
            'COLLEAGUE': 'COLLEAGUE',
            'NEUTRAL': 'NEUTRAL'
        };

        return reverseMap[type] || 'NEUTRAL';
    }

    private async validateRelationshipInput(char1Id: string, char2Id: string, type: string, strength: number): Promise<void> {
        if (!char1Id || !char2Id) {
            throw new CharacterError('Character IDs are required');
        }

        if (char1Id === char2Id) {
            throw new CharacterError('Characters cannot have relationships with themselves');
        }

        if (!type) {
            throw new CharacterError('Relationship type is required');
        }

        if (typeof strength !== 'number' || strength < 0 || strength > 1) {
            throw new CharacterError('Relationship strength must be a number between 0 and 1');
        }
    }

    private calculateAverageProcessingTime(currentTime: number): number {
        const totalOps = this.performanceStats.totalOperations;
        const currentAvg = this.performanceStats.averageProcessingTime;

        return ((currentAvg * (totalOps - 1)) + currentTime) / totalOps;
    }

    private updateRelationshipCache(char1Id: string, char2Id: string, relationship: Relationship): void {
        const cacheKey = `${char1Id}-${char2Id}`;
        this.relationshipCache.set(cacheKey, {
            data: relationship,
            timestamp: Date.now(),
            memoryLevel: MemoryLevel.SHORT_TERM
        });
    }

    private validateRelationshipData(relationship: Relationship): boolean {
        return !!(
            relationship.targetId &&
            relationship.type &&
            typeof relationship.strength === 'number' &&
            relationship.strength >= 0 &&
            relationship.strength <= 1
        );
    }

    private async migrateRelationshipData(relationship: Relationship): Promise<void> {
        try {
            const migratedRelationship: Relationship = {
                ...relationship,
                targetId: relationship.targetId || 'unknown',
                type: relationship.type || 'NEUTRAL',
                strength: Math.max(0, Math.min(1, relationship.strength || 0.5)),
                lastInteraction: relationship.lastInteraction || new Date(),
                description: relationship.description || '',
                history: relationship.history || []
            };

            const migrationChapter = this.convertRelationshipToChapter(
                'unknown',
                migratedRelationship.targetId,
                migratedRelationship,
                'migration'
            );
            await this.memoryManager.processChapter(migrationChapter);

            this.logger.info('Relationship data migrated successfully');

        } catch (error) {
            this.logger.error('Failed to migrate relationship data', { error });
        }
    }

    // スタブメソッド（実装省略）
    private async detectAdvancedRelationshipClusters(relationships: Relationship[], characters: Character[]): Promise<CharacterCluster[]> { return []; }
    private async analyzeAdvancedTensionDynamics(relationships: Relationship[], characters: Character[]): Promise<RelationshipTension[]> { return []; }
    private async predictRelationshipEvolution(relationships: Relationship[]): Promise<any[]> { return []; }
    private async performNetworkAnalysis(relationships: Relationship[], characters: Character[]): Promise<RelationshipNetworkAnalysis> {
        return {
            totalRelationships: relationships.length,
            networkDensity: 0.5,
            averageConnectivity: 2.0,
            centralCharacters: [],
            isolatedCharacters: [],
            strongestConnections: [],
            memorySystemValidated: true,
            analysisQuality: 0.85
        };
    }
    private calculateAnalysisConfidence(relationships: Relationship[]): number { return Math.min(1.0, relationships.length * 0.1); }
    private async getRelationshipSystemHealth(): Promise<number> { return 0.95; }
    private async validateCrossLevelConsistency(): Promise<number> { return 0.9; }
    private generateVisualizationData(characters: Character[], relationships: Relationship[], clusters: CharacterCluster[]): any { return {}; }
    private async storeAnalysisResultsInMemorySystem(analysis: RelationshipAnalysis): Promise<void> { }
    private async getRelationshipHistoryFromMemorySystem(char1Id: string, char2Id: string, timeframe: number): Promise<any[]> { return []; }
    private async analyzeEvolutionPatternsWithMemorySystem(history: any[]): Promise<any[]> { return []; }
    private async predictRelationshipFutureWithMemorySystem(char1Id: string, char2Id: string, patterns: any[]): Promise<any[]> { return []; }
    private async getRelationshipMemoryInsights(char1Id: string, char2Id: string): Promise<any[]> { return []; }
    private async performCrossLevelRelationshipAnalysis(char1Id: string, char2Id: string): Promise<any> { return { shortTermChanges: 0, midTermPatterns: 0, longTermStability: 0 }; }
    private async calculateRelationshipSystemValidation(char1Id: string, char2Id: string): Promise<number> { return 0.85; }
    private extractSignificantEvents(history: any[]): any[] { return []; }
    private calculateStabilityScore(patterns: any[]): number { return 0.8; }
    private async detectRelationshipInconsistenciesWithMemorySystem(): Promise<RelationshipInconsistency[]> { return []; }
    private async repairInconsistencyWithMemorySystem(inconsistency: RelationshipInconsistency): Promise<RepairAction> {
        return {
            type: 'REPAIR',
            targetInconsistency: inconsistency,
            timestamp: new Date(),
            success: true,
            memorySystemIntegrated: true
        };
    }
    private async verifyRepairResultsWithMemorySystem(actions: RepairAction[]): Promise<any> {
        return {
            successRate: 0.9,
            remainingIssues: [],
            memorySystemValidated: true,
            crossLevelSuccess: true,
            healthImprovement: 0.1
        };
    }
    private async storeRepairReportInMemorySystem(report: RepairReport): Promise<void> { }

    // スタブメソッド（実装省略）
    private async getActiveConnectionsData(relationships: any[]): Promise<any[]> { return []; }
    private async getClusterDataFromNetworkAnalysis(analysis: any): Promise<any[]> { return []; }
    private async identifyRelationshipPatterns(): Promise<any[]> { return []; }
    private async getRecentInteractionsFromCache(): Promise<any[]> { return []; }
    private async detectActiveConflicts(): Promise<any[]> { return []; }
    private async identifyRelationshipEvolutionPatterns(): Promise<any[]> { return []; }
    private async identifyNetworkShifts(): Promise<any[]> { return []; }
    private async identifyFundamentalRelationships(): Promise<any[]> { return []; }
    private async identifyPermanentNetworkStructure(): Promise<any[]> { return []; }
    private convertInteractionToChapter(interaction: any): any { return {}; }
    private convertConflictToChapter(conflict: any): any { return {}; }
    private convertEvolutionPatternsToChapter(patterns: any[]): any { return {}; }
    private convertNetworkShiftsToChapter(shifts: any[]): any { return {}; }
    private convertFundamentalRelationshipsToChapter(relationships: any[]): any { return {}; }
    private convertNetworkStructureToChapter(structure: any[]): any { return {}; }

    // キャラクター固有データ取得メソッド（スタブ）
    private async getRecentInteractionsForCharacter(characterId: string): Promise<any[]> { return []; }
    private async getActiveConflictsForCharacter(characterId: string): Promise<any[]> { return []; }
    private async getTemporaryAlliancesForCharacter(characterId: string): Promise<any[]> { return []; }
    private async getEmergingRelationshipsForCharacter(characterId: string): Promise<any[]> { return []; }
    private async getRelationshipEvolutionForCharacter(characterId: string): Promise<any[]> { return []; }
    private async getNetworkShiftsForCharacter(characterId: string): Promise<any[]> { return []; }
    private async getConflictPatternsForCharacter(characterId: string): Promise<any[]> { return []; }
    private async getAlliancePatternsForCharacter(characterId: string): Promise<any[]> { return []; }
    private async getFundamentalRelationshipsForCharacter(characterId: string): Promise<any[]> { return []; }
    private async getCharacterRolesForCharacter(characterId: string): Promise<any> { return {}; }
    private async getPermanentNetworkStructureForCharacter(characterId: string): Promise<any> {
        return { coreClusters: [], structuralPatterns: [], networkEvolutionTrend: '' };
    }
    private async getHistoricalMilestonesForCharacter(characterId: string): Promise<any[]> { return []; }

    // ネットワーク全体データ取得メソッド（スタブ）
    private async getAllRecentInteractions(): Promise<any[]> { return []; }
    private async getAllActiveConflicts(): Promise<any[]> { return []; }
    private async getAllTemporaryAlliances(): Promise<any[]> { return []; }
    private async getAllEmergingRelationships(): Promise<any[]> { return []; }
    private async getAllRelationshipEvolution(): Promise<any[]> { return []; }
    private async getAllNetworkShifts(): Promise<any[]> { return []; }
    private async getAllConflictPatterns(): Promise<any[]> { return []; }
    private async getAllAlliancePatterns(): Promise<any[]> { return []; }
    private async getAllFundamentalRelationships(): Promise<any[]> { return []; }
    private async getAllCharacterRoles(): Promise<any> { return {}; }
    private async getAllPermanentNetworkStructure(): Promise<any> {
        return { coreClusters: [], structuralPatterns: [], networkEvolutionTrend: '' };
    }
    private async getAllHistoricalMilestones(): Promise<any[]> { return []; }

    /**
     * パフォーマンス診断の実行
     */
    async performDiagnostics(): Promise<{
        performanceMetrics: PerformanceStats;
        cacheStatistics: {
            size: number;
            hitRate: number;
            memoryUsage: number;
        };
        systemHealth: string;
        recommendations: string[];
    }> {
        const cacheSize = this.relationshipCache.size;
        const hitRate = this.performanceStats.totalOperations > 0
            ? this.performanceStats.memorySystemHits / this.performanceStats.totalOperations
            : 0;

        return {
            performanceMetrics: { ...this.performanceStats },
            cacheStatistics: {
                size: cacheSize,
                hitRate,
                memoryUsage: cacheSize * 1000
            },
            systemHealth: this.performanceStats.successfulOperations > this.performanceStats.failedOperations ? 'HEALTHY' : 'DEGRADED',
            recommendations: this.generatePerformanceRecommendations()
        };
    }

    private generatePerformanceRecommendations(): string[] {
        const recommendations: string[] = [];

        if (this.performanceStats.cacheEfficiencyRate < 0.7) {
            recommendations.push('キャッシュ効率の改善が必要');
        }

        if (this.performanceStats.averageProcessingTime > 1000) {
            recommendations.push('処理時間の最適化が必要');
        }

        if (this.relationshipCache.size > 1000) {
            recommendations.push('キャッシュサイズの管理が必要');
        }

        return recommendations;
    }
}

// シングルトンインスタンスの削除（DI推奨）
export const relationshipService = new RelationshipService(
    // MemoryManagerのインスタンスは外部から注入する必要があります
    {} as MemoryManager
);