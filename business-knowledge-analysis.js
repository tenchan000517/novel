/**
 * ビジネス知識統合評価システム
 * 小説生成システムのビジネス学習ポテンシャルを分析
 */

const fs = require('fs');
const path = require('path');

class BusinessKnowledgeAnalyzer {
    constructor() {
        // 重要なビジネス書籍・概念のナレッジベース
        this.businessKnowledgeBase = {
            // 思考・問題解決系
            "ISSUE_DRIVEN": {
                keywords: ["課題起点", "問題設定", "イシュー", "課題解決", "問いの質", "仮説思考"],
                concepts: ["課題の本質を見抜く", "解決すべき問題の特定", "論点思考"],
                application: ["ビジネス戦略立案", "問題解決プロセス", "意思決定"]
            },
            "ZERO_SECOND_THINKING": {
                keywords: ["0秒思考", "瞬間判断", "思考スピード", "メモ書き", "頭の整理"],
                concepts: ["思考の高速化", "判断力向上", "思考の言語化"],
                application: ["日常の意思決定", "アイデア整理", "問題解決速度向上"]
            },
            "FERMI_ESTIMATION": {
                keywords: ["フェルミ推定", "地頭力", "論理的思考", "概算", "仮定設定"],
                concepts: ["限られた情報での推定", "論理的思考プロセス", "構造化思考"],
                application: ["市場規模推定", "事業計画", "戦略立案"]
            },
            "CONCRETE_ABSTRACT": {
                keywords: ["具体と抽象", "抽象化", "具体化", "概念化", "本質理解"],
                concepts: ["物事の本質を捉える", "概念の階層化", "思考の構造化"],
                application: ["戦略思考", "企画立案", "コミュニケーション"]
            },

            // 心理学・人間関係系
            "ADLER_PSYCHOLOGY": {
                keywords: ["嫌われる勇気", "アドラー心理学", "課題の分離", "承認欲求", "目的論"],
                concepts: ["自立した思考", "他者への貢献", "勇気の心理学"],
                application: ["リーダーシップ", "チームマネジメント", "自己成長"]
            },
            "MASLOW_HIERARCHY": {
                keywords: ["マズロー", "5段階欲求", "自己実現", "欲求階層", "動機理論"],
                concepts: ["人間の動機構造", "欲求の段階性", "自己実現への道"],
                application: ["人材マネジメント", "組織運営", "動機づけ"]
            },
            "SEVEN_HABITS": {
                keywords: ["7つの習慣", "主体性", "相互依存", "win-win", "相乗効果"],
                concepts: ["効果的な人格", "原則中心のリーダーシップ", "継続的改善"],
                application: ["個人の成長", "組織開発", "リーダーシップ開発"]
            },
            "CARNEGIE_INFLUENCE": {
                keywords: ["人を動かす", "カーネギー", "人間関係", "説得力", "影響力"],
                concepts: ["人を動かす原則", "人間理解", "コミュニケーション術"],
                application: ["営業", "交渉", "チームリーダーシップ"]
            },

            // 戦略・マネジメント系
            "SUN_TZU_STRATEGY": {
                keywords: ["孫氏の兵法", "戦略", "戦術", "競争優位", "情報戦"],
                concepts: ["戦略的思考", "競争戦略", "状況判断"],
                application: ["事業戦略", "競合分析", "市場戦略"]
            },
            "DRUCKER_MANAGEMENT": {
                keywords: ["ドラッカー", "マネジメント", "成果", "効率性", "組織"],
                concepts: ["マネジメントの本質", "成果主義", "組織運営"],
                application: ["経営管理", "組織開発", "業績向上"]
            },
            "KOTLER_MARKETING": {
                keywords: ["コトラー", "マーケティング", "4P", "顧客価値", "市場分析"],
                concepts: ["マーケティング戦略", "顧客中心思考", "市場創造"],
                application: ["商品開発", "販売戦略", "ブランディング"]
            },
            "NAPOLEON_HILL": {
                keywords: ["ナポレオンヒル", "成功哲学", "思考は現実化する", "目標設定"],
                concepts: ["成功の原則", "積極的思考", "目標達成"],
                application: ["個人の成功", "目標管理", "モチベーション"]
            },

            // 経営・財務系
            "FINANCIAL_STATEMENTS": {
                keywords: ["PL", "BS", "CF", "損益計算書", "貸借対照表", "キャッシュフロー"],
                concepts: ["財務分析", "経営指標", "財務管理"],
                application: ["経営判断", "投資判断", "資金管理"]
            },
            "CORPORATE_STRUCTURE": {
                keywords: ["株式会社", "法人化", "コーポレートガバナンス", "株主", "取締役"],
                concepts: ["企業形態", "所有と経営の分離", "企業統治"],
                application: ["会社設立", "組織運営", "資金調達"]
            },
            "COMMUNICATION": {
                keywords: ["伝え方が9割", "コミュニケーション", "プレゼン", "説得技術"],
                concepts: ["効果的な伝達", "相手の心を動かす", "伝達技術"],
                application: ["営業", "プレゼンテーション", "チームコミュニケーション"]
            }
        };

        // 学習段階の定義
        this.learningStages = {
            "AWARENESS": "概念への気づき",
            "UNDERSTANDING": "理解と内化", 
            "APPLICATION": "実践と応用",
            "MASTERY": "習得と指導"
        };
    }

