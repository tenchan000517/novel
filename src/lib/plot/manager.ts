// src/lib/plot/manager-optimized.ts
// ============================================================================
// コアシステム（記憶・キャラクター・伏線管理）
// ============================================================================
import { memoryManager } from '@/lib/memory/manager';
import { characterManager } from '@/lib/characters/manager';
import { foreshadowingManager } from '@/lib/foreshadowing/manager';
import { parameterManager } from '@/lib/parameters';

// ============================================================================
// 外部ライブラリ・ユーティリティ
// ============================================================================
import { GeminiClient } from '@/lib/generation/gemini-client';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { storageProvider } from '@/lib/storage';
import { parseYaml } from '@/lib/utils/yaml-helper';
import { withTimeout } from '@/lib/utils/promise-utils';

// ============================================================================
// 物語記憶システム専用型（修正）
// ============================================================================
import { NarrativeStateInfo } from '@/lib/memory/narrative/types';

// ============================================================================
// プロット管理システム内部型
// ============================================================================
import { PlotStorage } from './storage';
import { PlotChecker } from './checker';
import { PlotContextBuilder } from './context-builder';
import {
    PlotMode,
    ConcretePlotPoint,
    AbstractPlotGuideline,
    MediumPlot,
    WorldSettings,
    ThemeSettings,
    FormattedWorldAndTheme
} from './types';
import { WorldSettingsManager } from './world-settings-manager';
import { StoryPhaseManager } from './phase-manager';
import { StoryGenerationBridge } from './story-generation-bridge';
import { ChapterDirectives, PromptElements } from './bridge-types';
import {
    SectionPlot,
    getSectionPlotManagerInstance,
    SectionPlotParams
} from './section';

// 学習旅路システムクラスのインポート
import LearningJourneySystem from '@/lib/learning-journey';
import { LearningStage } from '@/lib/learning-journey/concept-learning-manager';

/**
 * @class PlotManager
 * @description
 * プロット管理システムを提供するクラス。
 * 抽象プロットと具体プロットの管理、整合性確認、コンテキスト構築を担当します。
 * 物語生成ブリッジによる情報の最適化と統合も提供します。
 * 
 * @role
 * - 抽象/具体プロットの提供と整合性確保
 * - 現在の物語状態に基づいた適切なプロットコンテキスト構築
 * - プロット要素の整合性チェック
 * - 文学的比較分析の提供
 * - テーマ共鳴分析と深化提案
 * - シーン構造最適化
 * - 物語生成ブリッジを通じた次章生成のための最適な情報提供
 */
export class PlotManager {
    private plotStorage: PlotStorage;
    private plotChecker: PlotChecker;
    private plotContextBuilder: PlotContextBuilder;
    private geminiClient: GeminiClient;
    private initialized: boolean = false;
    private initializationPromise: Promise<void> | null = null;
    private worldSettingsManager: WorldSettingsManager;

    // 品質向上計画による拡張コンポーネント
    // private literaryComparisonSystem: LiteraryComparisonSystem;
    // private themeResonanceAnalyzer: ThemeResonanceAnalyzer;
    // private sceneStructureOptimizer: SceneStructureOptimizer;
    private phaseManager: StoryPhaseManager;

    // 「魂のこもった学びの物語」システム
    private learningJourneySystem: LearningJourneySystem | null = null;

    // 物語生成ブリッジ（新規追加）
    private storyGenerationBridge: StoryGenerationBridge;

    /**
     * プロットマネージャーのコンストラクタ
     */
    constructor() {
        this.plotStorage = new PlotStorage();
        this.plotChecker = new PlotChecker();
        this.plotContextBuilder = new PlotContextBuilder();
        this.geminiClient = new GeminiClient();
        this.worldSettingsManager = new WorldSettingsManager();

        this.phaseManager = new StoryPhaseManager();

        // 物語生成ブリッジのインスタンス化（新規追加）
        this.storyGenerationBridge = new StoryGenerationBridge();

        // 初期化を開始
        this.initializationPromise = this.initialize();
    }

