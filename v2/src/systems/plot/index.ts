/**
 * Version 2.0 - Plot Management System Entry Point
 * 
 * プロット管理システムの統合エクスポート
 * 外部システムからの利用を統一化
 */

// Core Plot Management
export { PlotManager } from './core/plot-manager';
export type { PlotManagerConfig } from './core/plot-manager';

// Interfaces
export type {
  IPlotManager
} from './interfaces';

// Core Types
export type {
  PlotStructure,
  ConcretePlot,
  SectionPlot,
  AbstractPlot,
  PlotProgression,
  ConsistencyReport,
  PlotDirective,
  PlotValidation,
  QualityMetrics,
  PlotMetadata,
  PlotLayerMetadata,
  PlotEvent,
  Scene,
  CharacterDevelopment,
  ValidationStatus,
  QualityLevel
} from './types';


// System information
export const PLOT_SYSTEM_INFO = {
  name: 'Plot Management System',
  version: '2.0.0',
  description: '3層プロット構造（抽象・篇・具体）の統合管理システム',
  capabilities: [
    'concrete_plot_management',
    'section_plot_management', 
    'abstract_plot_management',
    'plot_consistency_validation',
    'plot_quality_evaluation',
    'plot_directive_generation',
    'plot_structure_analysis',
    'real_time_adaptation',
    'quality_monitoring',
    'performance_optimization'
  ],
  dependencies: [
    '@/types/common',
    '@/core/infrastructure/logger'
  ]
} as const;