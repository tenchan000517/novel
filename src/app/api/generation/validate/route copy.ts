// src/app/api/generation/validate/route.ts
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

const validationSystem = new ValidationSystem();

// 提案生成関数（このフェーズでは簡易実装）
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
    default:
      return '問題を確認して修正してください';
  }
}

// 理由生成関数（このフェーズでは簡易実装）
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
    default:
      return '高品質な物語を維持するために修正が必要です';
  }
}

// 優先度計算（このフェーズでは簡易実装）
function calculatePriority(issue: ValidationIssue, index: number): number {
  const severityWeight: Record<string, number> = {
    'HIGH': 3,
    'MEDIUM': 2,
    'LOW': 1,
  };
  
  const weight = severityWeight[issue.severity] || 1;
  
  // 位置による僅かな調整（同じ重要度でも順序をつける）
  return weight * 10 - (index * 0.1);
}

// 読みやすさスコア計算（このフェーズでは簡易実装）
function calculateReadabilityScore(validation: ValidationResult): number {
  const styleCheck = validation.checks.find((c: ValidationCheck) => c.name === 'style');
  const syntaxCheck = validation.checks.find((c: ValidationCheck) => c.name === 'syntax');
  
  const styleScore = styleCheck?.passed ? 100 : 70;
  const syntaxScore = syntaxCheck?.passed ? 100 : 60;
  
  return Math.round((styleScore + syntaxScore) / 2);
}

// 一貫性スコア計算（このフェーズでは簡易実装）
function calculateCoherenceScore(validation: ValidationResult): number {
  const consistencyCheck = validation.checks.find((c: ValidationCheck) => c.name === 'basic_consistency');
  return consistencyCheck?.passed ? 100 : 70;
}

// 魅力度スコア計算（このフェーズでは簡易実装）
function calculateEngagementScore(validation: ValidationResult): number {
  // このフェーズでは固定値を返す
  return 85;
}

// キャラクター一貫性スコア計算（このフェーズでは簡易実装）
function calculateCharacterConsistencyScore(validation: ValidationResult): number {
  const consistencyCheck = validation.checks.find((c: ValidationCheck) => c.name === 'basic_consistency');
  return consistencyCheck?.passed ? 90 : 75;
}

// 一般的な一貫性スコア計算（簡易実装）
function calculateConsistencyScore(validation: ValidationResult): number {
  return calculateCoherenceScore(validation);
}

// キャラクター描写スコア計算（簡易実装）
function calculateCharacterDepictionScore(validation: ValidationResult): number {
  return calculateCharacterConsistencyScore(validation);
}

// オリジナリティスコア計算（簡易実装）
function calculateOriginalityScore(validation: ValidationResult): number {
  // 固定値
  return 80;
}

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
      
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Content and chapter number are required' 
          } 
        },
        { status: 400 }
      );
    }
    
    const chapter: Chapter = {
      id: 'temp',
      chapterNumber: requestData.chapterNumber, // ✅ ここ！"number" じゃなく "chapterNumber"
      title: 'Temporary Title',
      content: requestData.content,
      summary: '',
      createdAt: new Date(), // ✅ 本体に必要
      updatedAt: new Date(), // ✅ 本体に必要
      metadata: {
        wordCount: requestData.content.length,
        generationVersion: '1.0.0',
        qualityScore: 0,
        createdAt: new Date(),
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
    
    // 品質スコアを計算 - すべての必要なプロパティを含める
    const qualityScore: QualityMetrics = {
      readability: calculateReadabilityScore(validation),
      coherence: calculateCoherenceScore(validation),
      engagement: calculateEngagementScore(validation),
      characterConsistency: calculateCharacterConsistencyScore(validation),
      overall: validation.qualityScore,
      // 必要な追加プロパティ
      consistency: calculateConsistencyScore(validation),
      characterDepiction: calculateCharacterDepictionScore(validation),
      originality: calculateOriginalityScore(validation)
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
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'VALIDATION_ERROR', 
          message: (error as Error).message || 'Failed to validate chapter' 
        } 
      },
      { status: 500 }
    );
  }
}