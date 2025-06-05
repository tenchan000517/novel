// src/lib/plot/section/section-storage.ts
/**
 * @fileoverview 中期プロット（篇）のストレージ関連処理を担当するクラス
 * @description
 * セクションプロットのデータ保存・読み込みを行います。
 */

import { logger } from '@/lib/utils/logger';
import { logError } from '@/lib/utils/error-handler';
import { StorageProvider } from '@/lib/storage';
import { SectionPlot } from './types';

/**
 * @class SectionStorage
 * @description セクションプロットのストレージ関連処理を担当するクラス
 */
export class SectionStorage {
  private readonly BASE_PATH = 'plot/sections';
  
  /**
   * コンストラクタ
   * 
   * @param storageProvider ストレージプロバイダー
   */
  constructor(
    private storageProvider: StorageProvider
  ) {}

  /**
   * セクションプロットを保存
   * 
   * @param sections セクションプロットの配列
   */
  async saveSectionPlots(sections: SectionPlot[]): Promise<void> {
    try {
      // ディレクトリを確認・作成
      await this.ensureDirectory();
      
      // メインデータファイルに保存
      const mainPath = `${this.BASE_PATH}/sections.json`;
      await this.storageProvider.writeFile(
        mainPath,
        JSON.stringify(sections, null, 2)
      );
      
      // バックアップを作成
      const backupPath = `${this.BASE_PATH}/sections-${Date.now()}.backup.json`;
      await this.storageProvider.writeFile(
        backupPath,
        JSON.stringify(sections, null, 2)
      );
      
      // 古いバックアップを削除（最新5つを残す）
      await this.cleanupOldBackups();
      
      logger.info(`Saved ${sections.length} section plots to storage`);
    } catch (error) {
      logError(error, {}, 'Failed to save section plots');
      throw error;
    }
  }

  /**
   * セクション関係性データを保存
   * 
   * @param relationships セクション関係性のマップ
   */
  async saveSectionRelationships(
    relationships: Map<string, { prev: string | null; next: string | null }>
  ): Promise<void> {
    try {
      // ディレクトリを確認・作成
      await this.ensureDirectory();
      
      // データをJSON形式で保存
      const relationshipsData = Array.from(relationships.entries()).map(([id, relations]) => ({
        id,
        prev: relations.prev,
        next: relations.next
      }));
      
      const path = `${this.BASE_PATH}/relationships.json`;
      await this.storageProvider.writeFile(
        path,
        JSON.stringify(relationshipsData, null, 2)
      );
      
      logger.info(`Saved ${relationshipsData.length} section relationships to storage`);
    } catch (error) {
      logError(error, {}, 'Failed to save section relationships');
      throw error;
    }
  }

  /**
   * セクションプロットを読み込み
   * 
   * @returns セクションプロットの配列
   */
  async loadSectionPlots(): Promise<SectionPlot[]> {
    try {
      const path = `${this.BASE_PATH}/sections.json`;
      
      // ファイルが存在するか確認
      const exists = await this.storageProvider.fileExists(path);
      if (!exists) {
        logger.info(`Section plots file not found at ${path}`);
        return [];
      }
      
      // ファイルを読み込み
      const content = await this.storageProvider.readFile(path);
      const sections = JSON.parse(content);
      
      if (!Array.isArray(sections)) {
        logger.warn(`Invalid section plots format in ${path}`);
        return [];
      }
      
      logger.info(`Loaded ${sections.length} section plots from storage`);
      return sections;
    } catch (error) {
      logError(error, {}, 'Failed to load section plots');
      return [];
    }
  }

