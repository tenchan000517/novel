/**
 * @fileoverview キャラクター関連ユーティリティ関数
 * @description
 * キャラクター操作に関する共通のユーティリティ関数を提供します。
 * これには、ファイルパス生成、フォーマット、特性抽出などが含まれます。
 */
import { Character, CharacterType, CharacterPsychology } from '../core/types';
import { Logger } from '@/lib/utils/logger';
import { GeminiClient } from '@/lib/generation/gemini-client';

const logger = new Logger({ serviceName: 'CharacterUtils' });

/**
 * キャラクターのファイルパスを取得する
 * @param character キャラクターオブジェクト
 * @returns キャラクターのファイルパス（YAML）
 */
export function getCharacterFilePath(character: Character): string {
  return `characters/${getDirectoryByType(character.type)}/${character.id}.yaml`;
}

/**
 * キャラクタータイプに対応するディレクトリを取得する
 * @param type キャラクタータイプ
 * @returns ディレクトリ名
 */
export function getDirectoryByType(type: CharacterType): string {
  switch (type) {
    case 'MAIN':
      return 'main';
    case 'SUB':
      return 'sub-characters';
    case 'MOB':
      return 'mob-characters';
    default:
      return 'mob-characters';
  }
}

/**
 * プロンプト用にキャラクターをフォーマットする
 * @param character キャラクター
 * @param detailLevel 詳細レベル（"brief", "standard", "detailed"）
 * @returns フォーマット済みのテキスト
 */
export function formatCharacterForPrompt(
  character: Character, 
  detailLevel: string = "standard"
): string {
  // 詳細レベルに応じたフォーマット
  switch (detailLevel) {
    case "brief":
      return `${character.name} (${character.type}): ${character.description}`;

    case "detailed":
      // 心理情報を含めるかどうかをチェック
      const psychologySection = character.psychology ? formatPsychologyForPrompt(character.psychology) : '';

      return `# ${character.name}
タイプ: ${character.type}
説明: ${character.description}

## 性格
${character.personality?.traits?.map(t => `- ${t}`).join('\n') || '特性情報なし'}

## 背景
${character.backstory?.summary || '背景情報なし'}

## 現在の状態
感情状態: ${character.state?.emotionalState || 'NEUTRAL'}
発展段階: ${character.state?.developmentStage || 0}/5
最終登場: チャプター${character.state?.lastAppearance || '?'}

## 関係性
${character.relationships?.map(r => `- ${r.targetId}: ${r.type} (強さ: ${r.strength})`).join('\n') || '関係性情報なし'}

${psychologySection}`;

    case "standard":
    default:
      // 心理情報の簡略表示
      const psychSummary = character.psychology ?
        `\n心理: ${character.psychology.currentDesires.slice(0, 2).join(', ')} を欲し、${character.psychology.currentFears.slice(0, 1)} を恐れている` : '';

      return `## ${character.name}
タイプ: ${character.type}
説明: ${character.description}
性格: ${character.personality?.traits?.join(', ') || '特性情報なし'}
状態: ${character.state?.emotionalState || 'NEUTRAL'} (発展段階: ${character.state?.developmentStage || 0}/5)${psychSummary}`;
  }
}

/**
 * 心理情報のフォーマット（プロンプト用）
 * @param psychology 心理情報
 * @returns フォーマット済みのテキスト
 */
export function formatPsychologyForPrompt(psychology: CharacterPsychology): string {
  if (!psychology) return '';

  let result = "## 心理状態\n";

  // 欲求
  if (psychology.currentDesires && psychology.currentDesires.length > 0) {
    result += `欲求: ${psychology.currentDesires.join('、')}\n`;
  }

  // 恐れ
  if (psychology.currentFears && psychology.currentFears.length > 0) {
    result += `恐れ: ${psychology.currentFears.join('、')}\n`;
  }

  // 内的葛藤
  if (psychology.internalConflicts && psychology.internalConflicts.length > 0) {
    result += `内的葛藤: ${psychology.internalConflicts.join('、')}\n`;
  }

  // 感情状態
  if (psychology.emotionalState) {
    const emotions = Object.entries(psychology.emotionalState)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (emotions.length > 0) {
      result += "感情: " + emotions.map(([emotion, intensity]) =>
        `${emotion}(${Math.round(intensity * 10)}/10)`
      ).join('、') + '\n';
    }
  }

  return result;
}

