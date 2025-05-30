// src/lib/memory/narrative/narrative-state-manager.ts
/**
 * @fileoverview 物語状態管理クラス（最適化版）
 * @description
 * 物語の状態（INTRODUCTION, JOURNEY, BATTLEなど）を管理し、
 * 状態遷移とターニングポイントを記録します。
 */

import { Chapter } from '@/types/chapters';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import {
    NarrativeState,
    NarrativeStateInfo,
    StateTransition,
    StagnationDetectionResult,
    TurningPoint,
    ManagerConstructorOptions,
    UpdateOptions,
    IManager
} from './types';

/**
 * @class NarrativeStateManager
 * @description 物語状態とターニングポイントを管理するクラス
 */
export class NarrativeStateManager implements IManager {
    private narrativeState: NarrativeState = NarrativeState.INTRODUCTION;
    private stateTransitions: StateTransition[] = [];
    private turningPoints: TurningPoint[] = [];
    private currentArcNumber: number = 1;
    private currentTheme: string = '物語の始まり';
    private arcStartChapter: number = 1;
    private arcEndChapter: number = -1;
    private arcCompleted: boolean = false;
    private genre: string = 'classic';
    private initialized: boolean = false;

    /**
     * コンストラクタ
     */
    constructor(private options?: ManagerConstructorOptions) {}

    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            logger.info('NarrativeStateManager already initialized');
            return;
        }

        try {
            await this.loadFromStorage();
            this.initialized = true;
            logger.info('NarrativeStateManager initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize NarrativeStateManager', { 
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
            const stateExists = await this.storageExists('narrative-memory/state.json');

            if (stateExists) {
                const stateContent = await this.readFromStorage('narrative-memory/state.json');
                const stateData = JSON.parse(stateContent);
                this.restoreFromStateData(stateData);
            }

            const turningPointsExists = await this.storageExists('narrative-memory/turning-points.json');
            if (turningPointsExists) {
                const turningPointsContent = await this.readFromStorage('narrative-memory/turning-points.json');
                const turningPointsData = JSON.parse(turningPointsContent) as TurningPoint[];
                this.turningPoints = turningPointsData;
            }
        } catch (error) {
            logger.error('Failed to load NarrativeStateManager from storage', { 
                error: error instanceof Error ? error.message : String(error) 
            });
        }
    }

    /**
     * 状態データからの復元
     * @private
     */
    private restoreFromStateData(stateData: any): void {
        if (stateData.currentState) {
            this.narrativeState = stateData.currentState;
        }
        if (stateData.currentArcNumber) {
            this.currentArcNumber = stateData.currentArcNumber;
        }
        if (stateData.currentTheme) {
            this.currentTheme = stateData.currentTheme;
        }
        if (stateData.arcStartChapter) {
            this.arcStartChapter = stateData.arcStartChapter;
        }
        if (stateData.arcEndChapter) {
            this.arcEndChapter = stateData.arcEndChapter;
        }
        if (stateData.arcCompleted !== undefined) {
            this.arcCompleted = stateData.arcCompleted;
        }
        if (stateData.stateTransitions && Array.isArray(stateData.stateTransitions)) {
            this.stateTransitions = stateData.stateTransitions;
        }
        if (stateData.turningPoints && Array.isArray(stateData.turningPoints)) {
            this.turningPoints = stateData.turningPoints;
        }
        if (stateData.genre) {
            this.genre = stateData.genre;
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
            const stateData = {
                currentState: this.narrativeState,
                currentArcNumber: this.currentArcNumber,
                currentTheme: this.currentTheme,
                arcStartChapter: this.arcStartChapter,
                arcEndChapter: this.arcEndChapter,
                arcCompleted: this.arcCompleted,
                stateTransitions: this.stateTransitions,
                turningPoints: this.turningPoints,
                genre: this.genre
            };

            await this.writeToStorage('narrative-memory/state.json', JSON.stringify(stateData, null, 2));
            await this.writeToStorage('narrative-memory/turning-points.json', JSON.stringify(this.turningPoints, null, 2));
            
            logger.debug('Saved NarrativeStateManager to storage');
        } catch (error) {
            logger.error('Failed to save NarrativeStateManager to storage', { 
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
     * 章から状態を更新する
     */
    async updateFromChapter(chapter: Chapter, options?: UpdateOptions): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            logger.info(`Updating narrative state from chapter ${chapter.chapterNumber}`);

            if (options?.genre) {
                this.genre = options.genre;
                logger.debug(`Set genre to: ${this.genre}`);
            }

            await this.updateNarrativeState(chapter);
            await this.save();

            logger.info(`Successfully updated narrative state from chapter ${chapter.chapterNumber}`);
        } catch (error) {
            logger.error(`Failed to update narrative state from chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber: chapter.chapterNumber
            });
            throw error;
        }
    }

    /**
     * 現在の物語状態を取得
     */
    async getCurrentState(chapterNumber: number): Promise<NarrativeStateInfo> {
        if (!this.initialized) {
            await this.initialize();
        }

        const stagnationResult = await this.detectStagnation(chapterNumber);
        const stagnationDetected = stagnationResult.detected;
        const suggestedNextState = this.suggestNextState();

        return {
            state: this.narrativeState,
            duration: this.getStateDuration(),
            tensionLevel: 5,
            stagnationDetected,
            suggestedNextState,
            location: '',
            timeOfDay: '',
            weather: '',
            presentCharacters: [],
            genre: this.genre,
            currentArcNumber: this.currentArcNumber,
            currentTheme: this.currentTheme,
            arcStartChapter: this.arcStartChapter,
            arcEndChapter: this.arcEndChapter,
            arcCompleted: this.arcCompleted,
            turningPoints: this.turningPoints,
        };
    }

    /**
     * 状態マシンの更新
     */
    private async updateNarrativeState(chapter: Chapter): Promise<void> {
        const previousState = this.narrativeState;
        let newState = previousState;

        const content = chapter.content.toLowerCase();

        if (this.genre === 'business') {
            newState = this.determineBusinessState(content);
        } else {
            newState = this.determineGeneralState(content, chapter.chapterNumber);
        }

        if (newState !== previousState) {
            this.recordStateTransition(previousState, newState, chapter.chapterNumber);
            this.narrativeState = newState;

            // 重要な状態遷移をターニングポイントとして記録
            const transitionInfo = this.evaluateStateTransition(previousState, newState);
            
            if (transitionInfo.isSignificant) {
                this.addTurningPoint({
                    chapter: chapter.chapterNumber,
                    description: transitionInfo.description,
                    significance: transitionInfo.significance
                });
            }
        }
    }

    /**
     * ビジネス状態の決定
     * @private
     */
    private determineBusinessState(content: string): NarrativeState {
        const businessStateKeywords = [
            { state: NarrativeState.MARKET_RESEARCH, keywords: ['競合', '市場シェア', '競争', '市場調査', 'ユーザーインタビュー', '顧客ニーズ'] },
            { state: NarrativeState.FUNDING_ROUND, keywords: ['資金調達', '投資家', '資金'] },
            { state: NarrativeState.PRODUCT_DEVELOPMENT, keywords: ['開発', '設計', '製品'] },
            { state: NarrativeState.BUSINESS_PIVOT, keywords: ['ピボット', '方向転換', '戦略変更'] },
            { state: NarrativeState.BUSINESS_MEETING, keywords: ['会議', 'ミーティング', '打ち合わせ'] },
            { state: NarrativeState.PITCH_PRESENTATION, keywords: ['プレゼン', 'ピッチ', '提案'] },
            { state: NarrativeState.TEAM_BUILDING, keywords: ['チーム構築', '採用', '組織'] },
            { state: NarrativeState.PRODUCT_LAUNCH, keywords: ['ローンチ', 'リリース', '発売'] },
            { state: NarrativeState.MARKET_COMPETITION, keywords: ['競合対策', '市場競争', '競争戦略'] },
            { state: NarrativeState.FINANCIAL_CHALLENGE, keywords: ['資金不足', '財務危機', '経営難'] },
            { state: NarrativeState.CRISIS_MANAGEMENT, keywords: ['危機管理', '緊急対応', '問題解決'] }
        ];

        for (const { state, keywords } of businessStateKeywords) {
            if (keywords.some(keyword => content.includes(keyword))) {
                return state;
            }
        }

        return this.narrativeState; // 変化なし
    }

    /**
     * 一般的な状態の決定
     * @private
     */
    private determineGeneralState(content: string, chapterNumber: number): NarrativeState {
        const generalStateKeywords = [
            { state: NarrativeState.BATTLE, keywords: ['戦闘', '攻撃', '戦い'] },
            { state: NarrativeState.JOURNEY, keywords: ['旅', '移動', '出発'] },
            { state: NarrativeState.INVESTIGATION, keywords: ['調査', '探索', '謎'] },
            { state: NarrativeState.TRAINING, keywords: ['訓練', '修行', '練習'] },
            { state: NarrativeState.REVELATION, keywords: ['発見', '真実', '明らか'] },
            { state: NarrativeState.DILEMMA, keywords: ['葛藤', '迷い', '悩み'] },
            { state: NarrativeState.RESOLUTION, keywords: ['解決', '成功', '達成'] }
        ];

        for (const { state, keywords } of generalStateKeywords) {
            if (keywords.some(keyword => content.includes(keyword))) {
                return state;
            }
        }

        if (chapterNumber <= 2) {
            return NarrativeState.INTRODUCTION;
        }

        return this.narrativeState; // 変化なし
    }

    /**
     * 状態遷移の評価
     * @private
     */
    private evaluateStateTransition(
        fromState: NarrativeState, 
        toState: NarrativeState
    ): { isSignificant: boolean; description: string; significance: number } {
        let isSignificant = false;
        let significance = 5;
        let description = '';

        if (this.genre === 'business') {
            const businessTransitionMap = this.getBusinessTransitionMap();
            const transitionKey = `${fromState}->${toState}`;
            const transitionInfo = businessTransitionMap[transitionKey];
            
            if (transitionInfo) {
                isSignificant = true;
                significance = transitionInfo.significance;
                description = transitionInfo.description;
            } else {
                description = `ビジネスが「${fromState}」から「${toState}」フェーズへと移行`;
                significance = 6;
                isSignificant = true;
            }
        } else {
            const generalTransitionMap = this.getGeneralTransitionMap();
            const transitionKey = `${fromState}->${toState}`;
            const transitionInfo = generalTransitionMap[transitionKey];
            
            if (transitionInfo) {
                isSignificant = true;
                significance = transitionInfo.significance;
                description = transitionInfo.description;
            } else {
                description = `物語が「${fromState}」から「${toState}」へと移行`;
                significance = 5;
                isSignificant = true;
            }
        }

        return { isSignificant, description, significance };
    }

    /**
     * ビジネス遷移マップ
     * @private
     */
    private getBusinessTransitionMap(): Record<string, { description: string; significance: number }> {
        return {
            [`${NarrativeState.MARKET_RESEARCH}->${NarrativeState.PRODUCT_DEVELOPMENT}`]: {
                description: '市場調査の結果を踏まえ、製品開発フェーズに移行',
                significance: 6
            },
            [`${NarrativeState.PRODUCT_DEVELOPMENT}->${NarrativeState.PITCH_PRESENTATION}`]: {
                description: '製品プロトタイプの完成により投資家へのピッチ段階に移行',
                significance: 7
            },
            [`${NarrativeState.PITCH_PRESENTATION}->${NarrativeState.FUNDING_ROUND}`]: {
                description: '成功したピッチを受けて本格的な資金調達段階に移行',
                significance: 8
            },
            [`${NarrativeState.FUNDING_ROUND}->${NarrativeState.PRODUCT_LAUNCH}`]: {
                description: '資金調達の成功により製品ローンチの準備が整う',
                significance: 9
            },
            [`${NarrativeState.BUSINESS_PIVOT}->${NarrativeState.MARKET_RESEARCH}`]: {
                description: 'ビジネスモデルの転換により新たな市場調査が必要に',
                significance: 8
            },
            [`${NarrativeState.CUSTOMER_DISCOVERY}->${NarrativeState.PRODUCT_DEVELOPMENT}`]: {
                description: '顧客検証の結果を基にした製品開発の開始',
                significance: 7
            }
        };
    }

    /**
     * 一般遷移マップ
     * @private
     */
    private getGeneralTransitionMap(): Record<string, { description: string; significance: number }> {
        return {
            [`${NarrativeState.INTRODUCTION}->${NarrativeState.JOURNEY}`]: {
                description: '物語の導入から本格的な冒険の始まり',
                significance: 7
            },
            [`${NarrativeState.INVESTIGATION}->${NarrativeState.REVELATION}`]: {
                description: '調査の結果、重要な真実が明らかに',
                significance: 8
            },
            [`${NarrativeState.REVELATION}->${NarrativeState.DILEMMA}`]: {
                description: '真実の発覚により主人公が重大な選択に直面',
                significance: 7
            },
            [`${NarrativeState.DILEMMA}->${NarrativeState.RESOLUTION}`]: {
                description: '葛藤の末に決断を下し、問題解決へ',
                significance: 8
            },
            [`${NarrativeState.PRE_BATTLE}->${NarrativeState.BATTLE}`]: {
                description: '戦闘準備から実際の戦闘へ',
                significance: 7
            },
            [`${NarrativeState.BATTLE}->${NarrativeState.POST_BATTLE}`]: {
                description: '戦闘の終了と結果の処理',
                significance: 6
            },
            [`${NarrativeState.RESOLUTION}->${NarrativeState.CLOSURE}`]: {
                description: '問題解決から物語の締めくくりへ',
                significance: 9
            }
        };
    }

    /**
     * ターニングポイントを追加
     */
    public addTurningPoint(turningPoint: TurningPoint): void {
        turningPoint.timestamp = new Date().toISOString();

        const existingIndex = this.turningPoints.findIndex(tp => tp.chapter === turningPoint.chapter);

        if (existingIndex >= 0) {
            if (turningPoint.significance > this.turningPoints[existingIndex].significance) {
                this.turningPoints[existingIndex] = turningPoint;
            }
        } else {
            this.turningPoints.push(turningPoint);
        }

        this.turningPoints.sort((a, b) => b.significance - a.significance);

        if (this.turningPoints.length > 10) {
            this.turningPoints = this.turningPoints.slice(0, 10);
        }

        logger.debug(`Added turning point at chapter ${turningPoint.chapter}`);
    }

    /**
     * 状態遷移を記録
     */
    public recordStateTransition(fromState: NarrativeState, toState: NarrativeState, chapterNumber: number): void {
        const transition: StateTransition = {
            fromState,
            toState,
            chapter: chapterNumber,
            timestamp: new Date().toISOString()
        };

        this.stateTransitions.push(transition);
        logger.debug(`Recorded state transition from ${fromState} to ${toState} at chapter ${chapterNumber}`);
    }

    /**
     * 停滞を検出
     */
    public async detectStagnation(chapterNumber: number): Promise<StagnationDetectionResult> {
        const duration = this.getStateDuration();
        let threshold = 3;

        if (this.genre === 'business') {
            threshold = this.getBusinessStagnationThreshold();
        } else {
            threshold = this.getGeneralStagnationThreshold();
        }

        const detected = duration > threshold;

        if (!detected) {
            return {
                detected: false,
                cause: '',
                score: 0,
                severity: 'LOW',
                recommendations: []
            };
        }

        const cause = `${this.narrativeState}状態が${duration}章続いており、読者の興味が薄れる可能性があります`;
        const recommendations = this.getStagnationRecommendations();

        return {
            detected,
            cause,
            score: Math.min(100, duration * 25),
            severity: duration > threshold + 2 ? 'HIGH' : 'MEDIUM',
            recommendations
        };
    }

    /**
     * ビジネスジャンルでの停滞閾値
     * @private
     */
    private getBusinessStagnationThreshold(): number {
        switch (this.narrativeState) {
            case NarrativeState.PRODUCT_DEVELOPMENT:
                return 2;
            case NarrativeState.BUSINESS_MEETING:
                return 1;
            case NarrativeState.MARKET_RESEARCH:
                return 2;
            default:
                return 2;
        }
    }

    /**
     * 一般ジャンルでの停滞閾値
     * @private
     */
    private getGeneralStagnationThreshold(): number {
        switch (this.narrativeState) {
            case NarrativeState.BATTLE:
            case NarrativeState.REVELATION:
                return 2;
            case NarrativeState.JOURNEY:
            case NarrativeState.DAILY_LIFE:
                return 4;
            default:
                return 3;
        }
    }

    /**
     * 停滞時の推奨事項
     * @private
     */
    private getStagnationRecommendations(): string[] {
        if (this.genre === 'business') {
            return this.getBusinessStagnationRecommendations();
        } else {
            return this.getGeneralStagnationRecommendations();
        }
    }

    /**
     * ビジネスジャンルでの停滞推奨事項
     * @private
     */
    private getBusinessStagnationRecommendations(): string[] {
        switch (this.narrativeState) {
            case NarrativeState.PRODUCT_DEVELOPMENT:
                return [
                    '製品開発の重要なマイルストーンを達成し、次のフェーズに移行させる',
                    '予期せぬ技術的課題が発生し、戦略の見直しを迫る',
                    '顧客フィードバックを得て、方向転換の必要性を検討する'
                ];
            case NarrativeState.BUSINESS_MEETING:
                return [
                    '重要な決断を下し、実行フェーズに移行する',
                    '対立する意見の衝突から新たな葛藤を生み出す',
                    '外部からの予期せぬ情報が会議の方向性を変える'
                ];
            case NarrativeState.MARKET_RESEARCH:
                return [
                    '市場調査から重要な洞察を得て、戦略の転換点に達する',
                    '予想外の市場トレンドを発見し、新たな機会に気づく',
                    '競合分析から戦略的脅威を特定し、対応を検討する'
                ];
            default:
                return [
                    '事業フェーズの転換点を導入する',
                    '外部環境の変化（市場、競合、規制など）を取り入れる',
                    'チーム内の関係性や役割の変化を促す'
                ];
        }
    }

    /**
     * 一般ジャンルでの停滞推奨事項
     * @private
     */
    private getGeneralStagnationRecommendations(): string[] {
        switch (this.narrativeState) {
            case NarrativeState.JOURNEY:
                return [
                    '新たな場所や環境への到着',
                    '予期せぬ障害や敵との遭遇',
                    '重要な発見や啓示'
                ];
            case NarrativeState.BATTLE:
                return [
                    '決定的な勝利または敗北',
                    '戦いの状況を一変させる新要素の導入',
                    '戦術的な撤退や停戦'
                ];
            default:
                return [
                    '新たな課題や脅威の導入',
                    'キャラクターの関係性の変化',
                    '予想外の展開や啓示'
                ];
        }
    }

    /**
     * 次の推奨状態を提案
     */
    public suggestNextState(): NarrativeState {
        if (this.genre === 'business') {
            return this.suggestBusinessNextState();
        } else {
            return this.suggestGeneralNextState();
        }
    }

    /**
     * ビジネスジャンルでの次状態提案
     * @private
     */
    private suggestBusinessNextState(): NarrativeState {
        const businessNextStateMap: Record<string, NarrativeState[]> = {
            [NarrativeState.INTRODUCTION]: [NarrativeState.BUSINESS_MEETING, NarrativeState.MARKET_RESEARCH, NarrativeState.TEAM_BUILDING],
            [NarrativeState.BUSINESS_MEETING]: [NarrativeState.PRODUCT_DEVELOPMENT, NarrativeState.MARKET_RESEARCH, NarrativeState.BUSINESS_PIVOT],
            [NarrativeState.PRODUCT_DEVELOPMENT]: [NarrativeState.PITCH_PRESENTATION, NarrativeState.CUSTOMER_DISCOVERY, NarrativeState.BUSINESS_PIVOT],
            [NarrativeState.PITCH_PRESENTATION]: [NarrativeState.FUNDING_ROUND, NarrativeState.BUSINESS_PIVOT, NarrativeState.MARKET_RESEARCH],
            [NarrativeState.MARKET_RESEARCH]: [NarrativeState.PRODUCT_DEVELOPMENT, NarrativeState.BUSINESS_PIVOT, NarrativeState.BUSINESS_MEETING],
            [NarrativeState.TEAM_BUILDING]: [NarrativeState.PRODUCT_DEVELOPMENT, NarrativeState.BUSINESS_MEETING, NarrativeState.PITCH_PRESENTATION],
            [NarrativeState.FUNDING_ROUND]: [NarrativeState.TEAM_BUILDING, NarrativeState.PRODUCT_LAUNCH, NarrativeState.PRODUCT_DEVELOPMENT],
            [NarrativeState.BUSINESS_PIVOT]: [NarrativeState.MARKET_RESEARCH, NarrativeState.PRODUCT_DEVELOPMENT, NarrativeState.PITCH_PRESENTATION],
            [NarrativeState.CUSTOMER_DISCOVERY]: [NarrativeState.PRODUCT_DEVELOPMENT, NarrativeState.BUSINESS_PIVOT, NarrativeState.PRODUCT_LAUNCH],
            [NarrativeState.PRODUCT_LAUNCH]: [NarrativeState.MARKET_RESEARCH, NarrativeState.BUSINESS_MEETING, NarrativeState.RESOLUTION],
            [NarrativeState.RESOLUTION]: [NarrativeState.CLOSURE, NarrativeState.INTRODUCTION],
            [NarrativeState.CLOSURE]: [NarrativeState.INTRODUCTION, NarrativeState.DAILY_LIFE]
        };

        const options = businessNextStateMap[this.narrativeState] || [NarrativeState.BUSINESS_MEETING];
        return this.selectStateBasedOnArcPhase(options);
    }

    /**
     * 一般ジャンルでの次状態提案
     * @private
     */
    private suggestGeneralNextState(): NarrativeState {
        const nextStateMap: Record<string, NarrativeState[]> = {
            [NarrativeState.INTRODUCTION]: [NarrativeState.DAILY_LIFE, NarrativeState.JOURNEY],
            [NarrativeState.DAILY_LIFE]: [NarrativeState.REVELATION, NarrativeState.JOURNEY, NarrativeState.DILEMMA],
            [NarrativeState.JOURNEY]: [NarrativeState.INVESTIGATION, NarrativeState.PRE_BATTLE, NarrativeState.REVELATION],
            [NarrativeState.INVESTIGATION]: [NarrativeState.REVELATION, NarrativeState.PRE_BATTLE, NarrativeState.DILEMMA],
            [NarrativeState.PRE_BATTLE]: [NarrativeState.BATTLE],
            [NarrativeState.BATTLE]: [NarrativeState.POST_BATTLE],
            [NarrativeState.POST_BATTLE]: [NarrativeState.RESOLUTION, NarrativeState.JOURNEY, NarrativeState.DAILY_LIFE],
            [NarrativeState.TRAINING]: [NarrativeState.JOURNEY, NarrativeState.PRE_BATTLE],
            [NarrativeState.REVELATION]: [NarrativeState.DILEMMA, NarrativeState.JOURNEY, NarrativeState.PRE_BATTLE],
            [NarrativeState.DILEMMA]: [NarrativeState.RESOLUTION, NarrativeState.JOURNEY, NarrativeState.PRE_BATTLE],
            [NarrativeState.RESOLUTION]: [NarrativeState.CLOSURE, NarrativeState.DAILY_LIFE, NarrativeState.JOURNEY],
            [NarrativeState.CLOSURE]: [NarrativeState.INTRODUCTION, NarrativeState.DAILY_LIFE]
        };

        const options = nextStateMap[this.narrativeState] || [NarrativeState.DAILY_LIFE];
        return options[0];
    }

    /**
     * アークフェーズに基づく状態選択
     * @private
     */
    private selectStateBasedOnArcPhase(options: NarrativeState[]): NarrativeState {
        if (this.currentArcNumber <= 1) {
            const earlyStageStates = [
                NarrativeState.CUSTOMER_DISCOVERY,
                NarrativeState.MARKET_RESEARCH,
                NarrativeState.PRODUCT_DEVELOPMENT,
                NarrativeState.PITCH_PRESENTATION
            ];

            for (const option of options) {
                if (earlyStageStates.includes(option)) {
                    return option;
                }
            }
        } else if (this.currentArcNumber >= 3) {
            const lateStageStates = [
                NarrativeState.PRODUCT_LAUNCH,
                NarrativeState.TEAM_BUILDING,
                NarrativeState.RESOLUTION,
                NarrativeState.FUNDING_ROUND
            ];

            for (const option of options) {
                if (lateStageStates.includes(option)) {
                    return option;
                }
            }
        }

        return options[0];
    }

    /**
     * 状態継続期間を計算
     */
    public getStateDuration(): number {
        if (this.stateTransitions.length === 0) {
            return 1;
        }

        const relevantTransitions = this.stateTransitions
            .filter(t => t.toState === this.narrativeState)
            .sort((a, b) => b.chapter - a.chapter);

        if (relevantTransitions.length === 0) {
            return 1;
        }

        const latestChapter = this.getLatestChapterNumber();
        const transitionChapter = relevantTransitions[0].chapter;

        return latestChapter - transitionChapter + 1;
    }

    /**
     * 最新の章番号を取得
     */
    private getLatestChapterNumber(): number {
        if (this.stateTransitions.length === 0) {
            return 1;
        }

        return Math.max(...this.stateTransitions.map(t => t.chapter));
    }

    // ============================================================================
    // パブリックメソッド
    // ============================================================================

    public getTurningPoints(): TurningPoint[] {
        return [...this.turningPoints];
    }

    public setGenre(genre: string): void {
        this.genre = genre;
    }

    public getGenre(): string {
        return this.genre;
    }

    public setArcInfo(arcNumber: number, theme: string, startChapter: number, endChapter: number = -1, completed: boolean = false): void {
        this.currentArcNumber = arcNumber;
        this.currentTheme = theme;
        this.arcStartChapter = startChapter;
        this.arcEndChapter = endChapter;
        this.arcCompleted = completed;
    }

    public getArcInfo(): { arcNumber: number, theme: string, startChapter: number, endChapter: number, completed: boolean } {
        return {
            arcNumber: this.currentArcNumber,
            theme: this.currentTheme,
            startChapter: this.arcStartChapter,
            endChapter: this.arcEndChapter,
            completed: this.arcCompleted
        };
    }
}