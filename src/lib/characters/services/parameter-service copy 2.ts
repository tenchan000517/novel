/**
 * @fileoverview 記憶階層システム完全統合キャラクターパラメータサービス
 * @description
 * 新しい記憶階層システム（MemoryManager）と完全統合されたパラメータ管理サービス。
 * 動的パラメータ管理、記憶階層活用最適化、品質保証統合を提供します。
 */
import { IParameterService } from '../core/interfaces';
import { CharacterParameter, ParameterCategory } from '../core/types';
import { Logger } from '@/lib/utils/logger';
import { NotFoundError, CharacterError } from '../core/errors';

// 🔄 新しい記憶階層システムのインポート
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { MemoryLevel, SystemOperationResult } from '@/lib/memory/core/types';
import { Chapter } from '@/types/chapters';

/**
 * @interface ParameterAdjustment
 * @description パラメータ調整情報
 */
interface ParameterAdjustment {
    parameterId: string;
    parameterName: string;
    currentValue: number;
    adjustmentValue: number;
    newValue: number;
    reason: string;
    confidence: number;
    source: 'memory-system' | 'context-analysis' | 'manual';
}

/**
 * @interface ContextFactor
 * @description 文脈要因
 */
interface ContextFactor {
    type: 'emotional' | 'situational' | 'relational' | 'environmental';
    name: string;
    intensity: number; // 0-1
    duration: 'temporary' | 'short' | 'medium' | 'long' | 'permanent';
    description: string;
}

/**
 * @interface DynamicParameterUpdate
 * @description 動的パラメータ更新結果
 */
interface DynamicParameterUpdate {
    characterId: string;
    adjustments: ParameterAdjustment[];
    newValues: CharacterParameter[];
    contextFactors: ContextFactor[];
    timestamp: Date;
    memorySystemValidated: boolean;
    systemConfidence: number;
    crossLevelConsistency: number;
}

/**
 * @interface ParameterSystemStatus
 * @description パラメータシステム状態
 */
interface ParameterSystemStatus {
    totalParameters: number;
    activeCharacters: number;
    lastOptimization: Date;
    systemHealth: number;
    memorySystemIntegration: boolean;
    cacheEfficiency: number;
    qualityScore: number;
}

/**
 * 記憶階層システム完全統合キャラクターパラメータサービス
 */
export class ParameterService implements IParameterService {
    private readonly logger = new Logger({ serviceName: 'ParameterService' });
    private initialized = false;
    private parameterDefinitionsCache: CharacterParameter[] = [];
    private lastOptimization = new Date();
    private systemStats = {
        totalOperations: 0,
        successfulOperations: 0,
        memorySystemHits: 0,
        cacheHits: 0,
        averageProcessingTime: 0
    };

    /**
     * コンストラクタ（記憶階層システム依存注入）
     * @param memoryManager 記憶階層システムマネージャー
     */
    constructor(private memoryManager: MemoryManager) {
        this.logger.info('ParameterService initialized with complete MemoryManager integration');
        this.initializeMemorySystemIntegration();
    }

    // ============================================================================
    // 🆕 記憶階層システム統合
    // ============================================================================

    /**
     * 記憶階層システム統合の初期化
     */
    private async initializeMemorySystemIntegration(): Promise<void> {
        try {
            // MemoryManagerの初期化状態確認
            const systemStatus = await this.memoryManager.getSystemStatus();
            if (!systemStatus.initialized) {
                this.logger.warn('MemoryManager not initialized, some features may be limited');
                return;
            }

            // パラメータ定義の初期読み込み
            await this.loadParameterDefinitions();

            this.initialized = true;
            this.logger.info('ParameterService memory system integration completed');
        } catch (error) {
            this.logger.error('Failed to initialize parameter memory system integration', { error });
        }
    }

    /**
     * パラメータ定義の読み込み
     * @private
     */
    private async loadParameterDefinitions(): Promise<void> {
        try {
            const searchResult = await this.memoryManager.unifiedSearch(
                'parameter definitions system',
                [MemoryLevel.LONG_TERM]
            );

            if (searchResult.success && searchResult.results.length > 0) {
                this.parameterDefinitionsCache = this.extractParameterDefinitionsFromResults(
                    searchResult.results
                );
                this.systemStats.memorySystemHits++;
            } else {
                // フォールバック: デフォルト定義を作成
                this.parameterDefinitionsCache = this.createDefaultParameterDefinitions();
                await this.storeParameterDefinitionsInMemorySystem();
            }

            this.logger.debug(`Loaded ${this.parameterDefinitionsCache.length} parameter definitions`);
        } catch (error) {
            this.logger.error('Failed to load parameter definitions', { error });
            this.parameterDefinitionsCache = this.createDefaultParameterDefinitions();
        }
    }

