// src/lib/learning-journey/concept-learning-manager.ts

/**
 * @fileoverview 概念学習管理
 * @description
 * ビジネス概念の定義と学習段階を管理するコンポーネント。
 * 学習段階の追跡、進捗分析、体現化プランの生成を担当する。
 */

import { logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';
import { EventBus } from './event-bus';
import { storageProvider } from '@/lib/storage';
import { memoryManager } from '@/lib/memory/manager';

/**
 * 学習段階の列挙型
 */
export enum LearningStage {
    MISCONCEPTION = 'MISCONCEPTION',   // 誤解段階
    EXPLORATION = 'EXPLORATION',       // 探索段階
    CONFLICT = 'CONFLICT',             // 葛藤段階
    INSIGHT = 'INSIGHT',               // 気づき段階
    APPLICATION = 'APPLICATION',       // 応用段階
    INTEGRATION = 'INTEGRATION'        // 統合段階
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
 * @class ConceptLearningManager
 * @description
 * ビジネス概念の定義と学習段階を管理するクラス。
 * BusinessConceptLibraryとConceptEmbodimentDesignerを統合したもの。
 */
export class ConceptLearningManager {
    private concepts: Map<string, BusinessConcept> = new Map();
    private initialized: boolean = false;

    /**
     * コンストラクタ
     * @param geminiClient AIによる学習分析用クライアント
     * @param eventBus イベントバス
     */
    constructor(
        private geminiClient: GeminiClient,
        private eventBus: EventBus
    ) {
        logger.info('ConceptLearningManager created');
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
            logger.info('Initializing ConceptLearningManager...');

            // データが存在するか確認
            const dataExists = await this.conceptDataExists();

            if (dataExists) {
                // 既存データを読み込む
                await this.loadConceptsData();
            } else {
                // 初期データを生成
                await this.generateInitialConceptsData();
            }

            this.initialized = true;
            logger.info('ConceptLearningManager initialized successfully');

            // 初期化完了イベント発行
            this.eventBus.publish('learning.manager.initialized', {
                conceptCount: this.concepts.size
            });
        } catch (error) {
            logger.error('Failed to initialize ConceptLearningManager', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 概念データが存在するか確認
     */
    private async conceptDataExists(): Promise<boolean> {
        try {
            const worldKnowledge = memoryManager.getLongTermMemory();
            const settings = worldKnowledge.getWorldSettings();
            return !!settings.businessConcepts && Array.isArray(settings.businessConcepts);
        } catch (error) {
            logger.error('Error checking concept data existence', {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }

    /**
     * 概念データを読み込む
     */
    private async loadConceptsData(): Promise<void> {
        try {
            // WorldKnowledgeから読み込み
            const worldKnowledge = memoryManager.getLongTermMemory();
            const settings = worldKnowledge.getWorldSettings();

            // BusinessConceptインターフェースを定義（別ファイルに定義されている場合はインポート）
            interface BusinessConcept {
                name: string;
                // 他の必要なプロパティもここに追加
                description?: string;
                category?: string;
                relatedConcepts?: string[];
                examples?: string[];
                [key: string]: any; // その他の任意のプロパティを許可
            }

            if (settings.businessConcepts && Array.isArray(settings.businessConcepts)) {
                this.concepts = new Map(
                    settings.businessConcepts.map((concept: BusinessConcept) => [
                        this.normalizeConceptName(concept.name),
                        concept
                    ])
                );

                logger.info(`Loaded ${this.concepts.size} business concepts from memory hierarchy`);
            } else {
                logger.info('No business concepts found in memory hierarchy');
                this.concepts = new Map();
            }
        } catch (error) {
            logger.error('Failed to load concepts data', {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー時は空のコンセプト集で初期化
            this.concepts = new Map();
        }
    }

    /**
     * 初期概念データを生成する
     */
    private async generateInitialConceptsData(): Promise<void> {
        try {
            logger.info('Generating initial business concepts data');

            // ISSUE DRIVEN概念の定義
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

            // Map形式で概念を保存
            this.concepts.set(this.normalizeConceptName(issueDriven.name), issueDriven);

            // 概念データを保存
            await this.saveConceptsData();

            logger.info(`Generated initial business concept: ${issueDriven.name}`);
        } catch (error) {
            logger.error('Failed to generate initial concepts data', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 概念データを保存する
     */
    private async saveConceptsData(): Promise<void> {
        try {
            // WorldKnowledgeのカスタムプロパティとして保存
            const worldKnowledge = memoryManager.getLongTermMemory();
            await worldKnowledge.updateWorldSettings({
                businessConcepts: Array.from(this.concepts.values()),
                learningStageLastUpdated: new Date().toISOString()
            });

            logger.info(`Saved ${this.concepts.size} business concepts to memory hierarchy`);
        } catch (error) {
            logger.error('Failed to save concepts data', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * ディレクトリの存在を確認し、必要に応じて作成する
     * @param dirPath ディレクトリパス
     */
    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            // ローカル環境の場合
            if (typeof window === 'undefined') {
                const fs = require('fs');
                const path = require('path');
                const fullPath = path.join(process.cwd(), dirPath);
                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath, { recursive: true });
                }
            }
            // ブラウザ環境の場合
            else {
                await storageProvider.createDirectory(dirPath);
            }
        } catch (error) {
            logger.error(`Failed to ensure directory exists: ${dirPath}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 概念の詳細を取得する
     * @param conceptName 概念名
     * @returns 概念の詳細情報、見つからない場合はnull
     */
    getConceptDetails(conceptName: string): BusinessConcept | null {
        this.ensureInitialized();

        // 正規化された名前で検索
        const normalizedName = this.normalizeConceptName(conceptName);
        const concept = this.concepts.get(normalizedName);

        if (concept) {
            return concept;
        }

        // 部分一致で検索
        for (const [key, value] of this.concepts.entries()) {
            if (key.includes(normalizedName) || normalizedName.includes(key)) {
                return value;
            }
        }

        return null;
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
     * 学習段階を判断する
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

            // 前回の学習段階を取得
            const concept = this.getConceptDetails(conceptName);

            if (!concept) {
                logger.warn(`Concept not found: ${conceptName}, using default stage EXPLORATION`);
                return LearningStage.EXPLORATION; // デフォルト値
            }

            // 最新の学習記録を取得
            const latestRecord = concept.learningRecords?.sort(
                (a, b) => b.chapterNumber - a.chapterNumber
            )[0];

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
     * 特定の概念情報を学習記録で更新する
     * @param conceptName 概念名
     * @param learningRecord 学習記録
     * @returns 更新成功の真偽値
     */
    async updateConceptWithLearningRecord(
        conceptName: string,
        learningRecord: LearningRecord
    ): Promise<boolean> {
        this.ensureInitialized();

        // 概念情報を取得
        const concept = this.getConceptDetails(conceptName);

        if (!concept) {
            logger.warn(`Cannot update learning record for concept "${conceptName}": concept not found`);
            return false;
        }

        // 学習記録配列を初期化
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

        // 永続化
        await this.saveConceptsData();

        // 学習段階変更イベントを発行
        this.eventBus.publish('learning.stage.updated', {
            conceptName: concept.name,
            stage: learningRecord.stage,
            chapterNumber: learningRecord.chapterNumber
        });

        logger.info(`Updated learning record for concept "${conceptName}" at chapter ${learningRecord.chapterNumber}`);
        return true;
    }

    /**
     * 章のための概念体現化計画を取得
     * @param conceptName 概念名
     * @param chapterNumber 章番号
     * @returns 体現化計画
     */
    async getEmbodimentPlan(
        conceptName: string,
        chapterNumber: number
    ): Promise<EmbodimentPlan> {
        try {
            logger.info(`Getting embodiment plan for concept: ${conceptName} at chapter ${chapterNumber}`);

            // 概念情報を取得
            const concept = this.getConceptDetails(conceptName);

            if (!concept) {
                logger.warn(`Concept not found: ${conceptName}, using default plan`);
                return this.createDefaultEmbodimentPlan(conceptName, chapterNumber);
            }

            // 現在の学習段階を決定
            const currentStage = await this.determineLearningStage(conceptName, chapterNumber);

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

            // 体現化計画イベントを発行
            this.eventBus.publish('embodiment.plan.created', {
                conceptName,
                stage: currentStage,
                chapterNumber
            });

            logger.info(`Created embodiment plan for ${conceptName} at stage ${currentStage} for chapter ${chapterNumber}`);
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
     * 学習段階に応じた体現化プランを作成
     * 各段階ごとのプラン作成メソッド
     */

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
     * @param conceptName 概念名
     * @param chapterNumber 章番号
     * @returns 体現化計画
     */
    private createDefaultEmbodimentPlan(conceptName: string, chapterNumber: number): EmbodimentPlan {
        // デフォルトは探索段階の計画
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

    /**
     * 章の内容から概念の体現状況を分析する
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
            const concept = this.getConceptDetails(conceptName);

            if (!concept) {
                logger.warn(`Concept not found for embodiment analysis: ${conceptName}`);
                return {
                    stage: LearningStage.EXPLORATION,
                    examples: [],
                    confidence: 0.5
                };
            }

            // 前回の学習記録を取得
            const previousStage = await this.determineLearningStage(conceptName, chapterNumber - 1);

            // AIによる学習段階検出
            const prompt = `
あなたは学習段階検出の専門家です。与えられた章の内容から、概念「${conceptName}」の理解が以下のどの段階にあるかを判断してください。

章の内容:
${chapterContent.substring(0, 5000)}...

前回の学習段階: ${this.formatLearningStage(previousStage)}

概念情報:
- 名前: ${concept.name}
- 説明: ${concept.description}
- 主要原則: ${concept.keyPrinciples.join(', ')}

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

                logger.info(`Detected learning stage ${detectedStage} for ${conceptName} with confidence ${confidence}`);

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
   * セクションに概念と学習段階を登録する
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
            const concept = this.getConceptDetails(conceptName);

            if (!concept) {
                logger.warn(`Concept not found: ${conceptName}, cannot register for section ${sectionId}`);
                return;
            }

            // コンセプトとセクションのマッピングを保存
            // 注：実装はストレージ方法に依存するため、既存のMemoryManagerと統合する
            const worldKnowledge = memoryManager.getLongTermMemory();

            // WorldKnowledgeの設定を更新
            const settings = worldKnowledge.getWorldSettings();
            const sectionConceptMappings = settings.sectionConceptMappings || {};

            // マッピングを更新
            sectionConceptMappings[sectionId] = {
                conceptName,
                stage: learningStage,
                updatedAt: new Date().toISOString()
            };

            // 設定を保存
            await worldKnowledge.updateWorldSettings({
                ...settings,
                sectionConceptMappings
            });

            // イベント発行
            this.eventBus.publish('learning.stage.updated', {
                conceptName,
                sectionId,
                stage: learningStage,
                timestamp: new Date().toISOString()
            });

            logger.info(`Successfully registered concept ${conceptName} for section ${sectionId}`);
        } catch (error) {
            logger.error(`Failed to register concept for section`, {
                error: error instanceof Error ? error.message : String(error),
                conceptName,
                sectionId
            });
            throw error;
        }
    }

    /**
     * 初期化済みかどうかを確認し、必要に応じて初期化する
     */
    private ensureInitialized(): void {
        if (!this.initialized) {
            throw new Error('ConceptLearningManager is not initialized. Call initialize() first.');
        }
    }

    /**
     * 概念名を正規化する
     * @param name 概念名
     * @returns 正規化された概念名
     */
    private normalizeConceptName(name: string): string {
        return name.toUpperCase().replace(/\s+/g, '_');
    }

    /**
     * 学習段階が変化するチャプターかどうかを判定
     * @param chapterNumber 章番号
     * @returns 判定結果
     */
    private isStageAdvancementChapter(chapterNumber: number): boolean {
        // 特定の章番号で段階が変化するという簡易ルール
        // 篇の区切りや重要な転換点に合わせて調整する
        const advancementChapters = [5, 10, 15, 20, 25];
        return advancementChapters.includes(chapterNumber);
    }

    /**
     * 次の学習段階を取得
     * @param currentStage 現在の学習段階
     * @returns 次の学習段階
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
     * @param stage 学習段階
     * @returns 順序値（低いほど初期段階）
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
     * @param stage 学習段階
     * @returns 日本語表記
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
}