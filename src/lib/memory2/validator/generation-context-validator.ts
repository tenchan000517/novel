/**
 * @fileoverview 生成コンテキスト検証コンポーネント
 * @description
 * チャプター生成時のコンテキスト整合性を検証し、必要に応じて修正を行うコンポーネント。
 * 永続的イベントの影響をコンテキストに適切に反映させるために使用されます。
 */
import { logger } from '@/lib/utils/logger';
import { GenerationContext } from '@/types/generation';
import { SignificantEvent, PersistentEventType } from '@/types/memory';
import { EventRegistry } from '../events/event-registry';
import { CharacterManager } from '@/lib/characters/manager';
import { WorldKnowledge } from '../world-knowledge';

/**
 * @class GenerationContextValidator
 * @description
 * 生成コンテキストの整合性検証と修正を行うコンポーネント。
 * 永続的イベントの影響を考慮し、キャラクター状態や物語状態の整合性を確保します。
 */
export class GenerationContextValidator {
    /**
     * コンストラクタ
     * @param eventRegistry イベントレジストリ
     * @param characterManager キャラクターマネージャー
     * @param worldKnowledge 世界知識
     */
    constructor(
        private eventRegistry: EventRegistry,
        private characterManager: CharacterManager,
        private worldKnowledge: WorldKnowledge
    ) {
        logger.info('GenerationContextValidator initialized');
    }

    // events/persistent-event-handler.ts に追加するメソッド（既存のクラスの末尾に追加）

