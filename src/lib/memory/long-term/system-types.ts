
// ============================================================================
// 型定義：システム知識ベース
// ============================================================================

/**
 * プロンプト生成パターン（PromptGenerator救済データ）
 */
export interface PromptGenerationPattern {
    patternId: string;
    patternName: string;
    category: 'context' | 'instruction' | 'template' | 'variable' | 'format';
    description: string;

    // パターン定義
    pattern: string;
    variables: PromptVariable[];
    conditions: PromptCondition[];

    // 効果測定
    effectiveness: EffectivenessMetrics;
    usageStatistics: UsageStatistics;

    // 適用条件
    applicableGenres: string[];
    applicableScenarios: string[];
    chapterTypes: string[];

    // 学習データ
    successCases: SuccessCase[];
    failureCases: FailureCase[];
    optimizationHistory: OptimizationRecord[];

    // メタデータ
    createdAt: string;
    lastUsed: string;
    lastOptimized: string;
    version: string;
    tags: string[];
}

/**
 * プロンプト変数
 */
export interface PromptVariable {
    variableId: string;
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
    defaultValue?: any;
    constraints?: VariableConstraint[];
    examples: any[];
}

/**
 * プロンプト条件
 */
export interface PromptCondition {
    conditionId: string;
    type: 'genre' | 'chapter' | 'character' | 'context' | 'state';
    condition: string;
    weight: number;
    required: boolean;
}

/**
 * 変数制約
 */
export interface VariableConstraint {
    type: 'range' | 'enum' | 'pattern' | 'length';
    value: any;
    message: string;
}

/**
 * 効果測定指標
 */
export interface EffectivenessMetrics {
    qualityScore: number; // 0-10
    consistency: number; // 0-10
    creativity: number; // 0-10
    coherence: number; // 0-10
    readerEngagement: number; // 0-10
    processingTime: number; // milliseconds
    errorRate: number; // 0-1
    revisionCount: number;
    lastMeasured: string;
}

/**
 * 使用統計
 */
export interface UsageStatistics {
    totalUsage: number;
    successfulUsage: number;
    failedUsage: number;
    averageQuality: number;
    peakUsagePeriod: string;
    trendingScore: number;
    userSatisfaction: number;
    performanceMetrics: PerformanceMetrics;
}

/**
 * パフォーマンス指標
 */
export interface PerformanceMetrics {
    averageResponseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    apiCalls: number;
    cacheHitRate: number;
    lastMeasured: string;
}

/**
 * 成功事例
 */
export interface SuccessCase {
    caseId: string;
    scenario: string;
    inputParameters: Record<string, any>;
    outputQuality: number;
    userFeedback: string;
    chapterNumber: number;
    genre: string;
    timestamp: string;
    keyFactors: string[];
}

/**
 * 失敗事例
 */
export interface FailureCase {
    caseId: string;
    scenario: string;
    inputParameters: Record<string, any>;
    errorType: string;
    errorMessage: string;
    rootCause: string;
    chapterNumber: number;
    genre: string;
    timestamp: string;
    resolution?: string;
}

/**
 * 最適化記録
 */
export interface OptimizationRecord {
    optimizationId: string;
    optimizationType: 'parameter' | 'structure' | 'logic' | 'performance';
    before: any;
    after: any;
    reason: string;
    expectedImprovement: string;
    actualImprovement?: EffectivenessMetrics;
    timestamp: string;
    optimizedBy: string;
}

/**
 * 効果的テンプレートパターン
 */
export interface EffectiveTemplatePattern {
    templateId: string;
    templateName: string;
    category: string;

    // テンプレート定義
    structure: TemplateStructure;
    sections: TemplateSection[];
    placeholders: TemplatePlaceholder[];

    // 効果データ
    effectiveness: EffectivenessMetrics;
    bestPractices: BestPractice[];
    commonMistakes: CommonMistake[];

    // 適用データ
    applicableContexts: ApplicableContext[];
    variations: TemplateVariation[];

    // 学習データ
    evolutionHistory: TemplateEvolution[];
    feedbackData: FeedbackData[];

    // メタデータ
    createdAt: string;
    lastUpdated: string;
    maturityLevel: 'experimental' | 'tested' | 'proven' | 'deprecated';
    maintainer: string;
}

