// src\app\api\characters\[id]\route.ts
/**
 * @fileoverview 個別キャラクター管理API - 特定IDのキャラクターの取得、更新、削除（非アクティブ化）を行うエンドポイント
 * @description 
 * このAPIは特定のキャラクターIDに対するREST操作（GET/PUT/DELETE）を提供します。
 * - GET: 単一キャラクターの詳細取得とその関係性データを返します
 * - PUT: キャラクター情報の更新を行います
 * - DELETE: キャラクターを削除（実際には非アクティブ化）します
 * 
 * @requires next/server
 * @requires @/lib/characters/manager
 * @requires @/lib/utils/logger
 */

import { NextResponse } from 'next/server';
import { CharacterManager } from '@/lib/characters/manager';
import { logger } from '@/lib/utils/logger';

/**
 * リクエストコンテキストのインターフェース
 * @interface RequestContext
 * @property {Object} params - URLパラメータ
 * @property {string} params.id - キャラクターID
 */
interface RequestContext {
  params: {
    id: string;
  };
}

// シングルトンのキャラクターマネージャーインスタンス
const characterManager = new CharacterManager();

/**
 * 単一キャラクターの詳細取得
 * 
 * @async
 * @function GET
 * @param {Request} request - HTTPリクエストオブジェクト
 * @param {RequestContext} context - リクエストコンテキスト（キャラクターIDを含む）
 * @returns {Promise<NextResponse>} 
 *  - 成功時: キャラクター情報、関係性データ、履歴、メトリクスを含むJSONレスポンス
 *  - エラー時: エラーコードとメッセージを含むJSONレスポンス
 * 
 * @example
 * // 成功レスポンス
 * {
 *   success: true,
 *   data: {
 *     character: {...},
 *     relationships: {...},
 *     history: {
 *       appearances: [...],
 *       developmentPath: [...]
 *     },
 *     metrics: {
 *       appearanceCount: 5,
 *       developmentStage: 2,
 *       lastAppearance: 10
 *     }
 *   }
 * }
 * 
 * // エラーレスポンス
 * {
 *   success: false,
 *   error: {
 *     code: 'NOT_FOUND',
 *     message: 'Character with ID 123 not found'
 *   }
 * }
 */
export async function GET(request: Request, context: RequestContext) {
  try {
    const { id } = context.params;
    
    // キャラクター取得
    const character = await characterManager.getCharacter(id);
    
    if (!character) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Character with ID ${id} not found`
          }
        },
        { status: 404 }
      );
    }
    
    // 関係性取得
    const relationships = await characterManager.getRelationshipAnalysis();
    
    // 追加情報の取得
    const history = {
      appearances: character.history.appearances,
      developmentPath: character.history.developmentPath
    };
    
    const metrics = {
      appearanceCount: character.history.appearances.length,
      developmentStage: character.state.developmentStage,
      lastAppearance: character.state.lastAppearance
    };
    
    logger.info(`Retrieved character: ${character.name} (${id})`);
    
    return NextResponse.json({
      success: true,
      data: {
        character,
        relationships: relationships.visualData, // ビジュアライゼーション用データ
        history,
        metrics
      }
    });
  } catch (error) {
    logger.error(`Failed to fetch character ${context.params.id}`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      characterId: context.params.id
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch character'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * キャラクター情報の更新
 * 
 * @async
 * @function PUT
 * @param {Request} request - HTTPリクエストオブジェクト。キャラクター更新データをJSONボディに含む
 * @param {RequestContext} context - リクエストコンテキスト（キャラクターIDを含む）
 * @returns {Promise<NextResponse>} 
 *  - 成功時: 更新されたキャラクター情報と変更内容を含むJSONレスポンス
 *  - エラー時: エラーコードとメッセージを含むJSONレスポンス
 * 
 * @example
 * // リクエストボディ
 * {
 *   name: "新しい名前",
 *   description: "更新された説明"
 * }
 * 
 * // 成功レスポンス
 * {
 *   success: true,
 *   data: {
 *     character: {...},
 *     changes: [
 *       { field: "name", oldValue: "古い名前", newValue: "新しい名前" },
 *       { field: "description", oldValue: "古い説明", newValue: "更新された説明" }
 *     ]
 *   }
 * }
 */
export async function PUT(request: Request, context: RequestContext) {
  try {
    const { id } = context.params;
    const updates = await request.json();
    
    // キャラクター存在確認
    const existingCharacter = await characterManager.getCharacter(id);
    
    if (!existingCharacter) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Character with ID ${id} not found`
          }
        },
        { status: 404 }
      );
    }
    
    // キャラクター更新
    const updatedCharacter = await characterManager.updateCharacter(id, updates);
    
    // 変更記録の抽出
    const changes = Object.keys(updates).map(key => ({
      field: key,
      oldValue: existingCharacter[key as keyof typeof existingCharacter],
      newValue: updatedCharacter[key as keyof typeof updatedCharacter]
    }));
    
    logger.info(`Updated character: ${updatedCharacter.name} (${id})`, {
      changedFields: Object.keys(updates)
    });
    
    return NextResponse.json({
      success: true,
      data: {
        character: updatedCharacter,
        changes
      }
    });
  } catch (error) {
    logger.error(`Failed to update character ${context.params.id}`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      characterId: context.params.id
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update character'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * キャラクターの削除（非アクティブ化）
 * 
 * @async
 * @function DELETE
 * @param {Request} request - HTTPリクエストオブジェクト
 * @param {RequestContext} context - リクエストコンテキスト（キャラクターIDを含む）
 * @returns {Promise<NextResponse>} 
 *  - 成功時: 非アクティブ化されたキャラクター情報を含むJSONレスポンス
 *  - エラー時: エラーコードとメッセージを含むJSONレスポンス
 * 
 * @description 
 * このメソッドはキャラクターを物理的に削除せず、非アクティブ状態に設定します。
 * これによりデータは保持されたまま、アプリケーション上では削除されたように見えます。
 * 
 * @example
 * // 成功レスポンス
 * {
 *   success: true,
 *   data: {
 *     message: "Character 123 has been deactivated",
 *     character: {...} // 非アクティブ化されたキャラクターデータ
 *   }
 * }
 */
export async function DELETE(request: Request, context: RequestContext) {
  try {
    const { id } = context.params;
    
    // キャラクター存在確認
    const existingCharacter = await characterManager.getCharacter(id);
    
    if (!existingCharacter) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Character with ID ${id} not found`
          }
        },
        { status: 404 }
      );
    }
    
    // キャラクターの非アクティブ化
    // 実際には削除せず、状態を更新するだけ
    const updatedCharacter = await characterManager.updateCharacter(id, {
      state: {
        ...existingCharacter.state,
        isActive: false
      }
    });
    
    logger.info(`Deactivated character: ${existingCharacter.name} (${id})`);
    
    return NextResponse.json({
      success: true,
      data: {
        message: `Character ${id} has been deactivated`,
        character: updatedCharacter
      }
    });
  } catch (error) {
    logger.error(`Failed to delete character ${context.params.id}`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      characterId: context.params.id
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete character'
        }
      },
      { status: 500 }
    );
  }
}