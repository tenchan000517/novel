// src/lib/memory/short-term/processing-buffers.ts
/**
 * @fileoverview 統合記憶階層システム - 短期記憶：処理バッファ
 * @description
 * 高コスト処理の中間結果と進行状態を管理する処理バッファシステム。
 * 処理の継続・再開・エラー回復機能を提供し、システム全体の安定性を向上させます。
 */

import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { Chapter } from '@/types/chapters';

/**
 * @interface ProcessingJob
 * @description 処理ジョブの基本情報
 */
interface ProcessingJob {
    jobId: string;
    jobType: string;
    priority: number;
    chapterNumber?: number;
    startTime: string;
    lastUpdateTime: string;
    status: 'queued' | 'processing' | 'suspended' | 'completed' | 'failed';
    progress: number; // 0-100%
    estimatedRemainingTime?: number; // ミリ秒
    resourceUsage: {
        cpuPercent: number;
        memoryMB: number;
        diskIO: number;
    };
    errorInfo?: {
        errorType: string;
        errorMessage: string;
        stackTrace?: string;
        retryCount: number;
        maxRetries: number;
    };
}

/**
 * @interface ProcessingBuffer
 * @description 処理バッファのデータ構造
 */
interface ProcessingBuffer<T> {
    bufferId: string;
    bufferType: string;
    data: T;
    metadata: {
        size: number;
        timestamp: string;
        ttl: number; // 生存時間（ミリ秒）
        accessCount: number;
        lastAccessed: string;
        priority: number;
    };
    dependencies: string[]; // 依存する他のバッファID
    checksum: string; // データ整合性チェック用
}

/**
 * @interface AIProcessingState
 * @description AI処理の状態情報
 */
interface AIProcessingState {
    processingId: string;
    processingType: 'text_analysis' | 'emotional_analysis' | 'context_generation' | 'character_detection';
    inputData: {
        type: string;
        size: number;
        checksum: string;
    };
    processingSteps: Array<{
        stepName: string;
        stepStatus: 'pending' | 'processing' | 'completed' | 'failed';
        startTime?: string;
        endTime?: string;
        intermediateResults?: any;
        resourceUsage?: {
            tokensUsed: number;
            processingTime: number;
            memoryUsed: number;
        };
    }>;
    outputBuffer: {
        partialResults: any[];
        finalResult?: any;
        qualityMetrics?: {
            accuracy: number;
            completeness: number;
            consistency: number;
        };
    };
    retryInfo: {
        retryCount: number;
        maxRetries: number;
        lastRetryTime?: string;
        retryReasons: string[];
    };
    timestamp: string;
}

/**
 * @interface MemoryIntegrationBuffer
 * @description 記憶統合処理のバッファ
 */
interface MemoryIntegrationBuffer {
    integrationId: string;
    integrationType: 'short_to_mid' | 'mid_to_long' | 'cross_layer_sync' | 'full_integration';
    sourceData: {
        layerType: 'short' | 'mid' | 'long';
        dataType: string;
        dataIds: string[];
        totalSize: number;
    };
    integrationSteps: Array<{
        stepName: string;
        stepDescription: string;
        inputSources: string[];
        outputTargets: string[];
        processingFunction: string;
        status: 'pending' | 'processing' | 'completed' | 'failed';
        startTime?: string;
        endTime?: string;
        intermediateData?: any;
        conflictResolutions?: Array<{
            conflictType: string;
            conflictDescription: string;
            resolution: string;
            confidence: number;
        }>;
    }>;
    qualityChecks: {
        dataIntegrity: boolean;
        consistencyCheck: boolean;
        duplicateDetection: boolean;
        relationshipValidation: boolean;
    };
    rollbackData?: {
        canRollback: boolean;
        rollbackPoints: Array<{
            pointId: string;
            timestamp: string;
            description: string;
            dataSnapshot: any;
        }>;
    };
    timestamp: string;
}

/**
 * @interface ChapterProcessingBuffer
 * @description 章処理専用バッファ
 */
