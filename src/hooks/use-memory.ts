import { useState, useEffect, useCallback } from 'react';
import { 
  ChapterMemory, 
  KeyEvent, 
  CharacterState, 
  ArcMemory,
  Foreshadowing, 
  WorldSettings,
  CharacterArchetype,
  Memory,
  SearchResult
} from '@/types/memory';

// Define Relationship type to match the CharacterState usage
interface Relationship {
  character: string;
  relation: string;
  trust_level?: number;
}
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
  
  // Load memory data from the API
  useEffect(() => {
    const loadMemoryData = async () => {
      setIsLoading(true);
      
      try {
        // Get memory system status to initialize the hierarchy
        const statusResponse = await fetch('/api/memory/status');
        const statusData = await statusResponse.json();
        
        if (!statusData.success) {
          throw new Error('Failed to load memory status');
        }
        
        // Construct hierarchy based on status data
        const memoryStatus = statusData.data;
        
        // Get recent chapters for short-term memory
        const recentChaptersResponse = await fetch('/api/memory/chapters/recent');
        const recentChaptersData = await recentChaptersResponse.json();
        
        // Get current arc info
        const currentArcResponse = await fetch('/api/memory/arc/current');
        const currentArcData = await currentArcResponse.json();
        
        // Get long-term info
        const longTermResponse = await fetch('/api/memory/longTerm');
        const longTermData = await longTermResponse.json();
        
        // Build the hierarchy
        const hierarchyData = buildHierarchy(
          recentChaptersData.data,
          currentArcData.data,
          longTermData.data
        );
        
        setHierarchy(hierarchyData);
        
        // Build timeline from recent events
        const timelineEvents = buildTimeline(
          recentChaptersData.data,
          currentArcData.data
        );
        
        setTimeline(timelineEvents);
        
      } catch (error) {
        console.error('Failed to load memory data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMemoryData();
  }, []);
  
  // Helper function to build the memory hierarchy
  const buildHierarchy = (
    shortTermMemories: ChapterMemory[], 
    currentArc: ArcMemory | null,
    longTermData: {
      worldSettings: WorldSettings,
      characterArchetypes: CharacterArchetype[],
      foreshadowing: Foreshadowing[]
    }
  ): MemoryHierarchy => {
    // Create short-term memory nodes
    const shortTermNodes: MemoryNode[] = [];
    
    // Group chapters
    const recentChaptersNode: MemoryNode = {
      id: 'recent-chapters',
      name: '最近のチャプター',
      expanded: false,
      children: shortTermMemories.map(memory => ({
        id: `ch-${memory.chapter}`,
        name: `チャプター${memory.chapter}`,
        description: memory.summary.substring(0, 30) + '...',
        chapter: memory.chapter
      }))
    };
    shortTermNodes.push(recentChaptersNode);
    
    // Extract recent events from chapters
    const allEvents: KeyEvent[] = [];
    shortTermMemories.forEach(memory => {
      if (memory.key_events) {
        allEvents.push(...memory.key_events);
      }
    });
    
    // Sort by significance and take top 5
    const topEvents = [...allEvents]
      .sort((a, b) => b.significance - a.significance)
      .slice(0, 5);
    
    const recentEventsNode: MemoryNode = {
      id: 'recent-events',
      name: '最近のイベント',
      expanded: false,
      children: topEvents.map((event, index) => ({
        id: `ev-${index}`,
        name: event.event.substring(0, 20) + '...',
        description: event.event,
        chapter: event.chapter
      }))
    };
    shortTermNodes.push(recentEventsNode);
    
    // Mid-term memory nodes
    const midTermNodes: MemoryNode[] = [];
    
    if (currentArc) {
      const arcNode: MemoryNode = {
        id: 'arc-current',
        name: '現在のアーク',
        description: currentArc.theme,
        expanded: false,
        children: [
          { id: 'arc-goal', name: '目標', description: currentArc.theme },
          { 
            id: 'arc-turning-points', 
            name: '転換点', 
            children: currentArc.turningPoints?.map((tp, i) => ({
              id: `tp-${i}`,
              name: tp.event.substring(0, 20) + '...',
              description: tp.event,
              chapter: tp.chapter
            })) || []
          }
        ]
      };
      midTermNodes.push(arcNode);
    }
    
    // Long-term memory nodes
    const longTermNodes: MemoryNode[] = [
      {
        id: 'world',
        name: '世界設定',
        description: longTermData.worldSettings.description,
      },
      {
        id: 'char-background',
        name: 'キャラクター背景',
        expanded: false,
        children: longTermData.characterArchetypes.map(archetype => ({
          id: `char-${archetype.name}`,
          name: archetype.name,
          description: archetype.traits.join(', ')
        }))
      },
      {
        id: 'foreshadowing',
        name: '伏線',
        expanded: false,
        children: longTermData.foreshadowing.map((f, i) => ({
          id: `fs-${i}`,
          name: f.description.substring(0, 20) + '...',
          description: `${f.description} (${f.resolved ? '解決済み' : '未解決'})`,
          chapter: f.chapter_introduced
        }))
      }
    ];
    
    // Construct the complete hierarchy
    return {
      root: {
        id: 'root',
        name: 'メモリー階層',
        expanded: true,
        children: [
          {
            id: 'short-term',
            name: '短期記憶',
            expanded: true,
            children: shortTermNodes
          },
          {
            id: 'mid-term',
            name: '中期記憶',
            expanded: false,
            children: midTermNodes
          },
          {
            id: 'long-term',
            name: '長期記憶',
            expanded: false,
            children: longTermNodes
          }
        ]
      }
    };
  };
  
  // Helper function to build timeline events
  const buildTimeline = (
    shortTermMemories: ChapterMemory[], 
    currentArc: ArcMemory | null
  ): TimelineEvent[] => {
    const timelineEvents: TimelineEvent[] = [];
    
    // Add chapter completions
    shortTermMemories.forEach(memory => {
      timelineEvents.push({
        id: `chapter-${memory.chapter}`,
        title: `チャプター${memory.chapter}完了`,
        description: memory.summary.substring(0, 50) + '...',
        type: 'CHAPTER',
        timestamp: memory.timestamp,
        chapter: memory.chapter
      });
    });
    
    // Add significant events
    shortTermMemories.forEach(memory => {
      if (memory.key_events) {
        memory.key_events
          .filter(event => event.significance >= 7) // Only high significance events
          .forEach((event, idx) => {
            timelineEvents.push({
              id: `event-${memory.chapter}-${idx}`,
              title: event.event.substring(0, 30) + '...',
              description: event.event,
              type: event.characters && event.characters.length > 0 ? 'CHARACTER' : 'PLOT',
              timestamp: memory.timestamp,
              chapter: memory.chapter
            });
          });
      }
    });
    
    // Add arc-level events if available
    if (currentArc && currentArc.turningPoints) {
      currentArc.turningPoints.forEach((tp, idx) => {
        timelineEvents.push({
          id: `arc-event-${idx}`,
          title: tp.event.substring(0, 30) + '...',
          description: tp.event,
          type: 'PLOT',
          timestamp: '', // No specific timestamp for arc events
          chapter: tp.chapter
        });
      });
    }
    
    // Sort by chapter number (descending) and then by significance
    return timelineEvents.sort((a, b) => {
      if (a.chapter && b.chapter) {
        return b.chapter - a.chapter;
      }
      return 0;
    });
  };
  
  // Node expansion handling
  const expandNode = useCallback((nodeId: string) => {
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
  }, []);
  
  // Node collapse handling
  const collapseNode = useCallback((nodeId: string) => {
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
  }, []);
  
  // Memory search function
  const searchMemory = useCallback(async (query: string, type: string = 'ALL') => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Build query parameters
      const params = new URLSearchParams({
        query: query
      });
      
      if (type !== 'ALL') {
        params.append('types', type);
      }
      
      // Call the memory search API
      const response = await fetch(`/api/memory/search?${params.toString()}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Search failed');
      }
      
      const searchResults = data.data.results as SearchResult[];
      
      // Transform search results to memory detail
      if (searchResults.length > 0) {
        const memoryDetail: MemoryDetail = {
          id: 'search-result',
          title: `「${query}」の検索結果`,
          type: 'SEARCH_RESULT',
          content: createSearchResultContent(searchResults),
          connections: extractConnections(searchResults),
          metadata: {
            resultCount: searchResults.length,
            averageRelevance: calculateAverageRelevance(searchResults)
          }
        };
        
        setSelectedMemory(memoryDetail);
      } else {
        setSelectedMemory({
          id: 'no-results',
          title: `「${query}」の検索結果`,
          type: 'SEARCH_RESULT',
          content: `「${query}」に関連する情報は見つかりませんでした。`,
          metadata: {
            resultCount: 0
          }
        });
      }
    } catch (error) {
      console.error('Memory search failed:', error);
      setSelectedMemory({
        id: 'error',
        title: 'エラー',
        type: 'ERROR',
        content: `検索中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  // Helper function to create search result content
  const createSearchResultContent = (results: SearchResult[]): string => {
    // Take top 5 results with highest relevance
    const topResults = [...results]
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);
    
    return topResults.map(result => {
      const content = result.memory.content;
      const matchesText = result.matches.length > 0 
        ? `\n\nマッチした箇所:\n${result.matches.join('\n')}`
        : '';
      
      return `【関連度: ${Math.round(result.relevance * 100)}%】\n${content}${matchesText}`;
    }).join('\n\n---\n\n');
  };
  
  // Helper function to extract connections from search results
  const extractConnections = (results: SearchResult[]): MemoryDetail['connections'] => {
    const connections: MemoryDetail['connections'] = [];
    
    results.forEach((result, index) => {
      // Extract chapter references
      const chapterMatch = result.memory.content.match(/チャプター(\d+)/);
      if (chapterMatch) {
        connections.push({
          id: `con-ch-${chapterMatch[1]}`,
          title: `チャプター${chapterMatch[1]}`,
          type: 'CHAPTER'
        });
      }
      
      // Extract character references (simple approach)
      const characterMatches = result.memory.content.match(/「([^」]+)」/g);
      if (characterMatches) {
        characterMatches.slice(0, 3).forEach((match, i) => {
          const character = match.replace(/「|」/g, '');
          connections.push({
            id: `con-char-${index}-${i}`,
            title: character,
            type: 'CHARACTER'
          });
        });
      }
    });
    
    // Remove duplicates
    const uniqueConnections = connections.filter((conn, index, self) => 
      index === self.findIndex(c => c.title === conn.title)
    );
    
    return uniqueConnections.slice(0, 10); // Limit to 10 connections
  };
  
  // Helper function to calculate average relevance
  const calculateAverageRelevance = (results: SearchResult[]): number => {
    if (results.length === 0) return 0;
    
    const sum = results.reduce((acc, result) => acc + result.relevance, 0);
    return parseFloat((sum / results.length).toFixed(2));
  };
  
  // Select a node from the hierarchy
  const selectNode = useCallback(async (nodeId: string) => {
    setIsLoading(true);
    
    try {
      // Extract the node type and ID
      let nodeType: string = 'unknown';
      let entityId: string | number = nodeId;
      
      if (nodeId.startsWith('ch-')) {
        nodeType = 'CHAPTER';
        entityId = parseInt(nodeId.substring(3), 10);
      } else if (nodeId.startsWith('ev-')) {
        nodeType = 'EVENT';
        entityId = nodeId.substring(3);
      } else if (nodeId.startsWith('char-')) {
        nodeType = 'CHARACTER';
        entityId = nodeId.substring(5);
      } else if (nodeId === 'world') {
        nodeType = 'WORLD_SETTINGS';
      } else if (nodeId.startsWith('fs-')) {
        nodeType = 'FORESHADOWING';
        entityId = parseInt(nodeId.substring(3), 10);
      }
      
      // Fetch detailed data based on node type
      let detailData: any = null;
      
      switch (nodeType) {
        case 'CHAPTER':
          const chapterResponse = await fetch(`/api/memory/chapter/${entityId}`);
          detailData = await chapterResponse.json();
          break;
        case 'CHARACTER':
          const characterResponse = await fetch(`/api/memory/character/${entityId}`);
          detailData = await characterResponse.json();
          break;
        case 'WORLD_SETTINGS':
          const worldResponse = await fetch(`/api/memory/world`);
          detailData = await worldResponse.json();
          break;
        default:
          // For other types, create a simple representation based on the hierarchy
          detailData = { success: true, data: findNodeInHierarchy(nodeId) };
      }
      
      if (!detailData.success) {
        throw new Error('Failed to load detail data');
      }
      
      // Convert detail data to MemoryDetail format
      const detail = convertToMemoryDetail(nodeType, detailData.data);
      setSelectedMemory(detail);
      
    } catch (error) {
      console.error('Failed to select node:', error);
      setSelectedMemory({
        id: 'error',
        title: 'エラー',
        type: 'ERROR',
        content: `データ取得中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsLoading(false);
    }
  }, [hierarchy]);
  
  // Helper function to find a node in the hierarchy
  const findNodeInHierarchy = (nodeId: string): MemoryNode | null => {
    const searchNode = (nodes: MemoryNode[] | undefined): MemoryNode | null => {
      if (!nodes) return null;
      
      for (const node of nodes) {
        if (node.id === nodeId) return node;
        
        const found = searchNode(node.children);
        if (found) return found;
      }
      
      return null;
    };
    
    return searchNode(hierarchy.root.children);
  };
  
  // Helper function to convert API data to MemoryDetail
  const convertToMemoryDetail = (type: string, data: any): MemoryDetail => {
    switch (type) {
      case 'CHAPTER':
        return {
          id: `ch-${data.chapter}`,
          title: `チャプター${data.chapter}`,
          type: 'CHAPTER',
          content: data.summary,
          chapter: data.chapter,
          timestamp: data.timestamp,
          connections: [
            ...(data.key_events?.map((event: KeyEvent, i: number) => ({
              id: `event-${i}`,
              title: event.event.substring(0, 20) + '...',
              type: 'EVENT'
            })) || []),
            ...(data.character_states?.map((char: CharacterState, i: number) => ({
              id: `char-${i}`,
              title: char.name,
              type: 'CHARACTER'
            })) || [])
          ],
          metadata: {
            emotional_impact: data.emotional_impact,
            plot_significance: data.plot_significance
          }
        };
        
      case 'CHARACTER':
        return {
          id: `char-${data.name}`,
          title: data.name,
          type: 'CHARACTER',
          content: data.development || `${data.name}の情報`,
          connections: data.relationships?.map((rel: Relationship, i: number) => ({
            id: `rel-${i}`,
            title: rel.character,
            type: 'CHARACTER'
          })) || [],
          metadata: {
            mood: data.mood || 'unknown'
          }
        };
        
      case 'WORLD_SETTINGS':
        return {
          id: 'world',
          title: '世界設定',
          type: 'WORLD_SETTINGS',
          content: data.description,
          connections: [
            ...(data.regions?.map((region: string, i: number) => ({
              id: `region-${i}`,
              title: region,
              type: 'REGION'
            })) || []),
            ...(data.history?.map((event: string, i: number) => ({
              id: `history-${i}`,
              title: event.substring(0, 20) + '...',
              type: 'HISTORY'
            })) || [])
          ]
        };
        
      default:
        // Handle other node types based on data available in the hierarchy
        if (data) {
          return {
            id: data.id,
            title: data.name,
            type: type,
            content: data.description || data.name,
            chapter: data.chapter,
            metadata: {}
          };
        }
        
        return {
          id: 'unknown',
          title: 'Unknown',
          type: 'UNKNOWN',
          content: 'No data available',
          metadata: {}
        };
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
    selectNode,
    isLoading,
    isSearching
  };
};