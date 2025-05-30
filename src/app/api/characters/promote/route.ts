// src\app\api\characters\promote\route.ts
/**
 * @fileoverview キャラクター昇格APIエンドポイント
 * @description 
 * このファイルはキャラクターを低位タイプ（MOB→SUB→MAIN）に昇格させるためのAPI
 * エンドポイントを提供します。CharacterManagerを使用して昇格処理を実行し、
 * キャラクターの昇格可能性を評価したうえで、適格な場合のみ昇格を許可します。
 * 
 * 昇格プロセスには以下のステップが含まれます：
 * 1. リクエストパラメータの検証
 * 2. キャラクターの存在確認
 * 3. 昇格適格性の評価
 * 4. 昇格処理の実行
 * 5. 昇格結果の返却
 * 
 * 昇格処理はPromotionSystemを通じて行われ、キャラクターの実績、プロット関連度、
 * 読者エンゲージメントなどのメトリクスに基づいて判断されます。昇格によりキャラクターの
 * 背景設定が拡張され、より多くの情報が追加されます。
 * 
 * @requires next/server
 * @requires @/lib/characters/manager
 * @requires @/lib/utils/logger
 */

import { NextResponse } from 'next/server';
import { CharacterManager } from '@/lib/characters/manager';
import { logger } from '@/lib/utils/logger';

/**
 * キャラクター昇格API
 * POST: キャラクターを昇格させる
 */

// シングルトンのキャラクターマネージャーインスタンス
const characterManager = new CharacterManager();

/**
 * キャラクターを昇格させるPOSTエンドポイント処理
 * 
 * @async
 * @function POST
 * @param {Request} request - HTTPリクエストオブジェクト
 * @returns {Promise<NextResponse>} JSONレスポンス
 * 
 * @description
 * このエンドポイントは次の処理を実行します：
 * 1. リクエストボディからcharacterIdを取得
 * 2. キャラクターの存在確認
 * 3. キャラクターが昇格可能かどうかを評価
 * 4. 昇格可能な場合は昇格処理を実行
 * 5. 昇格結果をJSON形式で返却
 * 
 * @example
 * // リクエストボディ例
 * {
 *   "characterId": "char_12345",
 *   "targetType": "MAIN" // オプション
 * }
 * 
 * // 成功レスポンス例
 * {
 *   "success": true,
 *   "data": {
 *     "character": {...}, // 昇格後のキャラクターデータ
 *     "promotionDetails": {
 *       "fromType": "SUB",
 *       "toType": "MAIN",
 *       "timestamp": "2023-...",
 *       "score": 0.85,
 *       "reason": "十分な登場回数と物語への関与が認められます"
 *     }
 *   }
 * }
 * 
 * // エラーレスポンス例
 * {
 *   "success": false,
 *   "error": {
 *     "code": "NOT_ELIGIBLE",
 *     "message": "Character is not eligible for promotion: 登場回数が不足しています"
 *   }
 * }
 * 
 * @throws {400} VALIDATION_ERROR - 必須パラメータが不足している場合
 * @throws {404} NOT_FOUND - 指定されたIDのキャラクターが存在しない場合
 * @throws {400} NOT_ELIGIBLE - キャラクターが昇格条件を満たしていない場合
 * @throws {400} INVALID_TARGET_TYPE - 指定された昇格先タイプが評価結果と一致しない場合
 * @throws {500} PROMOTION_ERROR - 昇格処理中にエラーが発生した場合
 */
export async function POST(request: Request) {
  try {
    const { characterId, targetType, backstoryDetails } = await request.json();
    
    // パラメータ検証
    if (!characterId) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Character ID is required'
          }
        },
        { status: 400 }
      );
    }
    
    // キャラクター存在確認
    const character = await characterManager.getCharacter(characterId);
    if (!character) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Character with ID ${characterId} not found`
          }
        },
        { status: 404 }
      );
    }
    
    // 昇格前の評価
    const evaluation = await characterManager.evaluateCharacterPromotion(character);
    
    // 昇格可能性チェック
    if (!evaluation.eligible) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_ELIGIBLE',
            message: `Character is not eligible for promotion: ${evaluation.recommendation}`
          }
        },
        { status: 400 }
      );
    }
    
    // ターゲットタイプの検証
    if (targetType && evaluation.targetType !== targetType) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_TARGET_TYPE',
            message: `Requested promotion to ${targetType} but evaluation suggests ${evaluation.targetType}`
          }
        },
        { status: 400 }
      );
    }
    
    // 昇格実行
    const promotedCharacter = await characterManager.promoteCharacter(characterId);
    
    // 昇格詳細の抽出
    const promotionDetails = {
      fromType: character.type,
      toType: promotedCharacter.type,
      timestamp: new Date(),
      score: evaluation.score,
      reason: evaluation.recommendation
    };
    
    logger.info(`Promoted character: ${character.name} (${characterId}) from ${character.type} to ${promotedCharacter.type}`);
    
    return NextResponse.json({
      success: true,
      data: {
        character: promotedCharacter,
        promotionDetails
      }
    });
  } catch (error) {
    logger.error('Failed to promote character', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'PROMOTION_ERROR',
          message: 'Failed to promote character'
        }
      },
      { status: 500 }
    );
  }
}