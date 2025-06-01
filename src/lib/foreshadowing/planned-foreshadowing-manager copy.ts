// src/lib/foreshadowing/planned-foreshadowing-manager.ts

import fs from 'fs';
import path from 'path';
import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { Foreshadowing } from '@/types/memory';

/**
 * @fileoverview 計画済み伏線管理モジュール
 * @description
 * 事前に計画された伏線を管理するモジュールです。
 * 設定ファイルから計画済み伏線を読み込み、現在のチャプターに
 * 導入または解決すべき伏線を提供します。
 * 
 * @role
 * - 設定ファイルからの計画済み伏線の読み込み
 * - 現在のチャプターに関連する伏線の提供
 * - 伏線の導入・解決ステータスの管理
 */

/**
 * 計画済み伏線のヒント情報
 */
export interface PlannedForeshadowingHint {
  chapter: number;
  hint: string;
}

/**
 * 計画済み伏線の構造
 */
export interface PlannedForeshadowing {
  id: string;
  description: string;
  chapter_to_introduce: number;
  introduction_context: string;
  chapter_to_resolve: number;
  resolution_context: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  relatedCharacters?: string[];
  hints_before_resolution?: PlannedForeshadowingHint[];
  isIntroduced: boolean;
  isResolved: boolean;
}

/**
 * 計画済み伏線設定ファイルの構造
 */
export interface PlannedForeshadowingConfig {
  planned_foreshadowings: PlannedForeshadowing[];
}

/**
 * @class PlannedForeshadowingManager
 * @description
 * 計画済みの伏線を管理するクラス。
 * 設定ファイルから伏線を読み込み、現在のチャプターで導入または
 * 解決すべき伏線を提供します。
 * 
 * @role
 * - 計画済み伏線設定ファイルの読み込み
 * - 現在のチャプターに関連する伏線の提供
 * - 伏線の導入・解決ステータスの管理
 * - 設定ファイルの更新（伏線のステータス変更時）
 * 
 * @used-by
 * - ForeshadowingEngine
 * - ForeshadowingManager
 * 
 * @lifecycle
 * 1. インスタンス作成
 * 2. loadPlannedForeshadowings()による設定読み込み
 * 3. 各種getXXX()メソッドによる伏線情報の取得
 * 4. markAsIntroduced()/markAsResolved()による伏線ステータスの更新
 * 5. savePlannedForeshadowings()による設定の保存
 */
export class PlannedForeshadowingManager {
  private plannedForeshadowings: PlannedForeshadowing[] = [];
  private loaded: boolean = false;
  private configPath: string;
  
  /**
   * PlannedForeshadowingManagerクラスを初期化します
   * 
   * @param {string} [configPath='src/config/planned_foreshadowings.json'] - 設定ファイルのパス
   */
  constructor(configPath: string = 'data/config/planned_foreshadowings.json') {
    this.configPath = configPath;
  }

  /**
   * 設定が読み込まれているかを確認します
   * 
   * @returns {boolean} 設定が読み込まれていればtrue
   */
  isLoaded(): boolean {
    return this.loaded;
  }
  
