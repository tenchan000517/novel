// src/lib/plot/phase-manager.ts
import { PlotMode, ConcretePlotPoint, AbstractPlotGuideline } from './types';
import { logger } from '@/lib/utils/logger';

/**
 * 物語フェーズの管理と特定を行うクラス
 */
export class StoryPhaseManager {
    /**
     * 現在のチャプターがどの物語フェーズにあるかを特定
     */
    async identifyPhase(
        chapterNumber: number,
        concretePlots: ConcretePlotPoint[],
        abstractPlots: AbstractPlotGuideline[]
    ): Promise<{
        phase: string;
        isTransitionPoint: boolean;
        phaseProgress: number; // 0-1でフェーズ内の進行度
        nextPhase?: string;
        importance: number; // フェーズの重要度 0-1
    }> {
        // 具体プロットからフェーズを特定
        const matchingConcretePlot = concretePlots.find(plot => 
            chapterNumber >= plot.chapterRange[0] && 
            chapterNumber <= plot.chapterRange[1]
        );
        
        if (matchingConcretePlot && matchingConcretePlot.phase) {
            // フェーズ内の進行度を計算
            const phaseStart = matchingConcretePlot.chapterRange[0];
            const phaseEnd = matchingConcretePlot.chapterRange[1];
            const phaseLength = phaseEnd - phaseStart + 1;
            const phaseProgress = (chapterNumber - phaseStart) / phaseLength;
            
            // 次のフェーズを特定
            const nextPlot = concretePlots.find(plot => 
                plot.chapterRange[0] === matchingConcretePlot.chapterRange[1] + 1
            );
            
            // 移行点かどうかを判断（フェーズの最後の章か）
            const isTransitionPoint = chapterNumber === phaseEnd;
            
            return {
                phase: matchingConcretePlot.phase,
                isTransitionPoint,
                phaseProgress,
                nextPhase: nextPlot?.phase,
                importance: this.calculatePhaseImportance(matchingConcretePlot.phase, phaseProgress)
            };
        }
        
        // 具体プロットが見つからない場合は抽象プロットから推定
        const matchingAbstractPlot = abstractPlots.find(plot =>
            plot.chapterRange &&
            chapterNumber >= plot.chapterRange[0] &&
            chapterNumber <= plot.chapterRange[1]
        );
        
        if (matchingAbstractPlot) {
            // 抽象プロットのフェーズから推定
            const phaseStart = matchingAbstractPlot.chapterRange![0];
            const phaseEnd = matchingAbstractPlot.chapterRange![1];
            const phaseLength = phaseEnd - phaseStart + 1;
            const phaseProgress = (chapterNumber - phaseStart) / phaseLength;
            
            // 次のフェーズを特定
            const nextPlot = abstractPlots.find(plot =>
                plot.chapterRange && plot.chapterRange[0] === matchingAbstractPlot.chapterRange![1] + 1
            );
            
            // 移行点かどうか判断
            const isTransitionPoint = chapterNumber === phaseEnd;
            
            // 抽象プロットのフェーズを標準的なフェーズ名に変換
            const standardizedPhase = this.standardizePhase(matchingAbstractPlot.phase);
            
            return {
                phase: standardizedPhase,
                isTransitionPoint,
                phaseProgress,
                nextPhase: nextPlot ? this.standardizePhase(nextPlot.phase) : undefined,
                importance: this.calculatePhaseImportance(standardizedPhase, phaseProgress)
            };
        }
        
        // どちらも見つからない場合はチャプター番号から推定
        // 物語の総チャプター数を推定（50章と仮定）
        const estimatedTotalChapters = 50;
        const progress = chapterNumber / estimatedTotalChapters;
        
        let phase = '';
        let importance = 0.5;
        
        if (progress < 0.1) {
            phase = 'OPENING';
            importance = 0.7;
        } else if (progress < 0.3) {
            phase = 'EARLY';
            importance = 0.6;
        } else if (progress < 0.5) {
            phase = 'MIDDLE';
            importance = 0.6;
        } else if (progress < 0.7) {
            phase = 'LATE';
            importance = 0.7;
        } else if (progress < 0.85) {
            phase = 'CLIMAX';
            importance = 0.9;
        } else {
            phase = 'ENDING';
            importance = 0.8;
        }
        
        return {
            phase,
            isTransitionPoint: false,
            phaseProgress: (progress % 0.2) / 0.2, // フェーズ内での進行度を0-1で近似
            importance
        };
    }
    
