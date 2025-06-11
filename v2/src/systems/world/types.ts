/**
 * World System Types
 * 世界観設定システムの型定義
 */

import type { Season, OceanCurrent } from './interfaces';

// ========== Core World Types ==========

export interface StateFactor {
  id: string;
  type: string;
  influence: number;
  scope: string[];
  duration: string;
}

export interface WorldState {
  id: string;
  timestamp: Date;
  globalState: GlobalState;
  regionalStates: RegionalState[];
  activeFactors: StateFactor[];
  stability: StabilityIndex;
}

export interface PoliticalClimate {
  stability: number;
  freedom: number;
  corruption: number;
  conflicts: string[];
  leadership: string;
}

export interface EconomicCondition {
  growth: number;
  inflation: number;
  unemployment: number;
  inequality: number;
  mainSectors: string[];
}

export interface CulturalDominance {
  culture: string;
  influence: number;
  regions: string[];
  trends: string[];
}

export interface NaturalCondition {
  type: string;
  severity: number;
  location: string[];
  impact: string[];
}

export interface GlobalState {
  politicalClimate: PoliticalClimate;
  economicCondition: EconomicCondition;
  technologicalLevel: TechnologicalLevel;
  culturalDominance: CulturalDominance[];
  naturalConditions: NaturalCondition[];
}

export interface LocalCondition {
  type: string;
  value: number;
  description: string;
  trend: string;
}

export interface PopulationData {
  total: number;
  demographics: Demographics;
  density: number;
  growth: number;
  distribution: PopulationDistribution;
}

export interface Demographics {
  ageGroups: AgeGroup[];
  ethnicGroups: EthnicGroup[];
  educationLevels: EducationLevel[];
  occupations: Occupation[];
}

export interface AgeGroup {
  range: string;
  percentage: number;
  characteristics: string[];
}

export interface EthnicGroup {
  name: string;
  percentage: number;
  culture: string;
  traditions: string[];
}

export interface EducationLevel {
  level: string;
  percentage: number;
  accessibility: number;
}

export interface Occupation {
  category: string;
  percentage: number;
  averageIncome: number;
}

export interface PopulationDistribution {
  urban: number;
  rural: number;
  nomadic: number;
}

export interface ResourceAvailability {
  resource: string;
  abundance: number;
  accessibility: number;
  quality: number;
  exploitation: number;
}

export interface RegionalConflict {
  id: string;
  type: string;
  intensity: number;
  parties: string[];
  causes: string[];
  duration: string;
}

export interface RegionalState {
  regionId: string;
  name: string;
  localConditions: LocalCondition[];
  population: PopulationData;
  resources: ResourceAvailability[];
  conflicts: RegionalConflict[];
}

// ========== Geographic Types ==========

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  coordinates: Coordinates;
  description: string;
  parentRegion?: string;
  subLocations: string[];
  characteristics: LocationCharacteristic[];
}

export type LocationType = 'city' | 'town' | 'village' | 'wilderness' | 'ruins' | 'landmark' | 'dungeon' | 'sanctuary';

export interface Coordinates {
  x: number;
  y: number;
  z?: number;
  system: CoordinateSystem;
}

export type CoordinateSystem = 'absolute' | 'relative' | 'narrative';

export interface CharacteristicImpact {
  type: string;
  magnitude: number;
  scope: string[];
  duration: string;
}

export interface LocationCharacteristic {
  type: CharacteristicType;
  value: string | number;
  description: string;
  impact: CharacteristicImpact;
}

export type CharacteristicType = 'climate' | 'terrain' | 'population' | 'culture' | 'economy' | 'defense' | 'magic' | 'history';

// Season and OceanCurrent interfaces are imported from interfaces.ts

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

// ========== Cultural Types ==========

export interface Language {
  id: string;
  name: string;
  family: LanguageFamily;
  speakers: number;
  writingSystem: WritingSystem;
  dialects: Dialect[];
  status: LanguageStatus;
}

export type LanguageFamily = 'ancient' | 'common' | 'exotic' | 'magical' | 'artificial';
export type LanguageStatus = 'primary' | 'secondary' | 'ceremonial' | 'extinct' | 'evolving';

