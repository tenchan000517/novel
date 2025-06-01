// src/lib/plot/section/section-analyzer.ts
/**
 * @fileoverview 中期プロット（篇）の実装状態を分析するクラス
 * @description
 * 篇の一貫性分析、学習目標達成度分析、感情アーク実現度分析、
 * および改善提案を行うためのクラスです。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { MemoryManager } from '@/lib/memory/manager';
import { logError } from '@/lib/utils/error-handler';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { SectionPlotManager } from './section-plot-manager';
import {
    SectionPlot,
    CoherenceAnalysis,
    ObjectiveProgress,
    EmotionalArcProgress,
    ImprovementSuggestion,
    EmotionalCurvePoint
} from './types';

/**
 * @class SectionAnalyzer
 * @description 篇の実装状態を分析するクラス
 */
export class SectionAnalyzer {
    /**
     * コンストラクタ
     * 
     * @param sectionPlotManager セクションプロットマネージャー
     * @param memoryManager メモリマネージャー
     * @param geminiClient Geminiクライアント
     */
    constructor(
        private sectionPlotManager: SectionPlotManager,
        private memoryManager: MemoryManager,
        private geminiClient: GeminiClient
    ) { }

    /**
     * セクションの一貫性を分析
     * 
     * @param sectionId セクションID
     * @returns 一貫性分析結果
     */
    async analyzeSectionCoherence(sectionId: string): Promise<CoherenceAnalysis> {
        try {
            logger.info(`Analyzing coherence for section ${sectionId}`);

            // セクション情報を取得
            const section = await this.sectionPlotManager.getSection(sectionId);
            if (!section) {
                throw new Error(`Section ${sectionId} not found`);
            }

            // 章範囲を取得
            const { start, end } = section.chapterRange;

            // 章コンテンツを取得
            const shortTermMemory = this.memoryManager.getShortTermMemory();
            const chapters = [];

            for (let chapterNumber = start; chapterNumber <= end; chapterNumber++) {
                const chapter = await shortTermMemory.getChapter(chapterNumber);
                if (chapter) {
                    chapters.push({
                        chapterNumber,
                        title: chapter.title,
                        content: chapter.content.substring(0, 2000) // 分析用に短縮
                    });
                }
            }

            // 章が見つからない場合
            if (chapters.length === 0) {
                return {
                    overallScore: 0,
                    problematicAreas: [{
                        type: 'plot',
                        description: 'セクション内の章が見つかりません',
                        severity: 10
                    }],
                    improvementSuggestions: ['セクションに対応する章を作成してください']
                };
            }

            // AIによる一貫性分析
            const prompt = `
あなたは物語の一貫性分析の専門家です。
以下のセクション「${section.structure.title}」の概要と、含まれる章の内容に基づいて、一貫性を分析してください。

【セクション情報】
- テーマ: ${section.structure.theme}
- 主要概念: ${section.learningJourneyDesign.mainConcept}
- 学習段階: ${section.learningJourneyDesign.primaryLearningStage}
- 章範囲: ${start}〜${end}章

【章の内容概要】
${chapters.map(ch => `
第${ch.chapterNumber}章「${ch.title}」
${ch.content.substring(0, 200)}...
`).join('\n')}

以下の観点から一貫性を分析してください:
1. テーマの一貫性
2. キャラクターの一貫性
3. プロット展開の一貫性
4. 設定の一貫性
5. トーンや雰囲気の一貫性

結果はJSON形式で、次のフォーマットで出力してください:
{
  "overallScore": 7,
  "problematicAreas": [
    {
      "type": "theme",
      "description": "問題の説明",
      "severity": 5
    },
    ...
  ],
  "improvementSuggestions": [
    "改善提案1",
    "改善提案2",
    ...
  ]
}

overallScoreは0〜10の整数で、problematicAreasのtypeは'theme'|'character'|'plot'|'setting'|'tone'のいずれかを使用し、severityは0〜10の整数で表してください。
`;

            // AIによる分析を実行
            const response = await apiThrottler.throttledRequest(() =>
                this.geminiClient.generateText(prompt, { responseFormat: "json" })
            );

            // 応答をJSONとしてパース
            try {
                const analysis = JSON.parse(response);

                // 基本的な検証
                if (analysis &&
                    typeof analysis.overallScore === 'number' &&
                    Array.isArray(analysis.problematicAreas) &&
                    Array.isArray(analysis.improvementSuggestions)) {

                    logger.info(`Successfully analyzed coherence for section ${sectionId}`);
                    return analysis;
                }

                logger.warn('AI response is not a valid coherence analysis', { response });
                return this.generateDefaultCoherenceAnalysis();
            } catch (parseError) {
                logger.error('Failed to parse AI response as JSON', {
                    error: parseError,
                    response
                });
                return this.generateDefaultCoherenceAnalysis();
            }
        } catch (error) {
            logError(error, { sectionId }, 'Failed to analyze section coherence');
            return this.generateDefaultCoherenceAnalysis();
        }
    }

