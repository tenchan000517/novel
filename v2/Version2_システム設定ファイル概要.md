# Novel Automation System - Configuration & Data Structure Guide

## 概要

本ドキュメントは、AI小説自動生成システムの設定ファイルとデータ構造について説明します。
システムの開発・運用・保守における共有資料として作成されています。

---

## 🗂️ データディレクトリ構造

### 基本構造

```
data/
├── config/          # システム設定ファイル
├── characters/      # キャラクター関連データ
├── chapters/        # 生成された章データ
├── parameters/      # パラメータ設定
├── plot/           # プロット・物語構造
├── prompts/        # 生成履歴・プロンプト保存
├── *-memory/       # 記憶階層システム
├── skills/         # キャラクタースキル定義
├── world-knowledge/ # 世界観・設定知識
└── backup/         # バックアップファイル
```

---

## 📋 設定ファイル詳細

### 1. システム基本設定 (`data/config/`)

| ファイル | 形式 | 用途 | 重要度 |
|---------|------|------|--------|
| `system-parameters.json` | JSON | システム全体の動作パラメータ | ★★★ |
| `world-settings.yaml` | YAML | 世界観・設定情報 | ★★★ |
| `story-plot.yaml` | YAML | メインプロット設定 | ★★★ |
| `character-development.yaml` | YAML | キャラクター成長設定 | ★★☆ |
| `theme-tracker.yaml` | YAML | テーマ追跡設定 | ★★☆ |
| `planned_foreshadowings.json` | JSON | 計画された伏線管理 | ★★☆ |

#### システムパラメータ例:
```json
{
  "version": "1.0.0",
  "generation": {
    "targetLength": 8000,
    "temperature": 0.7,
    "maxRetries": 3
  },
  "memory": {
    "maxHistoryItems": 100,
    "shortTermRetention": "72h"
  },
  "characters": {
    "maxActiveCharacters": 10
  }
}
```

### 2. プロット・物語構造 (`data/plot/`)

| ディレクトリ/ファイル | 内容 |
|-------------------|------|
| `sections/` | 物語セクション定義 |
| `relationships.json` | 登場人物関係図 |
| `sections.json` | 章・セクション構造 |

### 3. プロンプト設定 (`data/config/story-plot/`)

| ファイル | 内容 |
|---------|------|
| `abstract-plot.yaml` | 抽象的プロット構造 |
| `concrete-plot.yaml` | 具体的プロット詳細 |
| `medium-plot.yaml` | 篇の詳細プロット |

---

## 👥 キャラクター管理システム

### キャラクターデータ構造 (`data/characters/`)

```
characters/
├── main/           # 主要キャラクター
├── sub/            # サブキャラクター
├── background/     # 背景キャラクター
├── mob/            # モブキャラクター
├── definitions/    # キャラクター定義テンプレート
├── states/         # 現在の状態
├── relationships/  # キャラクター間関係
└── templates/      # キャラクターテンプレート
```

#### キャラクター定義例 (`character-sato.yaml`):
```yaml
basic_info:
  name: "佐藤"
  age: 25
  occupation: "エンジニア"
  personality:
    - "真面目"
    - "責任感が強い"
    - "少し内向的"
background:
  family: "両親と妹"
  education: "工学部卒業"
skills:
  technical: 8
  communication: 6
  leadership: 5
current_state:
  mood: "集中"
  location: "オフィス"
  goals:
    - "プロジェクトの成功"
    - "チームの統率"
```

### 関連データファイル

| ディレクトリ | 内容 | ファイル形式 |
|-------------|------|-------------|
| `data/character-parameters/` | キャラクターパラメータ | JSON |
| `data/character-skills/` | スキル定義 | JSON |
| `data/skills/characters/` | 個別スキルデータ | JSON |
| `data/growth-plans/` | 成長計画 | JSON |

---

## 🧠 記憶階層システム

### 3層記憶アーキテクチャ

#### 1. 短期記憶 (`data/short-term/`)
- **保存期間**: 72時間
- **用途**: 最近の章、即座のコンテキスト
- **ファイル**:
  - `chapters/` - 最近生成された章
  - `generation-cache.json` - 生成キャッシュ
  - `immediate-context-metadata.json` - 即座コンテキスト
  - `processing-buffers.json` - 処理バッファ

#### 2. 中期記憶 (`data/mid-term-memory/`)
- **保存期間**: 永続（定期クリーンアップ）
- **用途**: 分析結果、品質メトリクス、進行管理
- **ファイル**:
  - `analysis-results.json` - 分析結果
  - `character-evolution.json` - キャラクター進化記録
  - `narrative-progression.json` - 物語進行データ
  - `quality-metrics.json` - 品質評価指標
  - `system-statistics.json` - システム統計

