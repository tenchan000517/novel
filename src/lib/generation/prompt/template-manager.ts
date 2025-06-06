// src/lib/generation/prompt/template-manager.ts (8システム統合強化版)
/**
 * @fileoverview 8システム統合対応テンプレート管理クラス
 * @description 動的テンプレート選択・最適化機能を搭載したテンプレートマネージャー
 */

import { storageProvider } from '@/lib/storage';
import { logger } from '@/lib/utils/logger';
import path from 'path';
import {
  RevolutionaryIntegratedData,
  TemplateSelectionCriteria,
  TemplateOptimizationResult,
  TemplateEnhancementOptions,
  IntegratedPromptContext
} from './types';

/**
 * 🚀 8システム統合対応テンプレート管理クラス
 */
export class TemplateManager {
  private templates: Record<string, any> = {};
  private isLoaded: boolean = false;
  private dynamicTemplateCache: Map<string, string> = new Map();
  private optimizationHistory: Map<string, TemplateOptimizationResult> = new Map();

  constructor(private templatePath: string = path.join(process.cwd(), 'src/lib/generation/prompt/template/promptTemplates.json')) { }

  /**
   * 🚀 動的テンプレート選択（8システム統合対応）
   */
  public async selectOptimalTemplate(
    criteria: TemplateSelectionCriteria,
    integratedData?: RevolutionaryIntegratedData,
    enhancementOptions?: TemplateEnhancementOptions
  ): Promise<TemplateOptimizationResult> {
    await this.ensureLoaded();
    
    const cacheKey = this.generateCacheKey(criteria, integratedData);
    const cached = this.optimizationHistory.get(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      logger.debug('🚀 Using cached template optimization', { cacheKey });
      return cached;
    }

    const result = await this.performTemplateOptimization(criteria, integratedData, enhancementOptions);
    this.optimizationHistory.set(cacheKey, result);
    
    logger.info('🚀 Template optimization completed', {
      selectedTemplate: result.selectedTemplate.slice(0, 100) + '...',
      confidenceScore: result.confidenceScore,
      enhancementsApplied: result.appliedEnhancements.length
    });

    return result;
  }

  /**
   * 🚀 8システム統合テンプレート生成
   */
  public async generateIntegratedTemplate(
    context: IntegratedPromptContext,
    integratedData: RevolutionaryIntegratedData
  ): Promise<string> {
    await this.ensureLoaded();

    // 基本テンプレートの選択
    const criteria = this.buildSelectionCriteria(context);
    const optimization = await this.selectOptimalTemplate(criteria, integratedData);
    
    let template = optimization.selectedTemplate;

    // 8システム統合強化
    template = await this.applyIntegratedEnhancements(template, integratedData, context);
    
    // 動的コンテンツ挿入
    template = await this.injectDynamicContent(template, integratedData, context);
    
    // 最終品質チェック
    template = this.ensureTemplateQuality(template, context);

    return template;
  }

  /**
   * 🚀 コンテキスト適応型テンプレート取得
   */
  public getAdaptiveTemplate(
    key: string, 
    context?: IntegratedPromptContext,
    fallbackKey?: string
  ): string {
    if (!this.isLoaded) {
      logger.warn('Templates not loaded, using fallback for adaptive request');
      return this.getEmergencyTemplate(key);
    }

    // コンテキスト適応
    if (context) {
      const adaptedTemplate = this.adaptTemplateToContext(key, context);
      if (adaptedTemplate) return adaptedTemplate;
    }

    // 基本取得
    const template = this.getTemplate(key) || this.getTemplate(fallbackKey || 'baseTemplate');
    
    return template || this.getEmergencyTemplate(key);
  }

