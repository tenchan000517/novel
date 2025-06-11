/**
 * Version 2.0 - Character Collector
 * 
 * キャラクター管理システムからの関連データ収集
 */

import { OperationResult } from '@/types/common';
import { 
  ICharacterManager,
  Character, 
  CharacterType, 
  MBTIProfile, 
  GrowthPlan,
  SearchCriteria,
  Relationship,
  CharacterStatistics,
  CharacterState
} from '@/systems/character/interfaces';
import { CharacterManager } from '@/systems/character/core/character-manager';
import { DataCoordinator } from '../core/data-coordinator';
import { SystemType } from '../types';

export interface ICharacterCollector {
  /**
   * 章生成に関連するキャラクターデータを収集
   */
  collectRelevantCharacters(chapterNumber: number, context: CharacterCollectionContext): Promise<OperationResult<CollectedCharacterData>>;
  
  /**
   * 特定のキャラクターの詳細情報を収集
   */
  collectCharacterDetails(characterIds: string[]): Promise<OperationResult<DetailedCharacterData[]>>;
  
  /**
   * キャラクター関係性データを収集
   */
  collectRelationships(characterIds: string[], chapterNumber: number): Promise<OperationResult<RelationshipData[]>>;
  
  /**
   * キャラクター成長データを収集
   */
  collectGrowthData(characterIds: string[], chapterNumber: number): Promise<OperationResult<CharacterGrowthData[]>>;
  
  /**
   * 章の主要キャラクターを特定・収集
   */
  collectMainCharactersForChapter(chapterNumber: number, criteria: ChapterCharacterCriteria): Promise<OperationResult<MainCharacterData[]>>;
}

export interface CharacterCollectionContext {
  chapterNumber: number;
  focusCharacters?: string[];
  includeRelationships: boolean;
  includeGrowthData: boolean;
  includePsychologyData: boolean;
  maxCharacters?: number;
  relevanceThreshold?: number;
  timeFrame?: {
    start: Date;
    end: Date;
  };
}

export interface CollectedCharacterData {
  mainCharacters: DetailedCharacterData[];
  supportingCharacters: DetailedCharacterData[];
  relationships: RelationshipData[];
  growthProgression: CharacterGrowthData[];
  psychologyInsights: PsychologyInsightData[];
  collectionMetadata: {
    totalCharacters: number;
    relationshipCount: number;
    averageRelevance: number;
    processingTime: number;
    dataCompleteness: number;
  };
}

export interface DetailedCharacterData {
  character: Character;
  mbtiProfile: MBTIProfile;
  currentState: CharacterState;
  relevanceScore: number;
  chapterRole: string;
  lastAppearance: number;
  developmentStage: string;
}

export interface RelationshipData {
  participantIds: string[];
  relationshipType: string;
  strength: number;
  dynamicType: string;
  lastInteraction: Date;
  chapterRelevance: number;
  conflictLevel: number;
  developmentDirection: 'improving' | 'deteriorating' | 'stable';
}

export interface RelationshipSnapshot {
  relationshipType?: string;
  currentStrength?: number;
  dynamicType?: string;
  lastUpdate?: string;
  conflictLevel?: number;
  evolutionTrend?: 'improving' | 'deteriorating' | 'stable';
}

export interface CharacterGrowthData {
  characterId: string;
  growthPlan: GrowthPlan;
  currentProgress: number;
  milestones: GrowthMilestone[];
  nextStages: string[];
  chapterContribution: number;
}

export interface GrowthMilestone {
  milestone: string;
  achieved: boolean;
  chapter: number;
  impact: number;
  description: string;
}

export interface PsychologyInsightData {
  characterId: string;
  mbtiType: string;
  personalityTraits: Record<string, number>;
  behaviorPatterns: string[];
  motivationalDrivers: string[];
  learningStyle: string;
  decisionMakingStyle: string;
  stressResponses: string[];
}

