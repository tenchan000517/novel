// 学習旅程システム専用診断ロガー
// src/lib/utils/learning-journey-diagnostics.ts

import { storageProvider } from '@/lib/storage';

interface DiagnosticCheckpoint {
    phase: string;
    checkpoint: string;
    status: 'SUCCESS' | 'FAILURE' | 'WARNING' | 'INFO';
    data?: any;
    error?: string;
    timestamp: number;
}

interface DiagnosticReport {
    sessionId: string;
    startTime: number;
    endTime?: number;
    chapterNumber: number;
    checkpoints: DiagnosticCheckpoint[];
    rootCause?: string;
    solution?: string;
    summary: {
        totalChecks: number;
        successCount: number;
        failureCount: number;
        warningCount: number;
    };
}

class LearningJourneyDiagnostics {
    private static instance: LearningJourneyDiagnostics;
    private currentReport: DiagnosticReport | null = null;
    private enabled: boolean = false;

    private constructor() {}

    static getInstance(): LearningJourneyDiagnostics {
        if (!LearningJourneyDiagnostics.instance) {
            LearningJourneyDiagnostics.instance = new LearningJourneyDiagnostics();
        }
        return LearningJourneyDiagnostics.instance;
    }

    /**
     * 診断セッションを開始
     */
    startDiagnosticSession(chapterNumber: number): string {
        const sessionId = `LJS_DIAG_${Date.now()}_CH${chapterNumber}`;
        
        this.currentReport = {
            sessionId,
            startTime: Date.now(),
            chapterNumber,
            checkpoints: [],
            summary: {
                totalChecks: 0,
                successCount: 0,
                failureCount: 0,
                warningCount: 0
            }
        };

        this.enabled = true;
        console.log(`🔬 [LJS-DIAGNOSTIC] セッション開始: ${sessionId}`);
        return sessionId;
    }

    /**
     * 診断チェックポイントを記録
     */
    checkpoint(
        phase: string, 
        checkpoint: string, 
        status: 'SUCCESS' | 'FAILURE' | 'WARNING' | 'INFO',
        data?: any,
        error?: string
    ): void {
        if (!this.enabled || !this.currentReport) return;

        const checkpointData: DiagnosticCheckpoint = {
            phase,
            checkpoint,
            status,
            data,
            error,
            timestamp: Date.now()
        };

        this.currentReport.checkpoints.push(checkpointData);
        this.currentReport.summary.totalChecks++;

        // ステータス別カウント
        switch (status) {
            case 'SUCCESS':
                this.currentReport.summary.successCount++;
                break;
            case 'FAILURE':
                this.currentReport.summary.failureCount++;
                break;
            case 'WARNING':
                this.currentReport.summary.warningCount++;
                break;
        }

        // 重要な結果のみコンソール出力
        if (status === 'FAILURE' || status === 'WARNING') {
            const icon = status === 'FAILURE' ? '❌' : '⚠️';
            console.log(`${icon} [LJS-DIAG] ${phase}.${checkpoint}: ${status}${error ? ` - ${error}` : ''}`);
            
            if (data && typeof data === 'object') {
                console.log(`   Data:`, data);
            }
        } else if (status === 'SUCCESS' && this.isImportantCheckpoint(phase, checkpoint)) {
            console.log(`✅ [LJS-DIAG] ${phase}.${checkpoint}: ${status}`);
        }
    }

    /**
     * 重要なチェックポイントかどうかを判定
     */
    private isImportantCheckpoint(phase: string, checkpoint: string): boolean {
        const importantCheckpoints = [
            'CONSTRUCTION.LJS_INJECTION',
            'INITIALIZATION.LJS_INIT_SUCCESS',
            'CONTEXT_ENRICHMENT.ENRICHMENT_SUCCESS',
            'SECTION_BUILDING.LEARNING_SECTION_BUILT',
            'INTEGRATION.FINAL_PROMPT_HAS_LEARNING_CONTENT'
        ];
        
        return importantCheckpoints.includes(`${phase}.${checkpoint}`);
    }

    /**
     * 根本原因を設定
     */
    setRootCause(cause: string, solution?: string): void {
        if (!this.currentReport) return;
        
        this.currentReport.rootCause = cause;
        this.currentReport.solution = solution;
        
        console.log(`🎯 [LJS-DIAG] 根本原因特定: ${cause}`);
        if (solution) {
            console.log(`💡 [LJS-DIAG] 推奨解決策: ${solution}`);
        }
    }

