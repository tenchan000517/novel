// src\app\api\debug\memory\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MemoryManager } from '@/lib/memory/manager';
import { MemoryProvider } from '@/lib/generation/context-generator/memory-provider';
import { logger } from '@/lib/utils/logger';
import { ContextGenerator } from '@/lib/generation/context-generator';

/**
 * デバッグ用メモリ情報取得APIエンドポイント
 * 
 * @async
 * @param {NextRequest} request - Next.jsリクエストオブジェクト
 * @returns {Promise<NextResponse>} 各種メモリ情報を含むJSONレスポンス
 * 
 * @description 
 * この関数は純粋にデバッグ目的で、生成プロセスで使用される各種メモリ情報を取得します。
 * チャプター番号を指定すると、そのチャプターの生成に使用される階層的記憶情報を返します。
 * 通常のAPIフローには影響を与えず、開発・デバッグ環境でのみ使用することを想定しています。
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Debug API: Memory information requested');

    // チャプター番号の取得
    const chapterNumber = parseInt(request.nextUrl.searchParams.get('chapter') || '1');

    if (isNaN(chapterNumber) || chapterNumber < 1) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_PARAMETER',
          message: 'Chapter number must be a positive integer'
        }
      }, { status: 400 });
    }

    // メモリ情報取得用のインスタンス作成
    const memoryManager = new MemoryManager();
    const memoryProvider = new MemoryProvider(memoryManager);

    // 各種メモリ情報を取得（生成プロセスと同じ方法で）
    logger.info(`Debug API: Retrieving memory data for chapter ${chapterNumber}`);

    const shortTermMemory = await memoryProvider.getShortTermMemory(chapterNumber);
    const midTermMemory = await memoryProvider.getMidTermMemory(chapterNumber);
    const longTermMemory = await memoryProvider.getLongTermMemory();

    // コンテキストジェネレータを作成し、コンテキストを生成
    logger.info(`Debug API: Generating context for chapter ${chapterNumber}`);
    const contextGenerator = new ContextGenerator();
    const generatedContext = await contextGenerator.generateContext(chapterNumber);

    // 実際のメモリサイズの記録（デバッグに役立つ情報）
    const shortTermSize = JSON.stringify(shortTermMemory).length;
    const midTermSize = JSON.stringify(midTermMemory).length;
    const longTermSize = JSON.stringify(longTermMemory).length;

    logger.info('Debug API: Memory information retrieved', {
      chapterNumber,
      shortTermSize,
      midTermSize,
      longTermSize
    });

    return NextResponse.json({
      success: true,
      data: {
        chapterNumber,
        // 階層的メモリ情報
        // shortTermMemory,
        // midTermMemory,
        // longTermMemory,
        // // メタ情報
        // meta: {
        //   shortTermSize,
        //   midTermSize,
        //   longTermSize,
        //   totalSize: shortTermSize + midTermSize + longTermSize
        // },
        generatedContext
      }
    });
  } catch (error) {
    logger.error('Debug API: Failed to retrieve memory information', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json({
      success: false,
      error: {
        code: 'DEBUG_ERROR',
        message: 'Failed to retrieve memory information',
        details: error instanceof Error ? error.message : String(error)
      }
    }, { status: 500 });
  }
}