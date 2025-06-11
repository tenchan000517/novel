/**
 * Version 2.0 - Priority Calculator
 * 
 * データの優先度計算とランキング機能
 */

import { OperationResult } from '@/types/common';
import { IPriorityCalculator } from '../interfaces';
import type {
  SystemData,
  RelevanceCriteria,
  PriorityScore,
  GenerationContext,
  ContextOptions
} from '../types';
import { SystemType } from '../types';

export interface PriorityWeights {
  relevance: number;
  recency: number;
  reliability: number;
  completeness: number;
  uniqueness: number;
  systemImportance: number;
  contextAlignment: number;
}

export interface PriorityFactors {
  baseScore: number;
  relevanceBonus: number;
  recencyBonus: number;
  reliabilityBonus: number;
  completenessBonus: number;
  uniquenessBonus: number;
  systemBonus: number;
  contextBonus: number;
  penalties: number;
}

export interface PriorityConfig {
  weights: PriorityWeights;
  thresholds: PriorityThresholds;
  adjustments: PriorityAdjustments;
  normalization: NormalizationSettings;
}

export interface PriorityThresholds {
  minimum: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface PriorityAdjustments {
  chapterContext: number;
  characterFocus: number;
  plotCriticality: number;
  thematicRelevance: number;
  temporalProximity: number;
}

export interface NormalizationSettings {
  method: 'linear' | 'logarithmic' | 'exponential' | 'sigmoid';
  range: [number, number];
  smoothing: number;
}

export interface SystemPriorityProfile {
  systemType: SystemType;
  basePriority: number;
  contextMultipliers: Map<string, number>;
  dataTypeWeights: Map<string, number>;
  dependencies: SystemType[];
  exclusions: SystemType[];
}

export interface PriorityCalculationResult {
  score: PriorityScore;
  factors: PriorityFactors;
  reasoning: string[];
  confidence: number;
  recommendations: string[];
}

export interface RankingCriteria {
  method: 'weighted_sum' | 'multiplicative' | 'hierarchical' | 'fuzzy';
  tieBreaking: 'recency' | 'reliability' | 'system_priority' | 'random';
  grouping: 'none' | 'by_system' | 'by_relevance' | 'by_context';
  maxResults?: number;
}

export interface ContextualPriorityModifier {
  context: string;
  systemModifiers: Map<SystemType, number>;
  dataFieldModifiers: Map<string, number>;
  temporalFactors: TemporalFactors;
  narrative: NarrativeFactors;
}

export interface TemporalFactors {
  chapterPosition: number;
  seasonality: number;
  urgency: number;
  deadline: number;
}

export interface NarrativeFactors {
  tension: number;
  climax: number;
  resolution: number;
  character_development: number;
}

export class PriorityCalculator implements IPriorityCalculator {
  private config: PriorityConfig;
  private systemProfiles: Map<SystemType, SystemPriorityProfile> = new Map();
  private contextModifiers: Map<string, ContextualPriorityModifier> = new Map();
  private logger: any;

  constructor(config?: Partial<PriorityConfig>, logger?: any) {
    this.logger = logger || console;
    this.config = this.mergeWithDefaultConfig(config);
    this.initializeSystemProfiles();
    this.initializeContextModifiers();
  }

  // ============================================================================
  // パブリックメソッド
  // ============================================================================

