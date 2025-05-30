/**
 * @fileoverview シーン構造最適化システム
 * @description
 * 物語のシーン構造を分析し、次章に適したシーン構成を推奨するシステム
 * 
 * @role
 * - シーン構造の分析
 * - シーンバランスの評価
 * - シーン構成の推奨
 * - ペースやリズムの最適化
 */

import { GeminiClient } from '@/lib/generation/gemini-client';
import { logger } from '@/lib/utils/logger';
import { Chapter } from '@/types/chapters';
import { 
  Scene, 
  SceneInfo, 
  SceneStructureAnalysis, 
  LengthDistribution, 
  TransitionAnalysis, 
  SceneRecommendation 
} from '@/types/generation';
import { parameterManager } from '@/lib/parameters';

// 型を再エクスポートして他のファイルからも使用可能にする
export type { 
  SceneStructureAnalysis,
  SceneRecommendation,
  SceneInfo,
  LengthDistribution,
  TransitionAnalysis
};

/**
 * @class SceneStructureOptimizer
 * @description シーン構造を最適化するためのクラス
 * 
 * @role
 * - シーン構造の分析・推奨
 * - バランスのとれたシーン構成の提案
 * - 読者体験を向上させるペース設計
 */
export class SceneStructureOptimizer {
  /**
   * コンストラクタ
   * 
   * @param geminiClient AIによるシーン推奨生成のためのクライアント
   */
  constructor(private geminiClient: GeminiClient) {}

  /**
   * シーン構造分析
   * 複数章からシーン構造を分析します
   * 
   * @param chapters 分析対象の章配列
   * @returns シーン構造分析結果
   */
  analyzeSceneStructure(chapters: Chapter[]): SceneStructureAnalysis {
    // 全章からシーン情報を抽出・分析
    const scenes: SceneInfo[] = [];
    
    for (const chapter of chapters) {
      if (chapter.scenes && Array.isArray(chapter.scenes)) {
        const chapterScenes = chapter.scenes.map(scene => ({
          title: scene.title || `Scene in Chapter ${chapter.chapterNumber}`,
          type: scene.type || 'UNKNOWN',
          characters: Array.isArray(scene.characters) ? scene.characters : [],
          location: scene.location || '',
          summary: scene.summary || '',
          chapterNumber: chapter.chapterNumber,
          length: this.calculateSceneLength(scene),
          pov: scene.pov || ''
        }));
        
        scenes.push(...chapterScenes);
      }
    }
    
    // シーンタイプと長さの分布分析
    return {
      typeDistribution: this.calculateTypeDistribution(scenes),
      lengthDistribution: this.calculateLengthDistribution(scenes),
      paceVariation: this.calculatePaceVariation(scenes),
      transitionTypes: this.analyzeTransitionTypes(scenes),
      povsDistribution: this.calculatePOVsDistribution(scenes)
    };
  }

  /**
   * シーン推奨生成
   * 分析結果に基づいて次章のシーン構成を推奨します
   * 
   * @param analysis シーン構造分析結果
   * @param chapterNumber 対象章番号
   * @returns シーン推奨の配列
   */
  async generateSceneRecommendations(
    analysis: SceneStructureAnalysis, 
    chapterNumber: number
  ): Promise<SceneRecommendation[]> {
    const recommendations: SceneRecommendation[] = [];
    
    // シーンタイプのバランス推奨
    const underrepresentedTypes = this.identifyUnderrepresentedTypes(analysis.typeDistribution);
    if (underrepresentedTypes.length > 0) {
      recommendations.push({
        type: 'SCENE_TYPE',
        description: `次章では${underrepresentedTypes.join('または')}タイプのシーンを含めてください`,
        reason: '物語全体のシーンバランス向上のため'
      });
    }
    
    // シーン長のバリエーション推奨
    if (analysis.paceVariation < 0.4) {
      recommendations.push({
        type: 'SCENE_PACING',
        description: 'シーンの長さに変化をつけてください（短いシーンと長いシーンを組み合わせる）',
        reason: 'ペースの変化で読者の興味を維持するため'
      });
    }
    
    // 視点切り替えの推奨
    if (analysis.povsDistribution && Object.keys(analysis.povsDistribution).length > 1) {
      const povs = Object.keys(analysis.povsDistribution);
      const leastUsedPOV = povs.sort((a, b) => 
        (analysis.povsDistribution?.[a] || 0) - (analysis.povsDistribution?.[b] || 0)
      )[0];
      
      recommendations.push({
        type: 'POV_CHANGE',
        description: `"${leastUsedPOV}"視点のシーンを含めることを検討してください`,
        reason: '複数の視点からの物語展開でより立体的なストーリーを構築するため'
      });
    }
    
    // 推奨シーン構成
    recommendations.push({
      type: 'SCENE_STRUCTURE',
      description: await this.generateRecommendedSceneStructure(analysis, chapterNumber),
      reason: '効果的なシーン構成でストーリーのリズムを最適化するため'
    });
    
    return recommendations;
  }

