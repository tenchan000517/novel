// src/lib/foreshadowing/resolution-advisor.ts

import { memoryManager } from '@/lib/memory/manager';
import { Foreshadowing } from '@/types/memory';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { plannedForeshadowingManager } from './planned-foreshadowing-manager';

interface ResolutionSuggestion {
    foreshadowing: Foreshadowing;
    chapterContent: string;
    reason: string;
    confidence: number;  // 0.0-1.0
}

/**
 * @class ForeshadowingResolutionAdvisor
 * @description
 * 伏線解決の提案を生成するアドバイザークラス。
 * チャプター内容を分析し、適切な伏線解決のタイミングと方法を提案します。
 * AIを活用して伏線解決の可能性と適切性を評価します。
 */

export class ForeshadowingResolutionAdvisor {
    private geminiClient: GeminiClient;

    constructor() {
        this.geminiClient = new GeminiClient();
    }

    /**
     * 伏線解決提案を生成します
     * 
     * 指定されたチャプター内容と番号に基づいて、未解決の伏線に対する
     * 解決提案を生成します。計画済み伏線を優先的に処理し、残りの
     * 伏線についてはAIによる評価を行います。
     * 
     * @async
     * @param {string} chapterContent チャプター内容
     * @param {number} chapterNumber チャプター番号
     * @param {number} [maxSuggestions=3] 最大提案数
     * @returns {Promise<ResolutionSuggestion[]>} 伏線解決提案の配列
     */
    async suggestResolutions(
        chapterContent: string,
        chapterNumber: number,
        maxSuggestions: number = 3
    ): Promise<any[]> {
        try {
            logger.info(`チャプター${chapterNumber}の伏線解決提案を生成`);

            // 計画済み伏線の読み込みを確認
            if (!plannedForeshadowingManager.isLoaded()) {
                await plannedForeshadowingManager.loadPlannedForeshadowings();
            }

            const results: any[] = [];

            // 1. このチャプターで解決すべき計画済み伏線を取得
            const plannedForeshadowingsToResolve = plannedForeshadowingManager.getForeshadowingsToResolveInChapter(chapterNumber);

            // 2. 計画済み伏線を解決提案に変換して追加
            for (const planned of plannedForeshadowingsToResolve) {
                const foreshadowing = plannedForeshadowingManager.convertToForeshadowing(planned);

                results.push({
                    foreshadowing,
                    chapterContent: planned.resolution_context,
                    reason: `このチャプターで計画されていた伏線「${planned.description}」の解決時期です。`,
                    confidence: 1.0 // 計画済みのため最高の信頼度
                });

                // 伏線を解決済みとしてマーク
                plannedForeshadowingManager.markAsResolved(planned.id);
            }

            // 3. 計画済み伏線の変更を保存
            if (plannedForeshadowingsToResolve.length > 0) {
                await plannedForeshadowingManager.savePlannedForeshadowings();
            }

            // 4. このチャプターで言及すべきヒントがあるかチェック
            const hintsForChapter = plannedForeshadowingManager.getHintsForChapter(chapterNumber);

            // ヒントがある場合、低い信頼度で提案として追加
            for (const hintInfo of hintsForChapter) {
                const foreshadowing = plannedForeshadowingManager.convertToForeshadowing(hintInfo.foreshadowing);

                results.push({
                    foreshadowing,
                    chapterContent: hintInfo.hint,
                    reason: `このチャプターで伏線「${hintInfo.foreshadowing.description}」に関するヒントを含めることができます。`,
                    confidence: 0.5, // ヒントは解決ではないので中程度の信頼度
                    isHint: true
                });
            }

            // 5. 必要な数に足りない場合はAIで伏線解決提案を生成
            const remainingCount = Math.max(0, maxSuggestions - results.length);

            if (remainingCount > 0 && !plannedForeshadowingManager.areAllForeshadowingsResolved()) {
                // memoryManagerを初期化
                if (!(await memoryManager.isInitialized())) {
                    await memoryManager.initialize();
                }

                // 未解決の伏線を取得
                const unresolved = await memoryManager.getLongTermMemory().getUnresolvedForeshadowing();

                if (unresolved.length > 0) {
                    // チャプター内容を切り詰め
                    const contentForAnalysis = chapterContent.substring(0, 6000);

                    // 各未解決伏線を順次処理
                    for (const foreshadowing of unresolved) {
                        // 既に追加済みの伏線はスキップ
                        if (results.some(r => r.foreshadowing.id === foreshadowing.id)) {
                            continue;
                        }

                        try {
                            // apiThrottlerを使用して順次APIリクエストを実行
                            const result = await apiThrottler.throttledRequest(() =>
                                this.evaluateResolutionPossibility(
                                    foreshadowing,
                                    contentForAnalysis,
                                    chapterNumber
                                )
                            );

                            // 信頼度が閾値を超える場合のみ追加
                            if (result.confidence >= 0.6) {
                                results.push({
                                    foreshadowing,
                                    chapterContent: result.snippetForResolution || '',
                                    reason: result.reason,
                                    confidence: result.confidence
                                });
                            }

                            // 必要数に達したら終了
                            if (results.length >= maxSuggestions) {
                                break;
                            }
                        } catch (error) {
                            logError(error, { foreshadowingId: foreshadowing.id }, '伏線解決可能性の評価に失敗しました');
                            // エラーがあっても処理を継続
                        }
                    }
                }
            }

            // 信頼度の高い順にソート
            results.sort((a, b) => b.confidence - a.confidence);

            // 最大提案数で切り詰め
            const limitedResults = results.slice(0, maxSuggestions);

            logger.info(`${limitedResults.length}件の伏線解決提案を生成しました`);
            return limitedResults;
        } catch (error) {
            logError(error, { chapterNumber }, '伏線解決提案の生成に失敗しました');
            throw error;
        }
    }