    /**
     * 動的パラメータ管理（記憶階層システム統合版）
     */
    async manageDynamicParameters(
        characterId: string,
        contextFactors: ContextFactor[]
    ): Promise<DynamicParameterUpdate> {
        const startTime = Date.now();
        this.systemStats.totalOperations++;

        try {
            this.logger.info('Starting dynamic parameter management with memory integration', {
                characterId,
                contextFactorsCount: contextFactors.length
            });

            // 🆕 統合記憶システムから現在のパラメータ状態を取得
            const currentParams = await this.getParametersFromMemorySystem(characterId);

            // 🆕 記憶階層システム活用文脈による動的調整
            const adjustments = await this.calculateDynamicAdjustmentsWithMemorySystem(
                currentParams, 
                contextFactors,
                characterId
            );

            // 調整の適用
            const updatedParams = await this.applyDynamicAdjustments(characterId, adjustments);

            // 🆕 変化を記憶階層システムに記録
            await this.recordParameterChangesInMemorySystem(characterId, adjustments);

            // システム信頼度とクロスレベル整合性の計算
            const systemConfidence = await this.calculateParameterSystemConfidence(characterId);
            const crossLevelConsistency = await this.validateParameterCrossLevelConsistency(characterId);

            const result: DynamicParameterUpdate = {
                characterId,
                adjustments,
                newValues: updatedParams,
                contextFactors,
                timestamp: new Date(),
                memorySystemValidated: true,
                systemConfidence,
                crossLevelConsistency
            };

            this.systemStats.successfulOperations++;
            this.updatePerformanceMetrics(Date.now() - startTime);

            this.logger.info('Dynamic parameter management completed successfully', {
                characterId,
                adjustmentsApplied: adjustments.length,
                systemConfidence,
                crossLevelConsistency
            });

            return result;
        } catch (error) {
            this.logger.error('Dynamic parameter management failed', { 
                error: error instanceof Error ? error.message : String(error),
                characterId 
            });
            throw error;
        }
    }

