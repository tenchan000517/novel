// src/lib/learning-journey/types.ts

/**
 * @fileoverview 学習旅程システム統合型定義
 * @description
 * プロット・キャラクター・学習システム間の双方向連携のための型定義を提供します。
 */

import { LearningStage } from './concept-learning-manager';

/**
 * 学習旅程とプロットシステムの連携インターフェース
 */
export interface LearningPlotIntegration {
    /** 学習進行がプロット展開に与える影響 */
    learningToPlotInfluence: {
        /** 現在の学習ステージ */
        currentStage: LearningStage;
        /** 学習進度（0-1） */
        progressRate: number;
        /** 推奨されるプロット展開 */
        suggestedPlotDirection: string[];
        /** 避けるべきプロット要素 */
        plotConstraints: string[];
    };
    
    /** プロット進行が学習ステージに与える影響 */
    plotToLearningInfluence: {
        /** 現在のプロットフェーズ */
        currentPhase: string;
        /** プロット緊張度（0-1） */
        tensionLevel: number;
        /** 学習促進要素 */
        learningCatalysts: string[];
        /** 次段階への推進力 */
        stageAdvancementTriggers: string[];
    };
}

/**
 * 学習旅程とキャラクターシステムの連携インターフェース
 */
export interface LearningCharacterIntegration {
    /** 学習進行がキャラクター成長に与える影響 */
    learningToCharacterInfluence: {
        /** 概念理解がキャラクターに与える変化 */
        conceptualTransformation: {
            [characterId: string]: {
                /** 内面的変化 */
                internalChanges: string[];
                /** 行動パターンの変化 */
                behavioralChanges: string[];
                /** 関係性の変化 */
                relationshipChanges: string[];
                /** スキル・能力の変化 */
                skillDevelopment: string[];
            };
        };
        /** 学習段階に応じたキャラクター表現指針 */
        characterExpressionGuidelines: {
            [stage in LearningStage]?: {
                /** 推奨される内面描写 */
                internalNarration: string[];
                /** 推奨される対話スタイル */
                dialogueStyle: string[];
                /** 推奨される行動パターン */
                actionPatterns: string[];
            };
        };
    };
    
    /** キャラクター状態が学習進行に与える影響 */
    characterToLearningInfluence: {
        /** キャラクターの準備状態 */
        characterReadiness: {
            [characterId: string]: {
                /** 学習への開放度（0-1） */
                learningOpenness: number;
                /** 現在の内的障害 */
                internalBarriers: string[];
                /** 学習促進要因 */
                learningFacilitators: string[];
            };
        };
        /** キャラクター間の相互作用による学習効果 */
        interpersonalLearningEffects: {
            /** メンター効果 */
            mentorEffects: string[];
            /** 対立による気づき */
            conflictInsights: string[];
            /** 共同学習効果 */
            collaborativeLearning: string[];
        };
    };
}

/**
 * 統合学習コンテキスト
 */
export interface IntegratedLearningContext {
    /** 基本学習情報 */
    learning: {
        conceptName: string;
        currentStage: LearningStage;
        progressMetrics: {
            stageProgression: number; // 現在ステージ内での進行度（0-1）
            overallProgression: number; // 全体的な学習進行度（0-1）
            learningEfficiency: number; // 学習効率（0-1）
        };
    };
    
    /** プロット統合情報 */
    plot: {
        currentSection?: {
            id: string;
            title: string;
            phase: string;
            relativePosition: number; // セクション内相対位置（0-1）
        };
        narrativeAlignment: {
            plotLearningAlignment: number; // プロットと学習の整合度（0-1）
            tensionOptimization: number; // 緊張度の最適化レベル（0-1）
            storyProgressionSupport: number; // ストーリー進行の支援度（0-1）
        };
    };
    
    /** キャラクター統合情報 */
    character: {
        mainCharacter?: {
            id: string;
            name: string;
            currentDevelopmentStage: string;
        };
        characterAlignment: {
            learningCharacterSync: number; // 学習とキャラクター発達の同期度（0-1）
            emotionalResonance: number; // 感情的共鳴度（0-1）
            growthCatalystLevel: number; // 成長触媒レベル（0-1）
        };
    };
    
    /** 統合効果メトリクス */
    integrationMetrics: {
        /** 三者統合度（学習×プロット×キャラクター） */
        tripleIntegrationScore: number; // 0-1
        /** 学習効果増幅率 */
        learningAmplification: number; // 1.0以上で効果増幅
        /** 物語没入度 */
        narrativeImmersion: number; // 0-1
        /** 読者共感度予測 */
        readerEmpathyPrediction: number; // 0-1
    };
}

/**
 * 概念体現化プランの拡張（プロット・キャラクター連携対応）
 */
export interface EnhancedEmbodimentPlan {
    /** 基本体現化情報 */
    basic: {
        conceptName: string;
        stage: LearningStage;
        chapterNumber: number;
        expressionMethods: string[];
        keyElements: string[];
        dialogueSuggestions: string[];
    };
    