export interface ChapterCharacterCriteria {
  plotRelevance: number;
  emotionalImportance: number;
  developmentPotential: number;
  relationshipImpact: number;
  includeNewCharacters: boolean;
  maxMainCharacters: number;
}

export interface MainCharacterData {
  character: Character;
  chapterImportance: number;
  plotRole: string;
  emotionalArc: string;
  interactions: string[];
  developmentOpportunities: string[];
}

export class CharacterCollector implements ICharacterCollector {
  private characterManager: ICharacterManager;
  private dataCoordinator: DataCoordinator;
  private logger: any;

  constructor(characterManager?: ICharacterManager, dataCoordinator?: DataCoordinator, logger?: any) {
    // Data Coordinator経由で実際のCharacterManagerを取得
    this.dataCoordinator = dataCoordinator || new DataCoordinator();
    
    if (characterManager) {
      this.characterManager = characterManager;
    } else {
      // Data Coordinatorから実際のCharacterManagerを取得
      const characterConnection = this.dataCoordinator.getSystemConnections()
        .find(conn => conn.systemType === SystemType.CHARACTER);
      
      if (characterConnection?.isConnected) {
        this.characterManager = characterConnection.manager as ICharacterManager;
        this.logger?.info('Using real CharacterManager from DataCoordinator');
      } else {
        // フォールバック: 直接CharacterManagerインスタンスを作成
        this.characterManager = new CharacterManager();
        this.logger?.warn('Creating new CharacterManager instance as fallback');
      }
    }
    
    this.logger = logger || console;
  }

  // ============================================================================
  // パブリックメソッド
  // ============================================================================

  async collectRelevantCharacters(
    chapterNumber: number,
    context: CharacterCollectionContext
  ): Promise<OperationResult<CollectedCharacterData>> {
    const startTime = Date.now();
    
    try {
      this.logger.info(`Starting character collection for chapter ${chapterNumber}`, { context });

      // フェーズ1: 関連キャラクターの特定
      const relevantCharacterIds = await this.identifyRelevantCharacters(chapterNumber, context);
      this.logger.debug(`Identified ${relevantCharacterIds.length} relevant characters`);

      // フェーズ2: キャラクター詳細データの収集
      // Data Coordinator経由で最適化されたキャラクター取得
      this.logger.debug('Data Coordinator integration for character collection', {
        dataCoordinatorHealth: await this.dataCoordinator.healthCheck(),
        characterSystemStatus: this.dataCoordinator.getSystemConnections()
          .find(conn => conn.systemType === SystemType.CHARACTER)
      });

      const characterDetailsResult = await this.collectCharacterDetails(relevantCharacterIds);
      if (!characterDetailsResult.success) {
        throw new Error(`Character details collection failed: ${characterDetailsResult.error?.message}`);
      }

      // フェーズ3: 関係性データの収集
      let relationships: RelationshipData[] = [];
      if (context.includeRelationships) {
        const relationshipsResult = await this.collectRelationships(relevantCharacterIds, chapterNumber);
        if (relationshipsResult.success) {
          relationships = relationshipsResult.data!;
        }
      }

      // フェーズ4: 成長データの収集
      let growthProgression: CharacterGrowthData[] = [];
      if (context.includeGrowthData) {
        const growthResult = await this.collectGrowthData(relevantCharacterIds, chapterNumber);
        if (growthResult.success) {
          growthProgression = growthResult.data!;
        }
      }

      // フェーズ5: 心理分析データの収集
      let psychologyInsights: PsychologyInsightData[] = [];
      if (context.includePsychologyData) {
        psychologyInsights = await this.collectPsychologyInsights(relevantCharacterIds);
      }

      // フェーズ6: キャラクターの分類
      const { mainCharacters, supportingCharacters } = this.categorizeCharacters(
        characterDetailsResult.data!,
        chapterNumber,
        context
      );

      // フェーズ7: メタデータの生成
      const processingTime = Date.now() - startTime;
      const collectionMetadata = {
        totalCharacters: characterDetailsResult.data!.length,
        relationshipCount: relationships.length,
        averageRelevance: this.calculateAverageRelevance(characterDetailsResult.data!),
        processingTime,
        dataCompleteness: this.calculateDataCompleteness(context, characterDetailsResult.data!, relationships, growthProgression)
      };

      const collectedData: CollectedCharacterData = {
        mainCharacters,
        supportingCharacters,
        relationships,
        growthProgression,
        psychologyInsights,
        collectionMetadata
      };

      this.logger.info(`Character collection completed`, {
        chapterNumber,
        totalCharacters: collectionMetadata.totalCharacters,
        mainCharacters: mainCharacters.length,
        supportingCharacters: supportingCharacters.length,
        processingTime: `${processingTime}ms`
      });

      return {
        success: true,
        data: collectedData,
        metadata: {
          operationId: `character-collection-${chapterNumber}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'character-collector'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('Character collection failed', { chapterNumber, error, processingTime });

      return {
        success: false,
        error: {
          code: 'CHARACTER_COLLECTION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown character collection error',
          details: error
        },
        metadata: {
          operationId: `character-collection-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'character-collector'
        }
      };
    }
  }

