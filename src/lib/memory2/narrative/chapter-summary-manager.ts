// src/lib/memory/narrative/chapter-analysis-manager.ts
/**
 * @fileoverview 章分析管理クラス（最適化版）
 * @description
 * 章の要約生成と管理を行います。統合型定義に対応し、
 * ビジネスジャンルやその他のジャンルに特化した分析を提供します。
 */

import { Chapter } from '@/types/chapters';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { GeminiClient } from '@/lib/generation/gemini-client';
import {
    ChapterSummary,
    ManagerConstructorOptions,
    UpdateOptions,
    IManager,
    NarrativeState,
    BusinessEventType
} from './types';
import { apiThrottler } from '@/lib/utils/api-throttle'; // 🔧 追加: APIスロットリング

/**
 * @class ChapterAnalysisManager
 * @description 章の要約生成と管理を行うクラス（最適化版）
 */
export class ChapterAnalysisManager implements IManager {
    private static readonly SUMMARY_INTERVAL = 3; // 3章ごとに要約生成

    private geminiClient: GeminiClient;
    private chapterSummaries: Map<number, ChapterSummary> = new Map();
    private genre: string = 'classic';
    private initialized: boolean = false;

    /**
     * コンストラクタ
     */
    constructor(options?: ManagerConstructorOptions) {
        this.geminiClient = options?.geminiClient || new GeminiClient();
    }

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('ChapterAnalysisManager already initialized');
            return;
        }

        try {
            await this.loadFromStorage();
            this.initialized = true;
            logger.info('ChapterAnalysisManager initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize ChapterAnalysisManager', {
                error: error instanceof Error ? error.message : String(error)
            });
            this.initialized = true;
        }
    }

    /**
     * ストレージからデータを読み込む
     */
    private async loadFromStorage(): Promise<void> {
        try {
            const summariesExists = await this.storageExists('narrative-memory/summaries.json');

            if (summariesExists) {
                const summariesContent = await this.readFromStorage('narrative-memory/summaries.json');
                const summariesData = JSON.parse(summariesContent) as ChapterSummary[];

                for (const summary of summariesData) {
                    this.chapterSummaries.set(summary.chapterNumber, summary);
                }
            }

            // ジャンル情報も読み込み
            const configExists = await this.storageExists('narrative-memory/chapter-analysis-config.json');
            if (configExists) {
                const configContent = await this.readFromStorage('narrative-memory/chapter-analysis-config.json');
                const configData = JSON.parse(configContent);
                if (configData.genre) {
                    this.genre = configData.genre;
                }
            }
        } catch (error) {
            logger.error('Failed to load ChapterAnalysisManager from storage', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * ストレージにパスが存在するか確認
     */
    private async storageExists(path: string): Promise<boolean> {
        try {
            return await storageProvider.fileExists(path);
        } catch (error) {
            return false;
        }
    }

    /**
     * ストレージからデータを読み込む
     */
    private async readFromStorage(path: string): Promise<string> {
        try {
            const exists = await storageProvider.fileExists(path);
            if (exists) {
                return await storageProvider.readFile(path);
            } else {
                logger.warn(`File does not exist: ${path}`);
                return '[]';
            }
        } catch (error) {
            logger.error(`Error reading file: ${path}`, { error });
            throw error;
        }
    }

    /**
     * 🔧 修正: save() メソッドにデバッグログ追加
     */
    async save(): Promise<void> {
        try {
            logger.info(`🔍 DEBUG: ChapterAnalysisManager.save() 開始`, {
                summariesCount: this.chapterSummaries.size,
                summariesData: Array.from(this.chapterSummaries.entries()).map(([num, summary]) => ({
                    chapterNumber: num,
                    summaryLength: summary.summary.length
                }))
            });

            // 保存するデータを準備
            const summariesToSave = Array.from(this.chapterSummaries.values());
            const jsonData = JSON.stringify(summariesToSave, null, 2);

            logger.info(`🔍 DEBUG: 保存するJSONデータ`, {
                dataLength: jsonData.length,
                summariesCount: summariesToSave.length,
                preview: jsonData.substring(0, 500) + (jsonData.length > 500 ? '...' : '')
            });

            // 章要約を保存
            await this.writeToStorage('narrative-memory/summaries.json', jsonData);

            // 設定を保存
            const config = { genre: this.genre };
            await this.writeToStorage('narrative-memory/chapter-analysis-config.json',
                JSON.stringify(config, null, 2));

            // 🔧 修正: 保存後の検証（デバッグ用）
            const savedContent = await this.readFromStorage('narrative-memory/summaries.json');
            logger.info(`🔍 DEBUG: 保存後の検証`, {
                savedContentLength: savedContent.length,
                savedContentPreview: savedContent.substring(0, 300)
            });

            // ファイルサイズチェック（2バイト問題の検証）
            if (savedContent.length <= 2) {
                logger.error(`🔍 DEBUG: ❌ 保存されたファイルが異常に小さい`, {
                    contentLength: savedContent.length,
                    content: savedContent,
                    originalSummariesCount: this.chapterSummaries.size,
                    originalData: jsonData.substring(0, 200)
                });
                throw new Error(`保存されたファイルが異常に小さい (${savedContent.length} bytes)`);
            }

            logger.debug('✅ ChapterAnalysisManager を正常に保存しました');
        } catch (error) {
            logger.error('❌ ChapterAnalysisManager の保存に失敗', {
                error: error instanceof Error ? error.message : String(error),
                summariesCount: this.chapterSummaries.size
            });
            throw error;
        }
    }

    /**
     * ストレージにデータを書き込む
     */
    private async writeToStorage(path: string, content: string): Promise<void> {
        try {
            await storageProvider.writeFile(path, content);
            logger.debug(`Wrote to file: ${path}`);
        } catch (error) {
            logger.error(`Error writing file: ${path}`, { error });
            throw error;
        }
    }

    /**
     * 章からデータを更新する
     */
    async updateFromChapter(chapter: Chapter, options?: UpdateOptions): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            logger.info(`🔍 DEBUG: ChapterAnalysisManager.updateFromChapter() 開始`, {
                chapterNumber: chapter.chapterNumber,
                contentLength: chapter.content.length,
                existingSummariesCount: this.chapterSummaries.size
            });

            // ジャンル情報の更新
            if (options?.genre) {
                this.genre = options.genre;
                logger.debug(`Set genre to: ${this.genre}`);
            }

            // 🔧 修正: 毎章で要約生成（バッチ処理を撤廃）
            await this.generateImmediateSummary(chapter, options);

            await this.save();
            logger.info(`Successfully updated chapter analysis from chapter ${chapter.chapterNumber}`);
        } catch (error) {
            logger.error(`Failed to update chapter analysis from chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber: chapter.chapterNumber
            });
            throw error;
        }
    }

    /**
 * 🔧 新規追加: 即座要約生成（各章で実行）
 */
    private async generateImmediateSummary(chapter: Chapter, options?: UpdateOptions): Promise<void> {
        try {
            logger.info(`🔍 DEBUG: 章${chapter.chapterNumber}の要約生成を開始`);

            // 既存の要約をチェック
            if (this.chapterSummaries.has(chapter.chapterNumber)) {
                logger.info(`🔍 DEBUG: 章${chapter.chapterNumber}の要約は既に存在します - スキップ`);
                return;
            }

            // 要約生成
            const summary = await this.generateSingleChapterSummary(chapter);

            if (summary) {
                this.chapterSummaries.set(chapter.chapterNumber, summary);
                logger.info(`🔍 DEBUG: 章${chapter.chapterNumber}の要約を正常に生成・保存`, {
                    summaryLength: summary.summary.length,
                    totalSummaries: this.chapterSummaries.size
                });
            } else {
                logger.error(`🔍 DEBUG: 章${chapter.chapterNumber}の要約生成に失敗 - null が返されました`);
            }

        } catch (error) {
            logger.error(`🔍 DEBUG: generateImmediateSummary でエラー`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber: chapter.chapterNumber
            });
            throw error;
        }
    }

    /**
     * 🔧 新規追加: 単一章の要約生成
     */
    private async generateSingleChapterSummary(chapter: Chapter): Promise<ChapterSummary | null> {
        try {
            logger.info(`🔍 DEBUG: AI要約生成を開始`, {
                chapterNumber: chapter.chapterNumber,
                contentLength: chapter.content.length,
                contentPreview: chapter.content.substring(0, 200) + '...'
            });

            if (!this.geminiClient) {
                logger.error('🔍 DEBUG: GeminiClient が利用できません');
                return null;
            }

            // ジャンル特化プロンプトを生成
            const prompt = this.generateSingleChapterPrompt(chapter);

            logger.info(`🔍 DEBUG: Gemini API呼び出し開始`, {
                chapterNumber: chapter.chapterNumber,
                promptLength: prompt.length
            });

            // 🔧 修正: APIスロットリングを使用してレート制限を回避
            const response = await apiThrottler.throttledRequest(() =>
                this.geminiClient.generateText(prompt, {
                    temperature: 0.1,
                    purpose: 'analysis'
                })
            );

            logger.info(`🔍 DEBUG: Gemini API応答受信`, {
                chapterNumber: chapter.chapterNumber,
                responseLength: response.length,
                responsePreview: response.substring(0, 200) + '...'
            });

            if (!response || response.trim().length === 0) {
                logger.error('🔍 DEBUG: Gemini APIから空の応答', {
                    chapterNumber: chapter.chapterNumber,
                    response
                });
                return null;
            }

            // 要約の抽出
            const extractedSummary = this.extractSummaryFromResponse(response);

            if (!extractedSummary) {
                logger.error('🔍 DEBUG: レスポンスから要約を抽出できませんでした', {
                    chapterNumber: chapter.chapterNumber,
                    response: response.substring(0, 500)
                });
                return null;
            }

            // ChapterSummaryオブジェクト作成
            const summary: ChapterSummary = {
                chapterNumber: chapter.chapterNumber,
                summary: extractedSummary,
                timestamp: new Date().toISOString()
            };

            logger.info('🔍 DEBUG: ChapterSummaryオブジェクト作成完了', {
                chapterNumber: chapter.chapterNumber,
                summaryLength: summary.summary.length,
                summary: summary.summary
            });

            return summary;

        } catch (error) {
            logger.error('🔍 DEBUG: generateSingleChapterSummary でエラー', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber: chapter.chapterNumber,
                stack: error instanceof Error ? error.stack : undefined
            });
            return null;
        }
    }

    /**
     * 🔧 新規追加: 単一章用プロンプト生成
     */
    private generateSingleChapterPrompt(chapter: Chapter): string {
        let basePrompt = `以下の章の内容を100-150文字程度で簡潔に要約してください。`;

        // ジャンル特化の指示を追加
        if (this.genre === 'business') {
            basePrompt += `\n\nビジネス物語として、特に以下の要素に注目してください：
- ビジネス戦略や意思決定
- 市場動向や競合関係
- チームや組織の変化
- 製品開発や事業展開
- 資金調達や投資関連
- 危機管理や問題解決`;
        } else if (this.genre === 'mystery') {
            basePrompt += `\n\nミステリー物語として、特に以下の要素に注目してください：
- 謎や手がかりの発見
- 推理の進展
- 登場人物の動機や秘密
- 事件の展開`;
        } else {
            basePrompt += `\n\n主要なプロット展開、キャラクターの変化、重要なイベントに焦点を当ててください。`;
        }

        basePrompt += `\n\n===== 章 ${chapter.chapterNumber} =====\n${chapter.content}\n\n要約:`;

        return basePrompt;
    }

    /**
     * 🔧 新規追加: レスポンスから要約を抽出
     */
    private extractSummaryFromResponse(response: string): string | null {
        try {
            // "要約:" 以降の部分を抽出
            const summaryMatch = response.match(/要約:\s*([\s\S]*)/);
            if (summaryMatch && summaryMatch[1]) {
                return summaryMatch[1].trim();
            }

            // JSONレスポンスの場合
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.summary) {
                    return parsed.summary;
                }
            }

            // プレーンテキストの場合（改行で分割して最初の段落）
            const lines = response.trim().split('\n').filter(line => line.trim());
            if (lines.length > 0) {
                return lines[0].trim();
            }

            return null;
        } catch (error) {
            logger.warn('要約抽出でエラー', { error, response: response.substring(0, 200) });
            return response.trim().substring(0, 200); // フォールバック
        }
    }

    /**
     * 複数章の要約をバッチ処理（最適化版）
     */
    async generateSummaryBatch(currentChapter: number, options?: UpdateOptions): Promise<void> {
        const lastSummarized = Math.max(0, ...Array.from(this.chapterSummaries.keys()));
        const chaptersToSummarize = [];

        for (let i = lastSummarized + 1; i <= currentChapter; i += ChapterAnalysisManager.SUMMARY_INTERVAL) {
            chaptersToSummarize.push(i);
        }

        if (chaptersToSummarize.length === 0) {
            return;
        }

        if (!this.geminiClient) {
            logger.warn('No GeminiClient available, skipping summary generation');
            return;
        }

        logger.info(`Generating summaries for chapters: ${chaptersToSummarize.join(', ')}`);

        // 各章の内容を取得
        const chapterContents: Record<number, string> = {};
        for (const chapterNum of chaptersToSummarize) {
            try {
                const chapterData = await this.readFromStorage(`chapters/chapter_${chapterNum}.json`);
                const chapter = JSON.parse(chapterData) as Chapter;
                chapterContents[chapterNum] = chapter.content;
            } catch (error) {
                logger.error(`Failed to load chapter ${chapterNum}`, {
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        // ジャンル特化AIプロンプトを生成
        const prompt = this.generateGenreSpecificPrompt(chaptersToSummarize, chapterContents, options);

        try {
            const response = await this.geminiClient.generateText(prompt, {
                temperature: 0.1,
                targetLength: chaptersToSummarize.length * 150
            });

            await this.parseSummaryResponse(response, chaptersToSummarize);
        } catch (error) {
            logger.error('Failed to generate chapter summaries', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * ジャンル特化プロンプトを生成
     * @private
     */
    private generateGenreSpecificPrompt(
        chaptersToSummarize: number[],
        chapterContents: Record<number, string>,
        options?: UpdateOptions
    ): string {
        const currentGenre = options?.genre || this.genre;

        let basePrompt = `以下の複数の章の要約を生成してください。各章ごとに100-150字程度の簡潔な要約を作成してください。`;

        // ジャンル特化の指示を追加
        if (currentGenre === 'business') {
            basePrompt += `\n\nビジネス物語として、以下の要素に特に注目してください：
- ビジネスモデルの変化や戦略的決断
- 市場動向や競合分析の洞察
- 資金調達や投資家との関係
- チーム構築や組織の変化
- 製品開発やローンチの進捗
- 危機管理や困難の克服方法
- 成長フェーズや事業の転換点`;
        } else if (currentGenre === 'mystery') {
            basePrompt += `\n\nミステリー物語として、以下の要素に特に注目してください：
- 謎や手がかりの発見
- 推理の進展や仮説の構築
- 登場人物の動機や秘密
- 証拠の収集や分析
- 真相に近づく重要な展開`;
        } else if (currentGenre === 'romance') {
            basePrompt += `\n\nロマンス物語として、以下の要素に特に注目してください：
- 登場人物間の関係性の変化
- 感情の発展や内面の変化
- ロマンチックな場面や重要な会話
- 恋愛における障害や葛藤
- 関係の進展や転換点`;
        } else if (currentGenre === 'fantasy' || currentGenre === 'scifi') {
            basePrompt += `\n\n${currentGenre}物語として、以下の要素に特に注目してください：
- 世界設定や特殊な能力の説明
- 冒険や探索の進展
- 魔法や技術の使用と発展
- 新たな発見や啓示
- 主人公の成長や変化`;
        }

        basePrompt += `\n\n要約では主要なプロット展開、キャラクターの変化、重要なイベントに焦点を当ててください。\n\n`;

        // 章のコンテンツを追加
        basePrompt += chaptersToSummarize.map(num => `
===== 章 ${num} =====
${chapterContents[num]?.substring(0, 3000) || 'コンテンツなし'}
`).join('\n\n');

        basePrompt += `\n\n各章の要約を以下の形式で出力してください：
章番号: 要約文`;

        return basePrompt;
    }

    /**
     * 要約レスポンスを解析
     * @private
     */
    private async parseSummaryResponse(response: string, chaptersToSummarize: number[]): Promise<void> {
        const summaryPattern = /章\s*(\d+):\s*([\s\S]*?)(?=\n章\s*\d+:|$)/g;
        let match;

        while ((match = summaryPattern.exec(response)) !== null) {
            const chapterNum = parseInt(match[1]);
            const summary = match[2].trim();

            if (isNaN(chapterNum) || !summary) continue;

            // 要約を保存
            this.chapterSummaries.set(chapterNum, {
                chapterNumber: chapterNum,
                summary,
                timestamp: new Date().toISOString()
            });

            logger.info(`Generated summary for chapter ${chapterNum}`);
        }
    }

    /**
     * すべての章要約を取得
     */
    async getAllChapterSummaries(): Promise<ChapterSummary[]> {
        if (!this.initialized) {
            await this.initialize();
        }

        return Array.from(this.chapterSummaries.values());
    }

    /**
     * 指定された範囲の章要約を取得
     */
    async getChapterSummariesInRange(startChapter: number, endChapter: number): Promise<ChapterSummary[]> {
        if (!this.initialized) {
            await this.initialize();
        }

        return Array.from(this.chapterSummaries.values())
            .filter(summary => summary.chapterNumber >= startChapter && summary.chapterNumber <= endChapter)
            .sort((a, b) => a.chapterNumber - b.chapterNumber);
    }

    /**
     * 指定された章の要約を設定
     */
    async setChapterSummary(chapterNumber: number, summary: string): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        this.chapterSummaries.set(chapterNumber, {
            chapterNumber,
            summary,
            timestamp: new Date().toISOString()
        });

        await this.save();
    }

    /**
     * 特定の章の要約を取得
     */
    async getChapterSummary(chapterNumber: number): Promise<string | null> {
        if (!this.initialized) {
            await this.initialize();
        }

        const summary = this.chapterSummaries.get(chapterNumber);
        return summary ? summary.summary : null;
    }

    /**
     * ジャンル特化の章分析を実行
     */
    async analyzeChapterForGenre(chapter: Chapter): Promise<{
        summary: string;
        keyElements: string[];
        significance: number;
        businessEvents?: BusinessEventType[];
        narrativeState?: NarrativeState;
    }> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const analysis = await this.performGenreSpecificAnalysis(chapter);
            return analysis;
        } catch (error) {
            logger.error(`Failed to analyze chapter ${chapter.chapterNumber} for genre ${this.genre}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // デフォルトの分析結果を返す
            return {
                summary: `章${chapter.chapterNumber}の要約が生成できませんでした`,
                keyElements: [],
                significance: 5,
                businessEvents: [],
                narrativeState: NarrativeState.DAILY_LIFE
            };
        }
    }

    /**
     * ジャンル特化分析を実行
     * @private
     */
    private async performGenreSpecificAnalysis(chapter: Chapter): Promise<{
        summary: string;
        keyElements: string[];
        significance: number;
        businessEvents?: BusinessEventType[];
        narrativeState?: NarrativeState;
    }> {
        const content = chapter.content;
        let analysisPrompt = '';

        if (this.genre === 'business') {
            analysisPrompt = this.createBusinessAnalysisPrompt(content);
        } else {
            analysisPrompt = this.createGeneralAnalysisPrompt(content);
        }

        const response = await this.geminiClient.generateText(analysisPrompt, {
            temperature: 0.2,
            targetLength: 300
        });

        return this.parseAnalysisResponse(response, chapter.chapterNumber);
    }

    /**
     * ビジネス分析プロンプトを作成
     * @private
     */
    private createBusinessAnalysisPrompt(content: string): string {
        return `以下のビジネス物語の章を分析し、JSON形式で結果を返してください：

${content.substring(0, 2000)}

分析内容：
1. 100-150字の要約
2. ビジネス関連のキーエレメント（最大5つ）
3. この章の重要度（1-10）
4. 発生したビジネスイベントのタイプ（複数可）：
   - funding_round（資金調達）
   - product_launch（製品ローンチ）
   - pivot（ピボット）
   - team_conflict（チーム対立）
   - expansion（事業拡大）
   - acquisition（買収）
   - market_entry（市場参入）
   - competition（競争）
   - regulatory_challenge（規制課題）
   - financial_crisis（財務危機）
   - leadership_change（リーダーシップ変更）

回答形式：
{
  "summary": "要約文",
  "keyElements": ["要素1", "要素2", ...],
  "significance": 数値,
  "businessEvents": ["イベントタイプ1", "イベントタイプ2", ...]
}`;
    }

    /**
     * 一般分析プロンプトを作成
     * @private
     */
    private createGeneralAnalysisPrompt(content: string): string {
        return `以下の章を分析し、JSON形式で結果を返してください：

${content.substring(0, 2000)}

分析内容：
1. 100-150字の要約
2. 重要なキーエレメント（最大5つ）
3. この章の重要度（1-10）

回答形式：
{
  "summary": "要約文",
  "keyElements": ["要素1", "要素2", ...],
  "significance": 数値
}`;
    }

    /**
     * 分析レスポンスを解析
     * @private
     */
    private parseAnalysisResponse(response: string, chapterNumber: number): {
        summary: string;
        keyElements: string[];
        significance: number;
        businessEvents?: BusinessEventType[];
        narrativeState?: NarrativeState;
    } {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    summary: parsed.summary || `章${chapterNumber}の要約`,
                    keyElements: parsed.keyElements || [],
                    significance: parsed.significance || 5,
                    businessEvents: parsed.businessEvents || [],
                    narrativeState: this.inferNarrativeState(parsed.keyElements, parsed.businessEvents)
                };
            }
        } catch (error) {
            logger.warn(`Failed to parse analysis response: ${error}`);
        }

        // パースに失敗した場合のデフォルト値
        return {
            summary: `章${chapterNumber}の分析結果`,
            keyElements: [],
            significance: 5,
            businessEvents: [],
            narrativeState: NarrativeState.DAILY_LIFE
        };
    }

    /**
     * キーエレメントから物語状態を推測
     * @private
     */
    private inferNarrativeState(keyElements: string[], businessEvents?: BusinessEventType[]): NarrativeState {
        if (this.genre === 'business' && businessEvents && businessEvents.length > 0) {
            // ビジネスイベントに基づく状態推測
            for (const event of businessEvents) {
                switch (event) {
                    case BusinessEventType.FUNDING_ROUND:
                        return NarrativeState.FUNDING_ROUND;
                    case BusinessEventType.PRODUCT_LAUNCH:
                        return NarrativeState.PRODUCT_LAUNCH;
                    case BusinessEventType.PIVOT:
                        return NarrativeState.BUSINESS_PIVOT;
                    case BusinessEventType.COMPETITION:
                        return NarrativeState.MARKET_COMPETITION;
                    case BusinessEventType.FINANCIAL_CRISIS:
                        return NarrativeState.FINANCIAL_CHALLENGE;
                }
            }
            return NarrativeState.BUSINESS_MEETING; // デフォルト
        }

        // キーエレメントに基づく一般的な状態推測
        const keyElementsText = keyElements.join(' ').toLowerCase();

        if (keyElementsText.includes('戦闘') || keyElementsText.includes('戦い')) {
            return NarrativeState.BATTLE;
        } else if (keyElementsText.includes('旅') || keyElementsText.includes('移動')) {
            return NarrativeState.JOURNEY;
        } else if (keyElementsText.includes('調査') || keyElementsText.includes('探索')) {
            return NarrativeState.INVESTIGATION;
        } else if (keyElementsText.includes('発見') || keyElementsText.includes('真実')) {
            return NarrativeState.REVELATION;
        } else if (keyElementsText.includes('葛藤') || keyElementsText.includes('悩み')) {
            return NarrativeState.DILEMMA;
        } else if (keyElementsText.includes('解決') || keyElementsText.includes('成功')) {
            return NarrativeState.RESOLUTION;
        }

        return NarrativeState.DAILY_LIFE; // デフォルト
    }

    /**
     * ジャンルを設定
     */
    public setGenre(genre: string): void {
        this.genre = genre;
        logger.debug(`Chapter analysis genre set to: ${this.genre}`);
    }

    /**
     * ジャンルを取得
     */
    public getGenre(): string {
        return this.genre;
    }

    /**
     * 章要約の統計情報を取得
     */
    public getSummaryStatistics(): {
        totalSummaries: number;
        averageLength: number;
        latestChapter: number;
        coverage: number;
    } {
        const summaries = Array.from(this.chapterSummaries.values());
        const totalSummaries = summaries.length;

        if (totalSummaries === 0) {
            return {
                totalSummaries: 0,
                averageLength: 0,
                latestChapter: 0,
                coverage: 0
            };
        }

        const averageLength = summaries.reduce((sum, s) => sum + s.summary.length, 0) / totalSummaries;
        const latestChapter = Math.max(...summaries.map(s => s.chapterNumber));
        const coverage = (totalSummaries / latestChapter) * 100;

        return {
            totalSummaries,
            averageLength: Math.round(averageLength),
            latestChapter,
            coverage: Math.round(coverage)
        };
    }
}