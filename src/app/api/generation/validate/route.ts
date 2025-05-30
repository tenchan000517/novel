// src\app\api\generation\validate\route.ts

/**
 * @fileoverview 小説チャプター検証APIエンドポイント
 * @description このファイルは小説のチャプター内容を検証し、品質メトリクスや問題点、改善提案を提供するAPIエンドポイントを実装しています。
 * @requires next/server
 * @requires @/lib/validation/system
 * @requires @/types/generation
 * @requires @/types/validation
 * @requires @/lib/utils/logger
 * @requires @/types/chapters
 * @requires @/lib/utils/error-handler
 */

import { NextRequest, NextResponse } from 'next/server';
import { ValidationSystem } from '@/lib/validation/system';
import { 
  ValidateChapterRequest, 
  ValidateChapterResponse,
  QualityMetrics
} from '@/types/generation';
import { ValidationIssue, Suggestion, ValidationResult, ValidationCheck } from '@/types/validation';
import { logger } from '@/lib/utils/logger';
import { Chapter } from '@/types/chapters';
import { ValidationError, formatErrorResponse } from '@/lib/utils/error-handler';

// シングルトンインスタンス
const validationSystem = new ValidationSystem();

/**
 * 小説チャプター検証APIエンドポイント
 * 
 * @async
 * @function POST
 * @param {NextRequest} request - APIリクエスト
 * @returns {Promise<NextResponse>} APIレスポンス
 * @throws {ValidationError} コンテンツやチャプター番号が指定されていない場合
 * 
 * @example
 * // リクエスト例:
 * {
 *   "content": "小説のチャプター内容...",
 *   "chapterNumber": 1
 * }
 * 
 * // 成功時のレスポンス例:
 * {
 *   "success": true,
 *   "data": {
 *     "isValid": true,
 *     "issues": [],
 *     "suggestions": [],
 *     "qualityScore": {
 *       "readability": 90,
 *       "coherence": 85,
 *       "engagement": 80,
 *       "characterConsistency": 85,
 *       "characterDepiction": 80,
 *       "consistency": 85,
 *       "originality": 80,
 *       "overall": 85
 *     }
 *   }
 * }
 * 
 * // エラー時のレスポンス例:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_ERROR",
 *     "message": "Content and chapter number are required"
 *   }
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Chapter validation request received');
    
    // リクエストの解析
    const requestData = await request.json() as ValidateChapterRequest;
    
    // リクエストの検証
    if (!requestData.content || !requestData.chapterNumber) {
      logger.warn('Invalid validation request', { 
        hasContent: !!requestData.content, 
        hasChapterNumber: !!requestData.chapterNumber 
      });
      
      throw new ValidationError('Content and chapter number are required');
    }
    
    // チャプターオブジェクトの構築
    const chapter: Chapter = {
      id: `temp-${Date.now()}`,
      chapterNumber: requestData.chapterNumber,
      title: `第${requestData.chapterNumber}章`,
      content: requestData.content,
      summary: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        wordCount: requestData.content.length,
        generationVersion: '1.0.0',
        qualityScore: 0,
        updatedAt: new Date(),
      },
    };
    
    // バリデーション実行
    logger.info(`Validating content for chapter ${requestData.chapterNumber}`);
    const validation = await validationSystem.validateChapter(chapter);
    
    // 問題点をバリデーション結果から抽出
    const issues: ValidationIssue[] = validation.checks
      .filter(check => !check.passed)
      .map(check => ({
        type: check.name.toUpperCase(),
        description: check.message,
        severity: check.severity,
        location: check.details?.location,
        suggestion: check.details?.suggestion,
      }));
    
    // 提案を生成
    const suggestions: Suggestion[] = issues.map((issue, index) => ({
      target: issue.type,
      issue: issue.description,
      suggestion: issue.suggestion || generateSuggestion(issue),
      reason: generateReason(issue),
      priority: calculatePriority(issue, index),
    }));
    
    // 品質スコアを構築
    const qualityScore: QualityMetrics = {
      readability: calculateReadabilityScore(validation),
      coherence: calculateCoherenceScore(validation),
      engagement: calculateEngagementScore(validation),
      characterConsistency: calculateCharacterConsistencyScore(validation),
      characterDepiction: calculateCharacterDepictionScore(validation),
      consistency: calculateConsistencyScore(validation),
      originality: calculateOriginalityScore(validation),
      overall: validation.qualityScore,
    };
    
    // レスポンスの構築
    const response: ValidateChapterResponse = {
      isValid: validation.isValid,
      issues,
      suggestions,
      qualityScore,
    };
    
    logger.info(`Validation completed for chapter ${requestData.chapterNumber}`, {
      isValid: validation.isValid,
      issueCount: issues.length,
      overallScore: qualityScore.overall
    });
    
    return NextResponse.json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    logger.error('Failed to validate chapter', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    const errorResponse = formatErrorResponse(error instanceof Error ? error : new Error(String(error)));
    const statusCode = error instanceof ValidationError ? 400 : 500;
    
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * 提案生成関数
 * 
 * @function generateSuggestion
 * @param {ValidationIssue} issue - 検証問題
 * @returns {string} 提案文
 * 
 * @example
 * // 入力:
 * {
 *   type: 'LENGTH',
 *   description: '文字数が目標値を超えています',
 *   severity: 'MEDIUM'
 * }
 * 
 * // 出力:
 * '目標文字数に近づくよう調整してください'
 */
