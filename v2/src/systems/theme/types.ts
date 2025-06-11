/**
 * Theme Management System Types
 * 
 * テーマ管理システムの型定義
 * Version 2.0要件: メインテーマ・篇別テーマ・テーマ進化の型定義
 */

import type { SystemId } from '@/types/common';

// ============================================================================
// システム設定・設定
// ============================================================================

export interface ThemeManagerConfig {
  maxMainThemes: number;
  maxSectionThemes: number;
  themeEvolutionInterval: number;
  consistencyThreshold: number;
  symbolismTrackingEnabled: boolean;
  autoEvolutionEnabled: boolean;
  integrationDepth: 'basic' | 'standard' | 'deep';
  analysisMode: 'realtime' | 'batch' | 'hybrid';
}

export interface ThemeValidationConfig {
  strictConsistencyMode: boolean;
  allowThemeConflicts: boolean;
  warningThresholds: ThemeWarningThresholds;
  autoResolutionEnabled: boolean;
}

export interface ThemeWarningThresholds {
  consistencyWarning: number;
  evolutionStagnation: number;
  overemphasisWarning: number;
  underemphasisWarning: number;
  integrationGap: number;
}

// ============================================================================
// テーマデータ詳細型
// ============================================================================

export interface ThemeMetadata {
  systemId: SystemId;
  version: string;
  lastUpdated: string;
  updateHistory: ThemeUpdateRecord[];
  tags: string[];
  category: ThemeCategory;
  priority: ThemePriority;
}

export interface ThemeUpdateRecord {
  timestamp: string;
  updateType: ThemeUpdateType;
  description: string;
  affectedElements: string[];
  performedBy: string;
}

export interface ThemeAnalysisResult {
  analysisId: string;
  timestamp: string;
  analysisType: ThemeAnalysisType;
  results: ThemeAnalysisData;
  recommendations: ThemeReportRecommendation[];
  confidence: number;
  processingTime: number;
}

export interface ThemeAnalysisData {
  strengthAnalysis: ThemeStrengthAnalysis;
  consistencyAnalysis: ThemeConsistencyAnalysis;
  evolutionAnalysis: ThemeEvolutionAnalysis;
  integrationAnalysis: ThemeIntegrationAnalysis;
  qualityMetrics: ThemeQualityMetrics;
}

// ============================================================================
// テーマ強度・品質メトリクス
// ============================================================================

export interface ThemeStrengthAnalysis {
  overallStrength: number;
  mainThemeStrength: number;
  sectionThemeStrengths: SectionThemeStrength[];
  strengthDistribution: StrengthDistribution;
  weakPoints: ThemeWeakPoint[];
  strongPoints: ThemeStrongPoint[];
}

export interface SectionThemeStrength {
  sectionId: string;
  strength: number;
  factors: StrengthFactor[];
  characterContribution: number;
  plotContribution: number;
  symbolicContribution: number;
}

export interface ThemeConsistencyAnalysis {
  overallConsistency: number;
  mainThemeConsistency: number;
  sectionConsistency: number;
  temporalConsistency: number;
  characterConsistency: number;
  plotConsistency: number;
  inconsistencyPatterns: InconsistencyPattern[];
}

export interface ThemeEvolutionAnalysis {
  evolutionHealth: number;
  currentEvolutionStage: string;
  evolutionVelocity: number;
  evolutionDirection: string[];
  stagnationRisks: StagnationRisk[];
  evolutionOpportunities: EvolutionOpportunity[];
}

export interface ThemeIntegrationAnalysis {
  overallIntegration: number;
  characterIntegration: CharacterIntegrationMetrics;
  plotIntegration: PlotIntegrationMetrics;
  worldIntegration: WorldIntegrationMetrics;
  integrationGaps: IntegrationGap[];
}

export interface ThemeQualityMetrics {
  depth: number;
  sophistication: number;
  accessibility: number;
  impact: number;
  memorability: number;
  universality: number;
  originality: number;
}

// ============================================================================
// シンボリズム・モチーフ管理
// ============================================================================

