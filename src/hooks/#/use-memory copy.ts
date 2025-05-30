import { useState, useEffect } from 'react';

interface MemoryNode {
  id: string;
  name: string;
  description?: string;
  chapter?: number;
  children?: MemoryNode[];
  expanded?: boolean;
}

interface MemoryHierarchy {
  root: MemoryNode;
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  type: 'CHAPTER' | 'CHARACTER' | 'PLOT' | 'WORLD';
  timestamp: string;
  chapter?: number;
}

interface MemoryDetail {
  id: string;
  title: string;
  type: string;
  content: string;
  chapter?: number;
  timestamp?: string;
  connections?: Array<{
    id: string;
    title: string;
    type: string;
  }>;
  metadata?: Record<string, string | number | boolean>;
}

export const useMemory = () => {
  const [hierarchy, setHierarchy] = useState<MemoryHierarchy>({
    root: {
      id: 'root',
      name: 'メモリー階層',
      expanded: true,
      children: []
    }
  });
  
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<MemoryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // モックデータのロード
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // APIリクエストをシミュレーション
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 階層データのモック
        const mockHierarchy: MemoryHierarchy = {
          root: {
            id: 'root',
            name: 'メモリー階層',
            expanded: true,
            children: [
              {
                id: 'short-term',
                name: '短期記憶',
                expanded: true,
                children: [
                  {
                    id: 'recent-chapters',
                    name: '最近のチャプター',
                    expanded: false,
                    children: [
                      { id: 'ch-45', name: 'チャプター45', description: '運命の十字路', chapter: 45 },
                      { id: 'ch-44', name: 'チャプター44', description: '古代寺院の秘密', chapter: 44 },
                      { id: 'ch-43', name: 'チャプター43', description: '友の裏切り', chapter: 43 }
                    ]
                  },
                  {
                    id: 'recent-events',
                    name: '最近のイベント',
                    expanded: false,
                    children: [
                      { id: 'ev-1', name: '剣の発見', description: '主人公が古代の剣を発見', chapter: 44 },
                      { id: 'ev-2', name: '友の正体', description: '親友の正体が明らかに', chapter: 43 }
                    ]
                  }
                ]
              },
              {
                id: 'mid-term',
                name: '中期記憶',
                expanded: false,
                children: [
                  {
                    id: 'arc-current',
                    name: '現在のアーク',
                    description: '古代寺院探索編',
                    expanded: false,
                    children: [
                      { id: 'arc-goal', name: '目標', description: '古代の力の源を見つける' },
                      { id: 'arc-obstacle', name: '障害', description: '敵対者の妨害と罠' }
                    ]
                  }
                ]
              },
              {
                id: 'long-term',
                name: '長期記憶',
                expanded: false,
                children: [
                  { id: 'world', name: '世界設定', description: '現代日本の裏に存在する古代の力' },
                  { id: 'main-plot', name: 'メインプロット', description: '世界を滅亡から救う使命' },
                  { id: 'char-background', name: 'キャラクター背景', description: '主要キャラクターの過去と動機' }
                ]
              }
            ]
          }
        };
        
        // タイムラインデータのモック
        const mockTimeline: TimelineEvent[] = [
          { 
            id: 'event-1', 
            title: 'チャプター45完了', 
            description: '運命の十字路チャプターが完成', 
            type: 'CHAPTER',
            timestamp: '2時間前',
            chapter: 45
          },
          { 
            id: 'event-2', 
            title: 'キャラクター発展', 
            description: '主人公が新しい能力に目覚める', 
            type: 'CHARACTER',
            timestamp: '5時間前',
            chapter: 45
          },
          { 
            id: 'event-3', 
            title: 'プロット進行', 
            description: '敵対者の真の目的が明らかに', 
            type: 'PLOT',
            timestamp: '1日前',
            chapter: 44
          },
          { 
            id: 'event-4', 
            title: '世界設定の拡張', 
            description: '古代寺院の歴史と意義が追加', 
            type: 'WORLD',
            timestamp: '2日前'
          },
          { 
            id: 'event-5', 
            title: 'チャプター44完了', 
            description: '古代寺院の秘密チャプターが完成', 
            type: 'CHAPTER',
            timestamp: '2日前',
            chapter: 44
          }
        ];

        setHierarchy(mockHierarchy);
        setTimeline(mockTimeline);
      } catch (error) {
        console.error('Failed to load memory data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // ノードの展開
  const expandNode = (nodeId: string) => {
    const updateNodes = (nodes: MemoryNode[]): MemoryNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, expanded: true };
        }
        
        if (node.children) {
          return {
            ...node,
            children: updateNodes(node.children)
          };
        }
        
        return node;
      });
    };
    
    setHierarchy(prev => ({
      ...prev,
      root: {
        ...prev.root,
        children: prev.root.children ? updateNodes(prev.root.children) : []
      }
    }));
  };
  
  // ノードの折りたたみ
  const collapseNode = (nodeId: string) => {
    const updateNodes = (nodes: MemoryNode[]): MemoryNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, expanded: false };
        }
        
        if (node.children) {
          return {
            ...node,
            children: updateNodes(node.children)
          };
        }
        
        return node;
      });
    };
    
    setHierarchy(prev => ({
      ...prev,
      root: {
        ...prev.root,
        children: prev.root.children ? updateNodes(prev.root.children) : []
      }
    }));
  };
  
  // メモリーの検索
  const searchMemory = async (query: string, type: string = 'ALL') => {
    setIsSearching(true);
    
    try {
      // APIリクエストをシミュレーション
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 検索結果のモックデータ
      const mockResults: MemoryDetail = {
        id: 'search-result',
        title: `「${query}」の検索結果`,
        type: 'SEARCH_RESULT',
        content: `「${query}」に関連する情報が見つかりました。この情報はチャプター42から44にかけて登場し、主に主人公と親友のやり取りの中で言及されています。\n\n最初の言及はチャプター42の神社シーンで、その後チャプター44でより詳細に展開されています。今後の展開にも影響する重要な要素です。`,
        connections: [
          { id: 'con-1', title: 'チャプター44', type: 'CHAPTER' },
          { id: 'con-2', title: '主人公', type: 'CHARACTER' },
          { id: 'con-3', title: '古代の剣', type: 'ARTIFACT' }
        ],
        metadata: {
          relevance: 0.92,
          occurrences: 8,
          firstMention: 42,
          lastMention: 44
        }
      };
      
      setSelectedMemory(mockResults);
    } catch (error) {
      console.error('Memory search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  return {
    hierarchy,
    expandNode,
    collapseNode,
    timeline,
    selectedMemory,
    setSelectedMemory,
    searchMemory,
    isLoading,
    isSearching
  };
};