// src\app\api\foreshadowing\route.ts

/**
 * @fileoverview 伏線(foreshadowing)データのAPI操作を提供するエンドポイント
 * @description このファイルでは、物語の伏線データを取得および作成するためのREST APIエンドポイントを提供します。
 * GET: 既存の伏線データの一覧を取得します
 * POST: 新しい伏線データを作成します
 * 
 * @requires next/server
 * @requires @/lib/memory
 * @requires @/lib/foreshadowing
 * @requires @/lib/utils/logger
 * @requires @/lib/utils/error-handler
 * 
 * @dependency memoryManager - 記憶管理システムのメインインスタンス
 * @dependency longTermMemory - 長期記憶を管理するコンポーネント
 */

import { NextRequest, NextResponse } from 'next/server';
import { memoryManager } from '@/lib/memory';
import { foreshadowingManager } from '@/lib/foreshadowing';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';

/**
 * 伏線データを取得するGETエンドポイント
 * 
 * @async
 * @function GET
 * @param {NextRequest} request - Next.jsリクエストオブジェクト
 * @returns {Promise<NextResponse>} 伏線データまたはエラー情報を含むJSONレスポンス
 * 
 * @example
 * // 成功時のレスポンス構造:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "fs-1-abc12345",
 *       "description": "主人公が森で見つけた謎の鍵",
 *       "chapter_introduced": 3,
 *       "resolved": false,
 *       "urgency": "medium",
 *       "createdTimestamp": "2025-04-01T12:00:00Z",
 *       "updatedTimestamp": "2025-04-01T12:00:00Z"
 *     },
 *     // 他の伏線データ...
 *   ]
 * }
 * 
 * // エラー時のレスポンス構造:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "FETCH_ERROR",
 *     "message": "Failed to fetch foreshadowing data"
 *   }
 * }
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Foreshadowing fetch request received');
    
    // memoryManagerを初期化
    await memoryManager.initialize();
    
    // 伏線データの取得
    const foreshadowing = await memoryManager.getLongTermMemory().getForeshadowing();
    
    return NextResponse.json({
      success: true,
      data: foreshadowing
    });
  } catch (error) {
    logError(error, {}, 'Failed to fetch foreshadowing data');
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'FETCH_ERROR', 
          message: error instanceof Error ? error.message : 'Failed to fetch foreshadowing data'
        } 
      },
      { status: 500 }
    );
  }
}

/**
 * 新しい伏線データを作成するPOSTエンドポイント
 * 
 * @async
 * @function POST
 * @param {NextRequest} request - Next.jsリクエストオブジェクト (伏線データを含むJSONボディが必要)
 * @returns {Promise<NextResponse>} 作成された伏線データまたはエラー情報を含むJSONレスポンス
 * 
 * @example
 * // リクエストボディの例:
 * {
 *   "description": "主人公が図書館で見つけた古い日記",
 *   "chapter_introduced": 5,
 *   "urgency": "high",
 *   "context": "主人公が過去の秘密を探る手がかりとなる",
 *   "plannedResolution": 12,
 *   "relatedCharacters": ["主人公", "図書館司書"]
 * }
 * 
 * // 成功時のレスポンス構造:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "fs-2-def67890",
 *     "description": "主人公が図書館で見つけた古い日記",
 *     "chapter_introduced": 5,
 *     "resolved": false,
 *     "urgency": "high",
 *     "context": "主人公が過去の秘密を探る手がかりとなる",
 *     "plannedResolution": 12,
 *     "relatedCharacters": ["主人公", "図書館司書"],
 *     "createdTimestamp": "2025-04-05T14:30:00Z",
 *     "updatedTimestamp": "2025-04-05T14:30:00Z"
 *   }
 * }
 * 
 * // バリデーションエラー時のレスポンス構造:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "Description and chapter_introduced are required"
 *   }
 * }
 * 
 * // その他エラー時のレスポンス構造:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "CREATE_ERROR",
 *     "message": "Failed to create foreshadowing"
 *   }
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Foreshadowing create request received');
    
    // memoryManagerを初期化
    await memoryManager.initialize();
    
    // リクエストからデータを取得
    const data = await request.json();
    
    // 必須フィールドの確認
    if (!data.description || !data.chapter_introduced) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Description and chapter_introduced are required'
          } 
        },
        { status: 400 }
      );
    }
    
    // 伏線の追加
    const newForeshadowing = await memoryManager.getLongTermMemory().addForeshadowing(data);
    
    return NextResponse.json({
      success: true,
      data: newForeshadowing
    });
  } catch (error) {
    logError(error, {}, 'Failed to create foreshadowing');
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'CREATE_ERROR', 
          message: error instanceof Error ? error.message : 'Failed to create foreshadowing'
        } 
      },
      { status: 500 }
    );
  }
}