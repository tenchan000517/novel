// /**
//  * @fileoverview 分析サービスの調整と結果統合を担当するコーディネーター
//  * @description
//  * 複数の分析サービスの実行を制御し、それらの結果を統合するコンポーネント。
//  * パイプラインの構成、優先度管理、エラーハンドリングを担当します。
//  */

// import { logger } from '@/lib/utils/logger';
// import { apiThrottler } from '@/lib/utils/api-throttle';
// import { AnalysisError } from '@/lib/analysis/core/errors';
// import { GeminiAdapter } from '@/lib/analysis/adapters/gemini-adapter';

// // 各サービスのインターフェース
// import { IChapterAnalysisService } from '@/lib/analysis/services/chapter/interfaces';
// import { IStyleAnalysisService } from '../services/style/interfaces';
// import { ICharacterAnalysisService } from '@/lib/analysis/services/character/interfaces';
// import { INarrativeAnalysisService } from '@/lib/analysis/services/narrative/interfaces';
// import { IThemeAnalysisService } from '@/lib/analysis/services/theme/interfaces';

// // 分析結果と設定のインターフェース
// import {
//     AnalysisOptions,
//     AnalysisResult,
//     AnalysisDomain,
//     QuickAnalysisOptions,
//     QuickAnalysisResult,
//     AnalysisPriority,
//     ChapterAnalysisOptions,
//     StyleAnalysisOptions,
//     CharacterAnalysisOptions,
//     NarrativeAnalysisOptions,
//     ThemeAnalysisOptions,
//     PartialAnalysisResult
// } from '@/lib/analysis/core/types';

// /**
//  * @class AnalysisCoordinator
//  * @description 分析サービスを調整し結果を統合するコーディネーター
//  * 
//  * 複数の分析サービスを調整し、それらの結果を統合します。
//  * 分析の依存関係、優先度、順序を管理し、エラー時のフォールバック戦略も提供します。
//  */
// export class AnalysisCoordinator {
//     // 分析のパフォーマンス測定用データ
//     private analysisTiming: Map<string, { startTime: number, endTime?: number }> = new Map();

//     /**
//      * コンストラクタ
//      * 依存性注入によって各分析サービスを受け取ります
//      * 
//      * @param chapterAnalysisService 章分析サービス
//      * @param styleAnalysisService 文体分析サービス
//      * @param characterAnalysisService キャラクター分析サービス
//      * @param narrativeAnalysisService 物語分析サービス
//      * @param themeAnalysisService テーマ分析サービス
//      */
//     constructor(
//         private chapterAnalysisService: IChapterAnalysisService,
//         private styleAnalysisService: IStyleAnalysisService,
//         private characterAnalysisService: ICharacterAnalysisService,
//         private narrativeAnalysisService: INarrativeAnalysisService,
//         private themeAnalysisService: IThemeAnalysisService,
//         private geminiAdapter: GeminiAdapter // オプションのGeminiAdapter

//     ) {
//         logger.info('AnalysisCoordinator: 初期化完了');
//         this.geminiAdapter = geminiAdapter || new GeminiAdapter();

//     }

//     /**
//    * リトライロジックを使用してAI生成リクエストを実行する
//    * @private
//    * @param requestFn リクエスト関数
//    * @param operationName 操作名（ログ用）
//    * @returns 生成結果
//    */
//     private async retryGenerationRequest(
//         requestFn: () => Promise<string>,
//         operationName: string,
//         retryCount: number = 3,
//         retryDelay: number = 1000
//     ): Promise<string> {
//         let lastError: Error | null = null;

//         for (let attempt = 1; attempt <= retryCount; attempt++) {
//             try {
//                 return await requestFn();
//             } catch (error) {
//                 lastError = error instanceof Error ? error : new Error(String(error));
//                 logger.warn(`${operationName}の試行 ${attempt}/${retryCount} が失敗しました`, {
//                     error: lastError.message
//                 });

//                 if (attempt < retryCount) {
//                     // 指数バックオフ（1秒、2秒、4秒...）
//                     const delay = retryDelay * Math.pow(2, attempt - 1);
//                     await new Promise(resolve => setTimeout(resolve, delay));
//                 }
//             }
//         }

//         // すべての試行が失敗した場合
//         throw lastError || new Error(`${operationName}に失敗しました`);
//     }

//     /**
//      * 章コンテンツの総合分析を実行
//      * 
//      * 複数の分析サービスを調整して実行し、結果を統合します。
//      * オプションによって分析の範囲と深さを制御できます。
//      * 
//      * @param content 分析対象の章コンテンツ
//      * @param options 分析オプション
//      * @returns 統合された分析結果
//      */
//     async analyzeContent(content: string, options: AnalysisOptions = {}): Promise<AnalysisResult> {
//         const startTime = Date.now();
//         logger.info('コンテンツの総合分析を開始', {
//             contentLength: content.length,
//             options: JSON.stringify(options)
//         });

//         this.startTiming('totalAnalysis');

//         try {
//             // オプションのデフォルト値を設定
//             const finalOptions = this.prepareAnalysisOptions(options);

//             // 分析結果を格納するオブジェクト
//             const analysisResults: PartialAnalysisResult = {};

//             // 章番号の取得（オプションから、または推測）
//             const chapterNumber = finalOptions.chapterNumber || this.inferChapterNumber(content);

//             // 分析ドメインの優先順位付け
//             const prioritizedDomains = this.prioritizeDomains(finalOptions.domains || [], finalOptions.priority);

//             // フェーズ1: 高速なベース分析（並列実行可能なもの）
//             const baseAnalysisPromises = this.createBaseAnalysisPromises(content, finalOptions, chapterNumber);

//             // ベース分析を実行し結果を収集
//             this.startTiming('baseAnalysis');
//             const baseResults = await this.executeBaseAnalysis(baseAnalysisPromises, prioritizedDomains);
//             this.endTiming('baseAnalysis');

//             // 結果を統合
//             Object.assign(analysisResults, baseResults);

//             // フェーズ2: 依存関係のある詳細分析（前の結果に依存するもの）
//             if (finalOptions.detailedAnalysis) {
//                 this.startTiming('detailedAnalysis');
//                 const detailedResults = await this.performDetailedAnalysis(
//                     content,
//                     analysisResults,
//                     finalOptions,
//                     chapterNumber,
//                     prioritizedDomains
//                 );
//                 this.endTiming('detailedAnalysis');

