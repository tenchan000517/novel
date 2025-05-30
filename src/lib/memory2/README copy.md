# 📊 現状の保存・アクセス実態分析（事実のみ）

## 1. WorldSettingsManager

### 📁 保存場所・方法
```typescript
// ファイルベース保存
const filePath = 'config/world-settings.yaml';
const filePath = 'config/theme-tracker.yaml';

// フォールバック処理でのワークアラウンド
(this.worldSettingsManager as any).worldSettings = fallbackSettings;
(this.worldSettingsManager as any).initialized = true;
```

### 📋 保存したい内容
- `WorldSettings`: ジャンル、説明、地域、ビジネスシステム、技術レベル、社会システム、魔法システム、固有要素
- `ThemeSettings`: 説明、メインテーマ
- `FormattedWorldAndTheme`: プロンプト用に整形されたデータ

### 🔄 アクセスパターン
- `getGenre()`: ジャンル取得
- `getFormattedWorldAndTheme()`: プロンプト用整形データ
- `hasValidWorldSettings()`, `hasValidThemeSettings()`: 設定有効性確認

---

## 2. StoryGenerationBridge

### 📁 現在のアクセス先
```typescript
// 短期記憶
const shortTermMemory = memoryManager.getShortTermMemory();
const recentChapters = await shortTermMemory.getRecentChapters(5);
const currentChapter = await shortTermMemory.getChapter(chapterNumber - 1);

// 中期記憶
const midTermMemory = memoryManager.getMidTermMemory();
const currentArc = await memoryManager.getCurrentArc(chapterNumber);

// 長期記憶
const longTermMemory = memoryManager.getLongTermMemory();
const summaries = await longTermMemory.getSummaries();

// 重要イベント
const importantEvents = await memoryManager.getImportantEvents(
  Math.max(1, chapterNumber - 10), chapterNumber - 1
);

// 物語状態
const narrativeState = await memoryManager.getNarrativeState(chapterNumber);

// 感情曲線
return await memoryManager.getEmotionalCurve(startChapter, chapterNumber - 1);
```

### 📋 取得したい内容
```typescript
interface 取得したいデータ {
  shortTerm: {
    recentChapters: any[];
    currentChapter: any;
    importantEvents: KeyEvent[];
  };
  midTerm: {
    currentArc: any;
  };
  longTerm: {
    summaries: any[];
  };
  narrativeState: NarrativeStateInfo;
  emotionalCurve: EmotionalCurvePoint[];
}
```

### 🎯 生成したい結果
- `ChapterDirectives`: 章の目標、必須要素、現在の場所・状況、活動キャラクター、世界設定焦点、テーマ焦点

---

## 3. StoryPhaseManager

### 📁 現在の処理方法
```typescript
// 毎回計算で推定
const phaseStart = matchingConcretePlot.chapterRange[0];
const phaseEnd = matchingConcretePlot.chapterRange[1];
const phaseProgress = (chapterNumber - phaseStart) / phaseLength;

// 推定総章数に基づく計算
const estimatedTotalChapters = 50;
const progress = chapterNumber / estimatedTotalChapters;
```

### 📋 管理したい内容
```typescript
interface PhaseInfo {
  phase: string;               // OPENING, EARLY, MIDDLE, LATE, CLIMAX, ENDING
  isTransitionPoint: boolean;
  phaseProgress: number;       // 0-1でフェーズ内の進行度
  nextPhase?: string;
  importance: number;          // フェーズの重要度 0-1
}

interface StructureMap {
  phase: string;
  chapterRange: [number, number];
  title: string;
  summary?: string;
  thematicPurpose?: string;
}
```

### 🔄 現在の問題
- 毎回計算による非効率
- 物語構造マップが保存されない
- フェーズ情報のキャッシュなし

---

## 4. PlotManager

