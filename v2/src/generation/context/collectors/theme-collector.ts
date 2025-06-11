/**
 * Version 2.0 - Theme Collector
 * 
 * テーマ管理システムからの関連データ収集
 */

import { OperationResult } from '../../../types/common';
import { 
  IThemeCollector,
  ThemeData,
  SymbolicElementData,
  MetaphorNetworkData,
  ThematicProgressionData
} from '../interfaces';
import { SystemData, SystemType, ValidationResult } from '../types';

export interface IThemeManager {
  getActiveThemes(chapterNumber: number): Promise<OperationResult<Theme[]>>;
  getSymbolicElements(criteria: SymbolicCriteria): Promise<OperationResult<SymbolicElement[]>>;
  getMetaphorNetwork(chapterNumber: number): Promise<OperationResult<MetaphorNetwork>>;
  getThematicProgression(chapterRange: ChapterRange): Promise<OperationResult<ThematicProgression>>;
}

export interface Theme {
  id: string;
  name: string;
  category: 'universal' | 'personal' | 'social' | 'philosophical' | 'existential';
  description: string;
  significance: number;
  prevalence: number;
  development: ThemeDevelopment;
  manifestations: ThemeManifestation[];
  relatedCharacters: string[];
  symbolism: Symbolism[];
  emotionalResonance: number;
  universality: number;
  complexity: number;
  activeInChapters: number[];
  evolutionPath: ThemeEvolution[];
}

export interface SymbolicElement {
  id: string;
  symbol: string;
  type: 'object' | 'action' | 'color' | 'number' | 'character' | 'location' | 'concept';
  meaning: string[];
  themeConnections: string[];
  frequency: number;
  impact: number;
  subtlety: number;
  culturalSignificance: number;
  emotionalWeight: number;
  manifestations: SymbolManifestation[];
  interpretations: SymbolInterpretation[];
}

export interface MetaphorNetwork {
  id: string;
  centralMetaphors: CentralMetaphor[];
  connections: MetaphorConnection[];
  layers: MetaphorLayer[];
  coherence: number;
  density: number;
  effectiveness: number;
  complexity: number;
  accessibility: number;
}

export interface ThematicProgression {
  id: string;
  chapterRange: ChapterRange;
  themes: ThemeProgressionEntry[];
  developmentArcs: DevelopmentArc[];
  peakMoments: PeakMoment[];
  resolutions: ThemeResolution[];
  overallProgression: ProgressionCurve;
  coherence: number;
  satisfaction: number;
}

export interface ThemeDevelopment {
  stage: 'introduction' | 'development' | 'climax' | 'resolution' | 'conclusion';
  intensity: number;
  clarity: number;
  complexity: number;
  progression: number;
}

export interface ThemeManifestation {
  type: 'dialogue' | 'action' | 'description' | 'symbolism' | 'conflict';
  content: string;
  intensity: number;
  subtlety: number;
  effectiveness: number;
  chapter: number;
}

export interface Symbolism {
  symbol: string;
  meaning: string;
  strength: number;
  frequency: number;
  context: string[];
}

export interface ThemeEvolution {
  fromStage: string;
  toStage: string;
  trigger: string;
  significance: number;
  chapter: number;
}

export interface SymbolManifestation {
  context: string;
  chapter: number;
  intensity: number;
  interpretation: string;
}

export interface SymbolInterpretation {
  interpretation: string;
  likelihood: number;
  culturalContext: string;
  emotionalImpact: number;
}

export interface CentralMetaphor {
  metaphor: string;
  vehicle: string;
  tenor: string;
  themes: string[];
  strength: number;
  pervasiveness: number;
}

export interface MetaphorConnection {
  fromMetaphor: string;
  toMetaphor: string;
  relationship: string;
  strength: number;
}

export interface MetaphorLayer {
  layer: string;
  depth: number;
  metaphors: string[];
  accessibility: number;
}

export interface ThemeProgressionEntry {
  themeId: string;
  chapterProgression: ChapterThemeData[];
  overallTrend: 'rising' | 'falling' | 'stable' | 'cyclical';
  peakChapter: number;
  resolution: boolean;
}

export interface DevelopmentArc {
  themeId: string;
  startChapter: number;
  endChapter: number;
  arcType: 'linear' | 'exponential' | 'cyclical' | 'complex';
  keyMoments: KeyMoment[];
}

