/**
 * @fileoverview キャラクター深化サービス (最適化版・ファサードパターン対応)
 * @description
 * キャラクターの心理的深みと行動の一貫性を向上させる最適化提案に特化したサービス。
 * 新しいCharacterManagerファサードパターンと統合記憶階層システムに完全対応。
 * 分析機能は他のサービスに委譲し、純粋に深化推奨の生成と提供に集中します。
 */
import { Logger } from '@/lib/utils/logger';
import { 
    Character, 
    CharacterPsychology,
    StoryContext,
    TimingRecommendation,
    RelationshipResponse,
    RelationshipAnalysis
} from '@/lib/characters/core/types';

// ファサードのインポート（修正版）
import { CharacterManager } from '@/lib/characters/manager';
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { MemoryLevel } from '@/lib/memory/core/types';

import { apiThrottler } from '@/lib/utils/api-throttle';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { JsonParser } from '@/lib/utils/json-parser';
import { EVENT_TYPES } from '@/lib/characters/core/constants';

/**
 * 深化推奨の型定義
 */
export interface DepthRecommendation {
    /** 推奨のタイプ */
    type: 'consistency' | 'arc' | 'motivation' | 'relationship' | 'contrast' | 'genre';
    /** 推奨のタイトル */
    title: string;
    /** 推奨の詳細説明 */
    description: string;
    /** 実装方法 */
    implementation: string;
    /** 優先度（0-1） */
    priority: number;
}

/**
 * キャラクターアーク推奨の型定義
 */
export interface CharacterArcRecommendation {
    /** 推奨のタイトル */
    title: string;
    /** 推奨の詳細説明 */
    description: string;
    /** 実装提案 */
    suggestion: string;
    /** アークのフェーズ */
    arcPhase: 'introduction' | 'development' | 'transformation' | 'resolution';
    /** 重要度（0-1） */
    importance: number;
}

/**
 * 動機強化推奨の型定義
 */
export interface MotivationEnhancement {
    /** 推奨のタイトル */
    title: string;
    /** 推奨の詳細説明 */
    description: string;
    /** 実装方法 */
    implementation: string;
    /** 優先度（0-1） */
    priority: number;
}

/**
 * 関係性推奨の型定義
 */
export interface RelationshipDynamicRecommendation {
    /** 推奨のタイトル */
    title: string;
    /** 推奨の詳細説明 */
    description: string;
    /** 実装方法 */
    implementation: string;
    /** 優先度（0-1） */
    priority: number;
    /** 対象キャラクターID */
    targetCharacterId: string | null;
}

/**
 * コントラスト推奨の型定義
 */
export interface ContrastRecommendation {
    /** 推奨のタイトル */
    title: string;
    /** 推奨の詳細説明 */
    description: string;
    /** 実装方法 */
    implementation: string;
    /** 優先度（0-1） */
    priority: number;
}

/**
 * キャラクター深化プロンプトの型定義
 */
export interface CharacterDepthPrompt {
    /** キャラクターID */
    characterId: string;
    /** キャラクター名 */
    characterName: string;
    /** 焦点領域 */
    focusAreas: string;
    /** 実装提案 */
    implementationSuggestions: string;
    /** 心理的洞察 */
    psychologicalInsight: string;
}

/**
 * キャラクター分析結果の型定義（簡易版）
 */
interface CharacterAnalysisResult {
    characterAppearances: any[];
    characterPsychologies: any[];
    characterGrowth: {
        updatedCharacters: any[];
        growthSummary: {
            totalCharactersAnalyzed: number;
            charactersWithGrowth: number;
            majorGrowthEvents: string[];
        };
    };
    relationshipDynamics: any[];
}

/**
 * キャラクター深化サービスインターフェース
 */
export interface ICharacterDepthService {
    /**
     * キャラクター深化推奨の生成
     */
    generateDepthRecommendations(
        character: Character, 
        psychology: CharacterPsychology, 
        chapterNumber: number
    ): Promise<DepthRecommendation[]>;

    /**
     * 複数キャラクターの深化推奨生成
     */
    generateMultipleCharacterRecommendations(
        characters: Character[],
        chapterNumber: number,
        limit?: number
    ): Promise<{[characterId: string]: DepthRecommendation[]}>;

    /**
     * ジャンルに基づくキャラクター特性推奨
     */
    suggestGenreBasedTraits(
        character: Character,
        genre: string
    ): Promise<DepthRecommendation[]>;

    /**
     * チャプター生成用の深化プロンプト生成
     */
    generateDepthPromptForChapter(
        characterId: string,
        chapterNumber: number
    ): Promise<CharacterDepthPrompt | null>;

    /**
     * 章番号に最適なキャラクター深化対象の推奨
     */
    recommendFocusCharactersForChapter(
        chapterNumber: number,
        characterCount?: number
    ): Promise<string[]>;
}

/**
 * キャラクター深化サービス（ファサードパターン対応版）
 * 新しいCharacterManagerファサードパターンと統合記憶階層システムに完全対応
 */