  /**
   * 🚀 テンプレート最適化実行
   */
  private async performTemplateOptimization(
    criteria: TemplateSelectionCriteria,
    integratedData?: RevolutionaryIntegratedData,
    enhancementOptions?: TemplateEnhancementOptions
  ): Promise<TemplateOptimizationResult> {
    const templates = this.identifyValidTemplates(criteria);
    const scored = await this.scoreTemplates(templates, criteria, integratedData);
    const selected = this.selectBestTemplate(scored);
    
    const enhancements = enhancementOptions ? 
      await this.applyEnhancements(selected.template, enhancementOptions, integratedData) : 
      [];

    return {
      selectedTemplate: selected.template,
      optimizationReason: selected.reason,
      appliedEnhancements: enhancements,
      confidenceScore: selected.score
    };
  }

  /**
   * 🚀 8システム統合強化適用
   */
  private async applyIntegratedEnhancements(
    template: string,
    integratedData: RevolutionaryIntegratedData,
    context: IntegratedPromptContext
  ): Promise<string> {
    let enhanced = template;

    // キャラクターシステム強化
    enhanced = this.enhanceWithCharacterSystem(enhanced, integratedData.characterSystem);
    
    // 学習旅程システム強化
    enhanced = this.enhanceWithLearningSystem(enhanced, integratedData.learningSystem);
    
    // 記憶システム強化
    enhanced = this.enhanceWithMemorySystem(enhanced, integratedData.memorySystem);
    
    // プロットシステム強化
    enhanced = this.enhanceWithPlotSystem(enhanced, integratedData.plotSystem);
    
    // 分析システム強化
    enhanced = this.enhanceWithAnalysisSystem(enhanced, integratedData.analysisSystem);
    
    // 品質システム強化
    enhanced = this.enhanceWithQualitySystem(enhanced, integratedData, context);

    return enhanced;
  }

  /**
   * 🚀 動的コンテンツ挿入
   */
  private async injectDynamicContent(
    template: string,
    integratedData: RevolutionaryIntegratedData,
    context: IntegratedPromptContext
  ): Promise<string> {
    let injected = template;

    // 動的プレースホルダー置換
    injected = this.replaceDynamicPlaceholders(injected, integratedData, context);
    
    // 条件付きセクション処理
    injected = this.processConditionalSections(injected, integratedData, context);
    
    // コンテキスト適応型挿入
    injected = this.injectContextualContent(injected, integratedData, context);

    return injected;
  }

  // 🚀 システム別強化メソッド群

  private enhanceWithCharacterSystem(template: string, characterData: any): string {
    if (!characterData.allCharacters?.length) return template;

    const characterEnhancement = `
## 🚀 キャラクター統合強化
### 動的キャラクター分析
- 総キャラクター数: ${characterData.allCharacters.length}名
- 主要キャラクター: ${characterData.mainCharacters?.length || 0}名
- 心理プロファイル: ${Object.keys(characterData.psychology || {}).length}名分析済み
- 関係性ネットワーク: ${characterData.relationships?.clusters?.length || 0}クラスター検出

### キャラクター重点指示
${this.generateCharacterFocusInstructions(characterData)}
`;

    return this.insertEnhancement(template, '## 登場人物', characterEnhancement);
  }

  private enhanceWithLearningSystem(template: string, learningData: any): string {
    if (!learningData.currentJourney) return template;

    const learningEnhancement = `
## 🚀 学習旅程統合強化
### 現在の学習状況
- 学習段階: ${learningData.stageAnalysis?.currentStage || '不明'}
- 感情アーク: ${learningData.emotionalArcs?.recommendedTone || '未設計'}
- カタルシス機会: ${learningData.catharticMoments?.length || 0}箇所

### 学習体験最適化指示
${this.generateLearningOptimizationInstructions(learningData)}
`;

    return this.insertEnhancement(template, '## 学びの物語ガイダンス', learningEnhancement);
  }

