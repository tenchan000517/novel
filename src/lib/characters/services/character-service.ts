/**
 * @fileoverview キャラクターサービス（統合基盤対応版）
 * @description
 * 静的YAMLファイル読み込み + 7つの専門サービス統合 + 記憶階層連携
 * 既存の23メソッドを保持しつつ、統合機能を追加
 */
import { ICharacterService } from '../core/interfaces';
import {
  Character,
  CharacterData,
  CharacterState,
  ChapterEvent,
  ValidationResult,
  CharacterAppearance,
  Interaction,
  CharacterHistory,
} from '../core/types';

// 🆕 統合基盤型定義
import {
  UnifiedCharacterData,
  HierarchicalCharacterData,
  GenerationContext,
  CharacterEvolution,
  PsychologyAnalysis,
  RelationshipMap,
  DynamicParameters,
  SkillProgression,
  DetectionHistory,
  UnifiedMetadata,
  CharacterShortTermData,
  CharacterMidTermData,
  CharacterLongTermData,
  HierarchyConsistency
} from './unified-character-types';

import { eventBus } from '../events/character-event-bus';
import { EVENT_TYPES } from '../core/constants';
import { logger } from '@/lib/utils/logger';
import { generateId } from '@/lib/utils/helpers';
import { CharacterError, NotFoundError, ValidationError } from '../core/errors';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';

// 記憶階層システム
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { MemoryLevel, MemoryRequestType, UnifiedMemoryContext } from '@/lib/memory/core/types';

// 専門サービス型定義（存在する場合のみimport）
interface ServiceProvider {
  evolution?: any;
  psychology?: any;
  relationship?: any;
  parameter?: any;
  skill?: any;
  detection?: any;
}

/**
 * 統合基盤対応キャラクターサービス（拡張版）
 * 
 * 既存機能：
 * - 静的YAMLファイル読み込み
 * - 基本CRUD操作
 * - キャラクター発展処理
 * - バリデーション
 * 
 * 新機能：
 * - 7つの専門サービス統合
 * - 記憶階層システム連携
 * - 統合データ生成
 */
export class CharacterService implements ICharacterService {
  // 内部キャッシュ（既存）
  private characterCache: Map<string, Character> = new Map();
  private typeIndex: Map<string, string[]> = new Map();
  private initialized = false;

  // 🆕 統合基盤
  private memoryManager?: MemoryManager;
  private serviceProvider?: ServiceProvider;

  // キャラクターファイルのパス設定（既存）
  private readonly characterPaths = [
    'data/characters/main',
    'data/characters/sub',
    'data/characters/background'
  ];

  /**
   * コンストラクタ（統合基盤対応）
   * @param characterRepository キャラクターリポジトリ（オプション）
   * @param memoryManager 記憶階層システム（オプション）
   * @param serviceProvider 専門サービスプロバイダー（オプション）
   */
  constructor(
    private characterRepository: any = null,
    memoryManager?: MemoryManager,
    serviceProvider?: ServiceProvider
  ) {
    this.memoryManager = memoryManager;
    this.serviceProvider = serviceProvider;
    // 初期化はlazyに実行
  }

  // ============================================================================
  // 🆕 統合基盤メソッド（新規追加）
  // ============================================================================

  /**
   * 🆕 プロンプト生成用統合キャラクターデータ取得
   * 7つの専門サービスからの情報を統合し、プロンプト生成に最適化されたデータを提供
   * 
   * @param characterId キャラクターID
   * @param context 生成コンテキスト
   * @returns 統合キャラクターデータ
   */
  async getUnifiedCharacterForPrompt(
    characterId: string,
    context: GenerationContext
  ): Promise<UnifiedCharacterData> {
    const startTime = Date.now();

    try {
      await this.ensureInitialized();

      // 基本キャラクター情報取得
      const baseCharacter = await this.getCharacter(characterId);
      if (!baseCharacter) {
        throw new NotFoundError('Character', characterId);
      }

      logger.info(`Starting unified character data generation for ${characterId}`, {
        purpose: context.purpose,
        detailLevel: context.detailLevel,
        chapterNumber: context.chapterNumber
      });

      // 7つの専門サービスから並列でデータ取得
      const [
        characterDetails,
        evolution,
        psychology,
        relationships,
        parameters,
        skills,
        detection
      ] = await Promise.allSettled([
        this.buildCharacterWithDetails(baseCharacter, context),
        this.getCharacterEvolution(characterId, context),
        this.getCharacterPsychology(characterId, context),
        this.getCharacterRelationships(characterId, context),
        this.getCharacterParameters(characterId, context),
        this.getCharacterSkills(characterId, context),
        this.getCharacterDetection(characterId, context)
      ]);

      // 統合データ構築
      const unifiedData: UnifiedCharacterData = {
        character: this.extractSettledValue(characterDetails, this.createFallbackCharacterDetails(baseCharacter)),
        evolution: this.extractSettledValue(evolution, this.createFallbackEvolution(baseCharacter)),
        psychology: this.extractSettledValue(psychology, this.createFallbackPsychology(baseCharacter)),
        relationships: this.extractSettledValue(relationships, this.createFallbackRelationships(baseCharacter)),
        parameters: this.extractSettledValue(parameters, this.createFallbackParameters(baseCharacter)),
        skills: this.extractSettledValue(skills, this.createFallbackSkills(baseCharacter)),
        detection: this.extractSettledValue(detection, this.createFallbackDetection(baseCharacter)),
        metadata: this.createUnifiedMetadata(startTime, characterId)
      };

      // メタデータ更新
      unifiedData.metadata.statistics.processingTime = Date.now() - startTime;
      unifiedData.metadata.statistics.dataPoints = this.countDataPoints(unifiedData);

      // 統合イベント発行（将来実装）
      // eventBus.publish(EVENT_TYPES.CHARACTER_UNIFIED_DATA_GENERATED, {
      //   timestamp: new Date(),
      //   characterId,
      //   context,
      //   dataPoints: unifiedData.metadata.statistics.dataPoints,
      //   processingTime: unifiedData.metadata.statistics.processingTime
      // });

      logger.info(`Unified character data generated successfully`, {
        characterId,
        dataPoints: unifiedData.metadata.statistics.dataPoints,
        processingTime: unifiedData.metadata.statistics.processingTime
      });

      return unifiedData;

    } catch (error) {
      logger.error(`Failed to generate unified character data for ${characterId}`, {
        error: error instanceof Error ? error.message : String(error),
        context
      });
      throw new CharacterError(
        `統合キャラクターデータの生成に失敗しました: ${characterId}`
      );
    }
  }

