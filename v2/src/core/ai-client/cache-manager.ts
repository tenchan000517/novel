/**
 * Version 2.0 - AIキャッシュ管理
 * 
 * AIレスポンスのキャッシュ管理
 */

import { AIResponse } from '@/types/ai-client';

interface CacheManagerConfig {
  enabled: boolean;
  cache?: any;
  logger?: any;
}

export class CacheManager {
  private enabled: boolean;
  private cache: Map<string, { response: AIResponse; expiry: number }>;
  private logger: any;

  constructor(config: CacheManagerConfig) {
    this.enabled = config.enabled;
    this.cache = new Map();
    this.logger = config.logger || console;

    // 定期的なクリーンアップ
    if (this.enabled) {
      setInterval(() => this.cleanup(), 300000); // 5分ごと
    }
  }

  async get(key: string): Promise<AIResponse | null> {
    if (!this.enabled) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.response;
  }

  async set(key: string, response: AIResponse, ttlSeconds: number): Promise<void> {
    if (!this.enabled) return;

    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { response, expiry });
  }

  async clear(pattern?: string): Promise<void> {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiry) {
        this.cache.delete(key);
      }
    }
  }
}