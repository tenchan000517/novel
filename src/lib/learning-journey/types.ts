// // src/lib/learning-journey/types.ts

// /**
//  * @fileoverview 学びの物語システムの共通型定義
//  * @description
//  * 「魂のこもった学びの物語」を実現するためのシステムで使用される共通の型定義。
//  * データ構造、イベント、フローなどの基本的な型を提供する。
//  */

// import { LearningStage } from './system-integration-hub';
// import { Chapter } from '@/types/chapters';

  
// /**
//  * @fileoverview 学習旅程システムの共通型定義
//  * @description
//  * 「魂のこもった学びの物語」生成システムで使用される共通の型定義とインターフェース。
//  * フェーズ3で追加される共感共鳴システム、フィードバックループ、システム最適化の
//  * コンポーネントで使用される型を定義します。
//  */

// import { EmotionalArcDesign, ChapterEmotionAnalysis } from '@/lib/memory/emotional-arc-designer';
// import { ThemeResonanceAnalysis } from '@/lib/plot/theme-resonance-analyzer';
// import { CharacterPsychology } from '@/lib/characters/psychology-model';

// /**
//  * 概念に関する洞察
//  */
// export interface ConceptInsight {
//   content: string;             // 洞察の内容
//   chapterNumber: number;       // 獲得した章番号
//   stage: LearningStage;        // 獲得時の学習段階
//   significance: number;        // 重要度 (0-1)
//   associatedText?: string;     // 関連するテキスト
// }

// /**
//  * 概念の実践例
//  */
// export interface ConceptExample {
//   description: string;         // 実践例の説明
//   chapterNumber: number;       // 獲得した章番号
//   context: string;             // 実践の文脈
//   stage: LearningStage;        // 獲得時の学習段階
//   outcome?: string;            // 結果や効果
// }

// /**
//  * 学習旅程の構造
//  */
// export interface LearningJourney {
//   conceptName: string;                       // 概念名
//   stages: {
//     [stage in LearningStage]?: {
//       description: string;                   // 段階の説明
//       characteristics: string[];             // 段階の特徴
//       commonChallenges: string[];            // 一般的な課題
//       narrativeElements: string[];           // 物語要素
//     }
//   };
//   transformations: {
//     [fromStage in LearningStage]?: {
//       [toStage in LearningStage]?: {
//         description: string;                 // 変容の説明
//         triggers: string[];                  // 変容の引き金
//         narrativeElements: string[];         // 物語要素
//       }
//     }
//   };
// }

// /**
//  * 学習イベント
//  */
// export interface LearningEvent {
//   id: string;                               // イベントID
//   type: 'INSIGHT' | 'APPLICATION' | 'CHALLENGE' | 'REFLECTION' | 'INTEGRATION'; // イベントタイプ
//   conceptName: string;                      // 関連する概念名
//   chapterNumber: number;                    // 発生章番号
//   stage: LearningStage;                     // 発生時の学習段階
//   description: string;                      // イベントの説明
//   significance: number;                     // 重要度 (0-1)
//   characterIds?: string[];                  // 関連するキャラクターID
//   relatedText?: string;                     // 関連するテキスト
//   timestamp: string;                        // タイムスタンプ
// }

// /**
//  * 変容ポイント
//  */
// export interface TransformationPoint {
//   id: string;                               // 変容ポイントID
//   conceptName: string;                      // 関連する概念名
//   fromStage: LearningStage;                 // 変容前の段階
//   toStage: LearningStage;                   // 変容後の段階
//   chapterNumber: number;                    // 発生章番号
//   description: string;                      // 変容の説明
//   trigger: string;                          // 変容の引き金
//   characterIds?: string[];                  // 関連するキャラクターID
//   relatedText?: string;                     // 関連するテキスト
//   timestamp: string;                        // タイムスタンプ
// }

// /**
//  * 学びの共鳴ポイント（感情と学習が共鳴する箇所）
//  */
// export interface ResonancePoint {
//   id: string;                               // 共鳴ポイントID
//   chapterNumber: number;                    // 発生章番号
//   conceptName: string;                      // 関連する概念名
//   stage: LearningStage;                     // 発生時の学習段階
//   emotionalTone: string;                    // 感情の色調
//   emotionalIntensity: number;               // 感情の強度 (0-1)
//   learningSignificance: number;             // 学習の重要度 (0-1)
//   characterIds?: string[];                  // 関連するキャラクターID
//   description: string;                      // 共鳴の説明
//   relatedText?: string;                     // 関連するテキスト
//   timestamp: string;                        // タイムスタンプ
// }

