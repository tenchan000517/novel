// // src\lib\analysis\performance-analyzer.ts
// /**
//  * @fileoverview パフォーマンス分析システム
//  * @description
//  * システムのパフォーマンス（生成速度、メモリ使用量、API遅延、キャッシュ効率など）を
//  * 測定・分析するためのモジュール。リアルタイムのパフォーマンスモニタリングと
//  * 長期的なトレンド分析を提供します。
//  * 
//  * @role
//  * - システムのパフォーマンスメトリクス収集と分析
//  * - パフォーマンス最適化のための推奨事項の提供
//  * - システムヘルスの継続的なモニタリング
//  * 
//  * @dependencies
//  * - @/types/analysis - パフォーマンス関連の型定義
//  * - @/lib/utils/logger - ログ出力機能
//  * - @/lib/storage - データ永続化機能（インポートされているが現在未使用）
//  * - @/lib/utils/error-handler - エラーハンドリングとログ出力
//  * 
//  * @types
//  * - @/types/analysis - PerformanceMetrics, SpeedMetrics, LatencyMetrics, CacheMetrics
//  * 
//  * @flow
//  * 1. パフォーマンスアナライザーのインスタンス化
//  * 2. 各種パフォーマンスイベントの記録（生成、API呼び出し、キャッシュ、エラーなど）
//  * 3. 定期的なメモリ使用量サンプリング（自動実行）
//  * 4. パフォーマンス分析レポートの生成（analyzeSystemPerformance呼び出し時）
//  */

// import { PerformanceMetrics, SpeedMetrics, LatencyMetrics, CacheMetrics } from '@/types/analysis';
// import { logger } from '@/lib/utils/logger';
// import { storageProvider } from '@/lib/storage';
// import { logError, getErrorMessage } from '@/lib/utils/error-handler';

// /**
//  * @class PerformanceAnalyzer
//  * @description
//  * システムのパフォーマンス（生成速度、メモリ使用量、API遅延など）を分析するクラス。
//  * 様々なパフォーマンスメトリクスを収集・集計・分析し、システムのヘルス状態を
//  * モニタリングするための機能を提供します。
//  * 
//  * @role
//  * - パフォーマンスメトリクスの収集と保存
//  * - 短期・長期のパフォーマンストレンド分析
//  * - パフォーマンス最適化のための推奨事項の生成
//  * - メモリ使用量の定期的なサンプリング
//  * 
//  * @depends-on
//  * - logger - ログ出力のため
//  * - logError - エラー記録のため
//  * - getErrorMessage - エラーメッセージ抽出のため
//  * 
//  * @lifecycle
//  * 1. インスタンス化：メトリクス保存用のデータ構造を初期化
//  * 2. メモリサンプリング開始：定期的（30秒ごと）にメモリ使用量をサンプリング
//  * 3. 各種イベント記録：API呼び出し、生成処理、キャッシュ操作、エラー発生時に対応するメソッドで記録
//  * 4. 分析実行：analyzeSystemPerformance()メソッドで総合的な分析を実行
//  * 5. クリーンアップ：グローバル変数経由でインターバルタイマーをクリーンアップ可能
//  * 
//  * @example-flow
//  * アプリケーション → PerformanceAnalyzerインスタンス化 →
//  *   定期的なメモリサンプリング（自動） →
//  *   各種イベント記録（recordXXX()メソッド） →
//  *   analyzeSystemPerformance()呼び出し →
//  *   パフォーマンスレポート生成 →
//  *   最適化推奨事項の提供
//  */
// export class PerformanceAnalyzer {
//     private metrics: {
//         speed: SpeedMetricsRecord[];
//         latency: Record<string, LatencySample[]>;
//         memory: MemorySample[];
//         cache: CacheSample[];
//         errors: ErrorRecord[];
//     };

//     private startTime: Date;

//     /**
//      * パフォーマンス分析システムを初期化する
//      * 
//      * メトリクス記録用のデータ構造を初期化し、メモリ使用量の定期サンプリングを開始します。
//      * インスタンス化時に自動的にメモリモニタリングを開始します。
//      * 
//      * @constructor
//      * 
//      * @usage
//      * // パフォーマンスアナライザーの初期化
//      * const analyzer = new PerformanceAnalyzer();
//      * 
//      * @call-flow
//      * 1. メトリクス保存用のデータ構造を初期化
//      * 2. 開始時間を記録
//      * 3. メモリ使用量の定期サンプリングを開始
//      * 4. 初期化完了をログに記録
//      * 
//      * @initialization
//      * - 空のメトリクス保存用データ構造を作成
//      * - 30秒ごとのメモリサンプリングインターバルを設定
//      * - グローバルクリーンアップハンドラを登録
//      * 
//      * @error-handling
//      * メモリサンプリング開始時のエラーをキャッチし、ログに記録
//      */
//     constructor() {
//         this.metrics = {
//             speed: [],
//             latency: {},
//             memory: [],
//             cache: [],
//             errors: []
//         };

//         this.startTime = new Date();

//         // メモリ使用量の定期サンプリングを開始
//         this.startMemorySampling();

//         logger.info('パフォーマンス分析システムを初期化しました');
//     }

//     /**
//      * システムパフォーマンスを総合的に分析する
//      * 
//      * 生成速度、メモリ使用量、API遅延、キャッシュ効率、エラー率を含む
//      * 総合的なパフォーマンスメトリクスを収集・分析します。
//      * 
//      * @async
//      * @returns {Promise<PerformanceMetrics>} システムパフォーマンスの総合分析結果
//      * 
//      * @usage
//      * // パフォーマンス分析の実行
//      * const metrics = await performanceAnalyzer.analyzeSystemPerformance();
//      * console.log(metrics.generationSpeed.tokenPerSecond); // トークン生成速度の確認
//      * 
//      * @call-flow
//      * 1. 分析開始をログに記録
//      * 2. 各種パフォーマンスメトリクスを測定
//      *    - 生成速度の測定
//      *    - メモリ使用量の測定
//      *    - API遅延の測定
//      *    - キャッシュ効率の測定
//      *    - エラー率の計算
//      * 3. 測定結果を組み合わせて総合レポートを作成
//      * 
//      * @helper-methods
//      * - measureGenerationSpeed - 生成速度測定
//      * - measureMemoryUsage - メモリ使用量測定
//      * - measureApiLatency - API遅延測定
//      * - measureCacheEfficiency - キャッシュ効率測定
//      * - calculateErrorRate - エラー率計算
//      * 
//      * @error-handling
//      * エラー発生時も部分的な情報を返すようにしています。
//      * エラーをログに記録した後、デフォルト値を使用して可能な限り情報を返します。
//      * 
//      * @performance-considerations
//      * エラーが発生しても完全に失敗せず、利用可能な情報は返すように設計されています。
//      * 
//      * @monitoring
//      * - ログレベル: INFO/ERROR
//      */
//     async analyzeSystemPerformance(): Promise<PerformanceMetrics> {
//         try {
//             logger.info('システムパフォーマンス分析を開始します');

