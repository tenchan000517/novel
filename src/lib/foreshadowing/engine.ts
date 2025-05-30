// src/lib/foreshadowing/engine.ts

/**
 * @fileoverview 伏線生成エンジン
 * @description
 * 物語創作支援システムにおける伏線の生成と管理を担当するモジュールです。
 * AIを活用して物語の文脈から自然な伏線を生成し、管理、追跡する機能を提供します。
 * チャプター内容から新しい伏線を生成し、古い伏線の検出、解決すべき伏線の提案などの機能を実装しています。
 * 
 * @role
 * - 物語文脈からのAIを活用した伏線生成
 * - 生成された伏線データの解析と整形
 * - 伏線の保存と取得
 * - 未解決の伏線管理と解決提案
 * - 古い伏線（長期未解決）の検出
 * 
 * @dependencies
 * - @/types/memory - 伏線関連の型定義（Foreshadowing型）
 * - @/lib/generation/gemini-client - Google Gemini APIによるテキスト生成
 * - @/lib/memory - 階層的記憶管理システム（伏線の保存先）
 * - @/lib/utils/logger - ログ出力機能
 * - @/lib/utils/error-handler - エラーハンドリング機能
 * 
 * @flow
 * 1. チャプター内容の受け取り
 * 2. AIによる伏線の生成
 * 3. レスポンスの解析と構造化
 * 4. 記憶システムへの伏線の保存
 * 5. 古い伏線の検出と解決推奨
 */

import { Foreshadowing } from '@/types/memory';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { memoryManager } from '@/lib/memory/manager';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { plannedForeshadowingManager } from './planned-foreshadowing-manager';

/**
 * @class ForeshadowingEngine
 * @description
 * 物語文脈から伏線の生成と管理を担当するクラス。
 * Google Gemini AIを活用して物語のコンテキストから伏線を生成し、
 * 生成された伏線の管理、保存、解決提案などの機能を提供します。
 */
export class ForeshadowingEngine {
  private geminiClient: GeminiClient;

  /**
 * ForeshadowingEngineクラスを初期化します
 * 
 * GeminiClientのインスタンスを作成します。
 * 
 * @constructor
 * 
 * @usage
 * // 基本的な初期化
 * const engine = new ForeshadowingEngine();
 * 
 * @call-flow
 * GeminiClientのインスタンスを作成します。
 */

  constructor() {
    this.geminiClient = new GeminiClient();
  }

  /**
   * チャプター内容から新しい伏線を生成します
   * 
   * チャプターの内容を分析し、AIを使用して将来的に回収できる伏線を
   * 指定された数だけ生成します。
   */
  async generateForeshadowing(
    chapterContent: string,
    chapterNumber: number,
    count: number = 2
  ): Promise<Foreshadowing[]> {
    try {
      logger.info(`チャプター${chapterNumber}から${count}個の伏線を生成開始`);

      // 計画済み伏線の読み込みを確認
      if (!plannedForeshadowingManager.isLoaded()) {
        await plannedForeshadowingManager.loadPlannedForeshadowings();
      }

      const result: Foreshadowing[] = [];

      // 1. このチャプターで導入すべき計画済み伏線を取得
      const plannedForeshadowings = plannedForeshadowingManager.getForeshadowingsToIntroduceInChapter(chapterNumber);

      // 2. 計画済み伏線をForeshadowing型に変換して追加
      for (const planned of plannedForeshadowings) {
        result.push(plannedForeshadowingManager.convertToForeshadowing(planned));

        // 伏線を導入済みとしてマーク
        plannedForeshadowingManager.markAsIntroduced(planned.id);
      }

      // 3. 計画済み伏線の変更を保存
      if (plannedForeshadowings.length > 0) {
        await plannedForeshadowingManager.savePlannedForeshadowings();
      }

      // 4. 必要な数に足りない場合はAIで生成
      const remainingCount = Math.max(0, count - result.length);

      if (remainingCount > 0) {
        logger.info(`計画済み伏線は${result.length}個、追加で${remainingCount}個をAI生成します`);

        // 伏線生成プロンプト
        const prompt = `
あなたは小説のストーリー展開アドバイザーです。このチャプターの内容から、将来的に回収できる伏線を${count}個考えてください。
良い伏線は、後のストーリー展開で意味を持ち、回収されたときに読者に「なるほど！」と思わせるものです。

チャプター内容:
${chapterContent.substring(0, 4000)}

以下の形式で${count}個の伏線を提案してください:
1. 伏線の説明: [簡潔な説明]
2. 導入方法: [どのようにチャプターに存在しているか]
3. 解決予想: [どのように回収されうるか]
4. 重要度: [low/medium/high]
5. 関連キャラクター: [伏線に関わるキャラクター]
6. 予想解決チャプター: [だいたいのチャプター番号]
`;

        // 伏線生成
        // maxTokens を削除し、代わりに適切なオプションを使用
        const response = await this.geminiClient.generateText(prompt, {
          temperature: 0.7,
          // maxOutputTokens または同等のオプションがAPI側で提供されている場合はそれを使用
          // 暫定的に削除します
        });

        // 応答をパースして伏線オブジェクトに変換
        const aiGeneratedForeshadowings = this.parseForeshadowingResponse(
          response,
          chapterNumber
        );

        // 結果に追加
        result.push(...aiGeneratedForeshadowings);
      } else {
        logger.info(`計画済み伏線が${result.length}個あり、必要数(${count})を満たしているため、AI生成はスキップします`);
      }

      logger.info(`チャプター${chapterNumber}から${result.length}個の伏線を生成完了`);
      return result;
    } catch (error) {
      logError(error, { chapterNumber }, '伏線生成中にエラーが発生しました');
      return [];
    }
  }

