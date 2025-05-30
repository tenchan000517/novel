// src/lib/editor/conflict-resolver.ts
import { Conflict, Document, EditorSession, Resolution, ResolutionStrategy } from './collaborative-editor';
import { logWarn, logError } from '@/lib/utils/error-handler';

/**
 * コンフリクト解決クラス
 * 編集操作間のコンフリクトを検出し、解決策を提供
 */
export class ConflictResolver {
  /**
   * コンフリクトをチェック
   * @param baseDocument 基本ドキュメント
   * @param editedDocument 編集後ドキュメント
   * @param otherSessions 他のセッション
   * @returns コンフリクトの配列
   */
  async checkConflicts(
    baseDocument: Document,
    editedDocument: Document,
    otherSessions: EditorSession[]
  ): Promise<Conflict[]> {
    console.log(`Checking conflicts between base document v${baseDocument.version} and edited document`);
    
    const conflicts: Conflict[] = [];
    
    for (const session of otherSessions) {
      const sessionDocument = session.document;
      
      console.log(`Comparing with document from session ${session.id} (version: ${sessionDocument.version})`);
      
      // 同じバージョンのドキュメントを編集している場合のみコンフリクトチェック
      if (sessionDocument.version === baseDocument.version) {
        const sessionConflicts = await this.detectConflicts(
          baseDocument,
          editedDocument,
          sessionDocument
        );
        
        conflicts.push(...sessionConflicts);
      }
    }
    
    return conflicts;
  }
  
  /**
   * ドキュメント間のコンフリクトを検出
   * @param base 基本ドキュメント
   * @param edited 編集後ドキュメント
   * @param other 他のドキュメント
   * @returns コンフリクトの配列
   */
  private async detectConflicts(
    base: Document,
    edited: Document,
    other: Document
  ): Promise<Conflict[]> {
    // テキストを行に分割
    const baseLines = base.content.split('\n');
    const editedLines = edited.content.split('\n');
    const otherLines = other.content.split('\n');
    
    const conflicts: Conflict[] = [];
    
    // 各行を比較してコンフリクトを検出
    for (let i = 0; i < Math.max(baseLines.length, editedLines.length, otherLines.length); i++) {
      const baseLine = i < baseLines.length ? baseLines[i] : '';
      const editedLine = i < editedLines.length ? editedLines[i] : '';
      const otherLine = i < otherLines.length ? otherLines[i] : '';
      
      // 基本と編集後、基本と他方が異なる場合にコンフリクト
      if (baseLine !== editedLine && baseLine !== otherLine) {
        // かつ、編集後と他方が異なる場合
        if (editedLine !== otherLine) {
          conflicts.push({
            lineNumber: i,
            baseContent: baseLine,
            editedContent: editedLine,
            otherContent: otherLine,
            type: 'CONTENT_CONFLICT',
          });
        }
      }
    }
    
    // 追加の検出ロジック: 順序コンフリクト（行の移動や入れ替え）
    this.detectOrderConflicts(baseLines, editedLines, otherLines, conflicts);
    
    return conflicts;
  }
  
  /**
   * 順序コンフリクトを検出
   * @param baseLines 基本行
   * @param editedLines 編集行
   * @param otherLines 他方行
   * @param conflicts コンフリクト配列（結果を追加）
   */
  private detectOrderConflicts(
    baseLines: string[],
    editedLines: string[],
    otherLines: string[],
    conflicts: Conflict[]
  ): void {
    // 行の移動や順序変更を検出するロジック
    // 例: 同じ行が異なる位置に移動された場合
    
    // 既存の行内容と行番号のマッピングを作成
    const baseLineMap = new Map<string, number[]>();
    
    for (let i = 0; i < baseLines.length; i++) {
      const line = baseLines[i];
      if (line.trim() === '') continue; // 空行は無視
      
      const positions = baseLineMap.get(line) || [];
      positions.push(i);
      baseLineMap.set(line, positions);
    }
    
    // 両方の編集で同じ行が異なる場所に移動されていないかチェック
    for (const [line, basePositions] of baseLineMap.entries()) {
      if (line.trim() === '' || basePositions.length > 1) continue; // 空行や重複行は無視
      
      const basePos = basePositions[0];
      const editedPositions = editedLines.map((l, idx) => l === line ? idx : -1).filter(idx => idx !== -1);
      const otherPositions = otherLines.map((l, idx) => l === line ? idx : -1).filter(idx => idx !== -1);
      
      // 両方で移動されていて、かつ異なる位置に移動された場合
      if (editedPositions.length === 1 && otherPositions.length === 1) {
        const editedPos = editedPositions[0];
        const otherPos = otherPositions[0];
        
        if (basePos !== editedPos && basePos !== otherPos && editedPos !== otherPos) {
          // 既に同じ行のコンテンツコンフリクトが登録されていないかチェック
          const existingConflict = conflicts.find(c => 
            c.lineNumber === editedPos || c.lineNumber === otherPos
          );
          
          if (!existingConflict) {
            conflicts.push({
              lineNumber: Math.min(editedPos, otherPos), // 最初に現れる位置を優先
              baseContent: line,
              editedContent: line, // 内容は同じ
              otherContent: line, // 内容は同じ
              type: 'ORDER_CONFLICT',
            });
          }
        }
      }
    }
  }
  
