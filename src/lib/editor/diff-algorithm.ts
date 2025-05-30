// src/lib/editor/diff-algorithm.ts
import { logError } from '../utils/error-handler';

/**
 * 差分操作の種類
 */
export enum DiffOperation {
  /** テキスト追加 */
  INSERT = 'INSERT',
  
  /** テキスト削除 */
  DELETE = 'DELETE',
  
  /** テキスト保持（変更なし） */
  EQUAL = 'EQUAL'
}

/**
 * 差分操作
 */
export interface DiffChange {
  /** 操作タイプ */
  operation: DiffOperation;
  
  /** テキスト */
  text: string;
}

/**
 * テキスト位置情報付き差分
 */
export interface PositionedDiff extends DiffChange {
  /** 元テキストでの開始位置 */
  startPosition: number;
  
  /** 元テキストでの終了位置 */
  endPosition: number;
}

/**
 * 文字レベルの差分を検出する差分アルゴリズム
 * Google diff-match-patchアルゴリズムの概念を利用
 */
export class DiffAlgorithm {
  
  /**
   * 2つのテキスト間の差分を計算
   * @param oldText 元のテキスト
   * @param newText 新しいテキスト
   * @returns 差分操作の配列
   */
  computeDiff(oldText: string, newText: string): DiffChange[] {
    try {
      if (oldText === newText) {
        return [{
          operation: DiffOperation.EQUAL,
          text: oldText
        }];
      }
      
      const changes = this.computeCharacterDiff(oldText, newText);
      return this.cleanupDiff(changes);
    } catch (error) {
      logError(error, 
        { oldTextLength: oldText.length, newTextLength: newText.length }, 
        'Error computing diff'
      );
      
      // エラー時は単純な差分を返す
      return [
        { operation: DiffOperation.DELETE, text: oldText },
        { operation: DiffOperation.INSERT, text: newText }
      ];
    }
  }
  
  /**
   * 位置情報付きの差分を計算
   * @param oldText 元のテキスト
   * @param newText 新しいテキスト
   * @returns 位置情報付きの差分操作の配列
   */
  computePositionedDiff(oldText: string, newText: string): PositionedDiff[] {
    const changes = this.computeDiff(oldText, newText);
    const positionedChanges: PositionedDiff[] = [];
    
    let oldPosition = 0;
    
    for (const change of changes) {
      const startPosition = oldPosition;
      
      if (change.operation === DiffOperation.DELETE || change.operation === DiffOperation.EQUAL) {
        oldPosition += change.text.length;
      }
      
      positionedChanges.push({
        ...change,
        startPosition,
        endPosition: oldPosition
      });
    }
    
    return positionedChanges;
  }
  
  /**
   * 文字単位の差分を計算（Myers差分アルゴリズムベース）
   * @param oldText 元のテキスト
   * @param newText 新しいテキスト
   * @returns 差分操作の配列
   */
  private computeCharacterDiff(oldText: string, newText: string): DiffChange[] {
    // テキストが同一の場合は早期リターン
    if (oldText === newText) {
      return [{ operation: DiffOperation.EQUAL, text: oldText }];
    }
    
    // テキストが完全に異なる場合も早期リターン
    if (!this.hasCommonSubstring(oldText, newText, 3)) {
      return [
        { operation: DiffOperation.DELETE, text: oldText },
        { operation: DiffOperation.INSERT, text: newText }
      ];
    }
    
    // 共通の接頭辞と接尾辞を見つける
    const commonPrefix = this.findCommonPrefix(oldText, newText);
    const commonSuffix = this.findCommonSuffix(oldText.substring(commonPrefix), newText.substring(commonPrefix));
    
    const changes: DiffChange[] = [];
    
    // 共通の接頭辞があれば追加
    if (commonPrefix > 0) {
      changes.push({
        operation: DiffOperation.EQUAL,
        text: oldText.substring(0, commonPrefix)
      });
    }
    
    // 中間部分の差分を計算
    const oldMiddle = oldText.substring(commonPrefix, oldText.length - commonSuffix);
    const newMiddle = newText.substring(commonPrefix, newText.length - commonSuffix);
    
    // 再帰的にミドル部分の差分を計算
    if (oldMiddle.length > 0 || newMiddle.length > 0) {
      // 中間部分がそれぞれ空でなければ差分を計算
      if (oldMiddle.length > 0 && newMiddle.length > 0) {
        const middleDiff = this.computeMiddleDiff(oldMiddle, newMiddle);
        changes.push(...middleDiff);
      } else if (oldMiddle.length > 0) {
        // 古いテキストだけに中間部分がある場合は削除
        changes.push({
          operation: DiffOperation.DELETE,
          text: oldMiddle
        });
      } else {
        // 新しいテキストだけに中間部分がある場合は追加
        changes.push({
          operation: DiffOperation.INSERT,
          text: newMiddle
        });
      }
    }
    
    // 共通の接尾辞があれば追加
    if (commonSuffix > 0) {
      changes.push({
        operation: DiffOperation.EQUAL,
        text: oldText.substring(oldText.length - commonSuffix)
      });
    }
    
    return changes;
  }
  