//                 // 詳細分析結果を統合
//                 Object.assign(analysisResults, detailedResults);
//             }

//             // フェーズ3: 横断的分析（複数領域にまたがる分析）
//             if (finalOptions.crossDomainAnalysis) {
//                 this.startTiming('crossDomainAnalysis');
//                 const crossDomainResults = await this.performCrossDomainAnalysis(
//                     content,
//                     analysisResults,
//                     finalOptions,
//                     chapterNumber
//                 );
//                 this.endTiming('crossDomainAnalysis');

//                 // 横断的分析結果を統合
//                 Object.assign(analysisResults, crossDomainResults);
//             }

//             // メタデータの追加
//             analysisResults.metadata = {
//                 analyzedAt: new Date().toISOString(),
//                 contentLength: content.length,
//                 chapterNumber,
//                 analysisOptions: finalOptions,
//                 performanceMetrics: this.collectPerformanceMetrics()
//             };

//             this.endTiming('totalAnalysis');

//             logger.info('コンテンツの総合分析が完了', {
//                 executionTime: Date.now() - startTime,
//                 resultSize: JSON.stringify(analysisResults).length
//             });

//             return analysisResults as AnalysisResult;
//         } catch (error) {
//             this.endTiming('totalAnalysis');

//             logger.error('コンテンツ分析中にエラーが発生', {
//                 error: error instanceof Error ? error.message : String(error),
//                 stack: error instanceof Error ? error.stack : undefined
//             });

//             return this.handleAnalysisError(error);
//         }
//     }

//     /**
//      * クイック分析の実行
//      * 
//      * 限定された範囲で迅速な分析を行います。
//      * リソース消費を抑えつつ重要な情報を提供します。
//      * 
//      * @param content 分析対象のコンテンツ
//      * @param options クイック分析オプション
//      * @returns クイック分析結果
//      */
//     async quickAnalyze(content: string, options: QuickAnalysisOptions = {}): Promise<QuickAnalysisResult> {
//         const startTime = Date.now();
//         logger.info('コンテンツのクイック分析を開始', {
//             contentLength: content.length,
//             options: JSON.stringify(options)
//         });

//         try {
//             // オプションのデフォルト値を設定
//             const finalOptions = {
//                 chapterNumber: options.chapterNumber || this.inferChapterNumber(content),
//                 domains: options.domains || ['chapter', 'style']
//             };

//             const results: QuickAnalysisResult = {
//                 summary: '',
//                 keyPoints: [],
//                 textStatistics: {},
//                 metadata: {
//                     analyzedAt: new Date().toISOString(),
//                     contentLength: content.length,
//                     executionTime: 0
//                 }
//             };

//             // 基本テキスト統計の取得
//             if (finalOptions.domains.includes('chapter')) {
//                 try {
//                     const chapterResults = await this.chapterAnalysisService.getTextStatistics(content);
//                     results.textStatistics = chapterResults;
//                 } catch (error) {
//                     logger.warn('テキスト統計分析に失敗', {
//                         error: error instanceof Error ? error.message : String(error)
//                     });
//                 }
//             }

//             // キーワード抽出
//             if (finalOptions.domains.includes('chapter') || finalOptions.domains.includes('theme')) {
//                 try {
//                     const keywords = await this.chapterAnalysisService.extractKeywords(content);
//                     results.keywords = keywords;
//                 } catch (error) {
//                     logger.warn('キーワード抽出に失敗', {
//                         error: error instanceof Error ? error.message : String(error)
//                     });
//                 }
//             }

//             // 文体クイック分析
//             if (finalOptions.domains.includes('style')) {
//                 try {
//                     const styleMetrics = await this.styleAnalysisService.getBasicStyleMetrics(content);
//                     results.styleMetrics = styleMetrics;
//                 } catch (error) {
//                     logger.warn('文体メトリクス分析に失敗', {
//                         error: error instanceof Error ? error.message : String(error)
//                     });
//                 }
//             }

//             // 要約生成（最も重要な部分）
//             try {
//                 const summary = await this.generateContentSummary(content, finalOptions.chapterNumber);
//                 results.summary = summary;

//                 // 要約から重要ポイントを抽出
//                 const keyPoints = await this.extractKeyPointsFromSummary(summary);
//                 results.keyPoints = keyPoints;
//             } catch (error) {
//                 logger.warn('コンテンツ要約生成に失敗', {
//                     error: error instanceof Error ? error.message : String(error)
//                 });

//                 // デフォルトの要約
//                 results.summary = "要約を生成できませんでした。";
//                 results.keyPoints = [];
//             }

//             // 実行時間の記録
//             results.metadata.executionTime = Date.now() - startTime;

//             logger.info('コンテンツのクイック分析が完了', {
//                 executionTime: results.metadata.executionTime
//             });

//             return results;
//         } catch (error) {
//             logger.error('クイック分析中にエラーが発生', {
//                 error: error instanceof Error ? error.message : String(error),
//                 stack: error instanceof Error ? error.stack : undefined
//             });

//             // 最小限の結果を返す
//             return {
//                 summary: "分析中にエラーが発生しました。",
//                 keyPoints: [],
//                 textStatistics: {},
//                 metadata: {
//                     analyzedAt: new Date().toISOString(),
//                     contentLength: content.length,
//                     executionTime: Date.now() - startTime,
//                     error: error instanceof Error ? error.message : String(error)
//                 }
//             };
//         }
//     }

//     /**
//      * 特定領域の分析を実行
//      * 
//      * 指定した分析ドメインのみを対象に分析を実行します。
//      * 単一のサービスに分析を委譲するシンプルなインターフェースを提供します。
//      * 
//      * @param content 分析対象のコンテンツ
//      * @param domain 分析ドメイン
//      * @param options 分析オプション
//      * @returns 分析結果
//      */
//     async analyzeSpecificDomain(content: string, domain: AnalysisDomain, options: any = {}): Promise<any> {
//         logger.info(`${domain}ドメインの分析を開始`, {
//             contentLength: content.length,
//             domain,
//             options: JSON.stringify(options)
//         });

//         this.startTiming(`${domain}Analysis`);

//         try {
//             let result;

//             switch (domain) {
//                 case 'chapter':
//                     result = await this.analyzeChapter(content, options);
//                     break;
//                 case 'style':
//                     result = await this.analyzeStyle(content, options);
//                     break;
//                 case 'character':
//                     result = await this.analyzeCharacters(content, options);
//                     break;
//                 case 'narrative':
//                     result = await this.analyzeNarrative(content, options);
//                     break;
//                 case 'theme':
//                     result = await this.analyzeTheme(content, options);
//                     break;
//                 default:
//                     throw new AnalysisError('INVALID_DOMAIN', `無効な分析ドメイン: ${domain}`);
//             }