    /**
     * フェーズの重要度を計算
     * @private
     */
    private calculatePhaseImportance(phase: string, progress: number): number {
        // フェーズと進行度に基づく重要度の計算ロジック
        switch (phase) {
            case 'OPENING':
                return 0.7 - (progress * 0.3); // 序盤は始まりが重要
            case 'EARLY':
                return 0.5 + (progress * 0.2); // 徐々に重要になる
            case 'MIDDLE':
                return 0.6; // 一定の重要度
            case 'LATE':
                return 0.7 + (progress * 0.1); // 徐々に重要になる
            case 'CLIMAX':
                return 0.8 + (progress * 0.2); // 最も重要
            case 'ENDING':
                return 0.9 - (progress * 0.3); // 終わりに向かって重要度減少
            default:
                return 0.5;
        }
    }
    
    /**
     * 抽象プロットのフェーズ名を標準的なフェーズ名に変換
     * @private
     */
    private standardizePhase(abstractPhase: string): string {
        // 抽象プロットのさまざまなフェーズ名表現を標準形式に変換
        const phaseMap: {[key: string]: string} = {
            // 英語表現
            'INTRODUCTION': 'OPENING',
            'RISING_ACTION': 'EARLY',
            'COMPLICATIONS': 'MIDDLE',
            'CLIMAX_APPROACH': 'LATE',
            'CLIMAX': 'CLIMAX',
            'RESOLUTION': 'ENDING',
            'FALLING_ACTION': 'ENDING',
            'DENOUEMENT': 'ENDING',
            
            // 日本語表現
            '序章': 'OPENING',
            '導入部': 'OPENING',
            '序盤': 'EARLY',
            '展開': 'EARLY',
            '中盤': 'MIDDLE',
            '複雑化': 'MIDDLE',
            '終盤': 'LATE',
            'クライマックス前': 'LATE',
            '山場': 'CLIMAX',
            '結末': 'ENDING',
            '解決': 'ENDING'
        };
        
        // 大文字に変換して標準化
        const normalizedPhase = abstractPhase.toUpperCase();
        
        // マッピングがあれば変換、なければそのまま
        return phaseMap[normalizedPhase] || normalizedPhase;
    }
    
