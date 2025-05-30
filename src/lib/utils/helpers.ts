// src/lib/utils/helpers.ts
import { randomBytes } from 'crypto';

/**
 * 汎用ヘルパー関数
 */

/**
 * 指定ミリ秒間スリープする
 * @param ms スリープ時間（ミリ秒）
 * @returns Promise
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 指定回数まで関数の実行を再試行する
 * @param fn 実行する関数
 * @param retries 最大再試行回数
 * @param delay 再試行の間隔（ミリ秒）
 * @param backoff 再試行ごとの遅延倍率
 * @returns 関数の実行結果
 */
export async function retry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 300,
    backoff = 2
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) {
            throw error;
        }

        await sleep(delay);
        return retry(fn, retries - 1, delay * backoff, backoff);
    }
}

/**
 * オブジェクトの深いクローンを作成
 * @param obj クローン対象のオブジェクト
 * @returns クローンされたオブジェクト
 */
//   export function deepClone<T>(obj: T): T {
//     return JSON.parse(JSON.stringify(obj));
//   }

// より安全な深いクローンを実装
// JSON.parse(JSON.stringify(obj)) は関数やundefinedを失うため、注意が必要
export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item)) as unknown as T;
    }

    const cloned = {} as Record<string, any>;
    Object.keys(obj as Record<string, any>).forEach(key => {
        cloned[key] = deepClone((obj as Record<string, any>)[key]);
    });

    return cloned as T;
}

/**
 * YAMLデータをJavaScriptオブジェクトにパース
 * @param yamlString YAMLデータ文字列
 * @returns パースされたオブジェクト
 */
export function parseYaml<T>(yamlString: string): T {
    const yaml = require('js-yaml');
    return yaml.load(yamlString) as T;
}

/**
 * JavaScriptオブジェクトをYAML文字列に変換
 * @param data 変換対象のオブジェクト
 * @returns YAML文字列
 */
export function stringifyYaml(data: unknown): string {
    const yaml = require('js-yaml');
    return yaml.dump(data, {
        indent: 2,
        lineWidth: 100,
        noRefs: true,
    });
}

/**
 * ランダムなIDを生成
 * @param prefix IDの接頭辞
 * @returns ランダムなID
 */
// export function generateId(prefix = ''): string {
//     const timestamp = Date.now().toString(36);
//     const randomStr = Math.random().toString(36).substring(2, 10);
//     return `${prefix}${timestamp}${randomStr}`;
// }

export function generateId(length: number = 16): string {
    return randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }

/**
* 日付を YYYY-MM-DD 形式の文字列に変換する
* @param date 日付オブジェクト（デフォルト: 現在の日付）
* @returns フォーマットされた日付文字列
*/
export function formatDate(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * オブジェクトを日付でソートする
 * @param array ソートする配列
 * @param dateField 日付フィールドのキー
 * @param ascending 昇順にソートするかどうか（デフォルト: false = 降順）
 * @returns ソートされた配列
 */
export function sortByDate<T>(array: T[], dateField: keyof T, ascending: boolean = false): T[] {
    return [...array].sort((a, b) => {
        const dateA = new Date(a[dateField] as unknown as string);
        const dateB = new Date(b[dateField] as unknown as string);

        return ascending
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
    });
}

/**
 * データを指定されたチャンクサイズに分割
 * @param array 分割対象の配列
 * @param chunkSize チャンクサイズ
 * @returns 分割された配列の配列
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }
    return result;
}

/**
* 文字列の文字数を制限する
* @param text 制限する文字列
* @param limit 最大文字数
* @param suffix 制限された場合に追加するサフィックス（デフォルト: '...'）
* @returns 制限された文字列
*/
export function truncateText(text: string, limit: number, suffix: string = '...'): string {
    if (text.length <= limit) {
        return text;
    }

    return text.slice(0, limit) + suffix;
}

/**
* 文字列から要約を生成する
* @param text 元の文字列
* @param sentenceCount 要約に含める文の数（デフォルト: 3）
* @returns 要約された文字列
*/
export function summarizeText(text: string, sentenceCount: number = 3): string {
    const sentences = text
        .replace(/([.!?。！？])\s*(?=[A-Z])/g, '$1|')
        .split('|')
        .filter(sentence => sentence.trim().length > 0);

    if (sentences.length <= sentenceCount) {
        return text;
    }

    return sentences.slice(0, sentenceCount).join(' ');
}

/**
 * オブジェクトからnullとundefinedのプロパティを除去
 * @param obj 対象オブジェクト
 * @returns nullとundefinedが除去されたオブジェクト
 */
export function removeNullish<T extends Record<string, unknown>>(obj: T): Partial<T> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined) {
            acc[key as keyof T] = value as T[keyof T];
        }
        return acc;
    }, {} as Partial<T>);
}

/**
 * 指定されたキーで配列をグループ化
 * @param array グループ化する配列
 * @param keyFn キーを取得する関数
 * @returns グループ化されたオブジェクト
 */
export function groupBy<T, K extends string | number>(
    array: T[],
    keyFn: (item: T) => K
): Record<K, T[]> {
    return array.reduce((result, item) => {
        const key = keyFn(item);
        (result[key] = result[key] || []).push(item);
        return result;
    }, {} as Record<K, T[]>);
}

/**
 * 2つのオブジェクトの差分を取得
 * @param obj1 比較元オブジェクト
 * @param obj2 比較先オブジェクト
 * @returns 差分オブジェクト
 */
export function objectDiff<T extends Record<string, unknown>>(
    obj1: T,
    obj2: T
): Partial<T> {
    const diff: Partial<T> = {};

    // プロパティごとに比較
    Object.keys(obj2).forEach(key => {
        const typedKey = key as keyof T;

        // 値が異なる場合のみ差分に追加
        if (JSON.stringify(obj1[typedKey]) !== JSON.stringify(obj2[typedKey])) {
            diff[typedKey] = obj2[typedKey];
        }
    });

    return diff;
}

/**
 * 文字列を単語数制限で切り詰める
 * @param text 元の文字列
 * @param wordLimit 単語数制限
 * @param suffix 切り詰め時に追加する接尾辞
 * @returns 切り詰められた文字列
 */
export function truncateByWords(
    text: string,
    wordLimit: number,
    suffix = '...'
): string {
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) {
        return text;
    }

    return words.slice(0, wordLimit).join(' ') + suffix;
}