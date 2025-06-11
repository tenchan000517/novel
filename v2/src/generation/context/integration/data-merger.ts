/**
 * Version 2.0 - Data Merger
 * 
 * 複数のシステムからのデータを統合・マージする
 */

import { OperationResult } from '@/types/common';
import { IDataMerger } from '../interfaces';
import {
  SystemData,
  SystemDataCollection,
  SystemDataWithPriority,
  DataConflict,
  ConflictResolution,
  ValidationResult,
  SystemType
} from '../types';

export interface MergeStrategy {
  strategy: 'priority_based' | 'weighted_average' | 'latest_wins' | 'consensus' | 'custom';
  weight?: number;
  customResolver?: (conflicts: DataConflict[]) => ConflictResolution[];
}

export interface MergeOptions {
  strategy: MergeStrategy;
  conflictResolution: 'strict' | 'permissive' | 'interactive';
  validationLevel: 'basic' | 'detailed' | 'comprehensive';
  preserveMetadata: boolean;
  optimizeSize: boolean;
  maxDataPoints?: number;
}

export interface DataIntegrityCheck {
  consistencyScore: number;
  completenessScore: number;
  accuracyScore: number;
  reliabilityScore: number;
  conflicts: DataConflict[];
}

export interface MergeMetrics {
  totalSystems: number;
  totalDataPoints: number;
  mergedDataPoints: number;
  conflictsDetected: number;
  conflictsResolved: number;
  processingTime: number;
  memoryUsage: number;
  dataIntegrity: DataIntegrityCheck;
}

export interface ConflictResolutionStrategy {
  field: string;
  strategy: 'priority' | 'average' | 'latest' | 'consensus' | 'manual';
  resolver?: (values: any[]) => any;
  confidence: number;
}

export interface MergeRule {
  sourceSystem: SystemType;
  targetField: string;
  priority: number;
  transformFunction?: (data: any) => any;
  validationRule?: (data: any) => boolean;
}

export class DataMerger implements IDataMerger {
  private mergeRules: Map<string, MergeRule[]> = new Map();
  private conflictStrategies: Map<string, ConflictResolutionStrategy> = new Map();
  private logger: any;

  constructor(logger?: any) {
    this.logger = logger || console;
    this.initializeDefaultRules();
    this.initializeConflictStrategies();
  }

  // ============================================================================
  // パブリックメソッド
  // ============================================================================

  async mergeSystemData(
    data: SystemData[],
    options: MergeOptions = this.getDefaultMergeOptions()
  ): Promise<OperationResult<SystemDataCollection>> {
    const startTime = Date.now();

    try {
      this.logger.info(`Starting data merge for ${data.length} systems`, {
        systems: data.map(d => d.systemType),
        strategy: options.strategy.strategy
      });

      // フェーズ1: データの前処理と優先度付け
      const prioritizedData = await this.preprocessData(data);

      // フェーズ2: データ整合性チェック
      const integrityCheck = await this.performIntegrityCheck(prioritizedData);

      // フェーズ3: 競合検出
      const conflicts = await this.detectConflicts(prioritizedData);

      // フェーズ4: 競合解決
      const resolutionsResult = await this.resolveDataConflicts(conflicts, options);
      const resolutions = resolutionsResult.success ? resolutionsResult.data! : [];

      // フェーズ5: データマージ実行
      const mergedData = await this.executeMerge(prioritizedData, resolutions, options);

      // フェーズ6: マージ後の検証
      const validationResult = await this.validateMergedData(mergedData, options);

      // フェーズ7: 最適化（オプション）
      let finalData = mergedData;
      if (options.optimizeSize) {
        const optimizeResult = await this.optimizeMergedData(mergedData, options);
        if (optimizeResult.success) {
          finalData = optimizeResult.data!;
        }
      }

      // メトリクス生成
      const metrics = this.generateMergeMetrics(data, finalData, conflicts, resolutions, integrityCheck, startTime);

      const result: SystemDataCollection = {
        ...finalData,
        mergeMetadata: {
          mergeStrategy: options.strategy.strategy,
          conflictResolution: options.conflictResolution,
          mergeTimestamp: new Date(),
          sourceSystemCount: data.length,
          conflictsResolved: resolutions.length,
          dataIntegrity: integrityCheck,
          metrics
        }
      };

      const processingTime = Date.now() - startTime;

      this.logger.info(`Data merge completed successfully`, {
        sourceSystems: data.length,
        conflicts: conflicts.length,
        resolutions: resolutions.length,
        processingTime: `${processingTime}ms`,
        integrityScore: integrityCheck.consistencyScore
      });

      return {
        success: true,
        data: result,
        metadata: {
          operationId: `data-merge-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'data-merger'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;

      this.logger.error('Data merge failed', { error, processingTime });

      return {
        success: false,
        error: {
          code: 'DATA_MERGE_FAILED',
          message: error instanceof Error ? error.message : 'Unknown data merge error',
          details: error
        },
        metadata: {
          operationId: `data-merge-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'data-merger'
        }
      };
    }
  }