function generateSuggestion(issue: ValidationIssue): string {
  switch (issue.type) {
    case 'LENGTH':
      return '目標文字数に近づくよう調整してください';
    case 'STYLE':
      return '一貫した視点と文体を維持してください';
    case 'SYNTAX':
      return '文法エラーを修正してください';
    case 'BASIC_CONSISTENCY':
      return '前後のストーリーとの整合性を確認してください';
    case 'CHARACTER_CONSISTENCY':
      return 'キャラクターの一貫性を維持してください';
    case 'PLOT_INTEGRITY':
      return 'プロットの論理的整合性を確認してください';
    case 'PACING':
      return 'ストーリーの展開ペースを調整してください';
    case 'DIALOGUE_QUALITY':
      return '会話の自然さと個性を向上させてください';
    default:
      return '問題を確認して修正してください';
  }
}

/**
 * 理由生成関数
 * 
 * @function generateReason
 * @param {ValidationIssue} issue - 検証問題
 * @returns {string} 理由文
 * 
 * @example
 * // 入力:
 * {
 *   type: 'STYLE',
 *   description: '文体が一貫していません',
 *   severity: 'MEDIUM'
 * }
 * 
 * // 出力:
 * '一貫した文体は読者の没入感を高めます'
 */
function generateReason(issue: ValidationIssue): string {
  switch (issue.type) {
    case 'LENGTH':
      return '適切な文字数は読者の集中力維持と物語のペース感に重要です';
    case 'STYLE':
      return '一貫した文体は読者の没入感を高めます';
    case 'SYNTAX':
      return '文法エラーは読者の理解を妨げ、没入感を損ないます';
    case 'BASIC_CONSISTENCY':
      return 'ストーリーの整合性は読者の信頼を維持するために重要です';
    case 'CHARACTER_CONSISTENCY':
      return 'キャラクターの一貫した描写は読者の共感と物語の信頼性に不可欠です';
    case 'PLOT_INTEGRITY':
      return '論理的に一貫したプロットは物語の信憑性を高めます';
    case 'PACING':
      return '適切なペース配分は読者の興味を維持し、物語の効果を最大化します';
    case 'DIALOGUE_QUALITY':
      return '自然で個性的な会話は登場人物の魅力を引き立て、物語に生命を吹き込みます';
    default:
      return '高品質な物語を維持するために修正が必要です';
  }
}

/**
 * 優先度計算関数
 * 
 * @function calculatePriority
 * @param {ValidationIssue} issue - 検証問題
 * @param {number} index - 問題のインデックス
 * @returns {number} 優先度スコア
 * 
 * @description 問題の重要度とタイプに基づいて優先度スコアを計算します。
 * 重要度（HIGH, MEDIUM, LOW）と問題タイプ（BASIC_CONSISTENCY, CHARACTER_CONSISTENCY等）に
 * 重み付けを行い、インデックスによる微調整を加えてスコアを算出します。
 */
