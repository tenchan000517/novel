# NarrativeAnalysisService 技術ドキュメント

## 基本情報
- **コンポーネント名**: NarrativeAnalysisService
- **役割**: 物語のアーク、テンション、流れ、パターンを分析し、一貫性のある物語展開を支援するサービス
- **主な機能**: 
  1. シーン構造分析
  2. シーン推奨生成
  3. 文学的インスピレーション生成
  4. 物語のテンション管理
  5. ジャンル特性の適用
- **依存関係**: 
  - GeminiClient
  - SceneStructureOptimizer
  - ThemeResonanceAnalyzer
  - LiteraryComparisonSystem
  - MemoryManager
  - Logger
  - APIThrottler

## インターフェース情報

```typescript
export interface INarrativeAnalysisService {
  analyzeSceneStructure(lastChapters?: number): Promise<SceneStructureAnalysis>;
  generateSceneRecommendations(chapterNumber: number): Promise<SceneRecommendation[]>;
  generateLiteraryInspirations(
    context: GenerationContext,
    chapterNumber: number
  ): Promise<LiteraryInspiration>;
  getTurningPoints(): TurningPoint[];
  getTurningPointForChapter(chapterNumber: number): TurningPoint | null;
  setGenre(genre: string): void;
  getGenre(): string;
  getCurrentTensionLevel(): number;
  getChapterSummary(chapterNumber: number): string | null;
}
```

## 使用コンテキスト

このサービスはAIを使用した小説自動生成システムの中で、物語構造の一貫性と質を向上させるために使用されます。特にシーン構造の最適化、ジャンルに応じた文学的手法の適用、物語の流れとテンションの管理を担当し、アプリケーション全体の物語品質を支えるコア機能を提供します。

## 1. 概要と主な機能

NarrativeAnalysisServiceは、小説生成AIシステムにおける物語分析と最適化の中心的役割を果たすコンポーネントです。物語の構造、フロー、パターンを分析し、章ごとに最適なシーン構成や文学的テクニックを推奨することで、一貫性があり質の高い物語生成をサポートします。

### 主な機能詳細

#### シーン構造分析
物語の章を分析し、シーンタイプの分布、長さの統計、ペース変動、シーン遷移の滑らかさなどを評価します。これにより物語の構造的なバランスを可視化し、潜在的な改善点を特定します。

#### シーン推奨生成
分析結果に基づいて、次章に最適なシーン構成と内容を推奨します。シーンタイプのバランス、ペース変化、視点切り替えなどに関する具体的な提案を提供します。

#### 文学的インスピレーション生成
選択されたジャンルと物語の進行状況に基づいて、適切な文学的テクニックを提案します。プロット展開手法、キャラクター描写手法、雰囲気構築手法の3カテゴリにわたる具体的な手法と例を提供します。

#### 物語のテンション管理
章ごとのテンションレベルを追跡し、物語全体を通じて適切なテンション曲線を維持するための情報を提供します。

#### ジャンル特性の適用
ファンタジー、SF、ミステリー、ロマンス、スリラー、ビジネス小説など、さまざまなジャンルの特性を認識し、そのジャンルに適した文学的テクニックと構造を推奨します。

## 2. 初期化方法と設定オプション

NarrativeAnalysisServiceは、以下のように初期化します：

```typescript
import { NarrativeAnalysisService } from '@/lib/plot/narrative-analysis-service';
import { GeminiClient } from '@/lib/generation/gemini-client';

// 基本的な初期化
const narrativeService = new NarrativeAnalysisService();

// オプションを指定した初期化
const geminiClient = new GeminiClient();
const options = {
  geminiClient: geminiClient,
  genre: 'fantasy' // 'classic', 'scifi', 'mystery', 'romance', 'thriller', 'business' など
};
const narrativeService = new NarrativeAnalysisService(options);
```

### 設定オプション

```typescript
export interface NarrativeAnalysisOptions {
  geminiClient?: GeminiClient; // カスタムGeminiクライアント
  genre?: string;              // 物語のジャンル
}
```

## 3. 各メソッドの詳細説明

### analyzeSceneStructure

最近の章のシーン構造を分析します。

