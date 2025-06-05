小説生成システムの詳細な移行計画を、ファイル単位で具体的に説明いたします。

## Phase 1: 基盤サービスの作成と移行

### 1. ChapterAnalysisServiceの作成

**新規作成:** `src/lib/analysis/services/chapter/chapter-analysis-service.ts`

**移行元:** `chapter-generator.ts`
- **移行対象メソッド:** `chapterAnalyzer.analyzeChapter()`の呼び出し部分（行275-295付近）
- **移行内容:** 章の品質メトリクス計算、キャラクター登場分析、テーマ出現分析
- **移行方法:** 
  - ChapterAnalyzerクラスのインスタンス化部分を削除
  - 新しいサービスのメソッド呼び出しに置換
  - エラーハンドリング部分も移行

**修正:** `chapter-generator.ts`
- **行番号:** 42行目付近の`ChapterAnalyzer`インポート削除
- **行番号:** 60行目付近の`chapterAnalyzer`プロパティ削除
- **行番号:** 80行目付近のコンストラクタから`ChapterAnalyzer`初期化削除
- **行番号:** 275-295行目の分析処理を`analysisCoordinator.analyzeChapter()`呼び出しに置換

### 2. StyleAnalysisServiceの改修

**修正:** `src/lib/analysis/services/style/style-optimization-service.ts`
- **クラス名変更:** `StyleOptimizationService` → `StyleAnalysisService`
- **インターフェース実装追加:** `implements IStyleAnalysisService`
- **新規メソッド追加:** `analyzeStyle()`, `analyzeExpressionPatterns()`, `analyzeSubjectPatterns()`

**移行元:** `context-generator.ts`
- **移行対象メソッド:** `getStyleGuidance()`（行418-448付近）
- **移行対象メソッド:** `getAlternativeExpressions()`（行451-481付近）  
- **移行方法:**
  - メソッド本体をStyleAnalysisServiceに移動
  - キャッシュ機能も一緒に移行
  - エラーハンドリング部分も移行

**修正:** `context-generator.ts`
- **行番号:** 418-448行目の`getStyleGuidance()`メソッド削除
- **行番号:** 451-481行目の`getAlternativeExpressions()`メソッド削除
- **行番号:** 生成コンテキスト内での呼び出し部分をCoordinator経由に変更

### 3. CharacterAnalysisServiceの拡張

**修正:** 既存の`character-analysis-service.ts`
- **新規メソッド追加:** `detectPersistentEvents()`
- **新規メソッド追加:** `processCharacterGrowthFromChapter()`

**移行元:** `chapter-generator.ts`
- **移行対象メソッド:** `detectPersistentEvents()`（行325-410付近）
- **移行対象メソッド:** `processCharacterGrowthFromChapter()`（行455-485付近）
- **移行方法:**
  - メソッド全体をCharacterAnalysisServiceに移動
  - プロンプト生成ロジックも一緒に移行
  - JSON解析部分も移行

**修正:** `chapter-generator.ts`
- **行番号:** 325-410行目の永続的イベント検出メソッド削除
- **行番号:** 455-485行目のキャラクター成長処理メソッド削除
- **行番号:** 呼び出し部分をCoordinator経由に変更

## Phase 2: Coordinatorの作成と統合

### 4. AnalysisCoordinatorの作成

**新規作成:** `src/lib/analysis/coordinators/analysis-coordinator.ts`

**統合対象メソッド:** 
- `generateChapterContext()` - context-generator.tsの`generateContext()`の分析部分
- `analyzeGeneratedChapter()` - chapter-generator.tsの分析処理を統合
- `generateImprovementSuggestions()` - 各種改善提案の統合

**移行元:** `context-generator.ts`の`generateContext()`メソッド
- **移行対象部分:** 行200-250付近の品質向上関連処理
- **移行対象部分:** 行400-500付近の各種分析サービス呼び出し
- **移行方法:**
  - 分析関連のロジックを抽出
  - サービス呼び出しを整理・統合
  - 並列実行可能な処理を特定

### 5. メインフローの修正

**修正:** `chapter-generator.ts`
- **行番号:** 35行目付近に`AnalysisCoordinator`のインポート追加
- **行番号:** 60行目付近に`analysisCoordinator`プロパティ追加
- **行番号:** 120行目付近のコンストラクタにCoordinator初期化追加
- **行番号:** 190-300行目の生成後分析処理を`analysisCoordinator.analyzeGeneratedChapter()`に置換