export interface Tradition {
  id: string;
  name: string;
  type: TraditionType;
  origin: HistoricalOrigin;
  practices: TraditionPractice[];
  significance: CulturalSignificance;
  evolution: TraditionEvolution[];
}

export type TraditionType = 'religious' | 'social' | 'economic' | 'artistic' | 'martial' | 'educational';

export interface ArtForm {
  id: string;
  name: string;
  medium: ArtMedium;
  style: ArtStyle;
  culturalRole: CulturalRole;
  masterpieces: Masterpiece[];
}

export type ArtMedium = 'visual' | 'musical' | 'literary' | 'performative' | 'architectural' | 'crafts';

export interface SocialStructure {
  hierarchyType: HierarchyType;
  socialClasses: SocialClass[];
  mobilityFactors: MobilityFactor[];
  powerDistribution: PowerDistribution;
}

export type HierarchyType = 'egalitarian' | 'meritocratic' | 'aristocratic' | 'theocratic' | 'plutocratic' | 'tribal';

// ========== Technological Types ==========

export type TechLevel = 'primitive' | 'ancient' | 'medieval' | 'renaissance' | 'industrial' | 'modern' | 'futuristic' | 'magical';

export interface TechnologicalLevel {
  overall: TechLevel;
  categories: TechCategory[];
  innovations: Innovation[];
  limitations: TechLimitation[];
}

export interface TechCategory {
  category: TechCategoryType;
  level: TechLevel;
  keyTechnologies: string[];
  developmentTrend: DevelopmentTrend;
}

export type TechCategoryType = 'agriculture' | 'medicine' | 'transportation' | 'communication' | 'warfare' | 'manufacturing' | 'energy' | 'magic';

export interface Innovation {
  id: string;
  name: string;
  category: TechCategoryType;
  impact: InnovationImpact;
  adoptionRate: AdoptionRate;
  requirements: TechRequirement[];
}

// ========== Historical Types ==========

export interface WorldTimeline {
  id: string;
  totalSpan: TimeSpan;
  eras: Era[];
  majorEvents: HistoricalEvent[];
  cyclicalPatterns: CyclicalPattern[];
}

export interface Era {
  id: string;
  name: string;
  startYear: number;
  endYear?: number;
  characteristics: EraCharacteristic[];
  dominantForces: DominantForce[];
}

export interface HistoricalEvent {
  id: string;
  name: string;
  type: EventType;
  date: HistoricalDate;
  location: string;
  participants: EventParticipant[];
  causes: EventCause[];
  consequences: EventConsequence[];
  significance: HistoricalSignificance;
}

export type EventType = 'war' | 'discovery' | 'disaster' | 'political' | 'cultural' | 'technological' | 'magical' | 'supernatural';

export interface HistoricalDate {
  year: number;
  month?: number;
  day?: number;
  precision: DatePrecision;
  calendar: CalendarSystem;
}

export type DatePrecision = 'exact' | 'approximate' | 'era' | 'unknown';

// ========== Magic System Types ==========

export interface MagicSystem {
  id: string;
  name: string;
  type: MagicType;
  source: MagicSource;
  rules: MagicRule[];
  limitations: MagicLimitation[];
  practitioners: MagicPractitioner[];
  culturalImpact: MagicCulturalImpact;
}

export type MagicType = 'elemental' | 'divine' | 'arcane' | 'natural' | 'blood' | 'mind' | 'void' | 'creation';
export type MagicSource = 'innate' | 'learned' | 'artifact' | 'environmental' | 'divine' | 'pact';

export interface MagicRule {
  id: string;
  principle: string;
  application: string;
  exceptions: MagicException[];
  enforcement: MagicEnforcement;
}

// ========== Economic Types ==========

export interface Economy {
  id: string;
  name: string;
  type: EconomicType;
  currency: Currency;
  tradeRoutes: TradeRoute[];
  resources: EconomicResource[];
  markets: Market[];
  regulation: EconomicRegulation;
}

export type EconomicType = 'barter' | 'feudal' | 'mercantile' | 'capitalist' | 'socialist' | 'mixed' | 'post-scarcity';

