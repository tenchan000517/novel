// src/app/api/memory/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MemoryManager } from '@/lib/memory/manager';
import { logger } from '@/lib/utils/logger';
import { Memory } from '@/types/memory';

const memoryManager = new MemoryManager();

// マッチした文脈を抽出する関数 - クラス外に移動
function extractMatches(content: string, queryWords: string[]): string[] {
  if (queryWords.length === 0) return [];
  
  const matches: string[] = [];
  const contentLower = content.toLowerCase();
  
  // 各単語について、その周辺のテキストを抽出
  queryWords.forEach(word => {
    const index = contentLower.indexOf(word);
    if (index >= 0) {
      // 単語の前後50文字を抽出
      const start = Math.max(0, index - 50);
      const end = Math.min(contentLower.length, index + word.length + 50);
      
      // 切り出し範囲を調整（単語の途中で切れないように）
      const contextStart = contentLower.lastIndexOf(' ', start) + 1;
      const contextEnd = contentLower.indexOf(' ', end);
      
      const excerpt = content.substring(
        contextStart > 0 ? contextStart : start,
        contextEnd > 0 ? contextEnd : end
      );
      
      matches.push(`...${excerpt}...`);
    }
  });
  
  // 重複を除去
  return [...new Set(matches)];
}

// 洞察の生成関数 - クラス外に移動
function generateInsights(results: any[]): any[] {
  if (results.length === 0) return [];
  
  // このフェーズではシンプルな洞察を返す
  const insights = [];
  
  // 1. 記憶タイプの分布
  const typeDistribution = results.reduce((dist: Record<string, number>, result) => {
    const type = result.memory.type;
    dist[type] = (dist[type] || 0) + 1;
    return dist;
  }, {});
  
  const mostCommonTypeEntries = Object.entries(typeDistribution)
    .sort((a, b) => (b[1] as number) - (a[1] as number));
  
  if (mostCommonTypeEntries.length > 0) {
    const mostCommonType = mostCommonTypeEntries[0];
    insights.push({
      type: 'TYPE_DISTRIBUTION',
      description: `検索結果の大部分は${mostCommonType[0]}記憶からのものです（${mostCommonType[1]}件）`
    });
  }
  
  // 2. 関連性の分布
  const highRelevance = results.filter(r => r.relevance > 70).length;
  const mediumRelevance = results.filter(r => r.relevance > 30 && r.relevance <= 70).length;
  
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
  
  return insights;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Memory search request received');
    
    // クエリパラメータの取得
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '10');
    const types = searchParams.get('types')?.split(',') as string[] | undefined;
    
    logger.debug('Memory search request details', { query, limit, types });
    
    // クエリのバリデーション
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
    
    // 記憶検索の実行 - searchMemoryからsearchMemoriesに修正
    logger.info(`Searching memories with query: "${query}"`);
    const memories = await memoryManager.searchMemories(query);
    
    // 結果のフィルタリングと制限
    let filteredMemories = memories;
    
    // タイプでフィルタリング
    if (types && types.length > 0) {
      filteredMemories = memories.filter(memory => 
        types.includes(memory.memory.type)
      );
    }
    
    // 制限
    const limitedMemories = filteredMemories.slice(0, limit);
    
    // 関連性スコアの計算（このフェーズではシンプルな実装）
    const results = limitedMemories.map(memory => {
      // クエリの各単語が記憶内容に含まれるかを確認
      const queryWords = query.toLowerCase().split(/\s+/);
      const content = memory.memory.content.toLowerCase();
      
      // 単語の出現回数を数える
      const matchCount = queryWords.reduce((count, word) => {
        return count + (content.includes(word) ? 1 : 0);
      }, 0);
      
      // スコアの計算（単純な一致率）
      const relevance = queryWords.length > 0 
        ? (matchCount / queryWords.length) * 100 
        : 0;
      
      // マッチした文脈を抽出 - thisを削除
      const matches = extractMatches(memory.memory.content, queryWords);
      
      return {
        memory: memory.memory,
        relevance: Math.round(relevance),
        matches
      };
    });
    
    // 関連性でソート
    const sortedResults = results.sort((a, b) => b.relevance - a.relevance);
    
    logger.info(`Memory search completed, found ${sortedResults.length} results`);
    
    // 洞察の生成（このフェーズではシンプルな実装） - thisを削除
    const insights = generateInsights(sortedResults);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        results: sortedResults,
        insights
      }
    });
  } catch (error) {
    logger.error('Failed to search memories', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SEARCH_ERROR', 
          message: (error as Error).message || 'Failed to search memories' 
        } 
      },
      { status: 500 }
    );
  }
}