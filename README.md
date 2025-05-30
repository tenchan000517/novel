# Auto Novel System

Auto Novel Systemは、AI（Gemini API）を活用して高品質な小説を自動生成・管理・公開するためのプラットフォームです。本システムは、物語設定・キャラクター設定・プロットを基に、毎日8000文字程度の小説を自動的に生成し、一貫性のある魅力的な物語を作り出します。

## 主要機能

- 🤖 **AI小説生成**: Gemini APIを使用した高品質な小説の自動生成
- 🧠 **階層的記憶管理**: 短期・中期・長期の記憶を管理し、物語の一貫性を確保
- 👥 **キャラクター管理**: キャラクターの成長、関係性、登場タイミングを最適化
- 📝 **品質検証と自動修正**: 生成された小説の検証と修正を自動化
- 🔄 **編集者-AI協調システム**: 人間の編集者とAIの連携を強化
- 📊 **分析とモニタリング**: 物語の品質とテンションを分析・可視化
- 🌐 **公開システム**: 生成された小説を読者向けに公開

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router), React, TypeScript
- **バックエンド**: Next.js API Routes
- **UI**: Tailwind CSS
- **AIエンジン**: Gemini API
- **データストレージ**: YAML, GitHub Storage
- **CI/CD**: GitHub Actions
- **デプロイ**: Vercel

## 始め方

### 前提条件

- Node.js v18.x 以上
- npm v9.x 以上 または yarn v1.22.x 以上
- Gemini API キー

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/your-organization/novel-automation-system.git
cd novel-automation-system

# 依存関係のインストール
npm install
# または
yarn install

# 環境変数の設定
cp .env.example .env.local
# .env.localファイルを編集して必要な環境変数を設定
```

### 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと、アプリケーションが表示されます。

### ビルドと本番実行

```bash
# ビルド
npm run build
# または
yarn build

# 本番モードで実行
npm start
# または
yarn start
```

## プロジェクト構造

```
novel-automation-system/
├── .github/                 # GitHub関連ファイル
├── docs/                    # プロジェクトドキュメント
│   ├── architecture/        # アーキテクチャドキュメント
│   ├── development/         # 開発ガイド
│   └── deployment/          # デプロイメント手順
├── src/                     # ソースコード
│   ├── app/                 # Next.js App Router
│   ├── components/          # Reactコンポーネント
│   ├── lib/                 # コアロジック
│   ├── types/               # TypeScript型定義
│   ├── hooks/               # カスタムReactフック
│   ├── contexts/            # Reactコンテキスト
│   └── styles/              # スタイル
├── data/                    # データファイル（開発用）
├── tests/                   # テスト
├── public/                  # 静的ファイル
└── package.json             # 依存関係とスクリプト
```

# AI小説自動生成システムの設定ファイル一覧

以下に、AI小説自動生成システムが必要とする全ての設定ファイルとそのフォーマットをまとめました。

## 1. プロット関連ファイル

### 1.1 物語基本設定 (`/config/story-plot.yaml`)
```yaml
# 基本情報（必須）
genre: "ファンタジー"                  # ジャンル
theme: "成長と困難からの克服"           # 中心テーマ
setting: "中世風魔法世界"              # 舞台設定の概要
summary: "若き魔術師見習いが世界を脅かす古代の力と対峙する物語" # 物語概要

# 物語構造（推奨）
totalChapters: 20                    # 予定総チャプター数
arcs:                                # アーク情報
  - name: "見習い期"
    chapters: [1, 5]                 # 開始と終了チャプター
    theme: "能力の目覚めと師匠との出会い"
    goal: "基本的な魔法の習得"
  # 他のアークも同様に定義...

# キャラクター基本情報（推奨）
characters:
  - name: "リオン"
    role: "主人公"
    type: "MAIN"
    goal: "最強の魔術師になること"
    conflict: "力の制御と責任"
  # 他のキャラクターも同様に定義...

# プロットポイント（推奨）
keyEvents:
  - chapter: 1
    event: "主人公の魔法の才能が偶然の事故で発覚"
  # 他のイベントも同様に定義...

