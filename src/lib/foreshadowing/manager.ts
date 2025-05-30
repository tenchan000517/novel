// src/lib/foreshadowing/manager.ts

/**
 * @fileoverview 伏線管理システム
 * @description
 * 物語創作支援システムにおける伏線の管理を担当するモジュールです。
 * 伏線の生成、更新、整合性チェック、解決推奨などの機能を統合的に提供し、
 * 伏線に関する様々な操作を一元管理します。
 */

import { memoryManager } from '@/lib/memory/manager';
import { foreshadowingEngine } from './engine';
import { Foreshadowing } from '@/types/memory';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { resolutionAdvisor } from './resolution-advisor';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { apiThrottler } from '@/lib/utils/api-throttle';

/**
 * @class ForeshadowingManager
 * @description
 * 伏線管理システムの統合インターフェースを提供するクラス。
 * 伏線エンジンと解決アドバイザーを統合し、伏線の生成、更新、整合性チェック、
 * 解決推奨などの機能を一元的に管理します。
 */
export class ForeshadowingManager {

    private geminiClient: GeminiClient;

    constructor() {
        this.geminiClient = new GeminiClient();
        // その他の初期化処理
    }

    /**
     * チャプターに対する伏線処理を実行します
     * 
     * チャプターコンテンツから新しい伏線を生成し、解決すべき伏線を提案します。
     * このメソッドは新しい伏線の生成と解決提案を並行して処理します。
     */
    // src/lib/foreshadowing/manager.ts
    async processChapterAndGenerateForeshadowing(
        chapterContent: string,
        chapterNumber: number,
        generateCount: number = 2
    ): Promise<{
        generatedCount: number;
        resolutionSuggestions: any[];
    }> {
        try {
            logger.info(`チャプター${chapterNumber}の伏線処理を開始`);

            // memoryManagerの初期化
            if (!(await memoryManager.isInitialized())) {
                await memoryManager.initialize();
            }

            // 1. 新しい伏線の生成と保存（順次処理）
            const generatedCount = await apiThrottler.throttledRequest(() =>
                foreshadowingEngine.processChapterAndGenerateForeshadowing(
                    chapterContent,
                    chapterNumber,
                    generateCount
                )
            );

            // 2. 解決すべき伏線の提案（順次処理）
            const resolutionSuggestions = await apiThrottler.throttledRequest(() =>
                resolutionAdvisor.suggestResolutions(
                    chapterContent,
                    chapterNumber,
                    3 // 最大3件の提案
                )
            );

            logger.info(`チャプター${chapterNumber}の伏線処理完了: ${generatedCount}件生成、${resolutionSuggestions.length}件の解決提案`);

            return {
                generatedCount,
                resolutionSuggestions
            };
        } catch (error) {
            logError(error, { chapterNumber }, '伏線処理中にエラーが発生しました');
            return { generatedCount: 0, resolutionSuggestions: [] };
        }
    }