  /**
   * 中間部分の差分を計算
   * @param oldMiddle 元テキストの中間部分
   * @param newMiddle 新テキストの中間部分
   * @returns 差分操作の配列
   */
  private computeMiddleDiff(oldMiddle: string, newMiddle: string): DiffChange[] {
    // 小さなテキストの場合は文字単位の差分計算
    if (oldMiddle.length <= 20 || newMiddle.length <= 20) {
      return this.computeCharByCharDiff(oldMiddle, newMiddle);
    }
    
    // より大きなテキストの場合は分割して計算
    const split = this.findSplitPoint(oldMiddle, newMiddle);
    
    if (split) {
      // 分割ポイントが見つかった場合は再帰的に計算
      const oldLeft = oldMiddle.substring(0, split.oldPos);
      const oldRight = oldMiddle.substring(split.oldPos);
      const newLeft = newMiddle.substring(0, split.newPos);
      const newRight = newMiddle.substring(split.newPos);
      
      // 左側の差分を計算
      const leftChanges = this.computeCharacterDiff(oldLeft, newLeft);
      
      // 右側の差分を計算
      const rightChanges = this.computeCharacterDiff(oldRight, newRight);
      
      // 結果を結合
      return [...leftChanges, ...rightChanges];
    }
    
    // 分割ポイントが見つからない場合は文字単位の差分計算
    return this.computeCharByCharDiff(oldMiddle, newMiddle);
  }
  
  /**
   * 文字単位の差分を計算
   * @param oldText 元のテキスト
   * @param newText 新しいテキスト
   * @returns 差分操作の配列
   */
  private computeCharByCharDiff(oldText: string, newText: string): DiffChange[] {
    // ダイナミックプログラミングによる最小編集距離の計算
    const oldLength = oldText.length;
    const newLength = newText.length;
    
    const matrix: number[][] = new Array(oldLength + 1);
    for (let i = 0; i <= oldLength; i++) {
      matrix[i] = new Array(newLength + 1);
      matrix[i][0] = i;
    }
    
    for (let j = 0; j <= newLength; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= oldLength; i++) {
      for (let j = 1; j <= newLength; j++) {
        if (oldText[i - 1] === newText[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,    // 削除
            matrix[i][j - 1] + 1,    // 挿入
            matrix[i - 1][j - 1] + 1 // 置換
          );
        }
      }
    }
    
    // 編集操作の再構築
    const changes: DiffChange[] = [];
    let i = oldLength;
    let j = newLength;
    
    let currentEqual = '';
    let currentDelete = '';
    let currentInsert = '';
    
    // 編集操作を逆順に追跡
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && oldText[i - 1] === newText[j - 1]) {
        // 文字が一致する場合
        currentEqual = oldText[i - 1] + currentEqual;
        i--;
        j--;
      } else {
        // 現在の等価テキストがあれば追加
        if (currentEqual.length > 0) {
          changes.unshift({
            operation: DiffOperation.EQUAL,
            text: currentEqual
          });
          currentEqual = '';
        }
        
        if (j > 0 && (i === 0 || matrix[i][j - 1] <= matrix[i - 1][j])) {
          // 挿入操作
          currentInsert = newText[j - 1] + currentInsert;
          j--;
        } else if (i > 0) {
          // 削除操作
          currentDelete = oldText[i - 1] + currentDelete;
          i--;
        }
      }
      
