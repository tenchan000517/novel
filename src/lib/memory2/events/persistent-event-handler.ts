/**
 * @fileoverview 永続的イベント処理を担当するハンドラー
 * @description
 * メモリマネージャーから切り出された永続的イベント処理機能を提供するクラスです。
 * 永続的イベントの記録と、それに伴うキャラクターの状態更新を担当します。
 */
import { logger } from '@/lib/utils/logger';
import { EventRegistry } from './event-registry';
import { CharacterManager } from '@/lib/characters/manager';
import { WorldKnowledge } from '../world-knowledge';
import { SignificantEvent } from '@/types/memory';
import { PersistentEventType } from '@/types/memory';
import { GrowthPhase } from '@/types/characters';

/**
 * @class PersistentEventHandler
 * @description
 * 永続的イベント処理を担当するハンドラークラス。
 * EventRegistry、CharacterManager、WorldKnowledgeと連携し、
 * 永続的イベントの記録とキャラクター状態の更新を行います。
 */
export class PersistentEventHandler {
    /**
     * PersistentEventHandlerを初期化します
     * @param eventRegistry EventRegistryインスタンス
     * @param characterManager CharacterManagerインスタンス
     * @param worldKnowledge WorldKnowledgeインスタンス
     */
    constructor(
        private eventRegistry: EventRegistry,
        private characterManager: CharacterManager,
        private worldKnowledge: WorldKnowledge
    ) {}
    
    /**
     * 永続的イベントを記録します
     * @param event 重要イベント
     * @returns 記録結果
     */
    async recordPersistentEvent(event: SignificantEvent): Promise<void> {
        try {
            // イベントが永続的であることを確認
            event.isPersistent = true;

            // 1. EventRegistryに基本イベントとして記録
            await this.eventRegistry.recordSignificantEvent(event);

            // 2. 関連するキャラクターの状態更新
            await this.updateCharactersForPersistentEvent(event);

            // 3. 世界知識に永続的事実として記録
            await this.worldKnowledge.establishPersistentFact(
                event.id,
                event.involvedCharacters[0], // 主要キャラクター名
                event.type as PersistentEventType,
                event.chapterNumber,
                event.description,
                event.location
            );

            logger.info(`Recorded persistent event: ${event.type}`, {
                eventId: event.id,
                chapterNumber: event.chapterNumber,
                charactersInvolved: event.involvedCharacters.join(', ')
            });
        } catch (error) {
            logger.error('Failed to record persistent event', {
                error: error instanceof Error ? error.message : String(error),
                eventType: event.type
            });
            throw error;
        }
    }

    /**
     * 永続的イベントに基づいてキャラクター状態を更新するメソッド
     * @private
     * @param {SignificantEvent} event 永続的イベント
     * @returns {Promise<void>}
     */
    private async updateCharactersForPersistentEvent(event: SignificantEvent): Promise<void> {
        try {
            // EventTypeに応じた処理
            switch (event.type) {
                case PersistentEventType.DEATH:
                    await this.processDeathEvent(event);
                    break;
                case PersistentEventType.MARRIAGE:
                    await this.processMarriageEvent(event);
                    break;
                case PersistentEventType.BIRTH:
                    await this.processBirthEvent(event);
                    break;
                case PersistentEventType.SKILL_ACQUISITION:
                    await this.processSkillAcquisitionEvent(event);
                    break;
                case PersistentEventType.RELOCATION:
                    await this.processRelocationEvent(event);
                    break;
                case PersistentEventType.PROMOTION:
                    await this.processPromotionEvent(event);
                    break;
                case PersistentEventType.MAJOR_INJURY:
                    await this.processMajorInjuryEvent(event);
                    break;
                case PersistentEventType.TRANSFORMATION:
                    await this.processTransformationEvent(event);
                    break;
                default:
                    // その他のイベントタイプは一般的な処理
                    await this.processGenericPersistentEvent(event);
            }
        } catch (error) {
            logger.error('Failed to update characters for persistent event', {
                error: error instanceof Error ? error.message : String(error),
                eventType: event.type
            });
        }
    }