export class CharacterDepthService implements ICharacterDepthService {
    private geminiClient: GeminiClient;
    private logger: Logger;
    
    // 推奨結果のキャッシュ
    private recommendationCache: Map<string, {
        recommendations: DepthRecommendation[];
        timestamp: number;
        chapter: number;
    }> = new Map();
    
    private readonly CACHE_TTL = 7200000; // 2時間キャッシュ有効
    
    /**
     * コンストラクタ（ファサードパターン対応・依存性注入）
     * @param characterManager キャラクターマネージャー（ファサード）
     * @param memoryManager 記憶階層システムマネージャー
     */
    constructor(
        private characterManager: CharacterManager,
        private memoryManager: MemoryManager
    ) {
        this.geminiClient = new GeminiClient();
        this.logger = new Logger({ serviceName: 'CharacterDepthService' });
        this.logger.info('CharacterDepthService: ファサードパターン対応版で初期化完了');
    }

    /**
     * キャラクター深化推奨の生成（ファサードパターン対応版）
     * 統合記憶階層システムとファサードメソッドを活用して総合的な深化推奨を生成
     * 
     * @param character キャラクター
     * @param psychology キャラクター心理情報
     * @param chapterNumber 章番号
     * @returns 深化推奨の配列
     */
    async generateDepthRecommendations(
        character: Character, 
        psychology: CharacterPsychology, 
        chapterNumber: number
    ): Promise<DepthRecommendation[]> {
        try {
            this.logger.info(`キャラクター「${character.name}」の深化推奨生成を開始`, {
                characterId: character.id,
                chapterNumber
            });
            
            // キャッシュチェック
            const cacheKey = `${character.id}_${chapterNumber}`;
            const cachedEntry = this.recommendationCache.get(cacheKey);
            if (cachedEntry && Date.now() - cachedEntry.timestamp < this.CACHE_TTL) {
                this.logger.debug(`キャラクター「${character.name}」: キャッシュ済み推奨を使用`);
                return cachedEntry.recommendations;
            }
            
            // ファサードパターン対応：基礎分析を実行
            const analysisResult = await this.performBasicAnalysisWithFacade(character, chapterNumber);
            
            // 各種推奨を並列生成
            const [
                consistencyRecommendations,
                arcRecommendations,
                motivationRecommendations,
                relationshipRecommendations,
                contrastRecommendations
            ] = await Promise.all([
                this.generateConsistencyRecommendations(character, analysisResult),
                this.generateArcOptimizationRecommendations(character, analysisResult, chapterNumber),
                this.generateMotivationEnhancements(character, psychology),
                this.generateRelationshipRecommendationsWithFacade(character, chapterNumber),
                this.generateContrastRecommendations(character, chapterNumber)
            ]);
            
            // 全推奨を統合
            const allRecommendations: DepthRecommendation[] = [
                ...this.formatConsistencyRecommendations(consistencyRecommendations),
                ...this.formatArcRecommendations(arcRecommendations),
                ...this.formatMotivationRecommendations(motivationRecommendations),
                ...this.formatRelationshipRecommendations(relationshipRecommendations),
                ...this.formatContrastRecommendations(contrastRecommendations)
            ];
            
            // 優先度順にソート
            const prioritizedRecommendations = this.prioritizeRecommendations(allRecommendations, character);
            
            // 結果をキャッシュに保存
            this.cacheRecommendations(cacheKey, prioritizedRecommendations, chapterNumber);
            
            // イベント発行
            this.publishRecommendationEvent(character, prioritizedRecommendations);
            
            this.logger.info(`キャラクター「${character.name}」の深化推奨生成完了`, {
                recommendationsCount: prioritizedRecommendations.length
            });
            
            return prioritizedRecommendations;
            
        } catch (error) {
            this.logger.error(`キャラクター「${character.name}」の深化推奨生成に失敗`, {
                characterId: character.id,
                error: error instanceof Error ? error.message : String(error)
            });
            
            return this.generateFallbackRecommendations(character, psychology);
        }
    }
    
