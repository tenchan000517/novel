# Version 2.0 開発ルール

## 基本原則

### 必須参照ドキュメント
実装前に必ず以下を確認すること：
1. **v2/Version2_完全要件定義書.md** - 12独立システム設計の完全要件
2. **v2/Version2_システム設計書_完全版.md** - 詳細システム設計
3. **v2/Version2_完成形ディレクトリ構造_詳細設計.md** - ディレクトリ構造
4. **v2/Version2_システムコーディングガイド.md** - コーディング規約
5. **v2/PROGRESS_REPORT.md** - 現在の進捗状況

### 進捗報告義務
**すべてのコード実装・修正・削除時に進捗報告書を更新すること**

## 進捗報告更新ルール

### 1. 更新タイミング
- 新しいファイル作成時
- 既存ファイルの重要な修正時  
- ファイル削除時
- システム完成時
- TODO解決時
- 新しいTODO発見時

### 2. 更新内容
以下を必ず記載：
- **実装完了項目**: ✅マークで明記
- **実装中項目**: 🚧マークで現状説明
- **未実装項目**: ❌マークで優先度明記
- **新発見TODO**: 具体的なファイル名と行番号
- **解決済TODO**: 解決した項目の明記
- **技術債務**: 発見した課題や制限事項

### 3. ファイル分割ルール
進捗報告書が**900行を超える**場合は以下の規則で分割：

```
PROGRESS_REPORT.md (メインサマリー・現在の状況)
PROGRESS_REPORT_COMPLETED.md (完了システム詳細)
PROGRESS_REPORT_PENDING.md (未完了システム詳細)
PROGRESS_REPORT_TODOS.md (TODO詳細リスト)
```

### 4. 更新フォーマット
```markdown
## [日付] 更新: [変更概要]

### 実装完了
- [ファイル名]: [実装内容] ✅

### 実装中
- [ファイル名]: [現状と残作業] 🚧

### 新発見TODO
- [ファイル名]:[行番号] - [TODO内容]

### 解決済TODO  
- [ファイル名]:[行番号] - [解決内容] ✅

### 技術債務
- [発見した課題や制限事項]
```

## コーディング規約 (Version2_システムコーディングガイド.md準拠)

### TypeScript厳格ルール
```typescript
// ✅ 良い例
interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: ErrorInfo;
  metadata: OperationMetadata;
}

// ❌ 悪い例  
function process(data: any): any {
  return data;
}
```

### エラーハンドリング統一
```typescript
// 必ずOperationResultパターンを使用
async function operation(): Promise<OperationResult<ResultType>> {
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

### ログ出力統一
```typescript
import { logger } from '@/core/infrastructure/logger';

// システムID設定
logger.setSystemId('system-name');

// 適切なログレベル使用
logger.info('Operation completed successfully');
logger.warn('Potential issue detected');
logger.error('Operation failed:', error);
```

### TODO記載規約
```typescript
// ✅ 良いTODOコメント
// TODO: [優先度] 具体的な実装内容と理由
// TODO: [HIGH] Implement caching mechanism for performance optimization

// ❌ 悪いTODOコメント  
// TODO: fix this
// TODO: 実装
```

TODOを解決した際にコードが著しく冗長的になることが予め予想されるならコンポーネントを最初の段階で分けておくか、リファクタリングを想定した指示を記載すること

### ファイル構造規約
```typescript
/**
 * [ファイルの目的]
 * [機能説明]
 */

// 型インポート（type only）
import type { InterfaceType } from './interfaces';
import type { OperationResult } from '@/types/common';

// 実装インポート
import { logger } from '@/core/infrastructure/logger';

export class ClassName implements InterfaceName {
  private readonly systemId = 'system-name';
  
  constructor() {
    logger.setSystemId(this.systemId);
  }
  
  // パブリックメソッド
  async publicMethod(): Promise<OperationResult<Type>> {
    // 実装
  }
  
  // プライベートメソッド（下部配置）
  private privateMethod(): Type {
    // 実装
  }
}
```

## 12独立システム設計原則

### システム独立性
- 各システムは独立したディレクトリ
- システム間の直接依存を避ける
- 通信はインターフェース経由のみ

### サービスコンテナ統合
```typescript
// 将来的な統合パターン
export class SystemFactory {
  static createManager(): ISystemManager {
    return new SystemManager();
  }
}
```

### イベント駆動アーキテクチャ対応
```typescript
// イベント発行準備
interface SystemEvent {
  type: string;
  source: string;
  data: any;
  timestamp: Date;
}
```

## 品質保証ルール

### 実装前チェックリスト
- [ ] 要件定義書確認済み
- [ ] 設計書確認済み
- [ ] 既存コード影響確認済み
- [ ] 型安全性確保済み
- [ ] エラーハンドリング実装済み

### 実装後チェックリスト
- [ ] 進捗報告書更新済み
- [ ] TODOコメント適切に記載
- [ ] ログ出力実装済み
- [ ] TypeScript型チェック通過
- [ ] インターフェース準拠確認済み

## 禁止事項

### 絶対禁止
- `any`型の無制限使用
- エラーハンドリング省略
- 進捗報告書更新忘れ
- 要件定義からの逸脱
- システム間の直接依存

### 要注意事項
- パフォーマンス影響の大きい実装
- 大量のTODO放置
- 型安全性を損なう実装
- 非同期処理の不適切な扱い

## 緊急時対応

### 実装エラー時
1. 即座にエラー内容を進捗報告書に記載
2. 原因分析をTODOとして記録
3. 代替実装案を検討・記録

### 設計変更必要時
1. 要件定義書との整合性確認
2. 影響範囲の詳細分析
3. 変更内容の進捗報告書記載

## まとめ

**この開発ルールの遵守により**：
- Version 2.0要件の100%実現
- 高品質なコード保持
- 開発進捗の完全可視化
- 将来の保守性確保

**違反時のリスク**：
- 要件定義からの逸脱
- システム統合時の不具合
- 保守困難なコード生成
- 進捗把握不能

---

**重要**: このルールは Version 2.0 の12独立システム設計の成功に不可欠です。