  /**
   * 計画済み伏線設定ファイルを読み込みます
   * 
   * @async
   * @returns {Promise<boolean>} 読み込み成功の場合はtrue、失敗の場合はfalse
   * 
   * @usage
   * const success = await plannedForeshadowingManager.loadPlannedForeshadowings();
   * if (success) {
   *   console.log('計画済み伏線を読み込みました');
   * } else {
   *   console.log('計画済み伏線が設定されていません');
   * }
   * 
   * @call-flow
   * 1. 設定ファイルの存在確認
   * 2. ファイル読み込みとJSONパース
   * 3. 読み込んだ伏線データの検証
   * 4. 読み込み完了フラグの設定
   * 5. 成功/失敗の返却
   * 
   * @error-handling
   * ファイルが存在しない場合やJSON解析エラーの場合はログに記録し、
   * 空のリストを使用します。エラーはスローせず、falseを返します。
   */
  async loadPlannedForeshadowings(): Promise<boolean> {
    try {
      // 設定ファイルの存在確認
      const configFile = path.resolve(process.cwd(), this.configPath);
      if (!fs.existsSync(configFile)) {
        logger.info(`計画済み伏線設定ファイル ${this.configPath} が見つかりません。計画済み伏線なしで続行します。`);
        this.plannedForeshadowings = [];
        this.loaded = true;
        return false;
      }

      // ファイル読み込み
      const rawData = await fs.promises.readFile(configFile, 'utf8');
      const loadedConfig = JSON.parse(rawData) as PlannedForeshadowingConfig;
      
      if (!loadedConfig.planned_foreshadowings || !Array.isArray(loadedConfig.planned_foreshadowings)) {
        logger.warn('計画済み伏線設定ファイルのフォーマットが不正です');
        this.plannedForeshadowings = [];
        this.loaded = true;
        return false;
      }
      
      // 検証してからセット
      this.plannedForeshadowings = this.validatePlannedForeshadowings(loadedConfig.planned_foreshadowings);
      this.loaded = true;
      
      logger.info(`${this.plannedForeshadowings.length}件の計画済み伏線を読み込みました`);
      return true;
    } catch (error) {
      logError(error, { configPath: this.configPath }, '計画済み伏線設定ファイルの読み込みに失敗しました');
      this.plannedForeshadowings = [];
      this.loaded = true;
      return false;
    }
  }

  /**
   * 計画済み伏線の配列を検証します
   * 
   * @private
   * @param {any[]} foreshadowings - 検証する計画済み伏線配列
   * @returns {PlannedForeshadowing[]} 検証済みの計画済み伏線配列
   */
  private validatePlannedForeshadowings(foreshadowings: any[]): PlannedForeshadowing[] {
    return foreshadowings.filter(item => {
      // 必須フィールドの存在確認
      return item.id && 
             item.description && 
             typeof item.chapter_to_introduce === 'number' &&
             item.introduction_context &&
             typeof item.chapter_to_resolve === 'number' &&
             item.resolution_context;
    }).map(item => {
      // 不足フィールドに初期値を設定
      return {
        ...item,
        urgency: item.urgency || 'medium',
        isIntroduced: !!item.isIntroduced,
        isResolved: !!item.isResolved,
        relatedCharacters: Array.isArray(item.relatedCharacters) ? item.relatedCharacters : [],
        hints_before_resolution: Array.isArray(item.hints_before_resolution) ? item.hints_before_resolution : []
      };
    });
  }

  /**
   * 計画済み伏線設定を保存します
   * 
   * @async
   * @returns {Promise<boolean>} 保存成功の場合はtrue、失敗の場合はfalse
   * 
   * @usage
   * await plannedForeshadowingManager.markAsIntroduced('fs-planned-001');
   * const success = await plannedForeshadowingManager.savePlannedForeshadowings();
   * 
   * @call-flow
   * 1. 設定オブジェクトの作成
   * 2. JSONへの変換
   * 3. ファイルへの書き込み
   * 4. 成功/失敗の返却
   * 
   * @error-handling
   * 書き込みエラーの場合はログに記録し、falseを返します。
   */
  async savePlannedForeshadowings(): Promise<boolean> {
    if (!this.loaded) {
      logger.warn('計画済み伏線が読み込まれていないため保存できません');
      return false;
    }
    
    try {
      const config: PlannedForeshadowingConfig = {
        planned_foreshadowings: this.plannedForeshadowings
      };
      
      const configFile = path.resolve(process.cwd(), this.configPath);
      await fs.promises.writeFile(configFile, JSON.stringify(config, null, 2), 'utf8');
      
      logger.info(`計画済み伏線設定を保存しました: ${this.configPath}`);
      return true;
    } catch (error) {
      logError(error, { configPath: this.configPath }, '計画済み伏線設定の保存に失敗しました');
      return false;
    }
  }

