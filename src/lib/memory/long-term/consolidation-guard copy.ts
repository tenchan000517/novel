// src/lib/memory/long-term/consolidation-guard.ts
/**
 * @fileoverview 統合処理ガード - 無限ループ完全防止システム（強化版）
 * @description
 * 全ての統合処理（consolidation）を一元管理し、無限ループを完全に防止する
 * TypeScript安全性とパフォーマンス最適化を含む
 */

import { logger } from '@/lib/utils/logger';

interface ConsolidationProcess {
    id: string;
    callerId: string;
    startTime: number;
    parentProcess?: string;
    priority: number;
    retryCount: number;
}

interface GuardStatus {
    isRunning: boolean;
    currentProcess: ConsolidationProcess | null;
    runTime: number;
    callStack: string[];
    blockedCalls: number;
    queueLength: number;
    lastActivity: string;
}

interface GuardStatistics {
    totalBlockedCalls: number;
    totalSuccessfulCalls: number;
    totalFailedCalls: number;
    currentCallStackDepth: number;
    averageProcessingTime: number;
    peakCallStackDepth: number;
    isHealthy: boolean;
    recommendations: string[];
    uptime: number;
    lastOptimization: string;
}

interface QueuedConsolidation {
    id: string;
    callerId: string;
    priority: number;
    retryCount: number;
    queuedAt: number;
    operation: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
}

/**
 * @class ConsolidationGuard
 * @description
 * シングルトンパターンで統合処理を制御し、無限ループを完全に防止
 * 強化版: キューイング、優先度制御、統計情報、自動最適化を含む
 */
class ConsolidationGuard {
    private static instance: ConsolidationGuard;
    private currentProcess: ConsolidationProcess | null = null;
    private callStack: Set<string> = new Set();
    private processQueue: QueuedConsolidation[] = [];
    private isProcessingQueue: boolean = false;
    
    // 統計情報
    private statistics = {
        totalBlockedCalls: 0,
        totalSuccessfulCalls: 0,
        totalFailedCalls: 0,
        peakCallStackDepth: 0,
        totalProcessingTime: 0,
        startTime: Date.now(),
        lastOptimization: new Date().toISOString()
    };
    
    // 設定値
    private readonly TIMEOUT_MS = 60000; // 60秒タイムアウト
    private readonly MAX_CALL_STACK_DEPTH = 5; // 最大呼び出しスタック深度
    private readonly MAX_QUEUE_SIZE = 50; // 最大キューサイズ
    private readonly MAX_RETRY_COUNT = 3; // 最大リトライ回数
    private readonly QUEUE_PROCESSING_INTERVAL = 100; // キュー処理間隔（ms）

    // 自動クリーンアップタイマー
    private cleanupTimer: NodeJS.Timeout | null = null;
    private readonly CLEANUP_INTERVAL = 60000; // 1分間隔でクリーンアップ

    private constructor() {
        logger.debug('ConsolidationGuard singleton created with enhanced features');
        this.startCleanupTimer();
    }

    /**
     * シングルトンインスタンスの取得
     */
    static getInstance(): ConsolidationGuard {
        if (!ConsolidationGuard.instance) {
            ConsolidationGuard.instance = new ConsolidationGuard();
        }
        return ConsolidationGuard.instance;
    }

    /**
     * 統合処理開始の可否チェック（強化版）
     */
    canStartConsolidation(
        callerId: string, 
        parentProcess?: string,
        priority: number = 5
    ): { 
        allowed: boolean; 
        reason: string;
        recommendedAction?: string;
        queuePosition?: number;
    } {
        // タイムアウトチェック
        if (this.currentProcess && this.isTimeout()) {
            logger.warn('ConsolidationGuard: Timeout detected, forcing release', {
                processId: this.currentProcess.id,
                runTime: Date.now() - this.currentProcess.startTime
            });
            this.forceRelease();
        }

        // 既存プロセスチェック
        if (this.currentProcess) {
            this.statistics.totalBlockedCalls++;
            
            // 高優先度の場合はキューに追加
            if (priority >= 8) {
                return {
                    allowed: false,
                    reason: `High priority consolidation queued (current: ${this.currentProcess.id}, caller: ${this.currentProcess.callerId})`,
                    recommendedAction: 'queue_for_high_priority',
                    queuePosition: this.calculateQueuePosition(priority)
                };
            }
            
            return {
                allowed: false,
                reason: `Consolidation already running (ID: ${this.currentProcess.id}, caller: ${this.currentProcess.callerId})`,
                recommendedAction: 'wait_for_completion'
            };
        }

        // 再帰呼び出しチェック
        if (this.callStack.has(callerId)) {
            this.statistics.totalBlockedCalls++;
            return {
                allowed: false,
                reason: `Recursive call detected for ${callerId}`,
                recommendedAction: 'skip_execution'
            };
        }

        // 呼び出しスタック深度チェック
        if (this.callStack.size >= this.MAX_CALL_STACK_DEPTH) {
            this.statistics.totalBlockedCalls++;
            return {
                allowed: false,
                reason: `Maximum call stack depth exceeded (${this.callStack.size}/${this.MAX_CALL_STACK_DEPTH})`,
                recommendedAction: 'reduce_nesting'
            };
        }

        return { 
            allowed: true, 
            reason: 'All checks passed',
            recommendedAction: 'proceed'
        };
    }