//             this.endTiming(`${domain}Analysis`);

//             logger.info(`${domain}ドメインの分析が完了`, {
//                 resultSize: JSON.stringify(result).length
//             });

//             return result;
//         } catch (error) {
//             this.endTiming(`${domain}Analysis`);

//             logger.error(`${domain}ドメインの分析中にエラーが発生`, {
//                 error: error instanceof Error ? error.message : String(error),
//                 stack: error instanceof Error ? error.stack : undefined
//             });

//             throw new AnalysisError(
//                 'DOMAIN_ANALYSIS_FAILED',
//                 `${domain}ドメイン分析に失敗しました: ${error instanceof Error ? error.message : String(error)}`
//             );
//         }
//     }

//     /**
//      * 章分析を実行
//      * 
//      * 章の構造、内容、パターンを分析します。
//      * 
//      * @param content 分析対象のコンテンツ
//      * @param options 章分析オプション
//      * @returns 章分析結果
//      */
//     async analyzeChapter(content: string, options: ChapterAnalysisOptions = {}): Promise<any> {
//         try {
//             const chapterNumber = options.chapterNumber || this.inferChapterNumber(content);

//             // 詳細分析モードでは完全な分析を実行
//             if (options.detailed) {
//                 const context = options.context || {};
//                 return await this.chapterAnalysisService.analyzeChapter(content, chapterNumber, context);
//             }

//             // シーン抽出
//             if (options.extractScenes) {
//                 return await this.chapterAnalysisService.getScenes(content, chapterNumber);
//             }

//             // 品質メトリクスのみ
//             if (options.qualityMetricsOnly) {
//                 const context = options.context || {};
//                 return await this.chapterAnalysisService.getQualityMetrics(content, chapterNumber, context);
//             }

//             // キーワード抽出
//             if (options.extractKeywords) {
//                 return await this.chapterAnalysisService.extractKeywords(content);
//             }

//             // デフォルトでは基本分析を実行
//             return await this.chapterAnalysisService.getTextStatistics(content);
//         } catch (error) {
//             logger.error('章分析に失敗', {
//                 error: error instanceof Error ? error.message : String(error)
//             });
//             throw new AnalysisError(
//                 'CHAPTER_ANALYSIS_FAILED',
//                 `章分析に失敗しました: ${error instanceof Error ? error.message : String(error)}`
//             );
//         }
//     }

//     /**
//      * 文体分析を実行
//      * 
//      * テキストの文体特性、表現パターン、リズムを分析します。
//      * 
//      * @param content 分析対象のコンテンツ
//      * @param options 文体分析オプション
//      * @returns 文体分析結果
//      */
//     async analyzeStyle(content: string, options: StyleAnalysisOptions = {}): Promise<any> {
//         try {
//             // 詳細分析モードでは完全な分析を実行
//             if (options.detailed) {
//                 const styleAnalysis = await this.styleAnalysisService.analyzeStyle(content);

//                 // 表現パターン分析も要求されている場合
//                 if (options.includeExpressionPatterns) {
//                     const expressionPatterns = await this.styleAnalysisService.analyzeExpressionPatterns(content);
//                     return { ...styleAnalysis, expressionPatterns };
//                 }

//                 return styleAnalysis;
//             }

//             // 表現パターンのみ
//             if (options.expressionPatternsOnly) {
//                 return await this.styleAnalysisService.analyzeExpressionPatterns(content);
//             }

//             // 主語パターンのみ
//             if (options.subjectPatternsOnly) {
//                 return await this.styleAnalysisService.analyzeSubjectPatterns(content);
//             }

//             // 文体ガイダンス生成
//             if (options.generateGuidance) {
//                 const chapterNumber = options.chapterNumber || this.inferChapterNumber(content);
//                 const context = options.context || {};
//                 return await this.styleAnalysisService.generateStyleGuidance(chapterNumber, context);
//             }

//             // 代替表現提案
//             if (options.suggestAlternatives) {
//                 const chapterNumber = options.chapterNumber || this.inferChapterNumber(content);
//                 return await this.styleAnalysisService.suggestAlternativeExpressions(chapterNumber);
//             }

//             // デフォルトでは基本メトリクスを返す
//             return await this.styleAnalysisService.getBasicStyleMetrics(content);
//         } catch (error) {
//             logger.error('文体分析に失敗', {
//                 error: error instanceof Error ? error.message : String(error)
//             });
//             throw new AnalysisError(
//                 'STYLE_ANALYSIS_FAILED',
//                 `文体分析に失敗しました: ${error instanceof Error ? error.message : String(error)}`
//             );
//         }
//     }

//     /**
//      * キャラクター分析を実行
//      * 
//      * テキスト内のキャラクターの行動、心理、関係性を分析します。
//      * 
//      * @param content 分析対象のコンテンツ
//      * @param options キャラクター分析オプション
//      * @returns キャラクター分析結果
//      */
//     async analyzeCharacters(content: string, options: CharacterAnalysisOptions = {}): Promise<any> {
//         try {
//             // キャラクター出現検出
//             if (options.detectAppearances) {
//                 const detectionOptions = options.detectionOptions || { minSignificance: 0.3 };
//                 return await this.characterAnalysisService.detectCharacterAppearances(content, detectionOptions);
//             }

//             // キャラクター心理分析
//             if (options.analyzePsychology) {
//                 const characterId = options.characterId;
//                 if (!characterId) {
//                     throw new AnalysisError('MISSING_CHARACTER_ID', 'キャラクター心理分析にはcharacterIdが必要です');
//                 }

//                 const chapterNumber = options.chapterNumber || this.inferChapterNumber(content);
//                 const chapterEvents = options.chapterEvents || [];
//                 const analysisOptions = options.psychologyOptions || {};

//                 return await this.characterAnalysisService.analyzeCharacterPsychology(
//                     characterId,
//                     chapterEvents,
//                     analysisOptions
//                 );
//             }

//             // 複数キャラクターの心理分析
//             if (options.analyzeMultiplePsychologies) {
//                 const characterIds = options.characterIds;
//                 if (!characterIds || !Array.isArray(characterIds) || characterIds.length === 0) {
//                     throw new AnalysisError('MISSING_CHARACTER_IDS', '複数キャラクター心理分析にはcharacterIdsが必要です');
//                 }

