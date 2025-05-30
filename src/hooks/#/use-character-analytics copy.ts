import { useState, useEffect } from 'react';

interface AppearanceData {
  name: string;
  count: number;
  color: string;
}

interface CharacterDetailData {
  id: string;
  name: string;
  type: string;
  color?: string;
  emotionalState: string;
  lastAppearance: number;
  appearanceCount: number;
  relatedCharacters: number;
  development: Array<{
    category: string;
    value: number;
  }>;
}

interface CharacterAnalyticsData {
  appearances: AppearanceData[];
  interactions: any[];
  development: any[];
}

export const useCharacterAnalytics = () => {
  const [data, setData] = useState<CharacterAnalyticsData>({
    appearances: [],
    interactions: [],
    development: []
  });
  
  const [characterData, setCharacterData] = useState<CharacterDetailData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // APIリクエストをシミュレーション
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // キャラクター登場頻度のモックデータ
        const mockAppearances: AppearanceData[] = [
          { name: '高橋勇気', count: 45, color: '#3B82F6' }, // 主人公
          { name: '鈴木美咲', count: 38, color: '#EC4899' }, // ヒロイン
          { name: '佐藤隆', count: 25, color: '#EF4444' },   // 敵対者
          { name: '山田先生', count: 18, color: '#10B981' }, // メンター
          { name: 'その他', count: 30, color: '#6B7280' }    // その他
        ];
        
        // キャラクター詳細データのモック
        const mockCharacterData: CharacterDetailData[] = [
          {
            id: 'char-1',
            name: '高橋勇気',
            type: 'MAIN',
            color: '#3B82F6',
            emotionalState: '決意',
            lastAppearance: 45,
            appearanceCount: 45,
            relatedCharacters: 12,
            development: [
              { category: '性格', value: 85 },
              { category: '能力', value: 90 },
              { category: '関係性', value: 75 },
              { category: '背景', value: 95 }
            ]
          },
          {
            id: 'char-2',
            name: '鈴木美咲',
            type: 'MAIN',
            color: '#EC4899',
            emotionalState: '心配',
            lastAppearance: 44,
            appearanceCount: 38,
            relatedCharacters: 8,
            development: [
              { category: '性格', value: 80 },
              { category: '能力', value: 70 },
              { category: '関係性', value: 95 },
              { category: '背景', value: 85 }
            ]
          },
          {
            id: 'char-3',
            name: '佐藤隆',
            type: 'SUB',
            color: '#EF4444',
            emotionalState: '怒り',
            lastAppearance: 45,
            appearanceCount: 25,
            relatedCharacters: 5,
            development: [
              { category: '性格', value: 85 },
              { category: '能力', value: 80 },
              { category: '関係性', value: 70 },
              { category: '背景', value: 60 }
            ]
          },
          {
            id: 'char-4',
            name: '山田先生',
            type: 'SUB',
            color: '#10B981',
            emotionalState: '冷静',
            lastAppearance: 43,
            appearanceCount: 18,
            relatedCharacters: 6,
            development: [
              { category: '性格', value: 70 },
              { category: '能力', value: 90 },
              { category: '関係性', value: 60 },
              { category: '背景', value: 75 }
            ]
          }
        ];
        
        setData({
          appearances: mockAppearances,
          interactions: [], // 現在は使用していない
          development: []   // 現在は使用していない
        });
        
        setCharacterData(mockCharacterData);
      } catch (error) {
        console.error('Failed to fetch character analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return { data, characterData, isLoading };
};