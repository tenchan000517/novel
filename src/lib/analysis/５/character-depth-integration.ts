// /**
//  * @fileoverview ContextGenerator拡張 - キャラクター深化統合
//  * @description
//  * ContextGeneratorにCharacterDepthServiceの機能を統合するための拡張例。
//  * この実装例は、コンテキスト生成プロセスにキャラクター深化の推奨を
//  * 組み込む方法を示しています。
//  */

// import { Logger } from '@/lib/utils/logger';
// import { GenerationContext } from '@/types/generation';
// import { MemoryManager, memoryManager } from '@/lib/memory/manager';
// import { characterManager } from '@/lib/characters/manager';
// import { CharacterDepthPrompt } from '../core/interfaces';
// import { characterDepthService } from '../enhancement/character/character-depth-service';
// import { Chapter } from '@/types/chapters';
// import { Character } from '@/types/characters';

// /**
//  * ContextGeneratorへのCharacterDepth統合クラス
//  * 主要なContextGenerator実装を拡張するためのヘルパークラス
//  */
// export class CharacterDepthIntegration {
//     private logger: Logger;
    
//     constructor() {
//         this.logger = new Logger({ serviceName: 'CharacterDepthIntegration' });
//         this.logger.info('CharacterDepthIntegration: 初期化完了');
//     }
    
//     /**
//      * キャラクター深化推奨でコンテキストを拡張
//      * ContextGenerator.generateContext内部で呼び出し、コンテキストを強化
//      * 
//      * @param context 現在の生成コンテキスト
//      * @param chapterNumber 章番号
//      * @returns 深化推奨で拡張されたコンテキスト
//      */
//     async enhanceContextWithCharacterDepth(
//         context: GenerationContext,
//         chapterNumber: number
//     ): Promise<GenerationContext> {
//         try {
//             this.logger.info(`章${chapterNumber}のコンテキストにキャラクター深化データを統合開始`);
            
//             // 主要キャラクターIDを取得（最大3人）
//             const focusCharacterIds = await this.getFocusCharacterIds(context, chapterNumber);
            
//             if (focusCharacterIds.length === 0) {
//                 this.logger.info('焦点を当てるキャラクターが見つかりません');
//                 return context;
//             }
            
//             // 各キャラクターの深化プロンプトを取得
//             const characterDepthPrompts: {[id: string]: CharacterDepthPrompt} = {};
            
//             await Promise.all(focusCharacterIds.map(async (id) => {
//                 try {
//                     const prompt = await characterDepthService.generateDepthPromptForChapter(id, chapterNumber);
//                     if (prompt) {
//                         characterDepthPrompts[id] = prompt;
//                     }
//                 } catch (error) {
//                     this.logger.error(`キャラクター${id}の深化プロンプト生成に失敗`, {
//                         error: error instanceof Error ? error.message : String(error)
//                     });
//                 }
//             }));
            
//             // コンテキストを拡張
//             const enhancedContext: GenerationContext = {
//                 ...context,
//                 // キャラクター深化プロンプトを追加
//                 characterDepthPrompts,
//                 // キャラクター深化にフォーカスするフラグ
//                 focusOnCharacterDepth: Object.keys(characterDepthPrompts).length > 0
//             };
            
//             this.logger.info(`キャラクター深化データの統合完了 (${Object.keys(characterDepthPrompts).length}人)`, {
//                 characterIds: Object.keys(characterDepthPrompts)
//             });
            
//             return enhancedContext;
//         } catch (error) {
//             this.logger.error('キャラクター深化データの統合に失敗しました', {
//                 error: error instanceof Error ? error.message : String(error),
//                 chapterNumber
//             });
//             return context; // 元のコンテキストを変更せずに返す
//         }
//     }
    
