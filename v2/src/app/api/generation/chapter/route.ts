/**
 * Version 2.0 - 章生成APIエンドポイント
 * 
 * 小説章生成のテスト用API
 */

import { NextRequest, NextResponse } from 'next/server';
import { ContextGenerator } from '@/generation/context/core/context-generator';
import { PromptGenerator } from '@/generation/prompt/core/prompt-generator';
import { ChapterGenerator } from '@/generation/chapter/core/chapter-generator';
import { UnifiedAIClient } from '@/core/ai-client/unified-ai-client';
import { SystemType, ContextPriority, OptimizationLevel } from '@/generation/context/types';
import { AIModelType, PromptOptimizationLevel, ContextInclusionLevel, PromptFormatStyle, PromptLanguage, QualityStandard } from '@/generation/prompt/types';
import { QualityLevel, EnhancementLevel } from '@/generation/chapter/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // リクエストボディを取得
    const body = await request.json();
    const { chapterNumber = 1, theme = "成長と勇気", targetLength = 2000 } = body;

    console.log(`[Generation Test] 章${chapterNumber}の生成を開始`, { theme, targetLength });

    // 1. AI一元化システムの初期化
    const aiClient = new UnifiedAIClient();
    console.log('[Generation Test] AI一元化システム初期化完了');

    // 2. コンテキスト生成システムのテスト
    const contextGenerator = new ContextGenerator();
    const contextResult = await contextGenerator.generateContext(chapterNumber, {
      includeSystemTypes: [
        SystemType.CHARACTER,
        SystemType.PLOT, 
        SystemType.WORLD,
        SystemType.LEARNING
      ],
      priority: ContextPriority.ESSENTIAL,
      maxDataSize: 10000,
      optimizationLevel: OptimizationLevel.BASIC,
      chapterNumber,
      targetLength
    });

    if (!contextResult.success) {
      throw new Error(`Context generation failed: ${contextResult.error?.message}`);
    }
    console.log('[Generation Test] コンテキスト生成完了');

    // 3. プロンプト生成システムのテスト
    const promptGenerator = new PromptGenerator();
    const promptResult = await promptGenerator.generatePrompt(
      contextResult.data!,
      {
        targetAIModel: AIModelType.GEMINI_15_PRO,
        maxTokens: 4000,
        optimizationLevel: PromptOptimizationLevel.BASIC,
        includeContext: ContextInclusionLevel.COMPREHENSIVE,
        formatStyle: PromptFormatStyle.STRUCTURED,
        language: PromptLanguage.JAPANESE,
        qualityStandards: [QualityStandard.CREATIVE, QualityStandard.ENGAGING]
      }
    );

    if (!promptResult.success) {
      throw new Error(`Prompt generation failed: ${promptResult.error?.message}`);
    }
    console.log('[Generation Test] プロンプト生成完了');

    // 4. 章生成システムのテスト
    const chapterGenerator = new ChapterGenerator(aiClient, contextGenerator, promptGenerator);
    const chapterResult = await chapterGenerator.generateChapter(chapterNumber, {
      chapterNumber,
      targetLength,
      qualityLevel: QualityLevel.STANDARD,
      enhancementLevel: EnhancementLevel.BASIC,
      validationStrict: false,
      autoRetry: true,
      maxRetries: 2,
      timeoutMinutes: 5
    });

    if (!chapterResult.success) {
      throw new Error(`Chapter generation failed: ${chapterResult.error?.message}`);
    }
    console.log('[Generation Test] 章生成完了');

    // 5. 生成結果の統計計算
    const processingTime = Date.now() - startTime;
    const generatedChapter = chapterResult.data!;

    const testResults = {
      success: true,
      processingTime,
      chapter: {
        number: generatedChapter.chapterNumber,
        title: generatedChapter.title,
        wordCount: generatedChapter.content.wordCount,
        characterCount: generatedChapter.content.characterCount,
        paragraphCount: generatedChapter.content.paragraphCount,
        qualityScore: generatedChapter.quality.overall,
        content: generatedChapter.content.formattedText
      },
      systemPerformance: {
        contextGenerationTime: contextResult.metadata?.processingTime || 0,
        promptGenerationTime: promptResult.metadata?.processingTime || 0,
        chapterGenerationTime: chapterResult.metadata?.processingTime || 0,
        totalProcessingTime: processingTime
      },
      qualityMetrics: {
        overallQuality: generatedChapter.quality.overall,
        strengths: generatedChapter.quality.strengths.length,
        weaknesses: generatedChapter.quality.weaknesses.length,
        recommendations: generatedChapter.quality.recommendations.length
      }
    };

    console.log('[Generation Test] テスト完了', {
      processingTime: `${processingTime}ms`,
      wordCount: generatedChapter.content.wordCount,
      qualityScore: generatedChapter.quality.overall
    });

    return NextResponse.json(testResults, { status: 200 });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error('[Generation Test] エラー発生:', error);
    
    const errorResponse = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown generation error',
        code: 'GENERATION_FAILED',
        processingTime
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Chapter Generation API',
    version: '2.0.0',
    methods: ['POST'],
    description: 'Novel chapter generation endpoint for testing'
  });
}