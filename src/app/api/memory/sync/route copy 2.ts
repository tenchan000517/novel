// src\app\api\memory\sync\route.ts

/**
 * @fileoverview メモリ同期APIエンドポイント
 * @description 
 * このファイルはメモリ同期機能を提供するAPIエンドポイントを実装しています。
 * クライアントからのリクエストを受け取り、メモリマネージャーを使用して
 * チャプターデータを処理し、様々なメモリレベル（短期、中期、長期）間の
 * 同期を行います。
 * 
 * @requires next/server
 * @requires @/lib/memory/manager
 * @requires @/types/memory
 * @requires @/lib/utils/logger
 * @requires @/lib/utils/error-handler
 * @requires @/types/chapters
 */

import { NextRequest, NextResponse } from 'next/server';
import { memoryManager } from '@/lib/memory/manager';
import { SyncMemoryRequest, SyncMemoryResponse } from '@/types/memory';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { Chapter } from '@/types/chapters';

/**
 * POSTリクエストを処理するAPIハンドラー
 * メモリ同期処理を実行し、結果を返します。
 * 
 * リクエストには強制同期モード（force）またはチャプター番号が必要です。
 * forceモードの場合は直接syncMemoriesを呼び出し、
 * 通常モードの場合はチャプターを取得してからprocessChapterとsyncMemoriesを呼び出します。
 * 
 * @param {NextRequest} request - 受信したHTTPリクエスト
 * @returns {Promise<NextResponse>} HTTPレスポンス
 * 
 * @example
 * // リクエスト構造（通常同期）:
 * {
 *   "chapterNumber": 5
 * }
 * 
 * // リクエスト構造（強制同期）:
 * {
 *   "chapterNumber": 5,
 *   "force": true
 * }
 * 
 * // 成功時のレスポンス構造:
 * {
 *   "success": true,
 *   "data": {
 *     "updatedMemories": ["SHORT_TERM", "MID_TERM"],
 *     "compressionActions": [
 *       {
 *         "type": "compress",
 *         "source": "SHORT_TERM",
 *         "target": "MID_TERM",
 *         "details": "5のチャプターメモリを圧縮"
 *       }
 *     ]
 *   }
 * }
 * 
 * // バリデーションエラー時のレスポンス構造:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "Chapter number is required unless force is true"
 *   }
 * }
 * 
 * // チャプターが見つからない場合のレスポンス構造:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "NOT_FOUND",
 *     "message": "Chapter 5 not found"
 *   }
 * }
 * 
 * // 同期エラー時のレスポンス構造:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "SYNC_ERROR",
 *     "message": "エラーメッセージ"
 *   }
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Memory synchronization request received');
    
    // Parse request body
    const requestData: SyncMemoryRequest = await request.json();
    
    logger.debug('Memory sync request data', { requestData });
    
    // Validate request
    if (!requestData.chapterNumber && !requestData.force) {
      logger.warn('Invalid sync request - missing chapter number');
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Chapter number is required unless force is true' 
          } 
        },
        { status: 400 }
      );
    }
    
    // Initialize memory manager if needed
    const status = await memoryManager.getStatus();
    if (!status.initialized) {
      await memoryManager.initialize();
    }
    
    // If force synchronization is requested, use syncMemories directly
    if (requestData.force) {
      logger.info('Force synchronizing memory system');
      
      const syncResult = await memoryManager.syncMemories(requestData);
      
      return NextResponse.json({
        success: true,
        data: syncResult
      });
    }
    
    // For regular chapter processing, we need to get the chapter first
    const chapterNumber = requestData.chapterNumber;
    
    // Get the chapter from the database/storage
    const chapter = requestData.chapter; // 新しいコード
    
    if (!chapter) {
      // メッセージも適切に変更
      logger.warn(`Chapter data not provided for chapter ${chapterNumber}`);
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'BAD_REQUEST', // NOT_FOUNDからBAD_REQUESTに変更
            message: `Chapter data not provided for chapter ${chapterNumber}` 
          } 
        },
        { status: 400 } // 404から400に変更
      );
    }
    
    // Process the chapter
    await memoryManager.processChapter(chapter);
    
    // Then trigger a sync to ensure all memory levels are updated
    const syncResult = await memoryManager.syncMemories({
      chapterNumber,
      force: false
    });
    
    logger.info('Memory synchronization completed successfully', {
      chapterNumber,
      updatedMemories: syncResult.updatedMemories.length,
      compressionActions: syncResult.compressionActions.length
    });
    
    return NextResponse.json({
      success: true,
      data: syncResult
    });
    
  } catch (error) {
    logError(error, {}, 'Failed to synchronize memory');
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SYNC_ERROR', 
          message: error instanceof Error ? error.message : 'Failed to synchronize memory'
        } 
      },
      { status: 500 }
    );
  }
}

/**
 * チャプター番号からチャプターを取得するヘルパー関数
 * 
 * 指定されたチャプター番号に対応するチャプターデータをAPIまたはデータベースから取得します。
 * これは簡易実装であり、実際のデータアクセス方法は実装者によって置き換えられることを想定しています。
 * 
 * @param {number} chapterNumber - 取得するチャプターの番号
 * @returns {Promise<Chapter | null>} 取得したチャプターオブジェクト、見つからない場合はnull
 * 
 * @example
 * // 使用例
 * const chapter = await getChapter(5);
 * if (chapter) {
 *   // チャプターが見つかった場合の処理
 * } else {
 *   // チャプターが見つからなかった場合の処理
 * }
 */
async function getChapter(chapterNumber: number): Promise<Chapter | null> {
  try {
    // Example: Fetch chapter from API or database
    // This is where you would implement your actual data access
    const response = await fetch(`/api/chapters/${chapterNumber}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch chapter ${chapterNumber}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || `Failed to get chapter ${chapterNumber}`);
    }
    
    return data.data as Chapter;
  } catch (error) {
    logError(error, { chapterNumber }, 'Failed to get chapter for memory sync');
    return null;
  }
}