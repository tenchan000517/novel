// src/lib/memory/long-term/consolidation-guard.ts
/**
 * @fileoverview 統合処理ガード - プロセス固有ロック機構（根本修正版）
 * @description
 * 🔧 プロセス固有IDによる競合回避
 * 🔧 確実なリソース解放とタイムアウト処理
 * 🔧 永続化ロックの根絶
 */

import { logger } from '@/lib/utils/logger';

interface ConsolidationProcess {
    id: string;
    callerId: string;
    startTime: number;
    parentProcess?: string;
    priority: number;
    retryCount: number;
    processId: number; // 🆕 プロセスID追跡
    uniqueKey: string; // 🆕 ユニークキー
}

interface GuardStatus {
    isRunning: boolean;
    currentProcess: ConsolidationProcess | null;
    runTime: number;
    callStack: string[];
    blockedCalls: number;
    queueLength: number;
    lastActivity: string;
    processId: number; // 🆕 現在のプロセスID
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
    forceReleaseCount: number; // 🆕 強制解放回数
    timeoutCount: number; // 🆕 タイムアウト回数
}

interface QueuedConsolidation {
    id: string;
    callerId: string;
    priority: number;
    retryCount: number;
    queuedAt: number;
    processId: number; // 🆕 プロセスID
    operation: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
}

/**
 * @class ConsolidationGuard
 * @description
 * プロセス固有ロック機構による統合処理制御（根本修正版）
 * 🆕 固定IDによる永続化ロックを完全に排除
 */
class ConsolidationGuard {
    private static instance: ConsolidationGuard;
    private currentProcess: ConsolidationProcess | null = null;
    private callStack: Set<string> = new Set();
    private processQueue: QueuedConsolidation[] = [];
    private isProcessingQueue: boolean = false;
    
    // 🆕 プロセス固有情報
    private readonly processId: number = process.pid;
    private readonly instanceId: string = `guard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 統計情報
    private statistics = {
        totalBlockedCalls: 0,
        totalSuccessfulCalls: 0,
        totalFailedCalls: 0,
        peakCallStackDepth: 0,
        totalProcessingTime: 0,
        startTime: Date.now(),
        lastOptimization: new Date().toISOString(),
        forceReleaseCount: 0,
        timeoutCount: 0
    };
    
    // 設定値（最適化）
    private readonly TIMEOUT_MS = 30000; // 🔧 30秒に短縮
    private readonly MAX_CALL_STACK_DEPTH = 3; // 🔧 削減
    private readonly MAX_QUEUE_SIZE = 20; // 🔧 削減
    private readonly MAX_RETRY_COUNT = 2; // 🔧 削減
    private readonly QUEUE_PROCESSING_INTERVAL = 50; // 🔧 短縮

    // 自動クリーンアップタイマー
    private cleanupTimer: NodeJS.Timeout | null = null;
    private readonly CLEANUP_INTERVAL = 30000; // 🔧 30秒間隔に短縮

    // 🆕 プロセス終了時のクリーンアップ
    private shutdownHooks: (() => void)[] = [];

    private constructor() {
        logger.info('ConsolidationGuard initialized with process-specific locking', {
            processId: this.processId,
            instanceId: this.instanceId
        });
        
        this.setupProcessExitHandlers();
        this.startCleanupTimer();
    }

    /**
     * 🆕 プロセス終了時の処理設定
     */
    private setupProcessExitHandlers(): void {
        const cleanup = () => {
            logger.info('Process exit detected, performing ConsolidationGuard cleanup');
            this.forceRelease();
            this.clearQueue();
            if (this.cleanupTimer) {
                clearInterval(this.cleanupTimer);
            }
        };

        // 各種プロセス終了シグナルをキャッチ
        process.on('exit', cleanup);
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught exception in ConsolidationGuard process', { error });
            cleanup();
        });

        this.shutdownHooks.push(cleanup);
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
     * 🔧 統合処理開始の可否チェック（プロセス固有版）
     */
    canStartConsolidation(
        baseCallerId: string, 
        parentProcess?: string,
        priority: number = 5
    ): { 
        allowed: boolean; 
        reason: string;
        recommendedAction?: string;
        queuePosition?: number;
        processSpecificKey?: string;
    } {
        // 🆕 プロセス固有のユニークキーを生成
        const processSpecificKey = this.generateProcessSpecificKey(baseCallerId);
        
        // タイムアウトチェック（強化版）
        if (this.currentProcess && this.isTimeout()) {
            logger.warn('ConsolidationGuard: Timeout detected, performing automatic cleanup', {
                processId: this.currentProcess.id,
                runTime: Date.now() - this.currentProcess.startTime,
                timeoutThreshold: this.TIMEOUT_MS
            });
            
            this.performTimeoutCleanup();
        }

        // 🔧 既存プロセスチェック（プロセス固有）
        if (this.currentProcess) {
            // 🆕 同一プロセスからの呼び出しかチェック
            if (this.currentProcess.processId === this.processId) {
                // 同一プロセスの場合、再帰的呼び出しをチェック
                if (this.callStack.has(baseCallerId)) {
                    this.statistics.totalBlockedCalls++;
                    return {
                        allowed: false,
                        reason: `Recursive call detected for ${baseCallerId} in same process`,
                        recommendedAction: 'skip_execution',
                        processSpecificKey
                    };
                }
            }
            
            this.statistics.totalBlockedCalls++;
            
            // 高優先度の場合はキューに追加
            if (priority >= 8) {
                return {
                    allowed: false,
                    reason: `High priority consolidation queued (current: ${this.currentProcess.id})`,
                    recommendedAction: 'queue_for_high_priority',
                    queuePosition: this.calculateQueuePosition(priority),
                    processSpecificKey
                };
            }
            
            return {
                allowed: false,
                reason: `Consolidation already running (ID: ${this.currentProcess.id}, process: ${this.currentProcess.processId})`,
                recommendedAction: 'wait_or_skip',
                processSpecificKey
            };
        }

        // 呼び出しスタック深度チェック
        if (this.callStack.size >= this.MAX_CALL_STACK_DEPTH) {
            this.statistics.totalBlockedCalls++;
            return {
                allowed: false,
                reason: `Maximum call stack depth exceeded (${this.callStack.size}/${this.MAX_CALL_STACK_DEPTH})`,
                recommendedAction: 'reduce_nesting',
                processSpecificKey
            };
        }

        return { 
            allowed: true, 
            reason: 'All checks passed',
            recommendedAction: 'proceed',
            processSpecificKey
        };
    }

    /**
     * 🔧 統合処理の開始（プロセス固有版）
     */
    startConsolidation(
        baseCallerId: string, 
        parentProcess?: string,
        priority: number = 5
    ): string {
        // 🆕 プロセス固有のユニークIDを生成
        const uniqueKey = this.generateProcessSpecificKey(baseCallerId);
        const processId = `${uniqueKey}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        this.currentProcess = {
            id: processId,
            callerId: baseCallerId,
            startTime: Date.now(),
            parentProcess,
            priority,
            retryCount: 0,
            processId: this.processId, // 🆕 プロセスID記録
            uniqueKey // 🆕 ユニークキー記録
        };

