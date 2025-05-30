/**
 * キャラクタースキルリポジトリ
 * スキルデータの永続化を担当
 */
import { ISkillRepository } from '../core/interfaces';
import { Skill } from '../core/types';
import { storageProvider } from '@/lib/storage';
import { logger } from '@/lib/utils/logger';
import { CharacterError, NotFoundError, PersistenceError } from '../core/errors';
import { STORAGE_KEYS } from '../core/constants';

/**
 * スキルリポジトリの型定義
 * キャラクタースキルのキャッシュデータ型
 */
interface CharacterSkillData {
  skillId: string;
  level: number;
  proficiency: number;
  acquired: Date;
}

/**
 * スキルリポジトリクラス
 * ISkillRepositoryインターフェースを実装
 */
export class SkillRepository implements ISkillRepository {
  // スキル定義のインメモリキャッシュ
  private skillDefinitions: Map<string, Skill> = new Map();
  
  // キャラクタースキルのインメモリキャッシュ
  // Map<characterId, Map<skillId, skillData>>
  private characterSkills: Map<string, Map<string, CharacterSkillData>> = new Map();
  
  // 初期化フラグ
  private initialized: boolean = false;
  
  // 初期化中プロミス（重複初期化防止用）
  private initPromise: Promise<void> | null = null;

  /**
   * コンストラクタ
   */
  constructor() {
    logger.info('SkillRepository: インスタンスが作成されました');
  }