  /**
   * レスポンスから伏線データを抽出します
   * 
   * GeminiAPIからのレスポンスを解析し、構造化された伏線データを抽出します。
   */
  private parseForeshadowingResponse(
    response: string,
    chapterNumber: number
  ): Foreshadowing[] {
    try {
      const foreshadowingItems: Foreshadowing[] = [];
      const now = new Date().toISOString();

      // 伏線のパターンにマッチする正規表現
      // 's' フラグを使わない形式に変更
      const foreshadowingPattern = /(\d+)\.\s*伏線の説明:\s*([\s\S]*?)(?=\d+\.\s*伏線の説明:|$)/g;

      let match;
      while ((match = foreshadowingPattern.exec(response)) !== null) {
        const fullText = match[0];

        // 各項目を抽出する補助関数 - 's' フラグを使わないように修正
        const extractValue = (field: string): string => {
          // 's' フラグを使わないように、[\s\S] パターンを使用
          const pattern = new RegExp(`${field}:\\s*([\\s\\S]*?)(?=\\d+\\.\\s*|$|\\n\\d+\\.\\s*)`, '');
          const fieldMatch = fullText.match(pattern);
          return fieldMatch ? fieldMatch[1].trim() : '';
        };

        // 重要度を標準化する関数
        const standardizeUrgency = (urgency: string): string => {
          urgency = urgency.toLowerCase();
          if (urgency.includes('high') || urgency.includes('高')) return 'high';
          if (urgency.includes('medium') || urgency.includes('中')) return 'medium';
          if (urgency.includes('low') || urgency.includes('低')) return 'low';
          return 'medium';
        };

        // 予想解決チャプターを数値化
        const parseChapterNumber = (text: string): number | undefined => {
          const numMatch = text.match(/(\d+)/);
          return numMatch ? parseInt(numMatch[1], 10) : undefined;
        };

        // 各フィールドを抽出
        const description = extractValue('伏線の説明');
        const introduction = extractValue('導入方法');
        const resolution = extractValue('解決予想');
        const importance = extractValue('重要度');
        const characters = extractValue('関連キャラクター');
        const resolutionChapter = extractValue('予想解決チャプター');

        // 伏線オブジェクトを作成
        if (description) {
          const foreshadowing: Foreshadowing = {
            id: `fs-auto-${Date.now()}-${foreshadowingItems.length}`,
            description,
            context: introduction,
            chapter_introduced: chapterNumber,
            potential_resolution: resolution,
            resolved: false,
            urgency: standardizeUrgency(importance),
            createdTimestamp: now,
            updatedTimestamp: now
          };

          // オプションフィールドを設定
          const plannedResolution = parseChapterNumber(resolutionChapter);
          if (plannedResolution) {
            foreshadowing.plannedResolution = plannedResolution;
          }

          // 関連キャラクターを設定
          if (characters) {
            // カンマやスラッシュで区切られた文字列からキャラクター名を抽出
            const characterList = characters
              .split(/[,、/／]/)
              .map(c => c.trim())
              .filter(c => c.length > 0);

            if (characterList.length > 0) {
              foreshadowing.relatedCharacters = characterList;
            }
          }

          foreshadowingItems.push(foreshadowing);
        }
      }

      return foreshadowingItems;
    } catch (error) {
      logError(error, {}, '伏線レスポンスのパースに失敗しました');
      return [];
    }
  }

