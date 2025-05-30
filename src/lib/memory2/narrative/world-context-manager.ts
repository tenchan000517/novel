// src/lib/memory/narrative/world-context-manager.ts
/**
 * @fileoverview 世界設定コンテキスト管理クラス（最適化版）
 * @description
 * 物語の場所、時間、天候などの環境情報を管理し、
 * ジャンルに応じた環境情報を生成します。統合型定義に対応し、
 * より高度なコンテキスト管理を提供します。
 */

import { Chapter } from '@/types/chapters';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import {
    ManagerConstructorOptions,
    UpdateOptions,
    IManager,
    NarrativeState,
    BusinessGrowthPhase
} from './types';

/**
 * @interface EnvironmentContext
 * @description 環境コンテキスト情報
 */
interface EnvironmentContext {
    location: string;
    timeOfDay: string;
    weather: string;
    atmosphere: string;
    businessPhase?: BusinessGrowthPhase;
    narrativeState?: NarrativeState;
    timestamp: string;
}

/**
 * @interface LocationMetadata
 * @description 場所のメタデータ
 */
interface LocationMetadata {
    type: 'office' | 'meeting_room' | 'co_working' | 'home' | 'external' | 'virtual' | 'outdoor' | 'indoor';
    capacity?: string;
    atmosphere: string;
    businessRelevance?: number;
    formality: 'casual' | 'semi_formal' | 'formal' | 'very_formal';
}

/**
 * @class WorldContextManager
 * @description 物語の世界設定コンテキストを管理するクラス（最適化版）
 */
export class WorldContextManager implements IManager {
    private genre: string = 'classic';
    private previousLocation: string = '';
    private currentLocation: string = '';
    private currentTimeOfDay: string = '';
    private currentWeather: string = '';
    private currentAtmosphere: string = '';
    private currentBusinessPhase: BusinessGrowthPhase = BusinessGrowthPhase.IDEA;
    private currentArcNumber: number = 1;
    private environmentHistory: EnvironmentContext[] = [];
    private initialized: boolean = false;

