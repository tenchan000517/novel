// src\lib\generation\context-generator\expression-provider.ts
/**
 * @fileoverview 表現設定提供モジュール
 * @description
 * このファイルは、コンテキスト生成に必要な文体や視点などの表現設定を提供します。
 * ファイルシステムから表現設定を直接読み込みます。
 */

import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { parseYaml } from '@/lib/utils/yaml-helper';

/**
 * 表現設定プロバイダークラス
 * 小説の文体や視点などの表現に関する設定を提供する
 */
export class ExpressionProvider {
    /**
     * コンストラクタ
     */
    constructor() {
        logger.info('ExpressionProvider initialized');
    }

    /**
     * 表現設定の取得
     * @returns 表現設定オブジェクト
     */
    async getExpressionSettings(): Promise<any> {
        try {
            // 表現設定ファイルの読み込み
            const exists = await storageProvider.fileExists('preferences/expressions.yaml');

            if (!exists) {
                logger.warn('Expression preferences file not found');
                return {
                    tone: '自然で読みやすい文体',
                    narrativeStyle: '三人称視点、過去形'
                };
            }

            const rawContent = await storageProvider.readFile('preferences/expressions.yaml');
            const settings = parseYaml(rawContent);

            return {
                tone: settings.tone || '自然で読みやすい文体',
                narrativeStyle: settings.narrativeStyle || '三人称視点、過去形',
                restrictions: settings.restrictions || []
            };
        } catch (error) {
            logger.error('Failed to retrieve expression settings', {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                tone: '自然で読みやすい文体',
                narrativeStyle: '三人称視点、過去形'
            };
        }
    }
}