//                 const chapterNumber = options.chapterNumber || this.inferChapterNumber(content);
//                 return await this.characterAnalysisService.analyzeMultipleCharacterPsychologies(
//                     characterIds,
//                     chapterNumber
//                 );
//             }

//             // キャラクター関係グラフ分析
//             if (options.analyzeRelationships) {
//                 const chapterNumber = options.chapterNumber || this.inferChapterNumber(content);
//                 return await this.characterAnalysisService.analyzeRelationshipGraph(chapterNumber);
//             }

//             // キャラクター言及分析
//             if (options.analyzeMentions) {
//                 const chapterNumber = options.chapterNumber || this.inferChapterNumber(content);
//                 return await this.characterAnalysisService.analyzeCharacterMentions(content, chapterNumber);
//             }

//             // デフォルトはキャラクター出現検出
//             const defaultDetectionOptions = { minSignificance: 0.3 };
//             return await this.characterAnalysisService.detectCharacterAppearances(
//                 content,
//                 defaultDetectionOptions
//             );
//         } catch (error) {
//             logger.error('キャラクター分析に失敗', {
//                 error: error instanceof Error ? error.message : String(error)
//             });
//             throw new AnalysisError(
//                 'CHARACTER_ANALYSIS_FAILED',
//                 `キャラクター分析に失敗しました: ${error instanceof Error ? error.message : String(error)}`
//             );
//         }
//     }

//     /**
//      * 物語分析を実行
//      * 
//      * 物語構造、アーク、テンション、流れを分析します。
//      * 
//      * @param content 分析対象のコンテンツ
//      * @param options 物語分析オプション
//      * @returns 物語分析結果
//      */
//     async analyzeNarrative(content: string, options: NarrativeAnalysisOptions = {}): Promise<any> {
//         try {
//             const chapterNumber = options.chapterNumber || this.inferChapterNumber(content);

//             // 章から更新
//             if (options.updateFromChapter) {
//                 const chapter = options.chapter || {
//                     chapterNumber,
//                     content,
//                     id: `chapter-${chapterNumber}`,
//                     title: `第${chapterNumber}章`,
//                     wordCount: this.countWords(content),
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     metadata: {}
//                 };

//                 return await this.narrativeAnalysisService.updateFromChapter(chapter);
//             }

//             // テンションとペーシングの推奨値を取得
//             if (options.getTensionPacing) {
//                 return await this.narrativeAnalysisService.getTensionPacingRecommendation(
//                     chapterNumber,
//                     options.genre
//                 );
//             }

//             // 感情曲線の取得
//             if (options.getEmotionalCurve) {
//                 const startChapter = options.startChapter || Math.max(1, chapterNumber - 5);
//                 const endChapter = options.endChapter || chapterNumber;
//                 return await this.narrativeAnalysisService.getEmotionalCurve(startChapter, endChapter);
//             }

//             // 停滞検出
//             if (options.detectStagnation) {
//                 return await this.narrativeAnalysisService.detectStagnation(chapterNumber);
//             }

//             // 次の状態の提案
//             if (options.suggestNextState) {
//                 return this.narrativeAnalysisService.suggestNextState();
//             }

//             // デフォルトでは現在の物語状態を返す
//             return this.narrativeAnalysisService.getCurrentNarrativeState();
//         } catch (error) {
//             logger.error('物語分析に失敗', {
//                 error: error instanceof Error ? error.message : String(error)
//             });
//             throw new AnalysisError(
//                 'NARRATIVE_ANALYSIS_FAILED',
//                 `物語分析に失敗しました: ${error instanceof Error ? error.message : String(error)}`
//             );
//         }
//     }

//     /**
//      * テーマ分析を実行
//      * 
//      * テーマ、モチーフ、象徴、伏線を分析します。
//      * 
//      * @param content 分析対象のコンテンツ
//      * @param options テーマ分析オプション
//      * @returns テーマ分析結果
//      */
//     async analyzeTheme(content: string, options: ThemeAnalysisOptions = {}): Promise<any> {
//         try {
//             const chapterNumber = options.chapterNumber || this.inferChapterNumber(content);

//             // テーマ共鳴分析
//             if (options.analyzeResonance) {
//                 const themes = options.themes || [];
//                 return await this.themeAnalysisService.analyzeThemeResonance(content, themes);
//             }

//             // テーマ強化提案
//             if (options.suggestEnhancements) {
//                 const analysis = options.analysis || await this.themeAnalysisService.analyzeThemeResonance(content, options.themes || []);
//                 return await this.themeAnalysisService.suggestThemeEnhancements(analysis, chapterNumber);
//             }

//             // 伏線処理
//             if (options.processForeshadowing) {
//                 return await this.themeAnalysisService.processForeshadowing(content, chapterNumber);
//             }

//             // テーマ存在の可視化
//             if (options.visualizeThemePresence) {
//                 const theme = options.theme;
//                 if (!theme) {
//                     throw new AnalysisError('MISSING_THEME', 'テーマ可視化にはthemeが必要です');
//                 }
//                 return await this.themeAnalysisService.visualizeThemePresence(content, theme);
//             }

//             // 象徴とイメージの分析
//             if (options.analyzeSymbolism) {
//                 return await this.themeAnalysisService.analyzeSymbolismAndImagery(content);
//             }

//             // テーマと物語要素の関連性分析
//             if (options.analyzeThemeElementResonance) {
//                 const { theme, elementType, context: elementContext } = options;
//                 if (!theme || !elementType || !elementContext) {
//                     throw new AnalysisError('MISSING_PARAMETERS', 'テーマ要素共鳴分析にはtheme、elementType、contextが必要です');
//                 }
//                 return await this.themeAnalysisService.analyzeThemeElementResonance(
//                     theme,
//                     elementType,
//                     elementContext
//                 );
//             }

//             // デフォルトはテーマ共鳴分析
//             return await this.themeAnalysisService.analyzeThemeResonance(content, options.themes || []);
//         } catch (error) {
//             logger.error('テーマ分析に失敗', {
//                 error: error instanceof Error ? error.message : String(error)
//             });
//             throw new AnalysisError(
//                 'THEME_ANALYSIS_FAILED',
//                 `テーマ分析に失敗しました: ${error instanceof Error ? error.message : String(error)}`
//             );
//         }
//     }

//     // ヘルパーメソッド

