// src/lib/validation/system.ts
import { Chapter } from '@/types/chapters';
import { ValidationResult, ValidationCheck } from '@/types/validation';
import { MemoryManager } from '@/lib/memory/manager';
import { ConsistencyChecker } from './consistency-checker';
import { logger } from '@/lib/utils/logger';

/**
 * バリデーションパラメータのインターフェース
 */
interface ValidationParameters {
    consistencyThreshold?: number;
    minLength?: number;
    maxLength?: number;
}

export class ValidationSystem {
    private memoryManager: MemoryManager;
    private consistencyChecker: ConsistencyChecker;
    private parameters: ValidationParameters = {
        consistencyThreshold: 0.85,
        minLength: 7500,
        maxLength: 8500
    };

    constructor() {
        this.memoryManager = new MemoryManager();
        this.consistencyChecker = new ConsistencyChecker();
        logger.info('ValidationSystem initialized');

    }

    async validateChapter(chapter: Chapter): Promise<ValidationResult> {
        logger.info(`Starting validation for chapter ${chapter.chapterNumber}`);
        const results: ValidationCheck[] = [];

        // 文字数チェック
        results.push(this.checkLength(chapter));

        // 文体チェック
        results.push(await this.checkStyle(chapter));

        // 構文解析
        results.push(this.checkSyntax(chapter));

        // 基本的な一貫性チェック
        results.push(await this.checkBasicConsistency(chapter));

        const isValid = results.every(r => r.passed || r.severity === 'LOW');
        const qualityScore = this.calculateQualityScore(results);

        logger.info(`Validation completed for chapter ${chapter.chapterNumber}`, {
            isValid,
            qualityScore,
            checksPerformed: results.length,
            checksPassed: results.filter(r => r.passed).length
        });

        return {
            isValid,
            checks: results,
            qualityScore,
        };
    }


    private checkLength(chapter: Chapter): ValidationCheck {
        const target = 3000;
        const tolerance = 0.8; // 20% tolerance
        const actual = chapter.content.length;
        const difference = Math.abs(actual - target) / target;

        logger.debug(`Length check: ${actual} chars (target: ${target})`);

        let severity: 'HIGH' | 'MEDIUM' | 'LOW';
        if (difference > tolerance) {
            severity = 'HIGH';
        } else if (difference > tolerance / 2) {
            severity = 'MEDIUM';
        } else {
            severity = 'LOW';
        }

        return {
            name: 'length',
            passed: difference <= tolerance,
            message: `文字数: ${actual} (目標: ${target}±${tolerance * 100}%)`,
            severity,
            details: {
                actual,
                target,
                difference: (difference * 100).toFixed(1) + '%',
            }
        };
    }

    private async checkStyle(chapter: Chapter): Promise<ValidationCheck> {
        // YAMLフロントマターを検出して除去
        const cleanContent = chapter.content.replace(/^---[\s\S]*?---\n/m, '');

        // 以下のスタイルチェックはクリーンなコンテンツに対して実行
        logger.debug('Performing style consistency check');

        const styleIssues = this.detectStyleIssues(cleanContent);
        const hasInconsistentVoice = styleIssues.voiceIssues.length > 0;
        const hasToneShifts = styleIssues.toneIssues.length > 0;

        let severity: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        if (hasInconsistentVoice) {
            severity = 'HIGH';
        } else if (hasToneShifts) {
            severity = 'MEDIUM';
        }

        return {
            name: 'style',
            passed: !hasInconsistentVoice && !hasToneShifts,
            message: hasInconsistentVoice
                ? '視点の不整合があります'
                : hasToneShifts
                    ? 'トーンの変化が見られます'
                    : '文体は一貫しています',
            severity,
            details: styleIssues
        };
    }

