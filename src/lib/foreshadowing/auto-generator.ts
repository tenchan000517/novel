// src/lib/foreshadowing/auto-generator.ts
/**
 * @fileoverview 伏線自動生成モジュール
 * @description
 * 物語創作支援システムにおける伏線の自動生成機能を提供するモジュールです。
 * AI (Gemini)を活用して物語のコンテキストから自然な伏線を生成し、
 * 検証し、メモリシステムに保存する機能を実装しています。
 * 
 * @role
 * - 物語コンテキストからの伏線の自動生成
 * - 生成された伏線の検証と整形
 * - 伏線の保存と重複管理
 * - AIを活用した創造的コンテンツ生成
 * 
 * @dependencies
 * - @/lib/generation/gemini-client - Gemini APIを使用したテキスト生成クライアント
 * - @/lib/memory/manager - メモリ管理システム（伏線の保存先）
 * - @/lib/utils/logger - ログ出力機能
 * - @/lib/utils/error-handler - エラーハンドリング機能
 * 
 * @types
 * - @/types/memory - Foreshadowing型など、メモリ関連の型定義
 * 
 * @flow
 * 1. 物語コンテキストとパラメータ受け取り
 * 2. プロンプト生成とAI (Gemini)による伏線生成
 * 3. レスポンスのパースとJSON形式の抽出
 * 4. 生成されたデータの検証と整形
 * 5. メモリシステムへの保存（重複チェック含む）
 */

import { GeminiClient } from '@/lib/generation/gemini-client';
import { memoryManager } from '@/lib/memory/manager';
import { Foreshadowing } from '@/types/memory';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';

/**
 * @class ForeshadowingAutoGenerator
 * @description
 * 物語の伏線を自動生成するクラス。
 * Google Gemini APIを使用して物語のコンテキストから自然な伏線を生成し、
 * 検証して、メモリシステムに保存する機能を提供します。
 * 
 * @role
 * - AI (Gemini)を活用した伏線の自動生成
 * - 生成された伏線データの検証と整形
 * - メモリシステムとの連携による伏線の保存
 * - 重複伏線の検出と管理
 * 
 * @used-by
 * - このクラスを使用するモジュールは明示的にコードから確認できません
 * 
 * @depends-on
 * - GeminiClient - AIテキスト生成サービス
 * - memoryManager - 階層的記憶管理システム
 * - logger - ログ出力サービス
 * - logError - エラーハンドリングユーティリティ
 * 
 * @lifecycle
 * 1. コンストラクタでGeminiClientの初期化
 * 2. generateForeshadowing()による伏線の生成
 * 3. validateGeneratedForeshadowing()による検証
 * 4. generateAndSaveForeshadowing()による保存
 * 
 * @example-flow
 * 呼び出し元 → generateAndSaveForeshadowing() → 
 *   memoryManager初期化確認 →
 *   generateForeshadowing() →
 *   Gemini APIによる伏線生成 →
 *   伏線検証と整形 →
 *   重複チェック →
 *   LongTermMemoryへの保存
 */
export class ForeshadowingAutoGenerator {
    private geminiClient: GeminiClient;

    /**
   * ForeshadowingAutoGeneratorクラスを初期化します
   * 
   * GeminiClientのインスタンスを作成します。
   * 
   * @constructor
   * 
   * @usage
   * // 基本的な初期化
   * const generator = new ForeshadowingAutoGenerator();
   * 
   * @call-flow
   * 1. GeminiClientのインスタンス作成
   * 
   * @initialization
   * このコンストラクタは特別なパラメータを必要としません。
   * GeminiClientを新規に作成します。
   */
    constructor() {
        this.geminiClient = new GeminiClient();
    }

