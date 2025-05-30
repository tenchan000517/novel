/**
 * @fileoverview キャラクターリポジトリ
 * @description
 * キャラクターデータの永続化を担当するリポジトリクラス。
 * 不変データと可変データを分離して管理し、差分更新と効率的なキャッシュを提供する。
 */
import { Character, CharacterData, CharacterState, CharacterType } from '../core/types';
import { ICharacterRepository } from '../core/interfaces';
import { 
  NotFoundError, 
  PersistenceError, 
  ValidationError
} from '../core/errors';
import { STORAGE_KEYS } from '../core/constants';
import { storageProvider } from '@/lib/storage';
import { logger } from '@/lib/utils/logger';
import { parseYaml, stringifyYaml } from '@/lib/utils/yaml-helper';
import { generateId } from '@/lib/utils/helpers';

/**
 * キャラクターリポジトリクラス
 * キャラクターデータの永続化と検索を担当
 */
export class CharacterRepository implements ICharacterRepository {
  // インメモリキャッシュ
  private charactersCache: Map<string, Character> = new Map();
  private charactersStateCache: Map<string, CharacterState> = new Map();
  private charactersByNameCache: Map<string, string> = new Map(); // 名前 -> ID マッピング
  
  // キャッシュの有効期限（ミリ秒）
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分
  
  // キャッシュタイムスタンプ
  private cacheTimestamps: Map<string, number> = new Map();
  
  // 初期化フラグ
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * コンストラクタ
   */
  constructor() {
    // 初期化は遅延実行
  }

