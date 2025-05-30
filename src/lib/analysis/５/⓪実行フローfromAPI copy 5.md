# ChapterAnalysisService 完成ガイド

## 概要

`ChapterAnalysisService`は章の構造、内容、パターンの詳細分析を担当するサービスです。このプロンプトは、他の分析サービスとの重複を避けながら正しく実装を完成させるためのガイドラインです。

## 責任範囲と設計原則

ChapterAnalysisServiceは**単一の章**の分析に特化し、以下の原則に従います：

1. **章単位の分析** - 一つの章のみを分析対象とする
2. **基本的な構造解析** - シーン、キャラクター出現、基本的なテーマ、伏線、品質の分析
3. **他サービスとの協調** - 高度な分析は専門サービスに委譲
4. **キャッシング** - パフォーマンス向上のための結果キャッシング

## 実装すべき主要機能

```typescript
export interface IChapterAnalysisService {
  // 主要分析関数
  analyzeChapter(content: string, chapterNumber: number, context: GenerationContext): Promise<ChapterAnalysis>;
  
  // 個別機能（部分的な分析が必要な場合）
  getQualityMetrics(content: string, chapterNumber: number, context: GenerationContext): Promise<QualityMetrics>;
  getScenes(content: string, chapterNumber: number): Promise<Scene[]>;
  getCharacterAppearances(content: string, chapterNumber: number, context: GenerationContext): Promise<CharacterAppearance[]>;
  extractKeywords(content: string): Promise<string[]>;
}
```

## 実装ステップ

1. **既存の実装のレビュー**
   - 現在の `chapter-analysis-service.ts` が基本的な機能を提供
   - 移行元の `chapter-analyzer.ts` から追加機能を抽出

2. **不足機能の実装**
   - `extractKeywords` メソッドを追加実装
   - `analyzeTextStatistics` 機能の拡充

3. **インターフェース整備**
   - `interfaces.ts` に完全なインターフェース定義を追加

4. **他サービスとの境界整理**
   - 重複する機能を識別して適切に委譲

## 詳細実装ガイド

### 1. プロパティと初期化

```typescript
export class ChapterAnalysisService implements IChapterAnalysisService {
  // キャッシュ
  private cacheStore: Map<string, ChapterAnalysis> = new Map();
  
  /**
   * コンストラクタ
   * 
   * 依存関係の注入を通じて、必要なサービスを受け取ります。
   * 
   * @param {GeminiAdapter} geminiAdapter AI生成・分析用アダプター
   */
  constructor(private geminiAdapter: GeminiAdapter) {
    logger.info('ChapterAnalysisService initialized');
  }
  
  // 以下、メソッド実装
}
```

### 2. キーワード抽出機能の追加

この機能は現在の実装に追加が必要です。以下のように実装してください：

```typescript
/**
 * 章のキーワードを抽出
 * 章の内容から重要なキーワードを抽出します。
 * 
 * @param {string} content 章の内容
 * @returns {Promise<string[]>} キーワード配列
 */
async extractKeywords(content: string): Promise<string[]> {
  const keywordPrompt = `
以下の小説の章から重要なキーワードを抽出してください：

${content.substring(0, 8000)}

以下のカテゴリに分類して、JSONで出力してください：
- characters: 登場人物の名前
- locations: 場所
- objects: 重要なオブジェクト
- concepts: 重要な概念
- events: 重要なイベント

