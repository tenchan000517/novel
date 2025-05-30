# 小説生成API - 連携フロー詳細

## 1. システム概要と主要コンポーネント

このAPIは、AIを用いた小説の新しい章を生成し、システム状態確認とパラメータ更新機能を提供します。`src\app\api\generation\chapter\route.ts`に実装され、以下のコンポーネントと連携します：

### 1.1 コンポーネント詳細

#### GenerationEngine
- **インポート方法**: `import { generationEngine } from '@/lib/generation/engine';`
- **インスタンス化**: シングルトン（インポート済み）
- **主な役割**: 章の生成を実行
- **呼び出される関数**:
  - `generateChapter(chapterNumber, requestData)`
    - **引数**: 
      - `chapterNumber`: number（1以上の整数）
      - `requestData`: GenerateChapterRequest（targetLength, forcedGeneration, overrides等）
    - **戻り値**: 章オブジェクト（Chapterインスタンス）
    - **データ連携先**: 
      - ValidationSystemへ検証用に渡される
      - MemoryManagerへ記憶処理用に渡される
      - ChapterStorageへ保存用に渡される
      - レスポンスに含まれる
    - **呼び出しタイミング**: POST処理時（章生成時）
  - `checkStatus()`
    - **引数**: なし
    - **戻り値**: `{ apiKeyValid: boolean, modelInfo: { model: string, maxRetries: number } }`
    - **データ連携先**: レスポンスのgeneration部分に使用
    - **呼び出しタイミング**: GET処理時（状態確認時）

#### ValidationSystem
- **インポート方法**: `import { ValidationSystem } from '@/lib/validation/system';`
- **インスタンス化**: 直接インスタンス化 `const validationSystem = new ValidationSystem();`
- **主な役割**: 章の品質検証
- **呼び出される関数**:
  - `setValidationParameters(params)`
    - **引数**: `params`: { consistencyThreshold: number, minLength: number, maxLength: number }
    - **戻り値**: なし
    - **データ連携先**: 内部状態の変更のみ
    - **呼び出しタイミング**: 品質検証前（POST処理中）
  - `validateChapter(chapter)`
    - **引数**: `chapter`: 章オブジェクト（GenerationEngineで生成）
    - **戻り値**: `{ isValid: boolean, qualityScore: number, checks: ValidationCheck[] }`
    - **データ連携先**: 
      - 章の品質判定（条件分岐）に使用
      - 章メタデータに品質スコア追加
      - レスポンスのmetrics.qualityScoreとして使用
    - **呼び出しタイミング**: 章生成後（POST処理中）

#### MemoryManager
- **インポート方法**: `import { memoryManager } from '@/lib/memory/manager';`
- **インスタンス化**: シングルトン（インポート済み）
- **主な役割**: 物語の一貫性維持
- **呼び出される関数**:
  - `processChapter(chapter)`
    - **引数**: `chapter`: 章オブジェクト（検証済み）
    - **戻り値**: なし（または`Promise<void>`）
    - **データ連携先**: 内部的に記憶システムを更新
    - **呼び出しタイミング**: 品質検証後（POST処理中）
  - `getStatus()`
    - **引数**: なし
    - **戻り値**: メモリシステムの状態オブジェクト（詳細構造はコード外）
    - **データ連携先**: レスポンスのmemory部分に使用
    - **呼び出しタイミング**: GET処理時（状態確認時）

