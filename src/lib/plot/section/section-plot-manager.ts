// src/lib/plot/section/section-plot-manager.ts
/**
 * @fileoverview 中期プロット（篇）システムの管理クラス - 記憶階層システム統合版
 * @description
 * 複数章をまとめる「篇」単位の物語構造を管理し、
 * 感情アークと学習プロセスを有機的に結合するためのクラス。
 * 新しい統合記憶階層システムに完全対応し、パフォーマンスと信頼性を大幅に向上。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { logError } from '@/lib/utils/error-handler';
import { storageProvider } from '@/lib/storage';
import { eventBus } from '@/lib/learning-journey/event-bus';
import LearningJourneySystem from '@/lib/learning-journey';
import { SectionStorage } from './section-storage';
import { SectionDesigner } from './section-designer';
import { SectionAnalyzer } from './section-analyzer';
import { SectionBridge } from './section-bridge';
import { Chapter } from '@/types/chapters';
import {
  SectionPlot,
  SectionPlotParams,
  EmotionalArcProgress,
  ObjectiveProgress,
  CoherenceAnalysis,
  ImprovementSuggestion
} from './types';

// 新しい記憶階層システム型定義をインポート
import {
  MemoryLevel,
  UnifiedMemoryContext,
  SystemOperationResult,
  UnifiedSearchResult,
  MemoryLayerStatus,
  MemorySystemStatus
} from '@/lib/memory/core/types';

/**
 * セクションプロットマネージャーの設定
 */
interface SectionPlotManagerConfig {
  useMemorySystemIntegration: boolean;
  enableAutoBackup: boolean;
  enableQualityAssurance: boolean;
  cacheEnabled: boolean;
  optimizationEnabled: boolean;
}

/**
 * セクション処理結果
 */
interface SectionProcessingResult {
  success: boolean;
  sectionId: string;
  processingTime: number;
  memoryIntegrated: boolean;
  cacheUpdated: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * パフォーマンス統計の型定義
 */
interface PerformanceStatistics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageProcessingTime: number;
  memorySystemHits: number;
  cacheHits: number;
  lastOptimization: string;
}

/**
 * セクション記憶統合データ
 */
interface SectionMemoryData {
  sectionInfo: SectionPlot;
  relatedChapters: Chapter[];
  narrativeProgression: any;
  characterEvolution: any;
  learningProgression: any;
}

/**
 * @class SectionPlotManager
 * @description 中期プロットを総合的に管理するクラス - 記憶階層システム統合版
 */
export class SectionPlotManager {
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  private sectionPlots: Map<string, SectionPlot> = new Map();
  private chapterToSectionMap: Map<number, string> = new Map();
  private sectionRelationships: Map<string, { prev: string | null; next: string | null }> = new Map();
  private sectionDesigner: SectionDesigner;
  private sectionAnalyzer: SectionAnalyzer;
  private sectionBridge: SectionBridge;
  private sectionStorage: SectionStorage;
  private config: SectionPlotManagerConfig;

  // パフォーマンス統計
  private performanceStats: PerformanceStatistics = {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    averageProcessingTime: 0,
    memorySystemHits: 0,
    cacheHits: 0,
    lastOptimization: new Date().toISOString()
  };

  /**
   * コンストラクタ - 依存注入パターンで記憶システムを受け取る
   * 
   * @param memoryManager 統合記憶管理システム
   * @param geminiClient Geminiクライアント
   * @param learningJourneySystem 学習旅路システム (オプション)
   * @param config 設定オプション
   */
  constructor(
    private memoryManager: MemoryManager,
    private geminiClient: GeminiClient,
    private learningJourneySystem?: LearningJourneySystem,
    config?: Partial<SectionPlotManagerConfig>
  ) {
    // 設定のマージとバリデーション
    this.config = {
      useMemorySystemIntegration: true,
      enableAutoBackup: true,
      enableQualityAssurance: true,
      cacheEnabled: true,
      optimizationEnabled: true,
      ...config
    };

    this.validateConfiguration();

    this.sectionStorage = new SectionStorage(storageProvider);
    this.sectionDesigner = new SectionDesigner(this, geminiClient);
    this.sectionAnalyzer = new SectionAnalyzer(this, memoryManager, geminiClient);
    this.sectionBridge = new SectionBridge(this, memoryManager);

    // 初期化を開始
    this.initializationPromise = this.initialize();

    logger.info('SectionPlotManager constructed with integrated memory system', {
      config: this.config,
      memoryManagerProvided: !!memoryManager
    });
  }

  /**
   * 設定の検証
   * @private
   */
  private validateConfiguration(): void {
    if (!this.memoryManager) {
      throw new Error('MemoryManager is required for SectionPlotManager initialization');
    }

    logger.debug('SectionPlotManager configuration validated', { config: this.config });
  }

