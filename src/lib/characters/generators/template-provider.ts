/**
 * @fileoverview テンプレートプロバイダー
 * @description
 * キャラクターテンプレートの管理を担当するコンポーネント。
 * テンプレートの読み込み、結合、検索機能を提供します。
 */
import { ITemplateProvider } from '../core/interfaces';
import { CharacterTemplate } from '../core/types';
import { storageProvider } from '@/lib/storage';
import { logger } from '@/lib/utils/logger';
import { parseYaml } from '@/lib/utils/yaml-helper';
import { NotFoundError } from '../core/errors';

/**
 * テンプレートプロバイダークラス
 * キャラクターテンプレートの管理を担当
 */
export class TemplateProvider implements ITemplateProvider {
  /** テンプレートキャッシュ */
  private templateCache: Map<string, CharacterTemplate> = new Map();
  
  /** テンプレートディレクトリのパス */
  private readonly TEMPLATE_DIRS = {
    archetypes: 'characters/templates/archetypes',
    roles: 'characters/templates/roles'
  };
  
  /** キャッシュの有効期限（ミリ秒） */
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10分
  
  /** 最終キャッシュ更新時間 */
  private lastCacheUpdate: number = 0;

  /**
   * コンストラクタ
   */
  constructor() {
    logger.info('TemplateProvider: 初期化完了');
  }
  
