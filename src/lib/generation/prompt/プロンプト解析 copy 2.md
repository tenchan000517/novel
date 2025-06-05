// 🏗️ ServiceContainer対応後のシステムアーキテクチャ

/*
┌─────────────────────────────────────────────────────────────────┐
│                    AI Novel Generation System                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                ServiceContainer                         │   │
│  │              (唯一の依存関係管理者)                        │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │   │
│  │  │ Storage │ │ Memory  │ │Parameter│ │Generation│    │   │
│  │  │Provider │ │Manager  │ │Manager  │ │Engine    │    │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │   │
│  │  │Character│ │Analysis │ │ Gemini  │ │Chapter  │    │   │
│  │  │Manager  │ │Manager  │ │Client   │ │Generator│    │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │   │
│  │                                                     │   │
│  │  依存関係自動解決 + ライフサイクル管理                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│  ┌─────────────────────────────▼─────────────────────────────┐  │
│  │                   Application Layer                       │  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │  Web API    │  │ React UI    │  │ CLI Scripts │      │  │
│  │  │             │  │             │  │             │      │  │
│  │  │ /api/novels │  │ Components  │  │ generate.ts │      │  │
│  │  │ /api/status │  │ Hooks       │  │ analyze.ts  │      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
*/

// ===== 1. システム初期化フロー =====

/*
Application Start
    ↓
setupApplication()
    ↓
┌─────────────────────────────────────┐
│ 各チームの登録関数を順次実行         │
│                                     │
│ registerStorageServices()           │
│ registerMemoryServices()            │
│ registerParameterServices()         │
│ registerGenerationServices()        │
│ registerAnalysisServices()          │
│ registerCharacterServices()         │
└─────────────────────────────────────┘
    ↓
serviceContainer.initialize()
    ↓
┌─────────────────────────────────────┐
│ 段階的初期化自動実行                │
│                                     │
│ 1. Infrastructure (Storage, etc.)  │
│ 2. Integration (Memory, etc.)      │
│ 3. Services (Parameters, etc.)     │
│ 4. Generators (Gemini, etc.)       │
│ 5. Managers (Character, etc.)      │
│ 6. Application (Engine, etc.)      │
└─────────────────────────────────────┘
    ↓
System Ready for Use
*/

// ===== 2. 依存関係フロー =====

/*
NovelGenerationEngine (アプリケーション層)
    ↓ (depends on)
┌──────────────┬──────────────┬──────────────┐
│ChapterGenerator │MemoryManager │ParameterManager│
└──────────────┘└──────────────┘└──────────────┘
    ↓ (depends on)     ↓ (depends on)    ↓ (depends on)
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ GeminiClient │ │StorageProvider│ │              │
│PromptGenerator│ │              │ │              │
│ MemoryManager │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
*/

// ===== 3. ライフサイクル管理 =====

export const ComponentLifecycles = {
  // SINGLETON: システム全体で1つのインスタンス
  SINGLETON: [
    'storageProvider',
    'memoryManager', 
    'parameterManager',
    'geminiClient',
    'characterManager',
    'contentAnalysisManager',
    'novelGenerationEngine'
  ],
  
  // SCOPED: 特定の処理単位で新規インスタンス
  SCOPED: [
    'chapterGenerator',  // 章ごとに新規作成
    'contextGenerator'   // 章ごとに新規作成
  ],
  
  // TRANSIENT: 毎回新規インスタンス
  TRANSIENT: [
    'analysisResult',    // 分析結果
    'generationContext', // 生成コンテキスト
    'tempUtilities'      // 一時的なユーティリティ
  ]
};

// ===== 4. 使用パターン =====

// パターンA: 直接使用（シンプル）
export async function directUsage() {
  const engine = await serviceContainer.resolve<NovelGenerationEngine>('novelGenerationEngine');
  const chapter = await engine.generateChapter(1);
  return chapter;
}

// パターンB: 組み合わせ使用（柔軟）
export async function compositeUsage() {
  const chapterGenerator = await serviceContainer.resolve('chapterGenerator');
  const memoryManager = await serviceContainer.resolve('memoryManager');
  const parameterManager = await serviceContainer.resolve('parameterManager');
  
  // カスタムワークフロー
  parameterManager.setParameter('temperature', 0.9);
  const context = await memoryManager.getContext(1);
  const chapter = await chapterGenerator.generate(1, context);
  
  return chapter;
}

// パターンC: 特定サービスのみ使用（効率的）
export async function specificServiceUsage() {
  const analysisManager = await serviceContainer.resolve('contentAnalysisManager');
  const result = await analysisManager.analyzeExistingChapter(chapterContent);
  return result;
}

// ===== 5. エラーハンドリングとリカバリ =====

export class SystemHealthManager {
  async checkSystemHealth(): Promise<SystemHealthStatus> {
    const status = serviceContainer.getSystemStatus();
    
    return {
      overallHealth: status.initialized,
      componentStatus: {
        storage: await this.checkComponentHealth('storageProvider'),
        memory: await this.checkComponentHealth('memoryManager'),
        generation: await this.checkComponentHealth('novelGenerationEngine')
      },
      recommendations: this.generateHealthRecommendations(status)
    };
  }
  