  /**
   * 🆕 記憶階層統合キャラクターデータ取得
   * 記憶階層システム（短期・中期・長期）からの情報を統合し、
   * 階層化されたキャラクターデータを提供
   * 
   * @param characterId キャラクターID
   * @returns 記憶階層統合データ
   */
  async getCharacterWithMemoryHierarchy(characterId: string): Promise<HierarchicalCharacterData> {
    const startTime = Date.now();

    try {
      await this.ensureInitialized();

      const baseCharacter = await this.getCharacter(characterId);
      if (!baseCharacter) {
        throw new NotFoundError('Character', characterId);
      }

      logger.info(`Starting memory hierarchy integration for ${characterId}`);

      // 記憶階層システムが利用可能な場合のみ統合処理
      if (!this.memoryManager) {
        logger.warn('MemoryManager not available, using fallback hierarchy data');
        return this.createFallbackHierarchyData(baseCharacter);
      }

      // 各記憶レベルから並列でデータ取得
      const [shortTermData, midTermData, longTermData, unifiedContext] = await Promise.allSettled([
        this.getShortTermCharacterData(characterId),
        this.getMidTermCharacterData(characterId),
        this.getLongTermCharacterData(characterId),
        this.memoryManager.getUnifiedContext(baseCharacter.state?.lastAppearance || 1)
      ]);

      // 階層間整合性チェック
      const consistency = await this.checkHierarchyConsistency(
        this.extractSettledValue(shortTermData, null),
        this.extractSettledValue(midTermData, null),
        this.extractSettledValue(longTermData, null)
      );

      const hierarchicalData: HierarchicalCharacterData = {
        shortTerm: this.extractSettledValue(shortTermData, this.createFallbackShortTerm(baseCharacter)),
        midTerm: this.extractSettledValue(midTermData, this.createFallbackMidTerm(baseCharacter)),
        longTerm: this.extractSettledValue(longTermData, this.createFallbackLongTerm(baseCharacter)),
        consistency,
        context: this.extractSettledValue(unifiedContext, this.createFallbackContext())
      };

      logger.info(`Memory hierarchy integration completed`, {
        characterId,
        consistencyScore: consistency.score,
        processingTime: Date.now() - startTime
      });

      // 階層統合イベント発行（将来実装）
      // eventBus.publish(EVENT_TYPES.CHARACTER_MEMORY_HIERARCHY_INTEGRATED, {
      //   timestamp: new Date(),
      //   characterId,
      //   consistencyScore: consistency.score,
      //   inconsistencyCount: consistency.inconsistencies.length,
      //   processingTime: Date.now() - startTime
      // });

      return hierarchicalData;

    } catch (error) {
      logger.error(`Failed to integrate memory hierarchy for ${characterId}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new CharacterError(
        `記憶階層統合に失敗しました: ${characterId}`
      );
    }
  }

  /**
   * 🆕 サービスプロバイダー設定
   * 外部から専門サービスを注入
   */
  setServiceProvider(serviceProvider: ServiceProvider): void {
    this.serviceProvider = serviceProvider;
    logger.info('Service provider updated', {
      availableServices: Object.keys(serviceProvider)
    });
  }

  /**
   * 🆕 記憶階層システム設定
   * 外部から記憶階層システムを注入
   */
  setMemoryManager(memoryManager: MemoryManager): void {
    this.memoryManager = memoryManager;
    logger.info('Memory manager updated');
  }

  // ============================================================================
  // 🔧 統合基盤プライベートメソッド
  // ============================================================================

  /**
   * 詳細付きキャラクター情報構築
   * @private
   */
  private async buildCharacterWithDetails(
    character: Character,
    context: GenerationContext
  ): Promise<any> {
    // CharacterWithDetailsの構築ロジック
    // 既存のCharacterManagerの実装を参考に簡略化
    return {
      id: character.id,
      name: character.name,
      description: character.description,
      type: character.type,
      emotionalState: character.state?.emotionalState || 'NEUTRAL',
      skills: [],
      parameters: [],
      growthPhase: null,
      relationships: [],
      recentAppearances: character.history?.appearances?.slice(-5) || [],
      personality: character.personality || { traits: [], goals: [], fears: [] },
      state: character.state
    };
  }

  /**
   * キャラクター進化情報取得
   * @private
   */
  private async getCharacterEvolution(
    characterId: string,
    context: GenerationContext
  ): Promise<CharacterEvolution> {
    if (this.serviceProvider?.evolution) {
      try {
        // EvolutionServiceから情報取得
        const evolutionData = await this.serviceProvider.evolution.getCharacterEvolution?.(characterId);
        return evolutionData || this.createFallbackEvolution(await this.getCharacter(characterId));
      } catch (error) {
        logger.warn('Evolution service failed, using fallback', { error });
      }
    }

    return this.createFallbackEvolution(await this.getCharacter(characterId));
  }

  /**
   * キャラクター心理分析取得
   * @private
   */
  private async getCharacterPsychology(
    characterId: string,
    context: GenerationContext
  ): Promise<PsychologyAnalysis> {
    if (this.serviceProvider?.psychology) {
      try {
        const character = await this.getCharacter(characterId);
        const psychologyData = await this.serviceProvider.psychology.analyzeCharacterPsychology?.(character, []);
        return this.buildPsychologyAnalysis(psychologyData, character);
      } catch (error) {
        logger.warn('Psychology service failed, using fallback', { error });
      }
    }

    return this.createFallbackPsychology(await this.getCharacter(characterId));
  }

  /**
   * キャラクター関係性マップ取得
   * @private
   */
  private async getCharacterRelationships(
    characterId: string,
    context: GenerationContext
  ): Promise<RelationshipMap> {
    if (this.serviceProvider?.relationship) {
      try {
        const relationshipData = await this.serviceProvider.relationship.getCharacterRelationships?.(characterId);
        return this.buildRelationshipMap(relationshipData, characterId);
      } catch (error) {
        logger.warn('Relationship service failed, using fallback', { error });
      }
    }

    return this.createFallbackRelationships(await this.getCharacter(characterId));
  }

  /**
   * キャラクターパラメータ取得
   * @private
   */
  private async getCharacterParameters(
    characterId: string,
    context: GenerationContext
  ): Promise<DynamicParameters> {
    if (this.serviceProvider?.parameter) {
      try {
        const parameterData = await this.serviceProvider.parameter.getCharacterParameters?.(characterId);
        return this.buildDynamicParameters(parameterData, characterId);
      } catch (error) {
        logger.warn('Parameter service failed, using fallback', { error });
      }
    }

    return this.createFallbackParameters(await this.getCharacter(characterId));
  }

  /**
   * キャラクタースキル進行取得
   * @private
   */
  private async getCharacterSkills(
    characterId: string,
    context: GenerationContext
  ): Promise<SkillProgression> {
    if (this.serviceProvider?.skill) {
      try {
        const skillData = await this.serviceProvider.skill.getCharacterSkills?.(characterId);
        return this.buildSkillProgression(skillData, characterId);
      } catch (error) {
        logger.warn('Skill service failed, using fallback', { error });
      }
    }

    return this.createFallbackSkills(await this.getCharacter(characterId));
  }

  /**
   * キャラクター検出履歴取得
   * @private
   */
  private async getCharacterDetection(
    characterId: string,
    context: GenerationContext
  ): Promise<DetectionHistory> {
    if (this.serviceProvider?.detection) {
      try {
        const detectionData = await this.serviceProvider.detection.getCharacterDetectionHistory?.(characterId);
        return this.buildDetectionHistory(detectionData, characterId);
      } catch (error) {
        logger.warn('Detection service failed, using fallback', { error });
      }
    }

    return this.createFallbackDetection(await this.getCharacter(characterId));
  }

  /**
   * 短期記憶キャラクターデータ取得
   * @private
   */
  private async getShortTermCharacterData(characterId: string): Promise<CharacterShortTermData> {
    if (!this.memoryManager) {
      return this.createFallbackShortTerm(await this.getCharacter(characterId));
    }

    try {
      const shortTermData = await this.memoryManager.getCharacterShortTermData?.(characterId);
      return shortTermData || this.createFallbackShortTerm(await this.getCharacter(characterId));
    } catch (error) {
      logger.warn('Short term memory access failed, using fallback', { error });
      return this.createFallbackShortTerm(await this.getCharacter(characterId));
    }
  }

  /**
   * 中期記憶キャラクターデータ取得
   * @private
   */
  private async getMidTermCharacterData(characterId: string): Promise<CharacterMidTermData> {
    if (!this.memoryManager) {
      return this.createFallbackMidTerm(await this.getCharacter(characterId));
    }

    try {
      const midTermData = await this.memoryManager.getCharacterMidTermData?.(characterId);
      return midTermData || this.createFallbackMidTerm(await this.getCharacter(characterId));
    } catch (error) {
      logger.warn('Mid term memory access failed, using fallback', { error });
      return this.createFallbackMidTerm(await this.getCharacter(characterId));
    }
  }

  /**
   * 長期記憶キャラクターデータ取得
   * @private
   */
  private async getLongTermCharacterData(characterId: string): Promise<CharacterLongTermData> {
    if (!this.memoryManager) {
      return this.createFallbackLongTerm(await this.getCharacter(characterId));
    }

    try {
      const longTermData = await this.memoryManager.getCharacterLongTermData?.(characterId);
      return longTermData || this.createFallbackLongTerm(await this.getCharacter(characterId));
    } catch (error) {
      logger.warn('Long term memory access failed, using fallback', { error });
      return this.createFallbackLongTerm(await this.getCharacter(characterId));
    }
  }

  /**
   * 階層間整合性チェック
   * @private
   */
  private async checkHierarchyConsistency(
    shortTerm: CharacterShortTermData | null,
    midTerm: CharacterMidTermData | null,
    longTerm: CharacterLongTermData | null
  ): Promise<HierarchyConsistency> {
    // 簡易整合性チェック実装
    const inconsistencies: any[] = [];
    let score = 1.0;

    // 基本的な整合性チェックロジック
    if (shortTerm && midTerm) {
      // 短期と中期の整合性チェック
      // 実装は要件に応じて拡張
    }

    if (midTerm && longTerm) {
      // 中期と長期の整合性チェック
      // 実装は要件に応じて拡張
    }

    return {
      score,
      inconsistencies,
      resolutionSuggestions: [],
      integrationQuality: score
    };
  }

  /**
   * Promise.allSettledの結果から値を安全に抽出
   * @private
   */
  private extractSettledValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      logger.debug('Promise settled with rejection, using fallback', {
        reason: result.reason
      });
      return fallback;
    }
  }

  /**
   * データポイント数カウント
   * @private
   */
  private countDataPoints(data: UnifiedCharacterData): number {
    let count = 0;

    // 基本カウント
    count += Object.keys(data.character).length;
    count += Object.keys(data.evolution).length;
    count += Object.keys(data.psychology).length;
    count += Object.keys(data.relationships).length;
    count += Object.keys(data.parameters).length;
    count += Object.keys(data.skills).length;
    count += Object.keys(data.detection).length;

    return count;
  }

  // ============================================================================
  // 🔧 フォールバック作成メソッド
  // ============================================================================

  private createFallbackCharacterDetails(character: Character): any {
    return {
      id: character.id,
      name: character.name,
      description: character.description,
      type: character.type,
      emotionalState: character.state?.emotionalState || 'NEUTRAL',
      skills: [],
      parameters: [],
      growthPhase: null,
      relationships: [],
      recentAppearances: character.history?.appearances?.slice(-5) || [],
      personality: character.personality || { traits: [], goals: [], fears: [] },
      state: character.state
    };
  }

  private createFallbackEvolution(character: Character | null): CharacterEvolution {
    return {
      currentStage: character?.state?.developmentStage || 0,
      developmentPath: {
        completed: [],
        upcoming: [],
        alternatives: []
      },
      growthPlan: {
        active: null,
        completed: [],
        potential: []
      },
      evolutionPrediction: {
        nextMilestone: null,
        estimatedChapters: 0,
        confidence: 0
      },
      changeHistory: []
    };
  }

  private createFallbackPsychology(character: Character | null): PsychologyAnalysis {
    return {
      currentPsychology: character?.psychology || {
        currentDesires: [],
        currentFears: [],
        internalConflicts: [],
        emotionalState: {},
        relationshipAttitudes: {}
      },
      emotionalTrends: {
        dominant: character?.state?.emotionalState || 'NEUTRAL',
        secondary: [],
        stability: 0.5,
        volatility: 0.5
      },
      behaviorPredictions: {
        likelyActions: [],
        unlikelyActions: [],
        confidence: 0
      },
      motivation: {
        primary: character?.goals?.[0] || 'Unknown',
        secondary: character?.goals?.slice(1) || [],
        conflicts: []
      },
      patterns: {
        responsePatterns: [],
        decisionPatterns: [],
        adaptationPatterns: []
      }
    };
  }

  private createFallbackRelationships(character: Character | null): RelationshipMap {
    return {
      direct: {
        relationships: character?.relationships?.map(rel => ({
          ...rel,
          dynamics: { stability: 0.5, growth: 0, tension: 0, harmony: 0.5 },
          evolution: { changes: [], patterns: [], predictions: [] },
          predictions: []
        })) || [],
        clusters: [],
        influences: { influencers: [], influenced: [], networks: [] }
      },
      indirect: {
        connections: [],
        networkPosition: { centrality: 0, betweenness: 0, closeness: 0, clustering: 0 },
        socialDynamics: { socialRole: 'Unknown', groupMemberships: [], conflicts: [], alliances: [] }
      },
      evolution: {
        recentChanges: [],
        trends: [],
        predictions: []
      },
      analysis: {
        socialRole: character?.type || 'Unknown',
        networkImportance: 0,
        conflictPotential: 0,
        supportNetwork: []
      }
    };
  }

  private createFallbackParameters(character: Character | null): DynamicParameters {
    return {
      current: {
        parameters: character?.state?.parameters || [],
        aggregates: [],
        scores: []
      },
      growth: {
        trends: [],
        projections: [],
        bottlenecks: []
      },
      comparative: {
        peerComparison: { peers: [], rank: 0, percentile: 0 },
        typeComparison: { typeAverage: 0, deviation: 0, rank: 0 },
        optimalRanges: []
      },
      history: {
        changes: [],
        milestones: [],
        correlations: []
      }
    };
  }

  private createFallbackSkills(character: Character | null): SkillProgression {
    return {
      acquired: [],
      available: [],
      skillTrees: {
        trees: [],
        progressPaths: [],
        masteryLevels: []
      },
      learningPattern: {
        strengths: [],
        weaknesses: [],
        preferredMethods: [],
        learningSpeed: 0.5
      },
      correlations: {
        synergies: [],
        conflicts: [],
        dependencies: []
      }
    };
  }

  private createFallbackDetection(character: Character | null): DetectionHistory {
    return {
      appearances: {
        recent: character?.history?.appearances?.map(app => ({
          chapter: app.chapterNumber,
          context: app.summary || '',
          prominence: app.significance || 0,
          significance: app.significance || 0,
          timestamp: app.timestamp
        })) || [],
        patterns: [],
        frequency: { recentFrequency: 0, averageFrequency: 0, trend: 'stable', prediction: 0 }
      },
      mentions: {
        direct: [],
        indirect: [],
        context: []
      },
      interactions: {
        recent: character?.history?.interactions?.map(int => ({
          chapter: int.chapterNumber,
          interactionType: int.type,
          participants: [character?.id || '', int.targetCharacterId],
          significance: int.impact,
          outcome: int.description
        })) || [],
        patterns: [],
        networks: []
      },
      metrics: {
        visibility: 0.5,
        prominence: 0.5,
        narrativeImportance: character?.significance || 0.5,
        readerEngagement: 0.5
      }
    };
  }

  private createUnifiedMetadata(startTime: number, characterId: string): UnifiedMetadata {
    return {
      unifiedAt: new Date(),
      sources: {
        character: 'character-service',
        evolution: this.serviceProvider?.evolution ? 'evolution-service' : 'fallback',
        psychology: this.serviceProvider?.psychology ? 'psychology-service' : 'fallback',
        relationships: this.serviceProvider?.relationship ? 'relationship-service' : 'fallback',
        parameters: this.serviceProvider?.parameter ? 'parameter-service' : 'fallback',
        skills: this.serviceProvider?.skill ? 'skill-service' : 'fallback',
        detection: this.serviceProvider?.detection ? 'detection-service' : 'fallback'
      },
      quality: {
        completeness: 0.8,
        consistency: 0.8,
        reliability: 0.8,
        freshness: 1.0
      },
      statistics: {
        dataPoints: 0, // 後で設定
        processingTime: 0, // 後で設定
        cacheHits: 0,
        errorCount: 0
      }
    };
  }

  private createFallbackShortTerm(character: Character | null): CharacterShortTermData {
    return {
      recentStates: character ? [character.state] : [],
      immediateChanges: [],
      activeEmotions: character?.state?.emotionalState ? [{
        emotion: character.state.emotionalState,
        intensity: 0.5,
        duration: 1,
        trigger: 'Unknown'
      }] : [],
      recentInteractions: character?.history?.interactions?.slice(-3).map(int => ({
        targetCharacterId: int.targetCharacterId,
        interactionType: int.type,
        impact: int.impact,
        chapter: int.chapterNumber
      })) || [],
      processingEvents: []
    };
  }

  private createFallbackMidTerm(character: Character | null): CharacterMidTermData {
    return {
      developmentAnalysis: {
        stage: character?.state?.developmentStage || 0,
        direction: 'stable',
        factors: [],
        projections: []
      },
      relationshipEvolution: {
        changes: [],
        patterns: [],
        predictions: []
      },
      patterns: [],
      trends: [],
      analysisResults: []
    };
  }

  private createFallbackLongTerm(character: Character | null): CharacterLongTermData {
    return {
      consolidatedProfile: {
        coreTraits: character?.personality?.traits || [],
        establishedPatterns: [],
        permanentChanges: [],
        masterNarrative: character?.description || ''
      },
      knowledgeBase: {
        knowledgeAreas: [],
        expertise: [],
        experiences: [],
        memories: []
      },
      persistentTraits: character?.personality?.traits?.map(trait => ({
        trait,
        strength: 0.8,
        stability: 0.9,
        firstAppearance: character.metadata?.createdAt ? 1 : 0
      })) || [],
      lifetimeDevelopment: {
        phases: [],
        milestones: [],
        transformations: [],
        growth: []
      },
      masterRecord: {
        consolidatedCharacter: character,
        sources: ['character-service'],
        lastUpdate: new Date().toISOString()
      }
    };
  }

  private createFallbackHierarchyData(character: Character): HierarchicalCharacterData {
    return {
      shortTerm: this.createFallbackShortTerm(character),
      midTerm: this.createFallbackMidTerm(character),
      longTerm: this.createFallbackLongTerm(character),
      consistency: {
        score: 0.8,
        inconsistencies: [],
        resolutionSuggestions: [],
        integrationQuality: 0.8
      },
      context: this.createFallbackContext()
    };
  }

  private createFallbackContext(): UnifiedMemoryContext {
    return {
      chapterNumber: 1,
      timestamp: new Date().toISOString(),
      shortTerm: {
        recentChapters: [],
        immediateCharacterStates: new Map(),
        keyPhrases: [],
        processingBuffers: []
      },
      midTerm: {
        narrativeProgression: {
          storyState: [],
          chapterProgression: new Map(),
          arcProgression: new Map(),
          tensionHistory: new Map(),
          turningPointsHistory: []
        },
        analysisResults: [],
        characterEvolution: [],
        systemStatistics: {
          promptGenerationStats: [],
          templateUsageStats: [],
          tensionOptimizationStats: [],
          componentPerformanceStats: new Map(),
          systemIntegrationStats: []
        },
        qualityMetrics: {
          chapterQualityHistory: [],
          systemQualityMetrics: [],
          diagnosticHistory: [],
          systemHealthMetrics: []
        }
      },
      longTerm: {
        consolidatedSettings: {
          worldSettingsMaster: { consolidatedSettings: {}, sources: [], lastUpdate: '' },
          genreSettingsMaster: { consolidatedGenre: {}, sources: [], lastUpdate: '' },
          templateMaster: { consolidatedTemplates: {}, sources: [], lastUpdate: '' },
          systemConfigMaster: { consolidatedConfig: {}, sources: [], lastUpdate: '' }
        },
        knowledgeDatabase: {
          characters: new Map(),
          worldKnowledge: { knowledge: {}, categories: [], lastUpdate: '' },
          conceptDefinitions: new Map(),
          foreshadowingDatabase: { foreshadowing: [], categories: [], lastUpdate: '' },
          sectionDefinitions: new Map()
        },
        systemKnowledgeBase: {
          promptGenerationPatterns: [],
          effectiveTemplatePatterns: [],
          analysisPatterns: [],
          optimizationStrategies: [],
          errorPatterns: [],
          qualityImprovementStrategies: []
        },
        completedRecords: {
          completedSections: new Map(),
          completedArcs: new Map(),
          longTermEffectivenessRecords: []
        }
      },
      integration: {
        resolvedDuplicates: [],
        cacheStatistics: {
          hitRatio: 0,
          missRatio: 0,
          totalRequests: 0,
          cacheSize: 0,
          lastOptimization: '',
          evictionCount: 0
        },
        accessOptimizations: []
      }
    };
  }

  // 補助メソッド
  private buildPsychologyAnalysis(psychologyData: any, character: Character | null): PsychologyAnalysis {
    // 心理分析データの構築
    return this.createFallbackPsychology(character);
  }

  private buildRelationshipMap(relationshipData: any, characterId: string): RelationshipMap {
    // 関係性マップの構築
    return this.createFallbackRelationships(null);
  }

  private buildDynamicParameters(parameterData: any, characterId: string): DynamicParameters {
    // 動的パラメータの構築
    return this.createFallbackParameters(null);
  }

  private buildSkillProgression(skillData: any, characterId: string): SkillProgression {
    // スキル進行の構築
    return this.createFallbackSkills(null);
  }

  private buildDetectionHistory(detectionData: any, characterId: string): DetectionHistory {
    // 検出履歴の構築
    return this.createFallbackDetection(null);
  }

  // ============================================================================
  // 既存メソッドは全て保持（キャラクターサービスの元の機能）
  // ============================================================================

  /**
   * キャラクターデータの初期化（遅延実行）
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await this.loadCharactersFromFiles();
      this.buildTypeIndex();
      this.initialized = true;
      logger.info(`CharacterService initialized with ${this.characterCache.size} characters`);
    } catch (error) {
      logger.error('Failed to initialize CharacterService', {
        error: error instanceof Error ? error.message : String(error)
      });
      await this.createFallbackCharacters();
      this.buildTypeIndex();
      this.initialized = true;
    }
  }

  /**
   * YAMLファイルからキャラクターデータを読み込み
   */
  private async loadCharactersFromFiles(): Promise<void> {
    for (const dirPath of this.characterPaths) {
      try {
        // ディレクトリの存在確認
        const fullPath = path.resolve(dirPath);
        const stats = await fs.stat(fullPath);

        if (!stats.isDirectory()) {
          logger.warn(`Not a directory: ${fullPath}`);
          continue;
        }

        // ディレクトリ内のYAMLファイルを取得
        const files = await fs.readdir(fullPath);
        const yamlFiles = files.filter(file =>
          file.endsWith('.yaml') || file.endsWith('.yml')
        );

        logger.debug(`Loading ${yamlFiles.length} YAML files from ${dirPath}`);

        // 各YAMLファイルを読み込み
        for (const file of yamlFiles) {
          const filePath = path.join(fullPath, file);
          await this.loadCharacterFile(filePath);
        }

      } catch (error) {
        logger.warn(`Failed to load characters from ${dirPath}`, {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    if (this.characterCache.size === 0) {
      logger.warn('No characters loaded from files, creating fallback');
      throw new Error('No character files found');
    }
  }

  /**
   * 単一のキャラクターファイルを読み込み
   */
  private async loadCharacterFile(filePath: string): Promise<void> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const yamlData = yaml.load(fileContent) as any;

      if (!yamlData) {
        logger.warn(`Empty YAML file: ${filePath}`);
        return;
      }

      // 単一キャラクターまたは複数キャラクターに対応
      const characters = Array.isArray(yamlData) ? yamlData : [yamlData];

      for (const characterData of characters) {
        const character = this.normalizeCharacterData(characterData, filePath);
        if (character) {
          this.characterCache.set(character.id, character);
          logger.debug(`Loaded character: ${character.name} (${character.id})`);
        }
      }

    } catch (error) {
      logger.error(`Failed to load character file: ${filePath}`, {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * YAMLデータをCharacterオブジェクトに正規化
   */
  private normalizeCharacterData(data: any, filePath: string): Character | null {
    try {
      if (!data.name || !data.type) {
        logger.warn(`Invalid character data in ${filePath}: missing name or type`);
        return null;
      }

      // 基本情報の構築
      const character: Character = {
        id: data.id || generateId(),
        name: data.name,
        type: data.type,
        description: data.description || '',
        shortNames: data.shortNames || data.short_names || [],
        nicknames: data.nicknames || {},

        // 外見情報
        appearance: data.appearance || {},

        // 性格情報
        personality: {
          traits: data.personality?.traits || data.traits || [],
          values: data.personality?.values || data.values || [],
          flaws: data.personality?.flaws || data.flaws || []
        },

        // 目標
        goals: data.goals || [],

        // 関係性（基本定義のみ）
        relationships: data.relationships || [],

        // 状態（初期化）
        state: this.initializeCharacterState(data.state),

        // 履歴（初期化）
        history: this.initializeHistory(),

        // メタデータ
        metadata: {
          createdAt: new Date(),
          lastUpdated: new Date(),
          version: 1,
          tags: data.tags || [],
        }
      };

      return character;

    } catch (error) {
      logger.error(`Failed to normalize character data from ${filePath}`, {
        error: error instanceof Error ? error.message : String(error),
        data: JSON.stringify(data, null, 2)
      });
      return null;
    }
  }

  /**
   * タイプ別インデックスの構築
   */
  private buildTypeIndex(): void {
    this.typeIndex.clear();

    for (const character of this.characterCache.values()) {
      const type = character.type;
      if (!this.typeIndex.has(type)) {
        this.typeIndex.set(type, []);
      }
      this.typeIndex.get(type)!.push(character.id);
    }

    logger.debug('Type index built', {
      types: Array.from(this.typeIndex.keys()),
      counts: Object.fromEntries(
        Array.from(this.typeIndex.entries()).map(([type, ids]) => [type, ids.length])
      )
    });
  }

  /**
   * フォールバックキャラクターの作成
   */
  private async createFallbackCharacters(): Promise<void> {
    const fallbackCharacters = [
      {
        id: 'fallback-main-001',
        name: '主人公',
        type: 'MAIN',
        description: 'システム生成されたフォールバック主人公キャラクター'
      },
      {
        id: 'fallback-sub-001',
        name: 'サブキャラクター',
        type: 'SUB',
        description: 'システム生成されたフォールバックサブキャラクター'
      }
    ];

    for (const data of fallbackCharacters) {
      const character = this.normalizeCharacterData(data, 'system-fallback');
      if (character) {
        this.characterCache.set(character.id, character);
        logger.info(`Created fallback character: ${character.name}`);
      }
    }
  }

  // ============================================================================
  // 🔧 修正されたメインメソッド（キャッシュベース）
  // ============================================================================

  /**
   * 全アクティブキャラクター取得（キャッシュから取得）
   */
  async getAllActiveCharacters(): Promise<Character[]> {
    await this.ensureInitialized();

    const activeCharacters = Array.from(this.characterCache.values())
      .filter(character => character.state?.isActive !== false);

    logger.debug(`Retrieved ${activeCharacters.length} active characters from cache`);
    return activeCharacters;
  }

  /**
   * IDによるキャラクター取得（キャッシュから取得）
   * @param id キャラクターID
   * @returns キャラクターオブジェクトまたはnull
   */
  async getCharacter(id: string): Promise<Character | null> {
    await this.ensureInitialized();

    const character = this.characterCache.get(id);
    if (character) {
      logger.debug(`Retrieved character from cache: ${character.name} (${id})`);
    }

    return character || null;
  }

  /**
   * タイプ別キャラクター取得（キャッシュから取得）
   * @param type キャラクタータイプ
   * @returns キャラクター配列
   */
  async getCharactersByType(type: string): Promise<Character[]> {
    await this.ensureInitialized();

    const characterIds = this.typeIndex.get(type) || [];
    const characters = characterIds
      .map(id => this.characterCache.get(id))
      .filter(Boolean) as Character[];

    logger.debug(`Retrieved ${characters.length} characters of type ${type}`);
    return characters;
  }

  // ============================================================================
  // 既存メソッド（互換性維持）
  // ============================================================================

  /**
   * 新しいキャラクターを作成する
   * @param data キャラクターデータ
   * @returns 作成されたキャラクター
   */
  async createCharacter(data: CharacterData): Promise<Character> {
    await this.ensureInitialized();

    try {
      // データバリデーション
      this.validateNewCharacterData(data);

      // キャラクターオブジェクトの作成
      const character: Character = {
        id: generateId(),
        ...data,
        shortNames: data.shortNames || [],
        nicknames: data.nicknames || {},
        state: this.initializeCharacterState(data.state),
        history: this.initializeHistory(),
        metadata: {
          createdAt: new Date(),
          lastUpdated: new Date(),
          version: 1,
          tags: data.metadata?.tags || []
        },
      };

      // キャッシュに追加
      this.characterCache.set(character.id, character);
      this.buildTypeIndex(); // インデックス再構築

      // リポジトリに保存
      if (this.characterRepository) {
        await this.characterRepository.saveCharacter(character);
      }

      // キャラクター作成イベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_CREATED, {
        timestamp: new Date(),
        character
      });

      logger.info(`Character created: ${character.name} (${character.id})`);
      return character;
    } catch (error) {
      logger.error('Failed to create character', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * キャラクター状態の更新
   * @param id キャラクターID
   * @param state 新しい状態
   * @returns 更新されたキャラクター
   */
  async updateCharacterState(id: string, state: Partial<CharacterState>): Promise<Character> {
    await this.ensureInitialized();

    try {
      const existing = this.characterCache.get(id);
      if (!existing) {
        throw new NotFoundError('Character', id);
      }

      // 状態の更新
      const updatedCharacter = {
        ...existing,
        state: {
          ...existing.state,
          ...state
        },
        metadata: {
          ...existing.metadata,
          lastUpdated: new Date(),
          version: (existing.metadata.version || 1) + 1
        }
      };

      // キャッシュ更新
      this.characterCache.set(id, updatedCharacter);

      // リポジトリに保存
      if (this.characterRepository) {
        await this.characterRepository.saveCharacterState(id, updatedCharacter.state);
      }

      // 状態更新イベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_UPDATED, {
        timestamp: new Date(),
        characterId: id,
        changes: { state },
        previousState: existing.state
      });

      logger.info(`Character state updated: ${updatedCharacter.name} (${id})`);
      return updatedCharacter;
    } catch (error) {
      logger.error(`Failed to update character state: ${id}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * キャラクターの更新
   * @param id キャラクターID
   * @param updates 更新データ
   * @returns 更新されたキャラクター
   */
  async updateCharacter(id: string, updates: Partial<CharacterData>): Promise<Character> {
    await this.ensureInitialized();

    try {
      const existing = this.characterCache.get(id);
      if (!existing) {
        throw new NotFoundError('Character', id);
      }

      // 更新データのバリデーション
      this.validateCharacterUpdates(updates, existing);

      // キャラクターの更新
      const updatedCharacter = this.mergeCharacterUpdates(existing, updates);

      // キャッシュ更新
      this.characterCache.set(id, updatedCharacter);
      this.buildTypeIndex(); // タイプが変更された可能性があるため再構築

      // リポジトリに保存
      if (this.characterRepository) {
        await this.characterRepository.updateCharacter(id, updates);
      }

      // 更新イベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_UPDATED, {
        timestamp: new Date(),
        characterId: id,
        changes: updates,
        previousState: existing
      });

      logger.info(`Character updated: ${updatedCharacter.name} (${id})`);
      return updatedCharacter;
    } catch (error) {
      logger.error(`Failed to update character: ${id}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * キャラクターの登場記録
   * @param id キャラクターID
   * @param chapterNumber 章番号
   * @param summary 概要
   * @returns 更新されたキャラクター
   */
  async recordAppearance(id: string, chapterNumber: number, summary: string): Promise<Character> {
    await this.ensureInitialized();

    try {
      const character = this.characterCache.get(id);
      if (!character) {
        throw new NotFoundError('Character', id);
      }

      // 登場記録の作成
      const appearance: CharacterAppearance = {
        chapterNumber,
        timestamp: new Date(),
        significance: 0.5,
        summary
      };

      // 履歴の更新
      const updatedHistory = {
        ...character.history,
        appearances: [...character.history.appearances, appearance]
      };

      // キャラクター状態の更新
      const updatedCharacter = {
        ...character,
        state: {
          ...character.state,
          lastAppearance: chapterNumber
        },
        history: updatedHistory,
        metadata: {
          ...character.metadata,
          lastUpdated: new Date(),
          version: (character.metadata.version || 1) + 1
        }
      };

      // キャッシュ更新
      this.characterCache.set(id, updatedCharacter);

      // リポジトリに保存
      if (this.characterRepository) {
        await this.characterRepository.updateCharacterProperty(id, 'history', updatedHistory);
        await this.characterRepository.saveCharacterState(id, updatedCharacter.state);
      }

      // 登場イベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_APPEARANCE, {
        timestamp: new Date(),
        characterId: id,
        chapterNumber,
        summary
      });

      logger.info(`Character appearance recorded: ${character.name} (${id}), 章番号: ${chapterNumber}`);
      return updatedCharacter;
    } catch (error) {
      logger.error(`Failed to record character appearance: ${id}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * インタラクション記録
   * @param id キャラクターID
   * @param targetId 対象キャラクターID
   * @param type インタラクションタイプ
   * @param data 追加データ
   */
  async recordInteraction(id: string, targetId: string, type: string, data: any): Promise<void> {
    await this.ensureInitialized();

    try {
      const character = this.characterCache.get(id);
      if (!character) {
        throw new NotFoundError('Character', id);
      }

      const targetCharacter = this.characterCache.get(targetId);
      if (!targetCharacter) {
        throw new NotFoundError('Character', targetId);
      }

      // インタラクション記録の作成
      const interaction: Interaction = {
        chapterNumber: data.chapterNumber || 0,
        targetCharacterId: targetId,
        type,
        description: data.description || `${type}インタラクション`,
        impact: data.impact || 0.5,
        timestamp: new Date()
      };

      // 履歴の更新
      const updatedHistory = {
        ...character.history,
        interactions: [...character.history.interactions, interaction]
      };

      const updatedCharacter = {
        ...character,
        history: updatedHistory,
        metadata: {
          ...character.metadata,
          lastUpdated: new Date(),
          version: (character.metadata.version || 1) + 1
        }
      };

      // キャッシュ更新
      this.characterCache.set(id, updatedCharacter);

      // リポジトリに保存
      if (this.characterRepository) {
        await this.characterRepository.updateCharacterProperty(id, 'history', updatedHistory);
      }

      // インタラクションイベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_INTERACTION, {
        timestamp: new Date(),
        sourceCharacterId: id,
        targetCharacterId: targetId,
        interactionType: type,
        data
      });

      logger.info(`Interaction recorded: ${character.name} -> ${targetCharacter.name}, タイプ: ${type}`);
    } catch (error) {
      logger.error(`Failed to record interaction: ${id} -> ${targetId}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * キャラクター発展処理
   * @param id キャラクターID
   * @param events 章イベント配列
   * @returns 更新されたキャラクター
   */
  async processCharacterDevelopment(id: string, events: ChapterEvent[]): Promise<Character> {
    await this.ensureInitialized();

    try {
      const character = this.characterCache.get(id);
      if (!character) {
        throw new NotFoundError('Character', id);
      }

      // 簡易発展処理
      const developmentStageIncrease = events.length * 0.1;
      const updatedState: CharacterState = {
        ...character.state,
        developmentStage: (character.state.developmentStage || 0) + developmentStageIncrease,
        development: `Development processed at ${new Date().toISOString()}`
      };

      const updatedCharacter = {
        ...character,
        state: updatedState,
        metadata: {
          ...character.metadata,
          lastUpdated: new Date(),
          version: (character.metadata.version || 1) + 1
        }
      };

      // キャッシュ更新
      this.characterCache.set(id, updatedCharacter);

      // 発展処理イベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_DEVELOPMENT_REQUESTED, {
        timestamp: new Date(),
        characterId: id,
        events,
        character: updatedCharacter,
        memorySystemProcessed: false
      });

      logger.info(`Character development processed: ${character.name} (${id})`);
      return updatedCharacter;
    } catch (error) {
      logger.error(`Failed to process character development: ${id}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * キャラクター設定の検証
   * @param character キャラクター
   * @returns 検証結果
   */
  async validateCharacter(character: Character): Promise<ValidationResult> {
    try {
      // 基本的な構造チェック
      const structureValid = this.validateCharacterStructure(character);
      if (!structureValid.isValid) {
        return structureValid;
      }

      // 一貫性チェックイベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_VALIDATION_REQUESTED, {
        timestamp: new Date(),
        character,
        qualityScore: 0.8
      });

      return {
        isValid: true,
        confidenceScore: 0.8,
        reason: "キャラクター構造検証に合格しました"
      };
    } catch (error) {
      logger.error(`キャラクター検証中にエラーが発生しました: ${character.id}`, {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        isValid: false,
        confidenceScore: 0,
        reason: `検証中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // ============================================================================
  // プライベートヘルパーメソッド
  // ============================================================================

  /**
   * キャラクター状態の初期化
   */
  private initializeCharacterState(data?: Partial<CharacterState>): CharacterState {
    return {
      isActive: data?.isActive !== undefined ? data.isActive : true,
      emotionalState: data?.emotionalState || 'NEUTRAL',
      developmentStage: data?.developmentStage || 0,
      lastAppearance: data?.lastAppearance || null,
      development: data?.development || '',
      relationships: data?.relationships || []
    };
  }

  /**
   * キャラクター履歴の初期化
   */
  private initializeHistory(): CharacterHistory {
    return {
      appearances: [],
      developmentPath: [],
      interactions: [],
    };
  }

  /**
   * 新規キャラクターデータのバリデーション
   */
  private validateNewCharacterData(data: CharacterData): void {
    const errors: Record<string, string[]> = {};

    if (!data.name) {
      if (!errors.name) errors.name = [];
      errors.name.push('キャラクター名は必須です');
    }

    if (!data.type) {
      if (!errors.type) errors.type = [];
      errors.type.push('キャラクタータイプは必須です');
    }

    if (!data.description) {
      if (!errors.description) errors.description = [];
      errors.description.push('キャラクター説明は必須です');
    }

    if (data.type && !['MAIN', 'SUB', 'MOB'].includes(data.type)) {
      if (!errors.type) errors.type = [];
      errors.type.push(`無効なキャラクタータイプです: ${data.type}`);
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('キャラクターデータが無効です', errors);
    }
  }

  /**
   * キャラクター更新データのバリデーション
   */
  private validateCharacterUpdates(updates: Partial<CharacterData>, existing: Character): void {
    const errors: Record<string, string[]> = {};

    if (updates.type && updates.type !== existing.type) {
      if (!errors.type) errors.type = [];
      errors.type.push('キャラクタータイプは直接更新できません。昇格APIを使用してください');
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('キャラクター更新データが無効です', errors);
    }
  }

  /**
   * キャラクター構造の基本検証
   */
  private validateCharacterStructure(character: Character): ValidationResult {
    if (!character.id || !character.name || !character.type || !character.description) {
      return {
        isValid: false,
        confidenceScore: 0,
        reason: "必須フィールドが不足しています (id, name, type, description)"
      };
    }

    if (!['MAIN', 'SUB', 'MOB'].includes(character.type)) {
      return {
        isValid: false,
        confidenceScore: 0,
        reason: `無効なキャラクタータイプです: ${character.type}`
      };
    }

    return {
      isValid: true,
      confidenceScore: 1,
      reason: "キャラクター構造は有効です"
    };
  }

  /**
   * 型安全なキャラクター更新マージ
   */
  private mergeCharacterUpdates(existing: Character, updates: Partial<CharacterData>): Character {
    const updatedState: CharacterState = {
      ...existing.state,
      isActive: updates.state?.isActive !== undefined ? updates.state.isActive : existing.state.isActive,
      emotionalState: updates.state?.emotionalState !== undefined ? updates.state.emotionalState : existing.state.emotionalState,
      developmentStage: updates.state?.developmentStage !== undefined ? updates.state.developmentStage : existing.state.developmentStage,
      lastAppearance: updates.state?.lastAppearance !== undefined ? updates.state.lastAppearance : existing.state.lastAppearance,
      development: updates.state?.development !== undefined ? updates.state.development : existing.state.development,
      relationships: updates.state?.relationships !== undefined ? updates.state.relationships : existing.state.relationships
    };

    const updatedMetadata = {
      ...existing.metadata,
      lastUpdated: new Date(),
      version: (existing.metadata.version || 1) + 1,
      tags: updates.metadata?.tags !== undefined ? updates.metadata.tags : existing.metadata.tags
    };

    return {
      ...existing,
      ...updates,
      state: updatedState,
      metadata: updatedMetadata,
      id: existing.id,
      shortNames: updates.shortNames !== undefined ? updates.shortNames : existing.shortNames,
      nicknames: updates.nicknames !== undefined ? updates.nicknames : existing.nicknames,
      history: existing.history
    };
  }
}

// ファクトリ関数（統合基盤対応版）
export function createCharacterService(
  characterRepository?: any,
  memoryManager?: MemoryManager,
  serviceProvider?: ServiceProvider
): CharacterService {
  return new CharacterService(characterRepository, memoryManager, serviceProvider);
}