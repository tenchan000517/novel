/**
 * キャラクターモジュールのカスタムエラークラス
 */

/**
 * キャラクターエラーの基底クラス
 * すべてのキャラクターモジュール関連エラーの親クラス
 */
export class CharacterError extends Error {
    /** エラーコード */
    code: string;
    
    /** 原因となったエラー */
    cause?: Error;
    
    /** メタデータ */
    metadata?: Record<string, any>;
    
    /**
     * @param message エラーメッセージ
     * @param code エラーコード
     * @param cause 原因エラー
     * @param metadata 追加メタデータ
     */
    constructor(
        message: string,
        code: string = 'CHARACTER_ERROR',
        cause?: Error,
        metadata?: Record<string, any>
    ) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.cause = cause;
        this.metadata = metadata;
        
        // ES5以前のブラウザでのスタックトレース改善のため
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    
    /**
     * エラーの詳細情報を文字列で取得
     */
    getDetails(): string {
        let details = `${this.name}: ${this.message} [${this.code}]`;
        
        if (this.cause) {
            details += `\nCaused by: ${this.cause.message}`;
        }
        
        if (this.metadata && Object.keys(this.metadata).length > 0) {
            details += `\nMetadata: ${JSON.stringify(this.metadata, null, 2)}`;
        }
        
        return details;
    }
}

/**
 * 見つからないエラー
 * リクエストされたリソースが見つからない場合に使用
 */
export class NotFoundError extends CharacterError {
    /**
     * @param resourceType リソースタイプ（例: "Character", "Relationship"）
     * @param resourceId リソースID
     * @param cause 原因エラー
     */
    constructor(
        resourceType: string,
        resourceId: string,
        cause?: Error
    ) {
        super(
            `${resourceType} with ID "${resourceId}" not found`,
            'RESOURCE_NOT_FOUND',
            cause,
            { resourceType, resourceId }
        );
    }
}

/**
 * 検証エラー
 * 入力データが検証に失敗した場合に使用
 */
export class ValidationError extends CharacterError {
    /** 検証エラーの詳細 */
    validationErrors: Record<string, string[]>;
    
    /**
     * @param message エラーメッセージ
     * @param validationErrors 検証エラーの詳細
     * @param cause 原因エラー
     */
    constructor(
        message: string,
        validationErrors: Record<string, string[]>,
        cause?: Error
    ) {
        super(
            message,
            'VALIDATION_ERROR',
            cause,
            { validationErrors }
        );
        this.validationErrors = validationErrors;
    }
    
    /**
     * 検証エラーの詳細を文字列で取得
     */
    getValidationErrorDetails(): string {
        let details = this.message + '\n';
        
        for (const [field, errors] of Object.entries(this.validationErrors)) {
            details += `${field}:\n`;
            
            for (const error of errors) {
                details += `  - ${error}\n`;
            }
        }
        
        return details;
    }
}

/**
 * 整合性エラー
 * キャラクターの整合性が損なわれている場合に使用
 */
export class ConsistencyError extends CharacterError {
    /**
     * @param characterId キャラクターID
     * @param message エラーメッセージ
     * @param metadata 追加メタデータ
     */
    constructor(
        characterId: string,
        message: string,
        metadata?: Record<string, any>
    ) {
        super(
            message,
            'CONSISTENCY_ERROR',
            undefined,
            { characterId, ...metadata }
        );
    }
}

/**
 * 永続化エラー
 * データの保存や読み込みに失敗した場合に使用
 */
export class PersistenceError extends CharacterError {
    /**
     * @param operation 実行された操作 (e.g., "save", "load")
     * @param resourceType リソースタイプ
     * @param message エラーメッセージ
     * @param cause 原因エラー
     */
    constructor(
        operation: string,
        resourceType: string,
        message: string,
        cause?: Error
    ) {
        super(
            message,
            'PERSISTENCE_ERROR',
            cause,
            { operation, resourceType }
        );
    }
}

/**
 * 競合エラー
 * 同時更新の競合が発生した場合に使用
 */
export class ConflictError extends CharacterError {
    /**
     * @param resourceType リソースタイプ
     * @param resourceId リソースID
     * @param message エラーメッセージ
     */
    constructor(
        resourceType: string,
        resourceId: string,
        message: string
    ) {
        super(
            message,
            'CONFLICT_ERROR',
            undefined,
            { resourceType, resourceId }
        );
    }
}

/**
 * 依存関係エラー
 * 必要な依存関係が満たされていない場合に使用
 */
export class DependencyError extends CharacterError {
    /**
     * @param dependency 依存しているリソース
     * @param message エラーメッセージ
     */
    constructor(
        dependency: string,
        message: string
    ) {
        super(
            message,
            'DEPENDENCY_ERROR',
            undefined,
            { dependency }
        );
    }
}

/**
 * 操作不能エラー
 * 要求された操作を実行できない場合に使用
 */
export class InvalidOperationError extends CharacterError {
    /**
     * @param operation 要求された操作
     * @param reason 操作できない理由
     */
    constructor(
        operation: string,
        reason: string
    ) {
        super(
            `Cannot perform operation "${operation}": ${reason}`,
            'INVALID_OPERATION',
            undefined,
            { operation, reason }
        );
    }
}

/**
 * サービス連携エラー
 * 外部サービスやAPIとの連携に失敗した場合に使用
 */
export class ServiceIntegrationError extends CharacterError {
    /**
     * @param service サービス名
     * @param operation 要求された操作
     * @param message エラーメッセージ
     * @param cause 原因エラー
     */
    constructor(
        service: string,
        operation: string,
        message: string,
        cause?: Error
    ) {
        super(
            message,
            'SERVICE_INTEGRATION_ERROR',
            cause,
            { service, operation }
        );
    }
}