    /**
     * 統合処理の開始（強化版）
     */
    startConsolidation(
        callerId: string, 
        parentProcess?: string,
        priority: number = 5
    ): string {
        const processId = `${callerId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        this.currentProcess = {
            id: processId,
            callerId,
            startTime: Date.now(),
            parentProcess,
            priority,
            retryCount: 0
        };

        this.callStack.add(callerId);
        
        // 統計情報の更新
        if (this.callStack.size > this.statistics.peakCallStackDepth) {
            this.statistics.peakCallStackDepth = this.callStack.size;
        }

        logger.info('ConsolidationGuard: Process started', {
            processId,
            callerId,
            parentProcess,
            priority,
            callStackSize: this.callStack.size
        });

        return processId;
    }

    /**
     * 統合処理の終了（強化版）
     */
    endConsolidation(processId: string, callerId: string): boolean {
        if (!this.currentProcess) {
            logger.warn('ConsolidationGuard: No active process to end', { processId, callerId });
            return false;
        }

        if (this.currentProcess.id !== processId) {
            logger.warn('ConsolidationGuard: Process ID mismatch on end', {
                expected: this.currentProcess.id,
                received: processId,
                callerId
            });
            return false;
        }

        const runTime = Date.now() - this.currentProcess.startTime;
        
        // 統計情報の更新
        this.statistics.totalSuccessfulCalls++;
        this.statistics.totalProcessingTime += runTime;
        
        logger.info('ConsolidationGuard: Process ended', {
            processId,
            callerId,
            runTime,
            callStackSize: this.callStack.size - 1
        });

        this.callStack.delete(callerId);
        this.currentProcess = null;

        // キューの処理を開始
        this.processNextInQueue();

        return true;
    }

    /**
     * 優先度付きキューイングシステム
     */
    async queueConsolidation<T>(
        callerId: string,
        operation: () => Promise<T>,
        priority: number = 5,
        parentProcess?: string
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            if (this.processQueue.length >= this.MAX_QUEUE_SIZE) {
                reject(new Error('ConsolidationGuard: Queue is full'));
                return;
            }

            const queuedConsolidation: QueuedConsolidation = {
                id: `queued-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                callerId,
                priority,
                retryCount: 0,
                queuedAt: Date.now(),
                operation,
                resolve,
                reject
            };

            // 優先度順でキューに挿入
            this.insertByPriority(queuedConsolidation);

            logger.debug('ConsolidationGuard: Operation queued', {
                id: queuedConsolidation.id,
                callerId,
                priority,
                queuePosition: this.processQueue.length
            });

