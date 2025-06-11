/**
 * Version 2.0 - Plot Management System Types
 * 
 * 要件定義書準拠：プロット管理システムの型定義
 * - 3層プロット構造の型定義
 * - 路線チェック機能の型定義
 * - 動的調整機能の型定義
 * - 品質保証機能の型定義
 */

// ============================================================================
// Core Plot Structure Types (要件：3層プロット構造)
// ============================================================================

/**
 * プロット構造全体
 */
export interface PlotStructure {
  id: string;
  title: string;
  abstractPlot: AbstractPlot;
  sectionPlots: SectionPlot[];
  concretePlots: ConcretePlot[];
  metadata: PlotMetadata;
  validation: PlotValidation;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 抽象的プロット（要件：全体テーマの一貫性維持）
 */
export interface AbstractPlot {
  id: string;
  title: string;
  genre: string;
  mainTheme: MainTheme;
  subThemes: SubTheme[];
  overallArc: StoryArc;
  worldSetting: WorldSetting;
  targetAudience: string;
  estimatedLength: number;
  qualityTargets: QualityTargets;
  themeConsistency: ThemeConsistency;
  metadata: PlotLayerMetadata;
}

/**
 * 篇プロット（要件：篇レベルの構成管理・テーマ展開）
 */
export interface SectionPlot {
  id: string;
  sectionNumber: number;
  title: string;
  purpose: string;
  chapterRange: ChapterRange;
  sectionTheme: SectionTheme;
  themeProgression: ThemeProgression;
  keyEvents: PlotEvent[];
  characterDevelopments: CharacterDevelopment[];
  transitionStrategy: TransitionStrategy;
  metadata: PlotLayerMetadata;
}

/**
 * 具体的プロット（要件：詳細なチャプター展開計画）
 */
export interface ConcretePlot {
  id: string;
  chapterNumber: number;
  title: string;
  detailedPlan: ChapterPlan;
  scenes: Scene[];
  events: DetailedEvent[];
  characterActions: CharacterAction[];
  pacing: ChapterPacing;
  transitions: ChapterTransition;
  executionRequirements: ExecutionRequirement[];
  metadata: PlotLayerMetadata;
}

// ============================================================================
// Route Check & Deviation Types (要件：路線チェック機能)
// ============================================================================

/**
 * プロット逸脱
 * 要件：意図したプロット軌道からの逸脱防止
 */
export interface PlotDeviation {
  id: string;
  type: DeviationType;
  severity: DeviationSeverity;
  location: DeviationLocation;
  description: string;
  expectedTrajectory: Trajectory;
  actualTrajectory: Trajectory;
  impact: DeviationImpact;
  detectedAt: Date;
}

/**
 * 逸脱レポート
 */
export interface DeviationReport {
  overallStatus: 'on_track' | 'minor_deviation' | 'major_deviation' | 'critical';
  deviations: PlotDeviation[];
  riskAssessment: RiskAssessment;
  correctionRecommendations: CorrectionRecommendation[];
  preventionStrategies: PreventionStrategy[];
  reportDate: Date;
}

/**
 * 軌道
 */
export interface Trajectory {
  type: 'intended' | 'actual' | 'corrected';
  waypoints: TrajectoryWaypoint[];
  curve: TrajectoryCurve;
  momentum: number;
  direction: string;
}

/**
 * 軌道修正
 */
export interface TrajectoryCorrection {
  id: string;
  targetDeviation: PlotDeviation;
  correctionType: CorrectionType;
  adjustments: PlotAdjustment[];
  expectedOutcome: ExpectedOutcome;
  naturalness: number; // 0-1: 自然さの度合い
  disruptionLevel: number; // 0-1: 物語への影響度
}

// ============================================================================
// Dynamic Adjustment Types (要件：動的調整)
// ============================================================================

/**
 * プロット調整
 * 要件：物語進行に応じた自然な軌道修正
 */
export interface PlotAdjustment {
  id: string;
  type: AdjustmentType;
  target: AdjustmentTarget;
  method: AdjustmentMethod;
  naturalness: NaturalnessAssessment;
  flowMaintenance: FlowMaintenance;
  readerExperienceImpact: ReaderImpact;
  implementationStrategy: string;
}

/**
 * 調整タイプ
 */
export type AdjustmentType = 
  | 'theme_refinement'      // テーマの洗練
  | 'pacing_adjustment'     // ペーシング調整
  | 'character_arc_tuning'  // キャラクターアーク調整
  | 'event_resequencing'    // イベント順序調整
  | 'tension_balancing'     // テンション調整
  | 'narrative_smoothing';  // 物語の滑らか化

/**
 * 自然さ評価
 */
export interface NaturalnessAssessment {
  score: number; // 0-1
  factors: NaturalnessFactor[];
  readerPerception: string;
  narrativeIntegration: number;
}

/**
 * フロー維持
 */
export interface FlowMaintenance {
  continuityScore: number;
  transitionQuality: number;
  rhythmConsistency: number;
  momentumPreservation: number;
}

// ============================================================================
// Quality Assurance Types (要件：品質保証)
// ============================================================================

/**
 * 品質保証
 * 要件：プロ小説家レベルの構成品質担保
 */
export interface QualityAssurance {
  overallQuality: QualityLevel;
  professionalCompliance: ProfessionalCompliance;
  structureQuality: StructureQuality;
  narrativeQuality: NarrativeQuality;
  characterQuality: CharacterQuality;
  themeQuality: ThemeQuality;
  improvementPlan: ImprovementPlan;
}

/**
 * プロフェッショナル準拠
 */
export interface ProfessionalCompliance {
  complianceLevel: number; // 0-1
  industryStandards: StandardCompliance[];
  genreConventions: GenreCompliance;
  craftExcellence: CraftExcellence;
  readerEngagement: EngagementMetrics;
}

/**
 * 品質メトリクス
 */
export interface QualityMetrics {
  overallQuality: number;
  structuralIntegrity: number;
  narrativeFlow: number;
  characterDevelopment: number;
  thematicDepth: number;
  pacing: number;
  consistency: number;
  engagement: number;
  professionalStandard: number;
  readerSatisfaction: number;
  evaluatedAt: Date;
  evaluationMetrics: {
    totalElements: number;
    passedElements: number;
    warningElements: number;
    failedElements: number;
  };
  overallScore?: number;
  structureScore?: number;
  characterScore?: number;
  themeScore?: number;
  paceScore?: number;
  originalityScore?: number;
  coherenceScore?: number;
  engagementScore?: number;
  professionalScore?: number;
  detailedMetrics?: DetailedQualityMetrics;
  benchmarkComparison?: BenchmarkComparison;
}

/**
 * 品質レベル
 */
export type QualityLevel = 
  | 'amateur'
  | 'competent'
  | 'professional'
  | 'exceptional'
  | 'masterpiece';

// ============================================================================
// Plot Management Support Types
// ============================================================================

/**
 * プロット進行状況
 */
export interface PlotProgression {
  chapterNumber: number; // Required by plot-manager.ts
  currentChapter: number;
  currentSection: string;
  completedMilestones: Milestone[];
  upcomingMilestones: Milestone[];
  progressionMetrics: ProgressionMetrics;
  deviationHistory: DeviationHistory[];
  qualityTrend: QualityTrend;
  lastUpdated: Date;
}

/**
 * プロット指示
 */
export interface PlotDirective {
  id: string;
  chapterNumber: number;
  directive: {
    mainObjective: string;
    keyEvents: string[];
    characterFocus: string[];
    thematicElements: string[];
    pacingGuidance: string;
    styleGuidance: string;
    transitionNotes: string;
  };
  constraints: {
    wordCountRange: { min: number; max: number };
    requiredElements: string[];
    prohibitedElements: string[];
    qualityThresholds: {
      engagement: number;
      consistency: number;
      pacing: number;
    };
  };
  context: {
    previousChapterSummary: string;
    currentStoryState: string;
    upcomingPlotPoints: string[];
    characterStates: Map<string, any>;
  };
  generatedAt: Date;
  validUntil: Date;
  layerDirectives?: LayerDirectives;
  executionPriorities?: ExecutionPriority[];
  qualityRequirements?: QualityRequirement[];
  deviationConstraints?: DeviationConstraint[];
  creativeFreedom?: CreativeFreedom;
  metadata?: DirectiveMetadata;
}

/**
 * 一貫性レポート
 */
export interface ConsistencyReport {
  overallConsistency: number;
  layerConsistencies: Array<{ layer: string; consistency: number }>;
  inconsistencies: string[];
  recommendations: string[];
  validatedAt: Date;
  validationMetrics: {
    thematicConsistency: number;
    narrativeFlow: number;
    characterConsistency: number;
    worldConsistency: number;
  };
  layerConsistency?: LayerConsistencyReport;
  thematicConsistency?: ThematicConsistencyReport;
  characterConsistency?: CharacterConsistencyReport;
  worldConsistency?: WorldConsistencyReport;
  issues?: ConsistencyIssue[];
  consistencyRecommendations?: ConsistencyRecommendation[];
  generatedAt?: Date;
}

/**
 * プロット検証
 */
export interface PlotValidation {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  lastValidated: Date;
  validationResults?: ValidationResult[];
  qualityAssessment?: QualityAssessment;
  deviationCheck?: DeviationCheck;
  consistencyCheck?: ConsistencyCheck;
  recommendations?: ValidationRecommendation[];
  validatedAt?: Date;
}

// ============================================================================
// Layer-Specific Types
// ============================================================================

/**
 * 章計画
 */
export interface ChapterPlan {
  opening: string;
  development: string;
  climax: string;
  resolution: string;
  hooks: string[];
  objectives: string[];
  conflicts: string[];
  resolutions: string[];
  objective?: string;
  keyPoints?: string[];
  sceneOutlines?: SceneOutline[];
  emotionalBeats?: EmotionalBeat[];
  conflictProgression?: ConflictProgression;
  resolutionStrategy?: string;
}

/**
 * テーマ進行
 */
export interface ThemeProgression {
  startingPoint: string;
  developmentPath: string;
  culmination: string;
  resolution: string;
  currentState?: ThemeState;
  targetState?: ThemeState;
  progressionSteps?: ProgressionStep[];
  reinforcementMethods?: ReinforcementMethod[];
  subtletyLevel?: number;
}

/**
 * キャラクター発展
 */
export interface CharacterDevelopment {
  characterId: string;
  developmentType: DevelopmentType;
  currentState: CharacterState;
  targetState: CharacterState;
  developmentPath: DevelopmentPath;
  milestones: DevelopmentMilestone[];
}

// ============================================================================
// Metadata Types
// ============================================================================

/**
 * プロットメタデータ
 */
export interface PlotMetadata {
  totalChapters: number;
  totalSections: number;
  overallLength: number;
  complexity: string;
  genre: string;
  analysisVersion: string;
  version?: string;
  author?: string;
  createdAt?: Date;
  lastModified?: Date;
  modificationHistory?: ModificationRecord[];
  approvalStatus?: ApprovalStatus;
  qualityLevel?: QualityLevel;
  tags?: string[];
}

/**
 * プロットレイヤーメタデータ
 */
export interface PlotLayerMetadata {
  layerType: 'abstract' | 'section' | 'concrete';
  createdAt: Date;
  updatedAt: Date;
  version: string;
  quality: {
    structureScore: number;
    pacingScore: number;
    consistencyScore: number;
    engagementScore: number;
  };
  validation: {
    isValid: boolean;
    issues: string[];
    warnings: string[];
    lastValidated: Date;
  };
  parentId?: string;
  childIds?: string[];
  dependencies?: string[];
  validationStatus?: ValidationStatus;
  qualityScore?: number;
  lastUpdated?: Date;
}

// ============================================================================
// Supporting Value Types
// ============================================================================

export type DeviationType = 
  | 'theme_drift'
  | 'pacing_issue'
  | 'character_inconsistency'
  | 'plot_hole'
  | 'tension_imbalance'
  | 'narrative_confusion';

export type DeviationSeverity = 'minor' | 'moderate' | 'major' | 'critical';

export type CorrectionType = 
  | 'subtle_adjustment'
  | 'narrative_bridge'
  | 'character_intervention'
  | 'plot_twist'
  | 'thematic_realignment';

export type ValidationStatus = 'pending' | 'passed' | 'failed' | 'conditional';

export type ApprovalStatus = 'draft' | 'review' | 'approved' | 'published';

// ============================================================================
// Additional Supporting Interfaces
// ============================================================================

export interface MainTheme {
  name: string;
  description: string;
  universality: number;
  depth: number;
  resonance: number;
  id?: string;
  title?: string;
  coreMessage?: string;
  emotionalResonance?: string;
  universalAppeal?: number;
}

export interface SubTheme {
  id: string;
  title: string;
  relationToMain: string;
  prominence: number;
}

export interface StoryArc {
  type: string;
  structure: string;
  progression: string;
  climaxPoint: number;
  resolution: string;
  stages?: ArcStage[];
  climaxPosition?: number;
  resolutionDetail?: Resolution;
}

export interface WorldSetting {
  type: string;
  complexity: string;
  consistency: string;
  immersion: string;
  period?: string;
  location?: string;
  atmosphere?: string;
  rules?: WorldRule[];
}

export interface ChapterRange {
  start: number;
  end: number;
  totalChapters: number;
}

export interface SectionTheme {
  primary: string;
  secondary: string[];
  progression: string;
  integration: string;
  development?: string;
}

export interface Scene {
  id: string;
  purpose: string;
  setting: string;
  characters: string[];
  conflict: string;
  resolution: string;
}

export interface PlotEvent {
  id: string;
  type: string;
  importance: number;
  timing: string;
  consequences: string[];
}

export interface CharacterAction {
  characterId: string;
  action: string;
  motivation: string;
  consequence: string;
}

export interface ChapterPacing {
  rhythm: string;
  tensionCurve: string;
  breathingPoints: string[];
  climaxTiming: number;
  transitionFlow: string;
  overallPace?: 'slow' | 'moderate' | 'fast';
  tensionPoints?: TensionPoint[];
  rhythmPattern?: string;
}

export interface ChapterTransition {
  fromPrevious: string;
  toNext: string;
  internalFlow: string;
  emotionalContinuity: string;
  fromPreviousDetail?: TransitionDetail;
  toNextDetail?: TransitionDetail;
  smoothness?: number;
}

export interface ExecutionRequirement {
  type: string;
  description: string;
  priority: number;
  validation: string;
}

// Quality targets interface
export interface QualityTargets {
  overallQuality: number;
  structuralIntegrity: number;
  characterDevelopment: number;
  thematicDepth: number;
  readerEngagement: number;
}

// Theme consistency interface
export interface ThemeConsistency {
  mainThemeStrength: number;
  subThemeIntegration: number;
  progressionSmoothness: number;
  overallCoherence: number;
  score?: number;
  alignmentPoints?: string[];
  deviationRisks?: string[];
}

export interface TransitionStrategy {
  entryPoint: string;
  exitPoint: string;
  internalFlow: string;
  thematicContinuity: string;
  method?: string;
  elements?: string[];
  effectiveness?: number;
}

export interface DetailedEvent {
  id: string;
  description: string;
  participants: string[];
  location: string;
  timing: string;
  significance: number;
}

export interface DeviationLocation {
  chapterNumber?: number;
  sectionId?: string;
  elementType: string;
  specificElement: string;
}

export interface DeviationImpact {
  severity: number;
  affectedElements: string[];
  readerExperience: string;
  narrativeFlow: string;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  mitigation: string[];
}

export interface CorrectionRecommendation {
  priority: number;
  method: string;
  expectedEffect: string;
  implementation: string;
}

export interface PreventionStrategy {
  type: string;
  description: string;
  triggerConditions: string[];
}

export interface TrajectoryWaypoint {
  position: number;
  element: string;
  status: string;
}

export interface TrajectoryCurve {
  shape: string;
  inflectionPoints: number[];
  smoothness: number;
}

export interface ExpectedOutcome {
  description: string;
  probability: number;
  benefits: string[];
  risks: string[];
}

export interface AdjustmentTarget {
  type: string;
  id: string;
  currentState: any;
  targetState: any;
}

export interface AdjustmentMethod {
  approach: string;
  subtlety: number;
  duration: string;
}

export interface ReaderImpact {
  engagement: number;
  confusion: number;
  satisfaction: number;
  anticipation: number;
}

export interface NaturalnessFactor {
  factor: string;
  score: number;
  weight: number;
}

export interface StandardCompliance {
  standard: string;
  compliance: number;
  gaps: string[];
}

export interface GenreCompliance {
  expectations: string[];
  fulfillment: number;
  innovations: string[];
}

export interface CraftExcellence {
  technique: number;
  creativity: number;
  execution: number;
  polish: number;
}

export interface EngagementMetrics {
  attention: number;
  emotion: number;
  curiosity: number;
  satisfaction: number;
}

export interface StructureQuality {
  coherence: number;
  balance: number;
  progression: number;
  complexity: number;
}

export interface NarrativeQuality {
  flow: number;
  clarity: number;
  depth: number;
  resonance: number;
}

export interface CharacterQuality {
  depth: number;
  consistency: number;
  relatability: number;
  growth: number;
}

export interface ThemeQuality {
  clarity: number;
  integration: number;
  universality: number;
  impact: number;
}

export interface ImprovementPlan {
  priorities: ImprovementPriority[];
  timeline: string;
  resources: string[];
  expectedResults: string[];
}

export interface DetailedQualityMetrics {
  [key: string]: number;
}

export interface BenchmarkComparison {
  industryAverage: number;
  genreTop: number;
  targetLevel: number;
}

export interface Milestone {
  id: string;
  name: string;
  type: string;
  targetDate: Date;
  status: string;
}

export interface ProgressionMetrics {
  velocity: number;
  consistency: number;
  quality: number;
  momentum: number;
}

export interface DeviationHistory {
  deviation: PlotDeviation;
  correction: TrajectoryCorrection;
  outcome: string;
  lessons: string[];
}

export interface QualityTrend {
  direction: 'improving' | 'stable' | 'declining';
  rate: number;
  factors: string[];
}

export interface LayerDirectives {
  abstract: any;
  section: any;
  concrete: any;
}

export interface ExecutionPriority {
  element: string;
  priority: number;
  rationale: string;
}

export interface QualityRequirement {
  aspect: string;
  minimum: number;
  target: number;
  method: string;
}

export interface DeviationConstraint {
  type: string;
  tolerance: number;
  action: string;
}

export interface CreativeFreedom {
  level: number;
  areas: string[];
  constraints: string[];
}

export interface DirectiveMetadata {
  generatedAt: Date;
  version: string;
  confidence: number;
  validation: string;
}

export interface ValidationResult {
  aspect: string;
  passed: boolean;
  score: number;
  issues: string[];
}

export interface QualityAssessment {
  overall: number;
  breakdown: QualityBreakdown;
  strengths: string[];
  weaknesses: string[];
}

export interface DeviationCheck {
  hasDeviations: boolean;
  severity: DeviationSeverity;
  details: PlotDeviation[];
}

export interface ConsistencyCheck {
  isConsistent: boolean;
  score: number;
  issues: ConsistencyIssue[];
}

export interface ValidationRecommendation {
  priority: number;
  action: string;
  expected: string;
}

export interface LayerConsistencyReport {
  abstract_section: number;
  section_concrete: number;
  overall: number;
  issues: string[];
}

export interface ThematicConsistencyReport {
  mainTheme: number;
  subThemes: number;
  integration: number;
  evolution: number;
}

export interface CharacterConsistencyReport {
  behavior: number;
  growth: number;
  relationships: number;
  voice: number;
}

export interface WorldConsistencyReport {
  rules: number;
  atmosphere: number;
  details: number;
  evolution: number;
}

export interface ConsistencyIssue {
  type: string;
  location: string;
  description: string;
  severity: string;
}

export interface ConsistencyRecommendation {
  issue: ConsistencyIssue;
  solution: string;
  priority: number;
}

export interface ModificationRecord {
  date: Date;
  author: string;
  type: string;
  description: string;
}

export interface SceneOutline {
  id: string;
  purpose: string;
  beats: string[];
}

export interface EmotionalBeat {
  timing: string;
  emotion: string;
  intensity: number;
}

export interface ConflictProgression {
  stages: string[];
  escalation: number;
  resolution: string;
}

export interface ThemeState {
  understanding: number;
  acceptance: number;
  internalization: number;
}

export interface ProgressionStep {
  from: string;
  to: string;
  method: string;
}

export interface ReinforcementMethod {
  type: string;
  subtlety: number;
  frequency: string;
}

export interface CharacterState {
  physical: string;
  emotional: string;
  mental: string;
  social: string;
}

export interface DevelopmentPath {
  stages: string[];
  catalysts: string[];
  obstacles: string[];
}

export interface DevelopmentMilestone {
  point: string;
  indicator: string;
  significance: number;
}

export interface DevelopmentType {
  category: string;
  focus: string;
  approach: string;
}

export interface ArcStage {
  name: string;
  chapters: number[];
  purpose: string;
}

export interface Resolution {
  type: string;
  satisfaction: number;
  openThreads: string[];
}

export interface WorldRule {
  aspect: string;
  rule: string;
  flexibility: number;
}

export interface TensionPoint {
  position: number;
  level: number;
  type: string;
}

export interface TransitionDetail {
  method: string;
  elements: string[];
  smoothness: number;
}

export interface RiskFactor {
  factor: string;
  probability: number;
  impact: number;
}

export interface ImprovementPriority {
  area: string;
  urgency: number;
  effort: number;
  impact: number;
}

export interface QualityBreakdown {
  structure: number;
  character: number;
  theme: number;
  narrative: number;
  technical: number;
}