// /**
//  * 学びの物語処理結果
//  */
// export interface LearningJourneyProcessResult {
//   chapter: Chapter;                         // 処理された章
//   currentSection: {                         // 現在の篇情報
//     id: string;
//     title: string;
//     mainConcept: string;
//     learningStage: LearningStage;
//   };
//   learningEvents: LearningEvent[];          // 検出された学習イベント
//   transformationPoints: TransformationPoint[]; // 検出された変容ポイント
//   resonancePoints: ResonancePoint[];        // 検出された共鳴ポイント
//   embodimentLevel: number;                  // 概念体現レベル (0-1)
//   recommendations: {                        // 提案
//     narrativeElements: string[];            // 物語要素の提案
//     characterDevelopment: string[];         // キャラクター発展の提案
//     learningProgression: string[];          // 学習進行の提案
//   };
// }

// /**
//  * 篇と物語フェーズの関連情報
//  */
// export interface SectionPhaseInfo {
//   section: {                                // 篇情報
//     id: string;
//     number: number;
//     title: string;
//     mainConcept: string;
//   };
//   phase: string;                            // 物語フェーズ名
//   progress: number;                         // フェーズ内の進捗 (0-1)
//   themeStrength: number;                    // テーマの強度 (0-1)
//   nextMilestone?: {                         // 次のマイルストーン
//     type: 'SECTION_END' | 'PHASE_TRANSITION' | 'MIDPOINT';
//     chapter: number;
//     description: string;
//   };
// }

// /**
//  * データフローチャネル
//  */
// export type DataFlowChannel = 
//   | 'section.updated'                       // 篇の更新
//   | 'learning.stage.changed'                // 学習段階の変更
//   | 'learning.event'                        // 学習イベントの発生
//   | 'transformation.point'                  // 変容ポイントの検出
//   | 'resonance.point'                       // 共鳴ポイントの検出
//   | 'concept.embodiment.updated'            // 概念体現度の更新
//   | 'chapter.processed'                     // 章の処理完了
//   | 'foreshadowing.generated'               // 伏線の生成
//   | 'character.growth.updated';             // キャラクター成長の更新

// /**
//  * サブシステム識別子
//  */
// export type SubsystemIdentifier =
//   | 'system.hub'                            // システム統合ハブ
//   | 'section.manager'                       // 篇マネージャー
//   | 'concept.library'                       // 概念ライブラリ
//   | 'memory.manager'                        // 記憶マネージャー
//   | 'foreshadowing.manager'                 // 伏線マネージャー
//   | 'character.manager'                     // キャラクターマネージャー
//   | 'emotion.manager'                       // 感情マネージャー
//   | 'theme.analyzer'                        // テーマ分析器
//   | 'phase.manager';                        // フェーズマネージャー

// /**
//  * システム状態キー
//  */
// export type SystemStateKey =
//   | 'current.section'                       // 現在の篇
//   | 'learning.stage'                        // 学習段階
//   | 'chapter.context'                       // 章のコンテキスト
//   | 'embodiment.level'                      // 体現レベル
//   | 'narrative.state'                       // 物語状態
//   | 'character.state'                       // キャラクター状態
//   | 'emotional.state'                       // 感情状態
//   | 'foreshadowing.state'                   // 伏線状態
//   | 'theme.state';                          // テーマ状態

// /**
//  * 共感ポイント定義
//  */
// export interface EmpatheticPoint {
//   /** 共感ポイントの種類 */
//   type: 'character' | 'situation' | 'decision' | 'realization' | 'transformation';
//   /** 共感ポイントの配置位置（章内の相対位置 0-1） */
//   position: number;
//   /** 共感ポイントの強度（0-1） */
//   intensity: number;
//   /** 共感ポイントの説明 */
//   description: string;
//   /** 関連する学習段階 */
//   relatedLearningStage?: LearningStage;
//   /** 意図された感情効果 */
//   intendedEmotionalEffect: string;
//   /** 共感ポイントの対象（キャラクター名など） */
//   target?: string;
// }

// /**
//  * カタルシス体験の定義
//  */
// export interface CatharticExperience {
//   /** カタルシスの種類 */
//   type: 'emotional' | 'intellectual' | 'moral' | 'transformative';
//   /** カタルシスの強度（0-1） */
//   intensity: number;
//   /** カタルシスのトリガーとなる要素 */
//   trigger: string;
//   /** カタルシスの準備段階 */
//   buildup: string[];
//   /** カタルシスのピーク瞬間の描写 */
//   peakMoment: string;
//   /** カタルシス後の変化 */
//   aftermath: string;
//   /** 関連する学習段階 */
//   relatedLearningStage: LearningStage;
//   /** 関連する概念名 */
//   relatedConcept: string;
// }

