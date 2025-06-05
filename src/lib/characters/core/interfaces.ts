/**
 * キャラクターモジュールのドメインインターフェース定義
 */
import {
    Character,
    CharacterData,
    CharacterParameter,
    CharacterState,
    CharacterType,
    ChapterEvent,
    CharacterPsychology,
    CharacterDevelopment,
    DevelopmentPath,
    GrowthPlan,
    GrowthResult,
    PlotContext,
    Relationship,
    RelationshipAnalysis,
    CharacterDiff,
    Skill,
    TimingRecommendation,
    StoryContext,
    ValidationResult,
    DynamicCharacter,
    CharacterTemplate,
    CharacterCluster,
    EventSubscription,
    RelationshipResponse
  } from './types';
  
  /**
   * キャラクターリポジトリインターフェース
   * キャラクターデータの永続化を担当
   */
  export interface ICharacterRepository {
    /**
     * IDによるキャラクター取得
     * @param id キャラクターID
     * @returns キャラクターオブジェクトまたはnull
     */
    getCharacterById(id: string): Promise<Character | null>;
  
    /**
     * 名前によるキャラクター取得
     * @param name キャラクター名
     * @returns キャラクターオブジェクトまたはnull
     */
    getCharacterByName(name: string): Promise<Character | null>;
  
    /**
     * すべてのキャラクター取得
     * @returns キャラクターの配列
     */
    getAllCharacters(): Promise<Character[]>;
  
    /**
     * キャラクターの保存
     * @param character 保存するキャラクター
     */
    saveCharacter(character: Character): Promise<void>;
  
    /**
     * キャラクターの更新
     * @param id キャラクターID
     * @param updates 更新データ
     * @returns 更新されたキャラクター
     */
    updateCharacter(id: string, updates: Partial<CharacterData>): Promise<Character>;
  
    /**
     * キャラクター状態の保存
     * @param id キャラクターID
     * @param state 保存する状態
     */
    saveCharacterState(id: string, state: CharacterState): Promise<void>;
  
    /**
     * キャラクタープロパティの部分更新
     * @param id キャラクターID
     * @param path プロパティパス（ドット区切り）
     * @param value 新しい値
     */
    updateCharacterProperty(id: string, path: string, value: any): Promise<void>;
  
    /**
     * 特定のタイプのキャラクターのみ取得
     * @param type キャラクタータイプ
     * @returns 指定タイプのキャラクター配列
     */
    getCharactersByType(type: CharacterType): Promise<Character[]>;
  
    /**
     * アクティブなキャラクターのみ取得
     * @returns アクティブなキャラクターの配列
     */
    getActiveCharacters(): Promise<Character[]>;
  }
  
  /**
   * 関係性リポジトリインターフェース
   * キャラクター間の関係性データの永続化を担当
   */
  export interface IRelationshipRepository {
    /**
     * 2キャラクター間の関係性取得
     * @param char1Id 1人目のキャラクターID
     * @param char2Id 2人目のキャラクターID
     * @returns 関係性オブジェクトまたはnull
     */
    getRelationship(char1Id: string, char2Id: string): Promise<Relationship | null>;
  
    /**
     * 関係性の保存
     * @param char1Id 1人目のキャラクターID
     * @param char2Id 2人目のキャラクターID
     * @param relationship 保存する関係性
     */
    saveRelationship(char1Id: string, char2Id: string, relationship: Relationship): Promise<void>;
  
    /**
     * すべての関係性データ取得
     * @returns 関係性データの配列
     */
    getAllRelationships(): Promise<Relationship[]>;
  
    /**
     * キャラクターの全関係性取得
     * @param characterId キャラクターID
     * @returns そのキャラクターが関わる全関係性
     */
    getCharacterRelationships(characterId: string): Promise<RelationshipResponse>;
  
    /**
     * 関係グラフの保存
     * @param graphData 関係グラフデータ
     */
    saveRelationshipGraph(graphData: any): Promise<void>;
  
    /**
     * 関係グラフの取得
     * @returns 関係グラフデータ
     */
    getRelationshipGraph(): Promise<any>;
  }
  
  /**
   * パラメータリポジトリインターフェース
   * キャラクターパラメータデータの永続化を担当
   */
  export interface IParameterRepository {
    /**
     * キャラクターパラメータの取得
     * @param characterId キャラクターID
     * @returns パラメータの配列
     */
    getCharacterParameters(characterId: string): Promise<CharacterParameter[]>;
  
    /**
     * キャラクターパラメータの保存
     * @param characterId キャラクターID
     * @param parameters 保存するパラメータ配列
     */
    saveCharacterParameters(characterId: string, parameters: CharacterParameter[]): Promise<void>;
  
    /**
     * パラメータ定義の取得
     * @returns パラメータ定義の配列
     */
    getParameterDefinitions(): Promise<CharacterParameter[]>;
  
    /**
     * パラメータ定義の保存
     * @param definitions 保存するパラメータ定義
     */
    saveParameterDefinitions(definitions: CharacterParameter[]): Promise<void>;
  
    /**
     * 単一パラメータ値の更新
     * @param characterId キャラクターID
     * @param parameterId パラメータID
     * @param value 新しい値
     */
    updateParameterValue(characterId: string, parameterId: string, value: number): Promise<void>;
  }
  
  /**
   * スキルリポジトリインターフェース
   * キャラクタースキルデータの永続化を担当
   */
  export interface ISkillRepository {
    /**
     * キャラクタースキルの取得
     * @param characterId キャラクターID
     * @returns スキルの配列
     */
    getCharacterSkills(characterId: string): Promise<Skill[]>;
  
    /**
     * キャラクタースキルの保存
     * @param characterId キャラクターID
     * @param skills 保存するスキル配列
     */
    saveCharacterSkills(characterId: string, skills: Skill[]): Promise<void>;
  
    /**
     * スキル定義の取得
     * @returns スキル定義の配列
     */
    getSkillDefinitions(): Promise<Skill[]>;
  
    /**
     * スキル定義の保存
     * @param definitions 保存するスキル定義
     */
    saveSkillDefinitions(definitions: Skill[]): Promise<void>;
  
    /**
     * スキルレベルの更新
     * @param characterId キャラクターID
     * @param skillId スキルID
     * @param level 新しいレベル
     */
    updateSkillLevel(characterId: string, skillId: string, level: number): Promise<void>;
  
    /**
     * スキル習熟度の更新
     * @param characterId キャラクターID
     * @param skillId スキルID
     * @param proficiency 新しい習熟度
     */
    updateSkillProficiency(characterId: string, skillId: string, proficiency: number): Promise<void>;
  }
  
  /**
   * 成長計画リポジトリインターフェース
   * キャラクター成長計画データの永続化を担当
   */
  export interface IGrowthPlanRepository {
    /**
     * 成長計画の取得
     * @param id 成長計画ID
     * @returns 成長計画
     */
    getGrowthPlanById(id: string): Promise<GrowthPlan | null>;
  
    /**
     * キャラクターの成長計画取得
     * @param characterId キャラクターID
     * @returns 成長計画の配列
     */
    getGrowthPlansByCharacterId(characterId: string): Promise<GrowthPlan[]>;
  
    /**
     * 成長計画の保存
     * @param plan 保存する成長計画
     */
    saveGrowthPlan(plan: GrowthPlan): Promise<void>;
  
    /**
     * 成長計画の更新
     * @param id 成長計画ID
     * @param updates 更新データ
     */
    updateGrowthPlan(id: string, updates: Partial<GrowthPlan>): Promise<void>;
  
    /**
     * 成長計画の削除
     * @param id 成長計画ID
     */
    deleteGrowthPlan(id: string): Promise<void>;
  }
  
  /**
   * キャラクターサービスインターフェース
   * キャラクター管理のメインロジックを担当
   */
  export interface ICharacterService {
    /**
     * キャラクター作成
     * @param data キャラクターデータ
     * @returns 作成されたキャラクター
     */
    createCharacter(data: CharacterData): Promise<Character>;
  
    /**
     * キャラクター取得
     * @param id キャラクターID
     * @returns キャラクターオブジェクトまたはnull
     */
    getCharacter(id: string): Promise<Character | null>;
  
    /**
     * キャラクター更新
     * @param id キャラクターID
     * @param updates 更新データ
     * @returns 更新されたキャラクター
     */
    updateCharacter(id: string, updates: Partial<CharacterData>): Promise<Character>;
  
    /**
     * キャラクター登場記録
     * @param id キャラクターID
     * @param chapterNumber 章番号
     * @param summary 概要
     * @returns 更新されたキャラクター
     */
    recordAppearance(id: string, chapterNumber: number, summary: string): Promise<Character>;
  
    /**
     * インタラクション記録
     * @param id キャラクターID
     * @param targetId 対象キャラクターID
     * @param type インタラクションタイプ
     * @param data 追加データ
     */
    recordInteraction(id: string, targetId: string, type: string, data: any): Promise<void>;
  
    /**
     * キャラクター発展処理
     * @param id キャラクターID
     * @param events 章イベント配列
     * @returns 更新されたキャラクター
     */
    processCharacterDevelopment(id: string, events: ChapterEvent[]): Promise<Character>;
  
    /**
     * キャラクター設定の検証
     * @param character キャラクター
     * @returns 検証結果
     */
    validateCharacter(character: Character): Promise<ValidationResult>;
  
    /**
     * キャラクター状態の更新
     * @param id キャラクターID
     * @param state 新しい状態
     * @returns 更新されたキャラクター
     */
    updateCharacterState(id: string, state: Partial<CharacterState>): Promise<Character>;
  }
  
  /**
   * 検出サービスインターフェース
   * コンテンツ内のキャラクター検出と抽出を担当
   */
  export interface IDetectionService {
    /**
     * コンテンツ内のキャラクター検出
     * @param content 検索対象のコンテンツ
     * @returns 検出されたキャラクターの配列
     */
    detectCharactersInContent(content: string): Promise<Character[]>;
  
    /**
     * キャラクターの台詞抽出
     * @param character キャラクター
     * @param content 抽出対象のコンテンツ
     * @returns 抽出された台詞の配列
     */
    extractCharacterDialog(character: Character, content: string): Promise<string[]>;
  
    /**
     * キャラクターへの言及検出
     * @param character キャラクター
     * @param content 検出対象のコンテンツ
     * @returns 言及テキストの配列
     */
    detectCharacterMentions(character: Character, content: string): Promise<string[]>;
  
    /**
     * キャラクター登場確認
     * @param characterId キャラクターID
     * @param content 確認対象のコンテンツ
     * @returns 登場しているかどうか
     */
    verifyCharacterAppearance(characterId: string, content: string): Promise<boolean>;
  
    /**
     * コンテンツ内のインタラクション検出
     * @param content 検出対象のコンテンツ
     * @returns 検出されたインタラクション情報
     */
    detectInteractions(content: string): Promise<any[]>;
  }
  
  /**
   * 発展サービスインターフェース
   * キャラクターの発展と成長を担当
   */
  export interface IEvolutionService {
    /**
     * キャラクター発展処理
     * @param character キャラクター
     * @param events 章イベント配列
     * @returns キャラクター発展情報
     */
    processCharacterDevelopment(character: Character, events: ChapterEvent[]): Promise<CharacterDevelopment>;
  
    /**
     * 発展経路生成
     * @param character キャラクター
     * @returns 発展経路
     */
    generateDevelopmentPath(character: Character): Promise<DevelopmentPath>;
  
    /**
     * 成長計画適用
     * @param characterId キャラクターID
     * @param chapterNumber 章番号
     * @returns 成長結果
     */
    applyGrowthPlan(characterId: string, chapterNumber: number): Promise<GrowthResult>;
  
    /**
     * 発展段階評価
     * @param currentStage 現在の段階
     * @param development 発展情報
     * @param type 評価タイプ
     * @returns 新しい発展段階
     */
    evaluateDevelopmentStage(currentStage: number, development: CharacterDevelopment, type: string): number;
  
    /**
     * 次のマイルストーン推定
     * @param characterId キャラクターID
     * @returns 次のマイルストーン情報
     */
    predictNextMilestone(characterId: string): Promise<any>;
  }
  
  /**
   * 心理サービスインターフェース
   * キャラクターの心理分析を担当
   */
  export interface IPsychologyService {
    /**
     * キャラクター心理分析
     * @param character キャラクター
     * @param recentEvents 最近のイベント配列
     * @returns キャラクター心理情報
     */
    analyzeCharacterPsychology(character: Character, recentEvents: any[]): Promise<CharacterPsychology>;
  
    /**
     * 関係性心理分析
     * @param characters キャラクター配列
     * @returns キャラクター間の心理的態度マップ
     */
    analyzeRelationshipPsychology(characters: Character[]): Promise<Map<string, Map<string, any>>>;
  
    /**
     * 行動予測
     * @param character キャラクター
     * @param psychology 心理情報
     * @param situations 状況配列
     * @returns 予測される行動情報
     */
    predictBehaviors(character: Character, psychology: CharacterPsychology, situations: string[]): Promise<any>;
  
    /**
     * 感情変化のシミュレーション
     * @param characterId キャラクターID
     * @param event イベント情報
     * @returns 感情変化予測
     */
    simulateEmotionalResponse(characterId: string, event: any): Promise<any>;
  }
  
  /**
   * 関係性サービスインターフェース
   * キャラクター間の関係性管理を担当
   */
  export interface IRelationshipService {
    /**
     * 関係性更新
     * @param char1Id 1人目のキャラクターID
     * @param char2Id 2人目のキャラクターID
     * @param type 関係性タイプ
     * @param strength 関係性の強さ
     */
    updateRelationship(char1Id: string, char2Id: string, type: string, strength: number): Promise<void>;
  
    /**
     * 関連キャラクター取得
     * @param characterId キャラクターID
     * @returns 関連するキャラクターIDの配列
     */
    getConnectedCharacters(characterId: string): Promise<string[]>;
  
    /**
     * キャラクター関係性取得
     * @param characterId キャラクターID
     * @returns 関係性の配列
     */
    getCharacterRelationships(characterId: string): Promise<RelationshipResponse>;
  
    /**
     * 関係性動態分析
     * @returns 関係性分析結果
     */
    analyzeRelationshipDynamics(): Promise<RelationshipAnalysis>;
  
    /**
     * 関係性クラスター検出
     * @returns キャラクタークラスターの配列
     */
    detectRelationshipClusters(): Promise<CharacterCluster[]>;
  
    /**
     * 対立関係検出
     * @returns 対立関係情報の配列
     */
    detectTensions(): Promise<any[]>;
  }
  
  /**
   * パラメータサービスインターフェース
   * キャラクターパラメータの管理を担当
   */
  export interface IParameterService {
    /**
     * キャラクターパラメータ初期化
     * @param characterId キャラクターID
     * @param defaultValue デフォルト値
     * @returns 初期化されたパラメータ配列
     */
    initializeCharacterParameters(characterId: string, defaultValue: number): Promise<CharacterParameter[]>;
  
    /**
     * キャラクターパラメータ取得
     * @param characterId キャラクターID
     * @returns パラメータの配列
     */
    getCharacterParameters(characterId: string): Promise<CharacterParameter[]>;
  
    /**
     * パラメータ値設定
     * @param characterId キャラクターID
     * @param parameterId パラメータID
     * @param value 新しい値
     * @returns 更新されたパラメータまたはnull
     */
    setParameterValue(characterId: string, parameterId: string, value: number): Promise<CharacterParameter | null>;
  
    /**
     * パラメータ修正
     * @param characterId キャラクターID
     * @param parameterId パラメータID
     * @param delta 変化量
     * @returns 更新されたパラメータまたはnull
     */
    modifyParameter(characterId: string, parameterId: string, delta: number): Promise<CharacterParameter | null>;
  
    /**
     * カテゴリ別パラメータ取得
     * @param characterId キャラクターID
     * @param category カテゴリ
     * @returns パラメータの配列
     */
    getParametersByCategory(characterId: string, category: string): Promise<CharacterParameter[]>;
  }
  
  /**
   * スキルサービスインターフェース
   * キャラクタースキルの管理を担当
   */
  export interface ISkillService {
    /**
     * キャラクタースキル取得
     * @param characterId キャラクターID
     * @returns スキルの配列
     */
    getCharacterSkills(characterId: string): Promise<Skill[]>;
  
    /**
     * スキル取得
     * @param characterId キャラクターID
     * @param skillId スキルID
     * @returns スキルまたはnull
     */
    acquireSkill(characterId: string, skillId: string, forced?: boolean): Promise<boolean>;
  
    /**
     * スキルレベル更新
     * @param characterId キャラクターID
     * @param skillId スキルID
     * @param newLevel 新しいレベル
     * @returns 成功したかどうか
     */
    updateSkillLevel(characterId: string, skillId: string, newLevel: number): Promise<boolean>;
  
    /**
     * 習熟度増加
     * @param characterId キャラクターID
     * @param skillId スキルID
     * @param amount 増加量
     * @returns 成功したかどうか
     */
    increaseProficiency(characterId: string, skillId: string, amount: number): Promise<boolean>;
  
    /**
     * スキル習得要件確認
     * @param characterId キャラクターID
     * @param skillId スキルID
     * @returns 要件を満たすかどうか
     */
    checkSkillRequirements(characterId: string, skillId: string): Promise<boolean>;
  }
  
  /**
   * キャラクター分析インターフェース
   * キャラクターの変化と一貫性の分析を担当
   */
  export interface ICharacterAnalyzer {
    /**
     * 変化検出
     * @param baseState 基本状態
     * @param currentState 現在状態
     * @returns 検出された差分
     */
    detectChanges(baseState: any, currentState: any): CharacterDiff;
  
    /**
     * 変化分類
     * @param characterDiff キャラクター差分
     * @param plotContext プロット文脈
     * @returns 分類された差分
     */
    classifyChanges(characterDiff: CharacterDiff, plotContext?: PlotContext): Promise<CharacterDiff>;
  
    /**
     * アクション検証
     * @param character キャラクター
     * @param proposedAction 提案されたアクション
     * @param context 文脈
     * @returns 検証結果
     */
    validateAction(character: Character, proposedAction: string, context: string): Promise<ValidationResult>;
  
    /**
     * 履歴との比較
     * @param character キャラクター
     * @param proposedAction 提案されたアクション
     * @returns 一貫性スコア
     */
    compareWithHistory(character: Character, proposedAction: string): Promise<number>;
  }
  
  /**
   * タイミング分析インターフェース
   * 登場タイミングの分析を担当
   */
  export interface ITimingAnalyzer {
    /**
     * タイミング推奨取得
     * @param character キャラクター
     * @param storyContext ストーリー文脈
     * @returns タイミング推奨
     */
    getTimingRecommendation(character: Character, storyContext: StoryContext): Promise<TimingRecommendation>;
  
    /**
     * タイミング要因分析
     * @param character キャラクター
     * @param context 文脈
     * @returns タイミング分析結果
     */
    analyzeTimingFactors(character: Character, context: StoryContext): Promise<any>;
  }
  
  /**
   * 関係性分析インターフェース
   * 関係性の分析を担当
   */
  export interface IRelationshipAnalyzer {
    /**
     * クラスター検出
     * @returns キャラクタークラスターの配列
     */
    detectClusters(): Promise<CharacterCluster[]>;
  
    /**
     * 対立検出
     * @returns 関係性対立の配列
     */
    detectTensions(): Promise<any[]>;
  
    /**
     * 関係性発展追跡
     * @returns 発展情報
     */
    trackRelationshipDevelopments(): Promise<any[]>;
  
    /**
     * 視覚化データ生成
     * @returns 視覚化データ
     */
    generateVisualizationData(): Promise<any>;
  }
  
  /**
   * キャラクター生成インターフェース
   * 動的キャラクター生成を担当
   */
  export interface ICharacterGenerator {
    /**
     * テンプレートからの生成
     * @param template キャラクターテンプレート
     * @param params パラメータ
     * @returns 動的キャラクター
     */
    generateFromTemplate(template: CharacterTemplate, params: any): Promise<DynamicCharacter>;
  
    /**
     * バックストーリー生成
     * @param character 動的キャラクター
     * @param worldContext 世界観文脈
     * @returns バックストーリーテキスト
     */
    generateBackstory(character: DynamicCharacter, worldContext: any): Promise<string>;
  
    /**
     * 関係性作成
     * @param character 動的キャラクター
     * @param existingCharacters 既存キャラクター配列
     * @returns 生成された関係性の配列
     */
    createRelationships(character: DynamicCharacter, existingCharacters: Character[]): Promise<Relationship[]>;
  }
  
  /**
   * テンプレートプロバイダーインターフェース
   * キャラクターテンプレート管理を担当
   */
  export interface ITemplateProvider {
    /**
     * テンプレート取得
     * @param id テンプレートID
     * @returns キャラクターテンプレート
     */
    getTemplateById(id: string): Promise<CharacterTemplate>;
  
    /**
     * テンプレート結合
     * @param archetype アーキタイプ
     * @param role 役割
     * @returns 結合されたテンプレート
     */
    combineTemplates(archetype: string, role: string): Promise<CharacterTemplate>;
  
    /**
     * すべてのテンプレート取得
     * @returns テンプレートの配列
     */
    getAllTemplates(): Promise<CharacterTemplate[]>;
  }
  
  /**
   * イベントバスインターフェース
   * イベント発行と購読の管理を担当
   */
  export interface IEventBus {
    /**
     * イベント発行
     * @param eventType イベントタイプ
     * @param data イベントデータ
     */
    publish(eventType: string, data: any): void;
  
    /**
     * イベント購読
     * @param eventType イベントタイプ
     * @param callback コールバック関数
     * @returns 購読解除用の関数
     */
    subscribe(eventType: string, callback: (data: any) => void): EventSubscription;
  
    /**
     * 購読解除
     * @param subscription 購読情報
     */
    unsubscribe(subscription: EventSubscription): void;
  }
  
  /**
   * キャラクターファサードインターフェース
   * 外部向けシンプルなインターフェース提供を担当
   */
  export interface ICharacterManager {
    /**
     * キャラクター作成
     * @param data キャラクターデータ
     * @returns 作成されたキャラクター
     */
    createCharacter(data: CharacterData): Promise<Character>;
  
    /**
     * キャラクター取得
     * @param id キャラクターID
     * @returns キャラクター
     */
    getCharacter(id: string): Promise<Character | null>;
  
    /**
     * キャラクター更新
     * @param id キャラクターID
     * @param data 更新データ
     * @returns 更新されたキャラクター
     */
    updateCharacter(id: string, data: Partial<CharacterData>): Promise<Character>;
  
    /**
     * すべてのキャラクター取得
     * @returns キャラクターの配列
     */
    getAllCharacters(): Promise<Character[]>;
  
    /**
     * コンテンツ内のキャラクター検出
     * @param content 検出対象のコンテンツ
     * @returns 検出されたキャラクターの配列
     */
    detectCharactersInContent(content: string): Promise<Character[]>;
  
    /**
     * キャラクター発展処理
     * @param id キャラクターID
     * @param events 章イベント配列
     * @returns 更新されたキャラクター
     */
    processCharacterDevelopment(id: string, events: ChapterEvent[]): Promise<Character>;
  
    /**
     * 関係性更新
     * @param char1Id 1人目のキャラクターID
     * @param char2Id 2人目のキャラクターID
     * @param type 関係性タイプ
     * @param strength 関係性の強さ
     */
    updateRelationship(char1Id: string, char2Id: string, type: string, strength: number): Promise<void>;
  
    // /**
    //  * キャラクター分析
    //  * @param id キャラクターID
    //  * @returns 分析結果
    //  */
    // analyzeCharacter(id: string): Promise<any>;
  }