// /**
//  * @fileoverview 品質向上サービスの調整と結果の統合を行うコーディネーター
//  * @description
//  * 複数の品質向上サービスからの結果を調整・統合し、一貫性のある推奨事項を提供します。
//  * 推奨事項の優先順位付け、競合解決、コンテキスト適応を行います。
//  */

// import { logger } from '@/lib/utils/logger';
// import { ChapterAnalysis, StyleGuidance, ExpressionAlternatives, GenerationContext } from '@/types/generation';
// import { ThemeResonanceAnalysis, ThemeEnhancement } from '@/lib/plot/theme-resonance-analyzer';
// import { TensionPacingRecommendation } from '@/lib/memory/dynamic-tension-optimizer';
// import { DepthRecommendation } from '@/types/characters';

// // 品質向上サービスインターフェース
// import { IStyleOptimizationService } from '../enhancement/style/interfaces';
// import { IThemeEnhancementService } from '../enhancement/theme/interfaces';
// import { ITensionOptimizationService } from '../enhancement/tension/interfaces';
// import { ICharacterDepthService } from '../enhancement/character/interfaces';

// /**
//  * @interface IEnhancementCoordinator
//  * @description
//  * 品質向上サービスの調整と結果の統合を行うコーディネーターのインターフェース。
//  */
// export interface IEnhancementCoordinator {
//     /**
//      * 初期化
//      */
//     initialize(): Promise<void>;

//     /**
//      * 文体ガイダンス生成
//      * @param chapterNumber 章番号
//      * @param context コンテキスト情報
//      */
//     generateStyleGuidance(chapterNumber: number, context: any): Promise<StyleGuidance>;

//     /**
//      * 改善提案生成
//      * @param analysis 章分析結果
//      * @param chapterNumber 章番号
//      * @param context 生成コンテキスト
//      */
//     generateImprovementSuggestions(
//         analysis: ChapterAnalysis,
//         chapterNumber: number,
//         context: GenerationContext
//     ): Promise<string[]>;

//     /**
//      * テーマ強化提案生成
//      * @param themeAnalysis テーマ分析結果
//      * @param chapterNumber 章番号
//      */
//     generateThemeEnhancements(
//         themeAnalysis: ThemeResonanceAnalysis,
//         chapterNumber: number
//     ): Promise<ThemeEnhancement[]>;

//     /**
//      * テンション・ペーシング推奨生成
//      * @param chapterNumber 章番号
//      * @param genre ジャンル
//      */
//     generateTensionPacingRecommendation(
//         chapterNumber: number,
//         genre?: string
//     ): Promise<TensionPacingRecommendation>;

//     /**
//      * キャラクター深化推奨生成
//      * @param characterIds キャラクターID配列
//      * @param chapterNumber 章番号
//      */
//     generateCharacterDepthRecommendations(
//         characterIds: string[],
//         chapterNumber: number
//     ): Promise<{ [id: string]: DepthRecommendation[] }>;

//     /**
//      * 代替表現提案生成
//      * @param chapterNumber 章番号
//      * @param content テキスト内容（オプション）
//      */
//     generateAlternativeExpressions(
//         chapterNumber: number,
//         content?: string
//     ): Promise<ExpressionAlternatives>;
// }

// /**
//  * @class EnhancementCoordinator
//  * @description
//  * 品質向上サービスの調整と結果の統合を行うコーディネーター。
//  * 各サービスからの推奨を収集し、優先順位付け、競合解決を行い、
//  * 一貫性のある推奨セットを生成します。
//  * 
//  * @implements IEnhancementCoordinator
//  */
// export class EnhancementCoordinator implements IEnhancementCoordinator {
//     private initialized: boolean = false;

//     /**
//      * コンストラクタ
//      * @param styleOptimizationService 文体最適化サービス
//      * @param themeEnhancementService テーマ強化サービス
//      * @param tensionOptimizationService テンション最適化サービス
//      * @param characterDepthService キャラクター深化サービス
//      */
//     constructor(
//         private styleOptimizationService: IStyleOptimizationService,
//         private themeEnhancementService: IThemeEnhancementService | null = null,
//         private tensionOptimizationService: ITensionOptimizationService | null = null,
//         private characterDepthService: ICharacterDepthService | null = null
//     ) {
//         logger.info('EnhancementCoordinator: インスタンス化');
//     }