export interface Currency {
  id: string;
  name: string;
  type: CurrencyType;
  value: CurrencyValue;
  circulation: CurrencyCirculation;
  backing: CurrencyBacking;
}

export type CurrencyType = 'commodity' | 'representative' | 'fiat' | 'magical' | 'energy-based';

export interface TradeRoute {
  id: string;
  name: string;
  endpoints: string[];
  intermediateStops: string[];
  tradedGoods: TradedGood[];
  risks: TradeRisk[];
  profitability: number;
}

// ========== Weather and Natural Types ==========

export interface Weather {
  current: WeatherCondition;
  forecast: WeatherForecast[];
  seasonalPattern: SeasonalPattern;
  extremeEvents: WeatherExtreme[];
}

export interface WeatherCondition {
  temperature: number;
  humidity: number;
  precipitation: PrecipitationType;
  windSpeed: number;
  windDirection: string;
  visibility: VisibilityLevel;
  atmosphere: AtmosphericCondition;
}

export type PrecipitationType = 'none' | 'drizzle' | 'rain' | 'snow' | 'sleet' | 'hail' | 'magical';

export interface SeasonalVariation {
  season: string;
  characteristics: SeasonCharacteristic[];
  duration: number;
  transitions: SeasonTransition[];
}

export interface NaturalResource {
  id: string;
  name: string;
  type: ResourceType;
  abundance: AbundanceLevel;
  quality: QualityLevel;
  accessibility: AccessibilityLevel;
  renewability: RenewabilityType;
  economicValue: number;
}

export type ResourceType = 'mineral' | 'biological' | 'energy' | 'water' | 'magical' | 'rare';
export type AbundanceLevel = 'scarce' | 'limited' | 'moderate' | 'abundant' | 'unlimited';

// ========== Evolution and Change Types ==========

export interface EvolutionData {
  id: string;
  chapterNumber: number;
  changeMagnitude: number;
  affectedSystems: EvolutionSystem[];
  drivingForces: EvolutionForce[];
  timeline: EvolutionTimeline;
}

export interface EvolutionSystem {
  systemType: WorldSystemType;
  changeIntensity: number;
  specificChanges: SystemChange[];
  interconnectedEffects: InterconnectionEffect[];
}

export type WorldSystemType = 'political' | 'economic' | 'cultural' | 'technological' | 'environmental' | 'magical' | 'social';

export interface NaturalChange {
  id: string;
  type: NaturalChangeType;
  cause: NaturalCause;
  affectedAreas: string[];
  duration: ChangeDuration;
  reversibility: ChangeReversibility;
}

export type NaturalChangeType = 'geological' | 'climatic' | 'ecological' | 'demographic' | 'seasonal';

export interface EventDrivenChange {
  id: string;
  triggerEvent: string;
  changeType: ChangeType;
  magnitude: ChangeMagnitude;
  propagation: ChangePropagation[];
  stabilityImpact: StabilityImpact;
}

// ========== Atmosphere and Immersion Types ==========

export interface Atmosphere {
  mood: WorldMood;
  tension: TensionLevel;
  mystery: MysteryLevel;
  beauty: BeautyLevel;
  danger: DangerLevel;
  magic: MagicPresence;
}

export type WorldMood = 'peaceful' | 'tense' | 'mysterious' | 'ominous' | 'hopeful' | 'melancholic' | 'exciting' | 'serene';
export type TensionLevel = 'relaxed' | 'mild' | 'moderate' | 'high' | 'extreme';

export interface EnhancedContent {
  originalContent: string;
  enhancedContent: string;
  immersionElements: ImmersionElement[];
  sensoryEnhancements: SensoryEnhancement[];
  atmosphericAdditions: AtmosphericAddition[];
  immersionScore: number;
}

export interface ImmersionElement {
  type: ImmersionType;
  content: string;
  impact: ImmersionImpact;
  placement: ElementPlacement;
}

export type ImmersionType = 'sensory' | 'emotional' | 'cultural' | 'historical' | 'atmospheric' | 'interactive';

// ========== Validation Types ==========

export interface ValidationResult {
  aspect: string;
  status: ValidationStatus;
  score: number;
  issues: ValidationIssue[];
  suggestions: ValidationSuggestion[];
}