//     /**
//      * 章に焦点を当てるキャラクターIDを取得
//      * 
//      * @private
//      * @param context 生成コンテキスト
//      * @param chapterNumber 章番号
//      * @returns 焦点キャラクターIDの配列
//      */
//     private async getFocusCharacterIds(
//         context: GenerationContext,
//         chapterNumber: number
//     ): Promise<string[]> {
//         // コンテキストから推奨キャラクターを探す
//         const focusCharacters = context.focusCharacters || [];
        
//         if (focusCharacters.length > 0 && context.characters) {
//             // コンテキスト内のキャラクター情報から名前でキャラクターを探す
//             const charactersByName = new Map<string, any>();
//             context.characters.forEach(char => {
//                 if (char.name && char.id) {
//                     charactersByName.set(char.name, char);
//                 }
//             });
            
//             // 名前に対応するIDを収集
//             const characterIds: string[] = [];
//             for (const name of focusCharacters) {
//                 const character = charactersByName.get(name);
//                 if (character && character.id) {
//                     characterIds.push(character.id);
//                 }
//             }
            
//             if (characterIds.length > 0) {
//                 return characterIds;
//             }
//         }
        
//         // コンテキストからの取得に失敗した場合はCharacterDepthServiceに推奨を依頼
//         try {
//             return await characterDepthService.recommendFocusCharactersForChapter(chapterNumber, 3);
//         } catch (error) {
//             this.logger.error('キャラクター推奨取得に失敗', {
//                 error: error instanceof Error ? error.message : String(error)
//             });
            
//             // フォールバック: 既知のアクティブキャラクターを取得
//             try {
//                 const activeCharacters = await characterManager.getActiveCharacters();
//                 return activeCharacters
//                     .filter(c => c.type === 'MAIN' || c.type === 'SUB')
//                     .slice(0, 3)
//                     .map(c => c.id);
//             } catch (fallbackError) {
//                 this.logger.error('アクティブキャラクター取得に失敗', {
//                     error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
//                 });
//                 return [];
//             }
//         }
//     }
    
//     /**
//      * 生成された章の分析と深化データの更新
//      * ContextGenerator.processGeneratedChapter内部から呼び出し
//      * 
//      * @param chapter 生成された章
//      * @returns 処理結果
//      */
//     async processGeneratedChapterForDepth(chapter: Chapter): Promise<void> {
//         try {
//             this.logger.info(`章${chapter.chapterNumber}の生成結果からキャラクター深化データを分析`);
            
//             // 章に登場したキャラクターを検出
//             const detectedCharacters = await characterManager.detectCharactersInContent(chapter.content);
            
//             if (detectedCharacters.length === 0) {
//                 this.logger.info('章からキャラクターを検出できませんでした');
//                 return;
//             }
            
//             // 主要キャラクターのみに絞り込み
//             const significantCharacters = detectedCharacters.filter(char => 
//                 char.type === 'MAIN' || char.type === 'SUB'
//             ).slice(0, 5); // 最大5人を分析
            
//             if (significantCharacters.length === 0) {
//                 this.logger.info('重要なキャラクターが検出されませんでした');
//                 return;
//             }
            
//             // キャラクターごとに心理情報を更新
//             for (const character of significantCharacters) {
//                 try {
//                     // キャラクター情報を処理（CharacterManager側に実装も必要）
//                     await characterManager.recordCharacterAppearance(
//                         character.id,
//                         chapter.chapterNumber,
//                         `${character.name}が章${chapter.chapterNumber}に登場`
//                     );
                    
//                     // キャラクター関連の発展ステージを更新
//                     await this.updateCharacterDevelopmentStage(character, chapter);
                    
//                 } catch (charError) {
//                     this.logger.error(`キャラクター${character.name}の処理中にエラー`, {
//                         error: charError instanceof Error ? charError.message : String(charError)
//                     });
//                 }
//             }
            