/**
 * テンプレート構造
 */
export interface TemplateStructure {
    format: 'markdown' | 'json' | 'yaml' | 'custom';
    sections: string[];
    requiredFields: string[];
    optionalFields: string[];
    validationRules: ValidationRule[];
}

/**
 * テンプレートセクション
 */
export interface TemplateSection {
    sectionId: string;
    name: string;
    type: 'header' | 'body' | 'footer' | 'variable' | 'conditional';
    content: string;
    required: boolean;
    order: number;
    dependencies: string[];
}

/**
 * テンプレートプレースホルダー
 */
export interface TemplatePlaceholder {
    placeholderId: string;
    name: string;
    type: string;
    description: string;
    defaultValue?: any;
    transformations: PlaceholderTransformation[];
}

/**
 * プレースホルダー変換
 */
export interface PlaceholderTransformation {
    transformationId: string;
    type: 'format' | 'filter' | 'validate' | 'enrich';
    function: string;
    parameters: Record<string, any>;
}

/**
 * ベストプラクティス
 */
export interface BestPractice {
    practiceId: string;
    title: string;
    description: string;
    category: string;
    impact: number; // 0-10
    evidence: Evidence[];
    applicableScenarios: string[];
    implementation: string;
}

/**
 * 一般的な間違い
 */
export interface CommonMistake {
    mistakeId: string;
    title: string;
    description: string;
    category: string;
    frequency: number;
    impact: number; // 0-10
    prevention: string;
    correction: string;
    examples: MistakeExample[];
}

/**
 * 間違いの例
 */
export interface MistakeExample {
    exampleId: string;
    scenario: string;
    incorrectApproach: string;
    correctApproach: string;
    explanation: string;
}

/**
 * 適用可能コンテキスト
 */
export interface ApplicableContext {
    contextId: string;
    name: string;
    description: string;
    conditions: Record<string, any>;
    priority: number;
    effectiveness: number;
}

/**
 * テンプレートバリエーション
 */
export interface TemplateVariation {
    variationId: string;
    name: string;
    baseTemplateId: string;
    differences: TemplateDifference[];
    useCase: string;
    effectiveness: EffectivenessMetrics;
}

/**
 * テンプレート差分
 */
export interface TemplateDifference {
    differenceId: string;
    type: 'addition' | 'removal' | 'modification';
    field: string;
    oldValue?: any;
    newValue?: any;
    reason: string;
}

/**
 * テンプレート進化
 */
export interface TemplateEvolution {
    evolutionId: string;
    version: string;
    changes: TemplateChange[];
    reason: string;
    impact: EffectivenessMetrics;
    timestamp: string;
}

/**
 * テンプレート変更
 */
export interface TemplateChange {
    changeId: string;
    type: 'structure' | 'content' | 'validation' | 'optimization';
    description: string;
    before: any;
    after: any;
    justification: string;
}

/**
 * フィードバックデータ
 */
export interface FeedbackData {
    feedbackId: string;
    source: 'user' | 'system' | 'ai' | 'automated';
    type: 'quality' | 'usability' | 'performance' | 'bug' | 'suggestion';
    rating: number; // 0-10
    comment: string;
    context: Record<string, any>;
    timestamp: string;
    actionTaken?: string;
}

/**
 * 検証ルール
 */
export interface ValidationRule {
    ruleId: string;
    name: string;
    type: 'required' | 'format' | 'range' | 'custom';
    condition: string;
    errorMessage: string;
    severity: 'error' | 'warning' | 'info';
}

/**
 * 証拠
 */
export interface Evidence {
    evidenceId: string;
    type: 'metric' | 'case_study' | 'user_feedback' | 'benchmark';
    description: string;
    data: any;
    source: string;
    reliability: number; // 0-10
    timestamp: string;
}

/**
 * 分析パターン
 */
export interface AnalysisPattern {
    patternId: string;
    patternName: string;
    category: 'emotional' | 'narrative' | 'character' | 'structure' | 'quality';

    // パターン定義
    analysisType: string;
    methodology: AnalysisMethodology;
    parameters: AnalysisParameter[];

    // 精度データ
    accuracy: AccuracyMetrics;
    reliability: ReliabilityMetrics;

    // 適用データ
    applicableGenres: string[];
    inputRequirements: InputRequirement[];
    outputFormat: OutputFormat;

