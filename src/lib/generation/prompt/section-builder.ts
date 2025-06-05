// src/lib/generation/prompt/section-builder.ts (8システム統合強化版)
/**
 * @fileoverview 8システム統合対応セクション構築クラス
 * @description 革命的統合データを活用した高度セクション構築システム
 */

import { logger } from '@/lib/utils/logger';
import { PromptFormatter } from './prompt-formatter';
import { TemplateManager } from './template-manager';
import { GenerationContext } from '@/types/generation';
import { LearningJourneySystem } from '@/lib/learning-journey';
import {
    LearningStage,
    EmotionalArcDesign,
    CatharticExperience,
    EmpatheticPoint
} from '@/lib/learning-journey';
import {
    RevolutionaryIntegratedData,
    SectionBuildConfig,
    IntegratedSectionResult,
    SectionPriorityMatrix,
    IntegratedPromptContext
} from './types';

/**
 * 🚀 8システム統合対応セクション構築クラス
 */
export class SectionBuilder {
    private sectionCache: Map<string, IntegratedSectionResult> = new Map();
    private priorityMatrix: SectionPriorityMatrix;
    private qualityThreshold: number = 0.7;

    constructor(
        private formatter: PromptFormatter,
        private templateManager: TemplateManager,
        private learningJourneySystem?: LearningJourneySystem
    ) {
        this.priorityMatrix = this.initializePriorityMatrix();
        logger.info('🚀 Enhanced SectionBuilder initialized with 8-system integration');
    }

