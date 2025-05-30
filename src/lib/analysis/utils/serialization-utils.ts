/**
 * @fileoverview シリアライゼーションユーティリティ
 * @description
 * キャラクターデータの効率的なシリアライズ/デシリアライズを担当します。
 * これには、キャラクターデータの完全な変換や差分データの処理が含まれます。
 */
import { Character, CharacterDiff, CharacterChange } from '@/types/characters';
import { Logger } from '@/lib/utils/logger';
import { parseYaml, stringifyYaml } from '@/lib/utils/yaml-helper';

const logger = new Logger({ serviceName: 'SerializationUtils' });

/**
 * キャラクターオブジェクトをシリアライズする
 * @param character キャラクターオブジェクト
 * @returns シリアライズされた文字列
 */
export function serializeCharacter(character: Character): string {
  try {
    // 日付オブジェクトを文字列に変換
    const processedCharacter = processDateObjects(character);
    
    // YAMLに変換
    return stringifyYaml(processedCharacter);
  } catch (error) {
    logger.error(`キャラクターのシリアライズに失敗しました: ${character.id}`, {
      error: error instanceof Error ? error.message : String(error)
    });
    throw new Error(`キャラクターのシリアライズに失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * シリアライズされた文字列からキャラクターオブジェクトを復元する
 * @param data シリアライズされた文字列
 * @returns キャラクターオブジェクト
 */
export function deserializeCharacter(data: string): Character {
  try {
    // 文字列形式を検出し、適切なパーサーを使用
    let parsed;
    if (data.trim().startsWith('{')) {
      // JSONと見なす
      parsed = JSON.parse(data);
    } else {
      // YAMLと見なす
      parsed = parseYaml(data);
    }
    
    // 日付文字列をDateオブジェクトに変換
    const character = convertDates(parsed);
    
    return character as Character;
  } catch (error) {
    logger.error('キャラクターのデシリアライズに失敗しました', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw new Error(`キャラクターのデシリアライズに失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * キャラクターの差分データをシリアライズする
 * @param diff 差分データ
 * @returns シリアライズされた文字列
 */
export function serializeDiff(diff: CharacterDiff): string {
  try {
    // 特別な処理が必要な場合はここで行う
    const processedDiff = { ...diff };
    
    // JSONに変換（差分データは構造がシンプルであることが多いのでJSON形式が最適）
    return JSON.stringify(processedDiff);
  } catch (error) {
    logger.error('差分データのシリアライズに失敗しました', {
      error: error instanceof Error ? error.message : String(error),
      characterId: diff.id
    });
    throw new Error(`差分データのシリアライズに失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * シリアライズされた文字列から差分データを復元する
 * @param data シリアライズされた文字列
 * @returns 差分データ
 */
export function deserializeDiff(data: string): CharacterDiff {
  try {
    // JSONからパース
    const diff = JSON.parse(data) as CharacterDiff;
    return diff;
  } catch (error) {
    logger.error('差分データのデシリアライズに失敗しました', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw new Error(`差分データのデシリアライズに失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * キャラクターの部分更新用のJSONパッチを生成する
 * @param original 元のキャラクター
 * @param updated 更新後のキャラクター
 * @returns JSONパッチ操作の配列
 */
export function generateCharacterPatch(original: Character, updated: Character): Array<{
  op: string;
  path: string;
  value?: any;
}> {
    const patches: Array<{ op: string; path: string; value?: any }> = [];
  
  // 階層構造を平坦化し、差分を見つける関数
  function generatePatches(origObj: any, updatedObj: any, path: string = '') {
    // オブジェクトの型が異なる場合は置換
    if (typeof origObj !== typeof updatedObj) {
      patches.push({ op: 'replace', path, value: updatedObj });
      return;
    }
    
    // nullチェック
    if (origObj === null || updatedObj === null) {
      if (origObj !== updatedObj) {
        patches.push({ op: 'replace', path, value: updatedObj });
      }
      return;
    }
    
    // 配列の場合
    if (Array.isArray(origObj) && Array.isArray(updatedObj)) {
      // 配列の内容が完全に異なる場合は置換
      if (JSON.stringify(origObj) !== JSON.stringify(updatedObj)) {
        patches.push({ op: 'replace', path, value: updatedObj });
      }
      return;
    }
    
    // オブジェクトの場合は再帰的に処理
    if (typeof origObj === 'object' && typeof updatedObj === 'object') {
      // 削除されたプロパティを検出
      Object.keys(origObj).forEach(key => {
        if (!(key in updatedObj)) {
          patches.push({ op: 'remove', path: `${path}/${key}` });
        }
      });
      
      // 追加または変更されたプロパティを検出
      Object.keys(updatedObj).forEach(key => {
        const newPath = path ? `${path}/${key}` : `/${key}`;
        
        if (!(key in origObj)) {
          // 新規プロパティ
          patches.push({ op: 'add', path: newPath, value: updatedObj[key] });
        } else if (JSON.stringify(origObj[key]) !== JSON.stringify(updatedObj[key])) {
          // 値が異なる場合は再帰的に処理
          if (
            typeof origObj[key] === 'object' && 
            origObj[key] !== null && 
            typeof updatedObj[key] === 'object' && 
            updatedObj[key] !== null &&
            !Array.isArray(origObj[key]) &&
            !Array.isArray(updatedObj[key])
          ) {
            generatePatches(origObj[key], updatedObj[key], newPath);
          } else {
            // プリミティブ値または配列、または構造が大きく異なる場合は置換
            patches.push({ op: 'replace', path: newPath, value: updatedObj[key] });
          }
        }
      });
    } else if (origObj !== updatedObj) {
      // プリミティブ値が異なる場合は置換
      patches.push({ op: 'replace', path, value: updatedObj });
    }
  }
  
  // ルートから差分生成を開始
  generatePatches(original, updated, '');
  
  return patches;
}

/**
 * JSONパッチをキャラクターに適用する
 * @param character 元のキャラクター
 * @param patches JSONパッチ操作の配列
 * @returns 更新されたキャラクター
 */
export function applyCharacterPatch(
  character: Character, 
  patches: Array<{ op: string; path: string; value?: any; }>
): Character {
  // ディープコピーを作成して変更を適用
  const result = JSON.parse(JSON.stringify(character));
  
  // 各パッチを適用
  for (const patch of patches) {
    // パスをセグメントに分割
    const segments = patch.path.split('/').filter(Boolean);
    
    // 操作対象のオブジェクトと最後のキーを特定
    let target = result;
    let parent = null;
    let lastKey = '';
    
    // 最後のセグメント以外をたどる
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      parent = target;
      target = target[segment];
      
      // 途中のオブジェクトが存在しない場合は作成
      if (target === undefined) {
        if (patch.op === 'add' || patch.op === 'replace') {
          parent[segment] = {};
          target = parent[segment];
        } else {
          // remove操作で存在しないパスの場合はスキップ
          break;
        }
      }
    }
    
    // 最後のセグメント（実際の操作対象）
    if (segments.length > 0) {
      lastKey = segments[segments.length - 1];
    }
    
    // 操作の適用
    switch (patch.op) {
      case 'add':
      case 'replace':
        if (segments.length === 0) {
          // ルートの置換（起こりえないが一応）
          Object.assign(result, patch.value);
        } else {
          target[lastKey] = patch.value;
        }
        break;
        
      case 'remove':
        if (segments.length === 0) {
          // ルートの削除（起こりえないが一応）
          throw new Error('Cannot remove root object');
        } else if (target && lastKey in target) {
          delete target[lastKey];
        }
        break;
        
      default:
        logger.warn(`未対応のJSONパッチ操作: ${patch.op}`);
    }
  }
  
  return result;
}

/**
 * キャラクターデータの最適化（軽量化）バージョンを作成
 * @param character キャラクターオブジェクト
 * @returns 軽量化されたキャラクターオブジェクト
 */
export function createLightweightCharacter(character: Character): any {
  // 必要最小限のプロパティのみを保持
  return {
    id: character.id,
    name: character.name,
    type: character.type,
    shortNames: character.shortNames,
    description: character.description,
    state: {
      isActive: character.state.isActive,
      emotionalState: character.state.emotionalState,
      developmentStage: character.state.developmentStage,
      lastAppearance: character.state.lastAppearance
    },
    personality: character.personality ? {
      traits: character.personality.traits
    } : undefined,
    metadata: {
      lastUpdated: character.metadata.lastUpdated
    }
  };
}

/**
 * 整形されたJSONに変換する
 * @param data 対象オブジェクト
 * @returns 整形されたJSON文字列
 */
export function toFormattedJSON(data: any): string {
  return JSON.stringify(data, null, 2);
}

/**
 * オブジェクト内のDateオブジェクトをISOフォーマットの文字列に変換する
 * @private
 * @param obj 処理対象オブジェクト
 * @returns 変換後のオブジェクト
 */
function processDateObjects(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(item => processDateObjects(item));
  }

  const processed: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    processed[key] = processDateObjects(value);
  }

  return processed;
}

/**
 * オブジェクト内のISOフォーマットの日付文字列をDateオブジェクトに変換する
 * @private
 * @param obj 処理対象オブジェクト
 * @returns 変換後のオブジェクト
 */
function convertDates(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => convertDates(item));
  }

  const processed: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?Z$/.test(value)) {
      processed[key] = new Date(value);
    } else if (typeof value === 'object' && value !== null) {
      processed[key] = convertDates(value);
    } else {
      processed[key] = value;
    }
  }

  return processed;
}

