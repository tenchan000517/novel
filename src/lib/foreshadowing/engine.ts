// src/lib/foreshadowing/engine.ts

/**
 * @fileoverview 伏線生成エンジン - 新統合記憶階層システム完全対応版
 * @description
 * 新しい統合記憶階層システムに完全対応した伏線生成エンジン。
 * MemoryManagerのパブリックAPIのみを使用し、型安全性を完全確保。
 * 既存機能を完全保持しつつ、新システムの能力を最大限活用。
 */

import { Foreshadowing } from '@/types/memory';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { MemoryLevel } from '@/lib/memory/core/types';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { getPlannedForeshadowingManager } from './planned-foreshadowing-manager';

/**
 * 統合コンテキスト型定義
 */
interface ConsolidatedContext {
  existingForeshadowing: Array<{
    source: MemoryLevel;
    type: string;
    data: any;
    relevance: number;
    metadata: Record<string, any>;
  }>;
  characterStates: Array<{
    source: MemoryLevel;
    type: string;
    data: any;
    relevance: number;
    metadata: Record<string, any>;
  }>;
  plotProgression: Array<{
    source: MemoryLevel;
    type: string;
    data: any;
    relevance: number;
    metadata: Record<string, any>;
  }>;
  worldContext: Array<{
    source: MemoryLevel;
    type: string;
    data: any;
    relevance: number;
    metadata: Record<string, any>;
  }>;
  chapterNumber: number;
  searchSuccessRate: number;
}

/**
 * 伏線生成結果
 */
interface ForeshadowingGenerationResult {
  success: boolean;
  foreshadowings: Foreshadowing[];
  processingTime: number;
  sourceTypes: Array<'planned' | 'ai-generated'>;
  savedCount: number;
  error?: string;
}

/**
 * 伏線解決候補結果
 */
interface ForeshadowingResolutionResult {
  success: boolean;
  candidates: Foreshadowing[];
  processingTime: number;
  sourceTypes: Array<'planned' | 'memory-search' | 'ai-analysis'>;
  error?: string;
}

/**
 * @class ForeshadowingEngine
 * @description
 * 新統合記憶階層システムに完全対応した伏線生成・管理エンジン。
 * MemoryManagerの依存注入とパブリックAPIのみを使用した安全な実装。
 */
export class ForeshadowingEngine {
  private geminiClient: GeminiClient;
  private performanceMetrics = {
    totalGenerations: 0,
    successfulGenerations: 0,
    failedGenerations: 0,
    averageProcessingTime: 0,
    memorySystemHits: 0,
    cacheEfficiencyRate: 0,
    lastOptimization: new Date().toISOString()
  };

  /**
   * コンストラクタ - 依存注入パターンを完全実装
   * @param memoryManager 統合記憶管理システム（必須依存注入）
   */
  constructor(
    private memoryManager: MemoryManager
  ) {
    if (!this.memoryManager) {
      throw new Error('MemoryManager is required for ForeshadowingEngine initialization');
    }

    this.geminiClient = new GeminiClient();
    this.validateConfiguration();
    logger.info('ForeshadowingEngine initialized with unified memory system integration');
  }

  /**
   * 設定の完全検証
   * @private
   */
  private validateConfiguration(): void {
    if (!this.memoryManager) {
      throw new Error('MemoryManager dependency is missing');
    }

    if (!this.geminiClient) {
      throw new Error('GeminiClient initialization failed');
    }

    // システム状態の確認
    const systemState = this.memoryManager.getSystemState();
    if (systemState !== 'RUNNING' && systemState !== 'INITIALIZING') {
      logger.warn('MemoryManager is not in optimal state', { systemState });
    }
  }

