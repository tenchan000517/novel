/**
 * @fileoverview キャラクター分析サービス拡張版
 * @description
 * ChapterGeneratorから移管されたキャラクター成長分析機能を統合し、
 * 既存のキャラクター分析機能を拡張します。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiAdapter } from '@/lib/analysis/adapters/gemini-adapter';
import { JsonParser } from '@/lib/utils/json-parser';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { characterManager } from '@/lib/characters/manager';

import {
    GenerationContext,
    CharacterAppearance
} from '@/types/generation';
import { CharacterPsychology } from '@/types/characters';

/**
 * @interface CharacterGrowthAnalysis
 * @description キャラクター成長分析結果
 */
export interface CharacterGrowthAnalysis {
    updatedCharacters: Array<{
        id: string;
        name: string;
        growthPhase?: string | null;
        parameterChanges?: Array<{ name: string; change: number }>;
        skillAcquisitions?: Array<{ name: string }>;
    }>;
    growthSummary: {
        totalCharactersAnalyzed: number;
        charactersWithGrowth: number;
        majorGrowthEvents: string[];
    };
}

/**
 * @interface CharacterAnalysisResult
 * @description 総合キャラクター分析結果
 */
export interface CharacterAnalysisResult {
    characterAppearances: CharacterAppearance[];
    characterPsychologies: CharacterPsychology[];
    characterGrowth: CharacterGrowthAnalysis;
    relationshipDynamics: Array<{
        character1: string;
        character2: string;
        relationshipType: string;
        strength: number;
        development: string;
    }>;
}

/**
 * @class CharacterAnalysisService
 * @description キャラクター分析サービス拡張版
 * 
 * @role
 * - キャラクターの総合分析
 * - キャラクター成長の追跡・分析
 * - キャラクター心理の深層分析
 * - キャラクター関係性の分析
 */
export class CharacterAnalysisService {
    /** 分析結果キャッシュストア */
    private cacheStore: Map<string, any> = new Map();

    /**
     * コンストラクタ
     * 
     * @param {GeminiAdapter} geminiAdapter AI生成・分析用アダプター
     */
    constructor(private geminiAdapter: GeminiAdapter) {
        logger.info('CharacterAnalysisService initialized with extended capabilities');
    }

