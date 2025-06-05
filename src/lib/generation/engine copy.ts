// 🎯 修正された設計：既存のNovelGenerationEngineをServiceContainer対応

// lib/generation/engine.ts（修正版）
export class NovelGenerationEngine {
  // ❌ 削除: 独自のコンポーネント生成
  // ❌ 削除: シングルトンパターン
  
  constructor(
    private chapterGenerator: ChapterGenerator,    // ← ServiceContainerから注入
    private contextGenerator: ContextGenerator,    // ← ServiceContainerから注入
    private memoryManager: MemoryManager,         // ← ServiceContainerから注入
    private characterManager: CharacterManager,    // ← ServiceContainerから注入
    private contentAnalysisManager: ContentAnalysisManager, // ← ServiceContainerから注入
    private parameterManager: ParameterManager     // ← ServiceContainerから注入
  ) {
    // 依存関係は全てコンストラクタで受け取る
    // 独自初期化は削除
  }

  // ✅ 削除: async initialize() - ServiceContainerが管理

  /**
   * チャプター生成（統一ワークフロー）
   */
  async generateChapter(
    chapterNumber: number,
    options?: GenerateChapterRequest
  ): Promise<Chapter> {
    console.log(`🖋️ Generating chapter ${chapterNumber}...`);

    try {
      // 1. 前章の取得
      const previousChapter = chapterNumber > 1 
        ? await this.getPreviousChapter(chapterNumber - 1)
        : undefined;

      // 2. 生成コンテキストの作成
      const context = await this.contextGenerator.generateContext(
        chapterNumber,
        previousChapter,
        options
      );

      // 3. 章の生成
      const chapter = await this.chapterGenerator.generate(chapterNumber, {
        ...options,
        context
      });

      // 4. 章の後処理（分析・品質評価）
      const processingResult = await this.contentAnalysisManager
        .processGeneratedChapter(chapter, context);

      // 5. メモリシステムへの保存
      await this.memoryManager.processChapter(chapter);

      // 6. キャラクター状態の更新
      if (this.characterManager) {
        await this.updateCharacterStates(chapter, context);
      }

      console.log(`✅ Chapter ${chapterNumber} generation completed`);
      return chapter;

    } catch (error) {
      console.error(`❌ Chapter ${chapterNumber} generation failed:`, error);
      throw new GenerationError(
        `Chapter ${chapterNumber} generation failed: ${error instanceof Error ? error.message : String(error)}`,
        'CHAPTER_GENERATION_FAILED'
      );
    }
  }

  /**
   * 複数章の連続生成
   */
  async generateMultipleChapters(
    startChapter: number,
    endChapter: number,
    options?: GenerateChapterRequest
  ): Promise<Chapter[]> {
    const chapters: Chapter[] = [];

    for (let chapterNumber = startChapter; chapterNumber <= endChapter; chapterNumber++) {
      const chapter = await this.generateChapter(chapterNumber, options);
      chapters.push(chapter);

      // 章間での小休止（APIレート制限対策）
      await this.delay(1000);
    }

    return chapters;
  }

  /**
   * システム状態確認（既存機能を維持）
   */
  async checkStatus(): Promise<{
    apiKeyValid: boolean;
    modelInfo: any;
    parameters: SystemParameters;
    memoryManagerStatus: any;
    characterManagerStatus: any;
  }> {
    // ✅ 注入されたサービスを使用
    const apiKeyValid = await this.chapterGenerator.validateApiKey();
    const parameters = this.parameterManager.getParameters();
    const memoryStatus = await this.memoryManager.getSystemStatus();
    
    return {
      apiKeyValid,
      modelInfo: this.chapterGenerator.getModelInfo(),
      parameters,
      memoryManagerStatus: memoryStatus,
      characterManagerStatus: await this.characterManager?.getStatus?.() || {}
    };
  }

  // 既存メソッドを維持
  updateParameter(path: string, value: any): void {
    this.parameterManager.updateParameter(path, value);
  }

  applyPreset(presetName: string): boolean {
    return this.parameterManager.applyPreset(presetName);
  }

