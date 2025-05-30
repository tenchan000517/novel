// src\app\api\generation\chapter\route.ts

/**
 * @fileoverview 小説の章生成と状態確認を担当するAPI Route
 * @description このファイルは、AIを用いて小説の新しい章を生成するためのエンドポイントと
 * 生成システムの状態を確認するためのエンドポイントを提供します。
 * POSTメソッドでは、クライアントからのリクエストを受け取り、GenerationEngineを使用して
 * 指定された章番号に基づいて小説の章を生成します。生成された章はValidationSystemによって
 * 品質検証され、検証に合格した場合または強制生成フラグが設定されている場合に結果を返します。
 * また、生成された章はMemoryManagerを通じて記憶システムに保存され、物語の一貫性維持に
 * 利用されます。
 * GETメソッドでは、生成システムとメモリシステムの現在の状態を取得できます。
 * 
 * @requires next/server
 * @requires @/lib/generation/engine
 * @requires @/lib/memory/manager
 * @requires @/lib/validation/system
 * @requires @/types/generation
 * @requires @/lib/utils/logger
 * @requires @/types/validation
 * @requires @/lib/utils/error-handler
 */
import { NextRequest, NextResponse } from 'next/server';
import { GenerationEngine } from '@/lib/generation/engine';
import { MemoryManager } from '@/lib/memory/manager';
import { ValidationSystem } from '@/lib/validation/system';
import { GenerateChapterRequest, GenerateChapterResponse } from '@/types/generation';
import { logger } from '@/lib/utils/logger';
import { ValidationCheck } from '@/types/validation';
import { GenerationError, ValidationError, formatErrorResponse } from '@/lib/utils/error-handler';

// シングルトンインスタンス
const generationEngine = new GenerationEngine();
const memoryManager = new MemoryManager();
const validationSystem = new ValidationSystem();

