/**
 * @fileoverview プロンプトフォーマッタークラス
 * @description 各種データをプロンプト用にフォーマットする
 */

import { logger } from '@/lib/utils/logger';
import { Character } from '@/types/characters';
import { CharacterManager } from '@/lib/characters/manager';
import { WorldSettings } from '@/lib/plot/types';

/**
 * プロンプトフォーマッタークラス
 * キャラクター、世界設定、伏線などの情報をプロンプト用にフォーマットする
 */
export class PromptFormatter {
    private characterManager?: CharacterManager;

    /**
     * コンストラクタ
     * @param {CharacterManager} [characterManager] キャラクター管理インスタンス
     */
    constructor(characterManager?: CharacterManager) {
        this.characterManager = characterManager;
    }

    /**
     * 世界設定情報をフォーマットする
     * @param {string | WorldSettings} worldSettings 世界設定情報
     * @returns {string} フォーマットされた世界設定情報
     */
    public formatWorldSettings(worldSettings: string | WorldSettings): string {
        if (!worldSettings) {
            return '特に指定なし';
        }

        // WorldSettings オブジェクトの場合
        if (typeof worldSettings !== 'string') {
            return this.convertWorldSettingsToString(worldSettings);
        }

        // 文字列の場合は段落に分割して整形
        const paragraphs = worldSettings.split(/\n\n+/);

        // 箇条書きに変換
        if (paragraphs.length > 1) {
            return paragraphs.map(p => `- ${p.trim()}`).join('\n');
        }

        return worldSettings.trim();
    }

    /**
     * WorldSettings オブジェクトを文字列に変換する
     * @private
     * @param {WorldSettings} worldSettings 世界設定オブジェクト
     * @returns {string} 文字列化された世界設定
     */
    private convertWorldSettingsToString(worldSettings: WorldSettings): string {
        if (!worldSettings) return '';

        // 基本的な説明がある場合はそれを優先
        if (worldSettings.description) {
            return worldSettings.description;
        }

        // それ以外の場合は構造化された情報から文字列を構築
        let result = '';

        // 地域情報
        if (worldSettings.regions && worldSettings.regions.length > 0) {
            result += `地域:\n`;
            worldSettings.regions.forEach(region => {
                result += `- ${region}\n`;
            });
            result += '\n';
        }

        // 歴史情報
        if (worldSettings.history && worldSettings.history.length > 0) {
            result += `歴史:\n`;
            worldSettings.history.forEach(historyItem => {
                result += `- ${historyItem}\n`;
            });
            result += '\n';
        }

        // ルール情報
        if (worldSettings.rules && worldSettings.rules.length > 0) {
            result += `世界のルール:\n`;
            worldSettings.rules.forEach(rule => {
                result += `- ${rule}\n`;
            });
            result += '\n';
        }

        return result.trim();
    }

