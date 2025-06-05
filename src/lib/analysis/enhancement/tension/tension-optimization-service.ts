/**
 * @fileoverview 物語のテンションとペーシングの最適化を行うサービス
 * @description
 * 物語の状態と進行に基づいて最適なテンションとペーシングを計算し、
 * 読者体験を向上させるための推奨事項を生成します。
 */

import { logger } from '@/lib/utils/logger';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { GeminiAdapter } from '../../adapters/gemini-adapter';
import { IGeminiAdapter } from '../../adapters/interfaces';
import {
  ITensionOptimizationService,
  TensionRecommendation,
  PacingRecommendation,
  TensionPacingRecommendation,
  StoryEvent,
  TensionCurvePoint,
  NarrativeArcInfo
} from './interfaces';

/**
 * @class TensionOptimizationService
 * @description 物語の状態と進行に基づいて最適なテンションとペーシングを計算し、
 * 読者体験を向上させるための推奨事項を生成するサービス
 * @implements ITensionOptimizationService
 */
export class TensionOptimizationService implements ITensionOptimizationService {
  /** 初期化済みフラグ */
  private initialized: boolean = false;
  
  /** ジャンル別の理想的テンションカーブ */
  private tensionTemplates: {[genre: string]: number[]} = {
    classic: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.7, 0.9, 0.95, 0.6, 0.3],
    mystery: [0.5, 0.6, 0.5, 0.7, 0.6, 0.7, 0.8, 0.7, 0.9, 0.95, 0.6],
    romance: [0.4, 0.5, 0.6, 0.4, 0.7, 0.5, 0.6, 0.8, 0.7, 0.9, 0.5],
    thriller: [0.6, 0.7, 0.6, 0.8, 0.7, 0.8, 0.9, 0.8, 0.95, 0.9, 0.7],
    fantasy: [0.4, 0.5, 0.6, 0.7, 0.6, 0.8, 0.7, 0.9, 0.95, 0.7, 0.5],
    scifi: [0.5, 0.6, 0.7, 0.6, 0.8, 0.7, 0.9, 0.8, 0.95, 0.7, 0.6],
    horror: [0.6, 0.7, 0.8, 0.7, 0.9, 0.8, 0.95, 0.9, 0.8, 0.95, 0.7],
    business: [0.4, 0.5, 0.6, 0.7, 0.5, 0.8, 0.6, 0.9, 0.7, 0.95, 0.6],
    // 追加ジャンル
    drama: [0.4, 0.5, 0.7, 0.6, 0.8, 0.7, 0.9, 0.8, 0.7, 0.9, 0.5],
    comedy: [0.5, 0.7, 0.6, 0.8, 0.6, 0.7, 0.5, 0.8, 0.7, 0.8, 0.6],
    historical: [0.3, 0.4, 0.5, 0.6, 0.7, 0.5, 0.7, 0.8, 0.9, 0.7, 0.5],
    adventure: [0.5, 0.6, 0.7, 0.8, 0.6, 0.7, 0.9, 0.7, 0.8, 0.95, 0.7]
  };
  
  /** テンション曲線のパターン名 */
  private tensionPatterns: {[pattern: string]: number[]} = {
    steady_climb: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.8, 0.5],
    wave: [0.5, 0.7, 0.4, 0.6, 0.8, 0.5, 0.7, 0.9, 0.95, 0.6],
    late_spike: [0.4, 0.5, 0.4, 0.6, 0.5, 0.7, 0.6, 0.8, 0.95, 0.7],
    early_peak: [0.5, 0.7, 0.9, 0.8, 0.6, 0.7, 0.8, 0.9, 0.95, 0.6],
    dual_peaks: [0.4, 0.6, 0.8, 0.6, 0.5, 0.7, 0.9, 0.7, 0.95, 0.6],
    // ジャンル特有パターン
    startup_journey: [0.5, 0.7, 0.5, 0.8, 0.4, 0.6, 0.8, 0.7, 0.95, 0.6],
    mystery_reveal: [0.5, 0.6, 0.7, 0.5, 0.8, 0.6, 0.9, 0.7, 0.95, 0.6],
    character_transformation: [0.4, 0.5, 0.7, 0.6, 0.8, 0.7, 0.9, 0.95, 0.8, 0.6],
    heroic_journey: [0.4, 0.6, 0.5, 0.7, 0.6, 0.8, 0.7, 0.9, 0.95, 0.7]
  };
  
  // テンション設計のイベントポイント
  private structuralPoints = {
    exposition: 0.1,    // 導入部（全体の約10%）
    incitingIncident: 0.15, // 発端事件（全体の約15%）
    risingAction: 0.4,  // 展開（15%〜40%）
    midpoint: 0.5,      // 中間点（全体の50%）
    complications: 0.7, // 複雑化（50%〜70%）
    climax: 0.85,       // クライマックス（全体の約85%）
    resolution: 0.95    // 解決（85%〜95%）
  };
  
  /** 最近のテンション値（キャッシュ） */
  private recentTensionsCache: Map<number, number[]> = new Map();
  
  /** 物語アーク情報（キャッシュ） */
  private arcInfoCache: NarrativeArcInfo | null = null;
  
  /**
   * @constructor
   * @param geminiAdapter Gemini APIアダプター
   */
  constructor(
    private geminiAdapter: IGeminiAdapter = new GeminiAdapter()
  ) {
    logger.info('TensionOptimizationService instantiated');
  }
  
  /**
   * サービスを初期化します
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.info('TensionOptimizationService already initialized');
      return;
    }
    
    try {
      logger.info('Initializing TensionOptimizationService');
      
      // 初期化処理
      // キャッシュのクリア
      this.recentTensionsCache.clear();
      this.arcInfoCache = null;
      
      this.initialized = true;
      logger.info('TensionOptimizationService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize TensionOptimizationService', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
  
  /**
   * テンション・ペーシング推奨を取得
   * @param chapterNumber 章番号
   * @param genre ジャンル（オプショナル）
   * @param options 追加オプション（オプショナル）
   * @returns テンション・ペーシング推奨
   */
  async getTensionPacingRecommendation(
    chapterNumber: number,
    genre?: string,
    options?: {
      totalChapters?: number;
      currentArc?: any;
      events?: StoryEvent[];
      forceCurvePattern?: string;
    }
  ): Promise<TensionPacingRecommendation> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      logger.info(`Generating tension pacing recommendation for chapter ${chapterNumber}`, {
        genre,
        options: options ? JSON.stringify(options) : 'none'
      });
      
      // オプションとデフォルト値
      const totalChapters = options?.totalChapters || 20;
      const events = options?.events || [];
      const curvePattern = options?.forceCurvePattern || null;
      
      // 最近のテンション値を取得（または空の配列）
      const recentTensions = await this.getRecentTensions(chapterNumber);
      
      // テンション推奨を計算
      const tension = await this.calculateOptimalTension(
        chapterNumber,
        totalChapters,
        genre || 'classic',
        recentTensions,
        events,
        curvePattern
      );
      
      // テンションに基づいてペーシング推奨を生成
      const pacing = this.generatePacingRecommendation(tension.recommendedTension, genre);
      
      // テンション値をキャッシュに保存
      this.updateRecentTensionsCache(chapterNumber, tension.recommendedTension);
      
      logger.debug(`Generated tension pacing recommendation for chapter ${chapterNumber}`, {
        tension: tension.recommendedTension,
        direction: tension.direction,
        pacing: pacing.recommendedPacing
      });
      
      return { tension, pacing };
    } catch (error) {
      logger.error('Failed to generate tension pacing recommendation', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });
      
      // エラー時はデフォルト値を返す
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
  
  /**
   * 最適テンション計算
   * @param chapterNumber 章番号
   * @param totalChapters 総章数
   * @param genre ジャンル
   * @param recentTensions 最近のテンション値
   * @param events ストーリーイベント情報（オプショナル）
   * @param forceCurvePattern 強制適用するカーブパターン（オプショナル）
   * @returns テンション推奨
   */
  private async calculateOptimalTension(
    chapterNumber: number,
    totalChapters: number,
    genre: string,
    recentTensions: number[],
    events: StoryEvent[] = [],
    forceCurvePattern?: string | null
  ): Promise<TensionRecommendation> {
    try {
      logger.debug(`Calculating optimal tension for chapter ${chapterNumber}`, {
        totalChapters,
        genre,
        recentTensionsCount: recentTensions.length,
        eventsCount: events.length
      });
      
      // 物語内の相対位置を計算
      const position = this.calculateNarrativePosition(chapterNumber, totalChapters);
      const normalizedPosition = Math.min(Math.floor(position * 10), 10);
      
      // パターン選択
      let selectedPattern: number[];
      
      if (forceCurvePattern && this.tensionPatterns[forceCurvePattern]) {
        // 強制パターンがある場合はそれを使用
        selectedPattern = this.tensionPatterns[forceCurvePattern];
        logger.debug(`Using forced curve pattern: ${forceCurvePattern}`);
      } else {
        // ジャンルに基づくテンプレートを取得
        const template = this.tensionTemplates[genre.toLowerCase()] || this.tensionTemplates.classic;
        selectedPattern = template;
        logger.debug(`Using genre template: ${genre.toLowerCase()}`);
      }
      
      // ベースとなるテンション値を取得
      const baseTension = selectedPattern[normalizedPosition];
      
      // 初期推奨
      let recommendation: TensionRecommendation = {
        recommendedTension: baseTension,
        reason: `物語の現在位置（${Math.round(position * 100)}%）に基づく標準的なテンション値`,
        direction: "maintain"
      };
      
      // 構造的ポイントでの特別調整
      recommendation = this.adjustForStructuralPoints(recommendation, position, chapterNumber, totalChapters);
      
      // テンション変化パターンの分析と調整
      if (recentTensions.length >= 2) {
        recommendation = this.adjustBasedOnRecentPattern(recommendation, recentTensions, position);
      }
      
      // 章番号特有の調整
      if (chapterNumber === 1) {
        // 最初の章は初期テンションを設定
        recommendation = {
          recommendedTension: 0.5,
          reason: "第1章では読者の興味を引きながらも、今後の上昇余地を残すために中程度のテンション",
          direction: "establish"
        };
      } else if (totalChapters > 0) {
        if (chapterNumber === totalChapters - 1) {
          // 最終章前は高いテンション
          recommendation = {
            recommendedTension: 0.9,
            reason: "クライマックス直前の章としてほぼ最高のテンションを維持",
            direction: "increase"
          };
        } else if (chapterNumber === totalChapters) {
          // 最終章はやや下がるがそれでも高め
          recommendation = {
            recommendedTension: 0.7,
            reason: "最終章では解決に向かいながらも余韻を残す適度なテンション",
            direction: "decrease"
          };
        }
      }
      
      // ジャンル特有の調整
      recommendation = this.applyGenreSpecificAdjustments(recommendation, genre, position, chapterNumber, totalChapters);
      
      // イベントに基づく調整
      if (events.length > 0) {
        recommendation = this.adjustTensionForEvents(recommendation, events, position);
      }
      
      // 深層データを使用した調整（必要に応じてGemini APIによる分析を追加）
      if (chapterNumber > 3 && this.shouldUseAdvancedAnalysis(chapterNumber)) {
        const advancedAdjustment = await this.getAdvancedTensionAdjustment(
          chapterNumber,
          genre,
          recommendation.recommendedTension
        );
        
        if (advancedAdjustment) {
          const blendedTension = recommendation.recommendedTension * 0.7 + advancedAdjustment.value * 0.3;
        
          const validDirections = ["increase", "decrease", "maintain", "establish"] as const;
          type TensionDirection = typeof validDirections[number];
        
          const isValidDirection = (value: any): value is TensionDirection =>
            validDirections.includes(value);
        
          recommendation = {
            recommendedTension: blendedTension,
            reason: `${recommendation.reason}、${advancedAdjustment.reason}`,
            direction: isValidDirection(advancedAdjustment.direction)
              ? advancedAdjustment.direction
              : recommendation.direction // fallback（型保証されてる）
          };
        
          logger.debug('Applied advanced tension adjustment', {
            original: recommendation.recommendedTension,
            adjustment: advancedAdjustment.value,
            blended: blendedTension
          });
        }
        
      }
      
      // ランダム要素を加える（わずかな揺らぎ）
      const finalTension = this.addRandomVariation(recommendation.recommendedTension, 0.03);
      
      const finalRecommendation = {
        ...recommendation,
        recommendedTension: finalTension
      };
      
      logger.debug(`Tension recommendation generated`, {
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
   * 構造的ポイントに基づく調整
   * @private
   */
  private adjustForStructuralPoints(
    recommendation: TensionRecommendation,
    position: number,
    chapterNumber: number,
    totalChapters: number
  ): TensionRecommendation {
    // 各構造的ポイントからの距離を計算
    const distanceToIncitingIncident = Math.abs(position - this.structuralPoints.incitingIncident);
    const distanceToMidpoint = Math.abs(position - this.structuralPoints.midpoint);
    const distanceToClimax = Math.abs(position - this.structuralPoints.climax);
    const distanceToResolution = Math.abs(position - this.structuralPoints.resolution);
    
    // 近いポイントを特定（閾値：0.05 = 5%以内）
    if (distanceToIncitingIncident < 0.05) {
      // 発端事件の近く
      return {
        recommendedTension: 0.65,
        reason: "物語の発端事件（インサイティング・インシデント）に位置するため、物語の駆動力を生むテンションを設定",
        direction: "increase"
      };
    } else if (distanceToMidpoint < 0.05) {
      // 中間点の近く
      return {
        recommendedTension: 0.7,
        reason: "物語の中間点に位置するため、物語の方向転換を示すテンションを設定",
        direction: "increase"
      };
    } else if (distanceToClimax < 0.05) {
      // クライマックスの近く
      return {
        recommendedTension: 0.9,
        reason: "物語のクライマックスに位置するため、最高レベルに近いテンションを維持",
        direction: "increase"
      };
    } else if (distanceToResolution < 0.05) {
      // 解決の近く
      return {
        recommendedTension: 0.6,
        reason: "物語の解決段階に位置するため、クライマックス後の緩和を伴うテンションを設定",
        direction: "decrease"
      };
    }
    
    // ポイント間の位置に基づく調整
    if (position < this.structuralPoints.incitingIncident) {
      // 導入部
      const adjustedTension = Math.min(0.55, recommendation.recommendedTension + 0.05);
      return {
        recommendedTension: adjustedTension,
        reason: "物語の導入部では、読者の関心を引くための適度なテンションを設定",
        direction: "establish"
      };
    } else if (position < this.structuralPoints.midpoint) {
      // 上昇部
      const progressInPhase = (position - this.structuralPoints.incitingIncident) / 
                              (this.structuralPoints.midpoint - this.structuralPoints.incitingIncident);
      const phaseAdjustment = 0.1 * progressInPhase;
      
      return {
        recommendedTension: Math.min(0.7, recommendation.recommendedTension + phaseAdjustment),
        reason: "物語の上昇部では、問題の複雑化に応じてテンションを徐々に高める",
        direction: "increase"
      };
    } else if (position < this.structuralPoints.climax) {
      // 複雑化
      const progressInPhase = (position - this.structuralPoints.midpoint) / 
                              (this.structuralPoints.climax - this.structuralPoints.midpoint);
      const phaseAdjustment = 0.15 * progressInPhase;
      
      return {
        recommendedTension: Math.min(0.85, recommendation.recommendedTension + phaseAdjustment),
        reason: "物語の複雑化段階では、クライマックスに向けてテンションを段階的に高める",
        direction: "increase"
      };
    } else if (position < this.structuralPoints.resolution) {
      // クライマックスからの解決へ
      const progressInPhase = (position - this.structuralPoints.climax) / 
                              (this.structuralPoints.resolution - this.structuralPoints.climax);
      const phaseAdjustment = -0.2 * progressInPhase;
      
      return {
        recommendedTension: Math.max(0.6, recommendation.recommendedTension + phaseAdjustment),
        reason: "クライマックス後の解決段階では、徐々にテンションを緩和",
        direction: "decrease"
      };
    } else {
      // 終結部
      return {
        recommendedTension: Math.max(0.4, recommendation.recommendedTension - 0.1),
        reason: "物語の終結部では、読者に余韻を残しつつテンションを緩和",
        direction: "decrease"
      };
    }
  }
  
  /**
   * 最近のパターンに基づく調整
   * @private
   */
  private adjustBasedOnRecentPattern(
    recommendation: TensionRecommendation,
    recentTensions: number[],
    position: number
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
    
    if (isConsistentlyRising && recentTensions.length >= 3) {
      // 3章以上連続で上昇している場合、一時的な緩和を入れる
      return {
        recommendedTension: Math.max(0.3, recentTensions[recentTensions.length - 1] - 0.15),
        reason: "複数章にわたる緊張上昇の後、一時的な緊張緩和で読者に休息を与え、次の盛り上がりへの準備をする",
        direction: "decrease"
      };
    } else if (isConsistentlyFalling && recentTensions.length >= 3) {
      // 3章以上連続で下降している場合、下降を反転させる
      return {
        recommendedTension: Math.min(0.9, recentTensions[recentTensions.length - 1] + 0.2),
        reason: "複数章にわたる緊張低下の後、予想外の出来事や転機によって緊張を上昇させ、読者の興味を再喚起する",
        direction: "increase"
      };
    } else if (isConsistentlyFlat && recentTensions.length >= 2) {
      // 変化なしが続いている場合、物語のフェーズに応じた変化を加える
      const currentTension = recentTensions[recentTensions.length - 1];
      
      // 物語位置に基づく変化方向の決定
      // 物語前半は上昇傾向、後半は変化を入れる
      if (position < 0.4) {
        // 物語前半：上昇傾向
        return {
          recommendedTension: Math.min(0.8, currentTension + 0.15),
          reason: "物語前半で緊張の停滞があるため、物語を前進させるために緊張度を上げる",
          direction: "increase"
        };
      } else if (position > 0.7) {
        // 物語後半：緊張が高い場合は一時的な緩和、低い場合は上昇
        if (currentTension > 0.7) {
          return {
            recommendedTension: Math.max(0.5, currentTension - 0.15),
            reason: "物語後半の高い緊張が続いた後、一時的な静けさを提供してクライマックスの効果を高める",
            direction: "decrease"
          };
        } else {
          return {
            recommendedTension: Math.min(0.9, currentTension + 0.2),
            reason: "物語のクライマックスに向けて緊張を高め、物語の解決に向けた盛り上がりを作る",
            direction: "increase"
          };
        }
      } else {
        // 物語中盤：変化のパターンを作る
        // 奇数/偶数チャプターで異なる方向性
        const changeDirection = Math.random() > 0.5;
        
        if (changeDirection) {
          return {
            recommendedTension: Math.min(0.85, currentTension + 0.15),
            reason: "緊張の単調さを打破し、物語に新たな動きを与えるために緊張度を上げる",
            direction: "increase"
          };
        } else {
          return {
            recommendedTension: Math.max(0.4, currentTension - 0.1),
            reason: "緊張の単調さを打破し、次の盛り上がりの効果を高めるために一時的に緊張を緩和する",
            direction: "decrease"
          };
        }
      }
    }
    
    // その他の場合は元の推奨を返す
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
      case 'thriller':
      case 'horror':
        // スリラー/ホラーでは全体的に高めのテンション
        if (recommendation.recommendedTension < 0.6) {
          return {
            recommendedTension: recommendation.recommendedTension + 0.15,
            reason: `${genre}ジャンルでは読者の期待に応えるため全体的に高めのテンションを維持する`,
            direction: "increase"
          };
        }
        break;
        
      case 'mystery':
        // ミステリーでは序盤と終盤に高め、中盤は変化をつける
        if (position < 0.2 || position > 0.8) {
          return {
            recommendedTension: Math.min(0.9, recommendation.recommendedTension + 0.1),
            reason: `ミステリーの${position < 0.2 ? '序盤では謎の提示' : '終盤では謎の解明'}に向けて緊張感を高める`,
            direction: "increase"
          };
        } else if (position > 0.4 && position < 0.6 && chapterNumber % 2 === 0) {
          // 中盤は2章ごとに緊張緩和を入れる
          return {
            recommendedTension: Math.max(0.4, recommendation.recommendedTension - 0.15),
            reason: `ミステリーの中盤では読者に情報整理の余裕を与えるため緊張を一時的に緩和する`,
            direction: "decrease"
          };
        } else if (this.isPrime(chapterNumber) && chapterNumber > 3) {
          // 素数章では新たな謎や証拠の発見
          return {
            recommendedTension: Math.min(0.85, recommendation.recommendedTension + 0.12),
            reason: "新たな証拠や手がかりの発見によって物語の緊張度を高める",
            direction: "increase"
          };
        }
        break;
        
      case 'romance':
        // ロマンスでは中盤に大きな起伏をつける
        if (position > 0.3 && position < 0.7) {
          const isTurningPoint = (position > 0.45 && position < 0.55);
          
          if (isTurningPoint) {
            return {
              recommendedTension: 0.8,
              reason: "恋愛関係の転機となるポイントで高いテンションを設定し、関係性の変化を強調する",
              direction: "increase"
            };
          } else if (chapterNumber % 3 === 0) {
            return {
              recommendedTension: 0.4,
              reason: "関係性の変化に伴う静かな内省的瞬間を表現し、キャラクターの感情の深さを描写する",
              direction: "decrease"
            };
          }
        } else if (position > 0.8 && position < 0.9) {
          // 終盤の危機（関係性の危機）
          return {
            recommendedTension: 0.85,
            reason: "関係性の最終的な危機や試練を描くために高いテンションを設定する",
            direction: "increase"
          };
        }
        break;
        
      case 'fantasy':
      case 'scifi':
        // ファンタジー/SFでは、大きな冒険や発見のポイントで高いテンション
        // 章番号が素数の場合、重要な発見や冒険の山場と仮定
        if (this.isPrime(chapterNumber) && chapterNumber > 2) {
          return {
            recommendedTension: Math.min(0.9, recommendation.recommendedTension + 0.15),
            reason: "重要な冒険/発見の場面でテンションを高め、世界観の探索や拡張を強調する",
            direction: "increase"
          };
        } else if (chapterNumber % 4 === 0) { // 4の倍数の章では休息
          return {
            recommendedTension: Math.max(0.4, recommendation.recommendedTension - 0.15),
            reason: "冒険の合間の休息場面で緊張を緩和し、キャラクターの成長や世界観の理解を深める",
            direction: "decrease"
          };
        } else if (position > 0.75 && position < 0.85) {
          // 終盤の大きな対決/収束
          return {
            recommendedTension: 0.9,
            reason: "物語の終盤における最終的な対決や真実の発見を強調するために高いテンションを設定",
            direction: "increase"
          };
        }
        break;
        
      case 'business':
        // ビジネスジャンル特有の調整
        // 物語の位置に応じた調整
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
        } else if (position >= 0.5 && position < 0.8) {
          // 後半中盤（拡大期/危機期）
          const isExpansionChapter = chapterNumber % 4 === 0;
          const isCrisisChapter = chapterNumber % 4 === 2;
          
          if (isExpansionChapter) { // 拡大章
            return {
              recommendedTension: 0.7,
              reason: "ビジネス拡大や新市場参入に伴う期待と不安のバランスを表現するテンション",
              direction: "increase"
            };
          } else if (isCrisisChapter) { // 危機章
            return {
              recommendedTension: 0.85,
              reason: "ビジネス上の重大な危機や決断ポイントを強調する高いテンション",
              direction: "increase"
            };
          }
        } else {
          // 終盤（決断/結末期）
          if (position > 0.85 && position < 0.95) {
            return {
              recommendedTension: 0.9,
              reason: "ビジネスストーリーのクライマックスとなる重要な意思決定を強調する高いテンション",
              direction: "increase"
            };
          } else if (position >= 0.95) {
            return {
              recommendedTension: 0.75,
              reason: "ビジネスの成功または失敗の結果を描きながらも将来への示唆を残すテンション",
              direction: "decrease"
            };
          }
        }
        break;
        
      case 'drama':
        // ドラマ特有の調整
        if (position > 0.4 && position < 0.6) {
          // 中盤で人間関係の複雑化
          return {
            recommendedTension: Math.min(0.85, recommendation.recommendedTension + 0.1),
            reason: "人間関係の複雑化や価値観の衝突によるドラマの中核的な緊張を表現",
            direction: "increase"
          };
        } else if (chapterNumber % 5 === 0) {
          // 5の倍数の章では感情的な頂点
          return {
            recommendedTension: Math.min(0.9, recommendation.recommendedTension + 0.15),
            reason: "感情の爆発や重要な告白の場面で高いテンションを設定",
            direction: "increase"
          };
        }
        break;
        
      case 'comedy':
        // コメディ特有の調整
        // コメディは緊張と緩和の波が重要
        if (chapterNumber % 2 === 0) {
          // 偶数章では状況のコミカルな複雑化
          return {
            recommendedTension: Math.min(0.8, recommendation.recommendedTension + 0.1),
            reason: "コミカルな誤解や複雑化の進行に伴うテンションの上昇",
            direction: "increase"
          };
        } else {
          // 奇数章では一時的な解決や休憩
          return {
            recommendedTension: Math.max(0.4, recommendation.recommendedTension - 0.1),
            reason: "コミカルな状況の一時的な解決や休憩によるテンションの緩和",
            direction: "decrease"
          };
        }
        break;
        
      case 'historical':
        // 歴史小説特有の調整
        if (position < 0.3) {
          // 序盤は時代背景の紹介
          return {
            recommendedTension: Math.max(0.4, recommendation.recommendedTension - 0.05),
            reason: "歴史的背景や時代設定を丁寧に描写するためのやや抑えたテンション",
            direction: "maintain"
          };
        } else if (this.isPrime(chapterNumber) && chapterNumber > 3) {
          // 素数章では歴史的転換点
          return {
            recommendedTension: Math.min(0.85, recommendation.recommendedTension + 0.15),
            reason: "歴史的な転換点や重要なイベントを強調する高いテンション",
            direction: "increase"
          };
        }
        break;
        
      case 'adventure':
        // 冒険小説特有の調整
        if (this.isFibonacci(chapterNumber)) {
          // フィボナッチ数章では重要な冒険ポイント
          return {
            recommendedTension: Math.min(0.9, recommendation.recommendedTension + 0.15),
            reason: "重要な冒険ポイントや挑戦を強調する高いテンション",
            direction: "increase"
          };
        } else if (chapterNumber % 3 === 0) {
          // 3の倍数章では新たな環境/場所の探索
          return {
            recommendedTension: 0.7,
            reason: "新たな環境や状況への適応を描写する適度なテンション",
            direction: "maintain"
          };
        }
        break;
    }
    
    // 調整がない場合は元の推奨を返す
    return recommendation;
  }
  
  /**
   * イベントに基づくテンション調整
   * @private
   * @param recommendation 基本推奨
   * @param events ストーリーイベント情報
   * @param position 物語内の相対位置
   * @returns 調整後の推奨
   */
  private adjustTensionForEvents(
    recommendation: TensionRecommendation,
    events: StoryEvent[],
    position: number
  ): TensionRecommendation {
    // イベント重要度の合計を計算してテンション調整の度合いを決定
    const totalSignificance = events.reduce((sum, event) => sum + event.significance, 0);
    const adjustmentFactor = Math.min(totalSignificance * 0.3, 0.3); // 最大調整値を0.3に制限
    
    // 最も重要なイベントを特定
    const mostSignificantEvent = [...events].sort((a, b) => b.significance - a.significance)[0];
    
    // デフォルトでは調整なし
    let adjustedTension = recommendation.recommendedTension;
    let reason = recommendation.reason;
    let direction = recommendation.direction;
    
    // イベントタイプに基づく特定の調整
    switch (mostSignificantEvent.type.toLowerCase()) {
      case 'battle':
      case 'conflict':
      case 'confrontation':
        // 戦闘/対立は高いテンション
        adjustedTension = Math.min(0.9, recommendation.recommendedTension + 0.2);
        reason = "直接的な対立や戦闘シーンの緊張感を最大限に表現";
        direction = "increase";
        break;
        
      case 'revelation':
      case 'discovery':
        // 発見/啓示は中高レベルのテンション
        adjustedTension = Math.min(0.8, recommendation.recommendedTension + 0.15);
        reason = "重要な真実の発見や啓示に伴う衝撃と再評価の緊張感";
        direction = "increase";
        break;
        
      case 'betrayal':
        // 裏切りは高いテンション
        adjustedTension = Math.min(0.9, recommendation.recommendedTension + 0.25);
        reason = "裏切りによる信頼の崩壊と感情的衝撃の緊張感を表現";
        direction = "increase";
        break;
        
      case 'loss':
      case 'death':
        // 喪失/死は高いテンション
        adjustedTension = Math.min(0.85, recommendation.recommendedTension + 0.2);
        reason = "喪失や死に伴う悲しみと絶望の感情的緊張を表現";
        direction = "increase";
        break;
        
      case 'romance':
      case 'love':
        // 恋愛イベントはテンションの波を作る
        if (position < 0.6) { // 前半では上昇
          adjustedTension = Math.min(0.75, recommendation.recommendedTension + 0.1);
          reason = "恋愛関係の発展に伴う期待と不安のバランスを表現";
          direction = "increase";
        } else { // 後半では高め
          adjustedTension = Math.min(0.85, recommendation.recommendedTension + 0.15);
          reason = "恋愛関係の深化や試練を描く感情的な緊張感を表現";
          direction = "increase";
        }
        break;
        
      case 'journey':
      case 'travel':
        // 旅/移動はやや低めのテンション
        adjustedTension = Math.max(0.4, recommendation.recommendedTension - 0.1);
        reason = "旅や移動の過程を描写する余裕あるテンポと適度な緊張感";
        direction = "decrease";
        break;
        
      case 'decision':
        // 重要な決断は中高レベルのテンション
        adjustedTension = Math.min(0.8, recommendation.recommendedTension + 0.1);
        reason = "重要な決断に伴う内的葛藤と結果への不安を表現";
        direction = "increase";
        break;
        
      case 'reunion':
        // 再会は中レベルのテンション
        adjustedTension = 0.65;
        reason = "再会の感動と過去の関係性の緊張を表現";
        direction = "maintain";
        break;
        
      case 'escape':
      case 'chase':
        // 逃亡/追跡は高いテンション
        adjustedTension = Math.min(0.95, recommendation.recommendedTension + 0.25);
        reason = "追跡や逃亡シーンの緊迫感と危機感を最大限に表現";
        direction = "increase";
        break;
        
      case 'celebration':
      case 'victory':
        // 祝福/勝利は中から低レベルのテンション
        adjustedTension = Math.max(0.3, recommendation.recommendedTension - 0.2);
        reason = "勝利や祝福の場面での安堵感と解放感を表現";
        direction = "decrease";
        break;
        
      default:
        // その他の場合は小さな調整のみ
        adjustedTension = recommendation.recommendedTension + (adjustmentFactor * 0.5);
        reason = recommendation.reason;
        direction = recommendation.direction;
    }
    
    // 複数のイベントが重なる場合、テンションをさらに調整
    if (events.length > 1) {
      const secondEventSignificance = events.length > 1 ? 
        events.sort((a, b) => b.significance - a.significance)[1].significance : 0;
      
      if (secondEventSignificance > 0.6) {
        adjustedTension = Math.min(0.95, adjustedTension + 0.05);
        reason += "（複数の重要イベントが重なり合う複雑な状況）";
      }
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
   * ペーシング推奨の生成
   * @param tension テンション値
   * @param genre ジャンル（オプショナル）
   * @returns ペーシング推奨
   */
  private generatePacingRecommendation(tension: number, genre?: string): PacingRecommendation {
    try {
      logger.debug(`Generating pacing recommendation for tension ${tension.toFixed(2)}`);
      
      // テンションに基づいてペーシングを推奨
      let pacing: number, description: string;
      const normalizedGenre = genre?.toLowerCase() || '';
      
      // ジャンル特有のペーシング調整
      if (normalizedGenre === 'business') {
        // ビジネスジャンル特有のペーシング
        if (tension >= 0.8) {
          // 高テンションでは中高速ペース（ビジネス重要シーン）
          pacing = 0.7;
          description = "重要な意思決定やピッチ、交渉シーンに適した活発なペース。簡潔な対話と明確なアクションで緊迫感を維持";
        } else if (tension >= 0.6) {
          // 中高テンションでは中速ペース（ビジネス進行シーン）
          pacing = 0.6;
          description = "ビジネス展開を効果的に進めるバランスの取れたペース。戦略的思考と行動のバランスを重視";
        } else if (tension >= 0.4) {
          // 中テンションでは中程度のペース（ビジネス分析シーン）
          pacing = 0.5;
          description = "市場分析やビジネスモデル検討に適した均衡のとれたペース。データと洞察を丁寧に描写";
        } else {
          // 低テンションではやや遅いペース（ビジネス内省シーン）
          pacing = 0.4;
          description = "ビジョン構築や戦略的思考の深化に適したじっくりとしたペース。ビジネス哲学や価値観を丁寧に展開";
        }
      } else if (normalizedGenre === 'thriller' || normalizedGenre === 'horror') {
        // スリラー/ホラー特有のペーシング
        if (tension >= 0.8) {
          // 高テンションでは速いペース
          pacing = 0.85;
          description = "恐怖や危機感を最大化する速いペース。短い文、激しい行動、断片的な描写で読者の不安を高める";
        } else if (tension >= 0.6) {
          // 中高テンションでは中高速ペース
          pacing = 0.7;
          description = "不穏な雰囲気を構築しながら、徐々に恐怖を高めるペース。描写と行動のバランスを取りつつ、不安を維持";
        } else if (tension >= 0.4) {
          // 中テンションでは不気味な中程度のペース
          pacing = 0.55;
          description = "不気味さを醸成する中程度のペース。環境描写を丁寧に行い、恐怖の伏線を張る";
        } else {
          // 低テンションでは遅めのペース
          pacing = 0.4;
          description = "静かな恐怖を構築する遅めのペース。日常の中に潜む違和感や不安を丁寧に描き出す";
        }
      } else if (normalizedGenre === 'mystery') {
        // ミステリー特有のペーシング
        if (tension >= 0.8) {
          // 高テンションではやや速いペース（重要な発見や危機）
          pacing = 0.75;
          description = "重要な発見や危機的状況での緊迫したペース。情報の急展開と登場人物の反応を効果的に描写";
        } else if (tension >= 0.6) {
          // 中高テンションでは中速ペース（捜査活動）
          pacing = 0.65;
          description = "謎解きの過程を効果的に進めるバランスの取れたペース。手がかりと推理を明確に提示";
        } else if (tension >= 0.4) {
          // 中テンションでは中程度のペース（情報収集）
          pacing = 0.5;
          description = "情報収集と分析のための適切なペース。細部への注意と論理的思考を重視した展開";
        } else {
          // 低テンションではやや遅いペース（考察場面）
          pacing = 0.4;
          description = "推理と考察のための余裕あるペース。情報の整理と重要な細部の描写に時間をかける";
        }
      } else if (normalizedGenre === 'romance') {
        // ロマンス特有のペーシング
        if (tension >= 0.8) {
          // 高テンションでは感情的な場面の中速ペース
          pacing = 0.7;
          description = "感情の爆発や関係性の危機での適度なペース。感情描写と対話のバランスを重視";
        } else if (tension >= 0.6) {
          // 中高テンションでは関係発展の中速ペース
          pacing = 0.6;
          description = "関係性の発展や変化を描く適切なペース。対話と内面描写のバランスを取りながら感情の機微を表現";
        } else if (tension >= 0.4) {
          // 中テンションでは日常的な関係性の中程度のペース
          pacing = 0.5;
          description = "日常的な関係性を丁寧に描くペース。些細な交流や感情の変化を大切にした描写";
        } else {
          // 低テンションでは内省的なやや遅いペース
          pacing = 0.4;
          description = "内省的な感情の探求に適したゆったりとしたペース。感情の機微や心の変化を繊細に描写";
        }
      } else {
        // 一般的なジャンル向けの既存ロジック
        if (tension >= 0.8) {
          // 高テンションでは速いペース
          pacing = 0.8;
          description = "緊迫感に合わせて素早いペースで進行。短い文、活発な行動、素早い対話で臨場感を演出";
        } else if (tension >= 0.6) {
          // 中高テンションでは中高速ペース
          pacing = 0.65;
          description = "テンションを維持するための安定したペース。行動と内省のバランスを取りながら、展開に重点";
        } else if (tension >= 0.4) {
          // 中テンションでは中程度のペース
          pacing = 0.5;
          description = "バランスの取れたペース。情景描写と行動を均等に配分し、展開と掘り下げを両立";
        } else {
          // 低テンションではゆっくりしたペース
          pacing = 0.3;
          description = "ゆったりとしたペース。細部の描写や内省に時間をかけ、情緒や背景を丁寧に構築";
        }
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
      
      // エラー時はデフォルト値を返す
      return {
        recommendedPacing: 0.5,
        description: "バランスの取れた標準的なペース"
      };
    }
  }
  
  /**
   * テンション最適化提案を生成
   * @param chapterNumber 章番号
   * @param currentTension 現在のテンション値
   * @returns テンション最適化提案の配列
   */
  async generateTensionOptimizationSuggestions(
    chapterNumber: number,
    currentTension: number
  ): Promise<string[]> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      logger.info(`Generating tension optimization suggestions for chapter ${chapterNumber}`, {
        currentTension
      });
      
      // テンション・ペーシング推奨を取得
      const recommendation = await this.getTensionPacingRecommendation(chapterNumber);
      
      // 推奨テンションと現在のテンションを比較
      const tensionDiff = recommendation.tension.recommendedTension - currentTension;
      const direction = tensionDiff > 0.1 ? "increase" : 
                       tensionDiff < -0.1 ? "decrease" : "maintain";
      
      // Gemini APIを使用して具体的な提案を生成
      return await this.generateSpecificSuggestions(
        chapterNumber,
        currentTension,
        recommendation,
        direction
      );
    } catch (error) {
      logger.error('Failed to generate tension optimization suggestions', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber,
        currentTension
      });
      
      // エラー時は基本的な提案を返す
      return this.getDefaultSuggestions(chapterNumber, currentTension);
    }
  }
  
  /**
   * 具体的な提案を生成
   * @private
   * @param chapterNumber 章番号
   * @param currentTension 現在のテンション値
   * @param recommendation テンション・ペーシング推奨
   * @param direction 方向性
   * @returns 具体的な提案の配列
   */
  private async generateSpecificSuggestions(
    chapterNumber: number,
    currentTension: number,
    recommendation: TensionPacingRecommendation,
    direction: string
  ): Promise<string[]> {
    try {
      // 方向性に応じた提案のテンプレート
      const suggestionTemplates = {
        increase: [
          "予期せぬ障害や問題を導入して緊張感を高める",
          "キャラクター間の対立や衝突を強調する",
          "時間制限や切迫感のある状況を設定する",
          "重要な情報の明かしを適切なタイミングで行う",
          "環境描写で不安や危険を暗示する"
        ],
        decrease: [
          "キャラクターの内省や対話の場面を設ける",
          "安全な環境や休息の場面を提供する",
          "ユーモアや軽い瞬間を取り入れる",
          "問題の一時的な解決や進展を示す",
          "環境描写でより安定した雰囲気を作る"
        ],
        maintain: [
          "現在の緊張状態を維持しながら新たな要素を導入する",
          "キャラクターの発展に焦点を当てる",
          "伏線を着実に展開させる",
          "世界観や設定の詳細を掘り下げる",
          "現在の障害に対する解決策の模索を描写する"
        ]
      };
      
      // 基本的な提案セットを取得
      const baseSuggestions = suggestionTemplates[direction as keyof typeof suggestionTemplates] || 
                              suggestionTemplates.maintain;
      
      // Gemini APIを使用して章固有の提案を生成
      const prompt = `
あなたは物語テンションとペーシングの専門家です。以下の情報に基づいて、具体的なテンション最適化の提案を3つ生成してください。

章番号: ${chapterNumber}
現在のテンション値: ${currentTension} (0～1の範囲)
推奨テンション値: ${recommendation.tension.recommendedTension} (0～1の範囲)
推奨理由: ${recommendation.tension.reason}
方向性: ${recommendation.tension.direction}
推奨ペーシング: ${recommendation.pacing.recommendedPacing} (0～1の範囲)
ペーシング説明: ${recommendation.pacing.description}

提案では以下の点に注意してください:
- テンション値を ${direction === "increase" ? "上げる" : direction === "decrease" ? "下げる" : "維持する"} 具体的な方法を提示
- 各提案は短く具体的に、一文で表現する
- 物語要素（対立、驚き、情報開示、環境など）を活用した実践的な提案
- ペーシングと調和するテンション調整法を考慮

提案形式:
1. [具体的な提案1]
2. [具体的な提案2]
3. [具体的な提案3]

注意: 番号と「」などの記号は含めず、提案のテキストのみを返してください。
`;

      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateContent(prompt, {
          temperature: 0.7,
          purpose: 'analysis'
        })
      );
      
      // レスポンスを解析して提案を抽出
      const generatedSuggestions = response
        .split(/\n+/)
        .map(line => line.trim())
        .filter(line => line.length > 10 && !line.match(/^\d+\./));
      
      // 生成された提案が少ない場合はテンプレートから補完
      const combinedSuggestions = [...generatedSuggestions];
      
      if (combinedSuggestions.length < 3) {
        const missingCount = 3 - combinedSuggestions.length;
        for (let i = 0; i < missingCount; i++) {
          if (baseSuggestions[i]) {
            combinedSuggestions.push(baseSuggestions[i]);
          }
        }
      }
      
      // 最大5つの提案に制限
      return combinedSuggestions.slice(0, 5);
    } catch (error) {
      logger.error('Failed to generate specific suggestions', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });
      
      // エラー時はデフォルトの提案を返す
      return this.getDefaultSuggestions(chapterNumber, currentTension);
    }
  }
  
  /**
   * デフォルトの提案を取得
   * @private
   * @param chapterNumber 章番号
   * @param currentTension 現在のテンション値
   * @returns デフォルトの提案の配列
   */
  private getDefaultSuggestions(chapterNumber: number, currentTension: number): string[] {
    const lowTension = currentTension < 0.4;
    const highTension = currentTension > 0.7;
    
    if (lowTension) {
      return [
        "予期せぬ障害や困難を導入して緊張感を高める",
        "キャラクター間の対立や意見の相違を明確に示す",
        "読者にとって重要な情報をキャラクターに明かさないことで不安感を作る",
        "環境描写を通じて不穏な雰囲気や危険を暗示する",
        "期限や時間制約の要素を導入して緊急性を高める"
      ];
    } else if (highTension) {
      return [
        "キャラクターが振り返りや内省をする場面を設けてテンションを一時的に下げる",
        "解決に向かう小さな進展を示して読者に休息を与える",
        "環境描写でより安定した雰囲気を作り緊張を緩和する",
        "ユーモアや明るい瞬間を挿入してコントラストをつける",
        "キャラクターの協力シーンを通じて連帯感を示し一時的に緊張を緩和する"
      ];
    } else {
      return [
        "現在の緊張状態を維持しながら新たな謎や問題を徐々に導入する",
        "キャラクターの内面的成長と外部からの圧力のバランスを取る",
        "予期せぬ展開を小さく入れつつも全体の一貫性を保つ",
        "環境描写と行動描写のバランスを取りながら物語を進める",
        "伏線を着実に展開させながら新たな疑問も提示する"
      ];
    }
  }
  
  /**
   * テンション曲線を生成
   * @param totalChapters 総章数
   * @param genre ジャンル（オプショナル）
   * @returns テンション曲線のポイント配列
   */
  async generateTensionCurve(
    totalChapters: number,
    genre?: string
  ): Promise<TensionCurvePoint[]> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      logger.info(`Generating tension curve for ${totalChapters} chapters`, {
        genre
      });
      
      // ジャンルに基づくテンプレートを取得
      const normalizedGenre = genre?.toLowerCase() || 'classic';
      const template = this.tensionTemplates[normalizedGenre] || this.tensionTemplates.classic;
      
      // 曲線の生成
      const curve: TensionCurvePoint[] = [];
      
      for (let i = 1; i <= totalChapters; i++) {
        // テンプレート内の相対位置を計算
        const templatePosition = (i - 1) / (totalChapters - 1) * (template.length - 1);
        const templateIndex = Math.floor(templatePosition);
        const remainder = templatePosition - templateIndex;
        
        // 隣接する2点間の線形補間
        let tension: number;
        if (templateIndex < template.length - 1) {
          tension = template[templateIndex] * (1 - remainder) + template[templateIndex + 1] * remainder;
        } else {
          tension = template[template.length - 1];
        }
        
        // ジャンル特有の調整（素数章での調整、クライマックスなど）
        tension = this.adjustTensionForChapter(tension, i, totalChapters, normalizedGenre);
        
        // 小さなランダム変動を加える（クライマックス以外）
        const isNearClimax = i > totalChapters * 0.8 && i < totalChapters;
        const variationAmount = isNearClimax ? 0.02 : 0.05;
        
        tension = this.addRandomVariation(tension, variationAmount);
        
        // 説明を生成
        let description = "";
        
        // 重要なポイントの説明を追加
        if (i === 1) {
          description = "導入：読者の興味を惹きつける最初の章";
        } else if (i === Math.round(totalChapters * this.structuralPoints.incitingIncident)) {
          description = "発端事件：物語を始動させる重要なイベント";
        } else if (i === Math.round(totalChapters * this.structuralPoints.midpoint)) {
          description = "中間点：物語の方向性を変える重要な転換点";
        } else if (i === Math.round(totalChapters * this.structuralPoints.climax)) {
          description = "クライマックス：物語のピークとなる決定的な瞬間";
        } else if (i === totalChapters) {
          description = "結末：物語を締めくくり、解決をもたらす最終章";
        } else if (this.isPrime(i) && i > 3) {
          description = "重要な展開ポイント：物語に新たな要素や転機をもたらす章";
        }
        
        curve.push({
          chapterNumber: i,
          tension: Number(tension.toFixed(2)),
          description
        });
      }
      
      return curve;
    } catch (error) {
      logger.error('Failed to generate tension curve', {
        error: error instanceof Error ? error.message : String(error),
        totalChapters,
        genre
      });
      
      // エラー時は簡易的な曲線を返す
      const defaultCurve: TensionCurvePoint[] = [];
      
      for (let i = 1; i <= totalChapters; i++) {
        // 単純な山型の曲線（中間点までは上昇、その後下降し、クライマックスで再上昇）
        const position = i / totalChapters;
        let tension;
        
        if (position < 0.5) {
          // 前半は上昇
          tension = 0.3 + (position * 0.8);
        } else if (position < 0.8) {
          // 中盤はやや下降
          tension = 0.7 - ((position - 0.5) * 0.4);
        } else {
          // 終盤は再上昇してから最後に少し下降
          tension = 0.5 + ((position - 0.8) * 2.0);
          
          // 最終章は少し下げる
          if (i === totalChapters) {
            tension -= 0.2;
          }
        }
        
        defaultCurve.push({
          chapterNumber: i,
          tension: Math.min(0.95, Math.max(0.3, tension)),
          description: ""
        });
      }
      
      return defaultCurve;
    }
  }
  
  /**
   * クライマックス配置の推奨を取得
   * @param totalChapters 総章数
   * @param genre ジャンル（オプショナル）
   * @returns クライマックス配置の推奨
   */
  async recommendClimax(
    totalChapters: number,
    genre?: string
  ): Promise<{
    climaxChapter: number;
    secondaryClimaxChapters: number[];
    reason: string;
  }> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      logger.info(`Generating climax recommendation for ${totalChapters} chapters`, {
        genre
      });
      
      // ジャンルに基づく調整
      const normalizedGenre = genre?.toLowerCase() || 'classic';
      
      // 基本的なクライマックス位置（全体の85%付近）
      let climaxPosition = this.structuralPoints.climax;
      let reason = `標準的な三幕構成に基づき、第二幕のピーク（全体の約${Math.round(climaxPosition * 100)}%）にクライマックスを配置`;
      let secondaryPositions: number[] = [0.6]; // デフォルトの補助クライマックス
      
      // ジャンル特有の調整
      switch (normalizedGenre) {
        case 'mystery':
          // ミステリーでは真相解明の前にもう一つ山が必要
          climaxPosition = 0.85; // やや後方
          secondaryPositions = [0.65, 0.4]; // 重要な手がかり発見とミスリード
          reason = "ミステリーでは真相解明のメインクライマックスに加え、重要な手がかり発見と誤った方向への展開という2つの補助クライマックスが効果的";
          break;
          
        case 'thriller':
        case 'horror':
          // スリラー/ホラーでは複数の緊張ピークが効果的
          climaxPosition = 0.9; // 後方に設定
          secondaryPositions = [0.7, 0.5, 0.3]; // 複数の不穏な展開
          reason = "スリラー/ホラーでは最終的な対決/恐怖の後方配置に加え、複数の不穏な展開を早期から配置して緊張を段階的に高める構造が効果的";
          break;
          
        case 'romance':
          // ロマンスでは最終的な関係確立の前に試練が必要
          climaxPosition = 0.85;
          secondaryPositions = [0.65, 0.45]; // 関係危機と初期関係発展
          reason = "ロマンスでは最終的な関係確立の前に、大きな関係の危機（黒い瞬間）と初期の関係発展という2つの重要な感情的ピークを設けるのが効果的";
          break;
          
        case 'adventure':
          // 冒険では複数の冒険ポイントが必要
          climaxPosition = 0.85;
          secondaryPositions = [0.55, 0.25]; // 中間の大きな冒険と最初の挑戦
          reason = "冒険物語では最終的な決戦/目標達成に加え、中間点での重要な冒険と最初の大きな挑戦という補助クライマックスを設けるのが効果的";
          break;
          
        case 'fantasy':
        case 'scifi':
          // ファンタジー/SFでは世界観の拡大に合わせてピークを設ける
          climaxPosition = 0.85;
          secondaryPositions = [0.6, 0.3]; // 世界の真実発見と最初の異世界体験
          reason = "ファンタジー/SFでは最終的な対決に加え、世界の真実発見と最初の異世界/未来体験という、世界観拡大に合わせた補助クライマックスが効果的";
          break;
          
        case 'business':
          // ビジネスストーリーでは複数の障壁と成功
          climaxPosition = 0.8; // やや早め
          secondaryPositions = [0.6, 0.35]; // 主要な障壁と初期成功
          reason = "ビジネスストーリーでは主要な成果/決断の前に、大きな障壁克服と初期成功という2つの重要な展開点を設けるのが効果的";
          break;
      }
      
      // 章番号に変換
      const climaxChapter = Math.round(totalChapters * climaxPosition);
      const secondaryClimaxChapters = secondaryPositions.map(pos => 
        Math.round(totalChapters * pos)
      ).filter(chapter => chapter !== climaxChapter && chapter > 0 && chapter < totalChapters);
      
      // 重複を削除
      const uniqueSecondaryChapters = [...new Set(secondaryClimaxChapters)];
      
      return {
        climaxChapter,
        secondaryClimaxChapters: uniqueSecondaryChapters,
        reason
      };
    } catch (error) {
      logger.error('Failed to recommend climax', {
        error: error instanceof Error ? error.message : String(error),
        totalChapters,
        genre
      });
      
      // エラー時はデフォルト値を返す
      const defaultClimaxChapter = Math.round(totalChapters * 0.85);
      const defaultSecondaryChapter = Math.round(totalChapters * 0.6);
      
      return {
        climaxChapter: defaultClimaxChapter,
        secondaryClimaxChapters: [defaultSecondaryChapter],
        reason: "三幕構成の標準的なパターンに基づいたクライマックス配置"
      };
    }
  }
  
  /**
   * 特定の章のテンションを調整
   * @private
   */
  private adjustTensionForChapter(
    tension: number,
    chapterNumber: number,
    totalChapters: number,
    genre: string
  ): number {
    // 物語位置を計算
    const position = chapterNumber / totalChapters;
    
    // 特殊な章番号での調整
    if (this.isPrime(chapterNumber) && chapterNumber > 3) {
      // 素数の章では重要なイベントが発生すると仮定して調整
      tension = Math.min(0.9, tension + 0.1);
    } else if (this.isFibonacci(chapterNumber)) {
      // フィボナッチ数列の章では物語の黄金比に基づく転換点と仮定
      tension = Math.min(0.85, tension + 0.07);
    }
    
    // スリラー/ホラー特有の突発的な緊張
    if ((genre === 'thriller' || genre === 'horror') && chapterNumber % 3 === 2) {
      tension = Math.min(0.9, tension + 0.1);
    }
    
    // ロマンス特有のアップダウン
    if (genre === 'romance' && chapterNumber % 4 === 0) {
      tension = Math.max(0.4, tension - 0.1);
    }
    
    // ミステリー特有の誤った方向への誘導/真実の発見
    if (genre === 'mystery' && this.isPrime(chapterNumber) && chapterNumber > 5) {
      tension = Math.min(0.85, tension + 0.15);
    }
    
    // クライマックス付近での調整
    if (position > 0.8 && position < 0.9) {
      // クライマックスに向けてテンションを高める
      tension = Math.min(0.95, tension + (0.9 - position) * 0.5);
    } else if (position > 0.95) {
      // エピローグではテンションを下げる
      tension = Math.max(0.4, tension - 0.2);
    }
    
    return tension;
  }
  
  /**
   * 高度なテンション調整の取得
   * @private
   */
  private async getAdvancedTensionAdjustment(
    chapterNumber: number,
    genre: string,
    baseTension: number
  ): Promise<{ value: number; reason: string; direction?: string } | null> {
    try {
      // 10章ごとに1回の頻度（10%の確率）で高度な分析を適用
      if (chapterNumber % 10 !== 0 && Math.random() > 0.1) {
        return null;
      }
      
      logger.debug(`Requesting advanced tension adjustment for chapter ${chapterNumber}`);
      
      // Gemini APIを使用した高度な分析
      const prompt = `
あなは物語のテンション設計に関する専門家です。次の章のテンション値に対する調整を提案してください。

章番号: ${chapterNumber}
ジャンル: ${genre}
基本テンション値: ${baseTension}

物語テンションの調整において考慮すべき点:
1. ジャンル「${genre}」の特性
2. 物語のリズムとバリエーション
3. 読者の期待と心理的効果
4. 芸術的なテンション設計

提案する調整値（-0.2～+0.2の範囲内）と、その調整理由、および方向性（increase/decrease/maintain）を簡潔に説明してください。
回答は下記のJSON形式で提供してください:

{
  "adjustment": 数値（-0.2～0.2の範囲内）,
  "reason": "調整理由の簡潔な説明",
  "direction": "increase/decrease/maintain"
}
`;

      const response = await apiThrottler.throttledRequest(() =>
        this.geminiAdapter.generateContent(prompt, {
          temperature: 0.2,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );
      
      try {
        // JSONとして解析
        const result = JSON.parse(response);
        
        if (
          typeof result.adjustment === 'number' && 
          typeof result.reason === 'string' &&
          result.reason.length > 0
        ) {
          // 有効範囲内に収める
          const adjustment = Math.max(-0.2, Math.min(0.2, result.adjustment));
          
          return {
            value: baseTension + adjustment,
            reason: result.reason,
            direction: result.direction
          };
        }
      } catch (parseError) {
        logger.warn('Failed to parse advanced tension adjustment result', {
          error: parseError instanceof Error ? parseError.message : String(parseError),
          response
        });
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to get advanced tension adjustment', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });
      return null;
    }
  }
  
  /**
   * 最近のテンション値を取得
   * @private
   * @param chapterNumber 現在の章番号
   * @returns 最近の章のテンション値配列
   */
  private async getRecentTensions(chapterNumber: number): Promise<number[]> {
    try {
      // キャッシュからの取得
      const recentChapters = 5; // 直近5章分
      const result: number[] = [];
      
      // 過去の章のテンション値を取得
      for (let i = 1; i <= recentChapters; i++) {
        const prevChapter = chapterNumber - i;
        if (prevChapter <= 0) break;
        
        if (this.recentTensionsCache.has(prevChapter)) {
          const tensions = this.recentTensionsCache.get(prevChapter) || [];
          if (tensions.length > 0) {
            result.push(tensions[tensions.length - 1]);
          }
        }
      }
      
      return result;
    } catch (error) {
      logger.error('Failed to get recent tensions', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });
      return [];
    }
  }
  
  /**
   * 最近のテンション値のキャッシュを更新
   * @private
   * @param chapterNumber 章番号
   * @param tension テンション値
   */
  private updateRecentTensionsCache(chapterNumber: number, tension: number): void {
    try {
      // 現在の章のテンション値配列を取得または作成
      const tensions = this.recentTensionsCache.get(chapterNumber) || [];
      
      // テンション値を追加
      tensions.push(tension);
      
      // 最大5つの値に制限
      if (tensions.length > 5) {
        tensions.shift();
      }
      
      // キャッシュを更新
      this.recentTensionsCache.set(chapterNumber, tensions);
      
      // キャッシュサイズの制限（最大20章分）
      if (this.recentTensionsCache.size > 20) {
        // 最も古い章のキャッシュを削除
        const oldestChapter = Math.min(...Array.from(this.recentTensionsCache.keys()));
        this.recentTensionsCache.delete(oldestChapter);
      }
    } catch (error) {
      logger.error('Failed to update recent tensions cache', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber,
        tension
      });
    }
  }
  
  /**
   * 小さなランダム変動を加える
   * @private
   * @param value 元の値
   * @param maxVariation 最大変動値
   * @returns 変動を加えた値
   */
  private addRandomVariation(value: number, maxVariation: number): number {
    const variation = (Math.random() * 2 - 1) * maxVariation; // -maxVariation 〜 +maxVariation
    return Math.max(0.1, Math.min(0.95, value + variation));
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
    // フィボナッチ数列の最初の15要素
    const fibSequence = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
    return fibSequence.includes(num);
  }
  
  /**
   * 高度な分析が必要かどうかを判断
   * @private
   */
  private shouldUseAdvancedAnalysis(chapterNumber: number): boolean {
    // 一部の章でのみ高度な分析を使用
    return (
      chapterNumber % 5 === 0 || // 5の倍数章
      this.isPrime(chapterNumber) || // 素数章
      this.isFibonacci(chapterNumber) // フィボナッチ数章
    );
  }
  
  /**
   * 物語内の相対位置を計算
   * @private
   * @param chapterNumber 章番号
   * @param totalChapters 総章数
   * @returns 0-1の範囲の相対位置
   */
  private calculateNarrativePosition(chapterNumber: number, totalChapters: number): number {
    if (this.arcInfoCache) {
      // アーク情報がある場合はアーク内での位置を優先
      if (
        chapterNumber >= this.arcInfoCache.arcStartChapter && 
        chapterNumber <= this.arcInfoCache.arcEndChapter
      ) {
        return this.arcInfoCache.positionInArc;
      }
    }
    
    // アーク情報がない場合は全体での位置を計算
    return (chapterNumber - 1) / Math.max(1, totalChapters - 1);
  }
}