  /**
   * シーンの長さを計算
   * コンテンツの長さや推定読了時間から計算
   * 
   * @private
   * @param scene シーン情報
   * @returns 計算されたシーンの長さ
   */
  private calculateSceneLength(scene: Scene): number {
    // 既に長さが指定されている場合はそれを使用
    if (scene.length) return scene.length;
    
    // コンテンツの長さから計算
    if (scene.content) {
      return scene.content.length;
    }
    
    // 開始位置と終了位置から計算
    if (scene.startPosition !== undefined && scene.endPosition !== undefined) {
      return scene.endPosition - scene.startPosition;
    }
    
    // デフォルト値
    return 1000; // デフォルト値
  }

  /**
   * シーンタイプ分布の計算
   * 
   * @private
   * @param scenes シーン情報の配列
   * @returns タイプごとの分布
   */
  private calculateTypeDistribution(scenes: SceneInfo[]): {[type: string]: number} {
    const distribution: {[type: string]: number} = {
      'INTRODUCTION': 0,
      'DEVELOPMENT': 0,
      'CLIMAX': 0,
      'RESOLUTION': 0,
      'TRANSITION': 0
    };
    
    scenes.forEach(scene => {
      if (scene.type && distribution[scene.type] !== undefined) {
        distribution[scene.type]++;
      }
    });
    
    return distribution;
  }

