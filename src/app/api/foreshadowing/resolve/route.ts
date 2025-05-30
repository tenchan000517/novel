// src/app/api/foreshadowing/resolve/route.ts

/**
 * @fileoverview 伏線解決APIエンドポイント
 * @description 
 * 物語内の伏線（foreshadowing）を解決済み状態に更新するためのAPIエンドポイント。
 * クライアントからのPOSTリクエストを受け取り、memoryManagerの長期記憶システムを使用して
 * 伏線の解決状態を更新する。
 * 
 * @requires next/server
 * @requires @/lib/memory
 * @requires @/lib/utils/logger
 * @requires @/lib/utils/error-handler
 */

import { NextRequest, NextResponse } from 'next/server';
import { memoryManager } from '@/lib/memory'; // 正しいインポートパス
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';

/**
 * POSTリクエストハンドラー - 伏線解決処理を実行する
 * 
 * @async
 * @function POST
 * @param {NextRequest} request - Next.jsのリクエストオブジェクト
 * @returns {Promise<NextResponse>} JSONレスポンス
 * @throws {Error} 伏線解決中にエラーが発生した場合
 * 
 * @example
 * // リクエスト例:
 * {
 *   "id": "fs-1-a1b2c3d4",        // 伏線ID
 *   "resolutionChapter": 5,        // 解決されたチャプター番号
 *   "resolutionDescription": "主人公が古い手紙を発見し、謎が明らかになった"  // 解決の説明
 * }
 * 
 * // 成功時のレスポンス例:
 * {
 *   "success": true,
 *   "message": "Foreshadowing fs-1-a1b2c3d4 successfully resolved"
 * }
 * 
 * // バリデーションエラー時のレスポンス例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "ID, resolutionChapter and resolutionDescription are required"
 *   }
 * }
 * 
 * // 実行時エラー時のレスポンス例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "RESOLVE_ERROR",
 *     "message": "Failed to resolve foreshadowing: Foreshadowing with ID \"fs-1-a1b2c3d4\" not found"
 *   }
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Foreshadowing resolution request received');
    
    // memoryManagerの初期化
    await memoryManager.initialize();
    
    // リクエストからデータを取得
    const data = await request.json();
    
    // 必須フィールドの確認
    if (!data.id || !data.resolutionChapter || !data.resolutionDescription) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'ID, resolutionChapter and resolutionDescription are required'
          } 
        },
        { status: 400 }
      );
    }
    
    // 伏線を解決
    await memoryManager.getLongTermMemory().resolveForeshadowing(
      data.id,
      data.resolutionChapter,
      data.resolutionDescription
    );
    
    return NextResponse.json({
      success: true,
      message: `Foreshadowing ${data.id} successfully resolved`
    });
  } catch (error) {
    logError(error, {}, 'Failed to resolve foreshadowing');
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'RESOLVE_ERROR', 
          message: error instanceof Error ? error.message : 'Failed to resolve foreshadowing'
        } 
      },
      { status: 500 }
    );
  }
}