interface ChapterProcessingBuffer {
    chapterNumber: number;
    processingPhase: 'pre_analysis' | 'content_analysis' | 'context_integration' | 'post_processing' | 'finalization';
    chapterData: {
        originalChapter: Chapter;
        processedContent?: string;
        extractedMetadata?: any;
        analysisResults?: any;
    };
    processingComponents: {
        textAnalyzer: {
            status: 'pending' | 'processing' | 'completed' | 'failed';
            results?: any;
            processingTime?: number;
        };
        characterExtractor: {
            status: 'pending' | 'processing' | 'completed' | 'failed';
            results?: any;
            processingTime?: number;
        };
        contextGenerator: {
            status: 'pending' | 'processing' | 'completed' | 'failed';
            results?: any;
            processingTime?: number;
        };
        emotionalAnalyzer: {
            status: 'pending' | 'processing' | 'completed' | 'failed';
            results?: any;
            processingTime?: number;
        };
    };
    integrationResults: {
        unifiedAnalysis?: any;
        memoryUpdates?: any;
        cacheUpdates?: any;
        errorCorrections?: any;
    };
    qualityAssurance: {
        overallScore: number;
        componentScores: Record<string, number>;
        validationResults: Array<{
            validationType: string;
            passed: boolean;
            details: string;
        }>;
    };
    timestamp: string;
}

/**
 * @interface ProcessingBufferStatus
 * @description 処理バッファの状態情報
 */
interface ProcessingBufferStatus {
    initialized: boolean;
    activeJobs: number;
    queuedJobs: number;
    completedJobs: number;
    failedJobs: number;
    totalBufferSize: number;
    memoryUsageMB: number;
    avgProcessingTime: number;
    bufferEfficiency: number;
    errorRate: number;
    lastCleanupTime: string | null;
}

/**
 * @class ProcessingBuffers
 * @description
 * 統合記憶階層システムの処理バッファクラス。
 * 高コスト処理の中間結果管理、処理状態追跡、エラー回復機能を提供します।
 */
export class ProcessingBuffers {
    private static readonly MAX_BUFFER_SIZE = 1000;
    private static readonly MAX_JOB_QUEUE_SIZE = 200;
    private static readonly BUFFER_CLEANUP_INTERVAL = 30 * 60 * 1000; // 30分
    private static readonly MAX_RETRY_ATTEMPTS = 3;

    // 🔴 処理ジョブ管理
    private activeJobs: Map<string, ProcessingJob> = new Map();
    private jobQueue: ProcessingJob[] = [];
    private completedJobs: Map<string, ProcessingJob> = new Map();

    // 🔴 処理バッファ管理
    private aiProcessingBuffers: Map<string, ProcessingBuffer<AIProcessingState>> = new Map();
    private memoryIntegrationBuffers: Map<string, ProcessingBuffer<MemoryIntegrationBuffer>> = new Map();
    private chapterProcessingBuffers: Map<number, ProcessingBuffer<ChapterProcessingBuffer>> = new Map();

    // 🔴 汎用データバッファ
    private genericBuffers: Map<string, ProcessingBuffer<any>> = new Map();

    // 統計情報
    private processingStats = {
        totalJobsProcessed: 0,
        totalProcessingTime: 0,
        averageJobTime: 0,
        errorCount: 0,
        retryCount: 0,
        bufferHits: 0,
        bufferMisses: 0
    };

    private initialized: boolean = false;
    private cleanupTimer: NodeJS.Timeout | null = null;
    private processingTimer: NodeJS.Timeout | null = null;

    constructor() {}

    /**
     * 初期化処理を実行
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('ProcessingBuffers already initialized');
            return;
        }

        try {
            // ストレージから状態を復元
            await this.loadFromStorage();

            // 定期クリーンアップを開始
            this.startCleanupTimer();

            // 処理ジョブのモニタリングを開始
            this.startJobProcessingMonitor();

            this.initialized = true;
            logger.info('ProcessingBuffers initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize ProcessingBuffers', {
                error: error instanceof Error ? error.message : String(error)
            });
            this.initialized = true;
        }
    }

    /**
     * クリーンアップタイマーを開始
     * @private
     */
    private startCleanupTimer(): void {
        this.cleanupTimer = setInterval(() => {
            this.performCleanup();
        }, ProcessingBuffers.BUFFER_CLEANUP_INTERVAL);
    }

