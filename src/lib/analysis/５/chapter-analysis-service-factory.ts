// /**
//  * @fileoverview 章分析サービスのファクトリー
//  * @description
//  * 章分析サービスのインスタンスを作成するためのファクトリークラス。
//  * 依存性注入を利用してサービスを構築します。
//  */

// import { ChapterAnalysisService } from './chapter-analysis-service';
// import { GeminiAdapter } from '@/lib/analysis/adapters/gemini-adapter';
// import { IChapterAnalysisService } from '@/lib/analysis/services/chapter/interfaces';

// /**
//  * @interface ChapterAnalysisServiceOptions
//  * @description 章分析サービスの設定オプション
//  */
// export interface ChapterAnalysisServiceOptions {
//   /** Gemini API アダプター */
//   geminiAdapter?: GeminiAdapter;
// }

// /**
//  * @class ChapterAnalysisServiceFactory
//  * @description 章分析サービスのファクトリークラス
//  */
// export class ChapterAnalysisServiceFactory {
//   /**
//    * 章分析サービスのインスタンスを作成
//    * 
//    * @param {ChapterAnalysisServiceOptions} options サービス設定オプション
//    * @returns {IChapterAnalysisService} 章分析サービスのインスタンス
//    */
//   createChapterAnalysisService(options: ChapterAnalysisServiceOptions = {}): IChapterAnalysisService {
//     // デフォルトのGeminiAdapterを作成またはオプションから取得
//     const geminiAdapter = options.geminiAdapter || new GeminiAdapter();
    
//     // サービスインスタンスを作成して返す
//     return new ChapterAnalysisService(geminiAdapter);
//   }
// }

// // シングルトンのファクトリーインスタンスをエクスポート
// export const chapterAnalysisServiceFactory = new ChapterAnalysisServiceFactory();