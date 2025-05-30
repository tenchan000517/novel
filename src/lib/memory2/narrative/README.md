# Narrative Memory System 仕様書

## 概要

Narrative Memory Systemは、AIによる小説自動生成システムにおいて、物語の状態、キャラクター、環境、感情などの情報を階層的に管理するシステムです。各コンポーネントは独自のJSONファイルでデータを永続化し、他のコンポーネントから統一されたAPIでアクセス可能です。

---

## 1. ChapterAnalysisManager

### 保存ファイル

#### 1.1 narrative-memory/summaries.json
**概要**: 章ごとの要約データを保存

**データ構造**:
```json
[
  {
    "chapterNumber": 1,
    "summary": "主人公がビジネスアイデアを思いつき、初期の市場調査を開始する。カフェで共同創業者と出会い、事業計画の大枠を議論する。",
    "timestamp": "2024-01-15T09:30:00.000Z"
  },
  {
    "chapterNumber": 3,
    "summary": "製品プロトタイプが完成し、初期のユーザーテストを実施。想定以上の好反応を得て、本格的な資金調達の準備に入る。",
    "timestamp": "2024-01-15T12:45:00.000Z"
  }
]
```

**フィールド説明**:
- `chapterNumber`: 章番号（整数、1以上）
- `summary`: 章の要約文（100-150文字程度）
- `timestamp`: 要約生成日時（ISO8601形式）

**保存条件**: 3章ごとに自動生成、手動設定も可能

**データ期限**: 制限なし（永続保存）

#### 1.2 narrative-memory/chapter-analysis-config.json
**概要**: 章分析の設定情報

**データ構造**:
```json
{
  "genre": "business",
  "lastAnalyzedChapter": 12,
  "analysisSettings": {
    "summaryInterval": 3,
    "enableGenreSpecificAnalysis": true,
    "businessEventDetection": true
  }
}
```

### API使用方法

```typescript
import { ChapterAnalysisManager } from '@/lib/memory/narrative/chapter-analysis-manager';

const manager = new ChapterAnalysisManager();
await manager.initialize();

// 章要約を取得
const summary = await manager.getChapterSummary(5);

// 範囲指定で要約を取得
const summaries = await manager.getChapterSummariesInRange(1, 10);

// すべての要約を取得
const allSummaries = await manager.getAllChapterSummaries();

// 手動で要約を設定
await manager.setChapterSummary(7, "カスタム要約文");

// ジャンル特化分析を実行
const analysis = await manager.analyzeChapterForGenre(chapter);

// 統計情報を取得
const stats = manager.getSummaryStatistics();
```

---

## 2. CharacterTrackingManager

### 保存ファイル

#### 2.1 narrative-memory/characters.json
**概要**: キャラクターの進行状況データ

**データ構造**:
```json
[
  {
    "name": "田中太郎",
    "firstAppearance": 1,
    "lastAppearance": 15,
    "appearanceCount": 8,
    "developmentPoints": [
      {
        "chapter": 3,
        "event": "田中太郎がリーダーシップを発揮し、チームをまとめる決断を下した",
        "timestamp": "2024-01-15T10:30:00.000Z"
      },
      {
        "chapter": 8,
        "event": "田中太郎の変化: roleが「一般社員」から「リーダー」に変化",
        "timestamp": "2024-01-15T14:20:00.000Z"
      }
    ]
  }
]
```

#### 2.2 narrative-memory/character-changes.json
**概要**: キャラクターの詳細な変化履歴

**データ構造**:
```json
{
  "田中太郎": [
    {
      "attribute": "role",
      "previousValue": "一般社員",
      "currentValue": "リーダー",
      "classification": {
        "type": "役職変化",
        "scope": "組織全体",
        "confidence": 0.8,
        "explanation": "キャラクターが組織のリーダー的役割を担うようになった",
        "narrativeSignificance": 0.9
      }
    }
  ]
}
```

#### 2.3 narrative-memory/character-tracking-config.json
**概要**: キャラクタートラッキングの設定

**データ構造**:
```json
{
  "genre": "business",
  "trackingSettings": {
    "enableBusinessRoles": true,
    "detectDevelopmentEvents": true,
    "characterExtractionMode": "advanced"
  }
}
```

### API使用方法

