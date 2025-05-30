// // src/lib/analysis/pipeline/analysis-steps.ts

// import { AnalysisStep, PipelineContext } from './chapter-analysis-pipeline';
// import { Chapter } from '@/types/chapters';
// import { ChapterAnalysisService } from '@/lib/analysis/services/chapter/chapter-analysis-service';
// import { CharacterAnalysisService } from '@/lib/analysis/services/character-analysis-service';
// import { StyleAnalysisService } from '@/lib/analysis/services/style-analysis-service';
// import { ThemeAnalysisService } from '@/lib/analysis/services/theme-analysis-service';
// import { NarrativeAnalysisService } from '@/lib/analysis/services/narrative-analysis-service';
// import { logger } from '@/lib/utils/logger';

// /**
//  * 基本分析ステップ
//  * 章の基本的な分析を行います
//  */
// export class BasicAnalysisStep implements AnalysisStep<Chapter, any> {
//   readonly name = 'basicAnalysis';
//   readonly timeout = 30000;
  
//   constructor(private analysisService: ChapterAnalysisService) {}
  
//   async execute(chapter: Chapter, context: PipelineContext): Promise<any> {
//     logger.debug(`Executing basic analysis for chapter ${chapter.chapterNumber}`);
    
//     const content = chapter.content;
//     const chapterNumber = chapter.chapterNumber;
//     const generationContext = context.generationContext;
    
//     return await this.analysisService.analyzeChapter(content, chapterNumber, generationContext);
//   }
// }

// /**
//  * キャラクター分析ステップ
//  * 章内のキャラクター出現を分析します
//  */
// export class CharacterAnalysisStep implements AnalysisStep<Chapter, any> {
//   readonly name = 'characterAnalysis';
//   readonly timeout = 40000;
  
//   constructor(private characterService: CharacterAnalysisService) {}
  
//   async execute(chapter: Chapter, context: PipelineContext): Promise<any> {
//     logger.debug(`Executing character analysis for chapter ${chapter.chapterNumber}`);
    
//     const chapterContent = chapter.content;
    
//     // キャラクター出現の検出
//     const appearances = await this.characterService.detectCharacterAppearances(chapterContent);
    
//     // キャラクター言及分析
//     const mentions = await this.characterService.analyzeCharacterMentions(
//       chapterContent,
//       chapter.chapterNumber
//     );
    
//     // 結果を返す
//     return {
//       characterAppearances: appearances,
//       characterMentions: mentions
//     };
//   }
// }

// /**
//  * テーマ分析ステップ
//  * 章内のテーマと象徴を分析します
//  */
// export class ThemeAnalysisStep implements AnalysisStep<Chapter, any> {
//   readonly name = 'themeAnalysis';
//   readonly timeout = 45000;
  
//   constructor(private themeService: ThemeAnalysisService) {}
  
//   async execute(chapter: Chapter, context: PipelineContext): Promise<any> {
//     logger.debug(`Executing theme analysis for chapter ${chapter.chapterNumber}`);
    
//     // テーマの取得
//     const themes = context.generationContext?.theme 
//       ? [context.generationContext.theme]
//       : ['成長', '変化', '挑戦'];
    
//     // テーマ共鳴分析
//     const themeResonance = await this.themeService.analyzeThemeResonance(
//       chapter.content,
//       themes
//     );
    
//     // テーマ強化提案の生成
//     const themeEnhancements = await this.themeService.suggestThemeEnhancements(
//       themeResonance,
//       chapter.chapterNumber
//     );
    
//     // 象徴分析
//     const symbolism = await this.themeService.analyzeSymbolismAndImagery(chapter.content);
    
//     return {
//       themeOccurrences: Object.entries(themeResonance.themes).map(([theme, info]) => ({
//         themeId: `theme-${theme.replace(/\s+/g, '-').toLowerCase()}`,
//         themeName: theme,
//         expressions: info.explicitMentions,
//         strength: info.strength / 10, // 0-1のスケールに変換
//         theme,
//         contexts: info.implicitExpressions
//       })),
//       themeEnhancements,
//       symbolism
//     };
//   }
// }

// /**
//  * 文体分析ステップ
//  * 章の文体と表現パターンを分析します
//  */
// export class StyleAnalysisStep implements AnalysisStep<Chapter, any> {
//   readonly name = 'styleAnalysis';
//   readonly timeout = 30000;
  
//   constructor(private styleService: StyleAnalysisService) {}
  
//   async execute(chapter: Chapter, context: PipelineContext): Promise<any> {
//     logger.debug(`Executing style analysis for chapter ${chapter.chapterNumber}`);
    
//     // 文体分析
//     const styleAnalysis = await this.styleService.analyzeStyle(chapter.content);
    
//     // 表現パターン分析
//     const expressionPatterns = await this.styleService.analyzeExpressionPatterns(chapter.content);
    