  /**
   * セクション関係性データを読み込み
   * 
   * @returns セクション関係性のマップ
   */
  async loadSectionRelationships(): Promise<Map<string, { prev: string | null; next: string | null }> | null> {
    try {
      const path = `${this.BASE_PATH}/relationships.json`;
      
      // ファイルが存在するか確認
      const exists = await this.storageProvider.fileExists(path);
      if (!exists) {
        logger.info(`Section relationships file not found at ${path}`);
        return null;
      }
      
      // ファイルを読み込み
      const content = await this.storageProvider.readFile(path);
      const relationshipsData = JSON.parse(content);
      
      if (!Array.isArray(relationshipsData)) {
        logger.warn(`Invalid section relationships format in ${path}`);
        return null;
      }
      
      // マップに変換
      const relationships = new Map<string, { prev: string | null; next: string | null }>();
      relationshipsData.forEach(item => {
        if (item && item.id) {
          relationships.set(item.id, {
            prev: item.prev || null,
            next: item.next || null
          });
        }
      });
      
      logger.info(`Loaded ${relationships.size} section relationships from storage`);
      return relationships;
    } catch (error) {
      logError(error, {}, 'Failed to load section relationships');
      return null;
    }
  }

  /**
   * 特定のセクションを保存
   * 
   * @param section セクションプロット
   * @param overwrite 既存ファイルを上書きするか
   */
  async saveSingleSection(section: SectionPlot, overwrite: boolean = true): Promise<void> {
    try {
      // ディレクトリを確認・作成
      await this.ensureDirectory();
      
      const path = `${this.BASE_PATH}/section-${section.id}.json`;
      
      // 上書きチェック
      if (!overwrite) {
        const exists = await this.storageProvider.fileExists(path);
        if (exists) {
          throw new Error(`Section file already exists at ${path}`);
        }
      }
      
      // ファイルに保存
      await this.storageProvider.writeFile(
        path,
        JSON.stringify(section, null, 2)
      );
      
      logger.info(`Saved section ${section.id} to storage`);
    } catch (error) {
      logError(error, { sectionId: section.id }, 'Failed to save single section');
      throw error;
    }
  }

  /**
   * 特定のセクションを読み込み
   * 
   * @param sectionId セクションID
   * @returns セクションプロット (見つからない場合はnull)
   */
  async loadSingleSection(sectionId: string): Promise<SectionPlot | null> {
    try {
      const path = `${this.BASE_PATH}/section-${sectionId}.json`;
      
      // ファイルが存在するか確認
      const exists = await this.storageProvider.fileExists(path);
      if (!exists) {
        logger.info(`Section file not found at ${path}`);
        return null;
      }
      
      // ファイルを読み込み
      const content = await this.storageProvider.readFile(path);
      const section = JSON.parse(content);
      
      if (!section || !section.id) {
        logger.warn(`Invalid section format in ${path}`);
        return null;
      }
      
      logger.info(`Loaded section ${sectionId} from storage`);
      return section;
    } catch (error) {
      logError(error, { sectionId }, 'Failed to load single section');
      return null;
    }
  }

  /**
   * セクションが存在するか確認
   * 
   * @param sectionId セクションID
   * @returns 存在するか
   */
  async sectionExists(sectionId: string): Promise<boolean> {
    try {
      const path = `${this.BASE_PATH}/section-${sectionId}.json`;
      return await this.storageProvider.fileExists(path);
    } catch (error) {
      logger.error(`Failed to check section existence: ${sectionId}`, { error });
      return false;
    }
  }

  /**
   * ディレクトリを確認・作成
   */
  private async ensureDirectory(): Promise<void> {
    try {
      const exists = await this.storageProvider.directoryExists(this.BASE_PATH);
      if (!exists) {
        await this.storageProvider.createDirectory(this.BASE_PATH);
      }
    } catch (error) {
      logError(error, {}, 'Failed to ensure directory');
      throw error;
    }
  }

  /**
   * 古いバックアップを削除
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      // バックアップファイルを検索
      const files = await this.storageProvider.listFiles(this.BASE_PATH);
      const backupFiles = files.filter(file => file.includes('.backup.json'))
        .sort().reverse();
      
      // 最新5つを残して削除
      if (backupFiles.length > 5) {
        for (let i = 5; i < backupFiles.length; i++) {
          const path = `${this.BASE_PATH}/${backupFiles[i]}`;
          await this.storageProvider.deleteFile(path);
          logger.debug(`Deleted old backup: ${path}`);
        }
      }
    } catch (error) {
      logger.warn('Failed to cleanup old backups', { error });
      // エラーは無視して続行
    }
  }
}