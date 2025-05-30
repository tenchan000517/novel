/**
 * @fileoverview キャラクター生成器
 * @description
 * キャラクターの動的生成を担当するコンポーネント。
 * テンプレートからのキャラクター生成、バックストーリー生成、
 * 関係性生成などの機能を提供します。
 */
import {
    ICharacterGenerator,
    ITemplateProvider
} from '../core/interfaces';
import {
    Character,
    CharacterTemplate,
    DynamicCharacter,
    Relationship
} from '../core/types';
import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { generateId } from '@/lib/utils/helpers';
import { memoryManager } from '@/lib/memory/manager';

/**
 * キャラクター生成クラス
 * テンプレートベースのキャラクター生成を担当
 */
export class CharacterGenerator implements ICharacterGenerator {
    private geminiClient: GeminiClient;
    private readonly RETRY_COUNT = 3;
    private readonly RETRY_DELAY = 1000; // 1秒

    /**
     * コンストラクタ
     * @param templateProvider テンプレートプロバイダー
     * @param geminiClient Gemini APIクライアント（オプション）
     */
    constructor(
        private templateProvider: ITemplateProvider,
        geminiClient?: GeminiClient
    ) {
        this.geminiClient = geminiClient || new GeminiClient();
        logger.info('CharacterGenerator: 初期化完了');
    }

