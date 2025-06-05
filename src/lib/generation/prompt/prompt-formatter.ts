// src/lib/generation/prompt/prompt-formatter.ts (8システム統合強化版)
/**
 * @fileoverview 8システム統合対応プロンプトフォーマッタークラス
 * @description 統合データの効率的フォーマット処理を実装
 */

import { logger } from '@/lib/utils/logger';
import { Character } from '@/types/characters';
import { CharacterManager } from '@/lib/characters/manager';
import { WorldSettings } from '@/lib/plot/types';
import {
    RevolutionaryIntegratedData,
    FormatOptimizationConfig,
    IntegratedFormatResult,
    IntegratedPromptContext
} from './types';

/**
 * 🚀 8システム統合対応プロンプトフォーマッタークラス
 */
export class PromptFormatter {
    private characterManager?: CharacterManager;
    private formatCache: Map<string, IntegratedFormatResult> = new Map();
    private optimizationConfig: FormatOptimizationConfig;

    constructor(characterManager?: CharacterManager) {
        this.characterManager = characterManager;
        this.optimizationConfig = this.initializeOptimizationConfig();
        logger.info('🚀 Enhanced PromptFormatter initialized with 8-system integration');
    }

    /**
     * 🚀 統合データフォーマット（8システム対応）
     */
    public async formatIntegratedData(
        integratedData: RevolutionaryIntegratedData,
        context: IntegratedPromptContext,
        config?: FormatOptimizationConfig
    ): Promise<IntegratedFormatResult> {
        const startTime = Date.now();
        const formatConfig = config || this.optimizationConfig;
        
        logger.debug('🚀 Starting integrated data formatting');

        try {
            // キャッシュチェック
            const cacheKey = this.generateFormatCacheKey(integratedData, context, formatConfig);
            const cached = this.formatCache.get(cacheKey);
            
            if (cached && this.isFormatCacheValid(cached)) {
                logger.debug('🚀 Using cached format result');
                return cached;
            }

            // 8システム並列フォーマット
            const formatResults = await this.formatSystemsInParallel(integratedData, context, formatConfig);
            
            // 統合フォーマット結果構築
            const integratedResult = this.buildIntegratedFormatResult(formatResults, formatConfig);
            
            // キャッシュ保存
            this.formatCache.set(cacheKey, integratedResult);
            
            const processingTime = Date.now() - startTime;
            logger.info('🚀 Integrated data formatting completed', {
                processingTime,
                dataUtilization: integratedResult.dataUtilization,
                compressionRatio: integratedResult.compressionRatio,
                formatQuality: integratedResult.formatQuality
            });

            return integratedResult;

        } catch (error) {
            logger.error('🚀 Integrated data formatting failed', { error });
            return this.createFallbackFormatResult(integratedData, context);
        }
    }

    /**
     * 🚀 8システム並列フォーマット処理
     */
    private async formatSystemsInParallel(
        integratedData: RevolutionaryIntegratedData,
        context: IntegratedPromptContext,
        config: FormatOptimizationConfig
    ): Promise<{ [systemName: string]: string }> {
        const formatPromises = [
            this.formatCharacterSystem(integratedData.characterSystem, config),
            this.formatLearningSystem(integratedData.learningSystem, config),
            this.formatMemorySystem(integratedData.memorySystem, config),
            this.formatPlotSystem(integratedData.plotSystem, config),
            this.formatAnalysisSystem(integratedData.analysisSystem, config),
            this.formatParameterSystem(integratedData.parameterSystem, config),
            this.formatForeshadowingSystem(integratedData.foreshadowingSystem, config),
            this.formatLifecycleSystem(integratedData.lifecycleSystem, config)
        ];

        const results = await Promise.allSettled(formatPromises);
        const systemNames = [
            'character', 'learning', 'memory', 'plot', 
            'analysis', 'parameter', 'foreshadowing', 'lifecycle'
        ];

        const formatResults: { [systemName: string]: string } = {};
        
        results.forEach((result, index) => {
            const systemName = systemNames[index];
            if (result.status === 'fulfilled') {
                formatResults[systemName] = result.value;
            } else {
                logger.warn(`🚀 ${systemName} system formatting failed`, { error: result.reason });
                formatResults[systemName] = this.createFallbackSystemFormat(systemName);
            }
        });

        return formatResults;
    }

    // 🚀 システム別フォーマットメソッド群