```typescript
async analyzeSceneStructure(lastChapters: number = 10): Promise<SceneStructureAnalysis>
```

**パラメータ**:
- `lastChapters`: 分析対象とする直近の章数。デフォルトは10章。

**戻り値**:
- `SceneStructureAnalysis`: シーン構造分析結果を含むオブジェクト
  - `typeDistribution`: シーンタイプの分布
  - `lengthDistribution`: シーン長の統計情報
  - `paceVariation`: ペース変動の指標
  - `transitionTypes`: シーン遷移の分析
  - `povsDistribution`: 視点の分布

**例外**:
- 分析に失敗した場合、エラーをログに記録し、フォールバック値を返します。

### generateSceneRecommendations

指定された章に適したシーン推奨を生成します。

```typescript
async generateSceneRecommendations(chapterNumber: number): Promise<SceneRecommendation[]>
```

**パラメータ**:
- `chapterNumber`: 推奨を生成する章番号

**戻り値**:
- `SceneRecommendation[]`: シーン推奨オブジェクトの配列
  - 各推奨は `type`, `description`, `reason` プロパティを持つ

**例外**:
- 生成に失敗した場合、エラーをログに記録し、基本的な推奨を含むフォールバック値を返します。

### generateLiteraryInspirations

章に対する文学的インスピレーションを生成します。

```typescript
async generateLiteraryInspirations(
  context: GenerationContext,
  chapterNumber: number
): Promise<LiteraryInspiration>
```

**パラメータ**:
- `context`: 生成コンテキスト（世界設定、ジャンル情報など）
- `chapterNumber`: インスピレーションを生成する章番号

**戻り値**:
- `LiteraryInspiration`: 文学的インスピレーションを含むオブジェクト
  - `plotTechniques`: プロット展開手法の配列
  - `characterTechniques`: キャラクター描写手法の配列
  - `atmosphereTechniques`: 雰囲気構築手法の配列

**タイムアウト**:
- 60秒後にタイムアウトし、エラーをスローします。

**例外**:
- 生成に失敗した場合、エラーをログに記録し、ジャンルに基づくデフォルトインスピレーションを返します。

### getTurningPoints

物語のすべてのターニングポイントを取得します。

```typescript
getTurningPoints(): TurningPoint[]
```

**戻り値**:
- `TurningPoint[]`: 物語のターニングポイントの配列

### getTurningPointForChapter

特定の章のターニングポイントを取得します。

```typescript
getTurningPointForChapter(chapterNumber: number): TurningPoint | null
```

**パラメータ**:
- `chapterNumber`: 検索する章番号

**戻り値**:
- `TurningPoint | null`: 章のターニングポイント、または存在しない場合は null

### setGenre

物語のジャンルを設定します。

```typescript
setGenre(genre: string): void
```

**パラメータ**:
- `genre`: 設定するジャンル ('classic', 'fantasy', 'scifi', 'mystery', 'romance', 'thriller', 'business' など)

### getGenre

現在のジャンルを取得します。

```typescript
getGenre(): string
```

**戻り値**:
- `string`: 現在設定されているジャンル

### getCurrentTensionLevel

現在のテンションレベルを取得します。

```typescript
getCurrentTensionLevel(): number
```

**戻り値**:
- `number`: 現在のテンションレベル（0-10の範囲）

### getChapterSummary

章の要約を取得します。

```typescript
getChapterSummary(chapterNumber: number): string | null
```

**パラメータ**:
- `chapterNumber`: 要約を取得する章番号

**戻り値**:
- `string | null`: 章の要約、または存在しない場合は null

## 4. 具体的な使用例

### 基本的な使用パターン

