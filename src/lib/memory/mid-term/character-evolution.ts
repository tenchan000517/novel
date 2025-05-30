/**
 * @fileoverview キャラクター進化管理システム - 中期記憶階層
 * @description
 * キャラクターの発展履歴、関係性の進化、心理的成長を追跡するコンポーネント。
 * CharacterChangeHandlerの結果を永続化し、キャラクター間の関係性変化を管理します。
 */

import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import { Chapter } from '@/types/chapters';
import { CharacterChangeInfo } from '@/types/characters';


/**
 * ストレージデータの型定義
 */
interface StorageData {
    characterDevelopmentHistory?: Array<[string, CharacterDevelopmentRecord[]]>;
    characterChangeHistory?: Array<[string, CharacterChangeRecord[]]>;
    relationshipEvolution?: Array<[string, RelationshipEvolutionRecord[]]>;
    psychologyEvolution?: Array<[string, PsychologyEvolutionRecord[]]>;
    characterArcs?: Array<[string, CharacterArcProgression]>;
    influenceNetworks?: Array<[string, {
        sourceCharacterId: string;
        influenceMap: Array<[string, any]>;
        lastUpdated: string;
    }]>;
    savedAt?: string;
}

/**
 * @interface CharacterDevelopmentRecord
 * @description キャラクター発展記録
 */
export interface CharacterDevelopmentRecord {
    characterId: string;
    characterName: string;
    chapter: number;
    developmentType: 'PERSONALITY' | 'SKILL' | 'RELATIONSHIP' | 'MOTIVATION' | 'BACKSTORY' | 'STATUS';
    beforeState: {
        personality?: string[];
        skills?: string[];
        motivations?: string[];
        relationships?: Array<{ target: string; type: string; strength: number }>;
        status?: string;
    };
    afterState: {
        personality?: string[];
        skills?: string[];
        motivations?: string[];
        relationships?: Array<{ target: string; type: string; strength: number }>;
        status?: string;
    };
    changeDescription: string;
    significance: number; // 0-10
    triggerEvent: string;
    timestamp: string;
}

/**
 * @interface CharacterChangeRecord
 * @description CharacterChangeHandlerの変更記録
 */
export interface CharacterChangeRecord {
    id: string;
    characterId: string;
    characterName: string;
    chapter: number;
    changeType: 'ATTRIBUTE_CHANGE' | 'RELATIONSHIP_CHANGE' | 'STATUS_CHANGE' | 'GROWTH_PHASE_CHANGE';
    changes: Array<{
        attribute: string;
        previousValue: any;
        currentValue: any;
        changeReason: string;
        confidence: number;
    }>;
    classification: {
        narrativeSignificance: number;
        characterImpact: number;
        storyRelevance: number;
    };
    processingResult: 'SUCCESS' | 'PARTIAL' | 'FAILED';
    timestamp: string;
}

/**
 * @interface RelationshipEvolutionRecord
 * @description 関係性進化記録
 */
export interface RelationshipEvolutionRecord {
    id: string;
    character1Id: string;
    character1Name: string;
    character2Id: string;
    character2Name: string;
    chapter: number;
    relationshipType: 'FRIENDSHIP' | 'ROMANTIC' | 'FAMILIAL' | 'PROFESSIONAL' | 'ANTAGONISTIC' | 'NEUTRAL';
    evolutionType: 'FORMATION' | 'STRENGTHENING' | 'WEAKENING' | 'TRANSFORMATION' | 'TERMINATION';
    previousStrength: number;
    currentStrength: number;
    previousType: string;
    currentType: string;
    catalyst: string;
    significance: number;
    mutualChange: boolean;
    timestamp: string;
}

/**
 * @interface PsychologyEvolutionRecord
 * @description 心理進化記録
 */
export interface PsychologyEvolutionRecord {
    characterId: string;
    characterName: string;
    chapter: number;
    psychologyAspect: 'FEAR' | 'DESIRE' | 'BELIEF' | 'TRAUMA' | 'MOTIVATION' | 'PERSONALITY_TRAIT';
    evolutionType: 'EMERGENCE' | 'INTENSIFICATION' | 'RESOLUTION' | 'TRANSFORMATION' | 'SUPPRESSION';
    previousState: string;
    currentState: string;
    psychologicalDepth: number; // 1-10
    behavioralImpact: number; // 1-10
    storyRelevance: number; // 1-10
    triggerEvents: string[];
    timestamp: string;
}

