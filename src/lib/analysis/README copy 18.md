# 📋 **担当エンジニア向け修正指示プロンプト集**

## **Phase 1: キャラクター記憶階層統合**

### **P1-1: キャラクターサービス統合基盤【最優先】**

#### **対象ファイル**
- `src/lib/characters/services/character-service.ts` (メイン修正)
- `src/lib/characters/manager.ts` (連携修正)

#### **共有必要コンポーネント**
- `src/lib/characters/core/types.ts`
- `src/lib/characters/core/interfaces.ts`
- `src/lib/memory/core/types.ts`

#### **エンジニア指示プロンプト**
```
【P1-1: キャラクターサービス統合基盤実装】

■ 目標
7つの専門サービス（evolution, psychology, relationship, parameter, skill, detection）を統合する新メソッドを追加し、記憶階層との連携基盤を構築する。

■ 修正対象
1. src/lib/characters/services/character-service.ts
   - 既存の23メソッドは保持
   - 以下の新メソッドを追加：
     * async getUnifiedCharacterForPrompt(characterId: string, context: GenerationContext): Promise<UnifiedCharacterData>
     * async getCharacterWithMemoryHierarchy(characterId: string): Promise<HierarchicalCharacterData>
   
2. src/lib/characters/manager.ts
   - 既存のgetCharacter()メソッドを拡張
   - UnifiedMemoryAccessとの連携強化

■ 実装方針
- Promise.all()で7サービス並列呼び出し
- 記憶階層からのデータ取得ロジック追加
- 既存機能への影響ゼロを保証

■ 必要なインターフェース定義
```typescript
interface UnifiedCharacterData {
  character: CharacterWithDetails;
  evolution: CharacterEvolution;
  psychology: PsychologyAnalysis;
  relationships: RelationshipMap;
  parameters: DynamicParameters;
  skills: SkillProgression;
  detection: DetectionHistory;
}

interface HierarchicalCharacterData {
  shortTerm: CharacterShortTermData;
  midTerm: CharacterMidTermData;  
  longTerm: CharacterLongTermData;
}
```

■ 成功基準
- 新メソッドがキャラクター情報要素数を50倍に増加
- 既存の全テストが継続して通過
- 7つの専門サービスからのデータ統合が正常動作
```

---

### **P1-2: 専門サービス記憶階層連携【高優先】**

#### **対象ファイル**
- `src/lib/characters/services/evolution-service.ts`
- `src/lib/characters/services/psychology-service.ts`
- `src/lib/characters/services/relationship-service.ts`

#### **共有必要コンポーネント**
- `src/lib/characters/core/types.ts`
- `src/lib/memory/core/interfaces.ts`

#### **エンジニア指示プロンプト**
```
【P1-2: 専門サービス記憶階層連携実装（グループA）】

■ 目標
Evolution、Psychology、Relationshipサービスに記憶階層連携機能を追加する。

■ 修正対象
各ファイルに以下の標準メソッドを追加：
1. async getDataForMemoryHierarchy(): Promise<ServiceSpecificMemoryData>
2. async integrateWithMemoryLayer(layer: MemoryLayer): Promise<void>
3. async getHierarchicalData(characterId: string): Promise<HierarchicalServiceData>

■ 各サービス固有の実装
- evolution-service.ts: キャラクター成長データの階層分類
- psychology-service.ts: 感情・心理データの階層分類  
- relationship-service.ts: 関係性データの階層分類

■ 記憶階層戦略
- 短期記憶: 現在の状態、最近の変化
- 中期記憶: 進化パターン、関係性変化履歴
- 長期記憶: 基本人格、背景履歴、統合記録

■ 実装制約
- 既存メソッドは一切変更しない
- 既存のメモリ使用量を20%以上増加させない
- レスポンス時間3秒以内を維持

■ 成功基準
- character-service.tsのgetUnifiedCharacterForPrompt()から正常にデータ取得可能
- 記憶階層への適切なデータ振り分けが動作
```

---

### **P1-3: 専門サービス記憶階層連携【高優先】**

#### **対象ファイル**
- `src/lib/characters/services/parameter-service.ts`
- `src/lib/characters/services/skill-service.ts`
- `src/lib/characters/services/detection-service.ts`