//     /**
//      * 初期化
//      * 各サービスの初期化を行います。
//      */
//     async initialize(): Promise<void> {
//         if (this.initialized) {
//             logger.info('EnhancementCoordinator: 既に初期化済み');
//             return;
//         }

//         try {
//             logger.info('EnhancementCoordinator: 初期化開始');

//             // 各サービスの初期化
//             const initPromises: Promise<void>[] = [];

//             // 文体最適化サービスの初期化（必須）
//             if (typeof this.styleOptimizationService.initialize === 'function') {
//                 initPromises.push(this.styleOptimizationService.initialize().catch(err => {
//                     logger.warn(`StyleOptimizationService初期化エラー: ${err.message}`);
//                     // エラーを無視して続行
//                 }));
//             }

//             // オプショナルサービスの初期化
//             if (this.themeEnhancementService && typeof this.themeEnhancementService.initialize === 'function') {
//                 initPromises.push(this.themeEnhancementService.initialize().catch(err => {
//                     logger.warn(`ThemeEnhancementService初期化エラー: ${err.message}`);
//                     // エラーを無視して続行
//                 }));
//             }

//             if (this.tensionOptimizationService && typeof this.tensionOptimizationService.initialize === 'function') {
//                 initPromises.push(this.tensionOptimizationService.initialize().catch(err => {
//                     logger.warn(`TensionOptimizationService初期化エラー: ${err.message}`);
//                     // エラーを無視して続行
//                 }));
//             }

//             if (this.characterDepthService && typeof this.characterDepthService.initialize === 'function') {
//                 initPromises.push(this.characterDepthService.initialize().catch(err => {
//                     logger.warn(`CharacterDepthService初期化エラー: ${err.message}`);
//                     // エラーを無視して続行
//                 }));
//             }

//             // 全サービスの初期化を並行実行
//             await Promise.all(initPromises);

//             this.initialized = true;
//             logger.info('EnhancementCoordinator: 初期化完了');
//         } catch (error) {
//             logger.error('EnhancementCoordinator: 初期化中にエラーが発生', {
//                 error: error instanceof Error ? error.message : String(error)
//             });
//             throw error;
//         }
//     }

//     /**
//      * 文体ガイダンス生成
//      * @param chapterNumber 章番号
//      * @param context コンテキスト情報
//      */
//     async generateStyleGuidance(chapterNumber: number, context: any): Promise<StyleGuidance> {
//         try {
//             if (!this.initialized) {
//                 await this.initialize();
//             }

//             logger.info(`EnhancementCoordinator: 章${chapterNumber}の文体ガイダンス生成を開始`);

//             // 文体最適化サービスから文体ガイダンスを取得
//             const styleAnalysis = context.styleAnalysis || undefined;
//             const styleGuidance = await this.styleOptimizationService.generateStyleGuidance(
//                 styleAnalysis,
//                 context,
//                 chapterNumber
//             );

//             // テーマ強化サービスがある場合は、テーマに基づく提案も統合
//             if (this.themeEnhancementService && context.themeSettings) {
//                 try {
//                     const themeBasedGuidance = await this.themeEnhancementService.generateStyleGuidanceForTheme(
//                         typeof context.themeSettings === 'string' ? context.themeSettings : context.theme,
//                         context.genre
//                     );

//                     // テーマベースのガイダンスを統合
//                     return this.mergeStyleGuidance(styleGuidance, themeBasedGuidance);
//                 } catch (themeError) {
//                     logger.warn('テーマベースの文体ガイダンス取得に失敗', {
//                         error: themeError instanceof Error ? themeError.message : String(themeError)
//                     });
//                 }
//             }

//             return styleGuidance;
//         } catch (error) {
//             logger.error(`章${chapterNumber}の文体ガイダンス生成中にエラーが発生`, {
//                 error: error instanceof Error ? error.message : String(error)
//             });

//             // エラー時はデフォルト値を返す
//             return this.createDefaultStyleGuidance();
//         }
//     }

//     /**
//      * 改善提案生成
//      * @param analysis 章分析結果
//      * @param chapterNumber 章番号
//      * @param context 生成コンテキスト
//      */
//     async generateImprovementSuggestions(
//         analysis: ChapterAnalysis,
//         chapterNumber: number,
//         context: GenerationContext
//     ): Promise<string[]> {
//         try {
//             if (!this.initialized) {
//                 await this.initialize();
//             }

