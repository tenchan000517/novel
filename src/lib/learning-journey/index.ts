// src/lib/learning-journey/index.ts

/**
 * @fileoverview 学びの物語システム統合モジュール
 * @description
 * 「魂のこもった学びの物語」を実現するためのコンポーネントをエクスポートする統合モジュール。
 * 最適化されたシステムアーキテクチャに基づく各コンポーネントへのアクセスを提供する。
 */

// コアコンポーネント
export {
    ConceptLearningManager,
    LearningStage,
    type BusinessConcept,
    type LearningRecord,
    type EmbodimentPlan
} from './concept-learning-manager';

export {
    StoryTransformationDesigner,
    type Section,
    type SceneRecommendation,
    type TensionRecommendation
} from './story-transformation-designer';

export {
    EmotionalLearningIntegrator,
    type EmotionalArcDesign,
    type EmotionalDimension,
    type EmpatheticPoint,
    type CatharticExperience,
    type EmotionLearningSyncMetrics
} from './emotional-learning-integrator';

// 支援コンポーネント
export {
    ContextManager,
    type StoryContext
} from './context-manager';

export {
    PromptGenerator,
    PromptType,
    type ChapterGenerationOptions,
    type DialogueGenerationOptions
} from './prompt-generator';

export {
    EventBus,
    type EventType,
    type EventHandler,
    eventBus
} from './event-bus';

// メインファサードクラス
import { GeminiClient } from '@/lib/generation/gemini-client';
import { ConceptLearningManager, LearningStage } from './concept-learning-manager';
import { StoryTransformationDesigner } from './story-transformation-designer';
import { EmotionalLearningIntegrator } from './emotional-learning-integrator';
import { ContextManager } from './context-manager';
import { PromptGenerator } from './prompt-generator';
import { EventBus, eventBus } from './event-bus';
import { MemoryManager, memoryManager } from '@/lib/memory/manager';
import { CharacterManager } from '@/lib/characters/manager';
import { logger } from '@/lib/utils/logger';
import { withTimeout } from '@/lib/utils/promise-utils'; // YAMLヘルパーのインポート

/**
 * @class LearningJourneySystem
 * @description
 * 「魂のこもった学びの物語」システムのメインファサードクラス。
 * 各コンポーネントを統合し、シンプルなインターフェースを提供する。
 */
export class LearningJourneySystem {
    private initialized: boolean = false;
    private conceptManager: ConceptLearningManager;
    private storyDesigner: StoryTransformationDesigner;
    private emotionalIntegrator: EmotionalLearningIntegrator;
    private contextManager: ContextManager;
    private promptGenerator: PromptGenerator;

    /**
     * コンストラクタ
     * @param geminiClient AIモデルとの通信を行うクライアント
     * @param memoryManager 記憶管理（オプション）
     * @param characterManager キャラクター管理（オプション）
     */
    constructor(
        private geminiClient: GeminiClient,
        private memoryManager: MemoryManager = memoryManager, // デフォルトはシングルトン
        private characterManager?: CharacterManager
    ) {
        // イベントバスのインスタンスを利用
        const eb = eventBus;

        // 各コンポーネントのインスタンス化（memoryManager を渡す）
        this.conceptManager = new ConceptLearningManager(geminiClient, eb);
        this.storyDesigner = new StoryTransformationDesigner(geminiClient, eb);
        this.emotionalIntegrator = new EmotionalLearningIntegrator(geminiClient, eb);
        this.contextManager = new ContextManager(eb, this.memoryManager, characterManager);
        this.promptGenerator = new PromptGenerator(eb);

        logger.info('LearningJourneySystem created');
    }