    /**
     * デフォルトの一貫性分析結果を生成
     */
    private generateDefaultCoherenceAnalysis(): CoherenceAnalysis {
        return {
            overallScore: 5,
            problematicAreas: [
                {
                    type: 'theme',
                    description: '中心テーマの一貫性が不明確',
                    severity: 5
                },
                {
                    type: 'plot',
                    description: '物語の展開に断絶がある可能性',
                    severity: 4
                }
            ],
            improvementSuggestions: [
                'セクション全体を通じたテーマの強調',
                '章間の連続性の強化',
                'キャラクターの動機の明確化'
            ]
        };
    }

    /**
     * 学習目標達成度を分析
     * 
     * @param sectionId セクションID
     * @returns 学習目標達成度分析結果
     */
    async analyzeLearningObjectiveProgress(sectionId: string): Promise<ObjectiveProgress> {
        try {
            logger.info(`Analyzing learning objective progress for section ${sectionId}`);

            // セクション情報を取得
            const section = await this.sectionPlotManager.getSection(sectionId);
            if (!section) {
                throw new Error(`Section ${sectionId} not found`);
            }

            // 章範囲を取得
            const { start, end } = section.chapterRange;

            // 学習目標を取得
            const objectives = section.learningJourneyDesign.learningObjectives;
            const mainConcept = section.learningJourneyDesign.mainConcept;

            // 章コンテンツを取得
            const shortTermMemory = this.memoryManager.getShortTermMemory();
            const chapters = [];

            for (let chapterNumber = start; chapterNumber <= end; chapterNumber++) {
                const chapter = await shortTermMemory.getChapter(chapterNumber);
                if (chapter) {
                    chapters.push({
                        chapterNumber,
                        title: chapter.title,
                        content: chapter.content.substring(0, 2000) // 分析用に短縮
                    });
                }
            }

            // 章が見つからない場合
            if (chapters.length === 0) {
                return {
                    cognitiveProgress: 0,
                    affectiveProgress: 0,
                    behavioralProgress: 0,
                    examples: [],
                    gaps: ['セクション内の章が見つかりません']
                };
            }

            // AIによる学習目標達成度分析
            const prompt = `
あなたは教育目標達成度分析の専門家です。
以下のセクション「${section.structure.title}」の学習目標と、含まれる章の内容に基づいて、目標達成度を分析してください。

【セクション情報】
- 主要概念: ${mainConcept}
- 学習段階: ${section.learningJourneyDesign.primaryLearningStage}

【学習目標】
- 認知的目標: ${objectives.cognitive}
- 感情的目標: ${objectives.affective}
- 行動的目標: ${objectives.behavioral}

【章の内容概要】
${chapters.map(ch => `
第${ch.chapterNumber}章「${ch.title}」
${ch.content.substring(0, 200)}...
`).join('\n')}

以下の観点から学習目標の達成度を分析してください:
1. 認知的目標の達成度（0.0〜1.0）
2. 感情的目標の達成度（0.0〜1.0）
3. 行動的目標の達成度（0.0〜1.0）
4. 各目標タイプの具体的な例（章番号付き）
5. 達成のギャップや課題

結果はJSON形式で、次のフォーマットで出力してください:
{
  "cognitiveProgress": 0.7,
  "affectiveProgress": 0.5,
  "behavioralProgress": 0.3,
  "examples": [
    {
      "objectiveType": "cognitive",
      "description": "例の説明",
      "chapterNumber": 5
    },
    ...
  ],
  "gaps": [
    "ギャップ1",
    "ギャップ2",
    ...
  ]
}
`;

            // AIによる分析を実行
            const response = await apiThrottler.throttledRequest(() =>
                this.geminiClient.generateText(prompt, { responseFormat: "json" })
            );

            // 応答をJSONとしてパース
            try {
                const analysis = JSON.parse(response);

                // 基本的な検証
                if (analysis &&
                    typeof analysis.cognitiveProgress === 'number' &&
                    typeof analysis.affectiveProgress === 'number' &&
                    typeof analysis.behavioralProgress === 'number' &&
                    Array.isArray(analysis.examples) &&
                    Array.isArray(analysis.gaps)) {

                    // 進捗率を0〜1の範囲に修正
                    analysis.cognitiveProgress = Math.max(0, Math.min(1, analysis.cognitiveProgress));
                    analysis.affectiveProgress = Math.max(0, Math.min(1, analysis.affectiveProgress));
                    analysis.behavioralProgress = Math.max(0, Math.min(1, analysis.behavioralProgress));

                    logger.info(`Successfully analyzed learning objective progress for section ${sectionId}`);
                    return analysis;
                }

                logger.warn('AI response is not a valid objective progress analysis', { response });
                return this.generateDefaultObjectiveProgress(section);
            } catch (parseError) {
                logger.error('Failed to parse AI response as JSON', {
                    error: parseError,
                    response
                });
                return this.generateDefaultObjectiveProgress(section);
            }
        } catch (error) {
            logError(error, { sectionId }, 'Failed to analyze learning objective progress');

            // セクション情報を取得してデフォルト分析を返す
            try {
                const section = await this.sectionPlotManager.getSection(sectionId);
                if (section) {
                    return this.generateDefaultObjectiveProgress(section);
                }
            } catch (getError) {
                // 無視
            }

            // 完全なデフォルト分析を返す
            return {
                cognitiveProgress: 0.5,
                affectiveProgress: 0.4,
                behavioralProgress: 0.3,
                examples: [],
                gaps: ['分析に必要なデータが不足しています']
            };
        }
    }

