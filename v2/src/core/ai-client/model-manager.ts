/**
 * Version 2.0 - AIモデル管理
 * 
 * 利用可能なAIモデルの管理と最適選択
 */

import {
  AIModel,
  AIProvider,
  AIModelType,
  ModelRequirements,
  ModelPerformance,
  AICapability
} from '@/types/ai-client';

interface ModelManagerConfig {
  logger?: any;
}

export class ModelManager {
  private models = new Map<string, AIModel>();
  private logger: any;

  constructor(config: ModelManagerConfig) {
    this.logger = config.logger || console;
    this.initializeDefaultModels();
  }

  // ============================================================================
  // モデル管理
  // ============================================================================

  async getAllModels(): Promise<AIModel[]> {
    return Array.from(this.models.values());
  }

  async getModel(id: string): Promise<AIModel | null> {
    return this.models.get(id) || null;
  }

  async getModelsByProvider(provider: AIProvider): Promise<AIModel[]> {
    return Array.from(this.models.values()).filter(model => model.provider === provider);
  }

  async getModelsByType(type: AIModelType): Promise<AIModel[]> {
    return Array.from(this.models.values()).filter(model => model.type === type);
  }

  async selectOptimalModel(type: AIModelType, requirements: ModelRequirements): Promise<AIModel> {
    const candidateModels = await this.getModelsByType(type);
    
    if (candidateModels.length === 0) {
      throw new Error(`No models available for type: ${type}`);
    }

    // 要件に基づいてフィルタリング
    const suitableModels = candidateModels.filter(model => 
      this.meetsRequirements(model, requirements)
    );

    if (suitableModels.length === 0) {
      this.logger.warn(`No models meet requirements for ${type}, using best available`);
      return this.selectBestModel(candidateModels, requirements);
    }

    return this.selectBestModel(suitableModels, requirements);
  }

  // ============================================================================
  // モデル登録
  // ============================================================================

  registerModel(model: AIModel): void {
    this.models.set(model.id, model);
    this.logger.info(`Registered AI model: ${model.id} (${model.provider})`);
  }

  unregisterModel(modelId: string): boolean {
    const removed = this.models.delete(modelId);
    if (removed) {
      this.logger.info(`Unregistered AI model: ${modelId}`);
    }
    return removed;
  }

  updateModelPerformance(modelId: string, performance: Partial<ModelPerformance>): void {
    const model = this.models.get(modelId);
    if (model) {
      model.performance = { ...model.performance, ...performance };
      this.logger.debug(`Updated performance metrics for model: ${modelId}`);
    }
  }

  // ============================================================================
  // プライベートメソッド
  // ============================================================================

  private initializeDefaultModels(): void {
    // Gemini モデル
    this.registerModel({
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: AIProvider.GEMINI,
      type: AIModelType.TEXT_GENERATION,
      version: '1.5',
      maxTokens: 2097152,
      costPerToken: 0.00001,
      capabilities: [
        { name: 'text-generation', supported: true, quality: 0.95, speed: 0.8 },
        { name: 'text-analysis', supported: true, quality: 0.92, speed: 0.85 },
        { name: 'multimodal', supported: true, quality: 0.88, speed: 0.7 },
        { name: 'long-context', supported: true, quality: 0.9, speed: 0.6 }
      ],
      performance: {
        averageLatency: 2000,
        throughput: 50,
        reliability: 0.98,
        qualityScore: 0.94
      }
    });

    this.registerModel({
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: AIProvider.GEMINI,
      type: AIModelType.TEXT_GENERATION,
      version: '1.5',
      maxTokens: 1048576,
      costPerToken: 0.000005,
      capabilities: [
        { name: 'text-generation', supported: true, quality: 0.88, speed: 0.95 },
        { name: 'text-analysis', supported: true, quality: 0.85, speed: 0.95 },
        { name: 'fast-response', supported: true, quality: 0.82, speed: 0.98 }
      ],
      performance: {
        averageLatency: 800,
        throughput: 120,
        reliability: 0.96,
        qualityScore: 0.86
      }
    });

    // OpenAI モデル
    this.registerModel({
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: AIProvider.OPENAI,
      type: AIModelType.TEXT_GENERATION,
      version: '4o',
      maxTokens: 128000,
      costPerToken: 0.00003,
      capabilities: [
        { name: 'text-generation', supported: true, quality: 0.96, speed: 0.75 },
        { name: 'text-analysis', supported: true, quality: 0.94, speed: 0.8 },
        { name: 'reasoning', supported: true, quality: 0.95, speed: 0.7 }
      ],
      performance: {
        averageLatency: 2500,
        throughput: 40,
        reliability: 0.97,
        qualityScore: 0.95
      }
    });

    this.registerModel({
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: AIProvider.OPENAI,
      type: AIModelType.TEXT_GENERATION,
      version: '4o-mini',
      maxTokens: 128000,
      costPerToken: 0.000002,
      capabilities: [
        { name: 'text-generation', supported: true, quality: 0.85, speed: 0.9 },
        { name: 'text-analysis', supported: true, quality: 0.82, speed: 0.92 },
        { name: 'cost-effective', supported: true, quality: 0.8, speed: 0.95 }
      ],
      performance: {
        averageLatency: 1200,
        throughput: 80,
        reliability: 0.95,
        qualityScore: 0.84
      }
    });

    // Claude モデル
    this.registerModel({
      id: 'claude-3-5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: AIProvider.CLAUDE,
      type: AIModelType.TEXT_GENERATION,
      version: '3.5',
      maxTokens: 200000,
      costPerToken: 0.000015,
      capabilities: [
        { name: 'text-generation', supported: true, quality: 0.97, speed: 0.8 },
        { name: 'text-analysis', supported: true, quality: 0.95, speed: 0.85 },
        { name: 'reasoning', supported: true, quality: 0.96, speed: 0.78 },
        { name: 'safety', supported: true, quality: 0.98, speed: 0.8 }
      ],
      performance: {
        averageLatency: 2200,
        throughput: 45,
        reliability: 0.98,
        qualityScore: 0.96
      }
    });

    this.logger.info(`Initialized ${this.models.size} default AI models`);
  }