```typescript
import { NarrativeAnalysisService } from '@/lib/plot/narrative-analysis-service';
import { GeminiClient } from '@/lib/generation/gemini-client';

// サービスの初期化
const geminiClient = new GeminiClient();
const narrativeService = new NarrativeAnalysisService({ 
  geminiClient, 
  genre: 'fantasy' 
});

async function analyzeAndGenerateRecommendations(chapterNumber: number) {
  try {
    // 過去の章を分析
    const analysis = await narrativeService.analyzeSceneStructure(5);
    console.log('シーン構造分析結果:', analysis);
    
    // 次の章の推奨を生成
    const recommendations = await narrativeService.generateSceneRecommendations(chapterNumber);
    console.log(`章${chapterNumber}の推奨:`, recommendations);
    
    // 文学的インスピレーションを生成
    const context = {
      worldSettings: '魔法が存在する中世ファンタジー世界',
      chapterNumber,
      totalChapters: 20,
      genre: 'fantasy'
    };
    
    const inspirations = await narrativeService.generateLiteraryInspirations(context, chapterNumber);
    console.log('文学的インスピレーション:', inspirations);
    
    return {
      analysis,
      recommendations,
      inspirations
    };
  } catch (error) {
    console.error('物語分析中にエラーが発生しました:', error);
    throw error;
  }
}

// 使用例
analyzeAndGenerateRecommendations(10)
  .then(result => {
    // 結果を処理
  })
  .catch(error => {
    // エラーを処理
  });
```

### ビジネス小説のシーン推奨を生成する例

```typescript
import { NarrativeAnalysisService } from '@/lib/plot/narrative-analysis-service';

async function generateBusinessNovelRecommendations() {
  const narrativeService = new NarrativeAnalysisService({ genre: 'business' });
  
  // 現在の章番号
  const currentChapter = 5;
  
  // ビジネス小説向けのコンテキストを設定
  const context = {
    worldSettings: '大手IT企業が新規事業に挑戦する現代のビジネス環境',
    chapterNumber: currentChapter,
    totalChapters: 15,
    genre: 'business'
  };
  
  // シーン推奨とインスピレーションを生成
  const recommendations = await narrativeService.generateSceneRecommendations(currentChapter);
  const inspirations = await narrativeService.generateLiteraryInspirations(context, currentChapter);
  
  // テンションレベルを確認
  const tensionLevel = narrativeService.getCurrentTensionLevel();
  
  console.log(`ビジネス小説の第${currentChapter}章 (テンションレベル: ${tensionLevel}/10)`);
  console.log('シーン推奨:', recommendations);
  console.log('文学的手法:', inspirations);
  
  return {
    recommendations,
    inspirations,
    tensionLevel
  };
}
```

## 5. エラー処理のベストプラクティス

NarrativeAnalysisServiceでは以下のエラー処理アプローチを推奨します：

1. **優雅な劣化**: サービスのメソッドはエラー発生時にデフォルト値またはフォールバック値を返すよう設計されています。これにより、システム全体の安定性を確保します。

2. **エラーログ記録**: すべてのエラーは適切にログに記録され、障害の診断と解決に役立ちます。

3. **タイムアウト処理**: 特に外部APIを呼び出す長時間実行される操作（generateLiteraryInspirations など）では、タイムアウト処理を実装しています。

4. **try-catch パターン**: このサービスを使用する際は、常に try-catch ブロックでメソッド呼び出しを囲むことを推奨します。

```typescript
try {
  const analysis = await narrativeService.analyzeSceneStructure();
  // 結果を処理
} catch (error) {
  console.error('シーン分析エラー:', error);
  // フォールバック動作またはユーザーへの通知
}
```

## 6. パフォーマンスに関する考慮事項

1. **API スロットリング**: 外部AI（Gemini）を多用するメソッドでは、`apiThrottler`を使用してレート制限を回避します。これにより安定した操作が保証されますが、同時に処理時間が増加する可能性があります。

2. **キャッシュの活用**: 頻繁に変化しないデータ（シーン構造分析など）は、必要に応じてキャッシュすることを検討してください。

3. **バッチ処理**: 複数の章を同時に処理する必要がある場合は、`Promise.all`を使用した並列処理よりも、シーケンシャルな処理が望ましいことがあります（API制限を考慮）。

4. **メモリ使用量**: 長期間実行されるアプリケーションでは、大量のターニングポイントやテンション履歴がメモリに蓄積される可能性があります。必要に応じて定期的なクリーンアップを検討してください。

## 7. 他のコンポーネントとの統合方法

NarrativeAnalysisServiceは以下のコンポーネントと密接に連携します：

### MemoryManager との統合