//     /**
//      * 分析オプションを準備
//      * デフォルト値の設定や値の検証を行います
//      * 
//      * @private
//      * @param options ユーザー指定のオプション
//      * @returns 準備されたオプション
//      */
//     private prepareAnalysisOptions(options: AnalysisOptions): AnalysisOptions {
//         return {
//             chapterNumber: options.chapterNumber,
//             domains: options.domains || ['chapter', 'style', 'character', 'narrative', 'theme'],
//             priority: options.priority || 'balanced',
//             detailedAnalysis: options.detailedAnalysis !== undefined ? options.detailedAnalysis : true,
//             crossDomainAnalysis: options.crossDomainAnalysis !== undefined ? options.crossDomainAnalysis : true,
//             maxConcurrentAnalyses: options.maxConcurrentAnalyses || 3,
//             domainSpecificOptions: options.domainSpecificOptions || {},
//             context: options.context || {}
//         };
//     }

//     /**
//      * コンテンツから章番号を推定
//      * 
//      * @private
//      * @param content コンテンツ
//      * @returns 推定された章番号
//      */
//     private inferChapterNumber(content: string): number {
//         // ヘッダーや最初の行から章番号を抽出する試み
//         const chapterMatch = content.match(/第(\d+)章/);
//         if (chapterMatch && chapterMatch[1]) {
//             return parseInt(chapterMatch[1], 10);
//         }

//         // ヘッダーメタデータから抽出を試みる（YAMLフォーマット）
//         const yamlHeaderMatch = content.match(/---\s*([\s\S]*?)\s*---/);
//         if (yamlHeaderMatch && yamlHeaderMatch[1]) {
//             const chapterNumberMatch = yamlHeaderMatch[1].match(/chapterNumber\s*:\s*(\d+)/);
//             if (chapterNumberMatch && chapterNumberMatch[1]) {
//                 return parseInt(chapterNumberMatch[1], 10);
//             }
//         }

//         // デフォルト値として1を返す
//         return 1;
//     }

//     /**
//      * ドメインを優先度順にソート
//      * 
//      * @private
//      * @param domains 分析ドメインの配列
//      * @param priority 優先度設定
//      * @returns 優先順にソートされたドメイン配列
//      */
//     private prioritizeDomains(domains: AnalysisDomain[], priority: AnalysisPriority): AnalysisDomain[] {
//         // 各優先度設定に応じたドメイン順序
//         const priorityOrder: Record<AnalysisPriority, AnalysisDomain[]> = {
//             'balanced': ['chapter', 'style', 'character', 'narrative', 'theme'],
//             'performance': ['chapter', 'style', 'narrative', 'character', 'theme'],
//             'quality': ['theme', 'character', 'narrative', 'style', 'chapter'],
//             'character-focused': ['character', 'narrative', 'theme', 'style', 'chapter'],
//             'narrative-focused': ['narrative', 'theme', 'character', 'style', 'chapter'],
//             'style-focused': ['style', 'chapter', 'theme', 'narrative', 'character']
//         };

//         // 選択された優先度順でソート
//         const order = priorityOrder[priority];
//         if (!order) {
//             // 不明な優先度設定の場合はバランス設定を使用
//             return [...domains].sort((a, b) =>
//                 priorityOrder['balanced'].indexOf(a) - priorityOrder['balanced'].indexOf(b)
//             );
//         }

//         return [...domains].sort((a, b) => order.indexOf(a) - order.indexOf(b));
//     }

//     /**
//      * ベース分析のPromiseを作成
//      * 
//      * @private
//      * @param content コンテンツ
//      * @param options 分析オプション
//      * @param chapterNumber 章番号
//      * @returns Promiseのマップ
//      */
//     private createBaseAnalysisPromises(
//         content: string,
//         options: AnalysisOptions,
//         chapterNumber: number
//     ): Map<string, Promise<any>> {
//         const promises = new Map<string, Promise<any>>();
//         const domainOptions = options.domainSpecificOptions || {};

//         // 章分析
//         if (options.domains.includes('chapter')) {
//             promises.set('chapterAnalysis', this.chapterAnalysisService.getTextStatistics(content));

//             // 章のキーワード抽出も実行
//             promises.set('keywords', this.chapterAnalysisService.extractKeywords(content));
//         }

//         // 文体分析
//         if (options.domains.includes('style')) {
//             promises.set('styleAnalysis', this.styleAnalysisService.getBasicStyleMetrics(content));
//         }

//         // キャラクター出現検出
//         if (options.domains.includes('character')) {
//             const detectionOptions = domainOptions.character?.detectionOptions || { minSignificance: 0.3 };
//             promises.set('characterAppearances',
//                 this.characterAnalysisService.detectCharacterAppearances(content, detectionOptions)
//             );
//         }

//         // 物語状態分析
//         if (options.domains.includes('narrative')) {
//             promises.set('narrativeState', this.narrativeAnalysisService.getCurrentNarrativeState());
//         }

//         return promises;
//     }

//     /**
//      * ベース分析を実行
//      * 
//      * @private
//      * @param promises 分析プロミスのマップ
//      * @param prioritizedDomains 優先順のドメイン
//      * @returns 基本分析結果
//      */
//     private async executeBaseAnalysis(
//         promises: Map<string, Promise<any>>,
//         prioritizedDomains: AnalysisDomain[]
//     ): Promise<PartialAnalysisResult> {
//         const results: PartialAnalysisResult = {};

//         // Promise.allSettledで全てのプロミスを実行し、結果を処理
//         const settledPromises = await Promise.allSettled(
//             Array.from(promises.entries()).map(async ([key, promise]) => {
//                 try {
//                     const result = await promise;
//                     return { key, result };
//                 } catch (error) {
//                     logger.warn(`ベース分析 '${key}' に失敗`, {
//                         error: error instanceof Error ? error.message : String(error)
//                     });
//                     throw { key, error };
//                 }
//             })
//         );

//         // 成功した結果を統合
//         settledPromises.forEach(promise => {
//             if (promise.status === 'fulfilled') {
//                 const { key, result } = promise.value;

//                 // 結果タイプに応じてマッピング
//                 if (key === 'chapterAnalysis') {
//                     results.textStatistics = result;
//                 } else if (key === 'keywords') {
//                     results.keywords = result;
//                 } else if (key === 'styleAnalysis') {
//                     results.styleMetrics = result;
//                 } else if (key === 'characterAppearances') {
//                     results.characterAppearances = result;
//                 } else if (key === 'narrativeState') {
//                     results.narrativeState = result;
//                 } else {
//                     // その他の結果はそのままのキーで保存
//                     results[key] = result;
//                 }
//             } else {
//                 // エラーのログは上で記録済み
//             }
//         });

