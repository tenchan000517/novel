/**
 * @fileoverview AI分析用プロンプト生成器
 * @description 感情学習分析のための各種AI分析プロンプトを生成するヘルパー
 */

import { LearningStage } from '../concept-learning-manager';

/**
 * 学習段階を日本語に変換
 * @param stage 学習段階
 * @returns 日本語での学習段階名
 */
function formatLearningStage(stage: LearningStage): string {
    const japaneseStages: { [key in LearningStage]?: string } = {
        [LearningStage.MISCONCEPTION]: '誤解段階',
        [LearningStage.EXPLORATION]: '探索段階',
        [LearningStage.CONFLICT]: '葛藤段階',
        [LearningStage.INSIGHT]: '気づき段階',
        [LearningStage.APPLICATION]: '応用段階',
        [LearningStage.INTEGRATION]: '統合段階',
        // 新しいビジネス学習段階
        [LearningStage.INTRODUCTION]: '導入段階',
        [LearningStage.THEORY_APPLICATION]: '理論適用段階',
        [LearningStage.FAILURE_EXPERIENCE]: '失敗体験段階',
        [LearningStage.PRACTICAL_MASTERY]: '実践習熟段階'
    };

    return japaneseStages[stage] || stage;
}

/**
 * 感情と学習の同期分析用プロンプトを生成
 * @param content 章内容
 * @param conceptName 概念名
 * @param stage 学習段階
 * @returns 同期分析プロンプト
 */
export function createSynchronizationPrompt(
    content: string,
    conceptName: string,
    stage: LearningStage
): string {
    return `
あなたは感情と学習の同期分析専門家です。
以下の章内容において、感情的瞬間と学習ポイントの同期度を分析してください。

# 章内容
${content}

# 概念情報
・名前: ${conceptName}
・学習段階: ${formatLearningStage(stage)}

# 分析指示
以下の指標について、0から1の範囲で客観的に評価してください:

1. 感情ピークと学習ポイントの同期度 (peakSynchronization): 感情の高まりと認知的洞察の瞬間がどの程度一致しているか
2. 感情変化と理解進展の一致度 (progressionAlignment): 感情の変化曲線と概念理解の深まりがどの程度並行しているか
3. 感情的共鳴強度 (emotionalResonance): 読者がどの程度キャラクターの感情体験に共鳴できるか
4. テーマと感情の統合度 (themeEmotionIntegration): 概念のテーマと感情表現がどの程度統合されているか
5. カタルシス瞬間の効果 (catharticMomentEffect): 重要な気づきや転換点での感情的なカタルシスの効果

最後に、測定の信頼性を0から1で評価してください。

JSON形式で出力してください：
{
  "peakSynchronization": 値,
  "progressionAlignment": 値,
  "emotionalResonance": 値,
  "themeEmotionIntegration": 値,
  "catharticMomentEffect": 値,
  "measurementConfidence": 値
}
`;
}

/**
 * 共感ポイント生成用プロンプトを作成
 * @param content 章内容
 * @param conceptName 概念名
 * @param stage 学習段階
 * @returns 共感ポイント生成プロンプト
 */
export function createEmpatheticPointsPrompt(
    content: string,
    conceptName: string,
    stage: LearningStage
): string {
    return `
あなたは物語の共感ポイント分析の専門家です。
以下の章内容から、読者が強く共感できるポイントを抽出してください。

# 章内容
${content}

# 概念情報
・名前: ${conceptName}
・学習段階: ${formatLearningStage(stage)}

# 分析指示
読者が共感しやすい瞬間を5つ抽出し、以下の情報を提供してください：
1. タイプ: character（キャラクターの内面）、situation（状況）、decision（決断）、realization（気づき）、transformation（変容）のいずれか
2. 位置: 章内での相対位置（0-1の数値、冒頭が0、結末が1）
3. 強度: 共感の強さ（0-1の数値）
4. 説明: 共感ポイントの簡潔な説明

JSON形式で出力してください：
{
  "points": [
    {
      "type": "タイプ",
      "position": 位置,
      "intensity": 強度,
      "description": "説明"
    },
    ...
  ]
}
`;
}

/**
 * 感情分析用プロンプトを作成
 * @param content 章内容
 * @param genre ジャンル
 * @returns 感情分析プロンプト
 */
export function createEmotionAnalysisPrompt(content: string, genre: string = 'business'): string {
    return `
あなたは物語の感情分析の専門家です。
以下の章内容を分析し、感情的特徴を抽出してください。

# 章内容
${content}

# ジャンル
${genre}

# 分析指示
以下の情報を提供してください：
1. 全体のトーン
2. 感情的影響力 (1-10の数値)
3. 主要な感情次元の変化

JSON形式で出力してください：
{
  "overallTone": "全体のトーン",
  "emotionalImpact": 感情的影響力,
  "emotionalDimensions": {
    "hopeVsDespair": {"start": 値, "middle": 値, "end": 値},
    "comfortVsTension": {"start": 値, "middle": 値, "end": 値},
    "joyVsSadness": {"start": 値, "middle": 値, "end": 値}
  }
}
`;
}

/**
 * ビジネスフレームワーク特化分析用プロンプトを作成
 * @param content 章内容
 * @param frameworkName フレームワーク名
 * @param stage 学習段階
 * @returns ビジネスフレームワーク分析プロンプト
 */
