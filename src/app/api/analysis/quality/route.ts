// src\app\api\analysis\quality\route.ts
/**
 * @fileoverview 品質分析API - チャプターの品質分析結果を提供するエンドポイント
 * @description 
 * このファイルは小説や文章コンテンツのチャプター品質を分析するAPI endpointを実装しています。
 * GET リクエストでチャプターの品質分析結果を取得します。分析対象のチャプターは、
 * 特定のIDによる指定、章番号の範囲指定、または最新のN章を対象とすることができます。
 * 
 * @requires {NextResponse} next/server
 * @requires {QualityAnalyzer} @/lib/analysis/quality-analyzer
 * @requires {logger} @/lib/utils/logger
 * @requires {storageProvider} @/lib/storage
 * @requires {parseYaml} @/lib/utils/yaml-helper
 * 
 * @typedef {Object} Chapter - チャプター情報
 * @typedef {Object} QualityAnalysis - 品質分析結果
 */

import { NextResponse } from 'next/server';
import { QualityAnalyzer } from '@/lib/analysis/quality-analyzer';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { parseYaml } from '@/lib/utils/yaml-helper';

/**
 * 品質分析API
 * GET: チャプターの品質分析を取得
 */

// シングルトンの品質分析インスタンス
const qualityAnalyzer = new QualityAnalyzer();

/**
 * チャプターの品質分析を取得するAPI関数
 * 
 * @async
 * @function GET
 * @param {Request} request - HTTPリクエストオブジェクト
 * @returns {Promise<NextResponse>} 分析結果のJSONレスポンス
 * 
 * @example
 * // チャプターID指定での呼び出し
 * GET /api/analysis/quality?chapterIds=1,2,3
 * 
 * // 章番号範囲指定での呼び出し
 * GET /api/analysis/quality?from=1&to=5
 * 
 * // パラメータなしで最新5章を分析
 * GET /api/analysis/quality
 * 
 * @example
 * // 正常レスポンス
 * {
 *   success: true,
 *   data: {
 *     overallScore: 0.75,
 *     detailedMetrics: {
 *       readability: 0.8,
 *       coherence: 0.7,
 *       engagement: 0.75,
 *       characterConsistency: 0.73
 *     },
 *     trends: [...],
 *     recommendations: [...],
 *     chapterCount: 5,
 *     chapterRange: { from: 1, to: 5 }
 *   }
 * }
 * 
 * @example
 * // エラーレスポンス
 * {
 *   success: false,
 *   error: {
 *     code: 'NO_CHAPTERS',
 *     message: 'No chapters found for analysis'
 *   }
 * }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 分析対象の範囲指定
    const chapterIds = searchParams.get('chapterIds')?.split(',');
    const fromChapter = parseInt(searchParams.get('from') || '0', 10);
    const toChapter = parseInt(searchParams.get('to') || '0', 10);
    
    let chapters: any[] = [];
    
    // 特定のチャプターIDが指定された場合
    if (chapterIds && chapterIds.length > 0) {
      chapters = await Promise.all(
        chapterIds.map(id => loadChapterById(id))
      );
      chapters = chapters.filter(Boolean); // nullや未定義を除外
    }
    // 範囲指定の場合
    else if (fromChapter > 0 && toChapter >= fromChapter) {
      for (let i = fromChapter; i <= toChapter; i++) {
        const chapter = await loadChapterByNumber(i);
        if (chapter) {
          chapters.push(chapter);
        }
      }
    }
    // デフォルト: 最新5チャプターを分析
    else {
      const latestChapters = await loadLatestChapters(5);
      chapters = latestChapters;
    }
    
    if (chapters.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NO_CHAPTERS',
            message: 'No chapters found for analysis'
          }
        },
        { status: 404 }
      );
    }
    
    // 各チャプターを分析
    const analyses = await Promise.all(
      chapters.map(chapter => qualityAnalyzer.analyzeChapter(chapter))
    );
    
    // 総合スコアの計算
    const overallScore = analyses.reduce((sum, analysis) => sum + analysis.overallScore, 0) / analyses.length;
    
    // 詳細メトリクスの平均計算
    const detailedMetrics = {
      readability: analyses.reduce((sum, a) => sum + a.readability.score, 0) / analyses.length,
      coherence: analyses.reduce((sum, a) => sum + a.consistency.score, 0) / analyses.length,
      engagement: analyses.reduce((sum, a) => sum + a.engagement.score, 0) / analyses.length,
      characterConsistency: analyses.reduce((sum, a) => sum + a.consistency.details.characterScore, 0) / analyses.length,
    };
    
    // 品質傾向の分析
    const trends = analyzeTrends(chapters, analyses);
    
    // 推奨事項
    const recommendations = generateRecommendations(analyses);
    
    logger.info(`Analyzed quality for ${chapters.length} chapters, overall score: ${overallScore.toFixed(2)}`);
    
    return NextResponse.json({
      success: true,
      data: {
        overallScore,
        detailedMetrics,
        trends,
        recommendations,
        chapterCount: chapters.length,
        chapterRange: {
          from: chapters[0].metadata.number,
          to: chapters[chapters.length - 1].metadata.number
        }
      }
    });
  } catch (error) {
    logger.error('Failed to analyze quality', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'ANALYSIS_ERROR',
          message: 'Failed to analyze quality'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * IDに基づいてチャプターを読み込む
 * 
 * @async
 * @function loadChapterById
 * @param {string} id - チャプターID
 * @returns {Promise<any|null>} チャプターオブジェクトまたはnull
 * @private
 */