  /**
   * リポジトリの初期化
   * 必要なディレクトリ構造を確認・作成する
   */
  private async initialize(): Promise<void> {
    try {
      // すでに初期化済みなら何もしない
      if (this.initialized) return;
      
      // 初期化中のプロミスがあればそれを返す
      if (this.initPromise) return this.initPromise;
      
      // 初期化プロミスを作成
      this.initPromise = this.doInitialize();
      await this.initPromise;
      
      this.initialized = true;
      logger.info('キャラクターリポジトリを初期化しました');
    } catch (error) {
      logger.error('キャラクターリポジトリの初期化に失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      // 初期化に失敗した場合、次回再試行できるようにnullに戻す
      this.initPromise = null;
      throw new PersistenceError(
        'initialize', 
        'repository', 
        'キャラクターリポジトリの初期化に失敗しました', 
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 実際の初期化処理
   */
  private async doInitialize(): Promise<void> {
    // 必要なディレクトリ構造を確認・作成
    const directories = [
      'characters',
      'characters/definitions',
      'characters/states',
      'characters/main',
      'characters/sub-characters',
      'characters/mob-characters'
    ];
    
    for (const dir of directories) {
      await this.ensureDirectoryExists(dir);
    }
    
    // 既存のキャラクターインデックスをプリロード
    await this.preloadCharacterIndex();
  }

  /**
   * キャラクターインデックスを事前読み込み
   * キャラクター名 -> ID のマッピングをキャッシュ
   */
  private async preloadCharacterIndex(): Promise<void> {
    try {
      // メインキャラクターのロード
      const mainCharacters = await this.loadCharactersByType('MAIN');
      
      // サブキャラクターのロード (一部のみ)
      const subCharacters = await this.loadCharactersByType('SUB');
      
      // インデックスを構築
      for (const character of [...mainCharacters, ...subCharacters]) {
        this.charactersByNameCache.set(character.name.toLowerCase(), character.id);
        
        // ショートネームもインデックス
        if (character.shortNames) {
          for (const shortName of character.shortNames) {
            this.charactersByNameCache.set(shortName.toLowerCase(), character.id);
          }
        }
      }
      
      logger.debug(`キャラクターインデックスをプリロードしました: ${this.charactersByNameCache.size} エントリ`);
    } catch (error) {
      logger.warn('キャラクターインデックスのプリロードに失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      // 続行可能なので例外はスロー不要
    }
  }

  /**
   * ディレクトリの存在を確認し、存在しない場合は作成する
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      const exists = await storageProvider.directoryExists(dirPath);
      if (!exists) {
        await storageProvider.createDirectory(dirPath);
        logger.debug(`ディレクトリを作成しました: ${dirPath}`);
      }
    } catch (error) {
      logger.warn(`ディレクトリの確認/作成中にエラーが発生しました: ${dirPath}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      // エラーは上位に伝播
      throw error;
    }
  }

  /**
   * 初期化が完了していることを確認
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * インメモリキャッシュにキャラクターを保存
   */
  private cacheCharacter(character: Character): void {
    this.charactersCache.set(character.id, character);
    this.cacheTimestamps.set(`character:${character.id}`, Date.now());
    
    // 状態も別途キャッシュ
    this.charactersStateCache.set(character.id, character.state);
    this.cacheTimestamps.set(`state:${character.id}`, Date.now());
    
    // 名前インデックスを更新
    this.charactersByNameCache.set(character.name.toLowerCase(), character.id);
    if (character.shortNames) {
      for (const shortName of character.shortNames) {
        this.charactersByNameCache.set(shortName.toLowerCase(), character.id);
      }
    }
  }

  /**
   * キャッシュからキャラクターを取得
   * キャッシュが古い場合はnullを返す
   */
  private getCachedCharacter(id: string): Character | null {
    const timestamp = this.cacheTimestamps.get(`character:${id}`);
    if (!timestamp || Date.now() - timestamp > this.CACHE_TTL) {
      return null;
    }
    return this.charactersCache.get(id) || null;
  }

  /**
   * 文字列データからキャラクター情報をパース
   */
  private parseCharacterData(data: string, filePath: string): Character | null {
    try {
      let parsedData: any;

      // ファイル形式に応じたパース
      if (filePath.endsWith('.json')) {
        parsedData = JSON.parse(data);
      } else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
        parsedData = parseYaml(data);
      } else {
        logger.warn(`未対応のファイル形式: ${filePath}`);
        return null;
      }

      // 必須フィールドのバリデーション
      if (!this.validateCharacterData(parsedData, filePath)) {
        return null;
      }

      // 日付文字列をDateオブジェクトに変換
      this.convertDates(parsedData);

      return parsedData as Character;
    } catch (error) {
      logger.error('キャラクターデータのパースに失敗しました', {
        filePath,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * キャラクターデータの必須フィールドをバリデーション
   */
  private validateCharacterData(data: any, filePath: string): boolean {
    const requiredFields = ['id', 'name', 'type', 'description', 'state', 'history', 'metadata'];

    for (const field of requiredFields) {
      if (!data[field]) {
        logger.warn(`キャラクターデータに必須フィールド ${field} がありません: ${filePath}`);
        return false;
      }
    }

    return true;
  }

  /**
   * オブジェクト内の日付文字列をDateオブジェクトに変換
   */
  private convertDates(obj: any): void {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
      const value = obj[key];

      // ISOフォーマットの日付文字列をDateオブジェクトに変換
      if (typeof value === 'string' &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?Z$/.test(value)) {
        obj[key] = new Date(value);
      }
      // 再帰的に処理
      else if (typeof value === 'object' && value !== null) {
        this.convertDates(value);
      }
    }
  }

  /**
   * タイプに応じたディレクトリを取得
   */
  private getDirectoryByType(type: CharacterType): string {
    switch (type) {
      case 'MAIN':
        return 'characters/main';
      case 'SUB':
        return 'characters/sub-characters';
      case 'MOB':
        return 'characters/mob-characters';
      default:
        return 'characters/mob-characters';
    }
  }

  /**
   * キャラクターの定義ファイルパスを取得
   */
  private getCharacterDefinitionPath(id: string): string {
    return `characters/definitions/${id}.yaml`;
  }

  /**
   * キャラクターの状態ファイルパスを取得
   */
  private getCharacterStatePath(id: string): string {
    return `characters/states/${id}.yaml`;
  }

  /**
   * レガシーファイルパスの取得（後方互換性のため）
   */
  private getLegacyCharacterFilePath(character: Character): string {
    return `${this.getDirectoryByType(character.type)}/${character.id}.yaml`;
  }

  /**
   * 指定されたタイプのキャラクターをロード
   */
  private async loadCharactersByType(type: CharacterType): Promise<Character[]> {
    try {
      const directoryPath = this.getDirectoryByType(type);
      const fileList = await storageProvider.listFiles(directoryPath);

      const characters: Character[] = [];
      const loadPromises: Promise<void>[] = [];

      for (const filePath of fileList) {
        if (filePath.endsWith('.yaml') || filePath.endsWith('.json')) {
          const loadPromise = (async () => {
            try {
              const content = await storageProvider.readFile(filePath);
              const character = this.parseCharacterData(content, filePath);
              if (character) {
                characters.push(character);
                this.cacheCharacter(character);
              }
            } catch (loadError) {
              logger.error(`ファイル ${filePath} のロードに失敗しました`, {
                error: loadError instanceof Error ? loadError.message : String(loadError)
              });
            }
          })();
          loadPromises.push(loadPromise);
        }
      }

      // 全てのファイル読み込みを並行して行い、完了を待つ
      await Promise.all(loadPromises);

      return characters;
    } catch (error) {
      logger.error(`${type}タイプのキャラクターのロードに失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'load', 
        'characters', 
        `${type}タイプのキャラクターのロードに失敗しました`, 
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * キャラクターをファイルから読み込む
   */
  private async loadCharacterFromFile(id: string): Promise<Character | null> {
    try {
      // 定義ファイルの存在確認
      const definitionPath = this.getCharacterDefinitionPath(id);
      let definitionExists = await storageProvider.fileExists(definitionPath);
      
      // 定義ファイルが存在しない場合はレガシーパスを確認
      let content: string;
      let filePath: string;
      
      if (definitionExists) {
        // 新形式: 定義と状態を別々に読み込み
        content = await storageProvider.readFile(definitionPath);
        filePath = definitionPath;
        
        const character = this.parseCharacterData(content, filePath);
        if (!character) return null;
        
        // 状態ファイルの読み込み
        const statePath = this.getCharacterStatePath(id);
        const stateExists = await storageProvider.fileExists(statePath);
        
        if (stateExists) {
          const stateContent = await storageProvider.readFile(statePath);
          const stateData = filePath.endsWith('.json') ? 
            JSON.parse(stateContent) : parseYaml(stateContent);
          
          // 状態のマージ
          character.state = stateData;
        }
        
        return character;
      } else {
        // レガシー形式の検索: 各ディレクトリを順番に検索
        const directories = [
          'characters/main',
          'characters/sub-characters',
          'characters/mob-characters'
        ];
        
        for (const dir of directories) {
          const legacyPath = `${dir}/${id}.yaml`;
          const exists = await storageProvider.fileExists(legacyPath);
          
          if (exists) {
            content = await storageProvider.readFile(legacyPath);
            filePath = legacyPath;
            
            const character = this.parseCharacterData(content, filePath);
            if (character) {
              // レガシー形式から読み込んだ場合、新形式にマイグレーション
              await this.migrateToNewFormat(character);
              return character;
            }
          }
        }
      }
      
      // 見つからなかった場合
      return null;
    } catch (error) {
      logger.error(`キャラクター ${id} の読み込みに失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * レガシー形式から新形式へのマイグレーション
   */
  private async migrateToNewFormat(character: Character): Promise<void> {
    try {
      // 不変データと可変データを分離して保存
      await this.saveCharacterDefinition(character);
      await this.saveCharacterState(character.id, character.state);
      
      // レガシーファイルは削除しない（安全のため）
      logger.info(`キャラクター ${character.id} を新形式にマイグレーションしました`);
    } catch (error) {
      logger.error(`キャラクター ${character.id} のマイグレーションに失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * キャラクター定義（不変データ）をファイルに保存
   */
  private async saveCharacterDefinition(character: Character): Promise<void> {
    try {
      const { state, ...definitionData } = character;
      const filePath = this.getCharacterDefinitionPath(character.id);
      
      // YAMLとして保存
      const content = stringifyYaml(definitionData);
      await storageProvider.writeFile(filePath, content);
      
      logger.debug(`キャラクター定義を保存しました: ${filePath}`);
    } catch (error) {
      logger.error(`キャラクター定義の保存に失敗しました: ${character.id}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'save', 
        'character definition', 
        `キャラクター定義の保存に失敗しました: ${character.id}`, 
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * オブジェクトのプロパティをパスに基づいて更新する
   * @param obj 更新対象のオブジェクト
   * @param path ドット区切りのプロパティパス (例: "state.isActive")
   * @param value 新しい値
   */
  private updateObjectProperty(obj: any, path: string, value: any): any {
    const copy = { ...obj };
    const parts = path.split('.');
    let current = copy;
    
    // パスの最後の部分以外を辿る
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      
      // 配列インデックスの場合
      if (/^\d+$/.test(part)) {
        const index = parseInt(part, 10);
        if (!Array.isArray(current)) {
          current = [];
        }
        if (!current[index]) {
          current[index] = {};
        }
        current = current[index];
      } else {
        // オブジェクトプロパティの場合
        if (!current[part] || typeof current[part] !== 'object') {
          current[part] = {};
        }
        current = current[part];
      }
    }
    
    // 最後のプロパティを更新
    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
    
    return copy;
  }

  /**
   * オブジェクトの深いマージを行う
   * 対象オブジェクトの配列プロパティは上書きではなく追加される
   */
  private deepMerge(target: any, source: any): any {
    if (!source) return target;
    
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] === null) {
        result[key] = null;
        continue;
      }
      
      if (typeof source[key] !== 'object') {
        // プリミティブ値は単純に上書き
        result[key] = source[key];
        continue;
      }
      
      if (Array.isArray(source[key])) {
        // 配列は新しい要素だけ追加（重複を避ける）
        if (!result[key]) result[key] = [];
        if (!Array.isArray(result[key])) result[key] = [];
        
        for (const item of source[key]) {
          // オブジェクトの場合は一意性を確認（id プロパティがある場合）
          if (typeof item === 'object' && item !== null && 'id' in item) {
            const existingIndex = result[key].findIndex((existing: any) => existing.id === item.id);
            if (existingIndex >= 0) {
              // 既存アイテムを更新
              result[key][existingIndex] = this.deepMerge(result[key][existingIndex], item);
            } else {
              // 新しいアイテムを追加
              result[key].push(item);
            }
          } else if (!result[key].includes(item)) {
            // プリミティブ値は単純な重複チェック
            result[key].push(item);
          }
        }
      } else {
        // ネストされたオブジェクトは再帰的にマージ
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      }
    }
    
    return result;
  }

  // インターフェースメソッドの実装 -----------------------------------------------

  /**
   * IDによるキャラクター取得
   * @param id キャラクターID
   * @returns キャラクターオブジェクトまたはnull
   */
  async getCharacterById(id: string): Promise<Character | null> {
    await this.ensureInitialized();
    
    // キャッシュを確認
    const cachedCharacter = this.getCachedCharacter(id);
    if (cachedCharacter) {
      return cachedCharacter;
    }
    
    // ファイルから読み込み
    const character = await this.loadCharacterFromFile(id);
    
    if (character) {
      // キャッシュに追加
      this.cacheCharacter(character);
      return character;
    }
    
    return null;
  }

  /**
   * 名前によるキャラクター取得
   * @param name キャラクター名
   * @returns キャラクターオブジェクトまたはnull
   */
  async getCharacterByName(name: string): Promise<Character | null> {
    await this.ensureInitialized();
    
    // 名前インデックスキャッシュを確認
    const characterId = this.charactersByNameCache.get(name.toLowerCase());
    if (characterId) {
      return this.getCharacterById(characterId);
    }
    
    // キャッシュにない場合は全キャラクターから検索
    const allCharacters = await this.getAllCharacters();
    
    // 完全一致検索
    const exactMatch = allCharacters.find(char => char.name.toLowerCase() === name.toLowerCase());
    if (exactMatch) {
      // キャッシュに追加
      this.charactersByNameCache.set(name.toLowerCase(), exactMatch.id);
      return exactMatch;
    }
    
    // ショートネーム検索
    const shortNameMatch = allCharacters.find(char => 
      char.shortNames && char.shortNames.some(shortName => 
        shortName.toLowerCase() === name.toLowerCase()
      )
    );
    
    if (shortNameMatch) {
      // キャッシュに追加
      this.charactersByNameCache.set(name.toLowerCase(), shortNameMatch.id);
    }
    
    return shortNameMatch || null;
  }

  /**
   * すべてのキャラクター取得
   * @returns キャラクターの配列
   */
  async getAllCharacters(): Promise<Character[]> {
    await this.ensureInitialized();
    
    // 各タイプのキャラクターを読み込む
    const mainCharacters = await this.loadCharactersByType('MAIN');
    const subCharacters = await this.loadCharactersByType('SUB');
    const mobCharacters = await this.loadCharactersByType('MOB');
    
    return [...mainCharacters, ...subCharacters, ...mobCharacters];
  }

  /**
   * キャラクターの保存
   * @param character 保存するキャラクター
   */
  async saveCharacter(character: Character): Promise<void> {
    await this.ensureInitialized();
    
    try {
      // データバリデーション
      if (!character.id || !character.name || !character.type) {
        throw new ValidationError('必須フィールドが不足しています', {
          id: !character.id ? ['IDは必須です'] : [],
          name: !character.name ? ['名前は必須です'] : [],
          type: !character.type ? ['タイプは必須です'] : []
        });
      }
      
      // メタデータの更新
      character.metadata.lastUpdated = new Date();
      if (!character.metadata.version) {
        character.metadata.version = 1;
      } else {
        character.metadata.version++;
      }
      
      // 新形式で保存: 定義と状態を分離
      await this.saveCharacterDefinition(character);
      await this.saveCharacterState(character.id, character.state);
      
      // レガシー形式との互換性のため、統合ファイルも保存
      const legacyPath = this.getLegacyCharacterFilePath(character);
      const content = stringifyYaml(character);
      await storageProvider.writeFile(legacyPath, content);
      
      // キャッシュを更新
      this.cacheCharacter(character);
      
      logger.info(`キャラクターを保存しました: ${character.name} (${character.id})`);
    } catch (error) {
      logger.error(`キャラクターの保存に失敗しました: ${character.id}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'save', 
        'character', 
        `キャラクターの保存に失敗しました: ${character.id}`, 
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * キャラクターの更新
   * @param id キャラクターID
   * @param updates 更新データ
   * @returns 更新されたキャラクター
   */
  async updateCharacter(id: string, updates: Partial<CharacterData>): Promise<Character> {
    await this.ensureInitialized();
    
    // 既存キャラクターを取得
    const existing = await this.getCharacterById(id);
    if (!existing) {
      throw new NotFoundError('Character', id);
    }
    
    try {
      // メタデータの準備
      const metadata = {
        ...existing.metadata,
        lastUpdated: new Date(),
        version: (existing.metadata.version || 1) + 1,
      };
      
      if (updates.metadata?.tags) {
        metadata.tags = [
          ...(existing.metadata.tags || []),
          ...updates.metadata.tags.filter(tag => !(existing.metadata.tags || []).includes(tag))
        ];
      }
      
      // 更新データを深いマージでマージ
      const updated: Character = this.deepMerge(existing, {
        ...updates,
        metadata
      });
      
      // 保存
      await this.saveCharacter(updated);
      
      return updated;
    } catch (error) {
      logger.error(`キャラクター更新エラー: ${id}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * キャラクター状態の保存
   * @param id キャラクターID
   * @param state 保存する状態
   */
  async saveCharacterState(id: string, state: CharacterState): Promise<void> {
    await this.ensureInitialized();
    
    try {
      // ファイルパスの設定
      const filePath = this.getCharacterStatePath(id);
      
      // YAMLとして保存
      const content = stringifyYaml(state);
      await storageProvider.writeFile(filePath, content);
      
      // キャッシュを更新
      this.charactersStateCache.set(id, state);
      this.cacheTimestamps.set(`state:${id}`, Date.now());
      
      // キャラクターキャッシュも更新
      const cachedCharacter = this.charactersCache.get(id);
      if (cachedCharacter) {
        cachedCharacter.state = state;
        this.cacheTimestamps.set(`character:${id}`, Date.now());
      }
      
      logger.debug(`キャラクター状態を保存しました: ${id}`);
    } catch (error) {
      logger.error(`キャラクター状態の保存に失敗しました: ${id}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'save', 
        'character state', 
        `キャラクター状態の保存に失敗しました: ${id}`, 
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * キャラクタープロパティの部分更新
   * @param id キャラクターID
   * @param path プロパティパス（ドット区切り）
   * @param value 新しい値
   */
  async updateCharacterProperty(id: string, path: string, value: any): Promise<void> {
    await this.ensureInitialized();
    
    // キャラクターを取得
    const character = await this.getCharacterById(id);
    if (!character) {
      throw new NotFoundError('Character', id);
    }
    
    try {
      // 状態プロパティの更新
      if (path.startsWith('state.')) {
        // 状態の更新
        const statePath = path.substring(6); // 'state.'の部分を除去
        const updatedState = this.updateObjectProperty(character.state, statePath, value);
        
        // 状態のみ保存
        await this.saveCharacterState(id, updatedState);
        
        // キャラクターオブジェクトも更新
        character.state = updatedState;
        this.charactersCache.set(id, character);
        this.cacheTimestamps.set(`character:${id}`, Date.now());
      } else {
        // その他のプロパティの更新
        const updatedCharacter = this.updateObjectProperty(character, path, value);
        
        // 全体を保存
        await this.saveCharacter(updatedCharacter);
      }
      
      logger.debug(`キャラクタープロパティを更新しました: ${id}, ${path}`);
    } catch (error) {
      logger.error(`キャラクタープロパティの更新に失敗しました: ${id}, ${path}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'update', 
        'character property', 
        `キャラクタープロパティの更新に失敗しました: ${id}, ${path}`, 
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 特定のタイプのキャラクターのみ取得
   * @param type キャラクタータイプ
   * @returns 指定タイプのキャラクター配列
   */
  async getCharactersByType(type: CharacterType): Promise<Character[]> {
    await this.ensureInitialized();
    return this.loadCharactersByType(type);
  }

  /**
   * アクティブなキャラクターのみ取得
   * @returns アクティブなキャラクターの配列
   */
  async getActiveCharacters(): Promise<Character[]> {
    await this.ensureInitialized();
    
    // すべてのキャラクターを取得してフィルタリング
    const allCharacters = await this.getAllCharacters();
    return allCharacters.filter(char => char.state.isActive);
  }
}

// シングルトンインスタンスをエクスポート
export const characterRepository = new CharacterRepository();