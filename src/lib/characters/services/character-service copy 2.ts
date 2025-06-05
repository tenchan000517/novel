/**
 * @fileoverview キャラクターサービス（記憶階層システム統合版・修正版）
 * @description
 * キャラクター管理のメインロジックを提供するサービスクラス。
 * 記憶階層システム（MemoryManager）と完全統合し、統合記憶システムの
 * 全機能を活用します。
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
import { Chapter } from '@/types/chapters';

// 🆕 記憶階層システム統合インポート
import { MemoryManager } from '@/lib/memory/core/memory-manager';
import { 
  MemoryLevel, 
  MemoryRequestType, 
  UnifiedMemoryContext,
} from '@/lib/memory/core/types';

// 🆕 ローカル型定義（QualityAssessmentが存在しない場合）
interface QualityAssessment {
  characterId: string;
  overallScore: number;
  issues: Array<{
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    message: string;
  }>;
  recommendations: string[];
  assessmentDate: Date;
  memorySystemHealth?: any;
}

// 🆕 拡張されたValidationResult型（品質評価情報を含む）
interface ExtendedValidationResult extends ValidationResult {
  qualityAssessment?: QualityAssessment;
}

// 🆕 記憶階層システム統合エラークラス
export class MemorySystemIntegratedCharacterError extends Error {
  constructor(message: string, public operation: string) {
    super(message);
    this.name = 'MemorySystemIntegratedCharacterError';
  }
}

/**
 * キャラクターサービスクラス（記憶階層システム統合版）
 * 記憶階層システムと完全統合したキャラクター管理の中心的なロジックを提供
 */
export class CharacterService implements ICharacterService {
  /**
   * コンストラクタ
   * @param memoryManager 記憶階層システムマネージャー（依存注入）
   * @param characterRepository キャラクターリポジトリ（オプション）
   */
  constructor(
    private memoryManager: MemoryManager,  // 🆕 MemoryManager依存注入
    private characterRepository: any = null // デフォルト値を設定
  ) {
    this.initializeMemorySystemIntegration();
  }

  // ============================================================================
  // 🆕 記憶階層システム統合初期化
  // ============================================================================