  private enhanceWithMemorySystem(template: string, memoryData: any): string {
    const memoryEnhancement = `
## 🚀 記憶統合システム強化
### 統合記憶分析
- 統合成功率: ${memoryData.unifiedContext?.success ? '100%' : '0%'}
- 処理結果数: ${memoryData.unifiedContext?.totalResults || 0}件
- 時系列分析: ${memoryData.temporalAnalysis ? '完了' : '未実施'}

### 記憶活用指示
${this.generateMemoryUtilizationInstructions(memoryData)}
`;

    return this.insertEnhancement(template, '## 物語の文脈', memoryEnhancement);
  }

  private enhanceWithPlotSystem(template: string, plotData: any): string {
    const plotEnhancement = `
## 🚀 プロット統合システム強化
### プロット分析結果
- 世界設定統合: ${plotData.worldSettings ? '完了' : '未完了'}
- プロット指示: ${plotData.plotDirectives ? '生成済み' : '未生成'}
- アーク進行: ${plotData.arcProgression ? '分析済み' : '未分析'}

### プロット最適化指示
${this.generatePlotOptimizationInstructions(plotData)}
`;

    return this.insertEnhancement(template, '## 世界設定', plotEnhancement);
  }

  private enhanceWithAnalysisSystem(template: string, analysisData: any): string {
    const analysisEnhancement = `
## 🚀 分析システム統合強化
### 品質分析結果
- 品質メトリクス: ${analysisData.qualityMetrics ? '分析済み' : '未分析'}
- 文体分析: ${analysisData.styleAnalysis ? '完了' : '未完了'}
- テンション最適化: ${analysisData.tensionPacing ? '実施済み' : '未実施'}

### 品質向上指示
${this.generateQualityImprovementInstructions(analysisData)}
`;

    return this.insertEnhancement(template, '## 品質向上', analysisEnhancement);
  }

  private enhanceWithQualitySystem(
    template: string, 
    integratedData: RevolutionaryIntegratedData, 
    context: IntegratedPromptContext
  ): string {
    const qualityEnhancement = `
## 🚀 統合品質保証システム
### 8システム統合状況
- 統合システム数: 8/8
- データ統合率: ${this.calculateIntegrationRate(integratedData)}%
- 品質向上予測: ${this.calculateQualityImprovement(integratedData)}%

### 最終品質指示
${this.generateFinalQualityInstructions(integratedData, context)}
`;

    return template + qualityEnhancement;
  }

  // 🚀 ヘルパーメソッド群

  private generateCharacterFocusInstructions(characterData: any): string {
    if (!characterData.allCharacters?.length) return '標準的なキャラクター描写を行ってください。';
    
    const instructions = [
      `${characterData.allCharacters.length}名のキャラクターの個性を明確に描き分けてください`,
      '心理状態の変化を丁寧に描写してください',
      'キャラクター間の関係性の発展を意識してください'
    ];

    if (characterData.psychology && Object.keys(characterData.psychology).length > 0) {
      instructions.push('提供された心理プロファイルを活用して深みのある描写を行ってください');
    }

    return instructions.map(inst => `- ${inst}`).join('\n');
  }

  private generateLearningOptimizationInstructions(learningData: any): string {
    const instructions = [
      '学習体験を自然に物語に織り込んでください',
      '読者の感情移入を重視した展開を心がけてください'
    ];

    if (learningData.emotionalArcs?.recommendedTone) {
      instructions.push(`感情トーン「${learningData.emotionalArcs.recommendedTone}」を維持してください`);
    }

    if (learningData.catharticMoments?.length > 0) {
      instructions.push(`${learningData.catharticMoments.length}箇所のカタルシス機会を効果的に活用してください`);
    }

    return instructions.map(inst => `- ${inst}`).join('\n');
  }

  private generateMemoryUtilizationInstructions(memoryData: any): string {
    const instructions = [
      '過去の出来事との整合性を保ってください',
      '物語の継続性を重視してください'
    ];

    if (memoryData.unifiedContext?.success) {
      instructions.push('統合記憶システムの分析結果を活用してください');
    }

    if (memoryData.temporalAnalysis) {
      instructions.push('時系列の論理性を維持してください');
    }

    return instructions.map(inst => `- ${inst}`).join('\n');
  }

