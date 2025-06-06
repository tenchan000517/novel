// src/lib/learning-journey/concept-learning-manager.ts

/**
 * @fileoverview 概念学習管理（統合記憶階層システム対応版）
 * @description
 * ビジネス概念の定義と学習段階を管理するコンポーネント。
 * 新しい統合記憶階層システムに完全対応し、学習段階の追跡、進捗分析、体現化プランの生成を担当する。
 * MemoryManagerとの統合により、概念情報の永続化と高速アクセスを実現。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { EventBus } from './event-bus';
import { Chapter } from '@/types/chapters';

// 新統合記憶階層システムのインポート
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { 
    MemoryLevel, 
    UnifiedSearchResult,
    MemoryAccessRequest,
    MemoryRequestType 
} from '@/lib/memory/core/types';



/**
 * 学習段階の列挙型
 */
export enum LearningStage {
    MISCONCEPTION = 'MISCONCEPTION',   // 誤解段階
    EXPLORATION = 'EXPLORATION',       // 探索段階
    CONFLICT = 'CONFLICT',             // 葛藤段階
    INSIGHT = 'INSIGHT',               // 気づき段階
    APPLICATION = 'APPLICATION',       // 応用段階
    INTEGRATION = 'INTEGRATION',       // 統合段階
    // 新しいビジネス学習特化段階
    INTRODUCTION = 'INTRODUCTION',     // 導入段階（フレームワーク紹介）
    THEORY_APPLICATION = 'THEORY_APPLICATION', // 理論適用段階
    FAILURE_EXPERIENCE = 'FAILURE_EXPERIENCE', // 失敗体験段階
    PRACTICAL_MASTERY = 'PRACTICAL_MASTERY'   // 実践習得段階
}

/**
 * 体現化プランのインターフェース
 */
export interface EmbodimentPlan {
    conceptName: string;                // 概念名
    stage: LearningStage;               // 学習段階
    chapterNumber: number;              // 章番号
    expressionMethods: string[];        // 表現方法
    keyElements: string[];              // 重要要素
    dialogueSuggestions: string[];      // 対話例
    tensionRecommendation: {            // テンション推奨
        recommendedTension: number;       // 推奨テンション (0-1)
        reason: string;                   // 理由
        direction: 'increase' | 'decrease' | 'maintain' | 'peak'; // 方向
    };
}

/**
 * 概念情報のインターフェース
 */
export interface BusinessConcept {
    name: string;                       // 概念名
    description: string;                // 説明
    keyPrinciples: string[];            // 主要原則
    commonMisconceptions: string[];     // 一般的な誤解
    applicationAreas: string[];         // 適用領域
    relatedConcepts: string[];          // 関連概念
    learningJourney?: {                 // 学習旅程
        [stage in LearningStage]?: string;
    };
    transformationalElements?: {        // 変容要素
        [fromStage: string]: {
            [toStage: string]: string[];
        };
    };
    learningRecords?: Array<{           // 学習記録
        stage: LearningStage;             // 学習段階
        chapterNumber: number;            // 章番号
        insights?: string[];              // 洞察
        examples?: string[];              // 例
    }>;
    created: string;                    // 作成日時
    updated: string;                    // 更新日時
}

/**
 * 学習記録のインターフェース
 */
export interface LearningRecord {
    stage: LearningStage;               // 学習段階
    chapterNumber: number;              // 章番号
    insights?: string[];                // 洞察
    examples?: string[];                // 例
}

/**
 * 統合記憶システム操作結果
 */
interface ConceptMemoryOperationResult {
    success: boolean;
    processingTime: number;
    source: 'cache' | 'unified-search' | 'long-term';
    error?: string;
    metadata?: {
        cacheHit?: boolean;
        searchResults?: number;
        duplicatesResolved?: number;
    };
}

/**
 * 概念学習統計情報
 */
interface ConceptLearningStatistics {
    totalConcepts: number;
    conceptsByStage: Record<LearningStage, number>;
    learningProgression: {
        averageProgressionRate: number;
        stageTransitions: number;
        completedJourneys: number;
    };
    memorySystemIntegration: {
        totalMemoryOperations: number;
        cacheHitRate: number;
        averageRetrievalTime: number;
    };
    lastOptimization: string;
}

/**
 * @class ConceptLearningManager
 * @description
 * ビジネス概念の定義と学習段階を管理するクラス。
 * 新しい統合記憶階層システムに完全対応し、高度な概念管理機能を提供。
 */
export class ConceptLearningManager {
    private concepts: Map<string, BusinessConcept> = new Map();
    private initialized: boolean = false;
    
    // パフォーマンス統計
    private performanceStats: ConceptLearningStatistics = {
        totalConcepts: 0,
        conceptsByStage: {
            [LearningStage.MISCONCEPTION]: 0,
            [LearningStage.EXPLORATION]: 0,
            [LearningStage.CONFLICT]: 0,
            [LearningStage.INSIGHT]: 0,
            [LearningStage.APPLICATION]: 0,
            [LearningStage.INTEGRATION]: 0
        },
        learningProgression: {
            averageProgressionRate: 0,
            stageTransitions: 0,
            completedJourneys: 0
        },
        memorySystemIntegration: {
            totalMemoryOperations: 0,
            cacheHitRate: 0,
            averageRetrievalTime: 0
        },
        lastOptimization: new Date().toISOString()
    };

    /**
     * コンストラクタ - 依存注入パターンの完全実装
     * @param memoryManager 統合記憶管理システム
     * @param geminiClient AIによる学習分析用クライアント
     * @param eventBus イベントバス
     */
    constructor(
        private memoryManager: MemoryManager,
        private geminiClient: GeminiClient,
        private eventBus: EventBus
    ) {
        // 依存関係の検証
        this.validateDependencies();
        
        logger.info('ConceptLearningManager created with unified memory system integration');
    }

    /**
     * 依存関係の検証
     * @private
     */
    private validateDependencies(): void {
        if (!this.memoryManager) {
            throw new Error('MemoryManager is required for ConceptLearningManager initialization');
        }
        
        if (!this.geminiClient) {
            throw new Error('GeminiClient is required for ConceptLearningManager initialization');
        }
        
        if (!this.eventBus) {
            throw new Error('EventBus is required for ConceptLearningManager initialization');
        }
    }

    /**
     * ライブラリを初期化する
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('ConceptLearningManager already initialized');
            return;
        }

        try {
            logger.info('Initializing ConceptLearningManager with unified memory system...');

            // メモリマネージャーの初期化状態確認
            await this.ensureMemoryManagerInitialized();

            // データが存在するか確認
            const dataExists = await this.safeMemoryOperation(
                () => this.conceptDataExists(),
                false,
                'conceptDataExistenceCheck'
            );

            if (dataExists) {
                // 既存データを読み込む
                await this.loadConceptsFromUnifiedMemory();
            } else {
                // 初期データを生成
                await this.generateAndStoreInitialConceptsData();
            }

            // 統計情報の初期化
            this.updateStatistics();

            this.initialized = true;
            logger.info('ConceptLearningManager initialized successfully', {
                conceptCount: this.concepts.size,
                memorySystemIntegrated: true
            });

            // 初期化完了イベント発行
            this.eventBus.publish('learning.manager.initialized', {
                conceptCount: this.concepts.size,
                memorySystemIntegration: true,
                performanceStats: this.performanceStats
            });

        } catch (error) {
            logger.error('Failed to initialize ConceptLearningManager', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw new Error(`ConceptLearningManager initialization failed: ${error}`);
        }
    }

    /**
     * メモリマネージャーの初期化状態確認
     * @private
     */
    private async ensureMemoryManagerInitialized(): Promise<void> {
        try {
            const systemStatus = await this.memoryManager.getSystemStatus();
            if (!systemStatus.initialized) {
                logger.warn('MemoryManager not initialized, waiting for initialization...');
                // 必要に応じて初期化を待機またはトリガー
            }
        } catch (error) {
            logger.error('Failed to check MemoryManager status', { error });
            throw new Error('MemoryManager is not available');
        }
    }