//             return {
//                 generationSpeed: await this.measureGenerationSpeed(),
//                 memoryUsage: await this.measureMemoryUsage(),
//                 apiLatency: await this.measureApiLatency(),
//                 cacheEfficiency: await this.measureCacheEfficiency(),
//                 errorRate: await this.calculateErrorRate(),
//             };
//         } catch (error: unknown) {
//             logError(error, {}, `パフォーマンス分析中にエラーが発生しました`);

//             // エラー発生時もできるだけ情報を返す
//             return {
//                 generationSpeed: this.getDefaultSpeedMetrics(),
//                 memoryUsage: this.getDefaultMemoryMetrics(),
//                 apiLatency: this.getDefaultLatencyMetrics(),
//                 cacheEfficiency: this.getDefaultCacheMetrics(),
//                 errorRate: {
//                     overall: 0,
//                     byType: {}
//                 },
//             };
//         }
//     }

//     /**
//      * 生成速度を測定する
//      * 
//      * 最近の生成速度データを分析し、平均生成時間、トークンあたりの速度、
//      * 効率（理想値との比較）、トレンドなどを計算します。
//      * 
//      * @async
//      * @returns {Promise<SpeedMetrics>} 生成速度に関するメトリクス
//      * 
//      * @usage
//      * // 生成速度の測定
//      * const speedMetrics = await performanceAnalyzer.measureGenerationSpeed();
//      * console.log(`トークン/秒: ${speedMetrics.tokenPerSecond}`);
//      * 
//      * @call-flow
//      * 1. 最近の生成速度レコード（最大10件）を取得
//      * 2. 平均生成時間を計算
//      * 3. トークンあたりの速度を計算
//      * 4. 理想値との比較による効率を計算
//      * 5. 速度トレンドを分析
//      * 6. 計算結果をまとめて返却
//      * 
//      * @helper-methods
//      * - analyzeSpeedTrend - 速度トレンドの分析
//      * - getDefaultSpeedMetrics - デフォルト値の取得
//      * 
//      * @error-handling
//      * エラー発生時はログに記録し、デフォルト値を返します
//      * 
//      * @performance-considerations
//      * 計算は最近の10件のレコードのみを対象とし、計算量を抑えています
//      */
//     async measureGenerationSpeed(): Promise<SpeedMetrics> {
//         try {
//             // 最近の生成速度データを使用
//             const recentRecords = this.metrics.speed.slice(-10);

//             if (recentRecords.length === 0) {
//                 return this.getDefaultSpeedMetrics();
//             }

//             // 平均生成時間
//             const totalTime = recentRecords.reduce((sum, record) => sum + record.totalTime, 0);
//             const averageTime = totalTime / recentRecords.length;

//             // トークンあたりの速度
//             const totalTokens = recentRecords.reduce((sum, record) => sum + record.tokenCount, 0);
//             const tokenPerSecond = (totalTokens / totalTime) * 1000; // ミリ秒→秒に変換

//             // 効率（理想値との比較）
//             const idealTokensPerSecond = 30; // 理想的なトークン/秒の値
//             const efficiency = Math.min(tokenPerSecond / idealTokensPerSecond, 1);

//             // 傾向の分析
//             const trend = this.analyzeSpeedTrend(recentRecords);

//             return {
//                 averageTime,
//                 tokenPerSecond,
//                 efficiency,
//                 trend,
//                 recentHistory: recentRecords.map(r => ({
//                     averageTime: r.totalTime,
//                     tokenPerSecond: (r.tokenCount / r.totalTime) * 1000,
//                     efficiency: Math.min((r.tokenCount / r.totalTime) * 1000 / idealTokensPerSecond, 1)
//                 }))
//             };
//         } catch (error: unknown) {
//             logError(error, {}, `生成速度測定中にエラーが発生しました`);

//             return this.getDefaultSpeedMetrics();
//         }
//     }

//     /**
//      * 生成速度の傾向を分析する
//      */
//     private analyzeSpeedTrend(records: SpeedMetricsRecord[]): 'IMPROVING' | 'STABLE' | 'DECLINING' {
//         if (records.length < 3) return 'STABLE';

//         // 最初と最後の1/3ずつを比較
//         const firstThird = records.slice(0, Math.floor(records.length / 3));
//         const lastThird = records.slice(-Math.floor(records.length / 3));

//         const firstAvg = firstThird.reduce((sum, r) => sum + r.totalTime, 0) / firstThird.length;
//         const lastAvg = lastThird.reduce((sum, r) => sum + r.totalTime, 0) / lastThird.length;

//         // 10%以上の変化があれば傾向ありとみなす
//         const changeRatio = (firstAvg - lastAvg) / firstAvg;

//         if (changeRatio > 0.1) return 'IMPROVING'; // 時間が減少=改善
//         if (changeRatio < -0.1) return 'DECLINING'; // 時間が増加=悪化
//         return 'STABLE';
//     }

//     /**
//      * メモリ使用量を測定する
//      * 
//      * 収集されたメモリサンプルを分析し、平均使用量、ピーク使用量、
//      * 使用量のトレンドなどを計算します。
//      * 
//      * @async
//      * @returns {Promise<PerformanceMetrics['memoryUsage']>} メモリ使用量に関するメトリクス
//      * 
//      * @usage
//      * // メモリ使用量の測定
//      * const memoryMetrics = await performanceAnalyzer.measureMemoryUsage();
//      * console.log(`平均メモリ使用量: ${memoryMetrics.average}MB`);
//      * 
//      * @call-flow
//      * 1. 記録されたメモリサンプルを取得
//      * 2. 現在のメモリ使用量を取得（最新サンプル）
//      * 3. 平均メモリ使用量を計算
//      * 4. ピークメモリ使用量を特定
//      * 5. メモリ使用量のトレンドを分析
//      * 6. 計算結果をまとめて返却
//      * 
//      * @helper-methods
//      * - analyzeMemoryTrend - メモリトレンドの分析
//      * - getDefaultMemoryMetrics - デフォルト値の取得
//      * 
//      * @error-handling
//      * エラー発生時はログに記録し、デフォルト値を返します
//      */
//     async measureMemoryUsage(): Promise<PerformanceMetrics['memoryUsage']> {
//         try {
//             const samples = this.metrics.memory;