    /**
     * 🚀 8システム統合セクション一括構築
     */
    public async buildIntegratedSections(
        context: IntegratedPromptContext,
        integratedData: RevolutionaryIntegratedData,
        config?: SectionBuildConfig
    ): Promise<IntegratedSectionResult[]> {
        const startTime = Date.now();
        logger.info('🚀 Starting integrated sections construction');

        const buildConfig = config || this.createDefaultBuildConfig(context, integratedData);
        const sections: IntegratedSectionResult[] = [];

        try {
            // 並列セクション構築
            const sectionPromises = buildConfig.includeSections.map(sectionName =>
                this.buildSingleIntegratedSection(sectionName, context, integratedData, buildConfig)
            );

            const sectionResults = await Promise.allSettled(sectionPromises);
            
            // 成功したセクションのみを収集
            sectionResults.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    sections.push(result.value);
                } else {
                    logger.warn(`🚀 Section construction failed: ${buildConfig.includeSections[index]}`, {
                        error: result.status === 'rejected' ? result.reason : 'Unknown error'
                    });
                }
            });

            // 品質フィルタリング
            const qualitySections = sections.filter(section => 
                section.qualityMetrics.completeness >= this.qualityThreshold
            );

            // 優先度ソート
            const sortedSections = this.sortSectionsByPriority(qualitySections, buildConfig.priorities);

            const processingTime = Date.now() - startTime;
            logger.info(`🚀 Integrated sections construction completed`, {
                totalSections: sortedSections.length,
                processingTime,
                averageQuality: this.calculateAverageQuality(sortedSections)
            });

            return sortedSections;

        } catch (error) {
            logger.error('🚀 Integrated sections construction failed', { error });
            return this.buildFallbackSections(context, integratedData);
        }
    }

    /**
     * 🚀 8システム統合データ活用セクション構築
     */
    private async buildSingleIntegratedSection(
        sectionName: string,
        context: IntegratedPromptContext,
        integratedData: RevolutionaryIntegratedData,
        config: SectionBuildConfig
    ): Promise<IntegratedSectionResult | null> {
        const cacheKey = this.generateSectionCacheKey(sectionName, context, integratedData);
        const cached = this.sectionCache.get(cacheKey);

        if (cached && this.isSectionCacheValid(cached)) {
            logger.debug(`🚀 Using cached section: ${sectionName}`);
            return cached;
        }

        try {
            let content = '';
            let dataSources: string[] = [];
            let integrationScore = 0;

            switch (sectionName) {
                case 'revolutionaryCharacter':
                    ({ content, dataSources, integrationScore } = await this.buildRevolutionaryCharacterSection(context, integratedData, config));
                    break;
                case 'integratedLearning':
                    ({ content, dataSources, integrationScore } = await this.buildIntegratedLearningSection(context, integratedData, config));
                    break;
                case 'unifiedMemory':
                    ({ content, dataSources, integrationScore } = await this.buildUnifiedMemorySection(context, integratedData, config));
                    break;
                case 'enhancedPlot':
                    ({ content, dataSources, integrationScore } = await this.buildEnhancedPlotSection(context, integratedData, config));
                    break;
                case 'qualityOptimization':
                    ({ content, dataSources, integrationScore } = await this.buildQualityOptimizationSection(context, integratedData, config));
                    break;
                case 'adaptiveForeshadowing':
                    ({ content, dataSources, integrationScore } = await this.buildAdaptiveForeshadowingSection(context, integratedData, config));
                    break;
                case 'dynamicStyle':
                    ({ content, dataSources, integrationScore } = await this.buildDynamicStyleSection(context, integratedData, config));
                    break;
                case 'readerExperience':
                    ({ content, dataSources, integrationScore } = await this.buildReaderExperienceSection(context, integratedData, config));
                    break;
                // 既存セクションの統合対応
                case 'characterPsychology':
                    content = this.buildCharacterPsychologySection(context);
                    dataSources = ['characterSystem'];
                    integrationScore = 0.8;
                    break;
                case 'characterGrowth':
                    content = this.buildCharacterGrowthSection(context, context.genre || 'general');
                    dataSources = ['characterSystem'];
                    integrationScore = 0.7;
                    break;
                case 'emotionalArc':
                    content = this.buildEmotionalArcSection(context, context.genre || 'general');
                    dataSources = ['learningSystem'];
                    integrationScore = 0.75;
                    break;
                case 'learningJourney':
                    content = this.buildLearningJourneySection(context, context.genre || 'general');
                    dataSources = ['learningSystem'];
                    integrationScore = 0.85;
                    break;
                default:
                    logger.warn(`🚀 Unknown section type: ${sectionName}`);
                    return null;
            }

            if (!content.trim()) {
                logger.warn(`🚀 Empty content for section: ${sectionName}`);
                return null;
            }

            const result: IntegratedSectionResult = {
                name: sectionName,
                content,
                dataSources,
                integrationScore,
                qualityMetrics: this.assessSectionQuality(content, dataSources, integrationScore)
            };

            this.sectionCache.set(cacheKey, result);
            return result;

        } catch (error) {
            logger.error(`🚀 Failed to build section: ${sectionName}`, { error });
            return null;
        }
    }

    // 🚀 新しい統合セクション構築メソッド群

    /**
     * 🚀 革命的キャラクターセクション
     */
    private async buildRevolutionaryCharacterSection(
        context: IntegratedPromptContext,
        integratedData: RevolutionaryIntegratedData,
        config: SectionBuildConfig
    ): Promise<{ content: string; dataSources: string[]; integrationScore: number }> {
        const charData = integratedData.characterSystem;
        let content = '\n## 🚀 革命的キャラクター統合システム\n';

        if (!charData.allCharacters?.length) {
            content += '### キャラクター情報なし\n特に指定されたキャラクター情報はありません。\n';
            return { content, dataSources: [], integrationScore: 0.2 };
        }

        // 動的キャラクター状態分析
        content += this.buildDynamicCharacterStates(charData, config.detailLevel);
        
        // 深層心理プロファイル
        content += this.buildDeepPsychologyProfile(charData.psychology, config.detailLevel);
        
        // 関係性ネットワーク分析
        content += this.buildRelationshipNetwork(charData.relationships, config.detailLevel);
        
        // 成長軌道プロジェクション
        content += this.buildGrowthProjection(charData.growthPlans, config.detailLevel);
        
        // 重点キャラクター選定
        content += this.buildFocusCharacterGuidance(charData, context);

        return {
            content,
            dataSources: ['characterSystem', 'psychology', 'relationships', 'growth'],
            integrationScore: this.calculateCharacterIntegrationScore(charData)
        };
    }

    /**
     * 🚀 統合学習セクション
     */
    private async buildIntegratedLearningSection(
        context: IntegratedPromptContext,
        integratedData: RevolutionaryIntegratedData,
        config: SectionBuildConfig
    ): Promise<{ content: string; dataSources: string[]; integrationScore: number }> {
        const learningData = integratedData.learningSystem;
        let content = '\n## 🚀 統合学習旅程システム\n';

        if (!learningData.currentJourney) {
            content += '### 学習旅程情報なし\n学習旅程システムが設定されていません。\n';
            return { content, dataSources: [], integrationScore: 0.2 };
        }

        // 現在の学習段階分析
        content += this.buildLearningStageAnalysis(learningData.stageAnalysis, config.detailLevel);
        
        // 感情アーク設計統合
        content += this.buildEmotionalArcIntegration(learningData.emotionalArcs, config.detailLevel);
        
        // カタルシス体験設計
        content += this.buildCatharticExperienceDesign(learningData.catharticMoments, config.detailLevel);
        
        // 学習効果最大化指示
        content += this.buildLearningEffectMaximization(learningData, context);

        return {
            content,
            dataSources: ['learningSystem', 'emotionalArcs', 'catharticMoments'],
            integrationScore: this.calculateLearningIntegrationScore(learningData)
        };
    }

    /**
     * 🚀 統合記憶セクション
     */
    private async buildUnifiedMemorySection(
        context: IntegratedPromptContext,
        integratedData: RevolutionaryIntegratedData,
        config: SectionBuildConfig
    ): Promise<{ content: string; dataSources: string[]; integrationScore: number }> {
        const memoryData = integratedData.memorySystem;
        let content = '\n## 🚀 統合記憶システム\n';

        // 統合記憶分析結果
        content += this.buildUnifiedMemoryAnalysis(memoryData.unifiedContext, config.detailLevel);
        
        // クロスレベルデータ統合
        content += this.buildCrossLevelIntegration(memoryData.crossLevelData, config.detailLevel);
        
        // 時系列ナラティブ分析
        content += this.buildTemporalNarrativeAnalysis(memoryData.temporalAnalysis, config.detailLevel);
        
        // 記憶活用戦略
        content += this.buildMemoryUtilizationStrategy(memoryData, context);

        return {
            content,
            dataSources: ['memorySystem', 'unifiedContext', 'temporalAnalysis'],
            integrationScore: this.calculateMemoryIntegrationScore(memoryData)
        };
    }

    /**
     * 🚀 強化プロットセクション
     */
    private async buildEnhancedPlotSection(
        context: IntegratedPromptContext,
        integratedData: RevolutionaryIntegratedData,
        config: SectionBuildConfig
    ): Promise<{ content: string; dataSources: string[]; integrationScore: number }> {
        const plotData = integratedData.plotSystem;
        let content = '\n## 🚀 強化プロットシステム\n';

        // 世界設定統合分析
        content += this.buildWorldSettingsIntegration(plotData.worldSettings, config.detailLevel);
        
        // プロット指示最適化
        content += this.buildPlotDirectiveOptimization(plotData.plotDirectives, config.detailLevel);
        
        // アーク進行分析
        content += this.buildArcProgressionAnalysis(plotData.arcProgression, config.detailLevel);
        
        // テーマ進化追跡
        content += this.buildThemeEvolutionTracking(plotData.thematicEvolution, config.detailLevel);

        return {
            content,
            dataSources: ['plotSystem', 'worldSettings', 'plotDirectives', 'arcProgression'],
            integrationScore: this.calculatePlotIntegrationScore(plotData)
        };
    }

    /**
     * 🚀 品質最適化セクション
     */
    private async buildQualityOptimizationSection(
        context: IntegratedPromptContext,
        integratedData: RevolutionaryIntegratedData,
        config: SectionBuildConfig
    ): Promise<{ content: string; dataSources: string[]; integrationScore: number }> {
        const analysisData = integratedData.analysisSystem;
        let content = '\n## 🚀 品質最適化システム\n';

        // 品質メトリクス分析
        content += this.buildQualityMetricsAnalysis(analysisData.qualityMetrics, config.detailLevel);
        
        // 文体最適化指示
        content += this.buildStyleOptimizationGuidance(analysisData.styleAnalysis, config.detailLevel);
        
        // テンション・ペーシング最適化
        content += this.buildTensionPacingOptimization(analysisData.tensionPacing, config.detailLevel);
        
        // 読者体験向上戦略
        content += this.buildReaderExperienceStrategy(analysisData.readerExperience, config.detailLevel);

        return {
            content,
            dataSources: ['analysisSystem', 'qualityMetrics', 'styleAnalysis', 'tensionPacing'],
            integrationScore: this.calculateQualityIntegrationScore(analysisData)
        };
    }

    /**
     * 🚀 適応的伏線セクション
     */
    private async buildAdaptiveForeshadowingSection(
        context: IntegratedPromptContext,
        integratedData: RevolutionaryIntegratedData,
        config: SectionBuildConfig
    ): Promise<{ content: string; dataSources: string[]; integrationScore: number }> {
        const foreshadowingData = integratedData.foreshadowingSystem;
        let content = '\n## 🚀 適応的伏線システム\n';

        // アクティブ伏線分析
        content += this.buildActiveForeshadowingAnalysis(foreshadowingData.activePlants, config.detailLevel);
        
        // 解決計画最適化
        content += this.buildResolutionPlanOptimization(foreshadowingData.resolutionPlans, config.detailLevel);
        
        // 統合機会発見
        content += this.buildIntegrationOpportunities(foreshadowingData.integrationOpportunities, config.detailLevel);

        return {
            content,
            dataSources: ['foreshadowingSystem', 'activePlants', 'resolutionPlans'],
            integrationScore: this.calculateForeshadowingIntegrationScore(foreshadowingData)
        };
    }

    /**
     * 🚀 動的文体セクション
     */
    private async buildDynamicStyleSection(
        context: IntegratedPromptContext,
        integratedData: RevolutionaryIntegratedData,
        config: SectionBuildConfig
    ): Promise<{ content: string; dataSources: string[]; integrationScore: number }> {
        let content = '\n## 🚀 動的文体最適化システム\n';

        // 既存の文体ガイダンスと統合データの組み合わせ
        if (context.styleGuidance) {
            content += this.buildEnhancedStyleGuidance(context.styleGuidance, integratedData, config.detailLevel);
        }

        if (context.alternativeExpressions) {
            content += this.buildDynamicExpressionAlternatives(context.alternativeExpressions, integratedData, config.detailLevel);
        }

        // 8システム統合による追加文体指示
        content += this.buildIntegratedStyleInstructions(integratedData, context, config.detailLevel);

        return {
            content,
            dataSources: ['styleGuidance', 'alternativeExpressions', 'integratedAnalysis'],
            integrationScore: 0.8
        };
    }

    /**
     * 🚀 読者体験セクション
     */
    private async buildReaderExperienceSection(
        context: IntegratedPromptContext,
        integratedData: RevolutionaryIntegratedData,
        config: SectionBuildConfig
    ): Promise<{ content: string; dataSources: string[]; integrationScore: number }> {
        let content = '\n## 🚀 読者体験最適化システム\n';

        // 既存の改善提案活用
        if (context.improvementSuggestions?.length) {
            content += '### 体験向上ポイント\n';
            context.improvementSuggestions.forEach(suggestion => {
                content += `- ${suggestion}\n`;
            });
        }

        // 8システム統合による読者体験向上指示
        content += this.buildIntegratedReaderExperienceGuidance(integratedData, context, config.detailLevel);

        return {
            content,
            dataSources: ['improvementSuggestions', 'integratedAnalysis'],
            integrationScore: 0.75
        };
    }

    // 🚀 詳細構築メソッド群

    private buildDynamicCharacterStates(charData: any, detailLevel: string): string {
        if (!charData.allCharacters?.length) return '';

        let content = '\n### 動的キャラクター状態分析\n';
        
        const maxChars = detailLevel === 'brief' ? 3 : detailLevel === 'detailed' ? 10 : 7;
        const characters = charData.allCharacters.slice(0, maxChars);

        characters.forEach((char: any) => {
            content += `**${char.name}**: `;
            if (char.emotionalState) {
                content += `感情状態(${char.emotionalState})`;
            }
            if (char.currentGoals) {
                content += `, 現在の目標(${char.currentGoals.slice(0, 2).join(', ')})`;
            }
            content += '\n';
        });

        content += `\n**指示**: ${characters.length}名のキャラクターの動的状態を反映させてください。\n`;
        return content;
    }

    private buildDeepPsychologyProfile(psychology: any, detailLevel: string): string {
        if (!psychology || Object.keys(psychology).length === 0) return '';

        let content = '\n### 深層心理プロファイル\n';
        
        const entries = Object.entries(psychology).slice(0, detailLevel === 'brief' ? 2 : 5);
        
        entries.forEach(([characterId, psychData]: [string, any]) => {
            content += `**${characterId}の心理状態**:\n`;
            if (psychData.currentDesires?.length) {
                content += `- 欲求: ${psychData.currentDesires.slice(0, 3).join('、')}\n`;
            }
            if (psychData.currentFears?.length) {
                content += `- 恐れ: ${psychData.currentFears.slice(0, 2).join('、')}\n`;
            }
            if (psychData.internalConflicts?.length) {
                content += `- 葛藤: ${psychData.internalConflicts.slice(0, 2).join('、')}\n`;
            }
        });

        content += '\n**指示**: キャラクターの深層心理を効果的に描写してください。\n';
        return content;
    }

    private buildRelationshipNetwork(relationships: any, detailLevel: string): string {
        if (!relationships) return '';

        let content = '\n### 関係性ネットワーク分析\n';
        
        if (relationships.clusters?.length) {
            content += `- 検出されたキャラクタークラスター: ${relationships.clusters.length}個\n`;
            if (detailLevel !== 'brief') {
                content += '- 主要な関係性パターンを意識した描写を行ってください\n';
            }
        }

        if (relationships.dynamics) {
            content += '- 関係性の動的変化を重視してください\n';
        }

        return content;
    }

    private buildGrowthProjection(growthPlans: any, detailLevel: string): string {
        if (!growthPlans) return '';

        let content = '\n### 成長軌道プロジェクション\n';
        
        if (growthPlans.active?.length) {
            content += `- アクティブな成長計画: ${growthPlans.active.length}個\n`;
            if (detailLevel === 'detailed') {
                growthPlans.active.slice(0, 3).forEach((plan: any) => {
                    content += `  • ${plan.character}: ${plan.objective}\n`;
                });
            }
        }

        content += '- キャラクターの成長を物語に自然に織り込んでください\n';
        return content;
    }

    private buildFocusCharacterGuidance(charData: any, context: IntegratedPromptContext): string {
        const focusChars = this.determineFocusCharacters(context);
        if (!focusChars.length) return '';

        let content = '\n### 重点描写キャラクター\n';
        content += `以下のキャラクターを重点的に描写してください:\n`;
        focusChars.forEach(char => {
            content += `- ${char}\n`;
        });

        return content;
    }

    // 🚀 学習システム構築メソッド群

    private buildLearningStageAnalysis(stageAnalysis: any, detailLevel: string): string {
        if (!stageAnalysis) return '';

        let content = '\n### 学習段階分析\n';
        content += `- 現在の段階: ${stageAnalysis.currentStage || '不明'}\n`;
        
        if (detailLevel !== 'brief' && stageAnalysis.stageGoals) {
            content += `- 段階目標: ${stageAnalysis.stageGoals}\n`;
        }

        if (stageAnalysis.progressIndicators) {
            content += '- 進歩指標を物語に反映させてください\n';
        }

        return content;
    }

    private buildEmotionalArcIntegration(emotionalArcs: any, detailLevel: string): string {
        if (!emotionalArcs) return '';

        let content = '\n### 感情アーク統合設計\n';
        content += `- 推奨トーン: ${emotionalArcs.recommendedTone || '未設定'}\n`;
        
        if (detailLevel === 'detailed' && emotionalArcs.emotionalJourney) {
            content += '- 感情の流れを章全体で意識してください\n';
        }

        return content;
    }

    private buildCatharticExperienceDesign(catharticMoments: any[], detailLevel: string): string {
        if (!catharticMoments?.length) return '';

        let content = '\n### カタルシス体験設計\n';
        content += `- カタルシス機会: ${catharticMoments.length}箇所\n`;
        
        if (detailLevel !== 'brief') {
            content += '- 感情の解放と学びの統合を効果的に描写してください\n';
        }

        return content;
    }

    private buildLearningEffectMaximization(learningData: any, context: IntegratedPromptContext): string {
        let content = '\n### 学習効果最大化指示\n';
        content += '- 体験的学習を重視し、説明的な記述を避けてください\n';
        content += '- 読者の感情移入を通じて自然な学びを促進してください\n';
        
        if (context.genre === 'business') {
            content += '- ビジネス概念を物語に有機的に統合してください\n';
        }

        return content;
    }

    // 🚀 記憶システム構築メソッド群

    private buildUnifiedMemoryAnalysis(unifiedContext: any, detailLevel: string): string {
        if (!unifiedContext) return '';

        let content = '\n### 統合記憶分析結果\n';
        content += `- 統合成功: ${unifiedContext.success ? 'はい' : 'いいえ'}\n`;
        content += `- 処理結果数: ${unifiedContext.totalResults || 0}件\n`;
        
        if (detailLevel !== 'brief' && unifiedContext.suggestions?.length) {
            content += `- システム提案: ${unifiedContext.suggestions.slice(0, 2).join('、')}\n`;
        }

        return content;
    }

    private buildCrossLevelIntegration(crossLevelData: any, detailLevel: string): string {
        if (!crossLevelData) return '';

        let content = '\n### クロスレベルデータ統合\n';
        content += '- 短期・中期・長期記憶の一貫性を保ってください\n';
        
        if (detailLevel === 'detailed') {
            content += '- 記憶層間の矛盾を避け、物語の連続性を確保してください\n';
        }

        return content;
    }

    private buildTemporalNarrativeAnalysis(temporalAnalysis: any, detailLevel: string): string {
        if (!temporalAnalysis) return '';

        let content = '\n### 時系列ナラティブ分析\n';
        content += '- 時間の流れと因果関係の論理性を保ってください\n';
        
        if (temporalAnalysis.progression) {
            content += `- 進行パターン: ${temporalAnalysis.progression}\n`;
        }

        return content;
    }

    private buildMemoryUtilizationStrategy(memoryData: any, context: IntegratedPromptContext): string {
        let content = '\n### 記憶活用戦略\n';
        content += '- 過去の重要イベントを適切に参照してください\n';
        content += '- キャラクターの記憶と行動の一貫性を保ってください\n';

        return content;
    }

    // 🚀 プロットシステム構築メソッド群

    private buildWorldSettingsIntegration(worldSettings: any, detailLevel: string): string {
        if (!worldSettings) return '';

        let content = '\n### 世界設定統合分析\n';
        content += '- 世界設定の一貫性を保ってください\n';
        
        if (detailLevel !== 'brief') {
            content += '- 設定の詳細を自然に物語に織り込んでください\n';
        }

        return content;
    }

    private buildPlotDirectiveOptimization(plotDirectives: string, detailLevel: string): string {
        if (!plotDirectives) return '';

        let content = '\n### プロット指示最適化\n';
        content += `- 指示内容: ${plotDirectives.slice(0, 200)}${plotDirectives.length > 200 ? '...' : ''}\n`;
        content += '- 上記のプロット指示に従って物語を進行させてください\n';

        return content;
    }

    private buildArcProgressionAnalysis(arcProgression: any, detailLevel: string): string {
        if (!arcProgression) return '';

        let content = '\n### アーク進行分析\n';
        content += '- 現在のストーリーアークの位置を意識してください\n';
        
        if (detailLevel === 'detailed' && arcProgression.phase) {
            content += `- 現在のフェーズ: ${arcProgression.phase}\n`;
        }

        return content;
    }

    private buildThemeEvolutionTracking(thematicEvolution: any, detailLevel: string): string {
        if (!thematicEvolution) return '';

        let content = '\n### テーマ進化追跡\n';
        content += '- テーマの深化と発展を意識してください\n';
        
        if (detailLevel === 'detailed' && thematicEvolution.evolution) {
            content += `- 進化パターン: ${thematicEvolution.evolution}\n`;
        }

        return content;
    }

    // 🚀 品質システム構築メソッド群

    private buildQualityMetricsAnalysis(qualityMetrics: any, detailLevel: string): string {
        if (!qualityMetrics) return '';

        let content = '\n### 品質メトリクス分析\n';
        content += '- 高品質な文章表現を心がけてください\n';
        
        if (qualityMetrics.targetScore) {
            content += `- 目標品質スコア: ${qualityMetrics.targetScore}\n`;
        }

        return content;
    }

    private buildStyleOptimizationGuidance(styleAnalysis: any, detailLevel: string): string {
        if (!styleAnalysis) return '';

        let content = '\n### 文体最適化指示\n';
        content += '- 文体の一貫性と多様性のバランスを取ってください\n';
        
        if (detailLevel === 'detailed') {
            content += '- 読みやすさと表現力を両立させてください\n';
        }

        return content;
    }

    private buildTensionPacingOptimization(tensionPacing: any, detailLevel: string): string {
        if (!tensionPacing) return '';

        let content = '\n### テンション・ペーシング最適化\n';
        
        if (tensionPacing.tension) {
            content += `- 推奨テンション: ${tensionPacing.tension.recommendedTension || 'N/A'}\n`;
        }
        if (tensionPacing.pacing) {
            content += `- 推奨ペーシング: ${tensionPacing.pacing.recommendedPacing || 'N/A'}\n`;
        }

        return content;
    }

    private buildReaderExperienceStrategy(readerExperience: any, detailLevel: string): string {
        if (!readerExperience) return '';

        let content = '\n### 読者体験向上戦略\n';
        content += '- 読者の感情移入と理解度を重視してください\n';

        return content;
    }

    // 🚀 伏線システム構築メソッド群

    private buildActiveForeshadowingAnalysis(activePlants: any[], detailLevel: string): string {
        if (!activePlants?.length) return '';

        let content = '\n### アクティブ伏線分析\n';
        content += `- アクティブな伏線: ${activePlants.length}項目\n`;
        
        if (detailLevel !== 'brief') {
            content += '- 伏線の自然な配置と回収を意識してください\n';
        }

        return content;
    }

    private buildResolutionPlanOptimization(resolutionPlans: any[], detailLevel: string): string {
        if (!resolutionPlans?.length) return '';

        let content = '\n### 解決計画最適化\n';
        content += '- 伏線の効果的な回収タイミングを見計らってください\n';

        return content;
    }

    private buildIntegrationOpportunities(integrationOpportunities: any[], detailLevel: string): string {
        if (!integrationOpportunities?.length) return '';

        let content = '\n### 統合機会発見\n';
        content += '- 複数の伏線を統合する機会を活用してください\n';

        return content;
    }

    // 🚀 統合文体・読者体験構築メソッド群

    private buildEnhancedStyleGuidance(styleGuidance: any, integratedData: RevolutionaryIntegratedData, detailLevel: string): string {
        let content = '\n### 強化文体ガイダンス\n';
        
        if (styleGuidance.general?.length) {
            content += '#### 一般的な指示\n';
            styleGuidance.general.slice(0, detailLevel === 'brief' ? 3 : 5).forEach((guidance: string) => {
                content += `- ${guidance}\n`;
            });
        }

        // 8システム統合による追加指示
        const integrationRate = this.calculateOverallIntegrationScore(integratedData);
        if (integrationRate > 0.7) {
            content += '\n#### 統合強化指示\n';
            content += '- 8システムの統合データを活用した表現の豊かさを追求してください\n';
        }

        return content;
    }

    private buildDynamicExpressionAlternatives(alternativeExpressions: any, integratedData: RevolutionaryIntegratedData, detailLevel: string): string {
        let content = '\n### 動的表現多様化\n';
        
        const categories = Object.keys(alternativeExpressions);
        categories.slice(0, detailLevel === 'brief' ? 2 : 4).forEach(category => {
            if (alternativeExpressions[category]) {
                content += `#### ${this.formatter.formatCategoryName(category)}\n`;
                const items = alternativeExpressions[category];
                if (Array.isArray(items)) {
                    items.slice(0, 3).forEach((item: any) => {
                        content += `- 「${item.original}」→「${item.alternatives?.[0] || 'N/A'}」など\n`;
                    });
                }
            }
        });

        return content;
    }

    private buildIntegratedStyleInstructions(integratedData: RevolutionaryIntegratedData, context: IntegratedPromptContext, detailLevel: string): string {
        let content = '\n### 統合文体指示\n';
        
        // キャラクター数に基づく指示
        const charCount = integratedData.characterSystem.allCharacters?.length || 0;
        if (charCount > 5) {
            content += '- 多数のキャラクターを明確に描き分けてください\n';
        }

        // 学習システムに基づく指示
        if (integratedData.learningSystem.currentJourney) {
            content += '- 学習体験を自然な文体で表現してください\n';
        }

        // ジャンルに基づく指示
        if (context.genre === 'business') {
            content += '- ビジネス専門用語を適切に使用してください\n';
        }

        return content;
    }

    private buildIntegratedReaderExperienceGuidance(integratedData: RevolutionaryIntegratedData, context: IntegratedPromptContext, detailLevel: string): string {
        let content = '\n### 統合読者体験ガイダンス\n';
        
        // 統合度に基づく指示
        const integrationScore = this.calculateOverallIntegrationScore(integratedData);
        if (integrationScore > 0.8) {
            content += '- 高度に統合されたデータを活用し、深い読者体験を提供してください\n';
        }

        // 学習システムに基づく指示
        if (integratedData.learningSystem.currentJourney) {
            content += '- 読者の学びと感動を両立させてください\n';
        }

        // キャラクターシステムに基づく指示
        if (integratedData.characterSystem.psychology) {
            content += '- キャラクターの心理描写を通じて読者の共感を促してください\n';
        }

        return content;
    }

    // 🚀 スコア計算メソッド群

    private calculateCharacterIntegrationScore(charData: any): number {
        let score = 0.5;
        if (charData.allCharacters?.length) score += 0.2;
        if (charData.psychology && Object.keys(charData.psychology).length) score += 0.2;
        if (charData.relationships) score += 0.1;
        return Math.min(score, 1.0);
    }

    private calculateLearningIntegrationScore(learningData: any): number {
        let score = 0.3;
        if (learningData.currentJourney) score += 0.3;
        if (learningData.emotionalArcs) score += 0.2;
        if (learningData.catharticMoments?.length) score += 0.2;
        return Math.min(score, 1.0);
    }

    private calculateMemoryIntegrationScore(memoryData: any): number {
        let score = 0.4;
        if (memoryData.unifiedContext?.success) score += 0.3;
        if (memoryData.temporalAnalysis) score += 0.2;
        if (memoryData.crossLevelData) score += 0.1;
        return Math.min(score, 1.0);
    }

    private calculatePlotIntegrationScore(plotData: any): number {
        let score = 0.3;
        if (plotData.worldSettings) score += 0.25;
        if (plotData.plotDirectives) score += 0.25;
        if (plotData.arcProgression) score += 0.2;
        return Math.min(score, 1.0);
    }

    private calculateQualityIntegrationScore(analysisData: any): number {
        let score = 0.4;
        if (analysisData.qualityMetrics) score += 0.2;
        if (analysisData.styleAnalysis) score += 0.2;
        if (analysisData.tensionPacing) score += 0.2;
        return Math.min(score, 1.0);
    }

    private calculateForeshadowingIntegrationScore(foreshadowingData: any): number {
        let score = 0.3;
        if (foreshadowingData.activePlants?.length) score += 0.3;
        if (foreshadowingData.resolutionPlans?.length) score += 0.2;
        if (foreshadowingData.integrationOpportunities?.length) score += 0.2;
        return Math.min(score, 1.0);
    }

    private calculateOverallIntegrationScore(integratedData: RevolutionaryIntegratedData): number {
        const scores = [
            this.calculateCharacterIntegrationScore(integratedData.characterSystem),
            this.calculateLearningIntegrationScore(integratedData.learningSystem),
            this.calculateMemoryIntegrationScore(integratedData.memorySystem),
            this.calculatePlotIntegrationScore(integratedData.plotSystem),
            this.calculateQualityIntegrationScore(integratedData.analysisSystem),
            this.calculateForeshadowingIntegrationScore(integratedData.foreshadowingSystem)
        ];

        return scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }

    // 🚀 ユーティリティメソッド群

    private createDefaultBuildConfig(context: IntegratedPromptContext, integratedData: RevolutionaryIntegratedData): SectionBuildConfig {
        const config: SectionBuildConfig = {
            includeSections: [],
            detailLevel: 'standard',
            priorities: {}
        };

        // 利用可能なデータに基づいてセクションを選択
        if (integratedData.characterSystem.allCharacters?.length) {
            config.includeSections.push('revolutionaryCharacter');
            config.priorities['revolutionaryCharacter'] = 0.9;
        }

        if (integratedData.learningSystem.currentJourney) {
            config.includeSections.push('integratedLearning');
            config.priorities['integratedLearning'] = 0.85;
        }

        if (integratedData.memorySystem.unifiedContext) {
            config.includeSections.push('unifiedMemory');
            config.priorities['unifiedMemory'] = 0.8;
        }

        if (integratedData.plotSystem.plotDirectives) {
            config.includeSections.push('enhancedPlot');
            config.priorities['enhancedPlot'] = 0.8;
        }

        // 品質セクションは常に含める
        config.includeSections.push('qualityOptimization');
        config.priorities['qualityOptimization'] = 0.7;

        // 文体セクション
        if (context.styleGuidance || context.alternativeExpressions) {
            config.includeSections.push('dynamicStyle');
            config.priorities['dynamicStyle'] = 0.75;
        }

        // 読者体験セクション
        if (context.improvementSuggestions?.length) {
            config.includeSections.push('readerExperience');
            config.priorities['readerExperience'] = 0.65;
        }

        // 詳細レベルの決定
        const integrationScore = this.calculateOverallIntegrationScore(integratedData);
        if (integrationScore > 0.8) {
            config.detailLevel = 'revolutionary';
        } else if (integrationScore > 0.6) {
            config.detailLevel = 'detailed';
        } else if (integrationScore < 0.4) {
            config.detailLevel = 'brief';
        }

        return config;
    }

    private sortSectionsByPriority(sections: IntegratedSectionResult[], priorities: { [sectionName: string]: number }): IntegratedSectionResult[] {
        return sections.sort((a, b) => {
            const priorityA = priorities[a.name] || 0.5;
            const priorityB = priorities[b.name] || 0.5;
            return priorityB - priorityA;
        });
    }

    private assessSectionQuality(content: string, dataSources: string[], integrationScore: number): { completeness: number; relevance: number; clarity: number } {
        return {
            completeness: Math.min(content.length / 500, 1.0), // 500文字を完全とする
            relevance: dataSources.length > 0 ? 0.8 : 0.3,
            clarity: content.includes('###') ? 0.8 : 0.6 // 構造化されているかチェック
        };
    }

    private calculateAverageQuality(sections: IntegratedSectionResult[]): number {
        if (sections.length === 0) return 0;
        
        const totalQuality = sections.reduce((sum, section) => {
            return sum + (section.qualityMetrics.completeness + section.qualityMetrics.relevance + section.qualityMetrics.clarity) / 3;
        }, 0);

        return totalQuality / sections.length;
    }

    private generateSectionCacheKey(sectionName: string, context: IntegratedPromptContext, integratedData: RevolutionaryIntegratedData): string {
        return `${sectionName}|${context.chapterNumber}|${this.calculateOverallIntegrationScore(integratedData).toFixed(2)}`;
    }

    private isSectionCacheValid(cached: IntegratedSectionResult): boolean {
        // 簡易的な有効性チェック
        return cached.qualityMetrics.completeness > this.qualityThreshold;
    }

    private buildFallbackSections(context: IntegratedPromptContext, integratedData: RevolutionaryIntegratedData): IntegratedSectionResult[] {
        logger.warn('🚀 Building fallback sections');
        
        const fallbackSection: IntegratedSectionResult = {
            name: 'fallback',
            content: `
## 🚀 基本セクション（フォールバック）
### 章生成指示
- 章番号: ${context.chapterNumber || 1}
- 目標文字数: ${context.targetLength || 8000}文字
- 高品質な小説を生成してください

### 品質要求
- 読者の興味を引く内容にしてください
- キャラクターの魅力を活かしてください
- 物語の一貫性を保ってください
`,
            dataSources: ['fallback'],
            integrationScore: 0.3,
            qualityMetrics: {
                completeness: 0.5,
                relevance: 0.6,
                clarity: 0.7
            }
        };

        return [fallbackSection];
    }

    private initializePriorityMatrix(): SectionPriorityMatrix {
        return {
            character: {
                psychology: 0.9,
                growth: 0.8,
                relationships: 0.7,
                focus: 0.85
            },
            learning: {
                journey: 0.9,
                emotional: 0.8,
                cathartic: 0.75,
                stage: 0.7
            },
            plot: {
                directive: 0.85,
                world: 0.8,
                theme: 0.75,
                tension: 0.8
            },
            quality: {
                style: 0.8,
                expression: 0.7,
                reader: 0.75,
                literary: 0.6
            }
        };
    }

    // 🚀 既存メソッドの互換性維持（そのまま保持）
    public buildCharacterPsychologySection(context: any): string {
        if (!context.characterPsychology) {
            return '';
        }

        let psychologySection = "\n## キャラクターの心理状態\n";

        try {
            for (const [characterId, psychologyData] of Object.entries(context.characterPsychology)) {
                const psychology = psychologyData as any;
                const character = context.characters?.find((c: any) => c.id === characterId);
                if (!character) continue;

                psychologySection += `【${character.name}】の心理:\n`;
                if (psychology.currentDesires && psychology.currentDesires.length > 0) {
                    psychologySection += `- 現在の欲求: ${psychology.currentDesires.join('、')}\n`;
                }

                if (psychology.currentFears && psychology.currentFears.length > 0) {
                    psychologySection += `- 現在の恐れ: ${psychology.currentFears.join('、')}\n`;
                }

                if (psychology.internalConflicts && psychology.internalConflicts.length > 0) {
                    psychologySection += `- 内的葛藤: ${psychology.internalConflicts.join('、')}\n`;
                }

                if (psychology.emotionalState) {
                    const entriesArray = Object.entries(psychology.emotionalState) as [string, number][];
                    const emotions = entriesArray
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3);

                    if (emotions.length > 0) {
                        psychologySection += "- 感情状態: ";
                        psychologySection += emotions.map(([emotion, intensity]) =>
                            `${emotion}(${Math.round(intensity * 10)}/10)`
                        ).join('、');
                        psychologySection += '\n';
                    }
                }

                const attitudes = psychology.relationshipAttitudes;
                if (attitudes && Object.keys(attitudes).length > 0) {
                    psychologySection += "- 他者への感情:\n";

                    for (const [targetId, attitudeData] of Object.entries(attitudes)) {
                        const attitude = attitudeData as any;
                        const targetChar = context.characters?.find((c: any) => c.id === targetId);
                        if (!targetChar) continue;

                        psychologySection += `  • ${targetChar.name}への${attitude.attitude} (強度:${Math.round(attitude.intensity * 10)}/10)${attitude.isDynamic ? `、変化中: ${attitude.recentChange}` : ''}\n`;
                    }
                }

                psychologySection += "\n";
            }

            return psychologySection;
        } catch (error) {
            logger.error('Error building character psychology section', { error });
            return '';
        }
    }

    public buildCharacterGrowthSection(context: any, genre: string): string {
        if (!context.characterGrowthInfo) {
            return '';
        }

        try {
            let growthSection = "\n## キャラクターの成長とスキル情報\n";
            const growthInfo = context.characterGrowthInfo;

            if (growthInfo.mainCharacters && growthInfo.mainCharacters.length > 0) {
                growthSection += "### 主要キャラクターの成長情報\n";

                for (const character of growthInfo.mainCharacters) {
                    growthSection += `【${character.name}】\n`;

                    if (character.growthPhase) {
                        growthSection += `現在の成長フェーズ: ${character.growthPhase}\n`;
                    }

                    if (character.skills && character.skills.length > 0) {
                        growthSection += "習得スキル:\n";
                        character.skills.forEach((skill: { name: string; level: number }) => {
                            growthSection += `- ${skill.name} (Lv.${skill.level})\n`;
                        });
                    }

                    if (character.parameters && character.parameters.length > 0) {
                        const topParameters = [...character.parameters]
                            .sort((a: { value: number }, b: { value: number }) => b.value - a.value)
                            .slice(0, 5);

                        growthSection += "特性パラメータ:\n";
                        topParameters.forEach((param: { name: string; value: number }) => {
                            growthSection += `- ${param.name}: ${param.value}/100\n`;
                        });
                    }

                    growthSection += "\n";
                }
            }

            if (growthInfo.supportingCharacters && growthInfo.supportingCharacters.length > 0) {
                growthSection += "### サポートキャラクターの特徴\n";

                for (const character of growthInfo.supportingCharacters) {
                    growthSection += `【${character.name}】\n`;

                    if (character.skills && character.skills.length > 0) {
                        const topSkills = character.skills.slice(0, 2);
                        if (topSkills.length > 0) {
                            growthSection += `得意: ${topSkills.map((s: any) => s.name).join('、')}\n`;
                        }
                    }

                    growthSection += "\n";
                }
            }

            if (genre === 'business') {
                const businessGrowthGuidance = this.templateManager.getBusinessSpecificSection('growthGuidance');
                if (businessGrowthGuidance) {
                    growthSection += businessGrowthGuidance + "\n";
                }
            }

            growthSection += "### 成長描写のガイダンス\n";
            growthSection += "- キャラクターの成長段階と習得スキルを考慮した描写をしてください\n";
            growthSection += "- スキルを使用するシーンでは、そのスキルの熟練度に応じた描写をしてください\n";
            growthSection += "- キャラクターの特性パラメータが高い能力は自然に発揮され、低い能力は苦手として描写してください\n";
            growthSection += "- 成長中のキャラクターには、新しい能力の獲得や既存能力の向上を示すシーンを含めてください\n";

            return growthSection;
        } catch (error) {
            logger.error('Error building character growth section', { error });
            return '';
        }
    }

    public buildEmotionalArcSection(context: any, genre: string): string {
        if (!context.emotionalArc) {
            return '';
        }

        try {
            let emotionalArcSection = "\n## 感情アークの設計\n";

            emotionalArcSection += `推奨トーン: ${context.emotionalArc.recommendedTone}\n\n`;

            emotionalArcSection += "章内での感情の流れ:\n";

            emotionalArcSection += "- 冒頭部:\n";
            context.emotionalArc.emotionalJourney.opening.forEach((item: any) => {
                emotionalArcSection += `  • ${item.dimension}: ${item.level}/10\n`;
            });

            emotionalArcSection += "- 展開部:\n";
            context.emotionalArc.emotionalJourney.development.forEach((item: any) => {
                emotionalArcSection += `  • ${item.dimension}: ${item.level}/10\n`;
            });

            emotionalArcSection += "- 結末部:\n";
            context.emotionalArc.emotionalJourney.conclusion.forEach((item: any) => {
                emotionalArcSection += `  • ${item.dimension}: ${item.level}/10\n`;
            });

            if (context.emotionalArc.reason) {
                emotionalArcSection += `\n設計理由: ${context.emotionalArc.reason}\n`;
            }

            if (genre === 'business') {
                const businessEmotionalGuidance = this.templateManager.getBusinessSpecificSection('emotionalArcGuidance');
                if (businessEmotionalGuidance) {
                    emotionalArcSection += businessEmotionalGuidance + "\n";
                }
            }

            return emotionalArcSection;
        } catch (error) {
            logger.error('Error building emotional arc section', { error });
            return '';
        }
    }

    public buildStyleGuidanceSection(context: any, genre: string): string {
        if (context.styleGuidance) {
            try {
                const styleGuidance = context.styleGuidance;
                let styleSection = "\n## 文体ガイダンス\n";

                if (styleGuidance.general && styleGuidance.general.length > 0) {
                    styleGuidance.general.forEach((guidance: string) => {
                        styleSection += `- ${guidance}\n`;
                    });
                }

                if (styleGuidance.sentenceStructure && styleGuidance.sentenceStructure.length > 0) {
                    styleSection += "\n文の構造:\n";
                    styleGuidance.sentenceStructure.forEach((guidance: string) => {
                        styleSection += `- ${guidance}\n`;
                    });
                }

                if (styleGuidance.vocabulary && styleGuidance.vocabulary.length > 0) {
                    styleSection += "\n語彙の使用:\n";
                    styleGuidance.vocabulary.forEach((guidance: string) => {
                        styleSection += `- ${guidance}\n`;
                    });
                }

                if (styleGuidance.rhythm && styleGuidance.rhythm.length > 0) {
                    styleSection += "\n文のリズム:\n";
                    styleGuidance.rhythm.forEach((guidance: string) => {
                        styleSection += `- ${guidance}\n`;
                    });
                }

                if (genre === 'business') {
                    const businessStyleGuidance = this.templateManager.getBusinessSpecificSection('styleGuidance');
                    if (businessStyleGuidance) {
                        styleSection += businessStyleGuidance + "\n";
                    }
                }

                let hasSubjectDiversityGuidance = false;
                if (styleGuidance.sentenceStructure) {
                    for (const guidance of styleGuidance.sentenceStructure) {
                        if (guidance.includes('主語') || guidance.includes('キャラクター名') ||
                            guidance.includes('代名詞')) {
                            hasSubjectDiversityGuidance = true;
                            break;
                        }
                    }
                }

                if (styleGuidance.examples && styleGuidance.examples.length > 0) {
                    styleSection += "\n### 文体改善の具体例:\n";
                    styleGuidance.examples.forEach((example: any) => {
                        styleSection += "❌ 避けるべき表現:\n";
                        styleSection += `${example.before}\n\n`;
                        styleSection += "✅ 推奨される表現:\n";
                        styleSection += `${example.after}\n\n`;
                    });
                }

                if (!hasSubjectDiversityGuidance) {
                    styleSection += "\n### 主語の多様性（重要）\n";
                    styleSection += "- 同じキャラクター名を連続して主語に使うのを避けてください\n";
                    styleSection += "- 代名詞（「彼」「彼女」「その人」など）を適切に使ってください\n";
                    styleSection += "- 文脈から明らかな場合は主語を省略してください（日本語の特性を活かす）\n";
                    styleSection += "- 複数の文を接続詞や接続助詞で結んで一文にすることで、主語の繰り返しを減らしてください\n";

                    if (!styleGuidance.examples || styleGuidance.examples.length === 0) {
                        styleSection += "\n### 主語多様性の具体例:\n";
                        styleSection += "❌ 避けるべき表現:\n";
                        styleSection += "太郎は部屋に入った。太郎は窓を開けた。太郎は深呼吸をした。\n\n";
                        styleSection += "✅ 推奨される表現:\n";
                        styleSection += "太郎は部屋に入り、窓を開けた。そして、深呼吸をした。\n\n";

                        styleSection += "❌ 避けるべき表現:\n";
                        styleSection += "花子は本を取り出した。花子はページをめくった。花子は内容に夢中になった。\n\n";
                        styleSection += "✅ 推奨される表現:\n";
                        styleSection += "花子は本を取り出してページをめくった。その内容に、彼女はすぐに夢中になった。\n\n";
                    }
                }

                return styleSection;
            } catch (error) {
                logger.error('Error building style guidance section', { error });
            }
        }

        let basicStyleSection = "\n## 文体ガイダンス（主語の多様性）\n";
        basicStyleSection += "- 同じキャラクター名を連続して主語に使うのを避けてください\n";
        basicStyleSection += "- 代名詞や主語の省略を活用して、文体の自然さを保ってください\n";
        basicStyleSection += "- 複数の文を接続詞で結合するなど、文構造に変化をつけてください\n";

        basicStyleSection += "\n### 具体例:\n";
        basicStyleSection += "❌ 避けるべき表現:\n";
        basicStyleSection += "ルナは、周囲を見回しながら、不安を押し殺した。ルナは、通路の先に、かすかな光を見た。ルナは、一歩、また一歩と、光に向かって歩き出した。\n\n";
        basicStyleSection += "✅ 推奨される表現:\n";
        basicStyleSection += "ルナは周囲を見回しながら、不安を押し殺した。通路の先にかすかな光が目に入る。一歩、また一歩と、光に向かって歩き出した。\n\n";

        return basicStyleSection;
    }

    public buildExpressionAlternativesSection(context: any, genre: string): string {
        if (!context.alternativeExpressions || Object.keys(context.alternativeExpressions).length === 0) {
            return '';
        }

        try {
            const alternativeExpressions = context.alternativeExpressions;
            let expressionSection = "\n## 表現の多様化\n";
            expressionSection += "以下の表現パターンを避け、代替表現を使用してください：\n\n";

            for (const category in alternativeExpressions) {
                if (alternativeExpressions[category] && alternativeExpressions[category].length > 0) {
                    expressionSection += `### ${this.formatter.formatCategoryName(category)}\n`;

                    alternativeExpressions[category].forEach((item: any) => {
                        expressionSection += `- 「${item.original}」を避け、代わりに：\n`;
                        item.alternatives.slice(0, 3).forEach((alt: string) => {
                            expressionSection += `  • 「${alt}」\n`;
                        });
                    });

                    expressionSection += "\n";
                }
            }

            if (genre === 'business') {
                const businessExpressionGuidance = this.templateManager.getBusinessSpecificSection('expressionGuidance');
                if (businessExpressionGuidance) {
                    expressionSection += businessExpressionGuidance + "\n";
                }
            }

            return expressionSection;
        } catch (error) {
            logger.error('Error building expression alternatives section', { error });
            return '';
        }
    }

    public buildLegacyReaderExperienceSection(context: any, genre: string): string {
        if (!context.improvementSuggestions || !context.improvementSuggestions.length) {
            return '';
        }

        try {
            let improvementSection = "\n## 読者体験向上のためのポイント\n";

            context.improvementSuggestions.forEach((suggestion: string) => {
                improvementSection += `- ${suggestion}\n`;
            });

            if (genre === 'business') {
                const businessReaderGuidance = this.templateManager.getBusinessSpecificSection('readerGuidance');
                if (businessReaderGuidance) {
                    improvementSection += businessReaderGuidance + "\n";
                }
            }

            return improvementSection;
        } catch (error) {
            logger.error('Error building reader experience section', { error });
            return '';
        }
    }

    public buildLiteraryInspirationSection(context: any, genre: string): string {
        if (!context.literaryInspirations) {
            return '';
        }

        try {
            const literaryInspirations = context.literaryInspirations;
            let literarySection = "\n## 文学的手法のインスピレーション\n";
            literarySection += "以下の文学的手法を適切に取り入れることで、小説の質を高めてください：\n\n";

            if (literaryInspirations.plotTechniques && literaryInspirations.plotTechniques.length > 0) {
                literarySection += "### プロット展開手法\n";
                literaryInspirations.plotTechniques.forEach((technique: any) => {
                    literarySection += `#### ${technique.technique}\n`;
                    literarySection += `${technique.description}\n`;
                    literarySection += `例（${technique.reference}）: ${technique.example}\n\n`;
                });
            }

            if (literaryInspirations.characterTechniques && literaryInspirations.characterTechniques.length > 0) {
                literarySection += "### キャラクター描写手法\n";
                literaryInspirations.characterTechniques.forEach((technique: any) => {
                    literarySection += `#### ${technique.technique}\n`;
                    literarySection += `${technique.description}\n`;
                    literarySection += `例（${technique.reference}）: ${technique.example}\n\n`;
                });
            }

            if (literaryInspirations.atmosphereTechniques && literaryInspirations.atmosphereTechniques.length > 0) {
                literarySection += "### 雰囲気構築手法\n";
                literaryInspirations.atmosphereTechniques.forEach((technique: any) => {
                    literarySection += `#### ${technique.technique}\n`;
                    literarySection += `${technique.description}\n`;
                    literarySection += `例（${technique.reference}）: ${technique.example}\n\n`;
                });
            }

            if (genre === 'business') {
                literarySection += "### ビジネス物語特有の手法\n";

                literarySection += "#### 専門知識の自然な導入\n";
                literarySection += "ビジネスや業界の専門知識を物語の自然な流れの中で導入する技法。説明的にならず、ストーリーと融合させる。\n";
                literarySection += "例（「リーン・スタートアップ」）: チームが顧客フィードバックに基づいて製品を急速に修正する過程で、MVPの概念が自然に示される。\n\n";

                literarySection += "#### 現実とビジョンの対比\n";
                literarySection += "起業家の描く理想の未来と現実の厳しさを対比させることで緊張感を生み出す技法。\n";
                literarySection += "例（「スティーブ・ジョブズ」）: ジョブズが完璧なユーザー体験を思い描く一方で、技術的制約との戦いが描かれる。\n\n";

                literarySection += "#### 複数視点からの意思決定\n";
                literarySection += "同じビジネス判断を異なる立場（CEO、エンジニア、マーケター、投資家など）から描写し、複雑さを表現する技法。\n";
                literarySection += "例（「ハードシング」）: 重要な戦略決定について、各部門長の異なる懸念と視点が交錯する様子が描かれる。\n\n";
            }

            return literarySection;
        } catch (error) {
            logger.error('Error building literary inspiration section', { error });
            return '';
        }
    }

    public buildThemeEnhancementSection(context: any, genre: string): string {
        if (!context.themeEnhancements || !context.themeEnhancements.length) {
            return '';
        }

        try {
            const themeEnhancements = context.themeEnhancements;
            let themeSection = "\n## テーマ表現の深化\n";
            themeSection += "以下のテーマをより効果的に表現してください：\n\n";

            themeEnhancements.forEach((enhancement: any) => {
                themeSection += `### ${enhancement.theme}\n`;
                themeSection += `${enhancement.suggestion}\n\n`;

                themeSection += "推奨アプローチ:\n";
                if (enhancement.approaches && enhancement.approaches.length > 0) {
                    enhancement.approaches.forEach((approach: string) => {
                        themeSection += `- ${approach}\n`;
                    });
                }

                themeSection += "\n";
            });

            if (genre === 'business') {
                const businessThemeGuidance = this.templateManager.getBusinessSpecificSection('themeGuidance');
                if (businessThemeGuidance) {
                    themeSection += businessThemeGuidance + "\n";
                }
            }

            return themeSection;
        } catch (error) {
            logger.error('Error building theme enhancement section', { error });
            return '';
        }
    }

    public buildTensionGuidanceSection(context: any, genre: string): string {
        if (!context.tensionRecommendation) {
            return '';
        }

        try {
            const tensionRecommendation = context.tensionRecommendation;
            let dynamicTensionSection = "\n## テンション構築の詳細ガイダンス\n";

            switch (tensionRecommendation.direction) {
                case "increase":
                    dynamicTensionSection += "このチャプターでは **テンションを上昇させる** ことを重視してください。\n";
                    break;
                case "decrease":
                    dynamicTensionSection += "このチャプターでは **テンションをやや下げる** ことで緩急をつけてください。\n";
                    break;
                case "maintain":
                    dynamicTensionSection += "このチャプターでは **テンションを維持する** ことで一定の緊張感を保ってください。\n";
                    break;
                case "establish":
                    dynamicTensionSection += "このチャプターでは **テンションの基調を確立** してください。\n";
                    break;
            }

            if (tensionRecommendation.reason) {
                dynamicTensionSection += `理由: ${tensionRecommendation.reason}\n\n`;
            }

            if (context.pacingRecommendation) {
                dynamicTensionSection += "## ペーシングの調整\n";
                dynamicTensionSection += `${context.pacingRecommendation.description}\n`;
            }

            dynamicTensionSection += "\n## テンション構築テクニック\n";

            if (genre === 'business') {
                dynamicTensionSection += "### ビジネス物語でのテンション構築\n";

                const tension = tensionRecommendation.recommendedTension;
                if (tension >= 0.8) {
                    dynamicTensionSection += "- ビジネス上の危機（資金切れ、大型顧客の喪失、重要な人材の離脱など）を導入してください\n";
                    dynamicTensionSection += "- 競合の予期せぬ動きが与える脅威を描写してください\n";
                    dynamicTensionSection += "- 厳しい期限や投資家からのプレッシャーを強調してください\n";
                    dynamicTensionSection += "- チーム内の重大な対立や意見相違を先鋭化させてください\n";
                } else if (tension >= 0.6) {
                    dynamicTensionSection += "- 製品開発上の予期せぬ技術的障害を導入してください\n";
                    dynamicTensionSection += "- 市場の反応が期待と異なる状況を描写してください\n";
                    dynamicTensionSection += "- 事業拡大に伴う組織的課題や文化の変化を表現してください\n";
                    dynamicTensionSection += "- 異なるステークホルダー間の利害対立を示してください\n";
                } else if (tension >= 0.4) {
                    dynamicTensionSection += "- 競合調査や市場分析から得られる微妙な警告信号を織り込んでください\n";
                    dynamicTensionSection += "- チーム内の小さな対立や意見相違を描写してください\n";
                    dynamicTensionSection += "- 新しいビジネスチャンスと既存リソースの制約の間の葛藤を表現してください\n";
                    dynamicTensionSection += "- 意思決定の背後にあるリスクと不確実性を示唆してください\n";
                } else {
                    dynamicTensionSection += "- チームビルディングや組織文化の構築プロセスに重点を置いてください\n";
                    dynamicTensionSection += "- 戦略的思考や長期ビジョンの探索を通じて知的興味を維持してください\n";
                    dynamicTensionSection += "- 顧客や市場との関係構築の機微を描写してください\n";
                    dynamicTensionSection += "- キャラクターの個人的成長とビジネス上の成長の関連を示してください\n";
                }
            } else {
                const tension = tensionRecommendation.recommendedTension;
                if (tension >= 0.8) {
                    dynamicTensionSection += "- 対立や葛藤を先鋭化させてください\n";
                    dynamicTensionSection += "- 時間制限や切迫感を明示してください\n";
                    dynamicTensionSection += "- 短い文とストレートな表現を使って緊迫感を演出してください\n";
                } else if (tension >= 0.6) {
                    dynamicTensionSection += "- 状況の複雑化や障害の導入を心がけてください\n";
                    dynamicTensionSection += "- 未解決の問題や不確実性を強調してください\n";
                    dynamicTensionSection += "- 緊張と緩和のリズムを作りながら全体的なテンションを維持してください\n";
                } else if (tension >= 0.4) {
                    dynamicTensionSection += "- 伏線や謎を巧みに配置してください\n";
                    dynamicTensionSection += "- キャラクターの内的葛藤や関係性の微妙な変化を描いてください\n";
                    dynamicTensionSection += "- 平穏な中にも今後の変化を予感させる要素を含めてください\n";
                } else {
                    dynamicTensionSection += "- 詳細な描写と情景構築に重点を置いてください\n";
                    dynamicTensionSection += "- キャラクターや世界観の掘り下げを優先してください\n";
                    dynamicTensionSection += "- 穏やかながらも読者の共感や好奇心を引く要素を含めてください\n";
                }
            }

            return dynamicTensionSection;
        } catch (error) {
            logger.error('Error building tension guidance section', { error });
            return '';
        }
    }

    public buildBusinessSpecificSection(genre: string): string {
        if (genre !== 'business') {
            return '';
        }

        try {
            const businessGuidance = this.templateManager.getBusinessSpecificSection('businessGuidance') || '';
            return businessGuidance ? `\n${businessGuidance}` : '';
        } catch (error) {
            logger.error('Error building business specific section', { error });
            return '';
        }
    }

    public determineFocusCharacters(context: GenerationContext): string[] {
        const focusCharacters: string[] = [];

        if ((context as any).focusCharacters && Array.isArray((context as any).focusCharacters)) {
            return (context as any).focusCharacters.map((c: any) => typeof c === 'string' ? c : c.name);
        }

        if (context.characters && Array.isArray(context.characters)) {
            const mainCharacters = context.characters
                .filter(c => c.type === 'MAIN' || (c.significance && c.significance >= 0.8))
                .map(c => c.name);

            const subCharacters = context.characters
                .filter(c => ((c.type === 'SUB' || (c.significance && c.significance >= 0.6)) &&
                    !mainCharacters.includes(c.name)))
                .map(c => c.name);

            if ((context as any).narrativeState && (context as any).narrativeState.state === 'BATTLE') {
                return mainCharacters.slice(0, 3);
            } else if ((context as any).narrativeState && (context as any).narrativeState.state === 'INTRODUCTION') {
                const newCharacters = context.characters
                    .filter(c => (c as any).firstAppearance === context.chapterNumber)
                    .map(c => c.name);

                return [...newCharacters, ...mainCharacters].slice(0, 4);
            }

            return [...mainCharacters.slice(0, 2), ...subCharacters.slice(0, 1)];
        }

        return focusCharacters;
    }

    public buildLearningJourneySection(context: any, genre: string): string {
        if (!context.learningJourney) {
            return '';
        }

        try {
            const learningJourney = context.learningJourney;
            let learningSection = "\n## 学びの物語ガイダンス\n";

            learningSection += `・概念: ${learningJourney.mainConcept}\n`;
            learningSection += `・学習段階: ${this.formatLearningStage(learningJourney.learningStage)}\n\n`;

            if (learningJourney.embodimentPlan) {
                const plan = learningJourney.embodimentPlan;
                learningSection += "### 体現化ガイド\n";
                learningSection += `・表現方法: ${plan.expressionMethods.join('、')}\n`;
                learningSection += `・重要要素: ${plan.keyElements.join('、')}\n`;
                if (plan.dialogueSuggestions && plan.dialogueSuggestions.length > 0) {
                    learningSection += `・対話例: ${this.selectRandomItems(plan.dialogueSuggestions, 2).join('、')}\n`;
                }
                learningSection += "\n";
            }

            if (learningJourney.emotionalArc) {
                const arc = learningJourney.emotionalArc;
                learningSection += "### 感情アーク\n";
                learningSection += `・トーン: ${arc.recommendedTone}\n`;
                learningSection += `・感情変化: 始まり（${this.formatEmotionalDimensions(arc.emotionalJourney.opening)}）→ `;
                learningSection += `展開（${this.formatEmotionalDimensions(arc.emotionalJourney.development)}）→ `;
                learningSection += `結末（${this.formatEmotionalDimensions(arc.emotionalJourney.conclusion)}）\n\n`;
            }

            if (learningJourney.catharticExperience) {
                const exp = learningJourney.catharticExperience;
                learningSection += "### カタルシス体験\n";
                learningSection += `・タイプ: ${this.formatCatharticType(exp.type)}\n`;
                learningSection += `・トリガー: ${exp.trigger}\n`;
                learningSection += `・ピーク瞬間: ${exp.peakMoment}\n\n`;
            }

            if (learningJourney.empatheticPoints && learningJourney.empatheticPoints.length > 0) {
                learningSection += "### 共感ポイント\n";
                for (const point of learningJourney.empatheticPoints) {
                    learningSection += `・${point.description}（強度: ${Math.round(point.intensity * 10)}/10）\n`;
                }
                learningSection += "\n";
            }

            if (learningJourney.sceneRecommendations && learningJourney.sceneRecommendations.length > 0) {
                learningSection += "### シーン推奨\n";
                for (const rec of learningJourney.sceneRecommendations) {
                    learningSection += `・${rec.description}（${rec.reason}）\n`;
                }
                learningSection += "\n";
            }

            learningSection += `
## 重要な執筆ガイドライン
1. **変容と成長**: キャラクターの内面変化を通して読者に共感体験を提供する
2. **体験的学習**: 概念を説明するのではなく、キャラクターの体験を通して読者が自然と学べるようにする
3. **感情の旅**: 指定された感情アークに沿って読者を感情的な旅に連れていく
4. **共感ポイント**: 指定された共感ポイントを効果的に描写し、読者の感情移入を促す
5. **カタルシス**: 学びと感情が統合された瞬間を印象的に描く
6. **自然な対話**: 教科書的な説明ではなく、自然な対話と内面描写で概念を表現する
7. **具体的な場面**: 抽象的な概念を具体的なビジネスシーンで表現する
`;

            return learningSection;
        } catch (error) {
            logger.error('Error building learning journey section', { error });
            return '';
        }
    }

    public getChapterPurposeAndPlotPoints(context: GenerationContext): { purpose: string, plotPoints: string } {
        const chapterType = (context as any).chapterType || 'STANDARD';

        const purposeMap: Record<string, string> = {
            'OPENING': '物語の世界とキャラクターを紹介し、読者の興味を引く最初の葛藤を導入する',
            'ACTION': '活発な行動とドラマチックな展開によって物語を前進させる',
            'REVELATION': '重要な真実や秘密を明らかにし、キャラクターや物語の方向性に影響を与える',
            'INTROSPECTION': 'キャラクターの内面的な成長や変化を探求する',
            'CLOSING': '物語の主要な葛藤を解決し、キャラクターの旅を締めくくる',
            'NEW_ARC': '新しい物語の方向性を確立し、新たな課題や目標を導入する',
            'ARC_RESOLUTION': '現在のストーリーアークを締めくくり、次のアークへの橋渡しをする',
            'BUSINESS_CHALLENGE': 'ビジネス上の課題に直面し、解決策を模索する',
            'PRODUCT_DEVELOPMENT': '製品やサービスの開発プロセスを描写する',
            'TEAM_BUILDING': 'チーム構築とリーダーシップの成長に焦点を当てる',
            'MARKET_ENTRY': '市場参入とマーケティング戦略の実行を描く',
            'STANDARD': '物語を着実に前進させ、キャラクターの課題や葛藤を深める'
        };

        let plotPoints = '';

        if (context.plotPoints && context.plotPoints.length > 0) {
            plotPoints = context.plotPoints.join('\n- ');
        } else {
            const narrativeState = (context as any).narrativeState;
            let defaultPoints = [
                'キャラクターが新たな問題や障害に直面する',
                '以前に導入された葛藤が深まるか進展する',
                '少なくとも1つの重要な決断や行動が行われる'
            ];

            if (narrativeState && narrativeState.state) {
                switch (narrativeState.state) {
                    case 'BATTLE':
                        defaultPoints.push('戦闘または対立の進展または解決');
                        break;
                    case 'REVELATION':
                        defaultPoints.push('新たな情報や秘密の開示');
                        break;
                    case 'JOURNEY':
                        defaultPoints.push('物理的または心理的な旅の進展');
                        break;
                    case 'INVESTIGATION':
                        defaultPoints.push('調査の進展または新たな発見');
                        break;
                    case 'DILEMMA':
                        defaultPoints.push('葛藤における選択または決断');
                        break;
                    case 'TRAINING':
                        defaultPoints.push('訓練または成長の展開');
                        break;
                }
            }

            plotPoints = defaultPoints.join('\n- ');
        }

        return {
            purpose: purposeMap[chapterType] || purposeMap['STANDARD'],
            plotPoints: `- ${plotPoints}`
        };
    }

    private selectRandomItems(array: any[], count: number): any[] {
        if (!array || array.length <= count) return array || [];
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    private formatEmotionalDimensions(dimensions: Array<{ dimension: string, level: number }>): string {
        return dimensions
            .map(d => `${d.dimension}(${d.level})`)
            .join('、');
    }

    private formatCatharticType(type: string): string {
        const typeMapping: Record<string, string> = {
            'emotional': '感情的カタルシス',
            'intellectual': '知的カタルシス',
            'moral': '道徳的カタルシス',
            'transformative': '変容的カタルシス'
        };

        return typeMapping[type] || type;
    }

    private formatLearningStage(stage: LearningStage): string {
        const stageMapping: Record<string, string> = {
            'MISCONCEPTION': '誤解段階',
            'EXPLORATION': '探索段階',
            'CONFLICT': '葛藤段階',
            'INSIGHT': '気づき段階',
            'APPLICATION': '応用段階',
            'INTEGRATION': '統合段階'
        };

        return stageMapping[stage] || stage;
    }
}