  /**
   * 現在のチャプターで導入すべき計画済み伏線を取得します
   * 
   * @param {number} chapterNumber - 現在のチャプター番号
   * @returns {PlannedForeshadowing[]} 導入すべき計画済み伏線の配列
   * 
   * @usage
   * const foreshadowingsToIntroduce = 
   *   plannedForeshadowingManager.getForeshadowingsToIntroduceInChapter(5);
   * 
   * @call-flow
   * 1. 設定の読み込み確認
   * 2. チャプター番号に一致する未導入の伏線をフィルタリング
   * 3. 該当する伏線の配列を返却
   */
  getForeshadowingsToIntroduceInChapter(chapterNumber: number): PlannedForeshadowing[] {
    this.ensureLoaded();
    
    return this.plannedForeshadowings.filter(item => 
      item.chapter_to_introduce === chapterNumber && !item.isIntroduced
    );
  }

  /**
   * 現在のチャプターで解決すべき計画済み伏線を取得します
   * 
   * @param {number} chapterNumber - 現在のチャプター番号
   * @returns {PlannedForeshadowing[]} 解決すべき計画済み伏線の配列
   * 
   * @usage
   * const foreshadowingsToResolve = 
   *   plannedForeshadowingManager.getForeshadowingsToResolveInChapter(12);
   * 
   * @call-flow
   * 1. 設定の読み込み確認
   * 2. チャプター番号に一致する導入済み・未解決の伏線をフィルタリング
   * 3. 該当する伏線の配列を返却
   */
  getForeshadowingsToResolveInChapter(chapterNumber: number): PlannedForeshadowing[] {
    this.ensureLoaded();
    
    return this.plannedForeshadowings.filter(item => 
      item.chapter_to_resolve === chapterNumber && 
      item.isIntroduced && 
      !item.isResolved
    );
  }

  /**
   * 現在のチャプターでヒントを出すべき計画済み伏線を取得します
   * 
   * @param {number} chapterNumber - 現在のチャプター番号
   * @returns {Array<{foreshadowing: PlannedForeshadowing, hint: string}>} 
   *          ヒントを含む伏線情報の配列
   * 
   * @usage
   * const hintsForChapter = 
   *   plannedForeshadowingManager.getHintsForChapter(7);
   * 
   * @call-flow
   * 1. 設定の読み込み確認
   * 2. 各伏線のhints_before_resolutionをチェック
   * 3. 現在のチャプターに該当するヒントを持つ伏線を抽出
   * 4. 伏線とヒント情報の配列を返却
   */
  getHintsForChapter(chapterNumber: number): Array<{foreshadowing: PlannedForeshadowing, hint: string}> {
    this.ensureLoaded();
    
    const result: Array<{foreshadowing: PlannedForeshadowing, hint: string}> = [];
    
    this.plannedForeshadowings.forEach(foreshadowing => {
      if (!foreshadowing.isResolved && foreshadowing.isIntroduced && 
          foreshadowing.hints_before_resolution && 
          Array.isArray(foreshadowing.hints_before_resolution)) {
        
        foreshadowing.hints_before_resolution.forEach(hintInfo => {
          if (hintInfo.chapter === chapterNumber) {
            result.push({
              foreshadowing,
              hint: hintInfo.hint
            });
          }
        });
      }
    });
    
    return result;
  }

  /**
   * 伏線を導入済みとしてマークします
   * 
   * @param {string} id - 伏線ID
   * @returns {boolean} 成功した場合はtrue、該当する伏線がない場合はfalse
   * 
   * @usage
   * const success = plannedForeshadowingManager.markAsIntroduced('fs-planned-001');
   * if (success) {
   *   await plannedForeshadowingManager.savePlannedForeshadowings();
   * }
   * 
   * @call-flow
   * 1. 設定の読み込み確認
   * 2. IDに一致する伏線の検索
   * 3. 伏線のisIntroducedフラグを更新
   * 4. 成功/失敗の返却
   */
  markAsIntroduced(id: string): boolean {
    this.ensureLoaded();
    
    const index = this.plannedForeshadowings.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    this.plannedForeshadowings[index].isIntroduced = true;
    return true;
  }

