// src\lib\generation\context-generator\metrics-calculator.ts
/**
 * @fileoverview 物語メトリクス計算モジュール
 * @description
 * このファイルは、チャプター番号と中期記憶に基づいて物語のテンションとペーシングの値を計算します。
 * これらの値は物語の緊張感やテンポを制御するために使用されます。
 */

import { parameterManager } from '@/lib/parameters';

/**
 * メトリクス計算クラス
 * テンションとペーシングを計算する
 */
export class MetricsCalculator {
    /**
     * コンストラクタ
     */
    constructor() {}

    /**
     * テンション値の計算
     * 
     * チャプター番号と中期記憶に基づいて物語のテンション値を計算します。
     * 
     * @param chapterNumber チャプター番号
     * @param midTermMemory 中期記憶
     * @param minVariance テンションの最小変動量（省略可）
     * @returns テンション値 (0-1)
     */
    calculateTension(chapterNumber: number, midTermMemory: any, minVariance?: number): number {
        // パラメータが省略された場合はパラメータマネージャーから取得
        const params = parameterManager.getParameters();
        const tensionMinVariance = minVariance !== undefined ? 
            minVariance : params.progression.tensionMinVariance;

        // アーク情報がある場合は、アーク内でのチャプターの位置に基づいてテンションを計算
        if (midTermMemory && midTermMemory.currentArc && midTermMemory.currentArc.chapter_range) {
            const { start, end } = midTermMemory.currentArc.chapter_range;

            if (typeof start === 'number' && typeof end === 'number') {
                // アーク内の位置（0-1）
                const arcProgress = (chapterNumber - start) / Math.max(1, end - start);

                // 基本的な起承転結カーブ（0→0.3→0.7→1→0.5）に最小変動量を適用
                let tension;
                if (arcProgress < 0.25) {
                    // 起: 徐々に上昇
                    tension = 0.3 + arcProgress * 0.8;
                } else if (arcProgress < 0.5) {
                    // 承: ゆっくり上昇
                    tension = 0.5 + (arcProgress - 0.25) * 0.8;
                } else if (arcProgress < 0.75) {
                    // 転: 急上昇→ピーク
                    tension = 0.7 + (arcProgress - 0.5) * 1.2;
                } else {
                    // 結: 緩やかに下降
                    tension = 1.0 - (arcProgress - 0.75) * 2;
                }

                // 最小変動量に基づいて変動を追加
                if (tensionMinVariance > 0) {
                    // ノイズ生成（-tensionMinVariance〜+tensionMinVariance）
                    const noise = (Math.random() * 2 - 1) * tensionMinVariance;
                    tension = Math.max(0.1, Math.min(1.0, tension + noise));
                }

                return tension;
            }
        }

        // アーク情報がない場合はチャプター番号から概算
        const arcLength = params.memory.midTermArcSize || 5; // パラメータからアーク長を取得
        const positionInArc = (chapterNumber - 1) % arcLength;
        const arcProgress = positionInArc / arcLength;

        // 基本的な起承転結カーブ
        let tension;
        if (arcProgress < 0.25) {
            tension = 0.3 + arcProgress * 0.8;
        } else if (arcProgress < 0.5) {
            tension = 0.5 + (arcProgress - 0.25) * 0.8;
        } else if (arcProgress < 0.75) {
            tension = 0.7 + (arcProgress - 0.5) * 1.2;
        } else {
            tension = 1.0 - (arcProgress - 0.75) * 2;
        }

        // 最小変動量に基づいて変動を追加
        if (tensionMinVariance > 0) {
            // ノイズ生成（-tensionMinVariance〜+tensionMinVariance）
            const noise = (Math.random() * 2 - 1) * tensionMinVariance;
            tension = Math.max(0.1, Math.min(1.0, tension + noise));
        }

        return tension;
    }

    /**
     * ペーシング値の計算
     * 
     * チャプター番号と中期記憶に基づいて物語のペーシング値を計算します。
     * 
     * @param chapterNumber チャプター番号
     * @param midTermMemory 中期記憶
     * @returns ペーシング値 (0-1)
     */
    calculatePacing(chapterNumber: number, midTermMemory: any): number {
        const params = parameterManager.getParameters();
        
        // アーク情報がある場合は、アーク内でのチャプターの位置に基づいてペーシングを計算
        if (midTermMemory && midTermMemory.currentArc && midTermMemory.currentArc.chapter_range) {
            const { start, end } = midTermMemory.currentArc.chapter_range;

            if (typeof start === 'number' && typeof end === 'number') {
                // アーク内の位置（0-1）
                const arcProgress = (chapterNumber - start) / Math.max(1, end - start);

                // ペーシングカーブ（0.5→0.4→0.6→0.8→0.5）
                if (arcProgress < 0.2) {
                    // 導入部: 中程度のペース
                    return 0.5 - arcProgress * 0.5;
                } else if (arcProgress < 0.4) {
                    // 展開前半: やや遅めのペース
                    return 0.4 + (arcProgress - 0.2) * 1.0;
                } else if (arcProgress < 0.7) {
                    // 展開後半: 中〜早めのペース
                    return 0.6 + (arcProgress - 0.4) * 0.67;
                } else {
                    // 結末: 早めから中程度に戻る
                    return 0.8 - (arcProgress - 0.7) * 1.0;
                }
            }
        }

        // アーク情報がない場合はチャプター番号から概算
        const arcLength = params.memory.midTermArcSize || 5; // パラメータからアーク長を取得
        const positionInArc = (chapterNumber - 1) % arcLength;
        const arcProgress = positionInArc / arcLength;

        // ペーシングカーブ
        if (arcProgress < 0.2) {
            return 0.5 - arcProgress * 0.5;
        } else if (arcProgress < 0.4) {
            return 0.4 + (arcProgress - 0.2) * 1.0;
        } else if (arcProgress < 0.7) {
            return 0.6 + (arcProgress - 0.4) * 0.67;
        } else {
            return 0.8 - (arcProgress - 0.7) * 1.0;
        }
    }
}