    /**
     * ジョブ処理モニタリングを開始
     * @private
     */
    private startJobProcessingMonitor(): void {
        this.processingTimer = setInterval(() => {
            this.processJobQueue();
        }, 5000); // 5秒間隔
    }

    // ============================================================================
    // 🔴 ジョブ管理機能
    // ============================================================================

    /**
     * 処理ジョブを作成
     * @param jobType ジョブタイプ
     * @param priority 優先度
     * @param chapterNumber 章番号（オプション）
     * @returns ジョブID
     */
    async createProcessingJob(
        jobType: string,
        priority: number = 5,
        chapterNumber?: number
    ): Promise<string> {
        const jobId = `job-${jobType}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        const job: ProcessingJob = {
            jobId,
            jobType,
            priority,
            chapterNumber,
            startTime: new Date().toISOString(),
            lastUpdateTime: new Date().toISOString(),
            status: 'queued',
            progress: 0,
            resourceUsage: {
                cpuPercent: 0,
                memoryMB: 0,
                diskIO: 0
            }
        };

        // 優先度順にキューに挿入
        this.insertJobInQueue(job);
        
        logger.debug(`Created processing job: ${jobId}`);
        return jobId;
    }

    /**
     * ジョブをキューに挿入（優先度順）
     * @private
     * @param job 処理ジョブ
     */
    private insertJobInQueue(job: ProcessingJob): void {
        // 優先度の高い順に挿入
        let insertIndex = 0;
        for (let i = 0; i < this.jobQueue.length; i++) {
            if (this.jobQueue[i].priority <= job.priority) {
                insertIndex = i;
                break;
            }
            insertIndex = i + 1;
        }

        this.jobQueue.splice(insertIndex, 0, job);

        // キューサイズ制限
        if (this.jobQueue.length > ProcessingBuffers.MAX_JOB_QUEUE_SIZE) {
            this.jobQueue = this.jobQueue.slice(0, ProcessingBuffers.MAX_JOB_QUEUE_SIZE);
        }
    }

    /**
     * ジョブの進捗を更新
     * @param jobId ジョブID
     * @param progress 進捗（0-100）
     * @param resourceUsage リソース使用量
     */
    async updateJobProgress(
        jobId: string,
        progress: number,
        resourceUsage?: Partial<ProcessingJob['resourceUsage']>
    ): Promise<void> {
        const job = this.activeJobs.get(jobId);
        if (!job) {
            logger.warn(`Job not found for progress update: ${jobId}`);
            return;
        }

        job.progress = Math.min(100, Math.max(0, progress));
        job.lastUpdateTime = new Date().toISOString();

        if (resourceUsage) {
            Object.assign(job.resourceUsage, resourceUsage);
        }

        this.activeJobs.set(jobId, job);
        logger.debug(`Updated job progress: ${jobId} - ${progress}%`);
    }

    /**
     * ジョブを完了
     * @param jobId ジョブID
     */
    async completeJob(jobId: string): Promise<void> {
        const job = this.activeJobs.get(jobId);
        if (!job) {
            logger.warn(`Job not found for completion: ${jobId}`);
            return;
        }

        job.status = 'completed';
        job.progress = 100;
        job.lastUpdateTime = new Date().toISOString();

        // アクティブジョブから完了ジョブに移動
        this.activeJobs.delete(jobId);
        this.completedJobs.set(jobId, job);

        // 統計を更新
        this.processingStats.totalJobsProcessed++;
        const processingTime = new Date().getTime() - new Date(job.startTime).getTime();
        this.processingStats.totalProcessingTime += processingTime;
        this.processingStats.averageJobTime = 
            this.processingStats.totalProcessingTime / this.processingStats.totalJobsProcessed;

        logger.info(`Job completed: ${jobId}`);
    }

    /**
     * ジョブを失敗として処理
     * @param jobId ジョブID
     * @param error エラー情報
     */
    async failJob(jobId: string, error: {
        errorType: string;
        errorMessage: string;
        stackTrace?: string;
    }): Promise<void> {
        const job = this.activeJobs.get(jobId);
        if (!job) {
            logger.warn(`Job not found for failure: ${jobId}`);
            return;
        }

        job.status = 'failed';
        job.lastUpdateTime = new Date().toISOString();
        job.errorInfo = {
            ...error,
            retryCount: job.errorInfo?.retryCount || 0,
            maxRetries: ProcessingBuffers.MAX_RETRY_ATTEMPTS
        };

        // リトライ可能かチェック
        const canRetry = job.errorInfo.retryCount < job.errorInfo.maxRetries;
        
        if (canRetry) {
            job.errorInfo.retryCount++;
            job.status = 'queued';
            job.progress = 0;
            
            // キューに再追加
            this.activeJobs.delete(jobId);
            this.insertJobInQueue(job);
            
            this.processingStats.retryCount++;
            logger.warn(`Job failed, retrying: ${jobId} (attempt ${job.errorInfo.retryCount})`);
        } else {
            // 最大リトライ回数に達した場合
            this.activeJobs.delete(jobId);
            this.completedJobs.set(jobId, job);
            
            this.processingStats.errorCount++;
            logger.error(`Job failed permanently: ${jobId}`, error);
        }
    }

    /**
     * ジョブキューを処理
     * @private
     */
    private processJobQueue(): void {
        // アクティブジョブ数制限チェック
        const maxConcurrentJobs = 10;
        const availableSlots = maxConcurrentJobs - this.activeJobs.size;

        if (availableSlots <= 0 || this.jobQueue.length === 0) {
            return;
        }

        // 利用可能なスロット分だけジョブを開始
        for (let i = 0; i < Math.min(availableSlots, this.jobQueue.length); i++) {
            const job = this.jobQueue.shift()!;
            job.status = 'processing';
            job.lastUpdateTime = new Date().toISOString();
            this.activeJobs.set(job.jobId, job);
            
            logger.debug(`Started processing job: ${job.jobId}`);
        }
    }

    // ============================================================================
    // 🔴 AIProcessing バッファ管理
    // ============================================================================

    /**
     * AI処理バッファを作成
     * @param processingType 処理タイプ
     * @param inputData 入力データ
     * @returns 処理ID
     */
    async createAIProcessingBuffer(
        processingType: AIProcessingState['processingType'],
        inputData: any
    ): Promise<string> {
        const processingId = `ai-proc-${processingType}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        const aiProcessingState: AIProcessingState = {
            processingId,
            processingType,
            inputData: {
                type: typeof inputData,
                size: JSON.stringify(inputData).length,
                checksum: this.calculateChecksum(inputData)
            },
            processingSteps: [],
            outputBuffer: {
                partialResults: []
            },
            retryInfo: {
                retryCount: 0,
                maxRetries: ProcessingBuffers.MAX_RETRY_ATTEMPTS,
                retryReasons: []
            },
            timestamp: new Date().toISOString()
        };

        const buffer: ProcessingBuffer<AIProcessingState> = {
            bufferId: processingId,
            bufferType: 'ai_processing',
            data: aiProcessingState,
            metadata: {
                size: JSON.stringify(aiProcessingState).length,
                timestamp: new Date().toISOString(),
                ttl: 2 * 60 * 60 * 1000, // 2時間
                accessCount: 0,
                lastAccessed: new Date().toISOString(),
                priority: 7
            },
            dependencies: [],
            checksum: this.calculateChecksum(aiProcessingState)
        };

        this.aiProcessingBuffers.set(processingId, buffer);
        await this.saveToStorage();

        logger.debug(`Created AI processing buffer: ${processingId}`);
        return processingId;
    }