  /**
   * 伏線データをメモリマネージャに保存します
   * 
   * 生成された伏線データを検証し、記憶管理システムに保存します。
   * 重複する伏線はスキップされます。
   */
  async saveForeshadowing(
    foreshadowingItems: Foreshadowing[]
  ): Promise<number> {
    if (foreshadowingItems.length === 0) {
      return 0;
    }

    try {
      // memoryManagerを初期化
      if (!(await memoryManager.isInitialized())) {
        await memoryManager.initialize();
      }

      let savedCount = 0;

      // 各伏線を保存
      for (const item of foreshadowingItems) {
        try {
          // 重複チェック
          const isDuplicate = await memoryManager.getLongTermMemory().checkDuplicateForeshadowing(
            item.description
          );

          if (!isDuplicate) {
            await memoryManager.getLongTermMemory().addForeshadowing(item);
            savedCount++;
          } else {
            logger.debug(`重複した伏線をスキップ: ${item.description}`);
          }
        } catch (error) {
          logError(error, { description: item.description }, '伏線保存中にエラーが発生しました');
          // 個別エラーはスキップして続行
        }
      }

      logger.info(`${savedCount}/${foreshadowingItems.length}件の伏線を保存しました`);
      return savedCount;
    } catch (error) {
      logError(error, {}, '伏線保存中にエラーが発生しました');
      return 0;
    }
  }

  /**
   * チャプターコンテンツから伏線を生成して保存します
   * 
   * チャプター生成後に自動的に呼び出され、チャプターの内容から
   * 伏線を生成して保存する統合処理を行います。
   */
  async processChapterAndGenerateForeshadowing(
    chapterContent: string,
    chapterNumber: number,
    count: number = 2
  ): Promise<number> {
    try {
      // 伏線を生成
      const foreshadowingItems = await this.generateForeshadowing(
        chapterContent,
        chapterNumber,
        count
      );

      // 生成された伏線を保存
      const savedCount = await this.saveForeshadowing(foreshadowingItems);

      return savedCount;
    } catch (error) {
      logError(error, { chapterNumber }, 'チャプター処理中に伏線生成エラーが発生しました');
      return 0;
    }
  }

  /**
   * 伏線データをチェックして古い（長期未解決の）伏線を検出します
   * 
   * 現在のチャプター番号を基準に、長期間未解決のままになっている
   * 伏線を検出します。
   */
  async checkStaleForeshadowing(currentChapter: number): Promise<Foreshadowing[]> {
    try {
      // memoryManagerを初期化
      if (!(await memoryManager.isInitialized())) {
        await memoryManager.initialize();
      }

      // 未解決の伏線を取得
      const unresolved = await memoryManager.getLongTermMemory().getUnresolvedForeshadowing();

      // 一定期間以上前に導入された未解決の伏線を抽出
      const staleThreshold = 15; // 15チャプター以上前に導入されて未解決なら"古い"と見なす
      const staleForeshadowing = unresolved.filter((f: Foreshadowing) =>
        currentChapter - f.chapter_introduced > staleThreshold &&
        (!f.plannedResolution || currentChapter > f.plannedResolution)
      );

      return staleForeshadowing;
    } catch (error) {
      logError(error, { currentChapter }, '伏線チェック中にエラーが発生しました');
      return [];
    }
  }

