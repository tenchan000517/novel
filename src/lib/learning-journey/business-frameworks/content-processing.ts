/**
 * @fileoverview コンテンツ処理ヘルパー
 * @description AI分析実行、コンテンツ処理、テキスト最適化を提供するヘルパー
 */

import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import {
    AIAnalysisOptions,
    EmotionalLearningIntegratorConfig
} from '../emotional-types';

/**
 * コンテンツ処理設定
 */
interface ContentProcessingConfig {
    maxContentLength: number;
    truncationSuffix: string;
    enableCaching: boolean;
    retryAttempts: number;
    timeoutMs: number;
}

/**
 * AI分析結果のキャッシュエントリ
 */
interface CacheEntry {
    result: string;
    timestamp: number;
    expirationMs: number;
}

/**
 * コンテンツ処理統計
 */
interface ProcessingStatistics {
    totalAnalyses: number;
    successfulAnalyses: number;
    failedAnalyses: number;
    cacheHits: number;
    cacheMisses: number;
    averageProcessingTime: number;
    totalContentProcessed: number;
    lastResetTime: string;
}

/**
 * コンテンツ処理ヘルパークラス
 */
export class ContentProcessingHelper {
    private config: ContentProcessingConfig;
    private analysisCache: Map<string, CacheEntry>;
    private statistics: ProcessingStatistics;

    constructor(
        private geminiClient: GeminiClient,
        private integratorConfig: Required<EmotionalLearningIntegratorConfig>
    ) {
        this.config = this.initializeConfig();
        this.analysisCache = new Map();
        this.statistics = this.initializeStatistics();
    }

    /**
     * 安全なAI分析実行
     * @param prompt 分析プロンプト
     * @param options 分析オプション
     * @param cacheKey キャッシュキー（オプション）
     * @returns AI分析結果
     */
    async executeAIAnalysis(
        prompt: string,
        options: AIAnalysisOptions,
        cacheKey?: string
    ): Promise<string> {
        const startTime = Date.now();
        this.statistics.totalAnalyses++;

        try {
            // キャッシュチェック
            if (cacheKey && this.config.enableCaching) {
                const cachedResult = this.getCachedResult(cacheKey);
                if (cachedResult) {
                    this.statistics.cacheHits++;
                    return cachedResult;
                }
                this.statistics.cacheMisses++;
            }

            // AI分析実行（リトライ付き）
            const result = await this.executeWithRetry(
                () => this.geminiClient.generateText(prompt, options),
                this.config.retryAttempts
            );

            // 結果をキャッシュに保存
            if (cacheKey && this.config.enableCaching) {
                this.setCachedResult(cacheKey, result);
            }

            this.updateSuccessStatistics(Date.now() - startTime);
            return result;

        } catch (error) {
            this.updateFailureStatistics(Date.now() - startTime);
            logger.error('AI analysis execution failed', { error, prompt: prompt.substring(0, 100) });
            throw error;
        }
    }

    /**
     * 安全なコンテンツ切り詰め
     * @param content 元コンテンツ
     * @param maxLength 最大長（オプション、設定デフォルトを使用）
     * @param preserveStructure 構造保持フラグ
     * @returns 切り詰められたコンテンツ
     */
    safeContentTruncation(
        content: string,
        maxLength?: number,
        preserveStructure = false
    ): string {
        if (!content || typeof content !== 'string') {
            return '';
        }

        const limit = maxLength || this.config.maxContentLength;
        this.statistics.totalContentProcessed += content.length;

        if (content.length <= limit) {
            return content;
        }

        if (preserveStructure) {
            return this.structuredTruncation(content, limit);
        } else {
            return this.simpleTruncation(content, limit);
        }
    }

