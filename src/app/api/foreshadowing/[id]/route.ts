// src/app/api/foreshadowing/[id]/route.ts

/**
 * @fileoverview 伏線（foreshadowing）のID指定による操作を提供するAPIエンドポイント
 * @description このファイルでは特定IDの伏線の取得(GET)、更新(PUT)、削除(DELETE)機能を実装しています
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
 * 特定IDの伏線を取得するGETエンドポイント
 * @async
 * @function GET
 * @param {NextRequest} request - 受信したHTTPリクエスト
 * @param {Object} params - URLパラメータ
 * @param {string} params.id - 取得する伏線のID
 * @returns {Promise<NextResponse>} 成功時は取得した伏線データを含むレスポンス、失敗時はエラー情報を含むレスポンス
 * @example
 * // 成功時のレスポンス構造:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "fs-1-abcd1234",
 *     "description": "主人公の過去の秘密",
 *     "chapter_introduced": 3,
 *     "resolved": false,
 *     "urgency": "medium",
 *     "createdTimestamp": "2023-12-01T12:34:56.789Z",
 *     "updatedTimestamp": "2023-12-01T12:34:56.789Z"
 *   }
 * }
 * 
 * // 404エラー時のレスポンス構造:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "NOT_FOUND",
 *     "message": "Foreshadowing with ID fs-1-abcd1234 not found"
 *   }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const id = params.id;
    logger.info(`Foreshadowing fetch by ID request: ${id}`);
    
    // memoryManagerの初期化
    await memoryManager.initialize();
    
    // IDによる伏線取得
    const foreshadowing = await memoryManager.getLongTermMemory().getForeshadowingById(id);
    
    if (!foreshadowing) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'NOT_FOUND', 
            message: `Foreshadowing with ID ${id} not found`
          } 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: foreshadowing
    });
  } catch (error) {
    logError(error, { id: params.id }, 'Failed to fetch foreshadowing by ID');
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'FETCH_ERROR', 
          message: error instanceof Error ? error.message : 'Failed to fetch foreshadowing'
        } 
      },
      { status: 500 }
    );
  }
}

/**
 * 特定IDの伏線を更新するPUTエンドポイント
 * @async
 * @function PUT
 * @param {NextRequest} request - 更新データを含むHTTPリクエスト
 * @param {Object} params - URLパラメータ
 * @param {string} params.id - 更新する伏線のID
 * @returns {Promise<NextResponse>} 成功時は更新後の伏線データを含むレスポンス、失敗時はエラー情報を含むレスポンス
 * @example
 * // リクエスト本文の例:
 * {
 *   "description": "更新された伏線の説明",
 *   "resolved": true,
 *   "resolution_chapter": 10
 * }
 * 
 * // 成功時のレスポンス構造:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "fs-1-abcd1234",
 *     "description": "更新された伏線の説明",
 *     "chapter_introduced": 3,
 *     "resolved": true,
 *     "resolution_chapter": 10,
 *     "urgency": "medium",
 *     "createdTimestamp": "2023-12-01T12:34:56.789Z",
 *     "updatedTimestamp": "2023-12-02T10:11:12.345Z"
 *   }
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const id = params.id;
    logger.info(`Foreshadowing update request: ${id}`);
    
    // memoryManagerの初期化
    await memoryManager.initialize();
    
    // リクエストからデータを取得
    const updates = await request.json();
    
    // 伏線の更新
    const updatedForeshadowing = await memoryManager.getLongTermMemory().updateForeshadowing(id, updates);
    
    return NextResponse.json({
      success: true,
      data: updatedForeshadowing
    });
  } catch (error) {
    logError(error, { id: params.id }, 'Failed to update foreshadowing');
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'UPDATE_ERROR', 
          message: error instanceof Error ? error.message : 'Failed to update foreshadowing'
        } 
      },
      { status: 500 }
    );
  }
}

/**
 * 特定IDの伏線を削除するDELETEエンドポイント
 * @async
 * @function DELETE
 * @param {NextRequest} request - 受信したHTTPリクエスト
 * @param {Object} params - URLパラメータ
 * @param {string} params.id - 削除する伏線のID
 * @returns {Promise<NextResponse>} 成功時は削除成功メッセージを含むレスポンス、失敗時はエラー情報を含むレスポンス
 * @example
 * // 成功時のレスポンス構造:
 * {
 *   "success": true,
 *   "message": "Foreshadowing fs-1-abcd1234 successfully deleted"
 * }
 * 
 * // エラー時のレスポンス構造:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "DELETE_ERROR",
 *     "message": "Failed to delete foreshadowing"
 *   }
 * }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const id = params.id;
    logger.info(`Foreshadowing delete request: ${id}`);
    
    // memoryManagerの初期化
    await memoryManager.initialize();
    
    // 伏線の削除
    await memoryManager.getLongTermMemory().deleteForeshadowing(id);
    
    return NextResponse.json({
      success: true,
      message: `Foreshadowing ${id} successfully deleted`
    });
  } catch (error) {
    logError(error, { id: params.id }, 'Failed to delete foreshadowing');
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'DELETE_ERROR', 
          message: error instanceof Error ? error.message : 'Failed to delete foreshadowing'
        } 
      },
      { status: 500 }
    );
  }
}