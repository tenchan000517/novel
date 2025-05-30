# ThemeAnalysisService 使用ガイド

## 概要

`ThemeAnalysisService`は、物語のテーマ、象徴、伏線、モチーフなどの文学的要素を分析・管理するためのサービスです。このサービスは小説生成AIシステムの一部として機能し、作品の深層的な意味構造を一貫して発展させることを支援します。

### 主な機能

- テーマの共鳴と一貫性の分析
- 伏線の検出・生成・追跡・解決
- 象徴とイメージの分析とマッピング
- モチーフの追跡と発展パターンの分析
- テーマと物語要素の関連性分析

## 依存関係

ThemeAnalysisServiceは以下のコンポーネントに依存しています：

- `GeminiAdapter`: テキスト生成と分析を担当するAIアダプター
- `MemoryManager`: 物語の状態や過去の情報を記憶する管理システム
- `StorageProvider`: 分析結果や設定の永続化を担当するストレージシステム

## 使用方法

### サービスの初期化

```typescript
import { ThemeAnalysisService } from '@/lib/services/theme-analysis-service';
import { GeminiAdapter } from '@/lib/adapters/gemini-adapter';
import { MemoryManager } from '@/lib/memory/manager';
import { storageProvider } from '@/lib/storage';

// 依存コンポーネントを初期化
const geminiAdapter = new GeminiAdapter({ /* 設定 */ });
const memoryManager = new MemoryManager({ /* 設定 */ });

// ThemeAnalysisServiceのインスタンスを作成
const themeAnalysisService = new ThemeAnalysisService(
  geminiAdapter,
  memoryManager,
  storageProvider
);

// これで themeAnalysisService が使用可能になります
```

### 依存性注入を使用する場合

DIコンテナを使用している場合は、次のように設定します：

```typescript
import { container } from 'tsyringe';
import { IThemeAnalysisService } from '@/core/interfaces';
import { ThemeAnalysisService } from '@/lib/services/theme-analysis-service';

// サービス登録
container.register<IThemeAnalysisService>(
  'IThemeAnalysisService',
  { useClass: ThemeAnalysisService }
);

// 使用側でのインジェクション
constructor(
  @inject('IThemeAnalysisService') private themeAnalysisService: IThemeAnalysisService
) {}
```

## 主な機能と使用例

### テーマ共鳴分析

小説の本文からテーマの表現強度や表現方法を分析します。

```typescript
// テーマ共鳴分析の実行
async function analyzeChapterThemes(chapterContent: string) {
  const themes = ['成長', '友情', '挑戦'];
  const analysis = await themeAnalysisService.analyzeThemeResonance(chapterContent, themes);
  
  console.log(`最も強いテーマ: ${analysis.dominantTheme}`);
  console.log(`テーマの一貫性スコア: ${analysis.overallCoherence}`);
  
  // 各テーマの強度を確認
  Object.entries(analysis.themes || {}).forEach(([theme, info]) => {
    console.log(`テーマ「${theme}」の強度: ${info.strength}/10`);
  });
  
  return analysis;
}
```

### 伏線の処理

章の内容から伏線を検出し、新しい伏線を生成します。

```typescript
// 伏線の処理
async function processForeshadowingForChapter(chapterContent: string, chapterNumber: number) {
  const result = await themeAnalysisService.processForeshadowing(
    chapterContent,
    chapterNumber
  );
  
  console.log(`解決された伏線: ${result.resolvedForeshadowing.length}件`);
  console.log(`生成された伏線: ${result.generatedCount}件`);
  console.log(`現在アクティブな伏線: ${result.totalActive}件`);
  
  return result;
}
```

### 象徴とイメージの分析

テキスト内の象徴、モチーフ、隠喩、比喩などの文学的技法を分析します。

```typescript
// 象徴分析の実行
async function analyzeSymbolism(chapterContent: string) {
  const symbolismAnalysis = await themeAnalysisService.analyzeSymbolismAndImagery(chapterContent);
  
  console.log(`検出された象徴: ${symbolismAnalysis.symbols.length}件`);
  console.log(`検出されたモチーフ: ${symbolismAnalysis.motifs.length}件`);
  
  // 主要な象徴を表示
  symbolismAnalysis.symbols.forEach(symbol => {
    console.log(`象徴「${symbol.symbol}」: ${symbol.meaning}`);
  });
  
  return symbolismAnalysis;
}
```

### モチーフの追跡

特定のモチーフが物語全体でどのように発展するかを追跡します。

