# 小説プロンプト生成システム完全解析

## システム全体構成

### 主要コンポーネント
1. **PromptGenerator (paste-6.ts)** - メインのプロンプト生成クラス
2. **SectionBuilder (paste-4.ts)** - 各セクションを構築
3. **PromptFormatter (paste-3.ts)** - データをプロンプト用にフォーマット  
4. **MemoryService (paste-2.ts)** - 前章情報・連続性情報を取得
5. **TemplateManager (paste-5.ts)** - テンプレート管理
6. **LearningJourneySystem (paste-11.ts)** - 学習旅程システム統合

## プロンプト構成フロー解析

### 1. メイン生成処理 (PromptGenerator.generate)

```typescript
// paste-6.ts: Line 95-180
async generate(context: GenerationContext): Promise<string>
```

**処理順序:**
1. **基本情報の準備** → 強化された連続性情報を取得
2. **基本テンプレート取得** → テンプレートマネージャーから
3. **基本プレースホルダー置換** → 章番号、文字数等
4. **詳細コンテンツ置換** → 世界設定、キャラクター等
5. **テンション・ペーシング追加** → レベル別説明
6. **全セクション統合** → SectionBuilderから各セクション
7. **残り統合処理** → 伏線、矛盾等
8. **学習旅程統合** → LearningJourneySystemから
9. **出力形式確保** → 最終フォーマット指示
10. **品質チェック** → 完全性検証

---

## 各セクション詳細解析

### 【基本情報】セクション
**出力例:**
```
- 章番号: 3/?
- 目標文字数: 2000文字程度
- 語り口調: 三人称視点、過去形を基本としながらも主人公の内面描写を効果的に用いる
```

**生成元:**
- **ファイル:** paste-6.ts (PromptGenerator)
- **メソッド:** `replaceBasicPlaceholders()` (Line 426-483)
- **データソース:** GenerationContext
- **処理:**
  ```typescript
  .replace('{chapterNumber}', String(context.chapterNumber || 1))
  .replace('{targetLength}', String(context.targetLength || 8000))
  .replace('{narrativeStyle}', context.narrativeStyle || '三人称視点')
  ```

### 【前章の状況】セクション
**出力例:**
```
以下は前章の最後の部分です。この続きを書いてください：
summary: 誠は山田に中間報告を行い、問いの転換について話す。
```

**生成元:**
- **ファイル:** paste-2.ts (MemoryService)
- **メソッド:** `getPreviousChapterEnding()` (Line 48-87)
- **処理フロー:**
  1. `immediateContext.getChapter(chapterNumber - 1)` で前章取得
  2. 前章の最後2-3段落を抽出
  3. 「この続きを書いてください」プレフィックス追加

### 【展開指示】セクション
**出力例:**
```
- この章の目的: 物語を着実に前進させ、キャラクターの課題や葛藤を深める
- 達成すべきプロット要素: - キャラクターの目標に向けた進展
```

**生成元:**
- **ファイル:** paste-4.ts (SectionBuilder)
- **メソッド:** `getChapterPurposeAndPlotPoints()` (Line 670-760)
- **処理:**
  1. `chapterType`に基づく目的マップから取得
  2. `context.plotPoints`またはデフォルトプロット要素
  3. 物語状態に応じた追加要素

### 【表現指標】セクション
**出力例:**
```
- テンションレベル: 4/10 (低めの緊張感、小さな困難)
- ペーシングレベル: 3/10 (遅めのペース、詳細な描写)
```

**生成元:**
- **ファイル:** paste-6.ts (PromptGenerator)
- **メソッド:** `addTensionAndPacingDescriptions()` (Line 508-521)
- **データ取得:** `getDescriptionByLevelWithFallback()` (Line 524-543)
- **処理:**
  ```typescript
  .replace('{tensionLevel}', `${Math.round(tensionLevel * 10)}/10`)
  .replace('{tensionDescription}', this.getDescriptionByLevelWithFallback('tensionDescriptions', tensionLevel))
  ```