# 伏線計画（推奨）
foreshadowing:
  - description: "主人公の体に現れる不思議な紋章"
    introducedChapter: 2
    resolutionChapter: 15
    significance: "古代の力の継承者であることの証"
  # 他の伏線も同様に定義...

# テーマの展開（オプション）
themeEvolution:
  - chapter: 1
    aspect: "無知と才能の萌芽"
  # 他のテーマ展開も同様に定義...

# 世界設定要素（オプション）
worldElements:
  - name: "マナの泉"
    introduction: 5
    description: "世界中に点在する魔力の源泉"
    significance: "魔力枯渇の危機における重要な資源"
  # 他の世界設定要素も同様に定義...
```

### 1.2 世界設定 (`/config/world-settings.yaml`)
```yaml
description: |
  中世ファンタジー世界「エルデア」。魔法が日常に溶け込み、五つの大陸が存在する。
  古代文明の遺跡が点在し、各地域に独自の文化と種族が発展している。
regions:
  - name: 北方王国アラノス
    description: 厳しい冬と騎士道精神で知られる人間の王国。
  # 他の地域も同様に定義...
history:
  - era: 創世期
    description: 神々が世界を形作った時代。
  # 他の時代も同様に定義...
magicSystem:
  description: 四大元素（火、水、風、土）を基盤とする魔法体系。
  rules:
    - 魔力は生命エネルギーから引き出される
    # 他のルールも同様に定義...
technology:
  description: 中世レベルの技術に魔法が融合した世界。
  examples:
    - 魔法の灯りで照らされた都市
    # 他の例も同様に定義...
socialSystem:
  description: 封建制度が主流だが、魔法の才能による階級移動も可能。
  structures:
    - 貴族と平民の二層構造
    # 他の社会構造も同様に定義...
supernatural:
  - type: 精霊
    description: 自然界の要素を司る存在。
  # 他の超自然要素も同様に定義...
uniqueElements:
  - name: 魂石
    description: 魂のエネルギーを蓄える希少な鉱石。
  # 他のユニーク要素も同様に定義...
```

### 1.3 テーマ設定 (`/config/theme-tracker.yaml`)
```yaml
description: |
  本作品は「運命と自由意志の相克」を中心テーマとし、登場人物たちが予言された運命に抗いながら、
  自らの道を切り開こうとする姿を描く。
mainThemes:
  - 運命と自由意志
  - 権力と責任
  - 過去との和解
subThemes:
  - 家族の絆
  - 正義と道徳的曖昧さ
  # 他のサブテーマも同様に定義...
evolution:
  - phase: OPENING
    focus: 運命に縛られた主人公
    description: 予言に翻弄される主人公の姿を描く
  # 他のフェーズも同様に定義...
implementation:
  symbolism:
    - symbol: 鳥籠
      meaning: 運命による束縛
    # 他のシンボルも同様に定義...
  conflicts:
    - 予言者 vs 主人公
    # 他の対立関係も同様に定義...
message: |
  運命は固定されたものではなく、自らの意志と行動によって変えることができる。
  しかし、完全な自由もまた幻想であり、すべての選択には代償が伴う。
```

### 1.4 抽象プロット (`/config/abstract-plot.yaml`)
```yaml
- phase: "OPENING" # 物語フェーズ
  theme: "運命との対峙" # この範囲のテーマ
  emotionalTone: "不安と期待の混在" # 感情的トーン
  chapterRange: [1, 5] # 適用する章の範囲
  thematicMessage: "定められた運命に疑問を持ち始める" # 伝えたいメッセージ
  phasePurpose: "主人公と世界観の紹介、および中心的な葛藤の確立" # このフェーズの目的
  potentialDirections: # 可能な方向性
    - "主人公が予言について知る"
    - "最初の冒険への呼び出し"
    # 他の方向性も同様に定義...
  prohibitedElements: # 避けるべき要素
    - "主人公の力の完全な解放"
    # 他の禁止要素も同様に定義...
  keyCharacters: # 焦点を当てるキャラクター
    - "アレン（主人公）"
    - "予言者マティアス"
    # 他のキャラクターも同様に定義...

