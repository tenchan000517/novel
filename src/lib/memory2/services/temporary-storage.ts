/**
 * @fileoverview 一時的なデータを保存・取得するためのサービス
 * @description
 * メモリマネージャーから切り出された一時保存機能を提供するサービスクラスです。
 * 一時的なデータを保存、取得するための単純なインターフェースを提供します。
 */
import { logger } from '@/lib/utils/logger';

/**
 * @class TemporaryStorage
 * @description
 * 一時的なデータを保存・取得するためのサービスクラス。
 * メモリ上にデータを保持し、キーに基づいて操作を行います。
 */
export class TemporaryStorage {
    private storage: Map<string, string> = new Map();
    
    /**
     * 一時的なデータを保存します
     * @param key キー
     * @param data データ（文字列）
     */
    async storeData(key: string, data: string): Promise<void> {
        this.storage.set(key, data);
        logger.debug(`Temporary data stored with key: ${key}`);
    }
    
    /**
     * 一時的なデータを取得します
     * @param key キー
     * @returns 保存されたデータ、存在しない場合はnull
     */
    async getData(key: string): Promise<string | null> {
        const data = this.storage.get(key);
        logger.debug(`Retrieved temporary data for key: ${key}, exists: ${!!data}`);
        return data || null;
    }

    /**
     * 指定されたキーのデータが存在するかを確認します
     * @param key キー
     * @returns データが存在する場合はtrue、そうでない場合はfalse
     */
    hasData(key: string): boolean {
        return this.storage.has(key);
    }

    /**
     * 指定されたキーのデータを削除します
     * @param key キー
     * @returns 削除に成功した場合はtrue、キーが存在しなかった場合はfalse
     */
    removeData(key: string): boolean {
        return this.storage.delete(key);
    }

    /**
     * すべての一時データをクリアします
     */
    clearAll(): void {
        this.storage.clear();
        logger.debug('All temporary data cleared');
    }
}