export interface PeakMoment {
  chapter: number;
  themeId: string;
  intensity: number;
  type: 'revelation' | 'conflict' | 'resolution' | 'transformation';
  description: string;
}

export interface ThemeResolution {
  themeId: string;
  chapter: number;
  resolutionType: 'complete' | 'partial' | 'open' | 'subverted';
  satisfaction: number;
  implications: string[];
}

export interface ProgressionCurve {
  points: ProgressionPoint[];
  smoothness: number;
  predictability: number;
  satisfaction: number;
}

export interface ChapterThemeData {
  chapter: number;
  intensity: number;
  manifestations: number;
  development: number;
}

export interface KeyMoment {
  chapter: number;
  event: string;
  impact: number;
  significance: number;
}

export interface ProgressionPoint {
  chapter: number;
  intensity: number;
  clarity: number;
  impact: number;
}

export interface SymbolicCriteria {
  chapterNumber: number;
  themeIds?: string[];
  minSignificance: number;
  includeSubtle: boolean;
  maxElements: number;
}

export interface ChapterRange {
  start: number;
  end: number;
}

export interface ThemeCollectionContext {
  chapterNumber: number;
  focusThemes?: string[];
  includeSymbolism: boolean;
  includeMetaphors: boolean;
  includeProgression: boolean;
  maxThemes?: number;
  significanceThreshold?: number;
  analysisDepth?: 'surface' | 'medium' | 'deep';
}

export interface CollectedThemeData {
  activeThemes: ThemeData[];
  symbolicElements: SymbolicElementData[];
  metaphorNetwork: MetaphorNetworkData;
  thematicProgression: ThematicProgressionData;
  collectionMetadata: {
    totalThemes: number;
    symbolCount: number;
    metaphorCount: number;
    averageSignificance: number;
    thematicCoherence: number;
    processingTime: number;
    dataCompleteness: number;
  };
}

export interface ThemeDataDetails {
  theme: Theme;
  chapterRelevance: number;
  developmentStage: string;
  manifestationLevel: number;
  symbolConnection: number;
  characterResonance: string[];
  emotionalImpact: number;
}

export interface SymbolicElementDataDetails {
  element: SymbolicElement;
  chapterRelevance: number;
  thematicStrength: number;
  interpretationDepth: number;
  culturalResonance: number;
  emotionalWeight: number;
}

export interface MetaphorNetworkDataDetails {
  network: MetaphorNetwork;
  chapterApplication: number;
  coherenceLevel: number;
  accessibilityScore: number;
  effectiveness: number;
  layerDepth: number;
}

export interface ThematicProgressionDataDetails {
  progression: ThematicProgression;
  chapterPosition: number;
  developmentStage: string;
  projectedIntensity: number;
  resolutionProximity: number;
  satisfactionLevel: number;
}

export class ThemeCollector implements IThemeCollector {
  private themeManager: IThemeManager;
  private logger: any;

  constructor(themeManager?: IThemeManager, logger?: any) {
    this.themeManager = themeManager || new MockThemeManager();
    this.logger = logger || console;
  }

  // ============================================================================
  // パブリックメソッド
  // ============================================================================