async function loadChapterById(id: string) {
  try {
    const filePath = `chapters/chapter-${id}.yaml`;
    const content = await storageProvider.readFile(filePath);
    return parseYaml(content);
  } catch (error) {
    logger.warn(`Failed to load chapter with ID ${id}`, {
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

/**
 * 章番号に基づいてチャプターを読み込む
 * 
 * @async
 * @function loadChapterByNumber
 * @param {number} number - チャプターの番号
 * @returns {Promise<any|null>} チャプターオブジェクトまたはnull
 * @private
 */
async function loadChapterByNumber(number: number) {
  try {
    const filePath = `chapters/chapter-${number}.yaml`;
    const content = await storageProvider.readFile(filePath);
    return parseYaml(content);
  } catch (error) {
    logger.warn(`Failed to load chapter ${number}`, {
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

/**
 * 最新のチャプターを読み込む
 * 
 * @async
 * @function loadLatestChapters
 * @param {number} count - 読み込むチャプターの数
 * @returns {Promise<any[]>} チャプターオブジェクトの配列
 * @private
 */
async function loadLatestChapters(count: number) {
  try {
    const chaptersDir = 'chapters/';
    const files = await storageProvider.listFiles(chaptersDir);
    
    // チャプターファイルをフィルタリング
    const chapterFiles = files
      .filter(file => file.includes('chapter-') && file.endsWith('.yaml'))
      .sort((a, b) => {
        // ファイル名から章番号を抽出
        const numA = parseInt(a.match(/chapter-(\d+)\.yaml/)?.[1] || '0', 10);
        const numB = parseInt(b.match(/chapter-(\d+)\.yaml/)?.[1] || '0', 10);
        return numB - numA; // 降順ソート
      })
      .slice(0, count);
    
    // チャプターの読み込み
    const chapters = await Promise.all(
      chapterFiles.map(async file => {
        try {
          const content = await storageProvider.readFile(file);
          return parseYaml(content);
        } catch (error) {
          logger.warn(`Failed to load chapter file ${file}`, {
            error: error instanceof Error ? error.message : String(error)
          });
          return null;
        }
      })
    );
    
    return chapters.filter(Boolean); // nullや未定義を除外
  } catch (error) {
    logger.error('Failed to load latest chapters', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return [];
  }
}

/**
 * 品質傾向を分析
 * 
 * @function analyzeTrends
 * @param {any[]} chapters - チャプターのリスト
 * @param {any[]} analyses - 分析結果のリスト
 * @returns {any[]} 傾向分析結果
 * @private
 */
function analyzeTrends(chapters: any[], analyses: any[]) {
  // 簡易実装: 各メトリクスの傾向を計算
  const trends = [];
  
  // チャプターを章番号で並べ替え
  const sortedData = chapters.map((chapter, i) => ({
    chapterNumber: chapter.metadata.number,
    analysis: analyses[i]
  })).sort((a, b) => a.chapterNumber - b.chapterNumber);
  
  // 一貫性の傾向
  const consistencyValues = sortedData.map(d => d.analysis.consistency.score);
  trends.push({
    metric: 'consistency',
    values: consistencyValues,
    trend: calculateTrend(consistencyValues),
    chapterNumbers: sortedData.map(d => d.chapterNumber)
  });
  
  // 引き込み度の傾向
  const engagementValues = sortedData.map(d => d.analysis.engagement.score);
  trends.push({
    metric: 'engagement',
    values: engagementValues,
    trend: calculateTrend(engagementValues),
    chapterNumbers: sortedData.map(d => d.chapterNumber)
  });
  
  // 読みやすさの傾向
  const readabilityValues = sortedData.map(d => d.analysis.readability.score);
  trends.push({
    metric: 'readability',
    values: readabilityValues,
    trend: calculateTrend(readabilityValues),
    chapterNumbers: sortedData.map(d => d.chapterNumber)
  });
  
  return trends;
}

/**
 * 配列の傾向を計算
 * 
 * @function calculateTrend
 * @param {number[]} values - 分析値の配列
 * @returns {'IMPROVING'|'DECLINING'|'STABLE'} 傾向の種類
 * @private
 */
function calculateTrend(values: number[]) {
  if (values.length < 2) return 'STABLE';
  
  // 最初と最後の値から傾向を判断
  const firstValues = values.slice(0, Math.ceil(values.length / 3));
  const lastValues = values.slice(-Math.ceil(values.length / 3));
  
  const firstAvg = firstValues.reduce((sum, val) => sum + val, 0) / firstValues.length;
  const lastAvg = lastValues.reduce((sum, val) => sum + val, 0) / lastValues.length;
  
  const change = lastAvg - firstAvg;
  
  if (change > 0.05) return 'IMPROVING';
  if (change < -0.05) return 'DECLINING';
  return 'STABLE';
}

/**
 * 分析結果から推奨事項を生成
 * 
 * @function generateRecommendations
 * @param {any[]} analyses - 分析結果の配列
 * @returns {string[]} 推奨事項の配列
 * @private
 */
function generateRecommendations(analyses: any[]) {
  // 各分析から推奨事項を収集
  const allRecommendations = analyses.flatMap(a => a.recommendations);
  
  // 重複を排除
  const uniqueRecommendations = Array.from(new Set(allRecommendations));
  
  // よく出現する推奨事項を優先
  const recommendationCounts = allRecommendations.reduce<Record<string, number>>((counts, rec) => {
    counts[rec] = (counts[rec] || 0) + 1;
    return counts;
  }, {});
  
  return uniqueRecommendations
    .sort((a, b) => (recommendationCounts[b] || 0) - (recommendationCounts[a] || 0))
    .slice(0, 5); // 上位5件を返す
}