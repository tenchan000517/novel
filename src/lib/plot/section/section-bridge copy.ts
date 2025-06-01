// src/lib/plot/section/section-bridge.ts
/**
 * @fileoverview 中期プロット（篇）と他システムとの橋渡しを行うクラス
 * @description
 * 他のシステムコンポーネントとの連携を担当し、
 * 章生成コンテキストに篇情報を統合します。
 */

import { logger } from '@/lib/utils/logger';
import { MemoryManager } from '@/lib/memory/manager';
import { SectionPlotManager } from './section-plot-manager';
import { GenerationContext } from '@/types/generation';
import { SectionPlot } from './types';
import { NarrativeState } from '@/lib/memory/types';

interface ChapterData {
    chapter: {
      chapterNumber: number;
      title: string;
      content?: string;
    };
    summary: string;
    // 他に必要なプロパティがあれば追加
  }

/**
 * @class SectionBridge
 * @description 中期プロットと他システムとの橋渡しを行うクラス
 */
export class SectionBridge {
    /**
     * コンストラクタ
     * 
     * @param sectionPlotManager セクションプロットマネージャー
     * @param memoryManager メモリマネージャー
     */
    constructor(
        private sectionPlotManager: SectionPlotManager,
        private memoryManager: MemoryManager
    ) { }

