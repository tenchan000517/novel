// src/lib/utils/analysis-formatter.ts
import { 
    CharacterAppearance, 
    ThemeOccurrence, 
    ForeshadowingElement, 
    QualityMetrics,
    GenerationContext
  } from '@/types/generation';
  import { logger } from '@/lib/utils/logger';
  
  /**
   * 分析結果のフォーマットと標準化を担当するユーティリティクラス
   */
  export class AnalysisFormatter {
    /**
     * キャラクター登場情報をフォーマット
     */
    static formatCharacterAppearances(
      appearances: any[],
      context: GenerationContext
    ): CharacterAppearance[] {
      if (!appearances || !Array.isArray(appearances)) {
        return AnalysisFormatter.createFallbackCharacterAppearances(context);
      }
  
      return appearances.map(appearance => ({
        characterId: appearance.characterId || `char-${appearance.characterName?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}`,
        characterName: appearance.characterName || 'Unknown Character',
        scenes: Array.isArray(appearance.scenes) ? appearance.scenes : [],
        dialogueCount: typeof appearance.dialogueCount === 'number' ? appearance.dialogueCount : 0,
        significance: typeof appearance.significance === 'number' ?
          Math.max(0, Math.min(1, appearance.significance)) : 0.5,
        actions: Array.isArray(appearance.actions) ? appearance.actions : [],
        emotions: Array.isArray(appearance.emotions) ? appearance.emotions : []
      }));
    }
  
    /**
     * テーマ出現情報をフォーマット
     */
    static formatThemeOccurrences(
      occurrences: any[],
      context: GenerationContext
    ): ThemeOccurrence[] {
      if (!occurrences || !Array.isArray(occurrences)) {
        return AnalysisFormatter.createFallbackThemeOccurrences(context);
      }
  
      return occurrences.map(occurrence => ({
        themeId: occurrence.themeId || `theme-${occurrence.themeName?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}`,
        themeName: occurrence.themeName || 'Unknown Theme',
        expressions: Array.isArray(occurrence.expressions) ? occurrence.expressions : [],
        strength: typeof occurrence.strength === 'number' ?
          Math.max(0, Math.min(1, occurrence.strength)) : 0.5,
        theme: occurrence.theme || occurrence.themeName || '',
        contexts: Array.isArray(occurrence.contexts) ? occurrence.contexts : []
      }));
    }
  
    /**
     * 伏線要素をフォーマット
     */
    static formatForeshadowingElements(
      elements: any[],
      chapterNumber: number
    ): ForeshadowingElement[] {
      if (!elements || !Array.isArray(elements)) {
        return [];
      }
  
      return elements.map((element, index) => ({
        id: element.id || `foreshadowing-${chapterNumber}-${index + 1}`,
        description: element.description || 'Undefined foreshadowing element',
        position: typeof element.position === 'number' ? element.position : 0,
        text: element.text || '',
        plannedResolutionChapter: Array.isArray(element.plannedResolutionChapter) && element.plannedResolutionChapter.length === 2 ?
          element.plannedResolutionChapter as [number, number] : [chapterNumber + 2, chapterNumber + 10],
        relatedCharacters: Array.isArray(element.relatedCharacters) ? element.relatedCharacters : [],
        element: element.element || element.description || '',
        chapter: chapterNumber,
        resolutionChapter: element.resolutionChapter,
        isResolved: element.isResolved || false
      }));
    }
  
    /**
     * 品質メトリクスをフォーマット
     */
    static formatQualityMetrics(metrics: any): QualityMetrics {
      if (!metrics || typeof metrics !== 'object') {
        return AnalysisFormatter.createFallbackQualityMetrics();
      }
  
      // 値の正規化（0-1の範囲に収める）
      const normalize = (value: any) => {
        if (typeof value !== 'number') return 0.7;
        return Math.max(0, Math.min(1, value));
      };
  
      return {
        readability: normalize(metrics.readability),
        consistency: normalize(metrics.consistency),
        engagement: normalize(metrics.engagement),
        characterDepiction: normalize(metrics.characterDepiction),
        originality: normalize(metrics.originality),
        overall: normalize(metrics.overall ||
          ((metrics.readability || 0) +
            (metrics.consistency || 0) +
            (metrics.engagement || 0) +
            (metrics.characterDepiction || 0) +
            (metrics.originality || 0)) / 5),
        coherence: normalize(metrics.coherence || metrics.consistency),
        characterConsistency: normalize(metrics.characterConsistency || metrics.characterDepiction)
      };
    }
  
    /**
     * フォールバックキャラクター登場情報の作成
     */
    static createFallbackCharacterAppearances(context: GenerationContext): CharacterAppearance[] {
      return (context.characters || [])
        .slice(0, 5)
        .map((char: any, index: number) => ({
          characterId: `char-${char.name?.replace(/\s+/g, '-').toLowerCase() || `unknown-${index}`}`,
          characterName: char.name || `Character ${index + 1}`,
          scenes: [],
          dialogueCount: 5,
          significance: 0.8 - (index * 0.1),
          actions: [],
          emotions: []
        }));
    }
  
    /**
     * フォールバックテーマ出現情報の作成
     */
    static createFallbackThemeOccurrences(context: GenerationContext): ThemeOccurrence[] {
      return context.theme ?
        [{
          themeId: `theme-main`,
          themeName: typeof context.theme === 'string' ? context.theme : 'Main Theme',
          expressions: [],
          strength: 0.8,
          theme: typeof context.theme === 'string' ? context.theme : 'Main Theme',
          contexts: []
        }] : [];
    }
  
    /**
     * フォールバック伏線要素の作成
     */
    static createFallbackForeshadowingElements(
      chapterNumber: number,
      context: GenerationContext
    ): ForeshadowingElement[] {
      return (context.foreshadowing || [])
        .slice(0, 3)
        .map((fore: any, index: number) => ({
          id: `foreshadowing-${chapterNumber}-${index + 1}`,
          description: typeof fore === 'string' ? fore : fore.description || `Foreshadowing element ${index + 1}`,
          position: 500 * (index + 1),
          text: '',
          plannedResolutionChapter: [chapterNumber + 2, chapterNumber + 10] as [number, number],
          relatedCharacters: [],
          element: typeof fore === 'string' ? fore : fore.description || `Foreshadowing element ${index + 1}`,
          chapter: chapterNumber,
          resolutionChapter: undefined,
          isResolved: false
        }));
    }
  
    /**
     * フォールバック品質メトリクスの作成
     */
    static createFallbackQualityMetrics(): QualityMetrics {
      return {
        readability: 0.75,
        consistency: 0.7,
        engagement: 0.7,
        characterDepiction: 0.7,
        originality: 0.65,
        overall: 0.7,
        coherence: 0.7,
        characterConsistency: 0.7
      };
    }
  
    /**
     * 単語数/文字数カウント (共通ユーティリティとして抽出)
     */
    static countWords(text: string): number {
      // 日本語の場合、単語数ではなく文字数をカウント
      if (/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text)) {
        return text.length;
      }
  
      // 英文の場合は単語数をカウント
      return text.split(/\s+/).filter(word => word.length > 0).length;
    }
  }