#### **共有必要コンポーネント**
- `src/lib/characters/core/types.ts`
- `src/lib/memory/core/interfaces.ts`

#### **エンジニア指示プロンプト**
```
【P1-3: 専門サービス記憶階層連携実装（グループB）】

■ 目標
Parameter、Skill、Detectionサービスに記憶階層連携機能を追加する。

■ 修正対象
P1-2と同様の標準メソッドを各ファイルに追加

■ 各サービス固有の実装
- parameter-service.ts: 動的パラメータの階層管理
- skill-service.ts: スキル習得・進歩の階層追跡
- detection-service.ts: キャラクター検出履歴の階層保存

■ P1-2との連携
- 同じインターフェースを使用
- 統一された記憶階層戦略を適用
- character-service.tsとの統合動作を保証

■ 成功基準
- P1-2グループと合わせて6サービス統合が完了
- 全サービスデータが記憶階層に適切配置
```

---

### **P1-4: 記憶階層コア実装【最高優先】**

#### **対象ファイル**
- `src/lib/memory/core/memory-manager.ts` (メイン修正)
- `src/lib/memory/core/unified-access-api.ts` (連携修正)

#### **共有必要コンポーネント**
- `src/lib/memory/core/types.ts`
- `src/lib/memory/core/interfaces.ts`
- `src/lib/characters/core/types.ts`

#### **エンジニア指示プロンプト**
```
【P1-4: 記憶階層コア実装】

■ 目標
memory-managerにキャラクター情報の記憶階層自動配置機能を実装する。

■ 修正対象
1. src/lib/memory/core/memory-manager.ts
   - processChapter()メソッド内に分岐処理追加
   - キャラクターデータ階層判定ロジック実装
   
2. src/lib/memory/core/unified-access-api.ts
   - getIntegratedCharacterData()メソッド追加
   - 階層横断検索最適化

■ 記憶階層配置戦略
```typescript
const CHARACTER_MEMORY_STRATEGY = {
  shortTerm: {
    currentEmotionalState: "即座アクセス必須",
    activeRelationships: "現在のシーン用", 
    recentAppearances: "直近3章分"
  },
  midTerm: {
    characterEvolution: "成長パターン追跡",
    relationshipDynamics: "関係性変化履歴",
    skillProgression: "能力発達記録"
  },
  longTerm: {
    corePersonality: "基本人格データ",
    backgroundHistory: "背景・履歴情報",
    masterCharacterRecord: "統合キャラクター記録"
  }
};
```

■ 実装制約
- 既存の54,835バイトのファイルサイズを50%以上増加させない
- 既存の32メソッドの動作を保持
- コンソリデーション処理への影響最小化

■ 成功基準
- キャラクターデータが適切な階層に自動配置
- P1-1〜P1-3で実装されたサービス連携が正常動作
```

---

### **P1-5: 記憶階層レイヤー対応【中優先】**

#### **対象ファイル**
- `src/lib/memory/short-term/short-term-memory.ts`
- `src/lib/memory/mid-term/mid-term-memory.ts`
- `src/lib/memory/long-term/long-term-memory.ts`

#### **共有必要コンポーネント**
- `src/lib/memory/core/interfaces.ts`
- `src/lib/characters/core/types.ts`

#### **エンジニア指示プロンプト**
```
【P1-5: 記憶階層レイヤー対応実装】

■ 目標
3つの記憶層でキャラクターデータの受け入れ・保存・取得機能を強化する。

■ 修正対象
各ファイルの既存addChapter()メソッド内にキャラクター処理分岐追加

■ 各層の役割
- short-term-memory.ts: リアルタイム状態、現在感情、アクティブ関係性
- mid-term-memory.ts: 進化パターン、関係性変化、スキル進歩  
- long-term-memory.ts: 基本人格、背景、統合記録

■ 実装方針
- 既存のメソッド構造を維持
- キャラクターデータ専用の処理パスを追加
- P1-4のmemory-managerからのデータを適切に処理

■ 成功基準
- 各層でキャラクターデータの適切な処理が完了
- P1-4からのデータ振り分けが正常動作
```

---

### **P1-6: 統合システム最適化【低優先】**