  async resolveDataConflicts(
    conflicts: DataConflict[],
    options?: MergeOptions
  ): Promise<OperationResult<ConflictResolution[]>> {
    const startTime = Date.now();

    try {
      this.logger.debug(`Resolving ${conflicts.length} data conflicts`);

      const resolutions: ConflictResolution[] = [];

      for (const conflict of conflicts) {
        try {
          const resolution = await this.resolveConflict(conflict, options);
          resolutions.push(resolution);
        } catch (conflictError) {
          this.logger.warn(`Failed to resolve conflict for field ${conflict.field}`, { conflictError });

          // フォールバック解決策
          const fallbackResolution: ConflictResolution = {
            conflictId: conflict.id,
            field: conflict.field,
            resolvedValue: conflict.values[0], // 最初の値をデフォルトとして使用
            strategy: 'fallback',
            confidence: 0.3,
            reasoning: 'Fallback resolution due to conflict resolution failure'
          };
          resolutions.push(fallbackResolution);
        }
      }

      const processingTime = Date.now() - startTime;

      this.logger.debug(`Resolved ${resolutions.length} conflicts`, {
        successfulResolutions: resolutions.filter(r => r.confidence > 0.5).length,
        processingTime: `${processingTime}ms`
      });

      return {
        success: true,
        data: resolutions,
        metadata: {
          operationId: `conflict-resolution-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'data-merger'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;

      this.logger.error('Conflict resolution failed', { error, processingTime });

      return {
        success: false,
        error: {
          code: 'CONFLICT_RESOLUTION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown conflict resolution error',
          details: error
        },
        metadata: {
          operationId: `conflict-resolution-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'data-merger'
        }
      };
    }
  }

