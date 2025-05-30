// src/types/parameters.ts

/**
 * システムパラメータの定義
 * システム全体で使用される設定値を階層的に管理
 */
export interface SystemParameters {
    // 生成設定
    generation: {
      targetLength: number;         // 目標文字数 (デフォルト: 8000)
      minLength: number;            // 最小文字数
      maxLength: number;            // 最大文字数
      model: string;                // 使用するAIモデル
      models?: Record<string, string>; // 用途別モデルマップ
      temperature: number;          // 温度パラメータ (0.0-1.0)
      topP: number;                 // Top-P サンプリング
      topK: number;               // 追加
      frequencyPenalty: number;     // 頻度ペナルティ
      presencePenalty: number;      // 存在ペナルティ
      apiLimits?: {
        requestsPerMinute: number;    // 1分あたりのリクエスト上限
        tokensPerMinute?: number;     // 1分あたりのトークン上限（オプション）
        retryLimit?: number;          // エラー時の最大再試行回数（オプション）
        backoffMultiplier?: number;   // バックオフ時間の乗数（オプション）
      };
      queueSettings?: {
        enableBatching?: boolean;     // バッチ処理を有効にするか
        batchSize?: number;           // バッチサイズ
        batchInterval?: number;       // バッチ間隔（ミリ秒）
        highPriorityTimeout?: number; // 高優先度リクエストのタイムアウト
        lowPriorityTimeout?: number;  // 低優先度リクエストのタイムアウト
      };
    };
    
    // 記憶管理
    memory: {
      shortTermChapters: number;    // 短期記憶に保持するチャプター数
      midTermArcSize: number;       // 中期記憶アークサイズ
      summaryDetailLevel: number;   // 要約詳細レベル (1-10)
      consistencyThreshold: number; // 整合性判定閾値
    };
    
    // キャラクター管理
    characters: {
      maxMainCharacters: number;    // メインキャラの最大数
      maxSubCharacters: number;     // サブキャラの最大数
      characterBleedTolerance: number; // キャラブレ許容度
      newCharacterIntroRate: number; // 新キャラ導入率
    };
    
    // プロット管理
    plot: {
      foreshadowingDensity: number; // 伏線密度
      resolutionDistance: number;   // 伏線回収距離
      abstractConcreteBalance: number; // 抽象・具体バランス (0-1)
      coherenceCheckFrequency: number; // 整合性チェック頻度
    };
    
    // 物語進行
    progression: {
      maxSameStateChapters: number; // 同一状態の最大許容チャプター数
      stagnationThreshold: number;  // 停滞判定閾値
      tensionMinVariance: number;   // テンション最小変動量
      dialogActionRatio: number;    // 対話・行動比率
    };
    
    // システム設定
    system: {
      autoSaveInterval: number;     // 自動保存間隔(分)
      maxHistoryItems: number;      // 履歴保持最大数
      logLevel: 'debug' | 'info' | 'warn' | 'error';
      workingDirectory: string;     // 作業ディレクトリ
      backupEnabled: boolean;       // バックアップ有効化
      backupCount: number;          // バックアップ保持数
    };
  }
  
  /**
   * パラメータプリセットの定義
   * 再利用可能なパラメータ設定一式を表す
   */
  export interface ParameterPreset {
    id: string;                     // プリセットID (URLセーフな一意の識別子)
    name: string;                   // プリセット名
    description: string;            // 説明
    createdDate: Date;              // 作成日
    lastModified: Date;             // 最終更新日
    parameters: SystemParameters;   // パラメータ設定
    tags: string[];                 // タグ（検索・分類用）
    isDefault: boolean;             // デフォルトプリセットかどうか
  }
  
  /**
   * パラメータ変更履歴の定義
   * パラメータの変更履歴を追跡するためのスナップショット
   */
  export interface ParameterHistory {
    timestamp: Date;                // 変更日時
    parameters: SystemParameters;   // パラメータスナップショット
    description: string;            // 変更内容説明
    changeSummary: string;          // 変更概要
  }
  
  /**
   * パラメータ変更イベントの定義
   * 個別パラメータの変更を表す
   */
  export interface ParameterChangeEvent {
    paramPath: string;              // 変更されたパラメータパス
    oldValue: any;                  // 変更前の値
    newValue: any;                  // 変更後の値
    timestamp: Date;                // 変更日時
    source: 'USER' | 'SYSTEM' | 'API'; // 変更元
  }