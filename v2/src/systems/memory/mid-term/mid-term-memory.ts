/**
 * 中期記憶管理システム
 * 篇単位の分析結果、キャラクター進化、学習進捗を管理
 */

import type {
  IMidTermMemory,
  MidTermData
} from '../interfaces';
import type { OperationResult } from '@/types/common';
import type {
  SectionAnalysis,
  EvolutionHistory,
  TensionPattern,
  LearningProgress
} from '../types';
import { logger } from '@/core/infrastructure/logger';

export class MidTermMemory implements IMidTermMemory {
  private readonly maxRetentionDays = 90;
  private readonly maxItems = 5000;
  private readonly promotionThreshold = 0.8;
  
  private dataStore: Map<string, MidTermData> = new Map();
  private sectionAnalyses: Map<string, SectionAnalysis> = new Map();
  private characterEvolutions: Map<string, EvolutionHistory> = new Map();
  private tensionPatterns: TensionPattern[] = [];
  private learningProgressMap: Map<string, LearningProgress> = new Map();

  /**
   * 中期記憶にデータを保存
   */
  async store(data: MidTermData): Promise<OperationResult<void>> {
    const startTime = Date.now();
    
    try {
      // データ検証
      if (!this.validateData(data)) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid mid-term data'
          },
          metadata: {
            operationId: this.generateOperationId(),
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: 'memory.mid-term'
          }
        };
      }

      // 容量制限チェック
      await this.enforceCapacityLimit();

      // データ保存
      this.dataStore.set(data.id, data);
      
      // 篇分析データの特別処理
      await this.processSectionAnalysis(data);
      
      // キャラクター進化データの特別処理
      await this.processCharacterEvolution(data);
      
      // 学習進捗データの特別処理
      await this.processLearningProgress(data);
      
      // テンションパターンの更新
      await this.updateTensionPattern(data);

      logger.info(`Stored mid-term data: ${data.id} for section: ${data.sectionId}`);
      
      return {
        success: true,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.mid-term'
        }
      };
    } catch (error) {
      logger.error('Failed to store mid-term data:', error);
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to store mid-term data',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.mid-term'
        }
      };
    }
  }

  /**
   * 篇分析データを取得
   */
  async getSectionAnalysis(sectionId: string): Promise<OperationResult<MidTermData[]>> {
    const startTime = Date.now();
    
    try {
      const sectionData = Array.from(this.dataStore.values())
        .filter(data => data.sectionId === sectionId)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      return {
        success: true,
        data: sectionData,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.mid-term'
        }
      };
    } catch (error) {
      logger.error('Failed to get section analysis:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get section analysis',
          details: error
        },
        data: [],
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.mid-term'
        }
      };
    }
  }

  /**
   * キャラクター進化情報を取得
   */
  async getCharacterEvolution(characterId: string): Promise<OperationResult<any>> {
    const startTime = Date.now();
    
    try {
      const evolution = this.characterEvolutions.get(characterId);
      
      if (!evolution) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Character evolution data not found for ${characterId}`
          },
          metadata: {
            operationId: this.generateOperationId(),
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            systemId: 'memory.mid-term'
          }
        };
      }
      
      return {
        success: true,
        data: evolution,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.mid-term'
        }
      };
    } catch (error) {
      logger.error('Failed to get character evolution:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get character evolution',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.mid-term'
        }
      };
    }
  }

  /**
   * テンションパターンを取得
   */
  async getTensionPattern(): Promise<OperationResult<any>> {
    const startTime = Date.now();
    
    try {
      // 最新のテンションパターンを算出
      const latestPattern = this.calculateCurrentTensionPattern();
      
      return {
        success: true,
        data: {
          current: latestPattern,
          history: this.tensionPatterns.slice(-20), // 直近20件
          trend: this.analyzeTensionTrend(),
          prediction: this.predictNextTensionLevel()
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.mid-term'
        }
      };
    } catch (error) {
      logger.error('Failed to get tension pattern:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get tension pattern',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.mid-term'
        }
      };
    }
  }

  /**
   * 学習進捗を取得
   */
  async getLearningProgress(): Promise<OperationResult<Map<string, any>>> {
    const startTime = Date.now();
    
    try {
      const progressData = new Map<string, any>();
      
      // 各キャラクターの学習進捗を統合
      this.learningProgressMap.forEach((progress, characterId) => {
        progressData.set(characterId, {
          ...progress,
          completion: this.calculateCompletionRate(progress),
          nextMilestone: this.getNextMilestone(progress),
          estimatedCompletion: this.estimateCompletionTime(progress)
        });
      });
      
      return {
        success: true,
        data: progressData,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.mid-term'
        }
      };
    } catch (error) {
      logger.error('Failed to get learning progress:', error);
      return {
        success: false,
        error: {
          code: 'RETRIEVAL_ERROR',
          message: 'Failed to get learning progress',
          details: error
        },
        data: new Map(),
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.mid-term'
        }
      };
    }
  }

  /**
   * 長期記憶への昇格
   */
  async promoteToLongTerm(): Promise<OperationResult<void>> {
    const startTime = Date.now();
    
    try {
      let promotionCount = 0;
      
      // 高重要度データを長期記憶へ昇格
      for (const [id, data] of this.dataStore.entries()) {
        if (this.shouldPromoteToLongTerm(data)) {
          // TODO: 長期記憶への昇格処理を実装
          logger.info(`Promoting data ${id} to long-term memory`);
          promotionCount++;
        }
      }
      
      return {
        success: true,
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.mid-term',
          additionalInfo: { promotionCount }
        }
      };
    } catch (error) {
      logger.error('Failed to promote to long-term:', error);
      return {
        success: false,
        error: {
          code: 'PROMOTION_ERROR',
          message: 'Failed to promote to long-term',
          details: error
        },
        metadata: {
          operationId: this.generateOperationId(),
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          systemId: 'memory.mid-term'
        }
      };
    }
  }

  // プライベートメソッド

  private validateData(data: MidTermData): boolean {
    if (!data.id || !data.timestamp || !data.dataType || !data.content) {
      return false;
    }
    
    if (!data.sectionId) {
      return false;
    }
    
    if (!data.metadata || typeof data.metadata.importance !== 'number') {
      return false;
    }
    
    return true;
  }

  private async enforceCapacityLimit(): Promise<void> {
    if (this.dataStore.size >= this.maxItems) {
      const itemsToRemove = this.selectDataForEviction();
      itemsToRemove.forEach(item => {
        this.dataStore.delete(item.id);
      });
    }
  }

  private selectDataForEviction(): MidTermData[] {
    const sortedData = Array.from(this.dataStore.values())
      .sort((a, b) => {
        // 重要度が低い順、同じなら古い順
        const importanceDiff = (a.metadata.importance || 0) - (b.metadata.importance || 0);
        if (importanceDiff !== 0) return importanceDiff;
        return a.timestamp.getTime() - b.timestamp.getTime();
      });
    
    const removeCount = Math.ceil(this.maxItems * 0.1);
    return sortedData.slice(0, removeCount);
  }

  private async processSectionAnalysis(data: MidTermData): Promise<void> {
    if (data.dataType === 'section_analysis') {
      // 篇分析データの特別処理
      const analysis: SectionAnalysis = {
        sectionId: data.sectionId,
        chapters: [], // data.contentから抽出
        mainTheme: '', // data.contentから抽出
        characterGrowth: new Map(),
        learningAchievements: [],
        emotionalPeaks: []
      };
      
      this.sectionAnalyses.set(data.sectionId, analysis);
    }
  }

  private async processCharacterEvolution(data: MidTermData): Promise<void> {
    if (data.characterEvolution) {
      data.characterEvolution.forEach((evolution, characterId) => {
        if (!this.characterEvolutions.has(characterId)) {
          this.characterEvolutions.set(characterId, {
            characterId,
            stages: []
          });
        }
        
        const history = this.characterEvolutions.get(characterId)!;
        // 進化ステージを追加
        history.stages.push({
          timestamp: data.timestamp,
          fromState: evolution.fromState,
          toState: evolution.toState,
          trigger: evolution.trigger || 'unknown',
          growthType: evolution.growthType || 'general'
        });
      });
    }
  }

  private async processLearningProgress(data: MidTermData): Promise<void> {
    if (data.learningStages) {
      data.learningStages.forEach((stage, characterId) => {
        const progress: LearningProgress = {
          frameworkId: stage.frameworkId || 'unknown',
          characterId,
          currentStage: stage.currentStage || 0,
          completionPercentage: stage.completionPercentage || 0,
          failureCount: stage.failureCount || 0,
          breakthroughs: stage.breakthroughs || []
        };
        
        this.learningProgressMap.set(characterId, progress);
      });
    }
  }

  private async updateTensionPattern(data: MidTermData): Promise<void> {
    // テンションレベルが含まれている場合のみ処理
    if (typeof data.content?.tensionLevel === 'number') {
      const pattern: TensionPattern = {
        pattern: this.determineTensionPattern(),
        averageTension: this.calculateAverageTension(),
        variability: this.calculateTensionVariability(),
        predictedNext: this.predictNextTensionLevel()
      };
      
      this.tensionPatterns.push(pattern);
      
      // パターン履歴のサイズ制限
      if (this.tensionPatterns.length > 1000) {
        this.tensionPatterns = this.tensionPatterns.slice(-500);
      }
    }
  }

  private shouldPromoteToLongTerm(data: MidTermData): boolean {
    // 高重要度データ、または特定のデータタイプを昇格対象とする
    if (data.metadata.importance >= this.promotionThreshold) {
      return true;
    }
    
    // キャラクターの重要な進化データ
    if (data.dataType === 'character_evolution' && data.characterEvolution) {
      return true;
    }
    
    // 重要な学習達成データ
    if (data.dataType === 'learning_achievement' && data.learningStages) {
      return true;
    }
    
    return false;
  }

  private calculateCurrentTensionPattern(): TensionPattern {
    return {
      pattern: this.determineTensionPattern(),
      averageTension: this.calculateAverageTension(),
      variability: this.calculateTensionVariability(),
      predictedNext: this.predictNextTensionLevel()
    };
  }

  private determineTensionPattern(): 'escalating' | 'cyclic' | 'steady' | 'chaotic' {
    // TODO: 実際のテンションデータを分析してパターンを特定
    return 'steady';
  }

  private calculateAverageTension(): number {
    // TODO: 実際のテンションデータから平均を算出
    return 0.5;
  }

  private calculateTensionVariability(): number {
    // TODO: テンションの変動幅を算出
    return 0.2;
  }

  private predictNextTensionLevel(): number {
    // TODO: 次のテンションレベルを予測
    return 0.6;
  }

  private analyzeTensionTrend(): string {
    // TODO: テンショントレンドを分析
    return 'stable';
  }

  private calculateCompletionRate(progress: LearningProgress): number {
    // 学習進捗の完了率を算出
    return progress.completionPercentage / 100;
  }

  private getNextMilestone(progress: LearningProgress): string {
    // 次のマイルストーンを算出
    return `Stage ${progress.currentStage + 1}`;
  }

  private estimateCompletionTime(progress: LearningProgress): Date {
    // 完了予定時刻を算出
    const daysRemaining = (100 - progress.completionPercentage) * 2; // 仮の算出
    return new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000);
  }

  private generateOperationId(): string {
    return `mtm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}