    // 学習データ
    trainingData: TrainingData[];
    validationResults: ValidationResult[];

    // 改善履歴
    improvementHistory: ImprovementRecord[];

    // メタデータ
    createdAt: string;
    lastTrained: string;
    version: string;
    status: 'active' | 'testing' | 'deprecated';
}

/**
 * 分析方法論
 */
export interface AnalysisMethodology {
    approach: 'rule_based' | 'ml_based' | 'hybrid' | 'ai_assisted';
    algorithm: string;
    steps: AnalysisStep[];
    dependencies: string[];
    limitations: string[];
}

/**
 * 分析ステップ
 */
export interface AnalysisStep {
    stepId: string;
    name: string;
    description: string;
    order: number;
    inputType: string;
    outputType: string;
    processing: ProcessingInstruction[];
}

/**
 * 処理指示
 */
export interface ProcessingInstruction {
    instructionId: string;
    type: 'extract' | 'transform' | 'validate' | 'analyze' | 'score';
    operation: string;
    parameters: Record<string, any>;
}

/**
 * 分析パラメータ
 */
export interface AnalysisParameter {
    parameterId: string;
    name: string;
    type: string;
    description: string;
    defaultValue: any;
    range?: any;
    impact: number; // 0-10
}

/**
 * 精度指標
 */
export interface AccuracyMetrics {
    precision: number; // 0-1
    recall: number; // 0-1
    f1Score: number; // 0-1
    accuracy: number; // 0-1
    falsePositiveRate: number; // 0-1
    falseNegativeRate: number; // 0-1
    lastEvaluated: string;
}

/**
 * 信頼性指標
 */
export interface ReliabilityMetrics {
    consistency: number; // 0-1
    stability: number; // 0-1
    robustness: number; // 0-1
    reproducibility: number; // 0-1
    confidence: number; // 0-1
    variance: number;
    lastEvaluated: string;
}

/**
 * 入力要件
 */
export interface InputRequirement {
    requirementId: string;
    name: string;
    type: string;
    required: boolean;
    format: string;
    validation: ValidationRule[];
    examples: any[];
}

/**
 * 出力フォーマット
 */
export interface OutputFormat {
    formatId: string;
    type: string;
    structure: any;
    validation: ValidationRule[];
    postProcessing: PostProcessingStep[];
}

/**
 * 後処理ステップ
 */
export interface PostProcessingStep {
    stepId: string;
    name: string;
    operation: string;
    parameters: Record<string, any>;
    order: number;
}

/**
 * 訓練データ
 */
export interface TrainingData {
    dataId: string;
    input: any;
    expectedOutput: any;
    actualOutput?: any;
    quality: number; // 0-10
    source: string;
    timestamp: string;
    tags: string[];
}

/**
 * 検証結果
 */
export interface ValidationResult {
    validationId: string;
    testCase: string;
    input: any;
    expectedOutput: any;
    actualOutput: any;
    passed: boolean;
    score: number; // 0-10
    errors: string[];
    timestamp: string;
}

/**
 * 改善記録
 */
export interface ImprovementRecord {
    improvementId: string;
    type: 'algorithm' | 'parameter' | 'data' | 'validation';
    description: string;
    before: any;
    after: any;
    improvement: number; // percentage
    impact: AccuracyMetrics;
    timestamp: string;
    implementedBy: string;
}

/**
 * 最適化戦略
 */
export interface OptimizationStrategy {
    strategyId: string;
    strategyName: string;
    category: 'performance' | 'quality' | 'efficiency' | 'resource' | 'user_experience';

    // 戦略定義
    objective: string;
    approach: OptimizationApproach;
    techniques: OptimizationTechnique[];

    // 効果データ
    expectedBenefits: Benefit[];
    measuredImpact: ImpactMeasurement[];

    // 適用データ
    applicableScenarios: OptimizationScenario[];
    prerequisites: Prerequisite[];
    constraints: OptimizationConstraint[];

    // 実装データ
    implementationGuide: ImplementationGuide;
    rollbackPlan: RollbackPlan;

    // 監視データ
    monitoringMetrics: MonitoringMetric[];
    alertThresholds: AlertThreshold[];

