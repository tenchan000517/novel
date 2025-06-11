/**
 * Version 2.0 - Plot Management System Interfaces
 * 
 * 要件定義書準拠：プロット管理システムのインターフェース定義
 * - 3層プロット構造（具体・篇・抽象）の統合管理
 * - 路線チェック機能による逸脱防止
 * - 動的調整による自然な軌道修正
 * - プロ小説家レベルの品質保証
 */

import { OperationResult } from '@/types/common';
import { 
  PlotStructure, 
  ConcretePlot, 
  SectionPlot, 
  AbstractPlot,
  PlotProgression,
  ConsistencyReport,
  PlotDirective,
  PlotValidation,
  QualityMetrics,
  PlotDeviation,
  PlotAdjustment,
  DeviationReport,
  TrajectoryCorrection,
  QualityAssurance
} from './types';

// ============================================================================
// Core Plot Management Interface
// ============================================================================

/**
 * プロット管理の中核インターフェース
 * 要件：3層プロット構造の統合管理
 */
export interface IPlotManager {
  /**
   * 具体的プロットの取得（詳細なチャプター展開計画）
   */
  getConcretePlot(chapterNumber: number): Promise<OperationResult<ConcretePlot>>;
  
  /**
   * 篇プロットの取得（篇レベルの構成管理・テーマ展開）
   */
  getSectionPlot(sectionId: string): Promise<OperationResult<SectionPlot>>;
  
  /**
   * 抽象的プロットの取得（全体テーマの一貫性維持）
   */
  getAbstractPlot(): Promise<OperationResult<AbstractPlot>>;
  
  /**
   * プロット進行状況の更新
   */
  updatePlotProgression(progression: PlotProgression): Promise<OperationResult<void>>;
  
  /**
   * プロット一貫性の検証
   */
  validatePlotConsistency(): Promise<OperationResult<ConsistencyReport>>;
  
  /**
   * 章生成用プロット指示の生成
   */
  generatePlotDirective(chapterNumber: number): Promise<OperationResult<PlotDirective>>;
  
  /**
   * プロット構造の分析
   */
  analyzePlotStructure(): Promise<OperationResult<PlotStructure>>;
  
  /**
   * プロット品質評価
   */
  evaluatePlotQuality(): Promise<OperationResult<QualityMetrics>>;
}

// ============================================================================
// Plot Layer Management Interfaces
// ============================================================================

/**
 * 3層プロット構造管理
 * 要件：具体的・篇・抽象的プロットの統合管理
 */
export interface IPlotLayerManager {
  /**
   * 層間の同期と一貫性維持
   */
  syncLayerConsistency(): Promise<OperationResult<void>>;
  
  /**
   * 層間の相互影響を調整
   */
  adjustLayerInteractions(adjustments: PlotAdjustment[]): Promise<OperationResult<void>>;
  
  /**
   * 各層の役割分担を最適化
   */
  optimizeLayerResponsibilities(): Promise<OperationResult<void>>;
}

/**
 * 具体的プロット管理
 * 要件：詳細なチャプター展開計画
 */
export interface IConcretePlotManager {
  /**
   * 章プロットの生成
   */
  generateChapterPlot(chapterNumber: number): Promise<OperationResult<ConcretePlot>>;
  
  /**
   * 章プロットの更新
   */
  updateChapterPlot(chapterNumber: number, updates: Partial<ConcretePlot>): Promise<OperationResult<void>>;
  
  /**
   * 章間連続性の確保
   */
  ensureChapterContinuity(chapterRange: { start: number; end: number }): Promise<OperationResult<void>>;
  
  /**
   * 章プロットの詳細検証
   */
  validateChapterDetails(chapterNumber: number): Promise<OperationResult<PlotValidation>>;
}

/**
 * 篇プロット管理
 * 要件：篇レベルの構成管理・テーマ展開
 */
export interface ISectionPlotManager {
  /**
   * 篇プロットの生成
   */
  generateSectionPlot(sectionId: string): Promise<OperationResult<SectionPlot>>;
  
  /**
   * 篇プロットの更新
   */
  updateSectionPlot(sectionId: string, updates: Partial<SectionPlot>): Promise<OperationResult<void>>;
  
  /**
   * 篇間バランスの調整
   */
  balanceSectionPlots(): Promise<OperationResult<void>>;
  
  /**
   * テーマ展開の管理
   */
  manageSectionThemes(sectionId: string): Promise<OperationResult<void>>;
}

