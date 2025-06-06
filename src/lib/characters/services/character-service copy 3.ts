/**
 * @fileoverview キャラクターサービス（静的ファイル読み込み対応・修正版）
 * @description
 * 静的YAMLファイルからキャラクター定義を読み込み、
 * キャッシュして提供するサービスクラス。
 * MemoryManager依存を削除し、基本的なキャラクター情報は
 * ファイルシステムから直接取得する設計に変更。
 */
import { ICharacterService } from '../core/interfaces';
import {
  Character,
  CharacterData,
  CharacterState,
  ChapterEvent,
  ValidationResult,
  CharacterAppearance,
  Interaction,
  CharacterHistory,
} from '../core/types';
import { eventBus } from '../events/character-event-bus';
import { EVENT_TYPES } from '../core/constants';
import { logger } from '@/lib/utils/logger';
import { generateId } from '@/lib/utils/helpers';
import { CharacterError, NotFoundError, ValidationError } from '../core/errors';
import { storageProvider } from '@/lib/storage';
import * as path from 'path';
import * as yaml from 'js-yaml';

/**
 * 静的ファイル読み込み対応キャラクターサービス
 * YAMLファイルからキャラクター定義を読み込み、内部キャッシュで管理
 */
export class CharacterService implements ICharacterService {
  // 内部キャッシュ
  private characterCache: Map<string, Character> = new Map();
  private typeIndex: Map<string, string[]> = new Map();
  private initialized = false;

  // キャラクターファイルのパス設定
  private readonly characterPaths = [
    'data/characters/main',
    'data/characters/sub', 
    'data/characters/background'
  ];

  /**
   * コンストラクタ（MemoryManager依存削除）
   * @param characterRepository キャラクターリポジトリ（オプション）
   */
  constructor(
    private characterRepository: any = null // MemoryManager依存を削除
  ) {
    // 初期化はlazyに実行
  }

  // ============================================================================
  // 🆕 静的ファイル読み込み機能
  // ============================================================================