/**
 * キャラクター変更リストをシリアライズする
 * @param changes 変更リスト
 * @returns シリアライズされた文字列
 */
export function serializeChanges(changes: CharacterChange[]): string {
  try {
    return JSON.stringify(changes);
  } catch (error) {
    logger.error('変更リストのシリアライズに失敗しました', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw new Error(`変更リストのシリアライズに失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * シリアライズされた文字列から変更リストを復元する
 * @param data シリアライズされた文字列
 * @returns 変更リスト
 */
export function deserializeChanges(data: string): CharacterChange[] {
  try {
    return JSON.parse(data) as CharacterChange[];
  } catch (error) {
    logger.error('変更リストのデシリアライズに失敗しました', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw new Error(`変更リストのデシリアライズに失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 2つのキャラクター間の差分を検出する
 * @param original 元のキャラクター
 * @param updated 更新後のキャラクター
 * @returns 変更リスト
 */
export function detectCharacterChanges(original: Character, updated: Character): CharacterChange[] {
  const changes: CharacterChange[] = [];
  
  // 変更を検出する関数
  function detectChanges(origObj: any, updatedObj: any, path: string = '') {
    // nullまたはundefinedの処理
    if (origObj === null || origObj === undefined || updatedObj === null || updatedObj === undefined) {
      if (origObj !== updatedObj) {
        changes.push({
          attribute: path,
          previousValue: origObj,
          currentValue: updatedObj
        });
      }
      return;
    }
    
    // 値の型が異なる場合
    if (typeof origObj !== typeof updatedObj) {
      changes.push({
        attribute: path,
        previousValue: origObj,
        currentValue: updatedObj
      });
      return;
    }
    
    // 配列の処理
    if (Array.isArray(origObj) && Array.isArray(updatedObj)) {
      // 配列の内容が異なる場合
      if (JSON.stringify(origObj) !== JSON.stringify(updatedObj)) {
        changes.push({
          attribute: path,
          previousValue: origObj,
          currentValue: updatedObj
        });
      }
      return;
    }
    
    // オブジェクトの処理
    if (typeof origObj === 'object' && typeof updatedObj === 'object') {
      // 全プロパティの検査
      const allKeys = new Set([...Object.keys(origObj), ...Object.keys(updatedObj)]);
      
      for (const key of allKeys) {
        const newPath = path ? `${path}.${key}` : key;
        
        // 追加されたプロパティ
        if (!(key in origObj)) {
          changes.push({
            attribute: newPath,
            previousValue: undefined,
            currentValue: updatedObj[key]
          });
          continue;
        }
        
        // 削除されたプロパティ
        if (!(key in updatedObj)) {
          changes.push({
            attribute: newPath,
            previousValue: origObj[key],
            currentValue: undefined
          });
          continue;
        }
        
        // 再帰的に処理
        detectChanges(origObj[key], updatedObj[key], newPath);
      }
    } else if (origObj !== updatedObj) {
      // プリミティブ値が異なる場合
      changes.push({
        attribute: path,
        previousValue: origObj,
        currentValue: updatedObj
      });
    }
  }
  
  // ルートからの差分検出を開始
  detectChanges(original, updated);
  
  return changes;
}

/**
 * 変更リストを適用してキャラクターを更新する
 * @param character 元のキャラクター
 * @param changes 変更リスト
 * @returns 更新されたキャラクター
 */
export function applyChangesToCharacter(character: Character, changes: CharacterChange[]): Character {
  // ディープコピーを作成して変更を適用
  const result = JSON.parse(JSON.stringify(character));
  
  // 各変更を適用
  for (const change of changes) {
    // パスをセグメントに分割
    const segments = change.attribute.split('.');
    
    // 操作対象のオブジェクトと最後のキーを特定
    let target = result;
    let parent = null;
    
    // 最後のセグメント以外をたどる
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      parent = target;
      
      // 存在しないパスの場合は作成
      if (!(segment in target)) {
        target[segment] = {};
      }
      
      target = target[segment];
    }
    
    // 最後のセグメント（実際の操作対象）
    const lastSegment = segments[segments.length - 1];
    
    // 値の更新
    if (change.currentValue === undefined) {
      // プロパティの削除
      if (lastSegment in target) {
        delete target[lastSegment];
      }
    } else {
      // プロパティの追加または更新
      target[lastSegment] = change.currentValue;
    }
  }
  
  return result;
}

/**
 * 重要度に基づいて変更をフィルタリングする
 * @param changes 変更リスト
 * @param importance 重要度（0-1）
 * @returns フィルタリングされた変更リスト
 */
export function filterChangesByImportance(changes: CharacterChange[], importance: number): CharacterChange[] {
  // 重要な属性のリスト（重要度の高い順）
  const importantAttributes = [
    'type', // キャラクタータイプ
    'state.isActive', // アクティブ状態
    'state.emotionalState', // 感情状態
    'state.developmentStage', // 発展段階
    'personality.traits', // 性格特性
    'backstory.summary', // バックストーリー
    'relationships', // 関係性
    'state.lastAppearance' // 最終登場
  ];
  
  // 重要度に基づいて使用する属性の数を決定
  const attributeCount = Math.ceil(importantAttributes.length * importance);
  const criticalAttributes = importantAttributes.slice(0, attributeCount);
  
  // 変更をフィルタリング
  return changes.filter(change => {
    // 完全一致の場合
    if (criticalAttributes.includes(change.attribute)) {
      return true;
    }
    
    // 前方一致の場合（例: relationships[0].typeなど）
    for (const attr of criticalAttributes) {
      if (change.attribute.startsWith(attr)) {
        return true;
      }
    }
    
    return false;
  });
}