/**
 * MBTI分析サービス
 * キャラクターのMBTI分析、学習パターン分析、行動予測を提供
 */

import type {
  IMBTIAnalyzer,
  MBTIAnalysis,
  LearningPattern,
  BehaviorPattern,
  GrowthTendency,
  BehaviorPrediction,
  MBTIStatistics,
  PersonalityTraits,
  MBTIType
} from '../interfaces';
import type { OperationResult } from '@/types/common';
import { logger } from '@/core/infrastructure/logger';

export class MBTIAnalyzer implements IMBTIAnalyzer {
  private readonly systemId = 'character.mbti';
  
  // MBTI統計データベース（実際の使用では外部データソースから取得）
  private mbtiStatistics: Map<MBTIType, MBTIStatistics> = new Map();

  constructor() {
    this.initializeMBTIStatistics();
  }

  /**
   * MBTI分析実行
   */
  async analyzeMBTI(personality: PersonalityTraits): Promise<OperationResult<MBTIAnalysis>> {
    const startTime = Date.now();
    
    try {
      const mbtiType = this.determineMBTIType(personality);
      const confidence = this.calculateConfidence(personality, mbtiType);
      const alternativeTypes = this.findAlternativeTypes(personality, mbtiType);
      
      const analysis: MBTIAnalysis = {
        determinedType: mbtiType,
        confidence,
        alternativeTypes,
        dimensionScores: {
          EI: personality.extraversion,
          SN: 1 - personality.openness, // 開放性が高いと直感的
          TF: 1 - personality.agreeableness, // 協調性が低いと思考的
          JP: personality.conscientiousness // 勤勉性が高いと判断的
        },
        typicalBehaviors: this.getTypicalBehaviors(mbtiType),
        stressIndicators: this.getStressIndicators(mbtiType)
      };

      return {
        success: true,
        data: analysis,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to analyze MBTI:', error);
      return {
        success: false,
        error: {
          code: 'ANALYSIS_ERROR',
          message: 'Failed to analyze MBTI',
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
   * 学習パターン取得
   */
  async getLearningPattern(mbtiType: MBTIType): Promise<OperationResult<LearningPattern>> {
    const startTime = Date.now();
    
    try {
      const pattern = this.calculateLearningPattern(mbtiType);
      
      return {
        success: true,
        data: pattern,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to get learning pattern:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get learning pattern',
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
   * 行動パターン取得
   */
  async getBehaviorPattern(mbtiType: MBTIType): Promise<OperationResult<BehaviorPattern>> {
    const startTime = Date.now();
    
    try {
      const pattern = this.calculateBehaviorPattern(mbtiType);
      
      return {
        success: true,
        data: pattern,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to get behavior pattern:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get behavior pattern',
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
   * 成長傾向取得
   */
  async getGrowthTendencies(mbtiType: MBTIType): Promise<OperationResult<GrowthTendency[]>> {
    const startTime = Date.now();
    
    try {
      const tendencies = this.calculateGrowthTendencies(mbtiType);
      
      return {
        success: true,
        data: tendencies,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to get growth tendencies:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get growth tendencies',
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
   * 行動予測
   */
  async predictBehavior(mbtiType: MBTIType, situation: string): Promise<OperationResult<BehaviorPrediction>> {
    const startTime = Date.now();
    
    try {
      const prediction = this.generateBehaviorPrediction(mbtiType, situation);
      
      return {
        success: true,
        data: prediction,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to predict behavior:', error);
      return {
        success: false,
        error: {
          code: 'PREDICTION_ERROR',
          message: 'Failed to predict behavior',
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
   * 統計データ取得
   */
  async getStatisticalData(mbtiType: MBTIType): Promise<OperationResult<MBTIStatistics>> {
    const startTime = Date.now();
    
    try {
      const statistics = this.mbtiStatistics.get(mbtiType);
      
      if (!statistics) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `No statistical data found for MBTI type: ${mbtiType}`
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
        data: statistics,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to get statistical data:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get statistical data',
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

  private determineMBTIType(traits: PersonalityTraits): MBTIType {
    const E_I = traits.extraversion > 0.5 ? 'E' : 'I';
    const S_N = (1 - traits.openness) > 0.5 ? 'S' : 'N';
    const T_F = (1 - traits.agreeableness) > 0.5 ? 'T' : 'F';
    const J_P = traits.conscientiousness > 0.5 ? 'J' : 'P';
    
    return (E_I + S_N + T_F + J_P) as MBTIType;
  }

  private calculateConfidence(traits: PersonalityTraits, mbtiType: MBTIType): number {
    // 各次元の明確さ（0.5からの距離）を計算
    const extraversionClarity = Math.abs(traits.extraversion - 0.5) * 2;
    const opennessClarit = Math.abs((1 - traits.openness) - 0.5) * 2;
    const agreeablenessClarity = Math.abs((1 - traits.agreeableness) - 0.5) * 2;
    const conscientiousnessClarity = Math.abs(traits.conscientiousness - 0.5) * 2;
    
    return (extraversionClarity + opennessClarit + agreeablenessClarity + conscientiousnessClarity) / 4;
  }

  private findAlternativeTypes(traits: PersonalityTraits, primaryType: MBTIType): MBTIType[] {
    // 各次元で境界値に近い場合の代替タイプを生成
    const alternatives: MBTIType[] = [];
    
    // 実装を簡略化（実際にはより複雑な計算が必要）
    if (Math.abs(traits.extraversion - 0.5) < 0.2) {
      const altType = this.flipDimension(primaryType, 0);
      if (this.isValidMBTIType(altType)) {
        alternatives.push(altType as MBTIType);
      }
    }
    
    return alternatives;
  }

  private flipDimension(mbtiType: MBTIType, dimension: number): string {
    const chars = mbtiType.split('');
    const flips = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']];
    const currentChar = chars[dimension];
    const flipPair = flips[dimension];
    chars[dimension] = flipPair[0] === currentChar ? flipPair[1] : flipPair[0];
    return chars.join('');
  }

  private isValidMBTIType(type: string): boolean {
    const validTypes = [
      'INTJ', 'INTP', 'ENTJ', 'ENTP',
      'INFJ', 'INFP', 'ENFJ', 'ENFP',
      'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
      'ISTP', 'ISFP', 'ESTP', 'ESFP'
    ];
    return validTypes.includes(type);
  }

  private getTypicalBehaviors(mbtiType: MBTIType): string[] {
    const behaviors: Record<string, string[]> = {
      'INTJ': ['戦略的思考', '独立行動', '長期計画'],
      'INTP': ['論理分析', '理論探求', '独創的発想'],
      'ENTJ': ['リーダーシップ', '目標達成', '組織化'],
      'ENTP': ['アイデア生成', '変化追求', 'ディベート'],
      // 他のタイプも同様に定義...
    };
    
    return behaviors[mbtiType] || ['一般的行動'];
  }

  private getStressIndicators(mbtiType: MBTIType): string[] {
    const stressIndicators: Record<string, string[]> = {
      'INTJ': ['過度な社交要求', '細部への過度な注意要求', '即断即決の圧力'],
      'INTP': ['感情的圧力', '厳格な締切', '定型的作業'],
      'ENTJ': ['曖昧な指示', '非効率的プロセス', '権威への挑戦'],
      'ENTP': ['単調な作業', '厳格なルール', '創造性の制限'],
      // 他のタイプも同様に定義...
    };
    
    return stressIndicators[mbtiType] || ['一般的ストレス'];
  }

  private calculateLearningPattern(mbtiType: MBTIType): LearningPattern {
    // MBTIタイプに基づく学習パターンの決定
    const patterns: Record<string, LearningPattern> = {
      'INTJ': {
        preferredStyle: 'reading',
        processingSpeed: 'moderate',
        failureHandling: 'analytical',
        motivationFactors: ['mastery', 'autonomy', 'purpose'],
        stressResponses: ['withdrawal', 'analysis', 'planning']
      },
      'ENTP': {
        preferredStyle: 'visual',
        processingSpeed: 'fast',
        failureHandling: 'adaptive',
        motivationFactors: ['novelty', 'challenge', 'social_recognition'],
        stressResponses: ['seek_variety', 'brainstorm', 'social_interaction']
      }
      // 他のタイプも同様に定義...
    };
    
    return patterns[mbtiType] || {
      preferredStyle: 'visual',
      processingSpeed: 'moderate',
      failureHandling: 'analytical',
      motivationFactors: ['achievement'],
      stressResponses: ['analysis']
    };
  }

  private calculateBehaviorPattern(mbtiType: MBTIType): BehaviorPattern {
    const patterns: Record<string, BehaviorPattern> = {
      'INTJ': {
        decisionMaking: 'logical',
        communicationStyle: 'direct',
        conflictResolution: 'confrontational'
      },
      'ENFP': {
        decisionMaking: 'emotional',
        communicationStyle: 'expressive',
        conflictResolution: 'collaborative'
      }
      // 他のタイプも同様に定義...
    };
    
    return patterns[mbtiType] || {
      decisionMaking: 'balanced',
      communicationStyle: 'direct',
      conflictResolution: 'collaborative'
    };
  }

  private calculateGrowthTendencies(mbtiType: MBTIType): GrowthTendency[] {
    const tendencies: Record<string, GrowthTendency[]> = {
      'INTJ': [
        {
          area: 'leadership',
          pattern: 'linear',
          speed: 'moderate',
          triggers: ['responsibility', 'expertise'],
          inhibitors: ['social_pressure', 'micromanagement']
        }
      ],
      'ENFP': [
        {
          area: 'creativity',
          pattern: 'exponential',
          speed: 'fast',
          triggers: ['inspiration', 'collaboration'],
          inhibitors: ['routine', 'criticism']
        }
      ]
      // 他のタイプも同様に定義...
    };
    
    return tendencies[mbtiType] || [];
  }

  private generateBehaviorPrediction(mbtiType: MBTIType, situation: string): BehaviorPrediction {
    // 状況とMBTIタイプに基づく行動予測
    return {
      situation,
      predictedResponse: `${mbtiType}タイプの典型的反応`,
      confidence: 0.7,
      alternativeResponses: ['代替反応1', '代替反応2'],
      influencingFactors: ['personality', 'experience', 'context']
    };
  }

  private initializeMBTIStatistics(): void {
    // 統計データの初期化（実際のデータで置き換える）
    const types: MBTIType[] = [
      'INTJ', 'INTP', 'ENTJ', 'ENTP',
      'INFJ', 'INFP', 'ENFJ', 'ENFP',
      'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
      'ISTP', 'ISFP', 'ESTP', 'ESFP'
    ];
    
    types.forEach(type => {
      this.mbtiStatistics.set(type, {
        sampleSize: 1000,
        commonTraits: [`${type}の一般的特性`],
        learningPreferences: this.calculateLearningPattern(type),
        compatibleTypes: [],
        conflictTypes: []
      });
    });
  }

  private generateOperationId(): string {
    return `mbti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}