// src/lib/learning-journey/prompt-generator.ts

/**
 * @fileoverview プロンプト生成
 * @description
 * 生成エンジン用のプロンプトを作成するコンポーネント。
 * 章生成プロンプト、対話生成プロンプト、内面描写プロンプトを担当する。
 */

import { logger } from '@/lib/utils/logger';
import { EventBus } from './event-bus';
import { StoryContext } from './context-manager';
import { LearningStage } from './concept-learning-manager';
import { EmotionalArcDesign, CatharticExperience, EmpatheticPoint } from './emotional-learning-integrator';
import { SceneRecommendation } from './story-transformation-designer';

/**
 * プロンプトタイプの列挙型
 */
export enum PromptType {
  CHAPTER_GENERATION = 'CHAPTER_GENERATION',
  DIALOGUE_GENERATION = 'DIALOGUE_GENERATION',
  INTERNAL_MONOLOGUE = 'INTERNAL_MONOLOGUE',
  CHARACTER_INTERACTION = 'CHARACTER_INTERACTION',
  SCENE_DESCRIPTION = 'SCENE_DESCRIPTION',
  LEARNING_INSIGHT = 'LEARNING_INSIGHT'
}

/**
 * 章生成プロンプトオプションの型
 */
export interface ChapterGenerationOptions {
  chapterNumber: number;           // 章番号
  suggestedTitle?: string;         // 提案タイトル
  conceptName: string;             // 概念名
  learningStage: LearningStage;    // 学習段階
  sceneRecommendations?: SceneRecommendation[]; // シーン推奨
  emotionalArc?: EmotionalArcDesign;           // 感情アーク
  catharticExperience?: CatharticExperience;   // カタルシス体験
  empatheticPoints?: EmpatheticPoint[];        // 共感ポイント
  previousChapterSummary?: string;             // 前章要約
  relevantMemories?: any[];                    // 関連記憶
  mainCharacters?: string[];                   // 主要キャラクター
  targetLength?: {                             // 目標長さ
    min: number;
    max: number;
  };
}

/**
 * 対話生成プロンプトオプションの型
 */
export interface DialogueGenerationOptions {
  characters: string[];            // キャラクター
  context: string;                 // 文脈
  emotionalStates?: {              // 感情状態
    [character: string]: string;
  };
  learningRelated?: boolean;       // 学習関連かどうか
  conceptName?: string;            // 概念名
  conceptUnderstanding?: {         // 概念理解
    [character: string]: string;
  };
  dialogueGoal?: string;           // 対話目標
  style?: string;                  // スタイル
}

/**
 * @class PromptGenerator
 * @description
 * 生成エンジン用のプロンプトを作成するクラス。
 */
export class PromptGenerator {
  private initialized: boolean = false;
  
  /**
   * コンストラクタ
   * @param eventBus イベントバス
   */
  constructor(
    private eventBus: EventBus
  ) {
    logger.info('PromptGenerator created');
  }
  
