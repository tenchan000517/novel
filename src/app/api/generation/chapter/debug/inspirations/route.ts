// src/app/api/generation/chapter/debug/inspirations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { LiteraryComparisonSystem } from '@/lib/analysis/services/narrative/literary-comparison-system';
import { WorldSettingsManager } from '@/lib/plot/world-settings-manager';
import { GeminiClient } from '@/lib/generation/gemini-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterNumber = parseInt(searchParams.get('chapter') || '1');
    const totalChapters = parseInt(searchParams.get('total') || '0') || undefined;

    console.log(`[DEBUG] Starting literary inspirations debug for chapter ${chapterNumber}`);

    // システム初期化
    const worldSettingsManager = new WorldSettingsManager();
    const geminiClient = new GeminiClient();
    const literaryComparisonSystem = new LiteraryComparisonSystem(geminiClient, worldSettingsManager);

    // デバッグ情報収集
    const debugInfo: any = {
      request: {
        chapterNumber,
        totalChapters,
        timestamp: new Date().toISOString()
      }
    };

    // 1. WorldSettingsManagerから直接ジャンル取得
    console.log('[DEBUG] Getting genre from WorldSettingsManager...');
    try {
      const worldSettingsGenre = await worldSettingsManager.getGenre();
      debugInfo.worldSettingsGenre = worldSettingsGenre;
      console.log(`[DEBUG] WorldSettingsManager.getGenre() returned: ${worldSettingsGenre}`);
    } catch (error) {
      debugInfo.worldSettingsGenreError = error instanceof Error ? error.message : String(error);
      console.error('[DEBUG] WorldSettingsManager.getGenre() failed:', error);
    }

    // 2. テスト用コンテキスト作成
    const testContext = {
      worldSettings: 'テスト用の世界設定',
      chapterNumber,
      totalChapters,
      genre: undefined // 明示的にundefinedに設定してWorldSettingsManagerからの取得をテスト
    };
    debugInfo.testContext = testContext;

    // 3. 進行度計算のデバッグ
    const position = totalChapters && totalChapters > 0 ?
      chapterNumber / totalChapters :
      chapterNumber / 20;
    
    let narrativeStage: string;
    if (position < 0.3) {
      narrativeStage = '序盤';
    } else if (position < 0.7) {
      narrativeStage = '中盤';
    } else {
      narrativeStage = '終盤';
    }

    debugInfo.progressCalculation = {
      position,
      positionPercentage: Math.round(position * 100),
      narrativeStage
    };

    console.log(`[DEBUG] Progress calculation: ${Math.round(position * 100)}% (${narrativeStage})`);

    // 4. 文学的インスピレーション生成
    console.log('[DEBUG] Generating literary inspirations...');
    const startTime = Date.now();
    
    const inspirations = await literaryComparisonSystem.generateLiteraryInspirations(
      testContext,
      chapterNumber
    );

    const generationTime = Date.now() - startTime;
    debugInfo.generationTime = generationTime;

    console.log(`[DEBUG] Literary inspirations generated in ${generationTime}ms`);

    // 5. 結果の詳細分析
    debugInfo.inspirations = {
      plotTechniques: inspirations.plotTechniques.map(tech => ({
        technique: tech.technique,
        description: tech.description.substring(0, 100) + '...',
        example: tech.example.substring(0, 100) + '...',
        reference: tech.reference
      })),
      characterTechniques: inspirations.characterTechniques.map(tech => ({
        technique: tech.technique,
        description: tech.description.substring(0, 100) + '...',
        example: tech.example.substring(0, 100) + '...',
        reference: tech.reference
      })),
      atmosphereTechniques: inspirations.atmosphereTechniques.map(tech => ({
        technique: tech.technique,
        description: tech.description.substring(0, 100) + '...',
        example: tech.example.substring(0, 100) + '...',
        reference: tech.reference
      }))
    };

    debugInfo.summary = {
      totalTechniques: inspirations.plotTechniques.length + 
                      inspirations.characterTechniques.length + 
                      inspirations.atmosphereTechniques.length,
      plotTechniqueCount: inspirations.plotTechniques.length,
      characterTechniqueCount: inspirations.characterTechniques.length,
      atmosphereTechniqueCount: inspirations.atmosphereTechniques.length,
      uniqueReferences: [
        ...new Set([
          ...inspirations.plotTechniques.map(t => t.reference),
          ...inspirations.characterTechniques.map(t => t.reference),
          ...inspirations.atmosphereTechniques.map(t => t.reference)
        ])
      ]
    };

    console.log('[DEBUG] Debug information collection completed');

    // レスポンス返却
    return NextResponse.json({
      success: true,
      debug: debugInfo,
      fullInspirations: inspirations // 完全な結果も含める
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('[DEBUG] Literary inspirations debug failed:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      }
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapterNumber = 1, totalChapters, customContext } = body;

    console.log(`[DEBUG] POST request for literary inspirations debug - chapter ${chapterNumber}`);

    // システム初期化
    const worldSettingsManager = new WorldSettingsManager();
    const geminiClient = new GeminiClient();
    const literaryComparisonSystem = new LiteraryComparisonSystem(geminiClient, worldSettingsManager);

    // カスタムコンテキストまたはデフォルトコンテキスト
    const testContext = customContext || {
      worldSettings: customContext?.worldSettings || 'POSTリクエストによるテスト用世界設定',
      chapterNumber,
      totalChapters,
      genre: customContext?.genre
    };

    console.log('[DEBUG] Using context:', testContext);

    // 文学的インスピレーション生成
    const inspirations = await literaryComparisonSystem.generateLiteraryInspirations(
      testContext,
      chapterNumber
    );

    return NextResponse.json({
      success: true,
      context: testContext,
      inspirations,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('[DEBUG] POST literary inspirations debug failed:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
}