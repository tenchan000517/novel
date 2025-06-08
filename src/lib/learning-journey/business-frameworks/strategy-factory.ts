/**
 * @fileoverview ビジネスフレームワーク戦略ファクトリー
 * @description ビジネスフレームワーク戦略の統合管理とファクトリーパターン実装
 */

import { logger } from '@/lib/utils/logger';
import {
    BusinessFrameworkEmotionalStrategy,
    BusinessFrameworkStrategyFactory
} from './base-strategy';
import { IssueDrivernEmotionalStrategy } from './issue-driven-strategy';
import { SocraticDialogueEmotionalStrategy } from './socratic-dialogue-strategy';
import { AdlerPsychologyEmotionalStrategy } from './adler-psychology-strategy';
import { DruckerManagementEmotionalStrategy } from './drucker-management-strategy';
import { BusinessFrameworkName, EmpatheticPoint, EmotionalArcDesign } from '../emotional-types';
import { LearningStage } from '../concept-learning-manager';

/**
 * ビジネスフレームワーク戦略ファクトリー実装クラス
 */
export class BusinessFrameworkStrategyFactoryImpl implements BusinessFrameworkStrategyFactory {
    private strategies: Map<BusinessFrameworkName, BusinessFrameworkEmotionalStrategy>;
    private defaultStrategy: BusinessFrameworkEmotionalStrategy;

    constructor() {
        this.strategies = new Map();
        this.initializeStrategies();
        this.defaultStrategy = new IssueDrivernEmotionalStrategy(); // デフォルトとしてISSUE_DRIVENを使用
    }

    /**
     * 戦略インスタンスの初期化
     * @private
     */
    private initializeStrategies(): void {
        try {
            // 各戦略インスタンスを作成・登録
            this.strategies.set('ISSUE_DRIVEN', new IssueDrivernEmotionalStrategy());
            this.strategies.set('SOCRATIC_DIALOGUE', new SocraticDialogueEmotionalStrategy());
            this.strategies.set('ADLER_PSYCHOLOGY', new AdlerPsychologyEmotionalStrategy());
            this.strategies.set('DRUCKER_MANAGEMENT', new DruckerManagementEmotionalStrategy());

            logger.info(`Initialized ${this.strategies.size} business framework strategies`);
        } catch (error) {
            logger.error('Failed to initialize business framework strategies', { error });
            throw error;
        }
    }

    /**
     * 指定されたフレームワーク名に対応する戦略インスタンスを作成
     * @param frameworkName フレームワーク名
     * @returns 戦略インスタンス
     */
    createStrategy(frameworkName: BusinessFrameworkName): BusinessFrameworkEmotionalStrategy {
        const strategy = this.strategies.get(frameworkName);
        
        if (!strategy) {
            logger.warn(`Strategy not found for framework ${frameworkName}, using default strategy`);
            return this.defaultStrategy;
        }

        return strategy;
    }

    /**
     * サポートされているフレームワーク名の一覧を取得
     * @returns サポートされているフレームワーク名配列
     */
    getSupportedFrameworks(): BusinessFrameworkName[] {
        return Array.from(this.strategies.keys());
    }

    /**
     * フレームワークがサポートされているかチェック
     * @param frameworkName フレームワーク名
     * @returns サポートされている場合true
     */
    isFrameworkSupported(frameworkName: BusinessFrameworkName): boolean {
        return this.strategies.has(frameworkName);
    }

    /**
     * 全戦略の統計情報を取得
     * @returns 戦略統計情報
     */
    getStrategyStatistics(): {
        totalStrategies: number;
        supportedFrameworks: BusinessFrameworkName[];
        defaultFramework: BusinessFrameworkName;
    } {
        return {
            totalStrategies: this.strategies.size,
            supportedFrameworks: this.getSupportedFrameworks(),
            defaultFramework: this.defaultStrategy.getFrameworkName()
        };
    }

    /**
     * 複数フレームワークの感情アークを一括生成
     * @param frameworkNames フレームワーク名配列
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @returns フレームワーク別感情アークマップ
     */
    createMultipleEmotionalArcs(
        frameworkNames: BusinessFrameworkName[],
        stage: LearningStage,
        chapterNumber: number
    ): Map<BusinessFrameworkName, EmotionalArcDesign> {
        const results = new Map<BusinessFrameworkName, EmotionalArcDesign>();

        for (const frameworkName of frameworkNames) {
            try {
                const strategy = this.createStrategy(frameworkName);
                const emotionalArc = strategy.createEmotionalArc(stage, chapterNumber);
                results.set(frameworkName, emotionalArc);
            } catch (error) {
                logger.error(`Failed to create emotional arc for framework ${frameworkName}`, { error });
                // エラー時はデフォルト戦略を使用
                const defaultArc = this.defaultStrategy.createEmotionalArc(stage, chapterNumber);
                results.set(frameworkName, defaultArc);
            }
        }

        return results;
    }

