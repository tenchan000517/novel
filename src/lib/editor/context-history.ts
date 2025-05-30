// src/lib/editor/context-history.ts
/**
 * コンテキスト履歴を管理するクラス
 */
export class ContextHistory {
    private history: any[] = [];
    private current: any = { tags: [] };
    private maxHistorySize = 10;
    
    /**
     * 現在のコンテキストを取得
     */
    getContext(): any {
      return this.current;
    }
    
    /**
     * コンテキストを更新
     */
    updateContext(context: any): void {
      // 現在のコンテキストを履歴に追加
      this.history.unshift(this.current);
      
      // 履歴サイズを制限
      if (this.history.length > this.maxHistorySize) {
        this.history.pop();
      }
      
      // 現在のコンテキストを更新
      this.current = {
        ...this.current,
        ...context,
        tags: [...this.current.tags, ...(context.tags || [])]
      };
    }
    
    /**
     * コンテキストをクリア
     */
    clearContext(): void {
      this.current = { tags: [] };
    }
    
    /**
     * 一つ前のコンテキストに戻る
     */
    revertToPrevious(): boolean {
      if (this.history.length === 0) {
        return false;
      }
      
      this.current = this.history.shift() || { tags: [] };
      return true;
    }
  }