# 他のフェーズも同様に定義...
```

### 1.5 具体プロット (`/config/concrete-plot.yaml`)
```yaml
- chapterRange: [1, 3] # 適用する章の範囲
  phase: "OPENING" # 物語フェーズ
  title: "予言の影" # プロットタイトル
  summary: "アレンは平凡な村の少年だったが、彼の16歳の誕生日に村を訪れた予言者マティアスにより、彼が古代の予言に記された「運命の子」であることが明かされる。信じられないアレンだが、直後に村が謎の集団に襲撃され、彼の中に眠る力が目覚める。" # 概要
  storyArc: "運命の子の目覚め" # ストーリーアーク
  storyGoal: "主人公の運命との最初の邂逅と冒険への呼び出し" # 物語目標
  keyEvents: # 重要イベント
    - "予言者マティアスが村に到着し、アレンが「運命の子」であると告げる"
    # 他のイベントも同様に定義...
  characterFocus: # 注目キャラクター
    - "アレン（主人公）"
    - "予言者マティアス"
    # 他のキャラクターも同様に定義...
  requiredElements: # 必須要素
    - "古代予言の断片的な説明"
    # 他の必須要素も同様に定義...
  foreshadowing: # 伏線
    - "アレンの父親が隠し持っていた古代の書物"
    # 他の伏線も同様に定義...
  mustHaveOutcome: "アレンがマティアスと共に村を離れ、古代遺跡への旅に出る決意をする" # 必ず達成すべき結果

# 他の章範囲も同様に定義...
```

### 1.6 プロット戦略 (`/config/plot-strategy.yaml`)
```yaml
globalStrategy:
  preferredMode: "mixed" # concrete, abstract, mixed のいずれか
  abstractRatio: 0.6 # 抽象プロットの重み（0-1）
  plotComplexity: "medium" # low, medium, high のいずれか
chapterModeOverrides: # 特定の章範囲でのモードオーバーライド
  - chapterRange: [1, 3]
    mode: "CONCRETE" # 厳密に具体プロットに従う
    reason: "物語の導入部分は正確に設定したい"
  # 他のオーバーライドも同様に定義...
arcStrategies: # 特定のストーリーアークに対する戦略
  - arcName: "運命の子の目覚め"
    strategy: "キャラクターの内面の葛藤を重視"
    notes: "アレンの不信と受容のプロセスを丁寧に描写する"
  # 他のアーク戦略も同様に定義...
```

### 1.7 伏線設定 (`/src/config/planned_foreshadowings.json`)
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
    // 他の伏線も同様に定義...
  ]
}
```

## 2. キャラクター関連ファイル

