// src/lib/learning-journey/story-transformation-designer.ts

/**
 * @fileoverview 物語変容設計（統合記憶階層システム対応版）
 * @description
 * 物語構造と篇・章の管理を行うコンポーネント。
 * 学習段階に応じた最適なシーン構造の推奨、物語テンションの調整を担当する。
 * 新しい統合記憶階層システムと完全統合し、型安全性とパフォーマンスを最適化。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { EventBus } from './event-bus';
import { LearningStage } from './concept-learning-manager';
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { 
    MemoryLevel, 
    UnifiedSearchResult,
    SystemOperationResult,
    MemorySystemStatus,
    SystemHealth
} from '@/lib/memory/core/types';

/**
 * 篇情報を表す型
 */
export interface Section {
  id: string;                  // 篇ID
  number: number;              // 篇番号
  title: string;               // 篇タイトル
  theme: string;               // 篇テーマ
  mainConcept: string;         // 主要概念
  startChapter: number;        // 開始章
  endChapter: number;          // 終了章
  learningGoal: string;        // 学習目標
  transformationGoal: string;  // 変容目標
  emotionalGoal: string;       // 感情目標
  created: string;             // 作成日時
  updated: string;             // 更新日時
}

/**
 * シーン推奨を表す型
 */
export interface SceneRecommendation {
  type: string;                // 推奨タイプ
  description: string;         // 説明
  reason: string;              // 理由
}

/**
 * テンション推奨を表す型
 */
export interface TensionRecommendation {
  recommendedTension: number;  // 推奨テンション (0-1)
  reason: string;              // 理由
  direction: 'increase' | 'decrease' | 'maintain' | 'peak' | 'establish'; // 方向
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
  cacheEfficiencyRate: number;
  lastOptimization: string;
}

/**
 * コンポーネント設定
 */
export interface StoryTransformationDesignerConfig {
  useMemorySystemIntegration: boolean;
  enableCaching: boolean;
  enableDiagnostics: boolean;
  cacheTTLMinutes: number;
  maxRetries: number;
}

/**
 * 章構造設計結果
 */
export interface ChapterStructureDesign {
  chapterNumber: number;
  suggestedTitle: string;
  learningFocus: string;
  recommendedTension: number;
}

/**
 * 篇データ検索結果
 */
interface SectionSearchResult {
  success: boolean;
  sections: Section[];
  fromCache: boolean;
  processingTime: number;
}

/**
 * @class StoryTransformationDesigner
 * @description
 * 物語構造と篇・章の管理を行うクラス。
 * 新しい統合記憶階層システムと完全統合し、最適化されたパフォーマンスを提供。
 */
export class StoryTransformationDesigner {
  private sections: Map<string, Section> = new Map();
  private initialized: boolean = false;
  private config: StoryTransformationDesignerConfig;
  
  // パフォーマンス統計
  private performanceStats: PerformanceStatistics = {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    averageProcessingTime: 0,
    memorySystemHits: 0,
    cacheEfficiencyRate: 0,
    lastOptimization: new Date().toISOString()
  };
  
  /**
   * コンストラクタ
   * @param memoryManager 統合記憶管理システム
   * @param geminiClient AIによる生成支援用クライアント
   * @param eventBus イベントバス
   * @param config コンポーネント設定
   */
  constructor(
    private memoryManager: MemoryManager,
    private geminiClient: GeminiClient,
    private eventBus: EventBus,
    config?: Partial<StoryTransformationDesignerConfig>
  ) {
    this.config = {
      useMemorySystemIntegration: true,
      enableCaching: true,
      enableDiagnostics: true,
      cacheTTLMinutes: 30,
      maxRetries: 3,
      ...config
    };

    this.validateDependencies();
    logger.info('StoryTransformationDesigner created with unified memory system integration');
  }

  /**
   * 依存関係の検証
   * @private
   */
  private validateDependencies(): void {
    if (!this.memoryManager) {
      throw new Error('MemoryManager is required for StoryTransformationDesigner initialization');
    }
    if (!this.geminiClient) {
      throw new Error('GeminiClient is required for StoryTransformationDesigner initialization');
    }
    if (!this.eventBus) {
      throw new Error('EventBus is required for StoryTransformationDesigner initialization');
    }
  }

