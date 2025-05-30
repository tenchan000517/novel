// src\app\api\analysis\metrics\route.ts
/**
 * @fileoverview パフォーマンスメトリクスAPI
 * 
 * @description
 * システムのパフォーマンスメトリクスを収集・提供するREST APIエンドポイント。
 * Next.jsのAPIルートとして実装され、GET/POSTメソッドをサポートしています。
 * 
 * - GET: システムパフォーマンスのメトリクスを取得
 * - POST: システムイベントやパフォーマンスデータを記録
 * 
 * @requires next/server
 * @requires @/lib/analysis/performance-analyzer
 * @requires @/lib/utils/logger
 * 
 * @dependency PerformanceAnalyzer - システムメトリクスの収集・分析を行うシングルトンとして使用
 * @dependency logger - エラーやイベントのロギングに使用
 * 
 * @usage
 * GET /api/metrics?types=generationSpeed,apiLatency&start=2025-01-01&end=2025-01-02
 * POST /api/metrics { type: "generation", totalTime: 125, tokenCount: 450 }
 */

import { NextResponse } from 'next/server';
import { PerformanceAnalyzer } from '@/lib/analysis/performance-analyzer';
import { logger } from '@/lib/utils/logger';

/**
 * パフォーマンスメトリクスAPI
 * GET: システムパフォーマンスのメトリクスを取得
 */

// シングルトンのパフォーマンスアナライザインスタンス
let performanceAnalyzer: PerformanceAnalyzer;

/**
 * @function GET
 * @description システムパフォーマンスのメトリクスを取得するエンドポイント
 * 
 * @param {Request} request - 受信したHTTPリクエスト
 * @returns {Promise<NextResponse>} JSON形式のレスポンス
 * 
 * @queryParams
 * - start {string} - 開始日時 (ISO 8601形式) - オプション
 * - end {string} - 終了日時 (ISO 8601形式) - オプション
 * - types {string} - カンマ区切りのメトリクスタイプ（オプション）
 *   利用可能タイプ: generationSpeed, apiLatency, memoryUsage, cacheEfficiency, errorRate
 * 
 * @responseStructure
 * {
 *   success: boolean,
 *   data: {
 *     // コード内でフィルタリングされるメトリクスタイプに基づく
 *     generationSpeed?: any, // 正確な構造はPerformanceAnalyzerの実装に依存
 *     apiLatency?: any,
 *     memoryUsage?: any,
 *     cacheEfficiency?: any,
 *     errorRate?: any
 *   },
 *   timestamp: string
 * }
 * 
 * @error
 * - 500: METRICS_ERROR - PerformanceAnalyzerからのデータ取得に失敗
 * 
 * @dependencies
 * - PerformanceAnalyzer.analyzeSystemPerformance()
 * - logger.info(), logger.error()
 */
