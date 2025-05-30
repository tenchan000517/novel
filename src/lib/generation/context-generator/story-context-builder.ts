// src\lib\generation\context-generator\story-context-builder.ts

/**
 * @fileoverview ストーリーコンテキスト構築モジュール
 * @description
 * このファイルは、短期記憶と中期記憶からストーリーコンテキスト情報を構築します。
 * 統合されたコンテキスト情報を整形されたテキストとして提供します。
 */

import { KeyEvent, ChapterMemory } from '@/types/memory';
import { logger } from '@/lib/utils/logger';

/**
 * ストーリーコンテキストビルダークラス
 * 短期記憶と中期記憶から物語のコンテキスト情報を構築する
 */
export class StoryContextBuilder {
    /**
     * コンストラクタ
     */
    constructor() {}

    /**
     * ストーリーコンテキストの構築
     * 
     * 短期記憶と中期記憶から物語のコンテキスト情報を構築します。
     * 
     * @param shortTermMemory 短期記憶
     * @param midTermMemory 中期記憶
     * @param summaryDetailLevel 要約詳細レベル（オプション）
     * @returns ストーリーコンテキスト（マークダウン形式のテキスト）
     */
    buildStoryContext(shortTermMemory: any, midTermMemory: any, summaryDetailLevel?: number): string {
        try {
            let storyContext = '';

            // 詳細レベルの設定（未指定の場合は7を使用）
            const detailLevel = summaryDetailLevel !== undefined ? summaryDetailLevel : 7;

            // 中期記憶（アーク情報）
            if (midTermMemory && midTermMemory.currentArc) {
                storyContext += `# 現在のアーク: ${midTermMemory.currentArc.theme || '未定義'}\n`;

                if (midTermMemory.currentArc.summary) {
                    storyContext += `${midTermMemory.currentArc.summary}\n\n`;
                }

                // 詳細レベルが高い場合は、詳細な情報を追加
                if (detailLevel >= 6 && midTermMemory.keyEvents && midTermMemory.keyEvents.length > 0) {
                    storyContext += '## 重要イベント:\n';

                    // 詳細レベルに応じてイベント数を制限
                    const eventsToShow = detailLevel >= 9 ? 
                        midTermMemory.keyEvents.length : 
                        Math.min(midTermMemory.keyEvents.length, Math.floor(detailLevel / 2));
                    
                    midTermMemory.keyEvents.slice(0, eventsToShow).forEach((event: KeyEvent) => {
                        storyContext += `- ${event.event} (${event.chapter}章)\n`;
                    });

                    storyContext += '\n';
                }
            }

            // 短期記憶（最近のチャプター）
            if (shortTermMemory && shortTermMemory.chapters && shortTermMemory.chapters.length > 0) {
                const recentChapters = shortTermMemory.chapters;

                storyContext += '# 最近のチャプター\n';

                // 詳細レベルに応じてチャプター数を調整
                const chaptersToShow = detailLevel >= 8 ? 
                    recentChapters.length : 
                    Math.min(recentChapters.length, Math.ceil(detailLevel / 2));
                
                // 古いものから新しいものへ順番に（最新のチャプターは必ず含める）
                const selectedChapters = recentChapters.length > chaptersToShow ? 
                    [...recentChapters.slice(-(chaptersToShow))] : 
                    recentChapters;
                
                selectedChapters.forEach((chapter: ChapterMemory) => {
                    storyContext += `## チャプター${chapter.chapter}\n`;
                    
                    // 詳細レベルに応じて要約の長さを調整
                    if (chapter.summary) {
                        if (detailLevel >= 9) {
                            storyContext += `${chapter.summary}\n\n`;
                        } else {
                            // 詳細レベルに応じて要約を簡略化
                            const summaryLines = chapter.summary.split('\n');
                            const linesToShow = Math.max(1, Math.min(summaryLines.length, detailLevel - 3));
                            storyContext += `${summaryLines.slice(0, linesToShow).join('\n')}\n\n`;
                        }
                    } else {
                        storyContext += `要約なし\n\n`;
                    }

                    // 詳細レベルが高い場合は重要イベントも表示
                    if (detailLevel >= 7 && chapter.key_events && chapter.key_events.length > 0) {
                        storyContext += '### 重要な出来事:\n';
                        
                        // 詳細レベルに応じてイベント数を制限
                        const eventsToShow = detailLevel >= 9 ? 
                            chapter.key_events.length : 
                            Math.min(chapter.key_events.length, detailLevel - 5);
                        
                        chapter.key_events.slice(0, eventsToShow).forEach((event: KeyEvent) => {
                            storyContext += `- ${event.event}\n`;
                        });
                        storyContext += '\n';
                    }
                });
            }

            return storyContext;
        } catch (error) {
            logger.error('Failed to build story context', {
                error: error instanceof Error ? error.message : String(error)
            });
            return '# ストーリーコンテキスト生成エラー\n物語の新しい章を展開します。';
        }
    }