  async collectCharacterDetails(characterIds: string[]): Promise<OperationResult<DetailedCharacterData[]>> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Collecting details for ${characterIds.length} characters`);

      const characterDetails: DetailedCharacterData[] = [];

      for (const characterId of characterIds) {
        try {
          // Data Coordinator経由での実際のCharacterManager使用
          this.logger.debug(`Retrieving character via real CharacterManager: ${characterId}`);
          const characterResult = await this.characterManager.getCharacter(characterId);
          if (!characterResult.success || !characterResult.data) {
            this.logger.warn(`Character not found: ${characterId}`);
            continue;
          }

          // MBTI プロファイルの取得（キャラクターから直接取得）
          const mbtiProfile = characterResult.data.mbtiProfile || this.createDefaultMBTIProfile();

          // 現在状態の取得
          const currentState = await this.getCurrentCharacterState(characterId);

          // 関連性スコアの計算
          const relevanceScore = this.calculateCharacterRelevance(characterResult.data, currentState);

          // 章での役割の決定
          const chapterRole = this.determineChapterRole(characterResult.data, currentState);

          // 最後の登場章の取得
          const lastAppearance = this.getLastAppearanceChapter(characterResult.data);

          // 開発段階の取得
          const developmentStage = this.getDevelopmentStage(characterResult.data);

          const detailedData: DetailedCharacterData = {
            character: characterResult.data,
            mbtiProfile,
            currentState,
            relevanceScore,
            chapterRole,
            lastAppearance,
            developmentStage
          };

          characterDetails.push(detailedData);

        } catch (characterError) {
          this.logger.warn(`Failed to collect details for character ${characterId}`, { characterError });
        }
      }

      const processingTime = Date.now() - startTime;

      this.logger.debug(`Collected details for ${characterDetails.length} characters`, {
        processingTime: `${processingTime}ms`
      });

      return {
        success: true,
        data: characterDetails,
        metadata: {
          operationId: `character-details-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'character-collector'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('Character details collection failed', { characterIds, error, processingTime });

