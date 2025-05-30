// src/lib/generation/engine.ts
import { Chapter } from '@/types/chapters';
import { GenerateChapterRequest, GenerationContext } from '@/types/generation';
import { SystemParameters } from '@/types/parameters';
import { GeminiClient } from './gemini-client';
import { parameterManager } from '@/lib/parameters';
import { logger } from '@/lib/utils/logger';
import { GenerationError } from '@/lib/utils/error-handler';
import { ChapterGenerator } from './engine/chapter-generator';
import { PromptGenerator } from './prompt-generator'

/**
 * @class NovelGenerationEngine
 * @description 小説生成エンジンのファサードクラス
 * 
 * @role
 * - 外部からの要求を適切なコンポーネントに委譲する
 * - 各コンポーネント間の連携を調整する
 * - 公開APIを提供する
 */
class NovelGenerationEngine {
  private chapterGenerator: ChapterGenerator;
  private geminiClient: GeminiClient;
  private promptGenerator: PromptGenerator;
  // 初期化状態を追跡するためのフラグ
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  /**
   * コンストラクタ
   * 
   * NovelGenerationEngineクラスのインスタンスを初期化します。
   * 内部で使用する各コンポーネントのインスタンスを生成します。
   */
  constructor() {
    this.geminiClient = new GeminiClient();
    this.promptGenerator = new PromptGenerator();
    // ChapterGeneratorの初期化
    this.chapterGenerator = new ChapterGenerator(this.geminiClient, this.promptGenerator);
    
    // パラメータマネージャーの初期化を確認
    this.initializeParameters();
    
    logger.info('NovelGenerationEngine initialized');
  }

  /**
   * パラメータマネージャーの初期化を確認し、必要に応じて初期化します
   */
  private async initializeParameters(): Promise<void> {
    try {
      await parameterManager.initialize();

      // パラメータ変更時のイベントリスナーを設定
      parameterManager.onParameterChanged(this.handleParameterChange.bind(this));

      // 用途別モデルマップを設定
      const params = parameterManager.getParameters();
      if (params.generation.models) {
        this.geminiClient.setModelMap(params.generation.models);
        logger.info('Model map initialized from parameters', { models: params.generation.models });
      }

      logger.info('Parameter manager initialized in NovelGenerationEngine');
    } catch (error) {
      logger.error('Failed to initialize parameter manager', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * パラメータ変更ハンドラ
   * @param path 変更されたパラメータのパス
   * @param value 新しい値
   */
  private handleParameterChange(path: string, value: any): void {
    // 生成関連のパラメータが変更された場合の処理
    if (path.startsWith('generation.') || path === 'all') {
      logger.info(`Generation parameter changed: ${path}`);

      // モデルマップが変更された場合、GeminiClientに反映
      if (path === 'generation.models' || path === 'all') {
        const params = parameterManager.getParameters();
        if (params.generation.models) {
          this.geminiClient.setModelMap(params.generation.models);
          logger.info('Updated model map in GeminiClient', { models: params.generation.models });
        }
      }
    }
  }

  /**
   * 非同期初期化メソッド
   * 依存コンポーネントを初期化し、エンジンを使用可能な状態にします
   */
  async initialize(): Promise<void> {
    // 既に初期化済みならスキップ
    if (this.initialized) {
      return;
    }

    // 初期化が進行中なら、その結果を待機
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // 新しい初期化プロセスを開始
    this.initializationPromise = this._initialize();
    return this.initializationPromise;
  }

  /**
   * 内部初期化実装
   */
  private async _initialize(): Promise<void> {
    try {
      logger.info('Starting NovelGenerationEngine initialization');

      // ChapterGeneratorの初期化
      logger.info('Initializing ChapterGenerator');
      await this.chapterGenerator.initialize();
      logger.info('ChapterGenerator initialization completed');

      this.initialized = true;
      logger.info('NovelGenerationEngine initialization completed');
    } catch (error) {
      logger.error('Failed to initialize NovelGenerationEngine', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    } finally {
      this.initializationPromise = null;
    }
  }

  /**
   * システム状態情報を取得する
   * 
   * @async
   * @description
   * API エンドポイント（GET /api/generation/chapter）からの呼び出しにより実行され、
   * 
   * @returns {Promise<{apiKeyValid: boolean, modelInfo: any, parameters: SystemParameters}>} 
   *   システム状態情報を含むオブジェクト
   */
  async checkStatus(): Promise<{
    apiKeyValid: boolean;
    modelInfo: any;
    parameters: SystemParameters;
  }> {
    const apiKeyValid = await this.geminiClient.validateApiKey();
    const modelInfo = this.geminiClient.getModelInfo();
    const parameters = parameterManager.getParameters();

    return {
      apiKeyValid,
      modelInfo,
      parameters
    };
  }

  /**
   * チャプターの生成
   * 
   * 指定されたチャプター番号に基づいて小説のチャプターを生成します。
   * ChapterGeneratorに処理を委譲します。
   * 
   * @async
   * @param {number} chapterNumber チャプター番号
   * @param {GenerateChapterRequest} [options] 生成オプション
   * @returns {Promise<Chapter>} 生成されたチャプター
   * 
   * @throws {GenerationError} チャプター生成に失敗した場合
   */
  async generateChapter(
    chapterNumber: number,
    options?: GenerateChapterRequest
  ): Promise<Chapter> {
    if (!this.initialized) {
      logger.info('Ensuring initialization before chapter generation');
      await this.initialize();
    }

    try {
      return await this.chapterGenerator.generate(chapterNumber, options);
    } catch (error) {
      logger.error(`Failed to generate chapter ${chapterNumber} in NovelGenerationEngine`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      throw new GenerationError(
        `Chapter ${chapterNumber} generation failed: ${error instanceof Error ? error.message : String(error)}`,
        'CHAPTER_GENERATION_FAILED'
      );
    }
  }

  // /**
  //  * テキスト要約の生成
  //  * 
  //  * @async
  //  * @param {string} text 要約する元のテキスト
  //  * @param {number} [maxLength=500] 要約の最大文字数
  //  * @returns {Promise<string>} 生成された要約
  //  */
  // async generateSummary(text: string, maxLength: number = 500): Promise<string> {
  //   return this.chapterGenerator.generateSummary(text, maxLength);
  // }

  // /**
  //  * キャラクター分析
  //  * 
  //  * @async
  //  * @param {string} characterName 分析するキャラクター名
  //  * @param {string} text 分析対象のテキスト
  //  * @returns {Promise<any>} キャラクター分析結果
  //  */
  // async analyzeCharacter(characterName: string, text: string): Promise<any> {
  //   return this.chapterGenerator.analyzeCharacter(characterName, text);
  // }

  /**
   * パラメータ更新
   * 
   * @param {string} path 更新するパラメータのパス
   * @param {any} value 新しい値
   */
  updateParameter(path: string, value: any): void {
    parameterManager.updateParameter(path, value);
  }

  /**
   * プリセット適用
   * 
   * @param {string} presetName 適用するプリセット名
   * @returns {boolean} 適用成功したかどうか
   */
  applyPreset(presetName: string): boolean {
    return parameterManager.applyPreset(presetName);
  }
}

// シングルトンインスタンスを作成して公開
export const generationEngine = new NovelGenerationEngine();