    /**
     * テンプレートからキャラクターを生成する
     * @param template キャラクターテンプレート
     * @param params カスタマイズパラメータ
     * @returns 生成されたキャラクター
     */
    async generateFromTemplate(
        template: CharacterTemplate,
        params: any
    ): Promise<DynamicCharacter> {
        try {
            logger.info('キャラクターをテンプレートから生成します', {
                templateId: template.id,
                integrationPoint: params.integrationPoint
            });

            // ベースキャラクターの生成
            const character: DynamicCharacter = {
                id: generateId(), // プレフィックスなしでデフォルト長さのIDを使用
                name: await this.generateCharacterName(template, params),
                shortNames: [],
                nicknames: {},
                type: params.type || template.suggestedType || 'MOB',
                description: template.description || 'A character',
                personality: {
                    traits: [...(template.personality?.traits || [])],
                    values: [...(template.personality?.values || [])],
                    quirks: [...(template.personality?.quirks || [])],
                    speechPatterns: []
                },
                backstory: {
                    summary: '',
                    significantEvents: [...(template.backstory?.significantEvents || [])],
                    origin: template.backstory?.origin || ''
                },
                state: {
                    isActive: true,
                    emotionalState: template.roleSettings?.preferredEmotionalState || 'NEUTRAL',
                    developmentStage: template.roleSettings?.initialDevelopmentStage || 0,
                    lastAppearance: params.integrationPoint || null,
                    development: ''
                },
                history: {
                    appearances: [],
                    developmentPath: [],
                    interactions: []
                },
                metadata: {
                    createdAt: new Date(),
                    lastUpdated: new Date(),
                    version: 1,
                    tags: params.tags || []
                },
                relationships: [],
                generationMetadata: {
                    template: template.id,
                    generatedAt: new Date(),
                    parameters: { ...params }
                }
            };

            // キャラクター詳細の強化
            await this.enhanceCharacterDetails(character, template, params);

            logger.info(`キャラクター「${character.name}」を生成しました (ID: ${character.id})`);
            return character;
        } catch (error) {
            logger.error('テンプレートからのキャラクター生成に失敗しました', {
                templateId: template.id,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * バックストーリーを生成する
     * @param character 動的に生成されたキャラクター
     * @param worldContext 世界観コンテキスト
     * @returns 生成されたバックストーリー
     */
    async generateBackstory(character: DynamicCharacter, worldContext: any): Promise<string> {
        try {
            logger.info(`キャラクター「${character.name}」のバックストーリーを生成します`);

            // 世界観情報の取得
            const longTermMemory = await memoryManager.getLongTermMemory();
            const worldSettings = await longTermMemory.getWorldSettings();

            // プロンプト作成
            const prompt = `
  あなたはファンタジー小説のキャラクターの背景設定を作成する専門家です。
  以下の情報に基づいて、キャラクター「${character.name}」のバックストーリーを作成してください。
  本文は250～300単語程度でまとめてください。
  
  ## 世界観
  ${worldSettings?.description || worldContext || 'ファンタジー世界'}
  
  ## キャラクター情報
  名前: ${character.name}
  タイプ: ${character.type}
  説明: ${character.description}
  性格特性: ${character.personality?.traits?.join(', ') || ''}
  価値観: ${character.personality?.values?.join(', ') || ''}
  癖: ${character.personality?.quirks?.join(', ') || ''}
  出身: ${character.backstory?.origin || ''}
  
  ## 重要な出来事
  ${character.backstory?.significantEvents?.map(event => `- ${event}`).join('\n') || '- (重要な出来事は特になし)'}
  
  ## 現在の統合ポイント
  物語内のチャプター${character.state.lastAppearance || '?'}で初登場予定
  
  ## 出力形式
  [バックストーリー本文]
  `;

            // リトライロジックを使用してAI生成
            const backstory = await this.retryGenerationRequest(
                () => this.geminiClient.generateText(prompt, {
                    temperature: 0.7,
                    targetLength: 1500
                }),
                'バックストーリー生成'
            );

            logger.info(`キャラクター「${character.name}」のバックストーリーを生成しました (${backstory.length}文字)`);
            return backstory.trim();
        } catch (error) {
            logger.error(`キャラクター「${character.name}」のバックストーリー生成に失敗しました`, {
                characterId: character.id,
                characterName: character.name,
                error: error instanceof Error ? error.message : String(error)
            });
            return `${character.name}は謎めいた過去を持つキャラクターです。`;
        }
    }

    /**
     * キャラクター間の関係性を生成する
     * @param character 動的に生成されたキャラクター
     * @param existingCharacters 既存のキャラクター配列
     * @returns 生成された関係性の配列
     */
    async createRelationships(
        character: DynamicCharacter,
        existingCharacters: Character[]
    ): Promise<Relationship[]> {
        // 関係を構築すべき既存キャラクターがいない場合は空配列を返す
        if (!existingCharacters || existingCharacters.length === 0) {
            return [];
        }

        try {
            logger.info(`キャラクター「${character.name}」の関係性を生成します (対象キャラクター数: ${existingCharacters.length})`);

            // 最大3つの関係性を生成（メインキャラクターを優先）
            const potentialRelations = existingCharacters
                .filter(c => c.id !== character.id)
                .sort((a, b) => {
                    // メインキャラを優先、次にサブキャラ
                    if (a.type === 'MAIN' && b.type !== 'MAIN') return -1;
                    if (a.type !== 'MAIN' && b.type === 'MAIN') return 1;
                    if (a.type === 'SUB' && b.type !== 'SUB') return -1;
                    if (a.type !== 'SUB' && b.type === 'SUB') return 1;
                    return 0;
                })
                .slice(0, 3);

            const relationships: Relationship[] = [];

            // 各キャラクターとの関係を生成
            for (const target of potentialRelations) {
                try {
                    const relationship = await this.generateSingleRelationship(character, target);
                    relationships.push(relationship);
                } catch (error) {
                    logger.warn(`${target.name}との関係性生成に失敗しました`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }

            logger.info(`キャラクター「${character.name}」の関係性を${relationships.length}件生成しました`);
            return relationships;
        } catch (error) {
            logger.error(`キャラクター「${character.name}」の関係性生成に失敗しました`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * キャラクター名を生成する
     * @private
     * @param template キャラクターテンプレート
     * @param params カスタマイズパラメータ
     * @returns 生成されたキャラクター名
     */
    private async generateCharacterName(template: CharacterTemplate, params: any): Promise<string> {
        if (params.name) return params.name;

        try {
            // 世界観情報の取得
            const longTermMemory = await memoryManager.getLongTermMemory();
            const worldSettings = await longTermMemory.getWorldSettings();

            // プロンプト作成
            const prompt = `
  あなたはファンタジー小説のキャラクター名を生成する専門家です。
  以下の情報に基づいて、一つのキャラクター名を生成してください。
  
  ## 世界観
  ${worldSettings?.description || 'ファンタジー世界'}
  
  ## キャラクタータイプ
  ${template.name || 'キャラクター'}
  
  ## 特性
  ${template.personality?.traits?.join(', ') || ''}
  
  名前だけを出力してください。
  `;

            const result = await this.geminiClient.generateText(prompt, {
                temperature: 0.7,
                targetLength: 50
            });

            // 余分な記号やスペースを削除
            return result.trim().replace(/["""]/g, '');
        } catch (error) {
            logger.warn('キャラクター名生成に失敗しました', {
                error: error instanceof Error ? error.message : String(error)
            });
            return `${template.name || 'Character'}_${Math.floor(Math.random() * 1000)}`;
        }
    }

    /**
     * キャラクター詳細を強化する
     * @private
     * @param character 強化するキャラクター
     * @param template 使用するテンプレート
     * @param params カスタマイズパラメータ
     */
    private async enhanceCharacterDetails(
        character: DynamicCharacter,
        template: CharacterTemplate,
        params: any
    ): Promise<void> {
        // カスタムパラメータの適用
        if (params.type) {
            character.type = params.type;
        } else if (template.suggestedType) {
            character.type = template.suggestedType;
        }

        // 必須特性の確保
        if (params.mustHave && Array.isArray(params.mustHave) && character.personality) {
            for (const trait of params.mustHave) {
                if (!character.personality.traits.includes(trait)) {
                    character.personality.traits.push(trait);
                }
            }
        }

        // バックストーリーの生成
        if (params.storyContext && character.backstory) {
            character.backstory.summary = await this.generateBackstory(character, params.storyContext);
        }

        // 短縮名の生成
        if (character.shortNames.length === 0) {
            character.shortNames = this.generateShortNames(character.name);
        }

        // ロールに基づく追加調整
        if (template.roleSettings) {
            if (template.roleSettings.preferredEmotionalState) {
                character.state.emotionalState = template.roleSettings.preferredEmotionalState;
            }

            if (template.roleSettings.initialDevelopmentStage !== undefined) {
                character.state.developmentStage = template.roleSettings.initialDevelopmentStage;
            }
        }
    }

    /**
     * 短縮名を生成する
     * @private
     * @param fullName フルネーム
     * @returns 短縮名の配列
     */
    private generateShortNames(fullName: string): string[] {
        const shortNames: string[] = [];

        // スペースで分割されている場合は各部分を追加
        const nameParts = fullName.split(/\s+/);
        if (nameParts.length > 1) {
            shortNames.push(...nameParts);
        }

        // 名前が長い場合（4文字以上）は先頭の2-3文字を追加
        if (fullName.length >= 4) {
            const shortVersion = fullName.substring(0, Math.min(3, Math.ceil(fullName.length / 2)));
            if (!shortNames.includes(shortVersion)) {
                shortNames.push(shortVersion);
            }
        }

        return [...new Set(shortNames)]; // 重複を除去
    }

    /**
     * 単一の関係性を生成する
     * @private
     * @param character 対象キャラクター
     * @param targetCharacter 関係を結ぶキャラクター
     * @returns 生成された関係性
     */
    private async generateSingleRelationship(
        character: DynamicCharacter,
        targetCharacter: Character
    ): Promise<Relationship> {
        try {
            // プロンプト作成
            const prompt = `
  あなたはファンタジー小説のキャラクター関係性を設計する専門家です。
  以下のキャラクターの情報に基づいて、最も自然で物語的に魅力的な関係性をJSON形式で出力してください。
  
  ## 新キャラクター
  名前: ${character.name}
  タイプ: ${character.type}
  説明: ${character.description}
  性格特性: ${character.personality?.traits?.join(', ') || ''}
  
  ## 既存キャラクター
  名前: ${targetCharacter.name}
  タイプ: ${targetCharacter.type}
  説明: ${targetCharacter.description}
  性格特性: ${targetCharacter.personality?.traits?.join(', ') || ''}
  
  次の関係タイプから最も適切なものを選んでください:
  FRIEND, ENEMY, RIVAL, MENTOR, STUDENT, PARENT, CHILD, LOVER, PROTECTOR, PROTECTED, COLLEAGUE, NEUTRAL
  
  JSONフォーマットで回答してください:
  {
    "type": "関係タイプ",
    "strength": 0から1の数値（関係の強さ）,
    "description": "関係の簡潔な説明"
  }
  `;

            const result = await this.geminiClient.generateText(prompt, {
                temperature: 0.7,
                targetLength: 200
            });

            // JSONを解析
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('関係性データのJSON形式が無効です');
            }

            const relationshipData = JSON.parse(jsonMatch[0]);

            // 関係性オブジェクトの構築
            return {
                targetId: targetCharacter.id,
                targetName: targetCharacter.name,
                type: relationshipData.type,
                strength: relationshipData.strength,
                description: relationshipData.description,
                history: []
            };
        } catch (error) {
            logger.warn(`キャラクター間の関係性生成に失敗しました: ${character.name} <-> ${targetCharacter.name}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // フォールバック関係性
            return {
                targetId: targetCharacter.id,
                targetName: targetCharacter.name,
                type: 'NEUTRAL',
                strength: 0.5,
                description: '未定義の関係',
                history: []
            };
        }
    }

    /**
     * リトライロジックを使用してAI生成リクエストを実行する
     * @private
     * @param requestFn リクエスト関数
     * @param operationName 操作名（ログ用）
     * @returns 生成結果
     */
    private async retryGenerationRequest(
        requestFn: () => Promise<string>,
        operationName: string
    ): Promise<string> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.RETRY_COUNT; attempt++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                logger.warn(`${operationName}の試行 ${attempt}/${this.RETRY_COUNT} が失敗しました`, {
                    error: lastError.message
                });

                if (attempt < this.RETRY_COUNT) {
                    // 指数バックオフ（1秒、2秒、4秒...）
                    const delay = this.RETRY_DELAY * Math.pow(2, attempt - 1);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        // すべての試行が失敗した場合
        throw lastError || new Error(`${operationName}に失敗しました`);
    }
}