//         return results;
//     }

//     /**
//      * 詳細分析を実行
//      * 
//      * @private
//      * @param content コンテンツ
//      * @param baseResults ベース分析結果
//      * @param options 分析オプション
//      * @param chapterNumber 章番号
//      * @param prioritizedDomains 優先順のドメイン
//      * @returns 詳細分析結果
//      */
//     private async performDetailedAnalysis(
//         content: string,
//         baseResults: PartialAnalysisResult,
//         options: AnalysisOptions,
//         chapterNumber: number,
//         prioritizedDomains: AnalysisDomain[]
//     ): Promise<PartialAnalysisResult> {
//         const detailedResults: PartialAnalysisResult = {};
//         const domainOptions = options.domainSpecificOptions || {};
//         const context = options.context || {};

//         // 詳細な章分析
//         if (options.domains.includes('chapter')) {
//             try {
//                 this.startTiming('detailedChapterAnalysis');
//                 const chapterAnalysis = await this.chapterAnalysisService.analyzeChapter(content, chapterNumber, context);
//                 detailedResults.chapterAnalysis = chapterAnalysis;
//                 this.endTiming('detailedChapterAnalysis');
//             } catch (error) {
//                 logger.warn('詳細な章分析に失敗', {
//                     error: error instanceof Error ? error.message : String(error)
//                 });
//             }
//         }

//         // 詳細な文体分析
//         if (options.domains.includes('style')) {
//             try {
//                 this.startTiming('detailedStyleAnalysis');
//                 const styleAnalysis = await this.styleAnalysisService.analyzeStyle(content);
//                 detailedResults.styleAnalysis = styleAnalysis;

//                 // 表現パターン分析
//                 const expressionPatterns = await this.styleAnalysisService.analyzeExpressionPatterns(content);
//                 detailedResults.expressionPatterns = expressionPatterns;

//                 // 主語パターン分析
//                 const subjectPatterns = await this.styleAnalysisService.analyzeSubjectPatterns(content);
//                 detailedResults.subjectPatterns = subjectPatterns;
//                 this.endTiming('detailedStyleAnalysis');
//             } catch (error) {
//                 logger.warn('詳細な文体分析に失敗', {
//                     error: error instanceof Error ? error.message : String(error)
//                 });
//             }
//         }

//         // 詳細なキャラクター分析（baseResultsのキャラクター出現に基づく）
//         if (options.domains.includes('character') && baseResults.characterAppearances) {
//             try {
//                 this.startTiming('detailedCharacterAnalysis');

//                 // 重要キャラクターの特定
//                 const significantCharacters = this.extractSignificantCharacters(baseResults.characterAppearances);

//                 // 複数キャラクターの心理分析
//                 if (significantCharacters.length > 0) {
//                     const psychologies = await this.characterAnalysisService.analyzeMultipleCharacterPsychologies(
//                         significantCharacters,
//                         chapterNumber
//                     );
//                     detailedResults.characterPsychologies = psychologies;
//                 }

//                 // キャラクター言及分析
//                 const mentions = await this.characterAnalysisService.analyzeCharacterMentions(content, chapterNumber);
//                 detailedResults.characterMentions = mentions;

//                 this.endTiming('detailedCharacterAnalysis');
//             } catch (error) {
//                 logger.warn('詳細なキャラクター分析に失敗', {
//                     error: error instanceof Error ? error.message : String(error)
//                 });
//             }
//         }

//         // 詳細なテーマ分析
//         if (options.domains.includes('theme')) {
//             try {
//                 this.startTiming('detailedThemeAnalysis');

//                 // テーマのリストを取得
//                 const themes = domainOptions.theme?.themes ||
//                     context.themes ||
//                     context.theme ? [context.theme] : [];

//                 // テーマ共鳴分析
//                 const themeResonance = await this.themeAnalysisService.analyzeThemeResonance(content, themes);
//                 detailedResults.themeResonance = themeResonance;

//                 // テーマ強化提案
//                 const themeEnhancements = await this.themeAnalysisService.suggestThemeEnhancements(
//                     themeResonance,
//                     chapterNumber
//                 );
//                 detailedResults.themeEnhancements = themeEnhancements;

//                 // 象徴とイメージの分析
//                 const symbolism = await this.themeAnalysisService.analyzeSymbolismAndImagery(content);
//                 detailedResults.symbolism = symbolism;

//                 this.endTiming('detailedThemeAnalysis');
//             } catch (error) {
//                 logger.warn('詳細なテーマ分析に失敗', {
//                     error: error instanceof Error ? error.message : String(error)
//                 });
//             }
//         }

//         // 詳細な物語分析
//         if (options.domains.includes('narrative')) {
//             try {
//                 this.startTiming('detailedNarrativeAnalysis');

//                 // テンションとペーシングの推奨
//                 const tensionPacing = await this.narrativeAnalysisService.getTensionPacingRecommendation(
//                     chapterNumber,
//                     context.genre
//                 );
//                 detailedResults.tensionPacingRecommendation = tensionPacing;

//                 // 感情曲線の取得
//                 const startChapter = Math.max(1, chapterNumber - 5);
//                 const emotionalCurve = await this.narrativeAnalysisService.getEmotionalCurve(
//                     startChapter,
//                     chapterNumber
//                 );
//                 detailedResults.emotionalCurve = emotionalCurve;

//                 // 停滞検出
//                 const stagnation = await this.narrativeAnalysisService.detectStagnation(chapterNumber);
//                 detailedResults.stagnationDetection = stagnation;

//                 // 次の状態提案
//                 const nextState = this.narrativeAnalysisService.suggestNextState();
//                 detailedResults.suggestedNextState = nextState;

//                 this.endTiming('detailedNarrativeAnalysis');
//             } catch (error) {
//                 logger.warn('詳細な物語分析に失敗', {
//                     error: error instanceof Error ? error.message : String(error)
//                 });
//             }
//         }

//         return detailedResults;
//     }

