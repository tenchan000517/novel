/**
 * World System Interfaces
 * 世界観設定システムのインターフェース定義
 */

import type { OperationResult } from '@/types/common';
import type { 
  WorldTimeline, Weather, Atmosphere, EnhancedContent, SystemHealth, Location,
  LocationInfo, CulturalElementInfo, PhysicalConstraintInfo
} from './types';

// ========== Core Interface ==========

export interface IWorldManager {
  // 世界設定取得・更新
  getWorldSettings(): Promise<OperationResult<WorldSettings>>;
  updateWorldEvolution(evolution: WorldEvolution): Promise<OperationResult<void>>;
  
  // 世界一貫性管理
  validateWorldConsistency(): Promise<OperationResult<ConsistencyReport>>;
  getWorldContext(location: string): Promise<OperationResult<WorldContext>>;
  
  // 場所管理（World Collector用）
  getLocationInfo(locationId: string): Promise<OperationResult<LocationInfo>>;
  getCulturalElement(elementId: string): Promise<OperationResult<CulturalElementInfo>>;
  getPhysicalConstraint(constraintId: string): Promise<OperationResult<PhysicalConstraintInfo>>;
  
  // 世界要素生成
  generateWorldElements(context: GenerationContext): Promise<OperationResult<WorldElement[]>>;
  
  // 世界変化追跡
  trackWorldChanges(chapterNumber: number): Promise<OperationResult<ChangeRecord[]>>;
  predictWorldEvolution(currentState: WorldState): Promise<OperationResult<WorldPrediction>>;
  
  // 世界描写管理
  generateWorldDescription(setting: WorldSetting): Promise<OperationResult<WorldDescription>>;
  enhanceImmersion(content: string, context: WorldContext): Promise<OperationResult<EnhancedContent>>;
  
  // システム管理
  getSystemHealth(): Promise<OperationResult<SystemHealth>>;
  getWorldStatistics(): Promise<OperationResult<WorldStatistics>>;
}

// ========== Service Interfaces ==========

export interface IWorldEvolutionService {
  trackEvolution(chapterNumber: number): Promise<OperationResult<EvolutionData>>;
  simulateNaturalChanges(worldState: WorldState): Promise<OperationResult<NaturalChange[]>>;
  processEventDrivenChanges(events: WorldEvent[]): Promise<OperationResult<EventDrivenChange[]>>;
  maintainTemporalConsistency(timeline: WorldTimeline): Promise<OperationResult<ConsistencyValidation>>;
}

export interface IWorldDescriptionService {
  generateDescription(setting: WorldSetting, context: DescriptionContext): Promise<OperationResult<WorldDescription>>;
  enhanceImmersion(content: string, worldContext: WorldContext): Promise<OperationResult<EnhancedContent>>;
  optimizeDetails(description: string, focus: DetailFocus): Promise<OperationResult<OptimizedDescription>>;
  createAtmosphere(mood: WorldMood, setting: WorldSetting): Promise<OperationResult<AtmosphereDescription>>;
}

export interface IWorldValidationService {
  validateLogic(worldRules: WorldRule[]): Promise<OperationResult<LogicValidation>>;
  checkPhysicsConsistency(worldPhysics: WorldPhysics): Promise<OperationResult<PhysicsValidation>>;
  validateCultureConsistency(cultures: Culture[]): Promise<OperationResult<CultureValidation>>;
  verifyTimeline(timeline: WorldTimeline): Promise<OperationResult<TimelineValidation>>;
}

// ========== Data Models ==========

export interface WorldSettings {
  id: string;
  name: string;
  genre: string;
  basicConcept: string;
  
  // 世界の基本設定
  geography: Geography;
  climate: Climate;
  cultures: Culture[];
  technologies: Technology[];
  magicSystems?: MagicSystem[];
  
  // 時間・歴史
  timeline: WorldTimeline;
  currentEra: string;
  significantEvents: HistoricalEvent[];
  
  // 社会・政治
  societies: Society[];
  governments: Government[];
  economies: Economy[];
  
