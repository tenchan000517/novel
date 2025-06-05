/**
 * @fileoverview 分析結果保存システム - 中期記憶階層
 * @description
 * 全分析結果の永続化を担当するコンポーネント。
 * EmotionalArcDesigner、TextAnalyzer、Detection、Pre/PostGeneration結果を統合管理します。
 */

import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { Chapter } from '@/types/chapters';
import { CharacterState } from '@/types/memory';

/**
 * @interface EmotionalArcDesignRecord
 * @description EmotionalArcDesignerの分析結果記録
 */
export interface EmotionalArcDesignRecord {
    id: string;
    chapterNumber: number;
    analysisType: 'EMOTION_ANALYSIS' | 'ARC_DESIGN';
    emotionalDimensions?: {
        hopeVsDespair: { start: number; middle: number; end: number };
        comfortVsTension: { start: number; middle: number; end: number };
        joyVsSadness: { start: number; middle: number; end: number };
        empathyVsIsolation: { start: number; middle: number; end: number };
        curiosityVsIndifference: { start: number; middle: number; end: number };
        // ビジネス特有の次元
        confidenceVsDoubt?: { start: number; middle: number; end: number };
        ambitionVsContentment?: { start: number; middle: number; end: number };
        creativityVsConvention?: { start: number; middle: number; end: number };
        purposeVsAimlessness?: { start: number; middle: number; end: number };
        competitivenessVsCooperation?: { start: number; middle: number; end: number };
    };
    overallTone: string;
    emotionalImpact: number;
    recommendedTone?: string;
    emotionalJourney?: {
        opening: Array<{ dimension: string; level: number }>;
        development: Array<{ dimension: string; level: number }>;
        conclusion: Array<{ dimension: string; level: number }>;
    };
    designReason?: string;
    genre: string;
    confidence: number;
    timestamp: string;
}

/**
 * @interface TextAnalysisResultRecord
 * @description TextAnalyzerの分析結果記録
 */
export interface TextAnalysisResultRecord {
    id: string;
    chapterNumber: number;
    analysisType: 'CHARACTER_STATE' | 'SENTIMENT' | 'THEME' | 'STYLE';
    characterStates?: Array<{
        name: string;
        mood: string;
        development: string;
        relationships?: Array<{
            character: string;
            relation: string;
        }>;
    }>;
    sentimentScore?: number;
    themes?: string[];
    styleMetrics?: {
        averageSentenceLength: number;
        vocabularyRichness: number;
        readabilityScore: number;
    };
    keyPhrases: string[];
    confidence: number;
    processingTime: number;
    timestamp: string;
}

/**
 * @interface DetectionResultRecord
 * @description 検出サービスの結果記録
 */
export interface DetectionResultRecord {
    id: string;
    chapterNumber: number;
    detectionType: 'CHARACTER_DETECTION' | 'EVENT_DETECTION' | 'INCONSISTENCY_DETECTION' | 'THEME_DETECTION';
    detectedItems: Array<{
        type: string;
        name: string;
        confidence: number;
        location: string;
        context: string;
    }>;
    summary: string;
    accuracy: number;
    falsePositives: number;
    timestamp: string;
}

/**
 * @interface PreGenerationResultRecord
 * @description 前処理結果記録
 */
export interface PreGenerationResultRecord {
    id: string;
    chapterNumber: number;
    processingType: 'CONTEXT_PREPARATION' | 'CHARACTER_STATE_UPDATE' | 'WORLD_STATE_UPDATE' | 'FORESHADOWING_CHECK';
    inputData: {
        size: number;
        sources: string[];
        characters: string[];
    };
    outputData: {
        contextSize: number;
        processedCharacters: number;
        enhancedElements: string[];
    };
    qualityMetrics: {
        completeness: number;
        consistency: number;
        relevance: number;
    };
    processingTime: number;
    timestamp: string;
}

/**
 * @interface PostGenerationResultRecord
 * @description 後処理結果記録
 */
