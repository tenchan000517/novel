// src/lib/plot/checker.ts (最適化版)
import { GeminiClient } from '@/lib/generation/gemini-client';
import { memoryManager } from '@/lib/memory/manager';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { ConcretePlotPoint, AbstractPlotGuideline } from './types';
import { JsonParser } from '@/lib/utils/json-parser';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { KeyEvent, SignificantEvent } from '@/types/memory';
import { GenerationContext } from '@/types/generation';
import { CharacterManager, characterManager } from '@/lib/characters/manager';
import { plotManager } from '@/lib/plot/manager';  // パスが違う場合は調整してください

/**
 * @class PlotChecker
 * @description
 * プロットの整合性をチェックする機能を提供します。
 * 階層記憶システムとプロットの整合性を検証し、
 * 生成コンテンツの評価を行います。
 * 
 * @role
 * - 生成されたコンテンツとプロットの整合性確認
 * - プロット要素間の整合性チェック
 * - 記憶システムに保存された事実との整合性検証
 * - GenerationContextValidatorと連携して詳細なイベント整合性を検証
 */
export class PlotChecker {
    private geminiClient: GeminiClient;

    constructor() {
        this.geminiClient = new GeminiClient();
    }

    /**
     * 生成されたコンテンツの整合性をチェックします
     * 
     * @param content 生成されたチャプター内容
     * @param chapterNumber チャプター番号
     * @returns 整合性チェック結果
     */
    async checkGeneratedContentConsistency(
        content: string,
        chapterNumber: number
    ): Promise<{
        consistent: boolean;
        issues: Array<{
            type: string;
            description: string;
            severity: "LOW" | "MEDIUM" | "HIGH";
            suggestion: string;
            context?: string;
        }>;
    }> {
        try {
            logger.info(`章${chapterNumber}のプロット整合性チェックを開始`);
            const issues: Array<{
                type: string;
                description: string;
                severity: "LOW" | "MEDIUM" | "HIGH";
                suggestion: string;
                context?: string;
            }> = [];

            // 1. プロット情報の取得
            const concretePlot = await this.getRelatedConcretePlot(chapterNumber);
            const abstractGuideline = await this.getRelatedAbstractGuideline(chapterNumber);

            // 2. 記憶システムからの情報取得
            const memoryInfo = await this.getMemorySystemInfo(chapterNumber);

            // 3. プロット整合性チェック
            if (concretePlot || abstractGuideline) {
                const plotConsistencyResult = await this.checkPlotConsistency(
                    content,
                    concretePlot,
                    abstractGuideline,
                    chapterNumber
                );

                // プロット整合性の問題を追加
                issues.push(...plotConsistencyResult.issues);
            }

            // 4. 記憶整合性チェック (短期記憶との整合性)
            const memoryConsistencyResult = await this.checkMemoryConsistency(
                content,
                memoryInfo,
                chapterNumber
            );

            // 記憶整合性の問題を追加
            issues.push(...memoryConsistencyResult.issues);

            // 5. イベント整合性チェック (GenerationContextValidatorを利用)
            // GenerationContextValidatorを利用するための仮のコンテキストを作成
            const tempContext = await this.createTempGenerationContext(content, chapterNumber);

            // GenerationContextValidatorの結果を変換して統合
            const eventIssues = await this.checkEventConsistencyWithValidator(tempContext);
            issues.push(...this.convertValidatorIssuesToCheckerFormat(eventIssues));

            // 整合性の総合判定（HIGHの問題がなければconsistent=true）
            const consistent = !issues.some(issue => issue.severity === "HIGH");

            logger.info(`章${chapterNumber}のプロット整合性チェック完了`, {
                issuesCount: issues.length,
                consistent,
                highSeverityIssues: issues.filter(i => i.severity === "HIGH").length
            });

            return {
                consistent,
                issues
            };
        } catch (error) {
            logError(error, { chapterNumber }, 'プロット整合性チェックに失敗しました');

            // エラー時は問題なしとして返す
            return { consistent: true, issues: [] };
        }
    }