  private meetsRequirements(model: AIModel, requirements: ModelRequirements): boolean {
    // 基本要件チェック
    if (model.type !== requirements.type) {
      return false;
    }

    // 品質要件
    if (model.performance.qualityScore < requirements.minQuality) {
      return false;
    }

    // レイテンシ要件
    if (model.performance.averageLatency > requirements.maxLatency) {
      return false;
    }

    // コスト要件
    if (model.costPerToken > requirements.maxCost) {
      return false;
    }

    // 機能要件
    for (const requiredCapability of requirements.capabilities) {
      const capability = model.capabilities.find(c => c.name === requiredCapability);
      if (!capability || !capability.supported) {
        return false;
      }
    }

    return true;
  }

  private selectBestModel(models: AIModel[], requirements: ModelRequirements): AIModel {
    return models.reduce((best, current) => {
      const bestScore = this.calculateScore(best, requirements);
      const currentScore = this.calculateScore(current, requirements);
      return currentScore > bestScore ? current : best;
    });
  }

  private calculateScore(model: AIModel, requirements: ModelRequirements): number {
    let score = 0;

    // 品質スコア (40%)
    score += model.performance.qualityScore * 0.4;

    // 速度スコア (30%) - レイテンシの逆数を正規化
    const speedScore = Math.max(0, 1 - (model.performance.averageLatency / requirements.maxLatency));
    score += speedScore * 0.3;

    // 信頼性スコア (20%)
    score += model.performance.reliability * 0.2;

    // コスト効率スコア (10%) - コストの逆数を正規化
    const costScore = Math.max(0, 1 - (model.costPerToken / requirements.maxCost));
    score += costScore * 0.1;

    return score;
  }

  // ============================================================================
  // 統計・分析
  // ============================================================================

  getModelStatistics(): {
    totalModels: number;
    byProvider: Record<AIProvider, number>;
    byType: Record<AIModelType, number>;
    averageQuality: number;
    averageLatency: number;
  } {
    const models = Array.from(this.models.values());
    
    const byProvider = models.reduce((acc, model) => {
      acc[model.provider] = (acc[model.provider] || 0) + 1;
      return acc;
    }, {} as Record<AIProvider, number>);

    const byType = models.reduce((acc, model) => {
      acc[model.type] = (acc[model.type] || 0) + 1;
      return acc;
    }, {} as Record<AIModelType, number>);

    const averageQuality = models.reduce((sum, model) => 
      sum + model.performance.qualityScore, 0) / models.length;

    const averageLatency = models.reduce((sum, model) => 
      sum + model.performance.averageLatency, 0) / models.length;

    return {
      totalModels: models.length,
      byProvider,
      byType,
      averageQuality,
      averageLatency
    };
  }

  findOptimalModelForTask(taskDescription: string): AIModel | null {
    // タスク内容に基づいてモデルを推奨（簡易実装）
    const lowerTask = taskDescription.toLowerCase();

    if (lowerTask.includes('creative') || lowerTask.includes('story') || lowerTask.includes('novel')) {
      // 創作タスクには高品質モデル
      return this.findModelById('claude-3-5-sonnet') || this.findModelById('gpt-4o');
    }

    if (lowerTask.includes('analysis') || lowerTask.includes('review') || lowerTask.includes('quality')) {
      // 分析タスクには分析能力の高いモデル
      return this.findModelById('gemini-1.5-pro') || this.findModelById('gpt-4o');
    }

    if (lowerTask.includes('fast') || lowerTask.includes('quick') || lowerTask.includes('batch')) {
      // 高速処理には軽量モデル
      return this.findModelById('gemini-1.5-flash') || this.findModelById('gpt-4o-mini');
    }

    // デフォルトはバランスの良いモデル
    return this.findModelById('gemini-1.5-pro');
  }

  private findModelById(id: string): AIModel | null {
    return this.models.get(id) || null;
  }
}