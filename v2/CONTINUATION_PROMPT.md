# Version 2.0 開発継続用プロンプト

## コンテキストリフレッシュ後の開発継続時に使用

以下をそのままコピーして新しいセッションで使用してください：

---

**プロンプト開始**

# Novel Automation System Version 2.0 開発継続

## 現在の状況
Version 2.0の12独立システム設計による実装を継続します。**TypeScript strict mode対応完了**により、高品質な実装フェーズに移行しました。

## 必須確認事項
実装前に必ず以下を確認してください：

### 1. 設計文書の確認
```
v2/Version2_完全要件定義書.md - 12独立システム設計の完全要件
v2/Version2_システム設計書_完全版.md - 詳細システム設計とクラス構造  
v2/Version2_完成形ディレクトリ構造_詳細設計.md - ディレクトリ構造仕様
v2/Version2_システムコーディングガイド.md - コーディング規約
```

### 2. 進捗状況の確認
```
v2/PROGRESS_REPORT_NEW.md - 最新進捗報告書（87%完成）
v2/DEVELOPMENT_RULES.md - 開発ルール（進捗更新義務含む）
```

### 3. TODOリストの確認
TodoRead tool を使用して現在のタスク状況を確認

## 重要な技術的成果

### ✅ TypeScript strict mode完全対応済み
- 全システムコンパイルエラー解決完了
- 型安全性100%確保
- 開発効率大幅向上

### ✅ システム統合基盤完成
- サービスコンテナ実装済み
- 統合AIクライアント実装済み
- データ協調システム実装済み

## 実装ルール（厳格遵守）

### TypeScript厳格ルール
- `any`型の使用は最小限（型定義未完成部分のみ）
- 完全型安全性確保
- OperationResultパターン統一使用

### エラーハンドリング統一
```typescript
async function operation(): Promise<OperationResult<T>> {
  const startTime = Date.now();
  try {
    // 実装
    return {
      success: true,
      data: result,
      metadata: {
        operationId: generateId(),
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        systemId: this.systemId
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'ERROR_CODE',
        message: 'Error message',
        details: error
      },
      metadata: { /* metadata */ }
    };
  }
}
```

### 進捗報告更新義務
**すべてのコード実装・修正時に v2/PROGRESS_REPORT_NEW.md を更新すること**
- 実装完了: ✅、部分実装: 🚧、未実装: ❌で明記
- 重要な技術的決定を記録
- マイルストーン達成時は特記

## 現在の優先タスク

### 最高優先度（フェーズ1: システム詳細実装）
1. **Theme System詳細実装** 🟡
   - systems/theme/core/theme-manager.ts の詳細実装
   - テーマ分析エンジン実装
   - テーマ一貫性管理機能

2. **Expression System詳細実装** 🟡
   - systems/expression/core/expression-manager.ts の詳細実装
   - 表現パターン分析機能
   - 文体最適化エンジン

3. **Foreshadowing System詳細実装** 🟡
   - systems/foreshadowing/core/foreshadowing-manager.ts の詳細実装
   - 伏線管理エンジン
   - 自動伏線生成機能

4. **Genre System詳細実装** 🟡
   - systems/genre/core/genre-manager.ts の詳細実装
   - ジャンル特化機能
   - ジャンル制約管理

### 中優先度（フェーズ2: 品質向上）
1. **テスト実装** 🟡
2. **パフォーマンス最適化** 🟢
3. **ドキュメント完成** 🟢

## 完了済みシステム（87%進捗）

### ✅ Core Infrastructure（完成）
- core/infrastructure/ - ログ・メトリクス・設定管理
- core/ai-client/ - 統合AIクライアント
- core/container/ - サービスコンテナ
- core/lifecycle/ - アプリケーションライフサイクル

### ✅ Core Systems（完成）  
- systems/memory/ - 3層記憶管理システム
- systems/character/ - キャラクター管理（MBTI統合）
- systems/learning/ - 学習旅程システム
- systems/plot/ - プロット管理システム
- systems/world/ - 世界観管理システム
- systems/analysis/ - 分析システム
- systems/configuration/ - 設定管理システム

### ✅ Generation Systems（完成）
- generation/context/ - コンテキスト生成
- generation/chapter/ - チャプター生成
- generation/prompt/ - プロンプト生成

## 部分実装システム（詳細実装必要）
🚧 **Theme/Expression/Foreshadowing/Genre Systems** - 基本構造のみ実装済み

## 禁止事項
- 要件定義からの逸脱
- TypeScript strict mode違反
- 進捗報告書更新忘れ
- テスト未実装での完了宣言

## 成功条件
- 全23システムの100%実装完了
- TypeScript厳格ルール完全準拠
- 高品質小説生成の実現
- 完全な進捗可視化維持

## 重要な技術的決定事項
1. **TypeScript strict mode採用** - 型安全性確保
2. **サービスコンテナパターン** - 依存性管理
3. **統合AIクライアント** - マルチプロバイダー対応
4. **データ協調システム** - 全システム統合

実装を開始する前に上記ドキュメントを確認し、TodoRead でタスク状況を把握してから作業を開始してください。

**プロンプト終了**

---

## 使用方法

1. 新しいセッション開始時に上記プロンプトをコピー
2. 必須確認事項の各ファイルを Read tool で確認
3. TodoRead で現在のタスク状況確認
4. **Phase 1優先タスク**から実装開始
5. 実装後は必ず v2/PROGRESS_REPORT_NEW.md 更新

## 注意事項

- **87%完成**の高い進捗状況を維持
- TypeScript strict mode対応完了の技術的アドバンテージを活用
- 残り4システムの詳細実装で100%達成
- 品質基準を維持しながら効率的に完成を目指す