/**
 * バックストーリーから性格特性を抽出する
 * @param backstory バックストーリーテキスト
 * @returns 抽出された特性配列（Promise）
 */
export async function extractTraitsFromBackstory(backstory: string): Promise<string[]> {
  try {
    const geminiClient = new GeminiClient();
    
    // プロンプト作成
    const prompt = `
以下のキャラクターのバックストーリーから、そのキャラクターの主要な性格特性を5つ抽出してください。
各特性は単語または短いフレーズ（最大3単語）で表現してください。

バックストーリー:
${backstory}

出力形式:
- 特性1
- 特性2
- 特性3
- 特性4
- 特性5
`;

    const result = await geminiClient.generateText(prompt, {
      temperature: 0.3,
      targetLength: 200
    });

    // 抽出された特性をリストに変換
    const traits = result
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace('-', '').trim());

    return traits;
  } catch (error) {
    logger.warn('Failed to extract traits from backstory', { 
      error: error instanceof Error ? error.message : String(error)
    });
    return ['思慮深い', '決断力がある', '忠実']; // デフォルト特性
  }
}

/**
 * キャラクターの詳細情報をログ形式でフォーマットする
 * @param character キャラクター
 * @returns フォーマット済みのテキスト
 */
export function formatCharacterForLogging(character: Character): string {
  return `Character[${character.id}]: ${character.name} (${character.type}), 
  state: ${character.state.emotionalState}, 
  stage: ${character.state.developmentStage}, 
  lastAppearance: Chapter ${character.state.lastAppearance || 'N/A'}`;
}

/**
 * 複数キャラクターを簡潔な一覧としてフォーマットする
 * @param characters キャラクター配列
 * @returns フォーマット済みの一覧テキスト
 */
export function formatCharactersList(characters: Character[]): string {
  if (!characters || characters.length === 0) {
    return "キャラクターはいません";
  }
  
  return characters.map(char => 
    `- ${char.name} (${char.type}): ${char.state.isActive ? 'アクティブ' : '非アクティブ'}, ` + 
    `最終登場: Ch.${char.state.lastAppearance || 'N/A'}`
  ).join('\n');
}

/**
 * キャラクターをCSV形式にフォーマットする
 * @param characters キャラクター配列
 * @returns CSV形式のテキスト（ヘッダー含む）
 */
export function formatCharactersAsCSV(characters: Character[]): string {
  // CSVヘッダー
  const header = "ID,Name,Type,IsActive,LastAppearance,EmotionalState,DevelopmentStage";
  
  // 各キャラクターの行
  const rows = characters.map(char => [
    char.id,
    `"${char.name}"`, // 名前にカンマが含まれる可能性があるためクォートで囲む
    char.type,
    char.state.isActive ? 'true' : 'false',
    char.state.lastAppearance || '',
    char.state.emotionalState,
    char.state.developmentStage
  ].join(','));
  
  // ヘッダーと行を結合
  return [header, ...rows].join('\n');
}

/**
 * キャラクターが特定の章に登場すべきかを評価する
 * @param character キャラクター
 * @param chapterNumber 章番号
 * @returns 評価結果（0-1のスコア, 理由）
 */
export function evaluateAppearanceSuitability(
  character: Character,
  chapterNumber: number
): { score: number; reason: string } {
  // 最後の出現からの間隔
  const lastAppearance = character.state.lastAppearance || 0;
  const chapters_since_last = chapterNumber - lastAppearance;
  
  // 基本スコア
  let score = 0.5;
  let reason = '';
  
  // キャラクタータイプ別の最適登場間隔
  const optimalInterval = {
    'MAIN': 1, // メインキャラは毎章または1章おき
    'SUB': 3,  // サブキャラは3章程度おき
    'MOB': 5   // モブキャラは5章程度おき
  };
  
  const interval = optimalInterval[character.type];
  
  // 間隔に基づくスコア調整
  if (chapters_since_last < interval) {
    // 短すぎる間隔
    score -= 0.2 * (interval - chapters_since_last) / interval;
    reason = `前回の登場（Chapter ${lastAppearance}）から間隔が短すぎます`;
  } else if (chapters_since_last > interval * 2) {
    // 長すぎる間隔
    score += 0.1 * Math.min(1, (chapters_since_last - interval * 2) / interval);
    reason = `長期間（${chapters_since_last}章）登場していないため再登場が望ましい`;
  } else {
    // 最適な間隔
    score += 0.3;
    reason = `最適な登場タイミングです（前回登場から${chapters_since_last}章経過）`;
  }
  
  // キャラクタータイプによる調整
  if (character.type === 'MAIN') {
    score += 0.2;
    reason += '。メインキャラクターのため優先度が高い';
  }
  
  // 無効なスコアの補正
  score = Math.max(0, Math.min(1, score));
  
  return { score, reason };
}

