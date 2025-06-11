/**
 * Version 2.0 - ロガーサービス
 * 
 * 統一ログ管理システム
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  source?: string;
}

export class Logger {
  private level: LogLevel;
  private systemId: string = 'system';

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  debug(message: string, context?: any): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: any): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: any): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: any): void {
    this.log('error', message, context);
  }

  setSystemId(systemId: string): void {
    this.systemId = systemId;
  }

  private log(level: LogLevel, message: string, context?: any): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      source: `novel-automation-v2:${this.systemId}`
    };

    console.log(JSON.stringify(entry));
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
}

// シングルトンインスタンス
export const logger = new Logger();

// システム別ロガーファクトリ
export function createSystemLogger(systemId: string): Logger {
  const systemLogger = new Logger();
  systemLogger.setSystemId(systemId);
  return systemLogger;
}