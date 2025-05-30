// src/lib/editor/semantic-merger.ts
import { DiffOperation, DiffChange, diffAlgorithm } from './diff-algorithm';
import { logError, logWarn } from '../utils/error-handler';
import { logger } from '../utils/logger';

/**
 * マージ優先度
 */
export enum MergePriority {
  MINE = 'MINE',       // 自分の変更を優先
  THEIRS = 'THEIRS',   // 相手の変更を優先
  SMART = 'SMART',     // コンテキストに基づいて判断
  BOTH = 'BOTH'        // 両方の変更を何らかの形で組み合わせる
}

/**
 * マージコンテキスト - 小説固有の情報
 */
export interface NovelContext {
  // キャラクター関連のコンテキスト
  characters?: {
    names: string[];                // キャラクター名のリスト
    focusCharacter?: string;        // 現在のフォーカスキャラクター
    relationships?: Record<string, string[]>; // キャラクター間の関係
  };
  
  // プロット関連のコンテキスト
  plot?: {
    currentStage?: string;          // 現在のプロットステージ
    keyEvents?: string[];           // 主要イベント
    foreshadowing?: string[];       // 伏線要素
  };
  
  // 世界観設定関連のコンテキスト
  worldBuilding?: {
    locations?: string[];           // 場所
    terminology?: string[];         // 専門用語
    rules?: string[];               // 世界のルール
  };
  
  // スタイル関連のコンテキスト
  style?: {
    tense?: 'PAST' | 'PRESENT';     // 時制
    perspective?: 'FIRST' | 'THIRD'; // 視点
    tone?: string;                  // トーン
  };
}

/**
 * マージ結果
 */
export interface MergeResult {
  /** マージされたテキスト */
  mergedText: string;
  
  /** マージで発生した競合 */
  conflicts: {
    mine: string;
    theirs: string;
    resolution: string;
    position: number;
  }[];
  
  /** 自動解決された数 */
  autoResolved: number;
  
  /** 手動解決が必要だった数 */
  manuallyResolved: number;
}

/**
 * 意味論的マージャー
 * 小説の文脈を理解し、より智能的なマージを行う
 */
export class SemanticMerger {
  /**
   * 3つのテキストをマージ
   * @param base 基本テキスト（共通の祖先）
   * @param mine 自分の変更
   * @param theirs 相手の変更
   * @param context 小説コンテキスト（オプション）
   * @param priority マージ優先度（オプション、デフォルトはSMART）
   * @returns マージ結果
   */
  merge(
    base: string,
    mine: string,
    theirs: string,
    context?: NovelContext,
    priority: MergePriority = MergePriority.SMART
  ): MergeResult {
    try {
      // テキストが完全に同じ場合は早期リターン
      if (mine === theirs) {
        return {
          mergedText: mine,
          conflicts: [],
          autoResolved: 0,
          manuallyResolved: 0
        };
      }
      
      // 基本テキストと一方が同じ場合、もう一方を使用
      if (mine === base) {
        return {
          mergedText: theirs,
          conflicts: [],
          autoResolved: 1,
          manuallyResolved: 0
        };
      }
      
      if (theirs === base) {
        return {
          mergedText: mine,
          conflicts: [],
          autoResolved: 1,
          manuallyResolved: 0
        };
      }
      
      // 差分を計算
      const mineDiffs = diffAlgorithm.computeDiff(base, mine);
      const theirDiffs = diffAlgorithm.computeDiff(base, theirs);
      
      // 差分のチャンク化（パラグラフや文ごとに）
      const mineChunks = this.chunkDiffs(mineDiffs, base);
      const theirChunks = this.chunkDiffs(theirDiffs, base);
      
      // マージ
      return this.mergeChunks(base, mineChunks, theirChunks, context, priority);
    } catch (error) {
      logError(error, 
        { baseLength: base.length, mineLength: mine.length, theirsLength: theirs.length },
        'Error merging texts'
      );
      
      // エラー時はマニュアルマージを促す
      return {
        mergedText: this.createConflictMarkers(base, mine, theirs),
        conflicts: [{
          mine,
          theirs,
          resolution: "ERROR_DURING_MERGE",
          position: 0
        }],
        autoResolved: 0,
        manuallyResolved: 1
      };
    }
  }
  