### 2.1 キャラクター定義 (`/characters/main/{characterId}.yaml`, `/characters/sub-characters/{characterId}.yaml`, `/characters/mob-characters/{characterId}.yaml`)
```yaml
# メインキャラクター定義
id: character-xxxxx  # 一意のID
name: "鈴木太郎"     # キャラクター名
shortNames:         # 短縮名/別名のリスト
  - "太郎"
  - "鈴木君"
type: "MAIN"        # キャラクタータイプ: MAIN, SUB, MOB
description: "物語の主人公。元気で前向きな青年で、冒険を通じて成長していく。"

# パーソナリティ
personality:
  traits:           # 性格特性
    - "勇敢"
    - "正義感が強い"
    - "好奇心旺盛"
  speechPatterns:   # 話し方の特徴
    - "語尾に「だぜ」をつける"
    - "興奮すると早口になる"
  quirks:           # 変わった習慣や癖
    - "困ると頭を掻く"
    - "集中すると舌を出す"
  values:           # 価値観
    - "友情を何よりも大切にする"
    - "弱い者を守ることが使命だと考えている"

# 外見
appearance:
  age: 18
  gender: "男性"
  height: 175
  bodyType: "引き締まった体格"
  hairColor: "黒"
  eyeColor: "茶色"
  distinguishingFeatures:
    - "左頬に小さな傷がある"
    - "常に赤いマフラーを身につけている"
  clothingStyle: "カジュアルで機能的な服装を好む"

# バックストーリー
backstory:
  summary: "小さな村で生まれ育ち、幼い頃に両親を事故で亡くした。村の長老に引き取られ育てられたが、世界を見てみたいという思いから冒険の旅に出る。"
  significantEvents:
    - "10歳の時、村を襲った山賊から友人を守って負傷した"
    - "15歳の時、森で迷子になり古い遺跡を発見した"
    - "17歳の誕生日に村を出て冒険を始めた"
  origin: "ミドリの村"
  trauma:
    - "両親の突然の死"
    - "山賊との戦いでの恐怖体験"
  detailedHistory: "幼い頃から剣術の素質を見せ、村の老剣士から基本を学んだ。両親を亡くした悲しみを乗り越え、強くなることを誓った。十代になると村の若者たちからリーダーとして慕われるようになり、困った人々を助ける活動を始めた。"
  motivations: "世界の不思議を探検し、両親の死の真相を解明すること"
  secrets: "実は特殊な能力を持っていることを薄々感じているが、まだ自覚していない"

# 現在の状態
state:
  isActive: true
  emotionalState: "DETERMINED" # HAPPY, SAD, ANGRY, FEARFUL, DETERMINED, CONFUSED, NEUTRAL etc.
  developmentStage: 1          # 発展段階 (0-5)
  lastAppearance: 3            # 最後に登場した章番号
  parameters: []               # ParameterSystemで管理
  skills: []                   # SkillSystemで管理
  activeGrowthPlanId: "growth-plan-xxxxx" # アクティブな成長計画ID

# 履歴
history:
  appearances:                 # 登場履歴
    - {
        chapterNumber: 1,
        context: "村を出発する場面で初登場",
        significance: 0.9
      }
    # 他の登場履歴も同様に定義...
  developmentPath:             # 成長の記録
    - {
        stage: 0,
        description: "旅の初期段階、冒険者としての自覚が芽生える",
        achievedAt: "2024-04-05T10:15:00.000Z",
        chapterNumber: 1
      }
    # 他の成長記録も同様に定義...
  interactions:                # 他キャラクターとの重要な交流
    - {
        targetId: "character-yyyyy",
        type: "FRIENDSHIP_FORMATION",
        description: "最初の仲間との出会い",
        chapterNumber: 2,
        emotionalImpact: 0.8
      }
    # 他の交流も同様に定義...

# 関係性
relationships:
  - {
      targetId: "character-yyyyy",
      type: "FRIEND",
      strength: 0.7,
      description: "信頼できる最初の冒険仲間",
      history: [
        {
          type: "FIRST_MEETING",
          description: "森での出会い",
          chapterNumber: 2
        }
      ]
    }
    # 他の関係性も同様に定義...

# メタデータ
metadata:
  createdAt: "2024-04-01T00:00:00.000Z"
  lastUpdated: "2024-04-11T15:45:00.000Z"
  version: 1
  tags:
    - "主人公"
    - "冒険者"
    - "初心者"
```

### 2.2 キャラクター間の関係性定義 (`/characters/relationships/{relationshipId}.yaml`)
```yaml
# キャラクター間の関係性を定義
characters:
  - "character-xxxxx"   # 関係の主体となるキャラクターID
  - "character-yyyyy"   # 関係の対象となるキャラクターID
type: "FRIEND"          # 関係タイプ: FRIEND, ENEMY, FAMILY, MENTOR, RIVAL, LOVER, etc.
strength: 0.7           # 関係の強さ (0.0 - 1.0)
description: "冒険の序盤で出会った仲間。最初は互いに警戒していたが、共に危機を乗り越えて信頼関係を築いた。"
lastUpdated: "2024-04-10T14:30:00.000Z"

# 発展の履歴
history:
  - {
      event: "FIRST_MEETING",
      description: "森の中で偶然出会う",
      chapterNumber: 2,
      strengthChange: 0.3,  # この出来事による関係の強さの変化
      emotionalImpact: "NEUTRAL_TO_CURIOUS"
    }
  # 他の履歴も同様に定義...

# 感情的な側面
emotions:
  trust: 0.8         # 信頼度
  respect: 0.6       # 尊敬度
  affection: 0.5     # 好意度
  dependency: 0.3    # 依存度
  jealousy: 0.1      # 嫉妬度
  
# 将来の発展可能性
potentialDevelopments:
  - {
      type: "ROMANCE",
      probability: 0.4,
      conditions: ["共に長旅をする", "個人的な秘密を共有する"],
      triggerEvents: ["生命の危機から救出", "感情的な瞬間の共有"]
    }
  # 他の発展可能性も同様に定義...

# 関係性に影響する重要アイテムや思い出
significantItems:
  - {
      name: "お守り",
      description: "相手がプレゼントしたお守り。危機的状況で役立った。",
      emotionalValue: 0.7
    }

significantMemories:
  - {
      description: "初めて背中を預けて戦った時の記憶",
      emotionalValue: 0.8,
      chapterReference: 3
    }
```