  /**
   * 伏線を解決済みとしてマークします
   * 
   * @param {string} id - 伏線ID
   * @returns {boolean} 成功した場合はtrue、該当する伏線がない場合はfalse
   * 
   * @usage
   * const success = plannedForeshadowingManager.markAsResolved('fs-planned-001');
   * if (success) {
   *   await plannedForeshadowingManager.savePlannedForeshadowings();
   * }
   * 
   * @call-flow
   * 1. 設定の読み込み確認
   * 2. IDに一致する伏線の検索
   * 3. 伏線のisResolvedフラグを更新
   * 4. 成功/失敗の返却
   */
  markAsResolved(id: string): boolean {
    this.ensureLoaded();
    
    const index = this.plannedForeshadowings.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    this.plannedForeshadowings[index].isResolved = true;
    return true;
  }

  /**
   * すべての計画済み伏線が解決されているか確認します
   * 
   * @returns {boolean} すべての伏線が解決済みの場合はtrue
   * 
   * @usage
   * const allResolved = plannedForeshadowingManager.areAllForeshadowingsResolved();
   * if (allResolved) {
   *   console.log('すべての計画済み伏線が解決済みです');
   * }
   * 
   * @call-flow
   * 1. 設定の読み込み確認
   * 2. 未解決の伏線の存在確認
   * 3. 結果の返却
   */
  areAllForeshadowingsResolved(): boolean {
    this.ensureLoaded();
    
    if (this.plannedForeshadowings.length === 0) return true;
    
    return this.plannedForeshadowings.every(item => item.isResolved);
  }

  /**
   * 計画済み伏線をForeshadowing型に変換します
   * 
   * @param {PlannedForeshadowing} planned - 変換する計画済み伏線
   * @returns {Foreshadowing} 変換されたForeshadowing
   * 
   * @usage
   * const foreshadowing = plannedForeshadowingManager.convertToForeshadowing(plannedItem);
   * 
   * @call-flow
   * 1. 必要なフィールドのマッピング
   * 2. タイムスタンプの設定
   * 3. 変換後のオブジェクトを返却
   */
  convertToForeshadowing(planned: PlannedForeshadowing): Foreshadowing {
    const now = new Date().toISOString();
    
    return {
      id: planned.id,
      description: planned.description,
      context: planned.introduction_context,
      chapter_introduced: planned.chapter_to_introduce,
      potential_resolution: planned.resolution_context,
      resolved: planned.isResolved,
      resolution_chapter: planned.isResolved ? planned.chapter_to_resolve : undefined,
      plannedResolution: planned.chapter_to_resolve,
      urgency: planned.urgency,
      relatedCharacters: planned.relatedCharacters || [],
      createdTimestamp: now,
      updatedTimestamp: now
    };
  }

  /**
   * 設定が読み込まれていることを確認します
   * 
   * @private
   * @throws {Error} 設定が読み込まれていない場合
   */
  private ensureLoaded(): void {
    if (!this.loaded) {
      throw new Error('計画済み伏線が読み込まれていません。先にloadPlannedForeshadowings()を呼び出してください。');
    }
  }
}

// シングルトンインスタンスをエクスポート
export const plannedForeshadowingManager = new PlannedForeshadowingManager();

/**
 * 計画済み伏線管理のシングルトンインスタンス
 * 
 * PlannedForeshadowingManagerクラスのシングルトンインスタンスです。
 * アプリケーション全体で一貫した計画済み伏線管理を提供します。
 * 
 * @type {PlannedForeshadowingManager}
 * 
 * @singleton
 * アプリケーション全体で単一のインスタンスを共有するシングルトンです。
 * 
 * @usage
 * import { plannedForeshadowingManager } from '@/lib/foreshadowing/planned-foreshadowing-manager';
 * 
 * async function initialize() {
 *   await plannedForeshadowingManager.loadPlannedForeshadowings();
 *   // 計画済み伏線を使用
 *   const foreshadowingsToIntroduce = 
 *     plannedForeshadowingManager.getForeshadowingsToIntroduceInChapter(currentChapter);
 * }
 */