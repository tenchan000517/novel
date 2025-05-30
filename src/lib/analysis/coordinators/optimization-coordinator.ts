/**
 * @fileoverview 最適化コーディネータ
 * @description
 * 全ての最適化サービスを統合し、章の包括的な改善提案を調整するコーディネータ。
 * テーマ強化、文体最適化、キャラクター深化、テンション最適化などの各専門サービスを
 * 統合して一貫性のある最適化提案を提供します。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiAdapter } from '@/lib/analysis/adapters/gemini-adapter';
import { JsonParser } from '@/lib/utils/json-parser';
import { apiThrottler } from '@/lib/utils/api-throttle';

// 最適化サービスのインポート
import { ThemeEnhancementService } from '@/lib/analysis/enhancement/theme/theme-enhancement-service';
import { StyleOptimizationService } from '@/lib/analysis/enhancement/style/style-optimization-service';
import { CharacterDepthService } from '@/lib/analysis/enhancement/character/character-depth-service';
import { TensionOptimizationService } from '@/lib/analysis/enhancement/tension/tension-optimization-service';

// 型定義のインポート
import {
  GenerationContext,
  ThemeResonanceAnalysis,
  StyleAnalysis,
  ExpressionPatterns,
  StyleGuidance,
  ExpressionAlternatives,
  QualityMetrics
} from '@/types/generation';

import {
  ThemeEnhancement,
  LiteraryInspiration,
  LiteraryTechnique,
  SymbolicElement,
  ForeshadowingOpportunity,
  SubjectPatternOptimization,
  StructureRecommendation,
  RepetitionAlternative
} from '@/lib/analysis/core/types';

import {
  TensionPacingRecommendation,
  TensionCurvePoint
} from '@/lib/analysis/enhancement/tension/interfaces';

import {
  DepthRecommendation,
  CharacterDepthPrompt
} from '@/lib/analysis/enhancement/character/interfaces';

import { SubjectPatternOptimizationRequest } from '@/lib/analysis/core/interfaces';
import { Character, CharacterPsychology } from '@/lib/characters/core/types';

/**
 * @interface IntegratedOptimizationResult
 * @description 統合最適化結果
 */
export interface IntegratedOptimizationResult {
  // テーマ最適化
  themeOptimization: {
    themeEnhancements: ThemeEnhancement[];
    literaryInspirations: LiteraryInspiration;
    symbolicElements: SymbolicElement[];
    foreshadowingOpportunities: ForeshadowingOpportunity[];
    literaryTechniques: LiteraryTechnique[];
  };

  // 文体最適化
  styleOptimization: {
    styleGuidance: StyleGuidance;
    expressionAlternatives: ExpressionAlternatives;
    subjectPatternOptimization: SubjectPatternOptimization;
    structureRecommendations: StructureRecommendation[];
    repetitionAlternatives: RepetitionAlternative[];
  };

  // キャラクター最適化
  characterOptimization: {
    depthRecommendations: { [characterId: string]: DepthRecommendation[] };
    focusCharacters: string[];
    characterDepthPrompts: { [characterId: string]: CharacterDepthPrompt };
  };

  // テンション最適化
  tensionOptimization: {
    tensionPacingRecommendation: TensionPacingRecommendation;
    tensionOptimizationSuggestions: string[];
    tensionCurve: TensionCurvePoint[];
    climaxRecommendation: {
      climaxChapter: number;
      secondaryClimaxChapters: number[];
      reason: string;
    };
  };

  // 統合推奨
  integratedRecommendations: {
    prioritizedSuggestions: PrioritizedSuggestion[];
    conflictResolutions: ConflictResolution[];
    implementationOrder: ImplementationStep[];
    synergisticOpportunities: SynergyOpportunity[];
  };

  // メタデータ
  optimizationMetadata: {
    optimizationTimestamp: string;
    servicesUsed: string[];
    processingTime: number;
    totalRecommendations: number;
    highPriorityCount: number;
    mediumPriorityCount: number;
    lowPriorityCount: number;
  };
}

/**
 * @interface PrioritizedSuggestion
 * @description 優先度付き改善提案
 */
