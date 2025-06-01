// src/lib/learning-journey/emotional-learning-integrator.ts

/**
 * @fileoverview 感情学習統合器
 * @description
 * 概念学習と感情体験を統合するコンポーネント。
 * 感情アークの設計、カタルシス体験の生成、感情と学習の同期分析を一元管理する。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { EventBus } from './event-bus';
import { LearningStage } from './concept-learning-manager';
import { memoryManager } from '@/lib/memory/manager';
import { JsonParser } from '@/lib/utils/json-parser';

/**
 * 感情次元を表す型
 */
export interface EmotionalDimension {
    dimension: string;  // 感情次元名
    level: number;      // 強度 (0-10)
}

/**
 * 感情アーク設計を表す型
 */
export interface EmotionalArcDesign {
    recommendedTone: string;  // 推奨トーン
    emotionalJourney: {       // 感情の旅
        opening: EmotionalDimension[];      // 始まり
        development: EmotionalDimension[];  // 展開
        conclusion: EmotionalDimension[];   // 結末
    };
    reason: string;           // 設計理由
}

/**
 * 共感ポイントを表す型
 */
export interface EmpatheticPoint {
    type: 'character' | 'situation' | 'decision' | 'realization' | 'transformation';
    position: number;   // 章内での相対位置 (0-1)
    intensity: number;  // 強度 (0-1)
    description: string; // 説明
}

/**
 * カタルシス体験を表す型
 */
export interface CatharticExperience {
    type: 'emotional' | 'intellectual' | 'moral' | 'transformative';
    intensity: number;        // 強度 (0-1)
    trigger: string;          // トリガー
    buildup: string[];        // 準備段階
    peakMoment: string;       // ピーク瞬間
    aftermath: string;        // 余韻
    relatedLearningStage: LearningStage;
    relatedConcept: string;
}

/**
 * 感情学習同期指標を表す型
 */
export interface EmotionLearningSyncMetrics {
    peakSynchronization: number;     // 感情ピークと学習ポイントの同期度 (0-1)
    progressionAlignment: number;    // 感情変化と理解進展の一致度 (0-1)
    emotionalResonance: number;      // 感情的共鳴強度 (0-1)
    themeEmotionIntegration: number; // テーマと感情の統合度 (0-1)
    catharticMomentEffect: number;   // カタルシス瞬間の効果 (0-1)
    measurementConfidence: number;   // 測定の信頼性 (0-1)
}

interface RawEmpatheticPoint {
    type?: string;
    position?: number;
    intensity?: number;
    description?: string;
    [key: string]: any; // その他のプロパティを許容
}

// より厳密な型を持つポイント
interface ValidatedPoint {
    type: string;
    position: number;
    intensity: number;
    description: string;
}

/**
 * @class EmotionalLearningIntegrator
 * @description
 * 概念学習と感情体験を統合するクラス。
 * EmotionLearningSynchronizationAnalyzer、CatharticExperienceDesigner、
 * LearningEmotionalIntegratorの機能を統合して一元管理する。
 */
export class EmotionalLearningIntegrator {

    /**
     * コンストラクタ
     * @param geminiClient AIモデルとの通信を行うクライアント
     * @param eventBus イベントバス
     */
    constructor(
        private geminiClient: GeminiClient,
        private eventBus: EventBus
    ) {
        logger.info('EmotionalLearningIntegrator initialized');
    }

