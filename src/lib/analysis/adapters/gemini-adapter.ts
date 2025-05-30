/**
 * @fileoverview Gemini AIモデルとの一貫したインターフェースを提供するアダプタークラス
 * @description
 * 分析サービスからGemini APIへのアクセスを標準化し、エラーハンドリング、キャッシング、
 * プロンプト最適化などの機能を提供します。
 */

import { logger } from '@/lib/utils/logger';
import { IGeminiAdapter } from './interfaces';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { GenerationError, ExternalServiceError } from '@/lib/utils/error-handler';

/**
 * @class GeminiAdapter
 * @description Gemini AIモデルとの一貫したインターフェースを提供するアダプタークラス
 * 分析サービスからGemini APIへのアクセスを標準化し、エラーハンドリングやリトライロジックを提供します。
 * 
 * @implements IGeminiAdapter
 */
export class GeminiAdapter implements IGeminiAdapter {
  private client: GeminiClient;
  private cacheStore: Map<string, { response: string; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 3600000; // 1時間キャッシュ有効（ミリ秒）
  
  /**
   * GeminiAdapterのコンストラクタ
   * 
   * @param {GeminiClient} [client] - Gemini API通信用クライアント（省略時は新規生成）
   */
  constructor(client?: GeminiClient) {
    this.client = client || new GeminiClient();
    logger.info('GeminiAdapter initialized');
  }
  
  /**
   * テキスト生成リクエストを実行
   * 
   * プロンプトに基づいてテキストを生成します。このメソッドは基本的なテキスト生成に適しています。
   * 
   * @param {string} prompt - 生成プロンプト
   * @param {object} [options] - 生成オプション
   * @param {number} [options.temperature] - 生成の多様性（0-1）
   * @param {number} [options.targetLength] - 目標文字数
   * @param {string} [options.purpose] - 生成目的（analysis/creation/summarization）
   * @param {string} [options.responseFormat] - 希望する応答形式（json/text）
   * @param {boolean} [options.useCache] - キャッシュを使用するか（デフォルト: true）
   * @returns {Promise<string>} 生成されたテキスト
   * @throws {GenerationError} 生成エラー発生時
   */
  async generateText(
    prompt: string,
    options?: {
      temperature?: number;
      targetLength?: number;
      purpose?: string;
      responseFormat?: string;
      useCache?: boolean;
      overrides?: any;
    }
  ): Promise<string> {
    const useCache = options?.useCache !== false;
    
    // キャッシュキーの生成（プロンプトとオプションのハッシュ）
    const cacheKey = useCache ? this.createCacheKey(prompt, options) : '';
    
    // キャッシュチェック
    if (useCache && this.cacheStore.has(cacheKey)) {
      const cachedData = this.cacheStore.get(cacheKey)!;
      
      // キャッシュが有効期限内かチェック
      if (Date.now() - cachedData.timestamp < this.CACHE_TTL) {
        logger.debug('Using cached response for prompt', {
          promptLength: prompt.length,
          cachedAt: new Date(cachedData.timestamp).toISOString()
        });
        return cachedData.response;
      }
    }
    
    // JSONレスポース用のプロンプト拡張
    let finalPrompt = prompt;
    if (options?.responseFormat === 'json') {
      finalPrompt = this.enhancePromptForJsonResponse(prompt);
    }
    
    // Gemini APIオプションを準備
    const apiOptions = {
      temperature: options?.temperature,
      targetLength: options?.targetLength,
      purpose: options?.purpose,
      overrides: options?.overrides
    };
    
    try {
      logger.debug('Sending request to Gemini API', {
        promptLength: finalPrompt.length,
        purpose: options?.purpose || 'default',
        temperature: options?.temperature
      });
      
      // スロットリング付きでAPIリクエスト
      const response = await apiThrottler.throttledRequest(() => 
        this.client.generateText(finalPrompt, apiOptions)
      );
      
      // レスポース後処理（必要に応じて）
      const processedResponse = this.postProcessResponse(
        response, 
        options?.responseFormat
      );
      
      // 結果をキャッシュ（キャッシュが有効な場合）
      if (useCache) {
        this.cacheStore.set(cacheKey, {
          response: processedResponse,
          timestamp: Date.now()
        });
        
        // キャッシュサイズの制限（100件まで）
        if (this.cacheStore.size > 100) {
          this.pruneCache();
        }
      }
      
      return processedResponse;
    } catch (error) {
      // エラーログと変換
      logger.error('GeminiAdapter generateText error', {
        error: error instanceof Error ? error.message : String(error),
        promptLength: prompt.length
      });
      
      if (error instanceof GenerationError || error instanceof ExternalServiceError) {
        throw error;
      }
      
      throw new GenerationError(
        'Failed to generate text',
        error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      );
    }
  }
  
  /**
   * コンテンツ生成（高度な生成）
   * 
   * 複雑なプロンプトや特殊な生成要件に対応する高度な生成メソッドです。
   * 
   * @param {string} prompt - 生成プロンプト
   * @param {object} [options] - 生成オプション（generateTextと同様）
   * @returns {Promise<string>} 生成されたコンテンツ
   */
  async generateContent(
    prompt: string,
    options?: {
      temperature?: number;
      targetLength?: number;
      purpose?: string;
      responseFormat?: string;
      useCache?: boolean;
      overrides?: any;
    }
  ): Promise<string> {
    // 基本的にはgenerateTextと同じだが、将来的に拡張可能にする
    return this.generateText(prompt, options);
  }
  
  /**
   * 分析プロンプトの生成
   * 
   * 特定のコンテンツを分析するためのプロンプトを生成します。
   * 
   * @param {string} content - 分析対象コンテンツ
   * @param {string} analysisType - 分析タイプ
   * @param {object} [context] - 追加コンテキスト
   * @returns {string} 生成されたプロンプト
   */
  generateAnalysisPrompt(
    content: string,
    analysisType: string,
    context?: any
  ): string {
    // コンテンツの長さを制限（APIの上限を考慮）
    const truncatedContent = this.truncateContent(content, 15000);
    
    // 分析タイプに基づくプロンプトテンプレートの選択
    let promptTemplate = '';
    
    switch (analysisType.toLowerCase()) {
      case 'character':
        promptTemplate = this.getCharacterAnalysisTemplate();
        break;
      case 'theme':
        promptTemplate = this.getThemeAnalysisTemplate();
        break;
      case 'structure':
        promptTemplate = this.getStructureAnalysisTemplate();
        break;
      case 'quality':
        promptTemplate = this.getQualityAnalysisTemplate();
        break;
      case 'foreshadowing':
        promptTemplate = this.getForeshadowingAnalysisTemplate();
        break;
      default:
        promptTemplate = this.getGeneralAnalysisTemplate();
    }
    
    // テンプレート変数の置換
    let prompt = promptTemplate
      .replace('{{content}}', truncatedContent)
      .replace('{{analysisType}}', analysisType);
    
    // コンテキスト情報があれば追加
    if (context) {
      prompt = prompt.replace(
        '{{context}}', 
        this.formatContextForPrompt(context)
      );
    } else {
      prompt = prompt.replace('{{context}}', '');
    }
    
    return prompt;
  }
  
  /**
   * モデル設定の更新
   * 
   * 使用するモデルや設定を更新します。
   * 
   * @param {object} settings - 更新する設定
   */
  updateModelSettings(settings: {
    modelMap?: Record<string, string>;
    maxRetries?: number;
    defaultModel?: string;
  }): void {
    if (settings.modelMap) {
      this.client.setModelMap(settings.modelMap);
    }
    
    // 他の設定更新（実装はGeminiClientの機能に依存）
    logger.info('Updated GeminiAdapter model settings', { settings });
  }
  
  /**
   * テンプレートプロンプトの取得
   * 
   * 特定のユースケースに最適化されたプロンプトテンプレートを取得します。
   * 
   * @param {string} templateName - テンプレート名
   * @returns {string} プロンプトテンプレート
   */
  getTemplatePrompt(templateName: string): string {
    // テンプレート名に基づいてプロンプトを返す
    switch (templateName) {
      case 'character_analysis':
        return this.getCharacterAnalysisTemplate();
      case 'theme_analysis':
        return this.getThemeAnalysisTemplate();
      case 'quality_metrics':
        return this.getQualityAnalysisTemplate();
      case 'structure_analysis':
        return this.getStructureAnalysisTemplate();
      case 'foreshadowing_analysis':
        return this.getForeshadowingAnalysisTemplate();
      case 'json_output':
        return this.getJsonOutputTemplate();
      default:
        return '{{content}}';
    }
  }
  
  /**
   * キャッシュの消去
   * 
   * アダプターのキャッシュを消去します。
   */
  clearCache(): void {
    this.cacheStore.clear();
    logger.info('GeminiAdapter cache cleared');
  }
  
  // ===== プライベートヘルパーメソッド =====
  
  /**
   * キャッシュキーの作成
   * 
   * @private
   * @param {string} prompt - プロンプト
   * @param {object} [options] - オプション
   * @returns {string} キャッシュキー
   */
  private createCacheKey(prompt: string, options?: any): string {
    // シンプルなハッシュ関数
    const hash = (str: string): number => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 32bitに変換
      }
      return Math.abs(hash);
    };
    
