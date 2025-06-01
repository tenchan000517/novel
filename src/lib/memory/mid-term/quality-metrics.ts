/**
 * @fileoverview 品質指標管理システム - 中期記憶階層
 * @description
 * システム全体の品質指標を監視・管理するコンポーネント。
 * 章品質、システム品質、診断履歴、健康メトリクスを統合管理します。
 */

import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { Chapter } from '@/types/chapters';
import {
    QualityMetricsData,
    ChapterQualityRecord,
    SystemQualityMetricsRecord,
    DiagnosticHistoryRecord,
    SystemHealthMetricsRecord
} from '../core/types';

/**
 * @interface QualityThresholds
 * @description 品質しきい値設定
 */
export interface QualityThresholds {
    excellent: number;    // 優秀: 8.5以上
    good: number;        // 良好: 7.0以上
    acceptable: number;  // 許容: 5.5以上
    poor: number;        // 要改善: 4.0以上
    critical: number;    // 危険: 4.0未満
}

/**
 * @interface QualityMetricsConfig
 * @description 品質指標設定
 */
export interface QualityMetricsConfig {
    thresholds: QualityThresholds;
    monitoringEnabled: boolean;
    autoAlertEnabled: boolean;
    historyRetentionDays: number;
    qualityAnalysisDepth: 'BASIC' | 'STANDARD' | 'COMPREHENSIVE';
}

/**
 * @interface ChapterQualityAnalysis
 * @description 章品質分析結果
 */
export interface ChapterQualityAnalysis {
    readabilityScore: number;
    consistencyScore: number;
    engagementScore: number;
    characterDevelopmentScore: number;
    plotCoherenceScore: number;
    dialogueQualityScore: number;
    descriptiveQualityScore: number;
    pacingScore: number;
    thematicConsistencyScore: number;
    emotionalImpactScore: number;
}

/**
 * @interface SystemHealthAnalysis
 * @description システム健康状態分析
 */
export interface SystemHealthAnalysis {
    memoryEfficiency: number;
    processingSpeed: number;
    errorRate: number;
    dataIntegrity: number;
    userSatisfaction: number;
    systemStability: number;
    resourceUtilization: number;
    performanceTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

/**
 * @class QualityMetricsManager
 * @description 品質指標管理を担当するクラス
 */
export class QualityMetricsManager {
    private config: QualityMetricsConfig;
    private qualityData: QualityMetricsData;
    private initialized: boolean = false;
    private lastAnalysisTime: string = '';
    private alertHistory: Array<{
        timestamp: string;
        type: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        message: string;
        resolved: boolean;
    }> = [];

    constructor(config?: Partial<QualityMetricsConfig>) {
        this.config = {
            thresholds: {
                excellent: 8.5,
                good: 7.0,
                acceptable: 5.5,
                poor: 4.0,
                critical: 4.0
            },
            monitoringEnabled: true,
            autoAlertEnabled: true,
            historyRetentionDays: 30,
            qualityAnalysisDepth: 'STANDARD',
            ...config
        };

        this.qualityData = {
            chapterQualityHistory: [],
            systemQualityMetrics: [],
            diagnosticHistory: [],
            systemHealthMetrics: []
        };
    }

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('QualityMetricsManager already initialized');
            return;
        }

