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
   * ビジネスフレームワーク特化シーン推奨を生成する
   * @param frameworkName フレームワーク名
   * @param stage 学習段階
   * @param chapterNumber 章番号
   * @returns フレームワーク特化シーン推奨
   */
  async generateBusinessFrameworkSceneRecommendations(
    frameworkName: string,
    stage: LearningStage,
    chapterNumber: number
  ): Promise<SceneRecommendation[]> {
    try {
      this.ensureInitialized();
      logger.info(`Generating business framework scene recommendations for ${frameworkName} at stage ${stage}`);

      const businessScenes: SceneRecommendation[] = [];

      // フレームワーク別の特化推奨事項
      switch (frameworkName) {
        case 'ISSUE_DRIVEN':
          businessScenes.push(...this.getIssueDriverSceneRecommendations(stage, chapterNumber));
          break;
        case 'SOCRATIC_DIALOGUE':
          businessScenes.push(...this.getSocraticDialogueSceneRecommendations(stage, chapterNumber));
          break;
        case 'ADLER_PSYCHOLOGY':
          businessScenes.push(...this.getAdlerPsychologySceneRecommendations(stage, chapterNumber));
          break;
        case 'DRUCKER_MANAGEMENT':
          businessScenes.push(...this.getDruckerManagementSceneRecommendations(stage, chapterNumber));
          break;
        default:
          businessScenes.push(...this.getDefaultBusinessSceneRecommendations(stage, chapterNumber));
          break;
      }

      // 4段階学習進行モデルに対応した推奨事項を追加
      if (stage === LearningStage.INTRODUCTION || 
          stage === LearningStage.THEORY_APPLICATION || 
          stage === LearningStage.FAILURE_EXPERIENCE || 
          stage === LearningStage.PRACTICAL_MASTERY) {
        businessScenes.push(...this.getBusinessStageSpecificRecommendations(stage, frameworkName, chapterNumber));
      }

      this.updatePerformanceStats('success', 'generateBusinessFrameworkSceneRecommendations');
      return businessScenes;

    } catch (error) {
      this.updatePerformanceStats('error', 'generateBusinessFrameworkSceneRecommendations');
      logger.error(`Failed to generate business framework scene recommendations for ${frameworkName}`, {
        error: error instanceof Error ? error.message : String(error),
        stage,
        chapterNumber
      });
      return this.getDefaultBusinessSceneRecommendations(stage, chapterNumber);
    }
  }

  /**
   * ISSUE DRIVEN フレームワーク特化シーン推奨
   * @private
   */
  private getIssueDriverSceneRecommendations(stage: LearningStage, chapterNumber: number): SceneRecommendation[] {
    const recommendations: SceneRecommendation[] = [];

    switch (stage) {
      case LearningStage.MISCONCEPTION:
        recommendations.push({
          type: 'CUSTOMER_ASSUMPTION_CHALLENGE',
          description: '顧客の「当たり前」だと思っていた前提が覆される場面を描写してください',
          reason: '顧客中心思考への転換点を作るため'
        });
        break;
      case LearningStage.EXPLORATION:
        recommendations.push({
          type: 'CUSTOMER_INTERVIEW_SCENE',
          description: '実際の顧客との対話を通して真のニーズを探る場面を設けてください',
          reason: 'ISSUE DRIVENの実践的体験を提供するため'
        });
        break;
      case LearningStage.CONFLICT:
        recommendations.push({
          type: 'SOLUTION_VS_PROBLEM_CONFLICT',
          description: '解決策に執着する自分と、問題の本質を見つめ直すべき声との内的葛藤を表現してください',
          reason: '課題起点思考の核心的葛藤を体現するため'
        });
        break;
      case LearningStage.INSIGHT:
        recommendations.push({
          type: 'CUSTOMER_PAIN_DISCOVERY',
          description: '顧客の本当の痛みや課題に気づく決定的な瞬間を描いてください',
          reason: 'ISSUE DRIVENの本質的な気づきを表現するため'
        });
        break;
      case LearningStage.APPLICATION:
        recommendations.push({
          type: 'ISSUE_DRIVEN_PRACTICE',
          description: '課題起点のアプローチを実際のビジネス場面で適用する実践シーンを描いてください',
          reason: '学んだ概念の具体的な活用方法を示すため'
        });
        break;
      case LearningStage.INTEGRATION:
        recommendations.push({
          type: 'NATURAL_CUSTOMER_FOCUS',
          description: '意識せずとも顧客視点で物事を考える姿を自然に表現してください',
          reason: 'ISSUE DRIVENが完全に体現された状態を示すため'
        });
        break;
    }

    return recommendations;
  }

  /**
   * ソクラテス式対話法特化シーン推奨
   * @private
   */
  private getSocraticDialogueSceneRecommendations(stage: LearningStage, chapterNumber: number): SceneRecommendation[] {
    const recommendations: SceneRecommendation[] = [];

    switch (stage) {
      case LearningStage.MISCONCEPTION:
        recommendations.push({
          type: 'QUESTIONING_ASSUMPTIONS',
          description: '「なぜそう思うのか？」「本当にそうだろうか？」といった問いかけで前提を揺さぶる対話シーンを設けてください',
          reason: 'ソクラテス式問答による気づきの入口を作るため'
        });
        break;
      case LearningStage.EXPLORATION:
        recommendations.push({
          type: 'GUIDED_DISCOVERY',
          description: '答えを直接与えずに、適切な問いかけで相手の発見を促す対話を描いてください',
          reason: '自発的な学習プロセスを体現するため'
        });
        break;
      case LearningStage.CONFLICT:
        recommendations.push({
          type: 'CONTRADICTION_REVELATION',
          description: '対話を通して自分の考えの矛盾や不整合に気づく瞬間を表現してください',
          reason: '認知的不協和による学習促進を図るため'
        });
        break;
      case LearningStage.INSIGHT:
        recommendations.push({
          type: 'SELF_DISCOVERY_MOMENT',
          description: '問いかけられた結果、自分自身で重要な答えに到達する瞬間を描いてください',
          reason: 'ソクラテス式対話の本質的な成果を表現するため'
        });
        break;
    }

    return recommendations;
  }

  /**
   * アドラー心理学特化シーン推奨
   * @private
   */
  private getAdlerPsychologySceneRecommendations(stage: LearningStage, chapterNumber: number): SceneRecommendation[] {
    const recommendations: SceneRecommendation[] = [];

    switch (stage) {
      case LearningStage.MISCONCEPTION:
        recommendations.push({
          type: 'VICTIM_MINDSET_CHALLENGE',
          description: '「これは誰のせいでもない、自分の選択の結果だ」という視点転換の場面を描いてください',
          reason: 'アドラー心理学の自己責任概念の導入のため'
        });
        break;
      case LearningStage.EXPLORATION:
        recommendations.push({
          type: 'PURPOSE_DISCOVERY',
          description: '行動の背後にある目的や意図を探る内省的な場面を設けてください',
          reason: '目的論的思考の体験を提供するため'
        });
        break;
      case LearningStage.CONFLICT:
        recommendations.push({
          type: 'COURAGE_VS_FEAR',
          description: '勇気を出して行動するか、安全な現状に留まるかの葛藤を描いてください',
          reason: 'アドラー心理学の勇気概念と変化への抵抗の対立を表現するため'
        });
        break;
      case LearningStage.INSIGHT:
        recommendations.push({
          type: 'CONTRIBUTION_REALIZATION',
          description: '自分が共同体に貢献できることに気づく瞬間を表現してください',
          reason: '共同体感覚の覚醒を描くため'
        });
        break;
    }

    return recommendations;
  }

  /**
   * ドラッカーマネジメント特化シーン推奨
   * @private
   */
  private getDruckerManagementSceneRecommendations(stage: LearningStage, chapterNumber: number): SceneRecommendation[] {
    const recommendations: SceneRecommendation[] = [];

    switch (stage) {
      case LearningStage.MISCONCEPTION:
        recommendations.push({
          type: 'EFFECTIVENESS_VS_EFFICIENCY',
          description: '「正しいことをする」vs「物事を正しくする」の違いに気づく場面を描いてください',
          reason: 'ドラッカーの効果性概念の理解を促すため'
        });
        break;
      case LearningStage.EXPLORATION:
        recommendations.push({
          type: 'STRENGTH_FOCUS_DISCOVERY',
          description: '自分や他者の強みに注目し、それを活かす方法を模索する場面を設けてください',
          reason: '強みに基づくマネジメントの体験を提供するため'
        });
        break;
      case LearningStage.CONFLICT:
        recommendations.push({
          type: 'TIME_MANAGEMENT_STRUGGLE',
          description: '重要なことと緊急なことの区別に苦労し、優先順位の判断に迷う場面を描いてください',
          reason: 'ドラッカーの時間管理概念の重要性を実感させるため'
        });
        break;
      case LearningStage.INSIGHT:
        recommendations.push({
          type: 'INNOVATION_BREAKTHROUGH',
          description: '「今日の成功が明日の失敗を招く」ことを理解し、継続的革新の必要性に気づく瞬間を表現してください',
          reason: 'ドラッカーのイノベーション理論の核心を体現するため'
        });
        break;
    }

    return recommendations;
  }

  /**
   * ビジネス学習段階特化推奨事項
   * @private
   */
  private getBusinessStageSpecificRecommendations(
    stage: LearningStage, 
    frameworkName: string, 
    chapterNumber: number
  ): SceneRecommendation[] {
    const recommendations: SceneRecommendation[] = [];

    switch (stage) {
      case LearningStage.INTRODUCTION:
        recommendations.push({
          type: 'BUSINESS_FRAMEWORK_INTRODUCTION',
          description: `${frameworkName}の基本概念を日常的なビジネス状況の中で自然に紹介してください`,
          reason: '理論的説明ではなく、実践的な文脈での学習導入を図るため'
        });
        break;

      case LearningStage.THEORY_APPLICATION:
        recommendations.push({
          type: 'FRAMEWORK_PRACTICAL_APPLICATION',
          description: `${frameworkName}の理論を具体的なビジネス課題に適用する試行錯誤の過程を描いてください`,
          reason: '理論と実践の架け橋となる学習体験を提供するため'
        });
        break;

      case LearningStage.FAILURE_EXPERIENCE:
        recommendations.push({
          type: 'CONSTRUCTIVE_FAILURE_LEARNING',
          description: `${frameworkName}の適用に失敗するが、その失敗から重要な学びを得る場面を設けてください`,
          reason: '失敗を通した深い学習と成長の機会を創出するため'
        });
        break;

      case LearningStage.PRACTICAL_MASTERY:
        recommendations.push({
          type: 'MASTERY_DEMONSTRATION',
          description: `${frameworkName}を自在に活用し、複雑な状況でも適切に対応できる熟練を示してください`,
          reason: '実践的習熟の完成形を表現し、読者の目標設定を促すため'
        });
        break;
    }

    return recommendations;
  }

  /**
   * デフォルトビジネスシーン推奨
   * @private
   */
  private getDefaultBusinessSceneRecommendations(stage: LearningStage, chapterNumber: number): SceneRecommendation[] {
    return [
      {
        type: 'BUSINESS_LEARNING_FOCUS',
        description: `${this.formatLearningStage(stage)}段階でのビジネス学習体験を重視したシーンを構成してください`,
        reason: 'ビジネス教育としての価値を最大化するため'
      },
      {
        type: 'PRACTICAL_APPLICATION',
        description: '理論的な説明よりも、実際のビジネス場面での体験を通した学習を描いてください',
        reason: '体験的学習による深い理解と定着を促進するため'
      }
    ];
  }

  /**
   * 学習段階に適したシーン推奨を生成する（プロット統合強化版）
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
      logger.info(`Generating scene recommendations for concept ${conceptName} at stage ${stage} with plot integration`);
      
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
      
      // プロット統合データを取得
      const plotIntegration = await this.getPlotIntegrationData(conceptName, stage, chapterNumber);
      
      // シーン推奨を生成（プロット統合強化版）
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

      // プロット統合による追加推奨事項
      if (plotIntegration.success) {
        sceneRecommendations.push({
          type: 'PLOT_INTEGRATION',
          description: `プロット${plotIntegration.currentPhase}フェーズに適した展開を含めてください: ${plotIntegration.recommendations.join('、 ')}`,
          reason: `学習進行とプロット展開の同期を強化するため`
        });

        if (plotIntegration.characterDevelopmentSync.length > 0) {
          sceneRecommendations.push({
            type: 'CHARACTER_DEVELOPMENT_SYNC',
            description: `キャラクター発達との同期: ${plotIntegration.characterDevelopmentSync.join('、 ')}`,
            reason: `キャラクター成長と学習段階の一体化を図るため`
          });
        }

        if (plotIntegration.tensionAlignment !== null) {
          sceneRecommendations.push({
            type: 'TENSION_ALIGNMENT',
            description: `プロット緊張度${plotIntegration.tensionAlignment}に合わせた感情的盛り上がりを設計してください`,
            reason: `プロット展開と学習体験の感情的統合を実現するため`
          });
        }
      }

      // 統合記憶システムからの追加推奨事項
      if (contextData.success && contextData.recommendations.length > 0) {
        sceneRecommendations.push({
          type: 'MEMORY_ENHANCED',
          description: `記憶システム分析による推奨: ${contextData.recommendations.join('、 ')}`,
          reason: '過去の章構造分析に基づく最適化提案'
        });
      }
      
      // イベント発行（プロット統合情報付き）
      this.eventBus.publish('scene.recommendations.generated', {
        conceptName,
        stage,
        chapterNumber,
        recommendationsCount: sceneRecommendations.length,
        memoryEnhanced: contextData.success,
        plotIntegrated: plotIntegration.success,
        plotPhase: plotIntegration.currentPhase,
        integrationScore: plotIntegration.integrationScore
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
   * プロット統合データを取得（P3-2統合強化版）
   * @private
   */
  private async getPlotIntegrationData(
    conceptName: string,
    stage: LearningStage,
    chapterNumber: number
  ): Promise<{
    success: boolean;
    currentPhase: string;
    recommendations: string[];
    characterDevelopmentSync: string[];
    tensionAlignment: number | null;
    integrationScore: number;
  }> {
    const result = {
      success: false,
      currentPhase: 'unknown',
      recommendations: [] as string[],
      characterDevelopmentSync: [] as string[],
      tensionAlignment: null as number | null,
      integrationScore: 0.3
    };

    if (!this.config.useMemorySystemIntegration) {
      return result;
    }

    try {
      // プロット情報の検索
      const plotSearch = await this.safeMemoryOperation(
        () => this.memoryManager.unifiedSearch(
          `plot context phase chapter ${chapterNumber} ${stage}`,
          [MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
        ),
        { success: false, totalResults: 0, results: [], suggestions: [], processingTime: 0 },
        'getPlotIntegrationData_plot'
      );

      // キャラクター発達情報の検索
      const characterSearch = await this.safeMemoryOperation(
        () => this.memoryManager.unifiedSearch(
          `character development stage ${stage} chapter ${chapterNumber}`,
          [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
        ),
        { success: false, totalResults: 0, results: [], suggestions: [], processingTime: 0 },
        'getPlotIntegrationData_character'
      );

      if (plotSearch.success && plotSearch.results.length > 0) {
        result.success = true;
        
        // プロット情報の抽出
        for (const searchResult of plotSearch.results) {
          if (searchResult.data?.plotContext) {
            const plotContext = searchResult.data.plotContext;
            result.currentPhase = plotContext.phase || plotContext.currentPhase || 'development';
            result.tensionAlignment = plotContext.tensionLevel || null;
          }

          if (searchResult.data?.plotStrategy) {
            const strategy = searchResult.data.plotStrategy;
            result.currentPhase = strategy.globalStrategy?.currentPhase || result.currentPhase;
          }
        }

        // 学習段階に応じたプロット推奨事項の生成
        result.recommendations = this.generatePlotRecommendations(stage, result.currentPhase);
        result.integrationScore = Math.min(1.0, 0.6 + (plotSearch.totalResults * 0.1));
      }

      if (characterSearch.success && characterSearch.results.length > 0) {
        // キャラクター発達同期要素の抽出
        for (const searchResult of characterSearch.results) {
          if (searchResult.data?.character?.state?.developmentStage) {
            const devStage = searchResult.data.character.state.developmentStage;
            result.characterDevelopmentSync.push(
              `発達段階${devStage}に対応した学習機会の提供`
            );
          }

          if (searchResult.data?.character?.psychology) {
            const psychology = searchResult.data.character.psychology;
            if (psychology.currentDesires?.length > 0) {
              result.characterDevelopmentSync.push(
                `キャラクターの欲求${psychology.currentDesires[0]}と学習段階の同期`
              );
            }
          }
        }

        if (result.characterDevelopmentSync.length > 0) {
          result.integrationScore = Math.min(1.0, result.integrationScore + 0.2);
        }
      }

      // 概念特化の統合推奨事項
      if (conceptName === 'ISSUE DRIVEN') {
        result.recommendations.push('課題解決プロセスとプロット展開の同期強化');
        result.characterDevelopmentSync.push('顧客視点変化とキャラクター感情発達の統合表現');
      }

      return result;

    } catch (error) {
      logger.warn('Failed to get plot integration data', { error });
      return result;
    }
  }

  /**
   * 学習段階に応じたプロット推奨事項を生成
   * @private
   */
  private generatePlotRecommendations(stage: LearningStage, currentPhase: string): string[] {
    const recommendations: string[] = [];

    // 学習段階に基づく推奨事項
    switch (stage) {
      case LearningStage.MISCONCEPTION:
        recommendations.push('既存アプローチの限界を露呈する状況設定');
        recommendations.push('問題の複雑さを段階的に明らかにする展開');
        break;
      case LearningStage.EXPLORATION:
        recommendations.push('新しい情報源や視点との出会いの演出');
        recommendations.push('多様な選択肢や可能性の提示');
        break;
      case LearningStage.CONFLICT:
        recommendations.push('価値観の対立を軸とした展開');
        recommendations.push('内的・外的対立の相互強化');
        break;
      case LearningStage.INSIGHT:
        recommendations.push('洞察を促す決定的な出来事の設計');
        recommendations.push('ブレイクスルーを支援する状況創出');
        break;
      case LearningStage.APPLICATION:
        recommendations.push('新しい理解の実践機会の提供');
        recommendations.push('段階的な成功と挫折の体験設計');
        break;
      case LearningStage.INTEGRATION:
        recommendations.push('統合された理解の自然な発揮場面');
        recommendations.push('次の学習段階への準備となる展開');
        break;
    }

    // プロットフェーズに基づく追加推奨事項
    switch (currentPhase) {
      case 'introduction':
        recommendations.push('学習基盤構築に適した導入的展開');
        break;
      case 'rising_action':
        recommendations.push('学習進行と緊張感上昇の同期');
        break;
      case 'climax':
        recommendations.push('学習の気づきとプロットクライマックスの統合');
        break;
      case 'resolution':
        recommendations.push('学習統合と物語解決の調和');
        break;
    }

    return recommendations;
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