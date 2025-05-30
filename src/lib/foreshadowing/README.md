# 小説生成システム - 伏線管理機能

## 概要

伏線管理機能は、物語に一貫性と深みを与えるための重要な機能です。本システムでは、事前に計画された伏線と、AIが自動生成する伏線を組み合わせることで、質の高い物語構造を実現します。

主な特徴:
- 事前に計画された伏線の設定と管理
- 伏線の導入、ヒントの配置、解決のタイミングの制御
- 不足分はAIによる伏線の自動生成で補完
- 伏線の状態（導入済み・解決済み）の追跡

## 伏線設定ファイル

### 配置場所
```
src/config/planned_foreshadowings.json
```

### 基本フォーマット

```json
{
  "planned_foreshadowings": [
    {
      "id": "一意の識別子",
      "description": "伏線の簡潔な説明",
      "chapter_to_introduce": 3,
      "introduction_context": "伏線の導入方法の説明",
      "chapter_to_resolve": 12,
      "resolution_context": "伏線の解決方法の説明",
      "urgency": "high",
      "relatedCharacters": ["関連キャラクター1", "関連キャラクター2"],
      "hints_before_resolution": [
        {
          "chapter": 7,
          "hint": "伏線に関するヒントの説明"
        }
      ],
      "isIntroduced": false,
      "isResolved": false
    }
  ]
}
```

### 設定項目の詳細説明

#### 必須項目

| 項目 | 型 | 説明 |
|------|------|------|
| `id` | 文字列 | 伏線の一意の識別子。例: `"fs-planned-001"` |
| `description` | 文字列 | 伏線の簡潔な説明。システム内部で参照される識別用の説明文。 |
| `chapter_to_introduce` | 数値 | 伏線を導入するチャプター番号。 |
| `introduction_context` | 文字列 | 伏線をどのように導入するかの説明。AIがこの文脈に沿って伏線を自然に組み込みます。 |
| `chapter_to_resolve` | 数値 | 伏線を解決するチャプター番号。この章で伏線が回収されます。 |
| `resolution_context` | 文字列 | 伏線をどのように解決するかの説明。AIがこの文脈に沿って伏線を回収します。 |

#### オプション項目

| 項目 | 型 | 説明 | デフォルト値 |
|------|------|------|------|
| `urgency` | 文字列 | 伏線の重要度。`"low"`, `"medium"`, `"high"`, `"critical"` のいずれか。 | `"medium"` |
| `relatedCharacters` | 文字列配列 | 伏線に関連するキャラクターのリスト。 | `[]` |
| `hints_before_resolution` | オブジェクト配列 | 伏線解決前に出すヒントのリスト。 | `[]` |
| `isIntroduced` | 真偽値 | 伏線が既に導入されているかどうか。自動更新されるため通常は `false` に設定。 | `false` |
| `isResolved` | 真偽値 | 伏線が既に解決されているかどうか。自動更新されるため通常は `false` に設定。 | `false` |

##### ヒント設定

ヒントは伏線の導入後、解決前のチャプターで、伏線を補強するための情報です：

```json
{
  "chapter": 7,
  "hint": "主人公が荷物をまとめている時に再び鍵を見つけ、なぜか捨てられず持っていくことにする"
}
```

| 項目 | 型 | 説明 |
|------|------|------|
| `chapter` | 数値 | ヒントを出すチャプター番号。導入チャプターと解決チャプターの間の値を設定します。 |
| `hint` | 文字列 | ヒントの内容。AIがこの内容に沿ってヒントを組み込みます。 |

## 使用例

### 基本的な伏線設定の例

```json
{
  "planned_foreshadowings": [
    {
      "id": "fs-planned-001",
      "description": "主人公の机の引き出しに隠された古い鍵",
      "chapter_to_introduce": 3,
      "introduction_context": "主人公が書類を探している時に、机の奥に古びた見知らぬ鍵を見つける。不思議に思うが、特に気にせず引き出しに戻す。",
      "chapter_to_resolve": 12,
      "resolution_context": "廃屋の調査中に見つかった錆びた箱を開けるのに、以前見つけた鍵が使える。箱の中には物語の核心に関わる重要な手紙が入っている。",
      "urgency": "high",
      "relatedCharacters": ["主人公", "謎の手紙の筆者"],
      "hints_before_resolution": [
        {
          "chapter": 7,
          "hint": "主人公が荷物をまとめている時に再び鍵を見つけ、なぜか捨てられず持っていくことにする"
        },
        {
          "chapter": 10,
          "hint": "廃屋の噂を聞き、気になって調査を決意する"
        }
      ],
      "isIntroduced": false,
      "isResolved": false
    }
  ]
}
```

### 複数の伏線を含む設定例