    /**
     * 物語全体の構造マップを構築
     */
    buildStoryStructureMap(
        concretePlots: ConcretePlotPoint[],
        abstractPlots: AbstractPlotGuideline[]
    ): Array<{
        phase: string;
        chapterRange: [number, number];
        title: string;
        summary?: string;
        thematicPurpose?: string;
    }> {
        // 結果配列
        const structureMap: Array<{
            phase: string;
            chapterRange: [number, number];
            title: string;
            summary?: string;
            thematicPurpose?: string;
        }> = [];
        
        // まず具体プロットからマップを構築
        if (concretePlots.length > 0) {
            // 章範囲でソート
            const sortedConcretePlots = [...concretePlots].sort(
                (a, b) => a.chapterRange[0] - b.chapterRange[0]
            );
            
            // 構造マップに追加
            for (const plot of sortedConcretePlots) {
                structureMap.push({
                    phase: plot.phase || this.inferPhaseFromChapterRange(plot.chapterRange),
                    chapterRange: plot.chapterRange,
                    title: plot.title,
                    summary: plot.summary,
                    thematicPurpose: plot.storyGoal
                });
            }
        }
        
        // 抽象プロットから情報を補完・拡張
        if (abstractPlots.length > 0) {
            // 章範囲でソート
            const sortedAbstractPlots = [...abstractPlots]
                .filter(plot => plot.chapterRange) // chapterRangeがある物のみ
                .sort((a, b) => {
                    // 型安全のためのnull/undefined チェック
                    if (!a.chapterRange || !b.chapterRange) return 0;
                    return a.chapterRange[0] - b.chapterRange[0];
                });
            
            // 既存の構造マップがない場合は抽象プロットから構築
            if (structureMap.length === 0) {
                for (const plot of sortedAbstractPlots) {
                    if (plot.chapterRange) {
                        structureMap.push({
                            phase: this.standardizePhase(plot.phase),
                            chapterRange: plot.chapterRange,
                            title: `${plot.phase}フェーズ (${plot.theme})`,
                            summary: `${plot.emotionalTone}の雰囲気で${plot.theme}を探求する`,
                            thematicPurpose: plot.phasePurpose || plot.thematicMessage
                        });
                    }
                }
            } else {
                // 既存の構造マップを抽象プロットで補強
                for (const abstractPlot of sortedAbstractPlots) {
                    if (!abstractPlot.chapterRange) continue;
                    
                    // 対応する具体プロットエントリを探す
                    const matchingEntry = structureMap.find(entry =>
                        this.isRangeOverlapping(entry.chapterRange, abstractPlot.chapterRange as [number, number])
                    );
                    
                    if (matchingEntry) {
                        // 情報を補完（既存情報を優先）
                        if (!matchingEntry.thematicPurpose) {
                            matchingEntry.thematicPurpose = abstractPlot.phasePurpose || abstractPlot.thematicMessage;
                        }
                    } else {
                        // 抽象プロットのみの範囲は新規追加
                        structureMap.push({
                            phase: this.standardizePhase(abstractPlot.phase),
                            chapterRange: abstractPlot.chapterRange,
                            title: `${abstractPlot.phase}フェーズ (${abstractPlot.theme})`,
                            summary: `${abstractPlot.emotionalTone}の雰囲気で${abstractPlot.theme}を探求する`,
                            thematicPurpose: abstractPlot.phasePurpose || abstractPlot.thematicMessage
                        });
                    }
                }
            }
        }
        
        // 範囲がないか不完全な場合は推測で埋める
        if (structureMap.length === 0) {
            // 推定の総章数
            const estimatedTotalChapters = 50;
            
            // 標準的な物語構造を生成
            structureMap.push(
                {
                    phase: 'OPENING',
                    chapterRange: [1, 5],
                    title: '序章フェーズ',
                    summary: '物語世界と主要キャラクターの紹介',
                    thematicPurpose: '読者を物語世界に引き込み、主人公への共感を構築'
                },
                {
                    phase: 'EARLY',
                    chapterRange: [6, 15],
                    title: '序盤フェーズ',
                    summary: '主人公の旅路と最初の障害',
                    thematicPurpose: '物語の方向性と主要な葛藤を確立'
                },
                {
                    phase: 'MIDDLE',
                    chapterRange: [16, 30],
                    title: '中盤フェーズ',
                    summary: '複雑化する状況と関係性',
                    thematicPurpose: '主人公の成長と選択の重要性を強調'
                },
                {
                    phase: 'LATE',
                    chapterRange: [31, 40],
                    title: '終盤フェーズ',
                    summary: 'クライマックスへの準備と緊張の高まり',
                    thematicPurpose: '全ての伏線を統合し、最終対決へと導く'
                },
                {
                    phase: 'CLIMAX',
                    chapterRange: [41, 45],
                    title: 'クライマックスフェーズ',
                    summary: '物語の決定的な転換点と対決',
                    thematicPurpose: 'テーマの最終的な表現と主人公の決断'
                },
                {
                    phase: 'ENDING',
                    chapterRange: [46, 50],
                    title: '終章フェーズ',
                    summary: '物語の解決と新たな秩序',
                    thematicPurpose: '変化した世界と成長したキャラクターを示す'
                }
            );
        }
        
        // 章範囲でソートして返す
        return structureMap.sort((a, b) => a.chapterRange[0] - b.chapterRange[0]);
    }
    
    /**
     * 章の範囲が重なっているかチェック
     * @private
     */
    private isRangeOverlapping(
        range1: [number, number],
        range2: [number, number]
    ): boolean {
        return (
            (range1[0] <= range2[1] && range1[1] >= range2[0]) || // 一部重複
            (range2[0] <= range1[1] && range2[1] >= range1[0])    // 一部重複（逆）
        );
    }
    
    /**
     * 章範囲からフェーズを推測
     * @private
     */
    private inferPhaseFromChapterRange(chapterRange: [number, number]): string {
        // 推定の総章数
        const estimatedTotalChapters = 50;
        
        // 章の中央値を計算
        const midChapter = (chapterRange[0] + chapterRange[1]) / 2;
        const progress = midChapter / estimatedTotalChapters;
        
        if (progress < 0.1) return 'OPENING';
        if (progress < 0.3) return 'EARLY';
        if (progress < 0.5) return 'MIDDLE';
        if (progress < 0.7) return 'LATE';
        if (progress < 0.85) return 'CLIMAX';
        return 'ENDING';
    }
}