    /**
     * AI処理ステップを追加
     * @param processingId 処理ID
     * @param stepName ステップ名
     */
    async addAIProcessingStep(processingId: string, stepName: string): Promise<void> {
        const buffer = this.aiProcessingBuffers.get(processingId);
        if (!buffer) {
            logger.warn(`AI processing buffer not found: ${processingId}`);
            return;
        }

        buffer.data.processingSteps.push({
            stepName,
            stepStatus: 'processing',
            startTime: new Date().toISOString()
        });

        buffer.metadata.lastAccessed = new Date().toISOString();
        buffer.metadata.accessCount++;

        this.aiProcessingBuffers.set(processingId, buffer);
        logger.debug(`Added processing step: ${stepName} to ${processingId}`);
    }

    /**
     * AI処理ステップを完了
     * @param processingId 処理ID
     * @param stepName ステップ名
     * @param result 結果データ
     */
    async completeAIProcessingStep(
        processingId: string,
        stepName: string,
        result: any
    ): Promise<void> {
        const buffer = this.aiProcessingBuffers.get(processingId);
        if (!buffer) {
            logger.warn(`AI processing buffer not found: ${processingId}`);
            return;
        }

        const step = buffer.data.processingSteps.find(s => s.stepName === stepName);
        if (!step) {
            logger.warn(`Processing step not found: ${stepName}`);
            return;
        }

        step.stepStatus = 'completed';
        step.endTime = new Date().toISOString();
        step.intermediateResults = result;

        // 部分結果をバッファに追加
        buffer.data.outputBuffer.partialResults.push({
            stepName,
            result,
            timestamp: new Date().toISOString()
        });

        buffer.metadata.lastAccessed = new Date().toISOString();
        buffer.checksum = this.calculateChecksum(buffer.data);

        this.aiProcessingBuffers.set(processingId, buffer);
        logger.debug(`Completed processing step: ${stepName} in ${processingId}`);
    }