export type ValidationStatus = 'valid' | 'warning' | 'error' | 'critical';

export interface Inconsistency {
  id: string;
  type: InconsistencyType;
  severity: InconsistencySeverity;
  description: string;
  affectedElements: string[];
  suggestedFix: string;
}

export type InconsistencyType = 'logical' | 'temporal' | 'cultural' | 'physical' | 'magical' | 'economic';
export type InconsistencySeverity = 'minor' | 'moderate' | 'major' | 'critical';

// ========== Supporting Utility Types ==========

export interface TimeSpan {
  amount: number;
  unit: TimeUnit;
  description: string;
}

export type TimeUnit = 'days' | 'months' | 'years' | 'decades' | 'centuries' | 'millennia';

export interface StabilityIndex {
  overall: number;
  political: number;
  economic: number;
  social: number;
  environmental: number;
  magical?: number;
}

export interface SystemHealth {
  status: HealthStatus;
  performanceMetrics: PerformanceMetric[];
  resourceUsage: ResourceUsage;
  lastCheck: Date;
}

export type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: MetricStatus;
}

export type MetricStatus = 'optimal' | 'acceptable' | 'warning' | 'critical';

// ========== Missing Type Definitions ==========

export interface SocialClass {
  id: string;
  name: string;
  level: number;
  characteristics: string[];
  privileges: string[];
  obligations: string[];
}

export interface MobilityFactor {
  type: string;
  impact: number;
  description: string;
}

export interface PowerDistribution {
  concentration: number;
  type: PowerDistributionType;
  influenceNetworks: InfluenceNetwork[];
}

export type PowerDistributionType = 'centralized' | 'distributed' | 'federal' | 'anarchic';

export interface InfluenceNetwork {
  id: string;
  type: string;
  members: string[];
  influence: number;
}

export interface PowerShift {
  id: string;
  from: string;
  to: string;
  magnitude: number;
  timeframe: string;
}

export interface TechLimitation {
  type: string;
  description: string;
  severity: number;
}

export interface DevelopmentTrend {
  direction: 'advancing' | 'stagnating' | 'declining';
  rate: number;
  factors: string[];
}

export interface InnovationImpact {
  economic: number;
  social: number;
  technological: number;
  cultural: number;
}

export interface AdoptionRate {
  current: number;
  projected: number;
  factors: string[];
}

export interface TechRequirement {
  type: string;
  description: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
}

export interface CyclicalPattern {
  id: string;
  name: string;
  period: TimeSpan;
  phases: CyclicalPhase[];
}

export interface CyclicalPhase {
  name: string;
  duration: TimeSpan;
  characteristics: string[];
}

export interface EraCharacteristic {
  type: string;
  description: string;
  intensity: number;
}

export interface DominantForce {
  type: string;
  name: string;
  influence: number;
  scope: string[];
}

export interface EventParticipant {
  id: string;
  name: string;
  role: string;
  involvement: number;
}

export interface EventCause {
  type: string;
  description: string;
  significance: number;
}

export interface EventConsequence {
  type: string;
  description: string;
  impact: ConsequenceImpact;
}

export interface ConsequenceImpact {
  scope: string[];
  magnitude: number;
  duration: string;
}

export interface HistoricalSignificance {
  level: 'minor' | 'moderate' | 'major' | 'critical' | 'legendary';
  aspects: string[];
  legacyImpact: number;
}

export type CalendarSystem = 'gregorian' | 'lunar' | 'custom' | 'magical';

export interface MagicLimitation {
  type: string;
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'absolute';
}

export interface MagicPractitioner {
  type: string;
  population: number;
  skillLevel: string;
  socialStatus: string;
}

export interface MagicCulturalImpact {
  acceptance: number;
  integration: number;
  conflicts: string[];
  benefits: string[];
}

export interface MagicException {
  condition: string;
  effect: string;
  rarity: number;
}

export interface MagicEnforcement {
  mechanism: string;
  strength: number;
  violations: string[];
}

export interface EconomicResource {
  id: string;
  name: string;
  type: string;
  abundance: number;
  value: number;
}