    // メタデータ
    createdAt: string;
    lastApplied: string;
    successRate: number; // 0-1
    maturityLevel: 'experimental' | 'pilot' | 'production' | 'deprecated';
}

/**
 * 最適化アプローチ
 */
export interface OptimizationApproach {
    type: 'incremental' | 'revolutionary' | 'hybrid';
    methodology: string;
    phases: OptimizationPhase[];
    riskLevel: 'low' | 'medium' | 'high';
    timeframe: string;
}

/**
 * 最適化フェーズ
 */
export interface OptimizationPhase {
    phaseId: string;
    name: string;
    description: string;
    order: number;
    duration: string;
    deliverables: string[];
    successCriteria: string[];
}

/**
 * 最適化技術
 */
export interface OptimizationTechnique {
    techniqueId: string;
    name: string;
    description: string;
    type: string;
    difficulty: number; // 0-10
    effectiveness: number; // 0-10
    resources: ResourceRequirement[];
    steps: TechniqueStep[];
}

/**
 * 技術ステップ
 */
export interface TechniqueStep {
    stepId: string;
    name: string;
    description: string;
    order: number;
    duration: string;
    resources: string[];
    outputs: string[];
}

/**
 * リソース要件
 */
export interface ResourceRequirement {
    resourceId: string;
    type: 'time' | 'memory' | 'cpu' | 'storage' | 'bandwidth' | 'human';
    amount: number;
    unit: string;
    critical: boolean;
}

/**
 * 利益
 */
export interface Benefit {
    benefitId: string;
    type: 'performance' | 'quality' | 'cost' | 'user_satisfaction' | 'maintainability';
    description: string;
    quantification: string;
    timeframe: string;
    confidence: number; // 0-10
}

/**
 * 影響測定
 */
export interface ImpactMeasurement {
    measurementId: string;
    metric: string;
    baseline: number;
    target: number;
    actual: number;
    improvement: number; // percentage
    timestamp: string;
    measurementMethod: string;
}

/**
 * 最適化シナリオ
 */
export interface OptimizationScenario {
    scenarioId: string;
    name: string;
    description: string;
    conditions: Record<string, any>;
    priority: number; // 0-10
    complexity: number; // 0-10
}

/**
 * 前提条件
 */
export interface Prerequisite {
    prerequisiteId: string;
    description: string;
    type: 'technical' | 'resource' | 'organizational' | 'time';
    critical: boolean;
    validationMethod: string;
}

/**
 * 最適化制約
 */
export interface OptimizationConstraint {
    constraintId: string;
    type: 'resource' | 'time' | 'quality' | 'compatibility' | 'regulatory';
    description: string;
    value: any;
    flexibility: number; // 0-10
}

/**
 * 実装ガイド
 */
export interface ImplementationGuide {
    guideId: string;
    overview: string;
    detailedSteps: ImplementationStep[];
    checkpoints: Checkpoint[];
    troubleshooting: TroubleshootingGuide[];
}

/**
 * 実装ステップ
 */
export interface ImplementationStep {
    stepId: string;
    name: string;
    description: string;
    order: number;
    duration: string;
    dependencies: string[];
    deliverables: string[];
    validationCriteria: string[];
}

/**
 * チェックポイント
 */
export interface Checkpoint {
    checkpointId: string;
    name: string;
    description: string;
    order: number;
    criteria: string[];
    actions: CheckpointAction[];
}

/**
 * チェックポイントアクション
 */
