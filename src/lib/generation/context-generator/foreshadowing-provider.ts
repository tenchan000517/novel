// src/lib/generation/context-generator/foreshadowing-provider.ts
import { logger } from '@/lib/utils/logger';
import { MemoryManager } from '@/lib/memory/manager';
import { storageProvider } from '@/lib/storage';
import { parseYaml } from '@/lib/utils/yaml-helper';
import { Foreshadowing } from '@/types/memory';
import { parameterManager } from '@/lib/parameters';

/**
 * 伏線情報プロバイダークラス
 * 物語の伏線情報を提供する
 */
export class ForeshadowingProvider {
    private memoryManager: MemoryManager;

    /**
     * コンストラクタ
     * @param memoryManager 記憶マネージャーのインスタンス
     */
    constructor(memoryManager: MemoryManager) {
        this.memoryManager = memoryManager;
        logger.info('ForeshadowingProvider initialized');
    }

    /**
     * 伏線情報を取得する
     * 章番号と伏線密度に基づいて最適な伏線セットを構築
     * 
     * @param {number} chapterNumber 章番号
     * @param {number} [foreshadowingDensity] 伏線密度（0-1）
     * @returns {Promise<any[]>} 伏線情報配列
     */
    async getForeshadowing(chapterNumber: number, foreshadowingDensity?: number): Promise<any[]> {
        try {
            // memoryManager初期化確認
            if (!this.memoryManager) {
                logger.error('ForeshadowingProvider: memoryManager is not initialized');
                return [];
            }
            
            // パラメータの取得（デフォルト値はここで設定）
            const params = parameterManager.getParameters();
            const density = foreshadowingDensity !== undefined ? 
                foreshadowingDensity : 
                params.plot.foreshadowingDensity || 0.5;
            
            // 未解決の伏線を取得（完全なオブジェクト）
            const allForeshadowing = await this.getLongTermUnresolvedForeshadowing();
            
            if (!allForeshadowing || allForeshadowing.length === 0) {
                return [];
            }
            
            // 現在のチャプターに関連する伏線のフィルタリング
            let relevantForeshadowing = this.filterRelevantForeshadowing(
                allForeshadowing,
                chapterNumber,
                params.plot.resolutionDistance || 10
            );
            
            // 伏線密度に基づいて数を調整
            const targetCount = Math.max(1, Math.min(5, Math.round(density * 5)));
            
            // 密度に基づいて数を調整
            if (relevantForeshadowing.length > targetCount) {
                relevantForeshadowing = relevantForeshadowing.slice(0, targetCount);
            }
            
            // 伏線情報を拡張（解決の緊急性や提案される解決方法を追加）
            const enhancedForeshadowing = await Promise.all(relevantForeshadowing.map(async fs => {
                // 伏線の重要度に基づく緊急性
                const urgencyLevel = this.calculateUrgency(fs, chapterNumber);
                
                // 解決のための具体的な提案
                const resolutionSuggestions = await this.generateResolutionSuggestions(fs, chapterNumber);
                
                // 関連キャラクター情報の強化
                const relatedCharactersInfo = await this.getRelatedCharactersInfo(fs.relatedCharacters || []);
                
                return {
                    ...fs,
                    urgencyLevel,
                    resolutionSuggestions,
                    relatedCharactersInfo
                };
            }));
            
            return enhancedForeshadowing;
        } catch (error) {
            logger.error('Failed to get foreshadowing', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });
            return [];
        }
    }

    /**
     * ファイルから伏線情報を取得
     * @param chapterNumber チャプター番号
     * @returns 伏線情報の説明文配列
     */
    private async getForeshadowingFromFile(chapterNumber: number): Promise<string[]> {
        try {
            // ファイルパスを構築
            const filePath = `data/foreshadowing/chapter-${chapterNumber}.yaml`;
            
            // ファイルの存在チェック
            const exists = await storageProvider.fileExists(filePath);
            if (!exists) {
                logger.warn(`Foreshadowing file not found for chapter ${chapterNumber}`);
                return [];
            }
            
            // ファイルを読み込む
            const content = await storageProvider.readFile(filePath);
            const data = parseYaml(content);
            
            // データのフォーマットチェック
            if (!Array.isArray(data)) {
                logger.warn(`Invalid foreshadowing data format for chapter ${chapterNumber}`);
                return [];
            }
            
            // 説明文を抽出
            return data.map(item => item.description || '未定義の伏線');
        } catch (error) {
            logger.error(`Failed to read foreshadowing from file for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 短期記憶からの伏線取得
     * @param chapterNumber チャプター番号
     * @returns 伏線情報の配列
     */
    private async getRecentForeshadowing(chapterNumber: number): Promise<Foreshadowing[]> {
        // パラメータから短期記憶の範囲を取得
        const params = parameterManager.getParameters();
        const shortTermChapters = params.memory.shortTermChapters;
        
        // パラメータに基づいて取得チャプター数を決定
        const recentChapters = await this.memoryManager.getRecentChapterMemories(
            Math.max(1, chapterNumber - shortTermChapters), // パラメータに基づく直近チャプター
            chapterNumber
        );

        const foreshadowing: Foreshadowing[] = [];
        for (const chapter of recentChapters) {
            if (chapter.foreshadowing) {
                foreshadowing.push(...chapter.foreshadowing);
            }
        }

        return foreshadowing;
    }

    /**
     * 中期記憶からのアーク関連伏線取得
     * @param chapterNumber チャプター番号
     * @returns 伏線情報の配列
     */
    private async getCurrentArcForeshadowing(chapterNumber: number): Promise<Foreshadowing[]> {
        const currentArc = await this.memoryManager.getCurrentArc(chapterNumber);
        if (!currentArc) {
            return [];
        }
    
        const arcMemory = await this.memoryManager.getMidTermMemory().getArcMemory(currentArc.number);
        return arcMemory?.foreshadowing || [];
    }

    /**
     * 長期記憶からの未解決伏線取得
     * @returns 伏線情報の配列
     */
    private async getLongTermUnresolvedForeshadowing(): Promise<Foreshadowing[]> {
        return await this.memoryManager.getLongTermMemory().getUnresolvedForeshadowing();
    }

    /**
     * 伏線情報の統合（重複排除）
     * @param foreshadowingArrays 伏線情報の配列の配列
     * @returns 統合された伏線情報の配列
     */
    private mergeForeshadowingFromMemory(...foreshadowingArrays: Foreshadowing[][]): Foreshadowing[] {
        const uniqueForeshadowing = new Map<string, Foreshadowing>();

        for (const fsArray of foreshadowingArrays) {
            for (const fs of fsArray) {
                if (!uniqueForeshadowing.has(fs.id)) {
                    uniqueForeshadowing.set(fs.id, fs);
                }
            }
        }

        return Array.from(uniqueForeshadowing.values());
    }

    /**
     * 関連性のある伏線をフィルターする
     * 
     * @private
     * @param {any[]} foreshadowing 伏線配列
     * @param {number} chapterNumber 現在の章番号
     * @param {number} resolutionDistance 解決までの最大章数
     * @returns {any[]} フィルターされた伏線配列
     */
    private filterRelevantForeshadowing(
        foreshadowing: any[], 
        chapterNumber: number,
        resolutionDistance: number
    ): any[] {
        if (!foreshadowing || foreshadowing.length === 0) {
            return [];
        }

        // 1. 経過章数に基づく重要度を計算
        const foreshadowingWithRelevance = foreshadowing.map(fs => {
            const chaptersElapsed = chapterNumber - fs.chapter_introduced;
            
            // 予定された解決章が存在する場合それを使用
            const plannedResolution = fs.plannedResolution || fs.plannedResolutionChapter;
            const hasPlannedResolution = !!plannedResolution;
            
            // 解決予定までの距離
            const distanceToResolution = hasPlannedResolution ? 
                plannedResolution - chapterNumber : resolutionDistance;
            
            // 優先度計算アルゴリズム
            let priority;
            
            if (hasPlannedResolution) {
                if (distanceToResolution <= 0) {
                    // 解決予定章を過ぎている場合は最優先
                    priority = 1.0;
                } else if (distanceToResolution <= 2) {
                    // 解決予定章が近い場合は高優先
                    priority = 0.9;
                } else if (distanceToResolution <= 5) {
                    // 解決予定章までまだ少しある場合は中優先
                    priority = 0.7;
                } else {
                    // それ以外は通常優先度
                    priority = 0.5;
                }
            } else {
                // 解決予定がない場合は、経過章数に基づく
                if (chaptersElapsed <= 2) {
                    // 最近導入された伏線は低優先
                    priority = 0.3;
                } else if (chaptersElapsed <= 5) {
                    // 少し前に導入された伏線は中低優先
                    priority = 0.5;
                } else if (chaptersElapsed <= 10) {
                    // 中期間前の伏線は中優先
                    priority = 0.7;
                } else {
                    // 長期間解決されていない伏線は高優先
                    priority = 0.8;
                }
            }
            
            // 緊急度を加味
            if (fs.urgency === 'critical') priority += 0.2;
            else if (fs.urgency === 'high') priority += 0.1;
            
            // 上限を1.0に
            priority = Math.min(1.0, priority);
            
            return {
                ...fs,
                priority,
                chaptersElapsed,
                distanceToResolution
            };
        });

        // 2. 優先度に基づいて並べ替え
        const sorted = foreshadowingWithRelevance.sort((a, b) => b.priority - a.priority);
        
        // 3. 返却（最大8件）
        return sorted.slice(0, 8);
    }

    /**
     * 伏線の緊急度を計算
     * 
     * @private
     * @param {any} foreshadowing 伏線情報
     * @param {number} chapterNumber 現在の章番号
     * @returns {number} 緊急度（0-1）
     */
    private calculateUrgency(foreshadowing: any, chapterNumber: number): number {
        // 基本緊急度
        let urgency = 0.5;
        
        // 計画された解決章に近づくにつれて緊急度を上げる
        if (foreshadowing.plannedResolution || foreshadowing.plannedResolutionChapter) {
            const plannedChapter = foreshadowing.plannedResolution || foreshadowing.plannedResolutionChapter;
            const chaptersUntilResolution = plannedChapter - chapterNumber;
            
            if (chaptersUntilResolution <= 0) {
                // 解決予定章を過ぎた場合は最高緊急度
                urgency = 1.0;
            } else if (chaptersUntilResolution <= 1) {
                // 次章が解決予定なら高緊急度
                urgency = 0.9;
            } else if (chaptersUntilResolution <= 3) {
                // 3章以内なら中高緊急度
                urgency = 0.7;
            } else if (chaptersUntilResolution <= 5) {
                // 5章以内なら中緊急度
                urgency = 0.5;
            } else {
                // それ以上先なら低緊急度
                urgency = 0.3;
            }
        } else {
            // 計画された解決章がない場合は導入からの経過章数で判断
            const chaptersElapsed = chapterNumber - foreshadowing.chapter_introduced;
            
            if (chaptersElapsed >= 15) {
                // 長期間解決されていない伏線は緊急度を上げる
                urgency = 0.8;
            } else if (chaptersElapsed >= 10) {
                urgency = 0.6;
            } else if (chaptersElapsed >= 5) {
                urgency = 0.4;
            } else {
                urgency = 0.2;
            }
        }
        
        // 伏線自体の緊急度指定がある場合は考慮
        if (foreshadowing.urgency === 'critical') {
            urgency += 0.2;
        } else if (foreshadowing.urgency === 'high') {
            urgency += 0.1;
        } else if (foreshadowing.urgency === 'low') {
            urgency -= 0.1;
        }
        
        // 0-1の範囲に制限
        return Math.max(0, Math.min(1, urgency));
    }

    /**
     * 伏線の解決提案を生成
     * 
     * @private
     * @param {any} foreshadowing 伏線情報
     * @param {number} chapterNumber 現在の章番号
     * @returns {Promise<string[]>} 解決提案の配列
     */
    private async generateResolutionSuggestions(foreshadowing: any, chapterNumber: number): Promise<string[]> {
        // すでに解決提案がある場合はそれを使用
        if (foreshadowing.potential_resolution) {
            return [foreshadowing.potential_resolution];
        }
        
        if (foreshadowing.potentialResolution) {
            return [foreshadowing.potentialResolution];
        }
        
        // 解決提案が配列で保存されている場合
        if (foreshadowing.resolutionSuggestions && Array.isArray(foreshadowing.resolutionSuggestions) && 
            foreshadowing.resolutionSuggestions.length > 0) {
            return foreshadowing.resolutionSuggestions;
        }
        
        // 緊急度に基づく解決提案の数
        const urgency = this.calculateUrgency(foreshadowing, chapterNumber);
        const suggestionCount = urgency >= 0.8 ? 3 : urgency >= 0.5 ? 2 : 1;
        
        // 非常に基本的な提案（実際にはAIで生成するとより良い）
        const basicSuggestions = [
            `${foreshadowing.description}の真実が明らかになる`,
            `${foreshadowing.description}の背景となる出来事が説明される`,
            `${foreshadowing.description}が物語の新たな展開につながる`
        ];
        
        return basicSuggestions.slice(0, suggestionCount);
    }

    /**
     * 関連キャラクター情報を取得
     * 
     * @private
     * @param {string[]} characterIds キャラクターID配列
     * @returns {Promise<any[]>} キャラクター情報配列
     */
    private async getRelatedCharactersInfo(characterIds: string[]): Promise<any[]> {
        if (!characterIds || characterIds.length === 0) {
            return [];
        }
        
        // 世界知識からキャラクター情報を取得
        const charactersInfo = await Promise.all(
            characterIds.map(async id => {
                try {
                    const character = await this.memoryManager.getLongTermMemory().getCharacter(id);
                    if (character) {
                        return {
                            id,
                            name: character.name,
                            traits: character.traits || []
                        };
                    }
                    return null;
                } catch (error) {
                    logger.warn(`Failed to get character info for ${id}`, { error });
                    return null;
                }
            })
        );
        
        // nullを除去して返却
        return charactersInfo.filter(Boolean) as any[];
    }
}