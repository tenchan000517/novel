// src/app/api/memory/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MemoryManager } from '@/lib/memory/manager';
import { SyncMemoryRequest, SyncMemoryResponse } from '@/types/memory';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { logWarn } from '@/lib/utils/error-handler';

const memoryManager = new MemoryManager();

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Memory synchronization request received');
    
    // リクエストの解析
    const requestData = await request.json() as SyncMemoryRequest;
    
    logger.debug('Memory sync request details', { data: requestData });
    
    // リクエストの検証
    if (!requestData.chapterNumber && !requestData.force) {
      logger.warn('Invalid sync request - missing chapter number');
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Chapter number is required unless force is true' 
          } 
        },
        { status: 400 }
      );
    }
    
    // 更新された記憶タイプを追跡
    const updatedMemories: string[] = [];
    
    // 圧縮アクションを追跡
    const compressionActions: any[] = [];
    
    // 同期処理
    if (requestData.force) {
      // 強制同期（全記憶階層の再構築）
      logger.info('Force synchronizing all memory levels');
      
      // すべてのチャプターを取得して処理
      const chapters = await getAllChapters();
      
      if (chapters.length > 0) {
        // チャプター番号でソート
        chapters.sort((a, b) => a.number - b.number);
        
        // すべてのチャプターを順に処理
        for (const chapter of chapters) {
          logger.debug(`Processing chapter ${chapter.number} for forced sync`);
          
          // 記憶更新
          await memoryManager.processChapter(chapter);
          
          updatedMemories.push('SHORT_TERM');
          
          // 圧縮が行われたかチェック（このフェーズではシンプルな実装）
          if (chapter.number % 5 === 0) {
            updatedMemories.push('MID_TERM');
            compressionActions.push({
              type: 'compress',
              source: 'SHORT_TERM',
              target: 'MID_TERM',
              details: `チャプター${chapter.number - 4}〜${chapter.number}の圧縮`
            });
          }
          
          if (chapter.number % 20 === 0) {
            updatedMemories.push('LONG_TERM');
            compressionActions.push({
              type: 'integrate',
              source: 'MID_TERM',
              target: 'LONG_TERM',
              details: `アーク${Math.floor(chapter.number / 20)}の統合`
            });
          }
        }
      }
    } else {
      // 個別チャプターの処理
      const chapterNumber = requestData.chapterNumber as number;
      logger.info(`Synchronizing memory for chapter ${chapterNumber}`);
      
      // チャプターを取得
      const chapter = await getChapter(chapterNumber);
      
      if (!chapter) {
        logger.warn(`Chapter ${chapterNumber} not found`);
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'NOT_FOUND', 
              message: `Chapter ${chapterNumber} not found` 
            } 
          },
          { status: 404 }
        );
      }
      
      // 記憶更新
      await memoryManager.processChapter(chapter);
      
      updatedMemories.push('SHORT_TERM');
      
      // 圧縮が行われたかチェック（このフェーズではシンプルな実装）
      if (chapterNumber % 5 === 0) {
        updatedMemories.push('MID_TERM');
        compressionActions.push({
          type: 'compress',
          source: 'SHORT_TERM',
          target: 'MID_TERM',
          details: `チャプター${chapterNumber - 4}〜${chapterNumber}の圧縮`
        });
      }
      
      if (chapterNumber % 20 === 0) {
        updatedMemories.push('LONG_TERM');
        compressionActions.push({
          type: 'integrate',
          source: 'MID_TERM',
          target: 'LONG_TERM',
          details: `アーク${Math.floor(chapterNumber / 20)}の統合`
        });
      }
    }
    
    // 重複を除去
    const uniqueUpdatedMemories = [...new Set(updatedMemories)] as string[];
    
    logger.info('Memory synchronization completed', {
      updatedMemories: uniqueUpdatedMemories,
      compressionActions: compressionActions.length
    });
    
    // レスポンスの構築
    const response: SyncMemoryResponse = {
      success: true,
      updatedMemories: uniqueUpdatedMemories as any,
      compressionActions,
    };
    
    return NextResponse.json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    logger.error('Failed to synchronize memory', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SYNC_ERROR', 
          message: (error as Error).message || 'Failed to synchronize memory' 
        } 
      },
      { status: 500 }
    );
  }
}

// すべてのチャプターを取得
async function getAllChapters(): Promise<any[]> {
  try {
    // フェーズ2ではシンプルな実装
    // ディレクトリ内のチャプターファイルをリスト
    const chapterFiles = await storageProvider.listFiles('chapters');
    const chapters = [];
    
    for (const file of chapterFiles) {
      const match = file.match(/chapter-(\d+)\.md/);
      if (match) {
        const chapterNumber = parseInt(match[1]);
        const chapter = await getChapter(chapterNumber);
        if (chapter) {
          chapters.push(chapter);
        }
      }
    }
    
    return chapters;
  } catch (error) {
    logger.error('Failed to get all chapters', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return [];
  }
}

// チャプターの取得
async function getChapter(chapterNumber: number): Promise<any | null> {
  try {
    const content = await storageProvider.readFile(`chapters/chapter-${chapterNumber}.md`);
    
    // 簡易チャプターオブジェクトの作成
    return {
      id: `chapter-${chapterNumber}`,
      number: chapterNumber,
      title: `第${chapterNumber}章`,
      content,
      summary: content.substring(0, 200),
      metadata: {
        wordCount: content.length,
        createdAt: new Date().toISOString(),
        generationVersion: '1.0.0',
        qualityScore: 0,
      },
    };
  } catch (error) {
    logWarn(`Failed to get chapter ${chapterNumber}`, error);
    return null;
  }
}