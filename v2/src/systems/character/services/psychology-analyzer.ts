/**
 * 心理分析サービス
 * キャラクターの心理プロファイル分析、行動予測、感情分析を提供
 */

import type {
  IPsychologyAnalyzer,
  Character,
  PersonalityAssessment,
  BehaviorPrediction,
  EmotionalProfile,
  EmotionalEvolution
} from '../interfaces';
import type { OperationResult } from '@/types/common';
import { logger } from '@/core/infrastructure/logger';

export class PsychologyAnalyzer implements IPsychologyAnalyzer {
  private readonly systemId = 'character.psychology';

  /**
   * 性格分析
   */
  async analyzePersonality(character: Character): Promise<OperationResult<PersonalityAssessment>> {
    const startTime = Date.now();
    
    try {
      const assessment: PersonalityAssessment = {
        mbtiAnalysis: {
          determinedType: character.mbtiProfile.type,
          confidence: character.mbtiProfile.confidence,
          alternativeTypes: [],
          dimensionScores: {
            EI: character.mbtiProfile.dimensions.extraversion,
            SN: 1 - character.mbtiProfile.dimensions.sensing,
            TF: 1 - character.mbtiProfile.dimensions.thinking,
            JP: character.mbtiProfile.dimensions.judging
          },
          typicalBehaviors: this.extractTypicalBehaviors(character),
          stressIndicators: this.identifyStressIndicators(character)
        },
        bigFiveScores: character.personalityTraits,
        characterStrengths: this.identifyStrengths(character),
        characterWeaknesses: this.identifyWeaknesses(character),
        behaviorPredictions: await this.generateBehaviorPredictions(character),
        consistency: this.calculatePersonalityConsistency(character)
      };

      return {
        success: true,
        data: assessment,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to analyze personality:', error);
      return {
        success: false,
        error: {
          code: 'ANALYSIS_ERROR',
          message: 'Failed to analyze personality',
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
   * 行動予測
   */
  async predictBehavior(character: Character, situation: string): Promise<OperationResult<BehaviorPrediction>> {
    const startTime = Date.now();
    
    try {
      const prediction = this.generateSituationalBehaviorPrediction(character, situation);
      
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
   * 感情状態分析
   */
  async analyzeEmotionalState(character: Character): Promise<OperationResult<EmotionalProfile>> {
    const startTime = Date.now();
    
    try {
      const profile: EmotionalProfile = {
        dominantEmotions: this.identifyDominantEmotions(character),
        emotionalRange: this.calculateEmotionalRange(character),
        stability: character.currentState.emotionalState.stability,
        triggers: character.currentState.emotionalState.triggers,
        copingMechanisms: this.identifyCopingMechanisms(character)
      };

      return {
        success: true,
        data: profile,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to analyze emotional state:', error);
      return {
        success: false,
        error: {
          code: 'ANALYSIS_ERROR',
          message: 'Failed to analyze emotional state',
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
   * 感情進化追跡
   */
  async trackEmotionalEvolution(characterId: string): Promise<OperationResult<EmotionalEvolution>> {
    const startTime = Date.now();
    
    try {
      // TODO: 実際の実装では履歴データから感情進化を追跡
      const evolution: EmotionalEvolution = {
        characterId,
        timeline: [],
        trends: ['安定化傾向', '感情表現の豊富化'],
        patterns: ['ストレス時の内向化', '成功時の外向化']
      };

      return {
        success: true,
        data: evolution,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: this.systemId
        }
      };
    } catch (error) {
      logger.error('Failed to track emotional evolution:', error);
      return {
        success: false,
        error: {
          code: 'TRACKING_ERROR',
          message: 'Failed to track emotional evolution',
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

  private extractTypicalBehaviors(character: Character): string[] {
    const behaviors: string[] = [];
    
    // MBTIタイプに基づく典型的行動
    const mbtiType = character.mbtiProfile.type;
    if (mbtiType.includes('E')) {
      behaviors.push('積極的な社交');
    } else {
      behaviors.push('内省的思考');
    }
    
    if (mbtiType.includes('T')) {
      behaviors.push('論理的判断');
    } else {
      behaviors.push('感情的配慮');
    }
    
    // 性格特性に基づく行動
    if (character.personalityTraits.openness > 0.7) {
      behaviors.push('新しい経験への開放性');
    }
    
    if (character.personalityTraits.conscientiousness > 0.7) {
      behaviors.push('責任感の強い行動');
    }
    
    return behaviors;
  }

  private identifyStressIndicators(character: Character): string[] {
    const indicators: string[] = [];
    
    // 神経症的傾向が高い場合
    if (character.personalityTraits.neuroticism > 0.7) {
      indicators.push('不安の増大', '感情の不安定化');
    }
    
    // 外向性が低い場合
    if (character.personalityTraits.extraversion < 0.3) {
      indicators.push('社交回避', '孤立傾向');
    }
    
    // 現在のストレスレベル
    if (character.currentState.stressLevel > 0.7) {
      indicators.push('集中力低下', '意思決定の困難');
    }
    
    return indicators;
  }

  private identifyStrengths(character: Character): string[] {
    const strengths: string[] = [];
    
    // 各特性が高い場合の強み
    if (character.personalityTraits.openness > 0.7) {
      strengths.push('創造性', '適応性');
    }
    
    if (character.personalityTraits.conscientiousness > 0.7) {
      strengths.push('責任感', '組織力');
    }
    
    if (character.personalityTraits.extraversion > 0.7) {
      strengths.push('コミュニケーション能力', 'リーダーシップ');
    }
    
    if (character.personalityTraits.agreeableness > 0.7) {
      strengths.push('協調性', '共感力');
    }
    
    if (character.personalityTraits.emotionalStability > 0.7) {
      strengths.push('ストレス耐性', '感情制御');
    }
    
    return strengths;
  }

  private identifyWeaknesses(character: Character): string[] {
    const weaknesses: string[] = [];
    
    // 各特性が低い場合の弱み
    if (character.personalityTraits.openness < 0.3) {
      weaknesses.push('変化への抵抗', '固定的思考');
    }
    
    if (character.personalityTraits.conscientiousness < 0.3) {
      weaknesses.push('計画性の欠如', '責任回避');
    }
    
    if (character.personalityTraits.extraversion < 0.3) {
      weaknesses.push('社交不安', 'コミュニケーション困難');
    }
    
    if (character.personalityTraits.agreeableness < 0.3) {
      weaknesses.push('協調性の欠如', '対立傾向');
    }
    
    if (character.personalityTraits.neuroticism > 0.7) {
      weaknesses.push('感情不安定', 'ストレス脆弱性');
    }
    
    return weaknesses;
  }

  private async generateBehaviorPredictions(character: Character): Promise<BehaviorPrediction[]> {
    const predictions: BehaviorPrediction[] = [];
    
    // 一般的な状況での行動予測
    const situations = [
      '困難な課題に直面した時',
      'チームでの協力が必要な時',
      '批判を受けた時',
      '新しい環境に置かれた時'
    ];
    
    for (const situation of situations) {
      predictions.push(this.generateSituationalBehaviorPrediction(character, situation));
    }
    
    return predictions;
  }

  private generateSituationalBehaviorPrediction(character: Character, situation: string): BehaviorPrediction {
    let predictedResponse = '';
    let confidence = 0.7;
    const alternativeResponses: string[] = [];
    const influencingFactors: string[] = [];
    
    // MBTIタイプと性格特性に基づく予測
    const mbtiType = character.mbtiProfile.type;
    const traits = character.personalityTraits;
    
    if (situation.includes('困難')) {
      if (mbtiType.includes('T')) {
        predictedResponse = '論理的分析と体系的アプローチ';
        alternativeResponses.push('専門家への相談', '段階的問題解決');
      } else {
        predictedResponse = '感情的サポート求取と直感的対応';
        alternativeResponses.push('チームワーク重視', '創造的解決策');
      }
      
      if (traits.conscientiousness > 0.7) {
        influencingFactors.push('高い責任感', '計画的思考');
      }
    }
    
    if (situation.includes('チーム')) {
      if (traits.extraversion > 0.7) {
        predictedResponse = '積極的なリーダーシップ発揮';
        confidence = 0.8;
      } else {
        predictedResponse = 'サポート役として貢献';
        confidence = 0.7;
      }
      
      if (traits.agreeableness > 0.7) {
        influencingFactors.push('協調性', '他者への配慮');
      }
    }
    
    return {
      situation,
      predictedResponse,
      confidence,
      alternativeResponses,
      influencingFactors
    };
  }

  private calculatePersonalityConsistency(character: Character): number {
    // 性格特性とMBTIプロファイルの一貫性を計算
    const mbtiDimensions = character.mbtiProfile.dimensions;
    const traits = character.personalityTraits;
    
    // 外向性の一貫性
    const extraversionConsistency = 1 - Math.abs(traits.extraversion - mbtiDimensions.extraversion);
    
    // 思考感情次元の一貫性
    const thinkingConsistency = 1 - Math.abs((1 - traits.agreeableness) - mbtiDimensions.thinking);
    
    // 判断知覚次元の一貫性
    const judgingConsistency = 1 - Math.abs(traits.conscientiousness - mbtiDimensions.judging);
    
    return (extraversionConsistency + thinkingConsistency + judgingConsistency) / 3;
  }

  private identifyDominantEmotions(character: Character): string[] {
    const emotions: string[] = [];
    
    // 現在の感情状態
    emotions.push(character.currentState.emotionalState.primary);
    if (character.currentState.emotionalState.secondary) {
      emotions.push(character.currentState.emotionalState.secondary);
    }
    
    // 性格特性に基づく傾向的感情
    if (character.personalityTraits.neuroticism > 0.7) {
      emotions.push('不安', '緊張');
    }
    
    if (character.personalityTraits.extraversion > 0.7) {
      emotions.push('興奮', '喜び');
    }
    
    return [...new Set(emotions)]; // 重複除去
  }

  private calculateEmotionalRange(character: Character): number {
    // 性格特性に基づく感情の幅の計算
    const neuroticism = character.personalityTraits.neuroticism;
    const extraversion = character.personalityTraits.extraversion;
    const openness = character.personalityTraits.openness;
    
    // 神経症傾向、外向性、開放性が高いほど感情の幅が広い
    return (neuroticism + extraversion + openness) / 3;
  }

  private identifyCopingMechanisms(character: Character): string[] {
    const mechanisms: string[] = [];
    
    // MBTIタイプに基づく対処法
    const mbtiType = character.mbtiProfile.type;
    
    if (mbtiType.includes('I')) {
      mechanisms.push('内省と自己分析', '一人の時間の確保');
    } else {
      mechanisms.push('他者との対話', '社会的支援の活用');
    }
    
    if (mbtiType.includes('T')) {
      mechanisms.push('論理的分析', '問題解決アプローチ');
    } else {
      mechanisms.push('感情表現', '共感的サポート');
    }
    
    // 性格特性に基づく対処法
    if (character.personalityTraits.conscientiousness > 0.7) {
      mechanisms.push('計画的対応', '段階的解決');
    }
    
    if (character.personalityTraits.openness > 0.7) {
      mechanisms.push('創造的解決', '新しい視点の探求');
    }
    
    return mechanisms;
  }

  private generateOperationId(): string {
    return `psych_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}