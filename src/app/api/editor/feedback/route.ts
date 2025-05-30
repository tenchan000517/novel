// src/app/api/editor/feedback/route.ts
/**
 * @fileoverview 編集者フィードバック処理と履歴取得のためのAPIルートハンドラー
 * @file src/app/api/editor/feedback/route.ts
 * @description このファイルはNext.jsのAPIルートハンドラーを実装し、編集者からのフィードバックを管理します。
 *              新規フィードバックの送信（処理および分類）と、オプションの時間範囲フィルタリングによる
 *              履歴フィードバックデータの取得のためのエンドポイントを提供します。
 * 
 * @requires next/server.NextResponse
 * @requires @/lib/editor/feedback-processor.FeedbackProcessor
 * @requires @/types/editor.FeedbackType
 */

import { NextResponse } from 'next/server';
import { FeedbackProcessor } from '@/lib/editor/feedback-processor';

/**
 * すべてのAPIリクエストで使用されるFeedbackProcessorのシングルトンインスタンス
 * @type {FeedbackProcessor}
 */
const feedbackProcessor = new FeedbackProcessor();

/**
 * 編集者フィードバック送信のためのPOSTリクエストを処理
 * 
 * @async
 * @function POST
 * @param {Request} request - HTTPリクエストオブジェクト
 * @returns {Promise<NextResponse>} 処理結果またはエラー情報を含むJSON応答
 * 
 * @description 編集者フィードバックの送信を処理します。このエンドポイントは：
 *  - 必須フィールド（chapterId、type、content）を検証
 *  - メタデータ（timestamp、editorId）を追加
 *  - FeedbackProcessorシステムを通じてフィードバックを処理
 *  - 処理結果または適切なエラーレスポンスを返却
 * 
 * @example
 * // 有効なリクエストボディの例：
 * {
 *   "chapterId": "chapter-42",
 *   "type": "CHARACTER",
 *   "content": "主人公のキャラクター一貫性に問題あり",
 *   "rating": 3,
 *   "suggestions": ["参考として第2章を再確認することを検討"],
 *   "editorId": "editor-1"  // オプション、デフォルトは'anonymous'
 * }
 * 
 * @example
 * // 成功レスポンスの構造：
 * {
 *   "success": true,
 *   "result": {
 *     "acknowledged": true,
 *     "classification": {...},
 *     "actionItems": [...],
 *     "impact": {...}
 *   }
 * }
 * 
 * @throws {400} 必須フィールドが不足している場合
 * @throws {500} フィードバック処理が失敗した場合
 */
export async function POST(request: Request) {
  try {
    const feedbackData = await request.json();
    
    // フィードバックのバリデーション
    if (!feedbackData.chapterId || !feedbackData.type || !feedbackData.content) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }
    
    // 現在日時の追加
    const feedback = {
      ...feedbackData,
      timestamp: new Date(),
      editorId: feedbackData.editorId || 'anonymous'
    };
    
    // フィードバック処理
    const result = await feedbackProcessor.processFeedback(feedback);
    
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Failed to process feedback:', error);
    
    return NextResponse.json(
      { error: 'Failed to process feedback', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * フィードバック履歴取得のためのGETリクエストを処理
 * 
 * @async
 * @function GET
 * @param {Request} request - HTTPリクエストオブジェクト
 * @returns {Promise<NextResponse>} フィードバック履歴またはエラー情報を含むJSON応答
 * 
 * @description FeedbackProcessorからフィードバック履歴を取得します。このエンドポイントは：
 *  - オプションのtimeRangeクエリパラメータ（例：'today'、'week'、'month'）を抽出
 *  - timeRangeに基づいてフィルタリングされたフィードバック履歴を取得
 *  - 履歴データまたは適切なエラーレスポンスを返却
 * 
 * @example
 * // リクエスト例：
 * GET /api/editor/feedback?timeRange=week
 * 
 * @example
 * // 成功レスポンスの構造：
 * {
 *   "success": true,
 *   "history": [
 *     {
 *       "feedback": {...},
 *       "classification": {...},
 *       "actionItems": [...],
 *       "actionStatus": {...},
 *       "learningStatus": {...}
 *     },
 *     ...
 *   ]
 * }
 * 
 * @throws {500} フィードバック履歴の取得に失敗した場合
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange');
    
    // フィードバック履歴を取得
    const history = await feedbackProcessor.getFeedbackHistory(timeRange || undefined);
    
    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('Failed to fetch feedback history:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch feedback history', details: (error as Error).message },
      { status: 500 }
    );
  }
}