export interface SymbolismManager {
  symbols: Map<string, SymbolData>;
  motifs: Map<string, MotifData>;
  patterns: Map<string, PatternData>;
  usage: SymbolUsageTracker;
  evolution: SymbolEvolutionTracker;
}

export interface SymbolData {
  id: string;
  symbol: string;
  primaryMeaning: string;
  secondaryMeanings: string[];
  themeAssociations: string[];
  usageCount: number;
  firstAppearance: number;
  lastAppearance: number;
  evolutionHistory: SymbolEvolutionRecord[];
  effectiveness: number;
}

export interface MotifData {
  id: string;
  name: string;
  description: string;
  variations: MotifVariation[];
  themeConnections: ThemeConnection[];
  recurrencePattern: RecurrencePattern;
  impact: MotifImpact;
}

export interface PatternData {
  id: string;
  name: string;
  description: string;
  occurrences: PatternOccurrence[];
  themeRelevance: number;
  predictedContinuation: string[];
}

// ============================================================================
// テーマ進化・発展詳細
// ============================================================================

export interface ThemeEvolutionEngine {
  currentStage: ThemeEvolutionStage;
  evolutionPlan: EvolutionPlan;
  milestones: EvolutionMilestone[];
  triggers: EvolutionTrigger[];
  constraints: EvolutionConstraint[];
}

export interface EvolutionPlan {
  plannedStages: PlannedStage[];
  timelineEstimate: TimelineEstimate;
  requiredIntegrations: RequiredIntegration[];
  riskAssessment: EvolutionRiskAssessment;
}

export interface PlannedStage {
  stage: ThemeEvolutionStage;
  targetChapter: number;
  objectives: string[];
  requirements: StageRequirement[];
  expectedOutcomes: string[];
  successMetrics: SuccessMetric[];
}

export interface EvolutionTrigger {
  triggerId: string;
  triggerType: TriggerType;
  condition: TriggerCondition;
  targetEvolution: string;
  priority: number;
  isActive: boolean;
}

// ============================================================================
// システム統合データ構造
// ============================================================================

export interface CharacterIntegrationMetrics {
  overallIntegration: number;
  characterMappings: CharacterThemeMapping[];
  growthAlignments: GrowthThemeAlignment[];
  conflictIntegrations: ConflictThemeIntegration[];
  gaps: CharacterIntegrationGap[];
}

export interface PlotIntegrationMetrics {
  overallIntegration: number;
  eventMappings: PlotEventThemeMapping[];
  arcAlignments: PlotArcThemeAlignment[];
  tensionIntegrations: TensionThemeIntegration[];
  gaps: PlotIntegrationGap[];
}

export interface WorldIntegrationMetrics {
  overallIntegration: number;
  settingMappings: SettingThemeMapping[];
  culturalIntegrations: CulturalThemeIntegration[];
  environmentalConnections: EnvironmentalThemeConnection[];
  gaps: WorldIntegrationGap[];
}

// ============================================================================
// エラー・例外型
// ============================================================================

export interface ThemeError {
  code: ThemeErrorCode;
  message: string;
  details: ThemeErrorDetails;
  timestamp: string;
  context: ThemeErrorContext;
}

export interface ThemeErrorDetails {
  affectedThemes: string[];
  affectedSections: string[];
  severity: ErrorSeverity;
  suggestedFix: string[];
  relatedErrors: string[];
}

export interface ThemeErrorContext {
  chapterNumber?: number;
  operationType: string;
  systemState: ThemeSystemState;
  inputData: any;
}

export interface ThemeSystemState {
  activeThemes: number;
  processingTasks: number;
  lastAnalysis: string;
  systemHealth: number;
  pendingUpdates: number;
}

// ============================================================================
// 統計・レポート型
// ============================================================================

export interface ThemeReport {
  reportId: string;
  reportType: ThemeReportType;
  generatedAt: string;
  timeRange: TimeRange;
  summary: ThemeReportSummary;
  details: ThemeReportDetails;
  recommendations: ThemeReportRecommendation[];
}

export interface ThemeReportSummary {
  totalThemes: number;
  activeThemes: number;
  averageStrength: number;
  consistencyScore: number;
  evolutionProgress: number;
  integrationScore: number;
}