// /**
//  * 感情-学習連動パターン
//  */
// export interface EmotionLearningPattern {
//   /** パターン名 */
//   name: string;
//   /** 感情曲線のパターン */
//   emotionalCurve: {
//     start: number;
//     buildup: number[];
//     peak: number;
//     resolution: number;
//   };
//   /** 学習ステップのパターン */
//   learningSteps: {
//     initialStage: LearningStage;
//     progressionPoints: Array<{
//       position: number;
//       stage: LearningStage;
//     }>;
//     finalStage: LearningStage;
//   };
//   /** このパターンに適した概念タイプ */
//   suitableConceptTypes: string[];
//   /** このパターンの効果説明 */
//   effectDescription: string;
// }

// /**
//  * 共鳴構造定義
//  */
// export interface ResonanceStructure {
//   /** 主要な共鳴テーマ */
//   theme: string;
//   /** キャラクター側の要素 */
//   characterElement: {
//     /** 関連するキャラクター */
//     character: string;
//     /** キャラクターの内面状態 */
//     internalState: string;
//     /** キャラクターの表出行動 */
//     expressedBehavior: string;
//   };
//   /** 読者側の共鳴要素 */
//   readerElement: {
//     /** 想定される読者経験 */
//     expectedExperience: string;
//     /** 想定される読者反応 */
//     anticipatedResponse: string;
//   };
//   /** 共鳴の強度（0-1） */
//   resonanceStrength: number;
// }

// /**
//  * 学習効果指標
//  */
// export interface LearningEffectMetrics {
//   /** 概念理解度（0-1） */
//   conceptComprehension: number;
//   /** 概念体現度（0-1） */
//   conceptEmbodiment: number;
//   /** 各学習段階の達成レベル */
//   stageLevels: {
//     [key in LearningStage]?: number;
//   };
//   /** 正確な表現度（誤解や曖昧さの少なさ）（0-1） */
//   expressionAccuracy: number;
//   /** 実用的応用可能性（0-1） */
//   practicalApplicability: number;
//   /** 長期記憶定着度予測（0-1） */
//   retentionPrediction: number;
//   /** 測定の信頼性（0-1） */
//   measurementConfidence: number;
// }

// /**
//  * 感情-学習同期指標
//  */
// export interface EmotionLearningSyncMetrics {
//   /** 感情ピークと学習ポイントの同期度（0-1） */
//   peakSynchronization: number;
//   /** 感情変化と理解進展の一致度（0-1） */
//   progressionAlignment: number;
//   /** 感情的共鳴強度（0-1） */
//   emotionalResonance: number;
//   /** テーマと感情の統合度（0-1） */
//   themeEmotionIntegration: number;
//   /** カタルシス瞬間の効果（0-1） */
//   catharticMomentEffect: number;
//   /** 測定の信頼性（0-1） */
//   measurementConfidence: number;
// }

// /**
//  * システムパフォーマンス指標
//  */
// export interface SystemPerformanceMetrics {
//   /** AI呼び出し使用量 */
//   aiCallUsage: {
//     /** 総呼び出し回数 */
//     totalCalls: number;
//     /** コンポーネント別呼び出し回数 */
//     callsByComponent: {[component: string]: number};
//     /** 平均レスポンス時間（ミリ秒） */
//     avgResponseTime: number;
//   };
//   /** メモリ使用効率 */
//   memoryEfficiency: {
//     /** キャッシュヒット率（0-1） */
//     cacheHitRate: number;
//     /** データ重複率（0-1、低いほど良い） */
//     dataDuplicationRate: number;
//   };
//   /** エラー発生率（0-1、低いほど良い） */
//   errorRate: number;
//   /** 処理時間分析 */
//   processingTimeAnalysis: {
//     /** コンポーネント別平均処理時間（ミリ秒） */
//     averageTimeByComponent: {[component: string]: number};
//     /** ボトルネックコンポーネント */
//     bottlenecks: string[];
//   };
//   /** 特定機能の使用頻度 */
//   featureUsageFrequency: {[feature: string]: number};
// }

// /**
//  * エッジケース定義
//  */
// export interface EdgeCaseDefinition {
//   /** エッジケースの種類 */
//   type: string;
//   /** エッジケースの説明 */
//   description: string;
//   /** 検出条件 */
//   detectionCondition: string;
//   /** 推奨される対応策 */
//   recommendedAction: string;
//   /** 発生頻度の予測（低中高） */
//   expectedFrequency: 'low' | 'medium' | 'high';
//   /** 影響の深刻度（低中高） */
//   severityLevel: 'low' | 'medium' | 'high';
// }