  /**
   * キャラクターデータの初期化（遅延実行）
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await this.loadCharactersFromFiles();
      this.buildTypeIndex();
      this.initialized = true;
      logger.info(`CharacterService initialized with ${this.characterCache.size} characters`);
    } catch (error) {
      logger.error('Failed to initialize CharacterService', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      await this.createFallbackCharacters();
      this.buildTypeIndex();
      this.initialized = true;
    }
  }

  /**
   * YAMLファイルからキャラクターデータを読み込み
   */
  private async loadCharactersFromFiles(): Promise<void> {
    for (const dirPath of this.characterPaths) {
      try {
        // ディレクトリの存在確認
        const fullPath = path.resolve(dirPath);
        
        if (!(await storageProvider.directoryExists(fullPath))) {
          logger.warn(`Directory not found: ${fullPath}`);
          continue;
        }

        // ディレクトリ内のYAMLファイルを取得
        const files = await storageProvider.listFiles(fullPath);
        const yamlFiles = files.filter(file => 
          file.endsWith('.yaml') || file.endsWith('.yml')
        );

        logger.debug(`Loading ${yamlFiles.length} YAML files from ${dirPath}`);

        // 各YAMLファイルを読み込み
        for (const file of yamlFiles) {
          const filePath = path.join(fullPath, file);
          await this.loadCharacterFile(filePath);
        }

      } catch (error) {
        logger.warn(`Failed to load characters from ${dirPath}`, { 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }

    if (this.characterCache.size === 0) {
      logger.warn('No characters loaded from files, creating fallback');
      throw new Error('No character files found');
    }
  }

  /**
   * 単一のキャラクターファイルを読み込み
   */
  private async loadCharacterFile(filePath: string): Promise<void> {
    try {
      const fileContent = await storageProvider.readFile(filePath);
      const yamlData = yaml.load(fileContent) as any;

      if (!yamlData) {
        logger.warn(`Empty YAML file: ${filePath}`);
        return;
      }

      // 単一キャラクターまたは複数キャラクターに対応
      const characters = Array.isArray(yamlData) ? yamlData : [yamlData];

      for (const characterData of characters) {
        const character = this.normalizeCharacterData(characterData, filePath);
        if (character) {
          this.characterCache.set(character.id, character);
          logger.debug(`Loaded character: ${character.name} (${character.id})`);
        }
      }

    } catch (error) {
      logger.error(`Failed to load character file: ${filePath}`, { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * YAMLデータをCharacterオブジェクトに正規化
   */
  private normalizeCharacterData(data: any, filePath: string): Character | null {
    try {
      if (!data.name || !data.type) {
        logger.warn(`Invalid character data in ${filePath}: missing name or type`);
        return null;
      }

      // 基本情報の構築
      const character: Character = {
        id: data.id || generateId(),
        name: data.name,
        type: data.type,
        description: data.description || '',
        shortNames: data.shortNames || data.short_names || [],
        nicknames: data.nicknames || {},
        
        // 外見情報
        appearance: data.appearance || {},
        
        // 性格情報
        personality: {
          traits: data.personality?.traits || data.traits || [],
          values: data.personality?.values || data.values || [],
          flaws: data.personality?.flaws || data.flaws || []
        },
        
        // 目標
        goals: data.goals || [],
        
        // 関係性（基本定義のみ）
        relationships: data.relationships || [],
        
        // 状態（初期化）
        state: this.initializeCharacterState(data.state),
        
        // 履歴（初期化）
        history: this.initializeHistory(),
        
        // メタデータ
        metadata: {
          createdAt: new Date(),
          lastUpdated: new Date(),
          version: 1,
          tags: data.tags || [],
        }
      };

      return character;

    } catch (error) {
      logger.error(`Failed to normalize character data from ${filePath}`, { 
        error: error instanceof Error ? error.message : String(error),
        data: JSON.stringify(data, null, 2)
      });
      return null;
    }
  }

  /**
   * タイプ別インデックスの構築
   */
  private buildTypeIndex(): void {
    this.typeIndex.clear();
    
    for (const character of this.characterCache.values()) {
      const type = character.type;
      if (!this.typeIndex.has(type)) {
        this.typeIndex.set(type, []);
      }
      this.typeIndex.get(type)!.push(character.id);
    }

    logger.debug('Type index built', {
      types: Array.from(this.typeIndex.keys()),
      counts: Object.fromEntries(
        Array.from(this.typeIndex.entries()).map(([type, ids]) => [type, ids.length])
      )
    });
  }

  /**
   * フォールバックキャラクターの作成
   */
  private async createFallbackCharacters(): Promise<void> {
    const fallbackCharacters = [
      {
        id: 'fallback-main-001',
        name: '主人公',
        type: 'MAIN',
        description: 'システム生成されたフォールバック主人公キャラクター'
      },
      {
        id: 'fallback-sub-001', 
        name: 'サブキャラクター',
        type: 'SUB',
        description: 'システム生成されたフォールバックサブキャラクター'
      }
    ];

    for (const data of fallbackCharacters) {
      const character = this.normalizeCharacterData(data, 'system-fallback');
      if (character) {
        this.characterCache.set(character.id, character);
        logger.info(`Created fallback character: ${character.name}`);
      }
    }
  }

  // ============================================================================
  // 🔧 修正されたメインメソッド（キャッシュベース）
  // ============================================================================

  /**
   * 全アクティブキャラクター取得（キャッシュから取得）
   */
  async getAllActiveCharacters(): Promise<Character[]> {
    await this.ensureInitialized();

    const activeCharacters = Array.from(this.characterCache.values())
      .filter(character => character.state?.isActive !== false);

    logger.debug(`Retrieved ${activeCharacters.length} active characters from cache`);
    return activeCharacters;
  }

  /**
   * IDによるキャラクター取得（キャッシュから取得）
   * @param id キャラクターID
   * @returns キャラクターオブジェクトまたはnull
   */
  async getCharacter(id: string): Promise<Character | null> {
    await this.ensureInitialized();
    
    const character = this.characterCache.get(id);
    if (character) {
      logger.debug(`Retrieved character from cache: ${character.name} (${id})`);
    }
    
    return character || null;
  }

  /**
   * タイプ別キャラクター取得（キャッシュから取得）
   * @param type キャラクタータイプ
   * @returns キャラクター配列
   */
  async getCharactersByType(type: string): Promise<Character[]> {
    await this.ensureInitialized();
    
    const characterIds = this.typeIndex.get(type) || [];
    const characters = characterIds
      .map(id => this.characterCache.get(id))
      .filter(Boolean) as Character[];

    logger.debug(`Retrieved ${characters.length} characters of type ${type}`);
    return characters;
  }

  // ============================================================================
  // 既存メソッド（互換性維持）
  // ============================================================================

  /**
   * 新しいキャラクターを作成する
   * @param data キャラクターデータ
   * @returns 作成されたキャラクター
   */
  async createCharacter(data: CharacterData): Promise<Character> {
    await this.ensureInitialized();

    try {
      // データバリデーション
      this.validateNewCharacterData(data);

      // キャラクターオブジェクトの作成
      const character: Character = {
        id: generateId(),
        ...data,
        shortNames: data.shortNames || [],
        nicknames: data.nicknames || {},
        state: this.initializeCharacterState(data.state),
        history: this.initializeHistory(),
        metadata: {
          createdAt: new Date(),
          lastUpdated: new Date(),
          version: 1,
          tags: data.metadata?.tags || []
        },
      };

      // キャッシュに追加
      this.characterCache.set(character.id, character);
      this.buildTypeIndex(); // インデックス再構築

      // リポジトリに保存
      if (this.characterRepository) {
        await this.characterRepository.saveCharacter(character);
      }

      // キャラクター作成イベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_CREATED, {
        timestamp: new Date(),
        character
      });

      logger.info(`Character created: ${character.name} (${character.id})`);
      return character;
    } catch (error) {
      logger.error('Failed to create character', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * キャラクター状態の更新
   * @param id キャラクターID
   * @param state 新しい状態
   * @returns 更新されたキャラクター
   */
  async updateCharacterState(id: string, state: Partial<CharacterState>): Promise<Character> {
    await this.ensureInitialized();

    try {
      const existing = this.characterCache.get(id);
      if (!existing) {
        throw new NotFoundError('Character', id);
      }

      // 状態の更新
      const updatedCharacter = {
        ...existing,
        state: {
          ...existing.state,
          ...state
        },
        metadata: {
          ...existing.metadata,
          lastUpdated: new Date(),
          version: (existing.metadata.version || 1) + 1
        }
      };

      // キャッシュ更新
      this.characterCache.set(id, updatedCharacter);

      // リポジトリに保存
      if (this.characterRepository) {
        await this.characterRepository.saveCharacterState(id, updatedCharacter.state);
      }

      // 状態更新イベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_UPDATED, {
        timestamp: new Date(),
        characterId: id,
        changes: { state },
        previousState: existing.state
      });

      logger.info(`Character state updated: ${updatedCharacter.name} (${id})`);
      return updatedCharacter;
    } catch (error) {
      logger.error(`Failed to update character state: ${id}`, { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
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

    try {
      const existing = this.characterCache.get(id);
      if (!existing) {
        throw new NotFoundError('Character', id);
      }

      // 更新データのバリデーション
      this.validateCharacterUpdates(updates, existing);

      // キャラクターの更新
      const updatedCharacter = this.mergeCharacterUpdates(existing, updates);

      // キャッシュ更新
      this.characterCache.set(id, updatedCharacter);
      this.buildTypeIndex(); // タイプが変更された可能性があるため再構築

      // リポジトリに保存
      if (this.characterRepository) {
        await this.characterRepository.updateCharacter(id, updates);
      }

      // 更新イベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_UPDATED, {
        timestamp: new Date(),
        characterId: id,
        changes: updates,
        previousState: existing
      });

      logger.info(`Character updated: ${updatedCharacter.name} (${id})`);
      return updatedCharacter;
    } catch (error) {
      logger.error(`Failed to update character: ${id}`, { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * キャラクターの登場記録
   * @param id キャラクターID
   * @param chapterNumber 章番号
   * @param summary 概要
   * @returns 更新されたキャラクター
   */
  async recordAppearance(id: string, chapterNumber: number, summary: string): Promise<Character> {
    await this.ensureInitialized();

    try {
      const character = this.characterCache.get(id);
      if (!character) {
        throw new NotFoundError('Character', id);
      }

      // 登場記録の作成
      const appearance: CharacterAppearance = {
        chapterNumber,
        timestamp: new Date(),
        significance: 0.5,
        summary
      };

      // 履歴の更新
      const updatedHistory = {
        ...character.history,
        appearances: [...character.history.appearances, appearance]
      };

      // キャラクター状態の更新
      const updatedCharacter = {
        ...character,
        state: {
          ...character.state,
          lastAppearance: chapterNumber
        },
        history: updatedHistory,
        metadata: {
          ...character.metadata,
          lastUpdated: new Date(),
          version: (character.metadata.version || 1) + 1
        }
      };

      // キャッシュ更新
      this.characterCache.set(id, updatedCharacter);

      // リポジトリに保存
      if (this.characterRepository) {
        await this.characterRepository.updateCharacterProperty(id, 'history', updatedHistory);
        await this.characterRepository.saveCharacterState(id, updatedCharacter.state);
      }

      // 登場イベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_APPEARANCE, {
        timestamp: new Date(),
        characterId: id,
        chapterNumber,
        summary
      });

      logger.info(`Character appearance recorded: ${character.name} (${id}), 章番号: ${chapterNumber}`);
      return updatedCharacter;
    } catch (error) {
      logger.error(`Failed to record character appearance: ${id}`, { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * インタラクション記録
   * @param id キャラクターID
   * @param targetId 対象キャラクターID
   * @param type インタラクションタイプ
   * @param data 追加データ
   */
  async recordInteraction(id: string, targetId: string, type: string, data: any): Promise<void> {
    await this.ensureInitialized();

    try {
      const character = this.characterCache.get(id);
      if (!character) {
        throw new NotFoundError('Character', id);
      }

      const targetCharacter = this.characterCache.get(targetId);
      if (!targetCharacter) {
        throw new NotFoundError('Character', targetId);
      }

      // インタラクション記録の作成
      const interaction: Interaction = {
        chapterNumber: data.chapterNumber || 0,
        targetCharacterId: targetId,
        type,
        description: data.description || `${type}インタラクション`,
        impact: data.impact || 0.5,
        timestamp: new Date()
      };

      // 履歴の更新
      const updatedHistory = {
        ...character.history,
        interactions: [...character.history.interactions, interaction]
      };

      const updatedCharacter = {
        ...character,
        history: updatedHistory,
        metadata: {
          ...character.metadata,
          lastUpdated: new Date(),
          version: (character.metadata.version || 1) + 1
        }
      };

      // キャッシュ更新
      this.characterCache.set(id, updatedCharacter);

      // リポジトリに保存
      if (this.characterRepository) {
        await this.characterRepository.updateCharacterProperty(id, 'history', updatedHistory);
      }

      // インタラクションイベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_INTERACTION, {
        timestamp: new Date(),
        sourceCharacterId: id,
        targetCharacterId: targetId,
        interactionType: type,
        data
      });

      logger.info(`Interaction recorded: ${character.name} -> ${targetCharacter.name}, タイプ: ${type}`);
    } catch (error) {
      logger.error(`Failed to record interaction: ${id} -> ${targetId}`, { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * キャラクター発展処理
   * @param id キャラクターID
   * @param events 章イベント配列
   * @returns 更新されたキャラクター
   */
  async processCharacterDevelopment(id: string, events: ChapterEvent[]): Promise<Character> {
    await this.ensureInitialized();

    try {
      const character = this.characterCache.get(id);
      if (!character) {
        throw new NotFoundError('Character', id);
      }

      // 簡易発展処理
      const developmentStageIncrease = events.length * 0.1;
      const updatedState: CharacterState = {
        ...character.state,
        developmentStage: (character.state.developmentStage || 0) + developmentStageIncrease,
        development: `Development processed at ${new Date().toISOString()}`
      };

      const updatedCharacter = {
        ...character,
        state: updatedState,
        metadata: {
          ...character.metadata,
          lastUpdated: new Date(),
          version: (character.metadata.version || 1) + 1
        }
      };

      // キャッシュ更新
      this.characterCache.set(id, updatedCharacter);

      // 発展処理イベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_DEVELOPMENT_REQUESTED, {
        timestamp: new Date(),
        characterId: id,
        events,
        character: updatedCharacter,
        memorySystemProcessed: false
      });

      logger.info(`Character development processed: ${character.name} (${id})`);
      return updatedCharacter;
    } catch (error) {
      logger.error(`Failed to process character development: ${id}`, { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  /**
   * キャラクター設定の検証
   * @param character キャラクター
   * @returns 検証結果
   */
  async validateCharacter(character: Character): Promise<ValidationResult> {
    try {
      // 基本的な構造チェック
      const structureValid = this.validateCharacterStructure(character);
      if (!structureValid.isValid) {
        return structureValid;
      }

      // 一貫性チェックイベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_VALIDATION_REQUESTED, {
        timestamp: new Date(),
        character,
        qualityScore: 0.8
      });

      return {
        isValid: true,
        confidenceScore: 0.8,
        reason: "キャラクター構造検証に合格しました"
      };
    } catch (error) {
      logger.error(`キャラクター検証中にエラーが発生しました: ${character.id}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      
      return {
        isValid: false,
        confidenceScore: 0,
        reason: `検証中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // ============================================================================
  // プライベートヘルパーメソッド
  // ============================================================================

  /**
   * キャラクター状態の初期化
   */
  private initializeCharacterState(data?: Partial<CharacterState>): CharacterState {
    return {
      isActive: data?.isActive !== undefined ? data.isActive : true,
      emotionalState: data?.emotionalState || 'NEUTRAL',
      developmentStage: data?.developmentStage || 0,
      lastAppearance: data?.lastAppearance || null,
      development: data?.development || '',
      relationships: data?.relationships || []
    };
  }

  /**
   * キャラクター履歴の初期化
   */
  private initializeHistory(): CharacterHistory {
    return {
      appearances: [],
      developmentPath: [],
      interactions: [],
    };
  }

  /**
   * 新規キャラクターデータのバリデーション
   */
  private validateNewCharacterData(data: CharacterData): void {
    const errors: Record<string, string[]> = {};

    if (!data.name) {
      if (!errors.name) errors.name = [];
      errors.name.push('キャラクター名は必須です');
    }

    if (!data.type) {
      if (!errors.type) errors.type = [];
      errors.type.push('キャラクタータイプは必須です');
    }

    if (!data.description) {
      if (!errors.description) errors.description = [];
      errors.description.push('キャラクター説明は必須です');
    }

    if (data.type && !['MAIN', 'SUB', 'MOB'].includes(data.type)) {
      if (!errors.type) errors.type = [];
      errors.type.push(`無効なキャラクタータイプです: ${data.type}`);
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('キャラクターデータが無効です', errors);
    }
  }

  /**
   * キャラクター更新データのバリデーション
   */
  private validateCharacterUpdates(updates: Partial<CharacterData>, existing: Character): void {
    const errors: Record<string, string[]> = {};

    if (updates.type && updates.type !== existing.type) {
      if (!errors.type) errors.type = [];
      errors.type.push('キャラクタータイプは直接更新できません。昇格APIを使用してください');
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('キャラクター更新データが無効です', errors);
    }
  }

  /**
   * キャラクター構造の基本検証
   */
  private validateCharacterStructure(character: Character): ValidationResult {
    if (!character.id || !character.name || !character.type || !character.description) {
      return {
        isValid: false,
        confidenceScore: 0,
        reason: "必須フィールドが不足しています (id, name, type, description)"
      };
    }

    if (!['MAIN', 'SUB', 'MOB'].includes(character.type)) {
      return {
        isValid: false,
        confidenceScore: 0,
        reason: `無効なキャラクタータイプです: ${character.type}`
      };
    }

    return {
      isValid: true,
      confidenceScore: 1,
      reason: "キャラクター構造は有効です"
    };
  }

  /**
   * 型安全なキャラクター更新マージ
   */
  private mergeCharacterUpdates(existing: Character, updates: Partial<CharacterData>): Character {
    const updatedState: CharacterState = {
      ...existing.state,
      isActive: updates.state?.isActive !== undefined ? updates.state.isActive : existing.state.isActive,
      emotionalState: updates.state?.emotionalState !== undefined ? updates.state.emotionalState : existing.state.emotionalState,
      developmentStage: updates.state?.developmentStage !== undefined ? updates.state.developmentStage : existing.state.developmentStage,
      lastAppearance: updates.state?.lastAppearance !== undefined ? updates.state.lastAppearance : existing.state.lastAppearance,
      development: updates.state?.development !== undefined ? updates.state.development : existing.state.development,
      relationships: updates.state?.relationships !== undefined ? updates.state.relationships : existing.state.relationships
    };

    const updatedMetadata = {
      ...existing.metadata,
      lastUpdated: new Date(),
      version: (existing.metadata.version || 1) + 1,
      tags: updates.metadata?.tags !== undefined ? updates.metadata.tags : existing.metadata.tags
    };

    return {
      ...existing,
      ...updates,
      state: updatedState,
      metadata: updatedMetadata,
      id: existing.id,
      shortNames: updates.shortNames !== undefined ? updates.shortNames : existing.shortNames,
      nicknames: updates.nicknames !== undefined ? updates.nicknames : existing.nicknames,
      history: existing.history
    };
  }
}

// ファクトリ関数（MemoryManager依存削除）
export function createCharacterService(characterRepository?: any): CharacterService {
  return new CharacterService(characterRepository);
}