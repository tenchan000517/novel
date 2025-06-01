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
 * @requires @/lib/parameters
 */
import { NextRequest, NextResponse } from 'next/server';
import { generationEngine } from '@/lib/generation/engine';
import { memoryManager } from '@/lib/memory/manager';
import { ValidationSystem } from '@/lib/validation/system';
import { GenerateChapterRequest, GenerateChapterResponse } from '@/types/generation';
import { logger } from '@/lib/utils/logger';
import { ValidationCheck } from '@/types/validation';
import { GenerationError, ValidationError, formatErrorResponse } from '@/lib/utils/error-handler';
import { chapterStorage } from '@/lib/storage';
import { parameterManager } from '@/lib/parameters'; // パラメータマネージャーをインポート

import { plotManager } from '@/lib/plot';
import { PlotMode } from '@/lib/plot/types';

// シングルトンインスタンス
// const generationEngine = new GenerationEngine();
// const memoryManager = new MemoryManager();
const validationSystem = new ValidationSystem();

// パラメータマネージャーの初期化
async function initializeParameterManager() {
  try {
    // パラメータマネージャーを初期化（すでに初期化済みなら内部でスキップされる）
    await parameterManager.initialize();
    logger.info('Parameter manager initialized in API route');
  } catch (error) {
    logger.warn('Failed to initialize parameter manager in API route', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

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

    // パラメータマネージャーの初期化
    await initializeParameterManager();

    // システムパラメータの取得
    const params = parameterManager.getParameters();

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

    // 目標文字数の検証（パラメータマネージャーの値を参照）
    const requestTargetLength = requestData.targetLength || params.generation.targetLength;
    const minLength = params.generation.minLength;
    const maxLength = params.generation.maxLength;

    if (requestTargetLength < minLength || requestTargetLength > maxLength) {
      logger.warn('Invalid target length', {
        targetLength: requestTargetLength,
        validRange: `${minLength}-${maxLength}`
      });
      throw new ValidationError(`Target length must be between ${minLength} and ${maxLength} characters`);
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

    // チャプターの存在確認（重複生成防止）
    const chapterExists = await chapterStorage.chapterExists(chapterNumber);
    if (chapterExists && !requestData.forcedGeneration) {
      logger.warn(`Chapter ${chapterNumber} already exists and forcedGeneration is not enabled`);
      throw new ValidationError(`Chapter ${chapterNumber} already exists. Use forcedGeneration:true to override.`);
    }

    // 生成処理の開始時間
    const startTime = Date.now();

    // チャプター生成
    logger.info(`Generating chapter ${chapterNumber}`);
    const chapter = await generationEngine.generateChapter(chapterNumber, requestData);

    // 品質検証
    logger.info(`Validating chapter ${chapterNumber}`);
    // ValidationSystemが追加のパラメータを受け入れられない場合は、
    // パラメータに基づいてValidationSystemの設定を事前に更新する方法を検討
    validationSystem.setValidationParameters({
      consistencyThreshold: params.memory.consistencyThreshold,
      minLength: params.generation.minLength,
      maxLength: params.generation.maxLength
    });
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
    // await memoryManager.processChapter(chapter);

    // // 現在のプロット情報を取得（レスポンス用）
    // const currentPlotContext = await plotManager.buildPlotContext(chapterNumber);
    // const nextPlotContext = await plotManager.buildPlotContext(chapterNumber + 1);

    // const plotInfo = {
    //   mode: chapter.analysis?.plotConsistency?.consistent ? 'CONSISTENT' : 'ISSUES_DETECTED',
    //   currentArc: currentPlotContext.currentArc.name,
    //   currentTheme: currentPlotContext.currentArc.theme,
    //   shortTermGoals: currentPlotContext.shortTermGoals,
    //   nextExpectedEvent: nextPlotContext.shortTermGoals[0]
    // };

    // チャプターの保存
    logger.info(`Saving chapter ${chapterNumber} to storage`);
    const savedFilePath = await chapterStorage.saveChapter(chapter);
    logger.info(`Chapter ${chapterNumber} saved successfully`, { path: savedFilePath });

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
      },
      // plotInfo // プロット情報を追加
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
 * パラメータマネージャーの状態も含めてより詳細な情報を提供します。
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
 *       "maxRetries": 3,
 *       "parameters": {
 *         "targetLength": 8000,
 *         "temperature": 0.7,
 *         ...
 *       }
 *     },
 *     "memory": {
 *       "initialized": true,
 *       "shortTerm": {
 *         "entryCount": 5,
 *         "lastUpdateTime": "2025-05-05T10:00:00Z"
 *       },
 *       ...
 *     },
 *     "chapters": {
 *       "latestChapterNumber": 3,
 *       "totalChapters": 3,
 *       ...
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

    // パラメータマネージャーの初期化
    await initializeParameterManager();

    // システム状態の取得
    const status = await generationEngine.checkStatus();
    const memoryStatus = await memoryManager.getStatus();

    // パラメータ情報の取得
    const parameters = parameterManager.getParameters();
    const presets = parameterManager.getPresetDetails ? parameterManager.getPresetDetails() : [];

    // チャプター情報の取得
    const latestChapterNumber = await chapterStorage.getLatestChapterNumber();
    const chaptersList = await chapterStorage.listAllChapters();

    logger.info('Generation system status check completed', {
      apiKeyValid: status.apiKeyValid,
      model: status.modelInfo.model,
      latestChapter: latestChapterNumber,
      parametersLoaded: !!parameters
    });

    return NextResponse.json({
      success: true,
      data: {
        generation: {
          apiKeyValid: status.apiKeyValid,
          model: status.modelInfo.model,
          maxRetries: status.modelInfo.maxRetries,
          parameters: parameters
        },
        memory: memoryStatus,
        chapters: {
          latestChapterNumber,
          totalChapters: chaptersList.length,
          chaptersList: chaptersList.map(c => ({
            number: c.number,
            title: c.title,
            createdAt: c.createdAt
          }))
        },
        parameters: {
          initialized: !!parameters,
          currentPreset: presets.find(p => p.isDefault)?.name || 'default',
          availablePresets: presets.map(p => p.name) || []
        }
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

/**
 * パラメータ管理用PUTリクエストを処理する関数
 * 
 * @async
 * @param {NextRequest} request - Next.jsリクエストオブジェクト
 * @returns {Promise<NextResponse>} パラメータ更新結果を含むJSONレスポンス
 * 
 * @description この関数はクライアントからのPUTリクエストを処理し、
 * 生成パラメータを更新します。パラメータの更新やプリセットの適用を行い、
 * 更新結果をクライアントに返します。
 * 
 * @throws {ValidationError} パラメータ更新リクエストが無効な場合
 * @throws {Error} パラメータ更新処理中にエラーが発生した場合
 * 
 * @example
 * // リクエスト例 - パラメータ更新:
 * // PUT /api/generation/chapter
 * {
 *   "action": "updateParameter",
 *   "path": "generation.temperature",
 *   "value": 0.8
 * }
 * 
 * // リクエスト例 - プリセット適用:
 * // PUT /api/generation/chapter
 * {
 *   "action": "applyPreset",
 *   "presetName": "高テンション設定"
 * }
 * 
 * // 成功時のレスポンス例:
 * {
 *   "success": true,
 *   "data": {
 *     "message": "Parameters updated successfully",
 *     "updatedParameters": {
 *       "generation": {
 *         "temperature": 0.8,
 *         ...
 *       },
 *       ...
 *     }
 *   }
 * }
 * 
 * // エラー時のレスポンス例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "Invalid parameter path"
 *   }
 * }
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Parameter update request received');

    // パラメータマネージャーの初期化
    await initializeParameterManager();

    // リクエストの解析
    const requestData = await request.json();

    if (!requestData.action) {
      throw new ValidationError('Action is required');
    }

    // リクエストタイプに応じた処理
    if (requestData.action === 'updateParameter') {
      // パラメータ更新
      if (!requestData.path) {
        throw new ValidationError('Parameter path is required');
      }

      if (requestData.value === undefined) {
        throw new ValidationError('Parameter value is required');
      }

      logger.info(`Updating parameter ${requestData.path}`, { value: requestData.value });
      parameterManager.updateParameter(requestData.path, requestData.value);

      // 更新されたパラメータを取得
      const updatedParameters = parameterManager.getParameters();

      return NextResponse.json({
        success: true,
        data: {
          message: "Parameters updated successfully",
          updatedParameters
        }
      });

    } else if (requestData.action === 'applyPreset') {
      // プリセット適用
      if (!requestData.presetName) {
        throw new ValidationError('Preset name is required');
      }

      logger.info(`Applying preset ${requestData.presetName}`);
      const result = parameterManager.applyPreset(requestData.presetName);

      if (!result) {
        throw new ValidationError(`Preset '${requestData.presetName}' not found`);
      }

      // 適用後のパラメータを取得
      const updatedParameters = parameterManager.getParameters();

      return NextResponse.json({
        success: true,
        data: {
          message: `Preset '${requestData.presetName}' applied successfully`,
          updatedParameters
        }
      });

    } else if (requestData.action === 'savePreset') {
      // プリセット保存
      if (!requestData.presetName) {
        throw new ValidationError('Preset name is required');
      }

      logger.info(`Saving current parameters as preset '${requestData.presetName}'`);
      const result = await parameterManager.saveAsPreset(
        requestData.presetName,
        requestData.description || `プリセット: ${requestData.presetName}`
      );

      if (!result) {
        throw new ValidationError(`Failed to save preset '${requestData.presetName}'`);
      }

      // 利用可能なプリセット一覧を取得
      const presets = parameterManager.getPresetDetails ? parameterManager.getPresetDetails() : [];

      return NextResponse.json({
        success: true,
        data: {
          message: `Preset '${requestData.presetName}' saved successfully`,
          availablePresets: presets.map(p => p.name) || []
        }
      });

    } else if (requestData.action === 'resetToDefaults') {
      // デフォルト設定にリセット
      logger.info('Resetting parameters to defaults');
      parameterManager.resetToDefaults();

      // リセット後のパラメータを取得
      const defaultParameters = parameterManager.getParameters();

      return NextResponse.json({
        success: true,
        data: {
          message: "Parameters reset to defaults",
          parameters: defaultParameters
        }
      });

    } else {
      throw new ValidationError(`Unknown action: ${requestData.action}`);
    }

  } catch (error) {
    // エラーログ記録
    logger.error('Failed to update parameters', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    // エラーレスポンスの構築
    const errorResponse = formatErrorResponse(error instanceof Error ? error : new Error(String(error)));
    const statusCode = error instanceof ValidationError ? 400 : 500;

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}