  /**
   * チャプター内容から新しい伏線を生成 - 統合記憶システム完全活用版
   * @param chapterContent チャプター内容
   * @param chapterNumber チャプター番号
   * @param count 生成する伏線数
   * @returns 伏線生成結果
   */
  async generateForeshadowing(
    chapterContent: string,
    chapterNumber: number,
    count: number = 2
  ): Promise<ForeshadowingGenerationResult> {
    const startTime = Date.now();
    this.performanceMetrics.totalGenerations++;

    try {
      logger.info(`Starting foreshadowing generation for chapter ${chapterNumber}`, {
        requestedCount: count,
        contentLength: chapterContent.length
      });

      const result: ForeshadowingGenerationResult = {
        success: false,
        foreshadowings: [],
        processingTime: 0,
        sourceTypes: [],
        savedCount: 0
      };

      // 1. 計画済み伏線の安全な読み込み
      await this.ensurePlannedForeshadowingLoaded();

      // 2. 統合記憶システムから既存コンテキストを取得
      const memoryContext = await this.getComprehensiveMemoryContext(chapterNumber);

      // 3. 計画済み伏線の処理
      const plannedForeshadowings = await this.processPlannedForeshadowings(chapterNumber);
      if (plannedForeshadowings.length > 0) {
        result.foreshadowings.push(...plannedForeshadowings);
        result.sourceTypes.push('planned');
        logger.info(`Added ${plannedForeshadowings.length} planned foreshadowings`);
      }

      // 4. 不足分のAI生成
      const remainingCount = Math.max(0, count - result.foreshadowings.length);
      if (remainingCount > 0) {
        const aiGenerated = await this.generateAIForeshadowings(
          chapterContent,
          chapterNumber,
          remainingCount,
          memoryContext
        );

        if (aiGenerated.length > 0) {
          result.foreshadowings.push(...aiGenerated);
          result.sourceTypes.push('ai-generated');
          logger.info(`Generated ${aiGenerated.length} AI foreshadowings`);
        }
      }

      // 5. 伏線の保存と検証
      const savedCount = await this.saveForeshadowingsWithValidation(result.foreshadowings);
      result.savedCount = savedCount;

      // 6. 結果の最終処理
      result.success = result.foreshadowings.length > 0;
      result.processingTime = Date.now() - startTime;

      if (result.success) {
        this.performanceMetrics.successfulGenerations++;
        this.performanceMetrics.memorySystemHits++;
      } else {
        this.performanceMetrics.failedGenerations++;
      }

      this.updateAverageProcessingTime(result.processingTime);

      logger.info(`Foreshadowing generation completed`, {
        chapterNumber,
        success: result.success,
        generatedCount: result.foreshadowings.length,
        savedCount: result.savedCount,
        processingTime: result.processingTime,
        sourceTypes: result.sourceTypes
      });

      return result;

    } catch (error) {
      this.performanceMetrics.failedGenerations++;
      const processingTime = Date.now() - startTime;

      const errorMessage = error instanceof Error ? error.message : String(error);
      logError(error, { chapterNumber, count }, 'Foreshadowing generation failed');

      return {
        success: false,
        foreshadowings: [],
        processingTime,
        sourceTypes: [],
        savedCount: 0,
        error: errorMessage
      };
    }
  }