    /**
     * プロットデータの初期化
     */
    private async initialize(): Promise<void> {
        try {
            logger.info('プロットマネージャーの初期化を開始');

            // 1. プロットストレージの初期化（既存のまま）
            await withTimeout(
                this.plotStorage.initialize(),
                15000,
                'プロットストレージの初期化'
            ).catch(error => {
                logger.error(`プロットストレージの初期化に失敗: ${error.message}`);
                throw error;
            });

            logger.info('プロットストレージの初期化完了');

            // 2. 🔧 修正: WorldSettingsManagerの初期化とフォールバック処理
            let worldSettingsInitialized = false;
            try {
                await withTimeout(
                    this.worldSettingsManager.initialize(),
                    15000,
                    '世界設定マネージャーの初期化'
                );

                // 初期化成功後、実際に設定が読み込まれているか確認
                const hasValidSettings = await this.worldSettingsManager.hasValidWorldSettings();
                if (hasValidSettings) {
                    worldSettingsInitialized = true;
                    logger.info('世界設定マネージャーの初期化完了（設定ファイル読み込み成功）');
                } else {
                    logger.warn('世界設定マネージャーは初期化されましたが、設定ファイルが読み込まれていません');
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logger.warn(`世界設定マネージャーの初期化に失敗: ${errorMessage}`);
            }

            // 🔧 追加: フォールバック処理
            if (!worldSettingsInitialized) {
                logger.info('世界設定のフォールバック処理を実行します');
                await this.setupFallbackWorldSettings();
            }

            // 3. 篇マネージャーの初期化（既存のまま）
            const sectionPlotManager = getSectionPlotManagerInstance();
            await withTimeout(
                sectionPlotManager.initialize(),
                15000,
                '篇マネージャーの初期化'
            ).catch(error => {
                logger.warn(`篇マネージャーの初期化に失敗しましたが、処理を継続します: ${error.message}`);
            });

            logger.info('篇マネージャーの初期化完了');

            // 残りの処理は既存のまま
            this.initialized = true;
            logger.info('プロットマネージャーの基本初期化が完了しました');

            this.loadExtendedComponents();
            logger.info('プロットマネージャーの初期化が完了し、拡張コンポーネントは並行してロード中');
        } catch (error) {
            this.initialized = false;
            logError(error, {}, 'プロットマネージャーの初期化に失敗しました');
            throw error;
        } finally {
            this.initializationPromise = null;
        }
    }

    /**
     * 🔧 新規追加: フォールバック用の世界設定をセットアップ
     */
    private async setupFallbackWorldSettings(): Promise<void> {
        try {
            // WorldSettingsManagerの内部状態を直接設定するワークアラウンド
            const fallbackSettings = {
                genre: 'classic',
                description: 'デフォルトの物語世界設定です。適切な設定ファイルを配置してください。',
                regions: []
            };

            // プライベートプロパティへのアクセス（型安全性を保つため）
            (this.worldSettingsManager as any).worldSettings = fallbackSettings;
            (this.worldSettingsManager as any).initialized = true;

            logger.info('フォールバック世界設定を適用しました', {
                genre: fallbackSettings.genre
            });
        } catch (error) {
            logger.error('フォールバック世界設定の適用に失敗しました', { error });
        }
    }

    /**
     * 拡張コンポーネントのロード（修正版）
     * 初期化順序の問題を解決し、循環依存を回避
     */
    private async loadExtendedComponents(): Promise<void> {
        try {
            // 1. 中期プロットから篇情報をロード（非同期で実行、エラーは無視）
            this.importMediumPlotSections().catch(error => {
                logger.warn(`中期プロットからの篇情報ロードに失敗しましたが、メイン機能には影響ありません: ${error.message}`);
            });

            // 2. ⭐ 修正: 学習旅路システムの初期化を遅延実行に変更
            // 即座に初期化せず、必要時に初期化するパターンに変更
            try {
                this.learningJourneySystem = new LearningJourneySystem(
                    this.geminiClient,
                    memoryManager,
                    characterManager
                );

                // ⭐ 重要: 初期化は遅延実行とし、システム全体の初期化完了後に実行
                logger.info('LearningJourneySystem instance created, initialization will be deferred');

                // 非同期で初期化を試行（失敗してもメイン機能に影響しない）
                this.deferredInitializeLearningJourney().catch(error => {
                    logger.warn(`学習旅路システムの遅延初期化に失敗しました: ${error.message}`);
                    this.learningJourneySystem = null;
                });

            } catch (learningError) {
                logger.warn('学習旅路システムの作成に失敗しました。関連機能は無効になります', {
                    error: learningError instanceof Error ? learningError.message : String(learningError)
                });
                this.learningJourneySystem = null;
            }
        } catch (error) {
            logger.error('拡張コンポーネントのロード中にエラーが発生しましたが、メイン機能には影響ありません', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * ⭐ 新規追加: 学習旅路システムの遅延初期化
     * システム全体の初期化完了後に実行される
     */
    private async deferredInitializeLearningJourney(): Promise<void> {
        if (!this.learningJourneySystem) {
            return;
        }

        try {
            // システム全体の初期化を待機（最大5秒）
            await this.waitForSystemInitialization(5000);

            logger.info('Starting deferred LearningJourneySystem initialization');

            await withTimeout(
                this.learningJourneySystem.initialize('default-story'),
                45000, // タイムアウトを延長
                '学習旅路システムの遅延初期化'
            );

            logger.info('LearningJourneySystem deferred initialization completed successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.warn(`学習旅路システムの遅延初期化に失敗: ${errorMessage}`);
            this.learningJourneySystem = null;
        }
    }

    /**
     * ⭐ 新規追加: システム初期化完了の待機
     */
    private async waitForSystemInitialization(timeoutMs: number): Promise<void> {
        const startTime = Date.now();

        while (Date.now() - startTime < timeoutMs) {
            try {
                // MemoryManagerの初期化状態をチェック
                const memoryInitialized = await memoryManager.isInitialized();

                // 基本的な動作確認
                if (memoryInitialized) {
                    // ジャンル取得のテスト（循環依存のチェック）
                    const genre = await this.getGenre();
                    if (genre && genre !== 'classic') {
                        logger.debug('System initialization verified, LearningJourneySystem can proceed');
                        return;
                    }
                }
            } catch (error) {
                // エラーは無視して再試行
            }

            // 100ms待機して再試行
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        logger.warn('System initialization wait timed out, proceeding with LearningJourneySystem initialization anyway');
    }

    /**
 * 中期プロットから篇情報をロード
 */
    private async importMediumPlotSections(): Promise<void> {
        try {
            // 中期プロットを読み込む
            const mediumPlot = await withTimeout(
                this.plotStorage.loadMediumPlot(),
                10000, // 10秒タイムアウト
                '中期プロットの読み込み'
            ).catch(error => {
                logger.warn(`中期プロットの読み込みに失敗しました: ${error.message}`);
                return null;
            });

            if (!mediumPlot || !mediumPlot.sections || !mediumPlot.sections.length) {
                logger.info('中期プロットが見つからないか、セクションが含まれていません');
                return;
            }

            const sectionCount = mediumPlot.sections.length;
            logger.info(`中期プロットから ${sectionCount} 個のセクションを読み込みます`);

            // セクションプロットマネージャーのインスタンスを取得
            const sectionPlotManager = getSectionPlotManagerInstance();

            // 効率化のために一度にすべてのセクションをチェック
            const checkPromises = mediumPlot.sections.map(section =>
                withTimeout(
                    sectionPlotManager.getSectionByChapter(section.chapterRange.start),
                    5000, // 5秒タイムアウト
                    `セクション ${section.structure?.title || '不明'} の存在チェック`
                ).catch(() => null)
            );

            const existingSectionsCheck = await Promise.all(checkPromises);

            // 中期プロットの各セクションを処理
            let importedCount = 0;
            for (let i = 0; i < mediumPlot.sections.length; i++) {
                const section = mediumPlot.sections[i];
                try {
                    // すでにチェック済みの結果を使用
                    const existingSection = existingSectionsCheck[i];

                    if (!existingSection) {
                        // 存在しない場合は新規作成
                        const sectionParams = this.convertMediumPlotSectionToParams(section);

                        const createdSection = await withTimeout(
                            sectionPlotManager.createSectionPlot(sectionParams),
                            10000, // 10秒タイムアウト
                            `セクション ${section.structure?.title || '不明'} の作成`
                        ).catch(error => {
                            logger.warn(`セクション作成に失敗: ${error.message}`);
                            return null;
                        });

                        if (!createdSection) continue;

                        // 詳細設計を更新
                        await withTimeout(
                            sectionPlotManager.updateSection(createdSection.id, {
                                emotionalDesign: section.emotionalDesign,
                                learningJourneyDesign: section.learningJourneyDesign,
                                characterDesign: section.characterDesign,
                                narrativeStructureDesign: section.narrativeStructureDesign
                            }),
                            10000, // 10秒タイムアウト
                            `セクション ${section.structure?.title || '不明'} の詳細更新`
                        ).catch(error => {
                            logger.warn(`セクション詳細の更新に失敗: ${error.message}`);
                        });

                        logger.info(`セクション「${section.structure.title}」を中期プロットから作成しました`);
                        importedCount++;
                    } else {
                        logger.debug(`セクション「${section.structure.title}」（章 ${section.chapterRange.start}-${section.chapterRange.end}）は既に存在します`);
                    }
                } catch (error) {
                    logger.error(`セクション「${section.structure?.title || '不明'}」の処理中にエラーが発生しました:`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                    // 1つのセクションのエラーで全体が中断しないよう続行する
                }
            }

            logger.info(`中期プロットからの読み込みが完了しました: ${importedCount} 個のセクションを作成`);
        } catch (error) {
            logError(error, {}, '中期プロットからのセクション読み込みに失敗しました');
            // 初期化プロセス全体を中断しないために、エラーをスローせずに処理する
        }
    }

    /**
     * 中期プロットのセクションをSectionParamsに変換
     */
    private convertMediumPlotSectionToParams(section: any): SectionPlotParams {
        return {
            title: section.structure.title,
            chapterRange: section.chapterRange,
            narrativePhase: section.structure.narrativePhase,
            theme: section.structure.theme,
            mainConcept: section.learningJourneyDesign.mainConcept,
            primaryLearningStage: section.learningJourneyDesign.primaryLearningStage as LearningStage,
            motifs: section.structure.motifs || [],
            setting: section.structure.setting || '主要舞台',
            mainCharacters: section.characterDesign.mainCharacters || [],
            editorNotes: `中期プロットからインポート: ${section.structure.title}`
        };
    }

    /**
 * 学習旅路システムを安全に取得
 * @returns 初期化済みの学習旅路システム、または null
 */
    async getLearningJourneySystem(): Promise<LearningJourneySystem | null> {
        if (!this.learningJourneySystem) {
            return null;
        }

        if (!this.learningJourneySystem.isInitialized()) {
            logger.info('LearningJourneySystem not initialized yet, attempting initialization...');
            try {
                await this.deferredInitializeLearningJourney();
            } catch (error) {
                logger.warn('Failed to initialize LearningJourneySystem on demand');
                return null;
            }
        }

        return this.learningJourneySystem.isInitialized() ? this.learningJourneySystem : null;
    }

    /**
     * 初期化完了の確認と必要に応じた待機
     */
    private async ensureInitialized(): Promise<void> {
        if (this.initialized) return;

        if (this.initializationPromise) {
            // 初期化中の場合は、タイムアウト付きで待機
            await withTimeout(
                this.initializationPromise,
                30000, // 30秒タイムアウト
                'プロットマネージャーの初期化の待機'
            ).catch(error => {
                logger.error(`初期化の待機中にタイムアウトが発生: ${error.message}`);
                // タイムアウトした場合は、初期化がハングしていると判断して新たに初期化を開始
                this.initializationPromise = null;
                throw new Error('プロットマネージャーの初期化がタイムアウトしました。再試行してください。');
            });
        } else {
            this.initializationPromise = this.initialize();
            await withTimeout(
                this.initializationPromise,
                30000, // 30秒タイムアウト
                'プロットマネージャーの初期化'
            ).catch(error => {
                logger.error(`初期化中にタイムアウトが発生: ${error.message}`);
                this.initializationPromise = null;
                throw new Error('プロットマネージャーの初期化がタイムアウトしました。再試行してください。');
            });
        }
    }

    /**
     * 次章のプロンプト用要素を生成します（ブリッジ統合版）
     * 
     * @param chapterNumber 章番号
     * @returns プロンプト用要素
     */
    async generatePromptElements(chapterNumber: number): Promise<PromptElements> {
        await this.ensureInitialized();

        try {
            logger.info(`章${chapterNumber}のプロンプト要素を生成します`);

            // 必要な情報の取得
            const concretePlot = await this.getConcretePlotForChapter(chapterNumber);
            const abstractGuideline = await this.getAbstractGuidelinesForChapter(chapterNumber);
            const phaseInfo = await this.getPhaseInformation(chapterNumber);

            // メモリマネージャーから物語状態を取得
            let narrativeState: NarrativeStateInfo | null = null;
            try {
                narrativeState = await memoryManager.getNarrativeState(chapterNumber);
            } catch (error) {
                logger.warn(`章${chapterNumber}の物語状態取得に失敗しました`, {
                    error: error instanceof Error ? error.message : String(error)
                });
            }

            // 物語生成ブリッジを使用して章の指示を生成
            const directives = await this.storyGenerationBridge.generateChapterDirectives(
                chapterNumber,
                concretePlot,
                abstractGuideline,
                narrativeState,
                phaseInfo
            );

            // 指示をプロンプト要素としてフォーマット
            const promptElements = this.storyGenerationBridge.formatAsPromptElements(directives);

            logger.debug(`章${chapterNumber}のプロンプト要素生成完了`, {
                elementsCount: Object.keys(promptElements).length
            });

            return promptElements;
        } catch (error) {
            logger.error(`章${chapterNumber}のプロンプト要素生成に失敗しました`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            // エラー時のフォールバック要素
            return this.generateFallbackPromptElements(chapterNumber);
        }
    }

    /**
     * フォールバックのプロンプト要素を生成
     * 
     * @param chapterNumber 章番号
     * @returns フォールバックプロンプト要素
     */
    private async generateFallbackPromptElements(chapterNumber: number): Promise<PromptElements> {
        try {
            // 最低限必要な情報を取得
            const abstractGuideline = await this.getAbstractGuidelinesForChapter(chapterNumber);

            return {
                CHAPTER_GOAL: `${abstractGuideline.theme}を探求しながら物語を進展させる`,
                REQUIRED_PLOT_ELEMENTS: `- ${abstractGuideline.theme}に関連する展開\n- キャラクターの成長機会\n- ${abstractGuideline.emotionalTone}の雰囲気の描写`,
                CURRENT_LOCATION: "前章から継続する場所",
                CURRENT_SITUATION: "物語の進行中の状況",
                ACTIVE_CHARACTERS: "- 前章から継続するキャラクター",
                WORLD_ELEMENTS_FOCUS: "- 現在の環境描写\n- 世界観の重要要素",
                THEMATIC_FOCUS: `- ${abstractGuideline.theme}\n- ${abstractGuideline.emotionalTone}の雰囲気`
            };
        } catch (error) {
            logger.error('フォールバックプロンプト要素の生成に失敗しました', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            // 完全なフォールバック
            return {
                CHAPTER_GOAL: "物語を自然に進展させる",
                REQUIRED_PLOT_ELEMENTS: "- キャラクターの成長\n- 世界観の発展\n- 興味深い展開",
                CURRENT_LOCATION: "適切な場所設定",
                CURRENT_SITUATION: "物語の進行状況",
                ACTIVE_CHARACTERS: "- 主要キャラクター",
                WORLD_ELEMENTS_FOCUS: "- 重要な世界設定要素",
                THEMATIC_FOCUS: "- 物語のテーマ"
            };
        }
    }

    /**
 * 中期プロットを読み込みます
 */
    async loadMediumPlot(): Promise<MediumPlot | null> {
        try {
            const filePath = 'data/config/story-plot/medium-plot.yaml';

            // ファイルが存在するか確認
            if (!(await storageProvider.fileExists(filePath))) {
                logger.info(`中期プロットファイル ${filePath} が存在しません。`);
                return null;
            }

            // ファイルを読み込む
            const content = await storageProvider.readFile(filePath);
            const parsed = parseYaml(content);

            // 検証
            if (typeof parsed !== 'object' || parsed === null || !parsed.sections) {
                logger.warn(`中期プロットファイルの形式が不正です: ${filePath}`);
                return null;
            }

            logger.info(`中期プロットをファイル ${filePath} から読み込みました`);
            return parsed as MediumPlot;
        } catch (error) {
            logError(error, {}, '中期プロットの読み込みに失敗しました');
            return null;
        }
    }

    /**
     * 特定の章に対応する中期プロットのセクションを取得します
     */
    async loadMediumPlotSectionForChapter(chapterNumber: number): Promise<any | null> {
        try {
            const mediumPlot = await this.loadMediumPlot();

            if (!mediumPlot || !mediumPlot.sections) {
                return null;
            }

            // 章番号に対応するセクションを探す
            const section = mediumPlot.sections.find(section =>
                chapterNumber >= section.chapterRange.start &&
                chapterNumber <= section.chapterRange.end
            );

            return section || null;
        } catch (error) {
            logError(error, { chapterNumber }, '章に対応する中期プロットセクションの読み込みに失敗しました');
            return null;
        }
    }

    /**
 * 章生成コンテキストに篇情報を統合
 * 
 * @param chapterNumber 章番号
 * @returns 篇情報を含むコンテキスト
 */
    async generateChapterContextWithSection(chapterNumber: number): Promise<any> {
        await this.ensureInitialized();

        try {
            logger.info(`章 ${chapterNumber} の篇情報を含むコンテキストを生成します`);

            // 基本的なコンテキストを生成
            const baseContext = await this.createBaseChapterContext(chapterNumber);

            // 章番号に対応する篇を取得
            const section = await this.getSectionForChapter(chapterNumber);
            if (!section) {
                logger.info(`章 ${chapterNumber} に対応する篇が見つかりません。基本コンテキストを返します`);
                return baseContext;
            }

            // 篇内での相対位置を計算 (0-1)
            const { start, end } = section.chapterRange;
            const relativePosition = (chapterNumber - start) / (end - start || 1);

            // 重要なシーンやターニングポイントを特定
            const relevantKeyScenes = this.findRelevantSectionElements(
                section.narrativeStructureDesign?.keyScenes || [],
                relativePosition,
                0.2
            );

            const relevantTurningPoints = this.findRelevantSectionElements(
                section.narrativeStructureDesign?.turningPoints || [],
                relativePosition,
                0.15
            );

            // 感情アークの情報を取得
            const emotionalInfo = this.getEmotionalArcInfo(section, relativePosition);

            // 章の位置づけ特定（導入、中盤、結末）
            const chapterPosition = this.determineChapterPosition(relativePosition);

            // 篇コンテキストを構築
            const sectionContext = {
                id: section.id,
                title: section.structure.title,
                theme: section.structure.theme,
                narrativePhase: section.structure.narrativePhase,
                chapterPosition,
                relativePosition,
                motifs: section.structure.motifs || [],

                // 感情設計
                emotionalTone: emotionalInfo.currentTone,
                emotionalArc: emotionalInfo.arc,
                emotionalJourney: section.emotionalDesign.readerEmotionalJourney,

                // 学習設計
                mainConcept: section.learningJourneyDesign.mainConcept,
                learningStage: section.learningJourneyDesign.primaryLearningStage,
                learningObjectives: section.learningJourneyDesign.learningObjectives,

                // 構造設計
                keyScenes: relevantKeyScenes,
                turningPoints: relevantTurningPoints,
                sectionThreads: section.narrativeStructureDesign?.narrativeThreads?.map(t => t.thread) || [],

                // キャラクター設計
                mainCharacters: section.characterDesign.mainCharacters
            };

            // テーマコンテキストを構築
            const themeContext = this.buildSectionThemeContext(section);

            // 統合したコンテキストを返す
            const enhancedContext = {
                ...baseContext,
                theme: themeContext,
                sectionContext,
                additionalContext: {
                    ...(baseContext.additionalContext || {}),
                    motifs: section.structure.motifs,
                    characterRoles: section.characterDesign.characterRoles,
                    sectionProgress: Math.round(relativePosition * 100) / 100,
                    tensionPoints: emotionalInfo.tensionPoint ? [emotionalInfo.tensionPoint] : []
                }
            };

            logger.info(`章 ${chapterNumber} の篇情報を含むコンテキスト生成が完了しました`);
            return enhancedContext;
        } catch (error) {
            logger.error(`章 ${chapterNumber} の篇情報を含むコンテキスト生成に失敗しました`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー時は基本コンテキストを返す
            return this.createBaseChapterContext(chapterNumber);
        }
    }

    /**
     * 基本的な章コンテキストを作成
     */
    private async createBaseChapterContext(chapterNumber: number): Promise<any> {
        try {
            // 短期記憶からの情報取得
            const shortTermMemory = memoryManager.getShortTermMemory();
            const previousChapters = await shortTermMemory.getRecentChapters(3);

            // 現在の章の前の章を取得
            const previousChapter = await shortTermMemory.getChapter(chapterNumber - 1);

            // 記憶システムから状態を取得
            const narrativeState = await memoryManager.getNarrativeState(chapterNumber);

            // 世界知識から関連コンテキストを取得
            const worldKnowledge = memoryManager.getLongTermMemory();
            const worldContext = await worldKnowledge.getRelevantContext(chapterNumber);

            // 基本コンテキストを構築
            return {
                chapterNumber,
                previousChapterContent: previousChapter ? previousChapter.content : '',
                previousChapterTitle: previousChapter ? previousChapter.title : '',
                recentChapters: previousChapters.map((c: any) => ({
                    number: c.chapter.chapterNumber,
                    title: c.chapter.title,
                    summary: c.summary || ''
                })),
                narrativeState: {
                    state: narrativeState.state,
                    location: narrativeState.location || '',
                    currentCharacters: narrativeState.presentCharacters || [],
                    tensionLevel: narrativeState.tensionLevel || 5
                },
                worldContext,
                themeContext: '',
                additionalContext: {},
                sectionContext: null
            };
        } catch (error) {
            logger.error(`章 ${chapterNumber} の基本コンテキスト生成に失敗しました`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー時は最小限のコンテキストを返す
            return {
                chapterNumber,
                previousChapterContent: '',
                previousChapterTitle: '',
                recentChapters: [],
                narrativeState: {
                    state: 'UNKNOWN',
                    location: '',
                    currentCharacters: [],
                    tensionLevel: 5
                },
                worldContext: '',
                themeContext: '',
                additionalContext: {},
                sectionContext: null
            };
        }
    }

    /**
     * 篇内の要素から章の相対位置に関連するものを見つける
     */
    private findRelevantSectionElements(elements: any[], relativePosition: number, maxDistance: number): any[] {
        if (!elements || !Array.isArray(elements)) return [];

        // 相対位置との距離が指定した最大距離以内の要素を抽出
        return elements.filter(element => {
            if (!element || typeof element.relativePosition !== 'number') return false;
            return Math.abs(element.relativePosition - relativePosition) <= maxDistance;
        });
    }

    /**
     * 感情アークの情報を取得
     */
    private getEmotionalArcInfo(section: SectionPlot, relativePosition: number): any {
        if (!section.emotionalDesign || !section.emotionalDesign.emotionalArc) {
            return {
                currentTone: '標準',
                arc: { opening: '標準', midpoint: '標準', conclusion: '標準' }
            };
        }

        const emotionalArc = section.emotionalDesign.emotionalArc;

        // 現在の感情トーンを決定
        let currentTone: string;
        if (relativePosition < 0.33) {
            currentTone = emotionalArc.opening;
        } else if (relativePosition < 0.66) {
            currentTone = emotionalArc.midpoint;
        } else {
            currentTone = emotionalArc.conclusion;
        }

        // 緊張ポイントを確認
        const tensionPoints = section.emotionalDesign.tensionPoints || [];
        const nearbyTensionPoint = tensionPoints.find(tp =>
            Math.abs(tp.relativePosition - relativePosition) <= 0.1
        );

        // カタルシスを確認
        const catharsis = section.emotionalDesign.catharticMoment;
        const isNearCatharsis = catharsis &&
            Math.abs(catharsis.relativePosition - relativePosition) <= 0.1;

        return {
            currentTone,
            arc: {
                opening: emotionalArc.opening,
                midpoint: emotionalArc.midpoint,
                conclusion: emotionalArc.conclusion
            },
            tensionPoint: nearbyTensionPoint,
            isNearCatharsis,
            catharsis: isNearCatharsis ? catharsis : null
        };
    }

    /**
     * 章の位置づけを決定
     */
    private determineChapterPosition(relativePosition: number): string {
        if (relativePosition < 0.25) {
            return 'OPENING';
        } else if (relativePosition < 0.75) {
            return 'MIDDLE';
        } else {
            return 'CONCLUSION';
        }
    }

    /**
     * 篇のテーマコンテキストを構築
     */
    private buildSectionThemeContext(section: SectionPlot): string {
        try {
            const structure = section.structure;
            const learning = section.learningJourneyDesign;
            const emotion = section.emotionalDesign;

            return `
## 「${structure.title}」のテーマと学習目標

### テーマ
${structure.theme}

### 中心概念
${learning.mainConcept}

### モチーフ
${(structure.motifs || []).join(', ')}

### 学習目標
- 認知的目標: ${learning.learningObjectives.cognitive}
- 感情的目標: ${learning.learningObjectives.affective}
- 行動的目標: ${learning.learningObjectives.behavioral}

### 感情的旅路
${emotion.readerEmotionalJourney}

### 期待される感情的リターン
${emotion.emotionalPayoff}
`.trim();
        } catch (error) {
            logger.warn('篇のテーマコンテキスト構築に失敗しました', { error });
            return '篇の情報が利用できません';
        }
    }

    /**
     * 章の詳細な指示情報を生成します
     * 
     * @param chapterNumber 章番号
     * @returns 章の指示情報
     */
    async generateChapterDirectives(chapterNumber: number): Promise<ChapterDirectives> {
        await this.ensureInitialized();

        try {
            // 必要な情報の取得
            const concretePlot = await this.getConcretePlotForChapter(chapterNumber);
            const abstractGuideline = await this.getAbstractGuidelinesForChapter(chapterNumber);
            const phaseInfo = await this.getPhaseInformation(chapterNumber);

            // メモリマネージャーから物語状態を取得
            let narrativeState: NarrativeStateInfo | null = null;
            try {
                narrativeState = await memoryManager.getNarrativeState(chapterNumber);
            } catch (error) {
                logger.warn(`章${chapterNumber}の物語状態取得に失敗しました`, {
                    error: error instanceof Error ? error.message : String(error)
                });
            }

            // 物語生成ブリッジを使用して章の指示を生成
            return await this.storyGenerationBridge.generateChapterDirectives(
                chapterNumber,
                concretePlot,
                abstractGuideline,
                narrativeState,
                phaseInfo
            );
        } catch (error) {
            logger.error(`章${chapterNumber}の指示情報生成に失敗しました`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            // エラー時は抽象ガイドラインに基づくフォールバック
            const abstractGuideline = await this.getAbstractGuidelinesForChapter(chapterNumber);
            return this.storyGenerationBridge.generateChapterDirectives(
                chapterNumber,
                null,
                abstractGuideline,
                null,
                null,
            );
        }
    }

    /**
 * 章が属する篇情報を取得
 * 
 * @param chapterNumber 章番号
 * @returns 篇情報 (存在しない場合はnull)
 */
    async getSectionForChapter(chapterNumber: number): Promise<SectionPlot | null> {
        // 初期化確認
        await this.ensureInitialized();

        try {
            // 篇マネージャーを取得
            const sectionPlotManager = getSectionPlotManagerInstance();

            // 章番号から篇を取得
            return await sectionPlotManager.getSectionByChapter(chapterNumber);
        } catch (error) {
            logger.error(`Failed to get section for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });
            return null;
        }
    }

    /**
     * 篇を作成
     * 
     * @param params 篇作成パラメータ
     * @returns 作成された篇
     */
    async createSection(params: SectionPlotParams): Promise<SectionPlot> {
        // 初期化確認
        await this.ensureInitialized();

        try {
            // 篇マネージャーを取得
            const sectionPlotManager = getSectionPlotManagerInstance();

            // 篇を作成
            return await sectionPlotManager.createSectionPlot(params);
        } catch (error) {
            logger.error(`Failed to create section`, {
                error: error instanceof Error ? error.message : String(error),
                params
            });
            throw error;
        }
    }

    /**
     * すべての篇を取得
     * 
     * @returns 篇の配列
     */
    async getAllSections(): Promise<SectionPlot[]> {
        // 初期化確認
        await this.ensureInitialized();

        try {
            // 篇マネージャーを取得
            const sectionPlotManager = getSectionPlotManagerInstance();

            // すべての篇を取得
            return await sectionPlotManager.getAllSections();
        } catch (error) {
            logger.error(`Failed to get all sections`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 篇の情報と設計を取得
     * 
     * @param sectionId 篇ID
     * @returns 篇の設計情報
     */
    async getSectionDesignInfo(sectionId: string): Promise<any> {
        // 初期化確認
        await this.ensureInitialized();

        try {
            // 篇マネージャーと設計コンポーネントを取得
            const sectionPlotManager = getSectionPlotManagerInstance();

            // 篇情報を取得
            const section = await sectionPlotManager.getSection(sectionId);
            if (!section) {
                throw new Error(`Section with ID ${sectionId} not found`);
            }

            // 統合情報を作成して返す
            return {
                structure: section.structure,
                learning: section.learningJourneyDesign,
                emotional: section.emotionalDesign,
                character: section.characterDesign,
                narrative: section.narrativeStructureDesign
            };
        } catch (error) {
            logger.error(`Failed to get section design info for ${sectionId}`, {
                error: error instanceof Error ? error.message : String(error),
                sectionId
            });

            // エラー時は空オブジェクトを返す
            return {};
        }
    }

    /**
     * 篇の一貫性を分析
     * 
     * @param sectionId 篇ID
     * @returns 一貫性分析結果
     */
    async analyzeSectionCoherence(sectionId: string): Promise<any> {
        // 初期化確認
        await this.ensureInitialized();

        try {
            // 篇マネージャーを取得
            const sectionPlotManager = getSectionPlotManagerInstance();

            // 篇の一貫性を分析
            return await sectionPlotManager.analyzeSectionCoherence(sectionId);
        } catch (error) {
            logger.error(`Failed to analyze section coherence for ${sectionId}`, {
                error: error instanceof Error ? error.message : String(error),
                sectionId
            });

            // エラー時は空の分析結果を返す
            return {
                overallScore: 0,
                problematicAreas: [],
                improvementSuggestions: []
            };
        }
    }

    /**
     * 篇の学習目標達成度を分析
     * 
     * @param sectionId 篇ID
     * @returns 学習目標達成度分析結果
     */
    async analyzeSectionLearningProgress(sectionId: string): Promise<any> {
        // 初期化確認
        await this.ensureInitialized();

        try {
            // 篇マネージャーを取得
            const sectionPlotManager = getSectionPlotManagerInstance();

            // 篇の学習目標達成度を分析
            return await sectionPlotManager.analyzeLearningObjectiveProgress(sectionId);
        } catch (error) {
            logger.error(`Failed to analyze section learning progress for ${sectionId}`, {
                error: error instanceof Error ? error.message : String(error),
                sectionId
            });

            // エラー時は空の分析結果を返す
            return {
                cognitiveProgress: 0,
                affectiveProgress: 0,
                behavioralProgress: 0,
                examples: [],
                gaps: []
            };
        }
    }

    /**
     * 篇の改善提案を取得
     * 
     * @param sectionId 篇ID
     * @returns 改善提案の配列
     */
    async getSectionImprovementSuggestions(sectionId: string): Promise<any[]> {
        // 初期化確認
        await this.ensureInitialized();

        try {
            // 篇マネージャーを取得
            const sectionPlotManager = getSectionPlotManagerInstance();

            // 篇の改善提案を取得
            return await sectionPlotManager.suggestSectionImprovements(sectionId);
        } catch (error) {
            logger.error(`Failed to get section improvement suggestions for ${sectionId}`, {
                error: error instanceof Error ? error.message : String(error),
                sectionId
            });

            // エラー時は空の配列を返す
            return [];
        }
    }

    /**
     * プロット指示を生成（プロンプト用）- 物語生成ブリッジを活用した最適化版
     */
    async generatePlotDirective(chapterNumber: number): Promise<string> {
        await this.ensureInitialized();

        try {
            // 物語生成ブリッジを使用して詳細な指示を取得
            const directives = await this.generateChapterDirectives(chapterNumber);

            // フェーズ情報を取得
            const phaseInfo = await this.getPhaseInformation(chapterNumber);

            // 指示をプロンプト用のテキストに整形
            let directive = "## 物語構造とプロット指示（ストーリーの骨格）\n\n";

            // 物語フェーズの情報
            directive += `**現在の物語フェーズ**: ${this.formatPhase(phaseInfo.phase)}\n`;
            directive += `**フェーズ進行度**: ${Math.round(phaseInfo.phaseProgress * 100)}%\n`;
            directive += `**重要度**: ${Math.round(phaseInfo.importance * 10)}/10\n\n`;

            // 章の目標
            directive += "### このチャプターの目標\n";
            directive += `${directives.chapterGoal}\n\n`;

            // 必須のプロット要素
            directive += "### 必須のプロット要素\n";
            directives.requiredPlotElements.forEach(element => {
                directive += `- ${element}\n`;
            });
            directive += "\n";

            // 現在の状況
            directive += "### 現在の状況\n";
            directive += `**場所**: ${directives.currentLocation}\n`;
            directive += `**状況**: ${directives.currentSituation}\n\n`;

            // アクティブなキャラクター
            directive += "### アクティブなキャラクター\n";
            directives.activeCharacters.forEach(char => {
                directive += `- **${char.name}** (${char.role}): ${char.currentState}\n`;
            });
            directive += "\n";

            // 世界設定の焦点
            directive += "### 注目すべき世界設定要素\n";
            directives.worldElementsFocus.forEach(element => {
                directive += `- ${element}\n`;
            });
            directive += "\n";

            // テーマ的焦点
            directive += "### テーマ的焦点\n";
            directives.thematicFocus.forEach(theme => {
                directive += `- ${theme}\n`;
            });
            directive += "\n";

            // 感情的目標
            if (directives.emotionalGoal) {
                directive += `**感情的目標**: ${directives.emotionalGoal}\n`;
            }

            // テンション
            if (directives.tension) {
                directive += `**テンションレベル**: ${directives.tension}/10\n\n`;
            }

            // 推奨シーン
            if (directives.suggestedScenes && directives.suggestedScenes.length > 0) {
                directive += "### 推奨シーン\n";
                directives.suggestedScenes.forEach(scene => {
                    directive += `- ${scene}\n`;
                });
                directive += "\n";
            }

            // 移行点の場合、次のフェーズへの橋渡し
            if (phaseInfo.isTransitionPoint && phaseInfo.nextPhase) {
                directive += "### 次フェーズへの移行\n";
                directive += `このチャプターは現在のフェーズ「${this.formatPhase(phaseInfo.phase)}」の最終章です。\n`;
                directive += `次のフェーズ「${this.formatPhase(phaseInfo.nextPhase)}」への橋渡しを意識してください。\n\n`;
            }

            return directive;
        } catch (error) {
            logger.error(`章${chapterNumber}のプロット指示生成に失敗しました`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            // 既存の実装をフォールバックとして使用
            return this.generateLegacyPlotDirective(chapterNumber);
        }
    }

    /**
     * レガシー実装によるプロット指示生成（フォールバック用）
     */
    private async generateLegacyPlotDirective(chapterNumber: number): Promise<string> {
        // 現在のフェーズ情報を取得
        const phaseInfo = await this.getPhaseInformation(chapterNumber);

        // 具体プロットと抽象プロットを取得
        const concretePlot = await this.getConcretePlotForChapter(chapterNumber);
        const abstractGuideline = await this.getAbstractGuidelinesForChapter(chapterNumber);

        // プロット指示を構築
        let directive = "## 物語構造とプロット指示（ストーリーの骨格）\n\n";

        // 物語フェーズの情報
        directive += `**現在の物語フェーズ**: ${this.formatPhase(phaseInfo.phase)}\n`;
        directive += `**フェーズ進行度**: ${Math.round(phaseInfo.phaseProgress * 100)}%\n`;
        directive += `**重要度**: ${Math.round(phaseInfo.importance * 10)}/10\n\n`;

        // 具体プロットがある場合
        if (concretePlot) {
            directive += "### このチャプターで達成すべきストーリー要素\n";
            directive += `**アーク**: ${concretePlot.storyArc || '主要ストーリー'}\n`;
            directive += `**タイトル**: ${concretePlot.title}\n`;
            directive += `**目標**: ${concretePlot.storyGoal || concretePlot.summary}\n\n`;

            directive += "**必須イベント**:\n";
            concretePlot.keyEvents.forEach(event => {
                directive += `- ${event}\n`;
            });
            directive += "\n";

            directive += "**必須要素**:\n";
            concretePlot.requiredElements.forEach(element => {
                directive += `- ${element}\n`;
            });
            directive += "\n";

            if (concretePlot.mustHaveOutcome) {
                directive += `**必ず達成すべき結果**: ${concretePlot.mustHaveOutcome}\n\n`;
            }
        }

        // 抽象プロットの情報
        directive += "### テーマと方向性\n";
        directive += `**テーマ**: ${abstractGuideline.theme}\n`;
        directive += `**感情基調**: ${abstractGuideline.emotionalTone}\n`;

        if (abstractGuideline.thematicMessage) {
            directive += `**伝えるべきメッセージ**: ${abstractGuideline.thematicMessage}\n\n`;
        }

        // フェーズの目的
        if (abstractGuideline.phasePurpose) {
            directive += `**このフェーズの目的**: ${abstractGuideline.phasePurpose}\n\n`;
        }

        // 移行点の場合、次のフェーズへの橋渡し
        if (phaseInfo.isTransitionPoint && phaseInfo.nextPhase) {
            directive += "### 次フェーズへの移行\n";
            directive += `このチャプターは現在のフェーズ「${this.formatPhase(phaseInfo.phase)}」の最終章です。\n`;
            directive += `次のフェーズ「${this.formatPhase(phaseInfo.nextPhase)}」への橋渡しを意識してください。\n\n`;
        }

        return directive;
    }

    /**
 * 生成されたコンテンツの整合性をチェックします
 * 
 * @param content 生成されたコンテンツ
 * @param chapterNumber 章番号
 * @returns 整合性チェック結果
 */
    async checkGeneratedContentConsistency(
        content: string,
        chapterNumber: number
    ): Promise<{
        consistent: boolean;
        issues: Array<{
            type: string;
            description: string;
            severity: "LOW" | "MEDIUM" | "HIGH";
            suggestion: string;
            context?: string;
        }>;
    }> {
        await this.ensureInitialized();

        try {
            logger.info(`章${chapterNumber}のプロット整合性チェックを開始`);

            // 内部の plotChecker インスタンスを使用して整合性チェックを実行
            const result = await this.plotChecker.checkGeneratedContentConsistency(
                content,
                chapterNumber
            );

            logger.info(`章${chapterNumber}のプロット整合性チェック完了`, {
                consistent: result.consistent,
                issueCount: result.issues.length,
                highSeverityIssues: result.issues.filter(i => i.severity === "HIGH").length
            });

            return result;
        } catch (error) {
            logger.error(`章${chapterNumber}のプロット整合性チェックに失敗しました`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            // エラー時のフォールバック値を返す
            return {
                consistent: true,
                issues: []
            };
        }
    }

    /**
     * フェーズの整形表示
     */
    private formatPhase(phase: string): string {
        const phaseMap: { [key: string]: string } = {
            'OPENING': '序章/オープニング',
            'EARLY': '序盤',
            'MIDDLE': '中盤',
            'LATE': '終盤',
            'CLIMAX': 'クライマックス',
            'ENDING': '終章/エンディング'
        };

        return phaseMap[phase] || phase;
    }

    /**
     * 現在のチャプターのフェーズ情報を取得
     */
    async getPhaseInformation(chapterNumber: number): Promise<any> {
        await this.ensureInitialized();

        const concretePlots = await this.plotStorage.loadConcretePlot();
        const abstractPlots = await this.plotStorage.loadAbstractPlot();

        return this.phaseManager.identifyPhase(chapterNumber, concretePlots, abstractPlots);
    }

    /**
     * 物語全体の構造マップを取得
     */
    async getStoryStructureMap(): Promise<any> {
        await this.ensureInitialized();

        const concretePlots = await this.plotStorage.loadConcretePlot();
        const abstractPlots = await this.plotStorage.loadAbstractPlot();

        return this.phaseManager.buildStoryStructureMap(concretePlots, abstractPlots);
    }

    /**
     * 世界設定からジャンルを取得する（安全化版）
     * @returns {Promise<string>} ジャンル文字列
     */
    async getGenre(): Promise<string> {
        try {
            // ⭐ 修正: 初期化状態をチェックし、未初期化の場合はデフォルトを返す
            if (!this.initialized) {
                logger.debug('PlotManager not fully initialized, returning default genre');
                return 'classic';
            }

            await this.ensureInitialized();
            return await this.worldSettingsManager.getGenre();
        } catch (error) {
            logger.warn('Failed to get genre via PlotManager', {
                error: error instanceof Error ? error.message : String(error)
            });
            return 'classic'; // デフォルトジャンル
        }
    }

    /**
     * 世界設定を確認します
     * 
     * @returns 世界設定が有効かどうか
     */
    async hasValidWorldSettings(): Promise<boolean> {
        await this.ensureInitialized();
        return this.worldSettingsManager.hasValidWorldSettings();
    }

    /**
     * テーマ設定を確認します
     * 
     * @returns テーマ設定が有効かどうか
     */
    async hasValidThemeSettings(): Promise<boolean> {
        await this.ensureInitialized();
        return this.worldSettingsManager.hasValidThemeSettings();
    }

    /**
     * プロンプト用に整形された世界設定とテーマを取得します
     * 
     * @returns 整形された世界設定とテーマ
     */
    async getFormattedWorldAndTheme(): Promise<FormattedWorldAndTheme> {
        await this.ensureInitialized();
        return this.worldSettingsManager.getFormattedWorldAndTheme();
    }

    /**
     * 世界設定とテーマを再読み込みします
     */
    async reloadWorldAndThemeSettings(): Promise<void> {
        await this.ensureInitialized();
        await this.worldSettingsManager.reload();
    }

    /**
     * 構造化された世界設定を取得します
     */
    async getStructuredWorldSettings(): Promise<WorldSettings | null> {
        await this.ensureInitialized();
        return this.worldSettingsManager.getWorldSettings();
    }

    /**
     * 構造化されたテーマ設定を取得します
     */
    async getStructuredThemeSettings(): Promise<ThemeSettings | null> {
        await this.ensureInitialized();
        return this.worldSettingsManager.getThemeSettings();
    }

    /**
     * 指定されたチャプターの具体的プロットを取得します
     * 
     * @param chapterNumber チャプター番号
     * @returns 具体的プロット（存在しない場合はnull）
     */
    async getConcretePlotForChapter(chapterNumber: number): Promise<ConcretePlotPoint | null> {
        // タイムアウト付きで初期化を確認
        try {
            await withTimeout(
                this.ensureInitialized(),
                15000, // 15秒タイムアウト
                'プロットマネージャーの初期化確認'
            );
        } catch (error: unknown) { // unknown型として明示
            // エラーメッセージの安全な取得
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.warn(`初期化確認がタイムアウトしました。nullを返します: ${errorMessage}`);
            // タイムアウト時はnullを返す
            return null;
        }

        try {
            // チャプター番号に該当する具体プロットを取得
            const allConcretePlots = await withTimeout(
                this.plotStorage.loadConcretePlot(),
                10000, // 10秒タイムアウト
                '具体プロットの読み込み'
            ).catch((error: unknown) => { // catch内のエラーにも型指定
                const errorMessage = error instanceof Error ? error.message : String(error);
                logger.warn(`具体プロットの読み込みに失敗しました: ${errorMessage}`);
                return [];
            });

            // チャプター範囲に一致するプロットを検索
            return allConcretePlots.find(plot =>
                chapterNumber >= plot.chapterRange[0] &&
                chapterNumber <= plot.chapterRange[1]
            ) || null;
        } catch (error: unknown) { // unknown型として明示
            // logErrorユーティリティを使用する場合、内部でエラー処理されている前提
            logError(error, { chapterNumber }, '具体プロットの取得に失敗しました');
            return null;
        }
    }

    /**
     * 指定されたチャプターの抽象的プロットガイドラインを取得します
     * 
     * @param chapterNumber チャプター番号
     * @returns 抽象的プロットガイドライン
     */
    async getAbstractGuidelinesForChapter(chapterNumber: number): Promise<AbstractPlotGuideline> {
        // タイムアウト付きで初期化を確認
        try {
            await withTimeout(
                this.ensureInitialized(),
                15000, // 15秒タイムアウト
                'プロットマネージャーの初期化確認'
            );
        } catch (error: unknown) { // すでに明示されている
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.warn(`初期化確認がタイムアウトしました。フォールバック値を使用します: ${errorMessage}`);
            // タイムアウト時はフォールバック値を返す
            return this.getEmergencyAbstractGuideline();
        }

        try {
            // 抽象プロットデータを取得
            const abstractPlots = await withTimeout(
                this.plotStorage.loadAbstractPlot(),
                10000, // 10秒タイムアウト
                '抽象プロットの読み込み'
            ).catch((error: unknown) => { // catch内のエラーにも型指定
                const errorMessage = error instanceof Error ? error.message : String(error);
                logger.warn(`抽象プロットの読み込みに失敗しました: ${errorMessage}`);
                return [];
            });

            // チャプター範囲に一致する抽象プロットを検索
            const matchingPlot = abstractPlots.find(plot =>
                plot.chapterRange &&
                chapterNumber >= plot.chapterRange[0] &&
                chapterNumber <= plot.chapterRange[1]
            );

            // 一致するものがあれば返却、なければデフォルト値
            if (matchingPlot) {
                return matchingPlot;
            }

            // 物語進行度から適切なフェーズの抽象ガイドラインを推定
            return this.getDefaultAbstractGuideline(chapterNumber);
        } catch (error: unknown) { // unknown型として明示
            // logErrorユーティリティを使用する場合、内部でエラー処理されている前提
            logError(error, { chapterNumber }, '抽象プロットの取得に失敗しました');

            // エラー時はフォールバックの抽象ガイドラインを返却
            return this.getEmergencyAbstractGuideline();
        }
    }

    // ヘルパーメソッド

    /**
     * 世界設定を取得します（MemoryManagerからではなく専用マネージャーから）
     * @private
     */
    private async getWorldSettings(): Promise<string> {
        try {
            const formattedData = await this.worldSettingsManager.getFormattedWorldAndTheme();
            return formattedData.worldSettings || '詳細な世界設定情報はありません';
        } catch (error) {
            logError(error, {}, '世界設定の取得に失敗しました');
            return '世界設定情報の取得中にエラーが発生しました';
        }
    }

    /**
     * 物語進行度から適切な抽象ガイドラインを生成
     * @private
     */
    private async getDefaultAbstractGuideline(chapterNumber: number): Promise<AbstractPlotGuideline> {
        // 物語の総チャプター数を推定
        const estimatedTotalChapters = 50; // 仮の値
        const progress = chapterNumber / estimatedTotalChapters;

        let phase = '';
        // 進捗に応じたフェーズ設定
        if (progress < 0.1) {
            phase = "INTRODUCTION"; // 導入部
        } else if (progress < 0.3) {
            phase = "RISING_ACTION"; // 展開
        } else if (progress < 0.5) {
            phase = "COMPLICATIONS"; // 複雑化
        } else if (progress < 0.7) {
            phase = "CLIMAX_APPROACH"; // クライマックス前
        } else if (progress < 0.85) {
            phase = "CLIMAX"; // クライマックス
        } else {
            phase = "RESOLUTION"; // 解決
        }

        // 進捗に応じたポテンシャルな方向性
        const directions = this.getDirectionsByPhase(phase);

        return {
            phase,
            theme: "キャラクターの成長と冒険",
            emotionalTone: "希望と挑戦の混在",
            potentialDirections: directions,
            prohibitedElements: [
                "物語の大筋からの急激な逸脱",
                "キャラクターの一貫性を損なう行動",
                "前後の章との整合性を欠く展開"
            ],
            chapterRange: [chapterNumber, chapterNumber],
            // 新しいプロパティも設定（オプショナルなので既存コードと互換性あり）
            thematicMessage: "自己発見と成長の旅路",
            phasePurpose: this.getPhasePurposeByPhase(phase)
        };
    }

    /**
     * フェーズの目的を取得
     */
    private getPhasePurposeByPhase(phase: string): string {
        switch (phase) {
            case "INTRODUCTION":
                return "読者を世界観に引き込み、主人公への共感を作る";
            case "RISING_ACTION":
                return "物語の基本的な葛藤を確立し、緊張を高めていく";
            case "COMPLICATIONS":
                return "物語の複雑さを増し、キャラクターの成長を促す";
            case "CLIMAX_APPROACH":
                return "全ての要素をクライマックスに向けて収束させる";
            case "CLIMAX":
                return "物語の中心的な葛藤を解決する決定的な瞬間を描く";
            case "RESOLUTION":
                return "解決後の世界と変化したキャラクターを示す";
            default:
                return "物語の自然な進行を支援する";
        }
    }

    /**
     * フェーズに応じた方向性リストを取得
     * @private
     */
    private getDirectionsByPhase(phase: string): string[] {
        switch (phase) {
            case "INTRODUCTION":
                return [
                    "主要キャラクターとその生活状況の紹介",
                    "世界観やルールの説明",
                    "将来の冒険/問題の伏線"
                ];
            case "RISING_ACTION":
                return [
                    "主人公が最初の課題や障害に直面",
                    "キャラクター間の関係の発展",
                    "冒険や使命の始まり"
                ];
            case "COMPLICATIONS":
                return [
                    "障害や課題の複雑化",
                    "脇筋の発展",
                    "葛藤の深まり"
                ];
            case "CLIMAX_APPROACH":
                return [
                    "主要な対決への準備",
                    "最終的な戦略/計画の展開",
                    "最高潮に向けた緊張感の高まり"
                ];
            case "CLIMAX":
                return [
                    "主要なコンフリクトの解決",
                    "キャラクターの変革の瞬間",
                    "真実の発覚や重要な決断"
                ];
            case "RESOLUTION":
                return [
                    "物語の解決と残った問題の処理",
                    "キャラクターの旅の振り返りと影響",
                    "未来への示唆"
                ];
            default:
                return [
                    "キャラクターの成長の機会",
                    "主要な関係性の発展",
                    "物語世界のさらなる探索"
                ];
        }
    }

    /**
     * 緊急時のフォールバック用抽象ガイドライン
     * @private
     */
    private getEmergencyAbstractGuideline(): AbstractPlotGuideline {
        return {
            phase: "NEUTRAL",
            theme: "キャラクターの成長",
            emotionalTone: "バランスの取れた展開",
            potentialDirections: [
                "キャラクターの内的成長や変化",
                "重要な関係性の発展",
                "世界観や状況の深掘り"
            ],
            prohibitedElements: [
                "前後の章との矛盾",
                "キャラクターの急激な性格変化",
                "唐突な展開"
            ]
        };
    }
}

// シングルトンインスタンスをエクスポート
export const plotManager = new PlotManager();