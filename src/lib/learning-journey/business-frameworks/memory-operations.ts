/**
 * @fileoverview メモリ操作ヘルパー
 * @description 統合記憶システムとの安全な操作を提供するヘルパー関数群
 */

import { logger } from '@/lib/utils/logger';
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { EmotionalLearningIntegratorConfig } from '../emotional-types';

/**
 * 安全な記憶システム操作パターン
 * @template T 操作の戻り値の型
 * @param memoryManager メモリマネージャーインスタンス
 * @param operation 実行する操作
 * @param fallbackValue 失敗時のフォールバック値
 * @param operationName 操作名（ログ用）
 * @param config 設定オプション
 * @returns 操作結果またはフォールバック値
 */
export async function safeMemoryOperation<T>(
    memoryManager: MemoryManager,
    operation: () => Promise<T>,
    fallbackValue: T,
    operationName: string,
    config: Required<EmotionalLearningIntegratorConfig>
): Promise<T> {
    if (!config.useMemorySystemIntegration) {
        return fallbackValue;
    }

    let retries = 0;
    const maxRetries = config.maxRetries;

    while (retries < maxRetries) {
        try {
            // システム状態確認
            const systemStatus = await memoryManager.getSystemStatus();
            if (!systemStatus.initialized) {
                logger.warn(`${operationName}: MemoryManager not initialized`);
                return fallbackValue;
            }

            const result = await Promise.race([
                operation(),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Operation timeout')), config.timeoutMs)
                )
            ]);

            return result;

        } catch (error) {
            retries++;
            logger.error(`${operationName} failed (attempt ${retries}/${maxRetries})`, { error });

            if (retries >= maxRetries) {
                return fallbackValue;
            }

            // 指数バックオフで再試行
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
        }
    }

    return fallbackValue;
}

/**
 * 記憶システム統合の検証
 * @param memoryManager メモリマネージャーインスタンス
 * @throws {Error} 統合検証に失敗した場合
 */
export async function verifyMemorySystemIntegration(memoryManager: MemoryManager): Promise<void> {
    try {
        const systemStatus = await memoryManager.getSystemStatus();
        if (!systemStatus.initialized) {
            throw new Error('MemoryManager is not properly initialized');
        }

        logger.debug('Memory system integration verified successfully');
    } catch (error) {
        logger.error('Memory system integration verification failed', { error });
        throw error;
    }
}

/**
 * メモリシステムの状態を取得（安全版）
 * @param memoryManager メモリマネージャーインスタンス
 * @param config 設定オプション
 * @returns システム状態またはフォールバック状態
 */
export async function getMemorySystemStatusSafe(
    memoryManager: MemoryManager,
    config: Required<EmotionalLearningIntegratorConfig>
): Promise<any> {
    const createFallbackMemoryStatus = (): any => ({
        initialized: false,
        lastUpdateTime: new Date().toISOString(),
        memoryLayers: {
            shortTerm: { healthy: false, dataCount: 0, lastUpdate: '', storageSize: 0, errorCount: 1 },
            midTerm: { healthy: false, dataCount: 0, lastUpdate: '', storageSize: 0, errorCount: 1 },
            longTerm: { healthy: false, dataCount: 0, lastUpdate: '', storageSize: 0, errorCount: 1 }
        },
        performanceMetrics: {
            totalRequests: 0,
            cacheHits: 0,
            duplicatesResolved: 0,
            averageResponseTime: 0,
            lastUpdateTime: new Date().toISOString()
        },
        cacheStatistics: {
            hitRatio: 0,
            missRatio: 1,
            totalRequests: 0,
            cacheSize: 0,
            lastOptimization: new Date().toISOString(),
            evictionCount: 0
        }
    });

    if (!config.useMemorySystemIntegration) {
        return createFallbackMemoryStatus();
    }

    try {
        const result = await safeMemoryOperation(
            memoryManager,
            () => memoryManager.getSystemStatus(),
            createFallbackMemoryStatus(),
            'getSystemStatus',
            config
        );

        return result || createFallbackMemoryStatus();
    } catch (error) {
        logger.error('Failed to get memory system status', { error });
        return createFallbackMemoryStatus();
    }
}

/**
 * メモリオペレーションのヘルス診断
 * @param memoryManager メモリマネージャーインスタンス
 * @param config 設定オプション
 * @returns 診断結果
 */
export async function diagnoseMemoryOperations(
    memoryManager: MemoryManager,
    config: Required<EmotionalLearningIntegratorConfig>
): Promise<{
    memorySystemHealthy: boolean;
    recommendations: string[];
    lastError?: string;
}> {
    const recommendations: string[] = [];
    let memorySystemHealthy = true;
    let lastError: string | undefined;

    try {
        if (!config.useMemorySystemIntegration) {
            recommendations.push('Memory system integration is disabled');
            memorySystemHealthy = false;
            return { memorySystemHealthy, recommendations };
        }

        const status = await getMemorySystemStatusSafe(memoryManager, config);
        
        if (!status.initialized) {
            recommendations.push('Memory system is not properly initialized');
            memorySystemHealthy = false;
        }

        // メモリレイヤーの健全性チェック
        if (status.memoryLayers) {
            const layers = status.memoryLayers;
            if (!layers.shortTerm?.healthy) {
                recommendations.push('Short-term memory layer requires attention');
                memorySystemHealthy = false;
            }
            if (!layers.midTerm?.healthy) {
                recommendations.push('Mid-term memory layer requires attention');
                memorySystemHealthy = false;
            }
            if (!layers.longTerm?.healthy) {
                recommendations.push('Long-term memory layer requires attention');
                memorySystemHealthy = false;
            }
        }

        // パフォーマンス指標チェック
        if (status.performanceMetrics?.averageResponseTime > 5000) {
            recommendations.push('Memory system response time is slow');
        }

        if (status.cacheStatistics?.hitRatio < 0.5) {
            recommendations.push('Memory cache hit ratio is low');
        }

    } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        recommendations.push(`Memory system diagnostic failed: ${lastError}`);
        memorySystemHealthy = false;
    }

    return {
        memorySystemHealthy,
        recommendations,
        lastError
    };
}