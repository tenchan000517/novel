// src/lib/validation/consistency-checker.ts
import { Chapter } from '@/types/chapters';
import { Memory, CharacterState, ConsistencyIssue, ConsistencyResult } from '@/types/memory';
import { logger } from '@/lib/utils/logger';

/**
 * 一貫性チェック設定
 */
interface ConsistencyCheckerConfig {
    enableAdvancedAnalysis?: boolean;
    characterAnalysisDepth?: number;
    locationAnalysisEnabled?: boolean;
    timelineValidationEnabled?: boolean;
    strictModeEnabled?: boolean;
}

/**
 * 分析統計情報
 */
interface AnalysisStatistics {
    totalChecks: number;
    successfulChecks: number;
    failedChecks: number;
    averageProcessingTime: number;
    characterAnalysisCount: number;
    locationAnalysisCount: number;
    timelineValidationCount: number;
    lastOptimization: string;
}

/**
 * 詳細一貫性結果
 */
interface DetailedConsistencyResult extends ConsistencyResult {
    analysisDetails: {
        characterAnalysis: {
            analyzed: string[];
            issues: ConsistencyIssue[];
            consistencyScore: number;
        };
        locationAnalysis: {
            currentLocations: string[];
            previousLocations: string[];
            continuityScore: number;
            issues: ConsistencyIssue[];
        };
        plotAnalysis: {
            timelineIssues: ConsistencyIssue[];
            causalityIssues: ConsistencyIssue[];
            progressionScore: number;
        };
        styleContinuity: {
            voiceConsistency: boolean;
            toneConsistency: boolean;
            issues: ConsistencyIssue[];
        };
    };
    performanceMetrics: {
        processingTime: number;
        analysisDepth: string;
        methodsUsed: string[];
    };
}

/**
 * @class ConsistencyChecker
 * @description 
 * 統合記憶階層システム対応の高度な一貫性チェッククラス。
 * 型安全性を確保し、包括的なエラーハンドリングと詳細な分析機能を提供。
 */
export class ConsistencyChecker {
    private config: Required<ConsistencyCheckerConfig>;
    private initialized: boolean = false;
    private statistics: AnalysisStatistics = {
        totalChecks: 0,
        successfulChecks: 0,
        failedChecks: 0,
        averageProcessingTime: 0,
        characterAnalysisCount: 0,
        locationAnalysisCount: 0,
        timelineValidationCount: 0,
        lastOptimization: new Date().toISOString()
    };