### 📁 現在の保存先（複数分散）
```typescript
// プロットストレージ（ファイル）
await this.plotStorage.initialize()

// 世界設定マネージャー（ファイル）
await this.worldSettingsManager.initialize()

// 篇マネージャー（複数箇所）
const sectionPlotManager = getSectionPlotManagerInstance();

// 世界知識への永続化（未実装）
// 注: WorldKnowledge クラスに拡張が必要
if (typeof worldKnowledge['storeSectionPlots'] === 'function') {
  await worldKnowledge['storeSectionPlots'](Array.from(this.sectionPlots.values()));
}
```

### 📋 管理したい内容
- `ConcretePlotPoint[]`: 具体的プロット点
- `AbstractPlotGuideline[]`: 抽象的ガイドライン
- `MediumPlot`: 中期プロット
- `SectionPlot[]`: 篇プロット
- `WorldSettings`, `ThemeSettings`: 世界・テーマ設定
- `PhaseInfo`: フェーズ情報
- プロット整合性チェック結果

### 🎯 提供したい機能
- `generatePromptElements(chapterNumber)`: プロンプト要素生成
- `getConcretePlotForChapter(chapterNumber)`: 章別具体プロット取得
- `getAbstractGuidelinesForChapter(chapterNumber)`: 章別抽象ガイドライン取得
- `checkGeneratedContentConsistency()`: 生成内容整合性チェック

---

## 5. PlotChecker

### 📁 現在のアクセス先（個別取得）
```typescript
// 記憶システム情報の個別取得
const result: {
  previousChapterSummary: string;
  significantEvents: KeyEvent[];
  persistentEvents: SignificantEvent[];
  activeCharacters: any[];
  characterRelationships: any[];
} = { /* デフォルト値 */ };

// 前章サマリー
const narrativeMemory = memoryManager.getMidTermMemory();
const summary = await narrativeMemory.getChapterSummary(chapterNumber - 1);

// 重要イベント
const events = await memoryManager.getImportantEvents(1, chapterNumber - 1);

// 永続イベント
const persistentEvents = await memoryManager.getPersistentEvents(1, chapterNumber);

// キャラクター情報
const characters = await characterManager.getAllCharacters();
const relationships = await characterManager.getCharacterRelationships(id);
```

### 📋 整合性チェックで必要な内容
```typescript
interface 整合性チェック用データ {
  // 記憶系
  previousChapterSummary: string;
  significantEvents: KeyEvent[];
  persistentEvents: SignificantEvent[];
  
  // キャラクター系
  activeCharacters: any[];
  characterRelationships: any[];
  
  // プロット系
  concretePlot: ConcretePlotPoint | null;
  abstractGuideline: AbstractPlotGuideline | null;
  
  // 生成コンテキスト
  tempContext: GenerationContext;
}
```

### 🎯 生成したい結果
```typescript
interface 整合性チェック結果 {
  consistent: boolean;
  issues: Array<{
    type: string;
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
    suggestion: string;
    context?: string;
  }>;
}
```

---

## 6. SectionPlotManager

### 📁 現在の保存先（複数重複）
```typescript
// 1. セクションストレージ（JSON）
await this.sectionStorage.saveSectionPlots(Array.from(this.sectionPlots.values()));
await this.sectionStorage.saveSectionRelationships(this.sectionRelationships);

// 2. 世界知識（未実装）
if (typeof worldKnowledge['storeSectionPlots'] === 'function') {
  await worldKnowledge['storeSectionPlots'](Array.from(this.sectionPlots.values()));
}

// 3. 中期記憶（未実装）
if (typeof narrativeMemory['updateSectionState'] === 'function') {
  await narrativeMemory['updateSectionState'](currentSection.id, progress);
}
```

### 📋 管理したい内容
```typescript
interface SectionPlot {
  id: string;
  chapterRange: { start: number; end: number };
  structure: SectionStructure;
  learningJourneyDesign: LearningJourneyDesign;
  emotionalDesign: EmotionalDesign;
  characterDesign: CharacterDesign;
  narrativeStructureDesign: NarrativeStructureDesign;
  metaInformation: MetaInformation;
}

// マッピング情報
Map<number, string> chapterToSectionMap;  // 章→篇のマッピング
Map<string, { prev: string | null; next: string | null }> sectionRelationships;  // 篇の前後関係
```

