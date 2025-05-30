/**
 * @fileoverview 統合記憶階層システム - 長期記憶履歴記録管理モジュール
 * @description
 * 完了したセクション・アークの記録管理、長期効果分析、システム学習データの蓄積を行います。
 * 設計書に従い、12コンポーネントのデータ救済と重複処理排除を実現します。
 */

import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { Chapter } from '@/types/chapters';
import { Character } from '@/types/characters';
import { NarrativeState } from './types';

/**
 * 完了したセクションの記録
 */
export interface CompletedSectionRecord {
    /** セクションID */
    id: string;
    /** セクション名 */
    name: string;
    /** 開始章番号 */
    startChapter: number;
    /** 終了章番号 */
    endChapter: number;
    /** セクションタイプ */
    type: 'INTRODUCTION' | 'DEVELOPMENT' | 'CLIMAX' | 'RESOLUTION' | 'CUSTOM';
    /** 完了日時 */
    completedAt: string;
    /** セクションの要約 */
    summary: string;
    /** 関与したキャラクター */
    involvedCharacters: string[];
    /** 重要なイベント */
    keyEvents: {
        chapter: number;
        description: string;
        significance: number;
    }[];
    /** 達成した目標 */
    achievedGoals: string[];
    /** 品質メトリクス */
    qualityMetrics: {
        consistency: number;
        engagement: number;
        pacing: number;
        characterDevelopment: number;
        plotProgression: number;
    };
    /** 生成統計 */
    generationStats: {
        totalGenerationTime: number;
        revisionCount: number;
        promptOptimizationCount: number;
        aiRequestCount: number;
    };
    /** 学習データ */
    learningData: {
        effectivePrompts: string[];
        successfulPatterns: string[];
        challenges: string[];
        solutions: string[];
    };
}

/**
 * 完了したアークの記録
 */
export interface CompletedArcRecord {
    /** アーク番号 */
    arcNumber: number;
    /** アークテーマ */
    theme: string;
    /** 章範囲 */
    chapterRange: {
        start: number;
        end: number;
    };
    /** 完了日時 */
    completedAt: string;
    /** アークの要約 */
    summary: string;
    /** ナラティブ状態の変遷 */
    narrativeProgression: {
        initialState: NarrativeState;
        finalState: NarrativeState;
        keyTransitions: {
            chapter: number;
            fromState: NarrativeState;
            toState: NarrativeState;
            reason: string;
        }[];
    };
    /** キャラクター発展記録 */
    characterDevelopment: {
        characterId: string;
        characterName: string;
        initialState: any;
        finalState: any;
        developmentMilestones: {
            chapter: number;
            milestone: string;
            significance: number;
        }[];
    }[];
    /** 伏線解決記録 */
    foreshadowingResolutions: {
        foreshadowingId: string;
        introducedChapter: number;
        resolvedChapter: number;
        resolution: string;
        effectiveness: number;
    }[];
    /** アーク品質評価 */
    arcQuality: {
        overallScore: number;
        emotionalImpact: number;
        plotCoherence: number;
        characterGrowth: number;
        pacing: number;
        thematicConsistency: number;
    };
    /** 読者体験分析 */
    readerExperience: {
        engagementLevel: number;
        emotionalJourney: {
            chapter: number;
            emotionLevel: number;
            dominantEmotion: string;
        }[];
        satisfactionScore: number;
    };
}

/**
 * 長期効果分析記録
 */