/**
 * @interface CharacterArcProgression
 * @description キャラクターアーク進行
 */
export interface CharacterArcProgression {
    characterId: string;
    characterName: string;
    arcType: 'HERO_JOURNEY' | 'REDEMPTION' | 'FALL' | 'GROWTH' | 'TRANSFORMATION' | 'STATIC';
    phases: Array<{
        phase: string;
        chapter: number;
        description: string;
        completed: boolean;
        significance: number;
    }>;
    currentPhase: string;
    progressPercentage: number;
    keyMilestones: Array<{
        milestone: string;
        chapter: number;
        achieved: boolean;
        impact: number;
    }>;
    created: string;
    lastUpdated: string;
}

/**
 * @interface CharacterInfluenceNetwork
 * @description キャラクター影響ネットワーク
 */
export interface CharacterInfluenceNetwork {
    sourceCharacterId: string;
    influenceMap: Map<string, {
        targetCharacterId: string;
        influenceType: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'COMPLEX';
        influenceStrength: number;
        influenceHistory: Array<{
            chapter: number;
            event: string;
            impactLevel: number;
            timestamp: string;
        }>;
    }>;
    lastUpdated: string;
}

/**
 * @class CharacterEvolutionManager
 * @description キャラクター進化管理を担当するクラス
 */
export class CharacterEvolutionManager {
    private characterDevelopmentHistory: Map<string, CharacterDevelopmentRecord[]> = new Map();
    private characterChangeHistory: Map<string, CharacterChangeRecord[]> = new Map();
    private relationshipEvolution: Map<string, RelationshipEvolutionRecord[]> = new Map();
    private psychologyEvolution: Map<string, PsychologyEvolutionRecord[]> = new Map();
    private characterArcs: Map<string, CharacterArcProgression> = new Map();
    private influenceNetworks: Map<string, CharacterInfluenceNetwork> = new Map();
    private initialized: boolean = false;