/**
 * キャラクター名の表示形式を取得する（敬称などを含む）
 * @param character キャラクター
 * @param viewpointCharacter 視点キャラクター（オプション）
 * @returns 表示用の名前
 */
export function getCharacterDisplayName(
  character: Character, 
  viewpointCharacter?: Character
): string {
  // デフォルトは通常の名前
  let displayName = character.name;
  
  // 視点キャラクターが指定されている場合
  if (viewpointCharacter) {
    // 視点キャラクターからの呼称を検索
    if (character.nicknames && viewpointCharacter.id in character.nicknames) {
      const nicknames = character.nicknames[viewpointCharacter.id];
      if (nicknames && nicknames.length > 0) {
        displayName = nicknames[0]; // 最初の呼称を使用
      }
    }
    
    // 関係性に基づく敬称付加
    if (viewpointCharacter.relationships) {
      const relationship = viewpointCharacter.relationships.find(r => r.targetId === character.id);
      if (relationship) {
        switch (relationship.type) {
          case 'PARENT':
            return `${displayName}様`;
          case 'MENTOR':
            return `${displayName}先生`;
          case 'LOVER':
            return relationship.strength > 0.8 ? `${displayName}` : `${displayName}さん`;
          case 'LEADER':
            return `${displayName}リーダー`;
          // 他の関係性タイプに応じて追加可能
        }
      }
    }
    
    // 一般的な敬称付加
    if (!displayName.includes('さん') && !displayName.includes('君') && 
        !displayName.includes('様') && !displayName.includes('先生')) {
      displayName += 'さん';
    }
  }
  
  return displayName;
}

/**
 * 文字列からキャラクター名を検出する
 * @param content 内容テキスト
 * @param names 検出対象の名前配列
 * @returns 検出された名前と出現回数のマップ
 */
export function detectCharacterNames(
  content: string, 
  names: string[]
): Map<string, number> {
  const results = new Map<string, number>();
  
  // 各名前について検出
  for (const name of names) {
    if (name.length < 2) continue; // 短すぎる名前はスキップ
    
    // 名前の正規表現パターンを作成
    const pattern = new RegExp(`(^|[^ぁ-んァ-ヶー一-龯])${name}([^ぁ-んァ-ヶー一-龯]|$)`, 'g');
    
    // マッチを検索
    const matches = content.match(pattern);
    
    // マッチした数を記録
    if (matches) {
      results.set(name, matches.length);
    }
  }
  
  return results;
}

/**
 * 生成AIへのプロンプト用にキャラクターをフォーマットする
 * @param characters キャラクター配列
 * @returns プロンプト用テキスト
 */
export function formatCharactersForAIPrompt(characters: Character[]): string {
  return characters.map(character => {
    // 基本情報
    const baseInfo = `【キャラクター情報: ${character.name}】
タイプ: ${character.type}
説明: ${character.description}`;
    
    // 性格
    const personality = character.personality?.traits?.length ?
      `\n性格特性: ${character.personality.traits.join('、')}` : '';
    
    // 背景
    const backstory = character.backstory?.summary ?
      `\n背景: ${character.backstory.summary}` : '';
    
    // 状態
    const state = `\n現在の状態:
- 感情: ${character.state.emotionalState}
- 発展段階: ${character.state.developmentStage}/5
- 最終登場: ${character.state.lastAppearance ? `チャプター${character.state.lastAppearance}` : '未登場'}`;
    
    return `${baseInfo}${personality}${backstory}${state}`;
  }).join('\n\n');
}