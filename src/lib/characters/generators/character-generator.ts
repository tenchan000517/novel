/**
 * @fileoverview キャラクター生成器 - 新記憶階層システム対応版
 * @description
 * 統合記憶階層システムに最適化されたキャラクター生成コンポーネント。
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
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { MemoryLevel, MemoryRequestType } from '@/lib/memory/core/types';

/**
 * キャラクター生成結果（内部統計用）
 */
interface CharacterGenerationResult {
    success: boolean;
    character: DynamicCharacter;
    processingTime: number;
    memoryIntegrationSuccess: boolean;
    worldContextUsed: boolean;
    relationshipsGenerated: number;
    errors: string[];
    metadata: {
        templateUsed: string;
        aiGenerationAttempts: number;
        cacheHits: number;
        generationQuality: number;
    };
}

/**
 * 世界設定データ
 */
interface WorldSettingsData {
    description?: string;
    genre?: string;
    regions?: any[];
    history?: any[];
    rules?: any[];
}

/**
 * キャラクター生成統計
 */
interface GenerationStatistics {
    totalGenerations: number;
    successfulGenerations: number;
    failedGenerations: number;
    averageProcessingTime: number;
    memoryIntegrationSuccessRate: number;
    averageRelationshipsPerCharacter: number;
    lastGenerationTime: string;
}

/**
 * キャラクター生成クラス
 * 統合記憶階層システムに最適化されたテンプレートベースのキャラクター生成を担当
 */
export class CharacterGenerator implements ICharacterGenerator {
    private geminiClient: GeminiClient;
    private readonly RETRY_COUNT = 3;
    private readonly RETRY_DELAY = 1000; // 1秒
    
    // 内部統計情報
    private lastResult: CharacterGenerationResult | null = null;
    private statistics: GenerationStatistics = {
        totalGenerations: 0,
        successfulGenerations: 0,
        failedGenerations: 0,
        averageProcessingTime: 0,
        memoryIntegrationSuccessRate: 0,
        averageRelationshipsPerCharacter: 0,
        lastGenerationTime: ''
    };

