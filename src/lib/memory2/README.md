src/lib/memory/
│
├── manager.ts                      # メインファサード (既存ファイル名を維持)
├── interfaces.ts                   # 共通インターフェース定義
│
├── immediate/                      # 短期記憶層
│   ├── immediate-context.ts        # メインクラス
│   ├── chapter-storage.ts          # 章保存管理
│   ├── key-phrase-extractor.ts     # キーフレーズ抽出
│   ├── character-state-tracker.ts  # キャラクター状態追跡
│   └── types.ts                    # 型定義
│
├── narrative/                      # 中期記憶層 (既存構造維持)
│   ├── narrative-memory.ts         # 中期記憶メインクラス
│   ├── chapter-analysis-manager.ts # 章分析
│   ├── character-tracking-manager.ts # キャラクター追跡
│   ├── emotional-dynamics-manager.ts # 感情ダイナミクス
│   ├── narrative-state-manager.ts  # 物語状態
│   ├── world-context-manager.ts    # 世界コンテキスト
│   └── types.ts                    # 型定義
│
├── world/                          # 長期記憶層
│   ├── world-knowledge.ts          # メインクラス
│   ├── established-events.ts       # 確立されたイベント
│   ├── foreshadowing-manager.ts    # 伏線管理
│   ├── character-knowledge.ts      # キャラクター知識
│   ├── world-settings.ts           # 世界設定
│   └── types.ts                    # 型定義
│
├── processors/                     # 処理モジュール
│   ├── chapter-processor.ts        # チャプター処理
│   ├── context-generator.ts        # コンテキスト生成
│   ├── memory-sync-service.ts      # 記憶同期処理
│   └── types.ts                    # 型定義
│
├── analysis/                       # 分析モジュール
│   ├── text-analyzer.ts            # テキスト分析
│   ├── expression-analyzer.ts      # 表現分析
│   ├── psychology-analyzer.ts      # 心理分析
│   ├── consistency-checker.ts      # 一貫性チェック
│   └── types.ts                    # 型定義
│
├── character/                      # キャラクター関連
│   ├── character-tracker.ts        # キャラクター追跡メイン
│   ├── growth-processor.ts         # 成長処理
│   ├── relationship-tracker.ts     # 関係追跡
│   ├── state-change-processor.ts   # 状態変化処理
│   └── types.ts                    # 型定義
│
├── events/                         # イベント管理
│   ├── event-registry.ts           # イベント登録メイン
│   ├── persistent-event-handler.ts # 永続的イベント処理
│   ├── event-memory.ts             # イベントメモリ
│   ├── event-query-engine.ts       # イベントクエリエンジン
│   └── types.ts                    # 型定義
│
├── services/                       # 共通サービス
│   ├── temporary-storage.ts        # 一時保存
│   └── logger-service.ts           # ロギング
│
└── types/                          # 共通型定義
    ├── memory-types.ts
    ├── event-types.ts
    └── narrative-states.ts