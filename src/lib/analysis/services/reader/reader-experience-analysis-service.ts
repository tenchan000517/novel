import { GeminiClient } from '@/lib/generation/gemini-client';
import { logger } from '@/lib/utils/logger';
import { apiThrottler } from '@/lib/utils/api-throttle';
import { Chapter } from '@/types/chapters'; // 共通型をインポート
import { JsonParser } from '@/lib/utils/json-parser';

/**
 * シーン情報を表す型
 */
export interface Scene {
  id: string;
  type: string;
  title: string;
  startPosition: number;
  endPosition: number;
  characters: string[];
  summary: string;
}

/**
 * 読者体験分析の結果インターフェース
 */
export interface ReaderExperienceAnalysis {
  /** 興味維持度 (1-10) */
  interestRetention: number;
  /** 感情移入度 (1-10) */
  empathy: number;
  /** 理解度 (1-10) */
  clarity: number;
  /** 意外性 (1-10) */
  unexpectedness: number;
  /** 続きへの期待度 (1-10) */
  anticipation: number;
  /** 総合スコア (1-10) */
  overallScore: number;
  /** 弱点 */
  weakPoints: Array<{
    point: string;
    suggestion?: string;
  }>;
  /** 強み */
  strengths: string[];
}

/**
 * @class ReaderExperienceAnalyzer
 * @description 章の読者体験を分析し、改善提案を生成するクラス
 */
export class ReaderExperienceAnalyzer {
  /**
   * @constructor
   * @param geminiClient - Gemini APIクライアント
   */
  constructor(private geminiClient: GeminiClient) {
    logger.info('ReaderExperienceAnalyzer initialized');
  }

