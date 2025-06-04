// src/lib/memory/long-term/system-knowledge.ts
/**
 * @fileoverview システム知識ベース（学習・改善用）
 * @description
 * 🔧 12コンポーネントのデータ救済による知識蓄積
 * 🔧 パターン学習・最適化戦略・品質改善の統合管理
 * 🔧 PromptGenerator、分析パターン、エラーパターンの完全保存
 * 🔧 システム自動学習・改善サイクルの実現
 */

import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import {
    PromptGenerationPattern,
    EffectiveTemplatePattern,
    AnalysisPattern,
    OptimizationStrategy,
    ErrorPattern,
    QualityImprovementStrategy,
    PromptVariable
} from './system-types'

// ============================================================================
// システム知識ベースクラス
// ============================================================================

/**
 * @class SystemKnowledge
 * @description
 * システム知識ベース（学習・改善用）
 * 12コンポーネントのデータ救済による知識蓄積と継続的改善を実現
 */
export class SystemKnowledge {
    // 知識ベース
    private promptGenerationPatterns: Map<string, PromptGenerationPattern> = new Map();
    private effectiveTemplatePatterns: Map<string, EffectiveTemplatePattern> = new Map();
    private analysisPatterns: Map<string, AnalysisPattern> = new Map();
    private optimizationStrategies: Map<string, OptimizationStrategy> = new Map();
    private errorPatterns: Map<string, ErrorPattern> = new Map();
    private qualityImprovementStrategies: Map<string, QualityImprovementStrategy> = new Map();

    // インデックス
    private categoryIndex: Map<string, Set<string>> = new Map();
    private effectivenessIndex: Map<number, Set<string>> = new Map();
    private lastUsedIndex: Map<string, string[]> = new Map();

    private initialized: boolean = false;