```typescript
import { memoryManager } from '@/lib/memory/manager';

// 章の情報を取得してシーン分析を実行
async function analyzeRecentChapters(narrativeService) {
  const shortTermMemory = memoryManager.getShortTermMemory();
  const recentChapters = await shortTermMemory.getRecentChapters();
  
  // 取得した章でシーン構造を分析
  const analysis = await narrativeService.analyzeSceneStructure();
  return analysis;
}
```

### LiteraryComparisonSystem との連携

```typescript
import { LiteraryComparisonSystem } from '@/lib/plot/literary-comparison-system';
import { GeminiClient } from '@/lib/generation/gemini-client';

// インスピレーションを詳細に分析する
async function analyzeLiteraryTechnique(narrativeService, technique, genre) {
  const geminiClient = new GeminiClient();
  const literarySystem = new LiteraryComparisonSystem(geminiClient);
  
  const techniqueDetails = await literarySystem.getTechniqueDetails(
    genre || narrativeService.getGenre(),
    'plot',
    technique
  );
  
  return techniqueDetails;
}
```

## 8. よくある質問（FAQ）

### Q: 異なるジャンルのサポートはどの程度ありますか？
A: 現在、'classic', 'fantasy', 'scifi', 'mystery', 'romance', 'thriller', 'horror', 'historical', 'business' の9つのジャンルが正式にサポートされています。それぞれのジャンルには特化した文学的テクニックと参考作品リストが用意されています。

### Q: テンションレベルはどのように決定されますか？
A: テンションレベルは、物語の進行度（章番号/総章数）とジャンルに基づいて計算されます。各ジャンルには理想的なテンション曲線が定義されており、現在の進行度に応じた値が返されます。

### Q: 物語の進行状況に応じた推奨はどのように変化しますか？
A: 物語は「序盤」「中盤」「終盤」の3つの段階に分けられ、各段階で異なるシーン構成と文学的テクニックが推奨されます。これにより、物語全体のアークに一貫性が生まれます。

### Q: 複数のPOV（視点）はどのように扱われますか？
A: シーン構造分析では、POVの分布が追跡され、使用頻度の低いPOVを次章で使用するよう推奨することがあります。これにより、バランスの取れた視点の切り替えが促進されます。

### Q: 推奨されたシーン構成に従う必要がありますか？
A: 推奨は参考情報であり、必ずしも厳密に従う必要はありません。クリエイティブな判断を優先しつつ、物語の構造とペースを改善するためのガイドラインとして活用することを推奨します。

## 9. トラブルシューティング

### 問題: APIリクエストが頻繁にタイムアウトする

**解決策**:
1. `apiThrottler`のスロットリング設定を確認・調整する
2. `generateLiteraryInspirations`のタイムアウト値（現在60秒）を増やす
3. 複雑なコンテキストを簡略化する

### 問題: 不適切なジャンル判定

**解決策**:
1. `setGenre`メソッドを使用して明示的にジャンルを設定する
2. コンテキスト情報に明示的なジャンル情報を含める
3. 世界設定の記述を改善して、ジャンル判定アルゴリズムの精度を向上させる

### 問題: 推奨の質が低い

**解決策**:
1. より多くの章を分析対象に含める（`analyzeSceneStructure`の`lastChapters`パラメータを増やす）
2. より詳細な世界設定を提供する
3. 生成コンテキストに追加情報（キャラクターリスト、プロット要約など）を含める

### 問題: パフォーマンスの低下

**解決策**:
1. 分析の頻度を減らす
2. 分析対象の章数を減らす
3. 結果をキャッシュし、必要な場合のみ再計算する

## 10. 今後の拡張や改善予定

1. **マルチモーダル分析**: テキストだけでなく、物語構造を視覚化するためのグラフやチャートの自動生成

2. **パーソナライズされた推奨**: 作家の好みや過去の選択に基づくカスタマイズされた推奨システム

3. **拡張ジャンルサポート**: より多くの特殊ジャンル（青春、歴史ファンタジー、ダークファンタジーなど）のサポート追加

4. **物語の整合性チェック**: プロットホール、キャラクターの不一致、タイムラインエラーなどを検出する機能

5. **リアルタイムコラボレーション**: 複数の作家が同時に作業する場合の構造分析と推奨

6. **市場トレンド分析**: 現在の文学的トレンドに基づく推奨の調整