//             if (samples.length === 0) {
//                 return this.getDefaultMemoryMetrics();
//             }

//             // 現在のメモリ使用量
//             const current = samples[samples.length - 1];

//             // 平均メモリ使用量
//             const totalUsed = samples.reduce((sum, sample) => sum + sample.used, 0);
//             const average = totalUsed / samples.length;

//             // ピークメモリ使用量
//             const peak = Math.max(...samples.map(sample => sample.used));

//             // トレンドの計算
//             const trend = this.analyzeMemoryTrend(samples);

//             return {
//                 average,
//                 peak,
//                 trend,
//                 current: {
//                     total: current.total,
//                     used: current.used,
//                     external: current.external || 0
//                 },
//                 history: samples.map(sample => ({
//                     timestamp: sample.timestamp,
//                     used: sample.used
//                 }))
//             };
//         } catch (error: unknown) {
//             logError(error, {}, `メモリ使用量測定中にエラーが発生しました`);
//             return this.getDefaultMemoryMetrics();
//         }
//     }

//     /**
//      * メモリ使用量の傾向を分析する
//      */
//     private analyzeMemoryTrend(samples: MemorySample[]): 'INCREASING' | 'STABLE' | 'DECREASING' {
//         if (samples.length < 10) return 'STABLE';

//         // 最初と最後の1/4ずつを比較
//         const firstQuarter = samples.slice(0, Math.floor(samples.length / 4));
//         const lastQuarter = samples.slice(-Math.floor(samples.length / 4));

//         const firstAvg = firstQuarter.reduce((sum, s) => sum + s.used, 0) / firstQuarter.length;
//         const lastAvg = lastQuarter.reduce((sum, s) => sum + s.used, 0) / lastQuarter.length;

//         // 15%以上の変化があれば傾向ありとみなす
//         const changeRatio = (lastAvg - firstAvg) / firstAvg;

//         if (changeRatio > 0.15) return 'INCREASING';
//         if (changeRatio < -0.15) return 'DECREASING';
//         return 'STABLE';
//     }

//     /**
//      * API遅延を測定する
//      * 
//      * 記録されたAPIエンドポイントごとの遅延データを分析し、平均遅延、
//      * p95遅延、エンドポイント別の内訳、遅延トレンドなどを計算します。
//      * 
//      * @async
//      * @returns {Promise<LatencyMetrics>} API遅延に関するメトリクス
//      * 
//      * @usage
//      * // API遅延の測定
//      * const latencyMetrics = await performanceAnalyzer.measureApiLatency();
//      * console.log(`平均API遅延: ${latencyMetrics.average}ms`);
//      * 
//      * @call-flow
//      * 1. 記録されたAPIエンドポイント遅延データを取得
//      * 2. すべてのエンドポイントの遅延を結合
//      * 3. 全体の平均遅延を計算
//      * 4. 全体のp95遅延を計算
//      * 5. エンドポイント別の統計を計算
//      * 6. 遅延のトレンドを分析
//      * 7. 計算結果をまとめて返却
//      * 
//      * @helper-methods
//      * - calculatePercentile - パーセンタイルの計算
//      * - analyzeLatencyTrend - 遅延トレンドの分析
//      * - getDefaultLatencyMetrics - デフォルト値の取得
//      * 
//      * @error-handling
//      * エラー発生時はログに記録し、デフォルト値を返します
//      */
//     async measureApiLatency(): Promise<LatencyMetrics> {
//         try {
//             const latencies = this.metrics.latency;
//             const endpoints = Object.keys(latencies);

//             if (endpoints.length === 0) {
//                 return this.getDefaultLatencyMetrics();
//             }

//             // 全エンドポイントの遅延を結合
//             const allLatencies = Object.values(latencies).flat().map(sample => sample.latency);

//             // 平均遅延
//             const average = allLatencies.length > 0
//                 ? allLatencies.reduce((sum, lat) => sum + lat, 0) / allLatencies.length
//                 : 0;

//             // p95遅延
//             const p95 = this.calculatePercentile(allLatencies, 95);

//             // エンドポイント別の内訳
//             const breakdown: Record<string, {
//                 average: number;
//                 p95: number;
//                 min?: number;
//                 max?: number;
//                 count?: number;
//             }> = {};

//             for (const [endpoint, samples] of Object.entries(latencies)) {
//                 if (samples.length === 0) continue;

//                 const endpointLatencies = samples.map(sample => sample.latency);

//                 breakdown[endpoint] = {
//                     average: endpointLatencies.reduce((sum, lat) => sum + lat, 0) / endpointLatencies.length,
//                     p95: this.calculatePercentile(endpointLatencies, 95),
//                     min: Math.min(...endpointLatencies),
//                     max: Math.max(...endpointLatencies),
//                     count: samples.length
//                 };
//             }

//             // トレンドの分析
//             const trend = this.analyzeLatencyTrend(latencies);

//             return {
//                 average,
//                 p95,
//                 breakdown,
//                 trend
//             };
//         } catch (error: unknown) {
//             logError(error, {}, `API遅延測定中にエラーが発生しました`);
//             return this.getDefaultLatencyMetrics();
//         }
//     }

//     /**
//      * 遅延の傾向を分析する
//      */
//     private analyzeLatencyTrend(latencies: Record<string, LatencySample[]>): 'IMPROVING' | 'STABLE' | 'DEGRADING' {
//         // 最近のサンプルが十分にあるエンドポイントだけを分析
//         const eligibleEndpoints = Object.entries(latencies)
//             .filter(([_, samples]) => samples.length >= 10)
//             .map(([endpoint, samples]) => {
//                 // 日付でソート
//                 samples.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

//                 // 最初と最後の1/3ずつを比較
//                 const firstThird = samples.slice(0, Math.floor(samples.length / 3));
//                 const lastThird = samples.slice(-Math.floor(samples.length / 3));

//                 const firstAvg = firstThird.reduce((sum, s) => sum + s.latency, 0) / firstThird.length;
//                 const lastAvg = lastThird.reduce((sum, s) => sum + s.latency, 0) / lastThird.length;

//                 // 変化率
//                 return (firstAvg - lastAvg) / firstAvg;
//             });

//         if (eligibleEndpoints.length === 0) return 'STABLE';

//         // 平均変化率
//         const avgChange = eligibleEndpoints.reduce((sum, change) => sum + change, 0) / eligibleEndpoints.length;