  /**
   * 章の読者体験を分析する
   * @param chapter - 分析する章
   * @param previousChapters - 直前の章（コンテキスト用）
   * @returns 読者体験分析結果
   */
  async analyzeReaderExperience(
    chapter: Chapter,
    previousChapters: Chapter[]
  ): Promise<ReaderExperienceAnalysis> {
    try {
      logger.info(`Analyzing reader experience for chapter ${chapter.chapterNumber}`);
      
      // 直前の章の内容を抽出（最大2章分）
      const recentContent = previousChapters
        .slice(-2)
        .map(c => c.content)
        .join('\n\n[章の区切り]\n\n');

      // 分析用プロンプトの構築
      const prompt = `
以下の小説の章を「読者の視点」から分析してください。

前章：${recentContent.substring(0, 3000)}

現章：${chapter.content.substring(0, 6000)}

以下を評価（1-10）：
1. 興味維持：読者の注意をどの程度引きつけ続けるか
2. 感情移入：キャラクターへの共感度
3. 理解度：物語の流れや出来事の理解しやすさ
4. 予想外度：展開の意外性
5. 続きへの期待：次章を読みたいという欲求の強さ

読者体験を低下させる可能性のある部分を具体的に指摘し、改善案も提供してください。
また、特に効果的で読者に良い印象を与える強みも挙げてください。

JSONフォーマットで結果を返してください：
{
  "interestRetention": 数値,
  "empathy": 数値,
  "clarity": 数値,
  "unexpectedness": 数値,
  "anticipation": 数値,
  "overallScore": 数値,
  "weakPoints": [
    {"point": "問題点の説明", "suggestion": "改善提案"}
  ],
  "strengths": ["強み1", "強み2"]
}`;

      // API呼び出し（スロットリング対応）
      const response = await apiThrottler.throttledRequest(() =>
        this.geminiClient.generateText(prompt, {
          temperature: 0.3,
          purpose: 'analysis',
          responseFormat: 'json'
        })
      );

      // デフォルト分析レスポンス
      const defaultAnalysis: ReaderExperienceAnalysis = {
        interestRetention: 7,
        empathy: 7,
        clarity: 7,
        unexpectedness: 7,
        anticipation: 7,
        overallScore: 7,
        weakPoints: [],
        strengths: ['十分な読者体験の提供']
      };

      // JsonParserを使用して安全にパース
      const parsedResponse = JsonParser.parseFromAIResponse(response, defaultAnalysis);
      
      // レスポンスの検証と正規化
      const validatedResponse: ReaderExperienceAnalysis = {
        interestRetention: this.normalizeScore(parsedResponse.interestRetention),
        empathy: this.normalizeScore(parsedResponse.empathy),
        clarity: this.normalizeScore(parsedResponse.clarity),
        unexpectedness: this.normalizeScore(parsedResponse.unexpectedness),
        anticipation: this.normalizeScore(parsedResponse.anticipation),
        overallScore: this.normalizeScore(parsedResponse.overallScore || this.calculateOverallScore(parsedResponse)),
        weakPoints: Array.isArray(parsedResponse.weakPoints) ? parsedResponse.weakPoints : [],
        strengths: Array.isArray(parsedResponse.strengths) ? parsedResponse.strengths : []
      };

      logger.info('Reader experience analysis completed', {
        chapterNumber: chapter.chapterNumber,
        overallScore: validatedResponse.overallScore
      });

      return validatedResponse;
    } catch (error) {
      logger.error('Reader experience analysis failed', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber: chapter.chapterNumber
      });
      return this.createDefaultAnalysis();
    }
  }

  /**
   * 体験改善提案を生成する
   * @param analysis - 読者体験分析結果
   * @returns 改善提案の配列
   */
  generateExperienceImprovements(analysis: ReaderExperienceAnalysis): string[] {
    try {
      logger.info('Generating experience improvements based on analysis');
      const improvements: string[] = [];

      // 各評価項目に基づく改善提案
      if (analysis.interestRetention < 7) {
        improvements.push(`読者の興味を維持するために${this.getInterestSuggestion(analysis.interestRetention)}`);
      }

      if (analysis.empathy < 7) {
        improvements.push(`感情移入しやすくするために${this.getEmpathySuggestion(analysis.empathy)}`);
      }

      if (analysis.clarity < 7) {
        improvements.push(`物語の理解度を高めるために${this.getClaritySuggestion(analysis.clarity)}`);
      }

      if (analysis.unexpectedness < 5) {
        improvements.push(`展開の意外性を高めるために${this.getUnexpectednessSuggestion(analysis.unexpectedness)}`);
      }

      if (analysis.anticipation < 7) {
        improvements.push(`続きへの期待を高めるために${this.getAnticipationSuggestion(analysis.anticipation)}`);
      }

      // 分析による具体的な改善点
      if (analysis.weakPoints && analysis.weakPoints.length > 0) {
        analysis.weakPoints.forEach(point => {
          if (point.suggestion) {
            improvements.push(point.suggestion);
          }
        });
      }

      logger.info(`Generated ${improvements.length} improvement suggestions`);
      return improvements;
    } catch (error) {
      logger.error('Failed to generate experience improvements', {
        error: error instanceof Error ? error.message : String(error)
      });
      return [
        '読者の興味を維持するため、より具体的で感情的な描写を心がけてください',
        'キャラクターの内面描写を充実させて、感情移入しやすくしてください',
        '物語の流れをより明確にし、読者が混乱しないよう情報を整理してください'
      ];
    }
  }

  /**
   * ジャンルに基づいた読者体験の期待を分析する
   * @param genre - 小説のジャンル
   * @param chapterNumber - 章番号
   * @param totalChapters - 総章数
   * @returns ジャンル固有の読者体験改善提案
   */
  getGenreSpecificReaderExpectations(
    genre: string,
    chapterNumber: number,
    totalChapters: number = 20
  ): string[] {
    try {
      const progress = chapterNumber / totalChapters;
      const expectations: string[] = [];

      // ジャンル共通の期待
      if (progress < 0.2) {
        expectations.push('導入部では読者の好奇心を刺激するミステリーや謎を提示してください');
      } else if (progress > 0.8) {
        expectations.push('終盤では伏線の回収と感情的なクライマックスを提供してください');
      }

      // ジャンル固有の期待
      switch (genre.toLowerCase()) {
        case 'fantasy':
          expectations.push('ファンタジー読者は世界観の一貫性と魔法システムの論理性に期待しています');
          if (progress < 0.3) {
            expectations.push('ファンタジー序盤では、魅力的な世界構築と読者を惹きつける冒険要素を入れてください');
          } else if (progress > 0.7) {
            expectations.push('ファンタジー終盤では、壮大なクライマックスと感情的な満足感を与えてください');
          }
          break;

        case 'mystery':
          expectations.push('ミステリー読者は論理的整合性と手がかりの公平な提示を期待しています');
          if (progress < 0.4) {
            expectations.push('ミステリー序盤では、複数の怪しい人物と信頼できない情報を提示してください');
          } else if (progress > 0.6) {
            expectations.push('ミステリー終盤では、知的に納得できる解決と意外性のバランスを保ってください');
          }
          break;

        case 'romance':
          expectations.push('ロマンス読者は感情の深さと関係性の発展に期待しています');
          if (progress < 0.4) {
            expectations.push('ロマンス序盤では、強い初期の引力と障害の設定を明確にしてください');
          } else if (progress > 0.6) {
            expectations.push('ロマンス終盤では、困難を乗り越えた後の感情的な充足と成長を描いてください');
          }
          break;

        case 'thriller':
          expectations.push('スリラー読者は緊張感の維持とリスクの感覚に期待しています');
          if (progress < 0.3) {
            expectations.push('スリラー序盤では、危険の兆候と主人公の弱点を示してください');
          } else if (progress > 0.7) {
            expectations.push('スリラー終盤では、高い緊張状態から解放への劇的な転換を提供してください');
          }
          break;
      }

      return expectations;
    } catch (error) {
      logger.error('Failed to get genre specific expectations', {
        error: error instanceof Error ? error.message : String(error),
        genre
      });
      return ['ジャンルに関わらず、強い感情的体験と没入感を提供してください'];
    }
  }

  /**
   * 読者体験に基づくシーン改善提案を生成する
   * @param chapter 分析対象の章
   * @param analysis 読者体験分析結果
   * @returns シーンごとの改善提案
   */
  generateSceneImprovements(
    chapter: Chapter,
    analysis: ReaderExperienceAnalysis
  ): {[sceneId: string]: string[]} {
    try {
      const sceneImprovements: {[sceneId: string]: string[]} = {};
      
      // 章にシーン情報がない場合は全体の改善提案のみを返す
      if (!chapter.scenes || chapter.scenes.length === 0) {
        sceneImprovements['overall'] = this.generateExperienceImprovements(analysis);
        return sceneImprovements;
      }
      
      // 弱点に基づいて各シーンに改善提案を割り当て
      chapter.scenes.forEach(scene => {
        const suggestions: string[] = [];
        
        // シーンタイプに基づく提案
        switch (scene.type.toUpperCase()) {
          case 'INTRODUCTION':
            if (analysis.interestRetention < 7) {
              suggestions.push('導入シーンでより強いフックを作り、読者の注目を集めてください');
            }
            break;
            
          case 'DEVELOPMENT':
            if (analysis.empathy < 7) {
              suggestions.push('展開シーンでキャラクターの内面描写を増やし、感情移入を促進してください');
            }
            break;
            
          case 'CLIMAX':
            if (analysis.unexpectedness < 6) {
              suggestions.push('クライマックスシーンに予想外の展開や転換を追加してください');
            }
            break;
            
          case 'RESOLUTION':
            if (analysis.anticipation < 7) {
              suggestions.push('解決シーンと次章へのつながりを強化し、続きへの期待を高めてください');
            }
            break;
        }
        
        // シーンの位置に基づく提案
        const sceneIndex = chapter.scenes!.indexOf(scene);
        const totalScenes = chapter.scenes!.length;
        const scenePosition = sceneIndex / totalScenes;
        
        if (scenePosition < 0.3 && analysis.clarity < 7) {
          suggestions.push('章の前半のシーンで状況説明をより明確にしてください');
        } else if (scenePosition > 0.7 && analysis.anticipation < 7) {
          suggestions.push('章の後半のシーンで次章への期待を高める要素を追加してください');
        }
        
        // シーンごとの改善提案を保存
        sceneImprovements[scene.id] = suggestions;
      });
      
      return sceneImprovements;
    } catch (error) {
      logger.error('Failed to generate scene improvements', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber: chapter.chapterNumber
      });
      
      const fallback: {[sceneId: string]: string[]} = {};
      fallback['overall'] = this.generateExperienceImprovements(analysis);
      return fallback;
    }
  }

  /**
   * スコアを正規化する (1-10の範囲に収める)
   * @private
   */
  private normalizeScore(score: any): number {
    if (typeof score !== 'number' || isNaN(score)) {
      return 7; // デフォルト値
    }
    return Math.max(1, Math.min(10, Math.round(score)));
  }

  /**
   * 総合スコアを計算する
   * @private
   */
  private calculateOverallScore(scores: any): number {
    try {
      // 各要素のスコアに重み付けして平均を計算
      const weights = {
        interestRetention: 0.25,
        empathy: 0.25,
        clarity: 0.2,
        unexpectedness: 0.15,
        anticipation: 0.15
      };
      
      let totalWeight = 0;
      let weightedSum = 0;
      
      for (const [key, weight] of Object.entries(weights)) {
        if (typeof scores[key] === 'number' && !isNaN(scores[key])) {
          weightedSum += scores[key] * weight;
          totalWeight += weight;
        }
      }
      
      return totalWeight > 0 ? weightedSum / totalWeight : 7;
    } catch (error) {
      logger.error('Failed to calculate overall score', {
        error: error instanceof Error ? error.message : String(error)
      });
      return 7; // デフォルト値
    }
  }

  /**
   * デフォルトの分析結果を作成する
   * @private
   */
  private createDefaultAnalysis(): ReaderExperienceAnalysis {
    return {
      interestRetention: 7,
      empathy: 7,
      clarity: 7,
      unexpectedness: 7,
      anticipation: 7,
      overallScore: 7,
      weakPoints: [],
      strengths: ['十分な読者体験の提供']
    };
  }

  /**
   * 興味維持のための提案を取得する
   * @private
   */
  private getInterestSuggestion(score: number): string {
    if (score <= 3) {
      return 'より強い葛藤や謎を導入し、章ごとにミニクライマックスを設けてください';
    } else if (score <= 5) {
      return '細部の描写や会話に読者を引き込む要素を取り入れ、ペースに変化をつけてください';
    } else {
      return '現在の流れを維持しながら、章の終わりに次を読みたくなるフックを加えてください';
    }
  }

  /**
   * 感情移入のための提案を取得する
   * @private
   */
  private getEmpathySuggestion(score: number): string {
    if (score <= 3) {
      return 'キャラクターの内面描写を大幅に増やし、感情と動機を明確に示してください';
    } else if (score <= 5) {
      return 'キャラクターの感情的反応をより具体的に描写し、読者が共感できる普遍的感情を盛り込んでください';
    } else {
      return 'キャラクターの脆弱性や内的葛藤をさらに掘り下げてください';
    }
  }

  /**
   * 理解度向上のための提案を取得する
   * @private
   */
  private getClaritySuggestion(score: number): string {
    if (score <= 3) {
      return '物語の流れを整理し、重要な情報を繰り返すなど理解しやすい構造にしてください';
    } else if (score <= 5) {
      return '複雑な展開の前後に読者が整理できる瞬間を設け、因果関係をより明確にしてください';
    } else {
      return '重要な要素や情報に焦点を当て、余計な複雑さを排除してください';
    }
  }

  /**
   * 意外性向上のための提案を取得する
   * @private
   */
  private getUnexpectednessSuggestion(score: number): string {
    if (score <= 3) {
      return '読者の予想を覆す展開や意外な発見を取り入れてください';
    } else if (score <= 5) {
      return 'キャラクターに予想外の行動や決断をさせ、物語に新鮮さを加えてください';
    } else {
      return '小さな意外性と伏線の回収を随所に配置して読者の注意を引き付けてください';
    }
  }

  /**
   * 続きへの期待感向上のための提案を取得する
   * @private
   */
  private getAnticipationSuggestion(score: number): string {
    if (score <= 3) {
      return 'クリフハンガーや未解決の謎を導入し、次章への強い期待感を作ってください';
    } else if (score <= 5) {
      return '章の終わりに新たな疑問や展開の可能性を示唆し、続きを読みたくなる要素を加えてください';
    } else {
      return '物語の進行に伴って発生する新たな問題や課題をより明確に提示してください';
    }
  }

  /**
   * 異なるタイプの読者を想定した体験分析を行う
   * @param chapter 分析する章
   * @param readerType 読者タイプ ('casual', 'critical', 'genre', 'emotional')
   * @returns 特定の読者タイプに基づく推奨事項
   */
  analyzeForSpecificReaderType(chapter: Chapter, readerType: string): string[] {
    try {
      const recommendations: string[] = [];
      
      switch (readerType.toLowerCase()) {
        case 'casual':
          // カジュアルな読者（エンターテイメント重視）
          recommendations.push('各章を独立したエピソードとしても楽しめるよう、明確な導入と解決を持たせてください');
          recommendations.push('長い説明や複雑な設定よりも、アクションやダイナミックな展開を優先してください');
          recommendations.push('主要なキャラクターを定期的に登場させ、読者が物語を追いやすくしてください');
          break;
          
        case 'critical':
          // 批評的な読者（深さと一貫性重視）
          recommendations.push('テーマと象徴を一貫して発展させ、深い解釈の層を提供してください');
          recommendations.push('キャラクターの決断と行動に明確な動機と心理的リアリズムを持たせてください');
          recommendations.push('世界設定の細部における論理的整合性を確保してください');
          break;
          
        case 'genre':
          // ジャンルに精通した読者
          recommendations.push('ジャンルの慣習を意識しながらも、新鮮な視点やツイストを取り入れてください');
          recommendations.push('類似作品からの差別化ポイントを明確にしてください');
          recommendations.push('ジャンルの核心的な満足感を提供しつつ、期待を上回る要素を盛り込んでください');
          break;
          
        case 'emotional':
          // 感情的な没入を求める読者
          recommendations.push('キャラクターの感情体験を読者が共有できるよう、感覚的な描写を強化してください');
          recommendations.push('感情的クライマックスと静かな瞬間のリズムを意識してください');
          recommendations.push('読者の共感を呼ぶ普遍的な感情と体験を中心に置いてください');
          break;
          
        default:
          recommendations.push('幅広い読者に訴える、バランスの取れた物語体験を提供してください');
      }
      
      return recommendations;
    } catch (error) {
      logger.error('Failed to analyze for specific reader type', {
        error: error instanceof Error ? error.message : String(error),
        readerType
      });
      return ['様々な読者層に配慮した、バランスの取れた物語を心がけてください'];
    }
  }
}