### 【世界設定】セクション
**出力例:**
```
2020年代の日本。テクノロジーの進化と従来の企業文化が混在する過渡期のスタートアップ環境。
```

**生成元:**
- **ファイル:** paste-6.ts (PromptGenerator) + paste-3.ts (PromptFormatter)
- **メソッド:** `replaceContentPlaceholders()` (Line 730-778)
- **処理フロー:**
  1. `PlotManager.getFormattedWorldAndTheme()` から取得
  2. フォールバック: `context.worldSettings`
  3. `PromptFormatter.formatWorldSettings()` でフォーマット

### 【登場人物】セクション
**出力例:**
```
【佐藤健太】
特徴: 主人公のチームに加わるエンジニア。A技術に精通し、高い技術力を持つ。
役割: 主要人物
性格: 論理的、実践的、冷静、好奇心旺盛、技術志向
```

**生成元:**
- **ファイル:** paste-3.ts (PromptFormatter)
- **メソッド:** `formatCharacters()` (Line 90-145)
- **処理:**
  1. CharacterManagerが利用可能な場合はそちらを使用
  2. フォールバック: `formatCharactersBasic()`
  3. 詳細レベルは`calculateDetailLevel()`で決定

### 【物語構造とプロット指示】セクション
**出力例:**
```
**現在の物語フェーズ**: 序章/オープニング
**フェーズ進行度**: 67%
**重要度**: 5/10
```

**生成元:**
- **ファイル:** プロンプトテンプレート内に埋め込み
- **データソース:** context.narrativeState
- **処理:** JSON形式の物語状態データを文字列展開

### 【伏線情報】セクション
**出力例:**
```
山田哲也の過去。彼はなぜ新卒離職問題に強い関心を持ち、起業家育成プロジェクトを主導しているのか。
（このチャプターで解決すべき重要な伏線）
```

**生成元:**
- **ファイル:** paste-3.ts (PromptFormatter)
- **メソッド:** `formatForeshadowing()` (Line 305-340)
- **処理:**
  ```typescript
  if (fs.urgencyLevel >= 0.8) {
    result += `（このチャプターで解決すべき重要な伏線）`;
  }
  ```

### 【シーン連続性指示】セクション
**出力例:**
```
- 前章の最終シーン: 前章の最後のシーン情報がありません
- 登場キャラクターの位置: 主要キャラクターが前章の場所にいる状態から始める
```

**生成元:**
- **ファイル:** paste-2.ts (MemoryService)
- **メソッド:** `getSceneContinuityInfo()` (Line 89-159)
- **処理フロー:**
  1. 前章のシーン情報を`previousChapter.scenes`から取得
  2. 最後のシーンから位置情報抽出
  3. 物語状態に基づく終わり方ガイダンス生成

### 【キャラクターの心理状態】セクション
**出力例:**
```
【高橋誠】の心理:
- 現在の欲求: 社会課題を解決したい、認められたい
- 現在の恐れ: 失敗への恐怖、能力不足への不安
```

**生成元:**
- **ファイル:** paste-4.ts (SectionBuilder)
- **メソッド:** `buildCharacterPsychologySection()` (Line 44-109)
- **データソース:** context.characterPsychology
- **処理:**
  ```typescript
  if (psychology.currentDesires && psychology.currentDesires.length > 0) {
    psychologySection += `- 現在の欲求: ${psychology.currentDesires.join('、')}\n`;
  }
  ```

### 【キャラクターの成長とスキル情報】セクション
**出力例:**
```
【高橋誠】
現在の成長フェーズ: 初心者
習得スキル:
- 基本ピッチング (Lv.4)
- ビジネスプランニング (Lv.3)
```