//     /**
//      * 横断的分析を実行
//      * 
//      * @private
//      * @param content コンテンツ
//      * @param analysisResults これまでの分析結果
//      * @param options 分析オプション
//      * @param chapterNumber 章番号
//      * @returns 横断的分析結果
//      */
//     private async performCrossDomainAnalysis(
//         content: string,
//         analysisResults: PartialAnalysisResult,
//         options: AnalysisOptions,
//         chapterNumber: number
//     ): Promise<PartialAnalysisResult> {
//         const crossDomainResults: PartialAnalysisResult = {};
//         const context = options.context || {};

//         // テーマとキャラクターの関連性分析
//         if (options.domains.includes('theme') &&
//             options.domains.includes('character') &&
//             analysisResults.themeResonance &&
//             analysisResults.characterAppearances) {
//             try {
//                 // 最も支配的なテーマを抽出
//                 const dominantTheme = analysisResults.themeResonance.dominantTheme;

//                 // 重要キャラクターを抽出
//                 const significantCharacters = this.extractSignificantCharacters(
//                     analysisResults.characterAppearances
//                 );

//                 if (dominantTheme && significantCharacters.length > 0) {
//                     // 各キャラクターとテーマの関連性を分析
//                     const themeCharacterResonance = await Promise.all(
//                         significantCharacters.slice(0, 3).map(async characterId => {
//                             const character = analysisResults.characterAppearances.find(
//                                 c => c.characterId === characterId
//                             );

//                             if (!character) return null;

//                             const characterContext = `キャラクター名: ${character.characterName}
// 行動: ${character.actions?.join(', ') || ''}
// 感情: ${character.emotions?.join(', ') || ''}`;

//                             try {
//                                 return await this.themeAnalysisService.analyzeThemeElementResonance(
//                                     dominantTheme,
//                                     'character',
//                                     characterContext
//                                 );
//                             } catch (error) {
//                                 logger.warn(`キャラクター「${character.characterName}」とテーマ「${dominantTheme}」の関連性分析に失敗`, {
//                                     error: error instanceof Error ? error.message : String(error)
//                                 });
//                                 return null;
//                             }
//                         })
//                     );

//                     // 結果をフィルタリングし格納
//                     crossDomainResults.themeCharacterResonance = themeCharacterResonance.filter(Boolean);
//                 }
//             } catch (error) {
//                 logger.warn('テーマとキャラクターの関連性分析に失敗', {
//                     error: error instanceof Error ? error.message : String(error)
//                 });
//             }
//         }

//         // テーマと物語状態の関連性分析
//         if (options.domains.includes('theme') &&
//             options.domains.includes('narrative') &&
//             analysisResults.themeResonance &&
//             analysisResults.narrativeState) {
//             try {
//                 // 最も支配的なテーマを抽出
//                 const dominantTheme = analysisResults.themeResonance.dominantTheme;

//                 // 物語状態をコンテキストとして構成
//                 const narrativeContext = `物語状態: ${analysisResults.narrativeState.state}
// フェーズ: ${analysisResults.narrativeState.phase}
// アーク進行: ${analysisResults.narrativeState.arcProgress}
// 全体進行: ${analysisResults.narrativeState.totalProgress}`;

//                 if (dominantTheme) {
//                     const themeNarrativeResonance = await this.themeAnalysisService.analyzeThemeElementResonance(
//                         dominantTheme,
//                         'narrative',
//                         narrativeContext
//                     );

//                     crossDomainResults.themeNarrativeResonance = themeNarrativeResonance;
//                 }
//             } catch (error) {
//                 logger.warn('テーマと物語状態の関連性分析に失敗', {
//                     error: error instanceof Error ? error.message : String(error)
//                 });
//             }
//         }

//         // 物語進行と文体の関連性分析
//         if (options.domains.includes('narrative') &&
//             options.domains.includes('style') &&
//             analysisResults.narrativeState &&
//             analysisResults.styleAnalysis) {
//             try {
//                 // 文体ガイダンスを生成
//                 const styleGuidance = await this.styleAnalysisService.generateStyleGuidance(
//                     chapterNumber,
//                     {
//                         ...context,
//                         narrativeState: analysisResults.narrativeState
//                     }
//                 );

//                 crossDomainResults.styleGuidance = styleGuidance;
//             } catch (error) {
//                 logger.warn('物語進行と文体の関連性分析に失敗', {
//                     error: error instanceof Error ? error.message : String(error)
//                 });
//             }
//         }

//         // 総合的な改善提案の生成
//         try {
//             const improvementSuggestions = this.generateImprovementSuggestions(analysisResults);
//             crossDomainResults.improvementSuggestions = improvementSuggestions;
//         } catch (error) {
//             logger.warn('総合的な改善提案の生成に失敗', {
//                 error: error instanceof Error ? error.message : String(error)
//             });
//         }

//         return crossDomainResults;
//     }

//     /**
//      * コンテンツの要約を生成
//      * 
//      * @private
//      * @param content コンテンツ
//      * @param chapterNumber 章番号
//      * @returns 生成された要約
//      */
//     private async generateContentSummary(content: string, chapterNumber: number): Promise<string> {
//         try {
//             // 最大5000文字までのコンテンツを使用
//             const truncatedContent = content.length > 5000
//                 ? content.substring(0, 5000) + '...'
//                 : content;

//             const prompt = `
//   以下の小説の章を150〜200字程度にまとめて要約してください。
//   主要なプロット展開、キャラクターの変化、重要なイベントを含めてください。
  
//   第${chapterNumber}章の内容:
//   ${truncatedContent}
  
//   要約:`;

//             const response = await this.geminiAdapter.generateText(prompt, {
//                 temperature: 0.1,
//                 targetLength: 200,
//                 purpose: 'summarization'
//             });

//             return response.trim();
//         } catch (error) {
//             logger.warn('コンテンツ要約の生成に失敗', {
//                 error: error instanceof Error ? error.message : String(error)
//             });
//             return '要約を生成できませんでした。';
//         }
//     }


//     /**
//      * 要約から重要ポイントを抽出
//      * 
//      * @private
//      * @param summary 要約テキスト
//      * @returns 抽出された重要ポイント
//      */
//     private async extractKeyPointsFromSummary(summary: string): Promise<string[]> {
//         try {
//             const prompt = `
//   以下の小説の章の要約から、最も重要なポイントを3〜5つ抽出してください。
//   それぞれのポイントは箇条書きで、20-40字程度に簡潔にまとめてください。
  
//   要約:
//   ${summary}
  
//   重要ポイント:`;

//             const response = await this.geminiAdapter.generateText(prompt, {
//                 temperature: 0.1,
//                 targetLength: 300,
//                 purpose: 'analysis'
//             });