  /**
   * 統合記憶システムから包括的コンテキストを取得
   * @private
   */
  private async getComprehensiveMemoryContext(chapterNumber: number): Promise<ConsolidatedContext> {
    try {
      // MemoryManagerのパブリックAPIを使用した統合検索
      const searchQueries = [
        'foreshadowing unresolved',
        'character development',
        'plot progression',
        'world building'
      ];

      const searchResults = await Promise.allSettled(
        searchQueries.map(query =>
          this.memoryManager.unifiedSearch(query, [
            MemoryLevel.SHORT_TERM,
            MemoryLevel.MID_TERM,
            MemoryLevel.LONG_TERM
          ])
        )
      );

      // 検索結果の統合
      const consolidatedContext: ConsolidatedContext = {
        existingForeshadowing: [],
        characterStates: [],
        plotProgression: [],
        worldContext: [],
        chapterNumber,
        searchSuccessRate: 0
      };

      let successfulSearches = 0;
      searchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successfulSearches++;
          const searchData = result.value.results || [];

          // 検索結果を適切な形式に変換
          const formattedData = searchData.map(item => ({
            source: item.source || MemoryLevel.LONG_TERM,
            type: item.type || 'unknown',
            data: item.data || {},
            relevance: item.relevance || 0,
            metadata: item.metadata || {}
          }));

          switch (index) {
            case 0: // foreshadowing
              consolidatedContext.existingForeshadowing = formattedData;
              break;
            case 1: // characters
              consolidatedContext.characterStates = formattedData;
              break;
            case 2: // plot
              consolidatedContext.plotProgression = formattedData;
              break;
            case 3: // world
              consolidatedContext.worldContext = formattedData;
              break;
          }
        }
      });

      consolidatedContext.searchSuccessRate = successfulSearches / searchQueries.length;
      this.updateCacheEfficiency(consolidatedContext.searchSuccessRate);

      return consolidatedContext;

    } catch (error) {
      logger.warn('Failed to get comprehensive memory context', { error, chapterNumber });
      return {
        existingForeshadowing: [],
        characterStates: [],
        plotProgression: [],
        worldContext: [],
        chapterNumber,
        searchSuccessRate: 0
      };
    }
  }

  /**
   * 計画済み伏線の安全な処理
   * @private
   */
  private async processPlannedForeshadowings(chapterNumber: number): Promise<Foreshadowing[]> {
    try {
      const plannedManager = getPlannedForeshadowingManager(this.memoryManager);
      const plannedItems = plannedManager.getForeshadowingsToIntroduceInChapter(chapterNumber);
      const convertedForeshadowings: Foreshadowing[] = [];

      for (const planned of plannedItems) {
        try {
          const converted = plannedManager.convertToForeshadowing(planned);
          convertedForeshadowings.push(converted);
          plannedManager.markAsIntroduced(planned.id);
        } catch (conversionError) {
          logger.warn('Failed to convert planned foreshadowing', {
            plannedId: planned.id,
            error: conversionError
          });
        }
      }

      if (convertedForeshadowings.length > 0) {
        await this.savePlannedForeshadowingChanges();
      }

      return convertedForeshadowings;

    } catch (error) {
      logger.warn('Failed to process planned foreshadowings', { error, chapterNumber });
      return [];
    }
  }

  /**
   * AI生成伏線の作成
   * @private
   */
  private async generateAIForeshadowings(
    chapterContent: string,
    chapterNumber: number,
    count: number,
    memoryContext: ConsolidatedContext
  ): Promise<Foreshadowing[]> {
    if (count <= 0) return [];

    try {
      // 統合コンテキストを活用したプロンプト生成
      const contextualPrompt = this.buildContextualPrompt(
        chapterContent,
        chapterNumber,
        count,
        memoryContext
      );

      // Gemini APIによる生成
      const response = await this.geminiClient.generateText(contextualPrompt, {
        temperature: 0.7
      });

      // レスポンスの解析と構造化
      const parsedForeshadowings = this.parseForeshadowingResponse(response, chapterNumber);

      logger.debug(`AI generated ${parsedForeshadowings.length} foreshadowings`, {
        requestedCount: count,
        chapterNumber
      });

      return parsedForeshadowings;

    } catch (error) {
      logger.error('AI foreshadowing generation failed', { error, chapterNumber, count });
      return [];
    }
  }

  /**
   * 統合コンテキストを活用したプロンプト構築
   * @private
   */
  private buildContextualPrompt(
    chapterContent: string,
    chapterNumber: number,
    count: number,
    memoryContext: ConsolidatedContext
  ): string {
    const contextSummary = this.buildContextSummary(memoryContext);

    return `
あなたは小説のストーリー展開の専門家です。以下の情報を基に、将来的に回収できる自然な伏線を${count}個生成してください。

【現在のチャプター情報】
- チャプター番号: ${chapterNumber}
- 内容: ${chapterContent.substring(0, 4000)}

【既存のストーリーコンテキスト】
${contextSummary}

【伏線生成ガイドライン】
- 既存の伏線と重複しないユニークな内容
- 将来の展開で自然に回収できる要素
- キャラクターや世界設定と一貫性のある内容
- 読者の興味を引く適度な謎要素

以下の形式で正確に${count}個の伏線を提案してください:

1. 伏線の説明: [簡潔で具体的な説明]
2. 導入方法: [このチャプターでどのように表現されているか]
3. 解決予想: [将来どのように回収される可能性があるか]
4. 重要度: [low/medium/high]
5. 関連キャラクター: [関わるキャラクター名]
6. 予想解決チャプター: [おおよそのチャプター番号]

各伏線は独立した内容とし、番号付きリストで記述してください。
`;
  }

  /**
   * メモリコンテキストのサマリー構築
   * @private
   */
  private buildContextSummary(memoryContext: ConsolidatedContext): string {
    const parts: string[] = [];

    if (memoryContext.existingForeshadowing?.length > 0) {
      parts.push(`既存伏線: ${memoryContext.existingForeshadowing.length}件の未解決伏線があります`);
    }

    if (memoryContext.characterStates?.length > 0) {
      parts.push(`キャラクター状況: ${memoryContext.characterStates.length}件のキャラクター情報`);
    }

    if (memoryContext.plotProgression?.length > 0) {
      parts.push(`物語進行: ${memoryContext.plotProgression.length}件の進行データ`);
    }

    if (memoryContext.worldContext?.length > 0) {
      parts.push(`世界設定: ${memoryContext.worldContext.length}件の設定情報`);
    }

    return parts.length > 0 ? parts.join('\n') : '新規ストーリー開始';
  }

  /**
   * 伏線レスポンスの解析 - 改良版（ES2015互換）
   * @private
   */
  private parseForeshadowingResponse(response: string, chapterNumber: number): Foreshadowing[] {
    try {
      const foreshadowingItems: Foreshadowing[] = [];
      const now = new Date().toISOString();

      // ES2015互換の正規表現パターンを使用（sフラグを削除）
      const foreshadowingPattern = /(\d+)\.\s*伏線の説明:\s*([\s\S]*?)(?=\d+\.\s*伏線の説明:|$)/g;

      let match;
      while ((match = foreshadowingPattern.exec(response)) !== null) {
        const fullText = match[0];

        try {
          // 各フィールドの安全な抽出
          const extractValue = (field: string): string => {
            const pattern = new RegExp(`${field}:\\s*([^\\n]+)`, 'i');
            const fieldMatch = fullText.match(pattern);
            return fieldMatch ? fieldMatch[1].trim() : '';
          };

          // フィールド抽出
          const description = extractValue('伏線の説明');
          const introduction = extractValue('導入方法');
          const resolution = extractValue('解決予想');
          const importance = extractValue('重要度');
          const characters = extractValue('関連キャラクター');
          const resolutionChapter = extractValue('予想解決チャプター');

          // 必須フィールドの検証
          if (!description || description.length < 10) {
            logger.warn('Skipping foreshadowing with insufficient description', { description });
            continue;
          }

          // 重要度の標準化
          const standardizeUrgency = (urgency: string): 'low' | 'medium' | 'high' => {
            const lower = urgency.toLowerCase();
            if (lower.includes('high') || lower.includes('高')) return 'high';
            if (lower.includes('low') || lower.includes('低')) return 'low';
            return 'medium';
          };

          // 章番号の解析
          const parseChapterNumber = (text: string): number | undefined => {
            const numMatch = text.match(/(\d+)/);
            return numMatch ? parseInt(numMatch[1], 10) : undefined;
          };

          // 伏線オブジェクトの安全な構築
          const foreshadowing: Foreshadowing = {
            id: `fs-unified-${Date.now()}-${foreshadowingItems.length}`,
            description,
            context: introduction || `チャプター${chapterNumber}で導入`,
            chapter_introduced: chapterNumber,
            potential_resolution: resolution || '将来の展開で解決予定',
            resolved: false,
            urgency: standardizeUrgency(importance),
            createdTimestamp: now,
            updatedTimestamp: now
          };

          // オプションフィールドの安全な設定
          const plannedResolution = parseChapterNumber(resolutionChapter);
          if (plannedResolution && plannedResolution > chapterNumber) {
            foreshadowing.plannedResolution = plannedResolution;
          }

          // キャラクター情報の処理
          if (characters && characters.trim().length > 0) {
            const characterList = characters
              .split(/[,、/／]/)
              .map(c => c.trim())
              .filter(c => c.length > 0 && c !== 'なし' && c !== 'none');

            if (characterList.length > 0) {
              foreshadowing.relatedCharacters = characterList;
            }
          }

          foreshadowingItems.push(foreshadowing);

        } catch (itemError) {
          logger.warn('Failed to parse individual foreshadowing item', {
            error: itemError,
            fullText: fullText.substring(0, 200)
          });
        }
      }

      return foreshadowingItems;

    } catch (error) {
      logError(error, { chapterNumber }, 'Failed to parse foreshadowing response');
      return [];
    }
  }

  /**
   * 伏線の保存と検証 - 統合記憶システム活用版
   * @private
   */
  private async saveForeshadowingsWithValidation(foreshadowings: Foreshadowing[]): Promise<number> {
    if (foreshadowings.length === 0) return 0;

    try {
      // MemoryManagerの状態確認
      const systemStatus = await this.memoryManager.getSystemStatus();
      if (!systemStatus.initialized) {
        logger.warn('MemoryManager not properly initialized');
        return 0;
      }

      let savedCount = 0;

      // 各伏線を個別に安全に保存
      for (const foreshadowing of foreshadowings) {
        try {
          // 重複チェック（統合検索を活用）
          const duplicateCheck = await this.checkForDuplicates(foreshadowing);

          if (!duplicateCheck.isDuplicate) {
            // 統合記憶システムへの保存（processChapterメソッド活用）
            const saveResult = await this.saveToUnifiedMemorySystem(foreshadowing);

            if (saveResult.success) {
              savedCount++;
            } else {
              logger.warn('Failed to save foreshadowing to unified memory', {
                foreshadowingId: foreshadowing.id,
                error: saveResult.error
              });
            }
          } else {
            logger.debug('Skipped duplicate foreshadowing', {
              description: foreshadowing.description.substring(0, 50),
              similarityScore: duplicateCheck.similarityScore
            });
          }

        } catch (itemError) {
          logger.error('Failed to save individual foreshadowing', {
            foreshadowingId: foreshadowing.id,
            error: itemError instanceof Error ? itemError.message : String(itemError)
          });
        }
      }

      logger.info('Foreshadowing batch save completed', {
        totalItems: foreshadowings.length,
        savedCount,
        skipCount: foreshadowings.length - savedCount
      });

      return savedCount;

    } catch (error) {
      logError(error, { count: foreshadowings.length }, 'Batch foreshadowing save failed');
      return 0;
    }
  }

  /**
   * 重複チェック - 統合検索活用版
   * @private
   */
  private async checkForDuplicates(foreshadowing: Foreshadowing): Promise<{
    isDuplicate: boolean;
    similarityScore: number;
  }> {
    try {
      // 統合検索による類似伏線検索
      const searchResult = await this.memoryManager.unifiedSearch(
        foreshadowing.description.substring(0, 100),
        [MemoryLevel.LONG_TERM]
      );

      if (!searchResult.success || searchResult.totalResults === 0) {
        return { isDuplicate: false, similarityScore: 0 };
      }

      // 類似度の簡易計算
      let maxSimilarity = 0;
      for (const result of searchResult.results) {
        if (result.type === 'foreshadowing' && result.data) {
          const similarity = this.calculateSimilarity(
            foreshadowing.description,
            result.data.description || ''
          );
          maxSimilarity = Math.max(maxSimilarity, similarity);
        }
      }

      return {
        isDuplicate: maxSimilarity > 0.8,
        similarityScore: maxSimilarity
      };

    } catch (error) {
      logger.warn('Duplicate check failed', { error, foreshadowingId: foreshadowing.id });
      return { isDuplicate: false, similarityScore: 0 };
    }
  }

  /**
   * 簡易類似度計算
   * @private
   */
  private calculateSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;

    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);

    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);

    return totalWords > 0 ? commonWords.length / totalWords : 0;
  }

  /**
   * 統合記憶システムへの保存
   * @private
   */
  private async saveToUnifiedMemorySystem(foreshadowing: Foreshadowing): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // 章データとして構築してprocessChapterメソッドを活用
      const foreshadowingChapter = this.buildForeshadowingChapter(foreshadowing);

      const result = await this.memoryManager.processChapter(foreshadowingChapter);

      return {
        success: result.success,
        // SystemOperationResultには'errors'プロパティがあるため修正
        error: result.success ? undefined : (result.errors && result.errors.length > 0 ? result.errors[0] : 'Unknown error')
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }


  /**
   * 伏線用章データの構築
   * @private
   */
  private buildForeshadowingChapter(foreshadowing: Foreshadowing): any {
    // types.tsで定義されたChapter型に完全準拠
    return {
      id: `foreshadowing-chapter-${foreshadowing.id}`,
      chapterNumber: foreshadowing.chapter_introduced,
      title: `伏線記録: ${foreshadowing.description.substring(0, 30)}`,
      content: JSON.stringify({
        type: 'foreshadowing',
        data: foreshadowing
      }),
      previousChapterSummary: '',
      scenes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        status: 'foreshadowing',
        type: 'foreshadowing-record',
        foreshadowingId: foreshadowing.id,
        wordCount: JSON.stringify(foreshadowing).length,
        estimatedReadingTime: 1
      }
    };
  }

  /**
   * 解決すべき伏線の提案 - 統合記憶システム完全活用版
   */
  async suggestForeshadowingsToResolve(
    chapterContent: string,
    chapterNumber: number,
    count: number = 2
  ): Promise<ForeshadowingResolutionResult> {
    const startTime = Date.now();

    try {
      logger.info(`Suggesting foreshadowings to resolve for chapter ${chapterNumber}`, {
        requestedCount: count
      });

      const result: ForeshadowingResolutionResult = {
        success: false,
        candidates: [],
        processingTime: 0,
        sourceTypes: []
      };

      // 1. 計画済み解決候補の取得
      await this.ensurePlannedForeshadowingLoaded();
      const plannedResolutions = await this.getPlannedResolutions(chapterNumber);

      if (plannedResolutions.length > 0) {
        result.candidates.push(...plannedResolutions);
        result.sourceTypes.push('planned');
      }

      // 2. 統合記憶システムからの未解決伏線検索
      const memorySearchCandidates = await this.searchUnresolvedForeshadowings(chapterNumber);

      if (memorySearchCandidates.length > 0) {
        result.candidates.push(...memorySearchCandidates);
        result.sourceTypes.push('memory-search');
      }

      // 3. 必要に応じてAI分析
      const remainingCount = Math.max(0, count - result.candidates.length);
      if (remainingCount > 0 && memorySearchCandidates.length > 0) {
        const aiAnalyzed = await this.analyzeResolutionCandidates(
          chapterContent,
          chapterNumber,
          memorySearchCandidates,
          remainingCount
        );

        if (aiAnalyzed.length > 0) {
          result.candidates.push(...aiAnalyzed);
          result.sourceTypes.push('ai-analysis');
        }
      }

      // 4. 重複除去と優先度ソート
      result.candidates = this.deduplicateAndSortCandidates(result.candidates, count);

      result.success = result.candidates.length > 0;
      result.processingTime = Date.now() - startTime;

      logger.info('Foreshadowing resolution suggestion completed', {
        chapterNumber,
        candidateCount: result.candidates.length,
        sourceTypes: result.sourceTypes,
        processingTime: result.processingTime
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logError(error, { chapterNumber, count }, 'Foreshadowing resolution suggestion failed');

      return {
        success: false,
        candidates: [],
        processingTime: Date.now() - startTime,
        sourceTypes: [],
        error: errorMessage
      };
    }
  }

  /**
   * 計画済み解決候補の取得
   * @private
   */
  private async getPlannedResolutions(chapterNumber: number): Promise<Foreshadowing[]> {
    try {
      const plannedManager = getPlannedForeshadowingManager(this.memoryManager);
      const plannedResolutions = plannedManager.getForeshadowingsToResolveInChapter(chapterNumber);
      const candidates: Foreshadowing[] = [];

      for (const planned of plannedResolutions) {
        const converted = plannedManager.convertToForeshadowing(planned);
        candidates.push(converted);
        plannedManager.markAsResolved(planned.id);
      }

      if (candidates.length > 0) {
        await this.savePlannedForeshadowingChanges();
      }

      return candidates;

    } catch (error) {
      logger.warn('Failed to get planned resolutions', { error, chapterNumber });
      return [];
    }
  }

  /**
   * 統合記憶システムから未解決伏線を検索
   * @private
   */
  private async searchUnresolvedForeshadowings(chapterNumber: number): Promise<Foreshadowing[]> {
    try {
      // 統合検索による未解決伏線の取得
      const searchResult = await this.memoryManager.unifiedSearch(
        'foreshadowing unresolved pending',
        [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM]
      );

      if (!searchResult.success) {
        logger.warn('Unified search for unresolved foreshadowings failed');
        return [];
      }

      const candidates: Foreshadowing[] = [];

      // 検索結果から伏線データを抽出
      for (const result of searchResult.results) {
        if (result.type === 'foreshadowing' && result.data) {
          const foreshadowing = this.extractForeshadowingFromResult(result.data);
          if (foreshadowing && !foreshadowing.resolved) {
            // 解決予定時期のチェック
            if (this.isAppropriateForResolution(foreshadowing, chapterNumber)) {
              candidates.push(foreshadowing);
            }
          }
        }
      }

      return candidates;

    } catch (error) {
      logger.warn('Failed to search unresolved foreshadowings', { error, chapterNumber });
      return [];
    }
  }

  /**
   * 検索結果から伏線データを抽出
   * @private
   */
  private extractForeshadowingFromResult(resultData: any): Foreshadowing | null {
    try {
      // 結果データが既にForeshadowing型の場合
      if (resultData.id && resultData.description && typeof resultData.resolved === 'boolean') {
        return resultData as Foreshadowing;
      }

      // ネストされた構造から抽出
      if (resultData.data && typeof resultData.data === 'object') {
        return this.extractForeshadowingFromResult(resultData.data);
      }

      // JSON文字列の場合
      if (typeof resultData === 'string') {
        try {
          const parsed = JSON.parse(resultData);
          return this.extractForeshadowingFromResult(parsed);
        } catch {
          return null;
        }
      }

      return null;

    } catch (error) {
      logger.debug('Failed to extract foreshadowing from result', { error });
      return null;
    }
  }

  /**
   * 解決適時性の判定
   * @private
   */
  private isAppropriateForResolution(foreshadowing: Foreshadowing, currentChapter: number): boolean {
    // 基本条件：未解決であること
    if (foreshadowing.resolved) return false;

    // 導入から最低3章経過していること
    if (currentChapter - foreshadowing.chapter_introduced < 3) return false;

    // 計画解決時期がある場合の考慮
    if (foreshadowing.plannedResolution) {
      // 予定時期の±3章以内であること
      const timingDiff = Math.abs(currentChapter - foreshadowing.plannedResolution);
      return timingDiff <= 3;
    }

    // 長期間未解決（15章以上）の場合は積極的に解決候補とする
    if (currentChapter - foreshadowing.chapter_introduced >= 15) return true;

    // 中期的未解決（8章以上）で緊急度が高い場合
    if (currentChapter - foreshadowing.chapter_introduced >= 8 && foreshadowing.urgency === 'high') {
      return true;
    }

    // その他の場合は適度な間隔で解決候補とする
    return currentChapter - foreshadowing.chapter_introduced >= 6;
  }

  /**
   * AI分析による解決候補の評価
   * @private
   */
  private async analyzeResolutionCandidates(
    chapterContent: string,
    chapterNumber: number,
    candidates: Foreshadowing[],
    maxCount: number
  ): Promise<Foreshadowing[]> {
    if (candidates.length === 0 || maxCount <= 0) return [];

    try {
      // 候補情報の構築
      const candidateInfo = candidates.map((f, index) =>
        `${index + 1}. 「${f.description}」（チャプター${f.chapter_introduced}で導入、${f.plannedResolution ? `チャプター${f.plannedResolution}で解決予定` : '解決予定未定'}）`
      ).join('\n');

      const prompt = `
以下の未解決の伏線候補から、現在のチャプター内容に基づいて解決可能または解決すべき伏線を最大${maxCount}個選んでください。

【未解決伏線候補】
${candidateInfo}

【現在のチャプター内容】
${chapterContent.substring(0, 4000)}

各候補について以下を評価してください：
- このチャプターで解決する適切性
- チャプター内容との関連性
- 解決することによるストーリーへの効果

以下の形式で回答してください：
選択した伏線番号: [番号]
解決理由: [このチャプターで解決すべき理由]
解決方法: [どのように解決できるか]
適切性スコア: [1-10の数値]

複数選択する場合は、それぞれについて上記形式で記述してください。
適切な候補がない場合は「適切な候補なし」と回答してください。
`;

      const response = await this.geminiClient.generateText(prompt, {
        temperature: 0.3
      });

      return this.parseResolutionAnalysis(response, candidates);

    } catch (error) {
      logger.warn('AI resolution analysis failed', { error, chapterNumber });
      return [];
    }
  }

  /**
   * AI解決分析結果のパース
   * @private
   */
  private parseResolutionAnalysis(response: string, candidates: Foreshadowing[]): Foreshadowing[] {
    try {
      if (response.includes('適切な候補なし')) return [];

      const selectedCandidates: Foreshadowing[] = [];
      const pattern = /選択した伏線番号:\s*(\d+)/g;
      const scorePattern = /適切性スコア:\s*(\d+)/g;

      let match;
      let scoreMatch;
      const matches: number[] = [];
      const scores: number[] = [];

      // 番号とスコアを抽出
      while ((match = pattern.exec(response)) !== null) {
        const index = parseInt(match[1], 10) - 1;
        if (index >= 0 && index < candidates.length) {
          matches.push(index);
        }
      }

      while ((scoreMatch = scorePattern.exec(response)) !== null) {
        const score = parseInt(scoreMatch[1], 10);
        if (score >= 1 && score <= 10) {
          scores.push(score);
        }
      }

      // スコアが6以上の候補のみを選択
      for (let i = 0; i < matches.length && i < scores.length; i++) {
        if (scores[i] >= 6) {
          selectedCandidates.push(candidates[matches[i]]);
        }
      }

      return selectedCandidates;

    } catch (error) {
      logger.warn('Failed to parse resolution analysis', { error });
      return [];
    }
  }

  /**
   * 候補の重複除去と優先度ソート
   * @private
   */
  private deduplicateAndSortCandidates(candidates: Foreshadowing[], maxCount: number): Foreshadowing[] {
    // IDベースの重複除去
    const unique = new Map<string, Foreshadowing>();

    for (const candidate of candidates) {
      if (!unique.has(candidate.id)) {
        unique.set(candidate.id, candidate);
      }
    }

    // 優先度ソート（緊急度、導入からの経過時間を考慮）
    const sorted = Array.from(unique.values()).sort((a, b) => {
      // 緊急度による優先度
      const urgencyScore = (urgency: string) => {
        switch (urgency) {
          case 'high': return 3;
          case 'medium': return 2;
          case 'low': return 1;
          default: return 2;
        }
      };

      const scoreA = urgencyScore(a.urgency);
      const scoreB = urgencyScore(b.urgency);

      if (scoreA !== scoreB) return scoreB - scoreA;

      // 導入からの経過時間（長い方が優先）
      return a.chapter_introduced - b.chapter_introduced;
    });

    return sorted.slice(0, maxCount);
  }

  /**
   * 古い伏線の検出 - 統合記憶システム活用版
   */
  async checkStaleForeshadowing(currentChapter: number): Promise<Foreshadowing[]> {
    try {
      logger.info(`Checking stale foreshadowings for chapter ${currentChapter}`);

      // 統合検索で古い未解決伏線を検索
      const searchResult = await this.memoryManager.unifiedSearch(
        'foreshadowing unresolved old stale',
        [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM]
      );

      if (!searchResult.success) {
        logger.warn('Search for stale foreshadowings failed');
        return [];
      }

      const staleForeshadowings: Foreshadowing[] = [];
      const staleThreshold = 15; // 15章以上前に導入されて未解決

      for (const result of searchResult.results) {
        const foreshadowing = this.extractForeshadowingFromResult(result.data);

        if (foreshadowing && !foreshadowing.resolved) {
          const chaptersElapsed = currentChapter - foreshadowing.chapter_introduced;

          // 古い伏線の条件
          const isStale = chaptersElapsed > staleThreshold &&
            (!foreshadowing.plannedResolution || currentChapter > foreshadowing.plannedResolution);

          if (isStale) {
            staleForeshadowings.push(foreshadowing);
          }
        }
      }

      logger.info(`Found ${staleForeshadowings.length} stale foreshadowings`, {
        currentChapter,
        threshold: staleThreshold
      });

      return staleForeshadowings;

    } catch (error) {
      logError(error, { currentChapter }, 'Stale foreshadowing check failed');
      return [];
    }
  }

  /**
   * パフォーマンス統計の取得
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  /**
 * システム診断の実行
 */
  async performDiagnostics(): Promise<{
    systemHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    memorySystemConnectivity: boolean;
    performanceMetrics: any; // typeof this.performanceMetricsの代わりに明示的な型を使用
    recommendations: string[];
  }> {
    try {
      const systemStatus = await this.memoryManager.getSystemStatus();
      const diagnostics = await this.memoryManager.performSystemDiagnostics();

      const recommendations: string[] = [];
      let systemHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';

      // パフォーマンス評価
      if (this.performanceMetrics.failedGenerations > this.performanceMetrics.successfulGenerations * 0.1) {
        systemHealth = 'DEGRADED';
        recommendations.push('High failure rate detected in foreshadowing generation');
      }

      // メモリシステム接続性評価
      if (!systemStatus.initialized) {
        systemHealth = 'CRITICAL';
        recommendations.push('Memory system not properly initialized');
      }

      // キャッシュ効率評価
      if (this.performanceMetrics.cacheEfficiencyRate < 0.5) {
        recommendations.push('Consider optimizing memory access patterns');
      }

      return {
        systemHealth,
        memorySystemConnectivity: systemStatus.initialized,
        performanceMetrics: this.performanceMetrics,
        recommendations
      };

    } catch (error) {
      logError(error, {}, 'System diagnostics failed');
      return {
        systemHealth: 'CRITICAL',
        memorySystemConnectivity: false,
        performanceMetrics: this.performanceMetrics,
        recommendations: ['System diagnostics failed - check error logs']
      };
    }
  }

  // ============================================================================
  // プライベートヘルパーメソッド
  // ============================================================================

  /**
   * 計画済み伏線の安全な読み込み確保
   * @private
   */
  private async ensurePlannedForeshadowingLoaded(): Promise<void> {
    try {
      const plannedManager = getPlannedForeshadowingManager(this.memoryManager);
      if (!plannedManager.isLoaded()) {
        await plannedManager.loadPlannedForeshadowings();
      }
    } catch (error) {
      logger.warn('Failed to ensure planned foreshadowing loaded', { error });
    }
  }

  /**
   * 計画済み伏線の変更保存
   * @private
   */
  private async savePlannedForeshadowingChanges(): Promise<void> {
    try {
      const plannedManager = getPlannedForeshadowingManager(this.memoryManager);
      await plannedManager.savePlannedForeshadowings();
    } catch (error) {
      logger.warn('Failed to save planned foreshadowing changes', { error });
    }
  }

  /**
   * 平均処理時間の更新
   * @private
   */
  private updateAverageProcessingTime(processingTime: number): void {
    this.performanceMetrics.averageProcessingTime =
      ((this.performanceMetrics.averageProcessingTime * (this.performanceMetrics.totalGenerations - 1)) + processingTime) /
      this.performanceMetrics.totalGenerations;
  }

  /**
   * キャッシュ効率の更新
   * @private
   */
  private updateCacheEfficiency(successRate: number): void {
    this.performanceMetrics.cacheEfficiencyRate =
      (this.performanceMetrics.cacheEfficiencyRate + successRate) / 2;
  }
}

// シングルトンインスタンスのエクスポート（依存注入対応）
export const createForeshadowingEngine = (memoryManager: MemoryManager): ForeshadowingEngine => {
  return new ForeshadowingEngine(memoryManager);
};