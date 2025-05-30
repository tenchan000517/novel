/**
 * @fileoverview src\app\api\correction\route.ts
 * 
 * @description
 * チャプターの自動修正を行うAPIエンドポイント。
 * このファイルはNext.jsのAPIルートとして機能し、チャプターの自動修正処理と
 * 修正履歴の取得機能を提供します。
 * 
 * 提供されるエンドポイント:
 * - POST: チャプターの自動修正を実行
 * - GET: チャプターの修正履歴と統計情報を取得
 * 
 * @requires next/server
 * @requires @/lib/correction/auto-correction
 * @requires @/lib/utils/logger
 * @requires @/lib/storage
 * @requires @/lib/utils/yaml-helper
 * @requires @/types/correction
 * @requires @/types/chapters
 */

import { NextResponse } from 'next/server';
import { AutoCorrectionSystem } from '@/lib/correction/auto-correction';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { parseYaml, stringifyYaml } from '@/lib/utils/yaml-helper';
import { CorrectionHistoryEntry } from '@/types/correction';
import { Chapter } from '@/types/chapters';

/**
 * 自動修正システムのシングルトンインスタンス
 * このインスタンスはAPIエンドポイント間で共有され、チャプターの修正処理を行います
 * @type {AutoCorrectionSystem}
 */
const correctionSystem = new AutoCorrectionSystem();

/**
 * POST APIハンドラー - チャプターの自動修正を実行
 * 
 * @async
 * @function POST
 * @param {Request} request - HTTPリクエストオブジェクト
 * @returns {Promise<NextResponse>} 修正結果を含むJSON応答
 * 
 * @description
 * チャプターIDまたはコンテンツを受け取り、自動修正システムを使用して
 * チャプターの修正を行います。ドライラン（修正のシミュレーション）も
 * サポートしています。
 * 
 * @example
 * // リクエストボディ
 * {
 *   "chapterId": "123",  // チャプターID（任意、contentと排他）
 *   "content": "...",    // チャプターコンテンツ（任意、chapterIdと排他）
 *   "dryRun": true       // ドライラン実行フラグ（任意）
 * }
 * 
 * // 成功レスポンス
 * {
 *   "success": true,
 *   "data": {
 *     "originalChapter": { ... },
 *     "correctedChapter": { ... },
 *     "issues": [ ... ],
 *     "corrections": [ ... ],
 *     "statistics": { ... }
 *   }
 * }
 */