    /**
     * 生成コンテキストの整合性を検証するメソッド
     * @param {GenerationContext} context 生成コンテキスト
     * @returns {Promise<{consistent: boolean, issues: string[]}>} 検証結果
     */
    async validateGenerationContext(context: GenerationContext): Promise<{
        consistent: boolean;
        issues: string[];
    }> {
        const issues: string[] = [];

        try {
            logger.debug(`Validating critical event consistency for chapter ${context.chapterNumber}`);

            // 1. 死亡キャラクターチェック
            const deceasedCharacters = await this.eventRegistry.getEventsByTypes([PersistentEventType.DEATH], {
                isPersistent: true
            });

            // 死亡キャラクターのIDリストを作成
            const deceasedCharacterIds: string[] = [];
            for (const event of deceasedCharacters) {
                for (const charId of event.involvedCharacters) {
                    if (!deceasedCharacterIds.includes(charId)) {
                        deceasedCharacterIds.push(charId);
                    }
                }
            }

            if (deceasedCharacterIds.length > 0) {
                logger.debug(`Found ${deceasedCharacterIds.length} deceased characters to validate`);
            }

            for (const char of context.characters || []) {
                if (deceasedCharacterIds.includes(char.id) && !char.state.isDeceased) {
                    issues.push(`キャラクター「${char.name}」は死亡していますが、コンテキストで生存しています`);
                }
            }

            // 2. 結婚状態チェック
            const marriageEvents = await this.eventRegistry.getEventsByTypes([PersistentEventType.MARRIAGE], {
                isPersistent: true
            });

            // 結婚ペアを抽出
            const marriedPairs: Array<{ char1Id: string, char2Id: string }> = [];
            for (const event of marriageEvents) {
                if (event.involvedCharacters.length >= 2) {
                    marriedPairs.push({
                        char1Id: event.involvedCharacters[0],
                        char2Id: event.involvedCharacters[1]
                    });
                }
            }

            if (marriedPairs.length > 0) {
                logger.debug(`Found ${marriedPairs.length} married character pairs to validate`);
            }

            for (const pair of marriedPairs) {
                const char1 = context.characters?.find(c => c.id === pair.char1Id);
                const char2 = context.characters?.find(c => c.id === pair.char2Id);

                if (char1 && !char1.state.maritalStatus) {
                    issues.push(`キャラクター「${char1.name}」は結婚していますが、コンテキストに反映されていません`);
                }

                if (char2 && !char2.state.maritalStatus) {
                    issues.push(`キャラクター「${char2.name}」は結婚していますが、コンテキストに反映されていません`);
                }
            }

            // 3. 親子関係チェック
            const birthEvents = await this.eventRegistry.getEventsByTypes([PersistentEventType.BIRTH], {
                isPersistent: true
            });

            if (birthEvents.length > 0) {
                logger.debug(`Found ${birthEvents.length} birth events to validate`);

                for (const event of birthEvents) {
                    // イベント説明から親子関係を抽出して検証
                    await this.validateFamilyRelations(context, event, issues);
                }
            }

            // 4. スキル習得チェック
            const skillEvents = await this.eventRegistry.getEventsByTypes([PersistentEventType.SKILL_ACQUISITION], {
                isPersistent: true
            });

            if (skillEvents.length > 0) {
                logger.debug(`Found ${skillEvents.length} skill acquisition events to validate`);

                for (const event of skillEvents) {
                    // イベント情報からスキル習得を抽出して検証
                    await this.validateAcquiredSkills(context, event, issues);
                }
            }

            // 5. 永続的移住チェック
            const relocationEvents = await this.eventRegistry.getEventsByTypes([PersistentEventType.RELOCATION], {
                isPersistent: true
            });

            if (relocationEvents.length > 0) {
                logger.debug(`Found ${relocationEvents.length} relocation events to validate`);

                for (const event of relocationEvents) {
                    // イベント情報から移住情報を抽出して検証
                    await this.validateCharacterLocation(context, event, issues);
                }
            }

            return {
                consistent: issues.length === 0,
                issues
            };
        } catch (error) {
            logger.error('Context validation error', {
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                consistent: true, // エラー時はデフォルトで整合していると判断
                issues: []
            };
        }
    }

    /**
     * 親子関係の検証
     * @private
     * @param {GenerationContext} context 生成コンテキスト
     * @param {SignificantEvent} event 出産/誕生イベント
     * @param {string[]} issues 問題リスト
     */
    private async validateFamilyRelations(context: GenerationContext, event: SignificantEvent, issues: string[]): Promise<void> {
        try {
            // 子供と親を抽出
            let childName: string | null = null;
            let parentNames: string[] = [];

            // イベント説明の分析
            if (event.description.includes('が生まれ') || event.description.includes('が誕生')) {
                // イベント説明から子供の名前を抽出
                const childMatch = event.description.match(/「([^」]+)」(?:が生まれ|が誕生)/);
                if (childMatch && childMatch[1]) {
                    childName = childMatch[1];
                }

                // 親はそれ以外の関係者として扱う
                parentNames = event.involvedCharacters.filter(name => name !== childName);
            } else if (event.description.includes('の子')) {
                // 「〇〇の子」形式の説明から親を抽出
                const parentMatches = event.description.match(/「([^」]+)」の子/g);
                if (parentMatches) {
                    parentNames = parentMatches.map(match => {
                        const parentMatch = match.match(/「([^」]+)」/);
                        return parentMatch ? parentMatch[1] : '';
                    }).filter(Boolean);
                }

                // 子供は残りの関係者
                const possibleChildren = event.involvedCharacters.filter(name => !parentNames.includes(name));
                if (possibleChildren.length > 0) {
                    childName = possibleChildren[0];
                }
            }

            // キャラクターコンテキストでの検証
            if (childName) {
                const childChar = context.characters?.find(c => c.name === childName);
                if (childChar) {
                    // 子供の親関係を検証
                    const hasParentIds = childChar.state.parentIds && childChar.state.parentIds.length > 0;

                    if (!hasParentIds && parentNames.length > 0) {
                        // 親IDが設定されていない場合は問題として追加
                        issues.push(`キャラクター「${childChar.name}」は出生イベントがありますが、親関係が反映されていません`);
                    }
                }
            }

            // 親側の検証
            for (const parentName of parentNames) {
                const parentChar = context.characters?.find(c => c.name === parentName);
                if (parentChar && childName) {
                    // 親の子供関係を検証
                    const hasChildrenIds = parentChar.state.childrenIds && parentChar.state.childrenIds.length > 0;

                    if (!hasChildrenIds) {
                        // 子供IDが設定されていない場合は問題として追加
                        issues.push(`キャラクター「${parentChar.name}」は「${childName}」の親ですが、子供関係が反映されていません`);
                    }
                }
            }
        } catch (error) {
            logger.warn('Error validating family relations', {
                error: error instanceof Error ? error.message : String(error),
                eventId: event.id
            });
        }
    }

    /**
     * 習得スキルの検証
     * @private
     * @param {GenerationContext} context 生成コンテキスト
     * @param {SignificantEvent} event スキル習得イベント
     * @param {string[]} issues 問題リスト
     */
    private async validateAcquiredSkills(context: GenerationContext, event: SignificantEvent, issues: string[]): Promise<void> {
        try {
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

            if (!skillName) return; // スキル名が不明な場合は検証できない

            // キャラクターの検証
            for (const charName of event.involvedCharacters) {
                const character = context.characters?.find(c => c.name === charName);
                if (character) {
                    // スキルリストの確認
                    const hasSkill = character.state.skills &&
                        character.state.skills.some(skill =>
                            skill === skillName || skill.includes(skillName!)
                        );

                    if (!hasSkill) {
                        issues.push(`キャラクター「${character.name}」は「${skillName}」を習得していますが、スキルリストに反映されていません`);
                    }
                }
            }
        } catch (error) {
            logger.warn('Error validating acquired skills', {
                error: error instanceof Error ? error.message : String(error),
                eventId: event.id
            });
        }
    }

    /**
     * キャラクターの居住地検証
     * @private
     * @param {GenerationContext} context 生成コンテキスト
     * @param {SignificantEvent} event 移住イベント
     * @param {string[]} issues 問題リスト
     */
    private async validateCharacterLocation(context: GenerationContext, event: SignificantEvent, issues: string[]): Promise<void> {
        try {
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

            if (!newLocation) return; // 移住先が不明な場合は検証できない

            // キャラクターの検証
            for (const charName of event.involvedCharacters) {
                const character = context.characters?.find(c => c.name === charName);
                if (character) {
                    // 現在地の確認
                    const locationMismatch = character.state.location &&
                        character.state.location !== newLocation &&
                        !character.state.location.includes(newLocation) &&
                        !newLocation.includes(character.state.location);

                    if (locationMismatch) {
                        issues.push(`キャラクター「${character.name}」は「${newLocation}」に移住していますが、現在地が「${character.state.location}」になっています`);
                    } else if (!character.state.location) {
                        issues.push(`キャラクター「${character.name}」は「${newLocation}」に移住していますが、現在地が設定されていません`);
                    }
                }
            }
        } catch (error) {
            logger.warn('Error validating character location', {
                error: error instanceof Error ? error.message : String(error),
                eventId: event.id
            });
        }
    }

    /**
     * コンテキストの矛盾を修正するメソッド
     * 
     * @param {GenerationContext} context 生成コンテキスト
     * @param {{ consistent: boolean; issues: string[] }} consistencyResult 整合性チェック結果
     * @returns {Promise<Partial<GenerationContext>>} 修正されたコンテキスト
     */
    async correctGenerationContext(
        context: GenerationContext,
        consistencyResult: { consistent: boolean; issues: string[] }
    ): Promise<Partial<GenerationContext>> {
        const corrections: Partial<GenerationContext> = {};

        // 問題がなければ修正不要
        if (consistencyResult.consistent) {
            return corrections;
        }

        logger.info(`Correcting context inconsistencies for chapter ${context.chapterNumber}`);

        // キャラクター配列のコピーを作成
        const correctedCharacters = [...(context.characters || [])];

        // 各問題に対応
        for (const issue of consistencyResult.issues) {
            // 死亡キャラクターの修正
            if (issue.includes('死亡していますが')) {
                const nameMatch = issue.match(/「(.+?)」/);
                if (nameMatch) {
                    const charName = nameMatch[1];
                    const charIndex = correctedCharacters.findIndex(c => c.name === charName);

                    if (charIndex >= 0) {
                        // キャラクターの状態を死亡に修正
                        correctedCharacters[charIndex] = {
                            ...correctedCharacters[charIndex],
                            state: {
                                ...correctedCharacters[charIndex].state,
                                isActive: false,
                                isDeceased: true
                            }
                        };

                        logger.info(`修正: キャラクター「${charName}」の状態を死亡に修正しました`);
                    }
                }
            }

            // 結婚状態の修正
            else if (issue.includes('結婚していますが')) {
                const nameMatch = issue.match(/「(.+?)」/);
                if (nameMatch) {
                    const charName = nameMatch[1];
                    const charIndex = correctedCharacters.findIndex(c => c.name === charName);

                    if (charIndex >= 0) {
                        // 配偶者情報の検索
                        const spouseId = await this.findSpouseId(charName);

                        // 結婚状態に修正
                        correctedCharacters[charIndex] = {
                            ...correctedCharacters[charIndex],
                            state: {
                                ...correctedCharacters[charIndex].state,
                                maritalStatus: 'MARRIED',
                                spouseId: spouseId
                            }
                        };

                        logger.info(`修正: キャラクター「${charName}」の結婚状態を修正しました`);
                    }
                }
            }

            // 親子関係の修正
            else if (issue.includes('親ですが') || issue.includes('出生イベントがありますが')) {
                const nameMatch = issue.match(/「(.+?)」/);
                if (nameMatch) {
                    const charName = nameMatch[1];
                    // 親子関係の自動修正は複雑なので警告のみ
                    logger.warn(`親子関係の不整合: ${issue}`);
                }
            }

            // スキル習得の修正
            else if (issue.includes('習得していますが')) {
                // スキル名と対象キャラクターを抽出
                const nameMatch = issue.match(/「(.+?)」は「(.+?)」を習得/);
                if (nameMatch && nameMatch.length >= 3) {
                    const charName = nameMatch[1];
                    const skillName = nameMatch[2];
                    const charIndex = correctedCharacters.findIndex(c => c.name === charName);

                    if (charIndex >= 0) {
                        // スキルリストの更新
                        const existingSkills = correctedCharacters[charIndex].state.skills || [];
                        const updatedSkills = [...existingSkills, skillName];

                        correctedCharacters[charIndex] = {
                            ...correctedCharacters[charIndex],
                            state: {
                                ...correctedCharacters[charIndex].state,
                                skills: updatedSkills
                            }
                        };

                        logger.info(`修正: キャラクター「${charName}」にスキル「${skillName}」を追加しました`);
                    }
                }
            }

            // 居住地の修正
            else if (issue.includes('移住していますが')) {
                // 移住先と対象キャラクターを抽出
                const nameMatch = issue.match(/「(.+?)」は「(.+?)」に移住/);
                if (nameMatch && nameMatch.length >= 3) {
                    const charName = nameMatch[1];
                    const location = nameMatch[2];
                    const charIndex = correctedCharacters.findIndex(c => c.name === charName);

                    if (charIndex >= 0) {
                        correctedCharacters[charIndex] = {
                            ...correctedCharacters[charIndex],
                            state: {
                                ...correctedCharacters[charIndex].state,
                                location: location
                            }
                        };

                        logger.info(`修正: キャラクター「${charName}」の居住地を「${location}」に更新しました`);
                    }
                }
            }
        }

        // 修正したキャラクター配列を返す
        corrections.characters = correctedCharacters;

        // 問題の影響を受けるコンテキスト部分も修正
        // 例: 死亡キャラクターが焦点キャラクターになっていれば削除
        if (context.focusCharacters) {
            const deceasedNames = correctedCharacters
                .filter(c => c.state.isDeceased)
                .map(c => c.name);

            corrections.focusCharacters = (context.focusCharacters as string[])
                .filter(name => !deceasedNames.includes(name));

            // 焦点キャラクターが変わった場合はログ出力
            if (corrections.focusCharacters.length !== (context.focusCharacters as string[]).length) {
                logger.info(`修正: 焦点キャラクターから死亡キャラクターを削除しました`);
            }
        }

        // storyContext内の死亡キャラクター言及も修正（正規表現で検索して置換）
        if (context.storyContext) {
            // 死亡キャラクターの名前リスト
            const deceasedNames = correctedCharacters
                .filter(c => c.state.isDeceased)
                .map(c => c.name);

            if (deceasedNames.length > 0) {
                let modifiedStoryContext = context.storyContext;

                // 各死亡キャラクターについて、修正が必要な文脈を置換
                for (const name of deceasedNames) {
                    // 「名前は〜する」のパターンを「名前の死体は〜」または「名前は既に死亡している」に変更
                    const activePattern = new RegExp(`${name}は(?!死亡)(?!亡くな)(?!既に)([^。]+?)(する|した|している)`, 'g');
                    modifiedStoryContext = modifiedStoryContext.replace(
                        activePattern,
                        `${name}は既に死亡しているため、$1$2ことはできない`
                    );
                }

                if (modifiedStoryContext !== context.storyContext) {
                    corrections.storyContext = modifiedStoryContext;
                    logger.info(`修正: ストーリーコンテキスト内の死亡キャラクターの行動表現を修正しました`);
                }
            }
        }

        return corrections;
    }

    /**
     * 配偶者IDを検索するヘルパーメソッド
     * @private
     * @param {string} characterName キャラクター名
     * @returns {Promise<string|null>} 配偶者ID
     */
    private async findSpouseId(characterName: string): Promise<string | null> {
        try {
            // 結婚イベントを検索
            const marriageEvents = await this.eventRegistry.getEventsByTypes([PersistentEventType.MARRIAGE], {
                isPersistent: true
            });

            // キャラクターが関与する結婚イベントを検索
            for (const event of marriageEvents) {
                const involvedCharacters = event.involvedCharacters;
                if (involvedCharacters.includes(characterName) && involvedCharacters.length >= 2) {
                    // 配偶者は他の関与者
                    for (const charName of involvedCharacters) {
                        if (charName !== characterName) {
                            // CharacterManagerからIDを検索
                            const character = await this.characterManager.getCharacterByName(charName);
                            if (character) {
                                return character.id;
                            }
                        }
                    }
                }
            }

            return null;
        } catch (error) {
            logger.error('Failed to find spouse ID', {
                error: error instanceof Error ? error.message : String(error),
                characterName
            });
            return null;
        }
    }

}