export interface CheckpointAction {
    actionId: string;
    condition: string;
    action: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * トラブルシューティングガイド
 */
export interface TroubleshootingGuide {
    guideId: string;
    problem: string;
    symptoms: string[];
    diagnosis: DiagnosisStep[];
    solutions: Solution[];
}

/**
 * 診断ステップ
 */
export interface DiagnosisStep {
    stepId: string;
    description: string;
    method: string;
    expectedResult: string;
    order: number;
}

/**
 * 解決策
 */
export interface Solution {
    solutionId: string;
    description: string;
    steps: string[];
    difficulty: number; // 0-10
    timeRequired: string;
    successRate: number; // 0-1
}

/**
 * ロールバック計画
 */
export interface RollbackPlan {
    planId: string;
    description: string;
    triggers: RollbackTrigger[];
    steps: RollbackStep[];
    timeRequired: string;
    dataRecovery: DataRecoveryPlan;
}

/**
 * ロールバックトリガー
 */
export interface RollbackTrigger {
    triggerId: string;
    condition: string;
    threshold: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
    autoTrigger: boolean;
}

/**
 * ロールバックステップ
 */
export interface RollbackStep {
    stepId: string;
    description: string;
    order: number;
    duration: string;
    validation: string[];
}

/**
 * データ復旧計画
 */
export interface DataRecoveryPlan {
    planId: string;
    description: string;
    backupStrategy: string;
    recoverySteps: string[];
    timeRequired: string;
    dataIntegrityChecks: string[];
}

/**
 * 監視指標
 */
export interface MonitoringMetric {
    metricId: string;
    name: string;
    description: string;
    type: 'counter' | 'gauge' | 'histogram' | 'timer';
    unit: string;
    frequency: string;
    threshold: MetricThreshold;
}

/**
 * 指標閾値
 */
export interface MetricThreshold {
    warning: number;
    critical: number;
    operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
}

/**
 * アラート閾値
 */
export interface AlertThreshold {
    thresholdId: string;
    metric: string;
    condition: string;
    value: number;
    severity: 'info' | 'warning' | 'error' | 'critical';
    action: string;
    cooldown: string;
}

/**
 * エラーパターン
 */
export interface ErrorPattern {
    patternId: string;
    patternName: string;
    category: 'generation' | 'analysis' | 'storage' | 'integration' | 'validation';

    // パターン定義
    errorType: string;
    symptoms: ErrorSymptom[];
    rootCauses: RootCause[];

    // 発生データ
    frequency: FrequencyData;
    severity: SeverityData;
    impact: ErrorImpact;

    // 検出データ
    detectionMethods: DetectionMethod[];
    earlyWarnings: EarlyWarning[];

    // 解決データ
    solutions: ErrorSolution[];
    preventionMeasures: PreventionMeasure[];

    // 履歴データ
    occurrenceHistory: ErrorOccurrence[];
    resolutionHistory: ErrorResolution[];

    // メタデータ
    firstDetected: string;
    lastOccurred: string;
    status: 'active' | 'resolved' | 'monitoring' | 'archived';
}

/**
 * エラー症状
 */
export interface ErrorSymptom {
    symptomId: string;
    description: string;
    severity: number; // 0-10
    frequency: number; // 0-1
    observable: boolean;
    measurable: boolean;
    indicators: string[];
}

/**
 * 根本原因
 */
export interface RootCause {
    causeId: string;
    description: string;
    category: 'code' | 'data' | 'configuration' | 'environment' | 'user' | 'system';
    probability: number; // 0-1
    evidence: string[];
    dependencies: string[];
}

/**
 * 頻度データ
 */
export interface FrequencyData {
    occurrencesPerDay: number;
    occurrencesPerWeek: number;
    occurrencesPerMonth: number;
    peakTimes: string[];
    trends: TrendData[];
}

/**
 * トレンドデータ
 */
export interface TrendData {
    period: string;
    direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    changeRate: number; // percentage
    confidence: number; // 0-1
}

/**
 * 重要度データ
 */
export interface SeverityData {
    userImpact: number; // 0-10
    systemImpact: number; // 0-10
    businessImpact: number; // 0-10
    recoveryDifficulty: number; // 0-10
    overallSeverity: number; // 0-10
}

/**
 * エラー影響
 */
export interface ErrorImpact {
    impactId: string;
    type: 'performance' | 'quality' | 'availability' | 'data' | 'user_experience';
    description: string;
    quantification: string;
    duration: string;
    scope: string;
}

/**
 * 検出方法
 */
export interface DetectionMethod {
    methodId: string;
    name: string;
    type: 'automated' | 'manual' | 'user_reported' | 'monitoring';
    description: string;
    accuracy: number; // 0-1
    latency: string;
    cost: number;
    implementation: string;
}

/**
 * 早期警告
 */
export interface EarlyWarning {
    warningId: string;
    name: string;
    description: string;
    indicators: string[];
    threshold: any;
    leadTime: string;
    accuracy: number; // 0-1
}

/**
 * エラー解決策
 */
export interface ErrorSolution {
    solutionId: string;
    name: string;
    description: string;
    type: 'immediate' | 'workaround' | 'permanent' | 'preventive';
    steps: SolutionStep[];
    effectiveness: number; // 0-1
    complexity: number; // 0-10
    timeRequired: string;
    resources: string[];
}

/**
 * 解決策ステップ
 */
export interface SolutionStep {
    stepId: string;
    description: string;
    order: number;
    duration: string;
    validation: string;
    rollback?: string;
}

/**
 * 予防措置
 */
export interface PreventionMeasure {
    measureId: string;
    name: string;
    description: string;
    type: 'process' | 'technical' | 'training' | 'monitoring';
    implementation: string;
    effectiveness: number; // 0-1
    cost: number;
    maintenance: string;
}

/**
 * エラー発生
 */
export interface ErrorOccurrence {
    occurrenceId: string;
    timestamp: string;
    context: Record<string, any>;
    symptoms: string[];
    severity: number; // 0-10
    impact: string;
    detectionMethod: string;
    timeToDetection: string;
    resolved: boolean;
    resolutionTime?: string;
}

/**
 * エラー解決
 */
export interface ErrorResolution {
    resolutionId: string;
    occurrenceId: string;
    timestamp: string;
    method: string;
    steps: string[];
    timeRequired: string;
    effectiveness: number; // 0-1
    followUp: string[];
    preventionImplemented: boolean;
}

/**
 * 品質改善戦略
 */
export interface QualityImprovementStrategy {
    strategyId: string;
    strategyName: string;
    category: 'content' | 'process' | 'system' | 'user_experience' | 'performance';

