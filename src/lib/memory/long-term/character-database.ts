// src/lib/memory/long-term/character-database.ts
/**
 * @fileoverview キャラクターマスターデータベース（同期版storageProvider統一版）
 * @description
 * 🔧 ストレージプロバイダーの二重初期化問題を解決
 * 🔧 同期版storageProviderに統一してConsolidation競合を回避
 * 🔧 非同期初期化の排除による安定性向上
 */

import { logger } from '@/lib/utils/logger';
import { Character, CharacterType, CharacterState } from '@/types/characters';
import { characterManager } from '@/lib/characters/manager';
import { ConsolidationGuard } from './consolidation-guard';
import { parseYaml } from '@/lib/utils/yaml-helper';
import { storageProvider } from '@/lib/storage'; // 🔄 同期版に統一

import {
    CharacterMasterRecord,
    CharacterConflictResolution,
    CharacterPersonality,
    CharacterBackstory,
    CharacterRelationship,
    ExtendedCharacterState,
    CharacterDevelopmentRecord,
    CharacterAppearanceRecord,
    CharacterChangeRecord,
    CharacterStatistics,
    FormattedCharacterData,
    CharacterMetadata,
    ConsolidationSource
} from './character-database-types'

/**
 * @class CharacterDatabase
 * @description
 * キャラクターマスターデータベース（同期版storageProvider統一版）
 * 🆕 二重初期化問題を解決し、ConsolidationGuardとの競合を回避
 */
export class CharacterDatabase {
    private masterRecords: Map<string, CharacterMasterRecord> = new Map();
    private nameToIdMap: Map<string, string> = new Map();
    private relationshipIndex: Map<string, string[]> = new Map();
    private initialized: boolean = false;
    private lastConsolidationTime: string = '';
    private initializationRetryCount: number = 0;
    private readonly MAX_RETRY_COUNT = 3;

    /**
     * コンストラクタ
     */
    constructor() {
        logger.info('CharacterDatabase initialized');
    }

    /**
     * 初期化処理（🆕 同期版storageProvider使用）
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('CharacterDatabase already initialized');
            return;
        }

        // 🆕 同期版storageProviderを直接使用（非同期取得を削除）
        logger.debug('Storage provider acquired for CharacterDatabase');

        try {
            // 🆕 リトライ機能付き初期化
            await this.performInitializationWithRetry();
            this.initialized = true;
            this.lastConsolidationTime = new Date().toISOString();
            logger.info('CharacterDatabase initialization completed with 2-source consolidation');
        } catch (error) {
            logger.error('Failed to initialize CharacterDatabase after all retries', {
                error: error instanceof Error ? error.message : String(error),
                retryCount: this.initializationRetryCount
            });
            
            // 🆕 部分的な初期化状態でも続行を許可
            this.initialized = true;
            this.lastConsolidationTime = new Date().toISOString();
            logger.warn('CharacterDatabase initialized in degraded mode');
        }
    }

    /**
     * 🆕 リトライ機能付き初期化処理
     */
    private async performInitializationWithRetry(): Promise<void> {
        for (let attempt = 1; attempt <= this.MAX_RETRY_COUNT; attempt++) {
            try {
                this.initializationRetryCount = attempt;
                
                // ストレージからマスターレコードを読み込み
                await this.loadMasterRecordsWithFallback();

                // CharacterManagerとの統合処理（競合回避機能付き）
                await this.performCharacterConsolidationWithRetry();

                // インデックスの構築
                this.buildIndices();

                logger.info(`CharacterDatabase initialization succeeded on attempt ${attempt}`);
                return;
            } catch (error) {
                logger.warn(`CharacterDatabase initialization attempt ${attempt} failed`, { error });
                
                if (attempt < this.MAX_RETRY_COUNT) {
                    // 次回試行前に少し待機
                    await this.sleep(1000 * attempt);
                } else {
                    throw error;
                }
            }
        }
    }

    /**
     * 🆕 フォールバック機能付きマスターレコード読み込み（同期版使用）
     */
    private async loadMasterRecordsWithFallback(): Promise<void> {
        const masterPaths = [
            'long-term-memory/knowledge/characters/master-records.json',
            'data/long-term-memory/knowledge/characters/master-records.json',
            'data/characters/master-records.json'
        ];

        for (const masterPath of masterPaths) {
            try {
                if (await storageProvider.fileExists(masterPath)) {
                    const content = await storageProvider.readFile(masterPath);
                    const records = JSON.parse(content);

                    if (Array.isArray(records)) {
                        records.forEach(record => {
                            this.masterRecords.set(record.id, record);
                            this.nameToIdMap.set(record.name.toLowerCase(), record.id);
                        });
                        logger.info(`Loaded master records from ${masterPath}`);
                        return;
                    }
                }
            } catch (error) {
                logger.debug(`Failed to load from ${masterPath}`, { error });
            }
        }

        logger.info('No existing master records found, starting with empty database');
    }

