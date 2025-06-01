// src/lib/plot/section/index.ts
/**
 * @fileoverview 中期プロット（篇）システムのエクスポート管理
 * @description
 * 「篇」システムの各コンポーネントをエクスポートし、
 * 外部からのアクセスポイントを提供します。
 */

// 型定義をエクスポート
export type {
    SectionPlot,
    SectionPlotParams,
    SectionStructure,
    LearningJourneyDesign,
    EmotionalDesign,
    CharacterDesign,
    NarrativeStructureDesign,
    MetaInformation,
    EmotionalTone,
    CoherenceAnalysis,
    ObjectiveProgress,
    EmotionalArcProgress,
    ImprovementSuggestion,
    ChapterOutline
} from './types';
  
  // 各クラスをエクスポート
  export { SectionPlotManager, getSectionPlotManager } from './section-plot-manager';
  export { SectionDesigner } from './section-designer';
  export { SectionAnalyzer } from './section-analyzer';
  export { SectionStorage } from './section-storage';
  export { SectionBridge } from './section-bridge';
  
  // シングルトンインスタンスをエクスポートするためのインポート
  import { memoryManager } from '@/lib/memory/manager';
  import { GeminiClient } from '@/lib/generation/gemini-client';
  import { getSectionPlotManager } from './section-plot-manager';
  import LearningJourneySystem from '@/lib/learning-journey';
  
  // シングルトンインスタンス（遅延初期化）
  let _sectionPlotManager: ReturnType<typeof getSectionPlotManager> | null = null;
  let _geminiClient: GeminiClient | null = null;
  let _learningJourneySystem: LearningJourneySystem | null = null;
  
  /**
   * セクションプロットマネージャーのシングルトンインスタンスを取得
   * 
   * @param forceNew 新しいインスタンスを強制的に作成するか
   * @returns セクションプロットマネージャーのシングルトンインスタンス
   */
  export function getSectionPlotManagerInstance(forceNew: boolean = false): ReturnType<typeof getSectionPlotManager> {
    if (!_sectionPlotManager || forceNew) {
      // 必要なコンポーネントをインスタンス化
      if (!_geminiClient) {
        _geminiClient = new GeminiClient();
      }
      
      _sectionPlotManager = getSectionPlotManager(
        memoryManager,
        _geminiClient,
        _learningJourneySystem || undefined
      );
    }
    
    return _sectionPlotManager;
  }
  
  /**
   * 学習旅路システムを設定
   * 
   * @param learningJourneySystem 学習旅路システム
   */
  export function setLearningJourneySystem(learningJourneySystem: LearningJourneySystem): void {
    _learningJourneySystem = learningJourneySystem;
    
    // マネージャーが既に初期化されている場合は再作成
    if (_sectionPlotManager) {
      _sectionPlotManager = getSectionPlotManager(
        memoryManager,
        _geminiClient!,
        _learningJourneySystem
      );
    }
  }
  
  // デフォルトエクスポート
  export default {
    getSectionPlotManagerInstance,
    setLearningJourneySystem
  };