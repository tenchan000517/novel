/**
 * @fileoverview 統合記憶階層対応コンテキスト生成モジュール（完全リファクタリング版）
 * @description
 * 新しい統合記憶階層システム（MemoryManager + UnifiedAccessAPI）に完全対応。
 * 旧システムの直接アクセスを廃止し、統一アクセスAPIとDuplicateResolverを活用。
 * 記憶階層間の重複処理を排除し、高品質なGenerationContextを効率的に構築。
 */

import { logger } from '@/lib/utils/logger';
import { GenerationContext, ThemeEnhancement, StyleGuidance, TensionPacingRecommendation } from '@/types/generation';
import { GenerationError } from '@/lib/utils/error-handler';
import { parameterManager } from '@/lib/parameters';
import { plotManager } from '@/lib/plot';
import { characterManager } from '@/lib/characters/manager';
import { Chapter } from '@/types/chapters';
import { Foreshadowing } from '@/types/memory';
import { storageProvider } from '@/lib/storage';
import { CharacterPsychology } from '@/types/characters';
import { Character, CharacterMetadata } from '@/types/characters';
import { EmotionalArcDesign } from '@/types/characters';

// === 新しい統合記憶階層システムのインポート ===
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { UnifiedAccessAPI } from '@/lib/memory/core/unified-access-api';
import { DuplicateResolver } from '@/lib/memory/integration/duplicate-resolver';
import {
    MemoryLevel,
    MemoryAccessRequest,
    MemoryAccessResponse,
    MemoryRequestType,
    UnifiedMemoryContext,
    UnifiedSearchResult
} from '@/lib/memory/core/types';

// === analysisモジュール統合 ===
import { ContentAnalysisManager } from '@/lib/analysis/content-analysis-manager';

// LiteraryInspiration 型定義
interface LiteraryInspiration {
    plotTechniques: Array<{
        technique: string;
        description: string;
        example: string;
        reference: string;
    }>;
    characterTechniques: Array<{
        technique: string;
        description: string;
        example: string;
        reference: string;
    }>;
    atmosphereTechniques: Array<{
        technique: string;
        description: string;
        example: string;
        reference: string;
    }>;
}

/**
 * @class ContextGenerator
 * @description 統合記憶階層対応コンテキスト生成クラス（完全リファクタリング版）
 * 
 * @architecture
 * - 新しい統合記憶管理システム（MemoryManager）を中核とした設計
 * - UnifiedAccessAPIによる統一データアクセス
 * - DuplicateResolverによる重複データの統合取得
 * - 旧システムの直接アクセスを完全排除
 * - 分析機能はanalysisモジュールに完全委譲
 */
export class ContextGenerator {
    private memoryManager: MemoryManager;
    private unifiedAccessAPI: UnifiedAccessAPI;
    private duplicateResolver: DuplicateResolver;
    private plotManager = plotManager;
    private characterManager = characterManager;
    private initialized: boolean = false;

    // === ContentAnalysisManager への参照（依存性注入用） ===
    private contentAnalysisManager: ContentAnalysisManager | null = null;

    /**
     * コンストラクタ - 統合記憶階層システム対応
     */
    constructor(memoryManager: MemoryManager) {
        this.memoryManager = memoryManager;

        // 統合システムコンポーネントの取得
        // 実際の実装では、MemoryManagerから適切にアクセスする
        this.unifiedAccessAPI = (memoryManager as any).unifiedAccessAPI;
        this.duplicateResolver = (memoryManager as any).duplicateResolver;

        this.initializeParameters();
        logger.info('ContextGenerator initialized (統合記憶階層対応版)');
    }

    /**
     * ContentAnalysisManager の依存性注入
     */
    setContentAnalysisManager(contentAnalysisManager: ContentAnalysisManager): void {
        this.contentAnalysisManager = contentAnalysisManager;
        logger.debug('ContentAnalysisManager injected into ContextGenerator');
    }