    /**
     * 複数キャラクターの深化推奨生成（ファサードパターン対応版）
     * 効率的な並列処理でバッチ生成
     * 
     * @param characters キャラクター配列
     * @param chapterNumber 章番号
     * @param limit 各キャラクターの最大推奨数
     * @returns キャラクターIDごとの深化推奨
     */
    async generateMultipleCharacterRecommendations(
        characters: Character[],
        chapterNumber: number,
        limit: number = 3
    ): Promise<{[characterId: string]: DepthRecommendation[]}> {
        try {
            this.logger.info(`${characters.length}人のキャラクター深化推奨バッチ生成を開始`, {
                chapterNumber
            });
            
            const result: {[characterId: string]: DepthRecommendation[]} = {};
            
            // 並列処理でキャラクター心理情報を取得（ファサードパターン対応）
            const psychologyPromises = characters.map(async (character) => {
                try {
                    // ファサードパターン対応：統合記憶システムから心理情報を取得
                    const psychology = await this.getCharacterPsychologyFromMemorySystem(character.id, chapterNumber);
                    return { character, psychology };
                } catch (error) {
                    this.logger.warn(`心理情報取得失敗: ${character.name}`, { error });
                    return { character, psychology: null };
                }
            });
            
            const characterPsychologies = await Promise.all(psychologyPromises);
            
            // 推奨生成を並列実行
            const recommendationPromises = characterPsychologies.map(async ({ character, psychology }) => {
                if (!psychology) {
                    // フォールバック心理情報を生成
                    psychology = this.createFallbackPsychology(character);
                }
                
                try {
                    const recommendations = await this.generateDepthRecommendations(
                        character,
                        psychology,
                        chapterNumber
                    );
                    
                    return {
                        characterId: character.id,
                        recommendations: recommendations.slice(0, limit)
                    };
                } catch (error) {
                    this.logger.error(`推奨生成失敗: ${character.name}`, { error });
                    return { characterId: character.id, recommendations: [] };
                }
            });
            
            const results = await Promise.all(recommendationPromises);
            
            // 結果をマップに変換
            results.forEach(({ characterId, recommendations }) => {
                result[characterId] = recommendations;
            });
            
            this.logger.info(`バッチ生成完了: ${Object.keys(result).length}人のキャラクター処理済み`);
            return result;
            
        } catch (error) {
            this.logger.error('複数キャラクター推奨生成でエラー', { error });
            return {};
        }
    }
    
    /**
     * ジャンルに基づくキャラクター特性推奨
     * ジャンル期待値との比較による推奨生成
     * 
     * @param character キャラクター
     * @param genre ジャンル
     * @returns 深化推奨
     */
    async suggestGenreBasedTraits(
        character: Character,
        genre: string
    ): Promise<DepthRecommendation[]> {
        try {
            this.logger.debug(`ジャンル「${genre}」に基づく特性推奨: ${character.name}`);
            
            // ジャンル適合性分析プロンプトを構築
            const prompt = this.buildGenreAnalysisPrompt(character, genre);
            
            // AI分析を実行
            const response = await apiThrottler.throttledRequest(() => 
                this.geminiClient.generateText(prompt, {
                    temperature: 0.3,
                    targetLength: 800,
                    purpose: 'analysis',
                    responseFormat: 'json'
                })
            );
            
            // レスポンスを解析して推奨を生成
            const genreRecommendations = this.parseGenreRecommendationsResponse(response);
            
            return genreRecommendations.map(rec => ({
                type: 'genre',
                title: `${genre}ジャンル特性: ${rec.title}`,
                description: rec.description,
                implementation: rec.implementation,
                priority: rec.priority
            }));
            
        } catch (error) {
            this.logger.error(`ジャンル特性推奨生成エラー: ${character.name}`, { error, genre });
            return [];
        }
    }
    
    /**
     * チャプター生成用の深化プロンプト生成（ファサードパターン対応版）
     * 
     * @param characterId キャラクターID
     * @param chapterNumber 章番号
     * @returns 深化プロンプト
     */
    async generateDepthPromptForChapter(
        characterId: string,
        chapterNumber: number
    ): Promise<CharacterDepthPrompt | null> {
        try {
            // ファサードパターン対応：キャラクター情報を取得
            const character = await this.characterManager.getCharacter(characterId);
            if (!character) {
                this.logger.warn(`キャラクターが見つかりません: ${characterId}`);
                return null;
            }
            
            // 統合記憶システムから心理情報を取得
            const psychology = await this.getCharacterPsychologyFromMemorySystem(characterId, chapterNumber);
            if (!psychology) {
                this.logger.warn(`心理情報が取得できませんでした: ${character.name}`);
                return null;
            }
            
            // 深化推奨を取得
            const recommendations = await this.generateDepthRecommendations(
                character,
                psychology,
                chapterNumber
            );
            
            // 上位3件の推奨を選択
            const topRecommendations = recommendations.slice(0, 3);
            
            return this.buildCharacterDepthPrompt(character, topRecommendations, psychology);
            
        } catch (error) {
            this.logger.error(`深化プロンプト生成エラー: ${characterId}`, { error, chapterNumber });
            return null;
        }
    }
    
