/**
 * Theme Management System Interfaces
 * 
 * テーマ管理システムのインターフェース定義
 * Version 2.0要件: メインテーマ・篇別テーマ・テーマ進化の統合管理
 */

import type { OperationResult, SystemId } from '@/types/common';

// ============================================================================
// コアインターフェース
// ============================================================================

export interface IThemeManager {
  readonly systemId: SystemId;
  
  // メインテーマ管理
  getMainTheme(): Promise<OperationResult<MainTheme>>;
  updateMainTheme(updates: Partial<MainTheme>): Promise<OperationResult<MainTheme>>;
  
  // 篇別テーマ管理
  getSectionTheme(sectionId: string): Promise<OperationResult<SectionTheme>>;
  createSectionTheme(sectionId: string, theme: CreateSectionThemeRequest): Promise<OperationResult<SectionTheme>>;
  updateSectionTheme(sectionId: string, updates: Partial<SectionTheme>): Promise<OperationResult<SectionTheme>>;
  
  // チャプター関連テーマ
  getChapterThemes(chapterNumber: number): Promise<OperationResult<ChapterThemeData>>;
  generateThemeGuidance(chapterNumber: number, context: ThemeContext): Promise<OperationResult<ThemeGuidance>>;
  
  // テーマ進化管理
  analyzeThemeEvolution(): Promise<OperationResult<ThemeEvolution>>;
  planThemeProgression(targetChapter: number): Promise<OperationResult<ThemeProgression>>;
  
  // テーマ一貫性
  validateThemeConsistency(chapterData: ChapterThemeValidation): Promise<OperationResult<ThemeConsistencyResult>>;
  getThemeConflicts(): Promise<OperationResult<ThemeConflict[]>>;
  
  // システム統合
  integrateWithCharacters(characterIds: string[]): Promise<OperationResult<CharacterThemeIntegration>>;
  integrateWithPlot(plotEvents: PlotEvent[]): Promise<OperationResult<PlotThemeIntegration>>;
  
  // 統計・分析
  getThemeStatistics(): Promise<OperationResult<ThemeStatistics>>;
  getThemeHealth(): Promise<OperationResult<ThemeHealthStatus>>;
}

// ============================================================================
// テーマデータ構造
// ============================================================================

export interface MainTheme {
  id: string;
  title: string;
  description: string;
  coreConcepts: string[];
  philosophicalBasis: string;
  targetMessage: string;
  emotionalTone: EmotionalTone;
  symbolism: SymbolismData[];
  developmentArc: ThemeDevelopmentArc;
  lastUpdated: string;
  version: number;
}

export interface SectionTheme {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  relationship: ThemeRelationship;
  specificFocus: string[];
  characterRelevance: CharacterThemeRelevance[];
  plotRelevance: PlotThemeRelevance[];
  evolutionStage: ThemeEvolutionStage;
  symbolism: SymbolismData[];
  lastUpdated: string;
}

export interface ChapterThemeData {
  chapterNumber: number;
  mainThemePresence: ThemePresence;
  sectionThemePresence: ThemePresence[];
  emergentThemes: EmergentTheme[];
  themeMotifs: ThemeMotif[];
  symbolismUsage: SymbolismUsage[];
  themeProgression: ThemeProgressionStep[];
  relevanceScore: number;
}

export interface ThemeGuidance {
  primaryFocus: string[];
  secondaryElements: string[];
  avoidanceGuidelines: string[];
  symbolismSuggestions: SymbolismSuggestion[];
  characterThemeConnections: CharacterThemeConnection[];
  plotThemeConnections: PlotThemeConnection[];
  emotionalGuidance: EmotionalGuidance;
  styleGuidance: StyleGuidance;
}

// ============================================================================
// テーマ進化・発展
// ============================================================================

export interface ThemeEvolution {
  overallDirection: string;
  evolutionMilestones: EvolutionMilestone[];
  currentStage: ThemeEvolutionStage;
  predictedProgression: ThemeProgression[];
  strengthenedAspects: string[];
  emergedComplexities: string[];
  lastAnalyzed: string;
}

export interface ThemeProgression {
  targetChapter: number;
  plannedDevelopments: ThemeDevelopment[];
  characterInvolvement: CharacterThemeInvolvement[];
  plotIntegration: PlotThemeIntegration[];
  symbolismEvolution: SymbolismEvolution[];
  emotionalProgression: EmotionalProgression;
  estimatedImpact: number;
}

export interface ThemeDevelopmentArc {
  introduction: ArcStage;
  development: ArcStage;
  climax: ArcStage;
  resolution: ArcStage;
  transformation: ArcStage;
}

// ============================================================================
// 関連システム統合
// ============================================================================

export interface CharacterThemeIntegration {
  characterId: string;
  themeRelevance: number;
  themeInfluence: ThemeInfluence[];
  growthConnections: GrowthThemeConnection[];
  conflictConnections: ConflictThemeConnection[];
  symbolicRole: SymbolicRole;
}