    /**
     * 章生成コンテキストに篇情報を統合
     * 
     * @param chapterNumber 章番号
     * @returns 統合された章生成コンテキスト
     */
    async generateChapterContextWithSection(chapterNumber: number): Promise<GenerationContext> {
        try {
            logger.info(`Generating chapter context with section for chapter ${chapterNumber}`);

            // 基本的な章生成コンテキストを作成
            const baseContext = await this.createBaseContext(chapterNumber);

            // 該当する篇を取得
            const section = await this.sectionPlotManager.getSectionByChapter(chapterNumber);
            if (!section) {
                logger.info(`No section found for chapter ${chapterNumber}, returning base context`);
                return baseContext;
            }

            // 篇情報を統合したコンテキストを作成
            const enhancedContext = this.enhanceContextWithSection(baseContext, section, chapterNumber);

            logger.info(`Successfully generated context with section for chapter ${chapterNumber}`);
            return enhancedContext;
        } catch (error) {
            logger.error(`Failed to generate context with section for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー時は基本コンテキストを返す
            return this.createBaseContext(chapterNumber);
        }
    }

    /**
     * 基本的な章生成コンテキストを作成
     * 
     * @param chapterNumber 章番号
     * @returns 基本的な章生成コンテキスト
     */
    private async createBaseContext(chapterNumber: number): Promise<GenerationContext> {
        try {
            // 短期記憶からの情報取得
            const shortTermMemory = this.memoryManager.getShortTermMemory();
            const previousChapters = await shortTermMemory.getRecentChapters(3);

            // 現在の章の前の章を取得
            const previousChapter = await shortTermMemory.getChapter(chapterNumber - 1);

            // 記憶システムから状態を取得
            const narrativeState = await this.memoryManager.getNarrativeState(chapterNumber);

            // 世界知識から関連コンテキストを取得
            const worldKnowledge = this.memoryManager.getLongTermMemory();
            const worldContext = await worldKnowledge.getRelevantContext(chapterNumber);

            // 基本コンテキストを構築
            return {
                chapterNumber,
                previousChapterContent: previousChapter ? previousChapter.content : '',
                previousChapterTitle: previousChapter ? previousChapter.title : '',
                recentChapters: previousChapters.map((c: ChapterData) => ({
                    number: c.chapter.chapterNumber,
                    title: c.chapter.title,
                    summary: c.summary || ''
                  })),
                narrativeState: {
                    state: narrativeState.state,
                    location: narrativeState.location || '',
                    // 修正: presentCharacters プロパティ名を使用する
                    presentCharacters: narrativeState.presentCharacters || [],
                    // currentCharacters は削除
                    tensionLevel: narrativeState.tensionLevel || 5
                },
                worldContext,
                themeContext: '',
                additionalContext: {},
                // 空の篇情報
                sectionContext: null
            };
        } catch (error) {
            logger.error(`Failed to create base context for chapter ${chapterNumber}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // エラー時は最小限のコンテキストを返す
            return {
                chapterNumber,
                previousChapterContent: '',
                previousChapterTitle: '',
                recentChapters: [],
                narrativeState: {
                    // 修正: 'UNKNOWN'の代わりに有効な列挙型の値を使用
                    state: NarrativeState.INTRODUCTION, // 例：INTRODUCTION を使用
                    location: '',
                    // 修正: presentCharacters プロパティ名を使用する
                    presentCharacters: [],
                    // currentCharacters は削除
                    tensionLevel: 5
                },
                worldContext: '',
                themeContext: '',
                additionalContext: {},
                sectionContext: null
            };
        }
    }


    /**
     * 篇情報を統合したコンテキストを作成
     * 
     * @param baseContext 基本コンテキスト
     * @param section セクション情報
     * @param chapterNumber 章番号
     * @returns 統合されたコンテキスト
     */
    private enhanceContextWithSection(
        baseContext: GenerationContext,
        section: SectionPlot,
        chapterNumber: number
    ): GenerationContext {
        // セクション内での相対位置を計算 (0-1)
        const { start, end } = section.chapterRange;
        const relativePosition = (chapterNumber - start) / (end - start || 1);

        // 重要なシーンやターニングポイントを特定
        const keyScenes = this.findRelevantKeyScenes(section, relativePosition);
        const turningPoints = this.findRelevantTurningPoints(section, relativePosition);

        // 感情アークの情報を取得
        const emotionalInfo = this.getEmotionalArcInfo(section, relativePosition);

        // 学習関連の情報を取得
        const learningInfo = this.getLearningInfo(section);

        // 章の位置づけ特定（導入、中盤、結末）
        const chapterPosition = this.determineChapterPosition(relativePosition);

        // 篇コンテキストを構築
        const sectionContext = {
            id: section.id,
            title: section.structure.title,
            theme: section.structure.theme,
            narrativePhase: section.structure.narrativePhase,
            chapterPosition,
            relativePosition,
            motifs: section.structure.motifs,

            // 感情設計
            emotionalTone: emotionalInfo.currentTone,
            emotionalArc: emotionalInfo.arc,
            emotionalJourney: section.emotionalDesign.readerEmotionalJourney,

            // 学習設計
            mainConcept: learningInfo.mainConcept,
            learningStage: learningInfo.primaryLearningStage,
            learningObjectives: learningInfo.objectives,

            // 構造設計
            keyScenes,
            turningPoints,
            sectionThreads: section.narrativeStructureDesign.narrativeThreads.map(t => t.thread),

            // キャラクター設計
            mainCharacters: section.characterDesign.mainCharacters
        };

        // テーマコンテキストを構築
        const themeContext = this.buildThemeContext(section);

        // 統合したコンテキストを返す
        return {
            ...baseContext,
            theme: themeContext, // themeContextの代わりにthemeに代入
            sectionContext,
            additionalContext: {
                ...(baseContext.additionalContext || {}),
                motifs: section.structure.motifs,
                characterRoles: section.characterDesign.characterRoles
            }
        };
    }

    /**
     * 関連する重要シーンを見つける
     * 
     * @param section セクション情報
     * @param relativePosition 相対位置
     * @returns 関連する重要シーン
     */
    private findRelevantKeyScenes(section: SectionPlot, relativePosition: number): any[] {
        const keyScenes = section.narrativeStructureDesign.keyScenes || [];

        // 距離が0.2以内の重要シーンを見つける
        return keyScenes
            .filter(scene => Math.abs(scene.relativePosition - relativePosition) <= 0.2)
            .map(scene => ({
                description: scene.description,
                purpose: scene.purpose,
                learningConnection: scene.learningConnection
            }));
    }

    /**
     * 関連するターニングポイントを見つける
     * 
     * @param section セクション情報
     * @param relativePosition 相対位置
     * @returns 関連するターニングポイント
     */
    private findRelevantTurningPoints(section: SectionPlot, relativePosition: number): any[] {
        const turningPoints = section.narrativeStructureDesign.turningPoints || [];

        // 距離が0.15以内のターニングポイントを見つける
        return turningPoints
            .filter(tp => Math.abs(tp.relativePosition - relativePosition) <= 0.15)
            .map(tp => ({
                description: tp.description,
                impact: tp.impact
            }));
    }

    /**
     * 感情アークの情報を取得
     * 
     * @param section セクション情報
     * @param relativePosition 相対位置
     * @returns 感情アークの情報
     */
    private getEmotionalArcInfo(section: SectionPlot, relativePosition: number): any {
        const emotionalArc = section.emotionalDesign.emotionalArc;

        // 現在の感情トーンを決定
        let currentTone: string;
        if (relativePosition < 0.33) {
            currentTone = emotionalArc.opening;
        } else if (relativePosition < 0.66) {
            currentTone = emotionalArc.midpoint;
        } else {
            currentTone = emotionalArc.conclusion;
        }

        // 緊張ポイントを確認
        const tensionPoints = section.emotionalDesign.tensionPoints || [];
        const nearbyTensionPoint = tensionPoints.find(tp =>
            Math.abs(tp.relativePosition - relativePosition) <= 0.1
        );

        // カタルシスを確認
        const catharsis = section.emotionalDesign.catharticMoment;
        const isNearCatharsis = catharsis &&
            Math.abs(catharsis.relativePosition - relativePosition) <= 0.1;

        return {
            currentTone,
            arc: {
                opening: emotionalArc.opening,
                midpoint: emotionalArc.midpoint,
                conclusion: emotionalArc.conclusion
            },
            tensionPoint: nearbyTensionPoint,
            isNearCatharsis,
            catharsis: isNearCatharsis ? catharsis : null
        };
    }

    /**
     * 学習関連の情報を取得
     * 
     * @param section セクション情報
     * @returns 学習関連の情報
     */
    private getLearningInfo(section: SectionPlot): any {
        const learning = section.learningJourneyDesign;

        return {
            mainConcept: learning.mainConcept,
            secondaryConcepts: learning.secondaryConcepts,
            primaryLearningStage: learning.primaryLearningStage,
            secondaryLearningStages: learning.secondaryLearningStages,
            objectives: learning.learningObjectives,
            transformationalArc: {
                startingState: learning.transformationalArc.startingState,
                endState: learning.transformationalArc.endState
            },
            conceptEmbodiments: learning.conceptEmbodiments
        };
    }

    /**
     * 章の位置づけを決定
     * 
     * @param relativePosition 相対位置
     * @returns 章の位置づけ
     */
    private determineChapterPosition(relativePosition: number): string {
        if (relativePosition < 0.25) {
            return 'OPENING';
        } else if (relativePosition < 0.75) {
            return 'MIDDLE';
        } else {
            return 'CONCLUSION';
        }
    }

    /**
     * テーマコンテキストを構築
     * 
     * @param section セクション情報
     * @returns テーマコンテキスト
     */
    private buildThemeContext(section: SectionPlot): string {
        const structure = section.structure;
        const learning = section.learningJourneyDesign;
        const emotion = section.emotionalDesign;

        return `
## 「${structure.title}」のテーマと学習目標

### テーマ
${structure.theme}

### 中心概念
${learning.mainConcept}

### モチーフ
${structure.motifs.join(', ')}

### 学習目標
- 認知的目標: ${learning.learningObjectives.cognitive}
- 感情的目標: ${learning.learningObjectives.affective}
- 行動的目標: ${learning.learningObjectives.behavioral}

### 感情的旅路
${emotion.readerEmotionalJourney}

### 期待される感情的リターン
${emotion.emotionalPayoff}
`.trim();
    }
}