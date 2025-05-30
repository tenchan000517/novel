import { Chapter } from '@/types/chapters';
import { Character } from '@/types/characters';
import { CharacterCorrection } from './character-correction';
import { PlotCorrection } from './plot-correction';
import { InconsistencyIssue, Correction, CorrectionResult, CorrectionType } from '@/types/correction';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { logError, getErrorMessage } from '@/lib/utils/error-handler';

/**
 * 自動修正システム
 * 物語の一貫性問題を検出し、自動的に修正するためのクラス
 */
export class AutoCorrectionSystem {
  private characterCorrection: CharacterCorrection;
  private plotCorrection: PlotCorrection;
  
  constructor() {
    this.characterCorrection = new CharacterCorrection();
    this.plotCorrection = new PlotCorrection();
    
    logger.info('自動修正システムを初期化しました');
  }
  
  /**
   * チャプターの不整合を検出し修正する
   */
  async correctChapter(chapter: Chapter): Promise<CorrectionResult> {
    try {
      logger.info(`チャプター ${chapter.metadata.number} の自動修正を開始します`);
      
      // 不整合の検出
      const issues = await this.detectInconsistencies(chapter);
      logger.info(`${issues.length}件の不整合を検出しました`);
      
      if (issues.length === 0) {
        return {
          originalChapter: chapter,
          correctedChapter: chapter,
          issues: [],
          appliedCorrections: [],
          rejectedCorrections: [],
        };
      }
      
      // 修正案の生成
      const corrections = await this.generateCorrections(issues);
      logger.info(`${corrections.length}件の修正案を生成しました`);
      
      // 修正の適用
      const correctedChapter = await this.applyCorrections(chapter, corrections);
      logger.info(`修正を適用しました`);
      
      // 修正履歴の保存
      await this.saveCorrectionHistory(chapter.metadata.id, corrections);
      
      return {
        originalChapter: chapter,
        correctedChapter,
        issues,
        appliedCorrections: corrections,
        rejectedCorrections: [],
      };
    } catch (error: unknown) {
        logError(error, {}, `チャプター修正中にエラーが発生しました: ${getErrorMessage(error)}`);
        throw error;
    }
  }
  
  /**
   * 不整合を検出する
   */
  private async detectInconsistencies(chapter: Chapter): Promise<InconsistencyIssue[]> {
    try {
      const issues: InconsistencyIssue[] = [];
      
      // キャラクター関連の問題検出
      const characterIssues = await this.characterCorrection.detect(chapter);
      issues.push(...characterIssues);
      
      // プロット関連の問題検出
      const plotIssues = await this.plotCorrection.detect(chapter);
      issues.push(...plotIssues);
      
      // 時系列の問題検出
      const timelineIssues = await this.detectTimelineIssues(chapter);
      issues.push(...timelineIssues);
      
      // 表現・語彙の問題検出
      const expressionIssues = await this.detectExpressionIssues(chapter);
      issues.push(...expressionIssues);
      
      // 深刻度によるソート
      return this.sortIssuesBySeverity(issues);
    } catch (error: unknown) {
        logError(error, {}, `不整合検出中にエラーが発生しました: ${getErrorMessage(error)}`);
        return [];
    }
  }
  
  /**
   * 修正案を生成する
   */
  private async generateCorrections(issues: InconsistencyIssue[]): Promise<Correction[]> {
    try {
      const corrections: Correction[] = [];
      
      for (const issue of issues) {
        let correction: Correction | null = null;
        
        // 問題タイプに応じた修正生成
        if (issue.type.startsWith('CHARACTER_')) {
          correction = await this.characterCorrection.generateCorrection(issue);
        } else if (issue.type.startsWith('PLOT_')) {
          correction = await this.plotCorrection.generateCorrection(issue);
        } else if (issue.type.startsWith('TIMELINE_')) {
          correction = await this.generateTimelineCorrection(issue);
        } else if (issue.type.startsWith('EXPRESSION_')) {
          correction = await this.generateExpressionCorrection(issue);
        }
        
        if (correction) {
          corrections.push(correction);
        }
      }
      
      return corrections;
    } catch (error: unknown) {
        logError(error, {}, `修正案生成中にエラーが発生しました: ${getErrorMessage(error)}`);
        return [];
    }
  }
  
  /**
   * 修正を適用する
   */
  private async applyCorrections(
    chapter: Chapter,
    corrections: Correction[]
  ): Promise<Chapter> {
    try {
      let correctedContent = chapter.content;
      
      // 修正を位置順に並べ替え（後方から適用して位置ずれを避ける）
      const sortedCorrections = this.sortCorrectionsByPosition(corrections);
      
      for (const correction of sortedCorrections) {
        correctedContent = await this.applyCorrection(correctedContent, correction);
      }
      
      // 修正履歴を更新
      const correctionHistory = [
        ...(chapter.metadata.correctionHistory || []),
        {
          timestamp: new Date(),
          corrections: corrections.map(c => ({
            type: c.type,
            description: c.description,
          })),
        },
      ];
      
      return {
        ...chapter,
        content: correctedContent,
        metadata: {
          ...chapter.metadata,
          correctionHistory,
          lastCorrected: new Date(),
        },
      };
    } catch (error: unknown) {
        logError(error, {}, `修正適用中にエラーが発生しました: ${getErrorMessage(error)}`);
        throw error;
    }
  }
  