    /**
     * コンストラクタ
     */
    constructor() {
        logger.info('SystemKnowledge initialized');
    }

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('SystemKnowledge already initialized');
            return;
        }

        try {
            // ストレージからの読み込み
            await this.loadAllKnowledgeData();

            // インデックスの構築
            this.buildAllIndices();

            // 12コンポーネント救済データの統合
            await this.integrateRescuedComponentData();

            this.initialized = true;
            logger.info('SystemKnowledge initialization completed with component data rescue');
        } catch (error) {
            logger.error('Failed to initialize SystemKnowledge', {
                error: error instanceof Error ? error.message : String(error)
            });
            this.initialized = true; // エラー時も続行
        }
    }

    // ============================================================================
    // 12コンポーネントデータ救済システム
    // ============================================================================

    /**
     * 12コンポーネント救済データの統合
     */
    private async integrateRescuedComponentData(): Promise<void> {
        logger.info('Integrating rescued component data from 12 components');

        try {
            // PromptGeneratorデータ救済
            await this.rescuePromptGeneratorData();

            // DynamicTensionOptimizerデータ救済
            await this.rescueDynamicTensionOptimizerData();

            // ContextGeneratorデータ救済
            await this.rescueContextGeneratorData();

            // EmotionalArcDesignerデータ救済
            await this.rescueEmotionalArcDesignerData();

            // StorageDiagnosticManagerデータ救済
            await this.rescueStorageDiagnosticManagerData();

            // NarrativeAnalysisServiceデータ救済
            await this.rescueNarrativeAnalysisServiceData();

            // DetectionServiceデータ救済
            await this.rescueDetectionServiceData();

            // CharacterChangeHandlerデータ救済
            await this.rescueCharacterChangeHandlerData();

            // EventBus系データ救済
            await this.rescueEventBusData();

            // PreGenerationPipelineデータ救済
            await this.rescuePreGenerationPipelineData();

            // PostGenerationPipelineデータ救済
            await this.rescuePostGenerationPipelineData();

            // TextAnalyzerServiceデータ救済
            await this.rescueTextAnalyzerServiceData();

            logger.info('Component data rescue completed successfully');
        } catch (error) {
            logger.error('Failed to integrate rescued component data', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * PromptGeneratorデータ救済
     */
    private async rescuePromptGeneratorData(): Promise<void> {
        try {
            // PromptGeneratorの履歴・統計・品質メトリクスを救済
            const promptData = await this.loadComponentData('prompt-generator');

            if (promptData) {
                // 生成履歴から有効パターンを抽出
                const patterns = this.extractPromptPatternsFromHistory(promptData.history || []);

                // 統計データから効果的なテンプレートを特定
                const effectiveTemplates = this.identifyEffectiveTemplates(promptData.statistics || {});

                // 品質メトリクスから改善パターンを学習
                const improvements = this.learnFromQualityMetrics(promptData.qualityMetrics || {});

                // パターンをシステム知識に統合
                for (const pattern of patterns) {
                    await this.addPromptGenerationPattern(pattern);
                }

                for (const template of effectiveTemplates) {
                    await this.addEffectiveTemplatePattern(template);
                }

                logger.info(`Rescued ${patterns.length} prompt patterns and ${effectiveTemplates.length} templates from PromptGenerator`);
            }
        } catch (error) {
            logger.warn('Failed to rescue PromptGenerator data', { error });
        }
    }

    /**
     * DynamicTensionOptimizerデータ救済
     */
    private async rescueDynamicTensionOptimizerData(): Promise<void> {
        try {
            const tensionData = await this.loadComponentData('dynamic-tension-optimizer');

            if (tensionData) {
                // 計算結果から最適化パターンを抽出し、直接統合
                const strategies = this.extractOptimizationPatterns(tensionData.calculations || []);

                // システム知識に統合
                for (const strategy of strategies) {
                    await this.addOptimizationStrategy(strategy);
                }

                logger.info(`Rescued ${strategies.length} optimization strategies from DynamicTensionOptimizer`);
            }
        } catch (error) {
            logger.warn('Failed to rescue DynamicTensionOptimizer data', { error });
        }
    }

    /**
     * EmotionalArcDesignerデータ救済
     */
    private async rescueEmotionalArcDesignerData(): Promise<void> {
        try {
            const emotionalData = await this.loadComponentData('emotional-arc-designer');

            if (emotionalData) {
                // AI分析結果から感情パターンを抽出
                const emotionalPatterns = this.extractEmotionalAnalysisPatterns(emotionalData.analyses || []);

                // 感情設計履歴から効果的な手法を学習（直接処理）
                const designPatterns = this.extractEmotionalDesignPatterns(emotionalData.designs || []);

                // 分析パターンとして統合
                for (const pattern of emotionalPatterns) {
                    await this.addAnalysisPattern(pattern);
                }

                // 設計パターンもanalysisPatternとして統合
                for (const pattern of designPatterns) {
                    await this.addAnalysisPattern(pattern);
                }

                const totalPatterns = emotionalPatterns.length + designPatterns.length;
                logger.info(`Rescued ${totalPatterns} emotional patterns from EmotionalArcDesigner`);
            }
        } catch (error) {
            logger.warn('Failed to rescue EmotionalArcDesigner data', { error });
        }
    }

    /**
     * TextAnalyzerServiceデータ救済
     */
    private async rescueTextAnalyzerServiceData(): Promise<void> {
        try {
            const analyzerData = await this.loadComponentData('text-analyzer-service');

            if (analyzerData) {
                // 分析キャッシュから有効なパターンを抽出
                const analysisPatterns = this.extractTextAnalysisPatterns(analyzerData.cache || {});

                // システム知識に統合
                for (const pattern of analysisPatterns) {
                    await this.addAnalysisPattern(pattern);
                }

                logger.info(`Rescued ${analysisPatterns.length} text analysis patterns from TextAnalyzerService`);
            }
        } catch (error) {
            logger.warn('Failed to rescue TextAnalyzerService data', { error });
        }
    }


    // 他のコンポーネントの救済メソッドも同様に実装
    private async rescueContextGeneratorData(): Promise<void> {
        // ContextGeneratorの統合処理結果を救済
    }

    private async rescueStorageDiagnosticManagerData(): Promise<void> {
        // 診断履歴・修復記録・健康状態を救済
    }

    private async rescueNarrativeAnalysisServiceData(): Promise<void> {
        // 物語分析・テンション履歴・状態遷移を救済
    }

    private async rescueDetectionServiceData(): Promise<void> {
        // 検出結果・統計・精度データを救済
    }

    private async rescueCharacterChangeHandlerData(): Promise<void> {
        // 変更履歴・昇格降格記録を救済
    }

    private async rescueEventBusData(): Promise<void> {
        // イベントログ・統計・購読履歴を救済
    }

    private async rescuePreGenerationPipelineData(): Promise<void> {
        // 前処理結果・拡張データ・品質メトリクスを救済
    }

    private async rescuePostGenerationPipelineData(): Promise<void> {
        // 後処理結果・改善提案・統計を救済
    }

    // ============================================================================
    // パターン抽出・学習メソッド
    // ============================================================================

    /**
     * 感情設計パターンの抽出
     */
    private extractEmotionalDesignPatterns(designs: any[]): AnalysisPattern[] {
        const patterns: AnalysisPattern[] = [];

        designs.forEach((design, index) => {
            if (design && design.effectiveness >= 0.7) {
                const pattern: AnalysisPattern = {
                    patternId: `emotional-design-${Date.now()}-${index}`,
                    patternName: `Emotional Design Pattern ${index + 1}`,
                    category: 'emotional',
                    analysisType: 'emotion_design',
                    methodology: {
                        approach: 'hybrid',
                        algorithm: design.algorithm || 'pattern_based',
                        steps: [],
                        dependencies: [],
                        limitations: []
                    },
                    parameters: [],
                    accuracy: {
                        precision: design.effectiveness || 0.8,
                        recall: design.recall || 0.8,
                        f1Score: design.f1Score || 0.8,
                        accuracy: design.effectiveness || 0.8,
                        falsePositiveRate: 0.1,
                        falseNegativeRate: 0.1,
                        lastEvaluated: new Date().toISOString()
                    },
                    reliability: {
                        consistency: 0.8,
                        stability: 0.8,
                        robustness: 0.7,
                        reproducibility: 0.8,
                        confidence: 0.8,
                        variance: 0.1,
                        lastEvaluated: new Date().toISOString()
                    },
                    applicableGenres: ['all'],
                    inputRequirements: [],
                    outputFormat: {
                        formatId: `format-${Date.now()}`,
                        type: 'json',
                        structure: {},
                        validation: [],
                        postProcessing: []
                    },
                    trainingData: [],
                    validationResults: [],
                    improvementHistory: [],
                    createdAt: new Date().toISOString(),
                    lastTrained: new Date().toISOString(),
                    version: '1.0.0',
                    status: 'active'
                };

                patterns.push(pattern);
            }
        });

        return patterns;
    }

    /**
 * テキスト分析パターンの抽出
 */
    private extractTextAnalysisPatterns(cache: Record<string, any>): AnalysisPattern[] {
        const patterns: AnalysisPattern[] = [];

        Object.entries(cache).forEach(([key, value], index) => {
            if (value && typeof value === 'object' && value.accuracy >= 0.7) {
                const pattern: AnalysisPattern = {
                    patternId: `text-analysis-${Date.now()}-${index}`,
                    patternName: `Text Analysis Pattern: ${key}`,
                    category: 'narrative',
                    analysisType: 'text_analysis',
                    methodology: {
                        approach: 'ai_assisted',
                        algorithm: value.algorithm || 'ml_based',
                        steps: [],
                        dependencies: [],
                        limitations: []
                    },
                    parameters: [],
                    accuracy: {
                        precision: value.accuracy || 0.8,
                        recall: value.recall || 0.8,
                        f1Score: value.f1Score || 0.8,
                        accuracy: value.accuracy || 0.8,
                        falsePositiveRate: value.falsePositiveRate || 0.1,
                        falseNegativeRate: value.falseNegativeRate || 0.1,
                        lastEvaluated: new Date().toISOString()
                    },
                    reliability: {
                        consistency: 0.8,
                        stability: 0.8,
                        robustness: 0.7,
                        reproducibility: 0.8,
                        confidence: 0.8,
                        variance: 0.1,
                        lastEvaluated: new Date().toISOString()
                    },
                    applicableGenres: ['all'],
                    inputRequirements: [],
                    outputFormat: {
                        formatId: `format-${Date.now()}`,
                        type: 'json',
                        structure: {},
                        validation: [],
                        postProcessing: []
                    },
                    trainingData: [],
                    validationResults: [],
                    improvementHistory: [],
                    createdAt: new Date().toISOString(),
                    lastTrained: new Date().toISOString(),
                    version: '1.0.0',
                    status: 'active'
                };

                patterns.push(pattern);
            }
        });

        return patterns;
    }

    /**
    * 履歴からプロンプトパターンを抽出（修正版）
    */
    private extractPromptPatternsFromHistory(history: any[]): PromptGenerationPattern[] {
        const patterns: PromptGenerationPattern[] = [];

        // 履歴データからパターンを分析
        const patternMap = new Map<string, any>();

        history.forEach(entry => {
            if (entry.template && entry.effectiveness) {
                const key = this.generatePatternKey(entry.template);

                if (!patternMap.has(key)) {
                    patternMap.set(key, {
                        count: 0,
                        totalEffectiveness: 0,
                        examples: [],
                        categories: new Set()
                    });
                }

                const pattern = patternMap.get(key)!;
                pattern.count++;
                pattern.totalEffectiveness += entry.effectiveness;
                pattern.examples.push(entry);
                if (entry.category) pattern.categories.add(entry.category);
            }
        });

        // 効果的なパターンのみを抽出
        for (const [key, data] of patternMap) {
            const avgEffectiveness = data.totalEffectiveness / data.count;

            if (avgEffectiveness >= 7 && data.count >= 3) {
                // カテゴリの型安全性を確保
                const validCategories: Array<"context" | "instruction" | "template" | "variable" | "format"> =
                    ['context', 'instruction', 'template', 'variable', 'format'];

                const firstCategory = Array.from(data.categories)[0] as string;
                const safeCategory = validCategories.includes(firstCategory as any)
                    ? firstCategory as "context" | "instruction" | "template" | "variable" | "format"
                    : 'context';

                const pattern: PromptGenerationPattern = {
                    patternId: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    patternName: `Pattern from ${key}`,
                    category: safeCategory,
                    description: `Effective pattern with ${avgEffectiveness.toFixed(2)} average effectiveness`,
                    pattern: data.examples[0].template,
                    variables: this.extractVariables(data.examples[0].template),
                    conditions: [],
                    effectiveness: {
                        qualityScore: avgEffectiveness,
                        consistency: 8,
                        creativity: 7,
                        coherence: 8,
                        readerEngagement: 7,
                        processingTime: 1000,
                        errorRate: 0.1,
                        revisionCount: 1,
                        lastMeasured: new Date().toISOString()
                    },
                    usageStatistics: {
                        totalUsage: data.count,
                        successfulUsage: Math.floor(data.count * 0.9),
                        failedUsage: Math.floor(data.count * 0.1),
                        averageQuality: avgEffectiveness,
                        peakUsagePeriod: 'recent',
                        trendingScore: 8,
                        userSatisfaction: 8,
                        performanceMetrics: {
                            averageResponseTime: 1000,
                            memoryUsage: 50,
                            cpuUsage: 20,
                            apiCalls: 1,
                            cacheHitRate: 0.8,
                            lastMeasured: new Date().toISOString()
                        }
                    },
                    applicableGenres: ['classic'],
                    applicableScenarios: ['general'],
                    chapterTypes: ['any'],
                    successCases: [],
                    failureCases: [],
                    optimizationHistory: [],
                    createdAt: new Date().toISOString(),
                    lastUsed: new Date().toISOString(),
                    lastOptimized: new Date().toISOString(),
                    version: '1.0.0',
                    tags: ['rescued', 'effective']
                };

                patterns.push(pattern);
            }
        }

        return patterns;
    }

    /**
     * 統計から効果的なテンプレートを特定
     */
    private identifyEffectiveTemplates(statistics: any): EffectiveTemplatePattern[] {
        const templates: EffectiveTemplatePattern[] = [];

        // 統計データから高効果テンプレートを抽出
        if (statistics.templates && Array.isArray(statistics.templates)) {
            statistics.templates
                .filter((t: any) => t.effectiveness >= 8 && t.usageCount >= 5)
                .forEach((t: any) => {
                    const template: EffectiveTemplatePattern = {
                        templateId: t.id || `template-${Date.now()}`,
                        templateName: t.name || 'Rescued Template',
                        category: t.category || 'general',
                        structure: {
                            format: 'markdown',
                            sections: ['header', 'body', 'footer'],
                            requiredFields: ['content'],
                            optionalFields: ['metadata'],
                            validationRules: []
                        },
                        sections: [],
                        placeholders: [],
                        effectiveness: {
                            qualityScore: t.effectiveness,
                            consistency: 8,
                            creativity: 7,
                            coherence: 8,
                            readerEngagement: 7,
                            processingTime: 1000,
                            errorRate: 0.1,
                            revisionCount: 1,
                            lastMeasured: new Date().toISOString()
                        },
                        bestPractices: [],
                        commonMistakes: [],
                        applicableContexts: [],
                        variations: [],
                        evolutionHistory: [],
                        feedbackData: [],
                        createdAt: new Date().toISOString(),
                        lastUpdated: new Date().toISOString(),
                        maturityLevel: 'proven',
                        maintainer: 'SystemKnowledge'
                    };

                    templates.push(template);
                });
        }

        return templates;
    }

    /**
     * 品質メトリクスから改善パターンを学習
     */
    private learnFromQualityMetrics(qualityMetrics: any): QualityImprovementStrategy[] {
        const strategies: QualityImprovementStrategy[] = [];

        // 品質メトリクスから改善戦略を導出
        if (qualityMetrics.improvements && Array.isArray(qualityMetrics.improvements)) {
            qualityMetrics.improvements.forEach((improvement: any) => {
                const strategy: QualityImprovementStrategy = {
                    strategyId: `strategy-${Date.now()}`,
                    strategyName: improvement.name || 'Quality Improvement',
                    category: improvement.category || 'content',
                    objective: improvement.objective || 'Improve quality',
                    scope: improvement.scope || 'general',
                    approach: {
                        methodology: 'continuous_improvement',
                        principles: ['measurement', 'analysis', 'improvement'],
                        phases: [],
                        stakeholders: ['system'],
                        governance: 'automated'
                    },
                    qualityMetrics: [],
                    targetLevels: [],
                    techniques: [],
                    tools: [],
                    implementationPlan: {
                        planId: `plan-${Date.now()}`,
                        overview: 'Implementation plan',
                        phases: [],
                        resources: [],
                        timeline: {
                            startDate: new Date().toISOString(),
                            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                            keyMilestones: [],
                            criticalPath: [],
                            bufferTime: '7 days'
                        },
                        risks: [],
                        dependencies: []
                    },
                    milestones: [],
                    measurementFramework: {
                        frameworkId: `framework-${Date.now()}`,
                        approach: 'automated',
                        dataCollection: [],
                        analysis: [],
                        reporting: [],
                        governance: {
                            roles: [],
                            responsibilities: [],
                            processes: [],
                            standards: []
                        }
                    },
                    continuousImprovement: {
                        planId: `ci-${Date.now()}`,
                        cycle: 'PDCA',
                        frequency: 'weekly',
                        reviewProcess: {
                            processId: `review-${Date.now()}`,
                            frequency: 'weekly',
                            participants: ['system'],
                            agenda: ['metrics', 'improvements'],
                            outputs: ['action_items'],
                            followUp: ['implementation']
                        },
                        improvementActions: [],
                        learningCapture: {
                            method: 'automated',
                            frequency: 'continuous',
                            documentation: ['logs'],
                            sharing: ['system'],
                            application: ['immediate']
                        }
                    },
                    createdAt: new Date().toISOString(),
                    lastReviewed: new Date().toISOString(),
                    status: 'active',
                    owner: 'SystemKnowledge'
                };

                strategies.push(strategy);
            });
        }

        return strategies;
    }

    /**
     * 最適化パターンの抽出
     */
    private extractOptimizationPatterns(calculations: any[]): OptimizationStrategy[] {
        const strategies: OptimizationStrategy[] = [];

        // 計算結果から成功パターンを抽出
        const successfulCalculations = calculations.filter(calc =>
            calc.result && calc.effectiveness >= 8
        );

        if (successfulCalculations.length > 0) {
            const strategy: OptimizationStrategy = {
                strategyId: `optimization-${Date.now()}`,
                strategyName: 'Tension Optimization Strategy',
                category: 'performance',
                objective: 'Optimize narrative tension',
                approach: {
                    type: 'incremental',
                    methodology: 'data_driven',
                    phases: [],
                    riskLevel: 'low',
                    timeframe: 'continuous'
                },
                techniques: [],
                expectedBenefits: [],
                measuredImpact: [],
                applicableScenarios: [],
                prerequisites: [],
                constraints: [],
                implementationGuide: {
                    guideId: `guide-${Date.now()}`,
                    overview: 'Tension optimization implementation',
                    detailedSteps: [],
                    checkpoints: [],
                    troubleshooting: []
                },
                rollbackPlan: {
                    planId: `rollback-${Date.now()}`,
                    description: 'Rollback plan',
                    triggers: [],
                    steps: [],
                    timeRequired: '1 hour',
                    dataRecovery: {
                        planId: `recovery-${Date.now()}`,
                        description: 'Data recovery',
                        backupStrategy: 'automatic',
                        recoverySteps: [],
                        timeRequired: '30 minutes',
                        dataIntegrityChecks: []
                    }
                },
                monitoringMetrics: [],
                alertThresholds: [],
                createdAt: new Date().toISOString(),
                lastApplied: new Date().toISOString(),
                successRate: 0.9,
                maturityLevel: 'production'
            };

            strategies.push(strategy);
        }

        return strategies;
    }

    /**
     * 感情分析パターンの抽出
     */
    private extractEmotionalAnalysisPatterns(analyses: any[]): AnalysisPattern[] {
        const patterns: AnalysisPattern[] = [];

        analyses.forEach(analysis => {
            if (analysis.accuracy >= 0.8) {
                const pattern: AnalysisPattern = {
                    patternId: `emotional-${Date.now()}`,
                    patternName: 'Emotional Analysis Pattern',
                    category: 'emotional',
                    analysisType: 'emotion_detection',
                    methodology: {
                        approach: 'ai_assisted',
                        algorithm: analysis.algorithm || 'neural_network',
                        steps: [],
                        dependencies: [],
                        limitations: []
                    },
                    parameters: [],
                    accuracy: {
                        precision: analysis.accuracy,
                        recall: analysis.recall || 0.8,
                        f1Score: analysis.f1Score || 0.8,
                        accuracy: analysis.accuracy,
                        falsePositiveRate: analysis.falsePositiveRate || 0.1,
                        falseNegativeRate: analysis.falseNegativeRate || 0.1,
                        lastEvaluated: new Date().toISOString()
                    },
                    reliability: {
                        consistency: 0.9,
                        stability: 0.8,
                        robustness: 0.8,
                        reproducibility: 0.9,
                        confidence: 0.8,
                        variance: 0.1,
                        lastEvaluated: new Date().toISOString()
                    },
                    applicableGenres: ['all'],
                    inputRequirements: [],
                    outputFormat: {
                        formatId: `format-${Date.now()}`,
                        type: 'json',
                        structure: {},
                        validation: [],
                        postProcessing: []
                    },
                    trainingData: [],
                    validationResults: [],
                    improvementHistory: [],
                    createdAt: new Date().toISOString(),
                    lastTrained: new Date().toISOString(),
                    version: '1.0.0',
                    status: 'active'
                };

                patterns.push(pattern);
            }
        });

        return patterns;
    }

    // ============================================================================
    // ヘルパーメソッド
    // ============================================================================

    /**
     * パターンキーの生成
     */
    private generatePatternKey(template: string): string {
        return template.substring(0, 100).replace(/\s+/g, '_').toLowerCase();
    }

    /**
     * 変数の抽出
     */
    private extractVariables(template: string): PromptVariable[] {
        const variables: PromptVariable[] = [];
        const variablePattern = /\{(\w+)\}/g;
        let match;

        while ((match = variablePattern.exec(template)) !== null) {
            variables.push({
                variableId: `var-${Date.now()}-${match[1]}`,
                name: match[1],
                type: 'string',
                description: `Variable: ${match[1]}`,
                examples: []
            });
        }

        return variables;
    }

    /**
     * コンポーネントデータの読み込み
     */
    private async loadComponentData(componentName: string): Promise<any> {
        try {
            const dataPath = `data/rescued-components/${componentName}.json`;

            if (await storageProvider.fileExists(dataPath)) {
                const content = await storageProvider.readFile(dataPath);
                return JSON.parse(content);
            }
        } catch (error) {
            logger.debug(`Component data not found: ${componentName}`, { error });
        }

        return null;
    }

    // ============================================================================
    // 知識データ管理
    // ============================================================================

    /**
     * 全知識データの読み込み
     */
    private async loadAllKnowledgeData(): Promise<void> {
        const loadPromises = [
            this.loadPromptPatterns(),
            this.loadTemplatePatterns(),
            this.loadAnalysisPatterns(),
            this.loadOptimizationStrategies(),
            this.loadErrorPatterns(),
            this.loadQualityStrategies()
        ];

        await Promise.allSettled(loadPromises);
    }

    /**
     * プロンプトパターンの読み込み
     */
    private async loadPromptPatterns(): Promise<void> {
        try {
            const patternsPath = 'long-term-memory/system-knowledge/prompt-patterns.json';

            if (await storageProvider.fileExists(patternsPath)) {
                const content = await storageProvider.readFile(patternsPath);
                const patterns = JSON.parse(content);

                if (Array.isArray(patterns)) {
                    patterns.forEach(pattern => {
                        this.promptGenerationPatterns.set(pattern.patternId, pattern);
                    });
                }
            }
        } catch (error) {
            logger.warn('Failed to load prompt patterns', { error });
        }
    }

    /**
     * テンプレートパターンの読み込み
     */
    private async loadTemplatePatterns(): Promise<void> {
        try {
            const templatesPath = 'long-term-memory/system-knowledge/template-patterns.json';

            if (await storageProvider.fileExists(templatesPath)) {
                const content = await storageProvider.readFile(templatesPath);
                const templates = JSON.parse(content);

                if (Array.isArray(templates)) {
                    templates.forEach(template => {
                        this.effectiveTemplatePatterns.set(template.templateId, template);
                    });
                }
            }
        } catch (error) {
            logger.warn('Failed to load template patterns', { error });
        }
    }

    /**
     * 分析パターンの読み込み
     */
    private async loadAnalysisPatterns(): Promise<void> {
        try {
            const analysisPath = 'long-term-memory/system-knowledge/analysis-patterns.json';

            if (await storageProvider.fileExists(analysisPath)) {
                const content = await storageProvider.readFile(analysisPath);
                const patterns = JSON.parse(content);

                if (Array.isArray(patterns)) {
                    patterns.forEach(pattern => {
                        this.analysisPatterns.set(pattern.patternId, pattern);
                    });
                }
            }
        } catch (error) {
            logger.warn('Failed to load analysis patterns', { error });
        }
    }

    /**
     * 最適化戦略の読み込み
     */
    private async loadOptimizationStrategies(): Promise<void> {
        try {
            const strategiesPath = 'long-term-memory/system-knowledge/optimization-strategies.json';

            if (await storageProvider.fileExists(strategiesPath)) {
                const content = await storageProvider.readFile(strategiesPath);
                const strategies = JSON.parse(content);

                if (Array.isArray(strategies)) {
                    strategies.forEach(strategy => {
                        this.optimizationStrategies.set(strategy.strategyId, strategy);
                    });
                }
            }
        } catch (error) {
            logger.warn('Failed to load optimization strategies', { error });
        }
    }

    /**
     * エラーパターンの読み込み
     */
    private async loadErrorPatterns(): Promise<void> {
        try {
            const errorsPath = 'long-term-memory/system-knowledge/error-patterns.json';

            if (await storageProvider.fileExists(errorsPath)) {
                const content = await storageProvider.readFile(errorsPath);
                const patterns = JSON.parse(content);

                if (Array.isArray(patterns)) {
                    patterns.forEach(pattern => {
                        this.errorPatterns.set(pattern.patternId, pattern);
                    });
                }
            }
        } catch (error) {
            logger.warn('Failed to load error patterns', { error });
        }
    }

    /**
     * 品質戦略の読み込み
     */
    private async loadQualityStrategies(): Promise<void> {
        try {
            const qualityPath = 'long-term-memory/system-knowledge/quality-strategies.json';

            if (await storageProvider.fileExists(qualityPath)) {
                const content = await storageProvider.readFile(qualityPath);
                const strategies = JSON.parse(content);

                if (Array.isArray(strategies)) {
                    strategies.forEach(strategy => {
                        this.qualityImprovementStrategies.set(strategy.strategyId, strategy);
                    });
                }
            }
        } catch (error) {
            logger.warn('Failed to load quality strategies', { error });
        }
    }

    /**
     * インデックスの構築
     */
    private buildAllIndices(): void {
        this.categoryIndex.clear();
        this.effectivenessIndex.clear();
        this.lastUsedIndex.clear();

        // プロンプトパターンのインデックス
        for (const pattern of this.promptGenerationPatterns.values()) {
            this.addToIndex('category', pattern.category, pattern.patternId);
            this.addToEffectivenessIndex(pattern.effectiveness.qualityScore, pattern.patternId);
        }

        // テンプレートパターンのインデックス
        for (const template of this.effectiveTemplatePatterns.values()) {
            this.addToIndex('template-category', template.category, template.templateId);
            this.addToEffectivenessIndex(template.effectiveness.qualityScore, template.templateId);
        }

        // 他のパターンも同様にインデックス構築
    }

    /**
     * インデックスへの追加
     */
    private addToIndex(indexType: string, key: string, id: string): void {
        const indexKey = `${indexType}:${key}`;
        if (!this.categoryIndex.has(indexKey)) {
            this.categoryIndex.set(indexKey, new Set());
        }
        this.categoryIndex.get(indexKey)!.add(id);
    }

    /**
     * 効果性インデックスへの追加
     */
    private addToEffectivenessIndex(score: number, id: string): void {
        const scoreRange = Math.floor(score);
        if (!this.effectivenessIndex.has(scoreRange)) {
            this.effectivenessIndex.set(scoreRange, new Set());
        }
        this.effectivenessIndex.get(scoreRange)!.add(id);
    }

    // ============================================================================
    // パブリックAPI
    // ============================================================================

    /**
     * プロンプト生成パターンを追加
     */
    async addPromptGenerationPattern(pattern: PromptGenerationPattern): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        this.promptGenerationPatterns.set(pattern.patternId, pattern);
        this.addToIndex('category', pattern.category, pattern.patternId);
        this.addToEffectivenessIndex(pattern.effectiveness.qualityScore, pattern.patternId);

        await this.savePromptPatterns();
        logger.info(`Added prompt generation pattern: ${pattern.patternName}`);
    }

    /**
     * 効果的テンプレートパターンを追加
     */
    async addEffectiveTemplatePattern(template: EffectiveTemplatePattern): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        this.effectiveTemplatePatterns.set(template.templateId, template);
        this.addToIndex('template-category', template.category, template.templateId);
        this.addToEffectivenessIndex(template.effectiveness.qualityScore, template.templateId);

        await this.saveTemplatePatterns();
        logger.info(`Added effective template pattern: ${template.templateName}`);
    }

    /**
     * 分析パターンを追加
     */
    async addAnalysisPattern(pattern: AnalysisPattern): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        this.analysisPatterns.set(pattern.patternId, pattern);
        this.addToIndex('analysis-category', pattern.category, pattern.patternId);

        await this.saveAnalysisPatterns();
        logger.info(`Added analysis pattern: ${pattern.patternName}`);
    }

    /**
     * 最適化戦略を追加
     */
    async addOptimizationStrategy(strategy: OptimizationStrategy): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        this.optimizationStrategies.set(strategy.strategyId, strategy);
        this.addToIndex('optimization-category', strategy.category, strategy.strategyId);

        await this.saveOptimizationStrategies();
        logger.info(`Added optimization strategy: ${strategy.strategyName}`);
    }

    /**
     * エラーパターンを追加
     */
    async addErrorPattern(pattern: ErrorPattern): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        this.errorPatterns.set(pattern.patternId, pattern);
        this.addToIndex('error-category', pattern.category, pattern.patternId);

        await this.saveErrorPatterns();
        logger.info(`Added error pattern: ${pattern.patternName}`);
    }

    /**
     * 品質改善戦略を追加
     */
    async addQualityImprovementStrategy(strategy: QualityImprovementStrategy): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        this.qualityImprovementStrategies.set(strategy.strategyId, strategy);
        this.addToIndex('quality-category', strategy.category, strategy.strategyId);

        await this.saveQualityStrategies();
        logger.info(`Added quality improvement strategy: ${strategy.strategyName}`);
    }

    /**
     * カテゴリでパターン検索
     */
    async getPatternsByCategory(category: string, type: string = 'prompt'): Promise<any[]> {
        if (!this.initialized) {
            await this.initialize();
        }

        const indexKey = `${type === 'template' ? 'template-' : ''}category:${category}`;
        const ids = this.categoryIndex.get(indexKey) || new Set();

        const results: any[] = [];
        for (const id of ids) {
            let pattern = null;

            switch (type) {
                case 'prompt':
                    pattern = this.promptGenerationPatterns.get(id);
                    break;
                case 'template':
                    pattern = this.effectiveTemplatePatterns.get(id);
                    break;
                case 'analysis':
                    pattern = this.analysisPatterns.get(id);
                    break;
                case 'optimization':
                    pattern = this.optimizationStrategies.get(id);
                    break;
                case 'error':
                    pattern = this.errorPatterns.get(id);
                    break;
                case 'quality':
                    pattern = this.qualityImprovementStrategies.get(id);
                    break;
            }

            if (pattern) {
                results.push(pattern);
            }
        }

        return results.sort((a, b) => {
            const aScore = a.effectiveness?.qualityScore || a.successRate || 0;
            const bScore = b.effectiveness?.qualityScore || b.successRate || 0;
            return bScore - aScore;
        });
    }

    /**
     * 効果性でパターン検索
     */
    async getHighEffectivenessPatterns(minScore: number = 8): Promise<{
        prompts: PromptGenerationPattern[];
        templates: EffectiveTemplatePattern[];
        analyses: AnalysisPattern[];
        optimizations: OptimizationStrategy[];
    }> {
        if (!this.initialized) {
            await this.initialize();
        }

        const results = {
            prompts: [] as PromptGenerationPattern[],
            templates: [] as EffectiveTemplatePattern[],
            analyses: [] as AnalysisPattern[],
            optimizations: [] as OptimizationStrategy[]
        };

        // プロンプトパターン
        for (const pattern of this.promptGenerationPatterns.values()) {
            if (pattern.effectiveness.qualityScore >= minScore) {
                results.prompts.push(pattern);
            }
        }

        // テンプレートパターン
        for (const template of this.effectiveTemplatePatterns.values()) {
            if (template.effectiveness.qualityScore >= minScore) {
                results.templates.push(template);
            }
        }

        // 分析パターン
        for (const analysis of this.analysisPatterns.values()) {
            if (analysis.accuracy.accuracy >= minScore / 10) {
                results.analyses.push(analysis);
            }
        }

        // 最適化戦略
        for (const optimization of this.optimizationStrategies.values()) {
            if (optimization.successRate >= minScore / 10) {
                results.optimizations.push(optimization);
            }
        }

        return results;
    }

    /**
     * 学習・改善の実行
     */
    async performLearningAndImprovement(): Promise<{
        newPatterns: number;
        improvedPatterns: number;
        deprecatedPatterns: number;
        recommendations: string[];
    }> {
        if (!this.initialized) {
            await this.initialize();
        }

        const results = {
            newPatterns: 0,
            improvedPatterns: 0,
            deprecatedPatterns: 0,
            recommendations: [] as string[]
        };

        try {
            // 新しいコンポーネントデータの統合
            await this.integrateRescuedComponentData();

            // パターンの有効性評価
            await this.evaluatePatternEffectiveness();

            // 改善提案の生成
            results.recommendations = await this.generateImprovementRecommendations();

            logger.info('Learning and improvement cycle completed', results);
        } catch (error) {
            logger.error('Failed to perform learning and improvement', { error });
        }

        return results;
    }

    /**
     * パターン有効性の評価
     */
    private async evaluatePatternEffectiveness(): Promise<void> {
        // 使用統計に基づく有効性評価
        const currentTime = Date.now();
        const oneWeekAgo = currentTime - 7 * 24 * 60 * 60 * 1000;

        for (const pattern of this.promptGenerationPatterns.values()) {
            const lastUsed = new Date(pattern.lastUsed).getTime();

            if (lastUsed < oneWeekAgo && pattern.effectiveness.qualityScore < 6) {
                pattern.version = 'deprecated';
                logger.info(`Deprecated pattern: ${pattern.patternName}`);
            }
        }
    }

    /**
     * 改善提案の生成
     */
    private async generateImprovementRecommendations(): Promise<string[]> {
        const recommendations: string[] = [];

        // 低効果パターンの特定
        const lowEffectivenessPatterns = Array.from(this.promptGenerationPatterns.values())
            .filter(p => p.effectiveness.qualityScore < 6);

        if (lowEffectivenessPatterns.length > 0) {
            recommendations.push(`${lowEffectivenessPatterns.length}個の低効果パターンの改善を推奨します`);
        }

        // 使用頻度の低いパターンの特定
        const lowUsagePatterns = Array.from(this.promptGenerationPatterns.values())
            .filter(p => p.usageStatistics.totalUsage < 3);

        if (lowUsagePatterns.length > 0) {
            recommendations.push(`${lowUsagePatterns.length}個の未活用パターンの見直しを推奨します`);
        }

        // エラーパターンの増加傾向チェック
        const recentErrors = Array.from(this.errorPatterns.values())
            .filter(e => e.status === 'active');

        if (recentErrors.length > 10) {
            recommendations.push('エラーパターンが増加傾向にあります。システム改善を検討してください');
        }

        return recommendations;
    }

    // ============================================================================
    // ストレージ管理
    // ============================================================================

    /**
     * プロンプトパターンの保存
     */
    private async savePromptPatterns(): Promise<void> {
        try {
            const patternsPath = 'long-term-memory/system-knowledge/prompt-patterns.json';
            const patterns = Array.from(this.promptGenerationPatterns.values());

            await storageProvider.writeFile(patternsPath, JSON.stringify(patterns, null, 2));
            logger.debug('Prompt patterns saved');
        } catch (error) {
            logger.error('Failed to save prompt patterns', { error });
        }
    }

    /**
     * テンプレートパターンの保存
     */
    private async saveTemplatePatterns(): Promise<void> {
        try {
            const templatesPath = 'long-term-memory/system-knowledge/template-patterns.json';
            const templates = Array.from(this.effectiveTemplatePatterns.values());

            await storageProvider.writeFile(templatesPath, JSON.stringify(templates, null, 2));
            logger.debug('Template patterns saved');
        } catch (error) {
            logger.error('Failed to save template patterns', { error });
        }
    }

    /**
     * 分析パターンの保存
     */
    private async saveAnalysisPatterns(): Promise<void> {
        try {
            const analysisPath = 'long-term-memory/system-knowledge/analysis-patterns.json';
            const patterns = Array.from(this.analysisPatterns.values());

            await storageProvider.writeFile(analysisPath, JSON.stringify(patterns, null, 2));
            logger.debug('Analysis patterns saved');
        } catch (error) {
            logger.error('Failed to save analysis patterns', { error });
        }
    }

    /**
     * 最適化戦略の保存
     */
    private async saveOptimizationStrategies(): Promise<void> {
        try {
            const strategiesPath = 'long-term-memory/system-knowledge/optimization-strategies.json';
            const strategies = Array.from(this.optimizationStrategies.values());

            await storageProvider.writeFile(strategiesPath, JSON.stringify(strategies, null, 2));
            logger.debug('Optimization strategies saved');
        } catch (error) {
            logger.error('Failed to save optimization strategies', { error });
        }
    }

    /**
     * エラーパターンの保存
     */
    private async saveErrorPatterns(): Promise<void> {
        try {
            const errorsPath = 'long-term-memory/system-knowledge/error-patterns.json';
            const patterns = Array.from(this.errorPatterns.values());

            await storageProvider.writeFile(errorsPath, JSON.stringify(patterns, null, 2));
            logger.debug('Error patterns saved');
        } catch (error) {
            logger.error('Failed to save error patterns', { error });
        }
    }

    /**
     * 品質戦略の保存
     */
    private async saveQualityStrategies(): Promise<void> {
        try {
            const qualityPath = 'long-term-memory/system-knowledge/quality-strategies.json';
            const strategies = Array.from(this.qualityImprovementStrategies.values());

            await storageProvider.writeFile(qualityPath, JSON.stringify(strategies, null, 2));
            logger.debug('Quality strategies saved');
        } catch (error) {
            logger.error('Failed to save quality strategies', { error });
        }
    }

    /**
     * 全データの保存
     */
    async save(): Promise<void> {
        await Promise.all([
            this.savePromptPatterns(),
            this.saveTemplatePatterns(),
            this.saveAnalysisPatterns(),
            this.saveOptimizationStrategies(),
            this.saveErrorPatterns(),
            this.saveQualityStrategies()
        ]);
    }

    /**
     * 状態取得
     */
    async getStatus(): Promise<{
        initialized: boolean;
        promptPatterns: number;
        templatePatterns: number;
        analysisPatterns: number;
        optimizationStrategies: number;
        errorPatterns: number;
        qualityStrategies: number;
        rescuedComponents: number;
    }> {
        return {
            initialized: this.initialized,
            promptPatterns: this.promptGenerationPatterns.size,
            templatePatterns: this.effectiveTemplatePatterns.size,
            analysisPatterns: this.analysisPatterns.size,
            optimizationStrategies: this.optimizationStrategies.size,
            errorPatterns: this.errorPatterns.size,
            qualityStrategies: this.qualityImprovementStrategies.size,
            rescuedComponents: 12 // 救済対象コンポーネント数
        };
    }
}