  async calculateSystemPriority(
    systemType: SystemType,
    context: ContextOptions
  ): Promise<OperationResult<number>> {
    const startTime = Date.now();

    try {
      this.logger.debug(`Calculating system priority for ${systemType}`, { context });

      const profile = this.systemProfiles.get(systemType);
      if (!profile) {
        throw new Error(`No priority profile found for system type: ${systemType}`);
      }

      let priority = profile.basePriority;

      // コンテキスト修正子の適用
      const contextKey = this.generateContextKey(context);
      const modifier = this.contextModifiers.get(contextKey);

      if (modifier) {
        const systemModifier = modifier.systemModifiers.get(systemType) || 1.0;
        priority *= systemModifier;
      }

      // 章コンテキストの考慮
      if (context.chapterNumber) {
        priority *= this.calculateChapterContextModifier(systemType, context.chapterNumber);
      }

      // フォーカス要素の考慮
      if (context.focusElements) {
        priority *= this.calculateFocusModifier(systemType, context.focusElements);
      }

      // 正規化
      priority = this.normalizePriority(priority);

      const processingTime = Date.now() - startTime;

      this.logger.debug(`System priority calculated`, {
        systemType,
        priority,
        basePriority: profile.basePriority,
        processingTime: `${processingTime}ms`
      });

      return {
        success: true,
        data: priority,
        metadata: {
          operationId: `system-priority-${systemType}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'priority-calculator'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;

      this.logger.error('System priority calculation failed', { systemType, context, error, processingTime });

      return {
        success: false,
        error: {
          code: 'SYSTEM_PRIORITY_FAILED',
          message: error instanceof Error ? error.message : 'Unknown system priority error',
          details: error
        },
        metadata: {
          operationId: `system-priority-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'priority-calculator'
        }
      };
    }
  }

  async calculateDataPriority(
    data: SystemData,
    criteria: RelevanceCriteria
  ): Promise<OperationResult<PriorityScore>> {
    const startTime = Date.now();

    try {
      this.logger.debug(`Calculating data priority for ${data.systemType}`);

      // 優先度要素の計算
      const factors = await this.calculatePriorityFactors(data, criteria);

      // 重み付きスコアの計算
      const weightedScore = this.calculateWeightedScore(factors);

      // 信頼度の計算
      const confidence = this.calculateConfidence(factors, data);

      // 推論とレコメンデーションの生成
      const reasoning = this.generateReasoning(factors, data);
      const recommendations = this.generateRecommendations(factors, data);

      const priorityScore: PriorityScore = {
        systemType: data.systemType,
        relevanceScore: factors.relevanceBonus,
        importanceScore: factors.systemBonus,
        urgencyScore: factors.recencyBonus,
        overallPriority: weightedScore,
        score: weightedScore,
        confidence: confidence,
        factors: this.convertFactorsToScoreFactors(factors),
        lastCalculated: new Date(),
        context: criteria
      };

      const processingTime = Date.now() - startTime;

      this.logger.debug(`Data priority calculated`, {
        systemType: data.systemType,
        score: weightedScore,
        confidence,
        processingTime: `${processingTime}ms`
      });

      return {
        success: true,
        data: priorityScore,
        metadata: {
          operationId: `data-priority-${data.systemType}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'priority-calculator',
          additionalInfo: {
            factors,
            reasoning,
            recommendations
          }
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;

      this.logger.error('Data priority calculation failed', { data: data.systemType, error, processingTime });

      return {
        success: false,
        error: {
          code: 'DATA_PRIORITY_FAILED',
          message: error instanceof Error ? error.message : 'Unknown data priority error',
          details: error
        },
        metadata: {
          operationId: `data-priority-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'priority-calculator'
        }
      };
    }
  }

