// src/lib/memory/narrative/emotional-dynamics-manager.ts
/**
 * @fileoverview 感情ダイナミクス管理クラス（最適化版）
 * @description
 * テンション最適化と感情アーク設計を統合し、
 * 物語の感情的側面を管理します。
 */

import { Chapter } from '@/types/chapters';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { EmotionalArcDesigner, ChapterEmotionAnalysis, EmotionalArcDesign } from '@/lib/memory/emotional-arc-designer';
import { DynamicTensionOptimizer } from './dynamic-tension-optimizer';
import {
    EmotionalCurvePoint,
    ManagerConstructorOptions,
    UpdateOptions,
    IManager,
    TensionRecommendation,
    PacingRecommendation,
    TensionPacingRecommendation,
    LearningStage,
    EmotionLearningSyncMetrics
} from './types';

/**
 * @class EmotionalDynamicsManager
 * @description テンション最適化と感情アーク設計を管理するクラス
 */
export class EmotionalDynamicsManager implements IManager {
    private geminiClient: GeminiClient;
    private emotionalArcDesigner: EmotionalArcDesigner;
    private dynamicTensionOptimizer: DynamicTensionOptimizer;

    private tensionPoints: { chapter: number, level: number }[] = [];
    private emotionalTones: { chapter: number, tone: string }[] = [];
    private chapterEmotions: Map<number, ChapterEmotionAnalysis> = new Map();
    private tensionHistory: Map<number, number> = new Map();

    private genre: string = 'classic';
    private initialized: boolean = false;

    // 感情学習同期指標データ
    private syncMetricsData: {
        [conceptName: string]: {
            [stage in LearningStage]?: EmotionLearningSyncMetrics & {
                updatedAt: string;
            };
        };
    } = {};