export interface PlotThemeIntegration {
  plotEventId: string;
  themeRelevance: number;
  themeReinforcement: ThemeReinforcement[];
  themeChallenge: ThemeChallenge[];
  symbolicSignificance: SymbolicSignificance;
}

// ============================================================================
// 一貫性・品質管理
// ============================================================================

export interface ThemeConsistencyResult {
  overallConsistency: number;
  mainThemeConsistency: number;
  sectionThemeConsistency: number;
  inconsistencies: ThemeInconsistency[];
  recommendations: ThemeRecommendation[];
  warningSignals: WarningSignal[];
}

export interface ThemeConflict {
  id: string;
  conflictType: 'contradiction' | 'weakness' | 'overemphasis' | 'underemphasis';
  description: string;
  affectedElements: string[];
  severity: number;
  suggestedResolution: string[];
  chapterRange: [number, number];
}

export interface ThemeStatistics {
  totalThemes: number;
  activeThemes: number;
  themeDistribution: ThemeDistribution;
  strengthMetrics: ThemeStrengthMetrics;
  evolutionMetrics: ThemeEvolutionMetrics;
  integrationMetrics: ThemeIntegrationMetrics;
  lastCalculated: string;
}

export interface ThemeHealthStatus {
  overallHealth: number;
  consistencyHealth: number;
  evolutionHealth: number;
  integrationHealth: number;
  issues: ThemeIssue[];
  strengths: ThemeStrength[];
  recommendations: string[];
}

// ============================================================================
// 補助データ構造
// ============================================================================

export interface EmotionalTone {
  primary: string;
  secondary: string[];
  intensity: number;
  progression: EmotionalProgression;
}

export interface SymbolismData {
  symbol: string;
  meaning: string;
  significance: number;
  recurrence: SymbolRecurrence;
  evolution: SymbolEvolution;
}

export interface ThemePresence {
  themeId: string;
  intensity: number;
  manifestations: ThemeManifestation[];
  effectivenessScore: number;
}

export interface EmergentTheme {
  concept: string;
  strength: number;
  sources: string[];
  potentialDevelopment: string;
}

// ============================================================================
// リクエスト・レスポンス型
// ============================================================================

export interface CreateSectionThemeRequest {
  title: string;
  description: string;
  relationship: ThemeRelationship;
  specificFocus: string[];
  targetEvolutionStage: ThemeEvolutionStage;
}

export interface ThemeContext {
  chapterNumber: number;
  activeCharacters: string[];
  plotEvents: PlotEvent[];
  previousThemeElements: ThemeElement[];
  narrativeGoals: string[];
}

export interface ChapterThemeValidation {
  chapterNumber: number;
  content: string;
  characterActions: CharacterAction[];
  plotDevelopments: PlotDevelopment[];
  existingThemeElements: ThemeElement[];
}

// ============================================================================
// 列挙型・定数
// ============================================================================

export enum ThemeRelationship {
  REINFORCES = 'reinforces',
  CONTRASTS = 'contrasts',
  DEVELOPS = 'develops',
  CHALLENGES = 'challenges',
  COMPLEMENTS = 'complements'
}

export enum ThemeEvolutionStage {
  INTRODUCTION = 'introduction',
  DEVELOPMENT = 'development',
  EXPLORATION = 'exploration',
  DEEPENING = 'deepening',
  TRANSFORMATION = 'transformation',
  RESOLUTION = 'resolution'
}

// ============================================================================
// 型エイリアス（他システムとの互換性）
// ============================================================================

export type ThemeElement = any; // 他システムからの型
export type PlotEvent = any;
export type CharacterAction = any;
export type PlotDevelopment = any;
export type ThemeManifestation = any;
export type SymbolRecurrence = any;
export type SymbolEvolution = any;
export type ThemeInfluence = any;
export type GrowthThemeConnection = any;
export type ConflictThemeConnection = any;
export type SymbolicRole = any;
export type ThemeReinforcement = any;
export type ThemeChallenge = any;
export type SymbolicSignificance = any;
export type ThemeInconsistency = any;
export type ThemeRecommendation = any;
export type WarningSignal = any;
export type ThemeDistribution = any;
export type ThemeStrengthMetrics = any;
export type ThemeEvolutionMetrics = any;
export type ThemeIntegrationMetrics = any;
export type ThemeIssue = any;
export type ThemeStrength = any;
export type EmotionalProgression = any;
export type EvolutionMilestone = any;
export type ThemeDevelopment = any;
export type CharacterThemeInvolvement = any;
export type SymbolismEvolution = any;
export type ArcStage = any;
export type CharacterThemeRelevance = any;
export type PlotThemeRelevance = any;
export type ThemeMotif = any;
export type SymbolismUsage = any;
export type ThemeProgressionStep = any;
export type SymbolismSuggestion = any;
export type CharacterThemeConnection = any;
export type PlotThemeConnection = any;
export type EmotionalGuidance = any;
export type StyleGuidance = any;