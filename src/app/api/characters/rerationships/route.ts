// src\app\api\characters\rerationships\route.ts
/**
 * @fileoverview キャラクター関係性のためのAPI実装
 * @description このファイルはキャラクター間の関係性グラフを取得するためのAPIエンドポイントを提供します。
 * 次の3つのケースをサポートしています：
 * 1. 特定のキャラクターの関係性グラフを取得（characterIdクエリパラメータを使用）
 * 2. 特定タイプの関係性を持つキャラクターとその関係性を取得（typeクエリパラメータを使用）
 * 3. すべてのキャラクター間の関係性グラフを取得（パラメータなし）
 * 
 * @requires next/server
 * @requires @/lib/characters/manager
 * @requires @/lib/utils/logger
 * @requires @/types/characters
 * 
 * @typedef {import('@/types/characters').Character} Character
 * @typedef {import('@/types/characters').Relationship} Relationship
 * @typedef {import('@/types/characters').RelationshipType} RelationshipType
 */

import { NextResponse } from 'next/server';
import { CharacterManager } from '@/lib/characters/manager';
import { logger } from '@/lib/utils/logger';
import { Character, Relationship, RelationshipType } from '@/types/characters';

// シングルトンのキャラクターマネージャーインスタンス
const characterManager = new CharacterManager();

/**
 * キャラクター関係性グラフを取得する
 * 
 * @async
 * @function GET
 * @param {Request} request - HTTPリクエストオブジェクト
 * @returns {Promise<NextResponse>} 関係性グラフデータを含むJSONレスポンス
 * 
 * @example
 * // 特定のキャラクターの関係性を取得
 * GET /api/characters/relationships?characterId=abc123
 * 
 * // 特定タイプの関係性を取得
 * GET /api/characters/relationships?type=FRIEND
 * 
 * // すべての関係性を取得
 * GET /api/characters/relationships
 * 
 * @throws {NextResponse} 404 - 指定されたキャラクターが見つからない場合
 * @throws {NextResponse} 500 - サーバーエラーが発生した場合
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');
    const type = searchParams.get('type');
    
    let relationshipGraph;
    
    // 特定のキャラクターの関係を取得
    if (characterId) {
      // キャラクター存在確認
      const character = await characterManager.getCharacter(characterId);
      if (!character) {
        return NextResponse.json(
          { 
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `Character with ID ${characterId} not found`
            }
          },
          { status: 404 }
        );
      }
      
      // キャラクター関係を取得
      const relationshipData = await characterManager.getCharacterRelationships(characterId);
      const connectedCharacters = relationshipData || [];
      
      // 関係性を取得してフォーマット
      const relationships = [];
      
      for (const connected of connectedCharacters) {
        if (connected.relationship) {
          relationships.push({
            source: characterId,
            target: connected.id,
            type: connected.relationship.type,
            strength: connected.relationship.strength,
          });
        }
      }
      
      relationshipGraph = {
        nodes: [character, ...connectedCharacters.map((c: any) => c.character || c)],
        edges: relationships,
        metrics: {
          connections: relationships.length,
          averageStrength: relationships.length > 0 
            ? relationships.reduce((sum: number, rel) => sum + rel.strength, 0) / relationships.length 
            : 0
        }
      };
    } 
    // 特定タイプの関係を取得
    else if (type) {
      // タイプによるフィルタリング
      const characters = await characterManager.getAllCharacters();
      const analysis = await characterManager.getRelationshipAnalysis();
      
      // タイプでフィルタリング（型を明示的に指定）
      const filteredEdges = analysis.visualData.edges.filter((edge: {
        type: RelationshipType;
        source: string;
        target: string;
        strength: number;
      }) => edge.type === type);
      
      const relatedCharacterIds = new Set<string>();
      
      filteredEdges.forEach((edge: { source: string; target: string }) => {
        relatedCharacterIds.add(edge.source);
        relatedCharacterIds.add(edge.target);
      });
      
      const filteredNodes = characters.filter(char => relatedCharacterIds.has(char.id));
      
      relationshipGraph = {
        nodes: filteredNodes,
        edges: filteredEdges,
        metrics: {
          connectionCount: filteredEdges.length,
          characterCount: filteredNodes.length,
          averageStrength: filteredEdges.length > 0
            ? filteredEdges.reduce((sum: number, edge: { strength: number }) => sum + edge.strength, 0) / filteredEdges.length
            : 0
        }
      };
    }
    // 全体の関係グラフを取得
    else {
      const analysis = await characterManager.getRelationshipAnalysis();
      relationshipGraph = {
        nodes: analysis.visualData.nodes,
        edges: analysis.visualData.edges,
        metrics: {
          clusters: analysis.clusters.length,
          tensions: analysis.tensions.length,
          totalRelationships: analysis.visualData.edges.length
        }
      };
    }
    
    logger.info(`Retrieved relationship graph with ${relationshipGraph.nodes.length} nodes and ${relationshipGraph.edges.length} edges`);
    
    return NextResponse.json({
      success: true,
      data: relationshipGraph
    });
  } catch (error) {
    logger.error('Failed to fetch relationship graph', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch relationship graph'
        }
      },
      { status: 500 }
    );
  }
}