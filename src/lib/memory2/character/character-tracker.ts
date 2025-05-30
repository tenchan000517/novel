/**
 * @fileoverview キャラクター登場と成長の追跡を担当するモジュール
 * @description
 * メモリマネージャーから切り出されたキャラクター関連機能を提供するクラスです。
 * キャラクターの登場追跡、成長記録と変化検出を担当します。
 */
import { logger } from '@/lib/utils/logger';
import { characterManager } from '@/lib/characters/manager';
import { EventRegistry } from '../events/event-registry';
import { Chapter } from '@/types/chapters';
import { SignificantEvent } from '@/types/memory';
import { GrowthPhase } from '@/types/characters';
import { CharacterDiff } from '@/types/characters';
import { ImmediateContext } from '@/lib/memory/immediate-context';
import { NarrativeMemory } from '@/lib/memory/narrative-memory';
import { WorldKnowledge } from '@/lib/memory/world-knowledge';

/**
 * @class CharacterTracker
 * @description
 * キャラクターの登場と成長を追跡するトラッカークラス。
 * CharacterManagerとEventRegistryと連携し、キャラクターの登場記録、
 * 成長処理、変化検出を行います。
 */
export class CharacterTracker {
    /**
     * CharacterTrackerを初期化します
     * @param characterManager CharacterManagerインスタンス
     * @param eventRegistry EventRegistryインスタンス
     */
    constructor(
        private characterManager: any,
        private eventRegistry: EventRegistry,
        private immediateContext: ImmediateContext,
        private narrativeMemory: NarrativeMemory,
        private worldKnowledge: WorldKnowledge,
    ) { }

    /**
     * キャラクターの登場を記録します
     * @param characterId キャラクターID
     * @param characterName キャラクター名
     * @param chapterNumber 章番号
     * @param significance 重要度（デフォルト: 0.5）
     */
    async recordCharacterAppearance(
        characterId: string,
        characterName: string,
        chapterNumber: number,
        significance: number = 0.5
    ): Promise<void> {
        try {
            // EventRegistryを利用してイベントを記録
            await this.eventRegistry.recordSignificantEvent({
                id: `appearance-${characterId}-ch${chapterNumber}-${Date.now()}`,
                chapterNumber: chapterNumber,
                description: `${characterName}が章${chapterNumber}に登場`,
                involvedCharacters: [characterName],
                type: 'CHARACTER_APPEARANCE',
                significance: significance,
                timestamp: new Date().toISOString(),
                location: '', // 空の場所を追加
                relatedEvents: [] // 必要に応じて空の配列を追加
            });

            logger.debug(`Recorded appearance for character ${characterName} in chapter ${chapterNumber}`);
        } catch (error) {
            logger.error(`Failed to record character appearance`, {
                error: error instanceof Error ? error.message : String(error),
                characterId,
                chapterNumber
            });
        }
    }