**生成元:**
- **ファイル:** paste-4.ts (SectionBuilder)
- **メソッド:** `buildCharacterGrowthSection()` (Line 115-201)
- **処理フロー:**
  1. `growthInfo.mainCharacters`から主要キャラクター情報
  2. スキル情報は`character.skills`配列から
  3. パラメータは上位5つをソートして表示

### 【文体ガイダンス】セクション
**出力例:**
```
- 文体に変化をつけ、読者の興味を維持してください
- 同じ表現の繰り返しを避け、多様な表現を心がけてください

### 主語の多様性（重要）
- 同じキャラクター名を連続して主語に使うのを避けてください
```

**生成元:**
- **ファイル:** paste-4.ts (SectionBuilder)
- **メソッド:** `buildStyleGuidanceSection()` (Line 207-348)
- **処理:**
  1. `context.styleGuidance`から各種ガイダンス取得
  2. 主語多様性の特別強調セクション追加
  3. 具体例がない場合はデフォルト例を提供

### 【表現の多様化】セクション
**出力例:**
```
### ビジネスシーン特有の表現
- 「会議を開く」を避け、代わりに：
  • 「ミーティングを招集する」
  • 「プロジェクト関係者を集める」
```

**生成元:**
- **ファイル:** paste-4.ts (SectionBuilder)  
- **メソッド:** `buildExpressionAlternativesSection()` (Line 350-395)
- **データソース:** context.alternativeExpressions
- **処理:**
  ```typescript
  alternativeExpressions[category].forEach((item: any) => {
    expressionSection += `- 「${item.original}」を避け、代わりに：\n`;
    item.alternatives.slice(0, 3).forEach((alt: string) => {
      expressionSection += `  • 「${alt}」\n`;
    });
  });
  ```

### 【文学的手法のインスピレーション】セクション  
**出力例:**
```
#### ビジネス専門用語を使用する際は
『下町ロケット』のように、技術的な内容を一般読者にも理解できる会話として表現してください
```

**生成元:**
- **ファイル:** paste-4.ts (SectionBuilder)
- **メソッド:** `buildLiteraryInspirationSection()` (Line 442-526)
- **データソース:** context.literaryInspirations
- **処理:** プロット展開手法、キャラクター描写手法、雰囲気構築手法を分類

### 【テンション構築の詳細ガイダンス】セクション
**出力例:**
```
このチャプターでは **テンションの基調を確立** してください。
理由: 物語の導入部では、読者の関心を引くための適度なテンションを設定

### ビジネス物語でのテンション構築
- チームビルディングや組織文化の構築プロセスに重点を置いてください
```

**生成元:**
- **ファイル:** paste-4.ts (SectionBuilder)
- **メソッド:** `buildTensionGuidanceSection()` (Line 568-669)
- **処理フロー:**
  1. `tensionRecommendation.direction`に基づくアドバイス
  2. ジャンル別（特にビジネス）のテクニック提案
  3. テンションレベルに応じた具体的指示

### 【学びの物語ガイダンス】セクション
**出力例:**
```
・概念: ISSUE DRIVEN  
・学習段階: 誤解段階

### 体現化ガイド
・表現方法: 誤解に基づく行動とその限界の描写
・重要要素: 誤解や思い込みの明確な描写
```

**生成元:**
- **ファイル:** paste-4.ts (SectionBuilder)
- **メソッド:** `buildLearningJourneySection()` (Line 761-856)
- **データソース:** context.learningJourney
- **統合:** LearningJourneySystemから取得したデータを統合

### 【永続的なイベント履歴】セクション
**出力例:**
```  
### 死亡したキャラクター
- **田中**は第5章で死亡しました。交通事故により
**注意:** 死亡したキャラクターは生き返らせないでください。
```

**生成元:**
- **ファイル:** paste-3.ts (PromptFormatter)
- **メソッド:** `formatPersistentEvents()` (Line 382-650)
- **データソース:** context.persistentEvents
- **処理:** 死亡、結婚、出産、昇進、ビジネスイベント等を分類して注意事項付きで表示