  /**
   * コンフリクトの解決案を提案
   * @param conflicts コンフリクトの配列
   * @returns 解決案
   */
  async suggestResolution(conflicts: Conflict[]): Promise<Resolution> {
    console.log(`Suggesting resolutions for ${conflicts.length} conflicts`);
    
    const strategies: ResolutionStrategy[] = [];
    
    // 各コンフリクトに対して解決戦略を決定
    for (let i = 0; i < conflicts.length; i++) {
      const conflict = conflicts[i];
      const strategy = await this.determineStrategy(conflict, i);
      strategies.push(strategy);
    }
    
    // 解決戦略に基づいてマージドキュメントを作成
    const mergedDocument = await this.applyStrategies(conflicts, strategies);
    
    return {
      conflicts,
      strategies,
      mergedDocument,
    };
  }
  
  /**
   * コンフリクトの解決戦略を決定
   * @param conflict コンフリクト
   * @param index コンフリクトのインデックス
   * @returns 解決戦略
   */
  private async determineStrategy(
    conflict: Conflict,
    index: number
  ): Promise<ResolutionStrategy> {
    // コンフリクトタイプごとに異なる戦略
    switch (conflict.type) {
      case 'CONTENT_CONFLICT':
        return this.determineContentStrategy(conflict, index);
      case 'ORDER_CONFLICT':
        return {
          conflictIndex: index,
          type: 'MANUAL',
          suggestedContent: conflict.editedContent,
        };
      default:
        logWarn('Unknown conflict type detected', 
          new Error('Unknown conflict type'), 
          { conflictType: conflict.type, lineNumber: conflict.lineNumber }
        );
        return {
          conflictIndex: index,
          type: 'MANUAL',
        };
    }
  }
  
  /**
   * コンテンツコンフリクトの解決戦略を決定
   * @param conflict コンフリクト
   * @param index コンフリクトのインデックス
   * @returns 解決戦略
   */
  private determineContentStrategy(
    conflict: Conflict,
    index: number
  ): ResolutionStrategy {
    // 簡易的な解決策: 両方の変更をマージ
    if (conflict.editedContent && conflict.otherContent) {
      // 編集内容が他方の内容を含む場合は編集内容を採用
      if (conflict.editedContent.includes(conflict.otherContent)) {
        return {
          conflictIndex: index,
          type: 'TAKE_MINE',
          suggestedContent: conflict.editedContent,
        };
      }
      
      // 他方の内容が編集内容を含む場合は他方を採用
      if (conflict.otherContent.includes(conflict.editedContent)) {
        return {
          conflictIndex: index,
          type: 'TAKE_THEIRS',
          suggestedContent: conflict.otherContent,
        };
      }
      
      // そうでない場合はマージを試みる
      return {
        conflictIndex: index,
        type: 'MERGE',
        suggestedContent: this.mergeLine(conflict.baseContent, conflict.editedContent, conflict.otherContent),
      };
    }
    
    // 片方が空行の場合
    if (!conflict.editedContent) {
      return {
        conflictIndex: index,
        type: 'TAKE_THEIRS',
        suggestedContent: conflict.otherContent,
      };
    }
    
    if (!conflict.otherContent) {
      return {
        conflictIndex: index,
        type: 'TAKE_MINE',
        suggestedContent: conflict.editedContent,
      };
    }
    
    // デフォルトでは手動解決を提案
    return {
      conflictIndex: index,
      type: 'MANUAL',
      suggestedContent: `<<< MINE\n${conflict.editedContent}\n===\n${conflict.otherContent}\n>>> THEIRS`,
    };
  }
  
