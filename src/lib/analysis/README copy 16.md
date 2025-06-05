# 🚀 **全フェーズ実装コンポーネント詳細計画**

## **Phase 1: キャラクター記憶階層統合（週1-2）**
*既に回答済み - 15コンポーネント修正*

---

## **Phase 2: プロンプト生成システム革命（週3-4）**

### **必要なコンポーネント全リスト（12コンポーネント）**

### **1. 生成システム（4コンポーネント）**

#### **コア生成**
- `src/lib/generation/core/prompt-generator.ts` ✅ **主要修正**
- `src/lib/generation/core/context-generator.ts` ✅ **主要修正**
- `src/lib/generation/core/gemini-client.ts` **修正必要**
- `src/lib/generation/engine/chapter-generator.ts` **修正必要**

### **2. プロンプトシステム（4コンポーネント）**

#### **テンプレート・セクション**
- `src/lib/generation/prompt/template-manager.ts` **修正必要**
- `src/lib/generation/prompt/section-builder.ts` **修正必要**
- `src/lib/generation/prompt/prompt-formatter.ts` **修正必要**
- `src/lib/generation/prompt/memory-service.ts` **修正必要**

### **3. プロットシステム（4コンポーネント）**

#### **Section Bridge統合**
- `src/lib/plot/section/section-bridge.ts` ✅ **主要修正**
- `src/lib/plot/section/section-plot-manager.ts` **修正必要**
- `src/lib/plot/manager.ts` **修正必要**
- `src/lib/plot/story-generation-bridge.ts` **修正必要**

---

## **修正作業の詳細分類**

### **🔴 主要修正（3ファイル）**
1. **prompt-generator.ts**: 8大システム並列データ収集実装
2. **context-generator.ts**: 統合コンテキスト生成革命
3. **section-bridge.ts**: 学習旅程自動同期機能

### **🟡 中程度修正（6ファイル）**
4. **chapter-generator.ts**: 統合データフロー対応
5. **section-plot-manager.ts**: 学習ステージマッピング強化
6. **template-manager.ts**: 動的テンプレート選択
7. **section-builder.ts**: 8システム統合セクション構築
8. **manager.ts**: プロット×学習旅程連携
9. **story-generation-bridge.ts**: 統合ストーリー生成

### **🟢 軽微修正（3ファイル）**
10. **gemini-client.ts**: 統合プロンプト対応
11. **prompt-formatter.ts**: 統合データフォーマット対応
12. **memory-service.ts**: プロンプト用記憶統合

---

## **Phase 3: 学習旅程・分析システム統合（週5-6）**

### **必要なコンポーネント全リスト（18コンポーネント）**

### **1. 学習旅程システム（8コンポーネント）**

#### **コア学習管理**
- `src/lib/learning-journey/index.ts` ✅ **主要修正**
- `src/lib/learning-journey/concept-learning-manager.ts` ✅ **主要修正**
- `src/lib/learning-journey/emotional-learning-manager.ts` **修正必要**
- `src/lib/learning-journey/story-transformation-manager.ts` **修正必要**

#### **学習コンポーネント**
- `src/lib/learning-journey/concept-manager.ts` **修正必要**
- `src/lib/learning-journey/emotional-manager.ts` **修正必要**
- `src/lib/learning-journey/transformation-manager.ts` **修正必要**
- `src/lib/learning-journey/event-bus.ts` **修正必要**

### **2. 分析システム（10コンポーネント）**

#### **分析調整**
- `src/lib/analysis/coordinators/analysis-coordinator.ts` ✅ **主要修正**
- `src/lib/analysis/coordinators/optimization-coordinator.ts` **修正必要**

#### **分析パイプライン**
- `src/lib/analysis/pipelines/pre-generation-pipeline.ts` **修正必要**
- `src/lib/analysis/pipelines/post-generation-pipeline.ts` **修正必要**

#### **分析サービス**
- `src/lib/analysis/services/chapter-analysis-service.ts` **修正必要**
- `src/lib/analysis/services/character-analysis-service.ts` **修正必要**
- `src/lib/analysis/services/scene-analysis-service.ts` **修正必要**
- `src/lib/analysis/services/reader-experience-service.ts` **修正必要**

#### **分析アダプター**
- `src/lib/analysis/adapters/gemini-adapter.ts` **修正必要**
- `src/lib/analysis/content-analysis-manager.ts` **修正必要**

---

## **修正作業の詳細分類**

### **🔴 主要修正（3ファイル）**
1. **learning-journey/index.ts**: プロット双方向連携強化
2. **concept-learning-manager.ts**: キャラクター成長同期
3. **analysis-coordinator.ts**: 分析結果即座反映

### **🟡 中程度修正（8ファイル）**
4. **emotional-learning-manager.ts**: 感情×プロット統合
5. **story-transformation-manager.ts**: 変革×品質統合
6. **optimization-coordinator.ts**: 最適化自動適用
7. **pre-generation-pipeline.ts**: 事前分析統合
8. **post-generation-pipeline.ts**: 事後分析統合
9. **chapter-analysis-service.ts**: リアルタイム章分析
10. **character-analysis-service.ts**: キャラ分析統合
11. **gemini-adapter.ts**: AI分析統合

