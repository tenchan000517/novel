/**
 * @fileoverview 物語進行管理システム - 中期記憶階層
 * @description
 * 物語の進行状態、アーク管理、ターニングポイント追跡を担当するコンポーネント。
 * NarrativeAnalysisServiceの結果を永続化し、物語構造の整合性を維持します。
 */

import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { Chapter } from '@/types/chapters';

/**
 * @interface StoryProgressionState
 * @description 物語進行状態を表すインターフェース
 */
export interface StoryProgressionState {
    currentArc: number;
    currentTheme: string;
    arcStartChapter: number;
    arcEndChapter: number;
    arcCompleted: boolean;
    totalArcs: number;
    narrativePhase: 'INTRODUCTION' | 'RISING_ACTION' | 'CLIMAX' | 'FALLING_ACTION' | 'RESOLUTION';
    lastUpdated: string;
}

/**
 * @interface TurningPointRecord
 * @description ターニングポイント記録
 */
export interface TurningPointRecord {
    id: string;
    chapter: number;
    description: string;
    significance: number;
    type: 'PLOT_TWIST' | 'CHARACTER_DEVELOPMENT' | 'CONFLICT_ESCALATION' | 'REVELATION' | 'RESOLUTION';
    relatedCharacters: string[];
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    timestamp: string;
}

/**
 * @interface ArcProgressionRecord
 * @description アーク進行記録
 */
export interface ArcProgressionRecord {
    arcNumber: number;
    theme: string;
    startChapter: number;
    endChapter: number;
    status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
    milestones: Array<{
        chapter: number;
        description: string;
        achieved: boolean;
        timestamp: string;
    }>;
    keyEvents: string[];
    characterArcs: Array<{
        characterId: string;
        developmentGoal: string;
        progress: number; // 0-100
        milestones: string[];
    }>;
    created: string;
    lastUpdated: string;
}

/**
 * @interface NarrativeAnalysisResult
 * @description NarrativeAnalysisServiceの分析結果
 */
export interface NarrativeAnalysisResult {
    id: string;
    chapterNumber: number;
    analysisType: 'TENSION' | 'PACING' | 'CHARACTER_DEVELOPMENT' | 'PLOT_CONSISTENCY' | 'THEME_ALIGNMENT';
    results: {
        tensionLevel?: number;
        pacingScore?: number;
        consistencyScore?: number;
        themeAlignment?: number;
        characterDevelopment?: Array<{
            characterId: string;
            developmentScore: number;
            notes: string;
        }>;
    };
    recommendations: string[];
    timestamp: string;
}

/**
 * @interface TensionHistoryRecord
 * @description テンション履歴記録
 */
export interface TensionHistoryRecord {
    chapter: number;
    tensionBefore: number;
    tensionAfter: number;
    tensionDelta: number;
    factors: Array<{
        type: string;
        impact: number;
        description: string;
    }>;
    timestamp: string;
}

/**
 * @class NarrativeProgressionManager
 * @description 物語進行管理を担当するクラス
 */
export class NarrativeProgressionManager {
    private progressionState: StoryProgressionState;
    private turningPoints: Map<number, TurningPointRecord[]> = new Map();
    private arcRecords: Map<number, ArcProgressionRecord> = new Map();
    private narrativeAnalysisResults: Map<string, NarrativeAnalysisResult> = new Map();
    private tensionHistory: TensionHistoryRecord[] = [];
    private initialized: boolean = false;