//             logger.info(`EnhancementCoordinator: 章${chapterNumber}の改善提案生成を開始`);

//             // 各サービスから提案を収集
//             const suggestions: SuggestionItem[] = [];

//             // 1. 文体最適化サービスからの提案
//             try {
//                 const styleSuggestions = await this.styleOptimizationService.generateStyleImprovementSuggestions(
//                     analysis,
//                     chapterNumber
//                 );

//                 styleSuggestions.forEach((text, index) => {
//                     suggestions.push({
//                         text,
//                         source: 'style',
//                         priority: 0.8 - (index * 0.05) // 優先度を少しずつ下げる
//                     });
//                 });
//             } catch (styleError) {
//                 logger.warn('文体改善提案の取得に失敗', {
//                     error: styleError instanceof Error ? styleError.message : String(styleError)
//                 });
//             }

//             // 2. テーマ強化サービスからの提案（利用可能な場合）
//             if (this.themeEnhancementService && analysis.themeOccurrences) {
//                 try {
//                     const themeData = {
//                         dominantThemes: analysis.themeOccurrences.map(t => t.theme),
//                         themeResonance: analysis.themeOccurrences.map(t => ({
//                             theme: t.theme,
//                             strength: t.strength,
//                             expressions: t.expressions || []
//                         })),
//                         themeDevelopment: "",
//                         suggestedEnhancements: []
//                     };

//                     const themeEnhancements = await this.themeEnhancementService.generateThemeEnhancements(
//                         themeData,
//                         chapterNumber
//                     );

//                     themeEnhancements.forEach((enhancement, index) => {
//                         suggestions.push({
//                             text: `テーマ「${enhancement.theme}」: ${enhancement.suggestion}`,
//                             source: 'theme',
//                             priority: 0.75 - (index * 0.05)
//                         });
//                     });
//                 } catch (themeError) {
//                     logger.warn('テーマ強化提案の取得に失敗', {
//                         error: themeError instanceof Error ? themeError.message : String(themeError)
//                     });
//                 }
//             }

//             // 3. テンション最適化サービスからの提案（利用可能な場合）
//             if (this.tensionOptimizationService) {
//                 try {
//                     const tensionLevel = analysis.tensionLevel || 0.5;
//                     const tensionSuggestions = await this.tensionOptimizationService.generateTensionOptimizationSuggestions(
//                         chapterNumber,
//                         tensionLevel
//                     );

//                     tensionSuggestions.forEach((text, index) => {
//                         suggestions.push({
//                             text,
//                             source: 'tension',
//                             priority: 0.7 - (index * 0.05)
//                         });
//                     });
//                 } catch (tensionError) {
//                     logger.warn('テンション最適化提案の取得に失敗', {
//                         error: tensionError instanceof Error ? tensionError.message : String(tensionError)
//                     });
//                 }
//             }

//             // 4. キャラクター深化提案（利用可能な場合）
//             if (this.characterDepthService && analysis.characterAppearances) {
//                 try {
//                     const characterIds = analysis.characterAppearances
//                         .filter(ca => ca.significance >= 0.6)
//                         .map(ca => ca.characterId)
//                         .slice(0, 3); // 上位3キャラクター

//                     if (characterIds.length > 0) {
//                         const characterRecommendations = await this.characterDepthService.generateMultipleCharacterRecommendations(
//                             characterIds,
//                             chapterNumber
//                         );

//                         // 各キャラクターの提案を統合
//                         Object.entries(characterRecommendations).forEach(([charId, recs], charIndex) => {
//                             const charName = analysis.characterAppearances.find(ca => ca.characterId === charId)?.characterName || charId;

//                             recs.forEach((rec, recIndex) => {
//                                 suggestions.push({
//                                     text: `キャラクター「${charName}」: ${rec.suggestion || rec.implementation}`,
//                                     source: 'character',
//                                     priority: 0.75 - (charIndex * 0.05) - (recIndex * 0.02)
//                                 });
//                             });
//                         });
//                     }
//                 } catch (charError) {
//                     logger.warn('キャラクター深化提案の取得に失敗', {
//                         error: charError instanceof Error ? charError.message : String(charError)
//                     });
//                 }
//             }

//             // 提案を重み付けし、重複を排除して優先度順にソート
//             const processedSuggestions = this.processSuggestions(suggestions, context);

