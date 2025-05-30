// src/app/api/foreshadowing/suggest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { foreshadowingManager } from '@/lib/foreshadowing';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';

/**
 * @fileoverview 小説のチャプターコンテンツから伏線を生成・提案するAPIエンドポイント
 * @description このファイルはチャプター内容を分析し、新しい伏線を自動生成するとともに、
 * 既存の伏線の解決提案を返すAPIエンドポイントを定義しています。
 * foreshadowingManagerを使用してチャプターの分析と処理を行います。
 * @requires next/server
 * @requires @/lib/foreshadowing
 * @requires @/lib/utils/logger
 * @requires @/lib/utils/error-handler
 */

/**
 * POSTリクエストを処理する関数
 * チャプターコンテンツを受け取り、伏線の生成と解決提案を行います
 * 
 * @async
 * @param {NextRequest} request - クライアントからのリクエスト
 * @returns {Promise<NextResponse>} 処理結果を含むJSON形式のレスポンス
 * 
 * @example
 * // リクエスト例:
 * {
 *   "chapterContent": "彼女は窓から見える遠くの山々を眺めながら、祖父の遺した古い鍵のことを思い出した。その鍵が開けるものは何なのか、まだ誰も知らなかった。",
 *   "chapterNumber": 3,
 *   "generateCount": 2
 * }
 * 
 * // 成功時のレスポンス例:
 * {
 *   "success": true,
 *   "data": {
 *     "generatedCount": 2,
 *     "resolutionSuggestions": [
 *       {
 *         "foreshadowing": {
 *           "id": "fs-12345",
 *           "description": "祖父の遺した古い鍵",
 *           "chapter_introduced": 1,
 *           "resolved": false,
 *           "urgency": "medium"
 *         },
 *         "chapterContent": "遺された鍵について触れられている部分",
 *         "reason": "現在のチャプターでキャラクターが鍵について再度言及しており、解決に適している",
 *         "confidence": 0.8
 *       }
 *     ]
 *   }
 * }
 * 
 * // バリデーションエラー時のレスポンス例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "chapterContent and chapterNumber are required"
 *   }
 * }
 * 
 * // 処理エラー時のレスポンス例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "SUGGESTION_ERROR",
 *     "message": "Failed to process foreshadowing suggestions"
 *   }
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Foreshadowing suggestion request received');
    
    // リクエストからデータを取得
    const data = await request.json();
    
    // 必須フィールドの確認
    if (!data.chapterContent || data.chapterNumber === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'chapterContent and chapterNumber are required'
          } 
        },
        { status: 400 }
      );
    }
    
    // 伏線処理
    const result = await foreshadowingManager.processChapterAndGenerateForeshadowing(
      data.chapterContent,
      data.chapterNumber,
      data.generateCount || 2
    );
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    logError(error, {}, 'Failed to process foreshadowing suggestions');
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SUGGESTION_ERROR', 
          message: error instanceof Error ? error.message : 'Failed to process foreshadowing suggestions'
        } 
      },
      { status: 500 }
    );
  }
}