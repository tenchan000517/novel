// src/lib/plot/context-builder.ts
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { PlotMode, ConcretePlotPoint, AbstractPlotGuideline, PlotContext } from './types';
import { NarrativeStateInfo } from '@/lib/memory/long-term/types';

/**
 * @class PlotContextBuilder
 * @description
 * プロット情報からコンテキストを構築する機能を提供します。
 * 
 * @role
 * - プロットモードに応じたコンテキスト構築
 * - 短期目標の抽出
 * - コンテキスト文字列の生成
 */
export class PlotContextBuilder {
    /**
     * プロットコンテキストを構築します
     * 
     * @param mode プロットモード
     * @param chapterNumber チャプター番号
     * @param concretePlot 具体的プロット（あれば）
     * @param abstractGuideline 抽象的プロットガイドライン
     * @param narrativeState 物語状態情報
     * @param abstractConcreteBalance 抽象・具体バランスパラメータ
     * @returns 構築されたプロットコンテキスト
     */
    async buildContext(
        mode: PlotMode,
        chapterNumber: number,
        concretePlot: ConcretePlotPoint | null,
        // midTermPlot: MidTermPlot | null,
        abstractGuideline: AbstractPlotGuideline,
        narrativeState: NarrativeStateInfo,
        abstractConcreteBalance: number = 0.5
    ): Promise<PlotContext> {
        try {
            // 現在のアーク情報
            const currentArc = {
                name: abstractGuideline.phase,
                theme: abstractGuideline.theme,
                approximateChapters: abstractGuideline.chapterRange || 
                    (concretePlot ? concretePlot.chapterRange : [chapterNumber, chapterNumber + 5])
            };
            
            // 短期目標の抽出
            const shortTermGoals = this.extractShortTermGoals(mode, concretePlot, abstractGuideline);
            
            // モード指示の生成
            const modeInstructions = this.generateModeInstructions(
                mode, 
                concretePlot, 
                abstractGuideline, 
                abstractConcreteBalance,
                narrativeState
            );
            
            // 物語文脈の生成
            const narrativeContext = this.buildNarrativeContext(
                abstractGuideline,
                concretePlot,
                narrativeState,
                abstractConcreteBalance
            );
            
            return {
                mode,
                modeInstructions,
                currentArc,
                shortTermGoals,
                narrativeContext
            };
        } catch (error) {
            logError(error, { chapterNumber }, 'プロットコンテキストの構築に失敗しました');
            
            // エラー時は最小限のコンテキストを返却
            return this.createFallbackContext(mode, chapterNumber, abstractGuideline);
        }
    }
    
    /**
     * プロットモードに応じた指示を生成します
     */
    private generateModeInstructions(
        mode: PlotMode,
        concretePlot: ConcretePlotPoint | null,
        abstractGuideline: AbstractPlotGuideline,
        abstractConcreteBalance: number,
        narrativeState: NarrativeStateInfo
    ): string {
        // 停滞検出時の指示強化
        const stagnationDirective = narrativeState.stagnationDetected 
            ? "物語が停滞しています。より積極的に物語を前進させる展開を心がけてください。" 
            : "";
        
        switch (mode) {
            case PlotMode.CONCRETE:
                return `具体的なプロット指示に従って物語を展開してください。キーイベント、必須要素、キャラクターの焦点は必ず含めてください。
${stagnationDirective}`;
                
            case PlotMode.ABSTRACT:
                return `指定された抽象的なテーマ「${abstractGuideline.theme}」と感情的トーン「${abstractGuideline.emotionalTone}」に沿って、キャラクターと物語の自然な発展を描いてください。
提案された方向性を参考にしつつ、創造的に物語を展開させてください。${stagnationDirective}`;
                
            case PlotMode.HYBRID:
                return `具体的な必須要素を含めつつ、テーマ「${abstractGuideline.theme}」の枠組みの中で創造的に物語を展開させてください。
必須要素は守りながらも、その実現方法と周辺の展開については自由度を持たせて描写してください。${stagnationDirective}`;
                
            case PlotMode.TRANSITION_TO_CONCRETE:
                return `次章から始まる具体的なイベントへの準備となる展開を描いてください。
伏線や期待感を徐々に高め、読者の興味を引きつけながら次の大きな展開への橋渡しをしてください。${stagnationDirective}`;
                
            case PlotMode.TRANSITION_TO_ABSTRACT:
                return `直前の具体的イベントの余韻や影響を描きながら、より自由度の高い展開へと移行してください。
キャラクターの内面や関係性の変化、感情の発展に焦点を当てて描写してください。${stagnationDirective}`;
                
            default:
                return `物語の流れに沿って自然な展開を心がけてください。${stagnationDirective}`;
        }
    }
    
