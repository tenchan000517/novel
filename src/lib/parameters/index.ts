// src\lib\parameters\index.ts

/**
 * パラメータ管理システム
 * システム全体で使用される設定値を一元管理する
 */

// パラメータマネージャーシングルトン
export { parameterManager } from './manager';
export { ParameterManager } from './manager';

// インターフェース（型として明示的にエクスポート）
export type { IParameterManager } from './types';

// デフォルトパラメータ
export { DEFAULT_PARAMETERS } from './default-parameters';

// バリデーター
export { ParameterValidator } from './parameter-validator';

// 型定義をリエクスポート
export type {
  SystemParameters,
  ParameterPreset,
  ParameterHistory,
  ParameterChangeEvent
} from '../../types/parameters';