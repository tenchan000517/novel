// // src/app/api/generation/chapter/debug/prompt-values/route.ts

// import { NextResponse } from 'next/server';
// import { WorldSettingsManager } from '@/lib/plot/world-settings-manager';
// import { EnhancedPromptTemplate } from '@/lib/generation/enhanced-prompt-template';
// import { logger } from '@/lib/utils/logger';

// export async function GET() {
//   try {
//     // 必要なインスタンスを初期化
//     const worldSettingsManager = new WorldSettingsManager();
//     await worldSettingsManager.initialize();
    
//     // EnhancedPromptTemplateをデバッグモードで拡張
//     class DebugEnhancedPromptTemplate extends EnhancedPromptTemplate {
//       async generateWithDebug(context: any) {
//         // 元の値をログに記録するためのデバッグ情報
//         const debugInfo = {
//           input: {
//             worldSettingsManagerData: null as any,
//             contextData: {
//               worldSettings: context.worldSettings,
//               theme: context.theme,
//               genre: context.genre
//             }
//           },
//           replacementValues: {
//             worldSettings: '',
//             genre: '',
//             theme: ''
//           },
//           process: [] as string[],
//           resultTemplate: '',
//           error: undefined as string | undefined  // エラーフィールドも追加
//         };
        
//         try {
//           // WorldSettingsManagerからデータを取得
//           const formattedWorldAndTheme = await worldSettingsManager.getFormattedWorldAndTheme();
//           debugInfo.input.worldSettingsManagerData = formattedWorldAndTheme;
          
//           // 置換前のテンプレート変数を追跡する関数
//           const replacePlaceholder = (template: string, placeholder: string, value: string, description: string) => {
//             debugInfo.process.push(`置換: {${placeholder}} → ${value ? (value.length > 100 ? value.substring(0, 100) + '...' : value) : '(空)'} (${description})`);
//             return template.replace(`{${placeholder}}`, value);
//           };
          
//           // 世界設定情報とジャンルの取得（オリジナルコードから抽出）
//           let worldSettingsText = '';
//           let genre = '';
          
//           // 優先順位1: WorldSettingsManager から直接取得
//           if (worldSettingsManager) {
//             try {
//               const formattedWorldAndTheme = await worldSettingsManager.getFormattedWorldAndTheme();
//               if (formattedWorldAndTheme.worldSettings) {
//                 worldSettingsText = formattedWorldAndTheme.worldSettings;
//                 debugInfo.process.push(`WorldSettingsManagerから世界設定取得: 成功 (${worldSettingsText.length}文字)`);
//               } else {
//                 debugInfo.process.push(`WorldSettingsManagerから世界設定取得: 空文字列`);
//               }
              
//               if (formattedWorldAndTheme.worldSettingsDetailed?.genre) {
//                 genre = formattedWorldAndTheme.worldSettingsDetailed.genre.toLowerCase();
//                 debugInfo.process.push(`WorldSettingsManagerからジャンル取得: ${genre}`);
//               } else {
//                 debugInfo.process.push(`WorldSettingsManagerからジャンル取得: 失敗`);
//               }
              
//               if (!context.theme && formattedWorldAndTheme.theme) {
//                 context.theme = formattedWorldAndTheme.theme;
//                 debugInfo.process.push(`WorldSettingsManagerからテーマ取得: ${context.theme}`);
//               }
//             } catch (error) {
//               debugInfo.process.push(`WorldSettingsManagerからの情報取得エラー: ${error instanceof Error ? error.message : String(error)}`);
//             }
//           }
          
//           // 優先順位2~4: 既存のgetGenreFromContextロジックに相当する処理
//           if (!genre) {
//             if (context.genre) {
//               genre = typeof context.genre === 'string' ? context.genre.toLowerCase() : 'classic';
//               debugInfo.process.push(`コンテキストからジャンル取得: ${genre}`);
//             } else if (context.narrativeState?.genre) {
//               genre = typeof context.narrativeState.genre === 'string' ? context.narrativeState.genre.toLowerCase() : 'classic';
//               debugInfo.process.push(`narrativeStateからジャンル取得: ${genre}`);
//             } else {
//               genre = 'classic'; // 簡易的に
//               debugInfo.process.push(`デフォルトジャンル使用: ${genre}`);
//             }
//           }
          
//           // 優先順位最後: worldSettingsTextがなければコンテキストから取得
//           if (!worldSettingsText) {
//             worldSettingsText = context.worldSettings || '';
//             debugInfo.process.push(`コンテキストから世界設定取得: ${worldSettingsText ? '成功' : '空文字列'}`);
//           }
          
//           // 最終的な置換値を記録
//           debugInfo.replacementValues = {
//             worldSettings: worldSettingsText,
//             genre: genre,
//             theme: context.theme || '成長と冒険'
//           };
          
//           // テンプレートの一部を置換して確認（実際のgenerate完全版ではなく、要点のみ）
//           let templatePart = `
// ## 基本情報
// - ジャンル: {genre}

// ## 世界設定
// {worldSettings}

// ## テーマ
// {theme}
// `;
          
//           // 置換処理
//           templatePart = replacePlaceholder(templatePart, 'genre', genre, 'ジャンル');
//           templatePart = replacePlaceholder(templatePart, 'worldSettings', worldSettingsText, '世界設定');
//           templatePart = replacePlaceholder(templatePart, 'theme', context.theme || '成長と冒険', 'テーマ');
          
//           // 置換後のテンプレート部分を返す
//           debugInfo.resultTemplate = templatePart;
          
//           return debugInfo;
//         } catch (error) {
//           debugInfo.error = error instanceof Error ? error.message : String(error);
//           return debugInfo;
//         }
//       }
//     }
    
//     // デバッグ用テンプレートインスタンスを作成
//     const debugTemplate = new DebugEnhancedPromptTemplate({
//       worldSettingsManager
//     });
    
//     // テスト用のコンテキスト
//     const testContext = {
//       chapterNumber: 1,
//       targetLength: 5000,
//       narrativeStyle: "三人称視点",
//       tone: "標準的な語り口",
//       theme: "",  // WorldSettingsManagerから取得させるために空にする
//       worldSettings: "テスト用の世界設定（コンテキストからの値）",
//       characters: []
//     };
    
//     // デバッグ情報を取得
//     const debugInfo = await debugTemplate.generateWithDebug(testContext);
    
//     // レスポンスを返す
//     return NextResponse.json({
//       timestamp: new Date().toISOString(),
//       debugInfo
//     });
    
//   } catch (error) {
//     logger.error('プロンプト値のデバッグに失敗', { error });
//     return NextResponse.json(
//       {
//         error: 'プロンプト値のデバッグに失敗しました',
//         message: error instanceof Error ? error.message : String(error),
//       },
//       { status: 500 }
//     );
//   }
// }