    // プロンプトとオプションを組み合わせたキー
    const optionsStr = options ? JSON.stringify({
      temperature: options.temperature,
      targetLength: options.targetLength,
      purpose: options.purpose,
      responseFormat: options.responseFormat
    }) : '';
    
    // プロンプトは長すぎる場合があるので最初と最後の部分だけ使用
    const promptStart = prompt.substring(0, 100);
    const promptEnd = prompt.length > 200 ? prompt.substring(prompt.length - 100) : '';
    const combinedStr = promptStart + promptEnd + optionsStr;
    
    return `gemini-${hash(combinedStr)}`;
  }
  
  /**
   * コンテンツの切り詰め
   * 
   * @private
   * @param {string} content - コンテンツ
   * @param {number} maxLength - 最大長
   * @returns {string} 切り詰められたコンテンツ
   */
  private truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content;
    }
    
    return content.substring(0, maxLength - 100) + 
      '\n...[コンテンツが長いため省略されました]...\n' + 
      content.substring(content.length - 100);
  }
  
  /**
   * プロンプトをJSON応答用に拡張
   * 
   * @private
   * @param {string} prompt - 元のプロンプト
   * @returns {string} 拡張されたプロンプト
   */
  private enhancePromptForJsonResponse(prompt: string): string {
    // すでにJSON指示が含まれているか確認
    if (prompt.includes('JSON') || prompt.includes('json')) {
      // JSONコードブロックなしの指示を追加
      if (!prompt.includes('コードブロックは使用せず')) {
        return `${prompt}\n\n出力は有効なJSONのみとしてください。マークダウンの\`\`\`jsonコードブロックは使用せず、生のJSONのみ返してください。`;
      }
      return prompt;
    }
    
    // JSON形式を明示的に要求
    return `${prompt}\n\n出力は有効なJSONのみとしてください。マークダウンの\`\`\`jsonコードブロックは使用せず、生のJSONのみ返してください。`;
  }
  
  /**
   * レスポンスの後処理
   * 
   * @private
   * @param {string} response - APIレスポンス
   * @param {string} [format] - 希望する形式
   * @returns {string} 処理されたレスポンス
   */
  private postProcessResponse(response: string, format?: string): string {
    if (format !== 'json') {
      return response;
    }
    
    // JSON形式の抽出（Markdownコードブロックから）
    const jsonRegex = /```(?:json)?\s*([\s\S]*?)```|(\{[\s\S]*\})|(\[[\s\S]*\])/;
    const match = response.match(jsonRegex);
    
    if (match) {
      const jsonContent = match[1] || match[2] || match[3];
      if (jsonContent) {
        try {
          // 有効なJSONかチェック
          JSON.parse(jsonContent);
          return jsonContent.trim();
        } catch (e) {
          // JSONパース失敗時は元のレスポンスを返す
          logger.warn('Failed to parse JSON from response', {
            error: e instanceof Error ? e.message : String(e)
          });
        }
      }
    }
    
    return response;
  }
  
  /**
   * キャッシュの整理
   * 
   * @private
   */
  private pruneCache(): void {
    // 最も古いエントリーを削除
    const entries = Array.from(this.cacheStore.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // 最古の20%を削除
    const removeCount = Math.max(1, Math.floor(entries.length * 0.2));
    for (let i = 0; i < removeCount; i++) {
      this.cacheStore.delete(entries[i][0]);
    }
    
    logger.debug(`Pruned ${removeCount} entries from GeminiAdapter cache`);
  }
  
  /**
   * コンテキストのフォーマット
   * 
   * @private
   * @param {any} context - コンテキストオブジェクト
   * @returns {string} フォーマットされたコンテキスト
   */
  private formatContextForPrompt(context: any): string {
    if (typeof context === 'string') {
      return context;
    }
    
    try {
      return JSON.stringify(context, null, 2);
    } catch (e) {
      return String(context);
    }
  }
  
  // ===== テンプレート =====
  
  /**
   * キャラクター分析テンプレート
   * 
   * @private
   * @returns {string} テンプレート
   */
  private getCharacterAnalysisTemplate(): string {
    return `
以下の小説の章に登場するキャラクターを分析してください：

{{content}}

{{context}}

各キャラクターについて以下の情報を含めてJSONで出力してください：
- characterName: キャラクター名
- dialogueCount: 対話の回数（概算）
- significance: 重要度（0〜1の値）
- actions: 主な行動（配列形式）
- emotions: 表現された感情（配列形式）

JSON形式:
[
  {
    "characterName": "キャラクター名",
    "dialogueCount": 10,
    "significance": 0.8,
    "actions": ["行動1", "行動2"],
    "emotions": ["感情1", "感情2"]
  }
]`;
  }
  
  /**
   * テーマ分析テンプレート
   * 
   * @private
   * @returns {string} テンプレート
   */
  private getThemeAnalysisTemplate(): string {
    return `
以下の小説の章に現れるテーマを分析してください：

{{content}}

{{context}}

各テーマについて以下の情報を含めてJSONで出力してください：
- themeName: テーマ名
- expressions: テーマが表現されている例（配列形式）
- strength: 強度（0〜1の値）
- contexts: テーマが現れるコンテキスト（配列形式）

JSON形式:
[
  {
    "themeId": "テーマID",
    "themeName": "テーマ名",
    "expressions": ["表現1", "表現2"],
    "strength": 0.8,
    "contexts": ["コンテキスト1", "コンテキスト2"]
  }
]`;
  }
  
  /**
   * 構造分析テンプレート
   * 
   * @private
   * @returns {string} テンプレート
   */
  private getStructureAnalysisTemplate(): string {
    return `
以下の小説の章の構造を分析してください：

{{content}}

{{context}}

章の構造について以下の情報を含めてJSONで出力してください：
- scenes: シーンの配列
- pacing: ペーシング（0〜1の値）
- tension: 緊張感の推移（配列形式）
- narrative_voice: 語りの声
- transitions: シーン間の遷移の効果

JSON形式:
{
  "scenes": [
    {
      "type": "シーンタイプ",
      "title": "シーンタイトル",
      "characters": ["キャラクター1", "キャラクター2"],
      "location": "場所",
      "summary": "要約"
    }
  ],
  "pacing": 0.7,
  "tension": [0.3, 0.5, 0.8, 0.6],
  "narrative_voice": "一人称/三人称/全知視点",
  "transitions": ["場面転換の方法1", "場面転換の方法2"]
}`;
  }
  
  /**
   * 品質分析テンプレート
   * 
   * @private
   * @returns {string} テンプレート
   */
  private getQualityAnalysisTemplate(): string {
    return `
以下の小説の章を読んで、品質メトリクスを評価してください：

{{content}}

{{context}}

以下のメトリクスを0〜1の範囲で評価し、JSON形式で出力してください：
- readability: 読みやすさ（文章の明瞭さ、流れのスムーズさ）
- consistency: 整合性（設定や描写の一貫性）
- engagement: 引き込み度（読者の関心を引きつける度合い）
- characterDepiction: キャラクター描写の質
- originality: オリジナリティ、独自性
- coherence: 物語の一貫性
- characterConsistency: キャラクターの一貫性

JSON形式:
{
  "readability": 0.7,
  "consistency": 0.8,
  "engagement": 0.75,
  "characterDepiction": 0.8,
  "originality": 0.65,
  "coherence": 0.75,
  "characterConsistency": 0.8,
  "overall": 0.75
}`;
  }
  
  /**
   * 伏線分析テンプレート
   * 
   * @private
   * @returns {string} テンプレート
   */
  private getForeshadowingAnalysisTemplate(): string {
    return `
以下の小説の章に含まれる伏線・予兆を分析してください：

{{content}}

{{context}}

各伏線要素について以下の情報を含めてJSONで出力してください：
- description: 伏線の説明
- text: 伏線が含まれるテキスト
- relatedCharacters: 関連するキャラクター（配列形式）
- plannedResolutionChapter: 推定される伏線回収章（最小値と最大値の配列）

JSON形式:
[
  {
    "id": "伏線ID",
    "description": "伏線の説明",
    "text": "伏線テキスト",
    "relatedCharacters": ["キャラクター1", "キャラクター2"],
    "plannedResolutionChapter": [5, 10]
  }
]`;
  }
  
  /**
   * 一般分析テンプレート
   * 
   * @private
   * @returns {string} テンプレート
   */
  private getGeneralAnalysisTemplate(): string {
    return `
以下のコンテンツを{{analysisType}}の観点から分析してください：

{{content}}

{{context}}

分析結果をJSON形式で出力してください。
`;
  }
  
  /**
   * JSON出力テンプレート
   * 
   * @private
   * @returns {string} テンプレート
   */
  private getJsonOutputTemplate(): string {
    return `
{{content}}

出力は有効なJSONのみとし、以下の形式に従ってください：
{{context}}

マークダウンの\`\`\`jsonコードブロックは使用せず、生のJSONのみ返してください。
`;
  }
}