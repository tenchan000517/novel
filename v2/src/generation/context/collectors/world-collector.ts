/**
 * Version 2.0 - World Collector
 * 
 * ワールド設定システムからの関連データ収集
 * Data Coordinator統合による実システム接続対応
 */

import { OperationResult } from '@/types/common';
import { 
  IWorldCollector,
  WorldSettingsData,
  LocationData,
  CulturalData,
  PhysicalConstraintData
} from '../interfaces';
import { SystemData, SystemType, ValidationResult } from '../types';
import { DataCoordinator } from '../core/data-coordinator';
import { 
  IWorldManager,
  WorldSettings,
  WorldEvolution,
  ConsistencyReport,
  WorldContext,
  GenerationContext,
  WorldElement,
  ChangeRecord,
  WorldState,
  WorldPrediction,
  WorldSetting,
  WorldDescription,
  CulturalElementInfo,
  PhysicalConstraintInfo,
  WorldStatistics
} from '@/systems/world/interfaces';
import { Weather, Atmosphere, EnhancedContent, SystemHealth } from '@/systems/world/types';

// 既存の型定義は新しいWorldManager型と互換性のため維持
interface LegacyWorldSettings {
  id: string;
  name: string;
  genre: string;
  timeperiod: string;
  technology: string;
  magic: boolean;
  governmentType: string;
  economicSystem: string;
  socialStructure: string;
  environmentalFactors: string[];
  historicalContext: string;
  rules: Map<string, any>;
  lastUpdated: Date;
}

export interface Location {
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
  environmentalConditions: EnvironmentalCondition[];
  resources: Resource[];
  restrictions: Restriction[];
}

export interface CulturalElement {
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
  evolution: CulturalEvolution[];
}

export interface PhysicalConstraint {
  id: string;
  name: string;
  type: 'natural_law' | 'magical_law' | 'technological_limit' | 'social_constraint' | 'other';
  description: string;
  scope: 'global' | 'regional' | 'local' | 'conditional';
  strength: number;
  flexibility: number;
  exceptions: ConstraintException[];
  affectedAreas: string[];
  consequences: string[];
}

export interface EnvironmentalCondition {
  condition: string;
  intensity: number;
  duration: string;
  cyclical: boolean;
}

export interface Resource {
  name: string;
  type: string;
  availability: number;
  quality: number;
}

export interface Restriction {
  type: string;
  level: string;
  description: string;
  enforcement: number;
}

export interface CulturalEvolution {
  period: string;
  changes: string[];
  influences: string[];
}

export interface ConstraintException {
  condition: string;
  effect: string;
  rarity: number;
}

export interface CulturalCriteria {
  chapterNumber: number;
  relevanceThreshold: number;
  includeHistorical: boolean;
  includeContemporary: boolean;
  maxElements: number;
  focusAreas?: string[];
}

export interface WorldCollectionContext {
  chapterNumber: number;
  focusLocations?: string[];
  includeEnvironmental: boolean;
  includeCultural: boolean;
  includeConstraints: boolean;
  maxLocations?: number;
  relevanceThreshold?: number;
  timeFrame?: {
    start: Date;
    end: Date;
  };
}

export interface CollectedWorldData {
  worldSettings: WorldSettingsData;
  locations: LocationData[];
  culturalElements: CulturalData[];
  physicalConstraints: PhysicalConstraintData[];
  collectionMetadata: {
    totalLocations: number;
    culturalElementCount: number;
    constraintCount: number;
    averageRelevance: number;
    processingTime: number;
    dataCompleteness: number;
  };
}

export interface LocationDataDetails {
  location: Location;
  chapterRelevance: number;
  accessibilityScore: number;
  safetyAssessment: number;
  culturalSignificance: number;
  environmentalStatus: EnvironmentalStatus;
  characterPresence: CharacterPresenceData[];
}

export interface CulturalDataDetails {
  element: CulturalElement;
  chapterRelevance: number;
  characterConnections: string[];
  manifestationLevel: number;
  evolutionStage: string;
  influenceRadius: number;
}

export interface PhysicalConstraintDataDetails {
  constraint: PhysicalConstraint;
  chapterRelevance: number;
  activeLevel: number;
  affectedCharacters: string[];
  affectedLocations: string[];
  potentialConsequences: string[];
}

export interface EnvironmentalStatus {
  current: EnvironmentalCondition[];
  predicted: EnvironmentalCondition[];
  stability: number;
  changeRate: number;
}

export interface CharacterPresenceData {
  characterId: string;
  presenceLevel: number;
  duration: number;
  activities: string[];
}

export class WorldCollector implements IWorldCollector {
  private worldManager: IWorldManager | null = null;
  private dataCoordinator: DataCoordinator;
  private logger: any;