//     // 主語パターン分析
//     const subjectPatterns = await this.styleService.analyzeSubjectPatterns(chapter.content);
    
//     // 文体メトリクスを品質メトリクスに変換
//     const qualityMetrics = {
//       readability: styleAnalysis.sentenceVariety || 0.7,
//       vocabularyRichness: styleAnalysis.vocabularyRichness || 0.7,
//       consistentStyle: subjectPatterns.subjectDiversityScore || 0.7
//     };
    
//     return {
//       styleAnalysis,
//       expressionPatterns,
//       subjectPatterns,
//       qualityMetrics,
//       detectedIssues: subjectPatterns.suggestions.map(suggestion => ({
//         type: 'style',
//         severity: 'medium',
//         message: suggestion
//       }))
//     };
//   }
// }

// /**
//  * 伏線分析ステップ
//  * 章内の伏線要素を分析します
//  */
// export class ForeshadowingAnalysisStep implements AnalysisStep<Chapter, any> {
//   readonly name = 'foreshadowingAnalysis';
//   readonly timeout = 35000;
  
//   constructor(private themeService: ThemeAnalysisService) {}
  
//   async execute(chapter: Chapter, context: PipelineContext): Promise<any> {
//     logger.debug(`Executing foreshadowing analysis for chapter ${chapter.chapterNumber}`);
    
//     // 伏線処理を実行
//     const foreshadowingResult = await this.themeService.processForeshadowing(
//       chapter.content,
//       chapter.chapterNumber
//     );
    
//     return {
//       foreshadowingElements: foreshadowingResult.resolvedForeshadowing || [],
//       newForeshadowing: foreshadowingResult.generatedCount || 0
//     };
//   }
// }

// /**
//  * 物語構造分析ステップ
//  * 章の物語構造とフローを分析します
//  */
// export class NarrativeStructureStep implements AnalysisStep<Chapter, any> {
//   readonly name = 'narrativeStructure';
//   readonly timeout = 25000;
  
//   constructor(private narrativeService: NarrativeAnalysisService) {}
  
//   async execute(chapter: Chapter, context: PipelineContext): Promise<any> {
//     logger.debug(`Executing narrative structure analysis for chapter ${chapter.chapterNumber}`);
    
//     // 章からの物語状態更新
//     await this.narrativeService.updateFromChapter(chapter);
    
//     // テンション・ペーシング推奨
//     const tensionPacing = await this.narrativeService.getTensionPacingRecommendation(
//       chapter.chapterNumber
//     );
    
//     // 現在の物語状態
//     const narrativeState = this.narrativeService.getCurrentNarrativeState();
    
//     // 停滞検出
//     const stagnation = await this.narrativeService.detectStagnation(chapter.chapterNumber);
    
//     // ターニングポイント検出
//     const turningPoint = this.narrativeService.getTurningPointForChapter(chapter.chapterNumber);
    
//     return {
//       narrativeState,
//       tensionRecommendation: tensionPacing.tension,
//       pacingRecommendation: tensionPacing.pacing,
//       stagnation,
//       turningPoint: turningPoint || null,
//       tensionLevel: this.narrativeService.getCurrentTensionLevel()
//     };
//   }
// }

// /**
//  * シーン抽出ステップ
//  * 章内のシーンを抽出します
//  */
// export class SceneExtractionStep implements AnalysisStep<Chapter, any> {
//   readonly name = 'sceneExtraction';
//   readonly timeout = 20000;
  
//   constructor(private analysisService: ChapterAnalysisService) {}
  
//   async execute(chapter: Chapter, context: PipelineContext): Promise<any> {
//     logger.debug(`Extracting scenes for chapter ${chapter.chapterNumber}`);
    
//     // シーン抽出
//     const scenes = await this.analysisService.getScenes(chapter.content, chapter.chapterNumber);
    
//     return {
//       scenes
//     };
//   }
// }

// /**
//  * 品質メトリクス集約ステップ
//  * 各分析結果から品質メトリクスを集約します
//  */
// export class QualityMetricsAggregationStep implements AnalysisStep<any, any> {
//   readonly name = 'qualityMetricsAggregation';
//   readonly timeout = 10000;
  
//   async execute(input: any, context: PipelineContext): Promise<any> {
//     logger.debug(`Aggregating quality metrics for chapter ${context.chapter.chapterNumber}`);
    
//     // 中間結果から品質メトリクスを集約
//     const basicAnalysis = context.intermediateResults.basicAnalysis || {};
//     const styleAnalysis = context.intermediateResults.styleAnalysis || {};
    
//     // 基本メトリクス
//     const baseMetrics = basicAnalysis.qualityMetrics || {
//       readability: 0.7,
//       consistency: 0.7,
//       engagement: 0.7,
//       characterDepiction: 0.7,
//       originality: 0.7,
//       overall: 0.7
//     };
    