export interface LongTermEffectivenessRecord {
    /** 記録ID */
    id: string;
    /** 分析対象期間 */
    analysisPeriod: {
        startChapter: number;
        endChapter: number;
        startDate: string;
        endDate: string;
    };
    /** システム効果性分析 */
    systemEffectiveness: {
        /** PromptGenerator効果性 */
        promptGeneration: {
            averageQuality: number;
            optimizationSuccess: number;
            templateEffectiveness: number;
            consistencyScore: number;
        };
        /** AI分析効果性 */
        aiAnalysis: {
            emotionalAnalysisAccuracy: number;
            characterDetectionAccuracy: number;
            contextGenerationRelevance: number;
            narrativeAnalysisDepth: number;
        };
        /** 記憶システム効果性 */
        memorySystem: {
            retrievalAccuracy: number;
            contextRelevance: number;
            consistencyMaintenance: number;
            integrationEffectiveness: number;
        };
        /** 全体統合効果性 */
        overallIntegration: {
            componentSynergy: number;
            dataCoherence: number;
            performanceOptimization: number;
            errorReduction: number;
        };
    };
    /** 品質改善トレンド */
    qualityTrends: {
        metric: string;
        values: {
            chapter: number;
            value: number;
            timestamp: string;
        }[];
        trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
        trendStrength: number;
    }[];
    /** 学習された知識 */
    learnedKnowledge: {
        effectivePatterns: string[];
        ineffectivePatterns: string[];
        bestPractices: string[];
        commonPitfalls: string[];
        optimizationOpportunities: string[];
    };
    /** 推奨改善策 */
    recommendations: {
        priority: 'HIGH' | 'MEDIUM' | 'LOW';
        category: string;
        description: string;
        expectedImpact: number;
        implementationComplexity: number;
    }[];
}

/**
 * システム知識パターン
 */
export interface SystemKnowledgePattern {
    /** パターンID */
    id: string;
    /** パターンカテゴリ */
    category: 'PROMPT_GENERATION' | 'AI_ANALYSIS' | 'MEMORY_MANAGEMENT' | 'INTEGRATION' | 'QUALITY_ASSURANCE';
    /** パターン名 */
    name: string;
    /** パターン説明 */
    description: string;
    /** 適用条件 */
    conditions: string[];
    /** 効果性スコア */
    effectiveness: number;
    /** 使用頻度 */
    usageFrequency: number;
    /** 成功事例 */
    successCases: {
        chapter: number;
        context: string;
        outcome: string;
        impact: number;
    }[];
    /** 失敗事例 */
    failureCases: {
        chapter: number;
        context: string;
        issue: string;
        lesson: string;
    }[];
    /** 最終更新日 */
    lastUpdated: string;
}

/**
 * @class HistoricalRecords
 * @description
 * 統合記憶階層システムの長期記憶における履歴記録管理クラス。
 * 完了したセクション・アークの記録、効果性分析、システム学習を担当します。
 */
export class HistoricalRecords {
    private completedSections: Map<string, CompletedSectionRecord> = new Map();
    private completedArcs: Map<number, CompletedArcRecord> = new Map();
    private effectivenessRecords: LongTermEffectivenessRecord[] = [];
    private systemKnowledgePatterns: Map<string, SystemKnowledgePattern> = new Map();
    private initialized: boolean = false;

