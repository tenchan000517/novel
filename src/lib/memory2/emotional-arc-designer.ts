/**
 * @fileoverview ビジネスジャンル対応強化版の感情アーク設計モジュール
 * @description
 * このモジュールは、小説の章ごとの感情分析と、物語全体の感情アーク設計を行うクラスを提供します。
 * 読者が体験する感情的な起伏を分析し、最適な感情体験を設計するための機能を提供します。
 * ビジネスジャンル向けの感情次元や表現を強化しています。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { JsonParser } from '@/lib/utils/json-parser';

/**
 * 感情的変移を表す型
 */
export interface EmotionalProgression {
    /** 開始時の感情レベル (0-10) */
    start: number;
    /** 中間時の感情レベル (0-10) */
    middle: number;
    /** 終了時の感情レベル (0-10) */
    end: number;
}

/**
 * 章の感情分析を表す型
 */
export interface ChapterEmotionAnalysis {
    /** 感情的次元の分析 */
    emotionalDimensions: {
        /** 希望と絶望の間の感情的変移 */
        hopeVsDespair: EmotionalProgression;
        /** 安心と緊張の間の感情的変移 */
        comfortVsTension: EmotionalProgression;
        /** 喜びと悲しみの間の感情的変移 */
        joyVsSadness: EmotionalProgression;
        /** 共感と孤立の間の感情的変移 */
        empathyVsIsolation: EmotionalProgression;
        /** 好奇心と無関心の間の感情的変移 */
        curiosityVsIndifference: EmotionalProgression;
        /** ビジネス特有: 自信と不安の間の感情的変移 */
        confidenceVsDoubt?: EmotionalProgression;
        /** ビジネス特有: 野心と満足の間の感情的変移 */
        ambitionVsContentment?: EmotionalProgression;
        /** ビジネス特有: 創造性と慣習の間の感情的変移 */
        creativityVsConvention?: EmotionalProgression;
        /** ビジネス特有: 使命感と無目的の間の感情的変移 */
        purposeVsAimlessness?: EmotionalProgression;
        /** ビジネス特有: 競争意識と協調性の間の感情的変移 */
        competitivenessVsCooperation?: EmotionalProgression;
    };
    /** 全体的な感情的トーン */
    overallTone: string;
    /** 感情的影響力 (0-10) */
    emotionalImpact: number;
}

/**
 * 感情アークの設計を表す型
 */
export interface EmotionalArcDesign {
    /** 推奨される感情的トーン */
    recommendedTone: string;
    /** 感情的な旅 */
    emotionalJourney: {
        /** 冒頭部の感情設計 */
        opening: { dimension: string, level: number }[];
        /** 展開部の感情設計 */
        development: { dimension: string, level: number }[];
        /** 結末部の感情設計 */
        conclusion: { dimension: string, level: number }[];
    };
    /** 設計理由の説明 */
    reason: string;
}

/**
 * 感情分析・設計のオプション
 */
export interface EmotionalAnalysisOptions {
    /** ジャンル */
    genre?: string;
}

/**
 * @class EmotionalArcDesigner
 * @description
 * 物語の感情的側面を分析し、最適な感情アークを設計するクラス。
 * 各章の感情分析と、物語全体の感情アークの設計を行います。
 * ビジネスジャンル向けの特化機能を含みます。
 */
export class EmotionalArcDesigner {
    /**
     * コンストラクタ
     * @param geminiClient AIモデルとの通信を行うクライアント
     */
    constructor(private geminiClient: GeminiClient) {
        logger.info('EmotionalArcDesigner initialized');
    }