  /**
   * 解決すべき伏線をAIに提案してもらいます
   * 
   * 現在のチャプター内容と未解決の伏線リストを分析し、
   * 現在のチャプターで解決すべき伏線を提案します。
   */
  async suggestForeshadowingsToResolve(
    chapterContent: string,
    chapterNumber: number,
    count: number = 2
  ): Promise<Foreshadowing[]> {
    try {
      // 計画済み伏線の読み込みを確認
      if (!plannedForeshadowingManager.isLoaded()) {
        await plannedForeshadowingManager.loadPlannedForeshadowings();
      }

      // 1. このチャプターで解決すべき計画済み伏線を取得
      const plannedForeshadowingsToResolve = plannedForeshadowingManager.getForeshadowingsToResolveInChapter(chapterNumber);

      const result: Foreshadowing[] = [];

      // 2. 計画済み伏線をForeshadowing型に変換して追加
      for (const planned of plannedForeshadowingsToResolve) {
        result.push(plannedForeshadowingManager.convertToForeshadowing(planned));

        // 伏線を解決済みとしてマーク
        plannedForeshadowingManager.markAsResolved(planned.id);
      }

      // 3. 計画済み伏線の変更を保存
      if (plannedForeshadowingsToResolve.length > 0) {
        await plannedForeshadowingManager.savePlannedForeshadowings();
      }

      // 4. このチャプターで言及すべきヒントを取得
      const hintsForChapter = plannedForeshadowingManager.getHintsForChapter(chapterNumber);

      if (hintsForChapter.length > 0) {
        logger.info(`チャプター${chapterNumber}で言及すべきヒントが${hintsForChapter.length}個あります`);
        // ヒントのログを出力（これは生成システムに反映される必要があります）
        hintsForChapter.forEach(hintInfo => {
          logger.info(`伏線「${hintInfo.foreshadowing.description}」のヒント: ${hintInfo.hint}`);
        });
      }

      // 5. 必要な数に足りない場合はAIで伏線解決提案を生成
      const remainingCount = Math.max(0, count - result.length);

      if (remainingCount > 0 && !plannedForeshadowingManager.areAllForeshadowingsResolved()) {
        // memoryManagerを初期化
        if (!(await memoryManager.isInitialized())) {
          await memoryManager.initialize();
        }

        // 未解決の伏線を取得
        const unresolved = await memoryManager.getLongTermMemory().getUnresolvedForeshadowing();

        if (unresolved.length === 0) {
          return result;
        }

        // 伏線情報を文字列化
        const foreshadowingInfo = unresolved.map((f: Foreshadowing, index: number) =>
          `${index + 1}. 「${f.description}」（チャプター${f.chapter_introduced}で導入、${f.plannedResolution ? `チャプター${f.plannedResolution}で解決予定` : '解決予定未定'}）`
        ).join('\n');

        // プロンプト作成
        const prompt = `
以下の未解決の伏線リストから、現在のチャプター内容に基づいて、解決できる（または解決すべき）伏線を${remainingCount}個選んでください。
それぞれの伏線について、なぜこのチャプターで解決すべきか、どのように解決できるかを簡潔に説明してください。

【未解決の伏線リスト】
${foreshadowingInfo}

【現在のチャプター内容】
${chapterContent.substring(0, 4000)}

以下の形式で回答してください：
選択した伏線番号: [番号]
解決理由: [このチャプターでこの伏線を解決すべき理由]
解決方法: [どのように解決できるか具体的な提案]
        `;

        // AIに提案を依頼
        const response = await this.geminiClient.generateText(prompt, {
          temperature: 0.3
        });

        // 提案された伏線番号を抽出
        const suggestedIndices: number[] = [];
        const pattern = /選択した伏線番号:\s*(\d+)/g;
        let match;

        while ((match = pattern.exec(response)) !== null) {
          const index = parseInt(match[1], 10) - 1; // 1-indexed to 0-indexed
          if (index >= 0 && index < unresolved.length) {
            suggestedIndices.push(index);
          }
        }

        // 提案された伏線を追加
        suggestedIndices.forEach(i => {
          if (result.findIndex(item => item.id === unresolved[i].id) === -1) {
            result.push(unresolved[i]);
          }
        });
      }

      return result;
    } catch (error) {
      logError(error, { chapterNumber }, '伏線解決提案中にエラーが発生しました');
      return [];
    }
  }

}

// シングルトンインスタンスをエクスポート
export const foreshadowingEngine = new ForeshadowingEngine();