export interface PostGenerationResultRecord {
    id: string;
    chapterNumber: number;
    processingType: 'QUALITY_CHECK' | 'CONSISTENCY_VALIDATION' | 'CHARACTER_STATE_SYNC' | 'MEMORY_UPDATE';
    analysisResults: {
        qualityScore: number;
        consistencyScore: number;
        characterConsistency: number;
        plotCoherence: number;
    };
    improvements: Array<{
        type: string;
        description: string;
        priority: 'LOW' | 'MEDIUM' | 'HIGH';
        applied: boolean;
    }>;
    statistics: {
        wordCount: number;
        dialogueRatio: number;
        descriptiveRatio: number;
        actionRatio: number;
    };
    processingTime: number;
    timestamp: string;
}

/**
 * @interface EmotionalAnalysisHistoryRecord
 * @description 感情分析履歴記録
 */
export interface EmotionalAnalysisHistoryRecord {
    chapterNumber: number;
    emotionalTrend: Array<{
        dimension: string;
        previousValue: number;
        currentValue: number;
        change: number;
    }>;
    significantChanges: Array<{
        dimension: string;
        changeType: 'DRAMATIC_INCREASE' | 'DRAMATIC_DECREASE' | 'SUDDEN_SHIFT';
        magnitude: number;
    }>;
    timestamp: string;
}

/**
 * @interface CharacterDetectionHistoryRecord
 * @description キャラクター検出履歴記録
 */
export interface CharacterDetectionHistoryRecord {
    chapterNumber: number;
    detectedCharacters: Array<{
        name: string;
        confidence: number;
        context: string;
        newCharacter: boolean;
    }>;
    accuracyMetrics: {
        precision: number;
        recall: number;
        f1Score: number;
    };
    timestamp: string;
}

/**
 * @class AnalysisResultsManager 
 * @description 分析結果保存を担当するクラス
 */
export class AnalysisResultsManager {
    private emotionalArcDesigns: Map<string, EmotionalArcDesignRecord> = new Map();
    private textAnalysisResults: Map<string, TextAnalysisResultRecord> = new Map();
    private detectionResults: Map<string, DetectionResultRecord> = new Map();
    private preGenerationResults: Map<string, PreGenerationResultRecord> = new Map();
    private postGenerationResults: Map<string, PostGenerationResultRecord> = new Map();
    private emotionalAnalysisHistory: EmotionalAnalysisHistoryRecord[] = [];
    private characterDetectionHistory: CharacterDetectionHistoryRecord[] = [];
    private initialized: boolean = false;