### 2.3 成長計画 (`/data/growth-plans/{planId}.json`)
```json
{
  "id": "growth-plan-xxxxx",
  "characterId": "character-xxxxx",
  "name": "主人公の成長計画",
  "description": "主人公が冒険を通じて成長する計画",
  "isActive": true,
  "growthPhases": [
    {
      "id": "phase-xxxxx",
      "name": "冒険の始まり",
      "description": "主人公が冒険に出発し、基本的なスキルを身につける段階",
      "chapterEstimate": [1, 5],
      "stageRequirement": 0,
      "parameterChanges": [
        { "parameterId": "param-strength", "change": 5 },
        { "parameterId": "param-endurance", "change": 3 }
      ],
      "skillAcquisitions": ["skill-basic-combat", "skill-survival"]
    },
    {
      "id": "phase-yyyyy",
      "name": "試練の克服",
      "description": "主人公が最初の試練を乗り越え、新たな力を身につける段階",
      "chapterEstimate": [6, 12],
      "stageRequirement": 1,
      "parameterChanges": [
        { "parameterId": "param-strength", "change": 7 },
        { "parameterId": "param-wisdom", "change": 5 },
        { "parameterId": "param-charisma", "change": 3 }
      ],
      "skillAcquisitions": ["skill-leadership", "skill-advanced-combat"]
    }
  ]
}
```

### 2.4 パラメータ定義 (`/data/parameters/definitions.json`)
```json
[
  {
    "id": "param-strength",
    "name": "筋力",
    "description": "キャラクターの肉体的な力の強さを表します",
    "category": "PHYSICAL",
    "tags": ["戦闘", "力量", "肉体"]
  },
  {
    "id": "param-intelligence",
    "name": "知性",
    "description": "キャラクターの知的能力や理解力を表します",
    "category": "MENTAL",
    "tags": ["頭脳", "知識", "学習"]
  },
  {
    "id": "param-charisma",
    "name": "魅力",
    "description": "キャラクターの人を惹きつける力や説得力を表します",
    "category": "SOCIAL",
    "tags": ["リーダーシップ", "交渉", "魅了"]
  },
  {
    "id": "param-magic",
    "name": "魔力",
    "description": "キャラクターの魔法を扱う能力を表します",
    "category": "SPECIAL",
    "tags": ["魔法", "神秘", "超常"]
  }
]
```

### 2.5 キャラクター固有パラメータ (`/data/character-parameters/{characterId}.json`)
```json
[
  {
    "id": "param-strength",
    "name": "筋力",
    "description": "キャラクターの肉体的な力の強さを表します",
    "category": "PHYSICAL",
    "tags": ["戦闘", "力量", "肉体"],
    "value": 45,
    "growth": 0
  },
  {
    "id": "param-intelligence",
    "name": "知性",
    "description": "キャラクターの知的能力や理解力を表します",
    "category": "MENTAL",
    "tags": ["頭脳", "知識", "学習"],
    "value": 70,
    "growth": 0
  }
]
```