  /**
   * 単一の修正を適用する
   */
  private async applyCorrection(content: string, correction: Correction): Promise<string> {
    try {
      switch (correction.type) {
        case 'REPLACE':
          return content.replace(correction.target, correction.replacement);
          
        case 'INSERT':
          return this.insertAtPosition(content, correction.position, correction.text);
          
        case 'DELETE':
          return this.deleteRange(content, correction.start, correction.end);
          
        default:
        //   logger.warn(`未知の修正タイプ: ${correction.type}`);
          return content;
      }
    } catch (error: unknown) {
      logger.error(`修正適用中にエラーが発生しました: ${correction.type}`);
      return content;
    }
  }
  
  /**
   * 指定位置にテキストを挿入する
   */
  private insertAtPosition(content: string, position: number, text: string): string {
    return content.substring(0, position) + text + content.substring(position);
  }
  
  /**
   * 指定範囲のテキストを削除する
   */
  private deleteRange(content: string, start: number, end: number): string {
    return content.substring(0, start) + content.substring(end);
  }
  
  /**
   * 時系列の問題を検出する
   */
  private async detectTimelineIssues(chapter: Chapter): Promise<InconsistencyIssue[]> {
    try {
      const issues: InconsistencyIssue[] = [];
      
      // TODO: 前のチャプターの時間設定と比較
      // TODO: 時間関連の表現の矛盾をチェック
      // TODO: 季節や日時の整合性をチェック
      
      return issues;
    } catch (error: unknown) {
      logger.error(`時系列問題検出中にエラーが発生しました`);
      return [];
    }
  }
  
  /**
   * 表現・語彙の問題を検出する
   */
  private async detectExpressionIssues(chapter: Chapter): Promise<InconsistencyIssue[]> {
    try {
      const issues: InconsistencyIssue[] = [];
      
      // TODO: 繰り返し表現のチェック
      // TODO: 指定された禁止表現のチェック
      // TODO: 文体の一貫性チェック
      
      return issues;
    } catch (error: unknown) {
      logger.error(`表現問題検出中にエラーが発生しました`);
      return [];
    }
  }
  
  /**
   * 時系列修正を生成する
   */
  private async generateTimelineCorrection(issue: InconsistencyIssue): Promise<Correction | null> {
    // 実装例
    if (issue.target && issue.position !== undefined) {
      return {
        type: 'REPLACE',
        target: issue.target,
        replacement: issue.suggestion || '【時間修正】',
        description: issue.description,
        severity: issue.severity,
      };
    }
    return null;
  }
  
  /**
   * 表現修正を生成する
   */
  private async generateExpressionCorrection(issue: InconsistencyIssue): Promise<Correction | null> {
    // 実装例
    if (issue.target && issue.position !== undefined) {
      return {
        type: 'REPLACE',
        target: issue.target,
        replacement: issue.suggestion || '【表現修正】',
        description: issue.description,
        severity: issue.severity,
      };
    }
    return null;
  }
  
  /**
   * 問題を深刻度でソートする
   */
  private sortIssuesBySeverity(issues: InconsistencyIssue[]): InconsistencyIssue[] {
    const severityOrder = {
      'CRITICAL': 0,
      'HIGH': 1,
      'MEDIUM': 2,
      'LOW': 3,
    };
    
    return [...issues].sort((a, b) => {
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }
  
  /**
   * 修正を位置でソートする
   */
  private sortCorrectionsByPosition(corrections: Correction[]): Correction[] {
    // 位置情報を持つ修正をソート（降順）
    return [...corrections].sort((a, b) => {
      const aPos = this.getCorrectionPosition(a);
      const bPos = this.getCorrectionPosition(b);
      
      // 降順（後ろから適用）
      return bPos - aPos;
    });
  }
  
  /**
   * 修正の位置を取得する
   */
  private getCorrectionPosition(correction: Correction): number {
    if ('position' in correction) {
      return correction.position;
    } else if ('start' in correction) {
      return correction.start;
    } else if ('target' in correction) {
      // ターゲットのみの場合は0（先頭から検索される想定）
      return 0;
    }
    return 0;
  }
  
  /**
   * 修正履歴を保存する
   */
  private async saveCorrectionHistory(chapterId: string, corrections: Correction[]): Promise<void> {
    try {
      if (corrections.length === 0) return;
      
      // 保存先のパス
      const filePath = `history/auto-correction-history.yaml`;
      
      // 既存の履歴を読み込む
      let history: any = {};
      try {
        const existingContent = await storageProvider.readFile(filePath);
        // YAMLパース（実際の実装ではライブラリ使用）
        history = {}; // TODO: YAML解析
      } catch (error: unknown) {
        // ファイルがない場合は新規作成
        history = { auto_corrections: [] };
      }
      
      // 新しい修正履歴を追加
      const newEntry = {
        chapter: chapterId,
        timestamp: new Date().toISOString(),
        corrections: corrections.map(c => ({
          type: c.type,
          description: c.description,
          severity: c.severity,
        })),
      };
      
      history.auto_corrections.push(newEntry);
      
      // 履歴を保存
      // 実際の実装ではYAMLシリアライズ
      const content = JSON.stringify(history, null, 2); // TODO: YAML変換
      
      await storageProvider.writeFile(filePath, content);
      
      logger.info(`修正履歴を保存しました: ${filePath}`);
    } catch (error: unknown) {
        logError(error, {}, `修正履歴保存中にエラーが発生しました: ${getErrorMessage(error)}`);
    }
  }
}