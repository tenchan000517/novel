// src\app\api\chapters\[chapterNumber]\route.ts

/**
 * @fileoverview 小説チャプター取得APIエンドポイント
 * @description 保存された小説チャプターを取得するためのAPIルート
 */

import { NextRequest, NextResponse } from 'next/server';
import { chapterStorage } from '@/lib/storage';
import { logger } from '@/lib/utils/logger';

/**
 * 指定されたチャプター番号のチャプターを取得するエンドポイント
 * 
 * @async
 * @param {NextRequest} request - Next.jsリクエストオブジェクト
 * @param {{ params: { chapterNumber: string } }} context - ルートパラメータを含むコンテキスト
 * @returns {Promise<NextResponse>} チャプターデータを含むJSONレスポンス
 * 
 * @description この関数は指定されたチャプター番号のチャプターを取得し、
 * JSON形式またはマークダウン形式で返します。format=markdownクエリパラメータが
 * 指定されている場合はマークダウン形式で、それ以外の場合はJSON形式で返します。
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { chapterNumber: string } }
): Promise<NextResponse> {
    try {
        const chapterNumber = parseInt(params.chapterNumber);
        logger.info(`Chapter retrieval request for chapter ${chapterNumber}`);

        // チャプター番号の検証
        if (isNaN(chapterNumber) || chapterNumber < 1) {
            logger.warn('Invalid chapter number', { chapterNumber: params.chapterNumber });
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: 'INVALID_CHAPTER_NUMBER', 
                        message: 'Invalid chapter number' 
                    } 
                },
                { status: 400 }
            );
        }

        // チャプターの取得
        const chapter = await chapterStorage.getChapter(chapterNumber);

        // チャプターが存在しない場合
        if (!chapter) {
            logger.warn(`Chapter ${chapterNumber} not found`);
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: 'CHAPTER_NOT_FOUND', 
                        message: `Chapter ${chapterNumber} not found` 
                    } 
                },
                { status: 404 }
            );
        }

        // フォーマット指定の取得（デフォルトはJSON）
        const format = request.nextUrl.searchParams.get('format');

        // マークダウン形式で返す場合
        if (format === 'markdown') {
            logger.info(`Returning chapter ${chapterNumber} in markdown format`);
            return new NextResponse(chapter.content, {
                headers: {
                    'Content-Type': 'text/markdown',
                    'Content-Disposition': `inline; filename="chapter-${String(chapterNumber).padStart(3, '0')}.md"`
                }
            });
        }

        // JSON形式で返す場合
        logger.info(`Returning chapter ${chapterNumber} in JSON format`);
        return NextResponse.json({ 
            success: true, 
            data: chapter 
        });
    } catch (error) {
        logger.error(`Failed to retrieve chapter ${params.chapterNumber}`, {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });

        return NextResponse.json(
            { 
                success: false, 
                error: { 
                    code: 'RETRIEVE_ERROR', 
                    message: 'Failed to retrieve chapter' 
                } 
            },
            { status: 500 }
        );
    }
}

/**
 * 指定されたチャプター番号のチャプターを削除するエンドポイント
 * 
 * @async
 * @param {NextRequest} request - Next.jsリクエストオブジェクト
 * @param {{ params: { chapterNumber: string } }} context - ルートパラメータを含むコンテキスト
 * @returns {Promise<NextResponse>} 削除結果を含むJSONレスポンス
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { chapterNumber: string } }
): Promise<NextResponse> {
    try {
        const chapterNumber = parseInt(params.chapterNumber);
        logger.info(`Chapter deletion request for chapter ${chapterNumber}`);

        // チャプター番号の検証
        if (isNaN(chapterNumber) || chapterNumber < 1) {
            logger.warn('Invalid chapter number', { chapterNumber: params.chapterNumber });
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: 'INVALID_CHAPTER_NUMBER', 
                        message: 'Invalid chapter number' 
                    } 
                },
                { status: 400 }
            );
        }

        // チャプターが存在するか確認
        const exists = await chapterStorage.chapterExists(chapterNumber);
        if (!exists) {
            logger.warn(`Chapter ${chapterNumber} not found for deletion`);
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: 'CHAPTER_NOT_FOUND', 
                        message: `Chapter ${chapterNumber} not found` 
                    } 
                },
                { status: 404 }
            );
        }

        // チャプターの削除
        const success = await chapterStorage.deleteChapter(chapterNumber);
        if (!success) {
            logger.error(`Failed to delete chapter ${chapterNumber}`);
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: 'DELETE_FAILED', 
                        message: `Failed to delete chapter ${chapterNumber}` 
                    } 
                },
                { status: 500 }
            );
        }

        logger.info(`Chapter ${chapterNumber} deleted successfully`);
        return NextResponse.json({ 
            success: true, 
            data: { 
                message: `Chapter ${chapterNumber} deleted successfully` 
            } 
        });
    } catch (error) {
        logger.error(`Failed to delete chapter ${params.chapterNumber}`, {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });

        return NextResponse.json(
            { 
                success: false, 
                error: { 
                    code: 'DELETE_ERROR', 
                    message: 'Failed to delete chapter' 
                } 
            },
            { status: 500 }
        );
    }
}