    /**
     * 章番号に最適なキャラクター深化対象の推奨（ファサードパターン対応版）
     * CharacterManagerファサードを活用した最適なキャラクター選出
     * 
     * @param chapterNumber 章番号
     * @param characterCount 推奨するキャラクター数
     * @returns 推奨キャラクターID配列
     */
    async recommendFocusCharactersForChapter(
        chapterNumber: number,
        characterCount: number = 3
    ): Promise<string[]> {
        try {
            this.logger.debug(`章${chapterNumber}の焦点キャラクター推奨を開始`);
            
            // ファサードパターン対応：全キャラクターを取得してアクティブなものをフィルタリング
            const allCharacters = await this.characterManager.getAllCharacters();
            const activeCharacters = allCharacters.filter(char => 
                char.state?.isActive !== false // デフォルトでアクティブとみなす
            );
            
            if (activeCharacters.length === 0) {
                this.logger.warn('アクティブキャラクターが見つかりません');
                return [];
            }
            
            // 各キャラクターのスコアを計算
            const scoredCharacters = await Promise.all(
                activeCharacters.map(async (character) => {
                    try {
                        const depthScore = await this.calculateDepthPriority(character, chapterNumber);
                        return {
                            id: character.id,
                            name: character.name,
                            score: depthScore
                        };
                    } catch (error) {
                        this.logger.warn(`スコア計算エラー: ${character.name}`, { error });
                        return {
                            id: character.id,
                            name: character.name,
                            score: 0.1 // 最低スコア
                        };
                    }
                })
            );
            
            // スコア順にソートして上位を選択
            const topCharacters = scoredCharacters
                .sort((a, b) => b.score - a.score)
                .slice(0, characterCount);
            
            this.logger.debug(`章${chapterNumber}の焦点キャラクター選出完了`, {
                selectedCharacters: topCharacters.map(c => `${c.name}(${c.score.toFixed(2)})`)
            });
            
            return topCharacters.map(c => c.id);
            
        } catch (error) {
            this.logger.error('焦点キャラクター推奨でエラー', { error, chapterNumber });
            return [];
        }
    }
    
    // ====== ファサードパターン対応プライベートヘルパーメソッド ======
    