    // ============================================================================
    // 🔴 メモリ統合バッファ管理
    // ============================================================================

    /**
     * メモリ統合バッファを作成
     * @param integrationType 統合タイプ
     * @param sourceData ソースデータ情報
     * @returns 統合ID
     */
    async createMemoryIntegrationBuffer(
        integrationType: MemoryIntegrationBuffer['integrationType'],
        sourceData: MemoryIntegrationBuffer['sourceData']
    ): Promise<string> {
        const integrationId = `mem-int-${integrationType}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        const integrationBuffer: MemoryIntegrationBuffer = {
            integrationId,
            integrationType,
            sourceData,
            integrationSteps: [],
            qualityChecks: {
                dataIntegrity: false,
                consistencyCheck: false,
                duplicateDetection: false,
                relationshipValidation: false
            },
            timestamp: new Date().toISOString()
        };

        const buffer: ProcessingBuffer<MemoryIntegrationBuffer> = {
            bufferId: integrationId,
            bufferType: 'memory_integration',
            data: integrationBuffer,
            metadata: {
                size: JSON.stringify(integrationBuffer).length,
                timestamp: new Date().toISOString(),
                ttl: 4 * 60 * 60 * 1000, // 4時間
                accessCount: 0,
                lastAccessed: new Date().toISOString(),
                priority: 8
            },
            dependencies: sourceData.dataIds,
            checksum: this.calculateChecksum(integrationBuffer)
        };

        this.memoryIntegrationBuffers.set(integrationId, buffer);
        await this.saveToStorage();

        logger.debug(`Created memory integration buffer: ${integrationId}`);
        return integrationId;
    }

    /**
     * 統合ステップを追加
     * @param integrationId 統合ID
     * @param step 統合ステップ
     */
    async addIntegrationStep(
        integrationId: string,
        step: Omit<MemoryIntegrationBuffer['integrationSteps'][0], 'startTime' | 'status'>
    ): Promise<void> {
        const buffer = this.memoryIntegrationBuffers.get(integrationId);
        if (!buffer) {
            logger.warn(`Memory integration buffer not found: ${integrationId}`);
            return;
        }

        buffer.data.integrationSteps.push({
            ...step,
            status: 'processing',
            startTime: new Date().toISOString()
        });

        buffer.metadata.lastAccessed = new Date().toISOString();
        buffer.metadata.accessCount++;

        this.memoryIntegrationBuffers.set(integrationId, buffer);
        logger.debug(`Added integration step: ${step.stepName} to ${integrationId}`);
    }

    // ============================================================================
    // 🔴 章処理バッファ管理
    // ============================================================================

    /**
     * 章処理バッファを作成
     * @param chapter 章データ
     * @returns バッファID
     */
    async createChapterProcessingBuffer(chapter: Chapter): Promise<string> {
        const bufferId = `chapter-proc-${chapter.chapterNumber}`;

        const chapterProcessingBuffer: ChapterProcessingBuffer = {
            chapterNumber: chapter.chapterNumber,
            processingPhase: 'pre_analysis',
            chapterData: {
                originalChapter: chapter
            },
            processingComponents: {
                textAnalyzer: { status: 'pending' },
                characterExtractor: { status: 'pending' },
                contextGenerator: { status: 'pending' },
                emotionalAnalyzer: { status: 'pending' }
            },
            integrationResults: {},
            qualityAssurance: {
                overallScore: 0,
                componentScores: {},
                validationResults: []
            },
            timestamp: new Date().toISOString()
        };

        const buffer: ProcessingBuffer<ChapterProcessingBuffer> = {
            bufferId,
            bufferType: 'chapter_processing',
            data: chapterProcessingBuffer,
            metadata: {
                size: JSON.stringify(chapterProcessingBuffer).length,
                timestamp: new Date().toISOString(),
                ttl: 24 * 60 * 60 * 1000, // 24時間
                accessCount: 0,
                lastAccessed: new Date().toISOString(),
                priority: 9
            },
            dependencies: [],
            checksum: this.calculateChecksum(chapterProcessingBuffer)
        };

        this.chapterProcessingBuffers.set(chapter.chapterNumber, buffer);
        await this.saveToStorage();

        logger.debug(`Created chapter processing buffer: ${bufferId}`);
        return bufferId;
    }

    /**
     * 章処理コンポーネントの状態を更新
     * @param chapterNumber 章番号
     * @param componentName コンポーネント名
     * @param status ステータス
     * @param results 結果（オプション）
     */
    async updateChapterProcessingComponent(
        chapterNumber: number,
        componentName: keyof ChapterProcessingBuffer['processingComponents'],
        status: 'pending' | 'processing' | 'completed' | 'failed',
        results?: any
    ): Promise<void> {
        const buffer = this.chapterProcessingBuffers.get(chapterNumber);
        if (!buffer) {
            logger.warn(`Chapter processing buffer not found: ${chapterNumber}`);
            return;
        }

        const component = buffer.data.processingComponents[componentName];
        component.status = status;
        
        if (results) {
            component.results = results;
        }

        if (status === 'completed' || status === 'failed') {
            component.processingTime = Date.now() - new Date(buffer.metadata.timestamp).getTime();
        }

        buffer.metadata.lastAccessed = new Date().toISOString();
        buffer.checksum = this.calculateChecksum(buffer.data);

        this.chapterProcessingBuffers.set(chapterNumber, buffer);
        logger.debug(`Updated chapter processing component: ${componentName} for chapter ${chapterNumber}`);
    }

    // ============================================================================
    // 🔴 汎用バッファ管理
    // ============================================================================

    /**
     * 汎用バッファにデータを保存
     * @param bufferType バッファタイプ
     * @param data データ
     * @param ttl 生存時間（ミリ秒）
     * @returns バッファID
     */
    async storeInGenericBuffer<T>(
        bufferType: string,
        data: T,
        ttl: number = 60 * 60 * 1000 // デフォルト1時間
    ): Promise<string> {
        const bufferId = `generic-${bufferType}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        const buffer: ProcessingBuffer<T> = {
            bufferId,
            bufferType,
            data,
            metadata: {
                size: JSON.stringify(data).length,
                timestamp: new Date().toISOString(),
                ttl,
                accessCount: 0,
                lastAccessed: new Date().toISOString(),
                priority: 5
            },
            dependencies: [],
            checksum: this.calculateChecksum(data)
        };

        this.genericBuffers.set(bufferId, buffer);
        await this.saveToStorage();

        logger.debug(`Stored data in generic buffer: ${bufferId}`);
        return bufferId;
    }