  /**
   * 3方向マージ（行ベース）
   * パラグラフや行単位のマージに適したシンプルな実装
   * @param base 基本テキスト
   * @param mine 自分の変更
   * @param theirs 相手の変更
   * @returns マージ結果
   */
  simpleThreeWayMerge(base: string, mine: string, theirs: string): MergeResult {
    // 行に分割
    const baseLines = base.split('\n');
    const mineLines = mine.split('\n');
    const theirLines = theirs.split('\n');
    
    // 結果とコンフリクト情報
    const result: string[] = [];
    const conflicts: MergeResult['conflicts'] = [];
    let autoResolved = 0;
    let manuallyResolved = 0;
    
    // 各行に対して簡単な3方向マージを試みる
    const maxLines = Math.max(baseLines.length, mineLines.length, theirLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const baseLine = i < baseLines.length ? baseLines[i] : '';
      const mineLine = i < mineLines.length ? mineLines[i] : '';
      const theirLine = i < theirLines.length ? theirLines[i] : '';
      
      if (mineLine === theirLine) {
        // 両方同じなら問題なし
        result.push(mineLine);
      } else if (mineLine === baseLine) {
        // 自分が変更していなければ相手の変更を採用
        result.push(theirLine);
        autoResolved++;
      } else if (theirLine === baseLine) {
        // 相手が変更していなければ自分の変更を採用
        result.push(mineLine);
        autoResolved++;
      } else {
        // 両方が変更している場合はコンフリクト
        // シンプルなヒューリスティックを適用
        if (this.canAutomaticallyMerge(baseLine, mineLine, theirLine)) {
          const mergedLine = this.smartMergeLine(baseLine, mineLine, theirLine);
          result.push(mergedLine);
          autoResolved++;
        } else {
          // 自動マージできない場合はコンフリクトマーカーを挿入
          result.push(`<<<<<<< MINE\n${mineLine}\n=======\n${theirLine}\n>>>>>>> THEIRS`);
          
          conflicts.push({
            mine: mineLine,
            theirs: theirLine,
            resolution: 'MANUAL_REQUIRED',
            position: result.length - 1
          });
          
          manuallyResolved++;
        }
      }
    }
    
    return {
      mergedText: result.join('\n'),
      conflicts,
      autoResolved,
      manuallyResolved
    };
  }
  