**修正:** `context-generator.ts` 
- **行番号:** 25行目付近に`AnalysisCoordinator`のインポート追加
- **行番号:** 50行目付近に`analysisCoordinator`プロパティ追加
- **行番号:** 200-500行目の分析処理部分を`analysisCoordinator.generateChapterContext()`に置換

## Phase 3: セクション構築の移行

### 6. PromptBuilderServiceの作成

**新規作成:** `src/lib/analysis/services/prompt/prompt-builder-service.ts`

**移行元:** `section-builder.ts`
- **移行対象メソッド:** `buildCharacterPsychologySection()`（行45-95付近）
- **移行対象メソッド:** `buildCharacterGrowthSection()`（行100-170付近）
- **移行対象メソッド:** `buildEmotionalArcSection()`（行175-210付近）
- **移行対象メソッド:** `buildStyleGuidanceSection()`（行215-310付近）
- **移行対象メソッド:** `buildExpressionAlternativesSection()`（行315-350付近）
- **移行方法:**
  - メソッド群をそのまま移行
  - 依存関係（formatter, templateManager）も一緒に移行
  - エラーハンドリングは統一パターンに変更

**修正:** `section-builder.ts`
- **削除対象:** 上記メソッド群（全体の70%程度）
- **残存メソッド:** 学習旅程関連のメソッドのみ残存
- **リファクタリング:** クラス名を`LearningJourneySectionBuilder`に変更

### 7. プロンプト生成の統合

**修正:** `prompt-generator.ts`
- **行番号:** 40行目付近に`PromptBuilderService`のインポート追加
- **行番号:** 65行目付近に`promptBuilderService`プロパティ追加
- **行番号:** 150-300行目の`addDetailedSections()`メソッド内のセクション構築呼び出しを新サービス経由に変更

## Phase 4: 設定とファクトリーの整備

### 8. AnalysisFactoryの作成

**新規作成:** `src/lib/analysis/factory/analysis-factory.ts`

**役割:**
- 各種分析サービスのインスタンス生成
- 依存関係の注入
- 設定の一元管理

**統合対象:**
- StyleAnalysisService初期化
- CharacterAnalysisService初期化  
- ChapterAnalysisService初期化
- ThemeEnhancementService初期化
- TensionOptimizationService初期化
- AnalysisCoordinator初期化

### 9. 既存ファイルの修正

**修正:** `chapter-generator.ts`のコンストラクタ
- **行番号:** 80-120行目のコンストラクタ
- **変更内容:** 個別サービス初期化からFactory経由初期化に変更
- **削除対象:** ChapterAnalyzer, ForeshadowingProcessor等の個別初期化

**修正:** `context-generator.ts`のコンストラクタ
- **行番号:** 60-100行目のコンストラクタ  
- **変更内容:** 個別プロバイダ初期化からCoordinator注入に変更
- **削除対象:** MemoryProvider, ExpressionProvider等の個別初期化

## Phase 5: エラーハンドリングとフォールバック

### 10. 共通エラーハンドリングの実装

**修正:** 各分析サービス
- **統一パターン:** try-catch-fallback構造
- **ログ出力:** 統一されたログフォーマット
- **フォールバック:** デフォルト値の提供

**修正:** `chapter-generator.ts`
- **行番号:** 250-350行目のエラーハンドリング部分
- **変更内容:** 個別エラー処理から統一エラー処理に変更

**修正:** `context-generator.ts`
- **行番号:** 500-600行目のフォールバック処理
- **変更内容:** FallbackManagerからCoordinatorのフォールバック機能に移行

## Phase 6: 最終調整とテスト

### 11. 不要ファイルの削除・統合

**削除対象ファイル:**
- `context-generator/memory-provider.ts`（機能をCoordinatorに統合）
- `context-generator/expression-provider.ts`（StyleAnalysisServiceに統合）
- `context-generator/fallback-manager.ts`（Coordinatorに統合）

**修正:** `context-generator.ts`
- **大幅簡素化:** 600行から200行程度に縮小
- **主要機能:** Coordinator呼び出しとコンテキスト構築のみ

### 12. インポート文の整理

**修正対象ファイル:**
- `chapter-generator.ts` - 不要インポート削除、Coordinator追加
- `context-generator.ts` - 個別プロバイダインポート削除
- `prompt-generator.ts` - SectionBuilder関連インポート修正

この詳細な移行計画により、段階的かつ確実に現在のシステムをanalysisモジュール中心の構造に移行できます。各段階で動作確認を行いながら進めることで、機能の損失を防げます。