    /**
     * コンテキストに基づいて伏線を自動生成します
     * 
     * 提供された物語コンテキストからAI（Gemini）を使用して伏線を生成し、
     * 検証した結果を返します。
     * 
     * @async
     * @param {string} context - 物語の現在のコンテキスト
     * @param {number} currentChapter - 現在のチャプター番号
     * @param {number} [count=3] - 生成する伏線の数
     * 
     * @returns {Promise<Foreshadowing[]>} 生成された伏線の配列
     * 
     * @throws {Error} 伏線生成に失敗した場合や、AIレスポンスのパースに失敗した場合
     * 
     * @usage
     * // 基本的な使用方法
     * const foreshadowings = await generator.generateForeshadowing(
     *   "物語のこれまでの内容...",
     *   5, // 現在のチャプター
     *   3  // 生成する伏線の数
     * );
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * 
     * @call-flow
     * 1. ログ出力（開始）
     * 2. 伏線生成用プロンプトの作成
     * 3. GeminiClientによるテキスト生成
     * 4. 正規表現によるJSON部分の抽出
     * 5. JSONパース
     * 6. 生成された伏線の検証
     * 7. ログ出力（完了）
     * 8. 検証済み伏線の返却
     * 
     * @external-dependencies
     * - GeminiClient - AIテキスト生成
     * 
     * @helper-methods
     * - validateGeneratedForeshadowing - 生成された伏線の検証
     * 
     * @error-handling
     * - AIレスポンスパース失敗時にはエラーログを出力し、エラーをスロー
     * - その他のエラーもログに記録し、再スロー
     * 
     * @performance-considerations
     * - コンテキストは4000文字に制限されており、長文の場合は切り詰められます
     * - 生成する伏線数が多いほど処理時間が長くなります
     */
    async generateForeshadowing(
        context: string,
        currentChapter: number,
        count: number = 3
    ): Promise<Foreshadowing[]> {
        try {
            logger.info(`伏線の自動生成開始: ${count}件`);

            // 伏線生成プロンプト
            const prompt = `
物語の現在のコンテキストに基づいて、今後の展開で回収可能な伏線を${count}個考えてください。
それぞれの伏線は今後の章で重要な役割を果たし、読者の興味を引く要素となるべきものです。

物語のコンテキスト:
${context.substring(0, 4000)} // 長すぎる場合は切り詰める

伏線の条件:
- 物語のテーマや登場キャラクターと関連性があること
- 将来的な展開を暗示する要素を含むこと
- 読者の興味を引き、回収時に驚きや納得感を与えられること
- 導入チャプターは現在またはこれからのチャプター（${currentChapter}以降）であること

以下のJSONフォーマットで出力してください:
[
  {
    "description": "伏線の簡潔な説明",
    "context": "伏線の詳細なコンテキスト（どのようにストーリーに導入され、どう展開する可能性があるか）",
    "chapter_introduced": 導入チャプター番号（${currentChapter}以降）,
    "potential_resolution": "予想される解決方法の説明",
    "urgency": "high"または"medium"または"low"（物語における重要度）,
    "plannedResolution": 解決予定のチャプター番号,
    "relatedCharacters": ["関連キャラクター1", "関連キャラクター2"]
  },
  ...
]
`;

            // Gemini APIを使用して伏線を生成
            const response = await this.geminiClient.generateText(prompt, {
                temperature: 0.7 // 創造性を高めるため温度を少し上げる
            });

            // レスポンスをパース
            let generatedForeshadowing: Foreshadowing[] = [];
            try {
                // JSON文字列を抽出
                const jsonRegex = /\[\s*\{[\s\S]*\}\s*\]/g;
                const jsonMatch = response.match(jsonRegex);

                if (jsonMatch) {
                    generatedForeshadowing = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('有効なJSON形式が見つかりませんでした');
                }
            } catch (parseError) {
                logError(parseError, { response }, 'AIレスポンスのパースに失敗しました');
                throw new Error('伏線生成結果のパースに失敗しました');
            }

            // 生成された伏線のバリデーション
            const validatedForeshadowing = this.validateGeneratedForeshadowing(
                generatedForeshadowing,
                currentChapter
            );

            logger.info(`伏線の自動生成完了: ${validatedForeshadowing.length}件`);
            return validatedForeshadowing;
        } catch (error) {
            logError(error, { context: context.substring(0, 100) }, '伏線の自動生成に失敗しました');
            throw error;
        }
    }

