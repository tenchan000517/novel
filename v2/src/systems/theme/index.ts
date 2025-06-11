/**
 * Theme Management System - Public Interface
 * 
 * テーマ管理システムの公開インターフェース
 * Version 2.0要件: メインテーマ・篇別テーマ・テーマ進化の統合管理
 */

// コアマネージャー
export { ThemeManager } from './core/theme-manager';

// インターフェース
export type {
  IThemeManager,
  MainTheme,
  SectionTheme,
  ChapterThemeData,
  ThemeGuidance,
  ThemeEvolution,
  ThemeProgression,
  ThemeConsistencyResult,
  ThemeConflict,
  CharacterThemeIntegration,
  PlotThemeIntegration,
  ThemeStatistics,
  ThemeHealthStatus,
  CreateSectionThemeRequest,
  ThemeContext,
  ChapterThemeValidation,
  ThemeRelationship,
  ThemeEvolutionStage,
  EmotionalTone,
  SymbolismData,
  ThemePresence,
  EmergentTheme
} from './interfaces';

// 型定義
export type {
  ThemeManagerConfig,
  ThemeValidationConfig,
  ThemeWarningThresholds,
  ThemeMetadata,
  ThemeUpdateRecord,
  ThemeAnalysisResult,
  ThemeAnalysisData,
  ThemeStrengthAnalysis,
  SectionThemeStrength,
  ThemeConsistencyAnalysis,
  ThemeEvolutionAnalysis,
  ThemeIntegrationAnalysis,
  ThemeQualityMetrics,
  SymbolismManager,
  SymbolData,
  MotifData,
  PatternData,
  ThemeEvolutionEngine,
  EvolutionPlan,
  PlannedStage,
  EvolutionTrigger,
  CharacterIntegrationMetrics,
  PlotIntegrationMetrics,
  WorldIntegrationMetrics,
  ThemeError,
  ThemeErrorDetails,
  ThemeErrorContext,
  ThemeSystemState,
  ThemeReport,
  ThemeReportSummary,
  ThemeReportDetails,
  ThemeCategory,
  ThemePriority,
  ThemeUpdateType,
  ThemeAnalysisType,
  ThemeErrorCode,
  ErrorSeverity,
  ThemeReportType,
  TriggerType
} from './types';

// 便利な型エイリアス
// export type ThemeManagerInstance = ThemeManager;

// デフォルトコンフィグ
export const DEFAULT_THEME_CONFIG: Partial<import('./types').ThemeManagerConfig> = {
  maxMainThemes: 1,
  maxSectionThemes: 20,
  themeEvolutionInterval: 3,
  consistencyThreshold: 0.8,
  symbolismTrackingEnabled: true,
  autoEvolutionEnabled: true,
  integrationDepth: 'standard',
  analysisMode: 'hybrid'
};

export const DEFAULT_VALIDATION_CONFIG: Partial<import('./types').ThemeValidationConfig> = {
  strictConsistencyMode: false,
  allowThemeConflicts: true,
  warningThresholds: {
    consistencyWarning: 0.7,
    evolutionStagnation: 0.5,
    overemphasisWarning: 0.9,
    underemphasisWarning: 0.3,
    integrationGap: 0.6
  },
  autoResolutionEnabled: false
};

// // ファクトリー関数
// export function createThemeManager(
//   config?: Partial<import('./types').ThemeManagerConfig>,
//   validationConfig?: Partial<import('./types').ThemeValidationConfig>
// ): ThemeManager {
//   return new ThemeManager(
//     { ...DEFAULT_THEME_CONFIG, ...config },
//     { ...DEFAULT_VALIDATION_CONFIG, ...validationConfig }
//   );
// }

// システム情報
export const THEME_SYSTEM_INFO = {
  name: 'Theme Management System',
  version: '2.0.0',
  description: 'メインテーマ・篇別テーマ・テーマ進化の統合管理システム',
  features: [
    'メインテーマ管理',
    '篇別テーマ管理', 
    'テーマ進化エンジン',
    'シンボリズム追跡',
    'チャプター関連テーマ分析',
    'テーマ一貫性検証',
    'システム統合サポート',
    'テーマ品質メトリクス'
  ],
  dependencies: [
    'core/infrastructure/logger',
    'types/common'
  ]
} as const;