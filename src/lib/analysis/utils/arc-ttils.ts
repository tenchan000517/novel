/**
 * @fileoverview キャラクターアーク分析ユーティリティ
 * @description
 * キャラクターの成長アークに関する分析と最適化を行うユーティリティクラス。
 * 物語の進行状況とキャラクターの発展段階の整合性を分析し、最適な成長パターンを推奨します。
 */

/**
 * 標準的なキャラクターアークフェーズの定義
 */
export enum ArcPhase {
    INTRODUCTION = 'introduction',   // 紹介フェーズ
    DEVELOPMENT = 'development',     // 発展フェーズ
    CHALLENGE = 'challenge',         // 試練フェーズ
    TRANSFORMATION = 'transformation', // 変容フェーズ
    RESOLUTION = 'resolution'        // 解決フェーズ
}

/**
 * 一般的なキャラクターアークタイプの定義
 */
export enum ArcType {
    POSITIVE = 'positive',           // 肯定的成長アーク (弱点・欠点を克服する)
    NEGATIVE = 'negative',           // 否定的成長アーク (堕落・崩壊へ向かう)
    FLAT = 'flat',                   // 平坦アーク (変化より一貫性と強さを示す)
    CIRCULAR = 'circular',           // 循環アーク (変化するが元に戻る)
    TESTING = 'testing'              // 試練アーク (試練に立ち向かい自己を証明)
}

/**
 * キャラクターアーク分析結果の定義
 */
export interface ArcAnalysisResult {
    currentPhase: ArcPhase;           // 現在のアークフェーズ
    suggestedNextPhase: ArcPhase;     // 推奨される次のフェーズ
    phaseAlignment: string;           // 物語進行との整合性 ('aligned', 'ahead', 'behind')
    keyThemes: string[];              // 現在のフェーズの重要なテーマ
    suggestedEvents: string[];        // 推奨されるイベントタイプ
}

/**
 * アーク段階の定義（物語の進行に対する理想的な発展段階のマッピング）
 */
interface ArcStageMapping {
    stageRanges: {[phase: string]: [number, number]}; // 各フェーズの理想的な発展段階範囲
    progressRanges: {[phase: string]: [number, number]}; // 各フェーズの理想的な物語進行範囲
}

/**
 * キャラクターアーク分析ユーティリティクラス
 */
export class ArcUtils {
    /**
     * 標準的なアークステージマッピング
     * 発展段階（0-10）と物語進行率（0-1）の理想的な対応関係
     */
    private static readonly standardArcMapping: ArcStageMapping = {
        stageRanges: {
            [ArcPhase.INTRODUCTION]: [0, 2],    // 発展段階0-2が紹介フェーズ
            [ArcPhase.DEVELOPMENT]: [2, 4],     // 発展段階2-4が発展フェーズ
            [ArcPhase.CHALLENGE]: [4, 6],       // 発展段階4-6が試練フェーズ
            [ArcPhase.TRANSFORMATION]: [6, 8],  // 発展段階6-8が変容フェーズ
            [ArcPhase.RESOLUTION]: [8, 10]      // 発展段階8-10が解決フェーズ
        },
        progressRanges: {
            [ArcPhase.INTRODUCTION]: [0, 0.2],   // 物語の0-20%が紹介フェーズ
            [ArcPhase.DEVELOPMENT]: [0.2, 0.4],  // 物語の20-40%が発展フェーズ
            [ArcPhase.CHALLENGE]: [0.4, 0.6],    // 物語の40-60%が試練フェーズ
            [ArcPhase.TRANSFORMATION]: [0.6, 0.8], // 物語の60-80%が変容フェーズ
            [ArcPhase.RESOLUTION]: [0.8, 1.0]    // 物語の80-100%が解決フェーズ
        }
    };
    