#### 3. 長期記憶 (`data/long-term-memory/`)
- **保存期間**: 永続
- **用途**: 確立された知識、システム学習データ
- **構造**:
```
long-term-memory/
├── completed/              # 完了記録
│   ├── effectiveness-records.json
│   └── sections/          # セクション記録
├── knowledge/             # 知識データベース
│   └── characters/        # キャラクター知識
└── system-knowledge/      # システム知識
    └── patterns.json      # 学習パターン
```

---

## ⚙️ パラメータ管理

### パラメータ階層 (`data/parameters/`)

```
parameters/
├── templates/              # パラメータテンプレート
│   ├── 標準設定.json        # 標準設定
│   ├── 細密設定.json        # 詳細設定
│   └── 高テンション設定.json # 高テンション設定
├── characters/             # キャラクター別パラメータ
├── user-configurations/    # ユーザー設定
└── definitions.json        # パラメータ定義
```

### テンプレート例:
```json
{
  "name": "標準設定",
  "description": "8000文字の標準小説生成パラメータ",
  "parameters": {
    "generation": {
      "targetLength": 8000,
      "temperature": 0.7,
      "topP": 0.9
    },
    "memory": {
      "summaryDetailLevel": 7,
      "maxContextLength": 50000
    }
  }
}
```

---

## 📖 章・コンテンツ管理

### 章データ (`data/chapters/`)

- **構造**: `chapter-{number}.md` + `chapter-{number}-metadata.json`
- **メタデータ例**:
```json
{
  "chapterNumber": 1,
  "title": "始まり",
  "wordCount": 8245,
  "characters": ["佐藤", "田中"],
  "themes": ["成長", "友情"],
  "qualityScore": 0.85,
  "createdAt": "2025-06-06T10:00:00Z"
}
```

### プロンプト履歴 (`data/prompts/`)

- **命名規則**: `prompt_chapter{N}_{timestamp}.txt`
- **用途**: 生成履歴の追跡、デバッグ、品質改善

---

## 🌍 世界観・設定管理

### 世界知識データベース (`data/world-knowledge/`)

```
world-knowledge/
├── characters/    # キャラクター設定
├── events/        # イベント設定
├── locations/     # 場所設定
└── settings/      # その他設定
```

### 文学ガイドライン (`data/literary-guidelines.json`)

文体、表現パターン、品質基準の定義

---

## 🔧 システム運用ファイル

### バックアップ・復元

| ディレクトリ | 用途 |
|-------------|------|
| `data/backup/` | 手動バックアップ |
| `data/backups/metadata/` | メタデータバックアップ |
| `data/rollback-data/` | ロールバック用データ |

### 診断・分析

| ディレクトリ | 用途 |
|-------------|------|
| `data/diagnostics/` | システム診断結果 |
| `data/temporary-analysis/` | 一時的分析データ |
| `data/migrations/` | データ移行記録 |

---

## 📁 設定ファイル優先順位

1. **最高優先**: `data/config/system-parameters.json`
2. **高優先**: ユーザー設定 (`data/parameters/user-configurations/`)
3. **中優先**: テンプレート設定 (`data/parameters/templates/`)
4. **低優先**: デフォルト設定（コード内）

---

## 🚀 システム起動時の設定読み込み順序

1. **インフラ設定** → システムパラメータ
2. **ストレージ設定** → 世界設定、プロット設定
3. **記憶システム** → 3層記憶の初期化
4. **キャラクター管理** → キャラクターデータ読み込み
5. **生成エンジン** → プロンプトテンプレート設定

---

## 📋 保守・運用チェックリスト

### 日常チェック
- [ ] `data/short-term/` の容量確認
- [ ] エラーログ確認
- [ ] 生成品質メトリクス確認

### 週次チェック
- [ ] `data/mid-term-memory/` の分析結果レビュー
- [ ] バックアップファイルの確認
- [ ] システム統計の分析

### 月次メンテナンス
- [ ] 長期記憶データの整理
- [ ] パフォーマンス分析
- [ ] 設定ファイルの最適化

---

## 🔗 関連リンク

- **メインドキュメント**: `README.md`
- **CLAUDE設定**: `CLAUDE.md`
- **アーキテクチャ**: `system-documentation.md`
- **移行ファイル履歴**: `version/MOVED_FILES_LOG.md`

---

*最終更新: 2025-06-06*
*バージョン: 1.0*