  // 創造・更新情報
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

export interface WorldEvolution {
  id: string;
  chapterNumber: number;
  evolutionType: EvolutionType;
  changes: WorldChange[];
  causedBy: EvolutionCause[];
  impact: EvolutionImpact;
  timestamp: Date;
}

export interface WorldContext {
  location: Location;
  timeOfDay: string;
  season: string;
  weather: Weather;
  atmosphere: Atmosphere;
  activeEvents: WorldEvent[];
  relevantHistory: HistoricalEvent[];
  culturalContext: CulturalContext;
}

export interface WorldElement {
  id: string;
  type: ElementType;
  name: string;
  description: string;
  properties: ElementProperty[];
  relationships: ElementRelationship[];
  significance: SignificanceLevel;
}

export interface ConsistencyReport {
  overallConsistency: number;
  validationResults: ValidationResult[];
  inconsistencies: Inconsistency[];
  recommendations: ConsistencyRecommendation[];
  checkedAspects: string[];
}

export interface WorldState {
  currentSettings: WorldSettings;
  activeElements: WorldElement[];
  recentChanges: any[]; // Avoid circular reference with ChangeRecord
  consistency: number;
  lastUpdated: Date;
}

export interface ChangeRecord {
  id: string;
  chapterNumber: number;
  changeType: ChangeType;
  affectedAspects: string[];
  before: WorldState;
  after: WorldState;
  reason: string;
  impact: ChangeImpact;
}

export interface WorldPrediction {
  predictedChanges: PredictedChange[];
  probability: number;
  timeframe: PredictionTimeframe;
  factors: PredictionFactor[];
  alternativeScenarios: AlternativeScenario[];
}

export interface WorldDescription {
  id: string;
  setting: WorldSetting;
  mainDescription: string;
  detailedAspects: DescriptionAspect[];
  sensoryDetails: SensoryDetail[];
  atmosphericElements: AtmosphericElement[];
  immersionLevel: number;
}

export interface WorldStatistics {
  totalLocations: number;
  activeCultures: number;
  historicalEvents: number;
  worldComplexity: number;
  consistencyScore: number;
  evolutionRate: number;
  lastMajorChange: Date;
  immersionEffectiveness: number;
}

// ========== Supporting Types ==========

export type EvolutionType = 'natural' | 'event-driven' | 'character-influenced' | 'plot-driven';
export type ChangeType = 'geographical' | 'cultural' | 'technological' | 'social' | 'political' | 'climatic';
export type ElementType = 'location' | 'artifact' | 'creature' | 'organization' | 'tradition' | 'phenomenon';
export type SignificanceLevel = 'minor' | 'moderate' | 'major' | 'critical';

export interface Geography {
  continents: Continent[];
  oceans: Ocean[];
  climateZones: ClimateZone[];
  naturalResources: NaturalResource[];
}

export interface Climate {
  globalPattern: string;
  seasonalVariations: SeasonalVariation[];
  extremeEvents: ClimateEvent[];
  impact: ClimateImpact;
}

export interface Culture {
  id: string;
  name: string;
  values: string[];
  traditions: Tradition[];
  language: Language;
  artForms: ArtForm[];
  socialStructure: SocialStructure;
}

export interface Technology {
  id: string;
  name: string;
  level: TechLevel;
  applications: string[];
  limitations: string[];
  culturalImpact: string;
}

export interface Society {
  id: string;
  name: string;
  structure: SocialStructure;
  hierarchy: SocialHierarchy;
  customs: Custom[];
  conflicts: SocialConflict[];
}

// ========== Configuration ==========

export interface WorldConfig {
  enabled: boolean;
  detailLevel: DetailLevel;
  consistencyChecking: boolean;
  autoEvolution: boolean;
  immersionPriority: ImmersionPriority;
  validationSettings: ValidationSettings;
}

export type DetailLevel = 'minimal' | 'standard' | 'detailed' | 'comprehensive';
export type ImmersionPriority = 'speed' | 'balance' | 'quality' | 'maximum';

export interface ValidationSettings {
  logicValidation: boolean;
  physicsValidation: boolean;
  cultureValidation: boolean;
  timelineValidation: boolean;
  strictness: ValidationStrictness;
}

export type ValidationStrictness = 'relaxed' | 'standard' | 'strict' | 'rigid';

// ========== Missing Interface Definitions ==========

export interface GenerationContext {
  chapterNumber: number;
  location: string;
  characters: string[];
  themes: string[];
  plotElements: string[];
}

export interface WorldSetting {
  id: string;
  name: string;
  type: string;
  description: string;
  properties: any;
}

export interface ChangeImpact {
  magnitude: number;
  scope: string;
  duration: string;
  reversibility: string;
}

export interface PredictedChange {
  type: string;
  probability: number;
  description: string;
  timeframe: string;
}

export interface PredictionTimeframe {
  amount: number;
  unit: string;
}

export interface PredictionFactor {
  name: string;
  influence: number;
  description: string;
}

export interface AlternativeScenario {
  id: string;
  name: string;
  probability: number;
  description: string;
  changes: PredictedChange[];
}

export interface DescriptionAspect {
  type: string;
  content: string;
  importance: number;
}

export interface SensoryDetail {
  sense: string;
  description: string;
  intensity: number;
}

export interface AtmosphericElement {
  type: string;
  description: string;
  impact: number;
}

export interface NaturalFeature {
  id: string;
  name: string;
  type: string;
  significance: number;
  description: string;
}

export interface Region {
  id: string;
  name: string;
  type: string;
  characteristics: string[];
  subRegions: string[];
}

export interface ClimatePattern {
  type: string;
  characteristics: string[];
  variations: any[];
}

export interface ClimateEvent {
  type: string;
  frequency: number;
  intensity: number;
  impact: string[];
}

export interface ClimateImpact {
  agriculture: string;
  society: string;
  economy: string;
}

export interface DepthRange {
  minimum: number;
  maximum: number;
  average: number;
}

export interface OceanCurrent {
  id: string;
  name: string;
  direction: string;
  strength: number;
  temperature: number;
}

export interface MaritimeRoute {
  id: string;
  name: string;
  path: string[];
  usage: number;
  safety: number;
}

export interface TemperatureRange {
  minimum: number;
  maximum: number;
  average: number;
}

export type PrecipitationLevel = 'arid' | 'low' | 'moderate' | 'high' | 'extreme';

export interface Season {
  name: string;
  duration: number;
  characteristics: string[];
  temperature: TemperatureRange;
}

export interface ClimateExtreme {
  type: string;
  frequency: number;
  intensity: number;
  duration: number;
}

export interface WritingSystem {
  type: string;
  complexity: number;
  usage: string;
}

export interface Dialect {
  name: string;
  speakers: number;
  region: string;
  characteristics: string[];
}

export interface HistoricalOrigin {
  era: string;
  event: string;
  significance: number;
}

export interface TraditionPractice {
  name: string;
  frequency: string;
  participants: string[];
  significance: number;
}

export type CulturalSignificance = 'minor' | 'moderate' | 'important' | 'critical' | 'defining';

export interface TraditionEvolution {
  period: string;
  changes: string[];
  factors: string[];
}

export type ArtStyle = 'classical' | 'folk' | 'modern' | 'abstract' | 'religious' | 'ceremonial';

export type CulturalRole = 'entertainment' | 'education' | 'religious' | 'political' | 'social' | 'economic';

export interface Masterpiece {
  id: string;
  name: string;
  creator: string;
  significance: number;
  influence: string[];
}

export interface SocialHierarchy {
  levels: number;
  classes: SocialClass[];
  mobility: MobilityLevel;
}

export type MobilityLevel = 'rigid' | 'limited' | 'moderate' | 'flexible' | 'fluid';

export interface Government {
  id: string;
  name: string;
  type: GovernmentType;
  structure: GovernmentStructure;
  effectiveness: number;
}

export type GovernmentType = 'monarchy' | 'republic' | 'democracy' | 'oligarchy' | 'theocracy' | 'technocracy';

export interface GovernmentStructure {
  branches: GovernmentBranch[];
  powerBalance: number;
  checks: string[];
}

export interface GovernmentBranch {
  name: string;
  type: string;
  power: number;
  responsibilities: string[];
}

export interface Continent {
  id: string;
  name: string;
  size: number;
  climate: ClimatePattern;
  majorRegions: Region[];
  naturalFeatures: NaturalFeature[];
}

export interface Ocean {
  id: string;
  name: string;
  size: number;
  depth: DepthRange;
  currents: OceanCurrent[];
  maritimeRoutes: MaritimeRoute[];
}

export interface ClimateZone {
  id: string;
  name: string;
  temperature: TemperatureRange;
  precipitation: PrecipitationLevel;
  seasons: Season[];
  extremeEvents: ClimateExtreme[];
}

export interface Custom {
  id: string;
  name: string;
  type: string;
  significance: number;
  practice: string;
}

export interface SocialConflict {
  id: string;
  name: string;
  type: string;
  intensity: number;
  parties: string[];
}

export interface CulturalContext {
  dominantCulture: string;
  subcultures: string[];
  traditions: string[];
  socialNorms: string[];
  values: string[];
}

export interface ConsistencyRecommendation {
  type: string;
  priority: number;
  description: string;
  implementation: string;
}

// ========== Additional Missing Types ==========

export interface WorldEvent {
  id: string;
  name: string;
  type: string;
  date: Date;
  location: string;
  participants: string[];
  consequences: string[];
}

export interface WorldChange {
  id: string;
  type: string;
  description: string;
  magnitude: number;
  affectedAreas: string[];
}

export interface EvolutionCause {
  type: string;
  description: string;
  influence: number;
}

export interface EvolutionImpact {
  scope: string[];
  magnitude: number;
  duration: string;
  reversibility: string;
}

export interface ElementProperty {
  name: string;
  value: any;
  type: string;
}

export interface ElementRelationship {
  type: string;
  target: string;
  strength: number;
  nature: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

export interface Inconsistency {
  id: string;
  type: string;
  severity: string;
  description: string;
  location: string;
}

export interface DescriptionContext {
  purpose: string;
  audience: string;
  detailLevel: string;
  focus: string[];
}

export interface DetailFocus {
  primary: string[];
  secondary: string[];
  exclude: string[];
}

export interface OptimizedDescription {
  original: string;
  optimized: string;
  improvements: string[];
  score: number;
}

export interface AtmosphereDescription {
  mainAtmosphere: string;
  elements: string[];
  sensoryDetails: string[];
  emotionalTone: string;
}

export interface WorldRule {
  id: string;
  type: string;
  description: string;
  enforcement: string;
  exceptions: string[];
}

export interface LogicValidation {
  isLogical: boolean;
  contradictions: string[];
  issues: string[];
  recommendations: string[];
}

export interface WorldPhysics {
  laws: PhysicsLaw[];
  constants: PhysicsConstant[];
  exceptions: PhysicsException[];
}

export interface PhysicsLaw {
  name: string;
  description: string;
  scope: string;
  strength: number;
}

export interface PhysicsConstant {
  name: string;
  value: number;
  unit: string;
  variability: number;
}

export interface PhysicsException {
  condition: string;
  effect: string;
  rarity: number;
}

export interface PhysicsValidation {
  isConsistent: boolean;
  violations: string[];
  warnings: string[];
  score: number;
}

export interface CultureValidation {
  isConsistent: boolean;
  conflicts: string[];
  anachronisms: string[];
  score: number;
}

export interface TimelineValidation {
  isConsistent: boolean;
  timelineErrors: string[];
  causality: string[];
  score: number;
}

export interface EvolutionData {
  id: string;
  timestamp: Date;
  changes: WorldChange[];
  causes: EvolutionCause[];
  impact: EvolutionImpact;
}

export interface NaturalChange {
  id: string;
  type: string;
  cause: string;
  magnitude: number;
  affectedAreas: string[];
}

export interface EventDrivenChange {
  id: string;
  triggerEvent: string;
  resultingChanges: WorldChange[];
  timeframe: string;
}

export interface ConsistencyValidation {
  overall: number;
  aspects: ValidationAspect[];
  issues: string[];
  recommendations: string[];
}

export interface ValidationAspect {
  name: string;
  score: number;
  status: string;
  details: string[];
}

// Missing type definitions
// WorldTimeline interface moved to types.ts to avoid duplicate definition

export interface WorldMood {
  overall: string;
  tension: number;
  hope: number;
  mystery: number;
}

export interface MagicSystem {
  type: 'hard' | 'soft' | 'none';
  rules: string[];
  limitations: string[];
  practitioners: string[];
}

export interface HistoricalEvent {
  id: string;
  name: string;
  date: string;
  impact: string;
  participants: string[];
}

export interface Economy {
  type: string;
  currency: string;
  tradeRoutes: string[];
  primaryIndustries: string[];
}

// export interface Weather {
//   climate: string;
//   seasons: Season[];
//   patterns: WeatherPattern[];
// }

// export interface Atmosphere {
//   mood: string;
//   tension: number;
//   ambiance: string;
//   sensoryDetails: string[];
// }

export interface NaturalResource {
  name: string;
  type: string;
  abundance: 'rare' | 'common' | 'abundant';
  location: string;
}

export interface SeasonalVariation {
  season: string;
  changes: string[];
  effects: string[];
}

export interface Tradition {
  name: string;
  origin: string;
  practices: string[];
  significance: string;
}

export interface Language {
  name: string;
  speakers: number;
  script: string;
  dialects: string[];
}

export interface ArtForm {
  type: string;
  style: string;
  materials: string[];
  cultural_significance: string;
}

export interface SocialStructure {
  type: string;
  hierarchy: string[];
  classes: SocialClass[];
  mobility: 'none' | 'limited' | 'moderate' | 'high';
}

export interface SocialClass {
  name: string;
  population_percentage: number;
  privileges: string[];
  restrictions: string[];
}

export interface TechLevel {
  era: string;
  advancement: number;
  key_technologies: string[];
  limitations: string[];
}

// Supporting interfaces
export interface Era {
  name: string;
  startYear: number;
  endYear: number;
  characteristics: string[];
}

// Season interface removed - already defined at line 383 with proper TemperatureRange type

export interface WeatherPattern {
  type: string;
  frequency: string;
  effects: string[];
}

// SystemHealth and EnhancedContent interfaces are imported from types.ts

// ============================================================================
// World Collector用のエクスポート
// ============================================================================

export type { LocationInfo, CulturalElementInfo, PhysicalConstraintInfo } from './types';