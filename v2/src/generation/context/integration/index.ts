/**
 * Version 2.0 - Data Integration Index
 * 
 * データ統合コンポーネントの統一エクスポート
 * スクラップ&ビルド: 最小限かつ確実な構成
 */

// 実装クラスの直接エクスポート
export { DataMerger } from './data-merger';
export { PriorityCalculator } from './priority-calculator';  
export { RelevanceFilter } from './relevance-filter';

// インターフェースは既存のものを再エクスポート
export type { IDataMerger, IPriorityCalculator, IRelevanceFilter } from '../interfaces';

// 基本型は既存のものを再エクスポート
export type { SystemDataWithPriority } from '../types';