/**
 * Version 2.0 - 設定管理サービス
 * 
 * アプリケーション設定の一元管理
 */

import { ApplicationConfig } from '../lifecycle/application-lifecycle';

export class ConfigurationManager {
  private config: ApplicationConfig;

  constructor(config: ApplicationConfig) {
    this.config = config;
  }

  get<T>(key: string, defaultValue?: T): T {
    const keys = key.split('.');
    let current: any = this.config;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return defaultValue as T;
      }
    }

    return current;
  }

  getAll(): ApplicationConfig {
    return { ...this.config };
  }

  update(updates: Partial<ApplicationConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}