/**
 * @fileoverview キャッシュストレージユーティリティ
 * @description
 * 有効期限つきの汎用キャッシュストレージを提供します。
 */

import { logger } from '@/lib/utils/logger';
import { ICacheStorage } from '@/lib/analysis/core/interfaces';
import { DEFAULT_CACHE_TTL, DEFAULT_CACHE_MAX_SIZE } from '@/lib/analysis/core/constants';

/**
 * キャッシュエントリ
 */
interface CacheEntry<T> {
  /** 格納タイムスタンプ */
  timestamp: number;
  /** キャッシュデータ */
  data: T;
  /** 有効期限タイムスタンプ */
  expiresAt: number;
}

/**
 * @class CacheStorage
 * @description
 * 有効期限つきの汎用キャッシュストレージクラス
 * 
 * @implements ICacheStorage
 */
export class CacheStorage implements ICacheStorage {
  /** キャッシュデータマップ */
  private cache: Map<string | number, CacheEntry<any>> = new Map();
  /** デフォルトのキャッシュTTL（1時間） */
  private defaultTTL: number = DEFAULT_CACHE_TTL;
  /** キャッシュサイズ制限 */
  private maxSize: number = DEFAULT_CACHE_MAX_SIZE;
  
  /**
   * コンストラクタ
   * @param options 設定オプション
   */
  constructor(options?: { defaultTTL?: number; maxSize?: number }) {
    if (options?.defaultTTL) {
      this.defaultTTL = options.defaultTTL;
    }
    
    if (options?.maxSize) {
      this.maxSize = options.maxSize;
    }
    
    logger.debug('CacheStorage: 初期化完了', {
      defaultTTL: this.defaultTTL,
      maxSize: this.maxSize
    });
  }
  
  /**
   * キャッシュに値を設定
   * @param key キー
   * @param value 値
   * @param ttl 有効期限（ミリ秒）
   */
  set<T>(key: string | number, value: T, ttl: number = this.defaultTTL): void {
    // 現在時刻の取得
    const now = Date.now();
    
    // キャッシュエントリの作成
    const entry: CacheEntry<T> = {
      timestamp: now,
      data: value,
      expiresAt: now + ttl
    };
    
    // キャッシュに設定
    this.cache.set(key, entry);
    
    // キャッシュサイズの制限チェック
    if (this.cache.size > this.maxSize) {
      this.pruneCache();
    }
  }
  
  /**
   * キャッシュから値を取得
   * @param key キー
   * @returns キャッシュ値（存在しないかExpireしている場合はnull）
   */
  get<T>(key: string | number): T | null {
    // キャッシュエントリを取得
    const entry = this.cache.get(key);
    
    // エントリが存在しない場合はnullを返す
    if (!entry) {
      return null;
    }
    
    // 有効期限をチェック
    const now = Date.now();
    if (entry.expiresAt < now) {
      // 有効期限切れの場合はエントリを削除してnullを返す
      this.cache.delete(key);
      return null;
    }
    
    // 有効なエントリの場合はデータを返す
    return entry.data as T;
  }
  
  /**
   * キャッシュから項目を削除
   * @param key キー
   * @returns 削除成功時はtrue
   */
  delete(key: string | number): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * キャッシュをクリア
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * 指定したプレフィックスを持つキーのエントリをすべて削除
   * @param prefix キープレフィックス
   */
  deleteByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (typeof key === 'string' && key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * 期限切れのエントリを削除
   */
  removeExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * キャッシュの数を取得
   * @returns キャッシュエントリ数
   */
  size(): number {
    return this.cache.size;
  }
  
  /**
   * キャッシュを整理（古いものから削除）
   * @private
   */
  private pruneCache(): void {
    // 全エントリをタイムスタンプでソート
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    // 削除すべきエントリ数の計算（サイズの20%）
    const deleteCount = Math.ceil(this.maxSize * 0.2);
    
    // 最も古いエントリを削除
    for (let i = 0; i < deleteCount && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
    }
    
    logger.debug(`CacheStorage: ${deleteCount}個のキャッシュエントリを削除しました`);
  }
}