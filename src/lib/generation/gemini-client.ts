// src\lib\generation\gemini-client.ts

/**
 * @fileoverview Gemini AIサービス用クライアントモジュール
 * @description
 * Google Gemini AIモデルとの通信を行い、テキスト生成機能を提供するクライアントクラスを実装します。
 * このモジュールはテキスト生成処理の中核となり、API呼び出し、エラーハンドリング、再試行ロジック、
 * トークン計算などを担当します。
 * 
 * @role
 * - テキスト生成サービスの基盤モジュール
 * - 外部AIサービス（Google Gemini API）とのインターフェース
 * - リトライとエラーハンドリングの実装
 * - トークン数計算と制限管理
 * - 用途別モデル選択機能の提供
 * 
 * @dependencies
 * - @google/generative-ai - Google Gemini APIとの通信ライブラリ
 * - @/lib/utils/logger - ログ出力ユーティリティ
 * - @/lib/utils/error-handler - エラーハンドリングユーティリティ
 * 
 * @types
 * - @/types/generation - 生成関連の型定義（GenerationOptions）
 * 
 * @flow
 * 1. 環境変数からの設定読み込みとクライアント初期化
 * 2. テキスト生成リクエストの受付と前処理
 * 3. APIへのリクエスト送信とレスポンス処理
 * 4. エラー発生時の再試行ロジック実行
 * 5. 生成結果の返却とログ記録
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { logger } from '@/lib/utils/logger';
import { GenerationError, ExternalServiceError } from '@/lib/utils/error-handler';
import { GenerationOptions } from '@/types/generation';
import { apiThrottler, RequestPriority } from '../utils/api-throttle';
import { requestQueue } from '../utils/request-queue';

/**
 * @class GeminiClient
 * @description
 * Gemini APIクライアント。テキスト生成の中核となるクラス。
 * Google Gemini APIとの通信を管理し、エラーハンドリング、再試行ロジック、トークン計算機能を提供します。
 * 
 * @role
 * - Google Gemini APIとの通信担当
 * - テキスト生成リクエストの管理と処理
 * - エラー発生時の再試行処理と適応的バックオフの実装
 * - トークン数の計算と推定
 * - 用途別モデル選択機能の提供
 * 
 * @depends-on
 * - GoogleGenerativeAI - Google提供のAIクライアントライブラリ
 * - logger - ログ出力機能
 * - GenerationError - 生成処理関連のエラークラス
 * - ExternalServiceError - 外部サービス関連のエラークラス
 * 
 * @lifecycle
 * 1. 環境変数からの設定読み込みとクライアント初期化
 * 2. テキスト生成機能の提供
 * 3. エラー発生時の再試行と適応的バックオフ
 * 4. APIキー検証機能の提供
 * 
 * @example-flow
 * アプリケーション → GeminiClient.generateText → 
 *   内部でのトークン計算 → 
 *   適切なモデル選択 →
 *   Gemini API呼び出し → 
 *   レスポンス処理/エラー処理 → 
 *   結果の返却
 */
export class GeminiClient {
    private client: GoogleGenerativeAI;
    private defaultModel: string;
    private modelMap: Record<string, string> = {}; // 用途別モデルマップ
    private apiUrl: string;
    private maxRetries: number;

    /**
     * GeminiClientのコンストラクタ
     * 
     * 環境変数から設定を読み込み、Google Gemini APIクライアントを初期化します。
     * API_KEY、モデル名、API URL、再試行回数などの設定を行います。
     * 
     * @constructor
     * 
     * @usage
     * // 初期化方法
     * const geminiClient = new GeminiClient();
     * 
     * @call-flow
     * 1. 環境変数からAPIキーの取得
     * 2. APIキー存在確認
     * 3. GoogleGenerativeAIクライアントの初期化
     * 4. モデル名、API URL、再試行回数の設定
     * 5. 初期化ログの出力
     * 
     * @initialization
     * 以下の環境変数を使用:
     * - GEMINI_API_KEY: 必須。APIキー
     * - GEMINI_MODEL: オプション。デフォルトは'gemini-2.0-flash-lite'
     * - GEMINI_API_URL: オプション。デフォルトはGoogleのエンドポイント
     * - GEMINI_MAX_RETRIES: オプション。デフォルトは3回
     * 
     * @error-handling
     * APIキーが環境変数に設定されていない場合、エラーをスローします。
     * エラーの前にログにエラー情報を記録します。
     * 
     * @throws {Error} GEMINI_API_KEYが環境変数に設定されていない場合
     */
    constructor() {
        // 環境変数からの設定取得
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            logger.error('GEMINI_API_KEY is not set in environment variables');
            throw new Error('GEMINI_API_KEY is required');
        }