  async rankSystemData(
    data: SystemData[],
    criteria?: RankingCriteria
  ): Promise<OperationResult<SystemData[]>> {
    const startTime = Date.now();

    try {
      this.logger.info(`Ranking ${data.length} system data items`);

      const rankingCriteria = criteria || this.getDefaultRankingCriteria();

      // 各データの優先度スコアを計算
      const scoredData = await Promise.all(
        data.map(async (item) => {
          const relevanceCriteria: RelevanceCriteria = {
            chapterNumber: 1,
            minimumRelevanceScore: 0.0,
            requiredSystems: [],
            excludedDataTypes: [],
            maxRelevance: 1.0,
            minRelevance: 0.0,
            includeMetadata: true
          };

          const priorityResult = await this.calculateDataPriority(item, relevanceCriteria);
          const priority = priorityResult.success ? priorityResult.data!.score : 0.5;
          const confidence = priorityResult.success ? (priorityResult.data!.confidence ?? 0.5) : 0.5; // デフォルト値設定

          return {
            data: item,
            priority,
            confidence // undefined の可能性を排除
          };
        })
      );

      // ランキング実行
      let rankedData = this.executeRanking(scoredData, rankingCriteria);

      // グループ化（オプション）
      if (rankingCriteria.grouping !== 'none') {
        rankedData = this.applyGrouping(rankedData, rankingCriteria);
      }

      // 結果制限（オプション）
      if (rankingCriteria.maxResults) {
        rankedData = rankedData.slice(0, rankingCriteria.maxResults);
      }

      const finalRankedData = rankedData.map(item => item.data);

      const processingTime = Date.now() - startTime;

      this.logger.info(`System data ranking completed`, {
        totalItems: data.length,
        rankedItems: finalRankedData.length,
        method: rankingCriteria.method,
        processingTime: `${processingTime}ms`
      });

      return {
        success: true,
        data: finalRankedData,
        metadata: {
          operationId: `data-ranking-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'priority-calculator',
          additionalInfo: {
            criteria: rankingCriteria,
            scores: rankedData.map(item => ({
              systemType: item.data.systemType,
              priority: item.priority,
              confidence: item.confidence
            }))
          }
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;

      this.logger.error('Data ranking failed', { itemCount: data.length, error, processingTime });

      return {
        success: false,
        error: {
          code: 'DATA_RANKING_FAILED',
          message: error instanceof Error ? error.message : 'Unknown data ranking error',
          details: error
        },
        metadata: {
          operationId: `data-ranking-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'priority-calculator'
        }
      };
    }
  }

  async adjustPriorityForContext(
    priorities: PriorityScore[],
    context: GenerationContext
  ): Promise<OperationResult<PriorityScore[]>> {
    const startTime = Date.now();

    try {
      this.logger.debug(`Adjusting priorities for context`, {
        priorityCount: priorities.length,
        chapterNumber: context.chapterNumber
      });

      const adjustedPriorities = priorities.map(priority => {
        const adjustedScore = this.applyContextualAdjustments(priority, context);

        return {
          ...priority,
          score: adjustedScore,
          lastCalculated: new Date(),
          context: {
            ...priority.context,
            contextualAdjustment: true,
            chapterNumber: context.chapterNumber
          }
        };
      });

      // 調整後の正規化
      const normalizedPriorities = this.normalizeScoreSet(adjustedPriorities);

      const processingTime = Date.now() - startTime;

      this.logger.debug(`Context adjustment completed`, {
        originalPriorities: priorities.length,
        adjustedPriorities: normalizedPriorities.length,
        processingTime: `${processingTime}ms`
      });

      return {
        success: true,
        data: normalizedPriorities,
        metadata: {
          operationId: `priority-adjustment-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'priority-calculator'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;

      this.logger.error('Priority adjustment failed', { error, processingTime });

      return {
        success: false,
        error: {
          code: 'PRIORITY_ADJUSTMENT_FAILED',
          message: error instanceof Error ? error.message : 'Unknown priority adjustment error',
          details: error
        },
        metadata: {
          operationId: `priority-adjustment-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'priority-calculator'
        }
      };
    }
  }

  // ============================================================================
  // プライベートメソッド
  // ============================================================================