//             // 箇条書きから配列への変換
//             const keyPoints = response
//                 .split('\n')
//                 .map(line => line.trim())
//                 .filter(line => line.length > 0 && line.match(/^[-•*]|\d+[\.、\)]|・/))
//                 .map(line => line.replace(/^[-•*]|\d+[\.、\)]|・\s*/, '').trim());

//             return keyPoints;
//         } catch (error) {
//             logger.warn('重要ポイント抽出に失敗', {
//                 error: error instanceof Error ? error.message : String(error)
//             });
//             return [];
//         }
//     }

//     /**
//      * 重要キャラクターを抽出
//      * 
//      * @private
//      * @param appearances キャラクター出現情報
//      * @returns 重要キャラクターのID配列
//      */
//     private extractSignificantCharacters(appearances: any[]): string[] {
//         if (!appearances || !Array.isArray(appearances)) return [];

//         // 重要度でソート
//         const sorted = [...appearances].sort((a, b) => {
//             const sigA = typeof a.significance === 'number' ? a.significance : 0;
//             const sigB = typeof b.significance === 'number' ? b.significance : 0;
//             return sigB - sigA;
//         });

//         // 重要度0.5以上、または上位3名までのキャラクターを抽出
//         return sorted
//             .filter((char, index) =>
//                 (char.significance >= 0.5 || index < 3) &&
//                 char.characterId
//             )
//             .map(char => char.characterId);
//     }

//     /**
//      * 総合的な改善提案を生成
//      * 
//      * @private
//      * @param results 分析結果
//      * @returns 改善提案の配列
//      */
//     private generateImprovementSuggestions(results: PartialAnalysisResult): string[] {
//         const suggestions: string[] = [];

//         // 章分析からの提案
//         if (results.chapterAnalysis?.qualityMetrics) {
//             const metrics = results.chapterAnalysis.qualityMetrics;

//             if (metrics.readability < 0.6) {
//                 suggestions.push("文章の読みやすさを向上させるために、より明確で簡潔な表現を心がけてください");
//             }

//             if (metrics.consistency < 0.6) {
//                 suggestions.push("物語の一貫性を高めるために、設定やキャラクターの行動に矛盾がないか確認してください");
//             }

//             if (metrics.engagement < 0.6) {
//                 suggestions.push("読者の興味を引きつけるために、より魅力的な対立や未解決の問題を導入してください");
//             }
//         }

//         // 文体分析からの提案
//         if (results.styleAnalysis) {
//             if (results.styleAnalysis.sentenceVariety < 0.5) {
//                 suggestions.push("文の長さやリズムにもっと変化をつけて、文章に流れを生み出してください");
//             }

//             if (results.styleAnalysis.vocabularyRichness < 0.5) {
//                 suggestions.push("より多様な語彙を使用して、表現の豊かさを向上させてください");
//             }
//         }

//         // 主語パターン分析からの提案
//         if (results.subjectPatterns && results.subjectPatterns.suggestions) {
//             suggestions.push(...results.subjectPatterns.suggestions.slice(0, 2));
//         }

//         // テーマ分析からの提案
//         if (results.themeEnhancements) {
//             const themeEnhancements = results.themeEnhancements.slice(0, 2);
//             suggestions.push(
//                 ...themeEnhancements.map(enhancement => enhancement.suggestion)
//             );
//         }

//         // 物語進行からの提案
//         if (results.stagnationDetection?.isStagnating) {
//             suggestions.push(results.stagnationDetection.suggestion);
//         }

//         // テーマとキャラクターの関連性からの提案
//         if (results.themeCharacterResonance) {
//             const resonances = results.themeCharacterResonance.slice(0, 2);
//             for (const resonance of resonances) {
//                 if (resonance && resonance.suggestions && resonance.suggestions.length > 0) {
//                     suggestions.push(resonance.suggestions[0]);
//                 }
//             }
//         }

//         // 重複を排除
//         const uniqueSuggestions = [...new Set(suggestions)];

//         // 最大10件に制限
//         return uniqueSuggestions.slice(0, 10);
//     }

//     /**
//      * 分析エラーの処理
//      * 
//      * @private
//      * @param error エラー
//      * @param partialResults 部分的な結果
//      * @returns エラー情報を含む分析結果
//      */
//     private handleAnalysisError(error: any, partialResults: any = {}): AnalysisResult {
//         // エラー情報を追加したメタデータ
//         const metadata = {
//             analyzedAt: new Date().toISOString(),
//             error: error instanceof Error ? error.message : String(error),
//             errorStack: error instanceof Error ? error.stack : undefined,
//             partial: true,
//             performanceMetrics: this.collectPerformanceMetrics()
//         };

//         // 部分的な結果を返す
//         return {
//             ...partialResults,
//             metadata,
//             error: {
//                 message: error instanceof Error ? error.message : String(error),
//                 code: error instanceof AnalysisError ? error.code : 'UNKNOWN_ERROR'
//             }
//         };
//     }

//     /**
//      * 単語数/文字数のカウント
//      * 
//      * @private
//      * @param text テキスト
//      * @returns 単語数または文字数
//      */
//     private countWords(text: string): number {
//         // 日本語の場合、単語数ではなく文字数をカウント
//         if (/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text)) {
//             return text.length;
//         }

//         // 英文の場合は単語数をカウント
//         return text.split(/\s+/).filter(word => word.length > 0).length;
//     }

//     /**
//      * パフォーマンス計測の開始
//      * 
//      * @private
//      * @param key 計測キー
//      */
//     private startTiming(key: string): void {
//         this.analysisTiming.set(key, { startTime: Date.now() });
//     }

//     /**
//      * パフォーマンス計測の終了
//      * 
//      * @private
//      * @param key 計測キー
//      */
//     private endTiming(key: string): void {
//         const timing = this.analysisTiming.get(key);
//         if (timing) {
//             timing.endTime = Date.now();
//             this.analysisTiming.set(key, timing);
//         }
//     }

//     /**
//      * パフォーマンスメトリクスの収集
//      * 
//      * @private
//      * @returns パフォーマンスメトリクス
//      */
//     private collectPerformanceMetrics(): Record<string, number> {
//         const metrics: Record<string, number> = {};

//         this.analysisTiming.forEach((timing, key) => {
//             if (timing.startTime && timing.endTime) {
//                 metrics[key] = timing.endTime - timing.startTime;
//             }
//         });

//         return metrics;
//     }
// }