    /** プロット連携強化 */
    plotEnhancement: {
        /** プロット進行との調和 */
        plotHarmony: {
            /** 現在のプロットフェーズとの整合性 */
            phaseAlignment: string;
            /** プロット緊張度との調和方法 */
            tensionHarmony: string;
            /** ストーリー展開への貢献方法 */
            storyContribution: string;
        };
        /** セクション特化要素 */
        sectionSpecific: {
            /** セクションテーマとの統合 */
            themeIntegration: string[];
            /** セクション内での位置づけ */
            sectionPositioning: string;
            /** セクション目標への貢献 */
            sectionGoalContribution: string[];
        };
    };
    
    /** キャラクター連携強化 */
    characterEnhancement: {
        /** キャラクター発達との同期 */
        characterSync: {
            /** 主人公の内面変化との調和 */
            protagonistInnerChange: string[];
            /** キャラクター間関係の発展との連動 */
            relationshipEvolution: string[];
            /** キャラクター固有の学習スタイル反映 */
            personalizedLearningStyle: string[];
        };
        /** キャラクター表現の最適化 */
        characterExpression: {
            /** ステージ特化の内面描写 */
            stageSpecificInternalNarration: string[];
            /** キャラクター特化の対話パターン */
            characterSpecificDialogue: string[];
            /** 成長を示す行動パターン */
            growthIndicatingActions: string[];
        };
    };
    
    /** 統合最適化情報 */
    integrationOptimization: {
        /** 三者調和のポイント */
        harmonyPoints: string[];
        /** 相乗効果の活用方法 */
        synergyUtilization: string[];
        /** 統合効果の測定方法 */
        effectMeasurement: string[];
    };
}

/**
 * 学習段階変化イベント
 */
export interface LearningStageTransition {
    /** 変化前の状態 */
    from: {
        stage: LearningStage;
        chapterNumber: number;
        conceptUnderstanding: number; // 0-1
    };
    
    /** 変化後の状態 */
    to: {
        stage: LearningStage;
        chapterNumber: number;
        conceptUnderstanding: number; // 0-1
    };
    
    /** 変化の触媒 */
    catalyst: {
        /** 変化を引き起こした要因の種類 */
        type: 'plot_event' | 'character_interaction' | 'internal_realization' | 'external_challenge';
        /** 具体的な要因の説明 */
        description: string;
        /** 要因の強度（0-1） */
        intensity: number;
    };
    
    /** 変化の影響 */
    impact: {
        /** プロットへの影響 */
        plotImpact: string[];
        /** キャラクターへの影響 */
        characterImpact: string[];
        /** 読者体験への影響 */
        readerImpact: string[];
    };
}

/**
 * 学習システム統合結果
 */
export interface LearningSystemIntegrationResult {
    /** 統合成功度 */
    integrationSuccess: {
        /** 統合が成功したか */
        successful: boolean;
        /** 統合品質スコア（0-1） */
        qualityScore: number;
        /** 統合の詳細結果 */
        details: {
            plotIntegration: boolean;
            characterIntegration: boolean;
            learningEffectiveness: boolean;
        };
    };
    
    /** 生成されたコンテンツ強化情報 */
    contentEnhancement: {
        /** 強化されたプロンプト要素 */
        enhancedPromptElements: string[];
        /** 統合により追加された文脈 */
        additionalContext: string[];
        /** 期待される学習効果の向上 */
        expectedLearningImprovement: number; // 1.0以上で改善
    };
    
    /** 次章への推奨事項 */
    nextChapterRecommendations: {
        /** 学習段階の推奨進行 */
        stageProgression: LearningStage | null;
        /** プロット展開の推奨 */
        plotRecommendations: string[];
        /** キャラクター発達の推奨 */
        characterRecommendations: string[];
    };
    
    /** メトリクスと診断情報 */
    diagnostics: {
        /** 処理時間 */
        processingTime: number;
        /** 使用されたシステムコンポーネント */
        componentsUsed: string[];
        /** 検出された問題 */
        issues: string[];
        /** 改善提案 */
        improvements: string[];
    };
}

/**
 * 統合学習分析結果
 */
export interface IntegratedLearningAnalysis {
    /** 概念体現化の分析 */
    conceptEmbodimentAnalysis: {
        /** 体現化レベル（0-1） */
        embodimentLevel: number;
        /** 体現化の質（0-1） */
        embodimentQuality: number;
        /** 具体的な体現化例 */
        embodimentExamples: string[];
        /** 体現化の改善点 */
        improvementAreas: string[];
    };
    
    /** プロット統合効果 */
    plotIntegrationEffect: {
        /** プロット進行への貢献度（0-1） */
        plotContribution: number;
        /** ストーリー一貫性への影響（0-1） */
        consistencyImpact: number;
        /** 読者エンゲージメントへの影響（0-1） */
        engagementImpact: number;
    };
    
    /** キャラクター統合効果 */
    characterIntegrationEffect: {
        /** キャラクター発達への貢献度（0-1） */
        characterDevelopmentContribution: number;
        /** キャラクター真正性への影響（0-1） */
        authenticityImpact: number;
        /** キャラクター関係性への影響（0-1） */
        relationshipImpact: number;
    };
    
    /** 学習効果の総合評価 */
    overallLearningEffect: {
        /** 総合学習効果スコア（0-1） */
        totalEffectScore: number;
        /** 学習効率（0-1） */
        learningEfficiency: number;
        /** 読者の理解促進度（0-1） */
        readerComprehensionFacilitation: number;
        /** 感情的共鳴度（0-1） */
        emotionalResonance: number;
    };
}