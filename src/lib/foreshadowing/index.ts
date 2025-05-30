// src/lib/foreshadowing/index.ts

/**
 * @fileoverview 伏線管理システム
 * @description
 * 物語創作支援システムにおける伏線（foreshadowing）の管理機能を提供するモジュールです。
 * 伏線の自動生成、解決推奨、一括更新、整合性チェックなどの機能を統合しています。
 * 
 * @role
 * - 伏線の生成および管理のためのインターフェース提供
 * - 伏線生成機能と解決推奨機能の統合
 * - 複数の伏線に対する一括操作の実装
 * - 伏線データの整合性検証
 * 
 * @dependencies
 * - './auto-generator' - 伏線の自動生成機能を提供
 * - './resolution-advisor' - 伏線の解決推奨機能を提供
 * - '@/lib/memory/manager' - 伏線データの永続化と取得を担当
 * - '@/lib/utils/logger' - ログ出力機能
 * 
 * @types
 * - '@/types/memory' - Foreshadowing型の定義
 * 
 * @flow
 * 1. 伏線マネージャーのインスタンス化
 * 2. メモリマネージャーの初期化確認
 * 3. 伏線生成または解決推奨の要求処理
 * 4. 伏線データの検証または更新
 * 5. 処理結果の返却
 */

import { ForeshadowingAutoGenerator, foreshadowingGenerator } from './auto-generator';
import { ForeshadowingResolutionAdvisor, resolutionAdvisor } from './resolution-advisor';
import { memoryManager } from '@/lib/memory/manager';
import { Foreshadowing } from '@/types/memory';
import { logger } from '@/lib/utils/logger';

/**
 * @class ForeshadowingManager
 * @description
 * 伏線管理システム。伏線の追加、更新、削除、解決、自動生成、解決推奨の機能を統合するクラス。
 * 
 * @role
 * - 伏線自動生成と解決推奨機能の統合インターフェース
 * - 複数伏線の一括処理機能の提供
 * - 伏線データの整合性検証の実行
 * - memoryManagerとの連携による伏線データの永続化
 * 
 * @depends-on
 * - ForeshadowingAutoGenerator - 伏線の自動生成機能
 * - ForeshadowingResolutionAdvisor - 伏線の解決推奨機能
 * - memoryManager - 記憶管理システム
 * - logger - ログ出力ユーティリティ
 * 
 * @lifecycle
 * 1. コンストラクタでのgeneratorとadvisorの初期化
 * 2. 各メソッド実行時のmemoryManager初期化確認
 * 3. 伏線処理の実行（生成/更新/チェック）
 * 4. 処理結果の返却
 * 
 * @example-flow
 * アプリケーション → ForeshadowingManager.processChapterAndGenerateForeshadowing → 
 *   memoryManager初期化確認 →
 *   advisor.suggestResolutions →
 *   generator.generateAndSaveForeshadowing →
 *   ログ出力 →
 *   結果返却
 */
export class ForeshadowingManager {
    private generator: ForeshadowingAutoGenerator;
    private advisor: ForeshadowingResolutionAdvisor;

    /**
   * ForeshadowingManagerクラスのコンストラクタ
   * 
   * 伏線生成コンポーネントと解決推奨コンポーネントを初期化します。
   * 
   * @constructor
   * 
   * @initialization
   * generatorとadvisorのプロパティを、それぞれ外部からインポートしたシングルトンインスタンスで初期化します。
   */
    constructor() {
        this.generator = foreshadowingGenerator;
        this.advisor = resolutionAdvisor;
    }

