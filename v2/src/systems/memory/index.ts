/**
 * 記憶階層システム公開インターフェース
 * 3層構造（短期・中期・長期）で物語の記憶を管理
 */

// コアコンポーネント
export { MemoryManager } from './core/memory-manager';

// 3層記憶システム
export * from './short-term';
export * from './mid-term';
export * from './long-term';

// インターフェースと型定義
export * from './interfaces';
export * from './types';

// 統合機能（将来実装予定）
// export * from './integration';

// ストレージ層（将来実装予定）
// export * from './storage';

// ユーティリティ（将来実装予定）
// export * from './utils';

// デフォルトエクスポート
export { MemoryManager as default } from './core/memory-manager';