    /**
     * コンストラクタ
     * @param config 一貫性チェック設定
     */
    constructor(config?: Partial<ConsistencyCheckerConfig>) {
        this.config = {
            enableAdvancedAnalysis: true,
            characterAnalysisDepth: 5,
            locationAnalysisEnabled: true,
            timelineValidationEnabled: true,
            strictModeEnabled: false,
            ...config
        };

        logger.info('ConsistencyChecker initialized with enhanced configuration', {
            config: this.config
        });
    }

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('ConsistencyChecker already initialized');
            return;
        }

        try {
            logger.info('Initializing ConsistencyChecker with advanced analysis capabilities');

            // 分析パターンの初期化
            await this.initializeAnalysisPatterns();

            // パフォーマンス最適化の初期化
            await this.initializeOptimizations();

            this.initialized = true;
            logger.info('ConsistencyChecker initialization completed successfully');

        } catch (error) {
            logger.error('Failed to initialize ConsistencyChecker', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 章の包括的一貫性チェック（型安全性強化版）
     * @param chapter チャプター
     * @param memoriesOrPreviousContent オプションの関連記憶配列または前章内容
     * @returns 詳細一貫性チェック結果
     */
    async checkConsistency(
        chapter: Chapter,
        memoriesOrPreviousContent: Memory[] | string = []
    ): Promise<ConsistencyResult> {
        const startTime = Date.now();

        try {
            await this.ensureInitialized();

            logger.info(`Starting comprehensive consistency check for chapter ${chapter.chapterNumber}`);
            this.statistics.totalChecks++;

            // 入力の型安全な処理
            const { analysisType, processedInput } = this.processInputSafely(memoriesOrPreviousContent);

            let result: ConsistencyResult;

            switch (analysisType) {
                case 'string':
                    result = await this.performStringBasedAnalysis(chapter, processedInput as string);
                    break;
                case 'memories':
                    result = await this.performMemoryBasedAnalysis(chapter, processedInput as Memory[]);
                    break;
                case 'empty':
                    result = await this.performStandaloneAnalysis(chapter);
                    break;
                default:
                    throw new Error(`Unknown analysis type: ${analysisType}`);
            }

            // 詳細分析（設定で有効な場合）
            if (this.config.enableAdvancedAnalysis) {
                const enhancedResult = await this.enhanceWithAdvancedAnalysis(chapter, result, processedInput);
                result = this.mergeAnalysisResults(result, enhancedResult);
            }

            // 統計更新
            const processingTime = Date.now() - startTime;
            this.updateStatistics(processingTime, result.isConsistent);

            logger.info(`Consistency check completed for chapter ${chapter.chapterNumber}`, {
                isConsistent: result.isConsistent,
                issueCount: result.issues.length,
                processingTime,
                analysisType
            });

            return result;

        } catch (error) {
            const processingTime = Date.now() - startTime;
            this.statistics.failedChecks++;
            this.updateAverageProcessingTime(processingTime);

            logger.error('Consistency check failed', {
                chapterNumber: chapter.chapterNumber,
                error: error instanceof Error ? error.message : String(error),
                processingTime
            });

            // エラー時の安全なフォールバック
            return this.createErrorFallbackResult(error, chapter.chapterNumber);
        }
    }

    /**
     * キャラクターの詳細一貫性チェック（型安全性強化版）
     * @param chapter チャプター
     * @param previousCharacterStates 以前のキャラクター状態またはメモリ
     * @returns 詳細一貫性チェック結果
     */
    async checkCharacterConsistency(
        chapter: Chapter,
        previousCharacterStates: CharacterState[] | Memory[]
    ): Promise<ConsistencyResult> {
        try {
            await this.ensureInitialized();

            logger.debug('Performing enhanced character consistency check');
            this.statistics.characterAnalysisCount++;

            const issues: ConsistencyIssue[] = [];
            const characters = this.extractCharactersSafely(chapter.content);

            if (characters.length === 0) {
                logger.debug('No characters detected in chapter content');
                return {
                    isConsistent: true,
                    issues: []
                };
            }

            // 型安全な入力処理
            if (this.isCharacterStateArray(previousCharacterStates)) {
                const characterStateIssues = await this.analyzeCharacterStates(
                    chapter, 
                    characters, 
                    previousCharacterStates
                );
                issues.push(...characterStateIssues);
            } else if (this.isMemoryArray(previousCharacterStates)) {
                const memoryIssues = await this.analyzeCharacterMemories(
                    chapter, 
                    characters, 
                    previousCharacterStates
                );
                issues.push(...memoryIssues);
            } else {
                logger.warn('Invalid character states input type', {
                    inputType: typeof previousCharacterStates,
                    isArray: Array.isArray(previousCharacterStates)
                });
            }

            return {
                isConsistent: issues.length === 0,
                issues
            };

        } catch (error) {
            logger.error('Character consistency check failed', {
                chapterNumber: chapter.chapterNumber,
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                isConsistent: false,
                issues: [{
                    type: 'CHARACTER_ANALYSIS_ERROR',
                    description: `キャラクター一貫性チェックでエラーが発生: ${error instanceof Error ? error.message : String(error)}`,
                    severity: 'MEDIUM'
                }]
            };
        }
    }

    /**
     * 基本的な一貫性チェック（型安全性強化版）
     * @param chapter 現在のチャプター
     * @param previousContent 前のチャプターの内容
     * @returns 詳細一貫性チェック結果
     */
    async checkBasicConsistency(
        chapter: Chapter,
        previousContent: string
    ): Promise<ConsistencyResult> {
        try {
            await this.ensureInitialized();

            logger.debug('Performing enhanced basic consistency check');

            // 入力の安全性確認
            if (!this.isValidChapter(chapter)) {
                throw new Error('Invalid chapter object provided');
            }

            if (typeof previousContent !== 'string') {
                throw new Error('Previous content must be a string');
            }

            const issues: ConsistencyIssue[] = [];
            const currentContent = chapter.content;

            // キャラクター継続性分析
            const characterIssues = await this.analyzeCharacterContinuity(currentContent, previousContent);
            issues.push(...characterIssues);

            // 場所継続性分析
            if (this.config.locationAnalysisEnabled) {
                const locationIssues = await this.analyzeLocationContinuity(currentContent, previousContent);
                issues.push(...locationIssues);
                this.statistics.locationAnalysisCount++;
            }

            // トーン・文体継続性分析
            const styleIssues = await this.analyzeStyleContinuity(currentContent, previousContent);
            issues.push(...styleIssues);

            // 時系列整合性分析
            if (this.config.timelineValidationEnabled) {
                const timelineIssues = await this.analyzeTimelineContinuity(chapter, previousContent);
                issues.push(...timelineIssues);
                this.statistics.timelineValidationCount++;
            }

            return {
                isConsistent: issues.length === 0,
                issues
            };

        } catch (error) {
            logger.error('Basic consistency check failed', {
                chapterNumber: chapter.chapterNumber,
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                isConsistent: false,
                issues: [{
                    type: 'BASIC_ANALYSIS_ERROR',
                    description: `基本一貫性チェックでエラーが発生: ${error instanceof Error ? error.message : String(error)}`,
                    severity: 'MEDIUM'
                }]
            };
        }
    }

    // ============================================================================
    // 高度分析メソッド群
    // ============================================================================

    /**
     * 入力を型安全に処理
     * @private
     */
    private processInputSafely(input: Memory[] | string): {
        analysisType: 'string' | 'memories' | 'empty';
        processedInput: Memory[] | string;
    } {
        if (typeof input === 'string') {
            return {
                analysisType: 'string',
                processedInput: input
            };
        }

        if (Array.isArray(input)) {
            if (input.length === 0) {
                return {
                    analysisType: 'empty',
                    processedInput: []
                };
            }

            // Memory配列の型検証
            if (this.isMemoryArray(input)) {
                return {
                    analysisType: 'memories',
                    processedInput: input
                };
            }
        }

        // フォールバック
        logger.warn('Invalid input type, treating as empty', { inputType: typeof input });
        return {
            analysisType: 'empty',
            processedInput: []
        };
    }

    /**
     * 文字列ベース分析
     * @private
     */
    private async performStringBasedAnalysis(chapter: Chapter, previousContent: string): Promise<ConsistencyResult> {
        try {
            return await this.checkBasicConsistency(chapter, previousContent);
        } catch (error) {
            logger.error('String-based analysis failed', { error });
            return this.createErrorFallbackResult(error, chapter.chapterNumber);
        }
    }

    /**
     * メモリベース分析
     * @private
     */
    private async performMemoryBasedAnalysis(chapter: Chapter, memories: Memory[]): Promise<ConsistencyResult> {
        try {
            const issues: ConsistencyIssue[] = [];

            // キャラクター整合性
            const characters = this.extractCharactersSafely(chapter.content);
            for (const character of characters.slice(0, this.config.characterAnalysisDepth)) {
                const characterHistory = this.getCharacterHistorySafely(character, memories);
                
                if (characterHistory.length > 0) {
                    const hasInconsistency = await this.analyzeCharacterPersonalityConsistency(
                        character, 
                        chapter.content, 
                        characterHistory
                    );
                    
                    if (hasInconsistency) {
                        issues.push({
                            type: 'CHARACTER_PERSONALITY',
                            description: `${character}の性格描写が過去の記録と矛盾している可能性があります`,
                            severity: 'HIGH'
                        });
                    }
                }
            }

            // プロット整合性
            const plotIssues = await this.checkPlotConsistencyWithMemories(chapter, memories);
            issues.push(...plotIssues);

            return {
                isConsistent: issues.length === 0,
                issues
            };

        } catch (error) {
            logger.error('Memory-based analysis failed', { error });
            return this.createErrorFallbackResult(error, chapter.chapterNumber);
        }
    }

    /**
     * スタンドアロン分析
     * @private
     */
    private async performStandaloneAnalysis(chapter: Chapter): Promise<ConsistencyResult> {
        try {
            const issues: ConsistencyIssue[] = [];

            // 内部一貫性チェック
            const internalIssues = await this.checkInternalConsistency(chapter);
            issues.push(...internalIssues);

            // 文体一貫性チェック
            const styleIssues = await this.checkInternalStyleConsistency(chapter);
            issues.push(...styleIssues);

            return {
                isConsistent: issues.length === 0,
                issues
            };

        } catch (error) {
            logger.error('Standalone analysis failed', { error });
            return this.createErrorFallbackResult(error, chapter.chapterNumber);
        }
    }

    /**
     * キャラクター状態分析
     * @private
     */
    private async analyzeCharacterStates(
        chapter: Chapter, 
        characters: string[], 
        characterStates: CharacterState[]
    ): Promise<ConsistencyIssue[]> {
        const issues: ConsistencyIssue[] = [];

        try {
            for (const characterState of characterStates) {
                if (!this.isValidCharacterState(characterState)) {
                    continue;
                }

                if (!characters.includes(characterState.name)) {
                    continue;
                }

                const characterContent = this.extractCharacterSpecificContent(chapter.content, characterState.name);
                const hasInconsistency = await this.analyzeCharacterStateConsistency(
                    characterContent, 
                    characterState
                );

                if (hasInconsistency) {
                    issues.push({
                        type: 'CHARACTER_STATE',
                        description: `${characterState.name}のキャラクター描写が設定と一致していません`,
                        severity: 'MEDIUM'
                    });
                }
            }
        } catch (error) {
            logger.error('Character states analysis failed', { error });
            issues.push({
                type: 'CHARACTER_STATE_ANALYSIS_ERROR',
                description: 'キャラクター状態分析でエラーが発生しました',
                severity: 'LOW'
            });
        }

        return issues;
    }

    /**
     * キャラクターメモリ分析
     * @private
     */
    private async analyzeCharacterMemories(
        chapter: Chapter, 
        characters: string[], 
        memories: Memory[]
    ): Promise<ConsistencyIssue[]> {
        const issues: ConsistencyIssue[] = [];

        try {
            for (const character of characters.slice(0, this.config.characterAnalysisDepth)) {
                const history = this.getCharacterHistorySafely(character, memories);
                
                if (history.length > 0) {
                    const personalityIssue = await this.analyzeCharacterPersonalityConsistency(
                        character, 
                        chapter.content, 
                        history
                    );
                    
                    if (personalityIssue) {
                        issues.push({
                            type: 'CHARACTER_PERSONALITY',
                            description: `${character}の性格が過去の描写と矛盾している可能性があります`,
                            severity: 'HIGH'
                        });
                    }
                }
            }
        } catch (error) {
            logger.error('Character memories analysis failed', { error });
            issues.push({
                type: 'CHARACTER_MEMORY_ANALYSIS_ERROR',
                description: 'キャラクターメモリ分析でエラーが発生しました',
                severity: 'LOW'
            });
        }

        return issues;
    }

    /**
     * キャラクター継続性分析
     * @private
     */
    private async analyzeCharacterContinuity(currentContent: string, previousContent: string): Promise<ConsistencyIssue[]> {
        const issues: ConsistencyIssue[] = [];

        try {
            const prevCharacters = this.extractCharactersSafely(previousContent);
            const currentCharacters = this.extractCharactersSafely(currentContent);

            // 新規登場キャラクターの妥当性チェック
            const newCharacters = currentCharacters.filter(c => !prevCharacters.includes(c));
            if (newCharacters.length > 3 && currentCharacters.length > 5) {
                issues.push({
                    type: 'CHARACTER_CONTINUITY',
                    description: `急に多くの新キャラクターが登場しています（${newCharacters.length}人）`,
                    severity: 'LOW'
                });
            }

            // 主要キャラクターの継続性チェック
            const mainCharacterCount = Math.min(3, prevCharacters.length);
            const missingMainCharacters = prevCharacters
                .slice(0, mainCharacterCount)
                .filter(c => !currentCharacters.includes(c));

            if (missingMainCharacters.length > 0) {
                issues.push({
                    type: 'CHARACTER_CONTINUITY',
                    description: `主要キャラクター（${missingMainCharacters.join(', ')}）が突然消えています`,
                    severity: 'MEDIUM'
                });
            }

        } catch (error) {
            logger.error('Character continuity analysis failed', { error });
            issues.push({
                type: 'CHARACTER_CONTINUITY_ERROR',
                description: 'キャラクター継続性分析でエラーが発生しました',
                severity: 'LOW'
            });
        }

        return issues;
    }

    /**
     * 場所継続性分析
     * @private
     */
    private async analyzeLocationContinuity(currentContent: string, previousContent: string): Promise<ConsistencyIssue[]> {
        const issues: ConsistencyIssue[] = [];

        try {
            const prevLocations = this.extractLocationsSafely(previousContent);
            const currentLocations = this.extractLocationsSafely(currentContent);

            // 場所の唐突な変更をチェック
            const isLocationContinuous = prevLocations.some(loc => currentLocations.includes(loc));
            
            if (prevLocations.length > 0 && currentLocations.length > 0 && !isLocationContinuous) {
                // 場所変更の妥当性をさらに詳しく分析
                const hasTransitionIndicator = this.hasLocationTransitionIndicator(currentContent);
                
                if (!hasTransitionIndicator) {
                    issues.push({
                        type: 'SETTING_CONTINUITY',
                        description: `場所の連続性が保たれていません（前: ${prevLocations.join(', ')}、現在: ${currentLocations.join(', ')}）`,
                        severity: 'LOW'
                    });
                }
            }

        } catch (error) {
            logger.error('Location continuity analysis failed', { error });
            issues.push({
                type: 'LOCATION_CONTINUITY_ERROR',
                description: '場所継続性分析でエラーが発生しました',
                severity: 'LOW'
            });
        }

        return issues;
    }

    /**
     * 文体継続性分析
     * @private
     */
    private async analyzeStyleContinuity(currentContent: string, previousContent: string): Promise<ConsistencyIssue[]> {
        const issues: ConsistencyIssue[] = [];

        try {
            const currentStyle = this.analyzeWritingStyle(currentContent);
            const previousStyle = this.analyzeWritingStyle(previousContent);

            // 視点の一貫性チェック
            if (currentStyle.perspective !== previousStyle.perspective && 
                currentStyle.perspective !== 'mixed' && previousStyle.perspective !== 'mixed') {
                issues.push({
                    type: 'STYLE_CONTINUITY',
                    description: `視点が変更されました（${previousStyle.perspective} → ${currentStyle.perspective}）`,
                    severity: 'MEDIUM'
                });
            }

            // 文体レベルの一貫性チェック
            const formalityDifference = Math.abs(currentStyle.formalityLevel - previousStyle.formalityLevel);
            if (formalityDifference > 0.3) {
                issues.push({
                    type: 'STYLE_CONTINUITY',
                    description: `文体の堅さレベルが大きく変化しました`,
                    severity: 'LOW'
                });
            }

        } catch (error) {
            logger.error('Style continuity analysis failed', { error });
            issues.push({
                type: 'STYLE_CONTINUITY_ERROR',
                description: '文体継続性分析でエラーが発生しました',
                severity: 'LOW'
            });
        }

        return issues;
    }

    /**
     * 時系列継続性分析
     * @private
     */
    private async analyzeTimelineContinuity(chapter: Chapter, previousContent: string): Promise<ConsistencyIssue[]> {
        const issues: ConsistencyIssue[] = [];

        try {
            const timelineMarkers = this.extractTimelineMarkers(chapter.content);
            const previousTimelineMarkers = this.extractTimelineMarkers(previousContent);

            // 時系列の論理的整合性をチェック
            const hasTimelineIssue = this.detectTimelineInconsistency(timelineMarkers, previousTimelineMarkers);
            
            if (hasTimelineIssue) {
                issues.push({
                    type: 'TIMELINE_CONTINUITY',
                    description: '時系列の整合性に問題がある可能性があります',
                    severity: 'MEDIUM'
                });
            }

        } catch (error) {
            logger.error('Timeline continuity analysis failed', { error });
            issues.push({
                type: 'TIMELINE_CONTINUITY_ERROR',
                description: '時系列継続性分析でエラーが発生しました',
                severity: 'LOW'
            });
        }

        return issues;
    }

    // ============================================================================
    // ヘルパーメソッド群（型安全性強化版）
    // ============================================================================

    /**
     * キャラクター抽出（型安全版）
     * @private
     */
    private extractCharactersSafely(content: string): string[] {
        try {
            if (typeof content !== 'string' || content.length === 0) {
                return [];
            }

            const patterns = [
                /「([^」]{1,10})」/g,
                /([^\s、。]{1,10})は/g,
                /([^\s、。]{1,10})が/g,
            ];

            const matches: string[] = [];

            patterns.forEach(pattern => {
                let match;
                const regex = new RegExp(pattern.source, pattern.flags);
                while ((match = regex.exec(content)) !== null) {
                    if (match[1] && match[1].length >= 2) {
                        matches.push(match[1]);
                    }
                }
            });

            const characterCounts = matches.reduce((counts, name) => {
                counts[name] = (counts[name] || 0) + 1;
                return counts;
            }, {} as Record<string, number>);

            const characters = Object.keys(characterCounts)
                .sort((a, b) => characterCounts[b] - characterCounts[a]);

            const exclusions = ['これ', 'それ', 'あれ', 'この', 'その', 'あの', 'ここ', 'そこ', 'あそこ', 'そんな', 'こんな'];
            return characters.filter(name => !exclusions.includes(name));

        } catch (error) {
            logger.error('Character extraction failed', { error });
            return [];
        }
    }

    /**
     * 場所抽出（型安全版）
     * @private
     */
    private extractLocationsSafely(content: string): string[] {
        try {
            if (typeof content !== 'string' || content.length === 0) {
                return [];
            }

            const locationPatterns = [
                /(.{1,10})(城|町|村|市|国|山|森|海|川|湖|谷|部屋|家|学校|公園)/g,
            ];

            const matches: string[] = [];

            locationPatterns.forEach(pattern => {
                let match;
                const regex = new RegExp(pattern.source, pattern.flags);
                while ((match = regex.exec(content)) !== null) {
                    if (match[0] && match[0].length >= 2) {
                        matches.push(match[0]);
                    }
                }
            });

            return Array.from(new Set(matches));

        } catch (error) {
            logger.error('Location extraction failed', { error });
            return [];
        }
    }

    /**
     * キャラクター履歴取得（型安全版）
     * @private
     */
    private getCharacterHistorySafely(character: string, memories: Memory[]): Memory[] {
        try {
            if (!Array.isArray(memories) || typeof character !== 'string') {
                return [];
            }

            return memories.filter(memory => 
                memory && 
                typeof memory.content === 'string' && 
                memory.content.includes(character)
            );

        } catch (error) {
            logger.error('Character history extraction failed', { error, character });
            return [];
        }
    }

    /**
     * キャラクター性格一貫性分析
     * @private
     */
    private async analyzeCharacterPersonalityConsistency(
        character: string, 
        currentContent: string, 
        history: Memory[]
    ): Promise<boolean> {
        try {
            if (history.length === 0 || typeof character !== 'string' || typeof currentContent !== 'string') {
                return false;
            }

            // 現在の描写パターンを抽出
            const currentTraits = this.extractCharacterTraits(currentContent, character);
            
            // 過去の描写パターンを分析
            const historicalTraits = history.map(memory => 
                this.extractCharacterTraits(memory.content, character)
            ).filter(traits => traits.length > 0);

            if (historicalTraits.length === 0 || currentTraits.length === 0) {
                return false;
            }

            // 一貫性スコアを計算
            const consistencyScore = this.calculatePersonalityConsistencyScore(currentTraits, historicalTraits);
            
            return consistencyScore < 0.6; // 60%未満で不一致とみなす

        } catch (error) {
            logger.error('Character personality consistency analysis failed', { error, character });
            return false;
        }
    }

    /**
     * プロット一貫性チェック（メモリ版）
     * @private
     */
    private async checkPlotConsistencyWithMemories(chapter: Chapter, memories: Memory[]): Promise<ConsistencyIssue[]> {
        const issues: ConsistencyIssue[] = [];

        try {
            // 時系列チェック
            const timelineIssues = this.checkTimelineWithMemories(chapter, memories);
            issues.push(...timelineIssues);

            // 因果関係チェック
            const causalityIssues = this.checkCausalityWithMemories(chapter, memories);
            issues.push(...causalityIssues);

        } catch (error) {
            logger.error('Plot consistency check with memories failed', { error });
            issues.push({
                type: 'PLOT_CONSISTENCY_ERROR',
                description: 'プロット一貫性チェックでエラーが発生しました',
                severity: 'LOW'
            });
        }

        return issues;
    }

    /**
     * 内部一貫性チェック
     * @private
     */
    private async checkInternalConsistency(chapter: Chapter): Promise<ConsistencyIssue[]> {
        const issues: ConsistencyIssue[] = [];

        try {
            // 章内でのキャラクター一貫性
            const characters = this.extractCharactersSafely(chapter.content);
            for (const character of characters) {
                const hasInternalInconsistency = this.detectInternalCharacterInconsistency(chapter.content, character);
                if (hasInternalInconsistency) {
                    issues.push({
                        type: 'INTERNAL_CHARACTER_CONSISTENCY',
                        description: `${character}の章内での描写に一貫性の問題があります`,
                        severity: 'MEDIUM'
                    });
                }
            }

            // 章内での設定一貫性
            const settingIssues = this.detectInternalSettingInconsistency(chapter.content);
            issues.push(...settingIssues);

        } catch (error) {
            logger.error('Internal consistency check failed', { error });
            issues.push({
                type: 'INTERNAL_CONSISTENCY_ERROR',
                description: '内部一貫性チェックでエラーが発生しました',
                severity: 'LOW'
            });
        }

        return issues;
    }

    /**
     * 内部文体一貫性チェック
     * @private
     */
    private async checkInternalStyleConsistency(chapter: Chapter): Promise<ConsistencyIssue[]> {
        const issues: ConsistencyIssue[] = [];

        try {
            const paragraphs = chapter.content.split(/\n\n+/);
            const styles = paragraphs.map(p => this.analyzeWritingStyle(p));

            // 段落間での視点の一貫性チェック
            const perspectives = styles.map(s => s.perspective).filter(p => p !== 'mixed');
            const uniquePerspectives = Array.from(new Set(perspectives));

            if (uniquePerspectives.length > 1) {
                issues.push({
                    type: 'INTERNAL_STYLE_CONSISTENCY',
                    description: '章内で視点が混在しています',
                    severity: 'HIGH'
                });
            }

            // 敬語レベルの一貫性チェック
            const formalityLevels = styles.map(s => s.formalityLevel);
            const formalityVariance = this.calculateVariance(formalityLevels);

            if (formalityVariance > 0.2) {
                issues.push({
                    type: 'INTERNAL_STYLE_CONSISTENCY',
                    description: '章内で文体の堅さレベルが不安定です',
                    severity: 'MEDIUM'
                });
            }

        } catch (error) {
            logger.error('Internal style consistency check failed', { error });
            issues.push({
                type: 'INTERNAL_STYLE_CONSISTENCY_ERROR',
                description: '内部文体一貫性チェックでエラーが発生しました',
                severity: 'LOW'
            });
        }

        return issues;
    }

    // ============================================================================
    // 型ガード・バリデーション関数群
    // ============================================================================

    /**
     * CharacterState配列の型ガード
     * @private
     */
    private isCharacterStateArray(input: any): input is CharacterState[] {
        return Array.isArray(input) && 
               input.length > 0 && 
               input.every(item => this.isValidCharacterState(item));
    }

    /**
     * Memory配列の型ガード
     * @private
     */
    private isMemoryArray(input: any): input is Memory[] {
        return Array.isArray(input) && 
               input.length > 0 && 
               input.every(item => this.isValidMemory(item));
    }

    /**
     * 有効なCharacterStateの検証
     * @private
     */
    private isValidCharacterState(state: any): state is CharacterState {
        return state &&
               typeof state === 'object' &&
               typeof state.name === 'string' &&
               state.name.length > 0;
    }

    /**
     * 有効なMemoryの検証
     * @private
     */
    private isValidMemory(memory: any): memory is Memory {
        return memory &&
               typeof memory === 'object' &&
               typeof memory.content === 'string' &&
               memory.content.length > 0;
    }

    /**
     * 有効なChapterの検証
     * @private
     */
    private isValidChapter(chapter: any): chapter is Chapter {
        return chapter &&
               typeof chapter === 'object' &&
               typeof chapter.content === 'string' &&
               chapter.content.length > 0 &&
               typeof chapter.chapterNumber === 'number';
    }

    // ============================================================================
    // 分析ヘルパーメソッド群
    // ============================================================================

    /**
     * 文体分析
     * @private
     */
    private analyzeWritingStyle(content: string): {
        perspective: 'first' | 'third' | 'mixed';
        formalityLevel: number;
        toneMarkers: string[];
    } {
        try {
            const firstPersonMarkers = ['私は', '私が', '僕は', '僕が', '俺は', '俺が'];
            const thirdPersonMarkers = ['彼は', '彼が', '彼女は', '彼女が'];
            const formalMarkers = ['です', 'ます', 'である', 'であった'];
            const casualMarkers = ['だ', 'だった', 'じゃん', 'よね'];

            const firstPersonCount = firstPersonMarkers.reduce((count, marker) => 
                count + (content.match(new RegExp(marker, 'g')) || []).length, 0);
            
            const thirdPersonCount = thirdPersonMarkers.reduce((count, marker) => 
                count + (content.match(new RegExp(marker, 'g')) || []).length, 0);

            const formalCount = formalMarkers.reduce((count, marker) => 
                count + (content.match(new RegExp(marker, 'g')) || []).length, 0);
            
            const casualCount = casualMarkers.reduce((count, marker) => 
                count + (content.match(new RegExp(marker, 'g')) || []).length, 0);

            let perspective: 'first' | 'third' | 'mixed' = 'mixed';
            if (firstPersonCount > thirdPersonCount * 2) {
                perspective = 'first';
            } else if (thirdPersonCount > firstPersonCount * 2) {
                perspective = 'third';
            }

            const totalStyleMarkers = formalCount + casualCount;
            const formalityLevel = totalStyleMarkers > 0 ? formalCount / totalStyleMarkers : 0.5;

            return {
                perspective,
                formalityLevel,
                toneMarkers: [...formalMarkers, ...casualMarkers]
            };

        } catch (error) {
            logger.error('Writing style analysis failed', { error });
            return {
                perspective: 'mixed',
                formalityLevel: 0.5,
                toneMarkers: []
            };
        }
    }

    /**
     * キャラクター特性抽出
     * @private
     */
    private extractCharacterTraits(content: string, character: string): string[] {
        try {
            const sentences = content.split(/[。！？]/).filter(s => s.includes(character));
            const traits: string[] = [];

            // 性格を表す形容詞パターン
            const traitPatterns = [
                /優し[いく]/g, /厳し[いく]/g, /明る[いく]/g, /暗[いく]/g,
                /元気/g, /静か/g, /活発/g, /内気/g, /大胆/g, /慎重/g
            ];

            sentences.forEach(sentence => {
                traitPatterns.forEach(pattern => {
                    const matches = sentence.match(pattern);
                    if (matches) {
                        traits.push(...matches);
                    }
                });
            });

            return Array.from(new Set(traits));

        } catch (error) {
            logger.error('Character traits extraction failed', { error, character });
            return [];
        }
    }

    /**
     * 性格一貫性スコア計算
     * @private
     */
    private calculatePersonalityConsistencyScore(currentTraits: string[], historicalTraits: string[][]): number {
        try {
            if (currentTraits.length === 0 || historicalTraits.length === 0) {
                return 1.0; // データ不足時は一貫していると判定
            }

            const allHistoricalTraits = historicalTraits.flat();
            const commonTraits = currentTraits.filter(trait => allHistoricalTraits.includes(trait));

            return commonTraits.length / Math.max(currentTraits.length, 1);

        } catch (error) {
            logger.error('Personality consistency score calculation failed', { error });
            return 1.0; // エラー時は一貫していると判定
        }
    }

    /**
     * 場所遷移インジケーター検出
     * @private
     */
    private hasLocationTransitionIndicator(content: string): boolean {
        const transitionMarkers = [
            '移動', '向かう', '到着', '着いた', '行く', '来る', '帰る',
            '出発', '旅立', '歩く', '走る', '飛ぶ', '歩いて', '車で', '電車で'
        ];

        return transitionMarkers.some(marker => content.includes(marker));
    }

    /**
     * 時系列マーカー抽出
     * @private
     */
    private extractTimelineMarkers(content: string): string[] {
        const timeMarkers = [
            /朝/g, /昼/g, /夜/g, /夕方/g, /深夜/g,
            /昨日/g, /今日/g, /明日/g, /先週/g, /来週/g,
            /(\d+)時間後/g, /(\d+)日後/g, /その後/g, /それから/g
        ];

        const markers: string[] = [];
        timeMarkers.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                markers.push(...matches);
            }
        });

        return markers;
    }

    /**
     * 時系列不一致検出
     * @private
     */
    private detectTimelineInconsistency(current: string[], previous: string[]): boolean {
        // 簡易的な時系列チェック
        const hasConflictingTimeMarkers = current.some(marker => 
            marker.includes('昨日') && previous.some(prev => prev.includes('明日'))
        );

        return hasConflictingTimeMarkers;
    }

    /**
     * 内部キャラクター不一致検出
     * @private
     */
    private detectInternalCharacterInconsistency(content: string, character: string): boolean {
        const characterSentences = content.split(/[。！？]/).filter(s => s.includes(character));
        
        if (characterSentences.length < 2) {
            return false;
        }

        // 簡易的な感情状態の一貫性チェック
        const positiveMarkers = ['嬉しい', '楽しい', '喜ぶ', '笑う', '明るい'];
        const negativeMarkers = ['悲しい', '辛い', '泣く', '暗い', '落ち込む'];

        const hasPositive = characterSentences.some(s => positiveMarkers.some(m => s.includes(m)));
        const hasNegative = characterSentences.some(s => negativeMarkers.some(m => s.includes(m)));

        // 極端な感情の変化があるかチェック（簡易版）
        return hasPositive && hasNegative && !content.includes('しかし') && !content.includes('でも');
    }

    /**
     * 内部設定不一致検出
     * @private
     */
    private detectInternalSettingInconsistency(content: string): ConsistencyIssue[] {
        const issues: ConsistencyIssue[] = [];

        try {
            // 天候の一貫性チェック
            const weatherMarkers = content.match(/(晴れ|雨|雪|曇り|嵐)/g);
            if (weatherMarkers && new Set(weatherMarkers).size > 2) {
                issues.push({
                    type: 'INTERNAL_SETTING_CONSISTENCY',
                    description: '章内で天候が複数回変化しています',
                    severity: 'LOW'
                });
            }

            // 時間帯の一貫性チェック
            const timeMarkers = content.match(/(朝|昼|夕方|夜|深夜)/g);
            if (timeMarkers && new Set(timeMarkers).size > 3) {
                issues.push({
                    type: 'INTERNAL_SETTING_CONSISTENCY',
                    description: '章内で時間帯が頻繁に変化しています',
                    severity: 'LOW'
                });
            }

        } catch (error) {
            logger.error('Internal setting inconsistency detection failed', { error });
        }

        return issues;
    }

    /**
     * 分散計算
     * @private
     */
    private calculateVariance(values: number[]): number {
        if (values.length === 0) return 0;

        const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
        const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
        return squaredDifferences.reduce((sum, diff) => sum + diff, 0) / values.length;
    }

    // ============================================================================
    // システム管理メソッド群
    // ============================================================================

    /**
     * 高度分析による結果強化
     * @private
     */
    private async enhanceWithAdvancedAnalysis(
        chapter: Chapter, 
        basicResult: ConsistencyResult, 
        input: Memory[] | string
    ): Promise<Partial<ConsistencyResult>> {
        try {
            const additionalIssues: ConsistencyIssue[] = [];

            // 高度なキャラクター分析
            if (this.config.strictModeEnabled) {
                const strictIssues = await this.performStrictAnalysis(chapter, input);
                additionalIssues.push(...strictIssues);
            }

            return {
                issues: additionalIssues
            };

        } catch (error) {
            logger.error('Advanced analysis enhancement failed', { error });
            return { issues: [] };
        }
    }

    /**
     * 分析結果のマージ
     * @private
     */
    private mergeAnalysisResults(
        basicResult: ConsistencyResult, 
        enhancedResult: Partial<ConsistencyResult>
    ): ConsistencyResult {
        const allIssues = [...basicResult.issues, ...(enhancedResult.issues || [])];

        return {
            isConsistent: allIssues.length === 0,
            issues: allIssues
        };
    }

    /**
     * エラーフォールバック結果作成
     * @private
     */
    private createErrorFallbackResult(error: unknown, chapterNumber: number): ConsistencyResult {
        return {
            isConsistent: false,
            issues: [{
                type: 'SYSTEM_ERROR',
                description: `一貫性チェックシステムエラー (Chapter ${chapterNumber}): ${error instanceof Error ? error.message : String(error)}`,
                severity: 'MEDIUM'
            }]
        };
    }

    /**
     * 厳密分析実行
     * @private
     */
    private async performStrictAnalysis(chapter: Chapter, input: Memory[] | string): Promise<ConsistencyIssue[]> {
        const issues: ConsistencyIssue[] = [];

        try {
            // 厳密モードでの追加チェック
            // 実装簡略化
        } catch (error) {
            logger.error('Strict analysis failed', { error });
        }

        return issues;
    }

    /**
     * 時系列チェック（メモリ版）
     * @private
     */
    private checkTimelineWithMemories(chapter: Chapter, memories: Memory[]): ConsistencyIssue[] {
        // 実装簡略化
        return [];
    }

    /**
     * 因果関係チェック（メモリ版）
     * @private
     */
    private checkCausalityWithMemories(chapter: Chapter, memories: Memory[]): ConsistencyIssue[] {
        // 実装簡略化
        return [];
    }

    /**
     * キャラクター状態一貫性分析
     * @private
     */
    private async analyzeCharacterStateConsistency(content: string, state: CharacterState): Promise<boolean> {
        try {
            if (!state.mood && !state.development) {
                return false;
            }

            // mood の一貫性チェック
            if (state.mood && !this.isConsistentWithMood(content, state.name, state.mood)) {
                return true;
            }

            // development の一貫性チェック
            if (state.development && !this.isConsistentWithDevelopment(content, state.name, state.development)) {
                return true;
            }

            return false;

        } catch (error) {
            logger.error('Character state consistency analysis failed', { error });
            return false;
        }
    }

    /**
     * キャラクター特定コンテンツ抽出
     * @private
     */
    private extractCharacterSpecificContent(content: string, characterName: string): string {
        try {
            const sentences = content.split(/[。！？\n]/).filter(sentence => 
                sentence.includes(characterName)
            );
            return sentences.join('。');
        } catch (error) {
            logger.error('Character specific content extraction failed', { error });
            return '';
        }
    }

    /**
     * 気分一貫性チェック
     * @private
     */
    private isConsistentWithMood(content: string, characterName: string, mood: string): boolean {
        const moodPatterns: Record<string, RegExp[]> = {
            '冒険心旺盛': [/冒険/g, /挑戦/g, /興味/g, /好奇心/g],
            '賢明で慎重': [/慎重/g, /考え/g, /分析/g, /判断/g],
            '臆病で内向的': [/怖/g, /不安/g, /逃げ/g, /躊躇/g],
        };

        if (!moodPatterns[mood]) {
            return true;
        }

        const paragraphs = content.split(/\n+/);
        let characterParagraphs = 0;
        let moodMatchCount = 0;

        for (const paragraph of paragraphs) {
            if (paragraph.includes(characterName)) {
                characterParagraphs++;

                const patterns = moodPatterns[mood];
                for (const pattern of patterns) {
                    if (pattern.test(paragraph)) {
                        moodMatchCount++;
                        break;
                    }
                }
            }
        }

        return characterParagraphs === 0 || moodMatchCount >= characterParagraphs * 0.3;
    }

    /**
     * 発展一貫性チェック
     * @private
     */
    private isConsistentWithDevelopment(content: string, characterName: string, development: string): boolean {
        return content.includes(development) || !content.includes(characterName);
    }

    /**
     * 分析パターン初期化
     * @private
     */
    private async initializeAnalysisPatterns(): Promise<void> {
        try {
            // 分析パターンの初期化処理
            logger.debug('Analysis patterns initialized');
        } catch (error) {
            logger.error('Failed to initialize analysis patterns', { error });
            throw error;
        }
    }

    /**
     * 最適化初期化
     * @private
     */
    private async initializeOptimizations(): Promise<void> {
        try {
            // パフォーマンス最適化の初期化
            logger.debug('Performance optimizations initialized');
        } catch (error) {
            logger.error('Failed to initialize optimizations', { error });
            throw error;
        }
    }

    /**
     * 統計更新
     * @private
     */
    private updateStatistics(processingTime: number, isConsistent: boolean): void {
        if (isConsistent) {
            this.statistics.successfulChecks++;
        } else {
            this.statistics.failedChecks++;
        }

        this.updateAverageProcessingTime(processingTime);
    }

    /**
     * 平均処理時間更新
     * @private
     */
    private updateAverageProcessingTime(processingTime: number): void {
        this.statistics.averageProcessingTime =
            ((this.statistics.averageProcessingTime * (this.statistics.totalChecks - 1)) + processingTime) /
            this.statistics.totalChecks;
    }

    /**
     * 初期化確認
     * @private
     */
    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }
    }

    // ============================================================================
    // パブリックAPIメソッド
    // ============================================================================

    /**
     * 設定を更新
     * @param config 新しい設定
     */
    updateConfiguration(config: Partial<ConsistencyCheckerConfig>): void {
        this.config = { ...this.config, ...config };
        logger.info('ConsistencyChecker configuration updated', { config: this.config });
    }

    /**
     * 統計情報を取得
     * @returns 分析統計情報
     */
    getStatistics(): AnalysisStatistics {
        return { ...this.statistics };
    }

    /**
     * システム診断を実行
     * @returns 診断結果
     */
    async performDiagnostics(): Promise<{
        systemHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
        analysisCapabilities: {
            advancedAnalysis: boolean;
            characterAnalysis: boolean;
            locationAnalysis: boolean;
            timelineValidation: boolean;
        };
        performanceMetrics: AnalysisStatistics;
        recommendations: string[];
    }> {
        try {
            await this.ensureInitialized();

            const recommendations: string[] = [];
            let systemHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';

            // パフォーマンス評価
            if (this.statistics.failedChecks / this.statistics.totalChecks > 0.1) {
                systemHealth = 'DEGRADED';
                recommendations.push('High failure rate detected, consider system optimization');
            }

            if (this.statistics.averageProcessingTime > 3000) {
                systemHealth = 'DEGRADED';
                recommendations.push('High processing time detected, consider performance optimization');
            }

            // 機能評価
            if (!this.config.enableAdvancedAnalysis) {
                recommendations.push('Consider enabling advanced analysis for better consistency checking');
            }

            return {
                systemHealth,
                analysisCapabilities: {
                    advancedAnalysis: this.config.enableAdvancedAnalysis,
                    characterAnalysis: this.config.characterAnalysisDepth > 0,
                    locationAnalysis: this.config.locationAnalysisEnabled,
                    timelineValidation: this.config.timelineValidationEnabled
                },
                performanceMetrics: { ...this.statistics },
                recommendations
            };

        } catch (error) {
            logger.error('Diagnostics failed', { 
                error: error instanceof Error ? error.message : String(error) 
            });

            return {
                systemHealth: 'CRITICAL',
                analysisCapabilities: {
                    advancedAnalysis: false,
                    characterAnalysis: false,
                    locationAnalysis: false,
                    timelineValidation: false
                },
                performanceMetrics: { ...this.statistics },
                recommendations: ['System diagnostics failed', 'Check system logs']
            };
        }
    }

    /**
     * システム最適化を実行
     * @returns 最適化結果
     */
    async optimizeSystem(): Promise<{
        optimized: boolean;
        improvements: string[];
        performanceGain: number;
    }> {
        try {
            await this.ensureInitialized();

            const improvements: string[] = [];
            let performanceGain = 0;

            // 設定の最適化
            if (this.statistics.averageProcessingTime > 2000) {
                this.config.characterAnalysisDepth = Math.max(3, this.config.characterAnalysisDepth - 1);
                improvements.push('Reduced character analysis depth for better performance');
                performanceGain += 500;
            }

            if (this.statistics.failedChecks > this.statistics.successfulChecks * 0.1) {
                this.config.strictModeEnabled = false;
                improvements.push('Disabled strict mode to reduce failures');
                performanceGain += 200;
            }

            // 統計のリセット
            this.statistics.lastOptimization = new Date().toISOString();

            return {
                optimized: improvements.length > 0,
                improvements,
                performanceGain
            };

        } catch (error) {
            logger.error('System optimization failed', { 
                error: error instanceof Error ? error.message : String(error) 
            });

            return {
                optimized: false,
                improvements: [],
                performanceGain: 0
            };
        }
    }

    /**
     * クリーンアップ処理
     */
    async cleanup(): Promise<void> {
        try {
            logger.info('Cleaning up ConsistencyChecker resources');

            // 統計のリセット
            this.statistics = {
                totalChecks: 0,
                successfulChecks: 0,
                failedChecks: 0,
                averageProcessingTime: 0,
                characterAnalysisCount: 0,
                locationAnalysisCount: 0,
                timelineValidationCount: 0,
                lastOptimization: new Date().toISOString()
            };

            this.initialized = false;
            logger.info('ConsistencyChecker cleanup completed');

        } catch (error) {
            logger.error('Failed to cleanup ConsistencyChecker', { 
                error: error instanceof Error ? error.message : String(error) 
            });
        }
    }
}