//         // 15%以上の変化があれば傾向ありとみなす
//         if (avgChange > 0.15) return 'IMPROVING'; // 遅延が減少=改善
//         if (avgChange < -0.15) return 'DEGRADING'; // 遅延が増加=悪化
//         return 'STABLE';
//     }

//     /**
//      * キャッシュ効率を測定する
//      * 
//      * 記録されたキャッシュイベント（ヒット、ミス、削除）を分析し、
//      * ヒット率、ミス率、削除率、効率のトレンド、改善提案などを計算します。
//      * 
//      * @async
//      * @returns {Promise<CacheMetrics>} キャッシュ効率に関するメトリクス
//      * 
//      * @usage
//      * // キャッシュ効率の測定
//      * const cacheMetrics = await performanceAnalyzer.measureCacheEfficiency();
//      * console.log(`キャッシュヒット率: ${cacheMetrics.hitRate * 100}%`);
//      * 
//      * @call-flow
//      * 1. 記録されたキャッシュサンプルを取得
//      * 2. ヒット、ミス、削除の合計を集計
//      * 3. 各種レート（ヒット率、ミス率、削除率）を計算
//      * 4. キャッシュ効率のトレンドを分析
//      * 5. 改善提案を生成
//      * 6. 履歴データを作成
//      * 7. 計算結果をまとめて返却
//      * 
//      * @helper-methods
//      * - analyzeCacheTrend - キャッシュトレンドの分析
//      * - generateCacheRecommendations - キャッシュ改善提案の生成
//      * - getDefaultCacheMetrics - デフォルト値の取得
//      * 
//      * @error-handling
//      * エラー発生時はログに記録し、デフォルト値を返します
//      */
//     async measureCacheEfficiency(): Promise<CacheMetrics> {
//         try {
//             const samples = this.metrics.cache;

//             if (samples.length === 0) {
//                 return this.getDefaultCacheMetrics();
//             }

//             // サンプルを集計
//             const totalHits = samples.reduce((sum, sample) => sum + sample.hits, 0);
//             const totalMisses = samples.reduce((sum, sample) => sum + sample.misses, 0);
//             const totalEvictions = samples.reduce((sum, sample) => sum + sample.evictions, 0);
//             const totalRequests = totalHits + totalMisses;

//             // レート計算
//             const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0;
//             const missRate = totalRequests > 0 ? totalMisses / totalRequests : 0;
//             const evictionRate = totalRequests > 0 ? totalEvictions / totalRequests : 0;

//             // トレンドの分析
//             const trend = this.analyzeCacheTrend(samples);

//             // 改善提案の生成
//             const recommendations = this.generateCacheRecommendations(hitRate, evictionRate, trend);

//             // 履歴データの作成
//             const history = samples.map(sample => {
//                 const total = sample.hits + sample.misses;
//                 return {
//                     timestamp: sample.timestamp,
//                     hitRate: total > 0 ? sample.hits / total : 0,
//                     missRate: total > 0 ? sample.misses / total : 0,
//                     evictionRate: total > 0 ? sample.evictions / total : 0
//                 };
//             });

//             return {
//                 hitRate,
//                 missRate,
//                 evictionRate,
//                 trend,
//                 recommendations,
//                 history
//             };
//         } catch (error: unknown) {
//             logError(error, {}, `キャッシュ効率測定中にエラーが発生しました`);
//             return this.getDefaultCacheMetrics();
//         }
//     }

//     /**
//      * キャッシュの傾向を分析する
//      */
//     private analyzeCacheTrend(samples: CacheSample[]): 'IMPROVING' | 'STABLE' | 'DEGRADING' {
//         if (samples.length < 5) return 'STABLE';

//         // 日付でソート
//         samples.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

//         // 最初と最後の1/3ずつを比較
//         const firstThird = samples.slice(0, Math.floor(samples.length / 3));
//         const lastThird = samples.slice(-Math.floor(samples.length / 3));

//         // ヒット率の比較
//         const firstHitRate = firstThird.reduce((sum, s) => {
//             const total = s.hits + s.misses;
//             return sum + (total > 0 ? s.hits / total : 0);
//         }, 0) / firstThird.length;

//         const lastHitRate = lastThird.reduce((sum, s) => {
//             const total = s.hits + s.misses;
//             return sum + (total > 0 ? s.hits / total : 0);
//         }, 0) / lastThird.length;

//         // 変化率
//         const changeRatio = (lastHitRate - firstHitRate) / (firstHitRate || 1);

//         // 10%以上の変化があれば傾向ありとみなす
//         if (changeRatio > 0.1) return 'IMPROVING'; // ヒット率が増加=改善
//         if (changeRatio < -0.1) return 'DEGRADING'; // ヒット率が減少=悪化
//         return 'STABLE';
//     }

//     /**
//      * キャッシュの改善提案を生成する
//      */
//     private generateCacheRecommendations(hitRate: number, evictionRate: number, trend: 'IMPROVING' | 'STABLE' | 'DEGRADING'): string[] {
//         const recommendations: string[] = [];

//         // ヒット率に基づく提案
//         if (hitRate < 0.5) {
//             recommendations.push("キャッシュヒット率が低いため、キャッシュキーの設計を見直すことを検討してください。");
//         }

//         // 削除率に基づく提案
//         if (evictionRate > 0.1) {
//             recommendations.push("キャッシュ削除率が高いため、キャッシュサイズの増加を検討してください。");
//         }

//         // トレンドに基づく提案
//         if (trend === 'DEGRADING') {
//             recommendations.push("キャッシュパフォーマンスが悪化しています。データアクセスパターンの変化がないか確認してください。");
//         }

//         // 特に問題がない場合
//         if (recommendations.length === 0) {
//             if (hitRate > 0.8) {
//                 recommendations.push("キャッシュは効率的に動作しています。現在の設定を維持してください。");
//             } else {
//                 recommendations.push("キャッシュは許容範囲内で動作しています。必要に応じて設定を微調整してください。");
//             }
//         }

//         return recommendations;
//     }

