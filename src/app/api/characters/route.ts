// src\app\api\characters\route.ts

/**
 * @fileoverview キャラクター管理のためのAPIエンドポイント
 * @description このファイルはキャラクター管理のためのREST APIエンドポイントを実装しています。
 * GET リクエストでキャラクターリストの取得、POST リクエストで新しいキャラクターの作成が可能です。
 * 
 * @requires NextResponse - Next.jsのレスポンスオブジェクト
 * @requires CharacterManager - キャラクター管理を行うクラス
 * @requires logger - ロギング機能
 * @requires CharacterType - キャラクタータイプの型定義
 * 
 * @dependency 各キャラクターはタイプ(MAIN/SUB/MOB)によって分類され、ステータス(active/inactive)を持ちます
 * @dependency レスポンスは常に { success: boolean, data?: any, error?: { code: string, message: string } } の形式で返されます
 */

import { NextResponse } from 'next/server';
import { CharacterManager } from '@/lib/characters/manager';
import { logger } from '@/lib/utils/logger';
import { CharacterType } from '@/types/characters';

/**
 * アプリケーション内で使用するシングルトンのキャラクターマネージャーインスタンス
 * @constant
 * @type {CharacterManager}
 */
const characterManager = new CharacterManager();

/**
 * キャラクターリストを取得するAPIエンドポイント
 * HTTP GETメソッドに対応し、以下のクエリパラメータをサポートします:
 * - type: キャラクタータイプによるフィルタリング（MAIN, SUB, MOBのいずれか）
 * - status: アクティブ状態によるフィルタリング（active, inactiveのいずれか）
 * - page: ページネーション用ページ番号（デフォルト: 1）
 * - limit: 1ページあたりの件数（デフォルト: 20）
 * 
 * @async
 * @function GET
 * @param {Request} request - HTTPリクエストオブジェクト
 * @returns {Promise<NextResponse>} JSONレスポンス
 *   - 成功時: { success: true, data: { characters: Character[], pagination: Object } }
 *   - エラー時: { success: false, error: { code: string, message: string } }
 * 
 * @example
 * // 成功レスポンスの例
 * {
 *   "success": true,
 *   "data": {
 *     "characters": [...],
 *     "pagination": {
 *       "page": 1,
 *       "limit": 20,
 *       "total": 42,
 *       "pages": 3
 *     }
 *   }
 * }
 * 
 * @throws {400} - 無効なキャラクタータイプが指定された場合
 * @throws {500} - キャラクター取得処理で内部エラーが発生した場合
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type');
    const status = searchParams.get('status') as 'active' | 'inactive' | null;
    
    // タイプによるフィルタリング - CharacterType のバリデーション
    let characters;
    if (typeParam) {
      // 有効な CharacterType かチェック
      const isValidType = ['MAIN', 'SUB', 'MOB'].includes(typeParam);
      if (isValidType) {
        characters = await characterManager.getCharactersByType(typeParam as CharacterType);
      } else {
        return NextResponse.json(
          { 
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: `Invalid character type: ${typeParam}`
            }
          },
          { status: 400 }
        );
      }
    } else {
      characters = await characterManager.getAllCharacters();
    }
    
    // ステータスによるフィルタリング
    if (status) {
      characters = characters.filter(char => 
        (status === 'active' && char.state.isActive) || 
        (status === 'inactive' && !char.state.isActive)
      );
    }
    
    // ページネーション設定
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // レスポンスデータの作成
    const paginatedCharacters = characters.slice(startIndex, endIndex);
    const total = characters.length;
    
    logger.info(`Returned ${paginatedCharacters.length} characters (page ${page}, total: ${total})`);
    
    return NextResponse.json({
      success: true,
      data: {
        characters: paginatedCharacters,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Failed to fetch characters', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch characters'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * 新しいキャラクターを作成するAPIエンドポイント
 * HTTP POSTメソッドに対応し、リクエストボディにキャラクター情報を含める必要があります。
 * 
 * 必須フィールド:
 * - name: キャラクター名
 * - type: キャラクタータイプ（MAIN, SUB, MOBのいずれか）
 * - description: キャラクターの説明
 * 
 * @async
 * @function POST
 * @param {Request} request - HTTPリクエストオブジェクト（JSONボディを含む）
 * @returns {Promise<NextResponse>} JSONレスポンス
 *   - 成功時: { success: true, data: { character: Character } }
 *   - エラー時: { success: false, error: { code: string, message: string } }
 * 
 * @example
 * // リクエストボディの例
 * {
 *   "name": "新キャラクター",
 *   "type": "SUB",
 *   "description": "キャラクターの説明..."
 * }
 * 
 * @throws {400} - リクエストデータが不正またはバリデーションエラーの場合
 * @throws {500} - キャラクター作成処理で内部エラーが発生した場合
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // 必須フィールドの検証
    if (!data.name || !data.type) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Name and type are required fields'
          }
        },
        { status: 400 }
      );
    }
    
    // キャラクタータイプのバリデーション
    if (!['MAIN', 'SUB', 'MOB'].includes(data.type)) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Invalid character type: ${data.type}`
          }
        },
        { status: 400 }
      );
    }
    
    // description フィールドの確認 (必須とされているフィールド)
    if (!data.description) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Description is required'
          }
        },
        { status: 400 }
      );
    }
    
    // キャラクター作成
    const character = await characterManager.addCharacter(data);
    
    logger.info(`Created new character: ${character.name} (${character.id})`);
    
    return NextResponse.json({
      success: true,
      data: {
        character
      }
    }, { status: 201 });
  } catch (error) {
    logger.error('Failed to create character', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create character'
        }
      },
      { status: 500 }
    );
  }
}