    /**
     * デフォルトの学習目標達成度分析結果を生成
     */
    private generateDefaultObjectiveProgress(section: SectionPlot): ObjectiveProgress {
        const mainConcept = section.learningJourneyDesign.mainConcept;

        return {
            cognitiveProgress: 0.5,
            affectiveProgress: 0.4,
            behavioralProgress: 0.3,
            examples: [
                {
                    objectiveType: 'cognitive',
                    description: `${mainConcept}の概念に関する基本的な理解`,
                    chapterNumber: section.chapterRange.start + 1
                },
                {
                    objectiveType: 'affective',
                    description: `${mainConcept}に対する共感的な反応`,
                    chapterNumber: section.chapterRange.start + 2
                }
            ],
            gaps: [
                '行動的目標に関する具体的な例示が不足',
                '概念の複雑な側面についての深い理解が必要'
            ]
        };
    }

    /**
     * 感情アーク実現度を分析
     * 
     * @param sectionId セクションID
     * @returns 感情アーク実現度分析結果
     */
    async analyzeEmotionalArcRealization(sectionId: string): Promise<EmotionalArcProgress> {
        try {
            logger.info(`Analyzing emotional arc realization for section ${sectionId}`);

            // セクション情報を取得
            const section = await this.sectionPlotManager.getSection(sectionId);
            if (!section) {
                throw new Error(`Section ${sectionId} not found`);
            }

            // 章範囲を取得
            const { start, end } = section.chapterRange;

            // 感情アークを取得
            const emotionalDesign = section.emotionalDesign;
            const emotionalArc = emotionalDesign.emotionalArc;
            const tensionPoints = emotionalDesign.tensionPoints;
            const catharticMoment = emotionalDesign.catharticMoment;

            // 中期記憶から感情曲線を取得
            const midTermMemory = this.memoryManager.getMidTermMemory();
            const emotionalCurve = await midTermMemory.getEmotionalCurve(start, end);

            // 章コンテンツを取得
            const shortTermMemory = this.memoryManager.getShortTermMemory();
            const chapters = [];

            for (let chapterNumber = start; chapterNumber <= end; chapterNumber++) {
                const chapter = await shortTermMemory.getChapter(chapterNumber);
                if (chapter) {
                    chapters.push({
                        chapterNumber,
                        title: chapter.title,
                        content: chapter.content.substring(0, 2000) // 分析用に短縮
                    });
                }
            }

            // 章が見つからない場合
            if (chapters.length === 0) {
                return {
                    overallRealization: 0,
                    stageRealization: {
                        opening: 0,
                        midpoint: 0,
                        conclusion: 0
                    },
                    tensionPointsRealization: [],
                    catharticRealization: {
                        realized: false
                    }
                };
            }

            // AIによる感情アーク実現度分析
            const prompt = `
あなたは物語の感情分析の専門家です。
以下のセクション「${section.structure.title}」の計画された感情アークと、実際の章の内容に基づいて、感情アークの実現度を分析してください。

【計画された感情アーク】
- 開始: ${emotionalArc.opening}
- 中間点: ${emotionalArc.midpoint}
- 結末: ${emotionalArc.conclusion}

【計画された緊張ポイント】
${tensionPoints.map((tp, i) => `${i + 1}. 位置: ${tp.relativePosition}, 強度: ${tp.intensity}, 説明: ${tp.description}`).join('\n')}

【計画されたカタルシスの瞬間】
位置: ${catharticMoment.relativePosition}, タイプ: ${catharticMoment.type}, 説明: ${catharticMoment.description}

【章の内容概要】
${chapters.map(ch => `
第${ch.chapterNumber}章「${ch.title}」
${ch.content.substring(0, 200)}...
`).join('\n')}

【実際の感情曲線データ（ある場合）】
${emotionalCurve.length > 0
                    ? emotionalCurve.map((pt: EmotionalCurvePoint) => `章${pt.chapter}: ${pt.emotion}, テンション: ${pt.tension}`).join('\n')
                    : '感情曲線データが見つかりません'}

以下の観点から感情アークの実現度を分析してください:
1. 全体的な実現度（0.0〜1.0）
2. 段階ごとの実現度（開始、中間点、結末）
3. 緊張ポイントの実現
4. カタルシスの実現

結果はJSON形式で、次のフォーマットで出力してください:
{
  "overallRealization": 0.7,
  "stageRealization": {
    "opening": 0.8,
    "midpoint": 0.6,
    "conclusion": 0.7
  },
  "tensionPointsRealization": [
    {
      "planned": {
        "relativePosition": 0.3,
        "intensity": 0.7,
        "description": "緊張ポイントの説明"
      },
      "actual": {
        "chapter": 5,
        "intensity": 0.6,
        "description": "実際の描写"
      }
    },
    ...
  ],
  "catharticRealization": {
    "realized": true,
    "actualChapter": 8,
    "description": "実際のカタルシスの描写"
  }
}
`;

            // AIによる分析を実行
            const response = await apiThrottler.throttledRequest(() =>
                this.geminiClient.generateText(prompt, { responseFormat: "json" })
            );

            // 応答をJSONとしてパース
            try {
                const analysis = JSON.parse(response);

                // 基本的な検証
                if (analysis &&
                    typeof analysis.overallRealization === 'number' &&
                    analysis.stageRealization &&
                    Array.isArray(analysis.tensionPointsRealization) &&
                    analysis.catharticRealization) {

                    // 実現度を0〜1の範囲に修正
                    analysis.overallRealization = Math.max(0, Math.min(1, analysis.overallRealization));
                    if (analysis.stageRealization) {
                        analysis.stageRealization.opening = Math.max(0, Math.min(1, analysis.stageRealization.opening));
                        analysis.stageRealization.midpoint = Math.max(0, Math.min(1, analysis.stageRealization.midpoint));
                        analysis.stageRealization.conclusion = Math.max(0, Math.min(1, analysis.stageRealization.conclusion));
                    }

                    logger.info(`Successfully analyzed emotional arc realization for section ${sectionId}`);
                    return analysis;
                }

                logger.warn('AI response is not a valid emotional arc progress analysis', { response });
                return this.generateDefaultEmotionalArcProgress(section);
            } catch (parseError) {
                logger.error('Failed to parse AI response as JSON', {
                    error: parseError,
                    response
                });
                return this.generateDefaultEmotionalArcProgress(section);
            }
        } catch (error) {
            logError(error, { sectionId }, 'Failed to analyze emotional arc realization');

            // セクション情報を取得してデフォルト分析を返す
            try {
                const section = await this.sectionPlotManager.getSection(sectionId);
                if (section) {
                    return this.generateDefaultEmotionalArcProgress(section);
                }
            } catch (getError) {
                // 無視
            }

            // 完全なデフォルト分析を返す
            return {
                overallRealization: 0.5,
                stageRealization: {
                    opening: 0.6,
                    midpoint: 0.5,
                    conclusion: 0.4
                },
                tensionPointsRealization: [],
                catharticRealization: {
                    realized: false
                }
            };
        }
    }

