// // src/app/api/generation/prompt-capture/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { generationEngine } from '@/lib/generation/engine';
// import { CoreGenerationEngine } from '@/lib/generation/engine/core-generation-engine';
// import { ContextGenerator } from '@/lib/generation/context-generator';
// import { EnhancedPromptTemplate } from '@/lib/generation/enhanced-prompt-template';
// import { characterManager } from '@/lib/characters/manager';
// import { parameterManager } from '@/lib/parameters';
// import { logger } from '@/lib/utils/logger';
// import { storageProvider } from '@/lib/storage';
// import { GenerateChapterRequest } from '@/types/generation';

// // プロンプトキャプチャ用のAPIハンドラ
// export async function POST(request: NextRequest): Promise<NextResponse> {
//   try {
//     logger.info('Prompt capture request received');

//     // パラメータマネージャーの初期化
//     await parameterManager.initialize();

//     // リクエストの解析
//     // リクエストのボディがある場合のみパース
//     let requestData = { chapterNumber: 1 };
//     try {
//       const text = await request.text();
//       if (text && text.trim()) {
//         requestData = JSON.parse(text);
//       }
//     } catch (parseError) {
//       logger.warn('Failed to parse request body, using defaults', { error: parseError });
//     }
    
//     const chapterNumber = requestData.chapterNumber || 1;

//     logger.info(`Generating context for chapter ${chapterNumber} to capture prompt`);

//     // GenerationEngineを初期化
//     await generationEngine.initialize();

//     // ContextGeneratorを使用してコンテキストを生成
//     const contextGenerator = new ContextGenerator();
//     const context = await contextGenerator.generateContext(chapterNumber, requestData);

//     // EnhancedPromptTemplateでプロンプトを生成
//     const promptTemplate = new EnhancedPromptTemplate({
//       characterManager: characterManager
//     });

//     // 実際のプロンプトを生成
//     const prompt = await promptTemplate.generate(context);

//     // プロンプトをファイルに保存
//     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//     const fileName = `prompt_chapter${chapterNumber}_${timestamp}.txt`;
//     await storageProvider.writeFile(`prompts/${fileName}`, prompt);

//     logger.info(`Prompt captured for chapter ${chapterNumber} and saved as ${fileName}`);

//     // プロンプトとファイル名を含むレスポンスを返す
//     return NextResponse.json({
//       success: true,
//       data: {
//         fileName,
//         promptLength: prompt.length,
//         prompt: prompt
//       }
//     });
//   } catch (error) {
//     logger.error('Failed to capture prompt', {
//       error: error instanceof Error ? error.message : String(error),
//       stack: error instanceof Error ? error.stack : undefined
//     });

//     return NextResponse.json(
//       {
//         success: false,
//         error: {
//           code: 'PROMPT_CAPTURE_ERROR',
//           message: error instanceof Error ? error.message : 'Failed to capture prompt'
//         }
//       },
//       { status: 500 }
//     );
//   }
// }