    /**
     * 伏線の解決可能性を評価します
     * 
     * 特定の伏線に対して、現在のチャプターでの解決可能性を評価します。
     * 計画された解決タイミングとの関連性やチャプター内容との整合性を考慮し、
     * AIを使用して解決可能性とその信頼度を算出します。
    */
    private async evaluateResolutionPossibility(
        foreshadowing: Foreshadowing,
        chapterContent: string,
        chapterNumber: number
    ): Promise<{
        isPossible: boolean;
        confidence: number;
        reason: string;
        snippetForResolution?: string;
    }> {
        // 伏線を解決するのに適切なタイミングかをチェック
        const plannedChapter = foreshadowing.plannedResolution;

        // 指定の解決チャプターから±3チャプター以内であれば高い信頼度
        let timingConfidence = 0.5;
        if (plannedChapter) {
            const chapterDifference = Math.abs(plannedChapter - chapterNumber);
            if (chapterDifference === 0) {
                timingConfidence = 0.9; // 計画通りのチャプター
            } else if (chapterDifference <= 3) {
                timingConfidence = 0.7; // 計画の±3チャプター以内
            } else if (chapterDifference <= 5) {
                timingConfidence = 0.5; // 計画の±5チャプター以内
            } else {
                timingConfidence = 0.3; // 計画から大きく外れている
            }
        }

        // AIに伏線解決の可能性を評価させる
        const prompt = `
物語のチャプターと、これまでに導入された伏線を分析し、このチャプターでその伏線を解決できるかどうかを評価してください。

【伏線情報】
- 説明: ${foreshadowing.description}
- 導入チャプター: ${foreshadowing.chapter_introduced}
- 詳細: ${foreshadowing.context || 'なし'}
- 想定される解決: ${foreshadowing.potential_resolution || 'なし'}
- 計画解決チャプター: ${foreshadowing.plannedResolution || 'なし'}

【現在のチャプター】
チャプター番号: ${chapterNumber}
内容:
${chapterContent}

以下の質問に答えてください:
1. このチャプターで上記の伏線を解決することは可能ですか？ (可能/不可能)
2. その判断の信頼度を0から1の値で示してください（例: 0.8）
3. その理由を簡潔に説明してください
4. もし解決可能な場合、チャプター内のどの部分（具体的なテキスト）が伏線解決に関連しますか？

回答形式:
可能性: 可能 または 不可能
信頼度: 0.0-1.0の数値
理由: 簡潔な説明
関連テキスト: チャプター内の該当テキスト（解決可能な場合のみ）
`;

        const response = await this.geminiClient.generateText(prompt, {
            temperature: 0.1 // 分析タスクは低温で
        });

        // レスポンスを解析 (正規表現の 's' フラグを使わないように修正)
        const isPossibleMatch = response.match(/可能性:\s*(可能|不可能)/i);
        const confidenceMatch = response.match(/信頼度:\s*([0-9.]+)/i);

        // 複数行マッチを避けるために修正
        const reasonPattern = /理由:\s*(.*?)(?:\n|$)/i;
        const reasonMatch = reasonPattern.exec(response);

        const textPattern = /関連テキスト:\s*(.*?)(?:\n\n|$)/i;
        const textMatch = textPattern.exec(response);

        // null の可能性を排除
        const isPossible = !!(isPossibleMatch && isPossibleMatch[1] === '可能');
        const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5;
        const reason = reasonMatch ? reasonMatch[1].trim() : '';
        const snippetForResolution = textMatch ? textMatch[1].trim() : '';

        // タイミングの信頼度を加味した最終的な信頼度
        const finalConfidence = isPossible ?
            (confidence * 0.7 + timingConfidence * 0.3) : 0.1;

        return {
            isPossible,
            confidence: finalConfidence,
            reason,
            snippetForResolution: isPossible ? snippetForResolution : undefined
        };
    }
}

// シングルトンインスタンスをエクスポート
export const resolutionAdvisor = new ForeshadowingResolutionAdvisor();