#### **対象ファイル**
- `src/lib/memory/integration/access-optimizer.ts`
- `src/lib/memory/integration/cache-coordinator.ts`
- `src/lib/memory/integration/duplicate-resolver.ts`

#### **共有必要コンポーネント**
- `src/lib/memory/core/interfaces.ts`

#### **エンジニア指示プロンプト**
```
【P1-6: 統合システム最適化実装】

■ 目標
キャラクター専用の最適化・キャッシュ・重複解決機能を追加する。

■ 修正対象
- access-optimizer.ts: キャラクターアクセスパターン最適化
- cache-coordinator.ts: キャラクターキャッシュ戦略追加
- duplicate-resolver.ts: キャラクター重複解決強化

■ 実装方針
- 既存の最適化ロジックにキャラクター専用パターン追加
- P1-1〜P1-5で実装された機能のパフォーマンス向上
- キャラクターデータの効率的アクセス実現

■ 成功基準
- キャラクターデータアクセスの20%高速化
- キャッシュヒット率の向上
```

---

## **Phase 2: プロンプト生成システム革命**

### **P2-1: プロンプト生成コア革命【最高優先】**

#### **対象ファイル**
- `src/lib/generation/core/prompt-generator.ts` (メイン修正)
- `src/lib/generation/core/context-generator.ts` (メイン修正)

#### **共有必要コンポーネント**
- `src/lib/generation/core/types.ts`
- `src/lib/memory/core/types.ts`
- `src/lib/characters/core/types.ts`

#### **エンジニア指示プロンプト**
```
【P2-1: プロンプト生成コア革命実装】

■ 目標
8大システムからの並列データ収集と統合コンテキスト生成を実装する。

■ 修正対象
1. src/lib/generation/core/prompt-generator.ts
   - generate()メソッド内で8システムからのPromise.all()データ収集
   - buildSectionsWithUnifiedMemory()を8システム対応に拡張

2. src/lib/generation/core/context-generator.ts  
   - generateContext()メソッドを8システム統合に拡張
   - getCharacterGrowthInfoFromUnifiedMemory()の大幅機能拡張

■ 8大システム統合データ収集
```typescript
const [
  characterData,    // Phase 1で実装したキャラクター統合
  learningContext,  // 学習旅程システム
  memoryContext,    // 記憶階層システム  
  plotContext,      // プロットシステム
  analysisResults,  // 分析・提案システム
  parameters,       // パラメータシステム
  foreshadowing,    // 伏線管理システム
  systemStatus      // ライフサイクル管理システム
] = await Promise.all([...]);
```

■ 実装制約
- 既存の73,794バイト、62,095バイトのファイルサイズを2倍以上にしない
- 既存のプロンプト生成機能を完全保持
- レスポンス時間5秒以内を維持

■ 成功基準
- プロンプト情報密度が100倍向上
- 8大システムデータが適切に統合される
- 既存のテンプレートシステムが継続動作
```

---

### **P2-2: Section Bridge学習旅程統合【高優先】**

#### **対象ファイル**
- `src/lib/plot/section/section-bridge.ts` (メイン修正)
- `src/lib/plot/section/section-plot-manager.ts` (連携修正)

#### **共有必要コンポーネント**
- `src/lib/plot/section/types.ts`
- `src/lib/learning-journey/types.ts`

#### **エンジニア指示プロンプト**
```
【P2-2: Section Bridge学習旅程統合実装】

■ 目標
プロットシステムと学習旅程の完全同期を実現する。

■ 修正対象
1. src/lib/plot/section/section-bridge.ts
   - generateChapterContextWithSection()メソッドに学習旅程連携追加
   - LearningJourneySystemとの双方向データフロー実装

2. src/lib/plot/section/section-plot-manager.ts
   - integrateWithLearningJourney()メソッド機能拡張
   - Section定義と学習ステージの完全同期

■ 同期戦略
- プロット進行と学習進行の一致度向上
- 感情学習とストーリー展開の統合
- 概念進行とプロット進行の連携

■ 実装方針
- 既存のセクション管理機能を保持
- 学習旅程データとの双方向連携追加
- リアルタイム同期機能の実装

■ 成功基準
- プロット進行と学習ステージの完全同期
- セクション×学習の統合コンテキスト生成
```