    /**
     * コンテンツ品質評価
     * @param content コンテンツ
     * @returns 品質スコア (0-1)
     */
    evaluateContentQuality(content: string): {
        overallScore: number;
        factors: {
            lengthScore: number;
            structureScore: number;
            vocabularyScore: number;
            coherenceScore: number;
        };
    } {
        if (!content || typeof content !== 'string') {
            return {
                overallScore: 0,
                factors: {
                    lengthScore: 0,
                    structureScore: 0,
                    vocabularyScore: 0,
                    coherenceScore: 0
                }
            };
        }

        const factors = {
            lengthScore: this.calculateLengthScore(content),
            structureScore: this.calculateStructureScore(content),
            vocabularyScore: this.calculateVocabularyScore(content),
            coherenceScore: this.calculateCoherenceScore(content)
        };

        const overallScore = (
            factors.lengthScore * 0.2 +
            factors.structureScore * 0.3 +
            factors.vocabularyScore * 0.25 +
            factors.coherenceScore * 0.25
        );

        return { overallScore, factors };
    }

    /**
     * コンテンツの感情的キーワード抽出
     * @param content コンテンツ
     * @returns 感情的キーワード配列
     */
    extractEmotionalKeywords(content: string): {
        positive: string[];
        negative: string[];
        neutral: string[];
        intensity: number;
    } {
        if (!content || typeof content !== 'string') {
            return { positive: [], negative: [], neutral: [], intensity: 0 };
        }

        const emotionalLexicon = this.getEmotionalLexicon();
        const words = content.toLowerCase().split(/\s+/);

        const positive: string[] = [];
        const negative: string[] = [];
        const neutral: string[] = [];
        let totalIntensity = 0;

        for (const word of words) {
            const cleaned = word.replace(/[^\w]/g, '');
            if (emotionalLexicon.positive.includes(cleaned)) {
                positive.push(cleaned);
                totalIntensity += 1;
            } else if (emotionalLexicon.negative.includes(cleaned)) {
                negative.push(cleaned);
                totalIntensity += 1;
            } else if (emotionalLexicon.neutral.includes(cleaned)) {
                neutral.push(cleaned);
                totalIntensity += 0.5;
            }
        }

        const intensity = words.length > 0 ? totalIntensity / words.length : 0;

        return {
            positive: [...new Set(positive)],
            negative: [...new Set(negative)],
            neutral: [...new Set(neutral)],
            intensity
        };
    }

    /**
     * コンテンツの感情分析要約
     * @param content コンテンツ
     * @returns 感情分析要約
     */
    createEmotionalSummary(content: string): {
        dominantEmotion: string;
        emotionalProgression: string[];
        keyMoments: Array<{ position: number; emotion: string; intensity: number }>;
        overallTone: string;
    } {
        if (!content || typeof content !== 'string') {
            return {
                dominantEmotion: 'neutral',
                emotionalProgression: [],
                keyMoments: [],
                overallTone: 'neutral'
            };
        }

        // コンテンツを段落に分割
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

        if (paragraphs.length === 0) {
            return {
                dominantEmotion: 'neutral',
                emotionalProgression: [],
                keyMoments: [],
                overallTone: 'neutral'
            };
        }

        // 各段落の感情分析
        const paragraphAnalyses = paragraphs.map((paragraph, index) => {
            const keywords = this.extractEmotionalKeywords(paragraph);
            const dominantType = this.getDominantEmotionType(keywords);

            return {
                index,
                position: (index + 0.5) / paragraphs.length,
                emotion: dominantType,
                intensity: keywords.intensity,
                keywords
            };
        });

        // 主要感情の特定
        const emotionCounts = paragraphAnalyses.reduce((counts, analysis) => {
            counts[analysis.emotion] = (counts[analysis.emotion] || 0) + 1;
            return counts;
        }, {} as Record<string, number>);

        const dominantEmotion = Object.entries(emotionCounts)
            .sort(([, a], [, b]) => b - a)[0][0];

        // 感情の進行
        const emotionalProgression = paragraphAnalyses.map(analysis => analysis.emotion);

        // キーモーメントの抽出（高い強度を持つ段落）
        const keyMoments = paragraphAnalyses
            .filter(analysis => analysis.intensity > 0.1)
            .sort((a, b) => b.intensity - a.intensity)
            .slice(0, 5)
            .map(analysis => ({
                position: analysis.position,
                emotion: analysis.emotion,
                intensity: analysis.intensity
            }));

        // 全体トーンの判定
        const overallTone = this.determineOverallTone(paragraphAnalyses);

        return {
            dominantEmotion,
            emotionalProgression,
            keyMoments,
            overallTone
        };
    }