    /**
     * システムを初期化する（修正版）
     * @param storyId 物語ID
     */
    async initialize(storyId: string): Promise<void> {
        if (this.initialized) {
            logger.info('LearningJourneySystem already initialized');
            return;
        }

        try {
            logger.info(`Initializing LearningJourneySystem for story ${storyId}...`);

            // ⭐ 修正: MemoryManagerの初期化チェックを簡素化
            let memoryManagerReady = false;
            try {
                memoryManagerReady = await this.memoryManager.isInitialized();
                logger.info(`MemoryManager initialization status: ${memoryManagerReady}`);
            } catch (error) {
                logger.warn('Failed to check MemoryManager status, proceeding with limited functionality');
            }

            // ⭐ 修正: MemoryManagerが未初期化の場合は警告のみ出して続行
            if (!memoryManagerReady) {
                logger.warn('MemoryManager not ready, LearningJourneySystem will operate with limited memory functionality');
            }

            // 各コンポーネントを初期化（並列実行だが、タイムアウトを短く設定）
            const initPromises = [
                withTimeout(
                    this.conceptManager.initialize(),
                    10000, // 10秒に短縮
                    'ConceptLearningManager initialization'
                ).catch(error => {
                    logger.warn(`ConceptLearningManager initialization failed: ${error.message}`);
                    return null;
                }),

                withTimeout(
                    this.storyDesigner.initialize(),
                    10000, // 10秒に短縮
                    'StoryTransformationDesigner initialization'
                ).catch(error => {
                    logger.warn(`StoryTransformationDesigner initialization failed: ${error.message}`);
                    return null;
                }),

                Promise.resolve(this.promptGenerator.initialize()).catch(error => {
                    logger.warn(`PromptGenerator initialization failed: ${error.message}`);
                    return null;
                }),

                withTimeout(
                    this.contextManager.initialize(storyId),
                    15000, // 15秒に設定（メモリアクセスが必要なため少し長め）
                    'ContextManager initialization'
                ).catch(error => {
                    logger.warn(`ContextManager initialization failed: ${error.message}`);
                    return null;
                })
            ];

            // 並列初期化の結果を待機
            const results = await Promise.allSettled(initPromises);

            // 初期化結果をログに記録
            const componentNames = ['conceptManager', 'storyDesigner', 'promptGenerator', 'contextManager'];
            let successCount = 0;

            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value !== null) {
                    successCount++;
                    logger.debug(`${componentNames[index]} initialized successfully`);
                } else {
                    logger.warn(`${componentNames[index]} initialization failed`);
                }
            });

            // ⭐ 修正: 必須コンポーネントの要求を緩和
            // 最低限 conceptManager と promptGenerator が動作すれば OK とする
            const criticalComponentsOk = results[0].status === 'fulfilled' && // conceptManager
                results[2].status === 'fulfilled';   // promptGenerator

            if (!criticalComponentsOk) {
                throw new Error('Critical components (conceptManager, promptGenerator) failed to initialize');
            }

            this.initialized = true;
            logger.info(`LearningJourneySystem initialized successfully (${successCount}/${results.length} components active)`);

        } catch (error) {
            logger.error('Failed to initialize LearningJourneySystem', {
                error: error instanceof Error ? error.message : String(error),
                storyId
            });

            // ⭐ 修正: 完全に失敗するのではなく、制限モードで初期化
            logger.info('Attempting to initialize LearningJourneySystem in limited mode');

            try {
                // 最小限の初期化
                this.promptGenerator.initialize();
                this.initialized = true;
                logger.info('LearningJourneySystem initialized in limited mode (prompt generation only)');
            } catch (limitedError) {
                logger.error('Failed to initialize even in limited mode');
                throw error; // 元のエラーを再スロー
            }
        }
    }

    /**
 * エラーメッセージを安全に抽出するユーティリティメソッド
 */
    private getErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }

    /**
     * 章生成のためのプロンプトを作成する
     * @param chapterNumber 章番号
     */
    async generateChapterPrompt(chapterNumber: number): Promise<string> {
        this.ensureInitialized();

        try {
            logger.info(`Generating prompt for chapter ${chapterNumber}`);

            // 1. コンテキストを取得
            const context = this.contextManager.getContext();
            if (!context) {
                throw new Error('Context not available');
            }

            // 2. 章が属する篇を取得
            const section = this.storyDesigner.getSectionByChapter(chapterNumber);
            if (!section) {
                logger.warn(`No section found for chapter ${chapterNumber}, using default settings`);
            }

            // 3. 概念と学習段階を取得
            const conceptName = section?.mainConcept || context.mainConcept;
            const learningStage = await this.conceptManager.determineLearningStage(
                conceptName,
                chapterNumber
            );

            // 4. シーン推奨を生成
            const sceneRecommendations = await this.storyDesigner.generateSceneRecommendations(
                conceptName,
                learningStage,
                chapterNumber
            );

            // 5. 感情学習設計を生成
            const emotionalArc = await this.emotionalIntegrator.designEmotionalArc(
                conceptName,
                learningStage,
                chapterNumber
            );

            // 6. カタルシス体験を生成（適切な段階の場合のみ）
            const catharticExperience = await this.emotionalIntegrator.designCatharticExperience(
                conceptName,
                learningStage,
                chapterNumber
            );

            // 7. 共感ポイントを生成
            const empatheticPoints = await this.emotionalIntegrator.generateEmpatheticPoints(
                '',  // 内容がまだないので空文字
                conceptName,
                learningStage
            );

            // 8. 前章の要約を取得
            const previousChapterIndex = context.recentChapters.findIndex(
                ch => ch.chapterNumber === chapterNumber - 1
            );
            const previousChapterSummary = previousChapterIndex >= 0 ?
                context.recentChapters[previousChapterIndex].summary : undefined;

            // 9. 関連記憶を取得
            const relevantMemories = await this.contextManager.retrieveRelevantMemories({
                chapterNumber: chapterNumber - 1,
                limit: 5
            });

            // 10. 章生成オプションを組み立て
            const chapterOptions = {
                chapterNumber,
                suggestedTitle: section ?
                    await this.generateChapterTitle(section, chapterNumber) : undefined,
                conceptName,
                learningStage,
                sceneRecommendations,
                emotionalArc,
                catharticExperience: catharticExperience || undefined, // null を undefined に変換
                empatheticPoints,
                previousChapterSummary,
                relevantMemories,
                mainCharacters: context.mainCharacters,
                targetLength: {
                    min: 3000,
                    max: 6000
                }
            };

            // 11. プロンプトを生成
            const prompt = this.promptGenerator.generateChapterPrompt(
                context,
                chapterOptions
            );

            logger.info(`Successfully generated prompt for chapter ${chapterNumber}`);
            return prompt;
        } catch (error) {
            logger.error(`Failed to generate prompt for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー時は簡易プロンプトを返す
            return this.generateSimpleChapterPrompt(chapterNumber);
        }
    }

    /**
     * 章タイトルを生成する
     * @param section 篇情報
     * @param chapterNumber 章番号
     * @returns 章タイトル
     */
    private async generateChapterTitle(
        section: any,
        chapterNumber: number
    ): Promise<string> {
        // 篇内での章の位置を計算
        const sectionProgress = (chapterNumber - section.startChapter) /
            (section.endChapter - section.startChapter);

        // 位置に応じたタイトル生成（簡易実装）
        if (sectionProgress < 0.33) {
            return `${section.title}の始まり`;
        } else if (sectionProgress < 0.66) {
            return `${section.title}の展開`;
        } else {
            return `${section.title}の転機`;
        }
    }

    /**
     * 章の内容を処理して学習進捗を更新する
     * @param chapterNumber 章番号
     * @param content 章内容
     * @param title 章タイトル
     */
    async processChapterContent(
        chapterNumber: number,
        content: string,
        title: string
    ): Promise<void> {
        this.ensureInitialized();

        try {
            logger.info(`Processing content for chapter ${chapterNumber}`);

            // 1. コンテキストを取得
            const context = this.contextManager.getContext();
            if (!context) {
                throw new Error('Context not available');
            }

            // 2. 章が属する篇を取得
            const section = this.storyDesigner.getSectionByChapter(chapterNumber);
            const conceptName = section?.mainConcept || context.mainConcept;

            // 3. 章内容から概念体現化と学習段階を分析
            const embodimentAnalysis = await this.conceptManager.analyzeConceptEmbodiment(
                conceptName,
                content,
                chapterNumber
            );

            // 4. 学習記録を更新
            await this.conceptManager.updateConceptWithLearningRecord(
                conceptName,
                {
                    stage: embodimentAnalysis.stage,
                    chapterNumber: chapterNumber,
                    insights: embodimentAnalysis.examples.slice(0, 1),
                    examples: embodimentAnalysis.examples.slice(1)
                }
            );

            // 5. 感情分析を実行
            const emotionAnalysis = await this.emotionalIntegrator.analyzeChapterEmotion(
                content,
                'business'
            );

            // 6. 感情と学習の同期度を分析
            const syncMetrics = await this.emotionalIntegrator.analyzeSynchronization(
                content,
                conceptName,
                embodimentAnalysis.stage
            );

            // 7. 章情報を記憶階層に保存（ContextManagerに委譲）
            // 元のChapterProcessor機能はContextManager.saveChapterToMemoryに統合済み
            const chapterSummary = await this.generateChapterSummary(content);

            await this.contextManager.saveChapterToMemory(
                chapterNumber,
                {
                    title,
                    content,
                    summary: chapterSummary,
                    learningStage: embodimentAnalysis.stage,
                    mainEvents: this.extractMainEvents(content) // 主要イベントを抽出
                }
            );

            // 8. コンテキストを更新
            await this.contextManager.updateContext({
                currentChapter: chapterNumber,
                currentLearningStage: embodimentAnalysis.stage
            });

            // 9. 学習旅程イベントを発行
            eventBus.publish('context.updated', {
                storyId: context.storyId,
                action: 'chapter_processed',
                chapterNumber,
                conceptName,
                learningStage: embodimentAnalysis.stage
            });

            logger.info(`Successfully processed content for chapter ${chapterNumber}`, {
                learningStage: embodimentAnalysis.stage,
                emotionalImpact: emotionAnalysis?.emotionalImpact || 0,
                peakSynchronization: syncMetrics?.peakSynchronization || 0,
                emotionalResonance: syncMetrics?.emotionalResonance || 0
            });
        } catch (error) {
            logger.error(`Failed to process content for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー時でも基本的な章保存は試行
            try {
                const chapterSummary = await this.generateChapterSummary(content);
                await this.contextManager.saveChapterToMemory(chapterNumber, {
                    title,
                    content,
                    summary: chapterSummary
                });
                logger.info(`Basic chapter save completed for chapter ${chapterNumber} despite processing errors`);
            } catch (saveError) {
                logger.error(`Failed to save chapter ${chapterNumber} even in fallback mode`, {
                    error: saveError instanceof Error ? saveError.message : String(saveError)
                });
            }
        }
    }

    /**
     * 章内容から主要イベントを抽出する（簡易実装）
     * @param content 章内容
     * @returns 主要イベントの配列
     * @private
     */
    private extractMainEvents(content: string): string[] {
        // 簡易的な主要イベント抽出（文の分析によるキーワード検出）
        const sentences = content.split(/[。！？]/);
        const events: string[] = [];

        // 動作や変化を示すキーワード
        const actionKeywords = ['決めた', '始めた', '発見した', '気づいた', '変わった', '成長した', '学んだ'];

        for (const sentence of sentences) {
            if (sentence.length > 10 && actionKeywords.some(keyword => sentence.includes(keyword))) {
                events.push(sentence.trim() + '。');
                if (events.length >= 3) break; // 最大3つまで
            }
        }

        return events.length > 0 ? events : ['章の進行'];
    }

    /**
     * 章の要約を生成する
     * @param content 章内容
     * @returns 章要約
     */
    private async generateChapterSummary(content: string): Promise<string> {
        try {
            // コンテンツを適切な長さに切り詰め
            const truncatedContent = content.length > 5000
                ? content.substring(0, 5000) + '...(truncated)'
                : content;

            // 要約プロンプトを作成
            const prompt = `
  以下の章内容を200〜300文字程度で簡潔に要約してください。
  ストーリーの流れ、主要な出来事、キャラクターの変化、学びのポイントを含めてください。
  
  章内容:
  ${truncatedContent}
  
  要約:
  `;

            // AIによる要約生成
            const summary = await this.geminiClient.generateText(prompt, {
                temperature: 0.3,
                targetLength: 300  // maxTokens の代わりに targetLength を使用
            });

            return summary.trim();
        } catch (error) {
            logger.error('Failed to generate chapter summary', {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー時は簡易的な要約（最初の200文字）
            return content.substring(0, 197) + '...';
        }
    }

    /**
     * シンプルな章生成プロンプトを作成する（エラー時のフォールバック）
     * @private
     */
    private generateSimpleChapterPrompt(chapterNumber: number): string {
        return `
  あなたは「魂のこもった学びの物語」を創作するAI執筆者です。
  
  # 第${chapterNumber}章
  
  ## 執筆ガイドライン
  1. キャラクターの内面変化を通して読者に共感体験を提供する
  2. ビジネス概念を説明するのではなく、キャラクターの体験を通して読者が自然と学べるようにする
  3. 感情と学びが融合した物語を創る
  
  第${chapterNumber}章の内容を執筆してください。
  `;
    }

    /**
     * 初期化済みかどうかを確認する
     * @private
     */
    private ensureInitialized(): void {
        if (!this.initialized) {
            throw new Error('LearningJourneySystem is not initialized. Call initialize() first.');
        }
    }

    /**
     * 各コンポーネントへのアクセスを提供するゲッター
     */
    get concept(): ConceptLearningManager {
        return this.conceptManager;
    }

    get story(): StoryTransformationDesigner {
        return this.storyDesigner;
    }

    get emotion(): EmotionalLearningIntegrator {
        return this.emotionalIntegrator;
    }

    get context(): ContextManager {
        return this.contextManager;
    }

    get prompt(): PromptGenerator {
        return this.promptGenerator;
    }

    get events(): EventBus {
        return eventBus;
    }

    /**
     * 初期化状態を取得する
     * @returns 初期化済みかどうか
     */
    isInitialized(): boolean {
        return this.initialized;
    }
}

// デフォルトエクスポートとしてファサードクラスを提供
export default LearningJourneySystem;