    /**
     * 複数フレームワークの共感ポイントを一括生成
     * @param frameworkNames フレームワーク名配列
     * @param stage 学習段階
     * @returns フレームワーク別共感ポイントマップ
     */
    createMultipleEmpatheticPoints(
        frameworkNames: BusinessFrameworkName[],
        stage: LearningStage
    ): Map<BusinessFrameworkName, EmpatheticPoint[]> {
        const results = new Map<BusinessFrameworkName, EmpatheticPoint[]>();

        for (const frameworkName of frameworkNames) {
            try {
                const strategy = this.createStrategy(frameworkName);
                const empatheticPoints = strategy.createEmpatheticPoints(stage);
                results.set(frameworkName, empatheticPoints);
            } catch (error) {
                logger.error(`Failed to create empathetic points for framework ${frameworkName}`, { error });
                // エラー時はデフォルト戦略を使用
                const defaultPoints = this.defaultStrategy.createEmpatheticPoints(stage);
                results.set(frameworkName, defaultPoints);
            }
        }

        return results;
    }

    /**
     * フレームワーク間の感情アーク比較分析
     * @param frameworkNames 比較対象フレームワーク名配列
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @returns 比較分析結果
     */
    compareFrameworkEmotionalArcs(
        frameworkNames: BusinessFrameworkName[],
        stage: LearningStage,
        chapterNumber: number
    ): {
        emotionalArcs: Map<BusinessFrameworkName, EmotionalArcDesign>;
        analysis: {
            toneDiversity: number;
            intensityVariation: number;
            commonThemes: string[];
            uniqueElements: Map<BusinessFrameworkName, string[]>;
        };
    } {
        const emotionalArcs = this.createMultipleEmotionalArcs(frameworkNames, stage, chapterNumber);
        
        // 分析実行
        const analysis = this.analyzeEmotionalArcDiversity(emotionalArcs);

        return {
            emotionalArcs,
            analysis
        };
    }

    /**
     * 最適フレームワーク推奨
     * @param stage 学習段階
     * @param learnerProfile 学習者プロファイル（オプション）
     * @returns 推奨フレームワーク
     */
    recommendOptimalFramework(
        stage: LearningStage,
        learnerProfile?: {
            preferredLearningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
            experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
            businessBackground?: boolean;
            psychologyInterest?: boolean;
        }
    ): {
        primaryRecommendation: BusinessFrameworkName;
        alternativeRecommendations: BusinessFrameworkName[];
        reasoning: string;
    } {
        // 学習段階ベースの推奨
        let primaryRecommendation: BusinessFrameworkName;
        let reasoning = '';

        switch (stage) {
            case LearningStage.MISCONCEPTION:
            case LearningStage.EXPLORATION:
                primaryRecommendation = 'SOCRATIC_DIALOGUE';
                reasoning = '探索・発見段階では問いかけによる自発的学習が効果的';
                break;

            case LearningStage.CONFLICT:
                primaryRecommendation = 'ADLER_PSYCHOLOGY';
                reasoning = '葛藤段階では勇気と自己責任の概念が重要';
                break;

            case LearningStage.INSIGHT:
            case LearningStage.APPLICATION:
                primaryRecommendation = 'ISSUE_DRIVEN';
                reasoning = '洞察・応用段階では実践的な問題解決アプローチが有効';
                break;

            case LearningStage.INTEGRATION:
            case LearningStage.PRACTICAL_MASTERY:
                primaryRecommendation = 'DRUCKER_MANAGEMENT';
                reasoning = '統合・習熟段階では体系的なマネジメント思考が重要';
                break;

            default:
                primaryRecommendation = 'ISSUE_DRIVEN';
                reasoning = 'デフォルトとして実践的なアプローチを推奨';
        }

        // 学習者プロファイルによる調整
        if (learnerProfile) {
            const adjusted = this.adjustRecommendationByProfile(primaryRecommendation, learnerProfile, stage);
            primaryRecommendation = adjusted.framework;
            reasoning += ` ${adjusted.additionalReason}`;
        }

        // 代替推奨の生成
        const alternativeRecommendations = this.getSupportedFrameworks()
            .filter(name => name !== primaryRecommendation)
            .slice(0, 2);

        return {
            primaryRecommendation,
            alternativeRecommendations,
            reasoning
        };
    }

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

    /**
     * 感情アークの多様性分析
     * @param emotionalArcs フレームワーク別感情アークマップ
     * @returns 多様性分析結果
     */
    private analyzeEmotionalArcDiversity(
        emotionalArcs: Map<BusinessFrameworkName, EmotionalArcDesign>
    ): {
        toneDiversity: number;
        intensityVariation: number;
        commonThemes: string[];
        uniqueElements: Map<BusinessFrameworkName, string[]>;
    } {
        const arcs = Array.from(emotionalArcs.values());
        
        // トーンの多様性
        const tones = arcs.map(arc => arc.recommendedTone);
        const toneDiversity = this.calculateStringDiversity(tones);

        // 強度の変動
        const intensities = arcs.flatMap(arc => [
            ...arc.emotionalJourney.opening,
            ...arc.emotionalJourney.development,
            ...arc.emotionalJourney.conclusion
        ].map(dim => dim.level));
        const intensityVariation = this.calculateNumericVariation(intensities);

        // 共通テーマの抽出
        const allReasons = arcs.map(arc => arc.reason);
        const commonThemes = this.extractCommonThemes(allReasons);

        // ユニーク要素の抽出
        const uniqueElements = new Map<BusinessFrameworkName, string[]>();
        for (const [framework, arc] of emotionalArcs.entries()) {
            const unique = this.extractUniqueElements(arc, arcs);
            uniqueElements.set(framework, unique);
        }

        return {
            toneDiversity,
            intensityVariation,
            commonThemes,
            uniqueElements
        };
    }