        this.client = new GoogleGenerativeAI(apiKey);
        this.defaultModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite';
        this.apiUrl = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/';
        this.maxRetries = parseInt(process.env.GEMINI_MAX_RETRIES || '3', 10);

        logger.info('GeminiClient initialized', {
            defaultModel: this.defaultModel,
            maxRetries: this.maxRetries
        });
    }

    /**
     * 用途別モデルマップを設定します
     * 
     * 用途（purpose）に応じた適切なモデルを選択するためのマッピングを設定します。
     * 
     * @param {Record<string, string>} modelMap 用途とモデル名のマッピング
     * 
     * @usage
     * // 用途別モデルの設定
     * geminiClient.setModelMap({
     *   default: 'gemini-2.0-flash-lite',
     *   summary: 'gemini-2.0-pro',
     *   content: 'gemini-2.0-flash',
     *   analysis: 'gemini-2.0-pro'
     * });
     */
    public setModelMap(modelMap: Record<string, string>): void {
        this.modelMap = { ...modelMap };
        logger.info('Model map updated', { modelMap });
    }

    /**
     * 用途に基づいてモデルを選択します
     * 
     * 指定された用途に最適なモデルを選択します。明示的にモデルが指定されている場合は
     * それを優先し、それ以外の場合は用途に応じたモデル、またはデフォルトモデルを返します。
     * 
     * @private
     * @param {string} [purpose='default'] 使用目的
     * @param {string} [explicitModel] 明示的に指定されたモデル
     * @returns {string} 使用するモデル名
     * 
     * @call-flow
     * 1. 明示的なモデル指定を確認
     * 2. 用途に対応するモデルを確認
     * 3. デフォルトモデルをフォールバックとして使用
     * 
     * @error-handling
     * 指定された用途に対応するモデルがない場合、defaultモデルまたはインスタンス初期化時のデフォルトモデルを使用します。
     */
    private getModelForPurpose(purpose: string = 'default', explicitModel?: string): string {
        // 明示的に指定されたモデルを優先
        if (explicitModel) return explicitModel;

        // 用途に合わせたモデルを返す
        return this.modelMap[purpose] || this.modelMap['default'] || this.defaultModel;
    }

    /**
     * テキスト生成を行います
     * 
     * 指定されたプロンプトとオプションに基づいてGemini APIを呼び出し、テキストを生成します。
     * エラー発生時は設定された回数まで再試行し、指数バックオフ戦略を使用します。
     * 
     * @async
     * @param {string} prompt 生成プロンプト
     * @param {GenerationOptions & { purpose?: string }} [options] 生成オプション
     * @returns {Promise<string>} 生成されたテキスト
     * 
     * @throws {GenerationError} 空のプロンプトが提供された場合、またはAPIが空の応答を返した場合
     * @throws {ExternalServiceError} すべての再試行が失敗した場合
     * 
     * @usage
     * // 基本的な使用方法
     * const text = await geminiClient.generateText("こんにちは、世界について教えてください");
     * 
     * // オプション付きの使用方法
     * const text = await geminiClient.generateText("詳細な分析をしてください", {
     *   temperature: 0.5,
     *   targetLength: 5000,
     *   frequencyPenalty: 0.5,
     *   presencePenalty: 0.2,
     *   purpose: "analysis",
     *   overrides: {
     *     topK: 30,
     *     topP: 0.9
     *   }
     * });
     * 
     * @call-context
     * - 同期/非同期: 非同期メソッド（await必須）
     * - 前提条件: クライアントが正しく初期化されていること、有効なAPIキーが設定されていること
     * 
     * @call-flow
     * 1. プロンプトの検証
     * 2. 生成オプションの準備
     * 3. 用途に基づいたモデルの選択
     * 4. 再試行ループ開始
     * 5. Gemini APIの呼び出し
     * 6. レスポンスの検証
     * 7. エラー発生時の再試行処理
     * 8. 生成結果の返却
     * 
     * @external-dependencies
     * - Google Gemini API - テキスト生成処理
     * 
     * @helper-methods
     * - calculateTokens - 出力トークン数の計算
     * - estimateTokenCount - トークン数の推定
     * - calculateBackoff - バックオフ時間の計算
     * - isNonRetryableError - 再試行不可能なエラーの判定
     * - sleep - 指定時間の待機
     * 
     * @error-handling
     * - 空プロンプトはGenerationErrorとして即時拒否
     * - API呼び出しエラーは最大maxRetries回まで再試行
     * - 再試行不可能なエラー（認証エラー、コンテンツポリシー違反など）は即時失敗
     * - すべての再試行が失敗した場合はExternalServiceErrorをスロー
     * 
     * @performance-considerations
     * - 指数バックオフとジッターにより、同時リクエストの集中を避ける設計
     * - 日本語テキストは英語よりもトークン消費が多い傾向があるため、係数1.8で調整
     * 
     * @monitoring
     * - ログレベル: INFO/DEBUG/ERROR
     * - メトリクス: プロンプトトークン数、レスポンストークン数、生成時間、試行回数
     */
    async generateText(prompt: string, options?: GenerationOptions & { purpose?: string }): Promise<string> {
        if (!prompt || prompt.trim() === '') {
            throw new GenerationError('Empty prompt provided', 'EMPTY_PROMPT');
        }

        logger.debug('Received generation options', {
            options: {
                temperature: options?.temperature,
                targetLength: options?.targetLength,
                frequencyPenalty: options?.frequencyPenalty,
                presencePenalty: options?.presencePenalty,
                model: options?.model,
                purpose: options?.purpose,
                overrides: options?.overrides
            }
        });

        // 生成オプションの準備
        const genOptions = {
            temperature: options?.temperature || 0.7,
            maxOutputTokens: this.calculateTokens(options?.targetLength),
            topK: options?.overrides?.topK || 40,
            topP: options?.overrides?.topP || 0.95,
            // 頻度ペナルティと存在ペナルティを有効化
            frequencyPenalty: options?.frequencyPenalty,
            presencePenalty: options?.presencePenalty,
        };

        // ロギング追加: 使用する生成オプションの詳細をログ出力
        logger.debug('Using generation options', { genOptions });

        // 用途に基づいてモデルを選択
        const selectedModel = this.getModelForPurpose(
            options?.purpose,
            options?.model
        );

        // 優先度を決定
        const priority = this.determineRequestPriority(options?.purpose);

        // リトライ情報を設定
        let attemptCount = 0;
        let lastError: Error | null = null;
        const maxAttempts = this.maxRetries;


        // ロギング追加: モデル選択プロセスの詳細をログ出力
        logger.info('Model selection details', {
            requestedPurpose: options?.purpose,
            explicitModel: options?.model,
            selectedModel,
            availableModels: this.modelMap,
            defaultModel: this.defaultModel
        });

        logger.debug('Generating text with options', {
            modelName: selectedModel,
            promptLength: prompt.length,
            options: genOptions,
            purpose: options?.purpose
        });

        // キューイングとリトライを組み合わせた実行戦略
        while (attemptCount < maxAttempts) {
            try {
                attemptCount++;

                // リクエストをキューに入れる（高優先度の場合はキューをスキップ）
                if (priority === RequestPriority.HIGH) {
                    // 本文生成など重要なリクエストは直接実行
                    return await apiThrottler.throttledRequest(
                        () => this.executeGeminiRequest(selectedModel, prompt, genOptions),
                        priority
                    );
                } else {
                    // それ以外はキューを使用
                    return await requestQueue.enqueue(
                        () => apiThrottler.throttledRequest(
                            () => this.executeGeminiRequest(selectedModel, prompt, genOptions),
                            priority
                        ),
                        priority
                    );
                }
            } catch (error) {
                lastError = error as Error;
                const errorMessage = error instanceof Error ? error.message : String(error);

                logger.error(`Gemini API error (attempt ${attemptCount}/${maxAttempts})`, {
                    error: errorMessage,
                    attempt: attemptCount,
                    maxRetries: maxAttempts
                });

                // 再試行不可能なエラーならループを抜ける
                if (this.isNonRetryableError(error)) {
                    logger.warn('Detected non-retryable error, aborting retry loop');
                    break;
                }

                // 最終試行でなければバックオフして待機
                if (attemptCount < maxAttempts) {
                    const delay = this.calculateBackoff(attemptCount);
                    logger.info(`Retrying in ${delay}ms (attempt ${attemptCount}/${maxAttempts})`);
                    await this.sleep(delay);
                }
            }
        }

        // すべての再試行が失敗した場合
        const errorMessage = lastError ? lastError.message : 'Unknown error occurred';
        logger.error('All text generation attempts failed', {
            attempts: attemptCount,
            lastError: errorMessage
        });

        throw new ExternalServiceError(
            'Gemini API',
            `Failed to generate content after ${attemptCount} attempts: ${errorMessage}`,
            { lastError: lastError }
        );
    }

    /**
     * Gemini APIへの実際のリクエスト実行を行う内部メソッド
     * generateTextから分離して再利用性を高める
     * @private
     */
    private async executeGeminiRequest(modelName: string, prompt: string, genOptions: any): Promise<string> {
        const startTime = Date.now();

        logger.info(`Starting Gemini API request`, {
            timestamp: new Date().toISOString(),
            promptLength: prompt.length,
            modelName
        });

        // モデルの取得
        logger.debug(`Initializing model ${modelName} for generation`, {
            timestamp: new Date().toISOString(),
            modelConfig: JSON.stringify(genOptions)
        });

        const model = this.client.getGenerativeModel({
            model: modelName,
            generationConfig: genOptions,
        });

        logger.info(`Model initialized, preparing to send request to Gemini API`, {
            timestamp: new Date().toISOString(),
            modelName
        });

        // API呼び出し
        logger.info(`Sending request to Gemini API`, {
            timestamp: new Date().toISOString(),
            callStartTime: new Date().toISOString()
        });

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        logger.info(`Received initial response from Gemini API`, {
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime
        });

        const response = await result.response;
        const responseText = response.text();

        // 生成時間の記録
        const generationTime = Date.now() - startTime;
        logger.info('Text generation completed successfully', {
            timestamp: new Date().toISOString(),
            modelName,
            promptTokens: this.estimateTokenCount(prompt),
            responseTokens: this.estimateTokenCount(responseText),
            generationTimeMs: generationTime,
            responseLength: responseText.length
        });

        // 結果の検証
        if (!responseText || responseText.trim() === '') {
            logger.warn(`Empty response received from Gemini API`);
            throw new GenerationError('Empty response from API', 'EMPTY_RESPONSE');
        }

        return responseText;
    }

    /**
     * リクエスト優先度を決定するヘルパーメソッド
     * @private
     */
    private determineRequestPriority(purpose?: string): RequestPriority {
        switch (purpose) {
            case 'content':  // 本文生成は最優先
                return RequestPriority.HIGH;
            case 'analysis': // 分析は中優先度
            case 'recommendation':
                return RequestPriority.MEDIUM;
            case 'summary':  // 要約や補助機能は低優先度
            default:
                return RequestPriority.LOW;
        }
    }


    /**
     * APIキーの有効性を検証します
     * 
     * テスト用のシンプルなリクエストを送信し、APIキーが有効かどうかを確認します。
     * 
     * @async
     * @returns {Promise<boolean>} APIキーが有効な場合はtrue、無効な場合はfalse
     * 
     * @usage
     * // APIキーの検証
     * const isValid = await geminiClient.validateApiKey();
     * if (isValid) {
     *   console.log("APIキーは有効です");
     * } else {
     *   console.log("APIキーは無効です");
     * }
     * 
     * @call-flow
     * 1. ログ出力（検証開始）
     * 2. テスト用のモデル取得
     * 3. 単純なコンテンツ生成リクエスト
     * 4. 結果に基づいて有効性を返却
     * 5. エラー発生時はfalseを返却
     * 
     * @error-handling
     * エラーが発生した場合はキャッチしてログ出力し、falseを返します。
     * エラーはスローせず、戻り値で結果を通知します。
     * 
     * @monitoring
     * - ログレベル: DEBUG/INFO/WARN
     */
    async validateApiKey(): Promise<boolean> {
        try {
            logger.debug('Validating Gemini API key');
            // デフォルトモデルを使用
            const model = this.client.getGenerativeModel({ model: this.defaultModel });
            const result = await model.generateContent('test');
            logger.info('API key validation successful');
            return true;
        } catch (error) {
            logger.warn('API key validation failed', {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * モデル情報を取得します
     * 
     * 現在使用しているモデル、API URL、再試行設定などの情報を返します。
     * 
     * @returns {Object} モデル情報
     * @returns {string} defaultModel - デフォルトモデル名
     * @returns {Object} modelMap - 用途別モデルマップ
     * @returns {string} apiUrl - API URL
     * @returns {number} maxRetries - 最大再試行回数
     * 
     * @usage
     * // モデル情報の取得
     * const info = geminiClient.getModelInfo();
     * console.log(`デフォルトモデル: ${info.defaultModel}`);
     * console.log(`最大再試行回数: ${info.maxRetries}`);
     * 
     * @call-flow
     * インスタンス変数を単純にオブジェクトとして返します。
     */
    getModelInfo(): { defaultModel: string; modelMap: Record<string, string>; apiUrl: string; maxRetries: number } {
        return {
            defaultModel: this.defaultModel,
            modelMap: { ...this.modelMap },
            apiUrl: this.apiUrl,
            maxRetries: this.maxRetries
        };
    }

    /**
     * 目標文字数からトークン数を計算します
     * 
     * 日本語テキストのトークン消費特性を考慮して、目標文字数から必要なトークン数を推定します。
     * 
     * @private
     * @param {number} [targetLength] 目標文字数
     * @returns {number} 推定トークン数
     * 
     * @call-flow
     * 1. 日本語の変換率（1.8倍）を適用
     * 2. デフォルト値または指定値を使用
     * 3. トークン数を計算し、上限内に収まるよう調整
     * 
     * @performance-considerations
     * 日本語は英語よりもトークン消費が多い傾向があるため、係数1.8で調整しています。
     * 最大値はGeminiの制限である8192トークンを超えないように設定されています。
     */
    private calculateTokens(targetLength?: number): number {
        // 日本語の場合の変換率設定
        // 日本語は英語よりもトークン消費が多い傾向にある
        const japaneseCharToTokenRatio = 1.8; // 一般的に日本語の文字は英語より多くのトークンを消費する

        const defaultTarget = 8000; // デフォルト目標文字数
        const length = targetLength || defaultTarget;

        // 余裕を持って計算
        const estimatedTokens = Math.ceil(length * japaneseCharToTokenRatio);

        // 出力制限以下に収まるように最大値を設定
        const maxAllowedTokens = 8192; // Geminiの制限
        return Math.min(estimatedTokens, maxAllowedTokens);
    }

    /**
     * テキストのトークン数を推定します
     * 
     * 日本語と英語が混在したテキストのトークン数を文字の種類に基づいて推定します。
     * 
     * @private
     * @param {string} text 対象テキスト
     * @returns {number} 推定トークン数
     * 
     * @call-flow
     * 1. テキストが存在しない場合は0を返す
     * 2. 日本語の文字を正規表現で抽出
     * 3. 日本語以外の文字を抽出
     * 4. それぞれのトークン消費率で計算（日本語:1.8、非日本語:0.25）
     * 5. 合計値を切り上げて返却
     * 
     * @performance-considerations
     * 簡易的な推定であり、実際のトークナイザーとは異なる場合があります。
     * 日本語の文字は英語と比較して約1.8倍のトークンを消費すると仮定しています。
     */
    private estimateTokenCount(text: string): number {
        if (!text) return 0;

        // 日本語と英語が混ざった文章のトークン数を推定
        // 簡易的な推定であり、実際のトークナイザーとは異なる場合がある
        const japanesePattern = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/g;
        const japaneseChars = text.match(japanesePattern) || [];
        const nonJapaneseChars = text.replace(japanesePattern, '');

        // 日本語文字は約1.8トークン/文字、非日本語は約0.25トークン/文字と仮定
        const japaneseTokens = japaneseChars.length * 1.8;
        const nonJapaneseTokens = nonJapaneseChars.length * 0.25;

        return Math.ceil(japaneseTokens + nonJapaneseTokens);
    }

    /**
     * 再試行間隔を計算します（指数バックオフ）
     * 
     * 試行回数に基づいて指数関数的に増加する待機時間を計算し、ジッターを追加します。
     * 
     * @private
     * @param {number} attempt 試行回数
     * @returns {number} 待機時間(ms)
     * 
     * @call-flow
     * 1. 基本遅延（200ms）から開始
     * 2. 試行回数に基づいて指数関数的に増加（2倍ずつ）
     * 3. 最大遅延（5000ms）を超えないように制限
     * 4. ジッターを追加（0-100msのランダム値）
     * 
     * @performance-considerations
     * 指数バックオフは再試行時のサービス負荷を分散させるための標準的な方法です。
     * ジッターの追加により、同時リクエストによるサーバー負荷の集中を回避します。
     */
    private calculateBackoff(attempt: number): number {
        // 指数バックオフ: 200ms, 400ms, 800ms, ...
        const baseDelay = 200;
        const maxDelay = 5000; // 最大5秒
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);

        // ジッターを追加して同時リクエストの集中を避ける
        return delay + Math.floor(Math.random() * 100);
    }

    /**
     * 再試行すべきでないエラーを判定します
     * 
     * エラーメッセージに基づいて、再試行が無意味なエラーかどうかを判定します。
     * 
     * @private
     * @param {unknown} error エラーオブジェクト
     * @returns {boolean} 再試行すべきでない場合はtrue
     * 
     * @call-flow
     * 1. エラーがErrorインスタンスでない場合はfalseを返す
     * 2. 再試行不可能なエラーメッセージのリストと照合
     * 3. 一致するメッセージがある場合はtrueを返す
     * 
     * @error-handling
     * API認証エラー、無効なプロンプト、コンテンツポリシー違反などは再試行しても
     * 解決しないため、即時に失敗として処理します。
     */
    private isNonRetryableError(error: unknown): boolean {
        if (!(error instanceof Error)) return false;

        // API認証エラー、無効なプロンプト、コンテンツポリシー違反など
        const nonRetryableErrors = [
            'API key not valid',
            'invalid_api_key',
            'content_policy_violation',
            'invalid_argument',
            'permission_denied',
            'quota_exceeded' // レート制限はバックオフではなく別のハンドリングが必要
        ];

        return nonRetryableErrors.some(errMsg =>
            error.message.toLowerCase().includes(errMsg.toLowerCase())
        );
    }

    /**
     * 指定時間の待機を行います
     * 
     * 非同期処理を一定時間停止するためのユーティリティメソッドです。
     * 
     * @private
     * @param {number} ms 待機時間(ms)
     * @returns {Promise<void>} Promiseオブジェクト
     * 
     * @usage
     * // 内部的な使用例
     * await this.sleep(1000); // 1秒待機
     * 
     * @call-flow
     * setTimeout関数をPromiseでラップして、awaitで待機できるようにします。
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Gemini APIクライアントクラス
 * 
 * テキスト生成機能を提供するGemini APIとのインターフェースクラスです。
 * 環境変数で設定されたAPIキーを使用してGemini APIにアクセスし、
 * テキスト生成、エラーハンドリング、再試行処理を担当します。
 * また、用途に応じた適切なモデル選択機能をサポートします。
 * 
 * @type {Class}
 * 
 * @initialization
 * 環境変数からAPIキーとモデル設定を読み込んで初期化されます。
 * 
 * @usage
 * // クライアントの初期化と使用
 * import { GeminiClient } from '@/lib/generation/gemini-client';
 * 
 * const client = new GeminiClient();
 * 
 * // 用途別モデルマップの設定
 * client.setModelMap({
 *   default: 'gemini-2.0-flash-lite',
 *   summary: 'gemini-2.0-pro',
 *   content: 'gemini-2.0-flash'
 * });
 * 
 * // 用途を指定してテキスト生成
 * const generatedText = await client.generateText("プロンプト", {
 *   temperature: 0.7,
 *   targetLength: 5000,
 *   purpose: "content" // 用途を指定
 * });
 * 
 * @example
 * // 基本的な使用例
 * import { GeminiClient } from '@/lib/generation/gemini-client';
 * 
 * async function generateStory() {
 *   const client = new GeminiClient();
 *   const isValid = await client.validateApiKey();
 *   
 *   if (!isValid) {
 *     console.error("APIキーが無効です");
 *     return;
 *   }
 *   
 *   // 用途別モデルの設定
 *   client.setModelMap({
 *     default: 'gemini-2.0-flash-lite',
 *     summary: 'gemini-2.0-pro',
 *     content: 'gemini-2.0-flash',
 *     analysis: 'gemini-2.0-pro'
 *   });
 *   
 *   const prompt = "短い物語を書いてください。テーマは「友情」です。";
 *   try {
 *     // コンテンツ生成用途を指定
 *     const story = await client.generateText(prompt, {
 *       temperature: 0.8,
 *       targetLength: 3000,
 *       purpose: "content",
 *       frequencyPenalty: 0.6,
 *       presencePenalty: 0.3
 *     });
 *     return story;
 *   } catch (error) {
 *     console.error("生成エラー:", error.message);
 *     return null;
 *   }
 * }
 */