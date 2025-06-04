/**
 * @fileoverview プロンプト保存ユーティリティ
 * @description 生成されたプロンプトをMarkdown形式でdata/promptsディレクトリに保存
 */

import { promises as fs } from 'fs';
import path from 'path';
import { GenerationContext } from '@/types/generation';
import { logger } from '@/lib/utils/logger';

/**
 * プロンプト保存時のメタデータ
 */
interface PromptMetadata {
  chapterNumber: number;
  timestamp: string;
  targetLength: number;
  genre?: string;
  theme?: string;
  tension?: number;
  pacing?: number;
  memorySystemUsed: boolean;
  learningJourneyIntegrated: boolean;
  unifiedMemoryData?: {
    searchSuccess: boolean;
    totalResults: number;
    processingTime: number;
  };
  generationContext: {
    worldSettingsPresent: boolean;
    charactersCount: number;
    plotPointsCount: number;
    foreshadowingCount: number;
  };
}

/**
 * プロンプト保存用クラス
 */
export class PromptStorage {
  private readonly promptsDir: string;

  constructor() {
    this.promptsDir = path.join(process.cwd(), 'data', 'prompts');
  }

  /**
   * プロンプトディレクトリの初期化
   */
  async ensurePromptsDirectory(): Promise<void> {
    try {
      await fs.access(this.promptsDir);
    } catch (error) {
      logger.info('Creating prompts directory', { path: this.promptsDir });
      await fs.mkdir(this.promptsDir, { recursive: true });
    }
  }

