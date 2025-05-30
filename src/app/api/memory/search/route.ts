// src\app\api\memory\search\route.ts

/**
 * @fileoverview メモリ検索APIのエンドポイント
 * @description このファイルは記憶管理システムで保存されている記憶を検索するためのAPIエンドポイントを提供します。
 * ユーザーは検索クエリやフィルタリングオプションを指定し、関連する記憶とその分析結果を取得できます。
 * 
 * @requires next/server - Next.jsのサーバーサイドAPI用ユーティリティ
 * @requires @/lib/memory/manager - 記憶管理システムの中央コントローラー
 * @requires @/lib/utils/logger - ログ記録用ユーティリティ
 * @requires @/types/memory - 記憶関連の型定義
 * @requires @/lib/utils/error-handler - エラーハンドリング用ユーティリティ
 */

import { NextRequest, NextResponse } from 'next/server';
import { memoryManager } from '@/lib/memory/manager';
import { logger } from '@/lib/utils/logger';
import { MemoryType, SearchResult } from '@/types/memory';
import { logError } from '@/lib/utils/error-handler';

/**
 * メモリ検索APIエンドポイント
 * 
 * @async
 * @function GET
 * @param {NextRequest} request - Next.jsのリクエストオブジェクト
 * @returns {Promise<NextResponse>} JSON形式のレスポンス
 * 
 * @description 
 * 記憶管理システムに保存されている記憶を検索するためのAPIエンドポイント。
 * 検索クエリ、メモリタイプ、結果数制限、最小関連性スコアなどのパラメータを
 * 受け取り、条件に合致する記憶を返します。また、検索結果に基づいた分析インサイトも生成します。
 * 
 * @example
 * // リクエスト例:
 * GET /api/memory/search?query=主人公の冒険&types=SHORT_TERM,MID_TERM&limit=5&minRelevance=0.7
 * 
 * // 成功時のレスポンス構造:
 * {
 *   "success": true,
 *   "data": {
 *     "results": [
 *       {
 *         "memory": {
 *           "type": "SHORT_TERM",
 *           "content": "チャプター5: 主人公が森での冒険を開始する...",
 *           "priority": 0.8
 *         },
 *         "relevance": 0.92,
 *         "matches": ["主人公", "冒険"]
 *       }
 *     ],
 *     "insights": [
 *       {
 *         "type": "TYPE_DISTRIBUTION",
 *         "description": "検索結果の大部分は短期記憶からのものです（3件）"
 *       }
 *     ]
 *   }
 * }
 * 
 * // エラー時のレスポンス構造:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "Search query is required"
 *   }
 * }
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Memory search request received');
    
    // Initialize memory manager if needed
    const status = await memoryManager.getStatus();
    if (!status.initialized) {
      await memoryManager.initialize();
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const typesParam = searchParams.get('types');
    const limitParam = searchParams.get('limit');
    const minRelevanceParam = searchParams.get('minRelevance');
    
    // Validate query
    if (!query) {
      logger.warn('Search query is missing');
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Search query is required' 
          } 
        },
        { status: 400 }
      );
    }
    
    // Parse parameters
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    const minRelevance = minRelevanceParam ? parseFloat(minRelevanceParam) : 0.5;
    
    // Parse memory types
    let memoryTypes: MemoryType[] = ['SHORT_TERM', 'MID_TERM', 'LONG_TERM'];
    if (typesParam) {
      const types = typesParam.split(',');
      const validTypes = types.filter(type => 
        ['SHORT_TERM', 'MID_TERM', 'LONG_TERM'].includes(type)
      ) as MemoryType[];
      
      if (validTypes.length > 0) {
        memoryTypes = validTypes;
      }
    }
    
    logger.debug('Memory search parameters', { 
      query, 
      limit, 
      minRelevance, 
      memoryTypes 
    });
    
    // Execute the search using memory manager
    const searchResults = await memoryManager.searchMemories(query, {
      limit,
      minRelevance,
      memoryTypes,
      includeMeta: true
    });
    
    // Generate insights based on search results
    const insights = generateInsights(searchResults);
    
    logger.info(`Memory search completed, found ${searchResults.length} results`);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        results: searchResults,
        insights
      }
    });
  } catch (error) {
    logError(error, {}, 'Failed to search memories');
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SEARCH_ERROR', 
          message: error instanceof Error ? error.message : 'Failed to search memories' 
        } 
      },
      { status: 500 }
    );
  }
}

/**
 * 検索結果からインサイト（洞察）を生成する関数
 * 
 * @function generateInsights
 * @param {SearchResult[]} results - 検索結果の配列
 * @returns {any[]} 生成されたインサイトの配列
 * 
 * @description
 * 検索結果を分析し、以下のような複数のインサイトを生成します：
 * 1. メモリタイプの分布 - 短期/中期/長期記憶の分布状況
 * 2. 関連性の分布 - 高/中/低の関連性を持つ結果の割合
 * 3. チャプター分布 - 検索結果がどのチャプター範囲に分布しているか
 * 
 * インサイトは検索結果の特徴を示す情報として、日本語でユーザーに提供されます。
 * 
 * @example
 * // インサイトの例:
 * [
 *   {
 *     "type": "TYPE_DISTRIBUTION",
 *     "description": "検索結果の大部分は短期記憶からのものです（3件）"
 *   },
 *   {
 *     "type": "RELEVANCE",
 *     "description": "検索結果の多く（5件）が高い関連性を持っています"
 *   },
 *   {
 *     "type": "CHAPTER_FOCUS",
 *     "description": "検索結果はチャプター5～10に集中しています"
 *   }
 * ]
 */