//             // 最大10項目に制限
//             return processedSuggestions.map(s => s.text).slice(0, 10);
//         } catch (error) {
//             logger.error(`章${chapterNumber}の改善提案生成中にエラーが発生`, {
//                 error: error instanceof Error ? error.message : String(error)
//             });

//             // エラー時はデフォルト提案を返す
//             return this.createDefaultImprovementSuggestions();
//         }
//     }

//     /**
//      * 改善提案を保存する
//      * 章の分析から抽出された改善提案を次の章のために保存
//      * 
//      * @param {number} chapterNumber 現在の章番号
//      * @param {string[]} improvements 改善提案の配列
//      * @returns {Promise<void>}
//      */
//     async saveImprovementSuggestions(chapterNumber: number, improvements: string[]): Promise<void> {
//         try {
//             // 次の章用のキーを構築
//             const key = `improvements-chapter-${chapterNumber + 1}`;

//             // 重複を排除
//             const uniqueImprovements = [...new Set(improvements)];

//             // JSONにシリアライズして保存
//             const data = JSON.stringify(uniqueImprovements);
//             await memoryManager.storeTemporaryData(key, data);

//             logger.debug(`Saved ${uniqueImprovements.length} improvement suggestions for next chapter`, {
//                 nextChapter: chapterNumber + 1
//             });
//         } catch (error) {
//             logger.error('Failed to save improvement suggestions', {
//                 error: error instanceof Error ? error.message : String(error),
//                 nextChapter: chapterNumber + 1
//             });
//         }
//     }

//     /**
//      * 読者体験改善提案を取得
//      * 前の章の分析から読者体験を向上させる提案を取得
//      * 
//      * @param {number} chapterNumber 章番号
//      * @returns {Promise<string[]>} 改善提案の配列
//      */
//     async getReaderExperienceImprovements(chapterNumber: number): Promise<string[]> {
//         try {
//             // 前の章用のキーを構築
//             const key = `improvements-chapter-${chapterNumber}`;

//             // メモリマネージャーから一時データを取得
//             const data = await memoryManager.getTemporaryData(key);
//             if (!data) return [];

//             // JSONをパースして返す
//             try {
//                 const suggestions = JSON.parse(data);
//                 return Array.isArray(suggestions) ? suggestions : [];
//             } catch (parseError) {
//                 logger.warn(`Failed to parse improvement suggestions for chapter ${chapterNumber}`, {
//                     error: parseError instanceof Error ? parseError.message : String(parseError)
//                 });
//                 return [];
//             }
//         } catch (error) {
//             logger.error('Failed to get reader experience improvements', {
//                 error: error instanceof Error ? error.message : String(error),
//                 chapterNumber
//             });
//             return [];
//         }
//     }


//     /**
//  * 感情アーク設計を取得
//  * 章番号に基づいて、次の章のための最適な感情アーク設計を取得します。
//  * 感情的な起伏や展開を最適化するために使用されます。
//  * 
//  * @param {number} chapterNumber 章番号
//  * @returns {Promise<EmotionalArcDesign>} 感情アーク設計
//  */
//     async getEmotionalArcDesign(chapterNumber: number): Promise<EmotionalArcDesign> {
//         if (!this.initialized) {
//             await this.initialize();
//         }

//         logger.debug(`Requesting emotional arc design for chapter ${chapterNumber}`, {
//             timestamp: new Date().toISOString()
//         });

//         try {
//             const design = await this.narrativeMemory.designEmotionalArc(chapterNumber);

//             logger.debug(`Emotional arc design retrieved for chapter ${chapterNumber}`, {
//                 timestamp: new Date().toISOString(),
//                 hasDesign: !!design
//             });

//             return design;
//         } catch (error) {
//             logger.error(`Failed to get emotional arc design for chapter ${chapterNumber}`, {
//                 error: error instanceof Error ? error.message : String(error),
//                 timestamp: new Date().toISOString()
//             });