    /**
     * 学習段階に適した感情アークを設計する
     * 
     * @param conceptName 概念名
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @returns 感情アーク設計
     */
    async designEmotionalArc(
        conceptName: string,
        stage: LearningStage,
        chapterNumber: number
    ): Promise<EmotionalArcDesign> {
        try {
            logger.info(`Designing emotional arc for concept ${conceptName} at stage ${stage}`);

            // 学習段階に適した感情アーク設計を返す
            const emotionalArc = this.createStageBasedEmotionalArc(stage);

            // NarrativeMemoryの状態として安全に保存
            try {
                const narrativeMemory = memoryManager.getMidTermMemory();

                // メソッドの存在確認と安全な呼び出し
                if (narrativeMemory && typeof narrativeMemory.updateNarrativeState === 'function') {
                    await narrativeMemory.updateNarrativeState({
                        id: `arc-update-${chapterNumber}`,
                        chapterNumber,
                        title: `Chapter ${chapterNumber}`,
                        content: '',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        metadata: {
                            emotionalArc: emotionalArc,
                            designReason: emotionalArc.reason
                        }
                    });
                } else {
                    logger.warn(`narrativeMemory.updateNarrativeState is not available - skipping this update`);
                    // コンポーネントがない場合も続行可能
                }
            } catch (memoryError) {
                logger.warn(`Failed to update narrative memory: ${memoryError instanceof Error ? memoryError.message : String(memoryError)}`);
                // エラーがあっても続行
            }

            // イベント発行
            this.eventBus.publish('emotional.arc.designed', {
                conceptName,
                stage,
                chapterNumber,
                arc: emotionalArc
            });

            return emotionalArc;
        } catch (error) {
            // エラーログと処理継続
            logger.error(`Failed to design emotional arc for ${conceptName}`, {
                error: error instanceof Error ? error.message : String(error),
                stage
            });

            // エラー時はデフォルト設計を返す
            return this.createDefaultEmotionalArc();
        }
    }
    /**
     * カタルシス体験を設計する
     * 
     * @param conceptName 概念名
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @returns カタルシス体験の設計
     */
    async designCatharticExperience(
        conceptName: string,
        stage: LearningStage,
        chapterNumber: number
    ): Promise<CatharticExperience | null> {
        try {
            // カタルシスが適切な学習段階かチェック
            if (!this.isCatharticAppropriateForStage(stage)) {
                logger.info(`Cathartic experience not appropriate for stage ${stage}, skipping design`);
                return null;
            }

            logger.info(`Designing cathartic experience for ${conceptName} at stage ${stage}`);

            // 学習段階に適したカタルシス体験を生成
            const catharticExperience = this.createStageBasedCatharticExperience(
                conceptName,
                stage
            );

            // カタルシス体験が存在する場合、NarrativeMemoryに記録
            if (catharticExperience) {
                const narrativeMemory = memoryManager.getMidTermMemory();
                // ターニングポイントとして追加
                narrativeMemory.narrativeStateManager.addTurningPoint({
                    chapter: chapterNumber,
                    description: `カタルシス体験: ${catharticExperience.peakMoment.substring(0, 50)}...`,
                    significance: 8
                });
            }

            // イベント発行
            this.eventBus.publish('cathartic.experience.designed', {
                conceptName,
                stage,
                chapterNumber,
                experience: catharticExperience
            });

            return catharticExperience;
        } catch (error) {
            logger.error(`Failed to design cathartic experience for ${conceptName}`, {
                error: error instanceof Error ? error.message : String(error),
                stage
            });

            // エラー時はnullを返す
            return null;
        }
    }

    /**
     * 感情と学習の同期度を分析する
     * 
     * @param chapterContent 章内容
     * @param conceptName 概念名
     * @param stage 学習段階
     * @returns 感情学習同期指標
     */
    async analyzeSynchronization(
        chapterContent: string,
        conceptName: string,
        stage: LearningStage
    ): Promise<EmotionLearningSyncMetrics> {
        try {
            logger.info(`Analyzing emotion-learning synchronization for ${conceptName} at stage ${stage}`);

            // AIを使って章内容を分析
            const truncatedContent = chapterContent.length > 5000
                ? chapterContent.substring(0, 5000) + '...(truncated)'
                : chapterContent;

            const prompt = this.createSynchronizationPrompt(
                truncatedContent,
                conceptName,
                stage
            );

            const response = await this.geminiClient.generateText(prompt, {
                temperature: 0.1,
                responseFormat: 'json'
            });

            try {
                // JSONレスポンスをパース
                const metrics = JsonParser.parseFromAIResponse(response, this.createDefaultSyncMetrics());

                // 値のバリデーション
                const validatedMetrics = this.validateSyncMetrics(metrics);

                // NarrativeMemoryに同期分析結果を保存
                const narrativeMemory = memoryManager.getMidTermMemory();
                narrativeMemory.emotionalDynamicsManager.updateSyncMetrics(
                    conceptName,
                    stage,
                    validatedMetrics
                );

                // イベント発行
                this.eventBus.publish('emotion.learning.synchronized', {
                    conceptName,
                    stage,
                    metrics: validatedMetrics
                });

                return validatedMetrics;
            } catch (error) {
                logger.error(`Failed to parse synchronization response`, {
                    error: error instanceof Error ? error.message : String(error)
                });

                // エラー時はデフォルト指標を返す
                return this.createDefaultSyncMetrics();
            }
        } catch (error) {
            logger.error(`Failed to analyze synchronization for ${conceptName}`, {
                error: error instanceof Error ? error.message : String(error),
                stage
            });

            // エラー時はデフォルト指標を返す
            return this.createDefaultSyncMetrics();
        }
    }

