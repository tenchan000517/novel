// src/app/api/debug/memory/immediate-context/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { memoryManager } from '@/lib/memory/manager';
import { logger } from '@/lib/utils/logger';
import { CharacterState } from '@/types/memory';

// 必要な型定義を追加
interface ChapterInfo {
  chapter: {
    chapterNumber: number;
    title: string;
    content: string;
    summary?: string;
    [key: string]: any;
  };
  characterState: Map<string, CharacterState>;
  keyPhrases: string[];
  timestamp: string;
}

/**
 * 短期記憶（ImmediateContext）の内容を取得するデバッグAPI
 * 
 * @param request APIリクエスト
 * @returns 短期記憶データのJSON
 */
export async function GET(request: NextRequest) {
  try {
    // クエリパラメータの取得
    const url = new URL(request.url);
    const chapterNumber = url.searchParams.get('chapter') ? 
      parseInt(url.searchParams.get('chapter')!, 10) : undefined;
    const full = url.searchParams.get('full') === 'true';
    
    // MemoryManagerが初期化されているか確認
    if (!await memoryManager.isInitialized()) {
      await memoryManager.initialize();
    }
    
    // ImmediateContextの取得
    const immediateContext = memoryManager.getShortTermMemory();
    
    // リクエストの詳細をログに記録
    logger.info('ImmediateContext debug API called', { 
      chapterNumber, 
      full,
      timestamp: new Date().toISOString()
    });
    
    let result: Record<string, any> = {};
    
    if (chapterNumber !== undefined) {
      // 特定の章の情報を取得
      const chapter = await immediateContext.getChapter(chapterNumber);
      
      if (!chapter) {
        return NextResponse.json(
          { error: `Chapter ${chapterNumber} not found in immediate context` },
          { status: 404 }
        );
      }
      
      // 章の情報を取得
      const chapterInfo = await immediateContext.getChapterInfo(chapterNumber);
      
      // CharacterStateMapをオブジェクトの配列に変換
      const characterStates = chapterInfo?.characterState ? 
        Array.from(chapterInfo.characterState.entries()).map(entry => {
          const [characterName, state] = entry as [string, CharacterState];
          return {
            characterName, // 'name'ではなく'characterName'として追加
            ...state       // stateにもnameプロパティがあるかもしれないので注意
          };
        }) : [];
      
      result = {
        chapterNumber,
        chapter: full ? chapter : { 
          title: chapter.title,
          summary: chapter.summary || chapter.content.substring(0, 200) + '...',
          contentLength: chapter.content.length
        },
        characterStates,  // 変更: characterState -> characterStates
        keyPhrases: chapterInfo?.keyPhrases || [],
        timestamp: chapterInfo?.timestamp || null
      };
      
    } else {
      // 全ての章の概要情報を取得
      const recentChapters = await immediateContext.getRecentChapters();
      const status = await immediateContext.getStatus();
      
      result = {
        status,
        chapterCount: recentChapters.length,
        chapters: recentChapters.map((info: ChapterInfo) => ({
          chapterNumber: info.chapter.chapterNumber,
          title: info.chapter.title,
          contentPreview: info.chapter.content.substring(0, 100) + '...',
          characterCount: info.characterState ? info.characterState.size : 0,
          keyPhraseCount: info.keyPhrases ? info.keyPhrases.length : 0,
          timestamp: info.timestamp
        }))
      };
      
      // フルデータが要求された場合
      if (full) {
        // 繰り返し表現情報も取得
        const repeatedPhrases = await immediateContext.getRepeatedPhrases(2);
        result.repeatedPhrases = repeatedPhrases;
        
        // 章ごとのフルデータも含める（注意: データ量が多い場合はパフォーマンスに影響）
        if (recentChapters.length > 0) {
          result.chaptersDetail = await Promise.all(
            recentChapters.map(async (info: ChapterInfo) => {
              // キャラクター状態をMap→配列に変換（型を明示的に指定）
              const characterEntries = Array.from(info.characterState.entries());
              const characterStates = characterEntries.map(entry => {
                const [characterName, state] = entry as [string, CharacterState];
                return {
                  characterName, // 'name'ではなく'characterName'として追加
                  ...state       // stateにもnameプロパティがあるので注意
                };
              });
              
              return {
                chapterNumber: info.chapter.chapterNumber,
                title: info.chapter.title,
                characterStates,
                keyPhrases: info.keyPhrases,
                timestamp: info.timestamp
              };
            })
          );
        }
      }
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    logger.error('Error in immediate context debug API', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to retrieve immediate context data', details: String(error) },
      { status: 500 }
    );
  }
}