            // キュー処理が停止している場合は開始
            if (!this.isProcessingQueue) {
                this.processNextInQueue();
            }
        });
    }

    /**
     * 強制解除（緊急時用）
     */
    forceRelease(): void {
        const oldProcess = this.currentProcess;
        
        if (oldProcess) {
            this.statistics.totalFailedCalls++;
        }
        
        this.currentProcess = null;
        this.callStack.clear();
        
        logger.warn('ConsolidationGuard: Force released all locks', {
            releasedProcess: oldProcess?.id,
            releasedCaller: oldProcess?.callerId,
            runTime: oldProcess ? Date.now() - oldProcess.startTime : 0
        });

        // 失敗したキューアイテムの処理
        this.processNextInQueue();
    }

    /**
     * キューの完全クリア
     */
    clearQueue(): void {
        const queueLength = this.processQueue.length;
        
        // 待機中の全operationをreject
        this.processQueue.forEach(item => {
            item.reject(new Error('ConsolidationGuard: Queue cleared'));
        });
        
        this.processQueue = [];
        this.isProcessingQueue = false;
        
        logger.warn('ConsolidationGuard: Queue cleared', { clearedItems: queueLength });
    }

    /**
     * システム最適化
     */
    async optimizeSystem(): Promise<{
        optimized: boolean;
        improvements: string[];
        statistics: GuardStatistics;
    }> {
        const improvements: string[] = [];
        
        // 古いキューアイテムの削除
        const now = Date.now();
        const oldQueueLength = this.processQueue.length;
        this.processQueue = this.processQueue.filter(item => {
            const age = now - item.queuedAt;
            return age < 300000; // 5分以上古いものは削除
        });
        
        if (this.processQueue.length < oldQueueLength) {
            improvements.push(`Removed ${oldQueueLength - this.processQueue.length} stale queue items`);
        }

        // 統計のリセット（オプション）
        if (this.statistics.totalBlockedCalls > 10000) {
            this.statistics.totalBlockedCalls = Math.floor(this.statistics.totalBlockedCalls / 2);
            improvements.push('Reset excessive blocked calls counter');
        }

        this.statistics.lastOptimization = new Date().toISOString();
        
        logger.info('ConsolidationGuard: System optimized', { improvements });
        
        return {
            optimized: improvements.length > 0,
            improvements,
            statistics: this.getStatistics()
        };
    }

    /**
     * タイムアウトチェック
     */
    private isTimeout(): boolean {
        if (!this.currentProcess) return false;
        return (Date.now() - this.currentProcess.startTime) > this.TIMEOUT_MS;
    }

    /**
     * キュー位置の計算
     */
    private calculateQueuePosition(priority: number): number {
        let position = 0;
        for (const item of this.processQueue) {
            if (item.priority <= priority) {
                position++;
            }
        }
        return position;
    }

    /**
     * 優先度順でキューに挿入
     */
    private insertByPriority(item: QueuedConsolidation): void {
        let insertIndex = this.processQueue.length;
        
        for (let i = 0; i < this.processQueue.length; i++) {
            if (this.processQueue[i].priority < item.priority) {
                insertIndex = i;
                break;
            }
        }
        
        this.processQueue.splice(insertIndex, 0, item);
    }

    /**
     * キューの次のアイテムを処理
     */
    private async processNextInQueue(): Promise<void> {
        if (this.isProcessingQueue || this.processQueue.length === 0 || this.currentProcess) {
            return;
        }

        this.isProcessingQueue = true;

        try {
            while (this.processQueue.length > 0 && !this.currentProcess) {
                const item = this.processQueue.shift()!;
                
                try {
                    // リトライ制限チェック
                    if (item.retryCount >= this.MAX_RETRY_COUNT) {
                        item.reject(new Error('ConsolidationGuard: Maximum retry count exceeded'));
                        continue;
                    }

                    // 実行可能性チェック
                    const check = this.canStartConsolidation(item.callerId, undefined, item.priority);
                    
                    if (check.allowed) {
                        const processId = this.startConsolidation(item.callerId, undefined, item.priority);
                        
                        try {
                            const result = await item.operation();
                            this.endConsolidation(processId, item.callerId);
                            item.resolve(result);
                        } catch (error) {
                            this.endConsolidation(processId, item.callerId);
                            
                            // リトライ処理
                            if (item.retryCount < this.MAX_RETRY_COUNT) {
                                item.retryCount++;
                                this.insertByPriority(item);
                                logger.debug('ConsolidationGuard: Retrying operation', {
                                    id: item.id,
                                    retryCount: item.retryCount
                                });
                            } else {
                                item.reject(error);
                            }
                        }
                    } else {
                        // 実行できない場合は再キュー
                        this.insertByPriority(item);
                        break; // 他のアイテムも同様に実行できない可能性が高い
                    }
                } catch (error) {
                    item.reject(error);
                }

                // 過負荷防止のための小休止
                if (this.processQueue.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, this.QUEUE_PROCESSING_INTERVAL));
                }
            }
        } finally {
            this.isProcessingQueue = false;
        }

        // キューに残りがある場合は少し後に再処理
        if (this.processQueue.length > 0) {
            setTimeout(() => this.processNextInQueue(), this.QUEUE_PROCESSING_INTERVAL * 2);
        }
    }

    /**
     * 自動クリーンアップタイマーの開始
     */
    private startCleanupTimer(): void {
        this.cleanupTimer = setInterval(() => {
            this.performAutomaticCleanup();
        }, this.CLEANUP_INTERVAL);
    }

    /**
     * 自動クリーンアップの実行
     */
    private performAutomaticCleanup(): void {
        const now = Date.now();
        
        // タイムアウトプロセスのチェック
        if (this.currentProcess && this.isTimeout()) {
            logger.warn('ConsolidationGuard: Auto cleanup - timeout detected');
            this.forceRelease();
        }

        // 古いキューアイテムの削除
        const originalLength = this.processQueue.length;
        this.processQueue = this.processQueue.filter(item => {
            const age = now - item.queuedAt;
            if (age > 600000) { // 10分以上古い
                item.reject(new Error('ConsolidationGuard: Item expired in queue'));
                return false;
            }
            return true;
        });

        if (this.processQueue.length < originalLength) {
            logger.debug('ConsolidationGuard: Auto cleanup removed expired queue items', {
                removed: originalLength - this.processQueue.length
            });
        }
    }

    /**
     * 状態取得（強化版）
     */
    getStatus(): GuardStatus {
        return {
            isRunning: this.currentProcess !== null,
            currentProcess: this.currentProcess ? { ...this.currentProcess } : null,
            runTime: this.currentProcess ? Date.now() - this.currentProcess.startTime : 0,
            callStack: Array.from(this.callStack),
            blockedCalls: this.statistics.totalBlockedCalls,
            queueLength: this.processQueue.length,
            lastActivity: this.currentProcess?.startTime ? new Date(this.currentProcess.startTime).toISOString() : ''
        };
    }

    /**
     * 統計情報取得（強化版）
     */
    getStatistics(): GuardStatistics {
        const recommendations: string[] = [];
        const uptime = Date.now() - this.statistics.startTime;
        const averageProcessingTime = this.statistics.totalSuccessfulCalls > 0 
            ? this.statistics.totalProcessingTime / this.statistics.totalSuccessfulCalls 
            : 0;

        // 推奨事項の生成
        if (this.statistics.totalBlockedCalls > 20) {
            recommendations.push('High number of blocked calls detected - check for excessive consolidation requests');
        }

        if (this.callStack.size > 3) {
            recommendations.push('Deep call stack detected - review consolidation call hierarchy');
        }

        if (this.processQueue.length > 10) {
            recommendations.push('Large queue detected - consider increasing processing capacity');
        }

        if (this.currentProcess && this.isTimeout()) {
            recommendations.push('Long-running process detected - consider process optimization');
        }

        if (averageProcessingTime > 5000) {
            recommendations.push('High average processing time - consider performance optimization');
        }

        const isHealthy = this.statistics.totalBlockedCalls < 10 && 
                         this.callStack.size < 3 && 
                         this.processQueue.length < 5 &&
                         !this.isTimeout();

        return {
            totalBlockedCalls: this.statistics.totalBlockedCalls,
            totalSuccessfulCalls: this.statistics.totalSuccessfulCalls,
            totalFailedCalls: this.statistics.totalFailedCalls,
            currentCallStackDepth: this.callStack.size,
            averageProcessingTime,
            peakCallStackDepth: this.statistics.peakCallStackDepth,
            isHealthy,
            recommendations,
            uptime,
            lastOptimization: this.statistics.lastOptimization
        };
    }

    /**
     * デバッグ情報出力（強化版）
     */
    debugInfo(): void {
        const status = this.getStatus();
        const stats = this.getStatistics();

        console.log('=== ConsolidationGuard Enhanced Debug Info ===');
        console.log('Status:', status);
        console.log('Statistics:', stats);
        console.log('Queue Status:', {
            length: this.processQueue.length,
            isProcessing: this.isProcessingQueue,
            items: this.processQueue.map(item => ({
                id: item.id,
                callerId: item.callerId,
                priority: item.priority,
                retryCount: item.retryCount,
                waitTime: Date.now() - item.queuedAt
            }))
        });
        console.log('==============================================');
    }

    /**
     * リセット（テスト用）
     */
    reset(): void {
        this.currentProcess = null;
        this.callStack.clear();
        this.clearQueue();
        
        // 統計のリセット
        this.statistics = {
            totalBlockedCalls: 0,
            totalSuccessfulCalls: 0,
            totalFailedCalls: 0,
            peakCallStackDepth: 0,
            totalProcessingTime: 0,
            startTime: Date.now(),
            lastOptimization: new Date().toISOString()
        };
        
        logger.debug('ConsolidationGuard: Reset completed');
    }

    /**
     * シャットダウン処理
     */
    shutdown(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        
        this.clearQueue();
        this.forceRelease();
        
        logger.info('ConsolidationGuard: Shutdown completed');
    }
}

// ヘルパー関数（強化版）
export function withConsolidationGuard<T>(
    callerId: string,
    operation: () => Promise<T>,
    parentProcess?: string,
    priority: number = 5
): Promise<T> {
    const guard = ConsolidationGuard.getInstance();
    const check = guard.canStartConsolidation(callerId, parentProcess, priority);

    if (!check.allowed) {
        logger.debug(`ConsolidationGuard: Operation blocked for ${callerId}`, {
            reason: check.reason,
            recommendation: check.recommendedAction
        });
        
        // 高優先度の場合はキューイング
        if (priority >= 8 && check.recommendedAction === 'queue_for_high_priority') {
            return guard.queueConsolidation(callerId, operation, priority, parentProcess);
        }
        
        return Promise.resolve(null as any);
    }

    const processId = guard.startConsolidation(callerId, parentProcess, priority);

    return operation()
        .then(result => {
            guard.endConsolidation(processId, callerId);
            return result;
        })
        .catch(error => {
            guard.endConsolidation(processId, callerId);
            throw error;
        });
}

export { ConsolidationGuard };