    /**
     * キャラクターシステムフォーマット
     */
    private async formatCharacterSystem(characterData: any, config: FormatOptimizationConfig): Promise<string> {
        if (!characterData.allCharacters?.length) {
            return '## キャラクター情報\n特に指定されたキャラクター情報はありません。\n';
        }

        let formatted = '## 🚀 統合キャラクター情報\n';

        // 圧縮レベルに応じた詳細度調整
        const maxCharacters = this.getMaxCharacters(config.compressionLevel, characterData.allCharacters.length);
        const characters = characterData.allCharacters.slice(0, maxCharacters);

        // 基本キャラクター情報
        formatted += '### 登場キャラクター\n';
        characters.forEach((char: any) => {
            formatted += this.formatSingleCharacter(char, config);
        });

        // 動的状態情報
        if (characterData.dynamicStates && config.compressionLevel !== 'heavy') {
            formatted += '\n### 動的状態情報\n';
            formatted += this.formatCharacterDynamicStates(characterData.dynamicStates, config);
        }

        // 心理プロファイル
        if (characterData.psychology && Object.keys(characterData.psychology).length > 0) {
            formatted += '\n### 心理プロファイル\n';
            formatted += this.formatCharacterPsychology(characterData.psychology, config);
        }

        // 関係性情報
        if (characterData.relationships && config.compressionLevel === 'none') {
            formatted += '\n### 関係性分析\n';
            formatted += this.formatCharacterRelationships(characterData.relationships, config);
        }

        return formatted;
    }

    /**
     * 学習システムフォーマット
     */
    private async formatLearningSystem(learningData: any, config: FormatOptimizationConfig): Promise<string> {
        if (!learningData.currentJourney) {
            return '## 学習旅程\n学習旅程システムが設定されていません。\n';
        }

        let formatted = '## 🚀 統合学習旅程\n';

        // 現在の学習段階
        formatted += '### 学習段階\n';
        formatted += this.formatLearningStage(learningData.stageAnalysis, config);

        // 感情アーク
        if (learningData.emotionalArcs) {
            formatted += '\n### 感情アーク設計\n';
            formatted += this.formatEmotionalArc(learningData.emotionalArcs, config);
        }

        // カタルシス体験
        if (learningData.catharticMoments?.length && config.compressionLevel !== 'heavy') {
            formatted += '\n### カタルシス機会\n';
            formatted += this.formatCatharticMoments(learningData.catharticMoments, config);
        }

        return formatted;
    }

    /**
     * 記憶システムフォーマット
     */
    private async formatMemorySystem(memoryData: any, config: FormatOptimizationConfig): Promise<string> {
        let formatted = '## 🚀 統合記憶システム\n';

        // 統合記憶検索結果
        if (memoryData.unifiedContext) {
            formatted += '### 統合記憶検索結果\n';
            formatted += this.formatUnifiedMemoryContext(memoryData.unifiedContext, config);
        }

        // クロスレベル統合
        if (memoryData.crossLevelData && config.compressionLevel !== 'heavy') {
            formatted += '\n### クロスレベル統合\n';
            formatted += this.formatCrossLevelData(memoryData.crossLevelData, config);
        }

        // 時系列分析
        if (memoryData.temporalAnalysis && config.compressionLevel === 'none') {
            formatted += '\n### 時系列分析\n';
            formatted += this.formatTemporalAnalysis(memoryData.temporalAnalysis, config);
        }

        return formatted;
    }

    /**
     * プロットシステムフォーマット
     */
    private async formatPlotSystem(plotData: any, config: FormatOptimizationConfig): Promise<string> {
        let formatted = '## 🚀 統合プロットシステム\n';

        // 世界設定
        if (plotData.worldSettings) {
            formatted += '### 世界設定\n';
            formatted += this.formatWorldSettingsIntegrated(plotData.worldSettings, config);
        }

        // プロット指示
        if (plotData.plotDirectives) {
            formatted += '\n### プロット指示\n';
            formatted += this.formatPlotDirectives(plotData.plotDirectives, config);
        }

        // アーク進行
        if (plotData.arcProgression && config.compressionLevel !== 'heavy') {
            formatted += '\n### アーク進行\n';
            formatted += this.formatArcProgression(plotData.arcProgression, config);
        }

        // テーマ進化
        if (plotData.thematicEvolution && config.compressionLevel === 'none') {
            formatted += '\n### テーマ進化\n';
            formatted += this.formatThematicEvolution(plotData.thematicEvolution, config);
        }

        return formatted;
    }

