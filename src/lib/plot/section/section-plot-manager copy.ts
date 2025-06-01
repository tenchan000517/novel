// src/lib/plot/section/section-plot-manager.ts
/**
 * @fileoverview 中期プロット（篇）システムの管理クラス
 * @description
 * 複数章をまとめる「篇」単位の物語構造を管理し、
 * 感情アークと学習プロセスを有機的に結合するためのクラスです。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { MemoryManager } from '@/lib/memory/manager';
import { logError } from '@/lib/utils/error-handler';
import { storageProvider } from '@/lib/storage';
import { eventBus } from '@/lib/learning-journey/event-bus';
import LearningJourneySystem from '@/lib/learning-journey';
import { SectionStorage } from './section-storage';
import { SectionDesigner } from './section-designer';
import { SectionAnalyzer } from './section-analyzer';
import { SectionBridge } from './section-bridge';
import {
  SectionPlot,
  SectionPlotParams,
  EmotionalArcProgress,
  ObjectiveProgress,
  CoherenceAnalysis,
  ImprovementSuggestion
} from './types';

/**
 * @class SectionPlotManager
 * @description 中期プロットを総合的に管理するクラス
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

  /**
   * コンストラクタ
   * 
   * @param memoryManager メモリマネージャー
   * @param geminiClient Geminiクライアント
   * @param learningJourneySystem 学習旅路システム (オプション)
   */
  constructor(
    private memoryManager: MemoryManager,
    private geminiClient: GeminiClient,
    private learningJourneySystem?: LearningJourneySystem
  ) {
    this.sectionStorage = new SectionStorage(storageProvider);
    this.sectionDesigner = new SectionDesigner(this, geminiClient);
    this.sectionAnalyzer = new SectionAnalyzer(this, memoryManager, geminiClient);
    this.sectionBridge = new SectionBridge(this, memoryManager);

    // 初期化を開始
    this.initializationPromise = this.initialize();
  }

  /**
   * 初期化処理
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.info('SectionPlotManager already initialized');
      return;
    }

    try {
      // ストレージからセクションデータを読み込む
      await this.loadFromStorage();

      // チャプターとセクションのマッピングを更新
      this.updateChapterToSectionMap();

      this.initialized = true;
      logger.info('SectionPlotManager initialized successfully');
    } catch (error) {
      logError(error, {}, 'SectionPlotManager initialization failed');
      // 初期化に失敗しても続行
      this.initialized = true;
    }
  }

  /**
   * 初期化の確認と待機
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
   * データを永続化
   */
  private async saveToStorage(): Promise<void> {
    try {
      // セクションプロットを保存
      await this.sectionStorage.saveSectionPlots(
        Array.from(this.sectionPlots.values())
      );
      
      // 関係性データを保存
      await this.sectionStorage.saveSectionRelationships(this.sectionRelationships);

      logger.info('Saved section plots to storage');
    } catch (error) {
      logger.error('Failed to save section plots to storage', { error });
      throw error;
    }
  }

  /**
   * 新しいセクションプロットを作成
   * 
   * @param params セクションプロットパラメータ
   * @returns 作成されたセクションプロット
   */
  async createSectionPlot(params: SectionPlotParams): Promise<SectionPlot> {
    await this.ensureInitialized();

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

      // 世界知識に永続化
      await this.persistToWorldKnowledge();

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

      logger.info(`Created new section plot: ${newSection.structure.title} (${sectionId})`);
      return newSection;
    } catch (error) {
      logError(error, { params }, 'Failed to create section plot');
      throw error;
    }
  }

  /**
   * チャプター範囲の重複をチェック
   * 
   * @param range チャプター範囲
   * @param excludeSectionId 除外するセクションID
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
   * 章番号からセクションを取得
   * 
   * @param chapterNumber 章番号
   * @returns セクションプロット (見つからない場合はnull)
   */
  async getSectionByChapter(chapterNumber: number): Promise<SectionPlot | null> {
    await this.ensureInitialized();

    const sectionId = this.chapterToSectionMap.get(chapterNumber);
    if (!sectionId) {
      return null;
    }

    return this.sectionPlots.get(sectionId) || null;
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
   * セクションプロットを更新
   * 
   * @param sectionId セクションID
   * @param updates 更新内容
   */
  async updateSection(sectionId: string, updates: Partial<SectionPlot>): Promise<void> {
    await this.ensureInitialized();

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

    // 世界知識に永続化
    await this.persistToWorldKnowledge();

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

    logger.info(`Updated section: ${updatedSection.structure.title} (${sectionId})`);
  }

  /**
   * セクションプロットを削除
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

    // 世界知識に永続化
    await this.persistToWorldKnowledge();

    // ストレージに保存
    await this.saveToStorage();

    // イベントを発行
    if (eventBus) {
      eventBus.publish('section.deleted', {
        sectionId,
        timestamp: new Date().toISOString()
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
   * WorldKnowledge (長期記憶) に篇情報を永続化
   */
  async persistToWorldKnowledge(): Promise<void> {
    try {
      const worldKnowledge = this.memoryManager.getLongTermMemory();
      
      // 世界知識に篇情報を保存
      // 注: WorldKnowledge クラスに拡張が必要
      if (typeof worldKnowledge['storeSectionPlots'] === 'function') {
        await worldKnowledge['storeSectionPlots'](Array.from(this.sectionPlots.values()));
        logger.info('Persisted section plots to world knowledge');
      } else {
        logger.warn('WorldKnowledge does not support section plots storage');
      }
    } catch (error) {
      logger.error('Failed to persist section plots to world knowledge', { error });
    }
  }

  /**
   * NarrativeMemory (中期記憶) との同期
   */
  async syncWithNarrativeMemory(): Promise<void> {
    try {
      const narrativeMemory = this.memoryManager.getMidTermMemory();
      
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

      // 中期記憶に状態を更新
      // 注: NarrativeMemory クラスに拡張が必要
      if (typeof narrativeMemory['updateSectionState'] === 'function') {
        await narrativeMemory['updateSectionState'](currentSection.id, progress);
        logger.info(`Synced section state with narrative memory: ${currentSection.id}, progress: ${progress}`);
      } else {
        logger.warn('NarrativeMemory does not support section state updates');
      }
    } catch (error) {
      logger.error('Failed to sync with narrative memory', { error });
    }
  }

  /**
   * セクション内での進行度を計算
   * 
   * @param section セクション
   * @param currentChapter 現在の章番号
   * @returns 進行度 (0-1)
   */
  private calculateSectionProgress(section: SectionPlot, currentChapter: number): number {
    const { start, end } = section.chapterRange;
    const totalChapters = end - start + 1;
    const chaptersCompleted = currentChapter - start;
    
    // 進行度は0から1の範囲
    return Math.max(0, Math.min(1, chaptersCompleted / totalChapters));
  }

  /**
   * 現在の章番号を取得
   * 
   * @returns 現在の章番号
   */
  private async getCurrentChapterNumber(): Promise<number | null> {
    try {
      // ImmediateContext から最新の章番号を取得
      const shortTermMemory = this.memoryManager.getShortTermMemory();
      const recentChapters = await shortTermMemory.getRecentChapters();
      
      if (recentChapters && recentChapters.length > 0) {
        // 最新の章を見つける
        let latestChapter = recentChapters[0].chapter.chapterNumber;
        
        for (const chapter of recentChapters) {
          if (chapter.chapter.chapterNumber > latestChapter) {
            latestChapter = chapter.chapter.chapterNumber;
          }
        }
        
        return latestChapter;
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to get current chapter number', { error });
      return null;
    }
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
      logger.error(`Failed to integrate section ${sectionId} with learning journey system`, { error });
    }
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
}

// シングルトンインスタンスを提供
let sectionPlotManagerInstance: SectionPlotManager | null = null;

/**
 * SectionPlotManager のシングルトンインスタンスを取得
 * 
 * @param memoryManager メモリマネージャー
 * @param geminiClient Geminiクライアント
 * @param learningJourneySystem 学習旅路システム (オプション)
 * @returns SectionPlotManager のインスタンス
 */
export const getSectionPlotManager = (
  memoryManager: MemoryManager,
  geminiClient: GeminiClient,
  learningJourneySystem?: LearningJourneySystem
): SectionPlotManager => {
  if (!sectionPlotManagerInstance) {
    sectionPlotManagerInstance = new SectionPlotManager(
      memoryManager,
      geminiClient,
      learningJourneySystem
    );
  }
  return sectionPlotManagerInstance;
};

// エクスポートするシングルトンインスタンス
// 注: 実際の使用時には正しいパラメータで初期化が必要
export const sectionPlotManager = null; // プレースホルダー