    /**
     * 章の感情分析を行う
     * 
     * 章のコンテンツを分析し、感情的側面を抽出して構造化します。
     * - 感情的次元ごとの変化
     * - 全体的な感情トーン
     * - 感情的影響度
     * 
     * @param {string} content 章のコンテンツ
     * @param {EmotionalAnalysisOptions} options 分析オプション
     * @returns {Promise<ChapterEmotionAnalysis>} 感情分析結果
     */
    async analyzeChapterEmotion(content: string, options?: EmotionalAnalysisOptions): Promise<ChapterEmotionAnalysis> {
        try {
            logger.debug('Analyzing chapter emotions');
            const genre = options?.genre || 'classic';

            // コンテンツの長さを確認し、必要に応じて切り詰め
            const truncatedContent = content.length > 8000
                ? content.substring(0, 8000) + '...(truncated)'
                : content;

            // AIに感情分析を依頼するプロンプト
            let prompt = `
あなたは文学作品の感情分析の専門家です。以下の小説の章を感情的側面から詳細に分析してください。
`;

            // ジャンル特化指示を追加
            if (genre === 'business') {
                prompt += `
特に、これがビジネス/スタートアップを題材とした物語であることに注目してください。
`;
            }

            prompt += `
===== 章のコンテンツ =====
${truncatedContent}
=====

以下の感情的次元について、章の始まり、中間、終わりでの値を1から10のスケールで評価してください：

1. 希望 vs 絶望 (hopeVsDespair): 希望に満ちた状態(10)から絶望的な状態(1)までの範囲
2. 安心 vs 緊張 (comfortVsTension): リラックスした状態(10)から緊迫した状態(1)までの範囲
3. 喜び vs 悲しみ (joyVsSadness): 喜びに満ちた状態(10)から深い悲しみの状態(1)までの範囲
4. 共感 vs 孤立 (empathyVsIsolation): 強い人間的つながり(10)から完全な孤立(1)までの範囲
5. 好奇心 vs 無関心 (curiosityVsIndifference): 強い知的興味(10)から無関心(1)までの範囲
`;

            // ビジネスジャンル向けの追加感情次元
            if (genre === 'business') {
                prompt += `
6. 自信 vs 不安 (confidenceVsDoubt): 強い自信(10)から深い自己疑念(1)までの範囲
7. 野心 vs 満足 (ambitionVsContentment): 強い成長意欲(10)から現状満足(1)までの範囲
8. 創造性 vs 慣習 (creativityVsConvention): 革新的思考(10)から慣習的思考(1)までの範囲
9. 使命感 vs 無目的 (purposeVsAimlessness): 強い使命感(10)から目的意識の欠如(1)までの範囲
10. 競争意識 vs 協調性 (competitivenessVsCooperation): 強い競争志向(10)から協調志向(1)までの範囲
`;
            }

            prompt += `
また、全体的な感情的トーンを表現する言葉と、読者への感情的影響度（1-10のスケール）も評価してください。

結果を以下のJSON形式で出力してください:
{
  "emotionalDimensions": {
    "hopeVsDespair": { "start": X, "middle": Y, "end": Z },
    "comfortVsTension": { "start": X, "middle": Y, "end": Z },
    "joyVsSadness": { "start": X, "middle": Y, "end": Z },
    "empathyVsIsolation": { "start": X, "middle": Y, "end": Z },
    "curiosityVsIndifference": { "start": X, "middle": Y, "end": Z }`;

            // ビジネスジャンル向けのJSON出力フィールド追加
            if (genre === 'business') {
                prompt += `,
    "confidenceVsDoubt": { "start": X, "middle": Y, "end": Z },
    "ambitionVsContentment": { "start": X, "middle": Y, "end": Z },
    "creativityVsConvention": { "start": X, "middle": Y, "end": Z },
    "purposeVsAimlessness": { "start": X, "middle": Y, "end": Z },
    "competitivenessVsCooperation": { "start": X, "middle": Y, "end": Z }`;
            }

            prompt += `
  },
  "overallTone": "感情トーンを表す言葉",
  "emotionalImpact": X
}`;

            // APIスロットリングを適用してリクエスト
            const response = await apiThrottler.throttledRequest(() =>
                this.geminiClient.generateText(prompt, {
                    temperature: 0.1,
                    purpose: 'analysis',
                    responseFormat: 'json'
                })
            );

            // JsonParserを使用してレスポンスを安全にパース
            const defaultAnalysis: ChapterEmotionAnalysis = {
                emotionalDimensions: {
                    hopeVsDespair: { start: 5, middle: 5, end: 5 },
                    comfortVsTension: { start: 5, middle: 5, end: 5 },
                    joyVsSadness: { start: 5, middle: 5, end: 5 },
                    empathyVsIsolation: { start: 5, middle: 5, end: 5 },
                    curiosityVsIndifference: { start: 5, middle: 5, end: 5 }
                },
                overallTone: '中立的',
                emotionalImpact: 5
            };
            
            // ビジネスジャンル向けのデフォルト値追加
            if (genre === 'business') {
                defaultAnalysis.emotionalDimensions = {
                    ...defaultAnalysis.emotionalDimensions,
                    confidenceVsDoubt: { start: 5, middle: 5, end: 5 },
                    ambitionVsContentment: { start: 5, middle: 5, end: 5 },
                    creativityVsConvention: { start: 5, middle: 5, end: 5 },
                    purposeVsAimlessness: { start: 5, middle: 5, end: 5 },
                    competitivenessVsCooperation: { start: 5, middle: 5, end: 5 }
                };
            }
            
            const analysis = JsonParser.parseFromAIResponse(response, defaultAnalysis);

            logger.info('Chapter emotion analysis completed successfully');
            return analysis;

        } catch (error) {
            logger.error('Failed to analyze chapter emotions', {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー時はデフォルト値を返す
            const defaultAnalysis: ChapterEmotionAnalysis = {
                emotionalDimensions: {
                    hopeVsDespair: { start: 5, middle: 5, end: 5 },
                    comfortVsTension: { start: 5, middle: 5, end: 5 },
                    joyVsSadness: { start: 5, middle: 5, end: 5 },
                    empathyVsIsolation: { start: 5, middle: 5, end: 5 },
                    curiosityVsIndifference: { start: 5, middle: 5, end: 5 }
                },
                overallTone: '中立的',
                emotionalImpact: 5
            };
            
            // オプションでジャンルが指定されていればデフォルト値を拡張
            if (options?.genre === 'business') {
                defaultAnalysis.emotionalDimensions = {
                    ...defaultAnalysis.emotionalDimensions,
                    confidenceVsDoubt: { start: 5, middle: 5, end: 5 },
                    ambitionVsContentment: { start: 5, middle: 5, end: 5 },
                    creativityVsConvention: { start: 5, middle: 5, end: 5 },
                    purposeVsAimlessness: { start: 5, middle: 5, end: 5 },
                    competitivenessVsCooperation: { start: 5, middle: 5, end: 5 }
                };
            }
            
            return defaultAnalysis;
        }
    }

    /**
     * 感情アークを設計する
     * 
     * 章番号と過去の感情分析に基づいて、最適な感情アークを設計します。
     * 物語構造上の位置や、前の章までの感情的推移を考慮して、最適な感情体験を提案します。
     * 
     * @param {number} chapterNumber 章番号
     * @param {ChapterEmotionAnalysis[]} pastEmotions 過去の章の感情分析結果
     * @param {EmotionalAnalysisOptions} options 設計オプション
     * @returns {Promise<EmotionalArcDesign>} 感情アーク設計
     */
    async designEmotionalArc(
        chapterNumber: number,
        pastEmotions: ChapterEmotionAnalysis[],
        options?: EmotionalAnalysisOptions
    ): Promise<EmotionalArcDesign> {
        try {
            logger.debug(`Designing emotional arc for chapter ${chapterNumber}`);
            const genre = options?.genre || 'classic';

            // 過去の感情データをJSON文字列に変換
            const pastEmotionsJson = JSON.stringify(pastEmotions, null, 2);

            // AIに感情アーク設計を依頼するプロンプト
            let prompt = `
あなたは物語の感情デザインの専門家です。小説の次の章のための最適な感情アークを設計してください。
`;

            // ジャンル特化指示を追加
            if (genre === 'business') {
                prompt += `
この物語はビジネス/スタートアップを題材としたものであることに注目してください。
`;
            }

            prompt += `
現在の章番号: ${chapterNumber}

過去の章の感情分析: 
${pastEmotionsJson}

過去の感情パターンと物語の位置を分析し、次の章で読者が体験すべき最適な感情の流れを設計してください。
以下の点を考慮して設計を行ってください：

1. 物語の全体的なリズム（緊張と緩和のバランス）
2. 感情の多様性（単調にならないよう）
3. 前の章からの自然な感情の流れ
4. 物語の現在位置に応じた適切な感情的強度
`;

            // ビジネスジャンル特有の指示を追加
            if (genre === 'business') {
                prompt += `
ビジネス物語の典型的な感情パターンを考慮し、次の章で読者が体験すべき最適な感情の流れを設計してください。
以下の点を特に考慮してください：

1. ビジネス/スタートアップ物語特有の感情サイクル（熱狂→挫折→適応→成長など）
2. 起業家・ビジネスパーソン特有の感情（創造的緊張、使命感、孤独なリーダーシップなど）
3. 事業フェーズに応じた適切な感情強度（初期の熱狂、成長期の自信と不安の混在など）
4. 読者のビジネスへの関心を維持するための知的好奇心と実用的洞察のバランス
5. ビジネス判断の複雑さを反映した感情の多層性（論理と直感の葛藤など）

必要に応じて、以下のビジネスストーリー特有の感情次元も活用してください：
- 自信 vs 不安 (confidenceVsDoubt)
- 野心 vs 満足 (ambitionVsContentment)
- 創造性 vs 慣習 (creativityVsConvention)
- 使命感 vs 無目的 (purposeVsAimlessness)
- 競争意識 vs 協調性 (competitivenessVsCooperation)
`;
            }

            prompt += `
結果を以下のJSON形式で出力してください:
{
  "recommendedTone": "この章の全体的な感情トーン",
  "emotionalJourney": {
    "opening": [
      {"dimension": "感情の次元名", "level": X},
      ...
    ],
    "development": [
      {"dimension": "感情の次元名", "level": X},
      ...
    ],
    "conclusion": [
      {"dimension": "感情の次元名", "level": X},
      ...
    ]
  },
  "reason": "この感情アーク設計を推奨する理由${genre === 'business' ? '（ビジネス文脈を踏まえて）' : ''}"
}`;

            // APIスロットリングを適用してリクエスト
            const response = await apiThrottler.throttledRequest(() =>
                this.geminiClient.generateText(prompt, {
                    temperature: 0.2,
                    purpose: 'analysis',
                    responseFormat: 'json'
                })
            );

            // デフォルトの感情アーク設計
            const defaultArcDesign: EmotionalArcDesign = {
                recommendedTone: "バランスのとれた中立的なトーン",
                emotionalJourney: {
                    opening: [
                        { dimension: "好奇心", level: 7 },
                        { dimension: "期待感", level: 6 }
                    ],
                    development: [
                        { dimension: "緊張感", level: 5 },
                        { dimension: "共感", level: 6 }
                    ],
                    conclusion: [
                        { dimension: "満足感", level: 7 },
                        { dimension: "希望", level: 6 }
                    ]
                },
                reason: "物語のこの段階では、読者の関心を維持しながらも感情的なバランスを保つことが重要です"
            };

            // ビジネスジャンル用のデフォルト感情アーク設計
            if (genre === 'business') {
                defaultArcDesign.recommendedTone = "プロフェッショナルながらも熱意を感じさせるトーン";
                defaultArcDesign.emotionalJourney = {
                    opening: [
                        { dimension: "好奇心", level: 7 },
                        { dimension: "自信", level: 6 }
                    ],
                    development: [
                        { dimension: "緊張感", level: 6 },
                        { dimension: "創造性", level: 7 }
                    ],
                    conclusion: [
                        { dimension: "使命感", level: 8 },
                        { dimension: "希望", level: 7 }
                    ]
                };
                defaultArcDesign.reason = "ビジネス物語のこの段階では、読者の知的好奇心を刺激しながらも、主人公のビジョンと使命感を強調することが重要です";
            }

            // JsonParserを使用してレスポンスを安全にパース
            const arcDesign = JsonParser.parseFromAIResponse(response, defaultArcDesign);

            logger.info(`Emotional arc design completed for chapter ${chapterNumber}`);
            return arcDesign;

        } catch (error) {
            logger.error(`Failed to design emotional arc for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー時はデフォルト値を返す
            const defaultArcDesign: EmotionalArcDesign = {
                recommendedTone: "バランスのとれた中立的なトーン",
                emotionalJourney: {
                    opening: [
                        { dimension: "好奇心", level: 7 },
                        { dimension: "期待感", level: 6 }
                    ],
                    development: [
                        { dimension: "緊張感", level: 5 },
                        { dimension: "共感", level: 6 }
                    ],
                    conclusion: [
                        { dimension: "満足感", level: 7 },
                        { dimension: "希望", level: 6 }
                    ]
                },
                reason: "物語のこの段階では、読者の関心を維持しながらも感情的なバランスを保つことが重要です"
            };
            
            // ビジネスジャンル向けのデフォルト値
            if (options?.genre === 'business') {
                defaultArcDesign.recommendedTone = "プロフェッショナルながらも熱意を感じさせるトーン";
                defaultArcDesign.emotionalJourney = {
                    opening: [
                        { dimension: "好奇心", level: 7 },
                        { dimension: "自信", level: 6 }
                    ],
                    development: [
                        { dimension: "緊張感", level: 6 },
                        { dimension: "創造性", level: 7 }
                    ],
                    conclusion: [
                        { dimension: "使命感", level: 8 },
                        { dimension: "希望", level: 7 }
                    ]
                };
                defaultArcDesign.reason = "ビジネス物語のこの段階では、読者の知的好奇心を刺激しながらも、主人公のビジョンと使命感を強調することが重要です";
            }
            
            return defaultArcDesign;
        }
    }
}