// src\lib\generation\context-generator\fallback-manager.ts
/**
 * @fileoverview フォールバック管理モジュール
 * @description
 * このファイルは、コンテキスト生成に問題が発生した場合のフォールバックコンテキストを生成します。
 * 基本設定から最小限のコンテキスト情報を生成する機能を提供します。
 */

import { logger } from '@/lib/utils/logger';
import { GenerationContext } from '@/types/generation';
import { MemoryManager } from '@/lib/memory/manager';
import { storageProvider } from '@/lib/storage';
import { parseYaml } from '@/lib/utils/yaml-helper';
import { parameterManager } from '@/lib/parameters';
import { NarrativeState } from '@/lib/memory/narrative/types';

/**
 * フォールバックマネージャークラス
 * エラー発生時のフォールバックコンテキスト生成を担当
 */
export class FallbackManager {
    private memoryManager: MemoryManager;

    /**
     * コンストラクタ
     * @param memoryManager 記憶マネージャーのインスタンス
     */
    constructor(memoryManager: MemoryManager) {
        this.memoryManager = memoryManager;
        logger.info('FallbackManager initialized');
    }

    /**
     * スマートフォールバックコンテキストの作成
     * 
     * 設定ファイルから情報を取得して適応的なフォールバックを提供します。
     * エラーが発生した際に呼び出され、最小限の情報でも有効なコンテキストを生成します。
     * 
     * @param chapterNumber チャプター番号
     * @returns フォールバックコンテキスト
     */
    async createSmartFallbackContext(chapterNumber: number): Promise<GenerationContext> {
        logger.warn(`Creating smart fallback context for chapter ${chapterNumber}`);

        // パラメータの取得
        const params = parameterManager.getParameters();
        
        // 基本的なストーリー情報を取得
        const basicStoryInfo = await this.getBasicStoryInfo();

        // アーク情報の推定
        const arcLength = params.memory.midTermArcSize || 5; // パラメータからアーク長を取得
        const arcNumber = Math.ceil(chapterNumber / arcLength);
        const arcStart = (arcNumber - 1) * arcLength + 1;
        const arcEnd = arcNumber * arcLength;

        // キャラクター情報
        let characters = basicStoryInfo.characters;
        if (!characters || !Array.isArray(characters) || characters.length === 0) {
            // キャラクター情報がない場合は汎用的なキャラクターを提供
            characters = [
                {
                    name: '主要人物',
                    description: '物語の中心となる人物',
                    personality: '物語の進行に応じた性格',
                    goals: '物語の主題に関連した目標',
                    currentState: '現在の物語状況に応じた状態'
                }
            ];
        }

        // キャラクター数の制限（パラメータに基づく）
        const maxMainCharacters = Math.min(characters.length, params.characters.maxMainCharacters);
        characters = characters.slice(0, maxMainCharacters);

        // テンションとペーシングの計算
        const arcProgress = (chapterNumber - arcStart) / Math.max(1, arcEnd - arcStart);
        const tensionBase = arcProgress < 0.5 ? 0.4 + arcProgress * 0.6 : 0.7 + (arcProgress - 0.5) * 0.6;
        
        // テンション変動を追加（パラメータに基づく）
        const tensionVariance = params.progression.tensionMinVariance;
        const noise = (Math.random() * 2 - 1) * tensionVariance;
        const tension = Math.max(0.1, Math.min(1.0, tensionBase + noise));
        
        const pacing = arcProgress < 0.3 ? 0.5 : (arcProgress < 0.7 ? 0.6 : 0.7);

        // 伏線の調整（パラメータに基づく）
        const foreshadowingCount = Math.max(1, Math.round(3 * params.plot.foreshadowingDensity));
        const genericForeshadowing: string[] = [];
        
        if (chapterNumber > 1) {
            genericForeshadowing.push(`${chapterNumber - 1}章の出来事の続きとなる展開`);
            
            if (foreshadowingCount >= 2) {
                genericForeshadowing.push(`${Math.max(1, chapterNumber - 2)}章で言及された事柄の進展`);
            }
            
            if (foreshadowingCount >= 3) {
                genericForeshadowing.push(`今後の展開につながる新たな要素の導入`);
            }
        }

        // ジャンル特有のコンテキストを生成
        let genreSpecificContext = '';
        const genre = basicStoryInfo.genre?.toLowerCase() || '';

        if (genre.includes('恋愛') || genre.includes('ロマンス')) {
            genreSpecificContext = `登場人物の感情や関係性の変化を丁寧に描写し、関係の発展を中心に据えた物語展開が重要です。`;
        } else if (genre.includes('ミステリー') || genre.includes('推理')) {
            genreSpecificContext = `謎解きの要素を中心に、伏線の配置と回収を意識した展開が重要です。読者に適切な情報を与えつつ、次第に真相へ迫る構成を意識します。`;
        } else if (genre.includes('sf') || genre.includes('サイエンスフィクション')) {
            genreSpecificContext = `世界設定の一貫性と科学的要素を重視した展開が重要です。テクノロジーや未来社会の描写を通じて、人間性や社会の本質に迫る内容を展開します。`;
        } else if (genre.includes('ファンタジー')) {
            genreSpecificContext = `魔法や超自然的要素を含む世界観の中で、冒険や成長を描く展開が重要です。世界の法則性を保ちながら、想像力豊かな要素を取り入れます。`;
        } else if (genre.includes('ホラー') || genre.includes('怪談')) {
            genreSpecificContext = `恐怖や不安を喚起する要素を効果的に配置し、緊張感のある展開が重要です。読者の想像力を刺激し、心理的恐怖を重視した描写を心がけます。`;
        }

        const narrativeState = {
            state: NarrativeState.INTRODUCTION, // 適切なenum値を使用
            arcCompleted: false,
            stagnationDetected: false,
            duration: 1,
            timeOfDay: '昼',
            location: '物語の舞台',
            weather: '晴れ'
        };

        return {
            chapterNumber,
            targetLength: params.generation.targetLength,
            storyContext: `# 現在のアーク: ${basicStoryInfo.theme || '物語の展開'}\n${basicStoryInfo.summary || '物語の進行中です。'}\n\n${genreSpecificContext}\n\n# 最近のチャプター\n## チャプター${Math.max(1, chapterNumber - 1)}\n前回までの物語の進行状況をふまえた展開が求められます。`,
            worldSettings: basicStoryInfo.worldSettings || '物語の舞台設定',
            theme: basicStoryInfo.theme || '物語のテーマ',
            tone: '自然で読みやすい文体',
            narrativeStyle: '三人称視点、過去形',
            tension,
            pacing,
            characters,
            foreshadowing: genericForeshadowing,
            narrativeState,
            midTermMemory: {
                currentArc: {
                    name: `アーク${arcNumber}`,
                    chapter_range: {
                        start: arcStart,
                        end: arcEnd
                    }
                }
            }
            // 型定義にないプロパティは削除:
            // abstractConcreteBalance, dialogActionRatio, shortTermMemory, longTermMemory
        };
    }