    /**
     * 基礎分析の実行（ファサードパターン対応版）
     * 新しいCharacterManagerファサードを活用
     * @private
     */
    private async performBasicAnalysisWithFacade(
        character: Character,
        chapterNumber: number
    ): Promise<CharacterAnalysisResult> {
        try {
            // ファサードパターン対応：characterManager.analyzeCharacter()を使用
            const characterAnalysis = await this.characterManager.analyzeCharacter(character.id);
            
            // ファサードパターン対応：getRelationshipAnalysis()を使用
            const relationshipAnalysis = await this.characterManager.getRelationshipAnalysis();
            
            // RelationshipAnalysis型に適したプロパティアクセス
            const relationshipDynamics = this.extractRelationshipDynamicsFromAnalysis(relationshipAnalysis);
            
            return {
                characterAppearances: [],
                characterPsychologies: [characterAnalysis],
                characterGrowth: {
                    updatedCharacters: [],
                    growthSummary: {
                        totalCharactersAnalyzed: 1,
                        charactersWithGrowth: 0,
                        majorGrowthEvents: []
                    }
                },
                relationshipDynamics
            };
        } catch (error) {
            this.logger.error(`基礎分析実行エラー: ${character.name}`, { error });
            
            // フォールバック分析結果
            return {
                characterAppearances: [],
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
    
    /**
     * 統合記憶システムからキャラクター心理情報を取得
     * @private
     */
    private async getCharacterPsychologyFromMemorySystem(
        characterId: string, 
        chapterNumber: number
    ): Promise<CharacterPsychology | null> {
        try {
            // 統合記憶システムから心理情報を検索
            const searchResult = await this.memoryManager.unifiedSearch(
                `character psychology ${characterId} chapter ${chapterNumber}`,
                [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
            );
            
            if (searchResult.success && searchResult.results.length > 0) {
                // 最新の心理情報を抽出
                const psychologyData = this.extractPsychologyFromSearchResult(
                    searchResult.results[0]
                );
                
                if (psychologyData) {
                    return psychologyData;
                }
            }
            
            // 心理情報が見つからない場合、キャラクター分析から推定
            const character = await this.characterManager.getCharacter(characterId);
            if (character) {
                const analysisResult = await this.characterManager.analyzeCharacter(characterId);
                return this.extractPsychologyFromAnalysis(analysisResult);
            }
            
            return null;
            
        } catch (error) {
            this.logger.error(`心理情報取得エラー: ${characterId}`, { error });
            return null;
        }
    }
    
    /**
     * 関係性推奨の生成（ファサードパターン対応版）
     * @private
     */
    private async generateRelationshipRecommendationsWithFacade(
        character: Character,
        chapterNumber: number
    ): Promise<RelationshipDynamicRecommendation[]> {
        try {
            // ファサードパターン対応：getRelationshipAnalysis()を使用
            const relationshipAnalysis = await this.characterManager.getRelationshipAnalysis();
            
            return this.buildRelationshipRecommendationsFromAnalysis(character, relationshipAnalysis);
        } catch (error) {
            this.logger.error(`関係性推奨生成エラー: ${character.name}`, { error });
            return [];
        }
    }
    
    /**
     * 一貫性推奨の生成
     * @private
     */
    private async generateConsistencyRecommendations(
        character: Character,
        analysisResult: CharacterAnalysisResult
    ): Promise<any[]> {
        try {
            // 基本的な一貫性チェック
            const recommendations = [];
            
            // 性格特性の一貫性
            if (character.personality?.traits && character.personality.traits.length > 0) {
                recommendations.push({
                    title: "性格特性の一貫性維持",
                    description: "既存の性格特性との整合性を保つ",
                    implementation: "これまでの行動パターンに沿った選択を継続",
                    priority: 0.8
                });
            }
            
            // 関係性の一貫性
            if (character.relationships && character.relationships.length > 0) {
                recommendations.push({
                    title: "関係性の一貫性維持",
                    description: "他キャラクターとの関係性を適切に維持",
                    implementation: "既存の関係性に基づいた相互作用を継続",
                    priority: 0.7
                });
            }
            
            return recommendations;
        } catch (error) {
            this.logger.error(`一貫性推奨生成エラー: ${character.name}`, { error });
            return [];
        }
    }
    
    /**
     * アーク最適化推奨の生成
     * @private
     */
    private async generateArcOptimizationRecommendations(
        character: Character,
        analysisResult: CharacterAnalysisResult,
        chapterNumber: number
    ): Promise<CharacterArcRecommendation[]> {
        try {
            const prompt = this.buildArcOptimizationPrompt(character, analysisResult, chapterNumber);
            
            const response = await apiThrottler.throttledRequest(() => 
                this.geminiClient.generateText(prompt, {
                    temperature: 0.3,
                    targetLength: 800,
                    purpose: 'creation',
                    responseFormat: 'json'
                })
            );
            
            return this.parseArcRecommendationsResponse(response);
        } catch (error) {
            this.logger.error(`アーク推奨生成エラー: ${character.name}`, { error });
            return this.generateFallbackArcRecommendations(character);
        }
    }
    
    /**
     * 動機強化推奨の生成
     * @private
     */
    private async generateMotivationEnhancements(
        character: Character,
        psychology: CharacterPsychology
    ): Promise<MotivationEnhancement[]> {
        try {
            const prompt = this.buildMotivationEnhancementPrompt(character, psychology);
            
            const response = await apiThrottler.throttledRequest(() => 
                this.geminiClient.generateText(prompt, {
                    temperature: 0.3,
                    targetLength: 800,
                    purpose: 'creation',
                    responseFormat: 'json'
                })
            );
            
            return this.parseMotivationEnhancementsResponse(response);
        } catch (error) {
            this.logger.error(`動機強化推奨生成エラー: ${character.name}`, { error });
            return this.generateFallbackMotivationEnhancements(psychology);
        }
    }
    
    /**
     * コントラスト推奨の生成
     * @private
     */
    private async generateContrastRecommendations(
        character: Character,
        chapterNumber: number
    ): Promise<ContrastRecommendation[]> {
        try {
            // ファサードパターン対応：getCharactersByType()を使用
            const sameTypeCharacters = await this.characterManager.getCharactersByType(character.type);
            
            if (sameTypeCharacters.length <= 1) {
                return []; // 比較対象がない場合
            }
            
            const prompt = this.buildContrastRecommendationsPrompt(character, sameTypeCharacters);
            
            const response = await apiThrottler.throttledRequest(() => 
                this.geminiClient.generateText(prompt, {
                    temperature: 0.4,
                    targetLength: 800,
                    purpose: 'creation',
                    responseFormat: 'json'
                })
            );
            
            return this.parseContrastRecommendationsResponse(response);
        } catch (error) {
            this.logger.error(`コントラスト推奨生成エラー: ${character.name}`, { error });
            return [];
        }
    }
    
    /**
     * 推奨の優先度付け
     * @private
     */
    private prioritizeRecommendations(
        recommendations: DepthRecommendation[],
        character: Character
    ): DepthRecommendation[] {
        // キャラクタータイプに基づく重み調整
        const typeWeights = {
            'MAIN': 1.2,
            'SUB': 1.0,
            'MOB': 0.8
        };
        
        const typeWeight = typeWeights[character.type as keyof typeof typeWeights] || 1.0;
        
        return recommendations
            .map(rec => ({
                ...rec,
                priority: rec.priority * typeWeight
            }))
            .sort((a, b) => b.priority - a.priority);
    }
    
    /**
     * 深化優先度の計算
     * @private
     */
    private async calculateDepthPriority(character: Character, chapterNumber: number): Promise<number> {
        let score = 0.5; // ベーススコア
        
        // 最後の登場からの経過時間
        const lastAppearance = character.state?.lastAppearance || 0;
        const chaptersSinceLastAppearance = chapterNumber - lastAppearance;
        
        if (chaptersSinceLastAppearance >= 3) {
            score += 0.3; // 長期間登場していない場合は優先度上昇
        }
        
        // 発展段階による調整
        const developmentStage = character.state?.developmentStage || 0;
        if (developmentStage < 3) {
            score += 0.2; // 発展が遅れている場合は優先度上昇
        }
        
        // キャラクタータイプによる調整
        if (character.type === 'MAIN') {
            score += 0.1;
        }
        
        return Math.min(1.0, score);
    }
    
    /**
     * フォーマット用ヘルパーメソッド群
     * @private
     */
    private formatConsistencyRecommendations(recommendations: any[]): DepthRecommendation[] {
        return recommendations.map(rec => ({
            type: 'consistency',
            title: `一貫性: ${rec.title || '行動パターンの維持'}`,
            description: rec.description || '既存の性格特性との整合性を保つ',
            implementation: rec.implementation || 'これまでの行動パターンに沿った選択を継続',
            priority: rec.priority || 0.7
        }));
    }
    
    private formatArcRecommendations(recommendations: CharacterArcRecommendation[]): DepthRecommendation[] {
        return recommendations.map(rec => ({
            type: 'arc',
            title: `成長アーク: ${rec.title}`,
            description: rec.description,
            implementation: rec.suggestion,
            priority: rec.importance
        }));
    }
    
    private formatMotivationRecommendations(recommendations: MotivationEnhancement[]): DepthRecommendation[] {
        return recommendations.map(rec => ({
            type: 'motivation',
            title: `動機: ${rec.title}`,
            description: rec.description,
            implementation: rec.implementation,
            priority: rec.priority
        }));
    }
    
    private formatRelationshipRecommendations(recommendations: RelationshipDynamicRecommendation[]): DepthRecommendation[] {
        return recommendations.map(rec => ({
            type: 'relationship',
            title: `関係性: ${rec.title}`,
            description: rec.description,
            implementation: rec.implementation,
            priority: rec.priority
        }));
    }
    
    private formatContrastRecommendations(recommendations: ContrastRecommendation[]): DepthRecommendation[] {
        return recommendations.map(rec => ({
            type: 'contrast',
            title: `独自性: ${rec.title}`,
            description: rec.description,
            implementation: rec.implementation,
            priority: rec.priority
        }));
    }
    
    /**
     * プロンプト構築メソッド群
     * @private
     */
    private buildGenreAnalysisPrompt(character: Character, genre: string): string {
        return `
# キャラクター「${character.name}」の${genre}ジャンル適合性分析

## キャラクター情報
名前: ${character.name}
タイプ: ${character.type}
説明: ${character.description || 'なし'}
性格特性: ${character.personality?.traits?.join(', ') || 'なし'}

## ジャンル
${genre}

## 分析指示
このキャラクターが${genre}ジャンルの作品により適合するための特性強化推奨を生成してください。

JSON形式で出力:
{
  "recommendations": [
    {
      "title": "推奨タイトル",
      "description": "詳細説明",
      "implementation": "実装方法",
      "priority": 0.X
    }
  ]
}
`;
    }
    
    private buildArcOptimizationPrompt(
        character: Character,
        analysisResult: CharacterAnalysisResult,
        chapterNumber: number
    ): string {
        return `
# キャラクター「${character.name}」のアーク最適化推奨

## 現在の状況
章番号: ${chapterNumber}
発展段階: ${character.state?.developmentStage || 0}/5

## 推奨生成指示
キャラクターの成長アークを最適化するための具体的な推奨を生成してください。

JSON形式で出力:
{
  "arcRecommendations": [
    {
      "title": "推奨タイトル",
      "description": "詳細説明",
      "suggestion": "実装提案",
      "arcPhase": "development",
      "importance": 0.X
    }
  ]
}
`;
    }
    
    private buildMotivationEnhancementPrompt(
        character: Character,
        psychology: CharacterPsychology
    ): string {
        return `
# キャラクター「${character.name}」の動機強化推奨

## 現在の心理状態
欲求: ${psychology.currentDesires.join(', ')}
恐れ: ${psychology.currentFears.join(', ')}
内的葛藤: ${psychology.internalConflicts?.join(', ') || 'なし'}

## 推奨生成指示
キャラクターの動機をより深く、複雑にするための推奨を生成してください。

JSON形式で出力:
{
  "motivationEnhancements": [
    {
      "title": "推奨タイトル",
      "description": "詳細説明",
      "implementation": "実装方法",
      "priority": 0.X
    }
  ]
}
`;
    }
    
    private buildContrastRecommendationsPrompt(
        character: Character,
        sameTypeCharacters: Character[]
    ): string {
        const otherCharacters = sameTypeCharacters
            .filter(c => c.id !== character.id)
            .map(c => `${c.name}: ${c.description || 'なし'}`)
            .join('\n');
        
        return `
# キャラクター「${character.name}」のコントラスト推奨

## 対象キャラクター
${character.name}: ${character.description || 'なし'}

## 同タイプの他キャラクター
${otherCharacters}

## 推奨生成指示
このキャラクターを他の同タイプキャラクターと差別化するための推奨を生成してください。

JSON形式で出力:
{
  "contrastRecommendations": [
    {
      "title": "推奨タイトル",
      "description": "差別化ポイント",
      "implementation": "実装方法",
      "priority": 0.X
    }
  ]
}
`;
    }
    
    /**
     * レスポンス解析メソッド群
     * @private
     */
    private parseGenreRecommendationsResponse(response: string): any[] {
        try {
            const data = JsonParser.parseFromAIResponse(response, { recommendations: [] });
            return data.recommendations || [];
        } catch (error) {
            this.logger.error('ジャンル推奨レスポンス解析エラー', { error });
            return [];
        }
    }
    
    private parseArcRecommendationsResponse(response: string): CharacterArcRecommendation[] {
        try {
            const data = JsonParser.parseFromAIResponse(response, { arcRecommendations: [] });
            return data.arcRecommendations || [];
        } catch (error) {
            this.logger.error('アーク推奨レスポンス解析エラー', { error });
            return this.generateFallbackArcRecommendations();
        }
    }
    
    private parseMotivationEnhancementsResponse(response: string): MotivationEnhancement[] {
        try {
            const data = JsonParser.parseFromAIResponse(response, { motivationEnhancements: [] });
            return data.motivationEnhancements || [];
        } catch (error) {
            this.logger.error('動機強化レスポンス解析エラー', { error });
            return [];
        }
    }
    
    private parseContrastRecommendationsResponse(response: string): ContrastRecommendation[] {
        try {
            const data = JsonParser.parseFromAIResponse(response, { contrastRecommendations: [] });
            return data.contrastRecommendations || [];
        } catch (error) {
            this.logger.error('コントラスト推奨レスポンス解析エラー', { error });
            return [];
        }
    }
    
    /**
     * フォールバック生成メソッド群
     * @private
     */
    private generateFallbackRecommendations(
        character: Character,
        psychology: CharacterPsychology
    ): DepthRecommendation[] {
        return [
            {
                type: 'motivation',
                title: '動機の明確化',
                description: 'キャラクターの行動理由をより明確に表現する',
                implementation: '内面的な独白や決断場面を追加',
                priority: 0.8
            },
            {
                type: 'consistency',
                title: '一貫性の維持',
                description: '既存の性格特性に沿った行動を継続',
                implementation: 'これまでの行動パターンと矛盾しない選択',
                priority: 0.7
            }
        ];
    }
    
    private generateFallbackArcRecommendations(character?: Character): CharacterArcRecommendation[] {
        return [{
            title: "成長機会の創出",
            description: "キャラクターの内面的成長を促す場面の導入",
            suggestion: "価値観が試される選択肢を提示する",
            arcPhase: "development",
            importance: 0.7
        }];
    }
    
    private generateFallbackMotivationEnhancements(psychology: CharacterPsychology): MotivationEnhancement[] {
        return [{
            title: "内的葛藤の深化",
            description: "相反する欲求間の緊張を強化",
            implementation: "難しい選択を迫る状況を創出",
            priority: 0.7
        }];
    }
    
    /**
     * ユーティリティメソッド群
     * @private
     */
    private buildRelationshipRecommendationsFromAnalysis(
        character: Character,
        relationshipAnalysis: RelationshipAnalysis
    ): RelationshipDynamicRecommendation[] {
        // RelationshipAnalysis型から関係性情報を安全に抽出
        const relationships = this.extractRelationshipsFromAnalysis(relationshipAnalysis);
        
        if (!relationships || relationships.length === 0) {
            return [{
                title: "新たな関係性の構築",
                description: "他キャラクターとの意味のある相互作用を追加",
                implementation: "共通の目標や対立を通じた関係性発展",
                priority: 0.6,
                targetCharacterId: null
            }];
        }
        
        return relationships.slice(0, 3).map((rel: any) => ({
            title: `${rel.targetName || rel.name || 'unknown'}との関係深化`,
            description: `現在の${rel.type || rel.relationshipType || '関係'}をより複雑に発展`,
            implementation: "感情的な結びつきや対立を強化",
            priority: 0.7,
            targetCharacterId: rel.targetId || rel.id || null
        }));
    }
    
    private buildCharacterDepthPrompt(
        character: Character,
        recommendations: DepthRecommendation[],
        psychology: CharacterPsychology
    ): CharacterDepthPrompt {
        const focusAreas = recommendations.map(rec => 
            `- ${rec.title}: ${rec.description}`
        ).join('\n');
        
        const implementationSuggestions = recommendations.map(rec =>
            `- ${rec.implementation}`
        ).join('\n');
        
        const psychologicalInsight = this.generatePsychologicalInsight(psychology);
        
        return {
            characterId: character.id,
            characterName: character.name,
            focusAreas,
            implementationSuggestions,
            psychologicalInsight
        };
    }
    
    private generatePsychologicalInsight(psychology: CharacterPsychology): string {
        const desires = psychology.currentDesires.slice(0, 2).join('と');
        const fears = psychology.currentFears.slice(0, 2).join('と');
        
        let emotions = '';
        const emotionEntries = Object.entries(psychology.emotionalState);
        if (emotionEntries.length > 0) {
            const topEmotions = emotionEntries
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2)
                .map(([emotion]) => emotion)
                .join('と');
            emotions = `現在は${topEmotions}の感情が強い。`;
        }
        
        let conflicts = '';
        if (psychology.internalConflicts && psychology.internalConflicts.length > 0) {
            conflicts = `内面的には${psychology.internalConflicts[0]}の葛藤を抱えている。`;
        }
        
        return `このキャラクターは${desires}を求め、${fears}を恐れている。${emotions}${conflicts}`;
    }
    
    private cacheRecommendations(
        cacheKey: string,
        recommendations: DepthRecommendation[],
        chapterNumber: number
    ): void {
        this.recommendationCache.set(cacheKey, {
            recommendations,
            timestamp: Date.now(),
            chapter: chapterNumber
        });
    }
    
    private publishRecommendationEvent(
        character: Character,
        recommendations: DepthRecommendation[]
    ): void {
        // イベントバスが利用可能な場合のみ発行
        try {
            // eventBus.publish(EVENT_TYPES.CHARACTER_DEPTH_RECOMMENDATIONS_GENERATED, {
            //     timestamp: new Date(),
            //     characterId: character.id,
            //     characterName: character.name,
            //     recommendationsCount: recommendations.length
            // });
        } catch (error) {
            // イベント発行エラーは無視
        }
    }
    
    /**
     * 統合記憶システム関連のヘルパーメソッド
     * @private
     */
    private extractPsychologyFromSearchResult(result: any): CharacterPsychology | null {
        try {
            // 検索結果から心理情報を抽出
            if (result.data && result.data.psychology) {
                return result.data.psychology;
            }
            
            // フォールバック：データから心理情報を推定
            return null;
        } catch (error) {
            this.logger.warn('心理情報抽出エラー', { error });
            return null;
        }
    }
    
    private extractPsychologyFromAnalysis(analysisResult: any): CharacterPsychology | null {
        try {
            // 分析結果から心理情報を抽出
            if (analysisResult && analysisResult.psychology) {
                return analysisResult.psychology;
            }
            
            return null;
        } catch (error) {
            this.logger.warn('分析結果から心理情報抽出エラー', { error });
            return null;
        }
    }
    
    /**
     * RelationshipAnalysis型から関係性ダイナミクスを安全に抽出
     * @private
     */
    private extractRelationshipDynamicsFromAnalysis(relationshipAnalysis: RelationshipAnalysis): any[] {
        try {
            // RelationshipAnalysis型の実際の構造に応じて適切なプロパティから抽出
            const analysis = relationshipAnalysis as any;
            
            if (analysis.relationships) {
                return analysis.relationships;
            }
            
            if (analysis.dynamics) {
                return analysis.dynamics;
            }
            
            if (analysis.relationshipDynamics) {
                return analysis.relationshipDynamics;
            }
            
            // 配列形式の場合
            if (Array.isArray(analysis)) {
                return analysis;
            }
            
            // 他の可能性のあるプロパティを確認
            if (analysis.clusters) {
                return analysis.clusters.flatMap((cluster: any) => cluster.relationships || []);
            }
            
            if (analysis.networkData) {
                return analysis.networkData.relationships || [];
            }
            
            return [];
        } catch (error) {
            this.logger.warn('関係性ダイナミクス抽出エラー', { error });
            return [];
        }
    }
    
    /**
     * RelationshipAnalysis型から関係性リストを安全に抽出
     * @private
     */
    private extractRelationshipsFromAnalysis(relationshipAnalysis: RelationshipAnalysis): any[] {
        try {
            const analysis = relationshipAnalysis as any;
            
            // 可能性のあるプロパティ名を順番に確認
            const possibleProperties = [
                'relationships',
                'relationshipData',
                'relations',
                'connections',
                'networkConnections',
                'characterRelationships'
            ];
            
            for (const prop of possibleProperties) {
                if (analysis[prop] && Array.isArray(analysis[prop])) {
                    return analysis[prop];
                }
            }
            
            // ネストした構造の場合
            if (analysis.analysis && analysis.analysis.relationships) {
                return analysis.analysis.relationships;
            }
            
            if (analysis.data && analysis.data.relationships) {
                return analysis.data.relationships;
            }
            
            // オブジェクトの値から配列を探す
            const values = Object.values(analysis);
            for (const value of values) {
                if (Array.isArray(value) && value.length > 0) {
                    // 関係性データっぽいオブジェクトか確認
                    const firstItem = value[0];
                    if (firstItem && (firstItem.targetId || firstItem.characterId || firstItem.name)) {
                        return value;
                    }
                }
            }
            
            return [];
        } catch (error) {
            this.logger.warn('関係性リスト抽出エラー', { error });
            return [];
        }
    }
    
    private createFallbackPsychology(character: Character): CharacterPsychology {
        const defaultDesires = character.type === 'MAIN' ? 
            ['使命の遂行', '承認', '成長'] : 
            ['生存', '安全', '所属'];
        
        const defaultFears = character.type === 'MAIN' ?
            ['失敗', '喪失', '裏切り'] :
            ['危険', '孤立'];
        
        return {
            currentDesires: defaultDesires,
            currentFears: defaultFears,
            internalConflicts: [],
            emotionalState: { '平静': 0.5 },
            relationshipAttitudes: {}
        };
    }
}

/**
 * ファクトリー関数（依存性注入対応）
 */
export function createCharacterDepthService(
    characterManager: CharacterManager,
    memoryManager: MemoryManager
): CharacterDepthService {
    return new CharacterDepthService(characterManager, memoryManager);
}

/**
 * 🔥 後方互換性のためのシングルトンエクスポート（非推奨）
 * 新しいコードでは createCharacterDepthService() を使用してください
 */
export const characterDepthService = {
    /**
     * インスタンス取得（ファクトリー使用推奨）
     */
    create: createCharacterDepthService
};