JSON形式:
{
  "characters": ["名前1", "名前2"],
  "locations": ["場所1", "場所2"],
  "objects": ["オブジェクト1", "オブジェクト2"],
  "concepts": ["概念1", "概念2"],
  "events": ["イベント1", "イベント2"]
}`;

  try {
    // APIスロットリングを使用してキーワード抽出を実行
    const keywordResponse = await apiThrottler.throttledRequest(() =>
      this.geminiAdapter.generateText(keywordPrompt, {
        temperature: 0.2,
        purpose: 'analysis',
        responseFormat: 'json'
      })
    );

    // レスポンスの解析
    const parsedKeywords = JsonParser.parseFromAIResponse<{
      characters: string[];
      locations: string[];
      objects: string[];
      concepts: string[];
      events: string[];
    }>(keywordResponse, {
      characters: [],
      locations: [],
      objects: [],
      concepts: [],
      events: []
    });

    // すべてのカテゴリを結合
    const allKeywords = [
      ...(parsedKeywords.characters || []),
      ...(parsedKeywords.locations || []),
      ...(parsedKeywords.objects || []),
      ...(parsedKeywords.concepts || []),
      ...(parsedKeywords.events || [])
    ];

    // 重複を除去
    return [...new Set(allKeywords)];
  } catch (error) {
    logger.warn(`Keyword extraction failed`, {
      error: error instanceof Error ? error.message : String(error)
    });
    return [];
  }
}
```

### 3. 移行すべきでない機能

以下の機能は他のサービスが担当するため、ChapterAnalysisServiceに実装しないでください：

- **テーマ共鳴分析** (`analyzeThemeResonance`) - ThemeAnalysisServiceが担当
- **キャラクター心理分析** (`analyzeCharacterPsychologies`) - CharacterAnalysisServiceが担当
- **テンション分析** (`analyzeTension`) - NarrativeAnalysisServiceが担当
- **読者体験分析** (`analyzeReaderExperience`) - NarrativeAnalysisServiceが担当
- **伏線と重要イベントの記録管理** - MemoryManagerと連携する機能は別途実装

## 各サービスとの関係

ChapterAnalysisServiceは以下のサービスと協調して動作します：

1. **ThemeAnalysisService** - テーマや伏線の深い分析を担当
   - `ChapterAnalysisService`：テーマの基本的な検出
   - `ThemeAnalysisService`：テーマの共鳴分析、発展分析

2. **StyleAnalysisService** - 文体や表現パターンの分析
   - `ChapterAnalysisService`：テキスト統計（文長、段落数等）
   - `StyleAnalysisService`：詳細な文体分析、表現パターン分析

3. **NarrativeAnalysisService** - 物語構造とフローの分析
   - `ChapterAnalysisService`：単一章のシーン分析
   - `NarrativeAnalysisService`：複数章にまたがるアーク、テンション分析

4. **CharacterAnalysisService** - キャラクター分析
   - `ChapterAnalysisService`：章内でのキャラクター出現分析
   - `CharacterAnalysisService`：キャラクターの心理・発展分析

## コード整備ガイドライン

1. **コメント**
   - JSDocスタイルのコメントを各メソッドに追加
   - 特に他サービスに委譲する部分は明確にコメント

2. **エラーハンドリング**
   - すべての非同期操作に適切なtry-catchブロックを実装
   - エラー時はフォールバック値を返すよう実装

3. **キャッシング**
   - 高コスト操作には適切なキャッシング戦略を実装
   - キャッシュキーは内容ハッシュと章番号に基づいて生成

4. **テスト**
   - 各メソッドの単体テストを実装
   - 他サービスとの連携テストも考慮

## 注意点と避けるべき問題

1. **メモリ管理**
   - 大きなテキスト処理時はメモリ使用量に注意
   - 必要に応じてテキストを適切な長さにトランケーション

2. **API使用量**
   - APIスロットリングを常に使用（`apiThrottler.throttledRequest`）
   - 不必要なAPI呼び出しを避ける

3. **サービス間の循環依存**
   - 他サービスへの直接依存は避け、必要に応じてイベントベースの通信を検討

4. **重複コード**
   - 共通ユーティリティ関数は専用モジュールに抽出
   - 既存のユーティリティ（JsonParser, apiThrottler等）を活用

この実装ガイドに従って、ChapterAnalysisServiceを完成させてください。既存の実装と移行元のコードを参考にしながら、重複を避け、明確な責任範囲を持つサービスを構築してください。