    /**
     * 死亡イベントの処理
     * @private
     * @param {SignificantEvent} event 死亡イベント
     */
    private async processDeathEvent(event: SignificantEvent): Promise<void> {
        // 死亡したキャラクターの処理
        for (const charName of event.involvedCharacters) {
            try {
                // キャラクターを取得
                const character = await this.characterManager.getCharacterByName(charName);
                if (!character) continue;

                // 死亡状態に更新
                await this.characterManager.updateCharacter(character.id, {
                    state: {
                        ...character.state,
                        isActive: false,
                        isDeceased: true,
                        lastAppearance: event.chapterNumber
                    }
                });

                logger.info(`Updated character ${charName} to deceased state`);
            } catch (charError) {
                logger.warn(`Failed to update deceased state for character ${charName}`, {
                    error: charError instanceof Error ? charError.message : String(charError)
                });
            }
        }
    }

    /**
     * 結婚イベントの処理
     * @private
     * @param {SignificantEvent} event 結婚イベント
     */
    private async processMarriageEvent(event: SignificantEvent): Promise<void> {
        // 最低2人のキャラクターが必要
        if (event.involvedCharacters.length < 2) return;

        const char1Name = event.involvedCharacters[0];
        const char2Name = event.involvedCharacters[1];

        try {
            // 両キャラクターを取得
            const char1 = await this.characterManager.getCharacterByName(char1Name);
            const char2 = await this.characterManager.getCharacterByName(char2Name);

            if (!char1 || !char2) return;

            // char1の状態更新
            await this.characterManager.updateCharacter(char1.id, {
                state: {
                    ...char1.state,
                    maritalStatus: 'MARRIED',
                    spouseId: char2.id
                }
            });

            // char2の状態更新
            await this.characterManager.updateCharacter(char2.id, {
                state: {
                    ...char2.state,
                    maritalStatus: 'MARRIED',
                    spouseId: char1.id
                }
            });

            logger.info(`Updated marital status for ${char1Name} and ${char2Name}`);
        } catch (error) {
            logger.warn(`Failed to update marital status for characters`, {
                error: error instanceof Error ? error.message : String(error),
                characters: [char1Name, char2Name].join(', ')
            });
        }
    }