  /**
   * プロンプトをMarkdown形式で保存
   */
  async savePrompt(
    prompt: string,
    context: GenerationContext,
    additionalMetadata?: Record<string, any>
  ): Promise<string> {
    try {
      await this.ensurePromptsDirectory();

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const chapterNumber = context.chapterNumber || 1;
      const filename = `chapter-${chapterNumber.toString().padStart(3, '0')}-${timestamp}.md`;
      const filepath = path.join(this.promptsDir, filename);

      // メタデータの構築
      const metadata: PromptMetadata = {
        chapterNumber,
        timestamp: new Date().toISOString(),
        targetLength: context.targetLength || 8000,
        genre: context.genre,
        theme: context.theme,
        tension: (context as any).tension,
        pacing: (context as any).pacing,
        memorySystemUsed: !!(context as any).unifiedMemoryData,
        learningJourneyIntegrated: !!(context as any).learningJourney,
        unifiedMemoryData: (context as any).unifiedMemoryData,
        generationContext: {
          worldSettingsPresent: !!(context.worldSettings),
          charactersCount: context.characters?.length || 0,
          plotPointsCount: context.plotPoints?.length || 0,
          foreshadowingCount: context.foreshadowing?.length || 0
        },
        ...additionalMetadata
      };

      // Markdown形式での保存内容構築
      const markdownContent = this.buildMarkdownContent(prompt, metadata, context);

      // ファイル保存
      await fs.writeFile(filepath, markdownContent, 'utf-8');

      logger.info('Prompt saved successfully', {
        chapterNumber,
        filename,
        filepath,
        promptLength: prompt.length
      });

      return filepath;

    } catch (error) {
      logger.error('Failed to save prompt', {
        chapterNumber: context.chapterNumber,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Markdown形式のコンテンツを構築
   */
  private buildMarkdownContent(
    prompt: string,
    metadata: PromptMetadata,
    context: GenerationContext
  ): string {
    const frontMatter = this.buildFrontMatter(metadata);
    const promptSection = this.buildPromptSection(prompt);
    const contextSection = this.buildContextSection(context);
    const metadataSection = this.buildMetadataSection(metadata);

    return `${frontMatter}

${promptSection}

${contextSection}

${metadataSection}`;
  }

  /**
   * YAMLフロントマターの構築
   */
  private buildFrontMatter(metadata: PromptMetadata): string {
    return `---
title: "第${metadata.chapterNumber}章 - プロンプト生成記録"
chapter: ${metadata.chapterNumber}
timestamp: "${metadata.timestamp}"
targetLength: ${metadata.targetLength}
genre: "${metadata.genre || 'unknown'}"
theme: "${metadata.theme || 'unknown'}"
tension: ${metadata.tension || 'null'}
pacing: ${metadata.pacing || 'null'}
memorySystemUsed: ${metadata.memorySystemUsed}
learningJourneyIntegrated: ${metadata.learningJourneyIntegrated}
generatedBy: "ServiceContainer統合版 - ChapterGenerator"
---`;
  }

  /**
   * プロンプトセクションの構築
   */
  private buildPromptSection(prompt: string): string {
    return `# 生成されたプロンプト

\`\`\`markdown
${prompt}
\`\`\``;
  }

  /**
   * コンテキストセクションの構築
   */
  private buildContextSection(context: GenerationContext): string {
    const sections: string[] = [];

    sections.push('## 生成コンテキスト情報');

    // 基本情報
    sections.push('### 基本設定');
    sections.push(`- **章番号**: ${context.chapterNumber || 1}`);
    sections.push(`- **目標文字数**: ${context.targetLength || 8000}文字`);
    sections.push(`- **ジャンル**: ${context.genre || '未指定'}`);
    sections.push(`- **テーマ**: ${context.theme || '未指定'}`);
    sections.push(`- **語り口調**: ${context.narrativeStyle || '三人称視点'}`);
    sections.push(`- **トーン**: ${context.tone || '標準的'}`);

    // キャラクター情報
    if (context.characters && context.characters.length > 0) {
      sections.push('### 登場キャラクター');
      context.characters.forEach(char => {
        sections.push(`- **${char.name}**: ${char.description || '詳細情報なし'}`);
      });
    }

    // プロット要素
    if (context.plotPoints && context.plotPoints.length > 0) {
      sections.push('### プロット要素');
      context.plotPoints.forEach(point => {
        sections.push(`- ${point}`);
      });
    }

    // 伏線情報
    if (context.foreshadowing && context.foreshadowing.length > 0) {
      sections.push('### 伏線要素');
      context.foreshadowing.forEach(item => {
        sections.push(`- ${typeof item === 'string' ? item : item.description || 'N/A'}`);
      });
    }

    // 統合記憶システム情報
    const unifiedMemoryData = (context as any).unifiedMemoryData;
    if (unifiedMemoryData) {
      sections.push('### 統合記憶システム情報');
      sections.push(`- **検索成功**: ${unifiedMemoryData.searchSuccess ? 'はい' : 'いいえ'}`);
      sections.push(`- **総結果数**: ${unifiedMemoryData.totalResults}件`);
      sections.push(`- **処理時間**: ${unifiedMemoryData.processingTime}ms`);
      sections.push(`- **アクセス層**: ${unifiedMemoryData.layersAccessed?.join(', ') || 'N/A'}`);
    }

    // 学習旅程情報
    const learningJourney = (context as any).learningJourney;
    if (learningJourney) {
      sections.push('### 学習旅程統合情報');
      sections.push(`- **メインコンセプト**: ${learningJourney.mainConcept || 'N/A'}`);
      sections.push(`- **学習段階**: ${learningJourney.learningStage || 'N/A'}`);
      if (learningJourney.emotionalArc) {
        sections.push(`- **感情アーク**: 設計済み`);
      }
      if (learningJourney.sceneRecommendations) {
        sections.push(`- **シーン推奨**: あり`);
      }
    }

    return sections.join('\n');
  }

  /**
   * メタデータセクションの構築
   */
  private buildMetadataSection(metadata: PromptMetadata): string {
    const sections: string[] = [];

    sections.push('## 技術的メタデータ');

    sections.push('### システム情報');
    sections.push(`- **統合記憶システム使用**: ${metadata.memorySystemUsed ? 'はい' : 'いいえ'}`);
    sections.push(`- **学習旅程統合**: ${metadata.learningJourneyIntegrated ? 'はい' : 'いいえ'}`);
    sections.push(`- **生成時刻**: ${metadata.timestamp}`);

    sections.push('### 生成コンテキスト統計');
    sections.push(`- **世界設定**: ${metadata.generationContext.worldSettingsPresent ? 'あり' : 'なし'}`);
    sections.push(`- **キャラクター数**: ${metadata.generationContext.charactersCount}人`);
    sections.push(`- **プロット要素数**: ${metadata.generationContext.plotPointsCount}個`);
    sections.push(`- **伏線要素数**: ${metadata.generationContext.foreshadowingCount}個`);

    // テンション・ペーシング情報
    if (metadata.tension !== undefined || metadata.pacing !== undefined) {
      sections.push('### パフォーマンス指標');
      if (metadata.tension !== undefined) {
        sections.push(`- **テンションレベル**: ${(metadata.tension * 10).toFixed(1)}/10`);
      }
      if (metadata.pacing !== undefined) {
        sections.push(`- **ペーシングレベル**: ${(metadata.pacing * 10).toFixed(1)}/10`);
      }
    }

    // 統合記憶システム詳細
    if (metadata.unifiedMemoryData) {
      sections.push('### 統合記憶システム詳細');
      sections.push(`- **検索処理時間**: ${metadata.unifiedMemoryData.processingTime}ms`);
      sections.push(`- **取得結果数**: ${metadata.unifiedMemoryData.totalResults}件`);
      sections.push(`- **検索成功率**: ${metadata.unifiedMemoryData.searchSuccess ? '100%' : '0%'}`);
    }

    sections.push('---');
    sections.push('*このファイルは自動生成されました*');

    return sections.join('\n');
  }

  /**
   * 保存されたプロンプトファイルの一覧取得
   */
  async listSavedPrompts(): Promise<Array<{
    filename: string;
    chapterNumber: number;
    timestamp: string;
    filepath: string;
  }>> {
    try {
      await this.ensurePromptsDirectory();
      
      const files = await fs.readdir(this.promptsDir);
      const promptFiles = files
        .filter(file => file.endsWith('.md') && file.startsWith('chapter-'))
        .map(filename => {
          const match = filename.match(/^chapter-(\d+)-(.+)\.md$/);
          if (match) {
            return {
              filename,
              chapterNumber: parseInt(match[1], 10),
              timestamp: match[2].replace(/-/g, ':'),
              filepath: path.join(this.promptsDir, filename)
            };
          }
          return null;
        })
        .filter(item => item !== null)
        .sort((a, b) => b!.chapterNumber - a!.chapterNumber || b!.timestamp.localeCompare(a!.timestamp));

      return promptFiles as Array<{
        filename: string;
        chapterNumber: number;
        timestamp: string;
        filepath: string;
      }>;

    } catch (error) {
      logger.error('Failed to list saved prompts', {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * 特定のプロンプトファイルの読み込み
   */
  async loadPrompt(filename: string): Promise<string | null> {
    try {
      const filepath = path.join(this.promptsDir, filename);
      const content = await fs.readFile(filepath, 'utf-8');
      return content;
    } catch (error) {
      logger.error('Failed to load prompt file', {
        filename,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }
}

// シングルトンインスタンス
export const promptStorage = new PromptStorage();