    /**
     * 生成された伏線をバリデーションします
     * 
     * AIによって生成された伏線データを検証し、必要な形式に整形します。
     * 必須フィールドの存在確認、値の検証、IDの生成などを行います。
     * 
     * @private
     * @param {any[]} foreshadowing - 生成された伏線データの配列
     * @param {number} currentChapter - 現在のチャプター番号
     * 
     * @returns {Foreshadowing[]} 検証・整形された伏線データの配列
     * 
     * @call-flow
     * 1. 必須フィールドを持つアイテムのみをフィルタリング
     * 2. 各アイテムの検証と整形
     *    - ユニークIDの生成
     *    - 各フィールドの検証と修正
     *    - オプションフィールドの追加
     * 3. 検証済みアイテムの配列を返却
     * 
     * @helper-methods
     * - validateUrgency - 優先度の検証
     */
    private validateGeneratedForeshadowing(
        foreshadowing: any[],
        currentChapter: number
    ): Foreshadowing[] {
        return foreshadowing
            .filter(item =>
                // 必須フィールドの存在確認
                item.description &&
                item.chapter_introduced &&
                typeof item.chapter_introduced === 'number'
            )
            .map(item => {
                // 基本的な検証と修正
                const validItem: Foreshadowing = {
                    id: `generated-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    description: item.description,
                    chapter_introduced: Math.max(currentChapter, item.chapter_introduced),
                    resolved: false,
                    urgency: this.validateUrgency(item.urgency),
                    createdTimestamp: new Date().toISOString(),
                    updatedTimestamp: new Date().toISOString()
                };

                // オプションフィールドを追加
                if (item.context) validItem.context = item.context;
                if (item.potential_resolution) validItem.potential_resolution = item.potential_resolution;
                if (item.plannedResolution && typeof item.plannedResolution === 'number') {
                    validItem.plannedResolution = Math.max(currentChapter + 1, item.plannedResolution);
                }
                if (item.relatedCharacters && Array.isArray(item.relatedCharacters)) {
                    validItem.relatedCharacters = item.relatedCharacters;
                }

                return validItem;
            });
    }

    /**
     * urgencyの値を検証します
     * 
     * 伏線の優先度（urgency）値を検証し、有効な値であるかを確認します。
     * 無効な場合はデフォルト値を返します。
     * 
     * @private
     * @param {any} urgency - 検証する優先度の値
     * 
     * @returns {string} 検証済みの優先度（'low', 'medium', 'high', 'critical'のいずれか）
     * 
     * @call-flow
     * 1. 有効な優先度値のリスト定義
     * 2. 入力値の型と値の検証
     * 3. 有効な場合はその値を返却、無効な場合はデフォルト値を返却
     */
    private validateUrgency(urgency: any): string {
        const validValues = ['low', 'medium', 'high', 'critical'];
        if (typeof urgency === 'string' && validValues.includes(urgency.toLowerCase())) {
            return urgency.toLowerCase();
        }
        return 'medium'; // デフォルト値
    }

    /**
     * 伏線を生成して保存します
     * 
     * 物語コンテキストから伏線を生成し、重複をチェックした上で
     * メモリシステムに保存します。
     * 
     * @async
     * @param {string} context - 物語の現在のコンテキスト
     * @param {number} currentChapter - 現在のチャプター番号
     * @param {number} [count=3] - 生成する伏線の数
     * 
     * @returns {Promise<number>} 保存された伏線の数
     * 
     * @throws {Error} 伏線の生成または保存に失敗した場合
     * 
     * @usage
     * // 基本的な使用方法
     * const savedCount = await generator.generateAndSaveForeshadowing(
     *   "物語のこれまでの内容...",
     *   5, // 現在のチャプター
     *   3  // 生成する伏線の数
     * );
     * console.log(`${savedCount}件の伏線を保存しました`);
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * 
     * @call-flow
     * 1. memoryManagerの初期化確認（必要に応じて初期化）
     * 2. generateForeshadowingによる伏線生成
     * 3. 生成された各伏線に対して:
     *    - 重複チェック
     *    - 重複がなければ保存
     *    - エラー発生時のログ記録（個別エラーは続行）
     * 4. 保存件数の返却
     * 
     * @external-dependencies
     * - memoryManager - 記憶管理システム
     * 
     * @helper-methods
     * - generateForeshadowing - 伏線の生成
     * 
     * @error-handling
     * - 個別の保存エラーはログに記録し、処理を続行
     * - 全体的なエラーはログに記録し、エラーをスロー
     */
    async generateAndSaveForeshadowing(
        context: string,
        currentChapter: number,
        count: number = 3
    ): Promise<number> {
        try {
            // memoryManagerを初期化
            if (!(await memoryManager.isInitialized())) {
                await memoryManager.initialize();
            }

            // 伏線を生成
            const generatedForeshadowing = await this.generateForeshadowing(
                context,
                currentChapter,
                count
            );

            // 生成された伏線を保存
            let savedCount = 0;
            for (const foreshadow of generatedForeshadowing) {
                try {
                    // 重複チェック
                    const isDuplicate = await memoryManager.getLongTermMemory().checkDuplicateForeshadowing(
                        foreshadow.description
                    );

                    if (!isDuplicate) {
                        await memoryManager.getLongTermMemory().addForeshadowing(foreshadow);
                        savedCount++;
                    } else {
                        logger.warn(`重複した伏線をスキップ: ${foreshadow.description}`);
                    }
                } catch (saveError) {
                    logError(saveError, { foreshadow }, '伏線の保存に失敗しました');
                    // 個別の失敗は続行する
                }
            }

            logger.info(`${savedCount}件の伏線を生成し保存しました`);
            return savedCount;
        } catch (error) {
            logError(error, {}, '伏線の生成と保存に失敗しました');
            throw error;
        }
    }
}

// シングルトンインスタンスをエクスポート
export const foreshadowingGenerator = new ForeshadowingAutoGenerator();

/**
 * 伏線自動生成機能を提供するシングルトンインスタンス
 * 
 * ForeshadowingAutoGeneratorクラスのシングルトンインスタンスです。
 * アプリケーション全体で一貫した伏線生成機能を提供します。
 * 
 * @type {ForeshadowingAutoGenerator}
 * 
 * @singleton
 * アプリケーション全体で単一のインスタンスを共有するシングルトンとして実装されています。
 * これにより、複数の場所から同じインスタンスを使用できます。
 * 
 * @initialization
 * エクスポート時に自動的に初期化されます。
 * 特別な初期化メソッドの呼び出しは必要ありません。
 * 
 * @usage
 * // シングルトンインスタンスの使用方法
 * import { foreshadowingGenerator } from '@/lib/foreshadowing/auto-generator';
 * 
 * // 伏線の生成と保存
 * const savedCount = await foreshadowingGenerator.generateAndSaveForeshadowing(
 *   context,
 *   currentChapter,
 *   count
 * );
 * 
 * @example
 * // 基本的な使用例
 * import { foreshadowingGenerator } from '@/lib/foreshadowing/auto-generator';
 * 
 * async function generateForeshadowingForChapter(chapter) {
 *   const context = chapter.content;
 *   const chapterNumber = chapter.chapterNumber;
 *   
 *   try {
 *     const savedCount = await foreshadowingGenerator.generateAndSaveForeshadowing(
 *       context,
 *       chapterNumber,
 *       3 // 3つの伏線を生成
 *     );
 *     
 *     console.log(`${savedCount}件の伏線を生成しました`);
 *     return savedCount;
 *   } catch (error) {
 *     console.error('伏線生成に失敗しました:', error);
 *     return 0;
 *   }
 * }
 */