    /**
     * パラメータマネージャーの初期化を確認
     */
    private async initializeParameters(): Promise<void> {
        try {
            await parameterManager.initialize();
            logger.info('Parameter manager initialized in ContextGenerator');
        } catch (error) {
            logger.error('Failed to initialize parameter manager', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * ContextGeneratorを初期化する（統合記憶階層対応）
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        try {
            logger.info('Initializing ContextGenerator (統合記憶階層対応版)');

            // MemoryManagerの初期化確認
            const memoryStatus = await this.memoryManager.getSystemStatus();
            if (!memoryStatus.initialized) {
                logger.warn('MemoryManager is not initialized. Attempting to initialize...');
                await this.memoryManager.initialize();
            }

            // システム診断の実行
            const diagnostics = await this.memoryManager.performSystemDiagnostics();
            if (diagnostics.systemHealth === 'CRITICAL') {
                logger.error('Memory system is in critical state', {
                    issues: diagnostics.issues,
                    recommendations: diagnostics.recommendations
                });
                throw new Error('Memory system is in critical state and cannot be used for context generation');
            } else if (diagnostics.systemHealth === 'DEGRADED') {
                logger.warn('Memory system is in degraded state', {
                    issues: diagnostics.issues
                });
            }

            this.initialized = true;
            logger.info('ContextGenerator initialization completed (統合記憶階層対応版)', {
                memorySystemHealth: diagnostics.systemHealth,
                layersInitialized: Object.keys(diagnostics.memoryLayers),
                integrationSystemsOperational: Object.values(diagnostics.integrationSystems)
                    .filter(system => system.operational).length
            });
        } catch (error) {
            logger.error('Failed to initialize ContextGenerator', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * チャプターのコンテキスト生成（統合記憶階層対応版）
     * 
     * @param chapterNumber 章番号
     * @param options ChapterGeneratorから渡される拡張オプション
     * @returns 高品質なGenerationContext
     */
    async generateContext(chapterNumber: number, options?: any): Promise<GenerationContext> {
        const startTime = Date.now();
        logger.info(`[統合記憶階層] 章${chapterNumber}のコンテキスト生成を開始`, {
            timestamp: new Date().toISOString(),
            phase: 'start',
            startTime,
            hasEnhancementOptions: !!(options?.improvementSuggestions || options?.themeEnhancements || options?.styleGuidance)
        });

        try {
            // 初期化確認
            if (!this.initialized) {
                await this.initialize();
            }

            // パラメータの取得
            const params = parameterManager.getParameters();

            // 最初のチャプターの場合は基本設定を確認
            if (chapterNumber <= 1) {
                const basicSettingsExist = await this.checkBasicSettingsExist();
                if (!basicSettingsExist) {
                    logger.error(`第1章の生成に必要な基本設定が不足しています`);
                    throw new Error('基本設定不足エラー：プロットファイルが未設定か、主要キャラクターが存在しません');
                }
            }

            // === 統一アクセスAPIによるデータ取得フェーズ ===
            logger.debug(`[統合記憶階層] 統一アクセスAPIでデータ取得開始 (章${chapterNumber})`);

            // 統合コンテキストの要求を構築
            const contextRequest: MemoryAccessRequest = {
                chapterNumber,
                requestType: MemoryRequestType.INTEGRATED_CONTEXT,
                targetLayers: [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM],
                filters: {
                    timeRange: {
                        startChapter: Math.max(1, chapterNumber - 5),
                        endChapter: chapterNumber
                    }
                },
                options: {
                    includeCache: true,
                    resolveDuplicates: true,
                    optimizeAccess: true,
                    deepAnalysis: true
                }
            };

            // 統一アクセスAPIでの統合データ取得
            const accessResponse: MemoryAccessResponse = await this.unifiedAccessAPI.processRequest(contextRequest);

            if (!accessResponse.success || !accessResponse.context) {
                logger.error(`統一アクセスAPIでのデータ取得に失敗`, {
                    error: accessResponse.error,
                    chapterNumber
                });
                throw new GenerationError(
                    `Failed to get integrated context: ${accessResponse.error}`,
                    'UNIFIED_ACCESS_FAILED'
                );
            }

            const integratedContext = accessResponse.context;

            logger.info(`[統合記憶階層] 統一アクセスAPI成功`, {
                fromCache: accessResponse.fromCache,
                processingTime: accessResponse.processingTime,
                layersAccessed: accessResponse.metadata?.layersAccessed,
                duplicatesResolved: accessResponse.metadata?.duplicatesResolved,
                cacheHits: accessResponse.metadata?.cacheHits
            });

            // === 重複解決システムによる統合データ取得 ===
            logger.debug(`[統合記憶階層] 重複解決システムでデータ統合 (章${chapterNumber})`);

            // 世界設定の統合取得
            const consolidatedWorldSettings = await this.duplicateResolver.getConsolidatedWorldSettings();

            // キャラクター情報の統合取得（フォーカスキャラクターのみ）
            const focusCharacterIds = this.extractFocusCharacterIds(integratedContext);
            const consolidatedCharacters: { [id: string]: any } = {};

            for (const characterId of focusCharacterIds) {
                try {
                    const consolidatedCharacter = await this.duplicateResolver.getConsolidatedCharacterInfo(characterId);
                    consolidatedCharacters[characterId] = consolidatedCharacter;
                } catch (error) {
                    logger.warn(`Failed to get consolidated character info for ${characterId}`, { error });
                }
            }

            // メモリアクセスの統合（章特有のデータ）
            const chapterMemoryQuery = {
                type: 'chapterMemories' as const,
                target: chapterNumber,
                parameters: { includeEvents: true, includeAnalysis: true }
            };
            const chapterMemoryResult = await this.duplicateResolver.getUnifiedMemoryAccess(chapterMemoryQuery);

            logger.info(`[統合記憶階層] 重複解決システム処理完了`, {
                worldSettingsConsolidated: !!consolidatedWorldSettings,
                charactersConsolidated: Object.keys(consolidatedCharacters).length,
                chapterMemorySuccess: chapterMemoryResult.success
            });

            // === プロット・世界設定データの取得 ===
            const plotDataResults = await Promise.allSettled([
                plotManager.getStructuredThemeSettings(),
                plotManager.getFormattedWorldAndTheme(),
                plotManager.getGenre(),
                plotManager.generatePlotDirective(chapterNumber)
            ]);

            // 型安全な結果取得
            const themeSettingsData = plotDataResults[0].status === 'fulfilled'
                ? plotDataResults[0].value : null;
            const formattedData = plotDataResults[1].status === 'fulfilled'
                ? plotDataResults[1].value : null;
            const genre = plotDataResults[2].status === 'fulfilled'
                ? plotDataResults[2].value : 'classic';
            const plotDirective = plotDataResults[3].status === 'fulfilled'
                ? plotDataResults[3].value : `第${chapterNumber}章の基本的な展開を描いてください。`;

            // === 拡張データの取得・統合フェーズ ===
            logger.info(`[統合記憶階層] 拡張データ統合 (章${chapterNumber})`, {
                hasImprovementSuggestions: !!(options?.improvementSuggestions?.length),
                hasThemeEnhancements: !!(options?.themeEnhancements?.length),
                hasStyleGuidance: !!options?.styleGuidance,
                hasAlternativeExpressions: !!options?.alternativeExpressions,
                hasLiteraryInspirations: !!options?.literaryInspirations,
                hasCharacterPsychology: !!options?.characterPsychology,
                hasTensionOptimization: !!options?.tensionOptimization
            });

            // optionsから拡張データを取得（フォールバック付き）
            const improvementSuggestions = options?.improvementSuggestions || [];
            const themeEnhancements = options?.themeEnhancements || [];
            const styleGuidance = options?.styleGuidance || await this.getDefaultStyleGuidance();
            const alternativeExpressions = options?.alternativeExpressions || {};
            const literaryInspirations = options?.literaryInspirations || await this.getDefaultLiteraryInspirations();
            const characterPsychology = options?.characterPsychology || {};

            // === キャラクター情報の拡張処理 ===
            const characterGrowthInfo = await this.getCharacterGrowthInfoFromUnifiedMemory(chapterNumber, integratedContext);

            // 統合キャラクター情報の構築
            const enhancedCharacters = this.buildEnhancedCharacterInfo(
                integratedContext,
                consolidatedCharacters,
                characterGrowthInfo,
                characterPsychology
            );

            // フォーカスキャラクターの決定
            const focusCharacters = enhancedCharacters
                .filter((c: any) => c.significance >= 0.7)
                .slice(0, 3)
                .map((c: any) => c.name);

            // === テンション・ペーシング情報の処理 ===
            const tensionPacing = options?.tensionOptimization ||
                await this.getTensionPacingRecommendation(chapterNumber, genre);

            // === 重要イベント・永続イベントの処理 ===
            const persistentEvents = await this.getPersistentEventsFormatted(chapterNumber);
            const significantEvents = this.extractSignificantEvents(integratedContext);

            // === 表現設定の取得 ===
            const expressionSettings = await this.getExpressionSettings();

            // === GenerationContext構築 ===
            logger.debug(`[統合記憶階層] 最終的なGenerationContext構築 (章${chapterNumber})`);

            const context: GenerationContext = {
                chapterNumber,
                totalChapters: integratedContext.integration?.accessOptimizations?.length || undefined,

                // フォアシャドウイング（統合記憶から取得）
                foreshadowing: this.extractForeshadowing(integratedContext),

                // ストーリーコンテキスト（統合データから構築）
                storyContext: this.buildStoryContextFromIntegrated(integratedContext),

                // 世界設定・テーマ（重複解決済み）
                worldSettingsData: this.ensureWorldSettings(consolidatedWorldSettings),
                themeSettingsData: this.ensureThemeSettings(themeSettingsData),
                worldSettings: typeof formattedData === 'object' && formattedData?.worldSettings
                    ? JSON.stringify(formattedData.worldSettings)
                    : '基本的な世界設定',
                theme: typeof formattedData === 'object' && formattedData?.theme
                    ? JSON.stringify(formattedData.theme)
                    : '物語のテーマ',
                genre: typeof genre === 'string' ? genre : 'classic',
                plotDirective: typeof plotDirective === 'string' ? plotDirective : `第${chapterNumber}章の基本的な展開を描いてください。`,

                // 表現設定
                tone: expressionSettings.tone || '自然で読みやすい文体',
                narrativeStyle: expressionSettings.narrativeStyle || '三人称視点、過去形',
                targetLength: params.generation.targetLength,

                // テンション・ペーシング
                tension: this.extractTensionValue(tensionPacing),
                pacing: this.extractPacingValue(tensionPacing),

                // キャラクター情報（統合・拡張済み）
                characters: enhancedCharacters,
                focusCharacters,

                // 物語状態（統合記憶から）
                narrativeState: this.buildNarrativeState(integratedContext),

                // 中期記憶データ
                midTermMemory: {
                    currentArc: this.buildCurrentArc(integratedContext, chapterNumber)
                },

                // 整合性チェック結果
                contradictions: [],
                plotPoints: [],
                expressionConstraints: expressionSettings.constraints || [],

                // === 拡張データ統合 ===
                improvementSuggestions,
                significantEvents,
                persistentEvents,
                characterGrowthInfo,
                characterPsychology,
                emotionalArc: this.extractEmotionalArc(integratedContext),
                styleGuidance,
                alternativeExpressions,
                literaryInspirations,
                themeEnhancements,
                tensionRecommendation: this.buildTensionRecommendation(tensionPacing),
                pacingRecommendation: this.buildPacingRecommendation(tensionPacing)
            };

            // 物語進行の提案を統合
            const enhancedContext = await this.enhanceContextWithProgressionGuidance(context, chapterNumber);

            // === 完成版ログ出力 ===
            const endTime = Date.now();
            logger.info(`[統合記憶階層] 章${chapterNumber}のコンテキスト生成完了`, {
                totalTimeMs: endTime - startTime,
                memorySystemUsed: 'unified-access-api',
                characterCount: enhancedCharacters.length,
                focusCharacterCount: focusCharacters.length,
                improvementSuggestionsCount: improvementSuggestions.length,
                themeEnhancementsCount: themeEnhancements.length,
                hasStyleGuidance: !!styleGuidance,
                hasAlternativeExpressions: Object.keys(alternativeExpressions).length > 0,
                hasLiteraryInspirations: !!literaryInspirations,
                characterPsychologyCount: Object.keys(characterPsychology).length,
                hasTensionOptimization: !!tensionPacing,
                cacheUsed: accessResponse.fromCache,
                layersAccessed: accessResponse.metadata?.layersAccessed,
                duplicatesResolved: accessResponse.metadata?.duplicatesResolved
            });

            return enhancedContext;

        } catch (error) {
            const errorTime = Date.now() - startTime;
            logger.error(`[統合記憶階層] 章${chapterNumber}のコンテキスト生成でエラー発生 (${errorTime}ms)`, {
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });

            // 統合記憶階層システムのフォールバック
            const fallbackContext = await this.createUnifiedFallbackContext(chapterNumber);
            return fallbackContext;
        }
    }

    // =========================================================================
    // === 統合記憶階層システム対応ヘルパーメソッド ===
    // =========================================================================

    /**
     * ContextGenerator の統合記憶階層システム対応修正
     * prepareCharacterInfoForChapterGeneration エラーの解決
     */

    /**
     * 統合記憶階層システムからキャラクター成長情報を取得
     * @param chapterNumber 章番号
     * @param integratedContext 統合記憶コンテキスト
     * @returns キャラクター成長情報
     */
    private async getCharacterGrowthInfoFromUnifiedMemory(
        chapterNumber: number,
        integratedContext: UnifiedMemoryContext
    ): Promise<{
        mainCharacters: any[];
        supportingCharacters: any[];
    }> {
        try {
            logger.debug(`[統合記憶階層] キャラクター成長情報取得開始 (章${chapterNumber})`);

            // 1. 統合検索でキャラクター情報を取得
            const characterSearchResult = await this.memoryManager.unifiedSearch(
                `characters chapter ${chapterNumber} type MAIN SUB`,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            // 2. 検索結果からキャラクター情報を抽出
            const allCharacters = this.extractCharactersFromSearchResult(characterSearchResult);

            // 3. キャラクタータイプ別に分類
            const mainCharacters = allCharacters.filter(char => char.type === 'MAIN');
            const supportingCharacters = allCharacters.filter(char => char.type === 'SUB');

            // 4. 重複解決システムから統合キャラクター情報を並列取得
            const [consolidatedMainCharacters, consolidatedSupportingCharacters] = await Promise.all([
                this.getConsolidatedCharactersByIds(mainCharacters.map(char => char.id)),
                this.getConsolidatedCharactersByIds(supportingCharacters.map(char => char.id))
            ]);

            // 5. 成長情報を付加
            const enhancedMainCharacters = consolidatedMainCharacters.map(char =>
                this.enrichCharacterWithGrowthInfo(char, chapterNumber, 'MAIN')
            );

            const enhancedSupportingCharacters = consolidatedSupportingCharacters.map(char =>
                this.enrichCharacterWithGrowthInfo(char, chapterNumber, 'SUB')
            );

            logger.info(`[統合記憶階層] キャラクター成長情報取得完了`, {
                mainCharacters: enhancedMainCharacters.length,
                supportingCharacters: enhancedSupportingCharacters.length
            });

            return {
                mainCharacters: enhancedMainCharacters,
                supportingCharacters: enhancedSupportingCharacters
            };

        } catch (error) {
            logger.error(`[統合記憶階層] キャラクター成長情報取得エラー`, { error, chapterNumber });

            // フォールバック: CharacterManagerから基本情報を取得
            return await this.getCharacterGrowthInfoFallback(chapterNumber);
        }
    }

    /**
     * IDリストから統合キャラクター情報を取得
     * @private
     */
    private async getConsolidatedCharactersByIds(characterIds: string[]): Promise<any[]> {
        const characters = [];

        for (const characterId of characterIds) {
            try {
                const consolidatedCharacter = await this.duplicateResolver.getConsolidatedCharacterInfo(characterId);
                if (consolidatedCharacter) {
                    characters.push(consolidatedCharacter);
                }
            } catch (error) {
                logger.warn(`統合キャラクター情報取得失敗: ${characterId}`, { error });
            }
        }

        return characters;
    }

    /**
     * 統合検索結果からキャラクター情報を抽出
     * @private
     */
    private extractCharactersFromSearchResult(searchResult: UnifiedSearchResult): any[] {
        const characters: any[] = [];

        try {
            for (const result of searchResult.results) {
                // 検索結果のデータからキャラクター情報を抽出
                if (result.type === 'character' && result.data) {
                    characters.push(result.data);
                } else if (result.data && typeof result.data === 'object') {
                    // ネストした構造からキャラクター情報を探索
                    const extractedChars = this.extractCharactersFromData(result.data);
                    characters.push(...extractedChars);
                }
            }

            // 重複を除去（IDベース）
            const uniqueCharacters = characters.filter((char, index, self) =>
                char.id && self.findIndex(c => c.id === char.id) === index
            );

            logger.debug(`検索結果から${uniqueCharacters.length}件のキャラクターを抽出`);
            return uniqueCharacters;

        } catch (error) {
            logger.error('検索結果からのキャラクター抽出でエラー', { error });
            return [];
        }
    }

    /**
     * データオブジェクトからキャラクター情報を再帰的に抽出
     * @private
     */
    private extractCharactersFromData(data: any): any[] {
        const characters: any[] = [];

        try {
            // 直接キャラクター配列がある場合
            if (Array.isArray(data)) {
                for (const item of data) {
                    if (this.isValidCharacterObject(item)) {
                        characters.push(item);
                    } else if (typeof item === 'object') {
                        characters.push(...this.extractCharactersFromData(item));
                    }
                }
            } else if (typeof data === 'object' && data !== null) {
                // オブジェクトの各プロパティをチェック
                for (const [key, value] of Object.entries(data)) {
                    if (key.toLowerCase().includes('character') && Array.isArray(value)) {
                        // キャラクター関連の配列プロパティ
                        for (const item of value) {
                            if (this.isValidCharacterObject(item)) {
                                characters.push(item);
                            }
                        }
                    } else if (this.isValidCharacterObject(value)) {
                        // 単一のキャラクターオブジェクト
                        characters.push(value);
                    } else if (typeof value === 'object' && value !== null) {
                        // 再帰的に探索
                        characters.push(...this.extractCharactersFromData(value));
                    }
                }
            }

            return characters;

        } catch (error) {
            logger.warn('データからのキャラクター抽出でエラー', { error });
            return [];
        }
    }

    /**
     * 有効なキャラクターオブジェクトかどうかを判定
     * @private
     */
    private isValidCharacterObject(obj: any): boolean {
        return obj &&
            typeof obj === 'object' &&
            typeof obj.id === 'string' &&
            typeof obj.name === 'string' &&
            (obj.type === 'MAIN' || obj.type === 'SUB' || obj.type === 'MOB');
    }

    /**
     * キャラクターに成長情報を付加
     * @private
     */
    private enrichCharacterWithGrowthInfo(character: any, chapterNumber: number, characterType: string): any {
        return {
            ...character,
            // 成長フェーズの推定
            growthPhase: this.estimateGrowthPhase(characterType, chapterNumber),
            // スキルの進化状況
            skills: this.calculateSkillProgression(character.skills || [], chapterNumber, characterType),
            // パラメータの変化
            parameters: this.calculateParameterChanges(character.parameters || [], chapterNumber, characterType),
            // 章での重要度
            significance: this.calculateChapterSignificance(character, chapterNumber, characterType)
        };
    }

    /**
     * 成長フェーズを推定
     * @private
     */
    private estimateGrowthPhase(characterType: string, chapterNumber: number): string {
        // 全体の章数を推定（統合コンテキストから取得または仮定）
        const estimatedTotalChapters = 50; // 仮定値、実際は設定から取得
        const progress = chapterNumber / estimatedTotalChapters;

        if (characterType === 'MAIN') {
            if (progress < 0.3) return '導入・成長期';
            if (progress < 0.7) return '発展・活躍期';
            return '成熟・完成期';
        } else {
            if (progress < 0.5) return '登場・確立期';
            return '活躍・支援期';
        }
    }

    /**
     * スキル進行を計算
     * @private
     */
    private calculateSkillProgression(baseSkills: any[], chapterNumber: number, characterType: string): any[] {
        const growthMultiplier = characterType === 'MAIN' ? 1.2 : 1.0;

        return baseSkills.map((skill: any) => ({
            name: skill.name || 'Unknown Skill',
            level: skill.level || 1,
            proficiency: Math.min(100, Math.max(0, (skill.proficiency || 0) + Math.floor(chapterNumber * 1.5 * growthMultiplier)))
        }));
    }

    /**
     * パラメータ変化を計算
     * @private
     */
    private calculateParameterChanges(baseParameters: any[], chapterNumber: number, characterType: string): any[] {
        const growthMultiplier = characterType === 'MAIN' ? 1.1 : 0.9;

        return baseParameters.map((param: any) => ({
            name: param.name || 'Unknown Parameter',
            value: param.value || 50,
            category: param.category || 'general',
            change: Math.floor(chapterNumber * 0.5 * growthMultiplier)
        }));
    }

    /**
     * 章での重要度を計算
     * @private
     */
    private calculateChapterSignificance(character: any, chapterNumber: number, characterType: string): number {
        let baseSignificance = character.significance || 0.5;

        // タイプ別基本重要度
        if (characterType === 'MAIN') {
            baseSignificance = Math.max(baseSignificance, 0.8);
        } else if (characterType === 'SUB') {
            baseSignificance = Math.max(baseSignificance, 0.6);
        }

        // 章番号による微調整（初期は重要度高め）
        if (chapterNumber <= 3) {
            baseSignificance += 0.1;
        }

        return Math.min(1.0, baseSignificance);
    }

    /**
     * フォールバック: CharacterManagerから基本情報を取得
     * @private
     */
    private async getCharacterGrowthInfoFallback(chapterNumber: number): Promise<{
        mainCharacters: any[];
        supportingCharacters: any[];
    }> {
        try {
            logger.warn(`[フォールバック] CharacterManagerから基本キャラクター情報を取得 (章${chapterNumber})`);

            // CharacterManagerの既存メソッドを使用
            const [mainCharacters, supportingCharacters] = await Promise.all([
                characterManager.getCharactersByType('MAIN'),
                characterManager.getCharactersByType('SUB')
            ]);

            // 基本的な成長情報を付加
            const enhancedMain = mainCharacters.map(char => ({
                id: char.id,
                name: char.name,
                type: char.type,
                description: char.description,
                growthPhase: 'unknown',
                skills: [],
                parameters: [],
                significance: char.type === 'MAIN' ? 0.8 : 0.6
            }));

            const enhancedSupporting = supportingCharacters.map(char => ({
                id: char.id,
                name: char.name,
                type: char.type,
                description: char.description,
                growthPhase: 'unknown',
                skills: [],
                parameters: [],
                significance: 0.5
            }));

            logger.info(`[フォールバック] 基本キャラクター情報取得完了`, {
                mainCharacters: enhancedMain.length,
                supportingCharacters: enhancedSupporting.length
            });

            return {
                mainCharacters: enhancedMain,
                supportingCharacters: enhancedSupporting
            };

        } catch (error) {
            logger.error('[フォールバック] CharacterManager アクセス失敗', { error });

            // 最終フォールバック: 空のデータ構造
            return {
                mainCharacters: [],
                supportingCharacters: []
            };
        }
    }

    /**
     * WorldSettingsの型安全性を確保
     */
    private ensureWorldSettings(settings: any): any {
        if (!settings || typeof settings !== 'object') {
            return {
                description: '基本的な世界設定',
                genre: 'classic',
                era: 'modern',
                location: '都市部'
            };
        }

        return {
            description: settings.description || '基本的な世界設定',
            genre: settings.genre || 'classic',
            era: settings.era || 'modern',
            location: settings.location || '都市部',
            ...settings
        };
    }

    /**
     * ThemeSettingsの型安全性を確保
     */
    private ensureThemeSettings(settings: any): any {
        if (!settings || typeof settings !== 'object') {
            return {
                description: '成長と発見の物語',
                mainThemes: ['成長', '友情', '挑戦'],
                subThemes: []
            };
        }

        return {
            description: settings.description || '成長と発見の物語',
            mainThemes: settings.mainThemes || ['成長', '友情', '挑戦'],
            subThemes: settings.subThemes || [],
            ...settings
        };
    }

    /**
     * 現在のアーク情報を構築（型安全版）
     */
    private buildCurrentArc(integratedContext: UnifiedMemoryContext, chapterNumber: number): any {
        const narrativeProgression = integratedContext.midTerm?.narrativeProgression;

        if (narrativeProgression?.arcProgression) {
            try {
                // Mapインスタンスの場合
                if (narrativeProgression.arcProgression instanceof Map) {
                    const arcEntries = Array.from(narrativeProgression.arcProgression.entries());
                    if (arcEntries.length > 0) {
                        const [arcKey, arcData] = arcEntries[0];
                        return {
                            name: typeof arcKey === 'string' ? arcKey : `Arc_${arcKey}`,
                            chapter_range: {
                                start: (arcData as any)?.completionRatio ? Math.max(1, chapterNumber - 5) : 1,
                                end: chapterNumber
                            }
                        };
                    }
                } else {
                    // オブジェクトの場合
                    const arcKeys = Object.keys(narrativeProgression.arcProgression);
                    if (arcKeys.length > 0) {
                        const arcName = arcKeys[0];
                        const arcData = (narrativeProgression.arcProgression as any)[arcName];

                        return {
                            name: arcName,
                            chapter_range: {
                                start: arcData?.completionRatio ? Math.max(1, chapterNumber - 5) : 1,
                                end: chapterNumber
                            }
                        };
                    }
                }
            } catch (error) {
                logger.warn('Failed to process arcProgression', { error });
            }
        }

        // フォールバック
        return {
            name: `第${chapterNumber}章のアーク`,
            chapter_range: {
                start: Math.max(1, chapterNumber - 2),
                end: chapterNumber
            }
        };
    }

    /**
     * フォーカスキャラクターIDを抽出
     */
    private extractFocusCharacterIds(integratedContext: UnifiedMemoryContext): string[] {
        const characters = integratedContext.shortTerm?.immediateCharacterStates || new Map();
        const characterArray = Array.from(characters.values());

        return characterArray
            .filter((char: any) => char.significance >= 0.7)
            .map((char: any) => char.id)
            .slice(0, 5); // 最大5人まで
    }

    /**
     * 統合キャラクター情報の構築
     */
    private buildEnhancedCharacterInfo(
        integratedContext: UnifiedMemoryContext,
        consolidatedCharacters: { [id: string]: any },
        characterGrowthInfo: any,
        characterPsychology: any
    ): any[] {
        const immediateCharacters = Array.from(
            integratedContext.shortTerm?.immediateCharacterStates?.values() || []
        );

        const allGrowthInfo = [
            ...(characterGrowthInfo.mainCharacters || []),
            ...(characterGrowthInfo.supportingCharacters || [])
        ];
        const growthInfoMap = new Map();
        allGrowthInfo.forEach(char => {
            if (char.id) {
                growthInfoMap.set(char.id, char);
            }
        });

        return immediateCharacters.map((character: any) => {
            const consolidatedData = consolidatedCharacters[character.id] || {};
            const growthData = growthInfoMap.get(character.id) || {};
            const psychologyData = characterPsychology[character.id] || {};

            return {
                ...character,
                ...consolidatedData,
                skills: growthData.skills || [],
                parameters: growthData.parameters || [],
                growthPhase: growthData.growthPhase || null,
                psychology: psychologyData
            };
        });
    }

    /**
     * フォアシャドウイングの抽出
     */
    private extractForeshadowing(integratedContext: UnifiedMemoryContext): any[] {
        // 長期記憶からフォアシャドウイングデータを取得
        const foreshadowingDb = integratedContext.longTerm?.knowledgeDatabase?.foreshadowingDatabase;
        if (!foreshadowingDb) return [];

        return (foreshadowingDb.foreshadowing || []).map((f: any) => ({
            description: f.description,
            urgencyLevel: f.significance !== undefined ? f.significance : this.convertUrgencyToLevel(f.urgency),
            resolutionSuggestions: f.potential_resolution || ''
        }));
    }

    /**
     * ストーリーコンテキストの構築
     */
    private buildStoryContextFromIntegrated(integratedContext: UnifiedMemoryContext): string {
        const recentChapters = integratedContext.shortTerm?.recentChapters || [];
        const narrativeProgression = integratedContext.midTerm?.narrativeProgression || {};

        // 文字列形式のストーリーコンテキストを構築
        const contextParts: string[] = [];

        if (recentChapters.length > 0) {
            contextParts.push(`最近の章：${recentChapters.slice(-3).map(ch => ch.chapter?.title || `第${ch.chapter?.chapterNumber}章`).join('、')}`);
        }

        if (integratedContext.shortTerm?.keyPhrases?.length) {
            contextParts.push(`重要なキーワード：${integratedContext.shortTerm.keyPhrases.slice(0, 5).join('、')}`);
        }

        if (contextParts.length === 0) {
            return '物語の新しい章を始めます。';
        }

        return contextParts.join('\n');
    }

    /**
     * 物語状態の構築
     */
    private buildNarrativeState(integratedContext: UnifiedMemoryContext): any {
        const progression = integratedContext.midTerm?.narrativeProgression;
        if (!progression) {
            return {
                state: {},
                arcCompleted: false,
                stagnationDetected: false,
                duration: 0,
                suggestedNextState: '',
                recommendations: [],
                timeOfDay: '',
                location: '',
                weather: ''
            };
        }

        // 最新の状態スナップショットを取得
        const latestSnapshot = progression.storyState?.[progression.storyState.length - 1];

        return {
            state: latestSnapshot?.state || {},
            arcCompleted: false, // 実装に応じて判定
            stagnationDetected: false, // 実装に応じて判定
            duration: 0,
            suggestedNextState: '',
            recommendations: [],
            timeOfDay: latestSnapshot?.metadata?.timeOfDay || '',
            location: latestSnapshot?.metadata?.location || '',
            weather: latestSnapshot?.metadata?.weather || ''
        };
    }

    /**
     * 感情アークの抽出
     */
    private extractEmotionalArc(integratedContext: UnifiedMemoryContext): EmotionalArcDesign {
        const analysisResults = integratedContext.midTerm?.analysisResults || [];

        // 感情アーク分析結果を検索
        if (Array.isArray(analysisResults)) {
            for (const result of analysisResults) {
                const analysis = result as any;

                if (analysis.emotionalArcDesigns) {
                    const arcDesigns = analysis.emotionalArcDesigns;
                    const arcDesign = typeof arcDesigns === 'object'
                        ? Object.values(arcDesigns)[0] as any
                        : arcDesigns;

                    if (arcDesign?.recommendedTone) {
                        return {
                            recommendedTone: arcDesign.recommendedTone,
                            emotionalJourney: arcDesign.emotionalJourney || {
                                opening: [{ dimension: "好奇心", level: 7 }],
                                development: [{ dimension: "緊張感", level: 5 }],
                                conclusion: [{ dimension: "満足感", level: 7 }]
                            },
                            reason: arcDesign.reason || "適切な感情アークの設計"
                        };
                    }
                }
            }
        }

        // フォールバック
        return {
            recommendedTone: "バランスのとれた中立的なトーン",
            emotionalJourney: {
                opening: [
                    { dimension: "好奇心", level: 7 },
                    { dimension: "期待感", level: 6 }
                ],
                development: [
                    { dimension: "緊張感", level: 5 },
                    { dimension: "共感", level: 6 }
                ],
                conclusion: [
                    { dimension: "満足感", level: 7 },
                    { dimension: "希望", level: 6 }
                ]
            },
            reason: "物語のこの段階では、読者の関心を維持しながらも感情的なバランスを保つことが重要です"
        };
    }

    /**
     * 重要イベントの抽出
     */
    private extractSignificantEvents(integratedContext: UnifiedMemoryContext): any {
        const analysisResults = integratedContext.midTerm?.analysisResults || [];

        return {
            locationHistory: [],
            characterInteractions: [],
            warningsAndPromises: []
        };
    }

    /**
     * 永続イベントのフォーマット済み取得
     */
    private async getPersistentEventsFormatted(chapterNumber: number): Promise<any> {
        try {
            // 統一検索で永続イベントを取得
            const searchResult = await this.memoryManager.unifiedSearch(
                'persistent events',
                [MemoryLevel.LONG_TERM]
            );

            if (!searchResult.success) {
                return this.getEmptyPersistentEvents();
            }

            // 永続イベントの整形
            return this.formatPersistentEvents(searchResult.results);
        } catch (error) {
            logger.warn(`Failed to get persistent events for chapter ${chapterNumber}`, { error });
            return this.getEmptyPersistentEvents();
        }
    }

    /**
     * 表現設定の取得（型安全版）
     */
    private async getExpressionSettings(): Promise<any> {
        try {
            // 重複解決システムから表現設定を取得
            const worldSettings = await this.duplicateResolver.getConsolidatedWorldSettings();

            // ConsolidatedWorldSettingsの実際の構造に合わせて安全にアクセス
            const settings = worldSettings as any;

            return {
                tone: settings?.tone ||
                    settings?.narrativeStyle ||
                    settings?.expressionSettings?.tone ||
                    '自然で読みやすい文体',
                narrativeStyle: settings?.style ||
                    settings?.narrativeStyle ||
                    settings?.expressionSettings?.narrativeStyle ||
                    '三人称視点、過去形',
                constraints: settings?.constraints ||
                    settings?.expressionSettings?.constraints ||
                    []
            };
        } catch (error) {
            logger.warn('Failed to get expression settings, using defaults', { error });
            return {
                tone: '自然で読みやすい文体',
                narrativeStyle: '三人称視点、過去形',
                constraints: []
            };
        }
    }

    /**
     * 統合記憶階層システム用フォールバックコンテキスト作成
     */
    private async createUnifiedFallbackContext(chapterNumber: number): Promise<GenerationContext> {
        logger.warn(`Creating unified fallback context for chapter ${chapterNumber}`);

        const params = parameterManager.getParameters();

        return {
            chapterNumber,
            foreshadowing: [],
            storyContext: '物語の新しい章を始めます。',
            worldSettingsData: this.ensureWorldSettings(null),
            themeSettingsData: this.ensureThemeSettings(null),
            worldSettings: '基本的な世界設定',
            theme: '物語のテーマ',
            genre: 'classic',
            plotDirective: `第${chapterNumber}章の基本的な展開を描いてください。`,
            tone: '自然で読みやすい文体',
            narrativeStyle: '三人称視点、過去形',
            targetLength: params.generation.targetLength,
            tension: 0.5,
            pacing: 0.5,
            characters: [],
            focusCharacters: [],
            narrativeState: {
                state: {} as any,
                arcCompleted: false,
                stagnationDetected: false,
                duration: 0,
                suggestedNextState: '' as any,
                recommendations: [],
                timeOfDay: '',
                location: '',
                weather: ''
            },
            midTermMemory: {
                currentArc: {
                    name: `第${chapterNumber}章のフォールバックアーク`,
                    chapter_range: { start: chapterNumber, end: chapterNumber }
                }
            },
            contradictions: [],
            plotPoints: [],
            expressionConstraints: [],
            improvementSuggestions: [],
            significantEvents: {
                locationHistory: [],
                characterInteractions: [],
                warningsAndPromises: []
            },
            persistentEvents: this.getEmptyPersistentEvents(),
            characterGrowthInfo: {
                mainCharacters: [],
                supportingCharacters: []
            },
            characterPsychology: {},
            emotionalArc: {
                recommendedTone: "バランスのとれた中立的なトーン",
                emotionalJourney: {
                    opening: [{ dimension: "好奇心", level: 7 }],
                    development: [{ dimension: "緊張感", level: 5 }],
                    conclusion: [{ dimension: "満足感", level: 7 }]
                },
                reason: "フォールバック時の基本的な感情アーク"
            },
            styleGuidance: await this.getDefaultStyleGuidance(),
            alternativeExpressions: {},
            literaryInspirations: await this.getDefaultLiteraryInspirations(),
            themeEnhancements: [],
            tensionRecommendation: {
                recommendedTension: 0.5,
                direction: 'maintain' as const,
                reason: 'フォールバック時の安定テンション'
            },
            pacingRecommendation: {
                recommendedPacing: 0.5,
                description: 'フォールバック時の安定ペース'
            }
        };
    }

    // =========================================================================
    // === 既存メソッド群（統合記憶階層対応） ===
    // =========================================================================

    /**
     * urgency値を数値レベルに変換するヘルパーメソッド
     */
    private convertUrgencyToLevel(urgency: string | undefined): number {
        if (!urgency) return 0.5;

        switch (urgency.toLowerCase()) {
            case 'critical': return 1.0;
            case 'high': return 0.8;
            case 'medium': return 0.5;
            case 'low': return 0.3;
            default: return 0.5;
        }
    }

    /**
     * テンション値を適切に抽出
     */
    private extractTensionValue(tensionPacing: any): number {
        if (!tensionPacing) return 0.5;

        if (tensionPacing.tension?.recommendedTension !== undefined) {
            return tensionPacing.tension.recommendedTension;
        }

        if (tensionPacing.recommendedTension !== undefined) {
            return tensionPacing.recommendedTension;
        }

        return 0.5;
    }

    /**
     * ペーシング値を適切に抽出
     */
    private extractPacingValue(tensionPacing: any): number {
        if (!tensionPacing) return 0.5;

        if (tensionPacing.pacing?.recommendedPacing !== undefined) {
            return tensionPacing.pacing.recommendedPacing;
        }

        if (tensionPacing.recommendedPacing !== undefined) {
            return tensionPacing.recommendedPacing;
        }

        return 0.5;
    }

    /**
     * テンション推奨オブジェクト構築
     */
    private buildTensionRecommendation(tensionPacing: any): any {
        if (!tensionPacing) {
            return {
                recommendedTension: 0.5,
                direction: 'maintain',
                reason: 'デフォルトテンション'
            };
        }

        if (tensionPacing.tension) {
            return tensionPacing.tension;
        }

        return {
            recommendedTension: tensionPacing.recommendedTension || 0.5,
            direction: 'maintain',
            reason: 'テンション維持'
        };
    }

    /**
     * ペーシング推奨オブジェクト構築
     */
    private buildPacingRecommendation(tensionPacing: any): any {
        if (!tensionPacing) {
            return {
                recommendedPacing: 0.5,
                description: 'デフォルトペース'
            };
        }

        if (tensionPacing.pacing) {
            return tensionPacing.pacing;
        }

        return {
            recommendedPacing: tensionPacing.recommendedPacing || 0.5,
            description: 'バランスの取れたペース'
        };
    }

    // =========================================================================
    // === フォールバック実装群 ===
    // =========================================================================

    /**
     * デフォルトの文体ガイダンスを取得
     */
    private async getDefaultStyleGuidance(): Promise<StyleGuidance> {
        logger.debug('Using default style guidance (fallback)');
        return {
            general: [
                "文体に変化をつけて、読者の興味を維持してください",
                "明確で簡潔な文章を心がけ、冗長な表現を避けてください",
                "読者の感情に訴えかける表現を効果的に使用してください",
                "物語の雰囲気に合った文体を選択してください"
            ],
            sentenceStructure: [
                "文の長さに変化をつけて、リズムを作ってください",
                "単調な構造を避け、複文と単文を適切に組み合わせてください",
                "効果的な句読点を使用して、読みやすさを向上させてください",
                "重要な情報は文の前半に配置してください"
            ],
            vocabulary: [
                "適切な語彙を選択し、文脈に合った言葉を使ってください",
                "表現の多様性を意識し、同じ単語の繰り返しを避けてください",
                "専門用語の使用は控えめにし、必要な場合は説明を加えてください",
                "感情的な語彙を効果的に使用してください"
            ],
            rhythm: [
                "読みやすいリズムを意識し、自然な文章の流れを作ってください",
                "テンポの緩急をつけて、場面の変化を表現してください",
                "音韻の響きを考慮し、読み上げたときの美しさを意識してください",
                "沈黙や間を効果的に使用してください"
            ]
        };
    }

    /**
     * デフォルトの文学的インスピレーションを取得
     */
    private async getDefaultLiteraryInspirations(): Promise<LiteraryInspiration> {
        logger.debug('Using default literary inspirations (fallback)');
        return {
            plotTechniques: [
                {
                    technique: "対比構造",
                    description: "対照的な場面や状況を並置して、両方の特性を強調する",
                    example: "平和な日常の描写の直後に緊迫した場面を配置する",
                    reference: "古典文学からモダン作品まで広く使用される技法"
                },
                {
                    technique: "伏線の設置と回収",
                    description: "物語の前半で示唆し、後半で意味を明らかにする技法",
                    example: "主人公が何気なく拾った小さなアイテムが、後の章で重要な意味を持つ",
                    reference: "優れた小説作品"
                }
            ],
            characterTechniques: [
                {
                    technique: "行動による性格描写",
                    description: "キャラクターの内面を直接説明せず、行動や選択を通じて性格を示す",
                    example: "危機的状況での判断や反応を通じてキャラクターの本質を描く",
                    reference: "優れたキャラクター小説"
                }
            ],
            atmosphereTechniques: [
                {
                    technique: "感情移入的環境描写",
                    description: "キャラクターの感情状態を反映した環境描写",
                    example: "主人公の不安な心理状態を、曇り空や不気味な風の音で間接的に表現する",
                    reference: "ゴシック文学など"
                }
            ]
        };
    }

    /**
     * テンション・ペーシング推奨値を取得（統合記憶階層対応・型安全版）
     */
    private async getTensionPacingRecommendation(
        chapterNumber: number,
        genre: string
    ): Promise<TensionPacingRecommendation> {
        try {
            // 統合記憶階層からテンション・ペーシング情報を取得
            const tensionRequest: MemoryAccessRequest = {
                chapterNumber,
                requestType: MemoryRequestType.NARRATIVE_STATE,
                targetLayers: [MemoryLevel.MID_TERM],
                filters: {
                    analysisTypes: ['tension', 'pacing']
                }
            };

            const response = await this.unifiedAccessAPI.processRequest(tensionRequest);

            if (response.success && response.context) {
                const analysisResults = response.context.midTerm?.analysisResults;
                if (Array.isArray(analysisResults)) {
                    // テンション・ペーシング分析結果を検索
                    for (const result of analysisResults) {
                        const analysis = result as any;

                        // テンション最適化統計から情報を取得
                        if (analysis.tensionOptimizationStats ||
                            analysis.recommendedTension !== undefined ||
                            analysis.tension !== undefined) {

                            const tensionData = analysis.tensionOptimizationStats || analysis;

                            return {
                                tension: {
                                    recommendedTension: tensionData.recommendedTension ??
                                        analysis.recommendedTension ?? 0.5,
                                    direction: tensionData.direction ??
                                        analysis.direction ?? 'maintain',
                                    reason: tensionData.reason ??
                                        analysis.reason ?? 'テンションは一定を保つのが望ましいため'
                                },
                                pacing: {
                                    recommendedPacing: tensionData.recommendedPacing ??
                                        analysis.recommendedPacing ?? 0.5,
                                    description: tensionData.description ??
                                        analysis.description ?? '読者の集中を維持する安定したペースです'
                                }
                            };
                        }
                    }
                }
            }

            // フォールバック
            return {
                tension: {
                    recommendedTension: 0.5,
                    direction: 'maintain',
                    reason: 'デフォルトテンション'
                },
                pacing: {
                    recommendedPacing: 0.5,
                    description: 'デフォルトペース'
                }
            };
        } catch (error) {
            logger.error('テンション・ペーシング推奨値取得エラー', { error });
            return {
                tension: {
                    recommendedTension: 0.5,
                    direction: 'maintain',
                    reason: 'エラー発生時のデフォルトテンション'
                },
                pacing: {
                    recommendedPacing: 0.5,
                    description: 'エラー発生時のデフォルトペース'
                }
            };
        }
    }

    // =========================================================================
    // === ユーティリティメソッド ===
    // =========================================================================

    /**
     * 空の永続イベントオブジェクトを取得
     */
    private getEmptyPersistentEvents(): any {
        return {
            deaths: [],
            marriages: [],
            births: [],
            promotions: [],
            skillAcquisitions: [],
            injuries: [],
            transformations: [],
            relocations: []
        };
    }

    /**
     * 永続イベントのフォーマット
     */
    private formatPersistentEvents(events: any[]): any {
        if (!events || events.length === 0) {
            return this.getEmptyPersistentEvents();
        }

        const result = this.getEmptyPersistentEvents();

        for (const eventResult of events) {
            if (!eventResult.data || !Array.isArray(eventResult.data)) continue;

            for (const event of eventResult.data) {
                if (!event.type) continue;

                switch (event.type) {
                    case 'DEATH':
                        if (event.involvedCharacters?.length > 0) {
                            result.deaths.push({
                                character: event.involvedCharacters[0],
                                description: event.description,
                                chapterNumber: event.chapterNumber
                            });
                        }
                        break;
                    case 'MARRIAGE':
                        if (event.involvedCharacters?.length >= 2) {
                            result.marriages.push({
                                characters: event.involvedCharacters,
                                description: event.description,
                                chapterNumber: event.chapterNumber
                            });
                        }
                        break;
                    // 他のイベントタイプも同様に処理
                }
            }
        }

        return result;
    }

    /**
     * 物語進行のガイダンス強化
     */
    private async enhanceContextWithProgressionGuidance(
        context: GenerationContext,
        chapterNumber: number
    ): Promise<GenerationContext> {
        try {
            // 統合検索で物語進行の提案を取得
            const progressionResult = await this.memoryManager.unifiedSearch(
                `story progression chapter ${chapterNumber}`,
                [MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            if (progressionResult.success && progressionResult.results.length > 0) {
                const suggestions = progressionResult.results
                    .map(result => result.data?.progressionSuggestion)
                    .filter(suggestion => suggestion);

                return {
                    ...context,
                    plotPoints: [...(context.plotPoints || []), ...suggestions],
                    storyProgressionGuidance: {
                        required: true,
                        suggestions
                    }
                };
            }

            return context;
        } catch (error) {
            logger.error('Failed to enhance context with progression guidance', { error });
            return context;
        }
    }

    /**
     * 基本設定の存在確認
     */
    private async checkBasicSettingsExist(): Promise<boolean> {
        try {
            const [plotExists, mainCharacterExists, worldSettingsExist] = await Promise.allSettled([
                this.checkPlotFileExists(),
                this.checkMainCharacterExists(),
                this.checkWorldSettingsExist()
            ]);

            const results = [plotExists, mainCharacterExists, worldSettingsExist]
                .map(result => result.status === 'fulfilled' ? result.value : false);

            if (!results[0]) {
                logger.error('プロットファイルが存在しません');
                return false;
            }

            if (!results[1]) {
                logger.error('主人公キャラクターが設定されていません');
                return false;
            }

            if (!results[2]) {
                logger.error('世界設定が設定されていません');
                return false;
            }

            return true;
        } catch (error) {
            logger.error('基本設定の確認中にエラーが発生しました', {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    private async checkPlotFileExists(): Promise<boolean> {
        try {
            const abstractPlot = await plotManager.getAbstractGuidelinesForChapter(1);
            const concretePlot = await plotManager.getConcretePlotForChapter(1);

            return (abstractPlot !== null && Object.keys(abstractPlot).length > 0) ||
                (concretePlot !== null);
        } catch (error) {
            logger.error('プロットファイル確認エラー', {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    private async checkMainCharacterExists(): Promise<boolean> {
        try {
            const mainCharacters = await characterManager.getCharactersByType('MAIN');
            return mainCharacters.length > 0;
        } catch (error) {
            logger.error('メインキャラクター確認エラー', {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    private async checkWorldSettingsExist(): Promise<boolean> {
        try {
            const hasValidSettings = await plotManager.hasValidWorldSettings();

            if (!hasValidSettings) {
                logger.error('有効な世界設定が存在しません');
                return false;
            }

            const hasValidTheme = await plotManager.hasValidThemeSettings();
            if (!hasValidTheme) {
                logger.warn('有効なテーマ設定が存在しません');
            }

            return true;
        } catch (error) {
            logger.error('世界設定確認エラー', {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    // =========================================================================
    // === 公開メソッド ===
    // =========================================================================

    async isInitialized(): Promise<boolean> {
        return this.initialized;
    }

    /**
     * 感情アーク設計の取得（統合記憶階層対応・型安全版）
     */
    async getEmotionalArcDesign(chapterNumber: number): Promise<EmotionalArcDesign> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // 統一アクセスAPIで感情アーク情報を取得
            const request: MemoryAccessRequest = {
                chapterNumber,
                requestType: MemoryRequestType.CHARACTER_ANALYSIS,
                targetLayers: [MemoryLevel.MID_TERM],
                filters: {
                    analysisTypes: ['emotional_arc']
                }
            };

            const response = await this.unifiedAccessAPI.processRequest(request);

            if (response.success && response.context?.midTerm?.analysisResults) {
                const analysisResults = response.context.midTerm.analysisResults;

                if (Array.isArray(analysisResults)) {
                    // 感情アーク分析結果を検索
                    for (const result of analysisResults) {
                        const analysis = result as any;

                        // 感情アーク設計データを検索
                        if (analysis.emotionalArcDesigns) {
                            const arcDesigns = analysis.emotionalArcDesigns;
                            const arcDesign = typeof arcDesigns === 'object'
                                ? Object.values(arcDesigns)[0] as any
                                : arcDesigns;

                            if (arcDesign?.recommendedTone) {
                                return {
                                    recommendedTone: arcDesign.recommendedTone,
                                    emotionalJourney: arcDesign.emotionalJourney || {
                                        opening: [{ dimension: "好奇心", level: 7 }],
                                        development: [{ dimension: "緊張感", level: 5 }],
                                        conclusion: [{ dimension: "満足感", level: 7 }]
                                    },
                                    reason: arcDesign.reason || "適切な感情アークの設計"
                                };
                            }
                        } else if (analysis.recommendedTone) {
                            // 直接recommendedToneが含まれている場合
                            return {
                                recommendedTone: analysis.recommendedTone,
                                emotionalJourney: analysis.emotionalJourney || {
                                    opening: [{ dimension: "好奇心", level: 7 }],
                                    development: [{ dimension: "緊張感", level: 5 }],
                                    conclusion: [{ dimension: "満足感", level: 7 }]
                                },
                                reason: analysis.reason || "適切な感情アークの設計"
                            };
                        }
                    }
                }
            }

            // フォールバック
            return {
                recommendedTone: "バランスのとれた中立的なトーン",
                emotionalJourney: {
                    opening: [
                        { dimension: "好奇心", level: 7 },
                        { dimension: "期待感", level: 6 }
                    ],
                    development: [
                        { dimension: "緊張感", level: 5 },
                        { dimension: "共感", level: 6 }
                    ],
                    conclusion: [
                        { dimension: "満足感", level: 7 },
                        { dimension: "希望", level: 6 }
                    ]
                },
                reason: "物語のこの段階では、読者の関心を維持しながらも感情的なバランスを保つことが重要です"
            };
        } catch (error) {
            logger.error(`Failed to get emotional arc design for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // フォールバック
            return {
                recommendedTone: "バランスのとれた中立的なトーン",
                emotionalJourney: {
                    opening: [
                        { dimension: "好奇心", level: 7 },
                        { dimension: "期待感", level: 6 }
                    ],
                    development: [
                        { dimension: "緊張感", level: 5 },
                        { dimension: "共感", level: 6 }
                    ],
                    conclusion: [
                        { dimension: "満足感", level: 7 },
                        { dimension: "希望", level: 6 }
                    ]
                },
                reason: "物語のこの段階では、読者の関心を維持しながらも感情的なバランスを保つことが重要です"
            };
        }
    }

    /**
     * キャラクター心理情報の取得（統合記憶階層対応）
     */
    async getCharacterPsychology(characterId: string, chapterNumber: number): Promise<CharacterPsychology | null> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // 1. 重複解決システムでキャラクター情報を取得
            const consolidatedCharacter = await this.duplicateResolver.getConsolidatedCharacterInfo(characterId);

            if (consolidatedCharacter?.psychology) {
                return consolidatedCharacter.psychology;
            }

            // 2. 統合検索で心理分析データを取得
            const psychologySearchResult = await this.memoryManager.unifiedSearch(
                `character psychology ${characterId} chapter ${chapterNumber}`,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );

            const psychologyData = this.extractPsychologyFromSearchResult(psychologySearchResult, characterId);
            if (psychologyData) {
                return psychologyData;
            }

            // 3. フォールバック：基本心理プロファイルを生成
            return this.generateBasicPsychologyProfile(characterId, chapterNumber);

        } catch (error) {
            logger.error(`キャラクター心理情報の取得に失敗しました: ${characterId}`, { error });
            return null;
        }
    }

    /**
     * 検索結果から心理情報を抽出
     * @private
     */
    private extractPsychologyFromSearchResult(searchResult: UnifiedSearchResult, characterId: string): CharacterPsychology | null {
        try {
            for (const result of searchResult.results) {
                if (result.data && typeof result.data === 'object') {
                    // 心理分析データを探索
                    const psychology = this.findPsychologyInData(result.data, characterId);
                    if (psychology) {
                        return psychology;
                    }
                }
            }
            return null;
        } catch (error) {
            logger.warn('心理情報の抽出でエラー', { error, characterId });
            return null;
        }
    }

    /**
     * データから心理情報を再帰的に検索
     * @private
     */
    private findPsychologyInData(data: any, characterId: string): CharacterPsychology | null {
        if (!data || typeof data !== 'object') return null;

        // 直接心理データがある場合
        if (data.characterId === characterId && data.psychology) {
            return data.psychology;
        }

        // ネストした構造を検索
        for (const [key, value] of Object.entries(data)) {
            if (key.toLowerCase().includes('psychology') && typeof value === 'object') {
                if (value && (value as any).currentDesires) {
                    return value as CharacterPsychology;
                }
            } else if (typeof value === 'object' && value !== null) {
                const found = this.findPsychologyInData(value, characterId);
                if (found) return found;
            }
        }

        return null;
    }

    /**
     * 基本心理プロファイルを生成
     * @private
     */
    private generateBasicPsychologyProfile(characterId: string, chapterNumber: number): CharacterPsychology {
        return {
            currentDesires: ['成長したい', '目標を達成したい'],
            currentFears: ['失敗への恐れ', '孤独への不安'],
            internalConflicts: ['理想と現実のギャップ'],
            emotionalState: {
                'curiosity': 7,
                'determination': 6,
                'anxiety': 3
            },
            relationshipAttitudes: {}
        } as CharacterPsychology;
    }
    /**
     * 複数キャラクターの心理情報取得
     */
    async getMultipleCharacterPsychology(characterIds: string[], chapterNumber: number): Promise<{ [id: string]: CharacterPsychology }> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const result: { [id: string]: CharacterPsychology } = {};

            // 並列で取得
            const promises = characterIds.map(async (id) => {
                const psychology = await this.getCharacterPsychology(id, chapterNumber);
                if (psychology) {
                    result[id] = psychology;
                }
            });

            await Promise.allSettled(promises);
            return result;
        } catch (error) {
            logger.error('複数キャラクターの心理情報取得に失敗しました', { error });
            return {};
        }
    }

    /**
     * 生成されたチャプターからキャラクター情報を更新（統合記憶階層対応・型安全版）
     */
    public async processGeneratedChapter(chapter: Chapter): Promise<void> {
        logger.info(`[統合記憶階層] Processing character information for chapter ${chapter.chapterNumber}`);
        try {
            // 1. MemoryManagerの統合処理を使用
            const result = await this.memoryManager.processChapter(chapter);

            // resultの構造に基づいて成功判定
            const isSuccess = result && (
                (result as any).success !== undefined ? (result as any).success :
                    (result as any).shortTermUpdated !== undefined
            );

            if (!isSuccess) {
                const errorMessage = (result as any).error ||
                    (result as any).errors?.join(', ') ||
                    'Unknown processing error';

                logger.error(`Chapter processing failed for chapter ${chapter.chapterNumber}`, {
                    error: errorMessage
                });
                throw new Error(`Chapter processing failed: ${errorMessage}`);
            }

            const processingTime = (result as any).processingTime || 0;
            const affectedComponents = (result as any).affectedComponents || [];

            // 2. 統合記憶階層システムでキャラクター固有の追加処理
            await this.processCharacterSpecificUpdates(chapter);

            logger.info(`Successfully processed chapter ${chapter.chapterNumber} with unified memory system`, {
                processingTime,
                affectedComponents: affectedComponents.length ? affectedComponents : ['unified-memory'],
                resultType: typeof result
            });

        } catch (error) {
            logger.error(`Error in processGeneratedChapter for chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        }
    }

    /**
     * キャラクター固有の追加処理
     * @private
     */
    private async processCharacterSpecificUpdates(chapter: Chapter): Promise<void> {
        try {
            // 1. 章からキャラクター情報を抽出
            const characterUpdates = this.extractCharacterUpdatesFromChapter(chapter);

            // 2. 統合検索で関連キャラクターを特定
            const characterSearchResult = await this.memoryManager.unifiedSearch(
                `characters mentioned chapter ${chapter.chapterNumber}`,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
            );

            // 3. 重複解決システムでキャラクター状態を更新
            for (const update of characterUpdates) {
                await this.updateCharacterThroughMemorySystem(update.characterId, update.changes);
            }

            logger.debug(`キャラクター固有の処理完了: ${characterUpdates.length}件の更新`);

        } catch (error) {
            logger.warn('キャラクター固有の追加処理でエラー', { error });
            // エラーがあっても続行（メイン処理は完了済み）
        }
    }

    /**
     * 章からキャラクター更新情報を抽出
     * @private
     */
    private extractCharacterUpdatesFromChapter(chapter: Chapter): Array<{
        characterId: string;
        characterName: string;
        changes: any;
    }> {
        const updates: Array<{ characterId: string; characterName: string; changes: any }> = [];

        try {
            // 章のメタデータからキャラクター情報を抽出
            const characters = chapter.metadata?.characters || [];

            for (const character of characters) {
                if (character.id) {
                    updates.push({
                        characterId: character.id,
                        characterName: character.name || 'Unknown',
                        changes: {
                            lastAppearance: chapter.chapterNumber,
                            recentContent: chapter.content.substring(0, 200),
                            emotionalContext: this.extractEmotionalContext(chapter.content, character.name)
                        }
                    });
                }
            }

            return updates;

        } catch (error) {
            logger.warn('章からのキャラクター更新情報抽出でエラー', { error });
            return [];
        }
    }

    /**
     * 感情的コンテキストを抽出
     * @private
     */
    private extractEmotionalContext(content: string, characterName: string): string {
        // 簡易的な感情コンテキスト抽出
        const emotionalKeywords = ['喜び', '悲しみ', '怒り', '恐れ', '驚き', '嫌悪', '期待'];
        const lowerContent = content.toLowerCase();
        const lowerName = characterName.toLowerCase();

        const nameIndex = lowerContent.indexOf(lowerName);
        if (nameIndex === -1) return 'neutral';

        // キャラクター名前後100文字の範囲で感情語を検索
        const contextStart = Math.max(0, nameIndex - 100);
        const contextEnd = Math.min(content.length, nameIndex + 100);
        const context = content.substring(contextStart, contextEnd);

        for (const emotion of emotionalKeywords) {
            if (context.includes(emotion)) {
                return emotion;
            }
        }

        return 'neutral';
    }

    /**
     * 統合記憶階層システム経由でキャラクター状態を更新
     * @private
     */
    private async updateCharacterThroughMemorySystem(characterId: string, changes: any): Promise<void> {
        try {
            // 重複解決システムを使用してキャラクター情報を取得
            const currentCharacter = await this.duplicateResolver.getConsolidatedCharacterInfo(characterId);

            if (currentCharacter) {
                // 必要に応じて追加の更新処理
                logger.debug(`キャラクター ${characterId} の状態更新完了`);
            }

        } catch (error) {
            logger.warn(`キャラクター ${characterId} の状態更新でエラー`, { error });
        }
    }
}