function calculatePriority(issue: ValidationIssue, index: number): number {
  const severityWeight: Record<string, number> = {
    'HIGH': 3,
    'MEDIUM': 2,
    'LOW': 1,
  };
  
  const typeWeight: Record<string, number> = {
    'BASIC_CONSISTENCY': 3,
    'CHARACTER_CONSISTENCY': 2.8,
    'PLOT_INTEGRITY': 2.7,
    'SYNTAX': 2.5,
    'STYLE': 2,
    'PACING': 1.8,
    'DIALOGUE_QUALITY': 1.5,
    'LENGTH': 1,
  };
  
  const severityScore = severityWeight[issue.severity] || 1;
  const typeScore = typeWeight[issue.type] || 1;
  
  // 優先度スコアを計算（基本的な重要度 + タイプごとの重み - 位置による微調整）
  return (severityScore * 10) + (typeScore * 3) - (index * 0.1);
}

/**
 * 読みやすさスコア計算関数
 * 
 * @function calculateReadabilityScore
 * @param {ValidationResult} validation - 検証結果
 * @returns {number} 読みやすさスコア（0-100）
 * 
 * @description バリデーション結果からstyle、syntax、readabilityのチェック結果を抽出し、
 * 読みやすさスコアを計算します。専用のreadabilityチェックがある場合はその結果を使用し、
 * ない場合はstyleとsyntaxスコアの平均値を返します。
 */
function calculateReadabilityScore(validation: ValidationResult): number {
  const styleCheck = validation.checks.find((c: ValidationCheck) => c.name === 'style');
  const syntaxCheck = validation.checks.find((c: ValidationCheck) => c.name === 'syntax');
  const readabilityCheck = validation.checks.find((c: ValidationCheck) => c.name === 'readability');
  
  if (readabilityCheck) {
    // 専用の読みやすさチェックがある場合はその結果を使用
    return readabilityCheck.passed ? 90 : 
           (readabilityCheck.details?.score ? readabilityCheck.details.score : 70);
  }
  
  // 代替指標を使用
  const styleScore = styleCheck?.passed ? 100 : 
                    (styleCheck?.details?.score ? styleCheck.details.score : 70);
  const syntaxScore = syntaxCheck?.passed ? 100 : 
                     (syntaxCheck?.details?.score ? syntaxCheck.details.score : 65);
  
  return Math.round((styleScore + syntaxScore) / 2);
}

/**
 * 一貫性スコア計算関数
 * 
 * @function calculateCoherenceScore
 * @param {ValidationResult} validation - 検証結果
 * @returns {number} 一貫性スコア（0-100）
 * 
 * @description バリデーション結果からconsistency、plot_consistency、coherenceの
 * チェック結果を抽出し、一貫性スコアを計算します。専用のcoherenceチェックがある場合は
 * その結果を使用し、ない場合はconsistencyとplotスコアの平均値を返します。
 */
function calculateCoherenceScore(validation: ValidationResult): number {
  const consistencyCheck = validation.checks.find((c: ValidationCheck) => c.name === 'basic_consistency');
  const plotCheck = validation.checks.find((c: ValidationCheck) => c.name === 'plot_consistency');
  const coherenceCheck = validation.checks.find((c: ValidationCheck) => c.name === 'coherence');
  
  if (coherenceCheck) {
    return coherenceCheck.passed ? 90 : 
           (coherenceCheck.details?.score ? coherenceCheck.details.score : 70);
  }
  
  // 代替指標
  const consistencyScore = consistencyCheck?.passed ? 100 : 
                          (consistencyCheck?.details?.score ? consistencyCheck.details.score : 70);
  const plotScore = plotCheck?.passed ? 100 : 
                   (plotCheck?.details?.score ? plotCheck.details.score : 75);
  
  return Math.round((consistencyScore + plotScore) / 2);
}

/**
 * 魅力度スコア計算関数
 * 
 * @function calculateEngagementScore
 * @param {ValidationResult} validation - 検証結果
 * @returns {number} 魅力度スコア（0-100）
 * 
 * @description バリデーション結果からpacing、dialogue、engagementのチェック結果を
 * 抽出し、魅力度スコアを計算します。専用のengagementチェックがある場合はその結果を
 * 使用し、ない場合はpace、dialogueスコアとデフォルト値の平均を返します。
 */