---

### **P2-3: プロンプトシステム統合強化【中優先】**

#### **対象ファイル**
- `src/lib/generation/prompt/template-manager.ts`
- `src/lib/generation/prompt/section-builder.ts`
- `src/lib/generation/prompt/prompt-formatter.ts`

#### **共有必要コンポーネント**
- `src/lib/generation/prompt/types.ts`

#### **エンジニア指示プロンプト**
```
【P2-3: プロンプトシステム統合強化実装】

■ 目標
テンプレート・セクション・フォーマッターを8システム統合データに対応させる。

■ 修正対象
1. template-manager.ts: 動的テンプレート選択機能追加
2. section-builder.ts: 8システム統合セクション構築  
3. prompt-formatter.ts: 統合データフォーマット対応

■ 実装方針
- P2-1で収集される8システムデータの効果的活用
- 既存のテンプレートシステムとの互換性維持
- 動的なコンテンツ生成強化

■ 成功基準
- 8システムデータが適切にフォーマットされる
- テンプレートの動的選択が正常動作
```

---

### **P2-4: 生成エンジン統合対応【中優先】**

#### **対象ファイル**
- `src/lib/generation/engine/chapter-generator.ts`
- `src/lib/plot/manager.ts`
- `src/lib/plot/story-generation-bridge.ts`

#### **共有必要コンポーネント**
- `src/lib/generation/types.ts`
- `src/lib/plot/types.ts`

#### **エンジニア指示プロンプト**
```
【P2-4: 生成エンジン統合対応実装】

■ 目標
章生成・プロット管理・ストーリー生成ブリッジを統合データフローに対応させる。

■ 修正対象
1. chapter-generator.ts: 統合データフロー対応
2. manager.ts: プロット×学習旅程連携強化
3. story-generation-bridge.ts: 統合ストーリー生成対応

■ 実装方針
- P2-1、P2-2で実装された統合データの効果的活用
- 既存の生成フローを保持しつつ機能拡張
- 8システム間の一貫性保証

■ 成功基準
- 統合データを活用した高品質な章生成
- プロット×学習旅程の完全連携動作
```

---

## **Phase 3: 学習旅程・分析システム統合**

### **P3-1: 学習旅程コア統合【最高優先】**

#### **対象ファイル**
- `src/lib/learning-journey/index.ts` (メイン修正)
- `src/lib/learning-journey/concept-learning-manager.ts` (メイン修正)

#### **共有必要コンポーネント**
- `src/lib/learning-journey/types.ts`
- `src/lib/characters/core/types.ts`
- `src/lib/plot/types.ts`

#### **エンジニア指示プロンプト**
```
【P3-1: 学習旅程コア統合実装】

■ 目標
学習旅程システムとプロット・キャラクターシステムの双方向連携を実現する。

■ 修正対象
1. src/lib/learning-journey/index.ts
   - generateChapterPrompt()メソッドにプロット連携追加
   - getSectionWithFallback()をプロットシステム連携に拡張

2. src/lib/learning-journey/concept-learning-manager.ts
   - getEmbodimentPlan()メソッドにキャラクターシステム連携追加
   - 概念学習とキャラクター発達の同期機能実装

■ 双方向連携戦略
- 学習進行がキャラクター成長に反映
- プロット進行が学習ステージに影響
- 概念学習がストーリー展開を強化

■ 実装制約
- 既存の学習旅程機能を完全保持
- P2-2で実装されたSection Bridge連携との整合性保証
- 学習効果の定量的測定可能性維持

■ 成功基準
- 学習旅程×プロット×キャラクターの三者同期実現
- 概念学習の小説生成への直接反映確認
```

---

### **P3-2: 感情・変革学習統合【高優先】**

#### **対象ファイル**
- `src/lib/learning-journey/emotional-learning-manager.ts`
- `src/lib/learning-journey/story-transformation-manager.ts`
- `src/lib/learning-journey/event-bus.ts`

#### **共有必要コンポーネント**
- `src/lib/learning-journey/types.ts`

