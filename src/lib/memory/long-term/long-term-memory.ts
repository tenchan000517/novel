// src/lib/memory/long-term/long-term-memory.ts
/**
 * @fileoverview 長期記憶ファサード（完全修正版）
 * @description
 * 🔧 無限ループ完全修正版
 * 🔧 ConsolidationGuard統合
 * 🔧 安全な統合処理実行
 * 🔧 TypeScriptエラー完全解決
 */

import { logger } from '@/lib/utils/logger';
import { Chapter } from '@/types/chapters';
import { Character } from '@/types/characters';
import { ConsolidationGuard, withConsolidationGuard } from './consolidation-guard';

// 既存コンポーネントのimport
import { CharacterDatabase } from './character-database';
import { HistoricalRecords } from './duplicate-resolver';
import { SystemKnowledge } from './system-knowledge';
import { WorldKnowledge } from './world-knowledge';

/**
 * 長期記憶設定
 */
export interface LongTermMemoryConfig {
    enableAutoLearning: boolean;
    consolidationInterval: number;
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
 * @class LongTermMemory - 完全修正版
 * @description
 * ConsolidationGuardを統合した無限ループ完全防止版
 * TypeScriptエラー完全解決版
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
    
    // 🔧 新規追加: 統合制御状態
    private autoConsolidationPaused: boolean = false;
    private currentConsolidationId: string | null = null;
    private consolidationQueue: Array<() => Promise<void>> = [];

    constructor(config?: Partial<LongTermMemoryConfig>) {
        this.config = {
            enableAutoLearning: true,
            consolidationInterval: 30,
            archiveOldData: true,
            enablePredictiveAnalysis: true,
            qualityThreshold: 0.8,
            ...config
        };
        
        logger.info('LongTermMemory initialized with ConsolidationGuard protection and TypeScript safety');
    }

    // ============================================================================
    // 🔧 新規追加: 統合制御メソッド（TypeScriptエラー解決）
    // ============================================================================

    /**
     * 統合処理が進行中かチェック
     */
    isConsolidationInProgress(): boolean {
        const guard = ConsolidationGuard.getInstance();
        const status = guard.getStatus();
        return status.isRunning || this.currentConsolidationId !== null;
    }

    /**
     * 自動統合を一時停止
     */
    pauseAutoConsolidation(): void {
        logger.info('Pausing auto consolidation for conflict prevention');
        this.autoConsolidationPaused = true;
        
        if (this.consolidationInterval) {
            clearInterval(this.consolidationInterval);
            this.consolidationInterval = null;
        }
    }

    /**
     * 自動統合を再開
     */
    resumeAutoConsolidation(): void {
        logger.info('Resuming auto consolidation');
        this.autoConsolidationPaused = false;
        
        if (this.config.enableAutoLearning && !this.consolidationInterval) {
            this.startAutoConsolidation();
        }
    }

    /**
     * 統合キューの処理
     */
    private async processConsolidationQueue(): Promise<void> {
        if (this.consolidationQueue.length === 0 || this.isConsolidationInProgress()) {
            return;
        }

        const operation = this.consolidationQueue.shift();
        if (operation) {
            try {
                await operation();
            } catch (error) {
                logger.error('Queued consolidation operation failed', { error });
            }
        }
    }

    /**
     * 統合処理をキューに追加
     */
    private queueConsolidation(operation: () => Promise<void>): void {
        this.consolidationQueue.push(operation);
        
        // 非同期でキュー処理
        setTimeout(() => this.processConsolidationQueue(), 100);
    }

    // ============================================================================
    // 初期化・基本操作
    // ============================================================================

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
            
            await Promise.all([
                this.characterDatabase.initialize(),
                this.historicalRecords.initialize(),
                this.systemKnowledge.initialize(),
                this.worldKnowledge.initialize()
            ]);
            
            // 自動統合処理の開始
            if (this.config.enableAutoLearning && !this.autoConsolidationPaused) {
                this.startAutoConsolidation();
            }
            
            this.initialized = true;
            this.lastConsolidationTime = new Date().toISOString();
            