```typescript
import { CharacterTrackingManager } from '@/lib/memory/narrative/character-tracking-manager';

const manager = new CharacterTrackingManager();
await manager.initialize();

// キャラクター進行状況を取得
const progress = manager.getCharacterProgress("田中太郎");

// すべてのキャラクター名を取得
const names = manager.getAllCharacterNames();

// 特定章のキャラクターを取得
const charactersInChapter = manager.getCharactersInChapter(5);

// 最も活発なキャラクターを取得
const activeCharacters = manager.getMostActiveCharacters(5);

// キャラクター変化を手動記録
await manager.recordCharacterChanges("田中太郎", 10, changes);

// 統計情報を取得
const stats = manager.getCharacterStatistics();
```

---

## 3. EmotionalDynamicsManager

### 保存ファイル

#### 3.1 narrative-memory/emotional-dynamics.json
**概要**: 感情ダイナミクスの総合データ

**データ構造**:
```json
{
  "tensionPoints": [
    {
      "chapter": 1,
      "level": 5
    },
    {
      "chapter": 2,
      "level": 7
    }
  ],
  "tensionHistory": {
    "1": 0.5,
    "2": 0.7,
    "3": 0.6
  },
  "emotionalTones": [
    {
      "chapter": 1,
      "tone": "期待感に満ちた"
    },
    {
      "chapter": 2,
      "tone": "緊張感のある"
    }
  ],
  "chapterEmotions": {
    "1": {
      "emotionalDimensions": {
        "hopeVsDespair": { "start": 7, "middle": 6, "end": 8 },
        "comfortVsTension": { "start": 4, "middle": 5, "end": 6 },
        "joyVsSadness": { "start": 6, "middle": 6, "end": 7 },
        "empathyVsIsolation": { "start": 5, "middle": 6, "end": 6 },
        "curiosityVsIndifference": { "start": 8, "middle": 7, "end": 8 }
      },
      "overallTone": "期待感に満ちた",
      "emotionalImpact": 7
    }
  },
  "genre": "business",
  "syncMetricsData": {
    "ビジネス戦略": {
      "INTRODUCTION": {
        "alignmentScore": 0.8,
        "emotionalResonance": 0.7,
        "learningEffectiveness": 0.85,
        "narrativeCoherence": 0.9,
        "updatedAt": "2024-01-15T15:30:00.000Z"
      }
    }
  }
}
```

**データ期限**: 制限なし（永続保存）

### API使用方法

```typescript
import { EmotionalDynamicsManager } from '@/lib/memory/narrative/emotional-dynamics-manager';

const manager = new EmotionalDynamicsManager();
await manager.initialize();

// 最適テンション計算
const tension = await manager.calculateOptimalTension(5);

// テンション・ペーシング推奨を取得
const recommendation = await manager.getTensionPacingRecommendation(5);

// 感情アークを設計
const emotionalArc = await manager.designEmotionalArc(5);

// 感情曲線を取得
const curve = await manager.getEmotionalCurve(1, 10);

// 同期指標を更新
manager.updateSyncMetrics("ビジネス戦略", LearningStage.DEVELOPMENT, metrics);

// 現在のテンションレベルを取得
const currentTension = manager.getCurrentTensionLevel();
```

---

## 4. NarrativeStateManager

### 保存ファイル

#### 4.1 narrative-memory/state.json
**概要**: 物語状態の管理データ

**データ構造**:
```json
{
  "currentState": "PRODUCT_DEVELOPMENT",
  "currentArcNumber": 2,
  "currentTheme": "製品開発への挑戦",
  "arcStartChapter": 5,
  "arcEndChapter": -1,
  "arcCompleted": false,
  "stateTransitions": [
    {
      "fromState": "MARKET_RESEARCH",
      "toState": "PRODUCT_DEVELOPMENT",
      "chapter": 5,
      "timestamp": "2024-01-15T11:00:00.000Z",
      "keyEvent": "市場調査の結果を踏まえた開発フェーズ移行"
    }
  ],
  "turningPoints": [
    {
      "chapter": 5,
      "description": "市場調査の結果を踏まえ、製品開発フェーズに移行",
      "significance": 8,
      "timestamp": "2024-01-15T11:00:00.000Z"
    }
  ],
  "genre": "business"
}
```

