/**
 * タイムアウト付きでPromiseを実行する
 * @param {Promise<T>} promise 対象のPromise
 * @param {number} timeoutMs タイムアウト時間（ミリ秒）
 * @param {string} operationName 操作の名前（ログ用）
 * @returns {Promise<T>} 元のPromiseの結果またはタイムアウトエラー
 */
export function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    operationName: string
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`操作がタイムアウトしました: ${operationName} (${timeoutMs}ms)`));
        }, timeoutMs);
      })
    ]);
  }