export function createBusinessFrameworkAnalysisPrompt(
    content: string,
    frameworkName: string,
    stage: LearningStage
): string {
    return `
あなたは${frameworkName}ビジネスフレームワークの専門家です。
以下の章内容において、${frameworkName}の概念学習における感情的側面を分析してください。

# 章内容
${content}

# フレームワーク情報
・名前: ${frameworkName}
・学習段階: ${formatLearningStage(stage)}

# 分析指示
${frameworkName}の特性に基づいて以下を分析してください：

1. フレームワーク特有の感情パターンの表現度
2. 学習段階における感情的適切性
3. ビジネス実践への感情的動機付け効果
4. フレームワーク理解の感情的促進要素

特に以下の点に注目してください：
${getFrameworkSpecificAnalysisPoints(frameworkName)}

JSON形式で出力してください：
{
  "frameworkAlignment": 値(0-1),
  "stageAppropriateness": 値(0-1),
  "motivationalEffect": 値(0-1),
  "understandingFacilitation": 値(0-1),
  "specificObservations": "フレームワーク特有の観察事項",
  "recommendations": ["改善推奨事項のリスト"]
}
`;
}

/**
 * カタルシス体験分析用プロンプトを作成
 * @param content 章内容
 * @param conceptName 概念名
 * @param stage 学習段階
 * @returns カタルシス体験分析プロンプト
 */
export function createCatharticExperiencePrompt(
    content: string,
    conceptName: string,
    stage: LearningStage
): string {
    return `
あなたはカタルシス体験の専門分析家です。
以下の章内容から、読者に深い感情的解放や転換をもたらすカタルシス的瞬間を分析してください。

# 章内容
${content}

# 概念情報
・名前: ${conceptName}
・学習段階: ${formatLearningStage(stage)}

# 分析指示
カタルシス的な瞬間を特定し、以下の要素を分析してください：

1. カタルシスのタイプ（emotional/intellectual/moral/transformative）
2. 強度（0-1の数値）
3. トリガー（引き金となる出来事）
4. 準備段階（カタルシスへの段階的構築）
5. ピーク瞬間（最高潮の描写）
6. 余韻（カタルシス後の感情的効果）

JSON形式で出力してください：
{
  "catharticMoments": [
    {
      "type": "タイプ",
      "intensity": 強度,
      "trigger": "トリガー",
      "buildup": ["準備段階の配列"],
      "peakMoment": "ピーク瞬間の描写",
      "aftermath": "余韻の説明",
      "position": 章内位置(0-1)
    }
  ],
  "overallCatharticEffect": 値(0-1),
  "recommendations": ["カタルシス強化の推奨事項"]
}
`;
}

/**
 * 感情統合計画用プロンプトを作成
 * @param conceptName 概念名
 * @param stage 学習段階
 * @param chapterGoals 章の目標
 * @returns 感情統合計画プロンプト
 */
export function createEmotionalIntegrationPlanPrompt(
    conceptName: string,
    stage: LearningStage,
    chapterGoals: string[]
): string {
    return `
あなたは感情学習統合の専門プランナーです。
以下の情報に基づいて、感情と学習を統合した章構成計画を立案してください。

# 基本情報
・概念: ${conceptName}
・学習段階: ${formatLearningStage(stage)}
・章の目標: ${chapterGoals.join(', ')}

# 計画指示
以下の要素を統合した計画を策定してください：

1. 感情アーク設計
   - 章開始時の感情状態
   - 展開部での感情変化
   - 終結部での感情到達点

2. 学習統合ポイント
   - 概念理解と感情ピークの同期タイミング
   - 感情的共鳴を通じた記憶定着戦略
   - 実践動機を高める感情設計

3. 読者体験最適化
   - 共感ポイントの戦略的配置
   - カタルシス体験の設計
   - 次章への感情的接続

JSON形式で出力してください：
{
  "emotionalArc": {
    "opening": {"tone": "トーン", "emotions": ["感情リスト"]},
    "development": {"tone": "トーン", "emotions": ["感情リスト"]},
    "conclusion": {"tone": "トーン", "emotions": ["感情リスト"]}
  },
  "learningIntegration": {
    "syncPoints": [{"timing": 位置, "concept": "概念", "emotion": "感情"}],
    "memoryAnchors": ["記憶定着ポイント"],
    "motivationTriggers": ["動機付けトリガー"]
  },
  "readerExperience": {
    "empathyPoints": [{"position": 位置, "type": "タイプ", "description": "説明"}],
    "catharticMoments": [{"position": 位置, "type": "タイプ", "description": "説明"}],
    "transitionPreparation": "次章への準備"
  }
}
`;
}

/**
 * フレームワーク特有の分析ポイントを取得
 * @param frameworkName フレームワーク名
 * @returns 分析ポイント文字列
 */
function getFrameworkSpecificAnalysisPoints(frameworkName: string): string {
    switch (frameworkName) {
        case 'ISSUE_DRIVEN':
            return `
- 課題発見時の緊急感や危機感の表現
- 仮説検証プロセスでの知的興奮
- 解決策選択時の責任感と決断力
- 根本解決への確信と達成感`;

        case 'SOCRATIC_DIALOGUE':
            return `
- 「無知の知」への気づきによる謙虚さ
- 自発的発見の喜びと知的満足感
- 内省による自己矛盾の発見と混乱
- 真理探求への継続的意欲`;

        case 'ADLER_PSYCHOLOGY':
            return `
- 他責思考からの脱却への抵抗感
- 課題分離による解放感と自由への憧れ
- 承認欲求との葛藤と勇気ある決断
- 共同体感覚による深いつながりと幸福感`;

        case 'DRUCKER_MANAGEMENT':
            return `
- 効率性から効果性への転換の必要性認識
- 強み発見による自己肯定感と期待
- 時間管理と優先順位決定の重圧
- 継続的イノベーションへの使命感`;

        default:
            return `
- フレームワーク特有の感情パターン
- 学習段階に適した感情表現
- 概念理解を促進する感情的要素`;
    }
}