    // 生成された小説のビジネス知識含有率を分析
    analyzeBusinessKnowledge(content, chapterNumber) {
        console.log(`\n🧠 ビジネス知識分析（第${chapterNumber}章）`);
        
        const analysis = {
            knowledgePresence: {},
            learningElements: {},
            naturalIntegration: 0,
            practicalApplication: 0,
            characterGrowth: 0,
            overallBusinessValue: 0
        };

        // 各ビジネス知識の検出
        Object.keys(this.businessKnowledgeBase).forEach(knowledge => {
            const knowledgeData = this.businessKnowledgeBase[knowledge];
            const presence = this.detectKnowledgePresence(content, knowledgeData);
            analysis.knowledgePresence[knowledge] = presence;
        });

        // 学習要素の分析
        analysis.learningElements = this.analyzeLearningElements(content);
        
        // 自然な統合度の評価
        analysis.naturalIntegration = this.evaluateNaturalIntegration(content);
        
        // 実践的応用度の評価
        analysis.practicalApplication = this.evaluatePracticalApplication(content);
        
        // キャラクター成長を通した学習の評価
        analysis.characterGrowth = this.evaluateCharacterGrowthLearning(content);

        // 総合ビジネス価値の算出
        analysis.overallBusinessValue = this.calculateOverallBusinessValue(analysis);

        this.displayBusinessAnalysis(analysis);
        
        return analysis;
    }

    detectKnowledgePresence(content, knowledgeData) {
        let score = 0;
        let detectedElements = [];

        // キーワードの検出
        const keywordHits = knowledgeData.keywords.filter(keyword => 
            content.includes(keyword)
        );
        score += keywordHits.length * 0.3;
        detectedElements = detectedElements.concat(keywordHits);

        // 概念の検出（部分マッチ）
        const conceptHits = knowledgeData.concepts.filter(concept => {
            const conceptWords = concept.split(/[、。]/);
            return conceptWords.some(word => content.includes(word));
        });
        score += conceptHits.length * 0.5;

        // 応用場面の検出
        const applicationHits = knowledgeData.application.filter(app => 
            content.includes(app)
        );
        score += applicationHits.length * 0.7;

        return {
            score: Math.min(score, 1.0),
            detectedElements,
            keywordHits: keywordHits.length,
            conceptHits: conceptHits.length,
            applicationHits: applicationHits.length
        };
    }

    analyzeLearningElements(content) {
        const learningIndicators = {
            discovery: ["気づく", "発見", "理解", "わかった", "そうか"],
            reflection: ["考える", "振り返る", "反省", "見つめ直す"],
            application: ["実践", "試す", "適用", "活用", "使う"],
            growth: ["成長", "変化", "進歩", "向上", "発展"]
        };

        const results = {};
        Object.keys(learningIndicators).forEach(type => {
            const indicators = learningIndicators[type];
            const hits = indicators.filter(indicator => content.includes(indicator));
            results[type] = {
                score: hits.length / indicators.length,
                hits: hits.length,
                detectedElements: hits
            };
        });

        return results;
    }

