/**
 * @fileoverview Gemini AIアダプターのインターフェース定義
 * @description
 * 分析サービスからGemini APIへのアクセスを標準化するためのインターフェース定義。
 * このインターフェースを実装するクラスは、Gemini AIモデルとの一貫した通信を提供します。
 */

/**
 * GeminiAdapterインターフェース
 * 
 * Gemini AIモデルとの通信を行うアダプターのインターフェース定義
 */
export interface IGeminiAdapter {
    /**
     * テキスト生成リクエストを実行
     * 
     * @param prompt 生成プロンプト
     * @param options 生成オプション
     * @returns 生成されたテキスト
     */
    generateText(
      prompt: string,
      options?: {
        temperature?: number;
        targetLength?: number;
        purpose?: string;
        responseFormat?: string;
        useCache?: boolean;
        overrides?: any;
      }
    ): Promise<string>;
    
    /**
     * コンテンツ生成（高度な生成）
     * 
     * @param prompt 生成プロンプト
     * @param options 生成オプション
     * @returns 生成されたコンテンツ
     */
    generateContent(
      prompt: string,
      options?: {
        temperature?: number;
        targetLength?: number;
        purpose?: string;
        responseFormat?: string;
        useCache?: boolean;
        overrides?: any;
      }
    ): Promise<string>;
    
    /**
     * 分析プロンプトの生成
     * 
     * @param content 分析対象コンテンツ
     * @param analysisType 分析タイプ
     * @param context 追加コンテキスト
     * @returns 生成されたプロンプト
     */
    generateAnalysisPrompt(
      content: string,
      analysisType: string,
      context?: any
    ): string;
    
    /**
     * モデル設定の更新
     * 
     * @param settings 更新する設定
     */
    updateModelSettings(settings: {
      modelMap?: Record<string, string>;
      maxRetries?: number;
      defaultModel?: string;
    }): void;
    
    /**
     * テンプレートプロンプトの取得
     * 
     * @param templateName テンプレート名
     * @returns プロンプトテンプレート
     */
    getTemplatePrompt(templateName: string): string;
    
    /**
     * キャッシュの消去
     */
    clearCache(): void;
  }