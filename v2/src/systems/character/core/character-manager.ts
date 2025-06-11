/**
 * キャラクター管理システムのメインマネージャー
 * MBTI統合、心理分析、成長管理、関係性管理を統括
 */

import type {
  ICharacterManager,
  Character,
  CharacterDefinition,
  CharacterUpdate,
  CharacterType,
  SearchCriteria,
  PsychologyProfile,
  Relationship,
  RelationshipType,
  GrowthPlan,
  CharacterStatistics,
  CharacterReport,
  PersonalityTraits,
  MBTIProfile,
  CharacterState,
  CharacterParameters,
  CharacterSkills
} from '../interfaces';
import type { OperationResult } from '@/types/common';
import { logger } from '@/core/infrastructure/logger';

export class CharacterManager implements ICharacterManager {
  private readonly systemId = 'character';
  private characters: Map<string, Character> = new Map();
  private characterIndex: Map<string, Set<string>> = new Map(); // name -> characterIds
  private typeIndex: Map<CharacterType, Set<string>> = new Map(); // type -> characterIds
  private mbtiIndex: Map<string, Set<string>> = new Map(); // mbti -> characterIds
  
  constructor() {
    logger.setSystemId(this.systemId);
    this.initializeIndexes();
  }

  /**
   * キャラクター作成
   */
  async createCharacter(definition: CharacterDefinition): Promise<OperationResult<Character>> {
    const startTime = Date.now();
    
    try {
      // 入力検証
      const validation = this.validateCharacterDefinition(definition);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid character definition',
            details: validation.errors
          },
          metadata: {
            operationId: this.generateOperationId(),
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: this.systemId
          }
        };
      }

      // キャラクターID生成
      const characterId = this.generateCharacterId();
      
      // MBTIプロファイル生成
      const mbtiProfile = await this.generateMBTIProfile(definition.personalityTraits);
      
      // 初期パラメータ生成
      const initialParameters = this.generateInitialParameters(definition, mbtiProfile);
      
      // 初期スキル生成
      const initialSkills = this.generateInitialSkills(definition);
      
      // 初期状態生成
      const initialState = this.generateInitialState();
      
      // 成長プラン生成
      const growthPlan = await this.generateInitialGrowthPlan(characterId, mbtiProfile);
      
      // 心理プロファイル生成
      const psychologyProfile = await this.generatePsychologyProfile(characterId, definition.personalityTraits, mbtiProfile);

      // キャラクターオブジェクト作成
      const character: Character = {
        id: characterId,
        name: definition.name,
        type: definition.type,
        personalityTraits: definition.personalityTraits,
        mbtiProfile,
        currentState: initialState,
        parameters: initialParameters,
        skills: initialSkills,
        relationships: new Map(),
        growthPlan,
        psychologyProfile,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      };

      // 保存とインデックス更新
      this.characters.set(characterId, character);
      this.updateIndexes(character);

      logger.info(`Created character: ${character.name} (${characterId})`);
      
      return {
        success: true,
        data: character,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to create character:', error);
      return {
        success: false,
        error: {
          code: 'CREATION_ERROR',
          message: 'Failed to create character',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * キャラクター取得
   */
  async getCharacter(characterId: string): Promise<OperationResult<Character>> {
    const startTime = Date.now();
    
    try {
      const character = this.characters.get(characterId);
      
      if (!character) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Character not found: ${characterId}`
          },
          metadata: {
            operationId: this.generateOperationId(),
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: this.systemId
          }
        };
      }
      
      return {
        success: true,
        data: character,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to get character:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get character',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * キャラクター更新
   */
  async updateCharacter(characterId: string, updates: CharacterUpdate): Promise<OperationResult<Character>> {
    const startTime = Date.now();
    
    try {
      const existingCharacter = this.characters.get(characterId);
      
      if (!existingCharacter) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Character not found: ${characterId}`
          },
          metadata: {
            operationId: this.generateOperationId(),
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: this.systemId
          }
        };
      }

      // 更新内容のマージ
      const updatedCharacter: Character = {
        ...existingCharacter,
        personalityTraits: updates.personalityTraits ? 
          { ...existingCharacter.personalityTraits, ...updates.personalityTraits } :
          existingCharacter.personalityTraits,
        currentState: updates.currentState ?
          { ...existingCharacter.currentState, ...updates.currentState } :
          existingCharacter.currentState,
        parameters: updates.parameters ?
          this.mergeParameters(existingCharacter.parameters, updates.parameters) :
          existingCharacter.parameters,
        skills: updates.skills ?
          this.mergeSkills(existingCharacter.skills, updates.skills) :
          existingCharacter.skills,
        updatedAt: new Date(),
        version: existingCharacter.version + 1
      };

      // MBTIプロファイルの再計算（性格特性が変更された場合）
      if (updates.personalityTraits) {
        updatedCharacter.mbtiProfile = await this.generateMBTIProfile(updatedCharacter.personalityTraits);
      }

      // 保存とインデックス更新
      this.characters.set(characterId, updatedCharacter);
      this.updateIndexes(updatedCharacter);

      logger.info(`Updated character: ${updatedCharacter.name} (${characterId})`);
      
      return {
        success: true,
        data: updatedCharacter,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to update character:', error);
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update character',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * キャラクター削除
   */
  async deleteCharacter(characterId: string): Promise<OperationResult<void>> {
    const startTime = Date.now();
    
    try {
      const character = this.characters.get(characterId);
      
      if (!character) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Character not found: ${characterId}`
          },
          metadata: {
            operationId: this.generateOperationId(),
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: this.systemId
          }
        };
      }

      // キャラクター削除
      this.characters.delete(characterId);
      
      // インデックスから削除
      this.removeFromIndexes(character);

      logger.info(`Deleted character: ${character.name} (${characterId})`);
      
      return {
        success: true,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to delete character:', error);
      return {
        success: false,
        error: {
          code: 'DELETION_ERROR',
          message: 'Failed to delete character',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * 全キャラクター取得
   */
  async getAllCharacters(): Promise<OperationResult<Character[]>> {
    const startTime = Date.now();
    
    try {
      const characters = Array.from(this.characters.values())
        .sort((a, b) => a.name.localeCompare(b.name));
      
      return {
        success: true,
        data: characters,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to get all characters:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get all characters',
          details: error
        },
        data: [],
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * タイプ別キャラクター取得
   */
  async getCharactersByType(type: CharacterType): Promise<OperationResult<Character[]>> {
    const startTime = Date.now();
    
    try {
      const characterIds = this.typeIndex.get(type) || new Set();
      const characters = Array.from(characterIds)
        .map(id => this.characters.get(id))
        .filter((char): char is Character => char !== undefined)
        .sort((a, b) => a.name.localeCompare(b.name));
      
      return {
        success: true,
        data: characters,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to get characters by type:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get characters by type',
          details: error
        },
        data: [],
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * キャラクター検索
   */
  async searchCharacters(criteria: SearchCriteria): Promise<OperationResult<Character[]>> {
    const startTime = Date.now();
    
    try {
      let candidateIds = new Set(this.characters.keys());
      
      // 名前でフィルタリング
      if (criteria.name) {
        const nameIds = this.searchByName(criteria.name);
        candidateIds = this.intersectSets(candidateIds, nameIds);
      }
      
      // タイプでフィルタリング
      if (criteria.type) {
        const typeIds = this.typeIndex.get(criteria.type) || new Set();
        candidateIds = this.intersectSets(candidateIds, typeIds);
      }
      
      // MBTIタイプでフィルタリング
      if (criteria.mbtiType) {
        const mbtiIds = this.mbtiIndex.get(criteria.mbtiType) || new Set();
        candidateIds = this.intersectSets(candidateIds, mbtiIds);
      }
      
      // 結果をキャラクターオブジェクトに変換
      const characters = Array.from(candidateIds)
        .map(id => this.characters.get(id))
        .filter((char): char is Character => char !== undefined)
        .filter(char => this.matchesAdvancedCriteria(char, criteria))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      return {
        success: true,
        data: characters,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to search characters:', error);
      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: 'Failed to search characters',
          details: error
        },
        data: [],
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * 心理分析
   */
  async analyzeCharacterPsychology(characterId: string): Promise<OperationResult<PsychologyProfile>> {
    const startTime = Date.now();
    
    try {
      const character = this.characters.get(characterId);
      
      if (!character) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Character not found: ${characterId}`
          },
          metadata: {
            operationId: this.generateOperationId(),
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: this.systemId
          }
        };
      }
      
      // 心理プロファイルの再分析
      const updatedProfile = await this.generatePsychologyProfile(
        characterId, 
        character.personalityTraits, 
        character.mbtiProfile
      );
      
      // キャラクターの心理プロファイル更新
      character.psychologyProfile = updatedProfile;
      character.updatedAt = new Date();
      
      return {
        success: true,
        data: updatedProfile,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to analyze character psychology:', error);
      return {
        success: false,
        error: {
          code: 'ANALYSIS_ERROR',
          message: 'Failed to analyze character psychology',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * 関係性取得
   */
  async getCharacterRelationships(characterId: string): Promise<OperationResult<Relationship[]>> {
    const startTime = Date.now();
    
    try {
      const character = this.characters.get(characterId);
      
      if (!character) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Character not found: ${characterId}`
          },
          metadata: {
            operationId: this.generateOperationId(),
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: this.systemId
          }
        };
      }
      
      const relationships = Array.from(character.relationships.values());
      
      return {
        success: true,
        data: relationships,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to get character relationships:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get character relationships',
          details: error
        },
        data: [],
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * 成長追跡
   */
  async trackCharacterGrowth(characterId: string): Promise<OperationResult<GrowthPlan>> {
    const startTime = Date.now();
    
    try {
      const character = this.characters.get(characterId);
      
      if (!character) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Character not found: ${characterId}`
          },
          metadata: {
            operationId: this.generateOperationId(),
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: this.systemId
          }
        };
      }
      
      return {
        success: true,
        data: character.growthPlan,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to track character growth:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to track character growth',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * キャラクター統計
   */
  async getCharacterStatistics(): Promise<OperationResult<CharacterStatistics>> {
    const startTime = Date.now();
    
    try {
      const statistics: CharacterStatistics = {
        totalCharacters: this.characters.size,
        charactersByType: new Map(),
        mbtiDistribution: new Map(),
        averageGrowthRate: 0,
        relationshipCount: 0,
        skillDistribution: new Map()
      };
      
      // 統計情報の計算
      this.calculateStatistics(statistics);
      
      return {
        success: true,
        data: statistics,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to get character statistics:', error);
      return {
        success: false,
        error: {
          code: 'STATISTICS_ERROR',
          message: 'Failed to get character statistics',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * キャラクターレポート生成
   */
  async generateCharacterReport(characterId: string): Promise<OperationResult<CharacterReport>> {
    const startTime = Date.now();
    
    try {
      // 実装は簡略化（詳細なレポート生成は別途実装）
      const character = this.characters.get(characterId);
      
      if (!character) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Character not found: ${characterId}`
          },
          metadata: {
            operationId: this.generateOperationId(),
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: this.systemId
          }
        };
      }
      
      const report: CharacterReport = {
        character,
        psychologyAnalysis: character.psychologyProfile,
        growthAnalysis: character.growthPlan,
        relationshipSummary: {
          totalRelationships: character.relationships.size,
          strongRelationships: 0, // TODO: 計算実装
          conflictRelationships: 0, // TODO: 計算実装
          networkPosition: 'central', // TODO: 計算実装
          influenceScore: 0.5 // TODO: 計算実装
        },
        recommendations: [], // TODO: 推奨生成実装
        generatedAt: new Date()
      };
      
      return {
        success: true,
        data: report,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to generate character report:', error);
      return {
        success: false,
        error: {
          code: 'REPORT_ERROR',
          message: 'Failed to generate character report',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  // プライベートメソッド

  private initializeIndexes(): void {
    // タイプインデックスの初期化
    const characterTypes: CharacterType[] = ['main', 'supporting', 'antagonist', 'mentor', 'background'];
    characterTypes.forEach(type => {
      this.typeIndex.set(type, new Set());
    });
  }

  private validateCharacterDefinition(definition: CharacterDefinition): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!definition.name || definition.name.trim().length === 0) {
      errors.push('Character name is required');
    }
    
    if (!definition.type) {
      errors.push('Character type is required');
    }
    
    if (!definition.personalityTraits) {
      errors.push('Personality traits are required');
    } else {
      // 性格特性の値範囲チェック
      const traits = definition.personalityTraits;
      const requiredTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
      
      requiredTraits.forEach(trait => {
        const value = (traits as any)[trait];
        if (typeof value !== 'number' || value < 0 || value > 1) {
          errors.push(`Invalid ${trait} value: must be a number between 0 and 1`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private generateCharacterId(): string {
    return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async generateMBTIProfile(traits: PersonalityTraits): Promise<MBTIProfile> {
    // 簡略化されたMBTI判定ロジック
    const extraversion = traits.extraversion;
    const sensing = 1 - traits.openness; // 開放性が高いと直感的
    const thinking = 1 - traits.agreeableness; // 協調性が低いと思考的
    const judging = traits.conscientiousness; // 勤勉性が高いと判断的
    
    const mbtiCode = 
      (extraversion > 0.5 ? 'E' : 'I') +
      (sensing > 0.5 ? 'S' : 'N') +
      (thinking > 0.5 ? 'T' : 'F') +
      (judging > 0.5 ? 'J' : 'P');
    
    return {
      type: mbtiCode as any, // TODO: 適切な型チェック
      confidence: 0.8,
      dimensions: {
        extraversion,
        sensing,
        thinking,
        judging
      },
      learningPattern: {
        preferredStyle: 'visual',
        processingSpeed: 'moderate',
        failureHandling: 'analytical',
        motivationFactors: ['achievement', 'recognition'],
        stressResponses: ['withdrawal', 'analysis']
      },
      behaviorPattern: {
        decisionMaking: thinking > 0.5 ? 'logical' : 'emotional',
        communicationStyle: extraversion > 0.5 ? 'direct' : 'reserved',
        conflictResolution: 'collaborative'
      },
      growthTendencies: []
    };
  }

  private generateInitialParameters(definition: CharacterDefinition, mbtiProfile: MBTIProfile): CharacterParameters {
    const base = 0.5;
    const variation = 0.2;
    
    return {
      physical: {
        strength: base + (Math.random() - 0.5) * variation,
        agility: base + (Math.random() - 0.5) * variation,
        endurance: base + (Math.random() - 0.5) * variation,
        health: base + (Math.random() - 0.5) * variation,
        appearance: base + (Math.random() - 0.5) * variation
      },
      mental: {
        intelligence: definition.personalityTraits.intelligence || base,
        wisdom: base + (Math.random() - 0.5) * variation,
        creativity: definition.personalityTraits.creativity || base,
        memory: base + (Math.random() - 0.5) * variation,
        focus: base + (Math.random() - 0.5) * variation
      },
      social: {
        charisma: definition.personalityTraits.extraversion,
        empathy: definition.personalityTraits.empathy || base,
        leadership: definition.personalityTraits.leadership || base,
        communication: mbtiProfile.dimensions.extraversion,
        influence: base + (Math.random() - 0.5) * variation
      },
      special: definition.initialParameters?.special || {}
    };
  }

  private generateInitialSkills(definition: CharacterDefinition): CharacterSkills {
    return {
      learned: new Map(),
      innate: new Map(),
      developing: new Map(),
      mastered: []
    };
  }

  private generateInitialState(): CharacterState {
    return {
      currentMood: 'neutral',
      emotionalState: {
        primary: 'calm',
        intensity: 0.5,
        stability: 0.8,
        triggers: [],
        duration: 0
      },
      location: 'unknown',
      activeGoals: [],
      recentActions: [],
      learningProgress: new Map(),
      activeSkills: [],
      stressLevel: 0.2,
      motivationLevel: 0.8,
      lastUpdated: new Date()
    };
  }

  private async generateInitialGrowthPlan(characterId: string, mbtiProfile: MBTIProfile): Promise<GrowthPlan> {
    return {
      characterId,
      currentPhase: {
        id: 'initial',
        name: 'Initial Development',
        description: 'Starting phase of character development',
        objectives: ['Establish personality', 'Build relationships'],
        requiredSkills: [],
        estimatedDuration: 30,
        successCriteria: ['Personality consistency', 'Active relationships']
      },
      milestones: [],
      completedMilestones: [],
      estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      progressPercentage: 0,
      growthAreas: []
    };
  }

  private async generatePsychologyProfile(characterId: string, traits: PersonalityTraits, mbtiProfile: MBTIProfile): Promise<PsychologyProfile> {
    return {
      characterId,
      personalityAssessment: {
        mbtiAnalysis: {
          determinedType: mbtiProfile.type,
          confidence: mbtiProfile.confidence,
          alternativeTypes: [],
          dimensionScores: {
            EI: mbtiProfile.dimensions.extraversion,
            SN: 1 - mbtiProfile.dimensions.sensing,
            TF: 1 - mbtiProfile.dimensions.thinking,
            JP: mbtiProfile.dimensions.judging
          },
          typicalBehaviors: [],
          stressIndicators: []
        },
        bigFiveScores: traits,
        characterStrengths: [],
        characterWeaknesses: [],
        behaviorPredictions: [],
        consistency: 0.8
      },
      behaviorPatterns: {
        patterns: [],
        consistency: 0.8,
        predictability: 0.7,
        adaptability: 0.6
      },
      emotionalProfile: {
        dominantEmotions: ['calm'],
        emotionalRange: 0.6,
        stability: 0.8,
        triggers: [],
        copingMechanisms: []
      },
      stressResponses: [],
      motivationFactors: [],
      cognitiveStyle: {
        processingSpeed: 0.7,
        attentionSpan: 0.6,
        memoryType: 'mixed',
        learningPreference: ['visual']
      },
      socialBehavior: {
        groupDynamics: 'collaborative',
        communicationStyle: 'balanced',
        conflictStyle: 'diplomatic'
      },
      lastAnalysis: new Date()
    };
  }

  private updateIndexes(character: Character): void {
    // 名前インデックス更新
    const nameKey = character.name.toLowerCase();
    if (!this.characterIndex.has(nameKey)) {
      this.characterIndex.set(nameKey, new Set());
    }
    this.characterIndex.get(nameKey)!.add(character.id);
    
    // タイプインデックス更新
    if (!this.typeIndex.has(character.type)) {
      this.typeIndex.set(character.type, new Set());
    }
    this.typeIndex.get(character.type)!.add(character.id);
    
    // MBTIインデックス更新
    const mbtiType = character.mbtiProfile.type;
    if (!this.mbtiIndex.has(mbtiType)) {
      this.mbtiIndex.set(mbtiType, new Set());
    }
    this.mbtiIndex.get(mbtiType)!.add(character.id);
  }

  private removeFromIndexes(character: Character): void {
    // 名前インデックスから削除
    const nameKey = character.name.toLowerCase();
    const nameSet = this.characterIndex.get(nameKey);
    if (nameSet) {
      nameSet.delete(character.id);
      if (nameSet.size === 0) {
        this.characterIndex.delete(nameKey);
      }
    }
    
    // タイプインデックスから削除
    const typeSet = this.typeIndex.get(character.type);
    if (typeSet) {
      typeSet.delete(character.id);
    }
    
    // MBTIインデックスから削除
    const mbtiSet = this.mbtiIndex.get(character.mbtiProfile.type);
    if (mbtiSet) {
      mbtiSet.delete(character.id);
    }
  }

  private mergeParameters(existing: CharacterParameters, updates: Partial<CharacterParameters>): CharacterParameters {
    return {
      physical: updates.physical ? { ...existing.physical, ...updates.physical } : existing.physical,
      mental: updates.mental ? { ...existing.mental, ...updates.mental } : existing.mental,
      social: updates.social ? { ...existing.social, ...updates.social } : existing.social,
      special: updates.special ? { ...existing.special, ...updates.special } : existing.special
    };
  }

  private mergeSkills(existing: CharacterSkills, updates: Partial<CharacterSkills>): CharacterSkills {
    return {
      learned: updates.learned ? new Map([...existing.learned, ...updates.learned]) : existing.learned,
      innate: updates.innate ? new Map([...existing.innate, ...updates.innate]) : existing.innate,
      developing: updates.developing ? new Map([...existing.developing, ...updates.developing]) : existing.developing,
      mastered: updates.mastered ? [...existing.mastered, ...updates.mastered] : existing.mastered
    };
  }

  private searchByName(name: string): Set<string> {
    const searchKey = name.toLowerCase();
    const exactMatch = this.characterIndex.get(searchKey);
    
    if (exactMatch) {
      return exactMatch;
    }
    
    // 部分一致検索
    const partialMatches = new Set<string>();
    for (const [indexedName, characterIds] of this.characterIndex.entries()) {
      if (indexedName.includes(searchKey) || searchKey.includes(indexedName)) {
        characterIds.forEach(id => partialMatches.add(id));
      }
    }
    
    return partialMatches;
  }

  private intersectSets<T>(set1: Set<T>, set2: Set<T>): Set<T> {
    const intersection = new Set<T>();
    for (const item of set1) {
      if (set2.has(item)) {
        intersection.add(item);
      }
    }
    return intersection;
  }

  private matchesAdvancedCriteria(character: Character, criteria: SearchCriteria): boolean {
    // パラメーターの最小値チェック
    if (criteria.minParameters) {
      // TODO: 詳細なパラメーターチェック実装
    }
    
    // スキルチェック
    if (criteria.hasSkills && criteria.hasSkills.length > 0) {
      // TODO: スキルチェック実装
    }
    
    return true;
  }

  private calculateStatistics(statistics: CharacterStatistics): void {
    for (const character of this.characters.values()) {
      // タイプ別統計
      const typeCount = statistics.charactersByType.get(character.type) || 0;
      statistics.charactersByType.set(character.type, typeCount + 1);
      
      // MBTI分布
      const mbtiCount = statistics.mbtiDistribution.get(character.mbtiProfile.type) || 0;
      statistics.mbtiDistribution.set(character.mbtiProfile.type, mbtiCount + 1);
      
      // 関係性カウント
      statistics.relationshipCount += character.relationships.size;
    }
    
    // 平均成長率の計算（簡略化）
    statistics.averageGrowthRate = 0.1; // TODO: 実際の成長率計算
  }

  /**
   * 関係性作成
   */
  async createRelationship(
    sourceId: string, 
    targetId: string, 
    type: RelationshipType
  ): Promise<OperationResult<Relationship>> {
    const startTime = Date.now();
    
    try {
      const sourceChar = this.characters.get(sourceId);
      const targetChar = this.characters.get(targetId);
      
      if (!sourceChar || !targetChar) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'One or both characters not found'
          },
          metadata: {
            operationId: this.generateOperationId(),
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: this.systemId
          }
        };
      }

      const relationshipId = this.generateRelationshipId();
      
      const relationship: Relationship = {
        id: relationshipId,
        sourceCharacterId: sourceId,
        targetCharacterId: targetId,
        type,
        strength: 0.5,
        trust: 0.5,
        compatibility: this.calculateCompatibility(sourceChar, targetChar),
        conflictLevel: 0.1,
        history: [],
        currentStatus: 'active',
        evolutionTrend: 'stable',
        lastInteraction: new Date()
      };

      // 双方向の関係性を設定
      sourceChar.relationships.set(targetId, relationship);
      
      // 逆方向の関係性も作成
      const reverseRelationship: Relationship = {
        ...relationship,
        id: this.generateRelationshipId(),
        sourceCharacterId: targetId,
        targetCharacterId: sourceId
      };
      targetChar.relationships.set(sourceId, reverseRelationship);

      return {
        success: true,
        data: relationship,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to create relationship:', error);
      return {
        success: false,
        error: {
          code: 'CREATION_ERROR',
          message: 'Failed to create relationship',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  /**
   * 成長計画更新
   */
  async updateGrowthPlan(
    characterId: string, 
    progress: any
  ): Promise<OperationResult<GrowthPlan>> {
    const startTime = Date.now();
    
    try {
      const character = this.characters.get(characterId);
      
      if (!character) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Character not found: ${characterId}`
          },
          metadata: {
            operationId: this.generateOperationId(),
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: this.systemId
          }
        };
      }

      // 成長進捗を更新
      character.growthPlan.progressPercentage = progress.progressPercentage || character.growthPlan.progressPercentage;
      
      if (progress.completedMilestone) {
        character.growthPlan.completedMilestones.push(progress.completedMilestone);
      }

      if (progress.newMilestone) {
        character.growthPlan.milestones.push(progress.newMilestone);
      }

      character.updatedAt = new Date();
      character.version++;

      return {
        success: true,
        data: character.growthPlan,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to update growth plan:', error);
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update growth plan',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    }
  }

  private generateRelationshipId(): string {
    return `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateCompatibility(char1: Character, char2: Character): number {
    // MBTI互換性の計算
    const mbti1 = char1.mbtiProfile;
    const mbti2 = char2.mbtiProfile;
    
    // 次元ごとの類似度計算
    const extraversionDiff = Math.abs(mbti1.dimensions.extraversion - mbti2.dimensions.extraversion);
    const sensingDiff = Math.abs(mbti1.dimensions.sensing - mbti2.dimensions.sensing);
    const thinkingDiff = Math.abs(mbti1.dimensions.thinking - mbti2.dimensions.thinking);
    const judgingDiff = Math.abs(mbti1.dimensions.judging - mbti2.dimensions.judging);
    
    // 平均差異から互換性を計算（差異が小さいほど互換性が高い）
    const averageDiff = (extraversionDiff + sensingDiff + thinkingDiff + judgingDiff) / 4;
    const compatibility = 1 - averageDiff;
    
    // 性格特性も考慮
    const personalityCompatibility = this.calculatePersonalityCompatibility(
      char1.personalityTraits, 
      char2.personalityTraits
    );
    
    return (compatibility + personalityCompatibility) / 2;
  }

  private calculatePersonalityCompatibility(
    traits1: PersonalityTraits, 
    traits2: PersonalityTraits
  ): number {
    const opennessComp = 1 - Math.abs(traits1.openness - traits2.openness);
    const conscientiousnessComp = 1 - Math.abs(traits1.conscientiousness - traits2.conscientiousness);
    const extraversionComp = 1 - Math.abs(traits1.extraversion - traits2.extraversion);
    const agreeablenessComp = 1 - Math.abs(traits1.agreeableness - traits2.agreeableness);
    const neuroticismComp = 1 - Math.abs(traits1.neuroticism - traits2.neuroticism);
    
    return (opennessComp + conscientiousnessComp + extraversionComp + agreeablenessComp + neuroticismComp) / 5;
  }

  /**
   * デストラクタ
   */
  destroy(): void {
    this.characters.clear();
    this.characterIndex.clear();
    this.typeIndex.clear();
    this.mbtiIndex.clear();
  }
}