    /**
     * 短期目標を抽出します
     */
    private extractShortTermGoals(
        mode: PlotMode,
        concretePlot: ConcretePlotPoint | null,
        abstractGuideline: AbstractPlotGuideline
    ): string[] {
        const goals: string[] = [];
        
        // プロットモードに応じた目標抽出
        switch (mode) {
            case PlotMode.CONCRETE:
            case PlotMode.HYBRID:
                if (concretePlot) {
                    // 具体プロットからキーイベントと必須要素を抽出
                    goals.push(...concretePlot.keyEvents.slice(0, 3));
                    goals.push(...concretePlot.requiredElements
                        .filter(elem => !goals.includes(elem))
                        .slice(0, 2));
                }
                break;
                
            case PlotMode.ABSTRACT:
            case PlotMode.TRANSITION_TO_CONCRETE:
            case PlotMode.TRANSITION_TO_ABSTRACT:
                // 抽象プロットから方向性を抽出
                goals.push(...abstractGuideline.potentialDirections.slice(0, 3));
                break;
        }
        
        // 目標が足りない場合は抽象プロットからも追加
        if (goals.length < 3 && abstractGuideline.potentialDirections.length > 0) {
            const additionalGoals = abstractGuideline.potentialDirections
                .filter(dir => !goals.includes(dir))
                .slice(0, 3 - goals.length);
                
            goals.push(...additionalGoals);
        }
        
        return goals;
    }
    
    /**
     * 物語コンテキストを構築します
     */
    private buildNarrativeContext(
        abstractGuideline: AbstractPlotGuideline,
        concretePlot: ConcretePlotPoint | null,
        narrativeState: NarrativeStateInfo,
        abstractConcreteBalance: number
    ): string {
        // 具体プロットがある場合のインストラクション
        const concreteInstructions = concretePlot 
            ? this.formatConcreteInstructions(concretePlot, abstractConcreteBalance)
            : "";
            
        // 抽象プロットのインストラクション（常に提供）
        const abstractInstructions = this.formatAbstractInstructions(
            abstractGuideline, 
            narrativeState,
            abstractConcreteBalance
        );
        
        // 物語の流れに関するコンテキスト
        const flowContext = this.buildFlowContext(narrativeState);
        
        // コンテキスト結合
        return `
${concreteInstructions}

${abstractInstructions}

${flowContext}`;
    }
    
    /**
     * 具体的インストラクションをフォーマットします
     */
    private formatConcreteInstructions(
        concretePlot: ConcretePlotPoint,
        balanceParam: number
    ): string {
        // 具体性の強さをパラメータで調整
        const strength = balanceParam < 0.3 ? "必ず" : balanceParam < 0.7 ? "できるだけ" : "可能なら";
        
        return `【具体的プロット指示】
- タイトル: ${concretePlot.title}
- 概要: ${concretePlot.summary}
- 重要イベント: ${strength}以下の要素を含めてください:
  ${concretePlot.keyEvents.map(e => `  - ${e}`).join('\n')}
- 注目キャラクター: ${concretePlot.characterFocus.join(', ')}
- 必須要素: ${concretePlot.requiredElements.join(', ')}
${concretePlot.foreshadowing && concretePlot.foreshadowing.length > 0 ? `- 伏線: ${concretePlot.foreshadowing.join(', ')}` : ''}`;
    }
    
    /**
     * 抽象的インストラクションをフォーマットします
     */
    private formatAbstractInstructions(
        abstractGuideline: AbstractPlotGuideline,
        narrativeState: NarrativeStateInfo,
        balanceParam: number
    ): string {
        // 抽象プロットの重みをパラメータで調整
        const guidance = balanceParam > 0.7 
            ? "以下の方向性を中心に物語を展開してください" 
            : "以下の方向性も考慮してください";
        
        return `【物語の方向性】
物語は現在「${abstractGuideline.phase}」の段階にあります。${guidance}：

- テーマ: ${abstractGuideline.theme}
- 感情的トーン: ${abstractGuideline.emotionalTone}
- 展開の可能性:
${abstractGuideline.potentialDirections.map(d => `  - ${d}`).join('\n')}
- 避けるべき要素:
${abstractGuideline.prohibitedElements.map(e => `  - ${e}`).join('\n')}`;
    }
    
    /**
     * 物語の流れに関するコンテキストを構築します
     */
    private buildFlowContext(narrativeState: NarrativeStateInfo): string {
        return `【現在の物語状態】
- 状態: ${narrativeState.state}
- 継続期間: ${narrativeState.duration}章
- 場所: ${narrativeState.location}
- 時間帯: ${narrativeState.timeOfDay}
- 天候: ${narrativeState.weather}
- 緊張度: ${narrativeState.tensionLevel}/10
- 登場中キャラクター: ${narrativeState.presentCharacters.join(', ')}`;
    }
    
    /**
     * フォールバック用の最小限コンテキストを作成します
     */
    private createFallbackContext(
        mode: PlotMode, 
        chapterNumber: number, 
        abstractGuideline: AbstractPlotGuideline
    ): PlotContext {
        return {
            mode,
            modeInstructions: "物語の流れに沿って自然な展開を心がけてください",
            currentArc: {
                name: abstractGuideline.phase || "進行中のアーク",
                theme: abstractGuideline.theme || "キャラクターの成長と冒険",
                approximateChapters: abstractGuideline.chapterRange || [Math.max(1, chapterNumber - 5), chapterNumber + 5]
            },
            shortTermGoals: abstractGuideline.potentialDirections.slice(0, 3) || [
                "キャラクターの内的成長の描写",
                "物語世界のさらなる探索",
                "キャラクター間の関係性の発展"
            ],
            narrativeContext: "過去の出来事を踏まえて物語を自然に進展させてください"
        };
    }
}