// /**
//  * システム診断結果
//  */
// export interface SystemDiagnosticResult {
//   /** 診断時刻 */
//   timestamp: string;
//   /** システム健全性スコア（0-1） */
//   healthScore: number;
//   /** 検出された問題 */
//   detectedIssues: Array<{
//     component: string;
//     issueType: string;
//     description: string;
//     severity: 'low' | 'medium' | 'high' | 'critical';
//     recommendedAction?: string;
//   }>;
//   /** 最適化推奨事項 */
//   optimizationRecommendations: Array<{
//     target: string;
//     recommendation: string;
//     expectedImprovement: string;
//     implementationDifficulty: 'easy' | 'moderate' | 'complex';
//   }>;
//   /** 分析メトリクス */
//   metrics: SystemPerformanceMetrics;
// }

// /**
//  * 共感共鳴システムの設計結果
//  */
// export interface EmpatheticResonanceDesign {
//   /** 共感ポイント配列 */
//   empatheticPoints: EmpatheticPoint[];
//   /** カタルシス体験設計 */
//   catharticExperience?: CatharticExperience;
//   /** 感情-学習連動パターン */
//   emotionLearningPattern: EmotionLearningPattern;
//   /** 共鳴構造 */
//   resonanceStructures: ResonanceStructure[];
//   /** 設計の意図と説明 */
//   designRationale: string;
//   /** 推奨される感情曲線調整 */
//   recommendedEmotionalArcAdjustments?: Partial<EmotionalArcDesign>;
// }

// /**
//  * フィードバック分析結果
//  */
// export interface FeedbackAnalysisResult {
//   /** 学習効果指標 */
//   learningEffectMetrics: LearningEffectMetrics;
//   /** 感情-学習同期指標 */
//   emotionLearningSyncMetrics: EmotionLearningSyncMetrics;
//   /** 検出された強み */
//   detectedStrengths: string[];
//   /** 検出された弱み */
//   detectedWeaknesses: string[];
//   /** 最適化提案 */
//   optimizationSuggestions: Array<{
//     target: string;
//     suggestion: string;
//     expectedImpact: string;
//     priority: 'low' | 'medium' | 'high';
//   }>;
//   /** パラメータ調整提案 */
//   parameterAdjustments: {[parameter: string]: number};
//   /** 分析の信頼性（0-1） */
//   analysisConfidence: number;
// }

// /**
//  * 自己調整パラメータセット
//  */
// export interface SelfAdjustmentParameters {
//   /** 感情強度係数（0.5-1.5、1が標準） */
//   emotionalIntensityFactor: number;
//   /** 学習ペース係数（0.5-1.5、1が標準） */
//   learningPaceFactor: number;
//   /** 概念複雑度係数（0.5-1.5、1が標準） */
//   conceptComplexityFactor: number;
//   /** 共感重点係数（0.5-1.5、1が標準） */
//   empatheticEmphasisFactor: number;
//   /** 説明詳細度係数（0.5-1.5、1が標準） */
//   explanationDetailFactor: number;
//   /** 例示頻度係数（0.5-1.5、1が標準） */
//   exampleFrequencyFactor: number;
//   /** 伏線密度係数（0.5-1.5、1が標準） */
//   foreshadowingDensityFactor: number;
//   /** テーマ強調係数（0.5-1.5、1が標準） */
//   themeEmphasisFactor: number;
//   /** 調整タイムスタンプ */
//   lastAdjusted: string;
//   /** 調整根拠 */
//   adjustmentRationale: string;
// }

// // 各コンポーネントのイベント連携に使用するペイロード型
// export interface EmpatheticPointGeneratedEvent {
//   point: EmpatheticPoint;
//   chapterNumber: number;
//   conceptName: string;
// }

// export interface CatharticExperienceGeneratedEvent {
//   experience: CatharticExperience;
//   chapterNumber: number;
//   conceptName: string;
// }

// export interface LearningEffectMeasuredEvent {
//   metrics: LearningEffectMetrics;
//   chapterNumber: number;
//   conceptName: string;
// }

// export interface ParametersAdjustedEvent {
//   parameters: SelfAdjustmentParameters;
//   reason: string;
//   timestamp: string;
// }

// export interface SystemIssueDetectedEvent {
//   component: string;
//   issueType: string;
//   description: string;
//   severity: 'low' | 'medium' | 'high' | 'critical';
//   timestamp: string;
// }