  // プライベートヘルパーメソッド
  private async getPreviousChapter(chapterNumber: number): Promise<Chapter | undefined> {
    const searchResult = await this.memoryManager.unifiedSearch(
      `chapter ${chapterNumber}`,
      [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
    );

    if (searchResult.success && searchResult.results.length > 0) {
      return searchResult.results[0].data as Chapter;
    }
    return undefined;
  }

  private async updateCharacterStates(chapter: Chapter, context: GenerationContext): Promise<void> {
    for (const character of context.characters || []) {
      await this.characterManager.updateCharacterState(
        character.id,
        chapter.chapterNumber
      );
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// app/main.ts（修正版）
import { serviceContainer, ServiceLifecycle } from '@/core/service-container';

export async function initializeApplication(): Promise<void> {
  console.log('🚀 Initializing AI Novel Generation System...');

  // Infrastructure Layer
  serviceContainer.register('logger', () => new Logger(), ServiceLifecycle.SINGLETON);
  serviceContainer.register('storageProvider', () => new StorageProvider(), ServiceLifecycle.SINGLETON);

  // Integration Layer
  serviceContainer.register('memoryManager', async (container) => {
    const config = await container.resolve('memoryConfig');
    const storageProvider = await container.resolve('storageProvider');
    const manager = new MemoryManager(config, storageProvider);
    await manager.initialize();
    return manager;
  }, ServiceLifecycle.SINGLETON);

  // Service Layer
  serviceContainer.register('parameterManager', async () => {
    const manager = new ParameterManager();
    await manager.initialize();
    return manager;
  }, ServiceLifecycle.SINGLETON);

  serviceContainer.register('geminiClient', async (container) => {
    const parameterManager = await container.resolve('parameterManager');
    return new GeminiClient(parameterManager);
  }, ServiceLifecycle.SINGLETON);

  // Generator Layer
  serviceContainer.register('chapterGenerator', async (container) => {
    const geminiClient = await container.resolve('geminiClient');
    const promptGenerator = await container.resolve('promptGenerator');
    const memoryManager = await container.resolve('memoryManager');
    const contentAnalysisManager = await container.resolve('contentAnalysisManager');
    
    return new ChapterGenerator(
      geminiClient,
      promptGenerator,
      memoryManager,
      contentAnalysisManager
    );
  }, ServiceLifecycle.SCOPED);

  serviceContainer.register('contextGenerator', async (container) => {
    const memoryManager = await container.resolve('memoryManager');
    const characterManager = await container.resolve('characterManager');
    const plotManager = await container.resolve('plotManager');
    const contentAnalysisManager = await container.resolve('contentAnalysisManager');
    
    return new ContextGenerator(
      memoryManager,
      characterManager,
      plotManager,
      contentAnalysisManager
    );
  }, ServiceLifecycle.SCOPED);

  // Manager Layer
  serviceContainer.register('characterManager', async (container) => {
    const memoryManager = await container.resolve('memoryManager');
    const characterService = await container.resolve('characterService');
    const storageProvider = await container.resolve('storageProvider');
    
    return new CharacterManager(
      memoryManager,
      characterService,
      storageProvider
    );
  }, ServiceLifecycle.SINGLETON);

  serviceContainer.register('contentAnalysisManager', async (container) => {
    const preGenerationPipeline = await container.resolve('preGenerationPipeline');
    const postGenerationPipeline = await container.resolve('postGenerationPipeline');
    
    return new ContentAnalysisManager(
      preGenerationPipeline,
      postGenerationPipeline
    );
  }, ServiceLifecycle.SINGLETON);

  // 🎯 メインエンジン（統一オーケストレーター）
  serviceContainer.register('novelGenerationEngine', async (container) => {
    const chapterGenerator = await container.resolve('chapterGenerator');
    const contextGenerator = await container.resolve('contextGenerator');
    const memoryManager = await container.resolve('memoryManager');
    const characterManager = await container.resolve('characterManager');
    const contentAnalysisManager = await container.resolve('contentAnalysisManager');
    const parameterManager = await container.resolve('parameterManager');
    
    return new NovelGenerationEngine(
      chapterGenerator,
      contextGenerator,
      memoryManager,
      characterManager,
      contentAnalysisManager,
      parameterManager
    );
  }, ServiceLifecycle.SINGLETON);

  // 段階的初期化の実行
  await serviceContainer.initialize();

  console.log('✅ AI Novel Generation System initialized successfully');
}

export async function main(): Promise<void> {
  try {
    // システム初期化
    await initializeApplication();

    // ✅ 既存のエンジンを統一オーケストレーターとして使用
    const engine = await serviceContainer.resolve<NovelGenerationEngine>('novelGenerationEngine');

    // 章生成実行例
    const chapter1 = await engine.generateChapter(1);
    console.log('Chapter 1 generated:', chapter1.title);

    // 複数章生成実行例
    const chapters = await engine.generateMultipleChapters(2, 5);
    console.log(`Chapters 2-5 generated: ${chapters.length} chapters`);

  } catch (error) {
    console.error('Application failed:', error);
    process.exit(1);
  }
}

// API エンドポイントでの使用例
// pages/api/generation/chapter.ts
export default async function handler(req: NextRequest) {
  try {
    // ✅ ServiceContainerから統一エンジンを取得
    const engine = await serviceContainer.resolve<NovelGenerationEngine>('novelGenerationEngine');
    
    if (req.method === 'GET') {
      // システム状態確認
      const status = await engine.checkStatus();
      return NextResponse.json(status);
    }
    
    if (req.method === 'POST') {
      const { chapterNumber, options } = await req.json();
      
      // 章生成
      const chapter = await engine.generateChapter(chapterNumber, options);
      return NextResponse.json(chapter);
    }
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}

// ❌ 削除: export const generationEngine = new NovelGenerationEngine();
// ✅ ServiceContainerからの取得を推奨

// 後方互換性のためのヘルパー（必要に応じて）
export async function getGenerationEngine(): Promise<NovelGenerationEngine> {
  return await serviceContainer.resolve<NovelGenerationEngine>('novelGenerationEngine');
}