//             // デフォルト値を返す
//             return {
//                 recommendedTone: "バランスのとれた中立的なトーン",
//                 emotionalJourney: {
//                     opening: [
//                         { dimension: "好奇心", level: 7 },
//                         { dimension: "期待感", level: 6 }
//                     ],
//                     development: [
//                         { dimension: "緊張感", level: 5 },
//                         { dimension: "共感", level: 6 }
//                     ],
//                     conclusion: [
//                         { dimension: "満足感", level: 7 },
//                         { dimension: "希望", level: 6 }
//                     ]
//                 },
//                 reason: "物語のこの段階では、読者の関心を維持しながらも感情的なバランスを保つことが重要です"
//             };
//         }
//     }

//     /**
//      * テーマ強化提案生成
//      * @param themeAnalysis テーマ分析結果
//      * @param chapterNumber 章番号
//      */
//     async generateThemeEnhancements(
//         themeAnalysis: ThemeResonanceAnalysis,
//         chapterNumber: number
//     ): Promise<ThemeEnhancement[]> {
//         try {
//             if (!this.initialized) {
//                 await this.initialize();
//             }

//             logger.info(`EnhancementCoordinator: 章${chapterNumber}のテーマ強化提案生成を開始`);

//             // テーマ強化サービスが利用可能な場合はそれを使用
//             if (this.themeEnhancementService) {
//                 return await this.themeEnhancementService.generateThemeEnhancements(
//                     themeAnalysis,
//                     chapterNumber
//                 );
//             }

//             // サービスが利用できない場合は空の配列を返す
//             logger.warn('テーマ強化サービスが利用できません');
//             return [];
//         } catch (error) {
//             logger.error(`章${chapterNumber}のテーマ強化提案生成中にエラーが発生`, {
//                 error: error instanceof Error ? error.message : String(error)
//             });

//             // エラー時は空の配列を返す
//             return [];
//         }
//     }

//     /**
//      * テンション・ペーシング推奨生成
//      * @param chapterNumber 章番号
//      * @param genre ジャンル
//      */
//     async generateTensionPacingRecommendation(
//         chapterNumber: number,
//         genre?: string
//     ): Promise<TensionPacingRecommendation> {
//         try {
//             if (!this.initialized) {
//                 await this.initialize();
//             }

//             logger.info(`EnhancementCoordinator: 章${chapterNumber}のテンション・ペーシング推奨生成を開始`);

//             // テンション最適化サービスが利用可能な場合はそれを使用
//             if (this.tensionOptimizationService) {
//                 return await this.tensionOptimizationService.getTensionPacingRecommendation(
//                     chapterNumber,
//                     genre
//                 );
//             }

//             // サービスが利用できない場合はデフォルト値を返す
//             logger.warn('テンション最適化サービスが利用できません');
//             return this.createDefaultTensionPacingRecommendation();
//         } catch (error) {
//             logger.error(`章${chapterNumber}のテンション・ペーシング推奨生成中にエラーが発生`, {
//                 error: error instanceof Error ? error.message : String(error)
//             });

//             // エラー時はデフォルト値を返す
//             return this.createDefaultTensionPacingRecommendation();
//         }
//     }

//     /**
//      * キャラクター深化推奨生成
//      * @param characterIds キャラクターID配列
//      * @param chapterNumber 章番号
//      */
//     async generateCharacterDepthRecommendations(
//         characterIds: string[],
//         chapterNumber: number
//     ): Promise<{ [id: string]: DepthRecommendation[] }> {
//         try {
//             if (!this.initialized) {
//                 await this.initialize();
//             }

//             logger.info(`EnhancementCoordinator: 章${chapterNumber}のキャラクター深化推奨生成を開始`);

//             // キャラクター深化サービスが利用可能な場合はそれを使用
//             if (this.characterDepthService) {
//                 return await this.characterDepthService.generateMultipleCharacterRecommendations(
//                     characterIds,
//                     chapterNumber
//                 );
//             }

//             // サービスが利用できない場合は空のオブジェクトを返す
//             logger.warn('キャラクター深化サービスが利用できません');
//             return {};
//         } catch (error) {
//             logger.error(`章${chapterNumber}のキャラクター深化推奨生成中にエラーが発生`, {
//                 error: error instanceof Error ? error.message : String(error)
//             });

//             // エラー時は空のオブジェクトを返す
//             return {};
//         }
//     }

//     /**
//      * 代替表現提案生成
//      * @param chapterNumber 章番号
//      * @param content テキスト内容（オプション）
//      */
//     async generateAlternativeExpressions(
//         chapterNumber: number,
//         content?: string
//     ): Promise<ExpressionAlternatives> {
//         try {
//             if (!this.initialized) {
//                 await this.initialize();
//             }