  private async checkComponentHealth(serviceName: string): Promise<boolean> {
    try {
      const service = await serviceContainer.resolve(serviceName);
      return service && typeof service === 'object';
    } catch (error) {
      return false;
    }
  }
  
  private generateHealthRecommendations(status: SystemStatus): string[] {
    const recommendations: string[] = [];
    
    if (!status.initialized) {
      recommendations.push('System requires initialization');
    }
    
    if (status.failedServices.length > 0) {
      recommendations.push(`Failed services need attention: ${status.failedServices.join(', ')}`);
    }
    
    return recommendations;
  }
}

// ===== 6. テスト支援 =====

export class TestingSupport {
  // テスト用のモックコンテナ作成
  static createTestContainer(): ServiceContainer {
    const testContainer = new ServiceContainer();
    
    // テスト用のモックサービス登録
    testContainer.register('storageProvider', async () => new MockStorageProvider(), ServiceLifecycle.SINGLETON);
    testContainer.register('memoryManager', async () => new MockMemoryManager(), ServiceLifecycle.SINGLETON);
    
    return testContainer;
  }
  
  // 個別コンポーネントテスト
  static async testComponent<T>(
    componentName: string, 
    testContainer: ServiceContainer
  ): Promise<T> {
    await testContainer.initialize();
    return await testContainer.resolve<T>(componentName);
  }
}

// ===== 7. デバッグとモニタリング =====

export class SystemMonitor {
  static async logSystemStatus(): Promise<void> {
    const status = serviceContainer.getSystemStatus();
    
    console.log(`
🔍 System Status Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Initialized: ${status.initialized}
📊 Services: ${status.initializedServices}/${status.totalServices}
⏱️  Init Time: ${status.initializationTime}ms
❌ Failed: ${status.failedServices.length > 0 ? status.failedServices.join(', ') : 'None'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }
  
  static async dumpDependencyGraph(): Promise<void> {
    console.log('📈 Dependency Graph:');
    // ServiceContainerの依存関係グラフを出力
    // 実装は ServiceContainer に追加のメソッドが必要
  }
}

// ===== 8. 本番環境での使用例 =====

// Web API での使用
export async function webApiHandler(req: any, res: any) {
  try {
    // システム状態確認
    const healthStatus = await new SystemHealthManager().checkSystemHealth();
    if (!healthStatus.overallHealth) {
      return res.status(503).json({ error: 'System not ready' });
    }
    
    // 小説生成実行
    const engine = await serviceContainer.resolve<NovelGenerationEngine>('novelGenerationEngine');
    const result = await engine.generateChapter(req.body.chapterNumber);
    
    res.json({ success: true, chapter: result });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Generation failed' });
  }
}

// CLI での使用
export async function cliUsage(args: string[]) {
  try {
    // 必要最小限のサービスのみ初期化
    await serviceContainer.initialize();
    
    const engine = await serviceContainer.resolve<NovelGenerationEngine>('novelGenerationEngine');
    
    switch (args[0]) {
      case 'generate':
        const chapter = await engine.generateChapter(parseInt(args[1]));
        console.log(`Generated: ${chapter.title}`);
        break;
        
      case 'status':
        await SystemMonitor.logSystemStatus();
        break;
        
      default:
        console.log('Unknown command');
    }
    
  } catch (error) {
    console.error('CLI Error:', error);
    process.exit(1);
  }
}

/*
======================================================================
🎯 アーキテクチャの特徴まとめ

✅ 中央集権型依存管理
   - ServiceContainer が全依存関係を管理
   - コンポーネント間の直接依存を最小化

✅ 段階的初期化
   - 依存順序に従った自動初期化
   - エラー時の適切なロールバック

✅ ライフサイクル制御
   - SINGLETON/SCOPED/TRANSIENT の適切な使い分け
   - メモリ効率とパフォーマンスの最適化

✅ テスタビリティ
   - モック注入によるユニットテスト支援
   - 個別コンポーネントの分離テスト

✅ 柔軟性
   - 使用者が必要な組み合わせを選択可能
   - カスタムワークフローの構築支援

✅ 可観測性
   - システム状態の可視化
   - 依存関係グラフの確認
   - ヘルスチェック機能

✅ エラーハンドリング
   - 段階的エラー回復
   - 部分的サービス停止への対応
======================================================================
*/


Before（現在）: 混沌とした依存関係
StorageAdapter ← シングルトン
    ↓
MemoryManager ← 自己初期化 + 内部でStorageProvider生成
    ↓
CharacterManager ← ファクトリー関数 + 内部で他サービス生成
    ↓
NovelGenerationEngine ← 内部で全依存関係を生成
    ↓
複雑で制御困難な依存の網

After（ServiceContainer対応後）: 統制された依存関係
ServiceContainer（司令塔）
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   StorageProvider  MemoryManager  ParameterManager
        │              │              │
        └──────────────┼──────────────┘
                       │
              NovelGenerationEngine
                   （統合点）