    evaluateNaturalIntegration(content) {
        // 自然な統合の指標
        let score = 0;
        
        // ストーリーとの統合度
        if (content.includes('学ぶ') || content.includes('理解')) score += 0.2;
        if (content.includes('経験') || content.includes('体験')) score += 0.2;
        if (content.includes('実感') || content.includes('痛感')) score += 0.2;
        
        // 対話による学習
        if (content.includes('「') && content.includes('」')) score += 0.2;
        
        // 内省による成長
        if (content.includes('考え') && content.includes('自分')) score += 0.2;

        return score;
    }

    evaluatePracticalApplication(content) {
        // 実践的応用の指標
        let score = 0;
        
        // ビジネス場面での応用
        const businessScenes = ['プレゼン', '提案', '企画', '戦略', '計画', '分析', '判断'];
        const sceneHits = businessScenes.filter(scene => content.includes(scene));
        score += sceneHits.length * 0.1;
        
        // 問題解決プロセス
        if (content.includes('問題') && content.includes('解決')) score += 0.2;
        if (content.includes('課題') && content.includes('対策')) score += 0.2;
        
        // 意思決定プロセス
        if (content.includes('決断') || content.includes('判断')) score += 0.2;

        return Math.min(score, 1.0);
    }

    evaluateCharacterGrowthLearning(content) {
        // キャラクター成長を通した学習の評価
        let score = 0;
        
        // 挫折からの学び
        if (content.includes('失敗') && content.includes('学')) score += 0.25;
        if (content.includes('挫折') && content.includes('気づ')) score += 0.25;
        
        // メンターからの学び
        if (content.includes('教') || content.includes('指導')) score += 0.25;
        
        // 実体験からの学び
        if (content.includes('体験') && content.includes('理解')) score += 0.25;

        return score;
    }

    calculateOverallBusinessValue(analysis) {
        // 検出されたビジネス知識の総合スコア
        const knowledgeScores = Object.values(analysis.knowledgePresence).map(k => k.score);
        const avgKnowledgeScore = knowledgeScores.length > 0 ? 
            knowledgeScores.reduce((sum, score) => sum + score, 0) / knowledgeScores.length : 0;

        // 学習要素の総合スコア
        const learningScores = Object.values(analysis.learningElements).map(l => l.score);
        const avgLearningScore = learningScores.length > 0 ?
            learningScores.reduce((sum, score) => sum + score, 0) / learningScores.length : 0;

        // 重み付き平均
        return (
            avgKnowledgeScore * 0.4 +
            avgLearningScore * 0.2 +
            analysis.naturalIntegration * 0.2 +
            analysis.practicalApplication * 0.1 +
            analysis.characterGrowth * 0.1
        );
    }

    displayBusinessAnalysis(analysis) {
        console.log(`📊 ビジネス知識含有率:`);
        
        // 検出されたビジネス知識を表示
        Object.keys(analysis.knowledgePresence).forEach(knowledge => {
            const presence = analysis.knowledgePresence[knowledge];
            if (presence.score > 0) {
                console.log(`   ${knowledge}: ${presence.score.toFixed(2)} (${presence.detectedElements.slice(0, 3).join(', ')})`);
            }
        });

        console.log(`📚 学習要素分析:`);
        Object.keys(analysis.learningElements).forEach(type => {
            const element = analysis.learningElements[type];
            if (element.score > 0) {
                console.log(`   ${type}: ${element.score.toFixed(2)} (${element.detectedElements.slice(0, 2).join(', ')})`);
            }
        });

        console.log(`🎯 統合評価:`);
        console.log(`   自然な統合度: ${analysis.naturalIntegration.toFixed(2)}`);
        console.log(`   実践的応用度: ${analysis.practicalApplication.toFixed(2)}`);
        console.log(`   成長学習度: ${analysis.characterGrowth.toFixed(2)}`);
        console.log(`   総合ビジネス価値: ${analysis.overallBusinessValue.toFixed(2)}/1.0`);
    }