    /**
     * キャラクター情報をフォーマットする
     * @param {Character[]} characters キャラクター情報の配列
     * @returns {Promise<string>} フォーマットされたキャラクター情報
     */
    public async formatCharacters(characters: Character[]): Promise<string> {
        if (!characters || characters.length === 0) {
            return '特に指定なし';
        }

        // CharacterManagerが利用可能な場合、そちらを使用
        if (this.characterManager) {
            try {
                // IDを持つキャラクターのみを抽出
                const characterIds = characters
                    .filter(char => char.id)
                    .map(char => char.id);

                if (characterIds.length > 0) {
                    logger.debug(`Using CharacterManager to format ${characterIds.length} characters`);

                    // 現在のコンテキストに基づいて詳細度を決定
                    const detailLevel = this.calculateDetailLevel(characters.length);

                    // CharacterManagerを使用して高度なフォーマットを取得
                    // const formattedCharacters = await this.characterManager.formatCharactersForPrompt(
                    //     characterIds,
                    //     detailLevel
                    // );

                    // if (formattedCharacters && formattedCharacters.trim()) {
                    //     return formattedCharacters;
                    // }
                }
            } catch (error) {
                logger.warn('Error using CharacterManager for formatting', {
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        // 独自のフォーマット（基本実装）
        return this.formatCharactersBasic(characters);
    }

    /**
     * キャラクター情報を基本的な方法でフォーマットする
     * @private
     * @param {Character[]} characters キャラクター情報の配列
     * @returns {string} フォーマットされたキャラクター情報
     */
    private formatCharactersBasic(characters: Character[]): string {
        return characters.map(char => {
            let info = `【${char.name}】`;

            // 基本情報
            if (char.description) {
                info += `\n特徴: ${char.description}`;
            }

            // 役割/タイプ
            if (char.type) {
                const typeLabel = char.type === 'MAIN' ? '主要人物' :
                    char.type === 'SUB' ? '脇役' :
                        char.type === 'MOB' ? '端役' :
                            char.type === 'ANTAGONIST' ? '敵対者' : '登場人物';
                info += `\n役割: ${typeLabel}`;
            }

            // 性格特性
            if ((char as any).traits && (char as any).traits.length > 0) {
                info += `\n性格: ${(char as any).traits.join('、')}`;
            } else if (char.personality) {
                const personality = typeof char.personality === 'object'
                    ? this.formatPersonality(char.personality)
                    : char.personality;
                info += `\n性格: ${personality}`;
            }

            // 目標/動機
            if ((char as any).goals && (char as any).goals.length > 0) {
                info += `\n目標: ${(char as any).goals.join('、')}`;
            }

            // 現在の状態（存在する場合）
            if ((char as any).currentState) {
                info += `\n現在の状態: ${(char as any).currentState}`;
            }

            // 感情状態（存在する場合）
            if ((char as any).emotionalState) {
                info += `\n感情状態: ${(char as any).emotionalState}`;
            }

            // 関係性情報（存在する場合）
            if ((char as any).relationships && (char as any).relationships.length > 0) {
                info += `\n関係性: ${(char as any).relationships.map((r: any) =>
                    `${r.targetName}（${r.type}${r.description ? `: ${r.description}` : ''}）`
                ).join('、')}`;
            }

            // スキル情報
            if ((char as any).skills && Array.isArray((char as any).skills) && (char as any).skills.length > 0) {
                const skills = (char as any).skills;
                info += `\nスキル: ${skills.map((s: any) =>
                    `${s.name}${s.level ? ` (Lv.${s.level})` : ''}`
                ).join('、')}`;
            }

            // パラメータ情報
            if ((char as any).parameters && Array.isArray((char as any).parameters) && (char as any).parameters.length > 0) {
                const parameters = (char as any).parameters;
                // 値でソートして上位のパラメータを表示
                const topParams = [...parameters].sort((a: any, b: any) =>
                    (b.value || 0) - (a.value || 0)
                ).slice(0, 3);

                if (topParams.length > 0) {
                    info += `\n優れた特性: ${topParams.map((p: any) => p.name).join('、')}`;
                }
            }

            // 成長フェーズ
            if ((char as any).growthPhase) {
                info += `\n成長状態: ${(char as any).growthPhase}`;
            }

            // 重要度が高い場合の特記
            if (char.significance && char.significance > 0.8) {
                info += `\n※このキャラクターは物語において特に重要です。`;
            }

            return info;
        }).join('\n\n');
    }

    /**
     * 性格情報をフォーマットする
     * @private
     * @param {any} personality 性格情報オブジェクト
     * @returns {string} フォーマットされた性格情報
     */
    private formatPersonality(personality: any): string {
        if (!personality) return '';

        // 特性がある場合は連結
        if (personality.traits && Array.isArray(personality.traits)) {
            return personality.traits.join('、');
        }

        // オブジェクトの場合はフラットな文字列に変換
        try {
            return Object.entries(personality)
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => {
                    if (Array.isArray(value)) {
                        return `${key}: ${value.join('、')}`;
                    }
                    return `${key}: ${value}`;
                })
                .join('、');
        } catch (e) {
            return String(personality);
        }
    }

    /**
     * 適切な詳細レベルを決定する
     * @private
     * @param {number} characterCount キャラクター数
     * @returns {"brief" | "standard" | "detailed"} 詳細レベル
     */
    private calculateDetailLevel(characterCount: number): "brief" | "standard" | "detailed" {
        if (characterCount > 6) {
            return "brief";      // 多数のキャラクターの場合は簡潔に
        } else if (characterCount <= 3) {
            return "detailed";   // 少数のキャラクターの場合は詳細に
        } else {
            return "standard";   // 中間のケース
        }
    }

    /**
     * 伏線情報をフォーマットする
     * @param {any[]} foreshadowing 伏線情報の配列
     * @returns {string} フォーマットされた伏線情報
     */
    public formatForeshadowing(foreshadowing: any[]): string {
        if (!foreshadowing || foreshadowing.length === 0) {
            return '特になし';
        }

        const formatted = foreshadowing.map(fs => {
            let result = '';

            // 基本説明
            if (typeof fs === 'object' && fs.description) {
                result = fs.description;

                // 解決の緊急性に応じた追記
                if (fs.urgencyLevel >= 0.8) {
                    result += `（このチャプターで解決すべき重要な伏線）`;
                } else if (fs.urgencyLevel >= 0.5) {
                    result += `（解決に向けて進展させるべき伏線）`;
                } else {
                    result += `（さりげなく言及すべき伏線）`;
                }

                // 提案される解決方法があれば追加
                if (fs.resolutionSuggestions && fs.resolutionSuggestions.length > 0) {
                    result += `\n  解決案: ${fs.resolutionSuggestions[0]}`;
                }

                // 関連キャラクターがあれば追加
                if (fs.relatedCharactersInfo && fs.relatedCharactersInfo.length > 0) {
                    result += `\n  関係者: ${fs.relatedCharactersInfo.map((c: any) => c.name).join('、')}`;
                }
            } else {
                // オブジェクトでない場合は単純に文字列化
                result = String(fs);
            }

            return result;
        }).join('\n\n');

        return formatted;
    }

    /**
     * 矛盾情報をフォーマットする
     * @param {any[]} contradictions 矛盾情報の配列
     * @returns {string} フォーマットされた矛盾情報
     */
    public formatContradictions(contradictions: any[]): string {
        if (!contradictions || contradictions.length === 0) {
            return '特になし';
        }

        const formatted = contradictions.map((contradiction, index) => {
            // 矛盾の基本説明
            let result = `${index + 1}. `;

            if (typeof contradiction === 'object') {
                // 詳細な矛盾情報オブジェクトの場合
                if (contradiction.description) {
                    result += contradiction.description;
                }

                // 重大度に応じた特記
                if (contradiction.severity && contradiction.severity > 0.7) {
                    result += `（重大な矛盾、必ず解決してください）`;
                } else if (contradiction.severity && contradiction.severity > 0.4) {
                    result += `（要注意の矛盾）`;
                }

                // 修正提案があれば追加
                if (contradiction.resolutionSuggestions && contradiction.resolutionSuggestions.length > 0) {
                    result += `\n   修正案: ${contradiction.resolutionSuggestions[0]}`;
                }

                // 関連箇所があれば追加
                if (contradiction.context) {
                    result += `\n   発生箇所: ${contradiction.context}`;
                }
            } else {
                // 単純な文字列の場合
                result += String(contradiction);
            }

            return result;
        }).join('\n\n');

        return formatted;
    }

    /**
     * 永続的イベント情報をフォーマットする
     * @param {any} persistentEvents 永続的イベント情報
     * @returns {string} フォーマットされた永続的イベント情報
     */
    public formatPersistentEvents(persistentEvents: any): string {
        if (!persistentEvents) return '';

        let section = '\n\n## 【重要】永続的なイベント履歴（必ず遵守）\n';

        // 死亡イベント
        if (persistentEvents.deaths && persistentEvents.deaths.length > 0) {
            section += '\n### 死亡したキャラクター\n';
            for (const death of persistentEvents.deaths) {
                section += `- **${death.character}**は第${death.chapterNumber}章で死亡しました。${death.description}\n`;
            }
            section += '\n**注意:** 死亡したキャラクターは生き返らせないでください。死者として扱い、回想や言及のみ可能です。\n';
        }

        // 結婚イベント
        if (persistentEvents.marriages && persistentEvents.marriages.length > 0) {
            section += '\n### 結婚したキャラクター\n';
            for (const marriage of persistentEvents.marriages) {
                section += `- **${marriage.characters.join('**と**')}**は第${marriage.chapterNumber}章で結婚しました。${marriage.description}\n`;
            }
            section += '\n**注意:** 結婚したキャラクターは既婚者として扱い、関係性に一貫性を持たせてください。\n';
        }

        // 出産/誕生イベント
        if (persistentEvents.births && persistentEvents.births.length > 0) {
            section += '\n### 出産・誕生\n';
            for (const birth of persistentEvents.births) {
                section += `- **${birth.parents.join('**と**')}**の間に第${birth.chapterNumber}章で子供が生まれました。${birth.description}\n`;
            }
            section += '\n**注意:** 親子関係は継続しており、関連するキャラクターの行動や対話に反映してください。\n';
        }

        // 昇進イベント
        if (persistentEvents.promotions && persistentEvents.promotions.length > 0) {
            section += '\n### 昇進・昇格\n';
            for (const promotion of persistentEvents.promotions) {
                section += `- **${promotion.character}**は第${promotion.chapterNumber}章で昇進しました。${promotion.description}\n`;
            }
            section += '\n**注意:** 昇進したキャラクターの役職や地位を適切に反映してください。\n';
        }

        // スキル習得イベント
        if (persistentEvents.skillAcquisitions && persistentEvents.skillAcquisitions.length > 0) {
            section += '\n### 習得したスキル\n';
            for (const skill of persistentEvents.skillAcquisitions) {
                section += `- **${skill.character}**は第${skill.chapterNumber}章で${skill.description}\n`;
            }
            section += '\n**注意:** 習得したスキルは失われません。キャラクターがこれらのスキルを活用する機会を提供してください。\n';
        }

        // 重傷イベント
        if (persistentEvents.injuries && persistentEvents.injuries.length > 0) {
            section += '\n### 重大な怪我\n';
            for (const injury of persistentEvents.injuries) {
                section += `- **${injury.character}**は第${injury.chapterNumber}章で重傷を負いました。${injury.description}\n`;
            }
            section += '\n**注意:** 重傷の影響は簡単に消えません。キャラクターの行動や能力にこれらを反映してください。\n';
        }

        // 変身/変容イベント
        if (persistentEvents.transformations && persistentEvents.transformations.length > 0) {
            section += '\n### 変身・変容\n';
            for (const transformation of persistentEvents.transformations) {
                section += `- **${transformation.character}**は第${transformation.chapterNumber}章で変化しました。${transformation.description}\n`;
            }
            section += '\n**注意:** 外見や能力の変化は恒久的なものです。一貫性を保って描写してください。\n';
        }

        // 引っ越し/移住イベント
        if (persistentEvents.relocations && persistentEvents.relocations.length > 0) {
            section += '\n### 引っ越し・移住\n';
            for (const relocation of persistentEvents.relocations) {
                section += `- **${relocation.character}**は第${relocation.chapterNumber}章で移住しました。${relocation.description}\n`;
            }
            section += '\n**注意:** キャラクターの現在地は変更されています。特別な理由がない限り、この場所に留まります。\n';
        }

        // ビジネスイベント（追加）
        if (persistentEvents.businessEvents && persistentEvents.businessEvents.length > 0) {
            section += '\n### 重要なビジネスイベント\n';
            for (const event of persistentEvents.businessEvents) {
                section += `- **${event.title}**は第${event.chapterNumber}章で発生しました。${event.description}\n`;
            }
            section += '\n**注意:** これらのビジネス上の重要イベントは今後のストーリー展開に大きく影響します。意思決定や戦略に反映してください。\n';
        }

        // 資金調達イベント（追加）
        if (persistentEvents.fundingEvents && persistentEvents.fundingEvents.length > 0) {
            section += '\n### 資金調達イベント\n';
            for (const event of persistentEvents.fundingEvents) {
                section += `- **${event.company}**は第${event.chapterNumber}章で${event.amount}の資金調達に${event.success ? '成功' : '失敗'}しました。${event.description}\n`;
            }
            section += '\n**注意:** 資金状況は企業の戦略決定や組織の雰囲気に直接影響します。一貫した財務状況を維持してください。\n';
        }

        // 企業買収/合併イベント（追加）
        if (persistentEvents.acquisitions && persistentEvents.acquisitions.length > 0) {
            section += '\n### 買収・合併イベント\n';
            for (const event of persistentEvents.acquisitions) {
                section += `- **${event.acquirer}**は第${event.chapterNumber}章で**${event.target}**を買収/合併しました。${event.description}\n`;
            }
            section += '\n**注意:** 企業の所有関係や組織構造の変化は物語全体に一貫して反映されるべきです。\n';
        }

        // パートナーシップイベント（追加）
        if (persistentEvents.partnerships && persistentEvents.partnerships.length > 0) {
            section += '\n### 戦略的パートナーシップ\n';
            for (const event of persistentEvents.partnerships) {
                section += `- **${event.parties.join('**と**')}**は第${event.chapterNumber}章で提携関係を構築しました。${event.description}\n`;
            }
            section += '\n**注意:** これらの提携関係はビジネス判断や市場戦略に継続的に影響します。\n';
        }

        // 製品/サービスローンチイベント（追加）
        if (persistentEvents.productLaunches && persistentEvents.productLaunches.length > 0) {
            section += '\n### 製品・サービスローンチ\n';
            for (const event of persistentEvents.productLaunches) {
                section += `- **${event.company}**は第${event.chapterNumber}章で**${event.productName}**をローンチしました。${event.description}\n`;
            }
            section += '\n**注意:** ローンチされた製品・サービスは企業の中核ビジネスとなります。一貫したプロダクトラインを維持してください。\n';
        }

        // 市場拡大イベント（追加）
        if (persistentEvents.marketExpansions && persistentEvents.marketExpansions.length > 0) {
            section += '\n### 市場拡大イベント\n';
            for (const event of persistentEvents.marketExpansions) {
                section += `- **${event.company}**は第${event.chapterNumber}章で${event.market}市場に参入しました。${event.description}\n`;
            }
            section += '\n**注意:** 新市場への参入は事業戦略と組織構造に永続的な影響を与えます。市場特性を反映した描写を心がけてください。\n';
        }

        // 経営危機イベント（追加）
        if (persistentEvents.businessCrises && persistentEvents.businessCrises.length > 0) {
            section += '\n### 経営危機イベント\n';
            for (const event of persistentEvents.businessCrises) {
                section += `- **${event.company}**は第${event.chapterNumber}章で${event.crisisType}危機に直面しました。${event.description}\n`;
                if (event.resolution) {
                    section += `  解決策: ${event.resolution}\n`;
                }
            }
            section += '\n**注意:** 経営危機とその対応は組織文化と経営判断に長期的な影響を与えます。危機後の意思決定にこの経験を反映させてください。\n';
        }

        // リーダーシップ変更イベント（追加）
        if (persistentEvents.leadershipChanges && persistentEvents.leadershipChanges.length > 0) {
            section += '\n### リーダーシップ変更\n';
            for (const event of persistentEvents.leadershipChanges) {
                if (event.departure && event.replacement) {
                    section += `- **${event.company}**は第${event.chapterNumber}章で**${event.departure}**が退任し、**${event.replacement}**が${event.position}に就任しました。${event.description}\n`;
                } else if (event.departure) {
                    section += `- **${event.company}**の**${event.departure}**は第${event.chapterNumber}章で${event.position}を退任しました。${event.description}\n`;
                } else if (event.replacement) {
                    section += `- **${event.replacement}**は第${event.chapterNumber}章で**${event.company}**の${event.position}に就任しました。${event.description}\n`;
                }
            }
            section += '\n**注意:** リーダーシップの変化は組織の方向性、文化、意思決定プロセスに根本的な影響を与えます。新旧のリーダーシップスタイルの違いを反映させてください。\n';
        }

        // 規制変更イベント（追加）
        if (persistentEvents.regulatoryChanges && persistentEvents.regulatoryChanges.length > 0) {
            section += '\n### 規制・法的環境の変化\n';
            for (const event of persistentEvents.regulatoryChanges) {
                section += `- 第${event.chapterNumber}章で**${event.regulation}**が施行/変更されました。${event.description}\n`;
                if (event.impact) {
                    section += `  影響: ${event.impact}\n`;
                }
            }
            section += '\n**注意:** 規制環境の変化は事業展開の可能性と制約に永続的な影響を与えます。法的制約を考慮した事業判断を描写してください。\n';
        }

        // 知的財産イベント（追加）
        if (persistentEvents.intellectualPropertyEvents && persistentEvents.intellectualPropertyEvents.length > 0) {
            section += '\n### 知的財産イベント\n';
            for (const event of persistentEvents.intellectualPropertyEvents) {
                if (event.type === 'patent') {
                    section += `- **${event.owner}**は第${event.chapterNumber}章で**${event.title}**の特許を取得しました。${event.description}\n`;
                } else if (event.type === 'trademark') {
                    section += `- **${event.owner}**は第${event.chapterNumber}章で**${event.title}**の商標を登録しました。${event.description}\n`;
                } else if (event.type === 'copyright') {
                    section += `- **${event.owner}**は第${event.chapterNumber}章で**${event.title}**の著作権を確立しました。${event.description}\n`;
                } else if (event.type === 'dispute') {
                    section += `- **${event.parties.join('**と**')}**の間で第${event.chapterNumber}章で知的財産紛争が発生しました。${event.description}\n`;
                }
            }
            section += '\n**注意:** 知的財産は企業の競争優位性の源泉であり、市場での立ち位置に永続的な影響を与えます。知的財産の保護と活用を意識した描写を心がけてください。\n';
        }

        // ビジネスイベント（追加）
        if (persistentEvents.businessEvents && persistentEvents.businessEvents.length > 0) {
            section += '\n### 重要なビジネスイベント\n';
            for (const event of persistentEvents.businessEvents) {
                section += `- **${event.title}**は第${event.chapterNumber}章で発生しました。${event.description}\n`;
            }
            section += '\n**注意:** これらのビジネス上の重要イベントは今後のストーリー展開に大きく影響します。意思決定や戦略に反映してください。\n';
        }

        // 全体的な注意事項の追加
        if (Object.values(persistentEvents).some(array => Array.isArray(array) && array.length > 0)) {
            section += `
    ### 【永続的イベントの一般ルール】
    1. 上記の永続的イベントは物語全体で一貫して維持されなければなりません
    2. これらのイベントを無視したり、矛盾する展開を導入しないでください
    3. イベントの影響は継続的に物語に反映されます - 発生したイベントは取り消せません
    4. これらのイベントへの言及は自然な形で行い、会話や回想の中で過去の出来事として参照できます
    5. 各イベントがもたらした変化を、キャラクターの心理状態や行動、判断基準に反映させてください
    `;

            // ビジネス特有のルールの追加
            const hasBusinessEvents = [
                'businessEvents', 'fundingEvents', 'acquisitions', 'partnerships',
                'productLaunches', 'marketExpansions', 'businessCrises',
                'leadershipChanges', 'regulatoryChanges', 'intellectualPropertyEvents'
            ].some(key => persistentEvents[key] && persistentEvents[key].length > 0);

            if (hasBusinessEvents) {
                section += `
    ### 【ビジネスイベントの特別ルール】
    1. 資金調達状況は事業展開の可能性と制約に直接影響します - 資金状況に応じた戦略を描写してください
    2. 製品・サービスラインナップは一貫性を持たせ、突然の無関係な製品導入は避けてください
    3. 企業間の関係（提携、競合、M&A）は一度確立されると安易に変更されるべきではありません
    4. 市場状況の変化は全ての事業判断の背景として常に意識されるべきです
    5. 組織の成長段階に応じた社内文化の変化、意思決定プロセスの変化を反映させてください
    `;
            }
        }

        return section;
    }

    /**
     * イベントサブセクションをフォーマットする
     * @param {string[]} events イベント配列
     * @param {string} title セクションタイトル
     * @returns {string} フォーマットされたイベントセクション
     */
    public formatEventSubsection(events: string[], title: string): string {
        if (!events || !Array.isArray(events) || events.length === 0) {
            return '';
        }

        return `
    ### ${title}
    ${events.map(event => `- ${event}`).join('\n')}
    `;
    }

    /**
     * 表現カテゴリ名をフォーマットする
     * @param {string} category カテゴリ名
     * @returns {string} フォーマットされたカテゴリ名
     */
    public formatCategoryName(category: string): string {
        const categoryMap: { [key: string]: string } = {
            'verbPhrases': '動詞フレーズ',
            'adjectivalExpressions': '形容表現',
            'dialoguePatterns': '会話表現',
            'conjunctions': '接続語',
            'sentenceStructures': '文構造パターン'
        };

        return categoryMap[category] || category;
    }

    /**
     * 物語状態のガイダンスをフォーマットする
     * @param {any} narrativeState 物語状態情報
     * @param {string} genre ジャンル
     * @param {string[]} stateGuidance 状態固有のガイダンス
     * @returns {string} フォーマットされた物語状態ガイダンス
     */
    public formatNarrativeStateGuidance(narrativeState: any, genre: string, stateGuidance: string[]): string {
        // stateの安全な文字列化
        const state = narrativeState.state ?
            (typeof narrativeState.state === 'object' ?
                JSON.stringify(narrativeState.state) :
                String(narrativeState.state)) :
            '不明';

        let guidance = `現在の物語状態: ${state}\n`;

        // 状態固有のガイダンスを追加
        if (stateGuidance.length > 0) {
            stateGuidance.forEach(item => {
                guidance += item + '\n';
            });
        }

        // 停滞情報の追加
        if (narrativeState.stagnationDetected) {
            guidance += '\n【停滞警告】\n';
            guidance += `現在の物語状態が${narrativeState.duration}章続いており、新たな展開が必要です。\n`;

            if (narrativeState.recommendations && narrativeState.recommendations.length > 0) {
                guidance += '推奨される展開方向:\n';
                narrativeState.recommendations.forEach((rec: string) => {
                    guidance += `- ${rec}\n`;
                });
            }

            if (narrativeState.suggestedNextState) {
                guidance += `推奨される次の状態: ${narrativeState.suggestedNextState}\n`;
            }
        }

        // タイムフレームと場所の情報
        if (narrativeState.timeOfDay || narrativeState.location || narrativeState.weather) {
            guidance += '\n【設定情報】\n';
            if (narrativeState.timeOfDay) guidance += `時間帯: ${narrativeState.timeOfDay}\n`;
            if (narrativeState.location) guidance += `場所: ${narrativeState.location}\n`;
            if (narrativeState.weather) guidance += `天候: ${narrativeState.weather}\n`;
        }

        return guidance;
    }
}