//     /**
//      * エラー率を計算する
//      * 
//      * 記録されたエラーイベントを分析し、全体のエラー率、
//      * タイプ別エラー率、重大度別エラー率、トレンド、改善提案などを計算します。
//      * 
//      * @async
//      * @returns {Promise<PerformanceMetrics['errorRate']>} エラー率に関するメトリクス
//      * 
//      * @usage
//      * // エラー率の計算
//      * const errorRateMetrics = await performanceAnalyzer.calculateErrorRate();
//      * console.log(`全体エラー率: ${errorRateMetrics.overall * 100}%`);
//      * 
//      * @call-flow
//      * 1. 記録されたエラーレコードを取得
//      * 2. 総リクエスト数を推定（エラーは全体の10%と仮定）
//      * 3. 全体エラー率を計算
//      * 4. タイプ別エラー率を計算
//      * 5. 重大度別エラー率を計算
//      * 6. エラートレンドを分析
//      * 7. 改善提案を生成
//      * 8. 計算結果をまとめて返却
//      * 
//      * @helper-methods
//      * - analyzeErrorTrend - エラートレンドの分析
//      * - generateErrorRecommendations - エラー改善提案の生成
//      * - groupBy - データのグループ化
//      * 
//      * @error-handling
//      * エラー発生時はログに記録し、デフォルト値を返します
//      * 
//      * @note
//      * 総リクエスト数は推定値であり、実際の実装では正確に計測する必要があります
//      */
//     async calculateErrorRate(): Promise<PerformanceMetrics['errorRate']> {
//         try {
//             const errors = this.metrics.errors;

//             if (errors.length === 0) {
//                 return {
//                     overall: 0,
//                     byType: {}
//                 };
//             }

//             // 総リクエスト数の推定
//             // 実際の実装ではリクエスト総数を正確に計測する必要がある
//             const totalRequests = errors.reduce((sum, record) => sum + record.count, 0) * 10; // エラーは10%程度と仮定

//             // 全体エラー率
//             const totalErrors = errors.reduce((sum, record) => sum + record.count, 0);
//             const overall = totalRequests > 0 ? totalErrors / totalRequests : 0;

//             // タイプ別エラー率
//             const byType: Record<string, { count: number, rate: number }> = {};

//             // エラータイプでグループ化
//             const typeGroups = this.groupBy(errors, 'type');

//             for (const [type, records] of Object.entries(typeGroups)) {
//                 const typeCount = records.reduce((sum, record) => sum + record.count, 0);
//                 byType[type] = {
//                     count: typeCount,
//                     rate: totalRequests > 0 ? typeCount / totalRequests : 0
//                 };
//             }

//             // 重大度別エラー率
//             const bySeverity: Record<string, number> = {};

//             // 重大度でグループ化
//             const severityGroups = this.groupBy(errors, 'severity');

//             for (const [severity, records] of Object.entries(severityGroups)) {
//                 const severityCount = records.reduce((sum, record) => sum + record.count, 0);
//                 bySeverity[severity] = totalRequests > 0 ? severityCount / totalRequests : 0;
//             }

//             // トレンドの分析
//             const trend = this.analyzeErrorTrend(errors);

//             // 改善提案の生成
//             const recommendations = this.generateErrorRecommendations(overall, byType);

//             return {
//                 overall,
//                 byType,
//                 bySeverity,
//                 trend,
//                 recommendations
//             };
//         } catch (error: unknown) {
//             logError(error, {}, `エラー率計算中にエラーが発生しました`);
//             return {
//                 overall: 0,
//                 byType: {}
//             };
//         }
//     }

//     /**
//      * エラーの傾向を分析する
//      */
//     private analyzeErrorTrend(errors: ErrorRecord[]): string {
//         if (errors.length < 10) return 'INSUFFICIENT_DATA';

//         // 日付でソート
//         errors.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

//         // 直近1/3と最初の1/3を比較
//         const firstThird = errors.slice(0, Math.floor(errors.length / 3));
//         const lastThird = errors.slice(-Math.floor(errors.length / 3));

//         const firstCount = firstThird.reduce((sum, e) => sum + e.count, 0);
//         const lastCount = lastThird.reduce((sum, e) => sum + e.count, 0);

//         // 変化率
//         const changeRatio = firstCount > 0 ? (lastCount - firstCount) / firstCount : 0;

//         if (changeRatio > 0.2) return 'INCREASING';
//         if (changeRatio < -0.2) return 'DECREASING';
//         return 'STABLE';
//     }

//     /**
//      * エラーの改善提案を生成する
//      */
//     private generateErrorRecommendations(overall: number, byType: Record<string, { count: number, rate: number }>): string[] {
//         const recommendations: string[] = [];

//         // 全体エラー率に基づく提案
//         if (overall > 0.05) {
//             recommendations.push("全体のエラー率が高いため、システム全体の安定性向上が必要です。");
//         }

//         // タイプ別エラーに基づく提案
//         const sortedTypes = Object.entries(byType)
//             .sort((a, b) => b[1].count - a[1].count)
//             .slice(0, 3);

//         for (const [type, { count, rate }] of sortedTypes) {
//             if (rate > 0.01) {
//                 recommendations.push(`「${type}」エラーが多発しています。このタイプのエラー処理を強化してください。`);
//             }
//         }

//         // 特に問題がない場合
//         if (recommendations.length === 0) {
//             recommendations.push("エラー率は許容範囲内です。現在のエラー処理を維持してください。");
//         }

//         return recommendations;
//     }

//     /**
//      * 生成イベントを記録する
//      * 
//      * 生成処理の実行時間とトークン数を記録し、後の分析に使用します。
//      * 
//      * @param {number} totalTime - 生成にかかった合計時間（ミリ秒）
//      * @param {number} tokenCount - 生成されたトークン数
//      * @param {Date} [timestamp=new Date()] - タイムスタンプ（デフォルトは現在時刻）
//      * 
//      * @usage
//      * // 生成イベントの記録
//      * performanceAnalyzer.recordGeneration(1200, 150); // 1.2秒で150トークン生成
//      * 
//      * @call-flow
//      * 1. 新しい生成メトリクスレコードを作成
//      * 2. メトリクス配列に追加
//      * 3. 配列サイズが上限（100件）を超えた場合、古いレコードを削除
//      * 
//      * @state-changes
//      * metrics.speed 配列に新しいレコードが追加されます
//      */

//     recordGeneration(totalTime: number, tokenCount: number, timestamp = new Date()): void {
//         this.metrics.speed.push({
//             totalTime,
//             tokenCount,
//             timestamp
//         });

//         // 最大100件まで保持
//         if (this.metrics.speed.length > 100) {
//             this.metrics.speed.shift();
//         }
//     }

//     /**
//     API呼び出しを記録する

//     APIエンドポイントの呼び出し結果（遅延、成功/失敗）を記録し、後の分析に使用します。

//     @param endpoint — 呼び出したAPIエンドポイント

//     @param latency — 呼び出しにかかった時間（ミリ秒）

//     @param success — 呼び出しが成功したかどうか

//     @param timestamp — タイムスタンプ（デフォルトは現在時刻）

//     @usage
//     // API呼び出しの記録 performanceAnalyzer.recordApiCall('/api/generate', 350, true); // 成功 performanceAnalyzer.recordApiCall('/api/analyze', 500, false); // 失敗

