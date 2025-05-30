// src/app/api/generation/context/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ContextGenerator } from '@/lib/generation/context-generator';
import { ContextQueryParams, ContextResponse, GenerationContext } from '@/types/generation';
import { logger } from '@/lib/utils/logger';

const contextGenerator = new ContextGenerator();

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
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid chapter number' 
          } 
        },
        { status: 400 }
      );
    }
    
    // コンテキスト生成
    logger.info(`Generating context for chapter ${chapterNumber}`);
    const context = await contextGenerator.generateContext(chapterNumber);
    
    // 詳細フラグに基づいて返すデータを調整
    let responseData: any;
    
    if (detailed) {
      // 詳細なコンテキスト情報（デバッグや編集者向け）
      responseData = {
        shortTerm: {
          recentChapters: context.storyContext 
            ? context.storyContext.split('\n\n').filter(s => s.includes('チャプター'))
            : [],
        },
        midTerm: {
          currentArc: context.storyContext 
            ? context.storyContext.split('\n\n').filter(s => s.includes('アーク'))
            : [],
        },
        longTerm: {
          worldSettings: context.worldSettings || '',
          mainTheme: context.theme || '',
        },
        characterStates: context.characters || [],
        expressionConstraints: {
          tone: context.tone || '',
          narrativeStyle: context.narrativeStyle || '',
        },
      };
    } else {
      // 簡易情報（基本的な生成用）
      responseData = {
        chapterNumber: context.chapterNumber || chapterNumber,
        worldSettings: context.worldSettings || '',
        theme: context.theme || '',
        tone: context.tone || '',
        narrativeStyle: context.narrativeStyle || '',
        targetLength: context.targetLength || 0,
        characterCount: (context.characters || []).length,
        foreshadowingCount: (context.foreshadowing || []).length,
      };
    }
    
    logger.info(`Context generation completed for chapter ${chapterNumber}`);
    
    return NextResponse.json({ 
      success: true, 
      data: responseData
    });
  } catch (error) {
    logger.error('Failed to generate context', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'CONTEXT_ERROR', 
          message: (error as Error).message || 'Failed to generate context' 
        } 
      },
      { status: 500 }
    );
  }
}