#### **エンジニア指示プロンプト**
```
【P3-2: 感情・変革学習統合実装】

■ 目標
感情学習・ストーリー変革・イベントバスを統合システムに対応させる。

■ 修正対象
1. emotional-learning-manager.ts: 感情×プロット統合
2. story-transformation-manager.ts: 変革×品質統合
3. event-bus.ts: 学習イベントの統合システム配信

■ 実装方針
- P3-1で実装された双方向連携の活用
- 感情学習がプロット感情アークに影響
- 変革学習が品質向上に直結

■ 成功基準
- 感情学習×プロットの完全同期
- 変革学習による品質向上の実現
```

---

### **P3-3: 分析コア統合【最高優先】**

#### **対象ファイル**
- `src/lib/analysis/coordinators/analysis-coordinator.ts` (メイン修正)
- `src/lib/analysis/coordinators/optimization-coordinator.ts` (連携修正)

#### **共有必要コンポーネント**
- `src/lib/analysis/types.ts`
- `src/lib/generation/types.ts`

#### **エンジニア指示プロンプト**
```
【P3-3: 分析コア統合実装】

■ 目標
分析結果の即座反映とリアルタイム品質向上機能を実装する。

■ 修正対象
1. src/lib/analysis/coordinators/analysis-coordinator.ts
   - analyzeChapter()メソッドに推奨事項自動適用機能追加
   - リアルタイム品質向上フィードバックループ実装

2. src/lib/analysis/coordinators/optimization-coordinator.ts
   - optimizeChapter()メソッドの次回生成への自動反映機能

■ 即座反映戦略
- 分析結果が次のプロンプト生成に即座反映
- 品質問題の自動検出・修正提案
- 継続的学習・改善ループの実装

■ 実装制約
- 分析処理のレスポンス時間3秒以内維持
- 既存の分析機能を完全保持
- P2-1のプロンプト生成との連携保証

■ 成功基準
- 分析結果による即座のプロンプト最適化
- 品質向上の定量的な確認
```

---

### **P3-4: 分析パイプライン統合【中優先】**

#### **対象ファイル**
- `src/lib/analysis/pipelines/pre-generation-pipeline.ts`
- `src/lib/analysis/pipelines/post-generation-pipeline.ts`
- `src/lib/analysis/adapters/gemini-adapter.ts`

#### **共有必要コンポーネント**
- `src/lib/analysis/types.ts`

#### **エンジニア指示プロンプト**
```
【P3-4: 分析パイプライン統合実装】

■ 目標
事前・事後分析パイプラインとAI分析アダプターを統合システムに対応させる。

■ 修正対象
1. pre-generation-pipeline.ts: 事前分析統合
2. post-generation-pipeline.ts: 事後分析統合  
3. gemini-adapter.ts: AI分析統合

■ 実装方針
- P3-3で実装された分析コア機能の活用
- 生成前後での包括的品質保証
- AI分析能力の最大活用

■ 成功基準
- 生成前後の完全な品質保証実現
- AI分析による高度な推奨事項生成
```

---

### **P3-5: 分析サービス統合【中優先】**

#### **対象ファイル**
- `src/lib/analysis/services/chapter-analysis-service.ts`
- `src/lib/analysis/services/character-analysis-service.ts`
- `src/lib/analysis/services/scene-analysis-service.ts`
- `src/lib/analysis/services/reader-experience-service.ts`

#### **共有必要コンポーネント**
- `src/lib/analysis/services/types.ts`

#### **エンジニア指示プロンプト**
```
【P3-5: 分析サービス統合実装】

■ 目標
章・キャラクター・シーン・読者体験分析サービスを統合システムに対応させる。

■ 修正対象
各分析サービスでリアルタイム分析機能を強化

■ 実装方針
- P3-3、P3-4で実装された分析基盤の活用
- 各分析サービスの専門性を保持しつつ統合対応
- リアルタイム分析結果の効果的活用

■ 成功基準
- 各分析サービスが統合システムに適切に連携
- 分析結果の品質と速度の両立実現
```

---

## **Phase 4: インフラストラクチャ統一**

### **P4-1: ストレージ統一（キャラクター系）【高優先】**

#### **対象ファイル**
- `src/lib/characters/services/character-service.ts`
- `src/lib/characters/services/evolution-service.ts`
- `src/lib/characters/services/psychology-service.ts`
- `src/lib/characters/services/relationship-service.ts`