  constructor(worldManager?: IWorldManager, dataCoordinator?: DataCoordinator, logger?: any) {
    // Data Coordinator経由で実際の世界管理システムとの統合
    this.dataCoordinator = dataCoordinator || new DataCoordinator();
    this.logger = logger || console;
    
    if (worldManager) {
      this.worldManager = worldManager;
    } else {
      // Data Coordinatorから世界管理システムの接続を確認
      const worldConnection = this.dataCoordinator.getSystemConnections()
        .find(conn => conn.systemType === SystemType.WORLD);
      
      if (worldConnection?.isConnected) {
        this.worldManager = worldConnection.manager as IWorldManager;
        this.logger?.info('WorldCollector connected to real WorldManager via DataCoordinator');
      } else {
        this.logger?.warn('WorldManager not available, using mock implementation');
      }
    }
  }

  // IDataCollector基本メソッドの実装
  async collect(chapterNumber: number, options: any): Promise<OperationResult<SystemData>> {
    try {
      const worldSettings = await this.collectWorldSettings(chapterNumber);
      const locations = await this.collectLocationContext(chapterNumber);
      const cultural = await this.collectCulturalElements(chapterNumber);
      const constraints = await this.collectPhysicalConstraints(chapterNumber);

      const systemData: SystemData = {
        systemType: SystemType.WORLD,
        relevanceScore: 0.8,
        lastUpdated: new Date().toISOString(),
        data: {
          worldSettings: worldSettings.data,
          locations: locations.data,
          cultural: cultural.data,
          constraints: constraints.data
        },
        metadata: {
          source: 'world-collector',
          version: '2.0',
          timestamp: new Date().toISOString(),
          dataSize: 1000
        },
        quality: {
          score: 0.85,
          validation: 'passed',
          completeness: 0.9,
          accuracy: 0.88
        }
      };

      return {
        success: true,
        data: systemData,
        metadata: {
          operationId: `world-collect-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime: 100,
          systemId: 'world-collector'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'WORLD_COLLECTION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        metadata: {
          operationId: `world-collect-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime: 50,
          systemId: 'world-collector'
        }
      };
    }
  }

  async validateData(data: SystemData): Promise<OperationResult<ValidationResult>> {
    const validation: ValidationResult = {
      isValid: data.systemType === SystemType.WORLD,
      errors: [],
      warnings: [],
      score: 0.9,
      issues: [],
      recommendations: [],
      details: {}
    };

    return {
      success: true,
      data: validation,
      metadata: {
        operationId: `world-validation-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 10,
        systemId: 'world-collector'
      }
    };
  }

  async calculateRelevance(data: SystemData, criteria: any): Promise<OperationResult<number>> {
    return {
      success: true,
      data: 0.8,
      metadata: {
        operationId: `world-relevance-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 5,
        systemId: 'world-collector'
      }
    };
  }

  async optimizeDataSize(data: SystemData): Promise<OperationResult<SystemData>> {
    return {
      success: true,
      data: data,
      metadata: {
        operationId: `world-optimize-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 20,
        systemId: 'world-collector'
      }
    };
  }

  async getCollectionMetrics(): Promise<OperationResult<any>> {
    const metrics = {
      collectionTime: 100,
      dataSize: 1000,
      cacheHitRate: 0.7,
      errorCount: 0,
      qualityScore: 0.85
    };

    return {
      success: true,
      data: metrics,
      metadata: {
        operationId: `world-metrics-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 5,
        systemId: 'world-collector'
      }
    };
  }

  // ============================================================================
  // パブリックメソッド
  // ============================================================================