    // ビジネス環境の詳細設定
    private readonly businessEnvironments = {
        [BusinessGrowthPhase.IDEA]: {
            locations: [
                { name: 'カフェの片隅', metadata: { type: 'external' as const, atmosphere: '創造的でリラックスした雰囲気', formality: 'casual' as const, businessRelevance: 7 } },
                { name: '創業者の自宅リビング', metadata: { type: 'home' as const, atmosphere: 'アットホームで集中できる環境', formality: 'casual' as const, businessRelevance: 8 } },
                { name: '大学のスタートアップラボ', metadata: { type: 'office' as const, atmosphere: '革新的で実験的な空気', formality: 'casual' as const, businessRelevance: 9 } },
                { name: 'コワーキングスペースの共有デスク', metadata: { type: 'co_working' as const, atmosphere: '活気に満ちた起業家精神', formality: 'semi_formal' as const, businessRelevance: 8 } }
            ],
            timeContexts: ['早朝のブレインストーミング', '深夜のアイデア検討', '週末の集中作業', '平日夜の副業時間'],
            atmospheres: ['創造的な熱気', 'アイデアが湧き出る興奮', '未来への期待感', '不確実性への不安と希望']
        },
        [BusinessGrowthPhase.VALIDATION]: {
            locations: [
                { name: 'インキュベーター施設の個室', metadata: { type: 'office' as const, atmosphere: '集中的で専門的な環境', formality: 'semi_formal' as const, businessRelevance: 9 } },
                { name: '顧客企業の会議室', metadata: { type: 'meeting_room' as const, atmosphere: '緊張感のある検証の場', formality: 'formal' as const, businessRelevance: 10 } },
                { name: 'レンタルオフィスの一室', metadata: { type: 'office' as const, atmosphere: '真剣で集中した作業環境', formality: 'semi_formal' as const, businessRelevance: 8 } },
                { name: 'ユーザーインタビュー会場', metadata: { type: 'meeting_room' as const, atmosphere: '学習と発見の緊張感', formality: 'semi_formal' as const, businessRelevance: 9 } }
            ],
            timeContexts: ['顧客訪問の午前中', 'フィードバック分析の夕方', '市場検証の週末', 'ピボット検討の深夜'],
            atmospheres: ['検証への集中', '市場の声への傾聴', '仮説検証の緊張', '学習による成長実感']
        },
        [BusinessGrowthPhase.EARLY_TRACTION]: {
            locations: [
                { name: '小規模オフィスの開発エリア', metadata: { type: 'office' as const, atmosphere: '活発な開発とイテレーション', formality: 'casual' as const, businessRelevance: 9 } },
                { name: 'エンジェル投資家のオフィス', metadata: { type: 'meeting_room' as const, atmosphere: '資金調達の重要な交渉', formality: 'formal' as const, businessRelevance: 10 } },
                { name: 'プロダクトデモ会場', metadata: { type: 'meeting_room' as const, atmosphere: '製品披露の興奮と緊張', formality: 'semi_formal' as const, businessRelevance: 9 } },
                { name: 'チーム拡大のための面接室', metadata: { type: 'meeting_room' as const, atmosphere: '成長への期待と人材発掘', formality: 'formal' as const, businessRelevance: 8 } }
            ],
            timeContexts: ['製品開発の集中時間', '投資家ピッチの準備時間', '初期ユーザー獲得の戦略会議', 'チーム構築の採用面接'],
            atmospheres: ['初期成功の手応え', '成長への確信', '拡大への期待', '新たな挑戦への意欲']
        },
        [BusinessGrowthPhase.SCALE]: {
            locations: [
                { name: '専用オフィスフロアの会議室', metadata: { type: 'meeting_room' as const, atmosphere: '組織化された効率的な環境', formality: 'formal' as const, businessRelevance: 9 } },
                { name: 'VCファームの役員会議室', metadata: { type: 'meeting_room' as const, atmosphere: '大型資金調達の重要局面', formality: 'very_formal' as const, businessRelevance: 10 } },
                { name: '製品ローンチイベント会場', metadata: { type: 'external' as const, atmosphere: '市場展開の華々しい舞台', formality: 'formal' as const, businessRelevance: 10 } },
                { name: 'パートナー企業の役員室', metadata: { type: 'meeting_room' as const, atmosphere: '戦略的提携の交渉空間', formality: 'very_formal' as const, businessRelevance: 9 } }
            ],
            timeContexts: ['スケーリング戦略の重要会議', '大型調達のピッチ準備', '製品ローンチの最終確認', 'チームマネジメントの課題解決'],
            atmospheres: ['スケーリングの興奮', '大きな責任感', '市場支配への野望', '組織拡大の挑戦']
        },
        [BusinessGrowthPhase.EXPANSION]: {
            locations: [
                { name: '本社役員フロアの戦略室', metadata: { type: 'meeting_room' as const, atmosphere: '企業戦略の中枢', formality: 'very_formal' as const, businessRelevance: 10 } },
                { name: '海外支社設立予定地', metadata: { type: 'external' as const, atmosphere: 'グローバル展開の現実味', formality: 'formal' as const, businessRelevance: 9 } },
                { name: 'M&A交渉の会議室', metadata: { type: 'meeting_room' as const, atmosphere: '企業買収の重大局面', formality: 'very_formal' as const, businessRelevance: 10 } },
                { name: '株主総会会場', metadata: { type: 'meeting_room' as const, atmosphere: '株主への重要報告', formality: 'very_formal' as const, businessRelevance: 10 } }
            ],
            timeContexts: ['グローバル展開の戦略会議', 'M&A案件の検討時間', '新規事業の企画段階', '市場拡大の実行フェーズ'],
            atmospheres: ['グローバル企業への道筋', '市場拡大の確信', '新たな市場への挑戦', '企業価値向上への集中']
        },
        [BusinessGrowthPhase.MATURITY]: {
            locations: [
                { name: '大規模カンファレンスホール', metadata: { type: 'external' as const, atmosphere: '業界リーダーとしての地位', formality: 'very_formal' as const, businessRelevance: 10 } },
                { name: '自社ビル最上階の役員室', metadata: { type: 'office' as const, atmosphere: '確立された企業の威厳', formality: 'very_formal' as const, businessRelevance: 9 } },
                { name: 'イノベーションラボ', metadata: { type: 'office' as const, atmosphere: '次世代技術への投資空間', formality: 'semi_formal' as const, businessRelevance: 9 } },
                { name: '企業リトリート会場', metadata: { type: 'external' as const, atmosphere: '企業文化と戦略の再構築', formality: 'semi_formal' as const, businessRelevance: 8 } }
            ],
            timeContexts: ['業界リーダーとしての基調講演', '次世代戦略の策定時間', '企業文化の再定義', '持続可能性への取り組み'],
            atmospheres: ['業界リーダーとしての責任', '次世代への投資意欲', '企業の社会的使命', '持続的成長への決意']
        }
    };

