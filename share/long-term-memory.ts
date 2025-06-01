// src/lib/memory copy/long-term/long-term-memory.ts
/**
 * @fileoverview 長期記憶ファサード（本来機能重視版）
 * @description
 * 🔧 既存コンポーネントの本来機能を活かした長期記憶実装
 * 🔧 永続化データ管理・統合・学習に特化
 * 🔧 CharacterDatabase、HistoricalRecords、SystemKnowledge、WorldKnowledgeの適切な統合
 */

import { logger } from '@/lib/utils/logger';
import { Chapter } from '@/types/chapters';
import { Character } from '@/types/characters';

// 既存コンポーネントのimport（実際のAPIを使用）
import { CharacterDatabase } from './character-database';
import { HistoricalRecords } from './duplicate-resolver'; // HistoricalRecordsとして実装済み
import { SystemKnowledge } from './system-knowledge';
import { WorldKnowledge } from './world-knowledge';

/**
 * 長期記憶設定
 */
export interface LongTermMemoryConfig {
    enableAutoLearning: boolean;
    consolidationInterval: number; // 統合処理の間隔（分）
    archiveOldData: boolean;
    enablePredictiveAnalysis: boolean;
    qualityThreshold: number;
}

/**
 * 長期記憶統計
 */
export interface LongTermMemoryStats {
    charactersManaged: number;
    worldKnowledgeEntries: number;
    historicalRecords: number;
    systemPatterns: number;
    lastConsolidation: string;
    dataIntegrityScore: number;
    learningEffectiveness: number;
}

/**
 * @class LongTermMemory
 * @description
 * 長期記憶の本来機能に特化したファサードクラス
 * 既存コンポーネントの実際のAPIを活用した設計
 */
export class LongTermMemory {
    private config: LongTermMemoryConfig;
    private initialized: boolean = false;
    
    // 統合コンポーネント
    private characterDatabase!: CharacterDatabase;
    private historicalRecords!: HistoricalRecords;
    private systemKnowledge!: SystemKnowledge;
    private worldKnowledge!: WorldKnowledge;

    // 内部状態
    private lastConsolidationTime: string = '';
    private consolidationInterval: NodeJS.Timeout | null = null;

    constructor(config?: Partial<LongTermMemoryConfig>) {
        this.config = {
            enableAutoLearning: true,
            consolidationInterval: 30, // 30分
            archiveOldData: true,
            enablePredictiveAnalysis: true,
            qualityThreshold: 0.8,
            ...config
        };
        
        logger.info('LongTermMemory initialized with proper component integration');
    }