    /**
     * 伏線自動生成とストーリー処理を統合します
     * 
     * チャプター生成時に呼び出され、解決すべき伏線の提案と新しい伏線の生成を行います。
     * 
     * @async
     * @param {string} chapterContent - チャプターの内容テキスト
     * @param {number} chapterNumber - チャプター番号
     * @param {number} [generateCount=2] - 生成する伏線の数
     * @returns {Promise<{generatedCount: number; resolutionSuggestions: any[]}>} 
     *          生成された伏線の数と解決提案のリストを含むオブジェクト
     * 
     * @usage
     * const result = await foreshadowingManager.processChapterAndGenerateForeshadowing(
     *   chapterContent,
     *   5, // チャプター番号
     *   2  // 生成する伏線の数
     * );
     * console.log(`${result.generatedCount}件の伏線が生成され、${result.resolutionSuggestions.length}件の解決提案があります`);
     * 
     * @call-flow
     * 1. memoryManagerの初期化確認
     * 2. 解決すべき伏線の提案取得（advisor.suggestResolutions）
     * 3. 新しい伏線の生成と保存（generator.generateAndSaveForeshadowing）
     * 4. ログ出力
     * 5. 結果オブジェクトの返却
     * 
     * @helper-methods
     * - advisor.suggestResolutions - 解決提案の生成
     * - generator.generateAndSaveForeshadowing - 伏線の生成と保存
     * 
     * @external-dependencies
     * - memoryManager - 記憶管理システム
     * 
     * @monitoring
     * - ログレベル: INFO
     */
    async processChapterAndGenerateForeshadowing(
        chapterContent: string,
        chapterNumber: number,
        generateCount: number = 2
    ): Promise<{
        generatedCount: number;
        resolutionSuggestions: any[];
    }> {
        // memoryManagerの初期化
        if (!(await memoryManager.isInitialized())) {
            await memoryManager.initialize();
        }

        // 1. 解決すべき伏線の提案
        const resolutionSuggestions = await this.advisor.suggestResolutions(
            chapterContent,
            chapterNumber,
            3
        );

        // 2. 新しい伏線の生成
        const generatedCount = await this.generator.generateAndSaveForeshadowing(
            chapterContent,
            chapterNumber,
            generateCount
        );

        logger.info(`チャプター${chapterNumber}の伏線処理完了: ${generatedCount}件生成、${resolutionSuggestions.length}件の解決提案`);

        return {
            generatedCount,
            resolutionSuggestions
        };
    }

    /**
     * 伏線のバルク操作を実行します
     * 
     * 複数の伏線を一度に更新するためのメソッドです。
     * 各更新は個別に実行され、一部の更新に失敗しても残りの処理は継続されます。
     * 
     * @async
     * @param {Array<{id: string, updates: Partial<Foreshadowing>}>} updates - 
     *        更新する伏線のIDと更新内容の配列
     * @returns {Promise<number>} 正常に更新された伏線の数
     * 
     * @usage
     * const successCount = await foreshadowingManager.bulkUpdateForeshadowing([
     *   {
     *     id: "fs-1-abc123",
     *     updates: { 
     *       description: "更新された説明",
     *       resolved: true
     *     }
     *   },
     *   {
     *     id: "fs-2-def456",
     *     updates: {
     *       urgency: "high"
     *     }
     *   }
     * ]);
     * 
     * @call-flow
     * 1. memoryManagerの初期化確認
     * 2. 各更新項目に対して:
     *    - memoryManager.getLongTermMemory().updateForeshadowing の呼び出し
     *    - 成功時はカウンターをインクリメント
     *    - 失敗時はエラーをログに記録して次の項目へ
     * 3. 成功数の返却
     * 
     * @external-dependencies
     * - memoryManager.getLongTermMemory().updateForeshadowing - 伏線の更新処理
     * 
     * @error-handling
     * - 個別の更新エラーは記録されるが処理は継続される
     * - エラーメッセージはIDと共にログに記録される
     * 
     * @monitoring
     * - ログレベル: ERROR（エラー発生時のみ）
     */
    async bulkUpdateForeshadowing(
        updates: Array<{ id: string, updates: Partial<Foreshadowing> }>
    ): Promise<number> {
        // memoryManagerの初期化
        if (!(await memoryManager.isInitialized())) {
            await memoryManager.initialize();
        }

        let successCount = 0;
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

        return successCount;
    }