export interface ThemeReportDetails {
  themeBreakdown: ThemeBreakdown[];
  strengthAnalysis: StrengthAnalysisDetail;
  evolutionTimeline: EvolutionTimelineDetail;
  integrationStatus: IntegrationStatusDetail;
  issuesFound: ThemeIssueDetail[];
}

// ============================================================================
// 列挙型
// ============================================================================

export enum ThemeCategory {
  MAIN = 'main',
  SECTION = 'section',
  EMERGENT = 'emergent',
  SUPPORTING = 'supporting',
  SYMBOLIC = 'symbolic'
}

export enum ThemePriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  BACKGROUND = 'background'
}

export enum ThemeUpdateType {
  CREATION = 'creation',
  MODIFICATION = 'modification',
  EVOLUTION = 'evolution',
  INTEGRATION = 'integration',
  DEPRECATION = 'deprecation'
}

export enum ThemeAnalysisType {
  FULL = 'full',
  STRENGTH = 'strength',
  CONSISTENCY = 'consistency',
  EVOLUTION = 'evolution',
  INTEGRATION = 'integration',
  QUALITY = 'quality'
}

export enum ThemeErrorCode {
  THEME_NOT_FOUND = 'THEME_NOT_FOUND',
  CONSISTENCY_VIOLATION = 'CONSISTENCY_VIOLATION',
  EVOLUTION_FAILURE = 'EVOLUTION_FAILURE',
  INTEGRATION_ERROR = 'INTEGRATION_ERROR',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  SYSTEM_ERROR = 'SYSTEM_ERROR'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ThemeReportType {
  COMPREHENSIVE = 'comprehensive',
  STRENGTH = 'strength',
  EVOLUTION = 'evolution',
  INTEGRATION = 'integration',
  CONSISTENCY = 'consistency'
}

export enum TriggerType {
  CHAPTER_MILESTONE = 'chapter_milestone',
  CHARACTER_DEVELOPMENT = 'character_development',
  PLOT_EVENT = 'plot_event',
  THEME_CONFLICT = 'theme_conflict',
  MANUAL = 'manual'
}

// ============================================================================
// 型エイリアス（詳細実装用）
// ============================================================================

export type ThemeEvolutionStage = string;
export type StrengthDistribution = Map<string, number>;
export type ThemeWeakPoint = any;
export type ThemeStrongPoint = any;
export type StrengthFactor = any;
export type InconsistencyPattern = any;
export type StagnationRisk = any;
export type EvolutionOpportunity = any;
export type IntegrationGap = any;
export type SymbolUsageTracker = any;
export type SymbolEvolutionTracker = any;
export type SymbolEvolutionRecord = any;
export type MotifVariation = any;
export type ThemeConnection = any;
export type RecurrencePattern = any;
export type MotifImpact = any;
export type PatternOccurrence = any;
export type EvolutionMilestone = any;
export type EvolutionConstraint = any;
export type TimelineEstimate = any;
export type RequiredIntegration = any;
export type EvolutionRiskAssessment = any;
export type StageRequirement = any;
export type SuccessMetric = any;
export type TriggerCondition = any;
export type CharacterThemeMapping = any;
export type GrowthThemeAlignment = any;
export type ConflictThemeIntegration = any;
export type CharacterIntegrationGap = any;
export type PlotEventThemeMapping = any;
export type PlotArcThemeAlignment = any;
export type TensionThemeIntegration = any;
export type PlotIntegrationGap = any;
export type SettingThemeMapping = any;
export type CulturalThemeIntegration = any;
export type EnvironmentalThemeConnection = any;
export type WorldIntegrationGap = any;
export type TimeRange = any;
export interface ThemeReportRecommendation {
  type: 'enhancement' | 'correction' | 'optimization';
  priority: ThemePriority;
  description: string;
  targetElement: string;
  expectedImpact: string;
  implementationSteps: string[];
}

// Alias for backward compatibility
export type ThemeRecommendation = ThemeReportRecommendation;
export type ThemeBreakdown = any;
export type StrengthAnalysisDetail = any;
export type EvolutionTimelineDetail = any;
export type IntegrationStatusDetail = any;
export type ThemeIssueDetail = any;