    constructor() {
        this.progressionState = this.createDefaultProgressionState();
    }

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('NarrativeProgressionManager already initialized');
            return;
        }

        try {
            await this.loadFromStorage();
            this.initialized = true;
            logger.info('NarrativeProgressionManager initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize NarrativeProgressionManager', {
                error: error instanceof Error ? error.message : String(error)
            });
            this.initialized = true; // エラーでも空の状態で続行
        }
    }

    /**
     * デフォルト進行状態を作成
     * @private
     */
    private createDefaultProgressionState(): StoryProgressionState {
        return {
            currentArc: 1,
            currentTheme: '物語の始まり',
            arcStartChapter: 1,
            arcEndChapter: -1,
            arcCompleted: false,
            totalArcs: 1,
            narrativePhase: 'INTRODUCTION',
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * ストレージからデータを読み込み
     * @private
     */
    private async loadFromStorage(): Promise<void> {
        try {
            // 進行状態の読み込み
            if (await storageProvider.fileExists('mid-term-memory/narrative-progression.json')) {
                const progressionData = await storageProvider.readFile('mid-term-memory/narrative-progression.json');
                const parsed = JSON.parse(progressionData);
                this.progressionState = parsed.progressionState || this.createDefaultProgressionState();
                
                // ターニングポイントの復元
                if (parsed.turningPoints) {
                    this.turningPoints = new Map(parsed.turningPoints);
                }
                
                // アーク記録の復元
                if (parsed.arcRecords) {
                    this.arcRecords = new Map(parsed.arcRecords);
                }
                
                // 分析結果の復元
                if (parsed.narrativeAnalysisResults) {
                    this.narrativeAnalysisResults = new Map(parsed.narrativeAnalysisResults);
                }
                
                // テンション履歴の復元
                if (parsed.tensionHistory && Array.isArray(parsed.tensionHistory)) {
                    this.tensionHistory = parsed.tensionHistory;
                }
            }
        } catch (error) {
            logger.error('Failed to load narrative progression data', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * データを保存
     */
    async save(): Promise<void> {
        try {
            const data = {
                progressionState: this.progressionState,
                turningPoints: Array.from(this.turningPoints.entries()),
                arcRecords: Array.from(this.arcRecords.entries()),
                narrativeAnalysisResults: Array.from(this.narrativeAnalysisResults.entries()),
                tensionHistory: this.tensionHistory,
                savedAt: new Date().toISOString()
            };

            await storageProvider.writeFile(
                'mid-term-memory/narrative-progression.json',
                JSON.stringify(data, null, 2)
            );

            logger.debug('Saved narrative progression data');
        } catch (error) {
            logger.error('Failed to save narrative progression data', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 章から物語進行を更新
     */
    async updateFromChapter(chapter: Chapter): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            logger.info(`Updating narrative progression from chapter ${chapter.chapterNumber}`);

            // 物語フェーズの更新
            await this.updateNarrativePhase(chapter);

            // アーク進行の更新
            await this.updateArcProgression(chapter);

            // ターニングポイントの検出
            await this.detectTurningPoints(chapter);

            // 状態の最終更新
            this.progressionState.lastUpdated = new Date().toISOString();

            await this.save();
            logger.info(`Successfully updated narrative progression from chapter ${chapter.chapterNumber}`);
        } catch (error) {
            logger.error(`Failed to update narrative progression from chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 物語フェーズを更新
     * @private
     */
    private async updateNarrativePhase(chapter: Chapter): Promise<void> {
        // 章数に基づく基本的なフェーズ判定
        const chapterNumber = chapter.chapterNumber;
        
        if (chapterNumber <= 3) {
            this.progressionState.narrativePhase = 'INTRODUCTION';
        } else if (chapterNumber <= 15) {
            this.progressionState.narrativePhase = 'RISING_ACTION';
        } else if (chapterNumber <= 20) {
            this.progressionState.narrativePhase = 'CLIMAX';
        } else if (chapterNumber <= 25) {
            this.progressionState.narrativePhase = 'FALLING_ACTION';
        } else {
            this.progressionState.narrativePhase = 'RESOLUTION';
        }

        // コンテンツ分析によるフェーズ調整
        const content = chapter.content.toLowerCase();
        
        if (content.includes('クライマックス') || content.includes('決戦') || content.includes('最終') || content.includes('対決')) {
            this.progressionState.narrativePhase = 'CLIMAX';
        } else if (content.includes('結末') || content.includes('エピローグ') || content.includes('終章')) {
            this.progressionState.narrativePhase = 'RESOLUTION';
        }
    }

    /**
     * アーク進行を更新
     * @private
     */
    private async updateArcProgression(chapter: Chapter): Promise<void> {
        const currentArcNumber = this.progressionState.currentArc;
        let currentArc = this.arcRecords.get(currentArcNumber);

        // 現在のアークが存在しない場合は作成
        if (!currentArc) {
            currentArc = {
                arcNumber: currentArcNumber,
                theme: this.progressionState.currentTheme,
                startChapter: this.progressionState.arcStartChapter,
                endChapter: this.progressionState.arcEndChapter,
                status: 'IN_PROGRESS',
                milestones: [],
                keyEvents: [],
                characterArcs: [],
                created: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
        }

        // アークの更新
        currentArc.lastUpdated = new Date().toISOString();

        // マイルストーンのチェック
        await this.checkArcMilestones(currentArc, chapter);

        // アークの完了チェック
        if (this.shouldCompleteArc(currentArc, chapter)) {
            await this.completeCurrentArc(chapter.chapterNumber);
        }

        this.arcRecords.set(currentArcNumber, currentArc);
    }

    /**
     * アークマイルストーンをチェック
     * @private
     */
    private async checkArcMilestones(arc: ArcProgressionRecord, chapter: Chapter): Promise<void> {
        // コンテンツベースのマイルストーン検出
        const content = chapter.content.toLowerCase();
        const chapterNumber = chapter.chapterNumber;

        const potentialMilestones = [
            {
                condition: content.includes('新たな') || content.includes('発見'),
                description: '新要素の導入',
            },
            {
                condition: content.includes('対立') || content.includes('衝突') || content.includes('対決'),
                description: '対立の激化',
            },
            {
                condition: content.includes('解決') || content.includes('決着') || content.includes('決断'),
                description: '重要な決断・解決',
            },
            {
                condition: content.includes('転機') || content.includes('変化') || content.includes('変わる'),
                description: '物語の転換点',
            }
        ];

        for (const milestone of potentialMilestones) {
            if (milestone.condition) {
                // 既に同じマイルストーンがないかチェック
                const exists = arc.milestones.some(m => 
                    m.description === milestone.description && Math.abs(m.chapter - chapterNumber) <= 2
                );

                if (!exists) {
                    arc.milestones.push({
                        chapter: chapterNumber,
                        description: milestone.description,
                        achieved: true,
                        timestamp: new Date().toISOString()
                    });

                    logger.info(`Arc milestone achieved: ${milestone.description} in chapter ${chapterNumber}`);
                }
            }
        }
    }

    /**
     * アークを完了すべきかチェック
     * @private
     */
    private shouldCompleteArc(arc: ArcProgressionRecord, chapter: Chapter): boolean {
        const chapterNumber = chapter.chapterNumber;
        const content = chapter.content.toLowerCase();

        // 明示的な完了指示
        if (content.includes('アーク終了') || content.includes('章終了') || content.includes('パート終了')) {
            return true;
        }

        // マイルストーンによる判定
        const achievedMilestones = arc.milestones.filter(m => m.achieved).length;
        if (achievedMilestones >= 3 && chapterNumber - arc.startChapter >= 5) {
            return true;
        }

        // 長期間経過による自動完了
        if (chapterNumber - arc.startChapter >= 10) {
            return true;
        }

        return false;
    }

    /**
     * 現在のアークを完了し、新しいアークを開始
     * @private
     */
    private async completeCurrentArc(currentChapter: number): Promise<void> {
        const currentArcNumber = this.progressionState.currentArc;
        const currentArc = this.arcRecords.get(currentArcNumber);

        if (currentArc) {
            // 現在のアークを完了
            currentArc.status = 'COMPLETED';
            currentArc.endChapter = currentChapter;
            currentArc.lastUpdated = new Date().toISOString();
            this.arcRecords.set(currentArcNumber, currentArc);

            // 新しいアークを開始
            const newArcNumber = currentArcNumber + 1;
            this.progressionState.currentArc = newArcNumber;
            this.progressionState.arcStartChapter = currentChapter + 1;
            this.progressionState.arcEndChapter = -1;
            this.progressionState.arcCompleted = false;
            this.progressionState.totalArcs = Math.max(this.progressionState.totalArcs, newArcNumber);
            this.progressionState.currentTheme = this.generateNextArcTheme(newArcNumber);

            logger.info(`Arc ${currentArcNumber} completed, starting Arc ${newArcNumber}`);
        }
    }

    /**
     * 次のアークテーマを生成
     * @private
     */
    private generateNextArcTheme(arcNumber: number): string {
        const themes = [
            '物語の始まり',
            '挑戦と成長',
            '対立と試練',
            '転機と変化',
            'クライマックスへの道',
            '最終決戦',
            '結末と新たな始まり'
        ];

        return themes[Math.min(arcNumber - 1, themes.length - 1)] || `第${arcNumber}アーク`;
    }

    /**
     * ターニングポイントを検出
     * @private
     */
    private async detectTurningPoints(chapter: Chapter): Promise<void> {
        const chapterNumber = chapter.chapterNumber;
        const content = chapter.content.toLowerCase();

        const turningPointPatterns = [
            {
                pattern: /(突然|急に|いきなり|予想外|驚く|衝撃)/,
                type: 'PLOT_TWIST' as const,
                significance: 7
            },
            {
                pattern: /(成長|変化|決意|覚悟|決断)/,
                type: 'CHARACTER_DEVELOPMENT' as const,
                significance: 6
            },
            {
                pattern: /(対立|衝突|戦い|争い|対決)/,
                type: 'CONFLICT_ESCALATION' as const,
                significance: 7
            },
            {
                pattern: /(真実|秘密|発覚|明らか|判明)/,
                type: 'REVELATION' as const,
                significance: 8
            },
            {
                pattern: /(解決|決着|終了|完了|達成)/,
                type: 'RESOLUTION' as const,
                significance: 6
            }
        ];

        for (const patternInfo of turningPointPatterns) {
            if (patternInfo.pattern.test(content)) {
                const turningPoint: TurningPointRecord = {
                    id: `tp-${chapterNumber}-${patternInfo.type}-${Date.now()}`,
                    chapter: chapterNumber,
                    description: `${patternInfo.type}を示すターニングポイント`,
                    significance: patternInfo.significance,
                    type: patternInfo.type,
                    relatedCharacters: [], // 実装時に改善
                    impact: this.calculateImpact(patternInfo.significance),
                    timestamp: new Date().toISOString()
                };

                // 章ごとのターニングポイントを追加
                if (!this.turningPoints.has(chapterNumber)) {
                    this.turningPoints.set(chapterNumber, []);
                }
                this.turningPoints.get(chapterNumber)!.push(turningPoint);

                logger.info(`Detected turning point: ${patternInfo.type} in chapter ${chapterNumber}`);
            }
        }
    }

    /**
     * インパクトレベルを計算
     * @private
     */
    private calculateImpact(significance: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
        if (significance >= 9) return 'CRITICAL';
        if (significance >= 7) return 'HIGH';
        if (significance >= 5) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * 分析結果を記録
     */
    async recordNarrativeAnalysis(result: NarrativeAnalysisResult): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            this.narrativeAnalysisResults.set(result.id, result);
            await this.save();
            logger.info(`Recorded narrative analysis result: ${result.analysisType} for chapter ${result.chapterNumber}`);
        } catch (error) {
            logger.error('Failed to record narrative analysis result', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * テンション履歴を記録
     */
    async recordTensionHistory(record: TensionHistoryRecord): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            this.tensionHistory.push(record);
            
            // 履歴の制限（最新100件まで）
            if (this.tensionHistory.length > 100) {
                this.tensionHistory = this.tensionHistory.slice(-100);
            }

            await this.save();
            logger.debug(`Recorded tension history for chapter ${record.chapter}`);
        } catch (error) {
            logger.error('Failed to record tension history', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    // ============================================================================
    // パブリックアクセサーメソッド
    // ============================================================================

    /**
     * 進行状態を取得
     */
    getProgressionState(): StoryProgressionState {
        return { ...this.progressionState };
    }

    /**
     * ターニングポイントを取得
     */
    getTurningPoints(chapterNumber?: number): TurningPointRecord[] {
        if (chapterNumber !== undefined) {
            return this.turningPoints.get(chapterNumber) || [];
        }

        const allTurningPoints: TurningPointRecord[] = [];
        for (const points of this.turningPoints.values()) {
            allTurningPoints.push(...points);
        }
        return allTurningPoints.sort((a, b) => a.chapter - b.chapter);
    }

    /**
     * アーク記録を取得
     */
    getArcRecord(arcNumber: number): ArcProgressionRecord | null {
        return this.arcRecords.get(arcNumber) || null;
    }

    /**
     * 全アーク記録を取得
     */
    getAllArcRecords(): ArcProgressionRecord[] {
        return Array.from(this.arcRecords.values()).sort((a, b) => a.arcNumber - b.arcNumber);
    }

    /**
     * 分析結果を取得
     */
    getNarrativeAnalysisResults(chapterNumber?: number): NarrativeAnalysisResult[] {
        const results = Array.from(this.narrativeAnalysisResults.values());
        
        if (chapterNumber !== undefined) {
            return results.filter(r => r.chapterNumber === chapterNumber);
        }
        
        return results.sort((a, b) => a.chapterNumber - b.chapterNumber);
    }

    /**
     * テンション履歴を取得
     */
    getTensionHistory(limit?: number): TensionHistoryRecord[] {
        const sorted = this.tensionHistory.sort((a, b) => b.chapter - a.chapter);
        return limit ? sorted.slice(0, limit) : sorted;
    }

    /**
     * 現在のアーク情報を取得
     */
    getCurrentArcInfo(): {
        arcNumber: number;
        theme: string;
        startChapter: number;
        progress: number;
        milestones: number;
    } {
        const currentArc = this.arcRecords.get(this.progressionState.currentArc);
        
        return {
            arcNumber: this.progressionState.currentArc,
            theme: this.progressionState.currentTheme,
            startChapter: this.progressionState.arcStartChapter,
            progress: currentArc ? (currentArc.milestones.filter(m => m.achieved).length / Math.max(currentArc.milestones.length, 1)) * 100 : 0,
            milestones: currentArc ? currentArc.milestones.filter(m => m.achieved).length : 0
        };
    }

    /**
     * 統計情報を取得
     */
    getStatistics(): {
        totalTurningPoints: number;
        completedArcs: number;
        analysisResultsCount: number;
        averageTensionChange: number;
    } {
        const allTurningPoints = this.getTurningPoints();
        const completedArcs = Array.from(this.arcRecords.values()).filter(arc => arc.status === 'COMPLETED');
        const analysisResults = Array.from(this.narrativeAnalysisResults.values());
        
        const tensionChanges = this.tensionHistory.map(t => Math.abs(t.tensionDelta));
        const averageTensionChange = tensionChanges.length > 0 
            ? tensionChanges.reduce((sum, change) => sum + change, 0) / tensionChanges.length 
            : 0;

        return {
            totalTurningPoints: allTurningPoints.length,
            completedArcs: completedArcs.length,
            analysisResultsCount: analysisResults.length,
            averageTensionChange
        };
    }
}