  /**
   * 行のマージを試みる
   * @param base 基本行
   * @param mine 自分の行
   * @param theirs 他方の行
   * @returns マージされた行
   */
  private mergeLine(base: string, mine: string, theirs: string): string {
    // 基本行が空の場合は両方を連結
    if (!base) {
      return `${mine}\n${theirs}`;
    }
    
    // ベースラインを基準に差分を抽出
    const baseWords = base.split(/\s+/);
    const mineWords = mine.split(/\s+/);
    const theirWords = theirs.split(/\s+/);
    
    // 差分の抽出 (簡易実装)
    const mineAdditions = mineWords.filter(word => !baseWords.includes(word));
    const theirAdditions = theirWords.filter(word => !baseWords.includes(word));
    
    // 重複を削除
    const allAdditions = [...new Set([...mineAdditions, ...theirAdditions])];
    
    // マージ
    if (allAdditions.length > 0) {
      const allAdditionsStr = allAdditions.join(' ');
      // 追加内容をベースに追加
      return `${base} ${allAdditionsStr}`;
    }
    
    // よりインテリジェントなマージ (実装例)
    // 文頭と文末の変更を特定して適用
    let merged = base;
    
    // 文頭の変更
    if (!mine.startsWith(base.substring(0, 10)) && !theirs.startsWith(base.substring(0, 10))) {
      // 両方が文頭を変更している場合
      if (mine.startsWith(theirs.substring(0, 10))) {
        // マインが相手の文頭を含む場合
        merged = mine;
      } else if (theirs.startsWith(mine.substring(0, 10))) {
        // 相手がマインの文頭を含む場合
        merged = theirs;
      } else {
        // どちらも異なる場合は両方を含める
        merged = `${mine} [merged with: ${theirs}]`;
      }
    } else if (!mine.startsWith(base.substring(0, 10))) {
      // マインだけが文頭を変更
      merged = mine;
    } else if (!theirs.startsWith(base.substring(0, 10))) {
      // 相手だけが文頭を変更
      merged = theirs;
    }
    
    return merged;
  }
  
  /**
   * 解決戦略に基づいてドキュメントをマージ
   * @param conflicts コンフリクトの配列
   * @param strategies 解決戦略の配列
   * @returns マージされたドキュメント
   */
  private async applyStrategies(
    conflicts: Conflict[],
    strategies: ResolutionStrategy[]
  ): Promise<Document> {
    if (conflicts.length === 0 || strategies.length === 0) {
      throw new Error('Cannot apply strategies: No conflicts or strategies provided');
    }
    
    try {
      // 基本ドキュメントをベースにマージを作成
      // 実際のドキュメントから何とか抽出する
      const firstConflict = conflicts[0];
      const documentContent = this.extractDocumentContent(conflicts);
      
      const document: Document = {
        id: `merged-${Date.now()}`,
        title: 'Merged Document',
        content: documentContent,
        version: 1,
        updatedAt: new Date(),
        metadata: {
          merged: true,
          conflicts: conflicts.length,
          strategies: strategies.map(s => s.type),
          mergedAt: new Date().toISOString()
        }
      };
      
      return document;
    } catch (error) {
      logError(error as Error, { conflictsCount: conflicts.length }, 'Error applying strategies');
      
      // エラー時はダミードキュメントを返す
      return {
        id: `error-merged-${Date.now()}`,
        title: 'Error in Merge',
        content: 'An error occurred while merging documents. Please try manual resolution.',
        version: 1,
        updatedAt: new Date(),
        metadata: {
          error: true,
          errorMessage: (error as Error).message,
          errorStack: (error as Error).stack
        }
      };
    }
  }
  
  /**
   * コンフリクトからドキュメントの内容を抽出
   * コンフリクトの情報から再構築する
   * @param conflicts コンフリクト配列
   * @returns ドキュメント内容
   */
  private extractDocumentContent(conflicts: Conflict[]): string {
    // コンフリクトの行番号とコンテンツからドキュメントを再構築する
    // マージ用の実装の簡略化のため
    // 実際の実装では元のドキュメントが必要
    
    // 最大行数を特定
    const maxLineNumber = Math.max(...conflicts.map(c => c.lineNumber)) + 1;
    
    // コンテンツの配列を初期化
    const contentLines: string[] = new Array(maxLineNumber).fill('');
    
    // 行ごとに内容を設定
    for (const conflict of conflicts) {
      contentLines[conflict.lineNumber] = conflict.editedContent || conflict.baseContent;
    }
    
    return contentLines.join('\n');
  }
}