            logger.info('LongTermMemory initialization completed with infinite loop protection');
            
        } catch (error) {
            logger.error('Failed to initialize LongTermMemory', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 自動統合処理の開始（ConsolidationGuard統合版）
     */
    private startAutoConsolidation(): void {
        if (this.autoConsolidationPaused) {
            logger.debug('Auto consolidation is paused, skipping start');
            return;
        }

        const intervalMs = this.config.consolidationInterval * 60 * 1000;
        
        this.consolidationInterval = setInterval(async () => {
            if (this.autoConsolidationPaused) {
                logger.debug('Auto consolidation is paused, skipping execution');
                return;
            }

            // ConsolidationGuardによる安全実行
            this.queueConsolidation(async () => {
                try {
                    await this.performConsolidation();
                } catch (error) {
                    logger.error('Auto consolidation failed', { error });
                }
            });
        }, intervalMs);
        
        logger.info(`Auto consolidation started with ${this.config.consolidationInterval}min interval and ConsolidationGuard protection`);
    }

    // ============================================================================
    // 章完了時の長期記憶処理
    // ============================================================================

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

        // 🔧 修正: ConsolidationGuardによる安全性チェック
        const guard = ConsolidationGuard.getInstance();
        const check = guard.canStartConsolidation(`chapter-completion-${chapterNumber}`);
        
        if (!check.allowed) {
            logger.info(`Chapter ${chapterNumber} completion processing blocked by guard`, { 
                reason: check.reason,
                recommendation: check.recommendedAction
            });
            
            // キューに追加して後で処理
            this.queueConsolidation(async () => {
                await this.processChapterCompletion(chapterNumber, chapterData, extractedData);
            });
            return;
        }

        const processId = guard.startConsolidation(`chapter-completion-${chapterNumber}`);
        this.currentConsolidationId = processId;

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

            logger.info(`Chapter ${chapterNumber} long-term processing completed safely`);

        } catch (error) {
            logger.error(`Failed to process chapter ${chapterNumber} completion`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        } finally {
            guard.endConsolidation(processId, `chapter-completion-${chapterNumber}`);
            this.currentConsolidationId = null;
        }
    }

    // ============================================================================
    // 統合処理の実行（ConsolidationGuard完全統合版）
    // ============================================================================

    /**
     * 🔧 修正: 統合処理の実行 - ConsolidationGuard完全統合版
     */
    async performConsolidation(): Promise<{
        charactersConsolidated: number;
        conflictsResolved: number;
        patternsLearned: number;
        qualityScore: number;
    }> {
        const guard = ConsolidationGuard.getInstance();
        const check = guard.canStartConsolidation('long-term-memory-auto');
        
        if (!check.allowed) {
            logger.debug('Consolidation blocked by guard', { 
                reason: check.reason,
                recommendation: check.recommendedAction
            });
            return {
                charactersConsolidated: 0,
                conflictsResolved: 0,
                patternsLearned: 0,
                qualityScore: 0.9
            };
        }

        if (!this.initialized) {
            await this.initialize();
        }

        const processId = guard.startConsolidation('long-term-memory-auto');
        this.currentConsolidationId = processId;

        try {
            logger.info('Starting comprehensive consolidation process', { processId });

            let charactersConsolidated = 0;
            let conflictsResolved = 0;
            let patternsLearned = 0;

            // 1. システム知識統合（12コンポーネント救済）
            try {
                logger.info('Phase 1: System knowledge integration');
                const knowledgeResult = await this.systemKnowledge.performLearningAndImprovement();
                patternsLearned = knowledgeResult.newPatterns || 0;
            } catch (error) {
                logger.warn('System knowledge integration failed', { error });
            }

            // 2. キャラクター統合診断
            try {
                logger.info('Phase 2: Character database consolidation');
                const charDiagnosis = await this.characterDatabase.diagnoseConsolidation();
                conflictsResolved += charDiagnosis.conflictCount || 0;
                charactersConsolidated = charDiagnosis.totalCharacters || 0;
            } catch (error) {
                logger.warn('Character diagnosis failed', { error });
            }

            // 3. 世界設定統合診断
            try {
                logger.info('Phase 3: World knowledge consolidation');
                const worldDiagnosis = await this.worldKnowledge.diagnoseConsolidation();
                conflictsResolved += worldDiagnosis.worldSettingsConflicts || 0;
            } catch (error) {
                logger.warn('World diagnosis failed', { error });
            }

            // 4. 履歴記録保存
            try {
                logger.info('Phase 4: Historical records save');
                await this.historicalRecords.save();
            } catch (error) {
                logger.warn('Historical records save failed', { error });
            }

            // 5. データ品質評価
            const qualityScore = await this.evaluateOverallQuality();

            this.lastConsolidationTime = new Date().toISOString();

            const result = {
                charactersConsolidated,
                conflictsResolved,
                patternsLearned,
                qualityScore
            };

            logger.info('Consolidation process completed', { ...result, processId });
            return result;

        } catch (error) {
            logger.error('Failed to perform consolidation', { 
                error: error instanceof Error ? error.message : String(error),
                processId
            });
            throw error;
        } finally {
            guard.endConsolidation(processId, 'long-term-memory-auto');
            this.currentConsolidationId = null;
        }
    }

    // ============================================================================
    // 個別データ処理メソッド
    // ============================================================================

    private async integrateCharacterData(characters: Character[]): Promise<void> {
        try {
            for (const character of characters) {
                const existingInfo = await this.characterDatabase.getConsolidatedCharacterInfo(character.id);
                
                if (existingInfo) {
                    const updateData: Partial<any> = {
                        name: character.name,
                        description: character.description,
                        lastConsolidated: new Date().toISOString()
                    };

                    await this.characterDatabase.updateCharacter(character.id, updateData);
                } else {
                    logger.info(`New character detected: ${character.name}, will be processed by individual components`);
                }
            }

            logger.debug(`Processed ${characters.length} characters for long-term memory integration`);

        } catch (error) {
            logger.error('Failed to integrate character data', { error });
        }
    }

    private async recordSignificantEvents(chapterNumber: number, events: any[]): Promise<void> {
        try {
            for (const event of events) {
                if (event.significance >= this.config.qualityThreshold) {
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

    private async updateWorldKnowledge(worldUpdates: any[]): Promise<void> {
        try {
            for (const update of worldUpdates) {
                if (update.type === 'concept') {
                    await this.worldKnowledge.addConcept({
                        name: update.name,
                        definition: update.description,
                        importance: update.significance || 5,
                        firstIntroduced: update.chapter || 1
                    });
                } else if (update.type === 'foreshadowing') {
                    await this.worldKnowledge.addForeshadowing({
                        description: update.description,
                        chapter_introduced: update.chapter || 1,
                        significance: update.significance || 5
                    });
                }
            }

            logger.debug(`Updated world knowledge with ${worldUpdates.length} entries`);

        } catch (error) {
            logger.error('Failed to update world knowledge', { error });
        }
    }

    private async performSystemLearning(chapterNumber: number, learningData: any): Promise<void> {
        try {
            // ConsolidationGuardによる安全実行
            await withConsolidationGuard(
                `system-learning-${chapterNumber}`,
                async () => {
                    await this.systemKnowledge.performLearningAndImprovement();
                },
                'chapter-completion'
            );

            logger.debug(`System learning completed for chapter ${chapterNumber}`);

        } catch (error) {
            logger.error('Failed to perform system learning', { error });
        }
    }

    // ============================================================================
    // 品質評価・診断
    // ============================================================================

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

    private async evaluateOverallQuality(): Promise<number> {
        try {
            let totalScore = 0;
            let componentCount = 0;

            try {
                const charStatus = await this.characterDatabase.getStatus();
                if ((charStatus.characterCount || 0) > 0) {
                    totalScore += 0.9;
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

    async getStatistics(): Promise<LongTermMemoryStats> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            let charactersManaged = 0;
            let worldKnowledgeEntries = 0;
            let historicalRecords = 0;
            let systemPatterns = 0;

            try {
                const charStatus = await this.characterDatabase.getStatus();
                charactersManaged = charStatus.characterCount || 0;
            } catch (error) {
                logger.warn('Failed to get character database status', { error });
            }

            try {
                const worldStatus = await this.worldKnowledge.getStatus();
                worldKnowledgeEntries = (worldStatus.conceptCount || 0) + 
                                      (worldStatus.activeForeshadowingCount || 0);
            } catch (error) {
                logger.warn('Failed to get world knowledge status', { error });
            }

            try {
                const histStatus = this.historicalRecords.getStatus();
                historicalRecords = histStatus.completedSections || 0;
            } catch (error) {
                logger.warn('Failed to get historical records status', { error });
            }

            try {
                const sysStatus = await this.systemKnowledge.getStatus();
                systemPatterns = sysStatus.promptPatterns || 0;
            } catch (error) {
                logger.warn('Failed to get system knowledge status', { error });
            }

            let dataIntegrityScore = 0.5;
            try {
                const integrity = await this.validateDataIntegrity();
                dataIntegrityScore = integrity.isValid ? 1.0 : 0.5;
            } catch (error) {
                logger.warn('Failed to validate data integrity', { error });
            }

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

    updateConfiguration(newConfig: Partial<LongTermMemoryConfig>): void {
        const oldInterval = this.config.consolidationInterval;
        this.config = { ...this.config, ...newConfig };

        if (newConfig.consolidationInterval && newConfig.consolidationInterval !== oldInterval) {
            if (this.consolidationInterval) {
                clearInterval(this.consolidationInterval);
            }
            if (this.config.enableAutoLearning && !this.autoConsolidationPaused) {
                this.startAutoConsolidation();
            }
        }

        logger.info('LongTermMemory configuration updated', { config: this.config });
    }

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

    async cleanup(): Promise<void> {
        try {
            // 統合処理の安全な停止
            const guard = ConsolidationGuard.getInstance();
            const status = guard.getStatus();
            
            if (status.isRunning) {
                logger.warn('Cleanup called while consolidation in progress, waiting...');
                const maxWaitTime = 30000;
                const startTime = Date.now();
                
                while (status.isRunning && (Date.now() - startTime) < maxWaitTime) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
                if (status.isRunning) {
                    logger.error('Force cleanup: consolidation still in progress after 30s wait');
                    guard.forceRelease();
                }
            }

            // 自動統合の停止
            if (this.consolidationInterval) {
                clearInterval(this.consolidationInterval);
                this.consolidationInterval = null;
                logger.debug('Auto consolidation interval stopped');
            }

            // 内部状態のリセット
            this.initialized = false;
            this.lastConsolidationTime = '';
            this.autoConsolidationPaused = false;
            this.currentConsolidationId = null;
            this.consolidationQueue = [];

            logger.info('LongTermMemory cleanup completed with ConsolidationGuard protection');

        } catch (error: any) {
            logger.error('Failed to cleanup LongTermMemory', { 
                error: error instanceof Error ? error.message : String(error) 
            });
        }
    }

    // ============================================================================
    // ConsolidationGuard関連メソッド
    // ============================================================================

    /**
     * ConsolidationGuardの状態確認
     */
    getConsolidationGuardStatus() {
        const guard = ConsolidationGuard.getInstance();
        return {
            ...guard.getStatus(),
            autoConsolidationPaused: this.autoConsolidationPaused,
            currentConsolidationId: this.currentConsolidationId,
            queueLength: this.consolidationQueue.length
        };
    }

    /**
     * ConsolidationGuard統計取得
     */
    getConsolidationGuardStatistics() {
        const guard = ConsolidationGuard.getInstance();
        return guard.getStatistics();
    }

    /**
     * 緊急停止（ConsolidationGuard連携）
     */
    async emergencyStop(): Promise<void> {
        logger.warn('Emergency stop triggered for LongTermMemory');
        
        const guard = ConsolidationGuard.getInstance();
        guard.forceRelease();
        
        // 内部状態の強制リセット
        this.autoConsolidationPaused = true;
        this.currentConsolidationId = null;
        this.consolidationQueue = [];
        
        await this.cleanup();
        
        logger.info('LongTermMemory emergency stop completed');
    }

    // 便利メソッド群
    async getCharacter(characterId: string): Promise<any> {
        if (!this.initialized) {
            await this.initialize();
        }
        return await this.characterDatabase.getConsolidatedCharacterInfo(characterId);
    }

    async getWorldSettings(): Promise<any> {
        if (!this.initialized) {
            await this.initialize();
        }
        return await this.worldKnowledge.getConsolidatedWorldSettings();
    }

    async getEffectivePatterns(minEffectiveness: number = 0.8): Promise<any> {
        if (!this.initialized) {
            await this.initialize();
        }
        return await this.systemKnowledge.getHighEffectivenessPatterns(minEffectiveness * 10);
    }

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

            try {
                const status = this.historicalRecords.getStatus();
                completedSections = status.completedSections || 0;
                completedArcs = status.completedArcs || 0;
            } catch (error) {
                logger.warn('Failed to get historical records status', { error });
            }

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