    /**
     * 学習者プロファイルによる推奨調整
     * @param baseRecommendation ベース推奨
     * @param profile 学習者プロファイル
     * @param stage 学習段階
     * @returns 調整された推奨
     */
    private adjustRecommendationByProfile(
        baseRecommendation: BusinessFrameworkName,
        profile: any,
        stage: LearningStage
    ): { framework: BusinessFrameworkName; additionalReason: string } {
        let adjustedFramework = baseRecommendation;
        let additionalReason = '';

        // 経験レベルによる調整
        if (profile.experienceLevel === 'beginner') {
            adjustedFramework = 'SOCRATIC_DIALOGUE';
            additionalReason = '初心者には問いかけ方式が適している';
        } else if (profile.experienceLevel === 'advanced') {
            adjustedFramework = 'DRUCKER_MANAGEMENT';
            additionalReason = '上級者には体系的なアプローチが効果的';
        }

        // 心理学への関心による調整
        if (profile.psychologyInterest && stage === LearningStage.CONFLICT) {
            adjustedFramework = 'ADLER_PSYCHOLOGY';
            additionalReason = '心理学に関心がある場合、アドラー心理学が特に有効';
        }

        // ビジネス背景による調整
        if (profile.businessBackground && 
            (stage === LearningStage.APPLICATION || stage === LearningStage.PRACTICAL_MASTERY)) {
            adjustedFramework = 'ISSUE_DRIVEN';
            additionalReason = 'ビジネス経験者には実践的な問題解決アプローチが適している';
        }

        return { framework: adjustedFramework, additionalReason };
    }

    /**
     * 文字列の多様性計算
     * @param strings 文字列配列
     * @returns 多様性スコア (0-1)
     */
    private calculateStringDiversity(strings: string[]): number {
        if (strings.length <= 1) return 0;

        const uniqueCount = new Set(strings).size;
        return uniqueCount / strings.length;
    }

    /**
     * 数値の変動計算
     * @param numbers 数値配列
     * @returns 変動スコア (0-1)
     */
    private calculateNumericVariation(numbers: number[]): number {
        if (numbers.length <= 1) return 0;

        const mean = numbers.reduce((sum, val) => sum + val, 0) / numbers.length;
        const variance = numbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numbers.length;
        const standardDeviation = Math.sqrt(variance);

        // 標準偏差を0-1範囲に正規化（最大値10を想定）
        return Math.min(1, standardDeviation / 5);
    }

    /**
     * 共通テーマの抽出
     * @param reasons 理由文配列
     * @returns 共通テーマ配列
     */
    private extractCommonThemes(reasons: string[]): string[] {
        const commonWords = ['学習', '理解', '成長', '発見', '実践', '統合', '変化', '体験'];
        return commonWords.filter(word => 
            reasons.filter(reason => reason.includes(word)).length >= reasons.length / 2
        );
    }

    /**
     * ユニーク要素の抽出
     * @param targetArc 対象アーク
     * @param allArcs 全アーク配列
     * @returns ユニーク要素配列
     */
    private extractUniqueElements(targetArc: EmotionalArcDesign, allArcs: EmotionalArcDesign[]): string[] {
        const targetDimensions = [
            ...targetArc.emotionalJourney.opening,
            ...targetArc.emotionalJourney.development,
            ...targetArc.emotionalJourney.conclusion
        ].map(dim => dim.dimension);

        const otherDimensions = allArcs
            .filter(arc => arc !== targetArc)
            .flatMap(arc => [
                ...arc.emotionalJourney.opening,
                ...arc.emotionalJourney.development,
                ...arc.emotionalJourney.conclusion
            ])
            .map(dim => dim.dimension);

        return targetDimensions.filter(dim => !otherDimensions.includes(dim));
    }
}

/**
 * シングルトンファクトリーインスタンス
 */
export const businessFrameworkStrategyFactory = new BusinessFrameworkStrategyFactoryImpl();

/**
 * 便利メソッド: フレームワーク名からの直接戦略取得
 * @param frameworkName フレームワーク名
 * @returns 戦略インスタンス
 */
export function getBusinessFrameworkStrategy(frameworkName: BusinessFrameworkName): BusinessFrameworkEmotionalStrategy {
    return businessFrameworkStrategyFactory.createStrategy(frameworkName);
}

/**
 * 便利メソッド: サポートされているフレームワークの確認
 * @param frameworkName フレームワーク名
 * @returns サポートされている場合true
 */
export function isBusinessFrameworkSupported(frameworkName: BusinessFrameworkName): boolean {
    return businessFrameworkStrategyFactory.isFrameworkSupported(frameworkName);
}