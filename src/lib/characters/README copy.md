# AI小説生成システム - キャラクター管理システム仕様書

## 1. システム概要

### 1.1 システム目的
AI小説自動生成システムにおいて、キャラクターのライフサイクル全体を管理し、動的な成長・関係性変化・心理状態の追跡を行うシステム。

### 1.2 アーキテクチャ概要
```
┌─────────────────────────────────────────────┐
│           CharacterManager (Facade)         │
├─────────────────────────────────────────────┤
│  Services Layer                             │
│  ├─ CharacterService    ├─ RelationshipService │
│  ├─ EvolutionService    ├─ PsychologyService   │
│  ├─ DetectionService    ├─ ParameterService    │
│  └─ SkillService        └─ TimingAnalyzer      │
├─────────────────────────────────────────────┤
│  Repository Layer                           │
│  ├─ CharacterRepository ├─ RelationshipRepo   │
│  ├─ ParameterRepository ├─ SkillRepository    │
│  └─ Storage Provider (File System)            │
├─────────────────────────────────────────────┤
│  Analysis & AI Layer                       │
│  ├─ CharacterAnalyzer   ├─ RelationshipAnalyzer│
│  ├─ TimingAnalyzer      └─ GeminiClient       │
├─────────────────────────────────────────────┤
│  Event System                               │
│  └─ EventBus (pub/sub pattern)              │
└─────────────────────────────────────────────┘
```

## 2. 主要コンポーネント詳細

### 2.1 CharacterManager (ファサード)

**役割**: 外部システムからの統一インターフェース提供

**主要メソッド**:
- `getCharactersWithDetails()` - 詳細付きキャラクター情報取得
- `createCharacter()` - キャラクター作成
- `processCharacterDevelopment()` - キャラクター発展処理
- `processGeneratedChapter()` - 生成された章の処理

**呼び出し元**: 
- ContextGenerator (章生成時)
- ChapterGenerator (キャラクター情報取得)

### 2.2 CharacterService

**役割**: キャラクター基本操作の中心ロジック

**主要機能**:
- キャラクター作成・更新・削除
- 登場記録管理
- インタラクション記録
- 状態管理

**データフロー**:
```
外部要求 → CharacterService → CharacterRepository → FileSystem
                ↓
          EventBus (イベント発行)
```

### 2.3 EvolutionService

**役割**: キャラクターの成長・発展管理

**主要機能**:
- 成長計画管理
- 発展段階評価
- 成長フェーズ適用
- マイルストーン追跡

**成長処理フロー**:
```
1. イベント受信 (CHARACTER_DEVELOPMENT_REQUESTED)
2. analyzeDevelopmentImpact() - 発展影響分析
3. evaluateDevelopmentStage() - 段階評価
4. applyDevelopmentToCharacter() - 結果適用
5. イベント発行 (CHARACTER_DEVELOPMENT_COMPLETED)
```

### 2.4 DetectionService

**役割**: コンテンツ内キャラクター検出

**検出ロジック**:
1. **直接名前検出**: 正規表現パターンマッチング
2. **ショートネーム検出**: 略称・愛称での検出
3. **敬称・役職検出**: 「先生」「社長」等での間接検出
4. **代名詞解決**: 文脈に基づく代名詞の解決