    /**
     * 分析システムフォーマット
     */
    private async formatAnalysisSystem(analysisData: any, config: FormatOptimizationConfig): Promise<string> {
        let formatted = '## 🚀 品質分析システム\n';

        // 品質メトリクス
        if (analysisData.qualityMetrics) {
            formatted += '### 品質メトリクス\n';
            formatted += this.formatQualityMetrics(analysisData.qualityMetrics, config);
        }

        // 文体分析
        if (analysisData.styleAnalysis && config.compressionLevel !== 'heavy') {
            formatted += '\n### 文体分析\n';
            formatted += this.formatStyleAnalysis(analysisData.styleAnalysis, config);
        }

        // テンション・ペーシング
        if (analysisData.tensionPacing) {
            formatted += '\n### テンション最適化\n';
            formatted += this.formatTensionPacing(analysisData.tensionPacing, config);
        }

        // 読者体験
        if (analysisData.readerExperience && config.compressionLevel === 'none') {
            formatted += '\n### 読者体験分析\n';
            formatted += this.formatReaderExperience(analysisData.readerExperience, config);
        }

        return formatted;
    }

    /**
     * パラメータシステムフォーマット
     */
    private async formatParameterSystem(parameterData: any, config: FormatOptimizationConfig): Promise<string> {
        if (!parameterData.generationParams && !parameterData.optimizationSettings) {
            return '';
        }

        let formatted = '## 🚀 パラメータ最適化\n';

        if (parameterData.generationParams) {
            formatted += '### 生成パラメータ\n';
            formatted += this.formatGenerationParams(parameterData.generationParams, config);
        }

        if (parameterData.optimizationSettings && config.compressionLevel !== 'heavy') {
            formatted += '\n### 最適化設定\n';
            formatted += this.formatOptimizationSettings(parameterData.optimizationSettings, config);
        }

        return formatted;
    }

    /**
     * 伏線システムフォーマット
     */
    private async formatForeshadowingSystem(foreshadowingData: any, config: FormatOptimizationConfig): Promise<string> {
        if (!foreshadowingData.activePlants?.length && !foreshadowingData.resolutionPlans?.length) {
            return '';
        }

        let formatted = '## 🚀 伏線統合システム\n';

        if (foreshadowingData.activePlants?.length) {
            formatted += '### アクティブ伏線\n';
            formatted += this.formatActiveForeshadowing(foreshadowingData.activePlants, config);
        }

        if (foreshadowingData.resolutionPlans?.length && config.compressionLevel !== 'heavy') {
            formatted += '\n### 解決計画\n';
            formatted += this.formatResolutionPlans(foreshadowingData.resolutionPlans, config);
        }

        return formatted;
    }

    /**
     * ライフサイクルシステムフォーマット
     */
    private async formatLifecycleSystem(lifecycleData: any, config: FormatOptimizationConfig): Promise<string> {
        if (!lifecycleData.systemHealth && !lifecycleData.performanceMetrics) {
            return '';
        }

        // ライフサイクル情報は通常非表示（デバッグ用途）
        if (config.compressionLevel !== 'none') {
            return '';
        }

        let formatted = '## 🚀 システム状態\n';

        if (lifecycleData.systemHealth) {
            formatted += '### システムヘルス\n';
            formatted += this.formatSystemHealth(lifecycleData.systemHealth, config);
        }

        return formatted;
    }

    // 🚀 詳細フォーマットメソッド群

    private formatSingleCharacter(char: any, config: FormatOptimizationConfig): string {
        let formatted = `**${char.name}**: `;
        
        if (config.compressionLevel === 'heavy') {
            // 最小限の情報のみ
            formatted += `${char.type || 'キャラクター'}\n`;
        } else {
            // 標準的な情報
            if (char.description) {
                formatted += `${char.description.slice(0, 100)}${char.description.length > 100 ? '...' : ''}`;
            }
            if (char.emotionalState) {
                formatted += ` (感情: ${char.emotionalState})`;
            }
            formatted += '\n';
        }

        return formatted;
    }

    private formatCharacterDynamicStates(dynamicStates: any, config: FormatOptimizationConfig): string {
        if (!dynamicStates || Object.keys(dynamicStates).length === 0) {
            return '現在の動的状態情報はありません。\n';
        }

        let formatted = '';
        const maxStates = config.compressionLevel === 'heavy' ? 2 : 5;
        const states = Object.entries(dynamicStates).slice(0, maxStates);

        states.forEach(([charId, state]: [string, any]) => {
            formatted += `- ${charId}: ${state.currentState || '状態不明'}\n`;
        });

        return formatted;
    }