    // ============================================================================
    // 初期化・基本操作
    // ============================================================================

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('LongTermMemory already initialized');
            return;
        }
        
        try {
            // コンポーネント初期化
            this.characterDatabase = new CharacterDatabase();
            this.historicalRecords = new HistoricalRecords();
            this.systemKnowledge = new SystemKnowledge();
            this.worldKnowledge = new WorldKnowledge();
            
            // 各コンポーネントの初期化
            await Promise.all([
                this.characterDatabase.initialize(),
                this.historicalRecords.initialize(),
                this.systemKnowledge.initialize(),
                this.worldKnowledge.initialize()
            ]);
            
            // 自動統合処理の開始
            if (this.config.enableAutoLearning) {
                this.startAutoConsolidation();
            }
            
            this.initialized = true;
            this.lastConsolidationTime = new Date().toISOString();
            
            logger.info('LongTermMemory initialization completed successfully');
            
        } catch (error) {
            logger.error('Failed to initialize LongTermMemory', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 自動統合処理の開始
     */
    private startAutoConsolidation(): void {
        const intervalMs = this.config.consolidationInterval * 60 * 1000;
        
        this.consolidationInterval = setInterval(async () => {
            try {
                await this.performConsolidation();
            } catch (error) {
                logger.error('Auto consolidation failed', { error });
            }
        }, intervalMs);
        
        logger.info(`Auto consolidation started with ${this.config.consolidationInterval}min interval`);
    }

    // ============================================================================
    // 長期記憶の本来機能：データ管理・統合
    // ============================================================================

    /**
     * 章完了時の長期記憶処理
     * （短期・中期記憶からのデータ抽出・永続化）
     */
    async processChapterCompletion(
        chapterNumber: number,
        chapterData: Chapter,
        extractedData: {
            characters: Character[];
            keyEvents: any[];
            worldUpdates: any[];
            learningData: any;
        }
    ): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            logger.info(`Processing chapter ${chapterNumber} completion for long-term storage`);

            // 1. キャラクター情報の統合
            await this.integrateCharacterData(extractedData.characters);

            // 2. 重要イベントの記録
            await this.recordSignificantEvents(chapterNumber, extractedData.keyEvents);

            // 3. 世界設定の更新
            await this.updateWorldKnowledge(extractedData.worldUpdates);

            // 4. システム学習の実行
            if (extractedData.learningData) {
                await this.performSystemLearning(chapterNumber, extractedData.learningData);
            }

            // 5. データ品質チェック
            await this.validateDataIntegrity();

            logger.info(`Chapter ${chapterNumber} long-term processing completed`);

        } catch (error) {
            logger.error(`Failed to process chapter ${chapterNumber} completion`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * キャラクター情報の統合
     */
    private async integrateCharacterData(characters: Character[]): Promise<void> {
        try {
            for (const character of characters) {
                // 既存の統合キャラクター情報を取得
                const existingInfo = await this.characterDatabase.getConsolidatedCharacterInfo(character.id);
                
                if (existingInfo) {
                    // 型安全な更新データの作成
                    const updateData: Partial<any> = {
                        name: character.name,
                        description: character.description,
                        // CharacterPersonality形式に変換
                        personality: {
                            traits: character.personality?.traits || [],
                            coreValues: [], // デフォルト値
                            motivations: [],
                            fears: [],
                            habits: [],
                            speechPatterns: [],
                            emotionalRange: {
                                dominant: 'neutral',
                                secondary: [],
                                triggers: {},
                                expressions: {}
                            },
                            socialBehavior: {
                                leadership: 5,
                                cooperation: 5,
                                empathy: 5,
                                assertiveness: 5,
                                socialEnergy: 5
                            }
                        },
                        lastConsolidated: new Date().toISOString()
                    };

                    // 既存データとのマージ・更新
                    await this.characterDatabase.updateCharacter(character.id, updateData);
                } else {
                    // 新規キャラクターの場合は情報をログ出力のみ
                    // 実際の追加処理は各コンポーネントが個別に処理
                    logger.info(`New character detected: ${character.name}, will be processed by individual components`);
                }
            }

            logger.debug(`Processed ${characters.length} characters for long-term memory integration`);

        } catch (error) {
            logger.error('Failed to integrate character data', { error });
        }
    }

    /**
     * 重要イベントの記録
     */
    private async recordSignificantEvents(chapterNumber: number, events: any[]): Promise<void> {
        try {
            for (const event of events) {
                if (event.significance >= this.config.qualityThreshold) {
                    // HistoricalRecordsに重要イベントを記録
                    await this.historicalRecords.recordCompletedSection({
                        id: `event-${chapterNumber}-${Date.now()}`,
                        name: event.title || `Chapter ${chapterNumber} Event`,
                        startChapter: chapterNumber,
                        endChapter: chapterNumber,
                        type: 'CUSTOM',
                        completedAt: new Date().toISOString(),
                        summary: event.description,
                        involvedCharacters: event.characters || [],
                        keyEvents: [{
                            chapter: chapterNumber,
                            description: event.description,
                            significance: event.significance
                        }],
                        achievedGoals: [],
                        qualityMetrics: {
                            consistency: event.significance,
                            engagement: event.significance,
                            pacing: 1.0,
                            characterDevelopment: 1.0,
                            plotProgression: event.significance
                        },
                        generationStats: {
                            totalGenerationTime: 0,
                            revisionCount: 0,
                            promptOptimizationCount: 0,
                            aiRequestCount: 0
                        },
                        learningData: {
                            effectivePrompts: [],
                            successfulPatterns: [event.pattern || 'default'],
                            challenges: [],
                            solutions: []
                        }
                    });
                }
            }

            logger.debug(`Recorded ${events.length} significant events for chapter ${chapterNumber}`);

        } catch (error) {
            logger.error('Failed to record significant events', { error });
        }
    }

    /**
     * 世界設定の更新
     */
    private async updateWorldKnowledge(worldUpdates: any[]): Promise<void> {
        try {
            for (const update of worldUpdates) {
                if (update.type === 'concept') {
                    // 概念の追加・更新
                    await this.worldKnowledge.addConcept({
                        name: update.name,
                        definition: update.description,
                        importance: update.significance || 5,
                        firstIntroduced: update.chapter || 1
                    });
                } else if (update.type === 'foreshadowing') {
                    // 伏線の追加
                    await this.worldKnowledge.addForeshadowing({
                        description: update.description,
                        chapter_introduced: update.chapter || 1,
                        significance: update.significance || 5
                    });
                } else if (update.type === 'worldSetting') {
                    // 世界設定の更新（統合処理を通じて）
                    logger.debug(`World setting update: ${update.description}`);
                }
            }

            logger.debug(`Updated world knowledge with ${worldUpdates.length} entries`);

        } catch (error) {
            logger.error('Failed to update world knowledge', { error });
        }
    }

    /**
     * システム学習の実行
     */
    private async performSystemLearning(chapterNumber: number, learningData: any): Promise<void> {
        try {
            // SystemKnowledgeの学習・改善機能を活用
            await this.systemKnowledge.performLearningAndImprovement();

            // 効果的なパターンの記録
            if (learningData.effectivePatterns) {
                for (const pattern of learningData.effectivePatterns) {
                    await this.systemKnowledge.addPromptGenerationPattern({
                        patternId: `pattern-${chapterNumber}-${Date.now()}`,
                        patternName: pattern.name,
                        category: 'context',
                        description: pattern.description,
                        pattern: pattern.template,
                        variables: [],
                        conditions: [],
                        effectiveness: {
                            qualityScore: pattern.effectiveness || 7,
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
                            totalUsage: 1,
                            successfulUsage: 1,
                            failedUsage: 0,
                            averageQuality: pattern.effectiveness || 7,
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
                        tags: ['chapter-completion', `chapter-${chapterNumber}`]
                    });
                }
            }

            logger.debug(`System learning completed for chapter ${chapterNumber}`);

        } catch (error) {
            logger.error('Failed to perform system learning', { error });
        }
    }

    // ============================================================================
    // 統合・検索・分析機能
    // ============================================================================

    /**
     * 統合統合処理の実行
     */
    async performConsolidation(): Promise<{
        charactersConsolidated: number;
        conflictsResolved: number;
        patternsLearned: number;
        qualityScore: number;
    }> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            logger.info('Starting comprehensive consolidation process');

            let charactersConsolidated = 0;
            let conflictsResolved = 0;
            let patternsLearned = 0;

            // 1. キャラクター統合診断
            try {
                const charDiagnosis = await this.characterDatabase.diagnoseConsolidation();
                // 実際のAPIに合わせて適切なプロパティを使用
                conflictsResolved += charDiagnosis.conflictCount || 0;
                charactersConsolidated = charDiagnosis.totalCharacters || 0;
            } catch (error) {
                logger.warn('Character diagnosis failed', { error });
            }

            // 2. 世界設定統合診断
            try {
                const worldDiagnosis = await this.worldKnowledge.diagnoseConsolidation();
                // 実際のAPIに合わせて適切なプロパティを使用
                conflictsResolved += worldDiagnosis.worldSettingsConflicts || 0;
            } catch (error) {
                logger.warn('World diagnosis failed', { error });
            }

            // 3. システム学習・改善
            try {
                const learningResult = await this.systemKnowledge.performLearningAndImprovement();
                patternsLearned = learningResult.newPatterns || 0;
            } catch (error) {
                logger.warn('System learning failed', { error });
            }

            // 4. データ品質評価
            const qualityScore = await this.evaluateOverallQuality();

            this.lastConsolidationTime = new Date().toISOString();

            const result = {
                charactersConsolidated,
                conflictsResolved,
                patternsLearned,
                qualityScore
            };

            logger.info('Consolidation process completed', result);
            return result;

        } catch (error) {
            logger.error('Failed to perform consolidation', { error });
            throw error;
        }
    }

    /**
     * 統合検索機能
     */
    async search(query: string, options?: {
        includeCharacters?: boolean;
        includeHistory?: boolean;
        includeKnowledge?: boolean;
        includeWorld?: boolean;
        limit?: number;
    }): Promise<{
        characters: any[];
        historical: any[];
        knowledge: any[];
        world: any[];
        totalResults: number;
    }> {
        if (!this.initialized) {
            await this.initialize();
        }

        const opts = {
            includeCharacters: true,
            includeHistory: true,
            includeKnowledge: true,
            includeWorld: true,
            limit: 20,
            ...options
        };

        try {
            const results = {
                characters: [] as any[],
                historical: [] as any[],
                knowledge: [] as any[],
                world: [] as any[],
                totalResults: 0
            };

            // キャラクター検索
            if (opts.includeCharacters) {
                try {
                    const allCharacters = await this.characterDatabase.getAllCharacters();
                    results.characters = allCharacters
                        .filter(char => 
                            char.name.toLowerCase().includes(query.toLowerCase()) ||
                            char.description.toLowerCase().includes(query.toLowerCase())
                        )
                        .slice(0, opts.limit);
                } catch (error) {
                    logger.warn('Character search failed', { error });
                }
            }

            // 履歴検索
            if (opts.includeHistory) {
                try {
                    const sections = this.historicalRecords.getCompletedSections();
                    results.historical = sections
                        .filter(section =>
                            section.name.toLowerCase().includes(query.toLowerCase()) ||
                            section.summary.toLowerCase().includes(query.toLowerCase())
                        )
                        .slice(0, opts.limit);
                } catch (error) {
                    logger.warn('Historical search failed', { error });
                }
            }

            // システム知識検索
            if (opts.includeKnowledge) {
                try {
                    const patterns = await this.systemKnowledge.getPatternsByCategory('prompt');
                    results.knowledge = patterns
                        .filter((pattern: any) =>
                            pattern.patternName.toLowerCase().includes(query.toLowerCase()) ||
                            pattern.description.toLowerCase().includes(query.toLowerCase())
                        )
                        .slice(0, opts.limit);
                } catch (error) {
                    logger.warn('Knowledge search failed', { error });
                }
            }

            // 世界知識検索
            if (opts.includeWorld) {
                try {
                    const worldSettings = await this.worldKnowledge.getConsolidatedWorldSettings();
                    const concepts = await this.worldKnowledge.getUnifiedMemoryAccess({
                        type: 'search',
                        parameters: { term: query }
                    });

                    if (worldSettings.description.toLowerCase().includes(query.toLowerCase())) {
                        results.world.push({
                            type: 'worldSettings',
                            data: worldSettings
                        });
                    }

                    if (concepts.data && Array.isArray(concepts.data)) {
                        results.world.push(...concepts.data.slice(0, opts.limit).map((concept: any) => ({
                            type: 'concept',
                            data: concept
                        })));
                    }
                } catch (error) {
                    logger.warn('World search failed', { error });
                }
            }

            results.totalResults = results.characters.length + 
                                 results.historical.length + 
                                 results.knowledge.length + 
                                 results.world.length;

            logger.debug(`Search completed: ${results.totalResults} results for "${query}"`);
            return results;

        } catch (error) {
            logger.error('Search failed', { error, query });
            return {
                characters: [],
                historical: [],
                knowledge: [],
                world: [],
                totalResults: 0
            };
        }
    }

    // ============================================================================
    // 品質管理・診断
    // ============================================================================

    /**
     * データ整合性の検証
     */
    async validateDataIntegrity(): Promise<{
        isValid: boolean;
        issues: string[];
        suggestions: string[];
    }> {
        const issues: string[] = [];
        const suggestions: string[] = [];

        try {
            // 1. キャラクターデータベースの整合性
            try {
                const charStatus = await this.characterDatabase.getStatus();
                if ((charStatus.characterCount || 0) === 0) {
                    issues.push('No characters in character database');
                    suggestions.push('Import character data from short/mid-term memory');
                }
            } catch (error) {
                issues.push('Character database status check failed');
                suggestions.push('Check character database connectivity');
            }

            // 2. 世界知識の整合性
            try {
                const worldStatus = await this.worldKnowledge.getStatus();
                if ((worldStatus.conceptCount || 0) === 0) {
                    issues.push('No concepts in world knowledge');
                    suggestions.push('Extract concepts from completed chapters');
                }
            } catch (error) {
                issues.push('World knowledge status check failed');
                suggestions.push('Check world knowledge connectivity');
            }

            // 3. システム知識の効果性
            try {
                const sysStatus = await this.systemKnowledge.getStatus();
                if ((sysStatus.promptPatterns || 0) === 0) {
                    issues.push('No effective patterns learned');
                    suggestions.push('Enable automatic pattern learning');
                }
            } catch (error) {
                issues.push('System knowledge status check failed');
                suggestions.push('Check system knowledge connectivity');
            }

            // 4. 履歴記録の完全性
            try {
                const histStatus = this.historicalRecords.getStatus();
                if ((histStatus.completedSections || 0) === 0) {
                    issues.push('No completed sections recorded');
                    suggestions.push('Record significant chapter completions');
                }
            } catch (error) {
                issues.push('Historical records status check failed');
                suggestions.push('Check historical records connectivity');
            }

            const isValid = issues.length === 0;

            logger.debug(`Data integrity validation: ${isValid ? 'PASSED' : 'FAILED'}`, {
                issues: issues.length,
                suggestions: suggestions.length
            });

            return { isValid, issues, suggestions };

        } catch (error) {
            logger.error('Data integrity validation failed', { error });
            return {
                isValid: false,
                issues: ['Validation process failed'],
                suggestions: ['Check system logs and component status']
            };
        }
    }

    /**
     * 全体品質の評価
     */
    private async evaluateOverallQuality(): Promise<number> {
        try {
            let totalScore = 0;
            let componentCount = 0;

            // 各コンポーネントの品質スコア取得（安全に）
            try {
                const charStatus = await this.characterDatabase.getStatus();
                if ((charStatus.characterCount || 0) > 0) {
                    totalScore += 0.9; // キャラクターデータがある
                    componentCount++;
                }
            } catch (error) {
                logger.debug('Character database quality check failed', { error });
            }

            try {
                const worldStatus = await this.worldKnowledge.getStatus();
                if ((worldStatus.conceptCount || 0) > 0) {
                    totalScore += 0.85;
                    componentCount++;
                }
            } catch (error) {
                logger.debug('World knowledge quality check failed', { error });
            }

            try {
                const sysStatus = await this.systemKnowledge.getStatus();
                if ((sysStatus.promptPatterns || 0) > 0) {
                    totalScore += 0.8;
                    componentCount++;
                }
            } catch (error) {
                logger.debug('System knowledge quality check failed', { error });
            }

            try {
                const histStatus = this.historicalRecords.getStatus();
                if ((histStatus.completedSections || 0) > 0) {
                    totalScore += 0.75;
                    componentCount++;
                }
            } catch (error) {
                logger.debug('Historical records quality check failed', { error });
            }

            return componentCount > 0 ? totalScore / componentCount : 0;

        } catch (error) {
            logger.warn('Failed to evaluate overall quality', { error });
            return 0.5;
        }
    }

    // ============================================================================
    // パブリックAPI
    // ============================================================================

    /**
     * 統計情報の取得
     */
    async getStatistics(): Promise<LongTermMemoryStats> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // 各コンポーネントのステータスを安全に取得
            let charactersManaged = 0;
            let worldKnowledgeEntries = 0;
            let historicalRecords = 0;
            let systemPatterns = 0;

            // CharacterDatabase の統計
            try {
                const charStatus = await this.characterDatabase.getStatus();
                charactersManaged = charStatus.characterCount || 0;
            } catch (error) {
                logger.warn('Failed to get character database status', { error });
            }

            // WorldKnowledge の統計
            try {
                const worldStatus = await this.worldKnowledge.getStatus();
                worldKnowledgeEntries = (worldStatus.conceptCount || 0) + 
                                      (worldStatus.activeForeshadowingCount || 0);
            } catch (error) {
                logger.warn('Failed to get world knowledge status', { error });
            }

            // HistoricalRecords の統計
            try {
                const histStatus = this.historicalRecords.getStatus();
                historicalRecords = histStatus.completedSections || 0;
            } catch (error) {
                logger.warn('Failed to get historical records status', { error });
            }

            // SystemKnowledge の統計
            try {
                const sysStatus = await this.systemKnowledge.getStatus();
                systemPatterns = sysStatus.promptPatterns || 0;
            } catch (error) {
                logger.warn('Failed to get system knowledge status', { error });
            }

            // データ整合性の評価
            let dataIntegrityScore = 0.5;
            try {
                const integrity = await this.validateDataIntegrity();
                dataIntegrityScore = integrity.isValid ? 1.0 : 0.5;
            } catch (error) {
                logger.warn('Failed to validate data integrity', { error });
            }

            // 学習効果性の評価
            let learningEffectiveness = 0.5;
            try {
                learningEffectiveness = await this.evaluateOverallQuality();
            } catch (error) {
                logger.warn('Failed to evaluate overall quality', { error });
            }

            return {
                charactersManaged,
                worldKnowledgeEntries,
                historicalRecords,
                systemPatterns,
                lastConsolidation: this.lastConsolidationTime,
                dataIntegrityScore,
                learningEffectiveness
            };

        } catch (error) {
            logger.error('Failed to get statistics', { error });
            return {
                charactersManaged: 0,
                worldKnowledgeEntries: 0,
                historicalRecords: 0,
                systemPatterns: 0,
                lastConsolidation: '',
                dataIntegrityScore: 0,
                learningEffectiveness: 0
            };
        }
    }

    /**
     * 設定の更新
     */
    updateConfiguration(newConfig: Partial<LongTermMemoryConfig>): void {
        const oldInterval = this.config.consolidationInterval;
        this.config = { ...this.config, ...newConfig };

        // 統合間隔が変更された場合は再起動
        if (newConfig.consolidationInterval && newConfig.consolidationInterval !== oldInterval) {
            if (this.consolidationInterval) {
                clearInterval(this.consolidationInterval);
            }
            if (this.config.enableAutoLearning) {
                this.startAutoConsolidation();
            }
        }

        logger.info('LongTermMemory configuration updated', { config: this.config });
    }

    /**
     * データの保存
     */
    async save(): Promise<void> {
        if (!this.initialized) {
            return;
        }

        try {
            await Promise.all([
                this.characterDatabase.save(),
                this.historicalRecords.save(),
                this.systemKnowledge.save(),
                this.worldKnowledge.save()
            ]);

            logger.info('LongTermMemory data saved successfully');

        } catch (error) {
            logger.error('Failed to save LongTermMemory data', { error });
            throw error;
        }
    }

    /**
     * クリーンアップ
     */
    async cleanup(): Promise<void> {
        try {
            // 自動統合の停止
            if (this.consolidationInterval) {
                clearInterval(this.consolidationInterval);
                this.consolidationInterval = null;
                logger.debug('Auto consolidation interval stopped');
            }

            // 内部状態のリセット
            this.initialized = false;
            this.lastConsolidationTime = '';

            logger.info('LongTermMemory cleanup completed');

        } catch (error: any) {
            logger.error('Failed to cleanup LongTermMemory', { 
                error: error instanceof Error ? error.message : String(error) 
            });
        }
    }

    // ============================================================================
    // 便利メソッド群
    // ============================================================================

    /**
     * キャラクター情報の取得（統合済み）
     */
    async getCharacter(characterId: string): Promise<any> {
        if (!this.initialized) {
            await this.initialize();
        }
        return await this.characterDatabase.getConsolidatedCharacterInfo(characterId);
    }

    /**
     * 世界設定の取得（統合済み）
     */
    async getWorldSettings(): Promise<any> {
        if (!this.initialized) {
            await this.initialize();
        }
        return await this.worldKnowledge.getConsolidatedWorldSettings();
    }

    /**
     * 効果的パターンの取得
     */
    async getEffectivePatterns(minEffectiveness: number = 0.8): Promise<any> {
        if (!this.initialized) {
            await this.initialize();
        }
        return await this.systemKnowledge.getHighEffectivenessPatterns(minEffectiveness * 10);
    }

    /**
     * 履歴サマリーの取得
     */
    async getHistorySummary(): Promise<{
        completedSections: number;
        completedArcs: number;
        learningProgress: string;
    }> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            let completedSections = 0;
            let completedArcs = 0;
            let averageScore = 0.5;

            // HistoricalRecords の統計を安全に取得
            try {
                const status = this.historicalRecords.getStatus();
                completedSections = status.completedSections || 0;
                completedArcs = status.completedArcs || 0;
            } catch (error) {
                logger.warn('Failed to get historical records status', { error });
            }

            // システム効果性統計を安全に取得
            try {
                const effectiveness = this.historicalRecords.getSystemEffectivenessStats();
                averageScore = effectiveness.averageScore || 0.5;
            } catch (error) {
                logger.warn('Failed to get system effectiveness stats', { error });
            }

            return {
                completedSections,
                completedArcs,
                learningProgress: `Average effectiveness: ${(averageScore * 100).toFixed(1)}%`
            };

        } catch (error) {
            logger.error('Failed to get history summary', { error });
            return {
                completedSections: 0,
                completedArcs: 0,
                learningProgress: 'Unknown effectiveness'
            };
        }
    }
}