export interface PrioritizedSuggestion {
  id: string;
  category: 'theme' | 'style' | 'character' | 'tension' | 'integrated';
  title: string;
  description: string;
  implementation: string;
  priority: 'high' | 'medium' | 'low';
  impact: number; // 0-1
  effort: number; // 0-1
  dependencies: string[];
  relatedSuggestions: string[];
}

/**
 * @interface ConflictResolution
 * @description 推奨間の矛盾解決
 */
export interface ConflictResolution {
  conflictType: 'contradiction' | 'redundancy' | 'resource_conflict';
  description: string;
  conflictingSuggestions: string[];
  resolution: string;
  recommendedAction: string;
}

/**
 * @interface ImplementationStep
 * @description 実装ステップ
 */
export interface ImplementationStep {
  step: number;
  phase: 'preparation' | 'core_implementation' | 'refinement' | 'validation';
  suggestions: string[];
  description: string;
  estimatedEffort: 'low' | 'medium' | 'high';
}

/**
 * @interface SynergyOpportunity
 * @description 相乗効果機会
 */
export interface SynergyOpportunity {
  title: string;
  description: string;
  involvedSuggestions: string[];
  synergisticBenefit: string;
  implementationApproach: string;
}

/**
 * @interface OptimizationCoordinatorOptions
 * @description 最適化コーディネータのオプション
 */
export interface OptimizationCoordinatorOptions {
  enableCache?: boolean;
  enableParallelProcessing?: boolean;
  maxRecommendationsPerCategory?: number;
  prioritizationStrategy?: 'impact' | 'effort' | 'balanced';
  enableConflictResolution?: boolean;
  enableSynergyDetection?: boolean;
  enableDetailedLogging?: boolean;
}

/**
 * @class OptimizationCoordinator
 * @description 最適化コーディネータ
 * 
 * 全ての最適化サービスを統合し、以下の責任を持ちます：
 * - 各最適化サービスの調整と統合
 * - 推奨間の優先度付けと矛盾解決
 * - 実装順序の最適化
 * - 相乗効果の検出と活用
 * - キャッシュ管理とパフォーマンス最適化
 */
export class OptimizationCoordinator {
  // サービスインスタンス
  private themeEnhancementService: ThemeEnhancementService;
  private styleOptimizationService: StyleOptimizationService;
  private characterDepthService: CharacterDepthService;
  private tensionOptimizationService: TensionOptimizationService;

  // キャッシュとメタデータ管理
  private optimizationCache: Map<string, IntegratedOptimizationResult> = new Map();
  private performanceMetrics: Map<string, number> = new Map();

  // 設定
  private options: OptimizationCoordinatorOptions;

  /**
   * コンストラクタ
   * 
   * @param geminiAdapter AI分析アダプター
   * @param styleAnalysisService 文体分析サービス
   * @param options コーディネータオプション
   */
  constructor(
    private geminiAdapter: GeminiAdapter,
    styleAnalysisService: any, // IStyleAnalysisService
    options: OptimizationCoordinatorOptions = {}
  ) {
    this.options = {
      enableCache: true,
      enableParallelProcessing: true,
      maxRecommendationsPerCategory: 5,
      prioritizationStrategy: 'balanced',
      enableConflictResolution: true,
      enableSynergyDetection: true,
      enableDetailedLogging: false,
      ...options
    };

    // サービスを直接初期化
    this.themeEnhancementService = new ThemeEnhancementService(this.geminiAdapter);
    this.styleOptimizationService = new StyleOptimizationService(
      this.geminiAdapter,
      styleAnalysisService
    );
    this.characterDepthService = new CharacterDepthService();
    this.tensionOptimizationService = new TensionOptimizationService();

    logger.info('OptimizationCoordinator initialized', { options: this.options });
  }

  /**
   * 包括的章最適化
   * 
   * 全ての最適化サービスを使用して章の包括的な最適化提案を生成します。
   * 
   * @param content 章の内容
   * @param chapterNumber 章番号
   * @param context 生成コンテキスト
   * @param analysisResults 分析結果（AnalysisCoordinatorから）
   * @returns 統合最適化結果
   */
  async optimizeChapter(
    content: string,
    chapterNumber: number,
    context: GenerationContext,
    analysisResults: {
      themeAnalysis: ThemeResonanceAnalysis;
      styleAnalysis: StyleAnalysis;
      expressionPatterns: ExpressionPatterns;
      qualityMetrics: QualityMetrics;
      characters?: Character[];
      characterPsychologies?: { [id: string]: CharacterPsychology };
    }
  ): Promise<IntegratedOptimizationResult> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(content, chapterNumber, context);