  private mergeWithDefaultConfig(config?: Partial<PriorityConfig>): PriorityConfig {
    const defaultConfig: PriorityConfig = {
      weights: {
        relevance: 0.3,
        recency: 0.15,
        reliability: 0.2,
        completeness: 0.1,
        uniqueness: 0.1,
        systemImportance: 0.1,
        contextAlignment: 0.05
      },
      thresholds: {
        minimum: 0.0,
        low: 0.3,
        medium: 0.6,
        high: 0.8,
        critical: 0.95
      },
      adjustments: {
        chapterContext: 0.1,
        characterFocus: 0.15,
        plotCriticality: 0.2,
        thematicRelevance: 0.1,
        temporalProximity: 0.05
      },
      normalization: {
        method: 'sigmoid',
        range: [0, 1],
        smoothing: 0.1
      }
    };

    return {
      weights: { ...defaultConfig.weights, ...config?.weights },
      thresholds: { ...defaultConfig.thresholds, ...config?.thresholds },
      adjustments: { ...defaultConfig.adjustments, ...config?.adjustments },
      normalization: { ...defaultConfig.normalization, ...config?.normalization }
    };
  }

  private initializeSystemProfiles(): void {
    const systemTypes = Object.values(SystemType);

    systemTypes.forEach(systemType => {
      const profile: SystemPriorityProfile = {
        systemType,
        basePriority: this.getBasePriorityForSystem(systemType),
        contextMultipliers: new Map(),
        dataTypeWeights: new Map(),
        dependencies: this.getSystemDependencies(systemType),
        exclusions: []
      };

      this.systemProfiles.set(systemType, profile);
    });
  }