    /**
     * アークタイプごとのテーマ定義
     */
    private static readonly arcThemes: {[arcType: string]: {[phase: string]: string[]}} = {
        [ArcType.POSITIVE]: {
            [ArcPhase.INTRODUCTION]: ['現状認識', '欠点の自覚', '変化の必要性'],
            [ArcPhase.DEVELOPMENT]: ['新たな視点', '成長の兆し', '能力開発'],
            [ArcPhase.CHALLENGE]: ['試練への直面', '内なる抵抗', '失敗と学び'],
            [ArcPhase.TRANSFORMATION]: ['根本的変化', '新たな自己', '価値観の転換'],
            [ArcPhase.RESOLUTION]: ['成長の証明', '克服', '新たな平衡']
        },
        [ArcType.NEGATIVE]: {
            [ArcPhase.INTRODUCTION]: ['潜在的弱点', '誘惑', '初期の警告'],
            [ArcPhase.DEVELOPMENT]: ['誤った選択', '妥協', '自己欺瞞'],
            [ArcPhase.CHALLENGE]: ['道徳的岐路', '自己正当化', '罪の意識'],
            [ArcPhase.TRANSFORMATION]: ['堕落', '喪失', '自己破壊'],
            [ArcPhase.RESOLUTION]: ['悲劇的結末', '救いの可能性', '教訓']
        },
        [ArcType.FLAT]: {
            [ArcPhase.INTRODUCTION]: ['揺るぎない信念', '確立された性格', '明確な原則'],
            [ArcPhase.DEVELOPMENT]: ['信念の実証', '一貫性の維持', '模範'],
            [ArcPhase.CHALLENGE]: ['信念の試練', '揺るがない心', '原則の堅持'],
            [ArcPhase.TRANSFORMATION]: ['周囲への影響', '触媒としての役割', '環境変化'],
            [ArcPhase.RESOLUTION]: ['価値観の証明', '影響の広がり', '遺産']
        }
    };
    
    /**
     * 発展段階と物語進行の整合性を分析
     * 
     * @param developmentStage キャラクターの現在の発展段階 (0-10)
     * @param progressRatio 物語の進行率 (0-1)
     * @returns 整合性状態 ('aligned', 'ahead', 'behind')
     */
    public static analyzeArcAlignment(
        developmentStage: number,
        progressRatio: number
    ): string {
        // 現在の物語進行率に対する理想的な発展段階の範囲を決定
        let idealStageMin = 0;
        let idealStageMax = 10;
        
        // 現在の進行率に対応するフェーズを特定
        for (const [phase, range] of Object.entries(this.standardArcMapping.progressRanges)) {
            if (progressRatio >= range[0] && progressRatio <= range[1]) {
                // 対応するフェーズの理想的な発展段階範囲を取得
                const stageRange = this.standardArcMapping.stageRanges[phase];
                idealStageMin = stageRange[0];
                idealStageMax = stageRange[1];
                break;
            }
        }
        
        // 整合性を判定
        if (developmentStage < idealStageMin) {
            return 'behind'; // 遅れている
        } else if (developmentStage > idealStageMax) {
            return 'ahead';  // 先行している
        } else {
            return 'aligned'; // 整合している
        }
    }
    
    /**
     * 現在の発展段階に基づきキャラクターアークフェーズを判定
     * 
     * @param developmentStage キャラクターの現在の発展段階 (0-10)
     * @returns 現在のアークフェーズ
     */
    public static determineCurrentPhase(developmentStage: number): ArcPhase {
        for (const [phase, range] of Object.entries(this.standardArcMapping.stageRanges)) {
            if (developmentStage >= range[0] && developmentStage <= range[1]) {
                return phase as ArcPhase;
            }
        }
        
        // デフォルト値
        return developmentStage <= 2 ? ArcPhase.INTRODUCTION : ArcPhase.RESOLUTION;
    }
    
    /**
     * 次のアークフェーズを推奨
     * 
     * @param currentPhase 現在のアークフェーズ
     * @param arcAlignment 整合性状態 ('aligned', 'ahead', 'behind')
     * @returns 推奨される次のフェーズ
     */
    public static suggestNextPhase(
        currentPhase: ArcPhase,
        arcAlignment: string
    ): ArcPhase {
        // フェーズの順序
        const phaseOrder = [
            ArcPhase.INTRODUCTION,
            ArcPhase.DEVELOPMENT,
            ArcPhase.CHALLENGE,
            ArcPhase.TRANSFORMATION,
            ArcPhase.RESOLUTION
        ];
        
        // 現在のフェーズのインデックスを取得
        const currentIndex = phaseOrder.indexOf(currentPhase);
        
        // 整合性に基づいてフェーズの移行を推奨
        if (arcAlignment === 'behind') {
            // 遅れている場合、より急速な進展を推奨
            const nextIndex = Math.min(currentIndex + 2, phaseOrder.length - 1);
            return phaseOrder[nextIndex];
        } else if (arcAlignment === 'ahead') {
            // 先行している場合、現在のフェーズの深化を推奨
            return currentPhase;
        } else {
            // 整合している場合、通常の次のフェーズを推奨
            const nextIndex = Math.min(currentIndex + 1, phaseOrder.length - 1);
            return phaseOrder[nextIndex];
        }
    }
    