    private checkSyntax(chapter: Chapter): ValidationCheck {
        // 基本的な構文チェック
        logger.debug('Performing syntax check');

        const errors = this.findSyntaxErrors(chapter.content);
        const severityMap = {
            0: 'LOW',
            1: 'LOW',
            2: 'MEDIUM',
            3: 'MEDIUM',
        };

        const severity = (errors.length >= 4
            ? 'HIGH'
            : severityMap[errors.length as keyof typeof severityMap] || 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW';

        return {
            name: 'syntax',
            passed: errors.length === 0,
            message: errors.length > 0
                ? `${errors.length}個の構文エラーがあります`
                : '構文は正常です',
            severity,
            details: { errors }
        };
    }

    private async checkBasicConsistency(chapter: Chapter): Promise<ValidationCheck> {
        // 基本的な一貫性チェック
        logger.debug('Performing basic consistency check');

        // ConsistencyCheckerを直接使用して一貫性をチェック
        const consistencyResult = await this.consistencyChecker.checkConsistency(chapter);
        const issueCount = consistencyResult.issues.length;

        let severity: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        if (issueCount > 2) {
            severity = 'HIGH';
        } else if (issueCount > 0) {
            severity = 'MEDIUM';
        }

        return {
            name: 'basic_consistency',
            passed: consistencyResult.isConsistent,
            message: consistencyResult.isConsistent
                ? '基本的な一貫性チェック通過'
                : `${issueCount}個の一貫性問題を検出`,
            severity,
            details: { issues: consistencyResult.issues }
        };
    }

    private detectStyleIssues(content: string): {
        voiceIssues: string[],
        toneIssues: string[]
    } {
        // 視点の不整合と文体の変化を検出
        // このフェーズでは簡易実装
        logger.debug('Running style check with content length: ' + content.length);

        // 一人称視点のマーカー
        const firstPersonMarkers = [
            '私は', '私が', '僕は', '僕が', '俺は', '俺が',
            '私の', '僕の', '俺の', '私を', '僕を', '俺を'
        ];

        // 三人称視点のマーカー
        const thirdPersonMarkers = [
            '彼は', '彼が', '彼女は', '彼女が', '彼の', '彼女の'
        ];

        // 文章を段落に分割
        const paragraphs = content.split(/\n\n+/);
        logger.debug(`Analyzing ${paragraphs.length} paragraphs for style consistency`);

        const firstPersonParagraphs: number[] = [];
        const thirdPersonParagraphs: number[] = [];

        // 各段落の視点を判定し、詳細をログに記録
        paragraphs.forEach((paragraph, index) => {
            // カギカッコで囲まれた会話文を除去
            const withoutDialogue = paragraph.replace(/「[^」]*」/g, '');

            // 一人称マーカーの検出（会話文を除いた部分で）
            const firstPersonFound = firstPersonMarkers.filter(marker =>
                withoutDialogue.includes(marker)
            );

            // 三人称マーカーの検出（会話文を除いた部分で）
            const thirdPersonFound = thirdPersonMarkers.filter(marker =>
                withoutDialogue.includes(marker)
            );

            // 検出されたマーカーをログに出力
            if (firstPersonFound.length > 0 || thirdPersonFound.length > 0) {
                logger.debug(`Paragraph ${index}: ` +
                    `First person markers: [${firstPersonFound.join(', ')}], ` +
                    `Third person markers: [${thirdPersonFound.join(', ')}], ` +
                    `(Original length: ${paragraph.length}, Filtered length: ${withoutDialogue.length})`);
            }

            if (firstPersonFound.length > 0) firstPersonParagraphs.push(index);
            if (thirdPersonFound.length > 0) thirdPersonParagraphs.push(index);
        });

        // 視点の混在結果をログに出力
        logger.debug(`Style check results: ` +
            `First person paragraphs: ${firstPersonParagraphs.length}, ` +
            `Third person paragraphs: ${thirdPersonParagraphs.length}`);

        // 視点の混在をチェック
        const voiceIssues: string[] = [];
        if (firstPersonParagraphs.length > 0 && thirdPersonParagraphs.length > 0) {
            const issue = `一人称視点と三人称視点が混在しています（一人称: ${firstPersonParagraphs.length}箇所, 三人称: ${thirdPersonParagraphs.length}箇所）`;
            logger.warn(issue);
            voiceIssues.push(issue);
        }

        // トーンの変化をチェック（今回は簡易実装）
        const toneIssues: string[] = [];

        return { voiceIssues, toneIssues };
    }

    private findSyntaxErrors(content: string): string[] {
        // 基本的な構文エラーを検出
        // このフェーズでは簡易実装
        const errors: string[] = [];

        // カギカッコの対応チェック
        const quotationPairs = (content.match(/「/g) || []).length;
        const closingQuotationPairs = (content.match(/」/g) || []).length;

        if (quotationPairs !== closingQuotationPairs) {
            errors.push(`カギカッコ「」の対応が不正です（開き: ${quotationPairs}, 閉じ: ${closingQuotationPairs}）`);
        }

        // 疑問文に疑問符がないケース
        const questions = (content.match(/か\s/g) || []).length;
        const questionMarks = (content.match(/？/g) || []).length;

        if (questions > questionMarks + 5) { // 多少の差は許容
            errors.push(`疑問文に疑問符が不足している可能性があります`);
        }

        return errors;
    }

    private calculateQualityScore(results: ValidationCheck[]): number {
        // 重み付けスコア計算
        const weights = {
            'HIGH': 1.0,
            'MEDIUM': 0.5,
            'LOW': 0.2
        };

        let totalWeight = 0;
        let weightedScore = 0;

        results.forEach(check => {
            const weight = weights[check.severity] || 0.5;
            totalWeight += weight;
            weightedScore += check.passed ? weight : 0;
        });

        return totalWeight > 0
            ? Math.round((weightedScore / totalWeight) * 100)
            : 100;
    }

    /**
 * バリデーションパラメータを設定
 * @param params バリデーションパラメータ
 */
    setValidationParameters(params: ValidationParameters): void {
        if (params.consistencyThreshold !== undefined) {
            this.parameters.consistencyThreshold = params.consistencyThreshold;
        }
        if (params.minLength !== undefined) {
            this.parameters.minLength = params.minLength;
        }
        if (params.maxLength !== undefined) {
            this.parameters.maxLength = params.maxLength;
        }
    }
}