#### ParameterManager
- **インポート方法**: `import { parameterManager } from '@/lib/parameters';`
- **インスタンス化**: シングルトン（インポート済み）
- **主な役割**: 設定パラメータ管理
- **呼び出される関数**:
  - `initialize()`
    - **引数**: なし
    - **戻り値**: `Promise<void>`
    - **データ連携先**: 内部的に設定を読み込み初期化
    - **呼び出しタイミング**: 各HTTP処理（POST/GET/PUT）の最初
  - `getParameters()`
    - **引数**: なし
    - **戻り値**: システム設定パラメータ（generation.targetLength等を含む）
    - **データ連携先**: 
      - 入力パラメータのバリデーション
      - ValidationSystemのパラメータ設定
      - レスポンスデータに含まれる
    - **呼び出しタイミング**: 初期化後
  - `updateParameter(path, value)`
    - **引数**: 
      - `path`: string（パラメータパス）
      - `value`: any（設定値）
    - **戻り値**: なし
    - **データ連携先**: 内部設定の更新
    - **呼び出しタイミング**: PUT処理（updateParameter時）
  - `applyPreset(presetName)`
    - **引数**: `presetName`: string
    - **戻り値**: boolean（成功/失敗）
    - **データ連携先**: 内部設定の一括更新
    - **呼び出しタイミング**: PUT処理（applyPreset時）
  - `saveAsPreset(presetName, description)`
    - **引数**: 
      - `presetName`: string
      - `description`: string
    - **戻り値**: boolean（成功/失敗）
    - **データ連携先**: 新しいプリセットの保存
    - **呼び出しタイミング**: PUT処理（savePreset時）
  - `resetToDefaults()`
    - **引数**: なし
    - **戻り値**: なし
    - **データ連携先**: 内部設定をデフォルト値に戻す
    - **呼び出しタイミング**: PUT処理（resetToDefaults時）
  - `getPresetDetails?()`
    - **引数**: なし
    - **戻り値**: プリセット情報配列（存在する場合のみ）
    - **データ連携先**: レスポンスのパラメータ情報に使用
    - **呼び出しタイミング**: GET処理とPUT処理（savePreset時）

#### ChapterStorage
- **インポート方法**: `import { chapterStorage } from '@/lib/storage';`
- **インスタンス化**: シングルトン（インポート済み）
- **主な役割**: 章データの保存と取得
- **呼び出される関数**:
  - `chapterExists(chapterNumber)`
    - **引数**: `chapterNumber`: number
    - **戻り値**: `Promise<boolean>`（章が存在するか）
    - **データ連携先**: 章重複チェックの条件分岐に使用
    - **呼び出しタイミング**: 章生成前（POST処理中）
  - `saveChapter(chapter)`
    - **引数**: `chapter`: 処理済み章オブジェクト
    - **戻り値**: `Promise<string>`（保存されたファイルパス）
    - **データ連携先**: ログ記録に使用（保存結果）
    - **呼び出しタイミング**: 記憶処理後（POST処理中）
  - `getLatestChapterNumber()`
    - **引数**: なし
    - **戻り値**: `Promise<number>`（最新章番号）
    - **データ連携先**: レスポンスのchapters情報に使用
    - **呼び出しタイミング**: GET処理時（状態確認時）
  - `listAllChapters()`
    - **引数**: なし
    - **戻り値**: `Promise<Array>`（章情報配列）
    - **データ連携先**: レスポンスのchaptersList情報に使用
    - **呼び出しタイミング**: GET処理時（状態確認時）

#### PlotManager
- **インポート方法**: `import { plotManager } from '@/lib/plot';`
- **インスタンス化**: シングルトン（インポート済み）
- **主な役割**: 物語構造の管理
- **呼び出される関数**:
  - `buildPlotContext(chapterNumber)`
    - **引数**: `chapterNumber`: number
    - **戻り値**: プロットコンテキスト（currentArc, shortTermGoals等を含む）
    - **データ連携先**: 
      - 現在と次章のコンテキストを取得
      - plotInfo構築に使用
      - レスポンスに含まれる
    - **呼び出しタイミング**: 記憶処理後（POST処理中）

## 2. エンドポイントと処理フロー

このAPIは3つのHTTPメソッドを提供します：

### 2.1 POST - 章生成 (`/api/generation/chapter?chapterNumber={number}`)