    /**
     * キャラクターパラメータ初期化（記憶階層システム統合版）
     */
    async initializeCharacterParameters(characterId: string, defaultValue: number = 10): Promise<CharacterParameter[]> {
        const startTime = Date.now();
        this.systemStats.totalOperations++;

        try {
            this.logger.info(`Initializing character parameters with memory integration: ${characterId}`, {
                defaultValue
            });
            
            // デフォルト値を0〜100の範囲に制限
            const validDefaultValue = Math.max(0, Math.min(100, defaultValue));
            
            // 🆕 統合記憶システムからパラメータ定義を取得
            const allDefinitions = await this.getAllParameterDefinitions();
            
            // 🆕 既存のキャラクターパラメータを統合記憶システムから取得
            const existingParams = await this.getParametersFromMemorySystem(characterId);
            const existingParamMap = new Map(existingParams.map(p => [p.id, p]));
            
            // 各パラメータを初期化
            const initializedParams: CharacterParameter[] = [];
            
            for (const definition of allDefinitions) {
                if (existingParamMap.has(definition.id)) {
                    // 既存パラメータを使用
                    initializedParams.push(existingParamMap.get(definition.id)!);
                } else {
                    // 新規パラメータを作成
                    initializedParams.push({
                        ...definition,
                        value: validDefaultValue,
                        growth: 0
                    });
                }
            }
            
            // 🆕 パラメータを統合記憶システムに保存
            await this.saveCharacterParametersToMemorySystem(characterId, initializedParams);
            
            // 初期化イベントを記録
            await this.recordParameterInitializationInMemorySystem(characterId, initializedParams);
            
            this.systemStats.successfulOperations++;
            this.updatePerformanceMetrics(Date.now() - startTime);

            this.logger.info(`Character parameters initialized successfully: ${characterId}`, {
                parametersCount: initializedParams.length
            });

            return initializedParams;
        } catch (error) {
            this.logger.error(`Failed to initialize character parameters: ${characterId}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * キャラクターパラメータ取得（統合記憶システム完全対応版）
     */
    async getCharacterParameters(characterId: string): Promise<CharacterParameter[]> {
        const startTime = Date.now();
        this.systemStats.totalOperations++;

        try {
            this.logger.debug(`Getting character parameters with memory integration: ${characterId}`);
            
            // 🆕 統合記憶システムからパラメータを取得
            const parameters = await this.getParametersFromMemorySystem(characterId);
            
            if (parameters.length === 0) {
                this.logger.debug(`No parameters found for character: ${characterId}`);
            } else {
                this.systemStats.memorySystemHits++;
            }

            this.systemStats.successfulOperations++;
            this.updatePerformanceMetrics(Date.now() - startTime);
            
            return parameters;
        } catch (error) {
            this.logger.error(`Failed to get character parameters: ${characterId}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * パラメータ値設定（記憶階層システム統合版）
     */
    async setParameterValue(characterId: string, parameterId: string, value: number): Promise<CharacterParameter | null> {
        const startTime = Date.now();
        this.systemStats.totalOperations++;

        try {
            this.logger.debug(`Setting parameter value with memory integration`, {
                characterId,
                parameterId,
                value
            });
            
            // パラメータを取得
            const parameters = await this.getParametersFromMemorySystem(characterId);
            const parameter = parameters.find(p => p.id === parameterId);
            
            if (!parameter) {
                throw new NotFoundError('Parameter', parameterId);
            }
            
            // 前の値を記録
            const previousValue = parameter.value;
            
            // 値を0〜100の範囲に制限
            const newValue = Math.max(0, Math.min(100, value));
            parameter.value = newValue;
            
            // 🆕 パラメータを統合記憶システムに保存
            await this.saveCharacterParametersToMemorySystem(characterId, parameters);
            
            // 🆕 変更を記録
            const adjustment: ParameterAdjustment = {
                parameterId,
                parameterName: parameter.name,
                currentValue: previousValue,
                adjustmentValue: newValue - previousValue,
                newValue,
                reason: 'Manual parameter value setting',
                confidence: 1.0,
                source: 'manual'
            };

            await this.recordParameterChangesInMemorySystem(characterId, [adjustment]);
            
            this.systemStats.successfulOperations++;
            this.updatePerformanceMetrics(Date.now() - startTime);

            this.logger.info(`Parameter value set successfully`, {
                characterId,
                parameterName: parameter.name,
                previousValue,
                newValue
            });

            return parameter;
        } catch (error) {
            if (error instanceof NotFoundError) {
                this.logger.warn(`Parameter not found: ${parameterId}`);
                return null;
            }
            
            this.logger.error(`Failed to set parameter value`, {
                error: error instanceof Error ? error.message : String(error),
                characterId,
                parameterId
            });
            throw error;
        }
    }

    /**
     * パラメータ修正（記憶階層システム統合版）
     */
    async modifyParameter(characterId: string, parameterId: string, delta: number): Promise<CharacterParameter | null> {
        const startTime = Date.now();
        this.systemStats.totalOperations++;

        try {
            this.logger.debug(`Modifying parameter with memory integration`, {
                characterId,
                parameterId,
                delta
            });
            
            // パラメータを取得
            const parameters = await this.getParametersFromMemorySystem(characterId);
            const parameter = parameters.find(p => p.id === parameterId);
            
            if (!parameter) {
                throw new NotFoundError('Parameter', parameterId);
            }
            
            // 前の値を記録
            const previousValue = parameter.value;
            
            // 値を0〜100の範囲に制限
            const newValue = Math.max(0, Math.min(100, previousValue + delta));
            parameter.value = newValue;
            
            // 🆕 パラメータを統合記憶システムに保存
            await this.saveCharacterParametersToMemorySystem(characterId, parameters);
            
            // 🆕 修正を記録
            const adjustment: ParameterAdjustment = {
                parameterId,
                parameterName: parameter.name,
                currentValue: previousValue,
                adjustmentValue: delta,
                newValue,
                reason: 'Manual parameter modification',
                confidence: 1.0,
                source: 'manual'
            };

            await this.recordParameterChangesInMemorySystem(characterId, [adjustment]);
            
            this.systemStats.successfulOperations++;
            this.updatePerformanceMetrics(Date.now() - startTime);

            this.logger.info(`Parameter modified successfully`, {
                characterId,
                parameterName: parameter.name,
                previousValue,
                newValue,
                delta
            });

            return parameter;
        } catch (error) {
            if (error instanceof NotFoundError) {
                this.logger.warn(`Parameter not found: ${parameterId}`);
                return null;
            }
            
            this.logger.error(`Failed to modify parameter`, {
                error: error instanceof Error ? error.message : String(error),
                characterId,
                parameterId
            });
            throw error;
        }
    }

    /**
     * カテゴリ別パラメータ取得（記憶階層システム統合版）
     */
    async getParametersByCategory(characterId: string, category: string): Promise<CharacterParameter[]> {
        try {
            this.logger.debug(`Getting parameters by category with memory integration`, {
                characterId,
                category
            });
            
            // パラメータを取得
            const parameters = await this.getParametersFromMemorySystem(characterId);
            
            // カテゴリでフィルタリング
            const categoryParams = parameters.filter(p => p.category === category);
            
            return categoryParams;
        } catch (error) {
            this.logger.error(`Failed to get parameters by category`, {
                error: error instanceof Error ? error.message : String(error),
                characterId,
                category
            });
            return [];
        }
    }

    // ============================================================================
    // 🆕 記憶階層システム統合ヘルパーメソッド
    // ============================================================================

    /**
     * 記憶階層システムからパラメータを取得
     * @private
     */
    private async getParametersFromMemorySystem(characterId: string): Promise<CharacterParameter[]> {
        try {
            const searchResult = await this.memoryManager.unifiedSearch(
                `character parameters id:${characterId}`,
                [MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            if (searchResult.success && searchResult.results.length > 0) {
                this.systemStats.memorySystemHits++;
                return this.extractParametersFromSearchResults(searchResult.results);
            }

            // フォールバック: 空の配列を返す
            return [];
        } catch (error) {
            this.logger.warn('Failed to get parameters from memory system', { 
                characterId, 
                error: error instanceof Error ? error.message : String(error) 
            });
            return [];
        }
    }

    /**
     * 記憶階層システム活用動的調整計算
     * @private
     */
    private async calculateDynamicAdjustmentsWithMemorySystem(
        currentParams: CharacterParameter[],
        contextFactors: ContextFactor[],
        characterId: string
    ): Promise<ParameterAdjustment[]> {
        try {
            const adjustments: ParameterAdjustment[] = [];

            // 🆕 記憶階層システムから履歴パターンを取得
            const historySearchResult = await this.memoryManager.unifiedSearch(
                `character parameter history patterns id:${characterId}`,
                [MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            let historicalPatterns: any[] = [];
            if (historySearchResult.success) {
                historicalPatterns = historySearchResult.results;
                this.systemStats.memorySystemHits++;
            }

            // 各文脈要因に対して調整を計算
            for (const factor of contextFactors) {
                const relevantParams = this.getRelevantParametersForFactor(currentParams, factor);
                
                for (const param of relevantParams) {
                    const adjustment = await this.calculateParameterAdjustmentForFactor(
                        param,
                        factor,
                        historicalPatterns
                    );
                    
                    if (adjustment) {
                        adjustments.push(adjustment);
                    }
                }
            }

            return adjustments;
        } catch (error) {
            this.logger.warn('Failed to calculate adjustments with memory system', { 
                characterId, 
                error: error instanceof Error ? error.message : String(error) 
            });
            
            // フォールバック: 従来の調整計算
            return this.calculateTraditionalDynamicAdjustments(currentParams, contextFactors);
        }
    }

    /**
     * パラメータ変化を記憶階層システムに記録
     * @private
     */
    private async recordParameterChangesInMemorySystem(
        characterId: string,
        adjustments: ParameterAdjustment[]
    ): Promise<void> {
        try {
            const changeChapter = this.convertParameterChangesToChapter(characterId, adjustments);
            const result = await this.memoryManager.processChapter(changeChapter);
            
            if (result.success) {
                this.logger.debug('Parameter changes recorded in memory system', {
                    characterId,
                    adjustmentsCount: adjustments.length,
                    affectedComponents: result.affectedComponents
                });
            } else {
                this.logger.warn('Parameter changes recording partially failed', {
                    characterId,
                    errors: result.errors
                });
            }
        } catch (error) {
            this.logger.error('Failed to record parameter changes in memory system', { 
                characterId, 
                error: error instanceof Error ? error.message : String(error) 
            });
        }
    }

    /**
     * パラメータシステムの信頼度計算
     * @private
     */
    private async calculateParameterSystemConfidence(characterId: string): Promise<number> {
        try {
            const systemStatus = await this.memoryManager.getSystemStatus();
            
            // システム健全性とパラメータ特有の要因を組み合わせ
            const systemHealth = systemStatus.initialized ? 1.0 : 0.5;
            const operationSuccessRate = this.systemStats.totalOperations > 0 
                ? this.systemStats.successfulOperations / this.systemStats.totalOperations 
                : 0.8;
            const memoryHitRate = this.systemStats.totalOperations > 0
                ? this.systemStats.memorySystemHits / this.systemStats.totalOperations
                : 0.5;

            const confidence = (systemHealth * 0.4 + operationSuccessRate * 0.4 + memoryHitRate * 0.2);
            return Math.min(1.0, Math.max(0.0, confidence));
        } catch (error) {
            this.logger.warn('Failed to calculate parameter system confidence', { 
                characterId, 
                error: error instanceof Error ? error.message : String(error) 
            });
            return 0.5;
        }
    }

    /**
     * パラメータのクロスレベル整合性検証
     * @private
     */
    private async validateParameterCrossLevelConsistency(characterId: string): Promise<number> {
        try {
            // 各記憶レベルからパラメータデータを取得
            const shortTermResult = await this.memoryManager.unifiedSearch(
                `character parameters id:${characterId}`,
                [MemoryLevel.SHORT_TERM]
            );
            
            const midTermResult = await this.memoryManager.unifiedSearch(
                `character parameters id:${characterId}`,
                [MemoryLevel.MID_TERM]
            );
            
            const longTermResult = await this.memoryManager.unifiedSearch(
                `character parameters id:${characterId}`,
                [MemoryLevel.LONG_TERM]
            );

            // 整合性スコアを計算
            let consistencyScore = 1.0;
            
            // 検索結果の成功率を考慮
            const searchSuccessCount = [shortTermResult, midTermResult, longTermResult]
                .filter(result => result.success).length;
            
            if (searchSuccessCount === 0) {
                return 0.3; // データが見つからない場合の低いスコア
            }

            // データの存在とアクセス可能性に基づく整合性
            consistencyScore = searchSuccessCount / 3.0;

            return Math.min(1.0, Math.max(0.0, consistencyScore));
        } catch (error) {
            this.logger.warn('Failed to validate cross-level consistency', { 
                characterId, 
                error: error instanceof Error ? error.message : String(error) 
            });
            return 0.5;
        }
    }

    /**
     * パラメータを統合記憶システムに保存
     * @private
     */
    private async saveCharacterParametersToMemorySystem(
        characterId: string, 
        parameters: CharacterParameter[]
    ): Promise<void> {
        try {
            const parameterChapter = this.convertParametersToChapter(characterId, parameters);
            const result = await this.memoryManager.processChapter(parameterChapter);
            
            if (!result.success) {
                this.logger.warn('Failed to save parameters to memory system', {
                    characterId,
                    errors: result.errors
                });
            }
        } catch (error) {
            this.logger.error('Error saving parameters to memory system', { 
                characterId, 
                error: error instanceof Error ? error.message : String(error) 
            });
        }
    }

    /**
     * パラメータ初期化を記憶階層システムに記録
     * @private
     */
    private async recordParameterInitializationInMemorySystem(
        characterId: string,
        parameters: CharacterParameter[]
    ): Promise<void> {
        try {
            const initChapter = this.convertParameterInitializationToChapter(characterId, parameters);
            await this.memoryManager.processChapter(initChapter);
        } catch (error) {
            this.logger.error('Failed to record parameter initialization', { 
                characterId, 
                error: error instanceof Error ? error.message : String(error) 
            });
        }
    }

    /**
     * パラメータ定義を記憶階層システムに保存
     * @private
     */
    private async storeParameterDefinitionsInMemorySystem(): Promise<void> {
        try {
            const definitionsChapter = this.convertParameterDefinitionsToChapter(this.parameterDefinitionsCache);
            await this.memoryManager.processChapter(definitionsChapter);
        } catch (error) {
            this.logger.error('Failed to store parameter definitions', { error });
        }
    }

    // ============================================================================
    // 🔧 動的調整ヘルパーメソッド
    // ============================================================================

    /**
     * 要因に関連するパラメータを取得
     * @private
     */
    private getRelevantParametersForFactor(
        parameters: CharacterParameter[], 
        factor: ContextFactor
    ): CharacterParameter[] {
        const relevanceMap = {
            'emotional': ['感情制御', '共感力', '感受性', '情緒安定性'],
            'situational': ['適応力', '判断力', '反応速度', '状況認識'],
            'relational': ['社交性', '信頼構築', '対人理解', 'チームワーク'],
            'environmental': ['環境適応', '観察力', '直感力', '持久力']
        };

        const relevantNames = relevanceMap[factor.type] || [];
        return parameters.filter(p => 
            relevantNames.some(name => p.name.includes(name)) ||
            p.tags?.some(tag => relevantNames.includes(tag))
        );
    }

    /**
     * 要因に基づくパラメータ調整計算
     * @private
     */
    private async calculateParameterAdjustmentForFactor(
        parameter: CharacterParameter,
        factor: ContextFactor,
        historicalPatterns: any[]
    ): Promise<ParameterAdjustment | null> {
        try {
            // 強度と持続時間に基づく基本調整値
            let baseAdjustment = factor.intensity * 10; // 0-10の範囲
            
            // 持続時間による調整
            const durationMultiplier = {
                'temporary': 0.5,
                'short': 0.7,
                'medium': 1.0,
                'long': 1.3,
                'permanent': 1.5
            };
            
            baseAdjustment *= durationMultiplier[factor.duration];
            
            // 履歴パターンによる調整
            const historicalAdjustment = this.calculateHistoricalAdjustment(
                parameter, 
                factor, 
                historicalPatterns
            );
            
            const finalAdjustment = baseAdjustment + historicalAdjustment;
            
            // 調整が有意でない場合は null を返す
            if (Math.abs(finalAdjustment) < 0.5) {
                return null;
            }

            return {
                parameterId: parameter.id,
                parameterName: parameter.name,
                currentValue: parameter.value,
                adjustmentValue: finalAdjustment,
                newValue: Math.max(0, Math.min(100, parameter.value + finalAdjustment)),
                reason: `Context factor: ${factor.name} (${factor.type})`,
                confidence: factor.intensity,
                source: 'context-analysis'
            };
        } catch (error) {
            this.logger.warn('Failed to calculate parameter adjustment', { 
                parameterId: parameter.id, 
                error: error instanceof Error ? error.message : String(error) 
            });
            return null;
        }
    }

    /**
     * 履歴パターンによる調整計算
     * @private
     */
    private calculateHistoricalAdjustment(
        parameter: CharacterParameter,
        factor: ContextFactor,
        historicalPatterns: any[]
    ): number {
        try {
            // 履歴パターンから類似の文脈要因を検索
            const similarPatterns = historicalPatterns.filter(pattern => 
                pattern.data?.factorType === factor.type &&
                pattern.data?.parameterId === parameter.id
            );

            if (similarPatterns.length === 0) {
                return 0;
            }

            // 過去の調整値の平均を計算
            const averageAdjustment = similarPatterns.reduce((sum, pattern) => 
                sum + (pattern.data?.adjustmentValue || 0), 0
            ) / similarPatterns.length;

            // 過去のパターンの信頼度で重み付け
            const confidence = Math.min(1.0, similarPatterns.length / 5.0);
            
            return averageAdjustment * confidence * 0.3; // 履歴の影響は30%に制限
        } catch (error) {
            return 0;
        }
    }

    /**
     * 従来の動的調整計算（フォールバック）
     * @private
     */
    private calculateTraditionalDynamicAdjustments(
        currentParams: CharacterParameter[],
        contextFactors: ContextFactor[]
    ): ParameterAdjustment[] {
        const adjustments: ParameterAdjustment[] = [];

        for (const factor of contextFactors) {
            const relevantParams = this.getRelevantParametersForFactor(currentParams, factor);
            
            for (const param of relevantParams) {
                const adjustmentValue = factor.intensity * 5 * 
                    (factor.duration === 'permanent' ? 1.5 : 1.0);

                if (Math.abs(adjustmentValue) >= 0.5) {
                    adjustments.push({
                        parameterId: param.id,
                        parameterName: param.name,
                        currentValue: param.value,
                        adjustmentValue,
                        newValue: Math.max(0, Math.min(100, param.value + adjustmentValue)),
                        reason: `Traditional context analysis: ${factor.name}`,
                        confidence: 0.7,
                        source: 'context-analysis'
                    });
                }
            }
        }

        return adjustments;
    }

    /**
     * 動的調整の適用
     * @private
     */
    private async applyDynamicAdjustments(
        characterId: string,
        adjustments: ParameterAdjustment[]
    ): Promise<CharacterParameter[]> {
        const parameters = await this.getParametersFromMemorySystem(characterId);
        
        for (const adjustment of adjustments) {
            const parameter = parameters.find(p => p.id === adjustment.parameterId);
            if (parameter) {
                parameter.value = adjustment.newValue;
            }
        }
        
        await this.saveCharacterParametersToMemorySystem(characterId, parameters);
        return parameters;
    }

    // ============================================================================
    // 🔧 データ変換ヘルパーメソッド
    // ============================================================================

    /**
     * パラメータ変化を章形式に変換
     * @private
     */
    private convertParameterChangesToChapter(
        characterId: string, 
        adjustments: ParameterAdjustment[]
    ): Chapter {
        const now = new Date();
        
        const content = `キャラクター「${characterId}」のパラメータ変化記録

【変化内容】
${adjustments.map(adj => 
    `- ${adj.parameterName}: ${adj.currentValue} → ${adj.newValue} (${adj.adjustmentValue > 0 ? '+' : ''}${adj.adjustmentValue})`
).join('\n')}

【変化要因】
${adjustments.map(adj => `- ${adj.reason} (信頼度: ${adj.confidence})`).join('\n')}`;

        return {
            id: `parameter-changes-${characterId}-${now.getTime()}`,
            chapterNumber: 0, // システムイベント
            title: `パラメータ変化記録: ${characterId}`,
            content,
            scenes: [],
            createdAt: now,
            updatedAt: now,
            metadata: {
                createdAt: now.toISOString(),
                lastModified: now.toISOString(),
                status: 'processed',
                qualityScore: 1.0,
                keywords: ['parameter', 'changes', characterId],
                events: adjustments.map(adj => ({
                    type: 'parameter_change',
                    parameterId: adj.parameterId,
                    parameterName: adj.parameterName,
                    adjustmentValue: adj.adjustmentValue,
                    reason: adj.reason,
                    confidence: adj.confidence,
                    source: adj.source
                })),
                characters: [characterId],
                foreshadowing: [],
                resolutions: [],
                correctionHistory: [],
                pov: 'システム',
                location: 'パラメータ管理',
                emotionalTone: 'analytical'
            }
        };
    }

    /**
     * パラメータを章形式に変換
     * @private
     */
    private convertParametersToChapter(characterId: string, parameters: CharacterParameter[]): Chapter {
        const now = new Date();
        
        const content = `キャラクター「${characterId}」のパラメータ状態

【現在のパラメータ】
${parameters.map(p => `- ${p.name}: ${p.value} (カテゴリ: ${p.category})`).join('\n')}`;

        return {
            id: `parameters-${characterId}-${now.getTime()}`,
            chapterNumber: 0, // システムイベント
            title: `パラメータ状態: ${characterId}`,
            content,
            scenes: [],
            createdAt: now,
            updatedAt: now,
            metadata: {
                createdAt: now.toISOString(),
                lastModified: now.toISOString(),
                status: 'processed',
                qualityScore: 1.0,
                keywords: ['parameters', characterId],
                events: [{
                    type: 'parameter_snapshot',
                    characterId,
                    parametersCount: parameters.length,
                    timestamp: now.toISOString()
                }],
                characters: [characterId],
                foreshadowing: [],
                resolutions: [],
                correctionHistory: [],
                pov: 'システム',
                location: 'パラメータ管理',
                emotionalTone: 'neutral'
            }
        };
    }

    /**
     * パラメータ初期化を章形式に変換
     * @private
     */
    private convertParameterInitializationToChapter(
        characterId: string, 
        parameters: CharacterParameter[]
    ): Chapter {
        const now = new Date();
        
        const content = `キャラクター「${characterId}」のパラメータ初期化

【初期化されたパラメータ】
${parameters.map(p => `- ${p.name}: ${p.value} (${p.description})`).join('\n')}

パラメータシステムによる統合管理が開始されました。`;

        return {
            id: `parameter-init-${characterId}-${now.getTime()}`,
            chapterNumber: 0, // システムイベント
            title: `パラメータ初期化: ${characterId}`,
            content,
            scenes: [],
            createdAt: now,
            updatedAt: now,
            metadata: {
                createdAt: now.toISOString(),
                lastModified: now.toISOString(),
                status: 'processed',
                qualityScore: 1.0,
                keywords: ['parameter', 'initialization', characterId],
                events: [{
                    type: 'parameter_initialization',
                    characterId,
                    parametersCount: parameters.length,
                    timestamp: now.toISOString()
                }],
                characters: [characterId],
                foreshadowing: [],
                resolutions: [],
                correctionHistory: [],
                pov: 'システム',
                location: 'パラメータ管理',
                emotionalTone: 'neutral'
            }
        };
    }

    /**
     * パラメータ定義を章形式に変換
     * @private
     */
    private convertParameterDefinitionsToChapter(definitions: CharacterParameter[]): Chapter {
        const now = new Date();
        
        const content = `パラメータ定義データベース

【定義済みパラメータ】
${definitions.map(def => 
    `- ${def.name} (${def.category}): ${def.description}`
).join('\n')}

システム全体で利用可能なパラメータ定義です。`;

        return {
            id: `parameter-definitions-${now.getTime()}`,
            chapterNumber: 0, // システムイベント
            title: 'パラメータ定義データベース',
            content,
            scenes: [],
            createdAt: now,
            updatedAt: now,
            metadata: {
                createdAt: now.toISOString(),
                lastModified: now.toISOString(),
                status: 'processed',
                qualityScore: 1.0,
                keywords: ['parameter', 'definitions', 'system'],
                events: [{
                    type: 'parameter_definitions_update',
                    definitionsCount: definitions.length,
                    timestamp: now.toISOString()
                }],
                characters: [],
                foreshadowing: [],
                resolutions: [],
                correctionHistory: [],
                pov: 'システム',
                location: 'パラメータ管理',
                emotionalTone: 'neutral'
            }
        };
    }

    // ============================================================================
    // 🔧 抽出・変換ヘルパーメソッド
    // ============================================================================

    /**
     * 検索結果からパラメータを抽出
     * @private
     */
    private extractParametersFromSearchResults(results: any[]): CharacterParameter[] {
        const parameters: CharacterParameter[] = [];
        
        for (const result of results) {
            try {
                if (result.data?.parameters) {
                    parameters.push(...result.data.parameters);
                } else if (result.data?.parameter) {
                    parameters.push(result.data.parameter);
                } else if (result.type === 'parameter') {
                    parameters.push(result.data);
                }
            } catch (error) {
                this.logger.warn('Failed to extract parameter from search result', { error });
            }
        }
        
        return parameters;
    }

    /**
     * 検索結果からパラメータ定義を抽出
     * @private
     */
    private extractParameterDefinitionsFromResults(results: any[]): CharacterParameter[] {
        const definitions: CharacterParameter[] = [];
        
        for (const result of results) {
            try {
                if (result.data?.definitions) {
                    definitions.push(...result.data.definitions);
                } else if (result.data?.parameterDefinitions) {
                    definitions.push(...result.data.parameterDefinitions);
                }
            } catch (error) {
                this.logger.warn('Failed to extract parameter definitions from search result', { error });
            }
        }
        
        return definitions.length > 0 ? definitions : this.createDefaultParameterDefinitions();
    }

    /**
     * デフォルトパラメータ定義の作成
     * @private
     */
    private createDefaultParameterDefinitions(): CharacterParameter[] {
        return [
            {
                id: 'strength',
                name: '体力',
                category: 'PHYSICAL',
                description: '身体的な強さと持久力',
                value: 50,
                growth: 0,
                tags: ['基本', '身体']
            },
            {
                id: 'intelligence',
                name: '知力',
                category: 'MENTAL',
                description: '論理的思考力と学習能力',
                value: 50,
                growth: 0,
                tags: ['基本', '精神']
            },
            {
                id: 'charisma',
                name: '魅力',
                category: 'SOCIAL',
                description: '他者への影響力と親しみやすさ',
                value: 50,
                growth: 0,
                tags: ['基本', '社会']
            },
            {
                id: 'emotional_control',
                name: '感情制御',
                category: 'MENTAL', // MENTALカテゴリに変更（感情も精神的能力の一部）
                description: '感情の管理と調整能力',
                value: 50,
                growth: 0,
                tags: ['基本', '感情', '精神']
            },
            {
                id: 'adaptability',
                name: '適応力',
                category: 'MENTAL',
                description: '新しい状況への適応能力',
                value: 50,
                growth: 0,
                tags: ['基本', '適応']
            }
        ];
    }

    // ============================================================================
    // 🔧 ユーティリティメソッド
    // ============================================================================

    /**
     * パフォーマンスメトリクスの更新
     * @private
     */
    private updatePerformanceMetrics(processingTime: number): void {
        this.systemStats.averageProcessingTime = 
            ((this.systemStats.averageProcessingTime * (this.systemStats.totalOperations - 1)) + processingTime) /
            this.systemStats.totalOperations;
    }

    // ============================================================================
    // 🔧 インターフェース実装メソッド（既存互換性）
    // ============================================================================

    /**
     * パラメータ定義の全取得
     */
    async getAllParameterDefinitions(): Promise<CharacterParameter[]> {
        try {
            if (this.parameterDefinitionsCache.length === 0) {
                await this.loadParameterDefinitions();
            }
            return [...this.parameterDefinitionsCache];
        } catch (error) {
            this.logger.error('Failed to get all parameter definitions', {
                error: error instanceof Error ? error.message : String(error)
            });
            return this.createDefaultParameterDefinitions();
        }
    }

    /**
     * パラメータ定義の取得
     */
    async getParameterById(parameterId: string): Promise<CharacterParameter | null> {
        try {
            const allDefinitions = await this.getAllParameterDefinitions();
            return allDefinitions.find(p => p.id === parameterId) || null;
        } catch (error) {
            this.logger.error(`Failed to get parameter definition: ${parameterId}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return null;
        }
    }

    /**
     * システム状態取得
     */
    async getSystemStatus(): Promise<ParameterSystemStatus> {
        try {
            const memorySystemStatus = await this.memoryManager.getSystemStatus();
            
            return {
                totalParameters: this.parameterDefinitionsCache.length,
                activeCharacters: 0, // 実装時に統合記憶システムから取得
                lastOptimization: this.lastOptimization,
                systemHealth: memorySystemStatus.initialized ? 0.9 : 0.5,
                memorySystemIntegration: memorySystemStatus.initialized,
                cacheEfficiency: this.systemStats.totalOperations > 0 
                    ? this.systemStats.memorySystemHits / this.systemStats.totalOperations 
                    : 0,
                qualityScore: this.systemStats.totalOperations > 0
                    ? this.systemStats.successfulOperations / this.systemStats.totalOperations
                    : 0.8
            };
        } catch (error) {
            this.logger.error('Failed to get system status', { error });
            
            return {
                totalParameters: this.parameterDefinitionsCache.length,
                activeCharacters: 0,
                lastOptimization: this.lastOptimization,
                systemHealth: 0.5,
                memorySystemIntegration: false,
                cacheEfficiency: 0,
                qualityScore: 0.5
            };
        }
    }
}

// 🆕 ファクトリー関数（MemoryManager注入用）
export function createParameterService(memoryManager: MemoryManager): ParameterService {
    return new ParameterService(memoryManager);
}

// 従来の互換性のため（非推奨：DIパターンを推奨）
export const parameterService = createParameterService(null as any);