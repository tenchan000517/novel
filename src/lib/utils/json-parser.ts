// src/lib/utils/json-parser.ts
import { logger } from '@/lib/utils/logger';

/**
 * AIモデルからのレスポンスからJSONを安全に抽出してパースするユーティリティ
 * 
 * マークダウンコードブロック（```json ... ```）からJSONを抽出し、
 * 様々なケースに対応した堅牢なパース機能を提供します。
 */
export class JsonParser {
  /**
   * AI生成モデルのレスポンスからJSONを抽出してパースします
   * 
   * @param response AIモデルからのレスポンス
   * @param defaultValue パースに失敗した場合のデフォルト値
   * @returns パースされたJSONオブジェクト、失敗時はデフォルト値
   */
  static parseFromAIResponse<T>(response: string, defaultValue: T): T {
    try {
      // 1. マークダウンのコードブロックを処理
      const cleanedJson = this.stripMarkdown(response);
      
      // 2. JSONとしてパース
      return JSON.parse(cleanedJson) as T;
    } catch (error) {
      logger.error('JSONレスポンスのパースに失敗しました', {
        error: error instanceof Error ? error.message : String(error),
        responsePreview: response.substring(0, 100) + '...'
      });
      
      // パース失敗時はデフォルト値を返す
      return defaultValue;
    }
  }

  /**
   * マークダウンコードブロックからJSONテキストを抽出する
   * 
   * @private
   * @param response AIからのレスポンス
   * @returns マークダウン記法を除去したJSONテキスト
   */
  private static stripMarkdown(response: string): string {
    // ステップ1: 典型的なJSONコードブロックを検出
    const jsonBlockPattern = /```(?:json)?\s*\n([\s\S]*?)```/;
    const jsonBlockMatch = response.match(jsonBlockPattern);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
      return jsonBlockMatch[1].trim();
    }

    // ステップ2: 行頭のコードブロック記法のみを削除
    const startPattern = /^```(?:json)?\s*\n/m;
    const endPattern = /\n```\s*$/m;
    let cleaned = response;
    
    if (startPattern.test(cleaned)) {
      cleaned = cleaned.replace(startPattern, '');
    }
    
    if (endPattern.test(cleaned)) {
      cleaned = cleaned.replace(endPattern, '');
    }
    
    // ステップ3: もし上記の処理で有効なJSONになればそれを返す
    try {
      JSON.parse(cleaned);
      return cleaned;
    } catch (e) {
      // 有効なJSONでない場合は次のステップへ
    }

    // ステップ4: JSONっぽいオブジェクトを探す（最も外側の中括弧のペア）
    const jsonObjectPattern = /{[\s\S]*?}/;
    const objectMatch = response.match(jsonObjectPattern);
    if (objectMatch) {
      try {
        JSON.parse(objectMatch[0]);
        return objectMatch[0];
      } catch (e) {
        // 有効なJSONでない場合は次のステップへ
      }
    }

    // ステップ5: JSONの配列を探す
    const jsonArrayPattern = /\[[\s\S]*?\]/;
    const arrayMatch = response.match(jsonArrayPattern);
    if (arrayMatch) {
      try {
        JSON.parse(arrayMatch[0]);
        return arrayMatch[0];
      } catch (e) {
        // 有効なJSONでない場合は次のステップへ
      }
    }

    // 何も見つからない場合は元のレスポンスをそのまま返す
    // （パース時にエラーになるが、呼び出し元でtry-catchされている）
    return response;
  }
}