  /**
   * 差分をチャンク化する
   * パラグラフやシーンなどの意味のある単位でチャンク化
   * @param diffs 差分配列
   * @param baseText 基本テキスト
   * @returns チャンク化された差分
   */
  private chunkDiffs(diffs: DiffChange[], baseText: string): DiffChange[][] {
    const chunks: DiffChange[][] = [];
    let currentChunk: DiffChange[] = [];
    
    // パラグラフ区切りを検出するための正規表現
    const paragraphBreakRegex = /\n\s*\n/;
    
    // 文（センテンス）区切りを検出するための正規表現
    const sentenceBreakRegex = /[.!?]["\s]/;
    
    for (const diff of diffs) {
      // チャンク化の境界を検出
      const isParagraphBreak = diff.operation === DiffOperation.EQUAL && 
                               paragraphBreakRegex.test(diff.text);
      
      const isSentenceBreak = diff.operation === DiffOperation.EQUAL && 
                             sentenceBreakRegex.test(diff.text) && 
                             diff.text.length > 5;
      
      if (isParagraphBreak || (isSentenceBreak && currentChunk.length > 0)) {
        if (currentChunk.length > 0) {
          chunks.push([...currentChunk]);
          currentChunk = [];
        }
        
        // 区切り自体も1つのチャンクとして追加
        chunks.push([diff]);
      } else {
        currentChunk.push(diff);
        
        // チャンクサイズが大きくなりすぎないように制限
        if (currentChunk.length >= 10) {
          chunks.push([...currentChunk]);
          currentChunk = [];
        }
      }
    }
    
    // 残りのチャンクを追加
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }
  
  /**
   * チャンク化された差分をマージ
   * @param base 基本テキスト
   * @param mineChunks 自分の差分チャンク
   * @param theirChunks 相手の差分チャンク
   * @param context 小説コンテキスト
   * @param priority マージ優先度
   * @returns マージ結果
   */
  private mergeChunks(
    base: string,
    mineChunks: DiffChange[][],
    theirChunks: DiffChange[][],
    context?: NovelContext,
    priority: MergePriority = MergePriority.SMART
  ): MergeResult {
    // チャンク間の対応関係を構築
    const basePositions = this.mapDiffsToPositions(base, mineChunks.flat());
    
    // マージ結果を構築
    let mergedText = '';
    const conflicts: MergeResult['conflicts'] = [];
    let autoResolved = 0;
    let manuallyResolved = 0;
    
    // 現在のベーステキスト位置
    let currentPos = 0;
    
    // 各チャンクの処理
    for (let i = 0; i < mineChunks.length; i++) {
      const mineChunk = mineChunks[i];
      
      // マイン側のチャンクが対応する基本テキストの範囲を特定
      const mineStartPos = this.findChunkStartPosition(base, mineChunk, currentPos);
      const mineEndPos = this.findChunkEndPosition(base, mineChunk, mineStartPos);
      
      // 対応するtheir側のチャンクを見つける
      const theirChunk = this.findCorrespondingChunk(base, theirChunks, mineStartPos, mineEndPos);
      
      if (theirChunk) {
        // 両方のチャンクがある場合
        const mineText = this.applyDiffs(base.substring(mineStartPos, mineEndPos), mineChunk);
        const theirText = this.applyDiffs(base.substring(mineStartPos, mineEndPos), theirChunk);
        
        if (mineText === theirText) {
          // 変更が同じ場合
          mergedText += mineText;
        } else {
          // 変更が異なる場合
          const baseChunkText = base.substring(mineStartPos, mineEndPos);
          
          // チャンクのレベルで自動マージを試みる
          const chunkMergeResult = this.mergeTextChunk(
            baseChunkText, mineText, theirText, context, priority
          );
          
          mergedText += chunkMergeResult.text;
          
          if (chunkMergeResult.conflict) {
            conflicts.push({
              mine: mineText,
              theirs: theirText,
              resolution: chunkMergeResult.resolutionType || 'MANUAL_REQUIRED',
              position: mergedText.length - chunkMergeResult.text.length
            });
            
            if (chunkMergeResult.autoResolved) {
              autoResolved++;
            } else {
              manuallyResolved++;
            }
          } else {
            autoResolved++;
          }
        }
      } else {
        // 相手側に対応するチャンクがない場合は自分の変更をそのまま採用
        const mineText = this.applyDiffs(base.substring(mineStartPos, mineEndPos), mineChunk);
        mergedText += mineText;
      }
      
      // 現在位置を更新
      currentPos = mineEndPos;
    }
    
    // 基本テキストの残りの部分を追加
    if (currentPos < base.length) {
      mergedText += base.substring(currentPos);
    }
    
    return {
      mergedText,
      conflicts,
      autoResolved,
      manuallyResolved
    };
  }
  
  /**
   * 差分を適用してテキストを再構築
   * @param baseText 基本テキスト
   * @param diffs 差分配列
   * @returns 再構築されたテキスト
   */
  private applyDiffs(baseText: string, diffs: DiffChange[]): string {
    let result = '';
    let baseIndex = 0;
    
    for (const diff of diffs) {
      switch (diff.operation) {
        case DiffOperation.EQUAL:
          result += diff.text;
          baseIndex += diff.text.length;
          break;
        
        case DiffOperation.INSERT:
          result += diff.text;
          break;
        
        case DiffOperation.DELETE:
          baseIndex += diff.text.length;
          break;
      }
    }
    
    return result;
  }
  
  /**
   * 差分ベースの位置をベーステキストの位置にマッピング
   * @param baseText 基本テキスト
   * @param diffs 差分配列
   * @returns 位置マップ
   */
  private mapDiffsToPositions(baseText: string, diffs: DiffChange[]): Map<number, number> {
    const positionMap = new Map<number, number>();
    let baseIndex = 0;
    let diffIndex = 0;
    
    for (const diff of diffs) {
      switch (diff.operation) {
        case DiffOperation.EQUAL:
          for (let i = 0; i < diff.text.length; i++) {
            positionMap.set(diffIndex + i, baseIndex + i);
          }
          baseIndex += diff.text.length;
          diffIndex += diff.text.length;
          break;
        
        case DiffOperation.INSERT:
          diffIndex += diff.text.length;
          break;
        
        case DiffOperation.DELETE:
          for (let i = 0; i < diff.text.length; i++) {
            positionMap.set(diffIndex, baseIndex + i);
          }
          baseIndex += diff.text.length;
          break;
      }
    }
    
    return positionMap;
  }
  
  /**
   * チャンクの開始位置を見つける
   * @param baseText 基本テキスト
   * @param chunk 差分チャンク
   * @param startPos 探索開始位置
   * @returns 開始位置
   */
  private findChunkStartPosition(baseText: string, chunk: DiffChange[], startPos: number): number {
    for (const diff of chunk) {
      if (diff.operation === DiffOperation.EQUAL || diff.operation === DiffOperation.DELETE) {
        // 最初のEQUALまたはDELETEを見つける
        const index = baseText.indexOf(diff.text, startPos);
        if (index !== -1) {
          return index;
        }
      }
    }
    return startPos; // 見つからない場合は開始位置を返す
  }
  
  /**
   * チャンクの終了位置を見つける
   * @param baseText 基本テキスト
   * @param chunk 差分チャンク
   * @param startPos 探索開始位置
   * @returns 終了位置
   */
  private findChunkEndPosition(baseText: string, chunk: DiffChange[], startPos: number): number {
    let position = startPos;
    
    for (const diff of chunk) {
      if (diff.operation === DiffOperation.EQUAL || diff.operation === DiffOperation.DELETE) {
        const index = baseText.indexOf(diff.text, position);
        if (index !== -1) {
          position = index + diff.text.length;
        }
      }
    }
    
    return position;
  }
  
  /**
   * 対応するチャンクを見つける
   * @param baseText 基本テキスト
   * @param chunks チャンク配列
   * @param startPos 開始位置
   * @param endPos 終了位置
   * @returns 対応するチャンク
   */
  private findCorrespondingChunk(
    baseText: string,
    chunks: DiffChange[][],
    startPos: number,
    endPos: number
  ): DiffChange[] | null {
    // オーバーラップするチャンクを探す
    for (const chunk of chunks) {
      const chunkStartPos = this.findChunkStartPosition(baseText, chunk, 0);
      const chunkEndPos = this.findChunkEndPosition(baseText, chunk, chunkStartPos);
      
      // 範囲がオーバーラップするかチェック
      if ((chunkStartPos <= startPos && chunkEndPos >= startPos) ||
          (chunkStartPos <= endPos && chunkEndPos >= endPos) ||
          (startPos <= chunkStartPos && endPos >= chunkEndPos)) {
        return chunk;
      }
    }
    
    return null;
  }
  
  /**
   * テキストチャンクをマージ
   * @param baseText 基本テキスト
   * @param mineText 自分のテキスト
   * @param theirText 相手のテキスト
   * @param context 小説コンテキスト
   * @param priority マージ優先度
   * @returns マージ結果
   */
  private mergeTextChunk(
    baseText: string,
    mineText: string,
    theirText: string,
    context?: NovelContext,
    priority: MergePriority = MergePriority.SMART
  ): {
    text: string;
    conflict: boolean;
    autoResolved: boolean;
    resolutionType?: string;
  } {
    // 既に一致している場合
    if (mineText === theirText) {
      return {
        text: mineText,
        conflict: false,
        autoResolved: true
      };
    }
    
    // 基本テキストと同じ場合
    if (mineText === baseText) {
      return {
        text: theirText,
        conflict: false,
        autoResolved: true,
        resolutionType: 'TOOK_THEIRS'
      };
    }
    
    if (theirText === baseText) {
      return {
        text: mineText,
        conflict: false,
        autoResolved: true,
        resolutionType: 'TOOK_MINE'
      };
    }
    
    // 優先度に基づいてマージ戦略を選択
    switch (priority) {
      case MergePriority.MINE:
        return {
          text: mineText,
          conflict: true,
          autoResolved: true,
          resolutionType: 'PRIORITY_MINE'
        };
      
      case MergePriority.THEIRS:
        return {
          text: theirText,
          conflict: true,
          autoResolved: true,
          resolutionType: 'PRIORITY_THEIRS'
        };
      
      case MergePriority.BOTH:
        // 両方を組み合わせる
        const combinedText = this.smartCombineTexts(baseText, mineText, theirText);
        return {
          text: combinedText,
          conflict: true,
          autoResolved: true,
          resolutionType: 'COMBINED_BOTH'
        };
      
      case MergePriority.SMART:
      default:
        // 意味論的なマージを試みる
        return this.attemptSemanticMerge(baseText, mineText, theirText, context);
    }
  }
  
  /**
   * 意味論的なマージを試みる
   * @param baseText 基本テキスト
   * @param mineText 自分のテキスト
   * @param theirText 相手のテキスト
   * @param context 小説コンテキスト
   * @returns マージ結果
   */
  private attemptSemanticMerge(
    baseText: string,
    mineText: string,
    theirText: string,
    context?: NovelContext
  ): {
    text: string;
    conflict: boolean;
    autoResolved: boolean;
    resolutionType?: string;
  } {
    // 小説コンテキストがあれば、それを使用して意味論的なマージを行う
    if (context) {
      // キャラクター関連のコンテキストをチェック
      if (context.characters) {
        // キャラクター名に基づいて判断
        const myCharacterFocus = this.getCharacterFocus(mineText, context.characters.names);
        const theirCharacterFocus = this.getCharacterFocus(theirText, context.characters.names);
        
        // 異なるキャラクターにフォーカスしていて、かつフォーカスキャラクターが設定されている場合
        if (myCharacterFocus && theirCharacterFocus && myCharacterFocus !== theirCharacterFocus) {
          if (context.characters.focusCharacter === myCharacterFocus) {
            return {
              text: mineText,
              conflict: true,
              autoResolved: true,
              resolutionType: 'CHARACTER_FOCUS_MINE'
            };
          } else if (context.characters.focusCharacter === theirCharacterFocus) {
            return {
              text: theirText,
              conflict: true,
              autoResolved: true,
              resolutionType: 'CHARACTER_FOCUS_THEIRS'
            };
          }
        }
      }
      
      // プロット関連のコンテキストをチェック
      if (context.plot) {
        // 重要なプロットイベントが含まれているかチェック
        const myPlotEventCount = this.countKeyEvents(mineText, context.plot.keyEvents || []);
        const theirPlotEventCount = this.countKeyEvents(theirText, context.plot.keyEvents || []);
        
        if (myPlotEventCount > theirPlotEventCount) {
          return {
            text: mineText,
            conflict: true,
            autoResolved: true,
            resolutionType: 'PLOT_EVENTS_MINE'
          };
        } else if (theirPlotEventCount > myPlotEventCount) {
          return {
            text: theirText,
            conflict: true,
            autoResolved: true,
            resolutionType: 'PLOT_EVENTS_THEIRS'
          };
        }
        
        // 伏線要素が含まれているかチェック
        const myForeshadowCount = this.countKeyEvents(mineText, context.plot.foreshadowing || []);
        const theirForeshadowCount = this.countKeyEvents(theirText, context.plot.foreshadowing || []);
        
        if (myForeshadowCount > theirForeshadowCount) {
          return {
            text: mineText,
            conflict: true,
            autoResolved: true,
            resolutionType: 'FORESHADOWING_MINE'
          };
        } else if (theirForeshadowCount > myForeshadowCount) {
          return {
            text: theirText,
            conflict: true,
            autoResolved: true,
            resolutionType: 'FORESHADOWING_THEIRS'
          };
        }
      }
    }
    
    // シンプルな自動マージを試みる
    if (this.canAutomaticallyMerge(baseText, mineText, theirText)) {
      return {
        text: this.smartMergeLine(baseText, mineText, theirText),
        conflict: true,
        autoResolved: true,
        resolutionType: 'AUTO_MERGED'
      };
    }
    
    // 文の構造的な分析でマージを決定
    const mineStructure = this.analyzeTextStructure(mineText);
    const theirStructure = this.analyzeTextStructure(theirText);
    
    // 文の数が多い方を優先
    if (mineStructure.sentenceCount > theirStructure.sentenceCount) {
      return {
        text: mineText,
        conflict: true,
        autoResolved: true,
        resolutionType: 'SENTENCE_COUNT_MINE'
      };
    } else if (theirStructure.sentenceCount > mineStructure.sentenceCount) {
      return {
        text: theirText,
        conflict: true,
        autoResolved: true,
        resolutionType: 'SENTENCE_COUNT_THEIRS'
      };
    }
    
    // 詳細さ（単語数）が多い方を優先
    if (mineStructure.wordCount > theirStructure.wordCount * 1.2) {
      return {
        text: mineText,
        conflict: true,
        autoResolved: true,
        resolutionType: 'DETAIL_MINE'
      };
    } else if (theirStructure.wordCount > mineStructure.wordCount * 1.2) {
      return {
        text: theirText,
        conflict: true,
        autoResolved: true,
        resolutionType: 'DETAIL_THEIRS'
      };
    }
    
    // 自動的に決定できない場合は手動解決が必要
    return {
      text: this.createConflictMarkersForChunk(mineText, theirText),
      conflict: true,
      autoResolved: false,
      resolutionType: 'MANUAL_REQUIRED'
    };
  }
  
  /**
   * テキストのキャラクターフォーカスを取得
   * @param text テキスト
   * @param characterNames キャラクター名リスト
   * @returns フォーカスされているキャラクター名
   */
  private getCharacterFocus(text: string, characterNames: string[]): string | null {
    const counts = new Map<string, number>();
    let maxCount = 0;
    let focusCharacter: string | null = null;
    
    for (const name of characterNames) {
      // キャラクター名の出現回数をカウント
      const regex = new RegExp(`\\b${name}\\b`, 'gi');
      const matches = text.match(regex);
      const count = matches ? matches.length : 0;
      
      counts.set(name, count);
      
      // 最大カウントを更新
      if (count > maxCount) {
        maxCount = count;
        focusCharacter = name;
      }
    }
    
    // 有意な差があるかチェック
    if (focusCharacter && maxCount >= 3) {
      let secondMaxCount = 0;
      
      for (const [name, count] of counts.entries()) {
        if (name !== focusCharacter && count > secondMaxCount) {
          secondMaxCount = count;
        }
      }
      
      // 最大カウントが2番目より十分大きい場合のみフォーカスと判断
      if (maxCount > secondMaxCount * 1.5) {
        return focusCharacter;
      }
    }
    
    return null;
  }
  
  /**
   * キーイベントの出現回数をカウント
   * @param text テキスト
   * @param keyEvents キーイベントリスト
   * @returns カウント
   */
  private countKeyEvents(text: string, keyEvents: string[]): number {
    let count = 0;
    
    for (const event of keyEvents) {
      if (text.includes(event)) {
        count++;
      }
    }
    
    return count;
  }
  
  /**
   * テキストの構造を分析
   * @param text テキスト
   * @returns 構造分析結果
   */
  private analyzeTextStructure(text: string): {
    paragraphCount: number;
    sentenceCount: number;
    wordCount: number;
    avgSentenceLength: number;
  } {
    // パラグラフカウント
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim() !== '');
    const paragraphCount = paragraphs.length;
    
    // 文カウント
    const sentences = text.split(/[.!?][\s"')}]/).filter(s => s.trim() !== '');
    const sentenceCount = sentences.length;
    
    // 単語カウント
    const words = text.split(/\s+/).filter(w => w.trim() !== '');
    const wordCount = words.length;
    
    // 平均文長
    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    
    return {
      paragraphCount,
      sentenceCount,
      wordCount,
      avgSentenceLength
    };
  }
  
  /**
   * 自動マージが可能かチェック
   * @param base 基本テキスト
   * @param mine 自分のテキスト
   * @param theirs 相手のテキスト
   * @returns 自動マージ可能フラグ
   */
  private canAutomaticallyMerge(base: string, mine: string, theirs: string): boolean {
    // 一方が追加のみ、もう一方が削除のみのケースをチェック
    const mineHasAdditions = mine.length > base.length;
    const mineHasDeletions = mine.length < base.length;
    const theirHasAdditions = theirs.length > base.length;
    const theirHasDeletions = theirs.length < base.length;
    
    // 一方が追加のみでもう一方が削除のみなら自動マージを試みる
    if ((mineHasAdditions && !mineHasDeletions && theirHasDeletions && !theirHasAdditions) ||
        (mineHasDeletions && !mineHasAdditions && theirHasAdditions && !theirHasDeletions)) {
      return true;
    }
    
    // 両方とも同じ部分に変更を加えていないかチェック
    const mineDiffs = diffAlgorithm.computeDiff(base, mine);
    const theirDiffs = diffAlgorithm.computeDiff(base, theirs);
    
    // 変更の位置が重複しているかチェック
    const minePositions = this.getChangePositions(base, mineDiffs);
    const theirPositions = this.getChangePositions(base, theirDiffs);
    
    // 位置の重複がなければマージ可能
    return !this.hasOverlap(minePositions, theirPositions);
  }
  
  /**
   * 変更の位置を取得
   * @param base 基本テキスト
   * @param diffs 差分配列
   * @returns 位置配列
   */
  private getChangePositions(base: string, diffs: DiffChange[]): number[] {
    const positions: number[] = [];
    let baseIndex = 0;
    
    for (const diff of diffs) {
      switch (diff.operation) {
        case DiffOperation.EQUAL:
          baseIndex += diff.text.length;
          break;
        
        case DiffOperation.INSERT:
          positions.push(baseIndex);
          break;
        
        case DiffOperation.DELETE:
          for (let i = 0; i < diff.text.length; i++) {
            positions.push(baseIndex + i);
          }
          baseIndex += diff.text.length;
          break;
      }
    }
    
    return positions;
  }
  
  /**
   * 2つの配列に重複があるかチェック
   * @param arr1 配列1
   * @param arr2 配列2
   * @returns 重複フラグ
   */
  private hasOverlap(arr1: number[], arr2: number[]): boolean {
    const set = new Set(arr1);
    return arr2.some(pos => set.has(pos));
  }
  
  /**
   * スマートに行をマージ
   * @param base 基本テキスト
   * @param mine 自分のテキスト
   * @param theirs 相手のテキスト
   * @returns マージされたテキスト
   */
  private smartMergeLine(base: string, mine: string, theirs: string): string {
    // 一方が追加のみ、もう一方が削除のみのケースを処理
    const mineHasAdditions = mine.length > base.length;
    const mineHasDeletions = mine.length < base.length;
    const theirHasAdditions = theirs.length > base.length;
    const theirHasDeletions = theirs.length < base.length;
    
    if (mineHasAdditions && !mineHasDeletions && theirHasDeletions && !theirHasAdditions) {
      // 自分が追加、相手が削除した場合
      return mine; // 追加を優先
    }
    
    if (mineHasDeletions && !mineHasAdditions && theirHasAdditions && !theirHasDeletions) {
      // 自分が削除、相手が追加した場合
      return theirs; // 追加を優先
    }
    
    // それ以外のケースでは、差分を組み合わせる
    const mineDiffs = diffAlgorithm.computeDiff(base, mine);
    const theirDiffs = diffAlgorithm.computeDiff(base, theirs);
    
    // 基本テキストに自分の変更を適用
    let result = '';
    let baseIndex = 0;
    
    // まず自分の変更を適用
    for (const diff of mineDiffs) {
      switch (diff.operation) {
        case DiffOperation.EQUAL:
          result += diff.text;
          baseIndex += diff.text.length;
          break;
        
        case DiffOperation.INSERT:
          result += diff.text;
          break;
        
        case DiffOperation.DELETE:
          baseIndex += diff.text.length;
          break;
      }
    }
    
    // 次に相手の変更を適用（重複しないもののみ）
    const minePositions = this.getChangePositions(base, mineDiffs);
    const minePositionSet = new Set(minePositions);
    
    baseIndex = 0;
    let resultIndex = 0;
    let resultArray = result.split('');
    
    for (const diff of theirDiffs) {
      switch (diff.operation) {
        case DiffOperation.EQUAL:
          baseIndex += diff.text.length;
          resultIndex += diff.text.length;
          break;
        
        case DiffOperation.INSERT:
          // 自分の変更と重複しないか確認
          if (!minePositionSet.has(baseIndex)) {
            // 挿入位置に相手の変更を適用
            resultArray.splice(resultIndex, 0, diff.text);
            resultIndex += diff.text.length;
          }
          break;
        
        case DiffOperation.DELETE:
          // 自分の変更と重複しないか確認
          let shouldDelete = true;
          for (let i = 0; i < diff.text.length; i++) {
            if (minePositionSet.has(baseIndex + i)) {
              shouldDelete = false;
              break;
            }
          }
          
          if (shouldDelete) {
            // 削除位置から相手の変更を適用
            resultArray.splice(resultIndex, diff.text.length);
          } else {
            resultIndex += diff.text.length;
          }
          
          baseIndex += diff.text.length;
          break;
      }
    }
    
    return resultArray.join('');
  }
  
  /**
   * テキストを智能的に組み合わせる
   * @param base 基本テキスト
   * @param mine 自分のテキスト
   * @param theirs 相手のテキスト
   * @returns 組み合わせたテキスト
   */
  private smartCombineTexts(base: string, mine: string, theirs: string): string {
    // 文に分割
    const baseSentences = this.splitIntoSentences(base);
    const mineSentences = this.splitIntoSentences(mine);
    const theirSentences = this.splitIntoSentences(theirs);
    
    // どの文が追加/変更/削除されたかを判定
    const mineAdded = mineSentences.filter(s => !baseSentences.includes(s));
    const theirAdded = theirSentences.filter(s => !baseSentences.includes(s));
    
    // 変更・削除の判定は複雑なのでスキップし、単純に追加文を結合
    const combined = [...new Set([...mineSentences, ...theirAdded])];
    
    // 新しい順序を決める
    // 基本的には元の順序を尊重しつつ、新規追加分を適切な位置に挿入
    
    // 簡易的なアプローチ: 元のテキストに新規分を追加
    return combined.join(' ');
  }
  
  /**
   * テキストを文に分割
   * @param text テキスト
   * @returns 文の配列
   */
  private splitIntoSentences(text: string): string[] {
    // 文の区切りを検出する正規表現
    const sentenceBreakRegex = /[.!?][\s"')}]/g;
    
    // 文に分割
    const rawSentences = text.split(sentenceBreakRegex);
    
    // 空の文や不完全な文を除外
    return rawSentences
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }
  
  /**
   * コンフリクトマーカーを作成
   * @param base 基本テキスト
   * @param mine 自分のテキスト
   * @param theirs 相手のテキスト
   * @returns コンフリクトマーカー付きテキスト
   */
  private createConflictMarkers(base: string, mine: string, theirs: string): string {
    return `<<<<<<< MINE\n${mine}\n=======\n${theirs}\n>>>>>>> THEIRS`;
  }
  
  /**
   * チャンク用のコンフリクトマーカーを作成
   * @param mine 自分のテキスト
   * @param theirs 相手のテキスト
   * @returns コンフリクトマーカー付きテキスト
   */
  private createConflictMarkersForChunk(mine: string, theirs: string): string {
    return `<<<<<<< MINE\n${mine}\n=======\n${theirs}\n>>>>>>> THEIRS`;
  }
}

// デフォルトインスタンスをエクスポート
export const semanticMerger = new SemanticMerger();