### **🟢 軽微修正（7ファイル）**
12-18. 残りの学習・分析コンポーネント統合対応

---

## **Phase 4: インフラストラクチャ統一（週7-8）**

### **必要なコンポーネント全リスト（50+コンポーネント）**

### **1. ストレージ統一（約25ファイル）**

#### **全キャラクターサービス**
- `src/lib/characters/services/character-service.ts` **修正必要**
- `src/lib/characters/services/evolution-service.ts` **修正必要**
- `src/lib/characters/services/psychology-service.ts` **修正必要**
- `src/lib/characters/services/relationship-service.ts` **修正必要**
- `src/lib/characters/services/parameter-service.ts` **修正必要**
- `src/lib/characters/services/skill-service.ts` **修正必要**
- `src/lib/characters/services/detection-service.ts` **修正必要**

#### **全学習旅程コンポーネント**
- `src/lib/learning-journey/*.ts` （全6ファイル）**修正必要**

#### **全分析サービス**
- `src/lib/analysis/services/**/*.ts` （全分析サービス）**修正必要**

#### **全プロットコンポーネント**
- `src/lib/plot/**/*.ts` （全プロットファイル）**修正必要**

### **2. API Throttling統一（約15ファイル）**

#### **AI呼び出し箇所**
- `src/lib/generation/core/gemini-client.ts` **修正必要**
- `src/lib/analysis/adapters/gemini-adapter.ts` **修正必要**
- `src/lib/learning-journey/concept-learning-manager.ts` **修正必要**
- `src/lib/characters/services/psychology-service.ts` **修正必要**
- `src/lib/foreshadowing/auto-generator.ts` **修正必要**
- `src/lib/foreshadowing/engine.ts` **修正必要**
- その他AI呼び出し箇所（約9ファイル）**修正必要**

### **3. エラーハンドリング統一（約50ファイル）**

#### **全システム主要ファイル**
- 全キャラクター関連ファイル（約15ファイル）**修正必要**
- 全記憶関連ファイル（約20ファイル）**修正必要**
- 全学習旅程ファイル（約6ファイル）**修正必要**
- 全分析関連ファイル（約15ファイル）**修正必要**
- 全プロット関連ファイル（約10ファイル）**修正必要**

### **4. ログシステム統一（約50ファイル）**
- 上記と同様の全ファイル対象

---

## **修正作業の詳細分類**

### **🔴 主要修正（統一戦略）**
1. **ストレージパターン統一**: 個別ファイルアクセス → `storageProvider`経由
2. **API制御統一**: 直接AIコール → `apiThrottler`経由
3. **エラー処理統一**: 個別try-catch → `withErrorHandling()`
4. **ログ出力統一**: console.log → `logger.info()`

### **🟡 中程度修正（重要ファイル優先）**
- キャラクター・記憶・生成系の重要ファイル先行実装

### **🟢 軽微修正（残りファイル）**
- 補助的なファイルは後続実装

---

## **Phase 5: 初期化順序最適化（週9-10）**

### **必要なコンポーネント全リスト（8コンポーネント）**

### **1. ライフサイクル管理（2コンポーネント）**

#### **初期化制御**
- `src/lib/lifecycle/application-lifecycle-manager.ts` ✅ **主要修正**
- `src/lib/lifecycle/service-container.ts` ✅ **主要修正**

### **2. システム初期化順序（6コンポーネント）**

#### **依存関係順序実装**
- `src/lib/memory/core/memory-manager.ts` **修正必要**
- `src/lib/characters/manager.ts` **修正必要**
- `src/lib/plot/manager.ts` **修正必要**
- `src/lib/learning-journey/index.ts` **修正必要**
- `src/lib/analysis/coordinators/analysis-coordinator.ts` **修正必要**
- `src/lib/parameters/manager.ts` **修正必要**

---

## **修正作業の詳細分類**

### **🔴 主要修正（2ファイル）**
1. **application-lifecycle-manager.ts**: 8大システム依存関係初期化順序
2. **service-container.ts**: DI容器による依存性管理強化

### **🟡 中程度修正（6ファイル）**
3-8. 各システムマネージャーの初期化順序対応

### **初期化順序**
```
Tier 1: Lifecycle + ServiceContainer
Tier 2: Memory + Parameters  
Tier 3: Character + Plot
Tier 4: LearningJourney + Foreshadowing
Tier 5: Analysis + Integration
```

---

## 📊 **全フェーズ総括**

### **総修正コンポーネント数**
- **Phase 1**: 15コンポーネント
- **Phase 2**: 12コンポーネント  
- **Phase 3**: 18コンポーネント
- **Phase 4**: 50+コンポーネント
- **Phase 5**: 8コンポーネント
- **合計**: 103+コンポーネント

### **重要度別分類**
- **🔴 主要修正**: 11ファイル（革命的変更）
- **🟡 中程度修正**: 30ファイル（重要な統合）
- **🟢 軽微修正**: 62+ファイル（一貫性向上）

### **期待効果**
- **Phase 1-2**: キャラクター×プロンプト革命（体感向上大）
- **Phase 3**: 学習×分析統合（品質向上大）
- **Phase 4-5**: システム安定性・性能向上（基盤強化）

この計画により2,200+メソッドのポテンシャルを段階的に100%以上活用できます。