    /**
     * 汎用バッファからデータを取得
     * @param bufferId バッファID
     * @returns データまたはnull
     */
    getFromGenericBuffer<T>(bufferId: string): T | null {
        this.processingStats.bufferHits++;

        const buffer = this.genericBuffers.get(bufferId);
        if (!buffer) {
            this.processingStats.bufferMisses++;
            return null;
        }

        // TTLチェック
        const now = Date.now();
        const bufferTime = new Date(buffer.metadata.timestamp).getTime();
        if ((now - bufferTime) > buffer.metadata.ttl) {
            this.genericBuffers.delete(bufferId);
            this.processingStats.bufferMisses++;
            return null;
        }

        // アクセス統計を更新
        buffer.metadata.accessCount++;
        buffer.metadata.lastAccessed = new Date().toISOString();

        return buffer.data;
    }

    // ============================================================================
    // 🔴 ヘルパー・ユーティリティ機能
    // ============================================================================

    /**
     * チェックサムを計算
     * @private
     * @param data データ
     * @returns チェックサム
     */
    private calculateChecksum(data: any): string {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * クリーンアップ処理を実行
     * @private
     */
    private performCleanup(): void {
        const now = Date.now();
        let cleanedCount = 0;

        // 期限切れバッファを削除（文字列キーのバッファ）
        const stringKeyBuffers = [
            this.aiProcessingBuffers,
            this.memoryIntegrationBuffers,
            this.genericBuffers
        ];

        stringKeyBuffers.forEach(bufferMap => {
            for (const [key, buffer] of bufferMap.entries()) {
                const bufferTime = new Date(buffer.metadata.timestamp).getTime();
                if ((now - bufferTime) > buffer.metadata.ttl) {
                    bufferMap.delete(key);
                    cleanedCount++;
                }
            }
        });

        // 数値キーのバッファ（章処理バッファ）を別途処理
        for (const [chapterNumber, buffer] of this.chapterProcessingBuffers.entries()) {
            const bufferTime = new Date(buffer.metadata.timestamp).getTime();
            if ((now - bufferTime) > buffer.metadata.ttl) {
                this.chapterProcessingBuffers.delete(chapterNumber);
                cleanedCount++;
            }
        }

        // 完了ジョブの古いものを削除
        const maxCompletedJobs = 100;
        if (this.completedJobs.size > maxCompletedJobs) {
            const sortedJobs = Array.from(this.completedJobs.entries())
                .sort(([,a], [,b]) => new Date(a.lastUpdateTime).getTime() - new Date(b.lastUpdateTime).getTime());

            const toRemove = sortedJobs.slice(0, sortedJobs.length - maxCompletedJobs);
            toRemove.forEach(([jobId]) => {
                this.completedJobs.delete(jobId);
                cleanedCount++;
            });
        }

        if (cleanedCount > 0) {
            logger.info(`Processing buffer cleanup completed: removed ${cleanedCount} expired entries`);
        }
    }

    /**
     * 状態情報を取得
     * @returns バッファ状態情報
     */
    async getStatus(): Promise<ProcessingBufferStatus> {
        const totalBufferSize = this.aiProcessingBuffers.size +
                               this.memoryIntegrationBuffers.size +
                               this.chapterProcessingBuffers.size +
                               this.genericBuffers.size;

        const bufferEfficiency = this.processingStats.bufferHits + this.processingStats.bufferMisses > 0
            ? this.processingStats.bufferHits / (this.processingStats.bufferHits + this.processingStats.bufferMisses)
            : 0;

        const errorRate = this.processingStats.totalJobsProcessed > 0
            ? this.processingStats.errorCount / this.processingStats.totalJobsProcessed
            : 0;

        return {
            initialized: this.initialized,
            activeJobs: this.activeJobs.size,
            queuedJobs: this.jobQueue.length,
            completedJobs: this.completedJobs.size,
            failedJobs: this.processingStats.errorCount,
            totalBufferSize,
            memoryUsageMB: this.calculateMemoryUsage(),
            avgProcessingTime: this.processingStats.averageJobTime,
            bufferEfficiency: Math.round(bufferEfficiency * 100) / 100,
            errorRate: Math.round(errorRate * 100) / 100,
            lastCleanupTime: new Date().toISOString()
        };
    }

    /**
     * メモリ使用量を計算
     * @private
     * @returns メモリ使用量（MB）
     */
    private calculateMemoryUsage(): number {
        let totalSize = 0;

        // 各バッファのサイズを合計
        [
            this.aiProcessingBuffers,
            this.memoryIntegrationBuffers,
            this.chapterProcessingBuffers,
            this.genericBuffers
        ].forEach(bufferMap => {
            for (const buffer of bufferMap.values()) {
                totalSize += buffer.metadata.size;
            }
        });

        return Math.round(totalSize / (1024 * 1024) * 100) / 100; // MB
    }

    // ============================================================================
    // 🔴 永続化機能
    // ============================================================================

    /**
     * ストレージからデータを読み込み
     * @private
     */
    private async loadFromStorage(): Promise<void> {
        try {
            const bufferExists = await storageProvider.fileExists('short-term/processing-buffers.json');
            
            if (bufferExists) {
                const bufferContent = await storageProvider.readFile('short-term/processing-buffers.json');
                const bufferData = JSON.parse(bufferContent);

                // 各バッファを復元（型アサーション付き）
                if (bufferData.aiProcessingBuffers) {
                    this.aiProcessingBuffers = new Map(
                        Object.entries(bufferData.aiProcessingBuffers) as [string, ProcessingBuffer<AIProcessingState>][]
                    );
                }
                if (bufferData.memoryIntegrationBuffers) {
                    this.memoryIntegrationBuffers = new Map(
                        Object.entries(bufferData.memoryIntegrationBuffers) as [string, ProcessingBuffer<MemoryIntegrationBuffer>][]
                    );
                }
                if (bufferData.chapterProcessingBuffers) {
                    this.chapterProcessingBuffers = new Map(
                        Object.entries(bufferData.chapterProcessingBuffers).map(([k, v]) => [
                            parseInt(k), 
                            v as ProcessingBuffer<ChapterProcessingBuffer>
                        ])
                    );
                }
                if (bufferData.genericBuffers) {
                    this.genericBuffers = new Map(
                        Object.entries(bufferData.genericBuffers) as [string, ProcessingBuffer<any>][]
                    );
                }
                if (bufferData.activeJobs) {
                    this.activeJobs = new Map(
                        Object.entries(bufferData.activeJobs) as [string, ProcessingJob][]
                    );
                }
                if (bufferData.jobQueue) {
                    this.jobQueue = bufferData.jobQueue as ProcessingJob[];
                }
                if (bufferData.processingStats) {
                    this.processingStats = bufferData.processingStats;
                }

                logger.debug('ProcessingBuffers data loaded from storage');
            }
        } catch (error) {
            logger.error('Failed to load ProcessingBuffers from storage', { error });
        }
    }

    /**
     * ストレージにデータを保存
     * @private
     */
    private async saveToStorage(): Promise<void> {
        try {
            const bufferData = {
                aiProcessingBuffers: Object.fromEntries(this.aiProcessingBuffers),
                memoryIntegrationBuffers: Object.fromEntries(this.memoryIntegrationBuffers),
                chapterProcessingBuffers: Object.fromEntries(this.chapterProcessingBuffers),
                genericBuffers: Object.fromEntries(this.genericBuffers),
                activeJobs: Object.fromEntries(this.activeJobs),
                jobQueue: this.jobQueue,
                processingStats: this.processingStats,
                lastSaved: new Date().toISOString()
            };

            await storageProvider.writeFile(
                'short-term/processing-buffers.json',
                JSON.stringify(bufferData, null, 2)
            );

            logger.debug('ProcessingBuffers data saved to storage');
        } catch (error) {
            logger.error('Failed to save ProcessingBuffers to storage', { error });
        }
    }

    /**
     * クリーンアップ処理
     */
    async cleanup(): Promise<void> {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }

        if (this.processingTimer) {
            clearInterval(this.processingTimer);
            this.processingTimer = null;
        }

        await this.saveToStorage();
        logger.info('ProcessingBuffers cleanup completed');
    }
}