    /**
     * 出産/誕生イベントの処理
     * @private
     * @param {SignificantEvent} event 出産/誕生イベント
     */
    private async processBirthEvent(event: SignificantEvent): Promise<void> {
        // イベント説明から親と子の関係を特定
        let childName: string | null = null;
        let parentNames: string[] = [];

        // イベント説明から情報を抽出
        if (event.description.includes('が生まれ') || event.description.includes('が誕生')) {
            // 子供の名前を抽出
            const childMatch = event.description.match(/「([^」]+)」(?:が生まれ|が誕生)/);
            if (childMatch && childMatch[1]) {
                childName = childMatch[1];
                // 親はそれ以外の関与者
                parentNames = event.involvedCharacters.filter(name => name !== childName);
            }
        } else {
            // デフォルト: 最初のキャラクターを子、残りを親と想定
            if (event.involvedCharacters.length > 0) {
                childName = event.involvedCharacters[0];
                parentNames = event.involvedCharacters.slice(1);
            }
        }

        try {
            // 子キャラクターの処理
            if (childName) {
                const childChar = await this.characterManager.getCharacterByName(childName);
                if (childChar) {
                    // 親IDのリスト作成
                    const parentIds: string[] = [];
                    for (const parentName of parentNames) {
                        const parentChar = await this.characterManager.getCharacterByName(parentName);
                        if (parentChar) {
                            parentIds.push(parentChar.id);

                            // 親キャラクターの子供リストを更新
                            const parentChildren = parentChar.state.childrenIds || [];
                            if (!parentChildren.includes(childChar.id)) {
                                await this.characterManager.updateCharacter(parentChar.id, {
                                    state: {
                                        ...parentChar.state,
                                        childrenIds: [...parentChildren, childChar.id]
                                    }
                                });
                            }
                        }
                    }

                    // 子キャラクターの親リストを更新
                    await this.characterManager.updateCharacter(childChar.id, {
                        state: {
                            ...childChar.state,
                            parentIds: parentIds
                        }
                    });
                }
            }
        } catch (error) {
            logger.warn(`Failed to update family relations for birth event`, {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * スキル習得イベントの処理
     * @private
     * @param {SignificantEvent} event スキル習得イベント
     */
    private async processSkillAcquisitionEvent(event: SignificantEvent): Promise<void> {
        // スキル名の抽出
        let skillName: string | null = null;
        const skillPatterns = [
            /「([^」]+)」(?:というスキル|という能力|の技術)(?:を習得|を身につけ|を会得)/,
            /スキル「([^」]+)」(?:を習得|を身につけ|を会得)/,
            /技術「([^」]+)」(?:を習得|を身につけ|を会得)/
        ];

        for (const pattern of skillPatterns) {
            const match = event.description.match(pattern);
            if (match && match[1]) {
                skillName = match[1];
                break;
            }
        }

        if (!skillName) {
            // スキル名が見つからない場合は簡易な処理
            skillName = `不明なスキル (${event.chapterNumber}章)`;
        }

        // 各関与キャラクターにスキルを追加
        for (const charName of event.involvedCharacters) {
            try {
                const character = await this.characterManager.getCharacterByName(charName);
                if (!character) continue;

                // 現在のスキルリストを取得
                const currentSkills = character.state.skills || [];

                // 重複チェック
                if (!currentSkills.includes(skillName)) {
                    await this.characterManager.updateCharacter(character.id, {
                        state: {
                            ...character.state,
                            skills: [...currentSkills, skillName]
                        }
                    });

                    logger.info(`Added skill "${skillName}" to character ${charName}`);
                }
            } catch (charError) {
                logger.warn(`Failed to add skill to character ${charName}`, {
                    error: charError instanceof Error ? charError.message : String(charError)
                });
            }
        }
    }

    /**
     * 移住/引っ越しイベントの処理
     * @private
     * @param {SignificantEvent} event 移住イベント
     */
    private async processRelocationEvent(event: SignificantEvent): Promise<void> {
        // 移住先の抽出
        let newLocation: string | null = null;
        const locationPatterns = [
            /(?:移住|引っ越し|移動)(?:した|して)(?:先は|場所は|)「([^」]+)」/,
            /「([^」]+)」(?:に移住|に引っ越し|へ移動)(?:した|して)/
        ];

        for (const pattern of locationPatterns) {
            const match = event.description.match(pattern);
            if (match && match[1]) {
                newLocation = match[1];
                break;
            }
        }

        if (!newLocation) {
            // イベントロケーションを使用
            newLocation = event.location;
        }

        // 各関与キャラクターの居住地を更新
        for (const charName of event.involvedCharacters) {
            try {
                const character = await this.characterManager.getCharacterByName(charName);
                if (!character) continue;

                await this.characterManager.updateCharacter(character.id, {
                    state: {
                        ...character.state,
                        location: newLocation
                    }
                });

                logger.info(`Updated location of character ${charName} to ${newLocation}`);
            } catch (charError) {
                logger.warn(`Failed to update location for character ${charName}`, {
                    error: charError instanceof Error ? charError.message : String(charError)
                });
            }
        }
    }

    /**
     * 昇進/昇格イベントの処理
     * @param {SignificantEvent} event 昇進イベント
     */
    private async processPromotionEvent(event: SignificantEvent): Promise<void> {
        // 昇進情報の抽出
        let newTitle: string | null = null;
        let newRole: string | null = null;

        // 役職/タイトルのパターン
        const titlePatterns = [
            /「([^」]+)」(?:に昇進|に昇格|に就任|のポジションに)/,
            /(?:昇進|昇格|就任)(?:して|し)(?:、|。| )(?:新たに|新しく)?「([^」]+)」(?:となる|になる|に)/
        ];

        // 役割の変化パターン
        const rolePatterns = [
            /(?:役割|責任|立場)(?:が|は)「([^」]+)」(?:に変更|に変化|になる)/,
            /「([^」]+)」(?:という|の)(?:役割|責任|立場)(?:を担う|を持つ|になる)/
        ];

        // タイトル/役職を抽出
        for (const pattern of titlePatterns) {
            const match = event.description.match(pattern);
            if (match && match[1]) {
                newTitle = match[1];
                break;
            }
        }

        // 役割を抽出
        for (const pattern of rolePatterns) {
            const match = event.description.match(pattern);
            if (match && match[1]) {
                newRole = match[1];
                break;
            }
        }

        // 抽出できなかった場合は説明から推測
        if (!newTitle && !newRole && event.description.includes('昇進')) {
            // 単語の抽出（「〜に」の形）
            const positionMatch = event.description.match(/「([^」]+)」に/);
            if (positionMatch && positionMatch[1]) {
                newTitle = positionMatch[1];
            }
        }

        // 各関与キャラクターの状態を更新
        for (const charName of event.involvedCharacters) {
            try {
                const character = await this.characterManager.getCharacterByName(charName);
                if (!character) continue;

                // 昇進履歴を取得または初期化
                const promotionHistory = character.state.promotionHistory || [];

                // 新しい昇進記録を追加
                promotionHistory.push({
                    chapter: event.chapterNumber,
                    title: newTitle || 'Unknown Position',
                    description: event.description,
                    timestamp: new Date().toISOString()
                });

                // 更新データを準備
                const updateData: any = {
                    state: {
                        ...character.state,
                        promotionHistory
                    }
                };

                // タイトルがあれば更新（CharacterStateに'title'フィールドがない場合は拡張して追加）
                if (newTitle) {
                    updateData.state.title = newTitle;
                }

                // 役割があれば更新（CharacterStateに'role'フィールドがない場合は拡張して追加）
                if (newRole) {
                    updateData.state.role = newRole;
                }

                // キャラクター状態を更新
                await this.characterManager.updateCharacter(character.id, updateData);

                logger.info(`Updated promotion status for ${charName}: ${newTitle || newRole || 'position change'}`);
            } catch (charError) {
                logger.warn(`Failed to update promotion status for character ${charName}`, {
                    error: charError instanceof Error ? charError.message : String(charError)
                });
            }
        }
    }

    /**
     * 重大な負傷イベントの処理
     * @param {SignificantEvent} event 負傷イベント
     */
    private async processMajorInjuryEvent(event: SignificantEvent): Promise<void> {
        // 負傷情報の抽出
        let injuryDescription: string | null = null;
        let injurySeverity: 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL' = 'MODERATE';

        // 負傷説明の抽出パターン
        const injuryPatterns = [
            /「([^」]+)」(?:という|の)(?:負傷|怪我|傷|ケガ)/,
            /(?:負傷|怪我|傷|ケガ)(?:は|で|を負う)「([^」]+)」/
        ];

        // 負傷説明を抽出
        for (const pattern of injuryPatterns) {
            const match = event.description.match(pattern);
            if (match && match[1]) {
                injuryDescription = match[1];
                break;
            }
        }

        // 抽出できなかった場合はイベント説明を使用
        if (!injuryDescription) {
            injuryDescription = event.description;
        }

        // 重症度を評価
        if (event.description.includes('致命的') || event.description.includes('命に関わる')) {
            injurySeverity = 'CRITICAL';
        } else if (event.description.includes('重') || event.description.includes('深刻')) {
            injurySeverity = 'SEVERE';
        } else if (event.description.includes('軽')) {
            injurySeverity = 'MINOR';
        }

        // 各関与キャラクターの状態を更新
        for (const charName of event.involvedCharacters) {
            try {
                const character = await this.characterManager.getCharacterByName(charName);
                if (!character) continue;

                // 負傷リストを取得または初期化
                const injuries = character.state.injuries || [];

                // 新しい負傷を追加
                injuries.push({
                    id: `injury-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    description: injuryDescription || '不明な負傷',
                    severity: injurySeverity,
                    chapter: event.chapterNumber,
                    isHealed: false,
                    timestamp: new Date().toISOString()
                });

                // 現在の健康値を取得または初期化
                const currentHealth = character.state.health || 100;

                // キャラクター状態を更新
                await this.characterManager.updateCharacter(character.id, {
                    state: {
                        ...character.state,
                        injuries,
                        health: this.calculateHealth(currentHealth, injurySeverity)
                    }
                });

                logger.info(`Recorded injury for ${charName}: ${injuryDescription} (${injurySeverity})`);
            } catch (charError) {
                logger.warn(`Failed to record injury for character ${charName}`, {
                    error: charError instanceof Error ? charError.message : String(charError)
                });
            }
        }
    }

    /**
     * 健康状態を計算
     * @private
     * @param {number} currentHealth 現在の健康値
     * @param {string} severity 負傷の重症度
     * @returns {number} 更新された健康値
     */
    private calculateHealth(currentHealth: number = 100, severity: string): number {
        const healthReductions: { [key: string]: number } = {
            'MINOR': 5,
            'MODERATE': 15,
            'SEVERE': 30,
            'CRITICAL': 50
        };
        const reduction = healthReductions[severity] || 15;
        return Math.max(10, Math.min(100, currentHealth - reduction));
    }

    /**
     * 変身/変容イベントの処理
     * @param {SignificantEvent} event 変身イベント
     */
    private async processTransformationEvent(event: SignificantEvent): Promise<void> {
        // 変身の種類と説明を抽出
        let transformationType: string | null = null;
        let transformationDescription: string | null = null;

        // 変身タイプの抽出パターン
        const typePatterns = [
            /「([^」]+)」(?:に変身|に変容|に姿を変える|の姿になる)/,
            /(?:変身|変容|変化)(?:して|し)「([^」]+)」(?:になる|となる)/
        ];

        // 変身タイプを抽出
        for (const pattern of typePatterns) {
            const match = event.description.match(pattern);
            if (match && match[1]) {
                transformationType = match[1];
                break;
            }
        }

        // 説明を構築
        transformationDescription = transformationType
            ? `${transformationType}への変身/変容`
            : event.description;

        // 変身が一時的か永続的かを判断
        const isPermanent = !(
            event.description.includes('一時的') ||
            event.description.includes('一過性') ||
            event.description.includes('元に戻る')
        );

        // 各関与キャラクターの状態を更新
        for (const charName of event.involvedCharacters) {
            try {
                const character = await this.characterManager.getCharacterByName(charName);
                if (!character) continue;

                // 変身履歴を取得または初期化
                const transformations = character.state.transformations || [];

                // 新しい変身記録を追加
                transformations.push({
                    type: transformationType || 'UNKNOWN',
                    description: transformationDescription,
                    chapter: event.chapterNumber,
                    isPermanent,
                    timestamp: new Date().toISOString()
                });

                // 更新データを準備
                const updateData: any = {
                    state: {
                        ...character.state,
                        transformations
                    }
                };

                // 永続的な変身の場合は外見や特性も更新
                if (isPermanent && transformationType) {
                    updateData.state.currentForm = transformationType;

                    // 形態リストを取得または初期化
                    const forms = character.state.forms || [];

                    // 新しい形態を追加
                    forms.push({
                        name: transformationType,
                        description: transformationDescription,
                        acquiredInChapter: event.chapterNumber
                    });

                    updateData.state.forms = forms;
                }

                // キャラクター状態を更新
                await this.characterManager.updateCharacter(character.id, updateData);

                logger.info(`Recorded transformation for ${charName}: ${transformationDescription}`);
            } catch (charError) {
                logger.warn(`Failed to record transformation for character ${charName}`, {
                    error: charError instanceof Error ? charError.message : String(charError)
                });
            }
        }
    }

    /**
     * 一般的な永続的イベントの処理
     * @private
     * @param {SignificantEvent} event 永続的イベント
     */
    private async processGenericPersistentEvent(event: SignificantEvent): Promise<void> {
        // どのキャラクターにも影響があるイベントを記録
        for (const charName of event.involvedCharacters) {
            try {
                const character = await this.characterManager.getCharacterByName(charName);
                if (!character) continue;

                // キャラクターのイベント履歴に追加
                const eventRecord = {
                    type: event.type,
                    chapter: event.chapterNumber,
                    description: event.description,
                    timestamp: new Date()
                };

                // キャラクターの最終イベントを更新
                await this.characterManager.updateCharacter(character.id, {
                    state: {
                        ...character.state,
                        lastStateChange: {
                            type: event.type,
                            chapterNumber: event.chapterNumber,
                            description: event.description
                        }
                    }
                });

                logger.debug(`Recorded generic persistent event for character ${charName}`);
            } catch (charError) {
                logger.warn(`Failed to record generic event for character ${charName}`, {
                    error: charError instanceof Error ? charError.message : String(charError)
                });
            }
        }
    }
}