    /**
     * 🆕 フォールバック機能付きストレージからのキャラクター読み込み（同期版使用）
     */
    private async loadCharactersFromStorageWithFallback(): Promise<Character[]> {
        const characters: Character[] = [];

        const characterPaths = [
            'data/characters/main',
            'data/characters/sub-characters', 
            'data/characters/mob-characters',
            'world-knowledge/characters',
            'characters/main',
            'characters/sub',
            'characters/mob'
        ];

        for (const basePath of characterPaths) {
            try {
                // 🔄 同期版storageProviderのメソッド使用
                if (await storageProvider.directoryExists(basePath)) {
                    const files = await storageProvider.listFiles(basePath);

                    for (const file of files) {
                        if (file.endsWith('.json') || file.endsWith('.yaml')) {
                            try {
                                const content = await storageProvider.readFile(file);

                                let character;
                                if (file.endsWith('.yaml')) {
                                    character = parseYaml(content);
                                } else {
                                    character = JSON.parse(content);
                                }

                                if (character.name && character.id) {
                                    characters.push(character);
                                }
                            } catch (fileError) {
                                logger.debug(`Failed to load character file ${file}`, { fileError });
                            }
                        }
                    }
                } else {
                    logger.debug(`Character directory does not exist: ${basePath}`);
                }
            } catch (pathError) {
                logger.debug(`Path ${basePath} not accessible`, { pathError });
            }
        }

        return characters;
    }

    /**
     * マスターレコードの保存（🆕 同期版storageProvider使用）
     */
    async saveMasterRecords(): Promise<void> {
        try {
            const masterPath = 'data/long-term-memory/knowledge/characters/master-records.json';
            const records = Array.from(this.masterRecords.values());

            await storageProvider.writeFile(masterPath, JSON.stringify(records, null, 2));
            logger.debug('Master records saved successfully');
        } catch (error) {
            logger.error('Failed to save master records', { error });
            // セーブに失敗してもシステムは続行
        }
    }

    // ============================================================================
    // 🆕 ConsolidationGuard統合（改良版）
    // ============================================================================