  async validateMergedData(
    mergedData: SystemDataCollection,
    options?: MergeOptions
  ): Promise<OperationResult<ValidationResult>> {
    const startTime = Date.now();

    try {
      this.logger.debug('Validating merged data');

      const validationLevel = options?.validationLevel || 'basic';

      const validationResult: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        score: 1.0,
        details: {},
        issues: [], // 追加
        recommendations: [] // 追加
      };

      // 基本検証
      await this.performBasicValidation(mergedData, validationResult);

      // 詳細検証
      if (validationLevel === 'detailed' || validationLevel === 'comprehensive') {
        await this.performDetailedValidation(mergedData, validationResult);
      }

      // 包括的検証
      if (validationLevel === 'comprehensive') {
        await this.performComprehensiveValidation(mergedData, validationResult);
      }

      // 最終スコア計算
      this.calculateValidationScore(validationResult);

      const processingTime = Date.now() - startTime;

      this.logger.debug('Data validation completed', {
        isValid: validationResult.isValid,
        score: validationResult.score,
        errors: validationResult.errors.length,
        warnings: validationResult.warnings.length,
        processingTime: `${processingTime}ms`
      });

      return {
        success: true,
        data: validationResult,
        metadata: {
          operationId: `data-validation-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'data-merger'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;

      this.logger.error('Data validation failed', { error, processingTime });

      return {
        success: false,
        error: {
          code: 'DATA_VALIDATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown data validation error',
          details: error
        },
        metadata: {
          operationId: `data-validation-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'data-merger'
        }
      };
    }
  }

  async optimizeMergedData(
    mergedData: SystemDataCollection,
    options?: MergeOptions
  ): Promise<OperationResult<SystemDataCollection>> {
    const startTime = Date.now();

    try {
      this.logger.debug('Optimizing merged data');

      let optimizedData = { ...mergedData };

      // サイズ最適化
      if (options?.optimizeSize) {
        optimizedData = await this.optimizeDataSize(optimizedData, options);
      }

      // 重複除去
      optimizedData = await this.deduplicateData(optimizedData);

      // パフォーマンス最適化
      optimizedData = await this.optimizeForPerformance(optimizedData);

      // メタデータ最適化
      if (!options?.preserveMetadata) {
        optimizedData = await this.optimizeMetadata(optimizedData);
      }

      const processingTime = Date.now() - startTime;

      const originalSize = this.calculateDataSize(mergedData);
      const optimizedSize = this.calculateDataSize(optimizedData);
      const compressionRatio = optimizedSize / originalSize;

      this.logger.debug('Data optimization completed', {
        originalSize,
        optimizedSize,
        compressionRatio: compressionRatio.toFixed(3),
        processingTime: `${processingTime}ms`
      });

      return {
        success: true,
        data: optimizedData,
        metadata: {
          operationId: `data-optimization-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'data-merger',
          additionalInfo: { // optimizationMetrics を additionalInfo に移動
            optimizationMetrics: {
              originalSize,
              optimizedSize,
              compressionRatio
            }
          }
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;

      this.logger.error('Data optimization failed', { error, processingTime });

      return {
        success: false,
        error: {
          code: 'DATA_OPTIMIZATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown data optimization error',
          details: error
        },
        metadata: {
          operationId: `data-optimization-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'data-merger'
        }
      };
    }
  }

  // ============================================================================
  // プライベートメソッド
  // ============================================================================

  private initializeDefaultRules(): void {
    // メモリシステム用ルール
    this.mergeRules.set('memory', [
      {
        sourceSystem: SystemType.MEMORY,
        targetField: 'relevanceScore',
        priority: 1.0,
        transformFunction: (data) => Math.max(0, Math.min(1, data)),
        validationRule: (data) => typeof data === 'number' && data >= 0 && data <= 1
      }
    ]);

    // キャラクターシステム用ルール
    this.mergeRules.set('character', [
      {
        sourceSystem: SystemType.CHARACTER,
        targetField: 'relationships',
        priority: 0.9,
        transformFunction: (data) => Array.isArray(data) ? data : [],
        validationRule: (data) => Array.isArray(data)
      }
    ]);

    // その他のシステム用デフォルトルール
    Object.values(SystemType).forEach(systemType => {
      if (!this.mergeRules.has(systemType)) {
        this.mergeRules.set(systemType, [
          {
            sourceSystem: systemType,
            targetField: 'lastUpdated',
            priority: 0.8,
            transformFunction: (data) => new Date(data),
            validationRule: (data) => data instanceof Date || typeof data === 'string'
          }
        ]);
      }
    });
  }

  private initializeConflictStrategies(): void {
    this.conflictStrategies.set('relevanceScore', {
      field: 'relevanceScore',
      strategy: 'priority',
      confidence: 0.8
    });

    this.conflictStrategies.set('lastUpdated', {
      field: 'lastUpdated',
      strategy: 'latest',
      confidence: 0.9
    });

    this.conflictStrategies.set('default', {
      field: 'default',
      strategy: 'consensus',
      confidence: 0.6
    });
  }

  private getDefaultMergeOptions(): MergeOptions {
    return {
      strategy: {
        strategy: 'priority_based'
      },
      conflictResolution: 'permissive',
      validationLevel: 'detailed',
      preserveMetadata: true,
      optimizeSize: false
    };
  }

  private async preprocessData(data: SystemData[]): Promise<SystemDataWithPriority[]> {
    return data.map((systemData, index) => ({
      ...systemData,
      priority: this.calculateSystemPriority(systemData.systemType),
      priorityFactors: {
        relevance: systemData.relevanceScore || 0.5,
        recency: this.calculateRecency(systemData),
        importance: this.calculateSystemPriority(systemData.systemType),
        context: 0.7
      },
      reliability: this.calculateRecency(systemData) // 追加
    }));
  }

  private calculateSystemPriority(systemType: SystemType): number {
    const priorities: Record<SystemType, number> = {
      [SystemType.CHARACTER]: 0.9,
      [SystemType.MEMORY]: 0.85,
      [SystemType.PLOT]: 0.8,
      [SystemType.LEARNING]: 0.75,
      [SystemType.THEME]: 0.7,
      [SystemType.WORLD]: 0.65,
      [SystemType.ANALYSIS]: 0.6,
      [SystemType.QUALITY]: 0.55,
      [SystemType.FORESHADOWING]: 0.5,
      [SystemType.EXPRESSION]: 0.45
    };

    return priorities[systemType] || 0.5;
  }

  private calculateRecency(systemData: SystemData): number {
    let reliability = 0.8;
    if (systemData.relevanceScore && systemData.relevanceScore > 0.8) reliability += 0.1;
    // ↓ 修正：relevanceScore の undefined チェック追加
    if ((systemData.relevanceScore ?? 0) > 0.8) reliability += 0.1;
    if (new Date().getTime() - new Date(systemData.lastUpdated).getTime() < 3600000) {
      reliability += 0.1;
    }
    return Math.min(1.0, reliability);
  }

  private async performIntegrityCheck(data: SystemDataWithPriority[]): Promise<DataIntegrityCheck> {
    const consistencyScore = this.calculateConsistencyScore(data);
    const completenessScore = this.calculateCompletenessScore(data);
    const accuracyScore = this.calculateAccuracyScore(data);
    // reliability プロパティにデフォルト値を使用
    const reliabilityScore = data.reduce((sum, d) => sum + (d.reliability ?? 0.8), 0) / data.length;

    return {
      consistencyScore,
      completenessScore,
      accuracyScore,
      reliabilityScore,
      conflicts: []
    };
  }

  private calculateConsistencyScore(data: SystemDataWithPriority[]): number {
    // データ間の一貫性を評価（簡略化）
    return 0.8;
  }

  private calculateCompletenessScore(data: SystemDataWithPriority[]): number {
    // データの完全性を評価（簡略化）
    return 0.85;
  }

  private calculateAccuracyScore(data: SystemDataWithPriority[]): number {
    // データの正確性を評価（簡略化）
    return 0.9;
  }

  private async detectConflicts(data: SystemDataWithPriority[]): Promise<DataConflict[]> {
    const conflicts: DataConflict[] = [];

    // TODO: 実際の競合検出ロジックを実装
    // 現在は空の配列を返す

    return conflicts;
  }

  private async resolveConflict(
    conflict: DataConflict,
    options?: MergeOptions
  ): Promise<ConflictResolution> {
    const strategy = this.conflictStrategies.get(conflict.field) ||
      this.conflictStrategies.get('default')!;

    let resolvedValue: any;
    let confidence = strategy.confidence;

    switch (strategy.strategy) {
      case 'priority':
        resolvedValue = conflict.values[0]; // 最高優先度の値
        break;
      case 'latest':
        resolvedValue = this.getLatestValue(conflict.values);
        break;
      case 'average':
        resolvedValue = this.calculateAverage(conflict.values);
        break;
      case 'consensus':
        resolvedValue = this.findConsensusValue(conflict.values);
        break;
      default:
        resolvedValue = conflict.values[0];
        confidence = 0.5;
    }

    return {
      conflictId: conflict.id,
      field: conflict.field,
      resolvedValue,
      strategy: strategy.strategy,
      confidence,
      reasoning: `Resolved using ${strategy.strategy} strategy`
    };
  }

  private getLatestValue(values: any[]): any {
    // TODO: タイムスタンプに基づいて最新の値を取得
    return values[0];
  }

  private calculateAverage(values: any[]): any {
    // 数値の場合は平均を計算
    if (values.every(v => typeof v === 'number')) {
      return values.reduce((sum, v) => sum + v, 0) / values.length;
    }
    return values[0];
  }

  private findConsensusValue(values: any[]): any {
    // 最も一般的な値を見つける
    const counts = new Map();
    values.forEach(v => {
      const key = JSON.stringify(v);
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    let maxCount = 0;
    let consensusValue = values[0];

    for (const [key, count] of counts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        consensusValue = JSON.parse(key);
      }
    }

    return consensusValue;
  }

  private async executeMerge(
    data: SystemDataWithPriority[],
    resolutions: ConflictResolution[],
    options: MergeOptions
  ): Promise<SystemDataCollection> {
    // TODO: 実際のマージロジックを実装
    // 現在は最初のデータをベースとした簡略版

    const baseData = data[0];

    return {
      systems: data.map(d => d.systemType),
      data: new Map([
        [data[0].systemType, data[0]]
      ]),
      metadata: {
        collectionTimestamp: new Date(),
        totalSystems: data.length,
        performance: {
          totalTime: 0,
          systemTimes: new Map(),
          memoryUsage: 0,
          errorCount: 0
        }
      }
    };
  }

  private async performBasicValidation(
    data: SystemDataCollection,
    result: ValidationResult
  ): Promise<void> {
    // 基本的な構造チェック
    if (!data.systems || data.systems.length === 0) {
      result.errors.push('No systems data found');
      result.isValid = false;
    }

    if (!data.data || data.data.size === 0) {
      result.warnings.push('No data found in collection');
    }
  }

  private async performDetailedValidation(
    data: SystemDataCollection,
    result: ValidationResult
  ): Promise<void> {
    // 詳細な内容チェック
    for (const [systemType, systemData] of data.data.entries()) {
      if (!systemData.relevanceScore || systemData.relevanceScore < 0 || systemData.relevanceScore > 1) {
        result.warnings.push(`Invalid relevance score for ${systemType}`);
      }
    }
  }

  private async performComprehensiveValidation(
    data: SystemDataCollection,
    result: ValidationResult
  ): Promise<void> {
    // 包括的な整合性チェック
    // TODO: より詳細な検証ロジックを実装
  }

  private calculateValidationScore(result: ValidationResult): void {
    let score = 1.0;

    score -= result.errors.length * 0.2;
    score -= result.warnings.length * 0.05;

    result.score = Math.max(0, score);

    if (result.score < 0.8) {
      result.isValid = false;
    }
  }

  private async optimizeDataSize(
    data: SystemDataCollection,
    options: MergeOptions
  ): Promise<SystemDataCollection> {
    // データサイズの最適化
    const optimized = { ...data };

    if (options.maxDataPoints && data.data.size > options.maxDataPoints) {
      // 関連性スコアでソートして上位のみ保持
      const sortedSystems = Array.from(data.data.entries())
        .sort(([, a], [, b]) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, options.maxDataPoints);

      optimized.data = new Map(sortedSystems);
      optimized.systems = sortedSystems.map(([systemType]) => systemType);
    }

    return optimized;
  }

  private async deduplicateData(data: SystemDataCollection): Promise<SystemDataCollection> {
    // 重複データの除去
    // TODO: より詳細な重複除去ロジックを実装
    return data;
  }

  private async optimizeForPerformance(data: SystemDataCollection): Promise<SystemDataCollection> {
    // パフォーマンス最適化
    // TODO: パフォーマンス最適化ロジックを実装
    return data;
  }

  private async optimizeMetadata(data: SystemDataCollection): Promise<SystemDataCollection> {
    const optimized = { ...data };

    // 不要なメタデータを削除
    if (optimized.metadata.performance) {
      // delete演算子の代わりに新しいオブジェクトを作成
      const { systemTimes, ...restPerformance } = optimized.metadata.performance;
      optimized.metadata.performance = restPerformance;
    }

    return optimized;
  }

  private calculateDataSize(data: SystemDataCollection): number {
    // データサイズの概算計算
    return JSON.stringify(data).length;
  }

  private generateMergeMetrics(
    sourceData: SystemData[],
    mergedData: SystemDataCollection,
    conflicts: DataConflict[],
    resolutions: ConflictResolution[],
    integrityCheck: DataIntegrityCheck,
    startTime: number
  ): MergeMetrics {
    const processingTime = Date.now() - startTime;

    return {
      totalSystems: sourceData.length,
      totalDataPoints: sourceData.length, // 簡略化
      mergedDataPoints: mergedData.data.size,
      conflictsDetected: conflicts.length,
      conflictsResolved: resolutions.length,
      processingTime,
      memoryUsage: this.calculateDataSize(mergedData),
      dataIntegrity: integrityCheck
    };
  }
}