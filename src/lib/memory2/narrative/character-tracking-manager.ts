// src/lib/memory/narrative/character-tracking-manager.ts
/**
 * @fileoverview キャラクタートラッキング管理クラス（最適化版）
 * @description
 * キャラクターの出現、進行状況、および変化を追跡します。
 * 統合型定義に対応し、ジャンル特化の機能を提供します。
 */

import { Chapter } from '@/types/chapters';
import { logger } from '@/lib/utils/logger';
import { storageProvider } from '@/lib/storage';
import {
    CharacterProgress,
    CharacterChangeInfo,
    ManagerConstructorOptions,
    UpdateOptions,
    IManager,
    NarrativeState,
    BusinessEventType
} from './types';

/**
 * @interface CharacterDevelopmentEvent
 * @description キャラクター発展イベント
 */
interface CharacterDevelopmentEvent {
    type: 'skill_acquisition' | 'relationship_change' | 'role_change' | 'personality_shift' | 'business_achievement';
    description: string;
    significance: number;
    relatedCharacters?: string[];
    businessContext?: BusinessEventType;
}

/**
 * @class CharacterTrackingManager
 * @description キャラクターの進行状況を管理するクラス（最適化版）
 */
export class CharacterTrackingManager implements IManager {
    private characterProgress: Map<string, CharacterProgress> = new Map();
    private characterChanges: Map<string, CharacterChangeInfo[]> = new Map();
    private genre: string = 'classic';
    private initialized: boolean = false;

    // キャラクター名抽出の改善された正規表現パターン
    private readonly characterPatterns = {
        quoted: /「([^」]{1,15})」/g,
        japanese: /([一-龯]{2,8})(は|が|の|を|に|で|と|から|まで)/g,
        businessTitles: /(CEO|CTO|CFO|CMO|COO|VP|部長|課長|主任|マネージャー|ディレクター|エンジニア|デザイナー|営業|投資家)([一-龯ぁ-んァ-ヶa-zA-Z]{1,10})/g,
        roleNames: /(創業者|共同創業者|エンジェル投資家|VC|顧客|ユーザー|競合|パートナー)([一-龯ぁ-んァ-ヶa-zA-Z]{1,10})/g
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
            logger.info('CharacterTrackingManager already initialized');
            return;
        }

        try {
            await this.loadFromStorage();
            this.initialized = true;
            logger.info('CharacterTrackingManager initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize CharacterTrackingManager', { 
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
            // キャラクター進行データを読み込む
            const charactersExists = await this.storageExists('narrative-memory/characters.json');
            if (charactersExists) {
                const charactersContent = await this.readFromStorage('narrative-memory/characters.json');
                const charactersData = JSON.parse(charactersContent) as CharacterProgress[];

                for (const character of charactersData) {
                    this.characterProgress.set(character.name, character);
                }
            }

            // キャラクター変化データを読み込む
            const changesExists = await this.storageExists('narrative-memory/character-changes.json');
            if (changesExists) {
                const changesContent = await this.readFromStorage('narrative-memory/character-changes.json');
                const changesData = JSON.parse(changesContent);

                // Map形式に復元
                for (const [characterName, changes] of Object.entries(changesData)) {
                    this.characterChanges.set(characterName, changes as CharacterChangeInfo[]);
                }
            }

            // ジャンル設定を読み込む
            const configExists = await this.storageExists('narrative-memory/character-tracking-config.json');
            if (configExists) {
                const configContent = await this.readFromStorage('narrative-memory/character-tracking-config.json');
                const configData = JSON.parse(configContent);
                if (configData.genre) {
                    this.genre = configData.genre;
                }
            }
        } catch (error) {
            logger.error('Failed to load CharacterTrackingManager from storage', { 
                error: error instanceof Error ? error.message : String(error) 
            });
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
                return this.getDefaultContent(path);
            }
        } catch (error) {
            logger.error(`Error reading file: ${path}`, { error });
            throw error;
        }
    }

