/**
 * World System - エクスポート定義
 * 世界観設定システムの統合インターフェース
 */

// Manager (主要エクスポート)
export { WorldManager } from './core/world-manager';

// Interfaces
export type {
  IWorldManager,
  IWorldEvolutionService,
  IWorldDescriptionService,
  IWorldValidationService,
  WorldSettings,
  WorldEvolution,
  WorldContext,
  WorldElement,
  ConsistencyReport,
  ChangeRecord,
  WorldPrediction,
  WorldDescription,
  WorldStatistics,
  WorldConfig
} from './interfaces';

// Types
export type {
  WorldState,
  GlobalState,
  RegionalState,
  Location,
  LocationType,
  Coordinates,
  CoordinateSystem,
  LocationCharacteristic,
  CharacteristicType,
  Language,
  LanguageFamily,
  LanguageStatus,
  Tradition,
  TraditionType,
  ArtForm,
  ArtMedium,
  SocialStructure,
  HierarchyType,
  TechLevel,
  TechnologicalLevel,
  TechCategory,
  TechCategoryType,
  Innovation,
  WorldTimeline,
  Era,
  HistoricalEvent,
  EventType,
  HistoricalDate,
  DatePrecision,
  MagicSystem,
  MagicType,
  MagicSource,
  MagicRule,
  Economy,
  EconomicType,
  Currency,
  CurrencyType,
  TradeRoute,
  Weather,
  WeatherCondition,
  PrecipitationType,
  SeasonalVariation,
  NaturalResource,
  ResourceType,
  AbundanceLevel,
  EvolutionData,
  EvolutionSystem,
  WorldSystemType,
  NaturalChange,
  NaturalChangeType,
  EventDrivenChange,
  Atmosphere,
  WorldMood,
  TensionLevel,
  EnhancedContent,
  ImmersionElement,
  ImmersionType,
  ValidationResult,
  ValidationStatus,
  Inconsistency,
  InconsistencyType,
  InconsistencySeverity,
  TimeSpan,
  TimeUnit,
  StabilityIndex,
  SystemHealth,
  HealthStatus,
  PerformanceMetric,
  MetricStatus
} from './types';

// Default export (ファサード)
export { WorldManager as default } from './core/world-manager';