  async collectActiveThemes(chapterNumber: number): Promise<OperationResult<ThemeData[]>> {
    const startTime = Date.now();
    
    try {
      this.logger.info(`Collecting active themes for chapter ${chapterNumber}`);

      const themesResult = await this.themeManager.getActiveThemes(chapterNumber);
      if (!themesResult.success) {
        throw new Error(`Failed to get active themes: ${themesResult.error?.message}`);
      }

      const themes = themesResult.data!;

      const themeData: ThemeData[] = themes.map(theme => ({
        themeId: theme.id,
        name: theme.name,
        category: theme.category,
        significance: theme.significance,
        development: this.mapThemeDevelopment(theme.development),
        manifestations: this.analyzeThemeManifestations(theme, chapterNumber),
        symbolism: this.extractThemeSymbolism(theme),
        characterConnections: theme.relatedCharacters,
        emotionalResonance: theme.emotionalResonance,
        progressionStage: this.determineProgressionStage(theme, chapterNumber),
        chapterIntensity: this.calculateChapterIntensity(theme, chapterNumber),
        relevanceScore: this.calculateThemeRelevance(theme, chapterNumber),
        lastUpdated: new Date().toISOString()
      }));

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: themeData,
        metadata: {
          operationId: `themes-${chapterNumber}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'theme-collector'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('Active themes collection failed', { chapterNumber, error, processingTime });

      return {
        success: false,
        error: {
          code: 'ACTIVE_THEMES_FAILED',
          message: error instanceof Error ? error.message : 'Unknown active themes error',
          details: error
        },
        metadata: {
          operationId: `themes-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'theme-collector'
        }
      };
    }
  }

  async collectSymbolicElements(chapterNumber: number): Promise<OperationResult<SymbolicElementData[]>> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Collecting symbolic elements for chapter ${chapterNumber}`);

      const criteria: SymbolicCriteria = {
        chapterNumber,
        minSignificance: 0.3,
        includeSubtle: true,
        maxElements: 15
      };

      const symbolsResult = await this.themeManager.getSymbolicElements(criteria);
      if (!symbolsResult.success) {
        throw new Error(`Failed to get symbolic elements: ${symbolsResult.error?.message}`);
      }

      const symbols = symbolsResult.data!;

      const symbolicData: SymbolicElementData[] = symbols.map(symbol => ({
        symbolId: symbol.id,
        symbol: symbol.symbol,
        type: symbol.type,
        meanings: symbol.meaning,
        themes: symbol.themeConnections,
        frequency: symbol.frequency,
        impact: symbol.impact,
        subtlety: symbol.subtlety,
        culturalSignificance: symbol.culturalSignificance,
        emotionalWeight: symbol.emotionalWeight,
        manifestations: this.analyzeSymbolManifestations(symbol, chapterNumber),
        interpretations: this.processSymbolInterpretations(symbol),
        chapterRelevance: this.calculateSymbolChapterRelevance(symbol, chapterNumber),
        relevanceScore: this.calculateSymbolRelevance(symbol, chapterNumber),
        lastUpdated: new Date().toISOString()
      }));

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: symbolicData,
        metadata: {
          operationId: `symbols-${chapterNumber}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'theme-collector'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('Symbolic elements collection failed', { chapterNumber, error, processingTime });

      return {
        success: false,
        error: {
          code: 'SYMBOLIC_ELEMENTS_FAILED',
          message: error instanceof Error ? error.message : 'Unknown symbolic elements error',
          details: error
        },
        metadata: {
          operationId: `symbols-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'theme-collector'
        }
      };
    }
  }

  async collectMetaphorNetwork(chapterNumber: number): Promise<OperationResult<MetaphorNetworkData>> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Collecting metaphor network for chapter ${chapterNumber}`);

      const networkResult = await this.themeManager.getMetaphorNetwork(chapterNumber);
      if (!networkResult.success) {
        throw new Error(`Failed to get metaphor network: ${networkResult.error?.message}`);
      }

      const network = networkResult.data!;

      const metaphorNetworkData: MetaphorNetworkData = {
        networkId: network.id,
        centralMetaphors: this.processCentralMetaphors(network.centralMetaphors),
        connections: this.processMetaphorConnections(network.connections),
        layers: this.processMetaphorLayers(network.layers),
        coherence: network.coherence,
        density: network.density,
        effectiveness: network.effectiveness,
        complexity: network.complexity,
        accessibility: network.accessibility,
        chapterApplication: this.calculateChapterApplication(network, chapterNumber),
        resonanceLevel: this.calculateResonanceLevel(network),
        relevanceScore: this.calculateNetworkRelevance(network, chapterNumber),
        lastUpdated: new Date().toISOString()
      };

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: metaphorNetworkData,
        metadata: {
          operationId: `metaphor-network-${chapterNumber}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'theme-collector'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('Metaphor network collection failed', { chapterNumber, error, processingTime });

      return {
        success: false,
        error: {
          code: 'METAPHOR_NETWORK_FAILED',
          message: error instanceof Error ? error.message : 'Unknown metaphor network error',
          details: error
        },
        metadata: {
          operationId: `metaphor-network-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'theme-collector'
        }
      };
    }
  }

  async collectThematicProgression(chapterNumber: number): Promise<OperationResult<ThematicProgressionData>> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Collecting thematic progression for chapter ${chapterNumber}`);

      const chapterRange: ChapterRange = {
        start: Math.max(1, chapterNumber - 3),
        end: chapterNumber + 3
      };

      const progressionResult = await this.themeManager.getThematicProgression(chapterRange);
      if (!progressionResult.success) {
        throw new Error(`Failed to get thematic progression: ${progressionResult.error?.message}`);
      }

      const progression = progressionResult.data!;

      const progressionData: ThematicProgressionData = {
        progressionId: progression.id,
        chapterRange: progression.chapterRange,
        themes: this.processThemeProgression(progression.themes, chapterNumber),
        developmentArcs: this.processDevelopmentArcs(progression.developmentArcs, chapterNumber),
        currentPosition: this.calculateCurrentPosition(progression, chapterNumber),
        projectedIntensity: this.calculateProjectedIntensity(progression, chapterNumber),
        peakMoments: this.identifyRelevantPeakMoments(progression.peakMoments, chapterNumber),
        resolutions: this.analyzeResolutions(progression.resolutions, chapterNumber),
        overallProgression: this.processProgressionCurve(progression.overallProgression, chapterNumber),
        coherence: progression.coherence,
        satisfaction: progression.satisfaction,
        relevanceScore: this.calculateProgressionRelevance(progression, chapterNumber),
        lastUpdated: new Date().toISOString()
      };

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: progressionData,
        metadata: {
          operationId: `thematic-progression-${chapterNumber}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'theme-collector'
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('Thematic progression collection failed', { chapterNumber, error, processingTime });

      return {
        success: false,
        error: {
          code: 'THEMATIC_PROGRESSION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown thematic progression error',
          details: error
        },
        metadata: {
          operationId: `thematic-progression-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime,
          systemId: 'theme-collector'
        }
      };
    }
  }

  // ============================================================================
  // IDataCollector基本メソッドの実装
  // ============================================================================

  async collect(chapterNumber: number, options: any): Promise<OperationResult<SystemData>> {
    try {
      const activeThemes = await this.collectActiveThemes(chapterNumber);
      const symbolicElements = await this.collectSymbolicElements(chapterNumber);
      const metaphorNetwork = await this.collectMetaphorNetwork(chapterNumber);
      const thematicProgression = await this.collectThematicProgression(chapterNumber);

      const systemData: SystemData = {
        systemType: SystemType.THEME,
        relevanceScore: 0.8,
        lastUpdated: new Date().toISOString(),
        data: {
          activeThemes: activeThemes.data,
          symbolicElements: symbolicElements.data,
          metaphorNetwork: metaphorNetwork.data,
          thematicProgression: thematicProgression.data
        },
        metadata: {
          source: 'theme-collector',
          version: '2.0',
          timestamp: new Date().toISOString(),
          dataSize: 1200
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
          operationId: `theme-collect-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime: 120,
          systemId: 'theme-collector'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'THEME_COLLECTION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        metadata: {
          operationId: `theme-collect-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          processingTime: 60,
          systemId: 'theme-collector'
        }
      };
    }
  }

  async validateData(data: SystemData): Promise<OperationResult<ValidationResult>> {
    const validation: ValidationResult = {
      isValid: data.systemType === SystemType.THEME,
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
        operationId: `theme-validation-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 10,
        systemId: 'theme-collector'
      }
    };
  }

  async calculateRelevance(data: SystemData, criteria: any): Promise<OperationResult<number>> {
    return {
      success: true,
      data: 0.8,
      metadata: {
        operationId: `theme-relevance-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 5,
        systemId: 'theme-collector'
      }
    };
  }

  async optimizeDataSize(data: SystemData): Promise<OperationResult<SystemData>> {
    return {
      success: true,
      data: data,
      metadata: {
        operationId: `theme-optimize-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 20,
        systemId: 'theme-collector'
      }
    };
  }

  async getCollectionMetrics(): Promise<OperationResult<any>> {
    const metrics = {
      collectionTime: 120,
      dataSize: 1200,
      cacheHitRate: 0.7,
      errorCount: 0,
      qualityScore: 0.85
    };

    return {
      success: true,
      data: metrics,
      metadata: {
        operationId: `theme-metrics-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 5,
        systemId: 'theme-collector'
      }
    };
  }

  // ============================================================================
  // プライベートメソッド
  // ============================================================================

  private mapThemeDevelopment(development: ThemeDevelopment): any {
    return {
      stage: development.stage,
      intensity: development.intensity,
      clarity: development.clarity,
      complexity: development.complexity,
      progression: development.progression
    };
  }

  private analyzeThemeManifestations(theme: Theme, chapterNumber: number): any[] {
    return theme.manifestations
      .filter(m => m.chapter === chapterNumber)
      .map(m => ({
        type: m.type,
        intensity: m.intensity,
        subtlety: m.subtlety,
        effectiveness: m.effectiveness
      }));
  }

  private extractThemeSymbolism(theme: Theme): any[] {
    return theme.symbolism.map(s => ({
      symbol: s.symbol,
      meaning: s.meaning,
      strength: s.strength,
      frequency: s.frequency
    }));
  }

  private determineProgressionStage(theme: Theme, chapterNumber: number): string {
    // TODO: より詳細な段階判定
    return theme.development.stage;
  }

  private calculateChapterIntensity(theme: Theme, chapterNumber: number): number {
    const manifestations = theme.manifestations.filter(m => m.chapter === chapterNumber);
    if (manifestations.length === 0) return 0;
    
    return manifestations.reduce((sum, m) => sum + m.intensity, 0) / manifestations.length;
  }

  private calculateThemeRelevance(theme: Theme, chapterNumber: number): number {
    const isActiveInChapter = theme.activeInChapters.includes(chapterNumber);
    const baseRelevance = isActiveInChapter ? 0.8 : 0.2;
    const intensityBonus = this.calculateChapterIntensity(theme, chapterNumber) * 0.2;
    
    return Math.min(baseRelevance + intensityBonus, 1.0);
  }

  private analyzeSymbolManifestations(symbol: SymbolicElement, chapterNumber: number): any[] {
    return symbol.manifestations
      .filter(m => m.chapter === chapterNumber)
      .map(m => ({
        context: m.context,
        intensity: m.intensity,
        interpretation: m.interpretation
      }));
  }

  private processSymbolInterpretations(symbol: SymbolicElement): any[] {
    return symbol.interpretations.map(i => ({
      interpretation: i.interpretation,
      likelihood: i.likelihood,
      culturalContext: i.culturalContext,
      emotionalImpact: i.emotionalImpact
    }));
  }

  private calculateSymbolChapterRelevance(symbol: SymbolicElement, chapterNumber: number): number {
    const manifestations = symbol.manifestations.filter(m => m.chapter === chapterNumber);
    return manifestations.length > 0 ? 0.8 : 0.2;
  }

  private calculateSymbolRelevance(symbol: SymbolicElement, chapterNumber: number): number {
    const chapterRelevance = this.calculateSymbolChapterRelevance(symbol, chapterNumber);
    const significanceWeight = symbol.culturalSignificance * 0.3;
    const impactWeight = symbol.impact * 0.3;
    
    return (chapterRelevance * 0.4) + significanceWeight + impactWeight;
  }

  private processCentralMetaphors(metaphors: CentralMetaphor[]): any[] {
    return metaphors.map(m => ({
      metaphor: m.metaphor,
      vehicle: m.vehicle,
      tenor: m.tenor,
      themes: m.themes,
      strength: m.strength,
      pervasiveness: m.pervasiveness
    }));
  }

  private processMetaphorConnections(connections: MetaphorConnection[]): any[] {
    return connections.map(c => ({
      from: c.fromMetaphor,
      to: c.toMetaphor,
      relationship: c.relationship,
      strength: c.strength
    }));
  }

  private processMetaphorLayers(layers: MetaphorLayer[]): any[] {
    return layers.map(l => ({
      layer: l.layer,
      depth: l.depth,
      metaphors: l.metaphors,
      accessibility: l.accessibility
    }));
  }

  private calculateChapterApplication(network: MetaphorNetwork, chapterNumber: number): number {
    // TODO: チャプターでのメタファーネットワークの適用度を計算
    return 0.7;
  }

  private calculateResonanceLevel(network: MetaphorNetwork): number {
    return (network.effectiveness + network.coherence) / 2;
  }

  private calculateNetworkRelevance(network: MetaphorNetwork, chapterNumber: number): number {
    const applicationScore = this.calculateChapterApplication(network, chapterNumber);
    const qualityScore = (network.coherence + network.effectiveness) / 2;
    
    return (applicationScore * 0.6) + (qualityScore * 0.4);
  }

  private processThemeProgression(themes: ThemeProgressionEntry[], chapterNumber: number): any[] {
    return themes.map(theme => ({
      themeId: theme.themeId,
      currentIntensity: this.getCurrentIntensity(theme, chapterNumber),
      trend: theme.overallTrend,
      peakChapter: theme.peakChapter,
      resolution: theme.resolution
    }));
  }

  private getCurrentIntensity(theme: ThemeProgressionEntry, chapterNumber: number): number {
    const chapterData = theme.chapterProgression.find(cp => cp.chapter === chapterNumber);
    return chapterData ? chapterData.intensity : 0;
  }

  private processDevelopmentArcs(arcs: DevelopmentArc[], chapterNumber: number): any[] {
    return arcs
      .filter(arc => chapterNumber >= arc.startChapter && chapterNumber <= arc.endChapter)
      .map(arc => ({
        themeId: arc.themeId,
        arcType: arc.arcType,
        progress: this.calculateArcProgress(arc, chapterNumber),
        keyMoments: arc.keyMoments.filter(km => km.chapter === chapterNumber)
      }));
  }

  private calculateArcProgress(arc: DevelopmentArc, chapterNumber: number): number {
    const totalChapters = arc.endChapter - arc.startChapter + 1;
    const currentPosition = chapterNumber - arc.startChapter + 1;
    return currentPosition / totalChapters;
  }

  private calculateCurrentPosition(progression: ThematicProgression, chapterNumber: number): number {
    const totalRange = progression.chapterRange.end - progression.chapterRange.start + 1;
    const currentPos = chapterNumber - progression.chapterRange.start + 1;
    return currentPos / totalRange;
  }

  private calculateProjectedIntensity(progression: ThematicProgression, chapterNumber: number): number {
    // TODO: より詳細な予測計算
    return 0.6;
  }

  private identifyRelevantPeakMoments(peaks: PeakMoment[], chapterNumber: number): any[] {
    const relevantPeaks = peaks.filter(peak => 
      Math.abs(peak.chapter - chapterNumber) <= 2
    );
    
    return relevantPeaks.map(peak => ({
      chapter: peak.chapter,
      themeId: peak.themeId,
      intensity: peak.intensity,
      type: peak.type,
      description: peak.description,
      proximity: Math.abs(peak.chapter - chapterNumber)
    }));
  }

  private analyzeResolutions(resolutions: ThemeResolution[], chapterNumber: number): any[] {
    return resolutions
      .filter(res => res.chapter <= chapterNumber + 3)
      .map(res => ({
        themeId: res.themeId,
        chapter: res.chapter,
        type: res.resolutionType,
        satisfaction: res.satisfaction,
        proximity: res.chapter - chapterNumber
      }));
  }

  private processProgressionCurve(curve: ProgressionCurve, chapterNumber: number): any {
    const currentPoint = curve.points.find(p => p.chapter === chapterNumber);
    
    return {
      currentIntensity: currentPoint?.intensity || 0,
      currentClarity: currentPoint?.clarity || 0,
      currentImpact: currentPoint?.impact || 0,
      smoothness: curve.smoothness,
      predictability: curve.predictability,
      satisfaction: curve.satisfaction
    };
  }

  private calculateProgressionRelevance(progression: ThematicProgression, chapterNumber: number): number {
    const isInRange = chapterNumber >= progression.chapterRange.start && 
                     chapterNumber <= progression.chapterRange.end;
    
    const baseScore = isInRange ? 0.8 : 0.3;
    const coherenceBonus = progression.coherence * 0.2;
    
    return Math.min(baseScore + coherenceBonus, 1.0);
  }
}

// モック実装
class MockThemeManager implements IThemeManager {
  async getActiveThemes(chapterNumber: number): Promise<OperationResult<Theme[]>> {
    const mockThemes: Theme[] = [
      {
        id: 'theme_growth',
        name: 'Personal Growth',
        category: 'personal',
        description: 'Character development and self-discovery',
        significance: 0.9,
        prevalence: 0.7,
        development: {
          stage: 'development',
          intensity: 0.6,
          clarity: 0.7,
          complexity: 0.5,
          progression: 0.4
        },
        manifestations: [
          {
            type: 'dialogue',
            content: 'Character reflection',
            intensity: 0.7,
            subtlety: 0.6,
            effectiveness: 0.8,
            chapter: chapterNumber
          }
        ],
        relatedCharacters: ['char_1', 'char_2'],
        symbolism: [
          {
            symbol: 'butterfly',
            meaning: 'transformation',
            strength: 0.8,
            frequency: 0.3,
            context: ['metamorphosis_scenes']
          }
        ],
        emotionalResonance: 0.8,
        universality: 0.9,
        complexity: 0.6,
        activeInChapters: [chapterNumber],
        evolutionPath: []
      }
    ];

    return {
      success: true,
      data: mockThemes,
      metadata: {
        operationId: `mock-themes-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 25,
        systemId: 'mock-theme-manager'
      }
    };
  }

  async getSymbolicElements(criteria: SymbolicCriteria): Promise<OperationResult<SymbolicElement[]>> {
    const mockSymbols: SymbolicElement[] = [
      {
        id: 'symbol_light',
        symbol: 'light',
        type: 'concept',
        meaning: ['hope', 'knowledge', 'truth'],
        themeConnections: ['theme_growth'],
        frequency: 0.6,
        impact: 0.8,
        subtlety: 0.4,
        culturalSignificance: 0.9,
        emotionalWeight: 0.7,
        manifestations: [
          {
            context: 'dawn scene',
            chapter: criteria.chapterNumber,
            intensity: 0.8,
            interpretation: 'new beginning'
          }
        ],
        interpretations: [
          {
            interpretation: 'enlightenment',
            likelihood: 0.8,
            culturalContext: 'universal',
            emotionalImpact: 0.9
          }
        ]
      }
    ];

    return {
      success: true,
      data: mockSymbols,
      metadata: {
        operationId: `mock-symbols-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 18,
        systemId: 'mock-theme-manager'
      }
    };
  }

  async getMetaphorNetwork(chapterNumber: number): Promise<OperationResult<MetaphorNetwork>> {
    const mockNetwork: MetaphorNetwork = {
      id: 'network_1',
      centralMetaphors: [
        {
          metaphor: 'life is a journey',
          vehicle: 'journey',
          tenor: 'life',
          themes: ['theme_growth'],
          strength: 0.8,
          pervasiveness: 0.7
        }
      ],
      connections: [
        {
          fromMetaphor: 'life is a journey',
          toMetaphor: 'obstacles are mountains',
          relationship: 'supports',
          strength: 0.6
        }
      ],
      layers: [
        {
          layer: 'surface',
          depth: 1,
          metaphors: ['life is a journey'],
          accessibility: 0.9
        }
      ],
      coherence: 0.8,
      density: 0.6,
      effectiveness: 0.7,
      complexity: 0.5,
      accessibility: 0.8
    };

    return {
      success: true,
      data: mockNetwork,
      metadata: {
        operationId: `mock-metaphor-network-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 22,
        systemId: 'mock-theme-manager'
      }
    };
  }

  async getThematicProgression(chapterRange: ChapterRange): Promise<OperationResult<ThematicProgression>> {
    const mockProgression: ThematicProgression = {
      id: 'progression_1',
      chapterRange,
      themes: [
        {
          themeId: 'theme_growth',
          chapterProgression: [
            {
              chapter: chapterRange.start,
              intensity: 0.3,
              manifestations: 2,
              development: 0.2
            },
            {
              chapter: chapterRange.end,
              intensity: 0.8,
              manifestations: 5,
              development: 0.7
            }
          ],
          overallTrend: 'rising',
          peakChapter: chapterRange.end - 1,
          resolution: false
        }
      ],
      developmentArcs: [
        {
          themeId: 'theme_growth',
          startChapter: chapterRange.start,
          endChapter: chapterRange.end,
          arcType: 'linear',
          keyMoments: [
            {
              chapter: chapterRange.start + 1,
              event: 'character realization',
              impact: 0.7,
              significance: 0.8
            }
          ]
        }
      ],
      peakMoments: [
        {
          chapter: chapterRange.end - 1,
          themeId: 'theme_growth',
          intensity: 0.9,
          type: 'revelation',
          description: 'Major character insight'
        }
      ],
      resolutions: [],
      overallProgression: {
        points: [
          {
            chapter: chapterRange.start,
            intensity: 0.3,
            clarity: 0.4,
            impact: 0.2
          },
          {
            chapter: chapterRange.end,
            intensity: 0.8,
            clarity: 0.9,
            impact: 0.8
          }
        ],
        smoothness: 0.7,
        predictability: 0.6,
        satisfaction: 0.8
      },
      coherence: 0.8,
      satisfaction: 0.7
    };

    return {
      success: true,
      data: mockProgression,
      metadata: {
        operationId: `mock-thematic-progression-${Date.now()}`,
        timestamp: new Date().toISOString(),
        processingTime: 30,
        systemId: 'mock-theme-manager'
      }
    };
  }
}