```json
{
  "planned_foreshadowings": [
    {
      "id": "fs-planned-001",
      "description": "主人公の机の引き出しに隠された古い鍵",
      "chapter_to_introduce": 3,
      "introduction_context": "主人公が書類を探している時に、机の奥に古びた見知らぬ鍵を見つける。不思議に思うが、特に気にせず引き出しに戻す。",
      "chapter_to_resolve": 12,
      "resolution_context": "廃屋の調査中に見つかった錆びた箱を開けるのに、以前見つけた鍵が使える。箱の中には物語の核心に関わる重要な手紙が入っている。",
      "urgency": "high",
      "relatedCharacters": ["主人公", "謎の手紙の筆者"],
      "hints_before_resolution": [
        {
          "chapter": 7,
          "hint": "主人公が荷物をまとめている時に再び鍵を見つけ、なぜか捨てられず持っていくことにする"
        },
        {
          "chapter": 10,
          "hint": "廃屋の噂を聞き、気になって調査を決意する"
        }
      ],
      "isIntroduced": false,
      "isResolved": false
    },
    {
      "id": "fs-planned-002",
      "description": "脇役の不自然な言動と行動",
      "chapter_to_introduce": 5,
      "introduction_context": "友人が主人公の質問に対して明らかに話題をそらし、不自然な態度を見せる。また、何度か誰かと密談している姿が目撃される。",
      "chapter_to_resolve": 18,
      "resolution_context": "実は友人は敵対組織のスパイであり、主人公を監視していた。しかし同時に主人公に対する友情も本物で、最終的には主人公を救うために裏切り者として処刑される。",
      "urgency": "medium",
      "relatedCharacters": ["友人キャラクター", "敵対組織のリーダー"],
      "hints_before_resolution": [
        {
          "chapter": 9,
          "hint": "友人が主人公の留守中に部屋を物色している様子が第三者によって目撃される"
        },
        {
          "chapter": 15,
          "hint": "敵対組織の襲撃時に、友人だけが不思議と無傷で済む"
        }
      ],
      "isIntroduced": false,
      "isResolved": false
    },
    {
      "id": "fs-planned-003",
      "description": "繰り返し登場する特定の花のモチーフ",
      "chapter_to_introduce": 2,
      "introduction_context": "物語の舞台となる町の至る所に咲いている青い花。地元では「幸運の印」と言われている。",
      "chapter_to_resolve": 25,
      "resolution_context": "実はこの花は古代の呪術師が植えたもので、町を守る結界の一部だった。この花が枯れ始めたことで、封印されていた古代の脅威が目覚め始めている。",
      "urgency": "low",
      "relatedCharacters": ["町の古老", "呪術の研究者"],
      "hints_before_resolution": [
        {
          "chapter": 8,
          "hint": "異変が起き始めた地域では、青い花が枯れている現象が報告される"
        },
        {
          "chapter": 16,
          "hint": "図書館で見つけた古文書に、青い花と結界の関係を示唆する記述がある"
        },
        {
          "chapter": 21,
          "hint": "町の古老が「花が枯れれば、厄災が訪れる」という古い言い伝えを語る"
        }
      ],
      "isIntroduced": false,
      "isResolved": false
    }
  ]
}
```

## 動作の仕組み

1. 各チャプター生成時に、システムは現在のチャプター番号と合致する計画済み伏線を検索します。
2. 該当する伏線があれば、その伏線の文脈情報を元にAIがチャプター内に自然に伏線を組み込みます。
3. 伏線の導入や解決が行われると、設定ファイル内の `isIntroduced` や `isResolved` が更新されます。
4. 計画済み伏線が不足している場合（設定された数より少ない場合）は、AIが追加の伏線を自動生成します。
5. すべての計画済み伏線が解決された場合、システムは完全にAI生成の伏線に移行します。

## 効果的な伏線設計のヒント

1. **伏線の数と密度のバランス**：物語全体で3〜5個の主要な伏線を設定し、各チャプターに1〜2個の伏線の導入または解決を配置するのが効果的です。

2. **計画的な伏線の解決タイミング**：伏線の導入から解決までの距離は物語のテンポに影響します。
   - 短期的な伏線：2〜5チャプター（サブプロットの展開）
   - 中期的な伏線：5〜10チャプター（主要プロットの構成要素）
   - 長期的な伏線：10チャプター以上（物語全体のアーク）

3. **ヒントの適切な配置**：伏線の導入と解決の間に2〜3回のヒントを配置すると、読者の注意を維持しつつ、突然の展開を避けられます。

4. **伏線の重要度の使い分け**：
   - `low`: 雰囲気作りや小さな謎
   - `medium`: サブプロットに影響する要素
   - `high`: 主要プロットに直結する重要な要素
   - `critical`: 物語の核心に関わる最重要の要素

## トラブルシューティング

1. **伏線が導入されない**：
   - チャプター番号が正しく設定されているか確認
   - 設定ファイルのフォーマットが正しいか確認
   - 設定ファイルが正しい場所に配置されているか確認

2. **伏線が意図した通りに導入されない**：
   - `introduction_context` の説明をより具体的にする
   - チャプターの内容と伏線の整合性を確認

3. **伏線が解決されない**：
   - 伏線が正しく導入されているか確認（`isIntroduced` が `true` になっているか）
   - 解決チャプター番号が正しく設定されているか確認
   - `resolution_context` の説明を見直す

## 開発者向け情報

システムは以下のファイルを通じて伏線機能を実装しています：

- `src/lib/foreshadowing/planned-foreshadowing-manager.ts`: 計画済み伏線の管理
- `src/lib/foreshadowing/engine.ts`: 伏線の生成と管理
- `src/lib/foreshadowing/resolution-advisor.ts`: 伏線解決の提案

伏線の設定ファイルを変更した場合、システムは自動的に新しい設定を読み込みます。進行中の物語での設定変更は、変更後のチャプターから反映されます。