export interface Market {
  id: string;
  name: string;
  type: string;
  size: number;
  competition: number;
}

export interface EconomicRegulation {
  type: string;
  strictness: number;
  enforcement: number;
  impact: string[];
}

export interface CurrencyValue {
  nominal: number;
  purchasing: number;
  exchange: number;
  stability: number;
}

export interface CurrencyCirculation {
  total: number;
  velocity: number;
  distribution: number[];
}

export interface CurrencyBacking {
  type: string;
  asset: string;
  ratio: number;
  confidence: number;
}

export interface TradedGood {
  id: string;
  name: string;
  type: string;
  volume: number;
  value: number;
}

export interface TradeRisk {
  type: string;
  probability: number;
  impact: number;
  mitigation: string[];
}

export interface WeatherForecast {
  timeframe: string;
  conditions: WeatherCondition;
  probability: number;
}

export interface SeasonalPattern {
  spring: SeasonInfo;
  summer: SeasonInfo;
  autumn: SeasonInfo;
  winter: SeasonInfo;
}

export interface SeasonInfo {
  characteristics: string[];
  duration: number;
  transitions: string[];
}

export interface WeatherExtreme {
  type: string;
  intensity: number;
  frequency: number;
  impact: string[];
}

export type VisibilityLevel = 'clear' | 'good' | 'moderate' | 'poor' | 'very-poor';

export type AtmosphericCondition = 'clear' | 'hazy' | 'misty' | 'foggy' | 'stormy' | 'pleasant';

export interface SeasonCharacteristic {
  aspect: string;
  intensity: number;
  duration: number;
}

export interface SeasonTransition {
  from: string;
  to: string;
  duration: number;
  markers: string[];
}

export type QualityLevel = 'poor' | 'low' | 'moderate' | 'good' | 'excellent';
export type AccessibilityLevel = 'inaccessible' | 'difficult' | 'moderate' | 'easy' | 'trivial';
export type RenewabilityType = 'renewable' | 'limited-renewable' | 'non-renewable' | 'infinite';

export interface EvolutionForce {
  type: string;
  strength: number;
  direction: string;
  scope: string[];
}

export interface EvolutionTimeline {
  phases: EvolutionPhase[];
  duration: TimeSpan;
  milestones: EvolutionMilestone[];
}

export interface EvolutionPhase {
  name: string;
  duration: TimeSpan;
  characteristics: string[];
}

export interface EvolutionMilestone {
  name: string;
  significance: number;
  triggers: string[];
}

export interface SystemChange {
  aspect: string;
  type: string;
  magnitude: number;
  description: string;
}

export interface InterconnectionEffect {
  sourceSystem: string;
  targetSystem: string;
  effectType: string;
  strength: number;
}

export type NaturalCause = 'geological' | 'climatic' | 'biological' | 'astronomical' | 'environmental';

export interface ChangeDuration {
  estimated: TimeSpan;
  minimum: TimeSpan;
  maximum: TimeSpan;
}

export type ChangeReversibility = 'irreversible' | 'difficult' | 'moderate' | 'easy' | 'automatic';

export interface ChangeMagnitude {
  scale: number;
  scope: string[];
  intensity: number;
}

export interface ChangePropagation {
  path: string[];
  speed: number;
  attenuation: number;
}

export interface StabilityImpact {
  political: number;
  economic: number;
  social: number;
  environmental: number;
}

export type MysteryLevel = 'none' | 'low' | 'moderate' | 'high' | 'maximum';
export type BeautyLevel = 'ugly' | 'plain' | 'pleasant' | 'beautiful' | 'breathtaking';
export type DangerLevel = 'safe' | 'minimal' | 'moderate' | 'dangerous' | 'lethal';
export type MagicPresence = 'none' | 'trace' | 'moderate' | 'strong' | 'overwhelming';

export interface SensoryEnhancement {
  sense: 'sight' | 'sound' | 'smell' | 'taste' | 'touch';
  description: string;
  intensity: number;
}

export interface AtmosphericAddition {
  type: string;
  content: string;
  impact: number;
}

export interface ImmersionImpact {
  emotional: number;
  cognitive: number;
  sensory: number;
}