### 🔄 同期処理の課題
```typescript
// 複数システムへの同期が必要
await this.persistToWorldKnowledge();      // 長期記憶
await this.syncWithNarrativeMemory();      // 中期記憶
await this.saveToStorage();                // ファイルストレージ
```

---

## 7. SectionAnalyzer

### 📁 現在のアクセス先
```typescript
// 章コンテンツの個別取得
const shortTermMemory = this.memoryManager.getShortTermMemory();
for (let chapterNumber = start; chapterNumber <= end; chapterNumber++) {
  const chapter = await shortTermMemory.getChapter(chapterNumber);
}

// 感情曲線取得
const emotionalCurve = await midTermMemory.getEmotionalCurve(start, end);
```

### 📋 分析で必要な内容
```typescript
interface 分析用データ {
  // セクション情報
  section: SectionPlot;
  
  // 章コンテンツ
  chapters: Array<{
    chapterNumber: number;
    title: string;
    content: string;  // 分析用に短縮
  }>;
  
  // 感情データ
  emotionalCurve: EmotionalCurvePoint[];
}
```

### 🎯 生成したい結果
```typescript
interface 分析結果 {
  coherenceAnalysis: CoherenceAnalysis;      // 一貫性分析
  objectiveProgress: ObjectiveProgress;      // 学習目標達成度
  emotionalArcProgress: EmotionalArcProgress; // 感情アーク実現度
  improvementSuggestions: ImprovementSuggestion[]; // 改善提案
}
```

### ❓ 分析結果の保存先
- **現在未定義** - どこに保存するかが明確でない

---

## 🔍 独自作成による非効率箇所の特定

### 1. **重複するデータ取得処理**
```typescript
// StoryGenerationBridge, PlotChecker, SectionAnalyzer で重複
await shortTermMemory.getRecentChapters();
await memoryManager.getImportantEvents();
await memoryManager.getNarrativeState();
```

### 2. **同一情報の個別管理**
```typescript
// フェーズ情報を毎回計算
// PlotManager と StoryPhaseManager で重複処理
const phaseInfo = await this.getPhaseInformation(chapterNumber);
```

### 3. **キャラクター情報の分散アクセス**
```typescript
// PlotChecker, StoryGenerationBridge で個別実装
const characters = await characterManager.getAllCharacters();
const relationships = await characterManager.getCharacterRelationships(id);
```

### 4. **分析結果の保存先未定義**
```typescript
// SectionAnalyzer の分析結果をどこに保存するか不明
// 再分析のたびに同じ処理を実行
```

---

## 📋 保存・アクセス要件まとめ

| コンポーネント | 何を | どこに | どうやって | 内容 |
|---|---|---|---|---|
| WorldSettingsManager | 世界・テーマ設定 | ファイル | YAML読み込み | WorldSettings, ThemeSettings |
| StoryGenerationBridge | 章生成コンテキスト | **取得のみ** | 複数記憶から集約 | ChapterDirectives |
| StoryPhaseManager | フェーズ情報 | **保存先未定** | 毎回計算 | PhaseInfo, StructureMap |
| PlotManager | プロット全般 | 複数分散 | ファイル+記憶 | 各種プロットデータ |
| PlotChecker | 整合性結果 | **保存先未定** | 分析のみ | 整合性チェック結果 |
| SectionPlotManager | 篇情報 | 複数重複 | JSON+記憶同期 | SectionPlot, マッピング |
| SectionAnalyzer | 分析結果 | **保存先未定** | 分析のみ | 各種分析結果 |

## ❓ 不明確な点

1. **分析結果の保存先**: PlotChecker, SectionAnalyzer の結果をどこに保存するか
2. **フェーズ情報の永続化**: 計算結果をキャッシュする場所
3. **同期処理の統一**: 複数保存先への一貫性保証方法
4. **アクセス効率**: 重複する取得処理の最適化方法