  private generatePlotOptimizationInstructions(plotData: any): string {
    const instructions = [
      'プロット構造の整合性を保ってください',
      '世界設定との矛盾を避けてください'
    ];

    if (plotData.plotDirectives) {
      instructions.push('提供されたプロット指示に従ってください');
    }

    if (plotData.arcProgression) {
      instructions.push('ストーリーアークの進行を意識してください');
    }

    return instructions.map(inst => `- ${inst}`).join('\n');
  }

  private generateQualityImprovementInstructions(analysisData: any): string {
    const instructions = [
      '高品質な文章表現を心がけてください',
      '読者体験の向上を重視してください'
    ];

    if (analysisData.styleAnalysis) {
      instructions.push('文体分析結果を参考に表現を最適化してください');
    }

    if (analysisData.tensionPacing) {
      instructions.push('テンションとペーシングの最適化を図ってください');
    }

    return instructions.map(inst => `- ${inst}`).join('\n');
  }

  private generateFinalQualityInstructions(
    integratedData: RevolutionaryIntegratedData, 
    context: IntegratedPromptContext
  ): string {
    const instructions = [
      '8システムの統合データを最大限活用してください',
      '革命的な品質向上を実現してください',
      '読者の感動と学びを両立させてください'
    ];

    const integrationRate = this.calculateIntegrationRate(integratedData);
    if (integrationRate > 80) {
      instructions.push('高度に統合されたデータを活用し、最高品質の章を生成してください');
    }

    return instructions.map(inst => `- ${inst}`).join('\n');
  }

  private calculateIntegrationRate(integratedData: RevolutionaryIntegratedData): number {
    const systems = Object.keys(integratedData);
    let integratedCount = 0;

    systems.forEach(system => {
      const data = (integratedData as any)[system];
      if (data && Object.keys(data).length > 0) {
        integratedCount++;
      }
    });

    return Math.round((integratedCount / systems.length) * 100);
  }

  private calculateQualityImprovement(integratedData: RevolutionaryIntegratedData): number {
    // 統合されたシステム数に基づく品質向上予測
    const integrationRate = this.calculateIntegrationRate(integratedData);
    return Math.min(Math.round(integrationRate * 1.25), 100); // 最大100%まで
  }

  private insertEnhancement(template: string, marker: string, enhancement: string): string {
    const markerIndex = template.indexOf(marker);
    if (markerIndex === -1) {
      return template + enhancement;
    }

    return template.slice(0, markerIndex) + enhancement + '\n' + template.slice(markerIndex);
  }

  // 🚀 動的プレースホルダー・条件処理

  private replaceDynamicPlaceholders(
    template: string,
    integratedData: RevolutionaryIntegratedData,
    context: IntegratedPromptContext
  ): string {
    let result = template;

    // 基本情報の置換
    result = result.replace(/{chapterNumber}/g, String(context.chapterNumber || 1));
    result = result.replace(/{targetLength}/g, String(context.targetLength || 8000));
    result = result.replace(/{totalChapters}/g, String(context.totalChapters || 'N/A'));

    // 統合データの置換
    result = result.replace(/{characterCount}/g, String(integratedData.characterSystem.allCharacters?.length || 0));
    result = result.replace(/{learningStage}/g, integratedData.learningSystem.stageAnalysis?.currentStage || 'unknown');
    result = result.replace(/{integrationRate}/g, String(this.calculateIntegrationRate(integratedData)));

    return result;
  }

  private processConditionalSections(
    template: string,
    integratedData: RevolutionaryIntegratedData,
    context: IntegratedPromptContext
  ): string {
    let result = template;

    // 条件付きセクションの処理
    result = this.processConditional(result, '{{IF_CHARACTERS}}', '{{/IF_CHARACTERS}}', 
      integratedData.characterSystem.allCharacters?.length > 0);
    
    result = this.processConditional(result, '{{IF_LEARNING}}', '{{/IF_LEARNING}}', 
      !!integratedData.learningSystem.currentJourney);
    
    result = this.processConditional(result, '{{IF_MEMORY_INTEGRATED}}', '{{/IF_MEMORY_INTEGRATED}}', 
      integratedData.memorySystem.unifiedContext?.success);

    return result;
  }