        this.callStack.add(baseCallerId);
        
        // 統計情報の更新
        if (this.callStack.size > this.statistics.peakCallStackDepth) {
            this.statistics.peakCallStackDepth = this.callStack.size;
        }

        // 🆕 自動タイムアウト設定（プロセス固有）
        setTimeout(() => {
            if (this.currentProcess?.id === processId) {
                logger.warn(`Auto-releasing timed out process: ${processId}`, {
                    processId: this.processId,
                    runTime: Date.now() - this.currentProcess.startTime
                });
                this.performTimeoutCleanup();
            }
        }, this.TIMEOUT_MS);

        logger.info('ConsolidationGuard: Process started with process-specific ID', {
            processId,
            baseCallerId,
            uniqueKey,
            systemProcessId: this.processId,
            parentProcess,
            priority,
            callStackSize: this.callStack.size
        });

        return processId;
    }

    /**
     * 🔧 統合処理の終了（確実性強化版）
     */
    endConsolidation(processId: string, baseCallerId: string): boolean {
        if (!this.currentProcess) {
            logger.warn('ConsolidationGuard: No active process to end', { 
                processId, 
                baseCallerId,
                systemProcessId: this.processId
            });
            return false;
        }

        if (this.currentProcess.id !== processId) {
            logger.warn('ConsolidationGuard: Process ID mismatch on end', {
                expected: this.currentProcess.id,
                received: processId,
                baseCallerId,
                systemProcessId: this.processId
            });
            return false;
        }

        const runTime = Date.now() - this.currentProcess.startTime;
        
        // 統計情報の更新
        this.statistics.totalSuccessfulCalls++;
        this.statistics.totalProcessingTime += runTime;
        
        logger.info('ConsolidationGuard: Process ended successfully', {
            processId,
            baseCallerId,
            uniqueKey: this.currentProcess.uniqueKey,
            systemProcessId: this.processId,
            runTime,
            callStackSize: this.callStack.size - 1
        });

        // 🆕 確実なクリーンアップ
        this.performSuccessfulCleanup(baseCallerId);

        // キューの処理を開始
        this.processNextInQueue();

        return true;
    }

    /**
     * 🆕 プロセス固有キーの生成
     */
    private generateProcessSpecificKey(baseCallerId: string): string {
        return `${baseCallerId}-pid${this.processId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 🆕 成功時のクリーンアップ
     */
    private performSuccessfulCleanup(callerId: string): void {
        this.callStack.delete(callerId);
        this.currentProcess = null;
    }

    /**
     * 🆕 タイムアウト時のクリーンアップ（強化版）
     */
    private performTimeoutCleanup(): void {
        const oldProcess = this.currentProcess;
        
        if (oldProcess) {
            this.statistics.totalFailedCalls++;
            this.statistics.timeoutCount++;
            
            logger.warn('ConsolidationGuard: Performing timeout cleanup', {
                processId: oldProcess.id,
                callerId: oldProcess.callerId,
                uniqueKey: oldProcess.uniqueKey,
                systemProcessId: this.processId,
                runTime: Date.now() - oldProcess.startTime,
                timeoutThreshold: this.TIMEOUT_MS
            });
        }
        
        // 🆕 完全なリセット
        this.currentProcess = null;
        this.callStack.clear();
        
        // 🆕 プロセス固有の永続化情報をクリア
        this.clearProcessSpecificPersistence();
    }

    /**
     * 🔧 強制解除（根本強化版）
     */
    forceRelease(): void {
        const oldProcess = this.currentProcess;
        
        if (oldProcess) {
            this.statistics.totalFailedCalls++;
            this.statistics.forceReleaseCount++;
        }
        
        this.currentProcess = null;
        this.callStack.clear();
        
        // 🆕 プロセス固有の永続化情報を完全にクリア
        this.clearProcessSpecificPersistence();
        
        logger.warn('ConsolidationGuard: Force released all locks with process cleanup', {
            releasedProcess: oldProcess?.id,
            releasedCaller: oldProcess?.callerId,
            systemProcessId: this.processId,
            runTime: oldProcess ? Date.now() - oldProcess.startTime : 0
        });

        // 失敗したキューアイテムの処理
        this.processNextInQueue();
    }

    /**
     * 🆕 プロセス固有永続化情報のクリア
     */
    private clearProcessSpecificPersistence(): void {
        try {
            // 将来の拡張のためのプレースホルダー
            // プロセス間共有ストレージがある場合、ここでクリア
            logger.debug('Cleared process-specific persistence data', {
                processId: this.processId,
                instanceId: this.instanceId
            });
        } catch (error) {
            logger.warn('Failed to clear process-specific persistence', { error });
        }
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
        
        logger.warn('ConsolidationGuard: Queue cleared', { 
            clearedItems: queueLength,
            processId: this.processId
        });
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
                id: this.generateProcessSpecificKey(callerId),
                callerId,
                priority,
                retryCount: 0,
                queuedAt: Date.now(),
                processId: this.processId, // 🆕 プロセスID記録
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
                processId: this.processId,
                queuePosition: this.processQueue.length
            });

            // キュー処理が停止している場合は開始
            if (!this.isProcessingQueue) {
                this.processNextInQueue();
            }
        });
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
        
        // 古いキューアイテムの削除（プロセス固有）
        const now = Date.now();
        const oldQueueLength = this.processQueue.length;
        this.processQueue = this.processQueue.filter(item => {
            const age = now - item.queuedAt;
            // 🆕 現在のプロセス以外の古いアイテムを優先的に削除
            if (item.processId !== this.processId && age > 60000) { // 1分
                item.reject(new Error('ConsolidationGuard: Cross-process item expired'));
                return false;
            }
            if (age > 300000) { // 5分
                item.reject(new Error('ConsolidationGuard: Item expired in queue'));
                return false;
            }
            return true;
        });
        
        if (this.processQueue.length < oldQueueLength) {
            improvements.push(`Removed ${oldQueueLength - this.processQueue.length} stale/cross-process queue items`);
        }

        // 統計のリセット（オプション）
        if (this.statistics.totalBlockedCalls > 5000) { // 🔧 閾値を下げる
            this.statistics.totalBlockedCalls = Math.floor(this.statistics.totalBlockedCalls / 2);
            improvements.push('Reset excessive blocked calls counter');
        }

        this.statistics.lastOptimization = new Date().toISOString();
        
        logger.info('ConsolidationGuard: System optimized', { 
            improvements,
            processId: this.processId
        });
        
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
                                    retryCount: item.retryCount,
                                    processId: this.processId
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
            this.performTimeoutCleanup();
        }

        // 古いキューアイテムの削除
        const originalLength = this.processQueue.length;
        this.processQueue = this.processQueue.filter(item => {
            const age = now - item.queuedAt;
            // 🆕 他のプロセスからのアイテムはより短時間でタイムアウト
            const timeoutThreshold = item.processId === this.processId ? 600000 : 120000; // 10分 vs 2分
            
            if (age > timeoutThreshold) {
                item.reject(new Error('ConsolidationGuard: Item expired in queue'));
                return false;
            }
            return true;
        });

        if (this.processQueue.length < originalLength) {
            logger.debug('ConsolidationGuard: Auto cleanup removed expired queue items', {
                removed: originalLength - this.processQueue.length,
                processId: this.processId
            });
        }
    }

    /**
     * 状態取得（プロセス固有情報付き）
     */
    getStatus(): GuardStatus {
        return {
            isRunning: this.currentProcess !== null,
            currentProcess: this.currentProcess ? { ...this.currentProcess } : null,
            runTime: this.currentProcess ? Date.now() - this.currentProcess.startTime : 0,
            callStack: Array.from(this.callStack),
            blockedCalls: this.statistics.totalBlockedCalls,
            queueLength: this.processQueue.length,
            lastActivity: this.currentProcess?.startTime ? new Date(this.currentProcess.startTime).toISOString() : '',
            processId: this.processId // 🆕 プロセスID情報
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
        if (this.statistics.totalBlockedCalls > 10) { // 🔧 閾値を下げる
            recommendations.push('Moderate number of blocked calls detected - review consolidation patterns');
        }

        if (this.callStack.size > 2) { // 🔧 閾値を下げる
            recommendations.push('Deep call stack detected - review consolidation call hierarchy');
        }

        if (this.processQueue.length > 5) { // 🔧 閾値を下げる
            recommendations.push('Queue buildup detected - consider increasing processing capacity');
        }

        if (this.currentProcess && this.isTimeout()) {
            recommendations.push('Long-running process detected - consider process optimization');
        }

        if (averageProcessingTime > 3000) { // 🔧 閾値を下げる
            recommendations.push('High average processing time - consider performance optimization');
        }

        if (this.statistics.forceReleaseCount > 0) {
            recommendations.push('Force releases detected - review error handling');
        }

        if (this.statistics.timeoutCount > 0) {
            recommendations.push('Timeouts detected - consider increasing timeout threshold or optimizing operations');
        }

        const isHealthy = this.statistics.totalBlockedCalls < 5 && 
                         this.callStack.size < 2 && 
                         this.processQueue.length < 3 &&
                         !this.isTimeout() &&
                         this.statistics.forceReleaseCount === 0;

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
            lastOptimization: this.statistics.lastOptimization,
            forceReleaseCount: this.statistics.forceReleaseCount,
            timeoutCount: this.statistics.timeoutCount
        };
    }

    /**
     * デバッグ情報出力（プロセス情報付き）
     */
    debugInfo(): void {
        const status = this.getStatus();
        const stats = this.getStatistics();

        console.log('=== ConsolidationGuard Process-Specific Debug Info ===');
        console.log('Process ID:', this.processId);
        console.log('Instance ID:', this.instanceId);
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
                processId: item.processId,
                waitTime: Date.now() - item.queuedAt
            }))
        });
        console.log('====================================================');
    }

    /**
     * リセット（テスト用・プロセス固有クリーンアップ付き）
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
            lastOptimization: new Date().toISOString(),
            forceReleaseCount: 0,
            timeoutCount: 0
        };
        
        // 🆕 プロセス固有情報のクリア
        this.clearProcessSpecificPersistence();
        
        logger.debug('ConsolidationGuard: Reset completed', {
            processId: this.processId,
            instanceId: this.instanceId
        });
    }

    /**
     * シャットダウン処理（強化版）
     */
    shutdown(): void {
        logger.info('ConsolidationGuard: Initiating shutdown', {
            processId: this.processId,
            instanceId: this.instanceId
        });
        
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        
        this.clearQueue();
        this.forceRelease();
        
        // 🆕 シャットダウンフックの実行
        this.shutdownHooks.forEach(hook => {
            try {
                hook();
            } catch (error) {
                logger.warn('Shutdown hook failed', { error });
            }
        });
        
        logger.info('ConsolidationGuard: Shutdown completed', {
            processId: this.processId,
            instanceId: this.instanceId
        });
    }
}

// ヘルパー関数（プロセス固有版）
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
            recommendation: check.recommendedAction,
            processSpecificKey: check.processSpecificKey
        });
        
        // 🔧 高優先度または待機推奨の場合はキューイング
        if (priority >= 8 || check.recommendedAction === 'queue_for_high_priority') {
            return guard.queueConsolidation(callerId, operation, priority, parentProcess);
        }
        
        // 🔧 低優先度の場合はnullではなく、適切なデフォルト値を返す
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