//     @call-flow

//     エンドポイント用の配列が存在しない場合は初期化
//     新しい遅延サンプルを作成
//     エンドポイント別のサンプル配列に追加
//     配列サイズが上限（100件）を超えた場合、古いサンプルを削除
//     呼び出しが失敗した場合、エラーとしても記録
//     @state-changes
//     metrics.latency[endpoint] 配列に新しいサンプルが追加されます 失敗した場合は metrics.errors にもエラーが追加されます

//     @helper-methods — - recordError - エラーの記録（呼び出し失敗時）
//      */
//     recordApiCall(endpoint: string, latency: number, success: boolean, timestamp = new Date()): void {
//         if (!this.metrics.latency[endpoint]) {
//             this.metrics.latency[endpoint] = [];
//         }

//         this.metrics.latency[endpoint].push({
//             latency,
//             success,
//             timestamp
//         });

//         // エンドポイントごとに最大100件まで保持
//         if (this.metrics.latency[endpoint].length > 100) {
//             this.metrics.latency[endpoint].shift();
//         }

//         // エラーの場合はエラー記録にも追加
//         if (!success) {
//             this.recordError('API_ERROR', `API Error: ${endpoint}`, 'MEDIUM');
//         }
//     }

//     /**
//      * キャッシュイベントを記録する
//      * 
//      * キャッシュの使用状況（ヒット数、ミス数、削除数）を記録し、後の分析に使用します。
//      * 
//      * @param {number} hits - キャッシュヒット数
//      * @param {number} misses - キャッシュミス数
//      * @param {number} evictions - キャッシュ削除数
//      * @param {Date} [timestamp=new Date()] - タイムスタンプ（デフォルトは現在時刻）
//      * 
//      * @usage
//      * // キャッシュイベントの記録
//      * performanceAnalyzer.recordCacheEvent(45, 5, 2); // 45ヒット、5ミス、2削除
//      * 
//      * @call-flow
//      * 1. 新しいキャッシュサンプルを作成
//      * 2. サンプル配列に追加
//      * 3. 配列サイズが上限（100件）を超えた場合、古いサンプルを削除
//      * 
//      * @state-changes
//      * metrics.cache 配列に新しいサンプルが追加されます
//      */
//     recordCacheEvent(hits: number, misses: number, evictions: number, timestamp = new Date()): void {
//         this.metrics.cache.push({
//             hits,
//             misses,
//             evictions,
//             timestamp
//         });

//         // 最大100件まで保持
//         if (this.metrics.cache.length > 100) {
//             this.metrics.cache.shift();
//         }
//     }

//     /**
//      * エラーを記録する
//      * 
//      * システム内で発生したエラーを記録し、後の分析に使用します。
//      * 
//      * @param {string} type - エラータイプ
//      * @param {string} message - エラーメッセージ
//      * @param {'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'} severity - エラーの重大度
//      * @param {number} [count=1] - エラーの発生回数
//      * @param {Date} [timestamp=new Date()] - タイムスタンプ（デフォルトは現在時刻）
//      * 
//      * @usage
//      * // エラーの記録
//      * performanceAnalyzer.recordError('DATABASE_ERROR', '接続失敗', 'HIGH');
//      * 
//      * @call-flow
//      * 1. 新しいエラーレコードを作成
//      * 2. エラー配列に追加
//      * 3. 配列サイズが上限（200件）を超えた場合、古いレコードを削除
//      * 4. 重大度が高い（HIGH/CRITICAL）場合はログにも記録
//      * 
//      * @state-changes
//      * metrics.errors 配列に新しいレコードが追加されます
//      * 
//      * @monitoring
//      * - 重大度が HIGH または CRITICAL の場合、ERROR レベルでログに記録
//      */
//     recordError(type: string, message: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', count = 1, timestamp = new Date()): void {
//         this.metrics.errors.push({
//             type,
//             message,
//             severity,
//             count,
//             timestamp
//         });

//         // 最大200件まで保持
//         if (this.metrics.errors.length > 200) {
//             this.metrics.errors.shift();
//         }

//         // 重大なエラーの場合はログに記録
//         if (severity === 'HIGH' || severity === 'CRITICAL') {
//             // error変数が定義されていないので、新しいErrorオブジェクトを作成
//             logger.error(`[${severity}] ${type}: ${message}`);
//         }
//     }

//     /**
//      * メモリ使用量のサンプリングを開始する
//      * 
//      * 定期的（30秒ごと）にシステムのメモリ使用量をサンプリングし、
//      * 内部データ構造に記録します。
//      * 
//      * @private
//      * 
//      * @call-flow
//      * 1. 初回のメモリ使用量サンプリングを実行
//      * 2. 30秒ごとのインターバルタイマーを設定
//      * 3. メモリリーク防止のためのクリーンアップ関数をグローバルスコープに登録
//      * 
//      * @error-handling
//      * 初期化時およびサンプリング実行時のエラーをキャッチし、ログに記録
//      * 
//      * @state-changes
//      * metrics.memory 配列に定期的に新しいサンプルが追加されます
//      * globalThis.__performanceAnalyzerCleanup にクリーンアップ関数が登録されます
//      * 
//      * @helper-methods
//      * - recordMemorySample - メモリサンプルの記録
//      */
//     private startMemorySampling(): void {
//         // 実際の実装では定期的にメモリ使用量を測定
//         // ブラウザ環境では異なる測定方法が必要

//         // この実装はNode.js環境を想定
//         try {
//             // 初回サンプリング
//             if (typeof process !== 'undefined' && process.memoryUsage) {
//                 const memory = process.memoryUsage();
//                 this.recordMemorySample(memory.rss / 1024 / 1024, memory.heapTotal / 1024 / 1024, memory.external / 1024 / 1024);
//             } else {
//                 // ブラウザ環境などの場合はダミーデータ
//                 this.recordMemorySample(100, 200, 10);
//             }

//             // 定期サンプリング（30秒ごと）
//             const interval = setInterval(() => {
//                 try {
//                     if (typeof process !== 'undefined' && process.memoryUsage) {
//                         const memory = process.memoryUsage();
//                         this.recordMemorySample(memory.rss / 1024 / 1024, memory.heapTotal / 1024 / 1024, memory.external / 1024 / 1024);
//                     } else {
//                         // ブラウザ環境などの場合はダミーデータ
//                         const variation = Math.random() * 10 - 5; // -5から+5の変動
//                         this.recordMemorySample(100 + variation, 200, 10);
//                     }
//                 } catch (error: unknown) {
//                     logError(error, {}, `メモリサンプリング中にエラーが発生しました`);
//                 }
//             }, 30000);