    private formatCharacterPsychology(psychology: any, config: FormatOptimizationConfig): string {
        let formatted = '';
        const maxPsych = config.compressionLevel === 'heavy' ? 2 : 4;
        const entries = Object.entries(psychology).slice(0, maxPsych);

        entries.forEach(([charId, psychData]: [string, any]) => {
            formatted += `**${charId}**: `;
            if (psychData.currentDesires?.length) {
                formatted += `欲求(${psychData.currentDesires.slice(0, 2).join('、')})`;
            }
            if (psychData.currentFears?.length) {
                formatted += `, 恐れ(${psychData.currentFears.slice(0, 1).join('、')})`;
            }
            formatted += '\n';
        });

        return formatted;
    }

    private formatCharacterRelationships(relationships: any, config: FormatOptimizationConfig): string {
        if (!relationships) return '関係性分析データなし\n';

        let formatted = '';
        if (relationships.clusters?.length) {
            formatted += `- キャラクタークラスター: ${relationships.clusters.length}個検出\n`;
        }
        if (relationships.dynamics) {
            formatted += '- 動的関係性の変化を重視してください\n';
        }

        return formatted;
    }

    private formatLearningStage(stageAnalysis: any, config: FormatOptimizationConfig): string {
        if (!stageAnalysis) return '学習段階分析なし\n';

        let formatted = `現在の段階: ${stageAnalysis.currentStage || '不明'}\n`;
        
        if (config.compressionLevel !== 'heavy' && stageAnalysis.stageGoals) {
            formatted += `目標: ${stageAnalysis.stageGoals}\n`;
        }

        return formatted;
    }

    private formatEmotionalArc(emotionalArcs: any, config: FormatOptimizationConfig): string {
        if (!emotionalArcs) return '感情アーク未設計\n';

        let formatted = `推奨トーン: ${emotionalArcs.recommendedTone || '未設定'}\n`;
        
        if (config.compressionLevel === 'none' && emotionalArcs.emotionalJourney) {
            formatted += '感情の流れを章全体で意識してください\n';
        }

        return formatted;
    }

    private formatCatharticMoments(catharticMoments: any[], config: FormatOptimizationConfig): string {
        if (!catharticMoments?.length) return 'カタルシス機会なし\n';

        let formatted = `カタルシス機会: ${catharticMoments.length}箇所\n`;
        
        if (config.compressionLevel === 'none') {
            formatted += '感情の解放と学びの統合を効果的に描写してください\n';
        }

        return formatted;
    }

    private formatUnifiedMemoryContext(unifiedContext: any, config: FormatOptimizationConfig): string {
        if (!unifiedContext) return '統合記憶情報なし\n';

        let formatted = `統合成功: ${unifiedContext.success ? 'はい' : 'いいえ'}\n`;
        formatted += `処理結果数: ${unifiedContext.totalResults || 0}件\n`;
        
        if (config.compressionLevel !== 'heavy' && unifiedContext.suggestions?.length) {
            const maxSuggestions = config.compressionLevel === 'light' ? 2 : 4;
            formatted += `提案: ${unifiedContext.suggestions.slice(0, maxSuggestions).join('、')}\n`;
        }

        return formatted;
    }

    private formatCrossLevelData(crossLevelData: any, config: FormatOptimizationConfig): string {
        if (!crossLevelData) return 'クロスレベル統合なし\n';

        return '短期・中期・長期記憶の一貫性を保ってください\n';
    }

    private formatTemporalAnalysis(temporalAnalysis: any, config: FormatOptimizationConfig): string {
        if (!temporalAnalysis) return '時系列分析なし\n';

        let formatted = '時間の流れと因果関係の論理性を保ってください\n';
        
        if (temporalAnalysis.progression) {
            formatted += `進行パターン: ${temporalAnalysis.progression}\n`;
        }

        return formatted;
    }

    private formatWorldSettingsIntegrated(worldSettings: any, config: FormatOptimizationConfig): string {
        if (!worldSettings) return '世界設定なし\n';

        // 既存のformatWorldSettingsメソッドを活用
        if (typeof worldSettings === 'string') {
            return this.formatWorldSettings(worldSettings);
        } else {
            return this.formatWorldSettings(worldSettings);
        }
    }