export async function GET(request: Request) {
  try {
    // 初回アクセス時にパフォーマンスアナライザを初期化
    if (!performanceAnalyzer) {
      performanceAnalyzer = new PerformanceAnalyzer();
      logger.info('Initialized performance analyzer');
    }

    const { searchParams } = new URL(request.url);

    // 時間範囲の解析
    const startTime = searchParams.get('start')
      ? new Date(searchParams.get('start') as string)
      : null;

    const endTime = searchParams.get('end')
      ? new Date(searchParams.get('end') as string)
      : null;

    // メトリクスタイプのフィルタリング
    const types = searchParams.get('types')?.split(',');

    // システムメトリクスの取得
    const metrics = await performanceAnalyzer.analyzeSystemPerformance();

    // 必要なメトリクスのみをフィルタリング
    const filteredMetrics: any = {};

    if (!types || types.includes('generationSpeed')) {
      filteredMetrics.generationSpeed = metrics.generationSpeed;
    }

    if (!types || types.includes('apiLatency')) {
      filteredMetrics.apiLatency = metrics.apiLatency;
    }

    if (!types || types.includes('memoryUsage')) {
      filteredMetrics.memoryUsage = metrics.memoryUsage;
    }

    if (!types || types.includes('cacheEfficiency')) {
      filteredMetrics.cacheEfficiency = metrics.cacheEfficiency;
    }

    if (!types || types.includes('errorRate')) {
      filteredMetrics.errorRate = metrics.errorRate;
    }

    // 時間フィルタリング
    if (startTime && endTime) {
      // 各メトリクスの履歴をフィルタリング
      if (filteredMetrics.memoryUsage?.history) {
        filteredMetrics.memoryUsage.history = filteredMetrics.memoryUsage.history.filter(
          (entry: any) => {
            const timestamp = new Date(entry.timestamp);
            return timestamp >= startTime && timestamp <= endTime;
          }
        );
      }

      if (filteredMetrics.cacheEfficiency?.history) {
        filteredMetrics.cacheEfficiency.history = filteredMetrics.cacheEfficiency.history.filter(
          (entry: any) => {
            const timestamp = new Date(entry.timestamp);
            return timestamp >= startTime && timestamp <= endTime;
          }
        );
      }
    }

    logger.info('Retrieved performance metrics', {
      types: types?.join(', ') || 'all',
      timeRange: startTime && endTime ? `${startTime.toISOString()} to ${endTime.toISOString()}` : 'all'
    });

    return NextResponse.json({
      success: true,
      data: filteredMetrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to retrieve performance metrics', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'METRICS_ERROR',
          message: 'Failed to retrieve performance metrics'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * @function POST
 * @description システムイベントやメトリクスを記録するエンドポイント
 * 
 * @param {Request} request - 受信したHTTPリクエスト
 * @returns {Promise<NextResponse>} JSON形式のレスポンス
 * 
 * @requestBody
 * コードで処理される4種類のタイプ：
 * - 'generation'タイプ: { type: 'generation', totalTime: number, tokenCount: number }
 * - 'api'タイプ: { type: 'api', endpoint: string, latency: number, success: boolean }
 * - 'cache'タイプ: { type: 'cache', hits: number, misses: number, evictions: number }
 * - 'error'タイプ: { type: 'error', errorType: string, message: string, severity?: string, count?: number }
 * 
 * @responseStructure
 * 成功時:
 * {
 *   success: true,
 *   message: 'Performance metrics recorded successfully'
 * }
 * 
 * エラー時:
 * {
 *   success: false,
 *   error: {
 *     code: 'RECORD_ERROR',
 *     message: 'Failed to record performance metrics'
 *   }
 * }
 * 
 * @error
 * - 500: RECORD_ERROR - メトリクスの記録に失敗
 * 
 * @dependencies
 * - PerformanceAnalyzer.recordGeneration(), recordApiCall(), recordCacheEvent(), recordError()
 * - logger.debug(), logger.error(), logger.info()
 * 
 * @example
 * // テキスト生成メトリクスの記録例
 * await fetch('/api/metrics', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     type: 'generation',
 *     totalTime: 350, // ミリ秒単位と推測
 *     tokenCount: 750
 *   })
 * });
 */
export async function POST(request: Request) {
  try {
    // 初回アクセス時にパフォーマンスアナライザを初期化
    if (!performanceAnalyzer) {
      performanceAnalyzer = new PerformanceAnalyzer();
      logger.info('Initialized performance analyzer');
    }

    const data = await request.json();

    // データタイプに基づいて適切な記録を行う
    if (data.type === 'generation') {
      performanceAnalyzer.recordGeneration(
        data.totalTime,
        data.tokenCount
      );
      logger.debug('Recorded generation metrics', {
        totalTime: data.totalTime,
        tokenCount: data.tokenCount
      });
    }
    else if (data.type === 'api') {
      performanceAnalyzer.recordApiCall(
        data.endpoint,
        data.latency,
        data.success
      );
      logger.debug('Recorded API call metrics', {
        endpoint: data.endpoint,
        latency: data.latency,
        success: data.success
      });
    }
    else if (data.type === 'cache') {
      performanceAnalyzer.recordCacheEvent(
        data.hits,
        data.misses,
        data.evictions
      );
      logger.debug('Recorded cache metrics', {
        hits: data.hits,
        misses: data.misses,
        evictions: data.evictions
      });
    }
    else if (data.type === 'error') {
      performanceAnalyzer.recordError(
        data.errorType,
        data.message,
        data.severity || 'MEDIUM',
        data.count || 1
      );
      logger.debug('Recorded error metrics', {
        errorType: data.errorType,
        message: data.message,
        severity: data.severity,
        count: data.count
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Performance metrics recorded successfully'
    });
  } catch (error) {
    logger.error('Failed to record performance metrics', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RECORD_ERROR',
          message: 'Failed to record performance metrics'
        }
      },
      { status: 500 }
    );
  }
}