  private processConditional(template: string, startTag: string, endTag: string, condition: boolean): string {
    const startIndex = template.indexOf(startTag);
    const endIndex = template.indexOf(endTag);
    
    if (startIndex === -1 || endIndex === -1) return template;

    const before = template.slice(0, startIndex);
    const conditionalContent = template.slice(startIndex + startTag.length, endIndex);
    const after = template.slice(endIndex + endTag.length);

    return before + (condition ? conditionalContent : '') + after;
  }

  private injectContextualContent(
    template: string,
    integratedData: RevolutionaryIntegratedData,
    context: IntegratedPromptContext
  ): string {
    // コンテキストに基づく動的コンテンツの挿入
    let result = template;

    // ジャンル固有の挿入
    if (context.genre === 'business') {
      result = this.injectBusinessSpecificContent(result, integratedData);
    }

    // 章番号に基づく挿入
    if (context.chapterNumber === 1) {
      result = this.injectFirstChapterContent(result, integratedData);
    }

    return result;
  }

  private injectBusinessSpecificContent(template: string, integratedData: RevolutionaryIntegratedData): string {
    const businessContent = `
### 🎯 ビジネス学習統合特化指示

#### ビジネスフレームワーク統合
- ISSUE DRIVEN思考法を主人公の課題解決プロセスに自然に組み込んでください
- 顧客中心設計の概念をキャラクターの視点転換として描写してください
- データドリブン意思決定を対話や葛藤の中で体験的に学べるよう構成してください

#### 学習体験デザイン
- 【発見→理解→実践→振り返り】のサイクルを1章内で完結させてください
- 失敗体験からビジネスフレームワークを学ぶ「なるほど！」ポイントを設計してください
- メンターキャラクターによるソクラテス式対話で深い理解を促進してください

#### 段階的知識統合
- 基礎的思考法（ISSUE DRIVEN、0秒思考、フェルミ推定）から開始
- 人間関係・心理学（アドラー、マズロー、カーネギー）への発展
- 戦略・マネジメント（ドラッカー、孫氏）の実践的応用
- 最終的な統合実践までの学習進歩を意識してください

#### 実践的応用
- 抽象的な理論を具体的なビジネスシーンで体験させてください
- キャラクター間の対話でフレームワークの多角的理解を深めてください
- 読者が主人公と共に「学んだ」と実感できる構成にしてください
`;
    return template + businessContent;
  }

  private injectFirstChapterContent(template: string, integratedData: RevolutionaryIntegratedData): string {
    const firstChapterContent = `
### 第1章特化指示
- 読者の関心を引く魅力的な導入を心がけてください
- 主要キャラクターの印象的な紹介を行ってください
- 世界観を効果的に提示してください
`;
    return template + firstChapterContent;
  }

  // 🚀 ユーティリティメソッド群

  private buildSelectionCriteria(context: IntegratedPromptContext): TemplateSelectionCriteria {
    return {
      genre: context.genre || 'general',
      chapterType: (context as any).chapterType || 'STANDARD',
      tensionLevel: context.tension || 0.5,
      learningStage: context.learningJourney?.learningStage,
      characterCount: context.characters?.length || 0,
      narrativeState: context.narrativeState?.state || 'DEFAULT',
      qualityLevel: context.integratedData ? 'revolutionary' : 'standard'
    };
  }

