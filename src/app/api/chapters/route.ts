// src\app\api\chapters\route.ts

/**
 * @fileoverview 小説チャプター一覧取得APIエンドポイント
 * @description 保存された小説チャプターの一覧を取得するAPIルート
 */

import { NextRequest, NextResponse } from 'next/server';
import { chapterStorage } from '@/lib/storage';
import { logger } from '@/lib/utils/logger';

/**
 * 保存されたチャプターの一覧を取得するエンドポイント
 * 
 * @async
 * @param {NextRequest} request - Next.jsリクエストオブジェクト
 * @returns {Promise<NextResponse>} チャプター一覧を含むJSONレスポンス
 * 
 * @description この関数は保存されたすべてのチャプターの一覧を取得し、
 * JSONレスポンスとして返します。ソート順やフィルタリングのためのクエリパラメータも
 * サポートしています。
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        logger.info('Chapter list request received');

        // チャプター一覧の取得
        const chapterList = await chapterStorage.listAllChapters();
        
        // ソート順の取得（デフォルトはasc）
        const sortOrder = request.nextUrl.searchParams.get('sort') || 'asc';
        
        // ソート処理
        let sortedList = [...chapterList];
        if (sortOrder.toLowerCase() === 'desc') {
            sortedList.sort((a, b) => b.number - a.number);
        } else {
            sortedList.sort((a, b) => a.number - b.number);
        }

        // 最新チャプター情報の取得
        const latestChapterNumber = sortedList.length > 0 
            ? Math.max(...sortedList.map(chapter => chapter.number))
            : 0;

        logger.info('Chapter list request completed', { 
            totalChapters: chapterList.length,
            latestChapter: latestChapterNumber
        });

        return NextResponse.json({ 
            success: true, 
            data: {
                chapters: sortedList,
                totalCount: sortedList.length,
                latest: latestChapterNumber
            }
        });
    } catch (error) {
        logger.error('Failed to retrieve chapter list', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });

        return NextResponse.json(
            { 
                success: false, 
                error: { 
                    code: 'LIST_ERROR', 
                    message: 'Failed to retrieve chapter list' 
                } 
            },
            { status: 500 }
        );
    }
}