**検出パターン**:
```typescript
DETECTION_PATTERNS = {
  NAME_MATCH: (name: string) => new RegExp(`\\b${name}\\b`, 'i'),
  DIALOG_CHARACTER: (name: string) => new RegExp(`${name}[はがも]?[、：:]*[「"]([^」"]+)[」"]`, 'g'),
  ACTION: /([a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)(?:は|が)([a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]+)(?:した|する|して)/g
}
```

### 2.5 PsychologyService

**役割**: キャラクター心理分析

**分析プロセス**:
1. **基本心理情報収集**: 性格特性、背景、最近のイベント
2. **AI分析**: GeminiClient経由で心理状態分析
3. **結果パース**: JSON形式の分析結果を構造化データに変換
4. **関係性心理分析**: キャラクター間の感情的態度分析

**心理データ構造**:
```typescript
interface CharacterPsychology {
  currentDesires: string[];      // 現在の欲求
  currentFears: string[];        // 現在の恐れ
  internalConflicts: string[];   // 内的葛藤
  emotionalState: {[key: string]: number}; // 感情状態
  relationshipAttitudes: {[characterId: string]: RelationshipAttitude};
}
```

## 3. データ保存仕様

### 3.1 ファイル構造
```
characters/
├── definitions/          # キャラクター定義（不変データ）
│   └── {characterId}.yaml
├── states/              # キャラクター状態（可変データ）
│   └── {characterId}.yaml
├── main/                # レガシー統合ファイル
├── sub-characters/      # サブキャラクター
└── mob-characters/      # モブキャラクター

parameters/
├── definitions.json     # パラメータ定義
└── characters/
    └── {characterId}.json

skills/
├── definitions.json     # スキル定義
└── characters/
    └── {characterId}.json

relationships/
├── pairs/
│   └── {id1}_{id2}.json # ID順でソートされたペア
└── relationshipGraph.json
```

### 3.2 キャラクター定義ファイル仕様

**不変データ (characters/definitions/{id}.yaml)**:
```yaml
id: string
name: string
shortNames: string[]
description: string
type: 'MAIN' | 'SUB' | 'MOB'
appearance:
  physicalDescription: string
  clothing: string
  distinguishingFeatures: string[]
backstory:
  summary: string
  significantEvents: string[]
  trauma?: string[]
  origin?: string
personality:
  traits: string[]
  values: string[]
  quirks: string[]
metadata:
  createdAt: Date
  version: number
  tags: string[]
```

**可変データ (characters/states/{id}.yaml)**:
```yaml
isActive: boolean
developmentStage: number
lastAppearance: number | null
emotionalState: EmotionalState
relationships: Relationship[]
parameters: CharacterParameter[]
skills: SkillData[]
activeGrowthPlanId?: string
completedGrowthPlans: string[]
growthPhaseHistory: GrowthPhaseHistory[]
promotionHistory: PromotionRecord[]
injuries: InjuryRecord[]
health: number
transformations: TransformationRecord[]
```

### 3.3 パラメータファイル仕様

**パラメータ定義 (parameters/definitions.json)**:
```json
[
  {
    "id": string,
    "name": string,
    "description": string,
    "category": "PHYSICAL" | "MENTAL" | "SOCIAL" | "TECHNICAL" | "SPECIAL",
    "tags": string[]
  }
]
```

**キャラクターパラメータ (parameters/characters/{id}.json)**:
```json
[
  {
    "id": string,
    "name": string,
    "description": string,
    "value": number,        // 0-100
    "growth": number,       // 成長率
    "category": ParameterCategory,
    "tags": string[]
  }
]
```

### 3.4 スキルファイル仕様

**スキル定義 (skills/definitions.json)**:
```json
[
  {
    "id": string,
    "name": string,
    "description": string,
    "requiredParameters": [
      {
        "parameterId": string,
        "minValue": number
      }
    ],
    "prerequisites": string[],  // 前提スキルID
    "effects": [
      {
        "targetId": string,     // 影響するパラメータID
        "modifier": number      // 修正値
      }
    ],
    "learningDifficulty": number, // 1-10
    "tags": string[],
    "genre": string[]
  }
]
```

## 4. API呼び出しフロー

### 4.1 章生成時のキャラクター情報取得

```typescript
// ContextGenerator → CharacterManager
async getCharactersWithDetails(characterIds?, chapterNumber?) 
  → buildCharacterWithDetails()
    → getCharacterSkills()
    → getCharacterParameters() 
    → getCharacterRelationships()
    → getActiveGrowthPlan()
    → formatRelationshipsForDetails()
  → CharacterWithDetails[]
```

### 4.2 キャラクター成長処理

```typescript
// 章生成完了時
processGeneratedChapter(chapter: Chapter)
  → detectCharactersInContent(chapter.content)
  → recordCharacterAppearance()
  → applyGrowthPlan()
    → getApplicablePhase()
    → parameterRepository.updateParameterValue()
    → skillRepository.saveCharacterSkills()
  → processCharacterInteractionsInChapter()
```

### 4.3 心理分析フロー

```typescript
analyzeCharacterPsychology(character, recentEvents)
  → buildPsychologyAnalysisPrompt()
  → apiThrottler.throttledRequest()
    → geminiClient.generateText()
  → parsePsychologyResponse()
  → psychologyCache.set()
  → EventBus.publish(CHARACTER_ANALYZED)
```

## 5. イベントシステム

### 5.1 イベントタイプ定義

```typescript
EVENT_TYPES = {
  // キャラクターイベント
  CHARACTER_CREATED: 'character.created',
  CHARACTER_UPDATED: 'character.updated',
  CHARACTER_APPEARANCE: 'character.appearance',
  CHARACTER_DEVELOPMENT_REQUESTED: 'character.development.requested',
  CHARACTER_DEVELOPMENT_COMPLETED: 'character.development.completed',
  
  // 関係性イベント
  RELATIONSHIP_UPDATED: 'relationship.updated',
  RELATIONSHIP_ANALYZED: 'relationship.analyzed',
  
  // 成長イベント
  GROWTH_PLAN_STARTED: 'growth.plan.started',
  GROWTH_PLAN_COMPLETED: 'growth.plan.completed',
  GROWTH_PHASE_COMPLETED: 'growth.phase.completed',
  
  // パラメータ・スキルイベント
  PARAMETER_CHANGED: 'parameter.changed',
  SKILL_ACQUIRED: 'skill.acquired',
  SKILL_LEVEL_UP: 'skill.level.up'
}
```

### 5.2 イベント発行・購読パターン

```typescript
// 発行
eventBus.publish(EVENT_TYPES.CHARACTER_CREATED, {
  timestamp: new Date(),
  character: Character
});

// 購読
eventBus.subscribe(EVENT_TYPES.CHARACTER_DEVELOPMENT_REQUESTED, async (data) => {
  const { characterId, events, character } = data;
  // 処理実行
});
```

## 6. 分析ロジック詳細

### 6.1 キャラクター変化検出

**CharacterAnalyzer.detectChanges()**:

1. **基本属性比較**: mood, development, emotionalState
2. **発展段階変化**: developmentStage
3. **関係性変化**: relationships配列の差分
4. **性格特性変化**: personality.traits
5. **スキル変化**: abilities, skills, powers

**変化分類ロジック**:
```typescript
classifyByRules(attribute, prevValue, currValue, developmentStage) {
  // 感情・気分 → TEMPORARY
  if (attribute === 'mood' || attribute === 'emotionalState') {
    return { type: 'TEMPORARY', scope: 'EMOTIONAL_STATE' };
  }
  
  // 性格特性 → 発展段階に応じてGROWTH/TEMPORARY
  if (attribute.startsWith('personality_')) {
    return {
      type: developmentStage >= 3 ? 'GROWTH' : 'TEMPORARY',
      scope: 'CORE_PERSONALITY'
    };
  }
  
  // スキル → GROWTH
  if (attribute.includes('skill')) {
    return { type: 'GROWTH', scope: 'SKILLS' };
  }
}
```

### 6.2 関係性クラスター検出

**RelationshipAnalyzer.detectClusters()**:

1. **関係グラフ構築**: 双方向関係性マップ作成
2. **幅優先探索**: 強度0.6以上の関係性でクラスター形成
3. **優勢関係タイプ特定**: クラスター内で最多の関係タイプ
4. **結束度計算**: 平均関係強度

### 6.3 登場タイミング分析

**TimingAnalyzer.analyzeTimingFactors()**:

1. **プロット関連度**: キャラクターとプロットポイントの関連性
2. **キャラクター発展**: 発展段階とストーリー進行の適合性
3. **ナラティブペーシング**: 物語テンポとキャラクター密度
4. **読者期待**: 前回登場からの経過と最適再登場間隔

**タイミングスコア統合**:
```typescript
weights = {
  'PLOT_RELEVANCE': 0.4,
  'CHARACTER_DEVELOPMENT': 0.25,
  'NARRATIVE_PACING': 0.2,
  'READER_EXPECTATIONS': 0.15
}

normalizedScore = Σ(factor.score × weight) / Σ(weight)
```

## 7. AI連携仕様

### 7.1 Gemini API連携

**PsychologyService.analyzeCharacterPsychology()**:

- **入力**: キャラクター基本情報 + 最近のイベント + 既存心理状態
- **プロンプト構造**:
  ```
  # キャラクター心理分析
  ## キャラクター基本情報
  名前: {name}
  性格特性: {traits}
  ## 最近のイベント
  {recentEvents}
  ## 分析指示
  JSON形式で以下を出力:
  {
    "currentDesires": [...],
    "currentFears": [...],
    "internalConflicts": [...],
    "emotionalState": {...}
  }
  ```
- **出力処理**: JSON抽出 → パース → バリデーション → キャッシュ

### 7.2 APIスロットリング

```typescript
apiThrottler.throttledRequest(() => 
  geminiClient.generateText(prompt, {
    temperature: 0.2,      // 一貫性重視
    targetLength: 800,
    purpose: 'analysis',
    responseFormat: 'json'
  })
)
```

## 8. 設定ファイル仕様

### 8.1 成長計画定義

**期待される外部設定**:
```typescript
interface GrowthPlan {
  id: string;
  characterId: string;
  name: string;
  description: string;
  targetParameters: Array<{
    parameterId: string;
    targetValue: number;
    priority: number;
  }>;
  targetSkills: Array<{
    skillId: string;
    priority: number;
    narrativeRequirement?: string;
  }>;
  growthPhases: GrowthPhase[];
  estimatedDuration: number;
  isActive: boolean;
}
```

### 8.2 ジャンル別設定

**パラメータ・スキルジャンルマッピング**:
```typescript
genreTagMapping = {
  'fantasy': ['魔法', '戦闘', '冒険'],
  'business': ['経営', '交渉', 'リーダーシップ'],
  'mystery': ['観察', '推理', '記憶'],
  'romance': ['魅力', '共感', '感情'],
  'sci-fi': ['知識', '創造性', '適応力']
}
```

## 9. 外部連携ポイント

### 9.1 ContextGenerator連携

**呼び出しタイミング**: 章生成前のコンテキスト構築時

**主要API**:
- `getCharactersWithDetails()` - キャラクター詳細情報取得
- `getActiveCharactersWithDetails()` - アクティブキャラクター取得
- `getMainCharactersWithDetails()` - メインキャラクター取得

### 9.2 ChapterGenerator連携

**呼び出しタイミング**: 章生成完了後の更新処理

**主要API**:
- `processGeneratedChapter()` - 生成章の処理
- `detectCharactersInContent()` - キャラクター検出
- `recordCharacterAppearance()` - 登場記録

### 9.3 ContentAnalysisManager連携

**呼び出しタイミング**: キャラクター推奨システム

**主要API**:
- `getCharacterRecommendations()` - 章別キャラクター推奨
- `prepareCharacterInfoForChapterGeneration()` - 章生成用情報準備

## 10. パフォーマンス最適化

### 10.1 キャッシュ戦略

- **CharacterRepository**: インメモリキャッシュ（5分TTL）
- **PsychologyService**: 心理分析結果キャッシュ（1時間TTL）
- **RelationshipAnalyzer**: 分析結果キャッシュ（30分TTL）

### 10.2 遅延読み込み

- パラメータ・スキルは必要時にロード
- 関係性分析は要求時に実行
- 重い分析処理は並列実行

## 11. エラーハンドリング

### 11.1 データ整合性

- 必須フィールド検証
- 関係性の双方向整合性チェック
- パラメータ値範囲検証（0-100）

### 11.2 フォールバック戦略

- AI分析失敗時のデフォルト値提供
- ファイル読み込み失敗時の空データ返却
- 分析エラー時の基本機能継続

この仕様書に基づいて、キャラクター管理システムの全体像と詳細な動作フローが把握できます。