//             this.logger.info(`章${chapter.chapterNumber}のキャラクター分析が完了しました`);
//         } catch (error) {
//             this.logger.error(`章${chapter.chapterNumber}のキャラクター深化分析に失敗`, {
//                 error: error instanceof Error ? error.message : String(error)
//             });
//         }
//     }
    
//     /**
//      * キャラクターの発展ステージを更新
//      * 章の内容に基づいて発展段階を調整
//      * 
//      * @private
//      * @param character キャラクター情報
//      * @param chapter 生成された章
//      */
//     private async updateCharacterDevelopmentStage(
//         character: Character,
//         chapter: Chapter
//     ): Promise<void> {
//         try {
//             // 現在の発展段階を取得
//             const currentStage = character.state?.developmentStage || 0;
            
//             // 発展段階の調整値を計算
//             let stageAdjustment = 0;
            
//             // 章のキャラクター言及度をチェック（回数や重要度）
//             const characterMentions = this.countCharacterMentions(character, chapter.content);
            
//             // 言及度に基づく調整
//             if (characterMentions > 10) {
//                 stageAdjustment += 0.2;
//             } else if (characterMentions > 5) {
//                 stageAdjustment += 0.1;
//             }
            
//             // キャラクター決断や変化のキーワードを検出
//             const hasSignificantDevelopment = this.detectSignificantDevelopment(
//                 character, 
//                 chapter.content
//             );
            
//             // 重要な発展が検出された場合の調整
//             if (hasSignificantDevelopment) {
//                 stageAdjustment += 0.3;
//             }
            
//             // 調整が必要な場合は発展段階を更新
//             if (stageAdjustment > 0) {
//                 // 発展段階の更新（最大値を10とする）
//                 const newStage = Math.min(10, currentStage + stageAdjustment);
                
//                 // CharacterManagerを通じて状態を更新
//                 await characterManager.updateCharacter(character.id, {
//                     state: {
//                         ...character.state,
//                         developmentStage: newStage
//                     }
//                 });
                
//                 this.logger.info(`キャラクター${character.name}の発展段階を更新: ${currentStage} → ${newStage}`, {
//                     adjustment: stageAdjustment
//                 });
//             }
//         } catch (error) {
//             this.logger.error(`キャラクター${character.name}の発展段階更新に失敗`, {
//                 error: error instanceof Error ? error.message : String(error)
//             });
//         }
//     }
    
//     /**
//      * キャラクターの章内言及回数をカウント
//      * 
//      * @private
//      * @param character キャラクター情報
//      * @param content 章の内容
//      * @returns 言及回数
//      */
//     private countCharacterMentions(character: Character, content: string): number {
//         const name = character.name;
//         if (!name) return 0;
        
//         // 名前の出現回数をカウント
//         const regex = new RegExp(`\\b${name}\\b`, 'gi');
//         const matches = content.match(regex);
        
//         // 代名詞や略称はカウントできないため単純な名前マッチングのみ
//         return matches ? matches.length : 0;
//     }
    
//     /**
//      * 重要な発展があるかどうかを検出
//      * 
//      * @private
//      * @param character キャラクター情報
//      * @param content 章の内容
//      * @returns 重要な発展が検出された場合はtrue
//      */
//     private detectSignificantDevelopment(character: Character, content: string): boolean {
//         if (!character.name) return false;
        
//         // 重要な発展を示すキーワードパターン
//         const developmentPatterns = [
//             `${character.name}は(決心|決意|決断)`,
//             `${character.name}の(心|気持ち)が変わ`,
//             `${character.name}は初めて`,
//             `${character.name}の(成長|変化)`,
//             `${character.name}は(気づ|悟)`,
//             `${character.name}の価値観`
//         ];
        
//         // いずれかのパターンにマッチするか確認
//         return developmentPatterns.some(pattern => {
//             const regex = new RegExp(pattern, 'i');
//             return regex.test(content);
//         });
//     }
// }

// // シングルトンインスタンスをエクスポート
// export const characterDepthIntegration = new CharacterDepthIntegration();