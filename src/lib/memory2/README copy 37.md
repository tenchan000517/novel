# 記憶階層システム完全仕様書作成に必要なファイル・情報一覧

## 🚨 CRITICAL: 即座に必要なファイル

### 1. **新記憶階層システムの実装ファイル**
```
src/lib/memory copy/
├── core/
│   ├── memory-manager.ts ⭐ REQUIRED
│   ├── types.ts ⭐ REQUIRED  
│   ├── interfaces.ts ⭐ REQUIRED
│   ├── unified-access-api.ts ⭐ REQUIRED
│   └── data-integration-processor.ts ⭐ REQUIRED
├── integration/
│   ├── cache-coordinator.ts ⭐ REQUIRED
│   ├── duplicate-resolver.ts ⭐ REQUIRED
│   ├── access-optimizer.ts ⭐ REQUIRED
│   └── quality-assurance.ts ⭐ REQUIRED
├── short-term/
│   └── short-term-memory.ts ⭐ REQUIRED
├── mid-term/
│   └── mid-term-memory.ts ⭐ REQUIRED
└── long-term/
    └── long-term-memory.ts ⭐ REQUIRED
```

### 2. **旧システムの廃止対象ファイル（移行マップ作成用）**
```
src/lib/memory/
├── world-knowledge.ts ❌ 廃止予定
├── narrative-memory.ts ❌ 廃止予定  
├── event-memory.ts ❌ 廃止予定
├── character-memory.ts ❌ 廃止予定
└── [その他の廃止対象ファイル] ❌ 調査必要
```

### 3. **既存コンポーネントファイル（移行対象）**
```
src/components/
├── character-manager.ts 🔄 移行対象
├── plot-manager.ts 🔄 移行対象
├── context-generator.ts 🔄 移行対象
├── prompt-generator.ts 🔄 移行対象
├── chapter-generator.ts 🔄 移行対象
└── analysis/
    ├── [分析系コンポーネント全て] 🔄 移行対象
    └── [各種分析サービス] 🔄 移行対象
```

---

## 🔧 HIGH PRIORITY: 設定・データ構造ファイル

### 4. **設定ファイル群**
```
src/config/
├── memory-config.ts ⭐ 必要
├── system-config.ts ⭐ 必要
└── [記憶階層関連の設定ファイル] ⭐ 必要
```

### 5. **型定義・インターフェースファイル**
```
src/types/
├── memory-types.ts ⭐ 必要
├── chapter-types.ts ⭐ 必要
├── character-types.ts ⭐ 必要
├── analysis-types.ts ⭐ 必要
└── system-types.ts ⭐ 必要
```

### 6. **既存データ構造サンプル**
- 現在保存されている章データの例
- キャラクターデータの例  
- 分析結果データの例
- 世界設定データの例
- 進行状況データの例

---

## 📊 MEDIUM PRIORITY: 使用実態調査ファイル

### 7. **現在のコンポーネント使用状況**
各コンポーネントでの記憶システム使用箇所：

```
src/components/character-manager.ts
├── どこで WorldKnowledge を使用しているか？
├── どこで NarrativeMemory を使用しているか？
├── どこで EventMemory を使用しているか？
└── どのメソッドが記憶システムに依存しているか？
```

類似調査が必要なファイル：
- `prompt-generator.ts`
- `context-generator.ts`  
- `chapter-generator.ts`
- `plot-manager.ts`
- 全ての分析系コンポーネント

### 8. **テストファイル（既存の使用パターン確認用）**
```
src/tests/
├── character-manager.test.ts 📋 参考用
├── context-generator.test.ts 📋 参考用
├── memory-*.test.ts 📋 参考用
└── integration.test.ts 📋 参考用
```

### 9. **ログファイル・エラーレポート**
- 現在の記憶システムで発生しているエラー
- パフォーマンス問題のログ
- 重複処理に関する問題のログ

---

## 🔄 LOW PRIORITY: 拡張・最適化情報

### 10. **package.json / 依存関係**
```json
{
  "dependencies": {
    // 記憶システムで使用する外部ライブラリ
  }
}
```