    /**
     * コンストラクタ
     * @param templateProvider テンプレートプロバイダー
     * @param memoryManager 統合記憶マネージャー
     * @param geminiClient Gemini APIクライアント（オプション）
     */
    constructor(
        private templateProvider: ITemplateProvider,
        private memoryManager: MemoryManager,
        geminiClient?: GeminiClient
    ) {
        this.geminiClient = geminiClient || new GeminiClient();
        logger.info('CharacterGenerator: 統合記憶階層システム対応版で初期化完了');
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
        const startTime = Date.now();
        this.statistics.totalGenerations++;

        try {
            logger.info('キャラクターをテンプレートから生成します（統合記憶システム使用）', {
                templateId: template.id,
                integrationPoint: params.integrationPoint
            });

            // ベースキャラクターの生成
            const character: DynamicCharacter = {
                id: generateId(),
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

            // 統合記憶システムを使用した詳細強化
            const worldContextUsed = await this.enhanceCharacterDetailsWithMemorySystem(character, template, params);

            // 生成統計の記録
            const processingTime = Date.now() - startTime;
            this.lastResult = {
                success: true,
                character,
                processingTime,
                memoryIntegrationSuccess: worldContextUsed,
                worldContextUsed,
                relationshipsGenerated: character.relationships?.length ?? 0,
                errors: [],
                metadata: {
                    templateUsed: template.id,
                    aiGenerationAttempts: 1,
                    cacheHits: 0,
                    generationQuality: this.calculateGenerationQuality(character)
                }
            };

            this.updateStatistics(this.lastResult);

            logger.info(`キャラクター「${character.name}」を生成しました (ID: ${character.id})`, {
                processingTime,
                worldContextUsed,
                relationshipsCount: character.relationships?.length ?? 0
            });

            return character;

        } catch (error) {
            const processingTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);
            
            this.statistics.failedGenerations++;
            this.lastResult = {
                success: false,
                character: {} as DynamicCharacter,
                processingTime,
                memoryIntegrationSuccess: false,
                worldContextUsed: false,
                relationshipsGenerated: 0,
                errors: [errorMessage],
                metadata: {
                    templateUsed: template.id,
                    aiGenerationAttempts: 0,
                    cacheHits: 0,
                    generationQuality: 0
                }
            };

            logger.error('テンプレートからのキャラクター生成に失敗しました', {
                templateId: template.id,
                error: errorMessage,
                processingTime
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
            logger.info(`キャラクター「${character.name}」のバックストーリーを生成します（統合記憶システム使用）`);

            // 統一アクセスAPIを使用して世界設定を取得
            const worldSettingsResult = await this.memoryManager.unifiedSearch(
                'world settings context',
                [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM]
            );

            let worldSettings: WorldSettingsData = {};

            if (worldSettingsResult.success && worldSettingsResult.results.length > 0) {
                // 結果から世界設定データを抽出
                for (const result of worldSettingsResult.results) {
                    if (result.type === 'knowledge' && result.data) {
                        worldSettings = result.data;
                        break;
                    }
                }
            }

            // フォールバック: worldContextまたはデフォルト値を使用
            const worldDescription = worldSettings.description || 
                                   (typeof worldContext === 'string' ? worldContext : 'ファンタジー世界');

            // プロンプト作成
            const prompt = `
あなたはファンタジー小説のキャラクターの背景設定を作成する専門家です。
以下の情報に基づいて、キャラクター「${character.name}」のバックストーリーを作成してください。
本文は250～300単語程度でまとめてください。

## 世界観
${worldDescription}

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
     * 最後の生成結果を取得（詳細統計用）
     */
    getLastGenerationResult(): CharacterGenerationResult | null {
        return this.lastResult;
    }

    /**
     * 生成統計情報を取得
     */
    getGenerationStatistics(): GenerationStatistics {
        return { ...this.statistics };
    }

    /**
     * 統計をリセット
     */
    resetStatistics(): void {
        this.statistics = {
            totalGenerations: 0,
            successfulGenerations: 0,
            failedGenerations: 0,
            averageProcessingTime: 0,
            memoryIntegrationSuccessRate: 0,
            averageRelationshipsPerCharacter: 0,
            lastGenerationTime: ''
        };
        this.lastResult = null;
    }

    // ============================================================================
    // Private Methods
    // ============================================================================

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
            // 統一アクセスAPIを使用して世界設定を取得
            const worldSettingsResult = await this.memoryManager.unifiedSearch(
                'world settings naming context',
                [MemoryLevel.LONG_TERM]
            );

            let worldDescription = 'ファンタジー世界';

            if (worldSettingsResult.success && worldSettingsResult.results.length > 0) {
                const worldData = worldSettingsResult.results.find(r => r.type === 'knowledge')?.data;
                if (worldData && typeof worldData === 'object' && worldData.description) {
                    worldDescription = worldData.description;
                }
            }

            // プロンプト作成
            const prompt = `
あなたはファンタジー小説のキャラクター名を生成する専門家です。
以下の情報に基づいて、一つのキャラクター名を生成してください。

## 世界観
${worldDescription}

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
     * 統合記憶システムを使用してキャラクター詳細を強化する
     * @private
     * @param character 強化するキャラクター
     * @param template 使用するテンプレート
     * @param params カスタマイズパラメータ
     * @returns 世界コンテキストが使用されたかどうか
     */
    private async enhanceCharacterDetailsWithMemorySystem(
        character: DynamicCharacter,
        template: CharacterTemplate,
        params: any
    ): Promise<boolean> {
        let worldContextUsed = false;

        try {
            // カスタムパラメータの適用
            if (params.type) {
                character.type = params.type;
            } else if (template.suggestedType) {
                character.type = template.suggestedType;
            }

            // 必須特性の確保
            if (!character.personality) {
                character.personality = {
                    traits: [],
                    values: [],
                    quirks: [],
                    speechPatterns: []
                };
            }

            if (params.mustHave && Array.isArray(params.mustHave)) {
                for (const trait of params.mustHave) {
                    if (!character.personality.traits.includes(trait)) {
                        character.personality.traits.push(trait);
                    }
                }
            }

            // バックストーリーの生成（統合記憶システム使用）
            if (params.storyContext) {
                if (!character.backstory) {
                    character.backstory = {
                        summary: '',
                        significantEvents: [],
                        origin: ''
                    };
                }
                character.backstory.summary = await this.generateBackstory(character, params.storyContext);
                worldContextUsed = true;
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

            // メタデータにタグを追加
            if (!character.metadata) {
                character.metadata = {
                    createdAt: new Date(),
                    lastUpdated: new Date(),
                    version: 1,
                    tags: []
                };
            }
            if (!character.metadata.tags) {
                character.metadata.tags = [];
            }
            character.metadata.tags.push('generated');

            // 開発状況の初期化
            if (!character.state.development) {
                character.state.development = `${character.name}の基本的な発展状況`;
            }

            return worldContextUsed;

        } catch (error) {
            logger.warn('キャラクター詳細強化中にエラーが発生しました', {
                error: error instanceof Error ? error.message : String(error)
            });
            return worldContextUsed;
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

    /**
     * 生成品質を計算する
     * @private
     * @param character 生成されたキャラクター
     * @returns 品質スコア（0-1）
     */
    private calculateGenerationQuality(character: DynamicCharacter): number {
        let score = 0;
        let maxScore = 0;

        // 名前の品質
        maxScore += 1;
        if (character.name && character.name.length > 2) {
            score += 1;
        }

        // 性格特性の充実度
        maxScore += 1;
        if (character.personality?.traits && character.personality.traits.length >= 2) {
            score += 1;
        }

        // バックストーリーの存在
        maxScore += 1;
        if (character.backstory?.summary && character.backstory.summary.length > 50) {
            score += 1;
        }

        // 関係性の数
        maxScore += 1;
        if (character.relationships && character.relationships.length > 0) {
            score += 1;
        }

        // 短縮名の生成
        maxScore += 1;
        if (character.shortNames && character.shortNames.length > 0) {
            score += 1;
        }

        return maxScore > 0 ? score / maxScore : 0;
    }

    /**
     * 統計情報を更新する
     * @private
     * @param result 生成結果
     */
    private updateStatistics(result: CharacterGenerationResult): void {
        if (result.success) {
            this.statistics.successfulGenerations++;
            
            // 平均処理時間の更新
            this.statistics.averageProcessingTime = 
                ((this.statistics.averageProcessingTime * (this.statistics.successfulGenerations - 1)) + result.processingTime) / 
                this.statistics.successfulGenerations;

            // メモリ統合成功率の更新
            const totalSuccessful = this.statistics.successfulGenerations;
            const memorySuccessCount = this.statistics.memoryIntegrationSuccessRate * (totalSuccessful - 1) + 
                                    (result.memoryIntegrationSuccess ? 1 : 0);
            this.statistics.memoryIntegrationSuccessRate = memorySuccessCount / totalSuccessful;

            // 平均関係性数の更新
            const totalRelationships = this.statistics.averageRelationshipsPerCharacter * (totalSuccessful - 1) + 
                                     result.relationshipsGenerated;
            this.statistics.averageRelationshipsPerCharacter = totalRelationships / totalSuccessful;
        }

        this.statistics.lastGenerationTime = new Date().toISOString();
    }
}