```typescript
// モチーフ追跡
async function trackMotifAcrossChapters(motif: string, chapterContents: string[]) {
  const tracking = await themeAnalysisService.trackMotif(motif, chapterContents);
  
  console.log(`モチーフ「${motif}」の発展パターン: ${tracking.developmentPattern}`);
  console.log(`テーマとの関連性: ${tracking.thematicConnection}`);
  
  // 各章での出現状況を確認
  tracking.occurrencesByChapter.forEach(occurrence => {
    console.log(`章${occurrence.chapter}: ${occurrence.occurrenceCount}回出現（重要度: ${occurrence.significance}/10）`);
  });
  
  return tracking;
}
```

### テーマ強化提案の保存

次の章用のテーマ強化提案を保存します。

```typescript
// テーマ強化提案の保存
async function saveEnhancementsForNextChapter(chapterNumber: number) {
  const enhancements = [
    {
      theme: '成長',
      currentStrength: 7,
      suggestion: '主人公が自分の弱点と向き合う場面を追加する',
      approach: '内面的葛藤',
      example: '「私は本当は何がしたいんだろう」と彼は夜空を見上げながら考えた。',
      impact: '成長テーマの深化と読者の共感促進'
    },
    // 他の強化提案...
  ];
  
  await themeAnalysisService.saveThemeEnhancements(chapterNumber, enhancements);
  console.log(`章${chapterNumber + 1}のテーマ強化提案を保存しました`);
}
```

## メソッド詳細

### analyzeThemeResonance

```typescript
analyzeThemeResonance(content: string, themes: string[]): Promise<ThemeResonanceAnalysis>
```

**説明**: 指定されたテキスト内のテーマ表現を分析し、各テーマの強度や表現方法を評価します。

**パラメータ**:
- `content`: 分析対象のテキスト
- `themes`: 分析するテーマの配列

**戻り値**: `ThemeResonanceAnalysis` オブジェクト（テーマごとの強度、表現方法、一貫性スコアなど）

**使用例**:
```typescript
const analysis = await themeAnalysisService.analyzeThemeResonance(
  chapterText,
  ['愛', '正義', '自由']
);
```

### processForeshadowing

```typescript
processForeshadowing(content: string, chapterNumber: number): Promise<{
  resolvedForeshadowing: ForeshadowingElement[];
  generatedCount: number;
  totalActive: number;
}>
```

**説明**: 章のテキストを分析して伏線を検出、解決、生成します。既存の伏線が解決されたかを確認し、必要に応じて新しい伏線を生成します。

**パラメータ**:
- `content`: 章のテキスト
- `chapterNumber`: 章番号

**戻り値**: 解決された伏線、生成された伏線の数、アクティブな伏線の総数を含むオブジェクト

**使用例**:
```typescript
const foreshadowingResult = await themeAnalysisService.processForeshadowing(
  chapterText,
  5 // 章番号
);
```

### analyzeSymbolismAndImagery

```typescript
analyzeSymbolismAndImagery(content: string): Promise<SymbolismAnalysis>
```

**説明**: テキスト内の象徴、モチーフ、隠喩、比喩などの文学的技法を分析します。

**パラメータ**:
- `content`: 分析対象のテキスト

**戻り値**: `SymbolismAnalysis` オブジェクト（象徴、モチーフ、隠喩、比喩のリストなど）

**使用例**:
```typescript
const symbolism = await themeAnalysisService.analyzeSymbolismAndImagery(chapterText);
```

## エラー処理

ThemeAnalysisServiceのメソッドは、エラーが発生した場合でも安全に処理を続行できるように設計されています。各メソッドは内部でエラーをキャッチし、デフォルト値や空の結果を返します。

エラーが発生した場合、サービスはロガーを通じてエラー情報を記録します。

```typescript
try {
  const analysis = await themeAnalysisService.analyzeThemeResonance(content, themes);
  // 分析結果を使用...
} catch (error) {
  console.error('テーマ分析中にエラーが発生しました:', error);
  // エラーからの回復処理...
}
```

## ベストプラクティス

### パフォーマンスに関する考慮事項

1. **テキストの長さ**: 長いテキストを分析する場合、パフォーマンスに影響する可能性があります。6000文字以内に抑えるのが理想的です（サービスの実装では自動的に制限されています）。

2. **キャッシュの利用**: 同じコンテンツに対する繰り返しの分析を避けるため、`analyzeThemeResonance`や`analyzeSymbolismAndImagery`などのメソッドは内部的にキャッシュを使用しています。

3. **バッチ処理**: 多数の章を一度に処理する場合は、逐次処理よりもバッチ処理を検討してください。

```typescript
// バッチ処理の例
async function analyzeAllChapters(chapters: string[]) {
  const analysisPromises = chapters.map((chapter, index) => 
    themeAnalysisService.analyzeThemeResonance(chapter, themes)
  );
  
  return Promise.all(analysisPromises);
}
```