//             logger.info(`EnhancementCoordinator: 章${chapterNumber}の代替表現提案生成を開始`);

//             // 文体最適化サービスを使用
//             if (content) {
//                 // テキスト内容が提供された場合、そのテキストの表現パターンを分析
//                 const expressionPatterns = await this.styleOptimizationService.analyzeExpressionPatterns(content);
//                 return await this.styleOptimizationService.suggestAlternativeExpressions(expressionPatterns, {
//                     chapterNumber
//                 });
//             } else {
//                 // テキスト内容がない場合、章番号に基づいて処理
//                 return await this.styleOptimizationService.suggestAlternativeExpressions(chapterNumber);
//             }
//         } catch (error) {
//             logger.error(`章${chapterNumber}の代替表現提案生成中にエラーが発生`, {
//                 error: error instanceof Error ? error.message : String(error)
//             });

//             // エラー時は空のオブジェクトを返す
//             return {};
//         }
//     }

//     // =============== プライベートヘルパーメソッド ===============

//     /**
//      * 文体ガイダンスの統合
//      * @private
//      * @param baseGuidance ベースとなる文体ガイダンス
//      * @param additionalGuidance 追加の文体ガイダンス
//      * @returns 統合された文体ガイダンス
//      */
//     private mergeStyleGuidance(baseGuidance: StyleGuidance, additionalGuidance: StyleGuidance): StyleGuidance {
//         // 各カテゴリのガイダンスを統合し、重複を排除
//         return {
//             general: this.mergeAndDeduplicate(baseGuidance.general, additionalGuidance.general),
//             sentenceStructure: this.mergeAndDeduplicate(baseGuidance.sentenceStructure, additionalGuidance.sentenceStructure),
//             vocabulary: this.mergeAndDeduplicate(baseGuidance.vocabulary, additionalGuidance.vocabulary),
//             rhythm: this.mergeAndDeduplicate(baseGuidance.rhythm, additionalGuidance.rhythm)
//         };
//     }

//     /**
//      * 配列の統合と重複排除
//      * @private
//      * @param arr1 配列1
//      * @param arr2 配列2
//      * @returns 統合された配列
//      */
//     private mergeAndDeduplicate(arr1: string[], arr2: string[]): string[] {
//         // 両方の配列を結合
//         const combined = [...arr1];

//         // 重複を避けつつ要素を追加
//         for (const item of arr2) {
//             if (!this.hasCloseMatch(combined, item)) {
//                 combined.push(item);
//             }
//         }

//         return combined;
//     }

//     /**
//      * 文字列が配列内に類似するものがあるかチェック
//      * @private
//      * @param array 文字列配列
//      * @param target 検索対象文字列
//      * @param threshold 類似度閾値（0〜1）
//      * @returns 類似するものがあればtrue
//      */
//     private hasCloseMatch(array: string[], target: string, threshold: number = 0.7): boolean {
//         // 簡易的な類似度判定（部分文字列や文字の一致率で判断）
//         for (const item of array) {
//             const similarity = this.calculateStringSimilarity(item, target);
//             if (similarity >= threshold) {
//                 return true;
//             }
//         }
//         return false;
//     }

//     /**
//      * 文字列の類似度計算
//      * @private
//      * @param str1 文字列1
//      * @param str2 文字列2
//      * @returns 類似度（0〜1）
//      */
//     private calculateStringSimilarity(str1: string, str2: string): number {
//         // 両方とも空文字列の場合は完全一致
//         if (str1.length === 0 && str2.length === 0) return 1;

//         // どちらかが空文字列の場合は不一致
//         if (str1.length === 0 || str2.length === 0) return 0;

//         // 長い方を基準にして、短い方をどれだけ含むかを計算
//         const longer = str1.length >= str2.length ? str1 : str2;
//         const shorter = str1.length >= str2.length ? str2 : str1;

//         // 部分文字列チェック（完全に含む場合）
//         if (longer.includes(shorter)) {
//             return shorter.length / longer.length;
//         }

//         // 共通する部分文字列の長さを探索
//         let maxCommonLength = 0;
//         for (let i = 0; i < shorter.length; i++) {
//             for (let j = i + 1; j <= shorter.length; j++) {
//                 const substring = shorter.substring(i, j);
//                 if (longer.includes(substring) && substring.length > maxCommonLength) {
//                     maxCommonLength = substring.length;
//                 }
//             }
//         }