    /**
     * 処理統計情報の取得
     * @returns 処理統計情報
     */
    getProcessingStatistics(): ProcessingStatistics {
        return { ...this.statistics };
    }

    /**
     * キャッシュクリア
     */
    clearCache(): void {
        this.analysisCache.clear();
        logger.info('Analysis cache cleared');
    }

    /**
     * 統計リセット
     */
    resetStatistics(): void {
        this.statistics = this.initializeStatistics();
        logger.info('Processing statistics reset');
    }

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

    private initializeConfig(): ContentProcessingConfig {
        return {
            maxContentLength: 5000,
            truncationSuffix: '...(truncated)',
            enableCaching: this.integratorConfig.cacheEmotionalDesigns,
            retryAttempts: this.integratorConfig.maxRetries,
            timeoutMs: this.integratorConfig.timeoutMs
        };
    }

    private initializeStatistics(): ProcessingStatistics {
        return {
            totalAnalyses: 0,
            successfulAnalyses: 0,
            failedAnalyses: 0,
            cacheHits: 0,
            cacheMisses: 0,
            averageProcessingTime: 0,
            totalContentProcessed: 0,
            lastResetTime: new Date().toISOString()
        };
    }

    private async executeWithRetry<T>(
        operation: () => Promise<T>,
        maxAttempts: number
    ): Promise<T> {
        let lastError: Error | undefined;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await Promise.race([
                    operation(),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('Operation timeout')), this.config.timeoutMs)
                    )
                ]);
            } catch (error) {
                lastError = error as Error;
                logger.warn(`Analysis attempt ${attempt}/${maxAttempts} failed`, { error });

                if (attempt < maxAttempts) {
                    // 指数バックオフで再試行
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }

        throw lastError || new Error('All retry attempts failed');
    }

    private getCachedResult(key: string): string | null {
        const entry = this.analysisCache.get(key);

        if (!entry) {
            return null;
        }

        const now = Date.now();
        if (now > entry.timestamp + entry.expirationMs) {
            this.analysisCache.delete(key);
            return null;
        }

        return entry.result;
    }

    private setCachedResult(key: string, result: string): void {
        const entry: CacheEntry = {
            result,
            timestamp: Date.now(),
            expirationMs: 60 * 60 * 1000 // 1時間
        };

        this.analysisCache.set(key, entry);

        // キャッシュサイズ制限
        if (this.analysisCache.size > 100) {
            const keys = Array.from(this.analysisCache.keys());
            if (keys.length > 0) {
                this.analysisCache.delete(keys[0]);
            }
        }
    }

    private simpleTruncation(content: string, limit: number): string {
        return content.substring(0, limit) + this.config.truncationSuffix;
    }

    private structuredTruncation(content: string, limit: number): string {
        // 文単位での切り詰め
        const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 0);
        let result = '';

        for (const sentence of sentences) {
            const nextLength = result.length + sentence.length + 1; // +1 for punctuation
            if (nextLength > limit - this.config.truncationSuffix.length) {
                break;
            }
            result += sentence + '。';
        }

        return result + this.config.truncationSuffix;
    }

    private calculateLengthScore(content: string): number {
        const length = content.length;
        const idealMin = 1000;
        const idealMax = 5000;

        if (length >= idealMin && length <= idealMax) {
            return 1.0;
        } else if (length < idealMin) {
            return length / idealMin;
        } else {
            return idealMax / length;
        }
    }

    private calculateStructureScore(content: string): number {
        let score = 0;

        // 段落の存在
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        if (paragraphs.length >= 2) score += 0.3;

        // 句読点の適切な使用
        const punctuationCount = (content.match(/[。！？、]/g) || []).length;
        const wordsCount = content.split(/\s+/).length;
        const punctuationRatio = punctuationCount / wordsCount;
        if (punctuationRatio >= 0.1 && punctuationRatio <= 0.3) score += 0.4;

        // 文の長さのバランス
        const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 0);
        if (sentences.length > 0) {
            const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
            if (avgSentenceLength >= 20 && avgSentenceLength <= 100) score += 0.3;
        }

        return Math.min(1.0, score);
    }

    private calculateVocabularyScore(content: string): number {
        const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 0);
        const uniqueWords = new Set(words);

        if (words.length === 0) return 0;

        const vocabularyRichness = uniqueWords.size / words.length;

        // 0.5-0.8の範囲が理想的
        if (vocabularyRichness >= 0.5 && vocabularyRichness <= 0.8) {
            return 1.0;
        } else if (vocabularyRichness < 0.5) {
            return vocabularyRichness / 0.5;
        } else {
            return 0.8 / vocabularyRichness;
        }
    }

    private calculateCoherenceScore(content: string): number {
        // 接続詞の使用
        const connectiveWords = ['しかし', 'そして', 'また', 'さらに', 'つまり', 'したがって', 'なぜなら'];
        const connectiveCount = connectiveWords.reduce((count, word) =>
            count + (content.match(new RegExp(word, 'g')) || []).length, 0
        );

        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        const connectiveRatio = connectiveCount / Math.max(1, paragraphs.length);

        // 適度な接続詞使用が理想的
        return Math.min(1.0, connectiveRatio / 2);
    }

    private getEmotionalLexicon(): {
        positive: string[];
        negative: string[];
        neutral: string[];
    } {
        return {
            positive: [
                '喜び', '嬉しい', '幸せ', '満足', '成功', '達成', '希望', '期待',
                '興奮', '感動', '驚き', '発見', '成長', '進歩', '向上', '改善'
            ],
            negative: [
                '悲しい', '不安', '心配', '恐れ', '困惑', '混乱', '失敗', '挫折',
                '失望', 'フラストレーション', '怒り', '疲労', '困難', '問題', '課題'
            ],
            neutral: [
                '理解', '学習', '経験', '過程', '状況', '分析', '検討', '判断',
                '決定', '選択', '方法', '手段', '目標', '計画', '実行', '結果'
            ]
        };
    }

    private getDominantEmotionType(keywords: any): string {
        const { positive, negative, neutral } = keywords;

        if (positive.length > negative.length && positive.length > neutral.length) {
            return 'positive';
        } else if (negative.length > positive.length && negative.length > neutral.length) {
            return 'negative';
        } else {
            return 'neutral';
        }
    }

    private determineOverallTone(analyses: any[]): string {
        if (analyses.length === 0) return 'neutral';

        const emotionCounts = analyses.reduce((counts, analysis) => {
            counts[analysis.emotion] = (counts[analysis.emotion] || 0) + 1;
            return counts;
        }, {} as Record<string, number>);

        const totalAnalyses = analyses.length;
        const positiveRatio = (emotionCounts.positive || 0) / totalAnalyses;
        const negativeRatio = (emotionCounts.negative || 0) / totalAnalyses;

        if (positiveRatio > 0.6) {
            return 'optimistic';
        } else if (negativeRatio > 0.6) {
            return 'challenging';
        } else if (positiveRatio > negativeRatio) {
            return 'hopeful';
        } else if (negativeRatio > positiveRatio) {
            return 'reflective';
        } else {
            return 'balanced';
        }
    }

    private updateSuccessStatistics(processingTime: number): void {
        this.statistics.successfulAnalyses++;
        this.updateAverageProcessingTime(processingTime);
    }

    private updateFailureStatistics(processingTime: number): void {
        this.statistics.failedAnalyses++;
        this.updateAverageProcessingTime(processingTime);
    }

    private updateAverageProcessingTime(processingTime: number): void {
        const total = this.statistics.successfulAnalyses + this.statistics.failedAnalyses;
        this.statistics.averageProcessingTime =
            ((this.statistics.averageProcessingTime * (total - 1)) + processingTime) / total;
    }
}