    /**
     * デフォルトの感情アーク実現度分析結果を生成
     */
    private generateDefaultEmotionalArcProgress(section: SectionPlot): EmotionalArcProgress {
        const emotionalDesign = section.emotionalDesign;
        const { start } = section.chapterRange;

        return {
            overallRealization: 0.6,
            stageRealization: {
                opening: 0.7,
                midpoint: 0.6,
                conclusion: 0.5
            },
            tensionPointsRealization: emotionalDesign.tensionPoints.map((tp, index) => ({
                planned: {
                    relativePosition: tp.relativePosition,
                    intensity: tp.intensity,
                    description: tp.description
                },
                actual: index === 0 ? {
                    chapter: start + Math.floor(tp.relativePosition * 3),
                    intensity: 0.6,
                    description: '部分的に実現された緊張ポイント'
                } : null
            })),
            catharticRealization: {
                realized: false,
                description: 'まだ実現されていません'
            }
        };
    }

    /**
     * 改善提案を生成
     * 
     * @param sectionId セクションID
     * @returns 改善提案の配列
     */
    async suggestSectionImprovements(sectionId: string): Promise<ImprovementSuggestion[]> {
        try {
            logger.info(`Generating improvement suggestions for section ${sectionId}`);

            // セクション情報を取得
            const section = await this.sectionPlotManager.getSection(sectionId);
            if (!section) {
                throw new Error(`Section ${sectionId} not found`);
            }

            // 各種分析を実行
            const [coherenceAnalysis, objectiveProgress, emotionalArcProgress] = await Promise.all([
                this.analyzeSectionCoherence(sectionId),
                this.analyzeLearningObjectiveProgress(sectionId),
                this.analyzeEmotionalArcRealization(sectionId)
            ]);

            // AIによる改善提案の生成
            const prompt = `
あなたは物語構造と学習内容の改善アドバイザーです。
以下のセクション「${section.structure.title}」の分析結果に基づいて、具体的な改善提案を作成してください。

【セクション情報】
- テーマ: ${section.structure.theme}
- 主要概念: ${section.learningJourneyDesign.mainConcept}
- 学習段階: ${section.learningJourneyDesign.primaryLearningStage}
- 章範囲: ${section.chapterRange.start}〜${section.chapterRange.end}章

【一貫性分析結果】
全体スコア: ${coherenceAnalysis.overallScore}/10
問題領域: 
${coherenceAnalysis.problematicAreas.map(area => `- ${area.type}: ${area.description} (深刻度: ${area.severity}/10)`).join('\n')}

【学習目標達成度】
認知的目標: ${Math.round(objectiveProgress.cognitiveProgress * 100)}%
感情的目標: ${Math.round(objectiveProgress.affectiveProgress * 100)}%
行動的目標: ${Math.round(objectiveProgress.behavioralProgress * 100)}%
ギャップ: 
${objectiveProgress.gaps.map(gap => `- ${gap}`).join('\n')}

【感情アーク実現度】
全体実現度: ${Math.round(emotionalArcProgress.overallRealization * 100)}%
カタルシス実現: ${emotionalArcProgress.catharticRealization.realized ? '達成済み' : '未達成'}

以下の領域で改善提案を作成してください:
1. テーマ/一貫性の改善
2. キャラクター開発の改善
3. 学習内容の改善
4. 感情表現の改善
5. ペース配分の改善

結果はJSONの配列形式で、次のフォーマットで出力してください:
[
  {
    "area": "theme",
    "suggestion": "改善提案の詳細",
    "targetChapters": [5, 6, 7],
    "priority": 4
  },
  ...
]

areaは'theme'|'character'|'learning'|'emotion'|'plot'|'pacing'のいずれかを使用し、priorityは1〜5の整数で、5が最も高い優先度を表します。
`;

            // AIによる生成を実行
            const response = await apiThrottler.throttledRequest(() =>
                this.geminiClient.generateText(prompt, { responseFormat: "json" })
            );

            // 応答をJSONとしてパース
            try {
                const suggestions = JSON.parse(response);

                // 基本的な検証
                if (Array.isArray(suggestions)) {
                    logger.info(`Successfully generated ${suggestions.length} improvement suggestions for section ${sectionId}`);
                    return suggestions;
                }

                logger.warn('AI response is not a valid array of improvement suggestions', { response });
                return this.generateDefaultImprovementSuggestions(section, coherenceAnalysis, objectiveProgress);
            } catch (parseError) {
                logger.error('Failed to parse AI response as JSON', {
                    error: parseError,
                    response
                });
                return this.generateDefaultImprovementSuggestions(section, coherenceAnalysis, objectiveProgress);
            }
        } catch (error) {
            logError(error, { sectionId }, 'Failed to suggest section improvements');

            // セクション情報を取得してデフォルト提案を返す
            try {
                const section = await this.sectionPlotManager.getSection(sectionId);
                if (section) {
                    return this.generateDefaultImprovementSuggestions(section);
                }
            } catch (getError) {
                // 無視
            }

            // 完全なデフォルト提案を返す
            return [{
                area: 'theme',
                suggestion: 'テーマの一貫性を強化する',
                targetChapters: [],
                priority: 3
            }];
        }
    }