    /**
     * キャラクター総合分析
     * 
     * 章の内容からキャラクターの総合的な分析を行います。
     * 
     * @param {string} content 章の内容
     * @param {number} chapterNumber 章番号
     * @param {GenerationContext} context 生成コンテキスト
     * @returns {Promise<CharacterAnalysisResult>} キャラクター分析結果
     */
    async analyzeCharacter(
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<CharacterAnalysisResult> {
        const cacheKey = `character-analysis-${chapterNumber}-${content.length}`;
        if (this.cacheStore.has(cacheKey)) {
            logger.debug(`Using cached character analysis for chapter ${chapterNumber}`);
            return this.cacheStore.get(cacheKey)!;
        }

        try {
            logger.info(`Starting comprehensive character analysis for chapter ${chapterNumber}`);

            // 並列でキャラクター分析を実行
            const [
                characterAppearances,
                characterPsychologies,
                characterGrowth,
                relationshipDynamics
            ] = await Promise.allSettled([
                this.analyzeCharacterAppearances(content, chapterNumber, context),
                this.analyzeCharacterPsychologies(content, chapterNumber, context),
                this.analyzeCharacterGrowth(content, chapterNumber, context),
                this.analyzeRelationshipDynamics(content, chapterNumber, context)
            ]);

            const result: CharacterAnalysisResult = {
                characterAppearances: this.extractResult(characterAppearances, []),
                characterPsychologies: this.extractResult(characterPsychologies, []),
                characterGrowth: this.extractResult(characterGrowth, {
                    updatedCharacters: [],
                    growthSummary: {
                        totalCharactersAnalyzed: 0,
                        charactersWithGrowth: 0,
                        majorGrowthEvents: []
                    }
                }),
                relationshipDynamics: this.extractResult(relationshipDynamics, [])
            };

            // キャッシュに保存
            this.cacheStore.set(cacheKey, result);

            logger.info(`Character analysis completed for chapter ${chapterNumber}`, {
                characterCount: result.characterAppearances.length,
                psychologyCount: result.characterPsychologies.length,
                growthCount: result.characterGrowth.updatedCharacters.length,
                relationshipCount: result.relationshipDynamics.length
            });

            return result;
        } catch (error) {
            logger.error(`Character analysis failed for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            return this.createFallbackCharacterAnalysis(context);
        }
    }

    /**
     * キャラクター成長分析（ChapterGeneratorから移管）
     * 
     * 章の内容からキャラクターの成長を分析します。
     * 
     * @param {string} content 章の内容
     * @param {number} chapterNumber 章番号
     * @param {GenerationContext} context 生成コンテキスト
     * @returns {Promise<CharacterGrowthAnalysis>} キャラクター成長分析結果
     */
    async analyzeCharacterGrowth(
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<CharacterGrowthAnalysis> {
        try {
            logger.info(`Analyzing character growth for chapter ${chapterNumber}`);

            // CharacterManagerを使用して全キャラクターの成長を処理
            const growthResult = await characterManager.processAllCharacterGrowth(
                chapterNumber,
                content
            );

            // 成長イベントを分析
            const majorGrowthEvents = await this.identifyMajorGrowthEvents(content, growthResult.updatedCharacters);

            const growthAnalysis: CharacterGrowthAnalysis = {
                updatedCharacters: growthResult.updatedCharacters,
                growthSummary: {
                    totalCharactersAnalyzed: context.characters?.length || 0,
                    charactersWithGrowth: growthResult.updatedCharacters.length,
                    majorGrowthEvents
                }
            };

            logger.info(`Character growth analysis completed for chapter ${chapterNumber}`, {
                totalAnalyzed: growthAnalysis.growthSummary.totalCharactersAnalyzed,
                withGrowth: growthAnalysis.growthSummary.charactersWithGrowth,
                majorEvents: majorGrowthEvents.length
            });

            return growthAnalysis;
        } catch (error) {
            logger.error('Failed to analyze character growth', {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            return {
                updatedCharacters: [],
                growthSummary: {
                    totalCharactersAnalyzed: 0,
                    charactersWithGrowth: 0,
                    majorGrowthEvents: []
                }
            };
        }
    }

    /**
     * キャラクター登場分析
     * 
     * @private
     * @param {string} content 章の内容
     * @param {number} chapterNumber 章番号
     * @param {GenerationContext} context 生成コンテキスト
     * @returns {Promise<CharacterAppearance[]>} キャラクター登場情報
     */
    private async analyzeCharacterAppearances(
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<CharacterAppearance[]> {
        try {
            const prompt = `
以下の小説の章に登場するキャラクターとその活動を詳細に分析してください：

${content.substring(0, 8000)}

各キャラクターについて以下の情報を含めてJSONで出力してください：
- characterName: キャラクター名
- dialogueCount: 対話の回数（概算）
- significance: この章での重要度（0〜1の値）
- actions: 主な行動（配列形式）
- emotions: 表現された感情（配列形式）
- scenes: 登場したシーン（配列形式）

JSON形式:
[
  {
    "characterName": "キャラクター名",
    "dialogueCount": 10,
    "significance": 0.8,
    "actions": ["行動1", "行動2"],
    "emotions": ["感情1", "感情2"],
    "scenes": ["シーン1", "シーン2"]
  }
]`;

            const response = await apiThrottler.throttledRequest(() =>
                this.geminiAdapter.generateText(prompt, {
                    temperature: 0.2,
                    purpose: 'analysis',
                    responseFormat: 'json'
                })
            );

            const parsedCharacters = JsonParser.parseFromAIResponse<any[]>(response, []);

            return this.formatCharacterAppearances(parsedCharacters, context);
        } catch (error) {
            logger.error('Failed to analyze character appearances', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * キャラクター心理分析
     * 
     * @private
     * @param {string} content 章の内容
     * @param {number} chapterNumber 章番号
     * @param {GenerationContext} context 生成コンテキスト
     * @returns {Promise<CharacterPsychology[]>} キャラクター心理分析結果
     */
    private async analyzeCharacterPsychologies(
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<CharacterPsychology[]> {
        try {
            const prompt = `
以下の小説の章から、登場キャラクターの心理状態を詳細に分析してください：

${content.substring(0, 8000)}

各キャラクターの心理状態について以下の情報を含めてJSONで出力してください：
- characterName: キャラクター名
- emotionalState: 感情状態
- motivations: 動機（配列形式）
- conflicts: 内的葛藤（配列形式）
- growthPoints: 成長ポイント（配列形式）
- psychologicalProfile: 心理プロファイル

JSON形式:
[
  {
    "characterName": "キャラクター名",
    "emotionalState": "感情状態の説明",
    "motivations": ["動機1", "動機2"],
    "conflicts": ["葛藤1", "葛藤2"],
    "growthPoints": ["成長ポイント1", "成長ポイント2"],
    "psychologicalProfile": "心理プロファイルの説明"
  }
]`;

            const response = await apiThrottler.throttledRequest(() =>
                this.geminiAdapter.generateText(prompt, {
                    temperature: 0.3,
                    purpose: 'analysis',
                    responseFormat: 'json'
                })
            );

            const parsedPsychologies = JsonParser.parseFromAIResponse<any[]>(response, []);

            return this.formatCharacterPsychologies(parsedPsychologies);
        } catch (error) {
            logger.error('Failed to analyze character psychologies', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * キャラクター関係性分析
     * 
     * @private
     * @param {string} content 章の内容
     * @param {number} chapterNumber 章番号
     * @param {GenerationContext} context 生成コンテキスト
     * @returns {Promise<Array>} キャラクター関係性分析結果
     */
    private async analyzeRelationshipDynamics(
        content: string,
        chapterNumber: number,
        context: GenerationContext
    ): Promise<Array<{
        character1: string;
        character2: string;
        relationshipType: string;
        strength: number;
        development: string;
    }>> {
        try {
            const prompt = `
以下の小説の章から、キャラクター間の関係性とその変化を分析してください：

${content.substring(0, 8000)}

キャラクター間の関係について以下の情報を含めてJSONで出力してください：
- character1: 1人目のキャラクター名
- character2: 2人目のキャラクター名
- relationshipType: 関係の種類（友情、恋愛、対立、師弟など）
- strength: 関係の強さ（0〜1の値）
- development: この章での関係の発展

JSON形式:
[
  {
    "character1": "キャラクター1",
    "character2": "キャラクター2",
    "relationshipType": "友情",
    "strength": 0.8,
    "development": "関係の発展についての説明"
  }
]`;

            const response = await apiThrottler.throttledRequest(() =>
                this.geminiAdapter.generateText(prompt, {
                    temperature: 0.3,
                    purpose: 'analysis',
                    responseFormat: 'json'
                })
            );

            const parsedRelationships = JsonParser.parseFromAIResponse<any[]>(response, []);

            return this.formatRelationshipDynamics(parsedRelationships);
        } catch (error) {
            logger.error('Failed to analyze relationship dynamics', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * 主要な成長イベントを特定
     * 
     * @private
     * @param {string} content 章の内容
     * @param {Array} updatedCharacters 更新されたキャラクター
     * @returns {Promise<string[]>} 主要な成長イベント
     */
    private async identifyMajorGrowthEvents(
        content: string,
        updatedCharacters: Array<any>
    ): Promise<string[]> {
        try {
            if (updatedCharacters.length === 0) {
                return [];
            }

            const characterNames = updatedCharacters.map(char => char.name).join('、');

            const prompt = `
以下の小説の章で、キャラクター「${characterNames}」に起きた重要な成長イベントを特定してください：

${content.substring(0, 6000)}

重要な成長イベント（技能習得、性格変化、価値観変化、重要な決断など）を配列形式で出力してください：

["成長イベント1", "成長イベント2", "成長イベント3"]`;

            const response = await apiThrottler.throttledRequest(() =>
                this.geminiAdapter.generateText(prompt, {
                    temperature: 0.2,
                    purpose: 'analysis',
                    responseFormat: 'json'
                })
            );

            return JsonParser.parseFromAIResponse<string[]>(response, []);
        } catch (error) {
            logger.warn('Failed to identify major growth events', {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }

    /**
     * キャラクター改善提案の生成
     * 
     * @param {CharacterAnalysisResult} analysis キャラクター分析結果
     * @returns {Promise<string[]>} 改善提案
     */
    async generateCharacterImprovements(analysis: CharacterAnalysisResult): Promise<string[]> {
        try {
            const improvements: string[] = [];

            // キャラクター登場バランスの評価
            const significantCharacters = analysis.characterAppearances.filter(char => char.significance > 0.5);
            if (significantCharacters.length < 2) {
                improvements.push('主要キャラクターの登場バランスを改善し、より多くのキャラクターを活用してください');
            }

            // キャラクター成長の評価
            if (analysis.characterGrowth.growthSummary.charactersWithGrowth === 0) {
                improvements.push('キャラクターの成長要素を追加し、物語を通じた変化を描いてください');
            }

            // 関係性の深化評価
            const strongRelationships = analysis.relationshipDynamics.filter(rel => rel.strength > 0.7);
            if (strongRelationships.length < 1) {
                improvements.push('キャラクター間の関係性をより深く描写し、感情的な結びつきを強化してください');
            }

            // 心理描写の評価
            const detailedPsychologies = analysis.characterPsychologies.filter(psych =>
                psych.internalConflicts && psych.internalConflicts.length > 0
            );
            if (detailedPsychologies.length < analysis.characterPsychologies.length * 0.5) {
                improvements.push('キャラクターの内面描写を充実させ、心理的な複雑さを表現してください');
            }

            return improvements;
        } catch (error) {
            logger.error('Failed to generate character improvements', {
                error: error instanceof Error ? error.message : String(error)
            });
            return ['キャラクター分析に基づく改善提案の生成でエラーが発生しました'];
        }
    }

    /**
     * キャッシュクリア
     */
    clearCache(): void {
        this.cacheStore.clear();
        logger.info('CharacterAnalysisService cache cleared');
    }

    // =========================================================================
    // プライベートヘルパーメソッド
    // =========================================================================

    /**
     * Promise.allSettledの結果から値を抽出
     */
    private extractResult<T>(result: PromiseSettledResult<T>, fallback: T): T {
        if (result.status === 'fulfilled') {
            return result.value;
        } else {
            logger.warn('Character analysis component failed, using fallback', {
                reason: result.reason
            });
            return fallback;
        }
    }

    /**
     * キャラクター登場情報のフォーマット
     */
    private formatCharacterAppearances(
        appearances: any[],
        context: GenerationContext
    ): CharacterAppearance[] {
        if (!appearances || !Array.isArray(appearances)) {
            return this.createFallbackCharacterAppearances(context);
        }

        return appearances.map(appearance => ({
            characterId: appearance.characterId || `char-${appearance.characterName?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}`,
            characterName: appearance.characterName || 'Unknown Character',
            scenes: Array.isArray(appearance.scenes) ? appearance.scenes : [],
            dialogueCount: typeof appearance.dialogueCount === 'number' ? appearance.dialogueCount : 0,
            significance: typeof appearance.significance === 'number' ?
                Math.max(0, Math.min(1, appearance.significance)) : 0.5,
            actions: Array.isArray(appearance.actions) ? appearance.actions : [],
            emotions: Array.isArray(appearance.emotions) ? appearance.emotions : []
        }));
    }

    /**
     * キャラクター心理分析結果のフォーマット
     */
    private formatCharacterPsychologies(psychologies: any[]): CharacterPsychology[] {
        if (!Array.isArray(psychologies)) return [];

        return psychologies.map((psych) => ({
            currentDesires: Array.isArray(psych.currentDesires) ? psych.currentDesires : [],
            currentFears: Array.isArray(psych.currentFears) ? psych.currentFears : [],
            internalConflicts: Array.isArray(psych.internalConflicts)
                ? psych.internalConflicts
                : (psych.conflicts || []), // ← 古い構造にも一応対応
            emotionalState: typeof psych.emotionalState === 'object' && psych.emotionalState !== null
                ? psych.emotionalState
                : {},
            relationshipAttitudes:
                typeof psych.relationshipAttitudes === 'object' && psych.relationshipAttitudes !== null
                    ? psych.relationshipAttitudes
                    : {},
        }));
    }

    /**
     * キャラクター関係性分析結果のフォーマット
     */
    private formatRelationshipDynamics(relationships: any[]): Array<{
        character1: string;
        character2: string;
        relationshipType: string;
        strength: number;
        development: string;
    }> {
        if (!relationships || !Array.isArray(relationships)) {
            return [];
        }

        return relationships.map(rel => ({
            character1: rel.character1 || 'Unknown Character 1',
            character2: rel.character2 || 'Unknown Character 2',
            relationshipType: rel.relationshipType || 'unknown',
            strength: typeof rel.strength === 'number' ?
                Math.max(0, Math.min(1, rel.strength)) : 0.5,
            development: rel.development || ''
        }));
    }

    /**
     * フォールバックキャラクター登場情報の作成
     */
    private createFallbackCharacterAppearances(context: GenerationContext): CharacterAppearance[] {
        return (context.characters || [])
            .slice(0, 5)
            .map((char: any, index: number) => ({
                characterId: `char-${char.name?.replace(/\s+/g, '-').toLowerCase() || `unknown-${index}`}`,
                characterName: char.name || `Character ${index + 1}`,
                scenes: [],
                dialogueCount: 5,
                significance: 0.8 - (index * 0.1),
                actions: [],
                emotions: []
            }));
    }

    /**
     * フォールバックキャラクター分析結果の作成
     */
    private createFallbackCharacterAnalysis(context: GenerationContext): CharacterAnalysisResult {
        return {
            characterAppearances: this.createFallbackCharacterAppearances(context),
            characterPsychologies: [],
            characterGrowth: {
                updatedCharacters: [],
                growthSummary: {
                    totalCharactersAnalyzed: 0,
                    charactersWithGrowth: 0,
                    majorGrowthEvents: []
                }
            },
            relationshipDynamics: []
        };
    }
}

// シングルトンインスタンスをエクスポート
export const characterAnalysisService = new CharacterAnalysisService(new GeminiAdapter());