```
┌─────────────────────────────┐
│ POST(request: NextRequest)  │◄── クライアントからのリクエスト
└───────────────┬─────────────┘
                │
                ▼
┌─────────────────────────────┐
│ initializeParameterManager()│ → parameterManager.initialize()
└───────────────┬─────────────┘
                │
                ▼
┌─────────────────────────────┐
│ parameterManager.           │ → システム設定パラメータを取得
│ getParameters()             │
└───────────────┬─────────────┘
                │
                ▼
┌─────────────────────────────┐
│ リクエスト解析・検証         │ → リクエスト解析、パラメータ検証、
│                             │   章の重複チェック(chapterStorage.chapterExists)
└───────────────┬─────────────┘
                │
                ▼
┌─────────────────────────────┐
│ generationEngine.           │ → 章を生成
│ generateChapter(            │   AIモデルを使用して章コンテンツを作成
│   chapterNumber, requestData│
│ )                           │
└───────────────┬─────────────┘
                │
                ▼
┌─────────────────────────────┐
│ 品質検証プロセス             │ → validationSystem.setValidationParameters
│                             │   validationSystem.validateChapter
│                             │   検証失敗時(isValid=false)は条件付きでエラー
└───────────────┬─────────────┘
                │
                ▼
┌─────────────────────────────┐
│ chapter.metadata.           │ → 章のメタデータに品質スコアを設定
│ qualityScore =              │
│ validation.qualityScore     │
└───────────────┬─────────────┘
                │
                ▼
┌─────────────────────────────┐
│ 記憶・プロット・保存処理      │ → memoryManager.processChapter
│                             │   plotManager.buildPlotContext(現在と次章)
│                             │   プロット情報構築、chapterStorage.saveChapter
└───────────────┬─────────────┘
                │
                ▼
┌─────────────────────────────┐
│ レスポンス構築と返却         │ → 生成時間計算、ログ記録
│                             │   response = {chapter, metrics, plotInfo}
│                             │   NextResponse.json()でJSONレスポンス返却
└─────────────────────────────┘
```

### 2.2 GET - システム状態確認 (`/api/generation/chapter`)

```
┌─────────────────────────────┐
│ GET(request: NextRequest)   │◄── クライアントからのリクエスト
└───────────────┬─────────────┘
                │
                ▼
┌─────────────────────────────┐
│ 初期化と状態情報取得         │ → parameterManager.initialize()
│                             │   generationEngine.checkStatus()
│                             │   memoryManager.getStatus()
│                             │   parameterManager.getParameters()
│                             │   parameterManager.getPresetDetails?()
└───────────────┬─────────────┘
                │
                ▼
┌─────────────────────────────┐
│ 章情報取得                   │ → chapterStorage.getLatestChapterNumber()
│                             │   chapterStorage.listAllChapters()
└───────────────┬─────────────┘
                │
                ▼
┌─────────────────────────────┐
│ レスポンス構築と返却         │ → ログ記録
│                             │   NextResponse.json()で各コンポーネントの
│                             │   状態情報を含むJSONレスポンスを返却
└─────────────────────────────┘
```

### 2.3 PUT - パラメータ更新 (`/api/generation/chapter`)

```
┌─────────────────────────────┐
│ PUT(request: NextRequest)   │◄── クライアントからのリクエスト
└───────────────┬─────────────┘
                │
                ▼
┌─────────────────────────────┐
│ 初期化とリクエスト解析       │ → parameterManager.initialize()
│                             │   request.json()、actionを検証
└───────────────┬─────────────┘
                │
                ▼
                │
    ┌───────────┼───────────┬───────────────┬───────────────┐
    │           │           │               │               │
    ▼           ▼           ▼               ▼               ▼
┌─────────┐ ┌─────────┐ ┌─────────┐    ┌─────────┐    ┌─────────┐
│update   │ │apply    │ │save     │    │resetTo  │    │その他   │
│Parameter│ │Preset   │ │Preset   │    │Defaults │    │         │
└────┬────┘ └────┬────┘ └────┬────┘    └────┬────┘    └────┬────┘
     │          │          │              │              │
     ▼          ▼          ▼              ▼              ▼
┌─────────┐ ┌─────────┐ ┌─────────┐    ┌─────────┐    ┌─────────┐
│パラメータ│ │プリセット│ │プリセット│    │デフォルト│    │エラー処理│
│更新処理 │ │適用処理 │ │保存処理 │    │リセット │    │         │
└────┬────┘ └────┬────┘ └────┬────┘    └────┬────┘    └─────────┘
     │          │          │              │
     │          │          │              │
     └──────────┴──────────┴──────────────┘
                │
                ▼
┌─────────────────────────────┐
│ レスポンス構築と返却         │ → 更新結果を含むJSONレスポンスを返却
└─────────────────────────────┘
```