function calculateEngagementScore(validation: ValidationResult): number {
  const paceCheck = validation.checks.find((c: ValidationCheck) => c.name === 'pacing');
  const dialogueCheck = validation.checks.find((c: ValidationCheck) => c.name === 'dialogue');
  const engagementCheck = validation.checks.find((c: ValidationCheck) => c.name === 'engagement');
  
  if (engagementCheck) {
    return engagementCheck.passed ? 90 : 
           (engagementCheck.details?.score ? engagementCheck.details.score : 80);
  }
  
  // 代替指標
  const paceScore = paceCheck?.passed ? 90 : 
                   (paceCheck?.details?.score ? paceCheck.details.score : 80);
  const dialogueScore = dialogueCheck?.passed ? 90 : 
                       (dialogueCheck?.details?.score ? dialogueCheck.details.score : 80);
  
  // デフォルト値を考慮
  return Math.round((paceScore + dialogueScore + 85) / 3); // 85はデフォルトの魅力度
}

/**
 * キャラクター一貫性スコア計算関数
 * 
 * @function calculateCharacterConsistencyScore
 * @param {ValidationResult} validation - 検証結果
 * @returns {number} キャラクター一貫性スコア（0-100）
 * 
 * @description バリデーション結果からcharacter_consistencyチェック結果を抽出し、
 * キャラクター一貫性スコアを計算します。専用のcharacter_consistencyチェックがある
 * 場合はその結果を使用し、ない場合は基本的な一貫性チェックの結果を代用します。
 */
function calculateCharacterConsistencyScore(validation: ValidationResult): number {
  const charConsistencyCheck = validation.checks.find((c: ValidationCheck) => c.name === 'character_consistency');
  
  if (charConsistencyCheck) {
    return charConsistencyCheck.passed ? 90 : 
           (charConsistencyCheck.details?.score ? charConsistencyCheck.details.score : 75);
  }
  
  // 基本的な一貫性チェックを代用
  const consistencyCheck = validation.checks.find((c: ValidationCheck) => c.name === 'basic_consistency');
  return consistencyCheck?.passed ? 85 : 70;
}

/**
 * 一般的な一貫性スコア計算関数
 * 
 * @function calculateConsistencyScore
 * @param {ValidationResult} validation - 検証結果
 * @returns {number} 一貫性スコア（0-100）
 * 
 * @description 一貫性と整合性は類似の概念として扱い、calculateCoherenceScore関数の
 * 結果を再利用して一貫性スコアを返します。
 */
function calculateConsistencyScore(validation: ValidationResult): number {
  // 一貫性と整合性は類似の概念なので、整合性スコアを再利用
  return calculateCoherenceScore(validation);
}

/**
 * キャラクター描写スコア計算関数
 * 
 * @function calculateCharacterDepictionScore
 * @param {ValidationResult} validation - 検証結果
 * @returns {number} キャラクター描写スコア（0-100）
 * 
 * @description バリデーション結果からcharacter_depictionチェック結果を抽出し、
 * キャラクター描写スコアを計算します。専用のcharacter_depictionチェックがある場合は
 * その結果を使用し、ない場合はキャラクター一貫性スコアを代用します。
 */
function calculateCharacterDepictionScore(validation: ValidationResult): number {
  const charDepictionCheck = validation.checks.find((c: ValidationCheck) => c.name === 'character_depiction');
  
  if (charDepictionCheck) {
    return charDepictionCheck.passed ? 90 : 
           (charDepictionCheck.details?.score ? charDepictionCheck.details.score : 75);
  }
  
  // キャラクター一貫性スコアと同様の考え方でスコア算出
  return calculateCharacterConsistencyScore(validation);
}

/**
 * オリジナリティスコア計算関数
 * 
 * @function calculateOriginalityScore
 * @param {ValidationResult} validation - 検証結果
 * @returns {number} オリジナリティスコア（0-100）
 * 
 * @description バリデーション結果からoriginalityチェック結果を抽出し、
 * オリジナリティスコアを計算します。専用のoriginalityチェックがある場合は
 * その結果を使用し、ない場合はデフォルト値（80）を返します。
 */
function calculateOriginalityScore(validation: ValidationResult): number {
  const originalityCheck = validation.checks.find((c: ValidationCheck) => c.name === 'originality');
  
  if (originalityCheck) {
    return originalityCheck.passed ? 90 : 
           (originalityCheck.details?.score ? originalityCheck.details.score : 80);
  }
  
  // デフォルト値を返す（この値はシステムのコンセプトに合わせて調整）
  return 80;
}