    try {
      logger.info(`Starting comprehensive chapter optimization`, {
        chapterNumber,
        contentLength: content.length,
        parallelProcessing: this.options.enableParallelProcessing
      });

      // キャッシュチェック
      if (this.options.enableCache && this.optimizationCache.has(cacheKey)) {
        logger.info('Using cached optimization result', { chapterNumber });
        return this.optimizationCache.get(cacheKey)!;
      }

      // 最適化の実行
      const optimizationResults = this.options.enableParallelProcessing
        ? await this.executeParallelOptimization(content, chapterNumber, context, analysisResults)
        : await this.executeSequentialOptimization(content, chapterNumber, context, analysisResults);

      // 結果の統合と調整
      const integratedResult = await this.integrateOptimizationResults(
        optimizationResults,
        content,
        chapterNumber,
        context
      );

      // パフォーマンスメトリクスの記録
      const processingTime = Date.now() - startTime;
      this.recordPerformanceMetrics(chapterNumber, processingTime, integratedResult);

      // キャッシュに保存
      if (this.options.enableCache) {
        this.optimizationCache.set(cacheKey, integratedResult);
      }

      logger.info(`Chapter optimization completed`, {
        chapterNumber,
        processingTime,
        totalRecommendations: integratedResult.optimizationMetadata.totalRecommendations
      });

      return integratedResult;
    } catch (error) {
      logger.error('Comprehensive chapter optimization failed', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });

      // フォールバック最適化結果を返す
      return this.createFallbackOptimizationResult(chapterNumber, context, Date.now() - startTime);
    }
  }

  /**
   * 並列最適化の実行
   * 
   * @private
   */
  private async executeParallelOptimization(
    content: string,
    chapterNumber: number,
    context: GenerationContext,
    analysisResults: any
  ): Promise<any> {
    const optimizationPromises = [
      // テーマ最適化
      this.executeThemeOptimization(content, chapterNumber, context, analysisResults.themeAnalysis)
        .catch(error => {
          logger.warn('Theme optimization failed in parallel execution', { error });
          return null;
        }),

      // 文体最適化
      this.executeStyleOptimization(chapterNumber, context, analysisResults)
        .catch(error => {
          logger.warn('Style optimization failed in parallel execution', { error });
          return null;
        }),

      // キャラクター最適化
      this.executeCharacterOptimization(chapterNumber, context, analysisResults.characters, analysisResults.characterPsychologies)
        .catch(error => {
          logger.warn('Character optimization failed in parallel execution', { error });
          return null;
        }),

      // テンション最適化
      this.executeTensionOptimization(chapterNumber, context)
        .catch(error => {
          logger.warn('Tension optimization failed in parallel execution', { error });
          return null;
        })
    ];

    const results = await Promise.allSettled(optimizationPromises);
    return {
      themeOptimization: this.extractSettledResult(results[0]),
      styleOptimization: this.extractSettledResult(results[1]),
      characterOptimization: this.extractSettledResult(results[2]),
      tensionOptimization: this.extractSettledResult(results[3])
    };
  }

  /**
   * 逐次最適化の実行
   * 
   * @private
   */
  private async executeSequentialOptimization(
    content: string,
    chapterNumber: number,
    context: GenerationContext,
    analysisResults: any
  ): Promise<any> {
    const results: any = {};

    // 依存関係を考慮した順序で実行
    results.themeOptimization = await this.executeThemeOptimization(
      content, chapterNumber, context, analysisResults.themeAnalysis
    );
    results.styleOptimization = await this.executeStyleOptimization(
      chapterNumber, context, analysisResults
    );
    results.characterOptimization = await this.executeCharacterOptimization(
      chapterNumber, context, analysisResults.characters, analysisResults.characterPsychologies
    );
    results.tensionOptimization = await this.executeTensionOptimization(
      chapterNumber, context
    );

    return results;
  }

  /**
   * テーマ最適化の実行
   * 
   * @private
   */
  private async executeThemeOptimization(
    content: string,
    chapterNumber: number,
    context: GenerationContext,
    themeAnalysis: ThemeResonanceAnalysis
  ): Promise<any> {
    await this.themeEnhancementService.initialize();

    const themes = context.theme ? [context.theme] : Object.keys(themeAnalysis.themes || {});
    const dominantTheme = themeAnalysis.dominantTheme || themes[0] || '成長';

    // themeAnalysisを適切な形式に変換（型の互換性のため）
    const adaptedThemeAnalysis = {
      themes: themeAnalysis.themes || {},
      overallCoherence: themeAnalysis.overallCoherence || 7,
      dominantTheme: dominantTheme,
      themeTensions: {} // 空のオブジェクトで初期化
    };

    const [
      themeEnhancements,
      literaryInspirations,
      symbolicElements,
      foreshadowingOpportunities,
      literaryTechniques
    ] = await Promise.all([
      this.themeEnhancementService.generateThemeEnhancements(adaptedThemeAnalysis, chapterNumber, context).catch(() => []),
      this.themeEnhancementService.generateLiteraryInspirations(context, chapterNumber),
      this.themeEnhancementService.suggestSymbolicElements(themes, chapterNumber, context.genre),
      this.themeEnhancementService.detectForeshadowingOpportunities(content, chapterNumber, themes),
      this.themeEnhancementService.suggestLiteraryTechniquesForTheme(dominantTheme, context.genre)
    ]);

    return {
      themeEnhancements,
      literaryInspirations,
      symbolicElements,
      foreshadowingOpportunities,
      literaryTechniques
    };
  }

  /**
   * 文体最適化の実行
   * 
   * @private
   */
  private async executeStyleOptimization(
    chapterNumber: number,
    context: GenerationContext,
    analysisResults: any
  ): Promise<any> {
    const subjectPatterns: SubjectPatternOptimizationRequest = {
      repeatedSubjects: [], // 実際の実装では分析結果から取得
      subjectDiversityScore: 0.7
    };

    const [
      styleGuidance,
      expressionAlternatives,
      subjectPatternOptimization,
      structureRecommendations,
      repetitionAlternatives
    ] = await Promise.all([
      this.styleOptimizationService.generateStyleGuidance(chapterNumber, context),
      this.styleOptimizationService.suggestAlternativeExpressions(
        analysisResults.expressionPatterns || {}, context
      ),
      this.styleOptimizationService.optimizeSubjectPatterns(subjectPatterns, context),
      this.styleOptimizationService.generateStructureRecommendations(
        analysisResults.styleAnalysis, context
      ),
      this.styleOptimizationService.generateRepetitionAlternatives([], context)
    ]);

    return {
      styleGuidance,
      expressionAlternatives,
      subjectPatternOptimization,
      structureRecommendations,
      repetitionAlternatives
    };
  }

  /**
   * キャラクター最適化の実行
   * 
   * @private
   */
  private async executeCharacterOptimization(
    chapterNumber: number,
    context: GenerationContext,
    characters?: Character[],
    characterPsychologies?: { [id: string]: CharacterPsychology }
  ): Promise<any> {
    if (!characters || characters.length === 0) {
      return {
        depthRecommendations: {},
        focusCharacters: [],
        characterDepthPrompts: {}
      };
    }

    const [focusCharacters, depthRecommendations] = await Promise.all([
      this.characterDepthService.recommendFocusCharactersForChapter(chapterNumber, 3),
      this.characterDepthService.generateMultipleCharacterRecommendations(
        characters, chapterNumber, this.options.maxRecommendationsPerCategory
      )
    ]);

    // 焦点キャラクターの深化プロンプト生成
    const characterDepthPrompts: { [characterId: string]: CharacterDepthPrompt } = {};
    for (const characterId of focusCharacters) {
      const prompt = await this.characterDepthService.generateDepthPromptForChapter(
        characterId, chapterNumber
      );
      if (prompt) {
        characterDepthPrompts[characterId] = prompt;
      }
    }

    return {
      depthRecommendations,
      focusCharacters,
      characterDepthPrompts
    };
  }

  /**
   * テンション最適化の実行
   * 
   * @private
   */
  private async executeTensionOptimization(
    chapterNumber: number,
    context: GenerationContext
  ): Promise<any> {
    await this.tensionOptimizationService.initialize();

    const totalChapters = context.totalChapters || 20;
    const currentTension = context.tension || 0.5;

    const [
      tensionPacingRecommendation,
      tensionOptimizationSuggestions,
      tensionCurve,
      climaxRecommendation
    ] = await Promise.all([
      this.tensionOptimizationService.getTensionPacingRecommendation(
        chapterNumber, context.genre
      ),
      this.tensionOptimizationService.generateTensionOptimizationSuggestions(
        chapterNumber, currentTension
      ),
      this.tensionOptimizationService.generateTensionCurve(totalChapters, context.genre),
      this.tensionOptimizationService.recommendClimax(totalChapters, context.genre)
    ]);

    return {
      tensionPacingRecommendation,
      tensionOptimizationSuggestions,
      tensionCurve,
      climaxRecommendation
    };
  }

  /**
   * 最適化結果の統合
   * 
   * @private
   */
  private async integrateOptimizationResults(
    optimizationResults: any,
    content: string,
    chapterNumber: number,
    context: GenerationContext
  ): Promise<IntegratedOptimizationResult> {
    try {
      // 統合推奨の生成
      const integratedRecommendations = await this.generateIntegratedRecommendations(
        optimizationResults, chapterNumber, context
      );

      // 最適化メタデータの構築
      const optimizationMetadata = {
        optimizationTimestamp: new Date().toISOString(),
        servicesUsed: this.getUsedServices(optimizationResults),
        processingTime: 0, // 後で設定
        totalRecommendations: this.countTotalRecommendations(optimizationResults, integratedRecommendations),
        highPriorityCount: this.countByPriority(integratedRecommendations.prioritizedSuggestions, 'high'),
        mediumPriorityCount: this.countByPriority(integratedRecommendations.prioritizedSuggestions, 'medium'),
        lowPriorityCount: this.countByPriority(integratedRecommendations.prioritizedSuggestions, 'low')
      };

      return {
        themeOptimization: optimizationResults.themeOptimization || this.createFallbackThemeOptimization(),
        styleOptimization: optimizationResults.styleOptimization || this.createFallbackStyleOptimization(),
        characterOptimization: optimizationResults.characterOptimization || this.createFallbackCharacterOptimization(),
        tensionOptimization: optimizationResults.tensionOptimization || this.createFallbackTensionOptimization(),
        integratedRecommendations,
        optimizationMetadata
      };
    } catch (error) {
      logger.error('Failed to integrate optimization results', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 統合推奨の生成
   * 
   * @private
   */
  private async generateIntegratedRecommendations(
    optimizationResults: any,
    chapterNumber: number,
    context: GenerationContext
  ): Promise<{
    prioritizedSuggestions: PrioritizedSuggestion[];
    conflictResolutions: ConflictResolution[];
    implementationOrder: ImplementationStep[];
    synergisticOpportunities: SynergyOpportunity[];
  }> {
    try {
      // 全推奨を収集
      const allSuggestions = this.collectAllSuggestions(optimizationResults);

      // 優先度付け
      const prioritizedSuggestions = this.prioritizeSuggestions(allSuggestions);

      // 矛盾解決
      const conflictResolutions = this.options.enableConflictResolution
        ? this.resolveConflicts(prioritizedSuggestions)
        : [];

      // 実装順序の決定
      const implementationOrder = this.determineImplementationOrder(prioritizedSuggestions);

      // 相乗効果の検出
      const synergisticOpportunities = this.options.enableSynergyDetection
        ? this.detectSynergies(prioritizedSuggestions)
        : [];

      return {
        prioritizedSuggestions,
        conflictResolutions,
        implementationOrder,
        synergisticOpportunities
      };
    } catch (error) {
      logger.error('Failed to generate integrated recommendations', {
        error: error instanceof Error ? error.message : String(error)
      });

      // フォールバック推奨を返す
      return {
        prioritizedSuggestions: this.createFallbackPrioritizedSuggestions(),
        conflictResolutions: [],
        implementationOrder: this.createFallbackImplementationOrder(),
        synergisticOpportunities: []
      };
    }
  }

  /**
   * 全推奨の収集
   * 
   * @private
   */
  private collectAllSuggestions(optimizationResults: any): PrioritizedSuggestion[] {
    const suggestions: PrioritizedSuggestion[] = [];
    let suggestionId = 1;

    // テーマ推奨
    if (optimizationResults.themeOptimization?.themeEnhancements) {
      optimizationResults.themeOptimization.themeEnhancements.forEach((enhancement: any) => {
        suggestions.push({
          id: `theme-${suggestionId++}`,
          category: 'theme',
          title: enhancement.suggestion || 'テーマ強化',
          description: enhancement.approach || 'テーマをより効果的に表現',
          implementation: enhancement.example || '具体的な実装方法',
          priority: this.determinePriority(enhancement.currentStrength || 0.5),
          impact: enhancement.currentStrength || 0.5,
          effort: 0.3,
          dependencies: [],
          relatedSuggestions: []
        });
      });
    }

    // 文体推奨
    if (optimizationResults.styleOptimization?.styleGuidance) {
      const guidance = optimizationResults.styleOptimization.styleGuidance;
      [...(guidance.general || []), ...(guidance.vocabulary || [])].forEach((suggestion: string) => {
        suggestions.push({
          id: `style-${suggestionId++}`,
          category: 'style',
          title: '文体改善',
          description: suggestion,
          implementation: '文章作成時に意識して適用',
          priority: 'medium',
          impact: 0.6,
          effort: 0.4,
          dependencies: [],
          relatedSuggestions: []
        });
      });
    }

    // キャラクター推奨
    if (optimizationResults.characterOptimization?.depthRecommendations) {
      const depthRecommendations = optimizationResults.characterOptimization.depthRecommendations;

      // 型安全にObject.entriesを処理
      for (const [charId, recommendations] of Object.entries(depthRecommendations)) {
        // 型ガードでrecommendationsが配列であることを確認
        if (Array.isArray(recommendations)) {
          recommendations.forEach((rec: any) => {
            suggestions.push({
              id: `character-${suggestionId++}`,
              category: 'character',
              title: rec.title || 'キャラクター深化',
              description: rec.description || 'キャラクターの深みを向上',
              implementation: rec.implementation || '具体的な実装方法',
              priority: this.determinePriority(rec.priority || 0.5),
              impact: rec.priority || 0.5,
              effort: 0.5,
              dependencies: [],
              relatedSuggestions: []
            });
          });
        }
      }
    }

    // テンション推奨
    if (optimizationResults.tensionOptimization?.tensionOptimizationSuggestions) {
      optimizationResults.tensionOptimization.tensionOptimizationSuggestions.forEach((suggestion: string) => {
        suggestions.push({
          id: `tension-${suggestionId++}`,
          category: 'tension',
          title: 'テンション調整',
          description: suggestion,
          implementation: '章の構成やペース配分を調整',
          priority: 'medium',
          impact: 0.7,
          effort: 0.6,
          dependencies: [],
          relatedSuggestions: []
        });
      });
    }

    return suggestions;
  }

  /**
   * 推奨の優先度付け
   * 
   * @private
   */
  private prioritizeSuggestions(suggestions: PrioritizedSuggestion[]): PrioritizedSuggestion[] {
    const strategy = this.options.prioritizationStrategy || 'balanced';

    return suggestions.sort((a, b) => {
      switch (strategy) {
        case 'impact':
          return b.impact - a.impact;
        case 'effort':
          return a.effort - b.effort;
        case 'balanced':
        default:
          const aScore = (a.impact * 0.7) - (a.effort * 0.3);
          const bScore = (b.impact * 0.7) - (b.effort * 0.3);
          return bScore - aScore;
      }
    }).slice(0, this.options.maxRecommendationsPerCategory! * 4); // 全カテゴリ合計の制限
  }

  /**
   * 矛盾解決
   * 
   * @private
   */
  private resolveConflicts(suggestions: PrioritizedSuggestion[]): ConflictResolution[] {
    const conflicts: ConflictResolution[] = [];

    // 簡単な矛盾検出ロジック
    for (let i = 0; i < suggestions.length; i++) {
      for (let j = i + 1; j < suggestions.length; j++) {
        const conflict = this.detectConflict(suggestions[i], suggestions[j]);
        if (conflict) {
          conflicts.push(conflict);
        }
      }
    }

    return conflicts;
  }

  /**
   * 矛盾検出
   * 
   * @private
   */
  private detectConflict(sugA: PrioritizedSuggestion, sugB: PrioritizedSuggestion): ConflictResolution | null {
    // 例: 文体とテンションの矛盾
    if (sugA.category === 'style' && sugB.category === 'tension') {
      if (sugA.description.includes('ゆっくり') && sugB.description.includes('テンポを上げ')) {
        return {
          conflictType: 'contradiction',
          description: '文体とテンションの方向性が矛盾している',
          conflictingSuggestions: [sugA.id, sugB.id],
          resolution: 'バランスの取れたアプローチを採用',
          recommendedAction: '場面に応じてテンポを使い分ける'
        };
      }
    }

    return null;
  }

  /**
   * 実装順序の決定
   * 
   * @private
   */
  private determineImplementationOrder(suggestions: PrioritizedSuggestion[]): ImplementationStep[] {
    const steps: ImplementationStep[] = [
      {
        step: 1,
        phase: 'preparation',
        suggestions: suggestions.filter(s => s.category === 'character' && s.priority === 'high').map(s => s.id),
        description: 'キャラクター基盤の強化',
        estimatedEffort: 'medium'
      },
      {
        step: 2,
        phase: 'core_implementation',
        suggestions: suggestions.filter(s => s.category === 'theme' || s.category === 'tension').map(s => s.id),
        description: 'テーマとテンションの最適化',
        estimatedEffort: 'high'
      },
      {
        step: 3,
        phase: 'refinement',
        suggestions: suggestions.filter(s => s.category === 'style').map(s => s.id),
        description: '文体の調整と洗練',
        estimatedEffort: 'medium'
      },
      {
        step: 4,
        phase: 'validation',
        suggestions: suggestions.filter(s => s.priority === 'low').map(s => s.id),
        description: '最終調整と品質確認',
        estimatedEffort: 'low'
      }
    ];

    return steps.filter(step => step.suggestions.length > 0);
  }

  /**
   * 相乗効果の検出
   * 
   * @private
   */
  private detectSynergies(suggestions: PrioritizedSuggestion[]): SynergyOpportunity[] {
    const synergies: SynergyOpportunity[] = [];

    // テーマとキャラクターの相乗効果
    const themeSuggestions = suggestions.filter(s => s.category === 'theme');
    const characterSuggestions = suggestions.filter(s => s.category === 'character');

    if (themeSuggestions.length > 0 && characterSuggestions.length > 0) {
      synergies.push({
        title: 'テーマとキャラクター深化の統合',
        description: 'キャラクターの成長をテーマの表現手段として活用',
        involvedSuggestions: [
          ...themeSuggestions.slice(0, 2).map(s => s.id),
          ...characterSuggestions.slice(0, 2).map(s => s.id)
        ],
        synergisticBenefit: 'テーマの表現がより自然で説得力のあるものになる',
        implementationApproach: 'キャラクターの行動や選択を通じてテーマを体現させる'
      });
    }

    return synergies;
  }

  // =========================================================================
  // ユーティリティメソッド群
  // =========================================================================

  private extractSettledResult<T>(result: PromiseSettledResult<T>): T | null {
    return result.status === 'fulfilled' ? result.value : null;
  }

  private getUsedServices(optimizationResults: any): string[] {
    const services: string[] = [];
    if (optimizationResults.themeOptimization) services.push('ThemeEnhancement');
    if (optimizationResults.styleOptimization) services.push('StyleOptimization');
    if (optimizationResults.characterOptimization) services.push('CharacterDepth');
    if (optimizationResults.tensionOptimization) services.push('TensionOptimization');
    return services;
  }

  private countTotalRecommendations(optimizationResults: any, integratedRecommendations: any): number {
    return integratedRecommendations.prioritizedSuggestions?.length || 0;
  }

  private countByPriority(suggestions: PrioritizedSuggestion[], priority: string): number {
    return suggestions.filter(s => s.priority === priority).length;
  }

  private determinePriority(score: number): 'high' | 'medium' | 'low' {
    if (score >= 0.7) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  private generateCacheKey(content: string, chapterNumber: number, context: GenerationContext): string {
    const contentHash = this.hashString(content.substring(0, 1000));
    const contextHash = this.hashString(JSON.stringify(context));
    return `optimization-${chapterNumber}-${contentHash}-${contextHash}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  private recordPerformanceMetrics(
    chapterNumber: number,
    processingTime: number,
    result: IntegratedOptimizationResult
  ): void {
    result.optimizationMetadata.processingTime = processingTime;
    this.performanceMetrics.set(`chapter-${chapterNumber}-processingTime`, processingTime);
  }

  /**
   * キャッシュクリア
   */
  clearCache(): void {
    this.optimizationCache.clear();
    this.performanceMetrics.clear();
    logger.info('All optimization caches cleared');
  }

  // =========================================================================
  // フォールバックメソッド群
  // =========================================================================

  private createFallbackOptimizationResult(
    chapterNumber: number,
    context: GenerationContext,
    processingTime: number
  ): IntegratedOptimizationResult {
    return {
      themeOptimization: this.createFallbackThemeOptimization(),
      styleOptimization: this.createFallbackStyleOptimization(),
      characterOptimization: this.createFallbackCharacterOptimization(),
      tensionOptimization: this.createFallbackTensionOptimization(),
      integratedRecommendations: {
        prioritizedSuggestions: this.createFallbackPrioritizedSuggestions(),
        conflictResolutions: [],
        implementationOrder: this.createFallbackImplementationOrder(),
        synergisticOpportunities: []
      },
      optimizationMetadata: {
        optimizationTimestamp: new Date().toISOString(),
        servicesUsed: ['Fallback'],
        processingTime,
        totalRecommendations: 3,
        highPriorityCount: 1,
        mediumPriorityCount: 2,
        lowPriorityCount: 0
      }
    };
  }

  private createFallbackThemeOptimization(): any {
    return {
      themeEnhancements: [],
      literaryInspirations: {
        plotTechniques: [],
        characterTechniques: [],
        atmosphereTechniques: []
      },
      symbolicElements: [],
      foreshadowingOpportunities: [],
      literaryTechniques: []
    };
  }

  private createFallbackStyleOptimization(): any {
    return {
      styleGuidance: {
        general: ['文体の一貫性を保ってください'],
        sentenceStructure: ['文の長さに変化をつけてください'],
        vocabulary: ['語彙を豊かにしてください'],
        rhythm: ['リズム感を意識してください']
      },
      expressionAlternatives: {},
      subjectPatternOptimization: {
        score: 0.7,
        problems: [],
        suggestions: []
      },
      structureRecommendations: [],
      repetitionAlternatives: []
    };
  }

  private createFallbackCharacterOptimization(): any {
    return {
      depthRecommendations: {},
      focusCharacters: [],
      characterDepthPrompts: {}
    };
  }

  private createFallbackTensionOptimization(): any {
    return {
      tensionPacingRecommendation: {
        tension: { recommendedTension: 0.5, reason: 'デフォルト値', direction: 'maintain' },
        pacing: { recommendedPacing: 0.5, description: 'バランスの取れたペース' }
      },
      tensionOptimizationSuggestions: ['適切なテンション管理を心がけてください'],
      tensionCurve: [],
      climaxRecommendation: { climaxChapter: 15, secondaryClimaxChapters: [], reason: 'デフォルト推奨' }
    };
  }

  private createFallbackPrioritizedSuggestions(): PrioritizedSuggestion[] {
    return [
      {
        id: 'fallback-1',
        category: 'integrated',
        title: '全体的な品質向上',
        description: '章の内容を全体的に見直し、品質を向上させてください',
        implementation: '各要素のバランスを確認し、必要に応じて調整',
        priority: 'high',
        impact: 0.8,
        effort: 0.6,
        dependencies: [],
        relatedSuggestions: []
      }
    ];
  }

  private createFallbackImplementationOrder(): ImplementationStep[] {
    return [
      {
        step: 1,
        phase: 'core_implementation',
        suggestions: ['fallback-1'],
        description: '基本的な改善の実施',
        estimatedEffort: 'medium'
      }
    ];
  }
}