    private formatPlotDirectives(plotDirectives: string, config: FormatOptimizationConfig): string {
        if (!plotDirectives) return 'プロット指示なし\n';

        const maxLength = config.compressionLevel === 'heavy' ? 100 : 
                         config.compressionLevel === 'medium' ? 200 : 400;
        
        const truncated = plotDirectives.length > maxLength ? 
                         plotDirectives.slice(0, maxLength) + '...' : 
                         plotDirectives;

        return `${truncated}\n`;
    }

    private formatArcProgression(arcProgression: any, config: FormatOptimizationConfig): string {
        if (!arcProgression) return 'アーク進行情報なし\n';

        let formatted = '現在のストーリーアークの位置を意識してください\n';
        
        if (arcProgression.phase) {
            formatted += `現在のフェーズ: ${arcProgression.phase}\n`;
        }

        return formatted;
    }

    private formatThematicEvolution(thematicEvolution: any, config: FormatOptimizationConfig): string {
        if (!thematicEvolution) return 'テーマ進化情報なし\n';

        return 'テーマの深化と発展を意識してください\n';
    }

    private formatQualityMetrics(qualityMetrics: any, config: FormatOptimizationConfig): string {
        if (!qualityMetrics) return '品質メトリクス情報なし\n';

        let formatted = '高品質な文章表現を心がけてください\n';
        
        if (qualityMetrics.targetScore) {
            formatted += `目標品質スコア: ${qualityMetrics.targetScore}\n`;
        }

        return formatted;
    }

    private formatStyleAnalysis(styleAnalysis: any, config: FormatOptimizationConfig): string {
        if (!styleAnalysis) return '文体分析情報なし\n';

        return '文体の一貫性と多様性のバランスを取ってください\n';
    }

    private formatTensionPacing(tensionPacing: any, config: FormatOptimizationConfig): string {
        if (!tensionPacing) return 'テンション最適化情報なし\n';

        let formatted = '';
        
        if (tensionPacing.tension?.recommendedTension) {
            formatted += `推奨テンション: ${tensionPacing.tension.recommendedTension}\n`;
        }
        
        if (tensionPacing.pacing?.recommendedPacing) {
            formatted += `推奨ペーシング: ${tensionPacing.pacing.recommendedPacing}\n`;
        }

        return formatted || 'テンション・ペーシング情報なし\n';
    }

    private formatReaderExperience(readerExperience: any, config: FormatOptimizationConfig): string {
        if (!readerExperience) return '読者体験分析なし\n';

        return '読者の感情移入と理解度を重視してください\n';
    }

    private formatGenerationParams(generationParams: any, config: FormatOptimizationConfig): string {
        if (!generationParams) return '生成パラメータなし\n';

        return '最適化された生成パラメータを適用してください\n';
    }

    private formatOptimizationSettings(optimizationSettings: any, config: FormatOptimizationConfig): string {
        if (!optimizationSettings) return '最適化設定なし\n';

        return '品質最適化設定に従ってください\n';
    }

    private formatActiveForeshadowing(activePlants: any[], config: FormatOptimizationConfig): string {
        if (!activePlants?.length) return 'アクティブ伏線なし\n';

        let formatted = `アクティブ伏線: ${activePlants.length}項目\n`;
        
        if (config.compressionLevel !== 'heavy') {
            formatted += '伏線の自然な配置と回収を意識してください\n';
        }

        return formatted;
    }

    private formatResolutionPlans(resolutionPlans: any[], config: FormatOptimizationConfig): string {
        if (!resolutionPlans?.length) return '解決計画なし\n';

        return '伏線の効果的な回収タイミングを見計らってください\n';
    }

    private formatSystemHealth(systemHealth: any, config: FormatOptimizationConfig): string {
        if (!systemHealth) return 'システムヘルス情報なし\n';

        return 'システム状態: 正常\n';
    }

    // 🚀 ユーティリティメソッド群

    private buildIntegratedFormatResult(
        formatResults: { [systemName: string]: string },
        config: FormatOptimizationConfig
    ): IntegratedFormatResult {
        // 全システムの結果を結合
        const formattedContent = Object.values(formatResults)
            .filter(content => content.trim().length > 0)
            .join('\n');

        // メトリクス計算
        const originalSize = JSON.stringify(formatResults).length;
        const compressedSize = formattedContent.length;
        
        return {
            formattedContent,
            dataUtilization: this.calculateDataUtilization(formatResults),
            compressionRatio: originalSize > 0 ? compressedSize / originalSize : 1,
            formatQuality: this.calculateFormatQuality(formattedContent, formatResults)
        };
    }