### 【出力形式】セクション
**出力例:**
```
---
title: (章のタイトルをここに記入)
pov: (視点キャラクターをここに記入)
---
(ここから直接本文を書き始めてください)
---
scenes: [シーン情報]
---
```

**生成元:**
- **ファイル:** paste-6.ts (PromptGenerator)
- **メソッド:** `ensureOutputFormatInstructions()` (Line 301-345)
- **処理:** YAMLヘッダー付きの構造化出力形式を強制追加

---

## 学習旅程システム統合

### LearningJourneySystem統合プロセス

**統合ファイル:** paste-6.ts
**メソッド:** `integratePrompts()` (Line 968-1006)

**処理フロー:**
1. **概念情報取得** → ConceptLearningManager
2. **学習段階判定** → 章番号に基づく段階決定
3. **感情アーク設計** → EmotionalLearningIntegrator  
4. **カタルシス体験** → 適切な段階でのみ生成
5. **共感ポイント** → 感情移入促進ポイント
6. **シーン推奨** → StoryTransformationDesigner

### MODE OVERRIDE処理

**条件:** `rawLearningJourneyPrompt`に"MODE OVERRIDE"が含まれる場合
**処理:**
- **第1章:** 基本プロンプト優先 + 学習要素追加
- **第2章以降:** 学習旅程プロンプトをベースに必要セクション追加

---

## テンプレートシステム

### TemplateManager (paste-5.ts)

**主要機能:**
1. **テンプレート読み込み** → promptTemplates.json
2. **レベル別説明** → tensionDescriptions, pacingDescriptions  
3. **ジャンル別ガイダンス** → genreGuidance
4. **章タイプ別指示** → chapterTypes, businessChapterTypes
5. **フォールバック処理** → テンプレート読み込み失敗時

### テンプレート階層構造

```
promptTemplates.json
├── baseTemplate (基本プロンプト構造)
├── tensionDescriptions (0.1-1.0の段階別説明)
├── pacingDescriptions (0.1-1.0の段階別説明)  
├── genreGuidance
│   ├── business (ビジネス特化指示)
│   ├── fantasy
│   └── mystery
├── chapterTypes
│   ├── OPENING
│   ├── STANDARD  
│   └── CLOSING
└── businessSpecificSections
    ├── growthGuidance
    ├── emotionalArcGuidance
    └── styleGuidance
```

---

## エラーハンドリングとフォールバック

### 多層フォールバック戦略

1. **レベル1:** 正常処理（全コンポーネント連携）
2. **レベル2:** 部分機能制限（一部コンポーネント失敗）
3. **レベル3:** 基本機能のみ（最小限プロンプト生成）
4. **レベル4:** ハードコードフォールバック

**実装箇所:**
- `getBaseTemplateWithFallback()` (Line 391-425)
- `generateFallbackPrompt()` (Line 348-389)
- `buildSectionsSafely()` (Line 220-258)

---

## 性能最適化と品質保証

### 並列処理
- **セクション構築:** 各セクションビルダーを並列実行
- **データ取得:** メモリサービスから並行取得
- **エラー分離:** 1つのセクション失敗が他に影響しない

### 品質チェック
**メソッド:** `validatePromptCompleteness()` (Line 260-300)
**チェック項目:**
- 章番号、目標文字数の存在
- 前章情報の妥当性  
- 出力形式指示の存在
- キャラクター・世界設定情報

### ログとモニタリング
- 各段階での詳細ログ出力
- エラー発生時のコンテキスト保存
- 品質メトリクスの記録

---

## まとめ

このプロンプト生成システムは、**10層以上の複雑な処理パイプライン**を持ち、**20種類以上の専門的なセクション**を動的に生成します。各コンポーネントが**独立性を保ちながら連携**し、**多重フォールバック機能**により高い可用性を実現しています。

特に**学習旅程システムとの統合**により、従来の小説生成を超えた**教育的価値**を持つコンテンツ生成が可能となっています。