    /**
     * 共感ポイントを生成する
     * 
     * @param chapterContent 章内容
     * @param conceptName 概念名
     * @param stage 学習段階
     * @returns 共感ポイントの配列
     */
    async generateEmpatheticPoints(
        chapterContent: string,
        conceptName: string,
        stage: LearningStage
    ): Promise<EmpatheticPoint[]> {
        try {
            logger.info(`Generating empathetic points for ${conceptName} at stage ${stage}`);

            // AIを使って共感ポイントを生成
            const truncatedContent = chapterContent.length > 5000
                ? chapterContent.substring(0, 5000) + '...(truncated)'
                : chapterContent;

            const prompt = this.createEmpatheticPointsPrompt(
                truncatedContent,
                conceptName,
                stage
            );

            const response = await this.geminiClient.generateText(prompt, {
                temperature: 0.3,
                responseFormat: 'json'
            });

            try {
                // JSONレスポンスをパース
                const result = JsonParser.parseFromAIResponse(response, { points: [] });

                if (Array.isArray(result.points)) {
                    // まず、有効なポイントだけをフィルタリングし、タイプガードを使用して型を保証
                    const validPoints: ValidatedPoint[] = result.points.filter((point: any): point is ValidatedPoint =>
                        point !== null &&
                        point !== undefined &&
                        typeof point.type === 'string' &&
                        typeof point.position === 'number' &&
                        typeof point.intensity === 'number' &&
                        typeof point.description === 'string'
                    );

                    // 次に、ValidatedPoint から EmpatheticPoint に変換
                    const validatedPoints = validPoints.map((point): EmpatheticPoint => ({
                        type: point.type as 'character' | 'situation' | 'decision' | 'realization' | 'transformation',
                        position: Math.max(0, Math.min(1, point.position)),
                        intensity: Math.max(0, Math.min(1, point.intensity)),
                        description: point.description
                    }));

                    // イベント発行
                    this.eventBus.publish('empathetic.points.generated', {
                        conceptName,
                        stage,
                        points: validatedPoints
                    });

                    return validatedPoints;
                }
            } catch (error) {
                logger.error(`Failed to parse empathetic points response`, {
                    error: error instanceof Error ? error.message : String(error)
                });
            }

            // エラー時はデフォルトの共感ポイントを返す
            return this.createDefaultEmpatheticPoints(stage);
        } catch (error) {
            logger.error(`Failed to generate empathetic points for ${conceptName}`, {
                error: error instanceof Error ? error.message : String(error),
                stage
            });

            // エラー時はデフォルトの共感ポイントを返す
            return this.createDefaultEmpatheticPoints(stage);
        }
    }