function generateInsights(results: SearchResult[]): any[] {
  if (results.length === 0) return [];
  
  const insights = [];
  
  // 1. Memory type distribution
  const typeDistribution: Record<string, number> = {};
  results.forEach(result => {
    const type = result.memory.type;
    typeDistribution[type] = (typeDistribution[type] || 0) + 1;
  });
  
  const mostCommonTypeEntries = Object.entries(typeDistribution)
    .sort((a, b) => b[1] - a[1]);
  
  if (mostCommonTypeEntries.length > 0) {
    const [mostCommonType, count] = mostCommonTypeEntries[0];
    
    // Map memory type to Japanese
    const typeNameMap: Record<string, string> = {
      'SHORT_TERM': '短期記憶',
      'MID_TERM': '中期記憶',
      'LONG_TERM': '長期記憶'
    };
    
    insights.push({
      type: 'TYPE_DISTRIBUTION',
      description: `検索結果の大部分は${typeNameMap[mostCommonType] || mostCommonType}からのものです（${count}件）`
    });
  }
  
  // 2. Relevance distribution
  const highRelevance = results.filter(r => r.relevance > 0.7).length;
  const mediumRelevance = results.filter(r => r.relevance > 0.3 && r.relevance <= 0.7).length;
  
  if (highRelevance > results.length / 2) {
    insights.push({
      type: 'RELEVANCE',
      description: `検索結果の多く（${highRelevance}件）が高い関連性を持っています`
    });
  } else if (mediumRelevance + highRelevance < results.length / 2) {
    insights.push({
      type: 'RELEVANCE',
      description: `検索結果の関連性は全体的に低めです`
    });
  }
  
  // 3. Chapter distribution if present
  const chapterRegex = /チャプター(\d+)/;
  const chapterMatches = results.map(result => {
    const match = result.memory.content.match(chapterRegex);
    return match ? parseInt(match[1], 10) : null;
  }).filter(chapter => chapter !== null) as number[];
  
  if (chapterMatches.length > 0) {
    // Find chapter range
    const minChapter = Math.min(...chapterMatches);
    const maxChapter = Math.max(...chapterMatches);
    
    if (maxChapter - minChapter > 10) {
      insights.push({
        type: 'CHAPTER_RANGE',
        description: `検索結果は広範囲のチャプター（${minChapter}～${maxChapter}）に分布しています`
      });
    } else if (chapterMatches.length > results.length / 2) {
      insights.push({
        type: 'CHAPTER_FOCUS',
        description: `検索結果はチャプター${minChapter}～${maxChapter}に集中しています`
      });
    }
  }
  
  return insights;
}