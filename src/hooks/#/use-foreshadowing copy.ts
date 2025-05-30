import { useState, useEffect } from 'react';

interface ForeshadowingElement {
  id: string;
  description: string;
  context: string;
  chapterIntroduced: number;
  isResolved: boolean;
  plannedResolution?: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  relatedCharacters?: string[];
  relatedElements?: string[];
}

interface ForeshadowingStatistics {
  totalCount: number;
  resolvedCount: number;
  pendingCount: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  plannedResolutionCount: number;
}

export const useForeshadowing = () => {
  const [foreshadowingElements, setForeshadowingElements] = useState<ForeshadowingElement[]>([]);
  const [statistics, setStatistics] = useState<ForeshadowingStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // APIリクエストをシミュレーション
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 伏線要素のモックデータ
        const mockElements: ForeshadowingElement[] = [
          {
            id: 'fs-1',
            description: '古代の剣の伝説',
            context: '主人公の祖父が語った古代の剣の伝説。後に実際に発見される。',
            chapterIntroduced: 5,
            isResolved: true,
            priority: 'HIGH',
            relatedCharacters: ['高橋勇気', '祖父']
          },
          {
            id: 'fs-2',
            description: '謎の組織の存在',
            context: '山田先生の過去の発言から、謎の組織の存在がほのめかされる。',
            chapterIntroduced: 12,
            isResolved: true,
            priority: 'MEDIUM',
            relatedCharacters: ['山田先生']
          },
          {
            id: 'fs-3',
            description: '主人公の特殊な能力',
            context: '幼少期に一度だけ発現した謎の能力。後に覚醒する。',
            chapterIntroduced: 8,
            isResolved: true,
            priority: 'HIGH',
            relatedCharacters: ['高橋勇気']
          },
          {
            id: 'fs-4',
            description: '佐藤隆の秘密',
            context: '佐藤隆が持っている不自然な知識と能力。敵対者としての正体を示唆。',
            chapterIntroduced: 15,
            isResolved: true,
            priority: 'HIGH',
            relatedCharacters: ['佐藤隆']
          },
          {
            id: 'fs-5',
            description: '古代寺院の場所',
            context: '古文書に記された古代寺院の場所の暗号。',
            chapterIntroduced: 30,
            isResolved: true,
            priority: 'MEDIUM'
          },
          {
            id: 'fs-6',
            description: '姉の行方不明事件',
            context: '鈴木美咲の姉が謎の事件で行方不明になった経緯。',
            chapterIntroduced: 20,
            isResolved: false,
            plannedResolution: 50,
            priority: 'HIGH',
            relatedCharacters: ['鈴木美咲', '美咲の姉']
          },
          {
            id: 'fs-7',
            description: '古代の予言',
            context: '寺院の壁画に描かれた世界の終末と救世主の予言。',
            chapterIntroduced: 35,
            isResolved: false,
            plannedResolution: 55,
            priority: 'HIGH'
          },
          {
            id: 'fs-8',
            description: '友情の証',
            context: '主人公と親友が交換した友情の証。危機的状況で重要な役割を果たす。',
            chapterIntroduced: 25,
            isResolved: false,
            plannedResolution: 48,
            priority: 'MEDIUM',
            relatedCharacters: ['高橋勇気', '鈴木美咲']
          },
          {
            id: 'fs-9',
            description: '謎の石版',
            context: '無意味に見える記号が刻まれた石版。実は最終決戦の鍵。',
            chapterIntroduced: 40,
            isResolved: false,
            plannedResolution: 52,
            priority: 'HIGH'
          },
          {
            id: 'fs-10',
            description: '山田先生の過去',
            context: '山田先生が語った謎めいた過去。実は古代の守護者の子孫。',
            chapterIntroduced: 22,
            isResolved: false,
            plannedResolution: 47,
            priority: 'MEDIUM',
            relatedCharacters: ['山田先生']
          }
        ];
        
        // 統計データを計算
        const resolved = mockElements.filter(e => e.isResolved);
        const pending = mockElements.filter(e => !e.isResolved);
        const highPriority = mockElements.filter(e => e.priority === 'HIGH');
        const mediumPriority = mockElements.filter(e => e.priority === 'MEDIUM');
        const lowPriority = mockElements.filter(e => e.priority === 'LOW');
        const plannedResolution = pending.filter(e => e.plannedResolution !== undefined);
        
        const stats: ForeshadowingStatistics = {
          totalCount: mockElements.length,
          resolvedCount: resolved.length,
          pendingCount: pending.length,
          highPriorityCount: highPriority.length,
          mediumPriorityCount: mediumPriority.length,
          lowPriorityCount: lowPriority.length,
          plannedResolutionCount: plannedResolution.length
        };
        
        setForeshadowingElements(mockElements);
        setStatistics(stats);
      } catch (error) {
        console.error('Failed to fetch foreshadowing data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return { foreshadowingElements, statistics, isLoading };
};