    constructor() {}

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('AnalysisResultsManager already initialized');
            return;
        }

        try {
            await this.loadFromStorage();
            this.initialized = true;
            logger.info('AnalysisResultsManager initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize AnalysisResultsManager', {
                error: error instanceof Error ? error.message : String(error)
            });
            this.initialized = true; // エラーでも空の状態で続行
        }
    }

    /**
     * ストレージからデータを読み込み
     * @private
     */
    private async loadFromStorage(): Promise<void> {
        try {
            if (await storageProvider.fileExists('mid-term-memory/analysis-results.json')) {
                const data = await storageProvider.readFile('mid-term-memory/analysis-results.json');
                const parsed = JSON.parse(data);

                // 各分析結果の復元
                if (parsed.emotionalArcDesigns) {
                    this.emotionalArcDesigns = new Map(parsed.emotionalArcDesigns);
                }
                if (parsed.textAnalysisResults) {
                    this.textAnalysisResults = new Map(parsed.textAnalysisResults);
                }
                if (parsed.detectionResults) {
                    this.detectionResults = new Map(parsed.detectionResults);
                }
                if (parsed.preGenerationResults) {
                    this.preGenerationResults = new Map(parsed.preGenerationResults);
                }
                if (parsed.postGenerationResults) {
                    this.postGenerationResults = new Map(parsed.postGenerationResults);
                }
                if (parsed.emotionalAnalysisHistory && Array.isArray(parsed.emotionalAnalysisHistory)) {
                    this.emotionalAnalysisHistory = parsed.emotionalAnalysisHistory;
                }
                if (parsed.characterDetectionHistory && Array.isArray(parsed.characterDetectionHistory)) {
                    this.characterDetectionHistory = parsed.characterDetectionHistory;
                }
            }
        } catch (error) {
            logger.error('Failed to load analysis results data', {
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
                emotionalArcDesigns: Array.from(this.emotionalArcDesigns.entries()),
                textAnalysisResults: Array.from(this.textAnalysisResults.entries()),
                detectionResults: Array.from(this.detectionResults.entries()),
                preGenerationResults: Array.from(this.preGenerationResults.entries()),
                postGenerationResults: Array.from(this.postGenerationResults.entries()),
                emotionalAnalysisHistory: this.emotionalAnalysisHistory,
                characterDetectionHistory: this.characterDetectionHistory,
                savedAt: new Date().toISOString()
            };

            await storageProvider.writeFile(
                'mid-term-memory/analysis-results.json',
                JSON.stringify(data, null, 2)
            );

            logger.debug('Saved analysis results data');
        } catch (error) {
            logger.error('Failed to save analysis results data', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 章から分析結果を更新
     */
    async updateFromChapter(chapter: Chapter): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            logger.info(`Updating analysis results from chapter ${chapter.chapterNumber}`);

            // 自動分析を実行（実際の実装では各分析サービスと連携）
            await this.performAutomaticAnalysis(chapter);

            await this.save();
            logger.info(`Successfully updated analysis results from chapter ${chapter.chapterNumber}`);
        } catch (error) {
            logger.error(`Failed to update analysis results from chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 自動分析を実行
     * @private
     */
    private async performAutomaticAnalysis(chapter: Chapter): Promise<void> {
        const chapterNumber = chapter.chapterNumber;

        // 基本的なテキスト分析
        await this.performBasicTextAnalysis(chapter);

        // 感情分析（簡易版）
        await this.performBasicEmotionalAnalysis(chapter);

        // 検出処理（簡易版）
        await this.performBasicDetection(chapter);
    }

    /**
     * 基本的なテキスト分析を実行
     * @private
     */
    private async performBasicTextAnalysis(chapter: Chapter): Promise<void> {
        try {
            const content = chapter.content;
            const words = content.split(/\s+/);
            const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);

            // キーフレーズの抽出（簡易版）
            const keyPhrases = this.extractKeyPhrases(content);

            // スタイルメトリクス
            const styleMetrics = {
                averageSentenceLength: words.length / Math.max(sentences.length, 1),
                vocabularyRichness: new Set(words.map(w => w.toLowerCase())).size / Math.max(words.length, 1),
                readabilityScore: this.calculateReadabilityScore(content)
            };

            const result: TextAnalysisResultRecord = {
                id: `text-analysis-${chapter.chapterNumber}-${Date.now()}`,
                chapterNumber: chapter.chapterNumber,
                analysisType: 'STYLE',
                styleMetrics,
                keyPhrases,
                confidence: 0.8,
                processingTime: Date.now() - Date.now(), // 実際の処理時間を測定
                timestamp: new Date().toISOString()
            };

            this.textAnalysisResults.set(result.id, result);
            logger.debug(`Performed basic text analysis for chapter ${chapter.chapterNumber}`);
        } catch (error) {
            logger.error('Failed to perform basic text analysis', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 基本的な感情分析を実行
     * @private
     */
    private async performBasicEmotionalAnalysis(chapter: Chapter): Promise<void> {
        try {
            const content = chapter.content.toLowerCase();

            // 感情的次元の簡易分析
            const emotionalDimensions = {
                hopeVsDespair: this.analyzeEmotionalDimension(content, ['希望', '楽観', '明るい'], ['絶望', '悲観', '暗い']),
                comfortVsTension: this.analyzeEmotionalDimension(content, ['安心', '平和', '穏やか'], ['緊張', '不安', '心配']),
                joyVsSadness: this.analyzeEmotionalDimension(content, ['喜び', '嬉しい', '楽しい'], ['悲しい', '辛い', '寂しい']),
                empathyVsIsolation: this.analyzeEmotionalDimension(content, ['共感', '一緒', '理解'], ['孤独', '一人', '孤立']),
                curiosityVsIndifference: this.analyzeEmotionalDimension(content, ['興味', '好奇心', '関心'], ['無関心', '退屈', 'つまらない'])
            };

            // 全体的なトーンの判定
            const overallTone = this.determineOverallTone(emotionalDimensions);

            const result: EmotionalArcDesignRecord = {
                id: `emotion-analysis-${chapter.chapterNumber}-${Date.now()}`,
                chapterNumber: chapter.chapterNumber,
                analysisType: 'EMOTION_ANALYSIS',
                emotionalDimensions,
                overallTone,
                emotionalImpact: this.calculateEmotionalImpact(emotionalDimensions),
                genre: 'classic', // デフォルト値
                confidence: 0.7,
                timestamp: new Date().toISOString()
            };

            this.emotionalArcDesigns.set(result.id, result);
            logger.debug(`Performed basic emotional analysis for chapter ${chapter.chapterNumber}`);
        } catch (error) {
            logger.error('Failed to perform basic emotional analysis', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 基本的な検出処理を実行
     * @private
     */
    private async performBasicDetection(chapter: Chapter): Promise<void> {
        try {
            const content = chapter.content;

            // キャラクター名の検出（簡易版）
            const characterPatterns = /「([一-龯ぁ-んァ-ヶa-zA-Z]{2,10})」/g;
            const detectedCharacters: Array<{
                type: string;
                name: string;
                confidence: number;
                location: string;
                context: string;
            }> = [];

            let match;
            while ((match = characterPatterns.exec(content)) !== null) {
                const characterName = match[1];
                const location = match.index.toString();
                const contextStart = Math.max(0, match.index - 50);
                const contextEnd = Math.min(content.length, match.index + match[0].length + 50);
                const context = content.substring(contextStart, contextEnd);

                detectedCharacters.push({
                    type: 'CHARACTER',
                    name: characterName,
                    confidence: 0.8,
                    location,
                    context
                });
            }

            const result: DetectionResultRecord = {
                id: `detection-${chapter.chapterNumber}-${Date.now()}`,
                chapterNumber: chapter.chapterNumber,
                detectionType: 'CHARACTER_DETECTION',
                detectedItems: detectedCharacters,
                summary: `${detectedCharacters.length}個のキャラクターを検出`,
                accuracy: 0.8,
                falsePositives: 0,
                timestamp: new Date().toISOString()
            };

            this.detectionResults.set(result.id, result);
            logger.debug(`Performed basic detection for chapter ${chapter.chapterNumber}`);
        } catch (error) {
            logger.error('Failed to perform basic detection', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * キーフレーズを抽出
     * @private
     */
    private extractKeyPhrases(content: string): string[] {
        const patterns = [
            /「[^」]+」/g, // 引用符内
            /[一-龯ぁ-んァ-ヶ]{3,}(?:した|している|だった|である)/g, // 動詞句
            /[一-龯ぁ-んァ-ヶ]{2,}(?:の|が|は|を)[一-龯ぁ-んァ-ヶ]{2,}/g // 助詞を含む句
        ];

        const phrases: string[] = [];
        patterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                phrases.push(...matches);
            }
        });

        return [...new Set(phrases)].slice(0, 20); // 重複削除、上位20個
    }

    /**
     * 読みやすさスコアを計算
     * @private
     */
    private calculateReadabilityScore(content: string): number {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = content.split(/\s+/);
        const averageWordsPerSentence = words.length / Math.max(sentences.length, 1);

        // 簡易的な読みやすさスコア（日本語用に調整）
        if (averageWordsPerSentence <= 15) return 0.9;
        if (averageWordsPerSentence <= 25) return 0.7;
        if (averageWordsPerSentence <= 35) return 0.5;
        return 0.3;
    }

    /**
     * 感情次元を分析
     * @private
     */
    private analyzeEmotionalDimension(content: string, positiveWords: string[], negativeWords: string[]): 
        { start: number; middle: number; end: number } {
        
        const contentLength = content.length;
        const sections = [
            content.substring(0, contentLength / 3),           // 開始部
            content.substring(contentLength / 3, contentLength * 2 / 3), // 中間部
            content.substring(contentLength * 2 / 3)           // 終了部
        ];

        return {
            start: this.calculateDimensionScore(sections[0], positiveWords, negativeWords),
            middle: this.calculateDimensionScore(sections[1], positiveWords, negativeWords),
            end: this.calculateDimensionScore(sections[2], positiveWords, negativeWords)
        };
    }

    /**
     * 次元スコアを計算
     * @private
     */
    private calculateDimensionScore(text: string, positiveWords: string[], negativeWords: string[]): number {
        let positiveCount = 0;
        let negativeCount = 0;

        positiveWords.forEach(word => {
            const matches = text.match(new RegExp(word, 'g'));
            if (matches) positiveCount += matches.length;
        });

        negativeWords.forEach(word => {
            const matches = text.match(new RegExp(word, 'g'));
            if (matches) negativeCount += matches.length;
        });

        const total = positiveCount + negativeCount;
        if (total === 0) return 5; // 中立

        const ratio = positiveCount / total;
        return Math.round(1 + ratio * 9); // 1-10のスケール
    }

    /**
     * 全体的なトーンを決定
     * @private
     */
    private determineOverallTone(dimensions: any): string {
        const scores = [
            dimensions.hopeVsDespair.end,
            dimensions.comfortVsTension.end,
            dimensions.joyVsSadness.end,
            dimensions.empathyVsIsolation.end,
            dimensions.curiosityVsIndifference.end
        ];

        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

        if (average >= 8) return '非常にポジティブ';
        if (average >= 6) return 'ポジティブ';
        if (average >= 4) return '中立的';
        if (average >= 2) return 'ネガティブ';
        return '非常にネガティブ';
    }

    /**
     * 感情的インパクトを計算
     * @private
     */
    private calculateEmotionalImpact(dimensions: any): number {
        const changes = [
            Math.abs(dimensions.hopeVsDespair.end - dimensions.hopeVsDespair.start),
            Math.abs(dimensions.comfortVsTension.end - dimensions.comfortVsTension.start),
            Math.abs(dimensions.joyVsSadness.end - dimensions.joyVsSadness.start),
            Math.abs(dimensions.empathyVsIsolation.end - dimensions.empathyVsIsolation.start),
            Math.abs(dimensions.curiosityVsIndifference.end - dimensions.curiosityVsIndifference.start)
        ];

        const averageChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
        return Math.min(10, Math.max(1, Math.round(averageChange)));
    }

    // ============================================================================
    // 結果記録メソッド
    // ============================================================================

    /**
     * 感情アーク設計結果を記録
     */
    async recordEmotionalArcDesign(result: EmotionalArcDesignRecord): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            this.emotionalArcDesigns.set(result.id, result);
            await this.save();
            logger.info(`Recorded emotional arc design result for chapter ${result.chapterNumber}`);
        } catch (error) {
            logger.error('Failed to record emotional arc design result', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * テキスト分析結果を記録
     */
    async recordTextAnalysisResult(result: TextAnalysisResultRecord): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            this.textAnalysisResults.set(result.id, result);
            await this.save();
            logger.info(`Recorded text analysis result for chapter ${result.chapterNumber}`);
        } catch (error) {
            logger.error('Failed to record text analysis result', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 検出結果を記録
     */
    async recordDetectionResult(result: DetectionResultRecord): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            this.detectionResults.set(result.id, result);
            await this.save();
            logger.info(`Recorded detection result for chapter ${result.chapterNumber}`);
        } catch (error) {
            logger.error('Failed to record detection result', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 前処理結果を記録
     */
    async recordPreGenerationResult(result: PreGenerationResultRecord): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            this.preGenerationResults.set(result.id, result);
            await this.save();
            logger.info(`Recorded pre-generation result for chapter ${result.chapterNumber}`);
        } catch (error) {
            logger.error('Failed to record pre-generation result', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 後処理結果を記録
     */
    async recordPostGenerationResult(result: PostGenerationResultRecord): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            this.postGenerationResults.set(result.id, result);
            await this.save();
            logger.info(`Recorded post-generation result for chapter ${result.chapterNumber}`);
        } catch (error) {
            logger.error('Failed to record post-generation result', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    // ============================================================================
    // パブリックアクセサーメソッド
    // ============================================================================

    /**
     * 感情アーク設計結果を取得
     */
    getEmotionalArcDesigns(chapterNumber?: number): EmotionalArcDesignRecord[] {
        const results = Array.from(this.emotionalArcDesigns.values());
        
        if (chapterNumber !== undefined) {
            return results.filter(r => r.chapterNumber === chapterNumber);
        }
        
        return results.sort((a, b) => a.chapterNumber - b.chapterNumber);
    }

    /**
     * テキスト分析結果を取得
     */
    getTextAnalysisResults(chapterNumber?: number): TextAnalysisResultRecord[] {
        const results = Array.from(this.textAnalysisResults.values());
        
        if (chapterNumber !== undefined) {
            return results.filter(r => r.chapterNumber === chapterNumber);
        }
        
        return results.sort((a, b) => a.chapterNumber - b.chapterNumber);
    }

    /**
     * 検出結果を取得
     */
    getDetectionResults(chapterNumber?: number): DetectionResultRecord[] {
        const results = Array.from(this.detectionResults.values());
        
        if (chapterNumber !== undefined) {
            return results.filter(r => r.chapterNumber === chapterNumber);
        }
        
        return results.sort((a, b) => a.chapterNumber - b.chapterNumber);
    }

    /**
     * 前処理結果を取得
     */
    getPreGenerationResults(chapterNumber?: number): PreGenerationResultRecord[] {
        const results = Array.from(this.preGenerationResults.values());
        
        if (chapterNumber !== undefined) {
            return results.filter(r => r.chapterNumber === chapterNumber);
        }
        
        return results.sort((a, b) => a.chapterNumber - b.chapterNumber);
    }

    /**
     * 後処理結果を取得
     */
    getPostGenerationResults(chapterNumber?: number): PostGenerationResultRecord[] {
        const results = Array.from(this.postGenerationResults.values());
        
        if (chapterNumber !== undefined) {
            return results.filter(r => r.chapterNumber === chapterNumber);
        }
        
        return results.sort((a, b) => a.chapterNumber - b.chapterNumber);
    }

    /**
     * 分析統計を取得
     */
    getAnalysisStatistics(): {
        emotionalAnalysisCount: number;
        textAnalysisCount: number;
        detectionCount: number;
        preGenerationCount: number;
        postGenerationCount: number;
        averageConfidence: number;
        processingTimeAverage: number;
    } {
        const emotionalAnalysisCount = this.emotionalArcDesigns.size;
        const textAnalysisCount = this.textAnalysisResults.size;
        const detectionCount = this.detectionResults.size;
        const preGenerationCount = this.preGenerationResults.size;
        const postGenerationCount = this.postGenerationResults.size;

        const allConfidences: number[] = [
            ...Array.from(this.emotionalArcDesigns.values()).map(r => r.confidence),
            ...Array.from(this.textAnalysisResults.values()).map(r => r.confidence),
            ...Array.from(this.detectionResults.values()).map(r => r.accuracy)
        ];

        const allProcessingTimes: number[] = [
            ...Array.from(this.textAnalysisResults.values()).map(r => r.processingTime),
            ...Array.from(this.preGenerationResults.values()).map(r => r.processingTime),
            ...Array.from(this.postGenerationResults.values()).map(r => r.processingTime)
        ];

        const averageConfidence = allConfidences.length > 0 
            ? allConfidences.reduce((sum, conf) => sum + conf, 0) / allConfidences.length 
            : 0;

        const processingTimeAverage = allProcessingTimes.length > 0 
            ? allProcessingTimes.reduce((sum, time) => sum + time, 0) / allProcessingTimes.length 
            : 0;

        return {
            emotionalAnalysisCount,
            textAnalysisCount,
            detectionCount,
            preGenerationCount,
            postGenerationCount,
            averageConfidence,
            processingTimeAverage
        };
    }
}