    /**
     * キャラクターアークの全体分析を実行
     * 
     * @param developmentStage キャラクターの現在の発展段階 (0-10)
     * @param progressRatio 物語の進行率 (0-1)
     * @param arcType キャラクターアークのタイプ (デフォルト: POSITIVE)
     * @returns アーク分析結果
     */
    public static analyzeCharacterArc(
        developmentStage: number,
        progressRatio: number,
        arcType: ArcType = ArcType.POSITIVE
    ): ArcAnalysisResult {
        // 整合性を分析
        const alignment = this.analyzeArcAlignment(developmentStage, progressRatio);
        
        // 現在のフェーズを判定
        const currentPhase = this.determineCurrentPhase(developmentStage);
        
        // 次のフェーズを推奨
        const nextPhase = this.suggestNextPhase(currentPhase, alignment);
        
        // アークタイプに基づく現在フェーズのテーマを取得
        const themes = this.arcThemes[arcType]?.[currentPhase] || 
                       this.arcThemes[ArcType.POSITIVE][currentPhase];
        
        // 次のフェーズに向けた推奨イベントを生成
        const suggestedEvents = this.generateSuggestedEvents(currentPhase, nextPhase, arcType);
        
        return {
            currentPhase,
            suggestedNextPhase: nextPhase,
            phaseAlignment: alignment,
            keyThemes: themes,
            suggestedEvents
        };
    }
    
    /**
     * 次のフェーズに向けた推奨イベントを生成
     * 
     * @param currentPhase 現在のフェーズ
     * @param nextPhase 次のフェーズ
     * @param arcType アークタイプ
     * @returns 推奨イベントの配列
     */
    private static generateSuggestedEvents(
        currentPhase: ArcPhase,
        nextPhase: ArcPhase,
        arcType: ArcType
    ): string[] {
        // 基本的な推奨イベントマップ
        const eventMap: {[key: string]: {[key: string]: string[]}} = {
            [ArcType.POSITIVE]: {
                [`${ArcPhase.INTRODUCTION}-${ArcPhase.DEVELOPMENT}`]: [
                    '新たな環境や状況への適応',
                    '能力や潜在性の発見',
                    '価値観を揺るがす出会い'
                ],
                [`${ArcPhase.DEVELOPMENT}-${ArcPhase.CHALLENGE}`]: [
                    '信念や能力が試される困難な状況',
                    '重要な選択や決断',
                    '内面的な弱さとの対峙'
                ],
                [`${ArcPhase.CHALLENGE}-${ArcPhase.TRANSFORMATION}`]: [
                    '価値観や信念を根本的に変える出来事',
                    '大きな犠牲や喪失',
                    '真実や本質の発見'
                ],
                [`${ArcPhase.TRANSFORMATION}-${ArcPhase.RESOLUTION}`]: [
                    '新たな自己や価値観の実証',
                    '過去の問題や関係性の解決',
                    '習得した教訓の実践'
                ]
            },
            [ArcType.NEGATIVE]: {
                [`${ArcPhase.INTRODUCTION}-${ArcPhase.DEVELOPMENT}`]: [
                    '道徳的誘惑や妥協',
                    '短絡的な解決策の選択',
                    '自己欺瞞の始まり'
                ],
                [`${ArcPhase.DEVELOPMENT}-${ArcPhase.CHALLENGE}`]: [
                    '誤った選択の結果との対峙',
                    '道徳的罪悪感や葛藤',
                    '修正の機会の拒絶'
                ],
                [`${ArcPhase.CHALLENGE}-${ArcPhase.TRANSFORMATION}`]: [
                    '決定的な道徳的転落',
                    '他者を巻き込む自己破壊的行動',
                    '最後の警告の無視'
                ],
                [`${ArcPhase.TRANSFORMATION}-${ArcPhase.RESOLUTION}`]: [
                    '破滅的な結果の実現',
                    '贖罪の可能性との対峙',
                    '悲劇的な最終判断'
                ]
            },
            [ArcType.FLAT]: {
                [`${ArcPhase.INTRODUCTION}-${ArcPhase.DEVELOPMENT}`]: [
                    '信念や原則の実証機会',
                    '価値観を示す小さな勝利',
                    '模範としての役割の確立'
                ],
                [`${ArcPhase.DEVELOPMENT}-${ArcPhase.CHALLENGE}`]: [
                    '信念や原則への重大な挑戦',
                    '揺るがぬ意志の表明',
                    '他者からの反発や疑問'
                ],
                [`${ArcPhase.CHALLENGE}-${ArcPhase.TRANSFORMATION}`]: [
                    '信念を貫くための犠牲',
                    '他者への価値観の伝播',
                    '環境や状況の変革'
                ],
                [`${ArcPhase.TRANSFORMATION}-${ArcPhase.RESOLUTION}`]: [
                    '信念の最終的な正当化',
                    '他者や世界への永続的影響',
                    '遺産や継承の確立'
                ]
            }
        };
        
        // 現在フェーズから次フェーズへの推奨イベントを取得
        const transitionKey = `${currentPhase}-${nextPhase}`;
        const events = eventMap[arcType]?.[transitionKey];
        
        // 該当する推奨イベントがなければデフォルト値を返す
        if (!events) {
            return [
                '重要な決断や選択',
                '信念や価値観の試練',
                '内面的成長のきっかけ'
            ];
        }
        
        return events;
    }
    