#### 4.2 narrative-memory/turning-points.json
**概要**: ターニングポイントの詳細データ

**データ構造**:
```json
[
  {
    "chapter": 3,
    "description": "初回の資金調達に成功し、本格的な事業展開への道筋を確立",
    "significance": 9,
    "timestamp": "2024-01-15T10:45:00.000Z"
  },
  {
    "chapter": 7,
    "description": "製品プロトタイプの完成により投資家へのピッチ段階に移行",
    "significance": 8,
    "timestamp": "2024-01-15T13:20:00.000Z"
  }
]
```

**データ制限**: ターニングポイントは重要度順に最大10件まで保存

### API使用方法

```typescript
import { NarrativeStateManager } from '@/lib/memory/narrative/narrative-state-manager';

const manager = new NarrativeStateManager();
await manager.initialize();

// 現在の物語状態を取得
const state = await manager.getCurrentState(10);

// 停滞を検出
const stagnation = await manager.detectStagnation(10);

// 次の推奨状態を取得
const nextState = manager.suggestNextState();

// ターニングポイントを取得
const turningPoints = manager.getTurningPoints();

// アーク情報を設定
manager.setArcInfo(2, "成長期の挑戦", 8, 15, false);

// 手動でターニングポイントを追加
manager.addTurningPoint({
  chapter: 12,
  description: "重要な契約獲得により事業が軌道に乗る",
  significance: 8
});
```

---

## 5. WorldContextManager

### 保存ファイル

#### 5.1 narrative-memory/world-context.json
**概要**: 世界設定とコンテキスト情報

**データ構造**:
```json
{
  "genre": "business",
  "previousLocation": "インキュベーター施設の個室",
  "currentLocation": "VCファームの役員会議室",
  "currentTimeOfDay": "大型調達のピッチ準備",
  "currentWeather": "スケーリングの興奮",
  "currentAtmosphere": "戦略的思考が求められる環境",
  "currentBusinessPhase": "SCALE_PHASE",
  "currentArcNumber": 3,
  "environmentHistory": [
    {
      "location": "コワーキングスペースの共有デスク",
      "timeOfDay": "早朝のブレインストーミング",
      "weather": "創造的な熱気",
      "atmosphere": "アイデアが湧き出る興奮",
      "businessPhase": "IDEA_PHASE",
      "narrativeState": "MARKET_RESEARCH",
      "timestamp": "2024-01-15T09:00:00.000Z"
    },
    {
      "location": "VCファームの役員会議室",
      "timeOfDay": "大型調達のピッチ準備",
      "weather": "スケーリングの興奮",
      "atmosphere": "戦略的思考が求められる環境",
      "businessPhase": "SCALE_PHASE",
      "timestamp": "2024-01-15T15:30:00.000Z"
    }
  ]
}
```

**データ制限**: 環境履歴は最新50件まで保存

### API使用方法

```typescript
import { WorldContextManager } from '@/lib/memory/narrative/world-context-manager';

const manager = new WorldContextManager();
await manager.initialize();

// 現在の環境情報を取得
const env = manager.getEnvironmentInfo();

// 環境情報を設定
manager.setEnvironmentInfo("新オフィス", "午後の会議", "緊張感のある雰囲気");

// ビジネスフェーズを設定
manager.setBusinessPhase(BusinessGrowthPhase.EXPANSION);

// 現在のフェーズに適した場所を提案
const locations = manager.suggestLocationsForCurrentPhase();

// 環境履歴を取得
const history = manager.getEnvironmentHistory(10);

// 場所のメタデータを取得
const metadata = manager.getLocationMetadata("VCファームの役員会議室");

// 環境の一貫性をチェック
const consistency = manager.checkEnvironmentConsistency();
```

---

## 統合使用例

### マスターマネージャーでの統合利用