//     // スタイルメトリクス
//     const styleMetrics = styleAnalysis.qualityMetrics || {};
    
//     // メトリクスの統合
//     const combinedMetrics = {
//       ...baseMetrics,
//       ...styleMetrics
//     };
    
//     // 総合スコアの再計算
//     const metricValues = Object.values(combinedMetrics).filter(v => typeof v === 'number' && v !== combinedMetrics.overall);
//     const overall = metricValues.length > 0
//       ? metricValues.reduce((sum, val) => sum + (val as number), 0) / metricValues.length
//       : 0.7;
    
//     return {
//       qualityMetrics: {
//         ...combinedMetrics,
//         overall
//       }
//     };
//   }
  
//   shouldRun(context: PipelineContext): boolean {
//     // 基本分析またはスタイル分析のいずれかが完了していることを確認
//     return !!(context.intermediateResults.basicAnalysis || context.intermediateResults.styleAnalysis);
//   }
// }

// /**
//  * 読者体験分析ステップ
//  * 章の読者体験を分析し、改善提案を生成します
//  */
// export class ReaderExperienceStep implements AnalysisStep<Chapter, any> {
//   readonly name = 'readerExperience';
//   readonly timeout = 30000;
  
//   constructor(private analysisService: ChapterAnalysisService) {}
  
//   async execute(chapter: Chapter, context: PipelineContext): Promise<any> {
//     logger.debug(`Analyzing reader experience for chapter ${chapter.chapterNumber}`);
    
//     // 基本分析がすでに実行されている場合はその結果を利用
//     const baseAnalysis = context.intermediateResults.basicAnalysis;
    
//     if (baseAnalysis && baseAnalysis.qualityMetrics) {
//       // 読者体験に関する改善提案を生成
//       const readerExperience = {
//         engagementLevel: baseAnalysis.qualityMetrics.engagement || 0.7,
//         paceAssessment: this.assessPace(baseAnalysis),
//         emotionalImpact: this.assessEmotionalImpact(baseAnalysis),
//         readabilityLevel: baseAnalysis.qualityMetrics.readability || 0.7,
//         improvementSuggestions: this.generateReaderExperienceImprovements(baseAnalysis)
//       };
      
//       return { readerExperience };
//     }
    
//     // 基本分析結果がない場合は独自に分析
//     const qualityMetrics = await this.analysisService.getQualityMetrics(
//       chapter.content,
//       chapter.chapterNumber,
//       context.generationContext || {}
//     );
    
//     const readerExperience = {
//       engagementLevel: qualityMetrics.engagement || 0.7,
//       paceAssessment: 'バランスが取れた',
//       emotionalImpact: 'やや弱い',
//       readabilityLevel: qualityMetrics.readability || 0.7,
//       improvementSuggestions: [
//         '読者の感情的な反応を引き出す描写を強化する',
//         '読みやすさを改善するため、複雑な文構造を簡略化する',
//         'テンポの変化をつけて退屈さを防ぐ'
//       ]
//     };
    
//     return { readerExperience };
//   }
  
//   private assessPace(analysis: any): string {
//     // 分析結果からペースを評価するロジック
//     const engagement = analysis.qualityMetrics?.engagement || 0.5;
    
//     if (engagement < 0.4) return '遅すぎる';
//     if (engagement < 0.6) return 'バランスが取れた';
//     return '適度に速い';
//   }
  
//   private assessEmotionalImpact(analysis: any): string {
//     // 分析結果から感情的インパクトを評価するロジック
//     const characterDepiction = analysis.qualityMetrics?.characterDepiction || 0.5;
    
//     if (characterDepiction < 0.4) return '弱い';
//     if (characterDepiction < 0.7) return 'やや弱い';
//     if (characterDepiction < 0.9) return '強い';
//     return '非常に強い';
//   }
  
//   private generateReaderExperienceImprovements(analysis: any): string[] {
//     // 分析結果から読者体験の改善提案を生成するロジック
//     const suggestions: string[] = [];
//     const metrics = analysis.qualityMetrics || {};
    
//     if (metrics.readability < 0.6) {
//       suggestions.push('文の長さに変化をつけ、長文を短く分割して読みやすさを向上させる');
//     }
    
//     if (metrics.engagement < 0.6) {
//       suggestions.push('読者の興味を引く意外性のある展開や対話を追加する');
//     }
    
//     if (metrics.characterDepiction < 0.6) {
//       suggestions.push('キャラクターの感情や内面描写を豊かにして読者の感情移入を促す');
//     }
    
//     if (metrics.originality < 0.6) {
//       suggestions.push('より独自性のある表現や視点を取り入れて新鮮さを加える');
//     }
    
//     if (suggestions.length === 0) {
//       suggestions.push('現在の良い点を維持しながら、さらなる読者の感情的な反応を引き出す描写を加える');
//     }
    
//     return suggestions;
//   }
// }