    /**
     * 概念データが存在するか確認（統合記憶システム対応）
     * @private
     */
    private async conceptDataExists(): Promise<boolean> {
        try {
            const searchResult = await this.memoryManager.unifiedSearch(
                'businessConcepts conceptLearning',
                [MemoryLevel.LONG_TERM]
            );
            
            return searchResult.success && searchResult.totalResults > 0;
            
        } catch (error) {
            logger.error('Error checking concept data existence in unified memory', {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * 統合記憶システムから概念データを読み込む
     * @private
     */
    private async loadConceptsFromUnifiedMemory(): Promise<void> {
        try {
            logger.info('Loading concepts from unified memory system');

            // 統合検索でビジネス概念データを取得
            const searchResult = await this.memoryManager.unifiedSearch(
                'businessConcepts learningStage conceptDefinition',
                [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM]
            );

            if (!searchResult.success || searchResult.totalResults === 0) {
                logger.warn('No business concepts found in unified memory system');
                return;
            }

            // 検索結果から概念データを抽出・統合
            let loadedConcepts = 0;
            
            for (const result of searchResult.results) {
                try {
                    const conceptData = this.extractConceptFromSearchResult(result);
                    if (conceptData) {
                        this.concepts.set(this.normalizeConceptName(conceptData.name), conceptData);
                        loadedConcepts++;
                    }
                } catch (extractError) {
                    logger.warn('Failed to extract concept from search result', {
                        error: extractError instanceof Error ? extractError.message : String(extractError),
                        resultType: result.type,
                        source: result.source
                    });
                }
            }

            logger.info(`Loaded ${loadedConcepts} business concepts from unified memory system`, {
                totalSearchResults: searchResult.totalResults,
                processingTime: searchResult.processingTime
            });

            // 統計情報の更新
            this.performanceStats.memorySystemIntegration.totalMemoryOperations++;
            this.performanceStats.memorySystemIntegration.averageRetrievalTime = 
                (this.performanceStats.memorySystemIntegration.averageRetrievalTime + searchResult.processingTime) / 2;

        } catch (error) {
            logger.error('Failed to load concepts from unified memory', {
                error: error instanceof Error ? error.message : String(error)
            });

            // フォールバック：空のコンセプト集で初期化
            this.concepts = new Map();
        }
    }

    /**
     * 検索結果から概念データを抽出
     * @private
     */
    private extractConceptFromSearchResult(result: any): BusinessConcept | null {
        try {
            if (result.type === 'knowledge' && result.data) {
                // 長期記憶からの概念データ
                if (result.data.businessConcepts && Array.isArray(result.data.businessConcepts)) {
                    return result.data.businessConcepts[0]; // 最初の概念を取得
                }
                
                // 単一概念データの場合
                if (result.data.name && result.data.description) {
                    return this.validateAndNormalizeConcept(result.data);
                }
            }
            
            if (result.type === 'analysis' && result.data) {
                // 中期記憶からの分析結果
                if (result.data.conceptAnalysis) {
                    return this.validateAndNormalizeConcept(result.data.conceptAnalysis);
                }
            }

            return null;
        } catch (error) {
            logger.warn('Failed to extract concept from search result', { error });
            return null;
        }
    }

    /**
     * 概念データの検証と正規化
     * @private
     */
    private validateAndNormalizeConcept(conceptData: any): BusinessConcept {
        const normalized: BusinessConcept = {
            name: conceptData.name || 'Unknown Concept',
            description: conceptData.description || '',
            keyPrinciples: Array.isArray(conceptData.keyPrinciples) ? conceptData.keyPrinciples : [],
            commonMisconceptions: Array.isArray(conceptData.commonMisconceptions) ? conceptData.commonMisconceptions : [],
            applicationAreas: Array.isArray(conceptData.applicationAreas) ? conceptData.applicationAreas : [],
            relatedConcepts: Array.isArray(conceptData.relatedConcepts) ? conceptData.relatedConcepts : [],
            learningJourney: conceptData.learningJourney || {},
            transformationalElements: conceptData.transformationalElements || {},
            learningRecords: Array.isArray(conceptData.learningRecords) ? conceptData.learningRecords : [],
            created: conceptData.created || new Date().toISOString(),
            updated: new Date().toISOString()
        };

        return normalized;
    }

    /**
     * 初期概念データを生成し統合記憶システムに保存
     * @private
     */
    private async generateAndStoreInitialConceptsData(): Promise<void> {
        try {
            logger.info('Generating initial business concepts data for unified memory system');

            // ISSUE DRIVEN概念の定義（完全版）
            const issueDriven: BusinessConcept = {
                name: "ISSUE DRIVEN",
                description: "課題解決を起点としたビジネスアプローチ。顧客の抱える本質的な課題（イシュー）を深く理解し、その解決に焦点を当てたソリューションを提供する考え方。",
                keyPrinciples: [
                    "顧客視点での課題定義",
                    "本質的問いを通じた深い理解",
                    "解決策よりも課題の探求を優先",
                    "顧客と共に考え、共に創る",
                    "継続的な課題再定義と価値提供"
                ],
                commonMisconceptions: [
                    "製品や技術起点の思考",
                    "表面的なニーズへの対応",
                    "自社の強みや都合を優先",
                    "顧客の言葉をそのまま受け取る",
                    "一度の課題解決で終わらせる"
                ],
                applicationAreas: [
                    "コンサルティング",
                    "プロダクト開発",
                    "マーケティング戦略",
                    "組織開発",
                    "顧客関係管理"
                ],
                relatedConcepts: [
                    "デザインシンキング",
                    "顧客中心主義",
                    "ジョブ理論",
                    "共創",
                    "アジャイル開発"
                ],
                learningJourney: {
                    [LearningStage.MISCONCEPTION]: "製品や技術起点の思考から、自社の強みや都合を優先した提案を行う。表面的なニーズに応えることで価値を提供していると考える。",
                    [LearningStage.EXPLORATION]: "顧客視点の重要性に気づき始め、顧客の言葉や要望を集めようとする。しかし、まだ表面的なニーズの収集に留まることが多い。",
                    [LearningStage.CONFLICT]: "顧客の言葉をそのまま受け取ることの限界に直面し、真の課題と表明された要望の違いに葛藤する。自社の視点と顧客視点の間で揺れ動く。",
                    [LearningStage.INSIGHT]: "顧客の本質的な課題（イシュー）を見極めることの重要性に気づく。表面的な要望の背後にある根本的な問題を探求する必要性を理解する。",
                    [LearningStage.APPLICATION]: "本質的な問いを通じて顧客との対話を深め、共に課題を定義し直す。顧客と共に考え、解決策を模索するプロセスを実践する。",
                    [LearningStage.INTEGRATION]: "課題起点のアプローチが自然な思考習慣となり、常に顧客の本質的課題に焦点を当て、継続的な課題再定義と価値提供のサイクルを回せるようになる。"
                },
                transformationalElements: {
                    "MISCONCEPTION": {
                        "EXPLORATION": [
                            "顧客の声を直接聞く経験",
                            "自社製品が顧客のニーズに合わない場面の発見",
                            "顧客視点の欠如による失敗体験"
                        ]
                    },
                    "EXPLORATION": {
                        "CONFLICT": [
                            "顧客の言葉と真のニーズの乖離の発見",
                            "表面的な要望に応えても満足されない経験",
                            "異なる顧客間で矛盾する要望への遭遇"
                        ]
                    },
                    "CONFLICT": {
                        "INSIGHT": [
                            "本質的な問いを投げかけた時の顧客の反応の変化",
                            "課題の再定義による突破口の発見",
                            "顧客自身も気づいていなかった潜在ニーズの発掘"
                        ]
                    },
                    "INSIGHT": {
                        "APPLICATION": [
                            "顧客との対話方法の意識的な変革",
                            "本質的課題に基づいたソリューション設計の実践",
                            "顧客との共創プロセスの導入"
                        ]
                    },
                    "APPLICATION": {
                        "INTEGRATION": [
                            "課題起点アプローチの日常的な適用",
                            "チーム全体への考え方の浸透",
                            "継続的な価値提供サイクルの確立"
                        ]
                    }
                },
                learningRecords: [],
                created: new Date().toISOString(),
                updated: new Date().toISOString()
            };

            // 概念をローカルマップに保存
            this.concepts.set(this.normalizeConceptName(issueDriven.name), issueDriven);

            // 統合記憶システムに保存
            await this.saveConceptsToUnifiedMemory();

            logger.info(`Generated and stored initial business concept: ${issueDriven.name}`, {
                memorySystemIntegrated: true
            });

        } catch (error) {
            logger.error('Failed to generate and store initial concepts data', {
                error: error instanceof Error ? error.message : String(error)
            })
            throw error;
        }
    }

    /**
     * 概念データを統合記憶システムに保存
     * @private
     */
    private async saveConceptsToUnifiedMemory(): Promise<ConceptMemoryOperationResult> {
        const startTime = Date.now();

        try {
            // 概念データを構造化して保存用に準備
            const conceptsData = {
                businessConcepts: Array.from(this.concepts.values()),
                learningStageLastUpdated: new Date().toISOString(),
                totalConcepts: this.concepts.size,
                metadata: {
                    source: 'ConceptLearningManager',
                    version: '2.0',
                    systemIntegration: true
                }
            };

            // 章形式でのデータ保存（統合記憶システム対応）
            const conceptChapter: Chapter = {
                id: `concept-data-${Date.now()}`,
                chapterNumber: 0, // システムデータは0番
                title: 'Business Concepts Data',
                content: JSON.stringify(conceptsData, null, 2),
                previousChapterSummary: '',
                scenes: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                metadata: {
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    status: 'system_data',
                    dataType: 'businessConcepts',
                    wordCount: JSON.stringify(conceptsData).length,
                    estimatedReadingTime: 1
                }
            };

            // 統合記憶システムで章を処理
            const processResult = await this.memoryManager.processChapter(conceptChapter);

            const processingTime = Date.now() - startTime;

            if (processResult.success) {
                logger.info(`Saved ${this.concepts.size} business concepts to unified memory system`, {
                    processingTime,
                    affectedComponents: processResult.affectedComponents
                });

                return {
                    success: true,
                    processingTime,
                    source: 'unified-search',
                    metadata: {
                        cacheHit: false,
                        searchResults: this.concepts.size,
                        duplicatesResolved: 0
                    }
                };
            } else {
                throw new Error(`Failed to process concept data: ${processResult.errors.join(', ')}`);
            }

        } catch (error) {
            const processingTime = Date.now() - startTime;
            
            logger.error('Failed to save concepts to unified memory system', {
                error: error instanceof Error ? error.message : String(error),
                processingTime
            });

            return {
                success: false,
                processingTime,
                source: 'unified-search',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * 概念の詳細を取得する（統合記憶システム対応）
     * @param conceptName 概念名
     * @returns 概念の詳細情報、見つからない場合はnull
     */
    async getConceptDetails(conceptName: string): Promise<BusinessConcept | null> {
        this.ensureInitialized();

        try {
            // まずローカルキャッシュから検索
            const normalizedName = this.normalizeConceptName(conceptName);
            const localConcept = this.concepts.get(normalizedName);
            
            if (localConcept) {
                this.performanceStats.memorySystemIntegration.cacheHitRate++;
                return localConcept;
            }

            // 統合記憶システムから検索
            const searchResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    `concept "${conceptName}" businessConcept`,
                    [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM]
                ),
                { success: false, totalResults: 0, processingTime: 0, results: [], suggestions: [] },
                'getConceptDetails'
            );

            if (searchResult.success && searchResult.totalResults > 0) {
                // 検索結果から概念を抽出
                for (const result of searchResult.results) {
                    const extractedConcept = this.extractConceptFromSearchResult(result);
                    if (extractedConcept && this.normalizeConceptName(extractedConcept.name) === normalizedName) {
                        // ローカルキャッシュに保存
                        this.concepts.set(normalizedName, extractedConcept);
                        return extractedConcept;
                    }
                }
            }

            // 部分一致検索
            for (const [key, concept] of this.concepts.entries()) {
                if (key.includes(normalizedName) || normalizedName.includes(key)) {
                    return concept;
                }
            }

            return null;

        } catch (error) {
            logger.error(`Failed to get concept details for ${conceptName}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return null;
        }
    }

    /**
     * 全ての概念を取得する
     * @returns 概念オブジェクトの配列
     */
    getAllConcepts(): BusinessConcept[] {
        this.ensureInitialized();
        return Array.from(this.concepts.values());
    }

    /**
     * 学習段階を判断する（統合記憶システム対応）
     * @param conceptName 概念名
     * @param chapterNumber 章番号
     * @returns 学習段階
     */
    async determineLearningStage(
        conceptName: string,
        chapterNumber: number
    ): Promise<LearningStage> {
        try {
            logger.info(`Determining learning stage for concept: ${conceptName} at chapter ${chapterNumber}`);

            // 概念情報を取得
            const concept = await this.getConceptDetails(conceptName);

            if (!concept) {
                logger.warn(`Concept not found: ${conceptName}, using default stage EXPLORATION`);
                return LearningStage.EXPLORATION;
            }

            // 統合記憶システムから学習記録を検索
            const learningHistoryResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    `learningRecord "${conceptName}" chapter`,
                    [MemoryLevel.MID_TERM, MemoryLevel.LONG_TERM]
                ),
                { success: false, totalResults: 0, processingTime: 0, results: [], suggestions: [] },
                'determineLearningStage'
            );

            // 最新の学習記録を取得
            let latestRecord: LearningRecord | null = null;

            if (learningHistoryResult.success && learningHistoryResult.totalResults > 0) {
                // 検索結果から学習記録を抽出
                for (const result of learningHistoryResult.results) {
                    const records = this.extractLearningRecordsFromSearchResult(result, conceptName);
                    for (const record of records) {
                        if (!latestRecord || record.chapterNumber > latestRecord.chapterNumber) {
                            latestRecord = record;
                        }
                    }
                }
            }

            // ローカル記録もチェック
            if (concept.learningRecords && concept.learningRecords.length > 0) {
                const localLatest = concept.learningRecords.sort(
                    (a, b) => b.chapterNumber - a.chapterNumber
                )[0];
                
                if (!latestRecord || localLatest.chapterNumber > latestRecord.chapterNumber) {
                    latestRecord = localLatest;
                }
            }

            // 前回の学習段階が無い場合は初期段階
            if (!latestRecord) {
                logger.info(`No previous learning records for ${conceptName}, using MISCONCEPTION as initial stage`);
                return LearningStage.MISCONCEPTION;
            }

            // 前回の学習段階を取得
            const previousStage = latestRecord.stage;

            // 章番号に基づく自動進行
            if (this.isStageAdvancementChapter(chapterNumber)) {
                const nextStage = this.getNextStage(previousStage);
                logger.info(`Advanced learning stage for ${conceptName}: ${previousStage} -> ${nextStage} at chapter ${chapterNumber}`);
                return nextStage;
            }

            // 変更が無ければ前回の段階を維持
            return previousStage;

        } catch (error) {
            logger.error(`Failed to determine learning stage for ${conceptName}`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            // エラー時はデフォルト値を返す
            return LearningStage.EXPLORATION;
        }
    }

    /**
     * 検索結果から学習記録を抽出
     * @private
     */
    private extractLearningRecordsFromSearchResult(result: any, conceptName: string): LearningRecord[] {
        const records: LearningRecord[] = [];

        try {
            if (result.data && result.data.learningRecords) {
                if (Array.isArray(result.data.learningRecords)) {
                    for (const record of result.data.learningRecords) {
                        if (record.stage && record.chapterNumber) {
                            records.push({
                                stage: record.stage as LearningStage,
                                chapterNumber: record.chapterNumber,
                                insights: record.insights || [],
                                examples: record.examples || []
                            });
                        }
                    }
                }
            }

            // 分析結果から学習記録を抽出
            if (result.data && result.data.conceptAnalysis) {
                const analysis = result.data.conceptAnalysis;
                if (analysis.learningStage && analysis.chapterNumber) {
                    records.push({
                        stage: analysis.learningStage as LearningStage,
                        chapterNumber: analysis.chapterNumber,
                        insights: analysis.insights || [],
                        examples: analysis.examples || []
                    });
                }
            }

        } catch (error) {
            logger.warn('Failed to extract learning records from search result', { error });
        }

        return records;
    }

    /**
     * 特定の概念情報を学習記録で更新する（統合記憶システム対応）
     * @param conceptName 概念名
     * @param learningRecord 学習記録
     * @returns 更新成功の真偽値
     */
    async updateConceptWithLearningRecord(
        conceptName: string,
        learningRecord: LearningRecord
    ): Promise<boolean> {
        this.ensureInitialized();

        try {
            // 概念情報を取得
            const concept = await this.getConceptDetails(conceptName);

            if (!concept) {
                logger.warn(`Cannot update learning record for concept "${conceptName}": concept not found`);
                return false;
            }

            // 学習記録配列を安全に初期化
            if (!concept.learningRecords) {
                concept.learningRecords = [];
            }

            // 学習記録を追加
            concept.learningRecords.push(learningRecord);

            // 章番号でソート
            concept.learningRecords.sort((a, b) => a.chapterNumber - b.chapterNumber);

            // 重複を除去（同じ章番号がある場合は最新を保持）
            const uniqueRecords: LearningRecord[] = [];
            const recordsByChapter = new Map<number, LearningRecord>();

            for (const record of concept.learningRecords) {
                recordsByChapter.set(record.chapterNumber, record);
            }

            for (const record of recordsByChapter.values()) {
                uniqueRecords.push(record);
            }

            concept.learningRecords = uniqueRecords;

            // 更新日時を更新
            concept.updated = new Date().toISOString();

            // Map内の概念を更新
            this.concepts.set(this.normalizeConceptName(concept.name), concept);

            // 統合記憶システムに保存
            const saveResult = await this.saveConceptsToUnifiedMemory();

            if (saveResult.success) {
                // 学習段階変更イベントを発行
                this.eventBus.publish('learning.stage.updated', {
                    conceptName: concept.name,
                    stage: learningRecord.stage,
                    chapterNumber: learningRecord.chapterNumber,
                    memorySystemIntegrated: true
                });

                logger.info(`Updated learning record for concept "${conceptName}" at chapter ${learningRecord.chapterNumber}`, {
                    newStage: learningRecord.stage,
                    memoryIntegrationTime: saveResult.processingTime
                });

                return true;
            } else {
                logger.error(`Failed to save learning record to unified memory system: ${saveResult.error}`);
                return false;
            }

        } catch (error) {
            logger.error(`Failed to update concept with learning record`, {
                conceptName,
                chapterNumber: learningRecord.chapterNumber,
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * 章のための概念体現化計画を取得（統合記憶システム対応・キャラクター連携強化版）
     * @param conceptName 概念名
     * @param chapterNumber 章番号
     * @param characterManager キャラクター管理システム（オプション）
     * @returns 体現化計画
     */
    async getEmbodimentPlan(
        conceptName: string,
        chapterNumber: number,
        characterManager?: any
    ): Promise<EmbodimentPlan> {
        try {
            logger.info(`Getting embodiment plan for concept: ${conceptName} at chapter ${chapterNumber}`);

            // 概念情報を取得
            const concept = await this.getConceptDetails(conceptName);

            if (!concept) {
                logger.warn(`Concept not found: ${conceptName}, using default plan`);
                return this.createDefaultEmbodimentPlan(conceptName, chapterNumber);
            }

            // 現在の学習段階を決定
            const currentStage = await this.determineLearningStage(conceptName, chapterNumber);

            // 関連するコンテキスト情報を統合記憶システムから取得
            const contextResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    `embodiment context chapter ${chapterNumber} ${conceptName}`,
                    [MemoryLevel.SHORT_TERM, MemoryLevel.MID_TERM]
                ),
                { success: false, totalResults: 0, processingTime: 0, results: [], suggestions: [] },
                'getEmbodimentContext'
            );

            // 🎯 キャラクターシステム統合による強化
            let characterIntegrationData = null;
            if (characterManager) {
                characterIntegrationData = await this.integrateCharacterSystemData(
                    characterManager,
                    conceptName,
                    currentStage,
                    chapterNumber
                );
            }

            // 学習段階に応じた体現化計画を作成
            let plan: EmbodimentPlan;

            switch (currentStage) {
                case LearningStage.MISCONCEPTION:
                    plan = this.createMisconceptionPlan(concept, chapterNumber);
                    break;
                case LearningStage.EXPLORATION:
                    plan = this.createExplorationPlan(concept, chapterNumber);
                    break;
                case LearningStage.CONFLICT:
                    plan = this.createConflictPlan(concept, chapterNumber);
                    break;
                case LearningStage.INSIGHT:
                    plan = this.createInsightPlan(concept, chapterNumber);
                    break;
                case LearningStage.APPLICATION:
                    plan = this.createApplicationPlan(concept, chapterNumber);
                    break;
                case LearningStage.INTEGRATION:
                    plan = this.createIntegrationPlan(concept, chapterNumber);
                    break;
                default:
                    plan = this.createExplorationPlan(concept, chapterNumber);
            }

            // コンテキスト情報で計画を強化
            if (contextResult.success && contextResult.totalResults > 0) {
                plan = this.enhancePlanWithContext(plan, contextResult);
            }

            // 🎯 キャラクターシステム統合による計画強化
            if (characterIntegrationData) {
                plan = this.enhancePlanWithCharacterIntegration(plan, characterIntegrationData);
            }

            // 体現化計画イベントを発行
            this.eventBus.publish('embodiment.plan.created', {
                conceptName,
                stage: currentStage,
                chapterNumber,
                planEnhanced: contextResult.success,
                memorySystemIntegrated: true
            });

            logger.info(`Created embodiment plan for ${conceptName} at stage ${currentStage} for chapter ${chapterNumber}`, {
                contextEnhanced: contextResult.success,
                processingTime: contextResult.processingTime
            });

            return plan;

        } catch (error) {
            logger.error(`Failed to get embodiment plan for ${conceptName}`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            // エラー時はデフォルト計画を返す
            return this.createDefaultEmbodimentPlan(conceptName, chapterNumber);
        }
    }

    /**
     * コンテキスト情報で計画を強化
     * @private
     */
    private enhancePlanWithContext(plan: EmbodimentPlan, contextResult: UnifiedSearchResult): EmbodimentPlan {
        try {
            const enhancedPlan = { ...plan };

            // 検索結果からコンテキスト情報を抽出
            for (const result of contextResult.results) {
                if (result.data && result.data.narrativeContext) {
                    // 物語コンテキストに基づく調整
                    const narrativeContext = result.data.narrativeContext;
                    
                    if (narrativeContext.tension && typeof narrativeContext.tension === 'number') {
                        // 物語のテンションに基づいてプランのテンション推奨を調整
                        enhancedPlan.tensionRecommendation.recommendedTension = 
                            Math.min(1.0, Math.max(0.0, 
                                (enhancedPlan.tensionRecommendation.recommendedTension + narrativeContext.tension) / 2
                            ));
                    }
                    
                    if (narrativeContext.characters && Array.isArray(narrativeContext.characters)) {
                        // キャラクター情報に基づく対話例の調整
                        const characterNames = narrativeContext.characters.map((c: any) => c.name || c.id);
                        enhancedPlan.dialogueSuggestions = enhancedPlan.dialogueSuggestions.map(suggestion =>
                            suggestion.replace('【キャラクター】', characterNames[0] || '主人公')
                        );
                    }
                }

                if (result.data && result.data.chapterAnalysis) {
                    // 章分析結果に基づく調整
                    const analysis = result.data.chapterAnalysis;
                    
                    if (analysis.themes && Array.isArray(analysis.themes)) {
                        // テーマに基づく重要要素の追加
                        for (const theme of analysis.themes) {
                            if (!enhancedPlan.keyElements.includes(theme)) {
                                enhancedPlan.keyElements.push(`テーマ連動: ${theme}`);
                            }
                        }
                    }
                }
            }

            return enhancedPlan;

        } catch (error) {
            logger.warn('Failed to enhance plan with context', { error });
            return plan;
        }
    }

    /**
     * 章の内容から概念の体現状況を分析する（統合記憶システム対応）
     * @param conceptName 概念名
     * @param chapterContent 章の内容
     * @param chapterNumber 章番号
     * @returns 分析結果
     */
    async analyzeConceptEmbodiment(
        conceptName: string,
        chapterContent: string,
        chapterNumber: number
    ): Promise<{
        stage: LearningStage,
        examples: string[],
        confidence: number
    }> {
        try {
            logger.info(`Analyzing concept embodiment for ${conceptName} in chapter ${chapterNumber}`);

            // 概念情報を取得
            const concept = await this.getConceptDetails(conceptName);

            if (!concept) {
                logger.warn(`Concept not found for embodiment analysis: ${conceptName}`);
                return {
                    stage: LearningStage.EXPLORATION,
                    examples: [],
                    confidence: 0.5
                };
            }

            // 前回の学習記録を統合記憶システムから取得
            const previousStage = await this.determineLearningStage(conceptName, chapterNumber - 1);

            // 関連する分析結果を統合記憶システムから取得
            const analysisResult = await this.safeMemoryOperation(
                () => this.memoryManager.unifiedSearch(
                    `analysis embodiment "${conceptName}" chapter`,
                    [MemoryLevel.MID_TERM, MemoryLevel.SHORT_TERM]
                ),
                { success: false, totalResults: 0, processingTime: 0, results: [], suggestions: [] },
                'analyzeConceptEmbodiment'
            );

            // AIによる学習段階検出（統合記憶システムのコンテキスト情報を活用）
            let additionalContext = '';
            if (analysisResult.success && analysisResult.totalResults > 0) {
                const contextInfo = analysisResult.results.map(r => 
                    `${r.type}: ${JSON.stringify(r.data).substring(0, 200)}...`
                ).join('\n');
                additionalContext = `\n\n関連分析情報:\n${contextInfo}`;
            }

            const prompt = `
あなたは学習段階検出の専門家です。与えられた章の内容から、概念「${conceptName}」の理解が以下のどの段階にあるかを判断してください。

章の内容:
${chapterContent.substring(0, 5000)}...

前回の学習段階: ${this.formatLearningStage(previousStage)}

概念情報:
- 名前: ${concept.name}
- 説明: ${concept.description}
- 主要原則: ${concept.keyPrinciples.join(', ')}

${additionalContext}

学習段階の説明:
- 誤解段階 (MISCONCEPTION): 概念に対する誤解や限定的な理解の段階
- 探索段階 (EXPLORATION): 新しい視点や可能性を探索し始める段階
- 葛藤段階 (CONFLICT): 新旧の理解の間で葛藤する段階
- 気づき段階 (INSIGHT): 概念の本質に気づく段階
- 応用段階 (APPLICATION): 新しい理解を実践に移す段階
- 統合段階 (INTEGRATION): 概念が自然な思考・行動パターンとなる段階

回答形式:
学習段階: [段階コード]
確信度: [0-1の数値]
理由: [簡潔な説明]
例: [概念が章内で体現されている例を3つ]

段階コードは以下のいずれかを使用してください:
MISCONCEPTION, EXPLORATION, CONFLICT, INSIGHT, APPLICATION, INTEGRATION
`;

            const response = await this.geminiClient.generateText(prompt, { temperature: 0.1 });

            // レスポンスから段階を抽出
            const stageMatch = response.match(/学習段階:\s*(MISCONCEPTION|EXPLORATION|CONFLICT|INSIGHT|APPLICATION|INTEGRATION)/i);
            const confidenceMatch = response.match(/確信度:\s*([0-9.]+)/i);

            // 例の抽出
            const examples: string[] = [];
            const exampleRegex = /例:[\s\n]*([\s\S]*?)(?:\n\n|$)/i;
            const exampleMatch = response.match(exampleRegex);

            if (exampleMatch && exampleMatch[1]) {
                const exampleText = exampleMatch[1].trim();
                // 番号付きリストまたは箇条書きで分割
                const exampleItems = exampleText.split(/\n[-\d.]+\s*/);

                for (const item of exampleItems) {
                    const trimmedItem = item.trim();
                    if (trimmedItem.length > 0) {
                        examples.push(trimmedItem);
                    }
                }
            }

            if (stageMatch) {
                const detectedStage = stageMatch[1].toUpperCase() as LearningStage;
                const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5;

                logger.info(`Detected learning stage ${detectedStage} for ${conceptName} with confidence ${confidence}`, {
                    previousStage,
                    memoryContextUsed: analysisResult.success
                });

                // 急激な段階変化を防ぐ（前の段階からの自然な進行を保証）
                const stageOrder = this.getStageOrder(detectedStage);
                const previousOrder = this.getStageOrder(previousStage);

                // 前の段階から2段階以上進む場合は1段階に制限
                if (stageOrder - previousOrder > 1) {
                    const limitedStage = this.getNextStage(previousStage);
                    logger.warn(`Detected big jump in stage (${previousStage} -> ${detectedStage}), limiting to ${limitedStage}`);

                    return {
                        stage: limitedStage,
                        examples: examples.slice(0, 3),
                        confidence: confidence * 0.8 // 確信度を下げる
                    };
                }

                return {
                    stage: detectedStage,
                    examples: examples.slice(0, 3),
                    confidence
                };
            }

            // 検出失敗時は前回の段階を維持
            logger.warn(`Failed to detect learning stage from response, keeping previous stage ${previousStage}`);
            return {
                stage: previousStage,
                examples: [],
                confidence: 0.5
            };

        } catch (error) {
            logger.error(`Learning stage detection failed for ${conceptName}`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber
            });

            // エラー時は前回の段階を維持
            const previousStage = await this.determineLearningStage(conceptName, chapterNumber - 1);
            return {
                stage: previousStage,
                examples: [],
                confidence: 0.3
            };
        }
    }

    /**
     * ビジネスフレームワーク統合の学習段階を取得する
     * @param frameworkName フレームワーク名
     * @returns ビジネス学習段階配列
     */
    getBusinessFrameworkStages(frameworkName: string): LearningStage[] {
        const frameworkStageMapping: Record<string, LearningStage[]> = {
            'ISSUE_DRIVEN': [
                LearningStage.INTRODUCTION,
                LearningStage.MISCONCEPTION,
                LearningStage.EXPLORATION,
                LearningStage.CONFLICT,
                LearningStage.INSIGHT,
                LearningStage.THEORY_APPLICATION,
                LearningStage.FAILURE_EXPERIENCE,
                LearningStage.APPLICATION,
                LearningStage.PRACTICAL_MASTERY,
                LearningStage.INTEGRATION
            ],
            'SOCRATIC_DIALOGUE': [
                LearningStage.INTRODUCTION,
                LearningStage.EXPLORATION,
                LearningStage.CONFLICT,
                LearningStage.INSIGHT,
                LearningStage.APPLICATION,
                LearningStage.INTEGRATION
            ],
            'ADLER_PSYCHOLOGY': [
                LearningStage.INTRODUCTION,
                LearningStage.MISCONCEPTION,
                LearningStage.EXPLORATION,
                LearningStage.THEORY_APPLICATION,
                LearningStage.FAILURE_EXPERIENCE,
                LearningStage.PRACTICAL_MASTERY,
                LearningStage.INTEGRATION
            ],
            'DRUCKER_MANAGEMENT': [
                LearningStage.INTRODUCTION,
                LearningStage.THEORY_APPLICATION,
                LearningStage.FAILURE_EXPERIENCE,
                LearningStage.PRACTICAL_MASTERY,
                LearningStage.INTEGRATION
            ],
            'KOTLER_MARKETING': [
                LearningStage.INTRODUCTION,
                LearningStage.THEORY_APPLICATION,
                LearningStage.APPLICATION,
                LearningStage.PRACTICAL_MASTERY,
                LearningStage.INTEGRATION
            ],
            'CARNEGIE_RELATIONS': [
                LearningStage.INTRODUCTION,
                LearningStage.MISCONCEPTION,
                LearningStage.EXPLORATION,
                LearningStage.THEORY_APPLICATION,
                LearningStage.FAILURE_EXPERIENCE,
                LearningStage.PRACTICAL_MASTERY,
                LearningStage.INTEGRATION
            ]
        };

        return frameworkStageMapping[frameworkName] || [
            LearningStage.INTRODUCTION,
            LearningStage.THEORY_APPLICATION,
            LearningStage.PRACTICAL_MASTERY,
            LearningStage.INTEGRATION
        ];
    }

    /**
     * 4段階学習進行モデルに基づく段階判定
     * @param conceptName 概念名
     * @param chapterNumber 章番号
     * @param experienceType 経験タイプ
     * @returns 推奨される学習段階
     */
    async determineFourStageProgression(
        conceptName: string,
        chapterNumber: number,
        experienceType: 'theory' | 'failure' | 'practical' | 'integration'
    ): Promise<LearningStage> {
        try {
            const currentStage = await this.determineLearningStage(conceptName, chapterNumber);
            
            // 4段階モデルに基づく進行
            switch (experienceType) {
                case 'theory':
                    if (currentStage === LearningStage.INTRODUCTION) {
                        return LearningStage.THEORY_APPLICATION;
                    }
                    return currentStage;
                    
                case 'failure':
                    if (currentStage === LearningStage.THEORY_APPLICATION) {
                        return LearningStage.FAILURE_EXPERIENCE;
                    }
                    return currentStage;
                    
                case 'practical':
                    if (currentStage === LearningStage.FAILURE_EXPERIENCE) {
                        return LearningStage.PRACTICAL_MASTERY;
                    }
                    return currentStage;
                    
                case 'integration':
                    if (currentStage === LearningStage.PRACTICAL_MASTERY) {
                        return LearningStage.INTEGRATION;
                    }
                    return currentStage;
                    
                default:
                    return currentStage;
            }
        } catch (error) {
            logger.error('Failed to determine four-stage progression', { error, conceptName, chapterNumber });
            return LearningStage.INTRODUCTION;
        }
    }

    /**
     * ビジネス学習段階に対応した体現化プラン作成
     * @param conceptName 概念名
     * @param stage 学習段階
     * @param chapterNumber 章番号
     * @returns 体現化プラン
     */
    createBusinessLearningPlan(conceptName: string, stage: LearningStage, chapterNumber: number): EmbodimentPlan {
        switch (stage) {
            case LearningStage.INTRODUCTION:
                return this.createIntroductionPlan(conceptName, chapterNumber);
            case LearningStage.THEORY_APPLICATION:
                return this.createTheoryApplicationPlan(conceptName, chapterNumber);
            case LearningStage.FAILURE_EXPERIENCE:
                return this.createFailureExperiencePlan(conceptName, chapterNumber);
            case LearningStage.PRACTICAL_MASTERY:
                return this.createPracticalMasteryPlan(conceptName, chapterNumber);
            default:
                return this.getEmbodimentPlan(conceptName, chapterNumber);
        }
    }

    /**
     * 導入段階プラン作成
     * @private
     */
    private createIntroductionPlan(conceptName: string, chapterNumber: number): EmbodimentPlan {
        return {
            conceptName,
            stage: LearningStage.INTRODUCTION,
            chapterNumber,
            expressionMethods: [
                "概念の基本的な紹介と定義",
                "日常的な場面での概念の必要性を示唆",
                "キャラクターの現状と概念の関連性を暗示",
                "概念への関心を自然に引き出す状況設定"
            ],
            keyElements: [
                "概念の重要性を示す現実的な問題提起",
                "キャラクターの既存知識との関連付け",
                "学習への動機づけとなる状況",
                "概念に対する興味と関心の芽生え"
            ],
            dialogueSuggestions: [
                "これまでの方法では何か物足りない気がしている",
                "もっと効果的なアプローチがあるような気がする",
                "この考え方は面白そうだが、実際にはどう使うのだろう",
                "理論は理解できるが、実践での活用法が見えない",
                "これが本当に役立つなら、ぜひ身につけたい"
            ],
            tensionRecommendation: {
                recommendedTension: 0.4,
                reason: "導入段階では興味と関心を引く程度の穏やかな緊張感を設定",
                direction: "increase"
            }
        };
    }

    /**
     * 理論適用段階プラン作成
     * @private
     */
    private createTheoryApplicationPlan(conceptName: string, chapterNumber: number): EmbodimentPlan {
        return {
            conceptName,
            stage: LearningStage.THEORY_APPLICATION,
            chapterNumber,
            expressionMethods: [
                "理論的知識の実際の場面への適用試行",
                "教科書的な理解と現実のギャップの描写",
                "理論に基づいた行動とその結果の観察",
                "専門知識を実践で活用しようとする努力"
            ],
            keyElements: [
                "理論的理解の実践への挑戦",
                "期待と現実のギャップへの気づき",
                "理論通りにいかない現実への困惑",
                "より深い理解の必要性の認識"
            ],
            dialogueSuggestions: [
                "理論では分かっているつもりだが、実際にやってみると難しい",
                "教科書通りにやっているはずなのに、なぜうまくいかないのか",
                "理論と実践の間には大きな壁があることを実感している",
                "もっと実践的な知識や経験が必要だと感じる",
                "理論だけでは足りない、何かが欠けている"
            ],
            tensionRecommendation: {
                recommendedTension: 0.6,
                reason: "理論適用段階では実践の困難さからくる適度な緊張感を表現",
                direction: "increase"
            }
        };
    }

    /**
     * 失敗体験段階プラン作成
     * @private
     */
    private createFailureExperiencePlan(conceptName: string, chapterNumber: number): EmbodimentPlan {
        return {
            conceptName,
            stage: LearningStage.FAILURE_EXPERIENCE,
            chapterNumber,
            expressionMethods: [
                "理論的アプローチの失敗とその原因分析",
                "失敗から学ぶ姿勢と内省の描写",
                "挫折感と成長への転換点の表現",
                "失敗を通じた深い気づきの瞬間"
            ],
            keyElements: [
                "理論と実践のギャップによる失敗経験",
                "失敗から学ぶ重要性の理解",
                "挫折感から成長意欲への転換",
                "より本質的な理解への気づき"
            ],
            dialogueSuggestions: [
                "やはり理論だけでは通用しなかった。現実は厳しい",
                "この失敗から何を学べるだろうか",
                "うまくいかなかったが、なぜ失敗したのかが見えてきた",
                "失敗は辛いが、重要な学びを与えてくれている",
                "今度は違うアプローチを試してみよう"
            ],
            tensionRecommendation: {
                recommendedTension: 0.7,
                reason: "失敗体験段階では挫折感と学習意欲の相克による高い緊張感を設定",
                direction: "peak"
            }
        };
    }

    /**
     * 実践習得段階プラン作成
     * @private
     */
    private createPracticalMasteryPlan(conceptName: string, chapterNumber: number): EmbodimentPlan {
        return {
            conceptName,
            stage: LearningStage.PRACTICAL_MASTERY,
            chapterNumber,
            expressionMethods: [
                "失敗経験を活かした改善されたアプローチ",
                "理論と実践を統合した柔軟な対応",
                "段階的な成功体験の積み重ね",
                "実践的なスキルの向上と定着"
            ],
            keyElements: [
                "失敗から学んだ知見の実践活用",
                "理論と経験を統合した判断力",
                "現実的で効果的なアプローチの習得",
                "自信と確信を持った行動"
            ],
            dialogueSuggestions: [
                "失敗から学んだことで、ようやく実践的なコツが分かってきた",
                "理論と経験の両方があって初めて効果的に使えるようになった",
                "以前とは比べものにならないほど上達している実感がある",
                "今なら自信を持ってこのアプローチを使える",
                "実践を通じて、概念の本当の価値が理解できた"
            ],
            tensionRecommendation: {
                recommendedTension: 0.5,
                reason: "実践習得段階では達成感と更なる向上への意欲のバランスを表現",
                direction: "maintain"
            }
        };
    }

    /**
     * セクションに概念と学習段階を登録する（統合記憶システム対応）
     * @param conceptName 概念名
     * @param sectionId セクションID
     * @param learningStage 学習段階
     */
    async registerConceptForSection(
        conceptName: string,
        sectionId: string,
        learningStage: LearningStage
    ): Promise<void> {
        try {
            logger.info(`Registering concept ${conceptName} for section ${sectionId} with stage ${learningStage}`);

            // 概念が存在するか確認
            const concept = await this.getConceptDetails(conceptName);

            if (!concept) {
                logger.warn(`Concept not found: ${conceptName}, cannot register for section ${sectionId}`);
                return;
            }

            // セクション登録データを作成
            const registrationData = {
                sectionId,
                conceptName,
                stage: learningStage,
                registrationTime: new Date().toISOString(),
                metadata: {
                    source: 'ConceptLearningManager',
                    version: '2.0',
                    systemIntegration: true
                }
            };

            // 章形式でのデータ保存（統合記憶システム対応）
            const registrationChapter: Chapter = {
                id: `section-concept-${sectionId}-${Date.now()}`,
                chapterNumber: 0, // システムデータは0番
                title: `Section Concept Registration: ${sectionId}`,
                content: JSON.stringify(registrationData, null, 2),
                previousChapterSummary: '',
                scenes: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                metadata: {
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    status: 'system_data',
                    dataType: 'sectionConceptMapping',
                    wordCount: JSON.stringify(registrationData).length,
                    estimatedReadingTime: 1
                }
            };

            // 統合記憶システムで章を処理
            const processResult = await this.memoryManager.processChapter(registrationChapter);

            if (processResult.success) {
                // イベント発行
                this.eventBus.publish('learning.stage.updated', {
                    conceptName,
                    sectionId,
                    stage: learningStage,
                    timestamp: new Date().toISOString(),
                    memorySystemIntegrated: true
                });

                logger.info(`Successfully registered concept ${conceptName} for section ${sectionId}`, {
                    processingTime: processResult.processingTime,
                    affectedComponents: processResult.affectedComponents
                });
            } else {
                throw new Error(`Registration failed: ${processResult.errors.join(', ')}`);
            }

        } catch (error) {
            logger.error(`Failed to register concept for section`, {
                error: error instanceof Error ? error.message : String(error),
                conceptName,
                sectionId
            });
            throw error;
        }
    }

    // ============================================================================
    // パフォーマンス診断・統計機能
    // ============================================================================

    /**
     * システム診断を実行
     * @returns 診断結果
     */
    async performDiagnostics(): Promise<{
        systemHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
        memorySystemIntegration: boolean;
        performanceMetrics: ConceptLearningStatistics;
        issues: string[];
        recommendations: string[];
    }> {
        const startTime = Date.now();

        try {
            const issues: string[] = [];
            const recommendations: string[] = [];

            // 初期化状態の確認
            if (!this.initialized) {
                issues.push('ConceptLearningManager not initialized');
                return {
                    systemHealth: 'CRITICAL',
                    memorySystemIntegration: false,
                    performanceMetrics: this.performanceStats,
                    issues,
                    recommendations: ['Initialize ConceptLearningManager']
                };
            }

            // 統合記憶システムの健全性チェック
            let memorySystemHealthy = false;
            try {
                const systemStatus = await this.memoryManager.getSystemStatus();
                memorySystemHealthy = systemStatus.initialized;
                
                if (!memorySystemHealthy) {
                    issues.push('Memory system not properly initialized');
                    recommendations.push('Check memory system initialization');
                }
            } catch (error) {
                issues.push('Failed to check memory system status');
                recommendations.push('Verify memory system connectivity');
            }

            // 概念データの整合性チェック
            if (this.concepts.size === 0) {
                issues.push('No concepts loaded');
                recommendations.push('Load or generate initial concept data');
            }

            // キャッシュヒット率の評価
            if (this.performanceStats.memorySystemIntegration.cacheHitRate < 0.6) {
                issues.push('Low cache hit rate detected');
                recommendations.push('Consider optimizing concept access patterns');
            }

            // 学習進捗の評価
            if (this.performanceStats.learningProgression.stageTransitions === 0) {
                issues.push('No learning stage transitions recorded');
                recommendations.push('Ensure learning record updates are functioning');
            }

            // 統計の更新
            this.updateStatistics();
            this.performanceStats.lastOptimization = new Date().toISOString();

            // システム健全性の判定
            let systemHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
            if (issues.length === 0) {
                systemHealth = 'HEALTHY';
            } else if (issues.some(issue => issue.includes('CRITICAL') || issue.includes('not initialized'))) {
                systemHealth = 'CRITICAL';
            } else {
                systemHealth = 'DEGRADED';
            }

            const processingTime = Date.now() - startTime;
            logger.info('ConceptLearningManager diagnostics completed', {
                systemHealth,
                memorySystemHealthy,
                issues: issues.length,
                recommendations: recommendations.length,
                processingTime
            });

            return {
                systemHealth,
                memorySystemIntegration: memorySystemHealthy,
                performanceMetrics: this.performanceStats,
                issues,
                recommendations
            };

        } catch (error) {
            logger.error('Failed to perform diagnostics', {
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                systemHealth: 'CRITICAL',
                memorySystemIntegration: false,
                performanceMetrics: this.performanceStats,
                issues: ['Diagnostics execution failed'],
                recommendations: ['Check system logs and restart if necessary']
            };
        }
    }

    /**
     * 統計情報を更新
     * @private
     */
    private updateStatistics(): void {
        try {
            // 総概念数の更新
            this.performanceStats.totalConcepts = this.concepts.size;

            // 学習段階別統計の更新
            for (const stage of Object.values(LearningStage)) {
                this.performanceStats.conceptsByStage[stage] = 0;
            }

            for (const concept of this.concepts.values()) {
                if (concept.learningRecords && concept.learningRecords.length > 0) {
                    const latestRecord = concept.learningRecords[concept.learningRecords.length - 1];
                    this.performanceStats.conceptsByStage[latestRecord.stage]++;
                } else {
                    this.performanceStats.conceptsByStage[LearningStage.MISCONCEPTION]++;
                }
            }

            // 学習進捗統計の更新
            let totalTransitions = 0;
            let completedJourneys = 0;

            for (const concept of this.concepts.values()) {
                if (concept.learningRecords && concept.learningRecords.length > 0) {
                    totalTransitions += concept.learningRecords.length;
                    
                    const latestRecord = concept.learningRecords[concept.learningRecords.length - 1];
                    if (latestRecord.stage === LearningStage.INTEGRATION) {
                        completedJourneys++;
                    }
                }
            }

            this.performanceStats.learningProgression.stageTransitions = totalTransitions;
            this.performanceStats.learningProgression.completedJourneys = completedJourneys;
            
            if (totalTransitions > 0) {
                this.performanceStats.learningProgression.averageProgressionRate = 
                    completedJourneys / this.concepts.size;
            }

        } catch (error) {
            logger.warn('Failed to update statistics', { error });
        }
    }

    // ============================================================================
    // 安全なメモリ操作ヘルパー
    // ============================================================================

    /**
     * 安全なメモリ操作パターン（統合記憶システム対応）
     * @private
     */
    private async safeMemoryOperation<T>(
        operation: () => Promise<T>,
        fallbackValue: T,
        operationName: string
    ): Promise<T> {
        const startTime = Date.now();

        try {
            // システム状態確認
            const systemStatus = await this.memoryManager.getSystemStatus();
            if (!systemStatus.initialized) {
                logger.warn(`${operationName}: MemoryManager not initialized`);
                return fallbackValue;
            }

            const result = await operation();
            
            // 統計更新
            this.performanceStats.memorySystemIntegration.totalMemoryOperations++;
            const processingTime = Date.now() - startTime;
            this.performanceStats.memorySystemIntegration.averageRetrievalTime = 
                (this.performanceStats.memorySystemIntegration.averageRetrievalTime + processingTime) / 2;

            return result;

        } catch (error) {
            const processingTime = Date.now() - startTime;
            logger.error(`${operationName} failed`, { 
                error: error instanceof Error ? error.message : String(error),
                processingTime
            });
            return fallbackValue;
        }
    }

    // ============================================================================
    // 体現化プラン作成メソッド群（完全実装）
    // ============================================================================

    private createMisconceptionPlan(concept: BusinessConcept, chapterNumber: number): EmbodimentPlan {
        return {
            conceptName: concept.name,
            stage: LearningStage.MISCONCEPTION,
            chapterNumber: chapterNumber,
            expressionMethods: [
                "誤解に基づく行動とその限界の描写",
                "概念の部分的・表面的理解の表現",
                "自己正当化の思考や言動の描写",
                "問題が生じる状況設定"
            ],
            keyElements: [
                "誤解や思い込みの明確な描写",
                "誤った前提に基づく判断",
                "表面的な理解の限界を示す状況",
                "違和感や疑問の初期的な芽生え"
            ],
            dialogueSuggestions: [
                "これが唯一の正しい方法だ、他のやり方は考える必要もない",
                "単純なことを複雑に考える必要はない、今までのやり方で十分だ",
                "なぜこれが上手くいかないのか理解できない、理論通りなのに…",
                "他の人の意見なんて気にする必要はない、私の方法が一番効率的だから",
                "失敗の原因は自分以外にあるはずだ、方法論は間違っていない"
            ],
            tensionRecommendation: {
                recommendedTension: 0.6,
                reason: "誤解段階では、キャラクターが概念の限界に直面し始める緊張感を表現",
                direction: "increase"
            }
        };
    }

    private createExplorationPlan(concept: BusinessConcept, chapterNumber: number): EmbodimentPlan {
        return {
            conceptName: concept.name,
            stage: LearningStage.EXPLORATION,
            chapterNumber: chapterNumber,
            expressionMethods: [
                "新しい視点や情報との出会いの描写",
                "質問や疑問を投げかける対話",
                "従来の考え方を疑い始める内面描写",
                "異なる意見や視点との接触場面"
            ],
            keyElements: [
                "好奇心を刺激する状況設定",
                "新たな情報源との出会い",
                "これまでの理解への疑問の芽生え",
                "視野を広げる経験"
            ],
            dialogueSuggestions: [
                "今までの方法では上手くいかないのかもしれない…",
                "もし別の視点から考えるとどうなるだろう？",
                "これは単なる偶然なのか、それとも何か見落としているのか",
                "なぜこれまで気づかなかったのだろう？",
                "この考え方は本当に正しいのかな"
            ],
            tensionRecommendation: {
                recommendedTension: 0.55,
                reason: "探索段階では、新しい視点を探る好奇心と既存理解への執着の間の穏やかな緊張感を表現",
                direction: "maintain"
            }
        };
    }

    private createConflictPlan(concept: BusinessConcept, chapterNumber: number): EmbodimentPlan {
        return {
            conceptName: concept.name,
            stage: LearningStage.CONFLICT,
            chapterNumber: chapterNumber,
            expressionMethods: [
                "内的独白による葛藤の描写",
                "対立する意見を持つキャラクター間の対話",
                "判断を迫られる状況設定",
                "相反する価値観の間での揺れ動きの表現"
            ],
            keyElements: [
                "明確な価値観や思考の対立",
                "選択を迫られる状況",
                "内的葛藤の深化",
                "新旧の価値観の衝突"
            ],
            dialogueSuggestions: [
                "どちらが正しいのかわからない…",
                "これまでの考え方を捨てるのは怖いけど…",
                "両方の意見にはそれぞれ正しい部分がある",
                "簡単な答えはないのかもしれない",
                "この葛藤から逃げずに向き合わなければ"
            ],
            tensionRecommendation: {
                recommendedTension: 0.75,
                reason: "葛藤段階では、相反する視点の間での内的・外的な緊張感を高めに設定",
                direction: "increase"
            }
        };
    }

    private createInsightPlan(concept: BusinessConcept, chapterNumber: number): EmbodimentPlan {
        return {
            conceptName: concept.name,
            stage: LearningStage.INSIGHT,
            chapterNumber: chapterNumber,
            expressionMethods: [
                "「アハ体験」の瞬間の描写",
                "視界が広がるような比喩表現",
                "点と点がつながる思考プロセスの描写",
                "新たな理解を言語化する対話"
            ],
            keyElements: [
                "気づきの瞬間の鮮明な描写",
                "洞察を触発する触媒となる出来事",
                "理解の急激な変化",
                "新たな視点からの世界の再解釈"
            ],
            dialogueSuggestions: [
                "あっ！そうか…今までずっと見えていたのに、気づかなかった…",
                "待てよ…これが本当の意味だったのか！今、全てが繋がった気がする",
                "今、何かが腑に落ちた…今までとは全く違う視点で見えてきた",
                "そうだったのか…問題は方法ではなく、そもそもの考え方だったんだ",
                "ああ、なんて単純なことだったんだ。でも、これを理解するのにこれだけの時間がかかった…"
            ],
            tensionRecommendation: {
                recommendedTension: 0.7,
                reason: "気づき段階では、重要な洞察が得られる瞬間の感動的な緊張感を表現",
                direction: "peak"
            }
        };
    }

    private createApplicationPlan(concept: BusinessConcept, chapterNumber: number): EmbodimentPlan {
        return {
            conceptName: concept.name,
            stage: LearningStage.APPLICATION,
            chapterNumber: chapterNumber,
            expressionMethods: [
                "新しい理解の意識的な適用場面",
                "試行錯誤のプロセスの描写",
                "スキルや理解の向上を示す対比",
                "成功体験と挫折からの学びの描写"
            ],
            keyElements: [
                "概念の実践機会の設定",
                "意識的な適用と内省の繰り返し",
                "熟練度の段階的な向上",
                "理論と実践の架け橋"
            ],
            dialogueSuggestions: [
                "これが正しい方法だとわかっている、あとは実践あるのみだ",
                "理解するのと実践するのは別物だね",
                "少しずつコツをつかんできた気がする",
                "失敗もあるけど、以前より確実に良くなっている",
                "この概念を自分のものにするにはもう少し時間がかかりそうだ"
            ],
            tensionRecommendation: {
                recommendedTension: 0.65,
                reason: "応用段階では、新たな理解を実践する過程での集中と適度な緊張感を表現",
                direction: "maintain"
            }
        };
    }

    private createIntegrationPlan(concept: BusinessConcept, chapterNumber: number): EmbodimentPlan {
        return {
            conceptName: concept.name,
            stage: LearningStage.INTEGRATION,
            chapterNumber: chapterNumber,
            expressionMethods: [
                "概念の無意識的な適用場面",
                "他者への教授・共有場面",
                "過去の自分との対比描写",
                "概念を超えた創造的応用"
            ],
            keyElements: [
                "概念が染み込んだ自然な行動",
                "深い理解に基づく柔軟な適応",
                "他者への知恵の伝承",
                "次なる成長への準備"
            ],
            dialogueSuggestions: [
                "気づいたら自然とそうしていた",
                "今では考え方が変わっていて、以前の自分が信じられない",
                "これが私にとっての当たり前になっている",
                "他の人にも伝えたいと思う",
                "この理解が次の段階への扉を開いてくれた"
            ],
            tensionRecommendation: {
                recommendedTension: 0.5,
                reason: "統合段階では、概念が自然に体現される安定感と次のステップへの期待感のバランスを表現",
                direction: "maintain"
            }
        };
    }

    /**
     * デフォルトの体現化計画を作成
     * @private
     */
    private createDefaultEmbodimentPlan(conceptName: string, chapterNumber: number): EmbodimentPlan {
        return {
            conceptName: conceptName,
            stage: LearningStage.EXPLORATION,
            chapterNumber: chapterNumber,
            expressionMethods: [
                "新しい視点や情報との出会いの描写",
                "質問や疑問を投げかける対話",
                "従来の考え方を疑い始める内面描写"
            ],
            keyElements: [
                "好奇心を刺激する状況設定",
                "新たな情報源との出会い",
                "これまでの理解への疑問の芽生え"
            ],
            dialogueSuggestions: [
                "今までの方法では上手くいかないのかもしれない…",
                "もし別の視点から考えるとどうなるだろう？",
                "これは単なる偶然なのか、それとも何か見落としているのか",
                "なぜこれまで気づかなかったのだろう？"
            ],
            tensionRecommendation: {
                recommendedTension: 0.55,
                reason: "探索段階では、新しい視点を探る好奇心と既存理解への執着の間の穏やかな緊張感を表現",
                direction: "maintain"
            }
        };
    }

    // ============================================================================
    // ユーティリティメソッド群
    // ============================================================================

    /**
     * 初期化状態の確認
     * @private
     */
    private ensureInitialized(): void {
        if (!this.initialized) {
            throw new Error('ConceptLearningManager is not initialized. Call initialize() first.');
        }
    }

    /**
     * 概念名を正規化する
     * @private
     */
    private normalizeConceptName(name: string): string {
        return name.toUpperCase().replace(/\s+/g, '_');
    }

    /**
     * 学習段階が変化するチャプターかどうかを判定
     * @private
     */
    private isStageAdvancementChapter(chapterNumber: number): boolean {
        // 特定の章番号で段階が変化するという簡易ルール
        const advancementChapters = [5, 10, 15, 20, 25];
        return advancementChapters.includes(chapterNumber);
    }

    /**
     * 次の学習段階を取得
     * @private
     */
    private getNextStage(currentStage: LearningStage): LearningStage {
        const stageProgression: Record<LearningStage, LearningStage> = {
            [LearningStage.MISCONCEPTION]: LearningStage.EXPLORATION,
            [LearningStage.EXPLORATION]: LearningStage.CONFLICT,
            [LearningStage.CONFLICT]: LearningStage.INSIGHT,
            [LearningStage.INSIGHT]: LearningStage.APPLICATION,
            [LearningStage.APPLICATION]: LearningStage.INTEGRATION,
            [LearningStage.INTEGRATION]: LearningStage.INTEGRATION // 最終段階なので同じ
        };

        return stageProgression[currentStage] || currentStage;
    }

    /**
     * 学習段階の順序を取得
     * @private
     */
    private getStageOrder(stage: LearningStage): number {
        const stageOrder: Record<LearningStage, number> = {
            [LearningStage.MISCONCEPTION]: 1,
            [LearningStage.EXPLORATION]: 2,
            [LearningStage.CONFLICT]: 3,
            [LearningStage.INSIGHT]: 4,
            [LearningStage.APPLICATION]: 5,
            [LearningStage.INTEGRATION]: 6
        };

        return stageOrder[stage] || 0;
    }

    /**
     * 学習段階を日本語表記で取得
     * @private
     */
    private formatLearningStage(stage: LearningStage): string {
        const japaneseStages: { [key in LearningStage]?: string } = {
            [LearningStage.MISCONCEPTION]: '誤解段階',
            [LearningStage.EXPLORATION]: '探索段階',
            [LearningStage.CONFLICT]: '葛藤段階',
            [LearningStage.INSIGHT]: '気づき段階',
            [LearningStage.APPLICATION]: '応用段階',
            [LearningStage.INTEGRATION]: '統合段階'
        };

        return japaneseStages[stage] || stage;
    }

    // ============================================================================
    // パブリックAPI追加メソッド
    // ============================================================================

    /**
     * パフォーマンス統計を取得
     * @returns パフォーマンス統計情報
     */
    getPerformanceStatistics(): ConceptLearningStatistics {
        this.updateStatistics();
        return { ...this.performanceStats };
    }

    /**
     * メモリシステム統合状況を取得
     * @returns 統合状況情報
     */
    getMemorySystemIntegrationStatus(): {
        integrated: boolean;
        operationCount: number;
        cacheHitRate: number;
        averageRetrievalTime: number;
        lastOperation: string;
    } {
        return {
            integrated: this.initialized,
            operationCount: this.performanceStats.memorySystemIntegration.totalMemoryOperations,
            cacheHitRate: this.performanceStats.memorySystemIntegration.cacheHitRate,
            averageRetrievalTime: this.performanceStats.memorySystemIntegration.averageRetrievalTime,
            lastOperation: this.performanceStats.lastOptimization
        };
    }

    /**
     * 🎯 キャラクターシステムとの統合データ取得
     * @private
     */
    private async integrateCharacterSystemData(
        characterManager: any,
        conceptName: string,
        learningStage: LearningStage,
        chapterNumber: number
    ): Promise<any> {
        try {
            logger.info(`キャラクターシステム統合データを取得中: ${conceptName}, stage: ${learningStage}`);

            // キャラクター成長状態を取得
            const characterStates = await this.safeCharacterOperation(
                () => characterManager.getAllCharacterStates ? characterManager.getAllCharacterStates() : [],
                [],
                'getCharacterStates'
            );

            // キャラクター関係性データを取得
            const relationships = await this.safeCharacterOperation(
                () => characterManager.getAllRelationships ? characterManager.getAllRelationships() : [],
                [],
                'getCharacterRelationships'
            );

            // 現在の学習段階に適したキャラクター表現パターンを生成
            const characterExpressionPatterns = this.generateCharacterExpressionPatterns(
                characterStates,
                learningStage,
                conceptName
            );

            // キャラクター発達への影響分析
            const characterDevelopmentImpact = this.analyzeCharacterDevelopmentImpact(
                characterStates,
                learningStage,
                conceptName
            );

            return {
                characterStates,
                relationships,
                characterExpressionPatterns,
                characterDevelopmentImpact,
                integrationMetrics: {
                    charactersAnalyzed: characterStates.length,
                    relationshipsConsidered: relationships.length,
                    learningCharacterAlignment: this.calculateLearningCharacterAlignment(
                        learningStage,
                        characterStates
                    )
                }
            };

        } catch (error) {
            logger.error('キャラクターシステム統合データ取得でエラー', {
                error: error instanceof Error ? error.message : String(error),
                conceptName,
                learningStage
            });
            return null;
        }
    }

    /**
     * 🎯 キャラクターシステム統合による計画強化
     * @private
     */
    private enhancePlanWithCharacterIntegration(plan: EmbodimentPlan, characterData: any): EmbodimentPlan {
        try {
            const enhancedPlan = { ...plan };

            // キャラクター表現パターンを対話提案に統合
            if (characterData.characterExpressionPatterns) {
                enhancedPlan.dialogueSuggestions = [
                    ...enhancedPlan.dialogueSuggestions,
                    ...characterData.characterExpressionPatterns.dialoguePatterns.slice(0, 3)
                ];
            }

            // キャラクター発達影響を重要要素に統合
            if (characterData.characterDevelopmentImpact) {
                enhancedPlan.keyElements = [
                    ...enhancedPlan.keyElements,
                    ...characterData.characterDevelopmentImpact.keyDevelopmentAspects.slice(0, 2)
                ];
            }

            // キャラクター特化の表現方法を追加
            if (characterData.characterStates && characterData.characterStates.length > 0) {
                const mainCharacter = characterData.characterStates[0];
                enhancedPlan.expressionMethods = [
                    ...enhancedPlan.expressionMethods,
                    `${mainCharacter.name || '主人公'}の内面変化を通した概念表現`,
                    `キャラクター間の関係性を通じた概念の多面的描写`
                ];
            }

            // 学習×キャラクター統合度に基づくテンション調整
            if (characterData.integrationMetrics?.learningCharacterAlignment) {
                const alignment = characterData.integrationMetrics.learningCharacterAlignment;
                enhancedPlan.tensionRecommendation.recommendedTension = Math.min(1.0,
                    enhancedPlan.tensionRecommendation.recommendedTension * (0.8 + alignment * 0.4)
                );
                enhancedPlan.tensionRecommendation.reason += ` (キャラクター統合度: ${Math.round(alignment * 100)}%)`;
            }

            logger.debug('キャラクターシステム統合による体現化計画強化完了', {
                originalDialogueCount: plan.dialogueSuggestions.length,
                enhancedDialogueCount: enhancedPlan.dialogueSuggestions.length,
                characterAlignment: characterData.integrationMetrics?.learningCharacterAlignment || 0
            });

            return enhancedPlan;

        } catch (error) {
            logger.warn('キャラクターシステム統合による計画強化でエラー', { error });
            return plan;
        }
    }

    /**
     * キャラクター表現パターン生成
     * @private
     */
    private generateCharacterExpressionPatterns(
        characterStates: any[],
        learningStage: LearningStage,
        conceptName: string
    ): any {
        const patterns = {
            dialoguePatterns: [] as string[],
            internalNarrationPatterns: [] as string[],
            actionPatterns: [] as string[]
        };

        try {
            // 学習段階別のキャラクター表現パターン
            for (const character of characterStates.slice(0, 3)) { // 最大3キャラクターまで
                const characterName = character.name || character.id || '登場人物';

                switch (learningStage) {
                    case LearningStage.MISCONCEPTION:
                        patterns.dialoguePatterns.push(
                            `${characterName}: 「これが正しいやり方のはずなのに、なぜ上手くいかないんだろう...」`
                        );
                        break;
                    case LearningStage.EXPLORATION:
                        patterns.dialoguePatterns.push(
                            `${characterName}: 「もしかすると、別の方法があるのかもしれない」`
                        );
                        break;
                    case LearningStage.CONFLICT:
                        patterns.dialoguePatterns.push(
                            `${characterName}: 「どちらを選ぶべきなのか、本当に分からない...」`
                        );
                        break;
                    case LearningStage.INSIGHT:
                        patterns.dialoguePatterns.push(
                            `${characterName}: 「そうか！今まで見えていなかったものが、ようやく見えてきた」`
                        );
                        break;
                    case LearningStage.APPLICATION:
                        patterns.dialoguePatterns.push(
                            `${characterName}: 「理解したことを、実際に試してみよう」`
                        );
                        break;
                    case LearningStage.INTEGRATION:
                        patterns.dialoguePatterns.push(
                            `${characterName}: 「これが自然な考え方になっている。次の段階に進めそうだ」`
                        );
                        break;
                }
            }

        } catch (error) {
            logger.warn('キャラクター表現パターン生成でエラー', { error });
        }

        return patterns;
    }

    /**
     * キャラクター発達影響分析
     * @private
     */
    private analyzeCharacterDevelopmentImpact(
        characterStates: any[],
        learningStage: LearningStage,
        conceptName: string
    ): any {
        return {
            keyDevelopmentAspects: [
                '学習段階に応じたキャラクターの内的成長',
                'キャラクター間の関係性の変化と深化',
                '概念理解がもたらすキャラクターの行動変化'
            ],
            impactLevel: this.calculateCharacterDevelopmentImpact(learningStage),
            synchronizationRecommendations: [
                '学習進行とキャラクター成長の同期',
                'キャラクターの個性を活かした概念体現',
                '関係性の発展による学習効果の増幅'
            ]
        };
    }

    /**
     * 学習×キャラクター統合度計算
     * @private
     */
    private calculateLearningCharacterAlignment(
        learningStage: LearningStage,
        characterStates: any[]
    ): number {
        // 基本統合度
        let alignment = 0.6; // ベースライン

        // 学習段階による調整
        switch (learningStage) {
            case LearningStage.CONFLICT:
            case LearningStage.INSIGHT:
                alignment += 0.2; // キャラクター発達との相性が良い段階
                break;
            case LearningStage.APPLICATION:
            case LearningStage.INTEGRATION:
                alignment += 0.1; // 実践段階でキャラクター行動との統合が重要
                break;
        }

        // キャラクター数による調整
        if (characterStates.length >= 2) {
            alignment += 0.1; // 複数キャラクターでの相互作用効果
        }

        return Math.min(1.0, alignment);
    }

    /**
     * キャラクター発達影響度計算
     * @private
     */
    private calculateCharacterDevelopmentImpact(learningStage: LearningStage): number {
        const impactLevels: Record<LearningStage, number> = {
            [LearningStage.MISCONCEPTION]: 0.5,
            [LearningStage.EXPLORATION]: 0.6,
            [LearningStage.CONFLICT]: 0.8,
            [LearningStage.INSIGHT]: 0.9,
            [LearningStage.APPLICATION]: 0.7,
            [LearningStage.INTEGRATION]: 0.6
        };

        return impactLevels[learningStage] || 0.5;
    }

    /**
     * 安全なキャラクター操作
     * @private
     */
    private async safeCharacterOperation<T>(
        operation: () => Promise<T> | T,
        fallbackValue: T,
        operationName: string
    ): Promise<T> {
        try {
            const result = await operation();
            return result;
        } catch (error) {
            logger.warn(`${operationName} failed, using fallback`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return fallbackValue;
        }
    }

    /**
     * システム最適化を実行
     * @returns 最適化結果
     */
    async optimizeSystem(): Promise<{
        optimized: boolean;
        improvements: string[];
        processingTime: number;
    }> {
        const startTime = Date.now();
        const improvements: string[] = [];

        try {
            // 概念データの整合性チェックと修復
            let conceptsFixed = 0;
            for (const [key, concept] of this.concepts.entries()) {
                if (!concept.updated || !concept.created) {
                    concept.updated = new Date().toISOString();
                    concept.created = concept.created || new Date().toISOString();
                    conceptsFixed++;
                }
            }

            if (conceptsFixed > 0) {
                improvements.push(`Fixed ${conceptsFixed} concept data integrity issues`);
            }

            // 統計情報の再計算
            this.updateStatistics();
            improvements.push('Updated performance statistics');

            // 統合記憶システムとの同期
            const saveResult = await this.saveConceptsToUnifiedMemory();
            if (saveResult.success) {
                improvements.push('Synchronized with unified memory system');
            }

            const processingTime = Date.now() - startTime;
            
            logger.info('ConceptLearningManager optimization completed', {
                improvements: improvements.length,
                processingTime
            });

            return {
                optimized: improvements.length > 0,
                improvements,
                processingTime
            };

        } catch (error) {
            logger.error('Failed to optimize ConceptLearningManager', { error });
            
            return {
                optimized: false,
                improvements: [],
                processingTime: Date.now() - startTime
            };
        }
    }
}