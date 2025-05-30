/**
 * @fileoverview src/app/api/editor/interventions/route.ts
 * 
 * @description 
 * エディタ介入を管理するためのAPIルートハンドラー。このファイルはNext.jsのAPIルートハンドラーを提供し、
 * 介入リクエストの処理と介入履歴の取得を行います。
 * このファイルは以下の2つのHTTPエンドポイントを実装しています：
 * - POST: 新しい介入リクエストを処理
 * - GET: オプションでフィルタリング可能な介入履歴を取得
 * 
 * @requires next/server
 * @requires @/lib/editor/intervention-system
 * @requires @/lib/utils/error-handler
 * 
 * このAPIはInterventionSystemと連携して、エディタ環境の様々な側面（キャラクター、プロット、メモリなど）
 * を変更できるコマンドを実行します。
 */

import { NextRequest, NextResponse } from 'next/server';
import { InterventionSystem } from '@/lib/editor/intervention-system';
import { logError } from '@/lib/utils/error-handler';

// 介入システムのインスタンスを作成
const interventionSystem = new InterventionSystem();

/**
 * POSTを介して送信された介入リクエストを処理します。
 * 
 * このハンドラーは受信リクエストボディを検証し、必要なフィールド（type、target、command）が含まれていることを
 * 確認した後、実行のためにInterventionSystemにリクエストを渡します。介入結果はJSONとして返されます。
 * 
 * @param {NextRequest} request - 介入データを含むNext.jsリクエストオブジェクト
 * @returns {Promise<NextResponse>} 介入結果またはエラー詳細を含むJSON応答
 * 
 * @example
 * // リクエストボディの例：
 * // {
 * //   "type": "CHARACTER",  // 介入タイプ
 * //   "target": "CHARACTER", // 介入ターゲット
 * //   "command": "キャラクターを追加"  // 自然言語コマンド
 * // }
 * 
 * @throws 必要なフィールドが不足している場合は400レスポンスを返します
 * @throws 処理中に何らかのエラーが発生した場合は500レスポンスを返します
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを解析
    const data = await request.json();
    
    // バリデーション
    if (!data.type || !data.target || !data.command) {
      return NextResponse.json(
        { error: 'Type, target and command are required' },
        { status: 400 }
      );
    }
    
    // 介入の実行
    const result = await interventionSystem.executeIntervention(data);
    
    return NextResponse.json(result);
  } catch (error) {
    logError(error as Error, {}, 'Intervention API error');
    
    return NextResponse.json(
      { 
        error: 'Failed to process intervention request', 
        details: (error as Error).message,
        success: false,
        actionsTaken: [],
        affectedComponents: [],
        feedback: {
          message: `エラーが発生しました: ${(error as Error).message}`,
          suggestions: ['別のコマンドを試してください']
        }
      },
      { status: 500 }
    );
  }
}

/**
 * GETを介して介入履歴を取得します。
 * 
 * このハンドラーはURL検索パラメータを処理して、介入履歴レコードをフィルタリングおよび制限します。
 * 履歴はInterventionSystemから取得され、JSON応答として返されます。
 * 
 * @param {NextRequest} request - 検索パラメータを含むNext.jsリクエストオブジェクト
 * @returns {Promise<NextResponse>} フィルタリングされた介入履歴を含むJSON応答
 * 
 * @example
 * // URL例: /api/editor/interventions?limit=10&types=CHARACTER,PLOT
 * // - limit: 返すレコードの最大数
 * // - types: フィルタリングする介入タイプのカンマ区切りリスト
 * 
 * @throws 処理中に何らかのエラーが発生した場合は500レスポンスを返します
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const types = searchParams.get('types')?.split(',');
    
    // 履歴の取得
    const history = interventionSystem.getInterventionHistory(limit, types);
    
    return NextResponse.json({
      success: true,
      history
    });
  } catch (error) {
    logError(error as Error, {}, 'Intervention history API error');
    
    return NextResponse.json(
      { 
        error: 'Failed to get intervention history', 
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}