import { useState, useEffect } from 'react';

interface RelationshipNode {
  id: number;
  name: string;
  type: 'MAIN' | 'SUB' | 'MOB';
}

interface RelationshipEdge {
  source: number;
  target: number;
  type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  strength: number; // 0-1
}

interface RelationshipData {
  nodes: RelationshipNode[];
  edges: RelationshipEdge[];
}

export const useCharacterRelationships = () => {
  const [relationships, setRelationships] = useState<RelationshipData>({
    nodes: [],
    edges: []
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // モックデータ取得（実際の実装ではAPIリクエストを行う）
    const fetchRelationships = async () => {
      setIsLoading(true);
      
      try {
        // APIリクエストをシミュレーション
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // モックデータ
        const mockRelationships: RelationshipData = {
          nodes: [
            { id: 0, name: '高橋勇気', type: 'MAIN' },
            { id: 1, name: '鈴木美咲', type: 'SUB' },
            { id: 2, name: '佐藤隆', type: 'SUB' },
            { id: 3, name: '山田先生', type: 'SUB' },
            { id: 4, name: '田中店主', type: 'MOB' },
          ],
          edges: [
            // 主人公と美咲（強い友情）
            { source: 0, target: 1, type: 'POSITIVE', strength: 0.9 },
            // 主人公と佐藤（敵対関係）
            { source: 0, target: 2, type: 'NEGATIVE', strength: 0.8 },
            // 主人公と山田先生（指導関係）
            { source: 0, target: 3, type: 'POSITIVE', strength: 0.6 },
            // 主人公と店主（知り合い）
            { source: 0, target: 4, type: 'POSITIVE', strength: 0.3 },
            // 美咲と佐藤（複雑な関係）
            { source: 1, target: 2, type: 'NEUTRAL', strength: 0.4 },
            // 美咲と山田先生（信頼関係）
            { source: 1, target: 3, type: 'POSITIVE', strength: 0.5 },
            // 佐藤と山田先生（敵対）
            { source: 2, target: 3, type: 'NEGATIVE', strength: 0.7 },
          ]
        };
        
        setRelationships(mockRelationships);
      } catch (error) {
        console.error('Failed to fetch relationships:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRelationships();
  }, []);
  
  return { relationships, isLoading };
};