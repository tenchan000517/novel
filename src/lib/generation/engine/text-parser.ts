// src/lib/generation/engine/text-parser.ts
import { logger } from '@/lib/utils/logger';
import { parseYaml } from '@/lib/utils/yaml-helper';
import { Scene } from '@/types/generation';

/**
 * @class TextParser
 * @description テキスト解析と処理に特化したクラス
 * 
 * @role
 * - 生成されたテキストの解析と構造化
 * - メタデータとコンテンツの分離
 * - 文字数カウント
 */
export class TextParser {
    /**
     * 生成コンテンツのパース
     * 
     * Gemini APIから返された生成テキストを解析し、本文とメタデータに分離します。
     * 
     * @param {string} generatedText 生成されたテキスト
     * @param {number} chapterNumber チャプター番号
     * @returns {{content: string; metadata: any;}} パースされたコンテンツとメタデータ
     */
    parseGeneratedContent(generatedText: string, chapterNumber: number): {
        content: string;
        metadata: any;
    } {
        try {
            // デバッグログを追加
            logger.debug(`Raw generated content length: ${generatedText.length}`, {
                chapterNumber,
                preview: generatedText.substring(0, 200)
            });

            // 最初と最後のセクション区切りを見つける
            const firstSeparatorIndex = generatedText.indexOf('---');
            const secondSeparatorIndex = generatedText.indexOf('---', firstSeparatorIndex + 3);
            const lastSeparatorIndex = generatedText.lastIndexOf('---');

            // 区切りが適切に存在するか確認
            if (firstSeparatorIndex === -1 || secondSeparatorIndex === -1 ||
                lastSeparatorIndex === -1 || secondSeparatorIndex === lastSeparatorIndex) {
                logger.warn(`Generated content for chapter ${chapterNumber} has improper section formatting`, {
                    firstSeparator: firstSeparatorIndex,
                    secondSeparator: secondSeparatorIndex,
                    lastSeparator: lastSeparatorIndex
                });

                // 従来のフォールバック処理を使用
                return this.createFallbackContent(generatedText, chapterNumber);
            }

            // ヘッダーメタデータ抽出 (最初の「---」の直後から次の「---」まで)
            const headerYaml = generatedText.substring(firstSeparatorIndex + 3, secondSeparatorIndex).trim();
            let headerMetadata;
            try {
                headerMetadata = parseYaml(headerYaml);
                logger.debug(`Successfully parsed header metadata`, { keys: Object.keys(headerMetadata) });
            } catch (yamlError) {
                logger.error(`Failed to parse header YAML`, {
                    error: yamlError instanceof Error ? yamlError.message : String(yamlError)
                });
                headerMetadata = { title: `第${chapterNumber}章` };
            }

            // 本文抽出 (2番目の「---」の直後から最後の「---」の直前まで)
            let content = generatedText.substring(secondSeparatorIndex + 3, lastSeparatorIndex).trim();

            // Markdown コードブロックの処理 (既存機能を維持)
            if (content.startsWith('```') && content.endsWith('```')) {
                logger.debug(`Detected Markdown code block in content, processing`);
                content = content.replace(/^```(json|javascript)?\s*/, '')
                    .replace(/\s*```$/, '');

                // JSON の場合はさらに解析
                if (content.startsWith('{') && content.endsWith('}')) {
                    try {
                        const jsonContent = JSON.parse(content);
                        if (jsonContent.content) {
                            content = jsonContent.content;
                        }
                    } catch (e) {
                        logger.warn(`Failed to parse JSON content: ${e}`);
                    }
                }
            }

            // コンテンツ長のチェック (既存機能を維持)
            if (content.length < 100 && generatedText.length > 500) {
                logger.warn(`Content section too short (${content.length} chars), attempting more robust extraction`, {
                    chapterNumber
                });

                // より堅牢な本文抽出を試みる
                try {
                    // ヘッダー終了位置以降から最後のセパレータ以前までを取得
                    const potentialContent = generatedText.substring(secondSeparatorIndex + 3);
                    const lastSeparatorInPotential = potentialContent.lastIndexOf('---');

                    if (lastSeparatorInPotential > 100) { // 十分な長さがあるか確認
                        content = potentialContent.substring(0, lastSeparatorInPotential).trim();
                        logger.debug(`Alternative content extraction successful, length: ${content.length}`);
                    }
                } catch (extractError) {
                    logger.warn(`Alternative content extraction failed`, {
                        error: extractError instanceof Error ? extractError.message : String(extractError)
                    });
                }
            }

            // フッターメタデータ抽出 (最後の「---」の直後)
            const footerYaml = generatedText.substring(lastSeparatorIndex + 3).trim();
            let scenes: Scene[] = [];
            let keywords: string[] = [];
            let events: string[] = [];

            try {
                const footerData = parseYaml(footerYaml);
                logger.debug(`Successfully parsed footer metadata`, {
                    hasScenes: !!footerData.scenes,
                    hasKeywords: !!footerData.keywords,
                    hasEvents: !!footerData.events
                });

                // シーン情報の処理 (既存機能を維持)
                if (footerData.scenes && Array.isArray(footerData.scenes)) {
                    scenes = footerData.scenes.map((scene: any, index: number) => {
                        return {
                            id: `scene-${chapterNumber}-${index + 1}`,
                            type: scene.type || 'DEVELOPMENT',
                            title: scene.title || `シーン${index + 1}`,
                            characters: scene.characters ?
                                (typeof scene.characters === 'string' ? scene.characters.split(',').map((c: string) => c.trim()) : scene.characters) :
                                [],
                            startPosition: 0,
                            endPosition: 0,
                            summary: scene.summary || '',
                            location: scene.location || '',
                            emotionalTone: scene.emotionalTone || '',
                            tension: 0.5
                        };
                    });
                }

                // キーワードとイベントの処理 (既存機能を維持)
                if (footerData.keywords) {
                    keywords = typeof footerData.keywords === 'string' ?
                        footerData.keywords.split(',').map((k: string) => k.trim()) :
                        footerData.keywords;
                }

                if (footerData.events) {
                    events = typeof footerData.events === 'string' ?
                        footerData.events.split(',').map((e: string) => e.trim()) :
                        footerData.events;
                }
            } catch (yamlError) {
                logger.warn(`Failed to parse footer metadata for chapter ${chapterNumber}`, {
                    error: yamlError instanceof Error ? yamlError.message : String(yamlError)
                });
            }

            // ログに抽出結果を記録
            logger.debug(`Content parsing completed`, {
                contentLength: content.length,
                metadataFields: Object.keys({ ...headerMetadata, scenes, keywords, events }),
                title: headerMetadata.title
            });

            // 統合されたメタデータを返す
            return {
                content,
                metadata: {
                    ...headerMetadata,
                    scenes,
                    keywords,
                    events
                }
            };
        } catch (error) {
            // エラー処理
            logger.error(`Failed to parse generated content for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });

            // エラー時のフォールバック処理
            return this.createFallbackContent(generatedText, chapterNumber);
        }
    }

    // 新しく追加するヘルパーメソッド
    private createFallbackContent(generatedText: string, chapterNumber: number): {
        content: string;
        metadata: any;
    } {
        logger.warn(`Using fallback content extraction for chapter ${chapterNumber}`);

        // メタデータ部分の検出を試みる
        const titleMatch = generatedText.match(/title:\s*([^\n]+)/);
        const summaryMatch = generatedText.match(/summary:\s*([^\n]+)/);

        return {
            content: generatedText,
            metadata: {
                title: titleMatch ? titleMatch[1].trim() : `第${chapterNumber}章`,
                summary: summaryMatch ? summaryMatch[1].trim() : `自動生成された第${chapterNumber}章`,
                pov: '',
                location: '',
                timeframe: '',
                emotionalTone: '',
                keywords: [],
                scenes: []
            }
        };
    }

    /**
     * 文字数カウント
     * 
     * テキストの文字数をカウントします。日本語の場合は文字数をそのままカウントし、
     * 半角スペースや記号も1文字としてカウントします。
     * 
     * @param {string} text テキスト
     * @returns {number} 文字数
     */
    countWords(text: string): number {
        if (!text) return 0;
        // 日本語の場合は文字数をそのままカウント
        return text.length;
    }
}