    /**
     * 🆕 リトライ機能付きキャラクター統合処理（同期版対応）
     */
    private async performCharacterConsolidationWithRetry(): Promise<void> {
        const guard = ConsolidationGuard.getInstance();
        const operationId = `character-consolidation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // 🆕 競合チェック（タイムアウト付き）
        let consolidationAttempts = 0;
        const MAX_CONSOLIDATION_ATTEMPTS = 5;
        
        while (consolidationAttempts < MAX_CONSOLIDATION_ATTEMPTS) {
            const check = guard.canStartConsolidation('character-consolidation');
            
            if (check.allowed) {
                const consolidationId = guard.startConsolidation('character-consolidation', operationId);
                
                try {
                    await this.performActualConsolidation();
                    logger.info('Character consolidation completed successfully');
                    return;
                } catch (error) {
                    logger.error('Failed to perform character consolidation', { error });
                    throw error;
                } finally {
                    guard.endConsolidation(consolidationId, 'character-consolidation');
                }
            } else {
                consolidationAttempts++;
                logger.debug(`Consolidation blocked, attempt ${consolidationAttempts}`, { 
                    reason: check.reason 
                });
                
                if (consolidationAttempts >= MAX_CONSOLIDATION_ATTEMPTS) {
                    logger.warn('Max consolidation attempts reached, forcing consolidation');
                    // 🆕 強制的に統合を実行（デッドロック回避）
                    await this.performActualConsolidation();
                    return;
                }
                
                // 待機してリトライ
                await this.sleep(500 * consolidationAttempts);
            }
        }
    }

    /**
     * 🆕 実際の統合処理（同期版storageProvider対応）
     */
    private async performActualConsolidation(): Promise<void> {
        // CharacterManagerからキャラクター取得（エラーセーフ）
        let managerCharacters: Character[] = [];
        try {
            managerCharacters = await characterManager.getAllCharacters();
        } catch (error) {
            logger.warn('Failed to get characters from CharacterManager', { error });
        }

        // ストレージファイルからキャラクター取得（エラーセーフ）
        let storageCharacters: Character[] = [];
        try {
            storageCharacters = await this.loadCharactersFromStorageWithFallback();
        } catch (error) {
            logger.warn('Failed to get characters from storage', { error });
        }

        // 統合処理実行
        if (managerCharacters.length > 0 || storageCharacters.length > 0) {
            await this.consolidateCharacterSources(managerCharacters, storageCharacters);
            logger.info(`Consolidated ${managerCharacters.length} manager + ${storageCharacters.length} storage characters`);
        } else {
            logger.info('No characters found for consolidation');
        }
    }

    /**
     * キャラクターソースの統合
     */
    private async consolidateCharacterSources(
        managerCharacters: Character[],
        storageCharacters: Character[]
    ): Promise<void> {
        const consolidationMap = new Map<string, {
            manager?: Character;
            storage?: Character;
            conflicts: CharacterConflictResolution[];
        }>();

        // CharacterManagerのキャラクターをマップに追加
        managerCharacters.forEach(char => {
            try {
                const key = this.generateConsolidationKey(char);
                if (!consolidationMap.has(key)) {
                    consolidationMap.set(key, { conflicts: [] });
                }
                consolidationMap.get(key)!.manager = char;
            } catch (error) {
                logger.warn(`Failed to process manager character: ${char.name}`, { error });
            }
        });

        // ストレージキャラクターをマップに追加
        storageCharacters.forEach(char => {
            try {
                const key = this.generateConsolidationKey(char);
                if (!consolidationMap.has(key)) {
                    consolidationMap.set(key, { conflicts: [] });
                }
                consolidationMap.get(key)!.storage = char;
            } catch (error) {
                logger.warn(`Failed to process storage character: ${char.name}`, { error });
            }
        });

        // 各キャラクターを統合
        for (const [key, sources] of consolidationMap) {
            try {
                const masterRecord = await this.consolidateCharacterData(sources);
                if (masterRecord) {
                    this.masterRecords.set(masterRecord.id, masterRecord);
                    this.nameToIdMap.set(masterRecord.name.toLowerCase(), masterRecord.id);
                }
            } catch (error) {
                logger.warn(`Failed to consolidate character with key: ${key}`, { error });
            }
        }
    }

    /**
     * 統合キーの生成（🆕 エラーセーフ）
     */
    private generateConsolidationKey(character: Character): string {
        if (!character || !character.name) {
            throw new Error('Character name is required for consolidation key');
        }
        return character.name.toLowerCase().replace(/\s+/g, '');
    }

    /**
     * キャラクターデータの統合（修正版・🆕 エラーハンドリング強化）
     */
    private async consolidateCharacterData(sources: {
        manager?: Character;
        storage?: Character;
        conflicts: CharacterConflictResolution[];
    }): Promise<CharacterMasterRecord | null> {
        const { manager, storage, conflicts } = sources;

        if (!manager && !storage) {
            return null;
        }

        try {
            // 優先度: CharacterManager > Storage
            const primary = manager || storage!;
            const secondary = manager ? storage : undefined;

            // 基本情報の統合
            const consolidatedData = this.mergeCharacterBasicData(primary, secondary, conflicts);

            // 必須フィールドの確認と設定
            if (!consolidatedData.id) {
                logger.error('Character ID is missing after consolidation', { primary: primary.name });
                return null;
            }

            // 拡張情報の生成（🆕 エラーセーフ）
            let extendedData;
            try {
                extendedData = await this.generateExtendedCharacterData(consolidatedData);
            } catch (error) {
                logger.warn('Failed to generate extended character data, using defaults', { error });
                extendedData = this.generateMinimalExtendedData(consolidatedData);
            }

            // フォーマット済みデータの生成
            const formattedData = this.generateFormattedCharacterData({
                ...consolidatedData,
                ...extendedData
            });

            // マスターレコードの作成
            const masterRecord: CharacterMasterRecord = {
                // 基本情報（必須フィールド）
                id: consolidatedData.id,
                name: consolidatedData.name,
                type: consolidatedData.type,
                description: consolidatedData.description,

                // 統合メタデータ
                masterVersion: '1.0.0',
                consolidatedFrom: this.generateConsolidationSources(manager, storage),
                lastConsolidated: new Date().toISOString(),
                conflictResolutions: conflicts,

                // 拡張情報
                personality: extendedData.personality,
                backstory: extendedData.backstory,
                relationships: extendedData.relationships,
                state: extendedData.state,

                // 履歴情報
                developmentHistory: extendedData.developmentHistory,
                appearanceHistory: extendedData.appearanceHistory,
                changeHistory: extendedData.changeHistory,

                // 統計情報
                statistics: extendedData.statistics,

                // フォーマット済みデータ
                formattedData,

                // メタデータ
                metadata: this.generateCharacterMetadata(consolidatedData)
            };

            return masterRecord;
        } catch (error) {
            logger.error('Failed to consolidate character data', { 
                error,
                managerChar: manager?.name,
                storageChar: storage?.name
            });
            return null;
        }
    }

    /**
     * キャラクター基本データのマージ（修正版）
     */
    private mergeCharacterBasicData(
        primary: Character,
        secondary: Character | undefined,
        conflicts: CharacterConflictResolution[]
    ): { id: string; name: string; type: CharacterType; description: string } {
        const merged = {
            id: primary.id,
            name: primary.name,
            type: primary.type,
            description: primary.description
        };

        if (secondary) {
            // 説明の競合チェック
            if (secondary.description &&
                secondary.description !== primary.description &&
                secondary.description.length > primary.description.length) {

                conflicts.push({
                    conflictType: 'description',
                    sourceA: 'CharacterManager',
                    sourceB: 'Storage',
                    conflictData: {
                        primary: primary.description,
                        secondary: secondary.description
                    },
                    resolution: secondary.description,
                    resolutionMethod: 'auto',
                    resolvedAt: new Date().toISOString(),
                    resolvedBy: 'CharacterDatabase'
                });

                merged.description = secondary.description;
            }

            // タイプの競合チェック
            if (secondary.type && secondary.type !== primary.type) {
                conflicts.push({
                    conflictType: 'type',
                    sourceA: 'CharacterManager',
                    sourceB: 'Storage',
                    conflictData: {
                        primary: primary.type,
                        secondary: secondary.type
                    },
                    resolution: primary.type, // CharacterManagerを優先
                    resolutionMethod: 'priority',
                    resolvedAt: new Date().toISOString(),
                    resolvedBy: 'CharacterDatabase'
                });
            }
        }

        return merged;
    }

    /**
     * 拡張キャラクターデータの生成（修正版）
     */
    private async generateExtendedCharacterData(
        basicData: { id: string; name: string; type: CharacterType; description: string }
    ): Promise<{
        personality: CharacterPersonality;
        backstory: CharacterBackstory;
        relationships: CharacterRelationship[];
        state: ExtendedCharacterState;
        developmentHistory: CharacterDevelopmentRecord[];
        appearanceHistory: CharacterAppearanceRecord[];
        changeHistory: CharacterChangeRecord[];
        statistics: CharacterStatistics;
    }> {
        return {
            personality: await this.generatePersonalityData(basicData),
            backstory: await this.generateBackstoryData(basicData),
            relationships: await this.generateRelationshipData(basicData),
            state: await this.generateExtendedStateData(basicData),
            developmentHistory: await this.generateDevelopmentHistory(basicData),
            appearanceHistory: await this.generateAppearanceHistory(basicData),
            changeHistory: await this.generateChangeHistory(basicData),
            statistics: await this.generateStatistics(basicData)
        };
    }

    /**
     * 🆕 最小限の拡張データ生成（フォールバック用）
     */
    private generateMinimalExtendedData(
        basicData: { id: string; name: string; type: CharacterType; description: string }
    ) {
        return {
            personality: {
                traits: [],
                coreValues: [],
                motivations: [],
                fears: [],
                habits: [],
                speechPatterns: [],
                emotionalRange: {
                    dominant: 'neutral' as const,
                    secondary: ['curiosity'],
                    triggers: {},
                    expressions: {}
                },
                socialBehavior: {
                    leadership: 5,
                    cooperation: 5,
                    empathy: 5,
                    assertiveness: 5,
                    socialEnergy: 5
                }
            },
            backstory: {
                summary: basicData.description || '',
                keyEvents: [],
                significantRelationships: [],
                formativeExperiences: [],
                secrets: [],
                regrets: [],
                achievements: []
            },
            relationships: [],
            state: {
                isActive: true,
                relationships: [],
                developmentStage: 0,
                lastAppearance: 1,
                emotionalState: 'NEUTRAL' as const,
                summary: basicData.description,
                significance: 5,
                hasDialogue: false,
                changes: [],
                development: '初期状態',
                isDeceased: false,
                maritalStatus: 'unknown' as const,
                spouseId: null,
                parentIds: [],
                childrenIds: [],
                location: '',
                lastStateChange: undefined,
                parameters: [],
                skill: [],
                activeGrowthPlanId: undefined,
                completedGrowthPlans: [],
                growthPhaseHistory: [],
                promotionHistory: [],
                injuries: [],
                health: 80,
                transformations: [],
                forms: [],
                currentForm: undefined,
                skills: [],
                detailedEmotionalState: {
                    primary: 'neutral',
                    secondary: [],
                    intensity: 5,
                    stability: 5,
                    triggers: [],
                    coping: [],
                    lastChange: new Date().toISOString(),
                    influences: []
                },
                physicalCondition: {
                    health: 8,
                    energy: 7,
                    fitness: 6,
                    injuries: [],
                    disabilities: [],
                    appearance: {
                        height: '',
                        build: '',
                        hairColor: '',
                        eyeColor: '',
                        distinctiveFeatures: [],
                        style: '',
                        mannerisms: []
                    }
                },
                mentalCondition: {
                    clarity: 7,
                    focus: 7,
                    stress: 3,
                    confidence: 6,
                    mentalIssues: [],
                    copingMechanisms: []
                },
                socialStatus: {
                    reputation: 5,
                    influence: 3,
                    connections: 4,
                    socialCircles: [],
                    roles: [],
                    responsibilities: []
                },
                abilities: [],
                knowledge: [],
                possessions: [],
                resources: [],
                obligations: [],
                currentGoals: [],
                motivations: [],
                conflicts: []
            } as ExtendedCharacterState,
            developmentHistory: [],
            appearanceHistory: [],
            changeHistory: [],
            statistics: {
                totalAppearances: 0,
                totalScreenTime: 0,
                averageSignificance: 5,
                relationshipCount: 0,
                developmentEvents: 0,
                conflictInvolvement: 0,
                lastActivity: new Date().toISOString(),
                firstAppearance: 1,
                peakChapter: 1,
                trendingTopics: []
            }
        };
    }

    /**
     * 性格データの生成
     */
    private async generatePersonalityData(
        basicData: { id: string; name: string; type: CharacterType; description: string }
    ): Promise<CharacterPersonality> {
        // 既存データから性格特性を抽出
        const traits = this.extractTraitsFromDescription(basicData.description || '');

        return {
            traits,
            coreValues: this.inferCoreValues(traits),
            motivations: this.inferMotivations(basicData.type || 'MAIN'),
            fears: this.inferFears(traits),
            habits: [],
            speechPatterns: [],
            emotionalRange: {
                dominant: 'neutral',
                secondary: ['curiosity', 'determination'],
                triggers: {},
                expressions: {}
            },
            socialBehavior: {
                leadership: this.inferLeadership(basicData.type || 'MAIN'),
                cooperation: 5,
                empathy: 5,
                assertiveness: 5,
                socialEnergy: 5
            }
        };
    }

    /**
     * 背景データの生成
     */
    private async generateBackstoryData(
        basicData: { id: string; name: string; type: CharacterType; description: string }
    ): Promise<CharacterBackstory> {
        return {
            summary: basicData.description || '',
            keyEvents: [],
            significantRelationships: [],
            formativeExperiences: [],
            secrets: [],
            regrets: [],
            achievements: []
        };
    }

    /**
     * 関係性データの生成
     */
    private async generateRelationshipData(
        basicData: { id: string; name: string; type: CharacterType; description: string }
    ): Promise<CharacterRelationship[]> {
        const relationships: CharacterRelationship[] = [];

        // 他のキャラクターとの関係を推定
        for (const [otherId, otherRecord] of this.masterRecords) {
            if (otherId === basicData.id) continue;

            const relationship = this.inferRelationship(basicData, otherRecord);
            if (relationship) {
                relationships.push(relationship);
            }
        }

        return relationships;
    }

    /**
     * 拡張状態データの生成（修正版）
     */
    private async generateExtendedStateData(
        basicData: { id: string; name: string; type: CharacterType; description: string }
    ): Promise<ExtendedCharacterState> {
        return {
            // CharacterState から継承されるプロパティ
            isActive: true,
            relationships: [],
            developmentStage: 0,
            lastAppearance: 1,
            emotionalState: 'NEUTRAL',
            summary: basicData.description,
            significance: this.calculateImportanceScore(basicData.type),
            hasDialogue: false,
            changes: [],
            development: '初期状態', // 修正: 必須プロパティを追加
            isDeceased: false,
            maritalStatus: 'unknown',
            spouseId: null,
            parentIds: [],
            childrenIds: [],
            location: '',
            lastStateChange: undefined,
            parameters: [],
            skill: [],
            activeGrowthPlanId: undefined,
            completedGrowthPlans: [],
            growthPhaseHistory: [],
            promotionHistory: [],
            injuries: [],
            health: 80,
            transformations: [],
            forms: [],
            currentForm: undefined,

            // ExtendedCharacterState 独自のプロパティ
            skills: [], // 修正: SkillRecord[] 型
            detailedEmotionalState: {
                primary: 'neutral',
                secondary: [],
                intensity: 5,
                stability: 5,
                triggers: [],
                coping: [],
                lastChange: new Date().toISOString(),
                influences: []
            },
            physicalCondition: {
                health: 8,
                energy: 7,
                fitness: 6,
                injuries: [],
                disabilities: [],
                appearance: {
                    height: '',
                    build: '',
                    hairColor: '',
                    eyeColor: '',
                    distinctiveFeatures: [],
                    style: '',
                    mannerisms: []
                }
            },
            mentalCondition: {
                clarity: 7,
                focus: 7,
                stress: 3,
                confidence: 6,
                mentalIssues: [],
                copingMechanisms: []
            },
            socialStatus: {
                reputation: 5,
                influence: 3,
                connections: 4,
                socialCircles: [],
                roles: [],
                responsibilities: []
            },
            abilities: [],
            knowledge: [],
            possessions: [],
            resources: [],
            obligations: [],
            currentGoals: [],
            motivations: [],
            conflicts: []
        };
    }

    /**
     * 開発履歴の生成
     */
    private async generateDevelopmentHistory(
        basicData: { id: string; name: string; type: CharacterType; description: string }
    ): Promise<CharacterDevelopmentRecord[]> {
        return [];
    }

    /**
     * 登場履歴の生成
     */
    private async generateAppearanceHistory(
        basicData: { id: string; name: string; type: CharacterType; description: string }
    ): Promise<CharacterAppearanceRecord[]> {
        return [];
    }

    /**
     * 変更履歴の生成
     */
    private async generateChangeHistory(
        basicData: { id: string; name: string; type: CharacterType; description: string }
    ): Promise<CharacterChangeRecord[]> {
        return [];
    }

    /**
     * 統計の生成
     */
    private async generateStatistics(
        basicData: { id: string; name: string; type: CharacterType; description: string }
    ): Promise<CharacterStatistics> {
        return {
            totalAppearances: 0,
            totalScreenTime: 0,
            averageSignificance: 5,
            relationshipCount: 0,
            developmentEvents: 0,
            conflictInvolvement: 0,
            lastActivity: new Date().toISOString(),
            firstAppearance: 1,
            peakChapter: 1,
            trendingTopics: []
        };
    }

    /**
     * フォーマット済みデータの生成
     */
    private generateFormattedCharacterData(
        extendedData: Partial<CharacterMasterRecord>
    ): FormattedCharacterData {
        const name = extendedData.name || 'Unknown';
        const description = extendedData.description || '';
        const personality = extendedData.personality;

        return {
            shortDescription: `${name}: ${description.substring(0, 100)}...`,
            mediumDescription: `${name}は${description}`,
            longDescription: this.generateLongDescription(extendedData),
            personalityProfile: this.generatePersonalityProfile(personality),
            relationshipSummary: this.generateRelationshipSummary(extendedData.relationships || []),
            backgroundSummary: extendedData.backstory?.summary || '',
            currentStatusSummary: this.generateStatusSummary(extendedData.state),
            developmentArc: this.generateDevelopmentArc(extendedData.developmentHistory || []),
            keyQuotes: [],
            characterTags: this.generateCharacterTags(extendedData),
            lastFormatted: new Date().toISOString()
        };
    }

    /**
     * キャラクターメタデータの生成
     */
    private generateCharacterMetadata(
        basicData: { id: string; name: string; type: CharacterType; description: string }
    ): CharacterMetadata {
        return {
            createdAt: new Date().toISOString(),
            createdBy: 'CharacterDatabase',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'CharacterDatabase',
            version: '1.0.0',
            locked: false,
            archivalStatus: 'active',
            importanceScore: this.calculateImportanceScore(basicData.type || 'MOB'),
            narrativeRole: this.inferNarrativeRole(basicData.type || 'MOB'),
            tags: [],
            notes: []
        };
    }

    /**
     * 統合ソース情報の生成
     */
    private generateConsolidationSources(
        manager: Character | undefined,
        storage: Character | undefined
    ): ConsolidationSource[] {
        const sources: ConsolidationSource[] = [];

        if (manager) {
            sources.push({
                source: 'CharacterManager',
                sourceId: manager.id,
                lastUpdated: new Date().toISOString(),
                priority: 10,
                reliability: 9
            });
        }

        if (storage) {
            sources.push({
                source: 'StorageFiles',
                sourceId: storage.id,
                lastUpdated: new Date().toISOString(),
                priority: 5,
                reliability: 7
            });
        }

        return sources;
    }

    // ============================================================================
    // ストレージ管理（🆕 フォールバック機能強化）
    // ============================================================================


    /**
     * インデックスの構築
     */
    private buildIndices(): void {
        this.nameToIdMap.clear();
        this.relationshipIndex.clear();

        for (const [id, record] of this.masterRecords) {
            // 名前インデックス
            this.nameToIdMap.set(record.name.toLowerCase(), id);

            // 関係性インデックス
            const relatedIds: string[] = [];
            record.relationships.forEach(rel => {
                relatedIds.push(rel.targetCharacterId);
            });
            this.relationshipIndex.set(id, relatedIds);
        }
    }

    // ============================================================================
    // パブリックAPI
    // ============================================================================

    /**
     * 統合キャラクター情報を取得（フォーマット済み）
     */
    async getConsolidatedCharacterInfo(characterId: string): Promise<CharacterMasterRecord | null> {
        if (!this.initialized) {
            await this.initialize();
        }

        return this.masterRecords.get(characterId) || null;
    }

    /**
     * 名前でキャラクター取得
     */
    async getCharacterByName(name: string): Promise<CharacterMasterRecord | null> {
        if (!this.initialized) {
            await this.initialize();
        }

        const id = this.nameToIdMap.get(name.toLowerCase());
        return id ? this.masterRecords.get(id) || null : null;
    }

    /**
     * 全キャラクター取得
     */
    async getAllCharacters(): Promise<CharacterMasterRecord[]> {
        if (!this.initialized) {
            await this.initialize();
        }

        return Array.from(this.masterRecords.values());
    }

    /**
     * タイプ別キャラクター取得
     */
    async getCharactersByType(type: CharacterType): Promise<CharacterMasterRecord[]> {
        if (!this.initialized) {
            await this.initialize();
        }

        return Array.from(this.masterRecords.values()).filter(char => char.type === type);
    }

    /**
     * 関係性でキャラクター取得
     */
    async getRelatedCharacters(characterId: string): Promise<CharacterMasterRecord[]> {
        if (!this.initialized) {
            await this.initialize();
        }

        const relatedIds = this.relationshipIndex.get(characterId) || [];
        const relatedCharacters: CharacterMasterRecord[] = [];

        for (const id of relatedIds) {
            const character = this.masterRecords.get(id);
            if (character) {
                relatedCharacters.push(character);
            }
        }

        return relatedCharacters;
    }

    /**
     * キャラクター更新
     */
    async updateCharacter(characterId: string, updates: Partial<CharacterMasterRecord>): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        const existing = this.masterRecords.get(characterId);
        if (!existing) {
            throw new Error(`Character with ID ${characterId} not found`);
        }

        // 変更履歴の記録
        const changeRecord: CharacterChangeRecord = {
            recordId: `change-${Date.now()}`,
            chapterNumber: 0, // 手動更新
            changeType: 'metadata',
            fieldChanged: Object.keys(updates).join(', '),
            previousValue: existing,
            newValue: updates,
            reason: 'Manual update',
            source: 'CharacterDatabase',
            timestamp: new Date().toISOString(),
            significance: 5
        };

        // 更新適用
        const updated = { ...existing, ...updates };
        updated.changeHistory.push(changeRecord);
        updated.metadata.lastUpdated = new Date().toISOString();
        updated.metadata.version = this.incrementVersion(existing.metadata.version);

        this.masterRecords.set(characterId, updated);
        await this.saveMasterRecords();

        logger.info(`Character updated: ${updated.name}`);
    }

    /**
     * フォーマット済みデータの再生成
     */
    async refreshFormattedData(characterId: string): Promise<void> {
        const character = this.masterRecords.get(characterId);
        if (!character) {
            return;
        }

        character.formattedData = this.generateFormattedCharacterData(character);
        character.formattedData.lastFormatted = new Date().toISOString();

        await this.saveMasterRecords();
    }

    /**
     * 統合診断
     */
    async diagnoseConsolidation(): Promise<{
        totalCharacters: number;
        conflictCount: number;
        lastConsolidation: string;
        sourceCoverage: { manager: number; storage: number };
        recommendations: string[];
    }> {
        const recommendations: string[] = [];
        let conflictCount = 0;
        let managerCount = 0;
        let storageCount = 0;

        for (const record of this.masterRecords.values()) {
            conflictCount += record.conflictResolutions.length;

            record.consolidatedFrom.forEach(source => {
                if (source.source === 'CharacterManager') managerCount++;
                if (source.source === 'StorageFiles') storageCount++;
            });
        }

        if (conflictCount > 0) {
            recommendations.push(`${conflictCount}件の競合が解決されています。詳細確認を推奨します`);
        }

        const daysSinceConsolidation = Math.floor(
            (Date.now() - new Date(this.lastConsolidationTime).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceConsolidation > 7) {
            recommendations.push('統合処理から7日以上経過しています。再統合を検討してください');
        }

        return {
            totalCharacters: this.masterRecords.size,
            conflictCount,
            lastConsolidation: this.lastConsolidationTime,
            sourceCoverage: { manager: managerCount, storage: storageCount },
            recommendations
        };
    }

    // ============================================================================
    // ヘルパーメソッド
    // ============================================================================

    /**
     * 🆕 待機ユーティリティ
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 説明から特性を抽出
     */
    private extractTraitsFromDescription(description: string): string[] {
        const traits: string[] = [];
        const traitKeywords = [
            '優しい', '厳しい', '明るい', '暗い', '積極的', '消極的',
            '真面目', '自由奔放', '責任感がある', '楽観的', '悲観的'
        ];

        traitKeywords.forEach(trait => {
            if (description.includes(trait)) {
                traits.push(trait);
            }
        });

        return traits;
    }

    /**
     * 核心価値の推定
     */
    private inferCoreValues(traits: string[]): string[] {
        const values: string[] = [];

        if (traits.includes('優しい') || traits.includes('責任感がある')) {
            values.push('思いやり');
        }
        if (traits.includes('真面目')) {
            values.push('誠実性');
        }
        if (traits.includes('積極的')) {
            values.push('向上心');
        }

        return values.length > 0 ? values : ['正義', '友情'];
    }

    /**
     * 動機の推定
     */
    private inferMotivations(type: CharacterType): string[] {
        switch (type) {
            case 'MAIN':
                return ['目標達成', '自己成長', '仲間を守る'];
            case 'SUB':
                return ['主人公を支援', '自己の問題解決'];
            case 'MOB':
                return ['日常生活の維持'];
            default:
                return ['生存'];
        }
    }

    /**
     * 恐怖の推定
     */
    private inferFears(traits: string[]): string[] {
        if (traits.includes('消極的')) {
            return ['失敗', '拒絶'];
        }
        if (traits.includes('責任感がある')) {
            return ['期待を裏切ること'];
        }
        return ['不明'];
    }

    /**
     * リーダーシップの推定
     */
    private inferLeadership(type: CharacterType): number {
        switch (type) {
            case 'MAIN': return 8;
            case 'SUB': return 5;
            case 'MOB': return 2;
            default: return 3;
        }
    }

    /**
     * 関係性の推定
     */
    private inferRelationship(
        char1: { id: string; name: string; type: CharacterType; description: string },
        char2: CharacterMasterRecord
    ): CharacterRelationship | null {
        // 簡単な関係性推定ロジック
        if (!char1.id || !char2.id) return null;

        return {
            relationshipId: `rel-${char1.id}-${char2.id}`,
            targetCharacterId: char2.id,
            targetCharacterName: char2.name,
            relationshipType: 'acquaintance',
            currentStatus: {
                status: 'neutral',
                intensity: 3,
                trust: 3,
                understanding: 3,
                conflict: 2,
                dependency: 1,
                lastInteraction: new Date().toISOString()
            },
            history: [],
            dynamics: {
                powerBalance: 0,
                emotionalConnection: 3,
                commonGoals: [],
                conflictSources: [],
                interactionPatterns: [],
                growthPotential: 5
            },
            metadata: {
                established: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                significance: 3,
                narrativeRole: 'background',
                tags: []
            }
        };
    }

    /**
     * 長い説明の生成
     */
    private generateLongDescription(data: Partial<CharacterMasterRecord>): string {
        let description = data.description || '';

        if (data.personality) {
            description += `\n\n性格: ${data.personality.traits.join('、')}`;
            if (data.personality.coreValues.length > 0) {
                description += `\n価値観: ${data.personality.coreValues.join('、')}`;
            }
        }

        if (data.backstory?.summary) {
            description += `\n\n背景: ${data.backstory.summary}`;
        }

        return description;
    }

    /**
     * 性格プロファイルの生成
     */
    private generatePersonalityProfile(personality?: CharacterPersonality): string {
        if (!personality) return '不明';

        let profile = `特性: ${personality.traits.join('、')}`;

        if (personality.coreValues.length > 0) {
            profile += `\n価値観: ${personality.coreValues.join('、')}`;
        }

        if (personality.motivations.length > 0) {
            profile += `\n動機: ${personality.motivations.join('、')}`;
        }

        return profile;
    }

    /**
     * 関係性要約の生成
     */
    private generateRelationshipSummary(relationships: CharacterRelationship[]): string {
        if (relationships.length === 0) return '特筆すべき関係性なし';

        const summary = relationships
            .slice(0, 3)
            .map(rel => `${rel.targetCharacterName}（${rel.relationshipType}）`)
            .join('、');

        return `主な関係: ${summary}`;
    }

    /**
     * 状態要約の生成
     */
    private generateStatusSummary(state?: ExtendedCharacterState): string {
        if (!state) return '状態不明';

        return `活動: ${state.isActive ? 'アクティブ' : '非アクティブ'}、` +
            `感情: ${state.emotionalState}、` +
            `場所: ${state.location || '不明'}`;
    }

    /**
     * 開発アークの生成
     */
    private generateDevelopmentArc(history: CharacterDevelopmentRecord[]): string {
        if (history.length === 0) return '開発履歴なし';

        return `${history.length}回の開発イベント`;
    }

    /**
     * キャラクタータグの生成
     */
    private generateCharacterTags(data: Partial<CharacterMasterRecord>): string[] {
        const tags: string[] = [];

        if (data.type) {
            tags.push(data.type.toLowerCase());
        }

        if (data.personality?.traits) {
            tags.push(...data.personality.traits.slice(0, 3));
        }

        return tags;
    }

    /**
     * 重要度スコアの計算
     */
    private calculateImportanceScore(type: CharacterType): number {
        switch (type) {
            case 'MAIN': return 10;
            case 'SUB': return 7;
            case 'MOB': return 3;
            default: return 5;
        }
    }

    /**
     * 物語役割の推定
     */
    private inferNarrativeRole(type: CharacterType): string {
        switch (type) {
            case 'MAIN': return 'protagonist';
            case 'SUB': return 'supporting';
            case 'MOB': return 'background';
            default: return 'undefined';
        }
    }

    /**
     * バージョンの増分
     */
    private incrementVersion(version: string): string {
        const parts = version.split('.');
        const patch = parseInt(parts[2] || '0') + 1;
        return `${parts[0]}.${parts[1]}.${patch}`;
    }

    /**
     * 全データ保存
     */
    async save(): Promise<void> {
        await this.saveMasterRecords();
    }

    /**
     * 🆕 状態取得（診断用）
     */
    async getStatus(): Promise<{
        initialized: boolean;
        characterCount: number;
        lastConsolidation: string;
        conflictCount: number;
        relationshipCount: number;
    }> {
        let conflictCount = 0;
        let relationshipCount = 0;

        for (const record of this.masterRecords.values()) {
            conflictCount += record.conflictResolutions.length;
            relationshipCount += record.relationships.length;
        }

        return {
            initialized: this.initialized,
            characterCount: this.masterRecords.size,
            lastConsolidation: this.lastConsolidationTime,
            conflictCount,
            relationshipCount
        };
    }
}