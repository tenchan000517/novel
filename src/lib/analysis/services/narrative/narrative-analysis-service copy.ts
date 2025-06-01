/**
 * @fileoverview 物語構造とフローを分析するサービス
 * @description
 * 物語のアーク、テンション、流れ、パターンを分析し、
 * 一貫性のある物語展開を支援するためのサービス
 */

import { Chapter } from '@/types/chapters';
import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { apiThrottler, RequestPriority } from '@/lib/utils/api-throttle';
// import { TensionPacingRecommendation, TensionRecommendation, PacingRecommendation } from '@/lib/memory/dynamic-tension-optimizer';
import {
    NarrativeState,
    NarrativeStateInfo,
    TurningPoint,
    StateTransition,
    StagnationDetectionResult,
    EmotionalCurvePoint
} from '@/lib/memory/narrative/types';  // 正しいパスに修正
import { SceneStructureAnalysis, SceneRecommendation, LiteraryInspiration } from '@/types/generation';
import { SceneStructureOptimizer } from './scene-structure-optimizer';
// import { ThemeResonanceAnalyzer } from './theme-resonance-analyzer';
import { LiteraryComparisonSystem } from './literary-comparison-system';
import { memoryManager } from '@/lib/memory/manager';

/**
 * @interface NarrativeAnalysisOptions
 * @description 物語分析サービスの設定オプション
 */
export interface NarrativeAnalysisOptions {
    geminiClient?: GeminiClient;
    genre?: string;
}

/**
 * @class NarrativeAnalysisService
 * @description 物語構造とフローを分析するサービス
 * 
 * このサービスは物語のアークとフェーズ、テンション、流れ、パターンを分析し、
 * 一貫性のある物語展開と品質向上をサポートします。
 */
export class NarrativeAnalysisService {
    private geminiClient: GeminiClient;
    private narrativeState: {
        state: NarrativeState;
        phase: string;
        arcProgress: number;
        totalProgress: number;
    };
    private genre: string;

    // 物語構造分析用データ
    private arcs: Array<{ arcNumber: number; theme: string; startChapter: number; endChapter: number; completed: boolean }> = [];
    private turningPoints: TurningPoint[] = [];
    private stateTransitions: StateTransition[] = [];
    private tensionHistory: Map<number, number> = new Map();
    private chapterSummaries: Map<number, string> = new Map();

    // 物語の現在の状態と進行状況
    private currentArcNumber: number = 1;
    private currentState: string = 'INTRODUCTION';
    private lastUpdatedChapter: number = 0;

    private sceneStructureOptimizer: SceneStructureOptimizer;
    // private themeResonanceAnalyzer: ThemeResonanceAnalyzer;
    private literaryComparisonSystem: LiteraryComparisonSystem;
    private defaultThemes: string[] = ['成長と変化', '困難の克服', '自己発見'];

    /**
     * コンストラクタ
     * @param options 設定オプション
     */
    constructor(options: NarrativeAnalysisOptions = {}) {
        this.geminiClient = options.geminiClient || new GeminiClient();
        this.genre = options.genre || 'classic';
        this.narrativeState = {
            state: NarrativeState.INTRODUCTION,  // enumを使用
            phase: 'OPENING',
            arcProgress: 0,
            totalProgress: 0
        };

        // 新たに追加する初期化
        this.sceneStructureOptimizer = new SceneStructureOptimizer(this.geminiClient);
        // this.themeResonanceAnalyzer = new ThemeResonanceAnalyzer(this.geminiClient);
        this.literaryComparisonSystem = new LiteraryComparisonSystem(this.geminiClient);
    }