  /**
   * 初期化する
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.info('StoryTransformationDesigner already initialized');
      return;
    }

    try {
      logger.info('Initializing StoryTransformationDesigner with unified memory system...');
      
      // 記憶システムの状態確認
      await this.ensureMemorySystemReady();
      
      // 既存セクションデータの読み込み
      const sectionsData = await this.loadSectionsFromMemorySystem();
      
      if (sectionsData.success && sectionsData.sections.length > 0) {
        // 既存データを読み込み
        this.sections = new Map(
          sectionsData.sections.map((section: Section) => [section.id, section])
        );
        this.performanceStats.memorySystemHits++;
        logger.info(`Loaded ${this.sections.size} sections from unified memory system`);
      } else {
        // 初期篇構造を生成
        await this.generateAndStoreInitialSections();
      }
      
      // 診断の実行（有効な場合）
      if (this.config.enableDiagnostics) {
        await this.performInitialDiagnostics();
      }
      
      this.initialized = true;
      logger.info('StoryTransformationDesigner initialized successfully', {
        sectionCount: this.sections.size,
        memorySystemIntegrated: this.config.useMemorySystemIntegration,
        performanceStats: this.performanceStats
      });
      
      // 初期化完了イベント発行
      this.eventBus.publish('story.designer.initialized', {
        sectionCount: this.sections.size,
        memorySystemIntegrated: true,
        performanceOptimized: true
      });
      
    } catch (error) {
      logger.error('Failed to initialize StoryTransformationDesigner', {
        error: error instanceof Error ? error.message : String(error),
        config: this.config
      });
      throw new Error(`StoryTransformationDesigner initialization failed: ${error}`);
    }
  }

  /**
   * 記憶システムの準備状態を確認
   * @private
   */
  private async ensureMemorySystemReady(): Promise<void> {
    if (!this.config.useMemorySystemIntegration) {
      return;
    }

    try {
      const systemStatus = await this.memoryManager.getSystemStatus();
      if (!systemStatus.initialized) {
        logger.warn('MemoryManager not fully initialized, waiting...');
        // 簡単な待機ロジック（本来はより sophisticated な実装が推奨）
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      logger.warn('Failed to check memory system status', { error });
      // フォールバック：メモリシステム統合を無効化
      this.config.useMemorySystemIntegration = false;
    }
  }

  /**
   * 統合記憶システムから篇データを読み込み
   * @private
   */
  private async loadSectionsFromMemorySystem(): Promise<SectionSearchResult> {
    if (!this.config.useMemorySystemIntegration) {
      return { success: false, sections: [], fromCache: false, processingTime: 0 };
    }

    const startTime = Date.now();

    try {
      // 統合検索を使用して篇データを取得
      const searchResult = await this.safeMemoryOperation(
        () => this.memoryManager.unifiedSearch('narrativeSections', [
          MemoryLevel.LONG_TERM,
          MemoryLevel.MID_TERM
        ]),
        { success: false, totalResults: 0, results: [], suggestions: [], processingTime: 0 },
        'loadSectionsFromMemorySystem'
      );

      if (searchResult.success && searchResult.results.length > 0) {
        const sections: Section[] = [];
        
        // 検索結果から篇データを抽出
        for (const result of searchResult.results) {
          if (result.data && Array.isArray(result.data)) {
            sections.push(...result.data.filter((item: any) => this.isValidSection(item)));
          } else if (result.data && result.data.narrativeSections) {
            sections.push(...result.data.narrativeSections.filter((item: any) => this.isValidSection(item)));
          }
        }

        return {
          success: true,
          sections,
          fromCache: searchResult.results.some(r => r.metadata?.source === 'cache'),
          processingTime: Date.now() - startTime
        };
      }

      return { success: false, sections: [], fromCache: false, processingTime: Date.now() - startTime };

    } catch (error) {
      logger.error('Failed to load sections from memory system', {
        error: error instanceof Error ? error.message : String(error),
        processingTime: Date.now() - startTime
      });
      return { success: false, sections: [], fromCache: false, processingTime: Date.now() - startTime };
    }
  }

  /**
   * 有効な篇データかどうかを検証
   * @private
   */
  private isValidSection(item: any): item is Section {
    return item &&
           typeof item.id === 'string' &&
           typeof item.number === 'number' &&
           typeof item.title === 'string' &&
           typeof item.theme === 'string' &&
           typeof item.mainConcept === 'string' &&
           typeof item.startChapter === 'number' &&
           typeof item.endChapter === 'number';
  }

  /**
   * 初期篇構造を生成・保存
   * @private
   */
  private async generateAndStoreInitialSections(): Promise<void> {
    try {
      logger.info('Generating initial sections with memory system integration');
      
      const initialSections: Section[] = [
        {
          id: 'section-1',
          number: 1,
          title: '覚醒',
          theme: '起業の原点と初期の挑戦',
          mainConcept: 'ISSUE DRIVEN',
          startChapter: 1,
          endChapter: 5,
          learningGoal: '課題起点思考の基礎を理解する',
          transformationGoal: '自己中心から顧客中心への視点転換',
          emotionalGoal: '混乱から好奇心への感情的変化',
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        },
        {
          id: 'section-2',
          number: 2,
          title: '探求',
          theme: '顧客理解と価値創造',
          mainConcept: 'ISSUE DRIVEN',
          startChapter: 6,
          endChapter: 10,
          learningGoal: '顧客の本質的課題を探る方法を習得する',
          transformationGoal: '表面的ニーズへの対応から本質的課題の探求へ',
          emotionalGoal: '混乱と葛藤を経て気づきへと至る感情プロセス',
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        },
        {
          id: 'section-3',
          number: 3,
          title: '変容',
          theme: '組織づくりとリーダーシップ',
          mainConcept: 'ISSUE DRIVEN',
          startChapter: 11,
          endChapter: 15,
          learningGoal: '課題起点のアプローチを組織に浸透させる方法を学ぶ',
          transformationGoal: '個人的な実践から組織的な浸透へ',
          emotionalGoal: '気づきを実践する中での自信と成長の感情',
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        }
      ];
      
      // 篇をMapに格納
      for (const section of initialSections) {
        this.sections.set(section.id, section);
      }
      
      // 統合記憶システムに保存
      await this.storeSectionsToMemorySystem(initialSections);
      
      logger.info(`Generated and stored ${initialSections.length} initial sections`);
      
    } catch (error) {
      logger.error('Failed to generate initial sections', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 篇データを統合記憶システムに保存
   * @private
   */
  private async storeSectionsToMemorySystem(sections: Section[]): Promise<void> {
    if (!this.config.useMemorySystemIntegration) {
      return;
    }

    try {
      // 章形式で保存するためのデータ構造を作成
      const chapterData = {
        id: 'narrative-sections-data',
        chapterNumber: 0, // メタデータ章として保存
        title: 'Narrative Sections Data',
        content: JSON.stringify({ narrativeSections: sections }),
        createdAt: new Date(),
        updatedAt: new Date(),
        scenes: [],
        metadata: {
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          status: 'system-data',
          wordCount: 0,
          dataType: 'narrativeSections',
          sections: sections.length
        }
      };

      // 統合記憶システムに保存
      const result = await this.safeMemoryOperation(
        () => this.memoryManager.processChapter(chapterData),
        { success: false, operationType: 'processChapter', processingTime: 0, affectedComponents: [], details: {}, warnings: [], errors: ['Memory system not available'] },
        'storeSectionsToMemorySystem'
      );

      if (result.success) {
        logger.debug('Sections data stored to unified memory system successfully');
      } else {
        logger.warn('Failed to store sections data to memory system', { errors: result.errors });
      }

    } catch (error) {
      logger.error('Failed to store sections to memory system', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 安全な記憶システム操作
   * @private
   */
  private async safeMemoryOperation<T>(
    operation: () => Promise<T>,
    fallbackValue: T,
    operationName: string
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

      const result = await operation();
      this.updatePerformanceStats('success', operationName);
      return result;

    } catch (error) {
      this.updatePerformanceStats('error', operationName);
      logger.error(`${operationName} failed`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return fallbackValue;
    }
  }

  /**
   * パフォーマンス統計を更新
   * @private
   */
  private updatePerformanceStats(result: 'success' | 'error', operationName: string): void {
    this.performanceStats.totalOperations++;
    
    if (result === 'success') {
      this.performanceStats.successfulOperations++;
    } else {
      this.performanceStats.failedOperations++;
    }

    // 成功率の計算
    const successRate = this.performanceStats.totalOperations > 0 
      ? this.performanceStats.successfulOperations / this.performanceStats.totalOperations 
      : 0;

    // キャッシュ効率率の更新（簡易計算）
    this.performanceStats.cacheEfficiencyRate = Math.min(1.0, successRate * 1.2);
  }

  /**
   * 初期診断の実行
   * @private
   */
  private async performInitialDiagnostics(): Promise<void> {
    if (!this.config.enableDiagnostics) {
      return;
    }

    try {
      const diagnostics = await this.safeMemoryOperation(
        () => this.memoryManager.performSystemDiagnostics(),
        { 
          timestamp: new Date().toISOString(), 
          systemHealth: SystemHealth.CRITICAL,
          memoryLayers: { 
            shortTerm: { healthy: false, dataIntegrity: false, storageAccessible: false, lastBackup: '', performanceScore: 0, recommendations: [] }, 
            midTerm: { healthy: false, dataIntegrity: false, storageAccessible: false, lastBackup: '', performanceScore: 0, recommendations: [] }, 
            longTerm: { healthy: false, dataIntegrity: false, storageAccessible: false, lastBackup: '', performanceScore: 0, recommendations: [] } 
          },
          integrationSystems: { 
            duplicateResolver: { operational: false, efficiency: 0, errorRate: 1, lastOptimization: '', recommendations: [] }, 
            cacheCoordinator: { operational: false, efficiency: 0, errorRate: 1, lastOptimization: '', recommendations: [] }, 
            unifiedAccessAPI: { operational: false, efficiency: 0, errorRate: 1, lastOptimization: '', recommendations: [] }, 
            dataIntegrationProcessor: { operational: false, efficiency: 0, errorRate: 1, lastOptimization: '', recommendations: [] } 
          },
          performanceMetrics: { totalRequests: 0, cacheHits: 0, duplicatesResolved: 0, averageResponseTime: 0, lastUpdateTime: new Date().toISOString() },
          issues: ['System diagnostics not available'],
          recommendations: ['Check memory system status']
        },
        'performInitialDiagnostics'
      );

      if (diagnostics.systemHealth !== SystemHealth.HEALTHY) {
        logger.warn('Memory system diagnostics indicate potential issues', {
          systemHealth: diagnostics.systemHealth,
          issues: diagnostics.issues,
          recommendations: diagnostics.recommendations
        });
      }

    } catch (error) {
      logger.warn('Initial diagnostics failed', { error });
    }
  }

  /**
   * 篇を取得する
   * @param sectionId 篇ID
   * @returns 篇情報、見つからない場合はnull
   */
  getSection(sectionId: string): Section | null {
    this.ensureInitialized();
    return this.sections.get(sectionId) || null;
  }

  /**
   * 章番号から篇を取得する
   * @param chapterNumber 章番号
   * @returns 篇情報、見つからない場合はnull
   */
  getSectionByChapter(chapterNumber: number): Section | null {
    this.ensureInitialized();
    
    for (const section of this.sections.values()) {
      if (chapterNumber >= section.startChapter && chapterNumber <= section.endChapter) {
        return section;
      }
    }
    
    return null;
  }

  /**
   * すべての篇を取得する
   * @returns 篇情報の配列
   */
  getAllSections(): Section[] {
    this.ensureInitialized();
    return Array.from(this.sections.values())
      .sort((a, b) => a.number - b.number);
  }

  /**
   * 新しい篇を作成する
   * @param section 篇情報
   * @returns 作成された篇ID
   */
  async createSection(section: Omit<Section, 'id' | 'created' | 'updated'>): Promise<string> {
    this.ensureInitialized();
    
    const id = `section-${section.number}`;
    
    // 既存の同じ番号の篇をチェック
    const existingSection = this.getAllSections().find(s => s.number === section.number);
    if (existingSection) {
      logger.warn(`Section with number ${section.number} already exists, will be overwritten`);
    }
    
    // 新しい篇オブジェクトを作成
    const newSection: Section = {
      id,
      ...section,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    
    // 篇を保存
    this.sections.set(id, newSection);
    
    // 統合記憶システムに保存
    await this.storeSectionsToMemorySystem(Array.from(this.sections.values()));
    
    // イベント発行
    this.eventBus.publish('section.created', {
      sectionId: id,
      sectionNumber: section.number,
      memorySystemIntegrated: this.config.useMemorySystemIntegration
    });
    
    logger.info(`Created section with ID ${id} and number ${section.number}`);
    return id;
  }

  /**
   * 篇を更新する
   * @param sectionId 篇ID
   * @param updates 更新情報
   * @returns 更新成功の真偽値
   */
  async updateSection(
    sectionId: string,
    updates: Partial<Omit<Section, 'id' | 'created' | 'updated'>>
  ): Promise<boolean> {
    this.ensureInitialized();
    
    const section = this.getSection(sectionId);
    if (!section) {
      logger.warn(`Cannot update section: Section with ID ${sectionId} not found`);
      return false;
    }
    
    // 篇を更新
    const updatedSection: Section = {
      ...section,
      ...updates,
      updated: new Date().toISOString()
    };
    
    // 更新された篇を保存
    this.sections.set(sectionId, updatedSection);
    
    // 統合記憶システムに保存
    await this.storeSectionsToMemorySystem(Array.from(this.sections.values()));
    
    // イベント発行
    this.eventBus.publish('section.updated', {
      sectionId,
      sectionNumber: updatedSection.number,
      memorySystemIntegrated: this.config.useMemorySystemIntegration
    });
    
    logger.info(`Updated section with ID ${sectionId}`);
    return true;
  }

  /**
   * 学習段階に適したシーン推奨を生成する
   * @param conceptName 概念名
   * @param stage 学習段階
   * @param chapterNumber 章番号
   * @returns シーン推奨の配列
   */
  async generateSceneRecommendations(
    conceptName: string,
    stage: LearningStage,
    chapterNumber: number
  ): Promise<SceneRecommendation[]> {
    try {
      this.ensureInitialized();
      logger.info(`Generating scene recommendations for concept ${conceptName} at stage ${stage}`);
      
      // 章が属する篇を取得
      const section = this.getSectionByChapter(chapterNumber);
      
      if (!section) {
        logger.warn(`No section found for chapter ${chapterNumber}, using default settings`);
        return this.getDefaultSceneRecommendations(stage);
      }
      
      // 学習段階に応じたシーンパターンを取得
      const stagePattern = this.getStageSpecificScenePattern(stage);
      
      // テンション推奨を生成
      const tensionRecommendation = this.generateTensionRecommendation(stage);
      
      // 統合記憶システムから関連データを取得
      const contextData = await this.getEnhancedContextData(conceptName, chapterNumber);
      
      // シーン推奨を生成
      const sceneRecommendations: SceneRecommendation[] = [
        {
          type: 'LEARNING_SPECIFIC',
          description: `${this.formatLearningStage(stage)}段階に適した「${stagePattern.scenePattern}」を含めてください`,
          reason: `概念「${conceptName}」の${this.formatLearningStage(stage)}を効果的に表現するため`
        },
        {
          type: 'ESSENTIAL_ELEMENTS',
          description: `以下の要素を含めてください: ${stagePattern.keyElements.join('、 ')}`,
          reason: `${this.formatLearningStage(stage)}段階の重要な要素を確実に含めるため`
        },
        {
          type: 'TENSION_LEVEL',
          description: `テンションレベルを${Math.round(tensionRecommendation.recommendedTension * 10)}に設定し、${tensionRecommendation.direction}の方向性を持たせてください`,
          reason: tensionRecommendation.reason
        },
        {
          type: 'SECTION_THEME',
          description: `篇のテーマ「${section.theme}」を反映させてください`,
          reason: `物語全体の一貫性を保つため`
        },
        {
          type: 'TRANSFORMATION_GOAL',
          description: `この篇の変容目標「${section.transformationGoal}」に沿った変化を含めてください`,
          reason: `篇を通した成長の流れを作るため`
        }
      ];

      // 統合記憶システムからの追加推奨事項
      if (contextData.success && contextData.recommendations.length > 0) {
        sceneRecommendations.push({
          type: 'MEMORY_ENHANCED',
          description: `記憶システム分析による推奨: ${contextData.recommendations.join('、 ')}`,
          reason: '過去の章構造分析に基づく最適化提案'
        });
      }
      
      // イベント発行
      this.eventBus.publish('scene.recommendations.generated', {
        conceptName,
        stage,
        chapterNumber,
        recommendationsCount: sceneRecommendations.length,
        memoryEnhanced: contextData.success
      });

      this.updatePerformanceStats('success', 'generateSceneRecommendations');
      return sceneRecommendations;
      
    } catch (error) {
      this.updatePerformanceStats('error', 'generateSceneRecommendations');
      logger.error(`Failed to generate scene recommendations for ${conceptName}`, {
        error: error instanceof Error ? error.message : String(error),
        stage,
        chapterNumber
      });
      
      // エラー時はデフォルト推奨を返す
      return this.getDefaultSceneRecommendations(stage);
    }
  }

  /**
   * 統合記憶システムから拡張コンテキストデータを取得
   * @private
   */
  private async getEnhancedContextData(conceptName: string, chapterNumber: number): Promise<{
    success: boolean;
    recommendations: string[];
    relatedConcepts: string[];
    historicalPatterns: string[];
  }> {
    const result = {
      success: false,
      recommendations: [] as string[],
      relatedConcepts: [] as string[],
      historicalPatterns: [] as string[]
    };

    if (!this.config.useMemorySystemIntegration) {
      return result;
    }

    try {
      // 関連概念の検索
      const conceptSearch = await this.safeMemoryOperation(
        () => this.memoryManager.unifiedSearch(`concept:${conceptName}`, [
          MemoryLevel.LONG_TERM,
          MemoryLevel.MID_TERM
        ]),
        { success: false, totalResults: 0, results: [], suggestions: [], processingTime: 0 },
        'getEnhancedContextData_concepts'
      );

      if (conceptSearch.success && conceptSearch.results.length > 0) {
        result.success = true;
        result.relatedConcepts = conceptSearch.results
          .map(r => r.data?.name || r.data?.concept)
          .filter(Boolean)
          .slice(0, 3);
      }

      // 章パターンの検索
      const patternSearch = await this.safeMemoryOperation(
        () => this.memoryManager.unifiedSearch(`chapter:${chapterNumber} pattern`, [
          MemoryLevel.MID_TERM,
          MemoryLevel.LONG_TERM
        ]),
        { success: false, totalResults: 0, results: [], suggestions: [], processingTime: 0 },
        'getEnhancedContextData_patterns'
      );

      if (patternSearch.success && patternSearch.results.length > 0) {
        result.historicalPatterns = patternSearch.results
          .map(r => r.data?.pattern || r.data?.description)
          .filter(Boolean)
          .slice(0, 2);
      }

      // 推奨事項の生成
      if (result.relatedConcepts.length > 0) {
        result.recommendations.push(`関連概念との連携: ${result.relatedConcepts.join('、')}`);
      }
      if (result.historicalPatterns.length > 0) {
        result.recommendations.push(`効果的パターンの活用: ${result.historicalPatterns.join('、')}`);
      }

      return result;

    } catch (error) {
      logger.warn('Failed to get enhanced context data', { error });
      return result;
    }
  }

  /**
   * テンション推奨を生成する
   * @param stage 学習段階
   * @returns テンション推奨
   */
  generateTensionRecommendation(stage: LearningStage): TensionRecommendation {
    // 学習段階に応じた推奨テンションを生成
    switch (stage) {
      case LearningStage.MISCONCEPTION:
        return {
          recommendedTension: 0.6,
          reason: "誤解段階では、キャラクターが概念の限界に直面し始める緊張感を表現",
          direction: "increase"
        };
        
      case LearningStage.EXPLORATION:
        return {
          recommendedTension: 0.5,
          reason: "探索段階では、新しい視点を探る好奇心と既存理解への執着の間の穏やかな緊張感を表現",
          direction: "maintain"
        };
        
      case LearningStage.CONFLICT:
        return {
          recommendedTension: 0.75,
          reason: "葛藤段階では、相反する視点の間での内的・外的な緊張感を高めに設定",
          direction: "increase"
        };
        
      case LearningStage.INSIGHT:
        return {
          recommendedTension: 0.8,
          reason: "気づき段階では、重要な洞察が得られる瞬間の感動的な緊張感を表現",
          direction: "peak"
        };
        
      case LearningStage.APPLICATION:
        return {
          recommendedTension: 0.65,
          reason: "応用段階では、新たな理解を実践する過程での集中と適度な緊張感を表現",
          direction: "maintain"
        };
        
      case LearningStage.INTEGRATION:
        return {
          recommendedTension: 0.5,
          reason: "統合段階では、概念が自然に体現される安定感と次のステップへの期待感のバランスを表現",
          direction: "maintain"
        };
        
      default:
        return {
          recommendedTension: 0.6,
          reason: "学習プロセスに適した一般的な緊張感を維持",
          direction: "maintain"
        };
    }
  }

  /**
   * 篇の情報に基づいた章構造を設計する
   * @param sectionId 篇ID
   * @returns 章構造の配列
   */
  async designChapterStructure(sectionId: string): Promise<ChapterStructureDesign[]> {
    try {
      this.ensureInitialized();
      logger.info(`Designing chapter structure for section ${sectionId}`);
      
      const section = this.getSection(sectionId);
      if (!section) {
        logger.warn(`Section with ID ${sectionId} not found, cannot design chapter structure`);
        return [];
      }
      
      const chapterCount = section.endChapter - section.startChapter + 1;
      const chapterStructure: ChapterStructureDesign[] = [];
      
      // テンションカーブを設計
      const tensionPoints = this.designTensionCurve(chapterCount);
      
      // 統合記憶システムから関連データを取得
      const enhancedData = await this.getStructureEnhancementData(section);
      
      // 章ごとに情報を設定
      for (let i = 0; i < chapterCount; i++) {
        const chapterNumber = section.startChapter + i;
        const progress = chapterCount > 1 ? i / (chapterCount - 1) : 0;
        
        const suggestedTitle = await this.generateChapterTitle(section, chapterNumber, progress, enhancedData);
        
        chapterStructure.push({
          chapterNumber,
          suggestedTitle,
          learningFocus: this.generateLearningFocus(section, progress),
          recommendedTension: tensionPoints[i]
        });
      }
      
      // イベント発行
      this.eventBus.publish('chapter.structure.designed', {
        sectionId,
        chapterCount,
        memoryEnhanced: enhancedData.success
      });

      this.updatePerformanceStats('success', 'designChapterStructure');
      return chapterStructure;
      
    } catch (error) {
      this.updatePerformanceStats('error', 'designChapterStructure');
      logger.error(`Failed to design chapter structure for section ${sectionId}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      
      return [];
    }
  }

  /**
   * 構造強化データを取得
   * @private
   */
  private async getStructureEnhancementData(section: Section): Promise<{
    success: boolean;
    titlePatterns: string[];
    focusAreas: string[];
  }> {
    const result = {
      success: false,
      titlePatterns: [] as string[],
      focusAreas: [] as string[]
    };

    if (!this.config.useMemorySystemIntegration) {
      return result;
    }

    try {
      const search = await this.safeMemoryOperation(
        () => this.memoryManager.unifiedSearch(`section:${section.mainConcept} structure`, [
          MemoryLevel.LONG_TERM,
          MemoryLevel.MID_TERM
        ]),
        { success: false, totalResults: 0, results: [], suggestions: [], processingTime: 0 },
        'getStructureEnhancementData'
      );

      if (search.success && search.results.length > 0) {
        result.success = true;
        result.titlePatterns = search.results
          .map(r => r.data?.titlePattern || r.data?.pattern)
          .filter(Boolean)
          .slice(0, 3);
        result.focusAreas = search.results
          .map(r => r.data?.focusArea || r.data?.focus)
          .filter(Boolean)
          .slice(0, 3);
      }

      return result;

    } catch (error) {
      logger.warn('Failed to get structure enhancement data', { error });
      return result;
    }
  }

  /**
   * 章タイトルを生成する
   * @param section 篇情報
   * @param chapterNumber 章番号
   * @param progress 進行度（0-1）
   * @param enhancedData 強化データ
   * @returns 章タイトル
   * @private
   */
  private async generateChapterTitle(
    section: Section,
    chapterNumber: number,
    progress: number,
    enhancedData: { success: boolean; titlePatterns: string[]; focusAreas: string[] }
  ): Promise<string> {
    // 統合記憶システムからの強化データを活用
    if (enhancedData.success && enhancedData.titlePatterns.length > 0) {
      const pattern = enhancedData.titlePatterns[Math.floor(Math.random() * enhancedData.titlePatterns.length)];
      return `${section.title}の${pattern}`;
    }

    // デフォルトのタイトル生成ロジック
    if (progress < 0.33) {
      return `${section.title}の始まり`;
    } else if (progress < 0.66) {
      return `${section.title}の展開`;
    } else {
      return `${section.title}の転機`;
    }
  }

  /**
   * 学習フォーカスを生成する
   * @param section 篇情報
   * @param progress 進行度（0-1）
   * @returns 学習フォーカス
   * @private
   */
  private generateLearningFocus(section: Section, progress: number): string {
    // 進行度に応じて学習フォーカスを変える
    if (progress < 0.25) {
      return `${section.mainConcept}の誤解段階から探索段階への導入`;
    } else if (progress < 0.5) {
      return `${section.mainConcept}への理解を深める探索`;
    } else if (progress < 0.75) {
      return `${section.mainConcept}に関する葛藤と気づき`;
    } else {
      return `${section.mainConcept}の応用と統合に向けた準備`;
    }
  }

  /**
   * テンションカーブを設計する
   * @param chapterCount 章の数
   * @returns 各章のテンション値の配列
   * @private
   */
  private designTensionCurve(chapterCount: number): number[] {
    const tensionPoints: number[] = [];
    
    for (let i = 0; i < chapterCount; i++) {
      // 0.5から0.85までの値でカーブを形成
      const baseValue = 0.5 + (0.35 * i / (chapterCount - 1));
      
      // 変化に若干のランダム性を持たせる
      const randomVariation = (Math.random() * 0.1) - 0.05;
      const tensionValue = Math.max(0.3, Math.min(0.9, baseValue + randomVariation));
      
      tensionPoints.push(parseFloat(tensionValue.toFixed(2)));
    }
    
    return tensionPoints;
  }

  /**
   * 学習段階に適したシーンパターンを取得する
   * @param stage 学習段階
   * @returns シーンパターン情報
   * @private
   */
  private getStageSpecificScenePattern(stage: LearningStage): {
    sceneType: string;
    scenePattern: string;
    keyElements: string[];
  } {
    switch (stage) {
      case LearningStage.MISCONCEPTION:
        return {
          sceneType: 'PROBLEM_DEMONSTRATION',
          scenePattern: '問題実証パターン',
          keyElements: [
            '誤解に基づく行動とその結果',
            '既存パラダイムの限界を示す要素',
            '違和感や疑問の初期的な兆し',
            '表面的な解決の試みとその失敗'
          ]
        };
        
      case LearningStage.EXPLORATION:
        return {
          sceneType: 'NEW_PERSPECTIVE',
          scenePattern: '新しい視点パターン',
          keyElements: [
            '新たな視点や情報との出会い',
            '疑問の発生と探索行動',
            '好奇心を刺激する要素',
            '既存の理解への疑問'
          ]
        };
        
      case LearningStage.CONFLICT:
        return {
          sceneType: 'PERSPECTIVE_CLASH',
          scenePattern: '視点衝突パターン',
          keyElements: [
            '異なる視点間の対立',
            '内的葛藤の表現',
            '価値観の再評価',
            '決断を迫られる状況'
          ]
        };
        
      case LearningStage.INSIGHT:
        return {
          sceneType: 'REALIZATION',
          scenePattern: '閃きパターン',
          keyElements: [
            '気づきの瞬間',
            '視界が広がる体験',
            '新たな理解の言語化',
            'パラダイムシフトの表現'
          ]
        };
        
      case LearningStage.APPLICATION:
        return {
          sceneType: 'PRACTICAL_TEST',
          scenePattern: '実践テストパターン',
          keyElements: [
            '新しい理解の実践機会',
            '意識的な適用プロセス',
            '成果の確認',
            'フィードバックと調整'
          ]
        };
        
      case LearningStage.INTEGRATION:
        return {
          sceneType: 'NATURAL_EXPRESSION',
          scenePattern: '自然表現パターン',
          keyElements: [
            '概念の自然な表現',
            '他者への伝達',
            '無意識的な体現',
            '次のレベルへの示唆'
          ]
        };
        
      default:
        return {
          sceneType: 'LEARNING_SCENE',
          scenePattern: '学習基本パターン',
          keyElements: [
            '概念の理解と適用',
            '学びの機会',
            '内省と気づき',
            '成長の表現'
          ]
        };
    }
  }

  /**
   * デフォルトのシーン推奨を取得する
   * @param stage 学習段階
   * @returns シーン推奨の配列
   * @private
   */
  private getDefaultSceneRecommendations(stage: LearningStage): SceneRecommendation[] {
    const stagePattern = this.getStageSpecificScenePattern(stage);
    const tensionRecommendation = this.generateTensionRecommendation(stage);
    
    return [
      {
        type: 'LEARNING_SPECIFIC',
        description: `${this.formatLearningStage(stage)}段階に適した「${stagePattern.scenePattern}」を含めてください`,
        reason: `${this.formatLearningStage(stage)}を効果的に表現するため`
      },
      {
        type: 'ESSENTIAL_ELEMENTS',
        description: `以下の要素を含めてください: ${stagePattern.keyElements.join('、 ')}`,
        reason: `${this.formatLearningStage(stage)}段階の重要な要素を確実に含めるため`
      },
      {
        type: 'TENSION_LEVEL',
        description: `テンションレベルを${Math.round(tensionRecommendation.recommendedTension * 10)}に設定してください`,
        reason: tensionRecommendation.reason
      }
    ];
  }

  /**
   * 初期化済みかどうかを確認し、必要に応じて初期化する
   * @private
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('StoryTransformationDesigner is not initialized. Call initialize() first.');
    }
  }

  /**
   * 学習段階を日本語表記で取得
   * @param stage 学習段階
   * @returns 日本語表記
   * @private
   */
  private formatLearningStage(stage: LearningStage): string {
    const japaneseStages: {[key in LearningStage]?: string} = {
      [LearningStage.MISCONCEPTION]: '誤解',
      [LearningStage.EXPLORATION]: '探索',
      [LearningStage.CONFLICT]: '葛藤',
      [LearningStage.INSIGHT]: '気づき',
      [LearningStage.APPLICATION]: '応用',
      [LearningStage.INTEGRATION]: '統合'
    };
    
    return japaneseStages[stage] || stage;
  }

  /**
   * パフォーマンス診断を取得
   * @returns 診断結果
   */
  async performDiagnostics(): Promise<{
    initialized: boolean;
    sectionsCount: number;
    memorySystemIntegrated: boolean;
    performanceMetrics: PerformanceStatistics;
    recommendations: string[];
  }> {
    const recommendations: string[] = [];

    // パフォーマンス分析
    const successRate = this.performanceStats.totalOperations > 0 
      ? this.performanceStats.successfulOperations / this.performanceStats.totalOperations 
      : 1;

    if (successRate < 0.8) {
      recommendations.push('Consider optimizing memory system integration');
    }

    if (this.performanceStats.memorySystemHits === 0 && this.config.useMemorySystemIntegration) {
      recommendations.push('Memory system integration may not be working properly');
    }

    if (!this.config.enableCaching) {
      recommendations.push('Consider enabling caching for better performance');
    }

    return {
      initialized: this.initialized,
      sectionsCount: this.sections.size,
      memorySystemIntegrated: this.config.useMemorySystemIntegration,
      performanceMetrics: { ...this.performanceStats },
      recommendations
    };
  }

  /**
   * 設定を更新
   * @param newConfig 新しい設定
   */
  updateConfiguration(newConfig: Partial<StoryTransformationDesignerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('StoryTransformationDesigner configuration updated', { 
      config: this.config 
    });
  }

  /**
   * リソースのクリーンアップ
   */
  async cleanup(): Promise<void> {
    try {
      // 統計情報のリセット
      this.performanceStats = {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageProcessingTime: 0,
        memorySystemHits: 0,
        cacheEfficiencyRate: 0,
        lastOptimization: new Date().toISOString()
      };

      // 内部状態のリセット
      this.sections.clear();
      this.initialized = false;

      logger.info('StoryTransformationDesigner cleanup completed');

    } catch (error) {
      logger.error('StoryTransformationDesigner cleanup failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }
}