    constructor() { }

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('CharacterEvolutionManager already initialized');
            return;
        }

        try {
            await this.loadFromStorage();
            this.initialized = true;
            logger.info('CharacterEvolutionManager initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize CharacterEvolutionManager', {
                error: error instanceof Error ? error.message : String(error)
            });
            this.initialized = true; // エラーでも空の状態で続行
        }
    }

    /**
     * ストレージからデータを読み込み
     * @private
     */
    private async loadFromStorage(): Promise<void> {
        try {
            if (await storageProvider.fileExists('mid-term-memory/character-evolution.json')) {
                const data = await storageProvider.readFile('mid-term-memory/character-evolution.json');
                const parsed = JSON.parse(data) as StorageData;

                // 各データの復元
                if (parsed.characterDevelopmentHistory) {
                    this.characterDevelopmentHistory = new Map<string, CharacterDevelopmentRecord[]>(
                        parsed.characterDevelopmentHistory
                    );
                }

                if (parsed.characterChangeHistory) {
                    this.characterChangeHistory = new Map<string, CharacterChangeRecord[]>(
                        parsed.characterChangeHistory
                    );
                }

                if (parsed.relationshipEvolution) {
                    this.relationshipEvolution = new Map<string, RelationshipEvolutionRecord[]>(
                        parsed.relationshipEvolution
                    );
                }

                if (parsed.psychologyEvolution) {
                    this.psychologyEvolution = new Map<string, PsychologyEvolutionRecord[]>(
                        parsed.psychologyEvolution
                    );
                }

                if (parsed.characterArcs) {
                    this.characterArcs = new Map<string, CharacterArcProgression>(
                        parsed.characterArcs
                    );
                }

                if (parsed.influenceNetworks) {
                    // Map内のMapの復元（型安全版）
                    const networks = new Map<string, CharacterInfluenceNetwork>();

                    for (const [key, networkData] of parsed.influenceNetworks) {
                        const network: CharacterInfluenceNetwork = {
                            sourceCharacterId: networkData.sourceCharacterId,
                            influenceMap: new Map(),
                            lastUpdated: networkData.lastUpdated
                        };

                        // influenceMapの復元
                        if (networkData.influenceMap && Array.isArray(networkData.influenceMap)) {
                            for (const [influenceKey, influenceValue] of networkData.influenceMap) {
                                network.influenceMap.set(influenceKey, influenceValue);
                            }
                        }

                        networks.set(key, network);
                    }

                    this.influenceNetworks = networks;
                }
            }
        } catch (error) {
            logger.error('Failed to load character evolution data', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * データを保存
     */
    async save(): Promise<void> {
        try {
            // Map内のMapを配列に変換
            const influenceNetworksArray = Array.from(this.influenceNetworks.entries()).map(([key, network]) => [
                key,
                {
                    ...network,
                    influenceMap: Array.from(network.influenceMap.entries())
                }
            ]);

            const data = {
                characterDevelopmentHistory: Array.from(this.characterDevelopmentHistory.entries()),
                characterChangeHistory: Array.from(this.characterChangeHistory.entries()),
                relationshipEvolution: Array.from(this.relationshipEvolution.entries()),
                psychologyEvolution: Array.from(this.psychologyEvolution.entries()),
                characterArcs: Array.from(this.characterArcs.entries()),
                influenceNetworks: influenceNetworksArray,
                savedAt: new Date().toISOString()
            };

            await storageProvider.writeFile(
                'mid-term-memory/character-evolution.json',
                JSON.stringify(data, null, 2)
            );

            logger.debug('Saved character evolution data');
        } catch (error) {
            logger.error('Failed to save character evolution data', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 章からキャラクター進化を更新
     */
    async updateFromChapter(chapter: Chapter): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            logger.info(`Updating character evolution from chapter ${chapter.chapterNumber}`);

            // キャラクター発展の分析
            await this.analyzeCharacterDevelopment(chapter);

            // 関係性変化の分析
            await this.analyzeRelationshipChanges(chapter);

            // 心理進化の分析
            await this.analyzePsychologyEvolution(chapter);

            // キャラクターアークの更新
            await this.updateCharacterArcs(chapter);

            // 影響ネットワークの更新
            await this.updateInfluenceNetworks(chapter);

            await this.save();
            logger.info(`Successfully updated character evolution from chapter ${chapter.chapterNumber}`);
        } catch (error) {
            logger.error(`Failed to update character evolution from chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * キャラクター発展を分析
     * @private
     */
    private async analyzeCharacterDevelopment(chapter: Chapter): Promise<void> {
        try {
            const content = chapter.content.toLowerCase();
            const chapterNumber = chapter.chapterNumber;

            // 発展パターンの検出
            const developmentPatterns = [
                {
                    type: 'PERSONALITY' as const,
                    patterns: [/性格.*変わ/, /人格.*成長/, /考え方.*変化/],
                    significance: 7
                },
                {
                    type: 'SKILL' as const,
                    patterns: [/技術.*習得/, /能力.*向上/, /スキル.*身につけ/],
                    significance: 6
                },
                {
                    type: 'MOTIVATION' as const,
                    patterns: [/動機.*変化/, /目標.*変わ/, /やる気.*変化/],
                    significance: 8
                },
                {
                    type: 'STATUS' as const,
                    patterns: [/地位.*変化/, /立場.*変わ/, /役職.*昇進/],
                    significance: 6
                }
            ];

            // キャラクター名の抽出（簡易版）
            const characterPattern = /「([一-龯ぁ-んァ-ヶa-zA-Z]{2,10})」/g;
            const detectedCharacters = new Set<string>();
            let match;
            while ((match = characterPattern.exec(chapter.content)) !== null) {
                detectedCharacters.add(match[1]);
            }

            // 各キャラクターについて発展を分析
            for (const characterName of detectedCharacters) {
                for (const pattern of developmentPatterns) {
                    for (const regex of pattern.patterns) {
                        if (regex.test(content)) {
                            await this.recordCharacterDevelopment({
                                characterId: `char-${characterName}`, // 実際の実装ではIDを取得
                                characterName,
                                chapter: chapterNumber,
                                developmentType: pattern.type,
                                beforeState: {},
                                afterState: {},
                                changeDescription: `${pattern.type}の変化が検出されました`,
                                significance: pattern.significance,
                                triggerEvent: `第${chapterNumber}章の出来事`,
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                }
            }
        } catch (error) {
            logger.error('Failed to analyze character development', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 関係性変化を分析
     * @private
     */
    private async analyzeRelationshipChanges(chapter: Chapter): Promise<void> {
        try {
            const content = chapter.content.toLowerCase();
            const chapterNumber = chapter.chapterNumber;

            // 関係性変化パターンの検出
            const relationshipPatterns = [
                {
                    type: 'FRIENDSHIP' as const,
                    evolution: 'STRENGTHENING' as const,
                    patterns: [/友情.*深まる/, /親しく.*なる/, /仲良く.*なる/],
                    significance: 6
                },
                {
                    type: 'ROMANTIC' as const,
                    evolution: 'FORMATION' as const,
                    patterns: [/恋.*始まる/, /愛.*芽生える/, /好き.*なる/],
                    significance: 8
                },
                {
                    type: 'ANTAGONISTIC' as const,
                    evolution: 'FORMATION' as const,
                    patterns: [/対立.*始まる/, /敵.*なる/, /争い.*起こる/],
                    significance: 7
                },
                {
                    type: 'PROFESSIONAL' as const,
                    evolution: 'TRANSFORMATION' as const,
                    patterns: [/仕事.*関係/, /職場.*での/, /同僚.*として/],
                    significance: 5
                }
            ];

            // キャラクター名の抽出
            const characterPattern = /「([一-龯ぁ-んァ-ヶa-zA-Z]{2,10})」/g;
            const characters = [];
            let match;
            while ((match = characterPattern.exec(chapter.content)) !== null) {
                characters.push(match[1]);
            }

            // キャラクターペアの関係性変化を分析
            for (let i = 0; i < characters.length; i++) {
                for (let j = i + 1; j < characters.length; j++) {
                    const char1 = characters[i];
                    const char2 = characters[j];

                    for (const pattern of relationshipPatterns) {
                        for (const regex of pattern.patterns) {
                            if (regex.test(content)) {
                                await this.recordRelationshipEvolution({
                                    id: `rel-${chapterNumber}-${char1}-${char2}-${Date.now()}`,
                                    character1Id: `char-${char1}`,
                                    character1Name: char1,
                                    character2Id: `char-${char2}`,
                                    character2Name: char2,
                                    chapter: chapterNumber,
                                    relationshipType: pattern.type,
                                    evolutionType: pattern.evolution,
                                    previousStrength: 5, // デフォルト値
                                    currentStrength: pattern.evolution === 'STRENGTHENING' ? 7 : 6,
                                    previousType: 'NEUTRAL',
                                    currentType: pattern.type,
                                    catalyst: `第${chapterNumber}章の出来事`,
                                    significance: pattern.significance,
                                    mutualChange: true,
                                    timestamp: new Date().toISOString()
                                });
                            }
                        }
                    }
                }
            }
        } catch (error) {
            logger.error('Failed to analyze relationship changes', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 心理進化を分析
     * @private
     */
    private async analyzePsychologyEvolution(chapter: Chapter): Promise<void> {
        try {
            const content = chapter.content.toLowerCase();
            const chapterNumber = chapter.chapterNumber;

            // 心理変化パターンの検出
            const psychologyPatterns = [
                {
                    aspect: 'FEAR' as const,
                    evolution: 'EMERGENCE' as const,
                    patterns: [/恐怖.*感じる/, /怖い.*思う/, /不安.*なる/],
                    depth: 7
                },
                {
                    aspect: 'DESIRE' as const,
                    evolution: 'INTENSIFICATION' as const,
                    patterns: [/欲求.*強くなる/, /望み.*大きくなる/, /願い.*強くなる/],
                    depth: 6
                },
                {
                    aspect: 'BELIEF' as const,
                    evolution: 'TRANSFORMATION' as const,
                    patterns: [/信念.*変わる/, /考え.*変化/, /価値観.*変わる/],
                    depth: 8
                },
                {
                    aspect: 'MOTIVATION' as const,
                    evolution: 'INTENSIFICATION' as const,
                    patterns: [/やる気.*出る/, /動機.*強くなる/, /意欲.*湧く/],
                    depth: 6
                }
            ];

            // キャラクター名の抽出
            const characterPattern = /「([一-龯ぁ-んァ-ヶa-zA-Z]{2,10})」/g;
            const characters = new Set<string>();
            let match;
            while ((match = characterPattern.exec(chapter.content)) !== null) {
                characters.add(match[1]);
            }

            // 各キャラクターの心理進化を分析
            for (const characterName of characters) {
                for (const pattern of psychologyPatterns) {
                    for (const regex of pattern.patterns) {
                        if (regex.test(content)) {
                            await this.recordPsychologyEvolution({
                                characterId: `char-${characterName}`,
                                characterName,
                                chapter: chapterNumber,
                                psychologyAspect: pattern.aspect,
                                evolutionType: pattern.evolution,
                                previousState: '通常状態',
                                currentState: `${pattern.aspect}の${pattern.evolution}`,
                                psychologicalDepth: pattern.depth,
                                behavioralImpact: pattern.depth - 1,
                                storyRelevance: pattern.depth,
                                triggerEvents: [`第${chapterNumber}章の出来事`],
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                }
            }
        } catch (error) {
            logger.error('Failed to analyze psychology evolution', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * キャラクターアークを更新
     * @private
     */
    private async updateCharacterArcs(chapter: Chapter): Promise<void> {
        try {
            const content = chapter.content.toLowerCase();
            const chapterNumber = chapter.chapterNumber;

            // アーク進行パターンの検出
            const arcMilestones = [
                { milestone: '召命', patterns: [/使命/, /運命/, /選ばれる/], phase: 'CALL_TO_ADVENTURE' },
                { milestone: '出発', patterns: [/旅立ち/, /出発/, /始まり/], phase: 'DEPARTURE' },
                { milestone: '試練', patterns: [/試練/, /困難/, /挑戦/], phase: 'TRIALS' },
                { milestone: '変容', patterns: [/変化/, /成長/, /変わる/], phase: 'TRANSFORMATION' },
                { milestone: '帰還', patterns: [/帰る/, /戻る/, /復帰/], phase: 'RETURN' }
            ];

            // キャラクター名の抽出
            const characterPattern = /「([一-龯ぁ-んァ-ヶa-zA-Z]{2,10})」/g;
            const characters = new Set<string>();
            let match;
            while ((match = characterPattern.exec(chapter.content)) !== null) {
                characters.add(match[1]);
            }

            // 各キャラクターのアークを更新
            for (const characterName of characters) {
                const characterId = `char-${characterName}`;
                let arc = this.characterArcs.get(characterId);

                if (!arc) {
                    // 新しいアークを作成
                    arc = {
                        characterId,
                        characterName,
                        arcType: 'GROWTH',
                        phases: [],
                        currentPhase: 'BEGINNING',
                        progressPercentage: 0,
                        keyMilestones: [],
                        created: new Date().toISOString(),
                        lastUpdated: new Date().toISOString()
                    };
                }

                // マイルストーンの確認
                for (const milestone of arcMilestones) {
                    for (const pattern of milestone.patterns) {
                        if (pattern.test(content)) {
                            // 既存のマイルストーンかチェック
                            const exists = arc.keyMilestones.some(m => m.milestone === milestone.milestone);
                            if (!exists) {
                                arc.keyMilestones.push({
                                    milestone: milestone.milestone,
                                    chapter: chapterNumber,
                                    achieved: true,
                                    impact: 7
                                });

                                arc.phases.push({
                                    phase: milestone.phase,
                                    chapter: chapterNumber,
                                    description: `${milestone.milestone}のフェーズ`,
                                    completed: true,
                                    significance: 7
                                });

                                arc.currentPhase = milestone.phase;
                            }
                        }
                    }
                }

                // 進行率の更新
                arc.progressPercentage = Math.min(100, (arc.keyMilestones.length / 5) * 100);
                arc.lastUpdated = new Date().toISOString();

                this.characterArcs.set(characterId, arc);
            }
        } catch (error) {
            logger.error('Failed to update character arcs', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 影響ネットワークを更新
     * @private
     */
    private async updateInfluenceNetworks(chapter: Chapter): Promise<void> {
        try {
            const chapterNumber = chapter.chapterNumber;

            // キャラクター名の抽出
            const characterPattern = /「([一-龯ぁ-んァ-ヶa-zA-Z]{2,10})」/g;
            const characters = [];
            let match;
            while ((match = characterPattern.exec(chapter.content)) !== null) {
                characters.push(match[1]);
            }

            // キャラクター間の影響を分析
            for (let i = 0; i < characters.length; i++) {
                for (let j = 0; j < characters.length; j++) {
                    if (i === j) continue;

                    const sourceChar = characters[i];
                    const targetChar = characters[j];
                    const sourceId = `char-${sourceChar}`;
                    const targetId = `char-${targetChar}`;

                    // 影響ネットワークを取得または作成
                    let network = this.influenceNetworks.get(sourceId);
                    if (!network) {
                        network = {
                            sourceCharacterId: sourceId,
                            influenceMap: new Map(),
                            lastUpdated: new Date().toISOString()
                        };
                    }

                    // 影響記録を追加（簡易版）
                    let influence = network.influenceMap.get(targetId);
                    if (!influence) {
                        influence = {
                            targetCharacterId: targetId,
                            influenceType: 'NEUTRAL',
                            influenceStrength: 0.5,
                            influenceHistory: []
                        };
                    }

                    // 章での影響を記録
                    influence.influenceHistory.push({
                        chapter: chapterNumber,
                        event: `第${chapterNumber}章での相互作用`,
                        impactLevel: 5,
                        timestamp: new Date().toISOString()
                    });

                    // 履歴の制限
                    if (influence.influenceHistory.length > 20) {
                        influence.influenceHistory = influence.influenceHistory.slice(-20);
                    }

                    network.influenceMap.set(targetId, influence);
                    network.lastUpdated = new Date().toISOString();
                    this.influenceNetworks.set(sourceId, network);
                }
            }
        } catch (error) {
            logger.error('Failed to update influence networks', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    // ============================================================================
    // 記録メソッド
    // ============================================================================

    /**
     * キャラクター発展を記録
     */
    async recordCharacterDevelopment(record: CharacterDevelopmentRecord): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const characterId = record.characterId;
            if (!this.characterDevelopmentHistory.has(characterId)) {
                this.characterDevelopmentHistory.set(characterId, []);
            }

            this.characterDevelopmentHistory.get(characterId)!.push(record);
            await this.save();

            logger.info(`Recorded character development for ${record.characterName} in chapter ${record.chapter}`);
        } catch (error) {
            logger.error('Failed to record character development', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * キャラクター変更を記録
     */
    async recordCharacterChange(record: CharacterChangeRecord): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const characterId = record.characterId;
            if (!this.characterChangeHistory.has(characterId)) {
                this.characterChangeHistory.set(characterId, []);
            }

            this.characterChangeHistory.get(characterId)!.push(record);
            await this.save();

            logger.info(`Recorded character change for ${record.characterName} in chapter ${record.chapter}`);
        } catch (error) {
            logger.error('Failed to record character change', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 関係性進化を記録
     */
    async recordRelationshipEvolution(record: RelationshipEvolutionRecord): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const key = `${record.character1Id}-${record.character2Id}`;
            if (!this.relationshipEvolution.has(key)) {
                this.relationshipEvolution.set(key, []);
            }

            this.relationshipEvolution.get(key)!.push(record);
            await this.save();

            logger.info(`Recorded relationship evolution between ${record.character1Name} and ${record.character2Name}`);
        } catch (error) {
            logger.error('Failed to record relationship evolution', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 心理進化を記録
     */
    async recordPsychologyEvolution(record: PsychologyEvolutionRecord): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const characterId = record.characterId;
            if (!this.psychologyEvolution.has(characterId)) {
                this.psychologyEvolution.set(characterId, []);
            }

            this.psychologyEvolution.get(characterId)!.push(record);
            await this.save();

            logger.info(`Recorded psychology evolution for ${record.characterName} in chapter ${record.chapter}`);
        } catch (error) {
            logger.error('Failed to record psychology evolution', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    // ============================================================================
    // パブリックアクセサーメソッド
    // ============================================================================

    /**
     * キャラクター発展履歴を取得
     */
    getCharacterDevelopmentHistory(characterId?: string): CharacterDevelopmentRecord[] {
        if (characterId) {
            return this.characterDevelopmentHistory.get(characterId) || [];
        }

        const allRecords: CharacterDevelopmentRecord[] = [];
        for (const records of this.characterDevelopmentHistory.values()) {
            allRecords.push(...records);
        }
        return allRecords.sort((a, b) => a.chapter - b.chapter);
    }

    /**
     * キャラクター変更履歴を取得
     */
    getCharacterChangeHistory(characterId?: string): CharacterChangeRecord[] {
        if (characterId) {
            return this.characterChangeHistory.get(characterId) || [];
        }

        const allRecords: CharacterChangeRecord[] = [];
        for (const records of this.characterChangeHistory.values()) {
            allRecords.push(...records);
        }
        return allRecords.sort((a, b) => a.chapter - b.chapter);
    }

    /**
     * 関係性進化履歴を取得
     */
    getRelationshipEvolution(character1Id?: string, character2Id?: string): RelationshipEvolutionRecord[] {
        if (character1Id && character2Id) {
            const key1 = `${character1Id}-${character2Id}`;
            const key2 = `${character2Id}-${character1Id}`;
            const records1 = this.relationshipEvolution.get(key1) || [];
            const records2 = this.relationshipEvolution.get(key2) || [];
            return [...records1, ...records2].sort((a, b) => a.chapter - b.chapter);
        }

        const allRecords: RelationshipEvolutionRecord[] = [];
        for (const records of this.relationshipEvolution.values()) {
            allRecords.push(...records);
        }
        return allRecords.sort((a, b) => a.chapter - b.chapter);
    }

    /**
     * 心理進化履歴を取得
     */
    getPsychologyEvolution(characterId?: string): PsychologyEvolutionRecord[] {
        if (characterId) {
            return this.psychologyEvolution.get(characterId) || [];
        }

        const allRecords: PsychologyEvolutionRecord[] = [];
        for (const records of this.psychologyEvolution.values()) {
            allRecords.push(...records);
        }
        return allRecords.sort((a, b) => a.chapter - b.chapter);
    }

    /**
     * キャラクターアークを取得
     */
    getCharacterArc(characterId: string): CharacterArcProgression | null {
        return this.characterArcs.get(characterId) || null;
    }

    /**
     * 全キャラクターアークを取得
     */
    getAllCharacterArcs(): CharacterArcProgression[] {
        return Array.from(this.characterArcs.values());
    }

    /**
     * 影響ネットワークを取得
     */
    getInfluenceNetwork(characterId: string): CharacterInfluenceNetwork | null {
        return this.influenceNetworks.get(characterId) || null;
    }

    /**
     * 進化統計を取得
     */
    getEvolutionStatistics(): {
        totalDevelopments: number;
        totalChanges: number;
        totalRelationshipEvolutions: number;
        totalPsychologyEvolutions: number;
        activeCharacterArcs: number;
        averageArcProgress: number;
    } {
        const totalDevelopments = Array.from(this.characterDevelopmentHistory.values())
            .reduce((sum, records) => sum + records.length, 0);

        const totalChanges = Array.from(this.characterChangeHistory.values())
            .reduce((sum, records) => sum + records.length, 0);

        const totalRelationshipEvolutions = Array.from(this.relationshipEvolution.values())
            .reduce((sum, records) => sum + records.length, 0);

        const totalPsychologyEvolutions = Array.from(this.psychologyEvolution.values())
            .reduce((sum, records) => sum + records.length, 0);

        const activeCharacterArcs = this.characterArcs.size;

        const arcProgresses = Array.from(this.characterArcs.values()).map(arc => arc.progressPercentage);
        const averageArcProgress = arcProgresses.length > 0
            ? arcProgresses.reduce((sum, progress) => sum + progress, 0) / arcProgresses.length
            : 0;

        return {
            totalDevelopments,
            totalChanges,
            totalRelationshipEvolutions,
            totalPsychologyEvolutions,
            activeCharacterArcs,
            averageArcProgress
        };
    }
}