## 3. リクエスト/レスポンス仕様

### 3.1 POST - 章生成

**リクエスト**:
- URL: `/api/generation/chapter?chapterNumber={number}`
- ボディ: `{ targetLength: number, forcedGeneration: boolean, overrides: { tension?: number, pacing?: number } }`

**レスポンス**:
- 成功(200): `{ success: true, data: { chapter: {...}, metrics: {...}, plotInfo: {...} } }`
- バリデーションエラー(400): `{ success: false, error: { code: "VALIDATION_ERROR", message: "..." } }`
- 品質検証失敗(400): `{ success: false, error: { code: "VALIDATION_FAILED", message: "...", details: {...} } }`
- 生成エラー(500): `{ success: false, error: { code: "GENERATION_ERROR", message: "..." } }`

### 3.2 GET - システム状態確認

**リクエスト**:
- URL: `/api/generation/chapter`

**レスポンス**:
- 成功(200): `{ success: true, data: { generation: {...}, memory: {...}, chapters: {...}, parameters: {...} } }`
- エラー(500): `{ success: false, error: { code: "STATUS_ERROR", message: "..." } }`

### 3.3 PUT - パラメータ更新

**リクエスト**:
- URL: `/api/generation/chapter`
- ボディ (4種):
  1. `{ action: "updateParameter", path: string, value: any }`
  2. `{ action: "applyPreset", presetName: string }`
  3. `{ action: "savePreset", presetName: string, description?: string }`
  4. `{ action: "resetToDefaults" }`

**レスポンス**:
- 成功(200): `{ success: true, data: { message: "...", updatedParameters/availablePresets/parameters: {...} } }`
- エラー(400/500): `{ success: false, error: { code: "VALIDATION_ERROR"/"ERROR", message: "..." } }`

## 4. エラー処理とロギング

### 4.1 エラータイプと処理

| エラータイプ | HTTPステータス | 発生条件 | 処理 |
|------------|---------------|---------|------|
| ValidationError | 400 | パラメータ検証失敗、重複章 | logger.warn() + エラーレスポンス |
| VALIDATION_FAILED | 400 | 章の品質検証失敗 | logger.warn() + エラーレスポンス(詳細付き) |
| GenerationError | 500 | 章生成処理エラー | logger.warn() + エラーレスポンス |
| STATUS_ERROR | 500 | 状態取得エラー | logger.error() + エラーレスポンス |
| その他 | 500 | 未分類エラー | logger.error() + エラーレスポンス |

### 4.2 主要ロギングポイント

APIは以下のポイントで各レベルのログを記録します:

**情報ログ (info)**:
- リクエスト受信/完了時
- 各処理段階開始時 (生成、検証、記憶更新、保存等)
- パラメータ操作時 (更新、プリセット適用等)

**警告ログ (warn)**:
- パラメータ検証エラー時
- 章の重複/検証失敗時
- 初期化失敗時、生成プロセスエラー時

**エラーログ (error)**:
- 章生成失敗時
- システム状態取得/パラメータ更新失敗時

---

この文書は `src\app\api\generation\chapter\route.ts` のコードから直接確認できる事実に基づいています。