      return {
        success: false,
        error: {
          code: 'CHARACTER_DETAILS_FAILED',
          message: error instanceof Error ? error.message : 'Unknown character details error',
          details: error
        },
        metadata: {
          operationId: `character-details-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'character-collector'
        }
      };
    }
  }

  async collectRelationships(
    characterIds: string[],
    chapterNumber: number
  ): Promise<OperationResult<RelationshipData[]>> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Collecting relationships for ${characterIds.length} characters`);

      const relationships: RelationshipData[] = [];

      // 全キャラクター間の関係性をチェック
      for (let i = 0; i < characterIds.length; i++) {
        for (let j = i + 1; j < characterIds.length; j++) {
          const characterId1 = characterIds[i];
          const characterId2 = characterIds[j];

          try {
            // 関係性データの取得
            const character1 = await this.characterManager.getCharacter(characterId1);
            
            if (character1.success && character1.data) {
              const relationship = character1.data.relationships.get(characterId2);
              
              if (relationship) {
                const relationshipSnapshot: RelationshipSnapshot = {
                  relationshipType: relationship.type,
                  currentStrength: relationship.strength,
                  dynamicType: relationship.evolutionTrend,
                  lastUpdate: relationship.lastInteraction.toISOString(),
                  conflictLevel: relationship.conflictLevel
                };

                // RelationshipDataへの変換
                const relationshipData: RelationshipData = {
                  participantIds: [characterId1, characterId2],
                  relationshipType: relationshipSnapshot.relationshipType || 'unknown',
                  strength: relationshipSnapshot.currentStrength || 0.5,
                  dynamicType: relationshipSnapshot.dynamicType || 'stable',
                  lastInteraction: new Date(relationshipSnapshot.lastUpdate || Date.now()),
                  chapterRelevance: this.calculateRelationshipChapterRelevance(relationshipSnapshot, chapterNumber),
                  conflictLevel: relationshipSnapshot.conflictLevel || 0,
                  developmentDirection: this.determineRelationshipDirection(relationshipSnapshot)
                };

                relationships.push(relationshipData);
              }
            }

          } catch (relationshipError) {
            this.logger.warn(`Failed to get relationship between ${characterId1} and ${characterId2}`, { relationshipError });
          }
        }
      }

      const processingTime = Date.now() - startTime;

      this.logger.debug(`Collected ${relationships.length} relationships`, {
        processingTime: `${processingTime}ms`
      });

      return {
        success: true,
        data: relationships,
        metadata: {
          operationId: `relationships-collection-${chapterNumber}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'character-collector'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('Relationships collection failed', { characterIds, chapterNumber, error, processingTime });

      return {
        success: false,
        error: {
          code: 'RELATIONSHIPS_COLLECTION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown relationships collection error',
          details: error
        },
        metadata: {
          operationId: `relationships-collection-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'character-collector'
        }
      };
    }
  }

  async collectGrowthData(
    characterIds: string[],
    chapterNumber: number
  ): Promise<OperationResult<CharacterGrowthData[]>> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Collecting growth data for ${characterIds.length} characters`);

      const growthData: CharacterGrowthData[] = [];

      for (const characterId of characterIds) {
        try {
          // 成長計画の取得
          const characterResult = await this.characterManager.getCharacter(characterId);
          
          if (characterResult.success && characterResult.data) {
            const growthPlan = characterResult.data.growthPlan;

            // 成長進捗の計算
            const currentProgress = this.calculateGrowthProgress(growthPlan, chapterNumber);

            // マイルストーンの取得
            const milestones = this.extractGrowthMilestones(growthPlan, chapterNumber);

            // 次のステージの特定
            const nextStages = this.identifyNextGrowthStages(growthPlan, currentProgress);

            // 章への貢献度の計算
            const chapterContribution = this.calculateChapterContribution(growthPlan, chapterNumber);

            const characterGrowthData: CharacterGrowthData = {
              characterId,
              growthPlan,
              currentProgress,
              milestones,
              nextStages,
              chapterContribution
            };

            growthData.push(characterGrowthData);
          }

        } catch (growthError) {
          this.logger.warn(`Failed to collect growth data for character ${characterId}`, { growthError });
        }
      }

      const processingTime = Date.now() - startTime;

      this.logger.debug(`Collected growth data for ${growthData.length} characters`, {
        processingTime: `${processingTime}ms`
      });

      return {
        success: true,
        data: growthData,
        metadata: {
          operationId: `growth-collection-${chapterNumber}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'character-collector'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('Growth data collection failed', { characterIds, chapterNumber, error, processingTime });

      return {
        success: false,
        error: {
          code: 'GROWTH_DATA_COLLECTION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown growth data collection error',
          details: error
        },
        metadata: {
          operationId: `growth-collection-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'character-collector'
        }
      };
    }
  }

  async collectMainCharactersForChapter(
    chapterNumber: number,
    criteria: ChapterCharacterCriteria
  ): Promise<OperationResult<MainCharacterData[]>> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Collecting main characters for chapter ${chapterNumber}`, { criteria });

      // 全キャラクターの取得
      const allCharactersResult = await this.characterManager.getAllCharacters();
      if (!allCharactersResult.success) {
        throw new Error(`Failed to get all characters: ${allCharactersResult.error?.message}`);
      }

      const allCharacters = allCharactersResult.data!;

      // 主要キャラクターの評価とランキング
      const characterScores: { character: Character; score: number; data: MainCharacterData }[] = [];

      for (const character of allCharacters) {
        const score = this.calculateChapterImportanceScore(character, chapterNumber, criteria);
        
        if (score >= criteria.plotRelevance) {
          const mainCharacterData: MainCharacterData = {
            character,
            chapterImportance: score,
            plotRole: this.determinePlotRole(character, chapterNumber),
            emotionalArc: this.determineEmotionalArc(character, chapterNumber),
            interactions: this.predictChapterInteractions(character, chapterNumber),
            developmentOpportunities: this.identifyDevelopmentOpportunities(character, chapterNumber)
          };

          characterScores.push({ character, score, data: mainCharacterData });
        }
      }

      // スコア順でソート
      characterScores.sort((a, b) => b.score - a.score);

      // 最大主要キャラクター数で制限
      const limitedCharacters = characterScores.slice(0, criteria.maxMainCharacters);
      const mainCharacterData = limitedCharacters.map(item => item.data);

      const processingTime = Date.now() - startTime;

      this.logger.info(`Selected ${mainCharacterData.length} main characters for chapter ${chapterNumber}`, {
        characters: mainCharacterData.map(c => c.character.name),
        averageImportance: mainCharacterData.reduce((sum, c) => sum + c.chapterImportance, 0) / mainCharacterData.length,
        processingTime: `${processingTime}ms`
      });

      return {
        success: true,
        data: mainCharacterData,
        metadata: {
          operationId: `main-characters-${chapterNumber}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'character-collector'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('Main characters collection failed', { chapterNumber, criteria, error, processingTime });

      return {
        success: false,
        error: {
          code: 'MAIN_CHARACTERS_COLLECTION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown main characters collection error',
          details: error
        },
        metadata: {
          operationId: `main-characters-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'character-collector'
        }
      };
    }
  }

  // ============================================================================
  // プライベートメソッド
  // ============================================================================

  private async identifyRelevantCharacters(
    chapterNumber: number,
    context: CharacterCollectionContext
  ): Promise<string[]> {
    // フォーカスキャラクターが指定されている場合は優先
    if (context.focusCharacters && context.focusCharacters.length > 0) {
      return context.focusCharacters;
    }

    // 基本的な検索条件で全キャラクターを取得
    const searchCriteria: SearchCriteria = {};

    const searchResult = await this.characterManager.searchCharacters(searchCriteria);
    
    if (searchResult.success && searchResult.data) {
      return searchResult.data.map(character => character.id);
    }

    // フォールバック: 全キャラクターを取得して関連性で絞り込み
    const allCharactersResult = await this.characterManager.getAllCharacters();
    if (allCharactersResult.success && allCharactersResult.data) {
      return allCharactersResult.data
        .filter(character => this.isCharacterRelevantToChapter(character, chapterNumber))
        .map(character => character.id)
        .slice(0, context.maxCharacters || 20);
    }

    return [];
  }

  private async getCurrentCharacterState(characterId: string): Promise<CharacterState> {
    // TODO: 実際の実装では、キャラクターの現在状態を取得
    return {
      currentMood: 'stable',
      emotionalState: {
        primary: 'calm',
        intensity: 0.5,
        stability: 0.8,
        triggers: [],
        duration: 0
      },
      location: 'unknown',
      activeGoals: ['chapter_completion', 'relationship_building'],
      recentActions: [],
      learningProgress: new Map(),
      activeSkills: [],
      stressLevel: 0.2,
      motivationLevel: 0.8,
      lastUpdated: new Date()
    };
  }

  private createDefaultMBTIProfile(): MBTIProfile {
    return {
      type: 'ISFJ',
      confidence: 0.5,
      dimensions: {
        extraversion: 0.3, // やや内向的
        sensing: 0.2, // 感覚優位
        thinking: 0.3, // 感情優位
        judging: 0.4  // やや判断優位
      },
      learningPattern: {
        preferredStyle: 'visual',
        processingSpeed: 'moderate',
        failureHandling: 'analytical',
        motivationFactors: ['harmony', 'helping_others'],
        stressResponses: ['withdrawal']
      },
      behaviorPattern: {
        decisionMaking: 'emotional',
        communicationStyle: 'reserved',
        conflictResolution: 'collaborative'
      },
      growthTendencies: []
    };
  }

  private calculateCharacterRelevance(character: Character, state: CharacterState): number {
    let relevance = 0.5; // ベーススコア

    // 活動状態による加算
    if (state.activeGoals.length > 0) relevance += 0.3;

    // 目標数による加算
    relevance += Math.min(state.activeGoals.length * 0.1, 0.2);

    // キャラクタータイプによる調整
    if (character.type === 'main') relevance += 0.2;
    if (character.type === 'supporting') relevance += 0.1;

    return Math.min(relevance, 1.0);
  }

  private determineChapterRole(character: Character, state: CharacterState): string {
    if (character.type === 'main') {
      return 'protagonist';
    }
    
    if (state.activeGoals.includes('relationship_building')) {
      return 'relationship_facilitator';
    }
    
    return 'supporting_presence';
  }

  private getLastAppearanceChapter(character: Character): number {
    // TODO: 実際の実装では、キャラクターの最後の登場章を取得
    return 1;
  }

  private getDevelopmentStage(character: Character): string {
    // TODO: 実際の実装では、キャラクターの現在の発達段階を判定
    return 'growing';
  }

  private categorizeCharacters(
    characters: DetailedCharacterData[],
    chapterNumber: number,
    context: CharacterCollectionContext
  ): { mainCharacters: DetailedCharacterData[]; supportingCharacters: DetailedCharacterData[] } {
    const sorted = characters.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    const mainThreshold = 0.7;
    const mainCharacters = sorted.filter(c => c.relevanceScore >= mainThreshold || c.character.type === 'main');
    const supportingCharacters = sorted.filter(c => c.relevanceScore < mainThreshold && c.character.type !== 'main');
    
    return { mainCharacters, supportingCharacters };
  }

  private calculateAverageRelevance(characters: DetailedCharacterData[]): number {
    if (characters.length === 0) return 0;
    const total = characters.reduce((sum, c) => sum + c.relevanceScore, 0);
    return total / characters.length;
  }

  private calculateDataCompleteness(
    context: CharacterCollectionContext,
    characters: DetailedCharacterData[],
    relationships: RelationshipData[],
    growthData: CharacterGrowthData[]
  ): number {
    let completeness = 0.5; // ベース

    if (characters.length > 0) completeness += 0.2;
    if (context.includeRelationships && relationships.length > 0) completeness += 0.15;
    if (context.includeGrowthData && growthData.length > 0) completeness += 0.15;

    return Math.min(completeness, 1.0);
  }

  private async collectPsychologyInsights(characterIds: string[]): Promise<PsychologyInsightData[]> {
    const insights: PsychologyInsightData[] = [];

    for (const characterId of characterIds) {
      try {
        // キャラクター取得とMBTI分析
        const characterResult = await this.characterManager.getCharacter(characterId);
        
        if (characterResult.success && characterResult.data) {
          const mbtiProfile = characterResult.data.mbtiProfile;
          
          const insight: PsychologyInsightData = {
            characterId,
            mbtiType: mbtiProfile.type,
            personalityTraits: this.convertMBTIDimensionsToTraits(mbtiProfile.dimensions),
            behaviorPatterns: this.deriveBehaviorPatterns(mbtiProfile),
            motivationalDrivers: mbtiProfile.learningPattern.motivationFactors || [],
            learningStyle: mbtiProfile.learningPattern.preferredStyle || 'unknown',
            decisionMakingStyle: this.deriveDecisionMakingStyle(mbtiProfile),
            stressResponses: this.deriveStressResponses(mbtiProfile)
          };

          insights.push(insight);
        }
      } catch (error) {
        this.logger.warn(`Failed to collect psychology insight for ${characterId}`, { error });
      }
    }

    return insights;
  }

  private convertMBTIDimensionsToTraits(dimensions: { extraversion: number; sensing: number; thinking: number; judging: number }): Record<string, number> {
    return {
      extroversion: dimensions.extraversion || 0.5,
      intuition: 1 - (dimensions.sensing || 0.5),
      thinking: dimensions.thinking || 0.5,
      perceiving: 1 - (dimensions.judging || 0.5)
    };
  }

  private deriveBehaviorPatterns(mbtiProfile: MBTIProfile): string[] {
    const patterns: string[] = [];
    
    if (mbtiProfile.dimensions.extraversion > 0.6) patterns.push('socially_outgoing');
    if (mbtiProfile.dimensions.sensing < 0.4) patterns.push('future_focused');
    if (mbtiProfile.dimensions.thinking < 0.4) patterns.push('emotion_driven');
    if (mbtiProfile.dimensions.judging > 0.6) patterns.push('structured_approach');
    
    return patterns;
  }

  private deriveDecisionMakingStyle(mbtiProfile: MBTIProfile): string {
    const thinking = mbtiProfile.dimensions.thinking;
    const judging = mbtiProfile.dimensions.judging;
    
    if (thinking > 0.6 && judging > 0.6) return 'analytical_decisive';
    if (thinking > 0.6 && judging <= 0.6) return 'analytical_flexible';
    if (thinking <= 0.6 && judging > 0.6) return 'value_based_decisive';
    return 'value_based_flexible';
  }

  private deriveStressResponses(mbtiProfile: MBTIProfile): string[] {
    const responses: string[] = [];
    
    if (mbtiProfile.dimensions.extraversion < 0.4) responses.push('withdrawal');
    if (mbtiProfile.dimensions.thinking < 0.4) responses.push('emotional_overwhelm');
    if (mbtiProfile.dimensions.judging > 0.6) responses.push('rigidity');
    
    return responses;
  }

  private calculateRelationshipChapterRelevance(relationship: RelationshipSnapshot, chapterNumber: number): number {
    // TODO: 実際の実装では、関係性の章への関連性を計算
    return 0.5;
  }

  private determineRelationshipDirection(relationship: RelationshipSnapshot): 'improving' | 'deteriorating' | 'stable' {
    if (relationship.evolutionTrend) {
      return relationship.evolutionTrend;
    }
    return 'stable';
  }

  private calculateGrowthProgress(growthPlan: GrowthPlan, chapterNumber: number): number {
    // TODO: 実際の実装では、成長計画の進捗を計算
    return 0.5;
  }

  private extractGrowthMilestones(growthPlan: GrowthPlan, chapterNumber: number): GrowthMilestone[] {
    // TODO: 実際の実装では、マイルストーンを抽出
    return [];
  }

  private identifyNextGrowthStages(growthPlan: GrowthPlan, currentProgress: number): string[] {
    // TODO: 実際の実装では、次の成長段階を特定
    return ['emotional_development', 'skill_acquisition'];
  }

  private calculateChapterContribution(growthPlan: GrowthPlan, chapterNumber: number): number {
    // TODO: 実際の実装では、章への貢献度を計算
    return 0.3;
  }

  private isCharacterRelevantToChapter(character: Character, chapterNumber: number): boolean {
    // TODO: 実際の実装では、キャラクターの章への関連性を判定
    return true;
  }

  private calculateChapterImportanceScore(character: Character, chapterNumber: number, criteria: ChapterCharacterCriteria): number {
    let score = 0;

    // キャラクタータイプによる基本スコア
    if (character.type === 'main') score += 0.4;
    if (character.type === 'supporting') score += 0.2;

    // TODO: 実際の実装では、より詳細な重要度計算
    score += criteria.plotRelevance * 0.3;
    score += criteria.emotionalImportance * 0.2;
    score += criteria.developmentPotential * 0.1;

    return Math.min(score, 1.0);
  }

  private determinePlotRole(character: Character, chapterNumber: number): string {
    // TODO: 実際の実装では、プロットでの役割を決定
    return 'catalyst';
  }

  private determineEmotionalArc(character: Character, chapterNumber: number): string {
    // TODO: 実際の実装では、感情的な弧を決定
    return 'growth_through_challenge';
  }

  private predictChapterInteractions(character: Character, chapterNumber: number): string[] {
    // TODO: 実際の実装では、章での相互作用を予測
    return ['dialogue', 'conflict_resolution', 'collaborative_problem_solving'];
  }

  private identifyDevelopmentOpportunities(character: Character, chapterNumber: number): string[] {
    // TODO: 実際の実装では、発達機会を特定
    return ['leadership_growth', 'emotional_intelligence', 'technical_skills'];
  }

  // ============================================================================
  // Data Coordinator統合メソッド
  // ============================================================================

  /**
   * Data Coordinator経由でのキャラクタークエリ最適化
   */
  private async optimizeCharacterQuery(criteria: SearchCriteria): Promise<SearchCriteria> {
    try {
      // Data Coordinatorのクエリ最適化機能を活用
      const optimizationResult = await this.dataCoordinator.optimizeQueryExecution([
        {
          id: `character-query-${Date.now()}`,
          systemType: SystemType.CHARACTER,
          chapterNumber: 1, // TODO: 動的に設定
          parameters: { criteria },
          priority: 0.8,
          timeout: 10000
        }
      ]);

      if (optimizationResult.success && optimizationResult.data!.length > 0) {
        const optimizedParams = optimizationResult.data![0].parameters;
        return optimizedParams.criteria || criteria;
      }

      return criteria;
    } catch (error) {
      this.logger.warn('Character query optimization failed, using original criteria', { error });
      return criteria;
    }
  }

  /**
   * Data Coordinator経由でのシステム健全性チェック
   */
  public async checkCharacterSystemHealth(): Promise<{ healthy: boolean; details: any }> {
    try {
      const healthResult = await this.dataCoordinator.healthCheck();
      const characterSystemStatus = healthResult.systemStatus.find(
        status => status.systemType === SystemType.CHARACTER
      );

      return {
        healthy: characterSystemStatus?.healthy || false,
        details: {
          characterSystemStatus,
          dataCoordinatorHealth: healthResult.healthy,
          connectionMetrics: this.dataCoordinator.getSystemConnections()
            .find(conn => conn.systemType === SystemType.CHARACTER)?.metrics
        }
      };
    } catch (error) {
      this.logger.error('Character system health check failed', { error });
      return {
        healthy: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Data Coordinator経由での一括キャラクター取得最適化
   */
  private async optimizeBatchCharacterRetrieval(characterIds: string[]): Promise<Character[]> {
    try {
      this.logger.debug('Optimizing batch character retrieval via Data Coordinator', { 
        count: characterIds.length 
      });

      // 実際のCharacterManagerを使用して一括取得
      const characters: Character[] = [];
      
      for (const id of characterIds) {
        const result = await this.characterManager.getCharacter(id);
        if (result.success && result.data) {
          characters.push(result.data);
        }
      }

      this.logger.debug('Batch character retrieval completed', {
        requested: characterIds.length,
        retrieved: characters.length
      });

      return characters;
    } catch (error) {
      this.logger.error('Batch character retrieval failed', { error, characterIds });
      return [];
    }
  }
}