      // 操作が変わるときに現在の変更を追加
      if ((i === 0 && j === 0) || (i > 0 && j > 0 && oldText[i - 1] === newText[j - 1] && (currentDelete.length > 0 || currentInsert.length > 0))) {
        if (currentDelete.length > 0) {
          changes.unshift({
            operation: DiffOperation.DELETE,
            text: currentDelete
          });
          currentDelete = '';
        }
        
        if (currentInsert.length > 0) {
          changes.unshift({
            operation: DiffOperation.INSERT,
            text: currentInsert
          });
          currentInsert = '';
        }
      }
    }
    
    // 残りの等価テキストがあれば追加
    if (currentEqual.length > 0) {
      changes.unshift({
        operation: DiffOperation.EQUAL,
        text: currentEqual
      });
    }
    
    // 残りの削除操作があれば追加
    if (currentDelete.length > 0) {
      changes.unshift({
        operation: DiffOperation.DELETE,
        text: currentDelete
      });
    }
    
    // 残りの挿入操作があれば追加
    if (currentInsert.length > 0) {
      changes.unshift({
        operation: DiffOperation.INSERT,
        text: currentInsert
      });
    }
    
    return changes;
  }
  
  /**
   * 差分操作の配列をクリーンアップ（最適化）
   * @param changes 差分操作の配列
   * @returns 最適化された差分操作の配列
   */
  private cleanupDiff(changes: DiffChange[]): DiffChange[] {
    if (changes.length <= 1) {
      return changes;
    }
    
    const result: DiffChange[] = [];
    let lastOp: DiffOperation | null = null;
    let lastText = '';
    
    for (const change of changes) {
      if (change.text.length === 0) {
        continue; // 空の変更をスキップ
      }
      
      if (change.operation === lastOp) {
        // 同じ操作タイプなら結合
        lastText += change.text;
      } else {
        // 前回の操作を結果に追加
        if (lastOp !== null) {
          result.push({
            operation: lastOp,
            text: lastText
          });
        }
        
        // 新しい操作を開始
        lastOp = change.operation;
        lastText = change.text;
      }
    }
    
    // 最後の操作を追加
    if (lastOp !== null) {
      result.push({
        operation: lastOp,
        text: lastText
      });
    }
    
    return result;
  }
  
  /**
   * 2つのテキストの間に共通の部分文字列があるか確認
   * @param text1 テキスト1
   * @param text2 テキスト2
   * @param minLength 最小共通長
   * @returns 共通部分があるか
   */
  private hasCommonSubstring(text1: string, text2: string, minLength: number): boolean {
    // 短い方のテキストを選択
    const short = text1.length < text2.length ? text1 : text2;
    const long = text1.length < text2.length ? text2 : text1;
    
    // 短い方のテキストを部分文字列として検索
    for (let i = 0; i <= short.length - minLength; i++) {
      const substring = short.substring(i, i + minLength);
      if (long.includes(substring)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * 共通の接頭辞の長さを見つける
   * @param text1 テキスト1
   * @param text2 テキスト2
   * @returns 共通接頭辞の長さ
   */
  private findCommonPrefix(text1: string, text2: string): number {
    const minLength = Math.min(text1.length, text2.length);
    for (let i = 0; i < minLength; i++) {
      if (text1[i] !== text2[i]) {
        return i;
      }
    }
    return minLength;
  }
  
  /**
   * 共通の接尾辞の長さを見つける
   * @param text1 テキスト1
   * @param text2 テキスト2
   * @returns 共通接尾辞の長さ
   */
  private findCommonSuffix(text1: string, text2: string): number {
    const minLength = Math.min(text1.length, text2.length);
    for (let i = 0; i < minLength; i++) {
      if (text1[text1.length - i - 1] !== text2[text2.length - i - 1]) {
        return i;
      }
    }
    return minLength;
  }
  
  /**
   * 分割ポイントを見つける
   * 長いテキストを効率的に処理するための最適な分割点を探す
   * @param oldText 元のテキスト
   * @param newText 新しいテキスト
   * @returns 分割ポイント情報
   */
  private findSplitPoint(oldText: string, newText: string): { oldPos: number, newPos: number } | null {
    // 最も長い共通部分文字列を探す
    const minLength = Math.min(oldText.length, newText.length);
    const maxWordLength = Math.min(40, Math.floor(minLength / 2));
    
    for (let length = maxWordLength; length >= 3; length--) {
      // テキスト半分付近から探す
      const oldMid = Math.floor(oldText.length / 2);
      const newMid = Math.floor(newText.length / 2);
      
      const oldSubstr = oldText.substring(oldMid - length, oldMid + length);
      
      // 新テキストでの位置を探す
      const pos = newText.indexOf(oldSubstr);
      if (pos >= 0) {
        return {
          oldPos: oldMid,
          newPos: pos + oldSubstr.length / 2
        };
      }
    }
    
    return null;
  }
  
  /**
   * 行分割された差分を取得
   * @param oldText 元のテキスト
   * @param newText 新しいテキスト
   * @returns 行単位の差分
   */
  getLineDiff(oldText: string, newText: string): {
    added: number[];
    deleted: number[];
    modified: number[];
  } {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    
    const added: number[] = [];
    const deleted: number[] = [];
    const modified: number[] = [];
    
    // 行単位の差分を計算（LCS アルゴリズム）
    const lcs = this.computeLCS(oldLines, newLines);
    
    let oldIdx = 0;
    let newIdx = 0;
    
    for (const line of lcs) {
      // 元テキストで一致するまでの行は削除された行
      while (oldIdx < oldLines.length && oldLines[oldIdx] !== line) {
        deleted.push(oldIdx);
        oldIdx++;
      }
      
      // 新テキストで一致するまでの行は追加された行
      while (newIdx < newLines.length && newLines[newIdx] !== line) {
        added.push(newIdx);
        newIdx++;
      }
      
      // 一致した行をスキップ
      oldIdx++;
      newIdx++;
    }
    
    // 残りの行を処理
    while (oldIdx < oldLines.length) {
      deleted.push(oldIdx);
      oldIdx++;
    }
    
    while (newIdx < newLines.length) {
      added.push(newIdx);
      newIdx++;
    }
    
    // 変更された行を特定（追加と削除が同じインデックスにある場合）
    for (let i = 0; i < Math.min(added.length, deleted.length); i++) {
      if (added[i] === deleted[i]) {
        modified.push(added[i]);
        // 修正された行は追加・削除リストから削除
        added.splice(i, 1);
        deleted.splice(i, 1);
        i--;
      }
    }
    
    return { added, deleted, modified };
  }
  
  /**
   * 最長共通部分列（LCS）を計算
   * @param sequences1 シーケンス1
   * @param sequences2 シーケンス2
   * @returns 最長共通部分列
   */
  private computeLCS(sequences1: string[], sequences2: string[]): string[] {
    const m = sequences1.length;
    const n = sequences2.length;
    
    // LCSの長さを計算するためのテーブル
    const lengths: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
    
    // LCSの長さを埋める
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (sequences1[i] === sequences2[j]) {
          lengths[i + 1][j + 1] = lengths[i][j] + 1;
        } else {
          lengths[i + 1][j + 1] = Math.max(lengths[i + 1][j], lengths[i][j + 1]);
        }
      }
    }
    
    // LCSを抽出
    const result: string[] = [];
    let i = m, j = n;
    
    while (i > 0 && j > 0) {
      if (sequences1[i - 1] === sequences2[j - 1]) {
        result.unshift(sequences1[i - 1]);
        i--;
        j--;
      } else if (lengths[i - 1][j] >= lengths[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    
    return result;
  }
}

// デフォルトインスタンスをエクスポート
export const diffAlgorithm = new DiffAlgorithm();