    /**
     * 統合コンテキストからストーリーコンテキストを構築
     * 
     * MemoryManagerから提供される統合コンテキストから物語コンテキストを構築します。
     * 詳細レベルに応じて表示内容を調整します。
     * 
     * @param integratedContext 統合コンテキスト
     * @param detailLevel 詳細レベル ('minimal', 'standard', 'detailed')
     * @returns ストーリーコンテキスト（整形されたテキスト）
     */
    buildStoryContextFromIntegrated(
      integratedContext: any,
      detailLevelStr: string = 'standard'
    ): string {
      try {
        // 短期記憶（最近の章）から要約を構築
        const recentChapters = integratedContext.recentChapters || [];
        let recentSummaries = '';
        
        if (recentChapters.length > 0) {
          recentSummaries = '【直近の章のあらすじ】\n' + 
            recentChapters
              .sort((a: any, b: any) => a.chapter - b.chapter)
              .map((chapter: any) => `第${chapter.chapter}章: ${chapter.summary || '要約なし'}`)
              .join('\n\n');
        }
        
        // 重要イベントの要約
        const keyEvents = integratedContext.keyEvents || [];
        let keyEventsSummary = '';
        
        if (keyEvents.length > 0) {
          keyEventsSummary = '【重要イベント】\n' + 
            keyEvents
              .map((event: any) => `- ${event.event} (チャプター${event.chapter})`)
              .join('\n');
        }
        
        // 現在のアーク情報
        const arcInfo = integratedContext.arc;
        let arcSummary = '';
        
        if (arcInfo) {
          arcSummary = '【現在のアーク】\n' +
            `テーマ: ${arcInfo.theme || '不明'}\n` +
            `章範囲: ${arcInfo.chapter_range?.start || '?'} - ${arcInfo.chapter_range?.end !== -1 ? arcInfo.chapter_range?.end : '現在進行中'}\n`;
          
          if (arcInfo.turningPoints && arcInfo.turningPoints.length > 0) {
            arcSummary += '主要転機:\n' + 
              arcInfo.turningPoints
                .map((tp: any) => `- ${tp.event} (チャプター${tp.chapter})`)
                .join('\n');
          }
        }
        
        // 詳細レベルに応じて情報量を調整
        let detailLevel = 'standard';
        if (detailLevelStr) {
          if (typeof detailLevelStr === 'string') {
            // 文字列の場合はそのまま使用
            detailLevel = detailLevelStr.toLowerCase();
          } else if (typeof detailLevelStr === 'number') {
            // 数値の場合は変換
            if (detailLevelStr <= 3) detailLevel = 'minimal';
            else if (detailLevelStr >= 8) detailLevel = 'detailed';
            else detailLevel = 'standard';
          }
        }
        
        let finalContext = '';
        
        switch (detailLevel) {
          case 'minimal':
            // 最小限の情報だけ
            finalContext = recentChapters.length > 0 ? 
              `最新のチャプター: ${recentChapters[recentChapters.length - 1]?.summary || '要約なし'}` : 
              'ストーリーの始まり';
            break;
            
          case 'detailed':
            // 詳細な情報をすべて含める
            finalContext = [
              recentSummaries,
              keyEventsSummary,
              arcSummary
            ].filter(Boolean).join('\n\n');
            break;
            
          case 'standard':
          default:
            // 標準レベルの情報量
            finalContext = [
              recentSummaries,
              keyEventsSummary && keyEvents.length > 2 ? keyEventsSummary : '',
              arcInfo ? `現在のアークテーマ: ${arcInfo.theme || '不明'}` : ''
            ].filter(Boolean).join('\n\n');
        }
        
        return finalContext;
      } catch (error) {
        logger.error('Failed to build story context from integrated data', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        
        // エラー時は最小限のコンテキストを返す
        return 'ストーリーの新たな章を展開します。';
      }
    }
}