/**
 * 章生成エンドポイントのPOSTリクエストを処理する関数
 * 
 * @async
 * @param {NextRequest} request - Next.jsリクエストオブジェクト
 * @returns {Promise<NextResponse>} 生成結果またはエラー情報を含むJSONレスポンス
 * 
 * @description この関数はクライアントからのPOSTリクエストを処理し、
 * 新しい小説の章を生成します。リクエストからチャプター番号と生成オプションを抽出し、
 * パラメータのバリデーション（チャプター番号、目標文字数、テンション値、ペーシング値）を
 * 行った後、GenerationEngineを使用して章を生成します。生成された章はValidationSystemによって
 * 品質検証され、検証に合格するか強制生成フラグが有効な場合のみ結果を返します。
 * 生成された章はMemoryManagerによって記憶システムに統合されます。
 * 
 * @throws {ValidationError} チャプター番号や生成パラメータが無効な場合
 * @throws {GenerationError} 章の生成処理中にエラーが発生した場合
 * @throws {Error} その他の予期しないエラーが発生した場合
 * 
 * @example
 * // リクエスト例:
 * // POST /api/generation/chapter?chapterNumber=1
 * {
 *   "targetLength": 8000,
 *   "forcedGeneration": false,
 *   "overrides": {
 *     "tension": 0.8,
 *     "pacing": 0.6
 *   }
 * }
 * 
 * // 成功時のレスポンス例:
 * {
 *   "success": true,
 *   "data": {
 *     "chapter": {
 *       "id": "chapter-1",
 *       "title": "第1章",
 *       "chapterNumber": 1,
 *       "content": "章の本文テキスト...",
 *       "wordCount": 8000,
 *       "createdAt": "2025-05-05T10:00:00Z",
 *       "updatedAt": "2025-05-05T10:00:00Z",
 *       "summary": "この章では主人公が...",
 *       "scenes": [...],
 *       "analysis": {...},
 *       "metadata": {
 *         "pov": "主人公",
 *         "location": "東京",
 *         "timeframe": "現代",
 *         "emotionalTone": "希望に満ちた",
 *         "qualityScore": 85
 *       }
 *     },
 *     "metrics": {
 *       "generationTime": 5000,
 *       "qualityScore": 85,
 *       "correctionCount": 0
 *     }
 *   }
 * }
 * 
 * // バリデーションエラー時のレスポンス例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "Invalid chapter number"
 *   }
 * }
 * 
 * // 品質検証失敗時のレスポンス例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_FAILED",
 *     "message": "Generated chapter failed validation",
 *     "details": {
 *       "qualityScore": 45,
 *       "failedChecks": [
 *         {
 *           "name": "length",
 *           "message": "文字数: 5000 (目標: 8000±20%)",
 *           "severity": "HIGH"
 *         }
 *       ],
 *       "potentialSolutions": "Try adjusting the generation parameters or use forcedGeneration:true"
 *     }
 *   }
 * }
 * 
 * // 生成エラー時のレスポンス例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "GENERATION_ERROR",
 *     "message": "Failed to generate chapter"
 *   }
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Chapter generation request received');

    // リクエストの解析
    const requestData = await request.json() as GenerateChapterRequest;
    const chapterNumber = parseInt(request.nextUrl.searchParams.get('chapterNumber') || '1');

    logger.debug('Generation request details', { 
      chapterNumber, 
      targetLength: requestData.targetLength,
      forcedGeneration: requestData.forcedGeneration,
      overrides: requestData.overrides 
    });

    // リクエストの検証
    if (isNaN(chapterNumber) || chapterNumber < 1) {
      logger.warn('Invalid chapter number', { chapterNumber });
      throw new ValidationError('Invalid chapter number');
    }

    // 目標文字数の検証
    if (requestData.targetLength && (requestData.targetLength < 1000 || requestData.targetLength > 20000)) {
      logger.warn('Invalid target length', { targetLength: requestData.targetLength });
      throw new ValidationError('Target length must be between 1,000 and 20,000 characters');
    }

    // テンション値の検証
    if (requestData.overrides?.tension !== undefined && 
       (requestData.overrides.tension < 0 || requestData.overrides.tension > 1)) {
      logger.warn('Invalid tension value', { tension: requestData.overrides.tension });
      throw new ValidationError('Tension value must be between 0 and 1');
    }

    // ペーシング値の検証
    if (requestData.overrides?.pacing !== undefined && 
       (requestData.overrides.pacing < 0 || requestData.overrides.pacing > 1)) {
      logger.warn('Invalid pacing value', { pacing: requestData.overrides.pacing });
      throw new ValidationError('Pacing value must be between 0 and 1');
    }

    // 生成処理の開始時間
    const startTime = Date.now();

    // チャプター生成
    logger.info(`Generating chapter ${chapterNumber}`);
    const chapter = await generationEngine.generateChapter(chapterNumber, requestData);

    // 品質検証
    logger.info(`Validating chapter ${chapterNumber}`);
    const validation = await validationSystem.validateChapter(chapter);

    // 生成失敗の場合（強制生成フラグがない場合のみ）
    if (!validation.isValid && !requestData.forcedGeneration) {
      logger.warn(`Chapter ${chapterNumber} failed validation`, { 
        score: validation.qualityScore,
        issues: validation.checks.filter((c: ValidationCheck) => !c.passed).length,
        failedChecks: validation.checks.filter((c: ValidationCheck) => !c.passed).map(c => c.name)
      });

      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_FAILED', 
            message: 'Generated chapter failed validation', 
            details: {
              qualityScore: validation.qualityScore,
              failedChecks: validation.checks
                .filter((c: ValidationCheck) => !c.passed)
                .map(c => ({ name: c.name, message: c.message, severity: c.severity })),
              potentialSolutions: 'Try adjusting the generation parameters or use forcedGeneration:true'
            }
          } 
        },
        { status: 400 }
      );
    }

    // 章の品質スコアを更新
    chapter.metadata.qualityScore = validation.qualityScore;

    // 記憶更新
    logger.info(`Updating memory for chapter ${chapterNumber}`);
    await memoryManager.processChapter(chapter);

    // 生成時間
    const generationTime = Date.now() - startTime;
    logger.info(`Chapter ${chapterNumber} generated successfully`, { 
      generationTime,
      qualityScore: validation.qualityScore,
      contentLength: chapter.content.length
    });

    // レスポンスの構築
    const response: GenerateChapterResponse = {
      chapter,
      metrics: {
        generationTime,
        qualityScore: validation.qualityScore,
        correctionCount: 0 // このフェーズでは修正機能なし
      }
    };

    return NextResponse.json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    // エラーログ記録
    if (error instanceof GenerationError || error instanceof ValidationError) {
      logger.warn('Generation process error', {
        error: error.message,
        code: error instanceof GenerationError ? error.code : 'VALIDATION_ERROR'
      });
    } else {
      logger.error('Failed to generate chapter', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    // エラーレスポンスの構築
    const errorResponse = formatErrorResponse(error instanceof Error ? error : new Error(String(error)));
    const statusCode = error instanceof ValidationError ? 400 : 500;

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * 生成システムの状態確認用GETリクエストを処理する関数
 * 
 * @async
 * @param {NextRequest} request - Next.jsリクエストオブジェクト
 * @returns {Promise<NextResponse>} システム状態情報を含むJSONレスポンス
 * 
 * @description この関数はクライアントからのGETリクエストを処理し、
 * 生成システムとメモリシステムの現在の状態を取得して返します。
 * GenerationEngineの状態（APIキーの有効性、使用モデル情報など）と
 * MemoryManagerの状態（メモリシステムの初期化状態、各記憶層の情報など）を
 * 取得し、クライアントに提供します。
 * 
 * @throws {Error} 状態取得処理中にエラーが発生した場合
 * 
 * @example
 * // リクエスト例:
 * // GET /api/generation/chapter
 * 
 * // 成功時のレスポンス例:
 * {
 *   "success": true,
 *   "data": {
 *     "generation": {
 *       "apiKeyValid": true,
 *       "model": "gemini-pro",
 *       "maxRetries": 3
 *     },
 *     "memory": {
 *       "initialized": true,
 *       "shortTerm": {
 *         "entryCount": 5,
 *         "lastUpdateTime": "2025-05-05T10:00:00Z"
 *       },
 *       "midTerm": {
 *         "entryCount": 2,
 *         "lastUpdateTime": "2025-05-05T09:30:00Z",
 *         "currentArc": {
 *           "number": 1,
 *           "name": "冒険の始まり"
 *         }
 *       },
 *       "longTerm": {
 *         "initialized": true,
 *         "lastCompressionTime": "2025-05-04T18:00:00Z"
 *       }
 *     }
 *   }
 * }
 * 
 * // エラー時のレスポンス例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "STATUS_ERROR",
 *     "message": "Failed to get generation system status"
 *   }
 * }
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Generation system status check requested');

    // システム状態の取得
    const status = await generationEngine.checkStatus();
    const memoryStatus = await memoryManager.getStatus();

    logger.info('Generation system status check completed', { 
      apiKeyValid: status.apiKeyValid,
      model: status.modelInfo.model
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        generation: {
          apiKeyValid: status.apiKeyValid,
          model: status.modelInfo.model,
          maxRetries: status.modelInfo.maxRetries
        },
        memory: memoryStatus
      }
    });
  } catch (error) {
    logger.error('Failed to get generation system status', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'STATUS_ERROR', 
          message: (error as Error).message || 'Failed to get generation system status' 
        } 
      },
      { status: 500 }
    );
  }
}