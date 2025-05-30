// src/lib/utils/yaml-helper.ts
import yaml from 'js-yaml';
import { logger } from './logger';

/**
 * YAMLテキストをJavaScriptオブジェクトにパースする
 * @param text パースするYAMLテキスト
 * @returns パースされたオブジェクト
 */
export function parseYaml(text: string): any {
  try {
    return yaml.load(text) || {};
  } catch (error) {
    // 複数ドキュメントエラーを特別に処理
    if (error instanceof Error && error.message.includes('expected a single document')) {
      logger.warn('Multiple YAML documents detected, trying to parse first document only');

      // 最初のドキュメントのみを確実に抽出
      const firstDocMatch = text.split(/^---$/m)[0] || text.split(/^---\n/m)[0];
      if (firstDocMatch) {
        try {
          return yaml.load(firstDocMatch) || {};
        } catch (innerError) {
          logger.error('Failed to parse first YAML document', {
            error: innerError instanceof Error ? innerError.message : String(innerError)
          });
        }
      }

      // それでも失敗する場合は、正規表現で強制的にYAMLヘッダーだけを抽出
      const headerMatch = text.match(/---([\s\S]*?)---/);
      if (headerMatch && headerMatch[1]) {
        try {
          return yaml.load(headerMatch[1].trim()) || {};
        } catch (headerError) {
          logger.error('Failed to parse YAML header', {
            error: headerError instanceof Error ? headerError.message : String(headerError)
          });
        }
      }
    }

    logger.error('Failed to parse YAML', {
      error: error instanceof Error ? error.message : String(error)
    });
    return {}; // エラー時は空オブジェクトを返す
  }
}

/**
 * JavaScriptオブジェクトをYAML形式の文字列に変換する
 * @param data 変換するオブジェクト
 * @returns YAML文字列
 */
export function stringifyYaml(data: any): string {
  try {
    return yaml.dump(data, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
    });
  } catch (error) {
    // errorを正しい形式で渡す
    logger.error('Failed to stringify to YAML', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return ''; // エラー時は空文字列を返す
  }
}

/**
 * YAML配列をマージする
 * @param target マージ先の配列
 * @param source マージ元の配列
 * @param key 一意なキーとして使用するプロパティ名
 * @returns マージされた配列
 */
export function mergeYamlArrays<T>(target: T[], source: T[], key: keyof T): T[] {
  if (!Array.isArray(target)) target = [];
  if (!Array.isArray(source)) return target;

  const result = [...target];

  source.forEach(sourceItem => {
    const targetIndex = result.findIndex(targetItem =>
      targetItem[key] === sourceItem[key]
    );

    if (targetIndex >= 0) {
      // 既存アイテムの更新
      result[targetIndex] = { ...result[targetIndex], ...sourceItem };
    } else {
      // 新規アイテムの追加
      result.push(sourceItem);
    }
  });

  return result;
}

/**
 * ネストされたYAMLオブジェクトから指定パスのプロパティを安全に取得する
 * @param obj 対象オブジェクト
 * @param path ドット区切りのプロパティパス (例: "user.profile.name")
 * @param defaultValue プロパティが存在しない場合のデフォルト値
 * @returns プロパティの値またはデフォルト値
 */
export function getNestedYamlProperty(obj: any, path: string, defaultValue: any = undefined): any {
  if (!obj || typeof obj !== 'object') return defaultValue;

  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length; i++) {
    if (current === undefined || current === null) {
      return defaultValue;
    }

    current = current[parts[i]];
  }

  return current !== undefined ? current : defaultValue;
}