    /**
     * コンストラクタ
     */
    constructor() {
        logger.info('HistoricalRecords initialized as part of Long-Term Memory');
    }

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('HistoricalRecords already initialized');
            return;
        }

        try {
            await this.loadFromStorage();
            this.initialized = true;
            logger.info('HistoricalRecords initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize HistoricalRecords', {
                error: error instanceof Error ? error.message : String(error)
            });
            // 初期化失敗時も空の状態で続行
            this.initialized = true;
        }
    }

    /**
     * ストレージからデータを読み込む
     * @private
     */
    private async loadFromStorage(): Promise<void> {
        try {
            // 完了セクションの読み込み
            await this.loadCompletedSections();
            
            // 完了アークの読み込み
            await this.loadCompletedArcs();
            
            // 効果性記録の読み込み
            await this.loadEffectivenessRecords();
            
            // システム知識パターンの読み込み
            await this.loadSystemKnowledgePatterns();

            logger.info('HistoricalRecords data loaded successfully');
        } catch (error) {
            logger.error('Failed to load HistoricalRecords from storage', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 完了セクションを読み込む
     * @private
     */
    private async loadCompletedSections(): Promise<void> {
        try {
            const sectionsPath = 'long-term-memory/completed/sections';
            
            // ディレクトリが存在するか確認
            const sectionFiles = await this.listStorageFiles(sectionsPath);
            
            for (const file of sectionFiles) {
                if (file.endsWith('.json')) {
                    const content = await storageProvider.readFile(`${sectionsPath}/${file}`);
                    const section: CompletedSectionRecord = JSON.parse(content);
                    this.completedSections.set(section.id, section);
                }
            }

            logger.debug(`Loaded ${this.completedSections.size} completed sections`);
        } catch (error) {
            logger.warn('Failed to load completed sections', { error });
        }
    }

    /**
     * 完了アークを読み込む
     * @private
     */
    private async loadCompletedArcs(): Promise<void> {
        try {
            const arcsPath = 'long-term-memory/completed/arcs';
            
            const arcFiles = await this.listStorageFiles(arcsPath);
            
            for (const file of arcFiles) {
                if (file.endsWith('.json')) {
                    const content = await storageProvider.readFile(`${arcsPath}/${file}`);
                    const arc: CompletedArcRecord = JSON.parse(content);
                    this.completedArcs.set(arc.arcNumber, arc);
                }
            }

            logger.debug(`Loaded ${this.completedArcs.size} completed arcs`);
        } catch (error) {
            logger.warn('Failed to load completed arcs', { error });
        }
    }

    /**
     * 効果性記録を読み込む
     * @private
     */
    private async loadEffectivenessRecords(): Promise<void> {
        try {
            const effectivenessPath = 'long-term-memory/completed/effectiveness-records.json';
            
            if (await this.storageExists(effectivenessPath)) {
                const content = await storageProvider.readFile(effectivenessPath);
                this.effectivenessRecords = JSON.parse(content);
            }

            logger.debug(`Loaded ${this.effectivenessRecords.length} effectiveness records`);
        } catch (error) {
            logger.warn('Failed to load effectiveness records', { error });
        }
    }

    /**
     * システム知識パターンを読み込む
     * @private
     */
    private async loadSystemKnowledgePatterns(): Promise<void> {
        try {
            const patternsPath = 'long-term-memory/system-knowledge/patterns.json';
            
            if (await this.storageExists(patternsPath)) {
                const content = await storageProvider.readFile(patternsPath);
                const patterns: SystemKnowledgePattern[] = JSON.parse(content);
                
                for (const pattern of patterns) {
                    this.systemKnowledgePatterns.set(pattern.id, pattern);
                }
            }

            logger.debug(`Loaded ${this.systemKnowledgePatterns.size} system knowledge patterns`);
        } catch (error) {
            logger.warn('Failed to load system knowledge patterns', { error });
        }
    }

    /**
     * ストレージファイル一覧を取得
     * @private
     */
    private async listStorageFiles(path: string): Promise<string[]> {
        try {
            return await storageProvider.listFiles(path);
        } catch (error) {
            logger.warn(`Failed to list files in ${path}`, { error });
            return [];
        }
    }

    /**
     * ストレージパスの存在確認
     * @private
     */
    private async storageExists(path: string): Promise<boolean> {
        try {
            return await storageProvider.fileExists(path);
        } catch (error) {
            return false;
        }
    }

    /**
     * 完了セクションを記録
     * @param section 完了セクション記録
     */
    async recordCompletedSection(section: CompletedSectionRecord): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // メモリに保存
            this.completedSections.set(section.id, section);

            // ストレージに永続化
            const sectionPath = `long-term-memory/completed/sections/section-${section.id}.json`;
            await storageProvider.writeFile(sectionPath, JSON.stringify(section, null, 2));

            // システム知識パターンの更新
            await this.updateSystemKnowledgeFromSection(section);

            logger.info(`Recorded completed section: ${section.name} (${section.id})`);
        } catch (error) {
            logger.error('Failed to record completed section', {
                error: error instanceof Error ? error.message : String(error),
                sectionId: section.id
            });
            throw error;
        }
    }

    /**
     * 完了アークを記録
     * @param arc 完了アーク記録
     */
    async recordCompletedArc(arc: CompletedArcRecord): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // メモリに保存
            this.completedArcs.set(arc.arcNumber, arc);

            // ストレージに永続化
            const arcPath = `long-term-memory/completed/arcs/arc-${arc.arcNumber}.json`;
            await storageProvider.writeFile(arcPath, JSON.stringify(arc, null, 2));

            // 長期効果性記録の生成
            await this.generateEffectivenessRecord(arc);

            logger.info(`Recorded completed arc: ${arc.theme} (Arc ${arc.arcNumber})`);
        } catch (error) {
            logger.error('Failed to record completed arc', {
                error: error instanceof Error ? error.message : String(error),
                arcNumber: arc.arcNumber
            });
            throw error;
        }
    }

    /**
     * セクションからシステム知識パターンを更新
     * @private
     */
    private async updateSystemKnowledgeFromSection(section: CompletedSectionRecord): Promise<void> {
        try {
            // 効果的なプロンプトパターンの抽出
            for (const prompt of section.learningData.effectivePrompts) {
                await this.updatePromptPattern(prompt, section);
            }

            // 成功パターンの抽出
            for (const pattern of section.learningData.successfulPatterns) {
                await this.updateSuccessPattern(pattern, section);
            }

            // 課題と解決策の記録
            for (let i = 0; i < section.learningData.challenges.length; i++) {
                const challenge = section.learningData.challenges[i];
                const solution = section.learningData.solutions[i];
                if (solution) {
                    await this.updateProblemSolutionPattern(challenge, solution, section);
                }
            }
        } catch (error) {
            logger.error('Failed to update system knowledge from section', {
                error: error instanceof Error ? error.message : String(error),
                sectionId: section.id
            });
        }
    }

    /**
     * プロンプトパターンを更新
     * @private
     */
    private async updatePromptPattern(prompt: string, section: CompletedSectionRecord): Promise<void> {
        const patternId = `prompt-${this.generatePatternId(prompt)}`;
        
        let pattern = this.systemKnowledgePatterns.get(patternId);
        if (!pattern) {
            pattern = {
                id: patternId,
                category: 'PROMPT_GENERATION',
                name: `効果的プロンプト: ${prompt.substring(0, 50)}...`,
                description: prompt,
                conditions: [`セクションタイプ: ${section.type}`],
                effectiveness: section.qualityMetrics.consistency,
                usageFrequency: 1,
                successCases: [],
                failureCases: [],
                lastUpdated: new Date().toISOString()
            };
        } else {
            pattern.usageFrequency += 1;
            pattern.effectiveness = (pattern.effectiveness + section.qualityMetrics.consistency) / 2;
            pattern.lastUpdated = new Date().toISOString();
        }

        // 成功事例の追加
        pattern.successCases.push({
            chapter: section.endChapter,
            context: `セクション: ${section.name}`,
            outcome: `品質スコア: ${section.qualityMetrics.consistency}`,
            impact: section.qualityMetrics.consistency
        });

        this.systemKnowledgePatterns.set(patternId, pattern);
    }

    /**
     * 成功パターンを更新
     * @private
     */
    private async updateSuccessPattern(patternDesc: string, section: CompletedSectionRecord): Promise<void> {
        const patternId = `success-${this.generatePatternId(patternDesc)}`;
        
        let pattern = this.systemKnowledgePatterns.get(patternId);
        if (!pattern) {
            pattern = {
                id: patternId,
                category: 'QUALITY_ASSURANCE',
                name: `成功パターン: ${patternDesc.substring(0, 50)}...`,
                description: patternDesc,
                conditions: [`セクションタイプ: ${section.type}`],
                effectiveness: section.qualityMetrics.engagement,
                usageFrequency: 1,
                successCases: [],
                failureCases: [],
                lastUpdated: new Date().toISOString()
            };
        } else {
            pattern.usageFrequency += 1;
            pattern.effectiveness = (pattern.effectiveness + section.qualityMetrics.engagement) / 2;
        }

        pattern.successCases.push({
            chapter: section.endChapter,
            context: `セクション: ${section.name}`,
            outcome: patternDesc,
            impact: section.qualityMetrics.engagement
        });

        this.systemKnowledgePatterns.set(patternId, pattern);
    }

    /**
     * 問題解決パターンを更新
     * @private
     */
    private async updateProblemSolutionPattern(
        challenge: string, 
        solution: string, 
        section: CompletedSectionRecord
    ): Promise<void> {
        const patternId = `solution-${this.generatePatternId(challenge + solution)}`;
        
        let pattern = this.systemKnowledgePatterns.get(patternId);
        if (!pattern) {
            pattern = {
                id: patternId,
                category: 'INTEGRATION',
                name: `解決策: ${solution.substring(0, 50)}...`,
                description: `課題: ${challenge}\n解決策: ${solution}`,
                conditions: [`課題タイプ: ${challenge.substring(0, 20)}...`],
                effectiveness: section.qualityMetrics.plotProgression,
                usageFrequency: 1,
                successCases: [],
                failureCases: [],
                lastUpdated: new Date().toISOString()
            };
        } else {
            pattern.usageFrequency += 1;
            pattern.effectiveness = (pattern.effectiveness + section.qualityMetrics.plotProgression) / 2;
        }

        pattern.successCases.push({
            chapter: section.endChapter,
            context: challenge,
            outcome: solution,
            impact: section.qualityMetrics.plotProgression
        });

        this.systemKnowledgePatterns.set(patternId, pattern);
    }

    /**
     * パターンIDを生成
     * @private
     */
    private generatePatternId(text: string): string {
        // 簡易的なハッシュ生成
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit整数に変換
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * 効果性記録を生成
     * @private
     */
    private async generateEffectivenessRecord(arc: CompletedArcRecord): Promise<void> {
        try {
            const record: LongTermEffectivenessRecord = {
                id: `effectiveness-${Date.now()}-${arc.arcNumber}`,
                analysisPeriod: {
                    startChapter: arc.chapterRange.start,
                    endChapter: arc.chapterRange.end,
                    startDate: new Date(Date.now() - (arc.chapterRange.end - arc.chapterRange.start) * 24 * 60 * 60 * 1000).toISOString(),
                    endDate: arc.completedAt
                },
                systemEffectiveness: {
                    promptGeneration: {
                        averageQuality: arc.arcQuality.overallScore,
                        optimizationSuccess: arc.arcQuality.plotCoherence,
                        templateEffectiveness: arc.arcQuality.thematicConsistency,
                        consistencyScore: arc.arcQuality.pacing
                    },
                    aiAnalysis: {
                        emotionalAnalysisAccuracy: arc.readerExperience.engagementLevel,
                        characterDetectionAccuracy: arc.arcQuality.characterGrowth,
                        contextGenerationRelevance: arc.arcQuality.plotCoherence,
                        narrativeAnalysisDepth: arc.arcQuality.emotionalImpact
                    },
                    memorySystem: {
                        retrievalAccuracy: arc.arcQuality.plotCoherence,
                        contextRelevance: arc.arcQuality.thematicConsistency,
                        consistencyMaintenance: arc.arcQuality.pacing,
                        integrationEffectiveness: arc.arcQuality.overallScore
                    },
                    overallIntegration: {
                        componentSynergy: arc.arcQuality.overallScore,
                        dataCoherence: arc.arcQuality.plotCoherence,
                        performanceOptimization: arc.arcQuality.pacing,
                        errorReduction: arc.arcQuality.thematicConsistency
                    }
                },
                qualityTrends: this.analyzeQualityTrends(arc),
                learnedKnowledge: this.extractLearnedKnowledge(arc),
                recommendations: this.generateRecommendations(arc)
            };

            this.effectivenessRecords.push(record);
            await this.saveEffectivenessRecords();

            logger.info(`Generated effectiveness record for arc ${arc.arcNumber}`);
        } catch (error) {
            logger.error('Failed to generate effectiveness record', {
                error: error instanceof Error ? error.message : String(error),
                arcNumber: arc.arcNumber
            });
        }
    }

    /**
     * 品質トレンドを分析
     * @private
     */
    private analyzeQualityTrends(arc: CompletedArcRecord): LongTermEffectivenessRecord['qualityTrends'] {
        const trends: LongTermEffectivenessRecord['qualityTrends'] = [];

        // エモーショナルジャーニーからトレンド分析
        const emotionalTrend = arc.readerExperience.emotionalJourney.map(ej => ({
            chapter: ej.chapter,
            value: ej.emotionLevel,
            timestamp: new Date().toISOString()
        }));

        // トレンド方向の判定
        const firstHalf = emotionalTrend.slice(0, Math.floor(emotionalTrend.length / 2));
        const secondHalf = emotionalTrend.slice(Math.floor(emotionalTrend.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, item) => sum + item.value, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, item) => sum + item.value, 0) / secondHalf.length;
        
        let trend: 'IMPROVING' | 'STABLE' | 'DECLINING' = 'STABLE';
        let trendStrength = 0;

        if (secondAvg > firstAvg + 0.5) {
            trend = 'IMPROVING';
            trendStrength = Math.min((secondAvg - firstAvg) / 5, 1);
        } else if (secondAvg < firstAvg - 0.5) {
            trend = 'DECLINING';
            trendStrength = Math.min((firstAvg - secondAvg) / 5, 1);
        } else {
            trendStrength = 1 - Math.abs(secondAvg - firstAvg) / 5;
        }

        trends.push({
            metric: '感情的エンゲージメント',
            values: emotionalTrend,
            trend,
            trendStrength
        });

        return trends;
    }

    /**
     * 学習された知識を抽出
     * @private
     */
    private extractLearnedKnowledge(arc: CompletedArcRecord): LongTermEffectivenessRecord['learnedKnowledge'] {
        const effectivePatterns: string[] = [];
        const ineffectivePatterns: string[] = [];
        const bestPractices: string[] = [];
        const commonPitfalls: string[] = [];
        const optimizationOpportunities: string[] = [];

        // 伏線解決の効果性から学習
        for (const foreshadowing of arc.foreshadowingResolutions) {
            if (foreshadowing.effectiveness > 0.8) {
                effectivePatterns.push(`伏線「${foreshadowing.resolution}」は${foreshadowing.resolvedChapter - foreshadowing.introducedChapter}章後の解決で高効果`);
                bestPractices.push(`伏線は${foreshadowing.resolvedChapter - foreshadowing.introducedChapter}章程度の間隔で解決すると効果的`);
            } else if (foreshadowing.effectiveness < 0.5) {
                ineffectivePatterns.push(`伏線「${foreshadowing.resolution}」の解決タイミングが不適切`);
                commonPitfalls.push('伏線の解決が急すぎるか遅すぎる');
            }
        }

        // キャラクター発展から学習
        for (const character of arc.characterDevelopment) {
            if (character.developmentMilestones.length > 2) {
                effectivePatterns.push(`キャラクター「${character.characterName}」は段階的な発展で成功`);
                bestPractices.push('キャラクター発展は複数のマイルストーンに分けて描く');
            } else if (character.developmentMilestones.length === 0) {
                ineffectivePatterns.push(`キャラクター「${character.characterName}」の発展が不十分`);
                commonPitfalls.push('キャラクター発展の機会を逃している');
            }
        }

        // 品質スコアから最適化機会を特定
        if (arc.arcQuality.emotionalImpact < 0.7) {
            optimizationOpportunities.push('感情的なインパクトの強化が必要');
        }
        if (arc.arcQuality.pacing < 0.7) {
            optimizationOpportunities.push('ペーシングの調整が必要');
        }
        if (arc.arcQuality.characterGrowth < 0.7) {
            optimizationOpportunities.push('キャラクター成長の描写強化が必要');
        }

        return {
            effectivePatterns,
            ineffectivePatterns,
            bestPractices,
            commonPitfalls,
            optimizationOpportunities
        };
    }

    /**
     * 推奨改善策を生成
     * @private
     */
    private generateRecommendations(arc: CompletedArcRecord): LongTermEffectivenessRecord['recommendations'] {
        const recommendations: LongTermEffectivenessRecord['recommendations'] = [];

        // アーク品質に基づく推奨
        if (arc.arcQuality.emotionalImpact < 0.7) {
            recommendations.push({
                priority: 'HIGH',
                category: '感情設計',
                description: 'EmotionalArcDesignerの分析精度向上と感情描写の強化',
                expectedImpact: 0.8,
                implementationComplexity: 0.6
            });
        }

        if (arc.arcQuality.pacing < 0.7) {
            recommendations.push({
                priority: 'HIGH',
                category: 'ペーシング',
                description: 'DynamicTensionOptimizerのアルゴリズム改善',
                expectedImpact: 0.7,
                implementationComplexity: 0.7
            });
        }

        if (arc.arcQuality.plotCoherence < 0.8) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'プロット整合性',
                description: 'NarrativeAnalysisServiceの一貫性チェック強化',
                expectedImpact: 0.6,
                implementationComplexity: 0.5
            });
        }

        if (arc.arcQuality.characterGrowth < 0.7) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'キャラクター発展',
                description: 'CharacterChangeHandlerの発展パターン分析強化',
                expectedImpact: 0.7,
                implementationComplexity: 0.4
            });
        }

        // 読者体験に基づく推奨
        if (arc.readerExperience.engagementLevel < 0.8) {
            recommendations.push({
                priority: 'HIGH',
                category: '読者エンゲージメント',
                description: 'コンテキスト生成の関連性向上とインタラクション要素の強化',
                expectedImpact: 0.9,
                implementationComplexity: 0.8
            });
        }

        return recommendations;
    }

    /**
     * 効果性記録を保存
     * @private
     */
    private async saveEffectivenessRecords(): Promise<void> {
        try {
            const effectivenessPath = 'long-term-memory/completed/effectiveness-records.json';
            await storageProvider.writeFile(
                effectivenessPath, 
                JSON.stringify(this.effectivenessRecords, null, 2)
            );
        } catch (error) {
            logger.error('Failed to save effectiveness records', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * システム知識パターンを保存
     */
    async saveSystemKnowledgePatterns(): Promise<void> {
        try {
            const patternsPath = 'long-term-memory/system-knowledge/patterns.json';
            const patterns = Array.from(this.systemKnowledgePatterns.values());
            await storageProvider.writeFile(patternsPath, JSON.stringify(patterns, null, 2));
            
            logger.info(`Saved ${patterns.length} system knowledge patterns`);
        } catch (error) {
            logger.error('Failed to save system knowledge patterns', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    // ============================================================================
    // パブリックアクセサーメソッド
    // ============================================================================

    /**
     * 完了セクション一覧を取得
     */
    getCompletedSections(): CompletedSectionRecord[] {
        return Array.from(this.completedSections.values());
    }

    /**
     * 完了アーク一覧を取得
     */
    getCompletedArcs(): CompletedArcRecord[] {
        return Array.from(this.completedArcs.values());
    }

    /**
     * 特定セクションを取得
     */
    getCompletedSection(sectionId: string): CompletedSectionRecord | null {
        return this.completedSections.get(sectionId) || null;
    }

    /**
     * 特定アークを取得
     */
    getCompletedArc(arcNumber: number): CompletedArcRecord | null {
        return this.completedArcs.get(arcNumber) || null;
    }

    /**
     * 効果性記録一覧を取得
     */
    getEffectivenessRecords(): LongTermEffectivenessRecord[] {
        return [...this.effectivenessRecords];
    }

    /**
     * 最新の効果性記録を取得
     */
    getLatestEffectivenessRecord(): LongTermEffectivenessRecord | null {
        if (this.effectivenessRecords.length === 0) return null;
        return this.effectivenessRecords[this.effectivenessRecords.length - 1];
    }

    /**
     * システム知識パターンを取得
     */
    getSystemKnowledgePatterns(category?: SystemKnowledgePattern['category']): SystemKnowledgePattern[] {
        const patterns = Array.from(this.systemKnowledgePatterns.values());
        if (category) {
            return patterns.filter(p => p.category === category);
        }
        return patterns;
    }

    /**
     * 効果的なパターンを取得
     */
    getEffectivePatterns(minEffectiveness: number = 0.7): SystemKnowledgePattern[] {
        return Array.from(this.systemKnowledgePatterns.values())
            .filter(p => p.effectiveness >= minEffectiveness)
            .sort((a, b) => b.effectiveness - a.effectiveness);
    }

    /**
     * 品質トレンド分析を実行
     */
    analyzeOverallQualityTrends(): {
        improving: string[];
        stable: string[];
        declining: string[];
        recommendations: string[];
    } {
        const improving: string[] = [];
        const stable: string[] = [];
        const declining: string[] = [];
        const recommendations: string[] = [];

        for (const record of this.effectivenessRecords) {
            for (const trend of record.qualityTrends) {
                switch (trend.trend) {
                    case 'IMPROVING':
                        improving.push(`${trend.metric}: ${(trend.trendStrength * 100).toFixed(1)}%の改善`);
                        break;
                    case 'STABLE':
                        stable.push(`${trend.metric}: 安定した品質`);
                        break;
                    case 'DECLINING':
                        declining.push(`${trend.metric}: ${(trend.trendStrength * 100).toFixed(1)}%の低下`);
                        break;
                }
            }

            // 推奨事項の統合
            for (const rec of record.recommendations) {
                if (rec.priority === 'HIGH') {
                    recommendations.push(`${rec.category}: ${rec.description}`);
                }
            }
        }

        return { improving, stable, declining, recommendations };
    }

    /**
     * システム効果性の統計を取得
     */
    getSystemEffectivenessStats(): {
        promptGeneration: number;
        aiAnalysis: number;
        memorySystem: number;
        overallIntegration: number;
        averageScore: number;
    } {
        if (this.effectivenessRecords.length === 0) {
            return {
                promptGeneration: 0,
                aiAnalysis: 0,
                memorySystem: 0,
                overallIntegration: 0,
                averageScore: 0
            };
        }

        let promptGen = 0, aiAnalysis = 0, memorySystem = 0, overallInt = 0;

        for (const record of this.effectivenessRecords) {
            const sys = record.systemEffectiveness;
            promptGen += (sys.promptGeneration.averageQuality + sys.promptGeneration.optimizationSuccess) / 2;
            aiAnalysis += (sys.aiAnalysis.emotionalAnalysisAccuracy + sys.aiAnalysis.contextGenerationRelevance) / 2;
            memorySystem += (sys.memorySystem.retrievalAccuracy + sys.memorySystem.integrationEffectiveness) / 2;
            overallInt += (sys.overallIntegration.componentSynergy + sys.overallIntegration.dataCoherence) / 2;
        }

        const count = this.effectivenessRecords.length;
        const stats = {
            promptGeneration: promptGen / count,
            aiAnalysis: aiAnalysis / count,
            memorySystem: memorySystem / count,
            overallIntegration: overallInt / count,
            averageScore: 0
        };

        stats.averageScore = (stats.promptGeneration + stats.aiAnalysis + stats.memorySystem + stats.overallIntegration) / 4;

        return stats;
    }

    /**
     * 状態情報を取得
     */
    getStatus(): {
        initialized: boolean;
        completedSections: number;
        completedArcs: number;
        effectivenessRecords: number;
        knowledgePatterns: number;
        lastAnalysisDate: string | null;
    } {
        return {
            initialized: this.initialized,
            completedSections: this.completedSections.size,
            completedArcs: this.completedArcs.size,
            effectivenessRecords: this.effectivenessRecords.length,
            knowledgePatterns: this.systemKnowledgePatterns.size,
            lastAnalysisDate: this.effectivenessRecords.length > 0 
                ? this.effectivenessRecords[this.effectivenessRecords.length - 1].analysisPeriod.endDate 
                : null
        };
    }

    /**
     * 全データを保存
     */
    async save(): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // システム知識パターンの保存
            await this.saveSystemKnowledgePatterns();
            
            // 効果性記録の保存
            await this.saveEffectivenessRecords();

            logger.info('HistoricalRecords saved successfully');
        } catch (error) {
            logger.error('Failed to save HistoricalRecords', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }
}