  /**
   * シーン長分布の計算
   * 
   * @private
   * @param scenes シーン情報の配列
   * @returns 長さの分布情報
   */
  private calculateLengthDistribution(scenes: SceneInfo[]): LengthDistribution {
    if (scenes.length === 0) {
      return {
        min: 0,
        max: 0,
        avg: 0,
        stdDev: 0
      };
    }
    
    const lengths = scenes.map(scene => scene.length || 0);
    
    const min = Math.min(...lengths);
    const max = Math.max(...lengths);
    const sum = lengths.reduce((acc, val) => acc + val, 0);
    const avg = sum / lengths.length;
    
    // 標準偏差の計算
    const squaredDiffs = lengths.map(length => Math.pow(length - avg, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      min,
      max,
      avg,
      stdDev
    };
  }

  /**
   * ペース変動の計算
   * シーン長のバリエーションから物語のペース変動を分析
   * 
   * @private
   * @param scenes シーン情報の配列
   * @returns ペース変動値（0-1）
   */
  private calculatePaceVariation(scenes: SceneInfo[]): number {
    if (scenes.length <= 1) {
      return 0; // 1つ以下のシーンの場合、変動なし
    }
    
    // 隣接するシーン間の長さ比率を計算
    const lengthRatios: number[] = [];
    
    for (let i = 1; i < scenes.length; i++) {
      const prevLength = scenes[i - 1].length || 0;
      const currLength = scenes[i].length || 0;
      
      // ゼロ除算を防ぐ
      if (prevLength > 0 && currLength > 0) {
        const ratio = Math.max(prevLength, currLength) / Math.min(prevLength, currLength);
        lengthRatios.push(ratio);
      }
    }
    
    if (lengthRatios.length === 0) {
      return 0;
    }
    
    // 比率の平均から変動指数を計算
    const avgRatio = lengthRatios.reduce((sum, ratio) => sum + ratio, 0) / lengthRatios.length;
    
    // 変動指数を0～1の範囲に正規化
    // 1に近いほど変動が大きい、0に近いほど一定
    return Math.min(1, (avgRatio - 1) / 4);
  }

  /**
   * 視点分布の計算
   * 
   * @private
   * @param scenes シーン情報の配列
   * @returns POVごとの分布
   */
  private calculatePOVsDistribution(scenes: SceneInfo[]): {[pov: string]: number} {
    const distribution: {[pov: string]: number} = {};
    
    scenes.forEach(scene => {
      if (scene.pov) {
        distribution[scene.pov] = (distribution[scene.pov] || 0) + 1;
      }
    });
    
    return distribution;
  }

  /**
   * シーン遷移タイプの分析
   * 
   * @private
   * @param scenes シーン情報の配列
   * @returns 遷移分析結果
   */
  private analyzeTransitionTypes(scenes: SceneInfo[]): TransitionAnalysis {
    const types: {[type: string]: number} = {
      'DIRECT_CONTINUATION': 0,
      'TIME_SKIP': 0,
      'LOCATION_CHANGE': 0,
      'POV_CHANGE': 0,
      'DRAMATIC_SHIFT': 0
    };
    
    let smoothnessSum = 0;
    let transitionCount = 0;
    
    for (let i = 1; i < scenes.length; i++) {
      const prevScene = scenes[i - 1];
      const currScene = scenes[i];
      
      // 同じ章の連続したシーンか確認
      if (prevScene.chapterNumber === currScene.chapterNumber) {
        // 遷移タイプの特定
        if (currScene.pov !== prevScene.pov && currScene.pov && prevScene.pov) {
          types['POV_CHANGE']++;
        } else if (currScene.location !== prevScene.location) {
          types['LOCATION_CHANGE']++;
        } else {
          types['DIRECT_CONTINUATION']++;
        }
        
        // 滑らかさを計算 (0-1)
        // 同じキャラクターが含まれているほど滑らか
        const commonCharacters = currScene.characters.filter(
          char => prevScene.characters.includes(char)
        ).length;
        const smoothnessFactor = commonCharacters / Math.max(
          currScene.characters.length, 
          prevScene.characters.length
        );
        
        smoothnessSum += smoothnessFactor;
        transitionCount++;
      } else if (prevScene.chapterNumber !== currScene.chapterNumber) {
        // 章をまたぐ遷移はカウントしない
        continue;
      }
    }
    
    return {
      types,
      smoothness: transitionCount > 0 ? smoothnessSum / transitionCount : 0.5
    };
  }

  /**
   * 代表不足のシーンタイプ特定
   * 
   * @private
   * @param distribution タイプごとの分布
   * @returns 代表が不足しているシーンタイプの配列
   */
  private identifyUnderrepresentedTypes(distribution: {[type: string]: number}): string[] {
    // 各タイプの理想的な比率
    const idealRatios: {[type: string]: number} = {
      'INTRODUCTION': 0.15,
      'DEVELOPMENT': 0.5,
      'CLIMAX': 0.2,
      'RESOLUTION': 0.15,
      'TRANSITION': 0.0  // 基本的に遷移シーンは必須ではない
    };
    
    const totalScenes = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    
    if (totalScenes === 0) {
      // デフォルトの推奨
      return ['INTRODUCTION', 'DEVELOPMENT'];
    }
    
    // 実際の比率と理想比率の差を計算
    const deviations: {type: string, deviation: number}[] = Object.entries(idealRatios)
      .map(([type, idealRatio]) => {
        const actualRatio = (distribution[type] || 0) / totalScenes;
        return {
          type,
          deviation: idealRatio - actualRatio  // 正値は不足、負値は過剰
        };
      });
    
    // 不足しているタイプを抽出（閾値0.05以上のもの）
    return deviations
      .filter(item => item.deviation > 0.05)
      .sort((a, b) => b.deviation - a.deviation)  // 不足度順にソート
      .slice(0, 2)  // 上位2つまで
      .map(item => this.formatSceneType(item.type));
  }

  /**
   * シーンタイプのフォーマット
   * 
   * @private
   * @param type シーンタイプ識別子
   * @returns フォーマットされたシーンタイプ名
   */
  private formatSceneType(type: string): string {
    const typeMap: {[key: string]: string} = {
      'INTRODUCTION': '導入',
      'DEVELOPMENT': '展開',
      'CLIMAX': 'クライマックス',
      'RESOLUTION': '解決',
      'TRANSITION': '遷移'
    };
    
    return typeMap[type] || type;
  }

  /**
   * 推奨シーン構成の生成
   * 
   * @private
   * @param analysis シーン構造分析
   * @param chapterNumber 章番号
   * @returns 推奨シーン構成の説明
   */
  private async generateRecommendedSceneStructure(
    analysis: SceneStructureAnalysis, 
    chapterNumber: number
  ): Promise<string> {
    try {
      // AIを使用して章番号と分析結果に基づいた詳細な推奨を生成
      const prompt = `
次のシーン構造分析に基づいて、第${chapterNumber}章に最適なシーン構成を3-4シーンで提案してください。

シーンタイプ分布:
${Object.entries(analysis.typeDistribution).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

シーン長の分布:
- 最小: ${analysis.lengthDistribution.min}
- 最大: ${analysis.lengthDistribution.max}
- 平均: ${analysis.lengthDistribution.avg.toFixed(2)}
- 標準偏差: ${analysis.lengthDistribution.stdDev.toFixed(2)}

ペース変動: ${analysis.paceVariation.toFixed(2)}

以下の形式で回答してください：
以下の構成が推奨されます：
1. [シーンタイプ] - [簡単な説明] (推定長: [長さ])
2. [シーンタイプ] - [簡単な説明] (推定長: [長さ])
...
`;

      // システムパラメータから適切な長さを取得
      const parameters = parameterManager.getParameters();
      const targetLength = 800; // デフォルト値

      // AIクライアントでシーン構成の推奨を生成
      const response = await this.geminiClient.generateText(prompt, {
        temperature: 0.7,
        targetLength: targetLength
      });

      // レスポンスを整形
      return this.formatAIResponse(response);
    } catch (error) {
      logger.error('推奨シーン構成の生成に失敗しました', {
        error: error instanceof Error ? error.message : String(error),
        chapterNumber
      });
      
      // エラー時のフォールバック推奨
      return `以下の構成が推奨されます：
1. 導入 - 前章からの続きを受け、状況を確立
2. 展開 - 主要なアクションや会話で物語を進展
3. クライマックス - 章のハイライトとなる重要な転換点
4. 解決 - 次章への橋渡しとなる締めくくり`;
    }
  }

  /**
   * AIレスポンスの整形
   * 
   * @private
   * @param response AIからのレスポンス
   * @returns 整形されたレスポンス
   */
  private formatAIResponse(response: string): string {
    // 余分な情報の削除
    let formatted = response.trim();
    
    // 「以下の構成が推奨されます：」から始まる行を探す
    const startPattern = /以下の構成が推奨されます[：:]/i;
    const startMatch = formatted.match(startPattern);
    
    if (startMatch && startMatch.index !== undefined) {
      formatted = formatted.substring(startMatch.index);
    }
    
    // 最大4シーンの推奨に制限
    const lines = formatted.split('\n');
    const limitedLines: string[] = [];
    
    let sceneCount = 0;
    for (const line of lines) {
      limitedLines.push(line);
      // 数字で始まる行をシーン定義と見なしてカウント
      if (/^\d+\./.test(line)) {
        sceneCount++;
        if (sceneCount >= 4) break;
      }
    }
    
    return limitedLines.join('\n');
  }
}