    /**
     * 発展段階の調整推奨
     * 
     * @param currentStage 現在の発展段階
     * @param progressRatio 物語進行率
     * @returns 推奨される発展段階の調整値 (-1〜2)
     */
    public static suggestStageDevelopment(
        currentStage: number,
        progressRatio: number
    ): number {
        // 整合性を分析
        const alignment = this.analyzeArcAlignment(currentStage, progressRatio);
        
        // 整合性に基づいて調整値を返す
        if (alignment === 'behind') {
            return progressRatio > 0.7 ? 2 : 1; // 物語後半で大きく遅れている場合は大きな調整
        } else if (alignment === 'ahead') {
            return -1; // 先行している場合は成長を遅らせる
        } else {
            return 0; // 整合している場合は調整なし
        }
    }
    
    /**
     * キャラクターアークタイプの推奨
     * 
     * @param characterType キャラクタータイプ (MAIN, SUB, MOB)
     * @param personalityTraits 性格特性の配列
     * @param genre ジャンル
     * @returns 推奨アークタイプとその理由
     */
    public static suggestArcType(
        characterType: string,
        personalityTraits: string[],
        genre?: string
    ): {arcType: ArcType; reason: string} {
        // 性格特性を分析
        const hasNegativeTraits = this.hasTraitsOfType(personalityTraits, 'negative');
        const hasPositiveTraits = this.hasTraitsOfType(personalityTraits, 'positive');
        const hasStrongPrinciples = this.hasTraitsOfType(personalityTraits, 'principle');
        
        // MAINキャラクターの場合
        if (characterType === 'MAIN') {
            if (hasNegativeTraits && genre === 'tragedy') {
                return {
                    arcType: ArcType.NEGATIVE,
                    reason: '主人公の悲劇的欠点がジャンルに適しています'
                };
            } else if (hasStrongPrinciples && (genre === 'action' || genre === 'heroic')) {
                return {
                    arcType: ArcType.FLAT,
                    reason: '強い原則を持つヒーロー/ヒロインはモデル的キャラクターとして効果的です'
                };
            } else {
                return {
                    arcType: ArcType.POSITIVE,
                    reason: '主人公の肯定的成長は読者との共感を生みます'
                };
            }
        }
        // SUBキャラクターの場合
        else if (characterType === 'SUB') {
            if (hasNegativeTraits) {
                return {
                    arcType: ArcType.NEGATIVE,
                    reason: '脇役の堕落は主人公との対比を強めます'
                };
            } else if (hasStrongPrinciples) {
                return {
                    arcType: ArcType.FLAT,
                    reason: '原則を持つ脇役は主人公の道徳的コンパスとなります'
                };
            } else {
                return {
                    arcType: Math.random() > 0.5 ? ArcType.POSITIVE : ArcType.FLAT,
                    reason: '脇役も成長すると物語に深みが増します'
                };
            }
        }
        // MOBキャラクターの場合
        else {
            return {
                arcType: ArcType.FLAT,
                reason: '背景キャラクターは一貫性を持つと認識しやすくなります'
            };
        }
    }
    
    /**
     * 特定タイプの性格特性を持つか判定
     * 
     * @private
     * @param traits 性格特性の配列
     * @param traitType 特性タイプ ('positive', 'negative', 'principle')
     * @returns 該当特性を持つ場合はtrue
     */
    private static hasTraitsOfType(traits: string[], traitType: string): boolean {
        // 特性タイプごとのキーワード
        const traitKeywords: {[key: string]: string[]} = {
            'positive': ['親切', '勇敢', '忠実', '誠実', '思いやり', '献身', '正直', '勤勉', '寛容'],
            'negative': ['傲慢', '嫉妬', '怠惰', '貪欲', '怒り', '残酷', '臆病', '自己中心', '不誠実'],
            'principle': ['正義', '忠誠', '誇り', '規律', '信念', '道徳', '責任', '使命', '名誉']
        };
        
        // 該当するキーワードを含む特性があるか検査
        return traits.some(trait => 
            traitKeywords[traitType].some(keyword => 
                trait.toLowerCase().includes(keyword.toLowerCase())
            )
        );
    }
}