### 11. **デプロイ・環境設定**
```
deployment/
├── production.env
├── development.env
└── staging.env
```

### 12. **ドキュメント・コメント**
- 既存の設計ドキュメント
- アーキテクチャ図
- データフロー図

---

## 🚨 BLOCKING: 重要な調査項目

### 13. **システム使用状況の詳細調査**

#### A. **重複解決対象の特定**
以下の重複がどこで発生しているか調査必要：
- 世界設定4箇所重複 → 具体的なファイル名・行番号
- キャラクター情報2箇所重複 → 具体的なファイル名・行番号  
- 記憶アクセス3箇所分散 → 具体的なファイル名・行番号
- ジャンル設定6箇所重複 → 具体的なファイル名・行番号

#### B. **データ救済対象コンポーネントの詳細**
```typescript
// 各コンポーネントで以下を調査：
class ComponentName {
  // 1. どんなデータを保存しているか？
  // 2. データの更新頻度は？
  // 3. データのサイズは？
  // 4. 他のコンポーネントとの依存関係は？
}
```

対象コンポーネント：
- PromptGenerator
- DynamicTensionOptimizer  
- ContextGenerator
- EmotionalArcDesigner
- StorageDiagnosticManager
- NarrativeAnalysisService
- DetectionService
- CharacterChangeHandler
- EventBus系コンポーネント
- PreGenerationPipeline
- PostGenerationPipeline
- TextAnalyzerService

#### C. **現在のインスタンス管理方法**
- シングルトンパターンの使用状況
- Dependency Injectionの実装状況
- コンポーネント間の初期化順序

### 14. **パフォーマンス要件**
- 現在の処理時間ベンチマーク
- メモリ使用量の測定結果
- 同時利用者数の想定

### 15. **データ互換性**
- 既存の保存データフォーマット
- データベーススキーマ（使用している場合）
- ファイル保存形式

---

## 📋 必要な実行手順

### Phase 1: ファイル収集（即座実行）
1. 新記憶階層システム実装ファイル12個の提供
2. 旧システム廃止対象ファイルの特定・提供
3. 主要コンポーネントファイル6-10個の提供

### Phase 2: 使用状況調査（1週間）
4. 各コンポーネントでの記憶システム使用箇所の調査
5. 重複処理の具体的な場所の特定
6. 現在のエラー・問題点の整理

### Phase 3: データ構造調査（1週間）  
7. 現在保存されているデータサンプルの収集
8. データ形式・構造の分析
9. 移行方法の策定

### Phase 4: 統合仕様書作成（1週間）
10. 完全な移行マップの作成
11. 各コンポーネント別の詳細な移行手順書作成
12. エラーハンドリング・テスト手順の整備

---

## 🎯 最も緊急性の高い項目 TOP 5

### 1. **memory-manager.ts** ⭐⭐⭐
新システムの中核となるファイル

### 2. **types.ts + interfaces.ts** ⭐⭐⭐  
型定義がないと何も進められない

### 3. **character-manager.ts 使用状況調査** ⭐⭐⭐
最も複雑な移行が予想される

### 4. **旧システム廃止対象ファイル一覧** ⭐⭐
何が廃止されるかが不明確

### 5. **現在のデータサンプル** ⭐⭐  
データ移行方法の策定に必要

---

## 💡 推奨アプローチ

### 段階的ファイル提供
1. **第1段階**: Top 5の緊急ファイル
2. **第2段階**: 統合コンポーネント群
3. **第3段階**: 使用状況調査結果
4. **第4段階**: 詳細設定・テストファイル

### 調査支援ツールの活用
- `grep -r "WorldKnowledge" src/` でコードベース内の使用箇所検索
- `grep -r "NarrativeMemory" src/` で依存関係調査
- `find src/ -name "*.ts" -exec grep -l "memory" {} \;` で関連ファイル発見

---

この一覧に従ってファイル・情報を収集していただければ、開発者が混乱しない**完全な仕様書**を作成できます。

特に **Top 5の緊急項目** は直ちに必要です。これらがあれば、基本的な移行作業を開始できる仕様書を作成できます。