//             // メモリリークを防ぐためのクリーンアップ
//             if (typeof globalThis !== 'undefined') {
//                 // @ts-ignore
//                 globalThis.__performanceAnalyzerCleanup = () => {
//                     clearInterval(interval);
//                 };
//             }
//         } catch (error: unknown) {
//             logError(error, {}, `メモリサンプリング初期化中にエラーが発生しました`);
//         }
//     }

//     /**
//      * メモリサンプルを記録する
//      * 
//      * システムのメモリ使用状況を内部データ構造に記録します。
//      * サンプル数が上限を超えた場合は古いサンプルを削除します。
//      * 
//      * @private
//      * @param {number} used - 使用中のメモリ量（MB単位）
//      * @param {number} total - 合計メモリ量（MB単位）
//      * @param {number} [external] - 外部メモリ量（MB単位、オプション）
//      * 
//      * @call-flow
//      * 1. 新しいメモリサンプルを作成
//      * 2. サンプル配列に追加
//      * 3. 配列サイズが上限（1000件）を超えた場合、古いサンプルを削除
//      * 
//      * @state-changes
//      * metrics.memory 配列に新しいサンプルが追加されます
//      */
//     private recordMemorySample(used: number, total: number, external?: number): void {
//         this.metrics.memory.push({
//             used, // MB単位
//             total, // MB単位
//             external, // MB単位（オプション）
//             timestamp: new Date()
//         });

//         // 最大1000件まで保持（約8時間分）
//         if (this.metrics.memory.length > 1000) {
//             this.metrics.memory.shift();
//         }
//     }

//     /**
//      * パーセンタイルを計算する
//      * 
//      * 数値配列から指定されたパーセンタイル値を計算します。
//      * 例えば、95パーセンタイルは、値の95%がその値以下となる閾値です。
//      * 
//      * @private
//      * @param {number[]} values - パーセンタイルを計算する数値の配列
//      * @param {number} percentile - 計算するパーセンタイル（0-100）
//      * @returns {number} 計算されたパーセンタイル値
//      * 
//      * @call-flow
//      * 1. 配列が空の場合は0を返す
//      * 2. 数値配列をソート
//      * 3. パーセンタイルに対応するインデックスを計算
//      * 4. 該当インデックスの値を返却
//      * 
//      * @error-handling
//      * 配列が空の場合は0を返します
//      */
//     private calculatePercentile(values: number[], percentile: number): number {
//         if (values.length === 0) return 0;

//         // 値をソート
//         const sorted = [...values].sort((a, b) => a - b);

//         // パーセンタイルの位置を計算
//         const index = Math.ceil((percentile / 100) * sorted.length) - 1;

//         return sorted[index];
//     }

//     /**
//      * 配列をキーでグループ化する
//      * 
//      * 配列内のオブジェクトを指定されたキーでグループ化し、
//      * キーごとのオブジェクト配列を持つオブジェクトを返します。
//      * 
//      * @private
//      * @template T
//      * @param {T[]} array - グループ化する配列
//      * @param {keyof T} key - グループ化に使用するオブジェクトのキー
//      * @returns {Record<string, T[]>} グループ化された結果
//      * 
//      * @call-flow
//      * 1. 空のグループオブジェクトを作成
//      * 2. 配列の各要素に対して処理
//      * 3. 要素のキー値を文字列に変換
//      * 4. キーに対応するグループがない場合は初期化
//      * 5. 要素を適切なグループに追加
//      * 
//      * @usage
//      * // 内部で使用される例：エラーをタイプでグループ化
//      * const typeGroups = this.groupBy(errors, 'type');
//      */
//     private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
//         return array.reduce((groups, item) => {
//             const value = String(item[key]);
//             if (!groups[value]) {
//                 groups[value] = [];
//             }
//             groups[value].push(item);
//             return groups;
//         }, {} as Record<string, T[]>);
//     }

//     /**
//      * デフォルトの速度メトリクスを取得する
//      * 
//      * 速度メトリクスの初期値または計算不能時のデフォルト値を提供します。
//      * 
//      * @private
//      * @returns {SpeedMetrics} デフォルトの速度メトリクス
//      * 
//      * @call-flow
//      * 1. デフォルト値を設定した速度メトリクスオブジェクトを作成
//      * 2. 作成したオブジェクトを返却
//      * 
//      * @usage
//      * // 内部で使用される例：データが不足している場合や
//      * // エラー発生時のフォールバック値
//      * return this.getDefaultSpeedMetrics();
//      */
//     private getDefaultSpeedMetrics(): SpeedMetrics {
//         return {
//             averageTime: 0,
//             tokenPerSecond: 0,
//             efficiency: 0
//         };
//     }

//     /**
//      * デフォルトのメモリメトリクスを取得する
//      * 
//      * メモリ使用量メトリクスの初期値または計算不能時のデフォルト値を提供します。
//      * 
//      * @private
//      * @returns {PerformanceMetrics['memoryUsage']} デフォルトのメモリ使用量メトリクス
//      * 
//      * @call-flow
//      * 1. デフォルト値を設定したメモリ使用量メトリクスオブジェクトを作成
//      * 2. 作成したオブジェクトを返却
//      * 
//      * @usage
//      * // 内部で使用される例：データが不足している場合や
//      * // エラー発生時のフォールバック値
//      * return this.getDefaultMemoryMetrics();
//      */
//     private getDefaultMemoryMetrics(): PerformanceMetrics['memoryUsage'] {
//         return {
//             average: 0,
//             peak: 0,
//             trend: 'STABLE'
//         };
//     }

//     /**
//      * デフォルトの遅延メトリクスを取得する
//      * 
//      * API遅延メトリクスの初期値または計算不能時のデフォルト値を提供します。
//      * 
//      * @private
//      * @returns {LatencyMetrics} デフォルトの遅延メトリクス
//      * 
//      * @call-flow
//      * 1. デフォルト値を設定した遅延メトリクスオブジェクトを作成
//      * 2. 作成したオブジェクトを返却
//      * 
//      * @usage
//      * // 内部で使用される例：データが不足している場合や
//      * // エラー発生時のフォールバック値
//      * return this.getDefaultLatencyMetrics();
//      */
//     private getDefaultLatencyMetrics(): LatencyMetrics {
//         return {
//             average: 0,
//             p95: 0,
//             breakdown: {}
//         };
//     }