    /**
     * コンストラクタ
     */
    constructor(private options?: ManagerConstructorOptions) {}

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('WorldContextManager already initialized');
            return;
        }

        try {
            await this.loadFromStorage();
            this.initialized = true;
            logger.info('WorldContextManager initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize WorldContextManager', { 
                error: error instanceof Error ? error.message : String(error) 
            });
            this.initialized = true;
        }
    }

    /**
     * ストレージからデータを読み込む
     */
    private async loadFromStorage(): Promise<void> {
        try {
            const stateExists = await this.storageExists('narrative-memory/world-context.json');

            if (stateExists) {
                const content = await this.readFromStorage('narrative-memory/world-context.json');
                const data = JSON.parse(content);
                this.restoreFromData(data);
            }
        } catch (error) {
            logger.error('Failed to load WorldContextManager from storage', { 
                error: error instanceof Error ? error.message : String(error) 
            });
        }
    }

    /**
     * データから復元
     * @private
     */
    private restoreFromData(data: any): void {
        if (data.genre) this.genre = data.genre;
        if (data.previousLocation) this.previousLocation = data.previousLocation;
        if (data.currentLocation) this.currentLocation = data.currentLocation;
        if (data.currentTimeOfDay) this.currentTimeOfDay = data.currentTimeOfDay;
        if (data.currentWeather) this.currentWeather = data.currentWeather;
        if (data.currentAtmosphere) this.currentAtmosphere = data.currentAtmosphere;
        if (data.currentBusinessPhase) this.currentBusinessPhase = data.currentBusinessPhase;
        if (data.currentArcNumber) this.currentArcNumber = data.currentArcNumber;
        if (data.environmentHistory && Array.isArray(data.environmentHistory)) {
            this.environmentHistory = data.environmentHistory;
        }
    }

    /**
     * ストレージにパスが存在するか確認
     */
    private async storageExists(path: string): Promise<boolean> {
        try {
            return await storageProvider.fileExists(path);
        } catch (error) {
            return false;
        }
    }

    /**
     * ストレージからデータを読み込む
     */
    private async readFromStorage(path: string): Promise<string> {
        try {
            const exists = await storageProvider.fileExists(path);
            if (exists) {
                return await storageProvider.readFile(path);
            } else {
                logger.warn(`File does not exist: ${path}`);
                return '{}';
            }
        } catch (error) {
            logger.error(`Error reading file: ${path}`, { error });
            throw error;
        }
    }

    /**
     * データを保存する
     */
    async save(): Promise<void> {
        try {
            const data = {
                genre: this.genre,
                previousLocation: this.previousLocation,
                currentLocation: this.currentLocation,
                currentTimeOfDay: this.currentTimeOfDay,
                currentWeather: this.currentWeather,
                currentAtmosphere: this.currentAtmosphere,
                currentBusinessPhase: this.currentBusinessPhase,
                currentArcNumber: this.currentArcNumber,
                environmentHistory: this.environmentHistory
            };

            await this.writeToStorage('narrative-memory/world-context.json', JSON.stringify(data, null, 2));
            logger.debug('Saved WorldContextManager to storage');
        } catch (error) {
            logger.error('Failed to save WorldContextManager to storage', { 
                error: error instanceof Error ? error.message : String(error) 
            });
        }
    }

    /**
     * ストレージにデータを書き込む
     */
    private async writeToStorage(path: string, content: string): Promise<void> {
        try {
            await storageProvider.writeFile(path, content);
            logger.debug(`Wrote to file: ${path}`);
        } catch (error) {
            logger.error(`Error writing file: ${path}`, { error });
            throw error;
        }
    }

    /**
     * 章から世界設定を更新する
     */
    async updateFromChapter(chapter: Chapter, options?: UpdateOptions): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            logger.info(`Updating world context from chapter ${chapter.chapterNumber}`);

            // オプションからの更新
            if (options?.genre) {
                this.genre = options.genre;
                logger.debug(`Set genre to: ${this.genre}`);
            }
            if (options?.currentArcNumber) {
                this.currentArcNumber = options.currentArcNumber;
            }

            // 世界設定コンテキストの更新
            await this.updateWorldContext(chapter);

            // 履歴の記録
            this.recordEnvironmentContext();

            await this.save();
            logger.info(`Successfully updated world context from chapter ${chapter.chapterNumber}`);
        } catch (error) {
            logger.error(`Failed to update world context from chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber: chapter.chapterNumber
            });
            throw error;
        }
    }

    /**
     * 世界設定コンテキストを更新する
     */
    private async updateWorldContext(chapter: Chapter): Promise<void> {
        // ビジネスフェーズの推定
        if (this.genre === 'business') {
            this.currentBusinessPhase = this.estimateBusinessPhase(chapter.content, this.currentArcNumber);
        }

        // 環境要素の更新
        this.currentLocation = this.determineCurrentLocation();
        this.currentTimeOfDay = this.determineTimeOfDay();
        this.currentWeather = this.determineWeather();
        this.currentAtmosphere = this.determineAtmosphere();
    }

    /**
     * ビジネスフェーズを推定
     * @private
     */
    private estimateBusinessPhase(content: string, arcNumber: number): BusinessGrowthPhase {
        const contentLower = content.toLowerCase();

        // コンテンツキーワードに基づく推定
        if (contentLower.includes('アイデア') || contentLower.includes('構想') || contentLower.includes('企画')) {
            return BusinessGrowthPhase.IDEA;
        } else if (contentLower.includes('検証') || contentLower.includes('テスト') || contentLower.includes('フィードバック')) {
            return BusinessGrowthPhase.VALIDATION;
        } else if (contentLower.includes('初期') || contentLower.includes('トラクション') || contentLower.includes('成長')) {
            return BusinessGrowthPhase.EARLY_TRACTION;
        } else if (contentLower.includes('スケール') || contentLower.includes('拡大') || contentLower.includes('規模')) {
            return BusinessGrowthPhase.SCALE;
        } else if (contentLower.includes('展開') || contentLower.includes('グローバル') || contentLower.includes('海外')) {
            return BusinessGrowthPhase.EXPANSION;
        } else if (contentLower.includes('成熟') || contentLower.includes('安定') || contentLower.includes('リーダー')) {
            return BusinessGrowthPhase.MATURITY;
        }

        // アーク番号に基づくデフォルト推定
        if (arcNumber <= 1) return BusinessGrowthPhase.IDEA;
        if (arcNumber <= 2) return BusinessGrowthPhase.VALIDATION;
        if (arcNumber <= 3) return BusinessGrowthPhase.EARLY_TRACTION;
        if (arcNumber <= 4) return BusinessGrowthPhase.SCALE;
        if (arcNumber <= 5) return BusinessGrowthPhase.EXPANSION;
        return BusinessGrowthPhase.MATURITY;
    }

    /**
     * 現在の位置を推定する
     */
    public determineCurrentLocation(): string {
        if (this.genre === 'business') {
            return this.determineBusinessLocation();
        } else {
            return this.determineGeneralLocation();
        }
    }

    /**
     * ビジネス環境の場所を決定
     * @private
     */
    private determineBusinessLocation(): string {
        const phaseEnvironment = this.businessEnvironments[this.currentBusinessPhase];
        if (!phaseEnvironment) return 'オフィス';

        // 前回と異なる場所を選択
        let selectedLocation;
        do {
            const randomIndex = Math.floor(Math.random() * phaseEnvironment.locations.length);
            selectedLocation = phaseEnvironment.locations[randomIndex];
        } while (selectedLocation.name === this.previousLocation && phaseEnvironment.locations.length > 1);

        this.previousLocation = selectedLocation.name;
        return selectedLocation.name;
    }

    /**
     * 一般的なジャンルの場所を決定
     * @private
     */
    private determineGeneralLocation(): string {
        const locationsByGenre: Record<string, string[]> = {
            'fantasy': ['古城の大広間', '魔法の森の奥地', '山岳地帯の隠れ里', '村の集会所', '王都の宮殿'],
            'sci-fi': ['宇宙ステーションの司令室', '未来都市の高層ビル', '研究施設の実験室', '異星惑星の基地', 'サイバー空間の仮想会議室'],
            'mystery': ['古い洋館の書斎', '霧に包まれた街角', '警察署の取調室', '図書館の資料室', '秘密の地下室'],
            'romance': ['海辺のカフェ', '公園のベンチ', '学校の屋上', '職場の会議室', '夜景の見えるレストラン'],
            'classic': ['家のリビング', '街の中心部', '森の中の小道', '川のほとり', '山の頂上']
        };

        const possibleLocations = locationsByGenre[this.genre] || locationsByGenre['classic'];
        let newLocation;

        do {
            const index = Math.floor(Math.random() * possibleLocations.length);
            newLocation = possibleLocations[index];
        } while (newLocation === this.previousLocation && possibleLocations.length > 1);

        this.previousLocation = newLocation;
        return newLocation;
    }

    /**
     * 現在の時間帯を推定する
     */
    public determineTimeOfDay(): string {
        if (this.genre === 'business') {
            return this.determineBusinessTimeContext();
        } else {
            return this.determineGeneralTimeOfDay();
        }
    }

    /**
     * ビジネス時間コンテキストを決定
     * @private
     */
    private determineBusinessTimeContext(): string {
        const phaseEnvironment = this.businessEnvironments[this.currentBusinessPhase];
        if (!phaseEnvironment) return '通常営業時間';

        const randomIndex = Math.floor(Math.random() * phaseEnvironment.timeContexts.length);
        return phaseEnvironment.timeContexts[randomIndex];
    }

    /**
     * 一般的な時間帯を決定
     * @private
     */
    private determineGeneralTimeOfDay(): string {
        const timeOptions = [
            '早朝の静寂', '朝の爽やかな時間', '昼間の活動時間', 
            '夕方の落ち着いた時間', '夜の神秘的な時間', '深夜の静寂'
        ];
        const index = Math.floor(Math.random() * timeOptions.length);
        return timeOptions[index];
    }

    /**
     * 現在の天候を推定する
     */
    public determineWeather(): string {
        if (this.genre === 'business') {
            return this.determineBusinessAtmosphere();
        } else {
            return this.determineGeneralWeather();
        }
    }

    /**
     * ビジネス雰囲気を決定（天候の代替）
     * @private
     */
    private determineBusinessAtmosphere(): string {
        const phaseEnvironment = this.businessEnvironments[this.currentBusinessPhase];
        if (!phaseEnvironment) return '集中した作業環境';

        const randomIndex = Math.floor(Math.random() * phaseEnvironment.atmospheres.length);
        return phaseEnvironment.atmospheres[randomIndex];
    }

    /**
     * 一般的な天候を決定
     * @private
     */
    private determineGeneralWeather(): string {
        const weatherOptions = ['晴れ', '曇り', '小雨', '雪', '霧', '嵐の前'];
        const index = Math.floor(Math.random() * weatherOptions.length);
        return weatherOptions[index];
    }

    /**
     * 雰囲気を決定
     * @private
     */
    private determineAtmosphere(): string {
        if (this.genre === 'business') {
            // ビジネスジャンルでは専門的な雰囲気
            const atmospheres = [
                '集中と創造性に満ちた空間',
                '戦略的思考が求められる環境',
                'イノベーションと成長への期待',
                '競争と協力のバランス',
                'プロフェッショナルな緊張感',
                'チームワークと個人の成果への意識'
            ];
            return atmospheres[Math.floor(Math.random() * atmospheres.length)];
        } else {
            // 一般的な雰囲気
            const atmospheres = [
                '平和で穏やかな雰囲気',
                '緊張感のある空気',
                '神秘的で不思議な感覚',
                '温かく親しみやすい環境',
                '冒険心をくすぐる期待感',
                '静寂に包まれた集中空間'
            ];
            return atmospheres[Math.floor(Math.random() * atmospheres.length)];
        }
    }

    /**
     * 環境コンテキストを記録
     * @private
     */
    private recordEnvironmentContext(): void {
        const context: EnvironmentContext = {
            location: this.currentLocation,
            timeOfDay: this.currentTimeOfDay,
            weather: this.currentWeather,
            atmosphere: this.currentAtmosphere,
            businessPhase: this.genre === 'business' ? this.currentBusinessPhase : undefined,
            timestamp: new Date().toISOString()
        };

        this.environmentHistory.push(context);

        // 履歴の制限（最新50件まで）
        if (this.environmentHistory.length > 50) {
            this.environmentHistory = this.environmentHistory.slice(-50);
        }
    }

    // ============================================================================
    // パブリックメソッド
    // ============================================================================

    /**
     * 環境情報をまとめて取得
     */
    public getEnvironmentInfo(): { 
        location: string;
        timeOfDay: string;
        weather: string;
        atmosphere: string;
        businessPhase?: BusinessGrowthPhase;
    } {
        return {
            location: this.currentLocation,
            timeOfDay: this.currentTimeOfDay,
            weather: this.currentWeather,
            atmosphere: this.currentAtmosphere,
            businessPhase: this.genre === 'business' ? this.currentBusinessPhase : undefined
        };
    }

    /**
     * 環境情報をまとめて設定
     */
    public setEnvironmentInfo(location: string, timeOfDay: string, weather: string, atmosphere?: string): void {
        this.currentLocation = location;
        this.currentTimeOfDay = timeOfDay;
        this.currentWeather = weather;
        if (atmosphere) {
            this.currentAtmosphere = atmosphere;
        }
    }

    /**
     * ビジネスフェーズを設定
     */
    public setBusinessPhase(phase: BusinessGrowthPhase): void {
        this.currentBusinessPhase = phase;
        // フェーズが変わった場合は環境を更新
        this.updateWorldContext({ content: '' } as Chapter);
    }

    /**
     * アーク番号を設定
     */
    public setArcNumber(arcNumber: number): void {
        this.currentArcNumber = arcNumber;
        // アーク番号が変わった場合は環境を更新
        this.updateWorldContext({ content: '' } as Chapter);
    }

    /**
     * 環境履歴を取得
     */
    public getEnvironmentHistory(limit?: number): EnvironmentContext[] {
        if (limit) {
            return this.environmentHistory.slice(-limit);
        }
        return [...this.environmentHistory];
    }

    /**
     * 特定の場所のメタデータを取得
     */
    public getLocationMetadata(locationName: string): LocationMetadata | null {
        if (this.genre !== 'business') return null;

        for (const phase of Object.values(this.businessEnvironments)) {
            const location = phase.locations.find(loc => loc.name === locationName);
            if (location) {
                return location.metadata;
            }
        }

        return null;
    }

    /**
     * 現在のビジネスフェーズに適した場所を提案
     */
    public suggestLocationsForCurrentPhase(): string[] {
        if (this.genre !== 'business') return [];

        const phaseEnvironment = this.businessEnvironments[this.currentBusinessPhase];
        return phaseEnvironment ? phaseEnvironment.locations.map(loc => loc.name) : [];
    }

    /**
     * ジャンルを設定
     */
    public setGenre(genre: string): void {
        this.genre = genre;
        logger.debug(`World context genre set to: ${this.genre}`);
    }

    /**
     * ジャンルを取得
     */
    public getGenre(): string {
        return this.genre;
    }

    /**
     * 環境の一貫性をチェック
     */
    public checkEnvironmentConsistency(): {
        isConsistent: boolean;
        issues: string[];
        suggestions: string[];
    } {
        const issues: string[] = [];
        const suggestions: string[] = [];

        // 最近の環境変化をチェック
        const recentHistory = this.environmentHistory.slice(-5);
        
        if (recentHistory.length >= 3) {
            // 場所の変化が激しすぎないかチェック
            const locationChanges = recentHistory.map(h => h.location);
            const uniqueLocations = new Set(locationChanges);
            
            if (uniqueLocations.size === locationChanges.length) {
                issues.push('場所の変化が頻繁すぎます');
                suggestions.push('同じ場所での連続したシーンを検討してください');
            }

            // ビジネスフェーズの一貫性チェック
            if (this.genre === 'business') {
                const phaseChanges = recentHistory
                    .map(h => h.businessPhase)
                    .filter(p => p !== undefined);
                
                const uniquePhases = new Set(phaseChanges);
                if (uniquePhases.size > 2) {
                    issues.push('ビジネスフェーズの変化が不自然です');
                    suggestions.push('ビジネスの成長段階に応じた環境設定を心がけてください');
                }
            }
        }

        return {
            isConsistent: issues.length === 0,
            issues,
            suggestions
        };
    }
}