export interface ElementPlacement {
  position: string;
  timing: string;
  context: string;
}

export interface ValidationIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
}

export interface ValidationSuggestion {
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  implementation: string;
}

export interface ResourceUsage {
  memory: number;
  cpu: number;
  storage: number;
}

// Missing type definitions for interfaces.ts
export interface ClimatePattern {
  type: string;
  frequency: string;
  seasonality: string[];
  effects: string[];
}

export interface Region {
  id: string;
  name: string;
  boundaries: string[];
  characteristics: string[];
  climate: string;
}

export interface NaturalFeature {
  type: string;
  name: string;
  location: string;
  significance: string;
  characteristics: string[];
}

export interface DepthRange {
  min: number;
  max: number;
  unit: 'meters' | 'feet' | 'fathoms';
}

// ============================================================================
// World Collector用の追加インターフェース
// ============================================================================

export interface LocationInfo {
  id: string;
  name: string;
  type: 'city' | 'building' | 'natural' | 'supernatural' | 'other';
  description: string;
  significance: number;
  accessibility: number;
  safetyLevel: number;
  populationDensity: number;
  culturalImportance: number;
  physicalFeatures: string[];
  connectedLocations: string[];
  activeInChapters: number[];
  environmentalConditions: any[];
  resources: any[];
  restrictions: any[];
}

export interface CulturalElementInfo {
  id: string;
  name: string;
  type: 'tradition' | 'belief' | 'practice' | 'artifact' | 'language' | 'other';
  description: string;
  origin: string;
  significance: number;
  prevalence: number;
  influence: number;
  relatedCharacters: string[];
  manifestations: string[];
  evolution: any[];
}

export interface PhysicalConstraintInfo {
  id: string;
  name: string;
  type: 'natural_law' | 'magical_law' | 'technological_limit' | 'social_constraint' | 'other';
  description: string;
  scope: 'global' | 'regional' | 'local' | 'conditional';
  strength: number;
  flexibility: number;
  exceptions: any[];
  affectedAreas: string[];
  consequences: string[];
}

export interface MaritimeRoute {
  name: string;
  start: string;
  end: string;
  distance: number;
  difficulty: 'easy' | 'moderate' | 'difficult' | 'dangerous';
}

export interface TemperatureRange {
  min: number;
  max: number;
  average: number;
  unit: 'celsius' | 'fahrenheit';
}

export interface PrecipitationLevel {
  amount: number;
  frequency: string;
  type: PrecipitationType;
  seasonal_variation: number;
}

// PrecipitationType enum removed - using type alias instead (line 407)

export interface ClimateExtreme {
  type: string;
  severity: number;
  frequency: string;
  impact: string[];
}

export interface WritingSystem {
  name: string;
  type: 'alphabetic' | 'syllabic' | 'logographic' | 'mixed';
  direction: 'ltr' | 'rtl' | 'ttb' | 'mixed';
  characters: number;
}

export interface Dialect {
  name: string;
  region: string;
  speakers: number;
  variations: string[];
  intelligibility: number;
}

export interface HistoricalOrigin {
  period: string;
  circumstances: string[];
  key_figures: string[];
  founding_event: string;
}

export interface TraditionPractice {
  name: string;
  frequency: string;
  participants: string[];
  requirements: string[];
}

export interface CulturalSignificance {
  importance: 'low' | 'medium' | 'high' | 'sacred';
  meaning: string;
  symbolism: string[];
  taboos: string[];
}

export interface TraditionEvolution {
  changes: string[];
  causes: string[];
  timeline: string;
  current_status: string;
}

export interface ArtStyle {
  name: string;
  period: string;
  characteristics: string[];
  influences: string[];
}

export interface CulturalRole {
  function: string;
  importance: string;
  practitioners: string[];
  social_status: string;
}

export interface Masterpiece {
  name: string;
  creator: string;
  period: string;
  significance: string;
  current_status: string;
}

export enum ChangeType {
  NATURAL = 'natural',
  POLITICAL = 'political',
  CULTURAL = 'cultural',
  TECHNOLOGICAL = 'technological',
  MAGICAL = 'magical',
  SOCIAL = 'social'
}