  /**
   * リポジトリの初期化
   * データのロードとキャッシュの構築
   */
  private async initialize(): Promise<void> {
    // 既に初期化済みの場合は何もしない
    if (this.initialized) {
      return;
    }

    // 初期化中に重複呼び出しされた場合は既存のプロミスを返す
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        logger.info('SkillRepository: 初期化を開始します');
        
        // スキル定義をロード
        await this.loadSkillDefinitions();
        
        // キャラクタースキルはここでは事前ロードしない
        // （必要な時に遅延ロードする戦略を採用）
        
        this.initialized = true;
        logger.info('SkillRepository: 初期化が完了しました');
      } catch (error) {
        logger.error('SkillRepository: 初期化に失敗しました', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        throw new PersistenceError(
          'initialize',
          'Skills',
          '初期化に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        );
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  /**
   * スキル定義のロード
   * @private
   */
  private async loadSkillDefinitions(): Promise<void> {
    try {
      // ディレクトリ構造の確認と作成
      await this.ensureDirectoryStructure();

      // ファイルパス
      const filePath = `skills/${STORAGE_KEYS.SKILL_DEFINITIONS}.json`;
      
      // ファイルの存在確認
      const fileExists = await storageProvider.fileExists(filePath);
      if (!fileExists) {
        logger.warn(`SkillRepository: スキル定義ファイルが見つかりません: ${filePath}`);
        return;
      }
      
      // ファイル読み込み
      const content = await storageProvider.readFile(filePath);
      const definitions = JSON.parse(content) as Skill[];
      
      // キャッシュにロード
      this.skillDefinitions.clear();
      for (const skill of definitions) {
        this.skillDefinitions.set(skill.id, skill);
      }
      
      logger.info(`SkillRepository: ${definitions.length}件のスキル定義をロードしました`);
    } catch (error) {
      logger.error('SkillRepository: スキル定義のロードに失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'load',
        'SkillDefinitions',
        'スキル定義のロードに失敗しました',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * キャラクタースキルのロード
   * @param characterId キャラクターID
   * @private
   */
  private async loadCharacterSkills(characterId: string): Promise<Map<string, CharacterSkillData>> {
    try {
      // ファイルパス
      const filePath = `skills/characters/${characterId}.json`;
      
      // 結果格納用のマップ
      const skillMap = new Map<string, CharacterSkillData>();
      
      // ファイルの存在確認
      const fileExists = await storageProvider.fileExists(filePath);
      if (!fileExists) {
        logger.debug(`SkillRepository: キャラクタースキルファイルが見つかりません: ${filePath}`);
        return skillMap; // 空のマップを返す
      }
      
      // ファイル読み込み
      const content = await storageProvider.readFile(filePath);
      const skillsData = JSON.parse(content) as Array<{
        skillId: string;
        level: number;
        proficiency: number;
        acquired: string;
      }>;
      
      // マップに格納（日付文字列をDateオブジェクトに変換）
      for (const skillData of skillsData) {
        skillMap.set(skillData.skillId, {
          ...skillData,
          acquired: new Date(skillData.acquired)
        });
      }
      
      logger.debug(`SkillRepository: キャラクター「${characterId}」の${skillMap.size}件のスキルをロードしました`);
      return skillMap;
    } catch (error) {
      logger.error(`SkillRepository: キャラクター「${characterId}」のスキルロードに失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'load',
        'CharacterSkills',
        `キャラクター「${characterId}」のスキルロードに失敗しました`,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * ディレクトリ構造の確認と作成
   * @private
   */
  private async ensureDirectoryStructure(): Promise<void> {
    try {
      // スキルディレクトリ
      const skillDirExists = await storageProvider.directoryExists('skills');
      if (!skillDirExists) {
        await storageProvider.createDirectory('skills');
        logger.info('SkillRepository: skillsディレクトリを作成しました');
      }
      
      // キャラクタースキルディレクトリ
      const charSkillDirExists = await storageProvider.directoryExists('skills/characters');
      if (!charSkillDirExists) {
        await storageProvider.createDirectory('skills/characters');
        logger.info('SkillRepository: skills/charactersディレクトリを作成しました');
      }
    } catch (error) {
      logger.error('SkillRepository: ディレクトリ構造の確認/作成に失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'createDirectory',
        'SkillDirectories',
        'ディレクトリ構造の確認/作成に失敗しました',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * キャラクタースキルの取得
   * @param characterId キャラクターID
   * @returns スキルの配列
   */
  async getCharacterSkills(characterId: string): Promise<Skill[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // スキル定義マップの確認
      if (this.skillDefinitions.size === 0) {
        await this.loadSkillDefinitions();
      }
      
      // キャラクタースキルマップの取得かロード
      let skillMap = this.characterSkills.get(characterId);
      if (!skillMap) {
        skillMap = await this.loadCharacterSkills(characterId);
        this.characterSkills.set(characterId, skillMap);
      }
      
      // スキル完全情報の構築
      const result: Skill[] = [];
      
      for (const [skillId, skillData] of skillMap.entries()) {
        const skillDef = this.skillDefinitions.get(skillId);
        if (skillDef) {
          // スキル定義と習得情報をマージ
          const completeSkill: Skill = {
            ...skillDef,
            level: skillData.level
          };
          
          result.push(completeSkill);
        } else {
          logger.warn(`SkillRepository: スキル定義が見つかりません: ${skillId}`);
        }
      }
      
      return result;
    } catch (error) {
      logger.error(`SkillRepository: キャラクター「${characterId}」のスキル取得に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'get',
        'CharacterSkills',
        `キャラクター「${characterId}」のスキル取得に失敗しました`,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * キャラクタースキルの保存
   * @param characterId キャラクターID
   * @param skills 保存するスキル配列
   */
  async saveCharacterSkills(characterId: string, skills: Skill[]): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // ディレクトリ構造の確認
      await this.ensureDirectoryStructure();
      
      // スキル情報をMap形式に変換（既存データと結合）
      let skillMap = this.characterSkills.get(characterId);
      if (!skillMap) {
        skillMap = new Map<string, CharacterSkillData>();
      }

      // 新しいスキル情報で更新または追加
      const now = new Date();
      for (const skill of skills) {
        const existingData = skillMap.get(skill.id);
        skillMap.set(skill.id, {
          skillId: skill.id,
          level: skill.level || 1,
          proficiency: 0, // デフォルト習熟度
          acquired: existingData?.acquired || now
        });
      }
      
      // キャッシュを更新
      this.characterSkills.set(characterId, skillMap);
      
      // 保存用データの準備
      const skillsData = Array.from(skillMap.values()).map(skillData => ({
        ...skillData,
        acquired: skillData.acquired.toISOString()
      }));
      
      // ファイルに保存
      const filePath = `skills/characters/${characterId}.json`;
      await storageProvider.writeFile(filePath, JSON.stringify(skillsData, null, 2));
      
      logger.debug(`SkillRepository: キャラクター「${characterId}」の${skills.length}件のスキルを保存しました`);
    } catch (error) {
      logger.error(`SkillRepository: キャラクター「${characterId}」のスキル保存に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'save',
        'CharacterSkills',
        `キャラクター「${characterId}」のスキル保存に失敗しました`,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * スキル定義の取得
   * @returns スキル定義の配列
   */
  async getSkillDefinitions(): Promise<Skill[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      return Array.from(this.skillDefinitions.values());
    } catch (error) {
      logger.error('SkillRepository: スキル定義の取得に失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'get',
        'SkillDefinitions',
        'スキル定義の取得に失敗しました',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * スキル定義の保存
   * @param definitions 保存するスキル定義
   */
  async saveSkillDefinitions(definitions: Skill[]): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // ディレクトリ構造の確認
      await this.ensureDirectoryStructure();
      
      // キャッシュの更新
      this.skillDefinitions.clear();
      for (const skill of definitions) {
        this.skillDefinitions.set(skill.id, skill);
      }
      
      // ファイルに保存
      const filePath = `skills/${STORAGE_KEYS.SKILL_DEFINITIONS}.json`;
      await storageProvider.writeFile(filePath, JSON.stringify(definitions, null, 2));
      
      logger.info(`SkillRepository: ${definitions.length}件のスキル定義を保存しました`);
    } catch (error) {
      logger.error('SkillRepository: スキル定義の保存に失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'save',
        'SkillDefinitions',
        'スキル定義の保存に失敗しました',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * スキルレベルの更新（差分更新）
   * @param characterId キャラクターID
   * @param skillId スキルID
   * @param level 新しいレベル
   */
  async updateSkillLevel(characterId: string, skillId: string, level: number): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // レベルを1〜5に制限
      const clampedLevel = Math.max(1, Math.min(5, level));
      
      // キャラクタースキルを取得（キャッシュまたはロード）
      let skillMap = this.characterSkills.get(characterId);
      if (!skillMap) {
        skillMap = await this.loadCharacterSkills(characterId);
        this.characterSkills.set(characterId, skillMap);
      }
      
      // スキルの存在確認
      const skillData = skillMap.get(skillId);
      if (!skillData) {
        throw new NotFoundError('Skill', skillId);
      }
      
      // 前のレベルを記録（ログ用）
      const previousLevel = skillData.level;
      
      // レベルを更新
      skillData.level = clampedLevel;
      
      // 保存用データの準備
      const skillsData = Array.from(skillMap.values()).map(data => ({
        ...data,
        acquired: data.acquired.toISOString()
      }));
      
      // ファイルに保存
      const filePath = `skills/characters/${characterId}.json`;
      await storageProvider.writeFile(filePath, JSON.stringify(skillsData, null, 2));
      
      logger.debug(`SkillRepository: キャラクター「${characterId}」のスキル「${skillId}」のレベルを更新しました: ${previousLevel} -> ${clampedLevel}`);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error(`SkillRepository: キャラクター「${characterId}」のスキル「${skillId}」のレベル更新に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'update',
        'SkillLevel',
        `キャラクター「${characterId}」のスキル「${skillId}」のレベル更新に失敗しました`,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * スキル習熟度の更新（差分更新）
   * @param characterId キャラクターID
   * @param skillId スキルID
   * @param proficiency 新しい習熟度
   */
  async updateSkillProficiency(characterId: string, skillId: string, proficiency: number): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // 習熟度を0〜100に制限
      const clampedProficiency = Math.max(0, Math.min(100, proficiency));
      
      // キャラクタースキルを取得（キャッシュまたはロード）
      let skillMap = this.characterSkills.get(characterId);
      if (!skillMap) {
        skillMap = await this.loadCharacterSkills(characterId);
        this.characterSkills.set(characterId, skillMap);
      }
      
      // スキルの存在確認
      const skillData = skillMap.get(skillId);
      if (!skillData) {
        throw new NotFoundError('Skill', skillId);
      }
      
      // 前の習熟度を記録（ログ用）
      const previousProficiency = skillData.proficiency;
      
      // 習熟度を更新
      skillData.proficiency = clampedProficiency;
      
      // 保存用データの準備
      const skillsData = Array.from(skillMap.values()).map(data => ({
        ...data,
        acquired: data.acquired.toISOString()
      }));
      
      // ファイルに保存
      const filePath = `skills/characters/${characterId}.json`;
      await storageProvider.writeFile(filePath, JSON.stringify(skillsData, null, 2));
      
      logger.debug(`SkillRepository: キャラクター「${characterId}」のスキル「${skillId}」の習熟度を更新しました: ${previousProficiency} -> ${clampedProficiency}`);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error(`SkillRepository: キャラクター「${characterId}」のスキル「${skillId}」の習熟度更新に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'update',
        'SkillProficiency',
        `キャラクター「${characterId}」のスキル「${skillId}」の習熟度更新に失敗しました`,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * キャッシュのクリア（テスト用、またはメモリ解放用）
   */
  clearCache(): void {
    this.skillDefinitions.clear();
    this.characterSkills.clear();
    this.initialized = false;
    logger.debug('SkillRepository: キャッシュをクリアしました');
  }
}

// シングルトンインスタンスのエクスポート
export const skillRepository = new SkillRepository();