    /**
     * ValidationContextValidatorを使って永続的イベントの整合性をチェック
     * @param context 一時的な生成コンテキスト
     * @returns 問題点のリスト
     */
    private async checkEventConsistencyWithValidator(context: GenerationContext): Promise<string[]> {
        try {
            // MemoryManagerからGenerationContextValidatorのインスタンスを取得
            const validationResult = await memoryManager.validateGenerationContext(context);
            return validationResult.issues;
        } catch (error) {
            logger.error('検証エラー: GenerationContextValidatorでのチェックに失敗', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * GenerationContextValidatorの問題形式をPlotCheckerの形式に変換
     */
    private convertValidatorIssuesToCheckerFormat(issues: string[]): Array<{
        type: string;
        description: string;
        severity: "LOW" | "MEDIUM" | "HIGH";
        suggestion: string;
    }> {
        return issues.map(issue => {
            let type = "EVENT_INCONSISTENCY";
            let severity: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";
            let suggestion = "整合性のある記述に修正してください";

            // 問題の種類を特定
            if (issue.includes('死亡')) {
                type = "CHARACTER_DEATH_INCONSISTENCY";
                severity = "HIGH";
                suggestion = "死亡キャラクターを生存しているように描写しないでください";
            } else if (issue.includes('結婚')) {
                type = "MARRIAGE_INCONSISTENCY";
                severity = "MEDIUM";
                suggestion = "キャラクターの結婚状態を正しく反映してください";
            } else if (issue.includes('移住') || issue.includes('居住地')) {
                type = "LOCATION_INCONSISTENCY";
                severity = "MEDIUM";
                suggestion = "キャラクターの現在地情報を修正してください";
            } else if (issue.includes('スキル') || issue.includes('能力')) {
                type = "SKILL_INCONSISTENCY";
                severity = "LOW";
                suggestion = "習得済みのスキルを反映してください";
            } else if (issue.includes('親子') || issue.includes('出生')) {
                type = "FAMILY_RELATION_INCONSISTENCY";
                severity = "MEDIUM";
                suggestion = "親子関係を正しく反映してください";
            }

            return {
                type,
                description: issue,
                severity,
                suggestion
            };
        });
    }

    /**
     * 一時的な生成コンテキストを作成
     * @param content 生成されたコンテンツ
     * @param chapterNumber 章番号
     */
    private async createTempGenerationContext(content: string, chapterNumber: number): Promise<GenerationContext> {
        // メモリマネージャから必要な情報を取得
        const narrativeState = await memoryManager.getNarrativeState(chapterNumber);

        // アクティブなキャラクターを取得
        const charactersInfo = await this.extractCharactersFromContent(content);

        // GenerationContextの最小限の構造を作成
        return {
            chapterNumber,
            storyContext: content.substring(0, 2000), // 最初の部分だけ
            characters: charactersInfo.characters,
            narrativeState,
            // その他必要最小限のフィールド
            tension: narrativeState?.tensionLevel || 5,
            pacing: 0.5
        };
    }

    /**
     * コンテンツからキャラクター情報を抽出
     */
    private async extractCharactersFromContent(content: string): Promise<{
        characters: Array<any>
    }> {
        try {
            // CharacterManagerを直接使用
            const allCharacters = await characterManager.getAllCharacters();
            const characters = allCharacters
                .filter(character => content.includes(character.name));

            return { characters };
        } catch (error) {
            logger.warn('キャラクター情報の抽出に失敗', {
                error: error instanceof Error ? error.message : String(error)
            });
            return { characters: [] };
        }
    }

    /**
     * プロットの整合性をチェックします
     * 
     * @param chapterContent 生成されたチャプター内容
     * @param concretePlot 具体的プロット（あれば）
     * @param abstractGuideline 抽象的プロットガイドライン
     * @param chapterNumber チャプター番号
     * @returns 整合性チェック結果
     */
    async checkPlotConsistency(
        chapterContent: string,
        concretePlot: ConcretePlotPoint | null,
        abstractGuideline: AbstractPlotGuideline | null,
        chapterNumber: number
    ): Promise<{
        consistent: boolean;
        issues: Array<{
            type: string;
            description: string;
            severity: "LOW" | "MEDIUM" | "HIGH";
            suggestion: string;
            context?: string;
        }>;
    }> {
        try {
            const issues: Array<{
                type: string;
                description: string;
                severity: "LOW" | "MEDIUM" | "HIGH";
                suggestion: string;
                context?: string;
            }> = [];

            // 1. 具体プロットがある場合の整合性チェック
            if (concretePlot) {
                await this.checkConcreteElementsPresence(
                    chapterContent,
                    concretePlot,
                    issues
                );
            }

            // 2. 抽象プロットとの整合性チェック
            if (abstractGuideline) {
                await this.checkAbstractConsistency(
                    chapterContent,
                    abstractGuideline,
                    issues
                );

                // 3. 禁止要素のチェック
                if (abstractGuideline.prohibitedElements && abstractGuideline.prohibitedElements.length > 0) {
                    await this.checkProhibitedElements(
                        chapterContent,
                        abstractGuideline.prohibitedElements,
                        issues
                    );
                }
            }

            return {
                consistent: !issues.some(issue => issue.severity === "HIGH"),
                issues
            };
        } catch (error) {
            logError(error, { chapterNumber }, 'プロット整合性チェックに失敗しました');

            // エラー時は問題なしとして返す
            return { consistent: true, issues: [] };
        }
    }

    /**
     * 記憶システムとの整合性をチェックします
     * 
     * @param content 生成されたチャプター内容
     * @param memoryInfo 記憶システム情報
     * @param chapterNumber チャプター番号
     * @returns 整合性チェック結果
     */
    private async checkMemoryConsistency(
        content: string,
        memoryInfo: any,
        chapterNumber: number
    ): Promise<{
        consistent: boolean;
        issues: Array<{
            type: string;
            description: string;
            severity: "LOW" | "MEDIUM" | "HIGH";
            suggestion: string;
            context?: string;
        }>;
    }> {
        const issues: Array<{
            type: string;
            description: string;
            severity: "LOW" | "MEDIUM" | "HIGH";
            suggestion: string;
            context?: string;
        }> = [];

        try {
            // 短いコンテンツへの対応（エラー回避）
            const truncatedContent = content.substring(0, 6000);

            // 前章のサマリーがある場合、整合性チェック
            if (memoryInfo.previousChapterSummary) {
                // Geminiで分析
                const prompt = `
次の小説の章と、前章のサマリーを分析し、継続性と整合性をチェックしてください。

【前章のサマリー】
${memoryInfo.previousChapterSummary}

【現在の章の内容】
${truncatedContent}

以下の点を特に確認してください：
1. 前章の最後の状況と現在の章の冒頭が自然につながっているか
2. 前章で始まったイベントの継続性は保たれているか
3. キャラクターの位置や状態が前章から不自然に変化していないか
4. 前章と矛盾する情報がないか

以下の形式でJSON出力してください：
{
  "continuityIssues": [
    {
      "description": "整合性の問題の説明",
      "severity": "HIGH/MEDIUM/LOW",
      "suggestion": "修正提案",
      "context": "問題が見られる箇所"
    }
  ]
}
`;

                try {
                    const response = await apiThrottler.throttledRequest(() =>
                        this.geminiClient.generateText(prompt, { temperature: 0.2 })
                    );

                    // JSONパース
                    const analysis = JsonParser.parseFromAIResponse<{
                        continuityIssues: Array<{
                            description: string;
                            severity: string;
                            suggestion: string;
                            context?: string;
                        }>;
                    }>(response, { continuityIssues: [] });

                    // 問題があれば追加
                    if (analysis.continuityIssues && analysis.continuityIssues.length > 0) {
                        for (const issue of analysis.continuityIssues) {
                            issues.push({
                                type: "MEMORY_CONTINUITY_ISSUE",
                                description: issue.description,
                                severity: this.mapImportance(issue.severity),
                                suggestion: issue.suggestion,
                                context: issue.context
                            });
                        }
                    }
                } catch (error) {
                    logError(error, { chapterNumber }, '記憶整合性チェックに失敗しました');
                }
            }

            return {
                consistent: !issues.some(issue => issue.severity === "HIGH"),
                issues
            };
        } catch (error) {
            logError(error, { chapterNumber }, '記憶整合性チェックに失敗しました');
            return { consistent: true, issues: [] };
        }
    }

    /**
     * 具体プロット要素の含有をチェックします
     */
    private async checkConcreteElementsPresence(
        content: string,
        concretePlot: ConcretePlotPoint,
        issues: Array<{
            type: string;
            description: string;
            severity: "LOW" | "MEDIUM" | "HIGH";
            suggestion: string;
            context?: string;
        }>
    ): Promise<void> {
        // キーイベントや必須要素が存在しない場合は早期リターン
        if ((!concretePlot.keyEvents || concretePlot.keyEvents.length === 0) &&
            (!concretePlot.requiredElements || concretePlot.requiredElements.length === 0)) {
            return;
        }

        // 短いコンテンツへの対応（エラー回避）
        const truncatedContent = content.substring(0, 8000);

        // Geminiで分析（API負荷軽減のためapiThrottlerを使用）
        const prompt = `
次の小説の章と、それに含まれるべき要素リストを分析し、各要素が実際に章の内容に含まれているかどうかを判断してください。

【章の内容】
${truncatedContent}

【含まれるべき要素】
${concretePlot.keyEvents && concretePlot.keyEvents.length > 0 ? `キーイベント:
${concretePlot.keyEvents.map((event, i) => `${i + 1}. ${event}`).join('\n')}` : ''}

${concretePlot.requiredElements && concretePlot.requiredElements.length > 0 ? `必須要素:
${concretePlot.requiredElements.map((elem, i) => `${i + 1}. ${elem}`).join('\n')}` : ''}

以下の形式でJSON出力してください:
{
  "missingKeyEvents": [
    {"index": 要素のインデックス, "event": "要素の説明", "importance": "HIGH/MEDIUM/LOW"}
  ],
  "missingRequiredElements": [
    {"index": 要素のインデックス, "element": "要素の説明", "importance": "HIGH/MEDIUM/LOW"}
  ],
  "suggestions": [
    "改善提案1",
    "改善提案2"
  ]
}
`;

        try {
            const response = await apiThrottler.throttledRequest(() =>
                this.geminiClient.generateText(prompt, { temperature: 0.2 })
            );

            // JSONパース - JsonParserクラスを使用
            interface ConcreteAnalysisResult {
                missingKeyEvents: Array<{
                    index: number;
                    event: string;
                    importance: string;
                }>;
                missingRequiredElements: Array<{
                    index: number;
                    element: string;
                    importance: string;
                }>;
                suggestions: string[];
            }

            const analysis = JsonParser.parseFromAIResponse<ConcreteAnalysisResult>(response, {
                missingKeyEvents: [],
                missingRequiredElements: [],
                suggestions: []
            });

            // ミッションキーイベントの処理
            if (analysis.missingKeyEvents && analysis.missingKeyEvents.length > 0) {
                for (const missing of analysis.missingKeyEvents) {
                    const event = concretePlot.keyEvents && concretePlot.keyEvents.length >= missing.index
                        ? concretePlot.keyEvents[missing.index - 1]
                        : missing.event;

                    issues.push({
                        type: "MISSING_KEY_EVENT",
                        description: `キーイベント「${event}」が含まれていません`,
                        severity: this.mapImportance(missing.importance),
                        suggestion: "このイベントを章に含めるか、次の章で対応してください"
                    });
                }
            }

            // ミッション必須要素の処理
            if (analysis.missingRequiredElements && analysis.missingRequiredElements.length > 0) {
                for (const missing of analysis.missingRequiredElements) {
                    const element = concretePlot.requiredElements && concretePlot.requiredElements.length >= missing.index
                        ? concretePlot.requiredElements[missing.index - 1]
                        : missing.element;

                    issues.push({
                        type: "MISSING_REQUIRED_ELEMENT",
                        description: `必須要素「${element}」が含まれていません`,
                        severity: this.mapImportance(missing.importance),
                        suggestion: "この要素を追加してストーリーの一貫性を確保してください"
                    });
                }
            }
        } catch (error) {
            logError(error, {}, '具体プロット要素のチェックに失敗しました');
            // エラー時は空のイシューリストを返す
        }
    }

    /**
     * 抽象プロットとの整合性をチェックします
     */
    private async checkAbstractConsistency(
        content: string,
        abstractGuideline: AbstractPlotGuideline,
        issues: Array<{
            type: string;
            description: string;
            severity: "LOW" | "MEDIUM" | "HIGH";
            suggestion: string;
            context?: string;
        }>
    ): Promise<void> {
        // 短いコンテンツへの対応（エラー回避）
        const truncatedContent = content.substring(0, 6000);

        // Geminiで分析（API負荷軽減のためapiThrottlerを使用）
        const prompt = `
次の小説の章と、それが従うべき抽象的な物語ガイドラインを分析し、整合性を確認してください。

【章の内容】
${truncatedContent}

【抽象的ガイドライン】
フェーズ: ${abstractGuideline.phase}
テーマ: ${abstractGuideline.theme}
感情的トーン: ${abstractGuideline.emotionalTone}
${abstractGuideline.potentialDirections && abstractGuideline.potentialDirections.length > 0 ? `望ましい方向性:
${abstractGuideline.potentialDirections.map((dir, i) => `${i + 1}. ${dir}`).join('\n')}` : ''}
${abstractGuideline.thematicMessage ? `テーマ的メッセージ: ${abstractGuideline.thematicMessage}` : ''}
${abstractGuideline.phasePurpose ? `フェーズの目的: ${abstractGuideline.phasePurpose}` : ''}

以下の質問に回答してJSON形式で出力してください:
1. この章はガイドラインのテーマに沿っていますか？
2. 感情的トーンは期待通りですか？
3. 望ましい方向性のうち、どれが取り入れられていますか？
4. ガイドラインとの不整合がある場合、どのような問題がありますか？

出力形式:
{
  "themeConsistent": true/false,
  "themeAnalysis": "テーマに関する分析",
  "toneConsistent": true/false,
  "toneAnalysis": "トーンに関する分析",
  "directionsImplemented": [1, 3], // 実装された方向性のインデックス
  "inconsistencies": [
    {"description": "問題の説明", "severity": "HIGH/MEDIUM/LOW", "suggestion": "改善提案"}
  ]
}
`;

        try {
            const response = await apiThrottler.throttledRequest(() =>
                this.geminiClient.generateText(prompt, { temperature: 0.2 })
            );

            // JSONパース - JsonParserクラスを使用
            interface AbstractAnalysisResult {
                themeConsistent: boolean;
                themeAnalysis: string;
                toneConsistent: boolean;
                toneAnalysis: string;
                directionsImplemented: number[];
                inconsistencies: Array<{
                    description: string;
                    severity: string;
                    suggestion: string;
                }>;
            }

            const analysis = JsonParser.parseFromAIResponse<AbstractAnalysisResult>(response, {
                themeConsistent: true,
                themeAnalysis: "",
                toneConsistent: true,
                toneAnalysis: "",
                directionsImplemented: [],
                inconsistencies: []
            });

            // テーマ整合性の問題
            if (!analysis.themeConsistent) {
                issues.push({
                    type: "THEME_INCONSISTENCY",
                    description: `テーマ「${abstractGuideline.theme}」との不整合: ${analysis.themeAnalysis}`,
                    severity: "MEDIUM",
                    suggestion: "テーマ要素を強化し、物語の方向性を調整してください"
                });
            }

            // トーン整合性の問題
            if (!analysis.toneConsistent) {
                issues.push({
                    type: "TONE_INCONSISTENCY",
                    description: `感情的トーン「${abstractGuideline.emotionalTone}」との不整合: ${analysis.toneAnalysis}`,
                    severity: "LOW",
                    suggestion: "感情表現やシーンの雰囲気を調整してください"
                });
            }

            // その他の不整合
            if (analysis.inconsistencies && analysis.inconsistencies.length > 0) {
                for (const issue of analysis.inconsistencies) {
                    issues.push({
                        type: "ABSTRACT_GUIDELINE_INCONSISTENCY",
                        description: issue.description,
                        severity: this.mapImportance(issue.severity),
                        suggestion: issue.suggestion
                    });
                }
            }
        } catch (error) {
            logError(error, {}, '抽象プロット整合性のチェックに失敗しました');
            // エラー時は空のイシューリストを返す
        }
    }

    /**
     * 禁止要素をチェックします
     */
    private async checkProhibitedElements(
        content: string,
        prohibitedElements: string[],
        issues: Array<{
            type: string;
            description: string;
            severity: "LOW" | "MEDIUM" | "HIGH";
            suggestion: string;
            context?: string;
        }>
    ): Promise<void> {
        if (!prohibitedElements || prohibitedElements.length === 0) {
            return;
        }

        // 短いコンテンツへの対応（エラー回避）
        const truncatedContent = content.substring(0, 5000);

        // Geminiで分析（API負荷軽減のためapiThrottlerを使用）
        const prompt = `
次の小説の章と、それに含めるべきでない禁止要素リストを分析し、禁止要素が章に含まれているかどうかを判断してください。

【章の内容】
${truncatedContent}

【禁止要素】
${prohibitedElements.map((elem, i) => `${i + 1}. ${elem}`).join('\n')}

以下の形式でJSON出力してください:
{
  "detectedProhibitedElements": [
    {
      "index": 禁止要素のインデックス,
      "element": "禁止要素の内容",
      "evidence": "章内のどの部分に現れているか",
      "severity": "HIGH/MEDIUM/LOW"
    }
  ]
}
`;

        try {
            const response = await apiThrottler.throttledRequest(() =>
                this.geminiClient.generateText(prompt, { temperature: 0.2 })
            );

            // JSONパース - JsonParserクラスを使用
            interface ProhibitedElementsResult {
                detectedProhibitedElements: Array<{
                    index: number;
                    element: string;
                    evidence: string;
                    severity: string;
                }>;
            }

            const analysis = JsonParser.parseFromAIResponse<ProhibitedElementsResult>(response, {
                detectedProhibitedElements: []
            });

            // 禁止要素が検出された場合
            if (analysis.detectedProhibitedElements && analysis.detectedProhibitedElements.length > 0) {
                for (const detected of analysis.detectedProhibitedElements) {
                    const element = prohibitedElements.length >= detected.index
                        ? prohibitedElements[detected.index - 1]
                        : detected.element;

                    issues.push({
                        type: "PROHIBITED_ELEMENT",
                        description: `禁止要素「${element}」が含まれています`,
                        severity: this.mapImportance(detected.severity),
                        suggestion: "この要素を削除または修正してガイドラインに準拠するよう調整してください",
                        context: detected.evidence
                    });
                }
            }
        } catch (error) {
            logError(error, {}, '禁止要素のチェックに失敗しました');
            // エラー時は空のイシューリストを返す
        }
    }

    // ヘルパーメソッド

    /**
     * 章に関連する具体的プロットを取得します
     */
    private async getRelatedConcretePlot(chapterNumber: number): Promise<ConcretePlotPoint | null> {
        try {
            // PlotManagerを直接使用
            return await plotManager.getConcretePlotForChapter(chapterNumber);
        } catch (error) {
            logger.warn(`具体的プロットの取得に失敗しました (章 ${chapterNumber})`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return null;
        }
    }

    /**
     * 章に関連する抽象的ガイドラインを取得します
     */
    private async getRelatedAbstractGuideline(chapterNumber: number): Promise<AbstractPlotGuideline | null> {
        try {
            // PlotManagerを直接使用
            return await plotManager.getAbstractGuidelinesForChapter(chapterNumber);
        } catch (error) {
            logger.warn(`抽象的ガイドラインの取得に失敗しました (章 ${chapterNumber})`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return null;
        }
    }

    /**
     * 記憶システムから関連情報を取得します
     */
    private async getMemorySystemInfo(chapterNumber: number): Promise<{
        previousChapterSummary?: string;
        significantEvents: KeyEvent[];
        persistentEvents: SignificantEvent[];
        activeCharacters: any[];
        characterRelationships: any[];
    }> {
        try {
            // デフォルト値に正しい型を指定
            const result: {
                previousChapterSummary: string;
                significantEvents: KeyEvent[];
                persistentEvents: SignificantEvent[];
                activeCharacters: any[];
                characterRelationships: any[];
            } = {
                previousChapterSummary: '',
                significantEvents: [],
                persistentEvents: [],
                activeCharacters: [],
                characterRelationships: []
            };

            // 前章のサマリーを取得
            if (chapterNumber > 1) {
                try {
                    // narrativeMemoryを使用して取得
                    const narrativeMemory = memoryManager.getMidTermMemory();
                    const summary = await narrativeMemory.getChapterSummary(chapterNumber - 1);
                    if (summary) {
                        result.previousChapterSummary = summary;
                    }
                } catch (error) {
                    logger.warn(`前章のサマリー取得に失敗しました (章 ${chapterNumber})`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }

            // 重要イベントを取得
            try {
                const events = await memoryManager.getImportantEvents(1, chapterNumber - 1);
                if (events && events.length > 0) {
                    result.significantEvents = events;
                }
            } catch (error) {
                logger.warn(`重要イベント取得に失敗しました (章 ${chapterNumber})`, {
                    error: error instanceof Error ? error.message : String(error)
                });
            }

            // 永続的イベントを取得
            try {
                // 引数を正しく指定
                const persistentEvents = await memoryManager.getPersistentEvents(1, chapterNumber);
                if (persistentEvents && persistentEvents.length > 0) {
                    result.persistentEvents = persistentEvents.filter(e => e.chapterNumber < chapterNumber);
                }
            } catch (error) {
                logger.warn(`永続的イベント取得に失敗しました (章 ${chapterNumber})`, {
                    error: error instanceof Error ? error.message : String(error)
                });
            }

            // アクティブキャラクターとその関係を取得
            try {
                // キャラクター情報の収集方法を修正
                const characters = await characterManager.getAllCharacters();
                result.activeCharacters = characters || [];

                // 関係データを取得（全キャラクターの関係リストを構築）
                const relationshipData = [];

                // アクティブキャラクターのIDリストを作成
                const characterIds = characters.map(c => c.id);

                // 各キャラクターの関係を取得し結合
                for (const id of characterIds) {
                    try {
                        const relationships = await characterManager.getCharacterRelationships(id);
                        if (relationships && relationships.relationships) {
                            relationshipData.push(...relationships.relationships);
                        }
                    } catch (relationError) {
                        // 個々のエラーはログに記録するだけで続行
                        logger.debug(`キャラクター${id}の関係取得に失敗`, {
                            error: relationError instanceof Error ? relationError.message : String(relationError)
                        });
                    }
                }

                result.characterRelationships = relationshipData;
            } catch (error) {
                logger.warn(`キャラクター情報取得に失敗しました (章 ${chapterNumber})`, {
                    error: error instanceof Error ? error.message : String(error)
                });
            }

            return result;
        } catch (error) {
            logger.error(`記憶システム情報の取得に失敗しました (章 ${chapterNumber})`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー時は空の結果を適切な型で返す
            return {
                significantEvents: [] as KeyEvent[],
                persistentEvents: [] as SignificantEvent[],
                activeCharacters: [],
                characterRelationships: []
            };
        }
    }

    /**
     * 重要度を整合性APIの値にマッピング
     */
    private mapImportance(importance: string): "LOW" | "MEDIUM" | "HIGH" {
        const normalized = importance?.toUpperCase() || "";
        if (normalized === "HIGH") return "HIGH";
        if (normalized === "MEDIUM") return "MEDIUM";
        return "LOW";
    }
}