// src/lib/memory/narrative/dynamic-tension-optimizer.ts
/**
 * DynamicTensionOptimizer クラスへのビジネスジャンル向け拡張
 * 統合型定義に対応した最適化版
 */

import { logger } from '@/lib/utils/logger';
import {
    TensionRecommendation,
    PacingRecommendation,
    TensionPacingRecommendation,
    BusinessStoryEvent,
    BusinessEventType
} from './types';

/**
 * @class DynamicTensionOptimizer
 * @description 物語の状態と進行に基づいて最適なテンションとペーシングを計算するクラス
 */
export class DynamicTensionOptimizer {
    /** ジャンル別の理想的テンションカーブ */
    private tensionTemplates: {[genre: string]: number[]} = {
        classic: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.7, 0.9, 0.95, 0.6, 0.3],
        mystery: [0.5, 0.6, 0.5, 0.7, 0.6, 0.7, 0.8, 0.7, 0.9, 0.95, 0.6],
        romance: [0.4, 0.5, 0.6, 0.4, 0.7, 0.5, 0.6, 0.8, 0.7, 0.9, 0.5],
        thriller: [0.6, 0.7, 0.6, 0.8, 0.7, 0.8, 0.9, 0.8, 0.95, 0.9, 0.7],
        fantasy: [0.4, 0.5, 0.6, 0.7, 0.6, 0.8, 0.7, 0.9, 0.95, 0.7, 0.5],
        scifi: [0.5, 0.6, 0.7, 0.6, 0.8, 0.7, 0.9, 0.8, 0.95, 0.7, 0.6],
        horror: [0.6, 0.7, 0.8, 0.7, 0.9, 0.8, 0.95, 0.9, 0.8, 0.95, 0.7],
        // ビジネスジャンル向けテンションカーブを追加
        business: [0.4, 0.5, 0.6, 0.7, 0.5, 0.8, 0.6, 0.9, 0.7, 0.95, 0.6]
    };
    
    /** テンション曲線のパターン名 */
    private tensionPatterns: {[pattern: string]: number[]} = {
        steady_climb: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.8, 0.5],
        wave: [0.5, 0.7, 0.4, 0.6, 0.8, 0.5, 0.7, 0.9, 0.95, 0.6],
        late_spike: [0.4, 0.5, 0.4, 0.6, 0.5, 0.7, 0.6, 0.8, 0.95, 0.7],
        early_peak: [0.5, 0.7, 0.9, 0.8, 0.6, 0.7, 0.8, 0.9, 0.95, 0.6],
        dual_peaks: [0.4, 0.6, 0.8, 0.6, 0.5, 0.7, 0.9, 0.7, 0.95, 0.6],
        // ビジネス物語特有のパターンを追加
        startup_journey: [0.5, 0.7, 0.5, 0.8, 0.4, 0.6, 0.8, 0.7, 0.95, 0.6],
        business_growth: [0.3, 0.4, 0.6, 0.5, 0.7, 0.6, 0.8, 0.9, 0.95, 0.7],
        market_disruption: [0.6, 0.5, 0.7, 0.6, 0.8, 0.7, 0.9, 0.95, 0.8, 0.7],
        acquisition_path: [0.4, 0.5, 0.7, 0.6, 0.8, 0.7, 0.6, 0.9, 0.95, 0.7]
    };
    
    /**
     * @constructor
     */
    constructor() {
        logger.info('DynamicTensionOptimizer initialized');
    }
    
    /**
     * 最適テンション計算
     * @param chapterNumber 章番号
     * @param totalChapters 総章数
     * @param genre ジャンル
     * @param recentTensions 最近のテンション値
     * @param businessEvents ビジネスイベント情報（ビジネスジャンル用）
     * @returns テンション推奨
     */
    async calculateOptimalTension(
        chapterNumber: number,
        totalChapters: number,
        genre: string,
        recentTensions: number[],
        businessEvents?: BusinessStoryEvent[]
    ): Promise<TensionRecommendation> {
        try {
            logger.info(`Calculating optimal tension for chapter ${chapterNumber}`, {
                totalChapters,
                genre,
                recentTensionsCount: recentTensions.length
            });
            
            // 物語内の相対位置を計算
            const position = totalChapters > 0 ? 
                (chapterNumber / totalChapters) : 
                (chapterNumber / 20); // デフォルト総章数を20と仮定
                
            const normalizedPosition = Math.min(Math.floor(position * 10), 10);
            
            // テンプレートからベースとなるテンション値を取得
            const template = this.tensionTemplates[genre.toLowerCase()] || this.tensionTemplates.classic;
            const baseTension = template[normalizedPosition];
            
            // 最近の章でのテンション変化を分析
            let recommendation: TensionRecommendation = {
                recommendedTension: baseTension,
                reason: "物語の現在位置に基づく標準的なテンション値",
                direction: "maintain"
            };
            
            // テンション変化パターンの分析
            if (recentTensions.length >= 2) {
                recommendation = this.analyzeRecentTensionPatterns(recentTensions, recommendation);
            }
            
            // 物語構造上の特別なポイントでの調整
            recommendation = this.adjustForStoryStructure(
                recommendation, 
                chapterNumber, 
                totalChapters
            );
            
            // ジャンル特有の調整
            recommendation = this.applyGenreSpecificAdjustments(
                recommendation, 
                genre, 
                position, 
                chapterNumber, 
                totalChapters
            );
            
            // ビジネスジャンルの場合、特定のビジネスイベントに基づく調整を行う
            if (genre.toLowerCase() === 'business' && businessEvents && businessEvents.length > 0) {
                recommendation = this.adjustTensionForBusinessEvents(recommendation, businessEvents, position);
            }
            
            // ランダム要素を加える（わずかな揺らぎ）
            const finalTension = this.addRandomVariation(recommendation.recommendedTension, 0.05);
            
            const finalRecommendation = {
                ...recommendation,
                recommendedTension: finalTension
            };
            
            logger.info(`Tension recommendation generated`, {
                chapterNumber,
                recommendedTension: finalRecommendation.recommendedTension.toFixed(2),
                direction: finalRecommendation.direction
            });
            
            return finalRecommendation;
        } catch (error) {
            logger.error('Failed to calculate optimal tension', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });
            
            // エラー時はデフォルト値を返す
            return {
                recommendedTension: 0.5,
                reason: "計算に失敗したためデフォルト値を使用",
                direction: "maintain"
            };
        }
    }

    /**
     * 最近のテンションパターンを分析
     * @private
     */
    private analyzeRecentTensionPatterns(
        recentTensions: number[],
        recommendation: TensionRecommendation
    ): TensionRecommendation {
        // 単調上昇が続いている場合
        const isConsistentlyRising = recentTensions.every((t, i) => 
            i === 0 || t > recentTensions[i-1]
        );
        
        // 単調下降が続いている場合
        const isConsistentlyFalling = recentTensions.every((t, i) => 
            i === 0 || t < recentTensions[i-1]
        );
        
        // 変化なしが続いている場合
        const isConsistentlyFlat = recentTensions.every((t, i) => 
            i === 0 || Math.abs(t - recentTensions[i-1]) < 0.1
        );
        
        // 各状況に応じた調整
        if (isConsistentlyRising && recentTensions.length >= 3) {
            return {
                recommendedTension: Math.max(0.3, recentTensions[recentTensions.length - 1] - 0.1),
                reason: "長期的な緊張の上昇があるため、一時的な緊張緩和で読者に休息を与える",
                direction: "decrease"
            };
        } else if (isConsistentlyFalling && recentTensions.length >= 3) {
            return {
                recommendedTension: Math.min(0.9, recentTensions[recentTensions.length - 1] + 0.15),
                reason: "長期的な緊張の低下があるため、予想外の緊張上昇で読者の興味を再喚起する",
                direction: "increase"
            };
        } else if (isConsistentlyFlat && recentTensions.length >= 2) {
            return this.handleFlatTension(recentTensions, recommendation);
        }

        return recommendation;
    }

    /**
     * フラットなテンション状態の処理
     * @private
     */
    private handleFlatTension(
        recentTensions: number[],
        recommendation: TensionRecommendation
    ): TensionRecommendation {
        const currentTension = recentTensions[recentTensions.length - 1];
        
        // ランダムに変化方向を決定（物語後半は上昇傾向を優先）
        const position = Math.random(); // 簡易的な位置計算
        const positionFactor = position > 0.5 ? 0.7 : 0.3;
        const newDirection = Math.random() > positionFactor ? "increase" : "decrease";
        
        if (newDirection === "increase") {
            return {
                recommendedTension: Math.min(0.9, currentTension + 0.15),
                reason: "テンションの変化が少ないため、読者の興味を維持するために緊張度を上げる",
                direction: "increase"
            };
        } else {
            return {
                recommendedTension: Math.max(0.3, currentTension - 0.1),
                reason: "テンションの変化が少ないため、コントラストを生み出すために緊張度を下げる",
                direction: "decrease"
            };
        }
    }

    /**
     * 物語構造に基づく調整
     * @private
     */
    private adjustForStoryStructure(
        recommendation: TensionRecommendation,
        chapterNumber: number,
        totalChapters: number
    ): TensionRecommendation {
        if (chapterNumber === 1) {
            return {
                recommendedTension: 0.5,
                reason: "最初の章では読者の興味を引きながらも、今後の上昇余地を残すために中程度のテンション",
                direction: "establish"
            };
        } else if (totalChapters > 0 && chapterNumber === totalChapters - 1) {
            return {
                recommendedTension: 0.9,
                reason: "クライマックス直前の章としてほぼ最高のテンションを維持",
                direction: "increase"
            };
        } else if (totalChapters > 0 && chapterNumber === totalChapters) {
            return {
                recommendedTension: 0.7,
                reason: "最終章では解決に向かいながらも余韻を残す適度なテンション",
                direction: "decrease"
            };
        }

        return recommendation;
    }
    
    /**
     * ジャンル特有の調整を適用する
     * @private
     */
    private applyGenreSpecificAdjustments(
        recommendation: TensionRecommendation,
        genre: string,
        position: number,
        chapterNumber: number,
        totalChapters: number
    ): TensionRecommendation {
        const normalizedGenre = genre.toLowerCase();
        
        switch (normalizedGenre) {
            case 'business':
                return this.applyBusinessGenreAdjustments(recommendation, position, chapterNumber);
            case 'thriller':
            case 'horror':
                return this.applyThrillerHorrorAdjustments(recommendation, genre);
            case 'mystery':
                return this.applyMysteryAdjustments(recommendation, position, chapterNumber);
            case 'romance':
                return this.applyRomanceAdjustments(recommendation, position, chapterNumber);
            case 'fantasy':
            case 'scifi':
                return this.applyFantasySciFiAdjustments(recommendation, chapterNumber);
        }
        
        return recommendation;
    }

    /**
     * ビジネスジャンル特有の調整
     * @private
     */
    private applyBusinessGenreAdjustments(
        recommendation: TensionRecommendation,
        position: number,
        chapterNumber: number
    ): TensionRecommendation {
        if (position < 0.2) {
            // 序盤（創業/アイデア期）
            if (chapterNumber === 2 || chapterNumber === 3) {
                return {
                    recommendedTension: 0.65,
                    reason: "ビジネスアイデアの実現に向けた初期の挑戦を描写するための適度なテンション",
                    direction: "increase"
                };
            }
        } else if (position >= 0.2 && position < 0.5) {
            // 前半中盤（初期成長期）
            return this.handleBusinessGrowthPhase(recommendation, chapterNumber);
        } else if (position >= 0.5 && position < 0.8) {
            // 後半中盤（拡大期/危機期）
            return this.handleBusinessExpansionPhase(recommendation, chapterNumber);
        } else {
            // 終盤（決断/結末期）
            return this.handleBusinessEndgamePhase(recommendation, position);
        }

        // フィボナッチ数列による特殊調整
        if (this.isFibonacci(chapterNumber) && chapterNumber > 3) {
            return {
                recommendedTension: Math.min(0.9, recommendation.recommendedTension + 0.1),
                reason: "ビジネス展開における重要な転換点でテンションを高める",
                direction: "increase"
            };
        }
        
        return recommendation;
    }

    /**
     * ビジネス成長期の処理
     * @private
     */
    private handleBusinessGrowthPhase(
        recommendation: TensionRecommendation,
        chapterNumber: number
    ): TensionRecommendation {
        if (chapterNumber % 3 === 0) { // 3の倍数の章で課題
            return {
                recommendedTension: Math.min(0.8, recommendation.recommendedTension + 0.15),
                reason: "ビジネス成長過程での重要な障壁や課題に直面する緊張感",
                direction: "increase"
            };
        } else if (chapterNumber % 3 === 1) { // 課題の次の章では少し緩和
            return {
                recommendedTension: Math.max(0.45, recommendation.recommendedTension - 0.1),
                reason: "課題への対応策を検討する内省的な時間のためにテンションを緩和",
                direction: "decrease"
            };
        }
        return recommendation;
    }

    /**
     * ビジネス拡大期の処理
     * @private
     */
    private handleBusinessExpansionPhase(
        recommendation: TensionRecommendation,
        chapterNumber: number
    ): TensionRecommendation {
        const isExpansionChapter = chapterNumber % 4 === 0;
        const isCrisisChapter = chapterNumber % 4 === 2;
        
        if (isExpansionChapter) {
            return {
                recommendedTension: 0.7,
                reason: "ビジネス拡大や新市場参入に伴う期待と不安を表現するテンション",
                direction: "increase"
            };
        } else if (isCrisisChapter) {
            return {
                recommendedTension: 0.85,
                reason: "ビジネス上の重大な危機や決断ポイントでの高いテンション",
                direction: "increase"
            };
        }
        return recommendation;
    }

    /**
     * ビジネス終盤期の処理
     * @private
     */
    private handleBusinessEndgamePhase(
        recommendation: TensionRecommendation,
        position: number
    ): TensionRecommendation {
        if (position > 0.85 && position < 0.95) {
            return {
                recommendedTension: 0.9,
                reason: "ビジネスストーリーのクライマックスに向けた重要な意思決定の瞬間",
                direction: "increase"
            };
        } else if (position >= 0.95) {
            return {
                recommendedTension: 0.75,
                reason: "ビジネスの成功または失敗の結果を描きながらも将来への示唆を残すテンション",
                direction: "decrease"
            };
        }
        return recommendation;
    }

    /**
     * スリラー・ホラージャンルの調整
     * @private
     */
    private applyThrillerHorrorAdjustments(
        recommendation: TensionRecommendation,
        genre: string
    ): TensionRecommendation {
        if (recommendation.recommendedTension < 0.6) {
            return {
                recommendedTension: recommendation.recommendedTension + 0.1,
                reason: `${genre}ジャンルでは高めのテンションを維持するべき`,
                direction: recommendation.direction
            };
        }
        return recommendation;
    }

    /**
     * ミステリージャンルの調整
     * @private
     */
    private applyMysteryAdjustments(
        recommendation: TensionRecommendation,
        position: number,
        chapterNumber: number
    ): TensionRecommendation {
        if (position < 0.2 || position > 0.8) {
            return {
                recommendedTension: Math.min(0.9, recommendation.recommendedTension + 0.05),
                reason: `ミステリーの${position < 0.2 ? '序盤' : '終盤'}では謎を強調するために緊張感を高める`,
                direction: "increase"
            };
        } else if (position > 0.4 && position < 0.6 && chapterNumber % 2 === 0) {
            return {
                recommendedTension: Math.max(0.4, recommendation.recommendedTension - 0.1),
                reason: "ミステリーの中盤で読者に情報整理の余裕を与えるため緊張を一時的に緩和",
                direction: "decrease"
            };
        }
        return recommendation;
    }

    /**
     * ロマンスジャンルの調整
     * @private
     */
    private applyRomanceAdjustments(
        recommendation: TensionRecommendation,
        position: number,
        chapterNumber: number
    ): TensionRecommendation {
        if (position > 0.3 && position < 0.7) {
            const isTurningPoint = (position > 0.45 && position < 0.55);
            
            if (isTurningPoint) {
                return {
                    recommendedTension: 0.8,
                    reason: "恋愛関係の転機となるポイントで高いテンションを設定",
                    direction: "increase"
                };
            } else if (chapterNumber % 3 === 0) {
                return {
                    recommendedTension: 0.4,
                    reason: "関係性の変化に伴う静かな内省的瞬間を表現",
                    direction: "decrease"
                };
            }
        }
        return recommendation;
    }

    /**
     * ファンタジー・SF調整
     * @private
     */
    private applyFantasySciFiAdjustments(
        recommendation: TensionRecommendation,
        chapterNumber: number
    ): TensionRecommendation {
        if (this.isPrime(chapterNumber) && chapterNumber > 2) {
            return {
                recommendedTension: Math.min(0.9, recommendation.recommendedTension + 0.15),
                reason: "重要な冒険/発見の場面でテンションを高める",
                direction: "increase"
            };
        } else if (chapterNumber % 4 === 0) {
            return {
                recommendedTension: Math.max(0.4, recommendation.recommendedTension - 0.1),
                reason: "冒険の合間の休息場面で緊張を緩和",
                direction: "decrease"
            };
        }
        return recommendation;
    }

    /**
     * ビジネスイベントに基づくテンション調整
     * @private
     */
    private adjustTensionForBusinessEvents(
        recommendation: TensionRecommendation,
        businessEvents: BusinessStoryEvent[],
        position: number
    ): TensionRecommendation {
        // イベント重要度の合計を計算してテンション調整の度合いを決定
        const totalSignificance = businessEvents.reduce((sum, event) => sum + event.significance, 0);
        const adjustmentFactor = Math.min(totalSignificance * 0.3, 0.3);
        
        // 最も重要なイベントを特定
        const mostSignificantEvent = [...businessEvents].sort((a, b) => b.significance - a.significance)[0];
        
        let adjustedTension = recommendation.recommendedTension;
        let reason = recommendation.reason;
        let direction = recommendation.direction;
        
        // イベントタイプに基づく特定の調整
        const eventAdjustment = this.getBusinessEventAdjustment(mostSignificantEvent.type, position);
        adjustedTension = Math.min(0.95, recommendation.recommendedTension + eventAdjustment.tensionIncrease);
        reason = eventAdjustment.reason;
        direction = "increase";
        
        // 複数のイベントが重なる場合、テンションをさらに調整
        if (businessEvents.length > 1) {
            adjustedTension = Math.min(0.95, adjustedTension + 0.05);
            reason += "（複数のビジネスイベントが重なり合う複雑な状況）";
        }
        
        // 最大/最小値の範囲内に収める
        adjustedTension = Math.max(0.3, Math.min(0.95, adjustedTension));
        
        return {
            recommendedTension: adjustedTension,
            reason,
            direction
        };
    }

    /**
     * ビジネスイベント別の調整値を取得
     * @private
     */
    private getBusinessEventAdjustment(eventType: BusinessEventType, position: number): {
        tensionIncrease: number;
        reason: string;
    } {
        switch (eventType) {
            case BusinessEventType.FUNDING_ROUND:
                return {
                    tensionIncrease: 0.2,
                    reason: "資金調達プロセスでの緊張感と投資家との交渉の重要性を強調"
                };
            case BusinessEventType.PRODUCT_LAUNCH:
                return {
                    tensionIncrease: 0.15,
                    reason: "製品ローンチに伴う期待と不安、市場の反応に対する緊張感"
                };
            case BusinessEventType.FINANCIAL_CRISIS:
                return {
                    tensionIncrease: 0.3,
                    reason: "財務危機という存続の危機に直面する極度の緊張感"
                };
            case BusinessEventType.ACQUISITION:
                return {
                    tensionIncrease: 0.25,
                    reason: "企業買収という重大な決断と交渉の緊張感を最大限に表現"
                };
            case BusinessEventType.COMPETITION:
                return {
                    tensionIncrease: 0.15,
                    reason: "競合との直接対決や市場シェア争いの緊張感"
                };
            default:
                return {
                    tensionIncrease: 0.1,
                    reason: "ビジネスイベントに伴う適度な緊張感の追加"
                };
        }
    }
    
    /**
     * 素数判定（簡易版）
     * @private
     */
    private isPrime(num: number): boolean {
        if (num <= 1) return false;
        if (num <= 3) return true;
        if (num % 2 === 0 || num % 3 === 0) return false;
        
        for (let i = 5; i * i <= num; i += 6) {
            if (num % i === 0 || num % (i + 2) === 0) return false;
        }
        
        return true;
    }

    /**
     * フィボナッチ数列の要素か判定
     * @private
     */
    private isFibonacci(num: number): boolean {
        const fibSequence = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
        return fibSequence.includes(num);
    }
    
    /**
     * ペーシング推奨の生成
     */
    generatePacingRecommendation(tension: number, genre?: string): PacingRecommendation {
        try {
            logger.debug(`Generating pacing recommendation for tension ${tension.toFixed(2)}`);
            
            let pacing: number, description: string;
            
            // ビジネスジャンル特有のペーシング調整
            if (genre && genre.toLowerCase() === 'business') {
                const businessPacing = this.getBusinessPacing(tension);
                pacing = businessPacing.pacing;
                description = businessPacing.description;
            } else {
                const generalPacing = this.getGeneralPacing(tension);
                pacing = generalPacing.pacing;
                description = generalPacing.description;
            }
            
            // わずかなランダム要素を加える
            pacing = this.addRandomVariation(pacing, 0.05);
            
            return {
                recommendedPacing: pacing,
                description
            };
        } catch (error) {
            logger.error('Failed to generate pacing recommendation', {
                error: error instanceof Error ? error.message : String(error),
                tension
            });
            
            return {
                recommendedPacing: 0.5,
                description: "バランスの取れた標準的なペース"
            };
        }
    }

    /**
     * ビジネスジャンル向けペーシング
     * @private
     */
    private getBusinessPacing(tension: number): { pacing: number; description: string } {
        if (tension >= 0.8) {
            return {
                pacing: 0.7,
                description: "重要な意思決定やピッチ、交渉シーンに適した活発なペース。簡潔な対話と明確なアクションで緊迫感を維持"
            };
        } else if (tension >= 0.6) {
            return {
                pacing: 0.6,
                description: "ビジネス展開を効果的に進めるバランスの取れたペース。戦略的思考と行動のバランスを重視"
            };
        } else if (tension >= 0.4) {
            return {
                pacing: 0.5,
                description: "市場分析やビジネスモデル検討に適した均衡のとれたペース。データと洞察を丁寧に描写"
            };
        } else {
            return {
                pacing: 0.4,
                description: "ビジョン構築や戦略的思考の深化に適したじっくりとしたペース。ビジネス哲学や価値観を丁寧に展開"
            };
        }
    }

    /**
     * 一般的なペーシング
     * @private
     */
    private getGeneralPacing(tension: number): { pacing: number; description: string } {
        if (tension >= 0.8) {
            return {
                pacing: 0.8,
                description: "緊迫感に合わせて素早いペースで進行。短い文、活発な行動、素早い対話で臨場感を演出"
            };
        } else if (tension >= 0.6) {
            return {
                pacing: 0.65,
                description: "テンションを維持するための安定したペース。行動と内省のバランスを取りながら、展開に重点"
            };
        } else if (tension >= 0.4) {
            return {
                pacing: 0.5,
                description: "バランスの取れたペース。情景描写と行動を均等に配分し、展開と掘り下げを両立"
            };
        } else {
            return {
                pacing: 0.3,
                description: "ゆったりとしたペース。細部の描写や内省に時間をかけ、情緒や背景を丁寧に構築"
            };
        }
    }
    
    /**
     * 小さなランダム変動を加える
     * @private
     */
    private addRandomVariation(value: number, maxVariation: number): number {
        const variation = (Math.random() * 2 - 1) * maxVariation;
        return Math.max(0.1, Math.min(0.95, value + variation));
    }
    
    /**
     * テンション・ペーシングの総合推奨を生成
     */
    async generateTensionPacingRecommendation(
        chapterNumber: number,
        totalChapters: number,
        genre: string,
        recentTensions: number[],
        businessEvents?: BusinessStoryEvent[]
    ): Promise<TensionPacingRecommendation> {
        try {
            const tension = await this.calculateOptimalTension(
                chapterNumber,
                totalChapters,
                genre,
                recentTensions,
                businessEvents
            );
            
            const pacing = this.generatePacingRecommendation(tension.recommendedTension, genre);
            
            return { tension, pacing };
        } catch (error) {
            logger.error('Failed to generate tension-pacing recommendation', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });
            
            return {
                tension: {
                    recommendedTension: 0.5,
                    reason: "エラーによりデフォルト値を使用",
                    direction: "maintain"
                },
                pacing: {
                    recommendedPacing: 0.5,
                    description: "バランスの取れた標準的なペース"
                }
            };
        }
    }
}