    /**
 * シーン構造を分析
 * @param lastChapters 分析対象の章数
 * @returns シーン構造分析結果
 */
    async analyzeSceneStructure(lastChapters: number = 10): Promise<SceneStructureAnalysis> {
        try {
            logger.info(`最近の${lastChapters}章のシーン構造を分析します`);

            // 最近の章を取得
            const chapters: any[] = [];
            const latestChapterNumber = await this.getLatestChapterNumber();

            for (let i = Math.max(1, latestChapterNumber - lastChapters); i <= latestChapterNumber; i++) {
                const chapter = await memoryManager.getShortTermMemory().getChapter(i);
                if (chapter) {
                    chapters.push(chapter);
                }
            }

            // シーン構造を分析
            const analysis = await this.sceneStructureOptimizer.analyzeSceneStructure(chapters);

            logger.debug('シーン構造分析完了', {
                chaptersAnalyzed: chapters.length,
                typeDistributionCount: Object.keys(analysis.typeDistribution || {}).length
            });

            return analysis;
        } catch (error) {
            logger.error('シーン構造分析に失敗しました', {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー時はフォールバック値を返す
            return {
                typeDistribution: {
                    'INTRODUCTION': 1,
                    'DEVELOPMENT': 1,
                    'CLIMAX': 1,
                    'RESOLUTION': 1,
                    'TRANSITION': 1
                },
                lengthDistribution: {
                    min: 500,
                    max: 2000,
                    avg: 1000,
                    stdDev: 500
                },
                paceVariation: 0.5,
                transitionTypes: {
                    types: {},
                    smoothness: 0.7
                }
            };
        }
    }

    /**
     * シーン推奨を生成
     * @param chapterNumber 章番号
     * @returns シーン推奨の配列
     */
    async generateSceneRecommendations(chapterNumber: number): Promise<SceneRecommendation[]> {
        try {
            logger.info(`章${chapterNumber}のシーン推奨を生成します`);

            // シーン構造を分析
            const analysis = await this.analyzeSceneStructure();

            // 推奨を生成（APIスロットリング適用）
            const recommendations = await apiThrottler.throttledRequest(() =>
                this.sceneStructureOptimizer.generateSceneRecommendations(analysis, chapterNumber)
            );

            logger.debug('シーン推奨生成完了', {
                chapterNumber,
                recommendationCount: recommendations.length
            });

            return recommendations;
        } catch (error) {
            logger.error('シーン推奨の生成に失敗しました', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            // エラー時はフォールバック値を返す
            return [{
                type: 'SCENE_STRUCTURE',
                description: "バランスの取れたシーン構成（冒頭、展開、クライマックス）を心がけてください",
                reason: "読者の興味を引きつけ、物語の流れを自然に構築するため"
            }];
        }
    }

    /**
     * 文学的インスピレーションを生成
     * @param context コンテキスト情報
     * @param chapterNumber 章番号
     * @returns 文学的インスピレーション
     */
    async generateLiteraryInspirations(
        context: any,
        chapterNumber: number
    ): Promise<LiteraryInspiration> {
        try {
            logger.info(`章${chapterNumber}の文学的インスピレーションを生成します`);

            const baseContext = {
                worldSettings: context.worldSettings || '',
                chapterNumber,
                totalChapters: context.totalChapters || 0
            };

            // 🔧 改善：優先度を LOW に設定して他のリクエストを先に処理
            const inspirations = await this.literaryComparisonSystem.generateLiteraryInspirations(baseContext, chapterNumber);

            logger.debug('文学的インスピレーション生成完了', {
                chapterNumber,
                techniqueCount: (
                    inspirations.plotTechniques.length +
                    inspirations.characterTechniques.length +
                    inspirations.atmosphereTechniques.length
                )
            });

            return inspirations;
        } catch (error) {
            logger.warn('文学的インスピレーション生成に失敗しました', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            // 🔧 改善：より詳細なフォールバック
            return this.createGenreSpecificFallback(context.genre || 'business');
        }
    }

    // 🔧 追加：ジャンル別フォールバック
    private createGenreSpecificFallback(genre: string): LiteraryInspiration {
        if (genre === 'business') {
            return {
                plotTechniques: [{
                    technique: "ビジネス上の危機と解決",
                    description: "企業や事業が直面する危機的状況とその解決プロセスを描写する技法",
                    example: "資金繰りの困難から革新的な製品開発によって活路を見出す展開",
                    reference: "下町ロケット"
                }],
                characterTechniques: [{
                    technique: "専門性と人間性のバランス",
                    description: "ビジネススキルと人間的側面を両立させて描写する手法",
                    example: "技術者としての洞察力を持ちながらチームとの関係に悩む描写",
                    reference: "下町ロケット"
                }],
                atmosphereTechniques: [{
                    technique: "企業文化の象徴的表現",
                    description: "組織の文化や価値観を象徴的な場面を通じて表現する技法",
                    example: "朝礼や社内慣習を通して表現される企業の伝統と価値観",
                    reference: "海賊とよばれた男"
                }]
            };
        }

        // エラー時はデフォルト値を返す
        return {
            plotTechniques: [{
                technique: "伏線の設置と回収",
                description: "物語の前半で示唆し、後半で意味を明らかにする技法",
                example: "主人公が何気なく拾った小さなアイテムが、後の章で重要な意味を持つ",
                reference: "優れた小説作品"
            }],
            characterTechniques: [{
                technique: "行動による性格描写",
                description: "キャラクターの内面を直接説明せず、行動や選択を通じて性格を示す",
                example: "危機的状況での判断や反応を通じてキャラクターの本質を描く",
                reference: "優れたキャラクター小説"
            }],
            atmosphereTechniques: [{
                technique: "対比による強調",
                description: "対照的な場面や感情を並置して、両方をより際立たせる",
                example: "平和な日常描写の直後に緊迫した場面を配置する",
                reference: "現代文学作品"
            }]
        };
    }


    /**
     * 最新の章番号を取得
     * @private
     * @returns 最新の章番号
     */
    private async getLatestChapterNumber(): Promise<number> {
        try {
            // メモリマネージャーから最新チャプターを取得
            const shortTermMemory = memoryManager.getShortTermMemory();
            const recentChapters = await shortTermMemory.getRecentChapters();

            if (recentChapters && recentChapters.length > 0) {
                // 章情報の型を定義
                interface ChapterInfo {
                    chapter: {
                        chapterNumber: number;
                        [key: string]: any;
                    };
                    [key: string]: any;
                }

                // 最新のチャプター番号を返す
                const latestChapter = recentChapters.reduce((latest: ChapterInfo, current: ChapterInfo) =>
                    current.chapter.chapterNumber > latest.chapter.chapterNumber ? current : latest
                );

                return latestChapter.chapter.chapterNumber;
            }

            // チャプターが見つからない場合は1を返す
            return 1;
        } catch (error) {
            logger.error('最新章番号の取得に失敗しました', {
                error: error instanceof Error ? error.message : String(error)
            });
            return 1; // エラー時は1を返す
        }
    }

    /**
     * 進行度に基づくデフォルトのテンション値を取得
     * @param progress 進行度（0-1）
     * @returns テンション値（0-1）
     */
    private getDefaultTensionByProgress(progress: number): number {
        // ジャンルに応じたテンションテンプレート
        const tensionTemplates: { [genre: string]: number[] } = {
            classic: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.7, 0.9, 0.95, 0.6, 0.3],
            mystery: [0.5, 0.6, 0.5, 0.7, 0.6, 0.7, 0.8, 0.7, 0.9, 0.95, 0.6],
            romance: [0.4, 0.5, 0.6, 0.4, 0.7, 0.5, 0.6, 0.8, 0.7, 0.9, 0.5],
            thriller: [0.6, 0.7, 0.6, 0.8, 0.7, 0.8, 0.9, 0.8, 0.95, 0.9, 0.7],
            fantasy: [0.4, 0.5, 0.6, 0.7, 0.6, 0.8, 0.7, 0.9, 0.95, 0.7, 0.5],
            business: [0.4, 0.5, 0.6, 0.7, 0.5, 0.8, 0.6, 0.9, 0.7, 0.95, 0.6]
        };

        // ジャンルに応じたテンプレートを選択（なければclassicを使用）
        const template = tensionTemplates[this.genre.toLowerCase()] || tensionTemplates.classic;

        // 進行度に応じた位置を計算
        const position = Math.min(Math.floor(progress * 10), 10);
        return template[position];
    }

    /**
     * すべてのターニングポイントを取得
     * @returns ターニングポイントの配列
     */
    getTurningPoints(): TurningPoint[] {
        return [...this.turningPoints];
    }

    /**
     * 特定の章のターニングポイントを取得
     * @param chapterNumber 章番号
     * @returns ターニングポイント（存在しない場合はnull）
     */
    getTurningPointForChapter(chapterNumber: number): TurningPoint | null {
        return this.turningPoints.find(tp => tp.chapter === chapterNumber) || null;
    }

    /**
     * ジャンルを設定
     * @param genre ジャンル
     */
    setGenre(genre: string): void {
        this.genre = genre;
        logger.debug(`ジャンルを "${genre}" に設定しました`);
    }

    /**
     * 現在のジャンルを取得
     * @returns ジャンル
     */
    getGenre(): string {
        return this.genre;
    }

    /**
     * 現在のテンションレベルを取得
     * @returns テンションレベル（0-10）
     */
    getCurrentTensionLevel(): number {
        // 最新のテンションポイントを取得
        if (this.lastUpdatedChapter > 0) {
            const tension = this.tensionHistory.get(this.lastUpdatedChapter);
            if (tension !== undefined) {
                return Math.round(tension * 10);
            }
        }

        // 履歴がない場合はデフォルト値
        return 5;
    }

    /**
     * 章の要約を取得
     * @param chapterNumber 章番号
     * @returns 要約テキスト（存在しない場合はnull）
     */
    getChapterSummary(chapterNumber: number): string | null {
        return this.chapterSummaries.get(chapterNumber) || null;
    }
}