    /**
     * デフォルトの改善提案を生成
     */
    private generateDefaultImprovementSuggestions(
        section: SectionPlot,
        coherenceAnalysis?: CoherenceAnalysis,
        objectiveProgress?: ObjectiveProgress
    ): ImprovementSuggestion[] {
        const { start, end } = section.chapterRange;
        const mainConcept = section.learningJourneyDesign.mainConcept;

        const suggestions: ImprovementSuggestion[] = [
            {
                area: 'theme',
                suggestion: `セクション全体を通じて「${section.structure.theme}」というテーマをより一貫して強調する`,
                targetChapters: [start, end],
                priority: 4
            },
            {
                area: 'learning',
                suggestion: `「${mainConcept}」の概念に対する理解の深化プロセスをより明確に描く`,
                targetChapters: Array.from({ length: end - start + 1 }, (_, i) => start + i),
                priority: 5
            },
            {
                area: 'emotion',
                suggestion: 'カタルシスの瞬間をより効果的に表現し、感情的クライマックスを強化する',
                targetChapters: [end - 1, end],
                priority: 3
            }
        ];

        // 一貫性分析から問題点を追加
        if (coherenceAnalysis && coherenceAnalysis.problematicAreas.length > 0) {
            const worstArea = coherenceAnalysis.problematicAreas.sort((a, b) => b.severity - a.severity)[0];

            // 型の変換マッピングを作成
            const typeToArea = (type: 'theme' | 'character' | 'plot' | 'setting' | 'tone'): 'theme' | 'character' | 'learning' | 'emotion' | 'plot' | 'pacing' => {
                switch (type) {
                    case 'theme': return 'theme';
                    case 'character': return 'character';
                    case 'plot': return 'plot';
                    case 'setting': return 'pacing'; // settingをpacingにマッピング
                    case 'tone': return 'emotion';   // toneをemotionにマッピング
                    default: return 'theme';         // デフォルト値
                }
            };

            suggestions.push({
                area: typeToArea(worstArea.type),
                suggestion: `${worstArea.description}の問題を解決する`,
                targetChapters: Array.from({ length: end - start + 1 }, (_, i) => start + i),
                priority: Math.min(5, Math.ceil(worstArea.severity / 2))
            });
        }

        // 学習目標のギャップを追加
        if (objectiveProgress && objectiveProgress.gaps.length > 0) {
            suggestions.push({
                area: 'learning',
                suggestion: objectiveProgress.gaps[0],
                targetChapters: [Math.floor((start + end) / 2)],
                priority: 4
            });
        }

        return suggestions;
    }
}