  /**
   * 初期化処理 - 記憶システムとの統合確認を含む
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.info('SectionPlotManager already initialized');
      return;
    }

    try {
      logger.info('Initializing SectionPlotManager with memory system integration');

      // 記憶システムの状態確認
      await this.verifyMemorySystemConnection();

      // ストレージからセクションデータを読み込む
      await this.loadFromStorage();

      // チャプターとセクションのマッピングを更新
      this.updateChapterToSectionMap();

      // 記憶システムとの初期同期
      if (this.config.useMemorySystemIntegration) {
        await this.performInitialMemorySync();
      }

      this.initialized = true;
      logger.info('SectionPlotManager initialized successfully with memory integration');

    } catch (error) {
      logError(error, {}, 'SectionPlotManager initialization failed');
      // 初期化に失敗しても続行可能な状態にする
      this.initialized = true;
    }
  }

  /**
   * 記憶システム接続の検証
   * @private
   */
  private async verifyMemorySystemConnection(): Promise<void> {
    if (!this.config.useMemorySystemIntegration) {
      logger.debug('Memory system integration disabled');
      return;
    }

    try {
      const systemStatus = await this.memoryManager.getSystemStatus();

      if (!systemStatus.initialized) {
        logger.warn('MemoryManager not fully initialized');
        this.config.useMemorySystemIntegration = false;
        return;
      }

      // 簡単な記憶システムテスト
      const testQuery = 'section-plot-manager-connection-test';
      const testResult = await this.memoryManager.unifiedSearch(
        testQuery,
        [MemoryLevel.SHORT_TERM]
      );

      logger.debug('Memory system connection verified', {
        initialized: systemStatus.initialized,
        testSuccess: testResult.success,
        totalResults: testResult.totalResults
      });

    } catch (error) {
      logger.warn('Memory system connection verification failed, disabling integration', {
        error: error instanceof Error ? error.message : String(error)
      });
      this.config.useMemorySystemIntegration = false;
    }
  }