  /**
   * プロバイダーを初期化する
   * テンプレートディレクトリの存在確認と作成
   */
  async initialize(): Promise<void> {
    try {
      // テンプレートディレクトリが存在することを確認
      const templateDirs = [
        this.TEMPLATE_DIRS.archetypes,
        this.TEMPLATE_DIRS.roles
      ];
      
      for (const dir of templateDirs) {
        await this.ensureDirectoryExists(dir);
      }
      
      // 初期キャッシュの構築
      await this.updateTemplateCache();
      
      logger.info('テンプレートプロバイダーの初期化が完了しました');
    } catch (error) {
      logger.error('テンプレートプロバイダーの初期化に失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * IDによるテンプレート取得
   * @param id テンプレートID
   * @returns キャラクターテンプレート
   */
  async getTemplateById(id: string): Promise<CharacterTemplate> {
    // キャッシュの更新確認
    await this.checkCacheRefresh();
    
    // キャッシュをチェック
    if (this.templateCache.has(id)) {
      return this.templateCache.get(id)!;
    }
    
    // アーキタイプディレクトリから検索
    try {
      const template = await this.findTemplateInDirectory(this.TEMPLATE_DIRS.archetypes, id);
      if (template) {
        this.templateCache.set(id, template);
        return template;
      }
    } catch (error) {
      // エラーは無視して次のディレクトリをチェック
    }
    
    // ロールディレクトリから検索
    try {
      const template = await this.findTemplateInDirectory(this.TEMPLATE_DIRS.roles, id);
      if (template) {
        this.templateCache.set(id, template);
        return template;
      }
    } catch (error) {
      // エラーは無視
    }
    
    // テンプレートが見つからない場合はエラー
    throw new NotFoundError('Template', id);
  }

  /**
   * テンプレートの結合
   * アーキタイプとロールを組み合わせて新しいテンプレートを作成
   * 
   * @param archetypeId アーキタイプID
   * @param roleId ロールID
   * @returns 結合されたテンプレート
   */
  async combineTemplates(archetypeId: string, roleId: string): Promise<CharacterTemplate> {
    const archetype = await this.getTemplateById(archetypeId);
    const role = await this.getTemplateById(roleId);
    
    // テンプレートを組み合わせる
    const combined: CharacterTemplate = {
      id: `${archetypeId}_${roleId}`,
      name: `${archetype.name} ${role.name}`,
      description: this.combineSafely(archetype.description, role.description, ' '),
      personality: {
        traits: this.combineArrays(archetype.personality?.traits, role.personality?.traits),
        values: this.combineArrays(archetype.personality?.values, role.personality?.values),
        quirks: this.combineArrays(archetype.personality?.quirks, role.personality?.quirks)
      },
      backstory: {
        template: role.backstory?.template || archetype.backstory?.template || '',
        significantEvents: this.combineArrays(
          archetype.backstory?.significantEvents, 
          role.backstory?.significantEvents
        ),
        origin: role.backstory?.origin || archetype.backstory?.origin || ''
      },
      relationships: this.combineArrays(archetype.relationships, role.relationships),
      suggestedType: role.suggestedType || archetype.suggestedType,
      developmentPath: role.developmentPath || archetype.developmentPath,
      roleSettings: {
        ...archetype.roleSettings,
        ...role.roleSettings
      }
    };
    
    // キャッシュに追加（一時的な結合結果）
    this.templateCache.set(combined.id, combined);
    
    return combined;
  }

  /**
   * すべてのテンプレートを取得
   * @returns テンプレートの配列
   */
  async getAllTemplates(): Promise<CharacterTemplate[]> {
    // キャッシュの更新確認
    await this.checkCacheRefresh();
    
    // すべてのキャッシュされたテンプレートを返す
    return Array.from(this.templateCache.values());
  }

  /**
   * アーキタイプテンプレートを取得
   * @returns アーキタイプテンプレートの配列
   */
  async getArchetypeTemplates(): Promise<CharacterTemplate[]> {
    return this.getTemplatesFromDirectory(this.TEMPLATE_DIRS.archetypes);
  }
  
  /**
   * ロールテンプレートを取得
   * @returns ロールテンプレートの配列
   */
  async getRoleTemplates(): Promise<CharacterTemplate[]> {
    return this.getTemplatesFromDirectory(this.TEMPLATE_DIRS.roles);
  }

  /**
   * キャッシュの更新が必要か確認し、必要に応じて更新する
   * @private
   */
  private async checkCacheRefresh(): Promise<void> {
    const now = Date.now();
    
    // キャッシュの有効期限が切れているか確認
    if (now - this.lastCacheUpdate > this.CACHE_TTL) {
      await this.updateTemplateCache();
    }
  }

  /**
   * テンプレートキャッシュを更新する
   * @private
   */
  private async updateTemplateCache(): Promise<void> {
    try {
      logger.debug('テンプレートキャッシュを更新します');
      
      // キャッシュに追加（アーキタイプとロール）
      const archetypes = await this.getTemplatesFromDirectory(this.TEMPLATE_DIRS.archetypes);
      const roles = await this.getTemplatesFromDirectory(this.TEMPLATE_DIRS.roles);
      
      // キャッシュを更新
      this.lastCacheUpdate = Date.now();
      
      logger.debug(`テンプレートキャッシュを更新しました (${this.templateCache.size}件)`);
    } catch (error) {
      logger.error('テンプレートキャッシュの更新に失敗しました', {
        error: error instanceof Error ? error.message : String(error)
      });
      // キャッシュ更新失敗時も続行（既存キャッシュを使用）
    }
  }

  /**
   * 指定ディレクトリからテンプレートを取得する
   * @private
   * @param directory ディレクトリパス
   * @returns テンプレートの配列
   */
  private async getTemplatesFromDirectory(directory: string): Promise<CharacterTemplate[]> {
    const templates: CharacterTemplate[] = [];
    
    try {
      const files = await storageProvider.listFiles(directory);
      
      for (const file of files) {
        if (file.endsWith('.yaml') || file.endsWith('.yml')) {
          try {
            const content = await storageProvider.readFile(`${directory}/${file}`);
            const template = parseYaml(content) as CharacterTemplate;
            
            if (template && template.id) {
              templates.push(template);
              // キャッシュに追加
              this.templateCache.set(template.id, template);
            }
          } catch (error) {
            logger.warn(`テンプレートファイル「${file}」の解析に失敗しました`, {
              error: error instanceof Error ? error.message : String(error)
            });
          }
        }
      }
    } catch (error) {
      logger.error(`ディレクトリ「${directory}」からのテンプレート取得に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
    
    return templates;
  }

  /**
   * ディレクトリ内で指定IDのテンプレートを探す
   * @private
   * @param directory ディレクトリパス
   * @param id テンプレートID
   * @returns テンプレートまたはnull
   */
  private async findTemplateInDirectory(directory: string, id: string): Promise<CharacterTemplate | null> {
    try {
      const files = await storageProvider.listFiles(directory);
      
      for (const file of files) {
        if (file.endsWith('.yaml') || file.endsWith('.yml')) {
          try {
            const content = await storageProvider.readFile(`${directory}/${file}`);
            const template = parseYaml(content) as CharacterTemplate;
            
            if (template && template.id === id) {
              return template;
            }
          } catch (error) {
            // 個別ファイルの読み込みエラーは無視
          }
        }
      }
    } catch (error) {
      logger.error(`ディレクトリ「${directory}」でのテンプレート検索に失敗しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
    
    return null;
  }

  /**
   * ディレクトリの存在を確認し、必要に応じて作成する
   * @private
   * @param directory ディレクトリパス
   */
  private async ensureDirectoryExists(directory: string): Promise<void> {
    try {
      const exists = await storageProvider.directoryExists(directory);
      if (!exists) {
        await storageProvider.createDirectory(directory);
        logger.info(`ディレクトリを作成しました: ${directory}`);
      }
    } catch (error) {
      logger.warn(`ディレクトリ「${directory}」の確認/作成中にエラーが発生しました`, {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 配列を安全に結合する
   * @private
   * @param arr1 配列1
   * @param arr2 配列2
   * @returns 結合された配列
   */
  private combineArrays<T>(arr1?: T[], arr2?: T[]): T[] {
    const result: T[] = [];
    
    if (arr1) {
      result.push(...arr1);
    }
    
    if (arr2) {
      result.push(...arr2);
    }
    
    // 重複を除去
    return [...new Set(result)];
  }

  /**
   * 文字列を安全に結合する
   * @private
   * @param str1 文字列1
   * @param str2 文字列2
   * @param separator 区切り文字
   * @returns 結合された文字列
   */
  private combineSafely(str1?: string, str2?: string, separator: string = ' '): string {
    if (str1 && str2) {
      return `${str1}${separator}${str2}`;
    } else if (str1) {
      return str1;
    } else if (str2) {
      return str2;
    } else {
      return '';
    }
  }
}