  private getBasePriorityForSystem(systemType: SystemType): number {
    const priorities: Record<SystemType, number> = {
      [SystemType.CHARACTER]: 0.9,
      [SystemType.PLOT]: 0.85,
      [SystemType.MEMORY]: 0.8,
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

  private getSystemDependencies(systemType: SystemType): SystemType[] {
    const dependencies: Record<SystemType, SystemType[]> = {
      [SystemType.CHARACTER]: [SystemType.MEMORY],
      [SystemType.PLOT]: [SystemType.CHARACTER, SystemType.WORLD],
      [SystemType.LEARNING]: [SystemType.CHARACTER],
      [SystemType.THEME]: [SystemType.CHARACTER, SystemType.PLOT],
      [SystemType.ANALYSIS]: [SystemType.CHARACTER, SystemType.PLOT, SystemType.THEME],
      [SystemType.QUALITY]: [SystemType.ANALYSIS],
      [SystemType.FORESHADOWING]: [SystemType.PLOT, SystemType.THEME],
      [SystemType.EXPRESSION]: [SystemType.CHARACTER, SystemType.THEME],
      [SystemType.MEMORY]: [],
      [SystemType.WORLD]: []
    };

    return dependencies[systemType] || [];
  }

  private initializeContextModifiers(): void {
    // デフォルトのコンテキスト修正子を設定
    const defaultModifier: ContextualPriorityModifier = {
      context: 'default',
      systemModifiers: new Map([
        [SystemType.CHARACTER, 1.0],
        [SystemType.PLOT, 1.0],
        [SystemType.MEMORY, 1.0]
      ]),
      dataFieldModifiers: new Map(),
      temporalFactors: {
        chapterPosition: 1.0,
        seasonality: 1.0,
        urgency: 1.0,
        deadline: 1.0
      },
      narrative: {
        tension: 1.0,
        climax: 1.0,
        resolution: 1.0,
        character_development: 1.0
      }
    };

    this.contextModifiers.set('default', defaultModifier);
  }

  private generateContextKey(context: ContextOptions): string {
    // コンテキストキーの生成（簡略化）
    return `chapter_${context.chapterNumber || 'unknown'}`;
  }

  private calculateChapterContextModifier(systemType: SystemType, chapterNumber: number): number {
    // 章の文脈に基づく修正子（簡略化）
    return 1.0 + (this.config.adjustments.chapterContext * Math.sin(chapterNumber * 0.1));
  }

  private calculateFocusModifier(systemType: SystemType, focusElements: string[]): number {
    // フォーカス要素に基づく修正子（簡略化）
    const systemRelevant = focusElements.some(element =>
      element.toLowerCase().includes(systemType.toLowerCase())
    );

    return systemRelevant ? 1.2 : 0.9;
  }

  private normalizePriority(priority: number): number {
    const { method, range, smoothing } = this.config.normalization;
    const [min, max] = range;

    switch (method) {
      case 'linear':
        return Math.max(min, Math.min(max, priority));
      case 'sigmoid':
        return min + (max - min) / (1 + Math.exp(-(priority - 0.5) / smoothing));
      case 'logarithmic':
        return min + (max - min) * Math.log(1 + priority) / Math.log(2);
      case 'exponential':
        return min + (max - min) * (Math.exp(priority) - 1) / (Math.exp(1) - 1);
      default:
        return Math.max(min, Math.min(max, priority));
    }
  }

  private async calculatePriorityFactors(
    data: SystemData,
    criteria: RelevanceCriteria
  ): Promise<PriorityFactors> {
    const baseScore = 0.5;
    const relevanceBonus = (data.relevanceScore || 0.5) * this.config.weights.relevance;
    const recencyBonus = this.calculateRecencyBonus(data) * this.config.weights.recency;
    const reliabilityBonus = this.calculateReliabilityBonus(data) * this.config.weights.reliability;
    const completenessBonus = this.calculateCompletenessBonus(data) * this.config.weights.completeness;
    const uniquenessBonus = this.calculateUniquenessBonus(data) * this.config.weights.uniqueness;
    const systemBonus = this.calculateSystemBonus(data.systemType) * this.config.weights.systemImportance;
    const contextBonus = this.calculateContextBonus(data, criteria) * this.config.weights.contextAlignment;
    const penalties = this.calculatePenalties(data);

    return {
      baseScore,
      relevanceBonus,
      recencyBonus,
      reliabilityBonus,
      completenessBonus,
      uniquenessBonus,
      systemBonus,
      contextBonus,
      penalties
    };
  }

  private calculateRecencyBonus(data: SystemData): number {
    const now = Date.now();
    const lastUpdated = new Date(data.lastUpdated).getTime();
    const ageInHours = (now - lastUpdated) / (1000 * 60 * 60);

    // 1時間以内は最大ボーナス、24時間で半減
    return Math.exp(-ageInHours / 24);
  }

  private calculateReliabilityBonus(data: SystemData): number {
    // データの信頼性評価（簡略化）
    return 0.8; // デフォルト値
  }

  private calculateCompletenessBonus(data: SystemData): number {
    // データの完全性評価（簡略化）
    let completeness = 0.5;

    if (data.relevanceScore !== undefined) completeness += 0.2;
    if (data.lastUpdated) completeness += 0.2;
    if (data.systemType) completeness += 0.1;

    return completeness;
  }

  private calculateUniquenessBonus(data: SystemData): number {
    // データの独自性評価（簡略化）
    return 0.7;
  }

  private calculateSystemBonus(systemType: SystemType): number {
    const profile = this.systemProfiles.get(systemType);
    return profile ? profile.basePriority : 0.5;
  }

  private calculateContextBonus(data: SystemData, criteria: RelevanceCriteria): number {
    // コンテキストアライメント評価（簡略化）
    let bonus = 0.5;

    if (criteria.chapterNumber && data.relevanceScore) {
      bonus += data.relevanceScore * 0.3;
    }

    return Math.min(1.0, bonus);
  }

  private calculatePenalties(data: SystemData): number {
    // ペナルティの計算（簡略化）
    let penalties = 0;

    if (!data.relevanceScore || data.relevanceScore < 0.3) {
      penalties += 0.1;
    }

    return penalties;
  }

  private calculateWeightedScore(factors: PriorityFactors): number {
    const score = factors.baseScore +
      factors.relevanceBonus +
      factors.recencyBonus +
      factors.reliabilityBonus +
      factors.completenessBonus +
      factors.uniquenessBonus +
      factors.systemBonus +
      factors.contextBonus -
      factors.penalties;

    return this.normalizePriority(score);
  }

  private calculateConfidence(factors: PriorityFactors, data: SystemData): number {
    // 信頼度の計算（簡略化）
    let confidence = 0.7; // ベース信頼度

    if (factors.reliabilityBonus > 0.7) confidence += 0.1;
    if (factors.completenessBonus > 0.8) confidence += 0.1;
    if (data.relevanceScore && data.relevanceScore > 0.8) confidence += 0.1;

    return Math.min(1.0, confidence);
  }

  private generateReasoning(factors: PriorityFactors, data: SystemData): string[] {
    const reasoning: string[] = [];

    if (factors.relevanceBonus > 0.7) {
      reasoning.push('High relevance score contributes significantly to priority');
    }

    if (factors.recencyBonus > 0.8) {
      reasoning.push('Recent data update increases priority');
    }

    if (factors.systemBonus > 0.8) {
      reasoning.push(`${data.systemType} system has high inherent importance`);
    }

    return reasoning;
  }

  private generateRecommendations(factors: PriorityFactors, data: SystemData): string[] {
    const recommendations: string[] = [];

    if (factors.completenessBonus < 0.5) {
      recommendations.push('Consider updating data to improve completeness');
    }

    if (factors.reliabilityBonus < 0.6) {
      recommendations.push('Data reliability could be improved through validation');
    }

    return recommendations;
  }

  private convertFactorsToScoreFactors(factors: PriorityFactors): any {
    return {
      relevance: factors.relevanceBonus,
      recency: factors.recencyBonus,
      reliability: factors.reliabilityBonus,
      completeness: factors.completenessBonus,
      system: factors.systemBonus,
      context: factors.contextBonus
    };
  }

  private getDefaultRankingCriteria(): RankingCriteria {
    return {
      method: 'weighted_sum',
      tieBreaking: 'recency',
      grouping: 'none',
      maxResults: undefined
    };
  }

  private executeRanking(
    scoredData: { data: SystemData; priority: number; confidence: number }[],
    criteria: RankingCriteria
  ): { data: SystemData; priority: number; confidence: number }[] {
    return scoredData.sort((a, b) => {
      // 主要ソート: 優先度スコア
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }

      // タイブレーキング
      switch (criteria.tieBreaking) {
        case 'recency':
          const aTime = new Date(a.data.lastUpdated).getTime();
          const bTime = new Date(b.data.lastUpdated).getTime();
          return bTime - aTime;
        case 'reliability':
          return b.confidence - a.confidence;
        case 'system_priority':
          const aSystemPriority = this.getBasePriorityForSystem(a.data.systemType);
          const bSystemPriority = this.getBasePriorityForSystem(b.data.systemType);
          return bSystemPriority - aSystemPriority;
        case 'random':
          return Math.random() - 0.5;
        default:
          return 0;
      }
    });
  }

  private applyGrouping(
    rankedData: { data: SystemData; priority: number; confidence: number }[],
    criteria: RankingCriteria
  ): { data: SystemData; priority: number; confidence: number }[] {
    // グループ化の実装（簡略化）
    return rankedData;
  }

  private applyContextualAdjustments(priority: PriorityScore, context: GenerationContext): number {
    let adjustedScore = priority.score;

    // チャプター文脈調整
    adjustedScore *= this.calculateChapterContextModifier(priority.systemType, context.chapterNumber);

    // その他の文脈調整
    if (context.focusCharacters && context.focusCharacters.length > 0) {
      if (priority.systemType === SystemType.CHARACTER) {
        adjustedScore *= 1.2; // キャラクター重視
      }
    }

    return this.normalizePriority(adjustedScore);
  }

  private normalizeScoreSet(priorities: PriorityScore[]): PriorityScore[] {
    if (priorities.length === 0) return priorities;

    const scores = priorities.map(p => p.score);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const range = maxScore - minScore;

    if (range === 0) return priorities;

    return priorities.map(priority => ({
      ...priority,
      score: (priority.score - minScore) / range
    }));
  }
}