    // 戦略定義
    objective: string;
    scope: string;
    approach: QualityApproach;

    // 品質指標
    qualityMetrics: QualityMetric[];
    targetLevels: QualityTarget[];

    // 改善手法
    techniques: QualityTechnique[];
    tools: QualityTool[];

    // 実装計画
    implementationPlan: QualityImplementationPlan;
    milestones: QualityMilestone[];

    // 測定・監視
    measurementFramework: MeasurementFramework;
    continuousImprovement: ContinuousImprovementPlan;

    // メタデータ
    createdAt: string;
    lastReviewed: string;
    status: 'draft' | 'approved' | 'active' | 'completed' | 'suspended';
    owner: string;
}

/**
 * 品質アプローチ
 */
export interface QualityApproach {
    methodology: string;
    principles: string[];
    phases: QualityPhase[];
    stakeholders: string[];
    governance: string;
}

/**
 * 品質フェーズ
 */
export interface QualityPhase {
    phaseId: string;
    name: string;
    description: string;
    order: number;
    duration: string;
    objectives: string[];
    deliverables: string[];
    exitCriteria: string[];
}

/**
 * 品質指標
 */
export interface QualityMetric {
    metricId: string;
    name: string;
    description: string;
    type: 'quantitative' | 'qualitative';
    unit: string;
    formula?: string;
    dataSource: string;
    frequency: string;
    benchmark: number;
}

/**
 * 品質目標
 */
export interface QualityTarget {
    targetId: string;
    metricId: string;
    baseline: number;
    target: number;
    timeframe: string;
    priority: number; // 0-10
    feasibility: number; // 0-10
}

/**
 * 品質技術
 */
export interface QualityTechnique {
    techniqueId: string;
    name: string;
    description: string;
    category: string;
    applicability: string[];
    effectiveness: number; // 0-10
    complexity: number; // 0-10
    resources: string[];
    steps: string[];
}

/**
 * 品質ツール
 */
export interface QualityTool {
    toolId: string;
    name: string;
    description: string;
    type: 'measurement' | 'analysis' | 'improvement' | 'monitoring';
    capabilities: string[];
    limitations: string[];
    integration: string[];
    cost: string;
}

/**
 * 品質実装計画
 */
export interface QualityImplementationPlan {
    planId: string;
    overview: string;
    phases: ImplementationPhase[];
    resources: ResourceAllocation[];
    timeline: Timeline;
    risks: Risk[];
    dependencies: Dependency[];
}

/**
 * 実装フェーズ
 */
export interface ImplementationPhase {
    phaseId: string;
    name: string;
    description: string;
    order: number;
    startDate: string;
    endDate: string;
    activities: Activity[];
    deliverables: string[];
    successCriteria: string[];
}

/**
 * アクティビティ
 */
export interface Activity {
    activityId: string;
    name: string;
    description: string;
    duration: string;
    dependencies: string[];
    resources: string[];
    owner: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
}

/**
 * リソース配分
 */
export interface ResourceAllocation {
    resourceType: string;
    amount: number;
    unit: string;
    timeframe: string;
    justification: string;
}

/**
 * タイムライン
 */
export interface Timeline {
    startDate: string;
    endDate: string;
    keyMilestones: string[];
    criticalPath: string[];
    bufferTime: string;
}

/**
 * リスク
 */
export interface Risk {
    riskId: string;
    description: string;
    category: string;
    probability: number; // 0-1
    impact: number; // 0-10
    mitigation: string[];
    contingency: string[];
    owner: string;
}

/**
 * 依存関係
 */
export interface Dependency {
    dependencyId: string;
    type: 'internal' | 'external';
    description: string;
    source: string;
    target: string;
    criticality: number; // 0-10
    status: string;
}

/**
 * 品質マイルストーン
 */
export interface QualityMilestone {
    milestoneId: string;
    name: string;
    description: string;
    targetDate: string;
    criteria: string[];
    metrics: string[];
    status: 'pending' | 'achieved' | 'missed' | 'at_risk';
}

/**
 * 測定フレームワーク
 */
export interface MeasurementFramework {
    frameworkId: string;
    approach: string;
    dataCollection: DataCollectionMethod[];
    analysis: AnalysisMethod[];
    reporting: ReportingMethod[];
    governance: MeasurementGovernance;
}

/**
 * データ収集方法
 */
export interface DataCollectionMethod {
    methodId: string;
    name: string;
    description: string;
    type: 'automated' | 'manual' | 'survey' | 'observation';
    frequency: string;
    dataPoints: string[];
    quality: number; // 0-10
}

/**
 * 分析方法
 */
export interface AnalysisMethod {
    methodId: string;
    name: string;
    description: string;
    type: 'statistical' | 'trend' | 'comparative' | 'predictive';
    tools: string[];
    outputs: string[];
}

/**
 * レポート方法
 */
export interface ReportingMethod {
    methodId: string;
    name: string;
    description: string;
    format: string;
    frequency: string;
    audience: string[];
    content: string[];
}

/**
 * 測定ガバナンス
 */
export interface MeasurementGovernance {
    roles: Role[];
    responsibilities: Responsibility[];
    processes: Process[];
    standards: Standard[];
}

/**
 * 役割
 */
export interface Role {
    roleId: string;
    name: string;
    description: string;
    responsibilities: string[];
    qualifications: string[];
}

/**
 * 責任
 */
export interface Responsibility {
    responsibilityId: string;
    description: string;
    owner: string;
    scope: string;
    frequency: string;
}

/**
 * プロセス
 */
export interface Process {
    processId: string;
    name: string;
    description: string;
    steps: ProcessStep[];
    inputs: string[];
    outputs: string[];
    controls: string[];
}

/**
 * プロセスステップ
 */
export interface ProcessStep {
    stepId: string;
    name: string;
    description: string;
    order: number;
    duration: string;
    owner: string;
    inputs: string[];
    outputs: string[];
}

/**
 * 標準
 */
export interface Standard {
    standardId: string;
    name: string;
    description: string;
    version: string;
    applicability: string[];
    requirements: string[];
    compliance: string;
}

/**
 * 継続改善計画
 */
export interface ContinuousImprovementPlan {
    planId: string;
    cycle: 'PDCA' | 'DMAIC' | 'custom';
    frequency: string;
    reviewProcess: ReviewProcess;
    improvementActions: ImprovementAction[];
    learningCapture: LearningCapture;
}

/**
 * レビュープロセス
 */
export interface ReviewProcess {
    processId: string;
    frequency: string;
    participants: string[];
    agenda: string[];
    outputs: string[];
    followUp: string[];
}

/**
 * 改善アクション
 */
export interface ImprovementAction {
    actionId: string;
    description: string;
    priority: number; // 0-10
    effort: string;
    impact: string;
    owner: string;
    dueDate: string;
    status: string;
}

/**
 * 学習捕捉
 */
export interface LearningCapture {
    method: string;
    frequency: string;
    documentation: string[];
    sharing: string[];
    application: string[];
}