    /**
     * 章内容に基づいた感情分析を行う
     * 
     * @param chapterContent 章内容
     * @param genre ジャンル
     * @returns 感情分析結果
     */
    async analyzeChapterEmotion(
        chapterContent: string,
        genre: string = 'business'
    ): Promise<{
        overallTone: string;
        emotionalImpact: number;
        emotionalDimensions?: any;
    }> {
        try {
            logger.info(`Analyzing chapter emotion`);

            // AIを使って感情分析
            const truncatedContent = chapterContent.length > 5000
                ? chapterContent.substring(0, 5000) + '...(truncated)'
                : chapterContent;

            const prompt = `
あなたは物語の感情分析の専門家です。
以下の章内容を分析し、感情的特徴を抽出してください。

# 章内容
${truncatedContent}

# 分析指示
以下の情報を提供してください：
1. 全体のトーン
2. 感情的影響力 (1-10の数値)
3. 主要な感情次元の変化

JSON形式で出力してください：
{
  "overallTone": "全体のトーン",
  "emotionalImpact": 感情的影響力,
  "emotionalDimensions": {
    "hopeVsDespair": {"start": 値, "middle": 値, "end": 値},
    "comfortVsTension": {"start": 値, "middle": 値, "end": 値},
    "joyVsSadness": {"start": 値, "middle": 値, "end": 値}
  }
}
`;

            const response = await this.geminiClient.generateText(prompt, {
                temperature: 0.1,
                responseFormat: 'json'
            });

            try {
                // JSONレスポンスをパース
                const result = JsonParser.parseFromAIResponse(response, {
                    overallTone: "中立的",
                    emotionalImpact: 5,
                    emotionalDimensions: {}
                });
            
                const analysis = {
                    overallTone: result.overallTone || "中立的",
                    emotionalImpact: typeof result.emotionalImpact === 'number' ?
                        Math.min(10, Math.max(1, result.emotionalImpact)) : 5,
                    emotionalDimensions: result.emotionalDimensions
                };
            
                // イベント発行
                this.eventBus.publish('chapter.emotion.analyzed', {
                    analysis
                });
            
                return analysis;
            } catch (error) {
                logger.error(`Failed to parse emotion analysis response`, {
                    error: error instanceof Error ? error.message : String(error)
                });
            
                // デフォルト分析結果を返す
                return {
                    overallTone: "中立的",
                    emotionalImpact: 5
                };
            }
        } catch (error) {
            logger.error(`Failed to analyze chapter emotion`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // デフォルト分析結果を返す
            return {
                overallTone: "中立的",
                emotionalImpact: 5
            };
        }
    }

    /**
     * 感情と学習の統合計画を生成する
     * 
     * @param conceptName 概念名
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @returns 感情学習統合計画
     */
    async createIntegratedPlan(
        conceptName: string,
        stage: LearningStage,
        chapterNumber: number
    ): Promise<{
        emotionalArc: EmotionalArcDesign;
        catharticExperience: CatharticExperience | null;
        empatheticPoints: EmpatheticPoint[];
        syncRecommendations: string[];
    }> {
        try {
            logger.info(`Creating integrated emotion-learning plan for ${conceptName} at stage ${stage}`);

            // 1. 感情アークの設計
            const emotionalArc = await this.designEmotionalArc(conceptName, stage, chapterNumber);

            // 2. カタルシス体験の設計
            const catharticExperience = await this.designCatharticExperience(conceptName, stage, chapterNumber);

            // 3. デフォルトの共感ポイント生成
            const empatheticPoints = this.createDefaultEmpatheticPoints(stage);

            // 4. 同期推奨事項の生成
            const syncRecommendations = this.generateSyncRecommendations(stage);

            // 統合計画を返す
            return {
                emotionalArc,
                catharticExperience,
                empatheticPoints,
                syncRecommendations
            };
        } catch (error) {
            logger.error(`Failed to create integrated plan for ${conceptName}`, {
                error: error instanceof Error ? error.message : String(error),
                stage,
                chapterNumber
            });

            // エラー時はデフォルト計画を返す
            return {
                emotionalArc: this.createDefaultEmotionalArc(),
                catharticExperience: null,
                empatheticPoints: this.createDefaultEmpatheticPoints(stage),
                syncRecommendations: []
            };
        }
    }

    /**
   * セクションの感情アーク設計と同期する
   * @param sectionId セクションID
   * @param emotionalDesign 感情設計データ
   */
    async synchronizeWithSection(
        sectionId: string,
        emotionalDesign: any // 適切な型定義は全体の型システムに依存
    ): Promise<void> {
        try {
            logger.info(`Synchronizing emotional design for section ${sectionId}`);

            // 感情設計データをNarrativeMemoryに保存
            const narrativeMemory = memoryManager.getMidTermMemory();

            // セクション関連の感情設計を保存
            if (narrativeMemory.emotionalDynamicsManager &&
                typeof narrativeMemory.emotionalDynamicsManager.storeSectionEmotionalDesign === 'function') {
                await narrativeMemory.emotionalDynamicsManager.storeSectionEmotionalDesign(sectionId, emotionalDesign);
            } else {
                // フォールバック：直接ナラティブ状態を更新
                await narrativeMemory.updateNarrativeState({
                    id: `section-emotional-${sectionId}`,
                    chapterNumber: -1, // セクションレベルのメタデータ
                    title: `Section Emotional Design ${sectionId}`,
                    content: '',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    metadata: {
                        sectionId,
                        emotionalDesign,
                        type: 'section_emotional_design'
                    }
                });
            }

            // 感情学習の同期イベントを発行
            this.eventBus.publish('emotion.learning.synchronized', {
                sectionId,
                timestamp: new Date().toISOString(),
                emotionalDesignData: {
                    emotionalArc: emotionalDesign.emotionalArc,
                    catharticMoment: emotionalDesign.catharticMoment
                }
            });

            logger.info(`Successfully synchronized emotional design for section ${sectionId}`);
        } catch (error) {
            logger.error(`Failed to synchronize emotional design with section`, {
                error: error instanceof Error ? error.message : String(error),
                sectionId
            });
            throw error;
        }
    }

    // 以下、内部ヘルパーメソッド

    /**
     * 学習段階に応じた感情アークを作成
     */
    private createStageBasedEmotionalArc(stage: LearningStage): EmotionalArcDesign {
        switch (stage) {
            case LearningStage.MISCONCEPTION:
                return {
                    recommendedTone: "フラストレーションと混乱のバランス",
                    emotionalJourney: {
                        opening: [
                            { dimension: "自信", level: 7 },
                            { dimension: "期待", level: 6 }
                        ],
                        development: [
                            { dimension: "混乱", level: 7 },
                            { dimension: "フラストレーション", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "自己疑問", level: 6 },
                            { dimension: "不安", level: 5 }
                        ]
                    },
                    reason: "誤解段階では、初期の過剰な自信から問題発生によるフラストレーションへの推移を表現"
                };

            case LearningStage.EXPLORATION:
                return {
                    recommendedTone: "好奇心と発見のバランス",
                    emotionalJourney: {
                        opening: [
                            { dimension: "好奇心", level: 7 },
                            { dimension: "疑問", level: 6 }
                        ],
                        development: [
                            { dimension: "探索", level: 8 },
                            { dimension: "発見", level: 7 }
                        ],
                        conclusion: [
                            { dimension: "期待", level: 7 },
                            { dimension: "可能性", level: 8 }
                        ]
                    },
                    reason: "探索段階では、新たな可能性への好奇心と発見を表現し、次の段階への期待を構築"
                };

            case LearningStage.CONFLICT:
                return {
                    recommendedTone: "葛藤と決断の緊張感",
                    emotionalJourney: {
                        opening: [
                            { dimension: "葛藤", level: 7 },
                            { dimension: "混乱", level: 6 }
                        ],
                        development: [
                            { dimension: "内的対立", level: 8 },
                            { dimension: "緊張", level: 7 }
                        ],
                        conclusion: [
                            { dimension: "決断", level: 8 },
                            { dimension: "覚悟", level: 7 }
                        ]
                    },
                    reason: "葛藤段階では、相反する視点の対立から決断へと向かう緊張感のある感情の流れを表現"
                };

            case LearningStage.INSIGHT:
                return {
                    recommendedTone: "驚きと理解の感動",
                    emotionalJourney: {
                        opening: [
                            { dimension: "緊張", level: 7 },
                            { dimension: "集中", level: 8 }
                        ],
                        development: [
                            { dimension: "驚き", level: 9 },
                            { dimension: "興奮", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "解放感", level: 9 },
                            { dimension: "満足", level: 8 }
                        ]
                    },
                    reason: "気づき段階では、緊張から驚きの瞬間を経て、新たな理解がもたらす解放感と満足を表現"
                };

            case LearningStage.APPLICATION:
                return {
                    recommendedTone: "実践と手応えのバランス",
                    emotionalJourney: {
                        opening: [
                            { dimension: "自信", level: 7 },
                            { dimension: "意欲", level: 8 }
                        ],
                        development: [
                            { dimension: "集中", level: 8 },
                            { dimension: "奮闘", level: 7 }
                        ],
                        conclusion: [
                            { dimension: "達成感", level: 8 },
                            { dimension: "喜び", level: 7 }
                        ]
                    },
                    reason: "応用段階では、新たな理解を意識的に適用する自信から、実践を通じた達成感への変化を表現"
                };

            case LearningStage.INTEGRATION:
                return {
                    recommendedTone: "調和と自信のバランス",
                    emotionalJourney: {
                        opening: [
                            { dimension: "調和", level: 8 },
                            { dimension: "安定", level: 7 }
                        ],
                        development: [
                            { dimension: "自信", level: 9 },
                            { dimension: "創造性", level: 8 }
                        ],
                        conclusion: [
                            { dimension: "満足感", level: 9 },
                            { dimension: "充実", level: 8 }
                        ]
                    },
                    reason: "統合段階では、概念が自然な行動パターンとなり、安定と調和をもたらす状態を表現"
                };

            default:
                return this.createDefaultEmotionalArc();
        }
    }

    /**
     * デフォルトの感情アークを作成
     */
    private createDefaultEmotionalArc(): EmotionalArcDesign {
        return {
            recommendedTone: "バランスのとれた中立的なトーン",
            emotionalJourney: {
                opening: [
                    { dimension: "関心", level: 7 },
                    { dimension: "期待", level: 6 }
                ],
                development: [
                    { dimension: "集中", level: 7 },
                    { dimension: "探求", level: 6 }
                ],
                conclusion: [
                    { dimension: "理解", level: 7 },
                    { dimension: "満足", level: 6 }
                ]
            },
            reason: "学習のプロセスにおける基本的な感情の流れを表現"
        };
    }

    /**
     * 学習段階がカタルシス体験に適しているかを判断
     */
    private isCatharticAppropriateForStage(stage: LearningStage): boolean {
        // 主に気づき段階、応用段階、統合段階でカタルシスが適切
        return [
            LearningStage.INSIGHT,
            LearningStage.APPLICATION,
            LearningStage.INTEGRATION
        ].includes(stage);
    }

    /**
     * 学習段階に応じたカタルシス体験を作成
     */
    private createStageBasedCatharticExperience(
        conceptName: string,
        stage: LearningStage
    ): CatharticExperience {
        switch (stage) {
            case LearningStage.INSIGHT:
                return {
                    type: 'intellectual',
                    intensity: 0.9,
                    trigger: `${conceptName}の核心に触れる瞬間`,
                    buildup: [
                        '概念の限界に直面して混乱する',
                        '新たな視点の可能性を垣間見る',
                        '概念の一部が理解でき始める',
                        'ピースが徐々に繋がり始める'
                    ],
                    peakMoment: `突如として、${conceptName}の本質が明確に見え、すべてが繋がる瞬間の感動。これまでの混乱が一瞬で晴れ渡り、新たな理解の景色が広がる。`,
                    aftermath: `${conceptName}に対する理解が一変し、新たな視点で物事を見られるようになる。これまで難しかった問題も、新しい理解の光の中では解決策が見えてくる。`,
                    relatedLearningStage: stage,
                    relatedConcept: conceptName
                };

            case LearningStage.APPLICATION:
                return {
                    type: 'emotional',
                    intensity: 0.7,
                    trigger: `${conceptName}を実践する中での成功体験`,
                    buildup: [
                        '新しく得た理解を試してみる',
                        '初めは不安や戸惑いがある',
                        '徐々に手応えを感じ始める',
                        '実践によって理解が深まっていく'
                    ],
                    peakMoment: `${conceptName}を実践した結果、明確な成果が得られる瞬間。理論と実践が見事に結びつき、自信と喜びが広がる。`,
                    aftermath: `${conceptName}の適用に自信が持て、様々な状況での応用が自然にできるようになる。知識が実用的なスキルへと変化する。`,
                    relatedLearningStage: stage,
                    relatedConcept: conceptName
                };

            case LearningStage.INTEGRATION:
                return {
                    type: 'transformative',
                    intensity: 0.8,
                    trigger: `${conceptName}が自然な思考パターンとなった瞬間の認識`,
                    buildup: [
                        '概念の応用が徐々に自然になっていく',
                        '意識的な適用から無意識的な活用へ移行し始める',
                        '概念を通じて他者を導く機会が増える',
                        '概念が自己の一部として定着していく感覚'
                    ],
                    peakMoment: `ふと気づくと、${conceptName}が自分の思考や行動に自然に組み込まれており、以前の自分との違いを明確に認識する瞬間。深い満足感と成長の実感が広がる。`,
                    aftermath: `${conceptName}が自分のアイデンティティの一部となり、他者にも教えたり共有したりできるようになる。概念の本質をさらに深く理解し、創造的に発展させられるようになる。`,
                    relatedLearningStage: stage,
                    relatedConcept: conceptName
                };

            default:
                return {
                    type: 'intellectual',
                    intensity: 0.7,
                    trigger: `${conceptName}に関する重要な発見`,
                    buildup: [
                        '概念への関心が高まる',
                        '問いが生まれ、探求が始まる',
                        '新たな可能性が見え始める',
                        '理解が徐々に深まっていく'
                    ],
                    peakMoment: `${conceptName}に関する重要な洞察が得られる瞬間。理解が一気に深まり、新たな視点が開ける。`,
                    aftermath: `${conceptName}に対する理解が変化し、新たな行動や思考パターンが生まれる。成長の実感とともに次の段階への準備が整う。`,
                    relatedLearningStage: stage,
                    relatedConcept: conceptName
                };
        }
    }

    /**
     * 感情学習同期分析用のプロンプトを作成
     */
    private createSynchronizationPrompt(
        content: string,
        conceptName: string,
        stage: LearningStage
    ): string {
        return `
あなたは感情と学習の同期分析専門家です。
以下の章内容において、感情的瞬間と学習ポイントの同期度を分析してください。

# 章内容
${content}

# 概念情報
・名前: ${conceptName}
・学習段階: ${this.formatLearningStage(stage)}

# 分析指示
以下の指標について、0から1の範囲で客観的に評価してください:

1. 感情ピークと学習ポイントの同期度 (peakSynchronization): 感情の高まりと認知的洞察の瞬間がどの程度一致しているか
2. 感情変化と理解進展の一致度 (progressionAlignment): 感情の変化曲線と概念理解の深まりがどの程度並行しているか
3. 感情的共鳴強度 (emotionalResonance): 読者がどの程度キャラクターの感情体験に共鳴できるか
4. テーマと感情の統合度 (themeEmotionIntegration): 概念のテーマと感情表現がどの程度統合されているか
5. カタルシス瞬間の効果 (catharticMomentEffect): 重要な気づきや転換点での感情的なカタルシスの効果

最後に、測定の信頼性を0から1で評価してください。

JSON形式で出力してください：
{
  "peakSynchronization": 値,
  "progressionAlignment": 値,
  "emotionalResonance": 値,
  "themeEmotionIntegration": 値,
  "catharticMomentEffect": 値,
  "measurementConfidence": 値
}
`;
    }

    /**
     * 共感ポイント生成用のプロンプトを作成
     */
    private createEmpatheticPointsPrompt(
        content: string,
        conceptName: string,
        stage: LearningStage
    ): string {
        return `
あなたは物語の共感ポイント分析の専門家です。
以下の章内容から、読者が強く共感できるポイントを抽出してください。

# 章内容
${content}

# 概念情報
・名前: ${conceptName}
・学習段階: ${this.formatLearningStage(stage)}

# 分析指示
読者が共感しやすい瞬間を5つ抽出し、以下の情報を提供してください：
1. タイプ: character（キャラクターの内面）、situation（状況）、decision（決断）、realization（気づき）、transformation（変容）のいずれか
2. 位置: 章内での相対位置（0-1の数値、冒頭が0、結末が1）
3. 強度: 共感の強さ（0-1の数値）
4. 説明: 共感ポイントの簡潔な説明

JSON形式で出力してください：
{
  "points": [
    {
      "type": "タイプ",
      "position": 位置,
      "intensity": 強度,
      "description": "説明"
    },
    ...
  ]
}
`;
    }

    /**
     * デフォルトの感情学習同期指標を作成
     */
    private createDefaultSyncMetrics(): EmotionLearningSyncMetrics {
        return {
            peakSynchronization: 0.5,     // 中程度の同期度
            progressionAlignment: 0.5,    // 中程度の一致度
            emotionalResonance: 0.5,      // 中程度の共鳴強度
            themeEmotionIntegration: 0.5, // 中程度の統合度
            catharticMomentEffect: 0.4,   // やや低めのカタルシス効果
            measurementConfidence: 0.5    // 中程度の信頼性
        };
    }

    /**
     * 同期指標を検証して有効な範囲に収める
     */
    private validateSyncMetrics(metrics: any): EmotionLearningSyncMetrics {
        const validateValue = (value: any, defaultValue: number): number => {
            if (typeof value !== 'number' || isNaN(value)) {
                return defaultValue;
            }
            return Math.max(0, Math.min(1, value));
        };

        return {
            peakSynchronization: validateValue(metrics.peakSynchronization, 0.5),
            progressionAlignment: validateValue(metrics.progressionAlignment, 0.5),
            emotionalResonance: validateValue(metrics.emotionalResonance, 0.5),
            themeEmotionIntegration: validateValue(metrics.themeEmotionIntegration, 0.5),
            catharticMomentEffect: validateValue(metrics.catharticMomentEffect, 0.4),
            measurementConfidence: validateValue(metrics.measurementConfidence, 0.5)
        };
    }

    /**
     * デフォルトの共感ポイントを作成
     */
    private createDefaultEmpatheticPoints(stage: LearningStage): EmpatheticPoint[] {
        switch (stage) {
            case LearningStage.MISCONCEPTION:
                return [
                    {
                        type: 'character',
                        position: 0.2,
                        intensity: 0.7,
                        description: '自信過剰な判断が裏目に出た瞬間の当惑'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.6,
                        description: '誤った前提で行動した結果の失敗'
                    },
                    {
                        type: 'realization',
                        position: 0.8,
                        intensity: 0.5,
                        description: '何かが根本的に間違っているという気づきの芽生え'
                    }
                ];

            case LearningStage.EXPLORATION:
                return [
                    {
                        type: 'character',
                        position: 0.3,
                        intensity: 0.6,
                        description: '新たな視点に出会ったときの好奇心'
                    },
                    {
                        type: 'decision',
                        position: 0.5,
                        intensity: 0.7,
                        description: '従来の考え方を疑ってみる決断'
                    },
                    {
                        type: 'situation',
                        position: 0.7,
                        intensity: 0.6,
                        description: '異なる意見に耳を傾ける場面'
                    }
                ];

            case LearningStage.CONFLICT:
                return [
                    {
                        type: 'character',
                        position: 0.2,
                        intensity: 0.8,
                        description: '相反する価値観の間で揺れ動く内的葛藤'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.7,
                        description: '選択を迫られる重要な局面'
                    },
                    {
                        type: 'decision',
                        position: 0.8,
                        intensity: 0.9,
                        description: '葛藤を経て下す重要な決断'
                    }
                ];

            case LearningStage.INSIGHT:
                return [
                    {
                        type: 'character',
                        position: 0.4,
                        intensity: 0.7,
                        description: '理解の断片が繋がり始める高揚感'
                    },
                    {
                        type: 'realization',
                        position: 0.6,
                        intensity: 0.9,
                        description: '核心的な気づきが訪れる瞬間の衝撃'
                    },
                    {
                        type: 'transformation',
                        position: 0.8,
                        intensity: 0.8,
                        description: '新たな理解に基づく視点の変化'
                    }
                ];

            case LearningStage.APPLICATION:
                return [
                    {
                        type: 'character',
                        position: 0.3,
                        intensity: 0.6,
                        description: '新たな理解を試すときの不安と期待'
                    },
                    {
                        type: 'situation',
                        position: 0.5,
                        intensity: 0.7,
                        description: '実践を通じて手応えを感じる瞬間'
                    },
                    {
                        type: 'realization',
                        position: 0.8,
                        intensity: 0.8,
                        description: '理論と実践が結びついたときの充実感'
                    }
                ];

            case LearningStage.INTEGRATION:
                return [
                    {
                        type: 'character',
                        position: 0.3,
                        intensity: 0.7,
                        description: '概念が自然と身についていることに気づく瞬間'
                    },
                    {
                        type: 'transformation',
                        position: 0.6,
                        intensity: 0.8,
                        description: '以前の自分と現在の自分の違いを実感する深い変容'
                    },
                    {
                        type: 'situation',
                        position: 0.8,
                        intensity: 0.7,
                        description: '他者に自然と教えている自分を発見する場面'
                    }
                ];

            default:
                return [
                    {
                        type: 'character',
                        position: 0.3,
                        intensity: 0.6,
                        description: 'キャラクターの内面的な成長の瞬間'
                    },
                    {
                        type: 'realization',
                        position: 0.6,
                        intensity: 0.7,
                        description: '重要な気づきが得られる場面'
                    },
                    {
                        type: 'situation',
                        position: 0.8,
                        intensity: 0.6,
                        description: '理解が深まる状況'
                    }
                ];
        }
    }

    /**
     * 学習段階に基づく同期推奨事項を生成
     */
    private generateSyncRecommendations(stage: LearningStage): string[] {
        switch (stage) {
            case LearningStage.MISCONCEPTION:
                return [
                    '誤解の限界に直面する場面での感情的フラストレーションを強調する',
                    '表面的な理解に基づく自信と、問題発生時の感情的動揺を連動させる'
                ];

            case LearningStage.EXPLORATION:
                return [
                    '新たな視点との出会いによる好奇心と感情的高揚を同期させる',
                    '探索過程での発見と期待感の感情を段階的に強化する'
                ];

            case LearningStage.CONFLICT:
                return [
                    '内的葛藤の感情的側面を理解の深化と連動させる',
                    '価値観の対立から生じる緊張感と、決断に向かう過程の感情変化を同期させる'
                ];

            case LearningStage.INSIGHT:
                return [
                    '気づきの瞬間と感情的カタルシスを完全に同期させる',
                    '理解の急激な広がりとともに、解放感や高揚感が訪れるよう設計する'
                ];

            case LearningStage.APPLICATION:
                return [
                    '実践過程での集中感や緊張感を、スキル向上と連動させる',
                    '成功体験がもたらす達成感と自信の感情的効果を強調する'
                ];

            case LearningStage.INTEGRATION:
                return [
                    '概念の自然な体現がもたらす調和感や安定感を表現する',
                    '以前の自分との対比を通じた成長の満足感と、創造的応用への意欲を連動させる'
                ];

            default:
                return [
                    '感情の変化と学習の進展を並行して描写する',
                    '重要な理解の瞬間に感情的な高まりを設計する'
                ];
        }
    }

    /**
     * 学習段階を日本語表記で取得
     */
    private formatLearningStage(stage: LearningStage): string {
        const japaneseStages: { [key in LearningStage]?: string } = {
            [LearningStage.MISCONCEPTION]: '誤解段階',
            [LearningStage.EXPLORATION]: '探索段階',
            [LearningStage.CONFLICT]: '葛藤段階',
            [LearningStage.INSIGHT]: '気づき段階',
            [LearningStage.APPLICATION]: '応用段階',
            [LearningStage.INTEGRATION]: '統合段階'
        };

        return japaneseStages[stage] || stage;
    }
}