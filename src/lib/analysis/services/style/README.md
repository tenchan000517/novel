
---

# StyleAnalysisService 仕様書

## 概要

`StyleAnalysisService`は、テキストの文体特性、表現パターン、主語使用パターンを分析し、文体の最適化と言語パターンの多様化のための推奨事項を提供するサービスです。小説自動生成システムの品質向上に重要な役割を果たします。

## 導入方法

### 依存関係

このサービスを使用するには以下の依存関係が必要です：

- GeminiAdapter: AIによる分析のためのアダプター
- StorageAdapter: 分析結果キャッシュのための永続化ストレージアダプター
- Logger: ログ出力ユーティリティ

### インスタンス化

```typescript
import { StyleAnalysisService } from '@/lib/analysis/style-analysis-service';
import { GeminiAdapter } from '@/lib/adapters/gemini-adapter';
import { StorageAdapter } from '@/lib/adapters/storage-adapter';

// アダプターの初期化
const geminiAdapter = new GeminiAdapter(/* 設定 */);
const storageAdapter = new StorageAdapter(/* 設定 */);

// サービスのインスタンス化
const styleAnalysisService = new StyleAnalysisService(geminiAdapter, storageAdapter);

// 初期化（キャッシュのロードなど）
await styleAnalysisService.initialize();
```

## 主要機能

### 1. 文体分析 (`analyzeStyle`)

テキストの文体特性を詳細に分析し、以下の指標を提供します：

- 平均文長
- 文の多様性
- 語彙の豊かさ
- 語りの視点（一人称・三人称など）
- 時制の一貫性
- 感情のバランス

#### 使用例

```typescript
const text = "小説のテキスト内容...";
const styleAnalysis = await styleAnalysisService.analyzeStyle(text);

console.log(`平均文長: ${styleAnalysis.avgSentenceLength}`);
console.log(`文の多様性: ${styleAnalysis.sentenceVariety}`);
console.log(`語彙の豊かさ: ${styleAnalysis.vocabularyRichness}`);
```

### 2. 表現パターン分析 (`analyzeExpressionPatterns`)

テキスト内の表現パターンをカテゴリ別に分析し、出現頻度とともに提供します：

- 動詞フレーズ
- 形容表現
- 会話表現
- 接続語
- 文構造パターン

#### 使用例

```typescript
const text = "小説のテキスト内容...";
const patterns = await styleAnalysisService.analyzeExpressionPatterns(text);

// 動詞フレーズの表示
patterns.verbPhrases.forEach(item => {
  console.log(`表現: ${item.expression}, 頻度: ${item.frequency}`);
});
```

### 3. 主語パターン分析 (`analyzeSubjectPatterns`)

テキスト内の主語使用パターンを分析し、以下の情報を提供します：

- 繰り返し使用されている主語パターン
- 主語の多様性スコア
- 改善提案

#### 使用例

```typescript
const text = "小説のテキスト内容...";
const subjectAnalysis = await styleAnalysisService.analyzeSubjectPatterns(text);

console.log(`主語多様性スコア: ${subjectAnalysis.subjectDiversityScore}`);

// 繰り返しパターンの表示
subjectAnalysis.repeatedSubjects.forEach(pattern => {
  console.log(`主語: ${pattern.subject}, 回数: ${pattern.count}`);
});

// 改善提案の表示
subjectAnalysis.suggestions.forEach(suggestion => {
  console.log(`提案: ${suggestion}`);
});
```

### 4. 表現分析 (`analyzeExpressions`)

テキスト内の特徴的な表現や繰り返し使用されているフレーズを分析し、以下の情報を提供します：

- 新しい表現リスト
- 繰り返し使用されている表現リスト
- 追跡された表現の総数
- 表現の多様性スコア

#### 使用例

```typescript
const text = "小説のテキスト内容...";
const expressionAnalysis = await styleAnalysisService.analyzeExpressions(text);

console.log(`多様性スコア: ${expressionAnalysis.diversityScore}`);
console.log(`追跡表現数: ${expressionAnalysis.totalTracked}`);

// 繰り返し表現の表示
expressionAnalysis.repeatedExpressions.forEach(expression => {
  console.log(`繰り返し表現: ${expression}`);
});
```

## パフォーマンスと最適化

- **キャッシュ機能**: 同一テキストに対する分析結果はキャッシュされ、同じ分析を繰り返し実行することを避けます。キャッシュはデフォルトで1時間有効です。

- **テキスト長に応じた分析レベル**: テキストの長さに応じて、基本的な統計分析のみを行うか、AIを使用した高度な分析も行うかが自動的に切り替わります。
  - 短いテキスト（500文字未満）: 基本的な統計分析のみ
  - 長いテキスト（500文字以上）: AI分析を追加

## エラーハンドリング

各メソッドは分析中にエラーが発生した場合でも、アプリケーションがクラッシュしないように設計されています。エラー発生時には：

1. エラー内容がログに記録されます
2. デフォルト値または部分的な分析結果が返されます

## キャッシュ管理

分析結果は自動的にキャッシュされますが、キャッシュを明示的に管理したい場合は、StorageAdapterの以下のメソッドが利用できます：

- `loadCache<T>(key: string)`: キャッシュからデータを読み込む
- `saveCache<T>(key: string, data: T, ttlMs?: number)`: データをキャッシュに保存する
- `cleanupExpiredCache()`: 期限切れのキャッシュをクリーンアップする

## 注意事項

- 初めて使用する前に必ず `initialize()` メソッドを呼び出してください
- 大量のテキストを一度に分析すると、メモリ使用量が増加する可能性があります
- AIを使用した分析は、短いテキストよりも長いテキストで効果的です

---

この仕様書とインターフェース定義を活用することで、他のエンジニアは StyleAnalysisService を適切に理解し、効果的に利用することができるでしょう。