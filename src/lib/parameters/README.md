# AI小説自動生成システム - パラメータ設定ガイド

## 概要

このドキュメントでは、AI小説自動生成システムのパラメータ設定機能について説明します。適切なパラメータ設定により、生成される小説の品質や特性を細かく制御することができます。

## パラメータファイルのフォーマット

パラメータ設定はJSON形式で保存され、以下の構造を持ちます：

```json
{
  "version": "1.0.0",
  "name": "システム設定",
  "description": "システムパラメータ設定",
  "lastModified": "2023-01-01T00:00:00.000Z",
  "parameters": {
    "generation": { ... },
    "memory": { ... },
    "characters": { ... },
    "plot": { ... },
    "progression": { ... },
    "system": { ... }
  }
}
```

各パラメータカテゴリの詳細は以下の通りです。

## パラメータカテゴリ

### 1. テキスト生成パラメータ (generation)

小説テキストの生成に関する基本的な設定です。

| パラメータ | 説明 | 有効範囲 | デフォルト値 |
|------------|------|----------|-------------|
| targetLength | 生成される小説の目標文字数 | 1,000-20,000 | 8,000 |
| minLength | 最小許容文字数 | targetLength以下 | 7,500 |
| maxLength | 最大許容文字数 | targetLength以上 | 8,500 |
| model | 使用するAIモデル名 | - | "gemini-2.0-flash-lite" |
| temperature | 生成の多様性（高いほど創造的だが一貫性が低下） | 0-1 | 0.7 |
| topP | トークン選択の確率閾値（核サンプリング） | 0-1 | 0.9 |
| topK | 考慮するトークンの上位数 | 整数 | 50 |
| frequencyPenalty | 単語の繰り返しを抑制するペナルティ | 0-2 | 0.6 |
| presencePenalty | 既出トピックの再登場を抑制するペナルティ | 0-2 | 0.3 |

### 2. メモリ管理パラメータ (memory)

システムがストーリーの一貫性を保つためのメモリ管理設定です。

| パラメータ | 説明 | 有効範囲 | デフォルト値 |
|------------|------|----------|-------------|
| shortTermChapters | 詳細に記憶する直近のチャプター数 | 1-20 | 8 |
| midTermArcSize | 中期記憶として保持するストーリーアークの数 | 1-10 | 4 |
| summaryDetailLevel | 長期記憶の要約詳細度（高いほど詳細） | 1-10 | 7 |
| consistencyThreshold | キャラクターや設定の一貫性判定閾値 | 0-1 | 0.85 |

### 3. キャラクター管理パラメータ (characters)

小説に登場するキャラクターの制御に関する設定です。

| パラメータ | 説明 | 有効範囲 | デフォルト値 |
|------------|------|----------|-------------|
| maxMainCharacters | メインキャラクターの最大数 | 1-10 | 5 |
| maxSubCharacters | サブキャラクターの最大数 | 0-30 | 15 |
| characterBleedTolerance | キャラクター性格の混同許容度（低いほど個性を維持） | 0-1 | 0.2 |
| newCharacterIntroRate | 新キャラクター導入確率 | 0-1 | 0.15 |

### 4. プロット管理パラメータ (plot)

ストーリーの構造と展開に関する設定です。

| パラメータ | 説明 | 有効範囲 | デフォルト値 |
|------------|------|----------|-------------|
| foreshadowingDensity | 伏線の密度（高いほど複雑な伏線構造） | 0-1 | 0.6 |
| resolutionDistance | 伏線の回収までの平均チャプター数 | 1-30 | 8 |
| abstractConcreteBalance | 抽象的vs具体的描写のバランス（高いほど具体的） | 0-1 | 0.5 |
| coherenceCheckFrequency | プロット整合性チェックの頻度 | 0-5 | 1 |

### 5. ストーリー進行パラメータ (progression)

物語の進行速度とリズムに関する設定です。

| パラメータ | 説明 | 有効範囲 | デフォルト値 |
|------------|------|----------|-------------|
| maxSameStateChapters | 同じ状態が続く最大チャプター数 | 1-10 | 3 |
| stagnationThreshold | ストーリー停滞と判断する閾値 | 0-1 | 0.8 |
| tensionMinVariance | テンション変化の最小量（ストーリーのアップダウン） | 0-1 | 0.1 |
| dialogActionRatio | 対話と行動描写の比率（高いほど対話が多い） | 0-1 | 0.6 |

### 6. システム設定 (system)

システム全体の動作に関する設定です。

| パラメータ | 説明 | 有効範囲 | デフォルト値 |
|------------|------|----------|-------------|
| autoSaveInterval | 自動保存の間隔（分） | 1-60 | 15 |
| maxHistoryItems | 履歴保持の最大アイテム数 | 10-1000 | 100 |
| logLevel | ログの詳細レベル | "debug", "info", "warn", "error" | "info" |
| workingDirectory | 作業ディレクトリのパス | - | "./data" |
| backupEnabled | バックアップ機能の有効/無効 | true/false | true |
| backupCount | 保持するバックアップの数 | 1-20 | 5 |

## パラメータ管理機能

システムは以下のパラメータ管理機能を提供しています：

### パラメータの保存と読み込み