#### **共有必要コンポーネント**
- `src/lib/storage/index.ts`
- `src/lib/storage/types.ts`

#### **エンジニア指示プロンプト**
```
【P4-1: ストレージ統一（キャラクター系）実装】

■ 目標
キャラクター関連ファイルのストレージアクセスを統一システムに変更する。

■ 修正対象
全対象ファイル内の直接ファイルアクセスを統一ストレージ使用に変更

■ 統一修正パターン
```typescript
// 変更前
import fs from 'fs/promises';
const data = await fs.readFile(filePath);

// 変更後  
import { storageProvider } from '@/lib/storage';
const data = await storageProvider.readFile(filePath);
```

■ 実装制約
- 既存の機能・性能を維持
- バックアップ・復元機能の自動適用
- エラーハンドリングの統一

■ 成功基準
- 全キャラクター系ファイルで統一ストレージ使用
- 既存機能の完全動作保証
- 20%の性能向上実現
```

---

### **P4-2: ストレージ統一（その他システム）【高優先】**

#### **対象ファイル**
- `src/lib/characters/services/parameter-service.ts`
- `src/lib/characters/services/skill-service.ts`
- `src/lib/characters/services/detection-service.ts`
- `src/lib/learning-journey/*.ts` (全6ファイル)

#### **共有必要コンポーネント**
- `src/lib/storage/index.ts`

#### **エンジニア指示プロンプト**
```
【P4-2: ストレージ統一（その他システム）実装】

■ 目標
残りのキャラクター系サービスと学習旅程システム全体のストレージ統一。

■ 修正対象
P4-1と同様の統一修正パターンを適用

■ 実装方針
- P4-1で確立されたパターンを踏襲
- 学習旅程系ファイルの特性に応じた最適化
- 統一性とシステム固有性のバランス

■ 成功基準
- P4-1と合わせて全キャラクター・学習旅程系の統一完了
```

---

### **P4-3: API Throttling統一【最高優先】**

#### **対象ファイル**
- `src/lib/generation/core/gemini-client.ts`
- `src/lib/analysis/adapters/gemini-adapter.ts`
- `src/lib/learning-journey/concept-learning-manager.ts`
- `src/lib/characters/services/psychology-service.ts`
- `src/lib/foreshadowing/auto-generator.ts`

#### **共有必要コンポーネント**
- `src/lib/utils/api-throttle.ts`

#### **エンジニア指示プロンプト**
```
【P4-3: API Throttling統一実装】

■ 目標
全AI呼び出し箇所でAPIスロットリングを統一使用する。

■ 修正対象
全対象ファイル内の直接AI呼び出しをスロットリング経由に変更

■ 統一修正パターン
```typescript
// 変更前
const result = await geminiClient.generateText(prompt);

// 変更後
import { apiThrottler } from '@/lib/utils/api-throttle';
const result = await apiThrottler.execute(() => 
  geminiClient.generateText(prompt)
);
```

■ 実装制約
- API制限への完全準拠
- 既存のレスポンス時間を大幅に悪化させない
- エラー時の適切なリトライ機能

■ 成功基準
- 全AI呼び出しでスロットリング適用
- API制限エラーの完全排除
- システム安定性の向上
```

---

### **P4-4: エラーハンドリング統一（重要システム）【中優先】**

#### **対象ファイル**
- `src/lib/generation/core/prompt-generator.ts`
- `src/lib/generation/core/context-generator.ts`
- `src/lib/memory/core/memory-manager.ts`
- `src/lib/characters/services/character-service.ts`
- `src/lib/plot/manager.ts`

#### **共有必要コンポーネント**
- `src/lib/utils/error-handler.ts`

#### **エンジニア指示プロンプト**
```
【P4-4: エラーハンドリング統一（重要システム）実装】

■ 目標
重要システムファイルのエラーハンドリングを統一システムに変更する。

■ 修正対象
個別try-catch文を統一エラーハンドリングに変更

■ 統一修正パターン
```typescript
// 変更前
try {
  // 処理
} catch (error) {
  console.error(error);
}

// 変更後
import { withErrorHandling } from '@/lib/utils/error-handler';
await withErrorHandling(async () => {
  // 処理
}, 'operation-name');
```

■ 成功基準
- 重要システムでの統一エラーハンドリング適用
- エラー率0.1%以下の実現
```