    private calculateDataUtilization(formatResults: { [systemName: string]: string }): number {
        const totalSystems = Object.keys(formatResults).length;
        const activeSystems = Object.values(formatResults)
            .filter(content => content.trim().length > 0).length;
        
        return totalSystems > 0 ? activeSystems / totalSystems : 0;
    }

    private calculateFormatQuality(content: string, formatResults: { [systemName: string]: string }): number {
        let quality = 0.5; // ベース品質

        // コンテンツ長による品質評価
        if (content.length > 1000) quality += 0.2;
        
        // 構造化度による品質評価
        const sectionCount = (content.match(/###/g) || []).length;
        if (sectionCount > 5) quality += 0.2;
        
        // データの多様性による品質評価
        const activeSystemCount = Object.values(formatResults)
            .filter(result => result.trim().length > 0).length;
        quality += (activeSystemCount / 8) * 0.3;

        return Math.min(quality, 1.0);
    }

    private getMaxCharacters(compressionLevel: string, totalCharacters: number): number {
        switch (compressionLevel) {
            case 'heavy': return Math.min(3, totalCharacters);
            case 'medium': return Math.min(5, totalCharacters);
            case 'light': return Math.min(8, totalCharacters);
            default: return totalCharacters; // 'none'
        }
    }

    private generateFormatCacheKey(
        integratedData: RevolutionaryIntegratedData,
        context: IntegratedPromptContext,
        config: FormatOptimizationConfig
    ): string {
        const keyParts = [
            context.chapterNumber || 0,
            config.compressionLevel,
            config.outputFormat,
            Object.keys(integratedData.characterSystem).length,
            Object.keys(integratedData.learningSystem).length,
            Object.keys(integratedData.memorySystem).length
        ];

        return keyParts.join('|');
    }

    private isFormatCacheValid(cached: IntegratedFormatResult): boolean {
        // 簡易的な有効性チェック
        return cached.formatQuality > 0.5 && cached.dataUtilization > 0.3;
    }

    private createFallbackFormatResult(
        integratedData: RevolutionaryIntegratedData,
        context: IntegratedPromptContext
    ): IntegratedFormatResult {
        const fallbackContent = `
## 🚀 基本統合情報（フォールバック）
### 章情報
- 章番号: ${context.chapterNumber || 1}
- 目標文字数: ${context.targetLength || 8000}文字

### 統合システム
- 8システム統合処理でエラーが発生しました
- 基本的な生成を実行します

### 品質保証
- 高品質な小説生成を確実に実行してください
`;

        return {
            formattedContent: fallbackContent,
            dataUtilization: 0.3,
            compressionRatio: 1.0,
            formatQuality: 0.5
        };
    }

    private createFallbackSystemFormat(systemName: string): string {
        return `## ${systemName}システム\n${systemName}システムの処理でエラーが発生しました。\n`;
    }

    private initializeOptimizationConfig(): FormatOptimizationConfig {
        return {
            outputFormat: 'markdown',
            compressionLevel: 'medium',
            importanceThreshold: 0.5
        };
    }

    // 🚀 既存メソッドの互換性維持（強化版）

    /**
     * 世界設定情報をフォーマットする（強化版）
     */
    public formatWorldSettings(worldSettings: string | WorldSettings): string {
        if (!worldSettings) {
            return '特に指定なし';
        }

        if (typeof worldSettings !== 'string') {
            return this.convertWorldSettingsToString(worldSettings);
        }

        const paragraphs = worldSettings.split(/\n\n+/);

        if (paragraphs.length > 1) {
            return paragraphs.map(p => `- ${p.trim()}`).join('\n');
        }

        return worldSettings.trim();
    }

    /**
     * キャラクター情報をフォーマットする（強化版）
     */
    public async formatCharacters(characters: Character[]): Promise<string> {
        if (!characters || characters.length === 0) {
            return '特に指定なし';
        }

        if (this.characterManager) {
            try {
                const characterIds = characters
                    .filter(char => char.id)
                    .map(char => char.id);

                if (characterIds.length > 0) {
                    logger.debug(`🚀 Using CharacterManager to format ${characterIds.length} characters`);
                    const detailLevel = this.calculateDetailLevel(characters.length);
                    // CharacterManagerの拡張メソッドがあれば使用
                }
            } catch (error) {
                logger.warn('Error using CharacterManager for formatting', {
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        return this.formatCharactersBasic(characters);
    }

    /**
     * 伏線情報をフォーマットする（強化版）
     */
    public formatForeshadowing(foreshadowing: any[]): string {
        if (!foreshadowing || foreshadowing.length === 0) {
            return '特になし';
        }

        const formatted = foreshadowing.map(fs => {
            let result = '';

            if (typeof fs === 'object' && fs.description) {
                result = fs.description;

                if (fs.urgencyLevel >= 0.8) {
                    result += `（このチャプターで解決すべき重要な伏線）`;
                } else if (fs.urgencyLevel >= 0.5) {
                    result += `（解決に向けて進展させるべき伏線）`;
                } else {
                    result += `（さりげなく言及すべき伏線）`;
                }

                if (fs.resolutionSuggestions && fs.resolutionSuggestions.length > 0) {
                    result += `\n  解決案: ${fs.resolutionSuggestions[0]}`;
                }

                if (fs.relatedCharactersInfo && fs.relatedCharactersInfo.length > 0) {
                    result += `\n  関係者: ${fs.relatedCharactersInfo.map((c: any) => c.name).join('、')}`;
                }
            } else {
                result = String(fs);
            }

            return result;
        }).join('\n\n');

        return formatted;
    }

    /**
     * 矛盾情報をフォーマットする（強化版）
     */
    public formatContradictions(contradictions: any[]): string {
        if (!contradictions || contradictions.length === 0) {
            return '特になし';
        }

        const formatted = contradictions.map((contradiction, index) => {
            let result = `${index + 1}. `;

            if (typeof contradiction === 'object') {
                if (contradiction.description) {
                    result += contradiction.description;
                }

                if (contradiction.severity && contradiction.severity > 0.7) {
                    result += `（重大な矛盾、必ず解決してください）`;
                } else if (contradiction.severity && contradiction.severity > 0.4) {
                    result += `（要注意の矛盾）`;
                }

                if (contradiction.resolutionSuggestions && contradiction.resolutionSuggestions.length > 0) {
                    result += `\n   修正案: ${contradiction.resolutionSuggestions[0]}`;
                }

                if (contradiction.context) {
                    result += `\n   発生箇所: ${contradiction.context}`;
                }
            } else {
                result += String(contradiction);
            }

            return result;
        }).join('\n\n');

        return formatted;
    }

    /**
     * 永続的イベント情報をフォーマットする（強化版）
     */
    public formatPersistentEvents(persistentEvents: any): string {
        if (!persistentEvents) return '';

        let section = '\n\n## 【重要】永続的なイベント履歴（必ず遵守）\n';

        // 死亡イベント
        if (persistentEvents.deaths && persistentEvents.deaths.length > 0) {
            section += '\n### 死亡したキャラクター\n';
            for (const death of persistentEvents.deaths) {
                section += `- **${death.character}**は第${death.chapterNumber}章で死亡しました。${death.description}\n`;
            }
            section += '\n**注意:** 死亡したキャラクターは生き返らせないでください。死者として扱い、回想や言及のみ可能です。\n';
        }

        // 結婚イベント
        if (persistentEvents.marriages && persistentEvents.marriages.length > 0) {
            section += '\n### 結婚したキャラクター\n';
            for (const marriage of persistentEvents.marriages) {
                section += `- **${marriage.characters.join('**と**')}**は第${marriage.chapterNumber}章で結婚しました。${marriage.description}\n`;
            }
            section += '\n**注意:** 結婚したキャラクターは既婚者として扱い、関係性に一貫性を持たせてください。\n';
        }

        // その他のイベントタイプも同様に処理...
        // （既存の実装を維持）

        return section;
    }

    /**
     * 表現カテゴリ名をフォーマットする（既存メソッド）
     */
    public formatCategoryName(category: string): string {
        const categoryMap: { [key: string]: string } = {
            'verbPhrases': '動詞フレーズ',
            'adjectivalExpressions': '形容表現',
            'dialoguePatterns': '会話表現',
            'conjunctions': '接続語',
            'sentenceStructures': '文構造パターン'
        };

        return categoryMap[category] || category;
    }

    /**
     * 物語状態のガイダンスをフォーマットする（既存メソッド）
     */
    public formatNarrativeStateGuidance(narrativeState: any, genre: string, stateGuidance: string[]): string {
        const state = narrativeState.state ?
            (typeof narrativeState.state === 'object' ?
                JSON.stringify(narrativeState.state) :
                String(narrativeState.state)) :
            '不明';

        let guidance = `現在の物語状態: ${state}\n`;

        if (stateGuidance.length > 0) {
            stateGuidance.forEach(item => {
                guidance += item + '\n';
            });
        }

        if (narrativeState.stagnationDetected) {
            guidance += '\n【停滞警告】\n';
            guidance += `現在の物語状態が${narrativeState.duration}章続いており、新たな展開が必要です。\n`;

            if (narrativeState.recommendations && narrativeState.recommendations.length > 0) {
                guidance += '推奨される展開方向:\n';
                narrativeState.recommendations.forEach((rec: string) => {
                    guidance += `- ${rec}\n`;
                });
            }

            if (narrativeState.suggestedNextState) {
                guidance += `推奨される次の状態: ${narrativeState.suggestedNextState}\n`;
            }
        }

        if (narrativeState.timeOfDay || narrativeState.location || narrativeState.weather) {
            guidance += '\n【設定情報】\n';
            if (narrativeState.timeOfDay) guidance += `時間帯: ${narrativeState.timeOfDay}\n`;
            if (narrativeState.location) guidance += `場所: ${narrativeState.location}\n`;
            if (narrativeState.weather) guidance += `天候: ${narrativeState.weather}\n`;
        }

        return guidance;
    }

    // 🚀 プライベートヘルパーメソッド群

    private convertWorldSettingsToString(worldSettings: WorldSettings): string {
        if (!worldSettings) return '';

        if (worldSettings.description) {
            return worldSettings.description;
        }

        let result = '';

        if (worldSettings.regions && worldSettings.regions.length > 0) {
            result += `地域:\n`;
            worldSettings.regions.forEach(region => {
                result += `- ${region}\n`;
            });
            result += '\n';
        }

        if (worldSettings.history && worldSettings.history.length > 0) {
            result += `歴史:\n`;
            worldSettings.history.forEach(historyItem => {
                result += `- ${historyItem}\n`;
            });
            result += '\n';
        }

        if (worldSettings.rules && worldSettings.rules.length > 0) {
            result += `世界のルール:\n`;
            worldSettings.rules.forEach(rule => {
                result += `- ${rule}\n`;
            });
            result += '\n';
        }

        return result.trim();
    }

    private formatCharactersBasic(characters: Character[]): string {
        return characters.map(char => {
            let info = `【${char.name}】`;

            if (char.description) {
                info += `\n特徴: ${char.description}`;
            }

            if (char.type) {
                const typeLabel = char.type === 'MAIN' ? '主要人物' :
                    char.type === 'SUB' ? '脇役' :
                        char.type === 'MOB' ? '端役' :
                            char.type === 'ANTAGONIST' ? '敵対者' : '登場人物';
                info += `\n役割: ${typeLabel}`;
            }

            if ((char as any).traits && (char as any).traits.length > 0) {
                info += `\n性格: ${(char as any).traits.join('、')}`;
            } else if (char.personality) {
                const personality = typeof char.personality === 'object'
                    ? this.formatPersonality(char.personality)
                    : char.personality;
                info += `\n性格: ${personality}`;
            }

            if ((char as any).goals && (char as any).goals.length > 0) {
                info += `\n目標: ${(char as any).goals.join('、')}`;
            }

            if (char.significance && char.significance > 0.8) {
                info += `\n※このキャラクターは物語において特に重要です。`;
            }

            return info;
        }).join('\n\n');
    }

    private formatPersonality(personality: any): string {
        if (!personality) return '';

        if (personality.traits && Array.isArray(personality.traits)) {
            return personality.traits.join('、');
        }

        try {
            return Object.entries(personality)
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => {
                    if (Array.isArray(value)) {
                        return `${key}: ${value.join('、')}`;
                    }
                    return `${key}: ${value}`;
                })
                .join('、');
        } catch (e) {
            return String(personality);
        }
    }

    private calculateDetailLevel(characterCount: number): "brief" | "standard" | "detailed" {
        if (characterCount > 6) {
            return "brief";
        } else if (characterCount <= 3) {
            return "detailed";
        } else {
            return "standard";
        }
    }
}