  /**
   * 初期化する
   */
  initialize(): void {
    if (this.initialized) {
      logger.info('PromptGenerator already initialized');
      return;
    }
    
    this.initialized = true;
    logger.info('PromptGenerator initialized');
    
    // 初期化完了イベント発行
    this.eventBus.publish('prompt.generator.initialized', {
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * 章生成プロンプトを作成する
   * @param context コンテキスト
   * @param options 生成オプション
   * @returns 生成プロンプト
   */
  generateChapterPrompt(
    context: StoryContext,
    options: ChapterGenerationOptions
  ): string {
    this.ensureInitialized();
    
    try {
      logger.info(`Generating chapter prompt for chapter ${options.chapterNumber}`);
      
      // 章タイトル部分を構築
      const titlePart = options.suggestedTitle ?
        `# 第${options.chapterNumber}章「${options.suggestedTitle}」` :
        `# 第${options.chapterNumber}章`;
      
      // 学習段階の説明を構築
      const learningStageDescription = this.getLearningStageDescription(options.learningStage);
      
      // 前の章の要約部分を構築
      const previousChapterPart = options.previousChapterSummary ?
        `## 前章の要約\n${options.previousChapterSummary}` :
        '';
      
      // 感情アーク部分を構築
      const emotionalArcPart = options.emotionalArc ?
        `## 感情設計\n・全体トーン: ${options.emotionalArc.recommendedTone}\n・感情の変化: 始まり（${this.formatEmotionalDimensions(options.emotionalArc.emotionalJourney.opening)}）→ 展開（${this.formatEmotionalDimensions(options.emotionalArc.emotionalJourney.development)}）→ 結末（${this.formatEmotionalDimensions(options.emotionalArc.emotionalJourney.conclusion)}）` :
        '';
      
      // カタルシス体験部分を構築
      const catharticPart = options.catharticExperience ?
        `## カタルシス体験\n・タイプ: ${this.formatCatharticType(options.catharticExperience.type)}\n・トリガー: ${options.catharticExperience.trigger}\n・ピーク瞬間: ${options.catharticExperience.peakMoment}` :
        '';
      
      // シーン推奨部分を構築
      const sceneRecommendationsPart = options.sceneRecommendations && options.sceneRecommendations.length > 0 ?
        `## シーン設計\n${options.sceneRecommendations.map(rec => `・${rec.description}（${rec.reason}）`).join('\n')}` :
        '';
      
      // 共感ポイント部分を構築
      const empatheticPointsPart = options.empatheticPoints && options.empatheticPoints.length > 0 ?
        `## 共感ポイント\n${options.empatheticPoints.map(point => `・${point.description}（強度: ${Math.round(point.intensity * 10)}/10）`).join('\n')}` :
        '';
      
      // キャラクター部分を構築
      const charactersPart = options.mainCharacters && options.mainCharacters.length > 0 ?
        `## 登場キャラクター\n${options.mainCharacters.join('、')}` :
        '';
      
      // 記憶部分を構築（簡易版）
      const memoriesPart = options.relevantMemories && options.relevantMemories.length > 0 ?
        `## 重要な記憶\n${options.relevantMemories.slice(0, 3).map(memory => `・${memory.content}`).join('\n')}` :
        '';
      
      // 長さ指定部分を構築
      const lengthPart = options.targetLength ?
        `## 長さ指定\n${options.targetLength.min}文字から${options.targetLength.max}文字程度` :
        '';
      
      // プロンプト全体を構築
      const prompt = `
あなたは「魂のこもった学びの物語」を創作するAI執筆者です。
ビジネス小説を通して、感動的な体験とビジネス概念の深い理解を同時に提供してください。

${titlePart}

## 概念と学習段階
・概念名: ${options.conceptName}
・学習段階: ${learningStageDescription}

${previousChapterPart}

${emotionalArcPart}

${catharticPart}

${sceneRecommendationsPart}

${empatheticPointsPart}

${charactersPart}

${memoriesPart}

${lengthPart}

## 重要な執筆ガイドライン
1. **変容と成長**: キャラクターの内面変化を通して読者に共感体験を提供する
2. **体験的学習**: 概念を説明するのではなく、キャラクターの体験を通して読者が自然と学べるようにする
3. **感情の旅**: 指定された感情アークに沿って読者を感情的な旅に連れていく
4. **共感ポイント**: 指定された共感ポイントを効果的に描写し、読者の感情移入を促す
5. **カタルシス**: 学びと感情が統合された瞬間を印象的に描く
6. **自然な対話**: 教科書的な説明ではなく、自然な対話と内面描写で概念を表現する
7. **具体的な場面**: 抽象的な概念を具体的なビジネスシーンで表現する

それでは、第${options.chapterNumber}章の完全な内容を執筆してください。
`;
      
      // イベント発行
      this.eventBus.publish('prompt.generated', {
        type: PromptType.CHAPTER_GENERATION,
        chapterNumber: options.chapterNumber,
        conceptName: options.conceptName,
        learningStage: options.learningStage
      });
      
      logger.info(`Successfully generated chapter prompt for chapter ${options.chapterNumber}`);
      return prompt;
    } catch (error) {
      logger.error(`Failed to generate chapter prompt for chapter ${options.chapterNumber}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      
      // エラー時は簡易プロンプトを返す
      return this.generateSimpleChapterPrompt(options);
    }
  }
  
  /**
   * 対話生成プロンプトを作成する
   * @param options 生成オプション
   * @returns 生成プロンプト
   */
  generateDialoguePrompt(options: DialogueGenerationOptions): string {
    this.ensureInitialized();
    
    try {
      logger.info('Generating dialogue prompt');
      
      // キャラクター部分を構築
      const charactersPart = options.characters.length > 0 ?
        `## 登場キャラクター\n${options.characters.join('、')}` :
        '';
      
      // 感情状態部分を構築
      const emotionalStatesPart = options.emotionalStates ?
        `## 感情状態\n${Object.entries(options.emotionalStates).map(([char, state]) => `・${char}: ${state}`).join('\n')}` :
        '';
      
      // 学習関連部分を構築
      const learningPart = options.learningRelated && options.conceptName ?
        `## 学習要素\n・概念名: ${options.conceptName}\n${options.conceptUnderstanding ? `・概念理解:\n${Object.entries(options.conceptUnderstanding).map(([char, understanding]) => `  - ${char}: ${understanding}`).join('\n')}` : ''}` :
        '';
      
      // 対話目標部分を構築
      const goalPart = options.dialogueGoal ?
        `## 対話目標\n${options.dialogueGoal}` :
        '';
      
      // スタイル部分を構築
      const stylePart = options.style ?
        `## スタイル\n${options.style}` :
        '';
      
      // プロンプト全体を構築
      const prompt = `
あなたは自然で魅力的な対話を生成するAI執筆者です。
以下の条件に基づいて、リアルで感情豊かな対話を生成してください。

## 対話文脈
${options.context}

${charactersPart}

${emotionalStatesPart}

${learningPart}

${goalPart}

${stylePart}

## 対話生成のガイドライン
1. **自然な話し方**: 各キャラクターの個性や状況に合った自然な対話にする
2. **感情の表現**: 指定された感情状態を対話に反映させる
3. **内面と表面**: 本音と建前、言葉と行動の微妙なギャップを表現する
4. **学びの要素**: 学習要素が指定されている場合、それを説教的でなく自然に対話に織り込む
5. **対話の流れ**: 一貫性のある流れを持った対話にする

対話のみを生成してください（地の文は含めないこと）。
`;
      
      // イベント発行
      this.eventBus.publish('prompt.generated', {
        type: PromptType.DIALOGUE_GENERATION,
        characters: options.characters,
        learningRelated: options.learningRelated
      });
      
      logger.info('Successfully generated dialogue prompt');
      return prompt;
    } catch (error) {
      logger.error('Failed to generate dialogue prompt', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      // エラー時は簡易プロンプトを返す
      return `
あなたは自然で魅力的な対話を生成するAI執筆者です。
以下の文脈に基づいて、登場人物間の対話を生成してください。

## 対話文脈
${options.context}

## 登場キャラクター
${options.characters.join('、')}

自然で魅力的な対話のみを生成してください。
`;
    }
  }
  
  /**
   * 内面描写プロンプトを作成する
   * @param character キャラクター名
   * @param context 文脈
   * @param emotionalState 感情状態
   * @param conceptUnderstanding 概念理解状態
   * @returns 生成プロンプト
   */
  generateInternalMonologuePrompt(
    character: string,
    context: string,
    emotionalState?: string,
    conceptUnderstanding?: string
  ): string {
    this.ensureInitialized();
    
    try {
      logger.info(`Generating internal monologue prompt for character ${character}`);
      
      // 感情状態部分を構築
      const emotionalStatePart = emotionalState ?
        `## 感情状態\n${emotionalState}` :
        '';
      
      // 概念理解部分を構築
      const conceptPart = conceptUnderstanding ?
        `## 概念理解\n${conceptUnderstanding}` :
        '';
      
      // プロンプト全体を構築
      const prompt = `
あなたは内面描写の専門家であるAI執筆者です。
以下の条件に基づいて、キャラクターの深い内面モノローグを生成してください。

## キャラクター
${character}

## 文脈
${context}

${emotionalStatePart}

${conceptPart}

## 内面描写のガイドライン
1. **思考の流れ**: 論理的な思考の流れだけでなく、感情的な揺れも表現する
2. **矛盾と葛藤**: 内面の矛盾や葛藤を豊かに表現する
3. **感情の機微**: 微妙な感情の機微や変化を丁寧に描く
4. **思考と感情の融合**: 理性的な思考と感情的な反応の絡み合いを表現する
5. **心理描写の深さ**: 表面的な気持ちだけでなく、深層心理も描写する

キャラクターの内面モノローグのみを生成してください。一人称視点で、心の中の声として表現してください。
`;
      
      // イベント発行
      this.eventBus.publish('prompt.generated', {
        type: PromptType.INTERNAL_MONOLOGUE,
        character
      });
      
      logger.info(`Successfully generated internal monologue prompt for ${character}`);
      return prompt;
    } catch (error) {
      logger.error(`Failed to generate internal monologue prompt for ${character}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      
      // エラー時は簡易プロンプトを返す
      return `
あなたは内面描写の専門家です。
キャラクター「${character}」の以下の文脈における内面モノローグを生成してください。

## 文脈
${context}

キャラクターの内面モノローグを一人称視点で生成してください。
`;
    }
  }
  
  /**
   * 学びの洞察プロンプトを作成する
   * @param conceptName 概念名
   * @param learningStage 学習段階
   * @param situationContext 状況文脈
   * @param characterName キャラクター名
   * @returns 生成プロンプト
   */
  generateLearningInsightPrompt(
    conceptName: string,
    learningStage: LearningStage,
    situationContext: string,
    characterName: string
  ): string {
    this.ensureInitialized();
    
    try {
      logger.info(`Generating learning insight prompt for concept ${conceptName} at stage ${learningStage}`);
      
      // 学習段階の説明を構築
      const learningStageDescription = this.getLearningStageDescription(learningStage);
      
      // プロンプト全体を構築
      const prompt = `
あなたは「魂のこもった学びの物語」を創作するAI執筆者です。
以下の条件に基づいて、キャラクターが重要な学びを得る場面を生成してください。

## 概念と学習段階
・概念名: ${conceptName}
・学習段階: ${learningStageDescription}

## 状況文脈
${situationContext}

## キャラクター
${characterName}

## 洞察生成のガイドライン
1. **自然な気づき**: 概念についての説明ではなく、キャラクターが自然に気づく瞬間を描く
2. **感情との融合**: 学びと感情が融合した体験を表現する
3. **具体から抽象へ**: 具体的な体験から抽象的な概念への理解の橋渡しを表現
4. **内面の変化**: 概念理解によるキャラクターの内面変化を描写する
5. **段階に応じた描写**: 指定された学習段階に適した洞察の深さと表現にする

シーン全体を300〜500文字程度で生成してください。キャラクターの内面描写と対話（必要な場合）を含めてください。
`;
      
      // イベント発行
      this.eventBus.publish('prompt.generated', {
        type: PromptType.LEARNING_INSIGHT,
        conceptName,
        learningStage,
        characterName
      });
      
      logger.info(`Successfully generated learning insight prompt for ${conceptName}`);
      return prompt;
    } catch (error) {
      logger.error(`Failed to generate learning insight prompt for ${conceptName}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      
      // エラー時は簡易プロンプトを返す
      return `
キャラクター「${characterName}」が概念「${conceptName}」について重要な気づきを得る場面を生成してください。
学習段階は「${this.formatLearningStage(learningStage)}段階」です。

## 状況文脈
${situationContext}

300〜500文字程度のシーンを生成してください。
`;
    }
  }
  
  /**
   * 簡易的な章生成プロンプトを作成する（エラー時のフォールバック）
   * @private
   */
  private generateSimpleChapterPrompt(options: ChapterGenerationOptions): string {
    return `
あなたは「魂のこもった学びの物語」を創作するAI執筆者です。

# 第${options.chapterNumber}章${options.suggestedTitle ? `「${options.suggestedTitle}」` : ''}

## 概念と学習段階
・概念名: ${options.conceptName}
・学習段階: ${this.formatLearningStage(options.learningStage)}段階

## 執筆ガイドライン
1. キャラクターの内面変化を通して読者に共感体験を提供する
2. 概念を説明するのではなく、キャラクターの体験を通して読者が自然と学べるようにする
3. 感情と学びが融合した物語を創る

第${options.chapterNumber}章の内容を執筆してください。
`;
  }
  
  /**
   * 感情次元の配列を文字列にフォーマットする
   * @private
   */
  private formatEmotionalDimensions(dimensions: Array<{dimension: string, level: number}>): string {
    return dimensions
      .map(d => `${d.dimension}(${d.level})`)
      .join('、');
  }
  
  /**
   * カタルシスタイプをフォーマットする
   * @private
   */
  private formatCatharticType(type: string): string {
    const typeMapping: Record<string, string> = {
      'emotional': '感情的カタルシス',
      'intellectual': '知的カタルシス',
      'moral': '道徳的カタルシス',
      'transformative': '変容的カタルシス'
    };
    
    return typeMapping[type] || type;
  }
  
  /**
   * 学習段階を日本語表記でフォーマットする
   * @private
   */
  private formatLearningStage(stage: LearningStage): string {
    const stageMapping: Record<string, string> = {
      [LearningStage.MISCONCEPTION]: '誤解',
      [LearningStage.EXPLORATION]: '探索',
      [LearningStage.CONFLICT]: '葛藤',
      [LearningStage.INSIGHT]: '気づき',
      [LearningStage.APPLICATION]: '応用',
      [LearningStage.INTEGRATION]: '統合'
    };
    
    return stageMapping[stage] || stage;
  }
  
  /**
   * 学習段階の詳細な説明を取得する
   * @private
   */
  private getLearningStageDescription(stage: LearningStage): string {
    switch (stage) {
      case LearningStage.MISCONCEPTION:
        return '誤解段階 - キャラクターが概念に対して誤解や限定的な理解を持っている。表面的な理解や誤った前提に基づいて行動し、その限界に直面し始める段階。';
        
      case LearningStage.EXPLORATION:
        return '探索段階 - 誤解の限界に気づき始め、新しい視点や可能性を探り始める段階。好奇心と疑問が生まれ、従来の理解を越えた探索が始まる。';
        
      case LearningStage.CONFLICT:
        return '葛藤段階 - 従来の理解と新たな視点の間で葛藤が生じる段階。内的対立や価値観の再評価が起こり、決断を迫られる状況に直面する。';
        
      case LearningStage.INSIGHT:
        return '気づき段階 - 概念の本質に対する重要な洞察が得られる段階。点と点が繋がり、パラダイムシフトが起こる。新たな理解が急速に広がる瞬間。';
        
      case LearningStage.APPLICATION:
        return '応用段階 - 新たな理解を意識的に実践に移す段階。試行錯誤しながら概念を適用し、スキルや理解を深めていく過程。';
        
      case LearningStage.INTEGRATION:
        return '統合段階 - 概念が自然な思考・行動パターンとして定着する段階。意識的な適用から無意識的な体現へと移行し、他者にも伝えられるようになる。';
        
      default:
        return `${this.formatLearningStage(stage)}段階`;
    }
  }
  
  /**
   * 初期化済みかどうかを確認する
   * @private
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      this.initialize();
    }
  }
  
  /**
   * 初期化状態を取得する
   * @returns 初期化済みかどうか
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}