### 2.6 スキル定義 (`/data/skills/definitions.json`)
```json
[
  {
    "id": "skill-basic-combat",
    "name": "基本戦闘術",
    "description": "基本的な戦闘技術を表します",
    "category": "COMBAT",
    "effects": [
      { "targetId": "param-strength", "modifier": 2 },
      { "targetId": "param-agility", "modifier": 1 }
    ],
    "prerequisites": [],
    "requiredParameters": [
      { "parameterId": "param-strength", "minValue": 30 }
    ],
    "learningDifficulty": 2,
    "tags": ["戦闘", "基礎スキル"],
    "genre": ["fantasy", "action", "adventure"]
  },
  {
    "id": "skill-leadership",
    "name": "リーダーシップ",
    "description": "他者を導き、鼓舞する能力",
    "category": "SOCIAL",
    "effects": [
      { "targetId": "param-charisma", "modifier": 3 },
      { "targetId": "param-wisdom", "modifier": 1 }
    ],
    "prerequisites": ["skill-communication"],
    "requiredParameters": [
      { "parameterId": "param-charisma", "minValue": 50 }
    ],
    "learningDifficulty": 3,
    "tags": ["リーダー", "社会", "指導"],
    "genre": ["business", "fantasy", "sci-fi", "drama"]
  }
]
```

### 2.7 キャラクター固有スキル (`/data/character-skills/{characterId}.json`)
```json
[
  {
    "skillId": "skill-basic-combat",
    "level": 3,
    "proficiency": 45,
    "acquired": "2024-04-01T12:00:00.000Z"
  },
  {
    "skillId": "skill-survival",
    "level": 2,
    "proficiency": 25,
    "acquired": "2024-04-02T15:30:00.000Z"
  }
]
```

## 3. 表現設定ファイル

### 3.1 表現設定 (`/preferences/expressions.yaml`)
```yaml
tone: 親しみやすくも荘厳さのある文体
narrativeStyle: 三人称視点、過去形
restrictions:
  - 現代的な口語表現を避ける
  - 過度な擬音語・擬態語の使用を控える
```

## 4. システムパラメータ設定

### 4.1 パラメータ設定（ファイルパス未指定）
```json
{
  "version": "1.0.0",
  "name": "システム設定",
  "description": "システムパラメータ設定",
  "lastModified": "2023-01-01T00:00:00.000Z",
  "parameters": {
    "generation": {
      "targetLength": 8000,
      "minLength": 7500,
      "maxLength": 8500,
      "model": "gemini-2.0-flash-lite",
      "temperature": 0.7,
      "topP": 0.9,
      "topK": 50,
      "frequencyPenalty": 0.6,
      "presencePenalty": 0.3
    },
    "memory": {
      "shortTermChapters": 8,
      "midTermArcSize": 4,
      "summaryDetailLevel": 7,
      "consistencyThreshold": 0.85
    },
    "characters": {
      "maxMainCharacters": 5,
      "maxSubCharacters": 15,
      "characterBleedTolerance": 0.2,
      "newCharacterIntroRate": 0.15
    },
    "plot": {
      "foreshadowingDensity": 0.6,
      "resolutionDistance": 8,
      "abstractConcreteBalance": 0.5,
      "coherenceCheckFrequency": 1
    },
    "progression": {
      "maxSameStateChapters": 3,
      "stagnationThreshold": 0.8,
      "tensionMinVariance": 0.1,
      "dialogActionRatio": 0.6
    },
    "system": {
      "autoSaveInterval": 15,
      "maxHistoryItems": 100,
      "logLevel": "info",
      "workingDirectory": "./data",
      "backupEnabled": true,
      "backupCount": 5
    }
  }
}
```

これらの設定ファイルを適切に構成することで、AIを使用した小説自動生成システムが必要な情報を得て、一貫性のある高品質な物語を生成できるようになります。各ファイルは互いに関連しており、キャラクター、プロット、世界設定、テーマなどの要素が有機的に連携することで、物語全体の整合性が保たれます。

## コントリビューション

Auto Novel Systemへの貢献を歓迎します。コントリビューションの前に以下をご確認ください：

1. プロジェクトの[コーディング規約](docs/development/coding-standards.md)を確認
2. [Git運用ルール](docs/development/git-workflow.md)に従ってブランチとコミットを管理
3. テストを追加または更新し、すべてのテストが通ることを確認
4. プルリクエストを作成する際には、変更内容を詳しく説明

## ライセンス

このプロジェクトは [MIT License](LICENSE) のもとで公開されています。

## お問い合わせ

質問や提案がある場合は、GitHub Issuesでお問い合わせください。# novel
