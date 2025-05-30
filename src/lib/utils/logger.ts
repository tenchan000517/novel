/**
 * アプリケーション全体で使用するロガー (ブラウザ対応版)
 */

/**
 * ログレベルの定義
 */
export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

/**
 * ログのメタデータ型
 */
export type LogMetadata = Record<string, unknown>;

/**
 * ログエントリの型
 */
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    metadata?: LogMetadata;
    service: string;
}

/**
 * ロガーのオプション
 */
export interface LoggerOptions {
    minLevel: LogLevel;
    serviceName: string;
    enableConsole: boolean;
}

/**
 * デフォルトのロガーオプション
 */
const DEFAULT_OPTIONS: LoggerOptions = {
    minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
    serviceName: 'auto-novel-system',
    enableConsole: true,
};

/**
 * ロガークラス (ブラウザ対応)
 */
export class Logger {
    private options: LoggerOptions;

    /**
     * ロガーを初期化
     * @param options ロガーオプション
     */
    constructor(options: Partial<LoggerOptions> = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
    }

    /**
     * ログレベルの重要度をチェック
     * @param level チェックするログレベル
     * @returns 出力すべき場合はtrue
     */
    private shouldLog(level: LogLevel): boolean {
        const levels = Object.values(LogLevel);
        const minLevelIndex = levels.indexOf(this.options.minLevel);
        const currentLevelIndex = levels.indexOf(level);

        return currentLevelIndex >= minLevelIndex;
    }

    /**
     * ログエントリを作成
     * @param level ログレベル
     * @param message ログメッセージ
     * @param metadata メタデータ
     * @returns ログエントリ
     */
    private createLogEntry(level: LogLevel, message: string, metadata?: LogMetadata): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            metadata,
            service: this.options.serviceName,
        };
    }

    /**
     * ログエントリを出力
     * @param entry ログエントリ
     */
    private output(entry: LogEntry): void {
        // コンソール出力
        if (this.options.enableConsole) {
            // コンソール出力のフォーマットを整える
            const formattedMetadata = entry.metadata
                ? `\n${JSON.stringify(entry.metadata, null, 2)}`
                : '';

            const consoleMethod = {
                [LogLevel.DEBUG]: console.debug,
                [LogLevel.INFO]: console.info,
                [LogLevel.WARN]: console.warn,
                [LogLevel.ERROR]: console.error,
            }[entry.level];

            consoleMethod(
                `[${entry.timestamp}] [${entry.service}] [${entry.level.toUpperCase()}] ${entry.message}${formattedMetadata}`
            );
        }
    }

    /**
     * デバッグレベルのログを出力
     * @param message メッセージ
     * @param metadata メタデータ
     */
    debug(message: string, metadata?: LogMetadata): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            const entry = this.createLogEntry(LogLevel.DEBUG, message, metadata);
            this.output(entry);
        }
    }

    /**
     * 情報レベルのログを出力
     * @param message メッセージ
     * @param metadata メタデータ
     */
    info(message: string, metadata?: LogMetadata): void {
        if (this.shouldLog(LogLevel.INFO)) {
            const entry = this.createLogEntry(LogLevel.INFO, message, metadata);
            this.output(entry);
        }
    }

    /**
     * 警告レベルのログを出力
     * @param message メッセージ
     * @param metadata メタデータ
     */
    warn(message: string, metadata?: LogMetadata): void {
        if (this.shouldLog(LogLevel.WARN)) {
            const entry = this.createLogEntry(LogLevel.WARN, message, metadata);
            this.output(entry);
        }
    }

    /**
     * エラーレベルのログを出力
     * @param message メッセージ
     * @param metadata メタデータ
     */
    error(message: string, metadata?: LogMetadata): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            const entry = this.createLogEntry(LogLevel.ERROR, message, metadata);
            this.output(entry);
        }
    }

    /**
     * 内部設定を変更
     * @param options 更新するオプション
     */
    updateOptions(options: Partial<LoggerOptions>): void {
        this.options = { ...this.options, ...options };
    }
}

// デフォルトのロガーインスタンスをエクスポート
export const logger = new Logger();