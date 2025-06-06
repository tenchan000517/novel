// src\lib\generation\prompt\template-manager.ts
/**
 * @fileoverview テンプレート管理クラス
 * @description プロンプト生成に使用するテンプレートを管理するクラス
 */

import { storageProvider } from '@/lib/storage';
import { logger } from '@/lib/utils/logger';
import path from 'path';

/**
 * テンプレート管理クラス
 * テンプレートデータの読み込み・取得を担当
 */
export class TemplateManager {
  private templates: Record<string, any> = {};
  private isLoaded: boolean = false;

  /**
   * コンストラクタ
   * @param templatePath テンプレートファイルのパス（省略時はデフォルトパス）
   */
  constructor(private templatePath: string = path.join(process.cwd(), 'src/lib/generation/prompt/template/promptTemplates.json')) { }

  /**
   * テンプレートを読み込む
   * @returns {Promise<void>}
   */
  public async load(): Promise<void> {
    try {
      if (this.isLoaded) {
        return;
      }

      const data = await storageProvider.readFile(this.templatePath);
      this.templates = JSON.parse(data);
      this.isLoaded = true;
      logger.info('Templates loaded successfully');
    } catch (error) {
      logger.error('Failed to load templates', { error, path: this.templatePath });
      throw new Error(`Failed to load templates: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * テンプレートを取得する
   * @param {string} key 取得するテンプレートのキー
   * @param {string} [subKey] サブキー（存在する場合）
   * @returns {string} テンプレート文字列
   */
  public getTemplate(key: string, subKey?: string): string {
    if (!this.isLoaded) {
      logger.warn('Templates are not loaded yet. Returning empty string.');
      return '';
    }

    try {
      // キーが存在するか確認
      if (!(key in this.templates)) {
        logger.warn(`Template key "${key}" not found`);
        return '';
      }

      // サブキーがある場合
      if (subKey) {
        if (!(subKey in this.templates[key])) {
          logger.warn(`Template sub-key "${subKey}" not found in "${key}"`);
          return '';
        }
        return this.templates[key][subKey];
      }

      // サブキーがない場合
      return this.templates[key];
    } catch (error) {
      logger.error('Error getting template', { error, key, subKey });
      return '';
    }
  }

  /**
   * レベル（0～1の値）に基づいた説明を取得する
   * @param {string} category カテゴリ名（例：'tensionDescriptions'）
   * @param {number} level 0～1の間のレベル値
   * @returns {string} レベルに対応する説明
   */
  public getDescriptionByLevel(category: string, level: number): string {
    if (!this.isLoaded || !(category in this.templates)) {
      logger.warn(`Category "${category}" not found or templates not loaded`);
      return '';
    }

    try {
      const descriptions = this.templates[category];
      const levels = Object.keys(descriptions)
        .map(Number)
        .sort((a, b) => b - a); // 降順にソート

      // 最も近い下限値を見つける
      for (const threshold of levels) {
        if (level >= threshold) {
          return descriptions[threshold.toString()];
        }
      }

      // 最も低いレベルの説明を返す（デフォルト）
      return descriptions[levels[levels.length - 1].toString()];
    } catch (error) {
      logger.error('Error getting description by level', { error, category, level });
      return '';
    }
  }

  /**
 * フォールバックテンプレートを設定する
 * テンプレートファイルの読み込みに失敗した場合に使用される
 */
  async setFallbackTemplates(): Promise<void> {
    try {
      logger.info('Setting fallback templates');

      // 基本テンプレート
      const baseTemplate = `# 小説生成指示
  
  ## 基本情報
  - 章番号: {chapterNumber}
  - 総章数: {totalChapters}
  - 目標文字数: {targetLength}文字
  - 語り手: {narrativeStyle}
  - 文体: {tone}
  - テーマ: {theme}
  - ジャンル: {genre}
  
  ## 世界設定
  {worldSettings}
  
  ## 登場人物
  {characters}
  
  ## 物語の文脈
  {storyContext}
  
  ## 前章の状況
  {previousChapterEnding}
  
  ## 章の目的
  {chapterPurpose}
  
  ## プロット要素
  {requiredPlotPoints}
  
  ## テンション・ペーシング
  - テンションレベル: {tensionLevel}
  - テンション説明: {tensionDescription}
  - ペーシングレベル: {pacingLevel}
  - ペーシング説明: {pacingDescription}
  
  【出力形式】
  - 指定された文字数を目安に章を執筆してください
  - 自然な文章で物語を進行させてください
  - キャラクターの個性と成長を描写してください
  - 五感を使った豊かな描写を心がけてください`;

      // テンション説明のマッピング
      const tensionDescriptions = {
        0.1: '非常に静かで平和な雰囲気',
        0.2: '穏やかで落ち着いた状況',
        0.3: '軽い関心や好奇心',
        0.4: '少しの不安や期待',
        0.5: '適度な緊張感や関心',
        0.6: '高まる期待や軽い緊張',
        0.7: '明確な緊張感や不安',
        0.8: '強い緊張感やスリル',
        0.9: '非常に高い緊張感',
        1.0: '最高レベルの緊張感とクライマックス'
      };

      // ペーシング説明のマッピング
      const pacingDescriptions = {
        0.1: '非常にゆっくりとした展開',
        0.2: 'ゆったりとした描写重視',
        0.3: '落ち着いたペースでの進行',
        0.4: 'やや緩やかな展開',
        0.5: '標準的なテンポでの進行',
        0.6: 'やや速めのテンポ',
        0.7: '活発で動きのある展開',
        0.8: '速いテンポでの展開',
        0.9: '非常に速い展開',
        1.0: '怒涛の展開とクライマックス'
      };

      // ジャンル別ガイダンス
      const genreGuidance = {
        business: `
  ## ビジネス小説特有の指示
  - リアルなビジネスシーンを描写する
  - 専門用語は自然に会話に織り込む
  - キャラクターの成長と学びを重視する
  - 実践的な知識を物語に統合する
  `,
        fantasy: `
  ## ファンタジー小説特有の指示
  - 世界観の詳細な描写を心がける
  - 魔法システムの一貫性を保つ
  - 冒険と発見の要素を重視する
  `,
        mystery: `
  ## ミステリー小説特有の指示
  - 伏線と手がかりを適切に配置する
  - 論理的な推理過程を描く
  - 読者の推理参加を促す構成にする
  `,
        classic: `
  ## 一般小説の指示
  - 人間関係と心理描写を重視する
  - 自然な対話と内面描写のバランスを取る
  - テーマを物語に自然に織り込む
  `
      };

      // 章タイプ別指示
      const chapterTypeInstructions = {
        OPENING: '物語の導入として、世界観とキャラクターを魅力的に紹介してください',
        STANDARD: '物語を自然に進行させ、キャラクターの成長を描いてください',
        ACTION: 'ダイナミックな展開と緊張感を重視してください',
        REVELATION: '重要な真実や発見を効果的に描写してください',
        CLOSING: '物語の締めくくりとして満足感のある結末を提供してください',
        BUSINESS_INTRODUCTION: 'ビジネス環境とキャラクターの目標を明確に示してください',
        BUSINESS_CHALLENGE: 'ビジネス上の課題と解決への取り組みを描いてください'
      };

      // テンプレートマップに格納
      this.templates.set('baseTemplate', baseTemplate);
      this.templates.set('tensionDescriptions', tensionDescriptions);
      this.templates.set('pacingDescriptions', pacingDescriptions);
      this.templates.set('genreGuidance', genreGuidance);
      this.templates.set('chapterTypeInstructions', chapterTypeInstructions);

      // 物語状態別ガイダンス
      const narrativeStateGuidance = {
        DEFAULT: '物語を自然に進行させてください',
        INTRODUCTION: 'キャラクターと状況を効果的に紹介してください',
        DEVELOPMENT: 'プロットを発展させ、キャラクターを成長させてください',
        CLIMAX: '物語の頂点として緊張感を最大化してください',
        RESOLUTION: '物語の結末として満足感のある解決を提供してください'
      };

      this.templates.set('narrativeStateGuidance', narrativeStateGuidance);

      this.isLoaded = true;
      logger.info('Fallback templates have been set successfully');

    } catch (error) {
      logger.error('Failed to set fallback templates', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 章タイプに基づいた指示を取得する
   * @param {string} chapterType 章タイプ
   * @param {string} genre ジャンル
   * @returns {string} 章タイプに対応する指示
   */
  public getChapterTypeInstructions(chapterType: string, genre: string): string {
    // ビジネスジャンルの場合
    if (genre.toLowerCase() === 'business') {
      return this.getTemplate('businessChapterTypes', chapterType) ||
        this.getTemplate('businessChapterTypes', 'BUSINESS_CHALLENGE');
    }

    // 一般的な章タイプ
    return this.getTemplate('chapterTypes', chapterType) ||
      this.getTemplate('chapterTypes', 'STANDARD');
  }

  /**
   * ジャンル固有のガイダンスを取得する
   * @param {string} genre ジャンル
   * @returns {string} ジャンル固有のガイダンス
   */
  public getGenreGuidance(genre: string): string {
    return this.getTemplate('genreGuidance', genre.toLowerCase()) || '';
  }

  /**
   * ビジネス固有のセクションを取得する
   * @param {string} sectionType セクションタイプ
   * @returns {string} ビジネス固有のセクション
   */
  public getBusinessSpecificSection(sectionType: string): string {
    return this.getTemplate('businessSpecificSections', sectionType) || '';
  }

  /**
   * 物語状態のガイダンスを取得する
   * @param {string} state 物語状態
   * @param {string} genre ジャンル
   * @returns {string} 物語状態に対応するガイダンス
   */
  public getNarrativeStateGuidance(state: string, genre: string): string {
    const lowerGenre = genre.toLowerCase();
    const genreKey = (lowerGenre === 'coaching' || lowerGenre === 'selfhelp')
      ? 'coaching'
      : (lowerGenre === 'business' ? 'business' : 'default');

    const stateTemplates = this.getTemplate('narrativeStates', state);
    if (stateTemplates && typeof stateTemplates === 'object' && genreKey in stateTemplates) {
      return stateTemplates[genreKey as keyof typeof stateTemplates] as string;
    }

    const defaultTemplates = this.getTemplate('narrativeStates', 'DEFAULT');
    if (defaultTemplates && typeof defaultTemplates === 'object') {
      return defaultTemplates[genreKey as keyof typeof defaultTemplates] as string || '';
    }

    return '';
  }

  /**
   * 基本テンプレートを取得する
   */
  getBaseTemplate(): string {
    if (!this.isLoaded) {
      throw new Error('Templates not loaded. Call load() or setFallbackTemplates() first.');
    }

    return this.templates.get('baseTemplate') || 'Template not found';
  }
}