```typescript
// 全マネージャーを統合利用する例
class NarrativeMemorySystem {
  private chapterAnalysis: ChapterAnalysisManager;
  private characterTracking: CharacterTrackingManager;
  private emotionalDynamics: EmotionalDynamicsManager;
  private narrativeState: NarrativeStateManager;
  private worldContext: WorldContextManager;

  async initialize() {
    await Promise.all([
      this.chapterAnalysis.initialize(),
      this.characterTracking.initialize(),
      this.emotionalDynamics.initialize(),
      this.narrativeState.initialize(),
      this.worldContext.initialize()
    ]);
  }

  async processChapter(chapter: Chapter, options: UpdateOptions) {
    // 全マネージャーを同期更新
    await Promise.all([
      this.chapterAnalysis.updateFromChapter(chapter, options),
      this.characterTracking.updateFromChapter(chapter, options),
      this.emotionalDynamics.updateFromChapter(chapter, options),
      this.narrativeState.updateFromChapter(chapter, options),
      this.worldContext.updateFromChapter(chapter, options)
    ]);

    // 統合分析の実行
    const analysis = await this.generateIntegratedAnalysis(chapter.chapterNumber);
    return analysis;
  }

  async generateIntegratedAnalysis(chapterNumber: number) {
    const [
      summary,
      characters,
      emotions,
      state,
      environment
    ] = await Promise.all([
      this.chapterAnalysis.getChapterSummary(chapterNumber),
      this.characterTracking.getCharactersInChapter(chapterNumber),
      this.emotionalDynamics.getChapterEmotion(chapterNumber),
      this.narrativeState.getCurrentState(chapterNumber),
      this.worldContext.getEnvironmentInfo()
    ]);

    return {
      summary,
      characters,
      emotions,
      state,
      environment,
      timestamp: new Date().toISOString()
    };
  }
}
```

---

## データ管理とメンテナンス

### バックアップとリストア

```typescript
// データの完全バックアップ
async function backupNarrativeMemory(): Promise<NarrativeMemoryBackup> {
  return {
    summaries: await storageProvider.readFile('narrative-memory/summaries.json'),
    characters: await storageProvider.readFile('narrative-memory/characters.json'),
    characterChanges: await storageProvider.readFile('narrative-memory/character-changes.json'),
    emotionalDynamics: await storageProvider.readFile('narrative-memory/emotional-dynamics.json'),
    narrativeState: await storageProvider.readFile('narrative-memory/state.json'),
    turningPoints: await storageProvider.readFile('narrative-memory/turning-points.json'),
    worldContext: await storageProvider.readFile('narrative-memory/world-context.json'),
    timestamp: new Date().toISOString()
  };
}
```

### データクリーンアップ

```typescript
// 古いデータのクリーンアップ（必要に応じて）
async function cleanupOldData(olderThanDays: number): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  
  // 環境履歴のクリーンアップ例
  const worldContext = await manager.getEnvironmentHistory();
  const cleanedHistory = worldContext.filter(
    env => new Date(env.timestamp) > cutoffDate
  );
  
  // 必要に応じて他のデータも同様にクリーンアップ
}
```

---

## エラーハンドリング

### 共通エラーパターン

```typescript
try {
  await manager.initialize();
} catch (error) {
  if (error instanceof StorageError) {
    // ストレージアクセスエラー
    console.error('Storage access failed:', error.message);
  } else if (error instanceof ValidationError) {
    // データ検証エラー
    console.error('Data validation failed:', error.message);
  } else {
    // その他のエラー
    console.error('Unexpected error:', error);
  }
}
```

### データ復旧

```typescript
// データ破損時の復旧処理
async function recoverFromCorruption(managerType: string): Promise<void> {
  try {
    // バックアップからの復旧を試行
    await restoreFromBackup(managerType);
  } catch (error) {
    // バックアップも失敗した場合は初期化
    await initializeFromScratch(managerType);
  }
}
```

---

## パフォーマンス最適化

### 推奨事項

1. **バッチ処理**: 複数章の一括処理で I/O を削減
2. **キャッシュ活用**: 頻繁にアクセスするデータのメモリキャッシュ
3. **遅延読み込み**: 必要時にのみデータを読み込み
4. **定期保存**: 変更があった場合のみ保存を実行

### モニタリング

```typescript
// パフォーマンス監視の例
class PerformanceMonitor {
  private metrics = new Map<string, number>();

  async measureOperation<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      this.metrics.set(operation, Date.now() - start);
      return result;
    } catch (error) {
      this.metrics.set(`${operation}_error`, Date.now() - start);
      throw error;
    }
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}
```

このNarrative Memory Systemの仕様書により、各コンポーネントのデータ構造と使用方法が明確になり、効率的な小説自動生成システムの構築が可能になります。