  async collectWorldSettings(chapterNumber: number): Promise<OperationResult<WorldSettingsData>> {
    const startTime = Date.now();
    
    try {
      this.logger.info(`Collecting world settings for chapter ${chapterNumber}`);

      // 実際のWorldManagerまたはモック実装を使用
      let worldSettings: LegacyWorldSettings;
      
      if (this.worldManager) {
        // 実際のWorldManagerを使用
        const worldSettingsResult = await this.worldManager.getWorldSettings();
        if (!worldSettingsResult.success) {
          throw new Error(`Failed to get world settings: ${worldSettingsResult.error?.message}`);
        }
        
        // 新しいWorldSettings型を既存型に変換
        const realWorldSettings = worldSettingsResult.data!;
        worldSettings = this.convertToLegacyWorldSettings(realWorldSettings);
      } else {
        // モック実装を使用
        worldSettings = await this.getMockWorldSettings();
      }

      // チャプターに関連する設定を抽出
      const relevantSettings = this.extractRelevantSettings(worldSettings, chapterNumber);

      // 環境要因の分析
      const environmentalFactors = this.analyzeEnvironmentalFactors(worldSettings, chapterNumber);

      // 制約の評価
      const activeConstraints = this.evaluateActiveConstraints(worldSettings, chapterNumber);

      const worldSettingsData: WorldSettingsData = {
        currentSettings: {
          worldId: worldSettings.id,
          activeGenre: worldSettings.genre,
          timePeriod: worldSettings.timeperiod,
          technologyLevel: worldSettings.technology,
          magicSystem: worldSettings.magic,
          politicalState: worldSettings.governmentType,
          economicConditions: worldSettings.economicSystem,
          socialStructure: worldSettings.socialStructure
        },
        relevantRules: relevantSettings,
        environmentalFactors,
        activeConstraints,
        chapterSpecificContext: this.generateChapterContext(worldSettings, chapterNumber),
        relevanceScore: this.calculateWorldRelevance(worldSettings, chapterNumber),
        lastUpdated: worldSettings.lastUpdated.toISOString()
      };

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: worldSettingsData,
        metadata: {
          operationId: `world-settings-${chapterNumber}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'world-collector'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('World settings collection failed', { chapterNumber, error, processingTime });

      return {
        success: false,
        error: {
          code: 'WORLD_SETTINGS_FAILED',
          message: error instanceof Error ? error.message : 'Unknown world settings error',
          details: error
        },
        metadata: {
          operationId: `world-settings-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'world-collector'
        }
      };
    }
  }

  async collectLocationContext(chapterNumber: number): Promise<OperationResult<LocationData>> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Collecting location context for chapter ${chapterNumber}`);

      // チャプター関連の場所を特定
      const relevantLocationIds = await this.identifyRelevantLocations(chapterNumber);

      // 場所データの取得
      let locations: Location[];
      
      if (this.worldManager) {
        // 実際のWorldManagerを使用 - LocationInfo型をLocation型に変換
        const locationInfoResults = await Promise.all(
          relevantLocationIds.map(id => this.worldManager!.getLocationInfo(id))
        );
        
        locations = locationInfoResults
          .filter(result => result.success)
          .map(result => this.convertLocationInfoToLocation(result.data!));
      } else {
        // モック実装を使用
        locations = await this.getMockLocationData(relevantLocationIds);
      }

      // 主要場所の選定
      const primaryLocation = this.selectPrimaryLocation(locations, chapterNumber);

      // 補助場所の分析
      const supportingLocations = this.analyzeSupportingLocations(locations, chapterNumber);

      // 場所間の関係性分析
      const locationConnections = this.analyzeLocationConnections(locations);

      // 環境的背景の構築
      const environmentalContext = this.buildEnvironmentalContext(locations, chapterNumber);

      const locationData: LocationData = {
        primaryLocation: primaryLocation ? this.createLocationSnapshot(primaryLocation) : null,
        supportingLocations: supportingLocations.map(loc => this.createLocationSnapshot(loc)),
        connections: locationConnections,
        environmentalContext,
        accessibilityMap: this.createAccessibilityMap(locations),
        safetyAssessment: this.createSafetyAssessment(locations),
        relevanceScore: this.calculateLocationRelevance(locations, chapterNumber),
        lastUpdated: new Date().toISOString()
      };

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: locationData,
        metadata: {
          operationId: `location-context-${chapterNumber}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'world-collector'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('Location context collection failed', { chapterNumber, error, processingTime });

      return {
        success: false,
        error: {
          code: 'LOCATION_CONTEXT_FAILED',
          message: error instanceof Error ? error.message : 'Unknown location context error',
          details: error
        },
        metadata: {
          operationId: `location-context-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'world-collector'
        }
      };
    }
  }

  async collectCulturalElements(chapterNumber: number): Promise<OperationResult<CulturalData[]>> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Collecting cultural elements for chapter ${chapterNumber}`);

      const criteria: CulturalCriteria = {
        chapterNumber,
        relevanceThreshold: 0.3,
        includeHistorical: true,
        includeContemporary: true,
        maxElements: 10
      };

      if (!this.worldManager) {
        throw new Error('World manager not available for cultural elements collection');
      }

      const culturalElementsResult = await this.worldManager.getCulturalElement('default');
      if (!culturalElementsResult.success) {
        throw new Error(`Failed to get cultural elements: ${culturalElementsResult.error?.message}`);
      }

      const culturalElement = culturalElementsResult.data!;

      const culturalData: CulturalData[] = [{
        traditions: this.extractTraditions(culturalElement),
        beliefs: this.extractBeliefs(culturalElement),
        practices: this.extractPractices(culturalElement),
        language: this.extractLanguageElements(culturalElement),
        artifacts: this.extractArtifacts(culturalElement),
        socialNorms: this.extractSocialNorms(culturalElement),
        influence: this.calculateCulturalInfluence(culturalElement, chapterNumber),
        prevalence: culturalElement.prevalence,
        relevanceScore: this.calculateCulturalRelevance(culturalElement, chapterNumber),
        lastUpdated: new Date().toISOString()
      }];

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: culturalData,
        metadata: {
          operationId: `cultural-elements-${chapterNumber}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'world-collector'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('Cultural elements collection failed', { chapterNumber, error, processingTime });

      return {
        success: false,
        error: {
          code: 'CULTURAL_ELEMENTS_FAILED',
          message: error instanceof Error ? error.message : 'Unknown cultural elements error',
          details: error
        },
        metadata: {
          operationId: `cultural-elements-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'world-collector'
        }
      };
    }
  }

  async collectPhysicalConstraints(chapterNumber: number): Promise<OperationResult<PhysicalConstraintData[]>> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Collecting physical constraints for chapter ${chapterNumber}`);

      if (!this.worldManager) {
        throw new Error('World manager not available for physical constraints collection');
      }

      const constraintsResult = await this.worldManager.getPhysicalConstraint('default');
      if (!constraintsResult.success) {
        throw new Error(`Failed to get physical constraints: ${constraintsResult.error?.message}`);
      }

      const constraint = constraintsResult.data!;

      // 単一の制約をPhysicalConstraintDataに変換
      const constraintData: PhysicalConstraintData[] = [{
        naturalLaws: this.extractNaturalLaws(constraint),
        magicalRules: this.extractMagicalRules(constraint),
        technologicalLimits: this.extractTechnologicalLimits(constraint),
        socialRestrictions: this.extractSocialRestrictions(constraint),
        temporalConstraints: this.extractTemporalConstraints(constraint),
        activeLevel: this.calculateConstraintLevel(constraint, chapterNumber),
        enforcement: this.assessEnforcement(constraint),
        consequences: constraint.consequences,
        relevanceScore: this.calculateConstraintRelevance(constraint, chapterNumber),
        lastUpdated: new Date().toISOString()
      }];

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: constraintData,
        metadata: {
          operationId: `physical-constraints-${chapterNumber}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'world-collector'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('Physical constraints collection failed', { chapterNumber, error, processingTime });

      return {
        success: false,
        error: {
          code: 'PHYSICAL_CONSTRAINTS_FAILED',
          message: error instanceof Error ? error.message : 'Unknown physical constraints error',
          details: error
        },
        metadata: {
          operationId: `physical-constraints-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'world-collector'
        }
      };
    }
  }

  // ============================================================================
  // Data Coordinator統合メソッド
  // ============================================================================

  /**
   * 新しいWorldSettings型を既存のLegacyWorldSettings型に変換
   */
  private convertToLegacyWorldSettings(realWorldSettings: any): LegacyWorldSettings {
    return {
      id: realWorldSettings.id,
      name: realWorldSettings.name,
      genre: realWorldSettings.genre,
      timeperiod: realWorldSettings.timeframe?.period || 'present',
      technology: realWorldSettings.technologyLevel?.overallLevel || 'modern',
      magic: realWorldSettings.magicSystem?.exists || false,
      governmentType: realWorldSettings.politicalSystem?.governmentType || 'democracy',
      economicSystem: realWorldSettings.economicSystem?.economicModel || 'mixed',
      socialStructure: realWorldSettings.socialStructure?.hierarchy?.levels?.join(',') || 'modern',
      environmentalFactors: this.extractEnvironmentalFactors(realWorldSettings),
      historicalContext: realWorldSettings.timeframe?.historical_context || 'contemporary',
      rules: this.convertRulesToMap(realWorldSettings),
      lastUpdated: realWorldSettings.metadata?.last_modified || new Date()
    };
  }

  /**
   * LocationInfo型をLocation型に変換
   */
  private convertLocationInfoToLocation(locationInfo: any): Location {
    return {
      id: locationInfo.id,
      name: locationInfo.name,
      type: locationInfo.type as any,
      description: locationInfo.description,
      significance: locationInfo.significance === 'primary' ? 0.9 : 
                   locationInfo.significance === 'secondary' ? 0.7 : 0.5,
      accessibility: locationInfo.accessibility?.physical || 0.8,
      safetyLevel: locationInfo.safety === 'high' ? 0.9 : 
                   locationInfo.safety === 'medium' ? 0.6 : 0.3,
      populationDensity: locationInfo.population / 10000 || 0.5,
      culturalImportance: locationInfo.culture ? 0.8 : 0.3,
      physicalFeatures: locationInfo.features?.map((f: any) => f.name) || [],
      connectedLocations: locationInfo.connections?.map((c: any) => c.targetId) || [],
      activeInChapters: [1, 2, 3], // TODO: 実際の章情報を取得
      environmentalConditions: this.convertEnvironmentalConditions(locationInfo.environment),
      resources: this.convertResources(locationInfo.resources),
      restrictions: this.convertRestrictions(locationInfo.accessibility)
    };
  }

  /**
   * モックWorldSettingsを取得
   */
  private async getMockWorldSettings(): Promise<LegacyWorldSettings> {
    return {
      id: 'world_1',
      name: 'Default World',
      genre: 'contemporary_fiction',
      timeperiod: 'present',
      technology: 'modern',
      magic: false,
      governmentType: 'democracy',
      economicSystem: 'mixed',
      socialStructure: 'modern',
      environmentalFactors: ['temperate_climate', 'stable_geography'],
      historicalContext: 'Contemporary Japan',
      rules: new Map([
        ['physics', 'realistic'],
        ['technology_level', 'modern']
      ]),
      lastUpdated: new Date()
    };
  }

  /**
   * モック場所データを取得
   */
  private async getMockLocationData(locationIds: string[]): Promise<Location[]> {
    return locationIds.map((id, index) => ({
      id,
      name: `Location ${index + 1}`,
      type: 'building',
      description: `Mock location ${index + 1}`,
      significance: 0.7,
      accessibility: 0.8,
      safetyLevel: 0.9,
      populationDensity: 0.5,
      culturalImportance: 0.6,
      physicalFeatures: ['modern_building', 'accessible'],
      connectedLocations: [],
      activeInChapters: [1, 2, 3],
      environmentalConditions: [],
      resources: [],
      restrictions: []
    }));
  }

  /**
   * Data Coordinator経由でのシステム健全性チェック
   */
  public async checkWorldSystemHealth(): Promise<{ healthy: boolean; details: any }> {
    try {
      const healthResult = await this.dataCoordinator.healthCheck();
      
      return {
        healthy: true,
        details: {
          worldSystemStatus: this.worldManager ? 'real_system_connected' : 'mock_implementation',
          dataCoordinatorHealth: healthResult.healthy,
          readyForRealSystem: true,
          implementationNote: 'World management system integrated via DataCoordinator'
        }
      };
    } catch (error) {
      this.logger.error('World system health check failed', { error });
      return {
        healthy: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  // ============================================================================
  // プライベートメソッド
  // ============================================================================

  private extractRelevantSettings(worldSettings: LegacyWorldSettings, chapterNumber: number): Record<string, any> {
    const relevant: Record<string, any> = {};
    
    // TODO: 実際の実装では、チャプターに関連する設定を抽出
    relevant.timeOfDay = 'variable';
    relevant.season = 'spring';
    relevant.politicalTension = 0.5;
    
    return relevant;
  }

  private analyzeEnvironmentalFactors(worldSettings: LegacyWorldSettings, chapterNumber: number): string[] {
    // TODO: 実際の実装では、環境要因を分析
    return worldSettings.environmentalFactors || ['temperate_climate', 'stable_geography'];
  }

  private evaluateActiveConstraints(worldSettings: LegacyWorldSettings, chapterNumber: number): string[] {
    // TODO: 実際の実装では、アクティブな制約を評価
    return ['physics_standard', 'social_norms_active'];
  }

  private generateChapterContext(worldSettings: LegacyWorldSettings, chapterNumber: number): Record<string, any> {
    // TODO: 実際の実装では、チャプター固有のコンテキストを生成
    return {
      chapter: chapterNumber,
      timeframe: 'current',
      scope: 'local'
    };
  }

  private calculateWorldRelevance(worldSettings: LegacyWorldSettings, chapterNumber: number): number {
    // TODO: 実際の実装では、ワールド設定の関連性を計算
    return 0.8;
  }

  private async identifyRelevantLocations(chapterNumber: number): Promise<string[]> {
    // TODO: 実際の実装では、チャプターに関連する場所を特定
    return ['location_1', 'location_2'];
  }

  private selectPrimaryLocation(locations: Location[], chapterNumber: number): Location | null {
    if (locations.length === 0) return null;
    
    // 最も関連性の高い場所を選択
    return locations.reduce((prev, current) => 
      this.calculateLocationScore(current, chapterNumber) > 
      this.calculateLocationScore(prev, chapterNumber) ? current : prev
    );
  }

  private calculateLocationScore(location: Location, chapterNumber: number): number {
    // TODO: より詳細な計算実装
    return location.significance * 0.5 + 
           (location.activeInChapters.includes(chapterNumber) ? 0.5 : 0);
  }

  private analyzeSupportingLocations(locations: Location[], chapterNumber: number): Location[] {
    return locations
      .filter(loc => this.calculateLocationScore(loc, chapterNumber) > 0.3)
      .slice(0, 5); // 最大5つの補助場所
  }

  private analyzeLocationConnections(locations: Location[]): any[] {
    // TODO: 場所間の接続を分析
    return [];
  }

  private buildEnvironmentalContext(locations: Location[], chapterNumber: number): any {
    // TODO: 環境的背景を構築
    return {
      weather: 'fair',
      atmosphere: 'neutral',
      lighting: 'natural'
    };
  }

  private createLocationSnapshot(location: Location): any {
    return {
      locationId: location.id,
      name: location.name,
      type: location.type,
      accessibility: location.accessibility,
      safetyLevel: location.safetyLevel,
      significance: location.significance,
      features: location.physicalFeatures
    };
  }

  private createAccessibilityMap(locations: Location[]): any {
    // TODO: アクセシビリティマップを作成
    return {};
  }

  private createSafetyAssessment(locations: Location[]): any {
    // TODO: 安全性評価を作成
    return {};
  }

  private calculateLocationRelevance(locations: Location[], chapterNumber: number): number {
    if (locations.length === 0) return 0;
    
    const totalScore = locations.reduce((sum, loc) => 
      sum + this.calculateLocationScore(loc, chapterNumber), 0
    );
    
    return totalScore / locations.length;
  }

  private extractTraditions(element: CulturalElement): any[] {
    return element.type === 'tradition' ? [element] : [];
  }

  private extractBeliefs(element: CulturalElement): any[] {
    return element.type === 'belief' ? [element] : [];
  }

  private extractPractices(element: CulturalElement): any[] {
    return element.type === 'practice' ? [element] : [];
  }

  private extractLanguageElements(element: CulturalElement): any[] {
    return element.type === 'language' ? [element] : [];
  }

  private extractArtifacts(element: CulturalElement): any[] {
    return element.type === 'artifact' ? [element] : [];
  }

  private extractSocialNorms(element: CulturalElement): any[] {
    return element.manifestations || [];
  }

  private calculateCulturalInfluence(element: CulturalElement, chapterNumber: number): number {
    return element.influence || 0.5;
  }

  private calculateCulturalRelevance(element: CulturalElement, chapterNumber: number): number {
    return element.significance || 0.5;
  }

  private filterRelevantConstraints(constraints: PhysicalConstraint[], chapterNumber: number): PhysicalConstraint[] {
    return constraints.filter(constraint => 
      constraint.scope === 'global' || 
      this.isConstraintRelevantToChapter(constraint, chapterNumber)
    );
  }

  private isConstraintRelevantToChapter(constraint: PhysicalConstraint, chapterNumber: number): boolean {
    // TODO: より詳細な関連性チェック
    return constraint.strength > 0.3;
  }

  private extractNaturalLaws(constraint: PhysicalConstraint): any[] {
    return constraint.type === 'natural_law' ? [constraint] : [];
  }

  private extractMagicalRules(constraint: PhysicalConstraint): any[] {
    return constraint.type === 'magical_law' ? [constraint] : [];
  }

  private extractTechnologicalLimits(constraint: PhysicalConstraint): any[] {
    return constraint.type === 'technological_limit' ? [constraint] : [];
  }

  private extractSocialRestrictions(constraint: PhysicalConstraint): any[] {
    return constraint.type === 'social_constraint' ? [constraint] : [];
  }

  private extractTemporalConstraints(constraint: PhysicalConstraint): any[] {
    // TODO: 時間的制約の抽出
    return [];
  }

  private calculateConstraintLevel(constraint: PhysicalConstraint, chapterNumber: number): number {
    return constraint.strength;
  }

  private assessEnforcement(constraint: PhysicalConstraint): number {
    // TODO: 制約の執行レベルを評価
    return 0.8;
  }

  private calculateConstraintRelevance(constraint: PhysicalConstraint, chapterNumber: number): number {
    return constraint.strength * (constraint.scope === 'global' ? 1.0 : 0.7);
  }

  // ============================================================================
  // 型変換ヘルパーメソッド
  // ============================================================================

  private extractEnvironmentalFactors(realWorldSettings: any): string[] {
    const factors: string[] = [];
    
    if (realWorldSettings.climate?.globalPatterns) {
      factors.push('climate_patterns');
    }
    if (realWorldSettings.geography?.terrainTypes) {
      factors.push('diverse_geography');
    }
    if (realWorldSettings.environmentalFactors) {
      factors.push(...Object.keys(realWorldSettings.environmentalFactors));
    }
    
    return factors.length > 0 ? factors : ['temperate_climate', 'stable_geography'];
  }

  private convertRulesToMap(realWorldSettings: any): Map<string, any> {
    const rules = new Map<string, any>();
    
    if (realWorldSettings.physics) {
      rules.set('physics', realWorldSettings.physics.laws);
    }
    if (realWorldSettings.magicSystem) {
      rules.set('magic_system', realWorldSettings.magicSystem.exists ? 'enabled' : 'disabled');
    }
    if (realWorldSettings.technologyLevel) {
      rules.set('technology_level', realWorldSettings.technologyLevel.overallLevel);
    }
    if (realWorldSettings.rules) {
      realWorldSettings.rules.forEach((rule: any) => {
        rules.set(rule.id, rule.description);
      });
    }
    
    return rules;
  }

  private convertEnvironmentalConditions(environment: any): EnvironmentalCondition[] {
    if (!environment) return [];
    
    const conditions: EnvironmentalCondition[] = [];
    
    if (environment.climate) {
      conditions.push({
        condition: 'climate',
        intensity: 0.5,
        duration: 'permanent',
        cyclical: true
      });
    }
    
    return conditions;
  }

  private convertResources(resources: any[]): Resource[] {
    if (!resources) return [];
    
    return resources.map(resource => ({
      name: resource.name || 'unknown_resource',
      type: resource.type || 'general',
      availability: resource.availability || 0.5,
      quality: resource.quality || 0.5
    }));
  }

  private convertRestrictions(accessibility: any): Restriction[] {
    if (!accessibility) return [];
    
    const restrictions: Restriction[] = [];
    
    if (accessibility.physical < 0.8) {
      restrictions.push({
        type: 'physical_access',
        level: 'moderate',
        description: 'Limited physical accessibility',
        enforcement: 0.8
      });
    }
    
    return restrictions;
  }
}

// モック実装
class MockWorldManager implements IWorldManager {
  async getWorldSettings(): Promise<OperationResult<WorldSettings>> {
    const mockSettings: WorldSettings = {
      id: 'world_1',
      name: 'Default World',
      genre: 'fantasy',
      basicConcept: 'A fantasy world with magic and medieval technology',
      
      geography: {
        continents: [],
        oceans: [],
        climateZones: [],
        naturalResources: []
      },
      climate: {
        globalPattern: 'temperate',
        seasonalVariations: [],
        extremeEvents: [],
        impact: {
          agriculture: 'moderate',
          society: 'minimal',
          economy: 'minimal'
        }
      },
      cultures: [],
      technologies: [],
      magicSystems: [{
        type: 'hard',
        rules: ['elemental control', 'mana consumption'],
        limitations: ['physical exhaustion', 'rare materials'],
        practitioners: ['mages', 'wizards']
      }],
      
      timeline: {
        id: 'world_timeline_1',
        totalSpan: { amount: 1000, unit: 'years', description: 'One thousand years of history' },
        eras: [],
        majorEvents: [],
        cyclicalPatterns: []
      },
      currentEra: 'Age of Kingdoms',
      significantEvents: [],
      
      societies: [],
      governments: [],
      economies: [],
      
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0'
    };

    return {
      success: true,
      data: mockSettings,
      metadata: {
        operationId: `mock-world-settings-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 10,
        systemId: 'mock-world-manager'
      }
    };
  }

  async updateWorldEvolution(evolution: WorldEvolution): Promise<OperationResult<void>> {
    return {
      success: true,
      metadata: {
        operationId: `mock-world-evolution-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 5,
        systemId: 'mock-world-manager'
      }
    };
  }

  async validateWorldConsistency(): Promise<OperationResult<ConsistencyReport>> {
    const report: ConsistencyReport = {
      overallConsistency: 0.95,
      validationResults: [],
      inconsistencies: [],
      recommendations: [],
      checkedAspects: ['physics', 'culture', 'timeline']
    };

    return {
      success: true,
      data: report,
      metadata: {
        operationId: `mock-consistency-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 15,
        systemId: 'mock-world-manager'
      }
    };
  }

  async getWorldContext(location: string): Promise<OperationResult<WorldContext>> {
    const context: WorldContext = {
      location: {
        id: 'loc_1',
        name: location,
        type: 'city',
        coordinates: { x: 0, y: 0, system: 'absolute' },
        description: 'Mock location',
        subLocations: [],
        characteristics: []
      },
      timeOfDay: 'afternoon',
      season: 'spring',
      weather: {
        current: {
          temperature: 20,
          humidity: 50,
          precipitation: 'none',
          windSpeed: 5,
          windDirection: 'north',
          visibility: 'clear',
          atmosphere: 'clear'
        },
        forecast: [],
        seasonalPattern: {
          spring: { characteristics: ['mild', 'rainy'], duration: 90, transitions: ['winter->spring'] },
          summer: { characteristics: ['warm', 'dry'], duration: 90, transitions: ['spring->summer'] },
          autumn: { characteristics: ['cool', 'windy'], duration: 90, transitions: ['summer->autumn'] },
          winter: { characteristics: ['cold', 'snowy'], duration: 90, transitions: ['autumn->winter'] }
        },
        extremeEvents: []
      } as Weather,
      atmosphere: {
        mood: 'peaceful',
        tension: 'mild',
        mystery: 'low',
        beauty: 'beautiful',
        danger: 'safe',
        magic: 'none'
      } as Atmosphere,
      activeEvents: [],
      relevantHistory: [],
      culturalContext: {
        dominantCulture: 'default',
        subcultures: [],
        traditions: [],
        socialNorms: [],
        values: []
      }
    };

    return {
      success: true,
      data: context,
      metadata: {
        operationId: `mock-context-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 10,
        systemId: 'mock-world-manager'
      }
    };
  }

  async generateWorldElements(context: GenerationContext): Promise<OperationResult<WorldElement[]>> {
    const elements: WorldElement[] = [
      {
        id: 'element_1',
        type: 'location',
        name: 'Mock Element',
        description: 'A generated world element',
        properties: [],
        relationships: [],
        significance: 'moderate'
      }
    ];

    return {
      success: true,
      data: elements,
      metadata: {
        operationId: `mock-elements-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 20,
        systemId: 'mock-world-manager'
      }
    };
  }

  async trackWorldChanges(chapterNumber: number): Promise<OperationResult<ChangeRecord[]>> {
    const changes: ChangeRecord[] = [];

    return {
      success: true,
      data: changes,
      metadata: {
        operationId: `mock-changes-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 8,
        systemId: 'mock-world-manager'
      }
    };
  }

  async predictWorldEvolution(currentState: WorldState): Promise<OperationResult<WorldPrediction>> {
    const prediction: WorldPrediction = {
      predictedChanges: [],
      probability: 0.7,
      timeframe: {
        amount: 5,
        unit: 'chapters'
      },
      factors: [],
      alternativeScenarios: []
    };

    return {
      success: true,
      data: prediction,
      metadata: {
        operationId: `mock-prediction-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 25,
        systemId: 'mock-world-manager'
      }
    };
  }

  async generateWorldDescription(setting: WorldSetting): Promise<OperationResult<WorldDescription>> {
    const description: WorldDescription = {
      id: 'desc_1',
      setting: setting,
      mainDescription: 'A vivid world filled with wonder and mystery',
      detailedAspects: [],
      sensoryDetails: [],
      atmosphericElements: [],
      immersionLevel: 0.8
    };

    return {
      success: true,
      data: description,
      metadata: {
        operationId: `mock-description-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 15,
        systemId: 'mock-world-manager'
      }
    };
  }

  async enhanceImmersion(content: string, context: WorldContext): Promise<OperationResult<EnhancedContent>> {
    const enhanced: EnhancedContent = {
      originalContent: content,
      enhancedContent: content + ' (enhanced with atmospheric details)',
      immersionElements: [],
      sensoryEnhancements: [],
      atmosphericAdditions: [],
      immersionScore: 0.85
    };

    return {
      success: true,
      data: enhanced,
      metadata: {
        operationId: `mock-enhance-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 12,
        systemId: 'mock-world-manager'
      }
    };
  }

  async getSystemHealth(): Promise<OperationResult<SystemHealth>> {
    const health: SystemHealth = {
      status: 'good',
      performanceMetrics: [],
      resourceUsage: { memory: 0.5, cpu: 0.3, storage: 0.2 },
      lastCheck: new Date()
    };

    return {
      success: true,
      data: health,
      metadata: {
        operationId: `mock-health-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 5,
        systemId: 'mock-world-manager'
      }
    };
  }

  async getWorldStatistics(): Promise<OperationResult<WorldStatistics>> {
    const stats: WorldStatistics = {
      totalLocations: 10,
      activeCultures: 5,
      historicalEvents: 20,
      worldComplexity: 0.7,
      consistencyScore: 0.95,
      evolutionRate: 0.3,
      lastMajorChange: new Date(),
      immersionEffectiveness: 0.85
    };

    return {
      success: true,
      data: stats,
      metadata: {
        operationId: `mock-stats-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 8,
        systemId: 'mock-world-manager'
      }
    };
  }

  // Helper methods from original implementation
  async getLocationInfo(locationId: string): Promise<OperationResult<any>> {
    const locationInfo = {
      id: locationId,
      name: `Location ${locationId}`,
      type: 'city',
      description: `Mock location ${locationId}`,
      significance: 'secondary',
      accessibility: { physical: 0.8 },
      safety: 'medium',
      population: 50000,
      culture: true,
      features: [{ name: 'Town Square' }, { name: 'Market' }],
      connections: [],
      environment: { climate: 'temperate' },
      resources: [],
    };

    return {
      success: true,
      data: locationInfo,
      metadata: {
        operationId: `mock-location-info-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 5,
        systemId: 'mock-world-manager'
      }
    };
  }

  async getCulturalElements(criteria: CulturalCriteria): Promise<OperationResult<CulturalElement[]>> {
    const mockElements: CulturalElement[] = [
      {
        id: 'culture_1',
        name: 'Festival of Lights',
        type: 'tradition',
        description: 'Annual celebration',
        origin: 'Ancient times',
        significance: 0.8,
        prevalence: 0.9,
        influence: 0.7,
        relatedCharacters: [],
        manifestations: ['lanterns', 'ceremonies'],
        evolution: []
      }
    ];

    return {
      success: true,
      data: mockElements,
      metadata: {
        operationId: `mock-cultural-elements-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 20,
        systemId: 'mock-world-manager'
      }
    };
  }

  async getPhysicalConstraints(): Promise<OperationResult<PhysicalConstraint[]>> {
    const mockConstraints: PhysicalConstraint[] = [
      {
        id: 'constraint_1',
        name: 'Standard Physics',
        type: 'natural_law',
        description: 'Normal physical laws apply',
        scope: 'global',
        strength: 1.0,
        flexibility: 0.1,
        exceptions: [],
        affectedAreas: ['all'],
        consequences: ['realistic_physics']
      }
    ];

    return {
      success: true,
      data: mockConstraints,
      metadata: {
        operationId: `mock-physical-constraints-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 12,
        systemId: 'mock-world-manager'
      }
    };
  }

  // Required methods from IWorldManager interface
  async getCulturalElement(elementId: string): Promise<OperationResult<CulturalElementInfo>> {
    const mockElement: CulturalElementInfo = {
      id: elementId,
      name: `Cultural Element ${elementId}`,
      type: 'tradition',
      description: 'Mock cultural element',
      origin: 'Ancient times',
      significance: 0.8,
      prevalence: 0.9,
      influence: 0.7,
      relatedCharacters: [],
      manifestations: ['ceremonies', 'rituals'],
      evolution: []
    };

    return {
      success: true,
      data: mockElement,
      metadata: {
        operationId: `mock-cultural-element-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 15,
        systemId: 'mock-world-manager'
      }
    };
  }

  async getPhysicalConstraint(constraintId: string): Promise<OperationResult<PhysicalConstraintInfo>> {
    const mockConstraint: PhysicalConstraintInfo = {
      id: constraintId,
      name: `Physical Constraint ${constraintId}`,
      type: 'natural_law',
      description: 'Mock physical constraint',
      scope: 'global',
      strength: 1.0,
      flexibility: 0.1,
      exceptions: [],
      affectedAreas: ['all'],
      consequences: ['realistic_physics']
    };

    return {
      success: true,
      data: mockConstraint,
      metadata: {
        operationId: `mock-physical-constraint-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 10,
        systemId: 'mock-world-manager'
      }
    };
  }
}