//     /**
//      * デフォルトのキャッシュメトリクスを取得する
//      * 
//      * キャッシュ効率メトリクスの初期値または計算不能時のデフォルト値を提供します。
//      * 
//      * @private
//      * @returns {CacheMetrics} デフォルトのキャッシュメトリクス
//      * 
//      * @call-flow
//      * 1. デフォルト値を設定したキャッシュメトリクスオブジェクトを作成
//      * 2. 作成したオブジェクトを返却
//      * 
//      * @usage
//      * // 内部で使用される例：データが不足している場合や
//      * // エラー発生時のフォールバック値
//      * return this.getDefaultCacheMetrics();
//      */
//     private getDefaultCacheMetrics(): CacheMetrics {
//         return {
//             hitRate: 0,
//             missRate: 0,
//             evictionRate: 0
//         };
//     }
// }

// /**
//  * @interface SpeedMetricsRecord
//  * @description
//  * 生成速度の測定結果を記録するためのデータ構造
//  * 
//  * @property {number} totalTime - 生成にかかった合計時間（ミリ秒）
//  * @property {number} tokenCount - 生成されたトークン数
//  * @property {Date} timestamp - 記録された時刻
//  * 
//  * @usage
//  * // 内部で使用される例
//  * const record: SpeedMetricsRecord = {
//  *   totalTime: 1200,    // 1.2秒
//  *   tokenCount: 150,    // 150トークン
//  *   timestamp: new Date()
//  * };
//  */
// interface SpeedMetricsRecord {
//     totalTime: number;
//     tokenCount: number;
//     timestamp: Date;
// }

// /**
//  * @interface LatencySample
//  * @description
//  * API呼び出しの遅延サンプルを記録するためのデータ構造
//  * 
//  * @property {number} latency - 遅延時間（ミリ秒）
//  * @property {boolean} success - API呼び出しが成功したかどうか
//  * @property {Date} timestamp - 記録された時刻
//  * 
//  * @usage
//  * // 内部で使用される例
//  * const sample: LatencySample = {
//  *   latency: 350,     // 350ミリ秒
//  *   success: true,    // 成功
//  *   timestamp: new Date()
//  * };
//  */
// interface LatencySample {
//     latency: number;
//     success: boolean;
//     timestamp: Date;
// }

// /**
//  * @interface MemorySample
//  * @description
//  * メモリ使用量のサンプルを記録するためのデータ構造
//  * 
//  * @property {number} used - 使用中のメモリ量（MB単位）
//  * @property {number} total - 合計メモリ量（MB単位）
//  * @property {number} [external] - 外部メモリ量（MB単位、オプション）
//  * @property {Date} timestamp - 記録された時刻
//  * 
//  * @usage
//  * // 内部で使用される例
//  * const sample: MemorySample = {
//  *   used: 256,        // 256MB
//  *   total: 512,       // 512MB
//  *   external: 10,     // 10MB
//  *   timestamp: new Date()
//  * };
//  */
// interface MemorySample {
//     used: number;
//     total: number;
//     external?: number;
//     timestamp: Date;
// }

// /**
//  * @interface CacheSample
//  * @description
//  * キャッシュ使用状況のサンプルを記録するためのデータ構造
//  * 
//  * @property {number} hits - キャッシュヒット数
//  * @property {number} misses - キャッシュミス数
//  * @property {number} evictions - キャッシュからの削除数
//  * @property {Date} timestamp - 記録された時刻
//  * 
//  * @usage
//  * // 内部で使用される例
//  * const sample: CacheSample = {
//  *   hits: 45,         // 45ヒット
//  *   misses: 5,        // 5ミス
//  *   evictions: 2,     // 2削除
//  *   timestamp: new Date()
//  * };
//  */
// interface CacheSample {
//     hits: number;
//     misses: number;
//     evictions: number;
//     timestamp: Date;
// }

// /**
//  * @interface ErrorRecord
//  * @description
//  * システム内で発生したエラーを記録するためのデータ構造
//  * 
//  * @property {string} type - エラータイプ（例: DATABASE_ERROR, API_ERROR）
//  * @property {string} message - エラーメッセージ
//  * @property {'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'} severity - エラーの重大度
//  * @property {number} count - エラーの発生回数
//  * @property {Date} timestamp - 記録された時刻
//  * 
//  * @usage
//  * // 内部で使用される例
//  * const record: ErrorRecord = {
//  *   type: 'DATABASE_ERROR',
//  *   message: '接続失敗',
//  *   severity: 'HIGH',
//  *   count: 1,
//  *   timestamp: new Date()
//  * };
//  */
// interface ErrorRecord {
//     type: string;
//     message: string;
//     severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
//     count: number;
//     timestamp: Date;
// }

// /**
//  * パフォーマンス分析クラス
//  * 
//  * システムのパフォーマンス（生成速度、メモリ使用量、API遅延など）を測定・分析するためのクラス。
//  * パフォーマンスメトリクスの収集、分析、レポート生成機能を提供します。
//  * 
//  * @export
//  * @class PerformanceAnalyzer
//  * 
//  * @usage
//  * // 一般的な使用方法
//  * import { PerformanceAnalyzer } from '@/lib/analysis/performance-analyzer';
//  * 
//  * // インスタンス化
//  * const analyzer = new PerformanceAnalyzer();
//  * 
//  * // パフォーマンスイベントの記録
//  * analyzer.recordGeneration(1200, 150);  // 生成イベント記録
//  * analyzer.recordApiCall('/api/data', 300, true);  // API呼び出し記録
//  * 
//  * // パフォーマンス分析の実行
//  * const metrics = await analyzer.analyzeSystemPerformance();
//  * console.log(metrics);  // 分析結果の表示
//  * 
//  * @example
//  * // アプリケーション内での使用例
//  * import { PerformanceAnalyzer } from '@/lib/analysis/performance-analyzer';
//  * 
//  * class Application {
//  *   private performanceAnalyzer: PerformanceAnalyzer;
//  *   
//  *   constructor() {
//  *     this.performanceAnalyzer = new PerformanceAnalyzer();
//  *   }
//  *   
//  *   async generateContent(prompt: string): Promise<string> {
//  *     const startTime = Date.now();
//  *     // 内容生成処理...
//  *     const content = "生成されたコンテンツ";
//  *     const tokenCount = content.length / 4; // トークン数の見積もり
//  *     
//  *     // パフォーマンス記録
//  *     this.performanceAnalyzer.recordGeneration(
//  *       Date.now() - startTime,
//  *       tokenCount
//  *     );
//  *     
//  *     return content;
//  *   }
//  *   
//  *   async getPerformanceReport(): Promise<PerformanceMetrics> {
//  *     return this.performanceAnalyzer.analyzeSystemPerformance();
//  *   }
//  * }
//  */