### 統合に関するヒント

1. **定期的な分析**: 章の生成後、または編集後に定期的にテーマ分析を実行することで、一貫性を維持します。

2. **結果の活用**: 分析結果を次の章の生成に活用することで、ストーリーの質と一貫性を向上させます。

```typescript
async function generateNextChapter(previousChapters: string[]) {
  // 前の章からテーマ分析を実行
  const lastChapter = previousChapters[previousChapters.length - 1];
  const themeAnalysis = await themeAnalysisService.analyzeThemeResonance(
    lastChapter, 
    ['成長', '挑戦', '友情']
  );
  
  // テーマ強化提案を取得（前の章で保存されたもの）
  const chapterNumber = previousChapters.length;
  const themeSuggestions = await loadThemeEnhancements(chapterNumber);
  
  // これらの情報を使用して次の章を生成
  // ...
}
```

## よくある質問（FAQ）

### Q: ThemeAnalysisServiceはどのようなAIモデルに依存していますか？

A: ThemeAnalysisServiceはGeminiアダプターを介してGemini APIを使用します。実装はアダプターパターンを使用しているため、将来的に他のAIモデルへの切り替えも可能です。

### Q: 伏線の追跡はどのように行われますか？

A: 伏線は`MemoryManager`を通じて長期記憶に保存されます。各伏線には導入章、説明、緊急度、解決状態などの属性があり、章ごとに解決されたかどうかがチェックされます。

### Q: テーマ分析の結果はどこに保存されますか？

A: 分析結果は`StorageAdapter`を通じて永続化ストレージに保存されます。具体的な保存場所は`StorageProvider`の実装によります（ローカルファイルシステムやクラウドストレージなど）。

### Q: サービスをモックしてテストするにはどうすればよいですか？

A: `IThemeAnalysisService`インターフェースを使用してモックを作成できます。例えば：

```typescript
import { IThemeAnalysisService } from '@/core/interfaces';

class MockThemeAnalysisService implements IThemeAnalysisService {
  // インターフェースのメソッドを実装
  async analyzeThemeResonance(content: string, themes: string[]) {
    return {
      themes: {
        '成長': { strength: 8, /* その他のプロパティ */ }
      },
      dominantTheme: '成長',
      overallCoherence: 7,
      // その他のプロパティ
    };
  }
  
  // 他のメソッドも同様に実装...
}

// テストでの使用
const mockService = new MockThemeAnalysisService();
// mockServiceを使ったテスト...
```

### Q: サービスをカスタマイズするにはどうすればよいですか？

A: サービスの拡張や変更は、継承または依存性注入によるカスタムサービスの作成で対応できます：

```typescript
// 継承による拡張
class EnhancedThemeAnalysisService extends ThemeAnalysisService {
  async analyzeThemeResonance(content: string, themes: string[]) {
    // 基本的な分析を実行
    const baseAnalysis = await super.analyzeThemeResonance(content, themes);
    
    // 拡張機能を追加
    // ...
    
    return {
      ...baseAnalysis,
      // 追加プロパティ
    };
  }
}

// または依存性注入
class CustomThemeService implements IThemeAnalysisService {
  constructor(
    private baseService: IThemeAnalysisService,
    private customComponent: CustomComponent
  ) {}
  
  // メソッドの実装...
}
```

## トラブルシューティング

### 分析が失敗する場合

1. **テキストの長さ**: 非常に長いテキストは処理が失敗する可能性があります。6000文字以内に制限することをお勧めします。
2. **ネットワークエラー**: GeminiアダプターがAPIにアクセスできることを確認してください。
3. **メモリエラー**: `MemoryManager`が正しく初期化され、アクセス可能であることを確認してください。

### 予期しない結果が返される場合

1. **テーマの指定**: 分析するテーマが適切に指定されているか確認してください。
2. **言語**: 現在のサービスは日本語テキストに最適化されています。他の言語を使用する場合は、適切な設定が必要です。
3. **コンテキスト**: 十分なコンテキスト情報が提供されていないと、分析精度が低下する可能性があります。

## 今後の拡張予定

今後のバージョンでは以下の機能が追加される予定です：

1. 複数の言語のサポート
2. カスタムテーマ分析のためのプロンプトテンプレート
3. バッチ処理のパフォーマンス向上
4. テーマの視覚化コンポーネント
5. ユーザー定義のテーマ辞書のサポート

## ライセンス

ThemeAnalysisServiceは独自のライセンスの下で提供されています。詳細については、プロジェクトのライセンスファイルを参照してください。