```typescript
// 現在のパラメータをファイルに保存
await parameterManager.saveParameters('my-parameters.json');

// ファイルからパラメータを読み込み
await parameterManager.loadParameters('my-parameters.json');
```

### パラメータのインポートとエクスポート

```typescript
// 現在のパラメータをJSONとしてエクスポート
const jsonString = parameterManager.exportParameters();

// JSONからパラメータをインポート
await parameterManager.importParameters(jsonString);
```

### 個別パラメータの更新

```typescript
// 文字数に関するパラメータを更新
parameterManager.updateParameter('generation.targetLength', 10000);
parameterManager.updateParameter('generation.temperature', 0.8);

// キャラクター関連のパラメータを更新
parameterManager.updateParameter('characters.maxMainCharacters', 3);
```

### プリセット管理

```typescript
// 現在のパラメータをプリセットとして保存
await parameterManager.saveAsPreset('ミステリー設定', 'ミステリー小説向けの最適設定');

// プリセットの一覧取得
const presets = parameterManager.getPresets();

// プリセットを適用
parameterManager.applyPreset('ミステリー設定');
```

### パラメータ変更の監視

```typescript
// パラメータ変更イベントの購読
parameterManager.onParameterChanged((path, value) => {
  console.log(`パラメータが変更されました: ${path} = ${JSON.stringify(value)}`);
});
```

## パラメータの最適化ガイド

### ジャンル別推奨設定

#### 恋愛小説

- `generation.temperature`: 0.65（自然な展開）
- `characters.maxMainCharacters`: 2-3（主人公とヒロイン中心）
- `plot.abstractConcreteBalance`: 0.6（感情描写を豊かに）
- `progression.dialogActionRatio`: 0.7（会話を重視）

#### アクション・冒険

- `generation.temperature`: 0.75（多様なイベント）
- `plot.foreshadowingDensity`: 0.5（伏線よりアクション重視）
- `progression.tensionMinVariance`: 0.2（テンションの上下を大きく）
- `progression.dialogActionRatio`: 0.4（行動描写を多く）

#### ミステリー

- `generation.temperature`: 0.6（論理的整合性重視）
- `plot.foreshadowingDensity`: 0.8（複雑な伏線構造）
- `plot.resolutionDistance`: 12（長めの伏線回収距離）
- `plot.coherenceCheckFrequency`: 2（整合性チェック頻度を上げる）

#### ファンタジー

- `generation.temperature`: 0.8（創造的な世界観）
- `characters.maxSubCharacters`: 20（多様なキャラクター）
- `plot.abstractConcreteBalance`: 0.7（世界観の具体的描写）
- `memory.summaryDetailLevel`: 9（複雑な設定の一貫性維持）

## 高度な使用例

### 複雑な伏線構造の最適化

複雑な伏線を多用するミステリー小説を生成する場合：

```typescript
// 伏線密度を高めに設定
parameterManager.updateParameter('plot.foreshadowingDensity', 0.8);

// 伏線回収までの距離を長めに設定
parameterManager.updateParameter('plot.resolutionDistance', 15);

// 整合性チェックを頻繁に行う
parameterManager.updateParameter('plot.coherenceCheckFrequency', 3);

// 記憶の詳細度を上げる
parameterManager.updateParameter('memory.summaryDetailLevel', 9);

// 一貫性閾値を厳しく
parameterManager.updateParameter('memory.consistencyThreshold', 0.9);
```

### 対話重視のキャラクター小説

キャラクター同士の対話を重視する小説を生成する場合：

```typescript
// 対話比率を高く設定
parameterManager.updateParameter('progression.dialogActionRatio', 0.8);

// キャラクターの個性を明確に
parameterManager.updateParameter('characters.characterBleedTolerance', 0.1);

// メインキャラクターを少なめに
parameterManager.updateParameter('characters.maxMainCharacters', 3);

// 生成の多様性を少し上げる
parameterManager.updateParameter('generation.temperature', 0.75);
```

## トラブルシューティング

### 問題: キャラクターの一貫性が低い

**解決策:**
- `characters.characterBleedTolerance`を下げる（0.1-0.15程度）
- `memory.consistencyThreshold`を上げる（0.9以上）
- `memory.shortTermChapters`を増やす

### 問題: ストーリーが停滞する

**解決策:**
- `progression.maxSameStateChapters`を減らす（2程度）
- `progression.stagnationThreshold`を下げる（0.7程度）
- `progression.tensionMinVariance`を上げる（0.15-0.2程度）

### 問題: 伏線が回収されない

**解決策:**
- `plot.resolutionDistance`を調整（短くするか長くする）
- `plot.coherenceCheckFrequency`を増やす
- `memory.midTermArcSize`を増やす

## まとめ

パラメータ設定は小説生成の品質に大きな影響を与えます。ジャンルや目的に応じて適切に調整することで、魅力的で一貫性のある小説を生成できます。本システムは柔軟なパラメータ管理機能を提供しており、様々な実験と最適化が可能です。

まずはデフォルト設定から始めて、少しずつパラメータを調整しながら理想の設定を見つけてください。また、成功したパラメータ設定はプリセットとして保存しておくことをお勧めします。