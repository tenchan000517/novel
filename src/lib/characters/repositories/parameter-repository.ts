/**
 * キャラクターパラメータリポジトリ
 * パラメータデータの永続化を担当
 */
import { IParameterRepository } from '../core/interfaces';
import { 
  CharacterParameter, 
} from '../core/types';
import { storageProvider } from '@/lib/storage';
import { logger } from '@/lib/utils/logger';
import { CharacterError, NotFoundError, PersistenceError } from '../core/errors';
import { STORAGE_KEYS } from '../core/constants';

/**
 * パラメータリポジトリのクラス
 * IParameterRepositoryインターフェースを実装
 */
export class ParameterRepository implements IParameterRepository {
  // パラメータ定義のインメモリキャッシュ
  private parameterDefinitions: Map<string, CharacterParameter> = new Map();
  
  // キャラクターパラメータのインメモリキャッシュ
  // Map<characterId, Map<parameterId, parameter>>
  private characterParameters: Map<string, Map<string, CharacterParameter>> = new Map();
  
  // 初期化フラグ
  private initialized: boolean = false;
  
  // 初期化中プロミス（重複初期化防止用）
  private initPromise: Promise<void> | null = null;

  /**
   * コンストラクタ
   */
  constructor() {
    logger.info('ParameterRepository: インスタンスが作成されました');
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
        logger.info('ParameterRepository: 初期化を開始します');
        
        // パラメータ定義をロード
        await this.loadParameterDefinitions();
        
        // キャラクターパラメータはここでは事前ロードしない
        // （必要な時に遅延ロードする戦略を採用）
        
        this.initialized = true;
        logger.info('ParameterRepository: 初期化が完了しました');
      } catch (error) {
        logger.error('ParameterRepository: 初期化に失敗しました', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        throw new PersistenceError(
          'initialize',
          'Parameters',
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
   * パラメータ定義のロード
   * @private
   */
  private async loadParameterDefinitions(): Promise<void> {
    try {
      // ディレクトリ構造の確認と作成
      await this.ensureDirectoryStructure();

      // ファイルパス
      const filePath = `parameters/${STORAGE_KEYS.PARAMETER_DEFINITIONS}.json`;
      
      // ファイルの存在確認
      const fileExists = await storageProvider.fileExists(filePath);
      if (!fileExists) {
        logger.warn(`ParameterRepository: パラメータ定義ファイルが見つかりません: ${filePath}`);
        return;
      }
      
      // ファイル読み込み
      const content = await storageProvider.readFile(filePath);
      const definitions = JSON.parse(content) as CharacterParameter[];
      
      // キャッシュにロード
      this.parameterDefinitions.clear();
      for (const param of definitions) {
        this.parameterDefinitions.set(param.id, param);
      }
      
      logger.info(`ParameterRepository: ${definitions.length}件のパラメータ定義をロードしました`);
    } catch (error) {
      logger.error('ParameterRepository: パラメータ定義のロードに失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'load',
        'ParameterDefinitions',
        'パラメータ定義のロードに失敗しました',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * キャラクターパラメータのロード
   * @param characterId キャラクターID
   * @private
   */
  private async loadCharacterParameters(characterId: string): Promise<Map<string, CharacterParameter>> {
    try {
      // ファイルパス
      const filePath = `parameters/characters/${characterId}.json`;
      
      // 結果格納用のマップ
      const paramMap = new Map<string, CharacterParameter>();
      
      // ファイルの存在確認
      const fileExists = await storageProvider.fileExists(filePath);
      if (!fileExists) {
        logger.debug(`ParameterRepository: キャラクターパラメータファイルが見つかりません: ${filePath}`);
        return paramMap; // 空のマップを返す
      }
      
      // ファイル読み込み
      const content = await storageProvider.readFile(filePath);
      const parameters = JSON.parse(content) as CharacterParameter[];
      
      // マップに格納
      for (const param of parameters) {
        paramMap.set(param.id, param);
      }
      
      logger.debug(`ParameterRepository: キャラクター「${characterId}」の${paramMap.size}件のパラメータをロードしました`);
      return paramMap;
    } catch (error) {
      logger.error(`ParameterRepository: キャラクター「${characterId}」のパラメータロードに失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'load',
        'CharacterParameters',
        `キャラクター「${characterId}」のパラメータロードに失敗しました`,
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
      // パラメータディレクトリ
      const paramDirExists = await storageProvider.directoryExists('parameters');
      if (!paramDirExists) {
        await storageProvider.createDirectory('parameters');
        logger.info('ParameterRepository: parametersディレクトリを作成しました');
      }
      
      // キャラクターパラメータディレクトリ
      const charParamDirExists = await storageProvider.directoryExists('parameters/characters');
      if (!charParamDirExists) {
        await storageProvider.createDirectory('parameters/characters');
        logger.info('ParameterRepository: parameters/charactersディレクトリを作成しました');
      }
    } catch (error) {
      logger.error('ParameterRepository: ディレクトリ構造の確認/作成に失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'createDirectory',
        'ParameterDirectories',
        'ディレクトリ構造の確認/作成に失敗しました',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * キャラクターパラメータの取得
   * @param characterId キャラクターID
   * @returns パラメータの配列
   */
  async getCharacterParameters(characterId: string): Promise<CharacterParameter[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // キャッシュチェック
      let paramMap = this.characterParameters.get(characterId);
      
      // キャッシュになければロード
      if (!paramMap) {
        paramMap = await this.loadCharacterParameters(characterId);
        this.characterParameters.set(characterId, paramMap);
      }
      
      return Array.from(paramMap.values());
    } catch (error) {
      logger.error(`ParameterRepository: キャラクター「${characterId}」のパラメータ取得に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'get',
        'CharacterParameters',
        `キャラクター「${characterId}」のパラメータ取得に失敗しました`,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * キャラクターパラメータの保存
   * @param characterId キャラクターID
   * @param parameters 保存するパラメータ配列
   */
  async saveCharacterParameters(characterId: string, parameters: CharacterParameter[]): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // ディレクトリ構造の確認
      await this.ensureDirectoryStructure();
      
      // パラメータをMap形式にしてキャッシュに格納
      const paramMap = new Map<string, CharacterParameter>();
      for (const param of parameters) {
        paramMap.set(param.id, param);
      }
      
      // キャッシュを更新
      this.characterParameters.set(characterId, paramMap);
      
      // ファイルに保存
      const filePath = `parameters/characters/${characterId}.json`;
      await storageProvider.writeFile(filePath, JSON.stringify(parameters, null, 2));
      
      logger.debug(`ParameterRepository: キャラクター「${characterId}」の${parameters.length}件のパラメータを保存しました`);
    } catch (error) {
      logger.error(`ParameterRepository: キャラクター「${characterId}」のパラメータ保存に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'save',
        'CharacterParameters',
        `キャラクター「${characterId}」のパラメータ保存に失敗しました`,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * パラメータ定義の取得
   * @returns パラメータ定義の配列
   */
  async getParameterDefinitions(): Promise<CharacterParameter[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      return Array.from(this.parameterDefinitions.values());
    } catch (error) {
      logger.error('ParameterRepository: パラメータ定義の取得に失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'get',
        'ParameterDefinitions',
        'パラメータ定義の取得に失敗しました',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * パラメータ定義の保存
   * @param definitions 保存するパラメータ定義
   */
  async saveParameterDefinitions(definitions: CharacterParameter[]): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // ディレクトリ構造の確認
      await this.ensureDirectoryStructure();
      
      // キャッシュの更新
      this.parameterDefinitions.clear();
      for (const param of definitions) {
        this.parameterDefinitions.set(param.id, param);
      }
      
      // ファイルに保存
      const filePath = `parameters/${STORAGE_KEYS.PARAMETER_DEFINITIONS}.json`;
      await storageProvider.writeFile(filePath, JSON.stringify(definitions, null, 2));
      
      logger.info(`ParameterRepository: ${definitions.length}件のパラメータ定義を保存しました`);
    } catch (error) {
      logger.error('ParameterRepository: パラメータ定義の保存に失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'save',
        'ParameterDefinitions',
        'パラメータ定義の保存に失敗しました',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * 単一パラメータ値の更新（差分更新）
   * @param characterId キャラクターID
   * @param parameterId パラメータID
   * @param value 新しい値
   */
  async updateParameterValue(characterId: string, parameterId: string, value: number): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // キャラクターパラメータを取得（キャッシュまたはロード）
      let paramMap = this.characterParameters.get(characterId);
      if (!paramMap) {
        paramMap = await this.loadCharacterParameters(characterId);
        this.characterParameters.set(characterId, paramMap);
      }
      
      // パラメータの存在確認
      const parameter = paramMap.get(parameterId);
      if (!parameter) {
        throw new NotFoundError('Parameter', parameterId);
      }
      
      // 値の範囲を0〜100に制限
      const clampedValue = Math.max(0, Math.min(100, value));
      
      // 前の値を記録（ログ用）
      const previousValue = parameter.value;
      
      // 値を更新
      parameter.value = clampedValue;
      
      // ファイルに保存（オリジナルのパラメータ配列を維持）
      const parameters = Array.from(paramMap.values());
      const filePath = `parameters/characters/${characterId}.json`;
      await storageProvider.writeFile(filePath, JSON.stringify(parameters, null, 2));
      
      logger.debug(`ParameterRepository: キャラクター「${characterId}」のパラメータ「${parameterId}」を更新しました: ${previousValue} -> ${clampedValue}`);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error(`ParameterRepository: キャラクター「${characterId}」のパラメータ「${parameterId}」の更新に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new PersistenceError(
        'update',
        'ParameterValue',
        `キャラクター「${characterId}」のパラメータ「${parameterId}」の更新に失敗しました`,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * キャッシュのクリア（テスト用、またはメモリ解放用）
   */
  clearCache(): void {
    this.parameterDefinitions.clear();
    this.characterParameters.clear();
    this.initialized = false;
    logger.debug('ParameterRepository: キャッシュをクリアしました');
  }
}

// シングルトンインスタンスのエクスポート
export const parameterRepository = new ParameterRepository();