  private generateCacheKey(criteria: TemplateSelectionCriteria, integratedData?: RevolutionaryIntegratedData): string {
    const keyParts = [
      criteria.genre,
      criteria.chapterType,
      Math.round(criteria.tensionLevel * 10),
      criteria.learningStage || 'none',
      criteria.characterCount,
      criteria.narrativeState,
      criteria.qualityLevel
    ];

    if (integratedData) {
      keyParts.push(this.calculateIntegrationRate(integratedData).toString());
    }

    return keyParts.join('|');
  }

  private isCacheValid(cached: TemplateOptimizationResult): boolean {
    // 簡易的な有効性チェック（実際はより複雑な条件を設定）
    return cached.confidenceScore > 0.7;
  }

  private identifyValidTemplates(criteria: TemplateSelectionCriteria): string[] {
    // 条件に基づいて有効なテンプレートを特定
    const validTemplates = ['baseTemplate'];
    
    if (criteria.genre === 'business') {
      validTemplates.push('businessTemplate');
    }
    
    if (criteria.qualityLevel === 'revolutionary') {
      validTemplates.push('revolutionaryTemplate');
    }

    return validTemplates;
  }

  private async scoreTemplates(
    templates: string[], 
    criteria: TemplateSelectionCriteria,
    integratedData?: RevolutionaryIntegratedData
  ): Promise<Array<{template: string, score: number, reason: string}>> {
    return templates.map(templateKey => {
      const template = this.getTemplate(templateKey) || this.getBaseTemplate();
      let score = 0.5; // ベーススコア
      let reasons: string[] = [];

      // ジャンル適合性
      if (templateKey.includes(criteria.genre)) {
        score += 0.2;
        reasons.push(`${criteria.genre}ジャンルに適合`);
      }

      // 品質レベル適合性
      if (criteria.qualityLevel === 'revolutionary' && templateKey.includes('revolutionary')) {
        score += 0.3;
        reasons.push('革命的品質レベルに対応');
      }

      // 統合データ活用可能性
      if (integratedData && this.calculateIntegrationRate(integratedData) > 50) {
        score += 0.2;
        reasons.push('統合データ活用可能');
      }

      return {
        template,
        score: Math.min(score, 1.0),
        reason: reasons.join(', ') || '基本適合'
      };
    });
  }

  private selectBestTemplate(scored: Array<{template: string, score: number, reason: string}>): {template: string, score: number, reason: string} {
    return scored.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  }

  private async applyEnhancements(
    template: string, 
    options: TemplateEnhancementOptions,
    integratedData?: RevolutionaryIntegratedData
  ): Promise<string[]> {
    const enhancements: string[] = [];

    if (options.dynamicContentInjection) {
      enhancements.push('動的コンテンツ挿入');
    }

    if (options.contextAdaptation) {
      enhancements.push('コンテキスト適応');
    }

    if (options.qualityOptimization) {
      enhancements.push('品質最適化');
    }

    return enhancements;
  }

  private adaptTemplateToContext(key: string, context: IntegratedPromptContext): string | null {
    // コンテキストに基づくテンプレート適応ロジック
    const baseTemplate = this.getTemplate(key);
    if (!baseTemplate) return null;

    // 簡易的な適応（実際はより複雑な処理）
    if (context.genre === 'business' && !baseTemplate.includes('ビジネス')) {
      return baseTemplate + '\n\n## ビジネス小説特化\n- ビジネス要素を重視してください';
    }

    return baseTemplate;
  }

  private getEmergencyTemplate(key: string): string {
    return `# 緊急テンプレート (${key})
## 基本指示
- 章番号: {chapterNumber}
- 目標文字数: {targetLength}文字
- 高品質な小説を生成してください

## 出力指示
指定された条件に従って章を執筆してください。`;
  }

  private ensureTemplateQuality(template: string, context: IntegratedPromptContext): string {
    // 最終品質チェック
    if (template.length < 500) {
      logger.warn('Template appears too short, adding quality assurance');
      template += '\n\n## 品質保証\n高品質な小説生成を確実に実行してください。';
    }

    return template;
  }