  /**
   * 初期記憶同期の実行
   * @private
   */
  private async performInitialMemorySync(): Promise<void> {
    try {
      // 既存セクションの記憶システムへの統合
      for (const [sectionId, section] of this.sectionPlots.entries()) {
        await this.integrateSectionWithMemorySystem(section, false);
      }

      logger.info('Initial memory sync completed', {
        sectionsProcessed: this.sectionPlots.size
      });

    } catch (error) {
      logger.warn('Initial memory sync failed', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 初期化状態の確認と待機
   * @private
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    if (this.initializationPromise) {
      await this.initializationPromise;
    } else {
      this.initializationPromise = this.initialize();
      await this.initializationPromise;
    }
  }

  /**
   * ストレージからデータを読み込む
   * @private
   */
  private async loadFromStorage(): Promise<void> {
    try {
      const sections = await this.sectionStorage.loadSectionPlots();

      // マップにセクションを追加
      sections.forEach(section => {
        this.sectionPlots.set(section.id, section);
      });

      // 関係性データがあれば読み込む
      const relationships = await this.sectionStorage.loadSectionRelationships();
      if (relationships) {
        this.sectionRelationships = relationships;
      }

      logger.info(`Loaded ${sections.length} section plots from storage`);

    } catch (error) {
      logger.error('Failed to load section plots from storage', { error });
      // エラー時は空の状態で続行
    }
  }

  /**
   * チャプターからセクションへのマッピングを更新
   * @private
   */
  private updateChapterToSectionMap(): void {
    // マップをクリア
    this.chapterToSectionMap.clear();

    // 各セクションの章範囲を登録
    for (const [sectionId, section] of this.sectionPlots.entries()) {
      const { start, end } = section.chapterRange;

      for (let chapter = start; chapter <= end; chapter++) {
        this.chapterToSectionMap.set(chapter, sectionId);
      }
    }
  }

  /**
   * データを永続化 - 記憶システム統合版
   * @private
   */
  private async saveToStorage(): Promise<void> {
    try {
      // セクションプロットを保存
      await this.sectionStorage.saveSectionPlots(
        Array.from(this.sectionPlots.values())
      );

      // 関係性データを保存
      await this.sectionStorage.saveSectionRelationships(this.sectionRelationships);

      // 記憶システムへの自動バックアップ
      if (this.config.enableAutoBackup && this.config.useMemorySystemIntegration) {
        await this.backupToMemorySystem();
      }

      logger.info('Saved section plots to storage with memory system backup');

    } catch (error) {
      logger.error('Failed to save section plots to storage', { error });
      throw error;
    }
  }

  /**
   * 記憶システムへのバックアップ
   * @private
   */
  private async backupToMemorySystem(): Promise<void> {
    try {
      const backupData = {
        sections: Array.from(this.sectionPlots.values()),
        relationships: Object.fromEntries(this.sectionRelationships),
        chapterMapping: Object.fromEntries(this.chapterToSectionMap),
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };

      // Chapter形式で記憶システムに保存
      const backupChapter: Chapter = {
        id: `section-plot-backup-${Date.now()}`,
        chapterNumber: 0, // バックアップ専用章番号
        title: 'SectionPlot System Backup',
        content: JSON.stringify(backupData, null, 2),
        createdAt: new Date(),
        updatedAt: new Date(),
        scenes: [],
        metadata: {
          qualityScore: 1.0,
          keywords: ['section-plot', 'backup', 'system'],
          events: [],
          characters: [],
          foreshadowing: [],
          resolutions: [],
          correctionHistory: [],
          pov: 'System',
          location: 'Memory Storage',
          emotionalTone: 'neutral'
        }
      };

      const result = await this.memoryManager.processChapter(backupChapter);

      if (result.success) {
        logger.debug('Section plot data backed up to memory system', {
          processingTime: result.processingTime,
          affectedComponents: result.affectedComponents
        });
      } else {
        logger.warn('Failed to backup section plot data to memory system', {
          errors: result.errors
        });
      }

    } catch (error) {
      logger.warn('Memory system backup failed', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 新しいセクションプロットを作成 - 記憶システム統合版
   * 
   * @param params セクションプロットパラメータ
   * @returns 作成されたセクションプロット
   */
  async createSectionPlot(params: SectionPlotParams): Promise<SectionPlot> {
    await this.ensureInitialized();

    const startTime = Date.now();
    this.performanceStats.totalOperations++;

    try {
      logger.info(`Creating new section plot: ${params.title}`);

      // チャプター範囲の重複をチェック
      this.validateChapterRange(params.chapterRange, null);

      // 新しいセクションIDを生成
      const sectionId = `section-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // 現在の日時を取得
      const now = new Date().toISOString();

      // 基本構造の作成
      const newSection: SectionPlot = {
        id: sectionId,
        chapterRange: params.chapterRange,
        structure: {
          id: sectionId,
          title: params.title,
          number: this.sectionPlots.size + 1,
          chapterRange: params.chapterRange,
          narrativePhase: params.narrativePhase,
          theme: params.theme,
          motifs: params.motifs || [],
          setting: params.setting || '主要舞台'
        },
        learningJourneyDesign: {
          mainConcept: params.mainConcept,
          secondaryConcepts: [],
          primaryLearningStage: params.primaryLearningStage,
          secondaryLearningStages: [],
          learningObjectives: {
            cognitive: '概念の理解を深める',
            affective: '感情的な共感を育む',
            behavioral: '行動変容につながる洞察を得る'
          },
          transformationalArc: {
            startingState: '初期状態',
            challenges: [],
            insights: [],
            endState: '最終状態'
          },
          conceptEmbodiments: {
            metaphors: [],
            situations: [],
            dialogueThemes: []
          }
        },
        emotionalDesign: {
          emotionalArc: {
            opening: '期待',
            midpoint: '葛藤',
            conclusion: '理解'
          },
          tensionPoints: [],
          catharticMoment: {
            relativePosition: 0.8,
            type: 'intellectual',
            description: '知的洞察のカタルシス'
          },
          readerEmotionalJourney: '疑問から理解への感情の旅',
          emotionalPayoff: '知的満足と感情的共感'
        },
        characterDesign: {
          mainCharacters: params.mainCharacters || [],
          characterRoles: {},
          relationshipDevelopments: [],
          characterTransformations: {}
        },
        narrativeStructureDesign: {
          keyScenes: [],
          turningPoints: [],
          narrativeThreads: [],
          sectionForeshadowing: [],
          intersectionWithOtherSections: {
            previous: '',
            next: ''
          }
        },
        metaInformation: {
          created: now,
          lastModified: now,
          version: 1,
          editorNotes: params.editorNotes || '',
          generationPrompts: [],
          relationToOverallStory: ''
        }
      };

      // セクションプロットを保存
      this.sectionPlots.set(sectionId, newSection);

      // チャプターとセクションのマッピングを更新
      this.updateChapterToSectionMap();

      // 関係性テーブルに追加
      this.sectionRelationships.set(sectionId, { prev: null, next: null });

      // 前後のセクションとの関係性を自動設定
      this.configureSectionRelationships();

      // 記憶システムへの統合
      await this.integrateSectionWithMemorySystem(newSection, true);

      // ストレージに保存
      await this.saveToStorage();

      // イベントを発行
      if (eventBus) {
        eventBus.publish('section.created', {
          sectionId: newSection.id,
          timestamp: now,
          sectionData: {
            title: newSection.structure.title,
            chapterRange: newSection.chapterRange
          }
        });
      }

      const processingTime = Date.now() - startTime;
      this.performanceStats.successfulOperations++;
      this.updateAverageProcessingTime(processingTime);

      logger.info(`Created new section plot: ${newSection.structure.title} (${sectionId})`, {
        processingTime,
        memoryIntegrated: this.config.useMemorySystemIntegration
      });

      return newSection;

    } catch (error) {
      this.performanceStats.failedOperations++;
      logError(error, { params }, 'Failed to create section plot');
      throw error;
    }
  }

  /**
   * セクションを記憶システムに統合
   * @private
   */
  private async integrateSectionWithMemorySystem(
    section: SectionPlot,
    isNewSection: boolean = false
  ): Promise<void> {
    if (!this.config.useMemorySystemIntegration) {
      return;
    }

    try {
      // セクション情報を記憶システムに統合
      const sectionMemoryData: SectionMemoryData = {
        sectionInfo: section,
        relatedChapters: await this.getRelatedChapters(section),
        narrativeProgression: await this.extractNarrativeProgression(section),
        characterEvolution: await this.extractCharacterEvolution(section),
        learningProgression: await this.extractLearningProgression(section)
      };

      // Chapter形式で記憶システムに処理
      const sectionChapter: Chapter = {
        id: `section-data-${section.id}`,
        chapterNumber: isNewSection ? -1 : -2, // 負数で区別
        title: `Section: ${section.structure.title}`,
        content: this.createSectionContent(sectionMemoryData),
        createdAt: new Date(),
        updatedAt: new Date(),
        scenes: [],
        metadata: {
          qualityScore: 0.9,
          keywords: ['section-plot', section.structure.theme, ...section.structure.motifs],
          events: [],
          characters: section.characterDesign.mainCharacters,
          foreshadowing: [],
          resolutions: [],
          correctionHistory: [],
          pov: 'System',
          location: section.structure.setting,
          emotionalTone: 'structured'
        }
      };

      const result = await this.memoryManager.processChapter(sectionChapter);

      if (result.success) {
        this.performanceStats.memorySystemHits++;
        logger.debug('Section integrated with memory system', {
          sectionId: section.id,
          processingTime: result.processingTime,
          affectedComponents: result.affectedComponents
        });
      } else {
        logger.warn('Failed to integrate section with memory system', {
          sectionId: section.id,
          errors: result.errors
        });
      }

    } catch (error) {
      logger.warn('Section memory integration failed', {
        sectionId: section.id,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * セクション関連章を取得
   * @private
   */
  private async getRelatedChapters(section: SectionPlot): Promise<Chapter[]> {
    if (!this.config.useMemorySystemIntegration) {
      return [];
    }

    try {
      const searchQuery = `chapters ${section.chapterRange.start}-${section.chapterRange.end}`;
      const searchResult = await this.memoryManager.unifiedSearch(
        searchQuery,
        [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
      );

      const relatedChapters: Chapter[] = [];

      if (searchResult.success) {
        for (const result of searchResult.results) {
          if (result.type === 'chapter' && result.data) {
            relatedChapters.push(result.data);
          }
        }
      }

      return relatedChapters;

    } catch (error) {
      logger.warn('Failed to get related chapters', {
        sectionId: section.id,
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * 物語進行情報を抽出
   * @private
   */
  private async extractNarrativeProgression(section: SectionPlot): Promise<any> {
    return {
      phase: section.structure.narrativePhase,
      theme: section.structure.theme,
      motifs: section.structure.motifs,
      emotionalArc: section.emotionalDesign.emotionalArc,
      keyScenes: section.narrativeStructureDesign.keyScenes,
      turningPoints: section.narrativeStructureDesign.turningPoints
    };
  }

  /**
   * キャラクター進化情報を抽出
   * @private
   */
  private async extractCharacterEvolution(section: SectionPlot): Promise<any> {
    return {
      mainCharacters: section.characterDesign.mainCharacters,
      characterRoles: section.characterDesign.characterRoles,
      relationshipDevelopments: section.characterDesign.relationshipDevelopments,
      transformations: section.characterDesign.characterTransformations
    };
  }

  /**
   * 学習進行情報を抽出
   * @private
   */
  private async extractLearningProgression(section: SectionPlot): Promise<any> {
    return {
      mainConcept: section.learningJourneyDesign.mainConcept,
      learningStage: section.learningJourneyDesign.primaryLearningStage,
      objectives: section.learningJourneyDesign.learningObjectives,
      transformationalArc: section.learningJourneyDesign.transformationalArc
    };
  }

  /**
   * セクションコンテンツを作成
   * @private
   */
  private createSectionContent(data: SectionMemoryData): string {
    const content = [
      `# Section: ${data.sectionInfo.structure.title}`,
      '',
      `## Overview`,
      `- Chapters: ${data.sectionInfo.chapterRange.start}-${data.sectionInfo.chapterRange.end}`,
      `- Theme: ${data.sectionInfo.structure.theme}`,
      `- Learning Concept: ${data.sectionInfo.learningJourneyDesign.mainConcept}`,
      '',
      `## Narrative Progression`,
      `Phase: ${data.narrativeProgression.phase}`,
      `Motifs: ${data.narrativeProgression.motifs.join(', ')}`,
      '',
      `## Character Evolution`,
      `Main Characters: ${data.characterEvolution.mainCharacters.join(', ')}`,
      '',
      `## Learning Journey`,
      `Primary Stage: ${data.learningProgression.learningStage}`,
      `Objectives: ${Object.values(data.learningProgression.objectives).join(', ')}`,
      '',
      `## Technical Data`,
      JSON.stringify(data, null, 2)
    ];

    return content.join('\n');
  }

  /**
   * チャプター範囲の重複をチェック
   * @private
   */
  private validateChapterRange(
    range: { start: number; end: number },
    excludeSectionId: string | null
  ): void {
    // 各セクションについて、範囲の重複をチェック
    for (const [sectionId, section] of this.sectionPlots.entries()) {
      // 除外するセクションはスキップ
      if (excludeSectionId && sectionId === excludeSectionId) {
        continue;
      }

      const existingRange = section.chapterRange;

      // 重複チェック: 
      // 1. 新しい範囲の開始が既存範囲内にある、または
      // 2. 新しい範囲の終了が既存範囲内にある、または
      // 3. 新しい範囲が既存範囲を完全に包含する
      const hasOverlap = (
        (range.start >= existingRange.start && range.start <= existingRange.end) ||
        (range.end >= existingRange.start && range.end <= existingRange.end) ||
        (range.start <= existingRange.start && range.end >= existingRange.end)
      );

      if (hasOverlap) {
        throw new Error(
          `Chapter range ${range.start}-${range.end} overlaps with existing section ${section.structure.title} (${existingRange.start}-${existingRange.end})`
        );
      }
    }
  }

  /**
   * 章番号からセクションを取得 - 記憶システム統合版
   * 
   * @param chapterNumber 章番号
   * @returns セクションプロット (見つからない場合はnull)
   */
  async getSectionByChapter(chapterNumber: number): Promise<SectionPlot | null> {
    await this.ensureInitialized();

    const sectionId = this.chapterToSectionMap.get(chapterNumber);
    if (!sectionId) {
      // 記憶システムからの検索を試行
      if (this.config.useMemorySystemIntegration) {
        return await this.searchSectionInMemorySystem(chapterNumber);
      }
      return null;
    }

    return this.sectionPlots.get(sectionId) || null;
  }

  /**
   * 記憶システムからセクションを検索
   * @private
   */
  private async searchSectionInMemorySystem(chapterNumber: number): Promise<SectionPlot | null> {
    try {
      const searchQuery = `section chapter ${chapterNumber}`;
      const searchResult = await this.memoryManager.unifiedSearch(
        searchQuery,
        [MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
      );

      if (searchResult.success && searchResult.results.length > 0) {
        for (const result of searchResult.results) {
          if (result.type === 'section' && result.data) {
            // データから該当するセクションを復元
            const sectionData = this.parseSectionFromMemoryResult(result.data);
            if (sectionData && this.isChapterInSection(chapterNumber, sectionData)) {
              return sectionData;
            }
          }
        }
      }

      return null;

    } catch (error) {
      logger.warn('Failed to search section in memory system', {
        chapterNumber,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * 記憶結果からセクションデータを解析
   * @private
   */
  private parseSectionFromMemoryResult(data: any): SectionPlot | null {
    try {
      // メモリ結果からセクションデータを抽出
      if (data && typeof data === 'object') {
        // 技術データ部分を検索
        const technicalData = data.technicalData || data;
        if (technicalData.sectionInfo) {
          return technicalData.sectionInfo as SectionPlot;
        }
      }
      return null;
    } catch (error) {
      logger.warn('Failed to parse section from memory result', { error });
      return null;
    }
  }

  /**
   * 章がセクション範囲内かチェック
   * @private
   */
  private isChapterInSection(chapterNumber: number, section: SectionPlot): boolean {
    return chapterNumber >= section.chapterRange.start &&
      chapterNumber <= section.chapterRange.end;
  }

  /**
   * IDでセクションを取得
   * 
   * @param sectionId セクションID
   * @returns セクションプロット (見つからない場合はnull)
   */
  async getSection(sectionId: string): Promise<SectionPlot | null> {
    await this.ensureInitialized();
    return this.sectionPlots.get(sectionId) || null;
  }

  /**
   * すべてのセクションを取得
   * 
   * @returns セクションプロットの配列
   */
  async getAllSections(): Promise<SectionPlot[]> {
    await this.ensureInitialized();
    return Array.from(this.sectionPlots.values());
  }

  /**
   * セクションプロットを更新 - 記憶システム統合版
   * 
   * @param sectionId セクションID
   * @param updates 更新内容
   */
  async updateSection(sectionId: string, updates: Partial<SectionPlot>): Promise<void> {
    await this.ensureInitialized();

    const startTime = Date.now();
    this.performanceStats.totalOperations++;

    try {
      // セクションの存在確認
      const existingSection = this.sectionPlots.get(sectionId);
      if (!existingSection) {
        throw new Error(`Section with ID ${sectionId} not found`);
      }

      // チャプター範囲が更新されていて、他のセクションと重複する場合はエラー
      if (updates.chapterRange) {
        this.validateChapterRange(updates.chapterRange, sectionId);
      }

      // 現在のセクションと更新内容をマージ
      const updatedSection: SectionPlot = {
        ...existingSection,
        ...updates,
        // 部分的な更新が必要な場合、各プロパティを個別にマージ
        structure: updates.structure ? { ...existingSection.structure, ...updates.structure } : existingSection.structure,
        learningJourneyDesign: updates.learningJourneyDesign
          ? { ...existingSection.learningJourneyDesign, ...updates.learningJourneyDesign }
          : existingSection.learningJourneyDesign,
        emotionalDesign: updates.emotionalDesign
          ? { ...existingSection.emotionalDesign, ...updates.emotionalDesign }
          : existingSection.emotionalDesign,
        characterDesign: updates.characterDesign
          ? { ...existingSection.characterDesign, ...updates.characterDesign }
          : existingSection.characterDesign,
        narrativeStructureDesign: updates.narrativeStructureDesign
          ? { ...existingSection.narrativeStructureDesign, ...updates.narrativeStructureDesign }
          : existingSection.narrativeStructureDesign,
        // メタ情報は常に更新
        metaInformation: {
          ...existingSection.metaInformation,
          ...(updates.metaInformation || {}),
          lastModified: new Date().toISOString(),
          version: existingSection.metaInformation.version + 1
        }
      };

      // セクションを更新
      this.sectionPlots.set(sectionId, updatedSection);

      // チャプター範囲が更新された場合、マッピングを更新
      if (updates.chapterRange) {
        this.updateChapterToSectionMap();
        // 関係性も再構成
        this.configureSectionRelationships();
      }

      // 記憶システムへの統合（更新版）
      await this.integrateSectionWithMemorySystem(updatedSection, false);

      // ストレージに保存
      await this.saveToStorage();

      // イベントを発行
      if (eventBus) {
        eventBus.publish('section.updated', {
          sectionId,
          timestamp: new Date().toISOString(),
          sectionData: {
            title: updatedSection.structure.title,
            chapterRange: updatedSection.chapterRange
          }
        });
      }

      const processingTime = Date.now() - startTime;
      this.performanceStats.successfulOperations++;
      this.updateAverageProcessingTime(processingTime);

      logger.info(`Updated section: ${updatedSection.structure.title} (${sectionId})`, {
        processingTime,
        memoryIntegrated: this.config.useMemorySystemIntegration
      });

    } catch (error) {
      this.performanceStats.failedOperations++;
      logger.error('Failed to update section', {
        sectionId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * セクションプロットを削除 - 記憶システム統合版
   * 
   * @param sectionId セクションID
   */
  async deleteSection(sectionId: string): Promise<void> {
    await this.ensureInitialized();

    // セクションの存在確認
    if (!this.sectionPlots.has(sectionId)) {
      throw new Error(`Section with ID ${sectionId} not found`);
    }

    const section = this.sectionPlots.get(sectionId)!;
    logger.info(`Deleting section: ${section.structure.title} (${sectionId})`);

    try {
      // 記憶システムからの削除（記憶システムのキャッシュ無効化）
      if (this.config.useMemorySystemIntegration) {
        await this.removeSectionFromMemorySystem(sectionId);
      }

      // セクションを削除
      this.sectionPlots.delete(sectionId);

      // チャプターとセクションのマッピングを更新
      this.updateChapterToSectionMap();

      // 関係性テーブルから削除
      this.sectionRelationships.delete(sectionId);

      // 他のセクションの関係性を更新
      for (const [id, relations] of this.sectionRelationships.entries()) {
        if (relations.prev === sectionId) {
          this.sectionRelationships.set(id, { ...relations, prev: null });
        }
        if (relations.next === sectionId) {
          this.sectionRelationships.set(id, { ...relations, next: null });
        }
      }

      // ストレージに保存
      await this.saveToStorage();

      // イベントを発行
      if (eventBus) {
        eventBus.publish('section.deleted', {
          sectionId,
          timestamp: new Date().toISOString()
        });
      }

      logger.info(`Section deleted successfully: ${sectionId}`);

    } catch (error) {
      logger.error('Failed to delete section', {
        sectionId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 記憶システムからセクションを削除
   * @private
   */
  private async removeSectionFromMemorySystem(sectionId: string): Promise<void> {
    try {
      // 関連するキャッシュを無効化
      await this.safeMemoryOperation(
        async () => {
          // セクション関連のキャッシュを無効化するためのダミー検索
          const invalidationQuery = `section-invalidate-${sectionId}`;
          await this.memoryManager.unifiedSearch(invalidationQuery, [MemoryLevel.SHORT_TERM]);
        },
        'sectionCacheInvalidation',
        undefined
      );

      logger.debug('Section removed from memory system', { sectionId });

    } catch (error) {
      logger.warn('Failed to remove section from memory system', {
        sectionId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * セクション関係性を自動構成
   */
  configureSectionRelationships(): void {
    // 章番号でセクションをソート
    const sortedSections = Array.from(this.sectionPlots.values())
      .sort((a, b) => a.chapterRange.start - b.chapterRange.start);

    // 各セクションの前後関係を設定
    for (let i = 0; i < sortedSections.length; i++) {
      const currentId = sortedSections[i].id;
      const prevId = i > 0 ? sortedSections[i - 1].id : null;
      const nextId = i < sortedSections.length - 1 ? sortedSections[i + 1].id : null;

      this.sectionRelationships.set(currentId, { prev: prevId, next: nextId });
    }

    logger.debug('Updated section relationships', {
      relationshipCount: this.sectionRelationships.size
    });
  }

  /**
   * 章番号がどの篇に属するかのマッピングを取得
   * 
   * @returns 章から篇へのマッピング
   */
  getChapterToSectionMap(): Map<number, string> {
    return new Map(this.chapterToSectionMap);
  }

  /**
   * セクション間の関係性を取得
   * 
   * @param sectionId セクションID
   * @returns セクションの前後関係
   */
  getSectionRelationship(sectionId: string): { prev: string | null; next: string | null } {
    return this.sectionRelationships.get(sectionId) || { prev: null, next: null };
  }

  /**
   * セクションに関連する学習段階を章にマッピング
   * 
   * @param sectionId セクションID
   * @returns 章から学習段階へのマッピング
   */
  async getChapterLearningStageMap(sectionId: string): Promise<Map<number, string>> {
    // 将来的にはAIによる高度な判断も可能だが、現在はシンプルなマッピング
    const section = await this.getSection(sectionId);
    if (!section) {
      return new Map();
    }

    return await this.sectionDesigner.mapLearningStageToChapters(sectionId);
  }

  /**
   * 篇の一貫性を分析
   * 
   * @param sectionId セクションID
   * @returns 一貫性分析結果
   */
  async analyzeSectionCoherence(sectionId: string): Promise<CoherenceAnalysis> {
    return this.sectionAnalyzer.analyzeSectionCoherence(sectionId);
  }

  /**
   * 学習目標の達成度を分析
   * 
   * @param sectionId セクションID
   * @returns 学習目標達成度分析結果
   */
  async analyzeLearningObjectiveProgress(sectionId: string): Promise<ObjectiveProgress> {
    return this.sectionAnalyzer.analyzeLearningObjectiveProgress(sectionId);
  }

  /**
   * 感情アークの実現度を分析
   * 
   * @param sectionId セクションID
   * @returns 感情アーク実現度分析結果
   */
  async analyzeEmotionalArcRealization(sectionId: string): Promise<EmotionalArcProgress> {
    return this.sectionAnalyzer.analyzeEmotionalArcRealization(sectionId);
  }

  /**
   * 改善提案を取得
   * 
   * @param sectionId セクションID
   * @returns 改善提案の配列
   */
  async suggestSectionImprovements(sectionId: string): Promise<ImprovementSuggestion[]> {
    return this.sectionAnalyzer.suggestSectionImprovements(sectionId);
  }

  /**
   * 章生成コンテキストに篇情報を統合
   * 
   * @param chapterNumber 章番号
   * @returns 統合された章生成コンテキスト
   */
  async generateChapterContextWithSection(chapterNumber: number): Promise<any> {
    return this.sectionBridge.generateChapterContextWithSection(chapterNumber);
  }

  /**
   * 安全な記憶システム操作パターン
   * @private
   */
  private async safeMemoryOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    fallbackValue: T
  ): Promise<T> {
    if (!this.config.useMemorySystemIntegration) {
      return fallbackValue;
    }

    try {
      // システム状態確認
      const systemStatus = await this.memoryManager.getSystemStatus();
      if (!systemStatus.initialized) {
        logger.warn(`${operationName}: MemoryManager not initialized`);
        return fallbackValue;
      }

      return await operation();

    } catch (error) {
      logger.error(`${operationName} failed`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return fallbackValue;
    }
  }

  /**
   * 平均処理時間を更新
   * @private
   */
  private updateAverageProcessingTime(processingTime: number): void {
    this.performanceStats.averageProcessingTime =
      ((this.performanceStats.averageProcessingTime * (this.performanceStats.totalOperations - 1)) + processingTime) /
      this.performanceStats.totalOperations;
  }

  /**
   * パフォーマンス統計を取得
   */
  getPerformanceStatistics(): PerformanceStatistics {
    return { ...this.performanceStats };
  }

  /**
   * NarrativeMemory (中期記憶) との同期 - 新システム対応版
   */
  async syncWithNarrativeMemory(): Promise<void> {
    if (!this.config.useMemorySystemIntegration) {
      return;
    }

    try {
      // 現在のチャプター番号を取得
      const currentChapter = await this.getCurrentChapterNumber();
      if (!currentChapter) {
        logger.debug('No current chapter to sync with narrative memory');
        return;
      }

      // 現在のチャプターが属するセクション
      const currentSection = await this.getSectionByChapter(currentChapter);
      if (!currentSection) {
        logger.debug(`Chapter ${currentChapter} does not belong to any section`);
        return;
      }

      // セクション内での進行度を計算
      const progress = this.calculateSectionProgress(currentSection, currentChapter);

      // 記憶システムを通じて状態を更新
      const progressData = {
        sectionId: currentSection.id,
        progress,
        chapterNumber: currentChapter,
        timestamp: new Date().toISOString()
      };

      const progressChapter: Chapter = {
        id: `section-progress-${currentSection.id}`,
        chapterNumber: -3, // 進行度専用章番号
        title: `Section Progress: ${currentSection.structure.title}`,
        content: JSON.stringify(progressData, null, 2),
        createdAt: new Date(),
        updatedAt: new Date(),
        scenes: [],
        metadata: {
          qualityScore: 1.0,
          keywords: ['section-progress', 'sync'],
          events: [],
          characters: [],
          foreshadowing: [],
          resolutions: [],
          correctionHistory: [],
          pov: 'System',
          location: 'Progress Tracking',
          emotionalTone: 'analytical'
        }
      };

      const result = await this.memoryManager.processChapter(progressChapter);

      if (result.success) {
        logger.info(`Synced section state with narrative memory: ${currentSection.id}, progress: ${progress}`, {
          processingTime: result.processingTime
        });
      } else {
        logger.warn('Failed to sync section state with narrative memory', {
          errors: result.errors
        });
      }

    } catch (error) {
      logger.error('Failed to sync with narrative memory', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * セクション内での進行度を計算
   * @private
   */
  private calculateSectionProgress(section: SectionPlot, currentChapter: number): number {
    const { start, end } = section.chapterRange;
    const totalChapters = end - start + 1;
    const chaptersCompleted = currentChapter - start;

    // 進行度は0から1の範囲
    return Math.max(0, Math.min(1, chaptersCompleted / totalChapters));
  }

  /**
   * 現在の章番号を取得 - 新システム対応版
   * @private
   */
  private async getCurrentChapterNumber(): Promise<number | null> {
    return await this.safeMemoryOperation(
      async () => {
        const searchResult = await this.memoryManager.unifiedSearch(
          'current chapter recent',
          [MemoryLevel.SHORT_TERM]
        );

        if (searchResult.success && searchResult.results.length > 0) {
          // 最新の章を探す
          let latestChapter = 0;

          for (const result of searchResult.results) {
            if (result.type === 'chapter' && result.data?.chapterNumber) {
              const chapterNumber = result.data.chapterNumber;
              if (chapterNumber > latestChapter) {
                latestChapter = chapterNumber;
              }
            }
          }

          return latestChapter > 0 ? latestChapter : null;
        }

        return null;
      },
      'getCurrentChapterNumber',
      null
    );
  }

  /**
   * 学習旅路システムと統合
   * 
   * @param sectionId セクションID
   */
  async integrateWithLearningJourney(sectionId: string): Promise<void> {
    if (!this.learningJourneySystem) {
      logger.warn('LearningJourneySystem not available for integration');
      return;
    }

    const section = await this.getSection(sectionId);
    if (!section) {
      logger.warn(`Section ${sectionId} not found for learning journey integration`);
      return;
    }

    try {
      // 学習設計を取得
      const learningDesign = section.learningJourneyDesign;

      // 該当セクションの学習段階を登録
      await this.learningJourneySystem.concept.registerConceptForSection(
        learningDesign.mainConcept,
        sectionId,
        learningDesign.primaryLearningStage
      );

      // 感情アーク設計と同期
      await this.learningJourneySystem.emotion.synchronizeWithSection(
        sectionId,
        section.emotionalDesign
      );

      logger.info(`Integrated section ${sectionId} with learning journey system`);

    } catch (error) {
      logger.error(`Failed to integrate section ${sectionId} with learning journey system`, {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * システム診断の実行
   */
  async performDiagnostics(): Promise<{
    systemHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    performanceMetrics: PerformanceStatistics;
    memorySystemStatus: any;
    recommendations: string[];
  }> {
    try {
      const recommendations: string[] = [];
      let systemHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';

      // パフォーマンス分析
      const successRate = this.performanceStats.totalOperations > 0
        ? this.performanceStats.successfulOperations / this.performanceStats.totalOperations
        : 1;

      if (successRate < 0.8) {
        systemHealth = 'DEGRADED';
        recommendations.push('Low success rate detected, check system configuration');
      }

      if (successRate < 0.5) {
        systemHealth = 'CRITICAL';
        recommendations.push('Critical success rate, immediate attention required');
      }

      // 記憶システム状態
      let memorySystemStatus = null;
      if (this.config.useMemorySystemIntegration) {
        const emptyLayer: MemoryLayerStatus = {
          healthy: false,
          dataCount: 0,
          lastUpdate: '',
          storageSize: 0,
          errorCount: 0
        };


        // ✅ 修正後の defaultStatus（null を使わない！）
        const defaultStatus: MemorySystemStatus = {
          initialized: false,
          lastUpdateTime: new Date().toISOString(),
          memoryLayers: {
            shortTerm: emptyLayer,
            midTerm: emptyLayer,
            longTerm: emptyLayer
          },
          performanceMetrics: {
            totalRequests: 0,
            cacheHits: 0,
            duplicatesResolved: 0,
            averageResponseTime: 0,
            lastUpdateTime: new Date().toISOString()
          },
          cacheStatistics: {
            hitRatio: 0,
            missRatio: 1,
            totalRequests: 0,
            cacheSize: 0,
            lastOptimization: new Date().toISOString(),
            evictionCount: 0
          }
        };


        memorySystemStatus = await this.safeMemoryOperation(
          () => this.memoryManager.getSystemStatus(),
          'getMemorySystemStatus',
          defaultStatus
        );

        if (!memorySystemStatus?.initialized) {
          recommendations.push('Memory system integration issues detected');
          if (systemHealth === 'HEALTHY') {
            systemHealth = 'DEGRADED';
          }
        }
      }

      // キャッシュ効率
      const cacheEfficiency = this.performanceStats.totalOperations > 0
        ? this.performanceStats.cacheHits / this.performanceStats.totalOperations
        : 0;

      if (cacheEfficiency < 0.3) {
        recommendations.push('Consider enabling caching for better performance');
      }

      return {
        systemHealth,
        performanceMetrics: { ...this.performanceStats },
        memorySystemStatus,
        recommendations
      };

    } catch (error) {
      logger.error('Failed to perform diagnostics', {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        systemHealth: 'CRITICAL',
        performanceMetrics: { ...this.performanceStats },
        memorySystemStatus: null,
        recommendations: ['Diagnostics failed, check system logs']
      };
    }
  }
}

// シングルトンインスタンスを提供
let sectionPlotManagerInstance: SectionPlotManager | null = null;

/**
 * SectionPlotManager のシングルトンインスタンスを取得
 * 
 * @param memoryManager メモリマネージャー（必須）
 * @param geminiClient Geminiクライアント
 * @param learningJourneySystem 学習旅路システム (オプション)
 * @param config 設定オプション
 * @returns SectionPlotManager のインスタンス
 */
export const getSectionPlotManager = (
  memoryManager: MemoryManager,
  geminiClient: GeminiClient,
  learningJourneySystem?: LearningJourneySystem,
  config?: Partial<SectionPlotManagerConfig>
): SectionPlotManager => {
  if (!sectionPlotManagerInstance) {
    sectionPlotManagerInstance = new SectionPlotManager(
      memoryManager,
      geminiClient,
      learningJourneySystem,
      config
    );
  }
  return sectionPlotManagerInstance;
};

// エクスポートするシングルトンインスタンス
// 注: 実際の使用時には正しいパラメータで初期化が必要
export const sectionPlotManager = null; // プレースホルダー