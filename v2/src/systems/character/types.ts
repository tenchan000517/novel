/**
 * キャラクター管理システムの型定義
 * MBTI統合、心理分析、成長管理に関連する型
 */

// ============================================================================
// MBTI統計データ
// ============================================================================

export interface MBTIStatisticalData {
  type: string;
  sampleSize: number;
  learningSuccessRates: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    reading: number;
  };
  commonFailurePatterns: FailurePattern[];
  stressIndicators: string[];
  motivationTriggers: string[];
  compatibilityMatrix: Map<string, number>;
}

export interface FailurePattern {
  scenario: string;
  frequency: number;
  triggers: string[];
  recoveryStrategies: string[];
  preventionMethods: string[];
}

// ============================================================================
// キャラクター生成設定
// ============================================================================

export interface CharacterGenerationConfig {
  nameGeneration: {
    useRandomNames: boolean;
    nameDatabase: string[];
    culturalBackground?: string;
  };
  personalityGeneration: {
    useRealisticDistribution: boolean;
    mbtiDistribution: Map<string, number>;
    traitCorrelations: Map<string, number>;
  };
  parameterGeneration: {
    baseValues: {
      min: number;
      max: number;
      average: number;
    };
    specializations: Map<string, number>;
  };
}

// ============================================================================
// キャラクター検出システム
// ============================================================================

export interface CharacterDetectionResult {
  characterId?: string;
  confidence: number;
  detectionMethod: 'name' | 'description' | 'behavior' | 'context';
  matchedFeatures: string[];
  suggestedActions: string[];
}

export interface CharacterAppearance {
  chapterNumber: number;
  context: string;
  role: 'main' | 'supporting' | 'mentioned' | 'background';
  interactionType: 'dialogue' | 'action' | 'description' | 'thought';
  emotionalState?: string;
  relevanceScore: number;
}

export interface CharacterMention {
  type: 'direct' | 'indirect' | 'reference' | 'implication';
  content: string;
  context: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  importance: number;
}

// ============================================================================
// パフォーマンスメトリックス
// ============================================================================

export interface CharacterSystemMetrics {
  totalCharacters: number;
  activeCharacters: number;
  characterCreationRate: number;
  averageComplexity: number;
  mbtiCoverage: number;
  relationshipDensity: number;
  growthCompletionRate: number;
  psychologyAnalysisAccuracy: number;
}

export interface CharacterPerformanceMetrics {
  analysisTime: {
    psychology: number;
    mbti: number;
    relationships: number;
    growth: number;
  };
  accuracyScores: {
    behaviorPrediction: number;
    emotionalAnalysis: number;
    growthPrediction: number;
    relationshipPrediction: number;
  };
  systemLoad: {
    cpuUsage: number;
    memoryUsage: number;
    storageUsage: number;
  };
}

// ============================================================================
// キャラクターバランシング
// ============================================================================