        try {
            await this.loadFromStorage();
            this.initialized = true;
            this.lastAnalysisTime = new Date().toISOString();
            
            logger.info('QualityMetricsManager initialized successfully', {
                config: this.config,
                dataLoaded: {
                    chapterQuality: this.qualityData.chapterQualityHistory.length,
                    systemMetrics: this.qualityData.systemQualityMetrics.length,
                    diagnosticHistory: this.qualityData.diagnosticHistory.length,
                    healthMetrics: this.qualityData.systemHealthMetrics.length
                }
            });
        } catch (error) {
            logger.error('Failed to initialize QualityMetricsManager', {
                error: error instanceof Error ? error.message : String(error)
            });
            this.initialized = true; // エラーでも続行
        }
    }

    /**
     * ストレージからデータを読み込み
     * @private
     */
    private async loadFromStorage(): Promise<void> {
        try {
            if (await storageProvider.fileExists('mid-term-memory/quality-metrics.json')) {
                const data = await storageProvider.readFile('mid-term-memory/quality-metrics.json');
                const parsed = JSON.parse(data);

                // データ構造の検証と復元
                this.qualityData = {
                    chapterQualityHistory: Array.isArray(parsed.chapterQualityHistory) ? 
                        parsed.chapterQualityHistory : [],
                    systemQualityMetrics: Array.isArray(parsed.systemQualityMetrics) ? 
                        parsed.systemQualityMetrics : [],
                    diagnosticHistory: Array.isArray(parsed.diagnosticHistory) ? 
                        parsed.diagnosticHistory : [],
                    systemHealthMetrics: Array.isArray(parsed.systemHealthMetrics) ? 
                        parsed.systemHealthMetrics : []
                };

                // アラート履歴の復元
                if (Array.isArray(parsed.alertHistory)) {
                    this.alertHistory = parsed.alertHistory;
                }

                // 最後の分析時間の復元
                if (parsed.lastAnalysisTime) {
                    this.lastAnalysisTime = parsed.lastAnalysisTime;
                }

                // 古いデータのクリーンアップ
                await this.cleanupOldData();
            }
        } catch (error) {
            logger.error('Failed to load quality metrics data', {
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
                qualityData: this.qualityData,
                alertHistory: this.alertHistory,
                lastAnalysisTime: this.lastAnalysisTime,
                config: this.config,
                savedAt: new Date().toISOString()
            };

            await storageProvider.writeFile(
                'mid-term-memory/quality-metrics.json',
                JSON.stringify(data, null, 2)
            );

            logger.debug('Saved quality metrics data', {
                chapterQualityCount: this.qualityData.chapterQualityHistory.length,
                systemMetricsCount: this.qualityData.systemQualityMetrics.length
            });
        } catch (error) {
            logger.error('Failed to save quality metrics data', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 章から品質指標を更新
     */
    async updateFromChapter(chapter: Chapter): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            logger.info(`Updating quality metrics from chapter ${chapter.chapterNumber}`);

            // 章品質分析の実行
            const chapterQuality = await this.analyzeChapterQuality(chapter);
            
            // 章品質記録を追加
            const qualityRecord: ChapterQualityRecord = {
                chapterNumber: chapter.chapterNumber,
                qualityScore: chapterQuality.overallScore,
                qualityFactors: {
                    readability: chapterQuality.analysis.readabilityScore,
                    consistency: chapterQuality.analysis.consistencyScore,
                    engagement: chapterQuality.analysis.engagementScore,
                    characterDevelopment: chapterQuality.analysis.characterDevelopmentScore,
                    plotCoherence: chapterQuality.analysis.plotCoherenceScore,
                    dialogueQuality: chapterQuality.analysis.dialogueQualityScore,
                    pacing: chapterQuality.analysis.pacingScore
                },
                timestamp: new Date().toISOString()
            };

            this.qualityData.chapterQualityHistory.push(qualityRecord);

            // システム品質メトリクスの更新
            await this.updateSystemQualityMetrics(chapter, chapterQuality);

            // 品質診断の実行
            await this.performQualityDiagnostic(chapter, chapterQuality);

            // システム健康メトリクスの更新
            await this.updateSystemHealthMetrics();

            // アラートチェック
            if (this.config.autoAlertEnabled) {
                await this.checkQualityAlerts(qualityRecord);
            }

            this.lastAnalysisTime = new Date().toISOString();
            await this.save();

            logger.info(`Successfully updated quality metrics from chapter ${chapter.chapterNumber}`, {
                qualityScore: qualityRecord.qualityScore,
                qualityLevel: this.getQualityLevel(qualityRecord.qualityScore)
            });
        } catch (error) {
            logger.error(`Failed to update quality metrics from chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 章品質を分析
     * @private
     */
    private async analyzeChapterQuality(chapter: Chapter): Promise<{
        overallScore: number;
        analysis: ChapterQualityAnalysis;
    }> {
        const content = chapter.content;
        const wordCount = content.split(/\s+/).length;
        const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        const paragraphCount = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

        const analysis: ChapterQualityAnalysis = {
            readabilityScore: this.calculateReadabilityScore(content, wordCount, sentenceCount),
            consistencyScore: this.calculateConsistencyScore(chapter),
            engagementScore: this.calculateEngagementScore(content),
            characterDevelopmentScore: this.calculateCharacterDevelopmentScore(content),
            plotCoherenceScore: this.calculatePlotCoherenceScore(chapter),
            dialogueQualityScore: this.calculateDialogueQualityScore(content),
            descriptiveQualityScore: this.calculateDescriptiveQualityScore(content),
            pacingScore: this.calculatePacingScore(content, wordCount, paragraphCount),
            thematicConsistencyScore: this.calculateThematicConsistencyScore(content),
            emotionalImpactScore: this.calculateEmotionalImpactScore(content)
        };

        // 総合スコアの計算（重み付き平均）
        const weights = {
            readability: 0.15,
            consistency: 0.15,
            engagement: 0.15,
            characterDevelopment: 0.12,
            plotCoherence: 0.12,
            dialogueQuality: 0.10,
            descriptiveQuality: 0.08,
            pacing: 0.08,
            thematicConsistency: 0.03,
            emotionalImpact: 0.02
        };

        const overallScore = (
            analysis.readabilityScore * weights.readability +
            analysis.consistencyScore * weights.consistency +
            analysis.engagementScore * weights.engagement +
            analysis.characterDevelopmentScore * weights.characterDevelopment +
            analysis.plotCoherenceScore * weights.plotCoherence +
            analysis.dialogueQualityScore * weights.dialogueQuality +
            analysis.descriptiveQualityScore * weights.descriptiveQuality +
            analysis.pacingScore * weights.pacing +
            analysis.thematicConsistencyScore * weights.thematicConsistency +
            analysis.emotionalImpactScore * weights.emotionalImpact
        );

        return { overallScore, analysis };
    }

    /**
     * 読みやすさスコアを計算
     * @private
     */
    private calculateReadabilityScore(content: string, wordCount: number, sentenceCount: number): number {
        if (sentenceCount === 0) return 5.0;

        const avgWordsPerSentence = wordCount / sentenceCount;
        const complexWordRatio = this.calculateComplexWordRatio(content);
        
        // 日本語向け読みやすさ指標
        let score = 10.0;
        
        // 文の長さペナルティ
        if (avgWordsPerSentence > 30) score -= 2.0;
        else if (avgWordsPerSentence > 20) score -= 1.0;
        else if (avgWordsPerSentence < 8) score -= 0.5;
        
        // 複雑語彙のペナルティ
        score -= complexWordRatio * 3.0;
        
        return Math.max(1.0, Math.min(10.0, score));
    }

    /**
     * 複雑語彙比率を計算
     * @private
     */
    private calculateComplexWordRatio(content: string): number {
        const words = content.split(/\s+/);
        const complexWords = words.filter(word => 
            word.length > 8 || 
            /[一-龯]{4,}/.test(word) || // 4文字以上の漢字
            /[ァ-ヶー]{6,}/.test(word)   // 6文字以上のカタカナ
        );
        
        return words.length > 0 ? complexWords.length / words.length : 0;
    }

    /**
     * 一貫性スコアを計算
     * @private
     */
    private calculateConsistencyScore(chapter: Chapter): number {
        // 基本スコア
        let score = 8.0;
        
        // メタデータの一貫性チェック
        if (!chapter.metadata) score -= 2.0;
        if (!chapter.metadata?.characters || chapter.metadata.characters.length === 0) score -= 1.0;
        if (!chapter.metadata?.events || chapter.metadata.events.length === 0) score -= 0.5;
        
        // 文体の一貫性（簡易チェック）
        const content = chapter.content;
        const formalityChanges = this.detectFormalityChanges(content);
        score -= formalityChanges * 0.5;
        
        return Math.max(1.0, Math.min(10.0, score));
    }

    /**
     * 敬語変化を検出
     * @private
     */
    private detectFormalityChanges(content: string): number {
        const sentences = content.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
        let changes = 0;
        let lastFormality: 'formal' | 'casual' | 'unknown' = 'unknown';
        
        for (const sentence of sentences) {
            const formality = this.detectSentenceFormality(sentence);
            if (lastFormality !== 'unknown' && formality !== 'unknown' && lastFormality !== formality) {
                changes++;
            }
            if (formality !== 'unknown') {
                lastFormality = formality;
            }
        }
        
        return changes;
    }

    /**
     * 文の敬語レベルを検出
     * @private
     */
    private detectSentenceFormality(sentence: string): 'formal' | 'casual' | 'unknown' {
        const formalPatterns = /です|ます|であります|でございます|いたします/;
        const casualPatterns = /だ(?![し])|である|だね|だよ|じゃん/;
        
        if (formalPatterns.test(sentence)) return 'formal';
        if (casualPatterns.test(sentence)) return 'casual';
        return 'unknown';
    }

    /**
     * エンゲージメントスコアを計算
     * @private
     */
    private calculateEngagementScore(content: string): number {
        let score = 5.0;
        
        // 対話の存在
        const dialogueRatio = this.calculateDialogueRatio(content);
        score += dialogueRatio * 2.0;
        
        // アクションの存在
        const actionCount = this.countActionWords(content);
        score += Math.min(2.0, actionCount / 100);
        
        // 感情表現の存在
        const emotionCount = this.countEmotionalExpressions(content);
        score += Math.min(1.5, emotionCount / 50);
        
        return Math.max(1.0, Math.min(10.0, score));
    }

    /**
     * 対話比率を計算
     * @private
     */
    private calculateDialogueRatio(content: string): number {
        const dialogueMatches = content.match(/「[^」]*」/g) || [];
        const totalDialogueLength = dialogueMatches.reduce((sum, dialogue) => sum + dialogue.length, 0);
        return content.length > 0 ? totalDialogueLength / content.length : 0;
    }

    /**
     * アクション語彙をカウント
     * @private
     */
    private countActionWords(content: string): number {
        const actionWords = [
            '走る', '歩く', '立つ', '座る', '動く', '止まる', '進む', '戻る',
            '投げる', '取る', '掴む', '押す', '引く', '持つ', '放す',
            '見る', '聞く', '話す', '言う', '叫ぶ', 'ささやく',
            '笑う', '泣く', '怒る', '驚く', '喜ぶ', '悲しむ'
        ];
        
        let count = 0;
        for (const word of actionWords) {
            const matches = content.match(new RegExp(word, 'g'));
            if (matches) count += matches.length;
        }
        
        return count;
    }

    /**
     * 感情表現をカウント
     * @private
     */
    private countEmotionalExpressions(content: string): number {
        const emotionPatterns = [
            /嬉しい|楽しい|幸せ|喜び|満足/g,
            /悲しい|辛い|寂しい|切ない|苦しい/g,
            /怒り|腹立つ|むかつく|イライラ/g,
            /不安|心配|怖い|恐怖|緊張/g,
            /驚き|びっくり|ショック|意外/g
        ];
        
        let count = 0;
        for (const pattern of emotionPatterns) {
            const matches = content.match(pattern);
            if (matches) count += matches.length;
        }
        
        return count;
    }

    /**
     * キャラクター発展スコアを計算
     * @private
     */
    private calculateCharacterDevelopmentScore(content: string): number {
        let score = 6.0;
        
        // キャラクター言及の多様性
        const characterMentions = this.extractCharacterMentions(content);
        if (characterMentions.length > 3) score += 1.0;
        if (characterMentions.length > 5) score += 0.5;
        
        // 成長・変化の言及
        const developmentPatterns = [
            /成長|発展|進歩|向上|改善/g,
            /変化|変わる|変える|転換|転機/g,
            /学ぶ|習得|理解|気づく|悟る/g
        ];
        
        for (const pattern of developmentPatterns) {
            const matches = content.match(pattern);
            if (matches) score += Math.min(1.0, matches.length * 0.2);
        }
        
        return Math.max(1.0, Math.min(10.0, score));
    }

    /**
     * キャラクター言及を抽出
     * @private
     */
    private extractCharacterMentions(content: string): string[] {
        const characterPattern = /「([一-龯ぁ-んァ-ヶa-zA-Z]{2,10})」|([一-龯ぁ-んァ-ヶ]{2,8})(?:は|が|を|に|の)/g;
        const mentions = new Set<string>();
        let match;
        
        while ((match = characterPattern.exec(content)) !== null) {
            const name = match[1] || match[2];
            if (name && name.length >= 2) {
                mentions.add(name);
            }
        }
        
        return Array.from(mentions);
    }

    /**
     * プロット整合性スコアを計算
     * @private
     */
    private calculatePlotCoherenceScore(chapter: Chapter): number {
        let score = 7.0;
        
        // 基本構造の存在
        if (chapter.metadata?.events && chapter.metadata.events.length > 0) {
            score += 1.0;
        }
        
        if (chapter.metadata?.foreshadowing && chapter.metadata.foreshadowing.length > 0) {
            score += 0.5;
        }
        
        if (chapter.metadata?.resolutions && chapter.metadata.resolutions.length > 0) {
            score += 0.5;
        }
        
        // 内容の論理性（簡易チェック）
        const logicalConnectors = this.countLogicalConnectors(chapter.content);
        score += Math.min(1.0, logicalConnectors / 20);
        
        return Math.max(1.0, Math.min(10.0, score));
    }

    /**
     * 論理接続詞をカウント
     * @private
     */
    private countLogicalConnectors(content: string): number {
        const connectors = [
            'そして', 'それから', '次に', 'さらに', 'また',
            'しかし', 'だが', 'けれど', 'ところが',
            'なぜなら', 'なので', 'したがって', 'そのため',
            'つまり', 'すなわち', '要するに', '例えば'
        ];
        
        let count = 0;
        for (const connector of connectors) {
            const matches = content.match(new RegExp(connector, 'g'));
            if (matches) count += matches.length;
        }
        
        return count;
    }

    /**
     * 対話品質スコアを計算
     * @private
     */
    private calculateDialogueQualityScore(content: string): number {
        const dialogues = content.match(/「[^」]*」/g) || [];
        if (dialogues.length === 0) return 5.0; // 対話がない場合は中立
        
        let score = 6.0;
        
        // 対話の長さの多様性
        const lengths = dialogues.map(d => d.length);
        const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
        const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
        
        if (variance > 100) score += 1.0; // 多様性ボーナス
        
        // 自然な会話パターン
        const naturalPatterns = [
            /ですね|そうですね|はい|いいえ/g,
            /でしょう|だろう|かもしれ|かな/g,
            /！|\?|？|\.{3}|…/g
        ];
        
        for (const pattern of naturalPatterns) {
            const matches = content.match(pattern);
            if (matches) score += Math.min(0.5, matches.length * 0.1);
        }
        
        return Math.max(1.0, Math.min(10.0, score));
    }

    /**
     * 描写品質スコアを計算
     * @private
     */
    private calculateDescriptiveQualityScore(content: string): number {
        let score = 6.0;
        
        // 感覚的描写
        const sensoryWords = [
            '見る', '見える', '眺める', '輝く', '光る', '暗い', '明るい',
            '聞く', '聞こえる', '音', '声', '響く', '静か',
            '匂い', '香り', '臭い', '嗅ぐ',
            '触る', '触れる', '感触', '温かい', '冷たい', '柔らかい', '硬い',
            '味', '甘い', '苦い', '酸っぱい', '辛い'
        ];
        
        let sensoryCount = 0;
        for (const word of sensoryWords) {
            const matches = content.match(new RegExp(word, 'g'));
            if (matches) sensoryCount += matches.length;
        }
        
        score += Math.min(2.0, sensoryCount / 30);
        
        // 比喩・修辞技法
        const rhetoricalPatterns = [
            /のように|みたいに|といった|という感じ/g,
            /まるで|あたかも|さながら/g
        ];
        
        for (const pattern of rhetoricalPatterns) {
            const matches = content.match(pattern);
            if (matches) score += Math.min(1.0, matches.length * 0.3);
        }
        
        return Math.max(1.0, Math.min(10.0, score));
    }

    /**
     * ペーシングスコアを計算
     * @private
     */
    private calculatePacingScore(content: string, wordCount: number, paragraphCount: number): number {
        if (paragraphCount === 0) return 5.0;
        
        const avgWordsPerParagraph = wordCount / paragraphCount;
        let score = 7.0;
        
        // 段落長の適切性
        if (avgWordsPerParagraph < 20) score -= 1.0; // 短すぎる
        else if (avgWordsPerParagraph > 150) score -= 1.5; // 長すぎる
        else if (avgWordsPerParagraph >= 40 && avgWordsPerParagraph <= 80) score += 1.0; // 適切
        
        // ペースの変化
        const sentences = content.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
        const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
        
        if (sentenceLengths.length > 1) {
            const variance = this.calculateVariance(sentenceLengths);
            if (variance > 10 && variance < 50) score += 0.5; // 適度な変化
        }
        
        return Math.max(1.0, Math.min(10.0, score));
    }

    /**
     * 分散を計算
     * @private
     */
    private calculateVariance(numbers: number[]): number {
        if (numbers.length === 0) return 0;
        
        const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
        const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
        
        return variance;
    }

    /**
     * テーマ一貫性スコアを計算
     * @private
     */
    private calculateThematicConsistencyScore(content: string): number {
        // 簡易的なテーマ語彙分析
        const themeWords = [
            '愛', '友情', '家族', '絆', '信頼', '裏切り',
            '成長', '挑戦', '困難', '克服', '希望', '絶望',
            '正義', '悪', '善', '道徳', '倫理',
            '夢', '目標', '野望', '志', '理想'
        ];
        
        let themeCount = 0;
        for (const word of themeWords) {
            const matches = content.match(new RegExp(word, 'g'));
            if (matches) themeCount += matches.length;
        }
        
        return Math.max(1.0, Math.min(10.0, 5.0 + Math.min(3.0, themeCount / 10)));
    }

    /**
     * 感情的インパクトスコアを計算
     * @private
     */
    private calculateEmotionalImpactScore(content: string): number {
        const emotionalIntensityWords = [
            '激しく', '強く', '深く', '心から', '全身で',
            '涙', '震える', '鼓動', '息づく', '胸が',
            '衝撃', '感動', '感激', '興奮', '陶酔'
        ];
        
        let intensityCount = 0;
        for (const word of emotionalIntensityWords) {
            const matches = content.match(new RegExp(word, 'g'));
            if (matches) intensityCount += matches.length;
        }
        
        return Math.max(1.0, Math.min(10.0, 4.0 + Math.min(4.0, intensityCount / 8)));
    }

    /**
     * システム品質メトリクスを更新
     * @private
     */
    private async updateSystemQualityMetrics(chapter: Chapter, chapterQuality: any): Promise<void> {
        const metrics: SystemQualityMetricsRecord[] = [
            {
                metricType: 'CHAPTER_QUALITY_AVERAGE',
                value: chapterQuality.overallScore,
                trend: this.calculateQualityTrend(),
                timestamp: new Date().toISOString()
            },
            {
                metricType: 'READABILITY_TREND',
                value: chapterQuality.analysis.readabilityScore,
                trend: 'STABLE',
                timestamp: new Date().toISOString()
            },
            {
                metricType: 'CONSISTENCY_TREND',
                value: chapterQuality.analysis.consistencyScore,
                trend: 'STABLE',
                timestamp: new Date().toISOString()
            }
        ];

        this.qualityData.systemQualityMetrics.push(...metrics);
        
        // 履歴制限
        if (this.qualityData.systemQualityMetrics.length > 1000) {
            this.qualityData.systemQualityMetrics = this.qualityData.systemQualityMetrics.slice(-1000);
        }
    }

    /**
     * 品質トレンドを計算
     * @private
     */
    private calculateQualityTrend(): 'IMPROVING' | 'STABLE' | 'DECLINING' {
        const recentQualities = this.qualityData.chapterQualityHistory
            .slice(-5)
            .map(record => record.qualityScore);
        
        if (recentQualities.length < 3) return 'STABLE';
        
        const firstHalf = recentQualities.slice(0, Math.floor(recentQualities.length / 2));
        const secondHalf = recentQualities.slice(Math.floor(recentQualities.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
        
        const difference = secondAvg - firstAvg;
        
        if (difference > 0.5) return 'IMPROVING';
        if (difference < -0.5) return 'DECLINING';
        return 'STABLE';
    }

    /**
     * 品質診断を実行
     * @private
     */
    private async performQualityDiagnostic(chapter: Chapter, chapterQuality: any): Promise<void> {
        const issues: string[] = [];
        const recommendations: string[] = [];
        
        // 品質しきい値チェック
        if (chapterQuality.overallScore < this.config.thresholds.poor) {
            issues.push(`Chapter ${chapter.chapterNumber} quality below acceptable threshold`);
            recommendations.push('Review and improve chapter content');
        }
        
        if (chapterQuality.analysis.readabilityScore < 6.0) {
            issues.push('Low readability score detected');
            recommendations.push('Simplify sentence structure and vocabulary');
        }
        
        if (chapterQuality.analysis.consistencyScore < 6.0) {
            issues.push('Consistency issues detected');
            recommendations.push('Review character and plot consistency');
        }
        
        const diagnostic: DiagnosticHistoryRecord = {
            diagnosticType: 'QUALITY_ANALYSIS',
            results: {
                overallScore: chapterQuality.overallScore,
                analysisDetails: chapterQuality.analysis,
                qualityLevel: this.getQualityLevel(chapterQuality.overallScore)
            },
            issues,
            timestamp: new Date().toISOString()
        };
        
        this.qualityData.diagnosticHistory.push(diagnostic);
        
        // 履歴制限
        if (this.qualityData.diagnosticHistory.length > 500) {
            this.qualityData.diagnosticHistory = this.qualityData.diagnosticHistory.slice(-500);
        }
    }

    /**
     * システム健康メトリクスを更新
     * @private
     */
    private async updateSystemHealthMetrics(): Promise<void> {
        const healthAnalysis = await this.analyzeSystemHealth();
        
        const healthMetrics: SystemHealthMetricsRecord = {
            healthScore: healthAnalysis.overallHealth,
            healthFactors: {
                memoryEfficiency: healthAnalysis.memoryEfficiency,
                processingSpeed: healthAnalysis.processingSpeed,
                errorRate: healthAnalysis.errorRate,
                dataIntegrity: healthAnalysis.dataIntegrity,
                systemStability: healthAnalysis.systemStability
            },
            recommendations: this.generateHealthRecommendations(healthAnalysis),
            timestamp: new Date().toISOString()
        };
        
        this.qualityData.systemHealthMetrics.push(healthMetrics);
        
        // 履歴制限
        if (this.qualityData.systemHealthMetrics.length > 100) {
            this.qualityData.systemHealthMetrics = this.qualityData.systemHealthMetrics.slice(-100);
        }
    }

    /**
     * システム健康状態を分析
     * @private
     */
    private async analyzeSystemHealth(): Promise<SystemHealthAnalysis & { overallHealth: number }> {
        const recentQualities = this.qualityData.chapterQualityHistory.slice(-10);
        const avgQuality = recentQualities.length > 0 
            ? recentQualities.reduce((sum, record) => sum + record.qualityScore, 0) / recentQualities.length 
            : 7.0;
        
        const healthAnalysis: SystemHealthAnalysis = {
            memoryEfficiency: Math.min(10.0, 8.0 + (avgQuality - 7.0)),
            processingSpeed: Math.random() * 2 + 8, // シミュレーション値
            errorRate: Math.max(0, (8.0 - avgQuality) * 0.1),
            dataIntegrity: avgQuality,
            userSatisfaction: avgQuality,
            systemStability: Math.min(10.0, avgQuality + 1.0),
            resourceUtilization: Math.random() * 2 + 7, // シミュレーション値
            performanceTrend: this.calculateQualityTrend() as any
        };
        
        const overallHealth = (
            healthAnalysis.memoryEfficiency * 0.15 +
            healthAnalysis.processingSpeed * 0.15 +
            (10 - healthAnalysis.errorRate * 10) * 0.15 +
            healthAnalysis.dataIntegrity * 0.20 +
            healthAnalysis.userSatisfaction * 0.15 +
            healthAnalysis.systemStability * 0.10 +
            healthAnalysis.resourceUtilization * 0.10
        );
        
        return { ...healthAnalysis, overallHealth };
    }

    /**
     * 健康改善推奨事項を生成
     * @private
     */
    private generateHealthRecommendations(health: SystemHealthAnalysis): string[] {
        const recommendations: string[] = [];
        
        if (health.memoryEfficiency < 7.0) {
            recommendations.push('Optimize memory usage and cleanup outdated data');
        }
        
        if (health.processingSpeed < 7.0) {
            recommendations.push('Review and optimize processing algorithms');
        }
        
        if (health.errorRate > 0.1) {
            recommendations.push('Investigate and fix recurring errors');
        }
        
        if (health.dataIntegrity < 7.0) {
            recommendations.push('Review data validation and consistency checks');
        }
        
        if (health.systemStability < 7.0) {
            recommendations.push('Improve system stability and error handling');
        }
        
        return recommendations;
    }

    /**
     * 品質アラートをチェック
     * @private
     */
    private async checkQualityAlerts(qualityRecord: ChapterQualityRecord): Promise<void> {
        const alerts: typeof this.alertHistory = [];
        
        if (qualityRecord.qualityScore < this.config.thresholds.critical) {
            alerts.push({
                timestamp: new Date().toISOString(),
                type: 'CRITICAL_QUALITY',
                severity: 'CRITICAL',
                message: `Chapter ${qualityRecord.chapterNumber} quality critically low: ${qualityRecord.qualityScore.toFixed(2)}`,
                resolved: false
            });
        } else if (qualityRecord.qualityScore < this.config.thresholds.poor) {
            alerts.push({
                timestamp: new Date().toISOString(),
                type: 'LOW_QUALITY',
                severity: 'HIGH',
                message: `Chapter ${qualityRecord.chapterNumber} quality below threshold: ${qualityRecord.qualityScore.toFixed(2)}`,
                resolved: false
            });
        }
        
        // 品質低下トレンド
        const recentScores = this.qualityData.chapterQualityHistory.slice(-5).map(r => r.qualityScore);
        if (recentScores.length >= 3) {
            const isDecining = recentScores.every((score, index) => 
                index === 0 || score < recentScores[index - 1]
            );
            
            if (isDecining) {
                alerts.push({
                    timestamp: new Date().toISOString(),
                    type: 'QUALITY_DECLINE_TREND',
                    severity: 'MEDIUM',
                    message: 'Declining quality trend detected over recent chapters',
                    resolved: false
                });
            }
        }
        
        this.alertHistory.push(...alerts);
        
        // アラート履歴制限
        if (this.alertHistory.length > 200) {
            this.alertHistory = this.alertHistory.slice(-200);
        }
        
        // アラートログ出力
        for (const alert of alerts) {
            logger.warn(`Quality Alert: ${alert.message}`, {
                type: alert.type,
                severity: alert.severity
            });
        }
    }

    /**
     * 古いデータをクリーンアップ
     * @private
     */
    private async cleanupOldData(): Promise<void> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.config.historyRetentionDays);
        const cutoffTime = cutoffDate.toISOString();
        
        // 古い記録を削除
        this.qualityData.chapterQualityHistory = this.qualityData.chapterQualityHistory
            .filter(record => record.timestamp > cutoffTime);
        
        this.qualityData.systemQualityMetrics = this.qualityData.systemQualityMetrics
            .filter(record => record.timestamp > cutoffTime);
        
        this.qualityData.diagnosticHistory = this.qualityData.diagnosticHistory
            .filter(record => record.timestamp > cutoffTime);
        
        this.qualityData.systemHealthMetrics = this.qualityData.systemHealthMetrics
            .filter(record => record.timestamp > cutoffTime);
        
        // 古いアラートを削除
        this.alertHistory = this.alertHistory
            .filter(alert => alert.timestamp > cutoffTime);
    }

    /**
     * 品質レベルを取得
     * @private
     */
    private getQualityLevel(score: number): string {
        if (score >= this.config.thresholds.excellent) return 'EXCELLENT';
        if (score >= this.config.thresholds.good) return 'GOOD';
        if (score >= this.config.thresholds.acceptable) return 'ACCEPTABLE';
        if (score >= this.config.thresholds.critical) return 'POOR';
        return 'CRITICAL';
    }

    /**
     * リソースのクリーンアップ
     */
    async cleanup(): Promise<void> {
        try {
            await this.cleanupOldData();
            await this.save();
            
            logger.info('QualityMetricsManager cleanup completed');
        } catch (error) {
            logger.error('Failed to cleanup QualityMetricsManager', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    // ============================================================================
    // パブリックアクセサーメソッド
    // ============================================================================

    /**
     * 品質スコアを取得
     */
    getQualityScore(): number {
        const recentQualities = this.qualityData.chapterQualityHistory.slice(-5);
        if (recentQualities.length === 0) return 7.0;
        
        return recentQualities.reduce((sum, record) => sum + record.qualityScore, 0) / recentQualities.length;
    }

    /**
     * 品質メトリクスを取得
     */
    getMetrics(): Record<string, number> {
        const recentQualities = this.qualityData.chapterQualityHistory.slice(-10);
        const recentHealth = this.qualityData.systemHealthMetrics.slice(-1)[0];
        
        const avgQuality = recentQualities.length > 0 
            ? recentQualities.reduce((sum, record) => sum + record.qualityScore, 0) / recentQualities.length 
            : 7.0;
        
        return {
            averageQuality: avgQuality,
            qualityTrend: this.encodeQualityTrend(this.calculateQualityTrend()),
            totalChaptersAnalyzed: this.qualityData.chapterQualityHistory.length,
            systemHealthScore: recentHealth?.healthScore || 8.0,
            alertCount: this.alertHistory.filter(alert => !alert.resolved).length,
            excellentChapters: this.qualityData.chapterQualityHistory
                .filter(record => record.qualityScore >= this.config.thresholds.excellent).length,
            poorChapters: this.qualityData.chapterQualityHistory
                .filter(record => record.qualityScore < this.config.thresholds.poor).length
        };
    }

    /**
     * 品質トレンドを数値エンコード
     * @private
     */
    private encodeQualityTrend(trend: string): number {
        switch (trend) {
            case 'IMPROVING': return 1;
            case 'STABLE': return 0;
            case 'DECLINING': return -1;
            default: return 0;
        }
    }

    /**
     * 章品質履歴を取得
     */
    getChapterQualityHistory(limit?: number): ChapterQualityRecord[] {
        const history = [...this.qualityData.chapterQualityHistory]
            .sort((a, b) => b.chapterNumber - a.chapterNumber);
        
        return limit ? history.slice(0, limit) : history;
    }

    /**
     * システム健康メトリクスを取得
     */
    getSystemHealthMetrics(limit?: number): SystemHealthMetricsRecord[] {
        const metrics = [...this.qualityData.systemHealthMetrics]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        return limit ? metrics.slice(0, limit) : metrics;
    }

    /**
     * アクティブアラートを取得
     */
    getActiveAlerts(): typeof this.alertHistory {
        return this.alertHistory.filter(alert => !alert.resolved);
    }

    /**
     * 品質統計サマリーを取得
     */
    getQualitySummary(): {
        overall: string;
        averageScore: number;
        trend: string;
        recentImprovement: boolean;
        alertCount: number;
        topIssues: string[];
    } {
        const avgScore = this.getQualityScore();
        const trend = this.calculateQualityTrend();
        const activeAlerts = this.getActiveAlerts();
        
        // 最近の改善判定
        const recentScores = this.qualityData.chapterQualityHistory.slice(-3).map(r => r.qualityScore);
        const recentImprovement = recentScores.length >= 2 && 
            recentScores[recentScores.length - 1] > recentScores[0];
        
        // 主要問題の抽出
        const issueCounts = new Map<string, number>();
        for (const alert of activeAlerts) {
            issueCounts.set(alert.type, (issueCounts.get(alert.type) || 0) + 1);
        }
        
        const topIssues = Array.from(issueCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([type]) => type);
        
        return {
            overall: this.getQualityLevel(avgScore),
            averageScore: avgScore,
            trend,
            recentImprovement,
            alertCount: activeAlerts.length,
            topIssues
        };
    }
}