export async function POST(request: Request) {
  try {
    const { chapterId, content, dryRun } = await request.json();
    
    // パラメータ検証
    if (!chapterId && !content) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Either chapterId or content must be provided'
          }
        },
        { status: 400 }
      );
    }
    
    let chapter: Chapter | null = null;
    
    // IDからチャプター読み込み
    if (chapterId) {
      chapter = await loadChapter(chapterId);
      
      if (!chapter) {
        return NextResponse.json(
          { 
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `Chapter with ID ${chapterId} not found`
            }
          },
          { status: 404 }
        );
      }
    }
    // コンテンツから直接
    else {
      chapter = {
        id: 'temp-' + Date.now(),
        title: 'Temporary Chapter',
        chapterNumber: 0,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          pov: '',
          location: '',
          timeframe: '',
          qualityScore: 0
        }
      } satisfies Chapter;
    }
    
    // この時点でchapterはnullではないことが確定
    
    // 自動修正実行
    const result = await correctionSystem.correctChapter(chapter);
    
    // ドライランでなければ修正を保存
    if (chapterId && !dryRun) {
      await saveChapter(chapterId, result.correctedChapter);
      logger.info(`Applied ${result.appliedCorrections.length} corrections to chapter ${chapterId}`);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        originalChapter: {
          id: chapter.metadata.id,
          title: chapter.metadata.title,
          length: chapter.content.length,
        },
        correctedChapter: {
          id: result.correctedChapter.metadata.id,
          title: result.correctedChapter.metadata.title,
          length: result.correctedChapter.content.length,
        },
        issues: result.issues.map(issue => ({
          type: issue.type,
          description: issue.description,
          severity: issue.severity,
        })),
        corrections: result.appliedCorrections.map(correction => ({
          type: correction.type,
          description: correction.description,
          severity: correction.severity,
        })),
        statistics: {
          issueCount: result.issues.length,
          correctionCount: result.appliedCorrections.length,
          rejectedCount: result.rejectedCorrections.length,
          changePercentage: calculateChangePercentage(chapter.content, result.correctedChapter.content),
        }
      }
    });
  } catch (error) {
    logger.error('Failed to apply auto correction', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'CORRECTION_ERROR',
          message: 'Failed to apply auto correction'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * GET APIハンドラー - チャプターの修正情報を取得
 * 
 * @async
 * @function GET
 * @param {Request} request - HTTPリクエストオブジェクト
 * @returns {Promise<NextResponse>} チャプター情報と修正統計を含むJSON応答
 * 
 * @description
 * チャプターIDを受け取り、そのチャプターの修正履歴や統計情報を取得します。
 * 修正履歴からは合計修正数、最終修正日時、修正タイプの集計、修正履歴の時系列を
 * 提供します。
 * 
 * @example
 * // URLクエリパラメータ
 * // GET /api/correction?chapterId=123
 * 
 * // 成功レスポンス
 * {
 *   "success": true,
 *   "data": {
 *     "chapter": { ... },
 *     "correctionStats": {
 *       "totalCorrections": 10,
 *       "lastCorrected": "2023-05-01T12:34:56Z",
 *       "issueTypes": { ... },
 *       "history": [ ... ]
 *     }
 *   }
 * }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');
    
    if (!chapterId) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'chapterId is required'
          }
        },
        { status: 400 }
      );
    }
    
    // チャプター読み込み
    const chapter = await loadChapter(chapterId);
    
    if (!chapter) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Chapter with ID ${chapterId} not found`
          }
        },
        { status: 404 }
      );
    }
    
    // 修正履歴を取得
    const correctionHistory = chapter.metadata.correctionHistory || [];
    
    // 修正統計
    const correctionStats = {
      totalCorrections: correctionHistory.reduce(
        (sum: number, entry: CorrectionHistoryEntry) => sum + (entry.corrections?.length || 0), 
        0
      ),
      lastCorrected: chapter.metadata.lastCorrected,
      issueTypes: getCorrectionTypeCounts(correctionHistory),
      history: correctionHistory.map((entry: CorrectionHistoryEntry) => ({
        timestamp: entry.timestamp,
        correctionCount: entry.corrections?.length || 0,
      }))
    };
    
    logger.info(`Retrieved correction history for chapter ${chapterId}`);
    
    return NextResponse.json({
      success: true,
      data: {
        chapter: {
          id: chapter.metadata.id,
          title: chapter.metadata.title,
          number: chapter.metadata.number,
          length: chapter.content.length,
        },
        correctionStats
      }
    });
  } catch (error) {
    logger.error('Failed to get correction history', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to get correction history'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * YAMLファイルからチャプターをロードする
 * 
 * @async
 * @function loadChapter
 * @param {string} chapterId - ロードするチャプターのID
 * @returns {Promise<Chapter | null>} ロードされたチャプター、存在しない場合はnull
 * 
 * @description
 * 指定されたIDに対応するチャプターをYAMLファイルからロードします。
 * ファイルパスは `chapters/chapter-${chapterId}.yaml` の形式で、
 * ストレージプロバイダーを通じてアクセスします。
 */
async function loadChapter(chapterId: string): Promise<Chapter | null> {
  try {
    const filePath = `chapters/chapter-${chapterId}.yaml`;
    const content = await storageProvider.readFile(filePath);
    return parseYaml(content) as Chapter;
  } catch (error) {
    logger.warn(`Failed to load chapter ${chapterId}`, {
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

/**
 * チャプターをYAMLファイルに保存する
 * 
 * @async
 * @function saveChapter
 * @param {string} chapterId - 保存するチャプターのID
 * @param {Chapter} chapter - 保存するチャプターオブジェクト
 * @returns {Promise<boolean>} 保存が成功したかどうか
 * 
 * @description
 * 指定されたチャプターをYAMLファイルに保存します。
 * ファイルパスは `chapters/chapter-${chapterId}.yaml` の形式で、
 * 保存前にチャプターの更新日時を現在時刻に更新します。
 */
async function saveChapter(chapterId: string, chapter: Chapter): Promise<boolean> {
  try {
    const filePath = `chapters/chapter-${chapterId}.yaml`;
    // 更新日時の更新
    chapter.metadata.updatedAt = new Date();
    const content = stringifyYaml(chapter);
    await storageProvider.writeFile(filePath, content);
    logger.debug(`Saved corrected chapter ${chapterId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to save chapter ${chapterId}`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return false;
  }
}

/**
 * テキストの変更率を計算する
 * 
 * @function calculateChangePercentage
 * @param {string} original - 元のテキスト
 * @param {string} corrected - 修正後のテキスト 
 * @returns {number} 変更率（パーセンテージ）
 * 
 * @description
 * 元のテキストと修正後のテキストの差異を計算し、
 * 変更率をパーセンテージで返します。
 * 現実装では文字数の変化率を計算しています。
 */
function calculateChangePercentage(original: string, corrected: string): number {
  // 簡易実装: 文字数の変化率
  const lengthDiff = Math.abs(corrected.length - original.length);
  return (lengthDiff / original.length) * 100;
}

/**
 * 修正タイプごとのカウントを取得する
 * 
 * @function getCorrectionTypeCounts
 * @param {CorrectionHistoryEntry[]} history - 修正履歴エントリーの配列
 * @returns {Record<string, number>} 修正タイプをキー、カウントを値とするオブジェクト
 * 
 * @description
 * 修正履歴エントリーから、各修正タイプの出現回数を集計します。
 * 結果は修正タイプをキー、出現回数を値とするオブジェクトです。
 */
function getCorrectionTypeCounts(history: CorrectionHistoryEntry[]): Record<string, number> {
  const typeCounts: Record<string, number> = {};
  
  for (const entry of history) {
    for (const correction of (entry.corrections || [])) {
      const type = correction.type;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }
  }
  
  return typeCounts;
}