/**
 * 抽象的プロット管理
 * 要件：全体テーマの一貫性維持
 */
export interface IAbstractPlotManager {
  /**
   * 全体プロットの生成
   */
  generateOverallPlot(): Promise<OperationResult<AbstractPlot>>;
  
  /**
   * 全体テーマの調整
   */
  adjustOverallTheme(themeAdjustments: any): Promise<OperationResult<void>>;
  
  /**
   * 大局的バランスの維持
   */
  maintainOverallBalance(): Promise<OperationResult<void>>;
  
  /**
   * 作品全体の一貫性確保
   */
  ensureOverallConsistency(): Promise<OperationResult<void>>;
}

// ============================================================================
// Route Check & Deviation Prevention Interfaces
// ============================================================================

/**
 * 路線チェック機能
 * 要件：意図したプロット軌道からの逸脱防止
 */
export interface IRouteChecker {
  /**
   * 現在のプロット軌道をチェック
   */
  checkCurrentTrajectory(): Promise<OperationResult<DeviationReport>>;
  
  /**
   * 意図した軌道との差分を検出
   */
  detectDeviations(): Promise<OperationResult<PlotDeviation[]>>;
  
  /**
   * 逸脱の重要度を評価
   */
  assessDeviationSeverity(deviations: PlotDeviation[]): Promise<OperationResult<void>>;
  
  /**
   * 軌道修正の必要性を判定
   */
  determineCorrectionNeed(): Promise<OperationResult<boolean>>;
}

/**
 * 動的調整機能
 * 要件：物語進行に応じた自然な軌道修正
 */
export interface IDynamicAdjuster {
  /**
   * 自然な軌道修正の実施
   */
  performNaturalCorrection(deviation: PlotDeviation): Promise<OperationResult<TrajectoryCorrection>>;
  
  /**
   * 物語の流れを保持した調整
   */
  adjustWhileMaintainingFlow(): Promise<OperationResult<void>>;
  
  /**
   * 読者体験を損なわない修正
   */
  correctWithoutDisruption(): Promise<OperationResult<void>>;
  
  /**
   * 調整効果の予測
   */
  predictAdjustmentImpact(adjustment: PlotAdjustment): Promise<OperationResult<void>>;
}

// ============================================================================
// Quality Assurance Interfaces
// ============================================================================

/**
 * 品質保証機能
 * 要件：プロ小説家レベルの構成品質担保
 */
export interface IQualityAssurance {
  /**
   * プロ品質基準との比較
   */
  compareWithProfessionalStandards(): Promise<OperationResult<QualityAssurance>>;
  
  /**
   * 構成品質の評価
   */
  evaluateStructureQuality(): Promise<OperationResult<QualityMetrics>>;
  
  /**
   * 品質改善提案の生成
   */
  generateQualityImprovements(): Promise<OperationResult<any[]>>;
  
  /**
   * 品質維持の継続的監視
   */
  monitorQualityContinuously(): Promise<OperationResult<void>>;
}

/**
 * プロット品質制御
 * 要件：プロ小説家レベルの品質維持
 */
export interface IPlotQualityController {
  /**
   * プロット品質の検証
   */
  validatePlotQuality(plot: PlotStructure): Promise<OperationResult<PlotValidation>>;
  
  /**
   * プロレベル基準への適合性チェック
   */
  checkProfessionalCompliance(): Promise<OperationResult<boolean>>;
  
  /**
   * 品質低下の早期検出
   */
  detectQualityDegradation(): Promise<OperationResult<void>>;
  
  /**
   * 品質改善アクションの実行
   */
  executeQualityImprovement(improvements: any[]): Promise<OperationResult<void>>;
}

// ============================================================================
// Plot Orchestration Interface
// ============================================================================

/**
 * プロットオーケストレーター
 * 全体的なプロット管理の統括
 */
export interface IPlotOrchestrator {
  /**
   * プロット要素の統合管理
   */
  orchestratePlotElements(chapterNumber: number): Promise<OperationResult<PlotDirective>>;
  
  /**
   * 3層構造の協調制御
   */
  coordinateLayerInteraction(): Promise<OperationResult<void>>;
  
  /**
   * 品質と軌道の同時管理
   */
  manageQualityAndTrajectory(): Promise<OperationResult<void>>;
  
  /**
   * システム全体の最適化
   */
  optimizePlotSystem(): Promise<OperationResult<void>>;
}