// src/app/api/editor/learning/route.ts
/**
 * @fileoverview 編集者フィードバックの履歴から学習インサイトにアクセスするためのAPIエンドポイント。
 * @file src/app/api/editor/learning/route.ts
 * @description このファイルは、履歴フィードバックデータから学習インサイトを取得するNext.js APIルートを定義しています。
 * LearningEngineを活用して、収集されたフィードバック履歴に基づいてパターンを分析し、潜在的な改善点を特定し、
 * 将来の問題を予測します。
 * 
 * このエンドポイントは、編集者インターフェースに実用的なインサイトと学習ベースの推奨事項を提供し、
 * 時間の経過とともにコンテンツの品質と一貫性を向上させることを目的としています。
 * 
 * @requires next/server
 * @requires @/lib/editor/learning-engine
 */

import { NextResponse } from 'next/server';
import { LearningEngine } from '@/lib/editor/learning-engine';

/**
 * フィードバック履歴の処理に使用されるLearningEngineのシングルトンインスタンス。
 */
const learningEngine = new LearningEngine();

/**
 * 学習インサイトエンドポイントのGETハンドラー。
 * 
 * @async
 * @function GET
 * @description 学習エンジンを通じて履歴フィードバックデータを処理することで学習インサイトを取得します。
 * このメソッドは、過去の編集者フィードバックからパターン、改善提案、予測を抽出し、
 * 実用的なインサイトを提供します。
 * 
 * @returns {Promise<NextResponse>} 以下を含むNext.js Responseオブジェクト：
 *   - 成功時: `success: true`と以下を含む`result`オブジェクトを持つJSON:
 *     - patterns: フィードバック履歴から認識されたパターンの配列
 *     - improvements: 優先度付きのコンポーネント改善提案の配列
 *     - predictions: 確率と予防戦略を持つ潜在的な将来の問題の配列
 *   - 失敗時: エラー詳細と500ステータスコードを持つJSON
 * 
 * @example
 * // 成功時のレスポンス構造:
 * {
 *   success: true,
 *   result: {
 *     patterns: [
 *       {
 *         type: "CONSISTENCY_ISSUE",
 *         description: "キャラクターまたはプロットの一貫性に関する問題",
 *         confidence: 0.8,
 *         parameters: { target: "CHARACTER" }
 *       }
 *     ],
 *     improvements: [
 *       {
 *         component: "CHARACTER_MANAGER",
 *         description: "キャラクターの一貫性チェック機能を強化する",
 *         priority: "HIGH"
 *       }
 *     ],
 *     predictions: [
 *       {
 *         issue: "キャラクター設定の矛盾",
 *         probability: 0.75,
 *         prevention: "キャラクターデータベースの統合的な管理"
 *       }
 *     ]
 *   }
 * }
 * 
 * @throws 学習プロセスが失敗した場合、エラー詳細と共に500ステータスコードを返します
 */
export async function GET() {
  try {
    // 学習結果を取得
    const result = await learningEngine.learnFromHistory();
    
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Failed to fetch learning insights:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch learning insights', details: (error as Error).message },
      { status: 500 }
    );
  }
}