    /**
     * 基本的なストーリー情報の取得
     * @returns 基本的なストーリー情報
     */
    private async getBasicStoryInfo(): Promise<any> {
        try {
            logger.info('Retrieving basic story information for fallback');

            // story-plot.yamlファイルの読み込み
            let storyPlot: any = {};
            const storyPlotExists = await storageProvider.fileExists('config/story-plot.yaml');

            if (storyPlotExists) {
                const content = await storageProvider.readFile('config/story-plot.yaml');
                storyPlot = parseYaml(content) || {};
            } else {
                logger.warn('Story plot file not found');
            }

            // 世界設定ファイルの読み込み
            let worldSettings: any = {};
            const worldSettingsExists = await storageProvider.fileExists('config/world-settings.yaml');

            if (worldSettingsExists) {
                const content = await storageProvider.readFile('config/world-settings.yaml');
                worldSettings = parseYaml(content) || {};
            } else {
                logger.warn('World settings file not found');
            }

            // テーマトラッカーファイルの読み込み
            let themeTracker: any = {};
            const themeTrackerExists = await storageProvider.fileExists('config/theme-tracker.yaml');

            if (themeTrackerExists) {
                const content = await storageProvider.readFile('config/theme-tracker.yaml');
                themeTracker = parseYaml(content) || {};
            } else {
                logger.warn('Theme tracker file not found');
            }

            // キャラクター情報の取得（最小限）
            let characters = [];
            try {
                // パラメータを取得
                const params = parameterManager.getParameters();
                const maxCharactersToLoad = params.characters.maxMainCharacters;
                
                // 最小限のキャラクター情報を取得する簡易実装
                const mainCharDir = 'characters/main';
                const exists = await storageProvider.directoryExists(mainCharDir);
                
                if (exists) {
                    const files = await storageProvider.listFiles(mainCharDir);
                    // パラメータに基づいて読み込むファイル数を制限
                    for (const file of files.slice(0, maxCharactersToLoad)) {
                        if (file.endsWith('.yaml') || file.endsWith('.yml')) {
                            const content = await storageProvider.readFile(file);
                            const character = parseYaml(content);
                            if (character) {
                                characters.push(character);
                            }
                        }
                    }
                }
            } catch (error) {
                logger.warn('Failed to get character info for fallback', {
                    error: error instanceof Error ? error.message : String(error)
                });
            }

            // 統合された基本情報
            return {
                // ジャンル（デフォルトは汎用的な「物語」）
                genre: storyPlot.genre || worldSettings.genre || themeTracker.genre || '物語',

                // テーマ
                theme: themeTracker.description || storyPlot.theme || worldSettings.theme || '物語のテーマ',

                // 世界設定
                worldSettings: worldSettings.description || storyPlot.setting || '物語の舞台設定',

                // 概要
                summary: storyPlot.summary || themeTracker.summary || '物語の進行',

                // キャラクター
                characters: characters.length > 0 ? characters : null,

                // 時代背景
                era: worldSettings.era || storyPlot.era || '現代',

                // 場所
                location: worldSettings.location || storyPlot.location || '物語の舞台'
            };
        } catch (error) {
            logger.error('Failed to retrieve basic story information for fallback', {
                error: error instanceof Error ? error.message : String(error)
            });

            // 最小限の汎用情報を返す
            return {
                genre: '物語',
                theme: '物語のテーマ',
                worldSettings: '物語の舞台設定',
                summary: '物語の進行',
                characters: null,
                era: '現代',
                location: '物語の舞台'
            };
        }
    }
}