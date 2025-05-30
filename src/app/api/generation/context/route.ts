// src\app\api\generation\context\route.ts

/**
 * @fileoverview 小説生成のためのコンテキスト情報を提供するAPIエンドポイント
 * @description このファイルは小説生成システムのためのコンテキスト情報を取得するためのAPIエンドポイントを提供します。
 * チャプター番号に基づいて、階層的記憶管理システムから各種コンテキスト情報（短期記憶、中期記憶、長期記憶、
 * キャラクター状態、伏線情報など）を取得し、AIが小説を生成するために必要な情報を返します。
 * 詳細フラグによって、編集者向けの詳細情報と生成システム向けの簡易情報の2種類のレスポース形式を切り替えられます。
 * 
 * @requires next/server
 * @requires @/lib/generation/context-generator
 * @requires @/types/generation
 * @requires @/lib/utils/logger
 * @requires @/lib/utils/error-handler
 * 
 * @dependency ContextGenerator - コンテキスト生成を行うクラス。階層的記憶管理システムからデータを取得する
 * @dependency logger - ログ記録用ユーティリティ
 * @dependency ValidationError - バリデーションエラーを表現するエラークラス
 * @dependency formatErrorResponse - エラーレスポンスをフォーマットするユーティリティ関数
 */

import { NextRequest, NextResponse } from 'next/server';
import { ContextGenerator } from '@/lib/generation/context-generator';
import { ContextQueryParams, ContextResponse } from '@/types/generation';
import { logger } from '@/lib/utils/logger';
import { ValidationError, formatErrorResponse } from '@/lib/utils/error-handler';

// シングルトンインスタンス
const contextGenerator = new ContextGenerator();

/**
 * コンテキスト生成APIエンドポイント
 * 指定されたチャプター番号に基づいて小説生成に必要なコンテキスト情報を取得します。
 * detailedフラグによって、返却される情報の詳細度を変更できます。
 * 
 * @param {NextRequest} request - APIリクエスト
 * @returns {Promise<NextResponse>} JSONレスポンス
 * 
 * @throws {ValidationError} チャプター番号が無効（数値でない、または1未満）の場合
 * 
 * @example
 * // リクエスト例
 * GET /api/generation/context?chapterNumber=3&detailed=false
 * 
 * // 成功時のレスポンス (detailed=false)
 * {
 *   "success": true,
 *   "data": {
 *     "chapterNumber": 3,
 *     "worldSettings": "ファンタジー世界の設定...",
 *     "storyContext": "# 現在のアーク: 主人公の旅立ち\n## 重要イベント:\n- 故郷の村が襲撃される (1章)\n# 最近のチャプター\n## チャプター2\n主人公が旅に出ることを決意する...",
 *     "theme": "成長と友情",
 *     "tone": "自然で読みやすい文体",
 *     "narrativeStyle": "三人称視点、過去形",
 *     "targetLength": 8000,
 *     "tension": 0.65,
 *     "pacing": 0.4,
 *     "characterCount": 5,
 *     "foreshadowingCount": 2
 *   }
 * }
 * 
 * // 成功時のレスポンス (detailed=true)
 * {
 *   "success": true,
 *   "data": {
 *     "shortTerm": { "chapters": [...] },
 *     "midTerm": { "currentArc": {...}, "keyEvents": [...] },
 *     "longTerm": { "worldSettings": "...", "theme": "...", "causalityMap": [...] },
 *     "characterStates": [ 
 *       { "name": "主人公名", "description": "...", "personality": "...", "goals": "...", "currentState": "..." },
 *       ...
 *     ],
 *     "expressionConstraints": [...],
 *     "storyContext": "...",
 *     "worldSettings": "...",
 *     "foreshadowing": ["前章で言及された謎の人物...", ...],
 *     "theme": "成長と友情",
 *     "tone": "自然で読みやすい文体",
 *     "narrativeStyle": "三人称視点、過去形",
 *     "tension": 0.65,
 *     "pacing": 0.4
 *   }
 * }
 * 
 * // エラー時のレスポンス
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "Invalid chapter number"
 *   }
 * }
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Context generation request received');
    
    // クエリパラメータの取得
    const searchParams = request.nextUrl.searchParams;
    const chapterNumber = parseInt(searchParams.get('chapterNumber') || '1');
    const detailed = searchParams.get('detailed') === 'true';
    
    logger.debug('Context request details', { chapterNumber, detailed });
    
    // リクエストの検証
    if (isNaN(chapterNumber) || chapterNumber < 1) {
      logger.warn('Invalid chapter number', { chapterNumber });
      throw new ValidationError('Invalid chapter number');
    }
    
    // コンテキスト生成
    logger.info(`Generating context for chapter ${chapterNumber}`);
    const context = await contextGenerator.generateContext(chapterNumber);
    
    // 詳細フラグに基づいて返すデータを調整
    let responseData: any;
    
    if (detailed) {
      // 詳細なコンテキスト情報（編集者向け）
      responseData = {
        shortTerm: context.shortTermMemory || {},
        midTerm: context.midTermMemory || {},
        longTerm: context.longTermMemory || {},
        characterStates: context.characterStates || [],
        expressionConstraints: context.expressionConstraints || [],
        storyContext: context.storyContext || '',
        worldSettings: context.worldSettings || '',
        foreshadowing: context.foreshadowing || [],
        theme: context.theme || '',
        tone: context.tone || '',
        narrativeStyle: context.narrativeStyle || '',
        tension: context.tension || 0.5,
        pacing: context.pacing || 0.5
      };
    } else {
      // 簡易情報（生成システム向け）
      responseData = {
        chapterNumber: context.chapterNumber || chapterNumber,
        worldSettings: context.worldSettings || '',
        storyContext: context.storyContext || '',
        theme: context.theme || '',
        tone: context.tone || '',
        narrativeStyle: context.narrativeStyle || '',
        targetLength: context.targetLength || 8000,
        tension: context.tension || 0.5,
        pacing: context.pacing || 0.5,
        characterCount: (context.characters || []).length,
        foreshadowingCount: (context.foreshadowing || []).length,
      };
    }
    
    logger.info(`Context generation completed for chapter ${chapterNumber}`, {
      contextSize: JSON.stringify(responseData).length,
      detailed
    });
    
    return NextResponse.json({ 
      success: true, 
      data: responseData
    });
  } catch (error) {
    logger.error('Failed to generate context', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    const errorResponse = formatErrorResponse(error instanceof Error ? error : new Error(String(error)));
    const statusCode = error instanceof ValidationError ? 400 : 500;
    
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}