    /**
     * 伏線のバルク操作を実行します
     * 
     * 複数の伏線を一度に更新するためのメソッドです。
     * 各更新は個別に実行され、一部の更新に失敗しても残りの処理は継続されます。
     */
    async bulkUpdateForeshadowing(
        updates: Array<{ id: string, updates: Partial<Foreshadowing> }>
    ): Promise<number> {
        try {
            // memoryManagerの初期化
            if (!(await memoryManager.isInitialized())) {
                await memoryManager.initialize();
            }

            let successCount = 0;

            // 各更新を順次実行
            for (const item of updates) {
                try {
                    await memoryManager.getLongTermMemory().updateForeshadowing(
                        item.id,
                        item.updates
                    );
                    successCount++;
                } catch (error) {
                    logger.error(`伏線 "${item.id}" の更新に失敗しました`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                    // 個別の失敗は続行
                }
            }

            logger.info(`バルク更新完了: ${successCount}/${updates.length}件成功`);
            return successCount;
        } catch (error) {
            logError(error, {}, 'バルク更新中にエラーが発生しました');
            return 0;
        }
    }

    /**
     * 伏線の整合性チェックを実行します
     * 
     * 現在のチャプターを基準に、矛盾や問題のある伏線を検出します。
     * 特に解決済みフラグと解決チャプターの不一致、長期未解決の伏線、
     * 予定解決チャプターを過ぎている伏線などを検出します。
     */
    async checkForeshadowingConsistency(currentChapter: number): Promise<{
        isConsistent: boolean;
        issues: Array<{ id: string, issue: string, severity: 'HIGH' | 'MEDIUM' | 'LOW' }>
    }> {
        try {
            // memoryManagerの初期化
            if (!(await memoryManager.isInitialized())) {
                await memoryManager.initialize();
            }

            // 全伏線データを取得
            const foreshadowing = await memoryManager.getLongTermMemory().getForeshadowing();
            const issues: Array<{ id: string, issue: string, severity: 'HIGH' | 'MEDIUM' | 'LOW' }> = [];

            // チェック1: 解決済みだが解決チャプターがない
            for (const item of foreshadowing) {
                if (item.resolved && !item.resolution_chapter) {
                    issues.push({
                        id: item.id,
                        issue: '解決済みにマークされていますが、解決チャプターが設定されていません',
                        severity: 'MEDIUM'
                    });
                }
            }

            // チェック2: 過去に導入されたが解決されていない伏線（古すぎる伏線）
            const latestChapter = currentChapter || Math.max(...foreshadowing.map((f: Foreshadowing) =>
                Math.max(f.chapter_introduced, f.resolution_chapter || 0)
            ));

            for (const item of foreshadowing) {
                if (!item.resolved &&
                    item.chapter_introduced < latestChapter - 20 &&
                    (!item.plannedResolution || item.plannedResolution < latestChapter)) {
                    issues.push({
                        id: item.id,
                        issue: `長期間（${latestChapter - item.chapter_introduced}チャプター）未解決の伏線です`,
                        severity: 'LOW'
                    });
                }
            }

            // チェック3: 解決予定が過ぎているのに未解決
            for (const item of foreshadowing) {
                if (!item.resolved &&
                    item.plannedResolution &&
                    item.plannedResolution < latestChapter - 5) {
                    issues.push({
                        id: item.id,
                        issue: `計画解決チャプター(${item.plannedResolution})を過ぎていますが、まだ解決されていません`,
                        severity: 'MEDIUM'
                    });
                }
            }

            // チェック4: 導入チャプターが未来
            for (const item of foreshadowing) {
                if (item.chapter_introduced > latestChapter) {
                    issues.push({
                        id: item.id,
                        issue: `導入チャプター(${item.chapter_introduced})が現在のチャプター(${latestChapter})より未来です`,
                        severity: 'HIGH'
                    });
                }
            }

            logger.info(`伏線整合性チェック完了: ${issues.length}件の問題を検出`);

            return {
                isConsistent: issues.length === 0,
                issues
            };
        } catch (error) {
            logError(error, { currentChapter }, '伏線整合性チェック中にエラーが発生しました');

            // エラー時は問題なしとして返す
            return {
                isConsistent: true,
                issues: []
            };
        }
    }

    /**
     * 現在のチャプターで解決すべき伏線を取得します
     * 
     * チャプターコンテンツとチャプター番号を基に、現在のチャプターで
     * 解決すべき伏線を提案します。計画的な解決予定と文脈に基づく
     * AI解析の両方から候補を収集します。
     */
    async getSuggestedForeshadowingsToResolve(
        chapterContent: string,
        chapterNumber: number
    ): Promise<Foreshadowing[]> {
        try {
            // memoryManagerの初期化
            if (!(await memoryManager.isInitialized())) {
                await memoryManager.initialize();
            }

            // 2つの方法で解決候補を取得
            // 1. チャプター番号に基づく計画的な推奨
            const plannedSuggestions = await memoryManager.getLongTermMemory().suggestForeshadowingToResolve(
                chapterNumber
            );

            // 2. AI解析による文脈に基づく推奨
            const aiSuggestions = await foreshadowingEngine.suggestForeshadowingsToResolve(
                chapterContent,
                chapterNumber,
                3
            );

            // 2つの配列を結合し、重複を除去
            const combined = [...plannedSuggestions];

            // 既に含まれていないものだけ追加
            for (const suggestion of aiSuggestions) {
                if (!combined.some(item => item.id === suggestion.id)) {
                    combined.push(suggestion);
                }
            }

            return combined;
        } catch (error) {
            logError(error, { chapterNumber }, '伏線解決候補の取得中にエラーが発生しました');
            return [];
        }
    }

    /**
     * 古い伏線をまとめて解決します
     * 
     * 長期間未解決のままになっている伏線を一括で解決するためのヘルパーメソッドです。
     * 特定のチャプター番号を解決チャプターとして設定し、指定された解決理由で
     * 複数の古い伏線を一度に解決します。
     */
    async resolveStaleForeshadowings(
        currentChapter: number,
        resolution: string = '物語の進行に伴い暗黙的に解決されました'
    ): Promise<number> {
        try {
            // 古い伏線を検出
            const staleForeshadowings = await foreshadowingEngine.checkStaleForeshadowing(currentChapter);

            if (staleForeshadowings.length === 0) {
                return 0;
            }

            // memoryManagerの初期化
            if (!(await memoryManager.isInitialized())) {
                await memoryManager.initialize();
            }

            // 各伏線を解決
            let resolvedCount = 0;

            for (const item of staleForeshadowings) {
                try {
                    await memoryManager.getLongTermMemory().resolveForeshadowing(
                        item.id,
                        currentChapter,
                        resolution
                    );
                    resolvedCount++;
                } catch (error) {
                    logger.warn(`伏線 "${item.id}" の解決に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
                    // 個別の失敗は続行
                }
            }

            logger.info(`${resolvedCount}/${staleForeshadowings.length}件の古い伏線を解決しました`);
            return resolvedCount;
        } catch (error) {
            logError(error, { currentChapter }, '古い伏線解決中にエラーが発生しました');
            return 0;
        }
    }

    /**
     * チャプター内容から解決された伏線を分析します
     * 
     * 指定されたチャプター内容を分析し、そのチャプターで解決された伏線を特定します。
     * 既存の未解決伏線リストと照合し、回収された伏線と回収内容を返します。
     */
    async analyzeResolvedForeshadowing(
        content: string,
        chapterNumber: number
    ): Promise<Foreshadowing[]> {
        try {
            logger.info(`チャプター${chapterNumber}の伏線回収分析を開始`);

            // memoryManagerの初期化確認
            if (!(await memoryManager.isInitialized())) {
                await memoryManager.initialize();
            }

            // 未解決の伏線を取得
            const unresolvedForeshadowing = await memoryManager.getLongTermMemory().getUnresolvedForeshadowing();

            if (unresolvedForeshadowing.length === 0) {
                logger.info('未解決の伏線がありません');
                return [];
            }

            // チャプター内容を切り詰め
            const contentForAnalysis = content.substring(0, 6000);

            // プロンプト作成
            const prompt = `
以下のチャプター内容を分析し、指定された未解決の伏線のうち、このチャプターで回収（解決）されたものを特定してください。

【チャプター内容】
${contentForAnalysis}

【未解決の伏線リスト】
${unresolvedForeshadowing.map((f: Foreshadowing, i: number) =>
                `${i + 1}. ${f.description} (チャプター${f.chapter_introduced}で導入)`
            ).join('\n')}

回収された伏線がある場合は、以下の形式で回答してください：
回収された伏線番号: [番号]
回収内容: [どのように回収されたかの説明]

複数ある場合は、それぞれについて上記の形式で列挙してください。
伏線が回収されていない場合は「回収された伏線はありません」と回答してください。
`;

            // APIスロットリングを適用してGemini APIを呼び出し
            const response = await apiThrottler.throttledRequest(() =>
                this.geminiClient.generateText(prompt, {
                    temperature: 0.2
                })
            );

            // レスポンスから回収された伏線を抽出
            const resolvedForeshadowings: Foreshadowing[] = [];
            const resolvedPattern = /回収された伏線番号:\s*(\d+)/gi;
            const resolutionPattern = /回収内容:\s*([^\n]+)/gi;

            // 「回収された伏線はありません」という文言があるか確認
            if (response.includes('回収された伏線はありません')) {
                logger.info('このチャプターで回収された伏線はありません');
                return [];
            }

            let match;
            let resolutionMatches = [];

            // 回収内容のマッチを先に集める
            while ((match = resolutionPattern.exec(response)) !== null) {
                resolutionMatches.push(match[1].trim());
            }

            let index = 0;
            while ((match = resolvedPattern.exec(response)) !== null) {
                const foreshadowingIndex = parseInt(match[1]) - 1;
                if (foreshadowingIndex >= 0 && foreshadowingIndex < unresolvedForeshadowing.length) {
                    const foreshadowing = unresolvedForeshadowing[foreshadowingIndex];
                    const resolution = index < resolutionMatches.length ?
                        resolutionMatches[index] : `チャプター${chapterNumber}で回収されました`;

                    // 解決情報を設定
                    const resolvedForeshadowing = {
                        ...foreshadowing,
                        resolved: true,
                        resolution_chapter: chapterNumber,
                        resolution_description: resolution
                    };

                    resolvedForeshadowings.push(resolvedForeshadowing);
                    index++;
                }
            }

            logger.info(`チャプター${chapterNumber}で${resolvedForeshadowings.length}件の伏線回収を検出しました`);
            return resolvedForeshadowings;
        } catch (error) {
            logError(error, { chapterNumber }, '伏線回収分析中にエラーが発生しました');
            return [];
        }
    }

    // 補助メソッドの実装
    private async detectResolvedForeshadowings(
        content: string,
        candidates: Foreshadowing[],
        chapterNumber: number
    ): Promise<Foreshadowing[]> {
        // 伏線候補が少ない場合は早期リターン
        if (candidates.length === 0) return [];

        // 候補の情報をまとめる
        const candidatesInfo = candidates.map((f, idx) =>
            `${idx + 1}. ${f.description} (${f.chapter_introduced}章で導入)`
        ).join('\n');

        // 分析プロンプト作成
        const prompt = `
    以下のチャプター内容において、どの伏線が回収（解決）されているか分析してください。
    伏線が解決されているとは、それが明らかにされたり、説明されたり、意味が明確になったりすることを意味します。
    
    【チャプター内容】
    ${content.substring(0, 6000)} // 長すぎる場合は切り詰め
    
    【未解決の伏線リスト】
    ${candidatesInfo}
    
    以下の形式でJSON出力してください:
    [
      {
        "index": 伏線の番号,
        "resolved": true/false,
        "resolution": "どのように解決されたかの説明（解決された場合）",
        "confidence": 確信度（0.0～1.0）
      },
      ...
    ]
    `;

        // Gemini APIを使用して分析
        const response = await this.geminiClient.generateText(prompt, {
            temperature: 0.1 // 分析なので低温設定
        });

        try {
            // レスポンスをパース
            const results = this.parseJsonFromResponse(response);

            if (!Array.isArray(results)) {
                logger.warn('Invalid resolution analysis response format');
                return [];
            }

            // 解決された伏線のみをフィルタリング
            const resolvedItems = results
                .filter(r => r.resolved === true && r.confidence >= 0.7)
                .map(r => {
                    const originalForeshadowing = candidates[r.index];
                    if (!originalForeshadowing) return null;

                    return {
                        ...originalForeshadowing,
                        resolution: r.resolution,
                        resolution_chapter: chapterNumber,
                        resolved: true
                    };
                })
                .filter(item => item !== null);

            return resolvedItems;
        } catch (error) {
            logError(error, { chapterNumber }, '伏線解決分析に失敗しました');
            return [];
        }
    }

    // JSONパース用のヘルパーメソッド
    private parseJsonFromResponse(response: string): any {
        try {
            // コードブロックを削除
            const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) ||
                response.match(/{[\s\S]*}/);

            const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
            return JSON.parse(jsonStr);
        } catch (error) {
            logger.error('Failed to parse JSON response', { error });
            throw error;
        }
    }
}

// シングルトンインスタンスをエクスポート
export const foreshadowingManager = new ForeshadowingManager();

/**
 * 伏線管理システムのシングルトンインスタンス
 * 
 * ForeshadowingManagerクラスのシングルトンインスタンスです。
 * アプリケーション全体で一貫した伏線管理機能を提供します。
 * 
 * @type {ForeshadowingManager}
 * 
 * @singleton
 * アプリケーション全体で単一のインスタンスを共有するシングルトンパターンで実装されています。
 * これにより、システム全体で一貫した伏線管理が可能になります。
 * 
 * @initialization
 * モジュールの読み込み時に自動的にインスタンス化されます。
 * 各メソッド内で必要に応じてmemoryManagerの初期化が行われます。
 * 
 * @usage
 * import { foreshadowingManager } from '@/lib/foreshadowing/manager';
 * 
 * // チャプターからの伏線生成と解決提案
 * const result = await foreshadowingManager.processChapterAndGenerateForeshadowing(
 *   chapterContent,
 *   chapterNumber,
 *   2 // 生成する伏線の数
 * );
 * 
 * @example
 * // 伏線の整合性チェック
 * import { foreshadowingManager } from '@/lib/foreshadowing/manager';
 * 
 * async function checkForeshadowingIssues(currentChapter) {
 *   const consistencyResult = await foreshadowingManager.checkForeshadowingConsistency(
 *     currentChapter
 *   );
 *   
 *   if (!consistencyResult.isConsistent) {
 *     console.log(`${consistencyResult.issues.length}件の伏線整合性問題が検出されました`);
 *     return consistencyResult.issues;
 *   }
 *   
 *   return [];
 * }
 */