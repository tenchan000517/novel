// src/lib/plot/story-generation-bridge.ts

import { memoryManager } from '@/lib/memory/manager';
import {
    ChapterDirectives, CharacterState, StoryGenerationContext,
    BridgeAnalysisResult, PromptElements, PlotProgressInfo
} from './bridge-types';
import { ConcretePlotPoint, AbstractPlotGuideline } from './types';
import { Chapter } from '@/types/chapters';
import { logger } from '@/lib/utils/logger';
import { EmotionalCurvePoint } from '@/lib/memory/types';
import { NarrativeState, NarrativeStateInfo } from '@/lib/memory/narrative/types';

import { KeyEvent } from '@/types/memory';

/**
 * @class StoryGenerationBridge
 * @description
 * 物語生成プロセスにおいて、プロットデータと記憶システムの情報を橋渡しし、
 * 次のチャプター生成に必要な具体的指示を提供するクラス。
 * これは物語の進行をより効果的にコントロールするためのハブ機能を提供します。
 * 
 * @role
 * - 長期・短期プロットと実際の物語進行（記憶）の間を橋渡し
 * - 次のチャプター生成に必要な情報を選別・整理
 * - プロンプトのプレースホルダーに挿入する具体的内容を提供
 */
export class StoryGenerationBridge {
    /**
     * 章の生成に必要な指示を生成する
     * @param chapterNumber 対象の章番号
     * @param concretePlot 具体的プロット
     * @param abstractGuideline 抽象的ガイドライン
     * @param midTermPlot 中期プロット（オプション）
     * @param narrativeState 物語状態情報
     * @param phaseInfo 物語フェーズ情報（オプション）
     * @returns 章指示情報
     */
    async generateChapterDirectives(
        chapterNumber: number,
        concretePlot: ConcretePlotPoint | null,
        abstractGuideline: AbstractPlotGuideline,
        narrativeState: NarrativeStateInfo | null = null,
        phaseInfo: any = null
    ): Promise<ChapterDirectives> {
        try {
            logger.info(`[StoryGenerationBridge] 章${chapterNumber}の指示を生成します`);

            // 記憶システムから情報を取得
            const memoryState = await this.fetchMemoryState(chapterNumber);

            // 最新の物語状態を取得（引数で渡されていない場合）
            if (!narrativeState) {
                narrativeState = memoryState.narrativeState;
            }

            // 統合分析を実行
            const analysisResult = this.analyzeContext({
                chapterNumber,
                plotElements: {
                    concrete: concretePlot,
                    abstract: abstractGuideline,
                },
                memoryElements: memoryState,
                worldSettings: await this.fetchWorldSettings(),
                themeSettings: await this.fetchThemeSettings(),
                phaseInfo
            });

            // 章の目標を設定
            const chapterGoal = this.determineChapterGoal(
                concretePlot,
                abstractGuideline,
                analysisResult,
                phaseInfo
            );

            // 必須プロット要素を抽出
            const requiredPlotElements = this.extractRequiredPlotElements(
                concretePlot,
                abstractGuideline,
                analysisResult
            );

            // 現在の場所を決定
            const currentLocation = this.determineCurrentLocation(narrativeState, concretePlot);

            // 現在の状況を記述
            const currentSituation = this.determineCurrentSituation(narrativeState, memoryState.shortTerm);

            // 活動中のキャラクターを特定
            const activeCharacters = await this.identifyActiveCharacters(
                chapterNumber,
                concretePlot,
                memoryState
            );

            // 世界設定の焦点を決定
            const worldElementsFocus = this.determineWorldElementsFocus(
                concretePlot,
                abstractGuideline,
                memoryState
            );

            // テーマ的焦点を決定
            const thematicFocus = this.determineThematicFocus(
                abstractGuideline,
                analysisResult
            );

            // 感情曲線を取得
            const emotionalCurve = await this.fetchEmotionalCurve(chapterNumber);

            // 結果の構築
            const directives: ChapterDirectives = {
                chapterGoal,
                requiredPlotElements,
                currentLocation,
                currentSituation,
                activeCharacters,
                worldElementsFocus,
                thematicFocus,
                narrativeState,
                tension: narrativeState.tensionLevel || this.calculateRecommendedTension(analysisResult, narrativeState),
                emotionalGoal: this.determineEmotionalGoal(abstractGuideline, narrativeState, analysisResult),
                emotionalCurve
            };

            // 提案シーンを追加（オプション）
            if (analysisResult.suggestedAdjustments.length > 0) {
                directives.suggestedScenes = this.suggestScenes(
                    concretePlot,
                    abstractGuideline,
                    narrativeState,
                    analysisResult
                );
            }

            logger.debug(`[StoryGenerationBridge] 章${chapterNumber}の指示生成完了`, {
                chapterGoal: directives.chapterGoal,
                elementsCount: directives.requiredPlotElements.length,
                charactersCount: directives.activeCharacters.length
            });

            return directives;
        } catch (error) {
            logger.error(`[StoryGenerationBridge] 章${chapterNumber}の指示生成中にエラーが発生しました`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            // エラー発生時のフォールバック
            return this.generateFallbackDirectives(chapterNumber, abstractGuideline, narrativeState);
        }
    }

    /**
     * 記憶システムから状態を取得
     * @param chapterNumber 章番号
     * @returns 記憶状態
     */
    private async fetchMemoryState(chapterNumber: number): Promise<{
        shortTerm: any,
        midTerm: any,
        longTerm: any,
        narrativeState: NarrativeStateInfo
    }> {
        try {
            // 短期記憶からの情報取得
            const shortTermMemory = memoryManager.getShortTermMemory();
            const recentChapters = await shortTermMemory.getRecentChapters(5);
            const currentChapter = await shortTermMemory.getChapter(chapterNumber - 1); // 前の章を取得

            // 中期記憶からの情報取得
            const midTermMemory = memoryManager.getMidTermMemory();
            const currentArc = await memoryManager.getCurrentArc(chapterNumber);

            // 長期記憶からの情報取得 
            const longTermMemory = memoryManager.getLongTermMemory();
            const summaries = await longTermMemory.getSummaries();

            // 重要イベントの取得
            const importantEvents = await memoryManager.getImportantEvents(
                Math.max(1, chapterNumber - 10),
                chapterNumber - 1
            );

            // 物語状態の取得
            const narrativeState = await memoryManager.getNarrativeState(chapterNumber);

            return {
                shortTerm: {
                    recentChapters,
                    currentChapter,
                    importantEvents
                },
                midTerm: {
                    currentArc
                },
                longTerm: {
                    summaries
                },
                narrativeState
            };
        } catch (error) {
            logger.error('記憶状態の取得に失敗しました', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            // エラー時のフォールバック
            return {
                shortTerm: { recentChapters: [], currentChapter: null, importantEvents: [] },
                midTerm: { currentArc: null },
                longTerm: { summaries: [] },
                narrativeState: this.createDefaultNarrativeState(chapterNumber)
            };
        }
    }

    /**
     * 感情曲線データを取得
     * @param chapterNumber 章番号
     * @returns 感情曲線データ
     */
    private async fetchEmotionalCurve(chapterNumber: number): Promise<EmotionalCurvePoint[] | undefined> {
        try {
            // メモリマネージャーから感情曲線を取得
            const startChapter = Math.max(1, chapterNumber - 5);
            return await memoryManager.getEmotionalCurve(startChapter, chapterNumber - 1);
        } catch (error) {
            logger.error('感情曲線の取得に失敗しました', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });
            return undefined;
        }
    }

    /**
     * 世界設定を取得
     * @returns 世界設定情報
     */
    private async fetchWorldSettings(): Promise<any> {
        try {
            // プロットマネージャーから世界設定を取得する
            // この実装は外部から注入またはプロットマネージャーへの統合時に実装
            return {}; // 仮の実装
        } catch (error) {
            logger.error('世界設定の取得に失敗しました', {
                error: error instanceof Error ? error.message : String(error)
            });
            return {}; // エラー時は空オブジェクト
        }
    }

    /**
     * テーマ設定を取得
     * @returns テーマ設定情報
     */
    private async fetchThemeSettings(): Promise<any> {
        try {
            // プロットマネージャーからテーマ設定を取得する
            // この実装は外部から注入またはプロットマネージャーへの統合時に実装
            return {}; // 仮の実装
        } catch (error) {
            logger.error('テーマ設定の取得に失敗しました', {
                error: error instanceof Error ? error.message : String(error)
            });
            return {}; // エラー時は空オブジェクト
        }
    }

    /**
     * 統合コンテキストの分析を行う
     * @param context 統合コンテキスト
     * @returns 分析結果
     */
    private analyzeContext(context: StoryGenerationContext): BridgeAnalysisResult {
        // 実際にはもっと複雑な分析ロジックが入る
        const { chapterNumber, plotElements, memoryElements, phaseInfo } = context;

        // プロット進行の一致度計算（仮の実装）
        const plotProgressAlignment = this.calculatePlotAlignment(
            plotElements.concrete,
            memoryElements.shortTerm.importantEvents || []
        );

        // テンション投影の計算
        const tensionProjection = this.projectTension(
            memoryElements.narrativeState.tensionLevel || 5,
            plotElements.abstract,
            phaseInfo
        );

        // 次に重要な要素の特定
        const keyElementsForNext = this.identifyKeyElements(context);

        // 物語の方向性決定
        const narrativeDirection = this.determineNarrativeDirection(context);

        // 提案される調整を生成
        const suggestedAdjustments = this.generateSuggestedAdjustments(context);

        // 継続性を保つべき要素
        const continuityElements = this.identifyContinuityElements(context);

        // 推奨されるペース
        const recommendedPacing = this.determinePacing(context);

        // 分析結果の構築
        return {
            plotProgressAlignment,
            suggestedAdjustments,
            keyElementsForNext,
            narrativeDirection,
            tensionProjection,
            continuityElements,
            recommendedPacing
        };
    }

    /**
     * プロット進行の一致度を計算
     * @param concretePlot 具体的プロット
     * @param importantEvents 重要イベント
     * @returns 一致度 (0-1)
     */
    private calculatePlotAlignment(
        concretePlot: ConcretePlotPoint | null,
        importantEvents: KeyEvent[]
    ): number {
        if (!concretePlot || !concretePlot.keyEvents || concretePlot.keyEvents.length === 0) {
            return 0.5; // 中程度の一致度をデフォルトとする
        }

        // 実際には重要イベントとプロット要素の一致度を計算するロジック
        // ここでは簡単な実装
        const defaultAlignment = 0.75; // デフォルトの一致度

        return defaultAlignment;
    }

    /**
     * テンションを予測
     * @param currentTension 現在のテンション
     * @param abstractGuideline 抽象ガイドライン
     * @param phaseInfo フェーズ情報
     * @returns 予測テンション
     */
    private projectTension(
        currentTension: number,
        abstractGuideline: AbstractPlotGuideline,
        phaseInfo: any
    ): number {
        // フェーズ情報に基づく調整
        let projectedTension = currentTension;

        if (phaseInfo) {
            if (phaseInfo.phase === 'CLIMAX') {
                // クライマックスフェーズでは高いテンション
                projectedTension = Math.max(8, currentTension);
            } else if (phaseInfo.phase === 'ENDING') {
                // エンディングフェーズでは低下傾向
                projectedTension = Math.min(7, currentTension);
            } else if (phaseInfo.isTransitionPoint) {
                // 移行点では軽い上昇
                projectedTension = Math.min(10, currentTension + 1);
            }
        }

        // 感情トーンによる調整
        if (abstractGuideline.emotionalTone) {
            if (abstractGuideline.emotionalTone.includes('緊張') ||
                abstractGuideline.emotionalTone.includes('危機')) {
                projectedTension = Math.min(10, projectedTension + 1);
            } else if (abstractGuideline.emotionalTone.includes('穏やか') ||
                abstractGuideline.emotionalTone.includes('平和')) {
                projectedTension = Math.max(1, projectedTension - 1);
            }
        }

        // 1-10の範囲に収める
        return Math.max(1, Math.min(10, Math.round(projectedTension)));
    }

    /**
     * 重要な要素を特定
     * @param context コンテキスト
     * @returns 重要な要素
     */
    private identifyKeyElements(context: StoryGenerationContext): string[] {
        const { plotElements, memoryElements, phaseInfo } = context;
        const keyElements: string[] = [];

        // 具体的プロットからの要素
        if (plotElements.concrete) {
            // requiredElementsの中から重要なものを抽出
            if (plotElements.concrete.requiredElements && plotElements.concrete.requiredElements.length > 0) {
                keyElements.push(...plotElements.concrete.requiredElements.slice(0, 3));
            }

            // keyEventsから重要なものを抽出
            if (plotElements.concrete.keyEvents && plotElements.concrete.keyEvents.length > 0) {
                keyElements.push(...plotElements.concrete.keyEvents.slice(0, 2));
            }
        }

        // 抽象ガイドラインからの要素
        if (plotElements.abstract && plotElements.abstract.potentialDirections) {
            const selectedDirection = plotElements.abstract.potentialDirections[0];
            if (selectedDirection) {
                keyElements.push(selectedDirection);
            }
        }

        // フェーズ情報からの要素
        if (phaseInfo) {
            if (phaseInfo.phase === 'CLIMAX') {
                keyElements.push('重要な対決または課題の解決');
            } else if (phaseInfo.phase === 'ENDING') {
                keyElements.push('物語の主要テーマの集約');
            } else if (phaseInfo.isTransitionPoint) {
                keyElements.push('次のフェーズへの自然な移行');
            }
        }

        // 重複を排除
        return [...new Set(keyElements)];
    }

    /**
     * 物語の方向性を決定
     * @param context コンテキスト
     * @returns 物語の方向性
     */
    private determineNarrativeDirection(context: StoryGenerationContext): string {
        const { plotElements, memoryElements, phaseInfo } = context;

        // 具体的プロットの目標を優先
        if (plotElements.concrete && plotElements.concrete.storyGoal) {
            return plotElements.concrete.storyGoal;
        }

        // フェーズに基づく方向性
        if (phaseInfo) {
            if (phaseInfo.phase === 'EARLY') {
                return '物語の基盤を確立し、キャラクターの動機を明確化する';
            } else if (phaseInfo.phase === 'MIDDLE') {
                return '葛藤を深め、キャラクターの成長を促進する';
            } else if (phaseInfo.phase === 'LATE') {
                return 'サブプロットを解決に向かわせ、クライマックスへの準備を整える';
            } else if (phaseInfo.phase === 'CLIMAX') {
                return '中心的な葛藤の解決と主要キャラクターの変化を描く';
            } else if (phaseInfo.phase === 'ENDING') {
                return '物語の結末を示し、変化したキャラクターと世界の姿を描く';
            }
        }

        // 抽象ガイドラインのテーマに基づく方向性
        if (plotElements.abstract) {
            return `${plotElements.abstract.theme}を探求しながら物語を発展させる`;
        }

        // デフォルトの方向性
        return '物語の自然な展開を継続する';
    }

    /**
     * 提案される調整を生成
     * @param context コンテキスト
     * @returns 提案される調整
     */
    private generateSuggestedAdjustments(context: StoryGenerationContext): string[] {
        const { plotElements, memoryElements, chapterNumber, phaseInfo } = context;
        const adjustments: string[] = [];

        // 物語の停滞が検出された場合
        if (memoryElements.narrativeState.stagnationDetected) {
            adjustments.push('物語の進展を加速させるため、新しい課題または情報を導入する');
        }

        // テンションレベルに基づく調整
        const tensionLevel = memoryElements.narrativeState.tensionLevel || 5;
        if (tensionLevel < 3 && chapterNumber > 3) {
            adjustments.push('物語の緊張感を高めるため、対立要素や障害を導入する');
        } else if (tensionLevel > 8 && phaseInfo && phaseInfo.phase !== 'CLIMAX') {
            adjustments.push('持続的な高テンションを避けるため、静的なシーンや内省の瞬間を含める');
        }

        // 具体的プロットと記憶の整合性に基づく調整
        const plotAlignment = this.calculatePlotAlignment(
            plotElements.concrete,
            memoryElements.shortTerm.importantEvents || []
        );

        if (plotAlignment < 0.6) {
            adjustments.push('プロット設計と実際の展開の整合性を高めるため、計画された要素の再導入を検討する');
        }

        // フェーズ特有の調整
        if (phaseInfo) {
            if (phaseInfo.isTransitionPoint) {
                adjustments.push(`次のフェーズ「${phaseInfo.nextPhase}」への移行を準備するための要素を含める`);
            }
        }

        return adjustments;
    }

    /**
     * 継続性を保つべき要素を特定
     * @param context コンテキスト
     * @returns 継続性を保つべき要素
     */
    private identifyContinuityElements(context: StoryGenerationContext): string[] {
        const { memoryElements } = context;
        const elements: string[] = [];

        // 最近の章からの重要な継続要素
        if (memoryElements.shortTerm.currentChapter) {
            // 抽出ロジック（実装省略）
            elements.push('前章から継続する状況や会話');
        }

        // 重要イベントに関連する継続要素
        if (memoryElements.shortTerm.importantEvents && memoryElements.shortTerm.importantEvents.length > 0) {
            const recentEvents = memoryElements.shortTerm.importantEvents
                .slice(-3) // 最新の3つのイベント
                .map((event: KeyEvent) => event.event); // descriptionではなくeventプロパティを使用

            elements.push(...recentEvents.map((e: string) => `「${e}」の影響や結果`));
        }

        return elements;
    }

    /**
     * 推奨されるペースを決定
     * @param context コンテキスト
     * @returns 推奨されるペース
     */
    private determinePacing(context: StoryGenerationContext): string {
        const { memoryElements, phaseInfo } = context;

        // フェーズに基づくペース
        if (phaseInfo) {
            if (phaseInfo.phase === 'EARLY') {
                return '情報と設定を丁寧に展開する控えめなペース';
            } else if (phaseInfo.phase === 'MIDDLE') {
                return '複雑さと深みを加えながら、安定したペースで進行';
            } else if (phaseInfo.phase === 'LATE') {
                return '展開を加速させ、クライマックスに向けたペースアップ';
            } else if (phaseInfo.phase === 'CLIMAX') {
                return '重要なイベントを効果的に描写する、緊張感のある速いペース';
            } else if (phaseInfo.phase === 'ENDING') {
                return '結論と解決を丁寧に描く、落ち着いたペース';
            }
        }

        // テンションレベルに基づくペース
        const tensionLevel = memoryElements.narrativeState.tensionLevel || 5;
        if (tensionLevel >= 8) {
            return '緊張感を維持する速いペース';
        } else if (tensionLevel <= 3) {
            return '情景や感情を描写する余裕を持った穏やかなペース';
        }

        // デフォルトのペース
        return 'バランスの取れた標準的なペース';
    }

    /**
     * 章の目標を決定
     * @param concretePlot 具体的プロット
     * @param abstractGuideline 抽象的ガイドライン
     * @param analysisResult 分析結果
     * @param phaseInfo フェーズ情報
     * @returns 章の目標
     */
    private determineChapterGoal(
        concretePlot: ConcretePlotPoint | null,
        abstractGuideline: AbstractPlotGuideline,
        analysisResult: BridgeAnalysisResult,
        phaseInfo: any = null
    ): string {
        // 具体的プロットが存在する場合、そこから目標を設定
        if (concretePlot && concretePlot.storyGoal) {
            return concretePlot.storyGoal;
        }

        // フェーズ情報がある場合、それに基づいた目標
        if (phaseInfo) {
            if (phaseInfo.isTransitionPoint) {
                return `現在のフェーズ「${phaseInfo.phase}」を締めくくり、次のフェーズ「${phaseInfo.nextPhase}」への移行を準備する`;
            }

            // フェーズに基づく目標
            if (phaseInfo.phase === 'EARLY') {
                return `${abstractGuideline.theme}の基盤を確立し、キャラクターと世界を発展させる`;
            } else if (phaseInfo.phase === 'MIDDLE') {
                return `${abstractGuideline.theme}に関する葛藤を深め、物語の複雑さを増す`;
            } else if (phaseInfo.phase === 'LATE') {
                return `クライマックスに向け${abstractGuideline.theme}の解決への道筋を作る`;
            } else if (phaseInfo.phase === 'CLIMAX') {
                return `${abstractGuideline.theme}における中心的な葛藤の解決を描く`;
            } else if (phaseInfo.phase === 'ENDING') {
                return `${abstractGuideline.theme}の探求を締めくくり、変化した世界と登場人物を描く`;
            }
        }

        // 分析結果からの方向性
        if (analysisResult.narrativeDirection) {
            return analysisResult.narrativeDirection;
        }

        // 具体的プロットがない、または目標がない場合は抽象ガイドラインから作成
        return `${abstractGuideline.theme}を中心に、${abstractGuideline.emotionalTone}の雰囲気で物語を進展させる`;
    }

    /**
     * 必須プロット要素を抽出
     * @param concretePlot 具体的プロット
     * @param abstractGuideline 抽象的ガイドライン
     * @param midTermPlot 中期プロット
     * @param analysisResult 分析結果
     * @returns 必須プロット要素
     */
    private extractRequiredPlotElements(
        concretePlot: ConcretePlotPoint | null,
        abstractGuideline: AbstractPlotGuideline,
        analysisResult: BridgeAnalysisResult
    ): string[] {
        const elements = [];

        // 具体的プロットからの要素
        if (concretePlot) {
            if (concretePlot.keyEvents && concretePlot.keyEvents.length > 0) {
                elements.push(...concretePlot.keyEvents);
            }

            if (concretePlot.requiredElements && concretePlot.requiredElements.length > 0) {
                elements.push(...concretePlot.requiredElements);
            }

            // 必須の結果があれば追加
            if (concretePlot.mustHaveOutcome) {
                elements.push(`必須の結果: ${concretePlot.mustHaveOutcome}`);
            }
        }

        // 抽象ガイドラインからの方向性
        if (abstractGuideline.potentialDirections && abstractGuideline.potentialDirections.length > 0) {
            // 可能性のある方向性から1つ選択
            const selectedDirection = abstractGuideline.potentialDirections[0];
            elements.push(`${selectedDirection}への展開`);
        }

        // 抽象ガイドラインからのテーマ的メッセージ
        if (abstractGuideline.thematicMessage) {
            elements.push(`テーマのメッセージ: ${abstractGuideline.thematicMessage}`);
        }

        // 分析結果からの重要要素
        if (analysisResult.keyElementsForNext && analysisResult.keyElementsForNext.length > 0) {
            elements.push(...analysisResult.keyElementsForNext);
        }

        // 継続性の要素
        if (analysisResult.continuityElements && analysisResult.continuityElements.length > 0) {
            elements.push(...analysisResult.continuityElements);
        }

        // 重複を排除
        return [...new Set(elements)];
    }

    /**
     * 現在の場所を決定
     * @param narrativeState 物語状態
     * @param concretePlot 具体的プロット
     * @returns 現在の場所
     */
    private determineCurrentLocation(
        narrativeState: NarrativeStateInfo | null,
        concretePlot: ConcretePlotPoint | null
    ): string {
        // 物語状態からの場所情報
        if (narrativeState && narrativeState.location) {
            // 詳細化
            const timeDesc = narrativeState.timeOfDay ? `${narrativeState.timeOfDay}の` : '';
            const weatherDesc = narrativeState.weather ? `${narrativeState.weather}の` : '';
            return `${timeDesc}${weatherDesc}${narrativeState.location}`;
        }

        // 具体的プロットから場所を推論（実装は簡易化）
        if (concretePlot && concretePlot.requiredElements) {
            const locationElement = concretePlot.requiredElements.find(
                e => e.includes('場所') || e.includes('ロケーション') || e.includes('舞台')
            );

            if (locationElement) {
                return locationElement;
            }
        }

        // フォールバック
        return "前章から継続する場所";
    }

    /**
     * 現在の状況を決定
     * @param narrativeState 物語状態
     * @param shortTermMemory 短期記憶
     * @returns 現在の状況
     */
    private determineCurrentSituation(
        narrativeState: NarrativeStateInfo | null,
        shortTermMemory: any
    ): string {
        if (!narrativeState) {
            return "物語の進行中の状況";
        }

        // 物語状態からの情報を組み合わせて状況を構築
        const tensionDesc = this.getTensionDescription(narrativeState.tensionLevel || 5);
        const stateDesc = this.getStateDescription(narrativeState.state);

        let situation = `現在${stateDesc}の状態で、${tensionDesc}雰囲気が漂っています。`;

        // 停滞が検出されているか
        if (narrativeState.stagnationDetected) {
            situation += " 物語は停滞気味で、新たな展開が求められています。";
        }

        // アーク情報があれば追加
        if (narrativeState.currentTheme) {
            situation += ` 「${narrativeState.currentTheme}」というテーマを探求中です。`;
        }

        // 重要イベントがあれば最新のものを追加
        if (shortTermMemory.importantEvents && shortTermMemory.importantEvents.length > 0) {
            const latestEvent = shortTermMemory.importantEvents[shortTermMemory.importantEvents.length - 1];
            if (latestEvent && latestEvent.description) {
                situation += ` 最近の重要な出来事として「${latestEvent.description}」があります。`;
            }
        }

        return situation;
    }

    /**
     * 緊張度の説明を取得
     * @param tensionLevel 緊張度
     * @returns 緊張度の説明
     */
    private getTensionDescription(tensionLevel: number): string {
        if (tensionLevel >= 8) return "非常に緊迫した";
        if (tensionLevel >= 6) return "緊張感のある";
        if (tensionLevel >= 4) return "やや緊張した";
        if (tensionLevel >= 2) return "比較的穏やかな";
        return "落ち着いた";
    }

    /**
     * 状態の説明を取得
     * @param state 状態
     * @returns 状態の説明
     */
    private getStateDescription(state: string): string {
        // 状態の文字列表現をより自然な説明に変換
        const stateMap: { [key: string]: string } = {
            "INTRODUCTION": "物語の導入",
            "DAILY_LIFE": "日常生活",
            "JOURNEY": "旅の途中",
            "PRE_BATTLE": "対決の前",
            "BATTLE": "対決の最中",
            "POST_BATTLE": "対決の後",
            "INVESTIGATION": "調査",
            "TRAINING": "訓練",
            "REVELATION": "真実の発覚",
            "DILEMMA": "葛藤",
            "RESOLUTION": "解決",
            "CLOSURE": "締めくくり",

            // ビジネス関連
            "BUSINESS_MEETING": "ビジネスミーティング",
            "PRODUCT_DEVELOPMENT": "製品開発",
            "PITCH_PRESENTATION": "ピッチプレゼン",
            "MARKET_RESEARCH": "市場調査",
            "TEAM_BUILDING": "チーム構築",
            "FUNDING_ROUND": "資金調達",
            "BUSINESS_PIVOT": "ビジネスピボット",
            "CUSTOMER_DISCOVERY": "顧客発見",
            "PRODUCT_LAUNCH": "製品ローンチ",
            "MARKET_COMPETITION": "市場競争",
            "STRATEGIC_PREPARATION": "戦略準備",
            "PERFORMANCE_REVIEW": "成果評価",
            "BUSINESS_DEVELOPMENT": "事業開発",
            "SKILL_DEVELOPMENT": "能力開発",
            "FINANCIAL_CHALLENGE": "財務的課題",
            "EXPANSION_PHASE": "拡大フェーズ",
            "ACQUISITION_NEGOTIATION": "買収交渉",
            "CULTURE_BUILDING": "文化構築",
            "CRISIS_MANAGEMENT": "危機管理",
            "MARKET_ENTRY": "市場参入",
            "REGULATORY_COMPLIANCE": "規制対応",
            "PARTNERSHIP_DEVELOPMENT": "パートナーシップ開発",
            "MARKET_SCALING": "市場スケーリング"
        };

        return stateMap[state] || state;
    }

    /**
     * 活動中のキャラクターを特定
     * @param chapterNumber 章番号
     * @param concretePlot 具体的プロット
     * @param memoryState 記憶状態
     * @returns 活動中のキャラクター
     */
    private async identifyActiveCharacters(
        chapterNumber: number,
        concretePlot: ConcretePlotPoint | null,
        memoryState: any
    ): Promise<CharacterState[]> {
        const characterStates: CharacterState[] = [];

        // 具体的プロットのキャラクターフォーカス
        if (concretePlot && concretePlot.characterFocus && concretePlot.characterFocus.length > 0) {
            concretePlot.characterFocus.forEach(character => {
                characterStates.push({
                    name: character,
                    currentState: "プロットに指定",
                    role: "焦点キャラクター"
                });
            });
        }

        // 物語状態の現在のキャラクター
        if (memoryState.narrativeState.presentCharacters) {
            memoryState.narrativeState.presentCharacters.forEach((character: string) => {
                // 既に追加されていないか確認
                if (!characterStates.some(c => c.name === character)) {
                    characterStates.push({
                        name: character,
                        currentState: "現在のシーンに登場",
                        role: "シーン参加者"
                    });
                }
            });
        }

        // キャラクターマネージャーから詳細情報を取得する場合は追加実装

        return characterStates;
    }

    /**
     * 世界設定の焦点を決定
     * @param concretePlot 具体的プロット
     * @param abstractGuideline 抽象的ガイドライン
     * @param memoryState 記憶状態
     * @returns 世界設定の焦点
     */
    private determineWorldElementsFocus(
        concretePlot: ConcretePlotPoint | null,
        abstractGuideline: AbstractPlotGuideline,
        memoryState: any
    ): string[] {
        const elements: string[] = [];

        // 具体的プロットから関連する世界設定要素を抽出
        if (concretePlot && concretePlot.requiredElements && concretePlot.requiredElements.length > 0) {
            // 世界設定に関連する要素をフィルタリング
            const worldElements = concretePlot.requiredElements.filter(
                e => e.includes("世界") || e.includes("設定") || e.includes("場所") || e.includes("環境")
            );

            if (worldElements.length > 0) {
                elements.push(...worldElements);
            }
        }

        // 抽象ガイドラインから世界設定関連の要素を抽出
        if (abstractGuideline.potentialDirections && abstractGuideline.potentialDirections.length > 0) {
            // 世界設定に関連する方向性を抽出
            const worldDirections = abstractGuideline.potentialDirections.filter(
                d => d.includes("世界") || d.includes("設定") || d.includes("環境")
            );

            if (worldDirections.length > 0) {
                elements.push(...worldDirections);
            }
        }

        // 物語状態から関連要素を抽出
        // 例：場所、時間帯、天候などを組み合わせた環境描写
        if (memoryState.narrativeState) {
            const { location, timeOfDay, weather } = memoryState.narrativeState;
            if (location && timeOfDay && weather) {
                elements.push(`${timeOfDay}の${weather}の${location}の雰囲気`);
            }
        }

        // 中期記憶からのアーク関連の世界設定
        if (memoryState.midTerm.currentArc && memoryState.midTerm.currentArc.setting) {
            elements.push(`アーク「${memoryState.midTerm.currentArc.name}」における世界設定の要素`);
        }

        // 十分な要素がなければデフォルト追加
        if (elements.length === 0) {
            elements.push("現在の場所と時代の設定を自然に描写");
            elements.push("物語の雰囲気に合った環境描写");
        }

        return [...new Set(elements)]; // 重複排除
    }

    /**
     * テーマ的焦点を決定
     * @param abstractGuideline 抽象的ガイドライン
     * @param analysisResult 分析結果
     * @returns テーマ的焦点
     */
    private determineThematicFocus(
        abstractGuideline: AbstractPlotGuideline,
        analysisResult: BridgeAnalysisResult
    ): string[] {
        // 基本的にはガイドラインのテーマを使用
        const thematic = [abstractGuideline.theme];

        // テーマ的メッセージがあれば追加
        if (abstractGuideline.thematicMessage) {
            thematic.push(abstractGuideline.thematicMessage);
        }

        // フェーズの目的があれば追加
        if (abstractGuideline.phasePurpose) {
            thematic.push(abstractGuideline.phasePurpose);
        }

        // 感情的トーンを追加
        thematic.push(`${abstractGuideline.emotionalTone}の雰囲気を維持`);

        // 分析結果からの方向性があれば追加
        if (analysisResult.narrativeDirection) {
            thematic.push(analysisResult.narrativeDirection);
        }

        return thematic;
    }

    /**
     * 推奨テンションを計算
     * @param analysisResult 分析結果
     * @param narrativeState 物語状態
     * @returns 推奨テンション
     */
    private calculateRecommendedTension(
        analysisResult: BridgeAnalysisResult,
        narrativeState: NarrativeStateInfo | null
    ): number {
        // 分析結果の投影値を基本として使用
        let tension = analysisResult.tensionProjection;

        // 現在のテンションがあれば考慮
        if (narrativeState && narrativeState.tensionLevel) {
            // 現在値と投影値の平均を取る（滑らかな変化のため）
            tension = (tension + narrativeState.tensionLevel) / 2;
        }

        return Math.round(tension);
    }

    /**
     * 感情的目標を決定
     * @param abstractGuideline 抽象的ガイドライン
     * @param narrativeState 物語状態
     * @param analysisResult 分析結果
     * @returns 感情的目標
     */
    private determineEmotionalGoal(
        abstractGuideline: AbstractPlotGuideline,
        narrativeState: NarrativeStateInfo | null,
        analysisResult: BridgeAnalysisResult
    ): string {
        // 抽象ガイドラインの感情的トーンをベースに
        const emotionalBase = abstractGuideline.emotionalTone;

        // テンションレベルに応じた調整
        const tensionLevel = narrativeState?.tensionLevel || analysisResult.tensionProjection;
        let intensityModifier = "";

        if (tensionLevel >= 8) {
            intensityModifier = "激しい";
        } else if (tensionLevel >= 6) {
            intensityModifier = "強い";
        } else if (tensionLevel <= 3) {
            intensityModifier = "穏やかな";
        }

        return intensityModifier ? `${intensityModifier}${emotionalBase}` : emotionalBase;
    }

    /**
     * シーンを提案
     * @param concretePlot 具体的プロット
     * @param abstractGuideline 抽象的ガイドライン
     * @param narrativeState 物語状態
     * @param analysisResult 分析結果
     * @returns 提案シーン
     */
    private suggestScenes(
        concretePlot: ConcretePlotPoint | null,
        abstractGuideline: AbstractPlotGuideline,
        narrativeState: NarrativeStateInfo | null,
        analysisResult: BridgeAnalysisResult
    ): string[] {
        // 提案する潜在的なシーン
        const potentialScenes: string[] = [];

        // 具体的プロットからのシーン提案
        if (concretePlot && concretePlot.keyEvents && concretePlot.keyEvents.length > 0) {
            concretePlot.keyEvents.forEach(event => {
                potentialScenes.push(`${event}を中心としたシーン`);
            });
        }

        // 抽象ガイドラインからのシーン提案
        if (abstractGuideline.potentialDirections && abstractGuideline.potentialDirections.length > 0) {
            abstractGuideline.potentialDirections.forEach(direction => {
                potentialScenes.push(`${direction}に焦点を当てたシーン`);
            });
        }

        // 物語状態からのシーン提案
        if (narrativeState) {
            // 状態に基づく典型的なシーンを提案
            switch (narrativeState.state) {
                case "BATTLE":
                case "MARKET_COMPETITION":
                    potentialScenes.push("緊迫した対決シーン");
                    break;
                case "REVELATION":
                    potentialScenes.push("重要な真実が明らかになるシーン");
                    break;
                case "JOURNEY":
                case "BUSINESS_DEVELOPMENT":
                    potentialScenes.push("新しい展開への移行シーン");
                    break;
                case "DILEMMA":
                    potentialScenes.push("内的葛藤や決断のシーン");
                    break;
                case "DAILY_LIFE":
                    potentialScenes.push("日常の中で重要な会話や気づきのシーン");
                    break;
                case "RESOLUTION":
                    potentialScenes.push("問題解決への一歩を示すシーン");
                    break;
            }
        }

        // 分析結果からのシーン提案
        if (analysisResult.recommendedPacing) {
            potentialScenes.push(`${analysisResult.recommendedPacing}のシーン構成`);
        }

        // 重複排除と最大3つのシーンを選択
        return [...new Set(potentialScenes)].slice(0, 3);
    }

    /**
     * プロンプト要素として整形
     * @param directives 章指示
     * @returns プロンプト要素
     */
    formatAsPromptElements(directives: ChapterDirectives): PromptElements {
        // プロンプト要素の初期化
        const elements: PromptElements = {
            CHAPTER_GOAL: directives.chapterGoal,
            REQUIRED_PLOT_ELEMENTS: this.formatList(directives.requiredPlotElements),
            CURRENT_LOCATION: directives.currentLocation,
            CURRENT_SITUATION: directives.currentSituation,
            ACTIVE_CHARACTERS: this.formatCharacters(directives.activeCharacters),
            WORLD_ELEMENTS_FOCUS: this.formatList(directives.worldElementsFocus),
            THEMATIC_FOCUS: this.formatList(directives.thematicFocus)
        };

        // オプション要素の追加
        if (directives.suggestedScenes && directives.suggestedScenes.length > 0) {
            elements.SUGGESTED_SCENES = this.formatList(directives.suggestedScenes);
        }

        if (directives.emotionalGoal) {
            elements.EMOTIONAL_GOAL = directives.emotionalGoal;
        }

        if (directives.tension) {
            elements.TENSION_LEVEL = `${directives.tension}/10`;
        }

        // 感情曲線があれば追加
        if (directives.emotionalCurve && directives.emotionalCurve.length > 0) {
            elements.EMOTIONAL_CURVE = this.formatEmotionalCurve(directives.emotionalCurve);
        }

        return elements;
    }

    /**
     * リストをフォーマット
     * @param items リストアイテム
     * @returns フォーマットされたリスト
     */
    private formatList(items: string[]): string {
        return items.map(item => `- ${item}`).join('\n');
    }

    /**
     * キャラクターをフォーマット
     * @param characters キャラクター
     * @returns フォーマットされたキャラクター
     */
    private formatCharacters(characters: CharacterState[]): string {
        return characters.map(char => {
            let charText = `- ${char.name} (${char.role}): ${char.currentState}`;

            if (char.goals && char.goals.length > 0) {
                charText += `\n  目標: ${char.goals.join(', ')}`;
            }

            if (char.conflicts && char.conflicts.length > 0) {
                charText += `\n  葛藤: ${char.conflicts.join(', ')}`;
            }

            if (char.relationshipFocus && char.relationshipFocus.length > 0) {
                charText += `\n  関係性: ${char.relationshipFocus.join(', ')}`;
            }

            if (char.development) {
                charText += `\n  発展: ${char.development}`;
            }

            return charText;
        }).join('\n');
    }

    /**
     * 感情曲線をフォーマット
     * @param curve 感情曲線データ
     * @returns フォーマットされた感情曲線
     */
    private formatEmotionalCurve(curve: EmotionalCurvePoint[]): string {
        let result = "直近の感情曲線:\n";

        result += curve.map(point => {
            let pointText = `- 章${point.chapter}: ${point.emotion} (テンション: ${point.tension}/10)`;
            if (point.event) {
                pointText += ` - ${point.event}`;
            }
            return pointText;
        }).join('\n');

        // 次章の推奨
        const lastPoint = curve[curve.length - 1];
        if (lastPoint) {
            result += `\n\n推奨: 前章の「${lastPoint.emotion}」からの自然な変化を意識して展開を描写`;
        }

        return result;
    }

    /**
     * プロット進行状況を分析
     * @param concretePlot 具体的プロット
     * @param recentChapters 最近の章
     * @returns 進行状況
     */
    analyzeProgress(
        concretePlot: ConcretePlotPoint | null,
        recentChapters: any[]
    ): PlotProgressInfo {
        if (!concretePlot || !concretePlot.keyEvents || concretePlot.keyEvents.length === 0) {
            return {
                completedElements: [],
                pendingElements: [],
                progressPercentage: 0,
                currentFocus: "未定義のプロット"
            };
        }

        // 実装省略（実際にはより複雑な分析を行う）
        return {
            completedElements: [],
            pendingElements: concretePlot.keyEvents,
            progressPercentage: 0.5, // 仮の値
            currentFocus: concretePlot.title || "物語の進行"
        };
    }

    /**
     * エラー時のフォールバック指示を生成
     * @param chapterNumber 章番号
     * @param abstractGuideline 抽象的ガイドライン
     * @param narrativeState 物語状態
     * @returns フォールバック指示
     */
    private generateFallbackDirectives(
        chapterNumber: number,
        abstractGuideline: AbstractPlotGuideline,
        narrativeState: NarrativeStateInfo | null
    ): ChapterDirectives {
        // ナラティブステートがnullの場合はデフォルト値を作成
        if (!narrativeState) {
            narrativeState = this.createDefaultNarrativeState(chapterNumber);
        }

        return {
            chapterGoal: `${abstractGuideline.theme}を探求しながら物語を進展させる`,
            requiredPlotElements: [
                `${abstractGuideline.emotionalTone}の雰囲気の中での出来事`,
                `${abstractGuideline.theme}に関連する展開`,
                "キャラクターの成長機会"
            ],
            currentLocation: narrativeState.location || "前章から継続する場所",
            currentSituation: `${this.getStateDescription(narrativeState.state)}の状況で物語が進行中`,
            activeCharacters: narrativeState.presentCharacters?.map(name => ({
                name,
                currentState: "物語に参加中",
                role: "登場人物"
            })) || [],
            worldElementsFocus: [
                "現在の環境描写",
                "世界観の重要要素"
            ],
            thematicFocus: [
                abstractGuideline.theme,
                `${abstractGuideline.emotionalTone}の雰囲気の維持`
            ],
            narrativeState,
            tension: narrativeState.tensionLevel || 5,
            emotionalGoal: abstractGuideline.emotionalTone
        };
    }

    /**
     * デフォルトの物語状態を作成
     * @param chapterNumber 章番号
     * @returns デフォルト物語状態
     */
    private createDefaultNarrativeState(chapterNumber: number): NarrativeStateInfo {
        // アーク番号の計算（10章ごとにアーク変更と仮定）
        const arcNumber = Math.ceil(chapterNumber / 10);
        const arcStartChapter = Math.max(1, (arcNumber - 1) * 10 + 1);
        const arcEndChapter = arcNumber * 10;

        return {
            // 基本状態
            state: NarrativeState.DAILY_LIFE,
            tensionLevel: 5,
            stagnationDetected: false,
            duration: 1,
            location: "不特定の場所",
            timeOfDay: "昼間",
            weather: "晴れ",
            presentCharacters: [],
            genre: "未定義", // 必須プロパティを追加

            // 内部状態（必須プロパティを追加）
            currentArcNumber: arcNumber,
            currentTheme: `第${arcNumber}アークのテーマ`,
            arcStartChapter,
            arcEndChapter,
            arcCompleted: false,
            turningPoints: [], // 空の配列で初期化

            // オプショナルプロパティ
            suggestedNextState: undefined,
            metrics: undefined,
            totalChapters: undefined,
            progressionInstruction: undefined
        };
    }
}