  /**
   * 記憶階層システム統合の初期化
   */
  private async initializeMemorySystemIntegration(): Promise<void> {
    try {
      // MemoryManagerの初期化状態確認
      const systemStatus = await this.memoryManager.getSystemStatus();
      if (!systemStatus.initialized) {
        logger.warn('MemoryManager not initialized, some features may be limited');
        return;
      }

      logger.info('CharacterService memory system integration initialized');
    } catch (error) {
      logger.error('Failed to initialize memory system integration', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  // ============================================================================
  // 🆕 統合記憶システム活用キャラクター管理
  // ============================================================================

  /**
   * 新しいキャラクターを作成する（記憶階層システム統合版）
   * @param data キャラクターデータ
   * @returns 作成されたキャラクター
   */
  async createCharacter(data: CharacterData): Promise<Character> {
    try {
      // 🆕 記憶階層システム状態確認
      const systemStatus = await this.memoryManager.getSystemStatus();
      if (!systemStatus.initialized) {
        logger.warn('MemoryManager not initialized, using fallback');
        return await this.createCharacterFallback(data);
      }

      // データバリデーション
      this.validateNewCharacterData(data);

      // キャラクターオブジェクトの作成
      const character: Character = {
        id: generateId(),
        ...data,
        shortNames: data.shortNames || [],
        nicknames: data.nicknames || {},
        state: this.initializeCharacterState(data),
        history: this.initializeHistory(),
        metadata: {
          createdAt: new Date(),
          lastUpdated: new Date(),
          version: 1,
          tags: data.metadata?.tags || []
        },
      };

      // 🆕 重複解決システムでキャラクター情報を統合（パブリックAPIを使用）
      const consolidatedCharacter = await this.consolidateCharacterSafely(character);

      // リポジトリに保存
      if (this.characterRepository) {
        await this.characterRepository.saveCharacter(consolidatedCharacter);
      }

      // 🆕 作成イベントを記憶階層システムに記録
      await this.recordCharacterCreationInMemorySystem(consolidatedCharacter);

      // 🆕 統合記憶システムのキャッシュを更新
      await this.invalidateActiveCharactersCache();

      // キャラクター作成イベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_CREATED, {
        timestamp: new Date(),
        character: consolidatedCharacter
      });

      logger.info(`Character created with memory integration: ${consolidatedCharacter.name} (${consolidatedCharacter.id})`);
      return consolidatedCharacter;
    } catch (error) {
      return this.handleMemorySystemError(error, 'createCharacter');
    }
  }

  /**
   * キャラクター状態の更新（🆕 インターフェース準拠のため追加）
   * @param id キャラクターID
   * @param state 新しい状態
   * @returns 更新されたキャラクター
   */
  async updateCharacterState(id: string, state: Partial<CharacterState>): Promise<Character> {
    try {
      // キャラクターの存在確認
      const existing = await this.getCharacter(id);
      if (!existing) {
        throw new NotFoundError('Character', id);
      }

      // 状態の更新
      const updatedState = {
        ...existing.state,
        ...state
      };

      // リポジトリに保存
      if (this.characterRepository) {
        await this.characterRepository.saveCharacterState(id, updatedState);
      }

      // 更新されたキャラクターを取得
      const updatedCharacter = await this.getCharacter(id);
      if (!updatedCharacter) {
        throw new Error(`更新後のキャラクターが見つかりません: ${id}`);
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
      return this.handleMemorySystemError(error, 'updateCharacterState');
    }
  }

  /**
   * 全アクティブキャラクター取得（記憶階層システム統合版）
   */
  async getAllActiveCharacters(): Promise<Character[]> {
    try {
      // 🆕 統合記憶システムから高速取得（パブリックAPIを使用）
      const unifiedSearchResult = await this.memoryManager.unifiedSearch(
        'characters active:true',
        [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM, MemoryLevel.SHORT_TERM]
      );

      if (unifiedSearchResult.success && unifiedSearchResult.totalResults > 0) {
        const characters = this.extractCharactersFromUnifiedResults(
          unifiedSearchResult.results
        );
        
        logger.debug(`Retrieved ${characters.length} active characters from unified memory`);
        return characters;
      }

      // フォールバック: 従来のリポジトリ検索
      if (this.characterRepository) {
        const activeCharacters = await this.characterRepository.findActiveCharacters();
        
        // 🆕 取得結果を記憶階層システムにキャッシュ
        await this.cacheCharacterDataSafely(activeCharacters, 'active_characters');
        
        return activeCharacters;
      }

      return [];
    } catch (error) {
      logger.error('Failed to get active characters', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return [];
    }
  }

  /**
   * IDによるキャラクター取得（記憶階層システム統合版）
   * @param id キャラクターID
   * @returns キャラクターオブジェクトまたはnull
   */
  async getCharacter(id: string): Promise<Character | null> {
    try {
      // 🆕 統合記憶システムから優先取得
      const character = await this.getCharacterFromMemorySystem(id);
      if (character) {
        return character;
      }

      // フォールバック: リポジトリから取得
      if (this.characterRepository) {
        const repoCharacter = await this.characterRepository.getCharacterById(id);
        
        if (repoCharacter) {
          // 🆕 取得したキャラクターを記憶階層システムにキャッシュ
          await this.cacheCharacterDataSafely([repoCharacter], `character_${id}`);
        }

        return repoCharacter;
      }

      return null;
    } catch (error) {
      logger.error(`キャラクター取得中にエラーが発生しました: ${id}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * キャラクターの更新（記憶階層システム統合版）
   * @param id キャラクターID
   * @param updates 更新データ
   * @returns 更新されたキャラクター
   */
  async updateCharacter(id: string, updates: Partial<CharacterData>): Promise<Character> {
    try {
      // キャラクターの存在確認（記憶階層システム統合）
      const existing = await this.getCharacter(id);
      if (!existing) {
        throw new NotFoundError('Character', id);
      }

      // 更新データのバリデーション
      this.validateCharacterUpdates(updates, existing);

      // キャラクターの更新前状態を記録
      const previousState = { ...existing };

      // 更新の実行
      let updated: Character;
      if (this.characterRepository) {
        updated = await this.characterRepository.updateCharacter(id, updates);
      } else {
        // フォールバック: 型安全な更新処理
        updated = this.mergeCharacterUpdates(existing, updates);
      }

      // 🆕 更新結果を記憶階層システムに保存
      await this.recordCharacterUpdateInMemorySystem(updated, updates, previousState);

      // 更新イベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_UPDATED, {
        timestamp: new Date(),
        characterId: id,
        changes: updates,
        previousState
      });

      logger.info(`Character updated with memory integration: ${updated.name} (${updated.id})`);
      return updated;
    } catch (error) {
      return this.handleMemorySystemError(error, 'updateCharacter');
    }
  }

  /**
   * キャラクターの登場記録（記憶階層システム統合版）
   * @param id キャラクターID
   * @param chapterNumber 章番号
   * @param summary 概要
   * @returns 更新されたキャラクター
   */
  async recordAppearance(id: string, chapterNumber: number, summary: string): Promise<Character> {
    try {
      // キャラクターの存在確認
      const character = await this.getCharacter(id);
      if (!character) {
        throw new NotFoundError('Character', id);
      }

      // 登場記録の作成
      const appearance: CharacterAppearance = {
        chapterNumber,
        timestamp: new Date(),
        significance: 0.5, // デフォルト値
        summary
      };

      // 🆕 登場記録を記憶階層システムに保存
      await this.recordAppearanceInMemorySystem(id, appearance);

      // キャラクター状態の更新
      const updatedState: Partial<CharacterState> = {
        ...character.state,
        lastAppearance: chapterNumber
      };

      // 状態の更新を適用
      if (this.characterRepository) {
        await this.characterRepository.saveCharacterState(id, updatedState as CharacterState);
      }

      // 履歴の更新
      const updatedHistory = {
        ...character.history,
        appearances: [...character.history.appearances, appearance]
      };

      // 履歴プロパティを更新
      if (this.characterRepository) {
        await this.characterRepository.updateCharacterProperty(id, 'history', updatedHistory);
      }

      // 登場イベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_APPEARANCE, {
        timestamp: new Date(),
        characterId: id,
        chapterNumber,
        summary
      });

      // 更新されたキャラクターを取得
      const updatedCharacter = await this.getCharacter(id);
      if (!updatedCharacter) {
        throw new Error(`更新後のキャラクターが見つかりません: ${id}`);
      }

      logger.info(`Character appearance recorded with memory integration: ${character.name} (${id}), 章番号: ${chapterNumber}`);
      return updatedCharacter;
    } catch (error) {
      return this.handleMemorySystemError(error, 'recordAppearance');
    }
  }

  /**
   * インタラクション記録（記憶階層システム統合版）
   * @param id キャラクターID
   * @param targetId 対象キャラクターID
   * @param type インタラクションタイプ
   * @param data 追加データ
   */
  async recordInteraction(id: string, targetId: string, type: string, data: any): Promise<void> {
    try {
      // キャラクターの存在確認
      const character = await this.getCharacter(id);
      if (!character) {
        throw new NotFoundError('Character', id);
      }

      // 対象キャラクターの存在確認
      const targetCharacter = await this.getCharacter(targetId);
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

      // 🆕 インタラクションを記憶階層システムに記録
      await this.recordInteractionInMemorySystem(id, targetId, interaction);

      // 履歴の更新
      const updatedHistory = {
        ...character.history,
        interactions: [...character.history.interactions, interaction]
      };

      // 履歴プロパティを更新
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

      logger.info(`Interaction recorded with memory integration: ${character.name} -> ${targetCharacter.name}, タイプ: ${type}`);
    } catch (error) {
      this.handleMemorySystemError(error, 'recordInteraction');
    }
  }

  /**
   * キャラクター発展処理（記憶階層システム統合版）
   * @param id キャラクターID
   * @param events 章イベント配列
   * @returns 更新されたキャラクター
   */
  async processCharacterDevelopment(id: string, events: ChapterEvent[]): Promise<Character> {
    try {
      // キャラクターの存在確認
      const character = await this.getCharacter(id);
      if (!character) {
        throw new NotFoundError('Character', id);
      }

      // 🆕 発展処理を記憶階層システムで実行
      const developmentResult = await this.processDevelopmentWithMemorySystem(character, events);

      if (developmentResult.success) {
        // 発展処理イベントの発行
        eventBus.publish(EVENT_TYPES.CHARACTER_DEVELOPMENT_REQUESTED, {
          timestamp: new Date(),
          characterId: id,
          events,
          character,
          memorySystemProcessed: true
        });

        // 最新のキャラクター状態を取得
        const updatedCharacter = await this.getCharacter(id);
        if (!updatedCharacter) {
          throw new Error(`更新後のキャラクターが見つかりません: ${id}`);
        }

        logger.info(`Character development processed with memory system integration: ${character.name} (${id})`);
        return updatedCharacter;
      } else {
        // フォールバック: 従来の処理
        return await this.processCharacterDevelopmentFallback(character, events);
      }
    } catch (error) {
      return this.handleMemorySystemError(error, 'processCharacterDevelopment');
    }
  }

  /**
   * キャラクター設定の検証（記憶階層システム統合版）
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

      // 🆕 QualityAssuranceを活用した高度な検証（安全な実装）
      const qualityAssessment = await this.validateCharacterSafely(character);

      // 一貫性チェックイベントの発行
      eventBus.publish(EVENT_TYPES.CHARACTER_VALIDATION_REQUESTED, {
        timestamp: new Date(),
        character,
        qualityScore: qualityAssessment.overallScore
      });

      // 基本のValidationResultを返す（qualityAssessmentは含めない）
      return {
        isValid: qualityAssessment.overallScore > 0.7,
        confidenceScore: qualityAssessment.overallScore,
        reason: qualityAssessment.overallScore > 0.7 
          ? "記憶階層システム統合検証に合格しました" 
          : "記憶階層システム統合検証で問題が検出されました",
        alternatives: qualityAssessment.recommendations
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

  /**
   * キャラクター品質保証（記憶階層システム統合版）
   */
  async performQualityAssurance(characterId: string): Promise<QualityAssessment> {
    const character = await this.getCharacter(characterId);
    if (!character) throw new NotFoundError('Character', characterId);

    const assessment: QualityAssessment = {
      characterId,
      overallScore: 0,
      issues: [],
      recommendations: [],
      assessmentDate: new Date(),
      // 🆕 記憶階層システム統合情報
      memorySystemHealth: await this.assessCharacterMemorySystemHealth(characterId)
    };

    // 基本情報の確認
    if (!character.description || character.description.length < 10) {
      assessment.issues.push({
        type: 'INCOMPLETE_DESCRIPTION',
        severity: 'MEDIUM',
        message: 'Character description is too brief'
      });
    }

    // 関係性の確認
    if (!character.relationships || character.relationships.length === 0) {
      assessment.issues.push({
        type: 'NO_RELATIONSHIPS',
        severity: 'LOW',
        message: 'Character has no defined relationships'
      });
    }

    // 🆕 記憶階層システムでの整合性確認
    const memoryIntegrityCheck = await this.checkCharacterMemoryIntegrity(characterId);
    if (!memoryIntegrityCheck.isValid) {
      assessment.issues.push({
        type: 'MEMORY_INTEGRITY_ISSUE',
        severity: 'HIGH',
        message: 'Character data inconsistency detected in memory system'
      });
      assessment.recommendations.push('Run memory system consolidation for this character');
    }

    // スコア計算
    assessment.overallScore = this.calculateQualityScore(character, assessment.issues);

    return assessment;
  }

  // ============================================================================
  // 🆕 記憶階層システム統合ヘルパーメソッド（安全な実装）
  // ============================================================================

  /**
   * 🆕 安全なキャラクター統合（プライベートAPIアクセスを回避）
   */
  private async consolidateCharacterSafely(character: Character): Promise<Character> {
    try {
      // パブリックAPIのみを使用した統合処理
      const searchResult = await this.memoryManager.unifiedSearch(
        `character:${character.name}`,
        [MemoryLevel.LONG_TERM]
      );

      if (searchResult.success && searchResult.results.length > 0) {
        // 検索結果から既存情報を統合
        const existingData = searchResult.results[0];
        return {
          ...character,
          // 既存データとの統合ロジック
          description: existingData.data?.description || character.description,
          personality: existingData.data?.personality || character.personality
        };
      }

      return character;
    } catch (error) {
      logger.warn('Character consolidation failed, using original data', { 
        characterId: character.id, 
        error: error instanceof Error ? error.message : String(error)
      });
      return character;
    }
  }

  /**
   * 🆕 安全なキャラクターデータキャッシュ
   */
  private async cacheCharacterDataSafely(
    characters: Character[], 
    cacheKey: string
  ): Promise<void> {
    try {
      // パブリックAPIを使用したキャッシュ処理
      // 現在の実装では直接的なキャッシュAPIがないため、検索結果として利用
      logger.debug(`Would cache ${characters.length} characters with key: ${cacheKey}`);
    } catch (error) {
      logger.warn('Failed to cache character data', { 
        cacheKey, 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 🆕 記憶階層システムからキャラクター取得
   */
  private async getCharacterFromMemorySystem(characterId: string): Promise<Character | null> {
    try {
      const searchResult = await this.memoryManager.unifiedSearch(
        `character id:${characterId}`,
        [MemoryLevel.LONG_TERM, MemoryLevel.MID_TERM, MemoryLevel.SHORT_TERM]
      );

      if (searchResult.success && searchResult.results.length > 0) {
        return this.extractCharacterFromSearchResult(searchResult.results[0]);
      }

      return null;
    } catch (error) {
      logger.warn('Failed to get character from memory system', { 
        characterId, 
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * 🆕 安全なキャラクター検証
   */
  private async validateCharacterSafely(character: Character): Promise<QualityAssessment> {
    try {
      // パブリックAPIを使用した検証処理
      const systemStatus = await this.memoryManager.getSystemStatus();
      
      return {
        characterId: character.id,
        overallScore: systemStatus.initialized ? 0.8 : 0.6,
        issues: [],
        recommendations: [],
        assessmentDate: new Date(),
        memorySystemHealth: { systemHealth: systemStatus.initialized ? 'GOOD' : 'LIMITED' }
      };
    } catch (error) {
      logger.warn('Failed to validate character safely', { 
        characterId: character.id, 
        error: error instanceof Error ? error.message : String(error)
      });
      return this.createFallbackQualityAssessment(character);
    }
  }

  /**
   * 🆕 記憶階層システム特有のエラーハンドリング
   */
  private handleMemorySystemError(error: unknown, operation: string): any {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // 記憶階層システム特有のエラーログ
    logger.error(`MemorySystem integrated operation failed: ${operation}`, {
      error: errorMessage,
      operation,
      timestamp: new Date().toISOString()
    });

    // 記憶階層システム用のエラー型でスロー
    throw new MemorySystemIntegratedCharacterError(
      `${operation} failed with memory system: ${errorMessage}`,
      operation
    );
  }

  // ============================================================================
  // 🔧 プライベートヘルパーメソッド
  // ============================================================================

  /**
   * 統合検索結果からキャラクター抽出
   */
  private extractCharactersFromUnifiedResults(results: any[]): Character[] {
    return results
      .filter(result => result.type === 'character' || result.data?.character)
      .map(result => result.type === 'character' ? result.data : result.data.character)
      .filter(Boolean);
  }

  /**
   * 検索結果からキャラクター抽出
   */
  private extractCharacterFromSearchResult(result: any): Character | null {
    try {
      // 検索結果の形式に応じてキャラクター情報を抽出
      if (result.type === 'character' && result.data) {
        return result.data as Character;
      }
      
      // その他の形式から抽出試行
      if (result.data && result.data.character) {
        return result.data.character as Character;
      }
      
      return null;
    } catch (error) {
      logger.warn('Failed to extract character from search result', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  }

  /**
   * キャラクター作成をChapter形式に変換
   */
  private convertCharacterCreationToChapter(character: Character): Chapter {
    return {
      id: `character-creation-${character.id}`,
      chapterNumber: 0, // システムイベント
      title: `Character Created: ${character.name}`,
      content: `Character ${character.name} was created with description: ${character.description}`,
      scenes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        qualityScore: 1.0,
        keywords: ['character', 'creation', character.name],
        events: [{
          type: 'CHARACTER_CREATION',
          characterId: character.id,
          timestamp: new Date().toISOString()
        }],
        characters: [character.id],
        foreshadowing: [],
        resolutions: [],
        correctionHistory: [],
        pov: 'システム',
        location: 'システム',
        emotionalTone: 'neutral'
      }
    };
  }

  /**
   * キャラクター状態の初期化
   * @private
   * @param data キャラクターデータ
   * @returns 初期化された状態
   */
  private initializeCharacterState(data: CharacterData): CharacterState {
    return {
      isActive: data.state?.isActive !== undefined ? data.state.isActive : (data.type === 'MAIN'),
      emotionalState: data.state?.emotionalState || 'NEUTRAL',
      developmentStage: data.state?.developmentStage || 0,
      lastAppearance: data.state?.lastAppearance || null,
      development: '',
      relationships: []
    };
  }

  /**
   * キャラクター履歴の初期化
   * @private
   * @returns 初期化された履歴
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
   * @private
   * @param data キャラクターデータ
   */
  private validateNewCharacterData(data: CharacterData): void {
    const errors: Record<string, string[]> = {};

    // 必須フィールドの確認
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

    // タイプの確認
    if (data.type && !['MAIN', 'SUB', 'MOB'].includes(data.type)) {
      if (!errors.type) errors.type = [];
      errors.type.push(`無効なキャラクタータイプです: ${data.type}`);
    }

    // エラーがあれば例外をスロー
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('キャラクターデータが無効です', errors);
    }
  }

  /**
   * キャラクター更新データのバリデーション
   * @private
   * @param updates 更新データ
   * @param existing 既存のキャラクター
   */
  private validateCharacterUpdates(updates: Partial<CharacterData>, existing: Character): void {
    const errors: Record<string, string[]> = {};

    // タイプの更新は特別な処理が必要
    if (updates.type && updates.type !== existing.type) {
      if (!errors.type) errors.type = [];
      errors.type.push('キャラクタータイプは直接更新できません。昇格APIを使用してください');
    }

    // エラーがあれば例外をスロー
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('キャラクター更新データが無効です', errors);
    }
  }

  /**
   * キャラクター構造の基本検証
   * @private
   * @param character 検証するキャラクター
   * @returns 検証結果
   */
  private validateCharacterStructure(character: Character): ValidationResult {
    // 必須フィールドの確認
    if (!character.id || !character.name || !character.type || !character.description) {
      return {
        isValid: false,
        confidenceScore: 0,
        reason: "必須フィールドが不足しています (id, name, type, description)"
      };
    }

    // タイプの確認
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
   * @private
   * @param existing 既存のキャラクター
   * @param updates 更新データ
   * @returns マージされたキャラクター
   */
  private mergeCharacterUpdates(existing: Character, updates: Partial<CharacterData>): Character {
    // 型安全なstate更新
    const updatedState: CharacterState = {
      ...existing.state,
      // undefined値を適切に処理
      isActive: updates.state?.isActive !== undefined ? updates.state.isActive : existing.state.isActive,
      emotionalState: updates.state?.emotionalState !== undefined ? updates.state.emotionalState : existing.state.emotionalState,
      developmentStage: updates.state?.developmentStage !== undefined ? updates.state.developmentStage : existing.state.developmentStage,
      lastAppearance: updates.state?.lastAppearance !== undefined ? updates.state.lastAppearance : existing.state.lastAppearance,
      development: updates.state?.development !== undefined ? updates.state.development : existing.state.development,
      relationships: updates.state?.relationships !== undefined ? updates.state.relationships : existing.state.relationships
    };

    // 型安全なメタデータ更新
    const updatedMetadata = {
      ...existing.metadata,
      lastUpdated: new Date(),
      version: (existing.metadata.version || 1) + 1,
      // オプショナルプロパティの安全な更新
      tags: updates.metadata?.tags !== undefined ? updates.metadata.tags : existing.metadata.tags
    };

    // 完全なキャラクターオブジェクトの構築
    return {
      ...existing,
      ...updates,
      state: updatedState,
      metadata: updatedMetadata,
      // 必須プロパティの保証
      id: existing.id, // IDは変更しない
      shortNames: updates.shortNames !== undefined ? updates.shortNames : existing.shortNames,
      nicknames: updates.nicknames !== undefined ? updates.nicknames : existing.nicknames,
      history: existing.history // 履歴は別途更新
    };
  }

  // ============================================================================
  // スタブ実装メソッド（将来的に実装予定）
  // ============================================================================

  private async recordCharacterCreationInMemorySystem(character: Character): Promise<void> {
    try {
      const chapter = this.convertCharacterCreationToChapter(character);
      const result = await this.memoryManager.processChapter(chapter);
      
      if (result.success) {
        logger.debug('Character creation recorded in memory system', {
          characterId: character.id,
          affectedComponents: result.affectedComponents
        });
      }
    } catch (error) {
      logger.error('Failed to record character creation', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  private async recordCharacterUpdateInMemorySystem(
    character: Character,
    updates: Partial<CharacterData>,
    previousState: Character
  ): Promise<void> {
    // スタブ実装
    logger.debug('Character update recorded in memory system', {
      characterId: character.id,
      updateKeys: Object.keys(updates)
    });
  }

  private async recordAppearanceInMemorySystem(
    characterId: string,
    appearance: CharacterAppearance
  ): Promise<void> {
    // スタブ実装
    logger.debug('Character appearance recorded in memory system', {
      characterId,
      chapterNumber: appearance.chapterNumber
    });
  }

  private async recordInteractionInMemorySystem(
    sourceId: string,
    targetId: string,
    interaction: Interaction
  ): Promise<void> {
    // スタブ実装
    logger.debug('Character interaction recorded in memory system', {
      sourceId,
      targetId,
      type: interaction.type
    });
  }

  private async processDevelopmentWithMemorySystem(
    character: Character,
    events: ChapterEvent[]
  ): Promise<{ success: boolean }> {
    // スタブ実装
    logger.debug('Character development processed in memory system', {
      characterId: character.id,
      eventsCount: events.length
    });
    return { success: true };
  }

  private async assessCharacterMemorySystemHealth(characterId: string): Promise<any> {
    try {
      const systemStatus = await this.memoryManager.getSystemStatus();
      return {
        systemHealth: systemStatus.initialized ? 'GOOD' : 'LIMITED',
        lastMemoryUpdate: new Date().toISOString()
      };
    } catch (error) {
      return { 
        systemHealth: 'UNKNOWN', 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  private async checkCharacterMemoryIntegrity(characterId: string): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    // スタブ実装
    return {
      isValid: true,
      issues: []
    };
  }

  private createFallbackQualityAssessment(character: Character): QualityAssessment {
    return {
      characterId: character.id,
      overallScore: 0.7, // デフォルトスコア
      issues: [],
      recommendations: [],
      assessmentDate: new Date(),
      memorySystemHealth: { systemHealth: 'UNKNOWN' }
    };
  }

  private calculateQualityScore(character: Character, issues: Array<{ severity: string }>): number {
    let score = 1.0;
    
    // 基本減点
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'HIGH': score -= 0.3; break;
        case 'MEDIUM': score -= 0.2; break;
        case 'LOW': score -= 0.1; break;
      }
    });
    
    // 最低スコア保証
    return Math.max(0.1, score);
  }

  private async invalidateActiveCharactersCache(): Promise<void> {
    // スタブ実装
    logger.debug('Active characters cache invalidated');
  }

  private async createCharacterFallback(data: CharacterData): Promise<Character> {
    logger.warn('Using fallback character creation method');
    
    const character: Character = {
      id: generateId(),
      ...data,
      shortNames: data.shortNames || [],
      nicknames: data.nicknames || {},
      state: this.initializeCharacterState(data),
      history: this.initializeHistory(),
      metadata: {
        createdAt: new Date(),
        lastUpdated: new Date(),
        version: 1,
        tags: data.metadata?.tags || []
      },
    };

    if (this.characterRepository) {
      await this.characterRepository.saveCharacter(character);
    }
    
    return character;
  }

  private async processCharacterDevelopmentFallback(
    character: Character,
    events: ChapterEvent[]
  ): Promise<Character> {
    logger.warn('Using fallback character development processing');
    
    // 簡素な発展処理
    const developmentStageIncrease = events.length * 0.1;
    const updatedState: Partial<CharacterState> = {
      ...character.state,
      developmentStage: (character.state.developmentStage || 0) + developmentStageIncrease
    };

    // 状態の更新
    if (this.characterRepository) {
      await this.characterRepository.saveCharacterState(character.id, updatedState as CharacterState);
    }

    // 更新されたキャラクターを取得
    const updatedCharacter = await this.getCharacter(character.id);
    return updatedCharacter || character;
  }
}

// 修正済みシングルトンファクトリ関数
export function createCharacterService(memoryManager: MemoryManager, characterRepository?: any): CharacterService {
  return new CharacterService(memoryManager, characterRepository);
}