    // システム全体のビジネス学習ポテンシャル評価
    evaluateSystemBusinessPotential(chapters) {
        console.log(`\n🏢 システム全体のビジネス学習ポテンシャル評価`);
        
        const systemEvaluation = {
            knowledgeCoverage: this.evaluateKnowledgeCoverage(chapters),
            learningProgression: this.evaluateLearningProgression(chapters),
            practicalRelevance: this.evaluatePracticalRelevance(chapters),
            naturalIntegration: this.evaluateSystemNaturalIntegration(chapters),
            overallPotential: 0,
            recommendations: []
        };

        systemEvaluation.overallPotential = (
            systemEvaluation.knowledgeCoverage * 0.3 +
            systemEvaluation.learningProgression * 0.3 +
            systemEvaluation.practicalRelevance * 0.2 +
            systemEvaluation.naturalIntegration * 0.2
        );

        // 改善提案の生成
        systemEvaluation.recommendations = this.generateRecommendations(systemEvaluation);

        this.displaySystemEvaluation(systemEvaluation);
        
        return systemEvaluation;
    }

    evaluateKnowledgeCoverage(chapters) {
        const totalKnowledge = Object.keys(this.businessKnowledgeBase).length;
        const coveredKnowledge = new Set();

        chapters.forEach(chapter => {
            Object.keys(chapter.metadata.businessAnalysis.knowledgePresence).forEach(knowledge => {
                if (chapter.metadata.businessAnalysis.knowledgePresence[knowledge].score > 0.1) {
                    coveredKnowledge.add(knowledge);
                }
            });
        });

        return coveredKnowledge.size / totalKnowledge;
    }

    evaluateLearningProgression(chapters) {
        // 学習の段階的進歩を評価
        let progressionScore = 0;
        
        chapters.forEach((chapter, index) => {
            const businessValue = chapter.metadata.businessAnalysis.overallBusinessValue;
            progressionScore += businessValue * (index + 1); // 後の章ほど重み付け
        });

        return progressionScore / (chapters.length * chapters.length);
    }

    evaluatePracticalRelevance(chapters) {
        const relevanceScores = chapters.map(chapter => 
            chapter.metadata.businessAnalysis.practicalApplication
        );
        
        return relevanceScores.reduce((sum, score) => sum + score, 0) / relevanceScores.length;
    }

    evaluateSystemNaturalIntegration(chapters) {
        const integrationScores = chapters.map(chapter => 
            chapter.metadata.businessAnalysis.naturalIntegration
        );
        
        return integrationScores.reduce((sum, score) => sum + score, 0) / integrationScores.length;
    }

    generateRecommendations(evaluation) {
        const recommendations = [];

        if (evaluation.knowledgeCoverage < 0.3) {
            recommendations.push("ビジネス知識の網羅性を向上させるため、章ごとに特定のビジネスフレームワークを学習目標として設定");
        }

        if (evaluation.learningProgression < 0.5) {
            recommendations.push("学習の段階的進歩を設計するため、基礎→応用→実践の順序で知識を配置");
        }

        if (evaluation.practicalRelevance < 0.4) {
            recommendations.push("実践的な応用場面を増やすため、具体的なビジネスケースやシミュレーションを追加");
        }

        if (evaluation.naturalIntegration < 0.6) {
            recommendations.push("ストーリーとの自然な統合を図るため、キャラクターの課題解決プロセスにビジネスフレームワークを組み込み");
        }

        return recommendations;
    }

    displaySystemEvaluation(evaluation) {
        console.log(`📊 システム全体評価:`);
        console.log(`   知識網羅性: ${evaluation.knowledgeCoverage.toFixed(2)}/1.0`);
        console.log(`   学習進歩性: ${evaluation.learningProgression.toFixed(2)}/1.0`);
        console.log(`   実践関連性: ${evaluation.practicalRelevance.toFixed(2)}/1.0`);
        console.log(`   自然統合性: ${evaluation.naturalIntegration.toFixed(2)}/1.0`);
        console.log(`   総合ポテンシャル: ${evaluation.overallPotential.toFixed(2)}/1.0`);

        console.log(`\n💡 改善提案:`);
        evaluation.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec}`);
        });
    }
}

module.exports = { BusinessKnowledgeAnalyzer };