//         return maxCommonLength / longer.length;
//     }

//     /**
//      * 提案アイテムのインターフェース
//      * @private
//      */
//     private interface SuggestionItem {
//     text: string;
//     source: string;
//     priority: number;
// }

//   /**
//    * 提案の処理（重み付け、重複排除、優先順位付け）
//    * @private
//    * @param suggestions 提案配列
//    * @param context コンテキスト情報
//    * @returns 処理済み提案配列
//    */
//   private processSuggestions(
//     suggestions: { text: string; source: string; priority: number }[],
//     context: any
// ): { text: string; source: string; priority: number } [] {
//     // 1. コンテキストに基づく重み付け調整
//     const weightedSuggestions = this.adjustWeightsByContext(suggestions, context);

//     // 2. 重複排除
//     const uniqueSuggestions = this.removeDuplicates(weightedSuggestions);

//     // 3. 優先度順にソート
//     return uniqueSuggestions.sort((a, b) => b.priority - a.priority);
// }

//   /**
//    * コンテキストに基づく重み付け調整
//    * @private
//    * @param suggestions 提案配列
//    * @param context コンテキスト情報
//    * @returns 重み付け調整済み提案配列
//    */
//   private adjustWeightsByContext(
//     suggestions: { text: string; source: string; priority: number }[],
//     context: any
// ): { text: string; source: string; priority: number } [] {
//     const adjustedSuggestions = [...suggestions];

//     // ジャンルに基づく調整
//     const genre = (context.genre || '').toLowerCase();

//     for (let i = 0; i < adjustedSuggestions.length; i++) {
//         const suggestion = adjustedSuggestions[i];

//         // ジャンルに基づく調整
//         if (genre.includes('ミステリー') || genre.includes('mystery') || genre.includes('サスペンス')) {
//             // ミステリージャンルでは伏線や謎に関する提案を優先
//             if (suggestion.text.includes('伏線') || suggestion.text.includes('謎') ||
//                 suggestion.text.includes('手がかり') || suggestion.text.includes('情報')) {
//                 suggestion.priority += 0.1;
//             }
//         } else if (genre.includes('ファンタジー') || genre.includes('fantasy')) {
//             // ファンタジージャンルでは世界観や魔法に関する提案を優先
//             if (suggestion.text.includes('世界観') || suggestion.text.includes('魔法') ||
//                 suggestion.text.includes('設定') || suggestion.text.includes('神話')) {
//                 suggestion.priority += 0.1;
//             }
//         } else if (genre.includes('恋愛') || genre.includes('romance')) {
//             // 恋愛ジャンルでは感情や関係性に関する提案を優先
//             if (suggestion.text.includes('感情') || suggestion.text.includes('関係') ||
//                 suggestion.text.includes('心理') || suggestion.text.includes('変化')) {
//                 suggestion.priority += 0.1;
//             }
//         } else if (genre.includes('sf') || genre.includes('sci-fi')) {
//             // SFジャンルでは技術や概念に関する提案を優先
//             if (suggestion.text.includes('技術') || suggestion.text.includes('概念') ||
//                 suggestion.text.includes('科学') || suggestion.text.includes('未来')) {
//                 suggestion.priority += 0.1;
//             }
//         }

//         // ソースに基づく調整
//         if (suggestion.source === 'character') {
//             // キャラクター関連の提案はキャラクター中心の物語で優先
//             if (genre.includes('恋愛') || genre.includes('romance') ||
//                 genre.includes('ドラマ') || genre.includes('drama')) {
//                 suggestion.priority += 0.05;
//             }
//         } else if (suggestion.source === 'tension') {
//             // テンション関連の提案はアクション/スリラー系で優先
//             if (genre.includes('アクション') || genre.includes('action') ||
//                 genre.includes('スリラー') || genre.includes('thriller')) {
//                 suggestion.priority += 0.05;
//             }
//         } else if (suggestion.source === 'theme') {
//             // テーマ関連の提案は文学/哲学系で優先
//             if (genre.includes('文学') || genre.includes('literary') ||
//                 genre.includes('哲学') || genre.includes('philosophical')) {
//                 suggestion.priority += 0.05;
//             }
//         }