    /**
     * 診断セッションを終了し、レポートを生成
     */
    async finalizeDiagnosticSession(): Promise<DiagnosticReport | null> {
        if (!this.currentReport) return null;

        this.currentReport.endTime = Date.now();
        
        // コンソールに要約を出力
        this.printSummary();
        
        // ファイルに詳細レポートを保存
        await this.saveDetailedReport();
        
        const report = this.currentReport;
        this.currentReport = null;
        this.enabled = false;
        
        return report;
    }

    /**
     * コンソールに診断要約を出力
     */
    private printSummary(): void {
        if (!this.currentReport) return;

        const duration = this.currentReport.endTime! - this.currentReport.startTime;
        const report = this.currentReport;

        console.log('\n📊 ========== LJS診断レポート要約 ==========');
        console.log(`セッションID: ${report.sessionId}`);
        console.log(`章番号: ${report.chapterNumber}`);
        console.log(`診断時間: ${duration}ms`);
        console.log(`チェック総数: ${report.summary.totalChecks}`);
        console.log(`成功: ${report.summary.successCount} | 失敗: ${report.summary.failureCount} | 警告: ${report.summary.warningCount}`);
        
        if (report.rootCause) {
            console.log(`\n🎯 根本原因: ${report.rootCause}`);
        }
        
        if (report.solution) {
            console.log(`💡 推奨解決策: ${report.solution}`);
        }

        // 失敗したチェックポイントの一覧
        const failures = report.checkpoints.filter(c => c.status === 'FAILURE');
        if (failures.length > 0) {
            console.log('\n❌ 失敗したチェックポイント:');
            failures.forEach(f => {
                console.log(`   • ${f.phase}.${f.checkpoint}: ${f.error || 'エラー詳細なし'}`);
            });
        }

        // 重要な成功チェックポイント
        const importantSuccesses = report.checkpoints.filter(c => 
            c.status === 'SUCCESS' && this.isImportantCheckpoint(c.phase, c.checkpoint)
        );
        if (importantSuccesses.length > 0) {
            console.log('\n✅ 重要な成功チェックポイント:');
            importantSuccesses.forEach(s => {
                console.log(`   • ${s.phase}.${s.checkpoint}`);
            });
        }

        console.log('==========================================\n');
    }

    /**
     * 詳細レポートをファイルに保存
     */
    private async saveDetailedReport(): Promise<void> {
        if (!this.currentReport) return;

        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `ljs_diagnostic_${timestamp}.json`;
            
            await storageProvider.writeFile(
                `diagnostics/${filename}`, 
                JSON.stringify(this.currentReport, null, 2)
            );
            
            console.log(`📄 [LJS-DIAG] 詳細レポート保存: diagnostics/${filename}`);
        } catch (error) {
            console.warn('診断レポートの保存に失敗:', error);
        }
    }

    /**
     * 診断が有効かどうかを確認
     */
    isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * 現在のセッションIDを取得
     */
    getCurrentSessionId(): string | null {
        return this.currentReport?.sessionId || null;
    }
}

// シングルトンインスタンスをエクスポート
export const ljsDiagnostics = LearningJourneyDiagnostics.getInstance();

// 便利な診断用ヘルパー関数
export const LJSCheck = {
    /**
     * 成功チェック
     */
    success: (phase: string, checkpoint: string, data?: any) => {
        ljsDiagnostics.checkpoint(phase, checkpoint, 'SUCCESS', data);
    },

    /**
     * 失敗チェック
     */
    failure: (phase: string, checkpoint: string, error: string, data?: any) => {
        ljsDiagnostics.checkpoint(phase, checkpoint, 'FAILURE', data, error);
    },

    /**
     * 警告チェック
     */
    warning: (phase: string, checkpoint: string, message: string, data?: any) => {
        ljsDiagnostics.checkpoint(phase, checkpoint, 'WARNING', data, message);
    },

    /**
     * 情報チェック
     */
    info: (phase: string, checkpoint: string, data?: any) => {
        ljsDiagnostics.checkpoint(phase, checkpoint, 'INFO', data);
    },

    /**
     * 根本原因の特定
     */
    rootCause: (cause: string, solution?: string) => {
        ljsDiagnostics.setRootCause(cause, solution);
    }
};

// 診断用のデコレータ（オプション）
export function DiagnosticMethod(phase: string, checkpoint: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const startTime = Date.now();
            
            try {
                const result = await originalMethod.apply(this, args);
                const duration = Date.now() - startTime;
                
                LJSCheck.success(phase, checkpoint, { duration, hasResult: !!result });
                return result;
            } catch (error) {
                const duration = Date.now() - startTime;
                LJSCheck.failure(
                    phase, 
                    checkpoint, 
                    error instanceof Error ? error.message : String(error),
                    { duration }
                );
                throw error;
            }
        };

        return descriptor;
    };
}