    /**
     * コンストラクタ
     */
    constructor(options?: ManagerConstructorOptions) {
        this.geminiClient = options?.geminiClient || new GeminiClient();
        this.emotionalArcDesigner = new EmotionalArcDesigner(this.geminiClient);
        this.dynamicTensionOptimizer = new DynamicTensionOptimizer();
    }

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('EmotionalDynamicsManager already initialized');
            return;
        }

        try {
            await this.loadFromStorage();
            this.initialized = true;
            logger.info('EmotionalDynamicsManager initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize EmotionalDynamicsManager', {
                error: error instanceof Error ? error.message : String(error)
            });
            this.initialized = true;
        }
    }

    /**
     * ストレージからデータを読み込む
     */
    private async loadFromStorage(): Promise<void> {
        try {
            const stateExists = await this.storageExists('narrative-memory/emotional-dynamics.json');

            if (stateExists) {
                const content = await this.readFromStorage('narrative-memory/emotional-dynamics.json');
                const data = JSON.parse(content);

                // データを復元
                this.restoreFromStorageData(data);
            }
        } catch (error) {
            logger.error('Failed to load EmotionalDynamicsManager from storage', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * ストレージデータからの復元
     * @private
     */
    private restoreFromStorageData(data: any): void {
        if (data.tensionPoints && Array.isArray(data.tensionPoints)) {
            this.tensionPoints = data.tensionPoints;
        }

        if (data.tensionHistory && typeof data.tensionHistory === 'object') {
            this.tensionHistory = new Map(Object.entries(data.tensionHistory).map(
                ([key, value]) => [parseInt(key), value as number]
            ));
        }

        if (data.emotionalTones && Array.isArray(data.emotionalTones)) {
            this.emotionalTones = data.emotionalTones;
        }

        if (data.syncMetricsData && typeof data.syncMetricsData === 'object') {
            this.syncMetricsData = data.syncMetricsData;
        }

        if (data.chapterEmotions && typeof data.chapterEmotions === 'object') {
            this.chapterEmotions = new Map(Object.entries(data.chapterEmotions).map(
                ([key, value]) => [parseInt(key), value as ChapterEmotionAnalysis]
            ));
        }

        if (data.genre) {
            this.genre = data.genre;
        }
    }

    /**
     * ストレージにパスが存在するか確認
     */
    private async storageExists(path: string): Promise<boolean> {
        try {
            return await storageProvider.fileExists(path);
        } catch (error) {
            return false;
        }
    }

    /**
     * ストレージからデータを読み込む
     */
    private async readFromStorage(path: string): Promise<string> {
        try {
            const exists = await storageProvider.fileExists(path);
            if (exists) {
                return await storageProvider.readFile(path);
            } else {
                logger.warn(`File does not exist: ${path}`);
                return '{}';
            }
        } catch (error) {
            logger.error(`Error reading file: ${path}`, { error });
            throw error;
        }
    }

    /**
     * データを保存する
     */
    async save(): Promise<void> {
        try {
            const data = {
                tensionPoints: this.tensionPoints,
                tensionHistory: Object.fromEntries(this.tensionHistory.entries()),
                emotionalTones: this.emotionalTones,
                chapterEmotions: Object.fromEntries(this.chapterEmotions.entries()),
                genre: this.genre,
                syncMetricsData: this.syncMetricsData
            };

            await this.writeToStorage('narrative-memory/emotional-dynamics.json', JSON.stringify(data, null, 2));
            logger.debug('Saved EmotionalDynamicsManager to storage');
        } catch (error) {
            logger.error('Failed to save EmotionalDynamicsManager to storage', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * ストレージにデータを書き込む
     */
    private async writeToStorage(path: string, content: string): Promise<void> {
        try {
            await storageProvider.writeFile(path, content);
            logger.debug(`Wrote to file: ${path}`);
        } catch (error) {
            logger.error(`Error writing file: ${path}`, { error });
            throw error;
        }
    }

    /**
     * 感情学習の同期指標を更新する
     */
    updateSyncMetrics(
        conceptName: string,
        stage: LearningStage,
        metrics: EmotionLearningSyncMetrics
    ): void {
        try {
            logger.info(`Updating emotion-learning sync metrics for concept ${conceptName} at stage ${stage}`);

            if (!this.syncMetricsData) {
                this.syncMetricsData = {};
            }

            if (!this.syncMetricsData[conceptName]) {
                this.syncMetricsData[conceptName] = {};
            }

            this.syncMetricsData[conceptName][stage] = {
                ...metrics,
                updatedAt: new Date().toISOString()
            };

            this.save().catch(err => {
                logger.warn(`Failed to save sync metrics data: ${err.message}`);
            });

            logger.debug(`Updated sync metrics for ${conceptName} at stage ${stage}`);
        } catch (error) {
            logger.error(`Failed to update sync metrics for ${conceptName}`, {
                error: error instanceof Error ? error.message : String(error),
                stage
            });
        }
    }

    /**
     * 特定の概念と学習段階の同期指標を取得する
     */
    getSyncMetrics(
        conceptName: string,
        stage: LearningStage
    ): (EmotionLearningSyncMetrics & { updatedAt: string }) | undefined {
        if (!this.syncMetricsData || !this.syncMetricsData[conceptName]) {
            return undefined;
        }

        return this.syncMetricsData[conceptName][stage];
    }

    /**
     * 章から感情ダイナミクスを更新する
     */
    async updateFromChapter(chapter: Chapter, options?: UpdateOptions): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            logger.info(`Updating emotional dynamics from chapter ${chapter.chapterNumber}`);

            if (options?.genre) {
                this.genre = options.genre;
                logger.debug(`Set genre to: ${this.genre}`);
            }

            // 章の感情分析を実行
            await this.analyzeAndStoreChapterEmotion(chapter);

            // テンション値を記録
            const tensionValue = this.calculateTensionFromChapter(chapter) / 10;
            this.tensionHistory.set(chapter.chapterNumber, tensionValue);
            this.tensionPoints.push({
                chapter: chapter.chapterNumber,
                level: Math.round(tensionValue * 10)
            });
            logger.debug(`Recorded tension value ${tensionValue} for chapter ${chapter.chapterNumber}`);

            await this.save();
            logger.info(`Successfully updated emotional dynamics from chapter ${chapter.chapterNumber}`);
        } catch (error) {
            logger.error(`Failed to update emotional dynamics from chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber: chapter.chapterNumber
            });
            throw error;
        }
    }

    /**
     * 章の内容からテンション値を計算（簡易実装）
     */
    private calculateTensionFromChapter(chapter: Chapter): number {
        const content = chapter.content.toLowerCase();
        let tensionScore = 5; // デフォルト

        // ジャンル別のテンション計算
        if (this.genre === 'business') {
            tensionScore = this.calculateBusinessTension(content);
        } else {
            tensionScore = this.calculateGeneralTension(content);
        }

        return Math.min(10, Math.max(1, tensionScore));
    }

    /**
     * ビジネスジャンルのテンション計算
     * @private
     */
    private calculateBusinessTension(content: string): number {
        let tensionScore = 5;

        const businessHighTensionKeywords = [
            '競合', '資金調達', '危機', '交渉', '決断', '締切', 'プレゼン',
            'ピッチ', '投資家', '破綻', '倒産', '買収', '合併', '対立',
            '困難', '挑戦', 'プレッシャー', 'リスク', '失敗', '成功'
        ];

        const businessLowTensionKeywords = [
            '計画', '分析', '検討', '研究', 'データ', '安定', '成長',
            '協力', 'チーム', '合意', '承認', '達成', '満足', '安心',
            'サポート', '支援', '信頼', '確実', '順調', '成果'
        ];

        let highCount = 0;
        let lowCount = 0;

        businessHighTensionKeywords.forEach(keyword => {
            const matches = content.match(new RegExp(keyword, 'g'));
            if (matches) highCount += matches.length;
        });

        businessLowTensionKeywords.forEach(keyword => {
            const matches = content.match(new RegExp(keyword, 'g'));
            if (matches) lowCount += matches.length;
        });

        const diff = highCount - lowCount;
        tensionScore += Math.min(4, Math.max(-4, diff / 3));

        return tensionScore;
    }

    /**
     * 一般的なテンション計算
     * @private
     */
    private calculateGeneralTension(content: string): number {
        let tensionScore = 5;

        const highTensionKeywords = [
            '戦い', '衝突', '危機', '緊張', '焦り', '恐怖', 'ショック',
            '争い', '葛藤', '対立', '爆発', '逃げる', '追いつめられ',
            'トラブル', '問題', '失敗', '批判', '挫折', '敗北'
        ];

        const lowTensionKeywords = [
            '平和', '穏やか', '安心', 'リラックス', '休息', '和解',
            '解決', '成功', '達成', '祝福', '笑顔', '喜び', '幸せ',
            '癒し', '落ち着き', '安定', '協力', '友情', '愛'
        ];

        let highCount = 0;
        let lowCount = 0;

        highTensionKeywords.forEach(keyword => {
            const matches = content.match(new RegExp(keyword, 'g'));
            if (matches) highCount += matches.length;
        });

        lowTensionKeywords.forEach(keyword => {
            const matches = content.match(new RegExp(keyword, 'g'));
            if (matches) lowCount += matches.length;
        });

        const diff = highCount - lowCount;
        tensionScore += Math.min(5, Math.max(-5, diff / 5));

        return tensionScore;
    }

    /**
     * 章の感情分析を保存
     */
    async analyzeAndStoreChapterEmotion(chapter: Chapter): Promise<ChapterEmotionAnalysis> {
        try {
            const emotion = await this.emotionalArcDesigner.analyzeChapterEmotion(
                chapter.content, 
                { genre: this.genre }
            );
            this.chapterEmotions.set(chapter.chapterNumber, emotion);

            this.emotionalTones.push({
                chapter: chapter.chapterNumber,
                tone: emotion.overallTone
            });

            logger.info(`Analyzed emotions for chapter ${chapter.chapterNumber}`);
            return emotion;
        } catch (error) {
            logger.error(`Failed to analyze emotions for chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber: chapter.chapterNumber
            });

            // デフォルトの感情分析結果を返す
            const defaultEmotion: ChapterEmotionAnalysis = {
                emotionalDimensions: {
                    hopeVsDespair: { start: 5, middle: 5, end: 5 },
                    comfortVsTension: { start: 5, middle: 5, end: 5 },
                    joyVsSadness: { start: 5, middle: 5, end: 5 },
                    empathyVsIsolation: { start: 5, middle: 5, end: 5 },
                    curiosityVsIndifference: { start: 5, middle: 5, end: 5 }
                },
                overallTone: '中立的',
                emotionalImpact: 5
            };

            this.chapterEmotions.set(chapter.chapterNumber, defaultEmotion);
            return defaultEmotion;
        }
    }

    /**
     * 感情アークを設計
     */
    async designEmotionalArc(chapterNumber: number): Promise<EmotionalArcDesign> {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            const pastEmotions: ChapterEmotionAnalysis[] = [];

            // 最大5章分の過去の感情データを取得
            for (let i = Math.max(1, chapterNumber - 5); i < chapterNumber; i++) {
                const emotion = this.chapterEmotions.get(i);
                if (emotion) {
                    pastEmotions.push(emotion);
                }
            }

            return this.emotionalArcDesigner.designEmotionalArc(
                chapterNumber, 
                pastEmotions, 
                { genre: this.genre }
            );
        } catch (error) {
            logger.error(`Failed to design emotional arc for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            // デフォルトの感情アーク設計を返す
            return {
                recommendedTone: "バランスのとれた中立的なトーン",
                emotionalJourney: {
                    opening: [
                        { dimension: "好奇心", level: 7 },
                        { dimension: "期待感", level: 6 }
                    ],
                    development: [
                        { dimension: "緊張感", level: 5 },
                        { dimension: "共感", level: 6 }
                    ],
                    conclusion: [
                        { dimension: "満足感", level: 7 },
                        { dimension: "希望", level: 6 }
                    ]
                },
                reason: "物語のこの段階では、読者の関心を維持しながらも感情的なバランスを保つことが重要です"
            };
        }
    }

    /**
     * エモーショナルカーブを取得
     */
    async getEmotionalCurve(startChapter: number, endChapter: number): Promise<EmotionalCurvePoint[]> {
        if (!this.initialized) {
            await this.initialize();
        }

        const curvePoints: EmotionalCurvePoint[] = [];

        const relevantTensionPoints = this.tensionPoints
            .filter(point => point.chapter >= startChapter && point.chapter <= endChapter)
            .sort((a, b) => a.chapter - b.chapter);

        const relevantEmotionalTones = this.emotionalTones
            .filter(point => point.chapter >= startChapter && point.chapter <= endChapter)
            .sort((a, b) => a.chapter - b.chapter);

        for (const tension of relevantTensionPoints) {
            const emotionalTone = relevantEmotionalTones.find(t => t.chapter === tension.chapter);

            curvePoints.push({
                chapter: tension.chapter,
                tension: tension.level,
                emotion: emotionalTone?.tone || 'neutral',
                event: undefined
            });
        }

        return curvePoints;
    }

    /**
     * 最適テンション計算
     */
    async calculateOptimalTension(chapterNumber: number): Promise<TensionRecommendation> {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            const totalChapters = await this.estimateTotalChapters();
            const recentTensions: number[] = [];
            
            for (let i = Math.max(1, chapterNumber - 5); i < chapterNumber; i++) {
                const tension = this.tensionHistory.get(i);
                if (tension !== undefined) {
                    recentTensions.push(tension);
                }
            }

            return this.dynamicTensionOptimizer.calculateOptimalTension(
                chapterNumber,
                totalChapters,
                this.genre,
                recentTensions
            );
        } catch (error) {
            logger.error('最適テンション計算に失敗しました', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            return {
                recommendedTension: 0.5,
                reason: "計算に失敗したためデフォルト値を使用",
                direction: "maintain"
            };
        }
    }

    /**
     * ペーシング推奨の生成
     */
    generatePacingRecommendation(tension: number): PacingRecommendation {
        return this.dynamicTensionOptimizer.generatePacingRecommendation(tension, this.genre);
    }

    /**
     * テンション・ペーシング推奨の両方を取得
     */
    async getTensionPacingRecommendation(chapterNumber: number): Promise<TensionPacingRecommendation> {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            const tension = await this.calculateOptimalTension(chapterNumber);
            const pacing = this.generatePacingRecommendation(tension.recommendedTension);

            return { tension, pacing };
        } catch (error) {
            logger.error('テンション・ペーシング推奨の取得に失敗しました', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            return {
                tension: {
                    recommendedTension: 0.5,
                    reason: "デフォルト値",
                    direction: "maintain"
                },
                pacing: {
                    recommendedPacing: 0.5,
                    description: "バランスの取れた標準的なペース"
                }
            };
        }
    }

    /**
     * 総チャプター数の推定
     */
    private async estimateTotalChapters(): Promise<number> {
        try {
            if (this.tensionPoints.length > 0) {
                const latestChapter = Math.max(...this.tensionPoints.map(tp => tp.chapter));
                const estimatedLength = Math.ceil(latestChapter * (1.5 + Math.random() * 0.5));
                return Math.max(estimatedLength, 24);
            }

            return 24;
        } catch (error) {
            logger.warn('総チャプター数の推定に失敗しました', { error });
            return 24;
        }
    }

    // ============================================================================
    // パブリックメソッド
    // ============================================================================

    public setGenre(genre: string): void {
        this.genre = genre;
        logger.debug(`Genre set to: ${this.genre}`);
    }

    public getGenre(): string {
        return this.genre;
    }

    public getChapterEmotion(chapterNumber: number): ChapterEmotionAnalysis | undefined {
        return this.chapterEmotions.get(chapterNumber);
    }

    public getCurrentTensionLevel(): number {
        if (this.tensionPoints.length === 0) {
            return 5;
        }

        const latestPoint = this.tensionPoints.sort((a, b) => b.chapter - a.chapter)[0];
        return latestPoint.level;
    }
}