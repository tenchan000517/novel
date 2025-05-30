# キャラクターモジュール連携仕様書

## 目次
1. [システム概要](#1-システム概要)
2. [アーキテクチャ](#2-アーキテクチャ)
3. [初期化と依存関係](#3-初期化と依存関係)
4. [キャラクターマネージャーファサード](#4-キャラクターマネージャーファサード)
5. [イベントシステム](#5-イベントシステム)
6. [エラー処理](#6-エラー処理)
7. [一般的なユースケース](#7-一般的なユースケース)
8. [ベストプラクティスとアンチパターン](#8-ベストプラクティスとアンチパターン)

## 1. システム概要

キャラクターモジュールは、小説生成システムにおけるキャラクター管理の中核を担当します。このモジュールは主に以下の機能を提供します：

* キャラクター基本情報の管理（作成、更新、取得）
* キャラクター間の関係性管理
* キャラクター成長と発展の処理
* キャラクターパラメータとスキルの管理
* ストーリーにおけるキャラクター登場タイミングの分析
* キャラクター心理の分析と行動予測

### リファクタリングについて

以前は機能のほとんどが単一の`CharacterManager`クラスに集中していましたが、現在は責任分離の原則に基づき、各機能が専門的なサービスに分割されています。外部モジュールからは`CharacterManager`ファサードを通じて統一的にアクセスでき、内部実装の複雑さを隠蔽しています。

## 2. アーキテクチャ

キャラクターモジュールは以下の階層で構成されています：

```
キャラクターモジュール
│
├── ファサード層（CharacterManager）
│   └── manager.ts - 外部インターフェース
│
├── サービス層
│   ├── character-service.ts - キャラクター基本操作
│   ├── relationship-service.ts - 関係性管理
│   ├── evolution-service.ts - 成長と発展
│   ├── parameter-service.ts - パラメータ管理
│   ├── skill-service.ts - スキル管理
│   ├── psychology-service.ts - 心理分析
│   └── detection-service.ts - キャラクター検出
│
├── リポジトリ層
│   ├── character-repository.ts - キャラクターデータ永続化
│   ├── relationship-repository.ts - 関係性データ永続化
│   ├── parameter-repository.ts - パラメータデータ永続化
│   └── skill-repository.ts - スキルデータ永続化
│
├── 分析層
│   ├── character-analyzer.ts - キャラクター分析
│   └── timing-analyzer.ts - タイミング分析
│
└── コア層
    ├── types.ts - 型定義
    ├── interfaces.ts - インターフェース定義
    ├── constants.ts - 定数定義
    └── errors.ts - エラー定義
```

### 主要コンポーネント

* **ファサード**: `CharacterManager` - 外部モジュールとの連携ポイント
* **サービス**: 各機能ドメインを担当する専門サービス群
* **リポジトリ**: データの永続化を担当
* **分析ツール**: 複雑な分析処理を担当
* **イベントバス**: コンポーネント間の疎結合な連携を実現

## 3. 初期化と依存関係

### 初期化順序

キャラクターモジュールの適切な初期化順序は以下の通りです：

1. リポジトリの初期化
2. サービスの初期化 
3. ファサード（CharacterManager）の初期化

### キャラクターマネージャーの初期化

`CharacterManager`はシングルトンパターンで実装されており、以下のように初期化されます：

```typescript
// 初期化例
import { characterManager } from './core/manager';

// システム起動時
async function initializeSystem() {
  // CharacterManagerの初期化を待機
  // 内部でensureInitializedが呼ばれるため明示的な初期化呼び出しは不要
  await characterManager.getAllCharacters();
  
  console.log("キャラクターモジュールの初期化完了");
}
```

**重要**: すべてのパブリックメソッドは内部で`ensureInitialized()`を呼び出すため、明示的な初期化メソッド呼び出しは不要です。ただし、**初回メソッド呼び出しは初期化処理を含むため時間がかかる可能性があります**。

### 依存関係

キャラクターモジュールは以下のモジュールに依存します：

* **ストレージプロバイダー**: キャラクターデータの永続化に使用
* **ロガー**: ログ出力に使用
* **メモリマネージャー**: キャラクターの記憶・イベント管理に使用
* **AIジェネレーション**: 心理分析などの生成AIを活用する機能で使用

外部モジュールからキャラクターモジュールを使用する際は、これらの依存関係が初期化されていることを確認してください。

## 4. キャラクターマネージャーファサード

外部モジュールは`CharacterManager`クラスを通じてキャラクターモジュールの機能にアクセスします。インポート方法：

```typescript
import { characterManager } from './characters/core/manager';
```

### 主要なメソッド

#### キャラクター基本操作

```typescript
// キャラクター取得
const character = await characterManager.getCharacter(characterId);

// 名前でキャラクター取得
const character = await characterManager.getCharacterByName("主人公の名前");

// キャラクター作成
const newCharacter = await characterManager.createCharacter({
  name: "新キャラクター",
  description: "説明文",
  type: "SUB",
  // その他必要なフィールド
});

// キャラクター更新
const updatedCharacter = await characterManager.updateCharacter(characterId, {
  description: "更新された説明",
  personality: {
    traits: ["勇敢", "思慮深い"]
  }
});

// すべてのキャラクター取得
const allCharacters = await characterManager.getAllCharacters();

// タイプ別キャラクター取得
const mainCharacters = await characterManager.getCharactersByType("MAIN");
```

#### キャラクター検出と分析

```typescript
// コンテンツからキャラクターを検出
const detectedCharacters = await characterManager.detectCharactersInContent(chapterContent);

// キャラクター分析
const analysis = await characterManager.analyzeCharacter(characterId);

// 章に推奨するキャラクター
const recommendations = await characterManager.recommendCharactersForChapter(
  chapterNumber,
  { pacing: "MEDIUM", arc: "CURRENT_ARC", theme: "DEVELOPMENT" }
);

// 章生成のための情報準備
const characterInfo = await characterManager.prepareCharacterInfoForChapterGeneration(chapterNumber);
```

#### 成長と発展

```typescript
// キャラクター発展処理
const updatedCharacter = await characterManager.processCharacterDevelopment(
  characterId, 
  chapterEvents
);

// 章全体のキャラクター成長処理
const growthResults = await characterManager.processAllCharacterGrowth(
  chapterNumber,
  chapterContent
);

// 成長計画の追加
const growthPlan = await characterManager.addGrowthPlan(characterId, {
  name: "成長計画名",
  description: "説明",
  // 詳細設定
});

// 成長計画の適用
const growthResult = await characterManager.applyGrowthPlan(characterId, chapterNumber);
```

#### パラメータとスキル

```typescript
// パラメータ初期化
await characterManager.initializeCharacterParameters(characterId);

// パラメータ取得
const parameters = await characterManager.getCharacterParameters(characterId);

// パラメータ更新
await characterManager.setParameterValue(characterId, parameterId, 75);

// スキル取得
const skills = await characterManager.getCharacterSkills(characterId);

// スキル習得
await characterManager.acquireSkill(characterId, skillId);

// ジャンルに適したパラメータとスキルの初期化
const initialized = await characterManager.initializeForGenre(characterId, "ファンタジー");
```

#### 登場と心理

```typescript
// キャラクター登場記録
await characterManager.recordCharacterAppearance(
  characterId,
  chapterNumber,
  "キャラクターの活躍内容",
  0.7 // 感情インパクト
);

// インタラクション記録
await characterManager.recordCharacterInteraction(
  characterId,
  targetCharacterId,
  chapterNumber,
  "CONVERSATION",
  "会話の内容",
  0.5 // 影響度
);

// キャラクター心理分析
const psychology = await characterManager.getCharacterPsychology(characterId, chapterNumber);

// 行動予測
const prediction = await characterManager.predictCharacterAction(
  characterId,
  "危険な状況", 
  ["逃げる", "戦う", "助けを呼ぶ"]
);
```

## 5. イベントシステム

キャラクターモジュールは、イベントバスを介して疎結合な連携を実現します。

### 利用可能なイベント

主要なイベントタイプは`constants.ts`の`EVENT_TYPES`に定義されています：

```typescript
// 例: キャラクター作成イベント
EVENT_TYPES.CHARACTER_CREATED = 'character.created'

// 例: キャラクター状態変更イベント
EVENT_TYPES.CHARACTER_STATE_CHANGED = 'character.state.changed'

// 例: 関係性更新イベント
EVENT_TYPES.RELATIONSHIP_UPDATED = 'relationship.updated'
```

### イベント購読

イベントを購読する場合は、`EventBus`インターフェースを使用します：

```typescript
import { eventBus } from './characters/core/event-bus';
import { EVENT_TYPES } from './characters/core/constants';

// イベント購読
const subscription = eventBus.subscribe(
  EVENT_TYPES.CHARACTER_CREATED,
  (data) => {
    console.log(`新しいキャラクターが作成されました: ${data.character.name}`);
  }
);

// 購読解除
eventBus.unsubscribe(subscription);
```

## 6. エラー処理

キャラクターモジュールは`errors.ts`で定義された専用のエラークラスを使用します。

### エラータイプ

* `CharacterError`: 基底エラークラス
* `NotFoundError`: リソースが見つからない場合
* `ValidationError`: 入力データの検証に失敗した場合
* `ConsistencyError`: キャラクターの整合性が損なわれている場合
* `PersistenceError`: データの永続化に失敗した場合
* `ConflictError`: 同時更新の競合が発生した場合
* `DependencyError`: 必要な依存関係が満たされていない場合
* `InvalidOperationError`: 要求された操作を実行できない場合
* `ServiceIntegrationError`: 外部サービスとの連携に失敗した場合

### エラー処理例

```typescript
import { NotFoundError, ValidationError } from './characters/core/errors';

try {
  const character = await characterManager.getCharacter("存在しないID");
} catch (error) {
  if (error instanceof NotFoundError) {
    console.error("キャラクターが見つかりませんでした:", error.getDetails());
    // 適切なフォールバック処理
  } else if (error instanceof ValidationError) {
    console.error("検証エラー:", error.getValidationErrorDetails());
    // バリデーションエラーの詳細を表示
  } else {
    console.error("予期しないエラー:", error);
    // 一般的なエラー処理
  }
}
```

## 7. 一般的なユースケース

### 小説の章生成前後のキャラクター処理

```typescript
async function handleChapterGeneration(chapterNumber) {
  // 1. 章生成前のキャラクター情報準備
  const characterInfo = await characterManager.prepareCharacterInfoForChapterGeneration(chapterNumber);
  
  // 2. 章生成処理（別モジュール）
  const chapter = await storyGenerator.generateChapter(chapterNumber, characterInfo);
  
  // 3. 章内のキャラクター検出
  const detectedCharacters = await characterManager.detectCharactersInContent(chapter.content);
  
  // 4. 登場キャラクターの記録
  for (const character of detectedCharacters) {
    await characterManager.recordCharacterAppearance(
      character.id,
      chapterNumber,
      `${character.name}が章${chapterNumber}に登場`,
      0.5
    );
  }
  
  // 5. キャラクター成長処理
  const growthResults = await characterManager.processAllCharacterGrowth(
    chapterNumber,
    chapter.content
  );
  
  // 6. 結果のログ出力
  console.log(`${detectedCharacters.length}人のキャラクターが章${chapterNumber}に登場しました`);
  console.log(`${growthResults.updatedCharacters.length}人のキャラクターが成長しました`);
  
  return {
    chapter,
    characterAppearances: detectedCharacters.map(c => c.name),
    characterGrowth: growthResults.updatedCharacters
  };
}
```

### キャラクター関係性の管理

```typescript
async function developRelationship(char1Id, char2Id, interactionType, description) {
  // 1. 現在の関係性を取得
  const relationships = await characterManager.getCharacterRelationships(char1Id);
  const currentRelationship = relationships.find(r => r.targetId === char2Id);
  
  // 2. 関係性の強さを更新
  let newStrength = currentRelationship ? currentRelationship.strength : 0.3;
  
  // インタラクションタイプに基づく調整
  switch (interactionType) {
    case 'POSITIVE':
      newStrength += 0.1;
      break;
    case 'NEGATIVE':
      newStrength -= 0.1;
      break;
    case 'NEUTRAL':
      // 変化なし
      break;
  }
  
  // 範囲内に収める
  newStrength = Math.max(0, Math.min(1, newStrength));
  
  // 3. 関係性を更新
  await characterManager.updateRelationship(
    char1Id,
    char2Id,
    currentRelationship?.type || 'NEUTRAL',
    newStrength
  );
  
  // 4. インタラクションを記録
  const chapterNumber = getCurrentChapterNumber(); // 外部関数
  await characterManager.recordCharacterInteraction(
    char1Id,
    char2Id,
    chapterNumber,
    interactionType,
    description,
    0.4
  );
  
  return {
    char1Id,
    char2Id,
    relationshipType: currentRelationship?.type || 'NEUTRAL',
    oldStrength: currentRelationship?.strength || 0,
    newStrength
  };
}
```

## 8. ベストプラクティスとアンチパターン

### ベストプラクティス

1. **常にファサードを使用する**:
   ```typescript
   // 良い例
   import { characterManager } from './characters/core/manager';
   const character = await characterManager.getCharacter(id);
   ```

2. **非同期処理を適切に扱う**:
   ```typescript
   // 良い例
   async function processCharacter(id) {
     try {
       const character = await characterManager.getCharacter(id);
       // 以降の処理
     } catch (error) {
       // エラー処理
     }
   }
   ```

3. **イベントシステムの活用**:
   ```typescript
   // 良い例
   eventBus.subscribe(EVENT_TYPES.CHARACTER_UPDATED, handleCharacterUpdate);
   ```

4. **エラーの適切な捕捉と処理**:
   ```typescript
   // 良い例
   try {
     await characterManager.updateCharacter(id, updates);
   } catch (error) {
     if (error instanceof NotFoundError) {
       // 特定エラーの処理
     } else {
       // 一般エラーの処理
     }
   }
   ```

### アンチパターン

1. **内部サービスへの直接アクセス**:
   ```typescript
   // 悪い例
   import { characterService } from './characters/services/character-service';
   const character = await characterService.getCharacter(id);
   ```

2. **初期化を待たないアクセス**:
   ```typescript
   // 悪い例（ただし実際はCharacterManagerが内部で初期化を保証するため問題ない）
   const character = characterManager.getCharacter(id); // Promiseの待機なし
   console.log(character.name); // 未解決のPromise
   ```

3. **イベントシステムの過剰使用**:
   ```typescript
   // 悪い例
   // 単純な処理をイベントで複雑化
   eventBus.publish(CUSTOM_EVENT.GET_CHARACTER, { id });
   eventBus.subscribe(CUSTOM_RESPONSE.CHARACTER_DATA, handleResponse);
   
   // 良い例
   const character = await characterManager.getCharacter(id);
   handleCharacter(character);
   ```

4. **非同期処理の連鎖をthenで処理**:
   ```typescript
   // 悪い例
   characterManager.getCharacter(id)
     .then(character => characterManager.updateCharacter(id, { ...character, name: "新名前" }))
     .then(updatedCharacter => console.log(updatedCharacter))
     .catch(error => console.error(error));
   
   // 良い例
   try {
     const character = await characterManager.getCharacter(id);
     const updatedCharacter = await characterManager.updateCharacter(id, { ...character, name: "新名前" });
     console.log(updatedCharacter);
   } catch (error) {
     console.error(error);
   }
   ```

5. **型の無視**:
   ```typescript
   // 悪い例
   const updates = { type: "INVALID_TYPE", someProperty: "value" };
   await characterManager.updateCharacter(id, updates); // 型エラーになる可能性
   
   // 良い例
   const updates: Partial<CharacterData> = { type: "SUB", personality: { traits: ["冷静"] } };
   await characterManager.updateCharacter(id, updates);
   ```

---

以上がキャラクターモジュール連携仕様書です。この仕様書に従うことで、他モジュールとキャラクターモジュールを適切に連携させることができます。不明点や追加情報が必要な場合は、担当者にお問い合わせください。

ご指摘ありがとうございます。おっしゃる通り、この点は補足が必要です。

基本的には、外部コンポーネントは`CharacterManager`ファサードだけを使うことを推奨していますが、インターフェースや型定義は特に拡張や統合を行う場合に重要です。以下に補足情報を追加します：


# インターフェースと型定義の活用

## core/interfaces.ts の主要インターフェース

`interfaces.ts`には様々なインターフェース定義が含まれており、特に以下は理解しておくと役立ちます：

```typescript
// 外部連携に最も重要なインターフェース
export interface ICharacterManager {
  // CharacterManagerがこのインターフェースを実装
  // ファサードとして公開されているメソッド群の定義
}

// 拡張や独自実装する場合に参照すべきインターフェース群
export interface ICharacterService { /* キャラクター基本操作 */ }
export interface IRelationshipService { /* 関係性管理 */ }
export interface IDetectionService { /* キャラクター検出 */ }
export interface IEvolutionService { /* 成長と発展 */ }
export interface IParameterService { /* パラメータ管理 */ }
export interface ISkillService { /* スキル管理 */ }
export interface IPsychologyService { /* 心理分析 */ }
```

**いつ使うか**: 基本的には`CharacterManager`ファサードを使うだけで十分ですが、以下の場合にはインターフェースの理解が必要です：

1. キャラクターモジュールの機能を拡張/オーバーライドする場合
2. テスト用のモックを作成する場合
3. 他モジュールとの統合で詳細な型情報が必要な場合

## core/types.ts の主要な型定義

```typescript
// キャラクター基本情報の型
export interface Character { /* キャラクター完全定義 */ }
export interface CharacterData { /* キャラクター作成/更新時のデータ */ }

// 状態と情報
export interface CharacterState { /* キャラクターの状態 */ }
export interface CharacterHistory { /* キャラクターの履歴 */ }
export interface Relationship { /* キャラクター間の関係性 */ }

// パラメータとスキル
export interface CharacterParameter { /* キャラクターのパラメータ */ }
export interface Skill { /* キャラクタースキル */ }

// 成長と発展
export interface GrowthPlan { /* 成長計画 */ }
export interface GrowthResult { /* 成長結果 */ }
export interface DevelopmentPath { /* 発展経路 */ }

// イベントと章
export interface ChapterEvent { /* 章イベント */ }
export interface StoryContext { /* ストーリーコンテキスト */ }
```

**いつ使うか**: これらの型定義は以下の場合に使用します：

1. CharacterManagerのメソッドを呼び出す際に適切な型のデータを渡す
2. 返り値を正しく型付けして処理する
3. キャラクターデータを操作する際の型安全性確保

## 補足: core/内の他のコンポーネント

基本的に外部コンポーネントは`core/`内の以下のファイルを意識する必要があります：

- **manager.ts**: `CharacterManager`ファサードを提供（主要連携ポイント）
- **types.ts**: データ型の定義（型安全性のために参照）
- **interfaces.ts**: コンポーネントインターフェース（拡張時に参照）
- **constants.ts**: 定数定義（イベントタイプなどの参照）
- **errors.ts**: エラー型の定義（エラーハンドリングに使用）

**その他の内部実装ファイル（サービス、リポジトリなど）には直接アクセスすべきではありません。**これはカプセル化の原則に従い、内部実装の変更が外部コンポーネントに影響しないようにするためです。

この追加情報が、キャラクターモジュールとの連携をより理解しやすくする一方で、混乱を招かないことを願っています。最も重要なのは、通常の利用であれば`CharacterManager`ファサードのみを通じて操作するということです。