//         // テンションレベルに基づく調整
//         const tension = context.tension || 0.5;
//         if (tension > 0.7) {
//             // 高テンションでは、テンションやペースに関する提案を優先
//             if (suggestion.text.includes('テンション') || suggestion.text.includes('緊張') ||
//                 suggestion.text.includes('ペース') || suggestion.text.includes('スピード')) {
//                 suggestion.priority += 0.1;
//             }
//         } else if (tension < 0.4) {
//             // 低テンションでは、キャラクターや心理に関する提案を優先
//             if (suggestion.text.includes('キャラクター') || suggestion.text.includes('心理') ||
//                 suggestion.text.includes('内面') || suggestion.text.includes('感情')) {
//                 suggestion.priority += 0.1;
//             }
//         }
//     }

//     return adjustedSuggestions;
// }

//   /**
//    * 重複提案の排除
//    * @private
//    * @param suggestions 提案配列
//    * @returns 重複排除済み提案配列
//    */
//   private removeDuplicates(
//     suggestions: { text: string; source: string; priority: number }[]
// ): { text: string; source: string; priority: number } [] {
//     const unique: { text: string; source: string; priority: number }[] = [];
//     const texts = new Set<string>();

//     for (const suggestion of suggestions) {
//         // 完全に同じテキストの場合はスキップ
//         if (texts.has(suggestion.text)) continue;

//         // 類似テキストがあるかチェック
//         let hasSimilar = false;
//         for (const existingSuggestion of unique) {
//             if (this.calculateStringSimilarity(suggestion.text, existingSuggestion.text) >= 0.7) {
//                 // 類似している場合は優先度の高い方を保持
//                 if (suggestion.priority > existingSuggestion.priority) {
//                     existingSuggestion.text = suggestion.text;
//                     existingSuggestion.source = suggestion.source;
//                     existingSuggestion.priority = suggestion.priority;
//                 }
//                 hasSimilar = true;
//                 break;
//             }
//         }

//         // 類似のものがなければ追加
//         if (!hasSimilar) {
//             unique.push(suggestion);
//             texts.add(suggestion.text);
//         }
//     }

//     return unique;
// }

//   /**
//    * デフォルト文体ガイダンスの作成
//    * @private
//    * @returns デフォルト文体ガイダンス
//    */
//   private createDefaultStyleGuidance(): StyleGuidance {
//     return {
//         general: [
//             "文体に変化をつけてください",
//             "明確で簡潔な文章を心がけてください",
//             "同じ表現の繰り返しを避け、多様な表現を使用してください"
//         ],
//         sentenceStructure: [
//             "文の長さにバリエーションを持たせてください",
//             "複文と単文をバランスよく使用してください"
//         ],
//         vocabulary: [
//             "より具体的で描写的な語彙を選んでください",
//             "キャラクターの個性を表す言葉遣いを工夫してください"
//         ],
//         rhythm: [
//             "場面のテンションに合わせてリズムを調整してください",
//             "重要な部分は短い文で強調してください"
//         ]
//     };
// }

//   /**
//    * デフォルト改善提案の作成
//    * @private
//    * @returns デフォルト改善提案
//    */
//   private createDefaultImprovementSuggestions(): string[] {
//     return [
//         "キャラクターの感情と内面描写をより深く掘り下げてください",
//         "テーマを物語全体に一貫して織り込んでください",
//         "読者の興味を維持するために、適度な緊張感とペースの変化を持たせてください",
//         "場面転換をより明確にし、時間と場所の把握を容易にしてください",
//         "会話文と地の文のバランスを適切に保ってください"
//     ];
// }

//   /**
//    * デフォルトテンション・ペーシング推奨の作成
//    * @private
//    * @returns デフォルトテンション・ペーシング推奨
//    */
//   private createDefaultTensionPacingRecommendation(): TensionPacingRecommendation {
//     return {
//         tension: {
//             recommendedTension: 0.5,
//             reason: "デフォルト値",
//             direction: "maintain"
//         },
//         pacing: {
//             recommendedPacing: 0.5,
//             description: "バランスの取れた標準的なペース"
//         }
//     };
// }
// }

// // シングルトンインスタンスをエクスポート
// export const enhancementCoordinator = new EnhancementCoordinator(
//     // 文体最適化サービスのインスタンスを注入（要実装）
//     {} as IStyleOptimizationService
// );