    /**
     * 伏線の整合性チェックを実行します
     * 
     * 伏線データの矛盾や問題を検出するためのメソッドです。
     * 特に解決済みフラグと解決チャプターの不一致、長期未解決の伏線、
     * 予定解決チャプターを過ぎている伏線などを検出します。
     * 
     * @async
     * @returns {Promise<{isConsistent: boolean; issues: Array<{id: string, issue: string, severity: 'HIGH' | 'MEDIUM' | 'LOW'}>}>}
     *          整合性チェック結果と問題リスト
     * 
     * @usage
     * const result = await foreshadowingManager.checkForeshadowingConsistency();
     * if (!result.isConsistent) {
     *   console.log(`${result.issues.length}件の問題が見つかりました:`);
     *   result.issues.forEach(issue => {
     *     console.log(`[${issue.severity}] ${issue.id}: ${issue.issue}`);
     *   });
     * }
     * 
     * @call-flow
     * 1. memoryManagerの初期化確認
     * 2. 全伏線データの取得
     * 3. 以下の整合性チェックを実行:
     *    - 解決済みだが解決チャプターがない伏線の検出
     *    - 過去に導入され長期間未解決の伏線の検出
     *    - 解決予定が過ぎているのに未解決の伏線の検出
     * 4. 検出された問題の整理と重要度の設定
     * 5. 結果オブジェクトの返却
     * 
     * @external-dependencies
     * - memoryManager.getLongTermMemory().getForeshadowing - 伏線データの取得
     * 
     * @return-structure
     * 返却されるオブジェクトは以下の構造:
     * - isConsistent: 問題がない場合はtrue、ある場合はfalse
     * - issues: 検出された問題の配列。各問題は以下を含む:
     *   - id: 問題のある伏線のID
     *   - issue: 問題の説明
     *   - severity: 問題の重要度（'HIGH'/'MEDIUM'/'LOW'）
     */
    async checkForeshadowingConsistency(currentChapter: number): Promise<{
        isConsistent: boolean;
        issues: Array<{ id: string, issue: string, severity: 'HIGH' | 'MEDIUM' | 'LOW' }>
    }> {
        // memoryManagerの初期化
        if (!(await memoryManager.isInitialized())) {
            await memoryManager.initialize();
        }

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

        return {
            isConsistent: issues.length === 0,
            issues
        };
    }
}

// シングルトンインスタンスをエクスポート
export const foreshadowingManager = new ForeshadowingManager();

// 個別コンポーネントもエクスポート
export { foreshadowingGenerator, resolutionAdvisor };

/**
 * 伏線管理システムのシングルトンインスタンス
 * 
 * ForeshadowingManagerクラスのシングルトンインスタンスです。
 * アプリケーション全体で一貫した伏線管理機能を提供します。
 * 
 * @type {ForeshadowingManager}
 * 
 * @singleton
 * アプリケーション全体で単一のインスタンスを共有するシングルトンとして実装されています。
 * これにより、複数の場所から同じインスタンスを使用できます。
 * 
 * @initialization
 * このモジュールのロード時に自動的に初期化されます。
 * 
 * @usage
 * // シングルトンインスタンスの使用方法
 * import { foreshadowingManager } from '@/lib/foreshadowing';
 * 
 * // 伏線の生成と解決提案
 * const result = await foreshadowingManager.processChapterAndGenerateForeshadowing(
 *   chapterContent,
 *   chapterNumber,
 *   2 // 生成する伏線の数
 * );
 * 
 * @example
 * // 伏線の整合性チェック
 * import { foreshadowingManager } from '@/lib/foreshadowing';
 * 
 * async function checkForeshadowingProblems() {
 *   const checkResult = await foreshadowingManager.checkForeshadowingConsistency();
 *   if (!checkResult.isConsistent) {
 *     return checkResult.issues;
 *   }
 *   return [];
 * }
 */

/**
 * 個別コンポーネントのエクスポート
 * 
 * foreshadowingGenerator - 伏線自動生成コンポーネントのシングルトンインスタンス
 * resolutionAdvisor - 伏線解決推奨コンポーネントのシングルトンインスタンス
 * 
 * これらのコンポーネントは通常はforeshadowingManagerを通して間接的に使用されますが、
 * 特定のケースでは個別に使用することもできます。
 * 
 * @usage
 * // 個別コンポーネントの直接使用
 * import { foreshadowingGenerator, resolutionAdvisor } from '@/lib/foreshadowing';
 * 
 * // 伏線自動生成のみを使用
 * const savedCount = await foreshadowingGenerator.generateAndSaveForeshadowing(
 *   chapterContent,
 *   chapterNumber,
 *   3 // 生成する伏線の数
 * );
 */