export interface CharacterBalance {
  characterId: string;
  overallScore: number;
  dimensionScores: {
    personality: number;
    abilities: number;
    relationships: number;
    growth: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: BalanceRecommendation[];
}

export interface BalanceRecommendation {
  type: 'enhancement' | 'reduction' | 'addition' | 'removal';
  area: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementation: string[];
}

// ============================================================================
// キャラクター名生成
// ============================================================================

export interface NameGenerationOptions {
  gender?: 'male' | 'female' | 'neutral' | 'any';
  culturalBackground?: string;
  nameLength?: 'short' | 'medium' | 'long' | 'any';
  uniqueness?: number; // 0-1
  personalityMatch?: boolean;
  avoidSimilar?: string[];
}

export interface GeneratedName {
  firstName: string;
  lastName?: string;
  nickname?: string;
  title?: string;
  culturalOrigin: string;
  meaning?: string;
  personalityAlignment: number;
  uniquenessScore: number;
}

// ============================================================================
// 性格計算機
// ============================================================================

export interface PersonalityCalculation {
  inputTraits: Map<string, number>;
  calculatedMBTI: string;
  confidence: number;
  alternativeTypes: Array<{
    type: string;
    probability: number;
  }>;
  traitConsistency: number;
  calculationMethod: string;
}

export interface PersonalityCompatibility {
  character1Id: string;
  character2Id: string;
  overallCompatibility: number;
  dimensionCompatibility: {
    personality: number;
    communication: number;
    values: number;
    goals: number;
  };
  potentialConflicts: string[];
  synergies: string[];
  relationshipPrediction: string;
}

// ============================================================================
// キャラクターシリアライゼーション
// ============================================================================

export interface CharacterSerialization {
  version: string;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  includeHistory: boolean;
  includeRelationships: boolean;
  includeAnalytics: boolean;
}

export interface SerializedCharacter {
  metadata: {
    version: string;
    serializedAt: Date;
    compressionRatio?: number;
    checksum: string;
  };
  data: string; // Base64 encoded character data
  relationships?: string; // Base64 encoded relationship data
  analytics?: string; // Base64 encoded analytics data
}

// ============================================================================
// キャラクターインポート/エクスポート
// ============================================================================

export interface CharacterImportOptions {
  source: 'json' | 'yaml' | 'csv' | 'database';
  validationLevel: 'strict' | 'moderate' | 'lenient';
  conflictResolution: 'skip' | 'overwrite' | 'merge' | 'prompt';
  includeRelationships: boolean;
  includeHistory: boolean;
}

export interface CharacterExportOptions {
  format: 'json' | 'yaml' | 'csv' | 'pdf' | 'markdown';
  includeAnalytics: boolean;
  includeRelationships: boolean;
  includeHistory: boolean;
  compressionEnabled: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ImportResult {
  successCount: number;
  failureCount: number;
  skippedCount: number;
  importedCharacters: string[];
  errors: ImportError[];
  warnings: string[];
}

export interface ImportError {
  characterName?: string;
  lineNumber?: number;
  errorType: string;
  message: string;
  suggestedFix?: string;
}

// ============================================================================
// キャラクターテンプレート
// ============================================================================

export interface CharacterTemplate {
  id: string;
  name: string;
  description: string;
  category: 'archetype' | 'role' | 'personality' | 'custom';
  templateData: {
    personalityTraits: Partial<any>; // PersonalityTraits from interfaces
    defaultParameters: Partial<any>; // CharacterParameters from interfaces
    suggestedSkills: string[];
    commonRelationships: string[];
    growthPattern: string;
  };
  usage: {
    timesUsed: number;
    successRate: number;
    lastUsed: Date;
  };
}

export interface TemplateApplication {
  templateId: string;
  targetCharacterId: string;
  applicationMode: 'full' | 'partial' | 'reference';
  customizations: Map<string, any>;
  result: {
    success: boolean;
    appliedFields: string[];
    conflicts: string[];
    warnings: string[];
  };
}

// ============================================================================
// キャラクター検証
// ============================================================================

export interface CharacterValidation {
  characterId: string;
  validationResults: {
    personality: ValidationResult;
    parameters: ValidationResult;
    skills: ValidationResult;
    relationships: ValidationResult;
    growth: ValidationResult;
  };
  overallScore: number;
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: ValidationIssue[];
  suggestions: string[];
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  severity: number;
  field?: string;
  suggestedFix?: string;
}

// ============================================================================
// キャラクターバックアップ
// ============================================================================

export interface CharacterBackup {
  backupId: string;
  characterId: string;
  backupType: 'full' | 'incremental' | 'differential';
  createdAt: Date;
  dataSize: number;
  compressionRatio: number;
  metadata: {
    version: string;
    characterVersion: number;
    checksum: string;
    dependencies: string[];
  };
}

export interface BackupSchedule {
  characterId: string;
  scheduleType: 'daily' | 'weekly' | 'monthly' | 'onchange';
  retentionPeriod: number; // days
  compressionEnabled: boolean;
  cloudSync: boolean;
  lastBackup: Date;
  nextBackup: Date;
}

// ============================================================================
// キャラクターイベント
// ============================================================================

export interface CharacterEvent {
  id: string;
  characterId: string;
  eventType: 
    | 'creation' | 'update' | 'deletion'
    | 'growth_milestone' | 'relationship_change'
    | 'skill_gained' | 'parameter_change'
    | 'psychology_update' | 'state_change';
  timestamp: Date;
  description: string;
  data: any;
  impact: {
    magnitude: number;
    areas: string[];
    duration: number;
  };
  causedBy: {
    system: string;
    operation: string;
    user?: string;
  };
}

export interface EventHistory {
  characterId: string;
  events: CharacterEvent[];
  totalEvents: number;
  firstEvent: Date;
  lastEvent: Date;
  eventTypes: Map<string, number>;
  impactSummary: {
    totalImpact: number;
    majorEvents: CharacterEvent[];
    trends: string[];
  };
}