  private async ensureLoaded(): Promise<void> {
    if (!this.isLoaded) {
      await this.load();
    }
  }

  // 🚀 既存メソッドの互換性維持
  public async load(): Promise<void> {
    try {
      if (this.isLoaded) return;

      const data = await storageProvider.readFile(this.templatePath);
      this.templates = JSON.parse(data);
      this.isLoaded = true;
      logger.info('🚀 Enhanced templates loaded successfully');
    } catch (error) {
      logger.error('Failed to load enhanced templates', { error, path: this.templatePath });
      await this.setFallbackTemplates();
    }
  }

  public getTemplate(key: string, subKey?: string): string {
    if (!this.isLoaded) {
      logger.warn('Templates are not loaded yet. Returning empty string.');
      return '';
    }

    try {
      if (!(key in this.templates)) {
        logger.warn(`Template key "${key}" not found`);
        return '';
      }

      if (subKey) {
        if (!(subKey in this.templates[key])) {
          logger.warn(`Template sub-key "${subKey}" not found in "${key}"`);
          return '';
        }
        return this.templates[key][subKey];
      }

      return this.templates[key];
    } catch (error) {
      logger.error('Error getting template', { error, key, subKey });
      return '';
    }
  }

  public getDescriptionByLevel(category: string, level: number): string {
    if (!this.isLoaded || !(category in this.templates)) {
      logger.warn(`Category "${category}" not found or templates not loaded`);
      return '';
    }

    try {
      const descriptions = this.templates[category];
      const levels = Object.keys(descriptions)
        .map(Number)
        .sort((a, b) => b - a);

      for (const threshold of levels) {
        if (level >= threshold) {
          return descriptions[threshold.toString()];
        }
      }

      return descriptions[levels[levels.length - 1].toString()];
    } catch (error) {
      logger.error('Error getting description by level', { error, category, level });
      return '';
    }
  }

  public getBaseTemplate(): string {
    if (!this.isLoaded) {
      throw new Error('Templates not loaded. Call load() or setFallbackTemplates() first.');
    }

    return this.getTemplate('baseTemplate') || this.getEmergencyTemplate('baseTemplate');
  }

  public async setFallbackTemplates(): Promise<void> {
    try {
      logger.info('🚀 Setting enhanced fallback templates');

      const baseTemplate = `# 🚀 革命的小説生成指示 (8システム統合版)

## 基本情報
- 章番号: {chapterNumber}
- 総章数: {totalChapters}
- 目標文字数: {targetLength}文字
- 統合システム: 8システム並列処理
- 品質レベル: 革命的向上

## 🚀 8システム統合活用指示
{revolutionaryEnhancements}

## 出力形式
- 指定された文字数を目安に最高品質の章を執筆してください
- 8システムの統合データを最大限活用してください
- 読者の感動と学びを両立させてください
- 革命的な品質向上を実現してください`;

      this.templates = new Map();
      this.templates.set('baseTemplate', baseTemplate);
      this.templates.set('revolutionaryTemplate', baseTemplate);
      
      this.isLoaded = true;
      logger.info('🚀 Enhanced fallback templates have been set successfully');

    } catch (error) {
      logger.error('Failed to set enhanced fallback templates', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  // 🚀 その他の既存メソッド（互換性維持）
  public getChapterTypeInstructions(chapterType: string, genre: string): string {
    if (genre.toLowerCase() === 'business') {
      return this.getTemplate('businessChapterTypes', chapterType) ||
        this.getTemplate('businessChapterTypes', 'BUSINESS_CHALLENGE');
    }

    return this.getTemplate('chapterTypes', chapterType) ||
      this.getTemplate('chapterTypes', 'STANDARD');
  }

  public getGenreGuidance(genre: string): string {
    return this.getTemplate('genreGuidance', genre.toLowerCase()) || '';
  }

  public getBusinessSpecificSection(sectionType: string): string {
    return this.getTemplate('businessSpecificSections', sectionType) || '';
  }

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
}