    /**
     * デフォルトコンテンツを取得
     * @private
     */
    private getDefaultContent(path: string): string {
        if (path.includes('character-changes.json')) {
            return '{}';
        }
        return '[]';
    }

    /**
     * データを保存する
     */
    async save(): Promise<void> {
        try {
            // キャラクター進行データを保存
            await this.writeToStorage('narrative-memory/characters.json',
                JSON.stringify(Array.from(this.characterProgress.values()), null, 2));
            
            // キャラクター変化データを保存
            const changesObject = Object.fromEntries(this.characterChanges.entries());
            await this.writeToStorage('narrative-memory/character-changes.json',
                JSON.stringify(changesObject, null, 2));

            // 設定を保存
            const config = { genre: this.genre };
            await this.writeToStorage('narrative-memory/character-tracking-config.json',
                JSON.stringify(config, null, 2));
            
            logger.debug('Saved CharacterTrackingManager to storage');
        } catch (error) {
            logger.error('Failed to save CharacterTrackingManager to storage', { 
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
     * 章からキャラクター情報を更新する
     */
    async updateFromChapter(chapter: Chapter, options?: UpdateOptions): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            logger.info(`Updating character tracking from chapter ${chapter.chapterNumber}`);

            // ジャンル情報の更新
            if (options?.genre) {
                this.genre = options.genre;
                logger.debug(`Set genre to: ${this.genre}`);
            }

            // キャラクター進行状況の更新
            await this.updateCharacters(chapter);

            // キャラクター発展の分析
            await this.analyzeCharacterDevelopment(chapter);

            await this.save();
            logger.info(`Successfully updated character tracking from chapter ${chapter.chapterNumber}`);
        } catch (error) {
            logger.error(`Failed to update character tracking from chapter ${chapter.chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error),
                chapterNumber: chapter.chapterNumber
            });
            throw error;
        }
    }

    /**
     * キャラクターの進行状況を更新する
     */
    private async updateCharacters(chapter: Chapter): Promise<void> {
        // 改善されたキャラクター名抽出
        const characterNames = this.extractCharacterNamesFromContent(chapter.content);

        // 存在するキャラクターの更新
        characterNames.forEach(name => {
            if (!this.characterProgress.has(name)) {
                // 新キャラクターの初期化
                this.characterProgress.set(name, {
                    name,
                    firstAppearance: chapter.chapterNumber,
                    lastAppearance: chapter.chapterNumber,
                    appearanceCount: 1,
                    developmentPoints: []
                });
                logger.info(`New character detected: ${name}`);
            } else {
                // 既存キャラクターの更新
                const character = this.characterProgress.get(name)!;
                character.lastAppearance = chapter.chapterNumber;
                character.appearanceCount++;
            }
        });

        // 発展ポイントの検出
        characterNames.forEach(name => {
            const developmentEvents = this.detectDevelopmentEvents(name, chapter.content, chapter.chapterNumber);
            if (developmentEvents.length > 0) {
                const character = this.characterProgress.get(name)!;
                character.developmentPoints.push(...developmentEvents.map(event => ({
                    chapter: chapter.chapterNumber,
                    event: event.description,
                    timestamp: new Date().toISOString()
                })));
            }
        });
    }

    /**
     * コンテンツからキャラクター名を抽出する（改善版）
     */
    public extractCharacterNamesFromContent(content: string): Set<string> {
        const nameSet = new Set<string>();

        // パターン1: 「名前」形式
        const quotedMatches = Array.from(content.matchAll(this.characterPatterns.quoted));
        for (const match of quotedMatches) {
            const name = match[1].trim();
            if (this.isValidCharacterName(name)) {
                nameSet.add(name);
            }
        }

        // パターン2: 日本語名詞＋助詞
        const japaneseMatches = Array.from(content.matchAll(this.characterPatterns.japanese));
        for (const match of japaneseMatches) {
            const name = match[1].trim();
            if (this.isValidCharacterName(name)) {
                nameSet.add(name);
            }
        }

        // パターン3: ビジネス特化（役職名＋名前）
        if (this.genre === 'business') {
            const businessMatches = Array.from(content.matchAll(this.characterPatterns.businessTitles));
            for (const match of businessMatches) {
                const title = match[1];
                const name = match[2].trim();
                if (this.isValidCharacterName(name)) {
                    nameSet.add(`${title}${name}`);
                    nameSet.add(name); // 名前のみも追加
                }
            }

            const roleMatches = Array.from(content.matchAll(this.characterPatterns.roleNames));
            for (const match of roleMatches) {
                const role = match[1];
                const name = match[2].trim();
                if (this.isValidCharacterName(name)) {
                    nameSet.add(`${role}${name}`);
                    nameSet.add(name); // 名前のみも追加
                }
            }
        }

        return nameSet;
    }

    /**
     * 有効なキャラクター名かどうかを判定
     * @private
     */
    private isValidCharacterName(name: string): boolean {
        // 長さチェック
        if (name.length < 2 || name.length > 15) {
            return false;
        }

        // 一般的でない単語を除外
        const excludeWords = [
            '会社', '企業', '市場', '製品', '商品', 'サービス', '技術', '開発',
            '営業', '販売', '顧客', 'ユーザー', '投資', '資金', '利益', '売上',
            '時間', '場所', '状況', '問題', '解決', '方法', '結果', '効果',
            '今日', '明日', '昨日', '今回', '次回', '前回', '最初', '最後',
            '自分', '相手', '皆さん', 'みなさん', 'こちら', 'そちら', 'あちら'
        ];

        if (excludeWords.includes(name)) {
            return false;
        }

        // 数字のみは除外
        if (/^\d+$/.test(name)) {
            return false;
        }

        return true;
    }

    /**
     * キャラクター発展イベントを検出
     * @private
     */
    private detectDevelopmentEvents(characterName: string, content: string, chapterNumber: number): CharacterDevelopmentEvent[] {
        const events: CharacterDevelopmentEvent[] = [];

        if (this.genre === 'business') {
            events.push(...this.detectBusinessDevelopmentEvents(characterName, content, chapterNumber));
        } else {
            events.push(...this.detectGeneralDevelopmentEvents(characterName, content, chapterNumber));
        }

        return events;
    }

    /**
     * ビジネス特化の発展イベント検出
     * @private
     */
    private detectBusinessDevelopmentEvents(characterName: string, content: string, chapterNumber: number): CharacterDevelopmentEvent[] {
        const events: CharacterDevelopmentEvent[] = [];

        const businessPatterns = [
            {
                pattern: new RegExp(`${characterName}.*(昇進|昇格|昇任|役職|ポジション|地位)`, 'g'),
                type: 'role_change' as const,
                significance: 8,
                businessContext: BusinessEventType.LEADERSHIP_CHANGE
            },
            {
                pattern: new RegExp(`${characterName}.*(スキル|能力|技術|知識|経験).*?(向上|習得|獲得|身につけ)`, 'g'),
                type: 'skill_acquisition' as const,
                significance: 6,
                businessContext: undefined
            },
            {
                pattern: new RegExp(`${characterName}.*(成功|達成|実現|獲得).*?(資金調達|投資|契約|取引)`, 'g'),
                type: 'business_achievement' as const,
                significance: 9,
                businessContext: BusinessEventType.FUNDING_ROUND
            },
            {
                pattern: new RegExp(`${characterName}.*(リーダーシップ|指導力|統率力|マネジメント).*?(発揮|向上|成長)`, 'g'),
                type: 'personality_shift' as const,
                significance: 7,
                businessContext: undefined
            },
            {
                pattern: new RegExp(`${characterName}.*(チーム|組織|部下|同僚).*?(関係|信頼|協力|連携).*?(改善|向上|深化)`, 'g'),
                type: 'relationship_change' as const,
                significance: 6,
                businessContext: BusinessEventType.TEAM_CONFLICT
            }
        ];

        for (const patternInfo of businessPatterns) {
            const matches = Array.from(content.matchAll(patternInfo.pattern));
            for (const match of matches) {
                events.push({
                    type: patternInfo.type,
                    description: match[0].substring(0, 100),
                    significance: patternInfo.significance,
                    businessContext: patternInfo.businessContext
                });
            }
        }

        return events;
    }

    /**
     * 一般的な発展イベント検出
     * @private
     */
    private detectGeneralDevelopmentEvents(characterName: string, content: string, chapterNumber: number): CharacterDevelopmentEvent[] {
        const events: CharacterDevelopmentEvent[] = [];

        const generalPatterns = [
            {
                pattern: new RegExp(`${characterName}.*(変わった|成長した|気づいた|決意した|悟った|覚醒した)`, 'g'),
                type: 'personality_shift' as const,
                significance: 8
            },
            {
                pattern: new RegExp(`${characterName}.*(技|能力|スキル|力).*?(習得|身につけ|覚え|学ん)`, 'g'),
                type: 'skill_acquisition' as const,
                significance: 7
            },
            {
                pattern: new RegExp(`${characterName}.*([一-龯ぁ-んァ-ヶ]{2,8}).*(関係|仲|友情|愛情|信頼).*?(変化|変わ|深ま|芽生)`, 'g'),
                type: 'relationship_change' as const,
                significance: 6
            }
        ];

        for (const patternInfo of generalPatterns) {
            const matches = Array.from(content.matchAll(patternInfo.pattern));
            for (const match of matches) {
                events.push({
                    type: patternInfo.type,
                    description: match[0].substring(0, 100),
                    significance: patternInfo.significance
                });
            }
        }

        return events;
    }

    /**
     * キャラクター発展の分析
     * @private
     */
    private async analyzeCharacterDevelopment(chapter: Chapter): Promise<void> {
        const characterNames = Array.from(this.characterProgress.keys());

        for (const characterName of characterNames) {
            const character = this.characterProgress.get(characterName)!;
            
            // 最近の出現状況を分析
            if (character.lastAppearance === chapter.chapterNumber) {
                // このキャラクターが今回の章に出現した場合、詳細分析を行う
                const developmentAnalysis = await this.performDevelopmentAnalysis(characterName, chapter.content);
                
                if (developmentAnalysis.hasSignificantChange) {
                    character.developmentPoints.push({
                        chapter: chapter.chapterNumber,
                        event: developmentAnalysis.changeDescription,
                        timestamp: new Date().toISOString()
                    });

                    // 変化情報を記録
                    this.recordCharacterChange(characterName, developmentAnalysis.changes);
                }
            }
        }
    }

    /**
     * キャラクター発展分析を実行
     * @private
     */
    private async performDevelopmentAnalysis(characterName: string, content: string): Promise<{
        hasSignificantChange: boolean;
        changeDescription: string;
        changes: CharacterChangeInfo[];
    }> {
        const changes: CharacterChangeInfo[] = [];
        
        // 簡易的な変化検出（実際のシステムではより高度な分析が必要）
        const changePatterns = this.getChangePatterns(characterName);
        let hasSignificantChange = false;
        let changeDescription = '';

        for (const pattern of changePatterns) {
            const matches = Array.from(content.matchAll(pattern.regex));
            if (matches.length > 0) {
                hasSignificantChange = true;
                changeDescription = matches[0][0];
                
                changes.push({
                    attribute: pattern.attribute,
                    previousValue: pattern.previousValue,
                    currentValue: pattern.currentValue,
                    classification: {
                        type: pattern.type,
                        scope: pattern.scope,
                        confidence: pattern.confidence,
                        explanation: pattern.explanation,
                        narrativeSignificance: pattern.narrativeSignificance
                    }
                });
                break; // 最初のマッチのみ処理
            }
        }

        return {
            hasSignificantChange,
            changeDescription,
            changes
        };
    }

    /**
     * 変化パターンを取得
     * @private
     */
    private getChangePatterns(characterName: string): Array<{
        regex: RegExp;
        attribute: string;
        previousValue: string;
        currentValue: string;
        type: string;
        scope: string;
        confidence: number;
        explanation: string;
        narrativeSignificance: number;
    }> {
        if (this.genre === 'business') {
            return [
                {
                    regex: new RegExp(`${characterName}.*(リーダー|指導者|CEO|責任者).*になった`, 'g'),
                    attribute: 'role',
                    previousValue: '一般社員',
                    currentValue: 'リーダー',
                    type: '役職変化',
                    scope: '組織全体',
                    confidence: 0.8,
                    explanation: 'キャラクターが組織のリーダー的役割を担うようになった',
                    narrativeSignificance: 0.9
                },
                {
                    regex: new RegExp(`${characterName}.*(自信|信念|決意).*?(得た|持った|固まった)`, 'g'),
                    attribute: 'personality',
                    previousValue: '迷いがある',
                    currentValue: '確信を持っている',
                    type: '性格変化',
                    scope: '個人',
                    confidence: 0.7,
                    explanation: 'キャラクターの内面的な成長が見られる',
                    narrativeSignificance: 0.8
                }
            ];
        } else {
            return [
                {
                    regex: new RegExp(`${characterName}.*(強く|勇敢|勇気).*なった`, 'g'),
                    attribute: 'personality',
                    previousValue: '臆病',
                    currentValue: '勇敢',
                    type: '性格変化',
                    scope: '個人',
                    confidence: 0.8,
                    explanation: 'キャラクターが勇気を身につけた',
                    narrativeSignificance: 0.8
                },
                {
                    regex: new RegExp(`${characterName}.*(魔法|技|能力).*覚えた`, 'g'),
                    attribute: 'abilities',
                    previousValue: '未習得',
                    currentValue: '習得済み',
                    type: '能力獲得',
                    scope: '個人',
                    confidence: 0.9,
                    explanation: 'キャラクターが新しい能力を身につけた',
                    narrativeSignificance: 0.7
                }
            ];
        }
    }

    /**
     * キャラクターの変化情報を記録する
     */
    async recordCharacterChanges(
        characterName: string,
        chapterNumber: number,
        changes: CharacterChangeInfo[]
    ): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }

        this.recordCharacterChange(characterName, changes);

        // キャラクター進行情報を取得または作成
        let character = this.characterProgress.get(characterName);
        if (!character) {
            character = {
                name: characterName,
                firstAppearance: chapterNumber,
                lastAppearance: chapterNumber,
                appearanceCount: 1,
                developmentPoints: []
            };
            this.characterProgress.set(characterName, character);
        }

        // 重要な変化を発展ポイントとして記録
        const significantChanges = changes.filter(
            c => (c.classification?.narrativeSignificance || 0) >= 0.6
        );

        if (significantChanges.length > 0) {
            const changeDesc = significantChanges
                .map(c => `${c.attribute}が「${c.previousValue}」から「${c.currentValue}」に変化`)
                .join('、');

            character.developmentPoints.push({
                chapter: chapterNumber,
                event: `${characterName}の変化: ${changeDesc}`,
                timestamp: new Date().toISOString()
            });
        }

        await this.save();
    }

    /**
     * キャラクター変化を記録
     * @private
     */
    private recordCharacterChange(characterName: string, changes: CharacterChangeInfo[]): void {
        const existingChanges = this.characterChanges.get(characterName) || [];
        existingChanges.push(...changes);
        this.characterChanges.set(characterName, existingChanges);
    }

    /**
     * キャラクターの進行状況を取得する
     */
    public getCharacterProgress(characterName: string): CharacterProgress | undefined {
        return this.characterProgress.get(characterName);
    }

    /**
     * キャラクターの変化履歴を取得
     */
    public getCharacterChanges(characterName: string): CharacterChangeInfo[] {
        return this.characterChanges.get(characterName) || [];
    }

    /**
     * すべてのキャラクター名を取得する
     */
    public getAllCharacterNames(): string[] {
        return Array.from(this.characterProgress.keys());
    }

    /**
     * すべてのキャラクターの進行状況を取得する
     */
    public getAllCharacterProgress(): CharacterProgress[] {
        return Array.from(this.characterProgress.values());
    }

    /**
     * 指定された章に登場するキャラクター名を取得する
     */
    public getCharactersInChapter(chapterNumber: number): string[] {
        return Array.from(this.characterProgress.values())
            .filter(char => char.firstAppearance <= chapterNumber && char.lastAppearance >= chapterNumber)
            .map(char => char.name);
    }

    /**
     * 指定された章で変化があったキャラクターを取得する
     */
    public getCharactersWithDevelopmentInChapter(chapterNumber: number): CharacterProgress[] {
        return Array.from(this.characterProgress.values())
            .filter(char => char.developmentPoints.some(dp => dp.chapter === chapterNumber));
    }

    /**
     * 最も活発なキャラクターを取得
     */
    public getMostActiveCharacters(limit: number = 5): CharacterProgress[] {
        return Array.from(this.characterProgress.values())
            .sort((a, b) => {
                // 活発度は出現回数と発展ポイント数の組み合わせで計算
                const scoreA = a.appearanceCount * 2 + a.developmentPoints.length * 3;
                const scoreB = b.appearanceCount * 2 + b.developmentPoints.length * 3;
                return scoreB - scoreA;
            })
            .slice(0, limit);
    }

    /**
     * 最近変化したキャラクターを取得
     */
    public getRecentlyChangedCharacters(withinChapters: number = 5): CharacterProgress[] {
        const currentMaxChapter = Math.max(
            ...Array.from(this.characterProgress.values()).map(c => c.lastAppearance)
        );
        const thresholdChapter = currentMaxChapter - withinChapters;

        return Array.from(this.characterProgress.values())
            .filter(char => char.developmentPoints.some(dp => dp.chapter > thresholdChapter))
            .sort((a, b) => {
                const latestA = Math.max(...a.developmentPoints.map(dp => dp.chapter));
                const latestB = Math.max(...b.developmentPoints.map(dp => dp.chapter));
                return latestB - latestA;
            });
    }

    /**
     * キャラクター統計を取得
     */
    public getCharacterStatistics(): {
        totalCharacters: number;
        activeCharacters: number;
        averageAppearances: number;
        charactersWithDevelopment: number;
        totalDevelopmentPoints: number;
    } {
        const characters = Array.from(this.characterProgress.values());
        const totalCharacters = characters.length;
        
        if (totalCharacters === 0) {
            return {
                totalCharacters: 0,
                activeCharacters: 0,
                averageAppearances: 0,
                charactersWithDevelopment: 0,
                totalDevelopmentPoints: 0
            };
        }

        const activeCharacters = characters.filter(c => c.appearanceCount > 1).length;
        const averageAppearances = characters.reduce((sum, c) => sum + c.appearanceCount, 0) / totalCharacters;
        const charactersWithDevelopment = characters.filter(c => c.developmentPoints.length > 0).length;
        const totalDevelopmentPoints = characters.reduce((sum, c) => sum + c.developmentPoints.length, 0);

        return {
            totalCharacters,
            activeCharacters,
            averageAppearances: Math.round(averageAppearances * 10) / 10,
            charactersWithDevelopment,
            totalDevelopmentPoints
        };
    }

    /**
     * ジャンルを設定
     */
    public setGenre(genre: string): void {
        this.genre = genre;
        logger.debug(`Character tracking genre set to: ${this.genre}`);
    }

    /**
     * ジャンルを取得
     */
    public getGenre(): string {
        return this.genre;
    }
}