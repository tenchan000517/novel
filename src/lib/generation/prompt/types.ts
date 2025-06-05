// src/lib/generation/prompt/types.ts
/**
 * @fileoverview プロンプトシステム統合型定義
 * @description 8システム統合データ対応のプロンプトシステム型定義
 */

import { GenerationContext } from '@/types/generation';

/**
 * 🚀 8システム統合データ構造（prompt-generatorと共有）
 */
export interface RevolutionaryIntegratedData {
  characterSystem: {
    allCharacters: any[];
    mainCharacters: any[];
    subCharacters: any[];
    dynamicStates: any;
    relationships: any;
    psychology: any;
    growthPlans: any;
  };
  learningSystem: {
    currentJourney: any;
    stageAnalysis: any;
    emotionalArcs: any;
    catharticMoments: any;
  };
  memorySystem: {
    unifiedContext: any;
    crossLevelData: any;
    temporalAnalysis: any;
    narrativeProgression: any;
  };
  plotSystem: {
    worldSettings: any;
    themeSettings: any;
    plotDirectives: any;
    arcProgression: any;
    thematicEvolution: any;
  };
  analysisSystem: {
    qualityMetrics: any;
    styleAnalysis: any;
    tensionPacing: any;
    readerExperience: any;
  };
  parameterSystem: {
    generationParams: any;
    optimizationSettings: any;
    qualityTargets: any;
  };
  foreshadowingSystem: {
    activePlants: any;
    resolutionPlans: any;
    integrationOpportunities: any;
  };
  lifecycleSystem: {
    systemHealth: any;
    performanceMetrics: any;
    adaptiveSettings: any;
  };
}

/**
 * 動的テンプレート選択基準
 */
export interface TemplateSelectionCriteria {
  /** ジャンル */
  genre: string;
  /** 章タイプ */
  chapterType: string;
  /** テンションレベル */
  tensionLevel: number;
  /** 学習段階 */
  learningStage?: string;
  /** キャラクター数 */
  characterCount: number;
  /** ナラティブ状態 */
  narrativeState: string;
  /** 品質要求レベル */
  qualityLevel: 'standard' | 'enhanced' | 'revolutionary';
}

/**
 * テンプレート最適化結果
 */
export interface TemplateOptimizationResult {
  /** 選択されたテンプレート */
  selectedTemplate: string;
  /** 最適化理由 */
  optimizationReason: string;
  /** 適用された強化 */
  appliedEnhancements: string[];
  /** 信頼度スコア */
  confidenceScore: number;
}

/**
 * セクション構築設定
 */
export interface SectionBuildConfig {
  /** 含めるセクション */
  includeSections: string[];
  /** 詳細レベル */
  detailLevel: 'brief' | 'standard' | 'detailed' | 'revolutionary';
  /** 最大長 */
  maxLength?: number;
  /** 優先度設定 */
  priorities: { [sectionName: string]: number };
}

/**
 * 統合セクション結果
 */
export interface IntegratedSectionResult {
  /** セクション名 */
  name: string;
  /** セクション内容 */
  content: string;
  /** データソース */
  dataSources: string[];
  /** 統合度スコア */
  integrationScore: number;
  /** 品質メトリクス */
  qualityMetrics: {
    completeness: number;
    relevance: number;
    clarity: number;
  };
}

/**
 * フォーマット最適化設定
 */
export interface FormatOptimizationConfig {
  /** 出力形式 */
  outputFormat: 'markdown' | 'structured' | 'narrative';
  /** 圧縮レベル */
  compressionLevel: 'none' | 'light' | 'medium' | 'heavy';
  /** 重要度フィルタ */
  importanceThreshold: number;
  /** カスタムフォーマッタ */
  customFormatters?: { [dataType: string]: (data: any) => string };
}

/**
 * 統合フォーマット結果
 */
export interface IntegratedFormatResult {
  /** フォーマット済みコンテンツ */
  formattedContent: string;
  /** 使用されたデータ量 */
  dataUtilization: number;
  /** 圧縮率 */
  compressionRatio: number;
  /** フォーマット品質 */
  formatQuality: number;
}

/**
 * プロンプト統合メトリクス
 */
export interface PromptIntegrationMetrics {
  /** 統合されたシステム数 */
  integratedSystems: number;
  /** 総データ量 */
  totalDataSize: number;
  /** 処理時間 */
  processingTime: number;
  /** 品質向上率 */
  qualityImprovement: number;
  /** エラー率 */
  errorRate: number;
}

/**
 * テンプレート強化オプション
 */
export interface TemplateEnhancementOptions {
  /** 動的コンテンツ挿入 */
  dynamicContentInjection: boolean;
  /** コンテキスト適応 */
  contextAdaptation: boolean;
  /** 品質最適化 */
  qualityOptimization: boolean;
  /** パフォーマンス重視 */
  performanceFocus: boolean;
}

/**
 * セクション優先度マトリクス
 */
export interface SectionPriorityMatrix {
  /** キャラクター関連セクション */
  character: {
    psychology: number;
    growth: number;
    relationships: number;
    focus: number;
  };
  /** 学習旅程関連セクション */
  learning: {
    journey: number;
    emotional: number;
    cathartic: number;
    stage: number;
  };
  /** プロット関連セクション */
  plot: {
    directive: number;
    world: number;
    theme: number;
    tension: number;
  };
  /** 品質関連セクション */
  quality: {
    style: number;
    expression: number;
    reader: number;
    literary: number;
  };
}

/**
 * 統合プロンプトコンテキスト（拡張版GenerationContext）
 */
export interface IntegratedPromptContext extends GenerationContext {
  /** 統合データ */
  integratedData?: RevolutionaryIntegratedData;
  /** テンプレート最適化結果 */
  templateOptimization?: TemplateOptimizationResult;
  /** セクション構築設定 */
  sectionConfig?: SectionBuildConfig;
  /** フォーマット設定 */
  formatConfig?: FormatOptimizationConfig;
  /** 統合メトリクス */
  integrationMetrics?: PromptIntegrationMetrics;
}

/**
 * プロンプト品質評価
 */
export interface PromptQualityAssessment {
  /** 情報密度 */
  informationDensity: number;
  /** コンテキスト関連性 */
  contextRelevance: number;
  /** 構造化度 */
  structuralQuality: number;
  /** 読みやすさ */
  readability: number;
  /** 総合品質スコア */
  overallQuality: number;
  /** 改善提案 */
  improvements: string[];
}