---

### **P4-5: ログシステム統一【中優先】**

#### **対象ファイル**
- Phase 4の全対象ファイル（約20ファイル）

#### **共有必要コンポーネント**
- `src/lib/utils/logger.ts`

#### **エンジニア指示プロンプト**
```
【P4-5: ログシステム統一実装】

■ 目標
全システムのログ出力を統一システムに変更する。

■ 修正対象
console.log等の直接出力を統一ログシステムに変更

■ 統一修正パターン
```typescript
// 変更前
console.log('Processing...');
console.error('Error occurred');

// 変更後
import { logger } from '@/lib/utils/logger';
logger.info('Processing...', { context: 'operation-name' });
logger.error('Error occurred', { error, context: 'operation-name' });
```

■ 成功基準
- 全システムでの統一ログ使用
- 構造化ログによる分析性向上
```

---

## **Phase 5: 初期化順序最適化**

### **P5-1: ライフサイクル管理コア【最高優先】**

#### **対象ファイル**
- `src/lib/lifecycle/application-lifecycle-manager.ts` (メイン修正)
- `src/lib/lifecycle/service-container.ts` (メイン修正)

#### **共有必要コンポーネント**
- `src/lib/lifecycle/types.ts`

#### **エンジニア指示プロンプト**
```
【P5-1: ライフサイクル管理コア実装】

■ 目標
8大システムの依存関係に基づく最適初期化順序を実装する。

■ 修正対象
1. src/lib/lifecycle/application-lifecycle-manager.ts
   - initialize()メソッドに依存関係マップ追加
   - 段階的初期化（Tier 1-5）の実装

2. src/lib/lifecycle/service-container.ts
   - DI容器による依存性管理強化
   - 循環依存の自動検出・解決

■ 初期化順序（厳守）
```typescript
const INITIALIZATION_ORDER = {
  tier1: ['LifecycleSystem', 'ServiceContainer'],
  tier2: ['MemorySystem', 'ParametersSystem'],
  tier3: ['CharacterSystem', 'PlotSystem'], 
  tier4: ['LearningJourneySystem', 'ForeshadowingSystem'],
  tier5: ['AnalysisSystem', 'IntegrationLayer']
};
```

■ 実装制約
- 依存関係の厳密な管理
- 初期化失敗時の適切なフォールバック
- システム全体の起動時間3秒以内

■ 成功基準
- 8大システムの正しい順序での初期化
- 依存関係エラーの完全排除
- システム安定性99.9%の実現
```

---

### **P5-2: システムマネージャー初期化対応【中優先】**

#### **対象ファイル**
- `src/lib/memory/core/memory-manager.ts`
- `src/lib/characters/manager.ts`
- `src/lib/plot/manager.ts`
- `src/lib/learning-journey/index.ts`
- `src/lib/analysis/coordinators/analysis-coordinator.ts`
- `src/lib/parameters/manager.ts`

#### **共有必要コンポーネント**
- `src/lib/lifecycle/types.ts`

#### **エンジニア指示プロンプト**
```
【P5-2: システムマネージャー初期化対応実装】

■ 目標
各システムマネージャーを初期化順序に対応させ、依存関係を適切に管理する。

■ 修正対象
各マネージャーの初期化メソッドに依存関係チェック・宣言追加

■ 実装方針
- P5-1で実装された初期化順序に準拠
- 各システムの依存関係を明確に宣言
- 初期化失敗時の適切なエラーハンドリング

■ 依存関係宣言例
```typescript
class MemoryManager {
  static dependencies = [];  // Tier 2: 依存なし
  static initializationTier = 2;
}

class CharacterManager {
  static dependencies = ['MemorySystem'];  // Tier 3: Memory依存
  static initializationTier = 3;
}
```

■ 成功基準
- 全システムマネージャーが正しい順序で初期化
- 依存関係の明確な宣言と検証
- P5-1との完全な連携動作
```

この実装計画により、各担当エンジニアが明確な指示に基づいて効率的に作業を進め、2,200+メソッドのポテンシャルを100%以上活用できるシステムを段階的に構築できます。