    /**
     * 章に登場したキャラクターの成長を処理します
     * @param chapter 章情報
     */
    async processCharacterGrowthForChapter(chapter: Chapter): Promise<void> {
        try {
            // 章に登場したキャラクターを検出
            const detectedCharacters = await this.characterManager.detectCharactersInContent(chapter.content);
            logger.info(`Detected ${detectedCharacters.length} characters in chapter ${chapter.chapterNumber}`);

            // キャラクターの成長とイベント連携を処理
            for (const character of detectedCharacters) {
                try {
                    // 1. キャラクターの登場を記録
                    await this.recordCharacterAppearance(character.id, character.name, chapter.chapterNumber);

                    // 2. キャラクターに成長処理を適用し、結果を取得（CharacterManagerに委任）
                    const growthResult = await this.characterManager.applyGrowthPlan(character.id, chapter.chapterNumber);

                    // 3. 成長結果をイベントとして記録
                    if (growthResult.appliedPhase || growthResult.parameterChanges.length > 0 || growthResult.acquiredSkills.length > 0) {
                        await this.recordGrowthResultEvents(character, growthResult, chapter.chapterNumber);
                    }
                } catch (charError) {
                    logger.error(`Error processing growth for character ${character.id}`, {
                        error: charError instanceof Error ? charError.message : String(charError)
                    });
                }
            }

            logger.info(`Processed character growth for chapter ${chapter.chapterNumber}`);
        } catch (error) {
            logger.error(`Failed to process character growth`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber: chapter.chapterNumber
            });
        }
    }

    /**
     * キャラクターの変化を処理します
     * @param characterDiff キャラクター変化情報
     * @param chapterNumber 章番号
     */
    async processCharacterChanges(characterDiff: CharacterDiff, chapterNumber: number): Promise<void> {
        try {
            logger.info(`キャラクター変化の処理: ${characterDiff.name} (チャプター${chapterNumber})`);

            // CharacterManagerに委譲
            await this.characterManager.processCharacterChanges(characterDiff, chapterNumber);

            // 各メモリレイヤーにも変化を反映
            await this.worldKnowledge.refreshCharacterData(characterDiff.id);

            const chapter = await this.immediateContext.getChapter(chapterNumber);
            if (chapter) {
                await this.immediateContext.updateCharacterState(
                    chapter,
                    characterDiff.name,
                    characterDiff.changes
                );
            }
        } catch (error) {
            logger.error('キャラクター変化処理中にエラーが発生', {
                character: characterDiff.name,
                chapterNumber,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * キャラクターメモリを追加します
     * @param memoryData キャラクターメモリデータ
     */
    async addCharacterMemory(memoryData: {
        characterId: string;
        characterName: string;
        content: string;
        type: string;
        chapterNumber: number;
        importance: number;
        metadata?: any;
    }): Promise<void> {
        try {
            // EventRegistryを利用してSignificantEventとして記録
            await this.eventRegistry.recordSignificantEvent({
                id: `char-mem-${memoryData.characterId}-ch${memoryData.chapterNumber}-${Date.now()}`,
                chapterNumber: memoryData.chapterNumber,
                description: memoryData.content,
                involvedCharacters: [memoryData.characterName],
                type: memoryData.type,
                significance: memoryData.importance,
                timestamp: new Date().toISOString(),
                location: '',
                relatedEvents: []
            });

            logger.info(`キャラクターメモリを記録しました: ${memoryData.characterName} - ${memoryData.content}`);
        } catch (error) {
            logger.error(`キャラクターメモリの記録に失敗しました`, {
                error: error instanceof Error ? error.message : String(error),
                characterId: memoryData.characterId
            });
        }
    }

    /**
     * 成長結果をイベントとして記録
     * @param character キャラクター情報
     * @param growthResult 成長結果
     * @param chapterNumber 章番号
     * @private
     */
    private async recordGrowthResultEvents(
        character: { id: string; name: string; },
        growthResult: {
            appliedPhase: GrowthPhase | null;
            parameterChanges: Array<{ id: string; name: string; change: number; }>;
            acquiredSkills: Array<{ id: string; name: string; }>;
        },
        chapterNumber: number
    ): Promise<void> {
        try {
            // 1. 成長フェーズの適用イベント
            if (growthResult.appliedPhase) {
                await this.eventRegistry.recordSignificantEvent({
                    id: `growth-phase-${character.id}-ch${chapterNumber}-${Date.now()}`,
                    chapterNumber: chapterNumber,
                    description: `${character.name}は「${growthResult.appliedPhase.name}」の段階に成長した`,
                    involvedCharacters: [character.name],
                    type: 'CHARACTER_GROWTH',
                    significance: 0.8,
                    timestamp: new Date().toISOString(),
                    location: '', // 空の場所を追加
                    relatedEvents: [] // 必要に応じて空の配列を追加
                });
            }

            // 2. 重要なパラメータ変更イベント
            const significantChanges = growthResult.parameterChanges.filter(change => Math.abs(change.change) >= 5);
            if (significantChanges.length > 0) {
                await this.eventRegistry.recordSignificantEvent({
                    id: `param-change-${character.id}-ch${chapterNumber}-${Date.now()}`,
                    chapterNumber: chapterNumber,
                    description: `${character.name}の能力が向上: ${significantChanges.map(p => `${p.name}(${p.change > 0 ? '+' : ''}${p.change})`).join(', ')}`,
                    involvedCharacters: [character.name],
                    type: 'PARAMETER_CHANGE',
                    significance: 0.6,
                    timestamp: new Date().toISOString(),
                    location: '', // 空の場所を追加
                    relatedEvents: [] // 必要に応じて空の配列を追加
                });
            }

            // 3. スキル獲得イベント
            for (const skill of growthResult.acquiredSkills) {
                await this.eventRegistry.recordSignificantEvent({
                    id: `skill-acq-${character.id}-${skill.id}-${Date.now()}`,
                    chapterNumber: chapterNumber,
                    description: `${character.name}はスキル「${skill.name}」を習得した`,
                    involvedCharacters: [character.name],
                    type: 'SKILL_ACQUISITION',
                    significance: 0.7,
                    timestamp: new Date().toISOString(),
                    isPersistent: true, // スキル習得は永続的イベント
                    location: '', // 空の場所を追加
                    relatedEvents: [] // 必要に応じて空の配列を追加
                });
            }
        } catch (error) {
            logger.error(`Failed to record character growth events`, {
                error: error instanceof Error ? error.message : String(error),
                characterId: character.id,
                chapterNumber
            });
        }
    }

    /**
     * 死亡したキャラクターを取得します
     * @returns 死亡キャラクターIDの配列
     */
    async getDeceasedCharacters(): Promise<string[]> {
        try {
            // 「DEATH」タイプの永続的イベントを検索
            const deathEvents = await this.eventRegistry.getEventsByTypes(['DEATH'], {
                isPersistent: true
            });

            // 死亡キャラクターIDのセット（重複を排除）
            const deceasedCharIds = new Set<string>();

            // 各死亡イベントからキャラクターIDを収集
            for (const event of deathEvents) {
                for (const charName of event.involvedCharacters) {
                    // 名前からIDを取得
                    const character = await this.characterManager.getCharacterByName(charName);
                    if (character) {
                        deceasedCharIds.add(character.id);
                    }
                }
            }

            return Array.from(deceasedCharIds);
        } catch (error) {
            logger.error('Failed to get deceased characters', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 結婚したキャラクターペアを取得します
     * @returns 結婚ペアの配列
     */
    async getMarriedCharacterPairs(): Promise<Array<{ char1Id: string, char2Id: string }>> {
        try {
            // 「MARRIAGE」タイプの永続的イベントを検索
            const marriageEvents = await this.eventRegistry.getEventsByTypes(['MARRIAGE'], {
                isPersistent: true
            });

            // 結婚ペアの配列
            const marriedPairs: Array<{ char1Id: string, char2Id: string }> = [];

            // 各結婚イベントからキャラクターペアを収集
            for (const event of marriageEvents) {
                // イベントに2人のキャラクターが含まれているか確認
                if (event.involvedCharacters.length >= 2) {
                    const char1Name = event.involvedCharacters[0];
                    const char2Name = event.involvedCharacters[1];

                    // 名前からIDを取得
                    const char1 = await this.characterManager.getCharacterByName(char1Name);
                    const char2 = await this.characterManager.getCharacterByName(char2Name);

                    if (char1 && char2) {
                        marriedPairs.push({
                            char1Id: char1.id,
                            char2Id: char2.id
                        });
                    }
                }
            }

            return marriedPairs;
        } catch (error) {
            logger.error('Failed to get married character pairs', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }
}